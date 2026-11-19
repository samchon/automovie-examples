"""Render the road's outdoor stereo Foley and the five locally synthesized lines."""
import json
import math
import sys
from pathlib import Path
import wave
import numpy as np

root = Path(sys.argv[1])
sr = 48000
audio = np.zeros((sr * 60, 2), dtype=np.float32)
dialogue = np.zeros_like(audio)
rng = np.random.default_rng(1460)
receipts = []


def mix(at, signal, gain, pan=0, track=audio):
    start = round(at * sr)
    n = min(len(signal), len(audio) - start)
    if n <= 0:
        return
    gains = np.array([math.sqrt((1 - pan) / 2), math.sqrt((1 + pan) / 2)])
    track[start:start+n] += signal[:n, None] * (gain * gains)


def rustle(at, duration, gain, pan, weight=14, decay=3.4):
    n = round(sr * duration)
    t = np.arange(n) / n
    white = rng.normal(0, 1, n)
    softened = np.convolve(white, np.ones(weight) / math.sqrt(weight), "same")
    sample = softened * np.minimum(t * 38, 1) * np.exp(-decay * t) * np.minimum(1, (1-t)*30)
    mix(at, sample, gain, pan)


def strike(at, tones, duration, gain, pan):
    t = np.arange(round(duration * sr)) / sr
    sound = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * speed) * level for f, speed, level in tones)
    mix(at, sound * np.minimum(1, t * 900) * np.minimum(1, (duration-t)*30), gain, pan)


def step(at, pan, gain, loose=False):
    strike(at, [(78,36,1),(143,47,0.40)], 0.16, gain, pan)
    rustle(at+0.008, 0.11, gain * 0.37, pan)
    if loose:
        strike(at+0.11, [(620,72,0.42),(1170,81,0.29)], 0.12, gain*0.93, pan)
        rustle(at+0.113, 0.060, gain*0.42, pan, 3, 5.6)


def breath(at, duration, gain, pan, voiced=0):
    n = round(sr * duration)
    t = np.arange(n) / sr
    envelope = np.sin(np.pi * t / duration)**1.5
    air = rng.normal(0, 1, n)
    resonant = np.convolve(air, np.ones(37) / math.sqrt(37), "same")
    throat = np.sin(2*np.pi*(105*t-18*t*t)) + 0.24*np.sin(2*np.pi*211*t)
    mix(at, (0.29*resonant + voiced*throat)*envelope, gain, pan)


# Continuous alpine air with soft stereo variation, no score.
for side in range(2):
    start = rng.normal(0, 1, 60 * 180 + 2)
    airy = np.interp(np.arange(sr*60)/sr*180, np.arange(len(start)), start)
    shape = 0.65 + 0.2 * np.sin(np.arange(sr*60)/sr * 0.23 + side)
    audio[:,side] = airy * shape * 0.012
for at in (1.4, 5.7, 8.2, 18.1, 28.45, 47.2, 54.9, 58.1):
    for j in range(2):
        t = np.arange(int(sr*0.17))/sr
        bird = np.sin(2*np.pi*(1960*t+850*t*t))*np.sin(np.pi*t/0.17)**2
        mix(at+j*0.27, bird, 0.009, -0.58)
for at in np.arange(0.08, 27.45, 0.57):
    step(at, -0.3 + min(0.66,at*0.023), 0.055)
for at in [8.6,9.67,14.8,16.0,17.84,19.2,20.55,21.86,24.20]:
    step(at, 0.28, 0.11, True)
for n,at in enumerate([49.98,50.56,51.17,51.80,52.41,53.08]):
    step(at, -0.03-n*0.09, 0.115-n*0.010, True)
for at in (0.53,0.76):
    rustle(at,0.34,0.095,-0.24,4)
