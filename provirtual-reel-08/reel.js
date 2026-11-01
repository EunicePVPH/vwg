'use strict';
/* ProVirtual PH — Reel 08 — deterministic, time-driven renderer.
   Every visual is a pure function of t (seconds). */
const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const lerp=(a,b,p)=>a+(b-a)*p;
const ease={
  out:p=>1-Math.pow(1-p,3), out4:p=>1-Math.pow(1-p,4), in:p=>p*p*p, in2:p=>p*p,
  io:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,
  back:p=>{const s=1.9;return 1+(s+1)*Math.pow(p-1,3)+s*Math.pow(p-1,2)},
  expo:p=>p>=1?1:1-Math.pow(2,-10*p)
};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function el(tag,cls,parent,html,css){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null&&html!=='')e.innerHTML=html;if(css)e.style.cssText=css;if(parent)parent.appendChild(e);return e}
const vis=(e,on,d='block')=>{const v=on?d:'none';if(e.style.display!==v)e.style.display=v};
const T3=(x,y,z=0,rx=0,ry=0,rz=0,s=1)=>`translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const EV=[]; const ev=(t,n,g=1)=>EV.push({t:+t.toFixed(3),n,g});
window.getEvents=()=>EV.slice().sort((a,b)=>a.t-b.t);

const CATS=[
  {k:'INBOX',c:'#3d6fd1'},{k:'APPOINTMENTS',c:'#d9a93f'},{k:'REPORTS',c:'#6b7a90'},
  {k:'RESEARCH',c:'#3f8ea8'},{k:'FOLLOW-UPS',c:'#e0663f'},{k:'ADMIN TASKS',c:'#4b5a8a'}];

/* ---------- kinetic text ---------- */
function mkText(id,lines,opt={}){
  const root=el('div','tl'+(opt.left?' left':''),$('txt'));root.id=id;root.style.top=(opt.top||0)+'px';
  if(opt.shadow!==false)root.style.filter='drop-shadow(0 8px 26px rgba(0,0,0,.5))';
  const mask=opt.mode==='mask';
  const L=lines.map(l=>{
    const line=el('div','line'+(mask?' mask':''),root);line.style.fontSize=l.size+'px';
    if(l.mt)line.style.marginTop=l.mt+'px';
    const mi=el('span','mi',line);mi.style.display='inline-block';
    const chars=[];
    if(!mask){[...l.t].forEach(ch=>{const s=el('span','ch'+(l.gold?' gold':''),mi);s.textContent=ch===' '?' ':ch;chars.push(s)})}
    else{mi.textContent=l.t;if(l.gold)mi.classList.add('gold')}
    if(!l.gold)line.style.color=l.color||'#fff';
    return {line,mi,chars,size:l.size,maxW:l.maxW||(opt.maxW||940)};
  });
  vis(root,true);
  L.forEach(x=>{const w=x.mi.getBoundingClientRect().width;if(w>x.maxW){x.size*=x.maxW/w;x.line.style.fontSize=x.size+'px'}});
  vis(root,false);
  return {root,L,mask,baseTop:opt.top||0};
}
function textIn(T,t,t0,o={}){
  const dur=o.dur||.55,stag=o.stag||.03,ls=o.ls||.12;
  T.L.forEach((L,li)=>{
    if(T.mask){const a=t0+li*ls;const p=ease.out4(prog(t,a,a+dur));L.mi.style.transform=`translateY(${(1-p)*108}%)`;L.mi.style.opacity=p>0?1:0}
    else L.chars.forEach((c,ci)=>{
      const a=t0+li*ls+ci*stag;const p=ease.out4(prog(t,a,a+dur));
      c.style.opacity=p;c.style.transform=`translateY(${(1-p)*(o.y||90)}px) scale(${1+(1-p)*(o.s||.5)})`;
      c.style.filter=p<1?`blur(${(1-p)*(o.b||18)}px)`:'none'});
  });
}
function textShow(T,t,t0,t1,o={}){
  const on=t>=t0&&t<t1;vis(T.root,on);if(!on)return false;
  textIn(T,t,t0,o);
  const x=o.exit||.28;const p=ease.in(prog(t,t1-x,t1));
  T.root.style.opacity=1-p;
  T.root.style.transform=`translateY(${(o.dy||0)+(o.exitY??-50)*p}px) scale(${1+(o.exitS||0)*p})`;
  return true;
}

/* =====================================================================
   SCENE 1 — HOOK (0–3s): calendar fills with responsibilities
   ===================================================================== */
const r1=$('r1');
const LAB=['Call 9:00','Invoice','Follow up','Report','Sync 2PM','Email','Demo','Quote','Reply','Book trip','Review','Admin','Send','Draft','Client','Deadline','Meeting','Research','Update','Confirm'];
const cal1=el('div','card',r1,'','left:50px;top:300px;width:980px;height:1260px;background:#f4f7fc');
el('div','',cal1,'NOVEMBER','position:absolute;left:40px;top:28px;font:900 60px "Inter Display";color:#0b2350;letter-spacing:.03em');
el('div','',cal1,'<span style="color:#d9a93f">●</span> Busy month','position:absolute;right:40px;top:44px;font:700 24px Inter;color:#6b7a90');
['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach((d,i)=>el('div','',cal1,d,`position:absolute;left:${20+i*134}px;top:120px;width:134px;text-align:center;font:700 20px Inter;color:#6b7a90;letter-spacing:.12em`));
const chips1=[];const rn=rng(11);
for(let i=0;i<35;i++){
  const cx=20+(i%7)*134,cy=158+Math.floor(i/7)*220,wk=(i%7==0||i%7==6);
  const cell=el('div','',cal1,'',`position:absolute;left:${cx}px;top:${cy}px;width:134px;height:220px;border:1px solid #dfe5ef;background:${wk?'#eef2f8':'#fff'}`);
  el('div','',cell,String(i<30?i+1:i-29),`position:absolute;left:12px;top:8px;font:700 22px Inter;color:${i<30?'#2b3850':'#aab4c6'}`);
  const n=i<30?3+Math.floor(rn()*2):1;
  for(let j=0;j<n;j++){
    const cat=CATS[Math.floor(rn()*6)],lab=LAB[Math.floor(rn()*LAB.length)];
    chips1.push(el('div','',cell,lab,`position:absolute;left:8px;top:${44+j*42}px;width:118px;height:36px;line-height:36px;padding:0 10px;border-radius:9px;background:${cat.c};color:#fff;font:700 17px Inter;white-space:nowrap;overflow:hidden;opacity:0`));
  }
}
shuffle(chips1,rng(5));
const PRE=58,NCH=chips1.length;
chips1.forEach((c,k)=>{c.tt=k<PRE?-1:0.1+1.75*Math.sqrt((k-PRE)/(NCH-PRE))});
chips1.forEach((c,k)=>{if(k>=PRE&&k%3==0)ev(c.tt,'tick',.5)});

