import numpy as np, soundfile as sf
from scipy import signal as sg
SR = 48000
DUR = 25.0
N = int(SR * DUR)
rng = np.random.default_rng(42)
VO_DIR = "/tmp/claude-0/-home-user-vwg/fe98d541-57e3-5ba8-942f-33b60d2a6129/scratchpad/vo/"
OUT = "/tmp/claude-0/-home-user-vwg/fe98d541-57e3-5ba8-942f-33b60d2a6129/scratchpad/audio/"
import os; os.makedirs(OUT, exist_ok=True)

def mid(n): return 440.0 * 2 ** ((n - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sg.sosfilt(sg.butter(o, min(f, SR/2-100), 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sg.sosfilt(sg.butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, o=2): return sg.sosfilt(sg.butter(o, [f1, min(f2, SR/2-100)], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def env_exp(d, k): return np.exp(-tt(d) * k)
def saw(f, d, det=0.0):
    t = tt(d); return 2 * ((t * f * (1 + det)) % 1.0) - 1
def sine(f, d): return np.sin(2 * np.pi * f * tt(d))

class Bus:
    def __init__(self): self.L = np.zeros(N); self.R = np.zeros(N)
    def add(self, t0, x, g=1.0, pan=0.0):
        i = int(t0 * SR)
        if i >= N or i + len(x) <= 0: return
        a = max(0, -i); i = max(0, i); x = x[a:]; n = min(len(x), N - i); x = x[:n]
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        self.L[i:i+n] += x * g * l * 1.414; self.R[i:i+n] += x * g * r * 1.414

def make_ir(d=1.8, damp=5000):
    n = int(d * SR); t = np.arange(n) / SR
    irs = []
    for _ in range(2):
        x = rng.standard_normal(n) * np.exp(-t * 3.2)
        x = lp(x, damp, 1); irs.append(x)
    ir = np.stack(irs); ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True)) + 1e-9
    return ir
IR = make_ir()
def reverb(bus, wet=.3):
    wl = sg.fftconvolve(bus.L, IR[0])[:N]; wr = sg.fftconvolve(bus.R, IR[1])[:N]
    return bus.L + wet * wl, bus.R + wet * wr

# ---------------- instruments ----------------
def kick(strong=1.0):
    d = .45; t = tt(d); f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 7.5) + .25 * hp(noise(d), 2000) * np.exp(-t * 90)
    return x * strong
def hat(d=.06, o=False):
    d = .22 if o else d; return hp(noise(d), 7000) * np.exp(-tt(d) * (22 if o else 70)) * .5
def clap():
    x = np.zeros(int(.3 * SR))
    for k, o in enumerate([0, .012, .026]):
        n = bp(noise(.2), 1100, 3500) * np.exp(-tt(.2) * (60 if k < 2 else 22)); i = int(o * SR); x[i:i+len(n)] += n[:len(x)-i]
    return x * .6
def pluck(f, d=.5, bright=1.0):
    x = saw(f, d, .003) + saw(f, d, -.003)
    a = lp(x, 900 * bright + 400); b = lp(x, 4200 * bright + 800)
    t = tt(d); m = np.exp(-t * 14)
    y = a * (1 - m) + b * m
    return y * np.exp(-t * 6) * .5 * np.minimum(1, t * 800)
def bell(f, d=1.4):
    t = tt(d); x = sum(a * np.sin(2*np.pi*f*r*t) * np.exp(-t * k) for r, a, k in [(1, 1, 3.2), (2.76, .45, 5.5), (5.4, .2, 9), (8.9, .1, 14)])
    return x * np.minimum(1, t * 1000) * .5
def pad(freqs, d, att=.6, rel=.6, cut=2200, vol=1.0):
    x = np.zeros(int(d * SR))
    for f in freqs:
        for dt in (-.004, 0, .004): x += saw(f, d, dt) * .12
    x = lp(x, cut, 2); t = tt(d)
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t)) / rel)
    return x * e * vol
def sub(f, d, k=1.2):
    t = tt(d); return np.sin(2*np.pi*f*t) * np.exp(-t * k) * np.minimum(1, t * 200)
def impact(strong=1.0, d=2.6):
    t = tt(d); f = 32 + 90 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    n = lp(noise(d), 3500, 2) * np.exp(-t * 5) * .5
    c = hp(noise(.6), 5000) * np.exp(-tt(.6) * 7) * .25
    x = s + n; x[:len(c)] += c
    return x * strong
