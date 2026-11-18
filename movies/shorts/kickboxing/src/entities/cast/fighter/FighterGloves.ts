import { createBoxingGlove } from "@automovie/archetypes";
import { combinePhysicalMassProperties, derivePhysicalProfile, primitiveVolume, type IAutoMovieResolvedBone } from "@automovie/engine";
import type { AutoMovieHumanoidBone, IAutoMoviePose } from "@automovie/interface";
import { createHumanBody, HumanHand, poseBones, type IHumanBody } from "@automovie/motions";
import { buildModel, collectAutoMovieOwnedResources, reportAutoMovieResourceRetirement } from "@automovie/render";
import * as THREE from "three";

/**
 * The fighter's coarse pair of gloves, using the installed two-box glove.
 * The producer's default dimensions and 10 oz option are a uniform wardrobe
 * proxy. Its actual wear socket follows each native palm frame. The same
 * two boxes join the hand's existing profile as equipment, with their native
 * mass and inertia; the fist socket moves to the actual padded face. This is
 * geometric contact, without a dynamic solver or measured padding response.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States producer, uniform proxy, socket attachment and the limit on contact claims.
 * @evidence contracts/development/design.md#principled-representation One immutable native model and colour create an owned pair of render projections.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One colour and one drawing port for the fighter's wardrobe; no action or force API is added.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No copied glove geometry, keyed wrist, rescaled body or fake solved contact.
 * @evidence contracts/development/entities.md#settings-realization Realizes the red and blue gloves in docs/body/brief/cast/owen-vale.md#red-corner and docs/body/brief/cast/marek-sokol.md#blue-corner using the installed coarse archetype.
 * @evidence contracts/development/entities.md#object-shape Immutable wardrobe data creates explicitly owned drawables; the native body pose drives their attachment.
 * @evidence contracts/development/entities.md#controls-and-source One installed MIT-licensed glove definition serves both hands and cast colours, without generated assets or detailed skin.
 */
export class FighterGloves {
  /** Native dimensions and socket, identical for the two hands. */
  private readonly model: ReturnType<typeof createBoxingGlove> = createBoxingGlove({ weight: "10oz" });

  /** Adopt the cast's glove colour. */
  public constructor(private readonly colour: number) {}

