import { courtHoop } from "../../../../entities/sets/shohoku-gym/courtHoop";

type FloorKey = [second: number, x: number, z: number];
type Point = [x: number, y: number, z: number];
type Actor = {
  x: number;
  z: number;
  y: number;
  yaw: number;
  action: string;
  phase: number;
  seated: boolean;
  hand: "left" | "right" | "both";
  target?: Point;
};
type Frame = {
  play: number;
  replay: boolean;
  remaining: number;
  attack: number | null;
  home: number;
  away: number;
  players: Record<string, Actor>;
  ball: Point;
  cameraFocus: Point;
};

// X runs baseline to baseline. Home's attacking right wing faces the table (+Z).
// Each route includes the off-ball work that makes its next possession possible.
const firstHalf: Record<string, FloorKey[]> = {
  w7: [[0,5.6,-0.4],[5,5.9,-0.1],[8,5.5,-0.1],[11,5.1,-0.3],[14,6.3,0.25],[17,7.7,-1.4],[21,10.1,-3.35],[23,11,-3.5],[25.2,11,-3.5],[28,7.8,0.5],[34,-1.3,0.3],[36.5,-4.75,0.2],[38,-5.45,-0.15],[44,-5.9,0.6],[49,-6.7,0.2],[52,-8.6,0.5],[55,-10,0.8],[61,0.05,0.4],[63,3.1,0.7],[66,6.5,4.3],[69,6.2,5.2]],
  w11: [[0,6.6,-5.5],[7.5,6.8,-5.5],[10.5,7.1,-5.8],[14,9.2,-6],[19,12,-6.2],[25,12,-6.2],[33,-2,-4.8],[38,-6.7,-4.8],[44,-6.9,-5.1],[52,-7,-5.2],[55,-4.7,-5.1],[62,5.5,-5],[69,7.4,-5.1]],
  w14: [[0,8.2,5.15],[8.5,8.5,5.3],[14,9,5.8],[18,9.8,5.95],[22,11.8,6.6],[25.3,11.8,6.6],[29,5.7,4.15],[33,-2.9,3.7],[37,-7.6,4.4],[41,-8,4.2],[44.6,-8.55,3.85],[46.3,-8.9,3.95],[48.2,-9.65,3.45],[50.8,-11.35,1.9],[52,-12.1,1.05],[55,-9.1,4.7],[61,1.7,6.2],[64,6,6.65],[65.8,7.05,7.05],[69,7.1,7]],
  w4: [[0,12,3.4],[11,12.15,3.5],[18,12.3,3.55],[21,12.45,3.45],[23,12.55,2.3],[23.85,12.45,1.25],[24.55,12.2,0.26],[25.35,12.18,0.25],[26.8,11.3,-0.35],[34,-7,-1.55],[39,-11.5,-1.3],[48,-11.65,-1.6],[51.5,-11.9,-1.05],[52.4,-12.45,-0.25],[54.15,-14.35,-0.45],[55,-14.35,-0.45],[57,-11,-1.5],[64,2.4,-0.9],[69,3.9,-0.2]],
  w10: [[0,8.6,2.6],[11.5,8.6,2.6],[17,7.55,3.55],[23,7.3,3.8],[25.4,7.3,3.8],[34,-5.4,2.7],[37,-7.3,2.8],[43,-8.4,3.05],[46,-7.97,1.44],[46.9,-9.1,2.3],[50,-9.7,1.85],[52,-10.05,1.9],[55,-6,1.4],[63,5.3,1.6],[69,7.6,2.4]],
  b4: [[0,6.8,-0.35],[4,6.9,-0.1],[10,6.8,-0.55],[14,7.25,0.55],[17,7.6,-0.6],[21,9.3,-2.8],[23,10.3,-2.85],[25,9.8,-2.35],[28,9.4,0.05],[34,-0.05,0.05],[37,-4.2,-0.4],[42,-4.9,0.2],[48,-5.55,0.15],[52,-5.7,-0.65],[55,-6,-0.4],[61,1,-0.05],[65,4.55,0.55],[69,5.85,1.85]],
  b9: [[0,7.55,-4.8],[7,7.5,-4.9],[11,8,-5.1],[18.5,11.75,-5.5],[25,11.6,-5.5],[32.8,0.45,-5],[37,-6.2,-5.65],[42,-6.65,-6],[52,-7.2,-6],[56,-2.6,-5.55],[62,6.3,-4.5],[69,8.3,-4.4]],
  b7: [[0,9.2,4.4],[8,9.25,4.6],[15,9.65,5],[18,10.05,5.15],[22,11.55,5.85],[24.5,11.55,5.85],[26.3,8.9,4.7],[31,0.15,4.45],[36,-7.25,5.5],[41,-7.65,5.05],[44.5,-7.92,3.18],[45.4,-8.36,2.78],[46,-8.9,2.6],[48.9,-10.8,2.1],[51,-11.95,1.25],[52.4,-12.9,0.45],[53.2,-13,0.25],[55,-8.7,4.2],[61,1.95,5.55],[64.05,6.45,6.4],[65.4,6.8,6.6],[69,6.7,6.5]],
  b5: [[0,11.1,2.75],[15,11.45,2.65],[18.5,11.55,2.35],[21.6,11.3,-0.65],[23,11.35,-1.75],[24.5,12,-0.95],[25.7,12.5,-0.25],[27,14.35,0.25],[28.1,14.35,0.25],[34,-3.15,-2.6],[39,-11.1,-2.35],[48,-11.2,-2.65],[52,-11.6,-2.35],[56,-7,-2],[64,3.75,-1.4],[69,6.55,-1.25]],
  b8: [[0,9.45,2.35],[11.5,9.45,2.35],[17.4,8.15,3.25],[23,8.05,3.35],[25.2,8.05,3.35],[34,-4.55,2.4],[38,-7.2,3.65],[43,-8.55,3.45],[47.7,-8.55,3.45],[51,-8.75,2.65],[55,-5.75,2.15],[64,6.2,2.1],[69,8.3,1.85]],
  ref: [[0,1.15,6.55],[13,3.1,6.5],[23,5.6,6.6],[25,5.65,6.6],[35,-4.2,6.55],[50,-7,6.65],[54,-6.3,6.65],[63,4.15,6.85],[65,5.9,7.4],[67.2,7.5,8.05],[69,7.7,7.8]],
  ref2: [[0,13.55,-6.8],[23,13.6,-5.65],[25.4,13.6,-5.65],[37,0,-6.65],[51,-5.6,-6.65],[55,-5.45,-6.6],[65,1.5,-6.45],[69,2.1,-5.1]],
};

