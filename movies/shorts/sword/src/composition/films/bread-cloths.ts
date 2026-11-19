import type { IFilm } from "../../IFilm";
import { createBreadRoad } from "./bread-cloths/scene";

/** The two bends above Orsières, on the screenplay's continuous minute. */
export function breadCloths(): IFilm {
  return { durationSeconds: 60, fps: 24, width: 1280, height: 720, create: createBreadRoad };
}
