import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  type AutoMovieCommand,
  readAutoMovieCommandArguments,
  run,
} from "../../packages/cli/src";

/** Run the checkout's CLI and connect each new workspace production to its built SDK types. */
async function main(): Promise<number> {
  const result: number = await run(process.argv);
  if (result !== 0) return result;

  const command: AutoMovieCommand = readAutoMovieCommandArguments(
    process.argv.slice(2),
  );
  if (command.command !== "add") return result;

  const target: string = join(
    "movies",
    command.family,
    command.directory,
    "tsconfig.json",
  );
  const config: { extends?: string | string[] } = JSON.parse(
    await readFile(target, "utf8"),
  );
  const sdk: string = "../../../tsconfig.sdk.json";
  config.extends =
    config.extends === undefined ? sdk : [config.extends, sdk].flat();
  await writeFile(target, JSON.stringify(config, null, 2) + "\n");
  return result;
}

void main().then((result: number) => {
  process.exitCode = result;
});
