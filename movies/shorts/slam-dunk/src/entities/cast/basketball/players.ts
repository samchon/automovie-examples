import { createDrinkware } from "@automovie/archetypes";
import { AutoMovieHumanCanonicalBody } from "@automovie/human";
import type { IAutoMoviePose } from "@automovie/interface";
import { HUMANOID_GAITS } from "@automovie/motions";
import { buildModel } from "@automovie/render";
import * as THREE from "three";

import { courtHoop } from "../../sets/shohoku-gym/courtHoop";
import { playerRig } from "./playerRig";

type Point = [number, number, number];
type Placement = {
  x: number;
  z: number;
  y: number;
  yaw: number;
  action: string;
  phase: number;
  seated?: boolean;
  hand?: "left" | "right" | "both";
  target?: Point;
};
type Rig = ReturnType<typeof playerRig>;
type CastPose = { weight: number; poses: Readonly<Partial<Record<string, IAutoMoviePose>>> };
type PoseFrame = { players: Readonly<Record<string, Placement>>; ball: Point; play: number };
type PoseTransition = { from: number; to: number; earlier: PoseFrame; later: PoseFrame; actors?: readonly string[]; seats?: boolean };
const ids = [
  "w7",
  "w11",
  "w14",
  "w4",
  "w10",
  "b4",
  "b5",
  "b7",
  "b8",
  "b9",
  "ref",
  "ref2",
];
const tau = Math.PI * 2;
const v = (x = 0, y = 0, z = 0): THREE.Vector3 => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp;
const seatDepth = 8.56;
const seatApproach = 8.02;
const worldOrigin = (rig: Rig, name: string): THREE.Vector3 =>
  rig.bones.get(name)!.getWorldPosition(v());

/** Give a gesture distinct approach, reading time and settling phases. */
function pulse(second: number, start: number, hold: number, release: number, end: number): number {
  return THREE.MathUtils.smoothstep(second, start, hold) * (1 - THREE.MathUtils.smoothstep(second, release, end));
}

/** The bottle reaches the mouth before the player moves along the bench. */
function sip(second: number): number {
  return pulse(second, 79.82, 80.55, 81.22, 82.02);
}

/** Rotate the bone towards a world-space target using its own neutral child offset; this also follows trunk lean and actor yaw. */
function aim(
  rig: Rig,
  boneName: string,
  childName: string,
  target: THREE.Vector3,
): void {
  const bone = rig.bones.get(boneName)!;
  const parent = bone.parent!;
  const desired = parent
    .worldToLocal(target.clone())
    .sub(bone.position)
    .normalize();
  const restDirection = rig.rest
    .get(childName)!
    .clone()
    .sub(rig.rest.get(boneName)!)
    .normalize();
  bone.quaternion.setFromUnitVectors(restDirection, desired);
}

/** Solve elbow or knee position from the two bone lengths, nearest reachable effector and a visible bend direction. */
function limb(
  rig: Rig,
  start: string,
  middle: string,
  end: string,
  goal: THREE.Vector3,
  pole: THREE.Vector3,
): void {
  const pivot = worldOrigin(rig, start);
  const first = rig.rest.get(start)!.distanceTo(rig.rest.get(middle)!);
  const second = rig.rest.get(middle)!.distanceTo(rig.rest.get(end)!);
  const direction = goal.clone().sub(pivot);
  const distance = clamp(
    direction.length(),
    Math.abs(first - second) + 0.001,
    first + second - 0.0003,
  );
  direction.normalize();
  const bend = pole.sub(pivot);
  bend.addScaledVector(direction, -bend.dot(direction)).normalize();
  const along =
    (first * first - second * second + distance * distance) / (2 * distance);
  const hinge = pivot
    .clone()
    .addScaledVector(direction, along)
    .addScaledVector(
      bend,
      Math.sqrt(Math.max(0, first * first - along * along)),
    );
  aim(rig, start, middle, hinge);
  aim(rig, middle, end, pivot.clone().addScaledVector(direction, distance));
}

