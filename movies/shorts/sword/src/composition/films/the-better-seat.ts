import type { IFilm } from "../../IFilm";
import { householdYard } from "../scenes/the-better-seat/010-household-yard/householdYard";

/**
 * Build the descriptor for the one-scene household-yard film.
 * `create` supplies a fresh seekable scene on the 60-second film clock at 24 fps and 1280 × 720.
 *
 * @evidence contracts/development/implementation.md#principled-implementation The descriptor stores the commissioned runtime, frame rate and raster and creates the one scene that covers all four sequential beats.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The film owns delivery metadata and scene selection. The scene owns the visible stage and its seek behavior.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The dimensions and clock come from the Sword delivery profile. This single scene is the complete film.
 * @evidence contracts/development/implementation.md#efficient-algorithms Creating a descriptor costs constant time and space. The stage is built only when the caller invokes create.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work A fresh scene per create keeps mutable camera and cast transforms isolated between consumers.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The consumer owns the scene returned by create and releases it through its disposal callback.
 * @evidence contracts/development/common.md#meaningful-documentation The comment gives the delivery dimensions and timebase and states that the constructor supplies a new scene.
 * @evidence contracts/development/composition.md#screenplay-realization The one screenplay scene is presented in order from the wager to Carlo's exit at the recorded delivery profile.
 * @evidence contracts/development/composition.md#composition-only The descriptor combines the approved delivery clock and householdYard. Direction, props and poses stay with the scene.
 * @evidence contracts/development/composition.md#living-scene The single continuing scene keeps the bench, ring and threshold geography through the four beats.
 * @evidence docs/body/screenplay/the-better-seat/010-household-yard.md The wager, score, handover and split-saddle callback form the one 60-second scene.
 */
export function theBetterSeat(): IFilm {
  return {
    durationSeconds: 60,
    fps: 24,
    width: 1280,
    height: 720,
    create: async () => householdYard(),
  };
}
