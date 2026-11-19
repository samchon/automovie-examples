"""Mix the yard's wind, timber, rings, feet, leather, laughter and local speech."""
import sys
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile

work,out=map(Path,sys.argv[1:3])
sr=32000
mix=np.zeros((60*sr,2),dtype=np.float32)
rng=np.random.default_rng(1460)
def noise(length):
    return rng.normal(0,1,round(length*sr))
def put(start,x,amp=1,pan=0):
    idx=round(start*sr)
    x=np.asarray(x)[:max(0,len(mix)-idx)]*amp
    for c in range(2):
        mix[idx:idx+len(x),c]+=x*np.sqrt((1+pan*(2*c-1))*.5)
def filt(x,lo,hi):
    return signal.sosfilt(signal.butter(2,(lo,hi),fs=sr,btype='bandpass',output='sos'),x)
def env(t,decay):
    return np.minimum(1,t/.008)*np.exp(-t/decay)
def foot(t,amp,pan,wood=False):
    a=np.arange(int(sr*.30))/sr
    x=(np.sin(2*np.pi*(83 if wood else 55)*a)+.5*filt(noise(.30),220,1700))*env(a,.046)
    put(t,x,amp,pan)
def grit(t,amp,pan,n=.43):
    a=np.arange(round(sr*n))/sr
    put(t,filt(noise(n),400,3400)*np.sin(np.pi*a/n)**1.2,amp,pan)
def ring(t,f,amp):
    a=np.arange(sr)/sr
    wave=sum(np.sin(2*np.pi*f*m*a)*np.exp(-a/d)*w for m,d,w in [(1,.27,1),(1.64,.19,.45),(2.21,.16,.32),(3.47,.09,.21)])
    put(t,wave*np.minimum(1,a/.005),amp,.14)
def laugh(t,low,amp,pan):
    for i,d in enumerate([.13,.16,.15,.21]):
        a=np.arange(round(sr*d))/sr
        phase=2*np.pi*(low*(1.12*a-.6*a*a/d)+3*np.sin(a*12))
        breath=filt(noise(d),400,2100)
        x=np.sin(np.pi*a/d)**1.45*(.47*np.sin(phase)+.22*np.sin(2*phase)+.1*np.sin(3*phase)+.23*breath)
        put(t+i*.23,x,amp*(1-i*.13),pan)
wind=filt(noise(60),65,490)
span=np.arange(len(wind))/sr
put(0,wind*(.58+.3*np.sin(span*.27)+.12*np.sin(span*.81)),.105)
for t in (1.4,10.1,13.3,24.2,46.3,54.1):
    a=np.arange(int(sr*.19))/sr
    put(t,np.sin(2*np.pi*(1800*a+930*a*a))*(np.sin(np.pi*a/.19)**2),.015,-.72)
for i,(start,ratio,pan) in enumerate([(3.08,1.01,-.08),(7.1,.93,.22),(12.1,1.01,-.08),(37.10,.93,.19),(51.26,.93,.28)]):
    r,x=wavfile.read(work/f'line{i}.wav');x=x.astype(float)/32768
    if x.ndim==2:x=x.mean(axis=1)
    above=np.where(abs(x)>.003)[0]
    if len(above): x=x[max(0,above[0]-300):min(len(x),above[-1]+700)]
    # A distinct pitch, formant range and cadence for each speaker.
    x=signal.resample(x,int(len(x)*sr/r/ratio))
    x=filt(x,95 if i in (0,2) else 72,5600)
    # Hold the sparse dialogue forward while preserving room for the metal and bench.
    normalized=x/max(np.max(abs(x)),.01)
    voiced=np.tanh(normalized*2.4)*.87
    put(start,voiced,1,pan)
    put(start+.052,voiced,.045,-pan)
laugh(.31,159,.13,-.61)
for t in (15.46,16.1,16.46,19.3,20.04,20.66,21.32,22.2,23.05,26.8,27.36,28.2,28.78,29.25,30.15,31.1,32.50):
    foot(t,.095 if t<29 else .145,.16 if t>23 else -.17)
ring(16.65,641,.21);foot(16.99,.25,-.59,True);grit(17.09,.08,-.52)
for start, duration, gain, pan in [(18.25,.58,.065,-.10),(22.08,.74,.076,.10),(23.38,.58,.105,.0),(25.07,.61,.061,-.07),(29.77,.55,.081,.12),(39.9,.61,.067,-.15)]:
    breath_time=np.arange(round(sr*duration))/sr
    breath=filt(noise(duration),330,2300)*np.sin(np.pi*breath_time/duration)**1.75
    put(start,breath,gain,pan)
grit(23.34,.18,.0,.56);grit(26.62,.13,.09,.39);ring(26.22,491,.19)
foot(30.25,.18,.01);grit(30.26,.18,.01,.25);foot(32.50,.21,.39)
for t in (34.52,39.93,40.49,40.94,41.48,41.99,42.5,43.02,46.9,47.44,48.03,48.54,49.08,49.60,50.01,55.46,56.31,57.05,57.62):
    foot(t,.095,.25 if t>47 else -.13)
for t in (41.56,42.68):
    ring(t,412,.041);foot(t,.097,-.56,True)
for t in (43.39,44.58,45.22,46.68,47.27,55.58,56.28,58.52):grit(t,.044,-.21,.21)
laugh(57.37,128,.32,-.37);laugh(58.27,133,.29,-.40);laugh(59.21,120,.21,-.40)
foot(58.93,.19,-.42,True)
mix=np.tanh(mix*1.25)
wavfile.write(out,sr,np.int16(np.clip(mix,-1,1)*32766))
