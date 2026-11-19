/** Compare every retained decoded image with the reviewed predecessor. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

import { needsRepairDraw, repairPlan } from "./repair-plan.mjs";

const project = resolve(import.meta.dirname, "..");
const movie = resolve(project, process.env.ROUND_OUTPUT || "media/automovie/kickboxing/videos/revision-020-repair/film.mp4");
const previous = resolve(project, process.env.ROUND_RETAINED_MOVIE || "media/automovie/kickboxing/videos/revision-020-final/film.mp4");
const ffmpeg = process.env.FFMPEG_PATH || createRequire(import.meta.url)("ffmpeg-static");
const report = JSON.parse(readFileSync(resolve(dirname(movie), "render-report.json"), "utf8"));
const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
if (digest(previous) !== repairPlan.previousPicture || digest(movie) !== report.output.sha256)
  throw Error("One of the compared movies differs from its production receipt.");

function decodedFrames(path) {
  const result = execFileSync(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-xerror", "-i", path, "-map", "0:v:0", "-an", "-f", "framemd5", "-",
  ], { encoding: "utf8", maxBuffer: 8 * 1024 ** 2 });
  return result.split(/\r?\n/).filter((line) => /^\s*0,/.test(line)).map((line) => line.split(",").at(-1).trim());
}

const before = decodedFrames(previous);
const after = decodedFrames(movie);
if (before.length !== 5400 || after.length !== before.length)
  throw Error("The compared movies do not both have 5,400 decoded frames.");

let unchangedFrames = 0;
let repairedFrames = 0;
let repairedFramesWithNewPixels = 0;
for (let index = 0; index < before.length; index++) {
  if (needsRepairDraw(index, index + 1)) {
    repairedFrames++;
    if (before[index] !== after[index]) repairedFramesWithNewPixels++;
  } else {
    if (before[index] !== after[index]) throw Error(`Retained decoded frame ${index} changed.`);
    unchangedFrames++;
  }
}
if (repairedFramesWithNewPixels === 0) throw Error("The repair contains no changed decoded images.");
const result = {
  previousPicture: repairPlan.previousPicture,
  picture: report.output.sha256,
  ranges: repairPlan.ranges,
  unchangedFrames,
  repairedFrames,
  repairedFramesWithNewPixels,
};
writeFileSync(resolve(dirname(movie), "repair-check.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
