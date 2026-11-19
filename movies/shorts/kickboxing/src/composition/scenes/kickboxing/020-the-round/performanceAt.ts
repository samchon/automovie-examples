import { roundClock } from "../../../../clock";
import type { ActorPose } from "../../../../entities/cast/roundCast/ActorPose";
import type { Role } from "../../../../entities/cast/roundCast/Role";
import { cameraAt } from "./cameraAt";
import { roundInterpolation } from "./roundInterpolation";
import { timekeeperAt } from "./timekeeperAt";

const { clamp, smooth, rise, mix, wave } = roundInterpolation;

type Pair = [number, number];
type Triple = [number, number, number];
type Mark = [time: number, x: number, z: number];
type Key = [time: number, value: number];
const pi = Math.PI;
const roles: Role[] = ['owen','marek','daniel','pavel','ivo','jo','ed','maya','ruth','alan'];
const nearest = (a: number, b: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a));
function sample(t: number, keys: Key[]) {
  let last = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const next = keys[i];
    if (t < next[0]) return mix(last[1],next[1],rise(t,last[0],next[0]));
    last = next;
  }
  return last[1];
}

// The two routes share a clock but have independent pauses and travel lengths.
// Coordinates are canvas metres. The north aisle stays outside the north rope.
const marks: Record<Role, Mark[]> = {
  owen: [
    [0,-1.09,.24],[.34,-1.09,.24],[1.45,-.91,.17],[2.52,-.91,.17],[4.6,-1.24,.68],
    [5.55,-1.28,.65],[6.22,-1.11,.52],[6.7,-1.11,.52],[7.8,-1.36,.12],[8.93,-1.29,-.36],[10.1,-1.06,-.73],
    [10.85,-1.06,-.73],[11.8,-1.45,.11],[12.6,-1.98,1.05],[14.73,-2.54,2.23],[16.28,-2.67,2.30],
    [16.56,-2.67,2.30],[17.63,-2.19,1.54],[19.18,-2.38,1.05],[20.78,-2.53,.65],
    [22.45,-2.53,.65],[23.40,-2.30,.39],[24.70,-2.06,.26],[26.05,-2.06,.26],[26.98,-1.75,.05],
    [27.72,-2.38,-.17],[28.35,-2.68,-.31],[30.35,-2.64,-1.17],[31.3,-2.64,-1.47],
    [32.25,-2.63,-2.11],[36.18,-2.63,-2.11],[37.12,-2.50,-2.04],[38.84,-2.64,-2.45],[42.0,-2.64,-2.45],
    [43.32,-2.70,-1.39],[44.58,-2.30,-.73],[45.31,-1.42,-.76],[46.30,-.54,-.30],[47.80,.16,-.42],
    [49.27,.55,-.41],[51.65,.55,-.41],[53.10,.72,-1.05],[55.83,.60,-1.49],[57.62,.33,-2.04],
    [58.42,.33,-2.04],[59.42,.30,-2.68],
    [60.45,.30,-2.68],[61.75,1.03,-2.65],[62.15,1.03,-2.65],[64.60,.75,-1.57],[65.50,.46,-.87],
    [66.20,.60,-1.04],[67.52,.74,-1.72],[69.18,.66,-2.62],[69.76,.66,-2.62],[70.50,.60,-2.23],
    [71.18,.91,-2.22],[72.40,1.18,-2.37],[74.10,1.18,-2.37],[75.34,1.48,-2.45],[76.8,1.83,-2.40],
    [79.1,1.83,-2.40],[80.95,2.05,-1.66],
    [82.24,1.94,-.88],[84.94,1.89,-.88],[86.47,1.91,-.46],[87.43,1.99,-.56],[89.24,2.07,-.56],
    [90.65,2.13,.59],[92.34,2.11,1.58],[93.5,1.67,1.94],[94.68,1.23,2.00],[95.98,.72,1.99],
    [100.44,.72,1.87],[101.65,.03,2.03],[102.9,-1.25,2.12],[103.87,-2.14,2.23],[105.49,-2.62,1.56],
    [109.82,-2.62,1.56],[111.45,-2.55,1.56],[112.35,-2.38,1.40],[113.23,-2.20,1.32],
    [116.20,-2.20,1.32],[117.62,-2.45,.82],[118.37,-2.48,.57],
    [120.02,-2.58,-.40],[122.42,-2.58,-.40],[123.40,-1.82,-.12],[124.45,-1.70,.10],[126.10,-.87,-1.14],[128.82,-1.30,-1.33],
    [130.18,-1.30,-1.05],[132.52,-.57,-.54],[135.3,-.57,-.54],[137.07,-.39,-.66],[140.97,-.39,-.66],
    [142.26,-.53,-1.11],[143.75,-.87,-1.68],[145.92,-1.21,-2.64],[146.72,-1.21,-2.64],[147.52,-1.41,-2.26],
    [148.4,-1.76,-2.06],[150.04,-1.76,-2.06],[150.60,-1.38,-1.48],[151.58,-.92,-1.23],[153.13,.06,-.05],
    [154.40,1.40,1.32],[155.45,2.51,2.56],[162.79,2.51,2.56],[163.22,2.61,2.64],[170.40,2.61,2.64],
    [170.95,1.91,2.61],[171.13,1.91,2.61],[171.65,.45,2.31],[172.43,-.31,2.30],[180,-.31,2.30]
  ],
  marek: [
    [0,1.09,-.18],[.34,1.09,-.18],[1.26,.84,-.14],[1.51,.84,-.14],[2.03,.53,-.03],[5.78,.53,-.03],[6.33,.63,-.17],
    [6.8,.54,-.12],[10.74,.54,-.12],[11.62,.08,.06],[12.84,-.74,.74],[14.82,-1.81,1.75],[17.85,-1.81,1.75],
    [19.52,-1.74,1.17],[20.98,-1.54,.76],[22.33,-1.50,.83],[24.70,-1.50,.83],[26.97,-1.08,.28],
    [28.32,-1.77,-.08],[30.28,-1.82,-1.00],[31.75,-1.88,-1.49],[32.57,-1.98,-1.70],[35.92,-1.98,-1.70],
    [36.61,-2.02,-1.74],[37.40,-1.99,-1.73],[38.12,-1.51,-1.55],[42.75,-1.51,-1.55],[44.17,-1.29,-1.44],
    [45.46,-1.32,-1.09],[46.35,-1.33,-1.06],[47.43,-.83,-.77],[48.40,-.49,-.27],[49.83,.44,.36],
    [51.40,.55,.66],[52.42,.55,.62],[53.64,.76,.02],[55.78,.55,-.49],[56.58,.43,-.88],
    [57.05,.40,-.92],[58.78,.12,-.25],[64.77,.12,-.25],
    [66.00,.16,-.29],[67.42,.28,-.84],[68.21,.35,-1.08],[69.03,.54,-1.57],[69.66,.81,-1.94],
    [70.50,1.36,-2.25],[71.30,1.53,-2.48],[71.76,1.89,-2.49],[72.40,2.22,-2.49],
    [74.65,2.22,-2.49],[76.7,2.63,-2.68],
    [78.72,2.63,-2.68],[80.83,2.62,-1.26],[82.28,2.64,-.25],[83.44,2.65,.38],[83.9,2.65,.38],
    [85.45,2.45,-.02],[86.53,2.46,-.03],[87.44,2.60,.56],[89.23,2.60,.56],[91.06,2.61,1.66],[92.39,2.54,2.52],
    [93.64,1.85,2.62],[94.89,1.17,2.62],[96.24,.69,2.65],[97.85,.69,2.65],[98.85,.12,2.52],[99.96,.12,2.52],
    [101.21,-.15,2.72],[102.60,-.59,2.71],[103.83,-1.60,2.70],[105.30,-2.02,2.32],[106.13,-1.69,1.66],
    [106.83,-1.33,1.26],[108.32,-1.33,1.26],[109.96,-1.87,1.45],[112.35,-1.87,1.45],[113.05,-1.17,.94],
    [115.78,-1.17,.94],[116.20,-1.50,.66],[117.08,-1.59,.59],[118.82,-1.63,-.12],[120,-1.59,-.79],
    [123.43,-1.59,-.79],[124.43,-1.78,-.54],
    [125.35,-1.72,-1.21],[126.66,-1.91,-1.82],[127.90,-2.44,-2.04],[128.6,-2.44,-2.04],[130.08,-2.05,-1.42],
    [131.70,-1.41,-.65],[133.18,-1.18,-.26],[134.82,-1.18,-.26],[136.02,-.32,.56],[141.58,-.32,.56],
    [142.41,-.73,-.24],[143.86,-1.08,-1.07],[145.93,-1.45,-1.95],[147.37,-1.86,-2.41],[148.34,-2.19,-2.42],
    [150,-2.19,-2.42],[150.34,-2.31,-2.42],[150.65,-2.13,-2.30],[180,-2.13,-2.30]
  ],
  daniel: [
    [0,.02,-1.45],[3,.02,-1.45],[7,-.45,-1.78],[13,-1.10,-.98],[17,-.81,-.34],[23,-.70,-.57],
    [28,-.72,-1.01],[33,-1.17,-1.45],[36.7,-1.35,-1.67],[38.85,-1.35,-1.67],
    [39.60,-1.79,-2.29],[40.35,-2.01,-2.64],[41.62,-2.01,-2.64],[42.83,-1.64,-2.35],
    [46.21,-1.92,-1.81],[48.20,-1.75,-1.33],[52,-.96,.17],[59,-.94,-.27],[65,-.95,-.78],[69,-.54,-1.63],[75,.32,-1.79],
    [80,1.14,-1.13],[85,1.14,-.40],[89,1.15,.12],[93,1.11,1.11],[97,-.04,.83],[102,-.98,1.32],
    [106,-.91,.48],[112,-.69,.30],[117,-.79,-.46],[122,-.80,-1.56],[126,-.72,-2.20],
    [130,-.64,-2.27],[135,.04,-1.67],[141,.30,-1.60],[145,-.12,-1.96],[149,-.57,-2.57],
    [151.63,-.57,-2.57],[153.73,-.48,-1.82],[155.49,-.62,-2.30],[156.70,-1.27,-2.69],[180,-1.27,-2.69]
  ],
  jo:[[0,-3.83,2.41],[170.10,-3.83,2.41],[170.80,-3.69,2.73],[180,-3.69,2.73]],
  ed:[[0,-2.43,3.74],[170.10,-2.43,3.74],[170.85,-2.51,3.38],[180,-2.51,3.38]],
  pavel:[[0,.85,-3.64],[170.52,.85,-3.64],[172.55,.27,-3.63],[174.09,-.44,-3.62],[175.60,-1.44,-3.60]],
  ivo:[[0,3.78,-2.37]], alan:[[0,2.44,3.88]], maya:[[0,4.51,2.47]], ruth:[[0,4.69,1.61]]
};
function strides(role: Role, a: number, b: number) {
  if (role === 'owen' && a > 91 && b < 97) return .24;
  if (role === 'owen' && a >= 141 && b <= 146) return .28;
  return role === 'daniel' ? .56 : role === 'pavel' ? .51 : .49;
}
const lengths = Object.fromEntries(roles.map(role => {
  let n = 0;
  return [role, marks[role].map((m,i,all) => {
    if (i) { const a = all[i-1]; n += Math.hypot(m[1]-a[1],m[2]-a[2]) / strides(role,a[0],m[0]); }
    return n;
  })];
})) as Record<Role,number[]>;
function track(role: Role,t: number) {
  const line = marks[role];
  for (let i = 1; i < line.length; i++) {
    const a = line[i-1], b = line[i];
    if (t > b[0]) continue;
    const dur = b[0]-a[0], u = clamp((t-a[0])/dur), h = smooth(u);
    const speed = Math.hypot(b[1]-a[1],b[2]-a[2]) * 6*u*(1-u)/dur;
    return {x:mix(a[1],b[1],h),z:mix(a[2],b[2],h),speed,phase:pi*mix(lengths[role][i-1],lengths[role][i],h)};
  }
  const p = line[line.length-1]; return {x:p[1],z:p[2],speed:0,phase:0};
}
function facing(t: number, role: Role) {
  const a = track(role,t), o = track('owen',t), m = track('marek',t);
  const toward = (x: number,z: number) => Math.atan2(x-a.x,z-a.z);
  const turn = (angle: number,x: number,z: number,k: number) => mix(angle,nearest(angle,toward(x,z)),k);
  if (role === 'owen') {
    let angle = toward(m.x,m.z);
    angle = turn(angle,2.68,2.70,wave(t,151.63,152.48,154.9,156.64));
    angle = turn(angle,-2.7,3.36,wave(t,170.14,170.93,173.08,173.62));
    angle = turn(angle,4.51,2.47,wave(t,173.10,173.69,175.27,176.06));
    return angle;
  }
  if (role === 'marek') {
    let angle = toward(o.x,o.z);
    angle = turn(angle,-2.64,2.36,wave(t,16.6,17.4,18.24,19.35));
    angle = turn(angle,.0,.0,wave(t,57.18,57.85,58.59,59.53));
    angle = turn(angle,.85,-3.64,wave(t,76.68,77.53,78.45,79.63));
    angle = turn(angle,-2.87,-2.48,wave(t,126.1,127.75,128.30,130.0));
    return mix(angle,nearest(angle,pi),rise(t,150.00,150.94));
  }
  if (role === 'daniel') {
    let angle = toward((o.x+m.x)/2,(o.z+m.z)/2);
    angle = turn(angle,2.55,2.60,wave(t,151.43,151.87,155.41,156.53));
    return turn(angle,-1.64,-2.30,rise(t,155.80,156.79));
  }
  if (role === 'pavel') {
    let angle = toward(m.x,m.z);
    angle = turn(angle,-2.9,-3.75,wave(t,170.26,170.81,174.97,175.77));
    return turn(angle,-1.47,-2.27,rise(t,175.0,175.77));
  }
  if (role === 'ivo') return toward(mix(m.x,o.x,wave(t,39.12,40.32,67.60,69.3)),mix(m.z,o.z,wave(t,39.12,40.32,67.6,69.3)));
  if (role === 'jo' || role === 'ed') {
    const delayed = track('owen',Math.max(0,t-(role === 'jo' ? 1.01 : .25)));
    return toward(delayed.x,delayed.z);
  }
  if (role === 'alan') return turn(toward(1.9,2.8),-.62,-2.83,wave(t,155.5,156.9,169.1,170.07));
  const other = role === 'maya' ? 'ruth' : 'maya';
  const neighbor = track(other,t);
  let angle = toward(o.x,o.z);
  if (role === 'ruth') {
    angle = turn(angle,neighbor.x,neighbor.z,wave(t,64.52,65.52,66.60,67.70));
    angle = turn(angle,neighbor.x,neighbor.z,wave(t,71.98,72.75,73.95,74.65));
  }
  const endTurn = role === 'ruth' ? rise(t,172.65,173.28) : rise(t,174.39,175.14);
  return turn(angle,-1.62,-2.27,endTurn);
}
// Unwrap the continuously changing bearings once, including crossings behind a chair.
const yawRate = 12;
const bearings = Object.fromEntries(roles.map(role => {
  let last = facing(0,role);
  return [role,Array.from({length:180*yawRate+1},(_,i) => {
    const angle = facing(i/yawRate,role);
    last = nearest(last,angle);
    return last;
  })];
})) as Record<Role,number[]>;
function yaw(t: number,role: Role) {
  const f=t*yawRate,i=Math.floor(f),a=bearings[role]; return mix(a[i],a[Math.min(i+1,a.length-1)],f-i);
}

