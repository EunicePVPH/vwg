/* ProVirtual PH — Reel 06 · Lead Generation & Prospect Research
   Deterministic motion-graphics scene: window.renderFrame(t) draws the exact frame for time t (seconds).
   All company names / data are FICTIONAL demo data. No real people, no stock footage, no logo artwork. */
(function(){
'use strict';
const CUE = window.CUES;
const W=1080, H=1920, PERSP=1400;

/* ------------------------------------------------------------------ utils */
const clamp=(x,a=0,b=1)=>x<a?a:x>b?b:x;
const lerp=(a,b,t)=>a+(b-a)*t;
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const smooth=x=>x*x*(3-2*x);
const E={
  outCubic:x=>1-Math.pow(1-x,3), inCubic:x=>x*x*x,
  inOutCubic:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,
  outExpo:x=>x>=1?1:1-Math.pow(2,-10*x), outQuint:x=>1-Math.pow(1-x,5),
  outBack:x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)},
  inOutSine:x=>-(Math.cos(Math.PI*x)-1)/2
};
const pulse=(t,t0,k)=>t<t0?0:Math.exp(-(t-t0)*k);
const gauss=(t,t0,s)=>Math.exp(-Math.pow((t-t0)/s,2));
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const $=id=>document.getElementById(id);
const world=$('world'), ov=$('ov'), bgx=$('bg').getContext('2d'), fx=$('fxc').getContext('2d'), grainC=$('grain'), gx=grainC.getContext('2d');
function mk(cls,parent,html,w,h){const e=document.createElement('div');if(cls)e.className=cls;if(html!=null)e.innerHTML=html;
  if(w){e.style.width=w+'px';e.style.left=(-w/2)+'px'} if(h){e.style.height=h+'px';e.style.top=(-h/2)+'px'} (parent||ov).appendChild(e);return e}
function T3(e,o){
  let s='translate3d('+(o.x||0)+'px,'+(o.y||0)+'px,'+(o.z||0)+'px)';
  if(o.rx)s+=' rotateX('+o.rx+'deg)'; if(o.ry)s+=' rotateY('+o.ry+'deg)'; if(o.rz)s+=' rotateZ('+o.rz+'deg)';
  const sx=o.sx!=null?o.sx:(o.s!=null?o.s:1), sy=o.sy!=null?o.sy:(o.s!=null?o.s:1);
  if(sx!==1||sy!==1)s+=' scale('+sx+','+sy+')';
  e.style.transform=s;
}
const show=(e,v)=>{const d=v?'block':'none'; if(e._d!==d){e.style.display=d;e._d=d}};
const fmt=n=>Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
const AUDIO={ding:[],dismiss:[],rowPop:[],qualFlip:[],prepFlip:[],typeKeys:[],noteKeys:[]};

/* --------------------------------------------------------- time warp tables */
const DT=1/240, NT=Math.round(26/DT);
const Qtab=[], Gtab=[]; {
  let a=0,g=0;
  const sp=t=>{ if(t<CUE.s2) return 0; if(t<6.7) return 1; return lerp(1,0.035,smooth(prog(t,6.7,7.35))) };
  const gs=t=>{ if(t<CUE.s2) return .8; if(t<6.7) return 2.6; if(t<7.35) return lerp(2.6,.14,smooth(prog(t,6.7,7.35)));
    if(t<13) return .16; if(t<18) return .34; if(t<22) return .62; return .22 };
  for(let i=0;i<=NT;i++){const t=i*DT;Qtab.push(a);Gtab.push(g);a+=sp(t)*DT;g+=gs(t)*DT}
}
const Qnorm=Qtab[Math.round(7.4/DT)];
const Q=t=>Qtab[Math.min(NT,Math.max(0,Math.round(t/DT)))]/Qnorm;
const Gp=t=>Gtab[Math.min(NT,Math.max(0,Math.round(t/DT)))];

/* ------------------------------------------------------------------- data */
const TILE={Roofing:'#C58F2E',HVAC:'#2F6BD6',Plumbing:'#2A86A6',other:'#4E6192'};
const QUAL=[
 {n:'Summit Ridge Roofing',ind:'Roofing',loc:'Austin, TX',note:'Residential + light commercial · 2 crews'},
 {n:'Cobalt Peak HVAC',ind:'HVAC',loc:'Round Rock, TX',note:'Family-owned · serves the north metro'},
 {n:'Cedar Line Plumbing',ind:'Plumbing',loc:'Cedar Park, TX',note:'Growing team · service area match'},
 {n:'Oakline Roofing Co.',ind:'Roofing',loc:'Georgetown, TX',note:'Storm-repair focus · local reviews'},
 {n:'Brightair HVAC',ind:'HVAC',loc:'Pflugerville, TX',note:'Seasonal demand · 10–25 staff'},
 {n:'Clearwater Plumbing',ind:'Plumbing',loc:'San Marcos, TX',note:'Residential focus · expanding'}
];
const OTHER=[
 ['Lumen Bay Studio','Photography','Seattle, WA'],['Maple & Finch Law','Legal','Boston, MA'],['Pixel Orchard Games','Gaming','Los Angeles, CA'],
 ['Vantage Freight Co.','Logistics','Chicago, IL'],['Silverline Biotech','Biotech','San Diego, CA'],['Northgate Capital','Finance','Charlotte, NC'],
 ['Tidewater Seafood','Food','Portland, ME'],['Driftwood Coffee','Café','Nashville, TN'],['Ironclad Fitness','Fitness','Phoenix, AZ'],['Foxglove Florist','Retail','Denver, CO']
].map(a=>({n:a[0],ind:a[1],loc:a[2]}));
const OUTAREA=[
 ['Granite State HVAC','HVAC','Manchester, NH'],['Peachtree Roofing','Roofing','Atlanta, GA'],['Lakeshore Plumbing','Plumbing','Cleveland, OH'],
 ['Rocky Pass Roofing','Roofing','Denver, CO'],['Bayou Air & Heat','HVAC','Baton Rouge, LA'],['Evergreen Plumbing','Plumbing','Seattle, WA']
].map(a=>({n:a[0],ind:a[1],loc:a[2]}));
const MISMATCH=[
 ['Titan Roofing Group','Roofing','Austin, TX'],['Metro Air Systems','HVAC','Austin, TX'],['Solo Handyman','Handyman','Austin, TX'],['National Pipe & Drain','Plumbing','Austin, TX']
].map(a=>({n:a[0],ind:a[1],loc:a[2]}));
const BTITLES=['Top 25 Home Service Companies — Page 4','Business Directory: Contractors by State','Local Services Near You (Sponsored)','50 Fastest-Growing Companies List','Company Profiles A–Z — Page 112','Industry Report: Trades & Services','Find Businesses by Category','Review Aggregator: Top Rated'];
const CNOTES=['Is this a fit?','Check company size','Duplicate record?','Call back… maybe?','Which region?','Need the decision-maker'];
const DCHIPS=['Industry: ???','Region: Southwest','Employees: 11–50','Revenue: unknown','Category: Trades','Status: unsorted','Tag: maybe','Needs review'];
const ROW_ORDER=[1,2,0,4,3,5];      // unsorted order shown in CRM (indexes into QUAL)
const SORT_ORDER=[0,3,1,4,2,5];     // grouped: Roofing, HVAC, Plumbing
const SW=[null,
  {a:CUE.sweep1[0],b:CUE.sweep1[1],dir:1,tag:'Different industry'},
  {a:CUE.sweep2[0],b:CUE.sweep2[1],dir:-1,tag:'Outside service area'},
  {a:CUE.sweep3[0],b:CUE.sweep3[1],dir:1,tag:'Size mismatch'}];
