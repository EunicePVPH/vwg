#!/usr/bin/env python3
"""ProVirtual PH — Reel #7: original soundtrack + SFX synthesis and final mix.
All music and sound effects are synthesized from scratch here (no samples, no licensed audio).
Usage: python audio.py <voice_dir> <out_wav>
"""
import sys, numpy as np, soundfile as sf
from scipy import signal

SR = 48000; DUR = 25.0; N = int(SR * DUR); BPM = 120; BEAT = 60 / BPM
rng = np.random.default_rng(11)
voice_dir, out_wav = sys.argv[1], sys.argv[2]

# ---------------------------------------------------------------- helpers
def tt(d): return np.arange(int(SR * d)) / SR
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def sos(kind, f, o=2): return signal.butter(o, f, kind, fs=SR, output='sos')
def lp(x, f, o=2): return signal.sosfilt(sos('low', f, o), x)
def hp(x, f, o=2): return signal.sosfilt(sos('high', f, o), x)
def bp(x, f0, f1, o=2): return signal.sosfilt(sos('band', [f0, f1], o), x)
def bus(): return np.zeros((2, N))
def place(b, x, t0, g=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N or i0 + len(x) <= 0: return
    a = max(0, -i0); e = min(len(x), N - i0)
    th = (pan + 1) * np.pi / 4
    b[0, i0 + a:i0 + e] += x[a:e] * g * np.cos(th); b[1, i0 + a:i0 + e] += x[a:e] * g * np.sin(th)
def noise(d): return rng.standard_normal(int(SR * d))
def saw(f, t, ph=0.0): return 2 * ((f * t + ph) % 1.0) - 1
def fade_out(x, d):
    n = int(d * SR); x = x.copy(); n = min(n, len(x)); x[-n:] *= np.linspace(1, 0, n) ** 1.5; return x

def reverb_ir(d=1.8, damp=5500, seed=3):
    r = np.random.default_rng(seed); n = int(SR * d); t = np.arange(n) / SR
    L = r.standard_normal(n) * np.exp(-t * 3.4); R = r.standard_normal(n) * np.exp(-t * 3.4)
    L = lp(L, damp, 1); R = lp(R, damp, 1)
    L[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR)); R[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR))
    L /= np.sqrt((L ** 2).sum()); R /= np.sqrt((R ** 2).sum())   # unit-energy IR: adds space, not level
    return np.stack([L, R])
IR = reverb_ir()
def reverb(b, wet=0.2):
    out = np.zeros_like(b)
    for c in range(2):
        out[c] = signal.fftconvolve(b[c], IR[c])[:N] + 0
    return b * (1 - wet * .35) + out * wet

# ---------------------------------------------------------------- instruments
def kick(g=1.0):
    t = tt(.55); f = 42 + 130 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 7.5) + .35 * lp(noise(.55), 2500) * np.exp(-t * 90)
    return x * g
def clap(g=1.0):
    t = tt(.3); n = bp(noise(.3), 900, 3800); env = np.exp(-t * 20)
    for k in (0, .011, .022): env += .7 * np.exp(-np.clip(t - k, 0, None) * 160) * (t >= k)
    return n * env * g * .5
def hat(open_=False, g=1.0):
    d = .22 if open_ else .06; t = tt(d); return hp(noise(d), 7500) * np.exp(-t * (14 if open_ else 70)) * g * .5
def bass(f, d, g=1.0):
    t = tt(d); env = np.minimum(1, t / .006) * np.exp(-t * 3.2) * np.minimum(1, (d - t) / .03)
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .25 * lp(saw(f, t), 420)
    return x * env * g * .55
def pluck(f, g=1.0, bright=1.0):
    t = tt(.5); env = np.minimum(1, t / .003) * np.exp(-t * 9)
    x = .6 * saw(f, t) + .4 * saw(f * 1.004, t, .13) + .3 * np.sign(np.sin(2 * np.pi * f * t))
    x = lp(x, 1800 + 3200 * bright)
    return x * env * g * .3
def pad(notes, d, g=1.0):
    t = tt(d + .8); x = np.zeros_like(t)
    for m in notes:
        f = midi(m)
        for dt in (-.0035, 0, .0042): x += saw(f * (1 + dt), t, rng.random())
    env = np.minimum(1, t / .55) * np.where(t < d, 1, np.exp(-(t - d) * 5.5))
    return lp(x, 1500, 2) * env * g * .05
