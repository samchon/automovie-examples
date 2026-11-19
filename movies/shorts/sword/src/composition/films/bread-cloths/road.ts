import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function smooth(a: number, b: number, t: number): number {
  const u = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return u * u * (3 - 2 * u);
}

/** The upper road doubles back over the lower, joining it on the scree at the eastern turn. */
export function ground(x: number, z: number): number {
  const upper = 1.72 - 1.02 * smooth(2.2, 5.7, x);
  const lower = 0.08 + 0.62 * smooth(-1, 5.7, x);
  const bank = Math.max(0, Math.min(1, (0.58 - z) / 0.67));
  return lower + bank * (upper - lower) - Math.max(0, -z - 2.8) * 0.40 - Math.max(0, z - 3.4) * 0.56;
}

export function solid(geometry: THREE.BufferGeometry, color: number, unlit = false): THREE.Mesh {
  const material = unlit ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshStandardMaterial({color, roughness: 0.94, flatShading: true});
  return new THREE.Mesh(geometry, material);
}

export function ellipsoid(color: number, x: number, y: number, z: number): THREE.Mesh {
  const item = solid(new THREE.SphereGeometry(1, 14, 9), color);
  item.scale.set(x, y, z);
  return item;
}

function noise(i: number): number {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Batch fixed geometry by shading model. The ridges and cast retain distinct atmospheric depths. */
function batch(group: THREE.Group): void {
  group.updateMatrixWorld(true);
  const sets: THREE.BufferGeometry[][] = [[], []];
  group.traverse(obj => {
    if (!(obj instanceof THREE.Mesh)) return;
    const geom = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
    geom.applyMatrix4(obj.matrixWorld);
    geom.deleteAttribute("uv");
    const color = (obj.material as THREE.MeshStandardMaterial).color;
    if (!geom.getAttribute("color")) {
      const colors = new Float32Array(geom.getAttribute("position").count * 3);
      for (let i = 0; i < colors.length; i += 3) color.toArray(colors, i);
      geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }
    sets[obj.material instanceof THREE.MeshBasicMaterial ? 1 : 0]!.push(geom);
    obj.geometry.dispose();
    obj.material.dispose();
  });
  group.clear();
  sets.forEach((geometries, i) => {
    if (!geometries.length) return;
    const merged = mergeGeometries(geometries);
    geometries.forEach(g => g.dispose());
    if (!merged) throw new Error("Incompatible road geometry");
    const material = i ? new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.DoubleSide}) : new THREE.MeshStandardMaterial({vertexColors:true, roughness:1, flatShading:true, side:THREE.DoubleSide});
    group.add(new THREE.Mesh(merged, material));
  });
}

export const stump = {x:-0.84, z:-0.115};
export const splitRock = {x:-2.76, z:1.42};

