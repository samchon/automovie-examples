import { AutoMovieComposition } from "@automovie/engine";
import type { AutoMovieHumanoidRegion } from "@automovie/interface";
import { HumanChain, type defend, type kick, type punch } from "@automovie/motions";

import type { Fighter } from "../../entities/cast/fighter/Fighter";
import type { Referee } from "../../entities/cast/referee/Referee";

/** One authored attack and its intended defence, using the installed law's own parameters. */
type Attack = ({ kind: "punch"; params: punch.IParams } | { kind: "kick"; params: kick.IParams }) & {
  /** The screenplay's defence; an absent response leaves the receiving guard in place. */
  defence?: defend.IParams["kind"] | "withdrawLeg";
};

/**
 * The standing middle of the round, composed entirely from installed actions.
 * Each passage keeps its phase anchor and continues the preceding bodies;
 * targets, footwork and responses remain native inputs when the SDK changes.
 * Known contact failures are tracked in automovie#3574, not corrected here.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the continuous staging boundary and the dependency limitations.
 * @evidence contracts/development/design.md#principled-representation Immutable cast/set roles produce native compositions, without a second motion model.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One phase port serves the continuous film and its inspection case.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No authored joints, altered solver bounds, simulation or substituted contact results.
 */
export class RoundPassages {
  /** Keep the same people and ring for every phase. */
  public constructor(private readonly owen: Fighter, private readonly marek: Fighter, private readonly daniel: Referee) {}