def bell(f, d=1.4, g=1.0):
    t = tt(d); x = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 4) + .2 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 7)
    return x * np.minimum(1, t / .002) * np.exp(-t * 3.2) * g * .35

# ---------------------------------------------------------------- sfx
def sweep_noise(d, f0, f1, q=1.4):
    n = int(SR * d); x = rng.standard_normal(n); out = np.zeros(n); zi = None; ch = 1024
    for i in range(0, n, ch):
        f = f0 * (f1 / f0) ** (i / n); w0 = 2 * np.pi * f / SR; al = np.sin(w0) / (2 * q)
        b = np.array([al, 0, -al]); a = np.array([1 + al, -2 * np.cos(w0), 1 - al])
        if zi is None: zi = signal.lfilter_zi(b, a) * 0
        y, zi = signal.lfilter(b, a, x[i:i + ch], zi=zi); out[i:i + ch] = y
    return out / (np.max(np.abs(out)) + 1e-9)
def whoosh(d, f0, f1, g=.5, peak=.6):
    x = sweep_noise(d, f0, f1); p = np.linspace(0, 1, len(x)); env = np.where(p < peak, (p / peak) ** 1.6, ((1 - p) / (1 - peak)) ** 1.3)
    return x * env * g
def riser(d, g=.5):
    x = sweep_noise(d, 250, 7000, q=.9); p = np.linspace(0, 1, len(x)); t = tt(d)
    ch = np.sin(2 * np.pi * np.cumsum(300 * (12 ** p)) / SR) * .25
    return (x + ch) * p ** 2.2 * g
def impact(g=1.0, d=1.8):
    t = tt(d); f = 38 + 60 * np.exp(-t * 14); sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    boom = lp(noise(d), 700) * np.exp(-t * 5) * .6; click = hp(noise(.05), 2000) * np.exp(-tt(.05) * 90) * .5
    x = sub + boom; x[:len(click)] += click; return x * g
def hit(g=.6):  # type slam
    t = tt(.35); x = np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-t * 40)) / SR) * np.exp(-t * 16) + .5 * lp(noise(.35), 1800) * np.exp(-t * 45)
    return x * g
def tick(f=2200, g=.4):
    t = tt(.05); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 110) + .3 * hp(noise(.05), 3000) * np.exp(-t * 200)) * g
def pop(f=900, g=.4):
    t = tt(.09); return np.sin(2 * np.pi * np.cumsum(f * (1 + 1.4 * np.exp(-t * 60))) / SR) * np.exp(-t * 45) * g
def snip(g=.6):
    t = tt(.16); x = hp(noise(.16), 3500) * np.exp(-t * 60) * .8 + (np.sin(2 * np.pi * 5200 * t) + .6 * np.sin(2 * np.pi * 7900 * t)) * np.exp(-t * 38) * .3
    return x * g
def shimmer(d, g=.4, f0=800):
    t = tt(d); x = np.zeros_like(t)
    for k in range(10):
        f = f0 * (1.5 ** (k * .55)) * (1 + .6 * t / d); x += np.sin(2 * np.pi * np.cumsum(f * np.ones_like(t)) / SR + k) * (.5 + .5 * np.sin(2 * np.pi * (6 + k) * t))
    p = t / d; return x / 10 * np.sin(np.pi * np.clip(p, 0, 1)) ** 1.2 * g
def sparkle(root=84, g=.5, notes=(0, 4, 7, 12, 16, 19), gap=.065):
    return [(i * gap, bell(midi(root + n), 1.6, g * (.75 + .25 * (i / len(notes))))) for i, n in enumerate(notes)]

# ---------------------------------------------------------------- music
CH = {  # chord -> (pad voicing, bass root, arp tones)
    'C': ([48, 52, 55, 60, 64], 36, [72, 76, 79, 84]), 'G': ([47, 50, 55, 59, 62], 43, [71, 74, 79, 83]),
    'A': ([48, 52, 57, 60, 64], 45, [72, 76, 81, 84]), 'F': ([48, 53, 57, 60, 65], 41, [72, 77, 81, 84]),
}
BARS = ['C', 'G', 'A', 'F', 'C', 'G', 'A', 'F', 'C', 'F', 'G', 'C', 'C']
music = bus(); padb = bus(); arpb = bus(); drums = bus(); bassb = bus(); kick_times = []

def vel(t, a, b, lo, hi): return lo + (hi - lo) * np.clip((t - a) / (b - a), 0, 1)