const SWY0=300, SWY1=1560;
const SLOT=[ [-250,0],[250,0],[-250,1],[250,1],[-250,2],[250,2] ];   // slot k holds QUAL[ROW_ORDER[k]]
const slotXY=k=>({x:SLOT[k][0], y:(985+SLOT[k][1]*205)-960});
const ROW_TOP0=540+176;  // screen y of rows container top inside CRM window
const rowCenterWorldY=(yIn)=>ROW_TOP0+yIn+56-960;

/* ---------------------------------------------------------- caption maker */
function makeCap(spec){
  const root=document.createElement('div'); root.className='cap'; ov.appendChild(root);
  const lines=spec.lines.map(L=>{
    const cl=document.createElement('div'); cl.className='cl'; const ci=document.createElement('span'); ci.className='ci'+(L.gold?' gold':'');
    ci.textContent=L.t; cl.appendChild(ci); root.appendChild(cl); return {cl,ci,L};
  });
  lines.forEach(o=>{o.ci.style.fontSize='100px'; o.w100=o.ci.getBoundingClientRect().width});
  const maxW=spec.maxW||940;
  let uni=Infinity; lines.forEach(o=>{uni=Math.min(uni,100*maxW/o.w100)});
  let totalH=0;
  lines.forEach(o=>{
    let s=spec.uniform?Math.min(uni,spec.maxSize||999):Math.min(100*maxW/o.w100,o.L.max||spec.maxSize||999);
    o.size=s; o.ci.style.fontSize=s+'px'; o.cl.style.fontSize=s+'px'; totalH+=s*0.98+s*0.12;
    o.cl.style.marginTop=(spec.gap||0)+'px';
  });
  root.style.top=(spec.y-totalH/2)+'px'; root.style.height=totalH+'px'; root.dataset.h=totalH;
  if(spec.glow) root.classList.add('glowg');
  return {root,lines,spec,h:totalH};
}
function capAnim(cap,t,tin,tout,o){
  o=o||{}; const vis=t>=tin-0.001&&t<=tout+0.75;
  cap.root.style.opacity=vis?1:0; if(!vis) return;
  cap.lines.forEach((L,k)=>{
    const a=tin+k*(o.stag||0.1), p=E.outExpo(prog(t,a,a+(o.dur||0.62))), q=E.inCubic(prog(t,tout+k*0.05,tout+0.42));
    const y=(1-p)*120-q*120, sk=(1-p)*(o.skew!=null?o.skew:6);
    L.ci.style.transform='translateY('+y+'%) skewY('+sk+'deg)';
    const gl=o.glitch&&p>.05&&p<.9; if(L.ci._g!==gl){L.ci.classList.toggle('glitch',gl);L.ci._g=gl}
  });
}
function shineLine(ci,pos){
  ci.style.backgroundImage='linear-gradient(100deg,rgba(255,255,255,0) 38%,rgba(255,255,255,.95) 50%,rgba(255,255,255,0) 62%),linear-gradient(180deg,#FFF1BF 0%,#F2CB63 36%,#D9A93E 62%,#A77A1F 100%)';
  ci.style.backgroundSize='260% 100%,100% 100%'; ci.style.backgroundRepeat='no-repeat'; ci.style.backgroundPosition=pos+'% 0,0 0';
}

