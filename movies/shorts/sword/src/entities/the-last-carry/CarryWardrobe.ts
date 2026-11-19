import * as THREE from "three";
import { carryWoolFolds } from "./CarryWoolFolds";
import { cloth, cord, covering, face, hair, mesh, oval, paint, type CarryRole } from "./CarrySculpture";

/** Fitted shoulder heights and widths in metres, followed by role-specific Three palette colors. */
export const castWardrobe = {
  denis:             {h:1.40,w:.44, coat:0x45543b, trim:0x353e2c, hose:0x574334, hide:0x513525, hair:0x422c20, skin:0xbd9277},
  colin:             {h:1.46,w:.39, coat:0x424d5b, trim:0x86453f, hose:0x494340, hide:0x423329, hair:0x241f1b, skin:0xc49c83},
  widow:             {h:1.31,w:.41, coat:0x514036, trim:0xede2c9, hose:0x4b4036, hide:0x4c392c, hair:0x91877a, skin:0xc09579},
  "relief-bearer":    {h:1.49,w:.43, coat:0x63513b, trim:0x935035, hose:0x625943, hide:0x4b3925, hair:0x44352b, skin:0xb98a70},
  "front-bearer-left":{h:1.38,w:.45, coat:0x69523d, trim:0xa47936, hose:0x63574e, hide:0x523a28, hair:0x514941, skin:0xbe9278},
  "front-bearer-right":{h:1.46,w:.42, coat:0x536579, trim:0x555c67, hose:0x514640, hide:0x503b2b, hair:0x634635, skin:0xc29b80},
  "gate-woman":      {h:1.36,w:.37, coat:0x655d52, trim:0x344553, hose:0x504940, hide:0x46382f, hair:0xa7a196, skin:0xbf977d}
} as const;

/** A stitched hare visible even as the purse turns across the close shot. */
function purse(body:THREE.Group):void {
  const mount=new THREE.Group();
  mount.name="hare-purse";
  mount.position.set(-.145,.96,.137);
  mount.rotation.y=-.37;
  body.add(mount);
  oval(mount,0x4c2e1d,0,0,0,.070,.069,.030);
  oval(mount,0x67432b,0,.020,.014,.068,.046,.022);
  const thread=0xd1ae72;
  const seam=(pairs:number[][])=>cord(mount,thread,.00165,pairs.map(([x,y])=>[x!,y!, .038-.008*(x!/.065)**2]));
  seam([[-.039,-.003],[-.037,.009],[-.025,.018],[-.014,.017],[-.004,.013],[.008,.016],[.014,.027],[.023,.031],[.032,.021],[.040,.018],[.029,.012],[.023,.011],[.015,.001],[.004,-.006],[-.020,-.008],[-.029,-.004],[-.039,-.003]]);
  seam([[.014,.026],[.007,.045],[.001,.052],[.003,.041],[.010,.026]]);
  seam([[.019,.031],[.020,.046],[.031,.050],[.028,.045],[.024,.044],[.025,.032]]);
  seam([[-.024,.003],[-.020,-.004],[-.034,-.012],[-.016,-.012],[-.005,-.005]]);
  seam([[.012,.003],[.016,-.005],[.032,-.005]]);
  oval(mount,thread,.026,.022,.038,.0018,.0018,.0014);
  for(const x of [-.039,.039]) cord(mount,0x68432c,.008,[[x,.043,0],[x,.080,-.016],[x,.099,-.025]]);
}

/**
 * Fits the role's costume and visible facial detail to the body and head pivots in local metres. The actor owns sleeve and head motion.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the selected source, both pivot spaces and which parts the actor moves.
 * @evidence contracts/development/implementation.md#principled-implementation Lofts the role's fitted upper garment and skirt through ordered rings, then mounts its head covering and face. The photo grayscale is resampled onto the same garment geometry, with the green coat's purse kept as geometry.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The wardrobe decides garment cuts and colors; the sculpting helpers own surfaces and textures, and Cast supplies limb motion and placement.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Cuts, collars and seams are authored forms based on cast silhouettes. The green doublet's source crease crop avoids printing a second purse and does not replace the moving prop.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each attached mesh is built once per actor. The 64×128 fold texture and garment vertex count dominate the visible coat detail pass.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Keeps the fixed cast source samples and shared paint and weave inputs. Instance geometry and coat material stay separate because geometry and maps depend on role and fit.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller's pivots retain their attached meshes. Scene disposal reaches their geometries and materials; Dress keeps no per-actor cache.
 * @evidence contracts/development/entities.md#settings-realization The green doublet and hare purse come from docs/body/brief/cast/denis.md#appearance, the blue coat and red collar from docs/body/brief/cast/colin.md#appearance, and the ivory veil from docs/body/brief/cast/widow.md#appearance. The ochre hood, slate cap, russet mantle and gate kerchief come from docs/body/brief/cast/front-bearer-left.md#appearance, docs/body/brief/cast/front-bearer-right.md#appearance, docs/body/brief/cast/relief-bearer.md#appearance and docs/body/brief/cast/gate-woman.md#appearance.
 * @evidence contracts/development/entities.md#object-shape Mutates the supplied body and head pivots by attachment. Cast owns local pose, limb geometry and timing; this construction itself does not animate.
 * @evidence contracts/development/entities.md#controls-and-source Uses the fixed cut table and face and fold crops with documented rights in docs/prompts/casting/photographs.md. The commissioned detail is the only built variant. It uses installed Three meshes with retained jaw and wool detail.
 */
