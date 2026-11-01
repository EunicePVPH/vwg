#!/usr/bin/env python3
"""ProVirtual PH Reel 08 - original synthesized score + SFX + (synthetic) voiceover.
usage: audio.py <events.json> <outdir>
Writes: mix_vo.wav (music+sfx+voiceover), mix_novo.wav (music+sfx only)
"""
import json, sys, os, subprocess, wave
import numpy as np
from scipy import signal

SR = 44100
DUR = 25.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
ev = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)

def zeros(): return np.zeros((2, N), dtype=np.float64)
def tt(d): return np.arange(int(d * SR)) / SR

def place(bus, sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < -len(sig): return
    s = sig
    if i < 0: s = sig[-i:]; i = 0
    n = min(len(s), N - i)
    gl = g * np.cos((pan + 1) * np.pi / 4); gr = g * np.sin((pan + 1) * np.pi / 4)
    bus[0, i:i+n] += s[:n] * gl * 1.414; bus[1, i:i+n] += s[:n] * gr * 1.414

def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return signal.sosfilt(signal.butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def adsr(n, a, d, s, r):
    e = np.ones(n); na = max(1, int(a*SR)); nd = int(d*SR); nr = max(1, int(r*SR))
    e[:na] = np.linspace(0, 1, na)
    if nd > 0 and na + nd < n: e[na:na+nd] = np.linspace(1, s, nd); e[na+nd:] = s
    e[-nr:] *= np.linspace(1, 0, nr)
    return e
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

# ------------------------------------------------------------ instruments
def pluck(f, d=.35, bright=1.0):
    t = tt(d); x = np.zeros_like(t)
    for k in range(1, 9):
        x += np.sin(2*np.pi*f*k*t) / k * np.exp(-t * (6 + 5*k) / bright)
    x *= np.exp(-t * 4)
    return x * 0.8
def bass(f, d=.25):
    t = tt(d); x = signal.sawtooth(2*np.pi*f*t) * .6 + np.sin(2*np.pi*f*t)
    x = lp(x, 520) * adsr(len(t), .004, .08, .6, .06)
    return x * 0.7
def pad(freqs, d):
    t = tt(d); x = np.zeros_like(t)
    for f in freqs:
        for dt in (-.07, 0, .06):
            x += signal.sawtooth(2*np.pi*f*(1+dt*.01)*t + rng.random()*6)
    x = lp(x / (len(freqs)*3), 1500)
    return x * adsr(len(t), .6, 0, 1, .8)
def kick(g=1.0):
    t = tt(.42); f = 45 + 95*np.exp(-t*28)
    ph = 2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph) * np.exp(-t*9) + .25*hp(noise(.42), 2500) * np.exp(-t*90)) * g
def hat(d=.05, g=1.0):
    return hp(noise(d), 7000) * np.exp(-tt(d)*(60 if d < .1 else 14)) * g
def clap(g=1.0):
    n = bp(noise(.22), 900, 3500)
    t = tt(.22); e = np.exp(-t*28)
    for k in (.012, .024): e += .7*np.exp(-np.clip(t-k, 0, None)*28) * (t > k)
    return n * e * g
def snare(g=1.0):
    t = tt(.2); return (bp(noise(.2), 1500, 7000)*np.exp(-t*24) + .5*np.sin(2*np.pi*190*t)*np.exp(-t*30)) * g
def cymbal(d=1.6, g=1.0):
    return hp(noise(d), 5000) * np.exp(-tt(d)*3.2) * g
def swell(d, f0, f1, g=1.0, up=True):
    n = noise(d); chunks = 24; L = len(n); y = np.zeros(L)
    for c in range(chunks):
        a, b = c*L//chunks, (c+1)*L//chunks
        fc = f0 * (f1/f0) ** (c/(chunks-1))
        seg = bp(n[max(0, a-400):b], max(60, fc*.6), min(SR/2-100, fc*1.4))[-(b-a):]
        y[a:b] = seg
    e = (np.linspace(0, 1, L) ** 2) if up else np.exp(-tt(d)*4)
    return y * e * g
def bell(freqs, d, g=1.0, dec=7):
    t = tt(d); x = np.zeros_like(t)
    for i, f in enumerate(freqs): x += np.sin(2*np.pi*f*t) * np.exp(-t*dec*(1+.35*i)) / (1+.5*i)
    return x * g

