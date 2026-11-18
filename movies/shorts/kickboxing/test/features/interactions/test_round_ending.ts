import type { IAutoMovieSchedule } from "@automovie/engine";
import { HumanPerformance } from "@automovie/motions";
import assert from "node:assert/strict";

import { Fighter } from "../../../src/entities/cast/fighter/Fighter";
import { Referee } from "../../../src/entities/cast/referee/Referee";
import { Ring } from "../../../src/entities/sets/ring/Ring";
import { RoundEnding } from "../../../src/interactions/kickboxing/RoundEnding";
import { RoundPerformance } from "../../../src/interactions/kickboxing/RoundPerformance";

/**
 * Admit the complete ending against the commissioned clock from a bounded
 * northwest approach. The actual whole-film entry is checked by generation;
 * this isolated case tests the native transitions and every count together.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the isolated entry and distinction from whole-film verification.
 * @evidence contracts/development/testing.md#independent-expectations The commission fixes contact150, neutral compliance157, strokes158–167 and celebration168.1; measured native schedule entries are compared to those instants.
 * @evidence contracts/development/testing.md#behavioral-verification Resolves the native ending and checks arrival, all ten stroke events, the finishing impact cue and finite displayed roots; refused or mistimed composition fails.
 * @evidence contracts/development/testing.md#execution-ownership Runs native in-memory semantics through the exported unit, without a browser, GPU, external process or generated artifact.
 * @evidence contracts/development/testing.md#distinguishing-cases Resolves the whole ending, accumulates all anchor errors and samples every second through180, without claiming physical or visual quality.
 */
export function test_round_ending(): void {
  const owen: Fighter = new Fighter("owen", 0xb94439);
  const marek: Fighter = new Fighter("marek", 0x3978bc);
  const daniel: Referee = new Referee();
  const ring: Ring = new Ring("kickboxing/film");
  const input: HumanPerformance.IInput = new RoundPerformance(owen, marek, daniel, ring).input("kickboxing/film");
  const motion: HumanPerformance = new HumanPerformance({
    ...input,
    performers: [
      owen.performer({ x: ring.zones.northwest.x - 0.8, y: 0, z: ring.zones.northwest.z }, 90),
      marek.performer({ x: ring.zones.northwest.x + 0.8, y: 0, z: ring.zones.northwest.z }, -90),
      daniel.performer({ x: ring.zones.northwest.x, y: 0, z: ring.zones.northwest.z - 0.9 }, 0),
    ],
    composition: new RoundEnding(owen, marek, daniel, ring).compose(),
  });
  const errors: string[] = [];
  const walk: IAutoMovieSchedule.IEntry | undefined = motion.schedule.entries.find(entry => entry.intent.anchor === "neutral-walk");
  if (walk === undefined || Math.abs(walk.end - 158) > 0.001) errors.push(`Neutral arrival at ${walk?.end}, expected native158/picture157`);
  const counts: readonly IAutoMovieSchedule.IEntry[] = motion.schedule.entries.filter(entry => entry.subject === "daniel" && entry.intent.anchor?.startsWith("count-") === true);
  if (counts.length !== 10) errors.push(`Count has ${counts.length} strokes, expected10`);
  for (const [index, entry] of counts.entries()) {
    const stroke: number | undefined = entry.events?.find(event => event.name === "strokeEnd")?.seconds;
    if (stroke === undefined || Math.abs(stroke - (159 + index)) > 0.001) errors.push(`Count${index + 1} stroke at ${stroke}, expected native${159 + index}`);
  }
  const contact: number | undefined = motion.schedule.entries.find(entry => entry.intent.anchor === "finish-high")?.events?.find(event => event.name === "impact")?.seconds;
  if (contact === undefined || Math.abs(contact - 151) > 0.001) errors.push(`High kick contact at ${contact}, expected native151/picture150`);
  const result: number | undefined = motion.schedule.entries.find(entry => entry.intent.anchor === "result-signal")?.start;
  const celebration: number | undefined = motion.schedule.entries.find(entry => entry.intent.anchor === "winner-celebration")?.start;
  if (result === undefined || Math.abs(result - 168.6) > 0.001) errors.push(`Result signal begins at ${result}, expected native168.6/picture167.6`);
  if (celebration === undefined || Math.abs(celebration - 169.1) > 0.001) errors.push(`Celebration begins at ${celebration}, expected native169.1/picture168.1`);
  for (let seconds: number = 148; seconds <= 180; seconds++) for (const who of ["owen", "marek", "daniel"]) {
    const pose = motion.pose(who, seconds + 1);
    if (pose.root === null || !Object.values(pose.root.translation).every(Number.isFinite)) errors.push(`${who} has no finite root at ${seconds}`);
  }
  console.info(JSON.stringify({ stage: "ending", duration: motion.duration, entries: motion.schedule.entries, errors }));
  assert.deepEqual(errors, []);
}
