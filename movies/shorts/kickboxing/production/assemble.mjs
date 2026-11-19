/** Verify addressed camera packets, assemble the precise H.264 clock, and mux the commissioned mix. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, writeFileSync, writeSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { roundClock } from "../src/clock.ts";
import { needsRepairDraw, repairPlan, retainedBundle } from "./repair-plan.mjs";

const root = resolve(import.meta.dirname, "..");
const rangeDirectory = resolve(root, process.env.ROUND_CACHE || ".cache/direct-render");
const mix = resolve(root, process.env.ROUND_SOUND_CACHE || ".cache/sound-sol", "round.wav");
const fullFrames = roundClock.duration * roundClock.fps;
const picture = resolve(root, process.env.ROUND_OUTPUT || "media/automovie/kickboxing/videos/film.mp4");
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? fullFrames);
const ffmpeg = process.env.FFMPEG_PATH || createRequire(import.meta.url)("ffmpeg-static");
const ffprobe = process.env.FFPROBE_PATH || "ffprobe";

if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > fullFrames || end <= start)
  throw Error("Invalid inclusive/exclusive picture range.");
if ((start !== 0 || end !== fullFrames) && !process.env.ROUND_OUTPUT)
  throw Error("Set ROUND_OUTPUT to a pilot destination before assembling a partial range.");
if (!ffmpeg || !existsSync(mix)) throw Error("Set FFMPEG_PATH and generate the dialogue and mix first.");

const range = JSON.parse(readFileSync(resolve(rangeDirectory, `range-${start}-${end}.json`), "utf8"));
const sdkRgba = range.backend.draw === "installAutoMovieDraw/the-round/film/beauty";
const retained = range.retainedPicture !== undefined;
if (retained && (start !== 0 || end !== fullFrames
  || JSON.stringify(range.retainedPicture) !== JSON.stringify(repairPlan)
  || range.bundleSha === repairPlan.previousBundle))
  throw Error("Invalid provenance for the Edition 020 production repair.");
const raw = resolve(rangeDirectory, `assembly-${start}-${end}.h264`);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const rawFile = openSync(raw, "w");
try {
  let next = start;
  for (const packet of range.receipts) {
    const source = retained && !needsRepairDraw(packet.start, packet.end) ? retainedBundle(packet.start, packet.end) : range.bundleSha;
    if (packet.start !== next || packet.source !== source || packet.frames !== packet.end - packet.start)
      throw Error(`Missing, shifted or mixed-source packet at frame ${next}.`);
    const bytes = readFileSync(resolve(rangeDirectory, `frames-${packet.start}-${packet.end}.h264`));
    if (bytes.length !== packet.bytes || digest(bytes) !== packet.sha256)
      throw Error(`The packet for frame ${next} failed its byte receipt.`);
    writeSync(rawFile, bytes);
    next = packet.end;
  }
  if (next !== end) throw Error(`The picture stops at frame ${next}, expected ${end}.`);
} finally {
  closeSync(rawFile);
}

mkdirSync(dirname(picture), { recursive: true });
const pending = picture.replace(/\.mp4$/i, "") + ".pending.mp4";
const duration = (end - start) / roundClock.fps;
const timescale = 90_000;
const ticksPerFrame = timescale / roundClock.fps;
// This WebCodecs RGBA path writes full-range samples with a limited-range flag.
// Correct only their range metadata. The original picture access units stay in order.
const colorMetadata = sdkRgba ? "h264_metadata=video_full_range_flag=1," : "";
const timestamps = `setts=time_base=1/${timescale}:pts=N*${ticksPerFrame}:dts=N*${ticksPerFrame}:duration=${ticksPerFrame}`;
execFileSync(ffmpeg, [
  "-hide_banner", "-loglevel", "warning", "-y",
  "-r", String(roundClock.fps), "-f", "h264", "-i", raw,
  "-ss", String(start / roundClock.fps), "-i", mix,
  "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-bsf:v", colorMetadata + timestamps,
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", String(duration),
  "-video_track_timescale", String(timescale), "-movflags", "+faststart", pending,
], { stdio: "inherit" });

const metadata = JSON.parse(execFileSync(ffprobe, [
  "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", pending,
], { encoding: "utf8" }));
const pictureTrack = metadata.streams.find((stream) => stream.codec_type === "video");
const audioTrack = metadata.streams.find((stream) => stream.codec_type === "audio");
if (Number(pictureTrack?.nb_read_frames) !== end - start || pictureTrack?.width !== 1280
  || pictureTrack?.height !== 720 || pictureTrack?.avg_frame_rate !== "30/1"
  || pictureTrack?.time_base !== `1/${timescale}` || (sdkRgba && pictureTrack.color_range !== "pc")
  || Math.abs(Number(metadata.format.duration) - duration) > 1 / roundClock.fps
  || audioTrack?.channels !== 2 || audioTrack?.sample_rate !== "48000")
  throw Error("The decoded picture and sound do not match the commissioned stream clock.");
renameSync(pending, picture);

writeFileSync(resolve(dirname(picture), "render-report.json"), JSON.stringify({
  title: "The Round",
  frameRange: [start, end],
  sourceBundleSha256: range.bundleSha,
  ...(retained ? { retainedPicture: repairPlan } : {}),
  backend: range.backend,
  pictureEncoding: { timescale, ticksPerFrame, colorRange: pictureTrack.color_range, colorSpace: pictureTrack.color_space },
  packets: range.receipts,
  audioSha256: digest(readFileSync(mix)),
  output: { file: picture.split(/[\\/]/).at(-1), sha256: digest(readFileSync(picture)) },
  streams: metadata.streams,
  container: { duration: metadata.format.duration, size: metadata.format.size },
}, null, 2) + "\n");
console.log(`Read ${end - start} picture frames and wrote ${picture}.`);
