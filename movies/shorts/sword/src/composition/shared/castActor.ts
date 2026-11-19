import { AutoMovieHumanCanonicalBody } from "@automovie/human";
import type { AutoMovieHumanoidBone } from "@automovie/interface";
import { buildHumanPolygon } from "@automovie/render";
import * as THREE from "three";
import type { nativeStageMotion } from "./nativeStageMotion";
import { wardrobeBody } from "./wardrobeBody";

type Point = readonly [number, number, number];
export interface CastStyle {
  name: string; height: number; tunic: number; hair: number; skin: number;
  legs?: number; boots?: number; hood?: number; helmet?: boolean; beard?: number;
}
export interface ActorPose {
  walk?: number; stride?: number; crouch?: number; lean?: number; headYaw?: number; headPitch?: number;
  leftArm?: Point; rightArm?: Point; leftLeg?: Point; rightLeg?: Point;
  /** Admitted floor-frame targets for the unpinned lower body. */
  nativeLegs?: nativeStageMotion.Sample;
  /** Admitted targets for the arms when stage contact has not pinned a wrist. */
  nativeArms?: nativeStageMotion.Sample;
}
export interface CastActor {
  root: THREE.Group; torso: THREE.Group; head: THREE.Group; leftHand: THREE.Group; rightHand: THREE.Group;
  leftFoot: THREE.Group; rightFoot: THREE.Group; pose(state: ActorPose): void;
}
const v = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const body = AutoMovieHumanCanonicalBody.prepare(wardrobeBody,{id:"Savoy wardrobe block",mass:72});
const joints = new Map(body.joints.map(b=>[b.bone,v(...b.position)]));
const drawing = buildHumanPolygon(AutoMovieHumanCanonicalBody.display(body));
const toStage = new THREE.Matrix4().set(0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1);
const source = new Map<string,THREE.BufferGeometry>();
for(const [name,part] of drawing.parts) {
  const geometry=part.geometry.index ? part.geometry.toNonIndexed() : part.geometry.clone();
  geometry.applyMatrix4(toStage);
  const pos=geometry.getAttribute("position");
  for(let i=0;i<pos.count;i+=3) {
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    pos.setXYZ(i,pos.getX(i+1),pos.getY(i+1),pos.getZ(i+1));
    pos.setXYZ(i+1,x,y,z);
  }
  geometry.computeVertexNormals();source.set(name,geometry);
}
drawing.dispose();

/** Dresses a polygon Human in the actor's local ground frame, facing +Z.
 * Hand targets are palm centres. Foot targets are ankle centres in metres.
 * Attach props to the returned endpoints; their transforms survive every seek. */