strike(13.17,[(132,8,1),(291,11,0.58),(548,16,0.34),(882,25,0.15)],0.68,0.28,-0.13)
breath(13.48,0.42,0.11,-0.08,0.33)
strike(21.87,[(880,13,0.78),(1440,17,0.59),(2350,23,0.38)],0.46,0.19,0.21)
for at in [26.14,26.55,26.89,27.25,27.69,27.97,28.31]:
    strike(at,[(710+30*at,70,1)],0.10,0.045,0.28)
for at in [27.84,28.63,29.49,30.39,31.23]:
    breath(at,0.45,0.067,-0.08,0.13)
for at in [28.38,29.11,29.95,30.76,31.57]:
    breath(at,0.34,0.044,-0.48,0.1)
strike(30.35,[(201,16,1),(410,18,0.28)],0.33,0.073,-0.40)
rustle(34.18,0.62,0.16,0.03,3,3.0)
for i,at in enumerate([34.94,35.33,35.87]):
    step(at,-0.16+0.18*i,0.089)
rustle(39.17,1.56,0.092,0.22,7,1.8)
strike(40.28,[(511,46,0.5),(745,52,0.37)],0.14,0.083,0.19)
rustle(40.79,0.36,0.14,-0.20,75)
breath(41.27,0.46,0.061,0.16,0.57)
strike(42.24,[(95,13,0.56),(152,19,0.29)],0.44,0.15,-0.12)
step(42.49,0.05,0.12)
breath(43.12,0.56,0.085,-0.02,0.20)
breath(44.57,0.49,0.17,0.16,0.58)
rustle(44.65,0.43,0.14,0.24,34)
rustle(45.12,0.67,0.089,-0.24,20)
rustle(46.3,0.51,0.067,-0.25)
strike(55.11,[(202,14,0.74),(430,39,0.2)],0.16,0.055,-0.23)
rustle(53.53,0.25,0.18,0.16,3,5.1)
strike(53.54,[(740,42,0.4),(1140,49,0.22)],0.14,0.19,0.16)
for i in range(4):
    for at in np.arange(57.66 + 0.13*i,59.87,0.62):
        step(at,0.28-0.19*i,0.074-0.006*i)

for name,at,volume,pan in [
    ("woman",0.98,0.46,-0.38),("alix",3.04,0.54,-0.12),
    ("perrin",6.15,0.52,-0.23),("caller",10.14,0.55,-0.39),
    ("here",14.79,0.51,-0.07)]:
    with wave.open(str(root/(name+".wav")),"rb") as w:
        native=w.getframerate()
        raw=np.frombuffer(w.readframes(w.getnframes()),dtype="<i2").astype(float)/32768
    active=np.flatnonzero(abs(raw)>0.0008)
    if not len(active):
        raise ValueError("Silent local voice take "+name)
    raw=raw[max(0,active[0]-int(0.012*native)):active[-1]+int(0.032*native)]
    step_size=native/sr
    samples=np.interp(np.arange(0,len(raw),step_size),np.arange(len(raw)),raw)
    peak=np.abs(samples).max()
    speech = samples/peak
    mix(at,speech,volume,pan,dialogue)
    start = round(at*sr)
    bed = audio[start:start+len(samples)]
    receipts.append(dict(line=name,startSeconds=at,durationSeconds=round(len(samples)/sr,4),
                         dialogueToBedDb=round(float(10*np.log10(np.mean(dialogue[start:start+len(samples)]**2)
                                                               /np.mean(bed**2))),2)))

fade = np.minimum(1,np.arange(len(audio))/1200)*np.minimum(1,np.arange(len(audio))[::-1]/6200)
scale = 0.88/np.abs(audio+dialogue).max()
for track in (audio, dialogue):
    track *= fade[:,None]*scale
for name,track in [("road-stereo",audio+dialogue),("dialogue",dialogue),("effects",audio)]:
    with wave.open(str(root/(name+".wav")),"wb") as out:
        out.setnchannels(2);out.setsampwidth(2);out.setframerate(sr)
        out.writeframes((np.clip(track,-1,1)*32767).astype("<i2").tobytes())
(root/"voice-times.json").write_text(json.dumps(receipts,indent=2))
