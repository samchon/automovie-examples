import * as THREE from "three";
import { ground, smooth } from "./road";

type Step = readonly [number, number, number, number, number?];
type Route = readonly Step[];
/** Authored marks in role order. Each mark gives seconds, east and camera-side metres, facing in radians, and optional knee lowering in metres. */
export const routes = {
  alix:[[0,-3.25,1.02,1.32],[5,-2.05,1.04,1.25],[10,-1.1,1.04,1.39],[13.3,-0.08,1.04,1.38],[14.1,0.02,1.04,1.3,0.17],[15.2,0.3,1.04,1.3],[21,3.05,1.05,1.4],[24,4.65,0.37,2.2],[25.3,4.38,-0.59,-1.4],[27.9,-0.02,-0.57,-1.17],[31,-0.02,-0.46,0.26],[33,-0.02,-0.46,-0.2],[34.5,0.19,-0.49,0.55,0.35],[37.7,0.45,-0.50,0.58,0.52],[39.6,0.44,-0.30,-0.52,0.54],[41.2,0.15,-0.16,-0.75,0.61],[42.7,-0.05,-0.26,-0.75,0.74],[46.4,-0.05,-0.26,-0.75,0.69],[48,-0.03,-0.55,0.24,0.37],[52.5,0.01,-0.63,0.16,0.32],[56.4,0.01,-0.63,0.16,0.32],[57.9,-0.05,-0.55,-1.26],[60,-1.53,-0.55,-1.30]],
  perrin:[[0,-4.28,1.18,1.34],[3.5,-3.18,1.16,1.29],[5.4,-2.39,1.12,1.22],[8,-2.20,1.19,1.28],[10,-1.95,1.17,1.34],[12.7,-1.59,1.18,1.33],[13.4,-1.99,1.25,-0.64,0.14],[14.7,-1.85,1.20,0.1,0.03],[16.3,-1.34,1.17,1.31],[20.8,2.05,1.09,1.38],[22.4,3.63,0.93,1.45],[24.5,4.32,0.48,2.5],[25.6,4.0,-0.4,-1.45],[27.6,0.6,-0.69,-1.3],[28.2,0.52,-0.67,-1.2],[31.8,0.52,-0.67,-1.2],[33.4,-0.62,-0.65,0.38,0.15],[38.6,-0.62,-0.63,0.7,0.16],[40.5,-0.55,-0.56,0.8,0.17],[42.7,-0.49,-0.38,0.82,0.70],[45.6,-0.49,-0.38,0.82,0.68],[48.2,-0.78,-0.55,0.05,0.33],[54,-0.78,-0.55,0.05,0.32],[56.5,-0.89,-0.58,0.0,0.27],[57.9,-1.1,-0.64,-1.27],[60,-2.57,-0.64,-1.3]],
  caller:[[0,-5.55,1.1,1.3],[9.7,-3.21,1.22,1.28],[12.5,-2.31,1.22,1.34],[14.7,-2.77,1.32,1.46],[21,-2.14,1.25,0.6],[26.7,-1.96,1.18,0.5],[28,-1.76,1.1,0.7],[29.3,-1.05,0.88,-2.35],[32,-1.05,0.88,-2.4],[44.32,-1.05,0.88,-2.23],[45.51,-1.02,0.83,1.9,0.47],[46.4,-1.0,0.83,1.9,0.42],[47.72,-1.0,0.87,-1.4],[49.8,-4.15,1.13,-1.42],[60,-8.50,1.24,-1.4]],
  red:[[0,-6.28,1.67,1.4],[10,-3.84,1.70,1.35],[14.8,-2.83,1.68,1.33],[16.5,-2.2,1.62,1.35],[19.4,-2.77,1.56,-1.12],[21,-2.70,1.39,1.34],[27,-0.17,0.82,-2.6],[30,-0.17,0.79,-2.65],[35,-0.17,0.79,-2.65],[37.8,-0.17,0.79,-2.65,0.42],[40.7,-0.17,0.79,-2.65,0.42],[42.1,-0.17,0.79,-2.65,0.67],[45.7,-0.17,0.79,-2.6,0.64],[47.72,-0.17,0.79,-1.35],[49.8,-3.32,1.22,-1.42],[60,-7.70,1.30,-1.40]],
  youngest:[[0,-6.99,1.07,1.26],[8.4,-4.97,1.09,1.37],[10,-4.56,1.05,1.05],[13.6,-3.82,1.32,1.25],[16.7,-3.31,1.49,1.40],[19.4,0.72,1.50,1.41],[21,3.42,1.49,1.40],[22.45,4.00,1.49,1.45],[24.4,4.02,1.49,1.42],[31,2.93,1.58,-1.3],[42,2.18,1.55,-1.3],[47.7,0.91,1.7,-1.32],[49.8,-2.24,1.63,-1.33],[60,-6.66,1.69,-1.32]],
  speaker:[[0,-1.85,-1.33,0.32],[31,-1.85,-1.33,0.32],[43,-1.68,-1.23,0.41,0.52],[47,-1.36,-1.14,0.34,0.56],[56.4,-1.36,-1.14,0.34,0.53],[58,-1.12,-1.35,-1.25],[60,-2.61,-1.35,-1.3]],
  companion:[[0,0.41,-1.57,-0.18],[31,0.41,-1.57,-0.18],[43,0.49,-1.34,-0.25,0.52],[47,0.48,-1.19,-0.29,0.57],[56.4,0.48,-1.19,-0.29,0.55],[58,0.03,-1.31,-1.25],[60,-1.47,-1.31,-1.3]]
} as const satisfies Record<string,Route>;

