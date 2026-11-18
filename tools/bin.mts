#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

// Load the linked SDK sources with the same TypeScript runtime as the checkout's CLI.
const checkout = resolve(import.meta.dirname, "../..");
const load = createRequire(resolve(checkout, "package.json"));
const manifest = load.resolve("ttsc/package.json");
const launcher = resolve(dirname(manifest), load(manifest).bin.ttsx);
const result = spawnSync(
  process.execPath,
  [
    launcher,
    "--no-plugins",
    "-P",
    resolve(checkout, "packages/cli/tsconfig.json"),
    resolve(import.meta.dirname, "automovie.ts"),
    ...process.argv.slice(2),
  ],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
