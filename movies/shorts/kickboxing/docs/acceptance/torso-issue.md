# Native breath accumulates across action entries

## Failure

With the native breath layer, splitting a ten-second guard into ten consecutive one-second guards changes the final trunk posture substantially. With no breath layer, both compositions retain identical trunk angles. This is a controlled native reproduction, independent of the renderer, camera, gloves and full fight.

Observed environment: Windows x64, Node 22.23.2, pnpm 12.18.0, published AutoMovie 0.2.0 with the examples workspace's recorded motions/render patches. This does not establish the result on an unpatched release or a newer master.

The fighter is the production's existing canonical 1800 mm, 80 kg polygon person with native 10 oz hand equipment. The serialized motion body SHA-256 is `7845045e9ad033a19a8248924f69ebb941214df3d829493ae87c1d44dd7c5bca`.

## Controlled result

All cases use seed `kickboxing/torso-reproduction`, the same prepared body, native `guard`, ten seconds, orthodox stance, and breath rate 15 when enabled. Angles below are native clinical degrees at second ten.

| Breath | Guard actions | Spine flexion | Chest flexion |
| --- | --- | --- | --- |
| Off | One ten-second guard | 3.807923953 | 3.807923953 |
| Off | Ten one-second guards | 3.807923953 | 3.807923953 |
| On | One ten-second guard | 3.722085058 | 3.550407268 |
| On | Ten one-second guards | 1.273569589 | -3.795139138 |

With breath enabled, action subdivision adds -2.448515469 degrees of spine flexion and -7.345546406 degrees of chest flexion. The periodic layer should not become a new permanent offset each time another guard starts.

## Reproduction

The existing Fighter is available in [automovie-examples at f37b3da6](https://github.com/samchon/automovie-examples/blob/f37b3da6dfe48eaf402ff6cf660d4a24b5a0451b/movies/shorts/kickboxing/src/entities/cast/fighter/Fighter.ts). Install that workspace, then run the following TypeScript in its kickboxing production with the documented `ttsx --no-plugins -P tsconfig.json` entry. The retained production tool `src/executable/inspectTorso.ts` additionally writes all integer-second samples and measures the existing full-film keys; `docs/acceptance/torso-inspection.json` retains its result.

```ts
import { HumanBreath, HumanPerformance } from "@automovie/motions";
import { Fighter } from "./src/entities/cast/fighter/Fighter";

const fighter = new Fighter("owen", 0xb94439);
for (const breath of [false, true]) {
  for (const guards of [1, 10]) {
    let chain = fighter.chain();
    for (let i = 0; i < guards; i++)
      chain = chain.guard({ seconds: 10 / guards, stance: "orthodox" });
    const motion = new HumanPerformance({
      seed: "kickboxing/torso-reproduction",
      performers: [fighter.performer({ x: 0, y: 0, z: 0 }, 0)],
      composition: chain.node,
      layers: breath ? { owen: [HumanBreath.layer({ rate: 15 })] } : {},
    });
    console.log({ breath, guards, joints: motion.pose("owen", 10).joints
      .filter(j => j.bone === "spine" || j.bone === "chest") });
  }
}
```

## Causal path

The installed `HumanSegmentEntry.entry` takes the previous action's posture through `HumanSegmentPose.layered` when constructing the next action's entry. `guard` carries `entry.joints`; `StrikingStance.joints()` sets the chin and fingers but does not restore the trunk. `HumanBreath.add` adds volume-scaled flexion to the incoming spine and chest. The previous layer's trunk offset therefore enters the next action's baseline and receives breathing again. The controlled subdivision comparison isolates the resulting drift.

Layered appearance, action-entry continuity and the underlying action baseline need separate ownership so an additive periodic layer does not integrate into the next baseline. This report proposes no production pose correction or SDK patch. The user explicitly requested an issue only.

## Full-film observation

The retained native output SHA-256 is `e131fecc7ebd2b950242ecb6065f7a013c44c934f7ed92ca6f21a4091e535032`. Over frames before picture second 148, Owen's chest flexion is at -20 degrees for 3182/4440 samples; Marek's is there for 2844/4440. Marek's chest twist is at +35 degrees for 2498/4440 samples and spine twist at +45 for 2143/4440. Those are separate per-axis counts, not a claim that all occur together.

The film's long-held extension and saturated twist help explain its rigid, contorted trunk. The breath reproduction establishes flexion accumulation; the exact cause of the film's twist accumulation remains unisolated and must not be assigned to breathing. Existing arm/root discontinuities remain tracked in #3576 and contact failures in #3574. No motion-package source is changed by this report.
