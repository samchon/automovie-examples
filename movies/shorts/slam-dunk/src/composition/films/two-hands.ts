import * as THREE from "three";

import type { IFilm } from "../../IFilm";
import type { IFilmProduction } from "../../IFilmProduction";
import { createBroadcast } from "../../entities/cameras/broadcast/broadcast";
import { createPlayers } from "../../entities/cast/basketball/players";
import { createBasketball } from "../../entities/props/basketball/createBasketball";
import { createGym } from "../../entities/sets/shohoku-gym/gym";
import { createBenchMotion } from "../scenes/two-hands/010-game/createBenchMotion";
import { gameAt } from "../scenes/two-hands/010-game/game";

type Transition = {
  time: readonly [number, number];
  actors?: readonly string[];
  seats?: boolean;
};

/** Eases the pose changes that happen on a single broadcast clock tick. */
const transitions: readonly Transition[] = [
  { time: [24.85, 25.30] },
  { time: [25.32, 25.82], actors: ["w4"] },
  { time: [51.85, 52.32] },
  { time: [54.79, 55.25] },
  { time: [78.45, 80.24], seats: true },
  { time: [119.23, 120.42], seats: true },
  { time: [151.75, 152.28] },
  { time: [153.96, 154.26], actors: ["ref"] },
];

/**
 * The Korean basketball broadcast as one continuous 180-second programme.
 *
 * @evidence docs/body/screenplay/two-hands/010-game.md The gym, two teams, two officials, one ball and the two recorded camera views share the exact game clock through the closing rebound and horn.
 * @evidence contracts/development/composition.md#screenplay-realization The one scene plays intact: equalizing dunk, blue layup, out, timeout and replay, corner three, blue miss and white rebound.
 * @evidence contracts/development/composition.md#composition-only The game supplies the clock and blocking, the cast and ball realize the movements, and the broadcast supplies the camera, replay identification and score.
 * @evidence contracts/development/composition.md#living-scene All ten players and officials are updated on every seek. The replay maps to the original play while the broadcast score remains live.
 * @evidence contracts/development/common.md#meaningful-documentation The descriptor fixes 180 seconds at 24 fps and 1280 by 720. A completed mount exposes air-time seek and disposal of the owned Three.js scene.
 * @evidence contracts/development/implementation.md#principled-implementation Seek samples live and replay clocks through gameAt. Eight bounded cue windows blend the displayed joints across pose changes while preserving the current ball, route clock, and score.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The gym, cast, ball and broadcast own their scene objects. Each receives its part of the evaluated state, and the cast receives the active cue or bench schedule.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The renderer and inspector receive the same live scene and deterministic performance at every frame.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each mount caches the two endpoint stage states for eight cue windows. A frame checks those intervals once and evaluates a pose pair only for participating actors inside a window.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The same ball, teams and camera render the original play and its alternate-camera replay.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The returned mount invokes the four owners' disposers and clears the remaining scene. Its cached cue endpoints and the two bench schedules live with that mount.
 */
export function twoHands(): IFilm {
  return {
    durationSeconds: 180,
    fps: 24,
    width: 1280,
    height: 720,
    create: async (): Promise<IFilmProduction> => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.08, 100);
      scene.add(camera);
      const gym = createGym(scene);
      const cast = createPlayers(scene);
      const benchMotion = createBenchMotion(cast.bodies);
      const basketball = createBasketball(scene);
      const broadcast = createBroadcast(camera);
      const blends = transitions.map(({ time: [from, to], actors, seats }) => ({
        from, to, actors, seats, earlier: gameAt(from), later: gameAt(to),
      }));
      return {
        scene, camera,
        seek(air: number): void {
          const state = gameAt(air);
          gym.seek(air, state);
          const blend = blends.find(({ from, to }) => state.play > from && state.play < to);
          cast.seek(state.players, state.ball, state.play, benchMotion(state.play), blend);
          const spinClock = state.play <= 66 ? state.play : state.play <= 136 ? 66 : 66 + Math.min(state.play - 136, 43);
          basketball.seek(state.ball, spinClock * 4.8);
          broadcast.seek(air, state);
          scene.updateMatrixWorld(true);
        },
        dispose(): void {
          broadcast.dispose();
          basketball.dispose();
          cast.dispose();
          gym.dispose();
          scene.clear();
        },
      };
    },
  };
}