// Each accent has its own visible arrival, suspension and return to the base pose.
type Accent = 'offer'|'cover'|'flash'|'arc'|'lift'|'dip'|'rock'|'check'|'fold'|'open'|'look'|'heel';
type Cue = [peak:number,kind:Accent,side:0|1,inTime?:number,outTime?:number,hold?:number];
const red: Cue[] = [
  [1.27,'offer',0,.76,.54,1.05],[3.23,'cover',0],[3.79,'cover',1],[4.28,'rock',0],
  [5.39,'dip',0],[5.95,'flash',1],[11.94,'rock',0,.3,.7],[13.35,'cover',1,.31,.84],
  [15.35,'fold',0],[15.96,'cover',1],[16.52,'cover',0],[17.26,'dip',1,.33,.52],
  [21.95,'arc',1,.48,.63],[23.29,'open',0,.42,.62],[27.17,'rock',1,.24,.62],
  [30.67,'lift',0],[31.65,'rock',0],[32.25,'heel',1],[36.52,'fold',1,.34,.66,.32],
  [37.79,'open',1,.23,.6],[43.08,'flash',0,.32,.48],[46.15,'rock',0,.15,.46],
  [50.95,'arc',1,.43,.61],[54.35,'cover',1],[55.18,'cover',0],[58.83,'heel',1],
  [roundClock.guardCrack,'flash',1,.30,.32],[66.13,'cover',0],[67.02,'rock',1],[69.0,'fold',1],
  [71.36,'arc',1,.45,.53],[75.57,'flash',0],[76.39,'arc',1,.39,.62],
  [82.35,'rock',1,.16,.8],[83.79,'fold',0,.44,.82],[86.61,'lift',0,.26,.31],
  [87.04,'open',0,.22,.61],[88.37,'fold',1,.49,.73],[91.21,'cover',0],[92.54,'rock',1],
  [96.78,'dip',0],[roundClock.redReply,'flash',1,.27,.59],[101.34,'offer',0,.36,.56],[102.50,'rock',1],
  [110.84,'lift',1,.44,.55,.04],[roundClock.redSole,'heel',1,.12,.24],[roundClock.redPush,'flash',0,.25,.53],
  [roundClock.blueAnswer,'rock',0,.13,.68],[117.59,'cover',1,.22,.66],
  [120.32,'heel',1,.32,.46,.13],[122.08,'look',0,.40,.74],[132.50,'heel',0,.27,.44],
  [133.67,'rock',1,.22,.51],[136.78,'open',0],[139.33,'rock',1,.21,.72],
  [141.72,'rock',0],[142.26,'rock',1],[143.38,'cover',0],[144.29,'cover',1],[146.0,'fold',0],
  [148.30,'lift',1,.47,.43],[150.00,'arc',1,.43,.55,.025]
];
const blue: Cue[] = [
  [2.0,'offer',1,.52,.48,.17],[3.22,'flash',0],[3.78,'flash',1],[5.34,'flash',0],
  [5.99,'rock',1,.15,.71],[11.72,'arc',0,.39,.58],[13.58,'flash',1],[15.36,'flash',0],
  [15.96,'flash',1],[16.52,'flash',0],[21.99,'fold',0,.17,.66,.43],[23.06,'dip',0,.4,.85,.32],
  [27.15,'flash',1],[30.70,'check',0],[31.63,'flash',1],[32.72,'cover',0],[36.65,'lift',1,.35,.30],
  [37.14,'open',1,.20,.42],[37.85,'open',0],[43.08,'cover',0],[46.14,'flash',0],
  [47.23,'flash',1,.25,.57],[50.72,'dip',0,.33,.6],[51.04,'rock',1,.18,.38],[53.04,'flash',0],
  [57.04,'look',1,.30,.59],[roundClock.guardCrack,'cover',0],[66.18,'flash',0],[66.98,'flash',1],
  [71.43,'rock',0,.18,.66],[75.57,'cover',1],[76.35,'dip',0],[76.68,'rock',0],
  [82.34,'flash',0],[83.88,'look',0,.44,.60],[86.64,'fold',0],[87.04,'open',1],
  [90.78,'flash',0],[91.28,'flash',1],[92.47,'arc',0],[96.76,'flash',0],[97.96,'rock',0,.18,.66],
  [101.28,'cover',1],[102.39,'flash',0],[106.77,'open',1,.5,.76],
  [110.97,'dip',0,.32,.57],[112.45,'rock',1,.19,.65],[roundClock.blueAnswer,'flash',0,.26,.39],
  [120.99,'fold',0,.5,.74,.22],[123.2,'fold',1,.66,.86],
  [125.04,'heel',0],[128.65,'look',0],[133.52,'flash',1],[136.70,'flash',0],
  [139.20,'flash',0],[141.67,'look',1,.28,.44],[142.19,'flash',1],[143.35,'flash',0],
  [148.53,'dip',0,.42,.49],[149.59,'dip',0,.38,.40,.12],[150.04,'rock',1,.11,.42]
];
function accent(p: ActorPose,cues: Cue[],t: number): Pair {
  const release: Pair = p.guardRelease = [0, 0];
  for (const [peak,kind,s,attack=.21,decay=.33,hold=0] of cues) {
    if (t<peak-attack || t>peak+hold+decay) continue;
    const w=wave(t,peak-attack,peak,peak+hold,peak+hold+decay), other=s===0?1:0, sign=s===0?-1:1;
    if (kind !== 'heel' && kind !== 'look') release[s] = Math.max(release[s], w);
    if (kind === 'rock' || kind === 'fold' || kind === 'open') release[other] = Math.max(release[other], .66 * w);
    switch(kind) {
      case 'offer': p.arms[s]+=1.03*w;p.elbow[s]-=.95*w;p.reach[s]-=.15*w;p.lean+=.06*w;break;
      case 'flash': p.arms[s]+=1.12*w;p.elbow[s]-=1.09*w;p.reach[s]+=.14*w;p.arms[other]+=.20*w;p.roll+=sign*.11*w;break;
      case 'cover': p.arms[s]+=.66*w;p.elbow[s]+=.45*w;p.reach[s]-=.48*w;p.kneel+=.09*w;break;
      case 'arc': p.legs[s]+=1.37*w;p.legs[other]-=.16*w;p.roll-=sign*.25*w;p.reach[other]+=.65*w;p.arms[s]-=.38*w;break;
      case 'lift': p.legs[s]+=.95*w;p.lean-=.13*w;p.reach[other]+=.36*w;break;
      case 'dip': p.arms[s]-=.5*w;p.elbow[s]-=.48*w;p.lean+=.13*w;p.roll+=sign*.12*w;break;
      case 'rock': p.roll+=sign*.23*w;p.lean-=.22*w;p.head+=sign*.44*w;p.reach[other]+=.33*w;p.kneel+=.17*w;break;
      case 'check': p.legs[s]+=.79*w;p.elbow[s]+=.26*w;p.roll-=sign*.13*w;break;
      case 'fold': p.lean+=.29*w;p.kneel+=.13*w;p.arms[s]-=.23*w;p.head+=sign*.18*w;break;
      case 'open': p.reach[s]+=.67*w;p.reach[other]+=.25*w;p.elbow[s]-=.28*w;break;
      case 'look': p.head+=sign*.61*w;p.lean-=.07*w;break;
      case 'heel': p.legs[s]+=.25*w;p.roll-=sign*.08*w;break;
    }
  }
  return release;
}
function stroke(t: number,times: readonly number[]) {
  return times.reduce((v,k)=>Math.max(v,wave(t,k-.20,k,k+.035,k+.22)),0);
}
function seatedHands(p: ActorPose,t: number,up: number,times: readonly number[]) {
  const c=stroke(t,times), h=Math.max(up,c);
  p.arms=[mix(p.arms[0],1.34,h),mix(p.arms[1],1.46,h)];
  p.elbow=[mix(p.elbow[0],.86,h),mix(p.elbow[1],.78,h)];
  p.reach=[mix(p.reach[0],.46,h),mix(p.reach[1],.52,h)]; p.clap=c;
}
function base(role: Role,t: number): ActorPose {
  const m=track(role,t), fighter=role==='owen'||role==='marek', official=role==='daniel';
  const index=roles.indexOf(role), step=Math.sin(m.phase+(role==='marek'?pi:0))*clamp(m.speed*1.3),
    breath=Math.sin(t*(fighter?2.91:1.69)+index*.83);
  const seated=!fighter&&!official;
  return {x:m.x,z:m.z,y:.025*Math.abs(step),yaw:yaw(t,role),lean:(fighter ? .09 : seated ? .12 : .035)+.012*breath,
    roll:.045*step+(fighter ? .018*Math.sin(.82*t+index) : 0),kneel:seated ? .83 : fighter ? .065 : .01,
    arms:fighter?[.52+.025*breath,.65+.03*breath]:seated?[.43,.51]:[.17,.23],
    reach:fighter?[.05,.12]:[.12,.15],elbow:fighter?[1.26,1.39]:seated?[.98,.92]:[.28,.36],
    legs:seated?[.12,.18]:[.08+.39*step,-.07-.40*step],head:.025*Math.sin(.77*t+index),clap:0};
}
function fighter(p: ActorPose,t: number,role:'owen'|'marek') {
  const fatigue=rise(t,50,145), b=Math.sin(t*(role==='owen'?3.37:3.19));
  p.lean+=fatigue*(.059+.037*b);p.arms[0]+=fatigue*.069*b;p.arms[1]+=fatigue*.084*b;
  const guardRelease = accent(p,role==='owen'?red:blue,t);
  const touch=wave(t,role==='owen' ? .53 : 1.51,role==='owen'?1.44:roundClock.touch,2.13,2.44);
  if(touch>0) p.handTarget={
    side:role==='owen'?0:1,
    world:role==='owen'?[-.222,1.31,.23]:[-.072,1.31,.23],
    weight:touch
  };
  if (role==='owen') {
    p.lean+=.18*wave(t,106.65,107.50,107.82,108.81);
    const listening=wave(t,119.75,120.65,122.15,123.02);
    guardRelease[0] = Math.max(guardRelease[0], listening);
    guardRelease[1] = Math.max(guardRelease[1], listening);
    const lifted = wave(t,119.89,120.29,120.49,121.02);
    const heldFoot = wave(t,119.77,120.09,121.08,121.37);
    if (heldFoot > 0) {
      p.footTarget = {side:1,world:[-2.63,.072+.112*lifted,-.46],weight:heldFoot};
    }
    p.roll -= .06*lifted;
    p.arms[0]-=.21*listening;p.arms[1]-=.23*listening;
    p.elbow[0]-=.30*listening;p.elbow[1]-=.24*listening;
    p.head+=.23*wave(t,121.03,121.72,122.03,122.94);
    const offeredLane = wave(t,125.72,126.32,127.25,128.33);
    p.x -= .19 * offeredLane;
    p.z -= .31 * offeredLane;
    p.head -= .33 * offeredLane;
    const tableau = [
      [21.95,[-1.87,.80,.74]],
      [50.95,[.51,.79,.18]],
      [roundClock.knockdown,[-2.15,1.42,-2.38]]
    ] as const;
    for(const [instant,at] of tableau){
      const weight=wave(t,instant-.22,instant,instant+.025,instant+.24);
      if(weight>0) p.footTarget={side:1,world:[...at],weight};
    }
    const finishing = wave(t,149.52,149.87,150.13,150.34);
    const withdrawing = wave(t,150.037,150.32,150.78,151.21);
    p.x += .13 * finishing + .23 * withdrawing;
    p.z += .09 * finishing + .20 * withdrawing;
    p.arms[0] = mix(p.arms[0], .12, finishing);
    p.elbow[0] = mix(p.elbow[0], .26, finishing);
    p.reach[0] = mix(p.reach[0], .66, finishing);
    p.arms[0] = mix(p.arms[0], .09, withdrawing);
    p.arms[1] = mix(p.arms[1], .16, withdrawing);
    p.elbow[0] = mix(p.elbow[0], .31, withdrawing);
    p.elbow[1] = mix(p.elbow[1], .39, withdrawing);
    const waiting=rise(t,151.3,153.12), victory=rise(t,167.90,roundClock.glovesUp);
    p.arms=[mix(p.arms[0],.13,waiting),mix(p.arms[1],.21,waiting)];
    p.elbow=[mix(p.elbow[0],.34,waiting),mix(p.elbow[1],.40,waiting)];
    p.arms=[mix(p.arms[0],2.79+.05*b,victory),mix(p.arms[1],2.91+.035*b,victory)];
    p.elbow=[mix(p.elbow[0],.15,victory),mix(p.elbow[1],.11,victory)];
    p.reach=[mix(p.reach[0],.91,victory),mix(p.reach[1],.98,victory)];
    p.reach[1] -= .27 * rise(t,175.97,176.66);
    const saluteToRed = wave(t,170.53,170.96,172.99,173.57);
    p.arms[0] -= .43 * saluteToRed;
    p.elbow[0] += .39 * saluteToRed;
    p.head += .47*wave(t,173.48,173.91,175.24,175.57);
    p.head -= .46*rise(t,175.28,176.10);
    p.headPitch = .29*wave(t,173.40,173.96,175.22,175.75);
    p.lean-=.13*victory;p.kneel+=.12*stroke(t,roundClock.victoryStamps);
    return;
  }
  // The white sleeve and the solitary glove share their first shape across the blue rope.
  const first=wave(t,77.10,78.1,78.54,79.03);
  guardRelease[0] = Math.max(guardRelease[0], first);
  p.arms[0]=mix(p.arms[0],2.55,first);p.elbow[0]=mix(p.elbow[0],.19,first);
  p.reach[0]+=.60*wave(t,77.76,78.22,78.54,79.03);
  p.legs[1] += .48*wave(t,97.99,98.41,98.54,98.84);
  p.roll += .13*wave(t,97.92,98.17,98.50,98.84);
  const rasp=wave(t,119.72,120.19,123.66,124.70), puff=.5+.5*Math.sin((t-120.0)*3.45);
  guardRelease[0] = Math.max(guardRelease[0], rasp);
  guardRelease[1] = Math.max(guardRelease[1], rasp);
  p.arms[0]+=rasp*(-.23+.48*puff);p.arms[1]+=rasp*(-.26+.51*puff);
  p.elbow[0]-=.35*rasp;p.elbow[1]-=.39*rasp;
  p.lean+=.33*rasp*(1-puff);
  p.headPitch = .28 * rasp * (1-puff);
  p.roll-=.07*rasp*puff;
  p.legs[0] = mix(p.legs[0], .10, rasp);
  p.legs[1] = mix(p.legs[1], .10, rasp);
  const gloveDip = wave(t,149.54,149.86,150.12,150.30);
  p.arms[0] = mix(p.arms[0], .18, gloveDip);
  p.elbow[0] = mix(p.elbow[0], .46, gloveDip);
  if (t<150.22) return;
  const fall=rise(t,150.22,151.25), side=sample(t,[[150.22,0],[150.65,1.02],[151.00,1.47],[151.25,pi/2]]);
  const firstTry=wave(t,160.62,161.32,163.28,164.10), secondTry=wave(t,171.48,172.00,172.29,172.95);
  p.roll=mix(p.roll,0,rise(t,150.22,150.57))+side;
  p.chestRoll = -.08*rise(t,151.05,151.46)-.49*firstTry-.32*secondTry;
  p.kneel=mix(p.kneel,sample(t,[[150.22,.075],[150.65,.62],[150.98,.35],[151.25,.12]]),rise(t,150.22,150.61));
  p.y*=1-fall;p.lean=mix(p.lean,.025+.29*firstTry+.22*secondTry,fall);
  p.legs=[mix(p.legs[0],.65,fall),mix(p.legs[1],.13,fall)];
  p.arms=[mix(p.arms[0],.38,fall),mix(p.arms[1],.48,fall)];
  p.elbow=[mix(p.elbow[0],.23,fall),mix(p.elbow[1],.58,fall)];
  const landing = wave(t,150.32,150.60,150.75,151.08);
  p.legs[0] = mix(p.legs[0],1.03,landing);
  p.kneel = mix(p.kneel,.88,landing);
  p.reach[0] = mix(p.reach[0],-.97,rise(t,150.35,150.83));
  const draw=wave(t,159.79,160.37,166.71,167.18), press=wave(t,164.73,165.13,166.64,167.14);
  p.elbow[0]+=.91*draw-.61*press;p.arms[0]+=.29*draw+.25*press;
  p.head=mix(p.head,.22*firstTry+.13*secondTry,fall);
  const salute=rise(t,176.05,177.04), turn=rise(t,176.86,177.52);
  p.arms[1]=mix(p.arms[1],1.32,salute);p.elbow[1]=mix(p.elbow[1],.30,salute);p.reach[1]=mix(p.reach[1],.99,turn);
  p.head += .52*turn;
  if(salute>0) p.handTarget={side:1,world:[-1.61,.64,-1.73-.19*turn],weight:salute};
}
function referee(p: ActorPose,t: number) {
  const toHead = rise(t,155.48,156.77);
  p.x += .65 * toHead;
  p.z -= .14 * toHead;
  const face = Math.atan2(-1.43-p.x,-2.30-p.z);
  p.yaw = mix(p.yaw,nearest(p.yaw,face),toHead);
  p.arms[1]+=(1-rise(t,.02,.58))*1.36;
  const part=wave(t,37.57,38.30,39.62,41.04), near=wave(t,85.6,86.45,87.06,88.12);
  p.arms[0]+=1.02*part+.84*near;p.arms[1]+=1.14*part+.91*near;
  p.reach[0]+=.59*part+.37*near;p.reach[1]+=.56*part+.41*near;
  const down=wave(t,150.44,roundClock.canvasTouch,151.33,151.71), away=wave(t,151.45,151.78,153.46,154.30);
  p.lean+=.34*down;p.arms[0]+=.66*down;p.elbow[0]-=.17*down;p.arms[1]+=1.37*away;p.reach[1]+=.31*away;
  if(down>0) p.handTarget={side:0,world:[p.x-.59,.40,p.z+.62],weight:down};
  p.kneel+=.82*wave(t,156.66,157.0,167.29,167.60)+.85*rise(t,168.64,169.66);
  const count=wave(t,156.69,157,167.20,167.59);
  let beat=0;for(let k=158;k<=167;k++) beat=Math.max(beat,wave(t,k-.22,k,k+.073,k+.49));
  p.arms[1]+=count*(1.61-.66*beat);p.elbow[1]+=count*(.40-.26*beat);p.lean+=.19*count+.18*wave(t,164.73,165.05,165.57,166.01);
  p.reach[1]+=.40*count;p.head-=.24*count;
  if(count>0) p.handTarget={side:1,world:[p.x-.33-.17*beat,1.39-.50*beat,p.z+.58],weight:count};
  const sweep=wave(t,167.35,roundClock.result,168.27,168.71), cross=wave(t,167.36,167.59,167.65,167.95);
  p.arms[0]+=2.17*sweep;p.arms[1]+=2.17*sweep;p.reach[0]+=1.20*sweep-1.74*cross;p.reach[1]+=1.16*sweep-1.82*cross;
  const beckon=wave(t,168.28,168.63,168.91,169.32), steady=wave(t,171.58,172.02,173.06,173.83);
  p.arms[0]+=1.25*beckon+.74*steady;p.elbow[0]+=.64*beckon;p.lean+=.26*steady+.16*rise(t,169.03,169.85);
  p.head += .44 * wave(t,164.77,165.16,165.54,165.92);
  if (steady > 0) p.handTarget={side:0,world:[-1.49,.53,-2.22],weight:steady};
  const beside=rise(t,168.90,169.60);
  p.legs[0]+=.42*beside;p.y-=.16*beside;
}
function corner(p: ActorPose,role:'jo'|'ed'|'pavel'|'ivo',t:number) {
  const bell=rise(t,roundClock.bell,role==='pavel'?170.65:170.80);
  if(role==='jo'||role==='ed') {
    const jo=role==='jo';
    p.kneel=jo ? .76 : .91;p.lean+=jo ? .02 : .15;
    const duck=wave(t,11.85,12.64,17.38,19.65), peep=wave(t,101.93,jo?103.82:102.94,104.40,105.42);
    p.kneel+=(jo ? .18 : .07)*duck;p.lean+=(jo ? .43 : .21)*duck;p.head+=(jo?-.33:.59)*duck+(jo ? .45 : -.53)*peep;
    if(!jo){p.arms[0]+=.37*duck;p.elbow[0]-=.25*duck;p.legs[1]+=.20*duck;}
    if(jo){p.lean-=.22*wave(t,21.98,23.16,25.7,27.35)+.19*wave(t,50.97,51.54,51.68,52.59);p.roll-=.15*wave(t,111.4,111.53,111.63,112.01);}
    const lift=wave(t,113.52,114.11,jo ? 115.62 : 115.32,jo ? 116.72 : 116.42);
    seatedHands(p,t,lift,jo?roundClock.joClaps:roundClock.edClaps);
    p.kneel=mix(p.kneel,.035,bell);p.lean=mix(p.lean,.02,bell);
    p.legs=[mix(p.legs[0],.04,bell),mix(p.legs[1],-.06,bell)];
    const salute=wave(t,170.86,171.50,173.30,174.29);p.arms=[mix(p.arms[0],jo?2.55:2.13,salute),mix(p.arms[1],jo?2.36:2.82,salute)];
    p.reach[0]+=.40*salute;p.reach[1]+=.52*salute;p.elbow[0]*=1-.62*salute;p.elbow[1]*=1-.77*salute;return;
  }
  if(role==='ivo') {
    const low=wave(t,39.75,40.80,45.18,46.10), towel=rise(t,170.10,170.86);
    p.lean+=.49*low+.22*towel;p.kneel+=.065*low;p.roll+=.19*low;p.head+=.22*wave(t,42.50,43.54,44.72,45.85);
    p.arms[0]+=.18*towel;p.arms[1]+=.33*towel;p.reach[0]-=.35*towel;p.reach[1]-=.41*towel;return;
  }
  const watch=wave(t,32.67,33.87,45.13,46.20), forward=wave(t,135.81,137.18,144.93,146.43);
  p.lean+=.27*watch+.33*forward;p.roll-=.22*watch+.18*forward;
  const palm=wave(t,77.49,78.20,78.86,79.77);
  p.lean-=.36*palm;p.kneel-=.79*palm;
  seatedHands(p,t,wave(t,142.09,142.47,142.73,143.20),[roundClock.pavelClap]);
  p.kneel=mix(p.kneel,.03,bell);p.lean=mix(p.lean,.06,bell);
  const walk=wave(t,170.55,170.94,174.91,175.65);p.legs=[p.legs[0]+.44*Math.sin(track('pavel',t).phase)*walk,p.legs[1]-.44*Math.sin(track('pavel',t).phase)*walk];
  const crouch=rise(t,175.02,175.93), answer=rise(t,176.72,177.48);
  p.kneel+=crouch*(.72-.69*answer);p.lean+=crouch*(.45-.46*answer);p.elbow[0]-=.48*crouch;p.elbow[1]-=.52*crouch;
}
function ringside(p: ActorPose,role:'maya'|'ruth',t:number) {
  const maya=role==='maya';
  const follow=wave(t,60.47,62.05,66.58,68.32);
  p.roll+=(maya ? .12 : -.035)*follow;p.lean+=(maya ? .23 : .10)*follow;
  const cheer=wave(t,maya ? 65.40 : 66.08,maya ? 65.79 : 66.41,maya ? 67.02 : 66.76,maya ? 68.44 : 67.35);
  const silent=maya?wave(t,71.47,72.12,72.93,73.48):0;
  const later=maya?wave(t,98.91,99.22,99.45,99.92):0;
  const end=maya?wave(t,178.08,178.36,178.59,178.98):wave(t,179.13,179.37,179.58,179.90);
  seatedHands(p,t,Math.max(cheer,.77*silent,later,end),maya?roundClock.mayaClaps:roundClock.ruthClaps);
  p.clapHeight=.39+.15*end;
  p.roll += (maya ? -.16 : .19) * end;
  p.lean += .13 * end;
  p.head+=(maya?-.24:.32)*wave(t,66.73,67.43,68.14,68.90);
  if(maya) {
    p.lean+=.37*wave(t,96.49,97.70,98.68,99.27)+.41*wave(t,160.98,161.63,164.0,165.4);
    const beforePush = wave(t,65.30,65.79,66.64,67.28);
    const withheld = wave(t,71.47,72.20,72.96,73.50);
    p.lean += .21 * beforePush - .12 * withheld;
    p.headPitch = .18 * beforePush + .32 * wave(t,98.07,98.62,98.90,99.31);
    p.head-=.41*wave(t,98.06,98.66,99.00,99.46);
    const watchesOwen = wave(t,173.16,173.68,174.39,174.71);
    const facesMarek = rise(t,174.38,175.18);
    p.lean += .43 * facesMarek - .32 * watchesOwen;
    p.roll -= .39 * wave(t,174.37,174.89,175.22,175.88);
    p.head -= .44 * wave(t,174.37,174.76,175.05,175.38);
    p.headPitch -= .10 * facesMarek + .24 * watchesOwen;
  } else {
    const watchesMaya = wave(t,65.33,65.86,66.53,67.35);
    const facesMarek = rise(t,172.63,173.26);
    p.headPitch = .38 * watchesMaya - .10 * facesMarek;
    p.lean += .51 * facesMarek;
    p.roll += .33 * wave(t,172.49,172.84,173.21,173.72);
    p.head -= .48 * wave(t,172.49,172.84,173.09,173.48);
  }
}

