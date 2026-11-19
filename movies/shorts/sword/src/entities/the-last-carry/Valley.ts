import * as THREE from "three";

type Point = [number, number, number];
type Placement = { matrix: THREE.Matrix4; color: THREE.Color };

/** A fixed seed keeps grass, granite and wood grain registered from cut to cut. */
function randomSource(): () => number {
  let seed = 1460;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** Varies a local pigment in linear light. */
function pigment(hex: number, gain = 1): THREE.Color {
  return new THREE.Color(hex).multiplyScalar(gain);
}

/** Periodic value noise, so the texture wraps seamlessly on both axes. */
function grainMap(wood: boolean): THREE.DataTexture {
  const size = 256;
  const random = randomSource();
  const grid = Float32Array.from({ length: size * size }, () => random());
  const data = new Uint8Array(size * size * 4);
  const noise = (x: number, y: number, nx: number, ny: number): number => {
    x = (x * nx) / size;
    y = (y * ny) / size;
    const ix = Math.floor(x), iy = Math.floor(y);
    const sample = (i: number, j: number): number =>
      grid[((j % ny + ny) % ny) * size + ((i % nx + nx) % nx)]!;
    const fx = x - ix, fy = y - iy;
    return THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(sample(ix, iy), sample(ix + 1, iy), fx),
      THREE.MathUtils.lerp(sample(ix, iy + 1), sample(ix + 1, iy + 1), fx), fy);
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = wood
        ? noise(x + 4 * Math.sin(y / size * Math.PI * 2), y, 84, 3) * 0.58 + noise(x, y, 23, 7) * 0.42
        : noise(x, y, 9, 9) * 0.33 + noise(x, y, 41, 41) * 0.34 + grid[y * size + x]! * 0.33;
      const value = Math.min(255, Math.round(wood ? 156 + n * 107 : 140 + n * 137));
      const i = (y * size + x) * 4;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** A batch belongs to one local frame, mesh, material and shadow policy. */
function batch(parent: THREE.Object3D, name: string, geometry: THREE.BufferGeometry, material: THREE.Material, shadow: boolean) {
  const placements: Placement[] = [];
  const transform = new THREE.Object3D();
  return {
    put(position: Point, scale: Point, color: THREE.Color, rotation: Point = [0, 0, 0]): void {
      transform.position.set(...position);
      transform.scale.set(...scale);
      transform.rotation.set(...rotation);
      transform.updateMatrix();
      placements.push({ matrix: transform.matrix.clone(), color });
    },
    finish(): void {
      if (!placements.length) return;
      const mesh = new THREE.InstancedMesh(geometry, material, placements.length);
      mesh.name = name;
      placements.forEach((item, i) => {
        mesh.setMatrixAt(i, item.matrix);
        mesh.setColorAt(i, item.color);
      });
      mesh.receiveShadow = true;
      mesh.castShadow = shadow;
      mesh.computeBoundingSphere();
      parent.add(mesh);
    },
  };
}

/** The center stays level; the banks rise outside the camera lane. */
function ground(x: number, z: number): number {
  const bank = THREE.MathUtils.smoothstep(Math.abs(x), 2, 15);
  return -0.012 + bank * (0.32 + 0.28 * Math.sin(z * 0.31 + x * 0.23) + 0.14 * Math.sin(z * 0.77 - x * 0.41));
}

/** The wheel tracks and verge share one surface so no overlay can flicker. */
function lane(parent: THREE.Group, stone: THREE.Texture): void {
  const plane = new THREE.PlaneGeometry(88, 96, 180, 154);
  plane.rotateX(-Math.PI / 2);
  plane.translate(0, 0, 7);
  const pos = plane.getAttribute("position");
  const uv = plane.getAttribute("uv");
  const colors: number[] = [];
  const brown = pigment(0xbba17b), rut = pigment(0x8d7f68), grass = pigment(0x797e50);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const bend = THREE.MathUtils.smoothstep(z, 16, 39);
    const shoulder = Math.abs(x + 9 * bend - 0.13 * Math.sin(z * 0.54));
    const edge = THREE.MathUtils.smoothstep(shoulder, 1.65, 2.85);
    const track = Math.exp(-(((shoulder - 0.96) / 0.26) ** 2));
    const color = brown.clone().lerp(rut, track * 0.82).lerp(grass, edge);
    const patch = Math.sin(x * 0.85 + Math.sin(z * 0.32)) * Math.cos(z * 0.63) * 0.13 + 0.065 * Math.sin(x * 3 - z * 1.3);
    color.multiplyScalar(1 + patch);
    colors.push(color.r, color.g, color.b);
    pos.setY(i, ground(x, z) - 0.018 * track);
    uv.setXY(i, x / 1.65, z / 1.65);
  }
  plane.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  plane.computeVertexNormals();
  const mesh = new THREE.Mesh(plane, new THREE.MeshLambertMaterial({ map: stone, vertexColors: true }));
  mesh.name = "Wheel ruts and meadow";
  mesh.receiveShadow = true;
  parent.add(mesh);
}

/** A photographed sky would fix a single exposure. Vertex colors carry the warm eastern wash around every camera. */
function horizon(parent: THREE.Group): void {
  const dome = new THREE.SphereGeometry(260, 144, 72);
  const p = dome.getAttribute("position");
  const colors: number[] = [];
  const horizonColor = pigment(0xf2d9b1), upper = pigment(0x87aeb8), east = pigment(0xffebbf);
  const sunDirection = new THREE.Vector3(-0.69, 0.24, 0.68).normalize();
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i).normalize();
    const c = horizonColor.clone().lerp(upper, THREE.MathUtils.smoothstep(v.y, -0.025, 0.63));
    const d = Math.max(0, v.dot(sunDirection));
    c.lerp(east, Math.pow(d, 23) * 0.74);
    const streak = Math.sin(v.y * 85 + 2.7 * Math.sin(v.x * 3.5 + v.z * 5)) * 0.40
      + Math.cos(v.y * 131 + v.x * 7 - v.z * 8) * 0.26 + Math.sin(v.x * 9 + v.z * 10) * 0.34;
    c.lerp(pigment(0xf3e9d4), THREE.MathUtils.smoothstep(streak, 0.04, 0.8)
      * THREE.MathUtils.smoothstep(v.y, 0.07, 0.25) * (1 - THREE.MathUtils.smoothstep(v.y, 0.39, 0.80)) * 0.35);
    colors.push(c.r, c.g, c.b);
  }
  dome.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const sky = new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.name = "Apricot horizon to blue zenith";
  sky.renderOrder = -100;
  // Keep the skydome inside a short far plane in camera space.
  sky.onBeforeRender = (_renderer, _scene, camera) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    sky.scale.setScalar(Math.min(240, camera.far * 0.93) / 260);
    sky.position.copy(camera.getWorldPosition(new THREE.Vector3()));
    sky.updateMatrixWorld();
  };
  sky.frustumCulled = false;
  parent.add(sky);
}

