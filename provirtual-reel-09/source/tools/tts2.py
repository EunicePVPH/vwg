import sys, numpy as np, soundfile as sf, os
from kokoro_onnx import Kokoro
S=sys.argv[1]; out=S+'/audio/vo'; os.makedirs(out,exist_ok=True)
k=Kokoro(f"{S}/models/kokoro-v1.0.onnx", f"{S}/models/voices-v1.0.bin")
lines=[("Think a virtual assistant only handles emails? Think bigger.",1.0),
("From administration and everyday business operations...",1.0),
("To social media strategy, content, and digital marketing.",1.0),
("Websites, landing pages, and digital customer journeys.",1.0),
("Research, lead generation, and creative production support.",1.0),
("One team. Multiple ways to support your business.",1.1),
("ProVirtual PH. More than just a VA.",1.12)]
for i,(t,sp) in enumerate(lines):
    a,sr=k.create(t,voice="af_heart",speed=sp,lang="en-us")
    sf.write(f"{out}/vo{i+1}.wav",a,sr)
    # envelope onsets
    e=np.abs(a); win=int(sr*.02); env=np.convolve(e,np.ones(win)/win,'same')
    on=env>0.02
    segs=[];st=None
    for j,v in enumerate(on):
        if v and st is None: st=j
        if not v and st is not None:
            if segs and (st-segs[-1][1])<sr*.06: segs[-1][1]=j
            else: segs.append([st,j])
            st=None
    print(i+1,round(len(a)/sr,2),[(round(s/sr,2),round(e_/sr,2)) for s,e_ in segs])
