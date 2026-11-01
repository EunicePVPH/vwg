#!/usr/bin/env python3
"""ProVirtual PH Reel 12 - original music + sound design + voiceover mix (pure numpy synthesis)."""
import numpy as np, subprocess, soundfile as sf, os, sys
SR = 48000
DUR = 25.0
N = int(SR * DUR)
rng = np.random.default_rng(12)
TTS = sys.argv[1]
OUT = sys.argv[2]

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_ad(n, a, d):
    t = np.arange(n) / SR
    return (1 - np.exp(-t / max(a, 1e-4))) * np.exp(-t / d)

class Bus:
    def __init__(self): self.l = np.zeros(N); self.r = np.zeros(N); self.send = np.zeros(N)
    def add(self, sig, t0, pan=0.0, gain=1.0, send=0.0):
        i0 = int(t0 * SR)
        if i0 >= N or i0 + len(sig) <= 0: return
        a = max(0, -i0); sig = sig[a:]; i0 = max(i0, 0)
        n = min(len(sig), N - i0); sig = sig[:n]
        gl = np.cos((pan + 1) * np.pi / 4); gr = np.sin((pan + 1) * np.pi / 4)
        self.l[i0:i0 + n] += sig * gain * gl; self.r[i0:i0 + n] += sig * gain * gr
        if send: self.send[i0:i0 + n] += sig * gain * send

def stft_apply(x, gain_fn, nfft=2048, hop=512):
    win = np.hanning(nfft)
    pad = np.pad(x, (nfft, nfft))
    nfr = (len(pad) - nfft) // hop + 1
    idx = np.arange(nfft)[None, :] + hop * np.arange(nfr)[:, None]
    S = np.fft.rfft(pad[idx] * win, axis=1)
    G = gain_fn(np.fft.rfftfreq(nfft, 1 / SR)[None, :], ((np.arange(nfr) * hop - nfft + nfft / 2) / SR)[:, None])
    y = np.fft.irfft(S * G, axis=1) * win
    out = np.zeros(len(pad)); nrm = np.zeros(len(pad))
    for i in range(nfr):
        out[i * hop:i * hop + nfft] += y[i]; nrm[i * hop:i * hop + nfft] += win ** 2
    out /= np.maximum(nrm, 1e-6)
    return out[nfft:nfft + len(x)]

def bandnoise(dur, fc_fn, bw=1.0):
    n = int(dur * SR); x = rng.standard_normal(n)
    def g(f, tt):
        fc = fc_fn(np.clip(tt / dur, 0, 1))
        return np.exp(-0.5 * (np.log2(np.maximum(f, 20) / fc) / bw) ** 2)
    return stft_apply(x, g)

def hp_noise(dur, fc=6000):
    n = int(dur * SR); x = rng.standard_normal(n)
    return stft_apply(x, lambda f, tt: 1 / (1 + (fc / np.maximum(f, 1)) ** 4))

def lp(x, fc):
    return stft_apply(x, lambda f, tt: 1 / (1 + (np.maximum(f, 1) / fc) ** 4))

# ---------------------------------------------------------------- instruments
def kick(amp=1.0):
    n = int(.5 * SR); t = np.arange(n) / SR
    f = 46 + 120 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.0) + .25 * np.sin(2 * ph) * np.exp(-t * 18)
    click = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 700) * .25
    return np.tanh(1.5 * (s + click)) * amp * .9

def clap(amp=1.0):
    n = int(.28 * SR); t = np.arange(n) / SR
    nz = bandnoise(.28, lambda p: 1500, 1.2)
    e = np.zeros(n)
    for o in [0, .011, .022]: e += np.where(t >= o, np.exp(-(t - o) * 180), 0) * (1 if o < .022 else 1.6)
    tail = np.exp(-t * 14) * .5
    return nz * (e * .6 + tail * .5) * amp * 2.2

def hat(open_=False, amp=1.0):
    d = .22 if open_ else .05; n = int(d * SR); t = np.arange(n) / SR
    return hp_noise(d, 7000) * np.exp(-t * (14 if open_ else 90)) * amp * .9

