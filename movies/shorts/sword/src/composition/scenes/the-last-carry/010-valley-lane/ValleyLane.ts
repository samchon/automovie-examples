import * as THREE from "three";

import type { IFilmProduction } from "../../../../IFilmProduction";
import { createCarryBier } from "../../../../entities/the-last-carry/Bier";
import { createCarryActor } from "../../../../entities/the-last-carry/Cast";
import { createCarryValley } from "../../../../entities/the-last-carry/Valley";

type Actor = ReturnType<typeof createCarryActor>;
type Role = Parameters<typeof createCarryActor>[0];

/** One cycle is two travelling steps. The clock for the sound effects is in the ensemble cue receipt. */
const radiansPerMetre = 8.8;
const firstChimes = [32.10, 32.72, 33.42];
const lastChimes = [42.92, 43.71, 44.43];
const splinterLength = 0.052;

/** Make a position or direction in the lane's metre coordinates. */
const point = (x: number, y: number, z: number): THREE.Vector3 =>
  new THREE.Vector3(x, y, z);

/** A cubic ramp starts and ends a performed transition with a settled pose. */
function ease(start: number, end: number, at: number): number {
  return THREE.MathUtils.smoothstep(at, start, end);
}

/** Let a performed gesture arrive, hold for an audience to see it, and resolve. */
function pulse(a: number, b: number, c: number, d: number, at: number): number {
  return ease(a, b, at) - ease(c, d, at);
}

/** Open the mouth between accepted cue boundaries with an amplitude-style performance envelope. */
function voice(start: number, end: number, at: number): number {
  const envelope = pulse(start, start + 0.07, end - 0.08, end, at);
  return envelope * (0.34 + 0.59 * Math.abs(Math.sin(at * 17.8) * Math.cos(at * 4.4)));
}

/**
 * Computes longitudinal travel in metres from authored film seconds. The rear
 * corner dips during a halt before the resumed procession reaches the gate.
 *
 * @evidence docs/body/screenplay/the-last-carry/010-valley-lane.md#pay The front bearers stop when the corner dips.
 * @evidence docs/body/screenplay/the-last-carry/010-valley-lane.md#go The widow's assumed corner travels into the burial ground.
 * @evidence contracts/development/common.md#meaningful-documentation Defines metres on the lane's +Z axis and continuous authored seconds, before, during and after the halt.
 * @evidence contracts/development/implementation.md#principled-implementation Two clamped linear terms make a continuous distance with zero travel before time zero, a rest from 24 through 32 s, and a clamped departure.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The bier, continuing bearers and following shots share the procession distance. Each actor's pose and grip are set separately.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The staging chooses 0.22 and 0.42 m/s for the two segments and a 10.8 m departure limit to clear the gate and keep the frame legible. These are production coordinates rather than measured body travel.
 * @evidence contracts/development/implementation.md#efficient-algorithms Evaluates a fixed number of clamps, products and additions per call with constant storage.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The scene evaluates one shared distance per seek. The pure function does not cache individual seconds.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Returns a number with no retained state, resources or tasks.
 * @evidence contracts/development/composition.md#screenplay-realization The dip arrests the group and the widow's lift allows it to resume. Exact path rates and stop interval are shaped for the staging in this lane.
 * @evidence contracts/development/composition.md#composition-only This exported helper holds a distance calculation inside the scene folder, and provides that direct-3D placement to the lane rather than composing actors itself.
 * @evidence contracts/development/composition.md#living-scene The bier and continuing bearers pause and resume together. The cousins, gate and fixed wide shot keep their own marks as the procession moves away.
 */
export function processionDistance(t: number): number {
  const approaching = 0.22 * Math.min(24, Math.max(0, t));
  const departing = Math.min(10.8, Math.max(0, t - 32) * 0.42);
  return approaching + departing;
}

/** Small props take the same scene light as the costume. */
function propMesh(geometry: THREE.BufferGeometry, color: number, metalness = 0): THREE.Mesh {
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color,
    roughness: metalness ? 0.28 : 0.83,
    metalness,
  }));
}

