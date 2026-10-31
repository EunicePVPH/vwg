// ---------- text builders ----------
const GOLD='#EDBF58';
const S={};
function mkLetters(parent,text,cy,fit,color,extra){
  const row=document.createElement('div');
  row.style.cssText='position:absolute;left:0;top:0;width:1080px;text-align:center;white-space:nowrap;line-height:1;font-family:Montserrat;font-weight:900;font-size:100px;letter-spacing:-0.012em;color:'+color+';'+(extra||'');
  const inner=document.createElement('span'); inner.style.cssText='display:inline-block;white-space:nowrap;perspective:1100px';
  const spans=[...text].map(c=>{const s=document.createElement('span');s.style.cssText='display:inline-block;transform-origin:50% 55%';s.textContent=c===' '?' ':c;inner.appendChild(s);return s});
  row.appendChild(inner);parent.appendChild(row);
  const w=inner.getBoundingClientRect().width; const fs=100*fit/w;
  row.style.fontSize=fs+'px'; row.style.top=(cy-fs/2)+'px';
  return {row,spans,fs};
}
function mkMask(parent,text,cy,size,o){
  o=o||{}; const maxW=o.maxW||940;
  const wrap=document.createElement('div'); wrap.className='mline';
  const inner=document.createElement('span'); inner.className='in2'+(o.gold?' gold-t':'');
  inner.style.cssText='display:block;font-size:100px;line-height:1;'+(o.gold?'':'color:#fff;')+(o.style||'');
  inner.textContent=text; wrap.appendChild(inner); parent.appendChild(wrap);
  wrap.style.fontSize='100px';
  const probe=document.createElement('span'); probe.style.cssText='display:inline-block;white-space:nowrap;font:900 100px Montserrat;letter-spacing:-.012em;position:absolute;visibility:hidden'; probe.textContent=text; document.body.appendChild(probe);
  const w=probe.getBoundingClientRect().width; document.body.removeChild(probe);
  const fs=Math.min(size,100*maxW/w);
  inner.style.fontSize=fs+'px'; wrap.style.height=(fs*1.06)+'px'; wrap.style.top=(cy-fs*.53)+'px';
  return {wrap,inner,fs};
}
function maskT(m,t,tin,tout,dur){
  dur=dur||.55;
  if(t<tin-.02||t>tout+.4){m.wrap.classList.add('hid');return}
  m.wrap.classList.remove('hid');
  const p=eOut4(P(t,tin,tin+dur)), q=eIn3(P(t,tout,tout+.32));
  m.inner.style.transform='translateY('+((1-p)*122-q*122).toFixed(2)+'%)';
}

