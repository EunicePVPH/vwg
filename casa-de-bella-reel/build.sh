#!/usr/bin/env bash
# Rebuild the reel from the raw footage. Needs: ffmpeg (with libvidstab, libx264), python3, numpy, Pillow.
#   ./build.sh            full rebuild (about 10 minutes)
#   ./build.sh text       text/timing-only change (edit.json "text", "grain", etc.)  ~7 minutes
# Big intermediates go to ./work (or $REEL_WORK).
set -euo pipefail
cd "$(dirname "$0")"
if [ "${1:-all}" != "text" ]; then
  python3 1_prep_shots.py      # cut + upscale + stabilise
  python3 2_render_shots.py    # speed ramps, grade, sharpen
fi
python3 3_assemble.py          # transitions, typography, encode both MP4s
python3 4_verify.py            # QC report + contact sheet
