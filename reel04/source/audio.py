import numpy as np, soundfile as sf, sys
from scipy.signal import lfilter, butter, resample_poly, fftconvolve
S=sys.argv[1]; SR=48000; DUR=25.0; N=int(SR*DUR); rs=np.random.RandomState(3)
def T(t): return int(round(t*SR))
def mf(m): return 440*2**((m-69)/12)
def lp(x,fc,o=2): b,a=butter(o,min(fc,SR*0.45)/(SR/2)); return lfilter(b,a,x)
def hp(x,fc,o=2): b,a=butter(o,fc/(SR/2),'high'); return lfilter(b,a,x)
def bp(x,f1,f2,o=2): b,a=butter(o,[f1/(SR/2),min(f2,SR*0.45)/(SR/2)],'band'); return lfilter(b,a,x)
def tt(n): return np.arange(n)/SR
def saw(f,n,ph=0.0): p=(ph+np.cumsum(np.full(n,f/SR)))%1; return 2*p-1
def sine(f,n): return np.sin(2*np.pi*np.cumsum(np.full(n,f/SR)))
def noise(n): return rs.randn(n)
def dec(n,tau): return np.exp(-tt(n)/tau)
def pan(sig,p): a=(p+1)*np.pi/4; return np.vstack([sig*np.cos(a),sig*np.sin(a)])
class Bus:
    def __init__(s): s.b=np.zeros((2,N))
    def add(s,sig,t,g=1.0,p=0.0):
        i=T(t); 
        if i>=N or i+sig.shape[-1]<=0: return
        if i<0: sig=sig[...,-i:]; i=0
        L=sig.shape[-1]; n=min(L,N-i)
        if sig.ndim==2: s.b[:,i:i+n]+=sig[:,:n]*g
        else: s.b[:,i:i+n]+=pan(sig[:n]*g,p)
def ir(sec,tau,seed):
    r=np.random.RandomState(seed); n=int(SR*sec); x=r.randn(2,n)*np.exp(-np.arange(n)/SR/tau)
    y=np.vstack([hp(lp(x[0],9000),200),hp(lp(x[1],9000),200)]); return y/np.sqrt((y**2).sum(axis=1,keepdims=True))
IR=ir(2.8,0.85,5)
def reverb(b,wet):
    out=np.vstack([fftconvolve(b[0],IR[0])[:N],fftconvolve(b[1],IR[1])[:N]]); return out*wet
# ---------------- instruments ----------------
def kick(g=1):
    n=int(SR*0.5); t=tt(n); f=48+120*np.exp(-t/0.035); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*np.exp(-t/0.16)+0.35*lp(noise(n),3000)*np.exp(-t/0.006))*g
def boom(g=1,L=2.2):
    n=int(SR*L); t=tt(n); f=38+90*np.exp(-t/0.12); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*np.exp(-t/0.7)+0.5*lp(noise(n),900)*np.exp(-t/0.25))*g
def snare(g=1,tone=190):
    n=int(SR*0.28); t=tt(n); return (bp(noise(n),1500,7500)*np.exp(-t/0.07)*0.9+np.sin(2*np.pi*tone*t)*np.exp(-t/0.05)*0.5)*g
def clap(g=1):
    n=int(SR*0.3); t=tt(n); x=bp(noise(n),1200,6500)
    e=sum(np.exp(-np.clip(t-d,0,None)/0.035)*(t>=d) for d in (0,0.011,0.022))*0.5+np.exp(-t/0.12)*(t>0.03)*0.6
    return x*e*g
def hat(g=1,o=False):
    n=int(SR*(0.25 if o else 0.07)); return hp(noise(n),7000)*dec(n,0.09 if o else 0.018)*g
def crash(g=1,L=3.0):
    n=int(SR*L); return hp(noise(n),4500)*dec(n,0.9)*g
def pluck(f,L=0.35,fc=3200,g=1,det=0.004):
    n=int(SR*L); t=tt(n); x=(saw(f*(1+det),n)+saw(f*(1-det),n,0.3))*0.5
    x=lp(x,fc)*np.exp(-t/(L*0.35)); x[:int(SR*0.002)]*=np.linspace(0,1,int(SR*0.002)); return x*g
