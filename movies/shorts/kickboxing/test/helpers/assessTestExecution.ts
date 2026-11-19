import type { DynamicExecutor } from "@nestia/e2e";

/**
 * Preserve assertion failures and require valid, nondecreasing executor timestamps.
 * Milliseconds describe the run; elapsed duration has no acceptance threshold.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Identifies the executor input, timestamp validity, error preservation and nullable elapsed result in milliseconds.
 * @evidence contracts/development/implementation.md#principled-implementation Converts the executor timestamps to millisecond values and accepts only a finite, nondecreasing interval with a null error.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure One pure result check owns timestamp validity. The harness owns reporting and the process outcome.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The executor's actual error and timestamps decide the result. There is no elapsed-time threshold or case-name exception.
 * @evidence contracts/development/implementation.md#efficient-algorithms Parses two timestamps and constructs one small result without scanning any other execution.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Each input is evaluated independently. No prior run changes the interpretation.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned result owns its primitive values. The function retains no executor, task or handle.
 */
export function assessTestExecution(
  execution: Pick<
    DynamicExecutor.IExecution,
    "error" | "started_at" | "completed_at"
  >,
): { passed: boolean; elapsedMs: number | null } {
  const started: number = new Date(execution.started_at).getTime();
  const completed: number = new Date(execution.completed_at).getTime();
  const elapsedMs: number | null =
    Number.isFinite(started) &&
    Number.isFinite(completed) &&
    completed >= started
      ? completed - started
      : null;
  return { passed: execution.error === null && elapsedMs !== null, elapsedMs };
}
