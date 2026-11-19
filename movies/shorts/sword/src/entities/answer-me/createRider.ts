import * as THREE from "three";
import { castActor } from "../../composition/shared/castActor";
import type { nativeStageMotion } from "../../composition/shared/nativeStageMotion";
import { cord, joint, oval, surface } from "./surfaces";

/**
 * Dresses the shared polygon body as Rémy, Luc or the clerk. The stage origin
 * is a seated pelvis or a standing sole. Named hands, sleeve and purse provide
 * the contact points used by the scene.
 *
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/remy.md#appearance supplies taller proportions, ochre, steel and the green belt. docs/body/brief/cast/remy.md#screen supplies the belt purse. docs/body/brief/cast/luc.md#appearance supplies compact proportions, faded blue sleeves, dull steel and brown belt. docs/body/brief/cast/muster-clerk.md#appearance supplies the plum gown, black cap and marked right cuff. The coarse heads resolve broad features, with the scene carrying hand, clothing and role differences.
 * @evidence contracts/development/entities.md#object-shape Returns a mutable performer rig with hand and garment attachment points. Mounted, dismount and stage pose controls write actor-local state. The scene owns world blocking and time.
 * @evidence contracts/development/entities.md#controls-and-source One kind selects stage proportions, costume and accessories. The shared polygon body reaches the draw through castActor; groundTravel accepts installed sample data and preserves scripted hand goals. Fixed repository-authored meshes supply the wardrobe, with coarse geometry as the only commissioned draw form used here.
 * @evidence contracts/development/common.md#meaningful-documentation Describes the variant input, root origins and the stage contact points returned by the rig.
 * @evidence contracts/development/implementation.md#principled-implementation Applies stage angles in radians and maps world hand goals into the facing body frame. Feet and toes use native targets for groundTravel with a shoe-height offset. Mouth motion is driven by cue amount; it does not track phonemes.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure castActor owns common body construction. This adapter owns wardrobe, mount-relative placement, locally staged poses and the translation between named body contacts and scene targets.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The three wardrobe branches distinguish cast requirements. Ground travel consumes native samples. Seated and hand work use local authored poses.
 * @evidence contracts/development/implementation.md#efficient-algorithms Allocates one fixed articulated body and wardrobe per cast member, then updates its fixed joints and attachment points per pose.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work All three cast members use castActor and the same shape helpers. Each instance keeps independent clothing, pose and contact transforms.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Scene-owned actions retain one body graph, garment and attachment references per performer. The scene disposes attached geometry; this function does not retain a global actor or explicitly release its materials.
 */
