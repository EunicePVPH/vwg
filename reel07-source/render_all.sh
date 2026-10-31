#!/bin/bash
# Renders all 750 frames (25 s @ 30 fps) with 4 parallel Chromium workers.
OUT=${1:-frames}; export NODE_PATH=$(npm root -g); cd "$(dirname "$0")"; mkdir -p "$OUT"
node render.js "$OUT" 0 188 hq > "$OUT/w0.log" 2>&1 &
node render.js "$OUT" 188 376 hq > "$OUT/w1.log" 2>&1 &
node render.js "$OUT" 376 564 hq > "$OUT/w2.log" 2>&1 &
node render.js "$OUT" 564 750 hq > "$OUT/w3.log" 2>&1 &
wait; echo done; ls "$OUT"/f_*.jpg | wc -l
