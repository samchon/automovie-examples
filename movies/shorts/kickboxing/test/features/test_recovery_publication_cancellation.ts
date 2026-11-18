import { TestValidator } from "@nestia/e2e";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { publishAutoMovieRecoveryArtifact } from "../../src/executable/recovery/node/publishAutoMovieRecoveryArtifact";

/**
 * Recovery publication honors the AbortSignal provided by the pinned SDK.
 *
 * Scenarios:
 * 1. A cancelled publication leaves an empty directory untouched.
 * 2. A live signal permits publication. Cancelling it preserves the published bytes.
 *
 * @evidence contracts/development/testing.md#behavioral-verification Calls the project's publication host and reads its directory and published file after each outcome.
 * @evidence contracts/development/testing.md#independent-expectations A real AbortController determines cancellation. The supplied object determines the expected JSON, and a read before cancellation supplies the exact bytes that must survive it.
 * @evidence contracts/development/testing.md#distinguishing-cases Exercises a new target, successful publication and cancellation with a target already present.
 * @evidence contracts/development/testing.md#execution-ownership Owns one temporary directory and removes it in finally. The test uses the release SDK's signal contract.
 * @evidence contracts/development/common.md#meaningful-documentation Describes the observable terminal state and file effects for both signal states.
 */
export function test_recovery_publication_cancellation(): void {
  const directory: string = fs.mkdtempSync(
    path.join(os.tmpdir(), "kickboxing-publication-"),
  );
  const output: string = path.join(directory, "artifact.json");
  try {
    const stopped: AbortController = new AbortController();
    stopped.abort();
    const publish = (
      value: number,
      signal: AbortSignal,
    ): ReturnType<typeof publishAutoMovieRecoveryArtifact>["status"] =>
      publishAutoMovieRecoveryArtifact(output, { value }, { signal }).status;
    TestValidator.equals(
      "already cancelled",
      publish(7, stopped.signal),
      "cancelled",
    );
    TestValidator.equals("no partial file", fs.readdirSync(directory), []);

    const live: AbortController = new AbortController();
    TestValidator.equals("published", publish(7, live.signal), "complete");
    const bytes: string = fs.readFileSync(output, "utf8");
    TestValidator.equals("data written", JSON.parse(bytes), { value: 7 });
    live.abort();
    TestValidator.equals(
      "cancelled after publication",
      publish(9, live.signal),
      "cancelled",
    );
    TestValidator.equals(
      "retained bytes",
      fs.readFileSync(output, "utf8"),
      bytes,
    );
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
}
