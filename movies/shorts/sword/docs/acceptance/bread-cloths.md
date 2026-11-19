# Bread Cloths — production acceptance

The director accepted the screenplay for delivery on 19 November 2026. Its 5 beats cover 0–10, 10–21, 21–32, 32–48, 48–60 authored seconds. [Screenplay](../body/screenplay/bread-cloths/010-two-bends.md)

## Director's reading

At 21–32 seconds, the youngest slips his heel back into his shoe before Perrin leaves the turn. When Alix’s sack catches, the view holds across the bank. With the split rock at his back, the caller takes one last step and stops beside the bareheaded man. Both faces turn up toward the hanging load. That breath gives me time to place them before Alix looks down and discovers how close the man’s fingers are. Later, the familiar slap tells me the youngest is following the sack downhill while the women wait with their cloths open. The order reads clearly on the page. The length of that pause and the audibility of the footfall remain unmeasured.

## Independent reading and edition

An earlier reading found the shoe recovery, Perrin stopping and the sack catching competed for attention. The first adjustment moved the shoe recovery offscreen and gave the two men a pause beneath the hanging sack. On that edition a commissioning viewer lost the connection between the shoe left at the turn and the final downhill slap. The original writer restored one visible cue before the camera leaves the turn. The later pause beneath the load keeps its full place.

A later reading could identify both men underneath the sack but missed how the caller had reached the bareheaded man. The original writer changed one action sentence inside the existing across-bank view. With the split rock behind him, the caller takes one last step and stops alongside the bareheaded man. Both faces are still for one breath before Alix looks down. The same independent reader reread the full five beats before receiving the current criteria and file identifiers. The reader could trace the approach, the support under the sack and the youngest's downhill footfall. Actual screen time, spatial visibility and sound separation remain unmeasured.

The film uses 7 individually identified subjects and 14 casting photographs. The host compared each full and detail view with the cast record, then verified the files and their applicable input hashes. The commissioning viewer inspected the originals and selected them for the user. The independent reader judged the texts and their descriptions. [Casting photographs and receipts](../prompts/casting/photographs.md)