const seats: Record<string, number> = {
  w7: -5.9, w11: -2.05, w14: -5, w4: -4.05, w10: -3.05,
  b4: 6.25, b5: 4.95, b7: 7.25, b8: 2.55, b9: 3.75,
};
const secondHalf: Record<string, FloorKey[]> = {
  w7: [[129,4.6,4.5],[134,5.4,4.4],[136,6.15,3.9],[138,5.45,1.6],[140.7,5.5,-0.35],[144,8.1,-1.8],[146,10.7,-3.05],[149,11.15,-3.2],[152,10.2,-2.6],[155,7.6,-0.5],[161,-1.1,-0.3],[166,-5.5,0.12],[170,-6.25,0.45],[176,-6,0.3],[180,-6.8,-0.5]],
  w11: [[129,6.3,-5.4],[136,6.5,-5.5],[140,7.1,-5.45],[144,10.4,-6.2],[150,11.7,-6.1],[152,11.6,-6.1],[155,6.6,-4.92],[161,-2.7,-4.9],[167,-7.1,-4.1],[170,-7.65,-3.42],[172.9,-8.85,-1.78],[175,-8.95,-3.58],[176.7,-8.05,-4.8],[177.3,-8.15,-5],[180,-8.35,-4.5]],
  w14: [[129,7.55,7.8],[135.9,7.55,7.8],[140,10.75,6.45],[144,11.8,6.55],[147.2,11.8,6.55],[148.25,12.05,6.55],[151.8,12.05,6.55],[153,10.65,6.45],[156,5.7,4.32],[161,-3.4,4.45],[167,-7.55,4.25],[169.3,-8.25,4.3],[172,-8.4,4.35],[180,-9,3.1]],
  w4: [[125,2.1,6.65],[127,7.9,5.1],[129,12.1,3.4],[141,12.15,3.52],[144,12.2,3.65],[146.6,11.95,2.96],[149.1,11.95,2.96],[150,12.15,2.4],[152,12.3,1.3],[161,-3.15,-0.8],[169,-11.3,-1.4],[174.5,-11.8,-0.65],[176.7,-11.72,-0.65],[178,-11.9,-0.45],[180,-11.93,-0.45]],
  w10: [[125,0.65,4.25],[127.4,5.8,2.45],[129,8.6,2.8],[140,8.2,3.2],[146,7.9,3.55],[152,7.85,3.55],[161,-4.6,2.5],[168,-7.5,1.2],[173.6,-8.4,-1.55],[176.5,-8.55,-1.6],[178,-8.95,-0.95],[179,-9.05,0.2],[180,-9.15,0.18]],
  b4: [[125,6.55,3.35],[129,6.15,3.7],[135,6.65,3.6],[136.5,6.92,3.3],[141,6.6,0.1],[144,8.05,-1],[146.3,10.15,-2.65],[152,10.8,-2],[155,10.6,-0.35],[161,-0.05,-0.25],[164,-3.55,-0.95],[168,-5,0.45],[172.5,-5.2,0.2],[175,-5.6,-0.5],[180,-6.25,-0.4]],
  b9: [[129,7.55,-4.7],[140,7.85,-4.8],[144,10.5,-5.4],[152,11.35,-5.3],[161,-2.2,-6],[166,-7.5,-5.5],[171,-8.75,-3.65],[173.2,-8.98,-2.6],[173.7,-8.68,-3.1],[175,-7.85,-4.5],[176.5,-7.9,-5.55],[177.5,-7.95,-5.55],[180,-8.1,-5.35]],
  b7: [[129,7.55,6.95],[136,7.3,6.65],[141,10.6,5.8],[144,11.55,5.85],[145.48,12.74,3.55],[146.75,11.82,1.72],[149,11.82,1.72],[149.57,12.63,2.08],[149.9,12.89,2.86],[150.15,12.65,3.62],[151.3,11.94,5.5],[152,11.9,5.95],[155,6.1,5.25],[161,-3.6,5.5],[166,-7.65,5.3],[170,-8.3,5.13],[172,-8.35,5.2],[180,-9.15,4]],
  b5: [[129,11.15,2.45],[142,11.3,2.5],[144,11.15,1.4],[146,11.1,-1.65],[148.3,11.5,-0.55],[150.6,12.1,-0.55],[152.5,12.43,0.18],[154.2,14.3,0.4],[155,14.3,0.4],[161,0.85,-1.7],[168,-10.5,-2.1],[172,-11.3,-1.6],[176.6,-11.33,-1.35],[178.4,-11.48,-1.05],[180,-11.5,-1.07]],
  b8: [[129,9.4,2.45],[141,9.05,2.6],[146,8.7,3.05],[152,8.75,3.08],[161,-4,3.1],[167,-6.9,1.85],[173.15,-8.05,-2.58],[175.6,-8.05,-2.58],[178.1,-8.3,-1.95],[179,-8.52,-0.42],[180,-8.6,-0.45]],
  ref: [[129,7.75,8.55],[132.8,7.75,8.55],[135.8,7.35,8.25],[143,5.45,7.1],[152,7.75,7.1],[157,5,7.05],[167,-5.75,6.95],[180,-8.25,7]],
  ref2: [[129,12.75,-6.8],[148,13.45,-6.5],[153,13.25,-6.45],[164,-0.4,-6.7],[177,-12.1,-6.8],[180,-12.45,-6.5]],
};

