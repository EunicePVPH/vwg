"""
ProVirtual PH - Business Delegation Audit Reel : original music + SFX + voiceover mix.
Everything is synthesized here (numpy/scipy) - no samples, no licensed music.
usage: python3 audio.py <timeline.json> <vo_dir> <out.wav>
"""
import sys, json, math
import numpy as np
import soundfile as sf
from scipy import signal as sg

TL = json.load(open(sys.argv[1]))
VO_DIR = sys.argv[2]
OUT = sys.argv[3]
VO = json.load(open(f"{VO_DIR}/vo.json"))

SR = 44100
DUR = 25.0
N = int(DUR * SR)
rng = np.random.default_rng(2026)
BEAT = 0.5  # 120 bpm


def m2f(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


def tt(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, fc, order=2):
    if np.isscalar(fc):
        w = min(fc, SR / 2 - 100) / (SR / 2)
    else:
        w = [min(f, SR / 2 - 100) / (SR / 2) for f in fc]
    sos = sg.butter(order, w, btype=kind, output="sos")
    return sg.sosfilt(sos, x)


def sweep(x, kind, f0, f1, order=2, block=512):
    """time-varying filter, cutoff glides f0 -> f1 (exponential)"""
    n = len(x)
    out = np.zeros(n)
    zi = None
    for i in range(0, n, block):
        k = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** k
        sos = sg.butter(order, min(fc, SR / 2 - 200) / (SR / 2), btype=kind, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg, zi = sg.sosfilt(sos, x[i:i + block], zi=zi)
        out[i:i + block] = seg
    return out


def bpsweep(x, f0, f1, q=0.25, block=512):
    n = len(x)
    out = np.zeros(n)
    zi = None
    for i in range(0, n, block):
        k = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** k
        lo, hi = fc * (1 - q), min(fc * (1 + q), SR / 2 - 300)
        sos = sg.butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band", output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg, zi = sg.sosfilt(sos, x[i:i + block], zi=zi)
        out[i:i + block] = seg
    return out


def dec(n, a=0.003, tau=0.1):
    t = np.arange(n) / SR
    return (1 - np.exp(-t / a)) * np.exp(-t / tau)


def noise(d):
    return rng.standard_normal(int(d * SR))


class Bus:
    def __init__(self):
        self.b = np.zeros((N, 2), dtype=np.float64)

    def add(self, x, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N or i + len(x) <= 0:
            return
        if i < 0:
            x = x[-i:]
            i = 0
        j = min(N, i + len(x))
        x = x[:j - i]
        a = (pan + 1) * math.pi / 4
        self.b[i:j, 0] += x * g * math.cos(a)
        self.b[i:j, 1] += x * g * math.sin(a)


def reverb_ir(rt=1.8, pre=0.015, lp=7000, hp=160, seed=1):
    r = np.random.default_rng(seed)
    n = int(rt * 1.2 * SR)
    t = np.arange(n) / SR
    out = []
    for _ in range(2):
        ir = r.standard_normal(n) * np.exp(-t * 6.9 / rt)
        ir[: int(pre * SR)] = 0
        ir = filt(ir, "low", lp, 2)
        ir = filt(ir, "high", hp, 2)
        out.append(ir)
    ir = np.stack(out, 1)
    ir /= np.sqrt((ir ** 2).sum(0)).max()
    return ir


def apply_reverb(bus, rt, wet, **kw):
    ir = reverb_ir(rt, **kw)
    y = np.zeros_like(bus)
    for c in range(2):
        y[:, c] = sg.fftconvolve(bus[:, c], ir[:, c])[: len(bus)]
    return y * wet


# ------------------------------------------------------------------ instruments
def kick(vel=1.0):
    t = tt(0.5)
    f = 46 + 120 * np.exp(-t / 0.028)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.17)
    click = filt(noise(0.012), "high", 2000) * 0.5
    x[: len(click)] += click * np.exp(-np.arange(len(click)) / SR / 0.004)
    return x * vel


def snare(vel=1.0, tone=190):
    t = tt(0.3)
    n = filt(noise(0.3), "high", 1400) * np.exp(-t / 0.085)
    s = np.sin(2 * np.pi * tone * t) * np.exp(-t / 0.045) * 0.5
    return (n * 0.8 + s) * vel


def clap(vel=1.0):
    t = tt(0.35)
    x = np.zeros_like(t)
    for off in (0, 0.011, 0.023):
        i = int(off * SR)
        b = filt(noise(0.05), "band", [900, 3500]) * np.exp(-np.arange(int(0.05 * SR)) / SR / 0.012)
        x[i:i + len(b)] += b
    tail = filt(noise(0.35), "band", [900, 3000]) * np.exp(-t / 0.09) * 0.5
    x[int(0.023 * SR):] += tail[: len(x) - int(0.023 * SR)]
    return x * vel * 1.2


def hat(vel=1.0, open_=False):
    d = 0.22 if open_ else 0.05
    t = tt(d)
    return filt(noise(d), "high", 7500) * np.exp(-t / (0.07 if open_ else 0.012)) * vel * 0.6


def saw_bl(f, d, nh=14):
    t = tt(d)
    x = np.zeros_like(t)
    for k in range(1, nh + 1):
        if f * k > 9000:
            break
        x += np.sin(2 * np.pi * f * k * t) / k
    return x * 0.6


def bass(f, d, fc=500, vel=1.0):
    n = int(d * SR)
    x = saw_bl(f, d, 10) * 0.7 + np.sin(2 * np.pi * f * tt(d)) * 0.9
    x = filt(x, "low", fc, 2)
    e = dec(n, 0.004, d * 0.55)
    return x * e * vel


def pluck(f, d=0.5, vel=1.0, bright=1.0):
    t = tt(d)
    x = np.zeros_like(t)
    for k in range(1, 7):
        x += np.sin(2 * np.pi * f * k * t) / (k ** 1.15) * np.exp(-t * (6 + 9 * k) / (1.0 + 2 * bright))
    return x * dec(len(t), 0.002, 0.28 * d + 0.12) * vel * 0.8


def bell(f, d=1.4, vel=1.0):
    t = tt(d)
    x = np.zeros_like(t)
    for ratio, amp, tau in ((1, 1, 0.9), (2.76, .5, .5), (5.4, .3, .3), (8.93, .15, .18)):
        x += np.sin(2 * np.pi * f * ratio * t) * amp * np.exp(-t / (tau * d / 1.4))
    return x * dec(len(t), 0.001, 10) * vel * 0.55


def pad(freqs, d, fc=1600, vel=1.0, att=0.5, rel=0.8):
    t = tt(d)
    x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.07, 0.0, 0.07):
            ff = f * 2 ** (det / 12)
            x += saw_bl(ff, d, 8) / len(freqs) * 0.5
    x = filt(x, "low", fc, 2)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t)) / rel)
    return x * env * vel


