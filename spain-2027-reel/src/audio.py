#!/usr/bin/env python3
"""Original score + sound design + narration mix for the Spain 2027 reel.
Everything here is synthesised from scratch (no samples, no third-party music)."""
import json, sys
import numpy as np, soundfile as sf
from scipy import signal

SP = sys.argv[1]
SR = 48000
EV = json.load(open(f"{SP}/build/events.json"))
DUR = EV["duration"]
N = int(DUR * SR)
rs = np.random.RandomState(2027)

def zeros(): return np.zeros((2, N), dtype=np.float64)
def place(buf, sig, t0, gain=1.0, pan=0.0):
    """add mono sig into stereo buf at time t0 (equal-power pan -1..1)"""
    i0 = int(round(t0 * SR))
    if i0 >= N: return
    if i0 < 0: sig = sig[-i0:]; i0 = 0
    n = min(len(sig), N - i0)
    th = (pan + 1) * np.pi / 4
    buf[0, i0:i0 + n] += sig[:n] * gain * np.cos(th)
    buf[1, i0:i0 + n] += sig[:n] * gain * np.sin(th)
def tt(d): return np.arange(int(d * SR)) / SR
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, f0, f1, o=2): return signal.sosfilt(signal.butter(o, [f0, f1], 'band', fs=SR, output='sos'), x)
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def n2f(s):
    name, octv = (s[:2], int(s[2:])) if s[1] == '#' else (s[:1], int(s[1:]))
    return mtof(12 * (octv + 1) + NOTE[name])

# ---------- reverb ----------
def make_ir(rt, damp=6000, seed=1, pre=0.015):
    r = np.random.RandomState(seed); n = int(rt * SR)
    ir = np.zeros((2, n + int(pre * SR)))
    for c in range(2):
        x = r.randn(n); x = lp(x, damp, 1) * np.exp(-np.arange(n) / (rt / 6.9 * SR))
        ir[c, int(pre * SR):] = x
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True)) + 1e-9
    return ir
def reverb(buf, ir, wet):
    out = np.zeros_like(buf)
    for c in range(2):
        out[c] = signal.fftconvolve(buf[c], ir[c])[:N]
    return out * wet
IR_HALL = make_ir(2.6, 5500, 11)
IR_PLATE = make_ir(1.0, 8000, 5)

# ---------- instruments ----------
def pluck(freq, dur, g=0.9985, bright=0.5, amp=1.0):
    """Karplus-Strong string with fractional delay (nylon guitar-ish)"""
    D = SR / freq
    P = int(D - 1.0); delta = D - 0.5 - P            # delta in [0.5,1.5)
    C = (1 - delta) / (1 + delta)
    n = int(dur * SR)
    # y = x*(1+C z^-1) / [ (1 + C z^-1) - g/2 (1+z^-1)(C+z^-1) z^-P ]
    a = np.zeros(P + 4)
    a[0] = 1; a[1] = C
    h = np.convolve([1, 1], [C, 1]) * (g / 2)       # (1+z^-1)(C+z^-1) * g/2
    for k, v in enumerate(h): a[P + k] -= v
    b = np.array([1, C])
    x = np.zeros(n)
    exc = rs.randn(P + 6)
    exc = lp(exc, 800 + bright * 7000, 1)           # softer pick = darker
    x[:len(exc)] = exc * amp
    y = signal.lfilter(b, a, x)
    # tiny body resonance + soften
    y = lp(y, 5200, 1) + 0.35 * bp(y, 180, 320, 1)
    fade = int(0.01 * SR); y[:fade] *= np.linspace(0, 1, fade)
    tail = min(int(0.05 * SR), n); y[-tail:] *= np.linspace(1, 0, tail)
    return y / (np.abs(y).max() + 1e-9)
def saw(freq, dur, detune_cents=(0, 7, -7)):
    t = tt(dur); y = np.zeros_like(t)
    for dc in detune_cents:
        f = freq * 2 ** (dc / 1200); ph = (t * f + rs.rand()) % 1
        y += 2 * ph - 1
    return y / len(detune_cents)
