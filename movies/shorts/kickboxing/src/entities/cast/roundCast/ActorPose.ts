/**
 * A role's pose at one programme instant. The root displacements are in scene metres above the actor's support plane. Angles are radians. Arrays contain the left and right performer controls in that order. Targets are in world metres and their weights are normalized.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment gives the scene units, angle units, limb order and meaning of each target's weight. No target means the base pose drives that limb.
 * @evidence contracts/development/design.md#principled-representation Fixed pairs and triples require the right number of limbs and coordinates. The pose authoring clamps continuous controls and the rig fits reachable targets at runtime.
 * @evidence contracts/development/design.md#minimal-and-owned-surface The production's track owner supplies one local cast pose to createActor. The ringside dresser only reads the initial root and bearing.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts Hand and foot targets can coexist because they affect independent effectors. A supplied target always includes its side, point and blend; omission selects the base control independently.
 * @evidence contracts/development/entities.md#settings-realization The pose carries the world placements and visible facing, limbs and gaze prescribed by docs/body/screenplay/kickboxing/020-the-round.md#p01 and its successive phases. The actor applies these values to the mounted figure.
 * @evidence contracts/development/entities.md#object-shape A pose is an explicit per-seek record. The scene's native overlays mutate that fresh record before display, so this is a mutable drawing port with coordinates, not the immutable subject capability described by the contract.
 * @evidence contracts/development/entities.md#controls-and-source Base limb values are supplied by the scene tracks. Native shoulder-relative and world joint samples use separate fields. A supplied target overrides only its named effector when the drawing rig applies the record.
 */
export type ActorPose = {
  x: number; z: number; y: number; yaw: number; lean: number; roll: number; kneel: number;
  arms: [number, number]; reach: [number, number]; elbow: [number, number]; legs: [number, number]; head: number; clap: number;
  chestRoll?: number;
  headPitch?: number;
  clapHeight?: number;
  nativeTravel?: { weight: number; pelvis: number; knees: [Triple, Triple]; ankles: [Triple, Triple] };
  nativeHands?: [Triple | undefined, Triple | undefined];
  nativeHandWeights?: Pair;
  guardRelease?: Pair;
  handTarget?: { side: 0 | 1; world: [number, number, number]; weight: number };
  footTarget?: { side: 0 | 1; world: [number, number, number]; weight: number };
};

type Pair = [number, number];
type Triple = [number, number, number];
