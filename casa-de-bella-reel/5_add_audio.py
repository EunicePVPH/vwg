#!/usr/bin/env python3
"""Step 5 - build the audio versions from the finished (silent) reel.

  audio/music.mp3        instrumental bed (AI-generated with ElevenLabs Music for this project)
  audio/voiceover.mp3    one take of the narration, all 7 lines
Outputs:
  output/casa-de-bella-reel_music.mp4            reel + text + music
  output/casa-de-bella-reel_music_voiceover.mp4  reel + text + music + voiceover (music ducks under the voice)

The voiceover is cut into its 7 lines by silence detection and each line is placed at the moment its text appears.
Edit VO_STARTS below (seconds) to move a line. The video stream is copied untouched.
"""
import re
import subprocess
import sys

from reel_lib import ROOT

A = ROOT / "audio"
OUT = ROOT / "output"
VIDEO = OUT / "casa-de-bella-reel.mp4"
DUR = 31.333
# when each voiceover line starts (seconds) - roughly 0.1 s after its on-screen text begins
# segments to join into one line (index pairs after silence detection)
MERGE = [(2, 3)]
VO_STARTS = [0.65, 9.65, 12.1, 15.7, 18.4, 22.5, 26.9]


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr)
        sys.exit(1)
    return r.stderr


def duration(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                 str(path)], capture_output=True, text=True).stdout)


def segments(path, noise="-35dB", min_sil=0.28):
    err = run(["ffmpeg", "-i", str(path), "-af", f"silencedetect=noise={noise}:d={min_sil}", "-f", "null", "-"])
    total = duration(path)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    segs, pos = [], 0.0
    for s, e in zip(starts, ends):
        if s - pos > 0.15:
            segs.append((pos, s))
        pos = e
    if total - pos > 0.15:
        segs.append((pos, total))
    return segs


def main():
    vo = A / "voiceover.mp3"
    music = A / "music.mp3"
    segs = segments(vo)
    for i, j in MERGE:  # lines the voice split with a short breath, e.g. 'Your beauty.' / 'Your moment.'
        segs[i:j + 1] = [(segs[i][0], segs[j][1])]
    print("voiceover segments:", [(round(a, 2), round(b, 2)) for a, b in segs])
    if len(segs) != len(VO_STARTS):
        print(f"expected {len(VO_STARTS)} lines, found {len(segs)} - adjust silence settings or VO_STARTS")
        sys.exit(1)

    # ---- version 1: music only
    bed = (f"[1:a]atrim=0:{DUR},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.8,afade=t=out:st={DUR - 2.8}:d=2.8,"
           f"loudnorm=I=-15:TP=-1.5:LRA=7[mus]")
    run(["ffmpeg", "-y", "-i", str(VIDEO), "-i", str(music), "-filter_complex", bed, "-map", "0:v", "-map", "[mus]",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", str(DUR), "-movflags", "+faststart",
         str(OUT / "casa-de-bella-reel_music.mp4")])
    print("wrote music version")

    # ---- version 2: music + voiceover (music ducked while the voice speaks)
    parts, labels = [], []
    for i, ((a, b), st) in enumerate(zip(segs, VO_STARTS)):
        # a small pad either side so consonants are not clipped
        a0, b0 = max(0, a - 0.06), b + 0.10
        parts.append(f"[2:a]atrim={a0:.3f}:{b0:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,"
                     f"adelay={int(st * 1000)}|{int(st * 1000)}[v{i}]")
        labels.append(f"[v{i}]")
    fc = ";".join(parts) + ";" + "".join(labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,"
    fc += f"apad=whole_dur={DUR},atrim=0:{DUR},highpass=f=70,loudnorm=I=-15:TP=-1.5:LRA=7,asplit=2[vo][vosc];"
    fc += (f"[1:a]atrim=0:{DUR},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.8,afade=t=out:st={DUR - 2.8}:d=2.8,volume=0.55[m];"
           f"[m][vosc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=500:makeup=1[ducked];"
           f"[ducked][vo]amix=inputs=2:normalize=0:dropout_transition=0,alimiter=limit=0.95[mix]")
    run(["ffmpeg", "-y", "-i", str(VIDEO), "-i", str(music), "-i", str(vo), "-filter_complex", fc,
         "-map", "0:v", "-map", "[mix]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", str(DUR),
         "-movflags", "+faststart", str(OUT / "casa-de-bella-reel_music_voiceover.mp4")])
    print("wrote music + voiceover version")


if __name__ == "__main__":
    main()
