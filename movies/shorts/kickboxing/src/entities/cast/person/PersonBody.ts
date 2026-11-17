import {
  AutoMovieHumanCanonicalBody,
  AutoMovieHumanHeadAnatomy,
  AutoMovieHumanSex,
  type IAutoMovieHumanHeadIdentity,
  type IAutoMovieHumanParameters,
} from "@automovie/human";
import type { AutoMovieHumanoidBone, IAutoMoviePose, IAutoMovieVector3 } from "@automovie/interface";
import {
  HumanChain,
  createHumanBody,
  type IHumanBody,
  type IHumanPerformer,
} from "@automovie/motions";
import { buildHumanPolygon } from "@automovie/render";
import * as THREE from "three";

/**
 * A coarse canonical person shared by cast entities, with one measured body
 * for vocabulary actions and polygon drawing. Cast entities supply identity,
 * stature in millimetres, mass in kilograms and identification colour.
 * Head inputs use Human's public male survey defaults. The single canonical
 * reflection is applied at drawing, without changing the motion's body.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States units, cast controls, survey head defaults, shared measured body and disposable drawing.
 * @evidence contracts/development/design.md#principled-representation Readonly identity and canonical body with separate performer, chain and drawing projections.
 * @evidence contracts/development/design.md#minimal-and-owned-surface The four cast inputs and existing performer, chain and drawing ports; no action or scene decision is stored.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts Uses installed Human, motion and render contracts without a copied rig, keyed joint or corrective offset.
 * @evidence contracts/development/entities.md#settings-realization Carries the coarse person representation recorded in PROJECT.md#story-and-representation; individual cast entities own commissioned facts and unspecified body proxies.
 * @evidence contracts/development/entities.md#object-shape Immutable preparation creates an explicitly owned render projection; display mutation cannot drive a performance.
 * @evidence contracts/development/entities.md#controls-and-source One installed MIT-licensed canonical Human implementation serves every cast entity without a second detailed skin.
 */
export class PersonBody {
  /** The exact canonical body both the vocabulary and drawing consume. */
  private readonly prepared: AutoMovieHumanCanonicalBody.IBody;

  /** The vocabulary's measured contact body, prepared once per entity. */
  public readonly body: IHumanBody;

  /**
   * Prepare a cast body's coarse representation without a detailed skin.
   *
   * @param subject The screenplay's named person.
   * @param colour The coarse identification colour, RGB hex.
   * @param stature Nominal stature, millimetres.
   * @param mass Body mass, kilograms.
   */
  public constructor(
    public readonly subject: string,
    private readonly colour: number,
    stature: number,
    mass: number,
    equipment?: (bare: IHumanBody) => IHumanBody,
  ) {
    const parameters: IAutoMovieHumanParameters = {
      body: { anatomy: { sex: AutoMovieHumanSex.Male, stature } },
      head: PersonBody.head(stature),
    };
    this.prepared = AutoMovieHumanCanonicalBody.prepare(parameters, {
      id: subject,
      mass,
    });
    const bare = createHumanBody(this.prepared.skeleton, this.prepared.profile);
    this.body = equipment?.(bare) ?? bare;
  }

  /**
   * Place a cast member with the scene's resolved floor point. Elite native
   * proficiency supplies the fighters' commissioned level and the official's
   * low-variance procedural proxy; it changes no story outcome.
   *
   * @param at Starting floor point in canonical world metres.
   * @param yaw Heading in degrees about +Y, zero facing +Z.
   * @returns A vocabulary performer with the same prepared body.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States the placement units, heading convention and returned performer.
   * @evidence contracts/development/implementation.md#principled-implementation Passes the cast's body, placement and elite proficiency to the vocabulary; no pose or action outcome is authored here.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure One immutable input record.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No altered body, offset correction, random draw or inferred contact.
   * @evidence contracts/development/implementation.md#efficient-algorithms Constant work and one record.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work A small placement record; the expensive prepared body is already shared.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns plain input data and retains no consumer state.
   * @evidence contracts/development/entities.md#settings-realization Carries the cast entity's actual body and scene placement with the proficiency recorded here; Fighter owns commissioned values and Referee owns its explicit coarse assumptions.
   * @evidence contracts/development/entities.md#object-shape Returns a fresh input record over the readonly prepared body and caller-owned placement, without changing entity or performance state.
   * @evidence contracts/development/entities.md#controls-and-source Every cast identity uses this port and the installed motion performer contract; no variant body or alternate motion implementation is created.
   */
  public performer(at: IAutoMovieVector3, yaw: number): IHumanPerformer {
    return {
      subject: this.subject,
      body: this.body,
      at,
      yaw,
      proficiency: { level: "elite" },
    };
  }