def pad_chord(notes, dur, cutoff, att=0.45, rel=0.8, amp=1.0):
    n = int((dur + rel) * SR); y = np.zeros(n)
    for f in notes:
        s = saw(f, dur + rel); y[:len(s)] += s
    y = lp(y, cutoff, 2)
    e = np.ones(n); a = int(att * SR); e[:a] = np.linspace(0, 1, a) ** 1.5
    r = int(rel * SR); e[-r:] = np.linspace(1, 0, r) ** 1.5
    return y * e * amp / len(notes)
def kick(amp=1.0):
    t = tt(0.42); f = 42 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(rs.randn(len(t)), 2500, 1) * np.exp(-t * 180) * 0.22
    return (y + click) * amp
def snare(amp=1.0, tone=185):
    t = tt(0.28); noise = bp(rs.randn(len(t)), 1400, 7500, 2) * np.exp(-t * 17)
    body = np.sin(2 * np.pi * tone * t) * np.exp(-t * 26) * 0.6
    return (noise + body) * amp
def clap(amp=1.0, bright=1.0):
    """flamenco palmas: a few tight noise bursts, bandpassed ~1-4k"""
    n = int(0.22 * SR); y = np.zeros(n)
    for off, a in [(0, 1.0), (0.007, 0.8), (0.015, 0.6)]:
        nz = bp(rs.randn(int(0.16 * SR)), 900, 3800 * bright, 2)
        e = np.exp(-np.arange(len(nz)) / (0.035 * SR)); i0 = int(off * SR)
        y[i0:i0 + len(nz)] += nz * e * a
    tail = bp(rs.randn(n), 1400, 3000, 1) * np.exp(-np.arange(n) / (0.07 * SR)) * 0.35
    return (y + tail) * amp / 2.2
def hat(amp=1.0, open_=False):
    d = 0.16 if open_ else 0.045; n = int(d * SR)
    return hp(rs.randn(n), 7000, 2) * np.exp(-np.arange(n) / (d * 0.28 * SR)) * amp * 0.5
def bass_note(f, dur=0.45, amp=1.0):
    t = tt(dur); y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)
    e = np.minimum(1, t / 0.005) * np.exp(-t * 4.2)
    return y * e * amp
def boom(amp=1.0, dur=2.6):
    t = tt(dur); f = 28 + 90 * np.exp(-t * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 1.5) + 0.3 * np.sin(2 * ph) * np.exp(-t * 3)
    nz = lp(rs.randn(len(t)), 4500, 1) * np.exp(-t * 6) * 0.5
    return (y + nz) * amp
def shimmer(amp=1.0, dur=2.4, base=1200):
    t = tt(dur); y = np.zeros_like(t)
    for r_, a in [(1, 1), (1.51, .7), (2.0, .6), (2.76, .5), (3.7, .35), (5.4, .25)]:
        y += a * np.sin(2 * np.pi * base * r_ * t + rs.rand() * 6) * np.exp(-t * (1.8 + r_ * 0.5))
    return y * amp / 3.0
def bell(freq, amp=1.0, dur=1.4):
    t = tt(dur); y = np.zeros_like(t)
    for r_, a, d in [(1, 1, 3.0), (2.76, .45, 5.0), (5.4, .2, 8.0)]:
        y += a * np.sin(2 * np.pi * freq * r_ * t) * np.exp(-t * d)
    return y * np.minimum(1, t / 0.002) * amp * 0.5
def pop(freq, amp=1.0):
    t = tt(0.5); f = freq * (1 + 0.4 * np.exp(-t * 60))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) + 0.4 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 20)
    return y * amp * 0.7

