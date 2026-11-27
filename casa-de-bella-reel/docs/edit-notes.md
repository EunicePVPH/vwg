# Casa de Bella reel - source timestamps and editing decisions

Raw file: 1:55.8, 944x528 stored with a -90 degree rotation flag (plays as 528x944 portrait). It is low resolution
(about 0.65 Mbps, WhatsApp-compressed), so the reel upscales it about 2x. See "Quality notes" below.

## Final timeline - version 2, calmer (31.3 s, 940 frames, 30 fps, 90 BPM grid)

Version 2 replaces the faster first cut after feedback ("too fast paced and blurred"). Everything now plays at normal speed
(one shot at 1.05x), uses real source frames only (no blended frames, no whoosh blur), and has fewer, longer shots.
The first version's list is saved in `docs/edit_v1_fast.json` if you want any of it back.

| Out time | Shot | Source range | What and why |
|---|---|---|---|
| 0:00.0-3.3 | F1 | 0:01.6-0:04.9 | HOOK. Calm glide along the storefront: CB window logo, pumpkin. Text 1. |
| 0:03.3-5.3 | F2 | 0:08.9-0:10.9 | Approach the door with the CB logo. |
| 0:05.3-9.3 | E1 | 0:17.95-0:22.15 | First-person entry in one take: hand on handle, through the door, reception, mirrors. |
| 0:09.3-11.3 | R2 | 0:22.8-0:24.8 | Shampoo stations and pendant lamp. Text 2. |
| 0:11.3-13.3 | B1 | 0:34.35-0:36.35 | Beauty station with gold mirror. Text 3. |
| 0:13.3-15.3 | L | 0:38.9-0:40.9 | Waiting lounge in window light. |
| 0:15.3-18.0 | M | 0:42.0-0:44.7 | Styling counter, round mirrors, pink bottles. Text 4. |
| 0:18.0-20.7 | N1 | 0:49.1-0:51.8 | Nail lounge sign and polish wall. Text 5. |
| 0:20.7-22.0 | N2 | 0:51.9-0:53.2 | Pedicure chairs, ending on the polish wall. |
| 0:22.0-24.7 | T1 | 1:23.9-1:26.6 | Private treatment room. Text 6. |
| 0:24.7-26.0 | T2 | 1:28.4-1:29.7 | Treatment room vanity and shelf. |
| 0:26.0-31.3 | E | 0:18.9-0:19.7 | End card: eases to a stop on the embossed CB logo wall, text 7 with casadebella.co and 914 563 1711, soft dip to cream. The logo touches the right edge in the raw footage itself. |

Transitions: soft 8-12 frame dissolves when changing space, hard cuts on the beat inside a space.

## Cut from the raw footage
Parking lot (0:11-0:16), side wall and the camera swing (0:05.5-0:08), the long dark/white hallway and door
frames (0:26-0:34, 0:57-1:00, 1:09-1:22), the dark wall-mounted hair-treatment machine close-ups (0:57-1:02),
the supply cabinet (1:05-1:09), laundry machines (1:13-1:17), the bathroom (1:32-1:47), the final dark hallway
(1:47-1:55). The reflections of the person filming in the glass door (0:17-0:18) and bathroom mirror were avoided
on purpose. The "We're hiring" poster is only visible for a fraction of a second at 2.2x speed.

## Technical decisions
- Orientation: ffmpeg applies the -90 degree rotation flag; output has no rotation tag and was visually checked.
- Stabilisation: vidstab per shot (smoothing 12 frames, adaptive static zoom, max shift 90 px). No black borders in any shot.
- Cleanup: very light denoise (hqdn3d), Lanczos upscale, unsharp mask, subtle film grain (also hides upscaling softness).
- Colour: per-shot auto white balance (60% strength), exposure to a target mid-grey with soft highlight roll-off, slightly lifted blacks, shadows nudged warm-brown, highlights cream, gentle saturation lift (pinks and creams). Windows were left natural, not blown out.
- Speed: normal speed throughout in version 2. Speed ramps and 2-3x walks existed in version 1 and can be re-added in `edit.json` if wanted (they cost sharpness because the source is low resolution).
- Transitions: hard cuts on the beat, short dissolves (6-10 frames) only when changing space, one dip to cream at the very end. No flashes, glows or sparkles.
- Type: Cormorant Garamond (light serif, with italic accents) and Jost (small spaced caps), both SIL Open Font License. Cream text with a soft warm-brown shadow and a faint warm scrim behind the text.
- Safe zones (1080x1920): all text sits between y=300 and y=1450 and x=80 to 940 - clear of the Reels top bar, bottom caption area and right-side buttons. The build script checks this automatically.
- Music: none included (no licensed track available). The MP4 carries a silent audio track so Instagram/Facebook accept it, and music can be added in-app. Cuts sit on a 90 BPM grid: pick a track around 90 BPM (or 45/180 BPM) and the cuts will land on the beat.

## Quality notes (honest)
- The source is 528x944 and heavily compressed, so the 1080x1920 output is an upscale. It looks fine on a phone but is softer than native 1080p footage. For the next version, re-shoot or re-send the original phone file (not the WhatsApp copy) and the same project will rebuild at full sharpness.
- Some interior walking shots had hand-shake blur that stabilisation cannot remove, so those moments are short or sped up.
