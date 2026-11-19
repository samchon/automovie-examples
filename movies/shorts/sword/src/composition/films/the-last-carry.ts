import type { IFilm } from "../../IFilm";
import { createValleyLane } from "../scenes/the-last-carry/ValleyLane";

/** One continuous minute of the procession, on a delivery grid of 24 frames per second. */
export function theLastCarry(): IFilm {
  return { durationSeconds: 60, fps: 24, width: 1280, height: 720, create: createValleyLane };
}
