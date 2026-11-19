import * as THREE from "three";

import type { ActorPose, CastActor } from "../../../shared/castActor";
import { stageSword } from "./yard";
import { oval } from "./yardPrimitives";

/**
 * Convert a world mark in metres to the actor's local ground frame.
 * The wardrobe actor has a yaw rotation and nonzero root scale.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Undo translation, yaw and scale in transform order. This uses the wardrobe root convention from the actor's ground placement.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Keep the stage-to-wardrobe conversion with the prop support layer. The scene chooses marks and the actor owns limb posing.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The inverse uses the root's actual scale, including costume width, and has the same semantics for each actor with the supported root transform.
 * @evidence contracts/development/implementation.md#efficient-algorithms The transform uses a fixed number of vector operations and one output point.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse the caller's root transform as input without mutating it. A changed root or mark is evaluated afresh.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Retain no input or output references. The caller owns the point tuple.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states world and local units, the yaw assumption and scale precondition.
 * @evidence contracts/development/composition.md#screenplay-realization Translate authored hand, boot and set-down marks so scene contacts meet their targets.
 * @evidence contracts/development/composition.md#composition-only This helper converts frames and owns no timeline. The stage selects where a pose uses its result.
 * @evidence contracts/development/composition.md#living-scene Carry pins move with their scene references while the actor changes roots.
 */
export function actorTarget(
  actor: CastActor,
  world: THREE.Vector3,
): [number, number, number] {
  return world
    .clone()
    .sub(actor.root.position)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), -actor.root.rotation.y)
    .divide(actor.root.scale)
    .toArray();
}

/**
 * Interpolate a dimensionless weight from zero to one on an ordered interval.
 * All three inputs use the same film seconds, and `last` must exceed `first`.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Clamp normalized time and apply cubic smoothstep, with zero slope at each endpoint.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Expose one cue weight for other prop functions to apply to placement or overlays.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The polynomial supplies bounded ease from the provided cue times. Each effect's endpoints come from its scene track.
 * @evidence contracts/development/implementation.md#efficient-algorithms One normalization, clamp and polynomial use constant time and space.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The cue is pure for its three numeric inputs, so callers can compute the same weight with no retained state.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources This operation holds no objects, handles or tasks.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states the weight bounds, seconds and strict ordering requirement.
 * @evidence contracts/development/composition.md#screenplay-realization Ease the authored raises and releases without changing the beats' order.
 * @evidence contracts/development/composition.md#composition-only This helper computes a weight. Its callers own absolute cue times.
 * @evidence contracts/development/composition.md#living-scene The saturated weight keeps an object in its held state until its next cue.
 */
export function cue(seconds: number, first: number, last: number): number {
  const portion: number = THREE.MathUtils.clamp(
    (seconds - first) / (last - first),
    0,
    1,
  );
  return portion * portion * (3 - 2 * portion);
}

/**
 * Attach a stylized mouth overlay to the actor's moving head.
 * Stature is in metres. The returned setter uses dimensionless open and
 * smile amounts from the scene's authored speech and laugh cues.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Scale the overlay from the reference stature and move and scale it in the head frame. The visible form follows authored amounts rather than estimated phonemes.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The cue owner sets the amounts. The overlay controls its geometry and visibility and inherits head movement.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The bearded placement offsets the overlay for its costume. Opening and smile shapes are art controls, with no audio analysis in this function.
 * @evidence contracts/development/implementation.md#efficient-algorithms Setup adds one oval. A sample mutates only its transform and visibility.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The returned setter reuses the same overlay on every sample for this actor.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller owns the actor scene node and its overlay. The callback retains that one mesh.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states metres, dimensionless channels, head attachment and cue provenance.
 * @evidence contracts/development/composition.md#screenplay-realization The overlay gives the principal speeches and the closing laugh a visible change.
 * @evidence contracts/development/composition.md#composition-only Authored cue envelopes live in the yard timeline. The mouth capability applies each sampled amount.
 * @evidence contracts/development/composition.md#living-scene The overlay moves with its speaker and follows the film's speech and laugh cues.
 */