/** The captain walks the length of his own bench while each seated scorer remains in place. */
function timeout(id: string): FloorKey[] {
  if (id === "ref") return [[71.5,8.4,7.7],[76.5,9.55,8],[116,9.55,8],[126.2,8.25,7.9]];
  if (id === "ref2") return [[79,2.2,5.4],[118,2.2,5.4]];
  const x = seats[id];
  const atBench: FloorKey[] = id === "b4" ? [
    [80,6.25,8.5],[89.5,6.25,8.5],[93.6,7.02,8.06],[98,7.02,8.06],
    [103,2.45,7.74],[104.65,1.81,8.18],[108.5,1.81,8.18],
    [111.6,1.28,7.04],[115.7,1.28,7.04],[119,3.38,7.74],
  ] : id === "w14" ? [[80,x,8.7],[81.45,x,8.7],[82.6,x-.19,8.7],[84,x,8.7],[119,x,8.7]]
    : [[80,x,8.7],[119,x,8.7]] as FloorKey[];
  if (id === "b5") atBench.unshift([74,4.5,2.75]);
  if (id === "b4") atBench.unshift([73.5,5.81,3.88]);
  if (id === "b9") atBench.unshift([76.8,5.13,4.9]);
  return [...atBench,[122.5,x,7.8]];
}

const tracks: Record<string, FloorKey[]> = Object.fromEntries(
  Object.entries(firstHalf).map(([id, first]) => [id, [...first, ...timeout(id), ...secondHalf[id]]]),
);

/** Stops at the specified mark, with short acceleration ramps and a full-speed middle. */
function ramp(u: number): number {
  const edge = 0.13;
  if (u < edge) return u*u/(2*edge*(1-edge));
  if (u > 1-edge) return 1-(1-u)*(1-u)/(2*edge*(1-edge));
  return (u-edge/2)/(1-edge);
}

function floorAt(id: string, t: number): {x: number; z: number; dx: number; dz: number; speed: number} {
  const route = tracks[id];
  const last = route.length-1;
  let i = 0;
  while (i < last-1 && route[i+1][0] <= t) ++i;
  const [start,x,z] = route[i];
  const [end,nextX,nextZ] = route[i+1];
  const u = Math.min(1, Math.max(0,(t-start)/(end-start)));
  const weight = ramp(u);
  return {x:x+(nextX-x)*weight,z:z+(nextZ-z)*weight,dx:nextX-x,dz:nextZ-z,speed:Math.hypot(nextX-x,nextZ-z)/(end-start)};
}

