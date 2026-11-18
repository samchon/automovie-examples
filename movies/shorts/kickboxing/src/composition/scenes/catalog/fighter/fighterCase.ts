import { HumanPerformance } from "@automovie/motions";
import { reportAutoMovieResourceRetirement } from "@automovie/render";
import * as THREE from "three";

import type { IFilmProduction } from "../../../../IFilmProduction";
import { RingsideCamera } from "../../../../entities/cameras/ringside/RingsideCamera";
import { Fighter } from "../../../../entities/cast/fighter/Fighter";
import { ArenaLighting } from "../../../../entities/lights/arena/ArenaLighting";
import { Ring } from "../../../../entities/sets/ring/Ring";

/**
 * One fighter's canonical body taking and holding an orthodox guard.
 * It exhibits the cast body and installed stance of the opening standing
 * state, not an invented exchange. Both cast variants call this same case.
 * The unit check audits this same performance separately from mounting or
 * drawing it; opening the catalog never runs a whole-case physical report.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the body/guard case, shared variants, separately audited native motion and the lack of delivery acceptance.
 * @evidence contracts/development/implementation.md#principled-implementation Composes the actual Fighter, ring, lighting, native HumanPerformance guard and camera grammar; seeks feed canonical poses to the same body's drawing.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Prepare modules, resolve one guard and camera, then expose the native motion, deterministic seek and cleanup.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No keyed joints, offset repair, alternate body, hidden physical failure or contact claim.
 * @evidence contracts/development/implementation.md#efficient-algorithms Resolve the performance and camera once, then evaluate their poses and world matrices per requested second.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work One case function serves both cast identities with their parameters and one prepared body per mount.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Disposal attempts the body, ring, lighting and scene cleanup independently through the native collector.
 * @evidenceExclude contracts/development/composition.md#screenplay-realization This native guard inspection case is not a delivered screenplay scene.
 * @evidence contracts/development/composition.md#composition-only Combines the cast entity and its installed guard/breath performance.
 * @evidence contracts/development/composition.md#living-scene The displayed fighter holds a breathing native guard for the whole case.
 */
export function fighterCase(
  fighter: Fighter,
  seed: string,
): IFilmProduction & { motion: HumanPerformance } {
  const subject: "owen" | "marek" = fighter.subject;
  const figure: ReturnType<Fighter["drawing"]> = fighter.drawing();
  const ring: Ring = new Ring(seed);
  const set: ReturnType<Ring["drawing"]> = ring.drawing();
  const lights: ReturnType<ArenaLighting["drawing"]> = new ArenaLighting(ring.size).drawing();
  const human: HumanPerformance = new HumanPerformance({
    seed,
    performers: [fighter.performer({ x: 0, y: 0, z: 0 }, 90)],
    composition: fighter.chain().guard({ seconds: 2, stance: "orthodox" }).node,
  });
  const scene: THREE.Scene = new THREE.Scene();
  scene.add(set.object, figure.object, lights.object);
  const view: ReturnType<RingsideCamera["mount"]> = new RingsideCamera({
    x: 0, y: fighter.body.measure.stature, z: -ring.size / 2 - fighter.body.measure.stature / 2,
  }).mount({
    base: { x: 0, y: 0, z: 0 },
    height: fighter.body.measure.stature,
    radius: fighter.body.measure.shoulderHalfWidth + fighter.body.measure.upperArm + fighter.body.measure.forearm + fighter.body.measure.hand,
    at: (seconds: number): { x: number; y: number; z: number } => {
      const root: ReturnType<HumanPerformance["posture"]>["root"] = human.posture(subject, seconds).root;
      return { x: root.x, y: 0, z: root.z };
    },
  }, 2);
  return {
    scene,
    camera: view.camera,
    motion: human,
    markKinds: ["joint", "bone"],
    marks: seconds => fighter.marks(human.bones(subject, seconds)),
    seek: (seconds: number): void => {
      figure.apply(human.pose(subject, seconds));
      view.seek(seconds);
      scene.updateMatrixWorld(true);
    },
    dispose: (): void => reportAutoMovieResourceRetirement([
      figure.dispose,
      set.dispose,
      lights.dispose,
      (): void => { scene.clear(); },
    ]),
  };
}