/** Jagged concentric crests, cut into ravines, with snow caught in high gullies. */
function ranges(parent: THREE.Group, random: () => number): void {
  const positions: number[] = [], colors: number[] = [];
  const radial = 180;
  for (const [ridge, radius, base, amplitude] of [[0, 41, 2.0, 3.0], [1, 59, 4.1, 8], [2, 78, 7, 15]]) {
    const phase = ridge! * 1.89;
    const points: THREE.Vector3[][] = [];
    for (let i = 0; i < radial; i++) {
      const a = i / radial * Math.PI * 2;
      const crest = base! + amplitude! * (0.50 + 0.16 * Math.sin(a * 3 + phase) + 0.14 * Math.cos(a * 5 - phase)
        + 0.19 * Math.abs(Math.sin(a * 7 + phase)) + 0.15 * Math.sin(a * 12 - phase) + (random() - 0.5) * 0.14);
      const foot = radius! * (1 + Math.sin(a * 4 - phase) * 0.035);
      const spur = Math.sin(a * 16 + phase) * 1.25 + random() * 0.65;
      const row: THREE.Vector3[] = [];
      for (let j = 0; j < 7; j++) {
        const t = j / 6;
        const r = foot - (1 - t) * (10 + ridge! * 3.6) + spur * Math.sin(Math.PI * t);
        const y = -1.2 + (crest + 1.2) * t + Math.sin(t * Math.PI) * (Math.sin(a * 17 + phase) * 1.15 + random() * 0.9);
        row.push(new THREE.Vector3(Math.sin(a) * r, y, 6 + Math.cos(a) * r));
      }
      points.push(row);
    }
    const palette = ridge === 0 ? [0x64735e, 0x859076] : ridge === 1 ? [0x626f74, 0x9c9f91] : [0x687881, 0xb1afa0];
    const light = new THREE.Vector3(-0.75, 0.48, 0.42).normalize();
    for (let i = 0; i < radial; i++) {
      for (let j = 0; j < 6; j++) {
        const l = points[i]!, r = points[(i + 1) % radial]!;
        for (const face of [[l[j]!, r[j]!, l[j + 1]!], [r[j]!, r[j + 1]!, l[j + 1]!]]) {
          const [p, q, v] = face as [THREE.Vector3, THREE.Vector3, THREE.Vector3];
          const normal = q.clone().sub(p).cross(v.clone().sub(p)).normalize().negate();
          const glow = THREE.MathUtils.clamp(normal.dot(light) * 0.69 + 0.35 + random() * 0.14, 0, 1);
          const c = pigment(palette[0]!).lerp(pigment(palette[1]!), glow);
          if (ridge === 2 && (p.y + q.y + v.y) / 3 > 15.1 + 2.2 * Math.sin(i * 0.36) && normal.y > 0.27)
            c.lerp(pigment(0xe7e2ca), 0.48 + 0.46 * glow);
          for (const point of face) {
            positions.push(point.x, point.y, point.z);
            colors.push(c.r, c.g, c.b);
          }
        }
      }
    }
  }
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  mesh.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  mesh.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  mesh.name = "Three crests of the valley";
  parent.add(mesh);
}

