import type { IAutoMovieSchedule } from "@automovie/engine";
import type { HumanPerformance } from "@automovie/motions";
import { AutoMovieCaptureFolder, AutoMovieDrawSession, parseAutoMovieCapturePlanRequest, planAutoMovieCapture, runAutoMovieCapture } from "@automovie/render";
import { captureAutoMovie, planAutoMovieChromiumLaunch, readAutoMovieRevision, serveAutoMovieDrawPage } from "automovie";
import * as fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { chromium, type Browser, type Page } from "playwright-core";
import * as vite from "vite";

/**
 * Inspect the complete generated film in one native GPU capture. Five-Hz
 * coverage spans every phase; consecutive frames surround reported contacts,
 * declared impacts, cuts, replants, counting strokes and phase boundaries. Existing SDK failures are
 * observations to disclose, not a reason to fabricate corrected pictures.
 * A second positional argument names an encoded file: captureRound.ts
 * whole-artifact-001 media/automovie/kickboxing/videos/film.mp4 captures the
 * same times from its own frames, through the native file-capture command.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Defines the complete interval, matched views, actual native-event windows and observation limits.
 * @evidence contracts/development/implementation.md#principled-implementation Uses the installed page/session/capture/folder APIs and derives windows from reported native contacts, declared events and clipped entry ends.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Read generation provenance and build shared event times, then use native file capture or one owned drawing session.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No direct screenshot fallback, altered pose, hidden failed cell or physical audit.
 * @evidence contracts/development/implementation.md#efficient-algorithms One prepared native subject serves both views and every cell; native clips prevent browser schedule regeneration.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Source and encoded captures use the same native-event times; drawing uses the viewer and delivery renderer's public capture core.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Session, browser and served build close in finally; the native folder retains complete records and failed cells.
 */
export async function captureRound(): Promise<void> {
  const root: string = process.cwd();
  const sourceHash: ReturnType<typeof createHash> = createHash("sha256");
  const sourceFiles: string[] = (await fs.readdir(path.join(root, "src"), { recursive: true, withFileTypes: true })).filter(entry => entry.isFile() && entry.name.endsWith(".ts")).map(entry => path.join(entry.parentPath, entry.name));
  for (const file of sourceFiles.sort((one: string, other: string): number => one.localeCompare(other))) sourceHash.update(path.relative(root, file)).update(await fs.readFile(file));
  const sourceDigest: string = sourceHash.digest("hex");
  const receipt: { inputDigest: string; outputDigest: string; preparation: number; schedule: IAutoMovieSchedule; hits: ReturnType<HumanPerformance["hits"]> } = JSON.parse(await fs.readFile(path.join(root, "media/automovie/kickboxing/native-motion-receipt.json"), "utf8"));
  const events: number[] = receipt.schedule.entries.flatMap(entry => (entry.events ?? [])
    .filter(event => ["impact", "chamber", "replant", "strokeEnd", "seatContact", "lateral"].includes(event.name))
    .map(event => event.seconds - receipt.preparation))
    .filter(seconds => seconds >= 0 && seconds < 180);
  events.push(...receipt.hits.map(hit => hit.time - receipt.preparation).filter(seconds => seconds >= 0 && seconds < 180));
  events.push(...receipt.schedule.entries.filter(entry => entry.cut !== undefined).map(entry => entry.end - receipt.preparation).filter(seconds => seconds >= 0 && seconds < 180));
  for (let phase: number = 0; phase <= 11; phase++) events.push(phase * 15);
  events.push(150, 153, 157, 167.6, 168.1, 170.1, 179.9666666667);
  const file: string | undefined = process.argv[3];
  const parameters: URLSearchParams = new URLSearchParams({
    subject: "kickboxing", from: "0", to: "179.9666666667", rate: "5",
    events: [...new Set(events)].sort((one: number, other: number): number => one - other).join(","),
    window: "1", views: file === undefined ? "film;6,8,6:0,0.9,0@ortho=0.012" : "film",
    round: process.argv[2] ?? "whole-round-001",
  });
  const request: ReturnType<typeof parseAutoMovieCapturePlanRequest> = parseAutoMovieCapturePlanRequest(parameters);
  if (file !== undefined) {
    const status: number = await captureAutoMovie({ root, env: process.env, args: [
      "--file", file, "--out", "media/capture/kickboxing-encoded",
      ...[...parameters].flatMap(([key, value]) => [`--${key}`, value]),
    ] });
    if (status !== 0) throw new Error("Encoded full-film capture contains failed cells");
    return;
  }
  const served: Awaited<ReturnType<typeof serveAutoMovieDrawPage>> = await serveAutoMovieDrawPage({ root, module: "src/subjects.ts", vite });
  try {
    const launch: ReturnType<typeof planAutoMovieChromiumLaunch> = planAutoMovieChromiumLaunch("gpu", process.env);
    const browser: Browser = await chromium.launch({ headless: true, args: launch.args, ...(launch.executablePath === undefined ? {} : { executablePath: launch.executablePath }) });
    try {
      const page: Page = await browser.newPage();
      const failed: Promise<never> = new Promise((_resolve, reject): void => { page.on("pageerror", (error: Error): void => reject(error)); });
      const session: AutoMovieDrawSession = await Promise.race([
        AutoMovieDrawSession.open({ page, url: served.url, props: { subject: "kickboxing", props: null }, backend: `${launch.name}; Chromium ${browser.version()}`, timeout: 15 * 60_000 }),
        failed,
      ]);
      try {
        const plan: ReturnType<typeof planAutoMovieCapture> = planAutoMovieCapture({ request, subject: session.subject, cuts: [] });
        const folder: AutoMovieCaptureFolder = await AutoMovieCaptureFolder.open({ storage: fs, root: path.join(root, "media/capture/kickboxing"), round: request.round, compare: request.compare });
        console.info(JSON.stringify({ stage: "capture", cells: plan.cells.length, round: request.round }));
        const record: Awaited<ReturnType<typeof runAutoMovieCapture>> = await runAutoMovieCapture({
          plan, folder, revision: readAutoMovieRevision(root), match: "cell", draw: cell => session.drawing(cell, plan),
          section: {
            sourceDigest, nativeInputDigest: receipt.inputDigest, nativeOutputDigest: receipt.outputDigest,
            questions: ["Are all twelve phases and the shared ending present?", "Do both fighters retain readable heads, hands and feet in the film frame?", "Does travel retain ring geography and the southeast neutral stop?", "Are finish, count, result and celebration ordered at their declared instants?"],
            limits: "Native contact/fall/counting discrepancies remain disclosed; this capture proves neither continuous playback nor heard sound.",
          },
        });
        const failures: number = record.rows.filter(row => row.state === "failed").length;
        console.info(JSON.stringify({ stage: "complete", state: record.state, drawn: record.rows.length - failures, cells: record.rows.length, sheets: record.sheets, backend: session.backend }));
        if (failures !== 0) throw new Error(`${failures} full-film capture cells failed`);
      } finally { await session.close(); }
    } finally { await browser.close(); }
  } finally { await served.close(); }
}

captureRound().catch((error: unknown): void => { console.error(error); process.exitCode = 1; });
