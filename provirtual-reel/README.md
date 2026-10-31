# ProVirtual PH - Business Delegation Audit Reel

**Deliverable:** `ProVirtual_PH_Business_Delegation_Audit_Reel.mp4`
1080x1920 (9:16), 30 fps, 25.0 s, H.264 + AAC stereo, about -14 LUFS.

Everything is original: motion graphics are HTML/CSS rendered frame-by-frame in Chromium,
music and sound effects are synthesized (numpy/scipy), the narration is generated on-device
with the Supertonic 3 neural TTS model (OpenRAIL-M license). No stock footage, no licensed music.
`assets/cover.png` is the Business Delegation Audit cover supplied by ProVirtual PH.

## Rebuild
```
cd source
python3 gen_timeline.py                       # card choreography (seeded, deterministic)
node render.cjs <out> <k> 4 &  (k = 0..3)     # 750 frames, 4 workers
python3 blend.py <out>                        # motion-blur sub-frame blend
python3 make_vo.py <supertonic_model_dir> <vo_dir>
python3 audio.py timeline.json <vo_dir> mix.wav
ffmpeg -framerate 30 -i <out>/frames/%05d.jpg -i mix.wav ... (see build notes in chat)
```
The Supertonic model files (145 MB) are not committed.
