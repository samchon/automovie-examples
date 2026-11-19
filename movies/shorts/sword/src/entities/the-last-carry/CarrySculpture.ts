import * as THREE from "three";
import { carryPortraits } from "./CarryPortraits";

export type CarryRole = keyof typeof carryPortraits;
export type Ring = readonly [height: number, width: number, depth: number, forward?: number, folds?: number];
const tau = Math.PI * 2;
const solid = new Map<number, THREE.MeshStandardMaterial>();

/** Reuse the same rough dyes, leather and skin across costume sections. */
export function paint(color: number): THREE.MeshStandardMaterial {
  let material = solid.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness: .91, side: THREE.DoubleSide });
    solid.set(color, material);
  }
  return material;
}

/** A swept grid with normals directed toward the audience at phase zero. */
export function surface(rows: number, columns: number, point: (v: number, u: number) => THREE.Vector3): THREE.BufferGeometry {
  const positions: number[] = [];
  const faces: number[] = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= columns; i++) {
    const p = point(j / rows, i / columns);
    positions.push(p.x, p.y, p.z);
    if (i === columns || j === rows) continue;
    const a = j * (columns + 1) + i;
    faces.push(a, a + 1, a + columns + 1, a + 1, a + columns + 2, a + columns + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(faces);
  geometry.computeVertexNormals();
  return geometry;
}

/** Folds broaden as the wool falls away from its fitted waist. */
export function cloth(group: THREE.Group, rings: readonly Ring[], color: number, waves = 12, segments = 48): THREE.Mesh {
  const geometry = surface(rings.length - 1, segments, (v,u) => {
    const [y, w, d, z = 0, fold = 0] = rings[Math.round(v * (rings.length - 1))]!;
    const a = tau * u;
    const taper = 1 + fold * (.68 * Math.cos(waves * a + .8*y) + .32 * Math.sin((waves-2)*a - y));
    return new THREE.Vector3(w*taper*Math.sin(a),y,(d*taper)*Math.cos(a)+z);
  });
  const uv:number[]=[];
  const middle = rings[Math.floor(rings.length/2)]!;
  const around = 2*Math.PI*Math.sqrt((middle[1]**2+middle[2]**2)/2);
  for(const row of rings) for(let i=0;i<=segments;i++) uv.push(i/segments*around/.14, row[0]/.14);
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  return mesh(group,geometry,fabric(color));
}

/** Install local-space geometry beneath its physical pivot. */
export function mesh(group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
  const object = new THREE.Mesh(geometry, material);
  group.add(object);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

const dyedWools=new Map<number,THREE.MeshStandardMaterial>();
let weave:THREE.DataTexture | undefined;

/** The warp, weft and mottling keep their physical frequency on a close shoulder and a whole gown. */
function fabric(color:number):THREE.MeshStandardMaterial {
  let material=dyedWools.get(color);
  if(material)return material;
  if(!weave){
    const size=128, pixels=new Uint8Array(size*size*4);
    let seed=173213;
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){
      seed=(1664525*seed+1013904223)>>>0;
      const thread=Math.cos((x+(y>>1))*.5*Math.PI)*Math.sin(y*.5*Math.PI);
      const dye=9*Math.sin(2*Math.PI*(x+2*y)/size)+5*Math.cos(2*Math.PI*(3*x-y)/size);
      const value=Math.round(227+dye+9*thread+18*(seed/4294967296-.5));
      const index=4*(y*size+x);
      pixels[index]=pixels[index+1]=pixels[index+2]=value;
      pixels[index+3]=255;
    }
    weave=new THREE.DataTexture(pixels,size,size);
    weave.wrapS=weave.wrapT=THREE.RepeatWrapping;
    weave.magFilter=THREE.LinearFilter;weave.minFilter=THREE.LinearMipmapLinearFilter;
    weave.generateMipmaps=true;weave.needsUpdate=true;
  }
  material=new THREE.MeshStandardMaterial({color,map:weave,bumpMap:weave,bumpScale:.0007,roughness:.96,side:THREE.DoubleSide});
  dyedWools.set(color,material);
  return material;
}

const sphere = new THREE.SphereGeometry(1, 20, 14);
export function oval(group: THREE.Group, color: number, x:number,y:number,z:number, w:number,h:number,d:number): THREE.Mesh {
  const object = mesh(group,sphere,paint(color));
  object.position.set(x,y,z);
  object.scale.set(w,h,d);
  return object;
}

/** Raised seams follow the actual local surface of the garment or accessory. */
export function cord(group:THREE.Group, color:number, radius:number, points:number[][]): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map(([x,y,z]) => new THREE.Vector3(x,y,z)));
  return mesh(group,new THREE.TubeGeometry(curve, Math.max(5,points.length*3),radius,5,false),paint(color));
}

