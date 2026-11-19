import type { IFilm } from "../../IFilm";
import { roundClock } from "../../clock";
import { createRoundScene } from "../scenes/kickboxing/020-the-round/createRoundScene";

/**
 * The film for the kickboxing screenplay folder. Its profile is 1280 × 720 at 30 fps on the commissioned 180-second clock. The registry keeps the established public subject key.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the delivery profile, registry boundary and scene ownership.
 * @evidence contracts/development/implementation.md#principled-implementation The profile points to the authored scene factory and shares the round clock. The host creates and seeks that scene.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The film owns its profile and one-scene order. The scene owns drawing, pose sampling and disposal.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The output dimensions come from the commission. All ordinary consumers resolve this same programme.
 * @evidence contracts/development/implementation.md#efficient-algorithms Constructs one fixed-size profile without allocating a scene.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Each profile references the same scene factory and clock. Mounts own their independent scenes.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned profile retains only the scene factory and its delivery values.
 * @evidence contracts/development/composition.md#screenplay-realization The sole numbered screenplay file plays continuously from the opening bell to black. PROJECT.md fixes the delivery raster and frame rate.
 * @evidence contracts/development/composition.md#composition-only The film pairs one profile with one scene. Sound and captions are assembled by the delivery host.
 * @evidence contracts/development/composition.md#living-scene Host seeks show the same ten performer tracks and moving camera up to the out-point.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md Plays this complete numbered scene on the round clock.
 */
export function kickboxing(): IFilm {
  return {durationSeconds:roundClock.duration,fps:roundClock.fps,width:1280,height:720,create:createRoundScene};
}
