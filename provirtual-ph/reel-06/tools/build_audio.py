#!/usr/bin/env python3
"""ProVirtual PH Reel 06 - audio builder.
Original music + sound design are synthesised here with numpy/scipy (no samples, no licensed material).
Voiceover is generated with the open-source RHVoice 'Clb' English voice.
Timing comes from src/cues.json and out/events.json (written by the renderer), so audio and picture share one clock.
Usage: build_audio.py <events.json> <outdir>
"""
import json, os, subprocess, sys, math
import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
CUES = json.load(open(os.path.join(HERE, '../src/cues.json')))
EV = json.load(open(sys.argv[1]))
OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SR = 44100; DUR = CUES['end']; N = int(SR * DUR)
rng = np.random.default_rng(606)
BPM = 120; BEAT = 60 / BPM

# ---------------------------------------------------------------- helpers
class Bus:
    def __init__(s): s.l = np.zeros(N); s.r = np.zeros(N)
def put(bus, x, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(x) <= 0: return
    a = max(0, -i); x = x[a:]; i = max(0, i); x = x[:N - i]
    th = (pan + 1) * math.pi / 4
    bus.l[i:i + len(x)] += x * g * math.cos(th) * 1.414
    bus.r[i:i + len(x)] += x * g * math.sin(th) * 1.414
def tt(d): return np.arange(int(d * SR)) / SR
def env_exp(d, k): return np.exp(-tt(d) * k)
def noise(d): return rng.standard_normal(int(d * SR))
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, min(fc, SR / 2 - 100), 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, o=2): return signal.sosfilt(signal.butter(o, [f1, min(f2, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def svf(x, fc, damp=0.25, mode='bp'):
    out = np.zeros(len(x)); low = band = 0.0
    f = 2 * np.sin(np.pi * np.clip(fc, 30, 9000) / SR)
    for i in range(len(x)):
        low += f[i] * band; high = x[i] - low - damp * band; band += f[i] * high
        out[i] = band if mode == 'bp' else (low if mode == 'lp' else high)
    return out
def sweep_noise(d, f0, f1, damp=0.3, mode='bp', curve=1.0):
    k = np.linspace(0, 1, int(d * SR)) ** curve
    fc = f0 * (f1 / f0) ** k
    y = svf(noise(d), fc, damp, mode); return y / (np.max(np.abs(y)) + 1e-9)
def fade(x, a=0.005, b=0.01):
    x = x.copy(); na = int(a * SR); nb = int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
def reverb(l, r, rt=1.8, wet=0.25, pre=0.012):
    n = int(rt * SR); t = np.arange(n) / SR
    outs = []
    for x in (l, r):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / rt); ir = lp(ir, 5500); ir[:int(pre * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        outs.append(signal.fftconvolve(x, ir)[:N])
    return l * (1 - wet * .5) + outs[0] * wet, r * (1 - wet * .5) + outs[1] * wet

# ---------------------------------------------------------------- instruments
def kick(vol=1.0, big=False):
    d = 0.9 if big else 0.42; t = tt(d)
    f = 48 + (170 if big else 130) * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * (4.2 if big else 9)) + 0.25 * np.sin(ph * 2) * np.exp(-t * 20)
    y += 0.35 * hp(noise(d), 2500) * np.exp(-t * 90)
    return np.tanh(y * 1.6) * vol
def snare(vol=1.0):
    d = .3; t = tt(d); y = bp(noise(d), 1400, 6500) * np.exp(-t * 17) + 0.6 * np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25)
    return y * vol * 0.8
def clap(vol=1.0):
    d = .32; t = tt(d); n = bp(noise(d), 900, 4500)
    e = np.exp(-t * 18) + 0.8 * np.exp(-((t - .012) * 200) ** 2) + 0.6 * np.exp(-((t - .024) * 200) ** 2)
    return n * e * vol * 0.7
def hat(vol=1.0, open_=False):
    d = .16 if open_ else .05; return hp(noise(d), 7500) * np.exp(-tt(d) * (22 if open_ else 80)) * vol * 0.45
def boom(d=1.8, f0=70, f1=28, vol=1.0):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 3); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 1.9) + 0.4 * lp(noise(d), 300) * np.exp(-t * 3)
    return np.tanh(y * 1.4) * vol
def saw_voice(f, d, det=0.0, harm=1):
    t = tt(d); return signal.sawtooth(2 * np.pi * f * (1 + det) * t + rng.uniform(0, 6.28))
def pluck(f, d=.4, bright=3500, vol=1.0):
    t = tt(d); y = 0.6 * signal.sawtooth(2 * np.pi * f * t) + 0.4 * signal.square(2 * np.pi * f * 1.003 * t)
    y = lp(y, bright) * np.exp(-t * 11); return fade(y, .002, .02) * vol
def bell(f, d=1.8, vol=1.0):
    t = tt(d); y = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4) + .3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 7)
    return y * np.exp(-t * 2.6) * vol * 0.5
