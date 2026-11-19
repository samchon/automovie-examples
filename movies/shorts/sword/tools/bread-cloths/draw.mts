import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import * as fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const project = process.cwd();
const require = createRequire(path.join(project, "package.json"));
const esbuild = createRequire(require.resolve("vite/package.json"))("esbuild");
const { chromium } = require("playwright-core");
const argument = (name: string): string | undefined =>
  process.argv.find((token) => token.startsWith(name + "="))?.slice(name.length + 1);
const out = path.resolve(project, argument("--out") ?? ".cache/sol-0.3.0/bread-cloths/exact-draw");
const full = process.argv.includes("--encode");
const range = argument("--range")?.split(":").map(Number);
if (range && (!full || range.length !== 2 || range.some((frame) => !Number.isSafeInteger(frame)) ||
  range[0] < 0 || range[0] >= range[1] || range[1] > 1440))
  throw new Error("Choose an encoded frame range in first:last-exclusive form within 0:1440.");
const requested = (argument("--frames") ?? "115,754,971,982,996,1068,1337,1439")
  .split(",").map(Number);
if (requested.some((frame) => !Number.isSafeInteger(frame) || frame < 0 || frame >= 1440))
  throw new Error("Choose whole Bread Cloths frame indices 0–1439.");
await fs.mkdir(out, { recursive: true });

// The production installs the SDK draw port used by the standard CLI. Packing
// its already rendered RGBA into PNG in Chromium reduces host transport bytes.
const script = [
  `import { AUTO_MOVIE_DRAW_GLOBALS, installAutoMovieDraw, parseAutoMovieInspectionRequest } from "@automovie/render";`,
  `import { breadCloths } from "./src/composition/films/bread-cloths";`,
  `const film = breadCloths();`,
  `window[AUTO_MOVIE_DRAW_GLOBALS.props] = { subject: "bread-cloths", props: null };`,
  `installAutoMovieDraw(() => ({ "bread-cloths": { create: async () => ({ ...(await film.create()), width: film.width, height: film.height, fps: film.fps, durationSeconds: film.durationSeconds }) } }));`,
  `const port = window[AUTO_MOVIE_DRAW_GLOBALS.draw];`,
  `const canvas = document.createElement("canvas");`,
  `canvas.width = film.width; canvas.height = film.height;`,
  `const context = canvas.getContext("2d", { alpha: false });`,
  `const request = { ...parseAutoMovieInspectionRequest(() => undefined), shade: "beauty" };`,
  `window.breadMetadata = async () => ({ ...await port.describe(), fps: film.fps, width: film.width, height: film.height, duration: film.durationSeconds });`,
  `window.breadPicture = async (index) => {`,
  `  const seconds = index / film.fps;`,
  `  const result = await port.draw({ seconds, view: "film", request, width: film.width, height: film.height, frame: [seconds], scale: 1 });`,
  `  const raw = atob(result.pixels);`,
  `  const rgba = new Uint8ClampedArray(raw.length);`,
  `  for (let i = 0; i < raw.length; i++) rgba[i] = raw.charCodeAt(i);`,
  `  context.putImageData(new ImageData(rgba, film.width, film.height), 0, 0);`,
  `  return { png: canvas.toDataURL("image/png").split(",")[1], camera: result.camera };`,
  `};`,
].join("\n");
const bundle = await esbuild.build({
  stdin: { contents: script, resolveDir: project, sourcefile: "bread-draw.ts", loader: "ts" },
  bundle: true, write: false, platform: "browser", format: "iife", target: "chrome122",
});
const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.route("http://bread-draw.test/**", (route) => {
    const scriptRequest = route.request().url().endsWith("/scene.js");
    return route.fulfill({
      contentType: scriptRequest ? "application/javascript;charset=UTF-8" : "text/html",
      body: scriptRequest ? bundle.outputFiles[0].text : '<!doctype html><meta charset="utf-8"><script src="/scene.js"></script>',
    });
  });
  await page.goto("http://bread-draw.test/");
  const meta = await page.evaluate(() => window.breadMetadata());
  console.log(meta);
  const frameCount: number = meta.duration * meta.fps;
  const [first, end] = range ?? [0, frameCount];
  const indices = full ? Array.from({ length: end - first }, (_, i) => first + i) : requested;
  const samples = new Set(requested);
  const partial = path.join(out, "picture-partial-" + process.pid + ".mp4");
  const encoder = full ? spawn(require("ffmpeg-static"), [
    "-hide_banner", "-loglevel", "error", "-n", "-f", "image2pipe", "-framerate", String(meta.fps),
    "-c:v", "png", "-i", "pipe:0", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-crf", "18", "-r", String(meta.fps), "-movflags", "+faststart", "-threads", "4", "-preset", "medium", partial,
  ], { stdio: ["pipe", "inherit", "inherit"], windowsHide: true }) : null;
  const encoderExit = encoder ? once(encoder, "exit") : null;
  const started = Date.now();
  const frames: { index: number; seconds: number; hash: string; camera?: unknown }[] = [];
  try {
    for (const index of indices) {
      const frame = await page.evaluate((i) => window.breadPicture(i), index);
      const png = Buffer.from(frame.png, "base64");
      const retain = samples.has(index);
      if (retain) await fs.writeFile(path.join(out, "frame_" + String(index).padStart(5, "0") + ".png"), png);
      if (encoder?.stdin && !encoder.stdin.write(png)) await once(encoder.stdin, "drain");
      frames.push({ index, seconds: index / meta.fps, hash: createHash("sha256").update(png).digest("hex"),
        ...(retain ? { camera: frame.camera } : {}) });
      if (!full || (index - first) % 96 === 0 || index === end - 1)
        console.log(index, Math.round((Date.now() - started) / 1000) + " s");
    }
    encoder?.stdin?.end();
    if (encoderExit) {
      const [code] = await encoderExit;
      if (code !== 0) throw new Error("FFmpeg exited with " + code);
      await fs.rename(partial, path.join(out, "film.mp4"));
    }
  } catch (error) {
    encoder?.kill();
    throw error;
  }
  await fs.writeFile(path.join(out, "render-report.json"), JSON.stringify({
    invoked: "AutoMovie 0.3.0 installAutoMovieDraw, beauty, film view",
    chromium: browser.version(), meta, frames, hashOf: "PNG transport bytes",
  }, null, 2));
} finally {
  await browser.close();
}

declare global {
  interface Window {
    breadMetadata(): Promise<{ duration: number; fps: number; width: number; height: number; renderer: string }>;
    breadPicture(index: number): Promise<{ png: string; camera: unknown }>;
  }
}