# ------------------------------------------------------------ SFX
def sfx(name, g):
    if name == 'tick': t = tt(.03); return np.sin(2*np.pi*2300*t) * np.exp(-t*160) * .5
    if name == 'ping':
        f = rng.choice([1318.5, 1568.0, 1760.0]); return bell([f, f*1.5, f*2.01], .5, .55, 9)
    if name == 'pop': t = tt(.09); return np.sin(2*np.pi*(380+900*t*5)*t) * np.exp(-t*45) * .6
    if name == 'thock': t = tt(.12); return np.sin(2*np.pi*170*t)*np.exp(-t*40) + .3*hp(noise(.12), 1500)*np.exp(-t*120)
    if name == 'whoosh': return swell(.6, 400, 5500, .9) * np.hanning(int(.6*SR)) ** .5
    if name == 'hit':
        t = tt(.7); f = 38 + 90*np.exp(-t*12); b = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*5.5)
        return b * .9 + lp(noise(.7), 1800) * np.exp(-t*20) * .5
    if name == 'boom':
        t = tt(1.8); f = 30 + 80*np.exp(-t*8); b = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*2.4)
        return b + lp(noise(1.8), 900)*np.exp(-t*7)*.5 + .3*cymbal(1.8, 1)
    if name == 'riser': return swell(.5, 500, 9000, .9) + np.sin(2*np.pi*np.cumsum(np.linspace(300, 1800, int(.5*SR)))/SR) * np.linspace(0, .4, int(.5*SR))**2
    if name == 'freeze':
        t = tt(.7); f = 1500*np.exp(-t*4.2) + 45
        s = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*3.5)*.7
        k = np.sin(2*np.pi*np.cumsum(38+80*np.exp(-t*14))/SR)*np.exp(-t*6)
        return s + k
    if name == 'snap': return hp(noise(.025), 3500)*np.exp(-tt(.025)*180)*.8 + np.sin(2*np.pi*950*tt(.025))*np.exp(-tt(.025)*150)*.4
    if name == 'check': a = bell([1568], .12, .8, 28); b = bell([2093], .18, .8, 22); r = np.zeros(int(.3*SR)); r[:len(a)] += a; r[int(.06*SR):int(.06*SR)+len(b)] += b; return r*.7
    if name == 'click': t = tt(.02); return bp(noise(.02), 1500, 4500)*np.exp(-t*220)*.9 + np.sin(2*np.pi*620*t)*np.exp(-t*200)*.4
    if name == 'grab': t = tt(.04); return np.sin(2*np.pi*430*t)*np.exp(-t*90)*.6 + bp(noise(.04), 900, 3000)*np.exp(-t*100)*.5
    if name == 'drop': t = tt(.07); return np.sin(2*np.pi*(260-800*t)*t)*np.exp(-t*50)*.7 + bp(noise(.07), 500, 2500)*np.exp(-t*60)*.4
    if name == 'ding': return bell([1568, 2349, 3136], .55, .5, 8)
    if name == 'type': t = tt(.012); return bp(noise(.012), 2500, 6000)*np.exp(-t*300)*(.5+rng.random()*.5)
    if name == 'toggle':
        a = sfx('click', 1); r = np.zeros(int(.12*SR)); r[:len(a)] += a
        t = tt(.05); b = np.sin(2*np.pi*1050*t)*np.exp(-t*80)*.6; o = int(.045*SR); r[o:o+len(b)] += b; return r
    if name == 'chime': return bell([1046.5, 1318.5, 1568, 2093], 1.6, .6, 2.6)
    if name == 'shimmer':
        d = 1.4; x = swell(d, 3000, 9000, .6, up=False) * np.hanning(int(d*SR))
        return x + bell([2093, 3136, 4186], d, .3, 2.2)
    if name == 'sparkle':
        d = 1.5; r = np.zeros(int(d*SR))
        for i, f in enumerate([1568, 2093, 2637, 3136, 3951, 4186, 5274, 6272]):
            b = bell([f], .6, .5, 6); o = int(i*.07*SR); r[o:o+len(b)] += b[:len(r)-o]
        return r
    return np.zeros(10)

