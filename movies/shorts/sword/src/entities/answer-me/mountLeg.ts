import { HorseGait, type QuadrupedBody } from "@automovie/archetypes/animals";
import type { IAutoMovieVector3 } from "@automovie/interface";
import * as THREE from "three";
import { joint, oval, surface } from "./surfaces";

/** Articulates a single anatomical chain about the archetype's measured standing joints. */
export function mountLeg(parent: THREE.Group, limb: QuadrupedBody.Limb, neutral: readonly IAutoMovieVector3[], coat: number, lower: number, sock: boolean) {
  const rest = neutral.map(p => new THREE.Vector3(p.z, p.y, -p.x));
  const fore = limb.endsWith("Fore");
  const points = rest.map(p => p.clone());
  const lengths = rest.slice(1).map((point,i) => point.distanceTo(rest[i]!));
  const radii = fore ? [0.129, 0.085, 0.042, 0.044, 0.047] : [0.153, 0.102, 0.046, 0.047, 0.048];
  const segments = lengths.map((length,i) => {
    const part = joint(parent, limb + i, 0,0);
    const colour = i < 2 ? coat : sock ? 0xe9dbbc : lower;
    const mesh = surface(part, "tapered limb", new THREE.CylinderGeometry(radii[i]!, radii[i+1]!, length, 9), colour);
    mesh.position.y = -length / 2;
    oval(part,"joint",0,0,0,radii[i]!,radii[i]!,radii[i]!,colour);
    return part;
  });
  const sole = surface(parent,limb + " hoof",new THREE.CylinderGeometry(0.057,0.075,0.087,9),sock ? 0x876d53 : 0x42382f);
  sole.scale.x = 1.28;

  // Sample each stride on its own clock, then dissolve between adjacent footfall patterns.
  function sample(time: number, gait: "walk"|"trot"|"canter", side: THREE.Vector2): void {
    const row = HorseGait.ROWS[gait][0]!;
    const phase = THREE.MathUtils.euclideanModulo(time / row.stride - HorseGait.PHASES[gait][limb],1);
    const stance = row.stance / row.stride;
    const length = gait === "walk" ? 0.56 : gait === "trot" ? 0.78 : 0.99;
    if (phase < stance) {
      side.set(length * (0.5 - phase / stance),0);
    } else {
      const swing = (phase - stance) / (1 - stance);
      side.set(-0.5 * length * Math.cos(Math.PI * swing),
        Math.sin(Math.PI * swing) * (gait === "walk" ? 0.11 : 0.25));
    }
  }
  const walk = new THREE.Vector2(), trot = new THREE.Vector2(), canter = new THREE.Vector2();
  return (time: number, gait: number, bob: number): void => {
    sample(time,"walk",walk);
    sample(time,"trot",trot);
    sample(time,"canter",canter);
    const travel = walk.multiplyScalar(Math.min(1, gait * 3)).lerp(trot,THREE.MathUtils.clamp((gait - 0.32) / 0.34,0,1)).lerp(canter,THREE.MathUtils.clamp((gait - 0.66) / 0.34,0,1));
    const top = points[0]!, bend = points[1]!, knee = points[2]!, ankle = points[3]!, toe = points[4]!;
    toe.copy(rest[4]!);
    toe.x += travel.x;
    toe.y += travel.y;
    const footAngle = Math.atan2(rest[4]!.x - rest[3]!.x, rest[3]!.y - rest[4]!.y) + travel.y * 1.6;
    ankle.set(toe.x - lengths[3]! * Math.sin(footAngle),toe.y + lengths[3]! * Math.cos(footAngle),toe.z);
    const cannonAngle = -(travel.x * 0.57 + travel.y * (fore ? 1.65 : -0.85));
    knee.set(ankle.x - lengths[2]! * Math.sin(cannonAngle),ankle.y + lengths[2]! * Math.cos(cannonAngle),toe.z);
    top.copy(rest[0]!);
    top.y += bob;
    top.x += travel.x * 0.18;
    const dx = knee.x - top.x, dy = knee.y - top.y;
    const distance = Math.max(0.001,Math.hypot(dx,dy));
    const a = lengths[0]!, b = lengths[1]!;
    const along = THREE.MathUtils.clamp((a*a - b*b + distance*distance)/(2*distance),0,a);
    const across = Math.sqrt(Math.max(0,a*a - along*along)) * (fore ? -1 : 1);
    bend.set(top.x + (dx*along - dy*across)/distance, top.y + (dy*along + dx*across)/distance,top.z);
    for (let i=0; i<4; i++) {
      const from = points[i]!, to = points[i+1]!;
      const part = segments[i]!;
      part.position.copy(from);
      part.rotation.z = Math.atan2(to.x-from.x,from.y-to.y);
      part.scale.y = Math.hypot(to.x-from.x,to.y-from.y) / lengths[i]!;
    }
    sole.position.set(toe.x + 0.017, 0.044 + travel.y,toe.z);
  };
}