def whoosh(d, f0, f1, vel=1.0, peak=0.5, q=0.35):
    x = bpsweep(noise(d), f0, f1, q=q)
    t = np.linspace(0, 1, len(x))
    env = np.where(t < peak, (t / peak) ** 1.6, ((1 - t) / (1 - peak)) ** 1.3)
    x = x * env
    x /= (np.abs(x).max() + 1e-9)
    return x * vel


def riser(d, f0=250, f1=7000, vel=1.0):
    x = bpsweep(noise(d), f0, f1, q=0.5)
    t = np.linspace(0, 1, len(x))
    x = x * (t ** 2.2)
    tone = np.sin(2 * np.pi * np.cumsum(f0 * 0.6 * (f1 / f0 / 0.6) ** (t ** 1.5)) / SR) * 0.12 * (t ** 2)
    y = x / (np.abs(x).max() + 1e-9) + tone
    return y * vel


def boom(vel=1.0, d=1.6):
    t = tt(d)
    f = 34 + 90 * np.exp(-t / 0.12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.7)
    n = filt(noise(d), "low", 900) * np.exp(-t / 0.18) * 0.5
    return (x + n) * vel


def crash(d=2.6, vel=1.0):
    t = tt(d)
    x = filt(noise(d), "high", 3500) * np.exp(-t / 0.9)
    x += filt(noise(d), "band", [5000, 9000]) * np.exp(-t / 1.4) * 0.6
    return x * vel * 0.5


