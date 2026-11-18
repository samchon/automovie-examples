import assert from "node:assert/strict";

import { Fighter } from "../../../src/entities/cast/fighter/Fighter";
import { Ring } from "../../../src/entities/sets/ring/Ring";
import { getFighter } from "../../helpers/getFighter";

/**
 * Preserve the commission's equal bodies and named ring geography at their
 * production consumers, before motion or rendering can conceal a mismatch.
 *
 * Scenarios: both cast identities have an 80 kg body plus two 10 oz gloves; red is
 * southwest, blue northeast, the neutral corners occupy the other diagonals,
 * and the archetype canvas is placed on the performance's zero-height floor.
 * This does not test Human's own geometry or establish any visual result.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the independent commissioned expectations, consumer and unverified visual boundary.
 * @evidence contracts/development/testing.md#behavioral-verification Constructs the actual cast and set entities and checks their profiles and landmarks; a wrong mass, identity, diagonal or canvas placement fails.
 * @evidence contracts/development/testing.md#independent-expectations Mass and corner orientation come from docs/instructions/commission.md#fighters and docs/body/screenplay/kickboxing/010-the-round.md#p01; floor zero is the chosen canonical performance frame, not a copied observed output.
 * @evidence contracts/development/testing.md#distinguishing-cases Checks both fighters, both coloured and both neutral corners, the centre and actual canvas/platform relation. Pose, contacts and pictures belong to catalog review.
 * @evidence contracts/development/testing.md#execution-ownership A pure in-memory unit test under test/index.ts; it creates no browser, renderer or media. Each of the two bodies is prepared once in this run.
 */
export function test_cast_and_ring(): void {
  const owen: Fighter = getFighter("owen");
  const marek: Fighter = getFighter("marek");
  const equippedMass = 80 + 20 * 0.028349523125;
  assert.ok(Math.abs(owen.body.profile.mass - equippedMass) < 1e-9);
  assert.ok(Math.abs(marek.body.profile.mass - equippedMass) < 1e-9);
  assert.equal(owen.performer({ x: 0, y: 0, z: 0 }, 90).subject, "owen");
  assert.equal(marek.performer({ x: 0, y: 0, z: 0 }, -90).subject, "marek");

  const ring: Ring = new Ring("kickboxing/cast-and-ring");
  assert.deepEqual(ring.landmarks.centre, { x: 0, y: 0, z: 0 });
  assert.ok(ring.landmarks.red.x < 0 && ring.landmarks.red.z > 0);
  assert.ok(ring.landmarks.blue.x > 0 && ring.landmarks.blue.z < 0);
  assert.ok(
    ring.landmarks.neutralNorthwest.x < 0 &&
      ring.landmarks.neutralNorthwest.z < 0,
  );
  assert.ok(
    ring.landmarks.neutralSoutheast.x > 0 &&
      ring.landmarks.neutralSoutheast.z > 0,
  );
  assert.equal(ring.origin.y + (ring.model.dimensions.platform ?? NaN), 0);
}
