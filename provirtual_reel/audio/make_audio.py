"""Original soundtrack + SFX + voiceover mix for the ProVirtual PH reel (20 s, 44.1 kHz stereo).
Everything is synthesized here with numpy/scipy (no licensed samples)."""
import numpy as np, soundfile as sf
from scipy import signal
import os, sys

SR = 44100
DUR = 20.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(11)
HERE = os.path.dirname(os.path.abspath(__file__))

def tt(n): return np.arange(n) / SR
def mid2f(m): return 440.0 * 2 ** ((m - 69) / 12)
def stereo(m, pan=0.0):
    l = np.sqrt(0.5 * (1 - pan)); r = np.sqrt(0.5 * (1 + pan))
    return np.stack([m * l, m * r], 1)
def place(buf, snd, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i >= len(buf): return
    if i < 0:
        snd = snd[-i:]; i = 0
    n = min(len(snd), len(buf) - i)
    buf[i:i + n] += snd[:n] * gain
def lp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, lo, hi, order=2): return signal.sosfilt(signal.butter(order, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)
def ir_reverb(rt=1.8, damp=6000, seed=3):
    r = np.random.default_rng(seed); n = int(SR * rt * 1.2)
    t = tt(n); ir = r.normal(0, 1, (n, 2)) * np.exp(-t * (6.9 / rt))[:, None]
    ir = lp(ir, damp); ir[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum() / 2) * 0.35
def reverb(x, rt=1.8, damp=6000, wet=0.3):
    ir = ir_reverb(rt, damp)
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet * 0.5) + out * wet

# ---------------------------------------------------------------- instruments
def kick(vol=1.0):
    n = int(.42 * SR); t = tt(n)
    f = 45 + 110 * np.exp(-t * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5) + 0.35 * np.sin(ph * 2) * np.exp(-t * 20)
    click = rng.normal(0, 1, n) * np.exp(-t * 400) * 0.15
    return (s + click) * vol
def hat(vol=1.0, dec=70):
    n = int(.12 * SR); t = tt(n)
    return hp(rng.normal(0, 1, n), 7500) * np.exp(-t * dec) * vol
def clap(vol=1.0):
    n = int(.35 * SR); t = tt(n); env = np.zeros(n)
    for o in (0, .011, .023): env += np.exp(-np.maximum(t - o, 0) * 120) * (t >= o) * .7
    env += np.exp(-t * 18) * .5 * (t >= .03)
    return bp(rng.normal(0, 1, n), 900, 3800) * env * vol
def pluck(freq, dur=.35, vol=1.0, bright=1.0):
    n = int(dur * SR); t = tt(n); s = np.zeros(n)
    for h in range(1, 9):
        s += np.sin(2 * np.pi * freq * h * t) / (h ** 1.4) * np.exp(-t * (8 + 5 * h) / bright)
    s += .3 * np.sin(2 * np.pi * freq * 0.5 * t) * np.exp(-t * 14)
    return s * vol
def bass_note(freq, dur, vol=1.0):
    n = int(dur * SR); t = tt(n)
    s = np.sin(2 * np.pi * freq * t) + .35 * np.sin(2 * np.pi * freq * 2 * t) + .12 * np.sin(2 * np.pi * freq * 3 * t)
    env = np.minimum(1, t / .006) * np.exp(-t * 1.6) * np.minimum(1, (dur - t) / .03)
    return lp(s, 600) * env * vol
def pad_chord(freqs, dur):
    n = int(dur * SR + SR * .8); t = tt(n); L = np.zeros(n); R = np.zeros(n)
    for f in freqs:
        for det, side in ((-7, 0), (-2, 0), (3, 1), (8, 1)):
            fr = f * 2 ** (det / 1200)
            ph = rng.uniform(0, 2 * np.pi)
            saw = 2 * ((fr * t + ph / (2 * np.pi)) % 1) - 1
            if side == 0: L += saw
            else: R += saw
    env = np.minimum(1, t / .55) * np.minimum(1, np.maximum(0, (dur + .7 - t)) / .7)
    out = np.stack([L, R], 1) / (len(freqs) * 2.2)
    out = lp(out, 1500) * env[:, None]
    return out