/**
 * Identify a performer with an authored route in this film.
 * The route table defines the set and supplies the positions and film-clock marks separately.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The alias identifies the actual performers that have authored blocking. The route table owns their marks and units.
 * @evidence contracts/development/design.md#principled-representation The keys form a closed union of seven performer identifiers. The alias excludes an arbitrary string in typed callers. The route table owns coordinates, time in seconds, and ordering, and no runtime identifier validation runs here.
 * @evidence contracts/development/design.md#minimal-and-owned-surface The blocking module owns the keys. Scene posing and the native performance adapter use the same identifiers to index their role-specific data.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts These role keys describe this screenplay's cast. Native performer strings and meshes have separate owners, and the route keys do not duplicate their representations.
 */
export type Role=keyof typeof routes;

/**
 * Sample one performer's route at a time in authored film seconds.
 * Return a world position in metres, facing in radians, knee lowering in metres
 * and a normalized stride intensity. Positions follow the sampled road height.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment gives the film timebase, world position, facing, knee lowering, and stride units.
 * @evidence contracts/development/implementation.md#principled-implementation Interpolate the surrounding authored marks with consistent easing, take the short angular turn, and sample the height field at the interpolated route coordinates. The director's timing windows preserve the separation of staged actors.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Route data sets the underlying travel. Local offsets express the reach, retreat, slip, and final grouping, while frameCamera owns shot selection.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The route marks and role-specific offsets are theatrical staging fitted to the reviewed film. Stride intensity follows nominal route speed and does not model foot traction or momentum during those offsets.
 * @evidence contracts/development/implementation.md#efficient-algorithms The scan is linear in the number of route marks for one role and uses constant auxiliary storage. Track sizes are fixed for the short, and the camera can query out of order.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work All calls share the authored route marks and ground rule. The returned vector is new, so callers can transform it without mutating subsequent samples.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The sampler retains only the module's authored marks. It opens no resources and each position belongs to its caller.
 * @evidence contracts/development/composition.md#screenplay-realization Supplies the film's route and support marks for the lower approach, split-rock pause, ascent, rescue and departing quartets.
 * @evidence contracts/development/composition.md#composition-only The authored role tracks and absolute windows live here as scene-local staging data. They are combined with the shared height field and handed to the scene pose evaluation.
 * @evidence contracts/development/composition.md#living-scene Each cast member keeps a route and a facing through the handoffs, the hold at the stump, the pursuit and the last climb. Secondary motion adjusts their placements during the corresponding moves.
 */
