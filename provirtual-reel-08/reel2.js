/* =====================================================================
   SCENE 4 — PROVIRTUAL SERVICES (13–19s): a human VA works in the workspace
   ===================================================================== */
const r4=$('r4');
const DW=960,DH=840;
const deskWrap=el('div','',r4,'',`position:absolute;left:60px;top:300px;width:${DW}px;height:${DH}px;transform-style:flat`);
const desk=el('div','win',deskWrap,'',`left:0;top:0;width:${DW}px;height:${DH}px;border-radius:34px`);
const dbar=el('div','',desk,'',`position:absolute;left:0;top:0;width:${DW}px;height:64px;background:#e9eef6;border-bottom:1px solid #d6dde9`);
[0,1,2].forEach(i=>el('div','',dbar,'',`position:absolute;left:${28+i*26}px;top:26px;width:13px;height:13px;border-radius:7px;background:#b5c0d3`));
el('div','',dbar,'Support Workspace','position:absolute;left:130px;line-height:64px;font:800 26px Inter;color:#13224a');
el('div','pill',dbar,'<i style="display:inline-block;width:12px;height:12px;border-radius:6px;background:#2fa36b;margin-right:10px;vertical-align:-1px"></i>YOUR VA · REMOTE','position:absolute;right:24px;top:14px;background:#e1f6ea;color:#1b7a4c;font-size:15px');
const TABS=['Email','Calendar','Documents','Research','Follow-ups'];
const tabStrip=el('div','',desk,'',`position:absolute;left:0;top:64px;width:${DW}px;height:64px;background:#fff;border-bottom:1px solid #dde4ef`);
const tabEls=TABS.map((n,i)=>el('div','',tabStrip,n,`position:absolute;left:${i*192}px;top:0;width:192px;height:64px;line-height:62px;text-align:center;font:800 24px Inter;color:#8793aa`));
const tabLine=el('div','',tabStrip,'',`position:absolute;left:0;bottom:0;width:192px;height:5px;background:#e0b24f`);
const dbody=el('div','',desk,'',`position:absolute;left:0;top:128px;width:${DW}px;height:${DH-128}px;overflow:hidden;background:#f7f9fd`);
const PT=[13.0,14.45,15.8,17.25,18.15,19.2]; // panel start times
const panels=[0,1,2,3,4].map(()=>el('div','',dbody,'','position:absolute;inset:0;display:none'));

/* P0 — email */
const SIDE=[['Inbox',128],['Clients',12],['Invoices',3],['Follow-ups',7],['Archive',0]];
const side=el('div','',panels[0],'',`position:absolute;left:0;top:0;width:220px;height:100%;background:#eef2f8;border-right:1px solid #dde4ef`);
const sideEls=SIDE.map((s,i)=>{
  const d=el('div','',side,`<span>${s[0]}</span><b>${s[1]}</b>`,`position:absolute;left:14px;top:${24+i*70}px;width:192px;height:58px;border-radius:14px;display:flex;justify-content:space-between;align-items:center;padding:0 16px;font:700 22px Inter;color:#32415f;${i==0?'background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.08);color:#0b2350':''}`);
  return {d,b:d.querySelector('b')}});
const erows=[0,1,2,3,4,5,6].map(i=>{
  const m=EMAILS[i];
  const d=el('div','',panels[0],`<div style="position:absolute;left:16px;top:19px;width:50px;height:50px;border-radius:14px;background:${AVC[i%6]};color:#fff;font:800 24px Inter;display:flex;align-items:center;justify-content:center">${m[0][0]}</div><div style="position:absolute;left:82px;top:13px;font:800 22px Inter;color:#13224a">${m[0]}</div><div style="position:absolute;left:82px;top:46px;font:600 19px Inter;color:#7c8aa3;white-space:nowrap;width:330px;overflow:hidden;text-overflow:ellipsis">${m[1]}</div><div class="ud" style="position:absolute;left:3px;top:38px;width:10px;height:10px;border-radius:5px;background:#3d6fd1"></div>`,`position:absolute;left:236px;top:${14+i*96}px;width:704px;height:88px;background:#fff;border-radius:16px;border:1px solid #e3e8f1;box-shadow:0 4px 10px rgba(11,35,80,.05)`);
  const lab=el('span','pill',d,'','position:absolute;right:16px;top:27px;display:none;color:#fff');
  const dr=el('span','pill',d,'✎ DRAFT FOR YOUR REVIEW','position:absolute;right:130px;top:27px;display:none;background:#fff3d4;color:#8a6414;font-size:13px');
  return {d,lab,dr,ud:d.querySelector('.ud')}});
