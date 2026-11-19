# slam-dunk

Use an LLM to author a complete movie screenplay, then program the main scenes' motion, staging and camera and assemble the whole video as a reproducible motion hint. Every person is a polygon man, drawn from the body the installed Human package prepares, and every other subject is the simplest form that identifies it, as [entity work](../../../.agents/skills/development/entities.md#coarse-first) sets; the accuracy goes to motion.

## First run

Use Node.js 22.23.2 or later. Inside an AutoMovie workspace, run `pnpm install` once at the workspace root instead; the other commands still run here.

```powershell
pnpm install
pnpm run lint
pnpm run evidence
pnpm test
```

The commissioner discarded the 180-second 3D basketball broadcast **Two Hands** after viewing it at normal speed. The source and historical screenplay remain available for audit. The next production starts again from screenplay. [Withdrawal](docs/acceptance/two-hands.md#round-four-3d-film-rejected) · [Withdrawn MP4 archive](.cache/withdrawn-films/2026-11-19/media/automovie/two-hands/videos/film.mp4) · [Forensic review](docs/acceptance/two-hands-3d-review-forensics.md)

Read the [production workflow](../../../.agents/skills/production/workflow.md) for the stages, their handoffs and the skills that own them.

Default lint and evidence check ordinary TypeScript source and tests. [Evidence configuration](../../../.agents/skills/evidence/configuration.md) adds the narrative scope and stages to the same configuration.

## Films and the inspector

Each delivered video is one film in `src/composition/films/`, registered in `src/composition/films/index.ts` under its [film name](../../../.agents/skills/development/source-layout.md#source), which its folder's path gives, with its running time, frame rate and optional `width` × `height` delivery raster: 1280 × 720 by default, 720 × 1280 for a vertical short. The registered film is `two-hands`. Its scene samples all ten players, two officials, the basketball and the two broadcast cameras from the same clock.

`pnpm run dev` serves [the inspector](http://127.0.0.1:5173/) over the films of `src/subjects.ts`, the same subjects the capture draws. The page holds one request in the capture's grammar: its panels edit it, its address carries it, such as [Two Hands at the dunk](http://127.0.0.1:5173/?subject=two-hands&at=24.9), and it shows the `automovie capture` command whose options, given to `pnpm run capture`, repeat the picture. A request the capture refuses is refused on the page too, with the reason. Play, pause and seek run the same deterministic performance as export.

## Stills

Run `pnpm run review:setup` once to install the browser. `pnpm run capture --subject <film> [request]` runs `automovie capture --module src/subjects.ts`: it draws each planned still of the film through the delivery render's draw function and writes the stills, contact sheets and a record into `media/capture/<film>/`, as the [render README](https://github.com/samchon/automovie/tree/master/packages/render#capture) describes, exiting non-zero when a cell could not be drawn. `pnpm exec automovie capture --file <video>` captures an encoded file's own frames around its cuts instead of a film.

The request takes the inspector address's keys, each written with `--` before it. The [render README](https://github.com/samchon/automovie/tree/master/packages/render#request-keys) lists every key with what it asks for and the requirement it serves, including marks, rounds, comparisons and the options that select exact frames or seconds.

```powershell
pnpm run capture --subject catalog --from 12 --to 14 --events 13.1 --views "right;three-quarter@ortho"
pnpm exec automovie capture --file media/automovie/<film>/videos/film.mp4 --from 60 --to 70
```

## Render and playback

The finished broadcast adds a local Microsoft Heami Korean speech track, stereo court effects and a switchable Korean subtitle stream to the picture. From this directory in PowerShell on Windows, run:

```powershell
./tools/finish-two-hands.ps1
```

The result is `media/automovie/two-hands/videos/film.mp4`. To reuse a rendered picture and a prepared sound mix, pass their paths with `-Picture` and `-AudioDirectory`. The delivery record is [the Two Hands handoff](docs/acceptance/two-hands.md).


For a picture-only export, use a separate output directory.

```powershell
pnpm run render --subject two-hands --out .cache/local-0.3.0/two-hands/picture
```

This runs `automovie render --module src/subjects.ts` and writes `film.mp4` and `render-report.json` under the specified directory. It draws every frame through the capture's draw function in the browser installed by `pnpm run review:setup`. `CHROME_PATH` selects another browser and `FFMPEG_PATH` another FFmpeg. The render report hashes the drawn frames. [Delivery review](../../../.agents/skills/review/delivery-review.md)

With `pnpm run dev` running, `pnpm run review --url <inspector-address> --seconds <s>` runs `automovie review`: it presses the inspector's Play button and records real-time playback as a video, with the time readout it showed and the page's errors, into `media/automovie/review/` or `--out <dir>`, for the user to watch. `pnpm run review:setup` installs its recording FFmpeg and headless Chromium.

## Physical performance

[Physical feedback](../../../.agents/skills/motion/physical-feedback.md) chooses each scene's physical mode; the installed Engine's README and public declarations own its profiles, simulation, checkpoints, archives and audits.

`pnpm run physics <input-module.ts> <output.amphys> [maximum-bytes]` computes a simulated performance once from a Node module exporting `createPhysicalInput()` and writes the archive with its JSON manifest, 256 MiB at most by default. Keep the archive as a [stage cache](../../../.agents/skills/production/stage-caches.md) under `.cache/` and regenerate it after changing physical inputs; playback, seeking and capture read it through the Engine's physical playback, which checks it against the current input's identity.

Supply `IFilmProduction.performance` from the displayed state: `src/markFilmProduction.ts` hands it to the inspection in every host, and `marks=joint,bone,contact` draws its skeleton and contact forces. This broadcast draws its players and ball directly from the staging clock.

## Make a motion hint

Follow the [production workflow](../../../.agents/skills/production/workflow.md) for the requested output and its delivery checks.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm exec ttsc --watch`, run in `test/` | The single compile checker, kept running while you edit; read compile errors from its output |
| `pnpm run lint` | TypeScript and source correctness |
| `pnpm run evidence` | Source and test checklists and the selected path's active evidence obligations |
| `pnpm test` | The exported `test_*` functions under `test/features`; an empty selection fails |
| `pnpm run format` | Source formatting |
| `pnpm run dev` | The inspector page on `127.0.0.1:5173` |
| `pnpm run build` | Bundle the inspector page |
| `pnpm run physics <input-module.ts> <output.amphys> [maximum-bytes]` | Precompute an adopted physical performance outside the browser |
| `pnpm run render --subject two-hands --out .cache/local-0.3.0/two-hands/picture` | Export the picture separately from the broadcast master |
| `pnpm run review --url <address> --seconds <s>` | Record real-time playback of the running inspector page |
| `pnpm run capture --subject <film> [request]` | Stills, sheets and a record of a film, with views, passes, marks and round comparison |
| `pnpm exec automovie capture --file <video> [request]` | Stills of an encoded file's own frames, around its cuts |

The project uses ES modules with `verbatimModuleSyntax` and `isolatedModules`: mark type-only imports and exports with `type`, and keep each file transformable on its own.

## Tests

`test/index.ts` discovers pure logic unit tests in `test/features/<source path>/test_<name>.ts` through `tsconfig.test.json`. Export a named `test_<name>(): void` or `Promise<void>` function and assert behavior with `node:assert/strict` or `TestValidator` from `@nestia/e2e`. Select test filenames with `pnpm test --include <substring> --exclude <substring>`; repeated options accumulate. Tests call portable logic directly; the inspector page and media inspection run separately.

## Project files

| Path, when used | Holds |
| --- | --- |
| `.agents/skills`, at this project's root or its workspace root | The task entry points `AGENTS.md` lists, their resources and the contracts |
| `PROJECT.md` | The current scope, choices and constraints [project context](../../../.agents/skills/production/project-context.md) defines |
| `index.html`, `src/main.ts`, `vite.config.ts` | The inspector page, its one-call mount of `@automovie/viewer` and the Vite configuration of both pages |
| `evidence.config.ts` | The duties selected through installed `@automovie/evidence`, which `pnpm run evidence` evaluates as the selected native graph |
| `lint.config.ts` | Generic source lint |
| `tsconfig.json` | Compiler settings |
| `tsconfig.test.json` | The scope of pure TypeScript unit tests |
| `package.json` | Dependencies and commands |

[Document layout](../../../.agents/skills/story/document-layout.md), [source layout](../../../.agents/skills/development/source-layout.md) and [media records](../../../.agents/skills/production/media-records.md) own every other location, such as `docs`, `references`, `src`, `test`, `public`, `.env` and `media`, and source layout also owns the dependency direction between source folders.