# swept-noise bank for whooshes/risers
BANK_F = np.geomspace(150, 9000, 28)
def sweep(dur, f0, f1, width=0.35, shape='in', seed=0):
    n = int(dur * SR); r = np.random.RandomState(seed); nz = r.randn(n); out = np.zeros(n)
    x = np.linspace(0, 1, n)
    center = np.exp(np.log(f0) + (np.log(f1) - np.log(f0)) * x)
    for fc in BANK_F:
        band = bp(nz, fc / 1.18, min(fc * 1.18, SR / 2 - 100), 2)
        w = np.exp(-0.5 * (np.log(fc / center) / width) ** 2)
        out += band * w
    e = np.sin(np.pi * x) ** (1.4 if shape == 'in' else 1.0)
    if shape == 'rise': e = x ** 2.2 * (1 - np.clip((x - 0.985) / 0.015, 0, 1))
    return out * e / (np.abs(out * e).max() + 1e-9)

# ---------- music ----------
CHORDS = {
    'Am': (['A2', 'E3', 'A3', 'C4', 'E4', 'C4', 'A3', 'E3'], ['A3', 'C4', 'E4'], 'A1'),
    'G':  (['G2', 'D3', 'G3', 'B3', 'D4', 'B3', 'G3', 'D3'], ['G3', 'B3', 'D4'], 'G1'),
    'F':  (['F2', 'C3', 'F3', 'A3', 'C4', 'A3', 'F3', 'C3'], ['F3', 'A3', 'C4'], 'F1'),
    'E':  (['E2', 'B2', 'E3', 'G#3', 'B3', 'G#3', 'E3', 'B2'], ['E3', 'G#3', 'B3'], 'E1'),
    'A':  (['A2', 'E3', 'A3', 'C#4', 'E4', 'C#4', 'A3', 'E3'], ['A3', 'C#4', 'E4', 'A4'], 'A1'),
}
# chord per half-bar slot (1 s each) from the Andalusian cadence Am-G-F-E, resolving to A major at 26 s
prog_bars = ['Am', 'G', 'F', 'E'] * 3
SLOTS = []   # (start, dur, chord)
for b, ch in enumerate(prog_bars[:12]): SLOTS.append((b * 2.0, 2.0, ch))
SLOTS += [(24.0, 1.0, 'F'), (25.0, 1.0, 'E'), (26.0, 4.0, 'A')]
def chord_at(t):
    for s, d, ch in SLOTS:
        if s <= t < s + d: return ch
    return 'A'

music = zeros(); music_verb = zeros(); drums = zeros(); sfx = zeros(); sfx_verb = zeros()

# pads (legato, brightness follows the story)
def pad_cut(t):
    if t < 3: return 650
    if t < 8: return 900
    if t < 15: return 1500
    if t < 21: return 1100
    if t < 26: return 1300 + (t - 21) * 500
    return 3200
def pad_amp(t):
    if t < 3: return 1.7
    if t < 8: return 0.75
    if t < 15: return 0.65
    if t < 21: return 1.0
    if t < 26: return 0.85 + 0.03 * (t - 21)
    return 1.9
for s, d, ch in SLOTS:
    notes = [n2f(x) for x in CHORDS[ch][1]]
    y = pad_chord(notes, d + (0.5 if ch != 'A' else 0.0) , pad_cut(s), att=0.5, rel=0.9 if ch != 'A' else 2.4, amp=0.95 * pad_amp(s))
    place(music, y, s, 1.0, -0.15); music_verb_src = y
    place(music_verb, y, s, 0.5, 0.15)
# warm octave-up string layer in the emotional section
for s, d, ch in SLOTS:
    if 15 <= s < 21:
        notes = [n2f(x) * 2 for x in CHORDS[ch][1]]
        y = pad_chord(notes, d + 0.4, 2200, att=0.9, rel=1.0, amp=0.5)
        vib = 1 + 0.0 * y
        place(music, y, s, 1.0, 0.2)

# nylon-guitar arpeggios
def guitar_gain(t):
    if t < 3.0: return 0.0
    if t < 8: return 0.55
    if t < 15: return 0.8
    if t < 21: return 0.5
    if t < 26: return 0.65 + 0.04 * (t - 21)
    return 0.85
def arp_step(t):  # step length by section
    if 21 <= t < 26: return 0.125
    return 0.25
