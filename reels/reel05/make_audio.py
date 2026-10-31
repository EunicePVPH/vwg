"""Original music + SFX for ProVirtual PH Reel #5 (25 s, 120 BPM, A minor -> C major resolve).
Pure numpy synthesis -> reel_audio.wav (44.1 kHz stereo). No samples, no third-party audio."""
import numpy as np, wave, sys

SR = 44100
DUR = 25.0
N = int(DUR * SR)
rng = np.random.default_rng(7)
BEAT = 0.5

music_L = np.zeros(N); music_R = np.zeros(N)       # drums + bass + arps (dry)
pad_L = np.zeros(N); pad_R = np.zeros(N)           # pads (ducked by kick)
sfx_L = np.zeros(N); sfx_R = np.zeros(N)

def add(bufL, bufR, t0, sig, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N or i0 + len(sig) <= 0: return
    a = max(0, -i0); sig = sig[a:]; i0 = max(0, i0)
    n = min(len(sig), N - i0)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    bufL[i0:i0 + n] += sig[:n] * gain * l * 1.414
    bufR[i0:i0 + n] += sig[:n] * gain * r * 1.414

def tvec(d): return np.arange(int(d * SR)) / SR
def mixs(*sigs):
    n = max(len(x) for x in sigs); o = np.zeros(n)
    for x in sigs: o[:len(x)] += x
    return o
def hp(x, k=1):
    for _ in range(k): x = np.concatenate([[0], np.diff(x)])
    return x

# ---------- instruments ----------
def kick(vol=1.0):
    t = tvec(0.5); f = 46 + 130 * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.17)
    s += 0.25 * rng.standard_normal(len(t)) * np.exp(-t / 0.004)
    return s * vol
def clap(vol=1.0):
    t = tvec(0.3); n = rng.standard_normal(len(t)); s = np.zeros(len(t))
    for off in (0, 0.011, 0.022):
        k = int(off * SR); e = np.exp(-np.maximum(t - off, 0) / 0.055) * (t >= off)
        s += hp(n, 1) * e
    return s * 0.55 * vol
def snare(vol=1.0):
    t = tvec(0.25); s = hp(rng.standard_normal(len(t)), 1) * np.exp(-t / 0.07) * 0.7
    s += np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.4
    return s * vol
def hat(open_=False, vol=1.0):
    t = tvec(0.25 if open_ else 0.07); d = 0.07 if open_ else 0.017
    return hp(rng.standard_normal(len(t)), 2) * np.exp(-t / d) * 0.5 * vol
def bass(f, d=0.28, vol=1.0):
    t = tvec(d + 0.05); e = np.minimum(t / 0.004, 1) * np.exp(-t / (d * 0.6))
    s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.3 for k in range(1, 6))
    s += 0.8 * np.sin(2 * np.pi * f * t)
    return s * e * 0.38 * vol
def pluck(f, vol=1.0, d=0.32, detune=1.003):
    t = tvec(d * 3); e = np.minimum(t / 0.003, 1) * np.exp(-t / d)
    s = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.4 for k in range(1, 6))
    s += sum(np.sin(2 * np.pi * f * detune * k * t) / k ** 1.4 for k in range(1, 4)) * 0.6
    return s * e * 0.22 * vol
def bell(f, vol=1.0, d=1.6):
    t = tvec(d * 2.2); s = np.zeros(len(t))
    for r, a, dd in ((1, 1, 1.0), (2.76, .45, .55), (5.4, .22, .3), (8.93, .1, .18), (0.5, .35, 1.2)):
        s += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (d * dd * 0.5))
    return s * np.minimum(t / 0.002, 1) * 0.3 * vol
def pad(freqs, d, vol=1.0):
    t = tvec(d + 0.9); e = np.minimum(t / 0.45, 1) * np.where(t < d, 1, np.exp(-(t - d) / 0.25))
    s = np.zeros(len(t))
    for f in freqs:
        for cents in (-9, 0, 9):
            ff = f * 2 ** (cents / 1200)
            ph = rng.uniform(0, 6.28)
            s += sum(np.sin(2 * np.pi * ff * k * t + ph) / k ** 1.8 for k in range(1, 5))
    return s * e * 0.05 * vol
