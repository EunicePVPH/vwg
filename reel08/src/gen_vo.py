import sys, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
S=sys.argv[1]
k=Kokoro(f"{S}/models/kokoro-v1.0.onnx", f"{S}/models/voices-v1.0.bin")
lines={
 "v1":"Need business support, but not a full-time hire?",
 "v2":"Your inbox, calendar, admin, and client follow-ups keep piling up.",
 "v3":"What if you had support for the tasks you could hand off?",
 "v4":"From admin and scheduling, to research and follow-ups, ProVirtual can help.",
 "v5":"Find a support arrangement that fits your business.",
 "v6":"D M, V A, to get started.",
}
voice=sys.argv[2] if len(sys.argv)>2 else "af_heart"
speed=float(sys.argv[3]) if len(sys.argv)>3 else 1.0
for n,t in lines.items():
    a,sr=k.create(t,voice=voice,speed=speed,lang="en-us")
    sf.write(f"{S}/build/vo/{n}_{voice}.wav",a,sr)
    print(n,voice,round(len(a)/sr,2),"s",sr)
