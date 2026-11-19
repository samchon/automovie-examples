/** Run the installed AutoMovie film draw in Chromium and retain addressed WebCodecs packets. */
import { createHash } from "node:crypto";
import { copyFileSync, createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pipeline } from "node:stream/promises";

import { chromium } from "playwright";

import { needsRepairDraw, repairPlan, retainedBundle } from "./repair-plan.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const output = resolve(projectRoot, process.env.ROUND_CACHE || ".cache/direct-render");
const mode = process.argv[2] || "pilot";
const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve("vite/package.json"));
const totalFrames = 5400;
const packetFrames = 90;
const width = 1280;
const height = 720;

if (mode !== "pilot" && mode !== "encode" && mode !== "repair") throw Error(`Unknown render mode ${mode}.`);
const start = Number(process.argv[3] ?? 0);
const end = Number(process.argv[4] ?? totalFrames);
if (mode === "encode" && (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > totalFrames || end <= start))
  throw Error("Invalid inclusive/exclusive frame range.");

let retained;
if (mode === "repair") {
  if (process.argv.length !== 3 || !process.env.ROUND_RETAINED_CACHE)
    throw Error("Set ROUND_RETAINED_CACHE to the reviewed full predecessor packet cache.");
  const directory = resolve(projectRoot, process.env.ROUND_RETAINED_CACHE);
  if (directory === output) throw Error("Give the repair a separate output cache.");
  const review = JSON.parse(readFileSync(resolve(directory, `range-0-${totalFrames}.json`), "utf8"));
  if (review.bundleSha !== repairPlan.previousBundle || review.low !== 0 || review.high !== totalFrames
    || JSON.stringify(review.retainedPicture) !== JSON.stringify(repairPlan.previousPlan)
    || review.receipts.length !== totalFrames / packetFrames)
    throw Error("The retained packet cache is not the reviewed predecessor.");
  retained = { directory, packets: new Map(review.receipts.map((packet) => [packet.start, packet])) };
}

mkdirSync(output, { recursive: true });
const built = await viteRequire("esbuild").build({
  entryPoints: [resolve(projectRoot, "production/stage.ts")],
  bundle: true,
  write: false,
  minify: true,
  format: "esm",
  target: "es2022",
  platform: "browser",
  define: { "process.env.NODE_ENV": '"production"' },
});
const bundle = built.outputFiles[0].contents;
const bundleSha = createHash("sha256").update(bundle).digest("hex");
const html = Buffer.from(`<!doctype html><meta name="color-scheme" content="dark">
<canvas width="${width}" height="${height}"></canvas><script type="module" src="/stage.js"></script>`);
let currentPacket;
const server = createServer(async (request, reply) => {
  try {
    if (request.method === "GET" && request.url === "/") {
      reply.setHeader("Content-Type", "text/html");
      reply.end(html);
      return;
    }
    if (request.method === "GET" && request.url === "/stage.js") {
      reply.setHeader("Content-Type", "text/javascript");
      reply.end(bundle);
      return;
    }
    if (request.method === "POST" && currentPacket && request.url === currentPacket.url) {
      await pipeline(request, createWriteStream(currentPacket.pending));
      reply.end("saved");
      return;
    }
    reply.writeHead(404).end();
  } catch (error) {
    reply.writeHead(500).end(String(error));
  }
});

async function packetDigest(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

const executablePath = process.env.CHROME_PATH || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find(existsSync);
let browser;
try {
  await new Promise((ready, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", ready);
  });
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-gl=angle", "--use-angle=d3d11",
      "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
  });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => console.error(error));
  await page.goto(`http://127.0.0.1:${server.address().port}`, { timeout: 180000 });
  await page.waitForFunction(() => window.ready, {}, { timeout: 240000 });
  const backend = { ...await page.evaluate(() => window.renderInfo()), chromium: browser.version() };
  console.log(backend);

  if (mode === "pilot") {
    const defaults = [0, 2, 11, 22, 37.4, 42, 65, 86, 120, 147, 150, 151.5, 157, 165, 170.1, 172.5, 175.5, 178.5, 179.5];
    const seconds = process.argv.length > 3 ? process.argv.slice(3).map(Number) : defaults;
    if (!seconds.every((time) => Number.isFinite(time) && time >= 0 && time <= totalFrames / 30))
      throw Error("Pilot times must be inside the 180-second programme.");
    for (const time of seconds) {
      const bytes = await page.evaluate((at) => window.frame(at), time);
      const name = `t${String(Math.round(time * 1000)).padStart(6, "0")}.png`;
      writeFileSync(resolve(output, name), Buffer.from(bytes, "base64"));
    }
    console.log(`Captured ${seconds.length} full ${width}×${height} source frames.`);
  } else {
    const receipts = [];
    for (let low = start; low < end; low += packetFrames) {
      const high = Math.min(end, low + packetFrames);
      const interval = `${low}-${high}`;
      const receiptFile = resolve(output, `frames-${interval}.json`);
      const packet = resolve(output, `frames-${interval}.h264`);
      const retain = retained && !needsRepairDraw(low, high);
      const source = retain ? retainedBundle(low, high) : bundleSha;
      if (existsSync(receiptFile) && existsSync(packet)) {
        const previous = JSON.parse(readFileSync(receiptFile, "utf8"));
        if (previous.start === low && previous.end === high && previous.source === source
          && previous.frames === high - low && previous.bytes === statSync(packet).size
          && previous.sha256 === await packetDigest(packet)) {
          receipts.push(previous);
          continue;
        }
      }

      const pending = `${packet}.pending`;
      if (retain) {
        const previous = retained.packets.get(low);
        const priorFile = resolve(retained.directory, `frames-${interval}.h264`);
        if (!previous || previous.end !== high || previous.source !== source || previous.frames !== high - low
          || previous.bytes !== statSync(priorFile).size || previous.sha256 !== await packetDigest(priorFile))
          throw Error(`The retained packet failed verification at ${interval}.`);
        copyFileSync(priorFile, pending);
        renameSync(pending, packet);
        writeFileSync(receiptFile, JSON.stringify(previous));
        receipts.push(previous);
        console.log("retained", low, high, previous.bytes);
        continue;
      }
      currentPacket = { url: `/packet/${interval}`, pending };
      const data = await page.evaluate(([first, last]) => window.encode(first, last), [low, high]);
      currentPacket = undefined;
      if (data.frames !== high - low || data.bytes < 128 || data.bytes !== statSync(pending).size)
        throw Error(`Incomplete packet ${interval}.`);
      const receipt = { ...data, source: bundleSha, sha256: await packetDigest(pending) };
      renameSync(pending, packet);
      writeFileSync(receiptFile, JSON.stringify(receipt));
      receipts.push(receipt);
      console.log(low, high, receipt.bytes);
    }
    const range = {
      low: start,
      high: end,
      backend,
      bundleSha,
      receipts,
      ...(retained ? { retainedPicture: repairPlan } : {}),
    };
    writeFileSync(resolve(output, `range-${start}-${end}.json`), JSON.stringify(range, null, 2));
  }
} finally {
  await browser?.close();
  server.close();
}