export function landscape(scene: THREE.Scene): void {
  scene.background = new THREE.Color(0xc6d7d9);
  scene.fog = new THREE.FogExp2(0xb4c9cb, 0.022);
  const land = new THREE.Group();
  scene.add(land);
  function place(obj: THREE.Mesh,x:number,y:number,z:number): void {
    obj.position.set(x,y,z);
    land.add(obj);
  }
  const pos:number[] = [], cols:number[] = [];
  const levels = [-17,-11,-6,-3.3,-2.55,-2.2,-1.5,-0.85,-0.31,-0.09,0.12,0.34,0.58,0.82,1.2,1.8,2.4,3.05,3.4,4.2,6,9];
  const paint = (a:number[],b:number[],c:number[],color:number,k:number):void => {
    pos.push(...a,...b,...c);
    const tint = new THREE.Color(color).multiplyScalar(0.91 + 0.16*noise(k));
    for(let n=0;n<3;n++) cols.push(tint.r,tint.g,tint.b);
  };
  for(let i=0;i<52;i++) for(let j=0;j<levels.length-1;j++) {
    const x=-19+i*0.74, z=levels[j]!, next=levels[j+1]!;
    const pt=(xx:number,zz:number):number[]=>[xx,ground(xx,zz),zz];
    const color = z < -2.55 || z>=3.4 ? 0x758563 : z < -0.09 || (z>=0.58 && z<3.05) ? 0xb1a78d : 0x857b69;
    const a=pt(x,z), b=pt(x,next), c=pt(x+0.74,z), d=pt(x+0.74,next), k=i*25+j;
    paint(a,b,c,color,k);paint(c,b,d,color,k+393);
  }
  const geom=new THREE.BufferGeometry();
  geom.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
  geom.setAttribute("color",new THREE.Float32BufferAttribute(cols,3));geom.computeVertexNormals();
  place(solid(geom,0xffffff),0,0,0);
  // Irregular rendered triangular faces give each distant alpine ridge its own lit and shadowed slope.
  for(let layer=0;layer<3;layer++) {
    const ridge:number[]=[], tones:number[]=[];
    const step=2.3+layer*0.65, depth=-32+layer*7, start=-70;
    const peak=(i:number):number=>4.2-layer*1.35+3.0*Math.sin(i*0.59+layer*1.6)+2.1*Math.sin(i*0.22+layer)+2.4*noise(i+layer*78);
    for(let i=0;i<55;i++){
      const x=start+i*step, h=peak(i), hn=peak(i+1);
      const a=[x,h,depth], b=[x+step,hn,depth], c=[x-step*0.4,-3,depth+2.2], d=[x+step*0.6,-3,depth+2.2];
      for(const [n, points] of [[0,[a,c,b]],[1,[b,c,d]]] as const){
        ridge.push(...points.flat());
        const tone=new THREE.Color([0x92aab7,0x779392,0x628478][layer]).multiplyScalar(0.82+0.25*noise(i*2+n));
        for(let m=0;m<3;m++)tones.push(tone.r,tone.g,tone.b);
      }
    }
    const mesh=new THREE.BufferGeometry();mesh.setAttribute("position",new THREE.Float32BufferAttribute(ridge,3));mesh.setAttribute("color",new THREE.Float32BufferAttribute(tones,3));mesh.computeVertexNormals();
    place(solid(mesh,0xffffff,true),0,0,0);
  }
  for(let i=0;i<70;i++){
    const x=-19+40*noise(i*3), z=-3.1-11*noise(i*3+1), h=0.9+2.6*noise(i*3+2);
    const y=ground(x,z);
    place(solid(new THREE.CylinderGeometry(0.065,0.105,h*0.68,5),0x5b4e40),x,y+h*0.34,z);
    for(let layer=0;layer<3;layer++) {
      const tree=solid(new THREE.ConeGeometry(h*(0.26-0.046*layer),h*(0.65-0.05*layer),7),[0x394f43,0x46634d,0x597158][layer]!);
      tree.rotation.y=i*0.9+layer*0.25;place(tree,x,y+h*(0.44+layer*0.18),z);
    }
  }
  for(let i=0;i<240;i++){
    const x=-9+18*noise(i*4),z=-2.2+5.6*noise(i*4+1),s=0.018+0.058*noise(i*4+2);
    const stone=solid(new THREE.DodecahedronGeometry(1),i%3===0?0xa18c6b:0x847963);
    stone.scale.set(s*1.4,s*0.45,s);place(stone,x,ground(x,z)+s*0.15,z);
  }
  for(const dx of [-0.23,0.26]){
    const rock=solid(new THREE.DodecahedronGeometry(1),dx<0?0x766e5c:0x8e8269);
    rock.scale.set(0.37,0.42,0.35);rock.rotation.z=dx*0.4;place(rock,splitRock.x+dx,ground(splitRock.x,splitRock.z)+0.25,splitRock.z);
  }
  const y=ground(stump.x,stump.z);
  place(solid(new THREE.CylinderGeometry(0.19,0.28,0.77,8),0x655039),stump.x,y+0.385,stump.z);
  place(solid(new THREE.CylinderGeometry(0.188,0.19,0.03,8),0xb2986b),stump.x,y+0.78,stump.z);
  const spur=solid(new THREE.ConeGeometry(0.10,0.48,6),0x806442);spur.rotation.z=-0.88;place(spur,stump.x+0.20,y+0.57,stump.z);
  batch(land);
  scene.add(new THREE.HemisphereLight(0xd7e7ed,0xb2a692,1.60));
  const sun=new THREE.DirectionalLight(0xffe4c5,1.75);sun.position.set(-5,8,4);scene.add(sun);
  const rim=new THREE.DirectionalLight(0xaed1d9,0.72);rim.position.set(3,4,-5);scene.add(rim);
}
