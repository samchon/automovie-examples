import type { IFilm } from "../../IFilm";
import { createValleyLane } from "../scenes/the-last-carry/010-valley-lane/ValleyLane";

/**
 * The single valley-lane scene plays for 60 seconds at 1280 × 720 and 24 fps.
 *
 * @evidence docs/body/screenplay/the-last-carry/010-valley-lane.md Plays the procession, the two changes of bearers, the receding funeral and the closing sliver in one scene.
 * @evidence contracts/development/common.md#meaningful-documentation States the running time, frame rate, raster and sole source scene.
 * @evidence contracts/development/implementation.md#principled-implementation The film supplies the recorded delivery profile and the lane factory. The consumer can draw frames at n/24 seconds, including the last at 1439/24.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Film owns only delivery metadata and the scene entry. ValleyLane owns performance, camera and disposal.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The film takes its scene and running time from the retained screenplay and delivery raster from PROJECT.md rather than a baked video.
 * @evidence contracts/development/implementation.md#efficient-algorithms Returns a constant-size descriptor with one scene factory and does no draw or scene construction itself.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses the lane factory function. Each invocation supplies a fresh film descriptor and each mount owns its mutable stage.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The descriptor is caller-owned and retains no mounted scene, browser or audio handles.
 * @evidence contracts/development/composition.md#screenplay-realization The only screenplay scene contains 0–13 s of the hem, 13–32 s of the pay and handovers, 32–48 s of the departure, and 48–60 s of the shoe and sliver.
 * @evidence contracts/development/composition.md#composition-only Registers the single scene without adding blocking, time offsets or new outcomes.
 * @evidence contracts/development/composition.md#living-scene Delegates the continuous time, fixed lane-wide interval and final close views to ValleyLane.
 */
export function theLastCarry(): IFilm {
  return { durationSeconds: 60, fps: 24, width: 1280, height: 720, create: createValleyLane };
}
