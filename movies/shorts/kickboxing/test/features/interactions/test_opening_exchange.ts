import assert from "node:assert/strict";
import { defend } from "@automovie/motions";
import * as THREE from "three";
import { openingCase } from "../../../src/composition/scenes/catalog/opening/openingCase";
import { Referee } from "../../../src/entities/cast/referee/Referee";
import { getFighter } from "../../helpers/getFighter";

/**
 * The opening plans as one native performance with the two actual opponents
 * and official. The shared touch precedes the opening attack, output frames
 * around its native phase events sample without a refusal, and Owen projects
 * left of Marek in the commissioned opening camera. Actual geometric hits
 * must meet the screenplay's named guards and shin, and forced defences must
 * report no unmet outcome. Pictures remain a separate check. Timing separates preparation, native resolution and
 * reads rather than attributing the whole run to an unspecified engine.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the shared native performance, temporal requirement and observation limits.
 * @evidence contracts/development/testing.md#behavioral-verification Mounts the actual case, reads frames around native events, checks actual geometric hit bones and native outcome warnings, and projects the real opening cast roots through its camera.
 * @evidence contracts/development/testing.md#independent-expectations The adopted screenplay puts the touch before the first jab, names Owen's left glove, closed high guard, checking left shin and counter to Marek's left glove, and includes all three participants; no expected pose is copied from output.
 * @evidence contracts/development/testing.md#distinguishing-cases Both mutual roles, attacking and defending roles, low-kick reaction, counter and independently moving official share one schedule.
 * @evidence contracts/development/testing.md#execution-ownership In-memory native composition and Three projection only; owned drawings are retired in finally. No browser, global mutation, dynamic simulation or whole-case physical report.
 */
export function test_opening_exchange(): void {
  const start = performance.now();
  const owen = getFighter("owen");
  const marek = getFighter("marek");
  const daniel = new Referee();
  const prepared = performance.now();
  console.info(`OPENING_PHASE prepared ${prepared - start} ms`);
  const mounted = openingCase(owen, marek, daniel, "kickboxing/catalog");
  const resolved = performance.now();
  console.info(`OPENING_PHASE mounted ${resolved - prepared} ms`);
  const failures: string[] = [];
  try {
    const motion = mounted.motion;
    assert.deepEqual(motion.performers.map(person => person.subject), ["owen", "marek", "daniel"]);
    const entries = motion.performers.flatMap(person => motion.segments(person.subject).map(segment => ({
      subject: person.subject, id: segment.id, actionIndex: segment.entry, name: segment.name,
      from: segment.start - mounted.preparation, to: segment.end - mounted.preparation,
      events: segment.plan.events.map(event => ({ name: event.name, at: segment.start + event.share * segment.plan.duration - mounted.preparation })),
    })));
    const touch = entries.find(entry => entry.subject === "marek" && entry.name === "highFive");
    const jab = entries.find(entry => entry.id === "opening-jab");
    assert.ok(touch !== undefined && jab !== undefined);
    if (touch.to > jab.from) failures.push("The first jab precedes the shared touch's release");
    mounted.seek(0);
    mounted.camera.updateProjectionMatrix();
    const project = (subject: string): THREE.Vector3 => {
      const root = motion.posture(subject, mounted.preparation).root;
      return new THREE.Vector3(root.x, root.y + owen.body.measure.stature / 2, root.z).project(mounted.camera);
    };
    if (!(project("owen").x < project("marek").x)) failures.push("Owen must open screen left of Marek");
    for (const entry of entries)
      for (const event of entry.events)
        if (event.at >= 0 && event.at <= 6)
          for (const offset of [-1 / 30, 0, 1 / 30])
            try {
              const at = Math.max(0, event.at + offset) + mounted.preparation;
              assert.ok(Object.values(motion.pose(entry.subject, at)).length > 0);
            } catch (error) { failures.push(`${entry.id}/${event.name}: ${String(error)}`); }
    const hits = motion.hits().map(hit => ({ id: hit.id, actionIndex: hit.actionIndex, actor: hit.actor, target: hit.target, at: hit.time - mounted.preparation, bone: hit.bone, region: hit.region, point: hit.point, source: hit.source }));
    // One strike may have several limb-contact episodes. Attribute them by
    // the native schedule entry instead of treating every episode as a blow.
    const contactsOf = (id: string): typeof hits => {
      const action = entries.find(entry => entry.id === id);
      assert.ok(action, `Missing native strike ${id}`);
      const contacts = hits.filter(hit => hit.actionIndex === action.actionIndex).sort((a, b) => a.at - b.at);
      if (!contacts.length) failures.push(`${id}: no geometric contact`);
      return contacts;
    };
    const jabHits = contactsOf("opening-jab");
    const crossHits = contactsOf("opening-cross");
    const checkHits = contactsOf("opening-low");
    const counterHits = contactsOf("opening-counter");
    const guardBones = ["leftHand", "rightHand", "leftLowerArm", "rightLowerArm"];
    if (jabHits[0]?.bone !== "leftHand") failures.push(`The first jab must meet Owen's left glove, got ${jabHits[0]?.bone}`);
    if (jabHits.some(hit => !guardBones.includes(hit.bone ?? ""))) failures.push("The jab passes through the high guard");
    if (crossHits.some(hit => !guardBones.includes(hit.bone ?? ""))) failures.push("The cross must meet only the closed high guard");
    if (checkHits[0]?.bone !== "leftLowerLeg") failures.push(`The low kick must meet the checking left shin, got ${checkHits[0]?.bone}`);
    if (counterHits[0]?.bone !== "leftHand") failures.push("The counter must meet Marek's left glove");
    const decisions = motion.segments("owen").filter(segment => segment.name === "defend").map(segment => defend.decision(segment.plan));
    for (const [index, decision] of decisions.entries())
      if (decision === undefined || decision.warnings.length > 0) failures.push(`Defence ${index} has an unmet forced outcome: ${decision?.warnings.join("; ") ?? "no decision"}`);
    const check = entries.filter(entry => entry.subject === "owen" && entry.name === "defend").at(-1);
    const checkTime = check?.events.find(event => event.name === "contact")?.at;
    const checkBones = checkTime === undefined ? [] : Array.from(motion.bones("owen", checkTime + mounted.preparation)).filter(([name]) => /(?:UpperLeg|LowerLeg|Foot)$/.test(name)).map(([name, bone]) => ({ name, point: bone.worldPosition }));
    console.info("OPENING_TIMING " + JSON.stringify({ prepareMs: prepared - start, mountMs: resolved - prepared, readMs: performance.now() - resolved, entries, hits, decisions, checkTime, checkBones }));
  } finally { mounted.dispose(); }
  assert.deepEqual(failures, [], failures.join("\n"));
}