/** Pose the roster once for the current television source second, including ball reach after a planted stance. */
function place(
  rig: Rig,
  id: string,
  p: Placement,
  ball: Point,
  seconds: number,
): void {
  const h = rig.height / 1.82;
  const action = p.action;
  const seated = p.seated || action === "sit";
  const running = action === "run",
    dribble = action === "dribble";
  const defending =
    action === "guard" || action === "screen" || action === "boxout";
  const gait = HUMANOID_GAITS.run;
  const beat = p.phase * tau;
  const swing = Math.sin(beat);
  const crouch = defending
      ? 0.12 * h
      : dribble
        ? 0.095 * h
        : running
          ? 0.066 * h
          : 0.035 * h;
  const bob = seated
    ? 0
    : running
      ? Math.cos(beat * 2) * 0.023
      : dribble
        ? 0.011 * Math.cos(beat)
        : 0.004 * Math.sin(seconds * 2 + id.charCodeAt(0));
  const towardSeat = !seated && id.startsWith("w") && seconds >= 76.9 && seconds < 80.24;
  const depth = towardSeat ? Math.min(p.z, seatApproach) : seated ? Math.min(p.z, seatDepth) : p.z;
  rig.root.position.set(p.x, p.y, depth);
  rig.root.rotation.set(0, p.yaw, 0);
  const hips = rig.bones.get("hips")!,
    spine = rig.bones.get("spine")!;
  hips.position.y = seated ? .63 + (h - 1) * .08 : rig.rest.get("hips")!.y - crouch + bob;
  const lowClap = id === "b4" && action === "slap" && seconds >= 100
    ? pulse(seconds, 104, 105.25, 106.25, 108.59)
    : 0;
  hips.position.y -= lowClap * .08 * h;
  const backBend = THREE.MathUtils.lerp(running
      ? 0.18
      : dribble
        ? 0.19
        : seated
          ? 0.13
          : defending
            ? 0.12
            : 0.035, .32, lowClap);
  spine.rotation.set(backBend, 0, 0);
  const head = rig.bones.get("head")!;
  head.rotation.set(-backBend * 0.63, 0, 0);
  const localBall = rig.root.worldToLocal(v(...ball));
  if (!seated) {
    head.rotation.y =
      clamp(Math.atan2(localBall.x, localBall.z), -0.55, 0.55) * 0.63;
    head.rotation.x -= clamp(
      (localBall.y - rig.height * 0.9) * 0.12,
      -0.1,
      0.17,
    );
  } else if (action === "slap" && id === "b8") {
    head.rotation.x = THREE.MathUtils.lerp(
      0.29,
      -0.15,
      THREE.MathUtils.smoothstep(seconds, 104.27, 104.88),
    );
  } else if (action === "bench-mime" || action === "bench-answer") {
    head.rotation.y = (id === "b8" ? -.43 : .43) * pulse(seconds, 110.85, 111.39, 114.75, 116.2);
    head.rotation.x -= .12 * pulse(seconds, 110.85, 111.75, 114.7, 116.2);
  } else if (action === "sip") {
    head.rotation.x -= sip(seconds) * .20;
  }
  const ready = action === "bench-ready" ? pulse(seconds, 113.27, 115.43, 119.4, 119.7) : 0;
  if (ready) {
    spine.rotation.x += .18 * ready;
    head.rotation.x -= .20 * ready;
  }
  if (id === "b4" && seconds >= 95.8 && seconds < 98.47) {
    const follow = pulse(seconds, 95.8, 96.64, 98.02, 98.47);
    const towardPartner = rig.root.worldToLocal(v(2.55, 1.2, 8.55));
    head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, clamp(Math.atan2(towardPartner.x, towardPartner.z), -.88, .88), follow);
  }
  const cross = p.hand ?? "both";
  for (const side of ["left", "right"] as const) {
    const sign = side === "left" ? 1 : -1;
    const ankle = rig.rest.get(side + "Foot")!;
    const contraction = running ? 0.55 : dribble ? 0.23 : defending ? 0.09 : 0;
    const stride = Math.sin(beat + (side === "right" ? Math.PI : 0));
    const lift = Math.max(0, Math.cos(beat + (side === "right" ? Math.PI : 0)));
    const foot = v(
      ankle.x +
        sign *
          (seated ? 0.035 : defending ? 0.09 : dribble ? 0.035 : 0.006) *
          h,
      ankle.y +
        (running ? 0.17 : dribble ? 0.065 : defending ? 0.013 : 0) * lift * h,
      ankle.z + (seated ? 0.32 * h : contraction * stride * h),
    );
    if (p.y > 0.04) {
      foot.y += Math.min(0.11, p.y * 0.28) * (side === "right" ? 1 : 0.68);
      foot.z -= Math.min(0.11, p.y * 0.24);
    }
    limb(
      rig,
      side + "UpperLeg",
      side + "LowerLeg",
      side + "Foot",
      rig.root.localToWorld(foot),
      rig.root.localToWorld(v(sign * 0.2 * h, 0.59 * h, 0.61 * h)),
    );
    const shoe = rig.bones.get(side + "Foot")!;
    const shoeWorld = rig.root
      .getWorldQuaternion(new THREE.Quaternion())
      .multiply(
        new THREE.Quaternion().setFromAxisAngle(
          v(1, 0, 0),
          running ? 0.26 * stride : 0.02,
        ),
      );
    shoe.quaternion.copy(
      shoe
        .parent!.getWorldQuaternion(new THREE.Quaternion())
        .invert()
        .multiply(shoeWorld),
    );

    const shoulder = rig.rest.get(side + "UpperArm")!;
    const selected = cross === side || cross === "both";
    let hand = v(
      shoulder.x + sign * 0.038 * h,
      shoulder.y - 0.54 * h,
      0.105 * h,
    );
    if (seated) hand = v(sign * 0.16 * h, 0.57 * h, 0.34 * h);
    if (running || dribble) {
      const length =
        gait.limbs.find((l) => l.bone === "leftUpperArm")!.amplitude / 100;
      hand = v(
        shoulder.x + sign * 0.05 * h,
        shoulder.y - (0.38 + 0.06 * stride) * h,
        (0.13 - stride * length * 0.63) * h,
      );
    } else if (defending) {
      hand =
        action === "guard"
          ? v(sign * 0.46 * h, (1.16 + 0.06 * swing) * h, 0.19 * h)
          : action === "boxout"
            ? v(sign * 0.43 * h, 1.0 * h, 0.1 * h)
            : v(sign * 0.12 * h, 0.96 * h, 0.2 * h);
    }
    if (action === "signal") {
      hand =
        id === "ref2" && seconds < 73
          ? v(
              side === "left" ? -0.035 : 0.015,
              (side === "left" ? 1.77 : 1.7) * h,
              0.18 * h,
            )
          : v(
              sign * 0.17 * h,
              ((seconds >= 151 && seconds < 155) || side === "right"
                ? 2.04
                : 1.07) * h,
              0.07 * h,
            );
    }
    if (action === "point" && side === "left")
      hand = v(shoulder.x - 0.26 * h, shoulder.y - 0.02 * h, 0.51 * h);
    if (action === "pass" || action === "catch" || action === "board")
      hand = v(
        sign * 0.145 * h,
        1.33 * h,
        (0.26 + 0.18 * Math.sin(p.phase * Math.PI)) * h,
      );
    if (action === "dunk") hand = v(sign * 0.15 * h, 2.29 * h, 0.1 * h);
    if (action === "shot" || action === "layup") {
      hand = selected
        ? v(
            shoulder.x * 0.42,
            (1.92 + 0.39 * p.phase) * h,
            (0.21 + 0.17 * p.phase) * h,
          )
        : v(-0.13 * h, 1.61 * h, 0.24 * h);
      if (seated) hand = v(sign * 0.17 * h, 1.28 * h, 0.3 * h);
    }
    if (action === "slap" && selected) {
      const clap = seconds < 99 ? 94.5 : 106;
      hand.lerp(v(sign * .23 * h, (seated ? .87 : 1.11) * h, .26 * h),
        pulse(seconds, clap - .90, clap - .43, clap + .13, clap + .42));
    }
    if (action === "sip" && side === "right") {
      hand.lerp(v(-.25 * h, 1.13 * h, .28 * h), sip(seconds));
    } else if (action === "bench-rest") {
      hand.lerp(v(sign * .17 * h, .48 * h, .37 * h), pulse(seconds, 80.4, 81.02, 82.48, 83));
    } else if (side === "left" && (action === "bench-mime" || action === "bench-answer")) {
      const mime = action === "bench-mime";
      const rise = THREE.MathUtils.smoothstep(seconds, 110.85, 111.64);
      if (mime) {
        hand.lerp(v(.33 * h, (.63 + .97 * rise) * h, (.21 + .36 * rise) * h),
          pulse(seconds, 110.85, 111.1, 111.75, 112.18));
      } else {
        hand.lerp(v(.46 * h, 1.44 * h, .34 * h), pulse(seconds, 111.58, 112.06, 112.35, 113.27));
      }
    } else if (ready) {
      hand.lerp(v(sign * .16 * h, .47 * h, .41 * h), ready);
    }
    const grasp =
      action === "catch" ||
      action === "pass" ||
      action === "board" ||
      action === "dunk";
    let palmTangent: THREE.Vector3 | undefined;
    let palmWeight = 0;
    if (
      p.target &&
      (selected || grasp || (action === "guard" && id === "b7")) &&
      (grasp ||
        dribble ||
        action === "interrupted" ||
        action === "sleeve" ||
        action === "point" ||
        action === "shot" ||
        action === "layup" ||
        action === "guard")
    ) {
      const target = rig.root.worldToLocal(v(...p.target));
      if (action === "point") {
        hand = id === "b7" ? hand.lerp(target, pulse(seconds, 96.25, 96.84, 98.36, 99.15)) : target;
      } else if (action === "sleeve" || action === "interrupted") {
        const reach = pulse(seconds, 95.15, 95.48, 95.97, 96.25);
        hand.lerp(target, reach);
      } else if (action === "dunk") {
        const release = THREE.MathUtils.smoothstep(seconds, 24.64, 24.7);
        hand = target.add(v(sign * THREE.MathUtils.lerp(.095, .16 * h, release),
          THREE.MathUtils.lerp(-.075, .005, release), 0));
      } else if (dribble) {
        const armForward = target.z >= 0 ? 0.025 : -0.025;
        hand = target.add(v(0, 0.12, armForward));
        hand.y = Math.max(hand.y, 0.61 * h);
      } else {
        hand = target.add(
          v(
            cross === "both" ? sign * 0.108 : 0,
            action === "shot" || action === "layup" ? -0.105 : 0,
            -0.025,
          ),
        );
        if (action === "board" && id === "w10" && seconds >= 178.95) {
          const normal = v(sign * .70, -.71, -.08).normalize();
          const tangent = v(0, 1, .08);
          tangent.addScaledVector(normal, -tangent.dot(normal)).normalize();
          palmWeight = THREE.MathUtils.smoothstep(seconds, 178.95, 179);
          const support = rig.root.worldToLocal(v(...p.target)).addScaledVector(normal, courtHoop.ballRadius + .012);
          hand.lerp(support, palmWeight);
          palmTangent = tangent.transformDirection(rig.root.matrixWorld);
        }
      }
    }
    // The endpoint is the wrist. Its palm extends another hand length in the final forearm direction.
    const worldHand = rig.root.localToWorld(hand);
    const shoulderWorld = worldOrigin(rig, side + "UpperArm");
    const retreat = worldHand
      .clone()
      .sub(shoulderWorld)
      .normalize();
    if (palmTangent) retreat.lerp(palmTangent, palmWeight).normalize();
    retreat.multiplyScalar(0.088 * h);
    const palmTarget = worldHand.clone();
    worldHand.sub(retreat);
    const elbowPole = rig.root.localToWorld(
      v(sign * 0.62 * h, (seated ? 0.76 : 1.07) * h, -0.08 * h),
    );
    limb(
      rig,
      side + "UpperArm",
      side + "LowerArm",
      side + "Hand",
      worldHand,
      elbowPole,
    );
    const wrist = rig.bones.get(side + "Hand")!;
    if (p.target && (selected || grasp)) {
      aim(rig, side + "Hand", side + "MiddleProximal", palmTarget);
    } else {
      wrist.rotation.set(0, 0, 0);
    }
  }
  rig.root.updateMatrixWorld(true);
}