def zap(vel=1.0):
    t = tt(0.3)
    f = 4200 * np.exp(-t * 11) + 180
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * vel * 0.5


def blip(f=1400, vel=1.0, d=0.07):
    t = tt(d)
    return np.sin(2 * np.pi * f * t * (1 + 0.3 * np.exp(-t / 0.01))) * np.exp(-t / (d * 0.35)) * vel


def tick(vel=1.0):
    n = filt(noise(0.02), "band", [2500, 6000]) * np.exp(-tt(0.02) / 0.004)
    return n * vel * 1.4


def ping(f=1760, vel=1.0):
    t = tt(0.5)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t / 0.12) * vel * 0.45


MUS, SFX, VOX = Bus(), Bus(), Bus()
MREV, SREV = Bus(), Bus()   # reverb sends

# ------------------------------------------------------------------ MUSIC
def chord_A(b):  # section A (tension, A minor)
    if b < 4: return dict(root=45, pad=[45, 52, 57, 60], arp=[69, 72, 76, 81])
    if b < 8: return dict(root=41, pad=[41, 48, 53, 57], arp=[65, 69, 72, 77])
    if b < 12: return dict(root=45, pad=[45, 52, 57, 60], arp=[69, 72, 76, 81])
    return dict(root=40, pad=[40, 47, 52, 56], arp=[68, 71, 76, 80])

CH = {
    "C": dict(root=36, pad=[48, 55, 60, 64], arp=[72, 76, 79, 84]),
    "G": dict(root=31, pad=[43, 50, 55, 59], arp=[71, 74, 79, 83]),
    "Am": dict(root=33, pad=[45, 52, 57, 60], arp=[69, 72, 76, 81]),
    "F": dict(root=29, pad=[41, 48, 53, 57], arp=[72, 77, 81, 84]),
}

# ---- Section A : 0 - 7s (tense, building)
for e in range(0, 28):                      # 8th-note bass pulse
    t = e * 0.25
    b = t / BEAT
    c = chord_A(b)
    f = m2f(c["root"] + (12 if e % 4 == 3 else 0))
    fc = 260 + 1100 * (t / 7.0) ** 1.4
    vel = 0.55 + 0.45 * (t / 7.0)
    MUS.add(bass(f, 0.22, fc, vel), t, 0.55)
for bt in range(0, 14, 4):
    c = chord_A(bt)
    ramp = 0.22 + 0.3 * (bt * BEAT / 7.0)
    MUS.add(pad(c["pad"], 2.6, 1100, ramp, att=0.6, rel=0.9), bt * BEAT, 0.5)
    MREV.add(pad(c["pad"], 2.6, 1100, ramp * .5, att=0.6, rel=0.9), bt * BEAT, 0.4)
MUS.add(pad([58, 70], 3.0, 900, 0.35, att=1.2, rel=0.3), 4.0, 0.25)   # dissonant b2 tension
for b in range(4, 14):                      # kick
    MUS.add(kick(0.55 + 0.3 * b / 14), b * BEAT, 0.9)
for k in range(8):                          # extra pickup kicks in the last bar
    MUS.add(kick(0.35), 6.0 + 0.125 * k + 0.0, 0.5) if (k % 2 == 1) else None
t = 0.5
while t < 6.95:                             # hats
    v = 0.12 + 0.5 * (t / 7.0)
    MUS.add(hat(v, open_=(abs(((t / BEAT) % 1) - 0.5) < 0.01 and t > 3)), t, 0.5)
    t += 0.125 if t > 3 else 0.25
t = 5.5                                     # snare roll (accelerating)
while t < 6.97:
    step = 0.25 if t < 6.0 else (0.125 if t < 6.5 else 0.0625)
    MUS.add(snare(0.25 + 0.7 * (t - 5.5) / 1.5, 200 + 120 * (t - 5.5)), t, 0.55)
    t += step
for b in (5, 7, 9):
    MUS.add(snare(0.55), b * BEAT, 0.5)
