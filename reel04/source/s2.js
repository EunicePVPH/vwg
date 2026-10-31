// ================= SCENE 2: THE NEVER-ENDING WORKLOAD (4-9s) + shared task cards =================
const PW=860,PH=1040;
let BOARD_G,CARDS_G,CAMG;
const BX=40,BY=670,TW=480,TH=440;
const laneXY=i=>[BX+(i%2)*520,BY+Math.floor(i/2)*480];
const LANES=[
 {name:'ADMIN SUPPORT',col:'#5B82BF',icon:'inbox',cards:[['Reply to client inquiry','Inbox · Due today','mail'],['Schedule vendor call','Calendar · Tomorrow','calendar'],['File receipts','Admin · This week','file'],['Update invoice tracker','Admin · Due today','file'],['Confirm appointments','Calendar · Today','calendar']]},
 {name:'SOCIAL MEDIA',col:'#D4A64A',icon:'image',cards:[['Approve Instagram post','Content · Awaiting approval','image'],['Write caption','Content · Draft','image'],['Schedule weekly Reels','Content · This week','clock'],['Reply to comments','Social · Today','chat'],['Plan content calendar','Content · Next week','calendar']]},
 {name:'RESEARCH & LEADS',col:'#6CA6CC',icon:'search',cards:[['Competitor research','Research · In progress','search'],['Find new leads','Leads · This week','users'],['Update lead list','Leads · Today','users'],['Summarize findings','Research · Due Friday','file'],['Prep call notes','Research · Tomorrow','file']]},
 {name:'DIGITAL OPERATIONS',col:'#98A6C1',icon:'layout',cards:[['Update landing page','Website · Overdue','layout'],['Monthly report','Reports · Due Friday','file'],['Fix website banner','Website · Today','layout'],['Edit podcast notes','Content · Tomorrow','mic'],['Review analytics','Reports · This week','file']]},
];
const EXTRAS=[['Send meeting notes',0,'file','Admin · Today'],['Reply to vendor',0,'mail','Inbox · Today'],['Inbox follow-up',0,'mail','Inbox · Overdue'],['Approve story',1,'image','Content · Today'],['Reshare post',1,'image','Social · Draft'],['Content ideas',1,'chat','Content · This week'],['Find contacts',2,'users','Leads · Today'],['Collect sources',2,'search','Research · Due Friday'],['Check competitors',2,'search','Research · Today'],['Update booking page',3,'layout','Website · Tomorrow'],['Review report draft',3,'file','Reports · Due Friday'],['Fix broken link',3,'layout','Website · Overdue'],['Follow up with client',0,'chat','Inbox · Overdue'],['Confirm deadline',0,'calendar','Admin · Today'],['Send reminder',2,'mail','Leads · Today'],['Update CRM notes',2,'file','Leads · Overdue']];

// ---------- panel helpers ----------
const basePanel=()=>el('div','panel','',`left:${540-PW/2}px;top:${960-PH/2}px;width:${PW}px;height:${PH}px;border-radius:40px;box-shadow:0 70px 130px rgba(0,0,0,.55),0 0 0 1.5px rgba(255,255,255,.16)`);
const hdr=(icon,title,right='')=>`<div style="position:absolute;left:0;top:0;width:100%;height:104px;display:flex;align-items:center;gap:20px;padding:0 36px;background:#fff;border-bottom:1.5px solid #E3E9F2"><div style="width:58px;height:58px;border-radius:17px;display:grid;place-items:center;background:linear-gradient(135deg,#2A4F92,#0E2754)">${svg(icon,32,'#fff')}</div><div style="font:800 38px Mont;color:#0B1B33;letter-spacing:-.01em">${title}</div><div style="flex:1"></div>${right}</div>`;
const pillS=(bg,fg,txt,extra='')=>`<span style="display:inline-flex;align-items:center;gap:8px;border-radius:999px;font:700 22px Inter;padding:8px 20px;background:${bg};color:${fg};white-space:nowrap;${extra}">${txt}</span>`;
const subbar=html=>`<div style="position:absolute;left:0;top:104px;width:100%;height:70px;display:flex;align-items:center;gap:14px;padding:0 36px;background:#F4F7FB;border-bottom:1.5px solid #E3E9F2">${html}</div>`;
const tab=(t,on)=>`<span style="font:700 22px Inter;padding:9px 22px;border-radius:999px;${on?'background:#0F2A55;color:#fff':'background:#E6ECF5;color:#52627A'}">${t}</span>`;

