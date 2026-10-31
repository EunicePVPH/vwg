import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
SP=sys.argv[1]; VOICE=sys.argv[2]; SPEED=float(sys.argv[3])
k=Kokoro(f"{SP}/models/kokoro-v1.0.onnx", f"{SP}/models/voices-v1.0.bin")
lines = {
 "s1":  "What if this summer took you somewhere extraordinary?",
 "s2":  "From Madrid's vibrant streets, to Granada's breathtaking Alhambra.",
 "s3a": "Kayak along Spain's coast.",
 "s3b": "Discover ancient cities.",
 "s3c": "Dance to new rhythms.",
 "s4a": "Explore Murcia and Cartagena.",
 "s4b": "Make friends.",
 "s4c": "Build confidence.",
 "s4d": "Experience a world beyond the classroom.",
 "s5a": "Spain, twenty twenty-seven.",
 "s5b": "July twelfth, to twenty-second.",
 "s6a": "Twenty-four student spots.",
 "s6b": "Your adventure starts here.",
}
out={}
for key,txt in lines.items():
    a,sr=k.create(txt, voice=VOICE, speed=SPEED, lang="en-us")
    a=np.asarray(a,dtype=np.float32)
    # trim silence
    thr=0.01*np.abs(a).max(); idx=np.where(np.abs(a)>thr)[0]
    a=a[max(0,idx[0]-int(0.02*sr)):idx[-1]+int(0.06*sr)]
    sf.write(f"{SP}/vo/{key}.wav", a, sr)
    out[key]=round(len(a)/sr,3)
print(VOICE,SPEED,json.dumps(out), "sum=",round(sum(out.values()),2))
json.dump(out, open(f"{SP}/vo/durations.json","w"))