for bi, ch in enumerate(BARS):
    t0 = bi * 2.0
    if t0 >= DUR: break
    voic, root, arp = CH[ch]
    # pad
    padlev = vel(t0, 0, 7, .55, 1.0) * (1.25 if t0 >= 22 else 1.0)
    d = 2.0 if t0 < 22 else 3.0
    if t0 == 24: continue
    place(padb, pad(voic, d, padlev), t0, 1.0)
    if t0 >= 22: place(padb, pad([m + 12 for m in voic[:3]] + [86 - 24], d, padlev * .7), t0, 1.0)
    # arp (16ths from 3 s, 8ths before)
    pat = [0, 1, 2, 3, 2, 1, 3, 2]
    step = .25 if t0 < 3 else .125
    k = 0; t = t0
    while t < t0 + 2.0 - 1e-6:
        if t >= 22.0 and t < 22.0: pass
        if t < 22.0 or t >= 22.0:
            m = arp[pat[k % 8]] + (12 if (t >= 14 and t < 19 and k % 8 == 3) else 0)
            g = vel(t, 0, 7, .55, 1.0) * (.85 if t < 3 else 1.0) * (1 if k % 2 == 0 else .75)
            if 22.0 <= t < 24.2: g *= .8
            if t >= 24.2: g *= max(0, 1 - (t - 24.2) / .8)
            if not (19.0 <= t < 19.5): place(arpb, pluck(midi(m), g, .6 + .4 * np.clip(t / 8, 0, 1)), t, 1.0, pan=-.35 if k % 2 == 0 else .35)
        k += 1; t += step

# drums & bass
def beat_times(a, b, every=1.0):
    out = []; t = a
    while t < b - 1e-6: out.append(t); t += BEAT * every
    return out
# kicks
for t in [0.0]: kick_times.append((t, 1.0))
for t in beat_times(3.0, 7.0, 2): kick_times.append((t, .8))
for t in beat_times(7.0, 19.0, 1): kick_times.append((t, 1.0))
for t in beat_times(19.5, 22.0, 1): kick_times.append((t, .9))
kick_times.append((22.0, 1.2))
kick_env = np.zeros(N)
for t, g in kick_times:
    place(drums, kick(g), t, .9)
    i0 = int(t * SR); n = int(.28 * SR); kick_env[i0:i0 + n] = np.maximum(kick_env[i0:i0 + n], np.exp(-np.arange(min(n, N - i0)) / SR / .09))
# claps
for t in beat_times(7.5, 19.0, 2): place(drums, clap(.9), t, .8, pan=.05)
for t in beat_times(19.5 + .5, 22.0, 2): place(drums, clap(.7), t, .8)
# hats
for t in beat_times(3.0, 7.0, .5): place(drums, hat(False, .45), t, .5, pan=.25)
for t in beat_times(7.0, 19.0, .25): place(drums, hat(False, .55 if int((t - 7) / .125) % 2 == 0 else .35), t, .45, pan=.25)
for t in beat_times(7.25, 19.0, .5)[::2]: place(drums, hat(True, .7), t + .0, .4, pan=-.2)
for t in beat_times(19.5, 22.0, .5): place(drums, hat(False, .5), t, .45, pan=.25)
# bass (eighths)
for bi, ch in enumerate(BARS):
    t0 = bi * 2.0; root = CH[ch][1]
    if t0 < 3.0 - 1e-6 and not (t0 + 2 > 3.0): continue
    if t0 >= 22.0:
        if t0 == 22.0: place(bassb, bass(midi(root - 0), 2.6, 1.1), 22.0, 1.0)
        continue
    for k in range(4):
        t = t0 + k * BEAT
        if t < 3.0 or (19.0 <= t < 19.5): continue
        for j, o in enumerate((0, 0)):
            tt_ = t + j * BEAT / 2; f = midi(root + (12 if (j == 1 and k % 2 == 1) else 0))
            place(bassb, bass(f, BEAT / 2 * .9, vel(tt_, 3, 7, .6, 1.0)), tt_, 1.0)

# sidechain pump
duck = 1 - .5 * np.clip(kick_env, 0, 1)
def pump(b): return b * duck
# arp ping-pong delay
def pingpong(b, delay=.375, fb=.38, taps=4):
    o = b.copy()
    for k in range(1, taps + 1):
        s = int(delay * SR * k); g = fb ** k
        o[0, s:] += b[1, :-s] * g if k % 2 else b[0, :-s] * g
        o[1, s:] += b[0, :-s] * g if k % 2 else b[1, :-s] * g
    return o
