import sys, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
S=sys.argv[1]
k=Kokoro(f"{S}/models/kokoro-v1.0.onnx", f"{S}/models/voices-v1.0.bin")
voice=sys.argv[2]; speed=float(sys.argv[3])
lines={
 "v1":"You started a business. Not a second full-time job.",
 "v2":"Emails. Content. Admin. Follow-ups. It never stops.",
 "v3":"But you don't have to carry it all.",
 "v4":"With ProVirtual, get support behind the scenes, so you can focus on growing your business.",
 "v5a":"Ready for backup?",
 "v5b":"ProVirtual P H.",
 "v5c":"Message SUPPORT to get started.",
}
for n,t in lines.items():
    a,sr=k.create(t,voice=voice,speed=speed,lang="en-us")
    sf.write(f"{S}/build/vo/{n}.wav",a,sr)
    print(n,round(len(a)/sr,2),"s",sr,"peak",round(float(np.abs(a).max()),2))
