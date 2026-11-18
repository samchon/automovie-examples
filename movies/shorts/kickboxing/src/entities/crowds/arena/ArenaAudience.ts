import { createSeat, createTable } from "@automovie/archetypes";
import { AutoMovieComposition } from "@automovie/engine";
import { HumanBreath, HumanGaze, HumanPerformance } from "@automovie/motions";
import { buildModel, collectAutoMovieOwnedResources, reportAutoMovieResourceRetirement } from "@automovie/render";
import * as THREE from "three";

import { PersonBody } from "../../cast/person/PersonBody";

/**
 * Coarse seated spectators, two attendants per coloured corner and a grey
 * timekeeper outside the ring. All people reuse the canonical polygon body
 * and native sitting/breathing; the red team rises after the result. Proxy
 * dimensions identify background people without inventing cast biographies.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States background roles, outside placement, native motion and proxy dimensions.
 * @evidence contracts/development/design.md#principled-representation Ring size and floor level determine the outside layout; native person/seat/table producers own every occupied form.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One drawing port supplies the complete background with seek and disposal.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No detailed Human, custom joints, physics loop, voice or fabricated contact report.
 * @evidence contracts/development/entities.md#settings-realization Realizes the seated crowd, four waiting attendants and grey timekeeper in screenplay p01 and their closing response in p12.
 * @evidence contracts/development/entities.md#object-shape Keeps immutable stage dimensions; each drawing owns its native projections independently.
 * @evidence contracts/development/entities.md#controls-and-source Reuses PersonBody and installed archetypes; only the identifying bell and striker use coarse primitives.
 */
export class ArenaAudience {
  /** One native chair definition serves every occupied seat. */
  private readonly seat: ReturnType<typeof createSeat> = createSeat({ id: "arena-chair", kind: "dining" }, "kickboxing/arena");

  /** Immutable coarse roles shared by offline motion preparation and drawing. */
  private readonly people: readonly { role: string; person: PersonBody; celebrates: boolean }[] = [
    { role: "crowd", person: new PersonBody("crowd", 0x3d4656, 1800, 80), celebrates: false },
    { role: "red-team", person: new PersonBody("red-team", 0x8c3730, 1800, 80), celebrates: true },
    { role: "blue-team", person: new PersonBody("blue-team", 0x315778, 1800, 80), celebrates: false },
    { role: "timekeeper", person: new PersonBody("timekeeper", 0x777c83, 1800, 80), celebrates: false },
  ];

  /** Keep the ring's actual size and outside floor elevation, in metres. */
  public constructor(private readonly size: number, private readonly floor: number) {}

  /**
   * Declare native background motion; its caller supplies the result cue and resolves it offline.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Separates expensive native preparation from the drawing port and names the four role performances.
   * @evidence contracts/development/implementation.md#principled-implementation Native sit, rise and raised-hand actions use each role's actual body and the chair's dimensions, with native breath and gaze layers.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Build one chain per role, then return their parallel native input.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No custom posture, relaxed cut, simulation or fabricated contact.
   * @evidence contracts/development/implementation.md#efficient-algorithms Returns a fixed-size graph; its caller resolves one shared performance during offline generation.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work The same role/body definitions drive both native preparation and polygon drawing.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns in-memory native state without a browser, external process or render allocation.
   * @evidence contracts/development/entities.md#settings-realization Prepares seated spectators and teams, a watching timekeeper and the red team's post-result rise.
   * @evidence contracts/development/entities.md#object-shape Leaves logical bodies immutable and returns fresh native input records without executing motion.
   * @evidence contracts/development/entities.md#controls-and-source Existing native laws own the background performance; the SDK's current limitations remain visible.
   */
  public input(): HumanPerformance.IInput {
    const seat: ReturnType<typeof createSeat> = this.seat;
    const chains = this.people.map(prototype => {
      let chain = prototype.person.chain().sit({ seat: { at: { x: 0, y: seat.dimensions.seatHeight!, z: seat.dimensions.seatDepth! / 2 }, yaw: 0, depth: seat.dimensions.seatDepth }, seconds: 1 });
      if (prototype.celebrates) chain = chain.rise().sync({ of: "audience", event: "result" }).gesture({ kind: "raiseHand", side: "left", hold: 12 });
      return chain;
    });
    return {
      seed: "kickboxing/audience",
      performers: this.people.map(prototype => prototype.person.performer({ x: 0, y: 0, z: 0 }, 0)),
      composition: AutoMovieComposition.parallel(...chains),
      layers: Object.fromEntries(this.people.map(prototype => [prototype.role, [HumanBreath.layer(), HumanGaze.layer([{ from: 0, target: { kind: "point", at: { x: 0, y: 1, z: 4 }, frame: "world" }, with: "head" }])]])),
    };
  }

