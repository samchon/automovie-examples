import type { HumanPerformance } from "@automovie/motions";

import type { IFilmProduction } from "../../../../IFilmProduction";
import { Fighter } from "../../../../entities/cast/fighter/Fighter";
import { Referee } from "../../../../entities/cast/referee/Referee";
import { Ring } from "../../../../entities/sets/ring/Ring";
import { OpeningExchange } from "../../../../interactions/kickboxing/OpeningExchange";
import { FightStage } from "../../kickboxing/010-the-round/FightStage";

/**
 * A six-second rehearsal of p01-b01, including the approach, mutual touch,
 * first attacks and counter. This case is work in progress, not an accepted
 * fight or delivery. Its native motion is shared by tests and exact-time
 * drawing, with no whole-case audit during mounting or playback.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the source beat, rehearsal extent, unaccepted status and separate inspection.
 * @evidence contracts/development/implementation.md#principled-implementation Mounts cast, set, lighting and the native OpeningExchange once; every seek draws those same poses and the native group-follow camera.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Resolve the composition and camera before allocating drawings, mount them, then expose seek, inspection views and retirement.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No keyed pose, hidden refusal, per-frame audit, simulated impulse claim or delivery claim.
 * @evidence contracts/development/implementation.md#efficient-algorithms One prepared schedule and camera clip; each seek samples only three cast poses and updates the scene.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the same cast bodies, OpeningExchange and drawing path in the catalog and subsequent production.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources All mounted drawings retire through the native coordinator, and failed allocation retires every earlier owned drawing.
 * @evidence contracts/development/composition.md#composition-only Joins entities and the beat's OpeningExchange; no action geometry or outcome law is implemented in the scene.
 * @evidence contracts/development/composition.md#screenplay-realization Exhibits docs/body/screenplay/kickboxing/010-the-round.md#p01-b01 with all three participants, continuous clock and south full view; physical, glove and visual acceptance remains open.
 * @evidence contracts/development/composition.md#living-scene Both fighters and Daniel perform the continuous opening relation on one native clock, including breath and the official's clearing movement.
 */
export function openingCase(
  owen: Fighter,
  marek: Fighter,
  daniel: Referee,
  seed: string,
): IFilmProduction & { motion: HumanPerformance; preparation: number } {
  const ring = new Ring(seed);
  const interaction = new OpeningExchange(owen, marek, daniel, ring);
  const motion = interaction.resolve(seed);
  return {
    ...new FightStage(owen, marek, daniel, ring).mount(motion, 6, interaction.preparation),
    motion,
    preparation: interaction.preparation,
  };
}