MUS.add(riser(4.0, 260, 8000, 0.8), 3.0, 0.5)
st = 0                                      # arpeggio 16ths from 3.0s
t = 3.0
while t < 6.97:
    c = chord_A(t / BEAT)
    idx = [0, 1, 2, 3, 2, 1][st % 6]
    vel = 0.18 + 0.55 * ((t - 3) / 4)
    MUS.add(pluck(m2f(c["arp"][idx]), 0.28, vel, 1.2), t, 0.5, pan=(-0.5 if st % 2 else 0.5))
    MREV.add(pluck(m2f(c["arp"][idx]), 0.28, vel * .6, 1.2), t, 0.3, pan=(-0.5 if st % 2 else 0.5))
    st += 1
    t += 0.125 if t > 4.5 else 0.25

# ---- 7.0 : the freeze (hit, then air)
MUS.add(boom(1.0, 2.0), 7.0, 0.95)
MUS.add(crash(2.2, 0.7), 7.0, 0.35)
SFX.add(zap(0.9), 7.0, 0.55)
SFX.add(whoosh(0.7, 7000, 400, 0.8, 0.25), 7.0, 0.55)
SREV.add(zap(0.6), 7.0, 0.4)

# ---- Section B : 7 - 12s (transition, hopeful)
secB = [(7.0, [41, 48, 53, 57, 60, 64]), (9.0, [48, 55, 60, 64, 67]), (11.0, [43, 50, 55, 59, 62])]
for t0, notes in secB:
    d = 2.2
    MUS.add(pad(notes, d + .6, 2200, 0.42, att=0.7, rel=1.0), t0, 0.5)
    MREV.add(pad(notes, d + .6, 2200, 0.3, att=0.7, rel=1.0), t0, 0.4)
t = 8.0
st = 0
tones = [72, 76, 79, 84, 79, 76]
while t < 11.9:
    root = 72 if t < 9 else (76 if t < 11 else 74)
    MUS.add(pluck(m2f(root + [0, 4, 7, 12, 7, 4][st % 6] - (0 if t >= 9 else 7)), 0.4, 0.22, 0.8), t, 0.5, pan=(-0.4 if st % 2 else 0.4))
    st += 1
    t += 0.25
for b in range(18, 24):
    MUS.add(kick(0.5 + 0.05 * (b - 18)), b * BEAT, 0.8)
    MUS.add(bass(m2f(36 if b < 22 else 31), 0.4, 420, 0.7), b * BEAT, 0.5)
t = 8.5
while t < 11.9:
    MUS.add(hat(0.18 + 0.08 * (t - 8.5)), t, 0.4)
    t += 0.25
t = 11.0
while t < 11.98:
    step = 0.25 if t < 11.5 else 0.125
    MUS.add(snare(0.3 + (t - 11.0) * 0.8), t, 0.5)
    t += step
MUS.add(riser(1.6, 400, 9000, 0.9), 10.4, 0.5)

# ---- Section C : 12 - 21s (confident, uplifting, forward)
prog_C = [("C", 24, 28), ("G", 28, 32), ("Am", 32, 36), ("F", 36, 40), ("G", 40, 42)]
for name, b0, b1 in prog_C:
    c = CH[name]
    d = (b1 - b0) * BEAT
    MUS.add(pad(c["pad"], d + 0.5, 2600, 0.5, att=0.12, rel=0.5), b0 * BEAT, 0.5)
    MREV.add(pad(c["pad"], d + 0.5, 2600, 0.35, att=0.12, rel=0.5), b0 * BEAT, 0.4)
    for e in range(int((b1 - b0) * 2)):
        t = b0 * BEAT + e * 0.25
        f = m2f(c["root"] + (12 if e % 2 else 0))
        MUS.add(bass(f, 0.2, 700, 0.9 if e % 2 == 0 else 0.6), t, 0.62)
    for s in range(int((b1 - b0) * 4)):
        t = b0 * BEAT + s * 0.125
        idx = [0, 1, 2, 3, 2, 1, 2, 3][s % 8]
        vel = 0.34 + (0.12 if t > 17 else 0)
        MUS.add(pluck(m2f(c["arp"][idx]), 0.3, vel, 1.5), t, 0.5, pan=(-0.55 if s % 2 else 0.55))
        MREV.add(pluck(m2f(c["arp"][idx]), 0.3, vel * .5, 1.5), t, 0.3, pan=(-0.55 if s % 2 else 0.55))
