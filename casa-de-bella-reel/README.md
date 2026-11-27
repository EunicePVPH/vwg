# Casa de Bella - promotional reel project

A 28-second vertical (1080x1920, 30 fps) Instagram/Facebook Reel for Casa de Bella salon, Mamaroneck, NY,
edited from one raw walkthrough video. Everything is scripted so revisions are quick.

## Deliverables (`output/`)
| File | What it is |
|---|---|
| `casa-de-bella-reel.mp4` | Finished reel with text overlays |
| `casa-de-bella-reel_clean.mp4` | Same edit, no text (for repurposing: stories, ads, other captions) |
| `contact_sheet.jpg` | 24-frame overview of the final reel |

Docs: `docs/caption.md` (caption + hashtags), `docs/edit-notes.md` (timestamps and editing decisions).

Both MP4s are silent (a silent audio track is included so uploads are accepted). Add a licensed track in the
Instagram/Facebook app. Cuts sit on a 90 BPM grid, so a track near 90 BPM will land on the beat.

## Asking for changes
Almost everything lives in **`edit.json`**:
- `shots` - order, length in beats (1 beat = 20 frames = 0.667 s), `src_in` (source start in seconds),
  `speed` (a number, or `[[seconds, speed], ...]` for a ramp), transition (`"cut"` or `{"dissolve": frames}`),
  colour (`grade`: `target` brightness, `warm`, `sat`), `zoom` (slow push-in).
- `text` - wording, start/end time (seconds), position, size, font. The build refuses text that leaves the Reels safe zone.
- `grain`, `vignette`, `fade_out_frames`.

Then run `./build.sh` (full, about 10 min) or `./build.sh text` if only text/timing/grain changed (about 7 min).

## Pipeline
1. `1_prep_shots.py` - cut each shot, denoise, upscale to 1080x1920, stabilise (vidstab). Rotation flag is applied by ffmpeg.
2. `2_render_shots.py` - speed ramps with motion blur, per-shot colour grade, sharpen.
3. `3_assemble.py` - cuts/dissolves, grain, vignette, typography, encode both MP4s (H.264, BT.709, +faststart).
4. `4_verify.py` - checks size, fps, orientation, black frames, glitches; writes the contact sheet.

Needs ffmpeg (libx264, libvidstab), Python 3, numpy, Pillow. Set `REEL_WORK=/some/dir` to move the (large) `work/` cache.
Fonts: Cormorant Garamond and Jost (SIL Open Font License, see `fonts/OFL.txt`).

## Known limits
The raw file is 528x944 and heavily compressed, so the output is an upscale and is softer than native 1080p.
For a sharper version, supply the original phone video (not the WhatsApp copy) and rebuild.
