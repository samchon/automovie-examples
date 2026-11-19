import { AutoMovieHumanCanonicalBody, AutoMovieHumanSex } from "@automovie/human";
import * as THREE from "three";
import type { ArtDepartment } from "../../../shared/ArtDepartment";
import { head } from "./head";
import { roundFloor } from "../../../shared/roundFloor";
import type { ActorPose } from "./ActorPose";
import type { Role } from "./Role";
import { roundClock } from "../../../clock";

const { apronHeight: APRON_HEIGHT, canvasWorldY: CANVAS_WORLD_Y } = roundFloor;

type Paint = { skin: string; hair: string; top: string; sleeves: string; pants: string; h: number; broad: number; female?: boolean };
const cast: Record<Role, Paint> = {
  owen:{skin:"#b47c51",hair:"#312a26",top:"#bb2931",sleeves:"#bb2931",pants:"#bf2932",h:1.8,broad:1.02},
  marek:{skin:"#ddab8a",hair:"#9d794b",top:"#204bba",sleeves:"#204bba",pants:"#264ca7",h:1.8,broad:1},
  daniel:{skin:"#694a37",hair:"#312d2b",top:"#454b50",sleeves:"#41474d",pants:"#242729",h:1.86,broad:.99},
  pavel:{skin:"#ca9b7e",hair:"#b6b6aa",top:"#28519a",sleeves:"#eeeada",pants:"#292e38",h:1.79,broad:1.14},
  ivo:{skin:"#cca587",hair:"#3b3531",top:"#263c57",sleeves:"#263c57",pants:"#233448",h:1.75,broad:.90},
  jo:{skin:"#986b4e",hair:"#282728",top:"#953338",sleeves:"#262a2b",pants:"#24292d",h:1.64,broad:1.14,female:true},
  ed:{skin:"#e0b18d",hair:"#9e5939",top:"#823339",sleeves:"#823339",pants:"#24292d",h:1.83,broad:.91},
  maya:{skin:"#ab7754",hair:"#292729",top:"#eabe42",sleeves:"#eabe42",pants:"#3e4247",h:1.65,broad:.96,female:true},
  ruth:{skin:"#d9ad98",hair:"#bab7ad",top:"#86506f",sleeves:"#86506f",pants:"#4d5961",h:1.63,broad:1.00,female:true},
  alan:{skin:"#b88a6b",hair:"#686460",top:"#7b7f7d",sleeves:"#7b7f7d",pants:"#313438",h:1.71,broad:.94},
};

function joint(parent: THREE.Object3D,x: number,y: number,z: number): THREE.Group {
  const node=new THREE.Group();node.position.set(x,y,z);parent.add(node);return node;
}