t = 3.0
idx = 0
while t < 26.0 - 1e-6:
    ch = chord_at(t); pat = CHORDS[ch][0]
    step = arp_step(t)
    if step == 0.125:   # 16ths: run through the 8-note pattern twice as fast
        note = pat[int(round((t - 21) / 0.125)) % 8]
    else:
        note = pat[int(round(t / 0.25)) % 8]
    f = n2f(note); g = guitar_gain(t)
    accent = 1.15 if abs((t / 0.5) - round(t / 0.5)) < 1e-6 else 0.8
    y = pluck(f, 1.1 if step > 0.2 else 0.7, g=0.9985, bright=0.55 if 8 <= t < 15 else 0.35, amp=1.0)
    place(music, y, t, 0.5 * g * accent, -0.25 + 0.5 * ((idx % 8) / 8.0)); place(music_verb, y, t, 0.16 * g * accent, 0.1)
    t += step; idx += 1
# closing arpeggio: A major rings out under the call to action
t = 26.5; k = 0
while t < 29.7:
    f = n2f(CHORDS['A'][0][k % 8]); gg = 0.9 * (1 - (t - 26.5) / 3.6) + 0.15
    y = pluck(f, 1.4, g=0.9988, bright=0.4, amp=1.0)
    place(music, y, t, 0.5 * gg, -0.25 + 0.5 * ((k % 8) / 8.0)); place(music_verb, y, t, 0.22 * gg, 0.1)
    t += 0.25; k += 1
# energetic double-time guitar accents during the adventure montage (strums on downbeats)
def strum(t0, ch, gain, up=False):
    notes = [n2f(x) for x in CHORDS[ch][0][:5]]
    notes = notes[::-1] if up else notes
    for k, f in enumerate(notes):
        y = pluck(f * (2 if k >= 3 else 1), 1.0, g=0.9975, bright=0.75, amp=1.0)
        place(music, y, t0 + k * 0.016, gain * (0.5 + 0.1 * k), -0.3 + 0.15 * k)
        place(music_verb, y, t0 + k * 0.016, gain * 0.25, 0.1)
for b in range(4, 8):  # 8-16s
    t0 = b * 2.0
    if 8 <= t0 < 15: strum(t0, chord_at(t0), 0.7); strum(t0 + 1.5, chord_at(t0 + 1.5), 0.45, True)
strum(26.0, 'A', 1.2)           # final resolution strum
strum(26.0 + 0.0, 'A', 0.6, True)
strum(22.0, 'Am', 0.9)          # big reveal
strum(0.0, 'Am', 0.9)           # opening impact

# bass
def bass_f(t):
    return n2f(CHORDS[chord_at(t)][2]) * 2    # one octave up for small speakers
for s, e_, vol, step in [(8.0, 15.0, 0.55, 0.5), (21.5, 26.0, 0.5, 0.5)]:
    t = s
    while t < e_ - 1e-6:
        place(music, bass_note(bass_f(t), 0.42, 1.0), t, vol * (1.1 if abs(t % 1.0) < 1e-6 else 0.8), 0.0); t += step
place(music, bass_note(n2f('A1'), 3.5, 1.0), 26.0, 0.8)
place(music, bass_note(n2f('A1'), 2.5, 1.0), 0.0, 0.7)

# ---------- drums ----------
def beat_times(a, b, step=0.5):
    out = []; t = a
    while t < b - 1e-6: out.append(round(t, 4)); t += step
    return out
