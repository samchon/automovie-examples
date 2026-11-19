import type { IFilm } from "../../IFilm";
import { breedingYardRoad } from "../scenes/answer-me/010-breeding-yard-road/scene";

/** One late afternoon on the lower Aosta road, from the paid bench to the open gate. */
export function answerMe(): IFilm {
  return { durationSeconds: 60, fps: 24, width: 1280, height: 720, create: breedingYardRoad };
}