def bell(f,L=1.6,g=1):
    n=int(SR*L); t=tt(n); x=sine(f,n)*np.exp(-t/0.5)+0.4*sine(f*2.76,n)*np.exp(-t/0.25)+0.25*sine(f*5.4,n)*np.exp(-t/0.12)
    return x*g
def blip(f,g=1,L=0.12):
    n=int(SR*L); t=tt(n); return sine(f,n)*np.exp(-t/0.03)*g*(1-np.exp(-t/0.002))
def tick(g=1):
    n=int(SR*0.05); return (bp(noise(n),2500,6500)*dec(n,0.008)+sine(1800,n)*dec(n,0.006)*0.4)*g
def pad(notes,L,g=1,fc=1600,att=0.5,rel=0.6):
    n=int(SR*L); outL=np.zeros(n); outR=np.zeros(n)
    for m in notes:
        f=mf(m)
        for d,side in ((-0.006,0),(0.0,2),(0.006,1)):
            x=saw(f*(1+d),n,rs.rand())
            if side==0: outL+=x
            elif side==1: outR+=x
            else: outL+=x*0.7; outR+=x*0.7
    t=tt(n); e=np.minimum(t/att,1)*np.minimum((L-t)/rel,1).clip(0,1)
    return np.vstack([lp(outL,fc)*e,lp(outR,fc)*e])*g/ (len(notes)*1.5)
def riser(L,g=1,f0=250,f1=7000,noiseamt=1.0):
    n=int(SR*L); t=tt(n); u=t/L; ramp=u**2
    f=f0*(f1/f0)**u; s=np.sin(2*np.pi*np.cumsum(f)/SR)*0.35
    nz=hp(noise(n),900)*ramp*noiseamt
    return (nz+s*ramp)*g
def revcrash(L,g=1):
    n=int(SR*L); u=tt(n)/L; return hp(noise(n),3500)*(u**3)*g
def whoosh(L,g=1,up=True):
    n=int(SR*L); u=tt(n)/L; e=np.sin(np.pi*u)**2
    x=bp(noise(n),400,2500); x2=hp(noise(n),2500)*0.5
    return (x+x2)*e*g
# ---------------- chords ----------------
CH={'Dm':[50,53,57],'Bb':[46,50,53],'A':[45,49,52],'D':[50,54,57],'Bm':[47,50,54],'G':[43,47,50],'Am':[45,48,52]}
ROOT={'Dm':26,'Bb':22,'A':21,'D':26,'Bm':23,'G':19,'Am':21}
mus=Bus(); sfx=Bus(); musR=Bus(); sfxR=Bus()   # R buses go to reverb
def chordseq(seq):
    for a,b,c in seq: yield a,b,c
# ----- Scene 1 : 0-4
musR.add(boom(1.0),0.0); musR.add(crash(0.5,2.5),0.0)
d=saw(mf(26),int(SR*4.0)); d=lp(d,260)*np.minimum(tt(len(d))/1.0,1)*0.22; mus.add(d,0.0,1.0)
mus.add(lp(saw(mf(38),int(SR*4.0)),400)*0.06*np.minimum(tt(int(SR*4.0))/1.5,1),0.0)
sfx.add(riser(1.45,0.55,200,5000),0.15)
for tm,gg in ((1.62,1.0),(1.90,0.7),(2.20,0.75),(2.70,1.25)):
    sfx.add(kick(1.3*gg),tm); sfxR.add(boom(0.6*gg,1.6),tm); sfx.add(hp(noise(int(SR*0.2)),2500)*dec(int(SR*0.2),0.05)*0.9*gg,tm)
sfx.add(whoosh(0.55,0.5),1.28)
for b in np.arange(2.0,4.0,0.5): mus.add(kick(0.55),b)
for b in np.arange(2.0,4.0,0.25):
    mus.add(hat(0.28),b+0.125)
    mus.add(lp(saw(mf(26),int(SR*0.22)),420)*dec(int(SR*0.22),0.1)*0.55,b)
