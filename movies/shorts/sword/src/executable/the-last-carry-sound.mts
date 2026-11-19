// On Windows run with Node 22.23+. Pass --ensemble to use the stock Piper cast.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const hz = 48000;
const frames = hz * 60;
const destination = fileURLToPath(new URL("../../media/automovie/the-last-carry/audios/", import.meta.url));
const ensemble = process.argv.includes("--ensemble");
const mix = [new Float32Array(frames), new Float32Array(frames)];
const cues: { label: string; start: number; end: number; peakDbfs: number; text?: string }[] = [];
let seed = 0x116067;

/** Stable signed noise for the track's wind, cloth and granular footfalls. */
function noise(): number {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
}

/** Produce a mono cue on the master clock. */
function synth(seconds: number, sample: (t: number) => number): Float32Array {
  return Float32Array.from({ length: Math.round(seconds * hz) }, (_, i) => sample(i / hz));
}

/** One-pole smoothing coefficient for acoustic shading. */
function pole(cutoff: number): number {
  return 1 - Math.exp(-2 * Math.PI * cutoff / hz);
}

/** Relative sample peak on the floating-point scale. */
function peak(samples: Float32Array): number {
  let limit = 0;
  for (const value of samples) limit = Math.max(limit, Math.abs(value));
  return limit;
}

/** Short attack and release protect isolated takes and procedural tails. */
function edge(t: number, duration: number, attack: number, release: number): number {
  return Math.max(0, Math.min(1, t / attack, (duration - t) / release));
}

/** Each cue has an independent level, equal-power stereo position and receipt. */
function place(label: string, start: number, mono: Float32Array, level: number, pan: number, text?: string): void {
  const offset = Math.round(start * hz);
  if (!mono.length || offset < 0 || offset + mono.length > frames) throw Error("Invalid cue: " + label);
  const gain = level / peak(mono);
  if (!Number.isFinite(gain)) throw Error("Silent cue: " + label);
  const gains = [Math.cos((pan + 1) * Math.PI / 4), Math.sin((pan + 1) * Math.PI / 4)];
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < mono.length; i++) mix[ch][offset + i] += mono[i] * gain * gains[ch];
  }
  cues.push({ label, start: offset / hz, end: (offset + mono.length) / hz, peakDbfs: 20 * Math.log10(level * Math.max(...gains)), text });
}

const voices = {
  gate: ["Lord, have mercy.", -1, 5],
  fileDeep: ["Lord, have mercy.", -1, -15],
  fileHigh: ["Lord, have mercy.", 0, 8],
  fileMiddle: ["Lord, have mercy.", -2, -5],
  promise: ["We'll carry Uncle all the way, Aunt.", -1, -15],
  both: ["Both of us.", -1, -5],
  purse: ["My father's purse. Uncle owed him a winter's pay.", -1, -5],
  paid: ["Uncle paid me. Ask him yourself.", 0, -15],
  wait: ["Wait till I've got him.", -1, -7],
  syllable: ["Mercy.", -2, -4],
} satisfies Record<string, [string, number, number]>;
type Take = keyof typeof voices;

const presets = {
  promise: "p226", paid: "p226", both: "p227", purse: "p227", wait: "p225",
  gate: "p228", fileDeep: "p232", fileMiddle: "p233", fileHigh: "p229", syllable: "p233",
} satisfies Record<Take, string>;
const modelSha256 = "4e9fc85ab9009385319fc6bae7f55577f8a2d7ee77fd9159a5500eb6531f41e6";