function buildText(){
  const c=$('#s1cam');
  // S1 white group
  const gw=document.createElement('div'); gw.style.cssText='position:absolute;inset:0;transform-origin:540px 800px'; c.appendChild(gw); S.gw=gw;
  S.w1=mkLetters(gw,'YOUR',700,940,'#fff','text-shadow:0 10px 50px rgba(0,0,0,.4);');
  S.w2=mkLetters(gw,'WEBSITE',905,940,'#fff','text-shadow:0 10px 50px rgba(0,0,0,.4);');
  const gg=document.createElement('div'); gg.style.cssText='position:absolute;inset:0'; c.appendChild(gg); S.gg=gg;
  const gs='text-shadow:0 0 50px rgba(237,191,88,.38),0 10px 40px rgba(0,0,0,.4);';
  S.g1=mkLetters(gg,'SHOULD',775,940,GOLD,gs);
  S.g2=mkLetters(gg,'WORK',965,720,GOLD,gs);
  S.g3=mkLetters(gg,'HARDER.',1145,940,GOLD,gs);
  const sw=document.createElement('div'); sw.style.cssText='position:absolute;left:0;top:-300px;width:300px;height:2600px;background:linear-gradient(90deg,rgba(255,240,190,0),rgba(255,244,205,.95) 50%,rgba(255,240,190,0));mix-blend-mode:screen;transform:translateX(-600px) rotate(18deg);opacity:0;pointer-events:none';
  c.appendChild(sw); S.sw=sw;
  // S2..S5 headlines (top zone)
  S.s2=[mkMask($('#s2'),'WEBSITES',305,98),mkMask($('#s2'),'THAT IMPRESS.',418,98,{gold:1})];
  S.s3=[mkMask($('#s3'),'DESIGNED TO TURN',282,70),mkMask($('#s3'),'INTEREST INTO',362,70),mkMask($('#s3'),'ACTION.',455,100,{gold:1})];
  S.s4=[mkMask($('#s4'),'MAKE EVERY',292,98),mkMask($('#s4'),'STEP COUNT.',402,98,{gold:1})];
  S.s5=[mkMask($('#s5'),'BUILT FOR',900,96),mkMask($('#s5'),'YOUR BUSINESS.',1018,96,{gold:1})];
  // tags (S5)
  const tg=$('#tags');
  S.tags=[['WEBSITE DESIGN',372,328],['LANDING PAGES',770,588],['SALES FUNNELS',318,972]].map(([txt,x,y])=>{
    const d=document.createElement('div'); d.className='tag'; d.textContent=txt; tg.appendChild(d);
    const w=d.getBoundingClientRect().width; d.style.left=(x-w/2)+'px'; d.style.top=(y-27)+'px'; return d;});
  // S6
  const s6=$('#s6');
  S.k6=document.createElement('div'); S.k6.style.cssText='position:absolute;left:0;top:398px;width:1080px;text-align:center;font:700 25px/1 Montserrat;letter-spacing:.2em;color:#E3B04B;white-space:nowrap'; S.k6.textContent='WEBSITES · LANDING PAGES · SALES FUNNELS'; s6.appendChild(S.k6);
  S.h6=[mkMask(s6,"LET\u2019S BUILD",565,132),mkMask(s6,'YOUR ONLINE',696,132),mkMask(s6,'PRESENCE.',836,140,{gold:1})];
  // wordmark: PROVIRTUAL (white) PH (gold)
  const wm=document.createElement('div'); wm.style.cssText='position:absolute;left:0;top:0;width:1080px;text-align:center;white-space:nowrap;line-height:1;font-family:Montserrat;font-weight:900;font-size:100px;letter-spacing:.02em';
  const inner=document.createElement('span'); inner.style.cssText='display:inline-block;white-space:nowrap';
  S.wm=[...'PROVIRTUAL PH'].map((ch,i)=>{const s=document.createElement('span'); s.style.cssText='display:inline-block;'+(i>=11?'color:#EDBF58;text-shadow:0 0 40px rgba(237,191,88,.45)':'color:#fff;text-shadow:0 8px 30px rgba(0,0,0,.4)'); s.textContent=ch===' '?' ':ch; inner.appendChild(s); return s;});
  wm.appendChild(inner); s6.appendChild(wm);
  const ww=inner.getBoundingClientRect().width; const wfs=100*900/ww; wm.style.fontSize=wfs+'px'; wm.style.top=(1062-wfs/2)+'px'; S.wmRow=wm;
  S.rule=document.createElement('div'); S.rule.style.cssText='position:absolute;left:290px;top:1130px;width:500px;height:4px;border-radius:2px;background:linear-gradient(90deg,rgba(237,191,88,0),#EDBF58 20%,#FFF0C2 50%,#EDBF58 80%,rgba(237,191,88,0));transform-origin:50% 50%'; s6.appendChild(S.rule);
  S.cta=document.createElement('div'); S.cta.style.cssText='position:absolute;left:100px;top:1236px;width:880px;height:116px;border-radius:60px;background:linear-gradient(180deg,#FDEBB0 0%,#EDBF58 50%,#C58C26 100%);box-shadow:0 22px 60px rgba(0,0,0,.45),0 0 0 3px rgba(255,255,255,.25) inset;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:20px;color:#07122F;font:800 37px/1 Montserrat;letter-spacing:.015em;white-space:nowrap';
  S.cta.innerHTML=ic('chat',46,2.4,'#07122F')+'<span>DM “WEBSITE” TO GET STARTED</span><i class="ctasw" style="position:absolute;left:0;top:-20px;width:150px;height:160px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.75),rgba(255,255,255,0));transform:translateX(-300px) rotate(16deg)"></i>';
  s6.appendChild(S.cta); S.ctasw=$('.ctasw',S.cta);
  S.disc=document.createElement('div'); S.disc.style.cssText='position:absolute;left:0;top:1596px;width:1080px;text-align:center;font:600 21px/1 Inter;letter-spacing:.14em;color:rgba(200,214,245,.62);white-space:nowrap';
  S.disc.textContent='SAMPLE CONCEPT DESIGNS · FICTIONAL BRAND'; $('#txt').appendChild(S.disc);
  // wipe line in phone
  const wl=document.createElement('div'); wl.id='wipeL'; wl.style.cssText='position:absolute;left:-20px;width:430px;height:8px;top:0;background:linear-gradient(90deg,rgba(240,200,102,0),#FFE9A8 20%,#F0C866 50%,#FFE9A8 80%,rgba(240,200,102,0));box-shadow:0 0 40px 14px rgba(240,200,102,.85);opacity:0;z-index:5';
  $('#ph .screen').appendChild(wl);
  // cache site refs
  const br=$('#br');
  S.br={nav:$('.s-nav',br),logo:$('.s-logo',br),links:$$('.s-links span',br),navbtn:$('.s-navbtn',br),eyebrow:$('.s-eyebrow',br),hl:$$('.hl',br),sub:$('.s-sub',br),btns:$('.s-btns',br),art:$('.s-art',br),chip:$('.s-chip',br),cards:$$('.s-card',br),contact:$('.s-contact',br),url:$('.url',br),curs:$('.curs',br),glare:$('.glare',br)};
  S.ph={lh:$$('.l-h',$('#ph')),badge:$('.l-badge',$('#ph')),p:$('.l-p',$('#ph')),cta:$('.l-cta',$('#ph')),micro:$('.l-micro',$('#ph')),bul:$$('.l-bul',$('#ph')),top:$('.l-top',$('#ph')),boxes:[$('.l-f1'),$('.l-f2'),$('.l-f3')],ok:$('.l-ok'),okc:$('.okc'),sub:$('.l-sub'),subtxt:$('.subtxt'),notif:$('#notif'),touch:$('#touch'),ripple:$('#ripple'),wipe:wl};
  S.fg={cards:$$('.fcard'),cons:$$('.fcon'),pulse:$('.fpulse'),glows:$$('.fglow'),badges:$$('.fbadge')};
  S.el={br,ph:$('#ph'),fg:$('#fgrp'),flash:$('#flash'),scrim5:$('#scrim5'),g1:$('#g1'),g2:$('#g2'),g3:$('#g3')};
  S.el.g3.style.background='radial-gradient(circle,rgba(240,190,84,.34) 0%,rgba(240,190,84,0) 60%)';
}

