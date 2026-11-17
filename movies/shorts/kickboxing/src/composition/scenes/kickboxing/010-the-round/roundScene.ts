import type { IFilmProduction } from "../../../../IFilmProduction";
import { Fighter } from "../../../../entities/cast/fighter/Fighter";
import { Referee } from "../../../../entities/cast/referee/Referee";
import { Ring } from "../../../../entities/sets/ring/Ring";
import { ArenaAudience } from "../../../../entities/crowds/arena/ArenaAudience";
import { reportAutoMovieResourceRetirement } from "@automovie/render";
import { sampleMotion } from "@automovie/engine";
import type { INativeRound } from "../../../../interactions/kickboxing/INativeRound";
import { RoundPlayback } from "../../../../interactions/kickboxing/RoundPlayback";
import { FightStage } from "./FightStage";

/**
 * Mount the continuous native round, retaining the SDK's reported limitations.
 * The manuscript stays authoritative; this edition's native fall and counting
 * posture remain disclosed mismatches pending the package owner's repairs.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States scene extent, native artifact use and pending dependency repairs.
 * @evidence contracts/development/implementation.md#principled-implementation Mounts the same canonical cast and ring through the shared FightStage with native clip playback and the screenplay's full/tracking camera moves.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Construct the cast, native reader and stage, then mount for 180 delivered seconds.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No new motion, invented contacts, dynamic simulation, body reset or altered manuscript.
 * @evidence contracts/development/implementation.md#efficient-algorithms Loads already computed native clips; browser mounts perform no schedule resolution or physical audit.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses the catalog's actual cast, ring, drawing and stage projection.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources FightStage returns the complete disposal port for its scene, bodies, gloves and set.
 * @evidence contracts/development/composition.md#composition-only Combines entity constructors, native playback and shared stage; absolute performance time belongs to RoundPerformance's native cues.
 * @evidence contracts/development/composition.md#screenplay-realization Composes the complete chronology with documented unresolved native contact, fall and counting-posture mismatches; it does not claim exact screenplay acceptance.
 * @evidence contracts/development/composition.md#living-scene All three principal performers continue through the round, count, compliance, celebration and care; ArenaAudience supplies waiting teams, seated spectators and the timekeeper. Nonverbal sound remains a separate obligation.
 * @evidence docs/body/screenplay/kickboxing/010-the-round.md Mounts the single continuous scene, p01 through p12, with the full paired view and shared ending.
 */
export function roundScene(native: INativeRound): IFilmProduction {
  const owen: Fighter = new Fighter("owen", 0xb94439);
  const marek: Fighter = new Fighter("marek", 0x3978bc);
  const daniel: Referee = new Referee();
  const playback: RoundPlayback = new RoundPlayback(native, [owen, marek, daniel]);
  const ring: Ring = new Ring("kickboxing/film");
  const stage: IFilmProduction = new FightStage(owen, marek, daniel, ring).mount(playback, 180, 0, [
    { start: 0, duration: 134, move: "follow" },
    { start: 135, duration: 16, move: "orbit" },
    {
      start: 153, duration: 27, move: "static",
      subject: {
        base: { x: 0, y: 0, z: 0 },
        height: owen.body.measure.stature + owen.body.measure.hand,
        radius: ring.size / Math.SQRT2,
        at: null,
      },
    },
  ], ring.size / 2);
  try {
    const audience: ReturnType<ArenaAudience["drawing"]> = new ArenaAudience(ring.size, ring.origin.y).drawing({
      pose: (subject, seconds) => {
        const clip = native.audience[subject];
        if (clip === undefined) throw new Error(`Missing native audience motion ${subject}`);
        return sampleMotion(clip, seconds).pose;
      },
    });
    stage.scene.add(audience.object);
    return {
      ...stage,
      seek: (seconds: number): void => { stage.seek(seconds); audience.seek(seconds); stage.scene.updateMatrixWorld(true); },
      dispose: (): void => reportAutoMovieResourceRetirement([audience.dispose, stage.dispose]),
    };
  } catch (error) { stage.dispose(); throw error; }
}
