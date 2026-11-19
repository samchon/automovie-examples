import assert from "node:assert/strict";
import { PerspectiveCamera, Vector3 } from "three";

import { yardCamera } from "../../../../src/composition/scenes/the-better-seat/010-household-yard/yardCamera";

/**
 * Exercise the scene camera on both sides of its first cut and the held landing,
 * then check the foot detail and the shared final framing on a 24 fps clock.
 * Seeking back to the start of the sequence restores the same view.
 *
 * @evidence contracts/development/testing.md#execution-ownership The production unit launcher discovers this exported test_ function. It uses in-memory Three.js camera coordinates. Film playback and render review are separate.
 * @evidence contracts/development/testing.md#behavioral-verification Seek the production camera, check its cut and hold, project four authored points, then seek backwards. The assertions check the relative position and screen bounds of those marks.
 * @evidence contracts/development/testing.md#independent-expectations The approved scene establishes the two boot positions and the final bench and saddle marks. Their screen bounds provide framing expectations independent of the camera curve. The picture review checks visibility of the mounted figures and their gestures.
 * @evidence contracts/development/testing.md#distinguishing-cases Compare the last frame before the ring cut with its first frame, then two adjacent frames of the continuous beat. Also check the closer boot detail, the wide closing view and a backwards seek.
 * @evidence contracts/development/common.md#meaningful-documentation The comment names the authored 24 fps clock and explains the cut, hold, usable framing and repeated-seek cases.
 */
export function test_the_better_seat(): void {
  const fps = 24;
  const camera = new PerspectiveCamera(36, 16 / 9, 0.035, 46);
  yardCamera(camera, 359 / fps);
  const beforeCut = camera.position.clone();
  yardCamera(camera, 360 / fps);
  assert.ok(camera.position.distanceTo(beforeCut) > 0.45);

  yardCamera(camera, 815 / fps);
  const landing = camera.position.clone();
  yardCamera(camera, 816 / fps);
  assert.ok(camera.position.distanceTo(landing) < 0.01);

  yardCamera(camera, 35.7);
  camera.updateMatrixWorld(true);
  const outsideFoot = new Vector3(1.76, 0.074, 0.04).project(camera);
  const insideFoot = new Vector3(1.20, 0.074, -0.264).project(camera);
  assert.ok(insideFoot.x < outsideFoot.x && outsideFoot.x - insideFoot.x > 0.22);
  assert.ok(Math.abs(insideFoot.x) < 0.9 && Math.abs(outsideFoot.x) < 0.9);

  // The closing gesture must share the view with Martin and the bench.
  yardCamera(camera, 56.5);
  camera.updateMatrixWorld(true);
  const benchedMartin = new Vector3(-1.15, 1.1, 0.61).project(camera);
  const carriedSaddle = new Vector3(3.55, 1.35, -2.30).project(camera);
  assert.ok(benchedMartin.x > -0.95 && benchedMartin.x < 0);
  assert.ok(carriedSaddle.x > 0 && carriedSaddle.x < 0.95);
  assert.ok(Math.abs(benchedMartin.y) < 0.8);
  assert.ok(Math.abs(carriedSaddle.y) < 0.8);

  yardCamera(camera, 359 / fps);
  assert.ok(camera.position.distanceTo(beforeCut) < 1e-12);
}