// ---------- keyframes for the persistent objects ----------
const BRK=.64;
const BR_F=[
 {t:0,x:170,y:-30,z:-520,ry:-27,rx:12,k:1.9,o:.12,b:0},
 {t:2.6,x:130,y:-20,z:-420,ry:-23,rx:11,k:2.0,o:.15,b:0},
 {t:3.4,e:eOut5,x:0,y:50,z:0,ry:-17,rx:8,k:.96,o:1,b:0},
 {t:5.85,e:eIO2,x:0,y:50,z:0,ry:5,rx:2,k:1.09,o:1,b:0},
 {t:6.6,e:eIO,x:-345,y:5,z:-240,ry:44,rx:3,k:.74,o:.5,b:3},
 {t:7.3,e:eIO,x:-420,y:5,z:-300,ry:50,rx:3,k:.7,o:0,b:6},
 {t:14.7,e:lin,x:-880,y:-290,z:-100,ry:52,rx:3,k:.9,o:0,b:6},
 {t:15.45,e:eOut5,x:-140,y:-290,z:0,ry:15,rx:3,k:.8,o:1,b:0},
 {t:16.4,e:eIO,x:-140,y:-290,z:0,ry:15,rx:3,k:.8,o:1,b:0},
 {t:17.0,e:eIO,x:-180,y:-360,z:-420,ry:18,rx:3,k:.74,o:.25,b:6},
 {t:17.5,e:eIO,x:-180,y:-350,z:-500,ry:18,rx:3,k:.7,o:.09,b:12},
 {t:20,e:lin,x:-180,y:-370,z:-520,ry:18,rx:3,k:.69,o:.09,b:12}
];
const PH_F=[
 {t:0,x:60,y:1200,z:0,ry:-16,rx:12,r:0,s:1.05,o:0,b:12},
 {t:5.69,e:lin,x:60,y:1200,z:0,ry:-16,rx:12,r:0,s:1.05,o:0,b:12},
 {t:5.7,e:lin,x:60,y:1200,z:0,ry:-16,rx:12,r:0,s:1.05,o:1,b:12},
 {t:6.5,e:eOut5,x:55,y:60,z:0,ry:-9,rx:3,r:0,s:1.08,o:1,b:0},
 {t:7.0,e:eIO,x:40,y:60,z:0,ry:-5,rx:2,r:0,s:1.1,o:1,b:0},
 {t:7.7,e:eIO,x:0,y:214,z:0,ry:0,rx:0,r:0,s:1.5,o:1,b:0},
 {t:9.4,e:eIO,x:0,y:214,z:0,ry:3.2,rx:1.4,r:0,s:1.5,o:1,b:0},
 {t:11.0,e:eIO,x:0,y:214,z:0,ry:-1.5,rx:0,r:0,s:1.5,o:1,b:0},
 {t:11.55,e:eIn3,x:0,y:-2300,z:0,ry:-8,rx:-10,r:-10,s:1.5,o:1,b:16},
 {t:11.6,e:lin,x:0,y:-2300,z:0,ry:-8,rx:-10,r:-10,s:1.5,o:0,b:16},
 {t:14.7,e:lin,x:560,y:1300,z:0,ry:-34,rx:6,r:0,s:.96,o:0,b:8},
 {t:14.71,e:lin,x:560,y:1300,z:0,ry:-34,rx:6,r:0,s:.96,o:1,b:8},
 {t:15.7,e:eOut5,x:230,y:50,z:60,ry:-11,rx:3,r:0,s:.96,o:1,b:0},
 {t:16.4,e:eIO,x:230,y:50,z:60,ry:-11,rx:3,r:0,s:.96,o:1,b:0},
 {t:17.0,e:eIO,x:240,y:0,z:-300,ry:-14,rx:3,r:0,s:.88,o:.25,b:6},
 {t:17.5,e:eIO,x:240,y:-20,z:-380,ry:-14,rx:3,r:0,s:.86,o:.09,b:12},
 {t:20,e:lin,x:240,y:-30,z:-400,ry:-14,rx:3,r:0,s:.85,o:.09,b:12}
];
const FG_F=[
 {t:0,x:0,y:0,z:0,ry:-16,rx:10,s:1.08,o:0},
 {t:10.94,e:lin,x:0,y:0,z:0,ry:-16,rx:10,s:1.08,o:0},
 {t:10.95,e:lin,x:0,y:0,z:0,ry:-16,rx:10,s:1.08,o:1},
 {t:14.35,e:eIO,x:0,y:0,z:0,ry:-8,rx:6,s:.99,o:1},
 {t:15.45,e:eOut5,x:-225,y:301,z:0,ry:-14,rx:6,s:.6,o:1},
 {t:16.4,e:eIO,x:-225,y:301,z:0,ry:-14,rx:6,s:.6,o:1},
 {t:17.0,e:eIO,x:-230,y:360,z:-380,ry:-16,rx:6,s:.55,o:.25},
 {t:17.5,e:eIO,x:-230,y:380,z:-460,ry:-16,rx:6,s:.53,o:.09},
 {t:20,e:lin,x:-230,y:390,z:-470,ry:-16,rx:6,s:.52,o:.09}
];

