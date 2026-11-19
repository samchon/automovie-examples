import { AutoMovieComposition } from "@automovie/engine";
import type { IAutoMovieMotionHumanBody } from "@automovie/interface";
import { HumanChain } from "@automovie/motions";

import { nativeStageMotion } from "../../../shared/nativeStageMotion";
import { blocking, type Role } from "./blocking";
import { stump } from "./road";

type RoadCue = "alix-wave" | "caller-point" | "perrin-signal" | "red-stump";

/**
 * Compile the cast's native walking, bread-carry and gesture tracks once for the road scene.
 * Cast heights are metres. The returned samplers accept local action seconds and
 * expose the shared stage sampler's root-relative joint positions in metres.
 * Scene posing owns the shoulder sack, loose shoe and shared sack contacts.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment distinguishes cast height and action clock units and names which contacts the scene still stages.
 * @evidence contracts/development/implementation.md#principled-implementation Compile walking, two-handed carry, wave, point and finger contact as admitted HumanChain nodes in one parallel composition. Red Cap's native touch uses the authored world position and facing of his stance at the stump.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Keep the native graph and its shared FK sample shape here. The scene chooses when native joints drive the actor and places the props it owns.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The profiles, action clock offsets chosen by the caller, bread load and contact target are production settings. The native compiler resolves actions, while the shipped carry surface supplies no shoulder strap, shoe dressing or shared deforming sack channel.
 * @evidence contracts/development/implementation.md#efficient-algorithms Setup grows with the actor and cue counts plus the native planner's work for those action durations. Each request samples one compiled subject rather than rebuilding parallel tracks.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Equivalent calls within one scene share the tracks compiled from its heights, cue bases and authored destinations. A new scene compiles from its own inputs and no cross-scene cache is used.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned samplers keep the finite compiled performance and canonical body descriptions alive for the scene lifetime. They close over no renderer, OS handle or running task.
 * @evidence contracts/development/composition.md#screenplay-realization Supplies the walking, initial wave, caller's point, Perrin's signal, reachable wood touch and final loaded carry for the authored stage.
 * @evidence contracts/development/composition.md#composition-only Compose installed HumanChain actions in one native parallel plan using one seed. Its relative action times enter the scene through the stage sampler and the caller owns the absolute time mapping.
 * @evidence contracts/development/composition.md#living-scene The performances provide moving joints through traversal and carry and supply the wave, point and reach layers. The scene places the changing contacts and camera without asking the gait to support the wrong prop.
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
