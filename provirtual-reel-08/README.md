# ProVirtual PH — Reel #8: Flexible Virtual Assistance

Final video: `ProVirtual_PH_Reel_08_Flexible_Virtual_Assistance.mp4`
(1080x1920, 9:16, 30 fps, 25.0 s, H.264 + AAC stereo, about -14 LUFS)

Alternate: `ProVirtual_PH_Reel_08_music_only_no_voiceover.mp4` (same video, music and sound effects only).

## Voiceover script (as spoken in the video)
1. Need business support, but not a full-time hire?
2. Your inbox, calendar, admin, and follow-ups keep piling up.
3. What if you had support for the tasks you could hand off?
4. From admin and scheduling to research and follow-ups, ProVirtual can help.
5. Find support that fits your business.
6. Message V A to get started.

## Rebuild
    node events.js events.json                 # shared timing list for the sound effects
    python3 audio.py events.json audio_out     # music, SFX, voiceover -> mix_vo.wav / mix_novo.wav
    node render.js frames 0 750                # 750 frames (needs Playwright + Chromium)
    ffmpeg -framerate 30 -i frames/f_%05d.png -i audio_out/mix_vo.wav -c:v libx264 -crf 17 -pix_fmt yuv420p \
      -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -shortest out.mp4
