# ProVirtual PH — Reel #12 build notes

Everything is original and generated with free tools: no stock footage, no licensed music, no paid APIs.

1. `gen_voiceover.py` — narration with the open-source Kokoro TTS model (voice `af_heart`).
2. `audio.py` — original music, sound effects and the narration mix, synthesized in numpy (120 BPM, A minor to C major).
3. `reel.html` — the whole animation as a time-driven page (call `render(t)` for any moment).
4. `render.js` — renders it in headless Chromium at 8 sub-frames per frame for real motion blur.
5. ffmpeg blends the sub-frames, encodes H.264 + AAC, and normalizes loudness to about -14 LUFS.

Output: 1080x1920, 30 fps, 25.000 s, H.264/AAC MP4.
