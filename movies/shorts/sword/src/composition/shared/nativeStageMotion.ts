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

/**
 * Bridge an installed performance to wardrobe geometry, keeping clock admission
 * and native pose ownership in the SDK and visible attachment targets in the scene.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The namespace relates a native motion body, per-performer samples, coordinate conversion and a single admitted film-layer sampler.
 * @evidence contracts/development/design.md#principled-representation The SDK supplies the body and world-pose contracts. The adapter's fixed local tuples and sample structure retain required endpoints and explicit frame conventions.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Several films share the wardrobe scale, compilation, stage points and native rotations. Motion admission remains behind the installed performance API.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts The bridge exposes the installed performance and shared geometric mapping. Film-specific grip, posture and timeline decisions remain outside the namespace.
 */
export namespace nativeStageMotion {
  /**
   * A three-coordinate point in actor-relative metres. X and Z are centered on
   * the sampled root and undo its heading. Y measures up from the starting floor.
   *
   * @evidence contracts/development/design.md#principled-representation The fixed tuple enforces coordinate count and order. The bridge uses the sample's root and actor-facing axes, and each performer starts on a known floor.
   * @evidence contracts/development/design.md#minimal-and-owned-surface The bridge owns this coordinate conversion. Scene and wardrobe consumers use the same tuple for their joint targets.
   * @evidence contracts/development/design.md#prohibited-design-shortcuts The point is one shape for every bone and actor. The SDK supplies admitted finite pose coordinates, and the tuple does not validate finiteness on its own.
   * @evidence contracts/development/common.md#meaningful-documentation The comment gives units, axes and the distinct horizontal and vertical origins.
   */
  export type Point = [number, number, number];

  /**
   * One admitted performance sample and its wardrobe targets at the same second.
   * World transforms remain available for native pose and gaze consumers.
   *
   * @evidence contracts/development/design.md#principled-representation The installed SDK owns pose and bone types. Required endpoints accompany the maps and heading. A missing performer or required endpoint is rejected by the producer.
   * @evidence contracts/development/design.md#minimal-and-owned-surface Wardrobe consumes joint targets, scenes use placement and facing, and gaze uses the native head rotation. Foot and hand members expose the frequently read endpoints.
   * @evidence contracts/development/design.md#prohibited-design-shortcuts Required members describe one complete sample shared across films. Read-only maps preserve their actual bone keys and the SDK transform types carry no substitute placeholders.
   * @evidence contracts/development/common.md#meaningful-documentation The comment and members define the shared sample time and name the two coordinate frames and heading units.
   */
  export interface Sample {
    /** SDK pose sampled at the requested performance second. */
    pose: IAutoMoviePose;

    /** Installed resolved joint transforms, including world position and rotation. */
    bones: ReadonlyMap<AutoMovieHumanoidBone, IAutoMovieResolvedBone>;

    /** Joint positions with heading and root placement accounted for. */
    points: ReadonlyMap<AutoMovieHumanoidBone, Point>;

    /** Left foot endpoint in the point frame. */
    leftFoot: Point;

    /** Right foot endpoint in the point frame. */
    rightFoot: Point;

    /** Left hand endpoint in the point frame. */
    leftHand: Point;

    /** Right hand endpoint in the point frame. */
    rightHand: Point;

    /** Native root translation in world metres, with starting placement as fallback. */
    position: IAutoMovieVector3;

    /** Heading in radians from stage +Z toward +X. */
    headingRadians: number;
  }

  /**
   * Prepare a native motion body at the polygon wardrobe stature in metres.
   * An optional mass is in kilograms. By default the reference mass scales with
   * volume. Reject nonpositive or nonfinite stature before preparing the body.
   *
   * @evidence contracts/development/implementation.md#principled-implementation Scale lengths from the canonical wardrobe's millimetres and preserve body-fat percentage and cephalic index. Use the SDK body and skeleton producers on those inputs.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure The adapter prepares an SDK body on the same measurements as the actor appearance. Each film supplies its cast stature and optional mass.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The millimetre conversion follows the parameter units. Cubic mass scaling preserves the reference density. Ratio controls keep their supplied values.
   * @evidence contracts/development/implementation.md#efficient-algorithms Traverse the three fixed measurement trees once for scaling. Canonical body preparation and geometry-derived skeleton construction dominate the work.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Use one wardrobe reference for all actors. Create independent native body instances for the requested height and mass without a cross-scene cache.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller owns the returned native body. The adapter allocates temporary parameter trees and retains only the imported reference for future calls.
   * @evidence contracts/development/common.md#meaningful-documentation The comment describes stature and mass units, scaling default, returned native body and invalid stature behavior.
   */
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

  /**
   * Compile the supplied performance once and sample a named actor in seconds.
   * The installed performance owns admission and the valid clock. Sampling
   * rejects an unknown actor or a missing required hand or foot joint.
   *
   * @evidence contracts/development/implementation.md#principled-implementation Resolve world bones through the SDK then subtract horizontal root translation and rotate by inverse heading. Vertical coordinates reference the actor's ground placement so pelvis and boot height survive conversion.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure The installed performance owns composition and resolution. The bridge builds a subject lookup and converts its pose for the wardrobe consumer.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Heading derives from native root rotation or the admitted starting yaw. Position uses native translation or initial world placement. SDK failure and missing endpoints propagate.
   * @evidence contracts/development/implementation.md#efficient-algorithms Setup builds one lookup from the cast after SDK compilation. Each sample resolves only the requested actor and traverses that actor's bones once for the point map.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work All seeks for this compilation share one admitted performance and lookup. A new call uses its own input and sampler rather than sharing across performances.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned sampler retains one native performance and a map bounded by its performers. Per-sample objects belong to the caller. Dropping the sampler releases adapter references.
   * @evidence contracts/development/common.md#meaningful-documentation The comment states the input ownership, time units, sample coordinate conversion and failure cases. The return members identify the two consumer paths.
   */
  export function compile(input: ConstructorParameters<typeof HumanPerformance>[0]): {
    /** Original admitted SDK performance for its duration, pose and bones. */
    performance: HumanPerformance;

    /** Read the named performer at this native performance second. */
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
