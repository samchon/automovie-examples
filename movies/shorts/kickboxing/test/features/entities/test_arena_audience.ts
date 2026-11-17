import assert from "node:assert/strict";
import * as THREE from "three";
import { HumanPerformance } from "@automovie/motions";

import { ArenaAudience } from "../../../src/entities/crowds/arena/ArenaAudience";
import { Ring } from "../../../src/entities/sets/ring/Ring";

/**
 * The commissioned teams and timekeeper stay outside the fighting space;
 * only the red team rises after the result. Repeated seeking returns the
 * same native pose instead of advancing a playback-only background state.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States role, spatial and deterministic-seek checks with their actual native drawing.
 * @evidence contracts/development/testing.md#independent-expectations The commission fixes two attendants per coloured corner, one timekeeper, outside placement and the red team's closing response.
 * @evidence contracts/development/testing.md#behavioral-verification Exercises the actual native audience drawing through seated, standing and repeated seeks; a missing role, illegal placement or absent red-team rise fails.
 * @evidence contracts/development/testing.md#execution-ownership The exported unit uses in-memory native motion and Three objects, without a browser, renderer, GPU or external process.
 * @evidence contracts/development/testing.md#distinguishing-cases Mounts real native polygon people and occupied objects, seeks both sides of the result and re-seeks the opening before retiring everything.
 */
export function test_arena_audience(): void {
  const ring: Ring = new Ring("kickboxing/film");
  const audience: ArenaAudience = new ArenaAudience(ring.size, ring.origin.y);
  const motion: HumanPerformance = new HumanPerformance({ ...audience.input(), cues: { audience: [{ name: "result", seconds: 171.1 }] } });
  const drawing: ReturnType<ArenaAudience["drawing"]> = audience.drawing(motion, 3);
  try {
    const people: THREE.Object3D[] = drawing.object.children.filter(child => child.name.startsWith("arena/"));
    assert.equal(people.filter(person => person.name === "arena/red-team").length, 2);
    assert.equal(people.filter(person => person.name === "arena/blue-team").length, 2);
    assert.equal(people.filter(person => person.name === "arena/timekeeper").length, 1);
    assert.ok(people.some(person => person.name === "arena/crowd"));
    for (const person of people) assert.ok(Math.abs(person.position.x) > ring.size / 2 || Math.abs(person.position.z) > ring.size / 2, `${person.name} must stay outside the ropes`);
    drawing.seek(0);
    const opening: number[] = people.flatMap(person => new THREE.Box3().setFromObject(person).min.toArray());
    drawing.seek(176);
    const red: THREE.Object3D | undefined = people.find(person => person.name === "arena/red-team");
    const blue: THREE.Object3D | undefined = people.find(person => person.name === "arena/blue-team");
    assert.ok(red !== undefined && blue !== undefined);
    assert.ok(new THREE.Box3().setFromObject(red).max.y > new THREE.Box3().setFromObject(blue).max.y + 0.2, "The red attendants rise while blue stays seated");
    drawing.seek(0);
    assert.deepEqual(people.flatMap(person => new THREE.Box3().setFromObject(person).min.toArray()), opening);
  } finally { drawing.dispose(); }
}
