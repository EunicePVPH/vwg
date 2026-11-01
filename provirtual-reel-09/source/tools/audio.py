import numpy as np, soundfile as sf, sys, os
from scipy.signal import lfilter, butter, resample_poly
S=sys.argv[1]; SR=44100; DUR=30.0; N=int(SR*DUR)
rng=np.random.default_rng(7)
def mid(n): return 440*2**((n-69)/12)
def tarr(d): return np.arange(int(d*SR))/SR
def lp(x,fc,order=2):
    b,a=butter(order,min(fc,SR/2-100)/(SR/2),'low'); return lfilter(b,a,x)
def hp(x,fc,order=2):
    b,a=butter(order,fc/(SR/2),'high'); return lfilter(b,a,x)
def bp(x,lo,hi):
    b,a=butter(2,[lo/(SR/2),min(hi,SR/2-200)/(SR/2)],'band'); return lfilter(b,a,x)
def sweep_lp(x,f0,f1,curve=1.0):
    n=len(x); out=np.zeros(n); ch=512; zi=None
    for i in range(0,n,ch):
        k=(i/n)**curve; fc=f0*(f1/f0)**k
        b,a=butter(2,min(fc,SR/2-200)/(SR/2),'low')
        if zi is None: zi=np.zeros(max(len(a),len(b))-1)
        y,zi=lfilter(b,a,x[i:i+ch],zi=zi); out[i:i+ch]=y
    return out
def sweep_hp(x,f0,f1):
    n=len(x); out=np.zeros(n); ch=512; zi=None
    for i in range(0,n,ch):
        k=i/n; fc=f0*(f1/f0)**k
        b,a=butter(2,min(fc,SR/2-300)/(SR/2),'high')
        if zi is None: zi=np.zeros(max(len(a),len(b))-1)
        y,zi=lfilter(b,a,x[i:i+ch],zi=zi); out[i:i+ch]=y
    return out
def saw(f,d,det=0):
    t=tarr(d); ph=(t*f*(1+det))%1.0; return 2*ph-1
def sine(f,d): return np.sin(2*np.pi*f*tarr(d))
def noise(d): return rng.standard_normal(int(d*SR))*.5
def env(d,a=.005,r=.2,curve=3):
    t=tarr(d); e=np.minimum(1,t/max(a,1e-4))*np.exp(-t/max(r,1e-3)); return e
def place(buf,sig,t0,g=1.0,pan=0.0):
    i=int(t0*SR)
    if i>=N or i+len(sig)<=0: return
    s0=max(0,-i); sig=sig[s0:]; i=max(i,0); m=min(len(sig),N-i)
    l=g*np.cos((pan+1)*np.pi/4); r=g*np.sin((pan+1)*np.pi/4)
    buf[0,i:i+m]+=sig[:m]*l; buf[1,i:i+m]+=sig[:m]*r

# ---------- instruments ----------
def kick(g=1):
    d=.42; t=tarr(d); f=42+120*np.exp(-t/.045); ph=2*np.pi*np.cumsum(f)/SR
    x=np.sin(ph)*np.exp(-t/.16)+.35*np.sin(2*ph)*np.exp(-t/.05)
    x+=hp(noise(d),2000)*np.exp(-t/.006)*.35
    return np.tanh(x*1.6)*.9*g
def clap():
    d=.35; x=np.zeros(int(d*SR))
    for o in [0,.011,.022,.034]:
        n=bp(noise(.2),900,3800)*np.exp(-tarr(.2)/.012); i=int(o*SR); x[i:i+len(n)]+=n[:len(x)-i]
    tail=bp(noise(d),1000,3500)*np.exp(-tarr(d)/.09)*.5
    return (x*1.3+tail)*.8
def hat(op=False):
    d=.22 if op else .06; t=tarr(d); return hp(noise(d),6500)*np.exp(-t/(.07 if op else .012))*.5
def snare():
    d=.3; t=tarr(d); x=bp(noise(d),1500,7000)*np.exp(-t/.08)+sine(190,d)*np.exp(-t/.05)*.6
    return x*.8
def bass(f,d):
    t=tarr(d); x=np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*2*f*t)*np.exp(-t/.2)
    x=lp(x+.25*saw(f,d),600); return x*np.minimum(1,t/.004)*np.minimum(1,(d-t)/.02)
