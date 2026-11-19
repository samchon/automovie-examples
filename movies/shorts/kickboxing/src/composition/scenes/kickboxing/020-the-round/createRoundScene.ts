import * as THREE from "three";

import type { IFilmProduction } from "../../../../IFilmProduction";
import { roundClock } from "../../../../clock";
import { createActor } from "../../../../entities/cast/roundCast/createActor";
import type { Role } from "../../../../entities/cast/roundCast/Role";
import { seatOccupant } from "../../../../entities/crowds/ringsideAudience/seatOccupant";
import { dressRingside } from "../../../../entities/props/ringsideFurniture/dressRingside";
import { createArena } from "../../../../entities/sets/ringsideArena/createArena";
import { ArtDepartment } from "../../../../shared/ArtDepartment";
import { performanceAt } from "./performanceAt";
import { roundGestures } from "./roundGestures";
import { roundTravel } from "./roundTravel";

/** Mount the named performers in the scene's stable drawing order. */
const roles: Role[]=["owen","marek","daniel","pavel","ivo","jo","ed","maya","ruth","alan"];

/**
 * docs/body/screenplay/kickboxing/020-the-round.md. Builds the ringside scene from the opening touch through the final claps. The scene seeks in programme seconds and is hidden at the 180-second out-point. The caller owns disposal.
 *
 * Concretization: Scene modules set approximate routes, poses and framing in world metres, radians for body bearing and degrees for the lens. Native overlays fit their actions to the existing beat intervals. The separate programme clock owns the exact edit and sound anchors.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Defines the screenplay scene, mounted entities, seek clock, end state and caller's ownership.
 * @evidence contracts/development/implementation.md#principled-implementation The shared clock samples cast, camera and props. Prepared Human plans overlay supported gestures and walks before each actor fits the goals to its displayed rig.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Scene setup allocates art, set, cast, motion overlays and props once. Seek samples their ordered pipeline and updates the film camera.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The compositor samples live local state at each seek. Its bespoke routes and supported fall are authored display controls, with installed motion only on the available channels.
 * @evidence contracts/development/implementation.md#efficient-algorithms Setup creates ten actors and one bounded arena. Seek samples the authored tracks and active native overlays and propagates their transforms.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Inspector, capture and export resolve the same scene factory. Each created scene reuses its geometry, prepared bodies and motion schedules across seeks.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Dispose releases each actor's shadow, arena material resources and the shared art. The motion plans live in the same scene scope.
 * @evidence contracts/development/composition.md#screenplay-realization The cited sections and beats are the staged scene's plan. The soundtrack and caption scripts consume the same programme clock.
 * @evidence contracts/development/composition.md#composition-only The factory combines entity and motion owners and applies its camera on a fixed clock. Local scene-coordinate transforms and bespoke pose tracks remain beyond the installed operator composition.
 * @evidence contracts/development/composition.md#living-scene Named witnesses carry individual pose and view tracks. Anonymous figures stay seated. The framed ring landmarks and relative actions aim at the written viewing targets.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p01 Opening glove touch, first reply and retreat to red.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p01-b01 The shared clock places the opening cue, offered glove and extra blue step.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p01-b02 Marek's centre hold continues while Owen takes the travelling steps.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p01-b03 The arrival at red drives a locally sampled rope bend and stool movement.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p02 Red's escape and brief answer give way to the white-side route.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p02-b01 Owen clears while the arena still samples the disturbed west rope.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p02-b02 The cue and foot tracks separate the reply from the two red steps.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p02-b03 Marek's track closes the inside route and Owen moves towards white.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p03 At white, two blue seconds keep separate views through Daniel's break.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p03-b01 Owen stops short as Pavel finds a view around blue.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p03-b02 The contact closes and opens the two tracks around Daniel's supported hand gesture.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p03-b03 Owen leaves after the break and Ivo turns to follow.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p04 The crossing, short reply and stopped pursuit separate the two ring routes.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p04-b01 The moving view follows both tracks across the centre mark.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p04-b02 The reply puts Owen's foot down and his route uses the open lane.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p04-b03 Marek returns to the ink while Owen reaches the north rope.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p05 The seated witnesses see Owen's approach, the wrong applause and Maya's later restraint.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p05-b01 The red track leaves the north rope while the yellow and plum figures retain their seats.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p05-b02 A first and joint clap share the clock, then the tracks send Owen back towards the north rope.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p05-b03 Owen faces Marek along the rope near blue before Maya lets her hands settle.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p06 The blue greeting returns to motion and separate breath near white.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p06-b01 Pavel's supported hand gesture answers the staged blue glove.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p06-b02 The east-side marks show Marek gaining and returning the stride.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p06-b03 The two fighter tracks open a gap near the bell for Owen's breath.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p07 South-side travel changes Maya's reason for clapping and revisits the red pad's sightlines.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p07-b01 The route and stride tracks carry both figures past Alan and along the apron.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p07-b02 Maya's supported clap follows the red reply and the completed blue step.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p07-b03 Separate red-corner facing tracks follow Owen and react differently to the pad.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p08 The wait at red gives the response and the later blue reversal distinct intervals.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p08-b01 Owen holds the near side while Marek crosses the gap.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p08-b02 The reply has a separate cue from the sole. The red seconds' supported claps follow.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p08-b03 Marek wins the west lane and Ed carries the last isolated clap.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p09 Marek's stopped feet give Owen a chance to choose his path.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p09-b01 The cancelled heel and breathing pose change at the 120-second turn.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p09-b02 The broadside view distinguishes Owen's stop from Marek's turn at white.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p09-b03 Owen's base track holds his foot at the rim through the reply.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p10 A shared and then empty ring mark leads to the finishing diagonal.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p10-b01 The camera and pose tracks set both figures around the mark.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p10-b02 The two routes leave in order while the view reveals the unoccupied circle.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p10-b03 The later guard accent and camera approach carry into the finish without a cut.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p11 The lateral fall, neutral crossing and count share the settled diagonal.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p11-b01 The decisive cue leads to the local supported side descent and Daniel's down gesture.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p11-b02 Installed walking drives the neutral-corner passage over the authored route.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p11-b03 The figures use a timed count pose, attempted rise and Maya's lean.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p12 Result, celebration, care and two applauding choices stay in the final shared view.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p12-b01 Daniel's assessment and sweep precede Alan's hand taking the visible wooden striker from the table.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p12-b02 The bell releases the two responding corners. Pavel's aisle travel uses the installed walk.
 * @evidence docs/body/screenplay/kickboxing/020-the-round.md#p12-b03 The final poses give the two turns, answer and two claps separate cues before black.
 */