# ------------------------------------------------------------ music
music = zeros()
def chord_notes(t):
    # returns (root_midi, chord midi list)
    if t < 8:
        bar = int(t // 2) % 4
        return [(45, [57, 60, 64]), (41, [53, 57, 60]), (45, [57, 60, 64]), (40, [52, 56, 59])][bar]
    if t < 12:
        return [(36, [60, 64, 67]), (43, [55, 59, 62])][int((t-8)//2) % 2]
    if t < 22:
        return [(45, [57, 60, 64]), (41, [53, 57, 60]), (36, [60, 64, 67]), (43, [55, 59, 62]), (41, [53, 57, 60])][min(4, int((t-12)//2))]
    return (36, [60, 64, 67, 74])

STEP = .125
for i in range(int(DUR / STEP)):
    t = i * STEP; beat = (i % 4 == 0); eighth = (i % 2 == 0)
    root, ch = chord_notes(t)
    ci = i % 16
    if t < 8:  # tense
        q = t / 8
        if beat and not (7.5 <= t < 8.0): place(music, kick(), t, .5 + .2*q, 0)
        if eighth and t < 7.75: place(music, bass(midi(root), .22), t, .42 + .12*q, 0)
        place(music, hat(.04, 1), t, .05 + .15*q, ((i % 4) - 1.5) * .3) if t < 7.75 else None
        if i % 4 == 2 and t < 7.75: place(music, hat(.18, 1), t, .1 + .1*q, .4)
        if t < 7.75:
            n = ch[[0, 1, 2, 1, 2, 1, 0, 2][i % 8]] + (12 if i % 8 in (3, 5) else 0)
            place(music, pluck(midi(n + 12), .3), t, .1 + .14*q, -.4 if i % 2 else .4)
    elif t < 13:
        if t >= 8.0 and eighth: place(music, bass(midi(root), .45) if beat else bass(midi(root), .2), t, .5, 0)
        if t >= 8.5 and beat: place(music, kick(), t, .45, 0)
        if t >= 9.0 and i % 8 == 4: place(music, clap(), t, .3, .1)
        if eighth: place(music, hat(.04, 1), t, .06, .3)
        n = ch[[0, 1, 2, 1][(i//2) % 4]] + 12
        if eighth and t >= 8.0:
            for k, (dl, gg) in enumerate([(0, .22), (.375, .09)]): place(music, pluck(midi(n + 12), .4, 1.2), t + dl, gg, -.3 if k else .2)
    elif t < 22:
        if beat and t < 21.95: place(music, kick(), t, .4, 0)
        if i % 8 == 4 and t < 21.9: place(music, clap(), t, .26, .1)
        if eighth and t < 21.9: place(music, hat(.04, 1), t, .05, .25)
        if i % 4 == 2 and t < 21.9: place(music, bass(midi(root), .2), t, .38, 0)
        if t < 21.9:
            n = ch[[0, 1, 2, 1, 2, 1, 0, 1][i % 8]] + 12
            for k, (dl, gg) in enumerate([(0, .17), (.375, .07)]): place(music, pluck(midi(n + 12), .38, 1.1), t + dl, gg, -.4 if i % 2 else .4)
# pads (one per chord segment)
segs = [(0, 2), (2, 4), (4, 6), (6, 8), (8, 10), (10, 12), (12, 14), (14, 16), (16, 18), (18, 20), (20, 22)]
for a, b in segs:
    r, ch = chord_notes(a + .01); g = .16 if a < 8 else (.2 if a < 13 else .24)
    place(music, pad([midi(m) for m in ch], b - a + .5), a, g, 0)
r, ch = chord_notes(22.1); place(music, pad([midi(m) for m in ch] + [midi(48)], 3.2), 22.0, .36, 0)
# snare roll
for k, tm in enumerate([6.5, 6.75, 7.0, 7.25, 7.4, 7.55, 7.65, 7.75, 7.82, 7.88, 7.93]):
    place(music, snare(), tm, .12 + .018*k, 0)
place(music, swell(2.5, 400, 9000, .6), 5.5, .6, 0)
place(music, sfx('boom', 1), 22.0, .9, 0)
place(music, cymbal(2.2, 1), 22.0, .4, 0)
place(music, kick(), 22.0, .9, 0)
for tm, m in [(22.5, 79), (22.625, 84), (22.75, 88), (22.875, 91)]: place(music, pluck(midi(m), .5, 1.4), tm, .12, .3)
place(music, sfx('sparkle', 1), 23.5, .5, 0)
place(music, bell([midi(72), midi(79), midi(84)], 2.5, .4, 2.2), 23.0, .5, 0)

# music reverb (light)
ir_t = tt(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t*3.2); ir = lp(ir, 5000)
wet = np.stack([signal.fftconvolve(music[c], ir)[:N] for c in range(2)]) * .035
music = music + wet

# ------------------------------------------------------------ sfx bus
sbus = zeros()
for e in ev:
    s = sfx(e['n'], 1)
    place(sbus, s, e['t'], e['g'] * .9, rng.uniform(-.3, .3))
# short reverb on sfx
ir2 = rng.standard_normal(int(.8*SR)) * np.exp(-tt(.8)*6); ir2 = lp(ir2, 6000)
sbus = sbus + np.stack([signal.fftconvolve(sbus[c], ir2)[:N] for c in range(2)]) * .02

# ------------------------------------------------------------ voiceover (flite 'slt' + polish)
VO = [  # (start, end window, text)
 (0.10, 3.05, "Need business support, but not a full-time hire?"),
 (3.35, 7.90, "Your inbox, calendar, admin, and follow-ups keep piling up."),
 (8.30, 12.90, "What if you had support for the tasks you could hand off?"),
 (13.20, 18.90, "From admin and scheduling to research and follow-ups, Pro Virtual can help."),
 (19.20, 21.95, "Find support that fits your business."),
 (22.85, 24.90, "Message V. A. to get started."),
]
def read_wav(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if w.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
    return a
vo = np.zeros(N); report = []
for k, (st, en, text) in enumerate(VO):
    raw = f'{out}/vo_raw_{k}.wav'; txt = f'{out}/vo_{k}.txt'; open(txt, 'w').write(text)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', f"flite=textfile={txt}:voice=slt", '-ar', str(SR), '-ac', '1', raw], check=True)
    d0 = len(read_wav(raw)) / SR
    tempo = max(1.0, min(1.35, d0 / (en - st)))
    # slow, warm polish: gentle low shelf, de-harsh, compression, tiny room
    flt = (f"atempo={tempo:.4f},highpass=f=95,equalizer=f=180:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=-4,"
           f"lowpass=f=7600,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,aecho=0.7:0.5:55:0.12,volume=2.0")
    pol = f'{out}/vo_pol_{k}.wav'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af', flt, '-ar', str(SR), '-ac', '1', pol], check=True)
    a = read_wav(pol); a = a / (np.abs(a).max() + 1e-9) * .8; i = int(st * SR); vo[i:i+len(a)] += a[:N-i]
    report.append((k, st, round(st + len(a)/SR, 2), round(tempo, 2), text))
for r in report: print('VO', r)

# ------------------------------------------------------------ mix with ducking
env = lp(np.abs(vo), 6, 1); env = env / (env.max() + 1e-9)
duck = np.clip(env * 5, 0, 1); duck = lp(duck, 7, 1)
mgain = 1 - .68 * duck
sp = env > .08
_m = music*mgain*.62
print('SPEECH WINDOWS  voice rms %.1f dB | music rms %.1f dB | sfx rms %.1f dB' % (20*np.log10(np.sqrt((vo[sp]**2).mean())), 20*np.log10(np.sqrt((_m[:, sp]**2).mean())), 20*np.log10(np.sqrt((((sbus*(1-.25*duck)*.75)[:, sp])**2).mean())+1e-9)))
def build(with_vo):
    m = music * (mgain if with_vo else 1.0) * .62
    sx = sbus * (1 - .25*duck if with_vo else 1.0) * .75
    mix = m + sx
    if with_vo: mix = mix + np.stack([vo, vo]) * 1.0
    # fade tail
    fade = np.ones(N); f0 = int((DUR - .45) * SR); fade[f0:] = np.linspace(1, 0, N - f0) ** 1.5
    mix = mix * fade
    # soft limiter + normalise to about -1.5 dBFS peak
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix = mix / (np.abs(mix).max() + 1e-9) * .84
    return mix
for name, wv in (('mix_vo.wav', True), ('mix_novo.wav', False)):
    m = build(wv); pcm = (np.clip(m, -1, 1).T * 32767).astype(np.int16)
    w = wave.open(f'{out}/{name}', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
    print('wrote', name, 'rms dBFS', round(20*np.log10(np.sqrt((m**2).mean())+1e-9), 1))
