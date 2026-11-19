import { AutoMovieHumanHeadAnatomy, type IAutoMovieHumanHeadIdentity } from "@automovie/human";

/**
 * Builds a canonical Human head identity from stature in millimetres. The identity carries millimetre dimensions, with a dimensionless cephalic percentage. The caller supplies the cast member's configured adult stature.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment gives the input and output meanings, measurement units and adult casting domain.
 * @evidence contracts/development/implementation.md#principled-implementation The installed Human series supplies the central adult measurements and stature regressions. Cephalic index is breadth divided by length and multiplied by 100.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The package owns the reference coefficients. This function applies them and builds the typed face and ear records required by canonical preparation.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The shared anthropometric series supplies the dimensions for all cast stature inputs. The function does not fit to a named person or fixture image.
 * @evidence contracts/development/implementation.md#efficient-algorithms A fixed set of regressions and field assignments uses constant time and space.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Inputs reuse the installed immutable reference table. Fresh identity objects keep one actor's values independent of the others.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The result belongs to the caller. The function keeps no mutable state or resource handle.
 * @evidence contracts/development/entities.md#settings-realization The 180 cm fighter stature in docs/body/brief/cast/owen-vale.md#red-corner and docs/body/brief/cast/marek-sokol.md#blue-corner sets the input for those roles. Installed anthropometry supplies dimensions. The cast module uses the result in the mounted canonical body and draws its separate stylized facial geometry.
 * @evidence contracts/development/entities.md#object-shape Returns a fresh canonical head description from one measurement. There is no retained motion state or display root here.
 * @evidence contracts/development/entities.md#controls-and-source The installed Human anthropometry table is the fixed source. This helper feeds canonical preparation, while the visible head lofts and actor-specific facial silhouettes remain with createActor.
 */
export function head(stature: number): IAutoMovieHumanHeadIdentity {
    const source: typeof AutoMovieHumanHeadAnatomy = AutoMovieHumanHeadAnatomy;
    const length: number =
      source.HEAD_LENGTH_ON_STATURE[1].a +
      source.HEAD_LENGTH_ON_STATURE[1].b * stature;
    const breadth: number =
      source.HEAD_BREADTH_ON_STATURE[1].a +
      source.HEAD_BREADTH_ON_STATURE[1].b * stature;
    const eye: IAutoMovieHumanHeadIdentity["face"]["eyePair"]["left"] = {
      palpebralFissureLength: source.FACE.palpebralFissureLength[1],
      palpebralFissureHeight: source.FACE.palpebralFissureHeight[1],
    };
    const ear: IAutoMovieHumanHeadIdentity["earPair"]["left"] = {
      length: source.EAR.length[1],
      breadth: source.EAR.breadth[1],
      protrusion: source.EAR.protrusion[1],
    };
    return {
      length,
      cephalicIndex: (100 * breadth) / length,
      circumference:
        source.HEAD_CIRCUMFERENCE_ON_STATURE[1].a +
        source.HEAD_CIRCUMFERENCE_ON_STATURE[1].b * stature,
      height: stature / source.STATURE_OVER_HEAD_HEIGHT,
      faceHeight: source.FACE.faceHeight[1],
      faceWidth:
        source.FACE_WIDTH_ON_STATURE[1].a +
        source.FACE_WIDTH_ON_STATURE[1].b * stature,
      mandibularWidth: source.FACE.mandibularWidth[1],
      minimumFrontalWidth: source.FACE.minimumFrontalWidth[1],
      mouthOpening: source.FACE.mouthOpening[1],
      mandibularLaterotrusion: source.FACE.mandibularLaterotrusion[1],
      face: {
        eyePair: { left: eye, right: { ...eye } },
        intercanthalWidth: source.FACE.intercanthalWidth[1],
        nose: {
          width: source.FACE.noseWidth[1],
          height: source.FACE.noseHeight[1],
          protrusion: source.FACE.noseProtrusion[1],
        },
        mouth: {
          width: source.FACE.mouthWidth[1],
          upperVermilionHeight: source.FACE.upperVermilionHeight[1],
          lowerVermilionHeight: source.FACE.lowerVermilionHeight[1],
        },
      },
      earPair: { left: ear, right: { ...ear } },
    };
  }
