import { createBall, createGoal } from "@automovie/archetypes";

/** The installed hoop supplies the playing face and regulation elevation. */
const hoop = createGoal({ kind: "basketballHoop", id: "court-hoop" });
/** Local +Z points from the installed board face into the court. */
const board = hoop.affordances.find(({ id }) => id === "board")!;
/** The neutral glass pane is drawn around this X in both ends of the gym. */
const centerX = 12.8;
/** The thickness of the commissioned transparent glass detail. */
const thickness = .065;
/** Both bank and ring clearance use the visible ball's installed radius. */
const radius = createBall({ kind: "basketball", id: "game-ball" }).dimensions.diameter! / 2;
/** The custom flexible ring and its pivot are drawn at these distances along the court. */
const ringX = 12.425;
/** The flexible ring's rendered tube and major radius in metres. */
const tube = .022;
/** The major radius follows the commissioned flexible-ring detail. */
const major = .226;
/** The signed final shot hits the rear shoulder of the left ring. */
const reboundX = -12.62;
/** The signed final shot misses slightly to the table side. */
const reboundZ = .08;
/** Distance from the ball's projected center to the rim's tube axis. */
const radial = Math.hypot(reboundX + ringX, reboundZ) - major;
/** World X magnitude of the inward glass face, including the model's local face displacement. */
const faceX = centerX - thickness / 2 - board.frame.translation.z;

/**
 * Fixture coordinates in court metres for draw and flight. X runs between the baselines.
 * The left bank in [the layup](../../../../docs/body/screenplay/two-hands/010-game.md#blue-layup)
 * places the ball centre one radius from the inward glass face. The later miss in
 * [the rebound](../../../../docs/body/screenplay/two-hands/010-game.md#last-board) is tangent to the round rim tube.
 * The installed board supplies face geometry and the ball supplies the radius. The pane thickness,
 * flexible tube and exact contact marks are authored for this stage.
 */
export const courtHoop = {
  ballRadius: radius,
  glass: { centerX, thickness, width: board.width!, height: board.depth!, y: board.frame.translation.y },
  ring: { centerX: ringX, y: hoop.dimensions.height!, major, tube },
  leftBoardBank: [-faceX + radius, 3.41, .19] as [number, number, number],
  leftRimRebound: [reboundX, hoop.dimensions.height! + Math.sqrt((radius + tube) ** 2 - radial ** 2), reboundZ] as [number, number, number],
};
