import type { IFilm } from "../../IFilm";
import { kickboxing } from "./kickboxing";

/** The single named direct 3D feature of this production. */
export const films: Readonly<Record<string, IFilm>> = { "the-round": kickboxing() };
