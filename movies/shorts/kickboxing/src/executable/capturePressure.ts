import {
  AutoMovieCaptureFolder,
  AutoMovieDrawSession,
  parseAutoMovieCapturePlanRequest,
  planAutoMovieCapture,
  runAutoMovieCapture,
} from "@automovie/render";
import {
  planAutoMovieChromiumLaunch,
  readAutoMovieRevision,
  serveAutoMovieDrawPage,
} from "automovie";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium, type Browser, type Page } from "playwright-core";
import * as vite from "vite";

/**
 * Inspect the pressure rehearsal through the installed draw/capture APIs.
 * Native schedule preparation exceeded the CLI host's fixed 120 seconds;
 * the public draw-session timeout permits fifteen minutes for this case.
 * The SDK still owns page construction, drawing, planning, every recorded
 * cell and resource retirement. This command changes no motion or SDK code.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the concrete rehearsal, supported timeout, unchanged drawing path and observation limits.
 * @evidence contracts/development/implementation.md#principled-implementation Composes the installed public page, Chromium, draw session, capture planner and folder APIs with Node filesystem storage.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Open the page/server, browser and session; run one native capture; close each owned resource in finally.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No SDK patch, browser screenshot fallback, new body, pose, motion solver, dynamic simulation or suppressed page/cell error.
 * @evidence contracts/development/implementation.md#efficient-algorithms One native subject preparation serves both views and every contact frame; no preparation or physical audit runs per cell.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the same installed capture core as the CLI; only its already-supported session timeout differs.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Session, browser and temporary served build close on every outcome; the native folder records all owned output and failures.
 */
export async function capturePressure(): Promise<void> {
  const root: string = process.cwd();
  const served: Awaited<ReturnType<typeof serveAutoMovieDrawPage>> = await serveAutoMovieDrawPage({ root, module: "src/subjects.ts", vite });
  try {
    const launch: ReturnType<typeof planAutoMovieChromiumLaunch> = planAutoMovieChromiumLaunch("software", process.env);
    const browser: Browser = await chromium.launch({ headless: true, args: launch.args, ...(launch.executablePath === undefined ? {} : { executablePath: launch.executablePath }) });
    const backend: string = `${launch.name}; Chromium ${browser.version()}`;
    try {
      const page: Page = await browser.newPage();
      const failed: Promise<never> = new Promise((_resolve, reject): void => {
        page.on("pageerror", (error: Error): void => {
          reject(new Error(`The pressure draw page failed: ${error.message}`, { cause: error }));
        });
      });
      const session: AutoMovieDrawSession = await Promise.race([
        AutoMovieDrawSession.open({ page, url: served.url, props: { subject: "catalog", props: null }, backend, timeout: 15 * 60_000 }),
        failed,
      ]);
      try {
        const request: ReturnType<typeof parseAutoMovieCapturePlanRequest> = parseAutoMovieCapturePlanRequest(new URLSearchParams({
          subject: "catalog", from: "10.7", to: "18.2", rate: "4",
          events: "11.652570549,13.738512923,14.121628,14.967594505,15.335194183,15.682646277,17.13",
          window: "2", views: "film;4,4,-5:0,0.9,0@ortho=0.006", marks: "joint,bone", xray: "true",
          round: "pressure-003-native-give",
        }));
        const plan: ReturnType<typeof planAutoMovieCapture> = planAutoMovieCapture({ request, subject: session.subject, cuts: [] });
        const folder: AutoMovieCaptureFolder = await AutoMovieCaptureFolder.open({ storage: fs, root: path.join(root, "media", "capture", "catalog"), round: request.round, compare: request.compare });
        const record: Awaited<ReturnType<typeof runAutoMovieCapture>> = await runAutoMovieCapture({
          plan, folder, revision: readAutoMovieRevision(root), match: "cell",
          draw: cell => session.drawing(cell, plan),
          section: { preparationTimeoutMilliseconds: 15 * 60_000, mode: "native kinematic rehearsal", source: "pressure-003" },
        });
        const failures: number = record.rows.filter(row => row.state === "failed").length;
        console.info(JSON.stringify({ state: record.state, drawn: record.rows.length - failures, cells: record.rows.length, sheets: record.sheets, backend: session.backend }));
        if (failures > 0) throw new Error(`${failures} pressure inspection cells were not drawn`);
      } finally { await session.close(); }
    } finally { await browser.close(); }
  } finally { await served.close(); }
}

capturePressure().catch((error: unknown): void => {
  console.error(error);
  process.exitCode = 1;
});
