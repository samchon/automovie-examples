import { HumanBreath, HumanPerformance } from "@automovie/motions";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";

import { Fighter } from "../entities/cast/fighter/Fighter";
import type { INativeRound } from "../interactions/kickboxing/INativeRound";

/**
 * Compare one held guard and repeated guards with and without native breath,
 * then measure the retained film's trunk. No motion is changed. Run with
 * `pnpm exec ttsx --no-plugins -P tsconfig.json src/executable/inspectTorso.ts`.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the controlled comparison, invocation and read-only boundary.
 * @evidence contracts/development/implementation.md#principled-implementation Uses identical prepared body, seed and ten-second duration across one/ten guard actions and breath present/absent. Measures native clip angles independently of the renderer.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Prepare one body, finish all four comparisons, then report the stored film's joint ranges and limit occupancy.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No joint patch, replacement action, suppressed refusal or claimed physical acceptance; joint-limit occupancy is a diagnostic measurement.
 * @evidence contracts/development/implementation.md#efficient-algorithms Four bounded schedules of at most ten guards and a linear pass over retained principal keys; no whole-film schedule resolution.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work All comparisons share the same prepared body; the full-film measurements reuse the verified native bake.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Owns only bounded in-memory schedules and one parsed native file; Node reads close their handles.
 */
export async function inspectTorso(): Promise<void> {
  const fighter: Fighter = new Fighter("owen", 0xb94439);
  const bodyDigest: string = createHash("sha256").update(JSON.stringify(fighter.body)).digest("hex");
  const comparisons: unknown[] = [];
  for (const { breath, guards } of [{ breath: false, guards: 1 }, { breath: false, guards: 10 }, { breath: true, guards: 1 }, { breath: true, guards: 10 }]) {
    let chain: ReturnType<Fighter["chain"]> = fighter.chain();
    for (let index: number = 0; index < guards; index++) chain = chain.guard({ seconds: 10 / guards, stance: "orthodox" });
    const performance: HumanPerformance = new HumanPerformance({
      seed: "kickboxing/torso-reproduction",
      performers: [fighter.performer({ x: 0, y: 0, z: 0 }, 0)],
      composition: chain.node,
      layers: breath ? { owen: [HumanBreath.layer({ rate: 15 })] } : {},
    });
    const samples: unknown[] = [];
    for (let seconds: number = 0; seconds <= 10; seconds++) {
      samples.push({ seconds, joints: performance.pose("owen", seconds).joints.filter(joint => joint.bone === "spine" || joint.bone === "chest") });
    }
    comparisons.push({ breath, guards, duration: performance.duration, samples });
  }
  const bytes: Buffer = await fs.readFile("media/automovie/kickboxing/native-motion.json");
  const native: INativeRound = JSON.parse(bytes.toString("utf8")) as INativeRound;
  const film: unknown[] = [];
  for (const subject of ["owen", "marek"] as const) {
    const keys: INativeRound["clips"]["owen"]["keyframes"] = native.clips[subject].keyframes.filter(key => key.time < 148);
    for (const bone of ["spine", "chest"] as const) {
      const angles: unknown[] = [];
      for (const axis of ["flexion", "abduction", "twist"] as const) {
        const values: number[] = keys.map(key => key.pose.joints.find(joint => joint.bone === bone)?.[axis] ?? 0);
        angles.push({ axis, minimum: Math.min(...values), maximum: Math.max(...values), samples: values.length,
          atMinus20: values.filter(value => Math.abs(value + 20) < 1e-6).length,
          atPlus35: values.filter(value => Math.abs(value - 35) < 1e-6).length,
          atPlus45: values.filter(value => Math.abs(value - 45) < 1e-6).length });
      }
      film.push({ subject, bone, angles });
    }
  }
  console.log(JSON.stringify({ bodyDigest, nativeDigest: createHash("sha256").update(bytes).digest("hex"), comparisons, film }, null, 2));
}

inspectTorso().catch((error: unknown): void => { console.error(error); process.exitCode = 1; });
