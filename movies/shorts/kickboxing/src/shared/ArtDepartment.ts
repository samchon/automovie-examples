import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Owns the materials and geometries used by one created film scene. Consumers request colours and shapes in the scene's metre scale, keep per-mesh transforms, and call dispose when the scene is released.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The class comment identifies the allocation scope, geometry scale, request inputs and release point.
 * @evidence contracts/development/design.md#principled-representation Closed primitive names restrict the available silhouettes. The geometry and material maps key their owned values by source shape and paint identity.
 * @evidence contracts/development/design.md#minimal-and-owned-surface The set and cast share the art department for material lookup, primitive placement, lofts, batching and cleanup. The resource set lets those builders register custom production geometries for disposal.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts The interface accepts the actual primitive variants used by the film and ordinary Three.js parent nodes. Each mesh keeps its own transform and no test-only state is present.
 */
export class ArtDepartment {
  private readonly materials = new Map<string, THREE.MeshStandardMaterial>();
  private readonly shapes = new Map<string, THREE.BufferGeometry>();
  readonly built = new Set<THREE.BufferGeometry>();

  /**
   * Returns the shared opaque paint for a Three.js colour string. Treat the returned material as scene-owned.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Names the colour key, paint ownership and shared lifetime.
   * @evidence contracts/development/implementation.md#principled-implementation One rough, flat-shaded standard material per configured colour keeps the polygon visual language consistent.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure A keyed lookup owns paint creation. Mesh builders call it rather than making duplicate paints.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The same paint settings apply to every colour input; lookup has no expected-output exception.
   * @evidence contracts/development/implementation.md#efficient-algorithms Map lookup is expected constant time, allocating a material only for a new colour.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Identical colour strings in one department share the same material. Separate departments own their own values.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Materials are retained per distinct scene colour and released by dispose.
   */
  material(colour: string): THREE.MeshStandardMaterial {
    let result = this.materials.get(colour);
    if (!result) {
      result = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.86, metalness: 0.025, flatShading: true });
      this.materials.set(colour, result);
    }
    return result;
  }

  /**
   * Attaches a primitive with parent-local metre position and size. Each mesh may be posed independently while its immutable geometry and paint are shared.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Specifies local frame, dimensions, mutation and shared resource ownership.
   * @evidence contracts/development/implementation.md#principled-implementation Unit primitive geometry gives width, height and depth through the per-mesh scale. Closed shape variants define the available costume and set silhouettes.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Geometry creation and material lookup precede the per-instance transforms in the owning helper.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Each shape chooses one normalized geometry and uses the supplied transform uniformly.
   * @evidence contracts/development/implementation.md#efficient-algorithms The five geometries have bounded vertex budgets and are made once per department. Following calls only allocate one mesh and update its transform.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Shape keys within the department reuse geometry; material keys reuse the department paint. Instance transforms are independently mutable.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The department retains at most five base geometries. The scene owns each attached mesh and its department releases the geometry and paint.
   */
  form(shape: "box" | "round" | "tube" | "flat" | "crowd", colour: string, at: readonly number[], size: readonly number[], parent: THREE.Object3D): THREE.Mesh {
    let geometry = this.shapes.get(shape);
    if (!geometry) {
      geometry = shape === "box" ? new THREE.BoxGeometry(1, 1, 1)
        : shape === "tube" ? new THREE.CylinderGeometry(0.5, 0.5, 1, 12)
        : shape === "flat" ? new THREE.CylinderGeometry(0.43, 0.5, 1, 10)
        : shape === "crowd" ? new THREE.SphereGeometry(0.5, 8, 5)
        : new THREE.SphereGeometry(0.5, 14, 10);
      this.shapes.set(shape, geometry);
    }
    const m = new THREE.Mesh(geometry, this.material(colour));
    m.position.set(at[0]!, at[1]!, at[2]!);
    m.scale.set(size[0]!, size[1]!, size[2]!);
    parent.add(m);
    return m;
  }

  /**
   * Joins adjacent elliptical sections into an open-ended rigid band. The ordered section coordinates are parent-local height, half-width, half-depth and forward centre in metres. Use at least three sides and two ordered sections. The default is 16 sides.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Explains ordered tuple fields, local units, open ends, minimum inputs and default tessellation.
   * @evidence contracts/development/implementation.md#principled-implementation Each station samples an ellipse in a plane perpendicular to local vertical. Matching indices between neighbouring stations give the band and computed normals.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure One loop makes station vertices and the next joins adjacent rings. Material and placement use the same scene owner as primitives.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Uniform angular sampling applies to the supplied sections. The film's part shapes are those inputs.
   * @evidence contracts/development/implementation.md#efficient-algorithms Work and storage are proportional to sections times sides. The indexed mesh shares vertices across adjacent faces.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work The band is created once per authored piece and reused when its rigid parent poses. Its paint is shared by colour.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The attached band remains in the scene and its geometry is registered for art department disposal.
   */
  loft(parent: THREE.Object3D, colour: string, sections: readonly (readonly [number, number, number, number])[], sides = 16): THREE.Mesh {
    const vertices: number[] = [], indices: number[] = [];
    for (const [y, width, depth, centre] of sections) {
      for (let j = 0; j < sides; j++) {
        const a = j / sides * Math.PI * 2;
        vertices.push(Math.sin(a) * width, y, centre + Math.cos(a) * depth);
      }
    }
    for (let k = 0; k + 1 < sections.length; k++) for (let j = 0; j < sides; j++) {
      const a = k * sides + j, b = k * sides + (j + 1) % sides;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices); geo.computeVertexNormals(); this.built.add(geo);
    const mesh = new THREE.Mesh(geo, this.material(colour));
    parent.add(mesh); return mesh;
  }

  /**
   * Replaces a group's direct single-material mesh children with batches in the same local coordinates. Pass a rigid, invertible group whose batch candidates share compatible static attributes. Unmerged children keep their scene attachment.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Declares the scene mutation, owner frame and geometry compatibility precondition.
   * @evidence contracts/development/implementation.md#principled-implementation Root-inverse times child-world maps candidate vertices into the common local frame. Compatible geometry is merged by the identity of its material.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Collect translated geometry by material, detach replaced meshes, then publish each merged batch.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The grouping follows transforms and material identities of the actual scene. Authored moving joints remain independent roots.
   * @evidence contracts/development/implementation.md#efficient-algorithms Work is proportional to mesh children and their expanded vertex count. The operation is performed once during scene construction.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Each merged batch replaces equivalent immutable child meshes and persists for the scene's lifetime.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Temporary geometries are disposed after a successful merge. An incompatible merge throws after detaching candidates and leaves temporary geometries from the failed or unvisited batches for collection. The department retains successful merged geometry for explicit disposal.
   */
  batch(root: THREE.Object3D): void {
    root.updateMatrixWorld(true);
    const inverse = root.matrixWorld.clone().invert();
    const groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
    const retired: THREE.Mesh[] = [];
    for (const node of [...root.children]) {
      if (!(node instanceof THREE.Mesh) || Array.isArray(node.material)) continue;
      const geo = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
      geo.deleteAttribute("uv");
      geo.applyMatrix4(inverse.clone().multiply(node.matrixWorld));
      const list = groups.get(node.material) ?? [];
      list.push(geo); groups.set(node.material, list); retired.push(node);
    }
    for (const mesh of retired) mesh.removeFromParent();
    for (const [material, list] of groups) {
      const geometry = mergeGeometries(list);
      if (!geometry) throw Error("Set geometry has incompatible attributes.");
      this.built.add(geometry); root.add(new THREE.Mesh(geometry, material));
      for (const old of list) old.dispose();
    }
  }

  /**
   * Releases this department's primitive, custom and merged geometries and its materials. The scene owner must stop drawing it before disposal.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Explains release ownership and when the caller may release resources.
   * @evidence contracts/development/implementation.md#principled-implementation Uses Three.js disposal on each stored geometry and material so the renderer can free shared GPU resources.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure The owner walks its geometry collections and then the paint collection. Scene graph cleanup remains with the scene owner.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Every owned resource follows the same disposal path, keyed by resource identity.
   * @evidence contracts/development/implementation.md#efficient-algorithms One linear traversal over the set and map entries is required for explicit release.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Shared paint and primitive entries are each called once in an owner's disposal traversal.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources GPU resource release is explicit here. The discarded scene closure and department become eligible for collection together.
   */
  dispose(): void {
    for (const geometry of [...this.shapes.values(), ...this.built]) geometry.dispose();
    for (const material of this.materials.values()) material.dispose();
  }
}
