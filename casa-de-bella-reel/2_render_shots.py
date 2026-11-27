#!/usr/bin/env python3
"""Step 2 - retime (speed ramps with motion blur), colour grade and sharpen every shot.

Output per shot: work/render/<id>.npy  (frames x 1920 x 1080 x 3, uint8) including HANDLE extra frames
at both ends that the dissolves use.
"""
import json
import math
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor

import numpy as np
from PIL import Image, ImageFilter

from reel_lib import HANDLE, WORK, TimeMap, apply_grade, estimate_grade, load_edit, shot_frames

edit = load_edit()
FPS, W, H = edit["fps"], edit["width"], edit["height"]
SHOTS = WORK / "shots"
OUT = WORK / "render"
OUT.mkdir(parents=True, exist_ok=True)
SHUTTER = 0.5  # fraction of a frame interval the "shutter" stays open (motion blur on fast sections)


def load_clip(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)


def sample_weights(tm, t, clip_start, nclip, blend=False):
    """Source-frame weights for output time t (handles speed ramps, slow motion blending, motion blur)."""
    if not blend:  # crisp: one real source frame, never a mix of two
        p = min(max(round((tm.src(t) - clip_start) * FPS), 0), nclip - 1)
        return {int(p): 1.0}
    s = tm.speed(t)
    span = (1.0 if s > 1.7 else SHUTTER) * s  # whoosh frames get a wider shutter (smooth streaks)
    ns = 1 if span < 0.6 else min(8, int(math.ceil(span)) + 1)
    w = {}
    for j in range(ns):
        p = (tm.src(t) - clip_start) * FPS + (0.0 if ns == 1 else (j / (ns - 1) - 0.5) * span)
        p = min(max(p, 0.0), nclip - 1.0001)
        i0 = int(math.floor(p))
        f = p - i0
        w[i0] = w.get(i0, 0) + (1 - f) / ns
        w[i0 + 1] = w.get(i0 + 1, 0) + f / ns
    return w


def zoomed(img, z, anchor=(0.5, 0.5)):
    if z <= 1.0001:
        return img
    cw, ch = W / z, H / z
    x0, y0 = (W - cw) * anchor[0], (H - ch) * anchor[1]
    return img.resize((W, H), Image.LANCZOS, box=(x0, y0, x0 + cw, y0 + ch))


def render(shot):
    sid = shot["id"]
    n = shot_frames(edit, shot)
    dur = n / FPS
    tm = TimeMap(shot, dur)
    meta = json.loads((SHOTS / f"{sid}.json").read_text())
    clip = load_clip(SHOTS / f"{sid}.mkv")
    nclip, cs = len(clip), meta["clip_start"]
    # grade from a handful of sample frames across the shot
    idx = [int(np.clip((tm.src(dur * u) - cs) * FPS, 0, nclip - 1)) for u in (0.1, 0.3, 0.5, 0.7, 0.9)]
    grade = estimate_grade([clip[i] for i in idx], shot.get("grade"))
    total = n + 2 * HANDLE
    mm = np.lib.format.open_memmap(OUT / f"{sid}.npy", mode="w+", dtype=np.uint8, shape=(total, H, W, 3))
    z0, z1 = shot.get("zoom", [1.0, 1.0])
    for k in range(total):
        t = (k - HANDLE) / FPS
        w = sample_weights(tm, t, cs, nclip, shot.get("blend", False))
        acc = None
        for i, wt in w.items():
            if wt < 1e-4:
                continue
            fr = clip[min(i, nclip - 1)].astype(np.float32)
            acc = fr * wt if acc is None else acc + fr * wt
        frame = np.clip(acc / sum(w.values()) + 0.5, 0, 255).astype(np.uint8)
        frame = apply_grade(frame, grade)
        img = Image.fromarray(frame)
        sp = float(tm.speed(t))
        if shot.get("blend") and sp > 1.7:  # smooth the stepped ghosting of discrete motion-blur samples on fast whoosh frames
            img = img.filter(ImageFilter.GaussianBlur((sp - 1.7) * 6.5))
        u = min(max(t / dur, 0), 1)
        img = zoomed(img, z0 + (z1 - z0) * (u * u * (3 - 2 * u)), shot.get("zoom_anchor", (0.5, 0.5)))
        img = img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=75, threshold=2))
        clar = edit.get("grade_global", {}).get("clarity", 0)
        if clar:  # local contrast ('clarity'): big-radius unsharp gives the picture more pop
            img = img.filter(ImageFilter.UnsharpMask(radius=28, percent=int(clar * 100), threshold=0))
        mm[k] = np.asarray(img)
    mm.flush()
    print(f"{sid:3s} {total} frames  gain x{grade['gain']:.2f}  wb {np.round(grade['gains'], 3)}  "
          f"median {grade['med']:.2f}", flush=True)


if __name__ == "__main__":
    only = sys.argv[1:]
    shots = [s for s in edit["shots"] if not only or s["id"] in only]
    with ProcessPoolExecutor(3) as ex:
        list(ex.map(render, shots))