// ---------- S1 ----------
function s1Update(t){
  const el=$('#s1');
  if(t>3.4){el.classList.add('hid');return}
  el.classList.remove('hid');
  const shake=Math.sin(t*95)*8*Math.exp(-t*8)+(t>1.28?Math.sin((t-1.28)*85)*5*Math.exp(-(t-1.28)*9):0);
  const push=1+.05*P(t,0,2.55), pz=P(t,2.55,3.25);
  T($('#s1cam'),{x:shake,y:shake*.6,s:push*(1+10*eIn3(pz)),o:1-P(t,2.95,3.25),b:pz*26});
  // white letters (slam in)
  const wl=(L,off)=>L.spans.forEach((sp,i)=>{const p=eOut5(P(t,-.3+(off+i)*.042,-.3+(off+i)*.042+.44));T(sp,{y:(1-p)*180,s:1+(1-p)*.6,o:Math.min(1,p*4),b:(1-p)*18})});
  wl(S.w1,0); wl(S.w2,4);
  const gp=eIO(P(t,1.15,1.72));
  T(S.gw,{y:-338*gp,s:1-.48*gp,o:1-.12*gp});
  // gold flip-in
  const flip=(L,base)=>L.spans.forEach((sp,i)=>{const p=eBackS(1.4)(P(t,base+i*.04,base+i*.04+.46));T(sp,{rx:(1-p)*-100,y:(1-p)*50,o:p>.02?Math.min(1,p*3):0,b:(1-P(t,base+i*.04,base+i*.04+.46))*8})});
  flip(S.g1,1.38); flip(S.g2,1.5); flip(S.g3,1.62);
  // light sweep
  const sp=P(t,1.1,1.85); T(S.sw,{x:-600+2100*eIO(sp),r:18,o:sp>0&&sp<1?Math.sin(sp*Math.PI)*.95:0});
  // settle shimmer
  const sh=1+.012*Math.sin((t-1.8)*3)*P(t,1.8,2.2);
}

