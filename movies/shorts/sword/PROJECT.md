# Four sword fights on the Great St Bernard road

This screenplay collection takes place in the Alpine lands of Savoy around 1460. Four independent minutes follow a saddle wager between knights, a robbery on the bread road, a mounted pursuit of a stolen mare in which the riders meet with lances and then with maces, and a family fight that a funeral procession leaves behind. The shared setting gives the four fights witnesses with different reasons to care about their outcome.

The user commissioned one common brief in `docs/body/brief/` and four separate 60-second English screenplays, with cast descriptions and generated appearance references. The third fight uses lances first, then maces, while the two combatants are mounted. The user delegated the period, region and fourth encounter. The [commission](docs/instructions/commission.md) records the supervisor's historical basis, the adopted dramatic choices and the requirement for an original mountain-road story.

Use the [short route](../../../.agents/skills/story/workflow/short.md) for one common brief, four screenplays, an Evidence pass and independent narrative review. Each text runs from 0 to 60 seconds. The shared brief includes individual cast records and their images alongside the setting. The coordinator produces and inspects the appearance references, and the commissioning viewer acts for the user when selecting the final appearance. Timing is written performance time.

## Edition

The four screenplays use a delegated 16:9 landscape frame to hold the road at two heights, the mounted pair and the receding funeral procession. Each film has its own clock and ending. The commissioning viewer inspected and selected 48 model-neutral film-casting photographs on the user's behalf. Codex's built-in image generator supplied both views for each of 24 individually identified people and horses. The user deferred selection of the downstream video model and endpoint. [Casting photographs](docs/prompts/casting/photographs.md)

| Screenplay | Beats | Authored runtime | Acceptance record |
| --- | ---: | --- | --- |
| [The better seat](docs/body/screenplay/the-better-seat/010-household-yard.md) | 4 | 60 seconds | [Director and independent reader](docs/acceptance/the-better-seat.md) |
| [Bread cloths](docs/body/screenplay/bread-cloths/010-two-bends.md) | 5 | 60 seconds | [Director and independent reader](docs/acceptance/bread-cloths.md) |
| [Answer me](docs/body/screenplay/answer-me/010-breeding-yard-road.md) | 6 | 60 seconds | [Director and independent reader](docs/acceptance/answer-me.md) |
| [The last carry](docs/body/screenplay/the-last-carry/010-valley-lane.md) | 4 | 60 seconds | [Director and independent reader](docs/acceptance/the-last-carry.md) |

The same external film director supervised an original writer, a separate Evidence answerer and a fresh independent narrative reader. Each ran with gpt-6.2-astra at high reasoning effort. The reader locked a first response to the brief and four screenplays before comparing them with the commission, discovery and historical study. The writer accepted two local findings about screen position and revised the mountain road and mounted scenes. The reader reread both revised scripts, closed the two findings and upheld the other two scenes. The director then read the whole edition and approved it for manuscript delivery.

A subsequent commissioning viewer found the shoe, Perrin's stop and the bread sack drawing attention at once on the bend. In the delivered revision of *Bread cloths*, the youngest slides his foot back into the loose shoe at the turn. The camera leaves him there. When the sack catches, the caller takes his last step from the split rock and stops beside the bareheaded man. The two faces have a breath beneath the load before Alix looks down. On rereading, the same independent reader traced the lower men's arrival and the youngest's returning footfall. The director also reread the other three films and retained their approvals. The good saddle pays Carlo's wager, Luc opens the gate while Rémy leaves with his pay, and the widow carries the exposed shoe beyond the gate with her hands on the pole. The 28 other manuscript files and the 48 selected casting photographs retained their identities. [Revised mountain-road acceptance](docs/acceptance/bread-cloths.md)

Construction Evidence covered 94 of 94 selected units before independent review. The source and annotation-free editions were reconciled to LF line endings. The final check covered 155 of 155 units in the expanded graph, including all 53 current narrative review fingerprints, with zero warnings or errors. The short-route configuration closed with 15 of 15 engineering units covered. These results concern the four written minutes and their casting references. The direct 3D commission below records performed timing and media separately.

## Direct 3D films

The subsequent commission calls for four individually directed films on the local AutoMovie 0.3.0 renderer. Each uses the selected cast, a 16:9 courtyard or road composition, a sixty-second timebase and twenty-four frames per second. The four registered subjects are The Better Seat, Bread Cloths, Answer Me and The Last Carry. The written edition above supplies the starting screenplays. Each film’s acceptance record identifies its final screenplay revision. Each current filmmaking role uses Codex with GPT-6.2 Sol at high reasoning effort, including direction, writing, technical production, audio and independent picture review. The manuscript edition retains its original attribution. The director may return a weak film to a separate Sol writer, Evidence answerer and independent narrative reviewer before rendering the revised film.

The [film registry](src/composition/films/index.ts) connects the four subjects to a common inspector, capture command and render command. The delivery profile is one 1,280 × 720 MP4 per subject with 1,440 progressive picture frames and the subject’s soundtrack. The independent picture review reads encoded frames in order across each completed minute, then checks consecutive frames at cuts and decisive events against the authored source. Each acceptance record gives the observed coverage and its limits.

| Film | Encoded master | Acceptance record |
| --- | --- | --- |
| The Better Seat | [MP4](media/automovie/the-better-seat/videos/the-better-seat.mp4) | [Production and review](docs/acceptance/the-better-seat.md#direct-3d-commission) |
| Bread Cloths | [MP4](media/automovie/bread-cloths/videos/bread-cloths.mp4) | [Production and review](docs/acceptance/bread-cloths.md#direct-3d-production) |
| Answer Me | [MP4](media/automovie/answer-me/videos/film.mp4) | [Production and review](docs/acceptance/answer-me.md) |
| The Last Carry | [MP4](media/automovie/the-last-carry/videos/film.mp4) | [Production and review](docs/acceptance/the-last-carry.md) |

The [media manifest](media/manifest.json) records retained files, SHA-256 hashes, voice and dataset attribution, and the PowerShell commands for restoring each delivery. Its `acceptedFrames` records link the verified frame sheets and reviewer records to each exact master.

The [shared motion adapter](src/composition/shared/nativeStageMotion.ts) resolves installed `HumanPerformance` compositions and exposes the sampled body and joints in the wardrobe figure's stage frame. Each film's acceptance record identifies the native actions that drive its rendered performers, along with source and screen observations for its staged contacts.

The default `pnpm run evidence` check covered 51 of 51 units across seven active claims and nine obligations, with zero diagnostics. The shared TypeScript check and the focused Seat camera and motion-adapter tests passed. The full production test launcher timed out while waiting for its dependency build.
