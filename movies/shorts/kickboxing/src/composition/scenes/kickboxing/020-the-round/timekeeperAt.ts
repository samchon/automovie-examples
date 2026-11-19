import type { ActorPose } from "../../../../entities/cast/roundCast/ActorPose";
import { roundInterpolation } from "./roundInterpolation";

const { rise, wave } = roundInterpolation;

/**
 * Applies Alan's opening motion and the closing look, pickup and bell action to his pose.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names the timekeeper's two cues and the pose record they change.
 * @evidence contracts/development/implementation.md#principled-implementation Distinct time windows give the gaze, pickup, lift and strike their order. The mounted hand becomes the visible support for the striker.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure This track owns Alan's pose. Scene and prop owners attach the visible prop to the displayed hand.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The hand goal and time windows are authored staging, with the bell's exact commissioned instant shared by picture and sound.
 * @evidence contracts/development/implementation.md#efficient-algorithms A constant number of time envelopes updates one pose.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The scene reuses its cast and sampling law. Only the caller's current pose changes.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The function retains no per-seek data or handles.
 * @evidence contracts/development/composition.md#screenplay-realization Alan receives the result, takes the striker, then strikes at the written bell.
 * @evidence contracts/development/composition.md#composition-only The scene samples this local pose track at programme time. There is no adopted grasp operator for its prop coupling.
 * @evidence contracts/development/composition.md#living-scene Alan stays at his table while the timed head and hand movement makes his role in ending the match visible.
 */
export function timekeeperAt(pose: ActorPose, seconds: number): void {
  const beginning = 1 - rise(seconds, .13, .91);
  const pick = rise(seconds, 167.67, 168.48) * (1 - rise(seconds, 170.1, 170.87));
  pose.arms[1] += .86 * beginning + 1.43 * pick - .93 * wave(seconds, 169.90, 170.10, 170.18, 170.54);
  pose.elbow[1] += .26 * pick;
  pose.lean -= .25 * wave(seconds, 90.29, 91.10, 92.86, 93.79);
  const grip = wave(seconds, 167.72, 168.03, 170.16, 170.63);
  const lift = wave(seconds, 168.03, 168.70, 169.84, 170.10);
  const strike = wave(seconds, 169.86, 170.10, 170.12, 170.36);
  const readSignal = wave(seconds, 167.51, 167.85, 168.10, 168.51);
  pose.headPitch = .34 * readSignal;
  pose.head -= .38 * readSignal;
  if (grip > 0) {
    pose.handTarget = {
      side: 1,
      world: [2.46 - .17 * strike, .025 + .47 * lift, 3.50 + .22 * lift],
      weight: grip,
    };
  }
}