for b in range(24, 41):
    MUS.add(kick(0.95), b * BEAT, 0.9)
    if (b - 24) % 2 == 1:
        MUS.add(clap(0.9), b * BEAT, 0.55)
    MUS.add(hat(0.55, open_=True), b * BEAT + 0.25, 0.4)
    if b >= 34:
        for q in (0.125, 0.375):
            MUS.add(hat(0.28), b * BEAT + q, 0.35)
MUS.add(crash(1.6, 0.6), 12.0, 0.3)
MUS.add(boom(0.7, 1.4), 12.0, 0.7)
for i, tn in enumerate((84, 88, 91, 96)):            # sparkle motif at 17.0 (lift)
    MUS.add(bell(m2f(tn), 1.2, 0.5), 17.0 + i * 0.125, 0.4, pan=0.3)
    MREV.add(bell(m2f(tn), 1.2, 0.5), 17.0 + i * 0.125, 0.4, pan=0.3)
for i, tn in enumerate((79, 83, 86, 91)):            # echo motif 19.0
    MUS.add(bell(m2f(tn), 1.2, 0.45), 19.0 + i * 0.25, 0.4, pan=-0.3)
    MREV.add(bell(m2f(tn), 1.2, 0.45), 19.0 + i * 0.25, 0.4, pan=-0.3)
# pre-resolution build 20 - 21 (kick pulls out at beat 41)
MUS.add(riser(1.0, 500, 9500, 1.0), 20.0, 0.55)
t = 20.0
while t < 20.98:
    step = 0.125 if t < 20.5 else 0.0625
    MUS.add(snare(0.35 + (t - 20) * 0.8), t, 0.5)
    t += step

# ---- Section D : 21 - 25s (resolution, brand)
MUS.add(boom(1.0, 2.0), 21.0, 1.0)
MUS.add(kick(1.0), 21.0, 0.9)
MUS.add(crash(2.8, 1.0), 21.0, 0.5)
stab = [48, 55, 64, 67, 74, 79]
MUS.add(pad(stab, 4.2, 4200, 0.65, att=0.02, rel=1.2), 21.0, 0.55)
MREV.add(pad(stab, 4.2, 4200, 0.5, att=0.02, rel=1.2), 21.0, 0.5)
MUS.add(bass(m2f(24), 3.6, 260, 1.0), 21.0, 0.7)
for b in range(43, 48):
    MUS.add(kick(0.8), b * BEAT, 0.8)
    if b % 2 == 1:
        MUS.add(clap(0.7), b * BEAT, 0.4)
    MUS.add(hat(0.4, open_=True), b * BEAT + 0.25, 0.3)
for s in range(0, 24):
    t = 21.5 + s * 0.125
    if t < 23.9:
        MUS.add(pluck(m2f([72, 76, 79, 84, 79, 76, 72, 67][s % 8]), 0.25, 0.28, 1.3), t, 0.45, pan=(-0.5 if s % 2 else 0.5))
for i, tn in enumerate((96, 100, 103, 108)):         # final gold accent
    MUS.add(bell(m2f(tn), 2.4, 0.7), 24.0 + i * 0.09, 0.5, pan=(-0.4 + 0.27 * i))
    MREV.add(bell(m2f(tn), 2.4, 0.7), 24.0 + i * 0.09, 0.5, pan=(-0.4 + 0.27 * i))
for i in range(14):                                 # sparkle shimmer
    MUS.add(bell(m2f(int(rng.integers(100, 112))), 1.0, 0.25), 23.9 + i * 0.07 + rng.uniform(0, .04), 0.3, pan=rng.uniform(-.8, .8))

# ------------------------------------------------------------------ SFX
cards = TL["cards"]
# scene 1 typography
for t0, g in ((0.02, 1.0), (0.20, 0.7)):
    SFX.add(boom(0.55, 0.7), t0, g * 0.7)
    SFX.add(whoosh(0.35, 3000, 500, 0.9, 0.4), t0 - 0.05, 0.5)
