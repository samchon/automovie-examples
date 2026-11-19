import { AutoMovieHumanCanonicalBody } from "@automovie/human";
import type { IAutoMovieHumanParameters } from "@automovie/interface";
import { buildHumanPolygon } from "@automovie/render";
import * as THREE from "three";

/** Anthropometric inputs are millimetres, as required by Human. */
const face: IAutoMovieHumanParameters["head"] = {
  length: 194,
  cephalicIndex: 84,
  circumference: 568,
  height: 224,
  faceHeight: 117,
  faceWidth: 139,
  mandibularWidth: 113,
  minimumFrontalWidth: 107,
  mouthOpening: 49,
  mandibularLaterotrusion: 10,
  face: {
    eyePair: {
      left: { palpebralFissureLength: 29, palpebralFissureHeight: 9 },
      right: { palpebralFissureLength: 29, palpebralFissureHeight: 9 },
    },
    intercanthalWidth: 33,
    nose: { width: 37, height: 50, protrusion: 17 },
    mouth: { width: 50, upperVermilionHeight: 8, lowerVermilionHeight: 9 },
  },
  earPair: {
    left: { length: 62, breadth: 32, protrusion: 20 },
    right: { length: 62, breadth: 32, protrusion: 20 },
  },
};

/** A mesh assembler for rigid bone weights. All vertex positions are at rest in the actor's forward-facing court frame. */
class Kit {
  readonly position: number[] = [];
  readonly colors: number[] = [];
  readonly indices: number[] = [];
  readonly joints: number[] = [];
  readonly weights: number[] = [];

  add(
    geometry: THREE.BufferGeometry,
    matrix: THREE.Matrix4,
    color: number,
    bone: number,
  ): void {
    const start = this.position.length / 3;
    const rgb = new THREE.Color(color);
    const vertex = new THREE.Vector3();
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(matrix);
      this.position.push(vertex.x, vertex.y, vertex.z);
      this.colors.push(rgb.r, rgb.g, rgb.b);
      this.joints.push(bone, 0, 0, 0);
      this.weights.push(1, 0, 0, 0);
    }
    const index = geometry.getIndex();
    const reverse = matrix.determinant() < 0;
    for (let i = 0; i < (index?.count ?? positions.count); i += 3) {
      this.indices.push(
        start + (index?.getX(i) ?? i),
        start + (index?.getX(i + (reverse ? 2 : 1)) ?? i + (reverse ? 2 : 1)),
        start + (index?.getX(i + (reverse ? 1 : 2)) ?? i + (reverse ? 1 : 2)),
      );
    }
  }

  finish(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.position, 3),
    );
    geo.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));
    geo.setAttribute(
      "skinIndex",
      new THREE.Uint16BufferAttribute(this.joints, 4),
    );
    geo.setAttribute(
      "skinWeight",
      new THREE.Float32BufferAttribute(this.weights, 4),
    );
    geo.setIndex(this.indices);
    geo.computeVertexNormals();
    return geo;
  }
}

const circle = new THREE.SphereGeometry(1, 14, 10);
const block = new THREE.BoxGeometry(1, 1, 1);
const cylinder = new THREE.CylinderGeometry(1, 1, 1, 16);
const reflected = new THREE.Matrix4().fromArray([
  ...AutoMovieHumanCanonicalBody.REFLECTION,
]);
const sizes: Record<string, [number, number, number, number]> = {
  w7: [1.68, 61, 0xc68b67, 0x31201e],
  w11: [1.87, 75, 0xe2b395, 0x1b202a],
  w14: [1.84, 70, 0xd4a282, 0x28282e],
  w4: [1.97, 91, 0xa76d4b, 0x231c1a],
  w10: [1.88, 83, 0xd4a07d, 0xc33229],
  b4: [1.76, 67, 0xc59272, 0x292223],
  b5: [1.98, 92, 0xad7d61, 0x22242a],
  b7: [1.83, 72, 0xcf9c79, 0x2f2724],
  b8: [1.85, 83, 0xba8763, 0x222428],
  b9: [1.88, 73, 0xd9aa85, 0x28242b],
  ref: [1.77, 73, 0xb48060, 0x28282a],
  ref2: [1.74, 71, 0xc89979, 0x383637],
};
const digitRows: Record<string, string[]> = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "7": ["111", "001", "010", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
};