type Cue = [start: number, end: number, action: string];
const cues: Record<string,Cue[]> = {
  w7: [[0,3.2,"dribble"],[3.2,4,"pass"],[8.1,9,"catch"],[9,22.8,"dribble"],[22.8,23.8,"pass"],[54.8,55.3,"catch"],[55.3,63.05,"dribble"],[63.05,64.3,"pass"],[135.8,136.6,"catch"],[136.6,137.25,"pass"],[139.65,140.2,"catch"],[140.2,145.75,"dribble"],[145.75,146.75,"pass"]],
  w11: [[3.85,5,"catch"],[7,8.25,"pass"],[137.65,138.35,"catch"],[138.65,139.8,"pass"],[175.7,177.55,"guard"]],
  w4: [[23.63,24.12,"catch"],[24.12,25.55,"dunk"],[52.35,53,"catch"],[54,55,"pass"],[146.65,147.65,"catch"],[148.6,149.55,"pass"],[176.45,180.1,"boxout"]],
  w14: [[7.5,12.2,"catch"],[19.3,24.6,"catch"],[63,65.45,"catch"],[132.25,133.1,"catch"],[134.15,136,"pass"],[147.35,150.05,"catch"],[150.3,151.85,"shot"]],
  w10: [[44.5,47.5,"point"],[177.85,180.1,"board"]],
  b4: [[27.85,28.4,"catch"],[28.4,36.45,"dribble"],[36.45,37.2,"pass"],[39.9,40.65,"catch"],[40.65,48.3,"dribble"],[48.3,49.35,"pass"],[92.3,96.25,"slap"],[104,108.6,"slap"],[154.85,155.3,"catch"],[155.3,166.8,"dribble"],[166.8,167.75,"pass"],[171.95,172.55,"catch"],[172.55,174.7,"dribble"],[174.7,175.65,"pass"]],
  b5: [[25.4,26.1,"catch"],[27.2,28.05,"pass"],[152.25,153.15,"catch"],[154,155,"pass"]],
  b7: [[49.1,49.9,"catch"],[50,52.1,"layup"],[63.45,64.55,"guard"],[92.3,96.25,"slap"],[96.25,99.15,"point"],[112.1,115.9,"slap"],[145.7,149.1,"guard"],[150.85,152,"guard"],[167.5,168.1,"catch"],[168.1,169.6,"dribble"],[171.05,172.05,"pass"]],
  b8: [[42.7,47.6,"screen"],[104,108.6,"slap"],[110.8,113.4,"layup"],[172.8,175.6,"screen"],[178,179.7,"board"]],
  b9: [[36.9,37.75,"catch"],[39,40.2,"pass"],[175.45,176.4,"catch"],[176.4,177.9,"shot"]],
  ref: [[65,67,"signal"],[67,68.4,"catch"],[68.4,69.4,"point"],[132.1,133.2,"pass"],[134,136.1,"signal"],[151.9,154.1,"signal"]],
  ref2: [[67.8,70.1,"signal"]],
};

const jumps: Record<string, [number,number,number][]> = {
  w4:[[24.12,25.59,0.88],[146.58,147.15,0.18]],
  w14:[[150.63,151.6,0.48]], b7:[[50.52,51.57,0.56],[151.04,151.68,0.33]],
  b9:[[176.55,177.52,0.52]], w11:[[176.73,177.38,0.32]], w10:[[178.47,179.52,0.48]],
  b8:[[178.59,179.48,0.36]],
};

function jumpAt(id: string, t: number): number {
  const jump = jumps[id]?.find(([begin,end]) => begin <= t && t <= end);
  if (!jump) return 0;
  const u = (t-jump[0])/(jump[1]-jump[0]);
  return 4*jump[2]*u*(1-u);
}

