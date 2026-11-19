import * as THREE from "three";
import { carryPortraits } from "./CarryPortraits";

/**
 * Names the seven living roles with both a portrait and costume; the bier owns the covered uncle.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Identifies the keys that the costume, face and native performance resolve together.
 * @evidence contracts/development/design.md#principled-representation The portrait table supplies a closed union of role identifiers. It rejects a general string and the uncle at type checking; plain JavaScript callers still need to supply a valid key.
 * @evidence contracts/development/design.md#minimal-and-owned-surface The portrait key set owns identity. Wardrobe, scene cast and native tracks use the same key rather than maintaining parallel aliases.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts The name is a production cast key, with no arbitrary-string or optional fallback.
 * @evidence contracts/development/entities.md#settings-realization The living keys identify docs/body/brief/cast/denis.md#appearance, docs/body/brief/cast/colin.md#appearance, docs/body/brief/cast/widow.md#appearance, docs/body/brief/cast/relief-bearer.md#appearance, docs/body/brief/cast/front-bearer-left.md#appearance, docs/body/brief/cast/front-bearer-right.md#appearance and docs/body/brief/cast/gate-woman.md#appearance. The bier owns docs/body/brief/cast/shrouded-uncle.md#appearance.
 * @evidence contracts/development/entities.md#object-shape This alias exposes identity only; it owns no actor or mutable state.
 * @evidence contracts/development/entities.md#controls-and-source Each key selects the fixed portrait and matching wardrobe input consumed by face, dress and the actor.
 */
export type CarryRole = keyof typeof carryPortraits;
/**
 * Defines a garment ring in the pivot's local metres, with optional forward offset and fold strength.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names tuple order, local coordinates and the optional shape controls.
 * @evidence contracts/development/design.md#principled-representation Height is local Y, width and depth are radial half extents, and forward moves local Z. Fold strength is a dimensionless multiplier. The tuple fixes arity and numeric positions, while ring ordering and valid dimensions remain caller premises.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Cloth owns the ring format and wardrobe and sleeve assembly use it; the optional values preserve the simpler flat-ring case.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts The options are independently applicable at runtime. This numeric tuple does not statically constrain finite values or nonnegative radii.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/widow.md#appearance needs long wool and an ivory veil. Rings supply silhouette dimensions to cloth; they do not assign a garment or role.
 * @evidence contracts/development/entities.md#object-shape A readonly sequence of shape inputs, with no pose, mutable state or timing.
 * @evidence contracts/development/entities.md#controls-and-source The production loft reads the tuple directly; omitted offset and folds become zero in cloth.
 */
export type Ring = readonly [height: number, width: number, depth: number, forward?: number, folds?: number];
const tau = Math.PI * 2;
const solid = new Map<number, THREE.MeshStandardMaterial>();

/**
 * Returns the shared rough, double-sided surface for a numeric Three color.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Describes material identity, caller ownership and the fixed finish.
 * @evidence contracts/development/implementation.md#principled-implementation Constructs a rough MeshStandardMaterial for the requested color with DoubleSide so open fabric can be seen from either side.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure This factory owns flat color and roughness. Cloth uses its separate fabric material when a woven texture is needed.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Roughness is an art-direction value for the shared finish; it does not stand for a measured textile coefficient.
 * @evidence contracts/development/implementation.md#efficient-algorithms One color-key lookup normally suffices; a miss constructs one material.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Fixed roughness and side leave the color as the material key. Callers borrow the mutable Three object and must treat the shared finish as fixed.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The module retains one material per distinct requested color without eviction; the actual production uses a fixed palette. Lane disposal visits materials reached from the scene.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/colin.md#appearance and docs/body/brief/cast/denis.md#appearance distinguish their palette. Wardrobe chooses the colors and this factory applies them to paintable surfaces.
 * @evidence contracts/development/entities.md#object-shape Returns a borrowed material for meshes; the color cache belongs to the module.
 * @evidence contracts/development/entities.md#controls-and-source Procedural color and finish settings come from this production and Three; this helper uses no photograph or external texture.
 */
export function paint(color: number): THREE.MeshStandardMaterial {
  let material = solid.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness: .91, side: THREE.DoubleSide });
    solid.set(color, material);
  }
  return material;
}