function buildEmail(){
  const p=basePanel();
  p.innerHTML=hdr('inbox','Inbox','<span class="eb" style="display:inline-flex;align-items:center;justify-content:center;min-width:64px;height:48px;padding:0 16px;border-radius:24px;background:#E5484D;color:#fff;font:800 26px Inter">3</span>')+subbar(['All','Unread','Flagged','Sent'].map((t,i)=>tab(t,i==1)).join(''));
  const list=el('div','abs','',`left:0;top:174px;width:860px;height:866px;overflow:hidden`);p.appendChild(list);
  const D=[['Client','Quick question about our project','Hi, could you send over the updated…','#3B6FD6'],['Billing','Invoice reminder','Payment is due this Friday for…','#D4A64A'],['Team','Need your approval today','The draft is ready for your review…','#5B82BF'],['Vendor','Re: Schedule for next week','Can we confirm the time for…','#6CA6CC'],['Client','Following up on my last email','Just checking in to see if you…','#3B6FD6'],['Partner','Can we move our call?','Something came up on my side…','#7A6BC9'],['Website','Form submission received','A new inquiry came in from…','#98A6C1'],['Billing','Receipt for your records','Thank you for your payment…','#D4A64A'],['Client','Any updates on this?','Wanted to follow up on the…','#3B6FD6'],['Team','Meeting notes attached','Here are the notes from today…','#5B82BF'],['Support','Ticket update','We have an update regarding…','#6CA6CC'],['Vendor','Updated quote','Please see the revised quote…','#6CA6CC']];
  const N=30,A=[],rows=[];
  for(let k=0;k<N;k++){const u=Math.max(0,k-7)/(N-8);A.push(k<8?3.62+0.09*k:4.40+4.60*(1-Math.pow(1-u,1.5)));
    const d=D[k%D.length];
    const r=el('div','abs',`<div style="position:absolute;left:36px;top:27px;width:64px;height:64px;border-radius:50%;background:${d[3]};color:#fff;font:800 28px Inter;display:grid;place-items:center">${d[0][0]}</div><div style="position:absolute;left:124px;top:15px;font:800 27px Inter;color:#0B1B33;white-space:nowrap">${d[0]}</div><div style="position:absolute;right:36px;top:19px;font:600 21px Inter;color:#7A889D">${k==0?'now':(k*2)+'m'}</div><div style="position:absolute;left:124px;top:50px;width:600px;font:700 25px Inter;color:#14233E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d[1]}</div><div style="position:absolute;left:124px;top:84px;width:600px;font:500 21px Inter;color:#7A889D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d[2]}</div><div style="position:absolute;right:36px;top:62px;width:16px;height:16px;border-radius:50%;background:#2F6BDB"></div>`,`left:0;top:0;width:860px;height:118px;border-bottom:1.5px solid #E7ECF4;display:none`);
    list.appendChild(r);rows.push(r);}
  const eb=p.querySelector('.eb');
  return {p,update(t){
    let n=0;for(let k=0;k<N;k++)if(t>=A[k])n=k+1;eb.textContent=3+n;
    rows.forEach((r,k)=>{
      if(t<A[k]){r.style.display='none';return;}
      let slot=0;for(let j=k+1;j<N;j++){if(t>=A[j])slot+=eO3(prog(t,A[j],A[j]+0.22));else break;}
      if(slot>8.5){r.style.display='none';return;}
      const a=eO4(prog(t,A[k],A[k]+0.25));
      r.style.display='block';r.style.transform=`translate(${(-70*(1-a)).toFixed(1)}px,${(slot*118).toFixed(1)}px)`;r.style.opacity=a.toFixed(2);
      r.style.background=mixC('#FFF1C9','#FFFFFF',prog(t,A[k],A[k]+0.7));
    });
  }};
}
function buildSocial(){
  const p=basePanel();
  p.innerHTML=hdr('image','Content Queue',pillS('#FFF1D6','#9A6A12','<span class="sc">7</span> to approve'))+subbar(['Instagram','Facebook','TikTok'].map((t,i)=>tab(t,i==0)).join(''));
  const G=[['#173A74','#3C6DB8'],['#C9962F','#F0CB78'],['#2B4770','#6E8FC1'],['#0F2A55','#1E4A8F'],['#B98A2A','#E8C06A'],['#35507A','#7CA0CF']];
  const ico=['play','image','play','image','play','image'],pl=['Reel','Post','Reel','Story','Reel','Post'];
  const cards=[];
  for(let k=0;k<6;k++){const c=k%2,r=Math.floor(k/2);
    const d=el('div','abs',`<div style="position:absolute;left:0;top:0;width:384px;height:146px;background:linear-gradient(135deg,${G[k][0]},${G[k][1]});display:grid;place-items:center"><div style="width:62px;height:62px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center;color:#fff">${svg(ico[k],30,'#fff',2.2)}</div></div><div style="position:absolute;left:14px;top:12px;font:700 17px Inter;color:#fff;background:rgba(5,13,31,.45);padding:4px 12px;border-radius:999px">${pl[k]}</div><div style="position:absolute;left:18px;top:164px;width:300px;height:12px;border-radius:6px;background:#DDE4EF"></div><div style="position:absolute;left:18px;top:188px;width:200px;height:12px;border-radius:6px;background:#E8EDF5"></div><div style="position:absolute;left:18px;top:212px">${pillS('#FFF1D6','#9A6A12','Needs approval','font-size:17px;padding:5px 14px')}</div>`,`left:${34+c*408}px;top:${196+r*280}px;width:384px;height:256px;border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 10px 26px rgba(15,42,85,.14)`);
    p.appendChild(d);cards.push(d);}
  const sc=p.querySelector('.sc');
  return {p,update(t){
    cards.forEach((d,k)=>{const a=eBack(prog(t,4.4+0.12*k,4.4+0.12*k+0.3),1.4);d.style.opacity=clamp(a*2,0,1).toFixed(2);d.style.transform=`scale(${lerp(0.85,1,a).toFixed(3)}) translateY(${((1-a)*30).toFixed(1)}px)`;});
    sc.textContent=Math.min(48,7+Math.max(0,Math.floor((t-5.2)*5)));
  }};
}
function buildCal(){
  const p=basePanel();
  p.innerHTML=hdr('calendar','Today',pillS('#FDE7E8','#C0353A','<span class="cc">1</span> conflicts'));
  const HH=86,TOP=130,hours=['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM'];
  hours.forEach((h,i)=>{p.appendChild(el('div','abs',`<div style="position:absolute;left:30px;top:-12px;font:600 20px Inter;color:#8793A8">${h}</div><div style="position:absolute;left:118px;right:30px;top:0;height:1.5px;background:#E3E9F2"></div>`,`left:0;top:${TOP+i*HH}px;width:860px;height:2px`));});
  const E=[[8.5,1,'Client call','Video',0,'#2C5AA8',0,1],[9.0,1,'Team sync','Office',1,'#D4A64A',2],[10.0,1.5,'Proposal review','Prep',0,'#0F2A55',1],[10.5,1,'Content planning','Social',1,'#6CA6CC',2],[11.5,1,'Vendor meeting','Call',0,'#5B82BF',1],[12.0,1,'Follow-up calls','Clients',1,'#D4A64A',2],[13.0,1,'Budget review','Finance',0,'#2C5AA8',1],[13.5,1,'Interview','Hiring',1,'#98A6C1',2],[14.5,1,'Report deadline','Due',0,'#E5484D',1],[15.0,1,'Podcast prep','Episode',1,'#6CA6CC',2],[16.0,1,'Training','Team',0,'#0F2A55',1]];
  const evs=[];
  E.forEach((e,k)=>{const cols=e[6]==2?2:(E.some((o,j)=>j!=k&&o[0]<e[0]+e[1]&&o[0]+o[1]>e[0])?2:1);const col=e[4];const wTot=704,w=cols==2?wTot/2-6:wTot;
    const d=el('div','abs',`<div style="position:absolute;left:0;top:0;width:8px;height:100%;background:${e[5]}"></div><div style="position:absolute;left:22px;top:10px;font:800 24px Inter;color:#0B1B33;white-space:nowrap">${e[2]}</div><div style="position:absolute;left:22px;top:42px;font:600 19px Inter;color:#6B7A90">${e[3]}</div>`,`left:${118+(cols==2?col*(wTot/2+6):0)}px;top:${TOP+(e[0]-8)*HH+3}px;width:${w}px;height:${e[1]*HH-6}px;border-radius:14px;background:${mixC('#FFFFFF',e[5],0.14)};overflow:hidden;box-shadow:0 6px 16px rgba(15,42,85,.12)`);
    p.appendChild(d);evs.push(d);});
  const cc=p.querySelector('.cc');
  return {p,update(t){
    evs.forEach((d,k)=>{const a=eBack(prog(t,5.0+0.1*k,5.0+0.1*k+0.28),1.5);d.style.opacity=clamp(a*2,0,1).toFixed(2);d.style.transform=`scaleY(${lerp(0.6,1,a).toFixed(3)}) translateX(${((1-a)*40).toFixed(1)}px)`;});
    cc.textContent=1+Math.floor(prog(t,5.0,6.4)*5)+Math.floor(Math.max(0,t-6.4)*2);
  }};
}
function buildFollow(){
  const p=basePanel();
  p.innerHTML=hdr('chat','Follow-ups',pillS('#FDE7E8','#C0353A','<span class="fo">3</span> overdue'))+subbar(['Today','Upcoming','Overdue'].map((t,i)=>tab(t,i==2)).join(''));
  const D=[['Follow up with client','Proposal sent 3 days ago','Overdue','r'],['Send payment reminder','Invoice · Billing','Today','a'],['Confirm tomorrow’s call','Calendar · Client','Today','a'],['Update lead list','Research · Leads','Tomorrow','b'],['Monthly report draft','Reports · Due Friday','Fri','b'],['Update landing page','Website · Needs changes','Overdue','r'],['Submit documents','Admin deadline','Today','a'],['Research competitors','Research','Wed','b'],['Approve social posts','Content · Awaiting you','Overdue','r']];
  const CH={r:['#FDE7E8','#C0353A'],a:['#FFF1D6','#9A6A12'],b:['#E4ECFA','#2B5399']};
  const rows=[];
  D.forEach((d,k)=>{const r=el('div','abs',`<div style="position:absolute;left:36px;top:27px;width:38px;height:38px;border-radius:50%;border:3px solid #BCC8DA"></div><div style="position:absolute;left:96px;top:14px;font:800 27px Inter;color:#0B1B33;white-space:nowrap">${d[0]}</div><div style="position:absolute;left:96px;top:52px;font:500 21px Inter;color:#7A889D;white-space:nowrap">${d[1]}</div><div style="position:absolute;right:36px;top:24px">${pillS(CH[d[3]][0],CH[d[3]][1],d[2],'font-size:19px;padding:6px 16px')}</div>`,`left:0;top:${186+k*94}px;width:860px;height:92px;background:#fff;border-bottom:1.5px solid #E7ECF4`);p.appendChild(r);rows.push(r);});
  const fo=p.querySelector('.fo');
  return {p,update(t){
    rows.forEach((r,k)=>{const a=eO4(prog(t,5.7+0.1*k,5.7+0.1*k+0.3));r.style.opacity=a.toFixed(2);r.style.transform=`translateX(${((1-a)*70).toFixed(1)}px)`;});
    fo.textContent=3+Math.floor(Math.max(0,t-6.3)*3);
  }};
}
function buildReports(){
  const p=basePanel();
  p.innerHTML=hdr('file','Reports',pillS('#FFF1D6','#9A6A12','Due Friday'));
  const T=['Monthly report','Weekly summary','Client report'];
  T.forEach((tt,k)=>p.appendChild(el('div','abs',`<div style="position:absolute;left:30px;top:26px;font:800 30px Inter;color:#0B1B33">${tt}</div><div style="position:absolute;right:30px;top:26px">${pillS('#E6ECF5','#52627A','Draft','font-size:18px;padding:5px 14px')}</div>`+[0,1,2,3].map(i=>`<div style="position:absolute;left:30px;top:${84+i*30}px;width:${[740,690,720,420][i]}px;height:13px;border-radius:7px;background:#E1E8F2"></div>`).join('')+`<div style="position:absolute;left:30px;top:222px;width:360px;height:14px;border-radius:7px;background:#E1E8F2"><div style="width:${[38,22,55][k]}%;height:100%;border-radius:7px;background:#D4A64A"></div></div>`,`left:30px;top:${134+k*296}px;width:800px;height:268px;border-radius:22px;background:#fff;box-shadow:0 10px 26px rgba(15,42,85,.12)`)));
  return {p,update(){}};
}
function buildWeb(){
  const p=basePanel();
  p.innerHTML=hdr('layout','Website',pillS('#FDE7E8','#C0353A','Needs update'))+`<div style="position:absolute;left:36px;top:140px;width:788px;height:620px;border-radius:22px;background:#fff;box-shadow:0 10px 26px rgba(15,42,85,.14);overflow:hidden"><div style="height:56px;background:#EDF1F8;display:flex;align-items:center;gap:10px;padding:0 20px"><i style="width:14px;height:14px;border-radius:50%;background:#E5484D"></i><i style="width:14px;height:14px;border-radius:50%;background:#F2B33D"></i><i style="width:14px;height:14px;border-radius:50%;background:#4CB782"></i><div style="margin-left:20px;flex:1;height:30px;border-radius:15px;background:#fff"></div></div><div style="margin:36px;height:230px;border-radius:18px;background:linear-gradient(135deg,#173A74,#3C6DB8)"></div><div style="margin:0 36px;display:flex;gap:20px"><i style="flex:1;height:150px;border-radius:14px;background:#E1E8F2"></i><i style="flex:1;height:150px;border-radius:14px;background:#E1E8F2"></i><i style="flex:1;height:150px;border-radius:14px;background:#E1E8F2"></i></div></div><div style="position:absolute;left:36px;top:800px;width:788px;height:190px;border-radius:22px;background:#fff;box-shadow:0 10px 26px rgba(15,42,85,.12);padding:24px 30px;font:700 26px Inter;color:#0B1B33">Landing page<div style="margin-top:14px;font:500 21px Inter;color:#7A889D">Banner needs a fix · Copy update pending</div></div>`;
  return {p,update(){}};
}