// ---------- browser ----------
function brUpdate(t){
  const p=kf(t,BR_F);
  T(S.el.br,{x:p.x,y:p.y,z:p.z,rx:p.rx,ry:p.ry,s:BRK*p.k,o:p.o,b:p.b});
  if(t<2.5||t>7.4){ if(t<2.5){S.br.url.textContent='';S.br.curs.style.display='none'} }
  const B=S.br; const a=(t0,d,e)=>(e||eOut4)(P(t,t0,t0+d));
  const reset=t>14.6;
  const A=(t0,d)=>reset?1:a(t0,d);
  // URL typing
  B.url.textContent=reset?'alderandco.com':typed(t,3.15,'alderandco.com',26);
  B.curs.style.display=(!reset&&t>3.1&&t<4.2&&(t*3%1)<.6)?'block':'none';
  let q=A(3.35,.5); T(B.nav,{y:-100*(1-q),o:q});
  T(B.logo,{y:26*(1-A(3.45,.4)),o:A(3.45,.4)});
  B.links.forEach((l,i)=>{const r=A(3.5+i*.05,.4);T(l,{y:26*(1-r),o:r})});
  T(B.navbtn,{y:26*(1-A(3.72,.4)),o:A(3.72,.4)});
  q=A(3.55,.4); T(B.eyebrow,{y:24*(1-q),o:q});
  q=A(3.6,.85); T(B.art,{y:110*(1-q),s:.9+.1*q,o:q,b:(1-q)*14});
  B.hl.forEach((h,i)=>{const r=A(3.7+i*.13,.6);T(h,{y:112*(1-r)})});
  q=A(4.2,.5); T(B.sub,{y:34*(1-q),o:q});
  q=A(4.35,.5); T(B.btns,{y:34*(1-q),o:q});
  q=reset?1:eBack(P(t,4.55,5.1)); T(B.chip,{s:.6+.4*q,y:36*(1-q),o:Math.min(1,q*3)});
  B.cards.forEach((c,i)=>{const r=A(4.5+i*.14,.62);T(c,{y:170*(1-r),o:r,b:(1-r)*8})});
  q=A(5.0,.6); T(B.contact,{y:260*(1-q)});
  const g=P(t,5.25,6.0); T(B.glare,{x:(-120+240*g)*14.4,o:g>0&&g<1?1:0});
}