arpb = pingpong(arpb)
musicmix = pump(padb) * 1.0 + pump(arpb) * .95 + drums * .9 + pump(bassb) * 1.0
musicmix = reverb(musicmix, .16)
# macro fades: intro swell, ending tail
env = np.ones(N); t_ = np.arange(N) / SR
env *= np.clip(t_ / .15, 0, 1) ; env *= np.where(t_ > 24.2, np.clip(1 - (t_ - 24.2) / .8, 0, 1) ** 1.4, 1)
musicmix *= env

# ---------------------------------------------------------------- sfx track
sfx = bus()
def S(t, x, g=1.0, pan=0.0): place(sfx, x, t, g, pan)
# Scene 1 — hook
S(0.0, impact(.85), 1.0); S(0.0, whoosh(2.5, 180, 3200, .5, .85), 1.0)
for i in range(18): S(0.04 + i * .062, tick(1600 + i * 55, .12 + .05 * (i % 2)), 1.0, pan=-.4 + .05 * i)
S(0.02, hit(.8)); S(0.14, hit(.55))
S(1.15, shimmer(.8, .35, 700)); [S(1.42 + o, x, 1.0) for o, x in sparkle(79, .6)]
S(1.45, hit(.5))
S(2.05, riser(.55, .6)); S(2.5, whoosh(.7, 400, 6000, .6, .35)); S(3.0, impact(.6, 1.2), 1.0)
# Scene 2 — chips
S(3.3, tick(1800, .35))
for i, (t, n) in enumerate(zip([3.45, 3.8, 4.15, 4.5, 4.85, 5.2], [84, 86, 88, 91, 93, 96])):
    S(t - .2, whoosh(.3, 500, 4000, .22, .7), 1.0, pan=-.5 if i % 2 == 0 else .5)
    S(t + .3, pop(midi(n) * .5, .5), 1.0, pan=-.4 if i % 2 == 0 else .4); S(t + .3, bell(midi(n), .8, .45), 1.0, pan=-.3 if i % 2 == 0 else .3); S(t + .3, hit(.35))
S(4.95, hit(.7)); S(5.12, hit(.55)); S(5.3, tick(2600, .3))
S(5.9, riser(.7, .6)); S(6.55, whoosh(.7, 300, 5000, .75, .6)); S(7.0, impact(.9), 1.0)
# Scene 3 — transformation
S(7.17, hit(.8)); S(7.2, tick(1200, .4))
S(7.55, shimmer(.55, .22, 500))
S(8.0, snip(.8), 1.0, pan=-.3); S(8.12, snip(.7), 1.0, pan=.3); S(8.1, impact(.35, .8), 1.0)
S(8.4, whoosh(.55, 300, 3500, .55, .45)); S(8.9, whoosh(.7, 250, 4500, .6, .5), 1.0)
for k in range(7): S(9.45 + .13 * k, pop(700 + 90 * k, .5), 1.0, pan=-.2 + .07 * k); S(9.45 + .13 * k, tick(2400 + 150 * k, .22))
S(9.95, hit(.8)); S(10.0, whoosh(.4, 400, 4000, .4, .5))
S(10.3, shimmer(1.0, .4, 600)); S(10.3, whoosh(1.0, 500, 5500, .3, .9)); [S(11.2 + o, x, 1.0) for o, x in sparkle(86, .55, (0, 4, 7, 12), .07)]
S(11.5, hit(.85)); S(11.45, whoosh(.3, 300, 3000, .3, .8))
for i, t in enumerate([11.55, 11.7, 11.9, 12.1, 12.3]):
    S(t, whoosh(.5, 350, 3800, .35, .5), 1.0, pan=[0, -.6, .6, -.6, .6][i]); S(t + .45, hit(.5), 1.0, pan=[0, -.4, .4, -.4, .4][i]); S(t + .45, tick(2500 + 200 * i, .25))
