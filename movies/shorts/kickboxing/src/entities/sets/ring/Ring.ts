import { createRing } from "@automovie/archetypes";
import type { IAutoMovieMaterial, IAutoMovieVector3 } from "@automovie/interface";
import {
  buildModel,
  collectAutoMovieOwnedResources,
  reportAutoMovieResourceRetirement,
} from "@automovie/render";
import * as THREE from "three";

/**
 * The commissioned square ring, with its canvas as the motion world's floor.
 *
 * `new Ring(seed).landmarks.red` identifies the southwest rope corner; an
 * interaction derives a fighter's clearance from that boundary and the body.
 * The production's right-handed map is +X east, +Y up and -Z north, so a
 * camera south of the action sees west on screen left. Producer affordance
 * ids retain the producer's local names; these story landmarks own geography.
 * These landmarks describe the set, not a movement or a final actor position.
 * The installed archetype owns the platform, ropes, dimensions and contacts.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Documents canvas-zero placement, geometric landmarks, their orientation and the archetype's ownership.
 * @evidence contracts/development/design.md#principled-representation Holds one typed archetype and immutable set landmarks; drawing is a disposable projection of that same model.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Exposes the model, its canvas placement, size, landmarks and drawing; no action or actor position is planned here.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts Uses the installed ring producer without copied ring geometry or a hidden scale correction.
 * @evidence contracts/development/entities.md#settings-realization Realizes docs/body/screenplay/kickboxing/010-the-round.md#p01: square canvas, southwest red, northeast blue and the two neutral corners. Its dimensions and affordances come from the installed ring's cited manufacturer guide.
 * @evidence contracts/development/entities.md#object-shape Readonly model and frozen landmarks describe the set; interactions own actor clearances, destinations and timing. Drawing mutations are explicit view state.
 * @evidence contracts/development/entities.md#controls-and-source One seeded MIT-licensed archetype supplies all uses and the coarse form; no independent detailed geometry is created.
 */
export class Ring {
  /** The installed producer's model and physical affordances. */
  public readonly model: ReturnType<typeof createRing>;

  /** The model's placement that brings its actual canvas to world Y zero. */
  public readonly origin: Readonly<IAutoMovieVector3>;

  /** The inside square's width, metres. */
  public readonly size: number;

  /** Rope-boundary landmarks, never a substitute for body clearance. */
  public readonly landmarks: Readonly<
    Record<
      "centre" | "red" | "blue" | "neutralNorthwest" | "neutralSoutheast",
      Readonly<IAutoMovieVector3>
    >
  >;

  /** Quadrant centres for named staging destinations, in canonical metres. */
  public readonly zones: Readonly<Record<"northwest" | "northeast" | "southwest" | "southeast", Readonly<IAutoMovieVector3>>>;

  /** Prepare the official archetype using the film's reproducible seed. */
  public constructor(seed: string) {
    this.model = createRing({ id: "championship-ring" }, seed);
    const size: number | undefined = this.model.dimensions.size;
    const platform: number | undefined = this.model.dimensions.platform;
    if (size === undefined || platform === undefined)
      throw new Error("The ring producer did not declare its canvas dimensions");
    this.size = size;
    this.origin = Object.freeze({ x: 0, y: -platform, z: 0 });
    const half: number = size / 2;
    this.landmarks = Object.freeze({
      centre: Object.freeze({ x: 0, y: 0, z: 0 }),
      red: Object.freeze({ x: -half, y: 0, z: half }),
      blue: Object.freeze({ x: half, y: 0, z: -half }),
      neutralNorthwest: Object.freeze({ x: -half, y: 0, z: -half }),
      neutralSoutheast: Object.freeze({ x: half, y: 0, z: half }),
    });
    this.zones = Object.freeze({
      northwest: Object.freeze({ x: -half / 2, y: 0, z: -half / 2 }),
      northeast: Object.freeze({ x: half / 2, y: 0, z: -half / 2 }),
      southwest: Object.freeze({ x: -half / 2, y: 0, z: half / 2 }),
      southeast: Object.freeze({ x: half / 2, y: 0, z: half / 2 }),
    });
  }

