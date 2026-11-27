#!/usr/bin/env python3
"""Step 3 - assemble the timeline (cuts + dissolves), add grain/vignette, typography, and encode.

  python3 3_assemble.py                 -> output/casa-de-bella-reel.mp4 and ..._clean.mp4
  python3 3_assemble.py --stills 1,5.5  -> PNG stills of the text version at those times (seconds) for review
"""
import argparse
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from reel_lib import HANDLE, ROOT, WORK, hex_rgb, load_edit, timeline, total_frames

edit = load_edit()
FPS, W, H = edit["fps"], edit["width"], edit["height"]
PAL = {k: np.array(hex_rgb(v), np.float32) for k, v in edit["palette"].items()}
FONTS = {
    "serif": (ROOT / "fonts/CormorantGaramond[wght].ttf"),
    "serif_italic": (ROOT / "fonts/CormorantGaramond-Italic[wght].ttf"),
    "sans": (ROOT / "fonts/Jost[wght].ttf"),
}
SAFE_X = (80, 940)      # Reels UI covers the right edge (icons) - keep ink inside this band
SAFE_Y = (300, 1450)    # top ~15% (profile bar) and bottom ~24% (caption/buttons) stay clear
SS = 2                  # text is drawn at 2x and downsampled for clean edges


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