def sweep_noise(dur, f0, f1, shape='bell', vol=1.0, pan_from=0, pan_to=0, bands=14):
    """Noise whose spectral centre glides f0->f1 (exponentially)."""
    n = int(dur * SR); t = tt(n); x = rng.normal(0, 1, (n, 1))
    centres = np.geomspace(min(f0, f1), max(f0, f1), bands)
    out = np.zeros(n)
    for c in centres:
        frac = np.log(c / f0) / np.log(f1 / f0)  # when sweep passes this band (0..1)
        tc = frac * dur
        g = np.exp(-0.5 * ((t - tc) / (dur * .16)) ** 2)
        b = bp(x[:, 0], c / 1.35, min(c * 1.35, SR / 2 - 100), 2)
        out += b * g
    if shape == 'bell': env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    elif shape == 'rise': env = (t / dur) ** 2.2
    else: env = np.exp(-t * 5)
    out = out * env * vol / (bands ** .4)
    pan = np.linspace(pan_from, pan_to, n)
    return np.stack([out * np.sqrt(.5 * (1 - pan)), out * np.sqrt(.5 * (1 + pan))], 1)
def impact(vol=1.0, tail=2.2):
    n = int(tail * SR); t = tt(n)
    f = 38 + 70 * np.exp(-t * 6); ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-t * 2.2)
    hit = lp(rng.normal(0, 1, n), 5000) * np.exp(-t * 10) * .6
    boom = lp(rng.normal(0, 1, n), 380) * np.exp(-t * 3.2) * .7
    s = (sub * 1.1 + hit + boom) * vol
    return stereo(s)
def tick(freq=2400, vol=1.0, dec=90):
    n = int(.08 * SR); t = tt(n)
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t * dec) + .4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * dec * 1.4)
    return s * vol
def pop(freq=700, vol=1.0):
    n = int(.14 * SR); t = tt(n); f = freq * (1 + 1.2 * np.exp(-t * 55))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 28) * vol
def thud(vol=1.0, f0=95):
    n = int(.3 * SR); t = tt(n); f = f0 * np.exp(-t * 12) + 38
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 14) + .25 * lp(rng.normal(0, 1, n), 900) * np.exp(-t * 40)) * vol
def bell(freq, vol=1.0, dur=1.2):
    n = int(dur * SR); t = tt(n); s = np.zeros(n)
    for r, a, d in ((1, 1, 3.2), (2.76, .5, 5), (5.4, .25, 8), (8.9, .12, 11)):
        s += a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t * d)
    return s * vol
def sparkle(vol=1.0, base=1800):
    out = np.zeros(int(.7 * SR))
    for i, m in enumerate([0, 4, 7, 12, 16]):
        sn = bell(base * 2 ** (m / 12), .35, .5); out[int(i * .045 * SR):int(i * .045 * SR) + len(sn)] += sn[:len(out) - int(i * .045 * SR)]
    return out * vol

# ---------------------------------------------------------------- music bed
chords = [  # (start, end, bass midi, pad freqs, arp midi list)
    (0.0, 3.0, 45, [57, 60, 64], [69, 72, 76]),     # Am
    (3.0, 7.0, 41, [53, 57, 60], [65, 69, 72]),     # F
    (7.0, 11.0, 48, [60, 64, 67], [67, 72, 76]),    # C
    (11.0, 15.0, 43, [55, 59, 62], [67, 71, 74]),   # G
    (15.0, 17.0, 45, [57, 60, 64], [69, 72, 76]),   # Am (lift)
    (17.0, 19.0, 41, [53, 57, 60, 64], [65, 69, 72]),  # Fmaj7
    (19.0, 20.6, 48, [55, 60, 64, 67], [67, 72, 76]),  # C
]
music = np.zeros((N, 2))
kick_times = [i * BEAT for i in range(int(DUR / BEAT))]
# kick (every beat). light at very start, stronger later
kb = np.zeros((N, 2))
for k in kick_times:
    v = 1.0 if k < 19.4 else 0.0
    place(kb, stereo(kick(.95)), k, v)
# bass: root on beats 1, "and" of 2, 4 ; octave bounce
bs = np.zeros((N, 2))
for (a, b, bm, _, _) in chords:
    t0 = a
    while t0 < b - .05:
        pos = round(((t0 - a) / BEAT * 2)) % 8
        if pos in (0, 3, 6, 7):
            f = mid2f(bm + (12 if pos == 7 else 0))
            place(bs, stereo(bass_note(f, BEAT * (0.9 if pos == 3 else .45), .8)), t0)
        t0 += BEAT / 2
