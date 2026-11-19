import * as THREE from "three";
import type { IFilmProduction } from "../../../../IFilmProduction";
import { castActor, type ActorPose } from "../../../shared/castActor";
import { blocking, frameCamera, type Role } from "./blocking";
import { breadRoadPerformance } from "./performance";
import { breadCloth, loaf, ryeSack, sackStrap, sidearm } from "./provisions";
import { ellipsoid, ground, landscape, smooth, splitRock } from "./road";

const v=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
const segment=(p:THREE.Vector3,q:THREE.Vector3,a:number,b:number,t:number)=>p.clone().lerp(q,smooth(a,b,t));
const roles:Role[]=["alix","perrin","caller","red","youngest","speaker","companion"];
type RoadPose=ActorPose & Required<Pick<ActorPose,"lean"|"headYaw"|"headPitch">>;
const skin=0xbb8869;
const cast={
  alix:{name:"Alix",height:1.56,tunic:0x496e87,hair:0x412e26,skin,legs:0x424b46,hood:0xd9d0b3},
  perrin:{name:"Perrin",height:1.81,tunic:0x6c503e,hair:0x493d36,skin:0xb38267,legs:0x473e37},
  caller:{name:"Caller",height:1.74,tunic:0x50473e,hair:0xab8660,skin:0xc29474,legs:0x5d594f,beard:0x876849},
  red:{name:"Red Cap",height:1.71,tunic:0x49494a,hair:0x302821,skin:0xb88666,legs:0x6a5546},
  youngest:{name:"Youngest",height:1.65,tunic:0x8e9188,hair:0xc4a56c,skin:0xcda17c,legs:0x695b45,boots:0x75543f},
  speaker:{name:"Hospice speaker",height:1.61,tunic:0x975a3e,hair:0xa19b88,skin:0xaf8469,legs:0x754e3b,hood:0xe0dbca},
  companion:{name:"Hospice companion",height:1.74,tunic:0x84877c,hair:0x854b37,skin:0xc09175,legs:0x68695c,hood:0x394d62},
};

/**
 * Stage docs/body/screenplay/bread-cloths/010-two-bends.md#ascent as one seekable picture above Orsières.
 * The clock starts at zero and uses authored seconds. Each seek updates the scene and camera.
 * The caller releases geometry and materials with dispose after its final draw.
 * Concretization: the director's staging places the cap, stump, two roads, cloths and body
 * contacts in stage metres and sets shot lenses. The screenplay records their order,
 * relationships and dramatic actions. The acceptance record captures the measured picture.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment identifies the screenplay scene, the clock and seek effects, and who disposes the returned stage.
 * @evidence contracts/development/implementation.md#principled-implementation Build one scene, compile admitted native walking, carrying and gestures, then evaluate actor poses, props and shots against the same clock. Fixed time windows support repeated and out-of-order seeks.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The scene composes the cast, native sampler, road, actor paths, props and camera. The isolated soundtrack producer resolves timing from the same screenplay before delivery mux.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Authored staging supplies the road routes, prop attachments and contact windows that native motion does not express here. Knee and hand targets and cloth shapes are scene-authored approximations. Native planning rejection propagates at setup.
 * @evidence contracts/development/implementation.md#efficient-algorithms The seek work is bounded by the seven actors, finite prop population and two fixed cloth grids. The stage builds lighting and scenery only at creation. Dispose walks the attached graph once to release unique resources.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Seeks reuse the same scene objects, geometry and native sampler. They recalculate the visible state at the requested second so forward playback and random seeks agree.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned production retains its fixed cast, scene objects, camera and sampler. Dispose frees unique geometries and materials and clears scene children. Scene creation opens no renderer, file or external worker.
 * @evidence contracts/development/composition.md#screenplay-realization Realizes the standing geography and all five beats in the authored order, including the 38 to 44.5 second uninterrupted upper rescue. The chosen delivery stays within one minute. The exact shoe contact, seam cause and some hand placements read subtly in the inspected picture.
 * @evidence contracts/development/composition.md#composition-only Combines reusable cast meshes, native HumanChain and parallel engine output, actor placement, fixed terrain and prop capabilities. Absolute staging, contact and camera windows sit on the scene clock. The inherited scene still computes prop attachments and blocking coordinates locally.
 * @evidence contracts/development/composition.md#living-scene Alix and Perrin traverse both bends as the women open their cloths, the three followers split around the cap and turn, and the rescue transfers focus from sack to person. The lower men lift and depart, the women hold the shares, and the four climb. The verified encode includes a separately muxed dialogue and Foley track.
 * @evidence docs/body/screenplay/bread-cloths/010-two-bends.md#ascent Stages the two continuous roads, split rock, stump, seven figures and their opening positions.
 * @evidence docs/body/screenplay/bread-cloths/010-two-bends.md#cloths Opens the two cloths above, follows the procession below and stages the early shoulder relief.
 * @evidence docs/body/screenplay/bread-cloths/010-two-bends.md#rock Stages the exchange by the split rock, Perrin's signal, and Red Cap leaving the cap while the route separates.
 * @evidence docs/body/screenplay/bread-cloths/010-two-bends.md#bend Shows the shoe exit and reseat, climb, sack snag, the lower men's arrival and Red Cap reaching for the wood.
 * @evidence docs/body/screenplay/bread-cloths/010-two-bends.md#stump Spills three loaves, holds the upper view through the strap release and Alix's return to the ledge, then cuts to the shared lower lift.
 * @evidence docs/body/screenplay/bread-cloths/010-two-bends.md#tables Places one whole and one half on each cloth, shows the sack departure below, and closes with the four climbing and both cloth tails held.
 */
