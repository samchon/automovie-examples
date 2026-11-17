import type { IAutoMovieMotion, IAutoMoviePose } from "@automovie/interface";
import { HumanPerformance } from "@automovie/motions";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { Fighter } from "../entities/cast/fighter/Fighter";
import { Referee } from "../entities/cast/referee/Referee";
import { Ring } from "../entities/sets/ring/Ring";
import { ArenaAudience } from "../entities/crowds/arena/ArenaAudience";
import type { INativeRound } from "../interactions/kickboxing/INativeRound";
import { RoundPerformance } from "../interactions/kickboxing/RoundPerformance";

/**
 * Compute native choreography once and retain the installed SDK's own clip
 * records for browser playback. This is an explicit generation command,
 * always recomputing; it is not a cache or an internal SDK optimization.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States actual native generation, retained provenance, frame grid and explicit regeneration.
 * @evidence contracts/development/implementation.md#principled-implementation Resolves native principal/background performances, samples principals at all5401 delivery points and the peripheral seated background at2Hz with30Hz closing motion, retaining native schedules and provenance.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Hash inputs, resolve once, sample each person, verify unchanged inputs and publish the derived clips and receipt.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No handcrafted keys, local motion solver, physical audit, suppressed refusal or time scaling.
 * @evidence contracts/development/implementation.md#efficient-algorithms One expensive resolution serves all samples and subsequent browser mounts; memory is bounded by three delivery-length native clips.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses the same RoundPerformance graph intended for the film; future SDK changes are picked up by rerunning this command.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Node file operations close their handles; no browser, server or worker is retained.
 */
export async function bakeRound(): Promise<void> {
  const root: string = process.cwd();
  const inputDigest: string = await digest(root);
  const started: number = performance.now();
  const owen: Fighter = new Fighter("owen", 0xb94439);
  const marek: Fighter = new Fighter("marek", 0x3978bc);
  const daniel: Referee = new Referee();
  const ring: Ring = new Ring("kickboxing/film");
  const round: RoundPerformance = new RoundPerformance(owen, marek, daniel, ring, process.argv.includes("--official-pointing"), process.argv.includes("--official-arm-count"));
  console.info(JSON.stringify({ stage: "resolve", inputDigest, started: new Date().toISOString() }));
  const motion: HumanPerformance = round.resolve("kickboxing/film");
  const resolvedMilliseconds: number = performance.now() - started;
  console.info(JSON.stringify({ stage: "resolved", milliseconds: resolvedMilliseconds, duration: motion.duration }));
  console.info(JSON.stringify({ stage: "resolve-audience" }));
  const victory: number | undefined = motion.schedule.entries.find(entry => entry.intent.anchor === "winner-celebration")?.start;
  if (victory === undefined) throw new Error("The native round has no winner celebration cue");
  const audienceMotion: HumanPerformance = new HumanPerformance({
    ...new ArenaAudience(ring.size, ring.origin.y).input(),
    cues: { audience: [{ name: "result", seconds: victory - round.preparation + 3 }] },
  });
  const audience: Record<string, IAutoMovieMotion> = Object.fromEntries(audienceMotion.performers.map(person => [person.subject, { id: `kickboxing/${person.subject}`, skeleton: person.body.skeleton.id, duration: 180, loop: false, keyframes: [] }]));
  console.info(JSON.stringify({ stage: "resolved-audience", elapsedMilliseconds: performance.now() - started }));
  const clips: INativeRound["clips"] = {
    owen: { id: "kickboxing/owen", skeleton: owen.body.skeleton.id, duration: 180, loop: false, keyframes: [] },
    marek: { id: "kickboxing/marek", skeleton: marek.body.skeleton.id, duration: 180, loop: false, keyframes: [] },
    daniel: { id: "kickboxing/daniel", skeleton: daniel.body.skeleton.id, duration: 180, loop: false, keyframes: [] },
  };
  for (let frame: number = 0; frame <= 5400; frame++) {
    const seconds: number = frame / 30;
    for (const subject of ["owen", "marek", "daniel"] as const) {
      const pose: IAutoMoviePose = motion.pose(subject, seconds + round.preparation);
      const clip: IAutoMovieMotion = clips[subject];
      clip.keyframes.push({ time: seconds, pose, expression: null, easing: "linear", bezier: null });
    }
    if (frame % 15 === 0 || (seconds >= 167 && seconds <= 178)) for (const [subject, clip] of Object.entries(audience)) {
      clip.keyframes.push({ time: seconds, pose: audienceMotion.pose(subject, seconds + 3), expression: null, easing: "linear", bezier: null });
    }
    if (frame % 300 === 0) console.info(JSON.stringify({ stage: "sample", frame, frames: 5401, seconds, elapsedMilliseconds: performance.now() - started }));
  }
  if (inputDigest !== await digest(root)) throw new Error("Film inputs changed during generation; the computed clips were not published");
  const output: string = path.join(root, "media", "automovie", "kickboxing");
  await fs.mkdir(output, { recursive: true });
  const native: INativeRound = { inputDigest, duration: 180, fps: 30, clips, audience };
  const bytes: string = JSON.stringify(native);
  await fs.writeFile(path.join(output, "native-motion.json"), bytes);
  await fs.writeFile(path.join(output, "native-motion-receipt.json"), JSON.stringify({
    inputDigest, outputDigest: createHash("sha256").update(bytes).digest("hex"),
    generated: new Date().toISOString(), resolvedMilliseconds, totalMilliseconds: performance.now() - started,
    duration: 180, fps: 30, frames: 5401, preparation: round.preparation,
    audience: { seatedSampleRate: 2, closingSampleRate: 30, closingInterval: [167, 178], preparation: 3 },
    nativeDuration: motion.duration, schedule: motion.schedule, hits: motion.hits(),
    limitations: ["automovie#3574: intended contact outcomes are not reliable", "automovie#3517: native resolution cost", "Native lateral lie-down uses a seated/supine route", ...(process.argv.includes("--official-arm-count") ? [] : ["Count uses standing native head pulses and the result uses a head shake after arm-gesture refusals; retry retained arm inputs with --official-arm-count after SDK repair"]), ...(process.argv.includes("--official-pointing") ? [] : ["Official pointing is disabled after a native arm-site refusal; retry retained targets with --official-pointing after SDK repair"]), "No generated voice or fabricated physical forces"],
  }, null, 2));
  console.info(JSON.stringify({ stage: "complete", output, bytes: Buffer.byteLength(bytes), elapsedMilliseconds: performance.now() - started }));
}

