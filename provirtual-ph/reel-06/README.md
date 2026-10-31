# ProVirtual PH — Reel #6: Lead Generation & Prospect Research

**Deliverable:** `ProVirtual_PH_Reel_06_Lead_Generation_Research.mp4`
1080×1920 (9:16) · 30 fps · 25.000 s · H.264 + AAC stereo · about -14 LUFS

## How it was made (all original, no stock footage, no paid tools)
- `src/` – HTML/CSS/JS motion-graphics scene. `renderFrame(t)` draws any frame from a time value. Timing lives in `src/cues.json`.
- `tools/render.js` – Playwright/Chromium frame renderer (3 sub-frames per frame, blended for real motion blur).
- `tools/build_audio.py` – original synthesized music + sound effects (numpy/scipy) and the voiceover (open-source RHVoice "Clb" voice), all timed from the same cues.
- Encoded with ffmpeg (x264, CRF 19), audio loudness-normalised.

## Notes
- All companies, locations and notes shown are **fictional demo data**; a small on-screen line says so. No personal contact details appear.
- No guarantees of leads, replies, appointments or sales are made anywhere in the video.
- The "PROVIRTUAL PH" mark is typography only (no logo artwork was invented).
- The voiceover is synthetic (text-to-speech), not a human recording.
