import sys, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
k = Kokoro("/tmp/voices/kokoro-v1.0.onnx", "/tmp/voices/voices-v1.0.bin")
print(sorted(k.get_voices()))
voice = sys.argv[1]
lines = {
 "l1": ("They reached out. Did you follow up?", 0.98),
 "l2": ("When business gets busy, inquiries can get buried.", 1.0),
 "l3": ("Bring structure to your follow-up process.", 1.0),
 "l4": ("Pro Virtual helps organize your inquiries, follow-ups, and client communications.", 1.08),
 "l5": ("Keep your next steps clear.", 0.97),
 "l6": ("Pro Virtual P H. Message FOLLOW UP.", 0.97),
}
for key,(t,sp) in lines.items():
    s, sr = k.create(t, voice=voice, speed=sp, lang="en-us")
    sf.write(f"vo/{voice}_{key}.wav", s, sr)
    print(voice, key, round(len(s)/sr,2), "s")
