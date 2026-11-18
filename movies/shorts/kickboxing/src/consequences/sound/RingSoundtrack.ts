import { renderProductionSound } from "@automovie/engine";
import type { IAutoMovieProductionSoundEvent, IAutoMovieProductionSoundPlan, IAutoMovieVector3 } from "@automovie/interface";
import type { HumanPerformance } from "@automovie/motions";

/**
 * A native procedural sound sketch: actual geometric strike contacts, native
 * footfalls, fall contacts, two bell markers and a quiet wordless bed. It has
 * no dialogue or music and does not claim recorded Foley or a real arena.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Defines the dry procedural palette, actual event provenance and hearing/realism limits.
 * @evidence contracts/development/design.md#principled-representation Converts native interaction/schedule records into the installed sound plan; native synthesis owns every sample.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One render port takes the actual native receipt and its provenance digest.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No generated voice, custom DSP, invented impact force or claim of listened acceptance.
 */
export class RingSoundtrack {
  /**
   * Render the no-voice preview through the installed semantic sound palette.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States semantic event selection, dry mix and the procedural ambience/bell stand-ins.
   * @evidence contracts/development/implementation.md#principled-implementation Places first actual strike contacts, native footfalls and fall events on the delivery grid, then delegates mixing and analysis to renderProductionSound.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Add contacts, scheduled support events and the two true bell anchors; render one declared native plan.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No speech, score, downloaded asset, manual waveform or physical-intensity inference.
   * @evidence contracts/development/implementation.md#efficient-algorithms One linear scan deduplicates strike actions; native sound owns mixing and analysis cost.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Reads the completed motion receipt rather than resolving choreography again.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns in-memory PCM and analysis without handles or retained background state.
   * @evidenceExclude contracts/development/behaviors.md#studied-laws This is the installed procedural preview palette, not a measured acoustic or biomechanical law.
   * @evidence contracts/development/behaviors.md#relational-goals Contact cues come only from native detected hits; footfalls and the fall use their actual schedule events. Fixed gains are dry mix choices, never forces.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation The supplied receipt, explicit seed and native 30fps/48kHz sample mapping determine the sketch.
   */
  public static render(input: { hits: ReturnType<HumanPerformance["hits"]>; schedule: HumanPerformance["schedule"]; preparation: number; fingerprint: string }): ReturnType<typeof renderProductionSound> {
    const events: IAutoMovieProductionSoundEvent[] = [];
    const add = (id: string, time: number, kind: IAutoMovieProductionSoundEvent["kind"], point: IAutoMovieVector3, gain: number): void => {
      if (time < 0 || time >= 180) return;
      const frame: number = Math.round(time * 30);
      events.push({ id, shot: "kickboxing", event: id, kind, frame, timeSeconds: frame / 30, emitter: point, listener: point, distanceMeters: 0, memberCount: 1, spreadRadiusMeters: 0, densityGain: gain, pan: 0, attenuation: 1, seed: events.length + 1 });
    };
    const heard: Set<string> = new Set();
    for (const hit of input.hits) {
      const key: string = `${hit.actor}/${hit.actionIndex ?? `mutual/${hit.target}`}`;
      if (hit.point === null || heard.has(key)) continue;
      heard.add(key);
      add(`contact/${key}`, hit.time - input.preparation, "contact", hit.point, 0.65);
    }
    for (const entry of input.schedule.entries) for (const event of entry.events ?? []) {
      if (event.name.includes("HeelStrike")) add(`step/${entry.index}/${event.name}`, event.seconds - input.preparation, "arrival", { x: 0, y: 0, z: 0 }, 0.18);
      if (entry.intent.anchor === "finish-down" && ["seatContact", "supine", "lateral"].includes(event.name)) add(`fall/${event.name}`, event.seconds - input.preparation, "arrival", { x: 0, y: 0, z: 0 }, 0.45);
    }
    add("bell/opening", 0, "reveal", { x: 0, y: 0, z: 0 }, 1);
    add("bell/closing", 170.1, "reveal", { x: 0, y: 0, z: 0 }, 1);
    const plan: IAutoMovieProductionSoundPlan = {
      version: 1, inputFingerprint: input.fingerprint, fps: 30, totalFrames: 5400, sampleRate: 48_000, channels: 2,
      events, dialogue: [],
      cues: [{ id: "arena/wordless-bed", asset: "native-procedural-arena", startFrame: 0, durationFrames: 5400, sourceOffsetFrame: 0, sourceDurationFrames: 5400, gain: 0.3, fadeInFrames: 30, fadeOutFrames: 30, bus: "ambience", seed: 417 }],
    };
    return renderProductionSound({ plan });
  }
}
