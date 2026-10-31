import soundfile as sf, numpy as np, sys
from kokoro_onnx import Kokoro
M="/tmp/claude-0/-home-user-vwg/c8ca43b1-0312-58fd-852e-29310ca1461f/scratchpad/models/"
k=Kokoro(M+"kokoro-v1.0.int8.onnx",M+"voices-v1.0.bin")
LINES={
 "l1":"Your website should do more than just look good.",
 "l2":"Make a powerful first impression.",
 "l3":"Turn attention into real business opportunities.",
 "l4":"Every step of the journey, designed to count.",
 "l5":"Websites. Landing pages. Sales funnels. Built for your business.",
 "l6":"Let's build your online presence.",
 "l7":"Pro Virtual P H.",
}
voice=sys.argv[1] if len(sys.argv)>1 else "af_heart"
speed=float(sys.argv[2]) if len(sys.argv)>2 else 1.0
for n,t in LINES.items():
    s,sr=k.create(t,voice=voice,speed=speed,lang="en-us")
    sf.write(f"vo/{n}_{voice}.wav",s,sr)
    print(n,voice,round(len(s)/sr,2),"s",sr)
