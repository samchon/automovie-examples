/** Deterministic stereo sound edit for the three-minute screenplay; run after voice.ps1. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { roundClock } from "../src/clock.ts";

const root=resolve(import.meta.dirname,".."), folder=resolve(root,process.env.ROUND_SOUND_CACHE||".cache/sound-sol");
const sr=48000, frames=roundClock.duration*sr;
const left=new Float32Array(frames),right=new Float32Array(frames);
let state=408531;
function white(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2147483648-1;}
const pi=Math.PI;
function put(i,x,pan){
  if(i<0 || i>=frames)return;
  left[i]+=x*Math.sqrt((1-pan)*.5);right[i]+=x*Math.sqrt((1+pan)*.5);
}
function readWav(path){
  const b=readFileSync(path);let rate=0,channels=0,bits=0,samples=null;
  for(let at=12;at+8<=b.length;){
    const tag=b.toString("ascii",at,at+4),n=b.readUInt32LE(at+4);
    if(tag==="fmt "){rate=b.readUInt32LE(at+12);channels=b.readUInt16LE(at+10);bits=b.readUInt16LE(at+22);}
    if(tag==="data")samples=b.subarray(at+8,at+8+n);
    at+=8+n+(n%2);
  }
  if(!samples||bits!==16||channels<1)throw Error("Unsupported voice WAV "+path);
  const a=new Float32Array(samples.length/(2*channels));for(let i=0;i<a.length;i++)a[i]=samples.readInt16LE(i*2*channels)/32768;
  let begin=0,end=a.length-1;while(begin<end&&Math.abs(a[begin])<.007)begin++;while(end>begin&&Math.abs(a[end])<.005)end--;
  return {a:a.subarray(Math.max(0,begin-Math.floor(rate*.012)),Math.min(a.length,end+Math.floor(rate*.05))),rate};
}
function voice(index,time,pan=0,level=.72,max=2){
  const path=resolve(folder,"lines","daniel-"+String(index).padStart(2,"0")+".wav");
  const {a,rate}=readWav(path);const dt=Math.max(rate/sr,a.length/(max*sr)),start=Math.round(time*sr);
  for(let n=0;n<a.length/dt-1;n++){
    const k=n*dt,i=Math.floor(k),u=k-i;
    const v=((1-u)*a[i]+u*a[Math.min(a.length-1,i+1)])*level;
    put(start+n,v,pan);put(start+n+Math.floor(sr*.043),v*.21,-pan);put(start+n+Math.floor(sr*.108),v*.11,pan*.4);
  }
}
function foley(time,kind,pan,level=1){
  const data={
    tap:[.09,186,.023,.15],glove:[.11,102,.038,.19],
    body:[.16,65,.052,.29],short:[.09,135,.028,.27],
    sole:[.13,114,.043,.17],shoe:[.14,136,.038,.18],
    slap:[.15,182,.035,.26],stamp:[.24,63,.086,.38],
    clap:[.29,773,.012,.38],rope:[.28,198,.10,.085],
    squeak:[.10,830,.048,.065],mat:[.36,52,.105,.47],cloth:[.20,430,.05,.065]
  }[kind];
  const [dur,freq,decay,gain]=data;const start=Math.round(time*sr);let last=0;
  for(let j=0;j<dur*sr;j++){
    const t=j/sr,n=white();last=last*.59+n*.41;
    const tail=Math.exp(-t/decay),edge=Math.min(1,t/.002);
    const impulse=kind==="clap"||kind==="slap"||kind==="tap";
    let v=impulse?(n-last)*Math.exp(-t/.025)+last*.40*Math.exp(-t/.072):kind==="squeak"?Math.sin(2*pi*(freq*t+1900*t*t))*Math.sin(pi*t/dur):kind==="cloth"?last*1.5:Math.sin(2*pi*freq*t+Math.sin(t*41)*1.1)*.56+last*.85;
    v*=gain*level*edge*(kind==="clap"?1:tail);
    put(start+j,v,pan);put(start+j+Math.floor(sr*.051),v*.19,-pan);
  }
}
function bell(time,lev){
  const k=Math.round(time*sr); for(let j=0;j<sr*2.20;j++){const t=j/sr;
    const v=(Math.sin(2*pi*696*t)*.43*Math.exp(-t*2.4)+Math.sin(2*pi*1124*t)*.24*Math.exp(-t*3.1)+Math.sin(2*pi*1771*t)*.18*Math.exp(-t*2)+Math.sin(2*pi*2131*t)*.09*Math.exp(-t*4.6))*Math.min(t/.002,1)*lev;
    put(k+j,v,.55);put(k+j+Math.floor(sr*.080),v*.18,-.28);
  }
}
function breath(time,dur,pan,level){
  let previous=0,low=0;const start=Math.round(time*sr);
  for(let j=0;j<sr*dur;j++){const t=j/sr;low=.91*low+.09*white();const hi=low-previous*.60;previous=low;put(start+j,hi*Math.sin(pi*t/dur)**.9*level,pan);}
}
const room=[[0,.15],[4,.16],[35,.18],[40,.11],[45,.18],[62,.12],[68,.19],[91,.22],[108,.15],[119,.075],[125,.055],[134,.13],[145,.11],[149,.045],[150.3,.30],[153,.18],[157,.015],[167,.013],[168.2,.13],[170.2,.33],[173,.18],[176,.08],[177.7,.018],[180,.015]];
let node=0,lo=0,lo2=0,slow=.4;
for(let i=0;i<frames;i++){
 const t=i/sr;while(node+1<room.length-1&&t>room[node+1][0])node++;
 const [a,va]=room[node],[b,vb]=room[node+1],v=va+(vb-va)*Math.min(1,(t-a)/(b-a));
 lo=lo*.981+white()*.019;lo2=lo2*.966+white()*.034;slow=slow*.9993+Math.abs(white())*.0007;
 const bed=(lo*1.32+lo2*.6)*v*(.8+slow*.2);
 left[i]=bed+lo2*v*.09;right[i]=bed-lo2*v*.16;
}
bell(0,.5);
for(const [index,[time,max,pan,level]] of roundClock.lines.entries())voice(index,time,pan,level,max);
bell(roundClock.bell,.60);
const lanes=[
 [3.22,3.78,5.34,11.72,13.58,15.36,15.96,16.52,27.15,30.70,31.63,32.72],
 [43.08,46.14,47.23,53.04,54.35,55.18,66.18,66.98,71.36,75.57,76.39,82.34,86.61],
 [90.78,91.28,92.47,96.76,101.28,102.39,roundClock.redPush,roundClock.blueAnswer,133.52,136.70,139.20,142.19,143.35,144.29]
];
for(const lane of lanes)for(const [j,t] of lane.entries()){foley(t,"glove",.30*Math.sin(t*.15),.58+.23*(j%3));}
for(const t of [1.10,1.91,2.89,4.40,6.70,7.56,8.68,9.72,11.84,13.70,16.30,18.50,25.70,28.70,32.40,42.55,43.10,45.30,48.20,49.60,52.57,55.84,58.82,61.15,64.45,68.68,71.64,75.88,80.80,85.25,87.50,91.07,91.67,92.30,92.7,93.28,93.87,96.40,98.85,100.70,103.60,106.20,109.80,113.05,118.75,119.65,122.90,124.65,127.20,131.30,134.20,138.80,141.40,143.73,145.9,152.7,153.2,153.8,154.4,155.04,155.75])foley(t,"sole",Math.sin(t/13)*.35,.77);
for(const t of [37.65,38.35,155.96,156.49])foley(t,"shoe",-.24,.84);
for(const t of [14.92,17.30,28.20])foley(t,"rope",-.53,.86);
for(const t of [9.28,28.9,32.6,50.0,115.74,134.81])foley(t,"squeak",-.18,.76);
for(const t of [22.05,27.25,42.58,82.55,83.28,87.60,90.4,107.02,136.88,147.52,151.2,168.17,171.1,174.7])breath(t,.57,t<163?-.21:.36,.49);
for(const t of [119.89,120.91,121.94,123.07])breath(t,.80,-.52,.83);
foley(roundClock.touch,"tap",.02,.82);
foley(5.95,"body",-.14,.81);
foley(21.95,"body",-.46,1.03);
foley(50.95,"short",.12,.92);
foley(roundClock.guardCrack,"slap",.12,.88);
foley(roundClock.redReply,"short",.22,1.13);
foley(roundClock.redSole,"slap",-.50,1.12);
for(const t of roundClock.mayaClaps)foley(t,"clap",.62,t<100?.67:.80);
for(const t of roundClock.ruthClaps)foley(t,"clap",.76,t<100?.52:.88);
for(const t of roundClock.joClaps)foley(t,"clap",-.68,.59);
for(const t of roundClock.edClaps)foley(t,"clap",-.54,.53);
foley(roundClock.pavelClap,"clap",.28,.53);
foley(roundClock.knockdown,"short",-.38,1.24);
foley(roundClock.canvasTouch,"mat",-.36,.89);
foley(151.02,"cloth",-.36,.78);
for(const t of roundClock.victoryStamps)foley(t,"stamp",.23,1.10);
let peak=0,total=0;const out=Buffer.alloc(44+frames*4);
out.write("RIFF",0);out.writeUInt32LE(out.length-8,4);out.write("WAVEfmt ",8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(sr,24);out.writeUInt32LE(sr*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write("data",36);out.writeUInt32LE(frames*4,40);
for(let i=0;i<frames;i++){for(const [k,v] of [[0,left[i]],[1,right[i]]]){const x=Math.tanh(v*1.45)*.96;out.writeInt16LE(Math.round(x*32767),44+i*4+k*2);peak=Math.max(peak,Math.abs(x));total+=x*x;}}
mkdirSync(folder,{recursive:true});writeFileSync(resolve(folder,"round.wav"),out);
console.log(JSON.stringify({sampleRate:sr,channels:2,frames,duration:roundClock.duration,peak,rms:Math.sqrt(total/(frames*2)),lateClaps:[roundClock.mayaClaps.at(-1),roundClock.ruthClaps.at(-1)]}));