export function dress(body: THREE.Group, head: THREE.Group, role: CarryRole):void {
  const p=castWardrobe[role], h=p.h, w=p.w/2;
  const woman=role==="widow"||role==="gate-woman";
  const hem=woman ? 0.105 : role === "denis" ? 0.665 : 0.535;
  const waist=role==="denis"?1.035:h*.72;
  const centerDepth=role === "denis" ? 0.145 : 0.130;
  const hip=w*.97;
  const skirtWidth=woman?w*1.56:role==="denis"?w*1.03:w*1.14;
  const skirtDepth=woman ? 0.228 : role === "denis" ? 0.158 : 0.175;
  const coat=cloth(body,[[hem,skirtWidth,skirtDepth,0,.065],[hem+.016,skirtWidth,skirtDepth,0,.066],[hem+.10,skirtWidth*.976,skirtDepth*.98,0,.063],[(waist+hem)/2,(skirtWidth+hip)/2,(skirtDepth+.134)/2,0,.051],[waist-.085,hip,.145,0,.038],[waist,w*.83,.126,0,.024],[waist+.045,w*.84,centerDepth,0,.020],[h-.15,w*.96,centerDepth*1.11,0,.014],[h-.065,w*1.02,centerDepth*1.08,0,.007],[h+.022,w*1.01,centerDepth*.88],[h+.055,w*.52,.085],[h+.052,.055,.058]],p.coat);
  applyWoolFolds(coat,role,hem,waist,h);
  if(role==="gate-woman") cloth(body,[[hem+.005,skirtWidth*1.01,skirtDepth*1.01,0,.065],[hem+.034,skirtWidth,skirtDepth,0,.065]],p.trim);
  const belt=woman?0x594a3b:p.hide;
  cloth(body,[[waist-.018,w*.87,.134],[waist+.024,w*.87,.135]],belt,0);
  oval(body,woman?0x6b5d4b:0x99805b,-.016,waist+.003,.138,.025,.021,.008);
  cord(body,belt,.008,[[.019,waist+.009,.14],[.035,waist-.060,.157],[.046,waist-.190,.165]]);
  if(role==="denis") purse(body);
  const linen=0xc9bca1;
  cloth(body,[[h+.012,.096,.093,0,.02],[h+.065,.066,.064,0,.025]],linen);
  cloth(body,[[h-.059,w*.68,.133],[h+.008,w*.69,.119],[h+.072,.075,.077]],role==="colin"?p.trim:role==="gate-woman"?p.trim:p.coat);
  if(role==="colin"){
    for(const side of [-1,1]){
      const verts=[
        side*.012,h-.053,.155, side*.139,h-.035,.127, side*.112,h+.045,.087,
        side*.067,h+.070,.060, side*.046,h+.027,.111
      ];
      const lapel=new THREE.BufferGeometry();
      lapel.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
      lapel.setIndex([0,1,4,1,2,4,2,3,4]);
      lapel.computeVertexNormals();
      mesh(body,lapel,paint(p.trim));
    }
  }
  if(woman||role==="relief-bearer"||role==="front-bearer-left"){
    const mantle=role!=="gate-woman";
    if(mantle){
      const lip=role==="widow"?h-.055:h-.099;
      cloth(body,[[lip,w*1.18,.175,-.003,.045],[lip+.030,w*1.15,.167,0,.046],[h+.018,w*.92,.138,0,.036],[h+.056,w*.54,.099,0,.037],[h+.092,.073,.080,0,.024]],p.trim);
      if(role!=="widow")for(const s of [-1,1])cord(body,0xc4a878,.0035,[[s*.015,h+.015,.118],[s*.018,h-.035,.155],[s*.028,h-.125,.151]]);
    }
  }
  if(!woman && role!=="relief-bearer"){
    cord(body,role==="colin"?0x343944:p.trim,.0025,[[0,waist+.028,.140],[0,h-.14,centerDepth*1.12],[0,h-.065,centerDepth*1.07],[0,h+.025,.107]]);
    for(let i=0;i<5;i++)oval(body,role==="denis"?0x97836a:0x55514c,.009,waist+.055+i*(h-waist-.105)/4,centerDepth*(1.04+.07*Math.sin(i*.7)),.0048,.0048,.0038);
  }
  cloth(body,[[h+.020,.065,.062],[h+.080,.057,.057],[h+.139,.059,.061]],p.skin);
  head.position.y=h+.084;
  const faceW=role === "colin" ? 0.078 : role === "denis" ? 0.091 : woman ? 0.083 : 0.087;
  const faceH=role === "colin" ? 0.247 : woman ? 0.224 : 0.233;
  face(head,role,p.skin,faceW,faceH);
  for(const side of [-1,1]){
    oval(head,p.skin,side*faceW*.955,faceH*.47,-.009,.010,.021,.013);
    oval(head,0x9d7763,side*(faceW+.004),faceH*.474,-.008,.0028,.011,.0060);
  }
  hair(head,p.hair,faceH,faceW,role==="relief-bearer",role==="denis");
  if(role==="widow"||role==="gate-woman"||role==="front-bearer-left"){
    covering(head,role==="gate-woman"?0xd4c8aa:p.trim,faceH+.015,faceW+.021,role === "widow" ? 0.187 : role === "gate-woman" ? 0.114 : 0.132);
    if(role==="widow") cloth(head,[[-.045,.126,.099,0,.045],[-.015,.098,.091,0,.035],[.013,.081,.079,-.001,.026]],p.trim);
  } else if(role==="front-bearer-right"){
    const cap=cloth(head,[[faceH*.72,.086,.095,-.006],[faceH*.80,.102,.114,-.014],[faceH*.94,.110,.120,-.025],[faceH*1.03,.081,.089,-.023],[faceH*1.09,.021,.032,-.012],[faceH*1.10,.003,.003,-.012]],p.trim,7);
    cap.geometry.translate(-.007,-.019,-.004);cap.rotation.z=.065;
  }
}