// Held-ball keys stay attached to the moving performer. Every flight shares its two
// endpoint keys with its neighbours. A bounce has its own floor contact, at ball radius.
type Endpoint = {id: string; dx: number; height: number; dz: number} | Point;
type BallKey = {at: number; end: Endpoint; arc?: number; dribbles?: number};
const hand = (id: string, dx: number, height: number, dz: number): Endpoint => ({id,dx,height,dz});
const key = (at: number, end: Endpoint, arc=0, dribbles=0): BallKey => ({at,end,arc,dribbles});
const ballKeys: BallKey[] = [
  key(0,hand("w7",0.22,1.01,0.34),0,1),key(0.64,hand("w7",0.24,1.04,-0.32),0,5),key(3.25,hand("w7",0.24,1.15,-0.17),0.13),
  key(4,hand("w11",-0.12,1.42,0.25)),key(7.35,hand("w11",-0.1,1.5,0.29),0.19),
  key(8.3,hand("w7",0,1.28,-0.26),0,18),key(20.6,hand("w7",0.17,0.92,-0.33),0,3),
  key(23,hand("w7",0.26,0.83,0.05)),key(23.38,[11.9,0.12,-0.75],0.34),
  key(23.82,hand("w4",-0.15,1.22,0.02)),key(24.14,hand("w4",0.07,1.45,-0.19),0.06),
  key(24.56,[12.425,3.22,0.42],0.02),key(24.64,[12.425,3.29,0.09],0.01),
  key(24.7,[12.425,3.25,0]),key(24.84,[12.425,3.05,0]),key(25,[12.425,2.58,0]),
  key(25.65,hand("b5",-0.04,1.06,0.12)),key(27.4,hand("b5",-0.25,1.37,-0.12),0.16),
  key(28,hand("b4",0.18,1.18,0.05),0,12),key(36.55,hand("b4",-0.12,1.39,-0.2),0.25),
  key(37.15,hand("b9",0.12,1.45,0.17)),key(39.32,hand("b9",0.12,1.95,0.2),0.18),
  key(40.14,hand("b4",-0.12,1.32,-0.21),0,11),key(48.49,hand("b4",-0.25,1.05,0.17)),
  key(48.91,[-8,0.12,1.2],0.32),key(49.4,hand("b7",-0.14,1.12,-0.12)),
  key(51,hand("b7",-0.34,2.12,-0.13),0.43),key(51.53,courtHoop.leftBoardBank,0.06),
  key(51.87,[-12.425,3.05,0]),key(52,[-12.425,2.72,0]),key(52.69,hand("w4",-0.08,1.06,0.01)),
  key(54.25,hand("w4",0.29,1.47,0.01),0.21),key(55,hand("w7",-0.12,1.19,0.1),0,12),
  key(63.12,hand("w7",0.22,1.46,0.21),0.33),key(64.08,hand("b7",0.12,1.83,0.32),0.24),
  key(65,[7.38,0.12,7.72],0.62),key(66.35,[7.57,0.12,8.19],0.14),
  key(67.4,hand("ref",0.0,0.64,0.15)),key(69,hand("ref",-0.15,1.12,0.16)),
  key(132.35,hand("ref",-0.16,1.23,-0.2)),key(132.9,hand("w14",0.1,1.29,0.18)),
  key(135.18,hand("w14",-0.03,2.05,-0.15),0.2),key(136,hand("w7",0.12,1.35,0.12)),
  key(136.92,hand("w7",0.12,1.43,-0.26),0.25),key(137.82,hand("w11",0.05,1.47,0.21)),
  key(139.03,hand("w11",-0.06,1.53,0.22),0.19),key(139.83,hand("w7",0.05,1.22,-0.25),0,8),
  key(145.97,hand("w7",0.2,1.02,0.1)),key(146.3,[11.65,0.12,-0.1],0.3),
  key(146.93,hand("w4",-0.13,1.42,-0.14)),key(149,hand("w4",0.03,1.45,0.26),0.13),
  key(149.77,hand("w14",-0.14,1.48,-0.23)),key(151,hand("w14",0.06,2.15,-0.18),1.56),
  key(151.87,[12.425,3.05,0]),key(152,[12.425,2.7,0]),key(152.74,hand("b5",-0.05,1.14,0)),
  key(154.18,hand("b5",-0.26,1.47,0),0.2),key(155,hand("b4",0.09,1.23,0.16),0,17),
  key(166.95,hand("b4",-0.12,1.48,0.16),0.2),key(167.77,hand("b7",0.08,1.25,-0.12),0,1),
  key(169.4,hand("b7",-0.15,1.04,0.25)),key(171.2,hand("b7",0.1,1.84,-0.16),0.26),
  key(172.12,hand("b4",-0.12,1.27,0.08),0,3),key(174.85,hand("b4",-0.11,1.49,-0.2),0.18),
  key(175.65,hand("b9",0.15,1.43,0.12)),key(177,hand("b9",-0.18,2.08,0.15),1.46),
  key(178,courtHoop.leftRimRebound,1.2),key(179,hand("w10",-0.03,1.97,0.03)),
  key(179.62,hand("w10",-0.26,1.29,0.12)),key(180,hand("w10",-0.28,1.25,0.12)),
];

function pointAt(end: Endpoint, t: number): Point {
  if (Array.isArray(end)) return end;
  const p = floorAt(end.id,t);
  return [p.x+end.dx, end.height+jumpAt(end.id,t), p.z+end.dz];
}

