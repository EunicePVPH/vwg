import sys, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
S=sys.argv[1]
k=Kokoro(f"{S}/models/kokoro-v1.0.onnx", f"{S}/models/voices-v1.0.bin")
V="af_heart"
lines={ "w1":("Emails.",1.05),"w2":("Content.",1.05),"w3":("Admin.",1.05),"w4":("Follow-ups.",1.05),"w5":("It never stops.",0.98),
        "v4":("With ProVirtual, get support behind the scenes, so you can focus on growing your business.",1.06)}
for n,(t,sp) in lines.items():
    a,sr=k.create(t,voice=V,speed=sp,lang="en-us")
    # trim leading/trailing silence
    e=np.abs(a); idx=np.where(e>0.02*e.max())[0]; a=a[max(0,idx[0]-int(0.02*sr)):idx[-1]+int(0.06*sr)]
    sf.write(f"{S}/build/vo/{n}.wav",a,sr); print(n,round(len(a)/sr,2))
