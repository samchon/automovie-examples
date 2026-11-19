import type { IFilm } from "../../IFilm";
import { createBreadRoad } from "../scenes/bread-cloths/010-two-bends/scene";

/**
 * Provide the descriptor for the single minute above Orsières.
 * The clock uses seconds at 24 frames per second. The raster is 1280 by 720 pixels.
 * Each call to the descriptor's `create` function creates a new seekable scene.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The descriptor exposes the authored duration, output rate and dimensions, and the factory ownership boundary.
 * @evidence contracts/development/implementation.md#principled-implementation The screenplay fixes a continuous 60-second running time. The direct 3D delivery uses a fixed 24-frame-per-second 16:9 raster.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The descriptor supplies the format to the registry and delegates cast, staging and disposal to createBreadRoad.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The time and raster constants are the film's production format. Its seek behavior comes from the live scene factory.
 * @evidence contracts/development/implementation.md#efficient-algorithms Constructs one fixed-size object in constant time and space, with scene construction deferred until create.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The stable factory can be shared by descriptors. Each create call builds its own mutable stage.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller owns each returned descriptor and created scene. The descriptor acquires no graphics resources or tasks.
 * @evidence contracts/development/composition.md#screenplay-realization Plays the one numbered scene in the adopted film order exactly once. The production context and film delivery fix 60 seconds, 1280 by 720 and 24 fps.
 * @evidence contracts/development/composition.md#composition-only This function declares delivery format and delegates the whole picture to the scene factory. It owns neither shot marks nor actor routes.
 * @evidence contracts/development/composition.md#living-scene The imported scene keeps the rising road, spill, rescue and final two bread deliveries on one clock, with the five spoken lines furnished by its separately restored soundtrack.
 * @evidence docs/body/screenplay/bread-cloths/010-two-bends.md Plays 010-two-bends as the complete picture of Bread Cloths in the single 60-second film.
 */
export function breadCloths(): IFilm {
  return { durationSeconds: 60, fps: 24, width: 1280, height: 720, create: createBreadRoad };
}