def blip(f, d=0.05, vol=1.0, sweep=0.0):
    t = tvec(d * 5); ff = f * (1 + sweep * (1 - np.exp(-t / 0.02)))
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.minimum(t / 0.002, 1) * np.exp(-t / d) * 0.35 * vol
def pop(f, vol=1.0):
    t = tvec(0.14); ff = f * (0.6 + 0.4 * (1 - np.exp(-t / 0.012)) + 0.0)
    s = np.sin(2 * np.pi * np.cumsum(f * (0.55 + 0.45 * (1 - np.exp(-t / 0.015)))) / SR)
    s += 0.3 * hp(rng.standard_normal(len(t)), 1) * np.exp(-t / 0.006)
    return s * np.exp(-t / 0.035) * 0.45 * vol
def thud(vol=1.0):
    t = tvec(0.35); f = 70 + 80 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09) * 0.8 * vol
def impact(vol=1.0):
    t = tvec(2.2); f = 36 + 90 * np.exp(-t / 0.12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)
    n = rng.standard_normal(len(t)); n = np.convolve(n, np.ones(6) / 6, mode='same')
    s += 0.5 * n * np.exp(-t / 0.12)
    s += 0.25 * hp(rng.standard_normal(len(t)), 2) * np.exp(-t / 0.05)
    return s * vol * 0.9
def noise_sweep(d, f0, f1, shape='up', vol=1.0, bw=0.9):
    n = int(d * SR); x = rng.standard_normal(n + 4096)
    fr = 2048; hop = 512; win = np.hanning(fr); out = np.zeros(n + fr); wsum = np.zeros(n + fr)
    freqs = np.fft.rfftfreq(fr, 1 / SR)
    for st in range(0, n, hop):
        tc = (st + fr / 2) / SR; p = min(tc / d, 1)
        fc = f0 * (f1 / f0) ** p
        mask = np.exp(-0.5 * (np.log2(np.maximum(freqs, 20) / fc) / bw) ** 2)
        seg_ = np.fft.irfft(np.fft.rfft(x[st:st + fr] * win) * mask)
        out[st:st + fr] += seg_ * win; wsum[st:st + fr] += win ** 2
    out = (out / np.maximum(wsum, 1e-6))[:n]
    p = np.arange(n) / n
    env = {'up': p ** 2.2 * (1 - np.exp(-(1 - p) / 0.02)), 'down': (1 - p) ** 1.6 * np.minimum(p / 0.03, 1),
           'swell': np.sin(np.pi * p) ** 1.5}[shape]
    out = out / (np.max(np.abs(out)) + 1e-9)
    return out * env * vol
def glide(f0, f1, d, vol=1.0):
    t = tvec(d); f = f0 * (f1 / f0) ** (t / d); p = t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * p ** 2 * (1 - np.exp(-(1 - p) / 0.02)) * 0.18 * vol

# ---------- helpers ----------
def midi(m): return 440 * 2 ** ((m - 69) / 12)
CH = {  # chord tones as midi (pad voicing, arp base, bass root)
    'Am': ([57, 60, 64], 45), 'F': ([53, 57, 60], 41), 'C': ([60, 64, 67], 48), 'G': ([55, 59, 62], 43),
    'Cmaj7': ([60, 64, 67, 71], 48), 'Am7': ([57, 60, 64, 67], 45)}
SEGS = [(0, 3, 'Am'), (3, 5, 'Am'), (5, 7, 'F'), (7, 8, 'G'), (8, 10, 'Am'), (10, 12, 'F'), (12, 13, 'G'), (13, 15, 'Am'),
        (15, 17, 'F'), (17, 18, 'C'), (18, 19, 'G'), (19, 20, 'F'), (20, 21, 'G'), (21, 22, 'Am'), (22, 25, 'Cmaj7')]
def chord_at(t):
    for a, b, c in SEGS:
        if a <= t < b: return c
    return 'Cmaj7'
def sec(t):
    return 0 if t < 3 else 1 if t < 8 else 2 if t < 13 else 3 if t < 19 else 4 if t < 22 else 5

kick_times = []
def K(t, v=1.0):
    add(music_L, music_R, t, kick(v)); kick_times.append((t, v))

# ================= DRUMS / BASS / ARPS =================
# --- hook 0-3 ---
for t in (0.0, 0.5, 1.0): K(t, 0.9)
acc = 0.25
for i in range(14):
    add(music_L, music_R, acc, snare(0.25 + 0.03 * i), pan=0.0); acc += max(0.045, 0.14 * (0.88 ** i))
    if acc > 1.15: break