/** A reflective stage silhouette gives the two bursts visible punctuation in the fixed wide. */
function stageSteel(): THREE.Group {
  const prop = new THREE.Group();
  const blade = propMesh(new THREE.OctahedronGeometry(1), 0xc8d1ca, 0.34);
  blade.scale.set(0.028, 0.50, 0.009);
  blade.position.y = 0.51;
  const guard = propMesh(new THREE.BoxGeometry(0.17, 0.025, 0.035), 0x50483e, 0.30);
  guard.position.y = 0.075;
  const grip = propMesh(new THREE.CylinderGeometry(0.018, 0.019, 0.13, 8), 0x514036);
  prop.add(blade, guard, grip);
  return prop;
}

/** The near linen corner hangs off the frame until Denis frees it from his belt. */
function hangingLinen(): { mesh: THREE.Mesh; draw: (anchor: THREE.Vector3, end: THREE.Vector3, open: number) => void } {
  const positions = new THREE.BufferAttribute(new Float32Array(17 * 6), 3);
  const indices: number[] = [];
  for (let i = 0; i < 16; ++i) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", positions.setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(indices);
  const mesh = propMesh(geometry, 0xe8dbc0);
  mesh.name = "Linen corner at Denis's belt";
  (mesh.material as THREE.Material).side = THREE.DoubleSide;
  mesh.frustumCulled = false;
  return {
    mesh,
    draw(anchor, end, open): void {
      mesh.visible = open < 1;
      if (!mesh.visible) return;
      for (let i = 0; i <= 16; ++i) {
        const f = i / 16;
        const centre = anchor.clone().lerp(end, f);
        const slack = Math.sin(f * Math.PI);
        const width = (0.071 - f * 0.046) * (1 - 0.60 * open);
        const curve = 0.065 * slack;
        positions.setXYZ(i * 2, centre.x - width / 2, centre.y - curve, centre.z - 0.02 * slack);
        positions.setXYZ(i * 2 + 1, centre.x + width / 2, centre.y - 0.85 * curve, centre.z + 0.025 * slack);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    },
  };
}

/** A separate glint envelope for each sound cue leaves a visible preparation and a visible break. */
function exchangeAt(t: number, cues: readonly number[]): number {
  return cues.reduce((weight, cue) => Math.max(
    weight, pulse(cue - 0.26, cue - 0.02, cue + 0.04, cue + 0.29, t),
  ), 0);
}

/** Release scene-owned GPU resources when the composition is unmounted. */
function disposeLane(scene: THREE.Scene): void {
  const materials = new Set<THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();
  scene.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      geometries.add(node.geometry);
      for (const material of Array.isArray(node.material) ? node.material : [node.material])
        materials.add(material);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) {
    if (material instanceof THREE.MeshBasicMaterial && material.alphaMap) material.alphaMap.dispose();
    material.dispose();
  }
  scene.clear();
}

/**
 * Mounts the scene from docs/body/screenplay/the-last-carry/010-valley-lane.md.
 * The funeral stops at the dip, continues with the widow under the pole, and
 * leaves Denis and Colin outside the gate. The caller owns the production.
 *
 * Concretization. The staging selects crossing and hold intervals, lens and
 * cut points, and local targets for the rails, coat, shoe and sliver. The shot
 * grid and physical limitations are recorded in docs/acceptance/the-last-carry.md.
 *
 * @evidence docs/body/screenplay/the-last-carry/010-valley-lane.md#lane Mounts the valley lane, includes the gate woman, and sets all four initial shoulder contacts.
 * @evidence docs/body/screenplay/the-last-carry/010-valley-lane.md#hem The opening camera follows the changing hem and widow's reach before showing each cousin.
 * @evidence docs/body/screenplay/the-last-carry/010-valley-lane.md#pay Brings the linen and hare purse close, then reassigns the rear rail contacts from Colin to the russet mourner and from Denis to the widow.
 * @evidence docs/body/screenplay/the-last-carry/010-valley-lane.md#go Holds one lane-wide as the funeral recedes and the cousins' exchanges appear in the foreground.
 * @evidence docs/body/screenplay/the-last-carry/010-valley-lane.md#mark Shows the gate, passes the returning shoe through its bars, and reattaches the sliver from coat to fingers.
 * @evidence contracts/development/common.md#meaningful-documentation States the scene source, the caller's ownership and the frame, time and camera work performed on each seek.
 * @evidence contracts/development/implementation.md#principled-implementation Each seek reconstructs the blocking in world metres and projects contact targets into local actor frames. The camera and all visible state use the same absolute seconds rather than accumulated steps.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Valley supplies the hinge and handle, Bier the shroud and hem, and Cast the actor and pose controls. Seek owns their simultaneous placement and selection of the image. Audio is a separate cue mix.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The contact envelopes, camera values and screen-prop changes are authored for this film. The SDK supplies Human poses, without simulating the four-body load or driving lip sync from a recording.
 * @evidence contracts/development/implementation.md#efficient-algorithms Build creates the fixed set, meshes and actors once. Seek updates the bounded cast and scene state, while disposing traverses the scene once and deduplicates encountered mesh resources.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The same scene and camera serve all seeks of a mount. Fixed role actions are shared through CarryNativeMotion; individual actor transforms and the rotated camera remain mount-owned.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The scene retains a fixed cast and set. Dispose clears the scene and releases distinct reachable geometries and materials and boot alpha maps. Shared source caches remain module-owned.
 * @evidence contracts/development/composition.md#screenplay-realization Runs the promise by the returning shoe, the purse, dip and two substitutions, the processional departure and final gate and sliver. Scene-camera and grip decisions are recorded in docs/acceptance/the-last-carry.md; exact handoffs remain partly legible in the reviewed picture.
 * @evidence contracts/development/composition.md#composition-only Combines Valley, Bier and actor controls on the screenplay clock. This direct-3D lane also supplies its own absolute camera locations, hand contact timing and placement curves.
 * @evidence contracts/development/composition.md#living-scene Gives both cousins, all four carriers, the nearby mourners and the gate woman continuous placement. The bier goes from open lane through gate while the men stay outside; the fixed wide follows the screenplay's camera choice.
 */