export function mouth(
  actor: CastActor,
  height: number,
  bearded = false,
): (open: number, happy?: number) => void {
  const scale: number = height / 1.75581;
  const lips = oval(
    actor.head,
    0x42291f,
    0,
    -0.102 * scale,
    (bearded ? 0.147 : 0.122) * scale,
    1,
    1,
    1,
  );
  return (open: number, happy = 0): void => {
    lips.scale.set(
      (0.02 + 0.017 * happy) * scale,
      (0.001 + 0.021 * open) * scale,
      0.004 * scale,
    );
    lips.position.y = (-0.102 - 0.01 * open) * scale;
    lips.visible = open > 0.05 || happy > 0.03;
  };
}

/**
 * Attach opening and closing finger overlays to the split saddle's opening.
 * The returned setter samples absolute film seconds in the saddle's local frame.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Use stage cue weights and bounded local oscillation for withdrawal and wave. The attached meshes track the tear as the saddle moves.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The seat mesh owns the local tear coordinates. The overlay supplies the gestures and the stage places the seat.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The timed opening and closing overlays are the accepted stylized insert. Static attachment coordinates are from the modeled split and the hand pose is a visible approximation.
 * @evidence contracts/development/implementation.md#efficient-algorithms A fixed set of finger meshes is built once. Each sample updates only two overlay nodes.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Both appearances reuse the split saddle as their unchanged local reference, and subsequent seeks reuse the overlays.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The saddle owns the attached groups. The returned setter retains only the overlays for that saddle.
 * @evidence contracts/development/common.md#meaningful-documentation The comment defines the attached frame, clock and two uses of the gesture.
 * @evidence contracts/development/composition.md#screenplay-realization The early thumb and final wave call attention to the same split across the minute.
 * @evidence contracts/development/composition.md#composition-only The setter is given scene time and applies two authored gesture intervals to local overlays.
 * @evidence contracts/development/composition.md#living-scene The tear and gesture stay together as the split saddle changes holders and leaves the courtyard.
 */
export function saddleFingers(saddle: THREE.Group): (seconds: number) => void {
  const thumb = oval(
    saddle,
    0xc39575,
    -0.052,
    0.018,
    0.14,
    0.016,
    0.019,
    0.073,
  );
  const fingers = new THREE.Group();
  fingers.position.set(-0.013, 0.02, 0.112);
  saddle.add(fingers);
  for (let finger = 0; finger < 3; ++finger)
    oval(
      fingers,
      0xbd9176,
      0.026 * (finger - 1),
      0.012 - Math.abs(finger - 1) * 0.007,
      0.043,
      0.01,
      0.014,
      0.089,
    );
  return (seconds: number): void => {
    const poke =
      0.44 + 0.56 * cue(seconds, 4.5, 6.02) - 0.98 * cue(seconds, 13.36, 14.15);
    thumb.position.z = 0.095 + 0.045 * poke;
    thumb.scale.z = 0.073 * Math.max(0.02, poke);
    thumb.visible = seconds < 14.16;
    const wave = cue(seconds, 55.05, 55.43) * (1 - cue(seconds, 57.12, 57.63));
    fingers.position.z = 0.019 + 0.098 * wave;
    fingers.rotation.x = wave * Math.sin((seconds - 55.05) * 11) * 0.48;
    fingers.rotation.z = wave * Math.sin((seconds - 55.05) * 11 - 0.7) * 0.35;
    fingers.visible = wave > 0.02;
  };
}