const T1a=mkText('T1a',[{t:'NEED',size:300},{t:'HELP?',size:300}],{top:236});
const T1b=mkText('T1b',[{t:'NOT A',size:150,gold:1},{t:'FULL-TIME',size:150,gold:1},{t:'HIRE?',size:150,gold:1}],{top:850});
ev(0.02,'hit',1.0);ev(1.15,'whoosh',.8);ev(1.3,'hit',.7);ev(2.88,'whoosh',1.0);

function s1(t){
  const on=t<3.2;vis($('g1'),on);vis($('scrim1'),on);
  if(!on){vis(T1a.root,false);vis(T1b.root,false);return}
  const p=t/3,ex=ease.in(prog(t,2.7,3.1));
  $('r1').style.transform=T3(0,0,lerp(-250,190,ease.io(p))+ex*1500);
  cal1.style.transform=`rotateX(${lerp(19,7,p)}deg) rotateY(${lerp(-16,-4,p)}deg) rotateZ(${lerp(-3.5,-.5,p)}deg)`;
  $('g1').style.opacity=1-prog(t,2.92,3.12);
  $('scrim1').style.opacity=(0.8+0.2*prog(t,0,.5))*(1-prog(t,2.9,3.1));
  chips1.forEach(c=>{const q=ease.back(prog(t,c.tt,c.tt+.16));c.style.opacity=clamp(q*2);c.style.transform=`scale(${.55+.45*q})`});
  // headline
  const gl=ease.io(prog(t,1.05,1.7));
  vis(T1a.root,true);
  const a0=Math.max(0,prog(t,-.1,.22));
  textIn(T1a,t+.36,0,{dur:.34,stag:.03,ls:.06,y:120,s:.5,b:18});
  T1a.root.style.transform=`translateY(${lerp(330,0,gl)+(-40*ex)}px) scale(${lerp(1,.9,gl)*(1+0.35*ex)})`;
  T1a.root.style.opacity=1-ex;
  vis(T1b.root,t>=1.15);
  if(t>=1.15){textIn(T1b,t,1.15,{dur:.5,stag:.04,ls:.17,y:130,s:.4,b:20});T1b.root.style.transform=`scale(${1+0.35*ex})`;T1b.root.style.opacity=1-ex}
}