SFX.add(riser(0.9, 600, 9000, 0.8), 0.08, 0.35)
SFX.add(whoosh(0.5, 400, 7000, 1.0, 0.8), 0.55, 0.55)
SFX.add(boom(0.9, 1.0), 0.98, 0.8)
SFX.add(bell(m2f(88), 1.4, 0.5), 1.0, 0.45)
SREV.add(bell(m2f(88), 1.4, 0.5), 1.0, 0.45)
SFX.add(boom(0.5, 0.7), 1.18, 0.55)
# card spawns : notification sounds
KIND_SND = {"toast": "ping", "email": "mail", "event": "tick", "kanban": "pop", "post": "pop", "doc": "tick", "browser": "pop", "search": "tick"}
for c in cards:
    t0 = c["ts"]
    k = KIND_SND[c["kind"]]
    pan = float(np.clip(c["x"] / 500.0, -0.8, 0.8))
    g = 0.30 + 0.35 * min(1, t0 / 6.0)
    if k == "ping":
        f = [1568, 1760, 2093, 2349][c["id"] % 4]
        SFX.add(ping(f, 1.0), t0, g * 0.8, pan); SREV.add(ping(f, 1.0), t0, g * 0.3, pan)
    elif k == "mail":
        SFX.add(whoosh(0.18, 1200, 5000, 0.8, 0.5, 0.4), t0 - 0.03, g * 0.6, pan)
        SFX.add(blip(1000 + 90 * (c["id"] % 5), 1.0, 0.08), t0 + 0.05, g * 0.5, pan)
    elif k == "tick":
        SFX.add(tick(1.0), t0, g * 0.9, pan); SFX.add(blip(1900 + 60 * (c["id"] % 7), 0.6, 0.05), t0, g * 0.4, pan)
    else:
        SFX.add(blip(700 + 70 * (c["id"] % 6), 1.0, 0.09), t0, g * 0.7, pan)
        SFX.add(tick(0.6), t0, g * 0.5, pan)
# scene 1 -> 2 blast and EVERY TASK slams
SFX.add(whoosh(0.6, 5000, 300, 1.0, 0.3), 2.78, 0.6)
SFX.add(boom(0.9, 1.0), 3.02, 0.75)
for t0 in (3.29, 4.61, 5.93):
    SFX.add(boom(0.8, 0.9), t0, 0.7)
    SFX.add(whoosh(0.3, 6000, 600, 1.0, 0.3), t0 - 0.1, 0.5)
    SFX.add(tick(1.0), t0 + 0.05, 0.6)
for t0 in (3.9, 5.2, 6.5):
    SFX.add(whoosh(0.4, 600, 5000, 1.0, 0.8), t0, 0.28)
# scene 3: headline + sort
for t0 in (7.32, 7.5):
    SFX.add(whoosh(0.4, 1000, 4500, 0.9, 0.55), t0 - 0.05, 0.28)
for i, name in enumerate(("KEEP", "DELEGATE", "STREAMLINE")):
    SFX.add(whoosh(0.5, 300, 2500, 0.9, 0.7), 7.62 + i * 0.13, 0.22, pan=(-0.7, 0, 0.7)[i])
sorted_cards = sorted([c for c in cards if c["sorted"]], key=lambda c: c["land"])
EXT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
for i, c in enumerate(sorted_cards):
    pan = float(np.clip((c["slot"]["x"] - 540) / 420.0, -0.85, 0.85))
    SFX.add(whoosh(0.32, 700, 3500, 0.9, 0.55, 0.45), c["start"], 0.2, pan)
    note = 67 + EXT[min(9, int(i * 10 / 24))]
    SFX.add(pluck(m2f(note), 0.5, 0.9, 1.4), c["land"], 0.38, pan)
    SREV.add(pluck(m2f(note), 0.5, 0.9, 1.4), c["land"], 0.3, pan)
    SFX.add(tick(0.9), c["land"], 0.5, pan)
SFX.add(whoosh(0.9, 2000, 9000, 0.9, 0.5), 9.85, 0.3)
for i, tn in enumerate((91, 95, 98)):
    SFX.add(bell(m2f(tn), 1.4, 0.4), 9.9 + i * 0.12, 0.4); SREV.add(bell(m2f(tn), 1.4, 0.4), 9.9 + i * 0.12, 0.4)
