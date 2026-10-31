# ProVirtual PH — 20s vertical reel (websites, landing pages, sales funnels)

Finished video: `ProVirtual_PH_Websites_LandingPages_Funnels_Reel.mp4` (1080x1920, 30 fps, 20.0 s, H.264 + AAC).

Everything is original and code-generated:
- `reel.html` + `js/` — the animation (pure HTML/CSS/JS; every frame is a function of time `renderFrame(t)`).
- `tools/render.js` — renders 60 fps frames with headless Chromium (Playwright); `tools/encode.sh` blends frame pairs
  (motion blur), mixes audio and encodes the MP4.
- `audio/make_audio.py` — synthesizes the music and sound effects and mixes them with the voiceover
  (voice lines in `audio/vo/`, generated locally with the open-source Kokoro TTS model).
- Fonts: Montserrat and Playfair Display (SIL Open Font License).

Re-render: `node tools/render.js <worker> 4 60 20 <frames_dir>` for worker 0-3, `python3 audio/make_audio.py`,
then `tools/encode.sh <frames_dir> out.mp4`.

The "alder&co." website designs in the video are fictional demo designs, not client work.
