import assert from "node:assert/strict";
import { theLastCarry } from "../../../src/composition/films/the-last-carry";
import { processionDistance } from "../../../src/composition/scenes/the-last-carry/ValleyLane";

/** Check the native-driven cast, fixed wide and final transfer independently of seek order. */
export async function test_last_carry_procession(): Promise<void> {
  const film = theLastCarry();
  assert.equal(film.durationSeconds * film.fps, 1440);
  assert.equal(processionDistance(29), processionDistance(24));
  assert.ok(processionDistance(36) > processionDistance(32));
  assert.ok(processionDistance(51) - 0.92 > 12);
  const production = await film.create();
  try {
    const observed = (seconds: number): number[] => {
      production.seek(seconds);
      return [...production.camera.position.toArray(), ...production.camera.quaternion.toArray()];
    };
    const first = observed(57.5);
    observed(1);
    assert.deepEqual(observed(57.5), first);
    assert.notDeepEqual(observed(37), first);
    assert.deepEqual(observed(34), observed(45));

    const denis = production.scene.getObjectByName("denis");
    const boot = denis?.getObjectByName("left-boot");
    const coat = production.scene.getObjectByName("right-coat-shoulder");
    const colin = production.scene.getObjectByName("colin");
    const fingers = colin?.getObjectByName("right-pinch");
    const sliver = production.scene.getObjectByName("Sliver from the carrying pole");
    assert.ok(denis && boot && coat && colin && fingers && sliver);
    production.seek(0);
    const standingBoot = boot.position.clone();
    production.seek(82 / film.fps);
    assert.ok(denis.userData.nativeSample.travel > 0.7);
    assert.ok(boot.position.distanceTo(standingBoot) > 0.03);
    production.seek(225 / film.fps);
    assert.ok(Math.abs(colin.userData.nativeSample.nod) > 0.01);
    production.seek(1333 / film.fps);
    assert.equal(denis.userData.nativeSample.touch.length, 3);

    const location = sliver.position.clone();
    const halfLength = 0.026;

    // The frame just before the sound cue keeps the sliver on the coat.
    production.seek(1360 / film.fps);
    const base = sliver.localToWorld(location.clone().set(0, -halfLength, 0));
    assert.ok(base.distanceTo(coat.getWorldPosition(location)) < 1e-8);

    // The following frame and the final hold take the sliver from the local grip.
    for (const frame of [1361, 1439]) {
      production.seek(frame / film.fps);
      const tip = sliver.localToWorld(location.clone().set(0, halfLength, 0));
      assert.ok(tip.distanceTo(fingers.getWorldPosition(location)) < 1e-8);
    }
  } finally {
    production.dispose();
  }
}
