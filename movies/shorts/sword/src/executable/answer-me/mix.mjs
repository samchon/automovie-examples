import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [voiceDir, destination] = process.argv.slice(2);
const rate=48000, length=60*rate, tau=2*Math.PI;
const left=new Float32Array(length),right=new Float32Array(length);
let seed=615303091;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function layer(start,duration,pan,sample){
  const offset=Math.round(start*rate),n=Math.min(Math.round(duration*rate),length-offset);
  const a=Math.sqrt((1-pan)*.5),b=Math.sqrt((1+pan)*.5);
  for(let i=0;i<n;i++){ const s=sample(i/rate,i);left[offset+i]+=a*s;right[offset+i]+=b*s; }
}
let wind=0,leaves=0;
layer(0,60,0,(t)=>{
  wind+=.0045*((random()*2-1)-wind);leaves+=.083*((random()*2-1)-leaves);
  return (.14*wind+.026*leaves)*(.70+.17*Math.sin(.55*t)+.08*Math.sin(.83*t));
});
function tap(at,base,gain,pan,decay=.09,noise=.16){
  let grain=0;
  layer(at,decay*5,pan,t=>{
    grain+=.26*(random()*2-1-grain);
    return gain*(1-Math.exp(-t*1600))*(Math.exp(-t/decay)*(Math.sin(tau*base*t+2*Math.exp(-t*60))+.41*Math.sin(tau*base*1.77*t)) + noise*grain*Math.exp(-t/(decay*1.5)));
  });
}
function rustle(at,duration,gain,pan){
 let grain=0;
 layer(at,duration,pan,t=>{grain+=.13*(random()*2-1-grain);return gain*grain*Math.sin(Math.PI*t/duration)**1.8;});
}
function chink(t,gain,pan){
  [1120,1728,2463,3390].forEach((pitch,i)=>tap(t,pitch,gain/(i+1),pan,.11/(1+i*.18),.06));
}
chink(1.36,.09,-.04);chink(2.55,.052,.1);rustle(5.72,.53,.085,.24);
for(const [start,pan,delay] of [[5.64,.23,0],[6.85,-.30,.16]]){
 let t=start+delay;
 while(t<(pan>0?46.8:43.72)){
   const brake = pan>0?32.8:30.8;
   const slow = Math.min(.52,Math.max(0,t-brake)*.085);
   const speed = t<9?1.06-(t-6)*.10:.64+slow;
   for(const [k,offset] of [0,.16,.36,.55].entries()){
     const at=t+speed*offset+.012*(random()-.5);
     const gain=(t<9?.078:t<35?.102:t<41?.07:.042)*(.74+random()*.45)*(k===2?.72:1);
     tap(at,80+random()*38,gain,pan,.041,.56);
     tap(at+.009,205+random()*45,gain*.39,pan,.028,.92);
   }
   t+=speed*(.96+.07*random());
 }
}
for(const t of [10.85,10.88,21.62,22.28,22.65,25.83,27.39,27.61,27.89,32.91,33.57]){
 tap(t,t<21?235:t>25?184:139,t===32.91?.24:.13,-.14,.056,.87);
 if(t>25)tap(t+.013,505,.048,.18,.052,.19);
}
rustle(16.32,.38,.23,-.05);tap(16.41,740,.054,-.06,.097);
rustle(29,.32,.08,.24);
function call(at,duration,low,pan,breakAt,gain){
  let phase=0,breath=0;
  layer(at,duration,pan,t=>{
    const u=t/duration;
    const contour=.77+.53*Math.sin(Math.PI*u)**.7-.17*u+.055*Math.sin(tau*(4.3+u*2.5)*t);
    phase+=tau*low*contour/rate;
    const envelope=Math.sin(Math.PI*u)**.7*(1-.91*Math.exp(-((u-breakAt)**2)/.00065));
    breath+=.18*(2*random()-1-breath);
    return gain*envelope*(.49*Math.sin(phase)+.23*Math.sin(phase*2)+.18*Math.sin(phase*3)+.12*Math.sin(phase*5)+.34*breath);
  });
}
call(36.32,1.63,590,-.37,.49,.19);call(37.59,1.8,304,.15,.78,.18);
call(51.74,1.20,490,-.28,.52,.15);
call(27.64,.48,158,.26,2,.108);
for(const t of [43.97,44.86,46.34,47.91,49.43,50.29]){tap(t,91,.064,.06,.048,.82);rustle(t,.29,.069,.17);}
chink(49.51,.08,.29);
for(const t of [51.42,51.53,51.84,52.04,53.95,54.1]){tap(t,550,.047,-.10,.045);tap(t+.018,303,.045,-.10,.04);}
rustle(53.31,.34,.095,.02);rustle(54.47,1.22,.10,-.2);
tap(49.94,83,.061,.12,.047,.72);rustle(50.28,.34,.078,.04);
// The wardrobe ankles settle on these frames in the admitted departure.
for (const frame of [1317,1325,1339,1352,1366,1380,1394,1407,1421,1435]) {
  const t=frame/24;
  tap(t,71+24*random(),.086*Math.exp(-(t-54.6)*.13),Math.min(.85,.22+.08*(t-55)),.04,.74);
}
for(const t of [56.64,57.09,57.81,59.05]) rustle(t,.77,.078,-.29);
function speech(name,at,gain,pan){
 const wav=readFileSync(join(voiceDir,name+".wav"));
 let j=12,fmt,data;
 while(j+8<=wav.length){
  const id=wav.toString("ascii",j,j+4),size=wav.readUInt32LE(j+4);
  if(id==="fmt ")fmt=wav.subarray(j+8,j+8+size);
  if(id==="data")data=wav.subarray(j+8,j+8+size);
  j+=8+size+(size%2);
 }
 if(!fmt||!data||fmt.readUInt16LE(14)!==16)throw Error("Expected PCM16 dialogue");
 const hz=fmt.readUInt32LE(4),channels=fmt.readUInt16LE(2),samples=Math.floor(data.length/2/channels);
 let first=0,last=samples-1;
 const value=i=>data.readInt16LE(2*i*channels)/32768;
 while(first<last&&Math.abs(value(first))<.003)first++;
 while(last>first&&Math.abs(value(last))<.003)last--;
 const seconds=(last-first+1)/hz;
 layer(at,seconds,pan,t=>{const x=first+t*hz,i=Math.floor(x),f=x-i;return gain*(value(i)*(1-f)+value(Math.min(i+1,last))*f);});
 process.stdout.write(name+" "+at.toFixed(3)+"–"+(at+seconds).toFixed(3)+" s\n");
}
speech("luc",3.09,.73,-.26);speech("remy",5.59,.73,.19);speech("clerk",7.57,.69,-.08);speech("road",12.72,.75,-.22);
speech("stop",51.00,.73,-.10);
let high=0;for(let i=0;i<length;i++)high=Math.max(high,Math.abs(left[i]),Math.abs(right[i]));
const scale=.85/Math.max(.65,high),out=Buffer.alloc(44+length*4);
out.write("RIFF",0);out.writeUInt32LE(out.length-8,4);out.write("WAVEfmt ",8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);
out.writeUInt32LE(rate,24);out.writeUInt32LE(rate*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write("data",36);out.writeUInt32LE(length*4,40);
for(let i=0;i<length;i++){out.writeInt16LE(Math.round(left[i]*scale*32767),44+i*4);out.writeInt16LE(Math.round(right[i]*scale*32767),46+i*4);}
writeFileSync(destination,out);
console.log("Stereo PCM16 48000 Hz; 60.000 s; peak "+(20*Math.log10(high*scale)).toFixed(2)+" dBFS.");