function ballAt(t: number): Point {
  let i = 0;
  while (i < ballKeys.length-2 && ballKeys[i+1].at <= t) ++i;
  const a=ballKeys[i], b=ballKeys[i+1];
  const u = (t-a.at)/(b.at-a.at);
  const held = !Array.isArray(a.end) && !Array.isArray(b.end) && a.end.id===b.end.id;
  const from=pointAt(a.end,held?t:a.at), to=pointAt(b.end,held?t:b.at);
  const p: Point = [from[0]+(to[0]-from[0])*u, from[1]+(to[1]-from[1])*u, from[2]+(to[2]-from[2])*u];
  if (a.dribbles) {
    const bounce = Math.abs((u*a.dribbles)%1-0.5)*2;
    p[1] = 0.12+(p[1]-0.12)*bounce*(2-bounce);
  } else p[1] += 4*(a.arc??0)*u*(1-u);
  return p;
}

const matchups: Record<string,string> = {w7:"b4",w11:"b9",w14:"b7",w4:"b5",w10:"b8",b4:"w7",b9:"w11",b7:"w14",b5:"w4",b8:"w10"};

/** Production timing ledger. The period scoreboard itself has no possession-clock overlay. */
function attackRemaining(t: number): number | null {
  if (t < 25) return Math.ceil(28-t);
  if (t >= 28 && t <= 51) return Math.ceil(30-(t-28));
  if (t >= 55 && t <= 151) return Math.ceil(30-(Math.min(t,65)-55)-Math.max(0,t-136));
  if (t >= 155 && t <= 177) return Math.ceil(30-(t-155));
  if (t >= 179) return Math.ceil(30-(t-179));
  return null;
}

/** Camera A follows the possession across both baselines and through the two handclaps. */
const focus: FloorKey[] = [[0,7.5,0],[16,8.1,0],[24.4,9.7,0.5],[27.6,9.8,0.4],[34,-0.5,0.6],[39,-7.7,0],[51,-9.85,0.4],[54,-9.7,0],[61,-0.1,1.15],[65,6.9,5.6],[73,0.1,7.3],[80,-4.5,8.6],[82.99,-4.5,8.6],[90,6.75,8.5],[97,6.75,8.5],[105,3.25,8.4],[111,4.6,8.5],[118,4.85,8.5],[122,1.1,7.8],[128,4.1,5.9],[136,7.8,1.3],[144,8.5,0.2],[151.5,10,2.1],[154,10,1],[161,0.4,1],[168,-7.3,0],[176,-9,-1.1],[178,-10.1,-0.3],[180,-9.9,0.05]];

/** Focus knots use the same table-side coordinates as the participants. */
function cameraAt(t: number): Point {
  let i=0;
  while (i<focus.length-2 && focus[i+1][0]<=t) ++i;
  const [a,x,z]=focus[i], [b,xx,zz]=focus[i+1];
  const u=ramp(Math.min(1,Math.max(0,(t-a)/(b-a))));
  return [x+(xx-x)*u,1.15,z+(zz-z)*u];
}

