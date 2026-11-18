import { Fighter } from "../../src/entities/cast/fighter/Fighter";

/** Bodies are expensive to prepare, so all unit cases share one per identity. */
const prepared: Map<"owen" | "marek", Fighter> = new Map();

/** Return the production's actual immutable fighter, prepared once per test run. */
export function getFighter(subject: "owen" | "marek"): Fighter {
  const existing: Fighter | undefined = prepared.get(subject);
  if (existing !== undefined) return existing;
  const fighter: Fighter = new Fighter(
    subject,
    subject === "owen" ? 0xb94439 : 0x3978bc,
  );
  prepared.set(subject, fighter);
  return fighter;
}