export async function createBreadRoad():Promise<IFilmProduction> {
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,16/9,0.035,125);
  landscape(scene);
  const actors=Object.fromEntries(roles.map(id=>[id,castActor(cast[id])])) as Record<Role,ReturnType<typeof castActor>>;
  const roadMotion=breadRoadPerformance(cast);
  const shadows:THREE.Mesh[]=[];
  for(const id of roles){
    scene.add(actors[id].root);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,20),new THREE.MeshBasicMaterial({color:0x554a37,transparent:true,opacity:0.23,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.scale.set(0.36,0.19,1);scene.add(shadow);shadows.push(shadow);
  }
  // Distinct silhouettes and costume colors remain recognizable after the cap changes hands.
  const clothes:Partial<Record<Role,THREE.Group>>={};
  const skirts:Partial<Record<Role,THREE.Mesh>>={};
  for(const [id,tint] of [["alix",0x51665d],["speaker",0x92583e],["companion",0x83867d],["perrin",0x634839],["caller",0x9c793f]] as const){
    const g=new THREE.Group();actors[id].root.add(g);clothes[id]=g;
    if(id==="caller"){
      const cowl=ellipsoid(tint,0.25,0.115,0.18);cowl.position.set(0,1.39,-0.04);g.add(cowl);
    }else if(id==="perrin"){
      const plate=ellipsoid(0x869495,0.239,0.274,0.137);plate.position.set(0,1.18,0.065);g.add(plate);
      for(const x of [-0.15,0.15]){
        const skirt=ellipsoid(tint,0.125,0.32,0.12);skirt.position.set(x,0.70,-0.045);g.add(skirt);
      }
    }else{
      const h=cast[id].height;
      const dress=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.275,0.70,11),new THREE.MeshStandardMaterial({color:cast[id].tunic,roughness:1,flatShading:true}));
      dress.position.set(0,h*0.38,0);g.add(dress);skirts[id]=dress;
      if(id==="alix"){
        const apron=ellipsoid(tint,0.18,0.36,0.052);apron.position.set(0,h*0.44,0.144);g.add(apron);
      }
    }
  }
  const cap=ellipsoid(0xaa4534,0.162,0.11,0.156), shoe=ellipsoid(0x5c412e,0.096,0.064,0.183);
  const shoeSurface=shoe.geometry.getAttribute("position");
  for(let i=0;i<shoeSurface.count;i++){
    const z=shoeSurface.getZ(i);
    shoeSurface.setXYZ(i,shoeSurface.getX(i)*(0.86+0.13*z),Math.max(-0.75,shoeSurface.getY(i)),z);
  }
  shoe.geometry.computeVertexNormals();
  const sock=ellipsoid(0xd2b899,0.065,0.055,0.12);
  actors.youngest.leftFoot.name="Youngest's left foot";
  actors.youngest.leftFoot.children.forEach(part=>{part.visible=false;});
  sock.position.set(0,-0.025,0.04);actors.youngest.leftFoot.add(sock);
  const shoeWell=ellipsoid(0x392b27,0.066,0.013,0.092);
  shoeWell.scale.set(0.51,0.13,0.39);shoeWell.position.set(0,0.86,-0.29);shoe.add(shoeWell);
  const bag=ryeSack(),strap=sackStrap(),breads=[loaf(),loaf(),loaf()],halves=[loaf(true),loaf(true)];
  const shoulderHarness=sackStrap();
  actors.alix.root.add(shoulderHarness.object);
  const tear=bag.getObjectByName("Torn seam")!;
  const seam=bag.getObjectByName("Intact seam")!;
  const releasedHands=[actors.perrin.leftHand,actors.perrin.rightHand].map((hand,i)=>{
    const grip=[...hand.children],palm=new THREE.Group();
    palm.rotation.z=i===0?-0.28:0.30;
    palm.add(ellipsoid(cast.perrin.skin,0.055,0.061,0.030));
    for(let n=0;n<4;n++){
      const finger=ellipsoid(cast.perrin.skin,0.012,0.043-Math.abs(n-1.5)*0.009,0.018);
      finger.position.set((n-1.5)*0.025,0.080,0.002);
      finger.rotation.z=(n-1.5)*0.16;palm.add(finger);
    }
    const thumb=ellipsoid(cast.perrin.skin,0.019,0.037,0.019);
    thumb.position.set(i===0?-0.058:0.058,0.015,0.011);
    thumb.rotation.z=i===0?0.77:-0.77;palm.add(thumb);
    hand.add(palm);
    return {grip,palm};
  });
  const cloths=[breadCloth(true),breadCloth(false)],tails=[sackStrap(),sackStrap()];
  const perrinSword=sidearm(),redSword=sidearm(),callerSword=sidearm(),youngSword=sidearm();
  cap.name="Brick-red cap";shoe.name="Loose left shoe";bag.name="Rye sack";strap.object.name="Rye sack strap";
  perrinSword.name="Perrin's sword";
  breads.forEach((item,i)=>{item.name="Loaf "+(i+1);});
  halves.forEach((item,i)=>{item.name="Half "+(i+1);});
  cloths[0]!.object.name="Blue-edged cloth";cloths[1]!.object.name="Plain cloth";
  const sheath=sidearm(true);actors.caller.root.add(sheath);sheath.position.set(-0.20,0.93,0);sheath.rotation.x=0.33;
  const perrinSheath=sidearm(true);
  actors.perrin.root.add(perrinSheath);
  perrinSheath.position.set(-0.19,0.91,0.02);
  perrinSheath.rotation.x=0.24;
  scene.add(cap,shoe,bag,strap.object,...breads,...halves,...cloths.map(c=>c.object),...tails.map(tail=>tail.object),
    perrinSword,redSword,callerSword,youngSword);
  const stoneBits=Array.from({length:7},(_,i)=>{const piece=ellipsoid(0x887b64,0.035+i%3*0.011,0.027,0.031);scene.add(piece);return piece;});
  const rest=v(-0.10,ground(-0.10,-0.45)+0.047,-0.45);
  const shoeGround=v(3.83,ground(3.83,1.83)+0.052,1.83);
  function seek(t:number):void {
    const block=Object.fromEntries(roles.map(id=>[id,blocking(id,t)])) as Record<Role,ReturnType<typeof blocking>>;
    const A=block.alix.position,P=block.perrin.position,R=block.red.position,C=block.caller.position;
    const Y=block.youngest.position;
    const handsOpen=t>=40.66 && t<41.48;
    for(const {grip,palm} of releasedHands){
      palm.visible=handsOpen;
      for(const part of grip)part.visible=!handsOpen;
    }
    const bell=smooth(12.57,13.17,t)*(1-smooth(13.23,13.87,t));
    const miss=smooth(16.07,16.69,t)*(1-smooth(16.76,17.36,t));
    const turn=smooth(21.31,21.87,t)*(1-smooth(21.93,22.36,t));
    const armorMark=P.clone().add(v(-0.23,1.19-block.perrin.crouch,0.11));
    const emptyMark=P.clone().add(v(-0.42,0.77,0.31));
    const turnMark=P.clone().lerp(Y,0.57).add(v(0,0.93,0.17));
    for(const [i,id] of roles.entries()){
      const b=block[id],actor=actors[id];
      actor.root.position.copy(b.position);actor.root.rotation.y=b.yaw;actor.root.updateMatrixWorld(true);
      shadows[i]!.position.copy(b.position).add(v(0,0.014,0));
      if(clothes[id])clothes[id]!.position.y=-b.crouch*0.86;
      const dress=skirts[id];
      if(dress){
        dress.scale.y=1-0.51*b.crouch;
        dress.position.y=Math.max(cast[id].height*0.38,0.03+0.35*dress.scale.y+b.crouch*0.86);
      }
    }
    const lin=v(-0.68,2.51,-0.075), suspended=v(0.02,1.26,0.80);
    const cradled=R.clone().add(v(-0.26,0.95-block.red.crouch*0.78,0.22));
    const shared=R.clone().lerp(C,0.50).add(v(0,0.98-block.red.crouch*0.79,0.22));
    const relief=smooth(3.63,4.82,t)*(1-smooth(5.26,6.55,t));
    const carried=A.clone().add(v(-0.34,1.18-block.alix.crouch,-0.035));
    carried.lerp(P.clone().add(v(0.21,1.25-block.perrin.crouch,0.15)),0.8*relief);
    const rockCap=v(splitRock.x+0.24,ground(splitRock.x,splitRock.z)+0.66,splitRock.z+0.03);
    const hang=smooth(26.7,27.9,t),tip=smooth(36.4,38.2,t),release=smooth(40.65,41.9,t);
    const shoulder=1.27-block.alix.crouch;
    shoulderHarness.object.visible=t<27.9;
    shoulderHarness.shape(v(-0.14,shoulder,0.13),v(0,shoulder-0.16,0.20),v(0.16,shoulder-0.38,0.095));
    bag.position.copy(carried).lerp(lin,hang).lerp(suspended,tip)
      .lerp(cradled.lerp(shared,smooth(44.95,45.75,t)),release);
    bag.rotation.set(0,0.13,0.17*Math.sin(t*0.95)*(1-hang)+0.40*Math.sin(Math.PI*smooth(3.55,6.45,t))+0.61*tip-0.51*release);
    tear.visible=t>=34.17;
    seam.visible=!tear.visible;
    tear.scale.y=0.18+0.82*smooth(34.17,35.20,t);
    const haul=smooth(37.42,38.13,t)*(1-smooth(40.65,41.3,t));
    const grip=v(-0.41-0.12*haul,2.73+0.10*haul,-0.26-0.08*haul);
    const upperA=actors.alix.root.localToWorld(v(-0.10,shoulder+0.05,-0.05));
    const loose=bag.position.clone().add(v(0.29,0.04,0.22));
    const upperView=1-smooth(43.85,44.45,t);
    const handLetGo=smooth(40.66,41.03,t);
    const buckling=upperView*handLetGo;
    loose.x-=0.51*buckling;
    const gripRelease=THREE.MathUtils.lerp(release,handLetGo,upperView);
    const strA=upperA.clone().lerp(grip,smooth(27.2,32.9,t)).lerp(loose,gripRelease);
    const strEnd=bag.position.clone().add(v(0.40,0.13,0.12));
    const strMiddle=strA.clone().lerp(strEnd,0.55).add(v(-0.24*buckling,(1-release)*0.11-release*0.27-0.12*buckling,0.12));
    strap.shape(strA,strMiddle,strEnd);
    const sit=A.clone().add(v(-0.06,1.07-block.alix.crouch*0.72,0.29));
    const loafClear=smooth(41.64,42.03,t)*upperView;
    sit.add(v(0.14*loafClear,-0.10*loafClear,0));
    const open=[v(-1.17,2.55,-0.34),v(0.42,2.30,-0.32)];
    const carrying=smooth(56.52,57.23,t);
    const carry=carrying>0?{
      perrin:roadMotion.carry("perrin",1.3+t-56.52),
      alix:roadMotion.carry("alix",1.3+t-56.52),
    }:null;
    const tailEnds:THREE.Vector3[]=[];
    for(let i=0;i<2;i++){
      const owner=i===0?"speaker":"companion", b=block[owner], c=cloths[i]!;
      const front=i===0?"perrin":"alix";
      const lower=smooth(8.7,10.7,t);
      const high=b.position.clone().add(v(0.02,0.96-b.crouch-0.23*lower,0.39));
      const close=b.position.clone().lerp(i===0?P:A,0.67).add(v(0,1.02,0.105));
      if(carry){
        const held=carry[front];
        const gripCenter=v(...held.leftHand).lerp(v(...held.rightHand),0.5);
        gripCenter.y-=0.09+block[front].crouch*0.65;
        gripCenter.z-=0.14;
        close.copy(actors[front].root.localToWorld(gripCenter));
      }
      c.object.position.copy(high).lerp(open[i]!,smooth(41,47.9,t)).lerp(close,carrying);
      const spread=0.2+0.8*smooth(0.22+i*0.17,1.23+i*0.17,t);
      const foldedAtWaist=0.68*lower*(1-smooth(40.2,47.4,t));
      const wrap=smooth(56.47+i*0.10,57.34+i*0.10,t);
      c.object.rotation.set((0.24+0.52*Math.sin(Math.PI*smooth(0.22,2.1,t)))*(1-smooth(38,47,t)),block[front].yaw*wrap,0);
      c.shape(spread,foldedAtWaist+0.45*wrap,t*1.4,wrap);
      const tail=tails[i]!;
      const tailStart=v(0.10,0.13,-0.24).applyEuler(c.object.rotation).add(c.object.position);
      const hand=actors[owner].root.localToWorld(v(0.19,cast[owner].height*0.60-b.crouch,0.27));
      const tailEnd=tailStart.clone().lerp(hand,smooth(56.65,57.6,t));
      tailEnds.push(tailEnd);
      tail.object.visible=t>56.65;
      if(tail.object.visible)tail.shape(tailStart,tailStart.clone().lerp(tailEnd,0.53).add(v(0,-0.10,0.032)),tailEnd);
    }
    const bundlePlacement=(i:number,open:THREE.Vector3,closed:THREE.Vector3):THREE.Vector3=>{
      const cloth=cloths[i]!.object;
      return open.lerp(closed,smooth(56.47+i*0.1,57.34+i*0.1,t))
        .applyEuler(cloth.rotation).add(cloth.position);
    };
    const wedge=[v(-0.11,rest.y+0.085,-0.56),v(0.37,rest.y+0.085,-0.58),v(0.94,ground(0.94,-0.33)+0.105,-0.33)];
    for(let i=0;i<3;i++){
      const piece=breads[i]!, start=34.87+0.21*i,slide=smooth(start,start+1.16+i*0.23,t);
      piece.visible=t>=start && (i!==2 || t<53.52);
      const origin=v(-0.53,2.38,0.105), dest=wedge[i]!;
      piece.position.copy(origin).lerp(dest,slide);piece.position.y+=Math.sin(slide*Math.PI)*0.095;
      piece.rotation.y=i*0.84;piece.rotation.z=Math.sin(slide*Math.PI*2.5)*(1-slide)*0.5;
      if(i<2){
        const transfer=smooth(48.10+i*1.17,49.20+i*1.17,t);
        piece.position.lerp(bundlePlacement(i,v(-0.085,0.09,-0.10),v(-0.045,0.075,-0.046)),transfer);
        piece.position.y+=Math.sin(transfer*Math.PI)*0.38;
        piece.rotation.y=THREE.MathUtils.lerp(piece.rotation.y,cloths[i]!.object.rotation.y,smooth(56.47,57.35,t));
      }else piece.position.lerp(sit,smooth(37.7,39.05,t));
    }
    for(let i=0;i<2;i++){
      const h=halves[i]!, sign=i===0?-1:1;
      const torn=smooth(53.52,54.18,t),place=smooth(54.24+i*0.42,55.35+i*0.45,t);
      h.visible=t>=53.52;h.position.copy(sit).add(v(sign*(0.09+0.14*torn),0.05,0.02));
      h.position.lerp(bundlePlacement(i,v(0.17,0.13,0.13),v(0.08,0.10,0.06)),place);
      h.rotation.y=sign*0.22*torn+cloths[i]!.object.rotation.y;h.rotation.x=-0.48*torn;
    }
    for(const id of roles){
      const b=block[id],actor=actors[id],h=cast[id].height;
      const k=roles.indexOf(id);
      const pose:RoadPose={walk:t*(5.6+k*0.15)+k*0.91,stride:b.stride,crouch:b.crouch,
        lean:(id==="alix"?0.09:0.02)+0.024*Math.sin(t*1.75+k),headYaw:0.10*Math.sin(t*0.93+k),headPitch:0.018*Math.sin(t*1.7+k)};
      if(b.crouch>0.20)pose.stride=0;
      if(b.stride>0.06 && b.crouch<=0.20){
        const native=roadMotion.walk(id,t+k*0.17);
        pose.nativeLegs=native;
        pose.nativeArms=native;
        pose.stride=0;
      }
      const local=(point:THREE.Vector3):readonly[number,number,number]=>{
        const n=actor.root.worldToLocal(point.clone());return [n.x,n.y,n.z];
      };
      if(id==="alix"){
        if(t<32.8){
          pose.leftArm=[-0.18,h*0.73-b.crouch,0.19];
          const wave=smooth(2.66,3.26,t)*(1-smooth(4.55,5.12,t));
          if(wave>0)pose.nativeArms=roadMotion.cue("alix-wave",t-2.66);
          if(t<2.65 || t>5.17)pose.headYaw=-0.19*smooth(0.6,1.3,t)*(1-smooth(6.0,8.2,t));
        }
        pose.lean+=0.25*smooth(12.96,13.48,t)*(1-smooth(14.14,15.38,t));
        if(t>=28 && t<32){pose.headPitch=0.46;pose.headYaw=0.1;}
        if(t>=37.6 && t<53.52){pose.leftArm=local(breads[2]!.position);pose.rightArm=local(sit.clone().add(v(0.1,0.04,0)));}
        if(t>=39.12 && t<41.65){
          const search=smooth(39.12,39.85,t)*(1-smooth(41.28,41.65,t));
          const edge=A.clone().add(v(0.22,0.11,0.15));
          pose.rightArm=local(sit.clone().add(v(0.1,0.04,0)).lerp(edge,search));
        }
        if(t>=41.65 && t<44.5){
          const brace=smooth(41.65,42.25,t)*(1-smooth(43.72,44.5,t));
          pose.rightArm=local(sit.clone().add(v(0.10,0.04,0)).lerp(A.clone().add(v(-0.25,1.21-b.crouch,0.24)),brace));
          pose.headYaw-=0.50*brace;
        }
        const slide=smooth(39.35,41.28,t)*(1-smooth(46.43,48,t));
        const tipping=smooth(39.1,40.43,t)*(1-smooth(40.97,41.97,t));
        pose.lean+=0.32*tipping-0.25*slide;
        if(slide>0){
          pose.leftLeg=[0.14,0.077+0.045*slide,0.11+0.28*slide];
          pose.rightLeg=[-0.15,0.081+0.024*slide,0.10+0.28*slide];
          pose.headYaw+=0.42*smooth(40.18,41.12,t)*(1-smooth(45.9,47.1,t));
          pose.headPitch-=0.28*smooth(40.18,41.12,t)*(1-smooth(45.9,47.1,t));
        }
        if(t>=53.52){
          pose.leftArm=local(halves[1]!.position.clone().add(v(0.12,0.02,-0.01)));
          pose.rightArm=local(halves[0]!.position.clone().add(v(-0.12,0.02,-0.01)));
        }
      }else if(id==="perrin"){
        if(t>3.5 && t<7.6){
          pose.leftArm=local(bag.position.clone().add(v(-0.23,-0.15,0.10)));
          pose.lean+=0.24*smooth(3.55,4.70,t)*(1-smooth(5.4,6.25,t));
          pose.headPitch=-0.21*smooth(4.9,5.8,t)*(1-smooth(7.5,8.04,t));
        }
        if(t>=15.2 && t<16.2){
          const signal=roadMotion.cue("perrin-signal",t-15.2);
          pose.nativeArms=signal;
          pose.rightArm=[-0.26,0.88-b.crouch,0.15];
        }
        if(t>=32 && t<40.66){pose.leftArm=local(grip.clone().add(v(0.11,0,0)));pose.rightArm=local(grip.clone().add(v(-0.10,0.02,0)));}
        const look=smooth(39.3,40.26,t)*(1-smooth(42.70,43.2,t));
        pose.headYaw+=0.72*look;pose.headPitch+=0.30*look;
        if(t>=40.66 && t<47.8){
          const rescue=smooth(41.12,42.33,t);
          const a=grip.clone().add(v(-0.23,0.13,0.14)),other=grip.clone().add(v(0.23,0.14,0.16));
          const contact=A.clone().add(v(0,1.10-block.alix.crouch,0.12));
          pose.rightArm=local(a.lerp(contact.clone().add(v(-0.14,0.14,0.12)),rescue));
          pose.leftArm=local(other.lerp(contact.clone().add(v(0.04,-0.04,0.17)),rescue));
          pose.lean-=0.14*rescue;
          pose.headYaw+=0.25*rescue;
          pose.headPitch+=0.16*rescue;
          pose.leftLeg=[0.16,0.077,0.08+0.14*rescue];
          pose.rightLeg=[-0.17,0.075,-0.05];
        }
        if(t>=54.63 && t<55.36){
          const drawUp=smooth(54.63,55.36,t);
          pose.rightArm=local(rest.clone().lerp(P.clone().add(v(-0.16,0.91-b.crouch,0.05)),drawUp));
        }
        if(t>=48.10 && t<50.38){const i=t<49.25?0:1;pose.rightArm=local(breads[i]!.position);}
      }else if(id==="speaker" || id==="companion"){
        const c=cloths[id==="speaker"?0:1]!.object.position;
        const holding=smooth(0.20,1.17,t)*(1-smooth(8.6,10.7,t))+smooth(40.1,47.2,t)*(1-smooth(56.45,58.1,t));
        const span=0.14+0.21*holding;
        const handoff=smooth(56.67,57.46,t);
        pose.rightArm=local(c.clone().add(v(-span,0.075,-0.19)).lerp(actor.root.localToWorld(v(-0.19,h*0.49-b.crouch,0.078)),handoff));
        pose.leftArm=local(c.clone().add(v(span,0.075,-0.19)).lerp(tailEnds[id==="speaker"?0:1]!,handoff));
      }else if(id==="red" || id==="caller"){
        if(t>27.55 && t<38){
          pose.headPitch=-0.66*smooth(27.55,29.85,t);
          pose.headYaw=id==="red"?0.17:-0.17;
        }
        if(id==="caller" && t>=10.17 && t<12.68){
          const reach=smooth(10.17,11.86,t)*(1-smooth(12.23,12.68,t));
          pose.headYaw+=0.12*reach;
          pose.nativeArms=roadMotion.cue("caller-point",t-10.17);
          pose.rightArm=[-0.20,0.88-b.crouch,0.13];
        }
        if(id==="caller" && t>=19.02 && t<19.9){
          const docking=smooth(19.02,19.86,t);
          pose.rightArm=[-0.24+0.03*docking,0.90+0.13*docking,0.13-0.11*docking];
        }
        if(id==="red" && t>=30 && t<32.3){
          pose.nativeArms=roadMotion.cue("red-stump",Math.max(0,t-30.63));
          pose.rightArm=[-0.23,0.90-b.crouch,0.14];
        }
        if(id==="red" && t>=17.94 && t<19.72){
          const capOnHead=R.clone().add(v(0,h*0.96-b.crouch,0.05));
          pose.leftArm=local(segment(capOnHead,rockCap,18.35,19.65,t));
        }
        if((id==="red" && t>=36.8)||(id==="caller" && t>=44.62)){
          const dx=id==="red"?0.21:-0.28;
          pose.leftArm=local(bag.position.clone().add(v(dx-0.09,-0.16,0.13)));
          pose.rightArm=local(bag.position.clone().add(v(dx+0.12,0.045,0.14)));
          pose.lean+=0.12*(1-smooth(46.6,47.85,t));
        }
      }else{
        pose.headYaw-=0.76*smooth(6.86,7.25,t)*(1-smooth(8.83,9.7,t));
        const stepOut=smooth(22.04,22.76,t)*(1-smooth(23.56,24.25,t));
        if(t>=22.04 && t<24.48){
          const native=roadMotion.walk("youngest",0.30+(t-22.04)*0.60);
          const raised=v(0.13,0.075+0.095*stepOut,0.07+0.32*stepOut)
            .lerp(v(...native.leftFoot).add(v(0,0.075*stepOut,0.32*stepOut)),0.20*stepOut);
          const planted=actor.root.worldToLocal(shoeGround.clone().sub(v(0.01,-0.012,0.045)));
          const entry=smooth(23.50,24.18,t)*(1-smooth(24.26,24.48,t));
          pose.leftLeg=raised.lerp(planted,entry).toArray();
        }
      }
      // Face the camera-readable prop cues. The recoil and Foley carry the staged contacts.
      if(id==="caller" && bell>0)pose.rightArm=local(C.clone().add(v(0.1,0.91-b.crouch,0.23)).lerp(armorMark.clone().add(v(-0.43,0.02,0.18)),bell));
      if(id==="perrin" && bell>0)pose.rightArm=local(P.clone().add(v(-0.13,0.91-b.crouch,0.16)).lerp(armorMark.clone().add(v(0.32,-0.32,0.09)),bell));
      if(id==="red" && miss>0)pose.rightArm=local(R.clone().add(v(0.02,0.90,0.25)).lerp(emptyMark.clone().add(v(-0.50,0.04,0.14)),miss));
      if(id==="perrin" && turn>0)pose.rightArm=local(P.clone().add(v(-0.03,0.92,0.13)).lerp(turnMark.clone().add(v(-0.35,-0.19,0.12)),turn));
      if(id==="youngest" && turn>0)pose.rightArm=local(Y.clone().add(v(-0.04,0.91,0.13)).lerp(turnMark.clone().add(v(0.26,-0.20,0.13)),turn));
      if(carry && (id==="alix" || id==="perrin")){
        const native=carry[id];
        for(const [side,sign,wrist] of [["leftArm",1,native.leftHand],["rightArm",-1,native.rightHand]] as const){
          if(carrying<1){
            const start=v(...(pose[side]??[sign*h*0.124,h*0.50-b.crouch,0.112]));
            pose[side]=start.lerp(v(...wrist),carrying).toArray();
          }else delete pose[side];
        }
        pose.nativeArms=native;
      }
      for(const [side,sign] of [["leftArm",1],["rightArm",-1]] as const){
        const goal=pose[side];if(!goal)continue;
        const shoulder=v(sign*h*0.111,h*0.78-b.crouch,0.03), delta=v(...goal).sub(shoulder);
        if(delta.length()>h*0.365){
          delta.setLength(h*0.365).add(shoulder);pose[side]=[delta.x,delta.y,delta.z];
        }
      }
      actor.pose(pose);actor.root.updateMatrixWorld(true);
    }
    const head=actors.red.head.getWorldPosition(v(0,0,0)).add(v(0,0.14,0));
    cap.position.copy(segment(head,rockCap,18.35,19.65,t));cap.position.y+=Math.sin(Math.PI*smooth(18.35,19.65,t))*0.18;
    cap.rotation.z=0.16+0.20*Math.sin(Math.PI*smooth(17.2,18.4,t));
    const boot=actors.youngest.leftFoot.getWorldPosition(v(0,0,0));
    shoe.position.copy(boot).add(v(0.01,-0.012,0.045));
    const unshod=smooth(22.08,22.66,t)*(1-smooth(24.18,24.28,t));
    shoe.position.lerp(shoeGround,unshod);shoe.rotation.y=block.youngest.yaw;
    for(const [id,item] of [["perrin",perrinSword],["red",redSword],["caller",callerSword],["youngest",youngSword]] as const){
      const b=block[id];
      item.position.copy(actors[id].rightHand.getWorldPosition(v(0,0,0)));item.rotation.set(0.16,0,-0.25);
      if(id==="perrin"){
        const drop=smooth(32.05,32.55,t)*(1-smooth(54.63,55.36,t));
        item.position.lerp(rest,drop);item.rotation.z=0.32+drop*1.17;
        item.visible=t>=12.7 && t<55.36;
        perrinSheath.position.y=0.91-b.crouch*0.78;
      }else if(id==="red"){
        const drop=smooth(36.46,37.16,t);
        item.position.lerp(v(0.28,ground(0.28,1.24)+0.05,1.24),drop);item.rotation.z=0.32+1.18*drop;
      }else if(id==="caller"){
        item.visible=t<19.9;
        const docking=smooth(19.12,19.9,t);
        item.position.lerp(sheath.getWorldPosition(v(0,0,0)),docking);
        item.rotation.z-=0.22*docking;
      }
      if(t>=12.7 && t<13.75 && (id==="caller" || id==="perrin"))item.rotation.z=(id==="caller"?-1:1)*(0.37+0.95*Math.sin(Math.PI*smooth(12.7,13.75,t)));
      if(t>16.0 && t<17.3 && id==="red")item.rotation.z=-0.3-1.0*Math.sin(Math.PI*smooth(16,17.3,t));
      if(t>21.3 && t<22.4 && (id==="youngest" || id==="perrin"))item.rotation.z=(id==="youngest"?-1:1)*(0.32+1.85*Math.sin(Math.PI*smooth(21.3,22.4,t)));
      const mark=id==="caller" && bell>0 ? armorMark : id==="red" && miss>0 ? emptyMark :
        (id==="perrin" || id==="youngest") && turn>0 ? turnMark : undefined;
      if(mark){
        const weight=id==="caller"?bell:id==="red"?miss:turn;
        const aim=new THREE.Quaternion().setFromUnitVectors(v(0,-1,0),mark.clone().sub(item.position).normalize());
        item.quaternion.slerp(aim,weight);
      }
    }
    for(const [i,bit] of stoneBits.entries()){
      const a=t<32?26+i*0.12:39.1+i*0.11, roll=smooth(a,a+1.28,t);
      bit.visible=(t>a && t<a+1.35);const x=(t<32?1.4:0.35)+i*0.068-roll*0.25,z=-0.38+roll*0.9;
      bit.position.set(x,ground(x,z)+0.027+0.065*Math.sin(roll*Math.PI*3)**2,z);
    }
    frameCamera(camera,t);scene.updateMatrixWorld(true);
  }
  seek(0);
  return {scene,camera,seek,dispose:()=>{
    const geom=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
    scene.traverse(o=>{if(o instanceof THREE.Mesh){geom.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
    geom.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.clear();
  }};
}