// ---------- phone ----------
const LTAPS=[[8.0,195,482],[8.75,195,251],[9.1,195,345],[9.55,195,457],[10.1,195,554]];
const TOUCH_F=(()=>{const F=[{t:7.7,x:300,y:650,o:0,s:1}];LTAPS.forEach(([tt,x,y])=>{F.push({t:tt-.16,x,y,o:1,s:1,e:eOut3});F.push({t:tt-.02,x,y,o:1,s:1,e:lin});F.push({t:tt+.06,x,y,o:1,s:.82,e:lin});F.push({t:tt+.2,x,y,o:1,s:1,e:lin})});F.push({t:10.34,x:195,y:554,o:1,s:1,e:lin},{t:10.5,x:230,y:620,o:0,s:1,e:lin});return F})();
function phUpdate(t){
  const p=kf(t,PH_F);
  T(S.el.ph,{x:p.x,y:p.y,z:p.z,rx:p.rx,ry:p.ry,r:p.r,s:p.s,o:p.o,b:p.b});
  if(p.o<=0) return;
  const H=S.ph, reset=t>=14.6;
  // mobile site scroll
  const ms=kf(t,[{t:0,v:0},{t:6.3,v:0},{t:7.0,e:eIO,v:760},{t:99,v:760}]).v;
  $('#mobScroll').style.transform='translateY('+(-ms).toFixed(2)+'px)';
  // landing reveal wipe
  const wp=reset?1:eIO2(P(t,7.05,7.52));
  $('#scrL').style.clipPath='inset(0 0 '+((1-wp)*100).toFixed(2)+'% 0)';
  H.wipe.style.top=(wp*844-4)+'px'; H.wipe.style.opacity=(wp>0&&wp<1)?1:0;
  const tt=reset?99:t;
  const ls=reset?0:kf(t,[{t:0,v:0},{t:8.15,v:0},{t:8.72,e:eIO,v:610},{t:99,v:610}]).v;
  $('#landScroll').style.transform='translateY('+(-ls).toFixed(2)+'px)';
  // hero intro
  H.lh.forEach((h,i)=>{const r=reset?1:eOut4(P(t,7.2+i*.09,7.2+i*.09+.5));T(h,{y:54*(1-r)})});
  const fu=(el,t0)=>{const r=reset?1:eOut4(P(t,t0,t0+.45));T(el,{y:26*(1-r),o:r})};
  fu(H.top,7.15); fu(H.badge,7.2); fu(H.p,7.5); fu(H.micro,7.7); H.bul.forEach((b,i)=>fu(b,7.75+i*.07));
  const cr=reset?1:eOut4(P(t,7.55,8.0)); const press=reset?0:pulse(t,8.05,.13,.05);
  T(H.cta,{y:30*(1-cr),s:1-press,o:cr});
  // form fields
  const strs=['Maria Santos','maria@brightpath.co','Website + landing page'], t0s=[8.8,9.15,9.6], cps=[55,55,60];
  const taps=[8.75,9.1,9.55,10.1];
  H.boxes.forEach((b,i)=>{
    const s=reset?'':typed(tt,t0s[i],strs[i],cps[i]);
    $('.txt',b).textContent=s;
    const active=!reset&&tt>=taps[i]&&tt<taps[i+1];
    b.style.borderColor=active?TERRA:'#DDD5C6'; b.style.boxShadow=active?'0 0 0 4px rgba(217,102,58,.16)':'none';
    $('.car',b).style.display=(active&&((t*4)%1)<.6)?'block':'none';
  });
  // submit + success
  const sending=!reset&&t>=10.14&&t<10.32, done=!reset&&t>=10.32;
  H.subtxt.textContent=sending?'Sending…':'Send My Inquiry';
  H.sub.style.transform='scale('+(1-(reset?0:pulse(t,10.14,.13,.05)))+')';
  const ok=reset?0:eOut4(P(t,10.32,10.58)); H.ok.style.opacity=ok;
  const oc=eBack(P(t,10.38,10.75)); H.okc.style.transform='scale('+(.2+.8*oc)+')';
  const np=reset?0:eBack(P(t,10.42,10.82)); T(H.notif,{y:-130*(1-np),o:reset?0:Math.min(1,np*4)});
  // touch
  if(reset||t<7.7||t>10.5){H.touch.style.opacity=0;H.ripple.style.opacity=0}
  else{const f=kf(t,TOUCH_F);H.touch.style.opacity=f.o;H.touch.style.transform='translate('+f.x.toFixed(1)+'px,'+f.y.toFixed(1)+'px) scale('+f.s.toFixed(3)+')';
    let rp=0,rx=0,ry=0;LTAPS.forEach(([tt2,x,y])=>{const r=P(t,tt2,tt2+.5);if(r>0&&r<1){rp=r;rx=x;ry=y}});
    H.ripple.style.opacity=rp>0?(.9*(1-rp)).toFixed(3):0; H.ripple.style.transform='translate('+rx+'px,'+ry+'px) scale('+(.5+1.5*eOut3(rp)).toFixed(3)+')';}
}

