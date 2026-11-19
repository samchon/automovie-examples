import * as THREE from "three";
import { ellipsoid, solid } from "./road";

const linen = 0xe2d1a3;

/** A shallow, curved woven cloth with its identifying selvage colored in the mesh. */
export function breadCloth(blue: boolean): {object: THREE.Group; shape: (spread: number, fold: number, time: number, wrap?: number) => void} {
  const object = new THREE.Group(), geometry = new THREE.BufferGeometry();
  const nx=12,nz=10, xyz=new Float32Array((nx+1)*(nz+1)*3), color:number[]=[], faces:number[]=[];
  for(let iz=0;iz<=nz;iz++) for(let ix=0;ix<=nx;ix++){
    const edge=blue && (ix===1 || ix===nx-1);
    const c=new THREE.Color(edge ? 0x345776 : linen).multiplyScalar(0.94+0.05*Math.cos(ix*3+iz));
    color.push(c.r,c.g,c.b);
    const n=iz*(nx+1)+ix;
    if(ix<nx && iz<nz) faces.push(n,n+nx+1,n+1,n+1,n+nx+1,n+nx+2);
  }
  const verts=new THREE.BufferAttribute(xyz,3);
  geometry.setAttribute("position",verts);geometry.setAttribute("color",new THREE.Float32BufferAttribute(color,3));geometry.setIndex(faces);
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({side:THREE.DoubleSide,vertexColors:true,roughness:1}));
  mesh.frustumCulled=false;object.add(mesh);
  function shape(spread:number,fold:number,time:number,wrap=0):void {
    let i=0;
    for(let iz=0;iz<=nz;iz++) for(let ix=0;ix<=nx;ix++){
      const u=2*ix/nx-1,v=2*iz/nz-1;
      const bend=fold*(0.91+0.2*Math.cos(v*2));
      const near=Math.max(0,v);
      const x=u*(0.36+0.11*spread)*(1-(bend*0.67+wrap*0.10)*Math.abs(u));
      const y=0.10*(u*u+v*v)+0.22*bend*u*u+0.22*Math.sin(Math.PI*near/2)*wrap+
        Math.sin(v*13+u*7+time)*0.011+0.09*(1-spread)*Math.sin(v*3);
      const z=v*(0.26+0.09*spread)*(1-0.24*wrap)+wrap*(0.15*Math.sin(Math.PI*near)-0.36*near*near);
      verts.setXYZ(i++,x,y,z);
    }
    verts.needsUpdate=true;geometry.computeVertexNormals();
  }
  shape(1,0,0);
  return {object,shape};
}

export function loaf(half=false):THREE.Group {
  const root=new THREE.Group();
  const crust=ellipsoid(0x965c32,half?0.145:0.25,0.105,0.14);
  root.add(crust);
  for(let i=0;i<(half?2:3);i++){
    const cut=ellipsoid(0xd8a260,0.015,0.009,0.08);
    cut.position.set((i-(half?0.5:1))*0.095,0.096,0);cut.rotation.y=-0.36;root.add(cut);
  }
  if(half){
    const crumb=ellipsoid(0xffe7b3,0.130,0.095,0.008);crumb.position.z=0.144;root.add(crumb);
    for(let i=0;i<17;i++){
      const pore=ellipsoid(i===2?0x67513e:0xb49b72,0.007+(i===2?0.014:0),0.006+(i===2?0.008:0),0.003);
      pore.position.set(Math.sin(i*2.37)*0.091,Math.cos(i*3.71)*0.055,0.153);root.add(pore);
    }
  }
  return root;
}

