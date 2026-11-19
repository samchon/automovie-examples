import type { IFilm } from "../../IFilm";
import { twoHands } from "./two-hands";

/**
 * `two-hands` selects the descriptor for the signed programme in
 * [the game screenplay](../../../docs/body/screenplay/two-hands/010-game.md).
 * The inspector and render use the same key and call the descriptor's `create` when they mount a scene.
 */
export const films: Readonly<Record<string, IFilm>> = {
  "two-hands": twoHands(),
};