/** Fit each row of the photographic cloth to the cut garment, giving the rear its own subdued folds. */
function applyWoolFolds(coat:THREE.Mesh,role:CarryRole,hem:number,waist:number,h:number):void {
  const gray=atob(carryWoolFolds[role]);
  const pixels=new Uint8Array(64*128*4);
  for(let i=0;i<gray.length;i++){
    const x=i%64,y=Math.floor(i/64);
    // The front photograph includes Denis's purse. The separate leather prop owns its movement.
    const sample=role==="denis" && x>31 && y<65 ? y*64+63-x : i;
    const value=gray.charCodeAt(sample);
    pixels[4*i]=pixels[4*i+1]=pixels[4*i+2]=value; pixels[4*i+3]=255;
  }
  const folds=new THREE.DataTexture(pixels,64,128);
  folds.magFilter=THREE.LinearFilter;folds.minFilter=THREE.LinearMipmapLinearFilter;
  folds.generateMipmaps=true;folds.needsUpdate=true;
  const geometry=coat.geometry, vertices=geometry.getAttribute("position");
  const originalUV=geometry.getAttribute("uv");
  geometry.setAttribute("uv1",originalUV);
  const uv:number[]=[];
  for(let i=0;i<vertices.count;i++){
    const y=vertices.getY(i), a=2*Math.PI*(i%49)/48;
    const v=y<=waist ? .5*(y-hem)/(waist-hem) : .5+.5*(y-waist)/(h+.052-waist);
    const u=Math.cos(a)>0 ? .5+.49*Math.sin(a) : .5+.40*Math.sin(a);
    uv.push(u,THREE.MathUtils.clamp(v,0,1));
  }
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  const dye=(coat.material as THREE.MeshStandardMaterial).clone();
  dye.color.multiplyScalar(1.59);
  if(dye.bumpMap){dye.bumpMap=dye.bumpMap.clone();dye.bumpMap.channel=1;dye.bumpMap.needsUpdate=true;}
  dye.map=folds;coat.material=dye;
}
