import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { block, mesh, oval, rod } from "./yardPrimitives";

function curve(p: THREE.Object3D, c: number, points: number[][], r: number) {
  const path = new THREE.CatmullRomCurve3(
    points.map((a) => new THREE.Vector3(...a)),
  );
  return mesh(
    p,
    new THREE.TubeGeometry(path, points.length * 3, r, 5, false),
    c,
  );
}
function sRand(n: number) {
  const x = Math.sin(n * 67.734 + 3.13) * 9245.26;
  return x - Math.floor(x);
}
function pattern(base: string, stone: boolean) {
  const el = document.createElement("canvas");
  el.width = el.height = 512;
  const ctx = el.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < (stone ? 15000 : 24000); i++) {
    const x = sRand(i + 10) * 512,
      y = sRand(i + 700) * 512;
    ctx.fillStyle =
      i % 3 === 0 ? "rgba(255,231,186,.14)" : "rgba(44,33,25,.10)";
    ctx.fillRect(
      x,
      y,
      1 + sRand(i + 520) * 3,
      0.6 + sRand(i + 300) * (stone ? 2 : 1.5),
    );
  }
  if (stone)
    for (let row = 0; row < 10; row++)
      for (let col = -1; col < 12; col++) {
        const x = col * 55 + (row % 2) * 24 + sRand(row * 20 + col) * 9,
          y = row * 51;
        ctx.strokeStyle = "rgba(70,57,45,.23)";
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(x, y + 3);
        ctx.lineTo(x + 1, y + 46);
        ctx.quadraticCurveTo(x + 15, y + 51, x + 53, y + 50);
        ctx.stroke();
      }
  const t = new THREE.CanvasTexture(el);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(stone ? 3 : 6, stone ? 1 : 6);
  t.anisotropy = 4;
  return new THREE.MeshStandardMaterial({ map: t, roughness: 1 });
}
function batches(set: THREE.Group) {
  set.updateMatrixWorld(true);
  const bins = new Map<THREE.Material, THREE.BufferGeometry[]>();
  set.traverse((o) => {
    if (o instanceof THREE.Mesh && !Array.isArray(o.material)) {
      const g = o.geometry.index
        ? o.geometry.toNonIndexed()
        : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      const bucket = bins.get(o.material) ?? [];
      bucket.push(g);
      bins.set(o.material, bucket);
    }
  });
  set.clear();
  for (const [m, gs] of bins) {
    const g = mergeGeometries(gs, false);
    if (g) set.add(new THREE.Mesh(g, m));
    for (const s of gs) s.dispose();
  }
}
/**
 * Build the courtyard set, score, bench and household in a browser-backed scene.
 * Return the ordered witness heads, starting world positions in metres and
 * initial yaw in radians for the ensemble sampler.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Assemble a deterministic world-metre set from static geometry and painted canvas surfaces. Group the fixed shapes by material and leave witness heads separate for rotation.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The set builds fixed landmarks and records head attachments. The ensemble owner reads the starts and drives the faces.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Bench, circle and doorway positions are authored staging landmarks, and palette and surface noise are visible art controls.
 * @evidence contracts/development/implementation.md#efficient-algorithms Mesh and texture construction is bounded by the fixed yard design and pixel loops. Batching scans the fixed shapes and merges each material group.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse the wall material for repeated bays and palette materials for equal pairs. Each scene has its own groups and witnesses.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The passed scene owns the added graph. Batching releases temporary packed geometries. The owning scene disposes geometry and materials.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states the browser requirement, world units, yaw units, ordered result and scene attachment effect.
 * @evidence contracts/development/composition.md#screenplay-realization The set establishes the morning yard, bench, circle and door and keeps them present from opening to exit.
 * @evidence contracts/development/composition.md#composition-only This set construction creates the landmark positions and movable observer heads. The scene calls it at setup and applies timed beats elsewhere.
 * @evidence contracts/development/composition.md#living-scene The shared fixed view and continuous witness roots preserve spatial relations across changes in camera angle.
 */
