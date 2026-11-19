import { AutoMovieHumanCanonicalBody } from "@automovie/human";
import type { IAutoMoviePose } from "@automovie/interface";
import { createHumanBody, HumanChain, HumanMutual, HumanPerformance } from "@automovie/motions";
import { gameAt } from "./game";

/** The canonical skin and contact profile shared with the visible roster. */
type Body = ReturnType<typeof AutoMovieHumanCanonicalBody.prepare>;

/** Build the SDK gesture and locate its entry, contact and exit on the programme clock. */
function benchMotion(bodies: Readonly<Record<string, Body>>, second: number, partner: "b7" | "b8", height: number) {
  const { players } = gameAt(second);
  const captain = players.b4;
  const receiver = players[partner];
  const point = { x: (captain.x + receiver.x) / 2, y: height, z: (captain.z + receiver.z) / 2 };
  const participants = [
    { subject: "b4", body: createHumanBody(bodies.b4.skeleton, bodies.b4.profile),
      at: { x: captain.x, y: 0, z: captain.z }, yaw: captain.yaw * 180 / Math.PI,
      proficiency: { level: "trained" as const } },
    { subject: partner, body: createHumanBody(bodies[partner].skeleton, bodies[partner].profile),
      at: { x: receiver.x, y: 0, z: 8.24 }, yaw: 180, proficiency: { level: "trained" as const } },
  ];
  const seat = { at: { x: receiver.x, y: .52, z: 8.545 }, yaw: 180, depth: .47, workingSeat: true };
  const sitting = HumanChain.subject(partner).sit({ seat, seconds: .4 });

  // The first pair meet while standing and seated. The lower contact needs a planted bend and a seated response.
  const composition = partner === "b7" ? HumanChain.mutual(HumanMutual.highFive, {
    one: HumanChain.subject("b4").stand({ seconds: 1.7 }), other: sitting,
  }, { side: "left", kind: "low", at: point }, "bench-clap").node :
    HumanChain.subject("b4").stand({ seconds: 4.15 }).bend({
      toward: { kind: "point", frame: "world", at: point }, side: "left", strategy: "semiSquat", hold: .10,
    }, "bench-bend").with(sitting.touch({
      target: { kind: "point", frame: "world", at: point, normal: { x: 0, y: -1, z: 0 } },
      side: "left", with: "palm", kind: "hold", hold: .10,
    }, "bench-touch").sync({ of: "bench-bend", event: "contact", align: "stroke" })).node;
  const performance = new HumanPerformance({ seed: "two-hands-bench", performers: participants, composition });
  const actions = performance.schedule.entries.filter(entry => entry.intent.anchor?.startsWith("bench-"));
  const contact = actions.find(entry => entry.subject === "b4")?.contact;
  if (contact === undefined) throw new Error("Bench motion is missing the captain's SDK contact time");
  const approachRate = 1.55;
  const releaseRate = 2.85;
  const start = second + (Math.min(...actions.map(entry => entry.start)) - contact) / approachRate;
  const end = second + (Math.max(...actions.map(entry => entry.end)) - contact) / releaseRate;
  return { partner, performance, second, contact, approachRate, releaseRate, start, end };
}

/** Ease into the resolved action at its entry and out again at its exit. */
function smooth(from: number, to: number, second: number): number {
  const share = Math.min(1, Math.max(0, (second - from) / (to - from)));
  return share * share * (3 - 2 * share);
}

/**
 * Programs the two bench greetings on the dressed blue cast.
 * @evidence docs/body/screenplay/two-hands/010-game.md#restart The captain first meets the seated scorer at 94.50 s and then lowers his hand for the screener at 106.00 s. The performance schedule uses contacts at 1.13 m and 0.59 m.
 * @evidence contracts/development/composition.md#screenplay-realization docs/body/screenplay/two-hands/010-game.md#restart assigns the captain's first contact to the seated scorer and the lower contact to the overlooked screener.
 * @evidence contracts/development/composition.md#composition-only This scene sampler schedules the gestures. The cast owns dressing, animation binding and scene placement.
 * @evidence contracts/development/composition.md#living-scene The seated body continues through contact and the pose sampler runs on the unchanged live bench clock.
 * @evidence contracts/development/common.md#meaningful-documentation Receives the mounted canonical bodies for blue 4, 7 and 8. Its sampler returns two keyed poses and a weight on active programme seconds, or null outside both greetings. Construction fails if the SDK publishes no contact.
 * @evidence contracts/development/implementation.md#principled-implementation A shared high-five resolves the first left-hand contact. A planted bend and synchronized seated palm stroke resolve the second at its lower point without cutting off the sitting action.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Each gesture resolves once. A shared contact mark fixes the two participants' sampled time, with a faster release after contact.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Both actions use the visible cast's canonical body and the actual bench top. The scored game clock and broadcast camera retain their stage times.
 * @evidence contracts/development/implementation.md#efficient-algorithms Two bounded interval checks precede pose evaluation, and inactive programme seconds allocate no pose map.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The shared SDK schedule owns reach and both palms' timing. The two performances reuse the mounted canonical body parameters.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Two in-memory performances belong to the film mount. No samples are accumulated as time advances.
 */
export function createBenchMotion(bodies: Readonly<Record<string, Body>>): (second: number) => { weight: number; poses: Readonly<Record<string, IAutoMoviePose>> } | null {
  const greetings = [benchMotion(bodies, 94.5, "b7", 1.13), benchMotion(bodies, 106, "b8", .59)];
  return (second: number) => {
    const greeting = greetings.find(({ start, end }) => second > start && second < end);
    if (!greeting) return null;
    const { start, end, second: mark, partner, performance, contact, approachRate, releaseRate } = greeting;
    const weight = Math.min(smooth(start, start + .10, second), 1 - smooth(end - .09, end, second));
    const phase = contact + (second - mark) * (second < mark ? approachRate : releaseRate);
    return { weight, poses: { b4: performance.pose("b4", phase), [partner]: performance.pose(partner, phase) } };
  };
}