/**
 * Dress the installed Human polygon on its own bind joints and batch each athlete's skin, hair, uniform and numerals into one draw.
 * @evidence contracts/development/common.md#meaningful-documentation Accepts the production identifiers w4, w7, w10, w11, w14, b4, b5, b7, b8, b9, ref and ref2. Returns the canonical body and its dressed GPU rig with metre-scale joints and +Z forward. The cast mount owns the mesh and skeleton.
 * @evidence contracts/development/implementation.md#principled-implementation Human prepares the actual skeleton from the roster. Render supplies its body vertices. Rigid skin weights retain each source part's parent and every added detail follows the corresponding joint.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Assembly progresses from bind landmarks to skin, uniform and face, then binds one GPU mesh. Motion remains the caller's responsibility.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Colors and uniform numerals identify screenplay characters. No camera, test, screenshot or placement drives a mesh substitution.
 * @evidence contracts/development/implementation.md#efficient-algorithms A single indexed mesh per cast member submits the body and clothes together. Geometry is baked once before any frame is evaluated.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Shared primitive templates produce the attached shapes and the installed polygon renderer provides the cast member's anatomical form.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The temporary source drawing is retired after copying. The cast owner receives the final mesh geometry, material and skeleton and retires them at unmount.
 * @evidence contracts/development/entities.md#settings-realization docs/body/brief/cast/shohoku-10.md#identity supplies the red-haired forward. docs/body/brief/cast/hamaura-07.md#identity and docs/body/screenplay/two-hands/010-game.md#first-drive identify blue 7 and his pale kneepad. Body sizing and uniform volumes use authored metre-scale coefficients.
 * @evidence contracts/development/entities.md#object-shape Uniform bands, knee pad, shoes, facial marks and hair are rigid accessories registered in metres to the same skeleton as the Human polygon.
 * @evidence contracts/development/entities.md#controls-and-source The articulated body retains the installed Human joint centres and Render parts, with dedicated head, trunk, leg and arm controls for the screenplay motion.
 */
