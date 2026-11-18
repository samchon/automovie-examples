import assert from "node:assert/strict";
import { HumanVerdicts } from "@automovie/motions";

import { fighterCase } from "../../../src/composition/scenes/catalog/fighter/fighterCase";
import { getFighter } from "../../helpers/getFighter";

/**
 * Inspect both actual catalog guard compositions against the vocabulary's
 * physical bounds, gathering both cast variants before reporting a failure.
 * Cast mass and identity are checked independently in test_cast_and_ring.
 * The case's pictures remain a separate required observation.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names both cast cases, the native bound report, shared preparation and the separate visual requirement.
 * @evidence contracts/development/testing.md#behavioral-verification Runs the exact catalog compositions and rejects every reported physical bound failure from both bodies; a constructor or cleanup failure is retained too.
 * @evidence contracts/development/testing.md#independent-expectations Uses the motion package's documented bound limits rather than values observed from this production; the independent body facts are checked by test_cast_and_ring.
 * @evidence contracts/development/testing.md#distinguishing-cases Both cast identities receive their actual canonical body and seeded guard, including entry and held support over the whole two-second case.
 * @evidence contracts/development/testing.md#execution-ownership An in-memory composition check through the real case module; no browser, rendered picture, external service or mock is involved. getFighter shares each expensive body across tests.
 */
export function test_fighter_guard(): void {
  const failures: string[] = [];
  for (const subject of ["owen", "marek"] as const) {
    let mounted: ReturnType<typeof fighterCase> | undefined;
    try {
      mounted = fighterCase(getFighter(subject), `kickboxing/catalog/${subject}`);
      const report: HumanVerdicts.IReport = HumanVerdicts.of(mounted.motion, 30, { from: 0, to: 2 });
      if (!report.clean)
        failures.push(`${subject}: ${HumanVerdicts.describe(report)}`);
    } catch (error) {
      failures.push(`${subject}: ${String(error)}`);
    } finally {
      try { mounted?.dispose(); }
      catch (error) { failures.push(`${subject} cleanup: ${String(error)}`); }
    }
  }
  assert.deepEqual(failures, [], failures.join("\n"));
}
