import { HumanBreath, HumanChain } from "@automovie/motions";
import { Euler, Quaternion, Vector3 } from "three";

import { nativeStageMotion } from "../../composition/shared/nativeStageMotion";
import type { CarryRole } from "./CarrySculpture";

type Sample = nativeStageMotion.Sample;
type Track = ReturnType<typeof nativeStageMotion.compile>;
interface CarryMotion {
  rest: Sample;
  armRatio: number;
  legRatio: number;
  frame(second: number, stride: number, walkShare: number): {
    idle: Sample;
    travelling: Sample;
    feel?: Sample | undefined;
    step: Euler;
    breath: Euler;
    assent?: Euler | undefined;
  };
  evidence(): object;
}

/**
 * Compiles one role's canonical Human tracks using shoulder height in metres. Samples accept absolute film seconds, travel phase and a walk blend.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Defines the height, clock, walk input, rest reference and borrowed role-track ownership.
 * @evidence contracts/development/implementation.md#principled-implementation Transforms the costume shoulder datum into a canonical body height by the production's 0.82 ratio, then compiles walk, stance with breath, and the applicable acting cue. A monotonic native root-distance table is searched to reconstruct the gait phase after random seeks.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The shared motion bridge compiles and samples installed FK. This adapter owns the authored cues and clock mapping; Cast owns visible costume offsets, support reach and pose application.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Travel speed, stride and gesture windows are staged film choices. Per-role caching assumes the single fixed shoulder height the wardrobe supplies; a later call with the same role and a different height would reuse the first track.
 * @evidence contracts/development/implementation.md#efficient-algorithms Construction samples native root travel at 12 divisions a second and compiles the applicable tracks once. Each gait lookup searches logarithmically and samples a fixed set of bones.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The seven-role source uses one fixed height per role, so compiled tracks and the distance table serve every actor and seek for that role. A different body is outside that equivalence.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The module retains one track per valid role and its compiled SDK data until unload. Per-frame samples are returned to the caller and no renderer, task or filesystem handle is opened.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/denis.md#screen and docs/body/brief/cast/colin.md#screen distinguish two rear corners; docs/body/screenplay/the-last-carry/010-valley-lane.md#hem and #mark supply Colin's answer and Denis's shoulder check. The adapter hands their timed FK to Cast.
 * @evidence contracts/development/entities.md#object-shape Returns rest bones, limb proportions, sampled pose, and action receipts. It is a direct 3D adapter with cached tracks and outputs sampled transforms rather than only action records.
 * @evidence contracts/development/entities.md#controls-and-source Uses installed HumanChain, HumanBreath and the nativeStageMotion FK bridge. The result drives Cast's pelvis, boot, arm and head motion; the full bier support remains authored in ValleyLane.
 */