/** Render each fictional role with its stock VCTK preset, using the installed offline model. */
function speakEnsemble(): Record<Take, Buffer> {
  const stock = process.env.CARRY_STOCK_VOICES || fileURLToPath(new URL("../../../../../.cache/film-release-0.3.0/stock-voices/", import.meta.url));
  const model = join(stock, "en_GB-vctk-medium.onnx");
  if (createHash("sha256").update(readFileSync(model)).digest("hex") !== modelSha256) throw Error("Unexpected VCTK model");
  const config = JSON.parse(readFileSync(model + ".json", "utf8"));
  const cache = fileURLToPath(new URL("../../.cache/the-last-carry/sound/piper-takes/",import.meta.url));
  mkdirSync(cache,{recursive:true});
  const keys = Object.keys(presets) as Take[];
  const requests = keys.map(key => ({
    text: voices[key][0], speaker_id: config.speaker_id_map[presets[key]], output_file: join(cache,key+".wav"),
  }));
  const exe = join(stock,"piper","piper.exe");
  const result = spawnSync(exe,["--model",model,"--json-input","--noise_scale","0","--noise_w","0","--sentence_silence","0.13","--espeak_data",join(stock,"piper","espeak-ng-data")],{
    input: requests.map(request=>JSON.stringify(request)).join("\n")+"\n",encoding:"utf8",windowsHide:true,
  });
  if (result.status !== 0) throw Error(result.stderr || result.error?.message || "Piper synthesis failed");
  return Object.fromEntries(keys.map((key,i)=>[key,readFileSync(requests[i].output_file)])) as Record<Take,Buffer>;
}

/** Render speech entirely in memory, once per take, through desktop SAPI. */
function speak(): Record<Take, Buffer> {
  const script = [
    "$ErrorActionPreference = 'Stop'",
    "Add-Type -AssemblyName System.Speech",
    "$speaker = [System.Speech.Synthesis.SpeechSynthesizer]::new()",
    "$speaker.SelectVoice('Microsoft Zira Desktop')",
    "$takes = [Console]::In.ReadToEnd() | ConvertFrom-Json",
    "$result = @{}",
    "foreach ($take in $takes.PSObject.Properties) {",
    "  $line, $rate, $pitch = $take.Value",
    "  $speaker.Rate = $rate",
    "  $wave = [IO.MemoryStream]::new()",
    "  $speaker.SetOutputToWaveStream($wave)",
    "  $xml = '<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" xml:lang=\"en-US\"><prosody pitch=\"' + $pitch + '%\">' + [Security.SecurityElement]::Escape($line) + '</prosody></speak>'",
    "  $speaker.SpeakSsml($xml)",
    "  $speaker.SetOutputToNull()",
    "  $result[$take.Name] = [Convert]::ToBase64String($wave.ToArray())",
    "  $wave.Dispose()",
    "}",
    "$speaker.Dispose()",
    "[Console]::Write(($result | ConvertTo-Json -Compress))",
  ].join("\n");
  const ps = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")], {
    input: JSON.stringify(voices), encoding: "utf8", maxBuffer: 16 * 1024 * 1024, windowsHide: true,
  });
  if (ps.status !== 0) throw Error(ps.stderr || ps.error?.message || "Speech synthesis failed");
  const data = JSON.parse(ps.stdout);
  return Object.fromEntries(Object.keys(voices).map(key => [key, Buffer.from(data[key], "base64")])) as Record<Take, Buffer>;
}

/** Decode mono PCM, preserving unvoiced consonants while trimming SAPI's padding. */
function readSpeech(bytes: Buffer): { samples: Float32Array; rate: number } {
  let rate = 0;
  for (let at = 12; at + 8 <= bytes.length;) {
    const name = bytes.toString("ascii", at, at + 4);
    const size = bytes.readUInt32LE(at + 4);
    const body = at + 8;
    if (name === "fmt ") {
      if (bytes.readUInt16LE(body) !== 1 || bytes.readUInt16LE(body + 2) !== 1 || bytes.readUInt16LE(body + 14) !== 16) throw Error("Expected mono PCM16 speech");
      rate = bytes.readUInt32LE(body + 4);
    }
    if (name === "data" && rate > 0) {
      const data = Float32Array.from({ length: size / 2 }, (_, i) => bytes.readInt16LE(body + i * 2) / 32768);
      const threshold = Math.max(.0008, peak(data) * .004);
      const first = data.findIndex(value => Math.abs(value) > threshold);
      const last = data.findLastIndex(value => Math.abs(value) > threshold);
      if (first < 0 || last <= first) throw Error("No speech in synthesizer output");
      return { samples: data.slice(Math.max(0, first - rate * .022), last + rate * .05), rate };
    }
    at = body + size + (size % 2);
  }
  throw Error("Invalid speech file");
}