erows[0].lab.textContent='CLIENT';erows[0].lab.style.background='#3d6fd1';
erows[2].lab.textContent='CALENDAR';erows[2].lab.style.background='#d9a93f';erows[2].lab.style.color='#0b2350';

/* P1 — calendar */
el('div','',panels[1],'',`position:absolute;left:0;top:0;width:${DW}px;height:100%;background:#fff`);
const day4=buildDay(panels[1],DW,DH-128,74,22);
const toast=el('div','',panels[1],'✓ &nbsp;Invites sent to attendees','position:absolute;right:28px;bottom:26px;padding:14px 24px;border-radius:16px;background:#0b2350;color:#fff;font:700 21px Inter;box-shadow:0 14px 30px rgba(0,0,0,.3);opacity:0');

/* P2 — document */
el('div','',panels[2],'',`position:absolute;left:0;top:0;width:${DW}px;height:100%;background:#e6ebf3`);
const page=el('div','',panels[2],'',`position:absolute;left:100px;top:22px;width:760px;height:690px;background:#fff;border-radius:10px 10px 0 0;box-shadow:0 14px 40px rgba(11,35,80,.18)`);
el('div','',page,'Weekly Client Report','position:absolute;left:48px;top:36px;font:900 40px "Inter Display";color:#0b2350;letter-spacing:-.01em');
el('div','',page,'Prepared by your VA · for your review','position:absolute;left:48px;top:90px;font:600 20px Inter;color:#8793aa');
el('div','',page,'',`position:absolute;left:48px;top:128px;width:664px;height:3px;background:#e0b24f`);
const DOCTXT='This week: client messages sorted, meetings coordinated, and open follow-ups tracked below.';
const docp=el('div','',page,'','position:absolute;left:48px;top:152px;width:664px;font:500 23px/1.45 Inter;color:#26334f;height:100px');
const caret=el('span','',null,'','display:inline-block;width:3px;height:26px;background:#0b2350;vertical-align:-5px;margin-left:2px');
const TBL=[['Client','Task','Status'],['Harbor Coffee Co.','Proposal sent','Done'],['Brightside Fitness','Call rescheduled','Done'],['Alder & Finch','Invoice follow-up','In progress'],['Willow Studio','Contract review','Scheduled']];
const trows=TBL.map((r,i)=>{
  const d=el('div','',page,'',`position:absolute;left:48px;top:${270+i*72}px;width:664px;height:64px;border-bottom:1px solid #e3e8f1;${i==0?'background:#f0f3f9;border-radius:8px':''}`);
  const cols=[0,230,470],ws=[220,230,190];
  r.forEach((c,j)=>{
    let h=c;
    if(i>0&&j==2){const col=c=='Done'?['#e1f6ea','#1b7a4c']:c=='In progress'?['#fff3d4','#8a6414']:['#e3ebfa','#2a55a8'];h=`<span class="pill" style="background:${col[0]};color:${col[1]};font-size:14px">${c.toUpperCase()}</span>`}
    el('div','',d,h,`position:absolute;left:${cols[j]+14}px;top:0;width:${ws[j]}px;line-height:62px;font:${i==0?'800 17px':'700 21px'} Inter;color:${i==0?'#6b7a90':'#13224a'};${i==0?'letter-spacing:.1em':''}`)});
  return d});

/* P3 — research */
el('div','',panels[3],'',`position:absolute;left:0;top:0;width:${DW}px;height:100%;background:#f1f4fa`);
const rcard=el('div','',panels[3],`<div style="position:absolute;left:34px;top:24px;font:900 30px 'Inter Display';color:#0b2350">Venue options — comparison</div><div style="position:absolute;right:34px;top:30px" class="pill" id="rtag">4 NOTES MERGED</div>`,`position:absolute;left:40px;top:24px;width:880px;height:386px;background:#fff;border-radius:22px;box-shadow:0 12px 34px rgba(11,35,80,.12)`);
const RES=[['Downtown loft','Fits 40 guests','Near transit'],['Garden hall','Outdoor space','Free parking'],['Studio space','Fits 25 guests','Quiet area'],['Rooftop deck','Skyline views','Weather risk']];
const rrows=RES.map((r,i)=>{
  const d=el('div','',rcard,'',`position:absolute;left:30px;top:${96+i*66}px;width:820px;height:56px;border-radius:12px;background:${i%2?'#fff':'#f5f7fc'};opacity:0`);
  r.forEach((c,j)=>el('div','',d,c,`position:absolute;left:${16+[0,300,560][j]}px;line-height:56px;font:${j==0?'800':'600'} 22px Inter;color:${j==0?'#0b2350':'#4b5a78'}`));
  return d});
