import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

import { roundClock } from "../src/clock.ts";

const root = resolve(import.meta.dirname, "..");
const movie = resolve(root, process.env.ROUND_OUTPUT || "media/automovie/kickboxing/videos/film.mp4");
const report = JSON.parse(readFileSync(resolve(dirname(movie), "render-report.json"), "utf8"));
const mix = resolve(root, process.env.ROUND_SOUND_CACHE || ".cache/sound-sol", "round.wav");
const ffmpeg = process.env.FFMPEG_PATH || createRequire(import.meta.url)("ffmpeg-static");
const sampleRate = 48000;
const presentationSamples = roundClock.duration * sampleRate;

const pcm = (file) => {
  const samples = execFileSync(ffmpeg, ["-v", "error", "-i", file, "-map", "0:a:0", "-f", "s16le", "-"], { maxBuffer: 40 * 1024 ** 2 });
  return new Int16Array(samples.buffer, samples.byteOffset, samples.byteLength / 2);
};
const source = pcm(mix);
const decoded = pcm(movie);
if (source.length !== presentationSamples * 2 || decoded.length < source.length)
  throw Error("The decoded audio does not fill the commissioned stereo timeline.");

const correlations = [];
for (let offset = -16; offset <= 16; offset++) {
  let cross = 0;
  let ambientPower = 0;
  let decodedPower = 0;
  for (let index = 32; index < presentationSamples - 32; index += 137) {
    const ambient = source[index * 2];
    const output = decoded[(index + offset) * 2];
    cross += ambient * output;
    ambientPower += ambient ** 2;
    decodedPower += output ** 2;
  }
  correlations.push({ offset, correlation: cross / Math.sqrt(ambientPower * decodedPower) });
}
correlations.sort((a, b) => b.correlation - a.correlation);
if (correlations[0].offset !== 0 || correlations[0].correlation < .98)
  throw Error("The decoded AAC track does not match the mix at sample zero.");

function stereoLevel(start, end) {
  const first = Math.max(0, Math.round(start * sampleRate));
  const last = Math.min(presentationSamples, Math.round(end * sampleRate));
  const power = [0, 0];
  for (let index = first; index < last; index++) {
    power[0] += (decoded[index * 2] / 32768) ** 2;
    power[1] += (decoded[index * 2 + 1] / 32768) ** 2;
  }
  return power.map((value) => Number((10 * Math.log10(value / (last - first))).toFixed(2)));
}

const audioCues = [
  ["Glove greeting", roundClock.touch],
  ["First of the early claps", roundClock.mayaClaps[0]],
  ["Two early claps", roundClock.mayaClaps[1]],
  ["Isolated red-corner clap", roundClock.edClaps.at(-1)],
  ["Laboured breath", 120],
  ["Finishing sound", roundClock.knockdown],
  ["Canvas and call", roundClock.canvasTouch],
  ...roundClock.lines.slice(4, 14).map(([seconds], index) => [`Count ${index + 1}`, seconds]),
  ["Result call", roundClock.lines[14][0]],
  ["Closing bell", roundClock.bell],
  ["Maya's closing clap", roundClock.mayaClaps.at(-1)],
  ["Ruth's closing clap", roundClock.ruthClaps.at(-1)],
].map(([cue, seconds]) => ({
  cue,
  seconds,
  beforeRmsDb: stereoLevel(seconds - .10, seconds - .025),
  onsetRmsDb: stereoLevel(seconds + .004, seconds + .084),
  audibleWindowRmsDb: stereoLevel(seconds + .09, seconds + .44),
}));

const nullSink = process.platform === "win32" ? "NUL" : "/dev/null";
const analysis = spawnSync(ffmpeg, ["-hide_banner", "-nostats", "-i", movie, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", nullSink], {
  encoding: "utf8",
  maxBuffer: 4 * 1024 ** 2,
  stdio: ["ignore", "ignore", "pipe"],
});
if (analysis.error || analysis.status !== 0)
  throw Error(`FFmpeg could not measure the soundtrack. ${analysis.stderr?.slice(-1200) ?? ""}`, { cause: analysis.error });
const summary = analysis.stderr.split("Summary:").at(-1);
const loudness = {
  integratedLufs: Number(summary.match(/I:\s*(-?[\d.]+) LUFS/)?.[1]),
  rangeLu: Number(summary.match(/LRA:\s*([\d.]+) LU/)?.[1]),
  truePeakDbTp: Number(summary.match(/Peak:\s*(-?[\d.]+) dBFS/)?.[1]),
};
if (!Object.values(loudness).every(Number.isFinite)) throw Error("FFmpeg's loudness report is incomplete.");

const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const result = {
  movieSha256: sha(movie),
  mixSha256: sha(mix),
  sourceSamplesPerChannel: source.length / 2,
  decodedSamplesPerChannel: decoded.length / 2,
  presentationSamplesPerChannel: presentationSamples,
  alignment: correlations[0],
  loudness,
  audioCues,
  observation: "Local PCM and cue comparison. It does not establish perceptual intelligibility, real-time playback or human listening.",
};
if (result.movieSha256 !== report.output.sha256 || result.mixSha256 !== report.audioSha256)
  throw Error("The measured inputs differ from the encoding report.");
writeFileSync(resolve(dirname(movie), "sound-check.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ alignment: result.alignment, audioCues: audioCues.slice(-3), loudness }));