const frontDepth=[.066,.081,.083,.083,.081,.082,.082,.081,.078,.071,.048,.002];
const backDepth =[.036,.059,.082,.094,.103,.107,.109,.108,.100,.082,.050,.002];
const widths = [.27,.64,.79,.89,.98,1,.99,.98,.93,.81,.59,.02];
function profile(knots: number[], t:number): number {
  const j = Math.min(knots.length-2, Math.floor(t*(knots.length-1)));
  return THREE.MathUtils.lerp(knots[j]!,knots[j+1]!,t*(knots.length-1)-j);
}

const mouths={denis:.277,colin:.252,widow:.288,"relief-bearer":.298,"front-bearer-left":.298,"front-bearer-right":.299,"gate-woman":.248};

/** The cast photograph is wrapped over the cheekbones, nose, brow and jaw, with the temples blending into skin. */
export function face(group: THREE.Group, role: CarryRole, skin:number, width:number, height:number): void {
  const bytes=atob(carryPortraits[role]), oral=mouths[role];
  const base=new THREE.Color(skin).convertLinearToSRGB();
  const size=384, rows=176, pixels=new Uint8Array(size*rows*4);
  const tone=[base.r*255,base.g*255,base.b*255];
  for(let row=0;row<rows;row++)for(let col=0;col<size;col++){
    const t=row/(rows-1), a=tau*col/(size-1), front=Math.cos(a);
    const horizontal=Math.sin(a)*profile(widths,t);
    const x=Math.min(127,Math.max(0,Math.round((.5+.5*horizontal)*127)));
    const colorAt=3*((rows-1-row)*128+x);
    const overlap=THREE.MathUtils.smoothstep(front,-.12,.60);
    for(let channel=0;channel<3;channel++){
      pixels[4*(row*size+col)+channel]=Math.round(THREE.MathUtils.lerp(tone[channel]!,bytes.charCodeAt(colorAt+channel),overlap));
    }
    pixels[4*(row*size+col)+3]=255;
  }
  const portrait=new THREE.DataTexture(pixels,size,rows);
  portrait.colorSpace=THREE.SRGBColorSpace;portrait.magFilter=THREE.LinearFilter;
  portrait.minFilter=THREE.LinearMipmapLinearFilter;portrait.generateMipmaps=true;portrait.needsUpdate=true;
  const morph:number[]=[], uv:number[]=[];
  const point=(t:number,u:number):THREE.Vector3=>{
    const a=tau*u, f=Math.cos(a), px=Math.sin(a)*profile(widths,t);
    const gauss=(x:number,y:number,wx:number,wy:number)=>Math.exp(-(((px-x)/wx)**2+((t-y)/wy)**2));
    const tip=oral+.087, eye=oral+.26;
    const nose=.016*gauss(0,tip+.070,.18,.13)+.018*gauss(0,tip,.19,.043);
    const cheek=.007*(gauss(-.47,oral+.13,.26,.11)+gauss(.47,oral+.13,.26,.11));
    const socket=.006*(gauss(-.37,eye,.18,.041)+gauss(.37,eye,.18,.041));
    const lips=.004*gauss(0,oral,.34,.042);
    const z=f>=0?profile(frontDepth,t)*Math.pow(f,.79):-profile(backDepth,t)*Math.pow(-f,.90);
    return new THREE.Vector3(px*width,height*t+.017*(1-Math.max(0,f))*(1-t)**5,z+Math.max(f,0)*(nose+cheek-socket+lips));
  };
  const geometry=surface(72,104,(t,u)=>{
    const p=point(t,u), f=Math.cos(tau*u);
    const drop=(1-THREE.MathUtils.smoothstep(t,oral-.009,oral+.012))*(.45+.55*Math.max(0,f));
    morph.push(p.x,p.y-.011*drop,p.z-.003*drop);
    uv.push(u,t);
    return p;
  });
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  geometry.morphAttributes.position=[new THREE.Float32BufferAttribute(morph,3)];
  const surfaceMesh=mesh(group,geometry,new THREE.MeshStandardMaterial({map:portrait,roughness:.89,side:THREE.DoubleSide}));
  surfaceMesh.name="face-skin";
  const center=point(oral,0);
  const mouth=oval(group,0x542f2b,0,center.y-.002,center.z+.0005,width*.219,.002,.0017);
  mouth.name="mouth";mouth.visible=false;
}
/** Draped fabric crosses the crown, falls down the back and leaves the face open. */
export function covering(group:THREE.Group,color:number,h:number,wide:number,long:number):void {
  const geometry=surface(22,52,(v,u)=>{
    const a=u*tau, f=Math.cos(a);
    const open=THREE.MathUtils.smoothstep(f,.10,.87);
    const angle=(1-v)*(.5*Math.PI+.63-.97*open);
    const drop=(1-v)**3*long*(1-open);
    const wave=.006*Math.cos(12*a+.6*v)*(1-v);
    const w=(wide+.07*drop/.21)*Math.sin(angle)+wave;
    return new THREE.Vector3(Math.sin(a)*w,h-.092+.101*Math.cos(angle)-drop,(.112+.025*drop/.16)*Math.sin(angle)*f-.007);
  });
  mesh(group,geometry,paint(color));
}

