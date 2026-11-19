/** Extract the whole encoded picture at 5 fps and full size details around screen events. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const directory = resolve(root, process.env.ROUND_REVIEW || "media/automovie/kickboxing/frames/revision-020-final");
const movie = resolve(root, process.env.ROUND_OUTPUT || "media/automovie/kickboxing/videos/film.mp4");
const ffmpeg = process.env.FFMPEG_PATH || createRequire(import.meta.url)("ffmpeg-static");
const storyAnchors = [
  0, 61, 97, 179, 268, 383, 450, 466, 521, 659, 815, 900, 977, 978, 1097, 1129,
  1189, 1283, 1350, 1385, 1529, 1736, 1800, 1863, 1978, 1998, 2193, 2232, 2250, 2292,
  2347, 2470, 2599, 2700, 2750, 2787, 2928, 2980, 3114, 3150, 3225, 3343, 3427, 3543,
  3600, 3605, 3662, 3792, 3975, 4050, 4101, 4279, 4417, 4487,
  4497, 4498, 4499, 4500, 4501, 4502, 4503, 4517, 4518, 4519, 4520, 4521, 4522,
  4545, 4664, 4710, 4740, 4770, 4800, 4830, 4860, 4890, 4920, 4950, 4980, 5010,
  4759, 4819, 4879, 4939, 4999,
  5028, 5043, 5070, 5103, 5128, 5150, 5179, 5208, 5232, 5238, 5242, 5255, 5284, 5310, 5329, 5335,
  5349, 5354, 5355, 5356, 5379, 5384, 5385, 5386, 5399,
];
const eventCenters = [
  61, 1129, 1965, 1978, 1998, 2172, 2347, 2599, 2936, 2966, 2980, 3344,
  3371, 3392, 3427, 3486, 3527, 3543, 3600, 3792, 4101, 4279, 4487, 4500,
  4519, 4520, 4710, 4740, 4770, 4800, 4830, 4860, 4890, 4920, 4950, 4980,
  5010, 5028, 5043, 5103, 5128, 5150, 5179, 5194, 5242, 5264, 5284, 5335,
  5355, 5385, 5397,
];
const adjacent = eventCenters.flatMap((frame) => [-2, -1, 0, 1, 2].map((offset) => frame + offset));
const anchors = [...new Set([...storyAnchors, ...adjacent])].sort((a, b) => a - b);
const sampledFramesPerSheet = 25;
const expectedSamples = 900;
const timeLabel = "drawtext=font='Segoe UI':text='%{pts\\:hms}':fontsize=15:fontcolor=white:box=1:boxcolor=black@0.72:x=5:y=h-th-4";
const run = (...args) => execFileSync(ffmpeg, ["-hide_banner", "-v", "error", "-y", ...args], { stdio: "inherit" });
const samples = resolve(directory, "5-fps");
const details = resolve(directory, "details");
mkdirSync(samples, { recursive: true });
mkdirSync(details, { recursive: true });

run("-i", movie, "-an", "-vf",
  `select='not(mod(n,6))',scale=320:180,${timeLabel},tile=5x5:nb_frames=${sampledFramesPerSheet}:padding=2:margin=2:color=0x142031`,
  "-fps_mode", "vfr", "-q:v", "3", resolve(samples, "phase-%02d.jpg"));

const filters = anchors.map((f) => `eq(n,${f})`).join("+");
run("-i", movie, "-an", "-vf", `select='${filters}'`, "-fps_mode", "vfr",
  "-compression_level", "3", "-start_number", "0", resolve(details, "sample-%03d.png"));

const fullSize = readdirSync(details).filter((name) => /^sample-\d+\.png$/.test(name)).sort();
const sheets = readdirSync(samples).filter((name) => /^phase-\d+\.jpg$/.test(name)).sort();
if (sheets.length !== expectedSamples / sampledFramesPerSheet || fullSize.length !== anchors.length)
  throw Error(`Incomplete review capture. ${sheets.length} sheets and ${fullSize.length} deliberate frames.`);
writeFileSync(resolve(directory, "record.json"), JSON.stringify({
  picture: movie,
  pictureSha256: createHash("sha256").update(readFileSync(movie)).digest("hex"),
  sheets: sheets.map((file, i) => ({ file: `5-fps/${file}`, firstFrame: i * sampledFramesPerSheet * 6, interval: 6, frames: sampledFramesPerSheet })),
  details: fullSize.map((file, i) => ({ file: `details/${file}`, frame: anchors[i], seconds: anchors[i] / 30 })),
}, null, 2) + "\n");
console.log(`Review capture contains ${sheets.length * sampledFramesPerSheet} sampled frames and ${fullSize.length} full-size frames.`);
