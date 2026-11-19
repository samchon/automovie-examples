import { HumanEnsemble } from "@automovie/motions";

import { nativeStageMotion } from "../../../shared/nativeStageMotion";
import type { courtyard } from "./yard";

/**
 * Compile the household's head reactions and return a film-second sampler.
 * Each witness retains its original position. Before the first report its
 * head keeps the supplied starting yaw in radians.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Build an admitted group from its actual starting transforms. The native head chains turn toward world marks for the report, score and return.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The group owns reactions and copies their solved rotations into the heads provided by the yard set. It leaves principal actors to their own tracks.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The group size comes from the caller. The seed, starting heading and reaction targets come from the approved yard staging.
 * @evidence contracts/development/implementation.md#efficient-algorithms Setup builds one plan per witness with the same three targets. Each seek visits the witness list once and reads one head transform per member from its plan.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse the compiled native ensemble for seeks with the same witnesses and starting marks. Calls depend on their film time.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned callback holds the witness list, subject ids and their SDK performance. Its population is the witness count fixed at setup and lifetime belongs to the scene.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states what moves, what stays, starting yaw units and the input clock.
 * @evidence contracts/development/composition.md#screenplay-realization The household witnesses the circle, the deciding ground mark and the return to the bench.
 * @evidence contracts/development/composition.md#composition-only The helper combines the installed HumanEnsemble member and chain capabilities and applies the screenplay's reaction times.
 * @evidence contracts/development/composition.md#living-scene Each person keeps their own starting facing and then shares the three attention targets through native head rotation.
 */
export function yardWitnesses(witnesses: ReturnType<typeof courtyard>): (seconds: number) => void {
  const seed = "yard/household";
  const group = HumanEnsemble.of({
    id: "household",
    seed,
    count: witnesses.length,
    bodies: [nativeStageMotion.wardrobeBody(1.64)],
    places: witnesses.map(({start, yaw}) => ({
      at: { x: start.x, y: start.y, z: start.z },
      yaw: yaw * 180 / Math.PI,
    })),
  });
  const composition = HumanEnsemble.chains(group, (_member, chain) =>
    chain
      .look({
        target: { kind: "point", at: { x: -.07, y: 1.48, z: .22 }, frame: "world" },
        with: "head", cue: "signal", seconds: 15.85,
      })
      .look({
        target: { kind: "point", at: { x: 1.690, y: .074, z: .094 }, frame: "world" },
        with: "head", cue: "seen", seconds: 7.25,
      })
      .look({
        target: { kind: "point", at: { x: -1.96, y: 1.05, z: .575 }, frame: "world" },
        with: "head", cue: "seen", seconds: 20.25,
      }),
  );
  const {performance} = nativeStageMotion.compile({
    seed, composition, performers: HumanEnsemble.performers(group),
  });
  const subjectIds: readonly string[] = HumanEnsemble.members(group).map(member => member.subject);
  return (seconds: number): void => {
    for (const [index, witness] of witnesses.entries()) {
      if (seconds < 16.65) {
        witness.head.rotation.set(0, witness.yaw, 0);
        continue;
      }
      const view = performance.bones(subjectIds[index]!, seconds - 16.65).get("head")!.worldRotation;
      witness.head.quaternion.set(view.x, view.y, view.z, view.w);
    }
  };
}
