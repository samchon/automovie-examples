import assert from "node:assert/strict";

import { gameAt } from "../../../src/composition/scenes/two-hands/010-game/game";

/**
 * Check the deterministic game sampler's ledger, routes and contact marks.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Exposes one production unit test. Points are metres and cue times are programme seconds. Coverage is limited to gameAt output.
 * @evidence contracts/development/testing.md#behavioral-verification Checks score and clock, the twelve-member roster and finite coordinates, ball and actor equality at 168 replay samples, two shared bench targets and 0.30 m root separation at 4,320 output instants.
 * @evidence contracts/development/testing.md#independent-expectations Clock and score expectations come from docs/body/screenplay/two-hands/010-game.md#east-basket, #timeout, #one-point and #last-board. docs/research/basketball/period-and-play.md#floor supplies the 6.25 m arc. Contact assertions compare the authored marks with the ball, glass and tube dimensions.
 * @evidence contracts/development/testing.md#distinguishing-cases Includes an invalid seek, unsorted valid seeks, both boundaries of the replay, a held clock, the final sampled clock and checks before and after bank contact. Root separation and hand targets are sampled model data.
 * @evidence contracts/development/testing.md#execution-ownership test/index.ts discovers test_game through pnpm run test. Picture reviewers inspect the cut, visible fingers and ball in the rendered output.
 */
export function test_game(): void {
  const rim = 12.425;
  const scoreAt = (time: number): number[] => {
    const { home, away, remaining } = gameAt(time);
    return [home, away, remaining];
  };
  assert.deepEqual(scoreAt(0), [48,50,109]);
  assert.deepEqual(scoreAt(25-1/24), [48,50,85]);
  assert.deepEqual(scoreAt(25), [50,50,84]);
  assert.deepEqual(scoreAt(52), [50,52,57]);
  for (const t of [65, 69, 83, 89.95, 119, 129, 136])
    assert.deepEqual(scoreAt(t), [50,52,44]);
  assert.deepEqual(scoreAt(137), [50,52,43]);
  assert.deepEqual(scoreAt(152), [53,52,28]);
  assert.deepEqual(scoreAt(179), [53,52,1]);
  assert.deepEqual(scoreAt(180-1/24), [53,52,0]);
  assert.deepEqual(scoreAt(180), [53,52,0]);
  assert.throws(() => gameAt(NaN), RangeError);
  for (const [time,expected] of [[28,30],[51,7],[55,30],[65,20],[106,20],[136,20],[151,5],[155,30],[177,8],[179,30]])
    assert.equal(gameAt(time).attack,expected);
  assert.equal(gameAt(152).attack,null);

  for (let n = 0; n < 7*24; n++) {
    const t = 83+n/24;
    const aired = gameAt(t);
    const original = gameAt(t-65);
    assert.equal(aired.replay, true);
    assert.deepEqual(aired.players, original.players);
    assert.deepEqual(aired.ball, original.ball);
  }
  assert.equal(gameAt(83-1/24).replay, false);
  assert.equal(gameAt(90).replay, false);
  const roster=["w7","w11","w14","w4","w10","b4","b5","b7","b8","b9","ref","ref2"].sort((a,b)=>a.localeCompare(b));
  for (const t of [180,150.7,0,23.38,65.1,104.4,178.99]) {
    const f=gameAt(t);
    assert.deepEqual(Object.keys(f.players).sort((a,b)=>a.localeCompare(b)),roster);
    for(const actor of Object.values(f.players))
      assert.ok([actor.x,actor.y,actor.z,actor.yaw,actor.phase].every(Number.isFinite));
    assert.ok(f.ball.every(Number.isFinite));
  }
  for (const t of [23.38,48.91,146.3]) assert.ok(Math.abs(gameAt(t).ball[1]-0.12)<1e-8);
  assert.deepEqual(gameAt(24.84).ball,[rim,3.05,0]);
  assert.ok(gameAt(25-1/24).ball[1]<2.85);
  assert.equal(gameAt(25-1/24).players.w4.action,"dunk");
  const bank = gameAt(51.53).ball;
  assert.ok(Math.abs(bank[0] - (-12.8 + 0.065 / 2 + 0.12095775674984047)) < 1e-8);
  assert.equal(bank[1], 3.41);
  assert.ok(gameAt(51.49).ball[0] > bank[0] && gameAt(51.57).ball[0] > bank[0]);
  assert.ok(gameAt(65).ball[2]>7.5);
  const high=gameAt(94.5).players, low=gameAt(106).players;
  assert.deepEqual(high.b4.target,high.b7.target);
  assert.deepEqual(low.b4.target,low.b8.target);
  assert.ok(high.b4.target![1]>low.b4.target![1]);
  assert.equal(low.b8.seated,true);
  assert.equal(low.b4.seated,false);
  assert.ok(gameAt(135.5).players.w14.z>7.5);

  const first=gameAt(23).players, second=gameAt(147).players;
  assert.ok(first.b7.z>5.5 && first.b5.z<0);
  assert.ok(second.b7.z<second.w4.z && second.w14.z>6.25);
  assert.equal(second.w4.x,gameAt(149).players.w4.x);
  assert.equal(second.w4.z,gameAt(149).players.w4.z);
  assert.ok(gameAt(150).players.w4.z<second.w4.z);
  const shooter=gameAt(151).players.w14;
  assert.ok(Math.hypot(shooter.x-rim,shooter.z)>6.25);
  assert.deepEqual(gameAt(151.87).ball,[rim,3.05,0]);
  assert.equal(gameAt(177).players.w4.action,"boxout");
  const hit = gameAt(178).ball;
  assert.equal(hit[0], -12.62);
  const offTubeAxis = Math.hypot(hit[0] + rim, hit[2]) - 0.226;
  assert.ok(Math.abs(Math.hypot(offTubeAxis, hit[1] - 3.05) - (0.12095775674984047 + 0.022)) < 1e-8);
  const board=gameAt(179);
  assert.ok(Math.hypot(board.ball[0]-board.players.w10.x,board.ball[2]-board.players.w10.z)<0.2);
  assert.ok(board.players.w10.y>0.35 && gameAt(180).players.w10.y===0);
  assert.ok(gameAt(180).ball[1]<1.4);
  assert.ok(gameAt(180).ball[0]<gameAt(180).players.w10.x-0.24);

  // Measure root separation on the delivery clock. Articulated clearance is assessed in the picture review.
  for (let frame=0;frame<180*24;frame++) {
    const actors=Object.values(gameAt(frame/24).players);
    for (let i=0;i<actors.length;i++) for (let j=i+1;j<actors.length;j++) {
      const a=actors[i], b=actors[j];
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)>0.30,`Overlapping roots at output frame ${frame}`);
    }
  }
}
