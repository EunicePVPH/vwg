/* ===== MASTER TIMELINE ===== */

const CX=(id,dx=0,dy=0)=>[STN[id][0]+dx,STN[id][1]+dy];
function K(t,id,dx,dy,s,rx=0,ry=0,rz=0,stop=false){const [x,y]=CX(id,dx,dy);return C(t,x,y,s,rx,ry,rz,stop);}
function KW(t,x,y,s,rx=0,ry=0,rz=0,stop=false){return C(t,x,y,s,rx,ry,rz,stop);}

camKeys([
  K(0,'ops',0,-317,1.2,0,0,0,true),
  K(2.95,'ops',0,-285,1.34,0,0,.8),
  K(3.95,'ops',150,-120,.64,8,-10,-2),
  K(4.9,'ops',270,-150,.62,6,-8,0),
  K(6.4,'ops',640,-330,.78,4,-14,1),
  K(8.0,'ops',-250,430,.72,6,12,-1),
  KW(8.75,700,-1250,.4,14,0,-7),
  K(9.45,'mkt',-780,-200,.82,4,12,-1),
  K(10.7,'mkt',-250,-40,.6,6,6,0),
  K(12.0,'mkt',650,-250,.82,4,-12,1),
  K(13.1,'mkt',680,700,.78,6,-10,0),
  KW(13.85,1130,470,.4,14,0,6),
  K(14.55,'web',-380,20,.8,12,-10,0),
  K(15.9,'web',-340,40,.88,10,-14,1),
  K(16.75,'web',-60,40,.74,6,6,0),
  K(17.45,'web',830,150,.8,6,-8,0),
  K(18.4,'web',930,640,.72,8,-6,-1),
  KW(19.0,0,1500,.38,14,0,-6),
  K(19.55,'res',-600,0,.74,6,10,-1),
  K(20.7,'res',-150,0,.6,8,0,0),
  K(21.55,'res',420,0,.72,6,-10,1),
  KW(22.25,-1130,520,.4,14,0,5),
  K(22.95,'con',-600,-100,.9,4,12,-1),
  K(23.5,'con',-60,860,.74,8,0,0),
  K(24.2,'con',0,-120,.68,8,-4,0),
  KW(25.0,-900,-450,.38,16,0,-3),
  KW(26.2,0,-60,.225,26,0,-4),
  KW(27.7,0,-60,.24,26,0,2,true),
]);
SHAKES.push([3.03,1.0],[3.4,.4],[27.5,.5]);
STATIONS.ops.vis=[[0,10.3],[24.0,31]];STATIONS.mkt.vis=[[7.4,15.0],[24.0,31]];STATIONS.web.vis=[[12.6,20.3],[24.0,31]];STATIONS.res.vis=[[17.4,23.5],[24.0,31]];STATIONS.con.vis=[[20.6,31]];

/* ---------- text ---------- */
const W_ = '#ffffff';
// HOOK
const tLead=textCard({x:540,y:292,size:112,align:'center',lines:[[{t:'THINK A VA',c:W_}]],t0:.2,t1:2.85,variant:'letters',exit:.3});
const tOnly=textCard({x:540,y:420,size:186,align:'center',lines:[[{t:'ONLY',c:W_}],[{t:'HANDLES',c:W_}],[{t:'EMAILS?',c:W_}]],t0:1.38,stagger:.34,t1:3.02,variant:'rise',exit:.22});
const tBig=textCard({x:540,y:470,size:236,align:'center',lines:[[{t:'THINK',c:GOLDL}],[{t:'BIGGER.',c:GOLD}]],t0:3.04,stagger:.16,t1:4.2,variant:'slam',exit:.3,css:'text-shadow:0 0 80px rgba(212,168,75,.55),0 10px 60px rgba(2,8,24,.6)'});
const strike=div('', 'position:absolute;left:200px;top:880px;height:16px;width:680px;background:'+GOLD+';border-radius:8px;box-shadow:0 0 30px '+GOLD+';transform-origin:left;opacity:0',null,TXT);
const hdim=div('', 'position:absolute;inset:0;background:radial-gradient(90% 60% at 50% 42%,rgba(5,15,38,.80),rgba(5,15,38,.93));opacity:0',null,$('shake'));
$('shake').insertBefore(hdim,TXT);

// slots
const SL=(lines,t0,t1,variant,extra={})=>textCard(Object.assign({x:72,y:1040,size:112,lines:lines.map(l=>[{t:l,c:W_,},]).map((s,i,arr)=>s),t0,t1,variant},extra));
function slot(words,t0,t1,variant,o={}){
  // words: array of lines; last char '.' coloured gold
  const lines=words.map((w,li)=>{const last=li===words.length-1&&w.endsWith('.');return last?[{t:w.slice(0,-1),c:W_},{t:'.',c:GOLD}]:[{t:w,c:W_}];});
  return textCard(Object.assign({x:72,y:1040,size:112,lines,t0,t1,variant,stagger:.12},o));
}
// scene 2
slot(['OPERATIONS.'],4.35,5.62,'rise');
slot(['ADMIN.'],5.62,6.95,'letters');
slot(['BUSINESS','SUPPORT.'],6.95,8.75,'wipe',{stagger:.16});
// scene 3
slot(['STRATEGY.'],9.55,10.95,'letters');
slot(['CONTENT.'],10.95,12.1,'rise');
slot(['MARKETING.'],12.1,13.7,'wipe');
// scene 4
slot(['WEBSITES.'],14.4,15.05,'rise');
slot(['LANDING','PAGES.'],15.05,16.25,'letters',{stagger:.1});
slot(['SALES','FUNNELS.'],16.25,18.75,'wipe',{stagger:.16});
// scene 5
slot(['RESEARCH.'],19.9,20.55,'rise');
slot(['LEAD','GENERATION.'],20.55,21.95,'letters',{stagger:.1,size:104});
slot(['VIDEO &','PODCAST','SUPPORT.'],22.0,24.75,'wipe',{stagger:.14,size:104,y:1020});
// scene 6
textCard({x:72,y:1020,size:132,lines:[[{t:'ONE',c:W_}],[{t:'TEAM.',c:GOLD}]],t0:24.6,t1:25.7,variant:'slam',stagger:.14,exit:.25});
textCard({x:72,y:1000,size:88,lines:[[{t:'MULTIPLE',c:W_}],[{t:'CAPABILITIES.',c:GOLD}]],t0:25.7,t1:27.15,variant:'rise',stagger:.14,exit:.3});

