import { HumanChain } from "@automovie/motions";
import * as T from "three";

import type { IFilmProduction } from "../../../../IFilmProduction";
import { createMount, createRider } from "../../../../entities/answer-me/cast";
import { bar, buildYard, form } from "../../../../entities/sets/breeding-yard/yard";
import { nativeStageMotion } from "../../../shared/nativeStageMotion";

type Keys = readonly (readonly [number,number])[];
const road:Keys=[[0,0],[5.8,0],[9,3.4],[15,15.8],[21,27.2],[25,34.5],[31,45.7],[36,52.8],[40,56.5],[41,56.65],[46.7,54.15],[55.3,54.15],[58.7,54.2]];
const distanceBehind:Keys=[[0,2.7],[5.9,2.7],[9,2.25],[14.3,2.8],[20.6,1.45],[25,1.22],[31,1.46],[35.8,4.15],[40.5,5.15],[44.8,3.55],[47,2.6]];
const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=(t:number,start:number,end:number)=>{const p=clamp((t-start)/(end-start));return p*p*(3-2*p);};
const pulse=(t:number,start:number,peak:number,end:number)=>ease(t,start,peak)*(1-ease(t,peak,end));
function key(t:number,points:Keys):number{
  if(t<=points[0]![0])return points[0]![1];
  for(let i=1;i<points.length;i++){
    const a=points[i-1]!,b=points[i]!;
    if(t>b[0])continue;
    const before=points[Math.max(0,i-2)]!,after=points[Math.min(points.length-1,i+1)]!;
    const dt=b[0]-a[0],p=(t-a[0])/dt;
    const m0=before[1]===a[1] || a[1]===b[1]?0:dt*(b[1]-before[1])/(b[0]-before[0]);
    const m1=after[1]===b[1] || a[1]===b[1]?0:dt*(after[1]-a[1])/(after[0]-a[0]);
    return (2*p*p*p-3*p*p+1)*a[1]+(p*p*p-2*p*p+p)*m0+(-2*p*p*p+3*p*p)*b[1]+(p*p*p-p*p)*m1;
  }
  return points[points.length-1]![1];
}
const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
function ovalShadow(scene:T.Scene,w:number,d:number){
  const pixels=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const p=4*(64*y+x),r=clamp(Math.hypot(x-31.5,y-31.5)/31.5);
    pixels[p]=55;pixels[p+1]=41;pixels[p+2]=33;pixels[p+3]=Math.round(123*(1-r*r*(3-2*r)));
  }
  const field=new T.DataTexture(pixels,64,64,T.RGBAFormat);field.needsUpdate=true;field.magFilter=T.LinearFilter;field.colorSpace=T.SRGBColorSpace;
  const mat=new T.MeshBasicMaterial({map:field,transparent:true,depthWrite:false});
  const shadow=new T.Mesh(new T.PlaneGeometry(w,d),mat);shadow.rotation.x=-Math.PI/2;scene.add(shadow);return shadow;
}
function shaft(scene:T.Scene){
  const g=new T.Group();scene.add(g);
  bar(g,0x755333,v(-.32,-1.13,0),v(.51,1.9,0),.036,.023);
  bar(g,0xe1d7ba,v(.32,1.22,0),v(.36,1.38,0),.037);
  bar(g,0x747369,v(.51,1.9,0),v(.55,2.06,0),.043,.004);
  return g;
}
function loopedProp(scene:T.Scene){
  const g=new T.Group();scene.add(g);
  bar(g,0x6e4c33,v(0,0,0),v(0,.52,0),.033,.043);
  bar(g,0xf3e5c3,v(0,.26,0),v(0,.33,0),.039);
  const crown=form(g,new T.TorusGeometry(.068,.047,6,8),0x5c5c54,0,.54,0);
  crown.scale.set(.95,1.16,1.16);
  for(const angle of [0,2.09,4.19]){
    const rib=form(g,new T.IcosahedronGeometry(.067,0),0x68685c,.068*Math.cos(angle),.54+.08*Math.sin(angle),0);
    rib.scale.set(.68,.76,1.12);
  }
  return g;
}
/**
 * Stages docs/body/screenplay/answer-me/010-breeding-yard-road.md#road from the
 * paid bench through the chestnuts' reunion and Rémy's departure. The scene
 * owns a disposable graph and a deterministic seek in absolute seconds.
 *
 * Concretization: use a metre-scale stage with +X along the road and the yard
 * on the −Z side. Road distances, camera lenses, cue envelopes, contact points
 * and the cut through Rémy's continuing jog implement the published staging.
 * The signed manuscript records beat times, subject positions relative to set
 * landmarks and camera intentions. The sound is authored separately by score.ps1.
 *
 * @evidence docs/body/screenplay/answer-me/010-breeding-yard-road.md#road Places the clerk and riders at the muster, with the foal behind the shut gate down the wall.
 * @evidence docs/body/screenplay/answer-me/010-breeding-yard-road.md#both Shows coin transfer to the green belt, Luc's look from the mare's white sock and successive departures.
 * @evidence docs/body/screenplay/answer-me/010-breeding-yard-road.md#lances Tracks the mounted pair by the wall through the pass, staged armour glance and grey gaining.
 * @evidence docs/body/screenplay/answer-me/010-breeding-yard-road.md#change Leaves both shafts behind in separate positions and reveals the looped props in the riders' hands.
 * @evidence docs/body/screenplay/answer-me/010-breeding-yard-road.md#answer Layers mounted recoils and dust over the chase, leaves Rémy's dropped prop behind and lets the grey slow first.
 * @evidence docs/body/screenplay/answer-me/010-breeding-yard-road.md#reach Returns the mare to the foal, brings each rider down in turn, and holds a three-quarter view of Luc stopping Rémy by the sleeve.
 * @evidence docs/body/screenplay/answer-me/010-breeding-yard-road.md#sleeve Releases the ochre sleeve before unlatching the gate, then shows the reunited chestnuts, the grey with Luc outside, and Rémy running with the purse.
 * @evidence contracts/development/composition.md#screenplay-realization Realizes the six signed beat intervals and carries purse, props, reins and gate state across cuts. The fixed metre offsets and lenses in Concretization are implementation choices. The three-dimensional stylization limits the visibility of some brief mounted contacts; the companion soundtrack supplies their cues.
 * @evidence contracts/development/composition.md#composition-only Combines yard and cast controls and compiles installed walk and jog for the visible ground travel. It still owns local scene coordinates, the key interpolation, mounted blocking and visual effects; these are scene-owned implementations in this cut.
 * @evidence contracts/development/composition.md#living-scene Layers motion over the verge, wall and gate with moving side, close and wide views. Ground actors transition between saddle and ground, while the animals carry gait, ears, head, stance and nose contacts. The slot for the voice and sound cues is shared with the score.
 * @evidence contracts/development/common.md#meaningful-documentation Names the signed scene and beat owners, disposable result, stage coordinate system and source of sound.
 * @evidence contracts/development/implementation.md#principled-implementation Seek clamps to the minute and rebuilds transforms from absolute seconds. Fixed ordered keys interpolate metres or radians, and native readings use their own elapsed seconds. Only Luc's approach and Rémy's final ground travel use human native FK; local pose and contact staging covers the other intervals.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The yard and cast factories own their drawable rigs, nativeStageMotion owns the installed-motion adapter, and this scene owns state transitions, shot choice and staging.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The road keys and contacts are authored dramatic blocking. The jog distance cut is found against native root translation, and foot height compensates for the visible shoe sole versus the native ankle datum. Impact pictures are composed cues, with no physical contact prediction.
 * @evidence contracts/development/implementation.md#efficient-algorithms Construction compiles both native actions once and bisects the continuing jog cut in 24 iterations. Each seek traverses small fixed key arrays and updates a fixed cast and 14 dust shapes; no simulation steps depend on the seek distance.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses the rig, props, camera and compiled performances across seeks in one production. Independent consumers receive their own mutable scene graph.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Created scene graphs own their fixed set of draw objects and performances. Dispose releases attached geometries and generated shadow textures and materials, then clears the scene. Other non-shadow materials have no explicit per-production disposal here, and the yard palette is module-owned.
 */
