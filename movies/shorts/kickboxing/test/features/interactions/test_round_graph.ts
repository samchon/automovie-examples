import type { AutoMovieComposition, IAutoMovieIntent } from "@automovie/engine";
import { HUMAN_ACTIONS, type HumanPerformance } from "@automovie/motions";
import assert from "node:assert/strict";

import { Fighter } from "../../../src/entities/cast/fighter/Fighter";
import { Referee } from "../../../src/entities/cast/referee/Referee";
import { Ring } from "../../../src/entities/sets/ring/Ring";
import { RoundPerformance } from "../../../src/interactions/kickboxing/RoundPerformance";

/**
 * Check the complete graph against the commission's clocks and the installed
 * laws' declared cut targets before paying for native contact resolution.
 * This is structural admission only, not a physical or visual success test.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the independent commission and native-law oracles and the test's structural limit.
 * @evidence contracts/development/testing.md#independent-expectations Compares authored phase/count/contact cues to the preserved commission and each explicit cut to the installed law declarations, rather than treating generated poses as their own oracle.
 * @evidence contracts/development/testing.md#behavioral-verification Constructs the actual graph and visits every explicit cut, catching unsupported outgoing action families before native resolution.
 * @evidence contracts/development/testing.md#execution-ownership The exported unit reaches in-memory native composition and law metadata without a host or generated artifact.
 * @evidence contracts/development/testing.md#distinguishing-cases Visits the complete graph and accumulates all unsupported target transitions before asserting; native timing, geometry and picture remain separate checks.
 */
export function test_round_graph(): void {
  const input: HumanPerformance.IInput = new RoundPerformance(new Fighter("owen", 0xb94439), new Fighter("marek", 0x3978bc), new Referee(), new Ring("kickboxing/film")).input("kickboxing/film");
  const failures: string[] = [];
  const previous: Map<string, IAutoMovieIntent> = new Map();
  const visit = (node: AutoMovieComposition): void => {
    if (node.kind === "at") return visit(node.part);
    if (node.kind !== "intent") {
      for (const part of node.parts) visit(part);
      return;
    }
    const intent: IAutoMovieIntent = node.intent;
    const before: IAutoMovieIntent | undefined = previous.get(intent.subject);
    if (before?.until !== undefined) {
      const source = Object.entries(HUMAN_ACTIONS).find(([name]) => name === before.capability)?.[1];
      const target = Object.entries(HUMAN_ACTIONS).find(([name]) => name === intent.capability)?.[1];
      const reflex: boolean = target?.accepts?.any !== undefined;
      if (source !== undefined && source.interrupts[intent.capability] === undefined && !reflex) failures.push(`${intent.subject}: ${before.anchor ?? before.capability} cut into ${intent.anchor ?? intent.capability} (${before.capability} -> ${intent.capability})`);
    }
    previous.set(intent.subject, intent);
  };
  visit(input.composition);
  const phases = input.cues?.round?.filter(cue => cue.name === "phase").map(cue => cue.seconds - 1);
  const counts = input.cues?.closing?.filter(cue => cue.name === "count").map(cue => cue.seconds - 1);
  assert.deepEqual(phases, [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165]);
  assert.deepEqual(counts, [158, 159, 160, 161, 162, 163, 164, 165, 166, 167]);
  assert.equal(input.cues?.closing?.find(cue => cue.name === "contact")?.seconds, 151);
  assert.deepEqual(input.performers.map(person => person.subject).sort((one: string, other: string): number => one.localeCompare(other)), ["daniel", "marek", "owen"]);
  console.info(JSON.stringify({ stage: "round-graph", unsupportedCuts: failures }));
  assert.deepEqual(failures, [], "Every explicit cut needs a native transition into its next action");
}
