import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const production = path.resolve(import.meta.dirname, "..");
const [command, outputDirectory] = process.argv.slice(2);
const output = path.resolve(outputDirectory);
const ffmpeg = path.join(production, "node_modules", "ffmpeg-static", "ffmpeg.exe");
const screenplay = fs.readFileSync(path.join(production, "docs/body/screenplay/two-hands/010-game.md"), "utf8");
const voiceRoles: Record<string, string> = { "캐스터": "caster", "해설": "analyst", "파랑 7번": "bench-seven", "파랑 4번": "bench-four" };
const voiceDynamics: Readonly<Record<string, readonly [rate: number, pitch: number]>> = {
  analyst: [0, -4], court: [2, -2], "bench-seven": [1, 2], "bench-four": [3, -5],
};
const spoken = [...screenplay.matchAll(/^\*\*(캐스터|해설|파랑 7번|파랑 4번)\*\*\s+(.+)$/gm)].map((match) => ({
  role: voiceRoles[match[1]],
  words: match[2].trim(),
}));
if (spoken.length !== 12) throw Error("The broadcast cue sheet expects twelve screenplay lines.");

const cues: Array<{id: string; role: string; start: number; deadline: number; text: string; pronunciation: string; rate: number; pitch: number}> = [];
function cue(role: string, start: number, deadline: number, text: string) {
  if (!screenplay.includes(text)) throw Error("The spoken line differs from the screenplay: " + text);
  const numbers: Record<string, string> = { "4": "사", "5": "오", "7": "칠", "8": "팔" };
  const pronunciation = text.replace(/([4578])번/g, (_, digit) => numbers[digit] + " 번");
  const [rate, pitch] = voiceDynamics[role] ?? [1, 1];
  cues.push({
    id: String(cues.length + 1).padStart(2, "0"), role, start, deadline, text, pronunciation,
    rate, pitch,
  });
}
function line(index: number, start: number, deadline: number) {
  cue(spoken[index].role, start, deadline, spoken[index].words);
}
line(0, 2.00, 9.30);
line(1, 24.86, 27.48);
line(2, 27.58, 36.80);
cue("court", 44.95, 45.70, "왼쪽!");
line(3, 51.97, 60.20);
line(4, 65.45, 68.75);
line(5, 69.65, 74.60);
line(6, 83.63, 89.83);
line(7, 96.45, 98.82);
line(8, 104.60, 105.93);
cue("caster", 146.92, 148.05, "치수, 멈춥니다.");
cue("court", 148.10, 148.84, "여기!");
cue("caster", 149.03, 151.78, "코너에 정대만……");
cue("caster", 152.04, 155.70, "들어갔어요! 북산이 한 점 앞섭니다!");
line(10, 156.04, 162.20);
line(11, 179.03, 179.68);
if (cues.filter(c => c.role !== "court").map(c => c.text).join(" ") !== spoken.map(s => s.words).join(" ")) {
  throw Error("The spoken schedule must reproduce all of the marked screenplay dialogue in order.");
}
function json(name: string, value: unknown) {
  fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2) + "\n");
}
if (command === "cues") {
  json("speech-cues.json", cues);
  process.exit(0);
}
if (command !== "mix") throw Error("Use cues or mix and a destination folder.");

