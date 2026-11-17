import { reportAutoMovieResourceRetirement } from "@automovie/render";
import * as THREE from "three";

import type { IFilm } from "../../IFilm";
import type { IFilmProduction } from "../../IFilmProduction";
import { Fighter } from "../../entities/cast/fighter/Fighter";
import { Referee } from "../../entities/cast/referee/Referee";
import { fighterCase } from "../scenes/catalog/fighter/fighterCase";
import { pressureCase } from "../scenes/catalog/pressure/pressureCase";
import { ringCase } from "../scenes/catalog/ring/ringCase";

/**
 * The review catalog: ring at 0–2 s, Owen at 2–4 s, Marek at 4–6 s,
 * and the unaccepted continuous opening/pressure rehearsal at 6–24 s.
 * These are module inspection intervals, not the commissioned fight.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Names every case interval, cast variant and the catalog's review-only scope.
 * @evidence contracts/development/implementation.md#principled-implementation Composes the same case modules the production will use, switches their visible scenes by interval and copies the active case's actual camera.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure One ordered case list, exact-time selection and complete owned cleanup.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts No scene-specific motion, fake media or claim that a catalog completes the film.
 * @evidence contracts/development/implementation.md#efficient-algorithms Four cases are prepared once; a seek evaluates only its active case.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Both fighters use one case function and all case objects survive across seeks.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Cleanup attempts every case's owned retirement and clears the catalog scene.
 * @evidenceExclude contracts/development/composition.md#screenplay-realization The catalog exhibits modules under review and is never the delivered round.
 * @evidence contracts/development/composition.md#composition-only Orders existing case modules; choreography stays in their interactions.
 * @evidence contracts/development/composition.md#living-scene Each active case supplies its native performers; the ring-only interval intentionally exhibits an empty set.
 */
export function catalog(): IFilm {
  return {
    durationSeconds: 24,
    fps: 30,
    width: 1280,
    height: 720,
    create: async (): Promise<IFilmProduction> => {
      const seed: string = "kickboxing/catalog";
      const owen: Fighter = new Fighter("owen", 0xb94439);
      const marek: Fighter = new Fighter("marek", 0x3978bc);
      const cases: { from: number; duration: number; production: IFilmProduction }[] = [
        { from: 0, duration: 2, production: ringCase(seed) },
        { from: 2, duration: 2, production: fighterCase(owen, seed) },
        { from: 4, duration: 2, production: fighterCase(marek, seed) },
        { from: 6, duration: 18, production: pressureCase(owen, marek, new Referee(), seed) },
      ];
      const scene: THREE.Scene = new THREE.Scene();
      scene.background = new THREE.Color(0x10151e);
      const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
      for (const item of cases) scene.add(item.production.scene);
      const caseAt = (seconds: number): (typeof cases)[number] => cases.findLast(item => seconds >= item.from) ?? cases[0]!;
      return {
        scene,
        camera,
        markKinds: [...new Set(cases.flatMap(item => item.production.markKinds ?? []))],
        marks: seconds => {
          const active = caseAt(seconds);
          return active.production.marks?.(Math.min(active.duration, seconds - active.from)) ?? [];
        },
        seek: (seconds: number): void => {
          const active = caseAt(seconds);
          for (const item of cases) item.production.scene.visible = item === active;
          active.production.seek(Math.min(active.duration, seconds - active.from));
          camera.copy(active.production.camera);
          scene.updateMatrixWorld(true);
        },
        dispose: (): void => reportAutoMovieResourceRetirement([
          ...cases.map((item): (() => void) => (): void => item.production.dispose()),
          (): void => { scene.clear(); },
        ]),
      };
    },
  };
}
