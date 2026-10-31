#!/bin/bash
# usage: encode.sh frames_dir out.mp4
FR="$1"; OUT="$2"; A=audio/mix_raw.wav
ffmpeg -y -loglevel error -framerate 60 -i "$FR/%05d.jpg" -i "$A" \
 -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n,2),1)',setpts=N/(30*TB),format=yuv420p[v];[1:a]loudnorm=I=-14:TP=-1.5:LRA=9,aresample=44100[a]" \
 -map "[v]" -map "[a]" -r 30 -c:v libx264 -preset slow -crf 19 -maxrate 14M -bufsize 28M -profile:v high -level 4.2 -pix_fmt yuv420p -movflags +faststart \
 -c:a aac -b:a 192k -ar 44100 -t 20 "$OUT"