// ---------- funnel ----------
function fgUpdate(t){
  const p=kf(t,FG_F);
  T(S.el.fg,{x:p.x,y:p.y,z:p.z,rx:p.rx,ry:p.ry,s:p.s,o:p.o});
  if(p.o<=0) return;
  const F=S.fg;
  F.cards.forEach((c,i)=>{
    const e=eOut5(P(t,11.0+i*.2,11.0+i*.2+.8));
    const pp=1500; c.style.transform='perspective('+pp+'px) translate3d(0,'+((1-e)*560).toFixed(1)+'px,'+(-1000*(1-e)).toFixed(1)+'px) rotateX('+(60*(1-e)).toFixed(2)+'deg)';
    c.style.opacity=Math.min(1,e*2.2).toFixed(3); c.style.filter=(1-e)*14>0.4?'blur('+((1-e)*14).toFixed(1)+'px)':'';
    c.classList.toggle('hid',!(e>0));
  });
  // pulse position through the funnel
  const loop=2.8; const ph=((t-12.0)%loop)/loop; const active=t>12.0;
  const u=ph*3.0; const fade=Math.min(1,ph/.06)*Math.min(1,(1-ph)/.06);
  const y=100+u*258; F.pulse.style.transform='translate(0,'+(y-13)+'px)'; F.pulse.style.opacity=active?fade:0;
  F.cons.forEach((c,i)=>{const r=eOut3(P(t,11.55+i*.2,11.95+i*.2));c.style.opacity=r;c.firstChild.style.transform='scaleY('+r+')';c.firstChild.style.transformOrigin='50% 0';$('.fchev',c).style.opacity=r>.9?1:0;});
  F.cards.forEach((c,i)=>{
    const g=active?Math.max(0,1-Math.abs(u-i)*1.5)*fade:0;
    F.glows[i].style.opacity=(g*.9).toFixed(3);
    F.badges[i].style.background='rgba(227,176,75,'+(.08+.85*g).toFixed(3)+')'; F.badges[i].style.color=g>.5?'#091634':'#F0C866';
  });
}