export function courtyard(scene: THREE.Scene): { head: THREE.Group; start: THREE.Vector3; yaw: number }[] {
  const fixed = new THREE.Group();
  scene.add(fixed);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    pattern("#9d8461", false),
  );
  ground.rotation.x = -Math.PI / 2;
  fixed.add(ground);
  const wall = pattern("#b6a489", true);
  const bay = (x: number, w: number, z: number, h: number) => {
    const q = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.44), wall);
    q.position.set(x, h / 2, z);
    fixed.add(q);
    block(fixed, 0x584736, x, h + 0.1, z, w + 0.22, 0.2, 0.64);
  };
  bay(-2.4, 10.7, -3.5, 3.15);
  bay(5.9, 2.3, -3.5, 3.15);
  block(fixed, 0x483e31, 3.85, 2.7, -3.43, 2.13, 0.35, 0.6);
  for (const x of [2.97, 4.68]) {
    block(fixed, 0x70583e, x, 1.37, -3.18, 0.19, 2.75, 0.52);
    for (let j = 0; j < 7; j++)
      block(
        fixed,
        j % 2 ? 0x998875 : 0xab9781,
        x - 0.01,
        j * 0.37 + 0.17,
        -3.42,
        0.36,
        0.33,
        0.7,
      );
  }
  block(fixed, 0x393431, 3.82, 1.16, -4.6, 2.5, 2.4, 0.2);
  for (let i = 0; i < 5; i++)
    block(
      fixed,
      i % 2 ? 0x695440 : 0x806449,
      4.61,
      1.2,
      -3.5 - i * 0.14,
      0.1,
      2.4,
      0.14,
    );
  for (let i = 0; i < 7; i++) {
    const x = -8 + i * 1.68;
    block(fixed, 0x66503c, x, 2.47, -3.23, 0.13, 1.25, 0.16);
    rod(fixed, 0x735a40, [x, 2.05, -3.1], [x + 0.7, 2.96, -3.1], 0.065);
  }
  for (const x of [-4.6, -1.9, 0.9]) {
    block(fixed, 0x5b5141, x, 1.88, -3.25, 0.77, 0.8, 0.08);
    for (const d of [-0.28, 0, 0.28])
      block(fixed, 0x8e7453, x + d, 1.88, -3.18, 0.046, 0.76, 0.06);
    block(fixed, 0x8d785f, x, 1.46, -3.11, 0.91, 0.08, 0.24);
  }
  for (let i = 0; i < 3; i++) {
    const x = -4 + i * 0.42;
    block(
      fixed,
      i % 2 ? 0xaa6748 : 0xc0a473,
      x,
      2.51,
      -2.96,
      0.36,
      0.71,
      0.035,
    );
    block(fixed, 0x7a5940, x, 2.87, -2.95, 0.4, 0.05, 0.07);
  }
  for (let i = 0; i < 11; i++) {
    const x = -15 + i * 3.1;
    const o = mesh(
      fixed,
      new THREE.ConeGeometry(4.6, 4.6 + sRand(i) * 2.5, 6),
      i % 2 ? 0x9eac9f : 0xafb7a3,
      x,
      2.3,
      -12 - sRand(i) * 3,
    );
    o.scale.z = 0.55;
  }
  const points: number[][] = [];
  for (let i = 0; i <= 92; i++) {
    const a = (i * 2 * Math.PI) / 92,
      r = 1.22 + 0.009 * Math.sin(a * 11);
    points.push([0.18 + r * Math.cos(a), 0.004, -0.18 + r * Math.sin(a)]);
  }
  const score = curve(fixed, 0x514237, points, 0.022);
  score.scale.y = 0.33;
  for (let i = 0; i < 88; i++) {
    const x = sRand(i + 24) * 13 - 6.5,
      z = sRand(i + 229) * 8 - 3.6;
    if (Math.hypot(x - 0.18, z + 0.18) < 1.65) continue;
    const m = oval(
      fixed,
      i % 2 ? 0x887254 : 0xa9926e,
      x,
      0.016,
      z,
      0.023 + sRand(i) * 0.047,
      0.008,
      0.014 + sRand(i + 400) * 0.028,
    );
    m.rotation.y = i;
  }
  for (let i = 0; i < 3; i++)
    block(
      fixed,
      i % 2 ? 0x8c6948 : 0x9b7651,
      -1.96,
      0.53,
      0.43 + i * 0.14,
      2.18,
      0.09,
      0.135,
    );
  for (const x of [-2.85, -1.09])
    for (const z of [0.46, 0.71])
      block(fixed, 0x634d39, x, 0.25, z, 0.13, 0.5, 0.11);
  block(fixed, 0x74563d, -1.95, 0.22, 0.56, 1.88, 0.1, 0.13);
  const people = [
    [-3.3, -0.6],
    [-2.46, -1.87],
    [-1.48, -2.04],
    [0.41, -2.16],
    [2.17, -1.92],
    [4.83, -1.82],
    [4.95, -0.7],
  ];
  const clothes = [0x75554a, 0x5d6756, 0x918068, 0x795347, 0x866b48, 0x647475];
  const witnesses: { head: THREE.Group; start: THREE.Vector3; yaw: number }[] = [];
  people.forEach(([x, z], i) => {
    const n = new THREE.Group();
    fixed.add(n);
    n.position.set(x!, 0, z!);
    n.scale.set(0.89 + sRand(i + 13) * 0.20, 0.88 + sRand(i + 37) * 0.22, 1);
    n.rotation.y = Math.atan2(-x! * 0.6, 1.7 - z!) + (sRand(i + 23) - .5) * .43;
    const c = clothes[i % clothes.length]!;
    for (const s of [-1, 1]) {
      mesh(
        n,
        new THREE.CylinderGeometry(0.064, 0.049, 0.7, 8),
        0x504a41,
        s * 0.082,
        0.4,
        0,
      );
      oval(n, 0x47392f, s * 0.085, 0.066, 0.048, 0.067, 0.06, 0.12);
      const folded = i % 3 === 1 && s === 1;
      const wrist = folded ? [s * .03, 1.08, .16] : [s * .183, .88, .076];
      rod(n, c, [s * 0.162, 1.32, 0], wrist, .062);
      oval(n, 0xba9678, wrist[0]!, wrist[1]! - .011, wrist[2]!, .047, .064, .041);
    }
    const coat = mesh(
      n,
      new THREE.CylinderGeometry(0.155, 0.2, 0.65, 10),
      c,
      0,
      1.02,
      0,
    );
    coat.scale.z = 0.78;
    oval(n, 0x6c5848, 0, 1.39, 0, 0.15, 0.088, 0.116);
    const head = new THREE.Group();
    head.name = `Yard witness ${i + 1}`;
    head.scale.copy(n.scale);
    head.rotation.y = n.rotation.y;
    head.position.copy(n.position).add(new THREE.Vector3(0, 1.52 * n.scale.y, 0));
    scene.add(head);
    oval(head, i % 2 ? 0xbc9778 : 0xac876c, 0, 0, 0.018, 0.109, 0.143, 0.105);
    oval(head, i % 3 ? 0x675541 : 0x9a8972, 0, 0.09, 0, 0.12, 0.08, 0.113);
    oval(head, 0xb28d6e, 0, 0, 0.114, 0.025, 0.034, 0.02);
    witnesses.push({head, start:n.position.clone(), yaw:n.rotation.y});
  });
  batches(fixed);
  return witnesses;
}