add(music_L, music_R, 0.0, mixs(pluck(midi(57), 1.3, 0.5), pluck(midi(64), 1.1, 0.5), pluck(midi(69), 1.1, 0.5)))
add(pad_L, pad_R, 0.0, pad([midi(m) for m in (45, 57, 60, 64)], 1.2, 1.4))
# post-freeze: dark pad + sub throb
add(pad_L, pad_R, 1.3, pad([midi(m) for m in (45, 52, 57, 60)], 1.7, 1.6))
for t in np.arange(1.3, 3.0, 0.5):
    add(music_L, music_R, t + 0.0, bass(midi(33), 0.4, 0.9))

# --- sections 3..22 ---
t = 3.0
while t < 22.0 - 1e-6:
    s = sec(t); ch, root = CH[chord_at(t)]
    beat_idx = int(round((t - 3.0) / BEAT))
    # kick
    if s == 1: K(t, 0.62)
    elif s == 2: K(t, 0.78)
    elif s == 3: K(t, 0.88)
    elif s == 4: K(t, 0.55 if t < 21.0 else 0.7)
    # clap / snare
    if s == 2 and beat_idx % 2 == 1: add(music_L, music_R, t, clap(0.8), pan=0.1)
    if s == 3 and beat_idx % 2 == 1: add(music_L, music_R, t, mixs(clap(1.0), snare(0.55)), pan=0.1)
    # hats
    if s == 1: add(music_L, music_R, t + 0.25, hat(False, 0.5), pan=0.3)
    if s == 2:
        add(music_L, music_R, t + 0.25, hat(True, 0.55), pan=0.3)
        add(music_L, music_R, t, hat(False, 0.35), pan=-0.3)
    if s == 3:
        for q in range(4): add(music_L, music_R, t + q * 0.125, hat(q == 2, 0.45 if q % 2 == 0 else 0.3), pan=(-0.3 if q % 2 else 0.3))
    if s == 4 and t >= 20.0: add(music_L, music_R, t + 0.25, hat(False, 0.35), pan=0.3)
    # bass
    rf = midi(root)
    if s == 1: add(music_L, music_R, t + 0.25, bass(rf, 0.2, 0.9))
    if s == 2:
        add(music_L, music_R, t, bass(rf, 0.22, 1.0)); add(music_L, music_R, t + 0.25, bass(rf * 2, 0.15, 0.7))
    if s == 3:
        add(music_L, music_R, t + 0.25, bass(rf, 0.2, 1.1)); add(music_L, music_R, t + 0.375, bass(rf * 2, 0.1, 0.6))
        if beat_idx % 2 == 0: add(music_L, music_R, t, bass(rf, 0.18, 0.9))
    if s == 4: add(music_L, music_R, t, bass(rf, 0.45, 0.9))
    # arps
    tones = [midi(m + 12) for m in ch] + [midi(ch[0] + 24)]
    pat = [0, 1, 2, 3, 2, 1, 2, 1]
    if s == 1:
        for q in range(2):
            n = pat[(beat_idx * 2 + q) % 8]; add(music_L, music_R, t + q * 0.25, pluck(tones[n % len(tones)], 0.8), pan=-0.25 + 0.5 * q)
    if s == 2:
        for q in range(4):
            n = pat[(beat_idx * 4 + q) % 8]; add(music_L, music_R, t + q * 0.125, pluck(tones[n % len(tones)], 0.75 if q % 2 == 0 else 0.5), pan=-0.35 + 0.23 * q)
    if s == 3:
        for q in range(4):
            n = pat[(beat_idx * 4 + q) % 8]; add(music_L, music_R, t + q * 0.125, pluck(tones[(n + (1 if q == 3 else 0)) % len(tones)] * (2 if q == 3 else 1), 0.95 if q % 2 == 0 else 0.6, 0.28), pan=-0.4 + 0.27 * q)
    if s == 4 and beat_idx % 1 == 0:
        add(music_L, music_R, t, pluck(tones[pat[beat_idx % 8] % len(tones)], 0.7, 0.45), pan=0.0)
    t = round(t + BEAT, 4)

# pads per chord segment 3..22 + resolve
for a, b, c in SEGS:
    if b <= 3: continue
    a = max(a, 3.0); ch, root = CH[c]
    v = {1: 0.9, 2: 1.2, 3: 1.2, 4: 1.3, 5: 1.7}[sec(a)]
    add(pad_L, pad_R, a, pad([midi(m + 12) for m in ch] + [midi(root + 12)], b - a, v))