/**
 * Samples a regular grid between zero and one in each parameter and returns an indexed Three geometry.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States parameter coordinates, topology and fresh geometry ownership.
 * @evidence contracts/development/implementation.md#principled-implementation Samples the callback at both ends of each normalized axis, emits two triangles per cell with fixed winding and lets Three compute normals. Positive row and column counts are caller premises.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The callback owns the shape; this sampler owns indexing and vertex normals.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Every vertex comes from the supplied callback, with no interpolation from capture data or correction for a fixture.
 * @evidence contracts/development/implementation.md#efficient-algorithms For R rows and C columns, topology and normals cost O(RC) time and storage in addition to the callback cost.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Each sampled point is stored once and is reused by adjacent indexed triangles. A later call can supply a different shape.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller owns the returned geometry, and temporary coordinate and index arrays have no module owner.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/widow.md#appearance calls for draped wool and an ivory veil. The grid supplies their topology to the garment builders without prescribing a cut.
 * @evidence contracts/development/entities.md#object-shape This geometry helper returns an owned mesh buffer and has no subject or timeline state.
 * @evidence contracts/development/entities.md#controls-and-source Rows, columns and the point callback control a single procedural surface; no separate cached coarse form is exported.
 */
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

/**
 * Adds a garment loft to its parent using local rings in metres; the default is 12 waves and 48 angular segments.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the ring coordinate frame, sampling defaults and parenting effect.
 * @evidence contracts/development/implementation.md#principled-implementation Sweeps the provided local rings through a full turn, modulating each radius by its fold value. UVs use an approximate middle-ring circumference and a 0.14 m weave repeat; the caller supplies at least two rings.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Ring data owns costume cut, surface owns indexing, and fabric owns the common weave and the color cache.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Wave weights, repeat size and default counts are the production's visual settings rather than measured weave or cloth dynamics.
 * @evidence contracts/development/implementation.md#efficient-algorithms Geometry, indices, normals and UVs grow with rings times angular segments; a dye-cache miss creates a material.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Fabric shares one generated weave and one dye material per color; the geometry is new because each ring series and pivot placement can differ.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Each resulting mesh and geometry join its parent. Fabric retains the common weave and one material per distinct dye with no eviction.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/denis.md#appearance and docs/body/brief/cast/widow.md#appearance name wool and distinct colors. Dress supplies these colors and cuts; the loft lays visible folds on the garment.
 * @evidence contracts/development/entities.md#object-shape Adds and returns a mutable Three mesh for its parent. Material cache and the common weave remain module-owned.
 * @evidence contracts/development/entities.md#controls-and-source Ring sequence, dye, wave frequency and angular segments drive this production's procedural fabric. Dress can add approved cast-photo detail to the same geometry.
 */
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

/**
 * Parents a fresh mesh on the supplied pivot using the caller's geometry and material.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the local pivot, borrowed buffers and the scene mutation.
 * @evidence contracts/development/implementation.md#principled-implementation Uses Three's Mesh and Group attachment directly, with casting and receiving flags for renderers that enable shadows.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure This helper owns mounting and flags. Its caller owns geometry generation, active render policy and pose.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The flags apply uniformly and do not change the standard beauty renderer's shadow switch.
 * @evidence contracts/development/implementation.md#efficient-algorithms Adds one mesh without copying vertex or texture data; Three owns the group insertion.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the supplied geometry and material by reference so the caller can intentionally share them.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The parent retains the mesh. The owning lane traverses and disposes the distinct scene geometries and materials during unmount.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/colin.md#appearance is realized in the supplied garment geometry and dyes. This helper attaches those visible resources to the correct pivot.
 * @evidence contracts/development/entities.md#object-shape Returns the attached Three mesh; the parent owns placement and this helper has no persistent state.
 * @evidence contracts/development/entities.md#controls-and-source Takes local geometry and a material from the caller. Installed Three draws their actual attachment and no duplicate path is used.
 */
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
/**
 * Adds a dyed ellipsoid centered and scaled in its parent's local metres.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Documents the local center and the three radius scales of the returned attached mesh.
 * @evidence contracts/development/implementation.md#principled-implementation A shared unit sphere is translated to local x, y, z and scaled by the supplied local radii. Positive radii are a caller premise.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Material and parenting follow the other sculpting helpers; only the local transform is specific to this ellipsoid.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The fixed sphere is a production detail choice for small garment, face and accessory forms, not a measured body surface.
 * @evidence contracts/development/implementation.md#efficient-algorithms Per call one mesh and transform are built; sphere vertices are not regenerated.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work All calls use the same unit sphere and borrow paint by color. Transform changes are per mesh.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The unit sphere persists with this module. Each attached mesh is retained by its caller's scene.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/denis.md#appearance requires the belt purse. Wardrobe supplies its plum-shaped body and raised details using oval alongside its seam work.
 * @evidence contracts/development/entities.md#object-shape Returns an attached, independently transformed mesh, not a pose for the actor.
 * @evidence contracts/development/entities.md#controls-and-source Caller controls radius, location and color. The fixed Three sphere is drawn directly under each pivot.
 */