export async function createRoundScene(): Promise<IFilmProduction> {
  const art=new ArtDepartment();
  const scene=new THREE.Scene();
  const arenaBackground=new THREE.Color("#26333d"), black=new THREE.Color(0);
  scene.fog=new THREE.FogExp2("#283541",.047);
  const arena=createArena(scene,art,seatOccupant);
  const cast=roles.map(role=>({role,actor:createActor(role,art,scene)}));
  const body=(role: Role) => {
    const actor=cast.find((entry)=>entry.role===role)?.actor;
    if(!actor)throw Error(`Missing cast body ${role}.`);
    return actor.canonical;
  };
  const travel=roundTravel({owen:body("owen"),pavel:body("pavel")});
  const gestures=roundGestures({owen:body("owen"),marek:body("marek"),daniel:body("daniel"),jo:body("jo"),ed:body("ed"),pavel:body("pavel"),maya:body("maya"),ruth:body("ruth")});
  const props=dressRingside(scene,art,performanceAt(0).people);
  const timekeeper = cast.find(({role}) => role === "alan")!.actor;
  const strikerHand = new THREE.Vector3();
  const camera=new THREE.PerspectiveCamera(39,16/9,.06,55);
  const seek=(seconds:number)=>{
    const t=Math.min(roundClock.duration,Math.max(0,seconds));
    const active=t<roundClock.duration;
    scene.background=active?arenaBackground:black;
    scene.visible=active;
    if(!active)return;
    const frame=performanceAt(t);
    gestures(frame.people,t);
    travel(frame.people,t);
    for(const {role,actor} of cast)actor.apply(frame.people[role],t);
    arena.apply(t);
    props(t, t >= 168.01 && t <= 170.66 ? timekeeper.handPoint(1,strikerHand) : undefined);
    camera.position.fromArray(frame.camera.eye);
    camera.lookAt(...frame.camera.look);
    if(camera.fov!==frame.camera.lens){camera.fov=frame.camera.lens;camera.updateProjectionMatrix();}
    camera.updateMatrixWorld();scene.updateMatrixWorld(true);
  };
  seek(0);
  return {scene,camera,seek,dispose(){for(const {actor} of cast)actor.dispose();arena.dispose();art.dispose();scene.clear();}};
}