const sampleRate = 48000;
const frames = 180 * sampleRate;
const effects = new Float32Array(frames * 2);
const speech = new Float32Array(frames * 2);
const turn = 2 * Math.PI;
let seed = 14492;
function noise() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
}
type Generator = (time: number) => number;
function space(track: Float32Array, start: number, source: Float32Array, gain: number, pan: number, wet: number) {
  const reflections = [[0, 1, pan], [.034, wet * .54, -.65], [.066, wet * .45, .70], [.113, wet * .30, -.28], [.179, wet * .21, .43], [.239, wet * .13, -.52], [.328, wet * .08, .37]];
  for (const [delay, level, balance] of reflections) {
    if (level === 0) continue;
    const first = Math.round((start + delay) * sampleRate);
    const left = gain * level * Math.cos((balance + 1) * Math.PI / 4);
    const right = gain * level * Math.sin((balance + 1) * Math.PI / 4);
    const total = Math.min(source.length, frames - first);
    for (let i = 0; i < total; i++) {
      track[(first + i) * 2] += source[i] * left;
      track[(first + i) * 2 + 1] += source[i] * right;
    }
  }
}
function effect(start: number, duration: number, gain: number, pan: number, wet: number, generator: Generator) {
  const count = Math.ceil(duration * sampleRate);
  const sound = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    sound[i] = generator(i / sampleRate) * Math.min(1, i / 24, (count - 1 - i) / 130);
  }
  space(effects, start, sound, gain, pan, wet);
}
function bounce(time: number, pan: number, weight: number) {
  const note = 144 + 16 * noise();
  effect(time, .23, weight * .37, pan, .58, t =>
    Math.exp(-t * 21) * Math.sin(turn * (note * t + .68 * (1 - Math.exp(-62 * t)))) +
    .27 * Math.exp(-t * 34) * Math.sin(turn * 314 * t) +
    .25 * Math.exp(-t * 93) * noise());
}
function palm(time: number, pan: number, strength = .26) {
  let filter = 0;
  effect(time, .14, strength, pan, .48, t => {
    filter += .34 * (noise() - filter);
    return filter * 2.9 * Math.exp(-44 * t) + .37 * Math.sin(turn * 210 * t) * Math.exp(-47 * t);
  });
}
function squeak(time: number, pan: number, strength: number) {
  const hz = 820 + 210 * noise();
  const span = .075 + .055 * (noise() + 1);
  effect(time, span, strength, pan, .53, t => {
    const progress = t / span;
    const phase = turn * (hz * t + 800 * t * t + .45 * Math.sin(64 * t));
    return Math.sin(Math.PI * progress) ** 1.2 * (.63 * Math.sin(phase) + .15 * Math.sin(2 * phase) + .16 * noise());
  });
}
function impact(time: number, pan: number, strong: boolean) {
  effect(time, strong ? .66 : .44, strong ? .47 : .35, pan, .65, t =>
    .48 * Math.sin(turn * 91 * t) * Math.exp(-18 * t) +
    .55 * Math.sin(turn * 371 * t) * Math.exp(-9 * t) +
    .29 * Math.sin(turn * 633 * t) * Math.exp(-16 * t) +
    .19 * Math.sin(turn * 1009 * t) * Math.exp(-21 * t) +
    .21 * noise() * Math.exp(-48 * t));
}
function net(time: number, pan: number) {
  let low = 0;
  effect(time, .28, .25, pan, .48, t => {
    const white = noise();
    low += .21 * (white - low);
    return (white - low) * (Math.sin(Math.PI * t / .28) ** 1.35) * Math.exp(-5 * t);
  });
}
function claps(time: number, pan: number, strength: number) {
  let previous = 0;
  effect(time, .16, strength, pan, .75, t => {
    const white = noise();
    const high = white - .72 * previous;
    previous = white;
    return .68 * high * Math.exp(-56 * t) + .33 * Math.sin(turn * 645 * t) * Math.exp(-56 * t);
  });
}
function timer(time: number, length: number, hz: number, level: number) {
  effect(time, length, level, .03, .68, t => {
    const attack = Math.min(1, t / .016);
    const release = Math.min(1, (length - t) / .044);
    return attack * release * (.70 * Math.sin(turn * hz * t) + .23 * Math.sin(turn * hz * 3 * t) + .12 * Math.sin(turn * hz * 5 * t));
  });
}
function cheer(time: number, intensity: number) {
  for (let i = 0; i < 25 * intensity; i++) {
    const offset = .12 + 1.5 * (noise() + 1);
    claps(time + offset, noise() * .92, (.025 + .017 * (noise() + 1)) * Math.exp(-offset * .3));
  }
}