def bass_note(f, d=.22, vol=1.0):
    t = tt(d); y = lp(signal.sawtooth(2 * np.pi * f * t), 520) + np.sin(2 * np.pi * f * t)
    return fade(np.tanh(y * 1.1) * np.exp(-t * 5) * vol, .003, .03) * 0.6
def tick(f=2200, vol=1.0, d=.035):
    t = tt(d); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 120) + .4 * hp(noise(d), 3000) * np.exp(-t * 200)) * vol
def whoosh(d, f0, f1, vol=1.0, curve=1.0):
    y = sweep_noise(d, f0, f1, .35, 'bp', curve); n = len(y); e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return y * e * vol

# ---------------------------------------------------------------- score
CH = {'Cm': [48, 55, 60, 63], 'Ab': [44, 51, 56, 60], 'Fm': [41, 48, 56, 60], 'G': [43, 50, 55, 59, 65],
      'Eb': [51, 58, 63, 67], 'Bb': [46, 53, 58, 62], 'C': [48, 55, 60, 64, 67, 74]}
ROOT = {'Cm': 36, 'Ab': 32, 'Fm': 29, 'G': 31, 'Eb': 39, 'Bb': 34, 'C': 36}
SEG = [(0, 3, 'Cm'), (3, 5, 'Cm'), (5, 7, 'Ab'), (7, 9, 'Ab'), (9, 11, 'Fm'), (11, 13, 'G'), (13, 15, 'Cm'), (15, 17, 'Ab'),
       (17, 19, 'Eb'), (19, 21, 'Bb'), (21, 22, 'G'), (22, 25.0, 'C')]
PADG = lambda a: (0.30 if a < 3 else 0.22 if a < 7 else 0.62 if a < 13 else 0.45 if a < 18 else 0.6 if a < 22 else 0.85)

drums = Bus(); tonal = Bus(); fxb = Bus()
S = lambda b, x, t, g=1, p=0: put(b, x, t, g, p)

# --- kicks
K = {}
def add_kick(t, v=1.0, big=False): K[round(t, 3)] = (v, big)
add_kick(0.0, 1.0, True)
for t in (1.0, 1.5, 2.0, 2.5): add_kick(t, .6)
for k in range(int((6.5 - 3.0) / BEAT) + 1): add_kick(3.0 + k * BEAT, .85)
add_kick(7.0, 1.0, True)
for t in (10.0, 11.0, 12.0, 12.5): add_kick(t, .6 + .2 * (t > 11.5))
for k in range(int((20.5 - 13.0) / BEAT) + 1): add_kick(13.0 + k * BEAT, 1.0 if k else 1.1)
add_kick(3.0, 1.1, True); add_kick(13.0, 1.1, True); add_kick(21.0, 1.0, True); add_kick(22.0, 1.0, True)
for t, (v, b) in K.items(): S(drums, kick(v, b), t, .95)
# --- hats / claps / snares
for k in range(int(3.5 / .125)): S(drums, hat(.55 + .35 * (k % 2 == 0) + .2 * (k / 28)), 3.0 + k * .125, 1, .2 * (-1) ** k)
for k in range(2): S(drums, hat(.5, True), 6.75 + k * .25, 1)
for k in range(int(8.5 / .25)):
    t = 13.0 + .25 + k * .5
    if t < 21.0: S(drums, hat(.8, k % 4 == 3), t, .8, .25 * (-1) ** k)
for k in range(int(7.5 / .5)):
    t = 13.5 + k * 1.0
    if t < 20.6: S(drums, clap(.95), t, 1)
for k in range(int(8.0 / .125)):
    t = 13.0 + k * .125
    if t < 21.0 and k % 2 == 1: S(drums, hat(.28), t, .6, .3 * (-1) ** k)
