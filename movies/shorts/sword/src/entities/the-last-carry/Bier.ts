import * as THREE from "three";

const deckTop: number = 1.51;
const shoeX: number = 0.16;
const tau: number = 2 * Math.PI;

/** Smooth transition between two measured stations. */
function ramp(start: number, end: number, value: number): number {
  return THREE.MathUtils.smoothstep(value, start, end);
}

/** Local height of a rounded support beneath the linen. */
function bell(value: number, width: number): number {
  return Math.exp(-((value / width) ** 2));
}

/** Periodic warp and weft, longitudinal wood pores or pebbled leather grain. */
function surfaceTexture(kind: "linen" | "oak" | "leather"): THREE.DataTexture {
  const size: number = 128;
  const data: Uint8Array = new Uint8Array(size * size * 4);
  let state: number = 481516;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const noise: number = state / 4294967296;
      const u: number = (tau * x) / size;
      const v: number = (tau * y) / size;
      let level: number;
      if (kind === "linen") {
        const warp: number = Math.cos(32 * u + 0.42 * Math.sin(2 * v));
        const weft: number = Math.cos(32 * v + 0.35 * Math.sin(3 * u));
        level = 221 + 12 * warp + 10 * weft + 9 * (noise - 0.5);
      } else if (kind === "oak") {
        const ring: number = 6 * u + 0.55 * Math.sin(v) + 0.4 * Math.cos(2 * u + v);
        level = 190 + 21 * Math.sin(ring) + 18 * Math.cos(5 * ring) + 17 * noise;
      } else {
        level = 197 + 26 * noise + 13 * Math.cos(2 * v + Math.sin(3 * u)) + 8 * Math.sin(u + v);
      }
      const index: number = 4 * (y * size + x);
      data[index] = data[index + 1] = data[index + 2] = level;
      data[index + 3] = 255;
    }
  const result: THREE.DataTexture = new THREE.DataTexture(data, size, size);
  result.wrapS = result.wrapT = THREE.RepeatWrapping;
  result.magFilter = THREE.LinearFilter;
  result.minFilter = THREE.LinearMipmapLinearFilter;
  result.generateMipmaps = true;
  result.colorSpace = THREE.SRGBColorSpace;
  result.needsUpdate = true;
  return result;
}

/** Oak rails carry the battens, which support the narrow planks under the body. */
function makeFrame(root: THREE.Group): void {
  const oak: THREE.DataTexture = surfaceTexture("oak");
  const woods: THREE.MeshStandardMaterial[] = [0x795333, 0x69482f, 0x775638].map(
    (color: number) => new THREE.MeshStandardMaterial({ color, map: oak, roughness: 0.88 }),
  );
  function timber(name: string, x: number, y: number, z: number, w: number, h: number, l: number, shade: number): void {
    const geo: THREE.BoxGeometry = new THREE.BoxGeometry(w, h, l);
    const p: THREE.BufferAttribute = geo.getAttribute("position") as THREE.BufferAttribute;
    const uv: THREE.BufferAttribute = geo.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const along: number = w > l ? p.getX(i) : p.getZ(i);
      const across: number = w > l ? p.getZ(i) : p.getX(i);
      uv.setXY(i, (across + p.getY(i)) * 3.4 + shade / 3, along * 0.8 + shade);
    }
    const piece: THREE.Mesh = new THREE.Mesh(geo, woods[shade]);
    piece.name = name;
    piece.position.set(x, y, z);
    piece.castShadow = piece.receiveShadow = true;
    root.add(piece);
  }
  for (const x of [-0.43, 0.43]) timber("Carrying pole", x, 1.372, 0, 0.075, 0.096, 3.25, 0);
  for (const z of [-0.84, 0, 0.84]) timber("Oak cross-batten", 0, 1.445, z, 0.94, 0.05, 0.091, 1);
  for (let i = 0; i < 5; i++) timber("Bier plank", (i - 2) * 0.165, deckTop - 0.02, 0, 0.162, 0.04, 2.14, i % 3);
}

