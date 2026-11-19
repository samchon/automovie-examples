import { HumanEnsemble } from "@automovie/motions";

import { nativeStageMotion } from "../../shared/nativeStageMotion";
import type { courtyard } from "./yard";

/** Turn the grounded household group toward the report, boot and returning men. */
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