# S2 build: kick on 1 & 3 then four-on-floor, hats join
for t in beat_times(3.0, 6.0, 1.0): place(drums, kick(), t, 0.55, 0)
for t in beat_times(6.0, 8.0): place(drums, kick(), t, 0.65, 0)
for t in beat_times(4.0, 8.0, 0.5): place(drums, hat(0.5), t + 0.25, 0.4, 0.2)
# S3 groove
for t in beat_times(8.0, 12.0): place(drums, kick(), t, 0.85, 0)
for t in beat_times(8.0, 12.0, 1.0): place(drums, snare(0.7), t + 0.5, 0.45, 0)
for t in beat_times(8.0, 15.0, 0.25): place(drums, hat(0.6, open_=(round(t * 4) % 4 == 2)), t, 0.35 if (round(t * 4) % 2 == 0) else 0.22, 0.25)
for t in beat_times(12.0, 14.5): place(drums, kick(), t, 0.7, 0)
# snare fill into S4
for k, t in enumerate(beat_times(14.5, 15.0, 0.0625)): place(drums, snare(0.6 + 0.05 * k), t, 0.35 + 0.04 * k, 0)
# S4: heartbeat only, then build into the reveal
for t in beat_times(17.0, 19.5, 1.0): place(drums, kick(), t, 0.4, 0)
for t in beat_times(19.5, 21.5, 0.5): place(drums, kick(), t, 0.55, 0)
for t in beat_times(20.0, 22.0, 0.25): place(drums, hat(0.5), t, 0.28, 0.2)
# S5: half-time groove after the reveal hit
for t in beat_times(22.0, 24.0, 1.0): place(drums, kick(), t, 0.85, 0)
for t in beat_times(22.5, 24.0, 1.0): place(drums, clap(1.0), t, 0.55, 0)
for t in beat_times(22.0, 24.0, 0.25): place(drums, hat(0.5), t, 0.3, 0.25)
# snare roll 24 -> 26 (accelerating)
tr, t = EV["snare_roll"], EV["snare_roll"][0]
while t < tr[1] - 0.02:
    p = (t - tr[0]) / (tr[1] - tr[0]); place(drums, snare(0.55 + 0.7 * p), t, 0.22 + 0.45 * p, 0)
    t += 0.25 - 0.19 * p
for t in beat_times(24.0, 26.0, 0.5): place(drums, kick(), t, 0.75, 0)

# flamenco palmas (synced with the visuals through events.json)
for t0, w in EV["claps"]:
    c = clap(1.0, bright=1.0 if w >= 0.9 else 0.8)
    place(drums, c, t0, 0.95 if w >= 0.9 else 0.5, rs.uniform(-0.3, 0.3)); place(sfx_verb, c, t0, 0.4, 0)

# ---------- SFX ----------
for t0, w in EV["hits"]:
    big = w >= 0.9
    place(sfx, boom(1.0, 2.6 if big else 1.2), t0, 0.85 * w if big else 0.55 * w, 0)
    if big: place(sfx, shimmer(1.0, 2.8, 1400), t0, 0.35, 0)
    else:   place(sfx, hp(rs.randn(int(0.12 * SR)), 1800, 1) * env_exp(int(0.12 * SR), 0.03), t0, 0.18 * w, 0)
    if big: place(sfx_verb, boom(1.0, 1.5), t0, 0.35, 0)
for k, (t0, d, direction, v) in enumerate(EV["whooshes"]):
    if direction == 'up':   y = sweep(d, 250, 5200, 0.38, 'in', seed=k)
    elif direction == 'down': y = sweep(d, 5200, 250, 0.38, 'in', seed=k)
    elif direction == 'lr': y = sweep(d, 500, 4200, 0.45, 'in', seed=k)
    else:                   y = sweep(d, 4200, 500, 0.45, 'in', seed=k)
    if direction in ('lr', 'rl'):
        n = len(y); pan = np.linspace(-1, 1, n) * (1 if direction == 'lr' else -1)
        th = (pan + 1) * np.pi / 4
        i0 = int(t0 * SR); m = min(n, N - i0)
        sfx[0, i0:i0 + m] += y[:m] * np.cos(th[:m]) * 0.6 * v; sfx[1, i0:i0 + m] += y[:m] * np.sin(th[:m]) * 0.6 * v
    else:
        place(sfx, y, t0, 0.55 * v, 0)
    place(sfx_verb, y, t0, 0.25 * v, 0)
for a, b in EV["risers"]:
    y = sweep(b - a, 200, 7500, 0.5, 'rise', seed=99)
    place(sfx, y, a, 0.45, 0); place(sfx_verb, y, a, 0.2, 0)
POP_NOTES = [n2f(x) for x in ['A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6']]
for t0, ni, v in EV["pops"]:
    y = pop(POP_NOTES[ni], 1.0); place(sfx, y, t0, 0.45 * v, 0.0); place(sfx_verb, y, t0, 0.3 * v, 0)
