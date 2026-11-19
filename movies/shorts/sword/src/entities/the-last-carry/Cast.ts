import * as THREE from "three";
import { carryHandGeometry } from "./CarryHand";
import { carryNativeMotion } from "./CarryNativeMotion";
import { cloth, mesh, oval, paint, type CarryRole, type Ring } from "./CarrySculpture";
import { castWardrobe, dress } from "./CarryWardrobe";

export type { CarryRole } from "./CarrySculpture";

export interface CarryPose {
  stride: number;
  walk: number;
  lean: number;
  turn: number;
  lookDown?: number;
  speech?: number;
  pinchLeft?: number;
  pinchRight?: number;
  leftPinchPoint?: THREE.Vector3;
  rightPinchPoint?: THREE.Vector3;
  leftHand?: THREE.Vector3;
  rightHand?: THREE.Vector3;
  load?: { side: -1 | 1; underside: number; share: number };
}

const up = new THREE.Vector3(0,1,0);
const vector = (x:number,y:number,z:number) => new THREE.Vector3(x,y,z);

/** A small stage contact shade lets the standard draw show which boot carries weight. */
function bootShade(): THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial> {
  const side=32;
  const harmonics=new Uint8Array(side*side*4);
  for(let y=0;y<side;y++)for(let x=0;x<side;x++){
    const radius=Math.hypot((2*x-side+1)/side,(2*y-side+1)/side);
    harmonics.fill(Math.round(255*Math.max(0,1-radius)**2),(y*side+x)*4,(y*side+x)*4+4);
  }
  const mask=new THREE.DataTexture(harmonics,side,side);
  mask.magFilter=mask.minFilter=THREE.LinearFilter;
  mask.needsUpdate=true;
  const material=new THREE.MeshBasicMaterial({
    color:0x2a211b,alphaMap:mask,transparent:true,depthWrite:false,
    polygonOffset:true,polygonOffsetFactor:-1,
  });
  const shade=new THREE.Mesh(new THREE.PlaneGeometry(.225,.32),material);
  shade.rotation.x=-Math.PI/2;
  return shade;
}

/** A cut sleeve or hose measured down the bone, with the cuff fitted independently. */
function segment(root:THREE.Group,rings:Ring[],color:number,cuff?:number):THREE.Group {
  const part=new THREE.Group();
  root.add(part);
  cloth(part,rings,color,8,24);
  if(cuff!==undefined){
    const [top,w,d]=rings[rings.length-1]!;
    cloth(part,[[top-.025,w*1.025,d*1.025],[top+.002,w*1.031,d*1.031]],cuff,8,24);
  }
  return part;
}

/** The two lengths fix the elbow or knee circle; the bend vector chooses its plane. */
function solve(start:THREE.Vector3,goal:THREE.Vector3,bend:THREE.Vector3,first:number,second:number):[THREE.Vector3,THREE.Vector3] {
  const line=goal.clone().sub(start), length=Math.max(.001,line.length());
  line.multiplyScalar(1/length);
  const reach=THREE.MathUtils.clamp(length,Math.abs(first-second)+.001,first+second-.001);
  const parallel=(first*first-second*second+reach*reach)/(2*reach);
  const normal=bend.clone().addScaledVector(line,-bend.dot(line)).normalize();
  const joint=start.clone().addScaledVector(line,parallel).addScaledVector(normal,Math.sqrt(Math.max(0,first*first-parallel*parallel)));
  return [joint,start.clone().addScaledVector(line,reach)];
}

function place(segment:THREE.Group,start:THREE.Vector3,end:THREE.Vector3):void {
  segment.position.copy(start);
  segment.quaternion.setFromUnitVectors(up,end.clone().sub(start).normalize());
}