  /**
   * Start the cast member's immutable vocabulary chain.
   *
   * @returns The typed chain; the caller composes actions and relations.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Identifies the typed subject-chain capability and its consumer.
   * @evidence contracts/development/implementation.md#principled-implementation Delegates to HumanChain.subject with the cast identity.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure One delegation.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Contains no pose, timing, target or outcome override.
   * @evidence contracts/development/implementation.md#efficient-algorithms Constant work.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work The vocabulary owns immutable chain construction.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns the chain and retains no scene state.
   * @evidence contracts/development/entities.md#settings-realization Names the subject from docs/body/brief/cast/owen-vale.md#red-corner or docs/body/brief/cast/marek-sokol.md#blue-corner; their changing actions remain with the scene.
   * @evidence contracts/development/entities.md#object-shape Returns an immutable vocabulary composition entry, with no hidden clock, target or pose state.
   * @evidence contracts/development/entities.md#controls-and-source The same typed chain port serves catalog and film compositions for both fighters.
   */
  public chain(): HumanChain {
    return HumanChain.subject(this.subject);
  }

  /**
   * Locate the native head, hands, pelvis and leg joints for inspection.
   * These are kinematic positions, not forces or simulated receipts. The
   * caller supplies the exact bones its displayed pose uses.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Names the selected joints, supplied world positions and kinematic observation limit.
   * @evidence contracts/development/implementation.md#principled-implementation Maps the native bones' actual world positions into the installed inspection mark format; leg lines join their actual hip, knee and ankle centres.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Read the selected joints, emit their points, then join each leg's three points.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts A missing bone throws; no fabricated physics frame, zero velocity, altered pose or inferred impulse is introduced.
   * @evidence contracts/development/implementation.md#efficient-algorithms A fixed number of map reads and point records; no pose solve, physical report or dynamic simulation runs here.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work The caller supplies the current native bones, already shared with its performance; this conversion retains no cross-frame data.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns plain marks and owns no render or external resource.
   * @evidence contracts/development/entities.md#settings-realization Exposes the actual coarse cast's joints to inspect support, strike and guard readability; it changes no commissioned body or action.
   * @evidence contracts/development/entities.md#object-shape A pure view of caller-supplied native bones leaves entity and performance state immutable.
   * @evidence contracts/development/entities.md#controls-and-source All cast variants use the same native bone names and engine inspection format without another rig.
   */
  public marks(bones: ReadonlyMap<AutoMovieHumanoidBone, Pick<IAutoMovieResolvedBone, "worldPosition">>): IAutoMovieMark[] {
    const names = ["hips", "head", "leftHand", "rightHand", "leftUpperLeg", "leftLowerLeg", "leftFoot", "rightUpperLeg", "rightLowerLeg", "rightFoot"] as const;
    const points = new Map(names.map(name => {
      const bone = bones.get(name);
      if (bone === undefined) throw new Error(`${this.subject}: missing inspection bone ${name}`);
      return [name, bone.worldPosition] as const;
    }));
    const marks: IAutoMovieMark[] = names.map(name => {
      const point = points.get(name)!;
      return { path: `cast/${this.subject}/${name}/joint`, kind: "joint", label: "joint", color: 0xff7eb6, shape: { type: "points", points: [point.x, point.y, point.z] }, flagged: false, anchor: null };
    });
    for (const side of ["left", "right"] as const) {
      const pointsOfLeg = ([`${side}UpperLeg`, `${side}LowerLeg`, `${side}Foot`] as const).flatMap(name => {
        const point = points.get(name)!;
        return [point.x, point.y, point.z];
      });
      marks.push({ path: `cast/${this.subject}/${side}Leg/bone`, kind: "bone", label: "bone", color: 0xc8a24a, shape: { type: "polyline", points: pointsOfLeg, closed: false }, flagged: false, anchor: null });
    }
    return marks;
  }