const NOTES=[[70,470,'Loft · fits 40'],[390,520,'Garden · parking'],[640,450,'Studio · quiet'],[250,610,'Rooftop · views']];
const notes=NOTES.map((n,i)=>el('div','',panels[3],n[2],`position:absolute;left:0;top:0;width:240px;height:70px;line-height:70px;text-align:center;border-radius:12px;background:#fff6d6;border:2px solid #efd488;color:#6b4d0a;font:800 21px Inter;box-shadow:0 10px 22px rgba(0,0,0,.14)`));
const shared=el('div','pill',panels[3],'✓ &nbsp;SHARED WITH YOU','position:absolute;left:300px;top:640px;height:46px;line-height:46px;padding:0 28px;border-radius:23px;background:#0b2350;color:#fff;font-size:17px;opacity:0');

/* P4 — follow-ups */
el('div','',panels[4],'',`position:absolute;left:0;top:0;width:${DW}px;height:100%;background:#fff`);
el('div','',panels[4],'Follow-up tracker','position:absolute;left:40px;top:20px;font:900 32px "Inter Display";color:#0b2350');
el('div','pill',panels[4],'4 TRACKED','position:absolute;right:40px;top:26px;background:#e3ebfa;color:#2a55a8');
const FU=[['Harbor Coffee Co.','Proposal reminder','Today'],['Brightside Fitness','Check-in message','Tomorrow'],['Alder & Finch','Invoice follow-up','Friday'],['Willow Studio','Contract questions','Monday']];
const furows=FU.map((f,i)=>{
  const d=el('div','',panels[4],`<div class="cb" style="position:absolute;left:24px;top:28px;width:38px;height:38px;border-radius:11px;border:3px solid #c3cde0;background:#fff;color:#fff;font:900 24px/32px Inter;text-align:center"></div><div style="position:absolute;left:88px;top:15px;font:800 24px Inter;color:#13224a">${f[0]}</div><div style="position:absolute;left:88px;top:50px;font:600 20px Inter;color:#7c8aa3">${f[1]} · ${f[2]}</div><span class="pill st" style="position:absolute;right:22px;top:29px;font-size:15px"></span>`,`position:absolute;left:34px;top:${84+i*104}px;width:892px;height:94px;border-radius:18px;background:#f5f7fc;border:1px solid #e3e8f1`);
  return {d,cb:d.querySelector('.cb'),st:d.querySelector('.st')}});
const FUT=[18.38,18.6,18.84,18.92]; // status flip times

/* ---- VA cursor ---- */
const cur=el('div','',deskWrap,`<svg width="46" height="54" viewBox="0 0 46 54" style="display:block;filter:drop-shadow(0 6px 10px rgba(0,0,0,.45))"><path d="M4 3 L4 41 L14 32 L21 48 L29 44 L22 29 L36 29 Z" fill="#f2c34e" stroke="#0b2350" stroke-width="3" stroke-linejoin="round"/></svg><div style="position:absolute;left:32px;top:42px;background:#f2c34e;color:#0b2350;font:800 21px Inter;padding:5px 15px;border-radius:12px;white-space:nowrap;box-shadow:0 8px 18px rgba(0,0,0,.35)">Your VA</div>`,'position:absolute;left:0;top:0;z-index:60;pointer-events:none;display:none');
const cB=(i,st)=>{const b=st=='b'?day4.evs[i].bb:day4.evs[i].aa;return [b.x+b.w*.5,128+b.y+b.h*.45]};
const BY=128;
const CP=[ // [t,x,y]
 [13.0,880,300],[13.1,880,300],[13.38,850,BY+14+44],[13.5,850,BY+14+44],
 [13.62,430,BY+14+96+44],[13.64,430,BY+14+96+44],[13.98,108,BY+24+140+29],[14.08,108,BY+24+140+29],
 [14.2,850,BY+14+96+44],[14.3,850,BY+14+96+44],
 [14.45,288,92],[14.55,288,92],
 [14.62,...cB(1,'b')],[14.64,...cB(1,'b')],[14.95,...cB(1,'a')],[15.0,...cB(1,'a')],
 [15.03,...cB(2,'b')],[15.05,...cB(2,'b')],[15.3,...cB(2,'a')],[15.34,...cB(2,'a')],
 [15.37,...cB(5,'b')],[15.39,...cB(5,'b')],[15.62,...cB(5,'a')],[15.68,...cB(5,'a')],
 [15.8,480,92],[15.88,480,92],
 [16.0,300,BY+175],[16.45,560,BY+200],[16.7,520,BY+350],[17.1,640,BY+470],
 [17.25,672,92],[17.3,672,92],
 [17.34,500,BY+560],[17.45,300,BY+520],[17.7,320,BY+200],[17.95,720,BY+330],
 [18.15,864,92],[18.2,864,92],
 [18.38,62,BY+84+47],[18.42,62,BY+84+47],[18.6,62,BY+84+104+47],[18.64,62,BY+84+104+47],[18.84,62,BY+84+208+47],[19.0,500,BY+420]];
