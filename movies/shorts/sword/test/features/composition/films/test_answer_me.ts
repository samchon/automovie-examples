import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { answerMe } from "../../../../src/composition/films/answer-me";

/**
 * Exercises the public Answer Me film factory and checks semantic positions and
 * visibility across the six beats, including out-of-order frame seeks.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the production entry, the seek operation and the script-visible state being checked.
 * @evidence contracts/development/testing.md#behavioral-verification Checks the delivery profile, coin visibility, mounted separation, continuous dismount, muzzle proximity, sleeve grip with separate palms, release before the swing, gate clearance, changing foot support and the closing separation. An out-of-order seek must reproduce the final nose position.
 * @evidence contracts/development/testing.md#independent-expectations Story direction and order come from docs/body/screenplay/answer-me/010-breeding-yard-road.md#road and its six beats. The delivery settings come from docs/acceptance/answer-me.md. The clearance probe measures the built gate. The support check measures the boot sole against ground level. Geometric tolerances check staged proximity and continuity. Shot legibility and sound are reviewed in production acceptance.
 * @evidence contracts/development/testing.md#distinguishing-cases Includes the coin before and after concealment, the grip held and released, shut and open gate, unchanged support within a stride and different support later, and a repeated late seek after an early one. Whole-cut frame and audio review belong to production acceptance.
 * @evidence contracts/development/testing.md#execution-ownership The production unit runner discovers test_answer_me. It creates the real scene graph and native motion in memory using installed libraries; no browser, audio playback, clock or renderer participates. A finally block disposes the production.
 */
export async function test_answer_me(): Promise<void> {
  const film = answerMe();
  assert.deepEqual(
    [film.durationSeconds, film.fps, film.width, film.height],
    [60, 24, 1280, 720],
  );
  const production = await film.create();
  try {
    const find = (name: string) => {
      const subject = production.scene.getObjectByName(name);
      assert.ok(subject, name);
      return subject;
    };
    const mare = find("mare"), grey = find("grey"), remy = find("remy"), luc = find("luc");
    for (const time of [10, 20, 25.5, 31, 35]) {
      production.seek(time);
      assert.ok(mare.position.x > grey.position.x);
      assert.ok(remy.position.y > 1.2);
      assert.ok(luc.position.y > 1.2);
    }
    for (const [rider, start, end] of [[luc, 43.75, 46.5], [remy, 47.2, 49.52]] as const) {
      production.seek(start);
      let previous = rider.position.clone();
      for (let time = start + 1/24; time <= end; time += 1/24) {
        production.seek(time);
        assert.ok(previous.distanceTo(rider.position) < 0.14, `${rider.name} moves continuously at ${time.toFixed(3)} s`);
        previous = rider.position.clone();
      }
    }
    production.seek(48);
    const foal = find("foal");
    const nose = (animal: typeof mare) =>
      animal.getObjectByName("nose contact")!.getWorldPosition(new Vector3());
    assert.ok(nose(mare).distanceTo(nose(foal)) < 0.26);
    const gate = find("breeding-yard gate");
    const coin = find("muster coin");
    production.seek(2.4);
    assert.ok(coin.visible);
    production.seek(2.8);
    assert.ok(!coin.visible);
    production.seek(53);
    assert.ok(Math.abs(gate.rotation.y) < 0.02);
    const closedGate = new Box3().setFromObject(gate, true);
    const railStart = closedGate.min.x - gate.position.x;
    const railEnd = closedGate.max.x - gate.position.x;
    const lucFist = luc.getObjectByName("right palm")!;
    const remyPalm = remy.getObjectByName("left palm")!;
    const remySleeve = remy.getObjectByName("upper sleeve grip")!;
    const world = (subject: typeof mare) => subject.getWorldPosition(new Vector3());
    production.seek(51.25);
    assert.ok(world(lucFist).distanceTo(world(remySleeve)) < 0.065);
    assert.ok(world(lucFist).distanceTo(world(remyPalm)) > 0.22);
    production.seek(53.5);
    assert.ok(world(lucFist).distanceTo(world(remySleeve)) > 0.12);
    for (let frame = 1317; frame <= 1350; frame++) {
      production.seek(frame / film.fps);
      const foalInGateFrame = gate.worldToLocal(foal.position.clone());
      const nearestRail = Math.min(railEnd, Math.max(railStart, foalInGateFrame.x));
      assert.ok(Math.hypot(foalInGateFrame.x - nearestRail, foalInGateFrame.z) > 0.56, `foal clears the moving gate in frame ${frame}`);
    }
    const leftAnkle = remy.getObjectByName("left ankle")!;
    const rightAnkle = remy.getObjectByName("right ankle")!;
    const soleHeight = (ankle: typeof leftAnkle) =>
      new Box3().setFromObject(ankle, true).min.y;
    production.seek(1408 / film.fps);
    const planted = world(rightAnkle);
    assert.ok(Math.abs(soleHeight(rightAnkle)) < 0.02);
    assert.ok(world(leftAnkle).y > planted.y + 0.06);
    production.seek(1410 / film.fps);
    assert.ok(planted.distanceTo(world(rightAnkle)) < 0.02);
    production.seek(1424 / film.fps);
    assert.ok(Math.abs(soleHeight(leftAnkle)) < 0.02);
    const remyRight = remy.getObjectByName("right palm")!;
    const purse = remy.getObjectByName("belt purse")!;
    assert.ok(world(remyRight).distanceTo(world(purse)) < 0.065);
    production.seek(59.9);
    assert.ok(gate.rotation.y > 1.45);
    assert.ok(mare.position.z < -2.32 && foal.position.z < -2.32);
    assert.ok(grey.position.z > -2.32 && luc.position.z > -2.32);
    assert.ok(remy.position.x > luc.position.x + 5);
    assert.equal(remy.position.y, 0);
    const last = nose(mare);
    production.seek(2);
    production.seek(59.9);
    assert.ok(last.distanceTo(nose(mare)) < 1e-9);
  } finally {
    production.dispose();
  }
}