The screenplay accepted before production had LF SHA-256 `5a2ceb49749758df2f3b91af0d7b286485339810c1f1abe936a3ca2f5d1de2dc` and H2 fingerprint `7eea3f2`. The director, original writer, independent Evidence answerer and independent reader worked in separate roles. The host verified all 53 narrative fingerprints in that edition. The film review below records the revised edition. [Collection and verification](../../PROJECT.md#edition)

## Direct 3D production

The film derives its staging, props, cameras and seekable minute from the [Bread Cloths film source](../../src/composition/films/bread-cloths.ts). The polygon cast uses the production's shared AutoMovie Human geometry. Clothing colors, hair, proportions and distinct accessories carry cast identity in the stylized figures. The dialogue track uses the five manuscript lines and four stock voices.

The initial Sol High director reviewed the inherited pilot. A subsequent set of 56 source stills located the unclear armour recoil at 13 seconds, overlapping hand and blade at 31 seconds, load transfer at 42–46 seconds and overlapping linen and portions at 53–60 seconds. The repair changes the blocking, shot axes, bag support, seam state, foot and shoe attachment, carrying poses and placement of the portions. The director reopened the screenplay as a possible cause if the full encoded picture shows dramatic weakness.

### Sound and restoration

The local Piper en_GB VCTK medium voice uses p248 for the hospice woman, p225 for Alix, p226 for both of Perrin's lines and p243 for the caller. Scripted dialogue and procedural stereo Foley run on separate stems. The mix contains no score. Voice synthesis uses the stock model unchanged and the speaker performances are generated from the screenplay. [Piper voice model card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_GB/vctk/medium/MODEL_CARD) · [CSTR VCTK Corpus, University of Edinburgh, CC BY 4.0](https://datashare.ed.ac.uk/handle/10283/3443)

Run these commands from the production with the workspace's AutoMovie 0.3.0 dependencies, Node.js 22.23.2 or later, Playwright Chromium with D3D11, FFmpeg, the shared Piper Windows binary and voice model, and Python with NumPy and Pillow. Set `-Voices` when the shared voice model is kept elsewhere. The delivery command recognizes the workspace's shared FFprobe or accepts its path through `-Probe`.

```powershell
$picture = '.cache/sol-0.3.0/bread-cloths/verified-picture-v3'
& ./tools/bread-cloths/sound.ps1
node tools/bread-cloths/draw.mts --encode "--out=$picture"
& ./tools/bread-cloths/deliver.ps1 -Picture (Join-Path $picture 'film.mp4') -Source $picture
```

The producer uses the installed AutoMovie beauty draw port and streams its native-size pictures through Chromium and FFmpeg. Eight representative 1280 × 720 frames matched the standard AutoMovie GPU capture with zero RGB difference. The delivery command copies the encoded picture into the MP4 and encodes its 48 kHz stereo AAC mix. The chosen web target is −18 LUFS integrated within 1 LU and at most −1 dBTP after decoding. The synthesis receipts, source render report, decoded frame sheets and stream measurements are under `.cache/sol-0.3.0/bread-cloths/`.

A restoration smoke test synthesized the five lines and stereo Foley in an unused location, then muxed the verified AutoMovie picture there with the explicit picture and sound arguments. It decoded 1,440 frames and 60.000 seconds at 24 fps with stereo sound. [Restoration receipt](../../.cache/sol-0.3.0/bread-cloths/restore-v3-smoke/receipt.json)

### First encoded draft

The preserved first [Bread Cloths MP4](../../.cache/sol-0.3.0/bread-cloths/bread-cloths-first-encoded-draft.mp4) runs for 60.000 seconds. FFprobe reports 1,440 H.264 High progressive frames at 1280 × 720 and 24 fps plus 48 kHz stereo AAC-LC. The draft is 9,783,024 bytes. Its SHA-256 is `c4ae3d4c8cd89760eb6adfc02fbdd3fb6a1382068341b9f8e5d3923978f9e34b`.

The official AutoMovie draw and encode ran on the AMD Radeon 8060S Direct3D11 backend in Chromium 158.0.8127.18. It used the film's isolated subject wrapper while other film source was being edited. The normal restore entry point is the registered subject. The film regression passed on its own bundled entry, including seek repeatability, left shoe planting and reseating, the tear, successive sack support and both portions staying with their cloths.

The decoded release mix measured −18.5 LUFS integrated and −1.7 dBTP. The five generated line windows are 0.98–2.44, 3.04–4.29, 6.15–8.15, 10.14–12.12 and 14.79–15.46 seconds. Dialogue exceeds the effects bed by 11.16–17.82 dB RMS in the source stems over those windows. The stylized faces have fixed mouth geometry. Continuous playback, intelligibility and sound-to-picture timing by ear remain for human review.

The host and a fresh Sol High reviewer examined the encoded minute in 300 chronological samples at about five stills per second, plus the last frame. The host also examined 88 cut-window frames, 269 contact-window frames and 138 source-matched stills. The blind viewer correctly counted the bread in both cloths and recognized the robbers sharing the lower load. The viewer read the sack as a lidded vessel and could not tell why Perrin let it go. The production therefore reopened the complete screenplay alongside the staging and prop review. The blind review is `01a1f0f8-2179-7de1-9632-d1fea705af15` and the director is `01a1f0c7-e8c4-7e61-9bf0-6a5adc598e14`.

### Revised screenplay and performance

The director adopted a continuous side view of the upper path from 38 to 44.5 seconds. It follows Alix from the rolling loaf through the slip, Perrin's release and the return of both heels to firm ground. The lower lift gets its own view at 44.5 seconds. The boot and rock geography carry into the next cross-bank view, where the sack goes downhill while both cloths wait with a whole loaf each.

The complete [revised screenplay](../body/screenplay/bread-cloths/010-two-bends.md) has LF SHA-256 `83d92062e922fa80e2d0249323a8d08aaa48af889536df91c88cb7fd94f25fb6`. All five original cues and dialogue lines match verbatim. The Sol High revision writer `01a1f0ff-0880-7983-8db2-f8adfc245892` adopted the director's timing and repaired the opening file order, the caller's sheathing, the youngest's route and the women's movement inland. The separate Evidence answerer `01a1f109-4b0d-7b90-9e73-c1c8233c7bc3` checked the same full body and answered all 22 construction declarations. The independent screenplay reader `01a1f117-9954-7590-880e-5318b637a03c` traced the bread threat, the slip and the choice to give up the sack, and counted the shares without the staging notes. On rereading, they closed the four continuity findings, identified Perrin retrieving his sword as a staging detail, and authorized their exact clear verdict for verified native H2 fingerprint `be20f92`. The two most compressed windows are 35–38 seconds and 38–40 seconds.

The revised [native performance](../../src/composition/scenes/bread-cloths/010-two-bends/performance.ts) drives the visible walking joints, final two-handed carry, opening wave, caller's point, Perrin's uphill signal and Red Cap's touch. The native planner refused the wood contact from the earlier body placement. Moving and turning Red Cap within the lower road brought the same physical point into the admitted reach, and the focused film test passed. The scene owns the bank route and slopes, the shoulder sack, the loose shoe's release and docking, the shared load's bend and placement, the bread split, and the deforming linen. The native carry law supplies the visible paired hand pose and its movement anchors the closing bundles.

### Second encoded cut and local continuation

The [preserved second cut](../../.cache/sol-0.3.0/bread-cloths/v3-splice/bread-cloths-v2.mp4) has SHA-256 `2a2bea3fb19da04a5a5271157c178424b0d420363ff922962c7f6a4d12f8fd6b`. Its 60 seconds have 1,440 frames and measured −18.4 LUFS and −1.9 dBTP. The host inspected 300 regular decoded frames plus the last frame, 106 frames around the cuts, and 294 at contact windows. FFmpeg comparison used 197 source pictures across the minute. The fresh Sol High viewer `01a1f149-7261-79c2-b99e-2d83018e56d9` recognized the contest for the sack, Perrin pulling Alix to safety, the separate departure and exactly one whole loaf and half per cloth. The strap still crossed Alix's silhouette during the apparent recovery and left the cause of the rescue open to interpretation.

The same director authorized a grouped correction over frames 908–1067 and 1260–1439. The free end drops on the stump side while Perrin reaches for Alix, and the opening of the carry blends from the completed bread placement into native loaded wrists. The two women hold the cloth tails during the final walk. These windows use the original IDR boundaries to preserve the unchanged picture. An unmodified control split and rejoin matched all 1,440 decoded frames and presentation timestamps.

### Final delivery and inspection

The [final MP4](../../media/automovie/bread-cloths/videos/bread-cloths.mp4) is 10,690,883 bytes with SHA-256 `eaa1dded48408d36bbfcc3c0bbc16c329320ebd573221406c47dd85b7414ca34`. FFprobe decoded 1,440 progressive H.264 High frames at 1280 × 720 and 24 fps. The picture and 48 kHz stereo AAC-LC tracks both run 60.000 seconds. The decoded mix measures −18.4 LUFS integrated and −1.9 dBTP. The [source PCM](../../media/automovie/bread-cloths/audio/bread-cloths.wav) has SHA-256 `1d2dd296454d7c92701182aa897b5a099cedeca374e0b40376037c001a4cdffa`. The [render report](../../media/automovie/bread-cloths/videos/bread-cloths-render-report.json) distinguishes the retained and re-encoded spans.

Decoded RGB SHA-256 matches for all 1,100 retained frames at F0–907 and F1068–1259. The 340 other frames lie within the two authorized windows. Presentation timestamps advance by exactly 1/24 second with independently decodable boundaries at F908, F1068 and F1260. The mux retains the verified H.264 track byte for byte and the full decoded stereo track matches the preceding cut. The [splice verification](../../media/automovie/bread-cloths/frames/accepted/v3/records/verification.json) and [decoded measurements](../../media/automovie/bread-cloths/frames/accepted/v3/records/measurement.json) identify the measured files. A full fresh encode reconstructs the authored picture and can yield different compressed bytes from the retained splice.

The host checked the full chronology at about five stills per second through 300 samples plus the final frame. In the corrected cut the host rechecked all changed windows, the neighboring cut frames and consecutive contact sequences, and verified the retained images by their decoded hashes. The review retained 659 distinct decoded pictures, including 106 cut-window frames and 294 contact-window frames. Across 229 source-matched frames, the mean absolute decoded RGB difference is 1.8075 and the maximum sample mean is 1.9585 on the 0–255 scale. The final decode has no identical adjacent frames at the measurement scale. [Accepted chronology, contact and join sheets](../../media/automovie/bread-cloths/frames/accepted/v3/index.json)

The fresh independent Sol High viewer `01a1f15f-f641-75f3-94d9-4efc1b53e548` reviewed all twelve chronological sheets from the final encoded file. They understood Perrin's choice to save Alix first and recognized each cloth receiving one whole loaf and half of the third. The exact grip on the ledge and the men's initial intentions remained ambiguous in the sampled pictures. [Independent recorded response](../../media/automovie/bread-cloths/frames/accepted/v3/records/reviewer-v3-blind.result.md)

The original Sol High director `01a1f0c7-e8c4-7e61-9bf0-6a5adc598e14` accepted the exact v3 encode for final picture presentation. They saw the loose strap clear Alix at F983–989, Perrin's reach meet her near arm at F1003–1009, and both people recover to the ledge by F1018. They confirmed the count at 55.58 seconds, the continuous bread placement across the F1354–1356 join, and both women holding the linen tails through F1439. The director identified no further picture repair necessary for the story. [Director's verdict](../../media/automovie/bread-cloths/frames/accepted/v3/records/director-v3-final.result.md)

The opening weight assist remains partially obscured from 4–6 seconds. The shoe recovery at 22.8–24.4 seconds, Red Cap's support against the bank at 30.6–31.8 seconds, and the exact cause of the seam tear remain visually subtle in the stylized staging. The generated cast has fixed mouths. Listening for speech intelligibility, effects timing and natural-speed continuity remains unassessed.
