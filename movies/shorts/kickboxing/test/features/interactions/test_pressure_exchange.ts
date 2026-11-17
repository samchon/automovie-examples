import { defend } from "@automovie/motions";
import assert from "node:assert/strict";

import { pressureCase } from "../../../src/composition/scenes/catalog/pressure/pressureCase";
import { Referee } from "../../../src/entities/cast/referee/Referee";
import { getFighter } from "../../helpers/getFighter";

/**
 * Check the continuing exchange's decided contact classes, reactions and
 * unchanged opening contacts. Gather every outcome failure before reporting;
 * no still, solved impulse or whole-film acceptance is inferred here.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the contact, reaction and continuity assertions with their observation limits.
 * @evidence contracts/development/testing.md#behavioral-verification Resolves the actual catalog case and compares native contacts with the screenplay's miss, guarded, glancing-head and landed-body outcomes.
 * @evidence contracts/development/testing.md#independent-expectations Targets and sequence come from docs/body/screenplay/kickboxing/010-the-round.md#p01-b01 and #p01-b02, not recorded output fixtures.
 * @evidence contracts/development/testing.md#distinguishing-cases Covers both attacking roles, the slip, forearm/head/body/high outcomes and native response timing in one continuous performance.
 * @evidence contracts/development/testing.md#execution-ownership Uses the actual in-memory case with shared coarse cast; retires all drawings in finally and runs neither browser nor dynamics nor whole-case physical audit.
 */
export function test_pressure_exchange(): void {
  const started: number = performance.now();
  const mounted = pressureCase(getFighter("owen"), getFighter("marek"), new Referee(), "kickboxing/catalog");
  const mountedAt: number = performance.now();
  const failures: string[] = [];
  try {
    const motion = mounted.motion;
    const segments = motion.performers.flatMap(person => motion.segments(person.subject).map(segment => ({
      subject: person.subject, id: segment.id, name: segment.name, entry: segment.entry,
      from: segment.start - mounted.preparation, to: segment.end - mounted.preparation,
      events: segment.plan.events.map(event => ({ name: event.name, at: segment.start + event.share * segment.plan.duration - mounted.preparation })),
    })));
    const hits = motion.hits().map(hit => ({
      actor: hit.actor, target: hit.target, actionIndex: hit.actionIndex,
      at: hit.time - mounted.preparation, bone: hit.bone, region: hit.region, point: hit.point,
    }));
    const contactsOf = (id: string): typeof hits => {
      const segment = segments.find(item => item.id === id);
      if (segment === undefined) { failures.push(`Missing ${id}`); return []; }
      return hits.filter(hit => hit.actionIndex === segment.entry).sort((a, b) => a.at - b.at);
    };
    const expectFirst = (id: string, bones: readonly string[]): void => {
      const actual = contactsOf(id)[0];
      if (actual === undefined || !bones.includes(actual.bone ?? ""))
        failures.push(`${id}: expected ${bones.join("/")}, got ${actual?.bone ?? "no contact"}`);
    };
    expectFirst("opening-jab", ["leftHand"]);
    expectFirst("opening-cross", ["leftHand", "rightHand", "leftLowerArm", "rightLowerArm"]);
    expectFirst("opening-low", ["leftLowerLeg"]);
    expectFirst("opening-counter", ["leftHand"]);
    if (contactsOf("pressure-probe").length > 0) failures.push("Owen's probe must pass outside Marek without contact");
    expectFirst("pressure-hook", ["rightLowerArm"]);
    expectFirst("pressure-cross", ["head", "jaw"]);
    expectFirst("pressure-high-jab", ["rightHand"]);
    expectFirst("pressure-body-cross", ["spine", "chest", "upperChest"]);
    expectFirst("pressure-high-hook", ["leftHand", "rightHand", "leftLowerArm", "rightLowerArm"]);
    for (const [reaction, strike] of [["pressure-head-reaction", "pressure-cross"], ["pressure-body-reaction", "pressure-body-cross"]] as const) {
      const response = segments.find(item => item.id === reaction);
      const contact = contactsOf(strike)[0];
      if (response === undefined || contact === undefined || response.from < contact.at - 1 / 30)
        failures.push(`${reaction}: missing or anticipates its actual contact`);
    }
    const decisions = motion.performers.flatMap(person => motion.segments(person.subject)
      .filter(segment => segment.name === "defend")
      .map(segment => ({ id: segment.id, subject: person.subject, decision: defend.decision(segment.plan) })));
    for (const item of decisions)
      if (item.decision === undefined || item.decision.warnings.length > 0)
        failures.push(`${item.subject}/${item.id}: ${item.decision?.warnings.join("; ") ?? "missing decision"}`);
    for (const at of [0, 5 - 1 / 30, 5, 5 + 1 / 30, 10, 12]) mounted.seek(at);
    console.info("PRESSURE_ROUND " + JSON.stringify({ mountMs: mountedAt - started, readMs: performance.now() - mountedAt, duration: motion.duration, segments, hits, decisions, failures }));
  } finally { mounted.dispose(); }
  assert.deepEqual(failures, [], failures.join("\n"));
}