for i, t in enumerate(np.arange(6.0, 6.99, .125)): S(drums, snare(.45 + .5 * (i / 8)), t, .9)
for i, t in enumerate(np.arange(12.5, 12.99, .0625)): S(drums, snare(.35 + .65 * (i / 8)), t, .9)
for t in (1.0, 5.2): pass
# --- impacts (boom layers)
for t, g in ((0.0, 1.0), (CUES['s2'], .95), (CUES['s3'], 1.1), (CUES['converge'], 1.0), (CUES['s6'], .8)): S(fxb, boom(2.4, 78, 30, 1), t, g)
S(fxb, boom(1.4, 60, 32, .7), CUES['s4'], .6)
# --- bass
def bass_at(a, b, step, pat=None):
    for s0, s1, ch in SEG:
        lo, hi = max(a, s0), min(b, s1)
        if lo >= hi: continue
        f = midi(ROOT[ch] + 12); t = lo
        while t < hi - 1e-6:
            S(tonal, bass_note(f, step * .85, .9), t, .8); t += step
bass_at(3.0, 6.75, .25); bass_at(13.0, 21.0, .25)
for t in np.arange(0.0, 3.0, BEAT): S(tonal, bass_note(midi(36), .45, .9), t, .7)
for s0, s1, ch in SEG:
    if 7 <= s0 < 13: S(tonal, fade(lp(signal.sawtooth(2 * np.pi * midi(ROOT[ch]) * tt(s1 - s0)), 300) * 0.9, 0.5, 0.4), s0, .35)
for t in np.arange(10.0, 13.0, .5): S(tonal, bass_note(midi(ROOT['G' if t >= 11 else 'Fm'] + 12), .3, .9), t, .55)
S(tonal, fade(lp(signal.sawtooth(2 * np.pi * midi(36) * tt(3.0)), 400) + np.sin(2 * np.pi * midi(36) * tt(3.0)), .02, 1.2) * np.exp(-tt(3.0) * .5), 22.0, .85)
# --- pads
for s0, s1, ch in SEG:
    d = (s1 - s0) + 0.9
    mix = np.zeros(int(d * SR))
    for n in CH[ch]:
        for det in (-.004, 0, .004): mix += saw_voice(midi(n), d, det) * (0.5 if n < 50 else 0.35)
    mix = lp(mix, 1500 if s0 < 7 else 2600, 2) / 5
    a = 0.9 if s0 >= 7 else 0.4
    e = np.ones(len(mix)); na = int(a * SR); nb = int(.8 * SR)
    e[:na] = np.linspace(0, 1, na) ** 1.5; e[-nb:] = np.linspace(1, 0, nb)
    S(tonal, mix * e, s0 - (0.15 if s0 > 0 else 0), PADG(s0) * .8, 0)
# --- arps / plucks
def arp(a, b, step, octave, vol, pat, bright):
    t = a; k = 0
    while t < b - 1e-6:
        ch = next(c for s0, s1, c in SEG if s0 <= t < s1)
        notes = [n + octave for n in CH[ch][:4]]; n = notes[pat[k % len(pat)] % len(notes)]
        S(tonal, pluck(midi(n), .35, bright(t), vol * (1 if k % 4 == 0 else .75)), t, .6, math.sin(k * .9) * .4); t += step; k += 1
arp(3.0, 6.75, .125, 12, .55, [0, 2, 1, 3, 2, 1, 3, 2], lambda t: 1200 + 3200 * (t - 3) / 3.7)
arp(13.0, 18.0, .25, 12, .6, [0, 1, 2, 3, 2, 1], lambda t: 2600)
arp(18.0, 21.0, .125, 24, .5, [0, 2, 1, 3, 2, 3, 1, 2], lambda t: 3500)
arp(7.5, 13.0, .5, 12, .45, [0, 2, 1, 3], lambda t: 1800)
# --- final resolution + bell sparkle
for i, n in enumerate((72, 76, 79, 84, 88, 91)): S(fxb, bell(midi(n), 2.6, .9 - i * .08), 22.0 + i * .11, .7, (-1) ** i * .35)
for i, n in enumerate((79, 84, 88, 91, 96)): S(fxb, bell(midi(n), 2.0, .6), 23.0 + i * .09, .55, (-1) ** i * .3)
S(fxb, bell(midi(96), 2.4, 1.0), CUES['cta'], .8)
S(fxb, bell(midi(84), 2.4, .9), CUES['cta'] + .02, .7)