/**
 * Computes the cast and continuous south-apron camera from programme seconds. Eye and look coordinates are in scene metres. Lens is a vertical field of view in degrees. Non-finite input selects the start and finite input clamps to the programme ends.
 *
 * @evidence contracts/development/common.md#meaningful-documentation The comment declares why the function exists, its clock, camera units and the input rule before the solver samples the authored tracks.
 * @evidence contracts/development/implementation.md#principled-implementation Interpolates independent marked positions, unwrapped bearings and continuous camera keys in one shared scene frame. Role accents and clamps follow the written beats and the puppet's usable pose ranges.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Shared position and base helpers own paths and step phase. Each role family applies its own story accents before the display consumes the result.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts Script-specific marks and anchors are the authored production input. Seek computes from the requested time and carries no progress from prior calls.
 * @evidence contracts/development/implementation.md#efficient-algorithms Work is bounded by ten roles, their fixed authored marks and active accents, plus one camera scan. No frames or meshes are constructed per pose request.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work The immutable path distances and unwrapped bearings are generated once from the production marks. Every seek uses the same tables and allocates new role poses.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources The module retains the fixed mark arrays and at most 2,161 sampled bearings per role. The caller owns the returned pose and camera. No handles are opened.
 * @evidence contracts/development/composition.md#screenplay-realization Ten pose tracks supply authored placement and actions. The view samples the same clock. The scene factory states the individual beat links.
 * @evidence contracts/development/composition.md#composition-only Local scene transforms and pose calculations remain in the track owner. The scene layers installed motion over supported portions.
 * @evidence contracts/development/composition.md#living-scene Each cast family has its own movement, facing and gesture controls, sampled afresh from the opening hold to the ending.
 */
export function performanceAt(t:number): {people:Record<Role,ActorPose>;camera:{eye:Triple;look:Triple;lens:number}} {
  t=clamp(Number.isFinite(t)?t:0,0,180);
  const people={} as Record<Role,ActorPose>;
  for(const role of roles) {
    const p=base(role,t);
    if(role==='owen'||role==='marek') fighter(p,t,role);
    else if(role==='daniel') referee(p,t);
    else if(role==='alan') timekeeperAt(p,t);
    else if(role==='maya'||role==='ruth') ringside(p,role,t);
    else corner(p,role,t);
    p.kneel=clamp(p.kneel);p.arms=p.arms.map(v=>clamp(v,0,3)) as Pair;p.elbow=p.elbow.map(v=>clamp(v,0,2)) as Pair;
    p.reach=p.reach.map(v=>clamp(v,-1,1)) as Pair;people[role]=p;
  }
  return {people,camera:cameraAt(t)};
}