/* ------------------------------------------------------------ build scene */
const S={};   // scene objects
let cards=[];
function build(){
  /* ---- captions ---- */
  S.hookW=makeCap({lines:[{t:'GREAT'},{t:'SERVICES.'}],y:960,maxW:900,gap:0});
  S.hookG=makeCap({lines:[{t:'NOT ENOUGH',gold:true},{t:'PROSPECTS?',gold:true}],y:980,maxW:900,uniform:true,glow:true});
  [S.hookW,S.hookG].forEach(c=>c.lines.forEach(L=>L.cl.style.overflow='visible'));
  S.cap2a=makeCap({lines:[{t:'TOO MUCH'},{t:'SEARCHING.'}],y:960,maxW:940,uniform:false});
  S.cap2b=makeCap({lines:[{t:'NOT ENOUGH'},{t:'DIRECTION.',gold:true}],y:960,maxW:940,glow:true});
  S.cap3a=makeCap({lines:[{t:'FOCUSED'},{t:'RESEARCH.',gold:true}],y:402,maxW:940,uniform:true,maxSize:118,glow:true});
  S.cap3b=makeCap({lines:[{t:'MORE RELEVANT'},{t:'PROSPECTS.',gold:true}],y:402,maxW:940,uniform:true,maxSize:118,glow:true});
  S.cap4=makeCap({lines:[{t:'FROM RESEARCH'},{t:'TO READINESS.',gold:true}],y:402,maxW:940,uniform:true,maxSize:118,glow:true});
  S.cap6=makeCap({lines:[{t:'FIND',max:200},{t:'BETTER-FIT',gold:true},{t:'PROSPECTS.'}],y:470,maxW:900,glow:true});
  S.cap6.lines.forEach(L=>L.cl.style.overflow='visible');

  /* ---- hud (S2) ---- */
  S.hud=mk('',ov,'<div class="hudchip" id="h1" style="left:0"><small>TABS OPEN</small><span id="h1v">27</span></div><div class="hudchip" id="h2" style="left:330px"><small id="h2l">RESULTS</small><span id="h2v">48,213</span></div>');
  S.hud.id='hud2'; S.hud.style.cssText='position:absolute;left:60px;top:292px;width:960px;height:64px;opacity:0';
  S.h1v=$('h1v'); S.h2v=$('h2v'); S.h2l=$('h2l'); S.h2=$('h2');
  S.foot=mk('',ov,'Illustrative sample data · all companies shown are fictional'); S.foot.id='foot';

  /* ---- window 1 : crowded search ---- */
  const rrs=[]; for(let i=0;i<8;i++){const j=i%BTITLES.length; rrs.push('<div class="rr"><div class="fv"></div><div class="rt">'+BTITLES[j]+'</div><div class="ru">bizlistings.example › services › page '+(i*7+3)+'</div><div class="rl"></div><div class="rl"></div></div>')}
  const silhouette='<svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="25" r="11" fill="#9fb4e6"/><path d="M10 64c0-14 10-22 22-22s22 8 22 22z" fill="#9fb4e6"/></svg>';
  S.win1=mk('win',world,
   '<div class="tabs"><span class="tab on">Search</span><span class="tab">Directory</span><span class="tab">Maps</span><span class="tab">Notes</span><span class="tab">List</span><span class="tab">+22</span></div>'+
   '<div class="addr"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#8EA0C4" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/></svg><span class="typed" id="w1t"></span><i class="caret" id="w1c"></i></div>'+
   '<div class="owner"><div class="av">'+silhouette+'</div><div><b>BUSINESS OWNER</b><small id="w1s">searching…</small></div><div class="stats"><span id="w1a">TABS 9</span><span id="w1b">RESULTS 120</span></div></div>'+
   '<div class="res"><div id="w1r">'+rrs.join('')+rrs.join('')+'</div></div>',900,1000);
  S.win1.id='win1'; S.w1t=$('w1t'); S.w1c=$('w1c'); S.w1s=$('w1s'); S.w1a=$('w1a'); S.w1b=$('w1b'); S.w1r=$('w1r');

  /* ---- swarm cards ---- */
  const rng=mulberry32(20261031);
  const items=[];
  QUAL.forEach((d,i)=>items.push({type:'a',d,fate:0,qi:i}));
  OTHER.forEach(d=>items.push({type:'a',d,fate:1}));
  OUTAREA.forEach(d=>items.push({type:'a',d,fate:2}));
  MISMATCH.forEach(d=>items.push({type:'a',d,fate:3}));
  for(let i=0;i<8;i++)items.push({type:'b',d:BTITLES[i],fate:1});
  for(let i=0;i<6;i++)items.push({type:'c',d:CNOTES[i],fate:1});
  for(let i=0;i<8;i++)items.push({type:'d',d:DCHIPS[i],fate:1});
  for(let i=0;i<6;i++)items.push({type:'f',d:null,fate:1});
  // qualified card field positions (kept clear of the UI band that appears in scene 3)
  const QPOS=[[-300,40,-120],[310,150,-60],[-310,360,-200],[300,430,-40],[-110,640,-150],[250,760,-90]];
  const cells=[]; const cols=6, rows=9;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const cx=-560+(c+.5)*(1120/cols)+(rng()-.5)*1120/cols*.8, cy=-930+(r+.5)*(1860/rows)+(rng()-.5)*1860/rows*.8;
    cells.push({x:cx,y:cy});
  }
  // drop the 6 cells nearest to the qualified positions
  QPOS.forEach(p=>{let bi=0,bd=1e9;cells.forEach((c,i)=>{const d=(c.x-p[0])**2+(c.y-p[1])**2;if(d<bd){bd=d;bi=i}});cells.splice(bi,1)});
  // shuffle non-qualified
  const nq=items.filter(i=>i.fate!==0); for(let i=nq.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[nq[i],nq[j]]=[nq[j],nq[i]]}
  for(let i=cells.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]]}
  nq.forEach((it,i)=>{it.x1=cells[i].x*1.22;it.y1=cells[i].y*1.1;it.z1=-900+rng()*1000});
  items.filter(i=>i.fate===0).forEach(it=>{const p=QPOS[it.qi];it.x1=p[0];it.y1=p[1];it.z1=p[2]});
  cards=items;
  const DIM={a:[460,190],b:[500,172],c:[300,150],d:[300,66],f:[560,74]};
  cards.forEach((c,idx)=>{
    const dm=DIM[c.type]; let html='';
    if(c.type==='a'){const col=TILE[c.d.ind]||TILE.other;
      html='<div class="tile" style="background:linear-gradient(160deg,'+col+',#0d1d45)">'+c.d.n[0]+'</div><div class="meta"><div class="nm">'+c.d.n.replace('&','&amp;')+'</div><div class="sub">'+c.d.ind+' · '+c.d.loc+'</div></div><div class="bars"><i style="width:84%"></i><i style="width:56%"></i></div><div class="tag">✕ '+(SW[c.fate]?SW[c.fate].tag:'')+'</div><div class="chk">✓</div>';
    } else if(c.type==='b'){html='<div class="fav"></div><div class="t">'+c.d+'</div><div class="u">bizlistings.example › results</div><div class="bars"><i style="width:90%"></i><i style="width:60%"></i></div>';}
    else if(c.type==='c'){html='<div class="pin"></div><div class="tx">'+c.d+'</div>';}
    else if(c.type==='d'){html=c.d;}
    else {html='<div class="box"></div><i style="top:18px;width:300px"></i><i style="top:42px;width:190px"></i><div class="q">?</div>';}
    c.el=mk('card '+c.type,world,html,dm[0],dm[1]); c.w=dm[0]; c.h=dm[1];
    if(c.type==='a'){c.tagEl=c.el.querySelector('.tag'); c.chkEl=c.el.querySelector('.chk')}
    c.ph=rng()*6.28; c.delay=rng()*0.32; c.span=(750+rng()*650);
    c.rx=(rng()-.5)*44; c.ry=(rng()-.5)*58; c.rz=(rng()-.5)*30;
    c.ox=(rng()-.5)*120; c.oy=370+(rng()-.5)*120;
    c.dx=(rng()-.5)*500;
    // scene-3 timings (based on projected screen y once the field has frozen)
    const ys=960+c.y1*PERSP/(PERSP-c.z1); const f=clamp((ys-SWY0)/(SWY1-SWY0));
    const pass=n=>{const s=SW[n]; return s.a+(s.b-s.a)*(s.dir>0?f:1-f)};
    c.tPass1=pass(1); c.tPass2=pass(2); c.tPass3=pass(3);
    if(c.fate>0){ c.tPass=c['tPass'+c.fate]; c.tOut=c.tPass+0.16; AUDIO.dismiss.push(+c.tOut.toFixed(3)); }
    if(c.fate===0){ c.slot=ROW_ORDER.indexOf(c.qi); c.tGrid=CUE.gridIn+c.slot*0.075; AUDIO.ding.push(+c.tPass3.toFixed(3)); }
  });
  AUDIO.ding.sort((a,b)=>a-b); AUDIO.dismiss.sort((a,b)=>a-b);

  /* ---- ICP + stepper (overlay, scene 3) ---- */
  S.icp=mk('glass',ov,'<div class="hd">Ideal customer profile · sample criteria</div>'); S.icp.id='icp';
  const CH=[['Industry','Home services',28,62,296,SW[1].a,SW[1].b],['Service area','Austin metro',336,62,296,SW[2].a,SW[2].b],['Company size','10–50 staff',644,62,288,SW[3].a,lerp(SW[3].a,SW[3].b,.5)],
            ['Business need','Fits your service',28,124,440,lerp(SW[3].a,SW[3].b,.5),SW[3].b],['Relevance','Strong match',484,124,448,SW[3].b,SW[3].b+.5]];
  S.chips=CH.map(c=>{const e=mk('chip',S.icp,'<span class="ck"></span><span class="tx2"><span class="lb">'+c[0]+'</span><span class="vl">'+c[1]+'</span></span>');e.style.left=c[2]+'px';e.style.top=c[3]+'px';e.style.width=c[4]+'px';return {e,a:c[5],b:c[6],ck:e.querySelector('.ck'),st:''}});
  S.stepper=mk('',ov,''); S.stepper.id='stepper'; S.stepper.style.cssText='position:absolute;left:60px;top:556px;width:960px;height:84px;opacity:0';
  const SP=[['IDENTIFY',0],['RESEARCH',330],['QUALIFY',660]];
  S.stp=SP.map((s,i)=>{const e=mk('stp',S.stepper,'<span class="n">0'+(i+1)+'</span><span class="l">'+s[0]+'</span>');e.style.left=s[1]+'px';return {e,st:''}});
  const arr='<svg viewBox="0 0 40 24" width="40" height="24" fill="none" stroke="#8EA0C4" stroke-width="3" stroke-linecap="round"><path d="M4 12h30M26 4l8 8-8 8"/></svg>';
  [[278],[608]].forEach(a=>{const e=mk('arrow',S.stepper,arr);e.style.left=a[0]+'px'});

  /* ---- CRM window (scene 4) ---- */
  S.crm=mk('win',world,
    '<div class="wbar"><span class="dots"><i></i><i></i><i></i></span><span class="wtitle">Prospect workspace · sample data</span></div>'+
    '<div class="trk" id="trk"></div><div class="rows" id="rows"></div><div class="sumbar" id="sumbar"></div>',960,1020);
  S.crm.id='crm';
  const trk=$('trk'), rowsEl=$('rows'); S.sumbar=$('sumbar');
  const TS=[['RESEARCH',0],['QUALIFICATION',262],['ORGANIZED<br>PROSPECT LIST',596]];
  S.ts=TS.map((s,i)=>{const e=mk('ts',trk,'<span class="n">'+(i+1)+'</span><span class="l">'+s[0]+'</span>');e.style.left=s[1]+'px';if(i===2)e.querySelector('.l').style.cssText='font-size:17px;line-height:1.1';return {e,st:''}});
  [[216],[552]].forEach(a=>{const e=mk('arrow',trk,arr);e.style.left=a[0]+'px';e.style.top='20px'});
  // rows
  S.rows=ROW_ORDER.map((qi,k)=>{
    const d=QUAL[qi], col=TILE[d.ind];
    const e=mk('row',rowsEl,'<div class="bar" style="background:'+col+'"></div><div class="l"><div class="nm">'+d.n+'</div><div class="sub">'+d.ind+' · '+d.loc+'</div><div class="note wait">Researching…</div></div><div class="r"><div class="pill">IN REVIEW</div><div class="pill">NOT STARTED</div></div>');
    const r={e,qi,k,d,note:e.querySelector('.note'),pq:e.querySelectorAll('.pill')[0],po:e.querySelectorAll('.pill')[1],
      sortIdx:SORT_ORDER.indexOf(qi), tq:CUE.qual+k*0.2, tn:CUE.notes+k*0.12, tIn:CUE.crmIn+0.12+k*0.07};
    r.yU=k*118; const g=Math.floor(r.sortIdx/2), rr=r.sortIdx%2; r.yS=g*(236+42)+42+rr*118; r.tS=CUE.sort+k*0.04;
    r.tpS=CUE.prep-0.7+r.sortIdx*0.12; r.tpR=CUE.prep+r.sortIdx*0.15;
    r.st={}; AUDIO.rowPop.push(+r.tIn.toFixed(3)); AUDIO.qualFlip.push(+r.tq.toFixed(3)); AUDIO.prepFlip.push(+r.tpR.toFixed(3));
    for(let c=0;c<Math.round(d.note.length/3);c++)AUDIO.noteKeys.push(+(r.tn+c*0.9/Math.round(d.note.length/3)).toFixed(3));
    return r;
  });
  S.gh=['ROOFING','HVAC','PLUMBING'].map((n,g)=>{const e=mk('gh',rowsEl,n);e.style.top='0px';e.style.transform='translateY('+(g*278)+'px)';e.style.opacity=0;return {e,g}});

  /* ---- stack panels (scene 5) ---- */
  S.stack=mk('',world,''); S.stack.style.cssText='position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d';
  const ico=(p)=>'<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0B1A3D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
  const PN=[
   ['LEAD RESEARCH','01',ico('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/>'),
     '<div class="mini"><div class="m"><b>●</b> Industry</div><div class="m"><b>●</b> Location</div><div class="m"><b>●</b> Company info</div></div><div class="mrow" style="margin-top:14px"><i style="width:340px"></i><i style="width:170px"></i><i style="width:90px"></i></div>'],
   ['PROSPECT QUALIFICATION','02',ico('<path d="M4 5h16l-6 8v6l-4-2v-4z"/>'),
     '<div class="mini"><div class="m"><b>✓</b> Industry</div><div class="m"><b>✓</b> Area</div><div class="m"><b>✓</b> Size</div><div class="m"><b>✓</b> Need</div></div><div class="mrow" style="margin-top:14px"><i style="width:600px;background:linear-gradient(90deg,rgba(217,169,62,.7),rgba(217,169,62,.1))"></i></div>'],
   ['CRM ORGANIZATION','03',ico('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M9.5 10v9.5"/>'),
     '<div class="mrow"><span class="dot" style="background:#C58F2E"></span><i style="width:230px"></i><i style="width:130px"></i><span class="mp">QUALIFIED</span></div><div class="mrow"><span class="dot" style="background:#2F6BD6"></span><i style="width:200px"></i><i style="width:160px"></i><span class="mp">QUALIFIED</span></div><div class="mrow"><span class="dot" style="background:#2A86A6"></span><i style="width:250px"></i><i style="width:110px"></i><span class="mp">QUALIFIED</span></div>'],
   ['OUTREACH PREPARATION','04',ico('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7.5l8.5 6 8.5-6"/>'),
     '<div class="cl2"><div><em>✓</em>Contact details organized</div><div><em>✓</em>Research notes attached</div><div><em>✓</em>Outreach plan prepared</div><div><em>✓</em>Ready for your review</div></div>']
  ];
  S.pn=PN.map((p,i)=>{
    const e=mk('pn',S.stack,'<div class="ph"><div class="ic">'+p[2]+'</div><div class="pt">'+p[0]+'</div><div class="st">'+p[1]+'</div></div><div class="pb">'+p[3]+'</div>',900,226);
    e.querySelector('.pt').style.fontSize='35px';
    return {e,i,y:-405+i*270,t:CUE.panels[i],side:i%2?1:-1};
  });
  S.conn=[0,1,2].map(i=>{const e=mk('conn',S.stack,'');e.style.left='0px';e.style.top=(-405+i*270+113+(270-226)/2-22)+'px';return e});

  /* ---- wordmark ---- */
  S.wm=document.createElement('div'); S.wm.id='wm'; ov.appendChild(S.wm);
  const wl=document.createElement('div'); wl.className='wl'; S.wm.appendChild(wl);
  const mkLetters=(txt,cls,gold)=>{const out=[];txt.split('').forEach(ch=>{const s=document.createElement('span');s.className='lt'+(gold?' gold':'');s.textContent=ch;wl.appendChild(s);out.push(s)});return out};
  S.wmL=[...mkLetters('PROVIRTUAL','w1',false)]; const sp=document.createElement('span');sp.className='sp';wl.appendChild(sp); S.wmL=S.wmL.concat(mkLetters('PH','w2',true));
  S.wmG=S.wmL.slice(10);
  wl.style.fontSize='100px'; const ww=wl.getBoundingClientRect().width; S.wmSize=Math.min(122,100*880/ww); wl.style.fontSize=S.wmSize+'px';
  S.wm.style.height=S.wmSize+'px';
  S.wmrule=document.createElement('div'); S.wmrule.id='wmrule'; ov.appendChild(S.wmrule);
  S.wmtag=document.createElement('div'); S.wmtag.id='wmtag'; S.wmtag.textContent='Lead generation & prospect research'; ov.appendChild(S.wmtag);
  S.cta=document.createElement('div'); S.cta.id='cta'; S.cta.innerHTML='<span>DM ‘LEADS’ TO GET STARTED.</span><div class="sh"></div>'; ov.appendChild(S.cta); S.ctaSh=S.cta.querySelector('.sh');
  S.cring=document.createElement('div'); S.cring.id='cring'; ov.appendChild(S.cring);
  S.fine=document.createElement('div'); S.fine.id='fine'; S.fine.textContent='Research & prospecting support · sample data shown is fictional'; ov.appendChild(S.fine);

  /* ---- bg particles / sparks ---- */
  const r2=mulberry32(77); S.dust=[]; for(let i=0;i<120;i++)S.dust.push({x:r2()*W,y:r2()*H,s:.8+r2()*3.4,v:8+r2()*34,a:.15+r2()*.55,ph:r2()*6.28,g:r2()<.6});
  const SPK=[[0.0,540,960,50],[CUE.goldReveal,540,980,40],[CUE.s2,540,1330,70],[CUE.s3,540,960,80],[CUE.converge,540,960,90],[CUE.s6,540,880,60]];
  S.sparks=SPK.map(s=>{const r=mulberry32(Math.round(s[0]*100)+5);const p=[];for(let i=0;i<s[3];i++)p.push({a:r()*6.283,v:300+r()*1100,l:.35+r()*.6,w:1+r()*2.6});return {t:s[0],x:s[1],y:s[2],p}});
}

