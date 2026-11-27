#!/usr/bin/env python3
"""Step 1 - cut every shot from the raw footage, upscale to 1080x1920 and stabilise it.

ffmpeg applies the phone's rotation flag automatically, so the portrait orientation is respected.
Per shot: light denoise (WhatsApp compression) -> Lanczos upscale -> vidstab (smooth path, adaptive crop).
"""
import json
import math
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

from reel_lib import HANDLE, ROOT, WORK, TimeMap, load_edit, shot_frames

edit = load_edit()
FPS = edit["fps"]
SRC = str(ROOT / edit["source"])
OUT = WORK / "shots"
OUT.mkdir(parents=True, exist_ok=True)
CONTEXT = 0.6  # seconds of extra footage either side so the stabiliser can smooth the path
SRC_LEN = 115.7

PRE = ("hqdn3d=1.6:1.2:4:3,"
       "scale=1080:1931:flags=lanczos,crop=1080:1920")


def prep(shot):
    sid = shot["id"]
    dur = shot_frames(edit, shot) / FPS
    tm = TimeMap(shot, dur)
    a = tm.src(-HANDLE / FPS - 1 / FPS) - CONTEXT
    b = tm.src(dur + HANDLE / FPS + 1 / FPS) + CONTEXT
    lo, hi = min(a, b), max(a, b)
    lo = max(0.0, math.floor(lo * FPS) / FPS)
    hi = min(SRC_LEN, hi)
    n = int(math.ceil((hi - lo) * FPS))
    trf = OUT / f"{sid}.trf"
    clip = OUT / f"{sid}.mkv"
    base = ["ffmpeg", "-v", "error", "-y", "-ss", f"{lo:.4f}", "-i", SRC, "-an", "-frames:v", str(n)]
    subprocess.run(base + ["-vf", PRE + f",vidstabdetect=shakiness=5:accuracy=15:result={trf}", "-f", "null", "-"],
                   check=True)
    if shot.get("stabilize", True):
        vf = PRE + (f",vidstabtransform=input={trf}:smoothing=12:optzoom=1:zoomspeed=0.2:"
                    "maxshift=90:maxangle=0.06:crop=black:interpol=bicubic")
    else:
        vf = PRE  # eased-to-a-stop shot: stabilising would only add crop
    r = subprocess.run(base + ["-vf", vf, "-c:v", "ffv1", "-pix_fmt", "yuv420p", str(clip)],
                       capture_output=True, text=True)
    if r.returncode:
        print(r.stderr)
        sys.exit(1)
    zoom = re.findall(r"Final zoom: ([\d.]+)", r.stderr)
    meta = dict(id=sid, clip_start=lo, frames=n, src_in=tm.src_in, src_out=round(tm.src_out, 3),
                stab_zoom_pct=float(zoom[-1]) if zoom else None)
    (OUT / f"{sid}.json").write_text(json.dumps(meta))
    print(f"{sid:3s} src {lo:7.2f}-{hi:7.2f}s  frames={n:3d}  planned in/out {tm.src_in:.2f}->{tm.src_out:.2f}  "
          f"stab zoom {meta['stab_zoom_pct']}%", flush=True)


if __name__ == "__main__":
    only = sys.argv[1:]
    shots = [s for s in edit["shots"] if not only or s["id"] in only]
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(prep, shots))
