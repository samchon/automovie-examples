import { AutoMovieComposition } from "@automovie/engine";
import { HumanChain, give } from "@automovie/motions";

import type { Fighter } from "../../entities/cast/fighter/Fighter";
import type { Referee } from "../../entities/cast/referee/Referee";
import type { Ring } from "../../entities/sets/ring/Ring";

/**
 * The parried probe, guarded counter and intercepted westward exit in
 * p01-b03. Both opponents retain their preceding state. This relation
 * selects targets and partner timing; the installed vocabulary moves them.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the source beat, continuing entry and native motion ownership.
 * @evidence contracts/development/design.md#principled-representation Immutable cast/set references produce a native graph of the decided exchange.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One compose port joins the preceding retreat through its native anchor.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No pose, root path, contact response or alternate action law is implemented here.
 */
export class ExitClosed {
  /** Retain the same participants and ring used in the preceding exchange. */
  public constructor(
    private readonly owen: Fighter,
    private readonly marek: Fighter,
    private readonly daniel: Referee,
    private readonly ring: Ring,
  ) {}

  /**
   * Compose the local escape attempt and its failure. The lead-foot exit
   * begins with native lateral footwork; Marek crosses from the interior,
   * and the roll defeats his hook before the low kick reaches the thigh.
   * Actual contact, support, route and pictures remain case requirements.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States actions, participant relations and the unaccepted measurement boundary.
   * @evidence contracts/development/implementation.md#principled-implementation Uses native parry, punch, step, roll, kick, flinch, guard and official walking, with attack anchors and admitted impact cuts.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Place the probe, counter, interception, receiving response and official in dependency order.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Keeps all native reach/cut refusals and geometric contacts; no invented joint, force, collision receipt or scripted fall.
   * @evidence contracts/development/implementation.md#efficient-algorithms Builds one bounded graph without resolving motion, seeking or running an audit.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work Each call builds records for its owning performance from the same immutable entity capabilities.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns native input records with no external handles or mutable stage cache.
   * @evidence contracts/development/behaviors.md#studied-laws Installed laws own parry hand choice, roll clearance, step length, strike and reflex timing; the screenplay decides the blocked counter, missed hook and clean low kick.
   * @evidence contracts/development/behaviors.md#relational-goals Every strike addresses an actual counterpart region and every defence its attack. Native lateral/forward footwork closes the route; tests and stills must verify the promised interception and target contacts.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation Native action anchors own all response timing and the enclosing performance supplies its only seed and entry state.
   * @evidence docs/research/kickboxing/competitive-exchanges.md Competitive-example and support-and-limits: pressure can solve an attempted exit, and contact must carry into guarded supported replacement rather than a reset.
   */
  public compose(): AutoMovieComposition {
    const Receiver: HumanChain.IExtension<{ give: typeof give }> = HumanChain.extend({ give });
    const probe = this.marek.chain()
      .punch({ technique: "straight", hand: "lead", at: { kind: "person", subject: this.owen.subject, region: "nose" } }, "exit-probe");
    const counter = this.owen.chain()
      .defend({ kind: "parry", against: "exit-probe", outcome: "inTime" })
      .sync({ of: "exit-probe", event: "launch" })
      .punch({ technique: "straight", hand: "lead", at: { kind: "person", subject: this.marek.subject, region: "handBackRight" } }, "exit-jab")
      .until({ event: "impact" })
      .sync({ of: "exit-probe", event: "recovered" })
      .punch({ technique: "straight", hand: "rear", at: { kind: "person", subject: this.marek.subject, region: "forearmLeft" } }, "exit-cross")
      .step({ direction: "left" }, "exit-lead-step")
      .until({ share: 0.5 });
    const interception = this.marek.chain()
      .defend({ kind: "cover", against: "exit-jab", outcome: "inTime" })
      .sync({ of: "exit-jab", event: "launch" })
      .defend({ kind: "cover", against: "exit-cross", outcome: "inTime" })
      .sync({ of: "exit-cross", event: "launch" })
      .step({ direction: "right" })
      .until({ share: 0.5 })
      .punch({ technique: "hook", hand: "lead", at: { kind: "person", subject: this.owen.subject, region: "jawRight" } }, "exit-hook")
      .kick({ technique: "round", leg: "rear", at: { kind: "person", subject: this.owen.subject, region: "thighOuterLeft" } }, "exit-low")
      .guard({ seconds: 2, facing: { kind: "person", subject: this.owen.subject, region: "sternum" } });
    const receiver = Receiver.subject(this.owen.subject)
      .defend({ kind: "roll", against: "exit-hook", outcome: "inTime" })
      .sync({ of: "exit-hook", event: "launch" })
      .give({ part: "trunk", from: { kind: "person", subject: this.marek.subject, region: "footTopRight" } }, "exit-thigh-reaction")
      .until({ event: "stroke" })
      .sync({ of: "exit-low", event: "impact" })
      .guard({ seconds: 2, facing: { kind: "person", subject: this.marek.subject, region: "sternum" } }, "exit-recovered");
    const official = this.daniel.chain()
      .walk({ to: this.ring.zones.northwest })
      .stand({ seconds: 5 });
    return AutoMovieComposition.parallel(probe, counter, interception, receiver, official);
  }
}
