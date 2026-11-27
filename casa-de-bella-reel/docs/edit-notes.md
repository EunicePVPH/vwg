# Casa de Bella reel - source timestamps and editing decisions

Raw file: 1:55.8, 944x528 stored with a -90 degree rotation flag (plays as 528x944 portrait). It is low resolution
(about 0.65 Mbps, WhatsApp-compressed), so the reel upscales it about 2x. See "Quality notes" below.

## Final timeline (28.0 s, 840 frames, 30 fps, 90 BPM grid - every cut is on a beat)

| Out time | Shot | Source range | Speed | What and why |
|---|---|---|---|---|
| 0:00.0-2.0 | F1 | 0:00.5-0:05.1 | 1.3x -> 2.7x -> 2.2x | HOOK. Glide along the storefront: CB window logo, pumpkin, door. Starts crisp, speeds up. Text 1. |
| 0:02.0-3.3 | F2 | 0:09.1-0:10.4 | 1.0x | Door with the CB logo (the sharpest exterior footage). 8-frame dissolve. |
| 0:03.3-4.0 | F3 | 0:17.8-0:18.5 | 1.0x | Hand on the door handle - the first-person "entering" moment. Hard cut on the beat. |
| 0:04.0-8.0 | R | 0:19.1-0:24.7 | 0.9x -> 3.4x -> 0.65x | SPEED RAMP. Reception, the embossed CB wall, a fast whoosh across the floor, then a slow landing on the shampoo stations. Text 2 lands as it slows. |
| 0:08.0-9.3 | B1 | 0:34.9-0:36.1 | 0.97x | Beauty station with gold mirror. Text 3. |
| 0:09.3-11.3 | L | 0:39.1-0:40.8 | 0.88x | Waiting lounge in window light. |
| 0:11.3-14.0 | M | 0:42.0-0:44.6 | 0.98x | Styling counter, round mirrors, pink bottles. Text 4. |
| 0:14.0-15.3 | W | 0:45.1-0:48.1 | 2.0x -> 2.5x | Walking sequence sped up, with motion blur, toward the nail lounge. |
| 0:15.3-17.3 | N1 | 0:49.4-0:51.2 | 0.9x | "the nail lounge" sign and polish wall. Text 5. |
| 0:17.3-18.7 | N2 | 0:51.95-0:52.6 | 0.49x | Pedicure chairs in gentle slow motion. |
| 0:18.7-21.3 | T1 | 1:23.9-1:26.4 | 0.94x | Private treatment room (the sharpest interior footage). Text 6. |
| 0:21.3-22.7 | T2 | 1:28.4-1:29.7 | 0.97x | Treatment room vanity and shelf. |
| 0:22.7-28.0 | E | 0:18.9-0:19.7 | 0.55x easing to a stop | End card: eases to a stop on the embossed CB logo wall at reception, slow push-in, text 7 (now with casadebella.co and 914 563 1711), soft dip to cream. The logo touches the right edge in the raw footage itself, so it reads as a detail crop. |

## Cut from the raw footage
Parking lot (0:11-0:16), side wall and the camera swing (0:05.5-0:08), the long dark/white hallway and door
frames (0:26-0:34, 0:57-1:00, 1:09-1:22), the dark wall-mounted hair-treatment machine close-ups (0:57-1:02),
the supply cabinet (1:05-1:09), laundry machines (1:13-1:17), the bathroom (1:32-1:47), the final dark hallway
(1:47-1:55). The reflections of the person filming in the glass door (0:17-0:18) and bathroom mirror were avoided
on purpose. The "We're hiring" poster is only visible for a fraction of a second at 2.2x speed.

## Technical decisions
- Orientation: ffmpeg applies the -90 degree rotation flag; output has no rotation tag and was visually checked.
- Stabilisation: vidstab per shot (smoothing 12 frames, adaptive static zoom, max shift 90 px). No black borders in any shot.
- Cleanup: light temporal denoise (hqdn3d) to soften compression blocks, Lanczos upscale, light unsharp, subtle film grain (also hides upscaling softness).
- Colour: per-shot auto white balance (60% strength), exposure to a target mid-grey with soft highlight roll-off, slightly lifted blacks, shadows nudged warm-brown, highlights cream, gentle saturation lift (pinks and creams). Windows were left natural, not blown out.
- Speed: 2.0x-3.4x on walking/transition moments; normal or slightly slow speed (0.88-0.98x) on beauty shots. Speed changes use eased curves with frame-blended motion blur.
- Transitions: hard cuts on the beat, short dissolves (6-10 frames) only when changing space, one dip to cream at the very end. No flashes, glows or sparkles.
- Type: Cormorant Garamond (light serif, with italic accents) and Jost (small spaced caps), both SIL Open Font License. Cream text with a soft warm-brown shadow and a faint warm scrim behind the text.
- Safe zones (1080x1920): all text sits between y=300 and y=1450 and x=80 to 940 - clear of the Reels top bar, bottom caption area and right-side buttons. The build script checks this automatically.
- Music: none included (no licensed track available). The MP4 carries a silent audio track so Instagram/Facebook accept it, and music can be added in-app. Cuts sit on a 90 BPM grid: pick a track around 90 BPM (or 45/180 BPM) and the cuts will land on the beat.

## Quality notes (honest)
- The source is 528x944 and heavily compressed, so the 1080x1920 output is an upscale. It looks fine on a phone but is softer than native 1080p footage. For the next version, re-shoot or re-send the original phone file (not the WhatsApp copy) and the same project will rebuild at full sharpness.
- Some interior walking shots had hand-shake blur that stabilisation cannot remove, so those moments are short or sped up.