/* =====================================================================
   SCENES 2 + 3 — WORKLOAD (3–8s) → ORGANIZING (8–13s)   (rig A)
   ===================================================================== */
const rA=$('rA');
function mkWin(parent,x,y,w,h,title,css=''){
  const root=el('div','win',parent,'',`left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css}`);
  const bar=el('div','',root,'',`position:absolute;left:0;top:0;width:${w}px;height:64px;background:#e9eef6;border-bottom:1px solid #d6dde9`);
  [0,1,2].forEach(i=>el('div','',bar,'',`position:absolute;left:${24+i*24}px;top:26px;width:12px;height:12px;border-radius:6px;background:#b5c0d3`));
  const tt=el('div','',bar,title,'position:absolute;left:112px;top:0;line-height:64px;font:800 26px Inter;color:#13224a');
  const body=el('div','',root,'',`position:absolute;left:0;top:64px;width:${w}px;height:${h-64}px;overflow:hidden`);
  return {root,bar,tt,body};
}
const AVC=['#3d6fd1','#d9a93f','#4b5a8a','#3f8ea8','#e0663f','#6b7a90'];
const EMAILS=[
 ['Harbor Coffee Co.','Quote request for Friday','Hi! Could you send over the details for…','9:02'],
 ['Alder & Finch','Invoice #1042 follow-up','Just checking on the status of this…','9:04'],
 ['Brightside Fitness','Can we move our call?','Something came up this afternoon…','9:07'],
 ['Willow Studio','Contract draft — please review','Attached is the latest version of…','9:09'],
 ['Cedar Events','Venue options?','Do you have a moment to look at…','9:11'],
 ['Northside Print','Order question','We noticed a small issue with the…','9:12'],
 ['Maple Dental','Appointment reminders','Could we update the schedule for…','9:14'],
 ['Juniper Co.','Re: Proposal reminder','Following up on last week’s…','9:15'],
 ['Stonebridge Legal','Documents needed','Please send the signed copy of…','9:16'],
 ['Lumen Photo','Quick question','Hope you’re well! One thing…','9:17'],
 ['Redwood Supply','Delivery update','Your order is scheduled for…','9:18'],
 ['Oakline Realty','Meeting notes','Thanks for today. Here’s what…','9:19'],
 ['Pine & Co.','Follow-up needed','Wanted to circle back on…','9:20'],
 ['Birch Weddings','Schedule change','We’d like to adjust the date…','9:20']];

