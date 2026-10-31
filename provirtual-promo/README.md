# ProVirtual PH – 20s Reel (9:16)

Final video: `ProVirtual_PH_Promo_Reel_9x16.mp4` (1080x1920, 30 fps, H.264 + AAC, 20 s).

Rebuild:
1. `python3 audio.py` – creates the original synthesized score (`audio.wav`).
2. `node render.js <frames_dir> <start> <end>` – renders frames from `video.html` (run in 4 slices: 0-150, 150-300, ...).
3. `ffmpeg -framerate 30 -i <frames_dir>/f%04d.jpg -i audio.wav ...` – encode to MP4.

The logo is the supplied file (`assets/provirtual-logo.jpg`), only scaled and placed on a white card. Font: Montserrat (OFL).