/* --------------------------------------------------------------- bg canvas */
const MOOD=[[0,.8,.10,540,820],[2.9,.65,.12,540,900],[3.2,.38,.03,540,960],[6.9,.32,.02,540,960],[7.25,.5,.30,540,1250],[10,.55,.42,540,1100],[13,.58,.26,540,1000],[18,.68,.26,540,960],[21,.9,.38,540,960],[22.1,.6,.75,540,980],[25,.62,.8,540,980]];
function mood(t){for(let i=1;i<MOOD.length;i++){if(t<=MOOD[i][0]){const a=MOOD[i-1],b=MOOD[i],k=smooth(prog(t,a[0],b[0]));return {b:lerp(a[1],b[1],k),g:lerp(a[2],b[2],k),cx:lerp(a[3],b[3],k),cy:lerp(a[4],b[4],k)}}}const m=MOOD[MOOD.length-1];return {b:m[1],g:m[2],cx:m[3],cy:m[4]}}
function drawBG(t){
  const m=mood(t), c=bgx;
  let g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#050B20'); g.addColorStop(.55,'#091A3E'); g.addColorStop(1,'#040919'); c.fillStyle=g; c.fillRect(0,0,W,H);
  let r=c.createRadialGradient(m.cx,m.cy,0,m.cx,m.cy,1150); r.addColorStop(0,'rgba(40,96,214,'+(m.b*.55)+')'); r.addColorStop(.5,'rgba(20,52,134,'+(m.b*.26)+')'); r.addColorStop(1,'rgba(5,11,30,0)'); c.fillStyle=r; c.fillRect(0,0,W,H);
  r=c.createRadialGradient(540,1420,0,540,1420,980); r.addColorStop(0,'rgba(232,184,80,'+(m.g*.6)+')'); r.addColorStop(.55,'rgba(190,140,40,'+(m.g*.2)+')'); r.addColorStop(1,'rgba(120,80,10,0)'); c.fillStyle=r; c.fillRect(0,0,W,H);
  // perspective tunnel grid
  const ph=Gp(t), N=15, ga=(t>=CUE.s6?.5:.85);
  c.lineWidth=2;
  for(let k=0;k<N;k++){const f=((k+(ph%1))/N), d=Math.pow(f,2.3), a=(.02+.15*f)*ga;
    c.strokeStyle='rgba(120,160,235,'+a+')'; const y1=960+960*d, y2=960-960*d;
    c.beginPath();c.moveTo(0,y1);c.lineTo(W,y1);c.moveTo(0,y2);c.lineTo(W,y2);c.stroke()}
  c.strokeStyle='rgba(120,160,235,'+(.07*ga)+')';
  c.beginPath(); for(let j=-9;j<=9;j++){const x2=540+j*200; c.moveTo(540,960);c.lineTo(x2,H);c.moveTo(540,960);c.lineTo(x2,0)} c.stroke();
  // dust
  S.dust.forEach(p=>{const y=((p.y-p.v*t)%H+H)%H, x=p.x+Math.sin(t*.5+p.ph)*22, a=p.a*(.55+.45*Math.sin(t*2+p.ph));
    const fa=t>CUE.s6?1+1.6*prog(t,CUE.s6,CUE.s6+.8):1; c.fillStyle=p.g?'rgba(250,215,125,'+Math.min(1,a*(p.g?fa:1))+')':'rgba(190,210,255,'+(a*.8)+')'; c.beginPath();c.arc(x,y,p.s,0,6.283);c.fill()});
  // anamorphic streaks on impacts
  S.sparks.forEach(s=>{const k=pulse(t,s.t,5.5); if(k>.02){const gr=c.createLinearGradient(0,0,W,0); gr.addColorStop(0,'rgba(255,230,160,0)');gr.addColorStop(.5,'rgba(255,236,180,'+(.65*k)+')');gr.addColorStop(1,'rgba(255,230,160,0)');
    c.fillStyle=gr;c.fillRect(0,s.y-3,W,6)}});
}