function curAt(t){
  if(t<=CP[0][0])return [CP[0][1],CP[0][2]];
  for(let i=0;i<CP.length-1;i++){const a=CP[i],b=CP[i+1];
    if(t<=b[0]){const p=ease.io(prog(t,a[0],b[0]));return [lerp(a[1],b[1],p),lerp(a[2],b[2],p)]}}
  const l=CP[CP.length-1];return [l[1],l[2]];
}
const CLICKS=[13.42,13.62,13.98,14.22,14.45,14.62,14.95,15.03,15.3,15.37,15.62,15.8,16.5,17.25,18.15,18.38,18.6,18.84];
const rings=CLICKS.map(tc=>{const p=curAt(tc);return {tc,e:el('div','',deskWrap,'',`position:absolute;left:${p[0]-34}px;top:${p[1]-34}px;width:68px;height:68px;border-radius:34px;border:4px solid #f2c34e;opacity:0;z-index:55`)}});
CLICKS.forEach((tc,i)=>ev(tc,(i==1||i==5||i==7||i==9)?'grab':'click',.7));
ev(13.98,'drop',.7);ev(14.95,'drop',.6);ev(15.3,'drop',.6);ev(15.62,'drop',.6);
ev(13.95,'ding',.4);ev(15.62,'ding',.6);
for(let i=0;i<14;i++)ev(15.98+i*.045,'type',.35);
for(let i=0;i<4;i++)ev(16.5+i*.16,'tick',.55);
ev(18.4,'ding',.5);ev(18.62,'ding',.5);ev(18.86,'ding',.5);ev(17.8,'ding',.4);
ev(13.0,'whoosh',.8);ev(14.4,'whoosh',.4);ev(15.78,'whoosh',.4);ev(17.2,'whoosh',.4);ev(18.12,'whoosh',.4);

const SVC=[[13.0,'01','EMAIL MANAGEMENT'],[14.4,'02','CALENDAR COORDINATION'],[15.8,'03','ADMIN SUPPORT'],[17.25,'04','RESEARCH & FOLLOW-UPS']];
const TSV=SVC.map((s,i)=>{
  const T=mkText('TSV'+i,[{t:s[2],size:46,maxW:880}],{top:238,mode:'mask',left:1,shadow:false});
  T.L[0].mi.innerHTML=`<span class="gold" style="margin-right:22px">${s[1]}</span>${s[2]}`;
  T.L[0].line.style.letterSpacing='.02em';
  return T});
const T4=[
 mkText('T4a',[{t:'YOUR',size:70},{t:'BUSINESS.',size:150,gold:1}],{top:1196,mode:'mask'}),
 mkText('T4b',[{t:'YOUR',size:70},{t:'PRIORITIES.',size:150,gold:1}],{top:1196,mode:'mask'}),
 mkText('T4c',[{t:'THE RIGHT',size:70},{t:'SUPPORT.',size:150,gold:1}],{top:1196,mode:'mask'})];
const T4t=[[13.2,15.15],[15.15,17.15],[17.15,18.85]];
ev(13.2,'hit',.5);ev(15.15,'hit',.45);ev(17.15,'hit',.7);

