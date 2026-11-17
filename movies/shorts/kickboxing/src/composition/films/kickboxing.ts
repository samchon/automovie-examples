import type { IFilm } from "../../IFilm";
import type { IFilmProduction } from "../../IFilmProduction";
import type { INativeRound } from "../../interactions/kickboxing/INativeRound";
import { roundScene } from "../scenes/kickboxing/010-the-round/roundScene";

/**
 * The commissioned 180-second direct polygon-man film. Generate its native
 * action clips with bakeRound before mounting or rendering; replacing the SDK
 * and regenerating replaces the motion without rewriting this film.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States complete delivery span, native regeneration and the source of picture motion.
 * @evidence contracts/development/implementation.md#principled-implementation Loads the actual computed native clip artifact and mounts the single chronological scene at 1280x720/30 fps.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure One film record and one asynchronous native-artifact loading step.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Missing or malformed native media refuses mounting; no placeholder fight or alternate motion is substituted.
 * @evidence contracts/development/implementation.md#efficient-algorithms Native expensive resolution runs once in generation, not again in the browser's viewer/capture/render mounts.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The viewer and renderer consume the same native artifact and scene.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The scene's explicit dispose port retires every owned drawable.
 * @evidence contracts/development/composition.md#composition-only Loads and composes the chronological scene at the adopted delivery profile.
 * @evidence contracts/development/composition.md#screenplay-realization The single scene owns p01–p12 realization and discloses outstanding package-level mismatches.
 * @evidence contracts/development/composition.md#living-scene The scene retains all three continuing principal performances; there is no repeated pilot or frozen replacement timeline.
 * @evidence docs/body/screenplay/kickboxing/010-the-round.md Plays this single scene from the opening bell to the shared 180-second ending.
 */
export function kickboxing(): IFilm {
  return {
    durationSeconds: 180, fps: 30, width: 1280, height: 720,
    create: async (progress?: (message: string) => void): Promise<IFilmProduction> => {
      progress?.("Loading the native 180-second round");
      const response: Response = await fetch(new URL("../../../media/automovie/kickboxing/native-motion.json", import.meta.url));
      if (!response.ok) throw new Error(`Native round is missing (${response.status}); run film:bake first`);
      const native: INativeRound = await response.json();
      if (native.duration !== 180 || native.fps !== 30 || Object.values(native.clips).some(clip => clip.keyframes.length !== 5401)) throw new Error("The native round does not match its delivery grid");
      return roundScene(native);
    },
  };
}