/* ---------------------------------------------------------------- card state */
function fieldState(c,t){
  const q=Q(t), b=E.outExpo(prog(t,CUE.s2+c.delay,CUE.s2+c.delay+0.8));
  const calm=prog(t,CUE.s3,CUE.s3+.6);
  let x=lerp(c.ox,c.x1,b)+Math.sin(t*.9+c.ph)*lerp(26,10,calm);
  let y=lerp(c.oy,c.y1,b)+Math.cos(t*.75+c.ph*1.3)*lerp(22,9,calm);
  const qe=1-(1-q)*(1-q); let z=c.z1-c.span*(1-qe);
  const k=1+1.4*(1-q);
  return {x,y,z,rx:c.rx*k,ry:c.ry*k,rz:c.rz*k+Math.sin(t*1.3+c.ph)*2,s:1,o:clamp((t-CUE.s2-c.delay)/.2)};
}
function cardState(c,t){
  const f=fieldState(c,t); let {x,y,z,rx,ry,rz,s,o}=f; let blur=0, tag=0, chk=0, qual=0;
  const dep=1-.32*prog(-c.z1,200,1200); o*=dep;
  if(z>450) o*=1-prog(z,450,900);
  if(c.fate>0){
    const p=prog(t,c.tOut,c.tOut+.55), e=E.inCubic(p);
    z-=800*e; x+=c.dx*e*.35; y-=140*e; s=1-.3*e; o*=1-e; blur=p>0?e*7:0;
    tag=prog(t,c.tPass-.05,c.tPass+.1)*(1-prog(t,c.tOut+.28,c.tOut+.5));
  } else {
    qual=t>=c.tPass1+.1?1:0; chk=t>=c.tPass3?E.outBack(prog(t,c.tPass3,c.tPass3+.4)):0;
    if(t>=c.tGrid){
      const g0=fieldState(c,c.tGrid), sl=slotXY(c.slot), v=E.outCubic(prog(t,c.tGrid,c.tGrid+.7));
      x=lerp(g0.x,sl.x,v); y=lerp(g0.y,sl.y,v); z=lerp(g0.z,0,v); rx=lerp(g0.rx,0,v); ry=lerp(g0.ry,0,v); rz=lerp(g0.rz,0,v); s=lerp(1,.96,v); o=1;
      // scene 4: glide into CRM row, hand over to the row element
      const row=S.rows[c.slot], w=prog(t,CUE.crmIn+c.slot*.035,CUE.crmIn+.5+c.slot*.035), ew=E.inOutCubic(w);
      if(w>0){const ty=rowCenterWorldY(row.yU); x=lerp(x,0,ew); y=lerp(y,ty,ew); s=lerp(.96,1.12,ew); o=1-prog(w,.45,1)}
    }
  }
  return {x,y,z,rx,ry,rz,s,o,blur,tag,chk,qual};
}
const proj=(st)=>{const k=PERSP/(PERSP-st.z);return {x:540+st.x*k,y:960+st.y*k,k}};

