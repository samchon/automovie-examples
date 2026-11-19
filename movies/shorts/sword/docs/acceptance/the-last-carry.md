# The last carry — manuscript acceptance

The commissioning viewer rejected this film after playback on 19 November 2026. The four Sword films return to screenplay. The director's decisions below record the withdrawn edition. [Collection review](../../../../../docs/benchmarks/0.3.0-film-review-return.md)

The director accepted the screenplay for delivery on 19 November 2026. Its 4 beats cover 0–13, 13–32, 32–48, 48–60 authored seconds. [Screenplay](../body/screenplay/the-last-carry/010-valley-lane.md)

## Director's reading

The valley-lane screenplay earns its final silence as written. The mourner takes Colin’s weight first. Denis stays under his corner until his aunt lifts it from his coat. Later, when the hem rides up, she reaches for it and the pole rolls. I can see exactly what their quarrel has cost her. The winter’s pay remains disputed, but the cousins’ last chance to carry their uncle is gone. How the final syllable of the prayer fades into Colin’s breathing remains unheard.

## Independent reading and edition

The staging of the bier stayed in place. The reader found both successors already under the wood when their respective cousins stepped away. The original writer retained the scene.

The film uses 8 individually identified subjects and 16 casting photographs. The host compared each full and detail view with the cast record, then verified the files and their applicable input hashes. The commissioning viewer inspected the originals and selected them for the user. The independent reader judged the texts and their descriptions. [Casting photographs and receipts](../prompts/casting/photographs.md)

