import * as THREE from "three";

import type { IFilmProduction } from "../../../IFilmProduction";
import { castActor, type CastActor } from "../../shared/castActor";
import { courtyard, oval, rod, saddle } from "./yard";
import { yardCamera } from "./yardCamera";
import { yardCurve } from "./yardCurve";
import { yardNative } from "./yardNative";
import { yardPerformance } from "./yardPerformance";
import { yardWitnesses } from "./yardWitnesses";
import {
  actorTarget as local,
  mouth,
  saddleFingers,
  stageSwordProps,
} from "./yardProps";

const { ramp } = yardCurve;

function contact(s: THREE.Scene) {
  const el = document.createElement("canvas");
  el.width = 128;
  el.height = 128;
  const ctx = el.getContext("2d")!,
    grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 63);
  grad.addColorStop(0, "rgba(30,21,13,.61)");
  grad.addColorStop(0.43, "rgba(40,28,18,.27)");
  grad.addColorStop(1, "rgba(40,28,18,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(el);
  const o = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  o.rotation.x = -Math.PI / 2;
  s.add(o);
  return o;
}
function armour(actor: CastActor, bright: boolean) {
  const c = bright ? 0xaebbb8 : 0x78847f,
    w = bright ? 0.235 : 0.211,
    h = bright ? 1.33 : 1.35;
  oval(actor.torso, c, 0, h, 0.03, w, 0.24, 0.149, 0.32);
  oval(
    actor.torso,
    bright ? 0x70827f : 0x535f5d,
    0,
    h - 0.1,
    0.065,
    w * 0.92,
    0.107,
    0.128,
    0.26,
  );
  for (const s of [-1, 1])
    oval(
      actor.torso,
      c,
      s * (w - 0.026),
      h + 0.078,
      0.018,
      0.094,
      0.083,
      0.107,
      0.31,
    );
  oval(
    actor.torso,
    bright ? 0x9eaaa5 : 0x828d85,
    0,
    h + 0.196,
    0.025,
    0.14,
    0.06,
    0.119,
    0.28,
  );
}
/** Realize the screenplay’s bench wager, boundary decision and saddle exchange. */
export function householdYard(): IFilmProduction {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd1d8ca);
  scene.fog = new THREE.FogExp2(0xd4c6a8, 0.036);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.035, 46);
  scene.add(new THREE.HemisphereLight(0xe9f2ff, 0x8d7860, 2.02));
  const sun = new THREE.DirectionalLight(0xffe8c7, 2.17);
  sun.position.set(-4.8, 6.7, 4.8);
  scene.add(sun);
  const sky = new THREE.DirectionalLight(0xc3d5dc, 0.84);
  sky.position.set(3.5, 3, -2.4);
  scene.add(sky);
  const lookFromTheYard = yardWitnesses(courtyard(scene));
  const martin = castActor({
    name: "Martin",
    height: 1.8,
    skin: 0xba8c6c,
    hair: 0x33281f,
    tunic: 0x435e44,
    legs: 0x515246,
    boots: 0x513e32,
  });
  const carlo = castActor({
    name: "Carlo",
    height: 1.76,
    skin: 0xb98b71,
    hair: 0x625e57,
    beard: 0x6c6860,
    tunic: 0x733b36,
    legs: 0x655448,
    boots: 0x48372d,
    helmet: true,
  });
  const boy = castActor({
    name: "Stable lad",
    height: 1.44,
    skin: 0xc39575,
    hair: 0x684732,
    tunic: 0xb19c75,
    legs: 0x85543d,
    boots: 0x5c4431,
  });
  for (const a of [martin, carlo, boy]) scene.add(a.root);
  armour(martin, false);
  armour(carlo, true);
  carlo.root.scale.x = 1.065;
  const patch = oval(martin.root, 0x9d7c51, 0, 0, 0, 0.054, 0.078, 0.045);
  const cuff = oval(boy.leftHand, 0xc6b38a, 0, 0.048, 0, 0.047, 0.039, 0.044);
  rod(cuff, 0x514336, [0.17, -0.9, 0.83], [0.34, 0.82, 0.86], 0.086);
  const split = saddle(true),
    fine = saddle(false);
  scene.add(split, fine);
  const drawFingers = saddleFingers(split);
  const openPalm = new THREE.Group();
  openPalm.name = "Martin's offered palm";
  martin.leftHand.add(openPalm);
  oval(openPalm, 0xb58b71, 0, .016, .025, .040, .041, .016);
  for (let index = 0; index < 4; ++index)
    oval(openPalm, 0xc09577, -.026 + index * .016, .067, .026, .010, .033 - Math.abs(1.4 - index) * .006, .013);
  openPalm.rotation.z = -.55;
  const performNative = yardNative();
  const drawMartin = mouth(martin, 1.8),
    drawCarlo = mouth(carlo, 1.76, true),
    drawBoy = mouth(boy, 1.44);
  const moveSwords = stageSwordProps(scene);
  const shadows = [contact(scene), contact(scene), contact(scene)];
  shadows.forEach((x) => x.scale.set(0.82, 1.2, 1));
  const crossingFoot = new THREE.Vector3(1.69, 0.074, 0.094);
  const insideFoot = new THREE.Vector3(1.203, 0.074, -0.264);
  const footprint = oval(
    scene,
    0x584737,
    crossingFoot.x - 0.028,
    0.004,
    crossingFoot.z + 0.041,
    0.083,
    0.004,
    0.145,
  );
  const scuff = oval(scene, 0x786346, 0.4, 0.005, .877, 0.055, 0.004, 0.119);
  footprint.rotation.y = -0.65;
  scuff.rotation.y = 0.9;
  const splitRest = new THREE.Vector3(-1.49, 0.817, 0.575),
    fineRest = new THREE.Vector3(-2.22, 0.817, 0.571);
  const voiced = (
    t: number,
    start: number,
    end: number,
    rate: number,
  ): number =>
    ramp(t, start, start + 0.07) *
    (1 - ramp(t, end - 0.1, end)) *
    (0.2 + 0.8 * Math.abs(Math.sin((t - start) * rate)));

  /** Seek independent stage marks, gaze, carried loads and set support on the film clock. */
  function seek(t: number) {
    const { ms, cs, bs, mc } = yardPerformance(t, martin, carlo, boy);
    performNative(t, martin, carlo, boy, ms, cs, bs);
    lookFromTheYard(t);
    const m = martin.root.position,
      c = carlo.root.position;
    const tornShoulder = new THREE.Vector3(c.x + 0.225, c.y + 1.33, c.z + 0.25);
    const lift = ramp(t, 46.55, 47.42);
    split.position.copy(splitRest).lerp(tornShoulder, lift);
    const rock =
      t >= 16.9 && t < 18.4
        ? Math.sin((t - 16.9) * 14) * Math.exp(-(t - 16.9) * 3.1) * 0.19
        : 0;
    split.rotation.set(rock, 0.045 + lift * 0.025, 0.035 + lift * 0.12);
    split.position.y +=
      0.027 *
      lift *
      Math.abs(Math.sin(t * 7.8)) *
      ramp(t, 47.55, 48.1) *
      (1 - ramp(t, 50.4, 51.45));
    drawFingers(t);
    openPalm.visible = t >= 43.91 && t < 44.54;
    const fineRaised = new THREE.Vector3(c.x + 0.055, 1.107, c.z + 0.39);
    fineRaised.x -= .15 * ramp(t, 43.33, 43.84) * (1 - ramp(t, 44.37, 45.21));
    const sit = ramp(t, 57.89, 58.92);
    const fineHeld = new THREE.Vector3(
      m.x - 0.037,
      1.065 - 0.247 * sit,
      m.z + 0.37 + 0.035 * sit,
    );
    fine.position
      .copy(fineRest)
      .lerp(fineRaised, ramp(t, 43.33, 43.86))
      .lerp(fineHeld, ramp(t, 44.40, 45.21));
    fine.rotation.set(
      -0.04 - 0.38 * sit,
      0.06 - 0.16 * ramp(t, 44.40, 45.21),
      0,
    );
    const animateSwords = moveSwords(t, martin, carlo, ms, cs);
    const hole = split.position
      .clone()
      .add(new THREE.Vector3(-0.045, 0.02, 0.099));
    if (t < 14.18)
      bs.leftArm = local(
        boy,
        hole.clone().add(new THREE.Vector3(-0.032, -0.029, -0.106)),
      );
    if (t >= 6.6 && t < 12.3)
      cs.leftArm = local(
        carlo,
        split.position.clone().add(new THREE.Vector3(0.235, 0.166, 0.055)),
      );
    if (t >= 26.8 && t < 31.15)
      cs.leftArm = local(
        carlo,
        new THREE.Vector3(m.x + 0.18, 1.24 - mc * 0.66, m.z - 0.052),
      );
    if (t >= 22.36 && t <= 24.26) {
      const skate = ramp(t, 22.36, 23.23) * (1 - ramp(t, 23.47, 24.26));
      const nearHeel = new THREE.Vector3(.40, .074, .86);
      const planted = new THREE.Vector3(m.x + 0.1, 0.075, m.z + 0.16).lerp(
        nearHeel,
        skate,
      );
      ms.leftLeg = local(martin, planted);
    }
    if (t > 29.3 && t < 39.6 && ms.nativeLegs === undefined) {
      ms.leftLeg = [0.18, 0.075, 0.27];
      ms.rightLeg = [-0.11, 0.074, -0.26];
    }
    if (t >= 30.9 && t < 39.8) {
      const outward = ramp(t, 31.82, 32.5);
      const foot = new THREE.Vector3(
        1.27,
        0.074 + 0.14 * Math.sin(outward * Math.PI),
        0.043,
      ).lerp(crossingFoot, outward);
      foot.y = 0.074 + 0.14 * Math.sin(outward * Math.PI);
      const revealPrint = ramp(t, 34.64, 35.28) * (1 - ramp(t, 38.83, 39.73));
      foot.x += .166 * revealPrint;
      foot.z -= .105 * revealPrint;
      cs.leftLeg = local(carlo, foot);
      cs.rightLeg = local(carlo, insideFoot);
    }
    if (t >= 41.69 && t < 43.80) ms.leftArm = [0.22, 0.825, 0.2];
    if (t >= 43.80) {
      const offer = new THREE.Vector3(-1.26, 1.25, .77);
      const waiting = new THREE.Vector3(.22, .825, .2).multiply(martin.root.scale)
        .applyAxisAngle(martin.root.up, martin.root.rotation.y).add(m);
      const nearSide = fine.position.clone().add(new THREE.Vector3(.245, -.089, .045));
      ms.leftArm = local(martin, waiting.lerp(offer, ramp(t, 43.80, 44.03))
        .lerp(nearSide, ramp(t, 44.37, 44.66)));
    }
    if (t >= 44.52) {
      const otherSide = fine.position.clone().add(new THREE.Vector3(-.235, -.08, .05));
      const waiting = new THREE.Vector3(-.22, .87, .21).multiply(martin.root.scale)
        .applyAxisAngle(martin.root.up, martin.root.rotation.y).add(m);
      ms.rightArm = local(martin, waiting.lerp(otherSide, ramp(t, 44.52, 44.85)));
    }
    if (t >= 43.13 && t < 45.2) {
      cs.rightArm = local(
        carlo,
        fine.position.clone().add(new THREE.Vector3(-0.223, 0.024, -0.05)),
      );
      cs.leftArm = local(
        carlo,
        fine.position.clone().add(new THREE.Vector3(0.218, 0.028, -0.043)),
      );
    }
    if (t >= 46.42 && t < 47.23)
      bs.leftArm = local(
        boy,
        splitRest.clone().add(new THREE.Vector3(-0.2, 0.1, -0.025)),
      );
    if (t >= 46.57)
      cs.leftArm = local(
        carlo,
        t < 55.1
          ? split.position.clone().add(new THREE.Vector3(0.18, 0.12, 0.004))
          : hole.clone().add(new THREE.Vector3(0, -0.005, -0.017)),
      );
    if (t >= 17.05 && t < 34.15) {
      bs.leftLeg = [0.11, 0.066, 0.26];
      bs.rightLeg = [-0.105, 0.066, 0.27];
    }
    if (t >= 58.2 && ms.nativeLegs === undefined) {
      ms.leftLeg = [0.125, 0.074, 0.34];
      ms.rightLeg = [-0.14, 0.075, 0.31];
    }
    const laugh = voiced(t, 57.35, 59.94, 19);
    ms.crouch = (ms.crouch ?? 0) + laugh * 0.031;
    ms.headPitch = (ms.headPitch ?? 0) + laugh * 0.17;
    martin.pose(ms);
    carlo.pose(cs);
    boy.pose(bs);
    animateSwords();
    drawMartin(
      Math.max(voiced(t, 3.08, 5.59, 19), voiced(t, 12.1, 13.2, 22), laugh),
      laugh * 0.78,
    );
    drawCarlo(
      Math.max(
        voiced(t, 7.1, 10.63, 21),
        voiced(t, 37.1, 39.63, 20),
        voiced(t, 51.26, 54.49, 18),
      ),
      ramp(t, 23.3, 23.68) * (1 - ramp(t, 24.12, 24.55)) * 0.87,
    );
    drawBoy(voiced(t, 36.71, 37.12, 19) * 0.54);
    patch.position
      .copy(martin.leftHand.position)
      .lerp(new THREE.Vector3(0.19, 1.43 - mc, 0), 0.53);
    [martin, carlo, boy].forEach((a, i) => {
      shadows[i]!.position.set(
        a.root.position.x + 0.09,
        0.008,
        a.root.position.z - 0.09,
      );
    });
    footprint.visible = t >= 32.5;
    scuff.visible = t >= 23.35;
    yardCamera(camera,t);
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
  }
  seek(0);
  return {
    scene,
    camera,
    seek,
    dispose: () => {
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          geometries.add(o.geometry);
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            materials.add(m);
        }
      });
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      scene.clear();
    },
  };
}
