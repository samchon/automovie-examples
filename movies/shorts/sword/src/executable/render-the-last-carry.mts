import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(join(project, "package.json"));
const esbuild = createRequire(require.resolve("vite/package.json"))("esbuild");
const { chromium }: typeof import("playwright-core") = require("playwright-core");
const ffmpeg = process.env.FFMPEG_PATH ?? require("ffmpeg-static");
const arguments_ = process.argv.slice(2);
const [output, mix] = arguments_.filter((argument) => !argument.startsWith("--"));
const preview = arguments_.find((argument) => argument.startsWith("--frames="))
  ?.slice("--frames=".length).split(",").map(Number);
if (!output) {
  throw new Error("Usage: node src/executable/render-the-last-carry.mts <new output folder> [48 kHz stereo WAV] [--frames=0,240,...]");
}
if (preview?.some((frame) => !Number.isInteger(frame) || frame < 0 || frame >= 1440)) {
  throw new Error("Preview frames must be integers from 0 through 1439");
}
const root = resolve(output);
const sound = mix ? resolve(mix) : join(project, "media/automovie/the-last-carry/audios/the-last-carry-ensemble.wav");
const source = join(root, "source");
await mkdir(dirname(root), { recursive: true });
await mkdir(root);
await mkdir(source);

/** Contact windows in inclusive frame numbers on the 24 fps film clock. */
const windows = [
  [32, 58], [90, 103], [116, 120], [190, 197], [309, 314],
  [319, 339], [349, 365], [389, 394], [507, 513], [523, 536],
  [549, 557], [594, 600], [613, 624], [651, 676], [707, 725],
  [739, 746], [764, 776], [783, 809], [808, 846], [869, 886],
  [895, 921], [1028, 1038], [1047, 1055], [1065, 1072], [1148, 1155],
  [1220, 1228], [1246, 1254], [1275, 1284], [1308, 1324], [1331, 1342],
  [1356, 1371], [1374, 1388], [1428, 1439],
];

/** Keep a whole-minute viewing pass, plus the last frame and consecutive frames around changes. */
function retain(frame: number): boolean {
  return frame === 1439 || Math.floor(frame * 5 / 24) > Math.floor((frame - 1) * 5 / 24)
    || windows.some(([first, last]) => frame >= first! && frame <= last!);
}

/** Use the installed draw function and the same beauty request as AutoMovieDrawSession.frame. */
const bundle = await esbuild.build({
  stdin: {
    resolveDir: project,
    contents: `
      import { installAutoMovieDraw, parseAutoMovieInspectionRequest } from "@automovie/render";
      import { theLastCarry } from "./src/composition/films/the-last-carry.ts";
      window.mount = async () => {
        const film = theLastCarry(), production = await film.create();
        installAutoMovieDraw(() => ({
          "the-last-carry": { create: async () => ({
            scene: production.scene, camera: production.camera, durationSeconds: film.durationSeconds,
            width: film.width, height: film.height, fps: film.fps,
            seek: production.seek, dispose: production.dispose,
          }) },
        }));
        const port = window.__automovieDraw;
        const description = await port.describe();
        const request = { ...parseAutoMovieInspectionRequest(() => undefined), shade: "beauty" };
        const canvas = document.createElement("canvas");
        const { width, height } = description.subject;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        window.draw = async ({ seconds, witness }) => {
          const drawn = await port.draw({ seconds, view: "film", request, width, height, frame: [seconds], scale: 1 });
          const rgba = new Uint8ClampedArray(Uint8Array.fromBase64(drawn.pixels).buffer);
          context.putImageData(new ImageData(rgba, width, height), 0, 0);
          return {
            png: canvas.toDataURL("image/png").split(",")[1],
            camera: production.camera.quaternion.toArray(),
            fov: production.camera.fov,
            motion: witness ? Object.fromEntries(["denis", "colin", "widow", "relief-bearer", "front-bearer-left"].map((role) => {
              const actor = production.scene.getObjectByName(role);
              return [role, { ...actor.userData, boot: actor.getObjectByName("left-boot").position.toArray() }];
            })) : undefined,
          };
        };
        return {
          width, height, fps: film.fps, seconds: film.durationSeconds, gpu: description.renderer,
        };
      };
    `,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  logLevel: "silent",
});

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.route("http://last-carry.test/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<!doctype html><meta charset=utf-8>" }),
  );
  await page.goto("http://last-carry.test/");
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const meta = await page.evaluate(() => (window as any).mount());
  const total = meta.seconds * meta.fps;
  if (total !== 1440 || meta.width !== 1280 || meta.height !== 720 || meta.fps !== 24) {
    throw new Error("The production clock or 720p raster has changed");
  }
  console.log(meta);

  const encoder = preview ? undefined : spawn(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-n",
    "-f", "image2pipe", "-framerate", String(meta.fps), "-c:v", "png", "-i", "pipe:0",
    "-i", sound, "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "libx264", "-preset", "fast", "-crf", "16",
    "-vf", "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-c:a", "aac", "-b:a", "256k", "-af", "volume=-0.35dB",
    "-movflags", "+faststart", join(root, "film.mp4"),
  ], { stdio: ["pipe", "inherit", "inherit"], windowsHide: true });
  const finished = encoder ? once(encoder, "close") : undefined;
  const frames: { frame: number; seconds: number; sha256: string; camera: number[]; fov: number; source: boolean; motion?: unknown }[] = [];
  try {
    for (const frame of preview ?? Array.from({ length: total }, (_, index) => index)) {
      const seconds = frame / meta.fps;
      const saved = preview !== undefined || retain(frame);
      const payload = await page.evaluate(
        (arg) => (window as any).draw(arg),
        { seconds, witness: saved },
      );
      const bytes = Buffer.from(payload.png, "base64");
      if (saved) await writeFile(join(source, frame.toString().padStart(4, "0") + ".png"), bytes);
      frames.push({
        frame,
        seconds,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        camera: payload.camera,
        fov: payload.fov,
        source: saved,
        motion: payload.motion,
      });
      if (encoder && finished && !encoder.stdin.write(bytes)) {
        await Promise.race([
          once(encoder.stdin, "drain"),
          finished.then(([code]) => { throw new Error(`FFmpeg ended early with status ${code}`); }),
        ]);
      }
      if (frame % 120 === 0) console.log(`Rendered ${frame}/${total}`);
    }
    if (encoder && finished) {
      encoder.stdin.end();
      const [code] = await finished;
      if (code !== 0) throw new Error(`FFmpeg failed with status ${code}`);
    }
    await writeFile(join(root, "render-report.json"), JSON.stringify({
      ...meta,
      count: frames.length,
      chromium: browser.version(),
      sourceCodec: "PNG of installed @automovie/render beauty RGBA",
      draw: "installAutoMovieDraw / film / beauty / area-reduced supersampling",
      windows,
      frames,
    }, null, 2));
    console.log(`Rendered ${frames.length} frames to ${root}`);
  } catch (error) {
    encoder?.stdin.destroy();
    encoder?.kill();
    await finished?.catch(() => undefined);
    throw error;
  }
} finally {
  await browser.close();
}
