"""Original electronic score for the ProVirtual PH reel, synthesised from scratch with numpy.
Beat grid: 120 BPM (0.5 s per beat) so scene cuts at 3/6/9/12/17/20 s land on beats."""
import numpy as np, wave, sys
SR=44100; DUR=20.0; N=int(SR*DUR)
rng=np.random.default_rng(11)
L=np.zeros(N); R=np.zeros(N)

def tt(d): return np.arange(int(SR*d))/SR
def add(t0,sig,g=1.0,pan=0.0):
    i=int(t0*SR)
    if i>=N: return
    s=sig[:N-i]
    L[i:i+len(s)]+=s*g*np.cos((pan+1)*np.pi/4)
    R[i:i+len(s)]+=s*g*np.sin((pan+1)*np.pi/4)
def env(t,a,d): return np.minimum(t/a,1)*np.exp(-t/d)
def hp(x): return np.diff(x,prepend=0)
def smooth(x,k):
    c=np.cumsum(np.insert(x,0,0)); y=(c[k:]-c[:-k])/k; return np.concatenate([np.full(k-1,y[0]),y])
def midi(n): return 440*2**((n-69)/12)

def kick(g=1):
    t=tt(0.5); f=45+120*np.exp(-t*28); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*np.exp(-t*7)+0.25*hp(rng.normal(0,1,len(t)))*np.exp(-t*90))*g
def hat(open_=False):
    t=tt(0.18 if open_ else 0.06); n=hp(hp(rng.normal(0,1,len(t)))); return n*np.exp(-t*(18 if open_ else 70))*0.35
def clap():
    t=tt(0.25); n=smooth(rng.normal(0,1,len(t)),3)
    e=np.exp(-t*22)+0.7*np.exp(-np.maximum(t-0.012,0)*30)*(t>0.012)+0.5*np.exp(-np.maximum(t-0.024,0)*30)*(t>0.024)
    return hp(n)*e*0.9
def boom(d=1.6):
    t=tt(d); f=70*np.exp(-t*1.4)+28; ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*np.exp(-t*2.2)*1.0+0.5*hp(rng.normal(0,1,len(t)))*np.exp(-t*9))
def thud(f0=95):
    t=tt(0.35); f=f0*np.exp(-t*9)+38; ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*9)+0.3*hp(rng.normal(0,1,len(t)))*np.exp(-t*60)
def riser(d,lo=300,hi=5000):
    t=tt(d); p=t/d
    n=hp(rng.normal(0,1,len(t)))*(p**2.2)
    f=lo*(hi/lo)**p; ph=2*np.pi*np.cumsum(f)/SR
    tone=np.sin(ph)*(p**3)*0.35+np.sin(ph*1.505)*(p**3)*0.15
    return (n*0.55+tone)*np.minimum((d-t)/0.02,1)
def whoosh(d=0.6,up=True):
    t=tt(d); p=t/d; e=np.sin(np.pi*p)**1.6
    n=hp(rng.normal(0,1,len(t)))
    n=smooth(n,6)*3
    return n*e*0.7
def pluck(f,d=0.45,bright=1.0):
    t=tt(d); s=np.sin(2*np.pi*f*t)+0.45*bright*np.sin(2*np.pi*2*f*t)*np.exp(-t*14)+0.2*np.sin(2*np.pi*3*f*t)*np.exp(-t*20)
    return s*np.minimum(t/0.003,1)*np.exp(-t*7)*0.5
def bell(f,d=2.6):
    t=tt(d); idx=2.2*np.exp(-t*3.5)
    s=np.sin(2*np.pi*f*t+idx*np.sin(2*np.pi*f*3.5*t))+0.4*np.sin(2*np.pi*f*2.0*t)*np.exp(-t*2)
    return s*np.minimum(t/0.004,1)*np.exp(-t*1.9)*0.5
def pad(freqs,d,detune=0.004):
    t=tt(d); outL=np.zeros(len(t)); outR=np.zeros(len(t))
    for f in freqs:
        for k,(dt,side) in enumerate([(-detune,0),(detune,1),(0,2)]):
            ff=f*(1+dt)
            s=sum(np.sin(2*np.pi*ff*n*t+k)/(n**1.8) for n in range(1,7))
            if side==0: outL+=s
            elif side==1: outR+=s
            else: outL+=s*.6; outR+=s*.6
    a=np.minimum(t/0.6,1)*np.minimum((d-t)/0.5,1)
    return outL*a/len(freqs),outR*a/len(freqs)