def bass(f, dur, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + .45 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6) + .2 * np.sin(6 * np.pi * f * t)
    e = np.minimum(1, t * 400) * np.exp(-t * 3.5) * np.minimum(1, (dur - t) * 60)
    return np.tanh(1.6 * s * e) * amp * .8

def pluck(f, dur, amp=1.0, decay=7.0, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for h in range(1, int(min(16, (SR / 2 - 2000) / f)) + 1):
        s += (1 / h ** 1.15) * np.sin(2 * np.pi * f * h * t + h * .7) * np.exp(-t * decay * (1 + .30 * h / bright))
    return s * (1 - np.exp(-t * 900)) * amp * .5

def bell(f, dur, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for r, a, d in [(1, 1, 3.2), (2.76, .55, 4.5), (5.4, .3, 7), (8.9, .15, 10), (.5, .35, 2.5)]:
        s += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d)
    return s * (1 - np.exp(-t * 1500)) * amp * .5

def pad(freqs, dur, amp=1.0, bright=6, atk=.5, rel=.6):
    n = int(dur * SR); t = np.arange(n) / SR
    L = np.zeros(n); R = np.zeros(n)
    for f in freqs:
        for det, pan in [(-.006, 0), (0, .5), (.006, 1)]:
            s = np.zeros(n)
            for h in range(1, bright + 1):
                if f * h * (1 + det) > SR / 2 - 1500: break
                s += np.sin(2 * np.pi * f * h * (1 + det) * t + h * 1.3 + det * 900) / h
            if pan == 0: L += s * .7; R += s * .3
            elif pan == 1: L += s * .3; R += s * .7
            else: L += s * .5; R += s * .5
    e = np.minimum(1, t / atk) * np.minimum(1, np.maximum(0, (dur - t) / rel))
    return L * e * amp * .12, R * e * amp * .12

def whoosh(dur, up=True, amp=1.0, lo=300, hi=7000):
    if up: fc = lambda p: lo * (hi / lo) ** (p ** 1.5)
    else: fc = lambda p: hi * (lo / hi) ** (p ** .7)
    x = bandnoise(dur, fc, .9)
    n = len(x); t = np.arange(n) / n
    e = np.sin(np.pi * np.clip(t ** (.7 if up else 1.4), 0, 1)) ** 1.5
    return x * e * amp * 3.0

def riser(dur, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; p = t / dur
    x = bandnoise(dur, lambda p: 400 * (14000 / 400) ** (p ** 1.6), .8) * (p ** 2.2) * 3.2
    f = 180 * (6 ** p ** 1.3); ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (np.sin(ph) + .4 * np.sin(2 * ph)) * (p ** 2.5) * .25
    return (x + tone) * amp * np.minimum(1, (dur - t) * 40 + .0001) * (1)

def boom(amp=1.0, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 36 + 90 * np.exp(-t * 9); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 2.4)
    cr = lp(rng.standard_normal(n), 2500) * np.exp(-t * 7) * .7
    air = hp_noise(dur, 4500) * np.exp(-t * 4) * .35
    return np.tanh(1.3 * (s * 1.2 + cr + air)) * amp * .9

def hit(amp=1.0):
    n = int(.8 * SR); t = np.arange(n) / SR
    f = 55 + 70 * np.exp(-t * 16); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 5)
    c = lp(rng.standard_normal(n), 3000) * np.exp(-t * 22) * .6
    return np.tanh(1.2 * (s + c)) * amp

def tick(amp=1.0, f=2100):
    n = int(.03 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 260) * .6 + hp_noise(.03, 4000) * np.exp(-t * 300) * .5) * amp

def pop(f=700, amp=1.0):
    n = int(.22 * SR); t = np.arange(n) / SR
    fr = f * (1 + .9 * np.exp(-t * 55)); ph = 2 * np.pi * np.cumsum(fr) / SR
    return (np.sin(ph) * np.exp(-t * 20) + .3 * np.sin(2 * ph) * np.exp(-t * 35)) * amp * .7