/** Joined sprays give the larches a ragged outline even in silhouette. */
function conifer(random: () => number): THREE.BufferGeometry {
  const positions: number[] = [], colors: number[] = [];
  for (let tier = 0; tier < 10; tier++) {
    const y = 0.11 + tier * 0.081, radius = 0.20 * (1 - tier * 0.089);
    for (let k = 0; k < 9; k++) {
      const a = k * Math.PI * 2 / 9 + tier * 1.81, end = radius * (0.88 + random() * 0.35);
      const tip: Point = [Math.cos(a) * end, y - 0.04 - random() * 0.05, Math.sin(a) * end];
      const left: Point = [Math.cos(a + 0.48) * radius * 0.65, y, Math.sin(a + 0.48) * radius * 0.65];
      const right: Point = [Math.cos(a - 0.48) * radius * 0.65, y, Math.sin(a - 0.48) * radius * 0.65];
      const inner: Point = [0, y + 0.16, 0];
      for (const face of [[inner, left, tip], [inner, tip, right]]) {
        const tone = 0.63 + random() * 0.36;
        for (const point of face) {
          positions.push(...point);
          colors.push(tone, tone, tone);
        }
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Builds the valley in metres. The timber leaf turns inward from its east post at z=12. */
export function createCarryValley(scene: THREE.Scene): {
  setGate(closed: number): void;
  gateHandle(): THREE.Vector3;
} {
  const root = new THREE.Group();
  root.name = "The burial lane";
  scene.add(root);
  const random = randomSource();
  const stoneMap = grainMap(false), woodMap = grainMap(true);
  const mineral = new THREE.MeshLambertMaterial({ map: stoneMap, flatShading: true });
  const timber = new THREE.MeshLambertMaterial({ map: woodMap });
  const matte = new THREE.MeshLambertMaterial();
  const box = new THREE.BoxGeometry();
  const blocks = batch(root, "Coursed fieldstone and graves", new THREE.CylinderGeometry(0.55, 0.57, 1, 7, 1), mineral, true);
  const boards = batch(root, "Split oak and lime render", box, timber, true);
  const architecture = batch(root, "Slates, apertures and cross arms", box, matte, true);
  // The roof has two eaves and a single longitudinal ridge.
  const roof = new THREE.BufferGeometry();
  roof.setAttribute("position", new THREE.Float32BufferAttribute([
    -0.5,0,-0.5, 0.5,0,-0.5, 0,1,-0.5, -0.5,0,0.5, 0,1,0.5, 0.5,0,0.5,
    -0.5,0,-0.5, 0,1,-0.5, 0,1,0.5, -0.5,0,-0.5, 0,1,0.5, -0.5,0,0.5,
    0.5,0,-0.5, 0.5,0,0.5, 0,1,0.5, 0.5,0,-0.5, 0,1,0.5, 0,1,-0.5,
  ], 3));
  roof.computeVertexNormals();
  const roofs = batch(root, "Stone-slab gables", roof, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), true);
  const gravel = batch(root, "Road gravel and verge stones", new THREE.DodecahedronGeometry(0.55), mineral, false);
  const firs = batch(root, "Larch copse", conifer(random), new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), false);
  const twigs = batch(root, "Orchard limbs", new THREE.CylinderGeometry(0.38, 0.53, 1, 6), timber, true);
  const leaves = batch(root, "Orchard leaf clusters", new THREE.IcosahedronGeometry(0.56, 0), mineral, false);
  horizon(root);
  ranges(root, random);
  lane(root, stoneMap);
  const rocks = [0x8d8977, 0x9d9881, 0x756e65, 0x828171, 0xa69d86];
  const pick = (palette: number[]): THREE.Color => pigment(palette[Math.floor(random() * palette.length)]!, 0.89 + random() * 0.21);

  // A low wall at the gate bounds the burial ground without filling the camera corridor.
  const wall = (ax: number, az: number, bx: number, bz: number, rows: number): void => {
    const length = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / length, uz = (bz - az) / length;
    for (let row = 0; row < rows; row++) {
      let run = 0;
      while (run < length - 0.025) {
        const w = Math.min(length - run, (0.35 + random() * 0.42) * (run === 0 && row % 2 ? 0.58 : 1));
        const x = ax + ux * (run + w * 0.5), z = az + uz * (run + w * 0.5);
        blocks.put([x, ground(x, z) + row * 0.165 + 0.085, z], [w * 1.09, 0.17 + random() * 0.034, 0.39 + random() * 0.13], pick(rocks),
          [0.05 * (random() - 0.5), -Math.atan2(uz, ux) + (random() - 0.5) * 0.13, (random() - 0.5) * 0.05]);
        run += w;
      }
    }
  };
  wall(2.05, 12, 8.9, 13.4, 4);
  wall(-2.05, 12, -9, 13.15, 4);
  wall(-9, 13.15, -8.65, 28, 3);
  wall(8.9, 13.4, 10.7, 30, 3);
  wall(8.5, -12, 8.6, 7, 3);
  for (const x of [-1.98, 1.98]) {
    boards.put([x, 0.76, 12], [0.21, 1.52, 0.23], pigment(0x60523b));
    blocks.put([x, 0.13, 12], [0.38, 0.28, 0.40], pick(rocks));
  }
  const hinge = new THREE.Group();
  hinge.position.set(1.89, 0, 12);
  hinge.name = "Inward-swinging burial gate";
  root.add(hinge);
  const gate = batch(hinge, "Chestnut uprights and rails", box, timber, true);
  const tips = batch(hinge, "Hewn picket crowns", roof, new THREE.MeshLambertMaterial({ map: woodMap, side: THREE.DoubleSide }), true);
  const iron = batch(hinge, "Wrought strap hinges", box, matte, true);
  const span = 3.77;
  for (const y of [0.32, 0.97]) {
    gate.put([-span / 2, y, 0], [span, 0.10, 0.105], pigment(0x887456));
    iron.put([-0.27, y, -0.062], [0.55, 0.047, 0.016], pigment(0x4a453c));
  }
  for (let n = 0; n < 11; n++) {
    const tall = n % 2 === 0;
    const height = tall ? 1.86 + random()*0.08 : 1.16 + random()*0.12;
    const tip = tall ? 0.12 : 0.047, foot = 0.10, shaft = height-foot-tip;
    const x = -0.06 - n * (span - 0.12) / 10, width = 0.069 + random()*0.024;
    const color = pigment(0x8e7959,0.83+random()*0.29), yaw = random()*0.12;
    gate.put([x,foot+shaft/2,0.056],[width,shaft,0.08],color,[0,yaw,0]);
    tips.put([x,foot+shaft,0.056],[width,tip,0.08],color,[0,yaw,0]);
  }
  gate.finish();
  tips.finish();
  iron.finish();

  // The chapel and rough-hewn markers sit on the flank of the final sightline.
  const cross = (x: number, z: number, h: number): void => {
    const y = ground(x, z), c = pigment(0x635742);
    boards.put([x, y + h / 2, z], [0.071, h, 0.072], c);
    boards.put([x, y + h * 0.73, z], [h * 0.47, 0.07, 0.07], c);
  };
  for (let i = 0; i < 16; i++) {
    const x = (i % 2 ? -1 : 1) * (2.6 + random() * 4.5), z = 15.1 + random() * 11.8;
    if (i % 3) cross(x, z, 0.56 + random() * 0.38);
    else blocks.put([x, ground(x, z) + 0.25, z], [0.41, 0.55, 0.18], pick(rocks), [0, random() * 0.25, random() * 0.13]);
  }
  const house = (x: number, z: number, w: number, d: number, h: number, chapel: boolean): void => {
    const y = ground(x, z), height = chapel ? 1.85 : 1.25;
    architecture.put([x, y + h / 2, z], [w, h, d], pigment(chapel ? 0xc0ad8c : 0xa3937c));
    roofs.put([x, y + h, z], [w + 0.53, height, d + 0.66], pigment(chapel ? 0x67695e : 0x645f52));
    const front = z - d / 2 - 0.035;
    boards.put([x, y + 0.89, front], [0.85, 1.78, 0.08], pigment(0x514737));
    const limestone = [0xb0a38c, 0xbeb29b, 0x988d78, 0xaa9f89];
    for (let k = 0; k < 9; k++) {
      const a = (k + 0.5) * Math.PI / 9;
      architecture.put([x + Math.cos(a)*0.50, y+1.62+Math.sin(a)*0.50, front-0.05], [0.17,0.25,0.18], pick(limestone), [0,0,a-Math.PI/2]);
    }
    for (const side of [-1, 1]) {
      for (let k = 0; k < Math.floor(h / 0.27); k++) {
        architecture.put([x + side * (w / 2 - 0.11), y + 0.14 + k * 0.27, front], [k % 2 ? 0.41 : 0.23, 0.24, 0.10], pick(limestone));
        if (k < 6)
          architecture.put([x + side * 0.50, y + 0.14 + k * 0.27, front-0.05], [0.18, 0.24, 0.18], pick(limestone));
      }
      for (let e = 0; e < 7; e++) {
        const zz = z + d * (e/6 - 0.5);
        boards.put([x + side*(w/2+0.10),y+h-0.05,zz], [0.36,0.14,0.12], pigment(0x615941));
      }
      const slope = Math.atan2(height, (w+0.53)/2);
      for (let row = 0; row < 8; row++) {
        const t = (row+0.5)/8;
        for (let k = 0; k < 11; k++) {
          architecture.put([x + side*(w+0.53)/2*(1-t),y+h+height*t+0.012,z+(d+0.66)*(k/11-0.46)],
            [(w+0.53)/2/Math.cos(slope)/8*1.03,0.045,(d+0.66)/11*0.96], pick([0x646761,0x76776b,0x65675d,0x78786c]),[0,0,-side*slope]);
        }
      }
    }
    for (const sign of [-1, 1])
      architecture.put([x + sign * w * 0.31, y + h * 0.70, front], [0.31, 0.65, 0.075], pigment(0x45483e));
    if (chapel) {
      const tx = x + w * 0.61, tz = z + 0.6;
      architecture.put([tx, y + 2.8, tz], [1.8, 5.6, 1.85], pigment(0xad9e81));
      for (const dx of [-0.43, 0.43])
        architecture.put([tx + dx, y + 4.87, tz - 0.93], [0.34, 0.83, 0.06], pigment(0x42453d));
      for (const yy of [4.28,5.42])
        architecture.put([tx, y+yy, tz], [1.94,0.12,1.99], pick(limestone));
      for (const side of [-1,1])
        for (const dz of [-0.40,0.40])
          architecture.put([tx+side*0.91,y+4.87,tz+dz], [0.07,0.83,0.34], pigment(0x47483d));
      roofs.put([tx, y + 5.6, tz], [2.14, 1.35, 2.22], pigment(0x6e7168));
      architecture.put([tx, y + 7.21, tz], [0.055, 0.63, 0.055], pigment(0x4d4a3b));
      architecture.put([tx, y + 7.29, tz], [0.37, 0.053, 0.055], pigment(0x4d4a3b));
    }
  };
  house(-9.8, 24.5, 4.8, 7.3, 2.7, true);
  house(17.2, 25.4, 4.8, 6.4, 2.6, false);
  house(21.7, 20.2, 3.9, 5.7, 2.2, false);
  // Small fruit trees mark the settlement edge. Their forked, open crowns
  // break up the taller larch silhouettes without overhanging the lane.
  for (const [x, z, h] of [[-8.5, 6.5, 3.0],[11, 5, 3.65],[8.7, 17.2, 3.1],[-7.8, 18.8, 3.4],
    [12.6, 22, 3.5],[-6.3, -5.5, 3.4],[4.5, 28, 3.8],[-3.5, 31.5, 3.2],[0.7, 32.3, 3.1],[-13,-5,4.1]] as Point[]) {
    const y = ground(x,z);
    const branch = (start: THREE.Vector3, end: THREE.Vector3, width: number): void => {
      const delta = end.clone().sub(start), mid = start.clone().lerp(end,0.5);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
      const euler = new THREE.Euler().setFromQuaternion(quaternion);
      twigs.put([mid.x,mid.y,mid.z],[width,delta.length(),width],pick([0x615440,0x675b46]),[euler.x,euler.y,euler.z]);
    };
    const fork = new THREE.Vector3(x+0.08,y+h*0.44,z-0.1);
    branch(new THREE.Vector3(x,y,z),fork,h*0.087);
    for (let arm=0;arm<7;arm++) {
      const a=(arm+random()*0.45)*Math.PI*2/7, radius=h*(0.23+random()*0.17);
      const tip=new THREE.Vector3(fork.x+Math.cos(a)*radius, y+h*(0.73+random()*0.21),fork.z+Math.sin(a)*radius);
      branch(fork,tip,h*0.044);
      for (let k=0;k<12;k++) {
        const s=h*(0.115+random()*0.13), spread=h*0.25;
        const xx=tip.x+(random()-0.5)*spread, zz=tip.z+(random()-0.5)*spread;
        leaves.put([xx,tip.y+(random()-0.5)*spread*0.62,zz],[s*1.22,s*0.84,s],pick([0x758053,0x7f8553,0x686f47,0x92935a]),[random(),random()*6.28,random()]);
      }
    }
  }
  for (let i = 0; i < 174; i++) {
    const a = random() * Math.PI * 2, r = 16.5 + random() * 19;
    const x = Math.sin(a) * r, z = 6 + Math.cos(a) * r;
    if ((Math.abs(x) < 9 && z > -10 && z < 29) || (x < -6 && x > -14 && z > 19 && z < 29)) continue;
    const h = 2.1 + random() ** 1.3 * 5.0, y = ground(x, z);
    boards.put([x, y + h * 0.32, z], [h * 0.032, h * 0.64, h * 0.037], pigment(0x655f47));
    firs.put([x, y, z], [h, h, h], pick([0x425b4d, 0x606c4a, 0x797d4c, 0x4d6252]), [0, 6.28 * random(), 0]);
  }
  for (let i = 0; i < 1850; i++) {
    const x = (random() - 0.5) * 14, z = -12 + random() * 43;
    const s = Math.abs(x) > 1.8 ? 0.025 + random() ** 3 * 0.24 : 0.012 + random() ** 2 * 0.048;
    gravel.put([x, ground(x, z) + s * 0.04, z], [s * 1.4, s * 0.43, s * 0.9],
      pick(rocks), [random() * 0.15, random() * 6.28, 0.15 * random()]);
  }
  const blades: number[] = [], bladeColors: number[] = [];
  for (let i = 0; i < 5700; i++) {
    const x = (2.1 + random() ** 1.5 * 12) * (random() < 0.5 ? -1 : 1), z = -15 + random() * 53;
    const y = ground(x, z), h = 0.045 + random() * 0.15;
    const c = pick([0x78814e, 0x99955e, 0x717949, 0x89874b]);
    for (let j = 0; j < 5; j++) {
      const a = random() * 6.28, dx = Math.cos(a), dz = Math.sin(a), w = 0.006 + random() * 0.010, s = 0.025 + random() * 0.065;
      blades.push(x - dz*w,y,z + dx*w, x + dz*w,y,z - dx*w, x + dx*s,y + h*(0.45+random()*0.55),z + dz*s);
      bladeColors.push(c.r*0.69,c.g*0.69,c.b*0.69,c.r*0.69,c.g*0.69,c.b*0.69,c.r*1.23,c.g*1.23,c.b*1.23);
    }
  }
  const grasses = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  grasses.name = "Sunlit bent grasses";
  grasses.geometry.setAttribute("position", new THREE.Float32BufferAttribute(blades, 3));
  grasses.geometry.setAttribute("color", new THREE.Float32BufferAttribute(bladeColors, 3));
  root.add(grasses);
  for (const group of [blocks, boards, architecture, roofs, gravel, firs, twigs, leaves]) group.finish();

  scene.background = pigment(0xd7d4b9);
  scene.fog = new THREE.FogExp2(0xd2cfb5, 0.0125);
  const skyLight = new THREE.HemisphereLight(0xe6eff4, 0xb19a78, 1.51);
  const sun = new THREE.DirectionalLight(0xffdfae, 2.21);
  sun.position.set(-15, 11.7, 13);
  sun.target.position.set(0, 0, 5);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 15, bottom: -15, near: 0.5, far: 57 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.014;
  sun.shadow.bias = -0.00025;
  scene.add(skyLight, sun, sun.target);
  const setGate = (closed: number): void => {
    hinge.rotation.y = (1 - THREE.MathUtils.clamp(closed, 0, 1)) * Math.PI / 2;
  };
  setGate(0);
  return {
    setGate,
    gateHandle: (): THREE.Vector3 => hinge.localToWorld(new THREE.Vector3(-1.02, 1.015, 0.08)),
  };
}
