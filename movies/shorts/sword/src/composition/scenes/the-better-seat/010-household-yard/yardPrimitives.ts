import * as THREE from "three";

const materials = new Map<string, THREE.MeshStandardMaterial>();
/**
 * Return the yard's shared material for a hexadecimal RGB and dimensionless metalness.
 * Metalness defaults to zero for a matte surface.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Key the material on the complete color and metalness pair and select the yard's authored roughness for each of the two visual finish ranges.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The palette factory owns finish choice and material sharing. Mesh helpers own geometry and placement.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The finish threshold and roughness are artistic controls for this set's matte and bright surfaces.
 * @evidence contracts/development/implementation.md#efficient-algorithms Lookup has expected constant cost and it allocates only for a new color and metalness pair.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work A pair identifies all variable material properties. Identical values reuse the same material because the roughness rule and material type are fixed.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The module keeps one material per distinct pair it receives. The authored palette is finite and the module cache has no active eviction.
 * @evidence contracts/development/common.md#meaningful-documentation The comment identifies both inputs, their units and the default matte finish.
 * @evidence contracts/development/composition.md#screenplay-realization A consistent matte and bright palette identifies the courtyard furniture, cast overlays and both seats.
 * @evidence contracts/development/composition.md#composition-only This palette capability owns no scene timing. The set and prop factories choose the pairs.
 * @evidence contracts/development/composition.md#living-scene Material identity persists as the objects change position and camera view.
 */
export function paint(c: number, metal = 0) {
  const key = c + "-" + metal;
  if (!materials.has(key))
    materials.set(
      key,
      new THREE.MeshStandardMaterial({
        color: c,
        metalness: metal,
        roughness: metal > 0.1 ? 0.37 : 0.84,
      }),
    );
  return materials.get(key)!;
}
/**
 * Attach a mesh to its parent using a supplied geometry and a yard palette color.
 * XYZ is parent-local metres and defaults to the parent origin. Metalness
 * is dimensionless and defaults to zero. The caller owns scene disposal.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Build one mesh with the passed geometry and yard material, set its local placement and attach it to the supplied scene graph.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The primitive attachment centralizes parent and palette handling. The caller supplies shape and place.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No adjustment is applied to the supplied geometry or placement. Only the material factory picks the authored finish.
 * @evidence contracts/development/implementation.md#efficient-algorithms One mesh and three position components use fixed work, apart from a material allocation for a new palette pair.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse the supplied geometry and the exact cached material. Each call creates a distinct transformed mesh.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The supplied parent owns the attached mesh. Scene disposal governs its geometry and material references.
 * @evidence contracts/development/common.md#meaningful-documentation The comment identifies parent-local metres, material defaults and the attachment effect.
 * @evidence contracts/development/composition.md#screenplay-realization The fixed yard opening and moving items are built as continuing Three.js objects.
 * @evidence contracts/development/composition.md#composition-only The helper applies only geometry, placement and palette. The creator sets the stage time, if any.
 * @evidence contracts/development/composition.md#living-scene The returned node remains on its assigned parent through later transform updates.
 */
export function mesh(
  p: THREE.Object3D,
  g: THREE.BufferGeometry,
  c: number,
  x = 0,
  y = 0,
  z = 0,
  metal = 0,
) {
  const o = new THREE.Mesh(g, paint(c, metal));
  o.position.set(x, y, z);
  p.add(o);
  return o;
}
/**
 * Add a box centered at the parent-local XYZ in metres.
 * Width, height and depth are full box dimensions in metres.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Create the Three.js box from its dimensions and attach it at the requested center.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The box shape is built here and shared attachment behavior is delegated to mesh.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Box sizes and marks are supplied by the set. This helper preserves them.
 * @evidence contracts/development/implementation.md#efficient-algorithms A fixed tessellation box and one mesh have constant setup cost.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The attachment shares the palette material and uses distinct box geometry for each requested size.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Ownership transfers to the parent graph when the mesh is added.
 * @evidence contracts/development/common.md#meaningful-documentation The comment distinguishes full dimensions and local placement units.
 * @evidence contracts/development/composition.md#screenplay-realization Box forms provide the yard bench, walls, posts and threshold silhouettes.
 * @evidence contracts/development/composition.md#composition-only The supplied set recipe owns each dimension and place. The primitive adds no film timing.
 * @evidence contracts/development/composition.md#living-scene Boxes stay where the set places them while the camera and people move.
 */
export function block(
  p: THREE.Object3D,
  c: number,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
) {
  return mesh(p, new THREE.BoxGeometry(w, h, d), c, x, y, z);
}
/**
 * Add an ellipsoid in parent-local metres. XYZ sets its center and the three
 * scales set its radii. Metalness is dimensionless and defaults to zero.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Scale a unit sphere of fixed tessellation for the supplied radii and use the common mesh attachment.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The primitive owns the geometry and the caller directs its placement, colors and scale.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The tessellation is the yard's polygonal presentation choice. The caller supplies radii directly.
 * @evidence contracts/development/implementation.md#efficient-algorithms Geometry uses the same fixed segment counts for each oval, with one mesh transform.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Share the palette material for equal parameters. Each oval is its own transform and geometry.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Ownership transfers to the caller's parent node.
 * @evidence contracts/development/common.md#meaningful-documentation The comment gives radii and placement units and the finish default.
 * @evidence contracts/development/composition.md#screenplay-realization Ellipsoids shape heads, prop details and contact marks needed across the yard beats.
 * @evidence contracts/development/composition.md#composition-only The primitive applies a scale and parent placement with no film clock.
 * @evidence contracts/development/composition.md#living-scene The mesh follows its assigned parent when the seat, head or root moves.
 */
export function oval(
  p: THREE.Object3D,
  c: number,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  metal = 0,
) {
  const m = mesh(p, new THREE.SphereGeometry(1, 16, 12), c, x, y, z, metal);
  m.scale.set(w, h, d);
  return m;
}
/**
 * Add a polygonal cylinder between two distinct parent-local triples.
 * The endpoints and radius are in metres.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Use the endpoint midpoint for the center and rotate the cylinder's local +Y onto their difference. Endpoint separation determines length.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The primitive owns conversion from two stage points to a mesh transform. The caller owns route and placement.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The fixed roundness is a stylized rendering choice. The caller supplies radius and distinct endpoints.
 * @evidence contracts/development/implementation.md#efficient-algorithms A fixed-tessellation cylinder and constant number of vector operations use constant setup work.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse the appropriate palette material. Each pair provides a separate centered transform.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller's parent becomes the owner when the cylinder is attached.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states the local endpoint and radius units and the distinct-point precondition.
 * @evidence contracts/development/composition.md#screenplay-realization This primitive draws continuing scenery and nonfunctional prop details.
 * @evidence contracts/development/composition.md#composition-only It consumes only local coordinates and palette. Scene time remains with the caller.
 * @evidence contracts/development/composition.md#living-scene The surface remains attached to its parent through scenic layout or prop movement.
 */
export function rod(
  p: THREE.Object3D,
  c: number,
  a: readonly number[],
  b: readonly number[],
  r: number,
) {
  const u = new THREE.Vector3(...a),
    v = new THREE.Vector3(...b),
    d = v.clone().sub(u);
  const o = mesh(p, new THREE.CylinderGeometry(r, r, d.length(), 8), c);
  o.position.copy(u).lerp(v, 0.5);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return o;
}