  /**
   * Add the actual coarse gloves to the existing canonical hand segments.
   * Native profile derivation and mass aggregation own the solids and inertia.
   * The original palm socket remains inside the glove; the outer fist and
   * hand-back surfaces are what the native actions now reach and collide with.
   * No skeleton, joint range or bare-body mass is changed. Contact materials
   * inherit the body's geometric proxy and do not establish solved padding.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States equipment, native aggregation, interior mounting socket, exterior contact surfaces and the geometric-only material limit.
   * @evidence contracts/development/implementation.md#principled-implementation Derives colliders and mass from the same native model drawn, transforms them into each existing hand frame and lets createHumanBody prepare the equipped contact body.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Derive one glove, attach it to each hand, aggregate the profile, then retain interior palm sockets and locate the padded fist faces.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No rig, joint, native tolerance or accepted contact is changed; all padding dimensions and mass come from the installed model, not a tuned separation.
   * @evidence contracts/development/implementation.md#efficient-algorithms Linear in the existing profile and two fixed-size equipment models, once per cast entity.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Uses the same placement operation as drawing, and native derivation, aggregation and body preparation instead of implementing physical formulas.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Produces plain body data and owns no render, timer or external resource.
   * @evidence contracts/development/entities.md#settings-realization Adds the commissioned glove pair to the 80 kg fighter; the equipped total also includes the two native 10 oz gloves.
   * @evidence contracts/development/entities.md#object-shape Returns a new equipped profile over the same skeleton; neither the supplied bare body nor its geometry is mutated.
   * @evidence contracts/development/entities.md#controls-and-source Both hands use the installed glove's own solids, face and mass, with existing engine computations.
   */
  public equip(bare: IHumanBody): IHumanBody {
    const volume = this.model.parts.reduce((sum, part) => {
      if (part.geometry.type !== "primitive") throw new Error("The coarse glove must contain primitive solids");
      return sum + primitiveVolume(part.geometry.shape);
    }, 0);
    const gear = derivePhysicalProfile(this.model, {
      density: this.model.properties.mass / volume,
      densities: {},
      material: bare.profile.materials[0]!.id,
      materials: bare.profile.materials,
      provenance: "Native 10 oz two-box glove; uniform coarse density. Body contact material is a geometric proxy, not measured padding response.",
    }).segments[0]!;
    const rest = poseBones(bare, { skeleton: bare.skeleton.id, root: null, joints: [] });
    const placements = new Map<HumanHand.Side, THREE.Matrix4>();
    const segments = bare.profile.segments.map(segment => {
      if (segment.bone !== "leftHand" && segment.bone !== "rightHand") return segment;
      const side = segment.bone === "leftHand" ? "left" : "right";
      const hand = rest.get(segment.bone)!;
      const boneMatrix = new THREE.Matrix4().compose(new THREE.Vector3(hand.worldPosition.x, hand.worldPosition.y, hand.worldPosition.z), new THREE.Quaternion(hand.worldRotation.x, hand.worldRotation.y, hand.worldRotation.z, hand.worldRotation.w), new THREE.Vector3(1, 1, 1));
      const placement = boneMatrix.invert().multiply(this.placement(bare, rest, side));
      placements.set(side, placement);
      const rotation = new THREE.Quaternion().setFromRotationMatrix(placement);
      const centre = new THREE.Vector3(gear.centerOfMass.x, gear.centerOfMass.y, gear.centerOfMass.z).applyMatrix4(placement);
      const principal = rotation.clone().multiply(new THREE.Quaternion(gear.inertiaRotation.x, gear.inertiaRotation.y, gear.inertiaRotation.z, gear.inertiaRotation.w));
      const combined = combinePhysicalMassProperties([segment, { mass: gear.mass, centerOfMass: centre, inertia: gear.inertia, inertiaRotation: principal }]);
      return { ...segment, ...combined, shapes: [...segment.shapes, ...gear.shapes.map(shape => {
        const point = new THREE.Vector3(shape.transform.position.x, shape.transform.position.y, shape.transform.position.z).applyMatrix4(placement);
        const orientation = rotation.clone().multiply(new THREE.Quaternion(shape.transform.rotation.x, shape.transform.rotation.y, shape.transform.rotation.z, shape.transform.rotation.w));
        return { ...shape, transform: { position: { x: point.x, y: point.y, z: point.z }, rotation: { x: orientation.x, y: orientation.y, z: orientation.z, w: orientation.w } } };
      })] };
    });
    const mass = segments.reduce((sum, segment) => sum + segment.mass, 0);
    const centre = new THREE.Vector3();
    for (const segment of segments) {
      const point = new THREE.Vector3(segment.centerOfMass.x, segment.centerOfMass.y, segment.centerOfMass.z).applyQuaternion(new THREE.Quaternion(segment.neutral.rotation.x, segment.neutral.rotation.y, segment.neutral.rotation.z, segment.neutral.rotation.w)).add(new THREE.Vector3(segment.neutral.position.x, segment.neutral.position.y, segment.neutral.position.z));
      centre.addScaledVector(point, segment.mass / mass);
    }
    const equipped = createHumanBody(bare.skeleton, { ...bare.profile, mass, centerOfMass: { x: centre.x, y: centre.y, z: centre.z }, segments, provenance: bare.profile.provenance + " Native 10 oz gloves attached as hand equipment; geometric contact only." });
    for (const side of ["left", "right"] as const) {
      const suffix = side === "left" ? "Left" : "Right";
      equipped.surfaces.sockets[`palm${suffix}`] = bare.surfaces.sockets[`palm${suffix}`];
      const face = this.model.affordance("face").frame;
      const point = new THREE.Vector3(face.translation.x, face.translation.y, face.translation.z).applyMatrix4(placements.get(side)!);
      const orientation = new THREE.Quaternion().setFromRotationMatrix(placements.get(side)!).multiply(new THREE.Quaternion(face.rotation.x, face.rotation.y, face.rotation.z, face.rotation.w));
      const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation);
      // Native fist goals use the palm-facing tangent, not the model's width
      // axis, to keep the existing wrist-orientation convention.
      equipped.surfaces.sockets[`fist${suffix}`] = { bone: `${side}Hand`, point: { x: point.x, y: point.y, z: point.z }, normal: { x: normal.x, y: normal.y, z: normal.z }, forward: bare.surfaces.sockets[`fist${suffix}`].forward };
    }
    return equipped;
  }

  /** Shared rigid wear-socket placement from the actual native palm; used by equipment and drawing without moving a joint. */
  private placement(body: IHumanBody, bones: ReadonlyMap<AutoMovieHumanoidBone, IAutoMovieResolvedBone>, side: HumanHand.Side): THREE.Matrix4 {
    const wear = this.model.affordance("wear").frame;
    const socketRotation = new THREE.Quaternion(wear.rotation.x, wear.rotation.y, wear.rotation.z, wear.rotation.w);
    const palm = HumanHand.frame(body, bones, side, "palm", "fist");
    const fingers = new THREE.Vector3(palm.forward.x, palm.forward.y, palm.forward.z);
    const normal = new THREE.Vector3(palm.normal.x, palm.normal.y, palm.normal.z);
    const across = new THREE.Vector3().crossVectors(fingers, normal).normalize();
    const aligned = HumanHand.align({ normal: new THREE.Vector3(0, 1, 0).applyQuaternion(socketRotation), forward: new THREE.Vector3(1, 0, 0).applyQuaternion(socketRotation) }, { normal: fingers.clone().negate(), forward: across });
    const rotation = new THREE.Quaternion(aligned.x, aligned.y, aligned.z, aligned.w);
    const point = new THREE.Vector3(palm.point.x, palm.point.y, palm.point.z).sub(new THREE.Vector3(wear.translation.x, wear.translation.y, wear.translation.z).applyQuaternion(rotation));
    return new THREE.Matrix4().compose(point, rotation, new THREE.Vector3(1, 1, 1));
  }

  /**
   * Mount the pair on the actual body's native palm frames.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States native palm/socket alignment, explicit draw ownership and the absence of action or contact changes.
   * @evidence contracts/development/implementation.md#principled-implementation Builds the installed glove model, aligns its actual cuff-out socket against the hand's finger direction and translates the socket onto the palm centre.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Prepare socket axes and two models once, then read native bones and place the two rigid attachments per pose.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No hand-keyed joint, guessed wrist offset, alternate anatomy or impulse claim; material colour is the only model decoration.
   * @evidence contracts/development/implementation.md#efficient-algorithms One linear native bone placement per pose and two constant-size socket transforms, without a physical audit or dynamic solver.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Both hands share the same native model definition and socket axes; their mounted resources survive all seeks.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The native resource collector retires both owned models once and detaches the pair.
   * @evidence contracts/development/entities.md#settings-realization Displays each cast's coloured gloves over the same measured hands that perform the choreography; contact acceptance remains a separate observation.
   * @evidence contracts/development/entities.md#object-shape Returns a disposable drawing driven by the caller's native pose; the wardrobe definition and body remain immutable.
   * @evidence contracts/development/entities.md#controls-and-source Uses the installed glove, hand-frame alignment and renderer, with one parameterized implementation for both cast variants.
   */
  public drawing(body: IHumanBody): { object: THREE.Group; apply: (pose: IAutoMoviePose) => void; dispose: () => void } {
    const colour: THREE.Color = new THREE.Color(this.colour);
    const model = { ...this.model, materials: this.model.materials.map(material => ({ ...material, baseColor: { ...material.baseColor, r: colour.r, g: colour.g, b: colour.b } })) };
    const object = new THREE.Group();
    object.name = "wardrobe/gloves";
    const gloves: { side: HumanHand.Side; glove: THREE.Group }[] = [];
    try {
      for (const side of ["left", "right"] as const) {
        const glove = buildModel(model).object;
        glove.name = `glove/${side}`;
        object.add(glove);
        gloves.push({ side, glove });
      }
    } catch (error) {
      reportAutoMovieResourceRetirement(collectAutoMovieOwnedResources(object).map(resource => () => resource.dispose()));
      throw error;
    }
    const resources = collectAutoMovieOwnedResources(object);
    let retired = false;
    let failed = false;
    let failure: unknown;
    return {
      object,
      apply: pose => {
        const bones = poseBones(body, pose);
        for (const { side, glove } of gloves) {
          this.placement(body, bones, side).decompose(glove.position, glove.quaternion, glove.scale);
        }
      },
      dispose: () => {
        if (retired) {
          if (failed) throw failure;
          return;
        }
        retired = true;
        try {
          reportAutoMovieResourceRetirement([
            ...resources.map(resource => () => resource.dispose()),
            () => { object.removeFromParent(); },
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