# pad
pd = np.zeros((N, 2))
for (a, b, bm, pf, _) in chords:
    fr = [mid2f(m) for m in pf]
    place(pd, pad_chord(fr, b - a), a - .05, .5)
# arp (16ths) from 3.0
ar = np.zeros((N, 2))
pat = [0, 1, 2, 1, 2, 1, 0, 1, 2, 1, 2, 3, 2, 1, 0, 1]
for (a, b, bm, _, am) in chords:
    if b <= 3.0: continue
    notes = am + [am[0] + 12]
    t0 = max(a, 3.0); idx0 = int(round((t0 - a) / (BEAT / 4)))
    i = idx0
    while a + i * BEAT / 4 < b - .02:
        tn = a + i * BEAT / 4
        if tn >= 3.0:
            m = notes[pat[i % 16] % 4]
            vel = (.55 + .25 * ((i % 4) == 0)) * min(1, (tn - 3.0) / .6 + .5)
            place(ar, stereo(pluck(mid2f(m), .32, vel), pan=-.25 if i % 2 else .25), tn)
        i += 1
# hats / clap
hh = np.zeros((N, 2)); cl = np.zeros((N, 2))
for i in range(int(DUR / (BEAT / 2))):
    tn = i * BEAT / 2
    if tn >= 3.0 and (i % 2 == 1): place(hh, stereo(hat(.35), pan=.2), tn)
    if tn >= 3.0 and (i % 4 == 2 or (i % 8 == 7 and tn > 7)) is False: pass
    if tn >= 7.0 and (i % 4 == 2): place(cl, stereo(clap(.5)), tn)
    if tn >= 3.0 and tn < 7.0 and (i % 8 == 4): place(cl, stereo(clap(.32)), tn)
    if tn >= 15.0 and (i % 2 == 0): place(hh, stereo(hat(.22, 110), pan=-.2), tn + BEAT / 4)
# sidechain from kick
env = np.ones(N)
for k in kick_times:
    i0 = int(k * SR); n = int(.28 * SR)
    seg = 1 - .55 * np.exp(-tt(n) / .09)
    env[i0:i0 + n] = np.minimum(env[i0:i0 + n], seg[:max(0, min(n, N - i0))]) if i0 < N else env[i0:i0 + n]
pd = reverb(pd, 2.2, 5000, .35) * env[:, None]
ar_wet = np.zeros_like(ar)
# ping-pong delay for arp
dl = int(.375 * SR)
for rep, g in enumerate((.42, .22, .11), 1):
    sh = np.roll(ar, dl * rep, axis=0)[:, ::-1] * g; sh[:dl * rep] = 0; ar_wet += lp(sh, 4500)
ar = reverb(ar + ar_wet, 1.4, 6000, .22) * (0.55 + 0.45 * env)[:, None]
bs = bs * env[:, None]
# section gain automation
def auto(points):
    ts = [p[0] for p in points]; gs = [p[1] for p in points]
    return np.interp(tt(N), ts, gs)
g_kick = auto([(0, 0.9), (2.9, 1.0), (3.0, 0.0), (3.02, 1.0), (16.93, 1.0), (17.0, 0), (17.02, 1.0), (19.3, 1.0), (19.45, 0.0)])
g_bass = auto([(0, .0), (.4, .8), (2.9, .9), (3.0, 0.), (3.05, 1.0), (19.2, 1.0), (19.5, .0)])
g_pad = auto([(0, .25), (3, .35), (7, .55), (15, .7), (17, 1.0), (19.4, 1.0), (20, .8)])
g_arp = auto([(0, 0), (2.99, 0), (3.0, .55), (7, .8), (15, .9), (17, 1.0), (19.5, .7), (20, .3)])
g_hat = auto([(0, 0), (3, .8), (20, 1)])
duck_hits = auto([(0, 1), (2.9, 1), (2.97, .0), (3.0, 1), (16.9, 1), (16.97, .0), (17.0, 1), (20, 1)])
music = (kb * g_kick[:, None] * 1.0 + bs * g_bass[:, None] * 1.0 + pd * g_pad[:, None] * 0.9 +
         ar * g_arp[:, None] * 0.75 + hh * g_hat[:, None] * 0.9 + cl * 0.75) * duck_hits[:, None]
# final chord ring-out fade
music *= auto([(0, 1), (19.55, 1), (20, .55)])[:, None]

# ---------------------------------------------------------------- SFX
sfx = np.zeros((N, 2))
def S(snd, t0, g=1.0):
    if snd.ndim == 1: snd = stereo(snd)
    place(sfx, snd, t0, g)