# --- final resolution 22-25 ---
K(22.0, 1.0); K(23.0, 0.55); K(24.0, 0.5)
for i, tt in enumerate(np.arange(22.0, 24.6, 0.25)):
    ch, root = CH['Cmaj7']; tones = [midi(m + 12) for m in ch] + [midi(ch[0] + 24), midi(ch[1] + 24)]
    n = [0, 2, 4, 3, 1, 2, 5, 4][i % 8]
    add(music_L, music_R, tt, pluck(tones[n % len(tones)], 0.8 * (1 - i * 0.025), 0.5), pan=(-0.4 if i % 2 else 0.4))
for tt in np.arange(22.5, 24.5, 0.5): add(music_L, music_R, tt, hat(False, 0.3), pan=0.35)
add(music_L, music_R, 22.0, bass(midi(36), 1.6, 1.0)); add(music_L, music_R, 24.0, bass(midi(36), 0.9, 0.8))
add(sfx_L, sfx_R, 24.0, bell(midi(96), 0.55, 2.0))

# ================= SFX =================
S = lambda t, sig, g=1.0, p=0.0: add(sfx_L, sfx_R, t, sig, g, p)
# --- hook ---
S(0.0, impact(1.0)); S(0.0, bell(midi(81), 0.7, 1.4), 1.0)
# post pops (mirror of reel.html timings)
pop_t = [0.0, 0.05, 0.0] + [0.12 + 0.98 * (((i - 3) / 36) ** 1.45) for i in range(3, 40)]
for k, tt in enumerate(sorted(pop_t)):
    if tt <= 0.0 and k < 1: continue
    if tt >= 1.2: break
    S(tt + 0.02, pop(midi(60 + (k * 2) % 14) * 2, 0.55 if tt > 0.05 else 0.7), 1.0, rng.uniform(-0.7, 0.7))
# freeze: reversed suck + silence feel
S(1.0, noise_sweep(0.28, 4000, 300, 'swell', 0.7))
S(1.2, glide(900, 90, 0.2, 0.0) * 0)  # (reserved)
S(1.2, thud(1.0)); S(1.3, impact(1.1)); S(1.3, bell(midi(69), 0.9, 1.8))
S(1.98, impact(1.15)); S(1.98, bell(midi(76), 0.9, 2.2)); S(2.0, bell(midi(88), 0.5, 1.6))
S(2.15, noise_sweep(0.8, 300, 7000, 'up', 0.9)); S(2.2, glide(180, 1400, 0.8, 1.0))
S(2.8, noise_sweep(0.55, 600, 7000, 'down', 1.0, 1.4)); S(3.0, impact(0.85))
# --- scene 2 ---
for k in range(5): S(3.1 + k * 0.13, noise_sweep(0.5, 400, 3500, 'down', 0.38, 1.1), 1.0, -0.6 + 0.3 * k)
for tt in (3.3, 4.9, 6.45): S(tt, thud(0.75)); S(tt, blip(midi(93), 0.06, 0.5)); S(tt, bell(midi(81), 0.35, 0.9))
for i in range(4): S(3.55 + i * 0.14, blip(midi(72 + i * 3), 0.05, 0.55), 1.0, -0.6)         # bars
for i in range(3): S(3.85 + i * 0.22, blip(midi(76 + i * 4), 0.07, 0.5), 1.0, 0.6)           # radar
for i in range(26): S(4.12 + i * 0.045, blip(midi(79 + (i % 7)), 0.025, 0.28), 1.0, -0.5 + (i % 7) * 0.15)  # heatmap
S(5.1, glide(300, 2400, 1.0, 0.9)); S(6.0, bell(midi(88), 0.7, 1.3)); S(6.0, blip(midi(100), 0.1, 0.5))
for i in range(14): S(4.6 + i * 0.11, blip(midi(67 + i), 0.03, 0.3), 1.0, 0.55)               # line draw
for i in range(4): S(5.7 + i * 0.16, pop(midi(84 + i * 2), 0.6), 1.0, 0.0)                   # chips
S(6.9, noise_sweep(0.7, 2000, 9000, 'swell', 0.5)); S(6.95, bell(midi(93), 0.5, 1.4))
S(7.1, noise_sweep(0.95, 250, 8000, 'up', 1.0)); S(7.15, glide(220, 1760, 0.85, 1.0))
S(7.9, impact(0.95)); S(7.85, noise_sweep(0.5, 500, 6000, 'down', 0.9, 1.3))
# --- scene 3 ---
for i in range(4): S(8.15 + i * 0.1, pop(midi(69 + i * 5), 0.55), 1.0, -0.5 + i * 0.33)
penta = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79]
for k in range(20):
    S(8.5 + k * 0.055, pop(midi(penta[k % len(penta)] + 12), 0.62), 1.0, rng.uniform(-0.6, 0.6))
