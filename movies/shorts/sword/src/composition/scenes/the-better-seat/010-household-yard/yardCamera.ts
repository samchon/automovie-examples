import * as THREE from "three";
import { yardCurve } from "./yardCurve";

const { ramp, val, vector } = yardCurve;

function look(
  camera: THREE.PerspectiveCamera,
  pos: THREE.Vector3,
  target: THREE.Vector3,
  fov: number,
) {
  camera.position.copy(pos);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(target);
}
/**
 * Set the production camera from an absolute film second.
 * The shot cuts use the film clock. Inside each view, the positions and
 * targets use stage metres, and the vertical field of view is in degrees.
 *
 * @evidence contracts/development/implementation.md#principled-implementation Hard cuts put decisive evidence in reach of the viewer. Within a shot the time-keyed positions, axes and field of view use the same bounded smooth interpolation.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Leave the camera transforms in one owner. The scene supplies the runtime and cast independently.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The cut and view marks come from the accepted staging revision and source pilot. The boot insert and closing shared frame serve different visible subjects.
 * @evidence contracts/development/implementation.md#efficient-algorithms Inspect a fixed number of cut intervals and traverse the position, target and field-of-view keys within the selected view. The work is independent of video length.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuse the caller-provided camera and the same view keys at every seek. Time and the chosen cut decide the result.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The caller owns the mutable camera. Only short-lived vectors and key tables are allocated by this call.
 * @evidence contracts/development/common.md#meaningful-documentation The comment states the timebase, spatial and angular units and that the camera changes in place.
 * @evidence contracts/development/composition.md#screenplay-realization The entrance cut preserves the wide pair and the score. The viewer then sees the lad, print, admission, saddle exchange and doorway gesture.
 * @evidence contracts/development/composition.md#composition-only The scene calls the camera helper at absolute film times. The helper owns shot coordinates, target changes and authored cut marks.
 * @evidence contracts/development/composition.md#living-scene The frame moves between bench, ring and doorway as the subjects change. The last view again holds the bench and threshold together.
 */
export function yardCamera(camera: THREE.PerspectiveCamera, t: number): void {
    if ((t >= 34.25 && t < 35.42) || (t >= 36.72 && t < 37.09)) {
      look(camera, new THREE.Vector3(-1.59, 1.43, 1.93), new THREE.Vector3(-2.62, 1.25, .30), 35);
      return;
    }
    if (t >= 35.42 && t < 36.2) {
      look(camera, new THREE.Vector3(1.25, 1.20, 1.91), new THREE.Vector3(1.37, .13, .05), 33);
      return;
    }
    if (t >= 36.2 && t < 38.5) {
      look(camera, new THREE.Vector3(.17, 1.43, 2.51), new THREE.Vector3(1.04, 1.25, -.09), 35);
      return;
    }
    if (t >= 43.32 && t < 45.56) {
      look(camera, new THREE.Vector3(-.64, 1.52, 2.73), new THREE.Vector3(-1.60, 1.14, .34), 34);
      return;
    }
    if (t >= 55.16 && t < 56.28) {
      look(camera, new THREE.Vector3(2.56, 1.46, .21), new THREE.Vector3(3.48, 1.52, -1.98), 28);
      return;
    }
    if (t >= 57.4 && t < 58.23) {
      look(camera, new THREE.Vector3(.11, 1.50, 2.47), new THREE.Vector3(-.91, 1.35, .62), 35);
      return;
    }
    if (t < 15) {
      const q = ramp(t, 0.6, 3.12),
        wide = ramp(t, 11.08, 15);
      look(
        camera,
        new THREE.Vector3(
          -1.25 - 1.29 * q + 1.77 * wide,
          1.51 - 0.13 * q + 0.18 * wide,
          4.13 - 1.06 * q + 1.43 * wide,
        ),
        new THREE.Vector3(
          -1.37 - 0.21 * q + 0.68 * wide,
          0.98 + 0.02 * q - 0.1 * wide,
          0.35 - 0.13 * wide,
        ),
        39 + 3 * wide,
      );
    } else {
      const p = vector(t, [
        [15, [-0.05, 1.61, 4.73]],
        [26.85, [-.15, 1.66, 4.70]],
        [32.45, [-1.02, 2.05, 4.22]],
        [36.5, [-1.02, 2.05, 4.22]],
        [43, [-.34, 1.61, 3.49]],
        [46, [-.36, 1.60, 3.45]],
        [51, [.08, 1.68, 4.16]],
        [54.95, [.13, 1.57, 3.84]],
        [60, [.18, 1.56, 3.84]],
      ]);
      const target = vector(t, [
        [15, [-0.55, 0.96, -0.06]],
        [26.85, [-.52, .92, -.06]],
        [32.45, [-.59, .77, -.04]],
        [36.5, [-.59, .77, -.04]],
        [43, [-1.58, 1.04, .19]],
        [46, [-1.60, 1.07, .18]],
        [51, [.41, 1.04, -.55]],
        [54.95, [.34, 1.04, -.63]],
        [60, [.24, 1.00, -.70]],
      ]);
      look(
        camera,
        p,
        target,
        val(t, [
          [15, 39],
          [32, 40.5],
          [36, 40.5],
          [43, 37],
          [46, 37],
          [51, 39.8],
          [60, 41.4],
        ]),
      );
    }
}