  /**
   * Mount the actual archetype at the declared canvas-zero placement.
   *
   * @returns The render root and once-only synchronous resource retirement.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Documents model placement and the owned disposal port.
   * @evidence contracts/development/implementation.md#principled-implementation Delegates model construction and unique resource collection to the renderer, places its canvas at zero and colours the native posts to match the declared corner identities.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Colour the four declared post materials in the model record, build and place it, then return the shared retirement closure.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No re-created ring parts, body motion, actor offset or replacement collision data.
   * @evidence contracts/development/implementation.md#efficient-algorithms One model build and one linear traversal of its unique render resources per mount.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work The mounted model is static and serves every frame; its owner retires each synchronous resource once and repeats the original failure on later disposal.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Colour definitions are plain model data before construction. Retirement disposes every actual native resource once and detaches the root, preserving failure through the renderer's coordinator.
   * @evidence contracts/development/entities.md#settings-realization Draws the square ring of docs/body/screenplay/kickboxing/010-the-round.md#p01 using the same archetype and canvas-zero placement as its set landmarks.
   * @evidence contracts/development/entities.md#object-shape Exposes an owned render projection and retirement port; no actor position or action is selected and the logical set stays unchanged.
   * @evidence contracts/development/entities.md#controls-and-source Every mounted use comes from the same seeded archetype and installed renderer; no independent model or detail variant is introduced.
   */
  public drawing(): { object: THREE.Group; dispose: () => void } {
    const colours: ReadonlyMap<string, number> = new Map([
      ["corner1Post", 0xe5e6eb],
      ["corner2Post", 0xb94439],
      ["corner3Post", 0xe5e6eb],
      ["corner4Post", 0x2d72aa],
    ]);
    // Keep the producer's geometry and contacts; its four silver posts need
    // actual identification colours rather than logical corner names alone.
    const missing: Set<string> = new Set(colours.keys());
    const materials: Map<string, IAutoMovieMaterial> = new Map(this.model.materials.map(material => [material.id, material]));
    const parts = this.model.parts.map(part => {
      const colour: number | undefined = colours.get(part.id);
      if (colour === undefined) return part;
      missing.delete(part.id);
      const source: IAutoMovieMaterial | undefined = part.material === null ? undefined : materials.get(part.material);
      if (source === undefined) throw new Error(`The ring producer did not declare the material of ${part.id}`);
      const rgb: THREE.Color = new THREE.Color(colour);
      const id: string = `${source.id}/${rgb.getHexString()}`;
      if (!materials.has(id)) materials.set(id, { ...source, id, baseColor: { ...source.baseColor, r: rgb.r, g: rgb.g, b: rgb.b } });
      return { ...part, material: id };
    });
    if (missing.size > 0) throw new Error(`The ring producer did not declare its posts: ${[...missing].join(", ")}`);
    const drawing: ReturnType<typeof buildModel> = buildModel({ ...this.model, parts, materials: [...materials.values()] });
    drawing.object.name = "set/ring";
    drawing.object.position.set(this.origin.x, this.origin.y, this.origin.z);
    const resources: ReturnType<typeof collectAutoMovieOwnedResources> = collectAutoMovieOwnedResources(drawing.object);
    let retired: boolean = false;
    let failed: boolean = false;
    let failure: unknown;
    return {
      object: drawing.object,
      dispose: (): void => {
        if (retired) {
          if (failed) throw failure;
          return;
        }
        retired = true;
        try {
          reportAutoMovieResourceRetirement([
            ...resources.map((resource): (() => void) => () => resource.dispose()),
            (): void => {
              drawing.object.removeFromParent();
            },
          ]);
        } catch (error) {
          failed = true;
          failure = error;
          throw error;
        }
      },
    };
  }
}