def pluck(f,d=.5,bright=1.0):
    x=saw(f,d)+.6*saw(f*1.004,d)+.6*saw(f*.996,d)
    x=sweep_lp(x,4500*bright,600,1.0)*env(d,.003,.16)
    return x*.35
def pad(notes,d,bright=2200):
    x=np.zeros(int(d*SR))
    for n in notes:
        f=mid(n)
        for det in (-.006,0,.006): x+=saw(f,d,det)
    x=lp(x,bright)/ (len(notes)*3)*1.6
    t=tarr(d); return x*np.minimum(1,t/.5)*np.minimum(1,(d-t)/.4)
def bell(f,d=1.8):
    t=tarr(d); x=sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t/(d*dd)) for r,a,dd in [(1,1,.35),(2.76,.5,.15),(5.4,.25,.08),(2,.4,.25)])
    return x*.35
def lead(f,d):
    x=saw(f,d)+.5*saw(f*1.006,d)+.5*saw(f*.994,d); x=lp(x,3200)
    t=tarr(d); return x*np.minimum(1,t/.01)*np.minimum(1,(d-t)/.05)*.22
def riser(d,g=1):
    n=noise(d); x=sweep_hp(n,250,9000); t=tarr(d); e=(t/d)**2.2
    ph=2*np.pi*np.cumsum(180*(2**(t/d*3)))/SR
    return (x*e*.9+np.sin(ph)*e*.25)*g
def whoosh(d,up=True,g=1,lo=300,hi=7000):
    n=noise(d); t=tarr(d)
    x=sweep_lp(n,lo,hi,1.4) if up else sweep_lp(n,hi,lo,.8)
    x=hp(x,150); e=np.sin(np.pi*np.clip(t/d,0,1))**1.5
    return x*e*g
def impact(d=2.2):
    t=tarr(d); f=70*np.exp(-t/.5)+28; ph=2*np.pi*np.cumsum(f)/SR
    boom=np.sin(ph)*np.exp(-t/.9)
    crash=sweep_lp(noise(d),9000,500,.5)*np.exp(-t/.55)*.5
    return np.tanh(boom*1.4)*.9+crash
def revcrash(d):
    x=sweep_hp(noise(d),500,6000); t=tarr(d); return x*(t/d)**3*.8
def ping(f,d=.35):
    t=tarr(d); return (np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*2*t))*env(d,.002,.09)*.45
def blip(f,d=.18): 
    t=tarr(d); return np.sin(2*np.pi*f*t)*env(d,.002,.05)*.5
def tick(d=.03,f=2600):
    t=tarr(d); return (hp(noise(d),f)*np.exp(-t/.006)*.8)
def thud(f=120,d=.18):
    t=tarr(d); return np.sin(2*np.pi*f*np.exp(-t/.05)*t*1+2*np.pi*50*t)*np.exp(-t/.07)*.7
def chime(f,d=1.0):
    t=tarr(d); return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*3*t))*env(d,.003,.25)*.35
def zap(d=.4):
    t=tarr(d); f=300*(2**(t/d*3)); ph=2*np.pi*np.cumsum(f)/SR; return np.sin(ph)*np.exp(-t/.18)*.3

# ---------- MUSIC ----------
M=np.zeros((2,N)); BEAT=.5
chords=[ # (root, bass midi, pad notes)
 (45,[57,60,64]),(41,[53,57,60]),(48,[60,64,67]),(43,[55,59,62])]
def chord_at(bar): return chords[bar%4]
SC=np.ones(N)  # sidechain curve
# pads (whole track), swell in intro
for bar in range(0,14):
    r,ns=chord_at(bar); t0=bar*2.0
    g=.5 if bar<2 else (.7 if bar<7 else .85)
    place(M,pad([r]+ns+[ns[0]+12],2.15,2400 if bar>=2 else 1500),t0,g*.55,0)