function s4(t){
  const on=t>=12.85&&t<19.3;vis($('g4'),on);
  if(!on){TSV.forEach(T=>vis(T.root,false));T4.forEach(T=>vis(T.root,false));return}
  const en=ease.out4(prog(t,12.9,13.55)),ex=ease.in(prog(t,18.7,19.25));
  $('r4').style.transform=T3(0,lerp(260,0,en)+ex*-60,lerp(-650,0,en)-ex*700,lerp(24,0,en)+ex*10,lerp(-5,4,prog(t,13,19)),0);
  $('g4').style.opacity=clamp(prog(t,12.9,13.2))*(1-prog(t,18.95,19.28));
  // tabs
  const f=ease.io(prog(t,PT[1],PT[1]+.22))+ease.io(prog(t,PT[2],PT[2]+.22))+ease.io(prog(t,PT[3],PT[3]+.22))+ease.io(prog(t,PT[4],PT[4]+.22));
  tabLine.style.left=f*192+'px';
  const act=Math.round(f);tabEls.forEach((e,i)=>e.style.color=(i==act)?'#0b2350':'#8793aa');
  // panels
  panels.forEach((p,i)=>{
    const s=PT[i],e=PT[i+1];
    const show=t>=s&&t<e+.25;vis(p,show);if(!show)return;
    const pin=ease.out(prog(t,s,s+.25)),pout=(i<4)?ease.in(prog(t,e,e+.2)):0;
    p.style.opacity=(i==0?1:pin)*(1-pout);p.style.transform=`translateX(${(1-pin)*(i==0?0:60)+(-60*pout)}px)`;
  });
  // email
  {
    const c0=ease.back(prog(t,13.42,13.6)),c2=ease.back(prog(t,14.22,14.4));
    erows[0].lab.style.display=t>=13.42?'inline-block':'none';erows[0].lab.style.transform=`scale(${c0})`;
    erows[0].dr.style.display=t>=13.95?'inline-block':'none';erows[0].dr.style.transform=`scale(${ease.back(prog(t,13.95,14.15))})`;
    erows[2].lab.style.display=t>=14.22?'inline-block':'none';erows[2].lab.style.transform=`scale(${c2})`;
    erows[0].ud.style.opacity=t<13.42?1:0;erows[2].ud.style.opacity=t<14.22?1:0;
    const dg=ease.io(prog(t,13.62,13.98));
    const r1=erows[1].d;r1.style.transform=`translate(${lerp(0,-478,dg)}px,${lerp(0,38,dg)}px) scale(${lerp(1,.35,dg)})`;
    r1.style.opacity=t<13.62?1:(1-prog(t,13.9,13.99));r1.style.zIndex=t>13.6?20:1;
    const sh=ease.io(prog(t,13.98,14.22));
    erows.forEach((r,i)=>{if(i>=2)r.d.style.top=(14+i*96-96*sh)+'px'});
    const cnt=Math.round(lerp(128,61,ease.io(prog(t,13.42,14.35))));
    sideEls[0].b.textContent=cnt;sideEls[1].b.textContent=t>=13.42?13:12;sideEls[2].b.textContent=t>=13.98?4:3;
    sideEls[2].d.style.background=(t>=13.9&&t<14.5)?'#fff3d4':'transparent';
  }
  // calendar
  setDay(day4,i=>{
    const ap=prog(t,PT[1]-.05+i*.03,PT[1]+.2+i*.03);
    const mv=[0,ease.io(prog(t,14.62,14.95)),ease.io(prog(t,15.03,15.3)),0,ease.io(prog(t,15.4,15.62)),ease.io(prog(t,15.37,15.62)),0][i];
    const amv=i==0?ease.io(prog(t,14.8,14.95)):mv;
    return {ap,mv:amv};
  });
  toast.style.opacity=ease.out(prog(t,15.5,15.7))*(1-prog(t,15.78,15.85));
  // docs
  {
    const n=Math.floor(DOCTXT.length*prog(t,15.95,16.62));
    const typing=t<16.7;docp.textContent=DOCTXT.slice(0,n);if(typing)docp.appendChild(caret);
    caret.style.opacity=(Math.floor(t*6)%2)?0:1;
    trows.forEach((r,i)=>{const q=ease.out(prog(t,16.45+i*.17,16.65+i*.17));r.style.opacity=q;r.style.transform=`translateY(${(1-q)*16}px)`});
  }
  // research
  {
    notes.forEach((nt,i)=>{
      const t0=17.27+i*.1,q=ease.io(prog(t,t0,t0+.26));
      const sx=NOTES[i][0]+120,sy=NOTES[i][1]+35;
      const tx=120+120+(i%2)*0+ (i==0?0:0),ty=24+96+i*66+28;
      nt.style.transform=`translate(${lerp(sx,tx+100,q)-120}px,${lerp(sy,ty,q)-35}px) scale(${lerp(1,.9,q)}) rotate(${lerp((i-1.5)*5,0,q)}deg)`;
      nt.style.opacity=(t<17.25?0:1)*(1-prog(t,t0+.22,t0+.3));
      const rq=ease.out(prog(t,t0+.2,t0+.36));rrows[i].style.opacity=rq;rrows[i].style.transform=`translateX(${(1-rq)*30}px)`;
    });
    shared.style.opacity=ease.out(prog(t,17.78,17.92));
  }
  // follow-ups
  furows.forEach((r,i)=>{
    const ap=ease.out(prog(t,18.15+i*.05,18.35+i*.05));r.d.style.opacity=ap;r.d.style.transform=`translateY(${(1-ap)*20}px)`;
    const done=i<2?t>=FUT[i]:false,sched=i>=2?t>=FUT[i]:false;
    if(done){r.cb.style.background='#2fa36b';r.cb.style.borderColor='#2fa36b';r.cb.textContent='✓';r.st.textContent='SENT';r.st.style.background='#e1f6ea';r.st.style.color='#1b7a4c'}
    else if(sched){r.cb.style.background='#fff';r.cb.style.borderColor='#c3cde0';r.cb.textContent='';r.st.textContent='SCHEDULED';r.st.style.background='#fff3d4';r.st.style.color='#8a6414'}
    else{r.cb.style.background='#fff';r.cb.style.borderColor='#c3cde0';r.cb.textContent='';r.st.textContent='DUE';r.st.style.background='#fde8e6';r.st.style.color='#d03a33'}
  });
  // cursor
  const cv=t>=13.05&&t<19.05;vis(cur,cv);
  if(cv){const p=curAt(t);cur.style.transform=`translate(${p[0]-4}px,${p[1]-3}px)`;cur.style.opacity=prog(t,13.05,13.25)*(1-prog(t,18.9,19.05))}
  rings.forEach(r=>{const q=prog(t,r.tc,r.tc+.38);r.e.style.opacity=(q>0&&q<1)?(1-q)*.9:0;r.e.style.transform=`scale(${.3+1.3*ease.out(q)})`});
  // texts
  SVC.forEach((s,i)=>{const e=i<3?SVC[i+1][0]:19.0;textShow(TSV[i],t,s[0]+.0,e,{dur:.45,exit:.2,exitY:-30})});
  T4.forEach((T,i)=>textShow(T,t,T4t[i][0],T4t[i][1],{dur:.55,ls:.1,exit:.25,exitY:-40}));
  $('scrimTop').style.opacity=0;vis($('scrimTop'),false);
}