// ---------- scene 2 ----------
function buildS2(worldL,boardL,txtL){
  const cam=el('div','abs','',`width:1080px;height:1920px;transform-style:preserve-3d;transform-origin:540px 960px`);worldL.appendChild(cam);
  const defs=[['email',buildEmail,0,0],['social',buildSocial,960,-40],['cal',buildCal,1920,30],['follow',buildFollow,2880,-30],
    ['rep',buildReports,480,-1160],['web',buildWeb,1440,-1160],['rep',buildReports,2400,-1160],['web',buildWeb,480,1160],['rep',buildReports,1440,1160],['web',buildWeb,2400,1160]];
  const panels=defs.map((d,i)=>{const o=d[1]();o.x=d[2];o.y=d[3];o.main=i<4;cam.appendChild(o.p);return o;});
  // stops
  const STOPS=[[4.15,0,0],[4.80,960,-40],[5.50,1920,30],[6.10,2880,-30]];
  function camAt(t){
    let x,y;
    if(t<=STOPS[0][0]){x=STOPS[0][1];y=STOPS[0][2];}
    else if(t>=STOPS[3][0]){x=STOPS[3][1];y=STOPS[3][2];}
    else{let i=0;while(t>STOPS[i+1][0])i++;const u=eIO3(prog(t,STOPS[i][0]+0.14,STOPS[i+1][0]));x=lerp(STOPS[i][1],STOPS[i+1][1],u);y=lerp(STOPS[i][2],STOPS[i+1][2],u);}
    const pb=eIO3(prog(t,6.75,8.3));
    x=lerp(x,1440,pb);y=lerp(y,60,pb);
    let z=lerp(-2700,0,eO4(prog(t,3.70,4.45)))+lerp(0,-2150,pb)-120*prog(t,8.3,9.0)+90*prog(t,9.0,10.0);
    return {x,y,z,pb,rx:pb*7,ry:-pb*4};
  }
  // toasts
  const tl=el('div','abs','',`width:1080px;height:1920px;pointer-events:none`);boardL.parentNode.insertBefore(tl,boardL);
  const TD=[[4.30,'mail','#3B6FD6','New email','Client · Quick question',20,1330,-3],[4.62,'image','#D4A64A','Approval needed','Instagram post · Draft',540,1230,2.5],[4.95,'calendar','#5B82BF','Meeting in 10 min','Team sync',-30,1480,-2],[5.25,'chat','#6CA6CC','Reminder','Follow up with client',520,1400,3],[5.50,'mail','#3B6FD6','Invoice question','Billing',60,1170,2],[5.75,'bell','#E5484D','Deadline today','Submit documents',500,1520,-2],[6.00,'users','#98A6C1','New lead','Website form',10,1420,-2.5],[6.25,'file','#D4A64A','Report due Friday','Monthly summary',540,1180,2],[6.50,'layout','#6CA6CC','Website update','Banner needs a fix',-20,1250,-2],[6.72,'mail','#3B6FD6','New email','Vendor · Re: schedule',520,1330,2.5]];
  const toasts=TD.map(d=>{const e=el('div','abs',`<div style="width:56px;height:56px;border-radius:16px;background:${d[2]};display:grid;place-items:center">${svg(d[1],30,'#fff',2.2)}</div><div style="display:flex;flex-direction:column;gap:4px"><b style="font:800 25px Inter;color:#0B1B33">${d[3]}</b><span style="font:500 19px Inter;color:#6B7A90">${d[4]}</span></div><span style="margin-left:auto;font:600 17px Inter;color:#8793A8">now</span>`,`width:520px;height:94px;border-radius:24px;background:rgba(255,255,255,.97);display:none;align-items:center;gap:16px;padding:0 22px;box-shadow:0 22px 50px rgba(0,0,0,.45)`);tl.appendChild(e);return e;});
  // captions
  const shade=el('div','abs','',`width:1080px;height:760px;background:linear-gradient(180deg,rgba(4,10,24,.92) 0%,rgba(4,10,24,.7) 45%,rgba(4,10,24,0) 100%);opacity:0`);txtL.appendChild(shade);
  const WORDS=[['EMAILS.',4.12,4.78],['CONTENT.',4.78,5.46],['ADMIN.',5.46,6.08],['FOLLOW-UPS.',6.08,6.95]];
  const caps=WORDS.map(w=>{const L=lockup([{t:w[0],html:w[0].slice(0,-1)+'<i class="gold">.</i>',cap:128}],{maxW:900}).place(300);txtL.appendChild(L.box);return L;});
  const nev=lockup([{t:'IT NEVER',cap:260},{t:'STOPS.',cap:300,cls:'gold'}],{gap:36,maxW:900}).place(960);
  const dark=el('div','abs','',`width:1080px;height:1920px;background:radial-gradient(ellipse 75% 45% at 50% 50%,rgba(3,8,20,.82),rgba(3,8,20,0) 100%);opacity:0`);
  txtL.appendChild(dark);txtL.appendChild(nev.box);
  // ---- cards ----
  CAMG=el('div','abs','',`width:1080px;height:1920px;transform-style:preserve-3d;transform-origin:540px 1130px`);
  boardL.style.perspective='1700px';boardL.style.perspectiveOrigin='540px 960px';boardL.appendChild(CAMG);
  BOARD_G=el('div','abs','',`width:1080px;height:1920px`);
  CARDS_G=el('div','abs','',`width:1080px;height:1920px;transform-style:preserve-3d`);
  CAMG.appendChild(BOARD_G);CAMG.appendChild(CARDS_G);
  const R=rng(23),cards=[];
  const all=[];
  LANES.forEach((L,li)=>L.cards.forEach((c,k)=>all.push({title:c[0],sub:c[1],icon:c[2],lane:li,k,col:L.col,anchor:true})));
  EXTRAS.forEach(e=>all.push({title:e[0],sub:e[3],icon:e[2],lane:e[1],k:2,col:LANES[e[1]].col,anchor:false}));
  const order=all.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  all.forEach((c,i)=>{
    const d=el('div','card',`<div class="cbar" style="background:${c.col}"></div><div class="cic" style="background:${c.col}26">${svg(c.icon,24,c.col,2.2)}</div><div class="ctx"><b>${c.title}</b><span>${c.sub}</span></div><div class="cchk"><span style="opacity:0">${svg('check',20,'#fff',3.4)}</span></div>`);
    CARDS_G.appendChild(d);
    const cell=order.indexOf(i),cx=cell%3,cy=Math.floor(cell/3);
    c.el=d;c.chk=d.querySelector('.cchk');c.tick=d.querySelector('.cchk span');
    c.cx=-150+cx*330+R()*120;c.cy=120+cy*128+R()*60;c.cz=-250+R()*600;c.rot=(R()-.5)*30;c.ry=(R()-.5)*26;c.s=0.95+R()*0.5;c.ph=R()*6.28;
    const u=cell/35;c.ta=7.0+1.85*(1-Math.pow(1-u,1.5));
    const [lx,ly]=laneXY(c.lane);
    if(c.anchor){c.lx=lx+20;c.ly=ly+64+c.k*74;c.ord=c.lane*5+c.k;c.st=10.0+0.032*c.ord;}
    else{c.lx=lx+20;c.ly=ly+64+2*74;c.ord=i-20;c.st=10.0+0.03*c.ord;}
  });
  function cardsUpdate(t){
    const vis=t>6.95&&t<14.5;CARDS_G.style.display=vis?'block':'none';if(!vis)return;
    const tt=Math.min(t,9.0);
    all.forEach(c=>{
      const ap=eBack(prog(t,c.ta,c.ta+0.28),1.7),e=eIO3(prog(t,c.st,c.st+0.85));
      const fx=7*Math.sin(tt*2.1+c.ph),fy=7*Math.cos(tt*1.7+c.ph);
      const x=lerp(c.cx+fx,c.lx,e),y=lerp(c.cy+fy,c.ly,e),z=lerp(c.cz,0,e),rz=lerp(c.rot,0,e),ry=lerp(c.ry,0,e);
      let sc=lerp(c.s,1,e)*lerp(0.5,1,ap),op=clamp(ap*1.8,0,1);
      let dy=0;
      if(c.anchor){const fo=eI2(prog(t,13.72+0.022*c.ord,13.72+0.022*c.ord+0.3));op*=1-fo;dy=14*fo;
        const ca=an(t,11.8+0.075*c.ord,0.26,eBack);c.chk.style.background=mixC('#FFFFFF','#D4A64A',clamp(ca,0,1));c.chk.style.borderColor=mixC('#CBD5E3','#D4A64A',clamp(ca,0,1));c.tick.style.opacity=clamp(ca,0,1);}
      else{sc*=lerp(1,0.6,e);op*=1-prog(e,0.55,1);}
      c.el.style.opacity=op.toFixed(3);
      c.el.style.transform=`translate3d(${x.toFixed(1)}px,${(y+dy).toFixed(1)}px,${z.toFixed(1)}px) rotateZ(${rz.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    });
  }
  function boardCamUpdate(t){
    const vis=t>6.95&&t<19.4;boardL.style.display=vis?'block':'none';if(!vis)return;
    let s,rx=0,ry=0,rz=0,op=1;
    if(t<9.0){s=1.28+0.02*prog(t,7,9);}
    else if(t<10.0){s=1.30+0.045*eIO2(prog(t,9,10));rz=0.6*prog(t,9,10);}
    else if(t<11.7){const u=eIO3(prog(t,10.0,11.7));s=lerp(1.345,1.0,u);rx=lerp(5,0,u);rz=lerp(0.6,0,u);}
    else if(t<18.6){s=1.0+0.03*prog(t,11.7,18.6);ry=lerp(-1.6,1.4,prog(t,11.7,14))+lerp(0,-3.2,prog(t,14,18.6));rx=lerp(0,1.6,prog(t,14,17));}
    else{const u=eI3(prog(t,18.62,19.26));s=lerp(1.03,0.07,u);ry=lerp(-1.8,40,u);op=1-prog(t,18.95,19.28);rx=1.6;}
    CAMG.style.transform=`rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${s.toFixed(4)})`;
    boardL.style.opacity=op.toFixed(3);
  }
  return {update(t){
    // world
    const wvis=t>3.65&&t<10.95;worldL.style.display=wvis?'block':'none';
    if(wvis){
      const tw=Math.min(t,9.0),c=camAt(t);
      cam.style.transform=`rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) translate3d(${(-c.x).toFixed(1)}px,${(-c.y).toFixed(1)}px,${c.z.toFixed(1)}px)`;
      panels.forEach(o=>{o.update(tw);
        const dx=Math.abs(o.x-c.x)/960;const bl=o.main?(1-c.pb)*7*clamp(dx,0,1)+c.pb*2:2.5;
        o.p.style.transform=`translate3d(${o.x}px,${o.y}px,0) rotateY(-14deg)`;
        o.p.style.filter=bl>0.3?`blur(${bl.toFixed(1)}px)`:'none';o.p.style.opacity=o.main?1:clamp((c.pb-0.1)*2.2,0,1).toFixed(2);});
      worldL.style.opacity=(prog(t,3.78,4.28)*(1-prog(t,10.0,10.9))).toFixed(3);
      const fz=prog(t,9.0,9.25)*0.25;
      worldL.style.filter=t>9.0?`saturate(${(1-fz*1.6).toFixed(2)}) brightness(${(1-fz*0.6).toFixed(2)})`:'none';
    }
    // toasts
    toasts.forEach((e,i)=>{const t0=TD[i][0],a=eBack(prog(t,t0,t0+0.24),1.5),b=eI2(prog(t,t0+1.0,t0+1.3));
      const on=t>t0&&t<t0+1.35;e.style.display=on?'flex':'none';if(!on)return;
      e.style.opacity=(clamp(a*2,0,1)*(1-b)).toFixed(2);
      e.style.transform=`translate(${TD[i][5]+b*80}px,${TD[i][6]+(1-a)*50}px) rotate(${TD[i][7]}deg) scale(${lerp(0.8,1,a).toFixed(3)})`;});
    // captions
    caps.forEach((L,i)=>{const w=WORDS[i];L.box.style.display=(t>w[1]-0.05&&t<w[2]+0.5)?'block':'none';maskLines(L.items,t,w[1],w[2],0,0.38,0.24);});
    shade.style.opacity=(prog(t,4.0,4.3)*(1-prog(t,6.9,7.3))).toFixed(3);
    // it never stops
    nev.box.style.display=(t>7.0&&t<10.3)?'block':'none';
    maskLines(nev.items,t,7.05,9.8,0.17,0.5,0.35);
    dark.style.opacity=(prog(t,7.0,7.5)*(1-prog(t,9.8,10.3))).toFixed(3);
    cardsUpdate(t);boardCamUpdate(t);
  }};
}