export async function breedingYardRoad():Promise<IFilmProduction>{
  const scene=new T.Scene();const camera=new T.PerspectiveCamera(36,16/9,.035,280);
  const {gate,latch}=buildYard(scene);
  const mare=createMount("mare"),grey=createMount("grey"),foal=createMount("foal");
  const remy=createRider("remy"),luc=createRider("luc"),clerk=createRider("clerk");

  const start = { x: 0, y: 0, z: 0 };
  const lucApproach = nativeStageMotion.compile({
    seed: "51007",
    performers: [{ subject: "luc", body: nativeStageMotion.wardrobeBody(1.69), at: start, yaw: 0, proficiency: { level: "trained" } }],
    composition: HumanChain.subject("luc").walk({ to: { ...start, z: 1.33 }, pace: "slow" }).node,
  });
  const remyDeparture = nativeStageMotion.compile({
    seed: "51008",
    performers: [{ subject: "remy", body: nativeStageMotion.wardrobeBody(1.79), at: start, yaw: 0, proficiency: { level: "trained" } }],
    composition: HumanChain.subject("remy").run({ to: { ...start, z: 9.5 }, pace: "jog" }).node,
  });

  // Cut the move while Rémy is still running. The native route extends past the final frame.
  let beforeCut = 0, afterCut = remyDeparture.performance.duration;
  for (let i = 0; i < 24; i++) {
    const probe = (beforeCut + afterCut) / 2;
    const distance = remyDeparture.performance.pose("remy", probe).root?.translation.z ?? 0;
    if (distance < 7.13) beforeCut = probe;
    else afterCut = probe;
  }
  const nativeDepartureEnd = (beforeCut + afterCut) / 2;
  for (const cast of [mare,grey,foal,remy,luc,clerk]) scene.add(cast.root);
  const shadows=[ovalShadow(scene,4.15,1.52),ovalShadow(scene,4.4,1.58),ovalShadow(scene,2.3,.9),ovalShadow(scene,1.15,.69),ovalShadow(scene,1.15,.69),ovalShadow(scene,1.15,.69)];
  const lances=[shaft(scene),shaft(scene)],maces=[loopedProp(scene),loopedProp(scene)];
  const wallShadows=[0,1].map(()=>form(scene,new T.BoxGeometry(2.5,.035,.008),0x5b503e,0,.43,-2.01));
  const pursePosition=new T.Vector3();
  const coin=form(scene,new T.CylinderGeometry(.043,.043,.011,18),0xf3c369,0,0,0);
  coin.name="muster coin";
  gate.name="breeding-yard gate";
  latch.name="breeding-yard latch";
  const motes:T.Mesh[]=[];
  for(let i=0;i<14;i++){
    const dirt=form(scene,new T.IcosahedronGeometry(1,0),i%2?0xbca280:0xcbb391,0,0,0);
    motes.push(dirt);
  }
  function frame(pos:T.Vector3,aim:T.Vector3,fov:number){
    camera.position.copy(pos);camera.lookAt(aim);camera.fov=fov;camera.updateProjectionMatrix();
  }
  const seek=(seconds:number):void=>{
    const t=clamp(seconds,0,60);
    const x=key(t,road);
    const yaw=key(t,[[0,-.12],[8,0],[39.5,0],[41,.16],[43.7,2.58],[45.75,1.95],[47,1.56],[60,1.55]]);
    const mareZ=key(t,[[0,.42],[40,.42],[43,.02],[46.7,-.79],[54.9,-.79],[58.6,-3.59],[60,-3.63]]);
    const greyX= T.MathUtils.lerp(x-key(t,distanceBehind),key(t,[[40,51.35],[42,51.72],[43.75,52.56],[60,52.56]]),ease(t,40,42));
    const greyZ=key(t,[[0,-.82],[22,-.94],[33,-.76],[41,-.72],[43.75,-.42],[60,-.42]]);
    const g1=key(t,[[0,.012],[5,.012],[7,.38],[10,.98],[32,.98],[37,.45],[40,.22],[46,.17],[47,0],[55,0],[56,.23],[58.9,.02],[60,0]]);
    const g2=key(t,[[0,0],[6.1,0],[9,.72],[11,1],[25,1],[26,.65],[27,.95],[31,.93],[34,.5],[41,.28],[43.75,0]]);
    const bobM=.042*g1*Math.sin(10.4*t),bobG=.046*g2*Math.sin(10.73*t+.62);
    mare.root.position.set(x,0,mareZ);mare.root.rotation.y=yaw;
    grey.root.position.set(greyX,0,greyZ);grey.root.rotation.y=key(t,[[0,0],[40,0],[43.75,-.26],[60,-.26]]);
    foal.root.position.set(key(t,[[0,54.12],[54,54.12],[57.8,54.65]]),0,key(t,[[0,-3.72],[42,-3.72],[46,-3.44],[55.3,-3.44],[58.55,-5.67]]));
    const foalClear=ease(t,53.00,55.23)*(1-ease(t,56.02,57.76));
    foal.root.rotation.y=-1.55+.1*Math.sin(t*.62)-.53*ease(t,55.6,58.5)-.48*foalClear;
    const mareToss=pulse(t,16.39,16.68,17.18);
    const greyToss=pulse(t,16.47,16.77,17.24);
    const foalCall=pulse(t,36.35,36.74,37.95)*(1-.89*pulse(t,36.95,37.12,37.29));
    const mareAnswer=pulse(t,37.58,38.15,39.35);
    const foalReply=pulse(t,51.74,52.08,52.94);
    const attention=pulse(t,36.77,38.47,40.01);
    mare.pose(t,g1,key(t,[[0,.11],[36,.1],[38,-.09],[42,.05],[46,.53],[51,.48],[53,.57],[59,.59]])-.30*mareToss-.16*mareAnswer);
    grey.pose(t+.137,g2,.1+.08*Math.sin(t*2.4)*g2-.32*greyToss);
    const foalSteps=Math.max(.24*pulse(t,53.00,54.74,56.22),(ease(t,54.7,55.6)-ease(t,57.8,58.8))*.32);
    foal.pose(t+.43,foalSteps,.09+.12*Math.sin(t*3.7)*(1-ease(t,55,59))-.13*foalCall);
    mare.lookAcross(.72*attention);
    mare.call(mareAnswer);
    foal.call(Math.max(foalCall,foalReply));
    // The foal's reaching nose meets the mare across the top rail. As the gate
    // swings in, it backs a few steps with its mother and settles under her chin.
    const contact=ease(t,44.8,46.5);
    if(contact>0){
      const noses=mare.muzzle.getWorldPosition(new T.Vector3()).sub(foal.muzzle.getWorldPosition(new T.Vector3()));
      foal.root.position.x+=contact*(noses.x+.06*ease(t,56.2,59))+1.37*foalClear;
      foal.root.position.z+=contact*(noses.z-.09+.09*ease(t,56.2,59))-.89*foalClear;
    }
    const disR=ease(t,47.25,49.5),disL=ease(t,43.8,46.45),escape=ease(t,53.70,55.7);
    const riddenR=disR<1,riddenL=disL<1;
    const strain=pulse(t,50.44,51.31,52.92);
    const step=ease(t,49.60,50.27)*(1-ease(t,53.8,54.42));
    const lucWalk = t>=46.45&&t<49.70
      ? lucApproach.sample("luc",(t-46.45)/3.25*lucApproach.performance.duration)
      : undefined;
    const remyRun = t>=54.15 ? remyDeparture.sample("remy",clamp((t-54.15)/5.85)*nativeDepartureEnd) : undefined;
    const roadRun = remyRun === undefined ? .05*ease(t,53.69,54.15) : .05+remyRun.position.z;
    const rx=T.MathUtils.lerp(x-.11*Math.cos(yaw),55.72,disR)+.14*step+.15*strain+roadRun;
    const rz=T.MathUtils.lerp(mareZ+.11*Math.sin(yaw),-1.64,disR)+.08*step+escape*1.52;
    const stopsRemy=ease(t,49.66,50.31)*(1-ease(t,52.92,53.80));
    const groundApproach=lucWalk?.position.z ?? (t>=49.70?1.33:0);
    const lx=T.MathUtils.lerp(greyX-.09,53.73,disL)+groundApproach+.47*stopsRemy+.08*strain;
    const lz=T.MathUtils.lerp(greyZ,-1.65,disL)-.15*stopsRemy-.28*ease(t,52.96,54.35);
    remy.root.position.set(rx,(mare.seatHeight+bobM)*(1-disR),rz);
    luc.root.position.set(lx,(grey.seatHeight+bobG)*(1-disL),lz);
    remy.root.rotation.y=yaw*(1-disR)-.28*disR-.18*strain+.22*escape;
    luc.root.rotation.y=grey.root.rotation.y*(1-disL)+.60*ease(t,52.1,54.5);
    const paymentReach=ease(t,1.25,1.95)*(1-ease(t,2.45,3.21));
    clerk.root.position.set(-.87+.43*paymentReach,0,1.49-.63*paymentReach);
    clerk.root.rotation.y=.81+.67*paymentReach-.28*ease(t,6.2,8.3);
    const firstStep=.26*pulse(t,49.60,49.94,50.29);
    remy.pose(t,disR===0?"ride":riddenR?"dismount":t>=54.15||firstStep>0?"run":"stand",disR===0?g1:riddenR?disR:Math.max(escape,firstStep));
    luc.pose(t,disL===0?"ride":riddenL?"dismount":"stand",disL===0?g2:riddenL?disL:0);
    clerk.pose(t,t<3?"reach":"stand",1-ease(t,2.3,3));
    clerk.perform(.24*paymentReach,.09*paymentReach,.16*paymentReach-.11*ease(t,7.25,8.26));
    const recoil=ease(t,25.74,26.09)-ease(t,26.21,27.03);
    const answer=ease(t,12.82,14.07)-ease(t,17.18,18.78);
    const home=ease(t,38.1,40.2)-ease(t,44,46.4);
    const armourYell=pulse(t,27.3,27.55,28.38);
    remy.perform((riddenR? .045:.11*escape)+.20*armourYell+.19*strain,1.21*answer+.76*home-.34*(ease(t,2.8,3.6)-ease(t,5.6,6.7))-.61*pulse(t,50.1,51.2,54.1),.20*(ease(t,1.5,1.9)-ease(t,3,3.65))+.13*home);
    const lucLooksAtHorses=pulse(t,51.72,52.28,52.95);
    luc.perform(.05+.31*recoil+.15*(ease(t,32.9,33.12)-ease(t,33.27,34.1))+.06*stopsRemy,.49*(ease(t,2.8,3.6)-ease(t,5.6,6.7))+.69*(ease(t,49,50.4)-ease(t,54.8,56))-1.04*lucLooksAtHorses,.30*(ease(t,49,50.5)-ease(t,54.8,56))+.10*recoil-.23*lucLooksAtHorses);
    mare.setEarTurn(1.04*(ease(t,36.55,37.65)-ease(t,40.20,41.55)));
    const syllables=(start:number,end:number)=>pulse(t,start,start+.08,end)*(.43+.57*Math.abs(Math.sin((t-start)*19.5)));
    luc.speak(Math.max(syllables(3.09,4.927),syllables(12.72,13.481),syllables(51.00,51.649)));
    clerk.speak(syllables(7.57,8.627));
    remy.speak(Math.max(syllables(5.59,6.872),armourYell));
    remy.closePurse(ease(t,5.53,6.2));
    const sleeveHeld=ease(t,50.10,50.43)*(1-ease(t,52.78,53.28));
    remy.gatherSleeve(sleeveHeld);
    if(t>5.35&&t<6.78){
      const cinch=pulse(t,5.35,5.88,6.78);
      remy.reachHand("left",remy.leftHand.getWorldPosition(v(0,0,0)).lerp(remy.purseMouth.getWorldPosition(v(0,0,0)).add(v(-.025,.022,.056)),cinch));
    }
    if (t>50.09&&t<53.4){
      const motion=pulse(t,50.09,51.09,53.39);
      const palm=remy.leftHand.getWorldPosition(v(0,0,0));
      remy.reachHand("left",palm.add(v(.22*motion,.15*motion,.06*motion)));
      remy.setGrip("left",.06);
    }
    // The boot soles sit about 48 mm closer to the ankle than the canonical bare-foot surface.
    // Settle that difference after the first pivot, without editing the admitted step lengths.
    if (lucWalk) luc.groundTravel(lucWalk,false,.045*ease(t,46.45,46.77)*(1-ease(t,49.40,49.70)));
    if (remyRun) remy.groundTravel(remyRun,true,.048*ease(t,54.37,54.95));
    if(t>54.2)remy.reachHand("right",remy.purse.getWorldPosition(new T.Vector3()).add(v(.014,-.024,.033)));
    const miss=pulse(t,12.2,13.31,14.67);
    const scrape=pulse(t,15.49,16.38,17.10);
    const clack=pulse(t,25.21,25.83,26.33);
    const drum=pulse(t,27.08,27.61,28.15);
    const thud=pulse(t,32.43,32.91,33.22);
    const swing=(ease(t,26.5,27.3)-ease(t,32.2,32.8))*(0.5+0.5*Math.sin(t*6.15));
    if (riddenR) {
      const palm=remy.rightHand.getWorldPosition(v(0,0,0));
      remy.reachHand("right",palm.add(v(.08*scrape-.22*clack-.08*thud,.12*scrape+.31*clack+.16*swing+.22*thud,-.19*scrape-.39*clack-.16*thud)));
      mare.setReinHands(remy.leftHand,remy.leftHand);
    }
    if (riddenL) {
      const palm=luc.rightHand.getWorldPosition(v(0,0,0));
      luc.reachHand("right",palm.add(v(.13*miss+.33*clack+.17*drum,.1*miss+.31*clack+.24*drum,.12*clack+.11*drum)));
    }
    grey.setReinHands(luc.leftHand,luc.leftHand,v(54.75,.91,.77),ease(t,43.95,46.5));
    for(const [i,actor] of [mare,grey,foal,remy,luc,clerk].entries()){
      const sh=shadows[i]!;sh.position.set(actor.root.position.x+.22,.012+i*.0003,actor.root.position.z-.14);
      sh.rotation.z=actor.root.rotation.y;sh.visible=i===3?!riddenR:i===4?!riddenL:true;
    }
    const middleOfHands=remy.rightHand.getWorldPosition(v(0,0,0)).lerp(luc.rightHand.getWorldPosition(v(0,0,0)),.5).add(v(0,.14,0));
    for(let i=0;i<2;i++){
      const rider=i?luc:remy,mount=i?grey:mare,drop=ease(t,21.14+i*.51,21.97+i*.51);
      const pole=lances[i]!,prop=maces[i]!;
      const hand=rider.rightHand.getWorldPosition(new T.Vector3());
      const tipX=key(21.14+i*.51,road)-(i?key(21.14+i*.51,distanceBehind):0);
      pole.position.set(T.MathUtils.lerp(hand.x,tipX+.15,drop),T.MathUtils.lerp(hand.y, .065,drop),T.MathUtils.lerp(hand.z,i?-1.85:2.41,drop));
      const quiver=.087*Math.sin(26*(t-16.4))*(ease(t,16.4,16.52)-ease(t,17.9,19.3));
      pole.rotation.set(T.MathUtils.lerp(i? .20*miss:-.29*scrape,0,drop),T.MathUtils.lerp(i?0:.23*scrape,i? .28:-.24,drop),T.MathUtils.lerp(-.15+(i?-.92*miss:1.49*scrape)+quiver,i?1.57:-1.57,drop));
      const take=ease(t,23.02+i*.26,24.75+i*.18),put=i?ease(t,40.1,42.1):ease(t,33,33.8);
      const atSeat=1-take+(i?put:0);
      const wrist=(1-atSeat)*(1-put)*.07*Math.sin(t*10.2);
      const socket=mount.root.localToWorld(v(.09,mount.seatHeight-.13,.32));
      prop.position.copy(hand).add(v(0,-.10+wrist,0)).lerp(socket,atSeat);
      prop.rotation.set(0,0,Math.PI*.93*atSeat+.35*(1-atSeat)+wrist*1.8);
      const screenContact=i?Math.max(clack,drum):Math.max(clack,thud);
      const screenTarget=middleOfHands.clone().add(v(i? .29*drum:-.22*thud,i?-.11*drum:-.10*thud,0));
      const contactAngle=new T.Quaternion().setFromUnitVectors(v(0,1,0),screenTarget.sub(prop.position).normalize());
      const flourish=new T.Quaternion().setFromAxisAngle(v(1,0,0),.54*swing*(i?1:-1));
      prop.quaternion.multiply(flourish).slerp(contactAngle,screenContact);
      if(!i&&put>0){
        prop.position.lerp(v(50.25,.095,1.42),put);prop.rotation.z=T.MathUtils.lerp(prop.rotation.z,1.66,put);
      }
      const shade=wallShadows[i]!;
      shade.visible=t>=9&&t<10.92;
      const crossed=ease(t,9.02,10.85);
      shade.position.set((greyX+x)/2+(i?1:-1)*(1.71-1.83*crossed),.42+(i?1:-1)*(.115*(1-crossed)), -2.006);
      shade.rotation.z=(i?1:-1)*(.11+.13*crossed);
    }
    remy.purseMouth.getWorldPosition(pursePosition);
    const lift=ease(t,1.39,2.04),offer=ease(t,1.59,2.24),paid=ease(t,2.27,2.66);
    coin.visible=t<2.67;
    coin.position.set(T.MathUtils.lerp(-.46,pursePosition.x,offer),T.MathUtils.lerp(1.029,pursePosition.y+.13,lift)-paid*.148,T.MathUtils.lerp(1.16,pursePosition.z+.008,offer));
    coin.rotation.set(offer*(1.00+1.13*paid),.17*paid,.33*offer);
    if(t<2.86){
      const palm=clerk.rightHand.getWorldPosition(v(0,0,0));
      const pinch=coin.position.clone().add(v(-.045,.035,.012));
      clerk.reachHand("right",palm.lerp(pinch,ease(t,.86,1.40)*(1-ease(t,2.22,2.86))));
      clerk.setGrip("right",.71*offer*(1-paid));
    }
    gate.rotation.y=ease(t,54.1,56.65)*1.51+.013*Math.sin(41*t)*(ease(t,50.9,51.6)-ease(t,52.35,52.9));
    latch.rotation.z=.71*(ease(t,53.55,54.1)-ease(t,55.1,55.65));
    if(t>49.5&&t<55.00){
      const palm=luc.rightHand.getWorldPosition(v(0,0,0));
      const target=remy.sleeveGrip.localToWorld(v(-.012,.003,-.013));
      const latchPoint=latch.localToWorld(v(.08,.034,.034));
      const release=ease(t,52.82,53.28),reachLatch=ease(t,53.34,53.89);
      target.add(v(-.14*release,.04*release,-.02*release)).lerp(latchPoint,reachLatch).lerp(palm,ease(t,54.24,55.00));
      luc.reachHand("right",palm.lerp(target,ease(t,49.88,50.35)));
      luc.setGrip("right",.13+.80*sleeveHeld-.11*release+.40*pulse(t,53.62,54.04,54.82));
    }
    for(let i=0;i<motes.length;i++){
      const dust=motes[i]!,u=(t*.96+i*.071)%1;
      dust.visible=t>8&&t<38;dust.position.set(x-1.5-u*4,.045+u*.37, .42+Math.sin(i*81.8+u*4)*.55);
      const r=.028+Math.sin(u*Math.PI)*.10;dust.scale.set(r*1.43,r*.57,r);
    }
    const mid=(greyX+x)/2;
    if(t<1.38)frame(v(-3.7+.28*t,2.18,6.9),v(-.95,1.56,.28),37);
    else if(t<2.9){
      const coinPath=coin.position.clone().lerp(pursePosition,.46*offer+.53*paid);
      frame(v(.99,2.32,1.75),coinPath,32-4.5*offer);
    }
    else if(t<4.05)frame(v(x-2.15,.57,-1.85),v(x-.69,.58,mareZ),31);
    else if(t<5.42)frame(v(greyX+2.4,2.59,2.78),v(greyX+.07,grey.seatHeight+.53,greyZ),34);
    else if(t<6.90)frame(v(x+2.45,2.53,3.38),v(x-.04,1.97,mareZ),34);
    else if(t<9)frame(v(x+.16,2.22,6.5),v(mid-.28,1.38,.02),35);
    else if(t<10.92)frame(v(mid+.1,.62,-.69),v(mid,.42,-2.09),55);
    else if(t<15.7)frame(v(mid+.24,1.57,7.75),v(mid+.1,1.50,-.06),38);
    else if(t<18.4)frame(v(mid+1.75,2.05,6.54),v(mid+.08,1.70,mareZ),37);
    else if(t<21)frame(v(mid+1.15,1.54,7.3),v(mid+.12,1.34,0),34);
    else if(t<24.3)frame(v(28.2+1.1*(t-21),2.6,8.2),v(28.8+1.12*(t-21),1.03,.1),39);
    else if(t<27.2)frame(v(mid+.93,1.75,7.58),v(mid+.12,1.62,-.06),35);
    else if(t<30)frame(v(mid+2.16,2.27,5.15),v(mid+.11,1.97,.03),31);
    else if(t<36)frame(v(mid+1.16,1.87,8.66),v(mid+.1,1.33,-.05),36);
    else if(t<37.95)frame(v(54.40,1.73,-.17),v(54.03,1.23,-3.32),27);
    else if(t<40.9)frame(v(x+2.34,1.8,3.15),v(x+.67,1.73,mareZ),33);
    else if(t<44.8)frame(v(56.4-ease(t,41,44)*.9,2.33,7.2),v(54.00,1.3,-1.37),38);
    else if(t<47.45){
      const meeting=mare.muzzle.getWorldPosition(new T.Vector3()).lerp(foal.muzzle.getWorldPosition(new T.Vector3()),.45);
      frame(v(57.38,1.72,-2.16),meeting,31);
    } else if(t<49.79)frame(v(57.22,2.34,4.41),v(54.74,1.32,-1.66),35);
    else if(t<54.84){
      const hand=luc.rightHand.getWorldPosition(new T.Vector3());const click=latch.getWorldPosition(new T.Vector3());
      const faceToLatch=ease(t,53.1,54.22);
      const aim=v(55.40,1.39,-1.81).lerp(hand.clone().lerp(click,.56),faceToLatch).add(v(0,.06,0));
      frame(v(55.16,2.43,-4.03),aim,35);
    } else if(t<58.02)frame(v(58.48,3.03,-.66),v(54.63,1.18,-2.58),39);
    else frame(v(58.55+.45*(t-57.55),3.88,8.20+.33*(t-57.55)),v(57.15+.61*(t-57.55),.98,-1.30),42);
    camera.updateMatrixWorld();scene.updateMatrixWorld(true);
  };
  seek(0);
  return {scene,camera,seek,dispose:()=>{scene.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});for(const sh of shadows){sh.material.map?.dispose();sh.material.dispose();}scene.clear();}};
}
