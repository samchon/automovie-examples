import { AutoMovieComposition } from "@automovie/engine";
import { HumanChain } from "@automovie/motions";

import type { Fighter } from "../../entities/cast/fighter/Fighter";
import type { Referee } from "../../entities/cast/referee/Referee";
import type { Ring } from "../../entities/sets/ring/Ring";

/**
 * Native kick redirect, downed state, neutral compliance, count and care.
 * The SDK's lateral lie-down passes through a seated/supine route; it cannot
 * yet deliver the manuscript's right-thigh-first collapse. Its crouch/kneel
 * carriers also expose no arm channels, so this edition counts standing
 * with native head pulses while arm gestures remain refused. The original
 * pointing and arm-count inputs are retained behind explicit retry controls.
 * These remain explicit dependency limitations rather than new local laws.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names exact anchors and the two unrepaired native representation gaps.
 * @evidence contracts/development/design.md#principled-representation Retains immutable cast/set roles and returns only installed motion composition.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One composition port for the closing thirty-four seconds.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No manually posed fall, replacement action, voice synthesis or dynamic world.
 */
export class RoundEnding {
  /** Keep the continuing cast and actual set. */
  public constructor(private readonly owen: Fighter, private readonly marek: Fighter, private readonly daniel: Referee, private readonly ring: Ring, private readonly pointing: boolean = false, private readonly armCount: boolean = false) {}

  /**
   * Put the native redirected high kick at 150 and count strokes at 158–167.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States kick, neutral, count, result, celebration and care timing, with known gaps on the class.
   * @evidence contracts/development/implementation.md#principled-implementation Uses the native round-to-round chamber redirect, lateral lie-down, walk, gesture and kneel; cue alignment owns the fixed instants.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Build the finishing pair, corner compliance, official and winner in chronological dependency order.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Preserves native refusals and the locked manuscript; a deficient native fall/count stays a disclosed mismatch.
   * @evidence contracts/development/implementation.md#efficient-algorithms Builds a finite graph; there is no per-frame planning or physical audit.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work The ending is authored once and reused by its film and catalog consumer.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns records without external resources.
   * @evidence contracts/development/behaviors.md#studied-laws The native redirect carries the body-kick cue into the high target; the count and neutral protocol follow the round-practice study.
   * @evidence contracts/development/behaviors.md#relational-goals The kick addresses Marek's left jaw, the counter Owen's left glove, and the neutral walk the ring's southeast landmark with body clearance.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation Native event alignment fixes contact and each count stroke; the enclosing film supplies the only seed.
   * @evidence docs/research/kickboxing/round-practice.md Changing-the-right-kick and fall-and-closing govern the finishing cue, neutral compliance and real-time count; the class discloses what the installed laws cannot express.
   */
  public compose(): AutoMovieComposition {
    const o: Fighter = this.owen;
    const m: Fighter = this.marek;
    const finish: HumanChain = o.chain()
      .guard({ seconds: 0.6, facing: { kind: "person", subject: m.subject, region: "sternum" } })
      .sync({ of: "closing", event: "setup" })
      .kick({ technique: "round", leg: "rear", at: { kind: "person", subject: m.subject, region: "ribsLeft" } }, "finish-body-cue")
      .until({ event: "chamber" })
      .kick({ technique: "round", leg: "rear", at: { kind: "person", subject: m.subject, region: "jawLeft" } }, "finish-high")
      .sync({ of: "closing", event: "contact", align: "impact" })
      .step({ direction: "back" });
    const counter: HumanChain = m.chain()
      .defend({ kind: "elbowBlock", against: "finish-body-cue", outcome: "inTime" })
      .until({ event: "contact" })
      .sync({ of: "finish-body-cue", event: "launch" })
      .punch({ technique: "straight", hand: "rear", at: { kind: "person", subject: o.subject, region: "handBackLeft" } }, "finish-counter");
    const corner: HumanChain = o.chain()
      .walk({ to: { x: this.ring.landmarks.neutralSoutheast.x - o.body.measure.forearm - o.body.measure.hand, y: 0, z: this.ring.landmarks.neutralSoutheast.z - o.body.measure.forearm - o.body.measure.hand }, face: -135, pace: "fast" }, "neutral-walk")
      .sync({ of: "closing", event: "prepare", align: "end" })
      .stand({ seconds: 12 });
    const down: HumanChain = m.chain()
      .lieDown({ position: "lateralRight", hold: 1 }, "finish-down")
      .sync({ of: "closing", event: "contact" });
    let official: HumanChain = this.daniel.chain()
      .walk({ to: this.ring.zones.northwest, face: 90 })
      .sync({ of: "closing", event: "contact" });
    if (this.pointing) official = official
      .gesture({ kind: "point", target: { kind: "person", subject: m.subject, region: "sternum" }, hold: 0.1 }, "down-signal")
      .gesture({ kind: "point", target: { kind: "point", at: this.ring.landmarks.neutralSoutheast, frame: "world" }, hold: 0.2 });
    official = official.stand({ seconds: 0.6 });
    for (let index: number = 0; index < 10; index++) {
      official = official.gesture({ kind: this.armCount ? "stopPalm" : "nod", side: "right", count: 1, effort: { time: 1 } }, `count-${index + 1}`)
        .until({ event: "retract" })
        .sync({ of: "closing", event: "count", index, align: "strokeEnd" });
    }
    official = official
      .gesture({ kind: this.armCount ? "wave" : "shakeHead", count: 1, effort: { time: 1 } }, "result-signal").sync({ of: "closing", event: "result" })
      .kneel({ kind: "one", knee: "right", hold: 12, rise: false });
    const victory: HumanChain = o.chain()
      .gesture({ kind: "cheer", hold: 1 }, "winner-celebration").sync({ of: "closing", event: "celebrate" })
      .walk({ to: this.ring.zones.southeast, pace: "slow" })
      .over(overlay => overlay.gesture({ kind: "cheer", hold: 2 }))
      .gesture({ kind: "cheer", count: 2, hold: 7 });
    return AutoMovieComposition.parallel(finish, counter, down, corner, official, victory);
  }
}