[S(13.0 + o, x, 1.0) for o, x in sparkle(88, .6, (0, 4, 7, 12, 16, 19), .06)]
S(13.0, riser(.8, .55)); S(13.65, whoosh(.65, 350, 6500, .8, .5))
# Scene 4
S(14.0, impact(1.0), 1.0); S(14.0, hit(.5))
for t in (14.7, 15.7, 16.7): S(t, whoosh(.45, 400, 5200, .55, .55), 1.0); S(t + .35, hit(.45)); S(t + .35, tick(2300, .3))
S(15.05, tick(2000, .3)); S(16.05, tick(2200, .3)); S(17.05, tick(2400, .3))
for i, t in enumerate([17.45, 17.59, 17.73, 17.87]): S(t, pop(800 + 150 * i, .5), 1.0, pan=-.5 + .33 * i); S(t, bell(midi(84 + 4 * i), .8, .4))
for t in (17.5, 17.63, 17.76): S(t, hit(.55))
S(18.15, riser(.6, .6)); S(18.7, whoosh(.7, 250, 7000, .85, .4)); S(19.0, impact(.9), 1.0)
# Scene 5
S(19.3, hit(.7)); S(20.0, hit(.65)); S(20.15, hit(.6)); S(19.3, tick(1500, .3))
S(21.1, shimmer(.7, .4, 700)); S(21.45, bell(midi(91), 1.2, .5)); S(21.5, bell(midi(96), 1.2, .4))
S(21.4, riser(.6, .6)); S(21.9, whoosh(.5, 300, 6500, .7, .4))
# Scene 6
S(22.0, impact(1.2, 2.4), 1.0); S(22.0, hit(.8)); S(22.0, hp(noise(2.4), 5500) * np.exp(-tt(2.4) * 2.2) * .45)
for t in (22.1, 22.22, 22.34): S(t, hit(.6))
S(23.05, shimmer(.65, .35, 800)); S(23.05, whoosh(.5, 600, 5000, .35, .5))
for o, x in sparkle(84, .8, (0, 4, 7, 12, 16, 19, 24), .06): S(23.6 + o, x, 1.0)
S(23.6, hit(.6)); S(24.0, shimmer(.9, .22, 1000))
sfxmix = reverb(sfx, .2)

# ---------------------------------------------------------------- voiceover
vo = bus(); VO = {'vo_v1': .35, 'vo_v2': 3.15, 'vo_v3': 7.1, 'vo_v4': 15.0, 'vo_v5': 19.05, 'vo_v6': 22.55}
for name, t0 in VO.items():
    x, sr = sf.read(f'{voice_dir}/{name}.wav'); x = x.astype(float)
    if x.ndim > 1: x = x.mean(1)
    x = signal.resample_poly(x, SR // sr, 1) if SR % sr == 0 else signal.resample(x, int(len(x) * SR / sr))
    x = hp(x, 85, 2)
    # presence + air (gentle), then soft compression
    pres = bp(x, 2500, 5000, 2) * .35; x = x + pres
    x = x / (np.max(np.abs(x)) + 1e-9)
    act_ = np.abs(x) > .04; rm = np.sqrt((x[act_] ** 2).mean()); x = x / rm * 0.115      # equal speech loudness per line (~ -19 dBFS RMS)
    thr = .3; x = np.where(np.abs(x) > thr, np.sign(x) * (thr + (np.abs(x) - thr) * .35), x)   # gentle compression
    x = np.tanh(x * 1.1) / 1.1
    n = int(.01 * SR); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    place(vo, x, t0, 1.0, 0.0)
vo_rev = reverb(vo, .07)
# ducking curve from VO envelope
venv = np.abs(vo[0]); venv = signal.sosfilt(sos('low', 12, 2), venv); venv = venv / (venv.max() + 1e-9)
act = np.clip(venv * 6, 0, 1)
act = signal.sosfilt(sos('low', 5, 2), act); act = np.clip(act, 0, 1)
duck_vo = 1 - .78 * act

# ---------------------------------------------------------------- final mix
mix = musicmix * .62 * duck_vo + sfxmix * .5 * (1 - .5 * act) + vo_rev * 1.5
mix = hp(mix, 42, 4)
# gentle glue limiter
pk = np.max(np.abs(mix)); mix = np.tanh(mix / (pk * .9) * 1.15) * .9
import os
if os.environ.get('DUMP'): np.savez(os.environ['DUMP'], m=musicmix * .62 * duck_vo, s=sfxmix * .5 * (1 - .5 * act), v=vo_rev * 1.5)
sf.write(out_wav, mix.T.astype(np.float32), SR, subtype='PCM_24')
print('wrote', out_wav, 'peak', float(np.max(np.abs(mix))), 'dur', mix.shape[1] / SR)