# final chord C add9 (bar 14: 28..30) + bar 13.5 pre
place(M,pad([48,55,60,64,74,79],2.6,3600),27.3,.8,0)
place(M,pad([36,48],2.7,900),27.3,.9,0)
# kicks
kick_t=[4+i*BEAT for i in range(int((27.0-4)/BEAT))]
for k,t0 in enumerate(kick_t):
    place(M,kick(),t0,.95)
    i=int(t0*SR); SC[i:i+int(.28*SR)]=np.minimum(SC[i:i+int(.28*SR)],np.linspace(.35,1,int(.28*SR))**1.5)
# heartbeat pulses in intro
for t0 in [0.0,.5,1.0,1.5,2.0,2.5]:
    place(M,thud(90,.25),t0,.45)
# bass line (8ths) from 4.0 to 27.0
for bar in range(2,13):
    r,ns=chord_at(bar); root=r-12 if r>=45 else r
    for e in range(8):
        t0=bar*2.0+e*.25
        if t0<4.0 or t0>=27.0: continue
        if e%2==1 or e in (0,):
            place(M,bass(mid(root),.22),t0,.62)
# offbeat hats from 9.0 / 16ths from 14
for i in range(int(9/BEAT),int(27/BEAT)):
    t0=i*BEAT+BEAT/2; 
    if 9<=t0<27: place(M,hat(True),t0,.28,.3)
for i in range(int(14/.25),int(27/.25)):
    t0=i*.25
    if 14<=t0<27 and (i%2==1): place(M,hat(False),t0,.24,-.3)
# claps 2&4 from 9
for i in range(int(9/BEAT),int(27/BEAT)):
    if i%2==1 and 9<=i*BEAT<27: place(M,clap(),i*BEAT,.5)
# pluck arps
arp_pat=[0,1,2,1,2,1,0,1]
for bar in range(2,14):
    r,ns=chord_at(bar)
    tones=[ns[0]+12,ns[1]+12,ns[2]+12]
    for e in range(8):
        t0=bar*2.0+e*.25
        if t0<4.5 or t0>=27.0: continue
        if t0<9 and e%2: continue
        br=.7 if t0<9 else 1.0
        place(M,pluck(mid(tones[arp_pat[e]%3]+(12 if e in(6,) else 0)),.45,br),t0,.8 if t0>=9 else .55,(-.4,.4)[e%2])
# lead motif scenes 5-6 (19..27)
mot=[(0,76,.5),(.5,79,.25),(.75,76,.25),(1.0,72,.5),(1.5,74,.5)]
for rep in range(0,4):
    base=19.0+rep*2.0
    if base>=26.9: break
    for off,n,dur in mot:
        t0=base+off
        if t0<27.0: place(M,lead(mid(n+ (0 if rep<3 else 0)),dur*.95),t0,.8,0)
# builds & fills
for (a,b) in [(8.0,9.0),(13.0,14.0),(18.0,19.0),(21.3,22.0)]:
    place(M,riser(b-a,.5),a,.55)
for t0 in np.arange(8.5,9.0,.0625): place(M,snare(),t0,.18+(t0-8.5)*.5)
for t0 in np.arange(13.5,14.0,.0625): place(M,snare(),t0,.18+(t0-13.5)*.5)
for t0 in np.arange(18.5,19.0,.0625): place(M,snare(),t0,.18+(t0-18.5)*.5)
# main hook builds
place(M,riser(1.7,.9),1.35,.8)           # 1.35→3.05
place(M,impact(2.6),3.04,.95)
place(M,riser(.4,.6),3.6,.0)
place(M,riser(2.6,1.0),24.4,.8)          # to 27.0
for t0 in np.arange(25.0,27.0,.125):
    place(M,snare(),t0,.12+((t0-25)/2)*.35)