def bass(f,d=0.5):
    t=tt(d); s=np.sin(2*np.pi*f*t)+0.35*np.sin(2*np.pi*2*f*t)+0.12*np.sin(2*np.pi*3*f*t)
    return s*np.minimum(t/0.004,1)*np.minimum((d-t)/0.05,1)*np.exp(-t*2.2)

B=0.5
# --- chord progression per bar (2 s): Am F C G ---
prog=[(57,[57,60,64]),(53,[53,57,60]),(48,[52,55,60]),(55,[55,59,62])]
def chord_for(t): return prog[int(t//2)%4]

# ---------- Scene 1: 0-3 hook ----------
add(0.0,boom(1.8),1.0)
for ts,pi in [(0.04,0),(0.20,0),(0.36,0)]: add(ts,thud(110-pi*5),0.9)
add(0.55,riser(0.45,400,3000),0.45)
add(1.00,boom(1.6),0.95); add(1.00,whoosh(0.7),0.5)
add(1.02,bell(midi(81),2.0),0.30,0.2)
# low drone
dL,dR=pad([midi(33),midi(40)],3.0,0.003); add(0,dL,0.22); add(0,dR,0.22)
add(2.35,riser(0.65,300,6000),0.6); add(2.6,whoosh(0.6),0.6)

# ---------- scene 2: 3-6 chaos ----------
for b in range(int((6-3)/B)):
    t=3+b*B; add(t,kick(),0.95)
    add(t+B/2,hat(),0.35,0.25)
    if b%2==1: add(t,clap(),0.4,-0.1)
add(3.0,boom(1.2),0.7)
bn=[33,33,45,33,36,36,43,31]
for b in range(6*2):  # 8th note bass
    t=3+b*0.25
    if b%2==0 or b%4==3: add(t,bass(midi(prog[int((t)//2)%4][0]-24),0.22),0.55)
for ts,k in [(3.0,0),(3.14,1),(3.28,2),(3.42,3),(3.56,4),(3.70,5)]:
    add(ts+0.15,pluck(midi([81,84,88,86,91,93][k]),0.3),0.5,(-0.5+k*0.2))
for i,ts in enumerate([3.5,3.75,4.0,4.25,4.5,4.75]): add(ts,pluck(midi(96+(i%3)*2),0.18),0.28,(-0.7+i*0.28))
add(4.9,riser(1.05,500,7000),0.7)
# gap before organise hit
# ---------- scene 3: 6-9 organise ----------
add(6.0,boom(1.5),1.0); add(6.0,clap(),0.8); add(5.97,whoosh(0.4),0.5)
for b in range(int(3/B)):
    t=6+b*B; add(t,kick(),0.9); add(t+B/2,hat(True) if b%2==1 else hat(),0.32,0.2)
    if b%2==1: add(t,clap(),0.35)
for b in range(12):
    t=6+b*0.25
    add(t,bass(midi(prog[int(t//2)%4][0]-24),0.22),0.5)
for bar in range(2):
    t=6+bar*2; pr=prog[(int(t//2))%4]; a,c=pad([midi(n) for n in pr[1]],2.1); add(t,a,0.33); add(t,c,0.33)
for i in range(6): add(6.5+i*0.12,pluck(midi([72,76,79,84,88,91][i]),0.5),0.55,-0.6+i*0.24)
for i,ts in enumerate([7.55,7.71,7.87]): add(ts,thud(130-i*10),0.85); add(ts,bell(midi(60+12*(i==2)),0.8),0.12)
add(7.55,whoosh(0.5),0.35)
# arp run 7.2-8.4 (16ths)
arp=[69,72,76,81,76,72]
for k in range(12):
    t=7.0+k*0.125; add(t,pluck(midi(arp[k%6]+ (12 if t>7.75 else 0)),0.2),0.22,0.4*(-1)**k)
add(8.35,riser(0.7,300,7500),0.7); add(8.6,whoosh(0.45),0.6)

# ---------- scene 4: 9-12 brand reveal ----------
add(9.0,boom(2.0),1.0); add(8.98,clap(),0.7)
for b in range(int(3/B)):
    t=9+b*B; add(t,kick(),0.85); add(t+B/2,hat(),0.28,0.2)
for b in range(12):
    t=9+b*0.25
    if b%2==0: add(t,bass(midi(prog[int(t//2)%4][0]-24),0.3),0.5)
for bar in range(2):
    t=9+bar*2 +(0 if bar==0 else 0); pr=prog[(int(t//2))%4]; a,c=pad([midi(n) for n in pr[1]]+[midi(pr[1][0]+12)],2.3); add(t,a,0.36); add(t,c,0.36)
add(9.35,bell(midi(81),3.0),0.4,0.0); add(9.35,bell(midi(88),3.0),0.25,0.3)
add(9.45,whoosh(0.7),0.45)
add(10.0,riser(0.8,800,9000),0.45)  # light sweep shimmer
for i,ts in enumerate([10.25,10.47,10.69]): add(ts,thud(120),0.6); add(ts,pluck(midi([76,79,84][i]),0.5),0.45)
add(11.5,riser(0.5,400,6000),0.55); add(11.7,whoosh(0.5),0.55)

# ---------- scene 5: 12-17 services ----------
add(12.0,boom(1.4),0.95); add(11.95,whoosh(0.5),0.5)
for b in range(int(5/B)):
    t=12+b*B; add(t,kick(),0.9); add(t+B/2,hat(True) if b%2==1 else hat(),0.34,0.2)
    if b%2==1: add(t,clap(),0.4)
for b in range(20):
    t=12+b*0.25; n=prog[int(t//2)%4][0]
    add(t,bass(midi(n-24 + (12 if b%4==3 else 0)),0.22),0.5)
for bar in range(3):
    t=12+bar*2; pr=prog[(int(t//2))%4]; a,c=pad([midi(n) for n in pr[1]],2.1); add(t,a,0.34); add(t,c,0.34)
a,c=pad([midi(n) for n in prog[2][1]],1.1); add(16,a,0.34); add(16,c,0.34)
# arp lead
scale=[69,72,76,79,81,84,88,91]
for k in range(40):
    t=12.25+k*0.125
    if t>=16.9: break
    base=prog[int(t//2)%4][1]; note=base[(k%3)]+12+(12 if (k//3)%2 else 0)
    add(t,pluck(midi(note),0.18),0.2,0.5*(-1)**k)
# category cues: whoosh at each wipe + tick cues
for ts in [12.97,14.22,15.47]: add(ts,whoosh(0.5),0.6); add(ts+0.3,thud(100),0.6)
for ci,cs in enumerate([12.0,13.25,14.5,15.75]):
    for k in range(3): add(cs+0.45+k*0.17,pluck(midi(84+k*4),0.15,0.6),0.3,0.4*(k-1))
    add(cs+0.05,bell(midi([76,79,81,84][ci]),1.2),0.18)
add(16.5,riser(0.5,500,8000),0.7)

# ---------- scene 6: 17-20 CTA ----------
add(17.0,boom(2.4),1.0); add(16.98,clap(),0.8)
add(17.05,bell(midi(81),3.0),0.35); add(17.05,bell(midi(76),3.0),0.25,-0.3)
for b in range(int(1.0/B)+1):
    t=17+b*B; add(t,kick(),0.85); add(t+B/2,hat(),0.28,0.2)
for i,ts in enumerate([17.3,17.45,17.6]): add(ts,thud(115-i*8),0.7); add(ts,pluck(midi([72,76,79][i]),0.5),0.45)
a,c=pad([midi(n) for n in [57,60,64,69]],3.0); add(17,a,0.42); add(17,c,0.42)
for k in range(8):
    t=17.0+k*0.25
    if t<19: add(t,bass(midi(33),0.22),0.5)
add(17.95,bell(midi(88),2.0),0.5); add(17.95,boom(0.9),0.6); add(17.95,whoosh(0.4),0.4)
add(18.25,pluck(midi(81),0.6),0.55); add(18.35,pluck(midi(84),0.6),0.45); add(18.45,pluck(midi(88),0.8),0.45)
add(18.7,bell(midi(93),1.3),0.3,0.3)

# ---------- mix ----------
# sidechain duck for sustained material: crude global gentle compression using kick grid in scenes 2-6
t=np.arange(N)/SR
ph=(t%B)
duck=1-0.28*np.exp(-ph/0.11)*((t>=3)&(t<19.0))
# apply light duck only to non-kick content is complex; apply softly to whole mix
L*=duck; R*=duck
# fade in/out
fo=np.clip((DUR-t)/0.45,0,1); L*=fo; R*=fo
m=np.maximum(np.abs(L).max(),np.abs(R).max())
L/=m; R/=m
L=np.tanh(L*1.5)/np.tanh(1.5); R=np.tanh(R*1.5)/np.tanh(1.5)
L*=0.89; R*=0.89
st=np.stack([L,R],1)
out=(st*32767).astype('<i2')
with wave.open('audio.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('ok',N/SR,'s',np.abs(st).max())