/**
 * [The complete practice match](../../../../../docs/body/screenplay/two-hands/010-game.md) maps a broadcast second to the camera's action and the live scoreboard.
 *
 * Concretization: the seating marks run along the table-side sideline, the two screened cuts pass on opposite shoulders, and the captain covers the distance between two bench seats at walking pace.
 *
 * @evidence contracts/development/composition.md#screenplay-realization Ten field players and two officials occupy the screenplay's 11 intervals. Staging puts the benches beside the table and the two rim centres at opposite signed X coordinates.
 * @evidence contracts/development/composition.md#composition-only The scene supplies timed movement destinations, jump and hand targets, ball contacts and focus for the film's articulated performers and camera. Ball trajectories meet the same keyed contacts at every seek.
 * @evidence contracts/development/composition.md#living-scene Each player follows a distinct route to the benches and the restart. The centre's cut, the corner help defender's route, and the last screen's two nearby defenders occupy separate staging positions.
 * @evidence docs/body/screenplay/two-hands/010-game.md The complete practice match runs from the first 48–50 possession to the secured rebound and 53–52 buzzer.
 * @evidence docs/body/screenplay/two-hands/010-game.md#east-basket The opening five matchups leave the baseline cut to the home centre.
 * @evidence docs/body/screenplay/two-hands/010-game.md#first-drive The white guards exchange a pass before white 7 drives away from the right corner. The animated bait interval uses the left-hand dribble cue.
 * @evidence docs/body/screenplay/two-hands/010-game.md#dunk The pass bounces below blue 5, white 4 rises with it and meets the rim.
 * @evidence docs/body/screenplay/two-hands/010-game.md#other-end The teams reverse ends after scoring and again on the next inbound.
 * @evidence docs/body/screenplay/two-hands/010-game.md#blue-run Blue 7 runs ahead while blue 4 crosses half court with the ball.
 * @evidence docs/body/screenplay/two-hands/010-game.md#blue-layup Blue 8 screens, blue 7 cuts behind the screen and banks the layup.
 * @evidence docs/body/screenplay/two-hands/010-game.md#out Blue 7 reaches toward the sampled ball near the sideline and the 65-second key puts its centre beyond the court line.
 * @evidence docs/body/screenplay/two-hands/010-game.md#timeout The running-clock interval splits around the stopped 44 seconds, and the actual possession persists through the replay and bench exchange.
 * @evidence docs/body/screenplay/two-hands/010-game.md#benches The officials retrieve the ball and signal the timeout. Both fives arrive at their respective seats.
 * @evidence docs/body/screenplay/two-hands/010-game.md#replay The insert covers air time 83 to just before 90 and samples original play time 18 to just before 25. Its last 24 fps sample is original time 24.9583. The live ledger holds 50–52 at 0:44.
 * @evidence docs/body/screenplay/two-hands/010-game.md#restart Blue 7 directs the captain to blue 8 for the second clap before white 14 inbounds to white 7 at the wing.
 * @evidence docs/body/screenplay/two-hands/010-game.md#one-point The centre passes to the vacated corner, then boxes out at the opposite end.
 * @evidence docs/body/screenplay/two-hands/010-game.md#second-help Blue 7's floor route enters the lane while white 4's root holds outside it. At 149 seconds the ball leaves for the corner before white 4's marked position advances. These marks describe root and ball coordinates.
 * @evidence docs/body/screenplay/two-hands/010-game.md#last-shot Blue 4 delays the attack and blue 9 goes around blue 8 to release the last shot.
 * @evidence docs/body/screenplay/two-hands/010-game.md#last-board The ball reaches the left rim at 178 seconds and white 10's hand target at 179. White 4 faces the left basket with his back toward blue 5.
 * @evidence contracts/development/common.md#meaningful-documentation Finite input is clamped to the 180-second air clock. The result exposes replay source seconds, running clock, points in metres and actor yaw in radians. The final deliverable frame is assigned 0:00.
 * @evidence contracts/development/implementation.md#principled-implementation Score and clock follow the live possession while the replay reads the original action. One ball follows hands, bounce contacts, rim crossings and the final secured rebound.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Route sampling, ball flight, camera targeting and the actor's gestural cue are evaluated from the same source second.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts All ten players and two officials remain on explicit routes throughout; replay uses the real prior action and the bench exchange is staged during stopped time.
 * @evidence contracts/development/implementation.md#efficient-algorithms Route, cue, opponent, focus and contact lookup scan bounded authored keys at the requested instant. Ball flight and jumps evaluate closed forms from those keys.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Both broadcast camera angles reuse the immutable game routes, contact keys and jump phases.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources Per-call positions, directions and poses belong to the returned frame. No renderer resources or persistent allocations depend on seek count.
 */
