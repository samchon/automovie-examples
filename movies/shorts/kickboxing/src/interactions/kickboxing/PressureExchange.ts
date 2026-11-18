import { AutoMovieComposition } from "@automovie/engine";
import { HumanChain, give } from "@automovie/motions";

import type { Fighter } from "../../entities/cast/fighter/Fighter";
import type { Referee } from "../../entities/cast/referee/Referee";
import type { Ring } from "../../entities/sets/ring/Ring";

/**
 * Marek's slip and five-punch pressure in p01-b02. This module states the
 * screenplay's targets and responses; native laws retain reach, contacts,
 * timing and all limb motion. Its enclosing case supplies the prior state.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the source beat, five punches, native ownership and continuing entry state.
 * @evidence contracts/development/design.md#principled-representation Immutable opponent references produce one native relational composition.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One composition port is consumed by the continuing opening case.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No replacement action, keyed joint, simulation or manufactured hit receipt.
 */
export class PressureExchange {
  /** Keep the actual opponents; this relation does not instantiate a body. */
  public constructor(
    private readonly owen: Fighter,
    private readonly marek: Fighter,
    private readonly daniel: Referee,
    private readonly ring: Ring,
  ) {}

  /**
   * Compose the answering slip, guarded hook, glancing cross, body feint and
   * high/body/high combination, with Owen's reactions tied to the attacks.
   * This is an unaccepted case until actual contacts and stills agree.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States the complete local exchange, synchronization and unaccepted status.
   * @evidence contracts/development/implementation.md#principled-implementation Composes installed punch, defend, give, footwork and guard actions; combination cuts occur at native impact and receiving-peak instants.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Place Owen's probe, Marek's answer, then Owen's corresponding responses in native walk order.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Native reach, collision and interrupt refusals remain visible; no local movement solver or receipt substitution.
   * @evidence contracts/development/implementation.md#efficient-algorithms Builds one fixed-size graph, without evaluating frames or running physical audits.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work Each call creates input records for one independently owned performance.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns native input records only; no external resources or retained process state.
   * @evidence contracts/development/behaviors.md#studied-laws Installed actions own delivery, recovery, slip, step and receiving-contact timing; give documents its provisional stage-combat sizes. The half-delivery feint and quarter-size head turn read the authored dip and brush, without asserting a measured force or universal ratio. Guard setting uses the native 0.6-second minimum.
   * @evidence contracts/development/behaviors.md#relational-goals Targets name the actual opponent's regions. The slip and guarded punches are declared in time; the glancing head and landed body contacts must be checked on native hit records rather than inferred from the parameters.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation Native anchors join each response to its attack. The enclosing performance supplies the sole seed and preceding entry state; sampling does not advance this graph.
   * @evidence docs/research/kickboxing/competitive-exchanges.md Guarded-counter entries and competitive-example: pressure follows an evasion and the receiver retains a guarded, supported response.
   */
  public compose(): AutoMovieComposition {
    const Receiver: HumanChain.IExtension<{ give: typeof give }> = HumanChain.extend({ give });
    const probe = this.owen.chain()
      .guard({ seconds: 0.6 })
      .punch({ technique: "straight", hand: "lead", at: { kind: "person", subject: this.marek.subject, region: "nose" } }, "pressure-probe");
    const attack = this.marek.chain()
      .defend({ kind: "slip", against: "pressure-probe", outcome: "inTime" })
      .sync({ of: "pressure-probe", event: "launch" })
      .step({ direction: "right", steps: 2 })
      .guard({ seconds: 0.6, facing: { kind: "person", subject: this.owen.subject, region: "sternum" } }, "pressure-angle")
      .punch({ technique: "hook", hand: "lead", at: { kind: "person", subject: this.owen.subject, region: "forearmRight" } }, "pressure-hook")
      .until({ event: "impact" })
      .punch({ technique: "straight", hand: "rear", at: { kind: "person", subject: this.owen.subject, region: "cheekLeft" }, accuracy: "graze" }, "pressure-cross")
      .punch({ technique: "straight", hand: "lead", at: { kind: "person", subject: this.owen.subject, region: "solarPlexus" }, feint: 0.5 }, "pressure-body-feint")
      .punch({ technique: "straight", hand: "lead", at: { kind: "person", subject: this.owen.subject, region: "handBackRight" } }, "pressure-high-jab")
      .until({ event: "impact" })
      .punch({ technique: "straight", hand: "rear", at: { kind: "person", subject: this.owen.subject, region: "solarPlexus" } }, "pressure-body-cross")
      .until({ event: "impact" })
      .punch({ technique: "hook", hand: "lead", at: { kind: "person", subject: this.owen.subject, region: "templeRight" } }, "pressure-high-hook")
      .guard({ seconds: 2, facing: { kind: "person", subject: this.owen.subject, region: "sternum" } });
    const orient = this.owen.chain()
      .guard({ seconds: 0.6, facing: { kind: "person", subject: this.marek.subject, region: "sternum" } })
      .sync({ of: "pressure-angle", event: "start" });
    const response = Receiver.subject(this.owen.subject)
      .defend({ kind: "highBlock", against: "pressure-hook", outcome: "inTime" })
      .sync({ of: "pressure-hook", event: "launch" })
      .give({ part: "head", intensity: 0.25, from: { kind: "person", subject: this.marek.subject, region: "handBackRight" } }, "pressure-head-reaction")
      .sync({ of: "pressure-cross", event: "impact" })
      .defend({ kind: "cover", against: "pressure-high-jab", outcome: "inTime" })
      .sync({ of: "pressure-high-jab", event: "launch" })
      .give({ part: "trunk", from: { kind: "person", subject: this.marek.subject, region: "handBackRight" } }, "pressure-body-reaction")
      .until({ event: "stroke" })
      .sync({ of: "pressure-body-cross", event: "impact" })
      // Receiving contact retains the existing arms. Continue from its
      // admitted peak into guarded footwork instead of erasing the reaction
      // with a second full-body action at the same instant.
      .guard({ seconds: 0.6, facing: { kind: "person", subject: this.marek.subject, region: "sternum" } })
      .step({ direction: "back", steps: 2 })
      .step({ direction: "left" })
      .guard({ seconds: 2, facing: { kind: "person", subject: this.marek.subject, region: "sternum" } }, "pressure-retreat");
    const official = this.daniel.chain()
      .walk({ to: this.ring.zones.northwest })
      .stand({ seconds: 6 });
    return AutoMovieComposition.parallel(probe, attack, orient, response, official);
  }
}
