import { roundInterpolation } from "./roundInterpolation";

const { rise, mix, wave } = roundInterpolation;
type Triple = [number, number, number];

type View = [time:number,eye:Triple,look:Triple,lens:number];
type ViewTarget = { eye: Triple; look: Triple; lens: number };
type ViewChange = [interval: [number, number, number, number], eye: Triple, look: Triple, lens: number];
const views: View[] = [
  [0,[.32,2.71,7.90],[.04,.47,.49],42.8],[.58,[.32,2.71,7.90],[.04,.47,.49],42.8],
  [1.58,[.35,2.56,6.43],[.02,.66,.23],38.6],[2.65,[.35,2.56,6.43],[.02,.66,.23],38.6],
  [6.1,[.14,2.49,6.29],[-.32,.89,-.05],35.8],[10.60,[-.33,2.44,5.69],[-.77,.80,-.32],35.4],
  [14.40,[-3.02,2.74,7.18],[-2.42,.52,1.65],42.8],[18.7,[-3.92,2.81,5.54],[-2.18,.65,1.19],39.5],
  [22.2,[-3.17,2.58,5.31],[-2.05,.76,.69],35.6],[27.9,[-3.52,2.91,5.83],[-2.11,.77,-.39],37.0],
  [32.6,[-2.98,2.83,6.13],[-1.32,.72,-1.46],32.0],[37.4,[-4.15,3.16,5.21],[-1.95,.68,-1.63],33.6],
  [40.15,[-3.84,3.17,5.42],[-1.57,.69,-1.60],34.9],[42.05,[-3.72,3.08,5.30],[-1.49,.63,-1.26],35.7],
  [46.8,[-4.45,2.91,4.65],[-.85,.78,-.45],35.4],[51.10,[-4.24,2.85,4.64],[.46,.78,.06],35.4],
  [55.60,[-3.62,3.01,4.90],[.35,.65,-.72],37.9],[58.8,[1.04,3.11,5.93],[.31,.61,-.91],39.6],
  [62.45,[2.63,3.55,6.84],[1.60,.43,.35],43.6],[69.5,[2.63,3.55,6.84],[1.60,.43,.35],43.6],
  [74.4,[3.67,2.91,6.55],[1.96,.70,-.62],35.2],[78.35,[4.26,3.55,5.41],[2.06,.67,-2.59],33.6],
  [83.35,[3.23,2.97,5.52],[2.21,.76,-.48],34.5],[88.0,[3.23,2.96,6.37],[2.13,.61,.82],39.0],
  [92.90,[3.22,3.30,6.59],[2.02,.49,2.22],41.8],[95.32,[4.35,3.25,6.57],[1.95,.49,2.01],41.2],
  [98.40,[4.35,3.42,6.71],[1.79,.40,2.05],43.7],
  [104.3,[-2.17,3.03,7.24],[-2.49,.40,2.20],46.0],[108.7,[-3.20,3.07,6.85],[-2.36,.45,1.74],42.5],
  [114.7,[-3.40,2.89,6.68],[-2.36,.47,1.51],42.1],[118.24,[-3.40,2.89,6.68],[-2.34,.26,1.36],42.1],
  [120.35,[-4.36,2.35,4.85],[-2.18,.83,-.55],33.2],
  [123.15,[-4.57,2.64,4.67],[-2.18,.76,-.56],33.8],[127.5,[-3.61,2.74,5.06],[-1.57,.76,-1.53],34.9],
  [132.65,[-3.82,2.74,4.91],[-.71,.73,-.32],36.8],[138.90,[-4.52,2.93,4.75],[-.20,.71,-.42],36.2],
  [146.70,[-3.75,3.21,4.92],[-1.63,.76,-1.97],31.8],[151.08,[-3.75,3.21,4.92],[-1.63,.76,-1.97],31.8],
  [156.90,[-1.65,4.45,7.36],[.45,.05,.43],44.0],[166.80,[-1.65,4.45,7.36],[.45,.05,.43],44.0],
  [170.00,[.56,4.62,7.78],[.15,.18,.33],45.0],[180,[.56,4.62,7.78],[.15,.18,.33],45.0]
];
function baseCameraAt(t:number) {
  let i=1;while(i<views.length-1 && t>views[i][0]) i++;
  const a=views[i-1],b=views[i],u=rise(t,a[0],b[0]);
  const blend=(v:Triple,w:Triple):Triple=>[mix(v[0],w[0],u),mix(v[1],w[1],u),mix(v[2],w[2],u)];
  return {eye:blend(a[1],b[1]),look:blend(a[2],b[2]),lens:mix(a[3],b[3],u)};
}