/** An irregular canvas bag with a tied textile mouth and a seam that opens into the spill. */
export function ryeSack():THREE.Group {
  const root=new THREE.Group();
  const contour=[[0,-0.34],[0.19,-0.33],[0.34,-0.28],[0.41,-0.11],[0.40,0.07],[0.31,0.22],[0.19,0.33],[0.09,0.41],[0.045,0.47],[0,0.51]];
  const shell=new THREE.LatheGeometry(contour.map(([r,y])=>new THREE.Vector2(r,y)),21);
  const vertices=shell.getAttribute("position");
  const palette=new Float32Array(vertices.count*3);
  for(let i=0;i<vertices.count;i++){
    const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);
    const theta=Math.atan2(z,x);
    const crease=1+0.07*Math.sin(theta*5+4*y)+0.026*Math.sin(theta*11-7*y);
    vertices.setXYZ(i,x*crease+0.08*y,z*0.03+y+0.028*Math.sin(theta*4)*Math.hypot(x,z),z*crease);
    new THREE.Color(0xa48a64).multiplyScalar(0.93+0.060*Math.sin(theta*7+7*y)).toArray(palette,i*3);
  }
  shell.setAttribute("color",new THREE.BufferAttribute(palette,3));shell.computeVertexNormals();
  const bag=new THREE.Mesh(shell,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));
  bag.scale.set(1.10,1.02,0.68);root.add(bag);
  const cord=solid(new THREE.TorusGeometry(0.072,0.014,5,13),0x665337);
  cord.scale.set(1,0.67,1);cord.rotation.set(Math.PI/2,-0.16,0.13);cord.position.set(0.025,0.424,0);root.add(cord);
  for(const [x,length,angle] of [[-0.085,0.16,0.66],[0.074,0.16,-0.42]] as const){
    const tail=ellipsoid(0x89704f,0.027,length*0.5,0.018);
    tail.position.set(x,0.402,0.055);tail.rotation.z=angle;root.add(tail);
  }
  const stitching=new THREE.Group();stitching.name="Intact seam";root.add(stitching);
  for(let i=0;i<11;i++){
    const x=(i-5)*0.052;
    const stitch=ellipsoid(0xcdad7c,0.009,0.023,0.011);
    stitch.position.set(x,-0.11+x*.17,0.27-x*x*0.79);
    stitch.rotation.z=i%2===0?-0.57:0.48;stitching.add(stitch);
  }
  const tear=new THREE.Group();
  tear.name="Torn seam";
  tear.position.set(0.01,-0.13,0.262);
  const opening=ellipsoid(0x4c3828,0.255,0.075,0.039);
  opening.rotation.z=0.14;
  tear.add(opening);
  for(const side of [-1,1]){
    const lip=ellipsoid(0xbba17c,0.235,0.024,0.026);
    lip.position.set(side*0.028,0.065*side,0.023);lip.rotation.z=0.14+side*0.09;
    tear.add(lip);
  }
  tear.visible=false;
  root.add(tear);
  return root;
}

/** Three control points of the same broad sack strap remain visible from both roads. */
export function sackStrap():{object:THREE.Mesh; shape:(a:THREE.Vector3,b:THREE.Vector3,c:THREE.Vector3)=>void}{
  const geom=new THREE.BufferGeometry(), points=new THREE.BufferAttribute(new Float32Array(39*2),3), faces:number[]=[];
  for(let i=0;i<12;i++){const n=2*i;faces.push(n,n+1,n+2,n+2,n+1,n+3);}
  geom.setIndex(faces);geom.setAttribute("position",points);
  const object=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({color:0xe7d3ab,side:THREE.DoubleSide,roughness:1}));object.frustumCulled=false;
  return {object,shape:(a,b,c)=>{
    for(let i=0;i<=12;i++){
      const t=i/12,s=1-t;
      const center=new THREE.Vector3().addScaledVector(a,s*s).addScaledVector(b,2*s*t).addScaledVector(c,t*t);
      const dx=2*(s*(b.x-a.x)+t*(c.x-b.x)),dy=2*(s*(b.y-a.y)+t*(c.y-b.y)),len=Math.hypot(dx,dy)||1;
      for(const sign of [-1,1])points.setXYZ(2*i+(sign+1)/2,center.x-sign*dy/len*0.044,center.y+sign*dx/len*0.044,center.z+sign*0.014);
    }
    points.needsUpdate=true;geom.computeVertexNormals();
  }};
}

/** A stage prop with a dark scabbard or a soft pale silhouette visible against the road. */
export function sidearm(sheathed=false):THREE.Group {
  const g=new THREE.Group();
  const grip=solid(new THREE.CylinderGeometry(0.026,0.031,0.17,7),0x543b2d);grip.position.y=0.07;g.add(grip);
  const guard=ellipsoid(0x9b8a64,0.117,0.023,0.03);guard.position.y=-0.015;g.add(guard);
  const tip=solid(new THREE.ConeGeometry(0.05,0.69,4),sheathed?0x583d2d:0xa7b7b7);
  tip.rotation.z=Math.PI;tip.position.y=-0.36;tip.scale.z=0.38;g.add(tip);
  return g;
}