const takes = ensemble ? speakEnsemble() : speak();

/** Register, perspective and phrasing are fixed separately for each performance. */
function line(key: Take, label: string, start: number, window: number, speed: number, level: number, pan: number, cutoff: number, fragment = false): void {
  const raw = readSpeech(takes[key]);
  let samples = raw.samples;
  if (key === "syllable") samples = samples.slice(Math.floor(samples.length * .51));
  const step = Math.max(raw.rate * (ensemble ? 1 : speed) / hz, fragment ? 0 : samples.length / (window * hz));
  const duration = Math.min(window, (samples.length - 1) / (step * hz));
  const coefficient = pole(cutoff);
  let low = 0;
  const audio = synth(duration, t => {
    const p = Math.min(samples.length - 2, t * hz * step);
    const i = Math.floor(p);
    const value = samples[i] + (samples[i + 1] - samples[i]) * (p - i);
    low += coefficient * (value - low);
    return low * edge(t, duration, .008, fragment ? .18 : .025);
  });
  // Keep one voice at the front of each group so consonants survive the staggered entrances.
  const chorusBalance = ensemble && key.startsWith("file") ? (key === "fileDeep" ? 1.35 : .71) : 1;
  place(label, start, audio, level * chorusBalance, pan, key === "syllable" ? "…cy." : fragment ? "Lord, have…" : voices[key][0]);
}

line("gate", "Gate woman, opening call", .70, 1.50, 1.02, .27, .38, 3850);
line("fileDeep", "Moving response, low voice", 2.20, 1.82, .81, .17, -.34, 3250);
line("fileHigh", "Moving response, upper voice", 2.29, 1.78, .98, .13, .23, 3800);
line("fileMiddle", "Moving response, middle voice", 2.39, 1.78, .93, .11, -.02, 3000);
line("promise", "Denis, promise", 5.20, 3.42, .82, .46, -.16, 7000);
line("both", "Colin, promise", 9.05, 1.60, .89, .46, .20, 7600);
line("purse", "Colin, purse", 13.55, 3.84, .89, .47, .17, 7500);
line("paid", "Denis, reply", 17.65, 3.12, .82, .47, -.12, 7100);
line("fileDeep", "Petition falters, low voice", 24.70, 1.09, .84, .13, -.17, 2700, true);
line("fileHigh", "Petition falters, upper voice", 24.83, .89, .99, .09, .02, 2850, true);
line("wait", "Widow, handover", 27.05, 2.16, .95, .48, -.18, 7900);
line("gate", "Gate woman, second call", 38.90, 1.61, .99, .24, .39, 3550);
line("fileMiddle", "Departing response, middle voice", 40.85, 1.85, .92, .16, .15, 2600);
line("fileDeep", "Departing response, low voice", 40.96, 1.84, .81, .13, .08, 2360);
line("fileHigh", "Departing response, upper voice", 41.07, 1.71, .99, .095, .32, 2400);
line("syllable", "Last syllable beyond gate", 45.40, .82, .90, .073, .38, 1820);

/** Filtered noise has its own changing spectral envelope for each physical surface. */
function friction(seconds: number, bottom: number, top: number, attack: number, release: number, flutter: number): Float32Array {
  let low = 0, high = 0;
  const bottomPole = pole(bottom), topPole = pole(top);
  return synth(seconds, t => {
    high += topPole * (noise() - high);
    low += bottomPole * (high - low);
    return (high - low) * edge(t, seconds, attack, release) * (.78 + .16 * Math.sin(2 * Math.PI * flutter * t) + .06 * Math.cos(55 * t));
  });
}

for (const pan of [-.83, .78]) {
  let air = 0, bass = 0;
  const c1 = pole(850), c2 = pole(110);
  place("Valley air", 0, synth(57.30, t => {
    air += c1 * (noise() - air);
    bass += c2 * (air - bass);
    const gust = .58 + .19 * Math.sin(.61 * t + pan) + .23 * Math.sin(.24 * t - pan);
    return (air - bass) * gust * edge(t, 57.30, 1.12, 10.1);
  }), .038, pan);
}

