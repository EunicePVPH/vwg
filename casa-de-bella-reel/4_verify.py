#!/usr/bin/env python3
"""Step 4 - automated QC of the rendered MP4s: format, orientation, black frames, freezes,
broken transitions (frame-difference spikes that are not planned cuts), and a contact sheet."""
import json
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw

from reel_lib import ROOT, WORK, load_edit, timeline

edit = load_edit()
FPS = edit["fps"]
out = ROOT / "output"
files = [out / "casa-de-bella-reel.mp4", out / "casa-de-bella-reel_clean.mp4"]
ok = True


def probe(p):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(p)],
                                  capture_output=True, text=True, check=True).stdout)
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    return j, v


cuts = {st for _, st, _ in timeline(edit)}
for p in files:
    j, v = probe(p)
    rot = v.get("side_data_list", [{}])[0].get("rotation") if v.get("side_data_list") else None
    print(f"\n== {p.name}")
    print(f"  {v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} fps, {float(j['format']['duration']):.2f}s, "
          f"{int(j['format']['size']) / 1e6:.1f} MB, {int(j['format']['bit_rate']) / 1e6:.1f} Mbps, "
          f"pix_fmt {v['pix_fmt']}, rotation tag {rot}")
    for check, cond in [("1080x1920 portrait", (v["width"], v["height"]) == (1080, 1920)),
                        ("30 fps", v["r_frame_rate"] == "30/1"),
                        ("no rotation tag", not rot),
                        ("25-35 s", 25 <= float(j["format"]["duration"]) <= 35)]:
        print(f"  [{'OK' if cond else 'FAIL'}] {check}")
        ok &= cond
    # decode every frame at low res: black frames, frame-diff spikes
    pr = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(p), "-vf", "scale=135:240,format=gray", "-f", "rawvideo", "-"],
                          stdout=subprocess.PIPE)
    frames = []
    while True:
        b = pr.stdout.read(135 * 240)
        if len(b) < 135 * 240:
            break
        frames.append(np.frombuffer(b, np.uint8).reshape(240, 135).astype(np.float32))
    a = np.array(frames)
    means = a.mean((1, 2))
    black = np.where(means < 12)[0]
    d = np.abs(np.diff(a, axis=0)).mean((1, 2))
    med = np.median(d)
    def isolated(i):  # a one-frame jump that neighbours do not share = glitch; fast camera moves are not
        nb = np.concatenate([d[max(0, i - 4):i], d[i + 1:i + 5]])
        return len(nb) and d[i] > 2.0 * nb.max() and d[i] > 12
    spikes = [(i + 1, d[i]) for i in range(len(d)) if isolated(i) and (i + 1) not in cuts]
    frozen = [i for i in range(len(d)) if d[i] < 0.05]
    print(f"  frames decoded: {len(a)} (expected {int(round(float(j['format']['duration']) * FPS))})")
    print(f"  [{'OK' if not len(black) else 'FAIL'}] black frames: {list(black)}")
    print(f"  median frame diff {med:.2f}; unplanned one-frame glitches: {[(i, round(float(x), 1)) for i, x in spikes]}")
    print(f"  near-identical consecutive frames: {len(frozen)}")
    ok &= not len(black)
    if "clean" not in p.name:
        idx = np.linspace(0, len(a) - 1, 24).astype(int)
        sel = "+".join(f"eq(n\\,{i})" for i in idx)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(p), "-vf",
                        f"select='{sel}',scale=270:480,tile=6x4:padding=0", "-frames:v", "1", "-q:v", "3",
                        str(out / "contact_sheet.jpg")], check=True)
print("\nOVERALL:", "PASS" if ok else "CHECK FAILURES ABOVE")
sys.exit(0 if ok else 1)