sfx.add(riser(0.9,0.6,300,9000),3.1); sfx.add(whoosh(0.75,0.9),3.55); musR.add(boom(0.5,1.5),4.0); sfx.add(crash(0.5,1.2),4.0)
# ----- Scene 2 : 4-9
seq2=[(4,6,'Dm'),(6,8,'Bb'),(8,9,'A')]
for a,b,c in seq2:
    mus.add(pad(CH[c],b-a+0.3,0.5,900,0.25,0.3),a,1.0)
    for tm in np.arange(a,b,0.5):
        mus.add(lp(saw(mf(ROOT[c]),int(SR*0.24)),520)*dec(int(SR*0.24),0.13)*0.8,tm)
        mus.add(lp(saw(mf(ROOT[c]),int(SR*0.24)),520)*dec(int(SR*0.24),0.13)*0.5,tm+0.25)
    notes=CH[c]; pat=[0,1,2,1,2,1,0,1] ; k=0
    for tm in np.arange(a,b,0.125):
        if tm>=9: break
        m=notes[pat[k%8]%3]+12*(1+ (1 if (tm>=7.0 and k%2) else 0)); k+=1
        amp=0.25+0.45*(tm-4)/5
        musR.add(pluck(mf(m),0.22,2200+1500*(tm-4)/5,amp*0.5),tm,1,(-0.4 if k%2 else 0.4)); mus.add(pluck(mf(m),0.22,2200+1500*(tm-4)/5,amp),tm,1,(-0.3 if k%2 else 0.3))
for b in np.arange(4.0,8.96,0.5): mus.add(kick(0.85),b)
for b in np.arange(4.5,8.0,1.0): mus.add(clap(0.55),b)
for b in np.arange(4.0,7.0,0.25): mus.add(hat(0.3 if (b*4)%2 else 0.18),b+0.125)
for b in np.arange(7.0,8.96,0.125): mus.add(hat(0.3),b+0.06)
# snare roll 8.0 -> 8.95
tm=8.0;gap=0.25
while tm<8.95:
    mus.add(snare(0.35+0.55*(tm-8.0)/0.95,190+120*(tm-8)/0.95),tm); tm+=gap; gap=max(0.055,gap*0.86)
sfx.add(riser(4.7,0.5,200,8000),4.2); sfx.add(revcrash(0.7,0.8),8.25)
TOAST=[4.30,4.62,4.95,5.25,5.50,5.75,6.00,6.25,6.50,6.72]
for i,tm in enumerate(TOAST): sfxR.add(bell(mf(88+(i%3)*5),1.0,0.28),tm); sfx.add(blip(mf(100+(i%4)*2),0.2),tm)
for i in range(36):
    u=i/35; ta=7.0+1.85*(1-(1-u)**1.5); sfx.add(tick(0.25+0.45*u),ta); 
    if i%3==0: sfx.add(blip(mf(84+(i%5)*3),0.12+0.15*u,0.1),ta)
sfx.add(boom(0.55,1.2),7.0)
# ----- Freeze 8.95-10.0 : cut
sfxR.add(bell(mf(96),3.0,0.42),8.96); sfxR.add(bell(mf(103),3.0,0.3),8.97); sfx.add(boom(1.0,1.4),8.96)
for tm in (9.0,9.5): sfx.add(tick(0.35),tm)
mus.add(lp(saw(mf(26),int(SR*1.1)),180)*0.3*np.minimum(tt(int(SR*1.1))/0.9,1),8.98)
mus.add(lp(saw(mf(38),int(SR*1.1)),200)*0.12*np.minimum(tt(int(SR*1.1))/0.9,1),8.98)
sfx.add(revcrash(0.6,0.9),9.4); sfx.add(riser(0.5,0.5,300,3000),9.5)
# ----- Scene 3-4 : 10-19 uplift
seq3=[(10,12,'D'),(12,14,'A'),(14,16,'Bm'),(16,18,'G'),(18,19,'A')]
PENTA=[74,76,78,81,83,86,88,90,93,95,98]
for a,b,c in seq3:
    L=b-a+0.4
    mus.add(pad(CH[c],L,0.75,2200,0.35,0.5),a,1.0); mus.add(pad([m+12 for m in CH[c]],L,0.35,3000,0.5,0.5),a,1.0)
    for tm in np.arange(a,min(b,19),0.5):
        mus.add(lp(saw(mf(ROOT[c]),int(SR*0.4)),600)*dec(int(SR*0.4),0.22)*0.9,tm)
    for k,tm in enumerate(np.arange(a,min(b,19),0.25)):
        if tm<10.5: continue
        notes=CH[c]; m=notes[[0,2,1,2,0,1,2,1][k%8]]+12*(2 if (k%4==3) else 1)+(12 if tm>=14 and k%2 else 0)
        amp=0.55 if tm<14 else 0.7
        mus.add(pluck(mf(m),0.3,4200,amp*0.55),tm,1,(0.35 if k%2 else -0.35)); musR.add(pluck(mf(m),0.3,4200,amp*0.4),tm+0.0,1,(-0.4 if k%2 else 0.4))
