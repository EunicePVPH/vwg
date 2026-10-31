// ================= CORE: easing, helpers, typography, bg, fx =================
const clamp=(x,a=0,b=1)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t, prog=(t,a,b)=>clamp((t-a)/(b-a));
const eO2=x=>1-(1-x)*(1-x), eO3=x=>1-Math.pow(1-x,3), eO4=x=>1-Math.pow(1-x,4), eO5=x=>1-Math.pow(1-x,5);
const eI2=x=>x*x, eI3=x=>x*x*x, eI4=x=>x*x*x*x;
const eIO2=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2, eIO3=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eBack=(x,s=1.6)=>{const c=s+1;return 1+c*Math.pow(x-1,3)+s*Math.pow(x-1,2);};
const an=(t,a,d,ease=eO3)=>ease(prog(t,a,a+d));
const hexA=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const mixA=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const rgb=a=>`rgb(${a.map(v=>Math.round(v)).join(',')})`;
const mixC=(a,b,t)=>rgb(mixA(hexA(a),hexA(b),t));
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function el(tag,cls,html,style){const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;if(style)e.style.cssText=style;return e;}

const ICONS={
 mail:'<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',
 calendar:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
 search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
 check:'<polyline points="20 6 9 17 4 12"/>',
 clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
 bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
 users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
 layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
 chat:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
 inbox:'<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
 mic:'<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>',
 play:'<polygon points="6 4 20 12 6 20 6 4"/>',
 flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
 link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
};
function svg(name,size=24,color='currentColor',sw=2){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${ICONS[name]}</svg>`;}

const root=document.getElementById('root');
function layer(id,extra=''){const d=el('div','abs');d.id=id;d.style.cssText=`left:0;top:0;width:1080px;height:1920px;${extra}`;root.appendChild(d);return d;}

// ---------- typography lockups ----------
const CAP=0.70, CAPTOP=0.1585; // Montserrat cap-height & cap-top offset in a 1em line box
function measure(text,ls=0){const s=el('span','disp',text,`position:absolute;left:-5000px;top:0;visibility:hidden;font-size:100px;letter-spacing:${ls}em`);root.appendChild(s);const w=s.getBoundingClientRect().width;s.remove();return w;}
// lines:[{t,html?,cls,cap,ls,letters,weight}], opts:{maxW,gap,noMask,uniform}
function lockup(lines,o={}){
  const maxW=o.maxW||940,gap=o.gap==null?40:o.gap;
  const items=lines.map(l=>({l,fs:Math.min(l.cap||400,maxW/measure(l.t,l.ls||0)*100)}));
  if(o.uniform){const m=Math.min(...items.map(i=>i.fs));items.forEach(i=>i.fs=m);}
  const box=el('div','abs','',`left:0;top:0;width:1080px;height:10px`);
  let y=0;
  items.forEach(it=>{
    const fs=it.fs,pad=0.075*fs,mh=CAP*fs+2*pad;
    const mask=el('div','abs','',`left:0;top:${y}px;width:1080px;height:${mh}px;overflow:${o.noMask?'visible':'hidden'};perspective:1100px;perspective-origin:540px ${mh/2}px`);
    const w=it.l.weight||900;
    const ln=el('div','abs disp '+(it.l.cls||'white'),'',`left:0;top:${-(CAPTOP*fs-pad)}px;width:1080px;text-align:center;font-size:${fs}px;line-height:1;letter-spacing:${it.l.ls||0}em;font-weight:${w}`);
    if(it.l.letters){const gc=(it.l.cls||'').includes('gold');ln.className='abs disp '+(gc?'':(it.l.cls||'white'));if(gc)ln.style.color='transparent';ln.innerHTML=[...it.l.t].map(c=>`<span class="${gc?'gold':''}" style="display:inline-block;will-change:transform">${c===' '?'&nbsp;':c}</span>`).join('');it.spans=[...ln.children];}
    else ln.innerHTML=it.l.html||it.l.t;
    mask.appendChild(ln);box.appendChild(mask);
    it.mask=mask;it.ln=ln;it.mh=mh;it.y=y;y+=mh+gap;
  });
  const total=y-gap;box.style.height=total+'px';
  return {box,items,total,place(cy){box.style.top=(cy-total/2)+'px';return this;}};
}
// standard mask-rise reveal for a set of items
function maskLines(items,t,tin,tout,stag=0.1,dIn=0.6,dOut=0.35){
  items.forEach((it,i)=>{
    const a=eO4(prog(t,tin+stag*i,tin+stag*i+dIn)), b=eI3(prog(t,tout+0.05*i,tout+0.05*i+dOut));
    const y=lerp(1.35*it.mh,0,a)+lerp(0,-1.35*it.mh,b);
    const rx=lerp(-55,0,a)+lerp(0,30,b);
    it.ln.style.transform=`translateY(${y.toFixed(1)}px) rotateX(${rx.toFixed(1)}deg)`;
  });
}

// ---------- background ----------
const BGKEYS=[ // t, c1, c2, c3, glow x,y,alpha
 [0,   '#15366F','#0A1D3F','#040B1B', 540,260,0.10],
 [3.9, '#15366F','#0A1D3F','#040B1B', 540,900,0.06],
 [4.4, '#10284F','#08172F','#040A18', 540,900,0.0],
 [8.9, '#0E2347','#071428','#03070F', 540,900,0.0],
 [9.2, '#0C1D3A','#060F20','#02050B', 540,900,0.0],
 [10.0,'#0C1D3A','#060F20','#02050B', 540,1500,0.0],
 [11.6,'#17407F','#0B2249','#050E22', 880,1500,0.20],
 [18.6,'#17407F','#0B2249','#050E22', 880,1500,0.20],
 [19.4,'#153670','#0A1B3C','#040A1C', 540,900,0.26],
 [25,  '#153670','#0A1B3C','#040A1C', 540,820,0.22],
];
let bgEl;
function bgUpdate(t){
  let i=0;while(i<BGKEYS.length-2&&t>BGKEYS[i+1][0])i++;
  const A=BGKEYS[i],B=BGKEYS[i+1];const u=eIO2(prog(t,A[0],B[0]));
  const c1=mixC(A[1],B[1],u),c2=mixC(A[2],B[2],u),c3=mixC(A[3],B[3],u);
  const gx=lerp(A[4],B[4],u),gy=lerp(A[5],B[5],u),ga=lerp(A[6],B[6],u);
  bgEl.style.background=`radial-gradient(900px 760px at ${gx}px ${gy}px,rgba(214,168,76,${ga.toFixed(3)}),rgba(214,168,76,0) 70%),radial-gradient(1300px 1500px at 50% 40%,${c1} 0%,${c2} 52%,${c3} 100%)`;
}

// ---------- fx: flashes, sweeps, vignette, grain ----------
const FLASHES=[ // t, rise, fall, peak, color
 [0.00,0.00,0.26,0.26,'200,225,255'],
 [1.60,0.00,0.26,0.38,'255,214,140'],
 [1.84,0.00,0.20,0.20,'255,214,140'],
 [2.14,0.00,0.20,0.22,'255,214,140'],
 [2.64,0.00,0.34,0.50,'255,222,160'],
 [4.00,0.18,0.22,0.55,'255,255,255'],
 [8.96,0.00,0.35,0.55,'190,215,255'],
 [10.00,0.00,0.45,0.42,'255,214,140'],
 [14.00,0.00,0.30,0.22,'255,214,140'],
 [18.85,0.18,0.55,0.95,'255,236,190'],
 [22.30,0.00,0.30,0.18,'255,214,140'],
];
const SWEEPS=[ // t0,t1,alpha,width
 [1.28,1.80,0.30,150],
 [11.05,11.95,0.40,340],
 [3.2,3.8,0.0,0],
];
let flashEl,sweepEls=[],grainEl,vigEl;
function buildFx(fx){
  vigEl=el('div','abs','',`width:1080px;height:1920px;background:radial-gradient(ellipse 80% 70% at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.42) 100%)`);
  fx.appendChild(vigEl);
  SWEEPS.forEach(s=>{const d=el('div','abs','',`left:0;top:0;width:${s[3]}px;height:2800px;background:linear-gradient(90deg,rgba(255,214,140,0),rgba(255,226,170,1),rgba(255,214,140,0));filter:blur(6px);display:none;transform-origin:0 0`);fx.appendChild(d);sweepEls.push(d);});
  flashEl=el('div','abs','',`width:1080px;height:1920px;opacity:0`);fx.appendChild(flashEl);
  // film grain tile
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const id=x.createImageData(256,256);const r=rng(7);
  for(let i=0;i<256*256;i++){const v=r()<.5?0:255;id.data[i*4]=id.data[i*4+1]=id.data[i*4+2]=v;id.data[i*4+3]=Math.floor(r()*34);}
  x.putImageData(id,0,0);
  grainEl=el('div','abs','',`width:1080px;height:1920px;background:url(${c.toDataURL()});background-size:256px 256px;opacity:.55`);fx.appendChild(grainEl);
}
function fxUpdate(t,f){
  let a=0,col='255,255,255';
  FLASHES.forEach(F=>{
    let v=0;
    if(F[1]>0){ if(t>=F[0]-F[1]&&t<F[0]) v=eO2(prog(t,F[0]-F[1],F[0])); else if(t>=F[0]) v=1-eO2(prog(t,F[0],F[0]+F[2])); }
    else if(t>=F[0]) v=Math.pow(1-prog(t,F[0],F[0]+F[2]),2);
    v*=F[3]; if(v>a){a=v;col=F[4];}
  });
  flashEl.style.background=`rgb(${col})`;flashEl.style.opacity=a.toFixed(3);
  SWEEPS.forEach((s,i)=>{const e=sweepEls[i];const on=t>s[0]&&t<s[1]&&s[2]>0;e.style.display=on?'block':'none';
    if(on){const u=eIO2(prog(t,s[0],s[1]));const x=lerp(-500,1500,u);const al=s[2]*Math.sin(Math.PI*prog(t,s[0],s[1]));
      e.style.opacity=al.toFixed(3);e.style.transform=`translate(${x}px,-400px) rotate(-18deg)`;}});
  grainEl.style.backgroundPosition=`${(f*53)%256}px ${(f*97)%256}px`;
}
function shakeAt(t,hits,amps){let x=0,y=0;hits.forEach((h,i)=>{if(t>h){const d=t-h;const k=amps[i]*Math.exp(-d*9);x+=k*Math.sin(d*58+i);y+=k*0.8*Math.cos(d*47+i*2);}});return {x,y};}