export function blocking(role:Role,t:number) {
  const keys:Route=routes[role];
  const downhill=role==="caller" || role==="red" || role==="youngest";
  const time=downhill && t>47.7
    ? THREE.MathUtils.lerp(47.7,60,Math.max(0,(t-49.65)/(60-49.65)))
    : t;
  let index=1;
  while(index<keys.length-1 && time>keys[index]![0])index++;
  const a=keys[index-1]!,b=keys[index]!,dt=b[0]-a[0],u=smooth(a[0],b[0],time);
  let x=THREE.MathUtils.lerp(a[1],b[1],u),z=THREE.MathUtils.lerp(a[2],b[2],u);
  const turn=Math.atan2(Math.sin(b[3]-a[3]),Math.cos(b[3]-a[3]));
  let yaw=a[3]+turn*u;
  const bank=smooth(25.8,28.0,t)*(1-smooth(46.6,48.0,t));
  if(role==="red"){
    const reach=smooth(29.55,30.88,t)*(1-smooth(31.9,33.25,t));
    x+=0.49*bank-0.83*reach;
    z-=0.29*reach;
    yaw=THREE.MathUtils.lerp(yaw,-1.23,bank);
    yaw=THREE.MathUtils.lerp(yaw,-2.77,reach);
  }
  if(role==="caller"){
    const helping=smooth(44.4,45.45,t)*(1-smooth(46.4,48.0,t));
    x+=bank*(-0.16+0.54*helping);
    yaw=THREE.MathUtils.lerp(yaw,1.31,bank);
    z-=0.20*smooth(10.0,12.9,t)*(1-smooth(13.5,15.8,t));
  }
  if(role==="red") z+=0.23*smooth(10.5,16.65,t)*(1-smooth(17.18,19.4,t));
  if(role==="youngest")z+=0.42*smooth(21.4,22.6,t)*(1-smooth(24.2,25.3,t));
  if(role==="alix") {
    x+=0.36*smooth(33.6,35.1,t)*(1-smooth(39,41.7,t));
    x-=0.15*smooth(52.15,53.50,t)*(1-smooth(55.70,56.45,t));
    const slip=smooth(39.1,40.68,t)*(1-smooth(41.18,42.57,t));
    z+=0.27*slip-0.26*smooth(41.42,42.7,t)*(1-smooth(46.35,48,t));
    x-=0.075*smooth(41.55,42.72,t)*(1-smooth(46.26,48,t));
    x-=0.24*smooth(53.9,54.80,t)*(1-smooth(55.10,55.62,t));
  }
  if(role==="perrin") {
    x+=0.11*smooth(40.68,41.55,t)*(1-smooth(43.7,48,t));
    x+=0.55*smooth(49.10,49.66,t)*(1-smooth(50.45,51.07,t));
  }
  if(role==="speaker") z+=0.36*smooth(43.5,47.2,t)*(1-smooth(56.41,57.84,t));
  if(role==="speaker" || role==="companion")
    z-=0.32*smooth(27.3,28.5,t)*(1-smooth(43.15,45.6,t));
  const ending=smooth(56.5,58,t);
  if(role==="speaker")x+=0.55*ending;
  if(role==="companion")x+=0.70*ending;
  if(role==="perrin")x-=0.42*ending;
  const speed=(6*u*(1-u))*Math.hypot(b[1]-a[1],b[2]-a[2])/dt;
  return {position:new THREE.Vector3(x,ground(x,z),z),yaw,crouch:THREE.MathUtils.lerp(a[4]??0,b[4]??0,u),stride:Math.min(1,speed*1.5)};
}

