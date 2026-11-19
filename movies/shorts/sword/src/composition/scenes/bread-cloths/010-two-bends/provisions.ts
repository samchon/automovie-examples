import * as THREE from "three";
import { ellipsoid, solid } from "./road";

const linen = 0xe2d1a3;

/**
 * Create one deformable stage cloth. `blue` selects the visible blue selvage.
 * The shape setter takes normalized spread, fold and optional wrap values and
 * an externally supplied ripple phase. Its group owns a local metre-scale mesh.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment identifies the selvage variant, the shape controls and who owns the resulting mesh.
 * @evidence contracts/development/implementation.md#principled-implementation A fixed grid carries authored vertex colors. Shape updates move those vertices through curvature, fold and wrap profiles and recompute normals for the selected pose.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The function owns the cloth's mesh and deformation. Scene posing assigns its world transform, the bread portions and the handoff clock.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The deformation coefficients and tessellation are artistic shapes for this cloth. The ripples and wraps are authored surfaces without a textile stress solution.
 * @evidence contracts/development/implementation.md#efficient-algorithms Position and normal updates traverse the fixed 13-by-11 grid and its faces. Storage scales with that grid and is allocated once per cloth.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Each seek writes into the same vertex buffer and reuses its faces and colors. The two cloths need independent buffers because their transforms and folds can differ.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned group and setter retain one mesh and its buffers per cloth. The scene adds the group and disposes its geometry and material.
 * @evidence contracts/development/composition.md#screenplay-realization Supplies the blue-edged and plain cloths that open, receive portions, fold and leave in the screenplay.
 * @evidence contracts/development/composition.md#composition-only Builds the scene-local cloth surface and evaluates caller-provided controls. The cloth has no absolute shot clock.
 * @evidence contracts/development/composition.md#living-scene Each cloth can open, deform and wrap separately while the scene carries its visible placement and portion count through cuts.
 */
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

/**
 * Build a whole loaf or a half loaf at stage scale in local metres.
 * The cut face and crumb marks are included when `half` is true.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment defines the whole-loaf default, cut-half variant and local units.
 * @evidence contracts/development/implementation.md#principled-implementation The loaf is a group of scaled solids for the crust and scoring. A half adds a light exposed cut face and smaller pores so its cross section stays legible in the division shot.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Mesh construction owns the edible shape. Scene posing determines which instance is visible, how it moves and which cloth receives it.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The radii, scoring and pore locations are authored visual cues. The darkest pore also supplies the thumb mark and these solids approximate baked bread.
 * @evidence contracts/development/implementation.md#efficient-algorithms The whole and half variants each build a bounded number of fixed-resolution meshes. No work is done per frame by this factory.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work All instances reuse the same ellipsoid construction rule. Each loaf has independent geometry and a separate transform for its portion and movement.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned group owns the solids created for one loaf and the scene releases their geometry and materials at disposal.
 * @evidence contracts/development/composition.md#screenplay-realization Supplies the three rye loaves and the two readable halves that realize the equal shares.
 * @evidence contracts/development/composition.md#composition-only Builds a prop capability from shared stage solids. The scene owns all absolute time, transport, visibility and handoff.
 * @evidence contracts/development/composition.md#living-scene Separate whole and cut surfaces let the spill, protected third loaf and final split remain distinct as the figures move.
 */
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

/**
 * Create a canvas sack in local stage metres, with an intact seam and a hidden
 * tear at construction. The scene controls the visibility and opening of the seam.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment defines the initial visible state, stage units and responsibility for revealing the tear.
 * @evidence contracts/development/implementation.md#principled-implementation A lathed profile provides the sack's body. Authored deformation and vertex tints give its folds, and separate tied-mouth and seam meshes keep continuity between intact and torn poses.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Keep the shell, cord and seams together as one prop. The scene moves the group and animates the tear by name.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The contour, cloth coloring, seam opening and tie are authored approximations for this stage prop. The tear is a visible state change, and the function solves no fabric rupture.
 * @evidence contracts/development/implementation.md#efficient-algorithms Setup visits the fixed shell vertex count and creates two short rows of seam detail. Frame seeks reuse the geometry and switch or stretch seam meshes.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The same shell and tied mouth persist through intact and torn states. Separate scenes build their own mutable groups and seam visibility.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned group owns a bounded shell and seam geometry. Its owning scene releases each attached geometry and material in dispose.
 * @evidence contracts/development/composition.md#screenplay-realization Provides the tied rye sack, intact at the opening and torn when the loaves fall, which stays the same object until the lower pair departs.
 * @evidence contracts/development/composition.md#composition-only Creates a scene-local prop with identifiable shell and seam states. The scene determines when it is supported, opened and transferred.
 * @evidence contracts/development/composition.md#living-scene Named seam meshes and one moving sack group preserve visual continuity from shoulder carry through snag, fall, lift and departure.
 */
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