const viewChanges: ViewChange[] = [
  [[62.3,64.5,73.54,75.0],[3.06,3.40,7.10],[1.59,.49,.38],44.1],
  [[74.18,76.68,79.12,82.15],[4.89,3.43,5.69],[1.43,.77,-2.29],34.9],
  [[96.16,97.70,99.52,101.31],[4.48,3.27,6.76],[1.82,.46,2.12],44.1],
  [[118.74,119.90,122.48,124.33],[-.86,2.78,5.35],[-2.19,.77,-.57],31.4],
  [[123.18,125.90,129.36,131.95],[.36,2.94,5.73],[-1.65,.67,-1.58],31.3],
  [[145.61,147.40,151.10,153.93],[-4.84,3.51,4.72],[-1.82,.67,-2.16],29.5],
  [[151.10,156.90,166.80,170.0],[-1.04,4.65,7.21],[.28,.14,.28],44.1],
  [[63.25,65.21,73.55,74.90],[3.73,3.18,6.50],[1.70,.44,.31],46.8],
  [[76.92,78.02,78.63,80.22],[4.61,3.60,5.55],[1.39,.87,-2.40],34.0],
  [[97.91,98.62,99.56,100.68],[4.38,3.06,6.53],[1.72,.47,2.03],45.0],
];

function moveView(view: ViewTarget, eye: Triple, look: Triple, lens: number, weight: number): void {
  for (const axis of [0, 1, 2] as const) {
    view.eye[axis] = mix(view.eye[axis], eye[axis], weight);
    view.look[axis] = mix(view.look[axis], look[axis], weight);
  }
  view.lens = mix(view.lens, lens, weight);
}

/**
 * Samples the south-apron camera at a finite programme second. Returns new eye and look coordinates in metres and a vertical field of view in degrees.
 *
 * @evidence contracts/development/common.md#meaningful-documentation States the clock, world coordinates, lens units and returned ownership.
 * @evidence contracts/development/implementation.md#principled-implementation Eased interpolation brackets the request on the base track. Further windows blend eye, target and lens for specific sightlines.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure The base interpolation owns travel. Adjustment windows select the current viewing target, and the scene applies the returned view.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The keys and blend windows are authored framing inputs. Each sample is evaluated from its requested time.
 * @evidence contracts/development/implementation.md#efficient-algorithms A bounded scan brackets the base track and visits every possible adjustment. Only the fresh view is changed.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The camera keys are reused on every seek, while the result remains independent across callers.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The module keeps fixed keys and adjustments. It opens no handles.
 * @evidence contracts/development/composition.md#screenplay-realization The view opens the witnesses' profile, rises towards far white and widens for the count before settling on the ending.
 * @evidence contracts/development/composition.md#composition-only World coordinates and timing windows are the local camera plan. This module directly interpolates the view instead of receiving an installed camera capability.
 * @evidence contracts/development/composition.md#living-scene The opening feet, witnesses, count and late split attention motivate camera adjustments in one uncut view.
 */
export function cameraAt(t: number): ViewTarget {
  const view = baseCameraAt(t);
  for (const [interval, eye, look, lens] of viewChanges) {
    const weight = wave(t, ...interval);
    if (weight > 0) moveView(view, eye, look, lens, weight);
  }
  const ending = rise(t, 166.8, 170);
  if (ending > 0) moveView(view, [1.06,4.54,7.75], [.38,.23,.25], 45.8, ending);
  const witnesses = rise(t, 169.60, 172.22);
  if (witnesses > 0) moveView(view, [3.70,3.05,6.00], [1.25,.14,.42], 52.7, witnesses);
  return view;
}