/** A clothed canonical Human retarget in metres, feet at zero, +Y up and +Z forward. */
export function createCarryActor(role: CarryRole, seconds: () => number) {
  const root=new THREE.Group(), trunk=new THREE.Group(), body=new THREE.Group(), head=new THREE.Group();
  root.name=role;
  root.add(trunk);
  trunk.add(body);
  body.add(head);
  head.name="head";
  const p=castWardrobe[role];
  const motion=carryNativeMotion(role,p.h);
  root.userData.nativeMotion=motion.evidence();
  const pelvis=p.h*.56;
  body.position.y=-pelvis;
  dress(body,head,role);
  if(role==="denis"){
    const coatShoulder=new THREE.Object3D();
    coatShoulder.name="right-coat-shoulder";
    coatShoulder.position.set(-.148,p.h-.032,-.119);
    body.add(coatShoulder);
  }
  const handGeometry=carryHandGeometry();
  const sideParts=[-1,1].map(side=>{
    const upperArm=p.h*.415*motion.armRatio, lowerArm=p.h*.415*(1-motion.armRatio);
    const upperLeg=(pelvis-.086)*1.02*motion.legRatio, lowerLeg=(pelvis-.086)*1.02*(1-motion.legRatio);
    const sleeveWidth=p.w*.156;
    const upper=segment(root,[[0,sleeveWidth*.8,sleeveWidth*.84],[.026,sleeveWidth*1.18,sleeveWidth*1.12],[upperArm*.30,sleeveWidth*1.08,sleeveWidth*1.05],[upperArm*.72,sleeveWidth*.87,sleeveWidth*.91],[upperArm+.018,sleeveWidth*.8,sleeveWidth*.78]],p.coat);
    oval(upper,p.coat,0,.024,0,sleeveWidth*1.13,sleeveWidth*.72,sleeveWidth*1.10);
    const fore=segment(root,[[-.025,sleeveWidth*.76,sleeveWidth*.77],[.018,sleeveWidth*.85,sleeveWidth*.81],[lowerArm*.39,sleeveWidth*.82,sleeveWidth*.77],[lowerArm-.045,.037,.035],[lowerArm-.035,.036,.034]],p.coat,role==="gate-woman"?p.trim:0xad9d83);
    oval(fore,p.coat,0,0,0,sleeveWidth*.8,sleeveWidth*.8,sleeveWidth*.79);
    const hand=new THREE.Group();
    hand.name=side===1?"left-hand":"right-hand";
    const skin=mesh(hand,handGeometry,paint(p.skin));
    skin.scale.x=side;
    const marker=new THREE.Object3D();
    marker.name=side===-1?"right-pinch":"left-pinch";
    marker.position.set(side*.040,.067,.014);
    hand.add(marker);
    root.add(hand);
    const thigh=segment(root,[[0,.086,.089],[upperLeg*.26,.092,.089],[upperLeg*.76,.069,.071],[upperLeg+.025,.054,.058]],p.hose);
    const shin=segment(root,[[-.025,.052,.058],[.020,.054,.063],[lowerLeg*.33,.064,.067],[lowerLeg*.63,.050,.048],[lowerLeg,.036,.038]],p.hose);
    const boot=new THREE.Group();
    boot.name=side===1?"left-boot":"right-boot";
    const shade=bootShade();
    root.add(boot,shade);
    oval(boot,p.hide,0,-.035,.035,.051,.046,.102);
    oval(boot,p.hide,0,-.053,.093,.050,.030,.068);
    oval(boot,0x33291f,0,-.071,.048,.053,.015,.118);
    cloth(boot,[[-.055,.049,.065,.022],[.007,.045,.058],[.075,.044,.047],[.106,.049,.052]],p.hide,5,24);
    return {side,skin,upper,fore,hand,marker,thigh,shin,boot,shade,upperArm,lowerArm,upperLeg,lowerLeg};
  });
  const faceSkin=head.getObjectByName("face-skin") as THREE.Mesh | undefined;
  const mouth=head.getObjectByName("mouth");
  function pose({stride,walk,lean,turn,lookDown=0,speech=0,pinchLeft=0,pinchRight=0,leftPinchPoint,rightPinchPoint,leftHand,rightHand,load}:CarryPose):void {
    const opening=THREE.MathUtils.clamp(speech,0,1);
    if(faceSkin?.morphTargetInfluences)faceSkin.morphTargetInfluences[0]=opening;
    if(mouth){mouth.visible=opening>.08;mouth.scale.y=.001+.0038*opening;}
    const stage=motion.frame(seconds(),stride,walk);
    const hip=stage.travelling.points.get("hips")!;
    const restHip=motion.rest.points.get("hips")!;
    const rise=THREE.MathUtils.clamp(hip[1]-restHip[1],-.040,.030)*walk;
    const sway=THREE.MathUtils.clamp(hip[0]-restHip[0],-.035,.035)*walk;
    const trunkPitch=lean+stage.breath.x*.75+stage.step.x*.32*walk;
    trunk.rotation.set(trunkPitch,stage.step.y*.4*walk,stage.step.z*.65*walk,"YXZ");
    const unloadedY=pelvis+rise;
    let loadedY=unloadedY;
    if(load && load.share>0){
      const shoulder=vector(load.side*p.w/2,p.h-pelvis,.0).applyQuaternion(trunk.quaternion);
      const surface=unloadedY+shoulder.y+.043*root.scale.y;
      loadedY+=THREE.MathUtils.clamp(load.underside-surface,-.17,.055)*load.share;
    }
    trunk.position.set(sway,loadedY,0);
    head.rotation.set(-lean*.40+lookDown+(stage.assent?.x??0),turn,-stage.step.z*.33*walk,"YXZ");
    trunk.updateMatrix();
    for(const {side,skin,upper,fore,hand,marker,thigh,shin,boot,shade,upperArm,lowerArm,upperLeg,lowerLeg} of sideParts){
      const shoulder=vector(side*p.w/2,p.h-pelvis,.0).applyMatrix4(trunk.matrix);
      const goal=side===1?leftHand:rightHand;
      const pinch=THREE.MathUtils.clamp(side===1?pinchLeft:pinchRight,0,1);
      if(skin.morphTargetInfluences)skin.morphTargetInfluences[0]=pinch;
      const nativeHand=side===1?stage.travelling.leftHand:stage.travelling.rightHand;
      const restHand=side===1?motion.rest.leftHand:motion.rest.rightHand;
      const target=(goal??vector(
        side*(p.w/2+.046)+sway+(nativeHand[0]-restHand[0])*walk*.55,
        p.h-upperArm-lowerArm+.028+rise+(nativeHand[1]-restHand[1])*walk*.55,
        .036+(nativeHand[2]-restHand[2])*walk*.62,
      )).clone();
      if(side===1 && stage.feel){
        const contact=stage.feel.leftHand;
        const native=vector(side*(p.w/2+.046)+(contact[0]-restHand[0]),
          p.h-upperArm-lowerArm+.028+contact[1]-restHand[1],.036+contact[2]-restHand[2]);
        const markedCoat=THREE.MathUtils.smoothstep(seconds(),55.25,55.54)
          -THREE.MathUtils.smoothstep(seconds(),55.91,56.22);
        target.lerp(native,.66-.52*markedCoat);
      }
      const namedContact=side===1?leftPinchPoint:rightPinchPoint;
      const bend=role==="colin" && side===-1 && namedContact
        ? vector(.92,-.28,-.43) : vector(side*.5,-.15,-.88);
      const orientation=(elbow:THREE.Vector3,palm:THREE.Vector3):void=>{
        const fingertips=palm.clone().sub(elbow).normalize();
        hand.quaternion.setFromUnitVectors(up,fingertips);
        hand.rotateY(side*1.03);
      };
      let [elbow,palm]=solve(shoulder,target,bend,upperArm,lowerArm);
      if(namedContact){
        for(let i=0;i<4;i++){
          orientation(elbow,palm);
          const contact=marker.position.clone().applyQuaternion(hand.quaternion).add(palm);
          target.addScaledVector(namedContact.clone().sub(contact),.72);
          [elbow,palm]=solve(shoulder,target,bend,upperArm,lowerArm);
        }
      }
      place(upper,shoulder,elbow);
      place(fore,elbow,palm);
      hand.position.copy(palm);
      orientation(elbow,palm);
      const hipJoint=vector(side*.093+sway,loadedY,-.012);
      const nativeFoot=side===1?stage.travelling.leftFoot:stage.travelling.rightFoot;
      const restFoot=side===1?motion.rest.leftFoot:motion.rest.rightFoot;
      const foot=vector(side*.10+(nativeFoot[0]-restFoot[0])*walk*.62,
        .086+Math.max(0,nativeFoot[1]-restFoot[1])*walk,
        (nativeFoot[2]-restFoot[2])*walk);
      const nativeKnee=stage.travelling.points.get(side===1?"leftLowerLeg":"rightLowerLeg")!;
      const kneePlane=vector(nativeKnee[0]-nativeFoot[0],0,Math.max(.08,nativeKnee[2]-nativeFoot[2]));
      const [knee,ankle]=solve(hipJoint,foot,kneePlane,upperLeg,lowerLeg);
      place(thigh,hipJoint,knee);
      place(shin,knee,ankle);
      boot.position.copy(ankle);
      const toes=stage.travelling.points.get(side===1?"leftToes":"rightToes");
      const restToes=motion.rest.points.get(side===1?"leftToes":"rightToes");
      const tilt=toes && restToes ? Math.atan2(nativeFoot[1]-toes[1],toes[2]-nativeFoot[2])
        -Math.atan2(restFoot[1]-restToes[1],restToes[2]-restFoot[2]):0;
      boot.rotation.x=THREE.MathUtils.clamp(tilt,-.24,.27)*walk;
      shade.position.set(ankle.x,-.006,ankle.z+.045);
      shade.material.opacity=.41*(1-THREE.MathUtils.smoothstep(ankle.y,.079,.205));
    }
    root.userData.nativeSample={
      clock: seconds(), travel: stage.travelling.position.z,
      leftFoot: stage.travelling.leftFoot, rightFoot: stage.travelling.rightFoot,
      chest: stage.breath.x, nod: stage.assent?.x, touch: stage.feel?.leftHand,
    };
  }
  pose({stride:0,walk:0,lean:0,turn:0});
  return {root,pose,shoulderHeight:p.h,shoulderWidth:p.w};
}