for b in np.arange(10.0,18.95,0.5): mus.add(kick(0.8 if b>=10.5 else 1.0),b)
for b in np.arange(10.5,18.9,1.0): mus.add(clap(0.5 if b<14 else 0.65),b)
for b in np.arange(11.0,18.9,0.5): mus.add(hat(0.32,True),b+0.25)
for b in np.arange(14.0,18.9,0.25): mus.add(hat(0.2),b+0.125)
musR.add(boom(0.9,2.0),10.0); sfx.add(revcrash(0.45,1.0),9.55); sfx.add(whoosh(0.7,0.9),9.95); sfx.add(crash(0.5,2.0),10.0)
for i in range(20):  # card reorg ticks
    sfx.add(blip(mf(90+(i%5)),0.08,0.08),10.0+0.032*i+0.3)
for i in range(20):  # check chimes
    tm=11.8+0.075*i+0.13; sfxR.add(bell(mf(PENTA[i%len(PENTA)] if i<11 else PENTA[(i-9)%len(PENTA)]),1.2,0.2),tm)
sfx.add(riser(0.9,0.35,500,6000),10.4); 
for tm in (10.38,14.22,17.0): sfx.add(whoosh(0.5,0.6),tm-0.05)
sfx.add(whoosh(0.9,0.6),11.05)
sfx.add(whoosh(0.6,0.7),13.7); sfx.add(crash(0.25,1.0),14.0); sfx.add(kick(0.7),14.0)
# UI sfx scene 4
for k in range(4): sfx.add(blip(mf(91+k*2),0.25,0.1),14.55+0.2*k)
for k in range(3): sfx.add(tick(0.5),15.1+0.12*k)
for k in range(6): sfxR.add(bell(mf(PENTA[k]+0),0.9,0.22),15.3+0.17*k+0.03)
for k in range(10): sfx.add(tick(0.35),16.0+0.07*k)
for k in range(3): sfx.add(blip(mf(93+k*2),0.25,0.1),16.8+0.15*k)
sfx.add(riser(0.7,0.35,400,4000),16.85)
for k in range(3): sfxR.add(bell(mf(PENTA[k+3]),0.9,0.25),17.6+0.15*k)
sfxR.add(bell(mf(86),2.5,0.28),18.0); sfx.add(riser(0.85,0.7,300,9000),18.0); sfx.add(revcrash(0.95,1.1),17.95)
# ----- Scene 5 : 19-25
musR.add(boom(1.4,3.0),18.98); sfx.add(crash(0.8,3.0),18.98); sfxR.add(bell(mf(86),3.0,0.4),19.0); sfxR.add(bell(mf(74),3.0,0.3),19.0)
seq5=[(19,21,'D'),(21,22,'A'),(22,23,'G'),(23,25,'D')]
for a,b,c in seq5:
    L=b-a+0.5 if b<25 else 2.2
    mus.add(pad(CH[c],L,0.95,2800,0.25,0.7),a,1.0); mus.add(pad([m+12 for m in CH[c]],L,0.55,4200,0.35,0.7),a,1.0)
    mus.add(lp(saw(mf(ROOT[c]),int(SR*L)),170)*0.3*(np.minimum(tt(int(SR*L))/0.1,1)),a,1.0)
    for k,tm in enumerate(np.arange(a,min(b,24.0),0.25)):
        notes=CH[c]; m=notes[[0,2,1,2,0,1,2,1][k%8]]+12*(1+(k%4==3))+12
        musR.add(pluck(mf(m),0.34,5200,0.5),tm,1,(0.4 if k%2 else -0.4)); mus.add(pluck(mf(m),0.34,5200,0.34),tm,1,(0.3 if k%2 else -0.3))