/**
 * Attach the two screen props to the scene and provide an authored placement sampler.
 * The outer callback writes pose targets in film seconds. Its returned callback
 * applies the sampled mesh placement after the actor pose update.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Interpolate authored world marks between visible hands and the bench. Split target calculation from mesh placement so the caller can pose actors in between.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The screen-prop helper owns the graphics and their contact cues. The scene owns actor roots, pose order and the meaning of each beat.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Contact and release cues are fixed authored stage effects for the accepted stylized picture. They describe prop placement, not a physical interaction model.
 * @evidence contracts/development/implementation.md#efficient-algorithms Setup creates two meshes, and each sample visits those same props and the two provided pose entries.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The scene keeps the two meshes and bench references for all seeks. Each sample computes its placement from the current roots and clock.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The supplied scene owns both added graphics. The outer closure keeps the fixed two meshes and reference marks. The inner callback retains one sample until it is applied.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states stage time, actor and mesh mutation order and ownership of the sampled effect.
 * @evidence contracts/development/composition.md#screenplay-realization Both reports and later bench set-downs use the same two continuing screen props.
 * @evidence contracts/development/composition.md#composition-only This helper schedules only prop placement and pose pins. The scene supplies the absolute time and actor states.
 * @evidence contracts/development/composition.md#living-scene Each prop follows its associated actor until the set-down, and it remains on its bench mark through later beats.
 */
export function stageSwordProps(
  scene: THREE.Scene,
): (
  seconds: number,
  martin: CastActor,
  carlo: CastActor,
  martinPose: ActorPose,
  carloPose: ActorPose,
) => () => void {
  const props = [stageSword(), stageSword()];
  const positiveY = new THREE.Vector3(0, 1, 0);
  const alongBench = new THREE.Vector3(-1, 0, 0);
  const lastGrip = [
    new THREE.Vector3(-1.07, 0.598, 0.711),
    new THREE.Vector3(-1.08, 0.598, 0.77),
  ];
  scene.add(...props);

  return (seconds, martin, carlo, martinPose, carloPose) => {
    const flash = (hit: number): number =>
      cue(seconds, hit - 0.36, hit) * (1 - cue(seconds, hit, hit + 0.32));
    const crossing = Math.max(flash(16.65), flash(26.22));
    const apparentContact = martin.root.position
      .clone()
      .lerp(carlo.root.position, 0.5)
      .add(new THREE.Vector3(0, 1.48, 0.36));

    const actors = [carlo, martin];
    const states = [carloPose, martinPose];
    const end = [41.54, 42.71];
    const grips = actors.map((actor, index) => {
      const state = states[index]!;
      const settle = cue(seconds, end[index]! - 0.62, end[index]!);
      const reach = 1 - cue(seconds, end[index]! + 0.04, end[index]! + 0.35);
      const hand = new THREE.Vector3(-0.207, 0.965 - (state.crouch ?? 0), 0.18)
        .applyAxisAngle(positiveY, actor.root.rotation.y)
        .add(actor.root.position);
      hand.lerp(
        apparentContact
          .clone()
          .add(new THREE.Vector3(index === 0 ? 0.27 : -0.28, -0.33, -0.02)),
        crossing,
      );
      const carriedGrip = hand.clone().lerp(lastGrip[index]!, settle);
      if (reach > 0)
        state.rightArm = actorTarget(
          actor,
          hand.clone().lerp(carriedGrip, reach),
        );
      return carriedGrip;
    });

    return (): void => {
      for (let index = 0; index < props.length; ++index) {
        const sword = props[index]!;
        const actor = actors[index]!;
        const grip = grips[index]!;
        const sign = index === 0 ? 1 : -1;
        const ready = cue(seconds, 14.38, 16.2);
        const standDown = cue(seconds, 28.9, 31.4);
        const repose = cue(seconds, end[index]! - 0.6, end[index]!);
        const direction = new THREE.Vector3(
          sign * (0.29 + standDown * 0.5),
          0.12 + ready * 0.72 - standDown * 1.28,
          -0.3,
        ).applyAxisAngle(positiveY, actor.root.rotation.y);
        direction.lerp(apparentContact.clone().sub(grip), crossing).normalize();
        direction.lerp(alongBench, repose).normalize();
        sword.position.copy(grip).addScaledVector(direction, 0.089);
        sword.quaternion.setFromUnitVectors(positiveY, direction);
      }
    };
  };
}