S(8.4, thud(0.9)); S(8.4, bell(midi(81), 0.4, 1.0)); S(8.0, noise_sweep(0.6, 400, 5000, 'down', 0.5, 1.0))
for i in range(4): S(9.6 + i * 0.12, blip(midi(65 + i * 4), 0.06, 0.5), 1.0, 0.3)
S(10.55, bell(midi(91), 0.6, 1.2)); S(10.7, thud(0.8)); S(10.7, noise_sweep(0.5, 500, 4500, 'down', 0.7, 1.2)); S(10.7, bell(midi(79), 0.35, 1.0))
S(11.4, blip(midi(96), 0.1, 0.4))
S(12.2, noise_sweep(0.8, 250, 8000, 'up', 0.9)); S(12.2, glide(200, 1600, 0.8, 0.9))
S(12.85, noise_sweep(0.55, 400, 6000, 'down', 1.0, 1.4)); S(13.0, impact(0.8))
# --- scene 4 ---
for tt in (13.1, 14.05, 15.15, 16.95): S(tt, thud(0.9)); S(tt, bell(midi(84 if tt < 15 else 88), 0.45, 1.0)); S(tt, noise_sweep(0.25, 800, 8000, 'down', 0.4, 1.3))
for i in range(3): S(13.2 + i * 0.12, noise_sweep(0.4, 300, 3000, 'down', 0.35, 1.0), 1.0, [-0.6, 0, 0.6][i])
for tt in (14.0, 14.3, 14.55): S(tt + 0.05, bell(midi(96), 0.45, 0.9), 1.0, (tt - 14.3) * 1.5); S(tt, blip(midi(105), 0.05, 0.35))
for i in range(7): S(14.05 + i * 0.13, blip(midi(84 + i), 0.04, 0.4), 1.0, -0.6 + i * 0.2)
for tt in (14.5, 14.62, 14.74, 14.84, 14.92): add(music_L, music_R, tt, snare(0.55))
S(14.75, noise_sweep(0.35, 300, 7000, 'up', 0.8)); S(15.0, impact(0.85)); S(15.0, noise_sweep(0.6, 400, 6000, 'down', 0.9, 1.4))
for k in range(5): S(15.1 + k * 0.1, noise_sweep(0.4, 400, 3500, 'down', 0.35, 1.1), 1.0, -0.6 + 0.3 * k)
for i in range(26): S(15.7 + i * 0.05, blip(midi(72 + i * 0.6), 0.02, 0.25), 1.0, -0.4 + (i % 3) * 0.4)   # counters
for i in range(10): S(15.9 + i * 0.15, blip(midi(70 + i * 1.5), 0.04, 0.3), 1.0, 0.5)                  # line chart
S(16.0, glide(250, 1800, 0.9, 0.7))
S(16.2, pop(midi(88), 0.7)); S(16.0, thud(0.4))
S(16.95 - 0.35, noise_sweep(0.35, 300, 6000, 'up', 0.6))
S(17.05, noise_sweep(0.55, 400, 5500, 'down', 0.9, 1.2)); S(17.05, thud(0.9))
for i, tt in enumerate((17.5, 17.72, 17.94)): S(tt, bell(midi(84 + i * 4), 0.5, 1.0), 1.0, -0.3 + i * 0.3); S(tt, pop(midi(96 + i * 2), 0.4))
S(18.2, bell(midi(96), 0.6, 1.6)); S(18.2, glide(300, 1200, 0.25, 0.0))
add(music_L, music_R, 18.4, snare(0.4));
for tt in np.arange(18.5, 19.0, 0.0625): add(music_L, music_R, tt, snare(0.28 + (tt - 18.5) * 0.9), pan=0.0)
S(18.4, noise_sweep(0.62, 250, 9000, 'up', 1.0)); S(18.4, glide(200, 2000, 0.6, 0.8))
S(18.85, noise_sweep(0.5, 500, 6000, 'down', 0.8, 1.3)); S(19.0, impact(0.85))
# --- scene 5 ---
for k in range(3): S(19.0 + k * 0.14, noise_sweep(0.55, 300, 3200, 'down', 0.4, 1.0), 1.0, [-0.5, 0, 0.5][k])
S(19.25, thud(0.9)); S(19.25, bell(midi(81), 0.5, 1.4)); S(19.4, bell(midi(88), 0.4, 1.2))
for i in range(2): S(19.6 + i * 0.15, pop(midi(79 + i * 5), 0.6))
for tt, n in ((20.55, 76), (20.95, 79), (21.3, 84)): S(tt, bell(midi(n + 12), 0.7, 1.4)); S(tt, thud(0.45))
for tt in (20.7, 21.15): S(tt, blip(midi(100), 0.04, 0.4))
S(21.3, noise_sweep(0.7, 250, 9500, 'up', 1.0)); S(21.3, glide(200, 2400, 0.7, 1.0))
# --- scene 6 ---
S(22.0, impact(1.3)); S(22.0, bell(midi(72), 0.9, 2.5)); S(22.0, bell(midi(84), 0.7, 2.5)); S(22.0, bell(midi(91), 0.6, 2.5))
S(21.9, noise_sweep(0.5, 600, 9000, 'down', 0.9, 1.5))
for i in range(12): S(22.05 + i * 0.045, blip(midi(72 + [0, 4, 7, 11][i % 4] + 12 * (i // 4)), 0.08, 0.3), 1.0, -0.6 + i * 0.1)  # harp gliss
S(22.15, thud(1.0)); S(22.15, bell(midi(84), 0.5, 1.4))
S(22.45, noise_sweep(0.5, 800, 5000, 'swell', 0.5, 1.2))
for tt in (22.7, 22.78): S(tt, blip(midi(103), 0.04, 0.3))
for tt in (22.82, 22.96): S(tt, thud(0.8)); S(tt, bell(midi(79 if tt < 22.9 else 84), 0.4, 1.0))
S(23.3, noise_sweep(0.6, 300, 6000, 'up', 0.8)); S(23.3, glide(300, 1800, 0.55, 0.8))
S(23.55, pop(midi(96), 0.8)); S(23.55, bell(midi(84), 0.8, 2.0)); S(23.55, bell(midi(88), 0.6, 2.0)); S(23.55, bell(midi(91), 0.6, 2.0))
for i, tt in enumerate((23.85, 24.0, 24.12, 24.25, 24.4)):
    S(tt, blip(midi(100 + [0, 4, 2, 7, 4][i]), 0.09, 0.3), 1.0, -0.6 + i * 0.3)

# ================= MIX =================
# sidechain duck on pads
duck = np.ones(N)
for kt, kv in kick_times:
    i0 = int(kt * SR); n = int(0.28 * SR)
    if i0 >= N: continue
    n = min(n, N - i0); tt = np.arange(n) / SR
    duck[i0:i0 + n] = np.minimum(duck[i0:i0 + n], 1 - 0.55 * kv * np.exp(-tt / 0.1))
pad_L *= duck; pad_R *= duck

def reverb(L, R, wet, rt=1.6):
    n = int(rt * SR); t = np.arange(n) / SR
    irL = rng.standard_normal(n) * np.exp(-t / (rt / 4.5)); irR = rng.standard_normal(n) * np.exp(-t / (rt / 4.5))
    irL = np.cumsum(irL) * 0 + irL; irL[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    irR[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    size = 1 << int(np.ceil(np.log2(N + n)))
    def conv(x, ir): return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size))[:N]
    irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
    return conv(L, irL) * wet, conv(R, irR) * wet

mL = music_L * 0.9 + pad_L * 1.0; mR = music_R * 0.9 + pad_R * 1.0
rvL, rvR = reverb(sfx_L + pad_L * 0.6, sfx_R + pad_R * 0.6, 0.35, 1.7)
L = mL + sfx_L * 1.0 + rvL; R = mR + sfx_R * 1.0 + rvR

# gentle low-cut of rumble + master fade
def lowcut(x, f=28.0):
    a = np.exp(-2 * np.pi * f / SR); y = np.zeros_like(x); px = 0; py = 0
    # vectorised first-order highpass through recursion is slow; use FFT mask
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / np.maximum(fr, 1e-3)) ** 4)
    return np.fft.irfft(X, len(x))
L = lowcut(L); R = lowcut(R)
fade = np.ones(N); fn = int(0.45 * SR); fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
fade[:int(0.002 * SR)] = np.linspace(0, 1, int(0.002 * SR))
L *= fade; R *= fade
peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
L = np.tanh(L / peak * 1.6) / np.tanh(1.6); R = np.tanh(R / peak * 1.6) / np.tanh(1.6)
L *= 0.89; R *= 0.89
pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
out = sys.argv[1] if len(sys.argv) > 1 else 'reel_audio.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out, 'peak', float(np.max(np.abs(pcm))) / 32767, 'dur', N / SR)
