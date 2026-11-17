import { encodeAutoMovieWavPcm16 } from "@automovie/render";
import type { HumanPerformance } from "@automovie/motions";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { RingSoundtrack } from "../consequences/sound/RingSoundtrack";

/**
 * Keep a reproducible native no-voice PCM sketch and its actual measurements.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States retained procedural audio, its provenance and unperformed listening.
 * @evidence contracts/development/implementation.md#principled-implementation Hashes the actual native receipt, source, installed sound/encoder package bytes and runtime; delegates sound and WAV encoding to those owners and records output hashes and analysis.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Read and hash inputs, render, split native interleaved channels for the native encoder, then retain bytes and receipt.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No voice, model installation, external asset, custom synthesis or claimed listening.
 * @evidence contracts/development/implementation.md#efficient-algorithms One native mix and linear channel layout conversion over the fixed180-second master.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Consumes the completed native motion receipt without rerunning choreography.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Node file operations close their handles; no host, player or subprocess is retained.
 */
export async function createSoundtrack(): Promise<void> {
  const root: string = process.cwd();
  const folder: string = path.join(root, "media/automovie/kickboxing");
  const receiptBytes: string = await fs.readFile(path.join(folder, "native-motion-receipt.json"), "utf8");
  const receipt: { outputDigest: string; preparation: number; hits: ReturnType<HumanPerformance["hits"]>; schedule: HumanPerformance["schedule"] } = JSON.parse(receiptBytes);
  const hash: ReturnType<typeof createHash> = createHash("sha256").update(receiptBytes).update(JSON.stringify({ runtime: process.versions, platform: process.platform, architecture: process.arch }));
  const sources: string[] = ["src/consequences/sound/RingSoundtrack.ts", "src/executable/createSoundtrack.ts"];
  for (const name of ["engine", "render"]) {
    const installed: string = path.join("node_modules/@automovie", name);
    sources.push(path.join(installed, "package.json"));
    const entries: string[] = await fs.readdir(path.join(root, installed, "lib"), { recursive: true });
    for (const entry of entries) if (entry.endsWith(".js") || entry.endsWith(".json")) sources.push(path.join(installed, "lib", entry));
  }
  for (const source of sources.sort((one: string, other: string): number => one.localeCompare(other))) hash.update(source).update("\0").update(await fs.readFile(path.join(root, source))).update("\0");
  const fingerprint: string = hash.digest("hex");
  const sound: ReturnType<typeof RingSoundtrack.render> = RingSoundtrack.render({ ...receipt, fingerprint });
  const length: number = sound.pcm.length / 2;
  const left: Float32Array = new Float32Array(length);
  const right: Float32Array = new Float32Array(length);
  for (let index: number = 0; index < length; index++) { left[index] = sound.pcm[index * 2]!; right[index] = sound.pcm[index * 2 + 1]!; }
  const bytes: Uint8Array = encodeAutoMovieWavPcm16(left, right, 48_000);
  await fs.writeFile(path.join(folder, "native-sound.wav"), bytes);
  await fs.writeFile(path.join(folder, "native-sound-receipt.json"), JSON.stringify({ inputDigest: fingerprint, outputDigest: createHash("sha256").update(bytes).digest("hex"), analysis: sound.analysis, limits: "Procedural native preview effects and ambience; bell markers are stand-ins. No voice, music or listened acceptance." }, null, 2));
  console.info(JSON.stringify({ stage: "sound-complete", bytes: bytes.length, analysis: sound.analysis }));
}

createSoundtrack().catch((error: unknown): void => { console.error(error); process.exitCode = 1; });