/* =====================================================================
   SCENE 5 — FLEXIBILITY (19–22s): a support plan built around the business
   ===================================================================== */
const r5=$('r5');
const planWrap=el('div','',r5,'','position:absolute;left:70px;top:248px;width:940px;height:640px');
const plan=el('div','card',planWrap,'','left:0;top:0;width:940px;height:640px;background:#f7f9fd;border-radius:34px');
el('div','',plan,'YOUR SUPPORT PLAN','position:absolute;left:40px;top:26px;font:800 20px Inter;letter-spacing:.2em;color:#b8861f');
el('div','',plan,'Choose what to hand off.','position:absolute;left:40px;top:56px;font:900 38px "Inter Display";color:#0b2350;letter-spacing:-.01em');
const SVCROWS=[['Email management',1,19.62],['Calendar coordination',1,19.84],['Admin support',1,20.06],['Research & documentation',0,0],['Reports & spreadsheets',1,20.3],['Social media assistance',0,0]];
const prow=SVCROWS.map((s,i)=>{
  const d=el('div','',plan,`<i class="dot" style="position:absolute;left:24px;top:30px;width:16px;height:16px;border-radius:8px;background:${CATS[[0,1,5,3,2,4][i]].c}"></i><span style="position:absolute;left:62px;line-height:76px;font:800 29px Inter;color:#13224a">${s[0]}</span><div class="trk" style="position:absolute;right:26px;top:10px;width:104px;height:56px;border-radius:28px;background:#cbd3e1"><div class="thm" style="position:absolute;left:4px;top:4px;width:48px;height:48px;border-radius:24px;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.25)"></div></div>`,`position:absolute;left:24px;top:${124+i*84}px;width:892px;height:76px;border-radius:20px;background:transparent`);
  if(s[1])ev(s[2],'toggle',.8);
  return {d,trk:d.querySelector('.trk'),thm:d.querySelector('.thm'),on:s[1],t:s[2]}});
