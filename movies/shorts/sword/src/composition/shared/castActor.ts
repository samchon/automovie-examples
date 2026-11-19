import { AutoMovieHumanCanonicalBody } from "@automovie/human";
import type { AutoMovieHumanoidBone } from "@automovie/interface";
import { buildHumanPolygon } from "@automovie/render";
import * as THREE from "three";
import type { nativeStageMotion } from "./nativeStageMotion";
import { wardrobeBody } from "./wardrobeBody";

type Point = readonly [number, number, number];

/**
 * Character scale and wardrobe for one cast figure. Stature is in metres and
 * palette entries are hexadecimal RGB numbers. A hood and helmet can coexist.
 *
 * @evidence contracts/development/design.md#principled-representation Required height and palette establish a complete base actor. Optional overlays adjust that wardrobe. Finite positive stature and valid palette numbers are authoring requirements.
 * @evidence contracts/development/design.md#minimal-and-owned-surface The shared wardrobe builder reads every field for the recognizable cast in the productions that use it. The scene supplies the name, stature and colors.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts Overlay flags and palette choices are independent visual layers, including a hood under a helmet. Required palette and name fields carry their concrete meanings.
 * @evidence contracts/development/common.md#meaningful-documentation The comment and fields identify metres, RGB colors, defaults and overlay scope.
 */
export interface CastStyle {
  /** Display name on the returned scene group. */
  name: string;

  /** Standing stature in metres. */
  height: number;

  /** Palette for the torso and sleeves. */
  tunic: number;

  /** Palette for hair and eyebrows. */
  hair: number;

  /** Palette for face and hands. */
  skin: number;

  /** Leg palette, with a shared brown default. */
  legs?: number;

  /** Boot palette, with a shared dark brown default. */
  boots?: number;

  /** Hood palette. Omitting it retains a collar in the tunic color. */
  hood?: number;

  /** Draw the shared helmet overlay when true. */
  helmet?: boolean;

  /** Draw the beard overlay in this color when supplied. */
  beard?: number;
}

/**
 * One stateless pose request. An omitted scalar takes its resting value of zero.
 * Explicit limb targets take precedence over native samples on their own sides.
 *
 * @evidence contracts/development/design.md#principled-representation Angles are radians, crouch and endpoint coordinates are metres, and stride is a dimensionless amplitude. A three-number tuple fixes endpoint order and size. Scene authors supply finite values and a compatible native sample.
 * @evidence contracts/development/design.md#minimal-and-owned-surface This is the shared wardrobe actor's pose input. Scene code sets placement on the root separately and uses the optional fields to combine poses, aim and contacts.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts Optional values describe independent controls with a defined order when they interact. A native limb sample and a pin can coexist because the pin affects only its side.
 * @evidence contracts/development/common.md#meaningful-documentation The comment and fields state defaults, units, coordinate frame, the hand and boot origins and the priority of native samples and pins.
 */
export interface ActorPose {
  /** Phase of the authored arm and boot swing, in radians. */
  walk?: number;

  /** Dimensionless amplitude of that swing. */
  stride?: number;

  /** Downward torso offset in metres when a native pelvis is absent. */
  crouch?: number;

  /** Forward torso pitch in radians, also added to head pitch. */
  lean?: number;

  /** Head turn around local up, in radians. */
  headYaw?: number;

  /** Head pitch in radians before the torso pitch is added. */
  headPitch?: number;

  /** Left palm center in the root's ground-relative local XYZ metres. */
  leftArm?: Point;

  /** Right palm center in the root's ground-relative local XYZ metres. */
  rightArm?: Point;

  /** Left ankle center in the root's ground-relative local XYZ metres. */
  leftLeg?: Point;

  /** Right ankle center in the root's ground-relative local XYZ metres. */
  rightLeg?: Point;

  /** Admitted floor-frame targets for the unpinned lower body. */
  nativeLegs?: nativeStageMotion.Sample;

  /** Admitted targets for the arms when stage contact has not pinned a wrist. */
  nativeArms?: nativeStageMotion.Sample;
}