  /**
   * Compose phases two through ten in the screenplay's order. Short native
   * guard holds preserve the written recovery; phase cues own absolute time.
   *
   * @evidence contracts/development/common.md#meaningful-documentation States phase range, timing and the native-only implementation.
   * @evidence contracts/development/implementation.md#principled-implementation Joins native strike, defence, stance step, guard and one-knee clinch sequences over the continuing performers.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Each switch arm follows its three screenplay beats; shared combination assembly only supplies role targets and synchronization.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No inferred success, corrective pose, teleported performer or changed screenplay result.
   * @evidence contracts/development/implementation.md#efficient-algorithms Constructs a bounded graph; the enclosing performance resolves it once.
   * @evidenceExclude contracts/development/implementation.md#reuse-equivalent-work Each phase has distinct authored actions; the combination builder shares their native wiring.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources Returns graph records without render resources or external processes.
   * @evidence contracts/development/behaviors.md#studied-laws Uses the installed actions and the combination, range-restoring replant and single immediate knee described in the competitive-exchanges study.
   * @evidence contracts/development/behaviors.md#relational-goals All strikes target the counterpart's anatomical regions; defences name their actual attack. Geometric outcomes remain subject to the documented SDK defect.
   * @evidence contracts/development/behaviors.md#deterministic-evaluation The film supplies its seed and phase cues; every action uses the native clock and continuing entry state.
   * @evidence docs/research/kickboxing/competitive-exchanges.md Combines the studied range recovery, diagonal pressure, defended return and changing line; no force magnitude is invented.
   */
  public phase(index: number): AutoMovieComposition {
    const o: Fighter = this.owen;
    const m: Fighter = this.marek;
    const id: string = `p${String(index).padStart(2, "0")}`;
    const target = (who: Fighter, region: AutoMovieHumanoidRegion): punch.IParams["at"] => ({ kind: "person", subject: who.subject, region });
    const p = (who: Fighter, hand: "lead" | "rear", technique: punch.IParams["technique"], region: AutoMovieHumanoidRegion, defence?: Attack["defence"], accuracy?: punch.IParams["accuracy"]): Attack => ({ kind: "punch", params: { technique, hand, at: target(who, region), ...(accuracy === undefined ? {} : { accuracy }) }, ...(defence === undefined ? {} : { defence }) });
    const k = (who: Fighter, leg: "lead" | "rear", region: AutoMovieHumanoidRegion, defence?: Attack["defence"], technique: kick.IParams["technique"] = "round", feint: boolean = false): Attack => ({ kind: "kick", params: { technique, leg, at: target(who, region), ...(feint ? { feint: true } : {}) }, ...(defence === undefined ? {} : { defence }) });
    const combo = (who: Fighter, other: Fighter, beat: string, attacks: Attack[]): AutoMovieComposition => this.combination(who, other, `${id}-${beat}`, attacks);
    const foot = (who: Fighter, direction: "forward" | "back" | "left" | "right", count: number = 1): HumanChain => who.chain().step({ direction, steps: count });
    const reset = (seconds: number = 0.6): AutoMovieComposition => AutoMovieComposition.parallel(o.chain().guard({ seconds, facing: target(m, "sternum") }), m.chain().guard({ seconds, facing: target(o, "sternum") }));
    let work: AutoMovieComposition;
    switch (index) {
      case 2:
        work = AutoMovieComposition.sequence(
          combo(m, o, "red-entry", [p(o, "lead", "straight", "handBackRight", "cover"), p(o, "lead", "straight", "nose", "slip"), p(o, "rear", "straight", "ribsLeft", "elbowBlock")]),
          combo(o, m, "turn", [p(m, "lead", "hook", "handBackRight", "highBlock")]),
          AutoMovieComposition.parallel(foot(o, "left", 2), foot(m, "right", 2)), reset(),
          combo(o, m, "body-one", [p(m, "lead", "straight", "handBackRight"), p(m, "lead", "hook", "handBackRight"), k(m, "rear", "ribsLeft")]),
          combo(m, o, "answer", [p(o, "lead", "straight", "handBackRight", "cover"), p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "hook", "ribsRight", "elbowBlock"), k(o, "rear", "thighOuterLeft")]),
          combo(o, m, "exit", [p(m, "lead", "straight", "handBackRight")]),
          AutoMovieComposition.parallel(foot(o, "left", 2), foot(m, "right", 2)), reset(),
        );
        break;
      case 3:
        work = AutoMovieComposition.sequence(
          combo(o, m, "inside", [p(m, "lead", "straight", "handBackRight"), k(m, "rear", "thighOuterLeft", "check")]),
          foot(m, "forward"),
          combo(m, o, "counter", [p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "hook", "ribsRight"), p(o, "lead", "straight", "handBackRight", "cover"), p(o, "rear", "straight", "handBackLeft", "cover")]),
          combo(o, m, "chest", [p(m, "lead", "straight", "sternum")]),
          combo(m, o, "crowd", [p(o, "lead", "straight", "handBackRight", "cover"), p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "hook", "jawRight", "roll")]),
          combo(o, m, "short-body", [p(m, "lead", "hook", "ribsRight", "elbowBlock")]),
          this.singleKnee(m, o, `${id}-knee`),
          AutoMovieComposition.parallel(foot(o, "back"), foot(m, "back"), this.daniel.chain().gesture({ kind: "stopPalm" })),
          reset(), combo(o, m, "resume", [p(m, "lead", "straight", "handBackRight")]),
          AutoMovieComposition.parallel(foot(o, "left"), foot(m, "right")),
        );
        break;
      case 4:
        work = AutoMovieComposition.sequence(
          combo(m, o, "return", [p(o, "rear", "straight", "handBackLeft", "cover")]),
          combo(o, m, "hands", [p(m, "lead", "straight", "handBackRight"), p(m, "rear", "straight", "handBackLeft")]),
          combo(m, o, "block", [p(o, "lead", "hook", "forearmRight", "highBlock")]),
          AutoMovieComposition.parallel(foot(o, "left", 2), foot(m, "right", 2)), reset(),
          combo(o, m, "body-two", [p(m, "lead", "straight", "forehead", "sway", "graze"), p(m, "lead", "straight", "handBackRight"), k(m, "rear", "ribsLeft", "elbowBlock")]),
          combo(m, o, "recoil-answer", [p(o, "lead", "hook", "forearmRight", "highBlock"), p(o, "rear", "straight", "nose", "sway")]),
          AutoMovieComposition.parallel(foot(o, "back"), foot(m, "forward")), reset(),
          combo(o, m, "body-three", [k(m, "rear", "ribsLeft", "elbowBlock")]),
          foot(m, "forward"), combo(m, o, "late-right", [p(o, "rear", "straight", "handBackLeft", "cover")]),
        );
        break;
      case 5:
        work = AutoMovieComposition.sequence(
          combo(o, m, "initiative", [p(m, "lead", "straight", "nose", "parry"), p(m, "rear", "straight", "handBackLeft", "cover"), p(m, "lead", "hook", "jawRight", "roll"), p(m, "rear", "straight", "handBackLeft"), k(m, "lead", "thighInnerRight")]),
          AutoMovieComposition.parallel(foot(o, "forward", 2), foot(m, "back", 2)), reset(),
          combo(o, m, "blue", [p(m, "lead", "straight", "handBackRight")]),
          combo(m, o, "stop", [p(o, "rear", "straight", "handBackLeft", "cover")]),
          combo(o, m, "checked", [p(m, "lead", "straight", "handBackRight"), k(m, "lead", "thighInnerRight", "check")]),
          foot(m, "forward"),
          combo(m, o, "counter-exit", [p(o, "lead", "hook", "jawRight", undefined, "graze"), p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "hook", "ribsRight", "elbowBlock")]),
          AutoMovieComposition.parallel(foot(m, "left", 2), foot(o, "right", 2)), reset(),
          combo(m, o, "head-and-leg", [p(o, "lead", "straight", "handBackRight", "cover"), p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "hook", "nose", "sway"), k(o, "rear", "thighOuterLeft", "withdrawLeg")]),
        );
        break;
      case 6:
        work = AutoMovieComposition.sequence(
          combo(m, o, "threat", [{ kind: "punch", params: { technique: "straight", hand: "lead", at: target(o, "nose"), feint: 0.5 } }, p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "hook", "ribsRight", "elbowBlock")]),
          combo(o, m, "useful-shield", [p(m, "lead", "straight", "handBackRight"), k(m, "rear", "ribsLeft", "elbowBlock")]),
          foot(m, "forward"), combo(m, o, "close", [p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "straight", "nose", "parry"), p(o, "rear", "straight", "templeLeft", undefined, "graze"), p(o, "lead", "hook", "forearmRight", "highBlock")]),
          foot(m, "right"), combo(m, o, "compressed", [p(o, "rear", "uppercut", "handBackLeft", "cover"), p(o, "lead", "hook", "ribsRight")]),
          combo(o, m, "inside", [p(m, "lead", "hook", "ribsRight", "elbowBlock")]),
          this.singleKnee(o, m, `${id}-knee`),
          AutoMovieComposition.parallel(foot(o, "back", 2), foot(m, "back"), this.daniel.chain().gesture({ kind: "stopPalm" })), reset(1.2),
        );
        break;
      case 7:
        work = AutoMovieComposition.sequence(
          combo(m, o, "low-answer", [{ kind: "punch", params: { technique: "straight", hand: "lead", at: target(o, "nose"), feint: 0.4 } }, k(o, "rear", "thighOuterLeft"), p(o, "lead", "straight", "nose", "parry"), p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "hook", "nose", "sway")]),
          combo(o, m, "return", [p(m, "rear", "straight", "cheekLeft", undefined, "graze")]),
          combo(m, o, "renew", [p(o, "lead", "straight", "handBackRight", "cover")]), reset(),
          combo(o, m, "stop-approach", [k(m, "lead", "solarPlexus", undefined, "push")]),
          AutoMovieComposition.parallel(foot(o, "right", 2), foot(m, "left", 2)), reset(),
          combo(m, o, "cut-off", [p(o, "lead", "straight", "handBackRight", "cover"), p(o, "rear", "straight", "handBackLeft", "cover"), p(o, "lead", "hook", "forearmRight", "highBlock"), p(o, "rear", "straight", "ribsLeft", "elbowBlock")]),
          combo(o, m, "low-trade", [p(m, "lead", "straight", "handBackRight"), k(m, "lead", "thighInnerRight")]),
          combo(m, o, "withdraw", [k(o, "rear", "thighOuterLeft", "withdrawLeg")]),
          AutoMovieComposition.parallel(foot(o, "back", 2), foot(m, "forward", 2)),
        );
        break;
      case 8:
        work = AutoMovieComposition.sequence(
          combo(o, m, "corner", [{ kind: "punch", params: { technique: "hook", hand: "lead", at: target(m, "handBackRight"), feint: 0.4 } }, p(m, "lead", "straight", "forehead", "sway", "graze"), p(m, "rear", "straight", "handBackLeft")]),
          combo(m, o, "roll-exit", [p(o, "lead", "hook", "jawRight", "roll"), p(o, "rear", "straight", "handBackLeft", "cover")]),
          AutoMovieComposition.parallel(foot(o, "left", 2), foot(m, "right", 2)),
          combo(o, m, "body-answer", [p(m, "lead", "hook", "ribsRight", "elbowBlock")]), reset(),
          combo(o, m, "feint", [p(m, "lead", "straight", "handBackRight"), k(m, "rear", "ribsLeft", "elbowBlock", "round", true)]),
          foot(m, "forward"), combo(m, o, "attempted-counter", [p(o, "rear", "straight", "nose", "parry")]),
          combo(o, m, "feint-lands", [p(m, "rear", "straight", "cheekLeft", undefined, "graze")]), reset(),
          combo(m, o, "take-back", [p(o, "lead", "straight", "handBackRight", "cover"), p(o, "lead", "hook", "ribsRight"), p(o, "rear", "straight", "handBackLeft", "cover"), k(o, "rear", "thighOuterLeft", "check")]),
          foot(o, "forward"), combo(o, m, "check-jab", [p(m, "lead", "straight", "handBackRight")]),
        );
        break;
      case 9:
        work = AutoMovieComposition.sequence(
          combo(m, o, "strongest", [p(o, "lead", "straight", "handBackLeft", "cover"), p(o, "rear", "straight", "forearmLeft", "cover"), p(o, "lead", "hook", "forearmRight", "highBlock"), p(o, "rear", "uppercut", "handBackLeft", "cover"), p(o, "lead", "hook", "ribsRight"), k(o, "rear", "thighOuterLeft")]),
          AutoMovieComposition.parallel(foot(o, "back", 2), foot(m, "forward", 2)), reset(),
          combo(m, o, "pursuit", [p(o, "lead", "straight", "nose", "slip")]),
          combo(o, m, "turn", [p(m, "rear", "straight", "handBackLeft"), k(m, "lead", "thighInnerRight", "withdrawLeg")]),
          AutoMovieComposition.parallel(foot(o, "left", 2), foot(m, "right", 2)), reset(),
          combo(m, o, "hold", [p(o, "lead", "straight", "handBackRight", "cover"), p(o, "lead", "straight", "handBackLeft", "cover"), k(o, "rear", "thighOuterLeft", "check")]),
          foot(o, "forward"), combo(o, m, "counter", [p(m, "rear", "straight", "handBackLeft"), p(m, "lead", "hook", "forearmRight")]),
          combo(m, o, "reply", [p(o, "lead", "straight", "handBackRight", "cover")]), reset(1.2),
        );
        break;
      case 10:
        work = AutoMovieComposition.sequence(
          combo(o, m, "measure", [p(m, "lead", "straight", "nose", "parry"), p(m, "rear", "straight", "handBackLeft"), p(m, "lead", "hook", "ribsRight", "elbowBlock")]),
          combo(m, o, "threat", [p(o, "lead", "straight", "handBackRight", "cover"), p(o, "rear", "straight", "forearmLeft", "highBlock")]),
          AutoMovieComposition.parallel(foot(o, "left"), foot(m, "right")), reset(),
          combo(m, o, "make-lane", [p(o, "lead", "hook", "ribsRight", "elbowBlock"), p(o, "rear", "straight", "nose", "parry"), p(o, "lead", "hook", "nose", "sway")]),
          AutoMovieComposition.parallel(foot(o, "back"), foot(m, "forward")),
          AutoMovieComposition.parallel(foot(o, "right"), foot(m, "left")), reset(),
          combo(o, m, "same-beginning", [p(m, "lead", "straight", "handBackRight"), p(m, "rear", "straight", "handBackLeft")]),
          combo(m, o, "following-jab", [p(o, "lead", "straight", "handBackRight", "cover")]),
          AutoMovieComposition.parallel(foot(o, "back"), foot(m, "forward")), reset(),
        );
        break;
      default: throw new Error(`No standing passage ${index}`);
    }
    const entry: AutoMovieComposition = AutoMovieComposition.parallel(
      o.chain().guard({ seconds: 0.6, facing: target(m, "sternum") }).sync({ of: "round", event: "phase", index: index - 1 }),
      m.chain().guard({ seconds: 0.6, facing: target(o, "sternum") }).sync({ of: "round", event: "phase", index: index - 1 }),
    );
    return AutoMovieComposition.sequence(entry, work);
  }

  /** Wire one authored combination and the receiving defences to its native launch events. */
  private combination(attacker: Fighter, receiver: Fighter, id: string, attacks: Attack[]): AutoMovieComposition {
    let offence: HumanChain = attacker.chain();
    let defence: HumanChain = receiver.chain();
    for (const [index, attack] of attacks.entries()) {
      const anchor: string = `${id}-${index}`;
      offence = attack.kind === "punch" ? offence.punch(attack.params, anchor) : offence.kick(attack.params, anchor);
      if (attack.kind === "punch" && attack.params.feint === undefined && attacks[index + 1]?.kind === "punch") offence = offence.until({ event: "impact" });
      if (attack.defence === "withdrawLeg") defence = defence.step({ direction: "back" }).sync({ of: anchor, event: "launch" });
      else if (attack.defence !== undefined) defence = defence.defend({ kind: attack.defence, against: anchor, outcome: "inTime" }).sync({ of: anchor, event: "launch" });
    }
    return AutoMovieComposition.parallel(offence, defence);
  }

  /** One immediate native clinch knee followed by release, never a repeated holding knee. */
  private singleKnee(attacker: Fighter, receiver: Fighter, id: string): AutoMovieComposition {
    return AutoMovieComposition.parallel(
      attacker.chain().clinch({ partner: receiver.subject, grip: "plum", hold: 0 }).knee({ leg: "rear", at: { kind: "person", subject: receiver.subject, region: "solarPlexus" } }, id),
      receiver.chain().defend({ kind: "elbowBlock", against: id, outcome: "inTime" }).sync({ of: id, event: "launch" }),
    );
  }
}
