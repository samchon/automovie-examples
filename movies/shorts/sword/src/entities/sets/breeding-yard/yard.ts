import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const surfaces = new Map<number, T.MeshStandardMaterial>();
export function surface(color: number): T.MeshStandardMaterial {
  let material = surfaces.get(color);
  if (!material) {
    material = new T.MeshStandardMaterial({ color, roughness: 0.92, flatShading: true, side: T.DoubleSide });
    surfaces.set(color, material);
  }
  return material;
}
export function form(parent: T.Object3D, geometry: T.BufferGeometry, color: number, x: number, y: number, z: number): T.Mesh {
  const mesh = new T.Mesh(geometry, surface(color));
  mesh.position.set(x,y,z);
  parent.add(mesh);
  return mesh;
}
export function box(p: T.Object3D,c: number,x:number,y:number,z:number,w:number,h:number,d:number): T.Mesh {
  return form(p,new T.BoxGeometry(w,h,d),c,x,y,z);
}
export function bar(p:T.Object3D,c:number,a:T.Vector3,b:T.Vector3,r:number,end=r):T.Mesh {
  const m = form(p,new T.CylinderGeometry(end,r,a.distanceTo(b),8),c,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());
  return m;
}
function tint(seed:number):number { const a=Math.sin(seed*307.39+9.7)*9235.4; return a-Math.floor(a); }
function coal(p:T.Object3D,c:number,x:number,y:number,z:number,w:number,h:number,d:number) {
  const m=form(p,new T.IcosahedronGeometry(1,0),c,x,y,z);
  m.scale.set(w,h,d); m.rotation.y=tint(x+y)*2; return m;
}
function hills(p:T.Object3D) {
  const colors = [[0x889ba0,0xb8bcc0,0x9faeaf,0xd6d4c9],[0x566e74,0x697e83,0x788c8b,0x96a69a],[0x525e50,0x6a725a,0x80906f,0x737e63]];
  for(let layer=0;layer<3;layer++){
    const coordinates:number[]=[]; const vertexColors:number[]=[];
    const field = (i:number,row:number):T.Vector3 => {
      const x=-165+i*8+3*Math.sin(i*7.6+row*5);
      const profile=0.35+0.34*Math.sin(i*.33+layer*4)+0.19*Math.sin(i*1.37+layer*2)+.28*tint(i+100*layer);
      return new T.Vector3(x,(profile*(28-layer*6)+8-layer*2)*(1-row/3)-2.5, -115+layer*27+row*4+2*tint(i+row));
    };
    const tri=(a:T.Vector3,b:T.Vector3,c:T.Vector3,color:number) => {
      const v=new T.Color(color);
      for (const pt of [a,b,c]) { coordinates.push(pt.x,pt.y,pt.z);vertexColors.push(v.r,v.g,v.b); }
    };
    for(let i=0;i<48;i++) for(let j=0;j<3;j++){
      const a=field(i,j),b=field(i+1,j),c=field(i,j+1),d=field(i+1,j+1);
      const col=colors[layer]!;
      tri(a,c,b,col[Math.floor(tint(101*i+j)*4)]!); tri(b,c,d,col[Math.floor(tint(i*24+j)*4)]!);
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute("position",new T.Float32BufferAttribute(coordinates,3));
    geo.setAttribute("color",new T.Float32BufferAttribute(vertexColors,3));geo.computeVertexNormals();
    p.add(new T.Mesh(geo,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide})));
  }
}
function stoneHouse(p:T.Object3D,x:number,z:number,s:number){
  const group=new T.Group();p.add(group);group.position.set(x,0,z);group.scale.setScalar(s);
  box(group,0xb2a07a,0,1.1,0,3.8,2.2,2.4);
  for (const side of [-1,1]) {
    const tile=box(group,0x695648,0,2.66,side*.72,4.32,.16,1.84);tile.rotation.x=side*.58;
    const wall = form(group,new T.CylinderGeometry(1,1,3.8,3),0xae9b77,0,2.12,0);
    wall.rotation.z=Math.PI/2;wall.rotation.y=Math.PI/2;
  }
  box(group,0x5c4534,-.4,.73,1.23,.72,1.46,.09);
  for (const n of [-1.3,.95]) box(group,0x4e4236,n,1.38,1.24,.48,.51,.08);
  box(group,0x8d836e,.99,3.03,-.28,.38,1.03,.4);
}
function collectStatics(source:T.Group):T.Group {
  source.updateMatrixWorld(true);
  const groups = new Map<T.Material,T.BufferGeometry[]>();
  source.traverse(obj=>{
    if(!(obj instanceof T.Mesh) || Array.isArray(obj.material))return;
    const geo=obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
    geo.applyMatrix4(obj.matrixWorld);
    geo.deleteAttribute("uv");
    const list=groups.get(obj.material)??[];list.push(geo);groups.set(obj.material,list);
    obj.geometry.dispose();
  });
  const merged=new T.Group();
  for(const [material,list] of groups){ const geom=mergeGeometries(list);if(geom)merged.add(new T.Mesh(geom,material));for(const geo of list)geo.dispose(); }
  return merged;
}
/** The grass verge, dry-stone wall and hinged gate share a continuous stretch of road. */
export function buildYard(scene:T.Scene){
  scene.background=new T.Color(0xb0cbd2);
  scene.fog=new T.FogExp2(0xc7cdc1,.0074);
  const set=new T.Group();
  box(set,0x89875a,34,-.2,-10,340,.36,260);
  box(set,0xbb9b73,32,-.055,1.3,290,.10,5.9);
  const verge = new T.Shape();
  verge.moveTo(48.7,2.24);
  verge.lineTo(52.1,0.96);
  verge.lineTo(54.0,0.44);
  verge.lineTo(56.7,0.25);
  verge.lineTo(58.8,0.82);
  verge.lineTo(61.5,2.31);
  verge.closePath();
  const grass = form(set,new T.ShapeGeometry(verge),0x878352,0,.006,0);
  grass.rotation.x=-Math.PI/2;
  for(const rut of [-.38,2.12]){
    for(let i=0;i<46;i++){
      const s=box(set,0xb49671,-18+i*2.28,.003,rut+.06*Math.sin(i*.8),2.22,.007,.10+.16*tint(i));
      s.rotation.y=.033*Math.sin(i*.65);
    }
  }
  for(let i=0;i<340;i++){
    const x=-22+tint(4*i)*112, z=-1.4+tint(4*i+1)*5.6;
    coal(set,[0xa48b69,0xc6ac84,0x897b60][i%3]!,x,.001,z,.06+.13*tint(i+22),.02,.05);
  }
  for(let i=0;i<310;i++) {
    const x=-23+tint(i*2)*115,z=-2.3-tint(i*2+1)*19;
    const grass = form(set,new T.ConeGeometry(.075+.18*tint(i),.18+.29*tint(i+4),3),[0x75794d,0xa59a65,0x9b8a54][i%3]!,x,.09,z);
    grass.rotation.z=.2;
  }
  hills(set);
  for (let i=0;i<50;i++) {
    const x=-55+2.95*i,z=-29-tint(i*3)*29,h=2.2+3.5*tint(i*9);
    box(set,0x665138,x,h*.2,z,.18,h*.4,.18);
    for(const [f,r] of [[.41,.28],[.62,.22],[.8,.15]] as const)form(set,new T.ConeGeometry(h*r,h*.64,7),i%2?0x526852:0x657361,x,h*f,z);
  }
  for(const [x,z,s] of [[-9,-12,1.2],[12,-19,1.0],[31,-28,1.55],[69,-20,1.25],[75,-18,.9]] as const)stoneHouse(set,x,z,s);
  for(let i=0;i<126;i++){
    const x=-22+i*.57;
    for(let j=0;j<3;j++){
      const block=box(set,[0x817a65,0xa09376,0x92866f,0xb0a185][Math.floor(tint(i+j*31)*4)]!,x+.25*(j%2),.13+j*.235,-2.30,.58,.25,.44+.08*tint(i*j+3));
      block.rotation.z=.045*(tint(i+5*j)-.5);
    }
  }
  for(const [start,end] of [[49.7,52.5],[55.5,86]] as const){
    for(let x=start;x<end+.1;x+=2.55)box(set,0x69533a,x,.65,-2.32,.18,1.3,.2);
    for(const y of [.44,.86])box(set,0x957951,(start+end)/2,y,-2.32,end-start,.12,.12);
  }
  const gate=new T.Group();gate.position.set(52.5,0,-2.32);scene.add(gate);
  for(const x of [.13,2.82])box(gate,0x725238,x,.63,0,.15,1.14,.15);
  for(const y of [.34,.77,1.08])box(gate,0xa17c4c,1.47,y,0,2.91,.115,.115);
  const brace=box(gate,0x8a673f,1.47,.7,-.08,2.75,.11,.10);brace.rotation.z=.257;
  const latch=box(gate,0x55534c,2.78,1.17,.11,.46,.072,.11);
  box(latch,0x69665a,.095,.042,.019,.14,.038,.074);
  box(set,0x5e4935,55.55,.68,-2.32,.22,1.36,.24);
  const bench=box(set,0x856344,.14,.95,1.39,2.0,.13,.78);
  for (const x of [-.64,.9])for(const z of [1.11,1.69])box(set,0x604b39,x,.47,z,.12,.94,.12);
  const book=box(set,0xd3bc89,-.32,1.07,1.39,.49,.08,.34);book.rotation.y=.17;
  form(set,new T.CylinderGeometry(.075,.09,.14,8),0x352f29,-.71,1.09,1.48);
  for(let i=0;i<6;i++)form(set,new T.CylinderGeometry(.077,.08,.018,14),0xb38d46,.16+.1*Math.cos(i),1.033+i*.014,1.43+.1*Math.sin(i));
  scene.add(collectStatics(set));
  scene.add(new T.HemisphereLight(0xe1ecf3,0xb69777,1.64));
  const key=new T.DirectionalLight(0xffe0b6,2.16);key.position.set(-12,16,8);scene.add(key);
  const rim=new T.DirectionalLight(0xffe2b2,.67);rim.position.set(9,4,-9);scene.add(rim);
  return {gate,latch,bench};
}