export function castActor(style:CastStyle):CastActor {
  const root=new THREE.Group();root.name=style.name;
  const k=style.height/1.75581;
  const joint=(s:string)=>joints.get(s)!.clone().multiplyScalar(k);
  const color=(n:number)=>new THREE.MeshStandardMaterial({color:n,roughness:.88,flatShading:true});
  const mats=new Map<number,THREE.Material>();
  const mat=(n:number)=>{if(!mats.has(n))mats.set(n,color(n));return mats.get(n)!;};
  function add(parent:THREE.Object3D,g:THREE.BufferGeometry,n:number,x=0,y=0,z=0) {
    const m=new THREE.Mesh(g,mat(n));parent.add(m);m.position.set(x,y,z);return m;
  }
  function oval(parent:THREE.Object3D,n:number,x:number,y:number,z:number,w:number,h:number,d:number) {
    const m=add(parent,new THREE.SphereGeometry(1,12,8),n,x*k,y*k,z*k);
    m.scale.set(w*k,h*k,d*k);return m;
  }
  function tube(parent:THREE.Object3D,n:number,x:number,y:number,z:number,a:number,b:number,h:number,d:number) {
    const m=add(parent,new THREE.CylinderGeometry(a*k,b*k,h*k,14),n,x*k,y*k,z*k);
    m.scale.z=d;return m;
  }
  const torso=new THREE.Group();root.add(torso);
  const bone=(name:string,n:number,parent:THREE.Group) => {
    const g=source.get(name); if(!g)throw new Error("Missing Human polygon "+name);
    const m=add(parent,g,n);m.scale.setScalar(k);m.position.copy(joint(name));return m;
  };
  for(const name of ["hips","spine","chest"])bone(name,style.tunic,torso);
  tube(torso,style.tunic,0,1.015,.026,.167,.235,.34,.70);
  tube(torso,0x4b3228,0,1.105,.024,.180,.182,.055,.72);
  oval(torso,0xb99b60,.025,1.104,.16,.033,.027,.013);
  tube(torso,style.hood??style.tunic,0,1.407,.025,.116,.168,.105,.85);
  const head=new THREE.Group();root.add(head);
  oval(head,style.skin,0,-.048,.028,.112,.148,.104);
  oval(head,style.skin,0,-.048,.126,.026,.045,.038);
  for(const s of [-1,1]){
    oval(head,style.skin,s*.106,-.045,.025,.025,.041,.024);
    oval(head,0x3b3029,s*.044,-.019,.121,.012,.008,.006);
    oval(head,style.hair,s*.044,-.002,.117,.033,.009,.009);
  }
  oval(head,0x945e4e,0,-.103,.116,.032,.006,.005);
  oval(head,style.hair,0,.048,.008,.118,.085,.107);
  for(const s of [-1,1])oval(head,style.hair,s*.092,-.008,.008,.033,.084,.059);
  if(style.beard!==undefined) {
    oval(head,style.beard,0,-.116,.052,.098,.075,.085);
    oval(head,style.beard,-.032,-.079,.119,.046,.018,.019);
    oval(head,style.beard,.032,-.079,.119,.046,.018,.019);
  }
  if(style.hood!==undefined) {
    oval(head,style.hood,0,.043,-.013,.13,.103,.122);
    for(const s of [-1,1])oval(head,style.hood,s*.107,-.018,-.01,.042,.098,.087);
  }
  if(style.helmet) {
    oval(head,0x7f8e90,0,.057,.001,.142,.121,.135);
    oval(head,0xb2b9b0,0,.06,.02,.019,.123,.12);
    for(const s of [-1,1]){
      const cheek=oval(head,0x8d9999,s*.102,-.049,.074,.04,.116,.062);
      cheek.rotation.z=s*-.10;
      oval(head,0xa5ada7,s*.075,.018,.111,.064,.023,.03);
    }
  }
  const hand=(sign:number)=>{
    const g=new THREE.Group();root.add(g);oval(g,style.skin,0,0,0,.038,.059,.027);
    oval(g,style.skin,-sign*.027,.014,.02,.019,.031,.017);return g;
  };
  const foot=()=>{const g=new THREE.Group();root.add(g);
    oval(g,style.boots??0x4d3930,0,-.020,.048,.069,.053,.132);
    tube(g,style.boots??0x4d3930,0,.035,.003,.068,.074,.125,.84);return g;};
  const leftHand=hand(1),rightHand=hand(-1),leftFoot=foot(),rightFoot=foot();
  function chain(side:string,arm:boolean) {
    const first=side+(arm?"UpperArm":"UpperLeg"),middle=side+(arm?"LowerArm":"LowerLeg"),last=side+(arm?"Hand":"Foot");
    const a=joint(first),b=joint(middle),c=joint(last),ab=b.clone().sub(a),bc=c.clone().sub(b);
    const upper=bone(first,arm?style.tunic:(style.legs??0x53453e),root);
    const lower=bone(middle,arm?style.tunic:(style.legs??0x53453e),root);
    const marker=arm?(side==="left"?leftHand:rightHand):(side==="left"?leftFoot:rightFoot);
    const sign=side==="left"?1:-1;
    const show = (top:THREE.Vector3,bend:THREE.Vector3,target:THREE.Vector3):void => {
      upper.position.copy(top);lower.position.copy(bend);
      upper.quaternion.setFromUnitVectors(ab.clone().normalize(),bend.clone().sub(top).normalize());
      const dest=target.clone().sub(bend);
      lower.quaternion.setFromUnitVectors(bc.clone().normalize(),dest.clone().normalize());
      lower.scale.setScalar(k*dest.length()/bc.length());
      marker.position.copy(target);
    };
    return (top:THREE.Vector3,target:THREE.Vector3,native?:nativeStageMotion.Sample):void=>{
      if(native!==undefined) {
        const a=native.points.get(first as AutoMovieHumanoidBone)!;
        const b=native.points.get(middle as AutoMovieHumanoidBone)!;
        const c=native.points.get(last as AutoMovieHumanoidBone)!;
        show(v(...a),v(...b),v(...c));
        return;
      }
      const dir=target.clone().sub(top);const distance=Math.max(.001,dir.length());dir.normalize();
      const l=ab.length(),r=bc.length();
      const d=Math.min(l+r-.0001,distance),along=(d*d+l*l-r*r)/(2*d);
      const offset=arm?v(.3*sign,-.3,-1):v(0,.01,1);
      offset.addScaledVector(dir,-offset.dot(dir)).normalize();
      const bend=top.clone().addScaledVector(dir,along).addScaledVector(offset,Math.sqrt(Math.max(0,l*l-along*along)));
      show(top,bend,target);
    };
  }
  const arms=[chain("left",true),chain("right",true)],legs=[chain("left",false),chain("right",false)];
  function pose(p:ActorPose) {
    const phase=p.walk??0,stride=p.stride??0,crouch=p.crouch??0,lean=p.lean??0;
    const bob=Math.abs(Math.sin(phase))*stride*.026*k;
    const nativeHip=p.nativeLegs?.points.get("hips");
    torso.position.set(0,nativeHip===undefined?bob-crouch:nativeHip[1]-joint("hips").y,0);torso.rotation.x=lean;
    const transform=(a:THREE.Vector3)=>a.applyQuaternion(torso.quaternion).add(torso.position);
    head.position.copy(transform(joint("head")));head.rotation.set((p.headPitch??0)+lean,p.headYaw??0,0,"YXZ");
    for(const [i,s] of [1,-1].entries()){
      const side=s===1?"left":"right",a=p[side==="left"?"leftArm":"rightArm"],l=p[side==="left"?"leftLeg":"rightLeg"];
      const swing=Math.sin(phase)*s*stride;
      const armTarget=a?v(...a):v(s*.222*k,(.886+.045*Math.abs(swing))*k-crouch+bob,(.112-.20*swing)*k);
      const footTarget=l?v(...l):v(s*.106*k,(.075+Math.max(0,Math.cos(phase)*s)*stride*.085)*k,(.033+.23*swing)*k);
      arms[i]!(transform(joint(side+"UpperArm")),armTarget,a===undefined?p.nativeArms:undefined);
      legs[i]!(transform(joint(side+"UpperLeg")),footTarget,l===undefined?p.nativeLegs:undefined);
    }
  }
  pose({});return {root,torso,head,leftHand,rightHand,leftFoot,rightFoot,pose};
}
