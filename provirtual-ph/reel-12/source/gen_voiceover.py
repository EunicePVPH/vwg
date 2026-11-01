import soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro.onnx","voices.bin")
lines = {
 1:("Still chasing updates every week?",1.0),
 2:("Planning, coordination, and tracking all take time.",1.0),
 3:("Keep work organized, and know what needs attention.",1.0),
 4:("Turn a busy week into a clear view of what's moving forward.",1.0),
 5:("ProVirtual helps keep your operations organized.",1.1),
 6:("Message OPS to get started.",1.1),
}
for i,(t,sp) in lines.items():
    s, sr = k.create(t, voice="af_heart", speed=sp, lang="en-us")
    sf.write(f"final_{i}.wav", s, sr); print(i, round(len(s)/sr,2), sr)