  /**
   * Create a disposable drawing driven only by canonical performance poses.
   *
   * @returns The actor root, pose port and cleanup for one mounted view.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Documents the separate actor root, complete canonical pose input and disposal boundary.
   * @evidence contracts/development/implementation.md#principled-implementation Draws Human's own display output, applies its published reflection once and sends each requested pose back through the same display and polygon pose port.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Prepare display and palette, wrap the canonical reflection, then return explicit pose and disposal ports.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No replacement anatomy, hand-authored joint transform, motion interpolation or history-dependent evaluation.
   * @evidence contracts/development/implementation.md#efficient-algorithms Construction and each pose are linear in the canonical joint count; geometry is created once per drawing.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work A drawing reuses its polygon geometry and materials across all requested poses.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources dispose releases the polygon drawing and detaches its actor root; mounted film owns when it calls this port.
   * @evidence contracts/development/entities.md#settings-realization Draws the same commissioned body and cast identification colour as the entity; head detail and clothing are not represented by the coarse polygon surface.
   * @evidence contracts/development/entities.md#object-shape The returned projection owns its mutable Three objects explicitly and consumes complete performance poses; it never writes the logical body or plans motion.
   * @evidence contracts/development/entities.md#controls-and-source One Human/renderer definition supplies both colours and all views, with an explicit pose and resource lifetime rather than copied geometry.
   */
  public drawing(): {
    object: THREE.Group;
    apply: (pose: IAutoMoviePose) => void;
    dispose: () => void;
  } {
    const display: ReturnType<typeof AutoMovieHumanCanonicalBody.display> =
      AutoMovieHumanCanonicalBody.display(this.prepared);
    const partColors: Record<string, number> = Object.fromEntries(
      display.bones.map((bone): [string, number] => [bone.bone, this.colour]),
    );
    const drawing: ReturnType<typeof buildHumanPolygon> = buildHumanPolygon(
      display,
      { partColors },
    );
    const object: THREE.Group = new THREE.Group();
    object.name = `cast/${this.subject}`;
    object.matrixAutoUpdate = false;
    object.matrix.fromArray([...AutoMovieHumanCanonicalBody.REFLECTION]);
    object.add(drawing.object);
    return {
      object,
      apply: (pose: IAutoMoviePose): void => {
        drawing.setPose({
          posed: AutoMovieHumanCanonicalBody.display(this.prepared, pose).posed,
        });
      },
      dispose: (): void => {
        drawing.dispose();
        object.removeFromParent();
      },
    };
  }

  /** Required head inputs from Human's published male survey means and lines. */
  private static head(stature: number): IAutoMovieHumanHeadIdentity {
    const source: typeof AutoMovieHumanHeadAnatomy = AutoMovieHumanHeadAnatomy;
    const length: number =
      source.HEAD_LENGTH_ON_STATURE[1].a +
      source.HEAD_LENGTH_ON_STATURE[1].b * stature;
    const breadth: number =
      source.HEAD_BREADTH_ON_STATURE[1].a +
      source.HEAD_BREADTH_ON_STATURE[1].b * stature;
    const eye: IAutoMovieHumanHeadIdentity["face"]["eyePair"]["left"] = {
      palpebralFissureLength: source.FACE.palpebralFissureLength[1],
      palpebralFissureHeight: source.FACE.palpebralFissureHeight[1],
    };
    const ear: IAutoMovieHumanHeadIdentity["earPair"]["left"] = {
      length: source.EAR.length[1],
      breadth: source.EAR.breadth[1],
      protrusion: source.EAR.protrusion[1],
    };
    return {
      length,
      cephalicIndex: (100 * breadth) / length,
      circumference:
        source.HEAD_CIRCUMFERENCE_ON_STATURE[1].a +
        source.HEAD_CIRCUMFERENCE_ON_STATURE[1].b * stature,
      height: stature / source.STATURE_OVER_HEAD_HEIGHT,
      faceHeight: source.FACE.faceHeight[1],
      faceWidth:
        source.FACE_WIDTH_ON_STATURE[1].a +
        source.FACE_WIDTH_ON_STATURE[1].b * stature,
      mandibularWidth: source.FACE.mandibularWidth[1],
      minimumFrontalWidth: source.FACE.minimumFrontalWidth[1],
      mouthOpening: source.FACE.mouthOpening[1],
      mandibularLaterotrusion: source.FACE.mandibularLaterotrusion[1],
      face: {
        eyePair: { left: eye, right: { ...eye } },
        intercanthalWidth: source.FACE.intercanthalWidth[1],
        nose: {
          width: source.FACE.noseWidth[1],
          height: source.FACE.noseHeight[1],
          protrusion: source.FACE.noseProtrusion[1],
        },
        mouth: {
          width: source.FACE.mouthWidth[1],
          upperVermilionHeight: source.FACE.upperVermilionHeight[1],
          lowerVermilionHeight: source.FACE.lowerVermilionHeight[1],
        },
      },
      earPair: { left: ear, right: { ...ear } },
    };
  }
}
import type { IAutoMovieMark, IAutoMovieResolvedBone } from "@automovie/engine";