/* --------------------------------------------------------------------- frame */
const camEl=$('cam'), mbBlur=$('mbBlur'), flashEl=$('flash'), beamEl=$('beam'), ringEl=$('ring'), scrimEl=$('scrim'), topScrim=$('topscrim');
function updCam(t){
  let roll=0,sx=0,sy=0,sz=0,rx=0,ry=0,blur=0;
  const w1=gauss(t,CUE.whip1,.11), w2=gauss(t,CUE.whip2,.11), w3=gauss(t,CUE.s4+.05,.14), w4=gauss(t,CUE.s5+.05,.14), w0=gauss(t,CUE.s2+.1,.1);
  if(t>=CUE.s2&&t<7.5){roll=Math.sin(t*2.3)*.7-w1*4+w2*5; sx=-w1*320+w2*340+Math.sin(t*19)*2.5; sy=Math.cos(t*15)*2.5; sz=Math.sin(t*3)*8}
  if(t>=CUE.s3&&t<CUE.s4-.2){const u=t-CUE.s3; ry=Math.sin(u*.5)*2.4; rx=Math.cos(u*.4)*1.3; sz=u*11}
  if(t>=CUE.s4-.2&&t<CUE.s5){const u=t-CUE.s4; ry=Math.sin(u*.6)*1.1; rx=0.6*Math.cos(u*.5); sz=lerp(0,36,prog(t,CUE.s4,CUE.s5))}
  sx+=-w3*260+w4*300; roll+=w3*-2.5+w4*3;
  blur=Math.max(w1,w2)*34+w3*30+w4*30+w0*14;
  world.style.transform='translate3d('+sx+'px,'+sy+'px,'+sz+'px) rotateX('+rx+'deg) rotateY('+ry+'deg) rotateZ('+roll+'deg)';
  if(blur>.8){mbBlur.setAttribute('stdDeviation',blur.toFixed(1)+' 0'); if(camEl._f!==1){camEl.style.filter='url(#mb)';camEl._f=1}} else if(camEl._f!==0){camEl.style.filter='none';camEl._f=0}
}
function updHook(t){
  const vis=t<3.35; [S.hookW,S.hookG].forEach(c=>c.root.style.opacity=vis?1:0); if(!vis)return;
  // WHITE block: slam in, move up, shrink, fade through
  const st=[-0.24,-0.1];
  S.hookW.lines.forEach((L,k)=>{const p=E.outExpo(prog(t,st[k],st[k]+.36)); const sc=lerp(1.85,1,p), bl=(1-p)*16;
    L.ci.style.transform='scale('+sc+')'; L.ci.style.filter=bl>.4?'blur('+bl+'px)':'none'; L.ci.style.opacity=clamp(p*2.6)});
  const moveB=E.inOutCubic(prog(t,CUE.goldReveal,CUE.goldReveal+.5)), moveC=E.inOutCubic(prog(t,CUE.winUp-.05,CUE.winUp+.6));
  const wy=lerp(0,-400,moveB)+lerp(0,-140,moveC), ws=lerp(1,.62,moveC)*(1+.35*E.inCubic(prog(t,2.7,3.1)));
  S.hookW.root.style.transform='translateY('+wy+'px) scale('+ws+')'; S.hookW.root.style.opacity=vis?1-prog(t,2.7,2.98):0;
  // GOLD block: masked reveal + shine
  const r=E.outExpo(prog(t,CUE.goldReveal,CUE.goldReveal+.55));
  S.hookG.root.style.clipPath='inset(-20% '+((1-r)*100)+'% -20% 0)';
  S.hookG.lines.forEach((L,k)=>shineLine(L.ci,lerp(130,-30,prog(t,CUE.goldReveal+.1+k*.08,CUE.goldReveal+.95+k*.08))));
  const gy=lerp(0,-300,moveC), gs=lerp(1,.62,moveC)*(1+.04*pulse(t,CUE.qPop,10)*Math.cos((t-CUE.qPop)*22))*(1+.35*E.inCubic(prog(t,2.7,3.1)));
  S.hookG.root.style.transform='translateY('+gy+'px) scale('+gs+')'; S.hookG.root.style.opacity=(t>=CUE.goldReveal?1:0)*(1-prog(t,2.7,2.98));
}
function updWin1(t){
  const vis=t>CUE.winUp-.08&&t<3.4; show(S.win1,vis); if(!vis)return;
  const p=E.outCubic(prog(t,CUE.winUp,CUE.winUp+.8)), zm=E.inCubic(prog(t,2.7,3.18));
  const y=lerp(1250,390,p)-zm*40, rx=lerp(46,9,p)*(1-zm), s=lerp(.9,1,p)+zm*2.4, z=zm*300;
  T3(S.win1,{x:0,y,z,rx,s}); S.win1.style.opacity=1-prog(t,3.0,3.22);
  const txt='home service companies near me', n=Math.floor(txt.length*prog(t,CUE.typeA,CUE.typeB));
  S.w1t.textContent=txt.slice(0,n); S.w1c.style.opacity=(Math.floor(t*4)%2===0||n<txt.length)?1:0;
  S.w1s.textContent='searching'+'.'.repeat(1+Math.floor(t*4)%3);
  S.w1a.textContent='TABS '+Math.floor(lerp(9,27,prog(t,1.9,3.0)));
  S.w1b.textContent='RESULTS '+fmt(lerp(120,48213,E.inCubic(prog(t,2.0,3.2))));
  S.w1r.style.transform='translateY('+(-((Math.max(0,t-CUE.winUp-.3)*760)%(8*122)))+'px)';
}
function updCards(t){
  const on=t>=CUE.s2-.02&&t<CUE.s4+.7;
  cards.forEach(c=>{
    if(!on){show(c.el,false);return}
    const st=cardState(c,t); const vis=st.o>.01&&st.s>0; show(c.el,vis); if(!vis)return;
    T3(c.el,{x:st.x,y:st.y,z:st.z,rx:st.rx,ry:st.ry,rz:st.rz,s:st.s});
    c.el.style.opacity=st.o.toFixed(3);
    const bf=st.blur>.3?'blur('+st.blur.toFixed(1)+'px)':'none'; if(c._bf!==bf){c.el.style.filter=bf;c._bf=bf}
    if(c.type==='a'){
      if(c.fate>0){const tv=st.tag.toFixed(2); if(c._tv!==tv){c.tagEl.style.opacity=tv;c._tv=tv}}
      else{ if(c._q!==st.qual){c.el.classList.toggle('qual',!!st.qual);c._q=st.qual}
        const cv=st.chk.toFixed(2); if(c._cv!==cv){c.chkEl.style.opacity=clamp(st.chk*3);c.chkEl.style.transform='scale('+st.chk+')';c._cv=cv}}
    }
  });
}
function setCls(o,st,names){if(o.st!==st){o.e.classList.remove('on','done');if(st)o.e.classList.add(st);o.st=st}}
function updScene3UI(t){
  const vis=t>=CUE.s3+.1&&t<CUE.s4+.35;
  S.icp.style.opacity=vis?E.outCubic(prog(t,CUE.s3+.2,CUE.s3+.7))*(1-prog(t,CUE.s4-.1,CUE.s4+.3)):0;
  S.icp.style.transform='translateX('+((1-E.outCubic(prog(t,CUE.s3+.2,CUE.s3+.8)))*90)+'px)';
  S.stepper.style.opacity=vis?E.outCubic(prog(t,CUE.s3+.1,CUE.s3+.6))*(1-prog(t,CUE.s4-.1,CUE.s4+.3)):0;
  S.stepper.style.transform='translateX('+((1-E.outCubic(prog(t,CUE.s3+.1,CUE.s3+.7)))*-90)+'px)';
  S.chips.forEach(c=>{const st=t>=c.b?'done':(t>=c.a?'on':''); if(c.st!==st){c.e.classList.remove('on','done');if(st)c.e.classList.add(st);c.ck.textContent=st?'✓':'';c.st=st}});
  const idx=[SW[1],SW[2],SW[3]];
  S.stp.forEach((s,i)=>{const st=t>=idx[i].b?'done':(t>=idx[i].a?'on':''); if(s.st!==st){s.e.classList.remove('on','done');if(st)s.e.classList.add(st);s.e.querySelector('.n').textContent=st==='done'?'✓':'0'+(i+1);s.st=st}});
  // beam
  let by=-1,dir=1;
  for(let n=1;n<=3;n++){const s=SW[n]; if(t>=s.a&&t<=s.b){const f=(t-s.a)/(s.b-s.a); by=SWY0+(SWY1-SWY0)*(s.dir>0?f:1-f); dir=s.dir}}
  if(by>0){beamEl.style.opacity=1; beamEl.style.transform='translateY('+(dir>0?by-260:by)+'px) scaleY('+(dir>0?1:-1)+')'} else beamEl.style.opacity=0;
}
function updHUD(t){
  const vis=t>=CUE.s2+.15&&t<CUE.s3+.1;
  S.hud.style.opacity=vis?E.outCubic(prog(t,CUE.s2+.15,CUE.s2+.5))*(1-prog(t,CUE.s3-.15,CUE.s3+.1)):0;
  if(!vis)return;
  S.h1v.textContent=Math.floor(lerp(27,71,prog(t,CUE.s2,CUE.s3)));
  if(t<CUE.cap2b){S.h2l.textContent='RESULTS';S.h2v.textContent=fmt(lerp(48213,612480,E.inCubic(prog(t,CUE.s2,CUE.cap2b))))}
  else{S.h2l.textContent='CLEAR PRIORITIES';S.h2v.textContent='0'}
  S.h2.style.left=(t<CUE.cap2b?'250px':'250px');
  S.foot.style.opacity=.9;
}
function updFoot(t){
  const a=prog(t,CUE.s2+.3,CUE.s2+.8)*(1-prog(t,CUE.s5+3.0,CUE.s5+3.3)); S.foot.style.opacity=a*.95;
  S.foot.textContent=(t<CUE.s5+3.0)?'Illustrative sample data · all companies shown are fictional':'';
}
function updCRM(t){
  const vis=t>=CUE.s4-.3&&t<CUE.s5+.75; show(S.crm,vis); if(!vis)return;
  const inP=E.outCubic(prog(t,CUE.s4-.1,CUE.s4+.65)), outP=E.inCubic(prog(t,CUE.s5,CUE.s5+.65));
  const y=90+outP*0, rx=lerp(58,0,inP)+outP*0, ry=outP*-62, x=-outP*620, s=lerp(.86,1,inP)*(1-outP*.45);
  T3(S.crm,{x,y,z:-outP*300,rx,ry,s});
  S.crm.style.opacity=clamp(inP*2.2)*(1-prog(t,CUE.s5+.25,CUE.s5+.7));
  const done=prog(t,CUE.done,CUE.done+.8);
  S.crm.style.boxShadow='0 60px 140px rgba(0,0,0,.6),0 0 0 1px rgba(217,169,62,'+(.1+.5*done)+'),0 0 '+(80*done)+'px rgba(217,169,62,'+(.28*done)+'),inset 0 1px 0 rgba(255,255,255,.16)';
  // tracker
  const stg=[[CUE.crmIn+.3,CUE.qual-.2],[CUE.qual-.2,CUE.sort],[CUE.sort,99]];
  S.ts.forEach((o,i)=>{const st=(i<2&&t>=stg[i][1])?'done':(t>=stg[i][0]?'on':''); if(o.st!==st){o.e.classList.remove('on','done');if(st)o.e.classList.add(st);o.e.querySelector('.n').textContent=st==='done'?'✓':(i+1);o.st=st}});
  // rows
  S.rows.forEach(r=>{
    const a=E.outCubic(prog(t,r.tIn,r.tIn+.45));
    const sp=E.inOutCubic(prog(t,r.tS,r.tS+.8)); const y=lerp(r.yU,r.yS,sp);
    const bump=1+.03*Math.sin(Math.PI*prog(t,r.tS,r.tS+.8));
    r.e.style.transform='translate3d('+((1-a)*70)+'px,'+y+'px,0) scale('+bump+')'; r.e.style.opacity=a;
    // notes typing
    const np=prog(t,r.tn,r.tn+.9); const nn=Math.floor(r.d.note.length*np);
    const nt=np<=0?'Researching…':r.d.note.slice(0,nn); if(r.st.nt!==nt){r.note.textContent=nt;r.st.nt=nt; const w=np<=0; r.note.classList.toggle('wait',w)}
    // qualification pill
    const qd=t>=r.tq; if(r.st.q!==qd){r.pq.textContent=qd?'✓ QUALIFIED':'IN REVIEW'; r.pq.classList.toggle('pg',qd); r.st.q=qd}
    r.pq.style.transform=qd?'scale('+(1+.2*pulse(t,r.tq,9)*Math.cos((t-r.tq)*26))+')':'none';
    const ps=t>=r.tpR?2:(t>=r.tpS?1:0); if(r.st.p!==ps){r.po.textContent=['NOT STARTED','PREPARING…','✓ OUTREACH READY'][ps]; r.po.classList.toggle('blue',ps===1); r.po.classList.toggle('pg',ps===2); r.st.p=ps}
    r.po.style.transform=ps===2?'scale('+(1+.18*pulse(t,r.tpR,9)*Math.cos((t-r.tpR)*26))+')':'none';
  });
  S.gh.forEach(h=>{const a=E.outCubic(prog(t,CUE.sort+.55+h.g*.12,CUE.sort+1.0+h.g*.12)); h.e.style.opacity=a; h.e.style.transform='translateY('+(h.g*278)+'px)'});
  S.sumbar.style.opacity=done>0?(1-prog(t,CUE.done+.6,CUE.done+.9)):0; S.sumbar.style.transform='translateX('+(lerp(-960,960,E.inOutCubic(prog(t,CUE.done,CUE.done+.8))))+'px)';
}
function updStack(t){
  const vis=t>=CUE.panels[0]-.8&&t<CUE.converge+.5; show(S.stack,vis); if(!vis)return;
  const gp=prog(t,CUE.s5+.3,CUE.converge), cv=E.inCubic(prog(t,CUE.converge-.1,CUE.converge+.35));
  T3(S.stack,{x:0,y:-60+90*gp*0,z:-cv*900+gp*120,rx:lerp(14,2,E.outCubic(gp)),ry:lerp(-26,0,E.outCubic(gp))+Math.sin(t*1.2)*1.2,s:1-cv*.25});
  S.stack.style.opacity=1-prog(t,CUE.converge+.1,CUE.converge+.42);
  S.pn.forEach(p=>{
    const a=prog(t,p.t-.55,p.t+.25), e=E.outBack(a); const vv=a>0; show(p.e,vv); if(!vv)return;
    const bob=Math.sin(t*1.6+p.i*1.3)*5;
    T3(p.e,{x:(1-E.outCubic(a))*p.side*1100,y:p.y+bob+(1-E.outCubic(a))*40,z:(1-e)*-700,ry:(1-E.outCubic(a))*p.side*-60,rx:(1-a)*14});
    p.e.style.opacity=clamp(a*2.5);
  });
  S.conn.forEach((c,i)=>{const a=prog(t,CUE.panels[i+1]-.2,CUE.panels[i+1]+.4); c.style.opacity=a*(.55+.45*Math.sin(t*7+i*2)); c.style.transform='translateZ(0) scaleY('+(0.8+.4*Math.sin(t*7+i*2))+')'});
}
function updWordmark(t){
  const t0=CUE.wordmark, vis=t>=t0-.02; S.wm.style.opacity=vis?1:0;
  const yC=lerp(960,925,E.inOutCubic(prog(t,CUE.s6,CUE.s6+.7)));
  S.wm.style.top=(yC-S.wmSize/2)+'px';
  S.wmL.forEach((s,j)=>{const a=prog(t,t0+j*.032,t0+j*.032+.5), p=E.outBack(a);
    s.style.transform='translateY('+((1-p)*46)+'px) scale('+lerp(.55,1,p)+')'; s.style.opacity=clamp(a*3); s.style.filter=a<1?'blur('+((1-a)*10)+'px)':'none'});
  S.wmG.forEach((s,j)=>shineLine(s,lerp(150,-40,prog(t,t0+.45,t0+1.35))));
  const ra=E.outCubic(prog(t,t0+.5,t0+1.1));
  S.wmrule.style.opacity=ra; S.wmrule.style.top=(yC+S.wmSize/2+22)+'px'; S.wmrule.style.transform='scaleX('+ra+')';
  S.wmtag.style.opacity=E.outCubic(prog(t,t0+.7,t0+1.3)); S.wmtag.style.top=(yC+S.wmSize/2+44)+'px'; S.wmtag.style.transform='translateY('+((1-E.outCubic(prog(t,t0+.7,t0+1.3)))*16)+'px)';
}
function updFinale(t){
  capAnim(S.cap6,t,CUE.headline,99,{stag:.12,dur:.7,skew:8});
  S.cap6.lines.forEach((L,k)=>{ if(L.L.gold) shineLine(L.ci,lerp(130,-30,prog(t,CUE.headline+.35,CUE.headline+1.3))) });
  const ca=E.outBack(prog(t,CUE.cta,CUE.cta+.55)); const vis=t>=CUE.cta-.01;
  const ctaTop=1150; S.cta.style.top=ctaTop+'px'; S.cring.style.top=ctaTop+'px';
  S.cta.style.opacity=vis?clamp(ca*2):0; S.cta.style.transform='scale('+lerp(.8,1,ca)+')';
  S.ctaSh.style.left=lerp(-260,1100,prog((t-CUE.cta-.3)%1.7,0,.6)*(t>CUE.cta+.3?1:0))+'px';
  const rp=((t-CUE.cta-.2)%1.4)/1.4; S.cring.style.opacity=t>CUE.cta+.2?(1-rp)*.7:0; S.cring.style.transform='scale('+(1+rp*.12)+')';
  const fa=prog(t,CUE.cta+.5,CUE.cta+1); S.fine.style.opacity=fa*.9; S.fine.style.top=(ctaTop+190)+'px';
}
function drawFX(t){
  const c=fx; c.clearRect(0,0,W,H);
  // sparks
  S.sparks.forEach(s=>{const u=t-s.t; if(u<0||u>1.2)return; s.p.forEach(p=>{if(u>p.l)return; const d=p.v*(1-Math.exp(-u*4))/4, d0=p.v*(1-Math.exp(-Math.max(0,u-.05)*4))/4;
    const a=1-u/p.l; c.strokeStyle='rgba(255,226,140,'+(a*.9)+')'; c.lineWidth=p.w*(1.1-u/p.l); c.beginPath(); c.moveTo(s.x+Math.cos(p.a)*d0,s.y+Math.sin(p.a)*d0); c.lineTo(s.x+Math.cos(p.a)*d,s.y+Math.sin(p.a)*d); c.stroke()})});
  if(t>=CUE.s3&&t<CUE.s4+.7){
    cards.forEach(cd=>{ if(cd.fate!==0)return;
      // flow line from ICP panel to each card as it passes the final check
      const f0=cd.tPass3, u=t-f0; if(u>=0&&u<.9){ const st=cardState(cd,f0), pr=proj(st); const head=E.outCubic(prog(u,0,.6)), tail=Math.max(0,head-.45);
        const P0={x:540,y:852}, P3={x:pr.x,y:pr.y}, P1={x:540,y:P0.y+160}, P2={x:pr.x,y:pr.y-220};
        const B=(k)=>{const m=1-k;return {x:m*m*m*P0.x+3*m*m*k*P1.x+3*m*k*k*P2.x+k*k*k*P3.x,y:m*m*m*P0.y+3*m*m*k*P1.y+3*m*k*k*P2.y+k*k*k*P3.y}};
        c.lineCap='round'; const fade=1-prog(u,.6,.9);
        for(let i=0;i<14;i++){const k0=lerp(tail,head,i/14), k1=lerp(tail,head,(i+1)/14), a=(i/14)*.9*fade; const p0=B(k0),p1=B(k1); c.strokeStyle='rgba(244,216,138,'+a+')'; c.lineWidth=2+4*(i/14); c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.stroke()}
        const hp=B(head); const gr=c.createRadialGradient(hp.x,hp.y,0,hp.x,hp.y,34); gr.addColorStop(0,'rgba(255,240,190,'+fade+')'); gr.addColorStop(1,'rgba(255,220,130,0)'); c.fillStyle=gr; c.beginPath();c.arc(hp.x,hp.y,34,0,6.283);c.fill();
      }
      // comet trail during grid-in / row hand-off
      const g0=cd.tGrid, g1=CUE.crmIn+.6+cd.slot*.035; if(t>=g0&&t<=g1+.1){
        const spd=t<CUE.crmIn?.7:.55; const act=t<CUE.crmIn+.2?prog(t,g0,g0+.15)*(1-prog(t,g0+.62,g0+.85)):(prog(t,CUE.crmIn+cd.slot*.035,CUE.crmIn+.1+cd.slot*.035)*(1-prog(t,CUE.crmIn+.35+cd.slot*.035,g1)));
        if(act>.02){ let prev=null; for(let k=0;k<12;k++){const tt=t-k*.02, pr=proj(cardState(cd,tt)); if(prev){c.strokeStyle='rgba(244,216,138,'+((1-k/12)*.55*act)+')'; c.lineWidth=14*(1-k/12)*act; c.lineCap='round'; c.beginPath();c.moveTo(prev.x,prev.y);c.lineTo(pr.x,pr.y);c.stroke()} prev=pr} }
      }
    });
  }
}
function updOverlayFX(t){
  // flash
  const fl=.5*pulse(t,0,9)+.35*pulse(t,CUE.goldReveal,10)+.9*pulse(t,CUE.s2,8)+.55*pulse(t,CUE.s3,7)+.3*pulse(t,CUE.s4,9)+.95*pulse(t,CUE.converge,7)+.4*pulse(t,CUE.s6,9)+.25*pulse(t,CUE.s5,9);
  flashEl.style.opacity=clamp(fl*(t<.05?.35:1),0,.95);
  // shock ring at slow-down
  const rp=prog(t,CUE.s3,CUE.s3+.9); ringEl.style.opacity=rp>0&&rp<1?(1-rp)*.9:0; ringEl.style.transform='scale('+lerp(.2,4.2,E.outCubic(rp))+')';
  topScrim.style.opacity=prog(t,CUE.cap3a-.1,CUE.cap3a+.3)*(1-prog(t,CUE.s5-.4,CUE.s5));
  scrimEl.style.opacity=.92*prog(t,CUE.cap2a-.1,CUE.cap2a+.3)*(1-prog(t,CUE.s3-.25,CUE.s3+.05));
  // grain
  const id=gx.createImageData(290,500), d=id.data; let seed=Math.floor(t*30)*9301+49297;
  for(let i=0;i<d.length;i+=4){seed=(seed*16807)%2147483647; const v=(seed&255); d[i]=d[i+1]=d[i+2]=v; d[i+3]=255}
  gx.putImageData(id,0,0);
}

