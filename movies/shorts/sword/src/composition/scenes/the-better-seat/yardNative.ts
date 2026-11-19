import type { IAutoMovieMotionHumanBody, IAutoMovieVector3 } from "@automovie/interface";
import { HumanChain } from "@automovie/motions";
import { Euler, Quaternion, Vector3 } from "three";

import type { ActorPose, CastActor } from "../../shared/castActor";
import { nativeStageMotion } from "../../shared/nativeStageMotion";

/** Compile directed looks, recovery travel and the invitation response for the yard. */
export function yardNative(): (
  second: number,
  martin: CastActor, carlo: CastActor, lad: CastActor,
  martinPose: ActorPose, carloPose: ActorPose, ladPose: ActorPose,
) => void {
  type Side = "Martin" | "Carlo" | "Stable lad";
  type Chain = ReturnType<typeof HumanChain.subject>;
  type Native = ReturnType<typeof nativeStageMotion.compile>;

  const body: Record<Side, IAutoMovieMotionHumanBody> = {
    Martin: nativeStageMotion.wardrobeBody(1.80),
    Carlo: nativeStageMotion.wardrobeBody(1.76),
    "Stable lad": nativeStageMotion.wardrobeBody(1.44),
  };
  const ground = (x: number, z: number): IAutoMovieVector3 => ({ x, y: 0, z });
  const lookAt = (x: number, y: number, z: number) => ({
    kind: "point" as const, at: { x, y, z }, frame: "world" as const,
  });
  const degree = (angle: number): number => angle * 180 / Math.PI;
  function plan(
    subject: Side,
    label: string,
    at: IAutoMovieVector3,
    yaw: number,
    add: (chain: Chain) => Chain,
  ): Native {
    return nativeStageMotion.compile({
      seed: `yard/${label}`,
      performers: [{ subject, body: body[subject], at, yaw, proficiency: { level: "trained" } }],
      composition: add(HumanChain.subject(subject)).node,
    });
  }
  const opening = plan("Stable lad", "terms", ground(-2.09, .14), degree(.38),
    chain => chain.look({ target: lookAt(-1.42, 1.45, .03), with: "head", cue: "seen", seconds: 1.55 }));
  const notice = plan("Stable lad", "first-word", ground(-2.64, .24), degree(.82),
    chain => chain.look({ target: lookAt(1.690, .074, .094), with: "head", cue: "seen", seconds: 2.45 }));
  const martinFollows = plan("Martin", "martin-sees-the-print", ground(.73, .16), degree(.89),
    chain => chain.look({ target: lookAt(1.662, .004, .135), with: "head", cue: "signal", seconds: 1.40 }));
  const ladRecoil = plan("Stable lad", "steel-report", ground(-2.71, .39), degree(.51),
    chain => chain.look({ target: lookAt(-.07, 1.44, .39), with: "head", cue: "signal", seconds: 1.15 }));
  const martinKneels = plan("Martin", "martin-knee-inside", ground(.73, .16), degree(.89),
    chain => chain.kneel({ kind: "one", knee: "right", hold: 7.3 }));
  const martinReturn = plan("Martin", "martin-walks-to-bench", ground(.73, .16), degree(.89),
    chain => chain.walk({
      to: ground(-1.06, .16),
      face: degree(-.27),
      pace: "normal",
    }));
  const carloReturn = plan("Carlo", "carlo-walks-to-bench", ground(1.31, -.16), degree(-.65),
    chain => chain.walk({
      to: ground(-.94, .26),
      face: degree(.06),
      pace: "fast",
    }));
  const carloLeaves = plan("Carlo", "saddle-to-door", ground(-1.68, .11), degree(.71),
    chain => chain.walk({
      to: ground(3.08, -2.15),
      via: [ground(.66, -.37), ground(2.55, -1.38)],
      face: degree(-.35),
      pace: "fast",
    }));
  const martinNod = plan("Martin", "invitation-nod", ground(-1.06, .14), degree(.68),
    chain => chain.gesture({ kind: "nod", count: 1 }));
  const martinSits = plan("Martin", "martin-sits-with-saddle", ground(-.88, .78), degree(.56),
    chain => chain.sit({
      seat: { at: { x: -1.13, y: .575, z: .745 }, yaw: degree(.56), depth: .40 },
      seconds: .3,
    }));

  const vertical = new Vector3(0, 1, 0);
  function gaze(sample: nativeStageMotion.Sample, target: ActorPose): void {
    const head = sample.bones.get("head")!.worldRotation;
    const rotation = new Quaternion().setFromAxisAngle(vertical, -sample.headingRadians)
      .multiply(new Quaternion(head.x, head.y, head.z, head.w));
    const angles = new Euler().setFromQuaternion(rotation, "YXZ");
    target.headYaw = angles.y;
    target.headPitch = angles.x;
  }
  function applyGaze(track: Native, subject: Side, localTime: number, target: ActorPose): void {
    if (localTime < 0 || localTime > track.performance.duration) return;
    gaze(track.sample(subject, localTime), target);
  }
  function applyBase(
    track: Native, subject: Side, from: number, until: number, second: number,
    actor: CastActor, target: ActorPose, useArms: boolean,
  ): void {
    if (second < from || second > until) return;
    const time: number = (second - from) / (until - from) * track.performance.duration;
    const sample = track.sample(subject, time);
    actor.root.position.set(sample.position.x, 0, sample.position.z);
    actor.root.rotation.y = sample.headingRadians;
    target.nativeLegs = sample;
    if (useArms) target.nativeArms = sample;
  }
  return (second, martin, carlo, _lad, martinPose, carloPose, ladPose): void => {
    applyGaze(opening, "Stable lad", second - 1.95, ladPose);
    applyGaze(ladRecoil, "Stable lad", second - 16.65, ladPose);
    applyGaze(notice, "Stable lad", second - 34.66, ladPose);
    applyGaze(martinFollows, "Martin", second - 35.12, martinPose);
    applyGaze(martinNod, "Martin", second - 54.38, martinPose);
    applyBase(martinKneels, "Martin", 28.95, 40.76, second, martin, martinPose, false);
    applyBase(martinReturn, "Martin", 40.76, 42.6, second, martin, martinPose, true);
    applyBase(carloReturn, "Carlo", 39.75, 41.54, second, carlo, carloPose, true);
    applyBase(carloLeaves, "Carlo", 47.44, 51.44, second, carlo, carloPose, true);
    applyBase(martinSits, "Martin", 57.73, 60, second, martin, martinPose, false);
  };
}
