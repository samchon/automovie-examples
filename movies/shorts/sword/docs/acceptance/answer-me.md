# Answer me — manuscript acceptance

The commissioning viewer rejected this film after playback on 19 November 2026. The four Sword films return to screenplay. The director's decisions below record the withdrawn edition. [Collection review](../../../../../docs/benchmarks/0.3.0-film-review-return.md)

The director accepted the screenplay for delivery on 19 November 2026. Its 6 beats cover 0–9, 9–21, 21–25, 25–36, 36–51, 51–60 authored seconds. [Screenplay](../body/screenplay/answer-me/010-breeding-yard-road.md)

## Director's reading

The revised breeding-yard road screenplay lets us see the grey’s nose draw level with Rémy’s boot while the mare still leads. When the grey slows, the gap widens. That leaves the broken call from the rails free to change the story’s direction. At the gate Luc opens the hand holding Rémy’s sleeve, and the mare reaches her foal. Rémy runs away with his wage, leaving the saddle empty. The horses’ arrival and the two dismounts are clear on the page. Their performed duration is untested.

## Independent reading and edition

The staging of the mounted pair was revised when the independent reader found two possible positions for the grey at the onset of slowing. The writer established the mare's lead before the change of pace. The reader followed the widening gap on the revised page and closed the finding.

The film uses 6 individually identified subjects and 12 casting photographs. The host compared each full and detail view with the cast record, then verified the files and their applicable input hashes. The commissioning viewer inspected the originals and selected them for the user. The independent reader judged the texts and their descriptions. [Casting photographs and receipts](../prompts/casting/photographs.md)

