import { PersonBody } from "../person/PersonBody";

/**
 * Daniel's coarse charcoal figure. Unspecified dimensions use a 1800 mm,
 * 80 kg adult proxy: staging assumptions, not additional biography. The
 * scene owns his signals, observation and travel. No voice is generated.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the cast, colour, coarse body assumptions and scene-owned performance.
 * @evidence contracts/development/design.md#principled-representation A cast specialization over the shared canonical polygon person.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Fixes Daniel's identity and coarse body inputs; inherits the shared performance and drawing ports.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No copied rig, joint animation or precision skin is added for an official.
 * @evidence contracts/development/entities.md#settings-realization Realizes the adult official and charcoal clothing of docs/body/brief/cast/daniel-mensah.md#referee as a coarse figure; performance and signals remain separately reviewable.
 * @evidence contracts/development/entities.md#object-shape Fixed identity and shared immutable preparation create explicitly owned drawing state.
 * @evidence contracts/development/entities.md#controls-and-source Reuses PersonBody and its installed MIT-licensed Human implementation without an external asset.
 */
export class Referee extends PersonBody {
  /** Prepare the official's shared coarse representation. */
  public constructor() {
    super("daniel", 0x30343c, 1800, 80);
  }
}
