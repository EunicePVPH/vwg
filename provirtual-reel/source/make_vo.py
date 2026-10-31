import numpy as np, soundfile as sf, sys, json, os
from supertonic import TTS
MODEL = sys.argv[1]; OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
tts = TTS(model_dir=MODEL, auto_download=False)
style = tts.get_voice_style_from_path(f'{MODEL}/voice_styles/v2.json')
LINES = [
 ("vo1", "Still doing everything yourself?", 0.35, 2.7),
 ("vo2", "Emails. Content. Admin. Follow-ups. It all adds up.", 3.05, 3.9),
 ("vo3", "What if you knew exactly where to start?", 7.55, 3.0),
 ("vo4", "Discover what needs your attention, and what could be handed off.", 12.3, 4.5),
 ("vo5", "Make room to focus on what matters most.", 17.4, 3.2),
 ("vo6", "Start with a Business Delegation Audit from Pro Virtual P H.", 21.1, 3.85),
]
info = {}
for name, text, start, maxdur in LINES:
    best = None
    for speed in (1.0, 1.03, 1.06, 1.09, 1.12, 1.15, 1.2, 1.25):
        wav, dur = tts.synthesize(text, voice_style=style, lang='en', speed=speed, total_steps=10, silence_duration=0.18)
        w = wav.squeeze().astype(np.float32)
        # trim leading/trailing silence
        thr = 0.01; idx = np.where(np.abs(w) > thr)[0]
        w = w[max(0, idx[0]-int(.03*tts.sample_rate)): idx[-1]+int(.12*tts.sample_rate)]
        d = len(w)/tts.sample_rate
        best = (speed, w, d)
        if d <= maxdur: break
    speed, w, d = best
    sf.write(f'{OUT}/{name}.wav', w, tts.sample_rate)
    info[name] = {"start": start, "dur": d, "speed": speed, "text": text}
    print(name, 'speed', speed, 'dur %.2f'%d, 'ends %.2f'%(start+d), 'limit %.2f'%(start+maxdur))
json.dump(info, open(f'{OUT}/vo.json','w'), indent=1)
