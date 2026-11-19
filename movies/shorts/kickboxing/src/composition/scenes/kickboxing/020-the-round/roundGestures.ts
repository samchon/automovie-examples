import type { AutoMovieHumanoidBone, IAutoMovieHumanCanonicalBody, IAutoMovieMotionHumanChain } from "@automovie/interface";
import { createHumanBody, HumanChain, HumanPerformance } from "@automovie/motions";

import { roundClock } from "../../../../clock";
import type { ActorPose } from "../../../../entities/cast/roundCast/ActorPose";
import type { Role } from "../../../../entities/cast/roundCast/Role";

type GestureRole = "owen" | "marek" | "daniel" | "jo" | "ed" | "pavel" | "maya" | "ruth";
type Point = [number, number, number];
const cueSecond = 3;
const nativeClapMidpoint = .5 / 4;

function handGoals(
  bones: ReturnType<HumanPerformance["bones"]>,
  clearance: number,
): { goals: [Point, Point]; leftSide: 0 | 1 } {
  const position = (bone: AutoMovieHumanoidBone) => {
    const point = bones.get(bone)?.worldPosition;
    if (!point) throw Error(`Native action is missing ${bone}.`);
    return point;
  };
  const left = position("leftUpperArm");
  const right = position("rightUpperArm");
  const midpoint = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2, z: (left.z + right.z) / 2 };
  const local = (hand: "leftHand" | "rightHand"): Point => {
    const goal = position(hand);
    return [
      goal.x - midpoint.x,
      goal.y - midpoint.y + .394 + clearance,
      goal.z - midpoint.z + clearance,
    ];
  };
  const leftSide = left.x < right.x ? 0 : 1;
  const goals: [Point, Point] = leftSide === 0 ? [local("leftHand"), local("rightHand")] : [local("rightHand"), local("leftHand")];
  return { goals, leftSide };
}

/**
 * Plans supported sporting guard, official hand and ringside gestures on the mounted canonical cast. The returned port applies guard controls and canonical hand goals on programme time, while the camera and the seat supports stay with the scene.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the supported actions, the mounted bodies and the split between programme time, hand goals and scene support.
 * @evidence contracts/development/implementation.md#principled-implementation The installed performance prepares guard and gesture trajectories. Each named gesture event is aligned by the vocabulary to a local cue, then sampled at the scripted programme anchor. Canonical hand positions are expressed relative to their own shoulder line before being handed to the puppet.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Resolve one reusable pose or gesture per role and action. The application closure selects only the active windows and applies them to their authored roles.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The mounted actor's actual canonical body supplies every native action solve. The screenplay names each clap or hand signal's instant. The film claims native poses only over these supported channels.
 * @evidence contracts/development/implementation.md#efficient-algorithms Plans are built once for the fixed cast and action definitions. Each frame samples only active gestures and reuses the guard pose controls.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Repeated claps of the same performer reuse that performer's identical native plan, shifted to each screenplay cue. Independent roles keep separate body preparations.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned scene-owned closure retains eight native body records and the bounded action plans. No handle or network operation persists.
 * @evidence contracts/development/composition.md#screenplay-realization Installed gestures supply the supported guard, standing break hand, applause and answering hand over the shared round clock.
 * @evidence contracts/development/composition.md#composition-only HumanChain and HumanPerformance resolve the plans. Local shoulder-relative conversion and clearance adapt their targets to the drawing rig.
 * @evidence contracts/development/composition.md#living-scene The native poses begin and end on their own windows. The local performance provides the surrounding body placements and reactions.
 */
export function roundGestures(
  canonical: Record<GestureRole, IAutoMovieHumanCanonicalBody.IBody>,
): (people: Record<Role, ActorPose>, seconds: number) => void {
  const bodies = Object.fromEntries(Object.entries(canonical).map(([role, body]) => [role, createHumanBody(body.skeleton, body.profile)]));
  const resolve = (role: GestureRole, chain: IAutoMovieMotionHumanChain): HumanPerformance => new HumanPerformance({
    seed: `the-round/020/${role}/gesture`,
    performers: [{ subject: role, body: bodies[role]!, at: { x: 0, y: 0, z: 0 }, yaw: 0, proficiency: { level: "trained" } }],
    cues: { screen: [{ name: "cue", seconds: cueSecond }] },
    composition: chain.node,
  });
  const guards = (["owen", "marek"] as const).map((role) => {
    const performance = resolve(role, HumanChain.subject(role).guard({ seconds: 1.1 }));
    return { role, goals: handGoals(performance.bones(role, .91), 0).goals };
  });
  const definitions = [
    { role: "jo", kind: "clap", at: roundClock.joClaps, hold: 0, oneHand: false },
    { role: "ed", kind: "clap", at: roundClock.edClaps, hold: 0, oneHand: false },
    { role: "pavel", kind: "clap", at: [roundClock.pavelClap], hold: 0, oneHand: false },
    { role: "maya", kind: "clap", at: roundClock.mayaClaps, hold: 0, oneHand: false },
    { role: "ruth", kind: "clap", at: roundClock.ruthClaps, hold: 0, oneHand: false },
    { role: "daniel", kind: "stopPalm", at: [37.81], hold: .37, oneHand: true },
    { role: "ed", kind: "cheer", at: [171.54], hold: 1.55, oneHand: false },
    { role: "jo", kind: "cheer", at: [171.54], hold: 1.55, oneHand: false },
    { role: "pavel", kind: "wave", at: [78.38], hold: .49, oneHand: true },
    { role: "pavel", kind: "wave", at: [177.60], hold: 2.38, oneHand: true },
  ] as const;
  const gestures = definitions.map((definition) => {
    const isClap = definition.kind === "clap";
    const chain = HumanChain.subject(definition.role)
      .gesture({ kind: definition.kind, side: "right", count: 1, hold: definition.hold })
      .sync({ of: "screen", event: "cue", align: isClap ? "strokeStart" : "strokeEnd" });
    const performance = resolve(definition.role, chain);
    const window = performance.schedule.entries[0];
    if (!window) throw Error(`Native ${definition.role} ${definition.kind} has no scheduled gesture.`);
    return { ...definition, performance, window, centre: cueSecond + (isClap ? nativeClapMidpoint : 0) };
  });

  return (people, seconds) => {
    const guardWeight = Math.min(1, Math.max(0, (seconds - 2.62) / .48), Math.max(0, (149.60 - seconds) / .50));
    for (const { role, goals } of guards) {
      const p = people[role];
      p.nativeHands = goals;
      const release = p.guardRelease ?? [0, 0];
      p.nativeHandWeights = [(1 - release[0]) * guardWeight, (1 - release[1]) * guardWeight];
    }
    for (const { role, kind, at, performance, window, oneHand, centre } of gestures) {
      let moment: number | undefined;
      for (const cue of at) {
        const localSeconds = seconds - cue + centre;
        if (localSeconds < window.start || localSeconds > window.end) continue;
        if (moment === undefined || Math.abs(seconds - cue) < Math.abs(seconds - moment)) moment = cue;
      }
      if (moment === undefined) continue;
      const p = people[role];
      const endingClap = kind === "clap" && moment >= 178.5;
      const clearance = endingClap ? .20 : kind === "clap" ? .07 : kind === "wave" ? moment < 100 ? .23 : .13 : 0;
      const { goals, leftSide } = handGoals(performance.bones(role, seconds - moment + centre), clearance);
      if (kind === "clap") p.clap = 0;
      p.nativeHands = [
        oneHand && leftSide === 0 ? undefined : goals[0],
        oneHand && leftSide === 1 ? undefined : goals[1],
      ];
    }
  };
}
