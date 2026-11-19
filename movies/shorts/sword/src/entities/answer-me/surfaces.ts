import * as THREE from "three";

/** Rings measured across a silhouette, from tail toward nose. */
type Section = readonly [x: number, y: number, heightRadius: number, widthRadius: number];

/**
 * Attaches a named matte mesh using the caller's geometry and packed RGB.
 *
 * @evidence contracts/development/entities.md#settings-realization The horse and rider factories select the coats, fabric and tack from their cast records. This fragment applies the supplied colour to the actual mesh.
 * @evidence contracts/development/entities.md#object-shape Returns a mutable mesh attached to the caller's drawable graph; the parent subject owns its placement and motion.
 * @evidence contracts/development/entities.md#controls-and-source The supplied geometry sets shape and detail. Native Three.js uses the repository-authored colour and matte material for diffuse light and shadows.
 * @evidence contracts/development/common.md#meaningful-documentation Describes input geometry transfer, colour encoding and the named attached result.
 * @evidence contracts/development/implementation.md#principled-implementation A flat-shaded standard material renders the given geometry under the shared light rig and enables cast and receive shadows.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Centralizes shared cast surface and shadow settings, leaving shape and colour to callers.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The rough matte finish is a single authored material choice for the coarse cast, with each caller's actual colour and geometry preserved.
 * @evidence contracts/development/implementation.md#efficient-algorithms Adds one material and mesh without copying or iterating over the supplied geometry.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the supplied geometry by reference. Each mesh gets a separate material so a caller can acquire independent appearance state.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Creates one material per attached mesh and stores no cache. The parent graph owns the attachment and its resources.
 */
export function surface(parent: THREE.Object3D, name: string, geometry: THREE.BufferGeometry, colour: number): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({color: colour, roughness: 0.89, flatShading: true});
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * Builds a closed shell from ordered rings with metre-scale centres, heights
 * and widths. Callers supply at least two rings and three integral sides.
 *
 * @evidence contracts/development/entities.md#settings-realization The mount supplies the silhouette sections for the three horses. This geometry fragment carries those sections into the visible coat.
 * @evidence contracts/development/entities.md#object-shape Returns an attached skin mesh. Its subject owns the ordered rings, material choice and subsequent motion.
 * @evidence contracts/development/entities.md#controls-and-source The only resolution input is the number of sides around each authored ring. The same section source drives every supported resolution.
 * @evidence contracts/development/common.md#meaningful-documentation States the expected dimensions, ordered input and minimum topology for the closed mesh.
 * @evidence contracts/development/implementation.md#principled-implementation Samples elliptical rings, stitches neighboring rings by matching their angles and caps the end rings. Supported cast inputs have ordered sections and positive radii.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The loft owns indexing and normals; surface owns attachment and shading.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Topology comes from the supplied sections and side count. There is no stored mesh substituted for the loft.
 * @evidence contracts/development/implementation.md#efficient-algorithms Geometry generation uses time and storage proportional to rings times sides; each vertex and strip is needed in the indexed surface.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Adjacent panels share indexed ring vertices. Geometry is created for each caller because the section dimensions and surface ownership vary.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Position and index arrays become typed geometry data on the returned mesh. The parent graph owns geometry disposal and the helper retains no reference.
 */
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

/**
 * Attaches an ellipsoid at a local metre position with independent radii.
 *
 * @evidence contracts/development/entities.md#settings-realization The cast factories choose which head, body and joint volumes express their cast records. This fragment draws each supplied volume.
 * @evidence contracts/development/entities.md#object-shape Returns an attached mesh with the caller's local translation and scale. The parent owns the fragment's state.
 * @evidence contracts/development/entities.md#controls-and-source Uses the supplied centre, radii and packed RGB on a fixed coarse native sphere, with no external asset.
 * @evidence contracts/development/common.md#meaningful-documentation Describes the local coordinate system and ellipsoid inputs.
 * @evidence contracts/development/implementation.md#principled-implementation Scaling a unit sphere independently on each axis produces the requested ellipsoid for positive radii.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Computes only the volume's shape and position. Surface owns material and graph attachment.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Uses a fixed 12-by-8 tessellation for all cast ovals, independent of actor or screen position.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each oval has a fixed vertex count and two transform writes.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the shared surface helper. Sphere buffers are allocated per mesh; this module has no geometry cache.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Retains one geometry on the returned mesh, owned by the parent graph. There is no module-level retention.
 */