// Inbox window (behind the cards)
const inboxW=mkWin(rA,30,250,800,860,'Inbox');
const badge=el('div','',inboxW.bar,'24','position:absolute;right:24px;top:14px;padding:0 18px;height:36px;line-height:36px;border-radius:18px;background:#e0443e;color:#fff;font:800 22px Inter');
const mrows=EMAILS.map((m,i)=>{
  const r=el('div','mrow',inboxW.body,`<div class="av" style="background:${AVC[i%6]}">${m[0][0]}</div><div class="rt"><div class="rs"><b>${m[0]}</b><span>${m[3]}</span></div><div class="rj">${m[1]}</div><div class="rp">${m[2]}</div></div><i class="ud"></i>`);
  return r});
const mta=EMAILS.map((_,i)=>i<6?-1+i*.01:3.45+3.3*(1-Math.pow(1-(i-6)/7,1.4)));
mta.forEach((t0,i)=>{if(i>=6)ev(t0,'ping',.6)});ev(3.2,'ping',.4);ev(3.38,'ping',.5);

// Calendar day builder (used in scene 2 and again in scene 4)
const DAYEV=[
 {n:'Client call',c:'#d9a93f',b:[9,1,0,2],a:[9,1,0,1],conf:0},
 {n:'Team sync',c:'#3d6fd1',b:[9.5,1,1,2],a:[10,.75,0,1],conf:1},
 {n:'Vendor demo',c:'#6b7a90',b:[10,1.5,0,2],a:[10.75,1,0,1],conf:1},
 {n:'Lunch: supplier',c:'#4b5a8a',b:[12,1,0,1],a:[12,1,0,1],conf:0},
 {n:'Proposal due',c:'#e0663f',b:[13,1,0,2],a:[13,1,0,1],conf:1},
 {n:'Studio visit',c:'#3f8ea8',b:[13.5,1.5,1,2],a:[14,1,0,1],conf:1},
 {n:'Report review',c:'#d9a93f',b:[15.5,1,0,1],a:[15.5,1,0,1],conf:0}];
function buildDay(parent,w,h,hourH,top0){
  const areaW=w-124;
  for(let hr=8;hr<=17;hr++){
    const y=top0+(hr-8)*hourH;
    el('div','',parent,(hr>12?hr-12:hr)+(hr>=12?' PM':' AM'),`position:absolute;left:14px;top:${y-12}px;font:700 17px Inter;color:#8793aa`);
    el('div','',parent,'',`position:absolute;left:96px;top:${y}px;width:${w-110}px;height:1px;background:#dfe5ef`);
  }
  const box=(e,st)=>{const [s,d,col,cols]=st=='b'?e.b:e.a;return{x:100+col*(areaW/cols),y:top0+(s-8)*hourH,w:areaW/cols-8,h:d*hourH-5}};
  const evs=DAYEV.map(e=>{
    const d=el('div','',parent,`<div style="font:800 22px Inter;white-space:nowrap">${e.n}</div>`,`position:absolute;border-radius:12px;background:${e.c};color:#fff;padding:9px 14px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,.18)`);
    const tag=el('div','pill',d,'',`position:absolute;right:10px;top:9px;height:28px;line-height:28px;font-size:13px`);
    return {el:d,tag,bb:box(e,'b'),aa:box(e,'a'),def:e}});
  return {evs};
}
function setDay(day,fn){ // fn(i)-> {ap, mv}
  day.evs.forEach((e,i)=>{
    const {ap,mv}=fn(i);const A=e.bb,B=e.aa;
    const x=lerp(A.x,B.x,mv),y=lerp(A.y,B.y,mv),w=lerp(A.w,B.w,mv),h=lerp(A.h,B.h,mv);
    const s=e.el.style;s.left=x+'px';s.top=y+'px';s.width=w+'px';s.height=h+'px';
    s.opacity=clamp(ap*2);s.transform=`scale(${.9+.1*clamp(ap)})`;
    const hh=h>60;
    if(e.def.conf){
      const ok=mv>=.98;e.tag.style.display='inline-block';
      e.tag.textContent=ok?'✓ SET':'CONFLICT';
      e.tag.style.background=ok?'#e1f6ea':'#fde8e6';e.tag.style.color=ok?'#1f8a55':'#d03a33';
      e.tag.style.display=(ap>.6&&hh)||ok?'inline-block':'none';
    }else e.tag.style.display='none';
  });
}
const calW=mkWin(rA,250,830,800,820,'Today · Monday');
const calConf=el('div','pill',calW.bar,'4 CONFLICTS','position:absolute;right:24px;top:15px;background:#fde8e6;color:#d03a33');
const day2=buildDay(calW.body,800,756,72,34);
const dta=day2.evs.map((_,i)=>3.2+i*.14);