export function createRider(kind: "remy"|"luc"|"clerk") {
  const remy = kind === "remy", clerk = kind === "clerk";
  const height = remy ? 1.79 : clerk ? 1.70 : 1.69;
  const tunic = remy ? 0xb18435 : clerk ? 0x67434a : 0x597c91;
  const skin = remy ? 0xcb976e : clerk ? 0xc39a76 : 0xb88964;
  const actor = castActor({
    name:kind,height,tunic,hair:remy ? 0x714225 : clerk ? 0x62554a : 0x47382a,
    skin,
    legs:clerk ? 0x4d4250 : 0x5d554a,boots:0x50392a,
  });
  actor.leftHand.name = "left palm";
  actor.rightHand.name = "right palm";
  actor.leftFoot.name = "left ankle";
  actor.rightFoot.name = "right ankle";
  const root = new THREE.Group();
  root.name = kind;
  const facing = joint(root,"actor facing +X",0,0);
  facing.rotation.y = Math.PI/2;
  facing.add(actor.root);
  const clothes = joint(actor.torso,"waist and breast",0,0);
  const build = remy ? 0.96 : clerk ? 0.93 : 1.04;
  const pelvis = 0.535*height;
  const beltY = 1.105*height/1.75581;
  const belt = surface(clothes,"belt",new THREE.CylinderGeometry(0.193,0.194,remy ? 0.048 : 0.057,14),remy ? 0x476e43 : 0x57412f);
  belt.position.y = beltY;
  belt.scale.set(build,1,0.76);
  belt.position.z = 0.025;
  oval(clothes,"belt buckle",0,beltY,0.17,0.032,0.026,0.01,0xb19a6a);
  const purse = joint(clothes,"belt purse",-0.16,beltY-0.063,0.075);
  const purseMouth = joint(purse,"purse mouth",-0.017,0.048,0.01);
  const mouth = oval(actor.head,"mouth opening",0,-0.103,0.122,0.031,0.006,0.007,0x714337);
  if (remy) {
    oval(purse,"purse body",-0.015,-0.048,0,0.086,0.087,0.066,0x63452b);
    const collar = surface(purseMouth,"leather rim",new THREE.CylinderGeometry(0.068,0.055,0.035,14,1,true),0x785335);
    collar.scale.z = 0.75;
    collar.position.y = -0.016;
    oval(purseMouth,"dark leather interior",0,-0.003,0,0.066,0.004,0.049,0x261b13);
    const welt = surface(purseMouth,"rim stitching",new THREE.TorusGeometry(0.067,0.006,5,16),0xb9905d);
    welt.rotation.x = Math.PI/2;
    welt.scale.y = 0.75;
    cord(purse,"drawstring ends",[[-0.074,0.044,0.028],[-0.092,0.027,0.033],[-0.085,0.004,0.043],[-0.092,-0.03,0.042]],0.005,0xceb27e);
  }
  if (clerk) {
    const gown = surface(clothes,"long wool gown",new THREE.CylinderGeometry(0.168,0.273,0.79,12),tunic);
    gown.position.y = beltY - 0.409;
    gown.scale.z = 0.8;
    oval(actor.head,"round black cap",0,0.110,0,0.118,0.058,0.105,0x332e2e);
  } else {
    const armor = oval(clothes,"breastplate",0,0.73*height,0.022,0.202*build,0.215,0.138,remy ? 0x939fa4 : 0x798487);
    const steel = armor.material as THREE.MeshStandardMaterial;
    steel.metalness = 0.40;
    steel.roughness = 0.52;
    for (const side of [-1,1])
      oval(clothes,"upper fastening",side*0.133,0.802*height,0.095,0.016,0.016,0.009,0xbaaa84);
  }
  const leftCuff = joint(actor.leftHand,"left sleeve cuff",0,0.052);
  const rightCuff = joint(actor.rightHand,"right sleeve cuff",0,0.052);
  oval(leftCuff,"wool cuff",0,0,0,0.047,0.044,0.049,tunic);
  oval(rightCuff,"wool cuff",0,0,0,0.047,0.044,0.049,tunic);
  if (clerk) oval(rightCuff,"ink stain",0.014,0.005,0.041,0.022,0.015,0.01,0x2f2b3c);
  const sleeveGrip = joint(clothes,"upper sleeve grip",0.196,0.754*height,0.045);
  const gatheredSleeve = oval(sleeveGrip,"gathered wool",0.017,-0.020,0,0.044,0.073,0.045,tunic);
  gatheredSleeve.visible = false;

  const fingers = [actor.leftHand,actor.rightHand].map((hand,side) =>
    [0,1,2,3].map(i => {
      const knuckle = joint(hand,"finger knuckle",((i-1.5)*0.016)*(side === 0 ? 1 : -1),-0.025,0.009);
      const length = [0.037,0.041,0.036,0.029][i]!;
      oval(knuckle,"finger",0,-length*0.50,0,0.010,length*0.62,0.013,skin);
      const tip = joint(knuckle,"finger bend",0,-length);
      oval(tip,"fingertip",0,-0.011,0,0.009,0.017,0.012,skin);
      return {knuckle,tip};
    }));
  /** Zero relaxes the fingers, one curls them into the palm. */
  function setGrip(side: "left"|"right", amount: number): void {
    const closure = THREE.MathUtils.clamp(amount,0,1);
    for (const {knuckle,tip} of fingers[side === "left" ? 0 : 1]!) {
      knuckle.rotation.x = -0.18-closure*1.17;
      tip.rotation.x = -0.22-closure*1.28;
    }
  }

  type State = Parameters<typeof actor.pose>[0];
  let current: State = {};
  let mounted = false;
  let bootFloorOffset = 0;
  function drawPose(): void {
    const pitch = current.lean ?? 0;
    const dy = mounted ? pelvis*(1-Math.cos(pitch)) : 0;
    const dz = mounted ? -pelvis*Math.sin(pitch) : 0;
    const vertical = dy-bootFloorOffset;
    actor.root.position.set(0,vertical,dz);
    const resolved = {...current};
    // Keep palms on reins and ankles at stirrups as the chest rotates about the seat.
    for (const limb of ["leftArm","rightArm","leftLeg","rightLeg"] as const) {
      const p = current[limb];
      if (p) resolved[limb] = [p[0],p[1]-vertical,p[2]-dz];
    }
    actor.pose(resolved);
  }
  function pose(time: number, mode: "ride"|"stand"|"run"|"reach"|"dismount", amount = 1): void {
    const amplitude = THREE.MathUtils.clamp(amount,0,1);
    const beat = Math.sin(time*8.37);
    bootFloorOffset = 0;
    mounted = mode === "ride" || mode === "dismount";
    facing.position.y = (mode === "ride" ? -pelvis + 0.022*amplitude*beat : mode === "dismount" ? -pelvis*(1-amplitude) : 0);
    if (mounted) {
      current = {
        lean:0.05 + 0.038*beat*amplitude,headYaw:0.15*Math.sin(time*0.65),
        leftArm:[0.16,0.633*height,0.33],rightArm:[-0.17,0.641*height,0.32],
        leftLeg:[0.36,pelvis-0.60,0.08],rightLeg:[-0.36,pelvis-0.60,0.08],
      };
      if (mode === "dismount") {
        const swing = Math.sin(Math.PI * amplitude);
        current.leftLeg = [0.36-0.25*amplitude,pelvis-0.6+(0.075-pelvis+0.6)*amplitude,0.08];
        current.rightLeg = [-0.36+0.25*amplitude+0.53*swing,pelvis-0.6+(0.075-pelvis+0.6)*amplitude+0.37*swing,-0.27*swing];
        current.leftArm = [0.16+0.06*amplitude,(0.633-0.142*amplitude)*height,0.33-0.22*amplitude];
        current.rightArm = [-0.17-0.05*amplitude,(0.641-0.150*amplitude)*height,0.32-0.21*amplitude];
      }
    } else if (mode === "run") {
      const cycle = time*9.8;
      current = {walk:cycle,stride:1.32*amplitude,lean:0.12,headPitch:0.06,
        rightArm:[-0.17,beltY-0.055,0.12]};
    } else {
      current = {headYaw:0.11*Math.sin(time*0.63),headPitch:clerk ? 0.085 : 0};
      if (mode === "reach") current.rightArm = [-0.17,height*(0.57+0.14*amplitude),0.15+0.32*amplitude];
    }
    setGrip("left", mounted ? 0.85 : 0.16);
    setGrip("right", mounted || mode === "run" ? 0.88 : 0.12);
    mouth.scale.y = 0.006;
    drawPose();
  }
  /** Absolute torso and head angles for a reaction, in radians in the actor's frame. */
  function perform(lean: number, headYaw: number, headPitch: number): void {
    current = {...current,lean,headYaw,headPitch};
    drawPose();
  }
  function reachHand(side: "left"|"right", worldPoint: THREE.Vector3): void {
    const p = facing.worldToLocal(worldPoint.clone());
    current = {...current,[side === "left" ? "leftArm" : "rightArm"]:[p.x,p.y,p.z]};
    drawPose();
  }
  /** Transfer resolved ground-action bones to the wardrobe rig beside authored prop contacts. */
  function groundTravel(sample: nativeStageMotion.Sample, swingFreeHand: boolean, bootOffset: number): void {
    bootFloorOffset = bootOffset;
    current = {
      ...current,
      nativeLegs: sample,
      ...(swingFreeHand ? { nativeArms: sample } : {}),
    };
    drawPose();
  }
  /** Open or cinch the leather rim at the belt without moving its attachment. */
  function closePurse(amount: number): void {
    purseMouth.scale.set(1-0.60*amount,1,1-0.75*amount);
  }
  /** The loose cloth visibly gathers under the pull and falls back on release. */
  function gatherSleeve(amount: number): void {
    gatheredSleeve.visible = remy && amount > 0;
    gatheredSleeve.scale.set(0.038+0.016*amount,0.043+0.058*amount,0.031+0.026*amount);
  }
  /** Animate approximate vowel closures on the visible mouth surface. */
  function speak(amount: number): void {
    mouth.scale.y = 0.006 + 0.020*amount;
    mouth.position.y = -0.103 - 0.008*amount;
  }
  pose(0,"stand");
  return {root,pose,perform,reachHand,groundTravel,setGrip,closePurse,gatherSleeve,speak,leftHand:actor.leftHand,rightHand:actor.rightHand,leftCuff,rightCuff,sleeveGrip,purse,purseMouth};
}
