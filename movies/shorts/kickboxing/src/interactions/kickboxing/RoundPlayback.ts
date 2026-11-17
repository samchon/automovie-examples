import { sampleMotion } from "@automovie/engine";
import type { IAutoMoviePose } from "@automovie/interface";
import { poseBones, type HumanPerformance } from "@automovie/motions";

import type { Fighter } from "../../entities/cast/fighter/Fighter";
import type { Referee } from "../../entities/cast/referee/Referee";
import type { INativeRound } from "./INativeRound";

/**
 * Project the native generated clips through the SDK's motion sampler and
 * pose-to-bones owner. This avoids resolving the entire fight in each browser
 * mount while preserving exact native poses on every delivered frame.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States computed clip ownership and delivery-grid equality, without a new solver.
 * @evidence contracts/development/design.md#principled-representation Immutable native clip records and actual cast bodies expose only the existing performance's pose/bones read ports.
 * @evidence contracts/development/design.md#minimal-and-owned-surface The stage consumes pose and bones; no contacts, forces or physical report are fabricated.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts Delegates interpolation and FK to the installed owners; no local joint interpolation or hidden correction.
 */
export class RoundPlayback {
  /** Keep the generated native clips and the corresponding canonical bodies. */
  public constructor(private readonly native: INativeRound, private readonly people: readonly (Fighter | Referee)[]) {}

  /**
   * Sample a generated native pose at delivered picture seconds.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States subject admission and the delivered picture clock.
   * @evidence contracts/development/implementation.md#principled-implementation Delegates native clip sampling to sampleMotion after checking the three principal identities.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Admit the identity and sample its clip.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No local joint interpolation, pose correction or replacement action.
   * @evidence contracts/development/implementation.md#efficient-algorithms The native sampler searches ordered clip keys; this port adds constant lookup work.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses the generated immutable clips for every seek.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns plain pose data and owns no external resources.
   * @evidenceExclude contracts/development/behaviors.md#studied-laws Reads already generated native motion; it defines no practice law.
   * @evidenceExclude contracts/development/behaviors.md#relational-goals This projection selects no interaction or outcome; the generating graph owns those goals.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation A fixed clip and second determine the result, independently of playback history.
   */
  public pose(subject: string, seconds: number): IAutoMoviePose {
    if (subject !== "owen" && subject !== "marek" && subject !== "daniel") throw new Error(`Unknown round performer ${subject}`);
    return sampleMotion(this.native.clips[subject], seconds).pose;
  }

  /**
   * Resolve inspection bones from the same native sampled pose and body.
   *
   * @evidence contracts/development/common.md#meaningful-documentation Names actual pose/body ownership and missing-body refusal.
   * @evidence contracts/development/implementation.md#principled-implementation Uses the installed poseBones owner over the sampled pose and corresponding canonical body.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Find the body, reject a missing identity and delegate FK.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No invented joint positions, forces, physical report or alternate rig.
   * @evidence contracts/development/implementation.md#efficient-algorithms One bounded cast lookup and native linear skeleton traversal.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses each cast member's canonical body and the common pose port.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns an in-memory bone map without render resources or retained history.
   * @evidenceExclude contracts/development/behaviors.md#studied-laws Pure projection of an existing native pose introduces no practice law.
   * @evidenceExclude contracts/development/behaviors.md#relational-goals Does not decide contacts or outcomes; it exposes the actual displayed bones for inspection.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation The same clip time and body resolve to the same native bones on sequential or random seeks.
   */
  public bones(subject: string, seconds: number): ReturnType<HumanPerformance["bones"]> {
    const person: Fighter | Referee | undefined = this.people.find(candidate => candidate.subject === subject);
    if (person === undefined) throw new Error(`Missing round body ${subject}`);
    return poseBones(person.body, this.pose(subject, seconds));
  }
}