/** One waved scalp follows its owner's cranium, from the nape to a separate hairline and crown. */
export function hair(group:THREE.Group,color:number,h:number,w:number,bald:boolean,curled:boolean):void {
  const colors:number[]=[], tint=new THREE.Color(color);
  const geo=surface(42,112,(v,u)=>{
    const a=bald ? Math.PI*.34 + Math.PI*1.32*u : tau*u, f=Math.cos(a);
    const front=Math.max(0,f), edge=.013*Math.sin(12*a+.4)+.009*Math.cos(7*a);
    const low=.12+.13*(1+f)/2+.55*front**2.1+edge;
    const high=bald ? .76-.26*front : 1;
    const t=THREE.MathUtils.lerp(low,high,v);
    const sweep=curled? Math.sin(26*a+5*Math.sin(9*v+4*a))*Math.cos(23*v+3*Math.cos(7*a)) : Math.sin(25*a+12*v+1.1*Math.sin(13*a+5*v));
    const thick=(curled?.0080:.0045)*(1+.53*sweep)*(.45+.55*Math.sin(Math.PI*v));
    const shade=(curled?1.08:1.14)+.26*sweep+.09*Math.sin(7*a+5*v);
    colors.push(tint.r*shade,tint.g*shade,tint.b*shade);
    const depth=f<0 ? profile(backDepth,t) : profile(frontDepth,t);
    const taper=Math.sqrt(Math.max(.02,1-v**9));
    return new THREE.Vector3((w*profile(widths,t)+thick*taper)*Math.sin(a),t*h+thick*.55*v,(depth+thick*taper)*Math.sign(f)*Math.abs(f)**(f>=0?.79:.90));
  });
  geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  const object=mesh(group,geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.83,side:THREE.DoubleSide}));
  object.name="hair";
}