Final LF screenplay SHA-256: `3eec89b70c489811e1c0971fd6c7eb338e28e0d83a69638f7ff1a28558c621dd`. The director, original writer, independent Evidence answerer and independent reader worked in separate roles. The final currentness check verified all 53 body H2 fingerprints across the common brief and four screenplays. The time track is written performance time. Playback, dialogue duration and finished sound remain unmeasured. [Collection and verification](../../PROJECT.md#edition)

## Direct 3D edition

The direct film uses the approved screenplay and the cast and scenery from the earlier production draft. A Sol High director reviewed the resulting 60-second baseline and withheld picture approval. A separate Sol High reviewer saw the funeral and the tension between the cousins, but could not follow the belt gesture, the load transfers or the sliver. The director traced the findings to overlapping silhouettes, unmarked hand contact, camera position and picture cues that drifted from the soundtrack. The director retained the screenplay for the production repair. The manuscript digest above identifies the text used in the direct film.

The new staging lets the audience see Denis and Colin answer separately. At the belt, Denis frees the loose linen before Colin reaches for the hare. Russet takes the far pole and clears space for Colin. The widow waits for the timber to reach her hands, then lifts it before Denis steps aside. The two cousins stay in the fixed wide while the bearers go on. The camera watches the shoe recede behind the gate before it returns to the sliver in the green coat.

| Delivery shot | First–last frame, inclusive |
| --- | --- |
| The shroud and the widow’s hand | 0–117 |
| Denis’s promise | 118–194 |
| Colin across the bier | 195–311 |
| The caught linen and the hare | 312–391 |
| Denis’s answer | 392–509 |
| Russet takes Colin’s corner | 510–595 |
| The dip and the widow’s lift | 596–767 |
| The fixed lane wide | 768–1223 |
| The shoe through the gate | 1224–1319 |
| The sliver and the men | 1320–1439 |

The video uses deterministic motion, clothed actor rigs, a procedural valley and burial ground, cloth morphs, precomputed face and garment detail, and locally rendered shadows. Spoken lines drive a jaw-opening envelope on the available face rigs. The ensemble mix uses local Piper with stock VCTK speakers, procedural effects, and the screenplay’s petition and dialogue. The attached cue receipt identifies the voice presets, the model, the VCTK corpus attribution and the individual events. [Ensemble cue receipt](../../media/automovie/the-last-carry/audios/ensemble-cues.json)

### R8 render record

R8 used a dedicated Windows D3D11 WebGL host at native raster with shadows enabled and JPEG frame transport. The frozen R8 output and its per-frame receipt identify that creative baseline. The current AutoMovie beauty render and its command are described in the SDK edition below. [Film entry](../../src/composition/films/the-last-carry.ts) · [R8 render report](../../media/automovie/the-last-carry/videos/r8-render-report.json)

The render command defaults to the retained ensemble WAV. To recreate that mix, point `CARRY_STOCK_VOICES` at the local directory containing pinned `en_GB-vctk-medium.onnx`, its `.onnx.json` sidecar, and the Piper executable and eSpeak data. The sound command checks the model digest before synthesis. [Sound command source](../../src/executable/the-last-carry-sound.mts)

```powershell
node src/executable/the-last-carry-sound.mts --ensemble
```

### Technical verification

The 30,551,449-byte MP4 decodes to 1,440 frames of 1280 × 720 BT.709 H.264 High at 24 frames per second. The picture and stereo 48 kHz AAC-LC stream each span 60.000 seconds. The decoded mix measures −23.2 LUFS integrated and −1.4 dBTP. The comparison SHA-256 is `d7561c26792736b147232684f37862a53f9326dfddd951df3d2110ed4474616e`. [R8 creative comparison](../../media/automovie/the-last-carry/videos/film-r8-comparison.mp4) · [R8 FFprobe record](../../media/automovie/the-last-carry/videos/r8-ffprobe.json)

The technical filmmaker inspected all 300 chronologically sampled decoded frames at about five frames per second plus frame 1439. The source and master are matched at 664 exact frame numbers. The filmmaker compared 19 consecutive-frame windows covering cuts, hands, the pole transfers, the gate and the sliver. FFmpeg comparison with the original encoder inputs yielded overall SSIM 0.993071 and average PSNR 48.826 dB. [Render report](../../media/automovie/the-last-carry/videos/r8-render-report.json) · [Decoded sheets and matched frames](../../.cache/sol-0.3.0/the-last-carry/master-r8/)

The type check and focused test passed, including the fixed wide, independent seeks and the sliver’s attachment through the last frame. The normal pnpm unit runner timed out in shared dependency compilation, so the focused test ran independently in the installed Node and esbuild runtime.

### Independent picture reading

A fresh Sol High reviewer read the 301 decoded samples in order before inspecting four full-size source stills. The reviewer followed the procession, both replacements, the two men left outside, the returning shoe-like shape and Colin’s withdrawal of the sliver. They judged the story complete in broad outline. The precise motive for the purse beat depends on the dialogue and remained open in the picture pass. [Independent reading](../../.cache/sol-0.3.0/the-last-carry/review-final-r8.result.md)

The reviewer found the physical connection partly convincing. At 22.000 and 27.542 seconds, heads, sleeves and the rail crowd the exact point of support even though the change of bearers reads. The wide holds the receding bier, gives the swords two bursts and shows the men lean and recover, but the coat catch and purse contact are hard to follow at that scale. The final sliver travels from the coat to Colin’s fingers visibly across the sampled frames. Sleeve overlap and the stylized pinch leave room for a stronger close contact.

The finished file has been decoded and reviewed in stills. Continuous playback, speech clarity, perceived mix balance, lip sync, flicker and judder remain unconfirmed. The last camera turn peaks at 1.090 frame widths per second at 57.333 seconds, measured from the camera’s rotation. The decoded mix falls below −60 dB at 58.272 seconds. [Camera measurement](../../media/automovie/the-last-carry/videos/r8-camera-rotation.json) · [Decoded mix measurements](../../.cache/sol-0.3.0/the-last-carry/master-r8/ebur128.log)

### Director’s verdict

The original Sol High director returned to the final picture in the same session and accepted the film in its stylized direct 3D form. The master passed technical verification and the picture carried the story through the final gesture. The director rated the exact load transfers, the action between the men in the wide and the pinch at the coat as partly convincing. Acceptance stands after correction of the reported camera rotation. [Final director’s verdict](../../.cache/sol-0.3.0/the-last-carry/director-final-r8.result.md) · [Camera amendment](../../.cache/sol-0.3.0/the-last-carry/director-camera-correction.result.md)

The director retained the screenplay. The purse contact at 37–39 seconds is hard to read in the fixed wide. That framing stays because it shows the widow carry their uncle into the burial ground while the cousins remain outside. The other weaknesses in the handovers, the aborted reach and the pinch arise in the staging, framing and available rig.

## SDK edition

The visible costumes are shaped around canonical Human limb proportions. AutoMovie 0.3.0 compiles the installed `walk`, `stand`, `gesture` and `touch` actions and `HumanBreath` layer for the cast. The procession’s travelled distance selects the corresponding native walk sample. Its knees, ankles, wrists and pelvis move the visible costume. Colin’s assent uses the native head nod, and Denis’s shoulder check uses the native touch trajectory fitted to his coat. The later handover, cloth and sliver endpoints follow the props’ authored contacts. [Native action tracks](../../src/entities/the-last-carry/CarryNativeMotion.ts) · [Visible cast retarget](../../src/entities/the-last-carry/Cast.ts)

The SDK’s `carryHang` holds an object in one actor’s hands at their sides. Its `HumanCarried` declarations describe a body on one carrier or two, and rigid object playback selects the latest grip with a two-hand orientation case. Those APIs do not express the funeral’s four shoulder contacts on one oak frame or its two independent substitutions. The lane stages those contacts against the same visible rails and times. The stage-prop exchanges remain screen poses and glints.

The Windows render host calls the installed `installAutoMovieDraw` through the standard film-view beauty request and transports the supersampled result losslessly as PNG. The SDK supplies the lighting and antialiasing. A small shade at each boot helps ground the performers during the wide shot. The renderer retains exact source-frame hashes and visible motion witnesses at sampled frames. [Render command source](../../src/executable/render-the-last-carry.mts)

```powershell
$carryRestore = Join-Path '.cache/restored/the-last-carry' ([guid]::NewGuid().ToString('N'))
node src/executable/render-the-last-carry.mts $carryRestore
if ($LASTEXITCODE -ne 0) { throw 'The Last Carry render failed.' }
```

Run the command from the Sword production with the local packages and Playwright Chromium installed. It uses the retained ensemble WAV and writes `film.mp4` and `render-report.json` to the fresh output directory. The renderer creates missing parent directories and requires a new output directory for each run. The manifest contains the exact-digest check for installing the master at an empty playback path. [Media manifest](../../media/manifest.json)

### Delivery and verification

The original Sol High director approved N2 as the delivery master. The 25,763,402-byte MP4 at the default playback path decodes all 1,440 frames of 1280 × 720 BT.709 H.264 High at 24 fps. The picture and 48 kHz stereo AAC-LC each span 60.000 seconds. Its SHA-256 is `dd75e506470b4c180e57d3831cc069f428fa0c89683a8a6e12cbfcdce600241f`. The decoded PCM matches R8 byte for byte. It measures −23.2 LUFS integrated and −1.4 dBTP. [Delivery master](../../media/automovie/the-last-carry/videos/film.mp4) · [N2 FFprobe record](../../media/automovie/the-last-carry/videos/ffprobe.json)

The filmmaker inspected 300 decoded samples in chronological order at about five frames per second plus frame 1439. Nineteen windows of six consecutive frames compared source and decoded images around cuts, the loading of the poles, the gate, and the sliver. The 664 retained source PNG hashes all match the renderer's per-frame record. FFmpeg matched the 664 source and master frame numbers with SSIM 0.994123 and average PSNR 49.373 dB. The final camera turn peaks at 1.086 frame widths per second at 57.333 s. [N2 render report](../../media/automovie/the-last-carry/videos/render-report.json) · [N2 rotation measurement](../../media/automovie/the-last-carry/videos/camera-rotation.json) · [Accepted chronology and paired contact sheets](../../media/automovie/the-last-carry/frames/accepted/n2/index.json)

At frame 82, the native sample reports Denis's walk travel at 0.751912 m and the left ankle at `[0.026125, 0.071392, 0.098367]` m. The fitted left boot is at `[0.063720, 0.086209, 0.097062]` m. At frame 226, Colin's sampled nod is 0.223505 radians. At frame 1333, Denis's native touch puts his left wrist at `[-0.146606, 1.427895, 0.062113]` m before the costume fit. The source hashes and cast samples appear together in the frame records. The production type check and the focused test of native movement, seeking, camera and prop attachment passed. [N2 render report](../../media/automovie/the-last-carry/videos/render-report.json) · [Procession verification](../../test/features/the-last-carry/test_last_carry_procession.ts)

### Picture and screenplay verdict

A fresh Sol High reviewer correctly identified the russet mourner and the widow as the relieving bearers, the recurring shoe behind the gate, and Colin's removal of the splinter as a small act of care. The reviewer found that tension drops at 39–42 s and 45–48 s as the foreground movement pauses. The original director accepted the dramatic story. [Independent picture reading](../../media/automovie/the-last-carry/frames/accepted/n2/records/review-sdk-n2.result.md)

The original director accepted the physical staging in part. The lower angle at 22.000 s separates the profiles more clearly, while the exact point of support stays crowded. At 27.542 s a dark sleeve appears to cut through the widow's white cloth under the rail. The coat and purse are hard to read at 37–39 s. At 57.042 s the blue cuff leads into the extracting hand and the sliver remains visible as Colin withdraws it, although the pinch looks loose. The director weighed the screenplay's choice to put the small purse contact in the fixed wide and retained the full screenplay because the wide shows the bereaved carrying on while the cousins remain outside. The last syllable, speech clarity, sync, motion and camera feel await listening or continuous playback. [Original director's final verdict](../../media/automovie/the-last-carry/frames/accepted/n2/records/director-sdk-n2.result.md)