/** A worn upper and its welt share the rounded plan of the last. */
function makeShoe(root: THREE.Group): void {
  const leatherTexture: THREE.DataTexture = surfaceTexture("leather");
  const leather: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
    color: 0x845434, map: leatherTexture, roughness: 0.68, vertexColors: true,
  });
  const sole: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: 0x432d20, roughness: 0.91 });
  const welt: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: 0x886246, roughness: 0.81 });
  const parts: THREE.Group = new THREE.Group();
  parts.name = "Worn brown shoe at the rear hem";
  parts.position.set(shoeX, deckTop, -0.813);
  root.add(parts);
  function layer(name: string, material: THREE.Material, bottom: number, height: number, upper: boolean): void {
    const sides: number = 48;
    const rows: number = 18;
    const points: number[] = [], colors: number[] = [], uv: number[] = [], indices: number[] = [];
    for (let row = 0; row <= rows; row++) {
      const v: number = row / rows;
      const arc: number = v * 0.5 * Math.PI;
      const taper: number = upper ? Math.max(0.001, Math.cos(arc) ** 0.58) : 1 - 0.035 * Math.cos(tau * v);
      for (let i = 0; i <= sides; i++) {
        const theta: number = (tau * i) / sides;
        const nz: number = Math.cos(theta);
        const z: number = 0.159 * nz * taper + (upper ? 0.043 * v ** 2 : 0);
        const x: number = 0.078 * Math.sin(theta) * (0.94 - 0.16 * nz) * taper;
        const creaseLine: number = z + 0.084 - 1.9 * x ** 2;
        const crease: number = upper ? 0.004 * bell(creaseLine, 0.004) : 0;
        const toeSpring: number = 0.018 * Math.max(0, -nz * taper) ** 3;
        const y: number = bottom + toeSpring + height * (upper ? Math.sin(arc) * (1 + 0.21 * nz) : v) - crease;
        points.push(x, y, z);
        const wear: number = Math.max(0, -nz) * (0.4 + 0.6 * Math.sin(arc));
        const scuffs: number = Math.sin(136 * x + 41 * z) * Math.sin(72 * z - 16 * x);
        const polish: number = 0.70 + 0.25 * wear + 0.16 * wear * scuffs - 0.13 * bell(creaseLine, 0.005);
        colors.push(polish, polish, polish);
        uv.push(i / sides * 2, v);
        if (row < rows && i < sides) {
          const a: number = row * (sides + 1) + i;
          indices.push(a, a + 1, a + sides + 1, a + 1, a + sides + 2, a + sides + 1);
        }
      }
    }
    const geo: THREE.BufferGeometry = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh: THREE.Mesh = new THREE.Mesh(geo, material);
    mesh.name = name;
    mesh.castShadow = mesh.receiveShadow = true;
    parts.add(mesh);
  }
  layer("Stacked hide sole", sole, 0, 0.017, false);
  layer("Edge of the welt", welt, 0.017, 0.006, false);
  layer("Creased chestnut leather", leather, 0.023, 0.121, true);
}

/** Folds run from the head, shoulders, knees and raised foot down to the free hem. */
function linenPoint(u: number, v: number, reveal: number, breeze: number, lift: number): THREE.Vector3 {
  const edge: number = Math.abs(u);
  const end: number = 2 * v - 1;
  const z: number = 1.008 * end;
  const x: number = u * (0.368 - 0.079 * bell(z - 0.91, 0.21) - 0.041 * bell(z + 0.91, 0.18));
  const head: number = 0.24 * bell(z - 0.78, 0.155) * bell(x + 0.009, 0.146);
  const chest: number = 0.268 * bell(z - 0.37, 0.31) * Math.exp(-((x / 0.254) ** 4));
  const hips: number = 0.165 * bell(z + 0.075, 0.28) * bell(x, 0.195);
  const knees: number = 0.143 * bell(z + 0.37, 0.185) * bell(x, 0.176);
  const ankles: number = 0.072 * bell(z + 0.61, 0.244) * bell(x, 0.152);
  const foot: number = 0.134 * bell(z + 0.802, 0.26) * bell(x - shoeX + 0.012, 0.147);
  const farFoot: number = 0.131 * bell(z + 0.755, 0.145) * bell(x + 0.09, 0.089);
  const side: number = ramp(0.37, 0.985, edge);
  const corner: number = bell(x - shoeX, 0.166) * (1 - ramp(-1.008, -0.63, z));
  const border: number = Math.min(1 - edge, 1 - Math.abs(end));
  const sideFall: number = ramp(0, 0.24, 1 - edge);
  const endFall: number = ramp(0, z < 0 ? 0.066 : 0.15, 1 - Math.abs(end));
  const creasePhase: number = 20 * z + 15 * x + 3.1 * Math.sin(5.2 * z) + side * Math.sin(8 * z);
  const folds: number = (0.003 + 0.019 * side) *
    (Math.sin(creasePhase) + 0.62 * Math.sin(34 * z - 20 * x) + 0.28 * Math.sin(2 * creasePhase));
  const kick: number = 0.025 * Math.sin(43 * x - 17 * z) * reveal * corner;
  const cornerLift: number = corner * reveal;
  const y: number = deckTop + 0.006 + (0.079 + head + chest + hips + knees + ankles + foot + farFoot + folds)
    * sideFall * endFall + 0.196 * corner * lift + kick
    + 0.0032 * breeze * (1 - ramp(0, 0.18, border)) * Math.sin(17 * z - 7 * x);
  return new THREE.Vector3(
    x + side * 0.013 * Math.sin(creasePhase) + 0.008 * cornerLift,
    y,
    z + 0.167 * cornerLift + 0.006 * Math.sin(24 * x + 4 * z) * Math.abs(end) ** 6,
  );
}