/**
 * Builds and attaches one polygon performer to the scene. The rig uses the canonical Human's segment lengths in metres and applies the production pose's local angles and world targets. The caller disposes the actor's own floor shadow and the shared art separately.
 *
 * The cast definitions are in docs/body/brief/cast: owen-vale.md#red-corner and marek-sokol.md#blue-corner supply the bare feet and torsos, distinct corner colours and equal 180 cm, 80 kg setup. daniel-mensah.md#referee supplies the dark official's clothes and shoes. jo-bell.md#chief-second and ed-lane.md#assistant-second identify the red second pair. pavel-havel.md#chief-second and ivo-kral.md#assistant-second distinguish the white sleeves and navy tracksuit. maya-shah.md#ringside-neighbour and ruth-ellis.md#ringside-neighbour supply yellow and plum. alan-price.md#timekeeper supplies the grey jacket and glasses. The performance track owns their view and reactions. Apparent ages and portraits are simplified here and the source photographs remain in the brief.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment states the role of the scene, art and canonical measurements and distinguishes pose coordinates and cleanup ownership.
 * @evidence contracts/development/implementation.md#principled-implementation Rigid joint groups are sized from SDK bone distances. An analytic two-link fit maps a requested target onto a reachable posture, from the law's shoulder or hip frame and bend side.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Geometry is constructed and batched once; the apply closure fits the sampled pose onto the joints and support without reconstructing its appearance.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Palette, costume and proportions are casting inputs. The fallback segment lengths cover out-of-range nominal distances. The falling performer's ground adjustment implements the commissioned side support state.
 * @evidence contracts/development/implementation.md#efficient-algorithms Setup visits the canonical joints and fixed number of puppet segments. Each apply updates two limbs of each kind, their supports, and the role's bounded targets.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The actor reuses its joint groups, geometry and scratch vectors on each seek. The art owner reuses shapes and materials across roles.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The scene owns attached actor nodes, and the art department owns its shared geometry and paint. Actor disposal releases its separate shadow geometry and material.
 * @evidence contracts/development/entities.md#settings-realization The ten brief-backed casting rows select paint, proportions, silhouette and wardrobe. Installed canonical preparation supplies body dimensions and the motion plan's skeleton. The final lateral pose holds the drawing above the canvas under docs/body/screenplay/kickboxing/020-the-round.md#p11-b01; this is a bespoke drawing constraint, not a physical replay or a Human display mesh.
 * @evidence contracts/development/entities.md#object-shape The fixed role selects the subject at construction. The factory returns canonical body data, the displayed root, apply and disposal. Its drawing port mutates Three.js transforms for scene-owned per-seek poses. This ensemble factory is a retained mutable display adapter rather than a per-subject immutable action class.
 * @evidence contracts/development/entities.md#controls-and-source One local factory builds the procedural coarse cast and uses installed Human segment lengths on the shown puppet. The scene uses the same mounted canonical body for supported walk, guard and gesture actions, passing their resolved targets to apply. The visible skin, clothes and face are local primitive and loft geometry rather than the installed surface mesh or a portrait conversion. The source and its colour definitions are fixed in this module; there is no separate detailed deformation option.
 */
