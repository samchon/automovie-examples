import * as THREE from "three";
import { courtHoop } from "./courtHoop";

/** A deterministic maple finish; the painter's axes are court metres, with +Z toward the scorer's table. */
function mapleCourt(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2304;
  canvas.height = 1536;
  const g = canvas.getContext("2d")!;
  g.scale(64, 64);
  g.translate(18, 12);
  let seed = 44291;
  const random = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  g.fillStyle = "#ab7646";
  g.fillRect(-18, -12, 36, 24);
  for (let row = 0; row < 120; row++) {
    const z = -12 + row * 0.2;
    let x = -21 + random() * 2.1;
    while (x < 18) {
      const length = 1.35 + random() * 1.75;
      const tone = random();
      g.fillStyle = `rgb(${Math.round(189 + 22 * tone)},${Math.round(148 + 22 * tone)},${Math.round(105 + 20 * tone)})`;
      g.fillRect(x + 0.009, z + 0.006, length - 0.014, 0.19);
      g.strokeStyle = "rgba(113,64,27,.13)";
      g.lineWidth = 0.008;
      for (let strand = 0; strand < 3; strand++) {
        const from = x + random() * 0.5;
        const h = z + 0.025 + random() * 0.14;
        g.beginPath();
        g.moveTo(from, h);
        g.bezierCurveTo(from + 0.35, h - 0.02, x + length - 0.48, h + 0.022, x + length - 0.07, h);
        g.stroke();
      }
      x += length;
    }
  }
  g.fillStyle = "rgba(102,53,29,.22)";
  for (const sign of [-1, 1]) {
    g.beginPath();
    g.moveTo(14 * sign, -3);
    g.lineTo(8.2 * sign, -1.8);
    g.lineTo(8.2 * sign, 1.8);
    g.lineTo(14 * sign, 3);
    g.closePath();
    g.fill();
  }
  g.strokeStyle = "#fff4d4";
  g.lineWidth = 0.065;
  g.strokeRect(-14, -7.5, 28, 15);
  const line = (points: number[][]): void => {
    g.beginPath();
    points.forEach(([x, z], i) => i === 0 ? g.moveTo(x, z) : g.lineTo(x, z));
    g.stroke();
  };
  const arc = (x: number, radius: number, from: number, to: number): void => {
    g.beginPath();
    g.arc(x, 0, radius, from, to);
    g.stroke();
  };
  line([[0, -7.5], [0, 7.5]]);
  g.beginPath();
  g.arc(0, 0, 1.8, 0, 2 * Math.PI);
  g.fillStyle = "rgba(246,230,199,.88)";
  g.fill();
  g.stroke();
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.font = 'bold 1.32px "Yu Mincho","Malgun Gothic",serif';
  g.fillStyle = "#8a3936";
  g.fillText("湘北", 0, 0.1);
  for (const side of [-1, 1]) {
    const hoop = side * 12.425;
    line([[14 * side, -3], [8.2 * side, -1.8], [8.2 * side, 1.8], [14 * side, 3]]);
    arc(8.2 * side, 1.8, side === 1 ? Math.PI / 2 : -Math.PI / 2, side === 1 ? 3 * Math.PI / 2 : Math.PI / 2);
    g.setLineDash([0.25, 0.27]);
    arc(8.2 * side, 1.8, side === -1 ? Math.PI / 2 : -Math.PI / 2, side === -1 ? 3 * Math.PI / 2 : Math.PI / 2);
    g.setLineDash([]);
    arc(hoop, 6.25, side === 1 ? Math.PI / 2 : -Math.PI / 2, side === 1 ? 3 * Math.PI / 2 : Math.PI / 2);
    for (const flank of [-1, 1]) {
      line([[14 * side, flank * 6.25], [hoop, flank * 6.25]]);
      for (const offset of [1.75, 2.65, 3.55, 4.45]) {
        const z = flank * (3 - (offset * 1.2) / 5.8);
        line([[(14 - offset) * side, z], [(14 - offset) * side, z + flank * 0.19]]);
      }
    }
  }
  // Broad pools of window light stay attached to the wood throughout both camera angles.
  g.fillStyle = "rgba(255,230,177,.10)";
  for (let x = -17; x < 15; x += 5.2) {
    g.beginPath();
    g.moveTo(x, -11);
    g.lineTo(x + 2.4, -11);
    g.lineTo(x + 5.9, -3.9);
    g.lineTo(x + 3.5, -3.9);
    g.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Builds the fixed 1994 practice court, baskets, gallery and clock housing. The clock face is updated from the broadcast's official live state.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Mounts the set into the caller's scene. Seek accepts played seconds, replay state and the live clock and score. Dispose releases the mounted textures, materials, lights and geometry.
 * @evidence contracts/development/implementation.md#principled-implementation Court markings use a single metre-scale plan, the 6.25 m arc and trapezoidal key, with both rims drawn at the action targets.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Architecture uses instances of boxes, rods and rounded spectator silhouettes; distinct hoops, courts and signs retain their own materials.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Both baskets and their nets occupy three-dimensional space, and the court, benches and opposing gallery remain in every camera angle.
 * @evidence contracts/development/implementation.md#efficient-algorithms Stationary architecture is batched by geometry once; the scoreboard texture is painted only when its text changes.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work One atlas contains court finish and painted lines, and all repeated building elements share a single mesh per shape.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Each mount owns and releases its textures, geometries, materials, lights and static meshes through dispose.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/sets/shohoku-gym.md#court fixes court directions, benches, clock and period markings. docs/research/basketball/period-and-play.md#floor gives the 6.25 m arc and 6.0/3.6 m trapezoid.
 * @evidence contracts/development/entities.md#object-shape The authored gym defines fixed building and court dimensions. Glass and ring draw coordinates come from the same fixture placement used by the staged ball, with the board face and board dimensions from the installed hoop archetype.
 * @evidence contracts/development/entities.md#controls-and-source Both cameras use the same procedural set, with rim and net response coefficients authored for docs/body/screenplay/two-hands/010-game.md#dunk and its #replay, the live score and the last shot in #last-board.
 */
export function createGym(scene: THREE.Scene): {
  seek(air:number,state:{play:number;replay:boolean;remaining:number;home:number;away:number}):void;
  dispose():void;
} {
  const group = new THREE.Group();
  group.name = "Shohoku High School gymnasium";
  scene.add(group);
  const oldBackground = scene.background;
  scene.background = new THREE.Color(0xb8c2bd);
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const geometries = new Set<THREE.BufferGeometry>();
  const make = (geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh => {
    const mesh = new THREE.Mesh(geometry, material);
    geometries.add(geometry);
    materials.add(material);
    group.add(mesh);
    return mesh;
  };
  const surface = (color: number): THREE.MeshLambertMaterial => new THREE.MeshLambertMaterial({color});
  const floorMap = mapleCourt();
  textures.add(floorMap);
  const floorMaterial = new THREE.MeshStandardMaterial({map: floorMap, roughness: 0.76});
  const floor = make(new THREE.PlaneGeometry(36, 24), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  // Continue the out-of-bounds maple under the high table camera without rescaling the painted court.
  const aisleGeometry = new THREE.PlaneGeometry(36, 8);
  const aisleUV = aisleGeometry.getAttribute("uv");
  for (let i = 0; i < aisleUV.count; i++) aisleUV.setY(i, (1 - aisleUV.getY(i)) / 6);
  const aisle = make(aisleGeometry, floorMaterial);
  aisle.rotation.x = floor.rotation.x;
  aisle.position.z = 16;
  aisle.receiveShadow = true;

  type Piece = { matrix: THREE.Matrix4; color: number };
  const boxes: Piece[] = [], rods: Piece[] = [], heads: Piece[] = [];
  const stamp = new THREE.Object3D();
  const box = (x:number,y:number,z:number,w:number,h:number,d:number,color:number):void => {
    stamp.position.set(x,y,z); stamp.rotation.set(0,0,0); stamp.scale.set(w,h,d); stamp.updateMatrix();
    boxes.push({matrix:stamp.matrix.clone(),color});
  };
  const cylinder = (from:number[],to:number[],radius:number,color:number):void => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    stamp.position.copy(a).lerp(b,0.5);
    stamp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
    stamp.scale.set(radius,dir.length(),radius); stamp.updateMatrix();
    rods.push({matrix:stamp.matrix.clone(),color});
  };
  const oval = (x:number,y:number,z:number,w:number,h:number,d:number,color:number):void => {
    stamp.position.set(x,y,z); stamp.rotation.set(0,0,0); stamp.scale.set(w,h,d); stamp.updateMatrix();
    heads.push({matrix:stamp.matrix.clone(),color});
  };
  function sign(w:number,h:number,x:number,y:number,z:number,paint:(g:CanvasRenderingContext2D)=>void, pixels=768): THREE.CanvasTexture {
    const c=document.createElement("canvas");
    c.width=pixels; c.height=Math.round(pixels*h/w);
    const context=c.getContext("2d")!;
    context.scale(c.width/w,c.height/h); paint(context);
    const texture=new THREE.CanvasTexture(c); texture.colorSpace=THREE.SRGBColorSpace; textures.add(texture);
    const plane=make(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));
    plane.position.set(x,y,z);
    return texture;
  }
  // Timber lower wall, frosted clerestories and exposed roof trusses.
  const wood=0x996941, steel=0x485c5d, plaster=0xd4d3bf, mullion=0x738a86;
  const baskets: {end:number; hinge:THREE.Group; net:THREE.Group}[]=[];
  for(const end of [-1,1]){
    box(end*17.85,5.8,0,0.3,11.6,24,plaster);
    box(end*17.64,1.32,0,0.14,2.64,24,wood);
    box(end*17.53,1.08,0,0.12,2.16,11.4,0x435e58);
    for(let z=-5.3;z<5.5;z+=0.82) box(end*17.45,1.08,z,0.025,2.12,0.022,0x2f4946);
    for(let z=-9.5;z<=9.5;z+=3.8){
      box(end*17.58,5.72,z,0.12,2.06,3.3,mullion);
      box(end*17.5,5.72,z,0.03,1.9,3.1,0xc5e3df);
      box(end*17.46,5.72,z,0.05,1.94,0.055,mullion);
      box(end*17.46,5.72,z,0.05,0.055,3.14,mullion);
    }
  }
  box(0,5.8,-11.88,36,11.6,0.35,plaster);
  box(0,1.43,-11.63,36,2.86,0.15,wood);
  box(0,2.72,-11.46,36,0.12,0.13,0x6c4c36);
  for(let x=-17.2;x<=17.3;x+=0.37) box(x,1.42,-11.54,0.022,2.82,0.03,0x805637);
  for(let x=-15.3;x<=15.4;x+=5.1){
    box(x,5.85,-11.58,4.62,2.75,0.17,mullion);
    box(x,5.85,-11.47,4.44,2.56,0.06,0xc5e8e8);
    for(const offset of [-1.48,0,1.48]) box(x+offset,5.85,-11.41,0.062,2.59,0.05,mullion);
    box(x,5.7,-11.41,4.49,0.062,0.05,mullion);
    box(x,4.42,-11.42,4.8,0.1,0.35,0xb0a391);
  }
  for(let x=-16.5;x<=16.6;x+=5.5){
    box(x,10.9,-0.5,0.16,0.24,23,steel);
    cylinder([x,11,-11.6],[x,13.25,0],0.11,steel);
    cylinder([x,13.25,0],[x,11,11.6],0.11,steel);
    for(let z=-9;z<9;z+=3) cylinder([x,10.95,z],[x,11.17+(1-Math.abs(z+1.5)/12)*2,z+1.5],0.055,steel);
    for(const z of [-5.2,5.2]){
      box(x,10.8,z,2.4,0.12,0.37,0x7f877a);
      box(x,10.725,z,2.27,0.035,0.29,0xfff4d7);
    }
  }
  // Practice-game spectators sit beyond the opposite sideline. The low rail leaves faces visible.
  for(let row=0;row<3;row++){
    const z=-8.72-row*0.75, top=0.37+row*0.38;
    for(const sx of [-8.35,8.35]){
      box(sx,top,z,12.2,0.13,0.5,0x9f7651);
      for(const x of [sx-4.8,sx,sx+4.8]) box(x,top/2,z,0.18,top,0.34,steel);
    }
    const palette=[0x566565,0x657471,0x7f7870,0x50647a,0x9e8265,0x875f5a,0xa69e82];
    for(let j=0;j<14;j++){
      if((j+row*2)%4===1) continue;
      const x=(j<7?-14.0:-0.5)+((j%7)*1.68)+row*0.12;
      const torso=palette[(j*3+row*5)%palette.length];
      const skin=[0xbf987d,0xd6b394,0xcfa889][(j+row)%3];
      oval(x,top+0.48,z,0.23,0.35,0.16,torso);
      oval(x,top+0.71,z+0.01,0.21,0.11,0.14,torso);
      oval(x,top+0.91,z+0.025,0.13,0.165,0.135,skin);
      oval(x,top+1.00,z+0.008,0.138,0.095,0.137,0x3a3633);
      for(const sign of [-1,1]){
        const elbowZ=z+0.08+0.035*((j+row)%3);
        cylinder([x+sign*0.18,top+0.69,z],[x+sign*0.245,top+0.41,elbowZ],0.072,torso);
        cylinder([x+sign*0.245,top+0.41,elbowZ],[x+sign*0.17,top+0.24,z+0.29],0.055,skin);
        cylinder([x+sign*0.12,top+0.1,z],[x+sign*0.15,top+0.11,z+0.33],0.08,0x4a5158);
        const ankle=Math.max(0.05,top-0.35);
        cylinder([x+sign*0.15,top+0.12,z+0.33],[x+sign*0.15,ankle,z+0.34],0.07,0x454d55);
        oval(x+sign*0.15,ankle,z+0.405,0.075,0.055,0.13,0x383a37);
      }
    }
  }
  for(const x of [-4,4.8]){
    box(x,0.46,8.78,6.5,0.12,0.47,0x9c6341);
    for(const off of [-2.75,0,2.75]){
      box(x+off,0.20,8.78,0.11,0.4,0.38,steel);
      box(x+off,0.012,8.78,0.27,0.022,0.47,0x725238);
    }
  }
  box(0.35,0.78,9.68,2.35,0.13,0.78,wood);
  box(0.35,0.42,9.31,2.23,0.64,0.08,0x44625e);
  for(const x of [-0.65,1.35]) box(x,0.38,9.7,0.085,0.76,0.52,steel);

  for(const end of [-1,1]){
    const { glass: pane, ring } = courtHoop;
    const bx=end*pane.centerX, rimX=end*ring.centerX;
    // A wall-mounted truss keeps the endline floor clear for both inbound plays.
    for(const z of [-0.69,0.69]){
      cylinder([end*17.38,3.4,z],[bx,3.65,z],0.065,steel);
      cylinder([end*17.38,5.45,z],[bx,3.7,z],0.062,steel);
    }
    const glass=make(new THREE.BoxGeometry(pane.thickness,pane.height,pane.width),new THREE.MeshPhongMaterial({color:0xaad3d1,transparent:true,opacity:0.31,depthWrite:false}));
    glass.position.set(bx,pane.y,0);
    for(const z of [-0.9,0.9]) box(bx,3.425,z,0.075,1.06,0.04,0xe8e6d9);
    for(const h of [2.90,3.95]) box(bx,h,0,0.075,0.044,1.80,0xe8e6d9);
    for(const z of [-0.295,0.295]) box(bx-end*0.043,3.275,z,0.02,0.45,0.03,0xfbfbec);
    for(const h of [3.05,3.5]) box(bx-end*0.043,h,0,0.02,0.03,0.62,0xfbfbec);
    box(end*12.7,3.035,0,0.2,0.075,0.11,0xb74722);
    const rim=make(new THREE.TorusGeometry(ring.major,ring.tube,8,36),surface(0xe8632b));
    const hinge=new THREE.Group();
    hinge.position.set(end*12.7,ring.y,0);
    group.add(hinge);hinge.add(rim);
    rim.position.x=rimX-hinge.position.x; rim.rotation.x=Math.PI/2;
    const net=new THREE.Group();
    net.position.set(rim.position.x,-0.025,0);hinge.add(net);
    const cords:Piece[]=[];
    const cord=(from:number[],to:number[],radius:number):void=>{
      cylinder(from,to,radius,0xfff7dd);
      cords.push(rods.pop()!);
    };
    for(let thread=0;thread<12;thread++){
      const a=thread*(Math.PI/6);
      for(const side of [-1,1]){
        const b=a+side*Math.PI/12;
        cord([0.217*Math.cos(a),0,0.217*Math.sin(a)],[0.151*Math.cos(b),-0.2,0.151*Math.sin(b)],0.008);
        cord([0.151*Math.cos(b),-0.2,0.151*Math.sin(b)],[0.123*Math.cos(a),-0.365,0.123*Math.sin(a)],0.0075);
      }
    }
    net.add(batch(cords,new THREE.CylinderGeometry(1,1,1,6)));
    baskets.push({end,hinge,net});
  }
  function batch(parts:Piece[],geometry:THREE.BufferGeometry):THREE.InstancedMesh{
    const mat=surface(0xffffff);
    const mesh=new THREE.InstancedMesh(geometry,mat,parts.length);
    parts.forEach((part,i)=>{mesh.setMatrixAt(i,part.matrix);mesh.setColorAt(i,new THREE.Color(part.color));});
    mesh.computeBoundingSphere();
    geometries.add(geometry); materials.add(mat); group.add(mesh);
    return mesh;
  }
  batch(boxes,new THREE.BoxGeometry());
  batch(rods,new THREE.CylinderGeometry(1,1,1,8));
  batch(heads,new THREE.SphereGeometry(1,10,7));
  const wallClock=sign(4.35,1.42,0,3.35,-11.32,(g)=>{
    g.fillStyle="#253738";g.fillRect(0,0,4.35,1.42);
  });
  const board=new THREE.Object3D();
  board.name="Shohoku wall clock";
  group.add(board);
  let last="";
  board.userData.update=(home:number,away:number,clock:string):void=>{
    const key=[home,away,clock].join("/");
    if(last===key)return;
    last=key;
    const canvas=wallClock.image as HTMLCanvasElement, ctx=canvas.getContext("2d")!;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle="#253738";ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillStyle="#f0ead5";ctx.font='bold 42px "Yu Gothic","Malgun Gothic",sans-serif';
    ctx.fillText("湘 北",135,58);ctx.fillText("浜 浦",636,58);
    ctx.fillStyle="#ffcb78";ctx.font='bold 96px Consolas, monospace';
    ctx.fillText(String(home),135,159);ctx.fillText(String(away),636,159);
    ctx.font='bold 65px Consolas, monospace';ctx.fillText(clock,384,142);
    wallClock.needsUpdate=true;
  };
  board.userData.update(48,50,"1:49");
  sign(4.1,0.78,-8.9,3.37,-11.32,(g)=>{
    g.fillStyle="#7f3037";g.fillRect(0,0,4.1,0.78);g.fillStyle="#fff3d8";
    g.textAlign="center";g.textBaseline="middle";g.font='bold .48px "Yu Mincho","Malgun Gothic",serif';g.fillText("湘 北 高 校",2.05,0.42);
  });
  const sky=new THREE.HemisphereLight(0xfff3d9,0xdcb894,1.38);
  const sun=new THREE.DirectionalLight(0xffe0b1,1.85);sun.position.set(-10,15,-8);
  const fill=new THREE.DirectionalLight(0xd8edff,0.84);fill.position.set(5,8,13);
  group.add(sky,sun,fill);
  return {seek:(_air,state):void=>{
    const play=state.play;
    for(const {end,hinge,net} of baskets){
      const dunk=end===1 && play>=24.46 && play<26.2;
      const handPressure=dunk ? THREE.MathUtils.smoothstep(play,24.70,24.89)*(1-THREE.MathUtils.smoothstep(play,25.1,25.31)) : 0;
      const bounce=dunk && play>=25.21 ? 0.105*Math.exp(-6.8*(play-25.21))*Math.sin(26*(play-25.21)):0;
      const rimHit=end===-1 && play>=178 && play<179.2 ? 0.055*Math.exp(-6.1*(play-178))*Math.sin(33*(play-178)):0;
      hinge.rotation.z=end*(0.24*handPressure-bounce+rimHit);
      const finish=end===1?(play<90?24.88:151.87):51.86;
      const elapsed=play-finish;
      const swish=elapsed>=0 && elapsed<1.1 ? Math.exp(-4.7*elapsed)*Math.sin(14*elapsed):0;
      net.scale.set(1+0.12*swish,1+0.54*swish,1+0.12*swish);
      net.rotation.x=swish*0.16+rimHit;
    }
    // Only the historical B image contains the wall clock as it was during the first dunk.
    const clock=Math.max(0,Math.ceil((state.replay?109-play:state.remaining)-1e-6));
    board.userData.update(state.replay && play<25?48:state.home,state.replay?50:state.away,
      Math.floor(clock/60)+":"+String(clock%60).padStart(2,"0"));
  },dispose:():void=>{
    group.removeFromParent();
    scene.background=oldBackground;
    textures.forEach(texture=>texture.dispose());
    geometries.forEach(geometry=>geometry.dispose());
    materials.forEach(material=>material.dispose());
    group.traverse(node=>{if(node instanceof THREE.InstancedMesh)node.dispose();});
  }};
}