export function oval(group: THREE.Group, color: number, x:number,y:number,z:number, w:number,h:number,d:number): THREE.Mesh {
  const object = mesh(group,sphere,paint(color));
  object.position.set(x,y,z);
  object.scale.set(w,h,d);
  return object;
}

/**
 * Sweeps a dyed tube through supplied local metre points at the requested radius.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States point and radius units, the local pivot and ownership of the attached result.
 * @evidence contracts/development/implementation.md#principled-implementation Fits a Three Catmull-Rom spline to the ordered centerline and builds a five-sided tube with at least five longitudinal divisions. Caller centerlines contain enough points for a usable curve.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The caller owns the sewn path; the helper translates that path into a renderable tube under the pivot.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No seam is cloned from a shot. The segment rule and radial resolution are local art-detail choices.
 * @evidence contracts/development/implementation.md#efficient-algorithms Longitudinal subdivisions grow with input point count and radial subdivisions are fixed; material construction is by color cache miss.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Paint can be reused for equivalent color. Geometry depends on the full ordered curve and radius and is built on each call.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The parent retains the tube and its geometry. No curve or temporary point list is cached.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/denis.md#appearance calls for a crooked-eared stitched hare. Wardrobe supplies each seam path, and the tube gives it relief on the leather.
 * @evidence contracts/development/entities.md#object-shape Returns an attached mutable mesh. Its parent owns its pose, and the helper owns no actor state.
 * @evidence contracts/development/entities.md#controls-and-source Controls are path, local radius and color. Geometry is procedural from the production-authored seam and uses Three's installed spline and tube.
 */
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

/**
 * Adds a photographic skin mesh and mouth below the head pivot. Width and height are local metres.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Describes the role source, local dimensions, installed skin, and the named jaw and mouth controls.
 * @evidence contracts/development/implementation.md#principled-implementation Reprojects the fixed 128×176 RGB crop onto a front-facing angular profile, blends the temples to the supplied dyed skin, and samples a matching jaw morph and mouth landmark.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Portrait tiles own likeness, the loft owns the curved head and local jaw delta, and the actor controls when the jaw and mouth move.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Profile knots and feature terms are hand-authored visual fit; they do not imply measured anatomy or phoneme-driven speech.
 * @evidence contracts/development/implementation.md#efficient-algorithms The 384×176 texture and 72×104 grid are fixed for every head; texture fill and two position arrays dominate construction.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The role's encoded RGB input and common profiles are reused. A head with its geometry, morph and skin blend is new on each call.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Face mesh, mouth and texture are attached to the supplied head. The lane visits their mesh resources on unmount, and this function retains no per-face cache.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/denis.md#appearance and docs/body/brief/cast/colin.md#appearance distinguish beard and clean-shaven long face. The role's approved face sample and fitted head shape preserve those cues for Cast.
 * @evidence contracts/development/entities.md#object-shape Adds face-skin and mouth; Cast owns jaw weight, mouth visibility, and all head motion.
 * @evidence contracts/development/entities.md#controls-and-source Uses the fixed crop receipt in docs/prompts/casting/photographs.md. The color surface and jaw morph reach the actual head mesh; the crop has no retained source rig.
 */
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
/**
 * Adds a head cloth shaped by fitted local crown height, half-width, and rear fall in metres.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the inputs' scale and local pivot and what attaches to it.
 * @evidence contracts/development/implementation.md#principled-implementation Uses a swept angular grid with a front opening, greater drop on the rear and a small surface wave along the edge.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Dress chooses the period silhouette and color; this helper builds the cloth without changing the head or face.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Opening and fall are visual geometry choices derived from which side faces forward, without cloth-force claims.
 * @evidence contracts/development/implementation.md#efficient-algorithms The 22×52 grid and its normals have fixed construction cost per covering.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Paint is borrowed by color. Width, height and fall vary by garment, so the geometry belongs to the instance.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Attaches one mesh to the caller's head; it retains no intermediate data beyond the shared paint already owned by its module.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/widow.md#appearance and docs/body/brief/cast/gate-woman.md#appearance specify ivory or cream cloth. Dress supplies the variants and this surface keeps their faces open.
 * @evidence contracts/development/entities.md#object-shape The mounted cloth is static relative to the head pivot, and Cast moves the pivot.
 * @evidence contracts/development/entities.md#controls-and-source Uses local metre dimensions and production dye. Dress supplies the different authored parameters for the veil, head kerchief and hood.
 */
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

