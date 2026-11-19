import * as THREE from "three";

import type { ArtDepartment } from "../../../shared/ArtDepartment";
import { roundFloor } from "../../../shared/roundFloor";
import { matMaterial } from "./matMaterial";

const { canvasWorldY: CANVAS_WORLD_Y } = roundFloor;

/** Adds a seated figure at a supplied world position while the set is being built. */
type SeatOccupant = (
  art: ArtDepartment,
  set: THREE.Group,
  x: number,
  y: number,
  z: number,
  angle: number,
  shirt: string,
  skin: string,
  hair: string,
  tall: number,
  lean: number,
) => void;

const red = "#a5242e", blue = "#224b99", ivory = "#c5c6b9";

function noise(seed: number): number {
  const n = Math.sin(seed * 273.31 + 9.7) * 79367.71;
  return n - Math.floor(n);
}

/**
 * Adds the unbranded raised ring, four corner colours, lights and seated crowd to a film scene. Scene dimensions are metres. The returned apply function uses programme seconds for the rope movement. The caller disposes the arena and the supplied shared art.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment describes the arena's contents, the units and rope timebase, and the boundary between local and shared resources.
 * @evidence contracts/development/implementation.md#principled-implementation Ring dimensions, colours and pads identify the four scripted directions. Dynamic west ropes bend locally at the scripted encounters and damp around their rest line.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure One construction owns canvas, set, lighting and seating. The per-seek rope update fits only the pieces that change.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Rope impulses implement the authored beat locations. Static seating uses a deterministic variation of the production palette rather than stored output frames.
 * @evidence contracts/development/implementation.md#efficient-algorithms Construction scales with the fixed seating rows and arena pieces. Each seek visits only thirteen points per dynamic rope and two prescribed impulses.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Static pieces are batched by material once. Each request reuses the fixed meshes and the rope vectors while updating transforms.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The arena owns the fixture material and canvas material, texture and geometry. dispose releases these, while the caller releases the shared art and scene.
 * @evidence contracts/development/entities.md#settings-realization docs/body/screenplay/kickboxing/020-the-round.md#p01 fixes the pale floor, dark circle, four pad colours and lit seating. Its #p01-b03 and #p02-b01 direct the rope response. The archived research/kickboxing/round-practice.md#this-ring informs arena scale, while the local 6.81 metre canvas and lighting positions are authored approximations.
 * @evidence contracts/development/entities.md#object-shape Layout is constructed once. The set root, dynamic rope layer, apply and dispose form a drawing handle. The scene injects the audience figure builder. Apply samples the existing mutable rope geometry against programme time, a display capability rather than an immutable action class.
 * @evidence contracts/development/entities.md#controls-and-source The local Three.js geometry, shared procedural canvas and fixed lamp parameters build the draw scene. Set and stage boundaries have no external mesh conversion or connection frames. Small authored displacement events govern the west rope and are visible on the returned set.
 */