export async function createValleyLane(): Promise<IFilmProduction> {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.025, 190);
  const valley = createCarryValley(scene);
  const bier = createCarryBier();
  let second = 0;
  scene.add(bier.root);

  /** Register one clothed member and retain its pose and scene handle. */
  function make(role: Role): Actor {
    const actor = createCarryActor(role, () => second);
    scene.add(actor.root);
    return actor;
  }

  const denis = make("denis");
  const colin = make("colin");
  const widow = make("widow");
  const russet = make("relief-bearer");
  const ochre = make("front-bearer-left");
  const slate = make("front-bearer-right");
  const gate = make("gate-woman");
  const follower = make("relief-bearer");
  follower.root.scale.setScalar(0.91);
  const mourners: [Actor, number, number, number][] = [
    [make("front-bearer-left"), 0.28, 3.0, 0.95],
    [make("relief-bearer"), -0.45, 3.6, 0.91],
    [make("gate-woman"), 0.34, 4.55, 0.95],
    [make("front-bearer-right"), -0.13, 5.5, 0.93],
  ];
  const denisSteel = stageSteel();
  const colinSteel = stageSteel();
  const sliver = propMesh(new THREE.ConeGeometry(0.0031, splinterLength, 6), 0xf3d2a4);
  sliver.name = "Sliver from the carrying pole";
  const looseLinen = hangingLinen();
  scene.add(denisSteel, colinSteel, sliver, looseLinen.mesh);

  /** Set a resolved lens and camera aimed at a stage position. */
  function frame(eye: THREE.Vector3, target: THREE.Vector3, fov: number): void {
    camera.position.copy(eye);
    camera.fov = fov;
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }

  /** Update the root before any world-space contact is projected into the actor's rig. */
  function place(actor: Actor, x: number, z: number, yaw: number): void {
    actor.root.position.set(x, 0, z);
    actor.root.rotation.y = yaw;
    actor.root.updateMatrixWorld(true);
  }

  /** Express a shared world contact in one actor's root coordinates. */
  function local(actor: Actor, target: THREE.Vector3): THREE.Vector3 {
    return actor.root.worldToLocal(target.clone());
  }

  /** Resolve a prop directly from its actor's rig point. */
  function world(actor: Actor, name: string): THREE.Vector3 {
    return actor.root.getObjectByName(name)!.getWorldPosition(new THREE.Vector3());
  }

  /** Staging is fully reconstructible out of sequence, including the two supported transfers. */
  function seek(t: number): void {
    second = t;
    const z = processionDistance(t);
    const phase = z * radiansPerMetre;
    const walk = t < 24
      ? 1 - ease(23.42, 24, t)
      : ease(32, 32.77, t) * (1 - ease(57.25, 57.75, t));
    const glance = ease(48.8, 50.27, t);
    const join = ease(54.55, 56.28, t);
    const leavingC = ease(22.07, 24.1, t);
    const leavingD = ease(29.98, 31.78, t);
    const takeC = ease(20.41, 22.03, t);
    const takeD = ease(27.27, 29.74, t);
    const getHands = ease(24.9, 25.68, t);
    const dip = pulse(24.81, 25.67, 27.73, 29.98, t);
    const roll = pulse(34, 34.40, 34.57, 35.08, t);
    const loseHem = pulse(33.71, 34.22, 34.44, 34.92, t);
    const trip = pulse(36.32, 37.42, 38.12, 40.08, t);
    const catchCoat = pulse(36.97, 37.62, 38.0, 39.23, t);
    const exchange = exchangeAt(t, firstChimes) + exchangeAt(t, lastChimes);
    const lowSteel = ease(47.85, 49.42, t);
    const drawIn = pulse(13.6, 14.65, 16.37, 17.77, t);
    const tangle = pulse(12.95, 13.36, 13.60, 14.07, t);
    const follow = pulse(31.67, 32.87, 34.6, 36.61, t);
    const linger = pulse(6.23, 6.88, 7.11, 8.33, t);
    const promiseLook = pulse(4.14, 5.31, 7.01, 8.13, t);
    const actorZ = Math.min(z, processionDistance(30));

    const dX = 0.65 + 0.53 * leavingD - 0.32 * trip - 0.41 * join - 0.12 * exchange;
    const dZ = actorZ - 0.96 - 0.67 * ease(30.83, 33.44, t) - 0.37 * trip - 0.22 * join;
    const cX = -0.64 + 0.55 * drawIn - 0.49 * leavingC + 0.58 * catchCoat + 1.39 * join + 0.13 * exchange;
    const cZ = actorZ - 1.02 - 0.79 * leavingC + 0.36 * catchCoat - 0.58 * join;

    // Each successor is a half-step behind the adjacent carrier. The departing cousin clears sideways first.
    place(denis, dX, dZ, 0.23 * promiseLook - 1.22 * leavingD + 0.92 * glance - 0.44 * join);
    place(colin, cX, cZ, 1.36 * leavingC + 0.66 * drawIn - 1.03 * glance + 1.35 * join);
    place(widow, 0.75 - 0.095 * takeD + 0.16 * promiseLook, z - 1.53 + 0.12 * takeD - 0.11 * linger, -0.21 + 0.17 * takeD);
    place(russet, -1.16 + 0.522 * takeC, z - 1.48, 0.03);
    place(ochre, 0.65, z + 1.13, 0);
    place(slate, -0.64, z + 1.14, 0);

    const shutting = ease(51.58, 53.32, t);
    valley.setGate(shutting);
    const handle = valley.gateHandle();
    place(gate, handle.x + 0.36, handle.z + 0.25, -2.34 + 0.43 * shutting);
    place(follower, -1.80 + 1.32 * ease(34.85, 38.5, t), z - 3.00 + 3.59 * ease(31.7, 38.4, t), 0.23 * follow);
    follower.pose({ stride: phase + 22 * ease(31.7, 38.4, t), walk: Math.max(walk, follow), lean: 0.065, turn: 0.39 * follow });
    for (const [actor, x, offset, scale] of mourners) {
      actor.root.scale.setScalar(scale);
      place(actor, x, z + offset, 0);
      actor.pose({
        stride: phase + offset,
        walk,
        lean: 0.025,
        turn: 0.12 * dip * Math.sin(offset),
        speech: voice(2.20 + 0.05 * offset, 3.64 + 0.035 * offset, t)
          + voice(40.80 + 0.052 * offset, 42.18 + 0.04 * offset, t),
      });
    }
    const gateWalk = pulse(51.55, 51.77, 53.24, 53.46, t);
    const gateReach = pulse(50.98, 51.51, 53.40, 54.1, t);
    gate.pose({
      stride: shutting * 12,
      walk: gateWalk,
      lean: -0.02 + 0.15 * gateReach,
      turn: -0.13 - 0.30 * shutting,
      speech: voice(0.7, 2.2, t) + voice(38.90, 40.44, t),
      rightHand: point(-0.24, 0.85, 0.03).lerp(local(gate, handle), gateReach),
    });

    // Rotate around the height of the wood. That keeps it over both carriers as the near corner drops.
    const bob = 0.009 * Math.sin(phase * 2) * walk;
    bier.root.rotation.set(-0.026 * dip + 0.004 * Math.sin(phase) * walk, 0, -0.069 - 0.106 * dip + 0.10 * roll);
    const pivot = point(0, 1.37, 0);
    bier.root.position.copy(point(0, 0.042 + bob, z).add(pivot).sub(pivot.clone().applyQuaternion(bier.root.quaternion)));
    const firstReveal = 0.80 * ease(0.25, 3.40, t) * (1 - ease(4.06, 5.93, t));
    const finalReveal = 0.98 * ease(32.36, 36.10, t);
    bier.setHem(firstReveal + finalReveal, phase);
    bier.root.updateMatrixWorld(true);

    /** Map the timber's near underside and each hand into their current contact pose. */
    const rail = (x: number, y: number, at: number): THREE.Vector3 =>
      bier.root.localToWorld(point(x, y, at));
    const hem = bier.hemPoint();
    const toe = bier.root.localToWorld(point(0.16, 1.586, -0.925));
    const leftPole = rail(0.467, 1.302, -1.12);
    const rightPole = rail(-0.468, 1.301, -1.15);
    const frontL = rail(0.43, 1.324, 1.18);
    const frontR = rail(-0.43, 1.324, 1.18);

    const dLoad = { side: -1 as const, underside: rail(0.43, 1.324, -0.90).y, share: 1 - ease(29.21, 30.30, t) };
    const cLoad = { side: 1 as const, underside: rail(-0.43, 1.324, -0.95).y, share: 1 - leavingC };
    const widowLoad = { side: -1 as const, underside: rail(0.43, 1.324, -1.37).y, share: takeD };
    const russetLoad = { side: 1 as const, underside: rail(-0.43, 1.324, -1.45).y, share: takeC };

    const turnToShoe = pulse(19.79, 20.5, 21.10, 22.04, t);
    const notice = pulse(28.84, 29.82, 30.25, 31.21, t);
    const breathe = pulse(47.7, 48.13, 49.12, 51, t) * Math.sin(t * 6.5);
    const dPose = {
      stride: phase + 10 * leavingD + 6 * trip + 4 * join,
      walk: Math.max(walk * (1 - leavingD), pulse(29.96, 30.7, 32.88, 33.66, t), 0.7 * trip, 0.5 * join * (1 - ease(56.0, 56.5, t))),
      lean: 0.062 + 0.28 * dip + 0.46 * trip + 0.13 * exchange + 0.023 * breathe,
      turn: 1.36 * promiseLook - 0.60 * turnToShoe + 1.34 * notice - 0.22 * join,
      lookDown: 0.28 * turnToShoe + 0.12 * trip + 0.26 * join,
      speech: voice(5.2, 7.26, t) + voice(17.65, 20.53, t),
      load: dLoad,
    };
    denis.pose(dPose);
    const purseNode = denis.root.getObjectByName("hare-purse")!;
    purseNode.rotation.x = 0.33 * catchCoat * Math.sin((t - 37.04) * 10.6);
    purseNode.rotation.z = 0.31 * catchCoat * Math.sin((t - 36.98) * 8.7);
    const purse = purseNode.getWorldPosition(new THREE.Vector3());
    const ear = purseNode.localToWorld(point(0.023, 0.049, 0.041));
    const tuck = purse.clone().add(point(-0.047, 0.079, 0.018));
    const looseAnchor = rail(0.34, 1.547, -0.83);
    const free = ease(13.29, 13.89, t);
    looseLinen.draw(looseAnchor, tuck.clone().lerp(rail(0.47, 1.40, -0.75), free), free);
    const shoulder = denis.root.getObjectByName("right-coat-shoulder")!.getWorldPosition(new THREE.Vector3());
    const lodgedAxis = point(-0.46, 0.37, -0.81).normalize();
    const lodgedTip = shoulder.clone().addScaledVector(lodgedAxis, splinterLength);
    const liftSliver = ease(56.69, 57.56, t);
    const sliverTo = lodgedTip.clone().lerp(point((dX + cX) * 0.50, 1.27, (dZ + cZ) * 0.50 - 0.29), liftSliver);
    const middle = point((dX + cX) * 0.5, 1.38 + 0.30 * exchange, (dZ + cZ) * 0.5 + 0.07);
    const dWaitHand = point(-0.27, 0.98, 0.24).lerp(point(-0.24, 1.34, 0.44), 0.91 * exchange);
    dWaitHand.lerp(point(-0.23, 0.91, 0.116), lowSteel);
    const feel = pulse(54.98, 55.55, 55.80, 56.33, t);
    denis.pose({
      ...dPose,
      rightHand: local(denis, leftPole).lerp(local(denis, tuck.clone().add(point(0.020, 0.043, 0.030))), tangle).lerp(dWaitHand, leavingD),
      leftHand: point(0.26, 0.86, 0.06).lerp(point(0.23, 0.98, 0.38), trip)
        .lerp(local(denis, shoulder.clone().add(point(0.07, -0.08, -0.026))), feel),
    });

    const touch = pulse(14.12, 14.8, 15.46, 16.12, t);
    const showHand = ease(55.91, 56.55, t);
    const collar = purseNode.localToWorld(point(-0.013, 0.268, 0.036));
    const cHand = local(colin, rightPole).lerp(point(0.26, 0.99 + 0.35 * exchange, 0.20 + 0.23 * exchange), leavingC)
      .lerp(point(0.22, 0.89, 0.12), lowSteel);
    colin.pose({
      stride: phase + 9 * leavingC + 5 * catchCoat + 8.0 * join,
      walk: Math.max(walk * (1 - leavingC), pulse(22.08, 22.74, 23.59, 24.1, t), 0.62 * catchCoat, pulse(54.55, 55.1, 56.02, 56.28, t)),
      lean: 0.049 + 0.18 * catchCoat + 0.12 * exchange + 0.042 * breathe,
      turn: 1.52 * pulse(8.05, 8.89, 10.18, 11.78, t) + 0.40 * drawIn - 0.42 * glance + 0.19 * join,
      lookDown: 0.14 * drawIn + 0.24 * catchCoat + 0.29 * join,
      speech: voice(9.05, 10.10, t) + voice(13.55, 17.12, t),
      pinchLeft: touch,
      pinchRight: Math.max(0.73 * catchCoat, showHand),
      leftHand: cHand,
      rightHand: point(-0.24, 0.86, 0.09).lerp(local(colin, collar), catchCoat)
        .lerp(local(colin, sliverTo.clone().add(point(-0.10, -0.025, -0.025))), showHand),
      ...(touch > 0 ? { leftPinchPoint: cHand.clone().lerp(local(colin, ear), touch) } : {}),
      ...(showHand > 0 ? {
        rightPinchPoint: point(-0.23, 0.90, 0.10).lerp(local(colin, sliverTo), showHand),
      } : {}),
      load: cLoad,
    });

    const tendHem = pulse(1.46, 2.22, 11.55, 12.62, t);
    const widowHands = point(-0.28, 0.86, 0.09).lerp(local(widow, rail(0.467, 1.290, -1.24)), getHands);
    const widowBackHand = point(0.23, 0.85, 0.06).lerp(local(widow, rail(0.466, 1.283, -1.53)), getHands);
    const cuffAtHem = local(widow, hem.clone().add(point(0.05, -0.035, -0.074)));
    widow.pose({
      stride: phase + 2.4 * takeD,
      walk: Math.max(walk, 0.44 * pulse(27.4, 28.24, 29.37, 29.88, t)),
      lean: 0.055 + 0.09 * takeD + 0.12 * roll,
      turn: 0.26 * getHands - 0.32 * takeD,
      lookDown: 0.25 * tendHem + 0.11 * roll,
      speech: voice(27.05, 28.18, t),
      rightHand: widowHands.clone().lerp(cuffAtHem, tendHem),
      leftHand: widowBackHand.lerp(cuffAtHem, loseHem * 0.96),
      pinchRight: 0.8 * pulse(2.3, 3.25, 5.6, 6.3, t),
      ...(tendHem > 0 ? { rightPinchPoint: widowHands.clone().lerp(local(widow, hem), tendHem) } : {}),
      load: widowLoad,
    });
    russet.pose({
      stride: phase + 3.5 * takeC,
      walk,
      lean: 0.05 + 0.14 * takeC,
      turn: 0.42 * pulse(20.35, 21.47, 22.32, 23.38, t),
      leftHand: point(0.25, 0.85, 0.13).lerp(local(russet, rail(-0.468, 1.299, -1.25)), takeC),
      rightHand: point(-0.25, 0.85, 0.11).lerp(local(russet, rail(-0.464, 1.288, -1.54)), takeC),
      load: russetLoad,
    });
    ochre.pose({
      stride: phase + 0.19, walk, lean: 0.055, turn: -1.24 * dip,
      rightHand: local(ochre, rail(0.466, 1.30, 1.39)),
      load: { side: -1, underside: frontL.y, share: 1 },
    });
    slate.pose({
      stride: phase + 0.22, walk, lean: 0.077, turn: 0.19 * dip,
      leftHand: local(slate, rail(-0.466, 1.30, 1.41)),
      load: { side: 1, underside: frontR.y, share: 1 },
    });

    // The close grips and the sounds cue stage props. The exchanged gesture remains on the fixed wide.
    for (const [actor, prop, name, side, start] of [
      [denis, denisSteel, "right-hand", -1, 31.3],
      [colin, colinSteel, "left-hand", 1, 24.96],
    ] as const) {
      prop.visible = t >= start && t < 55;
      const grip = world(actor, name);
      prop.position.copy(grip);
      const axis = point(side * (0.59 - 0.33 * trip), 0.75 - 1.36 * lowSteel, 0.07 + side * 0.34 * trip);
      axis.lerp(middle.clone().sub(grip), exchange * 0.96);
      prop.quaternion.setFromUnitVectors(point(0, 1, 0), axis.normalize());
    }
    sliver.visible = t >= 54.99;
    const sliverAxis = lodgedAxis.clone().lerp(point(-0.68, 0.73, 0), liftSliver).normalize();
    const sliverTip = t < 56.69 ? lodgedTip : world(colin, "right-pinch");
    sliver.position.copy(sliverTip).addScaledVector(sliverAxis, -0.5 * splinterLength);
    sliver.quaternion.setFromUnitVectors(point(0, 1, 0), sliverAxis);

    // The two transfers get opposite side views. The wide holds through the last spoken response.
    if (t < 4.9) {
      const revealFaces = ease(3.7, 4.9, t);
      frame(point(1.30, 1.76, z - 2.08).lerp(point(1.41, 1.80, z - 2.16), revealFaces),
        hem.clone().add(point(0.03, 0.02, 0)).lerp(point(0.25, 1.51, z - 1.01), revealFaces), 29 + 5 * revealFaces);
    } else if (t < 8.1) {
      frame(point(2.02, 1.77, z - 0.13), point(0.49, 1.44, z - 1.14), 37);
    } else if (t < 13) {
      frame(point(0.65, 1.90, z - 2.69), point(0.03, 1.50, z - 0.99), 45);
    } else if (t < 16.3) {
      frame(purse.clone().add(point(-0.20, 0.14, 0.70)), purse.clone().add(point(0, 0.022, 0)), 29.5);
    } else if (t < 21.22) {
      frame(point(1.94, 1.79, z + 0.07), point(0.39, 1.52, z - 0.98), 35);
    } else if (t < 24.83) {
      frame(point(-2.66, 1.32, z - 0.45), point(-0.57, 1.28, z - 1.22), 39);
    } else if (t < 32) {
      const reveal = ease(26.08, 29.22, t);
      frame(point(3.12, 1.70, z - 0.42).lerp(point(2.62, 1.68, z - 0.83), reveal),
        point(0.45, 1.37, z - 0.35).lerp(point(0.54, 1.34, z - 1.02), reveal), 45 - 4 * reveal);
    } else if (t < 51) {
      frame(point(1.90, 1.70, 0.19), point(-0.27, 1.42, 6.14), 43);
    } else if (t < 55) {
      const passing = ease(51, 55, t);
      const behindBar = ease(53.45, 54.86, t);
      frame(point(-0.13 + 0.56 * behindBar, 1.37, 11.14),
        toe.clone().lerp(point(0.12, 1.62, 14.14), passing * 0.61), 23.2);
    } else {
      const widen = ease(57.84, 59.30, t);
      const focus = shoulder.clone().lerp(sliverTo, 0.65 * liftSliver);
      frame(shoulder.clone().add(point(0.16 + 0.06 * widen, 0.13 + 0.10 * widen, -0.74 - 0.40 * widen)),
        focus.lerp(point((dX + cX) * 0.5, 1.37, (dZ + cZ) * 0.5), widen * 0.88), 27 + 7 * widen);
    }

    scene.updateMatrixWorld(true);
  }

  seek(0);
  return { scene, camera, seek, dispose: () => disposeLane(scene) };
}