place(M,revcrash(1.0),26.3,.9)
place(M,impact(2.8),27.3,1.0)
# final resolution: hit at 28.0 + bell/arpeggio shimmer
place(M,kick(),28.0,1.0); place(M,clap(),28.0,.6)
for i,n in enumerate([72,76,79,84,88,91]): place(M,bell(mid(n),2.2),28.0+i*.07,.55,(-.6+i*.24))
for i,n in enumerate([84,91,88,84,79,76,72,67]): place(M,pluck(mid(n),.5,1.0),27.6+i*.25 if i<4 else 28.6+(i-4)*.25,.5,(-.5,.5)[i%2])
place(M,bell(mid(96),2.0),28.0,.35,0)
place(M,bell(mid(60),2.0),28.0,.45,0)
# sidechain, apply to music (except the big hits fairly)
M*= SC[None,:]*0.5+0.5*1  # moderate pump
# ---------- VO ----------
VO=np.zeros((2,N)); VOENV=np.zeros(N)
starts=[0.05,4.3,9.2,14.3,19.9,24.45,27.3]
for i,t0 in enumerate(starts):
    a,sr=sf.read(f"{S}/audio/vo/vo{i+1}.wav"); 
    if a.ndim>1: a=a[:,0]
    a=resample_poly(a,SR,sr) if sr!=SR else a
    a=hp(a,70,2); a=a/ (np.sqrt(np.mean(a**2))+1e-9)*0.115
    # gentle presence boost
    a=a+0.25*hp(a,3000,1)
    place(VO,a,t0,1.0,0)
    ii=int(t0*SR); VOENV[ii:ii+len(a)]=np.maximum(VOENV[ii:ii+len(a)],1)
# smooth ducking envelope
att=lfilter([1-np.exp(-1/(.04*SR))],[1,-np.exp(-1/(.04*SR))],VOENV)
rel=np.zeros(N); c=0.0; ar=np.exp(-1/(.35*SR)); 
# fast vectorised release via lfilter of max-hold
dk=lfilter([1-ar],[1,-ar],att)
dk=np.maximum(att,dk)
DUCK=1-0.42*np.clip(dk,0,1)
M*=DUCK[None,:]

# ---------- SFX ----------
X=np.zeros((2,N))
def S_(sig,t0,g=1,pan=0): place(X,sig,t0,g,pan)
# scene1: mail pings + flyers + type hits
for t0,f in [(.28,1320),(.72,1568),(1.12,1760)]:
    S_(ping(f),t0,.7,-.2); S_(ping(f*1.5),t0+.09,.45,-.2)
for i,t0 in enumerate([.15,.35,.6,.85,1.1,1.35,1.6]):
    S_(whoosh(.9,True,.35,500,5000),t0,1,(-.7,.7)[i%2])
for i in range(10): S_(tick(),.2+i*.028,.5,0)
for t0 in [1.38,1.72,2.06]: S_(thud(110,.2),t0,.9); S_(tick(.05,1800),t0,.6)
S_(whoosh(.35,True,.6,800,9000),2.7,1)
S_(zap(.35),2.72,.8)
S_(whoosh(.9,False,.8,300,8000),3.06,1)
# scene 2
for k,t0 in enumerate([3.5+j*.22 for j in range(7)]): S_(blip(660+k*110,.14),t0,.5,(-.4,.4)[k%2])
S_(whoosh(.8,True,.45,400,6000),3.0,1)
for j in range(12): S_(tick(.025,3000),4.5+j*.13,.35,.3)
for j in range(12): S_(blip(900+j*40,.07),5.7+j*.16,.28,.2)
S_(whoosh(.7,True,.5,500,7000),5.7,1,.3)
for t0 in [6.3,7.1,7.6]: S_(whoosh(.6,True,.5,400,5000),t0,1,-.4); S_(thud(150,.12),t0+.62,.6)
for j in range(4): S_(ping(1100+j*180,.3),5.0+j*.5,.5,-.3)
for j in range(5): S_(tick(.03,2500),6.9+j*.12,.35)
S_(chime(1760,1.0),7.7,.6)
# transitions (flights)
for a,b in [(8.4,9.5),(13.4,14.5),(18.4,19.5),(21.85,22.95)]:
    S_(whoosh(b-a,True,1.1,200,9000),a,1,0); S_(impact(.9)*.5,b-.05,.5)
# marketing
for j in range(5): S_(tick(.03,2800),9.5+j*.12,.4)
for j in range(5): S_(blip(700+j*160,.12),10.0+j*.15,.45,(-.5,.5)[j%2]); 
for j in range(5):
    S_(whoosh(.8,True,.5,500,6500),10.25+j*.15,1,(-.6+.3*j)); S_(pluck(mid(72+j*2),.3),11.25+j*.15,.9,.1*j-.2)
