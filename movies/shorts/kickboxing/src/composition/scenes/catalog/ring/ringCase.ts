import { reportAutoMovieResourceRetirement } from "@automovie/render";
import * as THREE from "three";

import type { IFilmProduction } from "../../../../IFilmProduction";
import { RingsideCamera } from "../../../../entities/cameras/ringside/RingsideCamera";
import { ArenaLighting } from "../../../../entities/lights/arena/ArenaLighting";
import { Ring } from "../../../../entities/sets/ring/Ring";

/**
 * Inspect the whole ring alone before a fighter uses its canvas.
 * The case exhibits the set of docs/body/screenplay/kickboxing/010-the-round.md#p01;
 * it is not a scene of the delivered film. Specialized composition evidence
 * remains deferred to the short route's completed programmed draft.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Documents the standalone set case and its screenplay basis.
 * @evidence contracts/development/implementation.md#principled-implementation Combines the ring, fixed arena light and native camera; Three's actual mounted bounds supply the whole-set extent.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Mount modules, measure their displayed set, then return camera seek and complete disposal.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No alternate ring, model scaling, authored motion or hidden participant.
 * @evidence contracts/development/implementation.md#efficient-algorithms Bounds are measured once; each seek updates one camera and world matrices.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Each mounted module and the camera clip serve every frame.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Disposal attempts ring retirement, light detachment and scene clearing through the renderer's synchronous collector.
 * @evidenceExclude contracts/development/composition.md#screenplay-realization A standalone ring inspection has no screenplay progression.
 * @evidence contracts/development/composition.md#composition-only Mounts the installed ring, arena light and camera.
 * @evidenceExclude contracts/development/composition.md#living-scene This empty-set inspection intentionally contains no living performers.
 */
export function ringCase(seed: string): IFilmProduction {
  const ring: Ring = new Ring(seed);
  const drawing: ReturnType<Ring["drawing"]> = ring.drawing();
  const lights: ReturnType<ArenaLighting["drawing"]> = new ArenaLighting(ring.size).drawing();
  const scene: THREE.Scene = new THREE.Scene();
  scene.add(drawing.object, lights.object);
  scene.updateMatrixWorld(true);
  const bounds: THREE.Box3 = new THREE.Box3().setFromObject(drawing.object);
  const size: THREE.Vector3 = bounds.getSize(new THREE.Vector3());
  const centre: THREE.Vector3 = bounds.getCenter(new THREE.Vector3());
  const view: ReturnType<RingsideCamera["mount"]> = new RingsideCamera({
    x: 0, y: size.y, z: -ring.size,
  }).mount({
    base: { x: centre.x, y: bounds.min.y, z: centre.z },
    height: size.y,
    radius: Math.max(size.x, size.z) / 2,
    at: null,
  }, 2);
  return {
    scene,
    camera: view.camera,
    seek: (seconds: number): void => {
      view.seek(seconds);
      scene.updateMatrixWorld(true);
    },
    dispose: (): void => reportAutoMovieResourceRetirement([
      drawing.dispose,
      lights.dispose,
      (): void => { scene.clear(); },
    ]),
  };
}