def whoosh(d, up=True, lo=300, hi=6000, vol=1.0):
    t = tt(d); p = t / d; p = p if up else p[::-1]
    out = np.zeros_like(t); nz = noise(d)
    # sweep via block-wise filtering
    B = 24; seg = len(t) // B
    for b in range(B):
        c = lo * (hi / lo) ** (b / (B - 1)) if up else hi * (lo / hi) ** (b / (B - 1))
        s0 = b * seg; s1 = len(t) if b == B - 1 else (b + 1) * seg
        out[s0:s1] = bp(nz[s0:s1], c * .7, c * 1.5, 1)
    e = np.sin(np.pi * np.clip((t / d), 0, 1)) ** 1.5
    return out * e * vol * 3
def riser(d, vol=1.0):
    t = tt(d); p = t / d
    f = 200 * (6 ** p) ; tone = np.sin(2*np.pi*np.cumsum(f)/SR) * .25
    n = hp(noise(d), 1500) * (p ** 2) * .5
    return (tone + n) * (p ** 1.6) * vol
def revswell(d, vol=1.0):
    t = tt(d); p = t / d
    return (hp(noise(d), 800) * p ** 3 * .6 + np.sin(2*np.pi*np.cumsum(120 + 500 * p**2)/SR) * .15 * p**2) * vol
def tick(f=2400, d=.03):
    return bp(noise(d), f * .7, f * 1.4, 1) * np.exp(-tt(d) * 120) * 2
def pop(f=560, d=.14):
    t = tt(d); fr = f * (1 + .6 * np.exp(-t * 40)); return np.sin(2*np.pi*np.cumsum(fr)/SR) * np.exp(-t * 28) * .7
def click(): return (hp(noise(.03), 1500) * np.exp(-tt(.03) * 200) * 1.5 + sine(900, .03) * np.exp(-tt(.03) * 150) * .5)
def thud(d=.4): return (lp(noise(d), 500) * .9 + sine(70, d)) * np.exp(-tt(d) * 14)
def ding(t0, bus, g=.6, pan=0): bus.add(t0, bell(1318.5, 1.0), g, pan); bus.add(t0 + .11, bell(1760, 1.2), g * .9, pan)
def chime(t0, bus, f=1046.5, g=.5): bus.add(t0, bell(f, 1.1), g); bus.add(t0 + .09, bell(f * 1.5, 1.1), g * .8)
def swoosh(t0, bus, d=.5, up=True, g=.5, pan=0, lo=300, hi=7000): bus.add(t0, whoosh(d, up, lo, hi), g, pan)

M = Bus(); S = Bus()
BEAT = .5
# chord definitions (midi)
C = lambda *n: [mid(x) for x in n]
chords = {'Am': C(45, 57, 60, 64), 'F': C(41, 53, 57, 60), 'Dm': C(38, 50, 57, 62), 'E': C(40, 52, 56, 59),
          'C': C(48, 55, 60, 64, 67), 'G': C(43, 55, 59, 62), 'Am2': C(45, 57, 60, 64), 'F2': C(41, 53, 57, 60, 65)}
roots = {'Am': 33, 'F': 29, 'Dm': 38 - 12, 'E': 28, 'C': 36, 'G': 31, 'F2': 29}
arpn = {'C': [60, 64, 67, 72, 67, 64, 72, 76], 'G': [59, 62, 67, 71, 67, 62, 71, 74], 'Am': [57, 60, 64, 69, 64, 60, 69, 72], 'F': [57, 60, 65, 69, 65, 60, 69, 72]}

# ================= MUSIC =================
# 0-8 : tension (minor)
sec1 = [(0, 'Am'), (2, 'F'), (4, 'Dm'), (6, 'E')]
for t0, ch in sec1:
    M.add(t0, pad(chords[ch][1:], 2.3, att=.5, rel=.8, cut=1400 + 700 * (t0 / 6), vol=.55 + .08 * t0 / 2), .55, 0)
    M.add(t0, sub(mid(roots[ch] + 12 * 0), 2.0, k=.5), .45)
# opening boom + low drone
M.add(0.0, impact(.55, 1.8), .8)
# heartbeat before freeze
for tb in (.92, 1.12, 1.30):
    M.add(tb, sub(48, .35, 9) * 1.0, .7)