# --- sound effects
# opening
S(fxb, whoosh(.5, 400, 7000, 1), -0.05 + .0, 0)
S(fxb, boom(.5, 120, 45, .8), CUES['slam2'], .8)
S(fxb, whoosh(.55, 600, 9000, .7), CUES['goldReveal'] - .1, .7)
for i in range(7): S(fxb, tick(2400 + i * 330, .5), CUES['goldReveal'] + .1 + i * .05, .5, (-1) ** i * .5)
S(fxb, boom(.6, 100, 40, .6), CUES['qPop'], .6)
S(fxb, whoosh(.9, 300, 6000, .8, 2.0), CUES['winUp'] - .15, .7)
S(fxb, sweep_noise(.75, 500, 9000, .3, 'bp', 2.0) * np.linspace(0, 1, int(.75 * SR)) ** 2, 2.25, .6)
n_keys = 17
for i in range(n_keys):
    t = CUES['typeA'] + i * (CUES['typeB'] - CUES['typeA']) / n_keys
    S(fxb, tick(1500 + 700 * rng.random(), .75, .03), t, .55, rng.uniform(-.2, .2))
# problem scene
for tw in (CUES['whip1'], CUES['whip2']): S(fxb, whoosh(.45, 700, 5500, 1, 1.0), tw - .22, .9)
for tc in (CUES['cap2a'], CUES['cap2b']):
    S(fxb, boom(.5, 130, 50, .7), tc, .7); S(fxb, bp(noise(.18), 1500, 6000) * env_exp(.18, 25), tc, .7)
S(fxb, sweep_noise(1.0, 300, 8000, .3, 'bp', 2.5) * np.linspace(0, 1, SR) ** 2, CUES['slow'] - 1.0, .9)    # reverse-riser into the slow-down
S(fxb, np.sin(2 * np.pi * (260 * np.exp(-tt(1.3) * 1.6)) * tt(1.3)) * np.exp(-tt(1.3) * 2.5), CUES['slow'], .5)  # pitch-down 'time slows'
# scene 3: three scan sweeps + dismiss ticks + dings
for (a, b), up in ((CUES['sweep1'], True), (CUES['sweep2'], False), (CUES['sweep3'], True)):
    S(fxb, whoosh(b - a, 500 if up else 6000, 6000 if up else 500, .6), a, .55)
for t in EV['dismiss']:
    S(fxb, tick(900 + 1300 * rng.random(), .35, .05), t, .35, rng.uniform(-.6, .6))
for i, t in enumerate(EV['ding']):
    n = (84, 86, 88, 91, 93, 96)[min(i, 5)]
    S(fxb, bell(midi(n), 1.4, .85), t, .6, rng.uniform(-.4, .4))
S(fxb, whoosh(.7, 400, 4500, .8), CUES['gridIn'] - .05, .7)
for k in range(6): S(fxb, boom(.25, 150, 70, .4), CUES['gridIn'] + .35 + k * .075, .35)
S(fxb, whoosh(.55, 800, 6500, .9, 1.3), CUES['s4'] - .15, .8)
# scene 4 (CRM)
for t in EV['rowPop']: S(fxb, tick(1100, .8, .05), t, .5)
for t in EV['noteKeys']: S(fxb, tick(2600 + rng.random() * 800, .22, .02), t, .3, rng.uniform(-.5, .5))
for t in EV['qualFlip']: S(fxb, bell(midi(88), .7, .5), t, .5, rng.uniform(-.3, .3)); S(fxb, tick(3200, .5), t, .5)
S(fxb, whoosh(.7, 600, 5000, .8, 1.0), CUES['sort'] - .05, .65)
for t in EV['prepFlip']: S(fxb, bell(midi(79), .9, .5), t, .45, rng.uniform(-.3, .3))
for i, n in enumerate((79, 84, 88, 91)): S(fxb, bell(midi(n), 1.8, .8), CUES['done'] + i * .07, .65)
# scene 5
for i, tp in enumerate(CUES['panels']):
    S(fxb, whoosh(.5, 300, 5200, .9, 1.4), tp - .4, .8 * (-1) ** i if False else .8, (-1) ** (i + 1) * .5)
    S(fxb, boom(.45, 140, 55, .8), tp, .6); S(fxb, tick(1900, 1, .06), tp + .02, .6)
S(fxb, sweep_noise(.85, 400, 11000, .25, 'bp', 2.2) * np.linspace(0, 1, int(.85 * SR)) ** 2, CUES['converge'] - .85, .9)
for j in range(12): S(fxb, tick(2800 + 150 * j, .5, .04), CUES['wordmark'] + j * .032, .4, (-1) ** j * .3)
S(fxb, bell(midi(91), 2.5, 1), CUES['wordmark'] + .3, .6)
S(fxb, boom(.8, 100, 40, .8), CUES['headline'], .7)
S(fxb, whoosh(.5, 500, 7000, .8), CUES['headline'] - .05, .6)
S(fxb, whoosh(.45, 500, 6000, .6), CUES['cta'] - .25, .5)

