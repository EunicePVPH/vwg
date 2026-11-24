# Tour Architex · Spain 2027 Student Reel

`../Tour_Architex_Spain_2027_Student_Reel.mp4` — 30.0 s, 1080×1920 (9:16), 30 fps, H.264 High + AAC 48 kHz stereo, about -14 LUFS.

## What it is
A fully original, motion-graphics-only edition. No stock footage or photography is used, and no logo is used (the brand appears as animated type only).
Visuals are drawn in code (HTML canvas, rendered frame by frame with Chromium/Playwright):
arch tunnel, animated map of Madrid, Granada, Murcia and Cartagena, kayak, Alhambra-style arcade, Roman-theatre geometry, flamenco rhythm graphic, sunset arcade and CTA.

## Assets and licences
| Asset | Source | Licence |
|---|---|---|
| Music and sound effects | Synthesised from scratch in `src/audio.py` (no samples) | Original |
| Narration | Kokoro-82M neural TTS, voice `af_heart` (via `kokoro-onnx`) | Apache-2.0 |
| Map outlines | Natural Earth via the `world-atlas` npm package | Public domain |
| Fonts | Bebas Neue, League Spartan, EB Garamond, Montserrat | SIL Open Font License |

## Rebuild
1. `src/make_vo.py` makes the narration clips. 2. `src/audio.py` makes the mix. 3. `src/render.js` renders frames from `src/web/index.html`. 4. `src/mux.sh` encodes the MP4.
`src/events.json` is the shared timeline that keeps the visuals and the sound in sync.

## v3 – built from the client's own photos and video
`Tour_Architex_Spain_2027_Student_Reel_v3_Your_Photos.mp4` uses photos and one video clip from the shared Drive folder "Tour Promo Pics"
(the original graphics-only cut is still `Tour_Architex_Spain_2027_Student_Reel.mp4`).
The media itself is not committed. `src/web/scenesP.js` loads graded copies from `src/web/media/` (made from the Drive files).
Only photos that looked clearly real and sharp were used. Seville, Porto and brand-dominated shots were left out.
v3 fixes: the Alhambra video clip is a portrait phone recording with a rotation flag, so it now plays at its true 720x1280 (it was squashed in v2).
Narration names are set by exact phonemes in `src/make_vo.py`: Murcia "MUR-shuh", Cartagena Spanish "kar-tah-HEH-nah".