export function oval(parent: THREE.Object3D, name: string, x: number, y: number, z: number, rx: number, ry: number, rz: number, colour: number): THREE.Mesh {
  const mesh = surface(parent, name, new THREE.SphereGeometry(1, 12, 8), colour);
  mesh.scale.set(rx, ry, rz);
  mesh.position.set(x, y, z);
  return mesh;
}

/**
 * Attaches a named group in parent-local metres. Its local z defaults to zero.
 *
 * @evidence contracts/development/entities.md#settings-realization The mount and rider name the pose and connection landmarks. This fragment makes those landmarks available in their drawable graph.
 * @evidence contracts/development/entities.md#object-shape Returns the mutable attachment group. Child geometry follows the parent and its pose; the parent entity owns the state.
 * @evidence contracts/development/entities.md#controls-and-source The fixed name and coordinates rebuild this native Three.js attachment without geometry or asset loading.
 * @evidence contracts/development/common.md#meaningful-documentation Documents parent-local positioning and the depth default.
 * @evidence contracts/development/implementation.md#principled-implementation A transform node applies one local translation and carries its descendants under normal parent transform composition.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The helper names and places the attachment; callers compose its descendants and motion.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Uses the supplied coordinates directly, with zero depth as the declared default.
 * @evidence contracts/development/implementation.md#efficient-algorithms Creates and attaches one empty transform, independent of the later number of children.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Each group belongs to one parent and receives independent transforms; sharing a group would transfer its parent.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Returns one transform with no native geometry or material. Its parent owns the group's lifetime.
 */
export function joint(parent: THREE.Object3D, name: string, x: number, y: number, z = 0): THREE.Group {
  const part = new THREE.Group();
  part.name = name;
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}

/**
 * Attaches an open leather tube through ordered local metre points. Radius
 * is in metres; callers supply a nondegenerate curve.
 *
 * @evidence contracts/development/entities.md#settings-realization Mount and rider factories pass the tack or outfit outline from their authored forms. This fragment carries that outline into the leather geometry.
 * @evidence contracts/development/entities.md#object-shape Returns one mesh attached to its subject. Points describe a shape in the parent frame; entity and scene retain pose ownership.
 * @evidence contracts/development/entities.md#controls-and-source The given path, radius and colour rebuild the coarse tube through Three.js, without loading materials or assets.
 * @evidence contracts/development/common.md#meaningful-documentation States the ordered point input, frame, metre radius and open end condition.
 * @evidence contracts/development/implementation.md#principled-implementation Uses the native Catmull–Rom spline for a smooth open path and TubeGeometry for a five-sided cross section. Its callers provide ordered, distinct curve points.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The fragment owns curve and tessellation; surface applies colour, shading and attachment.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts A fixed density of three lengthwise segments per supplied point defines the coarse tube. The shape always comes from the supplied points.
 * @evidence contracts/development/implementation.md#efficient-algorithms Path conversion and tube storage scale with point count at a fixed radial resolution.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the shared surface path but creates individual geometry for each independently shaped curve.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Curve and sample construction are temporary. The parent mesh owns the resulting tube geometry and material, with no cache.
 */
export function cord(parent: THREE.Object3D, name: string, points: readonly (readonly [number,number,number])[], radius: number, colour: number): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map(([x,y,z]) => new THREE.Vector3(x,y,z)));
  return surface(parent, name, new THREE.TubeGeometry(curve, points.length * 3, radius, 5, false), colour);
}
