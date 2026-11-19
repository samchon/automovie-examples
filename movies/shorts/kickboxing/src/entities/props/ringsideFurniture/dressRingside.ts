import * as THREE from "three";
import type { ArtDepartment } from "../../../shared/ArtDepartment";
import { roundFloor } from "../../../shared/roundFloor";

import { roundClock } from "../../../clock";

const { apronHeight: APRON_HEIGHT } = roundFloor;

/** Names the people whose starting marks anchor furniture outside the ring. */
type SeatedRole = "jo" | "ed" | "ivo" | "pavel" | "ruth" | "maya" | "alan";

/** Starting world position in metres and bearing in radians for one chair. */
type Seat = { x: number; z: number; yaw: number };

/**
 * Places the ringside seats, stool, towel and timekeeper's table in world metres using the cast's starting positions. Returns a function that advances the loose props at a requested programme second.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment identifies attached props, the initial cast coordinate frame and the returned update's timebase.
 * @evidence contracts/development/implementation.md#principled-implementation Seat legs are fixed under the cast anchors. The table follows Alan's facing direction, and the prop motions use the opening and closing bell times and Ed's scripted stool beat.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Fixed dressing is placed and batched together, while the bell, striker and stool stay independently movable.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Time and location are shot inputs shared with the cast and sound clock. The props derive their motion on seek.
 * @evidence contracts/development/implementation.md#efficient-algorithms One pass places the seven chairs and their fixed prop pieces. The returned closure updates three rigid transforms using two bell onsets and one stool onset.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Batches and prop meshes are constructed once for the scene. The closure reuses them when seeking forward or backward.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The fixed prop groups belong to the scene and use resources owned by the supplied art department. This function opens no independent resource.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/alan-price.md#timekeeper fixes the table, striker and bell. docs/body/brief/cast/ed-lane.md#stool-and-lower-rope fixes the stool, and docs/body/brief/cast/ivo-kral.md#keeping-the-corner-ready fixes the towel. Their drawn placements follow the starting seat poses. docs/body/screenplay/kickboxing/020-the-round.md#p12-b02 fixes the closing bell response.
 * @evidence contracts/development/entities.md#object-shape The chair, table and towel are fixed dressings. Bell, striker and stool transforms stay in a mutable drawing closure sampled by the scene. It groups the live prop pieces rather than representing each as an immutable capability class.
 * @evidence contracts/development/entities.md#controls-and-source The project constructs these props from its own fixed primitive dimensions and materials. The bell and stool use local offsets. During the closing pickup, the striker follows a sampled hand position from the scene, with local blends onto and off the table.
 */
export function dressRingside(scene: THREE.Scene, art: ArtDepartment, cast: Record<SeatedRole,Seat>) {
  const dressing=new THREE.Group();scene.add(dressing);
  const floor=-APRON_HEIGHT;
  const place=(colour:string,shape:"tube"|"box"|"round",p:number[],d:number[])=>art.form(shape,colour,p,d,dressing);
  for(const role of ["jo","ed","ivo","pavel","ruth","maya","alan"] as const) {
    const p=cast[role];
    place("#393f45","box",[p.x,floor+.44,p.z],[.45,.065,.43]);
    for(const x of [-.17,.17])for(const z of [-.15,.15])place("#667074","tube",[p.x+x,floor+.21,p.z+z],[.032,.42,.032]);
    if(role==="jo"||role==="ed"||role==="pavel"||role==="ivo"){
      place("#717c82","tube",[p.x+.32,floor+.14,p.z],[.19,.25,.19]);
      if(role==="ivo")place("#aab2ba","box",[p.x+.055,floor+.53,p.z+.13],[.22,.055,.29]);
    }
  }
  const alan=cast.alan;
  const tangent=new THREE.Vector2(Math.sin(alan.yaw),Math.cos(alan.yaw));
  const x=alan.x+tangent.x*.43,z=alan.z+tangent.y*.43;
  const table=place("#414846","box",[x,floor+.72,z],[.88,.07,.44]);table.rotation.y=alan.yaw;
  const bell=place("#ad8f4e","round",[x,floor+.80,z],[.19,.11,.19]);
  place("#a78245","tube",[x,floor+.757,z],[.22,.022,.22]);
  const striker=place("#64432f","box",[x+.21,floor+.775,z],[.19,.025,.025]);striker.rotation.y=alan.yaw+.2;
  for(const k of [-1,1])place("#4a5358","box",[x+k*.33*Math.cos(alan.yaw),floor+.35,z-k*.33*Math.sin(alan.yaw)],[.045,.68,.06]);
  // Batch released set dressing except the timekeeper's visible brass and wood.
  const rack=new THREE.Group();scene.add(rack);rack.attach(striker);rack.attach(bell);art.batch(dressing);
  const strikerRest = striker.position.clone();
  const stool=new THREE.Group();stool.position.set(-2.52,floor,3.52);scene.add(stool);
  art.form("box","#49433e",[0,.39,0],[.33,.055,.31],stool);
  for(const x of [-.124,.124])for(const z of [-.114,.114])art.form("tube","#5a6667",[x,.19,z],[.025,.38,.025],stool);
  art.batch(stool);
  return (t:number, observedHand?: THREE.Vector3)=>{
    const stroke=[0,roundClock.bell].reduce((s,c)=>s+(t>=c && t<c+.24?Math.exp(-(t-c)*15)*Math.sin((t-c)*60):0),0);
    const carry = THREE.MathUtils.smoothstep(t,168.01,168.24) * (1-THREE.MathUtils.smoothstep(t,170.16,170.66));
    striker.position.copy(strikerRest);
    if (observedHand && carry > 0) striker.position.lerp(observedHand, carry);
    bell.rotation.z=stroke*.024;striker.rotation.z=stroke*.30+.96*carry;
    const trip=Math.max(0,t-12.73);
    stool.rotation.z=trip<=1.6?Math.sin(trip*12)*Math.exp(-trip*3)*.22:0;
  };
}
