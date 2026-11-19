"""Decode the complete delivered movie, measure its streams and extract exact-frame review sheets."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("ffmpeg")
parser.add_argument("movie")
parser.add_argument("out", type=Path)
parser.add_argument("--ffprobe")
parser.add_argument("--source", type=Path, help="Retained PNGs from the official render's frame sequence")
args = parser.parse_args()
ffmpeg, movie, out = args.ffmpeg, args.movie, args.out
out.mkdir(parents=True, exist_ok=True)
fps = 24
cuts = [0,10,21,22.6,24.5,28,31,32,34.2,37.8,38,44.5,48,50.5,52.5,56.5]
shots = [0.8,5.5,8.7,13.2,16.7,19.8,21.9,22.9,24.16,26.4,28.8,30.4,31.4,
         32.7,34.6,36.0,37.4,38.5,40.45,40.9,42.4,43.7,45.4,47.7,49.5,51.7,53.7,55.7,57.2,59.92]
contacts = [4.8,13.17,16.7,18.35,19.65,21.87,22.26,22.65,23.62,24.24,
            27.63,28.1,29.3,31.44,32.55,34.18,34.94,35.33,35.87,37.72,38.2,
            39.05,40.28,40.65,41.1,41.9,42.24,43.5,44.65,45.75,47.9,49.2,
            50.37,51.45,52.48,53.52,54.18,55.38,55.80,56.5,57.6,58.1]
cutframes = sorted(set(min(1439,max(0,int(np.ceil(s*fps))+d)) for s in cuts for d in range(-3,4)))
contactframes = sorted({round(s*fps)+d for s in contacts for d in range(-3,4)})
cadence = [round(sample*fps/5) for sample in range(300)]
source_files = {int(f.stem.split("_")[1]):f for f in args.source.glob("frame_*.png")} if args.source else {}
picframes = sorted(set(cadence) | {1439} | {round(s*fps) for s in shots} | set(cutframes) | set(contactframes) | set(source_files))
output = subprocess.run([ffmpeg,"-hide_banner","-threads","2","-filter_threads","2","-i",movie,"-map","0:a:0","-af","ebur128=peak=true",
                         "-f","null","-"],capture_output=True,check=True).stderr.decode(errors="replace")
(out/"stream-measurements.txt").write_text(output)
prefix = [ffmpeg,"-v","error","-threads","2","-filter_threads","2","-i",movie]
video_frames = duplicate_frames = 0
picture_means = []
previous = b""
frame_bytes = 160*90*3
with subprocess.Popen(prefix+["-map","0:v:0","-vf","scale=160:90","-pix_fmt","rgb24","-f","rawvideo","-"],stdout=subprocess.PIPE) as decoder:
    while frame := decoder.stdout.read(frame_bytes):
        if len(frame) != frame_bytes:
            raise ValueError("Truncated decoded video frame")
        video_frames += 1
        duplicate_frames += frame == previous
        picture_means.append(float(np.frombuffer(frame,dtype=np.uint8).mean()))
        previous = frame
    if decoder.wait():
        raise ValueError("Video decode failed")
if max(picframes) >= video_frames:
    raise ValueError("Unreachable planned frame")
selection="+".join("eq(n\\,%d)"%s for s in picframes)
subprocess.run(prefix+["-y","-vf","select="+selection+",scale=640:360","-fps_mode","passthrough","-threads","2",str(out/"frame-%03d.png")],check=True)
files={n:out/("frame-%03d.png"%(i+1)) for i,n in enumerate(picframes)}
def sheet(name, numbers, width=400, columns=3):
    img=Image.new("RGB",(width*columns,(width*9//16+24)*int(np.ceil(len(numbers)/columns))),"#25291f")
    draw=ImageDraw.Draw(img)
    for i,n in enumerate(numbers):
        x=(i%columns)*width;y=(i//columns)*(width*9//16+24)
        with Image.open(files[n]) as im:
            img.paste(im.resize((width,width*9//16),Image.Resampling.LANCZOS),(x,y))
        draw.text((x+5,y+width*9//16+4),f"{n/fps:05.2f} s   frame {n}",fill="white")
    img.save(out/name)
sheet("whole-film.jpg",[round(n*fps) for n in shots],320,4)
for i in range(12):
    numbers = cadence[25*i:25*(i+1)]
    if i == 11:
        numbers = numbers + [1439]
    sheet("chronology-%02d.jpg"%(i+1),numbers,300,5)
for i in range(0,len(cutframes),21):
    sheet("joins-%02d.jpg"%(i//21+1),cutframes[i:i+21],320,7)
for i in range(0,len(contactframes),28):
    sheet("contacts-%02d.jpg"%(i//28+1),contactframes[i:i+28],320,7)
sheet("shoe-and-eyeline.jpg",[round(s*fps) for s in shots if 21<=s<32],450,2)
sheet("choice-and-bread.jpg",[round(s*fps) for s in shots if 34<=s],450,3)
audio_samples = 0
audio_peak = 0.0
with subprocess.Popen(prefix+["-map","0:a:0","-ac","2","-ar","48000","-f","f32le","-"],stdout=subprocess.PIPE) as decoder:
    while block := decoder.stdout.read(48000*8):
        samples = np.frombuffer(block,dtype="<f4").reshape(-1,2)
        audio_samples += len(samples)
        audio_peak = max(audio_peak,float(np.max(np.abs(samples))))
    if decoder.wait():
        raise ValueError("Stereo audio decode failed")
report={"file":str(Path(movie).resolve()),"sha256":hashlib.file_digest(open(movie,"rb"),"sha256").hexdigest(),
        "bytes":Path(movie).stat().st_size,"videoFrames":video_frames,"fps":fps,"videoDurationSeconds":video_frames/fps,
        "streamDescriptions":[s.strip() for s in output.splitlines() if re.search(r"Stream #0:[01].*(Video|Audio):",s)],
        "decodedAudioStereoSamples":audio_samples,"decodedAudioSecondsIncludingCodecPadding":audio_samples/48000,
        "decodedAudioPeak":audio_peak,"integratedLoudnessLUFS":float(re.findall(r"I:\s*([-\d.]+) LUFS",output)[-1]),
        "decodedTruePeakDBFS":float(re.findall(r"Peak:\s*([-\d.]+) dBFS",output)[-1]),
        "pictureMeanRange":[min(picture_means),max(picture_means)],
        "duplicateAdjacentFrames":duplicate_frames,"cutFrames":cutframes,
        "contactFrames":contactframes,"fiveFpsFrames":cadence,"sampleFrames":picframes}
if args.ffprobe:
    probe = subprocess.check_output([args.ffprobe,"-v","error","-threads","2","-count_frames","-show_format","-show_streams","-of","json",movie])
    (out/"ffprobe.json").write_bytes(probe)
    report["probe"] = json.loads(probe)
if source_files:
    comparison = []
    for number, path in sorted(source_files.items()):
        with Image.open(path) as source, Image.open(files[number]) as decoded:
            if source.size != (1280,720):
                raise ValueError(f"Unexpected source raster in {path}")
            sized = np.asarray(source.convert("RGB").resize(decoded.size,Image.Resampling.LANCZOS),dtype=np.int16)
            delivered = np.asarray(decoded.convert("RGB"),dtype=np.int16)
            comparison.append({"frame":number,"meanAbsoluteRgbDelta":round(float(np.abs(sized-delivered).mean()),4)})
    report["sourceComparison"] = comparison
if video_frames != 1440 or audio_samples < 60*48000:
    raise ValueError(f"Expected a complete minute, decoded {video_frames} frames and {audio_samples} audio samples")
(out/"measurement.json").write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in {"probe","cutFrames","contactFrames","fiveFpsFrames","sampleFrames","sourceComparison"}},indent=2))