// Sample the actual on-air ball and player motion so shoes and bounces move with their sources.
// Use Vite's existing resolver to load the same authored game and linked SDK modules as the picture.
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve("vite/package.json"))("esbuild") as typeof import("esbuild");
const sampler = await build({
  entryPoints: [path.join(production, "src/composition/scenes/two-hands/010-game/game.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  write: false,
});
const { gameAt } = await import("data:text/javascript;base64," + Buffer.from(sampler.outputFiles[0].contents).toString("base64"));
const floorContacts: number[] = [];
const pans = (x: number) => Math.max(-.80, Math.min(.80, x / 15));
let lastBounce = -1;
let previous = gameAt(0);
let before = previous;
const footTravel: Record<string, number> = {};
const interval = 1 / 60;
for (let n = 1; n < 180 * 60; n++) {
  const t = n * interval;
  const state = gameAt(t);
  if (!state.replay && !previous.replay && !before.replay && previous.ball[1] < .33 && previous.ball[1] <= before.ball[1] && previous.ball[1] < state.ball[1] && t - lastBounce > .16) {
    lastBounce = t - interval;
    floorContacts.push(lastBounce);
    const impactSpeed = Math.max(.4, Math.min(1.3, (before.ball[1] - previous.ball[1] + state.ball[1] - previous.ball[1]) * 12));
    bounce(lastBounce, pans(previous.ball[0]), impactSpeed);
  }
  if (!state.replay && !previous.replay) {
    for (const [id, player] of Object.entries(state.players) as [string, {x:number;z:number;action:string}][]) {
      const previousPlayer = previous.players[id];
      if (!previousPlayer) continue;
      const distance = Math.hypot(player.x - previousPlayer.x, player.z - previousPlayer.z);
      if (distance > .4 || distance < .002) continue;
      footTravel[id] = (footTravel[id] || 0) + distance;
      if (footTravel[id] < 1.1) continue;
      footTravel[id] -= 1.1;
      const pan = pans(player.x);
      const foreground = Math.max(.22, Math.min(1, 1 - Math.abs(player.x - state.ball[0]) / 16));
      effect(t, .10, .027 * foreground, pan, .51, s => Math.exp(-46 * s) * (.74 * Math.sin(turn * 105 * s) + .3 * noise()));
      if (noise() > .77) squeak(t + .015, pan, .035 * foreground);
    }
  }
  before = previous;
  previous = state;
}
if (floorContacts.length < 12) throw Error("Too few floor contacts were detected in the full game: " + floorContacts.length);

impact(24.84, .73, true);
net(24.89, .73);
cheer(25.00, 1);
palm(28.00, .60);
squeak(45.1, -.48, .08);
effect(51.53, .13, .31, -.72, .5, t => Math.exp(-36*t) * (.76*Math.sin(turn*237*t)+.25*noise()));
net(51.84, -.72);
cheer(52.00, .92);
palm(55.00, -.61);
effect(65.00, .35, .27, .41, .72, t =>
  (Math.sin(turn * (2420 * t + 2.4 * Math.sin(23 * t))) + .47 * Math.sin(turn * 3070 * t)) *
  (.82 + .13 * Math.sin(turn * 43 * t)) * Math.min(1, t/.025, (.35-t)/.07));
timer(68.18, .26, 535, .22);
for (const [time, pan] of [[82.6,-.45],[85.3,-.38],[87.9,-.48]]) {
  let band = 0;
  let low = 0;
  effect(time,.70,.045,pan,.40,t => {
    band += .22*(noise()-band);
    low += .035*(band-low);
    return (band-low)*Math.sin(Math.PI*t/.70)**1.2;
  });
}
squeak(86.9,-.36,.028);
claps(94.50, .21, .47);
claps(106.00, .42, .44);
timer(119.00, .40, 585, .22);
timer(129.00, .43, 585, .23);
palm(136.00, .35);
net(151.90, .72);
cheer(152.05, 1.24);
palm(155.00, .64);
impact(178.00, -.76, false);
palm(179.00, -.53, .40);
effect(179.60,.11,.15,-.54,.5,t => Math.exp(-40*t)*(.80*Math.sin(turn*101*t)+.25*noise()));
timer(179.73, .205, 297, .36);

// A narrow-band room floor and low, diffuse audience murmur stay live through the B replay.
let airLeft=0, airRight=0, murmurLeft=0, murmurRight=0, bass=0;
for (let i=0; i<frames; i++) {
  const t=i/sampleRate;
  const leftNoise=noise(), rightNoise=noise();
  airLeft += .16*(leftNoise-airLeft);
  airRight += .16*(rightNoise-airRight);
  murmurLeft += .035*(airLeft-murmurLeft);
  murmurRight += .035*(airRight-murmurRight);
  bass += .008*(leftNoise+rightNoise-bass);
  const anticipation = t>160 ? .81+(t-160)*.026 : t>70 && t<119 ? .62 : 1;
  const crowd = anticipation*(.73+.15*Math.sin(t*.45)+.1*Math.sin(t*.81+.6));
  const opening = Math.max(0,Math.min(1,(t-floorContacts[0])/.32));
  effects[2*i] += opening*(.014*airLeft+crowd*.065*murmurLeft+.008*bass);
  effects[2*i+1] += opening*(.014*airRight+crowd*.065*murmurRight+.008*bass);
}

function srtTime(t: number) {
  const ms = Math.round(t * 1000);
  const pad = (n: number) => String(n).padStart(2,"0");
  return "00:" + pad(Math.floor(ms / 60000)) + ":" + pad(Math.floor(ms / 1000) % 60) + "," + String(ms % 1000).padStart(3,"0");
}
const subs: string[] = [];
const measured = [];
for (const cue of cues) {
  const file = fs.readFileSync(path.join(output,"takes",cue.id+".f32"));
  const source = new Float32Array(file.buffer,file.byteOffset,file.byteLength/4);
  let first=0, last=source.length-1, peak=0;
  while(first<last && Math.abs(source[first])<.002) first++;
  while(last>first && Math.abs(source[last])<.002) last--;
  first=Math.max(0,first-360);
  last=Math.min(source.length-1,last+700);
  if(last-first<1200) throw Error("Empty speech " + cue.id);
  for(let i=first;i<=last;i++) peak=Math.max(peak, Math.abs(source[i]));
  const maxSamples=Math.floor((cue.deadline-cue.start)*sampleRate);
  const natural=last-first+1;
  const length=Math.min(natural,maxSamples);
  const ratio=natural/length;
  if(ratio>2.2) throw Error("Spoken line would require excessive acceleration: "+cue.text+" "+ratio);
  let compact: Float32Array;
  if(ratio>1.003) {
    const slice=Buffer.from(source.buffer,source.byteOffset+first*4,natural*4);
    const compressed=spawnSync(ffmpeg,["-hide_banner","-loglevel","error","-f","f32le","-ar","48000","-ac","1","-i","pipe:0","-af","atempo="+ratio.toFixed(7),"-f","f32le","pipe:1"],{input:slice,maxBuffer:8e6,windowsHide:true});
    if(compressed.status!==0) throw Error(compressed.stderr.toString());
    compact=new Float32Array(compressed.stdout.buffer,compressed.stdout.byteOffset,Math.min(length,compressed.stdout.byteLength/4));
  } else compact=source.subarray(first,last+1);
  const court=cue.role==="court";
  const analyst=cue.role==="analyst";
  const bench=cue.role==="bench-seven" || cue.role==="bench-four";
  const pan=bench?(cue.role==="bench-seven"?.28:.12):court?(cue.text==="여기!"?.47:-.34):analyst?-.035:.035;
  const level=bench?.56:court?.33:analyst?.57:.64;
  space(speech,cue.start,compact,level/Math.max(.15,peak),pan,bench?.46:court?.76:.047);
  const end=cue.start+compact.length/sampleRate;
  subs.push(String(subs.length+1)+"\r\n"+srtTime(cue.start)+" --> "+srtTime(Math.min(cue.deadline,Math.max(end,cue.start+.8)))+"\r\n"+cue.text+"\r\n");
  measured.push({...cue,end,sourceSeconds:natural/sampleRate,tempo:ratio});
}
fs.writeFileSync(path.join(output,"captions.srt"),subs.join("\r\n"),"utf8");
// Keep the court underneath the two on-mic voices; court calls carry room echoes.
const clarity = [];
for (const line of measured) {
  const first = Math.floor(line.start*sampleRate);
  const last = Math.floor(line.end*sampleRate);
  let voicePower=0, courtPower=0;
  for (let frame=first;frame<last;frame++) {
    const edge=Math.min(1,(frame-first)/720,(last-frame)/1600);
    const duck=1-(line.role==="court"?.42:.25)*edge;
    for (let ch=0;ch<2;ch++) {
      const i=2*frame+ch;
      effects[i]*=duck;
      if (Math.abs(speech[i])>.015) {
        voicePower+=speech[i]*speech[i];
        courtPower+=effects[i]*effects[i];
      }
    }
  }
  clarity.push({id:line.id,voicedDialogueToBedDB:10*Math.log10(voicePower/Math.max(courtPower,1e-12))});
}
for (let i=0;i<Math.round(.025*sampleRate);i++) {
  const release=i/(.025*sampleRate);
  effects[2*(frames-1-i)]*=release;
  effects[2*(frames-1-i)+1]*=release;
}
function writeWave(file: string, sample: (n: number) => number) {
  const out=fs.openSync(path.join(output,file),"w");
  try {
    const header=Buffer.alloc(44);
    header.write("RIFF",0); header.writeUInt32LE(36+frames*4,4); header.write("WAVEfmt ",8);
    header.writeUInt32LE(16,16); header.writeUInt16LE(1,20); header.writeUInt16LE(2,22);
    header.writeUInt32LE(sampleRate,24); header.writeUInt32LE(sampleRate*4,28);
    header.writeUInt16LE(4,32); header.writeUInt16LE(16,34); header.write("data",36); header.writeUInt32LE(frames*4,40);
    fs.writeSync(out,header);
    const buffer=Buffer.alloc(32768);
    for(let i=0;i<frames*2;){
      const n=Math.min(buffer.length/2,frames*2-i);
      for(let j=0;j<n;j++) buffer.writeInt16LE(Math.round(32760*Math.max(-1,Math.min(1,sample(i+j)))),2*j);
      fs.writeSync(out,buffer,0,n*2);
      i+=n;
    }
  } finally {fs.closeSync(out);}
}
writeWave("dialogue.wav",i=>speech[i]);
writeWave("court.wav",i=>effects[i]);
writeWave("premix.wav",i=>.85*(speech[i]+effects[i]));
function measure(file: string) {
  const p=spawnSync(ffmpeg,["-hide_banner","-nostats","-i",path.join(output,file),"-af","loudnorm=I=-23:TP=-1.5:LRA=12:print_format=json","-f","null","-"],{encoding:"utf8",windowsHide:true});
  if(p.status!==0) throw Error(p.stderr);
  const block=p.stderr.match(/\{\s*"input_i"[\s\S]+?\}/);
  if(!block) throw Error(p.stderr);
  return JSON.parse(block[0]);
}
const beforeLevel=measure("premix.wav");
const gainDb=Math.min(-23-Number(beforeLevel.input_i), -1.5-Number(beforeLevel.input_tp));
const gain=.85 * 10 ** (gainDb/20);
writeWave("mix.wav",i=>gain*(speech[i]+effects[i]));
const levels=measure("mix.wav");
const result={
  duration:180,sampleRate,channels:2,frames,voice:"Microsoft Heami Desktop - Korean (SAPI)",cues:measured,
  floorContacts,claps:[94.5,106],warning:119,timeoutEnd:129,rebound:179,buzzerOnset:179.73,clarity,
  replaysKeepLiveSound:true,loudnessLUFS:Number(levels.input_i),truePeakDBTP:Number(levels.input_tp),
  loudnessRangeLU:Number(levels.input_lra),targetLUFS:-23,truePeakLimitDBTP:-1.5,commonGain:gain,
  speechLines:11,courtCalls:2,sha256:createHash("sha256").update(fs.readFileSync(path.join(output,"mix.wav"))).digest("hex"),
};
json("audio-report.json",result);
console.log(JSON.stringify({file:"mix.wav",duration:result.duration,speechCues:measured.length,floorContacts:floorContacts.length,LUFS:result.loudnessLUFS,dBTP:result.truePeakDBTP,sha256:result.sha256}));