/** Hash the generation's actual source and installed dependency/creative inputs in stable path order. */
async function digest(root: string): Promise<string> {
  const files: string[] = [];
  for (const owner of ["entities/cast", "entities/crowds/arena", "entities/sets/ring", "interactions/kickboxing"]) {
    const entries: string[] = await fs.readdir(path.join(root, "src", owner), { recursive: true });
    for (const entry of entries) if (entry.endsWith(".ts")) files.push(path.join(root, "src", owner, entry));
  }
  files.push(path.join(root, "src/executable/bakeRound.ts"));
  files.push(path.join(root, "package.json"), path.resolve(root, "../../../pnpm-lock.yaml"), path.join(root, "docs/body/screenplay/kickboxing/010-the-round.md"));
  for (const name of ["motions", "engine", "human", "interface", "archetypes"]) {
    const installed: string = path.join(root, "node_modules/@automovie", name);
    files.push(path.join(installed, "package.json"));
    const entries: string[] = await fs.readdir(path.join(installed, "lib"), { recursive: true });
    for (const entry of entries) if (entry.endsWith(".js") || entry.endsWith(".json")) files.push(path.join(installed, "lib", entry));
  }
  const hash: ReturnType<typeof createHash> = createHash("sha256");
  hash.update(JSON.stringify({ arguments: process.argv.slice(2), runtime: process.versions, platform: process.platform, architecture: process.arch }));
  for (const file of files.sort((one: string, other: string): number => one.localeCompare(other))) hash.update(path.relative(root, file)).update("\0").update(await fs.readFile(file)).update("\0");
  return hash.digest("hex");
}

bakeRound().catch((error: unknown): void => { console.error(error); process.exitCode = 1; });