/** Sample a common cloth grid so ordinary seeks can select the precomputed morphs. */
function linenGeometry(reveal: number, breeze: number, lift: number = reveal): THREE.BufferGeometry {
  const cols: number = 48, rows: number = 96;
  const positions: number[] = [], uv: number[] = [], colors: number[] = [], indices: number[] = [];
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++) {
      const u: number = 2 * i / cols - 1, v: number = j / rows;
      const point: THREE.Vector3 = linenPoint(u, v, reveal, breeze, lift);
      positions.push(point.x, point.y, point.z);
      uv.push(u * 6.1, v * 35);
      const edge: number = Math.min((1 - Math.abs(u)) * 0.36, Math.min(v, 1 - v) * 2.016);
      const turnover: number = 0.92 + 0.08 * ramp(0.011, 0.022, edge);
      const fleck: number = 0.98 + 0.018 * Math.sin(u * 17 + v * 23) * Math.cos(v * 38);
      colors.push(fleck * turnover, fleck * turnover, fleck * turnover);
      if (j < rows && i < cols) {
        const a: number = j * (cols + 1) + i;
        indices.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2);
      }
    }
  const geo: THREE.BufferGeometry = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Build the carried bier in meters. Its rear corner opens with reveal in [0,1] and breathes with phase in radians. */
export function createCarryBier(): {
  root: THREE.Group;
  setHem(reveal: number, phase: number): void;
  hemPoint(): THREE.Vector3;
} {
  const root: THREE.Group = new THREE.Group();
  root.name = "The uncle on his bier";
  makeFrame(root);
  makeShoe(root);
  const geometry: THREE.BufferGeometry = linenGeometry(0, 0);
  const shapes: THREE.BufferGeometry[] = [linenGeometry(1, 0, 0), linenGeometry(0, 1), linenGeometry(0, 0, 1)];
  for (const key of ["position", "normal"] as const) {
    geometry.morphAttributes[key] = shapes.map((shape: THREE.BufferGeometry) =>
      shape.getAttribute(key) as THREE.BufferAttribute,
    );
  }
  const cloth: THREE.Mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color: 0xf1e8d4, map: surfaceTexture("linen"), side: THREE.DoubleSide, roughness: 0.96, vertexColors: true,
  }));
  cloth.name = "Unbleached linen shroud";
  cloth.castShadow = cloth.receiveShadow = true;
  root.add(cloth);
  return {
    root,
    setHem(reveal: number, phase: number): void {
      const weights: number[] = cloth.morphTargetInfluences!;
      weights[0] = THREE.MathUtils.clamp(reveal, 0, 1);
      weights[1] = Math.sin(phase);

      // Give the edge clearance over the rounded toe before drawing it back.
      weights[2] = weights[0] + 0.29 * Math.sin(Math.PI * weights[0]);
    },
    hemPoint(): THREE.Vector3 {
      const [reveal, breeze, lift] = cloth.morphTargetInfluences!;
      return root.localToWorld(linenPoint(0.48, 0, reveal!, breeze!, lift!));
    },
  };
}