# hits
S(impact(1.0, 2.4), 0.0, .55)
S(sweep_noise(.9, 400, 7000, 'bell', 1.0, -.6, .6), 1.0, .7)            # flip sweep
S(tick(1500, 1, 60), 1.30, .5); S(tick(1700, 1, 60), 1.45, .5); S(tick(1900, 1, 60), 1.60, .5)
S(sweep_noise(1.05, 180, 9000, 'rise', 1.0, -.2, .2), 1.95, .95)       # riser into transition 1
S(impact(1.0, 2.6), 3.0, 1.0)
S(sweep_noise(.7, 5000, 500, 'bell', 1.0, .6, -.6), 3.05, .6)
for t0, f in [(3.35, 1800), (3.45, 1500), (3.6, 2000), (3.7, 1600), (3.83, 1750), (3.96, 1900), (4.2, 2100), (4.35, 1700), (4.5, 1600), (4.64, 1750), (4.78, 1900), (5.0, 1300)]:
    S(tick(f, 1, 70), t0, .55)
S(pop(520, 1), 4.55, .6)
S(sweep_noise(.5, 600, 5000, 'bell', 1, .5, -.5), 5.25, .35)          # glare sweep
S(sweep_noise(.8, 300, 6500, 'bell', 1, -.7, .7), 5.75, .8)            # desktop -> phone
S(thud(1.0, 80), 6.35, .6); S(sparkle(1, 2000), 6.4, .25)
S(sweep_noise(.55, 400, 9000, 'rise', 1.0, 0, 0), 6.55, .7)
S(impact(.7, 1.6), 7.0, .55)
S(sweep_noise(.5, 6000, 600, 'bell', 1.0, .5, -.5), 7.0, .6)
for t0 in (8.0, 8.75, 9.1, 9.55, 10.1):
    S(thud(.8, 140), t0, .4); S(tick(900, 1, 55), t0, .35)
for a, b in ((8.8, 9.05), (9.15, 9.5), (9.6, 9.95)):
    t0 = a
    while t0 < b:
        S(tick(rng.uniform(1100, 2600), 1, rng.uniform(110, 170)), t0, .22); t0 += rng.uniform(.028, .045)
S(sparkle(1, 1500), 10.32, .55)
S(bell(1320, 1, 1.4), 10.45, .35); S(bell(1760, 1, 1.4), 10.58, .3)
S(sweep_noise(.7, 300, 8000, 'bell', 1, -.8, .8), 10.9, .95)
for i, t0 in enumerate((11.15, 11.35, 11.55, 11.75)):
    S(thud(1.0, 110 - 8 * i), t0, .55); S(sweep_noise(.35, 700, 3500, 'bell', 1, -.4, .4), t0 - .15, .35)
for i in range(4):
    S(pop(600 + 90 * i, 1), 12.0 + i * 0.28, .35)
S(bell(1568, 1, 1.2), 12.0, .2); S(bell(1568, 1, 1.2), 14.8, .2)
S(sweep_noise(1.0, 300, 8000, 'rise', 1, -.3, .3), 13.9, .6)
S(sweep_noise(.8, 400, 7000, 'bell', 1, -.9, .9), 14.7, .9)
S(impact(.7, 1.6), 15.0, .5)
for t0, f in [(15.05, 520), (15.5, 600), (15.95, 700)]:
    S(pop(f, 1), t0, .7); S(sparkle(1, 2200), t0 + .05, .22)
S(sweep_noise(.55, 500, 8000, 'rise', 1, 0, 0), 15.9, .6)
S(impact(.8, 1.8), 16.45, .6)
S(sweep_noise(.7, 6500, 400, 'bell', 1, .8, -.8), 16.55, .6)
S(sweep_noise(.65, 200, 9500, 'rise', 1.0, -.2, .2), 16.4, .9)
S(impact(1.0, 3.0), 17.0, 1.0)
S(sweep_noise(.9, 5000, 400, 'bell', 1, .7, -.7), 17.02, .7)
for i, t0 in enumerate((17.1, 17.23, 17.36)):
    S(sweep_noise(.28, 800, 5000, 'bell', 1, -.3 + i * .3, .3 - i * .3), t0 - .05, .35)
for i in range(13):
    S(tick(1400 + 90 * i, 1, 75), 17.62 + i * .028, .32)
