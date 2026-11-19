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

/** Retarget the installed canonical Human's walk, breath and acting beats to a period costume. */
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
