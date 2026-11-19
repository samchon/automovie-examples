# kickboxing

## The Round

The commissioner withdrew R6 and returned the production to screenplay. The existing film and review evidence document the returned cut. [Commissioner’s return](docs/acceptance/the-round.md#commissioners-return)

The current production is a 180-second continuous ringside film. The film entry registers the `the-round` inspection subject. The scene owns the timed performance and camera. The entity folders own the cast, ring, crowd and props. The audio edit and picture share the cue times in `src/clock.ts`. [Film entry](src/composition/films/kickboxing.ts) · [Scene](src/composition/scenes/kickboxing/020-the-round/createRoundScene.ts) · [Entities](src/entities) · [Production profile](PROJECT.md)

Run the film commands from this directory in PowerShell. After installing the parent workspace, configure `CHROME_PATH`, `FFMPEG_PATH` or `FFPROBE_PATH` with absolute executable paths where the defaults are unavailable. The direct exporter calls the installed AutoMovie draw on Windows ANGLE/D3D11 and passes the film-camera beauty pixels to Chrome's H.264 encoder. The scaffold commands offer interactive inspection or picture-only rendering of the same subject.

```powershell
$env:ROUND_CACHE = '.cache/reproduction/picture'
$env:ROUND_SOUND_CACHE = '.cache/reproduction/sound'
$env:ROUND_OUTPUT = '.cache/reproduction/delivery/film.mp4'
$env:ROUND_REVIEW = '.cache/reproduction/frames'
& ./production/voice.ps1 -OutDirectory "$env:ROUND_SOUND_CACHE/lines"
node production/sound.mjs
node production/render.mjs encode 0 5400
node production/assemble.mjs
node production/captions.mjs
node production/review.mjs
node production/check-audio.mjs
```

The voice script uses the workspace's offline British Piper model by default. Use `-VoiceDirectory` to locate an equivalent install. To repeat the edit from identical dialogue inputs, put the 16 frozen dialogue WAVs and `voice.json` in the sound cache's `lines` directory in place of running the voice script. The render resumes verified 90-frame packets. The review script saves 900 decoded samples at 5 fps and consecutive full-size pictures around story events. The separate reproduction directory keeps the withdrawn R6 evidence and its review archive available. [Historical receipts](docs/acceptance/the-round.md)

The assembly records digests for the source bundle, render packets, sound mix and MP4. It assigns an exact 90 kHz picture clock at 3,000 ticks per frame and sets the AVC range flag to match the WebCodecs RGBA samples. Source and cue timing are fixed. Encoding and freshly synthesized dialogue can differ by host and run.

To keep separate comparison runs, set `ROUND_CACHE` for verified picture packets, `ROUND_SOUND_CACHE` for audio inputs and the stereo mix, `ROUND_OUTPUT` for the assembled MP4 and `ROUND_REVIEW` for decoded frame evidence. The comparison cut uses authored pose tracks. The current scene additionally resolves supported travel, guard, signals, claps and salutes through the installed motion vocabulary. See the production profile for the remaining authored staging and the measured refusal. The installed Human SDK supplies the mounted canonical bodies and the standard inspector, capture and GPU export share the registered draw subject. The inspector shows black at the 180-second out-point. The 180-second MP4 presents frames 0 through 5,399 and ends on that boundary.

The targeted Edition 020 repair can also reuse the verified preceding cut’s packets. Set `ROUND_RETAINED_CACHE` to that cut’s 60-packet cache and `ROUND_CACHE` to a separate directory, then run `node production/render.mjs repair` and assemble it normally. The repair span map and the two source identities are in its render report. With `ROUND_OUTPUT` set to the repair MP4, `node production/check-repair.mjs` verifies all retained decoded frames against the preceding cut.

For the witness staging pass, set `ROUND_REPAIR_STAGE` to `attention`, `ROUND_RETAINED_CACHE` to the support repair’s packet cache, and `ROUND_RETAINED_MOVIE` to its MP4. Use the same settings for rendering, assembly and the retained-frame check.

Use an LLM to author a complete screenplay and program its motion, staging and camera in 3D. Assemble the result as a reproducible motion hint or finish it as a direct 3D or generated film. Start with the polygon man prepared by the installed Human package and [coarse forms](../../../.agents/skills/development/entities.md#coarse-first) for the other subjects.

## First run

Use Node.js 22.23.2 or later. Inside an AutoMovie workspace, run `pnpm install` once at the workspace root instead; the other commands still run here.

```powershell
pnpm install
pnpm run lint
pnpm run evidence
pnpm test
```

The project starts with instructions, contracts and a working inspector page over an empty starter film. Passing checks do not complete a production.

Read the [production workflow](../../../.agents/skills/production/workflow.md) for the stages, their handoffs and the skills that own them.

Default lint and evidence check ordinary TypeScript source and tests. [Evidence configuration](../../../.agents/skills/evidence/configuration.md) adds the narrative scope and stages to the same configuration.

## Films and the inspector

Each delivered video is one film in `src/composition/films/`, registered in `src/composition/films/index.ts` under its [film name](../../../.agents/skills/development/source-layout.md#source), which its folder's path gives, with its running time, frame rate and optional `width` × `height` delivery raster: 1280 × 720 by default, 720 × 1280 for a vertical short. Each film composes its own scenes; the starter film `src/composition/films/starter.ts` holds an empty one.

`pnpm run dev` serves [the inspector](http://127.0.0.1:5173/) over the films of `src/subjects.ts`, the same subjects the capture draws. The page holds one request in the capture's grammar: its panels edit it, its address carries it, such as [the starter at 2 seconds through the front view](http://127.0.0.1:5173/?subject=starter&at=2&views=front), and it shows the `automovie capture` command whose options, given to `pnpm run capture`, repeat the picture. A request the capture refuses is refused on the page too, with the reason. Play, pause and seek run the same deterministic performance as export.

## Stills

Run `pnpm run review:setup` once to install the browser. `pnpm run capture --subject <film> [request]` runs `automovie capture --module src/subjects.ts`: it draws each planned still of the film through the delivery render's draw function and writes the stills, contact sheets and a record into `media/capture/<film>/`, as the [render README](https://github.com/samchon/automovie/tree/master/packages/render#capture) describes, exiting non-zero when a cell could not be drawn. `pnpm exec automovie capture --file <video>` captures an encoded file's own frames around its cuts instead of a film.

The request takes the inspector address's keys, each written with `--` before it. The [render README](https://github.com/samchon/automovie/tree/master/packages/render#request-keys) lists every key with what it asks for and the requirement it serves, including marks, rounds, comparisons and the options that select exact frames or seconds.

```powershell
pnpm run capture --subject catalog --from 12 --to 14 --events 13.1 --views "right;three-quarter@ortho"
pnpm exec automovie capture --file media/automovie/<film>/videos/film.mp4 --from 60 --to 70
```

## Render and playback

`pnpm run render --subject <film>` runs `automovie render --module src/subjects.ts`, and `--subject` may be omitted while only one film exists. It draws every frame in the browser `pnpm run review:setup` installs, through the capture's draw function, and encodes them once, picture only, with no server running. `CHROME_PATH` selects another browser and `FFMPEG_PATH` another FFmpeg.

The render writes `media/automovie/<film>/videos/film.mp4`, or into `--out <dir>`, with `render-report.json` beside it. Export requires a whole number of frames. The report's hashes describe the drawn frames, and [delivery review](../../../.agents/skills/review/delivery-review.md) judges the film.

With `pnpm run dev` running, `pnpm run review --url <inspector-address> --seconds <s>` runs `automovie review`: it presses the inspector's Play button and records real-time playback as a video, with the time readout it showed and the page's errors, into `media/automovie/review/` or `--out <dir>`, for the user to watch. `pnpm run review:setup` installs its recording FFmpeg and headless Chromium.

## Physical performance

[Physical feedback](../../../.agents/skills/motion/physical-feedback.md) defines when to simulate. Read the installed Engine's README and types for its simulation and playback APIs.

`pnpm run physics <input-module.ts> <output.amphys> [maximum-bytes]` computes a simulated performance once from a Node module exporting `createPhysicalInput()` and writes the archive with its JSON manifest, 256 MiB at most by default. Keep the archive as a [stage cache](../../../.agents/skills/production/stage-caches.md) under `.cache/` and regenerate it after changing physical inputs; playback, seeking and capture read it through the Engine's physical playback, which checks it against the current input's identity.

Supply `IFilmProduction.performance` from the displayed state: `src/markFilmProduction.ts` hands it to the inspection in every host, and `marks=joint,bone,contact` draws its skeleton and contact forces. The starter's empty scene supplies none.

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
| `pnpm run render --subject <film>` | Export one film as a picture-only video |
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