/** Blend the two cue poses around the unchanged ball and floor clock. */
function placeAcrossCue(rig: Rig, id: string, current: Placement, seconds: number, cue: PoseTransition): void {
  const { earlier, later, from, to } = cue;
  const progress = THREE.MathUtils.smoothstep(seconds, from, to);
  place(rig, id, earlier.players[id], earlier.ball, earlier.play);
  const before = Array.from(rig.bones.values(), (bone) => ({ bone, position: bone.position.clone(), quaternion: bone.quaternion.clone() }));
  place(rig, id, later.players[id], later.ball, later.play);
  const arrival = cue.seats && seconds < 81;
  const seatClearance = cue.seats ? .38 * Math.sin(Math.PI * progress) + Math.max(0, current.z - seatDepth) * (1 - progress) : 0;
  const depth = arrival
    ? THREE.MathUtils.lerp(Math.min(current.z, seatApproach), Math.min(current.z, seatDepth), THREE.MathUtils.smoothstep(seconds, 79.42, to))
    : current.z - seatClearance;
  rig.root.position.set(current.x, current.y, depth);
  const fromYaw = earlier.players[id].yaw;
  const turn = later.players[id].yaw - fromYaw;
  const facing = arrival ? THREE.MathUtils.smoothstep(seconds, from, 79.42) : progress;
  rig.root.rotation.set(0, fromYaw + Math.atan2(Math.sin(turn), Math.cos(turn)) * facing, 0);
  for (const { bone, position, quaternion } of before) {
    bone.position.lerp(position, 1 - progress);
    bone.quaternion.slerp(quaternion, 1 - progress);
  }
  rig.root.updateMatrixWorld(true);
}

