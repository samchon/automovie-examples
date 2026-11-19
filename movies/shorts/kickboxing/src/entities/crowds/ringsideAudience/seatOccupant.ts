import * as THREE from "three";
import type { ArtDepartment } from "../../../shared/ArtDepartment";

/**
 * Adds one seated background figure to a tier. Position and height offset are in world metres; turn and lean are radians. The caller supplies the palette and the scene's shared art.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment describes scene mutation, coordinate and angle units, and the shared art input.
 * @evidence contracts/development/implementation.md#principled-implementation Scaled rigid primitives depict one bent seated figure. The tier transform is baked into those primitives so the static arena can batch them together.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure A temporary body frame groups limb and body placement. One transfer pass attaches the fixed pieces directly to the set.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Heights, lean and colours are authored variation inputs, applied uniformly through the same figure construction.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each call creates and transfers a fixed number of pieces. Later per-frame rendering reuses the resulting arena batch.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Repeated seated figures reuse geometry and materials keyed by shape and paint through the same art department.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Only the figure meshes attach to the caller's set. Their shared resources belong to the art department; the temporary group is not retained.
 * @evidence contracts/development/entities.md#settings-realization docs/body/screenplay/kickboxing/020-the-round.md#p01 places the anonymous seated rows behind the named witnesses. The set supplies row positions; this fragment gives each occupant a seated figure and individual shade and lean. The soundtrack owns the crowd murmur.
 * @evidence contracts/development/entities.md#object-shape Given placement and variation data, this builder attaches rigid silhouettes to its supplied set. The set batches those static parts. There is no independent mutable crowd track or installed crowd action for these background figures.
 * @evidence contracts/development/entities.md#controls-and-source The local primitive definitions expose metres, yaw, lean, height offset and a fixed palette at the set call. The scene uses that one stylized form across the anonymous rows.
 */
export function seatOccupant(art:ArtDepartment,set:THREE.Group, x:number,y:number,z:number, angle:number, shirt:string,skin:string,hair:string, tall:number, lean:number) {
 const body=new THREE.Group();body.position.set(x,y,z);body.rotation.y=angle;
 const piece=(c:string,px:number,py:number,pz:number,sx:number,sy:number,sz:number,rz=0)=>{
   const mesh=art.form("crowd",c,[px,py,pz],[sx,sy,sz],body);mesh.rotation.z=rz;return mesh;
 };
 const jacket=piece(shirt,0,.54+tall,.012,.44,.55,.29,lean);
 jacket.rotation.x=.08;
 piece(shirt,0,.74+tall,.010,.50,.17,.26,lean);
 for(const k of [-1,1]){
   const arm=piece(shirt,k*.206,.536+tall,.060,.103,.34,.123, k*.15+lean);
   arm.rotation.x=-.26;
   piece(skin,k*.136,.39+tall,.17,.092,.06,.091);
   const thigh=piece("#343c43",k*.105,.31,.08,.179,.18,.34);
   thigh.rotation.x=-.2;
   piece("#303940",k*.105,.175,.18,.11,.30,.13);
 }
 piece(skin,.025*lean,.906+tall,.048,.187,.239,.177,lean);
 piece(hair,.025*lean,1.000+tall,.035,.190,.113,.181,lean);
 body.updateMatrix();
 for(const m of [...body.children]){
  m.updateMatrix();m.applyMatrix4(body.matrix);set.add(m);
 }
}