for (const [start, duration, level, pan] of [
  [.15,.68,.11,-.28], [3.79,.58,.14,-.28], [4.47,.39,.10,-.18], [8.65,.30,.075,-.14],
  [10.91,.79,.13,-.16], [12.54,.34,.065,-.13], [13.05,.45,.14,-.10], [16.91,.29,.071,.07],
  [21.55,.62,.14,.18], [25.85,.68,.16,-.26], [29.36,.73,.13,-.18], [33.81,.65,.09,.02],
  [36.74,.42,.13,-.04], [37.30,.36,.17,-.1], [42.19,.40,.08,.18], [55.91,.33,.08,-.22],
  [56.45,.21,.095,-.05],
]) place("Linen or coat movement", start, friction(duration, 860, 4900, .09, .15, 11), level, pan);

/** Dirt under a heel and the following fine grit have separate decay times. */
function foot(start: number, level: number, pan: number): void {
  const pitch = 54 + 15 * (1 + noise());
  let dirt = 0;
  const c = pole(1400);
  const step = synth(.31, t => {
    dirt += c * (noise() - dirt);
    const heel = Math.sin(2 * Math.PI * (pitch * t + .51 * (1 - Math.exp(-30*t)))) * Math.exp(-21*t);
    const grit = (dirt + .18 * noise()) * (.50 * Math.exp(-44*t) + .34 * Math.exp(-((t-.077)**2)/.00084));
    return (heel * .43 + grit) * edge(t,.31,.007,.045);
  });
  place("Footfall in lane", start, step, level, pan);
}

for (const [start, stop, spacing, base, pan] of [
  [.14,25.36,.88,.16,-.34],[.52,25.02,.91,.115,.29],[.86,25.15,1.03,.077,.04],
  [32.4,48.03,.93,.14,-.08],[32.80,48.11,.96,.115,.32],
]) {
  for (let at = start; at < stop; at += spacing + .046 * noise()) {
    const recede = start > 30 ? Math.exp(-.12 * (at-start)) : 1;
    foot(at, base * recede * (.91 + .085 * noise()), pan + .08 * noise());
  }
}
foot(36.38,.26,-.17);
foot(36.60,.21,.08);
place("Rut, loose grit",36.42,friction(.39,380,2600,.022,.22,16),.20,-.13);

/** Short inharmonic resonances distinguish the bier, the gate and the oversized theatrical metal. */
function resonator(seconds: number, frequencies: number[], rates: number[], weights: number[]): Float32Array {
  return synth(seconds, t => {
    let sound = 0;
    for (let i = 0; i < frequencies.length; i++) sound += Math.sin(2 * Math.PI * frequencies[i] * t) * weights[i] * Math.exp(-rates[i]*t);
    return (sound + noise() * .34 * Math.exp(-130*t)) * edge(t,seconds,.0025,.045);
  });
}
for (const [at, level, pan] of [[11.72,.09,-.12],[22.02,.21,.22],[25.63,.23,-.27],[29.98,.23,-.17],[34.20,.17,.10]]) {
  place("Bier pole settles",at,resonator(.45,[108,217,443,690],[11,19,28,41],[.70,.51,.24,.10]),level,pan);
}
for (const [at, duration, level, pan] of [[24.96,.72,.28,.22],[31.30,.49,.23,-.24]]) {
  place("Theatrical metal scrape",at,friction(duration,1700,7400,.095,.23,31),level,pan);
}
for (const [at, tuning, level, pan] of [[32.10,.93,.79,-.24],[32.72,1.21,.48,.16],[33.42,1.03,.42,-.06],[42.92,1.14,.74,.20],[43.71,.86,.61,-.24],[44.43,1.27,.48,.08]]) {
  place("Theatrical metal resonance",at,resonator(1.17,[476,857,1436,2293,3479,4837].map(v=>v*tuning),[5,4.7,6,8,9,16],[.44,.46,.32,.41,.26,.13]),level,pan);
}
place("Purse fittings",37.74,resonator(.24,[521,949,1630],[24,28,35],[.35,.67,.32]),.11,.09);
place("Gate hinge",51.80,synth(1.51,t=>{
  const turns = 135*t + .53*Math.sin(8*t) + .37*Math.sin(17*t);
  return (Math.sin(2*Math.PI*turns)+.31*Math.sin(6*Math.PI*turns)+.21*noise())*edge(t,1.51,.32,.36)*(.79+.21*Math.sin(15*t));
}),.19,.31);
place("Gate settles",53.32,resonator(.68,[69,136,264,672],[7,10,19,29],[.81,.62,.23,.22]),.48,.30);
place("Latch",53.44,resonator(.27,[612,1031,2410],[19,26,44],[.58,.43,.19]),.27,.26);
place("Splinter lifts from weave",56.69,resonator(.12,[410,930,1560],[40,60,80],[.51,.59,.32]),.12,-.09);
for (const [start, duration, level] of [[47.77,.91,.11],[49.32,1.05,.16],[50.83,.62,.095],[54.38,.96,.12],[57.16,1.12,.18]]) {
  place("Colin breathes",start,friction(duration,410,2560,duration*.34,duration*.48,3.4),level,.12);
}