/** Blend installed canonical joint placements into the dressed rig and retain its procedural pose for the next seek. */
function applyCanonicalPose(rig: Rig, pose: IAutoMoviePose, weight: number): () => void {
  const desired = AutoMovieHumanCanonicalBody.place(rig.body, pose);
  const baseline = desired.map(({ bone }) => {
    const node = rig.bones.get(bone)!;
    return {
      node, position: node.position.clone(), quaternion: node.quaternion.clone(),
      worldPosition: node.getWorldPosition(v()),
      worldQuaternion: node.getWorldQuaternion(new THREE.Quaternion()),
    };
  });
  for (const [index, { position, rotation }] of desired.entries()) {
    const base = baseline[index];
    const worldPosition = base.worldPosition.lerp(v(position.x, position.y, position.z), weight);
    const worldQuaternion = base.worldQuaternion.slerp(new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w), weight);
    const parent = base.node.parent!;
    base.node.position.copy(parent.worldToLocal(worldPosition));
    base.node.quaternion.copy(parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(worldQuaternion));
    base.node.updateWorldMatrix(false, false);
  }
  return () => {
    for (const { node, position, quaternion } of baseline) {
      node.position.copy(position);
      node.quaternion.copy(quaternion);
    }
  };
}

/**
 * Mount both fives and both referees. The scene supplies metres, source time and world-space hand contacts and owns the one ball.
 * @evidence contracts/development/common.md#meaningful-documentation Seek accepts the full twelve-member placement record, world-space ball point and source seconds plus an optional cue window and bench pose. Arm and leg targets clamp to the available joint lengths. Disposal retires actor, bottle and shadow GPU resources.
 * @evidence contracts/development/implementation.md#principled-implementation A fresh actor root owns each Human body, clothes and contact shadow. Arm and leg reaches are clamped to the actual articulated lengths and evaluated from the supplied source second.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Mount and retirement share one roster. The scene owns paths, chronology and scoring, and the posing function owns the cast's response.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Players remain 3D mesh instances through all programme and alternate views. No camera-facing sprites stand in for any person.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each actor uses one skinned draw and one ground quad. A bounded frame pass restores the previous bench pose, samples each rig and blends a pose pair for any active cue participants.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Each mounted canonical body supplies the GPU rig and the SDK bench poses. The same running gait and Human-derived limb lengths serve live action and replay.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The mount owns and retires its twelve rigs, their skeleton textures, geometries, materials and the shared shadow resources.
 * @evidence contracts/development/entities.md#settings-realization The white roster follows docs/body/brief/cast/shohoku-04.md#identity, docs/body/brief/cast/shohoku-07.md#identity, docs/body/brief/cast/shohoku-10.md#identity, docs/body/brief/cast/shohoku-11.md#identity and docs/body/brief/cast/shohoku-14.md#identity. The blue roster follows docs/body/brief/cast/hamaura-04.md#identity, docs/body/brief/cast/hamaura-05.md#identity, docs/body/brief/cast/hamaura-07.md#identity, docs/body/brief/cast/hamaura-08.md#identity and docs/body/brief/cast/hamaura-09.md#identity. docs/body/screenplay/two-hands/010-game.md#restart assigns the bench contacts and #last-board assigns the final catch to white 10.
 * @evidence contracts/development/entities.md#object-shape Immutable per-player proportions and colors drive one bind skeleton. Motion receives placements and hand goals while scoring and ball flight stay in the scene.
 * @evidence contracts/development/entities.md#controls-and-source The roster is built locally from the installed Human rig and Render polygon. Uniform, hair and numerals follow its bones across both cameras; timed movement uses the installed running gait and film contact marks.
 */
