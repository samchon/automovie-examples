import { AutoMovieComposition } from "@automovie/engine";
import { HumanBreath, HumanGaze, HumanPerformance, give } from "@automovie/motions";

import type { Fighter } from "../../entities/cast/fighter/Fighter";
import type { Referee } from "../../entities/cast/referee/Referee";
import type { Ring } from "../../entities/sets/ring/Ring";
import { ExitClosed } from "./ExitClosed";
import { OpeningExchange } from "./OpeningExchange";
import { PressureExchange } from "./PressureExchange";
import { RoundEnding } from "./RoundEnding";
import { RoundPassages } from "./RoundPassages";

/**
 * One native schedule for the entire 180-second round. Every performer
 * continues the preceding entry; no scene resets a body at a phase boundary.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the whole-film clock and continuous-body contract.
 * @evidence contracts/development/design.md#principled-representation Immutable roles create native input and one resolved performance.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Input is inspectable before expensive resolution; resolve is the single execution port.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No package patch, alternative solver, forced hit or handwritten pose.
 */
export class RoundPerformance {
  /** The opening's native guard preparation precedes delivered picture zero. */
  public readonly preparation: number = 1;

  /** Keep one cast/set identity for the whole chronology. */
  public constructor(private readonly owen: Fighter, private readonly marek: Fighter, private readonly daniel: Referee, private readonly ring: Ring, private readonly officialPointing: boolean = false, private readonly officialArmCount: boolean = false) {}

  /**
   * Compose every phase and fixed closing cue as native input.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Names preparation, phase indices and all fixed closing instants.
   * @evidence contracts/development/implementation.md#principled-implementation Appends the existing opening/pressure/closed-exit relations, nine standing passages and ending through native parallel, sequence and anchor operators.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Establish the opening, create phase records, then return cues and the one complete graph.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Native actions own every duration, joint and contact; no screenplay rewrite or time scaling.
   * @evidence contracts/development/implementation.md#efficient-algorithms Builds one bounded graph, with no drawing, audit or per-frame preparation.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses the same opening modules as their inspected catalog cases.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns data and native layer closures without external resources.
   * @evidence contracts/development/behaviors.md#studied-laws The constituent interactions cite their practice; this owner adds only chronology and official routing.
   * @evidence contracts/development/behaviors.md#relational-goals Passes the same actual cast and ring to every interaction; target and outcome defects remain native and disclosed.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation One seed, native entry preparation, twelve fifteen-second cues and exact closing cues determine the schedule.
   * @evidence docs/research/kickboxing/round-practice.md Keeps the real-time round, neutral compliance, count and closing protocol.
   */
  public input(seed: string): HumanPerformance.IInput {
    const initial: HumanPerformance.IInput = new OpeningExchange(this.owen, this.marek, this.daniel, this.ring).input(seed);
    const passages: RoundPassages = new RoundPassages(this.owen, this.marek, this.daniel);
    const parts: AutoMovieComposition[] = [initial.composition,
      AutoMovieComposition.at("opening-counter", new PressureExchange(this.owen, this.marek, this.daniel, this.ring).compose(), 0, { event: "recovered" }),
      AutoMovieComposition.at("pressure-retreat", new ExitClosed(this.owen, this.marek, this.daniel, this.ring).compose(), 0, { event: "start" }),
    ];
    for (let index: number = 2; index <= 10; index++) {
      parts.push(this.daniel.chain().walk({ to: index < 5 || index >= 9 ? this.ring.zones.northwest : index < 8 ? this.ring.zones.northeast : this.ring.zones.southwest })
        .sync({ of: "round", event: "phase", index: index - 1 }).stand({ seconds: 8 }).node);
      parts.push(AutoMovieComposition.at("round", passages.phase(index), 0, { event: "phase", index: index - 1 }));
    }
    parts.push(new RoundEnding(this.owen, this.marek, this.daniel, this.ring, this.officialPointing, this.officialArmCount).compose());
    return {
      ...initial,
      laws: [...(initial.laws ?? []), give],
      composition: AutoMovieComposition.parallel(...parts),
      layers: {
        ...initial.layers,
        daniel: [HumanBreath.layer(), HumanGaze.layer([
          { from: 0, target: { kind: "person", subject: this.owen.subject, region: "sternum" }, with: "head" },
          { from: this.preparation + 150, target: { kind: "person", subject: this.marek.subject, region: "nose" }, with: "head" },
        ])],
      },
      cues: {
        ...initial.cues,
        round: Array.from({ length: 12 }, (_unused: unknown, index: number) => ({ name: "phase", seconds: this.preparation + index * 15 })),
        closing: [
          { name: "setup", seconds: this.preparation + 148 },
          { name: "contact", seconds: this.preparation + 150 },
          { name: "neutral", seconds: this.preparation + 153 },
          { name: "prepare", seconds: this.preparation + 157 },
          ...Array.from({ length: 10 }, (_unused: unknown, index: number) => ({ name: "count", seconds: this.preparation + 158 + index })),
          { name: "result", seconds: this.preparation + 167.6 },
          { name: "celebrate", seconds: this.preparation + 168.1 },
          { name: "bell", seconds: this.preparation + 170.1 },
          { name: "end", seconds: this.preparation + 180 },
        ],
      },
    };
  }

  /**
   * Resolve the complete native graph once; package refusals propagate intact.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Names the single native resolution and refusal boundary.
   * @evidence contracts/development/implementation.md#principled-implementation Passes the complete input unchanged to HumanPerformance.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure One native construction over the input port.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No patched pose, caught refusal, second solver or physical audit.
   * @evidenceExclude contracts/development/implementation.md#efficient-algorithms This wrapper adds constant work; the installed vocabulary owns schedule and contact planning.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work A caller requests a fresh generation; native performance owns its own reuse.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns in-memory state without external resources.
   * @evidence contracts/development/behaviors.md#studied-laws The input's constituent interactions cite the practice they compose.
   * @evidence contracts/development/behaviors.md#relational-goals Preserves the input's actual body targets and declared outcomes, including unresolved SDK discrepancies.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation One seed and complete graph are resolved once before frame sampling.
   */
  public resolve(seed: string): HumanPerformance {
    return new HumanPerformance(this.input(seed));
  }
}
