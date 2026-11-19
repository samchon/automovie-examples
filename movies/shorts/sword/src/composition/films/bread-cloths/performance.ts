import { AutoMovieComposition } from "@automovie/engine";
import type { IAutoMovieMotionHumanBody } from "@automovie/interface";
import { HumanChain } from "@automovie/motions";

import { nativeStageMotion } from "../../shared/nativeStageMotion";
import { blocking, type Role } from "./blocking";
import { stump } from "./road";

type RoadCue = "alix-wave" | "caller-point" | "perrin-signal" | "red-stump";

/**
 * Admitted local gait and two-handed carry performances for the road actors.
 *
 * The road supplies world travel, facing and ground. These parallel native
 * performances supply the visible foot, knee and hand motion in that moving
 * frame. The attached shoulder sack, slipping shoe and two-person load keep
 * their staged contacts because the shipped carry does not admit shoulder
 * straps, shoe dressing, or a shared deforming sack.
 */
export function breadRoadPerformance(
  cast: Readonly<Record<Role, { height: number }>>,
): {
  walk(role: Role, phaseSeconds: number): nativeStageMotion.Sample;
  carry(role: Role, phaseSeconds: number): nativeStageMotion.Sample;
  cue(cue: RoadCue, seconds: number): nativeStageMotion.Sample;
} {
  const roles = Object.keys(cast) as Role[];
  const carriers: ReadonlySet<Role> = new Set(["alix", "perrin"]);
  const bodies = new Map<Role, IAutoMovieMotionHumanBody>(
    roles.map((role) => [role, nativeStageMotion.wardrobeBody(cast[role].height)]),
  );
  const floor = { x: 0, y: 0, z: 0 };
  const destination = { x: 0, y: 0, z: 84 };
  const walking = roles.map((role) =>
    HumanChain.subject(role).walk({ to: destination, pace: "slow" }, `${role}-road-walk`).node,
  );
  const carrying = roles.filter((role) => carriers.has(role)).map((role) =>
    HumanChain.subject(`${role}-bread`)
      .carry({ to: { x: 0, y: 0, z: 7 }, pace: "slow", how: "twoHands", load: 0.08 }, `${role}-carry-bread`)
      .node,
  );
  const performers = roles.flatMap((role) => {
    const body = bodies.get(role)!;
    const at = { body, at: floor, yaw: 0, proficiency: { level: "trained" as const } };
    return carriers.has(role)
      ? [{ subject: role, ...at }, { subject: `${role}-bread`, ...at }]
      : [{ subject: role, ...at }];
  });
  const brace = blocking("red", 31.42);
  const cues = [
    HumanChain.subject("alix-wave").gesture({ kind: "wave", side: "right", count: 1 }),
    HumanChain.subject("caller-point").gesture({
      kind: "point", side: "left", hold: 0.55,
      target: { kind: "point", frame: "performer", at: { x: 0.10, y: 1.18, z: 2.2 } },
    }),
    HumanChain.subject("perrin-signal").gesture({ kind: "wave", side: "left", count: 1 }),
    HumanChain.subject("red-stump").touch({
      target: {
        kind: "point", frame: "world",
        at: { x: stump.x + 0.17, y: 1.77, z: stump.z + 0.18 },
      },
      kind: "press", side: "left", with: "forefinger",
    }),
  ];
  const cuePeople = [
    { subject: "alix-wave", body: bodies.get("alix")!, at: floor },
    { subject: "caller-point", body: bodies.get("caller")!, at: floor },
    { subject: "perrin-signal", body: bodies.get("perrin")!, at: floor },
    { subject: "red-stump", body: bodies.get("red")!, at: { x: brace.position.x, y: brace.position.y, z: brace.position.z }, yaw: brace.yaw * 180 / Math.PI },
  ].map((person) => ({ ...person, yaw: person.yaw ?? 0, proficiency: { level: "trained" as const } }));
  const tracks = nativeStageMotion.compile({
    seed: "savoy-bread-cloths-road",
    performers: [...performers, ...cuePeople],
    composition: AutoMovieComposition.parallel(...walking, ...carrying, ...cues.map((chain) => chain.node)),
  });

  return {
    walk: (role, phaseSeconds) => tracks.sample(role, phaseSeconds),
    carry: (role, phaseSeconds) => tracks.sample(`${role}-bread`, phaseSeconds),
    cue: (cue, seconds) => tracks.sample(cue, seconds),
  };
}