The earlier LF screenplay had SHA-256 `7746c51cfb8a0f7d949c10452a0d1c167ce4e4325c73ac5a53432d9d47ed056e`. The director, original writer, independent Evidence answerer and independent reader worked in separate roles. The manuscript round verified all 53 body H2 fingerprints across the common brief and four screenplays. Its time track was written performance time. [Collection and verification](../../PROJECT.md#edition)

## Screenplay revised against the picture

Two independent Sol High readers mistook the sleeve hold for an agreement or truce in the first two complete picture cuts. The second cut made Rémy lean away, but the two hands still formed a clasp in the frame. The same Sol director reopened the scene after reviewing both reactions and the second cut's 300 decoded stills. He retained the rider's wage and the mare's return as the causes and asked for an unmistakable interruption of Rémy's departure. [First audience reading](../../.cache/sol-0.3.0/answer-me/independent-audience.md) · [Second audience reading](../../.cache/sol-0.3.0/answer-me/gate-revision/independent-audience.md) · [Director's correction](../../.cache/sol-0.3.0/answer-me/gate-revision/director-correction.result.md)

Both baselines were complete 60-second H.264/AAC masters. The first had SHA-256 `7da40b34ad761f7068bd49183ee70c9d21df07b14d0a930dbb7d0b869c5207b2`. The revised gate baseline had SHA-256 `f3081be1363e73d690df9581fcf55358d24efe2d9669dad2b0062df317320d40`. Each decoded at 1280 × 720, 24 fps and 1,440 frames. [First baseline](../../.cache/sol-0.3.0/answer-me/first-complete/film.mp4) · [Gate baseline](../../.cache/sol-0.3.0/answer-me/gate-revision/master/film.mp4)

The Sol High writer revised the full screenplay. Luc stops Rémy by the upper sleeve and says “Don't move” before the foal calls again. The new reading followed Luc's choice to release the cloth and use the same hand on the latch. All six windows and the ending survived. A separate Sol High Evidence answerer checked nine links, 27 claim addresses, five dialogue windows and the native `#road` fingerprint `54170b2`. The adopted LF body SHA-256 is `8daf24977094c70e3dc13a3680bb31d108f0fac650502f3ff42ddde7345cb005`. Relative parent links account for the byte difference from the cold reader's copy. [Adopted screenplay](../body/screenplay/answer-me/010-breeding-yard-road.md) · [Independent narrative verdict](../../.cache/sol-0.3.0/answer-me/script-revision/independent-narrative.md) · [Evidence validation](../../.cache/sol-0.3.0/answer-me/script-revision/evidence-result.md)

## Performance and draw

The film samples AutoMovie 0.3.0 `HumanChain` and `HumanPerformance` for Luc's slow walk at 46.45–49.70 seconds and Rémy's departure at 54.15–60 seconds. Native forward kinematics drives the visible polygon pelvis, legs and Rémy's free arm. The scene retains Rémy's purse and Luc's rein as explicit hand targets. The ground check held the right ankle within 2 cm over frames 1408–1410, found the left ankle raised there, and verified the other planted ankle at 1424 and Rémy's grip at the belt. Ten measured step frames set the departure foley. [Motion checks](../../.cache/sol-0.3.0/answer-me/native-release/motion.log) · [Step frames](../../.cache/sol-0.3.0/answer-me/native-release/contacts.json)

The mounts use the installed horse bind and gait data with local visual articulation. The mounted exchanges, seat shifts, dismounts, cloth and gate are staged for the screenplay with authored targets and local rig behavior. These passes establish their positions and causal order at the inspected frames. The mounted contact force, fuller facial motion and lip-sync accuracy remain limited by the stylized rigs. [Film source](../../src/composition/scenes/answer-me/010-breeding-yard-road/scene.ts)

The Windows export opens the film in Chromium on ANGLE D3D11. AutoMovie's `installAutoMovieDraw` supplies each beauty frame through the film camera at its delivery raster. The SDK reads the 2× supersampled picture and area-reduces it before the host writes lossless PNG bytes to the H.264 encoder. The browser, draw package and encoder are local. [Render entry](../../src/executable/answer-me/render.mjs)

## Film delivery and review

The original Sol High director accepted the adopted screenplay and the complete picture at the commissioned stylized direct-3D stage. The master decoded cleanly with 1,440 frames at 24 fps. It runs 60.000 seconds at 1280 × 720, 16:9, in H.264 BT.709 with 48 kHz stereo AAC. Both streams start at 0.000 seconds. The complete decoded mix measured −23.2 LUFS integrated, −2.0 dBTP and an 18.9 LU loudness range. [Master](../../media/automovie/answer-me/videos/film.mp4) · [FFprobe](../../.cache/sol-0.3.0/answer-me/native-release/probe.json) · [Loudness](../../.cache/sol-0.3.0/answer-me/native-release/loudness.txt)

The master SHA-256 is `bbc67573add1525db9126674274c2325115465c2f4190b91b417e51cd9df0afd`. The stereo PCM source SHA-256 is `a5b5e63417e593cbd6de3c72855bcf4a0bd0e747eb5365d6fdcdf5b2fc46d846`. The latest source uses string seeds required by `HumanPerformance`. Those literals produced the same actor and camera transforms as the render input on all 223 frames the correction could affect. [File identities and draw measures](../../media/automovie/answer-me/frames/accepted/r4/records/release-check.json) · [Source parity](../../media/automovie/answer-me/frames/accepted/r4/records/source-parity.json)

The fresh Sol High reader locked a picture-only response after 300 chronologically sampled decoded stills at five per second. The director returned to the same film with all ten sheets and four full-size decoded stills. The retained evidence includes 557 source and decoded pairs around the cuts, beat boundaries, dismounts, gate swing, departure and final frame. Each retained source PNG matched the render report's hash. Frame 1439 shows the chestnuts together inside the paddock, Luc and the grey outside, and Rémy running down the road with his purse. [Accepted chronology and paired stills](../../media/automovie/answer-me/frames/accepted/r4/index.json) · [Final frame](../../media/automovie/answer-me/frames/accepted/r4/details/decoded/frame_01439.png) · [Locked audience reading](../../media/automovie/answer-me/frames/accepted/r4/records/independent-audience.md) · [Director's verdict](../../media/automovie/answer-me/frames/accepted/r4/records/director-final.result.md)

The pictures show Luc initiating and ending contact at the upper sleeve. The rear angle masks some of the finger grip and the checked step, and the mute viewer read the touch as a possible appeal or goodbye. The mounted exchanges also leave individual impacts and the conflict's stakes partly to the score and dialogue. The largest measured rotational camera move was 1.50 horizontal frame widths per second during the coin reframe at 1.833 seconds. The intended line timings and final mix were measured. Real-time judder, perceived gait, dialogue intelligibility, lip sync and the calls' effect still await an audiovisual playback report. [Dialogue cues](../../.cache/sol-0.3.0/answer-me/native-release/score.log)

## Reproduction

Use the local AutoMovie 0.3.0 packages, Node 24.18.0, Playwright's Chromium headless shell, and `ffmpeg-static`. Run the following in PowerShell from the Sword production folder. `score.ps1` uses the local Piper executable with VCTK English `p226`, `p227`, and `p230`. Its `-VoiceAssets` parameter locates the binary, model and config if their cache location differs. The preserved model card credits the VCTK corpus under CC BY 4.0. [Voice asset checksums](../../.cache/sol-0.3.0/answer-me/native-release/voice-assets.sha256.json) · [Piper model card](../../../../../.cache/film-release-0.3.0/stock-voices/MODEL_CARD)

```powershell
$picture = '.cache/sol-0.3.0/answer-me/rebuild/picture'
node src/executable/answer-me/render.mjs $picture
& ./src/executable/answer-me/score.ps1
[IO.Directory]::CreateDirectory((Join-Path (Get-Location) 'media/automovie/answer-me/videos')) | Out-Null
$ffmpeg = (Resolve-Path -LiteralPath 'node_modules/ffmpeg-static/ffmpeg.exe').Path
& $ffmpeg -nostdin -y -i "$picture/film.mp4" `
  -i 'media/automovie/answer-me/audio/answer-me.wav' `
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart `
  -metadata 'title=Answer me' 'media/automovie/answer-me/videos/film.mp4'
```
