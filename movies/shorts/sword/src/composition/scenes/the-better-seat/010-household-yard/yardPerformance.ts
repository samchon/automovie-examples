import type { ActorPose, CastActor } from "../../../shared/castActor";
import { yardCurve, type XYZ } from "./yardCurve";

const { val, vector } = yardCurve;

function place(
  actor: CastActor,
  t: number,
  p: readonly (readonly [number, XYZ])[],
) {
  const v = vector(t, p);
  actor.root.position.set(v.x, 0, v.y);
  actor.root.rotation.y = v.z;
}
const martinPath: readonly (readonly [number, XYZ])[] = [
  [0, [-0.87, -0.05, -0.48]],
  [12, [-0.87, -0.05, -0.48]],
  [14.99, [-0.52, 0.0, -0.32]],
  [17, [-0.41, 0.02, 0.82]],
  [21, [0.09, 0.28, 1.01]],
  [23.35, [0.33, 0.58, 0.87]],
  [26, [0.42, 0.05, 0.68]],
  [28.6, [0.74, 0.08, 0.92]],
  [30.3, [0.73, 0.16, 0.89]],
  [33, [0.73, 0.16, 0.89]],
  [39.6, [0.73, 0.16, 0.89]],
  [41.2, [0.06, 0.2, -1.0]],
  [42.6, [-1.06, 0.16, -0.27]],
  [44.4, [-1.12, 0.14, -0.51]],
  [46.6, [-1.11, 0.14, 0.08]],
  [51, [-1.06, 0.14, 0.68]],
  [55.8, [-1.06, 0.14, 0.76]],
  [57.68, [-0.79, 0.74, 0.46]],
  [58.92, [-1.15, 0.61, 0.56]],
];
const carloPath: readonly (readonly [number, XYZ])[] = [
  [0, [-1.42, 0.03, -0.22]],
  [12, [-1.42, 0.03, -0.22]],
  [14.99, [-0.14, -0.13, -0.5]],
  [17, [0.23, -0.32, -0.8]],
  [21, [0.83, -0.52, -0.9]],
  [23.65, [1.05, -0.35, -0.62]],
  [26, [1.05, -0.32, -0.82]],
  [28.3, [1.17, -0.22, -0.88]],
  [30.4, [1.18, -0.18, -0.74]],
  [31.8, [1.2, -0.17, -0.7]],
  [32.5, [1.31, -0.16, -0.65]],
  [39.75, [1.31, -0.16, -0.65]],
  [40.63, [0.02, 0.2, -1.05]],
  [41.54, [-0.94, 0.26, 0.06]],
  [43.18, [-2.0, 0.09, 0.12]],
  [45.22, [-1.79, 0.11, 0.78]],
  [46.5, [-1.84, 0.12, 0.45]],
  [47.44, [-1.68, 0.11, 0.71]],
  [49.2, [0.66, -0.37, 1.86]],
  [50.48, [2.55, -1.38, 2.12]],
  [51.44, [3.08, -2.15, -0.35]],
  [55.18, [3.08, -2.15, -0.39]],
  [57.45, [3.59, -2.82, -0.21]],
  [59.8, [3.86, -4.12, 2.68]],
];
const boyPath: readonly (readonly [number, XYZ])[] = [
  [0, [-2.09, 0.14, 0.38]],
  [14, [-2.09, 0.14, 0.38]],
  [16.6, [-2.71, 0.39, 0.51]],
  [17.15, [-2.72, 0.58, 0.56]],
  [33.9, [-2.72, 0.58, 0.56]],
  [34.8, [-2.64, 0.24, 0.82]],
  [42.25, [-2.65, 0.18, 0.51]],
  [47.15, [-2.17, 0.14, 0.58]],
  [48.3, [-2.68, 0.12, 0.62]],
  [60, [-2.68, 0.12, 0.65]],
];

/**
 * Place Martin, Carlo and the lad on their authored paths at a film second.
 * The root positions are in stage metres and the heading is in radians.
 * Return the base pose and Martin's crouch amount for the later native and prop layers.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Each actor reads a time-keyed XZ path and heading, then receives time-keyed posture, walking phase and head direction before the native action overrides.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The path helper positions three root groups and returns base controls. Native motion, props and camera update in the caller.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The path and posture keys are authored shot blocking carried from the yard staging. They describe stylized motion where the native action spans do not supply those controls.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each call evaluates a fixed cast and finite key arrays. Cost is proportional to the number of keys scanned and temporary arrays exist for this sample only.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse the actor groups supplied by the scene. Recompute the roots and controls from the requested second, keeping seeks order-independent.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller owns the actors and returned controls. Each call leaves no retained map or handle.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states seconds, metres, radians, the mutated roots and the base controls returned.
 * @evidence contracts/development/composition.md#screenplay-realization The bench, arc in the ring, kneel and gate routes follow the four beat landmarks.
 * @evidence contracts/development/composition.md#composition-only Absolute placement changes belong to these stage curves. The native gait, gaze and contact layers are applied separately by the scene.
 * @evidence contracts/development/composition.md#living-scene Martin, Carlo and the lad have separate positions and rhythms through the landing, verdict and seated ending.
 */