  /**
   * Mount native seated background people and their coarse occupied objects.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States native prototype reuse, shared picture clock, layout and complete retirement.
   * @evidence contracts/development/implementation.md#principled-implementation Native sitting, rise, cheer, breathing and gaze drive polygon drawings; rigid parent placements put those local performances outside the ropes.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Prepare four native role prototypes, place spectators/teams/timekeeper, add the table and identifying bell, then expose seek and retirement.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No locally animated body, solver, force, sampled voice or alternate human mesh.
   * @evidence contracts/development/implementation.md#efficient-algorithms Each role performance is resolved once and sampled once per frame for its repeated people; chair clones share native geometry.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work All extras reuse the existing canonical PersonBody and four native role performances.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Every person and owned prop resource is registered immediately for disposal; partial mounting failures retire previous allocations.
   * @evidence contracts/development/entities.md#settings-realization Keeps all attendants outside their corners, the timekeeper southeast and the crowd seated; the red attendants rise after168.1.
   * @evidence contracts/development/entities.md#object-shape Returns explicit owned scene state and a pure time-driven seek; logical prototypes remain immutable.
   * @evidence contracts/development/entities.md#controls-and-source Installed polygon, chair, table and motion APIs own the occupied forms; the bell is a coarse identifying prop without a simulated strike.
   */
  public drawing(motion: Pick<HumanPerformance, "pose">, preparation: number = 0): { object: THREE.Group; seek: (seconds: number) => void; dispose: () => void } {
    const object: THREE.Group = new THREE.Group();
    object.name = "arena/audience";
    const retirement: (() => void)[] = [];
    try {
      const chair: ReturnType<typeof buildModel> = buildModel(this.seat);
      const chairResources: ReturnType<typeof collectAutoMovieOwnedResources> = collectAutoMovieOwnedResources(chair.object);
      retirement.push(...chairResources.map(resource => (): void => resource.dispose()));
      const prototypes: typeof this.people = this.people;
      const instances: { prototype: (typeof prototypes)[number]; figure: ReturnType<PersonBody["drawing"]> }[] = [];
      const place = (role: string, x: number, z: number, yaw: number): void => {
        const prototype: (typeof prototypes)[number] | undefined = prototypes.find(candidate => candidate.role === role);
        if (prototype === undefined) throw new Error(`Missing audience role ${role}`);
        const figure: ReturnType<PersonBody["drawing"]> = prototype.person.drawing();
        retirement.push(figure.dispose);
        const placement: THREE.Group = new THREE.Group();
        placement.name = `arena/${role}`;
        placement.position.set(x, this.floor, z);
        placement.rotation.y = yaw * Math.PI / 180;
        placement.add(chair.object.clone(true), figure.object);
        object.add(placement);
        instances.push({ prototype, figure });
      };
      const apron: number = this.size / 2 + 1.4;
      for (let index: number = -2; index <= 2; index++) {
        place("crowd", index * 0.85, -apron - 0.5, 0);
        place("crowd", -apron - 0.5, index * 0.85, 90);
        place("crowd", apron + 0.5, index * 0.85, -90);
      }
      place("red-team", -apron, apron - 0.5, 135);
      place("red-team", -apron + 0.7, apron, 135);
      place("blue-team", apron, -apron + 0.5, -45);
      place("blue-team", apron - 0.7, -apron, -45);
      place("timekeeper", apron + 0.4, apron + 0.4, -135);
      const table: ReturnType<typeof createTable> = createTable({ id: "timekeeper-table", kind: "desk" }, "kickboxing/arena");
      const tableDrawing: ReturnType<typeof buildModel> = buildModel(table);
      const tableResources: ReturnType<typeof collectAutoMovieOwnedResources> = collectAutoMovieOwnedResources(tableDrawing.object);
      retirement.push(...tableResources.map(resource => (): void => resource.dispose()));
      tableDrawing.object.position.set(apron - 0.1, this.floor, apron - 0.1);
      tableDrawing.object.rotation.y = -Math.PI / 4;
      object.add(tableDrawing.object);
      const bellMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: 0xb5984e, roughness: 0.55 });
      const bell: THREE.Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.12, 0.13, 8), bellMaterial);
      bell.position.set(apron - 0.1, this.floor + table.dimensions.height! + 0.065, apron - 0.1);
      const striker: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.025, 0.025), bellMaterial);
      striker.position.set(apron + 0.15, this.floor + table.dimensions.height! + 0.02, apron - 0.1);
      object.add(bell, striker);
      retirement.push(() => { bell.geometry.dispose(); striker.geometry.dispose(); bellMaterial.dispose(); });
      return {
        object,
        seek: (seconds: number): void => {
          const poses = new Map(prototypes.map(prototype => [prototype.role, motion.pose(prototype.person.subject, seconds + preparation)]));
          for (const instance of instances) instance.figure.apply(poses.get(instance.prototype.role)!);
          object.updateMatrixWorld(true);
        },
        dispose: (): void => reportAutoMovieResourceRetirement([...retirement, () => object.clear()]),
      };
    } catch (error) {
      reportAutoMovieResourceRetirement([...retirement, () => object.clear()]);
      throw error;
    }
  }
}