for j in range(7): S_(blip(520+j*40,.08),11.4+j*.17,.35,.2)
S_(ping(1500),12.3,.7,.5); S_(ping(1760),12.85,.7,.5)
S_(whoosh(.9,True,.5,400,5000),12.7,1,.3)
for j in range(4): S_(thud(140+j*20,.14),12.7+j*.16,.45,.3)
# web
for j in range(8): S_(thud(100+j*10,.14),14.55+j*.13,.55); S_(tick(.03,2400),14.55+j*.13,.45)
S_(whoosh(.9,True,.5,400,6000),14.5,1)
for j in range(8): S_(thud(130,.12),16.35+j*.1,.4,.3)
S_(whoosh(.8,True,.5,400,6000),16.15,1,.3)
S_(whoosh(.8,True,.5,400,6000),16.7,1,.5)
for j in range(11): S_(tick(.025,3200),17.05+j*.045,.55,.3)
for j in range(16): S_(tick(.025,3200),17.6+j*.04,.55,.3)
S_(thud(160,.12),18.3,.9); S_(tick(.03,2000),18.3,.8)
S_(chime(1568,1.2),18.45,.8,.2); S_(chime(2093,1.2),18.55,.55,.2)
for j in range(3): S_(blip(980+j*200,.14),19.1+j*.3,.4,.4)
S_(zap(.5),18.5,.5,.3)
# research
for j in range(8): S_(whoosh(.9,True,.4,500,6000),20.55+j*.17,1,(-.5,.5)[j%2]); S_(thud(120,.14),21.55+j*.17,.4)
for j in range(8): S_(tick(.03,2600),21.2+j*.1,.4)
for j in range(3): S_(blip(900+j*150,.12),22.0+j*.1,.4)
for j in range(4): S_(tick(.025,3000),21.4+j*.15,.3)
# content
for j in range(13): S_(thud(110+ (j%3)*20,.1),22.5+j*.06,.35,-.2+j*.03)
for j in range(4): S_(blip(740+j*140,.1),22.9+j*.38,.4,-.3)
S_(whoosh(.8,True,.5,400,6000),23.1,1,.2)
for j in range(3): S_(thud(150,.14),23.1+j*.22,.5,.3)
# scene 6 ecosystem
S_(whoosh(1.3,True,.9,300,8000),24.5,1)
S_(zap(.5),25.0,.5); S_(whoosh(1.0,True,.5,400,7000),25.0,1)
S_(chime(1319,1.2),25.3,.7); S_(chime(1760,1.2),25.35,.45)
for i in range(5): S_(zap(.35),25.35+i*.12,.4,-.6+i*.3); S_(blip(880+i*110,.12),25.2+i*.1,.45,-.6+i*.3)
# brand reveal
S_(whoosh(.6,True,.8,500,9000),26.95,1)
S_(chime(2093,1.6),27.35,.7); S_(chime(1568,1.6),27.4,.5)
S_(whoosh(.5,True,.5,600,8000),28.35,.9)
S_(chime(1760,1.4),28.5,.6); S_(chime(2349,1.4),28.6,.5)
S_(tick(.05,3000),28.4,.6)

# ---------- stems ----------
sf.write(f"{S}/audio/stem_vo.wav",VO.T.astype(np.float32),SR)
# ---------- mix ----------
X*=DUCK[None,:]*0.5+0.5   # sfx duck less
VOG=float(os.environ.get('VOG','1.0')); MG=float(os.environ.get('MG','0.55')); XG=float(os.environ.get('XG','0.7'))
sf.write(f"{S}/audio/stem_m.wav",(M*MG).T.astype(np.float32),SR); sf.write(f"{S}/audio/stem_x.wav",(X*XG).T.astype(np.float32),SR)
mix=M*MG+X*XG+VO*VOG
# gentle bus compression-ish via tanh and fade
mix=np.tanh(mix*1.15)/np.tanh(1.15)
f=int(.35*SR); mix[:,-f:]*=np.linspace(1,0,f)**1.5
pk=np.max(np.abs(mix)); mix=mix/pk*0.93
sf.write(f"{S}/audio/mix.wav",mix.T.astype(np.float32),SR,subtype='PCM_24')
sf.write(f"{S}/audio/music_only.wav",(np.tanh(M*.9)).T.astype(np.float32),SR)
print('peak',pk,'rms',np.sqrt(np.mean(mix**2)))
