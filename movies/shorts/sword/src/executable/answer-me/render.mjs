import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const require = createRequire(join(project, "package.json"));
const esbuild = createRequire(require.resolve("vite/package.json"))("esbuild");
const { chromium } = require("playwright-core");
const output = resolve(process.argv[2] ?? ".cache/sol-0.3.0/answer-me/picture");
const evidence = process.argv[3] === undefined ? undefined : resolve(process.argv[3]);
const retained = new Set(evidence === undefined ? [] : JSON.parse(await readFile(evidence, "utf8")).details);
const stillsOnly = process.argv[4] === "--stills";
const source = join(dirname(output), "source");

await mkdir(output, { recursive: true });
if (retained.size > 0) await mkdir(source, { recursive: true });

const bundle = await esbuild.build({
  stdin: {
    resolveDir: project,
    contents: `
      import * as Three from "three";
      import { AUTO_MOVIE_DRAW_GLOBALS, installAutoMovieDraw, parseAutoMovieInspectionRequest } from "@automovie/render";
      import { answerMe } from "./src/composition/films/answer-me.ts";
      window.mountFilm = async () => {
        const film = answerMe();
        const production = await film.create();
        installAutoMovieDraw(() => ({ "answer-me": { create: async () => ({
          ...production, width: film.width, height: film.height, fps: film.fps,
          durationSeconds: film.durationSeconds,
        }) } }));
        const draw = window[AUTO_MOVIE_DRAW_GLOBALS.draw];
        await draw.describe();
        const request = { ...parseAutoMovieInspectionRequest(() => undefined), shade: "beauty" };
        const png = document.createElement("canvas");
        png.width = film.width;
        png.height = film.height;
        const pixels = png.getContext("2d", { alpha: false });
        const gl = document.createElement("canvas").getContext("webgl2");
        const report = gl?.getExtension("WEBGL_debug_renderer_info");
        const direction = new Three.Vector3();
        window.drawFrame = async index => {
          const seconds = index / film.fps;
          const picture = await draw.draw({ seconds, view: "film", request, width: film.width, height: film.height, frame: [seconds], scale: 1 });
          if (picture.width !== film.width || picture.height !== film.height) throw Error("Draw raster disagrees with the film.");
          const rgba = Uint8Array.fromBase64(picture.pixels);
          pixels.putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer), film.width, film.height), 0, 0);
          const camera = production.camera;
          return {
            rgb: png.toDataURL("image/png").split(",")[1],
            camera: { eye: camera.position.toArray(), aim: camera.getWorldDirection(direction).toArray(), fov: camera.fov }
          };
        };
        return {
          width: film.width, height: film.height, fps: film.fps, durationSeconds: film.durationSeconds,
          gpu: report ? gl.getParameter(report.UNMASKED_RENDERER_WEBGL) : "undisclosed"
        };
      };
    `,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  target: "chrome122",
});

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent("<!doctype html><meta charset=utf-8>");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const format = await page.evaluate(() => window.mountFilm());
  const count = format.fps * format.durationSeconds;
  if (!Number.isInteger(count) || count === 0) throw Error("The film must contain whole frames.");
  console.log(format);
  if (stillsOnly) {
    if (retained.size === 0) throw Error("A still capture needs frame indices.");
    for (const index of retained) {
      const { rgb } = await page.evaluate(index => window.drawFrame(index), index);
      await writeFile(join(source, `frame_${String(index).padStart(5, "0")}.png`), Buffer.from(rgb, "base64"));
    }
    await browser.close();
    console.log(`Drew ${retained.size} SDK beauty frames`);
    process.exit(0);
  }

  const args = [
    "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-f", "image2pipe",
    "-framerate", String(format.fps), "-c:v", "png", "-threads", "3", "-i", "pipe:0",
    "-an", "-c:v", "libx264", "-threads", "4", "-preset", "fast", "-crf", "16",
    "-vf", "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-movflags", "+faststart", join(output, "picture-in-progress.mp4"),
  ];
  const encoder = spawn(process.env.FFMPEG_PATH ?? require("ffmpeg-static"), args, {
    stdio: ["pipe", "inherit", "inherit"], windowsHide: true,
  });
  const encoded = once(encoder, "close");
  const frameReport = [];
  const started = Date.now();
  try {
    for (let index = 0; index < count; index++) {
      const { rgb, camera } = await page.evaluate(index => window.drawFrame(index), index);
      const pixels = Buffer.from(rgb, "base64");
      const hash = createHash("sha256").update(pixels).digest("hex");
      frameReport.push({ index, seconds: index / format.fps, hash, camera });
      if (retained.has(index)) await writeFile(join(source, `frame_${String(index).padStart(5, "0")}.png`), pixels);
      if (!encoder.stdin.write(pixels)) await once(encoder.stdin, "drain");
      if (index % format.fps === 0) console.log(`Frame ${index}/${count} at ${(Date.now()-started)/1000} s wall time`);
    }
    encoder.stdin.end();
    const [status] = await encoded;
    if (status !== 0) throw Error(`FFmpeg exited with ${status}`);
  } catch (error) {
    encoder.stdin.destroy();
    encoder.kill();
    await encoded.catch(() => undefined);
    throw error;
  }
  await rename(join(output, "picture-in-progress.mp4"), join(output, "film.mp4"));
  await writeFile(join(output, "render-report.json"), JSON.stringify({
    subject: "answer-me", draw: "@automovie/render installAutoMovieDraw, film camera, beauty pass, SDK 2x area supersampling", backend: `${format.gpu}; Chromium ${browser.version()}`,
    format, video: "film.mp4", args, frames: frameReport,
    wallSeconds: (Date.now()-started)/1000,
  }, null, 2));
  console.log(`Encoded ${count} frames`);
} finally {
  await browser.close();
}
