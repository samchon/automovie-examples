import type { IFilm } from "../../IFilm";
import { householdYard } from "../scenes/the-better-seat/householdYard";

/** The four yard beats in `010-household-yard.md`, on a 24 fps delivery clock. */
export function theBetterSeat(): IFilm {
  return {
    durationSeconds: 60,
    fps: 24,
    width: 1280,
    height: 720,
    create: async () => householdYard(),
  };
}