# ---------------------------------------------------------------- voice-over
vo_dir = os.path.join(OUT, 'vo'); os.makedirs(vo_dir, exist_ok=True)
WIN_END = [3.38, 7.08, 13.05, 17.95, 22.2, 24.75]
vo = Bus(); vo_env = np.zeros(N); vo_report = []
for i, v in enumerate(CUES['vo']):
    raw = os.path.join(vo_dir, f'v{i + 1}_raw.wav'); fin = os.path.join(vo_dir, f'v{i + 1}.wav')
    subprocess.run(['RHVoice-test', '-p', 'clb', '-r', str(v['rate']), '-o', raw], input=v['text'].encode(), check=True, stderr=subprocess.DEVNULL)
    def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
    chain = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,'
             'highpass=f=90,equalizer=f=220:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.1:g=3.5,equalizer=f=7500:t=q:w=1:g=2.5,'
             'acompressor=threshold=-22dB:ratio=3:attack=4:release=90:makeup=3,aresample=44100')
    tmp = os.path.join(vo_dir, f'v{i + 1}_t.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', chain, tmp], check=True)
    d = dur(tmp); room = WIN_END[i] - v['start']; tempo = 1.0
    if d > room: tempo = min(1.25, d / room)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', f'atempo={tempo:.4f}' if tempo != 1 else 'anull', '-ac', '1', '-ar', str(SR), fin], check=True)
    x, _ = __import__('soundfile').read(fin) if False else (None, None)
    raw_bytes = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', fin, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'])
    x = np.frombuffer(raw_bytes, dtype=np.float32).astype(np.float64)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    put(vo, x, v['start'], 1.0, 0)
    i0 = int(v['start'] * SR); vo_env[i0:i0 + len(x)] = np.maximum(vo_env[i0:i0 + len(x)], np.abs(x)[:N - i0])
    vo_report.append({'line': i + 1, 'start': v['start'], 'dur': round(len(x) / SR, 2), 'end': round(v['start'] + len(x) / SR, 2), 'tempo': round(tempo, 3), 'text': v['text']})
json.dump(vo_report, open(os.path.join(OUT, 'vo_report.json'), 'w'), indent=1)

# ---------------------------------------------------------------- mix
# sidechain pump on the tonal bus (kick-synced)
pump = np.ones(N)
for t, (v, b) in K.items():
    i = int(t * SR); n = int(.28 * SR)
    if i < N: seg = pump[i:i + n]; pump[i:i + len(seg)] = np.minimum(seg, 1 - .55 * v * np.exp(-np.arange(len(seg)) / SR * 13))
tonal.l *= pump; tonal.r *= pump
# voice-over envelope -> ducking
win = int(.12 * SR); env = np.convolve(vo_env, np.ones(win) / win, mode='same'); env = np.clip(env * 4, 0, 1)
env = lp(env, 6, 1)
duck_m = 1 - .45 * env; duck_f = 1 - .25 * env
tl, tr = reverb(tonal.l, tonal.r, 2.2, .28); fl, fr = reverb(fxb.l, fxb.r, 1.6, .22)
vl, vr = reverb(vo.l, vo.r, .55, .10)
Ml = (tl * .55 + drums.l * .85) * duck_m; Mr = (tr * .55 + drums.r * .85) * duck_m
Fl = fl * .8 * duck_f; Fr = fr * .8 * duck_f
Ll = Ml + Fl + vl * 1.15; Rr = Mr + Fr + vr * 1.15
mix = np.stack([Ll, Rr], 1)
act = vo_env > 0.02
rm = lambda x: 20*np.log10(np.sqrt(np.mean(x[act]**2))+1e-9)
print('BALANCE during speech (dB rms): VO %.1f | music %.1f | sfx %.1f' % (rm(vl*1.15), rm(Ml), rm(Fl)))
# gentle master: glue + limiter, then fade tail
mix = np.tanh(mix * .9) / np.tanh(.9)
fo = int(.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) / 0.89
pcm = (mix * 32767).astype(np.int16)
import wave
with wave.open(os.path.join(OUT, 'mix_raw.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
# stems for inspection
for name, (a, b) in (('vo', (vl, vr)), ('music', (Ml, Mr)), ('fx', (Fl, Fr))):
    s = np.stack([a, b], 1); s = (s / (np.max(np.abs(s)) + 1e-9) * .8 * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, f'stem_{name}.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(s.tobytes())
print('audio built; VO report:'); [print(r) for r in vo_report]
