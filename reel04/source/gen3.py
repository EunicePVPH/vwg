import sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
S=sys.argv[1]; V="af_jessica"
k=Kokoro(f"{S}/models/kokoro-v1.0.onnx", f"{S}/models/voices-v1.0.bin")
def f0std(a,sr):
    fl=int(sr*0.04);hop=int(sr*0.01);f0=[]
    for i in range(0,len(a)-fl,hop):
        x=a[i:i+fl]*np.hanning(fl)
        if np.sqrt((x**2).mean())<0.02: continue
        ac=np.correlate(x,x,'full')[fl-1:]; ac/=ac[0]+1e-9
        lo,hi=int(sr/400),int(sr/90); p=np.argmax(ac[lo:hi])+lo
        if ac[p]>0.45: f0.append(sr/p)
    f0=np.array(f0); 
    return (12*np.log2(f0/np.median(f0))).std() if len(f0)>5 else 0
L={"v1a":("You started a business!",1.2),"v1b":("Not a second full-time job.",1.2),
   "w1":("Emails!",1.45),"w2":("Content!",1.45),"w3":("Admin!",1.45),"w4":("Follow-ups!",1.45),"w5":("It never stops.",1.0),
   "v3":("But you don't have to carry it all.",1.0),
   "v4":("With ProVirtual, get support behind the scenes, so you can focus on growing your business!",1.0),
   "v5a":("Ready for backup?",1.05),"v5b":("ProVirtual P H!",1.05),"v5c":("Message SUPPORT to get started!",1.08)}
for n,(t,sp) in L.items():
    a,sr=k.create(t,voice=V,speed=sp,lang="en-us")
    e=np.abs(a); idx=np.where(e>0.02*e.max())[0]; a=a[max(0,idx[0]-int(0.02*sr)):idx[-1]+int(0.04*sr)]
    sf.write(f"{S}/build/vo2/{n}.wav",a,sr); print(f"{n:4s} {len(a)/sr:.2f}s  F0std {f0std(a,sr):.1f}st  '{t}'")
