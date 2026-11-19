import { createBall } from "@automovie/archetypes";
import { buildModel } from "@automovie/render";
import * as THREE from "three";

/**
 * Mounts the single size-seven ball and its four dark panel channels.
 *
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/props/ball.md#ball defines the orange size-seven ball. Raised dark seams are authored against its archetype radius for the held position in docs/body/screenplay/two-hands/010-game.md#last-board.
 * @evidence contracts/development/entities.md#object-shape The installed basketball supplies its sphere and radius. The game supplies its center; the prop never decides a possession or a collision.
 * @evidence contracts/development/entities.md#controls-and-source One group exposes placement and spin for both cameras. The seam curves are generated from that same radius, with no borrowed images.
 * @evidence contracts/development/common.md#meaningful-documentation World positioning uses the ball center, while the installed prop starts with its base at zero.
 * @evidence contracts/development/implementation.md#principled-implementation Four closed panel channels are placed on the very sphere returned by the basketball archetype, after its ground origin is shifted to its center.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure One centered group owns the ball and its seams.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Playback and replay share this geometry; the closing seam never requires replacing the ball with a separate close-up model.
 * @evidence contracts/development/implementation.md#efficient-algorithms Four fixed curves are built once; each seek needs only a rigid transform.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work All channels share one ink material and half the installed basketball archetype's reported diameter.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The mount owns the meshes and releases the unique geometry and material sets when disposed.
 */
export function createBasketball(scene: THREE.Scene) {
  const ball = createBall({ kind: "basketball", id: "game-ball" });
  const radius = ball.dimensions.diameter! / 2;
  const model = buildModel(ball);
  const group = new THREE.Group();
  group.name = "Game ball";
  group.add(model.object);
  model.object.position.y = -radius;
  const ink = new THREE.MeshStandardMaterial({color: 0x251910, roughness: 0.93});
  const curves = [
    (a: number) => new THREE.Vector3(Math.cos(a), Math.sin(a), 0),
    (a: number) => new THREE.Vector3(Math.cos(a), 0, Math.sin(a)),
    ...[-1, 1].map((side) => (a: number) => {
      const latitude = side * (0.48 + 0.22 * Math.cos(2 * a));
      return new THREE.Vector3(Math.cos(latitude) * Math.cos(a), Math.sin(latitude), Math.cos(latitude) * Math.sin(a));
    }),
  ];
  for (const project of curves) {
    const points = Array.from({length: 64}, (_, i) => project(2 * Math.PI * i / 64).multiplyScalar(radius));
    const curve = new THREE.CatmullRomCurve3(points, true);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, radius * 0.017, 5, true), ink));
  }
  const shade = new THREE.MeshBasicMaterial({color: 0x34251a, transparent: true, opacity: 0.19, depthWrite: false});
  const patch = new THREE.CircleGeometry(radius, 24);
  const shadow = new THREE.Mesh(patch, shade);
  shadow.rotation.x = -Math.PI / 2;
  scene.add(group, shadow);
  return {
    seek(center: readonly [number, number, number], angle: number): void {
      group.position.set(...center);
      const clearance = Math.max(0, center[1] - radius);
      shadow.position.set(center[0] + clearance * 0.05, 0.013, center[2] - clearance * 0.03);
      shadow.scale.setScalar(1.04 + clearance * 0.14);
      shade.opacity = 0.24 / (1 + clearance * 0.9);
      group.rotation.set(0.18, 0.24, angle);
    },
    dispose(): void {
      const geometry = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometry.add(object.geometry);
          for (const material of [object.material].flat()) materials.add(material);
        }
      });
      geometry.forEach((item) => item.dispose());
      materials.forEach((item) => item.dispose());
      group.removeFromParent();
      shadow.removeFromParent(); patch.dispose(); shade.dispose();
    },
  };
}
