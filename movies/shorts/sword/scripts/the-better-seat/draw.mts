import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { link, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { crc32 } from "node:zlib";

import { chromium } from "playwright-core";

const production = process.cwd();
const require = createRequire(join(production, "package.json"));
const esbuild = createRequire(require.resolve("vite/package.json"))("esbuild");
const output = resolve(process.argv[2] ?? ".cache/the-better-seat/beauty-draw");
const seed = process.argv[3] ? resolve(process.argv[3]) : undefined;
const retake = process.argv.find((argument) => argument.startsWith("--retake="))?.slice(9);
const pilot = process.argv.find((argument) => argument.startsWith("--pilot="))?.slice(8);
const frameCount = 1440;
const redrawn = new Set<number>();
if (retake) {
  if (!seed || !/^\d+-\d+(,\d+-\d+)*$/.test(retake)) throw new Error("A focused retake needs a source directory and inclusive frame ranges.");
  for (const range of retake.split(",")) {
    const [first, last] = range.split("-").map(Number);
    if (first > last || last >= frameCount) throw new Error(`Invalid retake interval ${range}.`);
    for (let index = first; index <= last; index++) redrawn.add(index);
  }
}
const images = join(output, "frames");
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const name = (index: number) => `frame_${String(index).padStart(5, "0")}.png`;
const signature = Buffer.from("89504e470d0a1a0a", "hex");

// Confirm dimensions and every PNG chunk before admitting a checkpoint to the encode.
function inspect(png: Buffer, width: number, height: number): string {
  if (png.length < 45 || !png.subarray(0, 8).equals(signature) ||
      png.toString("ascii", 12, 16) !== "IHDR" ||
      png.readUInt32BE(16) !== width || png.readUInt32BE(20) !== height) {
    throw new Error("Invalid render image signature or dimensions.");
  }
  for (let cursor = 8; cursor + 12 <= png.length;) {
    const size = png.readUInt32BE(cursor);
    const end = cursor + 8 + size;
    if (end + 4 > png.length || crc32(png.subarray(cursor + 4, end)) !== png.readUInt32BE(end)) {
      throw new Error("Incomplete or corrupt render image chunk.");
    }
    if (png.toString("ascii", cursor + 4, cursor + 8) === "IEND" && end + 4 === png.length) return hash(png);
    cursor = end + 4;
  }
  throw new Error("Missing render image end marker.");
}

async function run(program: string, args: string[]): Promise<Buffer> {
  const child = spawn(program, args, { stdio: ["ignore", "pipe", "inherit"], windowsHide: true });
  const result: Buffer[] = [];
  child.stdout.on("data", (chunk: Buffer) => result.push(chunk));
  const [exit] = await once(child, "close");
  if (exit !== 0) throw new Error(`${program} completed with exit code ${exit}.`);
  return Buffer.concat(result);
}

const standardDraw = `
import { AUTO_MOVIE_DRAW_GLOBALS, installAutoMovieDraw, parseAutoMovieInspectionRequest } from "@automovie/render";
import { theBetterSeat } from "./src/composition/films/the-better-seat";
const film = theBetterSeat();
window[AUTO_MOVIE_DRAW_GLOBALS.props] = { subject: "the-better-seat", props: null };
installAutoMovieDraw(() => ({ "the-better-seat": { create: async () => ({ ...(await film.create()), width: film.width, height: film.height, fps: film.fps, durationSeconds: film.durationSeconds }) } }));
const port = window[AUTO_MOVIE_DRAW_GLOBALS.draw];
const canvas = document.createElement("canvas");
canvas.width = film.width;
canvas.height = film.height;
const context = canvas.getContext("2d", { alpha: false });
const request = { ...parseAutoMovieInspectionRequest(() => undefined), shade: "beauty" };
window.seatMetadata = async () => ({ ...await port.describe(), fps: film.fps, width: film.width, height: film.height, duration: film.durationSeconds });
window.seatPicture = async (index) => {
  const seconds = index / film.fps;
  const { pixels } = await port.draw({ seconds, view: "film", request, width: film.width, height: film.height, frame: [seconds], scale: 1 });
  const rgba = new Uint8ClampedArray(Uint8Array.fromBase64(pixels).buffer);
  context.putImageData(new ImageData(rgba, film.width, film.height), 0, 0);
  return canvas.toDataURL("image/png").split(",")[1];
};`;
const bundle = await esbuild.build({
  stdin: { contents: standardDraw, resolveDir: production, sourcefile: "seat-draw.ts", loader: "ts" },
  bundle: true, write: false, platform: "browser", format: "iife", target: "chrome122",
});
const revision = hash(bundle.outputFiles[0].contents);
const checkpoint = join(output, "checkpoint.json");
await mkdir(images, { recursive: true });
const names = new Set(await readdir(images));
const prior = await readFile(checkpoint, "utf8").then(JSON.parse).catch((error: NodeJS.ErrnoException) => {
  if (error.code !== "ENOENT") throw error;
  return undefined;
});
if ((names.size && !prior) || (prior && (prior.revision !== revision || prior.retake !== retake))) {
  throw new Error("The output holds checkpoints from a different source bundle. Choose a new directory.");
}
const ffmpeg: string = require("ffmpeg-static");
let sourceParity: { index: number; pixelHash: string }[] = prior?.sourceParity ?? [];
const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
});
const chromiumVersion = browser.version();
let metadata: Awaited<ReturnType<Window["seatMetadata"]>>;
const frames: { index: number; seconds: number; hash: string }[] = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.route("http://seat-draw.test/**", (route) => {
    if (route.request().url().endsWith("/scene.js")) {
      return route.fulfill({ contentType: "application/javascript;charset=UTF-8", body: bundle.outputFiles[0].text });
    }
    return route.fulfill({ contentType: "text/html", body: '<!doctype html><meta charset="utf-8"><script src="/scene.js"></script>' });
  });
  await page.goto("http://seat-draw.test/");
  metadata = await page.evaluate(() => window.seatMetadata());
  const { width, height, fps, duration } = metadata;
  if (width !== 1280 || height !== 720 || fps !== 24 || duration * fps !== frameCount) {
    throw new Error("Unexpected film raster or frame clock.");
  }
  console.log(metadata);
  const draw = async (index: number) => Buffer.from(await page.evaluate((i) => window.seatPicture(i), index), "base64");
  if (pilot) {
    for (const index of pilot.split(",").map(Number)) {
      if (!Number.isInteger(index) || index < 0 || index >= frameCount) throw new Error(`Invalid pilot frame ${index}.`);
      const picture = await draw(index);
      inspect(picture, width, height);
      await writeFile(join(output, `pilot-${name(index)}`), picture);
    }
  } else {
    const seedFrames = new Set(seed ? (await readdir(seed)).filter((file) => /^frame_\d{5}\.png$/.test(file)) : []);
    if (seed && !prior) {
      for (let index = 0; index < seedFrames.size; index++) {
        if (!seedFrames.has(name(index))) throw new Error(`Missing supplied source frame ${index}.`);
        inspect(await readFile(join(seed, name(index))), width, height);
      }
      if (seedFrames.size < 5 || seedFrames.size > frameCount) throw new Error("Invalid supplied source prefix length.");
      const retained = Array.from({ length: seedFrames.size }, (_, index) => index).filter((index) => !redrawn.has(index));
      if (retained.length < 9) throw new Error("At least nine retained source frames are required for the parity check.");
      const sample = Array.from({ length: 9 }, (_, index) => retained[Math.round((retained.length - 1) * index / 8)]);
      sourceParity = [];
      for (const index of sample) {
        const witness = join(output, `parity-${name(index)}`);
        await writeFile(witness, await draw(index));
        const pixels = (file: string) => run(ffmpeg, ["-v", "error", "-threads", "1", "-i", file, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"]);
        const reference = await pixels(join(seed, name(index)));
        if (!reference.equals(await pixels(witness))) throw new Error(`Source checkpoint and installed draw port differ at source frame ${index}.`);
        sourceParity.push({ index, pixelHash: hash(reference) });
      }
      console.log(`CRC verified ${seedFrames.size} source frames and matched all ${sample.length} reference images exactly.`);
    }
    if (!prior) await writeFile(checkpoint, JSON.stringify({ revision, sourceParity, seedCount: seedFrames.size, retake }, null, 2), { flag: "wx" });
    if (prior && seed && prior.seedCount !== seedFrames.size) throw new Error("The supplied prefix changed since the previous run.");
    for (let index = 0; index < frameCount; index++) {
      const file = name(index);
      const target = join(images, file);
      const hasFrame = names.has(file);
      const fromSeed = !hasFrame && seed && seedFrames.has(file) && !redrawn.has(index);
      const png = hasFrame ? await readFile(target) : fromSeed ? await readFile(join(seed, file)) : await draw(index);
      const imageHash = inspect(png, width, height);
      if (fromSeed) await link(join(seed, file), target);
      if (!hasFrame && !fromSeed) {
        const partial = `${target}.${process.pid}.part`;
        await writeFile(partial, png, { flag: "wx" });
        await rename(partial, target);
      }
      frames.push({ index, seconds: index / fps, hash: imageHash });
      if (index % 96 === 0 || index === frameCount - 1) console.log(`Checkpoint ${index + 1}/${frameCount}`);
    }
  }
} finally {
  await browser.close();
}

if (!pilot) {
  const partialFilm = join(output, `picture-${process.pid}.mp4`);
  await run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-n", "-framerate", String(metadata.fps),
    "-i", join(images, "frame_%05d.png"), "-frames:v", String(frameCount), "-an", "-c:v", "libx264",
    "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-colorspace", "bt709", "-threads", "4", "-movflags", "+faststart", partialFilm]);
  await rename(partialFilm, join(output, "film.mp4"));
  await writeFile(join(output, "render-report.json"), JSON.stringify({
    draw: "@automovie/render 0.3.0 installAutoMovieDraw, film, beauty", chromium: chromiumVersion,
    metadata, bundleSha256: revision, sourceParity, retake, hashOf: "PNG image bytes", frames,
  }, null, 2));
}

declare global {
  interface Window {
    seatMetadata(): Promise<{ duration: number; fps: number; width: number; height: number; renderer: string }>;
    seatPicture(index: number): Promise<string>;
  }
}