const focusLab=el('div','',r5,'YOUR FOCUS','position:absolute;left:70px;top:916px;font:800 21px Inter;letter-spacing:.24em;color:#e0b24f;opacity:0');
const chips5=['STRATEGY','KEY CLIENTS','GROWTH'].map((n,i)=>el('div','',r5,n,`position:absolute;top:956px;height:70px;line-height:66px;padding:0 30px;border-radius:35px;border:2.5px solid #e8bd55;background:rgba(232,189,85,.14);color:#fff;font:800 27px Inter;letter-spacing:.05em;opacity:0;box-shadow:0 0 40px rgba(232,189,85,.35)`));
chips5[0].style.left='70px';chips5[1].style.left='344px';chips5[2].style.left='690px';
const T5a=mkText('T5a',[{t:'SUPPORT THAT',size:112},{t:'FITS YOUR',size:112},{t:'NEEDS.',size:112}],{top:1068,mode:'mask'});
const T5b=mkText('T5b',[{t:'FOCUS ON WHAT',size:112,gold:1},{t:'MATTERS',size:112,gold:1},{t:'MOST.',size:112,gold:1}],{top:1068,mode:'mask'});
ev(19.2,'hit',.5);ev(20.88,'hit',.7);ev(20.9,'chime',.5);

function s5(t){
  const on=t>=18.9&&t<22.6;vis($('g5'),on);
  if(!on){vis(T5a.root,false);vis(T5b.root,false);return}
  const en=ease.out4(prog(t,18.95,19.6));
  $('r5').style.transform=T3(0,lerp(380,0,en),lerp(-300,0,en),lerp(30,0,en),0,0);
  $('g5').style.opacity=clamp(prog(t,18.95,19.25));
  planWrap.style.transform=`translateY(${Math.sin(t*2)*4}px)`;
  const dim=ease.out(prog(t,20.65,20.95));
  prow.forEach(r=>{
    const q=r.on?ease.io(prog(t,r.t,r.t+.2)):0;
    r.trk.style.background=`rgb(${lerp(203,224,q)},${lerp(211,178,q)},${lerp(225,79,q)})`;
    r.thm.style.left=lerp(4,52,q)+'px';
    r.d.style.background=r.on?`rgba(255,243,212,${q})`:'transparent';
    r.d.style.opacity=r.on?1:lerp(1,.45,dim);
  });
  focusLab.style.opacity=ease.out(prog(t,20.85,21.05));
  chips5.forEach((c,i)=>{const q=ease.back(prog(t,20.9+i*.1,21.15+i*.1));c.style.opacity=clamp(q*2);c.style.transform=`scale(${.7+.3*q}) translateY(${(1-q)*20}px)`});
  textShow(T5a,t,19.35,20.86,{dur:.55,ls:.1,exit:.2,exitY:-30});
  textShow(T5b,t,20.9,22.5,{dur:.55,ls:.1,exit:.05,exitY:0});
}

/* =====================================================================
   SCENE 6 — BRAND FINALE (22–25s)
   ===================================================================== */
const g6=$('g6');
el('div','',g6,'','position:absolute;inset:0;background:radial-gradient(900px 800px at 50% 28%,rgba(232,189,85,.22),transparent 60%),radial-gradient(1100px 900px at 50% 100%,rgba(61,111,209,.35),transparent 60%),linear-gradient(180deg,#040e26,#0a1f48 60%,#07173a)');
const bloom=el('div','',g6,'','position:absolute;left:90px;top:330px;width:900px;height:420px;background:radial-gradient(ellipse at 50% 50%,rgba(240,200,100,.45),transparent 65%);opacity:0');
const lineT=el('div','',g6,'','position:absolute;left:0;top:300px;width:1080px;height:2px;background:linear-gradient(90deg,transparent,rgba(232,189,85,.8),transparent);opacity:0');
const lineB=el('div','',g6,'','position:absolute;left:0;top:1480px;width:1080px;height:2px;background:linear-gradient(90deg,transparent,rgba(232,189,85,.5),transparent);opacity:0');
const tagline=el('div','',g6,'REMOTE BUSINESS SUPPORT','position:absolute;left:0;top:650px;width:1080px;text-align:center;font:700 25px Inter;letter-spacing:.42em;color:#a9bbdb;opacity:0');
const rule=el('div','',g6,'','position:absolute;left:290px;top:618px;width:500px;height:5px;border-radius:3px;background:linear-gradient(90deg,#b98529,#f6d98a,#b98529);transform:scaleX(0)');
function mkTextIn(parent,id,lines,opt){const T=mkText(id,lines,opt);parent.appendChild(T.root);return T}
const T6w=mkTextIn(g6,'T6w',[{t:'PROVIRTUAL PH',size:122,maxW:940}],{top:420,shadow:false});
T6w.L[0].chars.slice(-2).forEach(c=>{c.classList.add('gold');c.style.color=''});
const T6h=mkTextIn(g6,'T6h',[{t:'READY FOR',size:112},{t:'EXTRA',size:196,gold:1,mt:-4},{t:'SUPPORT?',size:196,gold:1,mt:-14}],{top:760,shadow:false});
const cta=el('div','',g6,'<span id="ctaTxt">DM “VA” TO GET STARTED.</span><div id="ctaShine" style="position:absolute;top:0;left:-200px;width:140px;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.75),transparent);transform:skewX(-20deg)"></div>','position:absolute;left:90px;top:1240px;width:900px;height:150px;border-radius:75px;background:linear-gradient(180deg,#f9e3a0,#e3b04a 55%,#b98529);display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 20px 60px rgba(232,189,85,.35),0 0 0 2px rgba(255,255,255,.25) inset;opacity:0');
const ctaTxt=cta.querySelector('#ctaTxt');ctaTxt.style.cssText='font:900 54px "Inter Display";color:#0b2350;letter-spacing:.01em;white-space:nowrap';
{const w=ctaTxt.getBoundingClientRect().width;vis(g6,true);const w2=ctaTxt.getBoundingClientRect().width;if(w2>820)ctaTxt.style.fontSize=54*820/w2+'px';vis(g6,false)}
ev(21.82,'whoosh',1);ev(22.14,'boom',1);ev(22.2,'shimmer',.8);ev(22.72,'hit',.9);ev(23.0,'chime',1);ev(23.02,'pop',.8);ev(23.4,'sparkle',.8);

