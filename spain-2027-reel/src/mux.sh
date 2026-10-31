#!/bin/bash
# usage: mux.sh <scratch dir>  -> out/Tour_Architex_Spain_2027_Student_Reel.mp4
set -e; cd "$1"; mkdir -p out
M=$(ffmpeg -hide_banner -nostats -i build/mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
set -- $(echo "$M" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
ffmpeg -y -hide_banner -loglevel error -i build/mix_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true,aresample=48000" -ar 48000 build/mix_final.wav
ffmpeg -y -hide_banner -loglevel error -framerate 30 -i frames/f_%04d.jpg -i build/mix_final.wav \
 -vf "scale=1080:1920:flags=lanczos:in_range=full:in_color_matrix=bt601:out_range=limited:out_color_matrix=bt709,format=yuv420p" \
 -c:v libx264 -preset slow -crf 20 -maxrate 10M -bufsize 20M -profile:v high -level 4.1 -pix_fmt yuv420p -r 30 -g 60 -bf 2 \
 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
 -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -t 30 out/Tour_Architex_Spain_2027_Student_Reel.mp4
