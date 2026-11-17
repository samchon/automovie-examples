import {
  compileCameraMove,
  resolveCameraAt,
  type IAutoMovieCameraFrameEntry,
  type IAutoMovieFramedSubject,
  type IAutoMovieResolvedCamera,
} from "@automovie/engine";
import type { IAutoMovieCamera, IAutoMovieCameraAction, IAutoMovieClip, IAutoMovieVector3 } from "@automovie/interface";
import * as THREE from "three";

/**
 * The south-facing full view, fitted by the installed camera grammar.
 *
 * A scene passes its actual measured subject and a staged eye point. The
 * engine compiles the follow move once; every seek reads that same clip.
 * The 30-degree vertical field is a production lens choice, not a claim that
 * the resulting frame or camera clearance has already passed inspection.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the staged eye point, actual extent input, compiled follow clock and unverified visibility boundary.
 * @evidence contracts/development/design.md#principled-representation Stores the camera's typed authored data, while the engine owns framing and interpolation and Three owns the displayed camera.
 * @evidence contracts/development/design.md#minimal-and-owned-surface One full-follow mounting port; later screenplay views require their own authored entries rather than a hidden camera tour.
 * @evidence contracts/development/design.md#prohibited-design-shortcuts No copied framing mathematics, participant displacement or manual pose smoothing.
 * @evidence contracts/development/entities.md#settings-realization Realizes the paired full view of docs/body/screenplay/kickboxing/010-the-round.md#p01 through native full framing, with its actual visibility left to capture.
 * @evidence contracts/development/entities.md#object-shape Immutable camera data creates explicit mounted view state; targets and duration are supplied by the scene.
 * @evidence contracts/development/entities.md#controls-and-source Uses the installed camera grammar and Three projection, with no external asset or alternate camera solver.
 */
export class RingsideCamera {
  /** Camera facts read by the native framing compiler. */
  private readonly authored: IAutoMovieCamera;

  /** Adopt the scene's staged eye point in canonical metres. */
  public constructor(eye: IAutoMovieVector3) {
    this.authored = {
      id: "ringside",
      transform: {
        translation: { ...eye },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
      },
      fovY: 30,
      near: 0.1,
      far: 100,
      depthPrecision: { minimumDepthBits: 24, maximumStepMeters: 0.01 },
    };
  }

  /**
   * Compile full views of the supplied extent and trajectory. A move may name
   * its own measured subject, such as the whole ring for a separated ending.
   * Gaps between moves retain the native compiler's continuous reframe.
   *
   * @evidence contracts/development/common.md#meaningful-documentation The subject supplies metre extents and a time-indexed base; seconds fixes the clip span, and seek updates only the camera.
   * @evidence contracts/development/implementation.md#principled-implementation Uses compileCameraMove with actual 16:9 aspect, then resolveCameraAt and Three's matching perspective fields for each requested second.
   * @evidence contracts/development/implementation.md#clear-and-simple-structure Resolve each move's optional subject, build one native clip, create one camera and expose its exact-time seek.
   * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts A missing compiled clip throws; there is no hand-authored fallback camera path or changed performer.
   * @evidence contracts/development/implementation.md#efficient-algorithms The engine compiles its finite follow samples once; seeks sample the clip and update one camera.
   * @evidence contracts/development/implementation.md#reuse-equivalent-work Reuses one clip and camera for the whole mount.
   * @evidenceExclude contracts/development/implementation.md#bound-retention-and-release-resources A camera and plain clip allocate no geometry, texture, browser or external task; the mounted film owns their lifetime.
   * @evidence contracts/development/entities.md#settings-realization Carries the full-view decision of docs/body/screenplay/kickboxing/010-the-round.md#p01 without inventing a cut or moving a fighter for the frame.
   * @evidence contracts/development/entities.md#object-shape Returns a projection and a seek port driven solely by the compiled clip, keeping playback history out of camera placement.
   * @evidence contracts/development/entities.md#controls-and-source The same native grammar port serves catalog and production subject extents at the adopted raster.
   */
  public mount(
    subject: IAutoMovieFramedSubject,
    seconds: number,
    moves: readonly (Pick<IAutoMovieCameraAction, "start" | "duration" | "move"> & { subject?: IAutoMovieFramedSubject })[] = [{ start: 0, duration: seconds, move: "follow" }],
  ): { camera: THREE.PerspectiveCamera; seek: (seconds: number) => void } {
    const entries: IAutoMovieCameraFrameEntry[] = moves.map(({ subject: framed = subject, ...move }) => ({
        action: {
          actor: this.authored.id,
          verb: "frame",
          ...move,
          framing: "full",
          on: { kind: "point", point: framed.at?.(move.start) ?? framed.base },
        },
        subject: { ...framed, base: framed.at?.(move.start) ?? framed.base },
      }));
    const clip: IAutoMovieClip | null = compileCameraMove({
      clipId: "ringside/full-follow",
      camera: this.authored,
      entries,
      shotDuration: seconds,
      aspect: 16 / 9,
    });
    if (clip === null) throw new Error("The framing compiler produced no camera");
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      this.authored.fovY,
      16 / 9,
      this.authored.near,
      this.authored.far,
    );
    return {
      camera,
      seek: (at: number): void => {
        const resolved: IAutoMovieResolvedCamera = resolveCameraAt(
          this.authored.transform,
          clip,
          this.authored.id,
          at,
        );
        camera.position.set(resolved.position.x, resolved.position.y, resolved.position.z);
        camera.quaternion.set(resolved.rotation.x, resolved.rotation.y, resolved.rotation.z, resolved.rotation.w);
        camera.updateMatrixWorld(true);
      },
    };
  }
}
