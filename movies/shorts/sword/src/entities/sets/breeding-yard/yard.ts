import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const surfaces = new Map<number, T.MeshStandardMaterial>();
/**
 * Returns the yard palette material for a packed RGB colour. Treat it as shared.
 *
 * @evidence contracts/development/entities.md#settings-realization Yard and prop callers choose the colours for road, stone, wood or dressings. The visible palette uses their supplied colour directly.
 * @evidence contracts/development/entities.md#object-shape A shared material is a draw fragment; no entity behavior, positional state or timing lives here.
 * @evidence contracts/development/entities.md#controls-and-source Packed RGB is the only variable. Native Three.js builds this repository-authored matte material with fixed shading and sidedness.
 * @evidence contracts/development/common.md#meaningful-documentation Defines the colour input and warns that the returned material identity is shared.
 * @evidence contracts/development/implementation.md#principled-implementation The material uses matte, flat shading and two-sided drawing for the yard's coarse geometry.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Centralizes yard material creation independently of placement and geometry.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The palette key is the actual supplied colour, with uniform material settings across callers.
 * @evidence contracts/development/implementation.md#efficient-algorithms Performs one map lookup and constructs one material only on a miss.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Palette entries share material identity for equal supplied colours and fixed settings, enabling static batching by material.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Retains one material per distinct colour for the life of the module. The authored yard palette is finite; arbitrary callers would grow it without eviction.
 */
export function surface(color: number): T.MeshStandardMaterial {
  let material = surfaces.get(color);
  if (!material) {
    material = new T.MeshStandardMaterial({ color, roughness: 0.92, flatShading: true, side: T.DoubleSide });
    surfaces.set(color, material);
  }
  return material;
}

/**
 * Attaches the supplied geometry in parent-local metres using the shared palette.
 *
 * @evidence contracts/development/entities.md#settings-realization Carries the owner-selected geometry and colour into set dressing and props; their factories select the facts and placement.
 * @evidence contracts/development/entities.md#object-shape The caller owns the attached mesh and mutable placement. The helper returns no behavior or time state.
 * @evidence contracts/development/entities.md#controls-and-source Input geometry, position and colour rebuild the mesh in Three.js. Detail is provided through the geometry input.
 * @evidence contracts/development/common.md#meaningful-documentation Names the attached result, local frame and shared palette.
 * @evidence contracts/development/implementation.md#principled-implementation Combines caller-supplied geometry with one palette material and applies an ordinary local translation.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The set and props choose shape; form centralizes attachment and colour lookup.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Attaches the supplied geometry directly and applies all three caller coordinates.
 * @evidence contracts/development/implementation.md#efficient-algorithms Allocates one mesh without traversing vertex buffers; material lookup is keyed by colour.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Shares palette material and uses the supplied geometry by reference, while transform state is per mesh.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Parent graph owns the mesh. The supplied geometry follows caller lifetime and the material belongs to the shared palette.
 */
export function form(parent: T.Object3D, geometry: T.BufferGeometry, color: number, x: number, y: number, z: number): T.Mesh {
  const mesh = new T.Mesh(geometry, surface(color));
  mesh.position.set(x,y,z);
  parent.add(mesh);
  return mesh;
}

/**
 * Attaches a centred box using parent-local metre positions and dimensions.
 *
 * @evidence contracts/development/entities.md#settings-realization The yard uses rectangular pieces for the bench, wall, rails and fittings from docs/body/screenplay/answer-me/010-breeding-yard-road.md#road. This fragment applies the owner's dimensions to the draw.
 * @evidence contracts/development/entities.md#object-shape Returns the caller-owned static or movable mesh. The yard or scene determines whether it is batched, separately named or animated.
 * @evidence contracts/development/entities.md#controls-and-source The position, width, height, depth and colour rebuild the coarse Three.js box directly.
 * @evidence contracts/development/common.md#meaningful-documentation States the centred origin, local coordinate frame and dimensional units.
 * @evidence contracts/development/implementation.md#principled-implementation A native BoxGeometry represents the required positive side dimensions in X, Y and Z, centred at the supplied local position.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Owns box geometry only; form owns the mesh and palette hookup.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Box dimensions are supplied by the subject that owns the placement, with the same primitive used for all supported inputs.
 * @evidence contracts/development/implementation.md#efficient-algorithms A box has fixed vertex and index count with default one segment per side.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the shared palette and attachment helper. Each box has its own geometry for its specified sizes and set batching.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Geometry is owned by the returned mesh until static batching or by the owning graph if animated. The helper retains nothing.
 */
