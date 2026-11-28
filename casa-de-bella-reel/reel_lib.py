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
def _smooth_curve(x, knee=0.62, k=2.3):
    """Soft highlight shoulder: identity below knee, gentle roll-off above."""
    y = x.copy()
    m = x > knee
    r = (x[m] - knee) / (1 - knee)
    y[m] = knee + (1 - knee) * (1 - np.exp(-k * r)) / (1 - np.exp(-k))
    return y


def _global_grade():
    try:
        return load_edit().get("grade_global", {})
    except Exception:
        return {}


LUMA_W = np.array([0.299, 0.587, 0.114], dtype=np.float32)


def estimate_grade(frames, shot_grade):
    """frames: list of uint8 HxWx3 sample frames. Returns base grade parameters (white balance, colour, curve shape).
    Exposure is NOT fixed here: it is solved per frame by exposure_gains() so brightness stays even inside and between shots."""
    g = dict(target=0.52, warm=0.02, sat=1.05, wb_strength=0.6, lift=0.010, contrast=0.16, max_gain=2.0,
             shadow_lift=0.0, hi_target=0.93, white_point=1.0)
    g.update(shot_grade or {})
    G = _global_grade()
    g["warm"] += G.get("warm_add", 0.012)       # global nudge toward cream/warm
    g["target"] = G["target"] if "target" in G else g["target"] + G.get("target_add", 0.0)  # same brightness for every shot
    g["sat"] *= G.get("sat_mult", 1.0)           # richer colour
    for k in ("contrast", "lift", "wb_strength", "shadow_lift", "hi_target", "max_gain", "white_point"):
        g[k] = G.get(k, g[k])
    g["vibrance"] = G.get("vibrance", 0.0)
    sub = np.concatenate([f[::8, ::8].reshape(-1, 3) for f in frames]).astype(np.float32) / 255.0
    luma = sub @ LUMA_W
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
    gains = gains * np.array([1 + g["warm"], 1.0, 1 - g["warm"] * 1.1])  # warm bias (cream, not orange)
    g["wb"] = gains
    return g


def frame_stats(frame_u8, g):
    """(median, 95th percentile) of white-balanced luma for one frame - used to solve exposure."""
    sub = frame_u8[::10, ::10].reshape(-1, 3).astype(np.float32) / 255.0
    y = np.clip(sub * g["wb"], 0, 1) @ LUMA_W
    return float(np.median(y)), float(np.percentile(y, 95))


def exposure_gains(stats, g, window=31):
    """Per-frame exposure gain (linear light) that brings every frame to the same brightness, never blowing the
    highlights, smoothed over ~1 s so it never pumps."""
    out = []
    for med, p95 in stats:
        gm = (g["target"] / max(med, 0.04)) ** 2.2
        gh = (g["hi_target"] / max(p95, 0.2)) ** 2.2
        gain = gm if gm <= gh else max(gh, 0.72 * gm)
        out.append(np.log(np.clip(gain, 0.7, g["max_gain"])))
    out = np.array(out)
    pad = window // 2
    sm = np.convolve(np.pad(out, pad, mode="edge"), np.ones(window) / window, mode="valid")
    return np.exp(sm)


def build_grade(g, gain):
    """LUTs for one frame: white balance -> exposure -> highlight shoulder -> shadow lift -> contrast."""
    x = np.linspace(0, 1, 256)
    luts = np.zeros((3, 256), np.uint8)
    for c in range(3):
        v = np.clip(x * g["wb"][c], 0, 4)
        v = np.power(v, 2.2) * gain
        v = np.power(np.clip(v, 0, 8), 1 / 2.2)
        v = np.clip(_smooth_curve(np.clip(v, 0, 4)), 0, 1)
        v = v + g["shadow_lift"] * 4 * v * (1 - v) ** 3          # open up deep shadows, keep true black
        s = v * v * (3 - 2 * v)
        v = v + g["contrast"] * (s - v)                           # gentle S-curve
        v = g["lift"] + (1 - g["lift"]) * v
        v = v * g.get("white_point", 1.0)                       # soft white ceiling (no glaring pure-white areas)
        luts[c] = np.clip(v * 255 + 0.5, 0, 255).astype(np.uint8)
    return dict(luts=luts, sat=g["sat"], vib=g["vibrance"], gain=gain)


SHADOW_TINT = np.array([0.010, 0.003, -0.006], np.float32)  # warm brown in the shadows
HIGHLIGHT_MUL = np.array([1.0, 0.998, 0.99], np.float32)  # cream in the highlights


def apply_grade(frame_u8, grade):
    out = np.empty_like(frame_u8)
    for c in range(3):
        out[..., c] = grade["luts"][c][frame_u8[..., c]]
    f = out.astype(np.float32) / 255.0
    y = (f @ np.array([0.299, 0.587, 0.114], dtype=np.float32))[..., None]
    # vibrance: lift muted colours (pinks, creams, beiges) more than already-vivid ones
    mx, mn = f.max(2, keepdims=True), f.min(2, keepdims=True)
    chroma = (mx - mn) / np.maximum(mx, 1e-3)
    f = y + (f - y) * (grade["sat"] * (1 + grade.get("vib", 0.0) * (1 - np.clip(chroma * 2.5, 0, 1))))
    # de-green cream/ivory tones lit by warm light (G slightly above R reads lime on screen); leaves vivid greens alone
    mx2, mn2 = f.max(2), f.min(2)
    low_chroma = np.clip(1 - ((mx2 - mn2) / np.maximum(mx2, 1e-3)) / 0.60, 0, 1)
    f[..., 1] -= 1.0 * np.maximum(f[..., 1] - f[..., 0], 0) * low_chroma
    # keep bright whites clean: pull colour out of the brightest tones so clipped highlights never turn yellow
    w = np.clip((y - 0.74) / 0.22, 0, 1)
    f = y + (f - y) * (1 - 0.7 * w * w * (3 - 2 * w))
    f = f + SHADOW_TINT * (1 - y) * (1 - y)
    f = f * (1 + (HIGHLIGHT_MUL - 1) * y * y)
    return np.clip(f * 255 + 0.5, 0, 255).astype(np.uint8)


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
