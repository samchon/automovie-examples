import * as THREE from "three";

type Position = { x: number; y: number; z: number };
type BroadcastState = {
  play: number;
  replay: boolean;
  remaining: number;
  home: number;
  away: number;
  players: Record<string, Position>;
  ball: readonly [number, number, number];
  cameraFocus: readonly [number, number, number];
};

/** Each row is [air seconds, target X, target Y, target Z, horizontal field width at the target]. */
type Frame = readonly [number, number, number, number, number];
const gameFrames: readonly Frame[] = [
  [0, 7.5, 0.9, 0.9, 24], [17, 7.5, 0.9, 0.9, 24],
  [21, 10.2, 1.35, 0.9, 18], [25.2, 10.2, 1.35, 0.9, 18],
  [28.3, 8.7, 0.9, 0.7, 25.5], [33.8, -1.2, 0.95, 0.1, 27.5],
  [37.5, -7.4, 1.0, 0.1, 22.7], [43.5, -8, 1.25, 0.2, 18.7],
  [49.6, -10.3, 1.55, -0.65, 16.7], [52.2, -10.3, 1.55, -0.65, 16.7],
  [55.0, -8.7, 0.9, 0.2, 24], [61, 0.4, 1, 1.9, 25],
  [65.2, 6.2, 1.15, 4.6, 16], [69, 5.3, 1.1, 5.8, 19.3],
  [73.5, 0, 1.1, 7.6, 20.2], [80, -4.1, 1.0, 8.45, 6.8], [83, -4.1, 1, 8.45, 6.8],
  [136, 7.2, 1.12, 1.8, 22], [140, 7.6, 1.15, 1.1, 21.7],
  [145, 9.3, 1.18, 1.6, 18.5], [147.3, 10.95, 1.15, 2.8, 14.2],
  [151.3, 10.95, 1.45, 2.8, 14.5], [152.5, 11, 1.5, 1.3, 16.1],
  [155, 9.0, 1.05, 0.65, 24.5], [161, 0, 0.95, 0.25, 25.3],
  [165, -7.0, 1.2, -0.2, 22.7], [174.5, -8.4, 1.35, 0.1, 22.5],
  [177.4, -9.3, 1.7, 0.0, 20.2], [178.25, -10, 1.6, -0.3, 14.4],
  [179.25, -9.3, 1.29, -0.2, 6.7], [180, -9.1, 1.34, -0.1, 5.24],
];

/** A follows the screener through his two plays while preserving its surrounding lens path. */
function followScreen(base: Frame, air: number): Frame {
  const first = air > 43.5 && air < 49.6;
  const last = air > 171.5 && air < 176.65;
  if (!first && !last) return base;
  const weight = first
    ? THREE.MathUtils.smoothstep(air, 43.5, 44.8) * (1 - THREE.MathUtils.smoothstep(air, 47.96, 49.6))
    : THREE.MathUtils.smoothstep(air, 171.5, 173.08) * (1 - THREE.MathUtils.smoothstep(air, 175.45, 176.65));
  const target = first ? [-8.7, 1.27, 2.66, 11.45] : [-8.48, 1.4, -2.85, 11.72];
  return [air, THREE.MathUtils.lerp(base[1], target[0], weight), THREE.MathUtils.lerp(base[2], target[1], weight),
    THREE.MathUtils.lerp(base[3], target[2], weight), THREE.MathUtils.lerp(base[4], target[3], weight)];
}

/** Smooth optical changes can be sampled out of sequence, including exactly on either cut. */
function between(frames: readonly Frame[], t: number): Frame {
  const i = frames.findIndex(frame => frame[0] >= t);
  if (i < 0) return frames[frames.length - 1];
  if (i === 0) return frames[0];
  const a = frames[i - 1], b = frames[i];
  let u = THREE.MathUtils.clamp((t - a[0]) / (b[0] - a[0]), 0, 1);
  u = u*u*(3-2*u);
  return [t, THREE.MathUtils.lerp(a[1], b[1], u), THREE.MathUtils.lerp(a[2], b[2], u),
    THREE.MathUtils.lerp(a[3], b[3], u), THREE.MathUtils.lerp(a[4], b[4], u)];
}

/**
 * Operates the high scorer's-table camera A, the recorded east-baseline replay camera B, and the score-and-clock key over the same court.
 *
 * @evidence contracts/development/common.md#meaningful-documentation Seek receives air seconds and the game state. Lens marks specify a target and horizontal span in metres. The mount owns and disposes a camera-relative score plane.
 * @evidence contracts/development/implementation.md#principled-implementation Each seek selects the scripted camera and its lens from broadcast time. The replay therefore uses another optical position while the score bug preserves the stopped live game.
 * @evidence contracts/development/implementation.md#clear-and-simple-structure Ordinary court frames and bench frames use one easing and projection routine; the scoreboard owns its own canvas and camera-relative placement.
 * @evidence contracts/development/implementation.md#prohibited-implementation-shortcuts The scoreboard is drawn inside the actual 3D render and follows the current game state; no browser overlay or encoded post hoc score is needed.
 * @evidence contracts/development/implementation.md#efficient-algorithms Each seek searches a bounded list of optical cues, touches the scoreboard texture only on a score, clock or replay change and updates one camera.
 * @evidence contracts/development/implementation.md#reuse-equivalent-work Both installed viewpoints use the same projected-field-width calculation and the same score graphic, including playback through the inspector.
 * @evidence contracts/development/implementation.md#bound-retention-and-release-resources One mount owns a canvas texture, material and plane, and dispose removes the plane and releases its GPU allocations.
 * @evidence contracts/development/entities.md#settings-realization docs/body/screenplay/two-hands/010-game.md#east-basket, #replay, #restart and #last-board set A's opener, the seven-second B insert, the live bench return and the closing push. The delivery uses A for both #second-help marks. docs/research/broadcast/live.md#geometry and docs/body/brief/sets/shohoku-gym.md#court place A above the table and B by the east endline.
 * @evidence contracts/development/entities.md#object-shape The staged camera accepts game state and display time and yields its pose, projection and score key. Team and ball positions remain owned by the game.
 * @evidence contracts/development/entities.md#controls-and-source This original source defines both optical positions, timed reframing, electronic scoreboard lettering and screen-safe placement; its sole moving input is the production's evaluated frame.
 */