for b in np.arange(19.5,23.0,0.5): mus.add(kick(0.8),b)
for b in np.arange(19.5,23.0,1.0): mus.add(clap(0.5),b+0.5 if False else b)
for b in np.arange(19.5,23.0,0.5): mus.add(hat(0.3,True),b+0.25)
sfx.add(riser(0.45,0.4,500,8000),21.85); sfx.add(kick(1.0),22.3); musR.add(boom(0.6,1.5),22.3)
sfxR.add(bell(mf(93),1.5,0.3),22.5); sfx.add(blip(mf(105),0.3,0.18),22.5); sfx.add(whoosh(0.5,0.5),21.5)
# final resolution hit at 23.0
sfx.add(kick(1.2),23.0); musR.add(boom(1.0,3.0),23.0); sfx.add(crash(0.9,2.2),23.0); sfxR.add(bell(mf(86),2.2,0.4),23.0); sfxR.add(bell(mf(78),2.2,0.3),23.0)
for tm in (19.18,19.6): sfx.add(whoosh(0.4,0.5),tm)
for i in range(10): sfxR.add(bell(mf(PENTA[i%11]+12),0.8,0.1),19.2+0.045*i)
sfx.add(whoosh(0.5,0.6),20.7)
# ------------- voice -------------
def loadv(n):
    x,sr=sf.read(f"{S}/build/vo/{n}.wav"); x=x if x.ndim==1 else x[:,0]
    return resample_poly(x,SR//sr if SR%sr==0 else 2,1) if sr!=SR else x
VO=[('v1',0.30),('w1',4.15),('w2',4.80),('w3',5.50),('w4',6.10),('w5',7.05),('v3',10.20),('v4',14.20),('v5a',19.45),('v5b',20.75),('v5c',22.35)]
vo=np.zeros(N)
for n,tm in VO:
    x=loadv(n); x=hp(x,90,2); x=x/np.abs(x).max()*0.9; i=T(tm); vo[i:i+len(x)]+=x[:N-i]
# light presence + gentle compression
vo=vo+0.15*hp(vo,3000)
def comp(x,th=0.35,ratio=3):
    env=lfilter([0.002],[1,-0.998],np.abs(x)); g=np.where(env>th,(th+(env-th)/ratio)/np.maximum(env,1e-6),1.0); return x*g
vo=comp(vo); vo=vo/np.abs(vo).max()*0.85
voR=np.vstack([vo,vo])
# ------------- mix -------------
envv=lfilter([0.0006],[1,-0.9994],np.abs(vo))  # slow follower
envv=np.clip(envv/ (envv.max()*0.5),0,1)
duck=1-0.5*envv; duckS=1-0.25*envv
musrev=reverb(musR.b,0.6); sfxrev=reverb(sfxR.b,0.9)
cut=np.ones(N); cut[T(8.93):T(8.96)]=np.linspace(1,0,T(8.96)-T(8.93)); cut[T(8.96):T(10.0)]=0.0
w0,w1=T(8.98),T(10.0)
musbus=(mus.b+musrev)*cut
musbus[:,w0:w1]=mus.b[:,w0:w1]*1.0
sfxbus=sfx.b+sfxrev
def rms(x,thr=1e-4):
    m=np.abs(x).max(axis=0)>thr; return np.sqrt((x[:,m]**2).mean())
rm,rsf,rv=rms(musbus),rms(sfxbus),rms(voR)
print("raw rms music %.4f sfx %.4f vo %.4f"%(rm,rsf,rv))
# targets (linear rms): voice 0.14 (-17dB), music 0.05 (-26), sfx 0.035 (-29)
gm=0.055/rm; gs=0.04/rsf; gv=0.15/rv
mg=np.ones(N); mg[T(14.2):T(19.2)]=0.88; mg[T(19.2):]=0.78
mix=musbus*gm*duck*mg+sfxbus*gs*duckS+voR*gv
print("gains",gm,gs,gv)
fade=np.ones(N); fade[:T(0.004)]=np.linspace(0,1,T(0.004)); fade[T(24.45):]=np.linspace(1,0,N-T(24.45))**1.5
mix*=fade
print("pre-limit peak",np.abs(mix).max())
np.save(f"{S}/build/stem_bg.npy",(musbus*gm*duck+sfxbus*gs*duckS).astype(np.float32)); np.save(f"{S}/build/stem_vo.npy",(voR*gv).astype(np.float32))
sf.write(f"{S}/build/mix_raw.wav",(mix/ max(1.0,np.abs(mix).max())*0.95).T,SR,subtype='PCM_16')