/** Shot start times in film seconds, in editorial order. */
export const cuts = [0,10,21,22.6,24.5,28,31,32,34.2,37.8,38,44.5,48,50.5,52.5,56.5] as const;
/**
 * Set the supplied perspective camera for the shot at the given film second.
 * Targets and relative offsets use metres in stage world coordinates. Field of view
 * is in degrees. Projection and world matrices are updated for the next draw.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment defines the caller-owned camera, film time, stage coordinates and projection updates.
 * @evidence contracts/development/implementation.md#principled-implementation The first matching range selects one of the authored shots. Authored world targets follow performers only in the specified tracking shots, and camera orientation follows Three.js lookAt.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Shot selection and matrix updates belong here. Blocking supplies performer positions instead of duplicating route interpolation.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The cut times, offsets and lens values come from the director's framing of this scene. They are artistic settings for the inspected geography, with no claim of physical camera calibration.
 * @evidence contracts/development/implementation.md#efficient-algorithms There are three bounded route samples, a fixed number of time comparisons, and constant-size vectors per call. World and projection updates apply to one camera.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Actor paths share the blocking calculation with scene posing. Camera transforms are recomputed for the supplied time so direct seeks have no dependence on earlier frames.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller retains the mutated camera. Temporary vectors and snapshots are local to the call and no new renderer resources are acquired.
 * @evidence contracts/development/composition.md#screenplay-realization Frames both roads and their cap and stump, inserts the shoe and the reach, keeps the upper rescue together, then shows the lower lift, bread count and departing four.
 * @evidence contracts/development/composition.md#composition-only The shot bands and lens settings are authored here. Three.js evaluates the camera transforms and the blocking sampler provides the few tracking targets.
 * @evidence contracts/development/composition.md#living-scene The opening and cross-bank holds preserve two levels of action. The upper hold gives the slip and retreat one continuous view, and the final camera follows the uphill group.
 */
export function frameCamera(camera:THREE.PerspectiveCamera,t:number):void {
  const a=blocking("alix",t).position,p=blocking("perrin",t).position,y=blocking("youngest",t).position;
  const target=new THREE.Vector3(), offset=new THREE.Vector3();
  let fov=35;
  function shot(x:number,h:number,z:number,dx:number,dy:number,dz:number,angle:number):void {
    target.set(x,h,z);offset.set(dx,dy,dz);fov=angle;
  }
  if(t<10) shot(-2.55+0.57*smooth(1,9,t),1.80,0,0.21,1.48,9.7,36);
  else if(t<21){const follow=smooth(16.2,20.8,t);shot(-2.06+2.28*follow,1.17,1.16,0.35,0.98,6.34,35);}
  else if(t<22.6)shot(3.49,1.45,1.04,0.62,0.61,4.40,35);
  else if(t<24.5)shot(y.x+0.08,ground(y.x,y.z)+0.24,y.z+0.06,0.36,0.52,1.77,32);
  else if(t<28)shot(p.x-0.08,p.y+1.15,p.z,0.57,0.64,4.52,34);
  else if(t<31)shot(-0.90,1.55,0,0.82,0.96,6.85,35);
  else if(t<32)shot(-0.12,1.76,0.45,0.43,1.88,1.54,43);
  else if(t<34.2)shot(-0.37,2.48,-0.43,0.89,0.91,3.44,36);
  else if(t<37.8)shot(0.19,1.97,-0.55,0.44,2.83,2.18,33);
  else if(t<38)shot(-0.36,1.33,0.04,0.92,0.97,6.94,36);
  else if(t<44.5)shot(-0.17,2.32,-0.15,-0.61,0.68,3.54,39);
  else if(t<48)shot(-0.69,0.86,0.86,0.49,0.89,4.61,39);
  else if(t<50.5)shot(-0.37,2.28,-0.46,0.26,1.41,3.74,36);
  else if(t<52.5)shot(-1.04-0.70*smooth(50.5,52.5,t),1.60,-0.19,0.44,2.15,6.42,39);
  else if(t<56.5)shot(-0.38,2.48,-0.55,-0.20,1.46,2.75,35);
  else shot(a.x-0.65,2.75,-0.84,0.80,1.15,5.60+0.40*smooth(57,60,t),35);
  camera.position.copy(target).add(offset);camera.lookAt(target);camera.fov=fov;camera.updateProjectionMatrix();camera.updateMatrixWorld();
}