export function createActor(role: Role, art: ArtDepartment, scene: THREE.Scene) {
  const paint=cast[role], fighter=role==="owen"||role==="marek", inRing=fighter||role==="daniel";
  const {skin,hair,top,sleeves,pants}=paint;
  const height=paint.h;
  const canonical=AutoMovieHumanCanonicalBody.prepare({body:{anatomy:{sex:paint.female?AutoMovieHumanSex.Female:AutoMovieHumanSex.Male,stature:height*1000}},head:head(height*1000)},{id:role,mass:fighter?80:70});
  const js=AutoMovieHumanCanonicalBody.display(canonical).bones;
  const positions=new Map(js.map(p=>[p.bone,new THREE.Vector3(...p.position)]));
  const length=(a:string,b:string,nominal:number)=>{
    const p=positions.get(a as typeof js[number]["bone"]),q=positions.get(b as typeof js[number]["bone"]);
    if(!p||!q)throw Error("Missing canonical joint "+a+" or "+b);
    const d=p.distanceTo(q);return d>.1&&d<.75?d:nominal*height/1.80;
  };
  const thigh=length("leftUpperLeg","leftLowerLeg",.43),shin=length("leftLowerLeg","leftFoot",.43);
  const upper=length("leftUpperArm","leftLowerArm",.29),lower=length("leftLowerArm","leftHand",.25);
  const scale=height/1.80, broad=paint.broad;
  const root=new THREE.Group();root.name=role;scene.add(root);
  const hip=joint(root,0,0,0), chest=joint(hip,0,0,0);
  const form=(node:THREE.Object3D,s:"box"|"tube"|"flat"|"round",c:string,p:number[],d:number[])=>art.form(s,c,p,d,node);
  const waist=.145*broad, breadth=.196*broad;
  const torsoMat=fighter?skin:top;
  art.loft(chest,torsoMat,[[.015,waist,.113,0],[.135,waist*.96,.11,0],[.24,breadth*.89,.132,0],[.365,breadth*1.12,.141,.002],[.435,breadth,.117,-.006],[.46,.085,.082,0]]);
  form(chest,"round",skin,[0,.467,0],[.142,.15,.135]);
  if(fighter){
    for(const k of [-1,1]) {
      const pec=form(chest,"round",skin,[k*.084,.334,.085],[.194,.119,.128]);pec.rotation.z=k*.09;
    }
    art.loft(hip,pants,[[-.105,.171*broad,.126,0],[.055,.161*broad,.116,0],[.105,.154*broad,.112,0]]);
    art.loft(hip,"#e9e4d6",[[.067,.158*broad,.115,0],[.114,.157*broad,.114,0]]);
  }else{
    art.loft(hip,pants,[[-.115,waist*1.08,.128,0],[.075,waist,.118,0]]);
    if(role==="ruth"||role==="alan")form(chest,"flat",role==="alan"?"#ded9ca":"#48424a",[0,.29,.116],[.114,.30,.02]);
    if(role==="pavel"||role==="ed"||role==="ivo")form(chest,"box","#959697",[0,.25,.132],[.010,.36,.012]);
  }
  const neck=joint(chest,0,.477,0);
  const skullWidth=(role==="marek" ? .197 : .183)*broad;
  art.loft(neck,skin,[[.003,.052,.061,.015],[.035,skullWidth*.44,.081,.009],[.094,skullWidth*.52,.10,.002],[.152,skullWidth*.50,.103,-.004],[.20,skullWidth*.43,.087,-.005],[.23,.040,.048,0]],16);
  for(const k of [-1,1]){
    form(neck,"round",skin,[k*skullWidth*.50,.109,-.003],[.026,.06,.032]);
    form(neck,"round","#342d29",[k*.040,.128,.091],[.028,.010,.009]);
    const brow=form(neck,"box",hair,[k*.039,.146,.091],[.042,.009,.009]);brow.rotation.z=-k*.07;
  }
  form(neck,"flat",skin,[0,.105,.1],[.032,.048,.033]);
  const mouth=form(neck,"round","#764b40",[0,.065,.081],[.046,.007,.010]);
  if(role!=="daniel"){
    form(neck,"round",hair,[0,.192,-.008],[skullWidth*1.07,.105,.19]);
    if(role==="maya"){
      for(const k of [-1,1])form(neck,"round",hair,[k*.081,.121,-.012],[.060,.167,.16]);
      form(neck,"round",hair,[0,.119,-.061],[.188,.18,.091]);
    }
    if(role==="jo")form(neck,"round",hair,[0,.171,-.119],[.092,.092,.088]);
    if(role==="pavel")art.loft(neck,hair,[[.024,.059,.063,.013],[.050,.080,.083,.009],[.066,.082,.078,.002]]);
    if(role==="owen"||role==="ruth"){
      for(let i=0;i<15;i++){
        const angle=i*2.4;const ring=Math.sqrt(i/16);
        form(neck,"round",hair,[Math.cos(angle)*skullWidth*.43*ring,.229-.025*ring,Math.sin(angle)*.081*ring],[.050,.039,.054]);
      }
    }
  }
  if(role==="alan"){
    for(const k of [-1,1])form(neck,"box","#383e40",[k*.041,.129,.101],[.064,.038,.008]);
    form(neck,"box","#383e40",[0,.134,.102],[.06,.006,.006]);
  }
  const shoulders:THREE.Group[]=[],elbows:THREE.Group[]=[],hips:THREE.Group[]=[],knees:THREE.Group[]=[],feet:THREE.Object3D[]=[];
  for(const k of [-1,1]){
    const arm=joint(chest,k*.192*broad,.394,0), fore=joint(arm,0,-upper,0);
    shoulders.push(arm);elbows.push(fore);
    form(fore,"round",fighter||role==="daniel"?skin:sleeves,[0,0,0],[.099,.085,.098]);
    form(arm,"round",fighter?skin:sleeves,[0,-.035,0],[fighter ? .140 : .15,.145,.142]);
    art.loft(arm,fighter?skin:sleeves,[[-upper,.045,.050,0],[-upper*.62,.063,.061,0],[-upper*.27,.066,.070,0],[0,.060,.063,0]]);
    art.loft(fore,fighter||role==="daniel"?skin:sleeves,[[-lower,.038,.041,0],[-lower*.58,.050,.054,0],[-lower*.28,.058,.059,0],[0,.047,.050,0]]);
    if(fighter){
      form(fore,"flat",top,[0,-lower+.018,0],[.115,.095,.11]);
      form(fore,"round",top,[0,-lower-.062,.017],[.153,.173,.16]);
      form(fore,"round",top,[-k*.047,-lower-.034,.047],[.069,.091,.076]);
    }else{
      form(fore,"round",role==="daniel"?"#302e2c":skin,[0,-lower-.045,0],[.082,.116,.057]);
    }
    const leg=joint(hip,k*.092*broad,-.014,0),knee=joint(leg,0,-thigh,0);
    hips.push(leg);knees.push(knee);
    form(knee,"round",fighter?skin:pants,[0,-.006,0],[.112,.108,.115]);
    art.loft(leg,fighter?skin:pants,[[-thigh,.060,.062,0],[-thigh*.53,.078,.084,.008],[-.02,.088,.106,0]]);
    if(fighter)art.loft(leg,pants,[[-thigh*.45,.09,.104,.002],[-.025,.1,.113,0],[.006,.091,.106,0]]);
    art.loft(knee,fighter?skin:pants,[[-shin,.041,.047,0],[-shin*.60,.050,.058,-.010],[-shin*.34,.066,.076,-.018],[0,.057,.060,0]]);
    form(knee,"round",fighter?skin:"#313334",[0,-shin+.007,.048],[.108,.091,.22]);
    feet.push(joint(knee,0,-shin+.007,.048));
  }
  // Keep the mouth on its own transform so the wardrobe batching does not freeze speech.
  mouth.removeFromParent();
  for(const part of [hip,chest,neck,...shoulders,...elbows,...hips,...knees])art.batch(part);
  neck.add(mouth);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,30),new THREE.MeshBasicMaterial({color:"#191918",transparent:true,opacity:inRing ? .135 : .16,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;scene.add(shadow);

  // Articulate shared props and clap closure in chest coordinates. The elbow's outward pole
  // fixes the bend branch and keeps the cloth sleeve clear of the shirt.
  const down = new THREE.Vector3(0,-1,0);
  const target = new THREE.Vector3(), direction = new THREE.Vector3(), pole = new THREE.Vector3();
  const armRotation = new THREE.Quaternion(), foreRotation = new THREE.Quaternion();
  const jointPosition = new THREE.Vector3(), foreDirection = new THREE.Vector3();
  function reachPair(
    proximal:THREE.Object3D, distal:THREE.Object3D,
    a:number, b:number, goal:THREE.Vector3, weight:number, bend:THREE.Vector3,
  ):void {
    direction.subVectors(goal,proximal.position);
    const length=THREE.MathUtils.clamp(direction.length(),Math.abs(a-b)+.002,a+b-.002);
    direction.normalize();
    pole.copy(bend).addScaledVector(direction,-bend.dot(direction)).normalize();
    const along=(a*a-b*b+length*length)/(2*length);
    const cross=Math.sqrt(Math.max(0,a*a-along*along));
    jointPosition.copy(direction).multiplyScalar(along).addScaledVector(pole,cross);
    armRotation.setFromUnitVectors(down,jointPosition.normalize());
    jointPosition.multiplyScalar(a);
    foreDirection.copy(direction).multiplyScalar(length).sub(jointPosition).normalize();
    foreRotation.setFromUnitVectors(down,foreDirection).premultiply(inverse.copy(armRotation).invert());
    proximal.quaternion.slerp(armRotation,weight);
    distal.quaternion.slerp(foreRotation,weight);
  }
  const bend = new THREE.Vector3(), inverse = new THREE.Quaternion();
  function reachHand(i:number, goal:THREE.Vector3, weight:number):void {
    reachPair(shoulders[i]!,elbows[i]!,upper,lower+(fighter ? .062 : .045),goal,weight,bend.set(i===0?-1:1,-.45,.15));
  }
  function lowestOn(object:THREE.Object3D,x:number,y:number,z:number):number {
    const m=object.matrixWorld.elements;
    return m[13]!-Math.hypot(m[1]!*x,m[5]!*y,m[9]!*z);
  }
  function standingFootHeight(): number {
    root.updateMatrixWorld(true);
    return Math.min(...feet.map((foot)=>lowestOn(foot,.054,.0455,.11)));
  }

  const landingMeshes: THREE.Mesh[] = [];
  if (role === "marek") {
    root.traverse((child) => { if (child instanceof THREE.Mesh) landingMeshes.push(child); });
  }
  const shadowHead = new THREE.Vector3();
  const shadowFeet = new THREE.Vector3();
  const shadowFoot = new THREE.Vector3();

  // A linear height function reaches its minimum on one of the drawn vertices.
  function landingHeight(): number {
    root.updateMatrixWorld(true);
    let lowest = Number.POSITIVE_INFINITY;
    for (const mesh of landingMeshes) {
      const vertex = mesh.geometry.getAttribute("position");
      const world = mesh.matrixWorld.elements;
      for (let index = 0; index < vertex.count; index++) {
        const height = world[13]! + world[1]! * vertex.getX(index)
          + world[5]! * vertex.getY(index) + world[9]! * vertex.getZ(index);
        lowest = Math.min(lowest, height);
      }
    }
    return lowest;
  }

  function apply(p:ActorPose,time:number){
    const breath=Math.sin(time*(fighter?2.7:1.8)+role.length)*.009;
    const crouch=THREE.MathUtils.clamp(p.kneel,0,1);
    const ground=inRing?0:-APRON_HEIGHT;
    root.position.set(p.x,ground,p.z);root.rotation.y=p.yaw;
    root.scale.setScalar(scale);
    const legBend=.10+crouch*1.3;
    const restHeight=thigh+shin+.068;
    const roll=Math.min(1,Math.abs(p.roll)/1.52);
    const standingHeight=restHeight-(1-Math.cos(legBend))*thigh-.022*crouch;
    hip.position.set(0,Math.max(.11,standingHeight*(1-roll)+.14*roll+p.y),0);
    hip.rotation.set(p.lean*.25,0,p.roll);
    chest.rotation.set(p.lean*.75+breath,0,p.chestRoll??0);
    chest.scale.set(1+breath*.16,1+breath*.065,1+breath);
    neck.rotation.set(-p.lean*.38+breath*.5+(p.headPitch ?? 0),p.head,0);
    const spoken=role==="daniel"?roundClock.lines.find(([start,duration])=>time>=start&&time<start+duration):undefined;
    const speech=spoken?Math.min(1,(time-spoken[0])*18,(spoken[0]+spoken[1]-time)*18)*Math.abs(Math.sin((time-spoken[0])*25)):0;
    mouth.scale.y=.007+.021*speech;
    for(let i=0;i<2;i++){
      const side=i===0?-1:1, ca=p.clap;
      shoulders[i]!.rotation.order="YXZ";shoulders[i]!.rotation.set(-p.arms[i]!, -side*ca*.46,side*(p.reach[i]!*.73+.11)*(1-ca)-side*ca*.22);
      elbows[i]!.rotation.set(-p.elbow[i]!,0,0);
      hips[i]!.rotation.set(-p.legs[i]!-legBend,0,side*.075);
      knees[i]!.rotation.set(legBend+Math.max(.035,Math.max(p.legs[i]!,0)*.88)+crouch*.10,0,0);
    }
    if(fighter&&roll<.68) hip.position.y-=(standingFootHeight()-ground)*(1-THREE.MathUtils.smoothstep(roll,.24,.68))/scale;
    if(p.nativeTravel){
      const {weight,pelvis,knees: nativeKnees,ankles}=p.nativeTravel;
      hip.position.y=THREE.MathUtils.lerp(hip.position.y,(pelvis-ground)/scale,weight);
      for(const side of [0,1] as const){
        target.fromArray(ankles[side]);
        hip.worldToLocal(target);
        bend.fromArray(nativeKnees[side]);
        hip.worldToLocal(bend).sub(hips[side]!.position);
        reachPair(hips[side]!,knees[side]!,thigh,shin,target,weight,bend);
      }
    }
    const falling = role === "marek" && time > 150.26;
    if (falling) {
      const touch = roundClock.canvasTouch;
      const resting = THREE.MathUtils.smoothstep(time, 150.86, 151.47);
      const sittingUp = THREE.MathUtils.clamp((Math.abs(p.chestRoll ?? 0) - .08) / .44, 0, 1);
      neck.rotation.z = .51 * resting * (1 - sittingUp);
      const enter = THREE.MathUtils.smoothstep(time, 150.34, touch - .035);
      const leave = 1 - THREE.MathUtils.smoothstep(time, touch + .025, 151.03);
      const fold = enter * leave;
      hips[0]!.rotation.z -= .62 * fold;
      knees[0]!.rotation.z += .64 * fold;
      knees[0]!.rotation.x += .25 * fold;
    }
    if(p.clap>0){
      const height=p.clapHeight ?? .365;
      reachHand(0,target.set(-.038,height,.431),p.clap);
      reachHand(1,target.set(.038,height,.431),p.clap);
    }
    if(p.nativeHands){
      for(const side of [0,1] as const){
        const goal=p.nativeHands[side];
        const weight = p.nativeHandWeights?.[side] ?? 1;
        if (goal && weight > 0) reachHand(side, target.fromArray(goal), weight);
      }
    }
    if (p.handTarget) {
      target.fromArray(p.handTarget.world);
      chest.worldToLocal(target);
      reachHand(p.handTarget.side,target,p.handTarget.weight);
    }
    if(p.footTarget){
      const {side,world,weight}=p.footTarget;
      target.fromArray(world);
      hip.worldToLocal(target);
      reachPair(hips[side]!,knees[side]!,thigh,shin,target,weight,bend.set(.09,-.33,.53));
    }
    shadow.position.set(p.x,ground+.009,p.z);
    shadow.rotation.z = 0;
    shadow.scale.set(.36+.42*roll,.24+.12*roll,1);
    shadow.material.opacity = inRing ? .135 : .16;
    if (falling) {
      const aboveCanvas = landingHeight() - CANVAS_WORLD_Y;
      const contact = THREE.MathUtils.smoothstep(time, 150.36, 150.60);
      const clearance = .16 * Math.max(0, (roundClock.canvasTouch - time) / .39);
      hip.position.y += Math.max(-aboveCanvas, (clearance - aboveCanvas) * contact) / scale;
      root.updateMatrixWorld(true);
      const shadowBlend = THREE.MathUtils.smoothstep(time, 150.56, 151.21);
      neck.getWorldPosition(shadowHead);
      feet[0]!.getWorldPosition(shadowFeet).lerp(feet[1]!.getWorldPosition(shadowFoot), .5);
      const dx = shadowHead.x - shadowFeet.x;
      const dz = shadowHead.z - shadowFeet.z;
      shadow.position.x = THREE.MathUtils.lerp(p.x, (shadowHead.x + shadowFeet.x) * .5, shadowBlend);
      shadow.position.z = THREE.MathUtils.lerp(p.z, (shadowHead.z + shadowFeet.z) * .5, shadowBlend);
      shadow.rotation.z = Math.atan2(-dz, dx) * shadowBlend;
      shadow.scale.x = THREE.MathUtils.lerp(shadow.scale.x, Math.hypot(dx, dz) * .55 + .16, shadowBlend);
      shadow.scale.y = THREE.MathUtils.lerp(shadow.scale.y, .25, shadowBlend);
      shadow.material.opacity = THREE.MathUtils.lerp(.135, .235, shadowBlend);
    }
  }
  const handPoint = (side: 0 | 1, into: THREE.Vector3) =>
    elbows[side]!.localToWorld(into.set(0, -lower - .045, 0));
  return {root,canonical,apply,handPoint,dispose:()=>{shadow.geometry.dispose();(shadow.material as THREE.Material).dispose();}};
}