export function createPlayers(scene: THREE.Scene) {
  const shadowMesh = new THREE.PlaneGeometry(1, 1);
  const shadowInk = new THREE.ShaderMaterial({
    vertexShader:
      "varying vec2 q; void main(){q=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:
      "varying vec2 q; void main(){float d=dot(q,q); gl_FragColor=vec4(0.11,0.06,0.03,.22*pow(max(0.,1.-d),1.7));}",
    transparent: true,
    depthWrite: false,
  });
  const cast = ids.map((id) => {
    const rig = playerRig(id);
    const shadow = new THREE.Mesh(shadowMesh, shadowInk);
    shadow.rotation.x = -Math.PI / 2;
    shadow.renderOrder = 1;
    scene.add(rig.root, shadow);
    return { id, rig, shadow };
  });
  const drink = createDrinkware({ kind: "waterBottle", id: "bench-water", fill: .6 }, "two-hands");
  const bottle = buildModel(drink);
  const bottleGeometries = new Set<THREE.BufferGeometry>();
  const bottleMaterials = new Set<THREE.Material>();
  bottle.object.traverse((part) => {
    if (part instanceof THREE.Mesh) {
      bottleGeometries.add(part.geometry);
      for (const material of [part.material].flat()) bottleMaterials.add(material);
    }
  });
  const bottleHeight = drink.dimensions.height!;
  const captain = cast.find(({ id }) => id === "b4")!.rig;
  const drinker = cast.find(({ id }) => id === "w14")!.rig;
  scene.add(bottle.object);
  const restore: (() => void)[] = [];
  return {
    bodies: Object.fromEntries(cast.map(({ id, rig }) => [id, rig.body])),
    seek(
      players: Record<string, Placement>,
      ball: Point,
      seconds: number,
      gesture: CastPose | null,
      cue?: PoseTransition,
    ): void {
      for (const previous of restore) previous();
      restore.length = 0;
      for (const { id, rig, shadow } of cast) {
        let p = players[id];
        rig.root.visible = shadow.visible = Boolean(p);
        if (!p) continue;
        if (p.action === "sleeve") {
          const sleeve = worldOrigin(captain, "leftLowerArm").lerp(worldOrigin(captain, "leftHand"), .27);
          p = { ...p, target: sleeve.toArray() };
        }
        const crossesCue = cue && (cue.actors?.includes(id) ?? (cue.seats
          ? cue.earlier.players[id].seated !== cue.later.players[id].seated
          : cue.earlier.players[id].action !== cue.later.players[id].action));
        if (cue && crossesCue) placeAcrossCue(rig, id, p, seconds, cue);
        else place(rig, id, p, ball, seconds);
        const pose = gesture?.poses[id];
        if (gesture && pose) {
          restore.push(applyCanonicalPose(rig, pose, gesture.weight));
          if (id === "b8") {
            const head = rig.bones.get("head")!;
            const lift = THREE.MathUtils.smoothstep(seconds, 104.27, 104.88);
            head.rotation.x += gesture.weight * THREE.MathUtils.lerp(.24, -.18, lift);
          }
        }
        shadow.position.set(p.x + 0.038 * p.y, 0.014, rig.root.position.z - 0.022 * p.y);
        shadow.scale.set(1.05 + p.y * 0.2, 0.53 + p.y * 0.16, 1);
      }
      bottle.object.visible = players.w14.action === "sip";
      if (bottle.object.visible) {
        const hand = worldOrigin(drinker, "rightHand").lerp(worldOrigin(drinker, "rightMiddleProximal"), .52);
        const head = worldOrigin(drinker, "head");
        const mouth = v(0, -.015, .081).applyQuaternion(drinker.root.quaternion).add(head);
        const lift = sip(seconds);
        const axis = v(0, 1, 0).lerp(mouth.sub(hand).normalize(), lift).normalize();
        bottle.object.position.copy(hand).addScaledVector(axis, -.44 * bottleHeight);
        bottle.object.quaternion.setFromUnitVectors(v(0, 1, 0), axis);
      }
    },
    dispose(): void {
      for (const { rig, shadow } of cast) {
        scene.remove(rig.root, shadow);
        rig.mesh.geometry.dispose();
        rig.mesh.material.dispose();
        rig.mesh.skeleton.dispose();
      }
      shadowMesh.dispose();
      shadowInk.dispose();
      scene.remove(bottle.object);
      bottleGeometries.forEach((geometry) => geometry.dispose());
      bottleMaterials.forEach((material) => material.dispose());
    },
  };
}

