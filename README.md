# automovie-examples

This workspace holds example films used to evaluate AutoMovie. Productions share skills, contracts and local packages. Each production's `PROJECT.md` records its commission.

## Film production

The commissioning viewer rejected all six AutoMovie 0.3.0 films after watching them on 19 November 2026. All six return to screenplay. The withdrawn set comprises [The Round](movies/shorts/kickboxing/PROJECT.md), [두 번째 손](movies/shorts/slam-dunk/PROJECT.md) and four one-minute films on [the Great St Bernard road](movies/shorts/sword/PROJECT.md). The [review report](docs/benchmarks/0.3.0-film-review-return.md) explains how the film reviews handled the evidence.

The [film tools](docs/direct-3d-tools.md) restore the offline English voices and Windows video probe used for these editions.

The [benchmark notes](docs/benchmarks/0.3.0-direct-3d.md) record what people could follow on screen, where a cut sent its screenplay back to the writer and which SDK capabilities the production exercised.

## Screenplays

| Production | What to read |
| --- | --- |
| Kickboxing | Two neighbours follow a three-minute bout from the glove touch to the last clap at ringside. [Current screenplay](movies/shorts/kickboxing/docs/body/screenplay/kickboxing/020-the-round.md) · [Earlier edition](https://github.com/samchon/automovie-examples/blob/bdcc2e60a0e8efe1a9d706cf573bb2d3d24256ef/movies/shorts/kickboxing/docs/body/screenplay/kickboxing/010-the-round.md) |
| The Great St Bernard road | Four one-minute stories in Savoy around 1460. [The Better Seat](movies/shorts/sword/docs/body/screenplay/the-better-seat/010-household-yard.md), [Bread Cloths](movies/shorts/sword/docs/body/screenplay/bread-cloths/010-two-bends.md), [Answer Me](movies/shorts/sword/docs/body/screenplay/answer-me/010-breeding-yard-road.md) and [The Last Carry](movies/shorts/sword/docs/body/screenplay/the-last-carry/010-valley-lane.md) |
| Slam Dunk | A three-minute Korean broadcast follows all ten players through a tying dunk, a go-ahead three and the final rebound. [두 번째 손](movies/shorts/slam-dunk/docs/body/screenplay/two-hands/010-game.md) |

## Layout

| Path | Holds |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md`, `.agents/skills` | The skills and bundled contracts every production follows |
| `movies/shorts/<name>` | A short production, written brief → screenplay |
| `movies/series/<name>` | A long production, written settings → treatments → scripts → screenplay |
| `packages/<name>` | The workspace's own libraries that several productions import |
| `pnpm-workspace.yaml` | Workspace members and the named `catalogs` of versions every production uses through `catalog:<name>` |

A production is the directory holding its `PROJECT.md`, `README.md`, `src`, `test`, `docs` and configuration, and its commands run there. Its own work and language contracts live in its `docs/contracts`.

## First run

Keep this workspace at `examples/` in an installed AutoMovie checkout. Run `pnpm run build` in that checkout to prepare its scaffold and SDK declarations. The workspace's `pnpm automovie add` runs that checkout's CLI and connects the new production to its [public SDK declarations](tsconfig.sdk.json). New productions resolve SDK libraries from the checkout's `packages/` directory.

With Node.js 22.23.2 or later and pnpm installed, run these commands from the workspace root. Replace `my-film` with the production name.

```powershell
pnpm install
pnpm automovie add shorts/my-film
pnpm install
```

`pnpm automovie add shorts/<name>` or `pnpm automovie add series/<name>` creates the production from the checkout's scaffold and fills any missing dependency catalog entries. Existing release pins and local package links keep their values. The package name is the lowercased, npm-safe form of `<name>`, unless you supply `--name <package>`. Run `pnpm install` again to link the production, then follow its README.

## Packages

Put code that several productions share in `packages/<name>` as an ordinary pnpm package with its own `package.json`, and depend on it from a production with `"<package>": "workspace:^"`. Code serving one production stays in that production.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm lint` | Every member's `lint` |
| `pnpm evidence` | Every member's `evidence` |
| `pnpm test` | Every member's `test` |
| `pnpm --filter <name> <script>` | One member's script, such as `pnpm --filter <name> dev` |