// ---- 18 task cards (shared chaos → lanes morph)
const DATA=[
 [0,'Quote request','Unread · 9:02',0],[0,'Invoice #1042','Unread · 9:14',0],[0,'Reschedule call?','Unread · 9:31',0],
 [1,'Client call 10:00','Overlaps Team sync',1],[1,'Vendor demo 10:30','Double-booked',1],[1,'Studio visit','Needs new time',0],
 [2,'Weekly report','Due today',1],[2,'Expense summary','Not started',0],[2,'Client update','Draft needed',0],
 [3,'Venue options','Notes scattered',0],[3,'Competitor review','Not started',0],[3,'Supplier list','Needs research',0],
 [4,'Harbor Coffee Co.','Due today',1],[4,'Proposal reminder','Overdue 2 days',1],[4,'Brightside Fitness','Due tomorrow',0],
 [5,'Client database','Needs updating',0],[5,'Signed contracts','Needs filing',0],[5,'Event travel','Not booked',0]];
const rc=rng(21);
const slots=[];
for(let r=0;r<9;r++)for(let c=0;c<2;c++)slots.push({x:(c?700:380)+(rc()-.5)*110,y:340+r*136+(rc()-.5)*50,rot:(rc()-.5)*15,z:(rc()-.5)*300});
shuffle(slots,rc);
const order=[0,3,6,9,12,15];const rest=shuffle(DATA.map((_,i)=>i).filter(i=>!order.includes(i)),rc);
const arrive=order.concat(rest);
const CARDS=DATA.map((d,i)=>{
  const cat=CATS[d[0]];
  const e=el('div','tcard',rA,`<div class="bar" style="background:${cat.c}"></div><div class="tag" style="color:${cat.c}">${cat.k}</div><div class="ttl">${d[1]}</div><div class="meta" style="${d[3]?'color:#d03a33':''}">${d[2]}</div><div class="stat"></div>`);
  const k=i%3,r=d[0],ai=arrive.indexOf(i),s=slots[ai];
  const c={el:e,i,r,k,ai,cx:s.x,cy:s.y,cz:s.z,rot:s.rot,lx:380+264*k,ly:694+124*r,
    ttl:e.querySelector('.ttl'),meta:e.querySelector('.meta'),tag:e.querySelector('.tag'),stat:e.querySelector('.stat'),
    orig:d[2],urgent:d[3],state:-1};
  c.ta=3.35+3.25*(1-Math.pow(1-ai/17,1.5));
  c.tm=8.3+r*.27+k*.08;c.as=c.tm+.64;c.dn=10.95+r*.15+k*.06;
  return c});
CARDS.forEach(c=>{ev(c.ta,'pop',.55);ev(c.tm+.5,'snap',.5);if(c.k==0)ev(c.dn+.05,'check',.55)});
// freeze moment + scan line
ev(7.55,'riser',1);ev(8.0,'freeze',1);ev(8.1,'whoosh',.9);
ev(3.0,'whoosh',.7);

// lanes
const LANES=CATS.map((c,r)=>el('div','lane',rA,`<div class="lb"><i class="dot" style="background:${c.c}"></i>${c.k}</div>`,`top:${640+r*124}px;opacity:0`));