# --------------------------------------------------------------------------- text sprites
def get_font(name, size, weight):
    f = ImageFont.truetype(str(FONTS[name]), int(size * SS))
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def line_sprite(spec):
    """Returns (premultiplied float32 RGBA sprite at 1x, ink bbox inside sprite)."""
    font = get_font(spec["font"], spec["size"], spec.get("weight", 400))
    text, tracking = spec["text"], spec.get("tracking", 0) * SS
    asc, desc = font.getmetrics()
    pad = 40 * SS
    if tracking:
        adv = [font.getlength(c) + tracking for c in text]
        width = int(sum(adv) - tracking)
    else:
        width = int(font.getlength(text))
    cw, ch = width + 2 * pad, asc + desc + 2 * pad
    mask = Image.new("L", (cw, ch), 0)
    d = ImageDraw.Draw(mask)
    if tracking:
        x = pad
        for c, a in zip(text, adv):
            d.text((x, pad), c, font=font, fill=255)
            x += a
    else:
        d.text((pad, pad), text, font=font, fill=255)
    m = np.asarray(mask, np.float32) / 255.0
    sh = np.asarray(mask.filter(ImageFilter.GaussianBlur(7 * SS)), np.float32) / 255.0
    sh = np.roll(sh, 5 * SS, axis=0) * 0.42
    cream, brown = PAL["cream"], PAL["warm_brown"]
    # premultiplied composite: cream text over brown shadow
    a_out = m + sh * (1 - m)
    rgb = cream[None, None, :] * m[..., None] + brown[None, None, :] * (sh * (1 - m))[..., None]
    spr = np.concatenate([rgb / 255.0, a_out[..., None]], axis=2)
    # downsample x2 (box filter on premultiplied data = correct)
    spr = spr.reshape(ch // SS, SS, cw // SS, SS, 4).mean(axis=(1, 3)) if ch % SS == 0 and cw % SS == 0 else spr[::SS, ::SS]
    ys, xs = np.where(m.reshape(ch // SS, SS, cw // SS, SS).mean(axis=(1, 3)) > 0.08) if ch % SS == 0 and cw % SS == 0 else np.where(m[::SS, ::SS] > 0.08)
    return spr.astype(np.float32), (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1), (asc + desc) / SS


class Block:
    def __init__(self, spec):
        self.spec = spec
        self.items = []  # dict(kind, sprite, x, y, bbox)
        y = 0.0
        specs = spec["lines"]
        last_ink_bottom = None   # ink bottom (block coords) of the previous text line
        after_rule = None        # visual gap to leave between a rule and the next line's ink
        for i, ls in enumerate(specs):
            if ls.get("rule"):
                ry = last_ink_bottom + ls.get("gap", 34)
                self.items.append(dict(kind="rule", y=ry, w=ls.get("width", 120)))
                y = ry + 2
                after_rule = ls.get("gap_after", 34)
                last_ink_bottom = ry + 2
                continue
            spr, ink, lh = line_sprite(ls)
            if after_rule is not None:
                top = y + after_rule - ink[1]   # next line's ink starts exactly after_rule below the rule
                after_rule = None
            else:
                y += ls.get("gap", 0) if i else 0
                top = y
            self.items.append(dict(kind="line", spr=spr, ink=ink, y=top, lh=lh))
            last_ink_bottom = top + ink[3]
            y = top + lh * ls.get("lead", 0.80)
        if self.items[-1]["kind"] == "rule":
            y = self.items[-1]["y"] + 2
        else:
            y = last_ink_bottom
        self.height = y
        # place block: centred horizontally, vertically around spec["y"]
        self.y0 = spec["y"] - self.height / 2
        ink_top = ink_bot = None
        for it in self.items:
            if it["kind"] != "line":
                continue
            h, w = it["spr"].shape[:2]
            it["x"] = int(round(W / 2 - w / 2))
            gx0, gx1 = it["x"] + it["ink"][0], it["x"] + it["ink"][2]
            gy0, gy1 = self.y0 + it["y"] + it["ink"][1], self.y0 + it["y"] + it["ink"][3]
            assert SAFE_X[0] <= gx0 and gx1 <= SAFE_X[1], f"{spec['id']} '{spec['lines'][0].get('text')}' outside safe X: {gx0}-{gx1}"
            ink_top = gy0 if ink_top is None else min(ink_top, gy0)
            ink_bot = gy1 if ink_bot is None else max(ink_bot, gy1)
        assert SAFE_Y[0] <= ink_top and ink_bot <= SAFE_Y[1], f"{spec['id']} outside safe Y: {ink_top:.0f}-{ink_bot:.0f}"
        self.ink_box = (ink_top, ink_bot)
        # scrim profile (warm brown band behind the text)
        yy = np.arange(H, dtype=np.float32)
        cy = (ink_top + ink_bot) / 2
        self.scrim = np.exp(-0.5 * ((yy - cy) / (max(ink_bot - ink_top, 200) * 0.9)) ** 2)[:, None] * spec.get("scrim", 0.3)

    def draw(self, frame, t):
        s = self.spec
        a_in, a_out = s["start"], s["end"]
        if t < a_in - 1e-6 or t > a_out:
            return frame
        master_out = 1 - smooth((t - (a_out - 0.45)) / 0.45)
        env = smooth((t - a_in) / 0.55) * master_out
        if env <= 0.001:
            return frame
        brown = PAL["warm_brown"] / 255.0
        # scrim
        a = (self.scrim * env)[..., None]
        frame = frame * (1 - a) + brown[None, None, :] * a
        n_line = 0
        for it in self.items:
            if it["kind"] == "line":
                st = a_in + 0.14 * n_line
                n_line += 1
                p = ease_out((t - st) / 0.85)
                alpha = smooth((t - st) / 0.6) * master_out
                if alpha <= 0.001:
                    continue
                dy = (1 - p) * 26
                spr = it["spr"] * alpha
                h, w = spr.shape[:2]
                ytop = self.y0 + it["y"] + dy
                y0i = int(np.floor(ytop))
                fr = ytop - y0i
                x0 = it["x"]
                region = np.zeros((h + 1, w, 4), np.float32)
                region[:h] += spr * (1 - fr)
                region[1:] += spr * fr
                ya, yb = max(y0i, 0), min(y0i + h + 1, H)
                reg = region[ya - y0i: yb - y0i]
                xa, xb = max(x0, 0), min(x0 + w, W)
                reg = reg[:, xa - x0: xb - x0]
                dst = frame[ya:yb, xa:xb]
                frame[ya:yb, xa:xb] = dst * (1 - reg[..., 3:4]) + reg[..., :3] * 255.0
            else:
                st = a_in + 0.14 * n_line + 0.25
                grow = ease_out((t - st) / 0.8)
                alpha = smooth((t - st) / 0.5) * master_out
                if grow <= 0.001 or alpha <= 0.001:
                    continue
                half = int(it["w"] * grow / 2)
                yy = int(round(self.y0 + it["y"]))
                col = PAL["nude_pink"]
                x0, x1 = W // 2 - half, W // 2 + half
                frame[yy:yy + 2, x0:x1] = frame[yy:yy + 2, x0:x1] * (1 - alpha) + col * alpha
        return frame


# --------------------------------------------------------------------------- compositing
def build_frame_source():
    tl = timeline(edit)
    mms = {s["id"]: np.load(WORK / "render" / f"{s['id']}.npy", mmap_mode="r") for s, _, _ in tl}
    total = total_frames(edit)

    def get(g):
        # which shot owns frame g
        for k, (s, st, n) in enumerate(tl):
            if st <= g < st + n:
                cur = np.asarray(mms[s["id"]][HANDLE + g - st], np.float32)
                # dissolve in at the start of this shot (centred on the cut)
                tin = s.get("in")
                if isinstance(tin, dict) and "dissolve" in tin and k > 0:
                    N = tin["dissolve"]
                    if g < st + N // 2:
                        ps, pst, pn = tl[k - 1]
                        prev = np.asarray(mms[ps["id"]][HANDLE + g - pst], np.float32)
                        a = smooth((g - (st - N / 2) + 0.5) / N)
                        return prev * (1 - a) + cur * a
                # dissolve out into the next shot (second half of the dissolve lives in the previous shot)
                if k + 1 < len(tl):
                    ns, nst, nn = tl[k + 1]
                    tin = ns.get("in")
                    if isinstance(tin, dict) and "dissolve" in tin:
                        N = tin["dissolve"]
                        if g >= nst - N // 2:
                            nxt = np.asarray(mms[ns["id"]][HANDLE + g - nst], np.float32)
                            a = smooth((g - (nst - N / 2) + 0.5) / N)
                            return cur * (1 - a) + nxt * a
                return cur
        raise IndexError(g)

    return get, total


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
_r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
VIGN = (1 - edit["vignette"] * np.clip(_r - 0.45, 0, 1) ** 1.5)[..., None].astype(np.float32)
del yy, xx, _r


def finish(frame, g, total):
    """vignette, film grain, end dip to cream."""
    frame = frame * VIGN
    rng = np.random.default_rng(1000 + g)
    n = rng.normal(0, edit["grain"], (H // 2, W // 2)).astype(np.float32)
    n = np.repeat(np.repeat(n, 2, axis=0), 2, axis=1)
    frame = frame + n[..., None]
    nf = edit.get("fade_out_frames", 0)
    if nf and g >= total - nf:
        a = smooth((g - (total - nf) + 1) / nf)
        frame = frame * (1 - a) + PAL["cream"][None, None, :] * a
    return frame


def encoder(path):
    cmd = ["ffmpeg", "-v", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
           "-vf", "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p",
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "12M", "-bufsize", "24M",
           "-profile:v", "high", "-level", "4.1", "-r", str(FPS), "-g", "60",
           "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
           "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", "-metadata", "title=Casa de Bella reel",
           str(path)]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stills", help="comma separated seconds; writes PNGs to work/stills instead of encoding")
    ap.add_argument("--only", choices=["text", "clean"], help="render only one version")
    args = ap.parse_args()
    get, total = build_frame_source()
    blocks = [Block(t) for t in edit["text"]]
    print(f"{total} frames, {total / FPS:.2f}s; text blocks: {len(blocks)}")

    def render(g, with_text):
        fr = finish(get(g), g, total)
        if with_text:
            t = g / FPS
            for b in blocks:
                fr = b.draw(fr, t)
        return np.clip(fr + 0.5, 0, 255).astype(np.uint8)

    if args.stills:
        out = WORK / "stills"
        out.mkdir(exist_ok=True)
        for s in args.stills.split(","):
            g = min(int(round(float(s) * FPS)), total - 1)
            Image.fromarray(render(g, True)).save(out / f"t{float(s):06.2f}.png")
            print("still", s)
        return
    outdir = ROOT / "output"
    outdir.mkdir(exist_ok=True)
    jobs = []
    if args.only != "clean":
        jobs.append((outdir / "casa-de-bella-reel.mp4", True))
    if args.only != "text":
        jobs.append((outdir / "casa-de-bella-reel_clean.mp4", False))
    procs = [(encoder(p), wt) for p, wt in jobs]
    for g in range(total):
        base = finish(get(g), g, total)
        for pr, wt in procs:
            fr = base
            if wt:
                fr = base.copy()
                t = g / FPS
                for b in blocks:
                    fr = b.draw(fr, t)
            pr.stdin.write(np.clip(fr + 0.5, 0, 255).astype(np.uint8).tobytes())
        if g % 60 == 0:
            print("frame", g, flush=True)
    for pr, _ in procs:
        pr.stdin.close()
        pr.wait()
    print("done")


if __name__ == "__main__":
    main()