# transitions
for t0 in (11.75, 16.85, 20.82):
    SFX.add(whoosh(0.8, 300, 8000, 1.0, 0.6, 0.5), t0, 0.5)
SFX.add(boom(0.7, 1.0), 12.0, 0.45)
# scene 4
SFX.add(whoosh(0.6, 500, 3500, 0.9, 0.5), 11.9, 0.35)
for i in range(6):
    SFX.add(tick(0.9), 12.95 + i * 0.09, 0.5, pan=-0.3 + 0.1 * i)
SFX.add(whoosh(0.8, 700, 7000, 1.0, 0.5), 13.28, 0.4)
for t0 in (14.0, 15.2):
    SFX.add(bell(m2f(79), 0.8, 0.5), t0, 0.5); SFX.add(bell(m2f(86), 0.8, 0.5), t0 + 0.08, 0.5)
    SREV.add(bell(m2f(86), 0.8, 0.5), t0 + 0.08, 0.5)
for i in range(6):
    SFX.add(blip(900 + 110 * i, 1.0, 0.1), 14.28 + i * 0.13, 0.5, pan=0.2)
    SFX.add(tick(0.8), 14.3 + i * 0.13, 0.4, pan=0.2)
for i in range(6):
    SFX.add(whoosh(0.25, 800, 3000, 0.8, 0.5), 15.35 + i * 0.045, 0.14)
for k, tn in enumerate((84, 88, 91)):
    SFX.add(bell(m2f(tn), 1.0, 0.6), 16.0 + k * 0.13, 0.55); SREV.add(bell(m2f(tn), 1.0, 0.6), 16.0 + k * 0.13, 0.4)
SFX.add(bell(m2f(96), 1.4, 0.7), 16.38, 0.5); SREV.add(bell(m2f(96), 1.4, 0.7), 16.38, 0.4)
# scene 5
SFX.add(whoosh(0.7, 500, 4000, 0.9, 0.5), 16.95, 0.3)
for i in range(7):
    SFX.add(tick(0.8), 17.3 + i * 0.05, 0.4, pan=-0.2 + 0.07 * i)
for k, tn in enumerate((79, 83, 86)):
    t0 = (17.75, 18.25, 18.75)[k]
    SFX.add(bell(m2f(tn), 1.1, 0.7), t0, 0.5, pan=(-0.4, 0, 0.4)[k]); SREV.add(bell(m2f(tn), 1.1, 0.7), t0, 0.4)
for i in range(7):
    SFX.add(whoosh(0.4, 3500, 700, 0.9, 0.4, 0.45), 17.95 + i * 0.085, 0.22, pan=0.2 + 0.08 * i)
SFX.add(riser(0.9, 300, 6000, 0.7), 18.2, 0.3)
SFX.add(boom(0.7, 1.4), 19.0, 0.55)
SFX.add(whoosh(1.0, 400, 9000, 1.0, 0.6), 18.95, 0.35)
for i, tn in enumerate((84, 88, 91, 96)):
    SFX.add(bell(m2f(tn), 1.6, 0.5), 19.08 + i * 0.1, 0.5); SREV.add(bell(m2f(tn), 1.6, 0.5), 19.08 + i * 0.1, 0.5)
SFX.add(whoosh(0.7, 3000, 9000, 0.8, 0.5), 19.55, 0.25)
# scene 6
for i, t0 in enumerate((21.1, 21.24, 21.38)):
    SFX.add(boom(0.55, 0.8), t0, 0.5)
    SFX.add(whoosh(0.35, 800, 5000, 0.9, 0.5), t0 - 0.05, 0.3)
SFX.add(whoosh(0.7, 500, 8000, 0.9, 0.7), 21.75, 0.3)
for t0 in (21.95, 22.08):
    SFX.add(whoosh(0.3, 900, 4500, 0.9, 0.5), t0 - .03, 0.25)