S(pop(560, 1), 17.78, .6); S(sparkle(1, 1700), 17.85, .35)
S(sparkle(1, 2400), 17.97, .3)
S(sweep_noise(.5, 1500, 9000, 'bell', 1, -.7, .7), 18.72, .35); S(sweep_noise(.5, 1500, 9000, 'bell', 1, .7, -.7), 19.52, .3)
S(bell(1046.5, 1, 2.0), 17.05, .22); S(bell(1318.5, 1, 2.0), 17.12, .16)
sfx = reverb(sfx, 1.2, 7000, .18)

# ---------------------------------------------------------------- voiceover
def load_vo(name, tempo=1.0, gain=1.0):
    x, sr = sf.read(os.path.join(HERE, 'vo', name + '.wav'))
    if x.ndim > 1: x = x.mean(1)
    from scipy.signal import resample_poly
    x = resample_poly(x, SR, sr)
    if tempo != 1.0:  # simple phase-vocoder-free time compression via WSOLA-lite using ffmpeg would be better; use resampling-preserving-pitch approx
        import subprocess, tempfile
        tmp = tempfile.mktemp(suffix='.wav'); out = tempfile.mktemp(suffix='.wav')
        sf.write(tmp, x, SR)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-filter:a', f'atempo={tempo}', out], check=True)
        x, _ = sf.read(out); os.remove(tmp); os.remove(out)
    # clean-up EQ + gentle compression
    x = hp(x, 90)
    x = np.tanh(x * 1.6) / np.tanh(1.6)
    x = x / (np.abs(x).max() + 1e-9)
    return x * gain
vo_plan = [('l1', .22, 1.0), ('l2', 3.42, 1.0), ('l3', 7.32, 1.0), ('l4', 11.3, 1.0), ('l5', 14.82, 1.08), ('l6', 17.28, 1.04), ('l7', 18.92, 1.06)]
vo = np.zeros(N); vo_ranges = []
for name, t0, tempo in vo_plan:
    x = load_vo(name, tempo)
    place(vo.reshape(-1, 1), x.reshape(-1, 1), t0, 1.0) if False else None
    i = int(t0 * SR); n = min(len(x), N - i)
    vo[i:i + n] += x[:n]; vo_ranges.append((t0, t0 + len(x) / SR))
    print(f'VO {name}: {t0:.2f} -> {t0 + len(x) / SR:.2f}s')
vo_st = np.stack([vo, vo], 1)
vo_wet = reverb(vo_st, 0.9, 5000, .14)
# ducking envelope
env_vo = np.abs(vo); env_vo = signal.sosfilt(signal.butter(2, 8, 'low', fs=SR, output='sos'), env_vo)
env_vo = np.clip(env_vo / (np.percentile(env_vo, 95) + 1e-9), 0, 1)
duck = 1 - .62 * env_vo
duck = signal.sosfilt(signal.butter(1, 4, 'low', fs=SR, output='sos'), duck)

# ---------------------------------------------------------------- mix
mix = music * 0.36 * duck[:, None] + sfx * 0.62 * (1 - .3 * env_vo)[:, None] + vo_wet * 1.2
# diagnostics: level of each stem inside voiceover windows
def rms_db(x,rs):
    v=np.concatenate([x[int(a*SR):int(b*SR)] for a,b in rs]); return 20*np.log10(np.sqrt((v**2).mean())+1e-9)
_m=music*0.36*duck[:,None]; _s=sfx*0.62*(1-.3*env_vo)[:,None]; _v=vo_wet*1.2
print('in-VO windows  voice %.1f dB | music %.1f dB | sfx %.1f dB'%(rms_db(_v,vo_ranges),rms_db(_m,vo_ranges),rms_db(_s,vo_ranges)))
# gentle master: highpass + soft limiter
mix = hp(mix, 30)
pk = np.abs(mix).max(); print('peak before', pk)
mix = np.tanh(mix * 1.25 / max(pk, 1e-6) * 0.9) / np.tanh(1.25 * .9) * 0.9
# end fade
fade = np.ones(N); fi = int(.12 * SR); fade[-fi:] = np.linspace(1, 0, fi); mix *= fade[:, None]
sf.write(os.path.join(HERE, 'mix_raw.wav'), mix.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'vo_only.wav'), vo_wet.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'music_only.wav'), (music * 0.5).astype(np.float32), SR)
print('done; rms dBFS', 20 * np.log10(np.sqrt((mix ** 2).mean())))
