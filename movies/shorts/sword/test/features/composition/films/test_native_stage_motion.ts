import assert from "node:assert/strict";
import { HumanChain } from "@automovie/motions";

import { castActor } from "../../../../src/composition/shared/castActor";
import { nativeStageMotion } from "../../../../src/composition/shared/nativeStageMotion";

/** Drive a wardrobe figure's stage targets from an installed, admitted walk. */
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
  assert.deepEqual(end.position, stage.performance.pose(subject, stage.performance.duration).root?.translation);
  // The native walk settles its root behind the destination mark over the last support foot.
  assert.ok(Math.abs(end.position.x - 4) < 0.06);
  assert.ok(Math.abs(end.headingRadians - Math.PI / 2) < 0.03);
  assert.ok(middle.leftFoot.every(Number.isFinite));
  assert.notDeepEqual(middle.leftFoot, start.leftFoot);
  assert.ok(middle.points.has("leftLowerLeg"));
  assert.deepEqual(stage.sample(subject, middleAt).leftFoot, middle.leftFoot);

  const figure = castActor({
    name: subject, height: 1.76, hair: 0x3c312c, skin: 0x967359, tunic: 0x7b7564,
  });
  figure.pose({ nativeLegs: middle });
  assert.deepEqual(figure.leftFoot.position.toArray(), middle.leftFoot);
  assert.deepEqual(figure.rightFoot.position.toArray(), middle.rightFoot);
  const verdictFoot = [0.2, 0.07, 0.3] as const;
  figure.pose({ nativeLegs: middle, leftLeg: verdictFoot });
  assert.deepEqual(figure.leftFoot.position.toArray(), verdictFoot);
}