export function yardPerformance(t: number,martin: CastActor,carlo: CastActor,boy: CastActor): { ms: ActorPose; cs: ActorPose; bs: ActorPose; mc: number } {
  place(martin,t,martinPath);
  place(carlo,t,carloPath);
  place(boy,t,boyPath);
    const boyC = val(t, [
      [0, 0.06],
      [14, 0.02],
      [16.65, 0.02],
      [17.15, 0.228],
      [33.9, 0.228],
      [34.66, 0],
      [46.3, 0],
      [46.83, 0.1],
      [47.35, 0.0],
    ]);
    const mc = val(t, [
      [0, 0],
      [25, 0],
      [26.8, 0.13],
      [28, 0.17],
      [30.3, 0.49],
      [39.65, 0.49],
      [40.76, 0],
      [57.86, 0],
      [58.92, 0.41],
      [59.99, 0.42],
    ]);
    const cc = val(t, [
      [0, 0.035],
      [10, 0.02],
      [26, 0.01],
      [28.9, 0.13],
      [31.4, 0.1],
      [32.5, 0],
      [40.87, 0],
      [41.5, 0.24],
      [42.17, 0],
      [43.35, 0.21],
      [44.13, 0],
      [46.49, 0.04],
      [47.4, 0],
    ]);
    const walkM = val(t, [
      [0, 0],
      [12, 0],
      [13, 1],
      [16, 1],
      [17.0, 0.1],
      [20, 0.9],
      [24, 0.3],
      [26, 0.1],
      [27.9, 0.95],
      [30, 0.1],
      [31, 0],
      [39.7, 0],
      [40.5, 1],
      [42.55, 0.85],
      [44.3, 0],
      [56, 0],
      [57.5, 0.5],
      [58.1, 0],
    ]);
    const walkC = val(t, [
      [0, 0],
      [12, 0],
      [13, 0.85],
      [17, 0.18],
      [19, 0.62],
      [23, 0.45],
      [25, 0.1],
      [28, 0.9],
      [31.8, 0.5],
      [32.4, 0.1],
      [33, 0],
      [39.8, 0],
      [40.4, 1],
      [42.8, 0.85],
      [43.3, 0],
      [46.8, 0],
      [47.6, 1],
      [50.6, 0.35],
      [51.4, 0],
      [55, 0],
      [55.5, 0.8],
      [60, 1],
    ]);
    const ms: ActorPose = {
      walk: t * 7.8,
      stride: walkM,
      crouch: mc,
      lean: val(t, [
        [0, 0],
        [25, 0],
        [27, 0.11],
        [30, 0.19],
        [38, 0.14],
        [40.8, 0],
        [57.3, 0.03],
        [58, 0.13],
        [59.6, 0.04],
      ]),
      headYaw: val(t, [
        [0, -0.55],
        [5, -0.64],
        [15, 0],
        [24, 0.26],
        [31, 0.25],
        [34.6, -0.5],
        [36.4, 0.42],
        [41, -0.26],
        [46, -0.1],
        [50, 0.52],
        [56, 0.58],
        [60, 0.29],
      ]),
      headPitch: val(t, [
        [0, 0.08],
        [20, 0.01],
        [26, 0.14],
        [30, 0.23],
        [34, 0.04],
        [35.8, 0.34],
        [37.9, -0.05],
        [44, 0.12],
        [55.3, 0.02],
        [55.8, 0.24],
        [56.5, 0.02],
        [60, 0.03],
      ]),
    };
    const cs: ActorPose = {
      walk: t * 7.8 + 0.8,
      stride: walkC,
      crouch: cc,
      headYaw: val(t, [
        [0, -0.52],
        [8, -0.49],
        [10.9, -0.72],
        [14, -0.18],
        [21, -0.18],
        [23.5, -0.28],
        [26, 0.1],
        [29, -0.35],
        [33, 0.09],
        [35, 0.22],
        [37, -0.26],
        [42, -0.26],
        [45, -0.46],
        [50, -0.54],
        [55, -0.57],
        [60, -0.26],
      ]),
      headPitch: val(t, [
        [0, 0.15],
        [7, 0.09],
        [11, 0.13],
        [15, 0.0],
        [21, 0],
        [23.5, 0.2],
        [25, -0.1],
        [31, 0.12],
        [33, 0.28],
        [37, 0.06],
        [40, 0.005],
        [46, 0.12],
        [50, 0],
        [55, -0.035],
      ]),
    };
    const bs: ActorPose = {
      crouch: boyC,
      headYaw: val(t, [
        [0, 0.06],
        [2.7, 0.39],
        [5, 0.52],
        [11, 0.16],
        [15, 0.55],
        [16.7, 0.66],
        [17.1, -0.15],
        [18.6, 0.58],
        [32.48, 0.61],
        [34.34, 0.81],
        [38, 0.54],
        [44, 0.35],
        [47, 0.39],
        [55, 0.7],
      ]),
      headPitch: val(t, [
        [0, 0.32],
        [2.15, 0.29],
        [3, -0.11],
        [7, 0.0],
        [14, 0.08],
        [16.6, -0.04],
        [17.15, 0.18],
        [18.6, -0.1],
        [32, 0.0],
        [33.1, 0.31],
        [34.7, 0.27],
        [37.5, -0.1],
        [46.8, 0.11],
        [48.3, -0.06],
      ]),
    };
  return { ms,cs,bs,mc };
}
