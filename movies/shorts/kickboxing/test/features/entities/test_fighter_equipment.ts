import { createBoxingGlove } from "@automovie/archetypes";
import { validatePhysicalProfile } from "@automovie/engine";
import { HumanHand, HumanPerformance } from "@automovie/motions";
import assert from "node:assert/strict";
import * as THREE from "three";

import { getFighter } from "../../helpers/getFighter";

/**
 * The equipped motion body's striking surface must be the visible glove's
 * actual face, on both hands and both cast variants, in entry and guard.
 * This checks equipment wiring, not an exchange's impact or visual quality.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States cast, hands, two poses and the contact-acceptance limit.
 * @evidence contracts/development/testing.md#behavioral-verification Reads the actual drawing's world face and compares it with the native hand effector; also runs the engine's complete profile admission on the equipped body.
 * @evidence contracts/development/testing.md#independent-expectations A worn glove's striking face, independently obtained from the installed archetype's face affordance, is the surface that must meet a target; no expected joint pose or attachment coefficient is copied.
 * @evidence contracts/development/testing.md#distinguishing-cases Both hands and cast identities, before and after guard articulation, detect a rest-only, one-hand, reflection or bare-fist socket mismatch.
 * @evidence contracts/development/testing.md#execution-ownership In-memory native guard, Three transforms and profile validation; drawings retire in finally, without a browser, dynamic simulation or whole-case motion audit.
 */
export function test_fighter_equipment(): void {
  const face = createBoxingGlove({ weight: "10oz" }).affordance("face").frame;
  const failures: string[] = [];
  for (const subject of ["owen", "marek"] as const) {
    const fighter = getFighter(subject);
    const drawing = fighter.drawing();
    try {
      failures.push(...validatePhysicalProfile(fighter.body.profile).map(error => `${subject}: ${error}`));
      const human = new HumanPerformance({ seed: "kickboxing/equipment", performers: [fighter.performer({ x: 0, y: 0, z: 0 }, subject === "owen" ? 90 : -90)], composition: fighter.chain().guard({ seconds: 2, stance: "orthodox" }).node });
      for (const seconds of [0, 2]) {
        drawing.apply(human.pose(subject, seconds));
        drawing.object.updateMatrixWorld(true);
        const bones = human.bones(subject, seconds);
        for (const side of ["left", "right"] as const) {
          const glove = drawing.object.getObjectByName(`glove/${side}`);
          assert.ok(glove);
          const visible = glove.localToWorld(new THREE.Vector3(face.translation.x, face.translation.y, face.translation.z));
          const native = HumanHand.frame(fighter.body, bones, side, "fist", "fist");
          const error = visible.distanceTo(new THREE.Vector3(native.point.x, native.point.y, native.point.z));
          if (error > 1e-6) failures.push(`${subject}/${side}/${seconds}: visible and native faces differ by ${error} m`);
        }
      }
    } catch (error) { failures.push(`${subject}: ${String(error)}`); }
    finally { drawing.dispose(); }
  }
  assert.deepEqual(failures, [], failures.join("\n"));
}