export function box(p: T.Object3D,c: number,x:number,y:number,z:number,w:number,h:number,d:number): T.Mesh {
  return form(p,new T.BoxGeometry(w,h,d),c,x,y,z);
}

/**
 * Attaches a coarse cylinder between distinct parent-local points in metres.
 * The end radius defaults to the start radius.
 *
 * @evidence contracts/development/entities.md#settings-realization The scene uses this fragment for the striped silhouettes introduced at docs/body/screenplay/answer-me/010-breeding-yard-road.md#road. The scene owns the prop design, placement and cue.
 * @evidence contracts/development/entities.md#object-shape Returns a caller-owned mesh aligned between shape endpoints. The parent owns interaction or animation.
 * @evidence contracts/development/entities.md#controls-and-source Endpoints, radii and a palette colour rebuild the fixed coarse Three.js mesh. No physical or purchased prop asset is used.
 * @evidence contracts/development/common.md#meaningful-documentation Defines endpoint frame, nonzero span and the end radius default.
 * @evidence contracts/development/implementation.md#principled-implementation The midpoint locates the cylinder, distance sets its Y length and a quaternion maps its +Y axis onto the endpoint direction. Supported endpoints are distinct.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure This fragment owns bar shape and orientation. Form manages attachment and material.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Points and radii are supplied by callers; eight radial sides are a coarse display setting.
 * @evidence contracts/development/implementation.md#efficient-algorithms Uses fixed-size geometry and constant vector and quaternion operations per call.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the general geometry attachment and palette while preserving independent transforms and endpoint sizes.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Transfers the resulting geometry to the attached mesh. The caller owns its graph lifetime; this helper retains nothing.
 */
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
/**
 * Adds the continuous road, grass verge, dry-stone wall, gate and late-afternoon
 * light to the supplied scene. Returns the gate hinge, latch and bench reference.
 *
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/world/pass-road.md#two-approaches supplies a household yard and horse run along the lower valley road with the hospice out of sight. docs/body/screenplay/answer-me/010-breeding-yard-road.md#road supplies the bench, wall, shut gate, roadside curve, grass verge and adjacent paddock. The scene uses hinge and latch after release to admit the mare.
 * @evidence contracts/development/entities.md#object-shape Attaches one set and returns the mutable gate and latch nodes and a bench construction reference. The bench's visible geometry becomes part of the static batch. The caller owns the gate timing and scene state; this is a Three.js graph factory.
 * @evidence contracts/development/entities.md#controls-and-source Authored metre-scale geometry and fixed tint seeds reproduce the coarse yard. Three.js and its geometry utilities build the repository-authored set. The gate hinge and latch keep separate drawable transforms. No detailed or external asset is commissioned in this cut.
 * @evidence contracts/development/common.md#meaningful-documentation Names the input scene, continuous landmarks, lights and returned set references.
 * @evidence contracts/development/implementation.md#principled-implementation Models the road and paddock in a common metre space. Static vertex positions are baked into the group frame, and the gate and latch retain actual parent-relative transforms for movement.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The set owns lighting, terrain and prop placement. Geometry helpers supply primitives; static collection merges stable geometry while retaining the animation hinges outside that batch.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Repeated masonry variation derives from fixed position-based seeds. Layout, afternoon lighting and tint are authored set choices rather than a reconstructed location survey.
 * @evidence contracts/development/implementation.md#efficient-algorithms Construction visits each static source geometry and its vertices for the material batches. Seek needs no terrain rebuild.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Static meshes with the same fixed palette material merge once per set construction. Geometry positions are owned by that new scene; palette materials remain shared.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Static collection disposes source and temporary geometries after merging. The scene owns the baked meshes, moving geometries and lights; palette materials remain module-owned.
 */
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