/* kickers */
const KICK=[[4.3,8.8,'01 / OPERATIONS & ADMIN'],[9.25,13.8,'02 / DIGITAL MARKETING'],[14.4,18.8,'03 / WEBSITES & FUNNELS'],[19.8,22.0,'04 / RESEARCH & LEADS'],[22.0,24.75,'05 / CREATIVE PRODUCTION']];
const kEls=KICK.map(k=>div('', 'position:absolute;left:76px;top:972px;font-weight:800;font-size:27px;letter-spacing:.3em;color:'+GOLD+';white-space:nowrap;display:flex;align-items:center;gap:20px',`<span style="display:block;width:64px;height:5px;background:${GOLD};border-radius:3px"></span><span>${k[2]}</span>`,TXT));

/* HUD */
const hud=$('hud');
div('wm','',`PROVIRTUAL <b>PH</b>`,hud);
const tickEls=[],labs=['OPERATIONS','MARKETING','WEBSITES','RESEARCH','CONTENT'];
for(let i=0;i<5;i++){const d=div('tick',`left:${620+i*84}px;width:76px`,'<i></i>',hud);tickEls.push(d.firstChild);}
const tlab=div('tl','right:64px;text-align:right','',hud);
div('', 'position:absolute;left:64px;top:150px;font-weight:600;font-size:19px;letter-spacing:.14em;color:rgba(255,255,255,.42)','ILLUSTRATIVE INTERFACES · SAMPLE CONTENT',hud);
const SEG=[3.9,8.85,13.85,18.85,22.25,25.0];

/* grain */
(()=>{const c=$('grain'),g=c.getContext('2d'),im=g.createImageData(256,256);for(let i=0;i<256*256;i++){const v=Math.random()*255;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255;}g.putImageData(im,0,0);c.style.width='1280px';c.style.height='1280px';})();

function seek(t){
  const f=Math.round(t*30);
  const c=applyCamera(t);
  for(const id in STATIONS){const s=STATIONS[id];const iv=s.vis?(typeof s.vis[0]==='number'?[s.vis]:s.vis):null;const v=iv?iv.some(([a,b])=>t>=a&&t<=b):true;s.el.style.display=v?'block':'none';}
  renderPanels(t);
  for(const fn of ANIMS)fn(t);
  renderCards(t);
  // hook overlays
  hdim.style.opacity=(E.out3(P(t,.2,.7))*(1-E.io2(P(t,2.95,3.8)))*1).toFixed(3);
  const sk=E.out5(P(t,2.7,2.95))*(1-P(t,3.0,3.05));
  strike.style.opacity=sk>0?1:0; strike.style.transform=`scaleX(${E.out5(P(t,2.7,2.95))}) rotate(-2deg)`;
  // flash
  const fl=Math.max(0,1-Math.abs(t-3.04)/.22)*.9+Math.max(0,1-Math.abs(t-27.45)/.3)*.0;
  $('flash').style.opacity=fl.toFixed(3);
  // scrim
  $('scrim').style.opacity=(P(t,3.9,4.4)*(1-P(t,27.0,27.4))).toFixed(3);
  // kickers
  KICK.forEach((k,i)=>{const e=kEls[i];const a=E.out5(P(t,k[0],k[0]+.6)),b=E.in3(P(t,k[1]-.3,k[1]));e.style.opacity=(a*(1-b)).toFixed(3);e.style.transform=`translateX(${(1-a)*-40}px)`;e.style.display=(t<k[0]-.05||t>k[1]+.05)?'none':'flex';});
  // HUD
  hud.style.opacity=(P(t,3.7,4.2)*(1-P(t,26.8,27.2))).toFixed(3);
  for(let i=0;i<5;i++)tickEls[i].style.width=(clamp((t-SEG[i])/(SEG[i+1]-SEG[i]))*100)+'%';
  let ci=0;for(let i=0;i<5;i++)if(t>=SEG[i])ci=i;
  tlab.textContent=labs[ci];
  // grain jitter
  $('grain').style.transform=`translate(${(f*37)%90}px,${(f*53)%90}px)`;
  // sweep (transition light)
  let sw=0,swx=0;
  for(const ts of [3.0,8.55,13.6,18.6,21.95,24.5]){const k=P(t,ts,ts+.7);if(k>0&&k<1){sw=Math.sin(k*Math.PI)*.9;swx=lerp(-700,1300,E.io2(k));}}
  $('sweep').style.opacity=sw.toFixed(3);$('sweep').style.left=swx+'px';
}
window.seek=seek;
window.READY=false;
document.fonts.ready.then(()=>{seek(0);window.READY=true;});
