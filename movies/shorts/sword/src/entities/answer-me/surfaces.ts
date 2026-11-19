import * as THREE from "three";

/** Rings measured across a silhouette, from tail toward nose. */
type Section = readonly [x: number, y: number, heightRadius: number, widthRadius: number];

/** Faceted, matte fabric, coat and tack surfaces share the scene's daylight. */
export function surface(parent: THREE.Object3D, name: string, geometry: THREE.BufferGeometry, colour: number): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({color: colour, roughness: 0.89, flatShading: true});
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/** A closed sectioned skin, with independent topline, underline and side breadth. */
export function skin(parent: THREE.Object3D, name: string, rings: readonly Section[], colour: number, sides = 12): THREE.Mesh {
  const positions: number[] = [];
  const indices: number[] = [];
  for (const [x, y, ry, rz] of rings)
    for (let i = 0; i < sides; i++) {
      const theta = i * Math.PI * 2 / sides;
      positions.push(x, y + Math.cos(theta) * ry, Math.sin(theta) * rz);
    }
  for (let ring = 1; ring < rings.length; ring++)
    for (let i = 0; i < sides; i++) {
      const a = (ring - 1) * sides + i;
      const b = (ring - 1) * sides + (i + 1) % sides;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  const end = (rings.length - 1) * sides;
  for (let i = 1; i < sides - 1; i++) indices.push(0, i + 1, i, end, end + i, end + i + 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return surface(parent, name, geometry, colour);
}

/** A small rounded volume located at a surface or joint. */
export function oval(parent: THREE.Object3D, name: string, x: number, y: number, z: number, rx: number, ry: number, rz: number, colour: number): THREE.Mesh {
  const mesh = surface(parent, name, new THREE.SphereGeometry(1, 12, 8), colour);
  mesh.scale.set(rx, ry, rz);
  mesh.position.set(x, y, z);
  return mesh;
}

/** A named moving joint or attachment. */
export function joint(parent: THREE.Object3D, name: string, x: number, y: number, z = 0): THREE.Group {
  const part = new THREE.Group();
  part.name = name;
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}

/** A flexible leather edge following its hanging or sewn curve. */
export function cord(parent: THREE.Object3D, name: string, points: readonly (readonly [number,number,number])[], radius: number, colour: number): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map(([x,y,z]) => new THREE.Vector3(x,y,z)));
  return surface(parent, name, new THREE.TubeGeometry(curve, points.length * 3, radius, 5, false), colour);
}
