#!/bin/bash
# Usage: encode.sh <frames_dir> <audio_wav> <out_mp4>
set -e
ffmpeg -hide_banner -y -framerate 30 -i "$1/f_%04d.jpg" -i "$2" \
  -vf "scale=1080:1920:in_range=full:out_range=tv:out_color_matrix=bt709:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.2 -r 30 -g 60 -bf 2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -t 25 -movflags +faststart -shortest "$3"