export function createBroadcast(camera: THREE.PerspectiveCamera): { seek(air:number,state:BroadcastState):void; dispose():void } {
  const canvas=document.createElement("canvas");
  canvas.width=930;canvas.height=170;
  const ctx=canvas.getContext("2d")!;
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.generateMipmaps=false;
  map.minFilter=THREE.LinearFilter;
  const material=new THREE.MeshBasicMaterial({map,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
  const geometry=new THREE.PlaneGeometry(1,1);
  const key=new THREE.Mesh(geometry,material);
  key.name="Live Korean broadcast score";key.frustumCulled=false;key.renderOrder=10000;camera.add(key);
  const target=new THREE.Vector3();
  let last="";
  function paint(home:number,away:number,clock:string,replay:boolean):void {
    const tag=[home,away,clock,replay].join("|");
    if(tag===last) return;
    last=tag;ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#172c31";ctx.fillRect(0,0,852,103);
    ctx.fillStyle="#883c3e";ctx.fillRect(0,0,12,103);
    ctx.fillStyle="#456784";ctx.fillRect(239,0,10,103);
    ctx.fillStyle="#294044";ctx.fillRect(588,0,264,103);
    ctx.textAlign="left";ctx.textBaseline="middle";
    ctx.fillStyle="#fcf4df";ctx.font='bold 45px "Malgun Gothic","Noto Sans KR",sans-serif';
    ctx.fillText("북산",31,52);ctx.fillText("하마우라",268,52);
    ctx.font='bold 65px "Arial",sans-serif';ctx.fillText(String(home),133,53);ctx.fillText(String(away),482,53);
    ctx.fillStyle="#c3cfcd";ctx.font='bold 31px "Malgun Gothic",sans-serif';ctx.fillText("후반",608,54);
    ctx.fillStyle="#ffe29f";ctx.font='bold 55px "Consolas",monospace';ctx.fillText(clock,693,54);
    if(replay){
      ctx.fillStyle="#8f393c";ctx.fillRect(0,107,208,54);
      ctx.fillStyle="#fffaed";ctx.font='bold 33px "Malgun Gothic",sans-serif';ctx.fillText("다시 보기",24,136);
    }
    map.needsUpdate=true;
  }
  function settle(air:number,state:BroadcastState):Frame {
    if (state.replay) return between([[83,10.6,1.25,2.1,15.5],[86.5,10.6,1.25,2.1,15.5],[89.99,11.3,1.5,1.6,14.1]],air);
    if (air>=90 && air<136) {
      const {b7,b4,b8}=state.players;
      const start=(b7.x+b4.x)/2, second=(b8.x+b4.x)/2, ends=(b8.x+b7.x)/2;
      return between([
        [90,start,1.28,8.37,5.3],[96.25,start,1.28,8.37,5.3],[97.7,ends+.35,1.18,8.37,6.5],
        [100,b4.x,1.2,8.36,5.1],[104.7,second,1.0,8.35,4.6],
        [106.9,second,1,8.36,4.6],[110.8,ends,1.08,8.42,6.8],[116.9,ends,1.08,8.42,6.8],
        [119.1,0.15,1.05,8.15,20.8],[125,0.15,1.05,8.1,20.8],
        [131.5,6.2,1.15,5.4,20],[136,7.2,1.12,1.8,22],
      ],air);
    }
    const base=followScreen(between(gameFrames,air),air);
    if(air>178.25){
      const u=THREE.MathUtils.smoothstep(air,178.25,179.25);
      const rebound=state.players.w10, center=state.players.w4;
      return [air,THREE.MathUtils.lerp(base[1],rebound.x*0.82+center.x*0.18,u),base[2],
        THREE.MathUtils.lerp(base[3],rebound.z*0.85+center.z*0.15,u),base[4]];
    }
    return base;
  }
  return {
    seek(air:number,state:BroadcastState):void {
      const [,x,y,z,width]=settle(air,state);
      if(state.replay) camera.position.set(16.3,2.25,8.8);
      else camera.position.set(0,9.8,19);
      target.set(x,y,z);
      camera.lookAt(target);
      const fullHeight=width/camera.aspect;
      camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(fullHeight/(2*camera.position.distanceTo(target))));
      camera.updateProjectionMatrix();
      const second=Math.max(0,Math.ceil(state.remaining-0.000001));
      const clock=Math.floor(second/60)+":"+String(second%60).padStart(2,"0");
      paint(state.home,state.away,clock,state.replay);
      // Score key stays within the top-left television title-safe area at every lens setting.
      const overlayDistance=Math.max(camera.near*1.5,0.35);
      const halfH=overlayDistance*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2), halfW=halfH*camera.aspect;
      const w=halfW*0.64, h=w*canvas.height/canvas.width;
      key.scale.set(w,h,1);
      key.position.set(-halfW*0.94+w/2,halfH*0.94-h/2,-overlayDistance);
      camera.updateMatrixWorld(true);
    },
    dispose():void {key.removeFromParent();map.dispose();geometry.dispose();material.dispose();},
  };
}
