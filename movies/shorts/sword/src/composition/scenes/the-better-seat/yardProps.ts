import * as THREE from "three";

import type { ActorPose, CastActor } from "../../shared/castActor";
import { oval, stageSword } from "./yard";

/** Map a stage mark to an effector target, preserving the performer's costume scale. */
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

/** Smooth a performance transition into a held endpoint on the film clock. */
export function cue(seconds: number, first: number, last: number): number {
  const portion: number = THREE.MathUtils.clamp(
    (seconds - first) / (last - first),
    0,
    1,
  );
  return portion * portion * (3 - 2 * portion);
}

/** Build a local head overlay for voiced performance and the laugh. */
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

/** Opening thumb and ending fingertips share the physical hole in the split seat. */
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

/** Animate the two closed, nonfunctional screen props and their bench set-downs. */
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