function s6(t){
  const wp=prog(t,21.85,22.5),wl=-520+2000*wp; // wipe bar leading position
  const wipeOn=wp>0&&wp<1;vis($('wipe'),wipeOn);
  if(wipeOn){$('wipe').style.transform=`translateX(${wl}px) skewX(-18deg)`}
  // g6 clip follows the trailing edge of the bar
  const xl=wl; // bar left edge at y=960
  const on=t>=21.85;vis(g6,on);
  if(!on){vis(T6w.root,false);vis(T6h.root,false);return}
  if(t<22.5){const a=xl+312,b=xl-312;g6.style.clipPath=`polygon(0 0,${a}px 0,${b}px 1920px,0 1920px)`}else g6.style.clipPath='none';
  vis(T6w.root,true);vis(T6h.root,true);
  const push=1+.03*prog(t,22.2,25);
  g6.style.transform=`scale(${push})`;
  textIn(T6w,t,22.16,{dur:.5,stag:.035,y:120,s:.25,b:14});
  const bl=prog(t,22.15,22.7);bloom.style.opacity=(bl>0?Math.sin(Math.PI*Math.min(1,bl))*.9+.1*prog(t,22.7,23.5):0);
  lineT.style.opacity=ease.out(prog(t,22.3,22.8));lineB.style.opacity=ease.out(prog(t,22.3,22.8));
  rule.style.transform=`scaleX(${ease.out4(prog(t,22.5,23.0))})`;
  tagline.style.opacity=ease.out(prog(t,22.7,23.1));tagline.style.transform=`translateY(${(1-ease.out(prog(t,22.7,23.1)))*14}px)`;
  textIn(T6h,t,22.72,{dur:.5,stag:.04,ls:.13,y:110,s:.45,b:20});
  const q=ease.back(prog(t,23.0,23.4));cta.style.opacity=clamp(q*2);
  const pulse=1+.012*Math.sin(Math.max(0,t-23.5)*5);
  cta.style.transform=`scale(${(.78+.22*q)*pulse})`;
  $('ctaShine').style.left=lerp(-200,1000,ease.io(prog(t,23.35,23.95)))+'px';
}

/* ---------- global ---------- */
{const c=$('noise'),x=c.getContext('2d'),im=x.createImageData(1080,1920),r=rng(99);
 for(let i=0;i<im.data.length;i+=4){const v=r()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}
 x.putImageData(im,0,0)}
window.render=function(t){
  $('flash').style.opacity=0;$('vig').style.opacity=0;vis($('scan'),false);
  s1(t);sA(t);s4(t);s5(t);s6(t);
  const wm=$('wm'),w=(t>=8.5&&t<21.9);vis(wm,w);
  if(w)wm.style.opacity=.7*prog(t,8.5,9.2)*(1-prog(t,21.7,21.9));
  $('bg').style.backgroundPosition=`${Math.sin(t*.4)*30}px ${Math.cos(t*.3)*30}px`;
};
window.ready=true;