/**
 * Construct the split or fine saddle as a local-metre scene group.
 * The split option adds the visible opening used by both finger effects.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Build one padded silhouette with a shaped front surface and using the same assembly for both variants. The split variant cuts the opening and adds its modeled edge.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The mesh factory owns both wardrobe accents for the seat. The scene places the group and assigns carry and finger effects.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Leather palette, padding and tear outline are stylized choices made for the written contrast and confirmed in the accepted picture.
 * @evidence contracts/development/implementation.md#efficient-algorithms Work is bounded by the fixed outline, curve tessellation and predetermined parts.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Both variants share the same geometry recipe and palette cache. Each instance has independent shapes for its own parent and transform.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned group and its meshes belong to the caller until attached to a scene.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states the option, local units, returned group and tear role.
 * @evidence contracts/development/composition.md#screenplay-realization The two distinguishable seats are the wager, its payment and the closing callback.
 * @evidence contracts/development/composition.md#composition-only The constructor makes both visual variants without setting their timeline or holders.
 * @evidence contracts/development/composition.md#living-scene Separate groups preserve their silhouettes and original tear identity as the seats move.
 */
export function saddle(torn: boolean) {
  const g = new THREE.Group();
  g.name = torn ? "Martin's split saddle" : "Carlo's fine saddle";
  const leather = torn ? 0x86583b : 0x4b322a,
    edge = torn ? 0xc59564 : 0x96734e;
  const flap = new THREE.Shape();
  flap.moveTo(-0.29, 0.19);
  flap.quadraticCurveTo(-0.05, 0.14, 0.3, 0.2);
  flap.quadraticCurveTo(0.32, 0.03, 0.24, -0.18);
  flap.quadraticCurveTo(0.12, -0.28, -0.16, -0.23);
  flap.quadraticCurveTo(-0.33, -0.18, -0.29, 0.19);
  if (torn) {
    const h = new THREE.Path();
    h.moveTo(-0.14, 0.0);
    h.lineTo(-0.091, 0.051);
    h.lineTo(-0.056, 0.044);
    h.lineTo(-0.039, 0.088);
    h.lineTo(0.057, 0.091);
    h.lineTo(0.077, 0.053);
    h.lineTo(0.148, 0.038);
    h.lineTo(0.065, -0.029);
    h.lineTo(-0.035, -0.057);
    h.closePath();
    flap.holes.push(h);
  }
  const cut = mesh(
    g,
    new THREE.ExtrudeGeometry(flap, {
      depth: 0.022,
      bevelEnabled: true,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      bevelSegments: 1,
      curveSegments: 14,
    }),
    leather,
    0,
    0,
    0.088,
  );
  cut.castShadow = true;
  if (torn)
    curve(
      g,
      edge,
      [
        [-0.138, 0.004, 0.122],
        [-0.052, 0.084, 0.125],
        [0.057, 0.093, 0.122],
        [0.148, 0.04, 0.122],
      ],
      0.009,
    );
  curve(
    g,
    edge,
    [
      [-0.27, 0.16, 0.12],
      [-0.28, -0.12, 0.12],
      [-0.15, -0.205, 0.12],
      [0.12, -0.2, 0.12],
      [0.22, -0.13, 0.12],
    ],
    0.008,
  );
  oval(g, leather, 0, .164, -.10, .342, .074, .236);
  oval(g, torn ? 0x926045 : 0x66473b, -.025, .205, -.112, .242, .037, .174);
  curve(g, torn ? 0x7b4d32 : 0x8b664a,
    [[-.30, .207, .09], [-.23, .239, -.071], [0, .208, -.213], [.24, .241, -.11], [.31, .195, .07]], .016);
  oval(g, leather, -.261, .210, -.107, .071, .109, .215);
  oval(g, leather, .262, .213, -.110, .077, .116, .217);
  if (!torn) {
    curve(
      g,
      edge,
      [
        [-0.29, 0.181, 0.1],
        [-0.2, 0.167, 0.115],
        [0, 0.156, 0.117],
        [0.19, 0.176, 0.116],
        [0.29, 0.19, 0.104],
      ],
      0.011,
    );
    curve(
      g,
      0x735540,
      [
        [-0.2, 0.116, 0.119],
        [-0.16, 0.029, 0.118],
        [-0.07, -0.04, 0.121],
        [0.07, -0.04, 0.121],
        [0.17, 0.047, 0.118],
        [0.2, 0.127, 0.118],
      ],
      0.006,
    );
  }
  for (const s of [-1, 1]) {
    const f = oval(g, edge, s * 0.255, 0.211, -0.078, 0.064, 0.1, 0.171);
    f.rotation.z = -s * 0.22;
    rod(
      g,
      0x5e4432,
      [s * 0.21, -0.09, 0.115],
      [s * 0.205, -0.28, 0.121],
      0.014,
    );
  }
  curve(
    g,
    torn ? 0x625d50 : 0x9b875b,
    [
      [0.18, -0.23, 0.134],
      [0.14, -0.34, 0.15],
      [0.27, -0.34, 0.15],
      [0.238, -0.23, 0.134],
    ],
    0.012,
  );
  return g;
}
/**
 * Construct the deliberately simplified screen prop for the yard's stage action.
 * Return an unattached group in the local scene frame.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Combine visual primitives around the grip origin so the authored placement callback can move the group as one.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The constructor supplies appearance only. The stage-prop capability owns the authored placement and set-down cues.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The muted shape is a visible stylized prop and the fixed appearance is shared by both copies.
 * @evidence contracts/development/implementation.md#efficient-algorithms A fixed number of simple meshes makes one small scene group.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse equal palette materials and the same fixed recipe. Each separately held prop gets its own group.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller owns the unattached result and its subsequent scene lifecycle.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states the local frame, visual purpose and ownership of the group.
 * @evidence contracts/development/composition.md#screenplay-realization The same two screen props remain with their holders and then move to the bench.
 * @evidence contracts/development/composition.md#composition-only The factory owns only the screen shape. The scene and its prop layer own time and placement.
 * @evidence contracts/development/composition.md#living-scene Each group retains identity while its associated actor and later bench hold change.
 */
export function stageSword() {
  const g = new THREE.Group();
  rod(g, 0x737a74, [0, 0, 0], [0, 0.65, 0], 0.018);
  rod(g, 0x634e38, [-0.1, -0.006, 0], [0.1, -0.006, 0], 0.017);
  rod(g, 0x6e4935, [0, -0.14, 0], [0, -0.012, 0], 0.021);
  return g;
}
