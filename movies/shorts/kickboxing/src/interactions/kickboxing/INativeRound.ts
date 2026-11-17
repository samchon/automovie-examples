import type { IAutoMovieMotion } from "@automovie/interface";

/**
 * A delivery-grid bake of the installed native performance, never authored
 * joint keys. Regenerate it after changing choreography or the SDK. Principal
 * delivery frames are direct native poses; the engine interpolates between
 * them. Peripheral seated background is sampled at2Hz, with30Hz closing motion.
 * The accompanying receipt records input/output hashes and both sampling grids.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Defines computed pose provenance, regeneration and inter-frame sampling limits.
 * @evidence contracts/development/design.md#principled-representation Reuses native motion clips for the three continuing skeletons at the delivery frame grid.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Duration, frame rate, input digest and the three native clip records are the playback inputs.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No alternate pose format, cached false contact or hand-authored joint animation.
 */
export interface INativeRound {
  /** SHA-256 of source, manuscript, lockfile, package metadata and generation command. */
  inputDigest: string;
  /** Delivered seconds, excluding native guard preparation. */
  duration: number;
  /** Samples per second, equal to the delivery rate. */
  fps: number;
  /** Native clips computed from the same performance, keyed by cast identity. */
  clips: Record<"owen" | "marek" | "daniel", IAutoMovieMotion>;
  /** Native background clips: sparse seated breathing and delivery-grid closing motion. */
  audience: Record<string, IAutoMovieMotion>;
}