const T2a=mkText('T2a',[{t:'SO MUCH',size:160},{t:'TO DO.',size:160}],{top:250});
const T2b=mkText('T2b',[{t:'ONLY SO MANY',size:100},{t:'HOURS.',size:250,gold:1,mt:-6}],{top:250});
const T3a=mkText('T3a',[{t:'GET SUPPORT',size:116},{t:'WHERE YOU',size:116},{t:'NEED IT.',size:116}],{top:236,mode:'mask'});
const T3b=mkText('T3b',[{t:'FLEXIBLE',size:124,gold:1},{t:'REMOTE',size:124,gold:1},{t:'ASSISTANCE.',size:124,gold:1}],{top:236,mode:'mask'});
ev(3.3,'hit',.7);ev(5.45,'hit',.9);ev(8.25,'hit',.55);ev(10.55,'hit',.8);

function camA(t){
  // returns [x,y,z,rx,ry,rz]
  const q=prog(t,3.4,8.0),I=Math.pow(q,1.15)*(1-prog(t,7.92,8.04));
  const sx=(Math.sin(t*37)*3.2+Math.sin(t*91)*1.8)*I,sy=(Math.sin(t*43+1)*3.2+Math.sin(t*77)*1.6)*I;
  const rz0=lerp(-1.3,1.7,q)+Math.sin(t*23)*.4*I;
  const z0=lerp(0,230,ease.io(q)),ry0=Math.sin(t*.9)*2.5;
  const b=ease.io(prog(t,8.25,10.4));
  const ent=1-ease.out(prog(t,3.0,3.55));
  const ext=ease.in(prog(t,12.75,13.3));
  return [lerp(sx,0,b),lerp(sy,-40,b),lerp(z0,-120,b)-ent*900-ext*500,lerp(0,22,b),lerp(ry0,0,b),lerp(rz0,0,b)];
}
function sA(t){
  const on=t>=2.95&&t<13.35;vis($('gA'),on);
  if(!on){vis(T2a.root,false);vis(T2b.root,false);vis(T3a.root,false);vis(T3b.root,false);vis($('scan'),false);return}
  const c=camA(t);$('rA').style.transform=T3(c[0],c[1],c[2],c[3],c[4],c[5]);
  $('gA').style.opacity=clamp(prog(t,2.95,3.25))*(1-prog(t,13.0,13.35));
  const frozen=t>=8.0;
  // windows
  const recede=ease.io(prog(t,8.0,9.3));
  vis(inboxW.root,t<9.4);vis(calW.root,t<9.4);
  if(t<9.4){
    inboxW.root.style.transform=T3(0,0,lerp(-40,-800,recede),0,lerp(13,18,recede),0);
    calW.root.style.transform=T3(0,0,lerp(-140,-900,recede),0,lerp(-13,-18,recede),0);
    const f=`saturate(${lerp(1,.4,ease.out(prog(t,8,8.4)))}) brightness(${lerp(1,.5,recede)})`;
    inboxW.root.style.filter=f;calW.root.style.filter=f;
    inboxW.root.style.opacity=calW.root.style.opacity=1-prog(t,8.7,9.4);
    const tt=Math.min(t,8.0);
    let arrived=0;
    mrows.forEach((r,i)=>{
      let shift=0;for(let j=i+1;j<mrows.length;j++)shift+=ease.out(prog(tt,mta[j],mta[j]+.2));
      const p=ease.out(prog(tt,mta[i],mta[i]+.22));
      r.style.top=(0+shift*104)+'px';r.style.opacity=p;r.style.transform=`translateX(${(1-p)*-90}px)`;
      if(p>.5)arrived++;
    });
    badge.textContent=Math.floor(22+arrived*9.6);
    setDay(day2,i=>({ap:prog(tt,dta[i],dta[i]+.25),mv:0}));
    calConf.style.opacity=.55+.45*Math.abs(Math.sin(tt*6));
  }
  // lanes
  LANES.forEach((l,r)=>{const p=ease.out4(prog(t,8.05+r*.1,8.65+r*.1));l.style.opacity=p;l.style.transform=T3((1-p)*-70,0,0)});
  // cards
  const tt=Math.min(t,8.0);
  CARDS.forEach(c=>{
    const ap=prog(t,c.ta,c.ta+.3);
    if(ap<=0){vis(c.el,false);return}
    vis(c.el,true,'flex');
    const pm=ease.io(prog(t,c.tm,c.tm+.62)),eIn=ease.back(ap);
    const dr=Math.sin(tt*1.9+c.i)*8*(1-pm),dr2=Math.cos(tt*1.5+c.i*2)*5*(1-pm);
    const x=lerp(c.cx+dr,c.lx,pm),y=lerp(c.cy+dr2+(1-eIn)*70,c.ly,pm);
    const z=lerp(c.cz,0,pm)+Math.sin(Math.PI*pm)*170+(1-clamp(eIn,0,1))*-320;
    const w=lerp(520,252,pm),h=lerp(124,100,pm);
    const s=c.el.style;
    s.width=w+'px';s.height=h+'px';
    s.transform=`translate3d(${x-w/2}px,${y-h/2}px,${z}px) rotateZ(${lerp(c.rot,0,pm)}deg) scale(${.72+.28*eIn})`;
    s.opacity=clamp(ap*2.2);
    c.ttl.style.fontSize=lerp(33,22,pm)+'px';c.meta.style.fontSize=lerp(21,16,pm)+'px';
    c.tag.style.maxHeight=lerp(26,0,pm)+'px';c.tag.style.opacity=1-clamp(pm*1.6);
    const st=t>=c.dn?2:(t>=c.as?1:0);
    if(st!==c.state){
      c.state=st;
      if(st==0){c.meta.innerHTML=c.orig;c.meta.style.color=c.urgent?'#d03a33':'#8290a8';c.stat.style.display='none'}
      if(st==1){c.meta.innerHTML='ASSIGNED';c.meta.style.color='#b8861f';c.stat.style.display='block';c.stat.style.background='#e8bd55';c.stat.textContent='→'}
      if(st==2){c.meta.innerHTML='DONE';c.meta.style.color='#1f8a55';c.stat.style.display='block';c.stat.style.background='#2fa36b';c.stat.textContent='✓'}
    }
    if(st>=1){const q=ease.back(prog(t,st==1?c.as:c.dn,(st==1?c.as:c.dn)+.25));c.stat.style.transform=`scale(${q})`}
  });
  // scan line at the freeze
  const sp=prog(t,8.0,8.62);vis($('scan'),sp>0&&sp<1);
  $('scan').style.top=lerp(-10,1930,ease.io(sp))+'px';
  // vignette (stress) in scene 2
  $('vig').style.opacity=clamp(prog(t,3.6,7.9))*.9*(1-prog(t,8.0,8.5));
  // texts
  vis($('scrimTop'),t>=3.2&&t<13.0);
  const sc=t<9.3?.97:lerp(.97,.6,prog(t,9.3,10.3));
  $('scrimTop').style.opacity=sc*prog(t,3.2,3.5)*(1-prog(t,12.7,13.0));
  textShow(T2a,t,3.3,5.5,{dur:.42,stag:.035,ls:.1,y:110,s:.5,b:18});
  textShow(T2b,t,5.5,8.05,{dur:.45,stag:.035,ls:.2,y:110,s:.6,b:20,exit:.15});
  textShow(T3a,t,8.25,10.65,{dur:.6,ls:.13});
  textShow(T3b,t,10.65,12.85,{dur:.6,ls:.13,exit:.3});
  // flashes
  const fl=Math.max(.38*(1-prog(t,3.0,3.28))*prog(t,2.98,3.04), .3*(1-prog(t,8.0,8.22))*(t>=8.0?1:0));
  $('flash').style.opacity=fl;
}