def paper(amp=1.0):
    d = .38; n = int(d * SR); t = np.arange(n) / SR
    x = hp_noise(d, 2500); e = np.zeros(n)
    for o in [0, .05, .11, .16, .24, .3]:
        e += np.where(t >= o, np.exp(-(t - o) * 45), 0) * rng.uniform(.4, 1)
    return x * e * amp * .9

def thump(amp=1.0):
    n = int(.35 * SR); t = np.arange(n) / SR
    f = 52 + 60 * np.exp(-t * 22); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 11) * amp

def reverb(x, rt=1.8, wet_lp=6000, seed=1):
    r = np.random.default_rng(seed); n = int(rt * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 6.9 / rt)
    ir = lp(ir, wet_lp) if wet_lp < 20000 else ir
    ir[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR))
    m = 1
    while m < len(x) + len(ir): m *= 2
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)] * .05

# ---------------------------------------------------------------- music
BPM = 120; BEAT = 60 / BPM; BAR = 4 * BEAT
CH = [  # bar -> (bass root midi, pad voicing, arp tones)
    (33, [57, 60, 64, 69], [57, 60, 64, 69]),   # Am
    (29, [53, 57, 60, 65], [57, 60, 65, 69]),   # F
    (36, [55, 60, 64, 67], [60, 64, 67, 72]),   # C
    (31, [55, 59, 62, 67], [59, 62, 67, 71]),   # G
]
M = Bus(); Mk = Bus(); Mpad = Bus(); Marp = Bus(); Mlead = Bus(); S = Bus(); V = Bus()
kicks = []

def intens(t, pts):
    xs, ys = zip(*pts); return float(np.interp(t, xs, ys))

# kick layer
def kick_on(t):
    if t < 3.0: return t in (1.2,)
    if 13.5 <= t < 14.0: return False
    if 19.5 <= t < 20.0: return False
    if t >= 24.0: return False
    return True
kt = 3.0
while kt < 24.0:
    if kick_on(round(kt, 3)):
        Mk.add(kick(1.0), kt, 0, 1.0); kicks.append(kt)
    kt += BEAT
Mk.add(kick(1.2), 24.0, 0, 1.0); kicks.append(24.0)
Mk.add(kick(.9), 1.2, 0, 1.0); kicks.append(1.2)

# hats / claps
t = 1.5
while t < 3.0:
    M.add(hat(False, .25 + .5 * (t - 1.5) / 1.5), t, rng.uniform(-.4, .4)); t += BEAT / 2
t = 3.0
while t < 24.0:
    gap = (13.5 <= t < 14.0) or (19.5 <= t < 20.0)
    if not gap:
        beat_i = int(round((t - 3.0) / BEAT))
        M.add(hat(True, .55), t + BEAT / 2, .3)
        for s16 in (0, 1, 2, 3):
            tt = t + s16 * BEAT / 4
            if s16 % 2 == 1 or s16 == 0:
                M.add(hat(False, .22 + .1 * (s16 == 2)), tt, -.3 if s16 % 2 else .2)
        if t >= 4.0 and beat_i % 2 == 1:
            M.add(clap(.9), t, 0, 1.0, send=.25)
    t += BEAT
# snare rolls
def roll(t0, t1, amp=1.0):
    n = int((t1 - t0) / (BEAT / 4));
    for i in range(n):
        p = i / max(n - 1, 1)
        M.add(clap(.25 + .75 * p) * (.5 + .5 * p), t0 + i * BEAT / 4, rng.uniform(-.3, .3), amp, send=.2)
roll(2.5, 3.0); roll(19.0, 19.5); roll(13.5, 14.0, .8)

