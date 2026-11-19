import assert from "node:assert/strict";
import { Group, Mesh, Scene, Vector3, type Object3D } from "three";

import { performanceAt } from "../../../../../../src/composition/scenes/kickboxing/020-the-round/performanceAt";
import { ArtDepartment } from "../../../../../../src/shared/ArtDepartment";
import { roundFloor } from "../../../../../../src/shared/roundFloor";
import { createActor } from "../../../../../../src/entities/cast/roundCast/createActor";

const groups = (object: Object3D) => object.children.filter((child): child is Group => child instanceof Group);

function surface(root: Object3D, descendants = true): Vector3[] {
  const output: Vector3[] = [];
  function visit(node: Object3D): void {
    if (!(node instanceof Mesh)) return;
    const positions = node.geometry.getAttribute("position");
    for (let index = 0; index < positions.count; index++) {
      output.push(new Vector3().fromBufferAttribute(positions, index).applyMatrix4(node.matrixWorld));
    }
  }
  if (descendants) root.traverse(visit);
  else root.children.forEach(visit);
  assert.ok(output.length > 0);
  return output;
}

function clearance(points: Vector3[]): number {
  return Math.min(...points.map((point) => point.y)) - roundFloor.canvasWorldY;
}

function horizontalDistance(first: Vector3[], second: Vector3[]): number {
  let nearest = Number.POSITIVE_INFINITY;
  for (const a of first) {
    for (const b of second) nearest = Math.min(nearest, Math.hypot(a.x - b.x, a.z - b.z));
  }
  return nearest;
}

/**
 * Checks the realized canvas contact, body support and official separation in Edition 020's continuous ending.
 *
 * Its expected actions come from [the landing](../../../../../../docs/body/screenplay/kickboxing/020-the-round.md#p11-b01), [the count](../../../../../../docs/body/screenplay/kickboxing/020-the-round.md#p11-b03) and [the ending hold](../../../../../../docs/body/screenplay/kickboxing/020-the-round.md#p12-b03).
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the displayed contact, support and clearance checked at programme seconds.
 * @evidence contracts/development/testing.md#behavioral-verification Poses the actual cast and reads displayed geometry independently of the floor solver. A floating resting pose, limb penetration or official obstruction fails this check.
 * @evidence contracts/development/testing.md#independent-expectations The expected touch clock and settled body follow the signed screenplay. The test transforms actual drawn vertices and compares them to the canvas plane independently of the solver's private heights.
 * @evidence contracts/development/testing.md#distinguishing-cases Covers the two adjacent encoded samples, the exact source contact between them, the rise attempt and the final supported hold. The returned cut's below-floor leg and arm fail the same assertions.
 * @evidence contracts/development/testing.md#execution-ownership A portable in-memory unit discovered by test/index.ts. The GPU host and actual picture read are separate production checks.
 */
export function test_round_landing(): void {
  const scene = new Scene();
  const art = new ArtDepartment();
  const marek = createActor("marek", art, scene);
  const daniel = createActor("daniel", art, scene);
  const pelvis = groups(marek.root)[0]!;
  const [torso, rightLeg] = groups(pelvis);
  const head = groups(torso!)[0]!;
  const [, officialRight, officialLeft] = groups(groups(daniel.root)[0]!);

  function seek(frame: number): void {
    const seconds = frame / 30;
    const pose = performanceAt(seconds).people;
    marek.apply(pose.marek, seconds);
    daniel.apply(pose.daniel, seconds);
    scene.updateMatrixWorld(true);
  }

  try {
    seek(4519);
    assert.ok(clearance(surface(marek.root)) > .003, "The earliest encoded sample stays just clear of the mat.");
    seek(4519.5);
    assert.ok(Math.abs(clearance(surface(rightLeg!, false))) < .001, "The right thigh meets the mat at the authored instant.");
    seek(4520);
    assert.ok(clearance(surface(marek.root)) >= -.001, "The next encoded sample contains no submerged limb.");

    seek(4830);
    assert.ok(clearance(surface(head)) > .20, "Marek lifts his head during his attempt to rise.");
    assert.ok(clearance(surface(rightLeg!, false)) < .05, "The bearing thigh remains close to the canvas.");

    seek(5398);
    assert.ok(Math.abs(clearance(surface(marek.root))) < .001, "At the end the draw has an actual bearing surface.");
    assert.ok(clearance(surface(head)) < .10 && clearance(surface(torso!, false)) < .030);
    assert.ok(clearance(surface(pelvis, false)) < .055);
    const lowShoes = [...surface(officialRight!), ...surface(officialLeft!)].filter((point) => point.y < .22);
    assert.ok(lowShoes.length > 0 && horizontalDistance(surface(head), lowShoes) > .30);
  } finally {
    marek.dispose();
    daniel.dispose();
    art.dispose();
  }
}
