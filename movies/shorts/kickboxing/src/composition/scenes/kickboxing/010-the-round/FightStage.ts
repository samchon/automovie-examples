import type { HumanPerformance } from "@automovie/motions";
import { reportAutoMovieResourceRetirement } from "@automovie/render";
import * as THREE from "three";

import type { IFilmProduction } from "../../../../IFilmProduction";
import { RingsideCamera } from "../../../../entities/cameras/ringside/RingsideCamera";
import type { Fighter } from "../../../../entities/cast/fighter/Fighter";
import type { Referee } from "../../../../entities/cast/referee/Referee";
import { ArenaLighting } from "../../../../entities/lights/arena/ArenaLighting";
import type { Ring } from "../../../../entities/sets/ring/Ring";

/**
 * The reusable ringside projection of the existing cast and set. The caller
 * owns choreography; this stage mounts its native poses, full follow camera,
 * review views and actual joint marks through one clock.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the projection boundary, supplied performance, shared clock and inspection ports.
 * @evidence contracts/development/design.md#principled-representation Immutable references to actual cast and set create a separately owned drawing of a supplied native performance.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One mount port takes the native performance, running time and preparation offset needed by both a case and its subsequent scene.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No action, outcome, keyed joint, alternate rig or whole-case physical audit is introduced.
 */
export class FightStage {
  /** Retain the actual participants and set, without mounting them. */
  public constructor(
    private readonly owen: Fighter,
    private readonly marek: Fighter,
    private readonly daniel: Referee,
    private readonly ring: Ring,
  ) {}

  /**
   * Mount one prepared performance for exact-time drawing and inspection.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Names the supplied native clock, preparation, camera, marks and complete cleanup.
   * @evidence contracts/development/implementation.md#principled-implementation Draws the supplied performance's poses and bones at the same prepared second and follows the actual midpoint of its two fighters.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Prepare the follow camera, allocate the cast/set/light, then expose drawing and retirement.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No local motion, simulated state, fabricated force, physical audit or delivery acceptance is added.
   * @evidence contracts/development/implementation.md#efficient-algorithms Reuses all mounted geometry and the compiled camera; a seek updates three native pose projections.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work The same stage serves the opening catalog and scene, with their own supplied performance and duration.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Native retirement attempts every owned drawing and clears the scene; allocation failures retire all earlier drawings.
   * @evidenceExclude contracts/development/composition.md#screenplay-realization This reusable projection chooses no screenplay action or outcome; the scene and case callers supply their actual performances and duration.
   * @evidence contracts/development/composition.md#composition-only Mounts the existing cast, ring, lighting and camera over supplied native poses, without authoring motion.
   * @evidence contracts/development/composition.md#living-scene Keeps all supplied principal performances visible on the same clock; the caller owns their complete chronology and any background presence.
   */
  public mount(motion: Pick<HumanPerformance, "pose" | "bones">, duration: number, preparation: number, moves?: Parameters<RingsideCamera["mount"]>[2], radius?: number): IFilmProduction {
    const { owen, marek, daniel, ring } = this;
    const centreAt = (seconds: number): { x: number; y: number; z: number } => {
      const a = motion.pose(owen.subject, seconds + preparation).root?.translation;
      const b = motion.pose(marek.subject, seconds + preparation).root?.translation;
      if (a === undefined || b === undefined) throw new Error("Native round poses must retain their world roots");
      return { x: (a.x + b.x) / 2, y: 0, z: (a.z + b.z) / 2 };
    };
    const view = new RingsideCamera({
      x: 0, y: owen.body.measure.stature, z: ring.size / 2 + owen.body.measure.hand,
    }).mount({
      base: centreAt(0),
      height: Math.max(owen.body.measure.stature, marek.body.measure.stature) + owen.body.measure.hand,
      radius: radius ?? 0.8 + owen.body.measure.upperArm + owen.body.measure.forearm,
      at: centreAt,
    }, duration, moves);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10151e);
    const retirement: (() => void)[] = [];
    try {
      const people = [owen, marek, daniel].map(person => {
        const drawing = person.drawing();
        retirement.push(drawing.dispose);
        scene.add(drawing.object);
        return { person, drawing };
      });
      const set = ring.drawing();
      retirement.push(set.dispose);
      const lights = new ArenaLighting(ring.size).drawing();
      retirement.push(lights.dispose);
      scene.add(set.object, lights.object);
      return {
        scene,
        camera: view.camera,
        markKinds: ["joint", "bone"],
        marks: seconds => [owen, marek, daniel].flatMap(person => person.marks(motion.bones(person.subject, seconds + preparation))),
        views: {
          north: seconds => {
            const centre = centreAt(seconds);
            return { position: [centre.x, owen.body.measure.stature, -ring.size], target: [centre.x, owen.body.measure.stature / 2, centre.z] };
          },
          high45: seconds => {
            const centre = centreAt(seconds);
            return { position: [centre.x + ring.size, ring.size, centre.z + ring.size], target: [centre.x, owen.body.measure.stature / 2, centre.z] };
          },
        },
        seek: seconds => {
          for (const { person, drawing } of people) drawing.apply(motion.pose(person.subject, seconds + preparation));
          view.seek(seconds);
          scene.updateMatrixWorld(true);
        },
        dispose: () => reportAutoMovieResourceRetirement([...retirement, () => { scene.clear(); }]),
      };
    } catch (error) {
      reportAutoMovieResourceRetirement([...retirement, () => { scene.clear(); }]);
      throw error;
    }
  }
}