M.add(1.5, impact(1.0, 2.8), 1.0); M.add(2.0, impact(.55, 1.8), .7)
M.add(2.0, bell(mid(81), 1.5), .35); M.add(2.0, bell(mid(69), 1.8), .3)
M.add(2.2, revswell(.8, 1.0), .35)
M.add(2.45, revswell(.55), .5)
# tension ostinato 3..7.75 (8th notes)
t = 3.0; i = 0
pat = [57, 57, 60, 57, 64, 57, 60, 64]
while t < 7.74:
    prog = (t - 3) / 4.75
    nn = pat[i % 8]
    # chord-follow: transpose by section
    sh = {0: 0, 1: -4, 2: -7, 3: -1}.get(int((t - 3) // 1.25) % 4, 0)
    if t >= 6.0: sh = -1 if (int(t * 2) % 2) else 0
    M.add(t, pluck(mid(nn + sh - 12), .24, .6 + prog * 1.5), .5 + .3 * prog, -.15 if i % 2 else .15)
    t += .25; i += 1
# ticking hats, accelerating
t = 3.0
while t < 7.74:
    M.add(t, hat(), .22 + .18 * (t - 3) / 4.7, .3)
    t += .5 if t < 4.5 else (.25 if t < 6.0 else .125)
for tb in np.arange(3.0, 7.75, 1.0): M.add(tb, sub(55, .6, 4), .35)
M.add(6.4, riser(1.35, 1.0), .6)
M.add(7.5, whoosh(.25, True, 800, 9000), .35)
# 7.75-8.0 near silence ; 8.0 impact
M.add(8.0, impact(1.25, 3.0), 1.0)
M.add(8.0, pad(chords['C'], 2.2, att=.05, rel=1.0, cut=1800, vol=.8), .55)
for k, n in enumerate([84, 88, 91, 95]): M.add(8.05 + k * .12, bell(mid(n), 1.8), .22, -.5 + k * .33)
M.add(8.4, revswell(.55), .5)
# 9-22 groove
bars = [(8, 'C'), (10, 'G'), (12, 'Am'), (14, 'F'), (16, 'C'), (18, 'G'), (20, 'Am')]
for t0, ch in bars:
    d = 2.15
    if t0 >= 9:
        pass
    M.add(t0 if t0 > 8 else 8.0, pad(chords[ch if ch in chords else 'C'], d, att=.15, rel=.45, cut=2600 if t0 >= 14 else 1900, vol=.7 if t0 >= 14 else .5), .5)
M.add(21.0, pad(chords['G'], 1.15, att=.05, rel=.2, cut=2800, vol=.7), .5)
for tb in np.arange(9.0, 22.0, BEAT):
    strong = 1.0 if tb >= 13 else .75
    M.add(tb, kick(strong), .75 if tb >= 13 else .6)
    if tb >= 13 and (int(round((tb - 13) / BEAT)) % 2 == 1): M.add(tb, clap(), .42, .1)
    M.add(tb + BEAT / 2, hat(o=(tb >= 13)), .3 if tb >= 13 else .2, .25)
    if tb >= 13: M.add(tb + BEAT / 4, hat(), .12, -.2); M.add(tb + .75 * BEAT, hat(), .12, .2)
# bass line (13-22) + soft pre-bass 9-13
def bar_ch(tb):
    ch = 'C'
    for t0, c in bars + [(21, 'G')]:
        if tb >= t0: ch = c
    return ch
for tb in np.arange(9.0, 22.0, BEAT):
    ch = bar_ch(tb); r = roots[ch] if ch in roots else 36
    on = tb >= 13 or (int(round((tb - 9) / BEAT)) % 2 == 0)
    if on: M.add(tb, sub(mid(r + 12), .42, 4.5) + .3 * lp(saw(mid(r + 12), .42), 400) * np.exp(-tt(.42) * 5), .55 if tb >= 13 else .4)
# arps
for tb in np.arange(9.0, 22.0, .25):
    ch = bar_ch(tb); a = arpn.get(ch, arpn['C']); k = int(round((tb % 2) / .25)) % 8
    gain = .3 if tb < 13 else (.38 if tb < 19 else .42)
    if tb < 9.5: gain *= .6
    M.add(tb, pluck(mid(a[k]), .3, 1.0), gain, -.4 + .8 * (k / 7))
# lead melody (19-22) bell-ish saw
mel = [(19.0, 79, .5), (19.5, 76, .5), (20.0, 74, .5), (20.5, 76, .5), (21.0, 79, .5), (21.5, 83, .5)]
for t0, n, d in mel: M.add(t0, bell(mid(n), 1.0), .38, .1)
M.add(21.0, riser(.95), .45)
# 22: brand hit
M.add(22.0, impact(1.0, 3.0), .75)
fc = C(48, 55, 60, 64, 67, 74)
M.add(22.0, pad(fc, 3.0, att=.05, rel=.5, cut=3000, vol=1.0), .38)
M.add(22.0, pad([x * 2 for x in C(60, 64, 67)], 3.0, att=.05, rel=.5, cut=3800, vol=.6), .16)
for k, n in enumerate([72, 76, 79, 84, 88, 91]): M.add(22.05 + k * .13, bell(mid(n), 1.6), .16, -.5 + k * .2)
M.add(22.0, sub(mid(36), 2.5, 1.0), .55); M.add(23.0, kick(.9), .38); M.add(23.5, kick(.9), .38); M.add(24.0, kick(.8), .34)
M.add(23.0, bell(mid(96), 1.5), .1)

# ================= SFX =================
# Scene 1
S.add(.12, tick(1800), .3)
for tb in (.18, .27, .36): S.add(tb, pop(380, .06), .18)
S.add(.5, pop(640), .6)
ding(.8, S, .55)
S.add(.78, whoosh(.3, False, 400, 4000), .25)
S.add(1.1, sub(60, .5, 6), .5)
S.add(1.5, thud(.5), .6)
S.add(1.5, whoosh(.3, False, 300, 6000), .3)
S.add(2.0, thud(.4), .45)
S.add(2.0, bell(mid(93), 1.2), .18)
swoosh(2.75, S, .5, True, .5, 0, 300, 5000)
# Scene 2: email arrivals
arr = [3.35, 3.78, 4.08, 4.32, 4.52, 4.7, 4.87, 5.02, 5.17, 5.31, 5.45, 5.58]
for i, a in enumerate(arr): S.add(a, pop(480 + 40 * (i % 4), .1), .3 + .02 * i, -.4 + .8 * rng.random())
swoosh(4.52, S, .5, True, .4, .4, 300, 5500)
for a in (4.62, 4.78, 4.94, 5.1, 5.24): S.add(a, tick(1500, .05), .5)
S.add(5.5, thud(.3), .4)
for a in (5.72, 5.95, 6.18): S.add(a, pop(420, .16), .55); S.add(a, whoosh(.25, True, 500, 3500), .2)
S.add(6.4, thud(.45), .75); S.add(6.7, thud(.3), .5)
swoosh(7.0, S, .5, True, .4, 0, 500, 9000)
# Scene 3
swoosh(8.0, S, .85, True, .55, 0, 150, 3000)
S.add(8.82, whoosh(.4, False, 300, 8000), .5)
ding(8.9, S, .45)
for i, a in enumerate([9.3 + .08 * k + .12 + .38 for k in range(7)]): S.add(a, thud(.18) * .8, .45, -.5 + .17 * i); S.add(a, tick(2000), .35, -.5 + .17 * i)
S.add(9.3, whoosh(.9, True, 200, 5000), .35)
for a, f in ((10.55, 1), (11.15, 1), (11.8, 1), (12.4, 1)): swoosh(a, S, .5, True, .45, 0, 300, 6000)
for a, n in ((11.7, 79), (12.3, 83), (12.9, 86)): S.add(a, bell(mid(n), 1.0), .4)
chime(12.85, S, 1318.5, .5)
# Scene 4
swoosh(12.95, S, .5, False, .4, 0, 300, 5000)
swoosh(13.0, S, .6, True, .35, 0, 300, 5000)
t = 13.55
for k in range(48): S.add(t + k * .028, tick(2200 + 300 * rng.random(), .02), .22)
for k in range(24): S.add(13.85 + k * .028, tick(2300 + 200 * rng.random(), .02), .18)
for k in range(30): S.add(14.1 + k * .026, tick(2100 + 200 * rng.random(), .02), .18)
for a, n in ((13.75, 84), (14.55, 86), (15.45, 88), (16.75, 91), (18.25, 93), (18.65, 96)): S.add(a, bell(mid(n), .9), .42); S.add(a, pop(900, .06), .25)
for a in (14.35, 15.4): S.add(a, pop(700), .45)
for a in (15.0, 16.55, 17.95): swoosh(a - .05, S, .5, True, .4, 0, 300, 6000)
for a in (15.15, 15.3, 15.45): S.add(a, tick(1600, .04), .5)
S.add(17.42, click(), .8); S.add(17.48, bell(mid(88), 1.0), .35)
S.add(18.15, thud(.3), .6); S.add(18.55, pop(520), .4)
swoosh(18.8, S, .5, True, .4, 0, 300, 6000)
# Scene 5
for i in range(5): S.add(19.1 + i * .17 + .1, pop(520 + 40 * i, .1), .3)
S.add(20.65, bell(mid(88), .9), .38); S.add(20.95, bell(mid(91), .9), .38)
S.add(20.1, whoosh(.9, True, 800, 4000), .18)
swoosh(21.75, S, .45, True, .35)
# Scene 6
S.add(22.0, whoosh(.9, True, 300, 9000), .5)
S.add(22.45, whoosh(.55, True, 800, 6000), .3)
S.add(22.95, whoosh(.5, True, 400, 5000), .4)
S.add(23.15, bell(mid(84), 1.4), .3)
S.add(23.55, whoosh(.6, True, 2000, 9000), .22)
chime(23.55, S, 1568, .3)

# ================= VOICE =================
voice = np.zeros(N)
lines = [(.95, 'l1'), (3.4, 'l2'), (8.7, 'l3'), (13.2, 'l4'), (19.4, 'l5'), (22.1, 'l6')]
for t0, key in lines:
    x, sr = sf.read(VO_DIR + f"af_heart_{key}.wav")
    if sr != SR:
        x = sg.resample_poly(x, SR, sr)
    x = hp(x, 90, 2)
    x = x / (np.abs(x).max() + 1e-9) * .9
    # gentle compression
    e = np.convolve(np.abs(x), np.ones(480) / 480, 'same')
    g = 1 / np.maximum(1, (e / .18) ** .45); x = x * g
    x = x / (np.abs(x).max() + 1e-9) * .85 * {'l6': 1.22, 'l4': 1.08}.get(key, 1.0)
    i = int(t0 * SR); n = min(len(x), N - i)
    fade = np.minimum(1, np.arange(n) / 200.); x = x[:n] * fade
    voice[i:i+n] += x
print("voice end", [round(t0 + len(sf.read(VO_DIR+f'af_heart_{k}.wav')[0]) / 24000, 2) for t0, k in lines])
# warmth + a little plate reverb
vb = Bus(); vb.L = voice.copy(); vb.R = voice.copy()
vl, vr = reverb(vb, .10)
vL = vl; vR = vr

# ================= MIX =================
from scipy.ndimage import maximum_filter1d
mL, mR = reverb(M, .26); sL, sR = reverb(S, .18)
# voice presence: parallel boost of 2-4.5 kHz so words cut through
pres = bp(voice, 2000, 4500, 1) * .55
voice_p = voice + pres
vb = Bus(); vb.L = voice_p.copy(); vb.R = voice_p.copy()
vL, vR = reverb(vb, .08)
# smooth, held ducking envelope (no pumping between words)
env = maximum_filter1d(np.abs(voice), int(.28 * SR))
env = sg.sosfilt(sg.butter(2, 9, 'low', fs=SR, output='sos'), env)
env = np.clip(env / (np.percentile(env[env > 0], 60) + 1e-9), 0, 1)
def split(x): lo = lp(x, 160, 2); return lo, x - lo
def duck_bus(xl, xr, d_lo, d_hi):
    out = []
    for x in (xl, xr):
        lo, hi = split(x); out.append(lo * (1 - d_lo * env) + hi * (1 - d_hi * env))
    return out
mL, mR = duck_bus(mL, mR, .45, .78)
sL, sR = duck_bus(sL, sR, .55, .82)
MG, SG, VG = .58, .50, 1.55
L = mL * MG + sL * SG + vL * VG
R = mR * MG + sR * SG + vR * VG
mix = np.stack([L, R], 1)
# transparent peak limiter
mix = np.tanh(mix * .8) / np.tanh(.8)
fo = np.ones(N); k = int(.45 * SR); fo[-k:] = np.linspace(1, 0, k) ** 1.5
mix *= fo[:, None]
mix /= max(1e-9, np.abs(mix).max()) / .89
sf.write(OUT + "mix.wav", mix.astype(np.float32), SR, subtype='PCM_24')
# --- measurement: voice vs everything-else, speech band, inside spoken windows ---
bedL = (mL * MG + sL * SG); vc = vL * VG
bed_b = bp(bedL, 200, 4000, 2); vc_b = bp(vc, 200, 4000, 2)
print("voice-vs-bed (dB) per line, 200Hz-4kHz:")
for t0, key in lines:
    d = len(sf.read(VO_DIR + f'af_heart_{key}.wav')[0]) / 24000
    a, b = int(t0 * SR), int((t0 + d) * SR)
    rv = np.sqrt((vc_b[a:b] ** 2).mean()); rb = np.sqrt((bed_b[a:b] ** 2).mean())
    print(f"  {key} {t0:5.2f}-{t0+d:5.2f}s  voice {20*np.log10(rv+1e-9):6.1f}  bed {20*np.log10(rb+1e-9):6.1f}  margin {20*np.log10((rv+1e-9)/(rb+1e-9)):5.1f} dB")
print("peak", np.abs(mix).max())