/** Report exactly the stereo PCM written to disk, including its final run of digital silence. */
const trim = .86 / Math.max(peak(mix[0]), peak(mix[1]));
const output = Buffer.alloc(44 + frames * 4);
output.write("RIFF"); output.writeUInt32LE(output.length-8,4); output.write("WAVEfmt ",8);
output.writeUInt32LE(16,16); output.writeUInt16LE(1,20); output.writeUInt16LE(2,22);
output.writeUInt32LE(hz,24); output.writeUInt32LE(hz*4,28); output.writeUInt16LE(4,32);
output.writeUInt16LE(16,34); output.write("data",36); output.writeUInt32LE(frames*4,40);
let lastSound = 0;
const peaks = [0,0];
for (let i=0;i<frames;i++) {
  for (let ch=0;ch<2;ch++) {
    const pcm = Math.round(mix[ch][i] * trim * 32767);
    peaks[ch] = Math.max(peaks[ch],Math.abs(pcm));
    if (pcm !== 0) lastSound = i+1;
    output.writeInt16LE(pcm,44+4*i+2*ch);
  }
}
const round = (value: number) => Number(value.toFixed(4));
const report = {
  sampleRate:hz, channels:2, frames, seconds:frames/hz,
  peakDbfs:peaks.map(v=>round(20*Math.log10(v/32768))),
  finalSilenceStart:lastSound/hz, voice:ensemble ? "Piper en_GB-vctk-medium" : "Microsoft Zira Desktop, en-US",
  ...(ensemble ? { presets, modelSha256,
    modelSource:"https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium",
    modelRepositoryLicense:"MIT (piper-voices repository metadata)",
    corpus:"Yamagishi, Junichi; Veaux, Christophe; MacDonald, Kirsten (2019). CSTR VCTK Corpus v0.92, University of Edinburgh.",
    corpusSource:"https://doi.org/10.7488/ds/2645", corpusLicense:"https://creativecommons.org/licenses/by/4.0/",
    processing:"Stock multi-speaker synthesis, followed by time fit, gain, stereo position and acoustic shading."
  } : {}),
  cuePeakMeasurement:"Isolated cue at its highest channel, including master gain; simultaneous cues sum in the stereo master.",
  cues:cues.sort((a,b)=>a.start-b.start).map(cue=>({...cue,start:round(cue.start),end:round(cue.end),peakDbfs:round(cue.peakDbfs+20*Math.log10(trim))})),
};
mkdirSync(destination,{recursive:true});
writeFileSync(join(destination,ensemble ? "the-last-carry-ensemble.wav" : "the-last-carry.wav"),output);
writeFileSync(join(destination,ensemble ? "ensemble-cues.json" : "cues.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({...report,cues:report.cues.filter(cue=>cue.text)},null,2));