export function playerRig(id: string) {
  const [height, mass, skin, hair] = sizes[id]!;
  const official = id.startsWith("ref");
  const home = id.startsWith("w");
  const cloth = official ? 0x8a9598 : home ? 0xfff7e6 : 0x193c73;
  const patch = official ? 0x30353a : home ? 0xa92832 : 0xe9eff1;
  const shorts = official ? 0x242a32 : home ? 0xf4eee1 : 0x193a6e;
  const h = height / 1.82;
  const chest = Math.cbrt(mass / 74) * 0.218;
  const body = AutoMovieHumanCanonicalBody.prepare(
    {
      body: {
        anatomy: {
          sex: "male",
          stature: height * 1000,
          chestCircumference: chest * 4390,
        },
      },
      head: face,
    },
    { id, mass },
  );
  const drawing = buildHumanPolygon(AutoMovieHumanCanonicalBody.display(body));
  const root = new THREE.Group();
  root.name = id;
  const bones = new Map<string, THREE.Bone>();
  const rest = new Map<string, THREE.Vector3>();
  const boneSlots = new Map<string, number>();

  const armature: THREE.Bone[] = [];
  const kit = new Kit();
  for (const joint of body.joints) {
    const [x, y, z] = joint.position;
    const location = new THREE.Vector3(x, y, z);
    rest.set(joint.bone, location);
    const parent = joint.parent && bones.get(joint.parent);
    const bone = new THREE.Bone();
    bone.name = joint.bone;
    bone.position.copy(location);
    if (parent && joint.parent) bone.position.sub(rest.get(joint.parent)!);
    (parent || root).add(bone);
    bones.set(joint.bone, bone);
    boneSlots.set(joint.bone, armature.length);
    armature.push(bone);
  }
  const slot = (name: string) => boneSlots.get(name)!;
  for (const [name, part] of drawing.parts) {
    // Each closed shoe replaces the covered ankle, foot and toe polygon surfaces of the dressed figure.
    if (/Foot|Midfoot|Subtalar|Hallux|Toe/.test(name)) continue;
    const center = rest.get(name)!;
    const matrix = reflected.clone().setPosition(center);
    const color = /hips|spine|chest|shoulder|scapula/i.test(name)
      ? cloth
      : official && /Leg|Foot|Toe|Hallux|Midfoot|Subtalar/.test(name)
        ? shorts
        : skin;
    kit.add(part.geometry, matrix, color, slot(name));
  }
  const headBox = drawing.head;
  const head = rest.get("head")!;
  const crown = head.y + headBox.max[1];
  const hairDepth = (headBox.max[0] - headBox.min[0]) * 0.55;
  const hairWidth = (headBox.max[2] - headBox.min[2]) * 0.55;
  const headDepth = head.z + (headBox.min[0] + headBox.max[0]) * 0.5;

  drawing.dispose();
  const add = (
    name: string,
    g: THREE.BufferGeometry,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color: number,
    rz = 0,
  ) => {
    const matrix = new THREE.Matrix4()
      .makeRotationZ(rz)
      .scale(new THREE.Vector3(sx, sy, sz))
      .setPosition(x, y, z);
    kit.add(g, matrix, color, slot(name));
  };
  const limb = (
    name: string,
    g: THREE.BufferGeometry,
    dx: number,
    dy: number,
    dz: number,
    sx: number,
    sy: number,
    sz: number,
    color: number,
  ) => {
    const p = rest.get(name)!;
    add(name, g, p.x + dx, p.y + dy, p.z + dz, sx, sy, sz, color);
  };
  const pelvis = rest.get("hips")!,
    neck = rest.get("neck")!,
    chestPos = rest.get("chest")!;
  const waistY = pelvis.y + 0.09 * h,
    top = neck.y - 0.042 * h;
  const trunkHeight = top - waistY;
  // Join the lower hem, waist, chest, shoulders and collar so their widths describe a jersey.
  const rows: [number, number, number][] = [
    [waistY - 0.026 * h, chest * 0.91, 0.139 * h],
    [waistY + 0.055 * h, chest * 0.94, 0.141 * h],
    [waistY + trunkHeight * 0.68, chest, 0.145 * h],
    [top - 0.023 * h, chest * 0.96, 0.127 * h],
    [top + 0.013 * h, chest * 0.68, 0.09 * h],
    [top + 0.019 * h, 0.069 * h, 0.066 * h],
  ];
  const shellPositions: number[] = [],
    shellIndices: number[] = [];
  const sides = 16;
  for (let row = 0; row < rows.length; row++) {
    const [level, rx, rz] = rows[row]!;
    for (let i = 0; i < sides; i++) {
      const angle = (i * Math.PI * 2) / sides,
        f = Math.cos(angle);
      const neckDrop = row >= 4 && !official ? Math.max(0, f) * 0.03 * h : 0;
      shellPositions.push(
        rx * Math.sin(angle),
        level - neckDrop,
        chestPos.z + rz * f,
      );
      if (row > 0) {
        const a = (row - 1) * sides + i,
          b = (row - 1) * sides + ((i + 1) % sides),
          c = a + sides,
          d = b + sides;
        shellIndices.push(a, b, c, b, d, c);
      }
    }
  }
  const jersey = new THREE.BufferGeometry();
  jersey.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(shellPositions, 3),
  );
  jersey.setIndex(shellIndices);
  kit.add(jersey, new THREE.Matrix4(), cloth, slot("chest"));
  jersey.dispose();
  add(
    "hips",
    cylinder,
    0,
    waistY - 0.035 * h,
    pelvis.z,
    chest * 0.91,
    0.14 * h,
    0.139 * h,
    shorts,
  );
  add(
    "hips",
    cylinder,
    0,
    waistY - 0.023 * h,
    pelvis.z,
    chest * 0.925,
    0.022 * h,
    0.142 * h,
    patch,
  );
  if (!official) {
    for (const sign of [-1, 1]) {
      add(
        "chest",
        block,
        sign * chest * 0.71,
        top - 0.065 * h,
        chestPos.z + 0.083 * h,
        0.015 * h,
        0.09 * h,
        0.013 * h,
        patch,
        sign * 0.26,
      );
    }
  }
  for (const side of ["left", "right"]) {
    const sign = side === "left" ? 1 : -1;
    const thigh = rest.get(side + "UpperLeg")!,
      knee = rest.get(side + "LowerLeg")!,
      ankle = rest.get(side + "Foot")!;
    const long = thigh.y - knee.y,
      trouser = official ? long : long * 0.62;
    limb(
      side + "UpperLeg",
      cylinder,
      0,
      -trouser / 2 + 0.012,
      0,
      0.111 * h,
      trouser,
      0.118 * h,
      shorts,
    );
    if (!official) {
      limb(
        side + "UpperLeg",
        cylinder,
        0,
        -trouser + 0.017,
        0,
        0.113 * h,
        0.022,
        0.121 * h,
        patch,
      );
      limb(
        side + "LowerLeg",
        cylinder,
        0,
        -(knee.y - ankle.y) + 0.07 * h,
        0,
        0.054 * h,
        0.154 * h,
        0.061 * h,
        0xf4f2e6,
      );
    }
    if (id === "b7" && side === "left")
      limb(
        side + "LowerLeg",
        circle,
        0,
        -0.03,
        0.018,
        0.079 * h,
        0.115 * h,
        0.087 * h,
        0xf5f2df,
      );
    limb(
      side + "Foot",
      circle,
      0,
      -0.022,
      0.047 * h,
      0.067 * h,
      0.058 * h,
      0.143 * h,
      official ? 0x252c33 : 0xf3f2e9,
    );
    limb(
      side + "Foot",
      circle,
      0,
      -0.05,
      0.053 * h,
      0.068 * h,
      0.027 * h,
      0.147 * h,
      official ? 0x141a20 : patch,
    );
    limb(
      side + "Foot",
      block,
      sign * 0.052 * h,
      -0.014,
      0.047,
      0.02 * h,
      0.014 * h,
      0.093 * h,
      patch,
    );
  }
  // A varsity number is tessellated onto both curved panels, including a dark edge on the away kit.
  const digits = id.slice(1);
  if (!official)
    for (const zSign of [-1, 1]) {
      const col = (digits.length === 2 ? 0.026 : 0.031) * h;
      const y0 = top - trunkHeight * 0.24;
      for (let j = 0; j < digits.length; j++) {
        const glyph = digitRows[digits[j]!]!;
        for (let y = 0; y < 5; y++)
          for (let x = 0; x < 3; x++)
            if (glyph[y]![x] === "1") {
              const xx =
                (j * 4 + x - (digits.length * 4 - 2) * 0.5) * col * zSign;
              const zz =
                (0.148 * h * Math.sqrt(1 - (xx / chest) ** 2) + 0.004 * h) *
                zSign;
              add(
                "chest",
                block,
                xx,
                y0 - y * col * 1.17,
                chestPos.z + zz,
                col * 1.06,
                col * 1.22,
                0.007 * h,
                patch,
              );
            }
      }
    }
  else
    for (let i = -2; i <= 2; i++) {
      for (const side of [-1, 1]) {
        const x = i * chest * 0.31;
        const depth = 0.14 * h * Math.sqrt(1 - (x / chest) ** 2);
        add(
          "chest",
          block,
          x,
          (top + waistY) / 2,
          chestPos.z + side * depth,
          0.022 * h,
          trunkHeight * 0.96,
          0.005 * h,
          patch,
        );
      }
    }
  // Model the forehead, cheeks and jaw as one volume, with features on the same curved surface.
  const profile = id === "w7" ? 1.45 : id === "w11" ? 1.29 : id === "w10" ? 0.69 : 1;
  const hh = 0.058 * h * profile;
  const skullRadius = Math.max(hairWidth * 0.98, 0.081 * h);
  const skullDepth = Math.max(hairDepth * 0.98, 0.092 * h);
  const skullHeight = 0.117 * h;
  const midY = crown - 0.108 * h;
  const midZ = headDepth + 0.002 * h;
  const surface = (x: number, y: number) =>
    midZ + skullDepth * Math.sqrt(Math.max(0.02, 1 - ((x - head.x) / skullRadius) ** 2 - ((y - midY) / skullHeight) ** 2));
  add("head", circle, head.x, midY, midZ, skullRadius, skullHeight, skullDepth, skin);
  add("head", circle, head.x, crown - hh * 0.44, headDepth - 0.008 * h,
    skullRadius * 1.035, hh, skullDepth, hair);
  for (const s of [-1, 1]) {
    add("head", circle, head.x + s * skullRadius * 0.77, crown - 0.054 * h, midZ - 0.018 * h,
      0.023 * h, 0.046 * h, skullDepth * 0.66, hair);
    add("head", circle, head.x + s * skullRadius * 0.94, crown - 0.122 * h, midZ - 0.009 * h,
      0.015 * h, 0.027 * h, 0.018 * h, skin);
    const eyeX = head.x + s * 0.031 * h;
    const browY = crown - 0.101 * h, eyeY = crown - 0.116 * h;
    add("head", block, eyeX, browY, surface(eyeX, browY) - 0.002 * h,
      0.033 * h, 0.008 * h, 0.012 * h, hair, s * 0.10);
    add("head", circle, eyeX, eyeY, surface(eyeX, eyeY) - 0.001 * h,
      0.014 * h, 0.005 * h, 0.007 * h, 0x332a29);
  }
  if (id === "w11" || id === "w14") {
    for (let n = -1; n <= 1; n++) {
      const x = head.x + n * 0.032 * h, y = crown - 0.049 * h;
      add("head", circle, x, y, surface(x, y) - 0.012 * h,
        0.031 * h, (n === 0 ? 0.043 : 0.035) * h, 0.025 * h, hair, n * 0.18);
    }
  }
  const noseY = crown - 0.143 * h, mouthY = crown - 0.177 * h;
  add("head", circle, head.x, noseY, surface(head.x, noseY) - 0.006 * h,
    0.013 * h, 0.019 * h, 0.021 * h, skin);
  add("head", circle, head.x, mouthY, surface(head.x, mouthY) - 0.002 * h,
    0.022 * h, 0.004 * h, 0.008 * h, 0x925d54);
  if (id === "w4")
    add(
      "head",
      block,
      0,
      crown + 0.005 * h,
      headDepth - 0.01 * h,
      hairWidth * 1.54,
      0.056 * h,
      hairDepth * 1.6,
      hair,
    );
  const mesh = new THREE.SkinnedMesh(
    kit.finish(),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.79 }),
  );
  mesh.name = id + "-kit";
  root.add(mesh);
  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(armature);
  mesh.bind(skeleton);
  mesh.frustumCulled = false;
  return { root, bones, rest, mesh, height, body };
}

