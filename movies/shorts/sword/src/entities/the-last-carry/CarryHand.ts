import { AutoMovieLoftChain } from "@automovie/engine";
import { AutoMovieHumanConicLoft, AutoMovieHumanF1, AutoMovieHumanF1Joints } from "@automovie/human";
import * as THREE from "three";

/**
 * Returns shared Human F1 hand geometry in a palm-centred metre frame, with one pinch morph.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the installed source, palm frame, output ownership and available morph.
 * @evidence contracts/development/implementation.md#principled-implementation Samples the installed palm and five digit conic lofts and converts millimetres to metres in a basis fixed by wrist and knuckle joints. Index and thumb move to the same local pinch neighborhood; a missing chain fails construction.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The SDK owns loft families and joint locations; this adapter owns their sample grid, palm transform, morph and index buffer. Cast owns independent grip weights.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The 0.68 palm-centre interpolation and pinch offsets fit the stage marker. They are authored presentation targets, not anthropometric data or a cloth-object contact solver.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each of six fixed families has a finite station set plus the resolved chain layers; work grows with their total times 20 angular phases and the corresponding triangle indices.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The open palm vertices, morph and indices are shared across all roles and both sides. The actor mirrors a mesh and gives it its own grip weight.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources One geometry persists for the module lifetime. Scene mounts share its handle and the lane disposes reachable geometry buffers at teardown.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/widow.md#appearance requires bare hands on a pole. docs/body/screenplay/the-last-carry/010-valley-lane.md#mark needs visible fingers at the splinter. Cast receives the same visible geometry for both.
 * @evidence contracts/development/entities.md#object-shape Returns a borrowed mutable Three buffer that callers treat as shared source. Grip and pose state belong to the actor mesh, and no handle or timing is returned.
 * @evidence contracts/development/entities.md#controls-and-source AutoMovieHumanF1 and AutoMovieHumanConicLoft provide the actual drawn base positions. The production adds a visible pinch morph and mirrors the same mesh per side; the installed SDK supplies the loft source.
 */
export function carryHandGeometry(): THREE.BufferGeometry {
  if (shared) return shared;
  const joint = (values: readonly number[]) => new THREE.Vector3(values[0], values[1], values[2]);
  const wrist=joint(AutoMovieHumanF1Joints.hand);
  const knuckle=joint(AutoMovieHumanF1Joints.middle1);
  const center=wrist.clone().lerp(knuckle,.68);
  const y=knuckle.clone().sub(wrist).normalize();
  const lateral=joint(AutoMovieHumanF1Joints.index1).sub(joint(AutoMovieHumanF1Joints.pinky1));
  const z=lateral.clone().cross(y).normalize();
  const x=y.clone().cross(z).normalize();
  const inPalm=(v:THREE.Vector3)=>new THREE.Vector3(v.dot(x),v.dot(y),v.dot(z)).multiplyScalar(.001);
  const site=(v:readonly number[])=>inPalm(joint(v).sub(center));
  const pinch=new THREE.Vector3(.040,.067,.014);
  const indexBase=site(AutoMovieHumanF1Joints.index1), thumbBase=site(AutoMovieHumanF1Joints.thumb1);
  const indexTip=site(AutoMovieHumanF1Joints.indexPad), thumbTip=site(AutoMovieHumanF1Joints.thumbPad);
  const positions:number[]=[], closed:number[]=[];
  const indices:number[]=[];
  const families=[AutoMovieHumanF1.BODY.hand,...AutoMovieHumanF1.DIGITS.filter(d=>d.limb==="arm").map(d=>d.family)];
  for(const family of families){
    const index=family.name==="finger.index", thumb=family.name==="finger.thumb";
    const base=index?indexBase:thumbBase, tip=index?indexTip:thumbTip;
    const target=pinch.clone().add(new THREE.Vector3(index?-.001:.001,0,0));
    const axis=tip.clone().sub(base);
    const moved=target.sub(base);
    const ratio=moved.length()/axis.length();
    const rotation=new THREE.Quaternion().setFromUnitVectors(axis.normalize(),moved.normalize());
    const count=family===families[0]?20:14;
    const phases=20;
    const first=family.knots[0]!, last=family.knots[family.knots.length-1]!;
    const stations=Array.from({length:count},(_,i)=>first+(last-first)*i/(count-1));
    const loft=AutoMovieHumanConicLoft.create(family,stations);
    if(!loft.chain) throw new Error("Human hand surface did not resolve: "+family.name);
    const chain=loft.chain;
    const layers=Array.from(new Set([...stations,...chain.layers.map(layer=>layer.y)])).sort((a,b)=>a-b);
    const start=positions.length/3;
    for(let j=0;j<layers.length;j++) for(let i=0;i<phases;i++){
      const p=joint(AutoMovieLoftChain.point(chain,layers[j]!,i*2*Math.PI/phases)).sub(center);
      const vertex=inPalm(p);
      positions.push(vertex.x,vertex.y,vertex.z);
      if(index||thumb){
        vertex.sub(base);
        const along=vertex.dot(axis);
        vertex.addScaledVector(axis,along*(ratio-1)).applyQuaternion(rotation).add(base);
      }else if(family.name.startsWith("finger.")){
        // Curl the three free fingers toward the palm as the index and thumb meet.
        const flex=THREE.MathUtils.smoothstep(vertex.y,.021,.093);
        vertex.y-=.038*flex;
        vertex.z-=.023*flex;
      }
      closed.push(vertex.x,vertex.y,vertex.z);
      if(j+1===layers.length)continue;
      const a=start+j*phases+i,b=start+j*phases+(i+1)%phases;
      indices.push(a,a+phases,b,b,a+phases,b+phases);
    }
    const rim=start+(layers.length-1)*phases;
    for(let i=1;i<phases-1;i++) indices.push(rim,rim+i,rim+i+1);
  }
  shared=new THREE.BufferGeometry();
  shared.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  shared.morphAttributes.position=[new THREE.Float32BufferAttribute(closed,3)];
  shared.setIndex(indices);
  shared.computeVertexNormals();
  return shared;
}

let shared: THREE.BufferGeometry | undefined;
