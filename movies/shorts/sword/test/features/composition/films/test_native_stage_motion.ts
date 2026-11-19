import assert from "node:assert/strict";
import { HumanChain } from "@automovie/motions";

import { castActor } from "../../../../src/composition/shared/castActor";
import { nativeStageMotion } from "../../../../src/composition/shared/nativeStageMotion";

/**
 * Apply an admitted walk to a wardrobe actor and then pin one leg independently.
 * The SDK drives both ankles during the walk. A stage pin overrides only its
 * own ankle, and an unknown performer key is rejected.
 *
 * @evidence contracts/development/testing.md#execution-ownership The production unit launcher discovers this exported test_ function. The test builds one in-memory SDK performance and one Three.js actor without a browser or stage fixture.
 * @evidence contracts/development/testing.md#behavioral-verification Sample the walk, pose the actor, check both visible ankle endpoints and hold one to an explicit pin. This catches lost native limb mapping and a pin that replaces both ankles.
 * @evidence contracts/development/testing.md#independent-expectations The authored target points along world +X and sets a 90-degree heading. The installed SDK supplies the reference root transform for this adapter, and an independently authored pin gives the explicit position. The test neither reimplements gait nor judges its realism.
 * @evidence contracts/development/testing.md#distinguishing-cases Check the beginning, an interior time, the end, the same interior time again, one pinned side, the other side remaining native, and a missing performer. The production film test owns camera framing.
 * @evidence contracts/development/common.md#meaningful-documentation The comment identifies the walk, observable scene endpoints, the scope of a stage-pin override and the unknown-performer error.
 */
export function test_native_stage_motion(): void {
  const subject = "yard-witness";
  const base = { x: 2, y: 0, z: -1 };
  const stage = nativeStageMotion.compile({
    seed: "sword/native-stage-test",
    performers: [{
      subject,
      body: nativeStageMotion.wardrobeBody(1.76),
      at: base,
      yaw: 90,
      proficiency: { level: "trained" },
    }],
    composition: HumanChain.subject(subject)
      .walk({ to: { x: 4, y: 0, z: -1 }, face: 90 })
      .node,
  });
  const start = stage.sample(subject, 0);
  const middleAt = stage.performance.duration * 0.38;
  const middle = stage.sample(subject, middleAt);
  const end = stage.sample(subject, stage.performance.duration);

  assert.ok(middle.position.x > start.position.x);
  assert.ok(end.position.x > middle.position.x);
  const nativeEnd = stage.performance.pose(subject, stage.performance.duration).root?.translation;
  assert.ok(nativeEnd);
  assert.ok(Math.hypot(end.position.x - nativeEnd.x, end.position.y - nativeEnd.y, end.position.z - nativeEnd.z) < 1e-12);
  assert.ok(Math.abs(end.headingRadians - Math.PI / 2) < 1e-12);
  assert.ok(middle.leftFoot.every(Number.isFinite));
  assert.notDeepEqual(middle.leftFoot, start.leftFoot);
  assert.ok(middle.points.has("leftLowerLeg"));
  assert.deepEqual(stage.sample(subject, middleAt).leftFoot, middle.leftFoot);
  assert.throws(() => stage.sample("missing-performer", middleAt), /Unknown performer/);

  const figure = castActor({
    name: subject, height: 1.76, hair: 0x3c312c, skin: 0x967359, tunic: 0x7b7564,
  });
  figure.pose({ nativeLegs: middle });
  assert.deepEqual(figure.leftFoot.position.toArray(), middle.leftFoot);
  assert.deepEqual(figure.rightFoot.position.toArray(), middle.rightFoot);
  const verdictFoot = [0.2, 0.07, 0.3] as const;
  figure.pose({ nativeLegs: middle, leftLeg: verdictFoot });
  assert.deepEqual(figure.leftFoot.position.toArray(), verdictFoot);
  assert.deepEqual(figure.rightFoot.position.toArray(), middle.rightFoot);
}
