import { AutoMovieHumanCanonicalBody } from "@automovie/human";
import type {
  AutoMovieHumanoidBone,
  IAutoMovieHumanParameters,
  IAutoMovieMotionHumanBody,
  IAutoMoviePose,
  IAutoMovieResolvedBone,
  IAutoMovieVector3,
} from "@automovie/interface";
import { createHumanBody, HumanPerformance, poseBones } from "@automovie/motions";
import { Quaternion, Vector3 } from "three";

import { wardrobeBody as wardrobeParameters } from "./wardrobeBody";

/** Bridge installed performance samples to the production's visible figures. */
export namespace nativeStageMotion {
  /** A stage-space vector in metres, with +Z forward and +Y up. */
  export type Point = [number, number, number];

  /** One admitted performance sample and the corresponding wardrobe rig targets. */
  export interface Sample {
    pose: IAutoMoviePose;
    bones: ReadonlyMap<AutoMovieHumanoidBone, IAutoMovieResolvedBone>;
    points: ReadonlyMap<AutoMovieHumanoidBone, Point>;
    leftFoot: Point;
    rightFoot: Point;
    leftHand: Point;
    rightHand: Point;
    position: IAutoMovieVector3;
    headingRadians: number;
  }

  /** Body producer whose proportions match the polygon wardrobe for this scale. */
  export function wardrobeBody(heightMetres: number, massKg?: number): IAutoMovieMotionHumanBody {
    if (!Number.isFinite(heightMetres) || heightMetres <= 0)
      throw new Error("Provide the standing wardrobe height in metres.");
    const scale: number = heightMetres * 1000 / wardrobeParameters.body!.anatomy!.stature!;
    const resize = <T>(measurements: T): T =>
      JSON.parse(
        JSON.stringify(measurements, (key: string, value: unknown): unknown =>
          typeof value === "number" && key !== "cephalicIndex" && key !== "bodyFatPercentage"
            ? value * scale
            : value,
        ),
      ) as T;
    const parameters: IAutoMovieHumanParameters = {
      ...wardrobeParameters,
      body: resize(wardrobeParameters.body),
      head: resize(wardrobeParameters.head),
      extremities: resize(wardrobeParameters.extremities),
    };
    const prepared = AutoMovieHumanCanonicalBody.prepare(parameters, {
      id: `Savoy wardrobe ${heightMetres}m`,
      mass: massKg ?? 72 * scale ** 3,
    });
    return createHumanBody(prepared.skeleton, prepared.profile);
  }

  /** Compile the SDK's composition once and expose its native floor-frame pose. */
  export function compile(input: ConstructorParameters<typeof HumanPerformance>[0]): {
    performance: HumanPerformance;
    sample(subject: string, seconds: number): Sample;
  } {
    const performance = new HumanPerformance(input);
    const people = new Map(performance.performers.map((person) => [person.subject, person]));
    return {
      performance,
      sample(subject: string, seconds: number): Sample {
        const person = people.get(subject);
        if (person === undefined) throw new Error(`Unknown performer ${subject}.`);
        const pose: IAutoMoviePose = performance.pose(subject, seconds);
        const position: IAutoMovieVector3 = pose.root?.translation ?? person.at;
        const rotation = pose.root?.rotation;
        const facing = new Vector3(0, 0, 1);
        if (rotation !== undefined)
          facing.applyQuaternion(new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w));
        const headingRadians: number = rotation === undefined
          ? (person.yaw ?? 0) * Math.PI / 180
          : Math.atan2(facing.x, facing.z);
        const forward = Math.cos(headingRadians);
        const side = Math.sin(headingRadians);
        const bones = poseBones(person.body, pose);
        const points = new Map<AutoMovieHumanoidBone, Point>();
        for (const [bone, resolved] of bones) {
          const world = resolved.worldPosition;
          const x = world.x - position.x;
          const z = world.z - position.z;
          points.set(bone, [forward * x - side * z, world.y - person.at.y, side * x + forward * z]);
        }
        const endpoint = (bone: AutoMovieHumanoidBone): Point => {
          const point = points.get(bone);
          if (point === undefined) throw new Error(`Performer ${subject} has no ${bone}.`);
          return point;
        };
        return {
          pose,
          bones,
          points,
          position,
          headingRadians,
          leftFoot: endpoint("leftFoot"),
          rightFoot: endpoint("rightFoot"),
          leftHand: endpoint("leftHand"),
          rightHand: endpoint("rightHand"),
        };
      },
    };
  }
}