export function carryNativeMotion(role: CarryRole, shoulder: number): CarryMotion {
  const prior = tracks.get(role);
  if (prior) return prior;
  const body = nativeStageMotion.wardrobeBody(shoulder / 0.82);
  const performer = {
    subject: role, body, at: { x: 0, y: 0, z: 0 }, yaw: 0,
    proficiency: { level: "trained" as const },
  };
  const compile = (suffix: string, node: ReturnType<typeof HumanChain.subject>["node"], breath = false): Track =>
    nativeStageMotion.compile({
      seed: `carry/${role}/${suffix}`,
      performers: [performer],
      composition: node,
      ...(breath ? { layers: { [role]: [HumanBreath.layer()] } } : {}),
    });

  const stance = compile("stance", HumanChain.subject(role).stand({ seconds: 60 }).node, true);
  const walk = compile("walk", HumanChain.subject(role).walk({
    to: { x: 0, y: 0, z: 20 },
    pace: "slow",
    stride: 0.66,
    armSwing: 0.58,
  }).node);
  const rest = stance.sample(role, 0);
  const nod = role === "colin" ? compile("assent", HumanChain.subject(role)
    .gesture({ kind: "nod", count: 1, hold: 0.11 }).node) : undefined;
  const shoulderTouch = role === "denis" ? compile("mark", HumanChain.subject(role)
    .touch({ target: { kind: "self", region: "shoulderRight" }, kind: "hold", side: "left", hold: 0.20 }).node) : undefined;

  // Map the film's travelled distance back to the native walk clock. A fixed root
  // displacement starts the same native contacts after every seek.
  const steps = Math.ceil(walk.performance.duration * 12);
  const distance = Array.from({ length: steps + 1 }, (_, index) => {
    const second = index / steps * walk.performance.duration;
    return walk.performance.pose(role, second).root?.translation?.z ?? 0;
  });
  const walkAt = (metres: number): Sample => {
    let lower = 0;
    let upper = steps;
    const target = Math.min(distance[steps]!, Math.max(distance[0]!, metres));
    while (upper - lower > 1) {
      const middle = Math.floor((lower + upper) / 2);
      if (distance[middle]! <= target) lower = middle;
      else upper = middle;
    }
    const advance = distance[upper]! - distance[lower]!;
    const fraction = advance > 1e-7 ? (target - distance[lower]!) / advance : 0;
    return walk.sample(role, (lower + fraction) / steps * walk.performance.duration);
  };
  const difference = (sample: Sample, bone: "hips" | "head" | "chest"): Euler => {
    const base = rest.bones.get(bone)!.worldRotation;
    const live = sample.bones.get(bone)!.worldRotation;
    const rotation = new Quaternion(live.x, live.y, live.z, live.w)
      .multiply(new Quaternion(base.x, base.y, base.z, base.w).invert());
    return new Euler().setFromQuaternion(rotation, "YXZ");
  };
  const at = (track: Track, start: number, stop: number, second: number): Sample =>
    track.sample(role, track.performance.duration * (second - start) / (stop - start));
  const describe = (track: Track) => track.performance.segments(role).map((segment) => ({
    action: segment.name,
    start: segment.start,
    end: segment.end,
    contacts: segment.plan.contacts?.length ?? 0,
  }));

  const motion = {
    rest,
    armRatio: limbRatio(rest, "leftUpperArm", "leftLowerArm", "leftHand"),
    legRatio: limbRatio(rest, "leftUpperLeg", "leftLowerLeg", "leftFoot"),
    frame(second: number, stride: number, walkShare: number) {
      const idle = stance.sample(role, second);
      const travelling = walkShare > 1e-6 ? walkAt(stride / 8.8) : rest;
      const assent = nod && second >= 8.8 && second <= 10.24
        ? at(nod, 8.8, 10.24, second) : undefined;
      const feel = shoulderTouch && second >= 54.98 && second <= 56.33
        ? at(shoulderTouch, 54.98, 56.33, second) : undefined;
      return {
        idle, travelling, feel,
        step: difference(travelling, "hips"),
        breath: difference(idle, "chest"),
        assent: assent ? difference(assent, "head") : undefined,
      };
    },
    evidence() {
      return {
        gait: describe(walk),
        stance: describe(stance),
        gesture: nod ? describe(nod) : undefined,
        touch: shoulderTouch ? describe(shoulderTouch) : undefined,
        layer: "HumanBreath",
      };
    },
  };
  tracks.set(role, motion);
  return motion;
}

/** Fit the canonical upper/lower proportion to the production's admitted costume reach. */
function limbRatio(
  rest: Sample,
  upper: "leftUpperArm" | "leftUpperLeg",
  lower: "leftLowerArm" | "leftLowerLeg",
  end: "leftHand" | "leftFoot",
): number {
  const joint = new Vector3(...rest.points.get(lower)!);
  const first = joint.distanceTo(new Vector3(...rest.points.get(upper)!));
  return first / (first + joint.distanceTo(new Vector3(...rest.points.get(end)!)));
}

const tracks = new Map<CarryRole, CarryMotion>();