export function gameAt(airSeconds: number): Frame {
  if (!Number.isFinite(airSeconds)) throw new RangeError("Broadcast seconds must be finite.");
  const air = Math.max(0,Math.min(180,airSeconds));
  const replay = air>=83 && air<90;
  const play = replay?air-65:air;
  const ball = ballAt(play);
  const players: Record<string,Actor> = {};
  const homePossession = play<25 || (play>=52 && play<152) || play>=179;
  for (const id of Object.keys(tracks)) {
    const pos=floorAt(id,play);
    const defending=matchups[id] && (id[0]==="w")!==homePossession;
    const seated=id in seats && play>=79.8 && play<119.7 && !(id==="b4" && play>=90);
    const cue=cues[id]?.find(([a,b])=>play>=a && play<b);
    let action=cue?.[2] ?? (seated?"sit":pos.speed>0.55?"run":defending?"guard":"stand");
    const phase=cue && !["dribble","guard","screen","boxout"].includes(action)
      ? (play-cue[0])/(cue[1]-cue[0])
      : (play*(action==="run"?1.64:action==="dribble"?1.4:0.48)+Object.keys(tracks).indexOf(id)*0.173)%1;
    let dx=ball[0]-pos.x, dz=ball[2]-pos.z;
    if (action==="run" || action==="dribble") {
      if (pos.speed>0.12) {dx=pos.dx; dz=pos.dz;}
      else {dx=homePossession?1:-1; dz=0;}
    } else if (defending && action==="guard") {
      const opponent=floorAt(matchups[id],play);
      dx=opponent.x-pos.x; dz=opponent.z-pos.z;
    }
    let target: Point | undefined;
    if (play>=90 && play<119 && ["b4","b7","b8"].includes(id)) {
      const recipient=play<98?(id==="b7"?"b4":"b7"):play<111?(id==="b4"?"b8":"b4"):(id==="b8"?"b7":"b8");
      const other=floorAt(recipient,play);
      dx=other.x-pos.x; dz=other.z-pos.z;
      if (action==="slap" && play<109) {
        const seatedId=play<98?"b7":"b8";
        const seat=floorAt(seatedId,play), captain=floorAt("b4",play);
        target=[(seat.x+captain.x)/2,play<98?1.13:0.73,(seat.z+captain.z)/2];
      } else if (action==="point") target=[seats.b8,1.36,8.35];
      else if (seated) {dx*=0.48; dz=-Math.max(0.5,Math.abs(dx));}
    } else if (seated) {dx=0; dz=-1;}
    if (id==="w14" && play>=79.8 && play<83) {action="sip"; dx=-.69; dz=-1;}
    if (id==="w4" && play>=80.4 && play<83) {action="bench-rest"; dx=-.48; dz=-1;}
    if (play>=95.15 && play<96.25) {
      if (id==="b4") {
        action="interrupted";
        const partner=floorAt("b7",play);
        target=[(pos.x+partner.x)/2,1.04,(pos.z+partner.z)/2];
      } else if (id==="b7") action="sleeve";
    }
    if (id==="b4" && play>=94.74 && play<98.55) {
      const away=ramp(Math.max(0,Math.min(1,(play-94.74)/.50,(97.92-play)/.86)));
      const follow=ramp(Math.max(0,Math.min(1,(play-97.02)/.88,(98.55-play)/.43)));
      dx+=(1.08-dx)*away; dz+=(.20-dz)*away;
      dx+=(-1.27-dx)*follow; dz+=(-.15-dz)*follow;
    }
    if (id==="b7" && action==="point") {
      const turn=ramp(Math.max(0,Math.min(1,(play-96.25)/.57,(99.15-play)/.38)));
      dx+=((seats.b8-pos.x)*.14-dx)*turn; dz+=(-1.22-dz)*turn;
    }
    if (play>=110.85 && play<113.27 && (id==="b7" || id==="b8")) {
      action=id==="b8"?"bench-mime":"bench-answer";
      const partner=floorAt(id==="b7"?"b8":"b7",play);
      const turn=ramp(Math.max(0,Math.min(1,(play-110.85)/.45,(113.27-play)/.55)));
      dx+=((partner.x-pos.x)*.24-dx)*turn; dz+=(-1-dz)*turn;
      target=undefined;
    }
    if (play>=113.27 && play<119.7 && (id==="b7" || id==="b8")) {
      action="bench-ready";
      const ready=ramp(Math.max(0,Math.min(1,(play-113.27)/.96)));
      dx*=1-ready; dz+=(-1-dz)*ready;
    }
    if (action==="dunk") {
      const { centerX, y } = courtHoop.ring;
      dx=centerX-pos.x; dz=-pos.z;
      const u=Math.min(1,Math.max(0,(play-24.64)/0.06));
      const release=u*u*(3-2*u);
      target=release===1?[centerX,y,0]:[ball[0]+(centerX-ball[0])*release,ball[1]+(y-ball[1])*release,ball[2]*(1-release)];
    }
    if (action==="board" && id==="w10") {dx=-1; dz=0.3; target=ball;}
    if (action==="boxout" && id==="w4") {dx=-1; dz=0;}
    if (action==="shot" || action==="layup") {
      if (!(id==="b8" && seated)) {dx=(id[0]==="w"?12.425:-12.425)-pos.x; dz=-pos.z;}
    }
    if (!target && ["catch","dribble","pass","shot","layup","board"].includes(action) && Math.hypot(ball[0]-pos.x,ball[2]-pos.z)<1.2) target=ball;
    let handSide: Actor["hand"]="both";
    if (action==="dribble") {
      const left = id==="w7" ? play>0.32 && (play<23 || play>=140) : id==="b4" ? play<52 : id==="b7";
      handSide=left?"left":"right";
    } else if (action==="layup" || action==="slap" || action==="interrupted" || (id==="b7" && action==="point") || (id==="w7" && action==="pass" && (play>22 && play<24 || play>145 && play<147))) {
      handSide="left";
    } else if (action==="shot" || action==="sleeve") handSide="right";
    if (id==="b7" && play>=63.45 && play<64.55) target=ball;
    players[id]={x:pos.x,z:pos.z,y:jumpAt(id,play),yaw:Math.atan2(dx,dz),action,phase,seated,hand:handSide,target};
  }
  // Encode the buzzer's instant on the final available frame of the 24 fps delivery.
  const secondsLeft=109-Math.min(air,65)-Math.max(air-136,0);
  return {play,replay,remaining:air>=180-1/24?0:Math.ceil(secondsLeft),attack:attackRemaining(air),
    home:air>=152?53:air>=25?50:48, away:air>=52?52:50,
    players,ball,cameraFocus:cameraAt(play)};
}
