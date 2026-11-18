import { reportAutoMovieResourceRetirement } from "@automovie/render";
import * as THREE from "three";

import { PersonBody } from "../person/PersonBody";
import { FighterGloves } from "./FighterGloves";

/**
 * One commissioned elite fighter, using the common coarse polygon person.
 * Both variants keep the nominal 1800 mm body and 80 kg mass. Red and blue
 * identify them during blocking; the same colours reach their coarse gloves.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States identities, commissioned dimensions and coarse identification.
 * @evidence contracts/development/design.md#principled-representation A cast specialization of the single canonical person, with no second rig or motion path.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Selects fighter identity and colour; inherited ports expose its body, performer, chain and drawing.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No pose, geometry correction, relaxed bound or alternate body is introduced.
 * @evidence contracts/development/entities.md#settings-realization Realizes docs/instructions/commission.md#fighters and docs/body/brief/cast/owen-vale.md#red-corner and docs/body/brief/cast/marek-sokol.md#blue-corner with equal male 180 cm, 80 kg bodies and elite performer proficiency.
 * @evidence contracts/development/entities.md#object-shape Readonly identity specializes the shared immutable person; mounted drawing state remains explicitly disposable.
 * @evidence contracts/development/entities.md#controls-and-source Both identities use PersonBody and installed MIT-licensed packages; scene compositions supply their actions.
 */
export class Fighter extends PersonBody {
  /** The native coarse glove pair for this cast colour. */
  private readonly gloves: FighterGloves;

  /** Prepare the named fighter and its coarse identification colour. */
  public constructor(
    public override readonly subject: "owen" | "marek",
    colour: number,
  ) {
    const gloves = new FighterGloves(colour);
    super(subject, colour, 1800, 80, bare => gloves.equip(bare));
    this.gloves = gloves;
  }

  /**
   * Mount the canonical body and its coarse gloves through one pose port.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States the shared pose, native wardrobe and owned body/glove drawing lifetime.
   * @evidence contracts/development/implementation.md#principled-implementation Composes PersonBody drawing and FighterGloves socket attachment without changing the native performance.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Mount both fragments, apply the same pose to each and retire both together.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No joint angle, body offset, dynamic simulation or contact result is authored.
   * @evidence contracts/development/implementation.md#efficient-algorithms Body and glove mounts are reused across seeks; only their pose projections update.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work One definition serves both fighters and all catalog/film consumers.
   * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Native retirement attempts both drawings and detaches their parent; glove allocation failure retires the already created body.
   * @evidence contracts/development/entities.md#settings-realization Combines each commissioned coarse fighter with his coloured gloves; visible padded contact still requires catalog inspection.
   * @evidence contracts/development/entities.md#object-shape Returns explicitly owned view state; the cast's canonical body and native action composition remain immutable.
   * @evidence contracts/development/entities.md#controls-and-source Composes its two owned fragments using the installed renderer, without another body or glove implementation.
   */
  public override drawing(): ReturnType<PersonBody["drawing"]> {
    const figure = super.drawing();
    try {
      const gloves = this.gloves.drawing(this.body);
      const object = new THREE.Group();
      object.name = `cast/${this.subject}`;
      object.add(figure.object, gloves.object);
      return {
        object,
        apply: pose => { figure.apply(pose); gloves.apply(pose); },
        dispose: () => reportAutoMovieResourceRetirement([
          figure.dispose, gloves.dispose, () => { object.removeFromParent(); },
        ]),
      };
    } catch (error) {
      figure.dispose();
      throw error;
    }
  }
}