/**
 * Create a flexible strap mesh with a shape setter over three control positions.
 * The caller supplies metres in the mesh parent's frame. The caller attaches the
 * mesh and owns the three points on each seek.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment documents the control count, coordinate frame, and ownership boundary.
 * @evidence contracts/development/implementation.md#principled-implementation Use a quadratic Bézier with two endpoints and one intermediate control point to update a two-vertex strip. The normalized XY tangent sets strip width, with a finite fallback when its XY length is zero.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The prop owns strip tessellation, shape and shading. Scene posing supplies endpoints for the shoulder harness, released sack strap and cloth tails.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Strip width, depth bias and sample count suit the reviewed props. Tangent-based offsets are an authored mesh approximation rather than a fabric or twist solver.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each update visits 13 stations and computes normals on a fixed strip. Geometry, indices and the position buffer are allocated once at creation.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The same strip buffers are updated on every call. Separate ribbon instances can follow different parent frames and shapes.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned setter retains one mesh with a fixed-size buffer. The scene disposes its geometry and material after use.
 * @evidence contracts/development/composition.md#screenplay-realization Provides the broad sack strap and final hanging cloth edges, including the free strap that clears Alix's silhouette in the rescue.
 * @evidence contracts/development/composition.md#composition-only Builds one strip surface and evaluates the scene-provided spatial controls without owning an action clock.
 * @evidence contracts/development/composition.md#living-scene Mutable control points let the scene carry one recognizable strap through shoulder load and release and keep the separate cloth tails visibly supported.
 */
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

/**
 * Create a stylized sword-shaped stage prop in local metres.
 * The `sheathed` flag selects the dark scabbard appearance. The scene supplies
 * the placement, orientation and visibility of the returned group.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment defines the default prop appearance, scabbard variant, frame units and transform ownership.
 * @evidence contracts/development/implementation.md#principled-implementation Combine three fixed solids for a readable handle, guard and tapered silhouette. The flag changes the tapered element's material color.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure This factory owns prop geometry and color. Scene posing moves a prop to its actor or the ground and manages visibility at authored cues.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The proportions and colors are screen-design settings. The object represents no functional tool or physical contact model.
 * @evidence contracts/development/implementation.md#efficient-algorithms Creates three fixed-resolution primitives, with constant setup time and storage for the supported variants.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Both variants share the same construction path and color policy. Separate instances maintain independent graphics resources and transforms.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned group retains three meshes, which are disposed by the scene that stores the group.
 * @evidence contracts/development/composition.md#screenplay-realization Provides the staged blade and scabbard silhouettes visible in the lower approach, bend and dropped prop that stops the loaves.
 * @evidence contracts/development/composition.md#composition-only Builds only the prop appearance from shared geometry. Scene posing supplies the transfer, orientation and visibility on its clock.
 * @evidence contracts/development/composition.md#living-scene The instances remain recognizable across being carried, set down and sheathed. The actor and camera determine which movements are visible.
 */
export function sidearm(sheathed=false):THREE.Group {
  const g=new THREE.Group();
  const grip=solid(new THREE.CylinderGeometry(0.026,0.031,0.17,7),0x543b2d);grip.position.y=0.07;g.add(grip);
  const guard=ellipsoid(0x9b8a64,0.117,0.023,0.03);guard.position.y=-0.015;g.add(guard);
  const tip=solid(new THREE.ConeGeometry(0.05,0.69,4),sheathed?0x583d2d:0xa7b7b7);
  tip.rotation.z=Math.PI;tip.position.y=-0.36;tip.scale.z=0.38;g.add(tip);
  return g;
}
