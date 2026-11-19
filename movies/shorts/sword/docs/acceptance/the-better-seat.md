# The better seat — manuscript acceptance

The director accepted the screenplay for delivery on 19 November 2026. Its 4 beats cover 0–15, 15–34, 34–46, 46–60 authored seconds. [Screenplay](../body/screenplay/the-better-seat/010-household-yard.md)

## Director's reading

The household-yard screenplay earns its ending as originally written. From the bench, we see the stable lad find Carlo’s boot outside the line and Martin follow his gaze. That gives Carlo a moment to admit the loss himself. He puts his good saddle into Martin’s outstretched hands and carries the split one away. When his fingers poke through the hole that embarrassed Martin, they can finally laugh together. The pause before Carlo speaks remains a matter of performance.

## Independent reading and edition

The staging of the wager stayed in place. The independent reader found that the boy and Martin both locate the boot before Carlo speaks. The original writer retained the scene.

The film uses 3 individually identified subjects and 6 casting photographs. The host compared each full and detail view with the cast record, then verified the files and their applicable input hashes. The commissioning viewer inspected the originals and selected them for the user. The independent reader judged the texts and their descriptions. [Casting photographs and receipts](../prompts/casting/photographs.md)

Final LF screenplay SHA-256: `60e87fd99d2ce131131426d2d2b983f5f5810d16692fce9055bd555029e7a2db`. The director, original writer, independent Evidence answerer and independent reader worked in separate roles. The final currentness check verified all 53 body H2 fingerprints across the common brief and four screenplays. The time track is written performance time. Playback, dialogue duration and finished sound remain unmeasured. [Collection and verification](../../PROJECT.md#edition)

## Direct 3D commission

The sixty-second film stages the four beats from the manuscript above. The opening frames both knights and the two saddles. The film cuts to the yard at frame 360 and holds the landing across frames 815 and 816. The camera returns to the bench for the handover and keeps Martin in the doorway composition as Carlo leaves. [Film source](../../src/composition/films/the-better-seat.ts) · [Camera source](../../src/composition/scenes/the-better-seat/yardCamera.ts)

The Sol High production pass inspected 35 inherited frames spanning the minute. The pilot cropped both knights at the bench, separated the stage props at the two reports, hid the lad's startle behind a saddle and put witnesses across the sightline to Carlo's final gesture. The correction reframed the opening, synchronized the prop contacts, kept the boot beside its mark, staged the two support transfers and cleared the doorway. The subsequent GPU source capture drew all 35 planned stills. Martin's green wardrobe, Carlo's grey beard and bright helmet, and the lad's oat coat and left cuff identify the three stylized polygon performers.

### Sound and restoration

Martin uses Piper stock voice p95 and Carlo uses p82 from the en_GB VCTK medium model. The local stereo mix includes the five screenplay utterances, yard ambience, two reports, bench knock, breath and footsteps, saddle noise and laughter. The mouth overlays follow the timed phrases and laugh with simple openings. [Piper voice model card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_GB/vctk/medium/MODEL_CARD) · [CSTR VCTK Corpus, University of Edinburgh](https://datashare.ed.ac.uk/handle/10283/3443)

Run from the sword production with the linked AutoMovie 0.3.0 dependencies, Playwright Chromium, FFmpeg, Python with NumPy and SciPy, and the shared Piper Windows model directory. Pass `-Voices` to the sound script when the stock voice cache is elsewhere. The picture command uses the installed beauty draw port and keeps verified PNG checkpoints in its output directory. Pass that same directory to resume an interrupted export from the same source bundle.

```powershell
& ./scripts/the-better-seat/sound.ps1
node ./scripts/the-better-seat/draw.mts .cache/the-better-seat/beauty-draw
& ./scripts/the-better-seat/render.ps1 -Picture .cache/the-better-seat/beauty-draw/film.mp4
```

The assembly command copies the picture stream and encodes the sound to stereo AAC in `media/automovie/the-better-seat/videos/the-better-seat.mp4`. [Collection media manifest](../../media/manifest.json)

### First complete cut

The first encoded cut ran 60.000 seconds. FFprobe decoded 1,440 H.264 frames at 24 fps and 1,280 × 720, with stereo 48 kHz AAC. FFmpeg decoded both streams without errors and measured −15.7 LUFS integrated and −2.9 dBTP. The file SHA-256 was `e54dd54de35bac16bcdcc37913a1607f2fc059901e637ac10d7e24e286ebaf96`. The record contains 300 evenly distributed audience stills, consecutive event frames and 25 matched source and decoded frame pairs. [Technical record](../../.cache/sol-0.3.0/the-better-seat/completion.json)

The independent Sol High reviewer inspected all 300 audience stills before reading the screenplay or seeing production notes. The reviewer traced both final saddle owners and inferred that Martin lost because the kneel drew more attention than Carlo's boot. The reviewer missed the offered handshake and the final finger gesture. [Independent picture review](../../.cache/sol-0.3.0/the-better-seat/independent-first.result.md)

The original Sol High director inspected the event sheets and all five paired sheets. The director requested one picture retake to separate the crossed boot from Martin and the score, reveal the offered hand and both saddle support changes, and bring the closing fingers and Martin's laughter into a readable shared frame. The director retained the screenplay verbatim because the existing action and dialogue already state the rule, consequence and gesture. [Director's retake decision](../../.cache/sol-0.3.0/the-better-seat/director-baseline.result.md)

### Retake source

The retake plans the lad's looks, both men walking back to the bench, Martin's half kneel, nod and sit, and Carlo's departure through the installed motion vocabulary. The wardrobe meshes read the package's sampled ankle, knee, hip, elbow and wrist targets on those spans. The handheld prop pins override the corresponding free limbs. Seven visible witnesses use `HumanEnsemble` and the installed look actions for the report, boot and return to the bench. [Native cast staging](../../src/composition/scenes/the-better-seat/yardNative.ts) · [Witness ensemble](../../src/composition/scenes/the-better-seat/yardWitnesses.ts)

The ordinary GPU capture drew 31 source checks across the retake. The checked views make the score, crossed boot, offered palm and wave more distinct. The last framing adjustment gives the lad and the good saddle more room on the left side of the frame. The particular two-handed saddle transfer, the fingers through the tear and the stage prop contacts use production-authored anchors. The installed motion checks cover the listed actions and the scripted floor and seat bases.

### First native retake

The [first native retake MP4](../../.cache/sol-0.3.0/the-better-seat/native-comparison.mp4) is 17,416,396 bytes, SHA-256 `67208c1bb677a01a884510e921c2160dd5942f56da90d2c55d7c7be306272c96`. Both tracks run 60.000 seconds. FFprobe decoded 1,440 H.264 High frames at 24 fps, 1,280 × 720, BT.709 yuv420p, with AAC-LC stereo at 48 kHz. FFmpeg decoded both streams without error and measured −15.8 LUFS integrated and −2.8 dBTP. The five dialogue windows and the start of the laugh have zero measured lag against the source PCM at 48 kHz in mono alignment, with waveform correlation above 0.9992. Listening, speech intelligibility and audiovisual playback remain open. [Stream probe](../../.cache/sol-0.3.0/the-better-seat/native-ffprobe.json) · [Soundtrack alignment](../../.cache/sol-0.3.0/the-better-seat/native-audio-alignment.json)

While the CLI had no completed report, the producer preserved its first 776 continuous PNGs after verifying each image's dimensions and chunk CRCs. Nine frames spread across that prefix matched the installed beauty draw port exactly in decoded RGB. The checkpointed recovery drew the remaining 664 frames using the same port on Chromium ANGLE D3D11 and retained those raw images for the next pass. The original CLI also finished after the delay. Its H.264 stream matches the first native retake byte for byte, SHA-256 `c6cea411241f971f0b6306d0c3818a2b748509cc1966189b636a1b380c45cae9`. [CLI render report](../../.cache/sol-0.3.0/the-better-seat/native-comparison-render-report.json) · [Source input hashes](../../.cache/sol-0.3.0/the-better-seat/native-source-revision.json)

The producer inspected 300 chronological decoded stills, 121 consecutive event cells around the deciding action, cuts and transfers, and 25 matching source and decoded pairs. The review contains 395 distinct decoded images. At 32.5 seconds, the standing knight's outside boot has clear ground between it and the score. The lad rises at 34.8 seconds. Martin's open palm is visible at 44.125 seconds, though the offered handshake depends on interpreting his posture. At 55.46 and 56.42 seconds, two fingers project through the old saddle from the doorway. Martin and the fine saddle remain at the bench in the same shot through the final frame. Facial reactions and hand-level weight shifts are stylized. [Frame index and pair measurements](../../.cache/sol-0.3.0/the-better-seat/native-delivery-review/frames.json)

The fresh Sol High independent viewer followed the saddle destinations and saw Carlo's lateral step and the lad rise. The viewer read the kneel as Carlo winning the exchange and missed the step's consequence and the final joke. The original Sol High director passed the encode and withheld dramatic acceptance because the eyelines, overlapping hands and wide closing frame obscured the written action. The complete screenplay was reread and retained verbatim. [Blind first reading](../../.cache/sol-0.3.0/the-better-seat/native-independent-release.result.md) · [Director's decision](../../.cache/sol-0.3.0/the-better-seat/director-native-final.result.md)

### Focused picture correction

The next pass preserves the full view of Carlo's extra step. A closer sequence shows the lad turn, the print beside Carlo's boot beyond the score, Martin following the look, and Carlo speaking as the lad opens his mouth. Martin offers his hand in clear space after Carlo lifts the good saddle, then takes the saddle with both hands. The doorway detail makes the fingers visible before the camera returns to both men. Martin laughs and sits at the bench with the good saddle while Carlo leaves with the torn one.

The GPU beauty draw rendered 309 frame slots for the three corrected spans and preserved all 1,131 remaining source PNGs byte for byte. Nine fresh RGB comparisons matched the retained images exactly. The producer reviewed 300 chronological decoded stills and 171 consecutive event cells across 35 events, covering 432 distinct encoded images. Thirty-five images were paired with the same raw source frame. The paired source and decoded images had a mean absolute RGB channel difference of 1.88 out of 255. [Source continuity](../../.cache/sol-0.3.0/the-better-seat/decisive-continuity.json) · [Frame index](../../.cache/sol-0.3.0/the-better-seat/decisive-delivery-review/frames.json)

The fresh independent reviewer inspected all 300 chronological stills before seeing the screenplay. The outside foot and judging insert, deliberate saddle handover and fingers through the split were visible. The exact ring-out rule, Carlo's admission and the joke's intent remained open to the reviewer from pictures alone. [Blind first reading](../../.cache/sol-0.3.0/the-better-seat/decisive-independent.result.md)

The original Sol High director accepted the focused cut's picture and passed its technical encode after inspecting all 12 chronological sheets and six paired sheets. The director retained the complete approved screenplay and found the picture needs no further retake. The outside boot now redirects the verdict, the palm precedes both hands bearing the fine saddle, and the fingers and seated response are legible in sequence. Martin's exact eyeline, the coat catch and the palm's intent retain some ambiguity. The viewer still needs to hear the dialogue to judge how Carlo claims the loss and how the ending lands. [Signed picture and technical verdict](../../media/automovie/the-better-seat/frames/accepted/v3/records/director-decisive.result.md) · [Accepted frame archive](../../media/automovie/the-better-seat/frames/accepted/v3/index.json)

The [accepted MP4](../../media/automovie/the-better-seat/videos/the-better-seat.mp4) is 17,305,127 bytes, SHA-256 `c7a83afa012f457302022d028ccaba6610f93dbebb9ccbc622a23f359a0358f3`. Picture and sound each run 60.000 seconds. The file decoded 1,440 H.264 High progressive frames at 24 fps, 1,280 × 720, BT.709 yuv420p, with AAC-LC stereo at 48 kHz. The decoded mix measures −15.8 LUFS integrated and −2.8 dBTP. All five dialogue windows and the laugh matched the PCM reference at zero sample lag. The final review covers the stylized picture and technical encode. Listening, speech intelligibility, perceptual sync and uninterrupted audiovisual playback remain unverified. [Render report](../../media/automovie/the-better-seat/videos/picture-render-report.json) · [Stream probe](../../media/automovie/the-better-seat/videos/ffprobe.json) · [Soundtrack alignment](../../media/automovie/the-better-seat/videos/audio-alignment.json)

An isolated restoration mux using the delivered picture stream and PCM reproduced the accepted MP4's exact hash. The shared TypeScript check passed. The native motion adapter and final scene framing tests passed when run as an isolated bundle against the installed SDK. The full production test launcher timed out waiting for its dependency-build admission. [Type check](../../.cache/sol-0.3.0/the-better-seat/shared-final-tsc.log) · [Focused tests](../../.cache/sol-0.3.0/the-better-seat/native-focused-release-r3.log)
