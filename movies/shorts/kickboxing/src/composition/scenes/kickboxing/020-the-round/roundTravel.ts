import { createHumanBody, HumanChain, HumanPerformance } from "@automovie/motions";
import type { AutoMovieHumanoidBone, IAutoMovieHumanCanonicalBody, IAutoMovieVector3 } from "@automovie/interface";

import type { ActorPose } from "../../../../entities/cast/roundCast/ActorPose";
import type { Role } from "../../../../entities/cast/roundCast/Role";
import { roundFloor } from "../../../../shared/roundFloor";

const { apronHeight: APRON_HEIGHT } = roundFloor;

const floor = (x: number, y: number, z: number): IAutoMovieVector3 => ({ x, y, z });
const degrees = Math.PI / 180;
const smooth = (value: number): number => value * value * (3 - 2 * value);

/**
 * Resolves the neutral-corner crossing and the northern aisle approach from installed walk actions. The supplied bodies are the ones mounted in the shot. The application closure samples native world joint positions at programme seconds.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the two actual authored paths, use of the mounted cast bodies and programme/world units.
 * @evidence contracts/development/implementation.md#principled-implementation The motion vocabulary plans footprints and support through HumanPerformance. Its actual schedule stays inside each screenplay window and its resolved ankles and knees drive the corresponding displayed joint pairs.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The prepared paths own movement planning. The returned closure only finds the current path, reads its pose and hands world goals to the puppet adapter.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No authored joint keys replace the native walk inside the active interval. A planner run past the available dialogue or story window refuses setup. The small join blend only hands between the mounted puppet and the native interval.
 * @evidence contracts/development/implementation.md#efficient-algorithms Setup resolves two bounded actions once. Each frame scans the two intervals and reads only the active native performer, performing no per-frame planning.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Every seek retains the same body-identified native plans and asks the installed performance for the actual local clock pose.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The film scene owns the closure with two planned bodies, paths and native performance references. It opens no I/O and releases them with scene disposal.
 * @evidence contracts/development/composition.md#screenplay-realization Runs Owen's neutral-corner crossing and Pavel's post-bell north-aisle path in their authored beat intervals.
 * @evidence contracts/development/composition.md#composition-only Combines mounted canonical bodies with installed Human walks. Local endpoint coordinates and blend windows hand the native result to the puppet.
 * @evidence contracts/development/composition.md#living-scene The two paths continue through each interval and reach the landmarks needed for the count and the final greeting.
 */
export function roundTravel(
  bodies: Record<"owen" | "pavel", IAutoMovieHumanCanonicalBody.IBody>,
): (people: Record<Role, ActorPose>, seconds: number) => void {
  const walks = [
    { role: "owen", from: 151.58, deadline: 156.30, fromPoint: floor(-.92, 0, -1.23), to: floor(2.51, 0, 2.56), yaw: 44, face: -135, pace: "fast" },
    { role: "pavel", from: 172.55, deadline: 176.40, fromPoint: floor(.27, -APRON_HEIGHT, -3.63), to: floor(-1.44, -APRON_HEIGHT, -3.60), yaw: -88, face: 4, pace: "slow" },
  ] as const;
  const plans = walks.map((walk) => {
    const body = bodies[walk.role];
    const performance = new HumanPerformance({
      seed: `the-round/020/${walk.role}/walk`,
      performers: [{ subject: walk.role, body: createHumanBody(body.skeleton, body.profile), at: walk.fromPoint, yaw: walk.yaw, proficiency: { level: "trained" } }],
      composition: HumanChain.subject(walk.role).walk({ to: walk.to, face: walk.face, pace: walk.pace }).node,
    });
    const end = walk.from + performance.duration;
    if (end > walk.deadline) throw Error(`Native ${walk.role} walk reaches ${end}, after the screenplay deadline ${walk.deadline}.`);
    return { walk, performance, end };
  });

  return (people, seconds) => {
    for (const { walk, performance, end } of plans) {
      if (seconds < walk.from || seconds > walk.deadline) continue;
      const local = Math.min(performance.duration, seconds - walk.from);
      const pose = performance.pose(walk.role, local);
      if (pose.root === null) throw Error(`Native ${walk.role} walk has no world transform.`);
      const bones = performance.bones(walk.role, local);
      const point = (name: AutoMovieHumanoidBone): [number, number, number] => {
        const position = bones.get(name)?.worldPosition;
        if (!position) throw Error(`Native walking pose is missing ${name}.`);
        return [position.x, position.y, position.z];
      };
      const p = people[walk.role];
      const joinIn = smooth(Math.min(1, local / .12));
      const joinOut = 1 - smooth(Math.max(0, Math.min(1, (seconds - end) / (walk.deadline - end))));
      const weight = Math.min(joinIn, joinOut);
      const blend = (first: number, last: number): number => first + (last - first) * weight;
      const { translation, rotation } = pose.root;
      p.x = blend(p.x, translation.x);
      p.z = blend(p.z, translation.z);
      const heading = Math.atan2(2 * (rotation.w * rotation.y + rotation.x * rotation.z), 1 - 2 * (rotation.y ** 2 + rotation.x ** 2));
      p.yaw += Math.atan2(Math.sin(heading - p.yaw), Math.cos(heading - p.yaw)) * weight;
      const flexion = (bone: AutoMovieHumanoidBone): number => (pose.joints.find((joint) => joint.bone === bone)?.flexion ?? 0) * degrees;
      p.arms = [blend(p.arms[0], flexion("leftUpperArm")), blend(p.arms[1], flexion("rightUpperArm"))];
      p.elbow = [blend(p.elbow[0], flexion("leftLowerArm")), blend(p.elbow[1], flexion("rightLowerArm"))];
      if (weight > 0) p.nativeTravel = {
        weight,
        pelvis: point("hips")[1],
        knees: [point("leftLowerLeg"), point("rightLowerLeg")],
        ankles: [point("leftFoot"), point("rightFoot")],
      };
    }
  };
}
