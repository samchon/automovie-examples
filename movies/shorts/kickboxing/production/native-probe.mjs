import { AutoMovieHumanCanonicalBody, AutoMovieHumanSex } from "@automovie/human";
import { createHumanBody, HumanChain, HumanPerformance } from "@automovie/motions";
import { head } from "../src/entities/cast/roundCast/head.ts";

const prepare = (id, stature, mass) => {
  const source = AutoMovieHumanCanonicalBody.prepare(
    { body: { anatomy: { sex: AutoMovieHumanSex.Male, stature } }, head: head(stature) },
    { id, mass },
  );
  return createHumanBody(source.skeleton, source.profile);
};

const lead = { subject: "owen", body: prepare("owen", 1800, 80), at: { x: -.92, y: 0, z: -1.23 }, yaw: 44, proficiency: { level: "trained" } };
const endpoint = { x: 2.51, y: 0, z: 2.56 };
const crossing = new HumanPerformance({
  seed: "the-round/neutral-crossing-020",
  performers: [lead],
  composition: HumanChain.subject(lead.subject).walk({ to: endpoint, face: -135, pace: "fast" }, "neutral").node,
});

const shots = [0, crossing.duration / 2, crossing.duration].map((seconds) => ({
  seconds,
  pose: crossing.pose("owen", seconds),
  bones: Object.fromEntries([...crossing.bones("owen", seconds)].filter(([name]) => ["hips", "leftFoot", "rightFoot", "leftLowerLeg", "rightLowerLeg"].includes(name))),
}));

function attempt(subject, body, build) {
  try {
    const plan = new HumanPerformance({
      seed: `the-round/${subject}-closing-probe`,
      performers: [{ subject, body, at: { x: 0, y: 0, z: 0 }, yaw: 0, proficiency: { level: "trained" } }],
      composition: build(HumanChain.subject(subject)).node,
    });
    return { duration: plan.duration, schedule: plan.schedule.entries.map((entry) => ({ start: entry.start, end: entry.end })) };
  } catch (error) {
    return { refusal: error instanceof Error ? error.message : String(error) };
  }
}

const referee = prepare("daniel", 1860, 70);
const partner = prepare("marek", 1800, 80);
const refusals = {
  armCountFromKneel: attempt("daniel", referee, (chain) => chain.kneel({ kind: "one", knee: "right", hold: 2, rise: false })
    .over((upper) => upper.gesture({ kind: "stopPalm", side: "right", count: 1 }))),
};
const floorRoute = attempt("marek", partner, (chain) => chain.lieDown({ position: "lateralRight", hold: 0 }));
console.log(JSON.stringify({ duration: crossing.duration, schedule: crossing.schedule.entries.map((entry) => ({ start: entry.start, end: entry.end })), shots, floorRoute, refusals }, null, 2));