// ---------- overlays / fx ----------
function txtUpdate(t){
  { const a=Math.min(P(t,3.6,4.2),1-P(t,6.5,6.9)), b=Math.min(P(t,11.4,11.9),1-P(t,16.4,16.8)); T(S.disc,{o:Math.max(a,b)*0.9}); }
  S.s2.forEach((m,i)=>maskT(m,t,4.3+i*.14,6.85));
  S.s3.forEach((m,i)=>maskT(m,t,7.5+i*.13,10.95));
  S.s4.forEach((m,i)=>maskT(m,t,11.25+i*.13,14.55));
  S.s5.forEach((m,i)=>maskT(m,t,16.45+i*.13,16.97));
  // tags
  [15.05,15.5,15.95].forEach((t0,i)=>{const e=eBack(P(t,t0,t0+.4)); const out=P(t,16.45,16.75); const o=Math.min(1,e*3)*(1-out); T(S.tags[i],{s:.5+.5*e,y:14*(1-e),o:o});});
  S.el.scrim5.style.opacity=eOut3(P(t,16.4,16.75))*(1-P(t,16.95,17.25));
  // S6
  const kin=eOut3(P(t,17.1,17.5)); T(S.k6,{y:16*(1-kin),o:kin*(t<17.05?0:1)});
  S.h6.forEach((m,i)=>maskT(m,t,17.1+i*.13,99));
  S.wm.forEach((s,i)=>{const e=eOut5(P(t,17.6+i*.028,17.6+i*.028+.42));T(s,{y:(1-e)*90,s:1+(1-e)*.4,o:Math.min(1,e*4),b:(1-e)*10})});
  const re=eOut4(P(t,17.95,18.4)); T(S.rule,{sx:re,o:re});
  const ce=eBackS(1.2)(P(t,17.74,18.24)); T(S.cta,{y:70*(1-ce),s:.84+.16*ce,o:Math.min(1,ce*3)});
  const sw=P(t,18.75,19.2), sw2=P(t,19.55,19.95);
  T(S.ctasw,{x:-300+1250*eIO(sw>0&&sw<1?sw:(sw2>0?sw2:0)),r:16,o:(sw>0&&sw<1)||(sw2>0&&sw2<1)?1:0});
  // glow breathing on CTA
  S.cta.style.boxShadow='0 22px 60px rgba(0,0,0,.45),0 0 '+(40+30*Math.max(0,Math.sin((t-18.5)*4))*(t>18.5?1:0)).toFixed(0)+'px rgba(237,191,88,'+(.25*(t>18.4?1:0)).toFixed(2)+'),0 0 0 3px rgba(255,255,255,.25) inset';
}
function fxUpdate(t){
  const f=Math.max(pulse(t,.03,.14,.32),pulse(t,3.07,.38,.88),pulse(t,5.95,.22,.22),pulse(t,7.3,.22,.18),pulse(t,11.06,.22,.28),pulse(t,14.96,.22,.28),pulse(t,16.5,.12,.3),pulse(t,17.07,.3,.6));
  S.el.flash.style.opacity=f.toFixed(3);
  S.el.g1.style.transform='translate('+(60*Math.sin(t*.35))+'px,'+(40*Math.cos(t*.3))+'px)';
  S.el.g2.style.transform='translate('+(80*Math.cos(t*.28))+'px,'+(-50*Math.sin(t*.33))+'px)';
  S.el.g3.style.opacity=P(t,16.9,17.7);
  $('#grain').style.transform='translate('+((Math.floor(t*30)*37)%100-50)+'px,'+((Math.floor(t*30)*61)%100-50)+'px)';
}

function renderFrame(t){
  s1Update(t); brUpdate(t); phUpdate(t); fgUpdate(t); txtUpdate(t); fxUpdate(t);
}
window.renderFrame=renderFrame;