/**
 * Adds the shaded scalp mesh for the given local head height and width in metres.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Describes scalp fit and the independent bald-crown and curled options.
 * @evidence contracts/development/implementation.md#principled-implementation Sweeps the head profile from a modulated hairline to the crown, restricting the arc when bald and shaping strand texture by vertex colors.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Shares head profiles with face; this function owns only scalp shape and shading while Wardrobe picks the color and variant.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Taper and oscillation values make visible art-directed waves, without simulating strand physics.
 * @evidence contracts/development/implementation.md#efficient-algorithms 42×112 sampling, per-vertex colors and normal computation are fixed per head.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the same face profile arrays; each result has its own geometry and vertex-colored material.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The parent retains one named hair mesh. The lane disposes scene geometries and materials, and this helper keeps no scalp cache.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/denis.md#appearance and docs/body/brief/cast/relief-bearer.md#appearance give brown curls and a bald crown. Wardrobe passes curled and bald flags respectively.
 * @evidence contracts/development/entities.md#object-shape Mounts the hair mesh directly under the head. It has no separate time or state.
 * @evidence contracts/development/entities.md#controls-and-source Procedural profile, color and the two flags produce the visible scalp; face-photo rights are recorded separately and no source hair geometry is imported.
 */
export function hair(group:THREE.Group,color:number,h:number,w:number,bald:boolean,curled:boolean):void {
  const colors:number[]=[], tint=new THREE.Color(color);
  const geo=surface(42,112,(v,u)=>{
    const a=bald ? Math.PI*.34 + Math.PI*1.32*u : tau*u, f=Math.cos(a);
    const front=Math.max(0,f), edge=.013*Math.sin(12*a+.4)+.009*Math.cos(7*a);
    const low=.12+.13*(1+f)/2+.55*front**2.1+edge;
    const high=bald ? .76-.26*front : 1;
    const t=THREE.MathUtils.lerp(low,high,v);
    const sweep=curled? Math.sin(26*a+5*Math.sin(9*v+4*a))*Math.cos(23*v+3*Math.cos(7*a)) : Math.sin(25*a+12*v+1.1*Math.sin(13*a+5*v));
    const thick=(curled ? 0.0080 : 0.0045)*(1+.53*sweep)*(.45+.55*Math.sin(Math.PI*v));
    const shade=(curled?1.08:1.14)+.26*sweep+.09*Math.sin(7*a+5*v);
    colors.push(tint.r*shade,tint.g*shade,tint.b*shade);
    const depth=f<0 ? profile(backDepth,t) : profile(frontDepth,t);
    const taper=Math.sqrt(Math.max(.02,1-v**9));
    return new THREE.Vector3((w*profile(widths,t)+thick*taper)*Math.sin(a),t*h+thick*.55*v,(depth+thick*taper)*Math.sign(f)*Math.abs(f)**(f >= 0 ? 0.79 : 0.90));
  });
  geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  const object=mesh(group,geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.83,side:THREE.DoubleSide}));
  object.name="hair";
}