/**
 * Three.js groups for one wardrobe actor and a synchronous pose setter.
 * Attachment groups keep their identity while the scene seeks.
 *
 * @evidence contracts/development/design.md#principled-representation Each required Three.js group exposes a real transform. A separate pose setter consumes a complete request and overwrites local pose state without requiring a previous sample.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Scene code places the root and attaches head, torso, hand and foot details to their moving groups. Mesh pieces and solve state stay private to the wardrobe artist.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts The groups keep their concrete Three.js type for every costume. Optional variants live in CastStyle and motion overrides live in ActorPose.
 * @evidence contracts/development/common.md#meaningful-documentation The comment and members explain group ownership, frame placement, attachment points and pose mutation.
 */
export interface CastActor {
  /** Actor assembly placed by the scene, with +Y up and +Z forward. */
  root: THREE.Group;

  /** Wardrobe and attachment group moved by the pelvis offset and lean. */
  torso: THREE.Group;

  /** Head and its overlays, including the skin-colored face. */
  head: THREE.Group;

  /** Left palm attachment group. */
  leftHand: THREE.Group;

  /** Right palm attachment group. */
  rightHand: THREE.Group;

  /** Left ankle attachment group. */
  leftFoot: THREE.Group;

  /** Right ankle attachment group. */
  rightFoot: THREE.Group;

  /**
   * Apply the supplied pose to this actor's groups in place. Leave the actor's
   * world placement to the caller. Radians and ground-relative local metres
   * follow ActorPose. Each side can replace its native endpoint with a pin.
   *
   * @evidence contracts/development/implementation.md#principled-implementation Set torso height from the native hips when present or from the authored bob and crouch. Orient the head and limbs from the current controls, native joints and stage pins in actor-local coordinates.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure The setter owns visible local transforms. The caller owns stage placement, contact decisions and clip timing. The SDK owns the supplied native motion samples.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The authored swing, bob and pole directions drive the stylized fallback. An explicit pin overrides only its side and the two-segment shape reaches the visible target without claiming native contact.
   * @evidence contracts/development/implementation.md#efficient-algorithms Update the torso and head plus four bounded limb chains. Work and temporary vector allocation are constant per call and independent of the scene size and the clock.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse the actor's prepared joint lengths, existing meshes and attachment groups for every call. Each request computes its own pose and may be sampled in any order.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources A setter retains the actor's fixed groups and limb references for that actor's lifetime. Each call consumes the input synchronously and keeps no history or running work. The scene owns disposal.
   * @evidence contracts/development/common.md#meaningful-documentation The comment gives the input units, local transform mutation, unchanged group identities and pin precedence.
   */
  pose(state: ActorPose): void;
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

/**
 * Dress a polygon Human facing local +Z with +Y up. Hand and foot targets are
 * palm and ankle centers in metres. Keep attached props on the returned groups
 * across seeks. The fixed prepared Human supplies the limb lengths and geometry.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Use native joint triplets when admitted for that limb. For a stage pin or authored swing use a two-link bend from canonical segment lengths, oriented to the limb's plane. Near-zero and fully extended targets use a bounded bend and the visual lower segment reaches the requested endpoint.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The wardrobe owner builds and poses one actor. The scene sets the root placement and supplies named attachments or pins, and the installed motion performance owns native pose generation.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Visible poles and swing amplitudes are authored stylized rig controls. The bend bounds protect its denominator and square root, and the extended visible segment is a rendering accommodation rather than a native contact claim.
 * @evidence contracts/development/implementation.md#efficient-algorithms Construction creates one fixed set of canonical meshes, clothing parts and up to three overlays. Each pose updates four limb chains plus torso and head, independent of film duration.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse one canonical geometry per body-part identifier across wardrobe figures with the same template, applying stature at each mesh. Reuse a per-actor material for an identical palette number. Each pose can be recomputed at any time.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The module retains one finite canonical geometry table. The actor assembly retains its own meshes, attachments and palette map for scene lifetime. The owning scene handles resource disposal.
 * @evidence contracts/development/common.md#meaningful-documentation The documented inputs and groups state standing scale, stage frame, named endpoints, transform ownership and state updates.
 */
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
