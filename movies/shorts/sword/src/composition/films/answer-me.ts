import type { IFilm } from "../../IFilm";
import { breedingYardRoad } from "../scenes/answer-me/010-breeding-yard-road/scene";

/**
 * Supplies the one-minute delivery profile and scene factory for Answer me.
 * Each creation starts a fresh production, from the pay bench to the open gate.
 *
 * @evidence docs/body/screenplay/answer-me/010-breeding-yard-road.md Plays the sole scene, including the muster and all six beats through Rémy's departure.
 * @evidence contracts/development/composition.md#screenplay-realization The sole scene occupies 60 seconds at the adopted 1280 × 720, 24 fps delivery profile recorded in docs/acceptance/answer-me.md.
 * @evidence contracts/development/composition.md#composition-only Exposes the scene factory and delivery metadata. The scene places time and resolves both fixed locomotion seeds per production.
 * @evidence contracts/development/composition.md#living-scene The factory delegates continuous cast, camera and prop staging to the road scene; the separately authored sound runs on the same timebase.
 * @evidence contracts/development/common.md#meaningful-documentation States the story span, delivery profile and ownership of a new production.
 * @evidence contracts/development/implementation.md#principled-implementation Seconds, frames per second and raster pixels use the delivery profile directly; create receives the absolute-time scene factory.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The film owns ordering and profile; breedingYardRoad owns the scene graph and playback.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The values are the authored one-minute runtime and accepted delivery settings. The film uses the same scene factory for review and export.
 * @evidence contracts/development/implementation.md#efficient-algorithms Returns one fixed-size descriptor; scene construction is deferred to create.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses the scene factory identity. Each call owns an independent descriptor.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The descriptor retains one function and four numbers. Its caller owns any created production and its disposal.
 */
export function answerMe(): IFilm {
  return { durationSeconds: 60, fps: 24, width: 1280, height: 720, create: breedingYardRoad };
}
