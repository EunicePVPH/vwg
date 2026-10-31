# ProVirtual PH — Reel #7 (Video & Podcast Content) — source

Finished video: `../ProVirtual_PH_Reel_07_Video_Podcast_Content.mp4`
(1080×1920, 9:16, 30 fps, 25.0 s, H.264 + AAC stereo, about -14 LUFS)

Everything is original and generated in code. No stock footage, photos, logos, samples or licensed music were used.

| File | What it does |
|---|---|
| `lib.js`, `assets.js`, `scenes.js` | Deterministic canvas drawing: 3D-perspective editing UI, fictional recording frames, content cards, kinetic type, transitions, motion blur |
| `render.html`, `render.js` | Headless Chromium (Playwright) frame renderer |
| `render_all.sh` | Renders 750 frames with 4 parallel workers |
| `audio.py` | Synthesizes the music and sound effects (numpy/scipy) and mixes them with the voiceover |
| `encode.sh` | Encodes frames and audio to MP4 with ffmpeg |

**Voiceover:** generated with the open-source Kokoro TTS model (`kokoro-onnx`, voice `af_heart`, Apache-2.0).
It is a synthetic voice, not a human recording. Lines are in `voiceover.txt`.

Rebuild outline:

1. Generate the voiceover lines to `vo_v1.wav`–`vo_v6.wav` (see `voiceover.txt`).
2. `python audio.py <voice_dir> mix_raw.wav`, then loudness-normalize to -14 LUFS with ffmpeg `loudnorm`.
3. `./render_all.sh frames`
4. `./encode.sh frames audio_final.wav out.mp4`
