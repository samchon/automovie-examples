import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { roundClock } from "../src/clock.ts";

const root = resolve(import.meta.dirname, "..");
const sound = resolve(root, process.env.ROUND_SOUND_CACHE || ".cache/sound-sol");
const movie = resolve(root, process.env.ROUND_OUTPUT || "media/automovie/kickboxing/videos/film.mp4");
const output = resolve(dirname(movie), "en-GB.vtt");
const dialogue = JSON.parse(readFileSync(resolve(sound, "lines/voice.json"), "utf8")).lines;

if (!Array.isArray(dialogue) || dialogue.length !== roundClock.lines.length)
  throw Error("The voice record does not match the dialogue clock.");

const time = (seconds) => new Date(Math.round(seconds * 1000)).toISOString().slice(11, 23);
const cues = roundClock.lines.map(([start, length], index) => ({
  start,
  end: start + length,
  text: `<v Daniel>${dialogue[index]}</v>`,
}));

const effects = [
  [0, 0.43, "Opening bell"],
  [roundClock.guardCrack, 0.26, "Gloves crack"],
  [roundClock.mayaClaps[0], 0.33, "Single clap"],
  [roundClock.mayaClaps[1], 0.33, "Two claps together"],
  [roundClock.redSole, 0.32, "Sole slaps canvas"],
  [roundClock.edClaps.at(-1), 0.36, "Single clap"],
  [120, 1.12, "Laboured breathing"],
  [roundClock.knockdown, 0.30, "Flat crack"],
  [roundClock.bell, 0.72, "Closing bell"],
  [roundClock.mayaClaps.at(-1), 0.40, "Single clap"],
  [roundClock.ruthClaps.at(-1), 0.41, "Single clap"],
];
for (const [start, length, sound] of effects)
  cues.push({ start, end: start + length, text: `[${sound}]` });

cues.sort((a, b) => a.start - b.start);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `WEBVTT\n\n${cues.map(({ start, end, text }) => `${time(start)} --> ${time(end)}\n${text}\n`).join("\n")}`);
console.log(`Wrote ${cues.length} dialogue and sound captions to ${output}.`);