n_n = EV["node_pops_n"]; scale = [n2f(x) for x in ['A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6']]
for i in range(n_n):
    t0 = EV["node_pops_start"] + i * (EV["node_pops_end"] - EV["node_pops_start"]) / n_n
    f = scale[(i * 3) % len(scale)] * (0.5 if i % 5 == 0 else 1)
    y = pop(f, 1.0); place(sfx, y, t0, 0.2, rs.uniform(-0.5, 0.5)); place(sfx_verb, y, t0, 0.15, 0)
for t0, v in EV["sparkles"]:
    for k in range(6):
        f = [2093, 2637, 3136, 3520, 4186, 4699][k] * (1 if k % 2 == 0 else 1.0)
        y = bell(f, 1.0, 1.2); place(sfx, y, t0 + k * 0.045, 0.14 * v, rs.uniform(-0.6, 0.6)); place(sfx_verb, y, t0 + k * 0.045, 0.1 * v, 0)

# ---------- voice ----------
vo = zeros(); vo_mono = np.zeros(N)
for key, t0 in EV["vo"].items():
    x, sr0 = sf.read(f"{SP}/vo/{key}.wav")
    if x.ndim > 1: x = x.mean(axis=1)
    x = signal.resample_poly(x, SR, sr0)
    x = hp(x, 85, 2)
    rms = np.sqrt(np.mean(x ** 2) + 1e-12); x = x * (0.105 / rms)           # even phrase level (~ -19.5 dBFS RMS)
    x = np.tanh(x * 1.6) / 1.6                                              # gentle saturation / peak control
    x = x + 0.12 * bp(x, 2500, 5000, 1)                                     # a touch of presence
    place(vo, x, t0, 1.0, 0.0)
    i0 = int(t0 * SR); m = min(len(x), N - i0); vo_mono[i0:i0 + m] += np.abs(x[:m])
vo_verb = reverb(vo, IR_PLATE, 0.09)
# ducking envelope from the narration
w = int(0.02 * SR); env = np.convolve(vo_mono, np.ones(w) / w, mode='same')
env = np.clip(env / 0.08, 0, 1)
duck = np.zeros(N); a_c = np.exp(-1 / (0.04 * SR)); r_c = np.exp(-1 / (0.35 * SR)); s_ = 0.0
for i in range(N):
    e_ = env[i]; s_ = a_c * s_ + (1 - a_c) * e_ if e_ > s_ else r_c * s_ + (1 - r_c) * e_
    duck[i] = s_
duck = np.clip(duck * 1.25, 0, 1)
music_gain = 1.0 - 0.60 * duck          # ~ -8 dB under voice
sfx_gain = 1.0 - 0.28 * duck

# ---------- mix ----------
mv = reverb(music_verb, IR_HALL, 0.55); sv = reverb(sfx_verb, IR_HALL, 0.5)
mus = (music + drums * 0.95 + mv) * music_gain
fx = (sfx + sv) * sfx_gain
voice = (vo + vo_verb) * 1.0
mix = mus * 0.62 + fx * 0.8 + voice * 1.0
# gentle end fade and DC/hp cleanup
fade = int(0.35 * SR); mix[:, -fade:] *= np.linspace(1, 0, fade)
mix = np.vstack([hp(mix[0], 25, 2), hp(mix[1], 25, 2)])
peak = np.abs(mix).max(); mix = np.tanh(mix / (peak * 0.95) * 1.1) / np.tanh(1.1) * 0.89
sf.write(f"{SP}/build/mix_raw.wav", mix.T.astype(np.float32), SR, subtype='FLOAT')
# stems for QC
sf.write(f"{SP}/build/stem_vo.wav", (voice * 1.0).T.astype(np.float32), SR, subtype='FLOAT')
sf.write(f"{SP}/build/stem_music.wav", (mus * 0.62).T.astype(np.float32), SR, subtype='FLOAT')
print("peak", float(np.abs(mix).max()), "dur", mix.shape[1] / SR)