SFX.add(whoosh(0.9, 300, 3500, 1.0, 0.6), 22.0, 0.4)
SFX.add(boom(0.6, 1.2), 22.5, 0.5)
SFX.add(bell(m2f(91), 1.6, 0.6), 22.55, 0.5); SREV.add(bell(m2f(91), 1.6, 0.6), 22.55, 0.5)
SFX.add(blip(1200, 1.0, 0.1), 22.9, 0.5); SFX.add(blip(1800, 1.0, 0.1), 22.98, 0.5)
SFX.add(bell(m2f(96), 1.6, 0.7), 22.95, 0.5); SREV.add(bell(m2f(96), 1.6, 0.7), 22.95, 0.5)
SFX.add(whoosh(0.7, 2500, 9500, 0.9, 0.5), 23.55, 0.3)
SFX.add(whoosh(0.7, 2500, 9500, 0.9, 0.5), 24.3, 0.28)
SFX.add(bell(m2f(103), 2.0, 0.6), 23.95, 0.5); SREV.add(bell(m2f(103), 2.0, 0.6), 23.95, 0.5)

# ------------------------------------------------------------------ VOICEOVER
def vo_process(x, sr):
    if sr != SR:
        x = sg.resample_poly(x, SR, sr)
    x = filt(x, "high", 85, 2)
    # gentle presence + de-boom
    sos = sg.butter(2, [2500 / (SR / 2), 5200 / (SR / 2)], btype="band", output="sos")
    x = x + 0.22 * sg.sosfilt(sos, x)
    # soft compression (peak-ish)
    env = np.abs(x)
    env = sg.lfilter([1 - math.exp(-1 / (0.01 * SR))], [1, -math.exp(-1 / (0.01 * SR))], env)
    gain = np.where(env > 0.12, (0.12 / np.maximum(env, 1e-6)) ** 0.55, 1.0)
    x = x * gain
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    return x

vo_env = np.zeros(N)
for name, info in VO.items():
    x, sr = sf.read(f"{VO_DIR}/{name}.wav")
    x = vo_process(x.astype(np.float64), sr)
    t0 = info["start"]
    VOX.add(x, t0, 1.0)
    i = int(t0 * SR)
    seg = np.abs(x)
    vo_env[i:i + len(seg)] = np.maximum(vo_env[i:i + len(seg)], seg)

# ------------------------------------------------------------------ MIX
rev_m = apply_reverb(MREV.b, 2.2, 0.55, seed=3)
rev_s = apply_reverb(SREV.b, 1.6, 0.6, seed=4)
rev_v = apply_reverb(VOX.b, 0.55, 0.12, seed=5, lp=6000, hp=300)

# VO duck envelope (fast attack, slower release)
e = sg.lfilter([1 - math.exp(-1 / (0.04 * SR))], [1, -math.exp(-1 / (0.04 * SR))], vo_env)
e = np.convolve(e, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")
duck = np.clip(e / 0.1, 0, 1)
duck_m = 1 - 0.72 * duck          # music ducks ~ -11 dB under VO
duck_s = 1 - 0.55 * duck

music = (MUS.b + rev_m) * duck_m[:, None]
sfx = (SFX.b + rev_s) * duck_s[:, None]
vox = VOX.b + rev_v

# music: master fade-out at the very end, and a tight cut before the 7.0 freeze impact
t_ax = np.arange(N) / SR
fade = np.clip((DUR - t_ax) / 0.5, 0, 1)
music *= fade[:, None]
sfx *= fade[:, None]
vox *= np.clip((DUR - t_ax) / 0.15, 0, 1)[:, None]

mix = music * 0.36 + sfx * 0.58 + vox * 1.4
# gentle bus compression / limiting
mix = np.tanh(mix * 0.9) / 0.9
mix = filt(mix[:, 0], "high", 28, 2)[:, None] * np.ones((1, 2)) if False else mix
def _rms(a, mask): return 20*np.log10(np.sqrt((a[mask]**2).mean())+1e-9)
for nm, info in VO.items():
    i0=int(info["start"]*SR); i1=i0+int(info["dur"]*SR); mk=slice(i0,i1)
    print("%s  VO %.1f dB | music %.1f dB | sfx %.1f dB (relative, pre-master)" % (nm, _rms(vox*1.4,mk), _rms(music*0.36,mk), _rms(sfx*0.58,mk)))
peak = np.abs(mix).max()
mix = mix / peak * 0.89
sf.write(OUT, mix.astype(np.float32), SR, subtype="PCM_24")
print("wrote", OUT, "peak", float(np.abs(mix).max()))
