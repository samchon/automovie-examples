import { AutoMovieComposition } from "@automovie/engine";
import { HumanPerformance, give } from "@automovie/motions";

import type { IFilmProduction } from "../../../../IFilmProduction";
import type { Fighter } from "../../../../entities/cast/fighter/Fighter";
import type { Referee } from "../../../../entities/cast/referee/Referee";
import { Ring } from "../../../../entities/sets/ring/Ring";
import { OpeningExchange } from "../../../../interactions/kickboxing/OpeningExchange";
import { PressureExchange } from "../../../../interactions/kickboxing/PressureExchange";
import { FightStage } from "../../kickboxing/010-the-round/FightStage";

/**
 * Continue the opening into p01-b02 without resetting either fighter. The
 * previous counter's recovery anchors the next exchange; native action
 * timing and interrupt admission decide whether it fits. The extra held
 * case time permits inspection of the whole retreat and official's route.
 * This eighteen-second catalog case remains work in progress.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the continuous entry, provisional cue, duration and unaccepted status.
 * @evidence contracts/development/implementation.md#principled-implementation Resolves the original opening input and its appended native pressure graph as one performance, then mounts the same ringside projection.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Get the opening graph, add the beat cue and relation, resolve once and mount.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No reset, alternate body, keyed pose, per-frame simulation or whole-case audit.
 * @evidence contracts/development/implementation.md#efficient-algorithms One performance resolution and one shared cast/set/camera mount per case.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The exact OpeningExchange input is reused rather than copying its actions into a new sequence.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources FightStage owns complete drawing retirement, including partial mount failures.
 * @evidence contracts/development/composition.md#composition-only Joins cast, set, the two interaction modules and their shared projection; the native vocabulary performs all actions.
 * @evidence contracts/development/composition.md#screenplay-realization Exhibits docs/body/screenplay/kickboxing/010-the-round.md#p01-b01 and #p01-b02 on one clock. The body/high contacts, southwest route and final framing remain unaccepted.
 * @evidence contracts/development/composition.md#living-scene Both continuing fighters and the moving official share the native clock; known contact failures stay unaccepted.
 */
export function pressureCase(
  owen: Fighter,
  marek: Fighter,
  daniel: Referee,
  seed: string,
): IFilmProduction & { motion: HumanPerformance; preparation: number } {
  const ring = new Ring(seed);
  const opening = new OpeningExchange(owen, marek, daniel, ring);
  const input = opening.input(seed);
  const motion = new HumanPerformance({
    ...input,
    laws: [...(input.laws ?? []), give],
    composition: AutoMovieComposition.parallel(
      input.composition,
      AutoMovieComposition.at("opening-counter", new PressureExchange(owen, marek, daniel, ring).compose(), 0, { event: "recovered" }),
    ),
  });
  return {
    ...new FightStage(owen, marek, daniel, ring).mount(motion, 18, opening.preparation, [
      { start: 0, duration: 5, move: "follow" },
      { start: 5, duration: 13, move: "truck" },
    ]),
    motion,
    preparation: opening.preparation,
  };
}