export function createArena(scene: THREE.Scene, art: ArtDepartment, seatOccupant: SeatOccupant) {
  const set = new THREE.Group(), shadowLayer = new THREE.Group();
  scene.add(set, shadowLayer);
  const solid = (s: "box" | "round" | "tube" | "flat", c: string, p: number[], d: number[]) => art.form(s,c,p,d,set);
  const vertical = new THREE.Vector3(0,1,0), aim = new THREE.Vector3();
  const ropes: { rest: THREE.Vector3; points: THREE.Vector3[]; rods: THREE.Mesh[] }[] = [];
  const fitBar = (part: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3): void => {
    aim.subVectors(b,a);
    part.position.copy(a).lerp(b,.5);
    part.scale.y=aim.length();
    part.quaternion.setFromUnitVectors(vertical,aim.normalize());
  };
  const bar = (a: THREE.Vector3, b: THREE.Vector3, diameter: number, colour: string): void => {
    const part=solid("tube",colour,[0,0,0],[diameter,1,diameter]);
    fitBar(part,a,b);
  };
  solid("box","#19242c",[0,-0.86,0],[38,0.15,39]);
  solid("box","#253946",[0,-0.39,0],[6.96,0.74,6.96]);
  solid("box","#a29c8e",[0,-0.045,0],[6.96,0.10,6.96]);
  const canvasMaterial=matMaterial(); const canvasGeometry=new THREE.PlaneGeometry(6.81,6.81); const canvas=new THREE.Mesh(canvasGeometry,canvasMaterial); canvas.rotation.x=-Math.PI/2; canvas.position.y=CANVAS_WORLD_Y; scene.add(canvas);
  for (const z of [-3.49,3.49]) {
    solid("box","#627786",[0,-0.18,z],[6.94,0.05,0.018]);
    solid("box","#152b39",[0,-0.69,z],[6.94,0.10,0.02]);
    for(let k=-3;k<=3;k++)solid("box","#354b57",[k,-0.41,z],[0.025,0.43,0.023]);
  }
  const circle = new THREE.Mesh(new THREE.RingGeometry(0.726,0.756,96),art.material("#363b39"));
  circle.rotation.x=-Math.PI/2;circle.position.y=0.006;set.add(circle);art.built.add(circle.geometry);
  const corners=[[-3.05,3.05,red],[3.05,3.05,ivory],[3.05,-3.05,blue],[-3.05,-3.05,ivory]] as const;
  for(let i=0;i<4;i++) {
    const [x,z,color]=corners[i]!, [nx,nz]=corners[(i+1)%4]!;
    const fx=Math.sign(x),fz=Math.sign(z);
    solid("tube","#42494a",[x+fx*.12,.64,z+fz*.12],[.14,1.48,.14]);
    const pad=solid("box",color,[x,.78,z],[.29,.93,.24]);pad.rotation.y=Math.atan2(x,z);
    for (const y of [.42,.67,.92,1.17]) {
      const toward=new THREE.Vector3(nx-x,0,nz-z).normalize();
      const a=new THREE.Vector3(x,y,z).addScaledVector(toward,.15), b=new THREE.Vector3(nx,y,nz).addScaledVector(toward,-.15);
      const middle=a.clone().lerp(b,.5);middle.y-=.027;
      const ropeColour=y>1?"#bcbdb4":y<.45?"#6a7473":"#94a09c";
      if(i===3){
        const points=Array.from({length:13},(_,k)=>a.clone().lerp(b,k/12));
        const rods=points.slice(1).map(()=>art.form("tube",ropeColour,[0,0,0],[.023,1,.023],shadowLayer));
        ropes.push({rest:a.clone(),points,rods});
      }else{
        bar(a,middle,.023,ropeColour);
        bar(middle,b,.023,ropeColour);
      }
      bar(a.clone(),a.clone().addScaledVector(toward,.38),.037,color);
      bar(b.clone(),b.clone().addScaledVector(toward,-.38),.037,corners[(i+1)%4]![2]);
    }
    for(const frac of [.29,.71]) {
      const q=new THREE.Vector3().lerpVectors(new THREE.Vector3(x,0,z),new THREE.Vector3(nx,0,nz),frac);
      solid("flat","#6e7979",[q.x,.79,q.z],[.029,.71,.029]);
    }
  }
  // The bare floor extends under banked seats; dim silhouettes stay behind the action.
  const coats=["#253241","#333945","#26313e","#2f3a48","#303b44","#393743","#3c4852"];
  const faces=["#6f564b","#776353","#50433d","#876d56","#655043","#796456"];
  for(let side=0;side<4;side++) for(let row=0;row<4;row++){
    const d=6.0+row*.86,y=-.78+row*.41;
    const horiz=side<2,signal=side%2?1:-1;
    solid("box","#27343e",horiz?[0,y-.12,signal*d]:[signal*d,y-.12,0],horiz?[17,.24,.77]:[.77,.24,12]);
    for(let seat=0;seat<(horiz?19:13);seat++){
      const k=row*113+seat*3+side*557;const pos=(seat-(horiz?9:6))*.83+noise(k)*.10;
      const x=horiz?pos:signal*d,z=horiz?signal*d:pos;
      const height=.02+.12*noise(k+1);
      const yaw=Math.atan2(-x,-z)+.21*(noise(k+27)-.5);
      seatOccupant(art,set,x,y,z,yaw,coats[Math.floor(noise(k+3)*coats.length)]!,faces[Math.floor(noise(k+7)*faces.length)]!,["#353139","#4b4238","#343a3e"][k%3]!,height,(noise(k+8)-.5)*.22);
    }
  }
  for(const side of [-1,1]){
    solid("box","#16232e",[0,2.7,side*11],[29,8,.20]);
    solid("box","#1a2834",[side*12,2.7,0],[.20,8,24]);
    for(let k=-4;k<=4;k++) {
      solid("box","#34424b",[k*2.5,3.1,side*10.7],[.095,7,.15]);
      solid("box","#6b7e88",[k*2.5,3.68,side*10.55],[.60,.045,.025]);
    }
  }
  const fixture=new THREE.MeshBasicMaterial({color:"#f9ebcf"});
  for(const sign of [-1,1])for(let k=-2;k<=2;k++){
    const g=new THREE.BoxGeometry(.75,.045,.24);art.built.add(g);
    const m=new THREE.Mesh(g,fixture);m.position.set(k*1.65,4.65,sign*4.25);set.add(m);
  }
  scene.add(new THREE.HemisphereLight(0xdce8ee,0xb49372,1.85));
  const key=new THREE.DirectionalLight(0xffe9cd,2.5);key.position.set(-4,8,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0xbcd8f2,1.65);rim.position.set(3,5,-5);scene.add(rim);
  const witnessLight=new THREE.SpotLight(0xffe1b6,19,10,.62,.68,2);
  witnessLight.position.set(4.4,3.7,3.1);witnessLight.target.position.set(2.7,.1,1.8);
  scene.add(witnessLight,witnessLight.target);
  const officiatingLight=new THREE.SpotLight(0xdfebf5,25,12,.64,.72,1.8);officiatingLight.position.set(.6,4.3,-3.5);officiatingLight.target.position.set(0,.9,0);scene.add(officiatingLight,officiatingLight.target);
  art.batch(set);
  function apply(t:number):void {
    const ropesAt = [[14.65,2.24,.19],[27.92,-.10,.16]] as const;
    for(const {rest,points,rods} of ropes){
      for(const [i,point] of points.entries()){
        const u=i/(points.length-1), z=-2.90+u*5.80;
        let flex=0;
        for(const [onset,zAt,depth] of ropesAt){
          const dt=t-onset;
          if(dt<0||dt>4.4) continue;
          const place=Math.exp(-((z-zAt)**2)/.73)*Math.sin(Math.PI*u)**.45;
          const pressure=dt<.5?Math.sin(Math.PI*dt)**1.25:Math.cos(17*(dt-.5))*Math.exp(-(dt-.5)*1.55);
          flex+=depth*pressure*place;
        }
        point.set(rest.x-flex,rest.y-.027*Math.sin(Math.PI*u),z);
      }
      for(const [i,rod] of rods.entries())fitBar(rod,points[i]!,points[i+1]!);
    }
  }
  return {set,shadowLayer,apply,dispose:()=>{fixture.dispose();canvasGeometry.dispose();canvasMaterial.map?.dispose();canvasMaterial.dispose();}};
}
