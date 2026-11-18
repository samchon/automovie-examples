import { HumanBreath, HumanChain, HumanGaze, HumanMutual, HumanPerformance } from "@automovie/motions";

import { Fighter } from "../../entities/cast/fighter/Fighter";
import { Referee } from "../../entities/cast/referee/Referee";
import { Ring } from "../../entities/sets/ring/Ring";

/**
 * The first beat's approach, mutual lead-fist touch, two guarded punches,
 * checked low kick and counter. Installed actions supply every posture and
 * contact; this relation supplies roles, targets and shared timing only.
 *
 * One second of guard preparation precedes picture time because the locked
 * screenplay opens with both men already in guard. This is a staging entry,
 * not acceptance of the separately reported SDK guard-entry defect. The
 * rehearsal has no dynamic simulation, generated speech or whole-film audit.
 * The same equipped body supplies the visible gloves and native contact
 * surfaces. Their first-beat contact inspection is retained separately.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States roles, actions, entry clock, kinematic mode and shared equipment/contact ownership.
 * @evidence contracts/development/design.md#principled-representation An immutable relation over cast and set entities produces one native composition and performance.
 * @evidence contracts/development/design.md#minimal-and-owned-surface Exposes preparation, the native input for continuity, and a resolve wrapper for the case; native laws own motion and physical response.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No keyed joint, replacement action law, force multiplier or swallowed refusal.
 * The relation realizes p01-b01 through native approach, check, forward
 * replacement and counter; the resolve method answers the behavior contract.
 */
export class OpeningExchange {
  /** Native performance seconds before picture zero; both men are ready at the bell. */
  public readonly preparation: number = 1;

  /** Keep the participants and actual set that the scene mounts. */
  public constructor(
    private readonly owen: Fighter,
    private readonly marek: Fighter,
    private readonly daniel: Referee,
    private readonly ring: Ring,
  ) {}

  /**
   * State the opening roles as native inputs for its case or a continuing scene.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Names the single seed and native preparation, timing and geometry ownership.
   * @evidence contracts/development/implementation.md#principled-implementation Composes installed guard, stance step, mutual fist touch, punches, check and counter with attack and cue synchronization.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Build the two role chains and official's movement, then return their parallel input graph.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Preserves every native refusal and action duration; no body motion or dynamic solver is implemented locally.
   * @evidence contracts/development/implementation.md#efficient-algorithms Builds a fixed-size native input graph; performance resolution belongs to its caller.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work Each call returns a fresh input over the same immutable cast bodies.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns input records and native layer closures, without render objects, timers or external resources.
   * @evidence contracts/development/behaviors.md#studied-laws Native actions own their studied geometry and timing. The checked kick, forward replacement and counter follow the cited range study; staging distances must satisfy the native reach refusal rather than change its bound.
   * @evidence contracts/development/behaviors.md#relational-goals Punches and the low kick target the opponent's named anatomical regions; defenses reference those attacks with the screenplay's in-time outcomes. The mutual fist touch must be within both arms' reach; the case checks actual guard/shin contacts and separate stills inspect the equipped surfaces.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation Resolves once from the cast's entry bodies and film seed; native action events, cancellation tables and shared touch window own phase timing and seeded variation. Frame sampling changes no schedule.
   * @evidence docs/research/kickboxing/competitive-exchanges.md Checking-and-range: a forward replacement after the check restores the counter's distance rather than assuming the kicker stayed in reach.
   */
  public input(seed: string): HumanPerformance.IInput {
    const touch = HumanChain.mutual(HumanMutual.highFive, {
      one: this.owen.chain().guard({ seconds: this.preparation, stance: "orthodox" }).step({ direction: "forward", length: 0.2 }),
      other: this.marek.chain().guard({ seconds: this.preparation, stance: "orthodox" }).step({ direction: "forward", length: 0.2 }),
    }, { kind: "fist", side: "left", window: { from: 1.85, to: 1.95 } }, "opening-touch");
    const owen = this.owen.chain()
      .defend({ kind: "cover", against: "opening-jab", outcome: "inTime" })
      .sync({ of: "opening-jab", event: "launch" })
      .defend({ kind: "cover", against: "opening-cross", outcome: "inTime" })
      .sync({ of: "opening-cross", event: "launch" })
      .defend({ kind: "check", against: "opening-low", outcome: "inTime" })
      .sync({ of: "opening-low", event: "launch" })
      .step({ direction: "forward", length: 0.12 })
      .punch({ technique: "straight", hand: "rear", at: { kind: "person", subject: this.marek.subject, region: "handBackLeft" } }, "opening-counter")
      .sync({ of: "opening-low", event: "replant", offset: 0.2 });
    const marek = this.marek.chain()
      .punch({ technique: "straight", hand: "lead", at: { kind: "person", subject: this.owen.subject, region: "handBackLeft" } }, "opening-jab")
      .until({ event: "impact" })
      .punch({ technique: "straight", hand: "rear", at: { kind: "person", subject: this.owen.subject, region: "jawLeft" } }, "opening-cross")
      .kick({ technique: "round", leg: "rear", at: { kind: "person", subject: this.owen.subject, region: "thighOuterLeft" } }, "opening-low")
      .guard({ seconds: 2, stance: "orthodox" });
    const centre = this.ring.landmarks.centre;
    const daniel = HumanChain.subject(this.daniel.subject)
      .gesture({ kind: "stopPalm" })
      .sync({ of: "opening", event: "bell", align: "strokeEnd" })
      .walk({ to: { x: centre.x + this.ring.size / 5, y: centre.y, z: centre.z - this.ring.size / 4 }, face: 0 })
      .stand({ seconds: 6 });
    return {
      seed,
      performers: [
        this.owen.performer({ x: centre.x - 0.8, y: centre.y, z: centre.z }, 90),
        this.marek.performer({ x: centre.x + 0.8, y: centre.y, z: centre.z }, -90),
        this.daniel.performer({ x: centre.x, y: centre.y, z: centre.z - this.ring.size / 4 }, 0),
      ],
      composition: touch.next(marek.with(owen)).with(daniel).node,
      cues: { opening: [{ name: "bell", seconds: this.preparation }] },
      layers: {
        // Native striking already maintains the fighters' facing. A second
        // mutual gaze adds repeated peer-pose reads during schedule planning.
        owen: [HumanBreath.layer()],
        marek: [HumanBreath.layer()],
        daniel: [HumanBreath.layer(), HumanGaze.layer([{ from: 0, target: { kind: "person", subject: this.owen.subject, region: "sternum" }, with: "head" }])],
      },
    };
  }

  /**
   * Resolve the same opening inputs once for the standalone case.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States that the case resolves the same native input port as the continuing scene.
   * @evidence contracts/development/implementation.md#principled-implementation Delegates unchanged inputs to the installed performance constructor.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure One construction over the input port.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No pose, timing correction, alternate body or swallowed refusal.
   * @evidenceExclude contracts/development/implementation.md#efficient-algorithms Native performance resolution owns the work; this wrapper adds only the input call.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work Each call intentionally creates an independent native performance.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns in-memory native state owned by the mount, without external resources.
   * @evidence contracts/development/behaviors.md#studied-laws The input port composes the studied installed actions.
   * @evidence contracts/development/behaviors.md#relational-goals The input port names both opponents, the official, targets and outcomes.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation The same seed and input graph resolve once through the native vocabulary.
   */
  public resolve(seed: string): HumanPerformance {
    return new HumanPerformance(this.input(seed));
  }
}
