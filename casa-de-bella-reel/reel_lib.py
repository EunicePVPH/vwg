"""Shared helpers for the Casa de Bella reel: edit list, speed ramps, colour grade, text."""
import json
import os
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
WORK = Path(os.environ.get("REEL_WORK", ROOT / "work"))
HANDLE = 8  # extra frames rendered before/after every shot so dissolves have material


def load_edit():
    with open(ROOT / "edit.json") as f:
        return json.load(f)


# --------------------------------------------------------------------------- timing
def beat_frames(edit):
    return round(edit["fps"] * 60.0 / edit["bpm"])  # 90 BPM @ 30 fps = 20 frames


def shot_frames(edit, shot):
    return shot["beats"] * beat_frames(edit)


def timeline(edit):
    """Returns list of (shot, start_frame, n_frames)."""
    out, f = [], 0
    for s in edit["shots"]:
        n = shot_frames(edit, s)
        out.append((s, f, n))
        f += n
    return out


def total_frames(edit):
    return sum(n for _, _, n in timeline(edit))


class TimeMap:
    """Maps output time within a shot -> source time. Speed may be a number or
    [[t, speed], ...] keys (smooth cosine interpolation between keys)."""

    def __init__(self, shot, dur):
        self.src_in = shot["src_in"]
        sp = shot["speed"]
        keys = [[0.0, float(sp)]] if not isinstance(sp, list) else [[float(a), float(b)] for a, b in sp]
        self.keys = keys
        self.dur = dur
        grid = np.linspace(0, dur, int(dur * 600) + 1)
        speeds = np.array([self._speed(t) for t in grid])
        cum = np.concatenate([[0], np.cumsum((speeds[1:] + speeds[:-1]) * 0.5 * np.diff(grid))])
        self.grid, self.cum = grid, cum
        self.s0 = self._speed(0.0)
        self.s1 = self._speed(dur)

    def _speed(self, t):
        k = self.keys
        if t <= k[0][0]:
            return k[0][1]
        if t >= k[-1][0]:
            return k[-1][1]
        for (t0, s0), (t1, s1) in zip(k, k[1:]):
            if t0 <= t <= t1:
                u = (t - t0) / (t1 - t0)
                u = 0.5 - 0.5 * np.cos(np.pi * u)
                return s0 + (s1 - s0) * u
        return k[-1][1]

    def speed(self, t):
        return self._speed(min(max(t, 0), self.dur)) if 0 <= t <= self.dur else (self.s0 if t < 0 else self.s1)

    def src(self, t):
        if t < 0:
            return self.src_in + self.s0 * t
        if t > self.dur:
            return self.src_in + self.cum[-1] + self.s1 * (t - self.dur)
        return self.src_in + float(np.interp(t, self.grid, self.cum))

    @property
    def src_out(self):
        return self.src_in + self.cum[-1]


# --------------------------------------------------------------------------- grade
def _smooth_curve(x, knee=0.72, k=1.7):
    """Soft highlight shoulder: identity below knee, gentle roll-off above."""
    y = x.copy()
    m = x > knee
    r = (x[m] - knee) / (1 - knee)
    y[m] = knee + (1 - knee) * (1 - np.exp(-k * r)) / (1 - np.exp(-k))
    return y


def estimate_grade(frames, shot_grade):
    """frames: list of uint8 HxWx3 sample frames. Returns dict of per-channel LUT + params."""
    g = dict(target=0.52, warm=0.02, sat=1.05, wb_strength=0.6, lift=0.010, contrast=0.16, max_gain=2.0)
    g.update(shot_grade or {})
    g["warm"] += 0.012  # global nudge toward cream/warm
    sub = np.concatenate([f[::8, ::8].reshape(-1, 3) for f in frames]).astype(np.float32) / 255.0
    luma = sub @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    # white balance from near-neutral mid-tones
    mx, mn = sub.max(1), sub.min(1)
    sat = (mx - mn) / np.maximum(mx, 1e-4)
    sel = (sat < 0.16) & (luma > 0.22) & (luma < 0.88)
    if sel.sum() > 400:
        mr, mg, mb = sub[sel].mean(0)
        gains = np.array([mg / mr, 1.0, mg / mb]) ** g["wb_strength"]
    else:
        gains = np.ones(3)
    gains = np.clip(gains, 0.88, 1.18)
    # warm bias (cream, not orange)
    gains = gains * np.array([1 + g["warm"], 1.0, 1 - g["warm"] * 1.1])
    # exposure in (approx.) linear light so brightening keeps colours natural
    corrected = np.clip(sub * gains, 0, 1)
    med = float(np.median(corrected @ np.array([0.299, 0.587, 0.114], dtype=np.float32)))
    gain = (g["target"] / max(med, 0.03)) ** 2.2
    gain = float(np.clip(gain, 0.85, g["max_gain"]))
    x = np.linspace(0, 1, 256)
    luts = np.zeros((3, 256), np.uint8)
    for c in range(3):
        v = np.clip(x * gains[c], 0, 4)
        v = np.power(v, 2.2) * gain
        v = np.power(np.clip(v, 0, 8), 1 / 2.2)
        v = _smooth_curve(np.clip(v, 0, 4) / 1.0)
        v = np.clip(v, 0, 1)
        # gentle S-curve for contrast, lifted black point for a soft matte feel
        s = v * v * (3 - 2 * v)
        v = v + g["contrast"] * (s - v)
        v = g["lift"] + (1 - g["lift"]) * v
        luts[c] = np.clip(v * 255 + 0.5, 0, 255).astype(np.uint8)
    return dict(luts=luts, sat=g["sat"], gains=gains, gain=gain, med=med)


SHADOW_TINT = np.array([0.010, 0.003, -0.006], np.float32)  # warm brown in the shadows
HIGHLIGHT_MUL = np.array([1.0, 0.996, 0.982], np.float32)  # cream in the highlights


def apply_grade(frame_u8, grade):
    out = np.empty_like(frame_u8)
    for c in range(3):
        out[..., c] = grade["luts"][c][frame_u8[..., c]]
    f = out.astype(np.float32) / 255.0
    y = (f @ np.array([0.299, 0.587, 0.114], dtype=np.float32))[..., None]
    f = y + (f - y) * grade["sat"]
    f = f + SHADOW_TINT * (1 - y) * (1 - y)
    f = f * (1 + (HIGHLIGHT_MUL - 1) * y * y)
    return np.clip(f * 255 + 0.5, 0, 255).astype(np.uint8)


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
