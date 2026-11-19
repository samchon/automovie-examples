# sword

Use an LLM to author a complete movie screenplay, then program the main scenes' motion, staging and camera and assemble the whole video as a reproducible motion hint. Every person is a polygon man, drawn from the body the installed Human package prepares, and every other subject is the simplest form that identifies it, as [entity work](../../../.agents/skills/development/entities.md#coarse-first) sets; the accuracy goes to motion.

## First run

Use Node.js 22.23.2 or later. Inside an AutoMovie workspace, run `pnpm install` once at the workspace root instead; the other commands still run here.

```powershell
pnpm install
pnpm run lint
pnpm run evidence
pnpm test
```

The project includes instructions, contracts and an inspector for the four commissioned films.

Read the [production workflow](../../../.agents/skills/production/workflow.md) for the stages, their handoffs and the skills that own them.

Default lint and evidence check ordinary TypeScript source and tests. [Evidence configuration](../../../.agents/skills/evidence/configuration.md) adds the narrative scope and stages to the same configuration.

## Films and the inspector

Each delivered video is one film in `src/composition/films/`, registered in `src/composition/films/index.ts` under its [film name](../../../.agents/skills/development/source-layout.md#source). A film supplies its running time, frame rate and raster and composes its corresponding screenplay scenes.

`pnpm run dev` serves [the inspector](http://127.0.0.1:5173/) over the films of `src/subjects.ts`, the same subjects the capture draws. Its address carries the request, such as [The Better Seat at two seconds through the front view](http://127.0.0.1:5173/?subject=the-better-seat&at=2&views=front). The panels edit that request and show the matching `automovie capture` command. Failed requests show their reason. Play, pause and seek use the same performance as export.

## Stills

Run `pnpm run review:setup` once to install the browser. `pnpm run capture --subject <film> [request]` runs `automovie capture --module src/subjects.ts`: it draws each planned still of the film through the delivery render's draw function and writes the stills, contact sheets and a record into `media/capture/<film>/`, as the [render README](https://github.com/samchon/automovie/tree/master/packages/render#capture) describes, exiting non-zero when a cell could not be drawn. `pnpm exec automovie capture --file <video>` captures an encoded file's own frames around its cuts instead of a film.

The request takes the inspector address's keys, each written with `--` before it. The [render README](https://github.com/samchon/automovie/tree/master/packages/render#request-keys) lists every key with what it asks for and the requirement it serves, including marks, rounds, comparisons and the options that select exact frames or seconds.

```powershell
pnpm run capture --subject the-better-seat --from 12 --to 14 --events 13.1 --views "right;three-quarter@ortho"
pnpm exec automovie capture --file media/automovie/the-better-seat/videos/the-better-seat.mp4 --from 27 --to 35
```

## Render and playback

For a picture-only export, point `--out` under `.cache` so the command preserves the encoded sound master. Run from this directory in PowerShell.

```powershell
pnpm run render --subject answer-me --out .cache/rendered-picture/answer-me
```

This runs `automovie render --module src/subjects.ts` with the named subject. The renderer draws each frame through the capture's draw function in the browser installed by `pnpm run review:setup`. It writes `film.mp4` and `render-report.json` to the explicit output directory. `CHROME_PATH` and `FFMPEG_PATH` select alternatives to the installed browser and FFmpeg. The [delivery review](../../../.agents/skills/review/delivery-review.md) uses the report's frame hashes. Follow the [media manifest](media/manifest.json) to restore a sound master.

With `pnpm run dev` running, `pnpm run review --url <inspector-address> --seconds <s>` runs `automovie review`: it presses the inspector's Play button and records real-time playback as a video, with the time readout it showed and the page's errors, into `media/automovie/review/` or `--out <dir>`, for the user to watch. `pnpm run review:setup` installs its recording FFmpeg and headless Chromium.

## Physical performance

[Physical feedback](../../../.agents/skills/motion/physical-feedback.md) chooses each scene's physical mode; the installed Engine's README and public declarations own its profiles, simulation, checkpoints, archives and audits.

`pnpm run physics <input-module.ts> <output.amphys> [maximum-bytes]` computes a simulated performance once from a Node module exporting `createPhysicalInput()` and writes the archive with its JSON manifest, 256 MiB at most by default. Keep the archive as a [stage cache](../../../.agents/skills/production/stage-caches.md) under `.cache/` and regenerate it after changing physical inputs; playback, seeking and capture read it through the Engine's physical playback, which checks it against the current input's identity.

Supply `IFilmProduction.performance` from the displayed state. `src/markFilmProduction.ts` gives it to each inspection host, and `marks=joint,bone,contact` draws its skeleton and contact forces.

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
| `pnpm run render --subject answer-me --out .cache/rendered-picture/answer-me` | Export the named film's picture to a separate directory |
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
