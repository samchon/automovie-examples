import type { IFilm } from "../../IFilm";
import { answerMe } from "./answer-me";
import { breadCloths } from "./bread-cloths";
import { theBetterSeat } from "./the-better-seat";
import { theLastCarry } from "./the-last-carry";

/** The four commissioned Savoy shorts, each selected by its screenplay folder. */
export const films: Readonly<Record<string, IFilm>> = {
  "the-better-seat": theBetterSeat(),
  "bread-cloths": breadCloths(),
  "answer-me": answerMe(),
  "the-last-carry": theLastCarry(),
};