window.renderFrame=function(t){
  t=clamp(t,0,CUE.end);
  drawBG(t); updCam(t);
  updHook(t); updWin1(t); updCards(t); updHUD(t); updFoot(t);
  capAnim(S.cap2a,t,CUE.cap2a,CUE.cap2b-.45,{glitch:true,stag:.12});
  capAnim(S.cap2b,t,CUE.cap2b,CUE.s3-.12,{glitch:true,stag:.12});
  S.cap2b.lines.forEach(L=>{if(L.L.gold)shineLine(L.ci,lerp(130,-30,prog(t,CUE.cap2b+.3,CUE.cap2b+1.1)))});
  capAnim(S.cap3a,t,CUE.cap3a,CUE.cap3b-.45,{stag:.1});
  capAnim(S.cap3b,t,CUE.cap3b,CUE.s4-.08,{stag:.1});
  capAnim(S.cap4,t,CUE.cap4,CUE.s5-.3,{stag:.1});
  [S.cap3a,S.cap3b,S.cap4].forEach(c=>c.lines.forEach(L=>{if(L.L.gold){const t0=c===S.cap3a?CUE.cap3a:(c===S.cap3b?CUE.cap3b:CUE.cap4);shineLine(L.ci,lerp(130,-30,prog(t,t0+.3,t0+1.1)))}}));
  updScene3UI(t); updCRM(t); updStack(t); updWordmark(t); updFinale(t);
  drawFX(t); updOverlayFX(t);
};
window.getAudioEvents=()=>AUDIO;
window.READY=(async()=>{
  await Promise.all(['900 100px Montserrat','800 20px Montserrat','700 20px Montserrat','400 20px Inter','500 20px Inter','600 20px Inter','700 20px Inter','500 20px JBM','700 20px JBM'].map(f=>document.fonts.load(f)));
  await document.fonts.ready; build(); window.renderFrame(0); return true;
})();
})();