# bass
t = 0.0
while t < 25:
    bar = int(t // BAR) % 4
    root = CH[bar][0]
    if t < 3.0:
        if abs(t % BAR) < 1e-6 and t < 2.9:
            Mpad.add(bass(mtof(root), BAR * .98, .9), t, 0, 1.0)
        t += BAR; continue
    if t >= 24.0: break
    break
# rolling bass 8ths from 3.0
t = 3.0
pat = [0, 0, 12, 0, 0, 12, 0, 7]
while t < 24.0:
    if (13.5 <= t < 14.0) or (19.5 <= t < 20.0): t += BEAT / 2; continue
    bar = int(t // BAR) % 4; root = CH[bar][0]
    step = int(round((t % BAR) / (BEAT / 2)))
    off = pat[step % 8]
    amp = intens(t, [(3, .75), (8, .9), (14, .9), (20, 1.0)])
    Mpad.add(bass(mtof(root + off + (12 if off == 12 else 0)), BEAT / 2 * .9, amp), t, 0, 1.0)
    t += BEAT / 2
Mpad.add(bass(mtof(36), 1.0, 1.2), 24.0, 0, 1.0)  # final C
Mpad.add(bass(mtof(48), 1.0, .5), 24.0, 0, 1.0)

# pads
t = 0.0
while t < 24.0:
    bar = int(t // BAR) % 4; v = CH[bar][1]
    amp = intens(t, [(0, .9), (3, .55), (8, .75), (14, .95), (20, .95), (24, 1.2)])
    bright = int(intens(t, [(0, 5), (8, 6), (14, 9), (20, 11)]))
    pl, pr = pad([mtof(m) for m in v], BAR + .5, amp, bright, atk=.35, rel=.6)
    Mpad.add(pl, t, -1, 1.0, send=.35); Mpad.add(pr, t, 1, 1.0)
    t += BAR
# final resolution chord (C major add9) 24.0 -> 25
pl, pr = pad([mtof(m) for m in [60, 64, 67, 72, 76, 79]], 1.6, 1.5, 12, atk=.04, rel=.9)
Mpad.add(pl, 24.0, -1, 1.0, send=.5); Mpad.add(pr, 24.0, 1, 1.0)
# opening stab chord (Am) at 0.0
pl, pr = pad([mtof(m) for m in [45, 57, 60, 64, 69]], 1.8, 1.7, 12, atk=.01, rel=.9)
Mpad.add(pl, 0.0, -1, 1.0, send=.5); Mpad.add(pr, 0.0, 1, 1.0)
for tt in (1.2, 1.45):
    pl, pr = pad([mtof(m) for m in [45, 57, 64]], .6, 1.3, 10, atk=.01, rel=.3)
    Mpad.add(pl, tt, -1, 1.0, send=.3); Mpad.add(pr, tt, 1, 1.0)

# arp (16ths)
t = 3.0; i = 0
while t < 24.0:
    if (13.5 <= t < 14.0) or (19.5 <= t < 20.0): t += BEAT / 4; i += 1; continue
    bar = int(t // BAR) % 4; tones = CH[bar][2]
    amp = intens(t, [(3, .5), (8, .7), (14, .85), (20, .9)])
    octv = 12 if (14 <= t < 20 and (i // 8) % 2 == 1) else 0
    pat16 = [0, 1, 2, 3, 2, 1, 2, 3, 0, 2, 1, 3, 2, 1, 3, 2]
    m = tones[pat16[i % 16]] + octv
    Marp.add(pluck(mtof(m), .28, amp, 9, 1.0), t, -.5 if i % 2 else .5, 1.0, send=.18)
    t += BEAT / 4; i += 1

# lead motif 8-14 (pluck) and 14-24 (bell)
motif = [[69, 72, 76, 72], [72, 69, 65, 69], [76, 79, 76, 72], [74, 71, 67, 71]]
t = 8.0
while t < 24.0:
    if 13.5 <= t < 14.0 or 19.5 <= t < 20.0: t += BEAT; continue
    bar = int(t // BAR) % 4; k = int(((t % BAR) / BEAT)) % 4
    m = motif[bar][k]
    if t < 14.0: Mlead.add(pluck(mtof(m + 12), .5, .55, 5, 1.4), t, .25, 1.0, send=.3)
    else: Mlead.add(bell(mtof(m + 12), 1.2, .5), t, -.2, 1.0, send=.35)
    t += BEAT
# final bells
for j, m in enumerate([72, 76, 79, 84]):
    Mlead.add(bell(mtof(m + 12), 1.4, .6), 24.0 + j * .06, -.4 + j * .3, 1.0, send=.5)

# risers & impacts
M.add(riser(1.0, .9), 2.0, 0, 1.0, send=.15)
M.add(riser(.65, .9), 13.35, 0, 1.0, send=.15)
M.add(riser(1.0, 1.0), 19.0, 0, 1.0, send=.15)
for tt, a in [(0.0, 1.3), (3.0, 1.0), (14.0, .8), (20.0, 1.0), (24.0, 1.0)]:
    M.add(boom(a), tt, 0, 1.0, send=.3)

# ---------------------------------------------------------------- SFX
def sfx(t, sig, pan=0, g=1.0, send=.2): S.add(sig, t, pan, g, send)
# S1
for tt, f in zip([.06, .36, .64, .9, 1.04], [1568, 1760, 1397, 1568, 1976]):
    sfx(tt + .02, bell(f, .5, .35), rng.uniform(-.3, .3), 1.0, .2); sfx(tt, pop(900, .45), 0, 1.0, .1)
sfx(1.18, hit(1.0), 0, 1, .2); sfx(1.42, hit(.7), 0, 1, .2)
sfx(1.9, whoosh(.55, True, .6), 0, 1, .2); sfx(2.12, chime := bell(mtof(84), 1.0, .45), .2, 1, .4)
sfx(2.85, whoosh(.4, True, .8), 0, 1, .2); sfx(3.0, hit(1.0), 0, 1, .2)
# words
for tt in [3.3, 3.95, 4.95, 8.5, 9.8, 10.5]:
    sfx(tt, tick(1.0, 1500), 0, .8, .1); sfx(tt, thump(.6), 0, .9, .05)
# Monday rows
for i in range(4):
    t0 = 3.92 + i * .36
    sfx(t0, tick(.8, 1900), -.3, 1, .1); sfx(t0 + .38, pop(780 + 90 * i, .55), .3, 1, .12)
sfx(5.35, whoosh(.45, True, .8), 0, 1, .2); sfx(5.5, hit(.8), 0, 1, .2)
# Tuesday
for i in range(4): sfx(6.05 + i * .28, pop(560 + 70 * i, .5), -.4 + i * .27, 1, .15)
for k in range(3): sfx(6.5 + k * .38, bell(mtof(88 + 2 * k), .5, .3), .1, 1, .25)
for j in range(11): sfx(6.65 + j * .09, tick(.35, 3000 + 150 * (j % 3)), .3, 1, .03)
sfx(7.4, pop(900, .6), .3, 1, .2)
for i in range(3): sfx(6.75 + i * .3, whoosh(.3, True, .35, 600, 4000), .3, 1, .1)
for tt in [7.0, 7.35, 7.7]: sfx(tt, tick(.7, 2400), .4, 1, .1)
sfx(7.9, whoosh(.5, True, .85), 0, 1, .2); sfx(8.0, hit(.9), 0, 1, .2)
# Kanban
for tt in [8.65, 9.2, 9.65, 10.4]:
    sfx(tt, whoosh(.3, True, .35, 500, 3500), .2, 1, .1); sfx(tt + .38, pop(520, .7), .1, 1, .15)
for tt in [8.80, 9.35, 9.85, 10.0]: sfx(tt, tick(.5, 1700), 0, 1, .05)
sfx(9.78, paper(.6), -.4, 1, .15); sfx(10.1, paper(.6), .4, 1, .15)
sfx(10.9, whoosh(.55, True, .8, 300, 5000), 0, 1, .2); sfx(11.0, hit(.9), 0, 1, .2)
# Approval
sfx(11.5, bell(mtof(79), .9, .5), .2, 1, .4); sfx(11.85, pop(620, .8), 0, 1, .2)
sfx(12.45, bell(mtof(86), .8, .35), .2, 1, .3); sfx(12.9, tick(1.2, 1300), 0, 1, .1)
sfx(13.0, bell(mtof(79), 1.4, .6), -.2, 1, .45); sfx(13.08, bell(mtof(84), 1.6, .6), .2, 1, .45); sfx(13.0, thump(.9), 0, 1, .1)
sfx(13.15, tick(.6, 2400), 0, 1, .1); sfx(13.35, pop(820, .55), .2, 1, .2)
# Friday
sfx(13.7, whoosh(.7, False, 1.0, 200, 6000), 0, 1, .3)
for tt, p in zip([13.9, 13.99, 14.12, 14.25, 14.42], [0, -.3, -.6, -.9, .9]):
    sfx(tt, whoosh(.45, True, .55, 500, 5000), p, 1, .15)
sfx(14.0, hit(.8), 0, 1, .2)
sfx(14.85, whoosh(.6, True, .6, 400, 6000), 0, 1, .2); sfx(14.85, paper(.7), 0, 1, .2)
for tt in [15.0, 15.45, 15.95, 16.4]:
    sfx(tt, thump(.7), 0, 1, .1); sfx(tt, tick(.9, 1600), 0, 1, .1); sfx(tt - .02, whoosh(.35, True, .5, 500, 4500), 0, 1, .1)
for s, st in enumerate([15.0, 15.45, 15.95, 16.4]):
    for k in range(3):
        sfx(st + .1 + k * .13 + .6, pop(430 + 60 * k + 40 * s, .65), -.5 + .3 * k + (s % 2) * .2, 1, .15)
sfx(16.55, hit(1.0), 0, 1, .25); sfx(16.7, hit(.8), 0, 1, .25)
# scan sparkle + ticks
for j in range(12):
    sfx(17.3 + j * .11, bell(mtof(81 + [0, 2, 4, 7, 9, 12][j % 6]), .6, .28), -.5 + j * .09, 1, .4)
for r in range(12):
    sfx(17.3 + (r / 12) * 1.35 + .02, tick(.55, 2600), 0, 1, .1)
sfx(18.65, bell(mtof(91), 1.4, .55), 0, 1, .45)
sfx(18.7, thump(1.2), 0, 1, .1); sfx(18.7, tick(1.0, 1500), 0, 1, .1); sfx(18.7, bell(mtof(72), 1.6, .45), 0, 1, .4)
sfx(19.4, whoosh(.7, True, 1.0, 300, 9000), 0, 1, .3); sfx(20.0, hit(1.3), 0, 1, .3)
# Finale
for i in range(3):
    sfx(20.0 + i * .3, whoosh(.45, False, .5, 500, 4500), .5 - i * .5, 1, .15); sfx(20.0 + i * .3 + .45, pop(600 + 80 * i, .7), 0, 1, .2)
sfx(21.1, whoosh(.45, False, .7, 300, 4000), 0, 1, .2)
sfx(21.4, hit(1.1), 0, 1, .3); sfx(21.4, whoosh(.7, True, .8, 400, 8000), 0, 1, .3)
sfx(21.95, whoosh(.55, False, .5, 400, 5000), 0, 1, .2)
sfx(22.35, hit(1.0), 0, 1, .3); sfx(22.62, hit(1.0), 0, 1, .3); sfx(22.62, bell(mtof(84), 1.2, .5), .2, 1, .4)
sfx(23.1, pop(700, 1.0), 0, 1, .3); sfx(23.12, bell(mtof(91), 1.0, .5), .2, 1, .4)
sfx(23.7, bell(mtof(96), 1.2, .35), -.2, 1, .5); sfx(23.7, whoosh(.9, True, .35, 1500, 9000), 0, 1, .3)

# ---------------------------------------------------------------- voice
VOT = [(1, .35), (2, 3.15), (3, 8.25), (4, 14.2), (5, 20.05), (6, 23.0)]
for i, t0 in VOT:
    p = f"{TTS}/final_{i}.wav"; q = f"/tmp/vo_{i}_48k.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", p, "-ar", "48000", "-af",
                    "highpass=f=85,equalizer=f=200:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1:g=2.5,equalizer=f=8500:t=q:w=2:g=1.5,acompressor=threshold=-20dB:ratio=3.5:attack=4:release=90:makeup=5", q], check=True)
    x, sr = sf.read(q)
    if x.ndim > 1: x = x.mean(1)
    fade = int(.02 * SR); x = x.copy(); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    x = x / np.max(np.abs(x)) * .9
    V.add(x, t0, 0, 1.0, send=.10)

# ---------------------------------------------------------------- mix
def finalize(bus, rt=1.8, wet=1.0, seed=1):
    rv = reverb(bus.send, rt, 7000, seed) * wet
    return bus.l + rv, bus.r + reverb(bus.send, rt, 7000, seed + 50) * wet

# sidechain pump from kicks
pump = np.ones(N); tt = np.arange(N) / SR
for k in kicks:
    i0 = int(k * SR); n = min(int(.35 * SR), N - i0)
    if n > 0: pump[i0:i0 + n] = np.minimum(pump[i0:i0 + n], 1 - .55 * np.exp(-np.arange(n) / SR / .11))
ml, mr = finalize(M, 2.0, 1.0, 1)
pl_, pr_ = finalize(Mpad, 2.4, 1.0, 5)
al, ar = finalize(Marp, 1.4, 1.0, 9)
ll, lr = finalize(Mlead, 2.0, 1.0, 13)
# ping-pong delay on arp + lead
def dly(x, d, g): y = np.zeros_like(x); k = int(d * SR); y[k:] = x[:-k] * g; return y
dl = dly(ar, BEAT * .75, .35) + dly(ar, BEAT * 1.5, .18); dr = dly(al, BEAT * .75, .35) + dly(al, BEAT * 1.5, .18)
al2 = al + dl; ar2 = ar + dr
ll2 = ll + dly(lr, BEAT * .75, .3); lr2 = lr + dly(ll, BEAT * .75, .3)
kl, kr = Mk.l, Mk.r
music_l = ml * .8 + (pl_ * .9 + al2 * .75 + ll2 * .6) * pump + kl * 1.0
music_r = mr * .8 + (pr_ * .9 + ar2 * .75 + lr2 * .6) * pump + kr * 1.0
sl, sr_ = finalize(S, 1.4, 1.0, 21)
vl, vr = finalize(V, .9, 1.0, 33)

# duck music under voice
vo_env = np.abs(V.l + V.r)
blk = 480; nb = N // blk
e = np.array([vo_env[i * blk:(i + 1) * blk].max() for i in range(nb)])
act = (e > .03).astype(float)
sm = np.zeros(nb); cur = 0.0
for i in range(nb):
    a = .25 if act[i] > cur else .015
    cur += (act[i] - cur) * a; sm[i] = cur
smi = np.interp(np.arange(N), (np.arange(nb) + .5) * blk, sm)
duck = 1 - .76 * smi
duck_s = 1 - .55 * smi

master_l = music_l * duck * .46 + sl * duck_s * .6 + vl * 1.3
master_r = music_r * duck * .46 + sr_ * duck_s * .6 + vr * 1.3
if os.environ.get('STEMS'):
    sf.write('stem_vo.wav',np.stack([vl*1.3,vr*1.3],1),SR); sf.write('stem_bed.wav',np.stack([music_l*duck*.46+sl*duck_s*.6,music_r*duck*.46+sr_*duck_s*.6],1),SR)
# soft limit + final 0.35s fade-out so the tail ends clean
mx = np.max(np.abs([master_l, master_r]))
g = .89 / mx
master_l = np.tanh(master_l * g * 1.25) / np.tanh(1.25); master_r = np.tanh(master_r * g * 1.25) / np.tanh(1.25)
fo = int(.4 * SR); ramp = np.ones(N); ramp[-fo:] = np.linspace(1, 0, fo) ** 1.5
master_l *= ramp; master_r *= ramp
sf.write(OUT, np.stack([master_l, master_r], 1).astype(np.float32), SR, subtype='PCM_16')
print('audio written', OUT, 'peak', np.max(np.abs([master_l, master_r])))
