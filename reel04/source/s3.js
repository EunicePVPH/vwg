// ================= SCENE 3 (9-14s) board + headlines  &  SCENE 4 (14-19s) service tiles =================
function buildS3(boardL,txtL){
  const tiles=[],ui=[];
  const mk=(html,style)=>el('div','abs',html,style);
  const chipS=(bg,fg,txt,extra='')=>`<span style="display:inline-flex;align-items:center;gap:6px;border-radius:999px;font:700 14px Inter;padding:4px 12px;background:${bg};color:${fg};white-space:nowrap;${extra}">${txt}</span>`;
  const lbl=(txt,style)=>mk(`<span style="font:800 15px Inter;letter-spacing:.14em;color:#A9BBDA">${txt}</span>`,style);
  LANES.forEach((L,i)=>{
    const [x,y]=laneXY(i);
    const t=mk(`<div style="position:absolute;left:20px;top:0;height:56px;display:flex;align-items:center;gap:12px"><div style="width:34px;height:34px;border-radius:10px;background:${L.col};display:grid;place-items:center">${svg(L.icon,20,'#0A1D3F',2.4)}</div><div class="disp" style="font-weight:800;font-size:19px;letter-spacing:.07em;color:#fff">${L.name}</div></div><div class="cnt" style="position:absolute;right:18px;top:12px;font:800 16px Inter;color:#DCE6F7;background:rgba(255,255,255,.12);padding:4px 12px;border-radius:999px">0/5</div><div style="position:absolute;left:20px;right:20px;top:55px;height:1.5px;background:rgba(255,255,255,.14)"></div>`,
      `left:${x}px;top:${y}px;width:${TW}px;height:${TH}px;border-radius:30px;background:linear-gradient(160deg,rgba(255,255,255,.12),rgba(255,255,255,.05));box-shadow:0 30px 70px rgba(0,0,0,.4),inset 0 0 0 1.5px rgba(255,255,255,.16);opacity:0`);
    const tc=mk('',`left:0;top:56px;width:${TW}px;height:384px;opacity:0`);t.appendChild(tc);
    BOARD_G.appendChild(t);tiles.push({t,tc,cnt:t.querySelector('.cnt'),L});
  });
  // gold coordination cross in the gutters
  const ns='http://www.w3.org/2000/svg';
  const sv=document.createElementNS(ns,'svg');sv.setAttribute('width',1080);sv.setAttribute('height',1920);sv.style.cssText='position:absolute;left:0;top:0;overflow:visible';
  sv.innerHTML=`<defs><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#F0CB78" stop-opacity="0"/><stop offset=".5" stop-color="#F6D98C"/><stop offset="1" stop-color="#F0CB78" stop-opacity="0"/></linearGradient></defs><line id="lh" x1="540" y1="1130" x2="540" y2="1130" stroke="#F0CB78" stroke-width="4" stroke-linecap="round"/><line id="lv" x1="540" y1="1130" x2="540" y2="1130" stroke="#F0CB78" stroke-width="4" stroke-linecap="round"/><circle id="hub" cx="540" cy="1130" r="0" fill="#F6D98C"/><circle id="hubr" cx="540" cy="1130" r="0" fill="none" stroke="#F6D98C" stroke-width="3"/>`;
  BOARD_G.appendChild(sv);
  const lh=sv.querySelector('#lh'),lv=sv.querySelector('#lv'),hub=sv.querySelector('#hub'),hubr=sv.querySelector('#hubr');

  // ===== mini interfaces =====
  const rowCard=(k,top)=>mk('',`left:16px;top:${top}px;width:448px;height:52px;border-radius:12px;background:#F6F8FC;box-shadow:0 6px 14px rgba(0,0,0,.25)`);
  // ADMIN
  (function(){
    const tc=tiles[0].tc;
    const hd=lbl('INBOX','left:20px;top:12px'),cnt=mk('','right:20px;top:6px');tc.appendChild(hd);tc.appendChild(cnt);
    const D=[['Client inquiry','Quick question about the project…','C','#3B6FD6','Client'],['Billing question','Payment due this Friday…','B','#D4A64A','Billing'],['Team update','Notes from today’s meeting…','T','#5B82BF','Team'],['Vendor invoice','Receipt attached for your records…','V','#6CA6CC','Vendor']];
    const rows=D.map((d,k)=>{const r=rowCard(k,46+k*58);r.innerHTML=`<div style="position:absolute;left:10px;top:9px;width:34px;height:34px;border-radius:50%;background:${d[3]};color:#fff;font:800 16px Inter;display:grid;place-items:center">${d[2]}</div><div style="position:absolute;left:56px;top:6px;font:800 18px Inter;color:#0B1B33">${d[0]}</div><div style="position:absolute;left:56px;top:29px;font:500 14px Inter;color:#7A889D;white-space:nowrap">${d[1]}</div><div class="dot" style="position:absolute;right:16px;top:21px;width:10px;height:10px;border-radius:50%;background:#2F6BDB"></div><div class="chip" style="position:absolute;right:12px;top:13px;opacity:0">${chipS(mixC('#FFFFFF',d[3],.18),d[3]==='#D4A64A'?'#8A6210':'#1D3F7A',svg('check',13,'currentColor',3.4)+d[4])}</div>`;tc.appendChild(r);return r;});
    tc.appendChild(lbl('TODAY','left:20px;top:290px'));
    const B=[['Client call','#2C5AA8',[40,-6,-5]],['Team sync','#D4A64A',[130,8,3]],['Review','#6CA6CC',[230,-2,-3]]];
    const blocks=B.map((b,k)=>{const e=mk(`<div style="position:absolute;left:0;top:0;width:7px;height:100%;background:${b[1]}"></div><div style="position:absolute;left:18px;top:8px;font:800 17px Inter;color:#0B1B33">${b[0]}</div><div style="position:absolute;left:18px;top:29px;font:600 13px Inter;color:#7A889D">${['9:00 AM','11:00 AM','2:00 PM'][k]}</div>`,`top:316px;height:52px;border-radius:12px;background:${mixC('#FFFFFF',b[1],.16)};box-shadow:0 6px 14px rgba(0,0,0,.25);overflow:hidden`);tc.appendChild(e);return e;});
    ui.push(t=>{
      const n=Math.round(12*(1-prog(t,14.45,15.4)));
      cnt.innerHTML=n>0?chipS('rgba(255,255,255,.14)','#E3ECFB',`${n} unread`,'font-size:15px'):chipS('#E7BE68','#3A2A07',svg('check',14,'#3A2A07',3.4)+'All sorted','font-size:15px');
      rows.forEach((r,k)=>{const a=an(t,14.55+0.2*k,0.25,eBack);r.querySelector('.chip').style.opacity=clamp(a,0,1);r.querySelector('.chip').style.transform=`translateX(${(1-clamp(a,0,1))*24}px)`;r.querySelector('.dot').style.opacity=1-clamp(a*2,0,1);});
      blocks.forEach((b,k)=>{const u=an(t,15.1+0.12*k,0.42,eIO3);const m=B[k][2];
        b.style.left=lerp(m[0],16+k*156,u)+'px';b.style.width=lerp(150,136,u)+'px';b.style.transform=`translateY(${lerp(m[1],0,u)}px) rotate(${lerp(m[2],0,u)}deg)`;});
    });
  })();
  // SOCIAL
  (function(){
    const tc=tiles[1].tc;const days=['MON','TUE','WED','THU','FRI'];
    const dchips=days.map((d,i)=>{const e=mk(d,`left:${16+i*90}px;top:6px;width:82px;height:30px;border-radius:15px;text-align:center;line-height:30px;font:800 13px Inter;letter-spacing:.08em`);tc.appendChild(e);return e;});
    const G=[['#173A74','#3C6DB8'],['#C9962F','#F0CB78'],['#2B4770','#6E8FC1'],['#0F2A55','#1E4A8F'],['#B98A2A','#E8C06A'],['#35507A','#7CA0CF']];
    const T=['MON 9AM','TUE 12PM','WED 9AM','THU 5PM','FRI 9AM','FRI 12PM'];
    const th=G.map((g,k)=>{const c=k%3,r=Math.floor(k/3);
      const e=mk(`<div style="position:absolute;inset:0;background:linear-gradient(135deg,${g[0]},${g[1]});display:grid;place-items:center"><div style="width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center">${svg(k%2?'image':'play',22,'#fff',2.2)}</div></div><div class="ch" style="position:absolute;left:8px;bottom:8px"></div>`,`left:${16+c*152}px;top:${48+r*142}px;width:144px;height:132px;border-radius:16px;overflow:hidden;box-shadow:0 8px 18px rgba(0,0,0,.3)`);
      tc.appendChild(e);return e;});
    const cl=mk('','left:20px;top:340px');tc.appendChild(cl);
    ui.push(t=>{
      let n=0;
      th.forEach((e,k)=>{const ts=15.3+0.17*k,a=an(t,ts,0.3,eBack);const done=t>ts+0.05;if(done)n++;
        e.querySelector('.ch').innerHTML=done?chipS('#E7BE68','#3A2A07',svg('clock',12,'#3A2A07',3)+T[k],'font-size:12px;padding:3px 9px'):chipS('rgba(5,13,31,.5)','#E3ECFB','Draft','font-size:12px;padding:3px 9px');
        e.style.transform=`scale(${1+0.07*Math.max(0,Math.sin(Math.PI*prog(t,ts,ts+0.3)))})`;});
      dchips.forEach((e,i)=>{const on=t>15.3+0.17*i+0.05;e.style.background=on?'#E7BE68':'rgba(255,255,255,.1)';e.style.color=on?'#3A2A07':'#C9D6EE';});
      cl.innerHTML=`<span style="font:800 17px Inter;color:${n==6?'#F0CB78':'#C9D6EE'}">${n} of 6 scheduled</span>`;
    });
  })();
  // RESEARCH & LEADS
  (function(){
    const tc=tiles[2].tc;
    const doc=mk(`<div style="position:absolute;left:16px;top:12px">${svg('file',24,'#2C5AA8',2.2)}</div><div style="position:absolute;left:50px;top:12px;font:800 18px Inter;color:#0B1B33">Market research</div><div class="dn" style="position:absolute;right:14px;top:10px;opacity:0">${chipS('#E7BE68','#3A2A07',svg('check',13,'#3A2A07',3.4)+'Documented','font-size:13px')}</div>`,`left:16px;top:8px;width:448px;height:172px;border-radius:14px;background:#F6F8FC;box-shadow:0 8px 18px rgba(0,0,0,.28)`);
    const W=[380,350,396,300,340],bars=W.map((w,k)=>{const b=mk(([0,2].includes(k)?`<div style="position:absolute;left:0;top:-2px;width:42%;height:14px;border-radius:4px;background:#F4D98F;opacity:.85"></div>`:'')+`<div class="f" style="position:absolute;left:0;top:0;height:10px;border-radius:5px;background:#CBD5E3;width:0"></div>`,`left:16px;top:${54+k*23}px;width:${w}px;height:10px`);doc.appendChild(b);return b;});
    tc.appendChild(doc);
    tc.appendChild(lbl('LEADS','left:20px;top:192px'));
    const R=[[120,80],[150,96],[104,70]],rows=R.map((r,k)=>{const e=mk(`<div style="position:absolute;left:10px;top:9px;width:30px;height:30px;border-radius:50%;background:#B9C5DA"></div><div style="position:absolute;left:52px;top:11px;width:${r[0]}px;height:10px;border-radius:5px;background:#C3CEE0"></div><div style="position:absolute;left:52px;top:28px;width:${r[1]}px;height:8px;border-radius:4px;background:#E1E8F2"></div><div class="ad" style="position:absolute;right:12px;top:11px;opacity:0">${chipS('#E7BE68','#3A2A07',svg('check',12,'#3A2A07',3.4)+'Added','font-size:13px')}</div>`,`left:16px;top:${218+k*54}px;width:448px;height:48px;border-radius:12px;background:#F6F8FC;box-shadow:0 6px 14px rgba(0,0,0,.25)`);tc.appendChild(e);return e;});
    ui.push(t=>{
      bars.forEach((b,k)=>{b.querySelector('.f').style.width=(W[k]*an(t,16.0+0.12*k,0.4,eO3))+'px';});
      doc.querySelector('.dn').style.opacity=clamp(an(t,16.7,0.25),0,1);
      rows.forEach((r,k)=>{const a=an(t,16.8+0.15*k,0.3,eBack);const ad=r.querySelector('.ad');ad.style.opacity=clamp(a,0,1);ad.style.transform=`scale(${lerp(0.7,1,clamp(a,0,1.2))})`;});
    });
  })();
  // DIGITAL OPERATIONS
  (function(){
    const tc=tiles[3].tc;
    const web=mk(`<div style="height:26px;background:#E6ECF5;display:flex;align-items:center;gap:6px;padding:0 12px"><i style="width:9px;height:9px;border-radius:50%;background:#E5484D"></i><i style="width:9px;height:9px;border-radius:50%;background:#F2B33D"></i><i style="width:9px;height:9px;border-radius:50%;background:#4CB782"></i><div style="margin-left:10px;flex:1;height:14px;border-radius:7px;background:#fff"></div></div><div style="position:absolute;left:16px;top:42px;width:196px;height:112px;border-radius:12px;background:linear-gradient(135deg,#173A74,#3C6DB8)"></div><div style="position:absolute;left:230px;top:46px;width:190px;height:14px;border-radius:7px;background:#B9C5DA"></div><div style="position:absolute;left:230px;top:70px;width:140px;height:14px;border-radius:7px;background:#CBD5E3"></div><div style="position:absolute;left:230px;top:100px;width:96px;height:30px;border-radius:15px;background:#D4A64A"></div>`,`left:16px;top:8px;width:448px;height:166px;border-radius:14px;background:#F6F8FC;box-shadow:0 8px 18px rgba(0,0,0,.28);overflow:hidden`);
    tc.appendChild(web);
    const pr=mk(`<div class="pl" style="position:absolute;left:0;top:0;font:700 15px Inter;color:#C9D6EE;line-height:26px"></div><div style="position:absolute;right:0;top:7px;width:230px;height:12px;border-radius:6px;background:rgba(255,255,255,.14)"><div class="pf" style="width:0;height:100%;border-radius:6px;background:#E7BE68"></div></div>`,`left:20px;top:184px;width:440px;height:26px`);tc.appendChild(pr);
    const items=['Landing page','Monthly report','Show notes'].map((s,k)=>{const e=mk(`<div class="ck" style="position:absolute;left:12px;top:10px;width:24px;height:24px;border-radius:50%;border:2.5px solid #BCC8DA;display:grid;place-items:center"><span style="opacity:0">${svg('check',14,'#3A2A07',3.6)}</span></div><div style="position:absolute;left:50px;top:11px;font:800 17px Inter;color:#0B1B33">${s}</div><div class="st" style="position:absolute;right:12px;top:8px"></div>`,`left:16px;top:${222+k*50}px;width:448px;height:44px;border-radius:12px;background:#F6F8FC;box-shadow:0 6px 14px rgba(0,0,0,.25)`);tc.appendChild(e);return e;});
    ui.push(t=>{
      const u=prog(t,16.85,17.55);pr.querySelector('.pf').style.width=(u*100)+'%';
      pr.querySelector('.pl').innerHTML=u<1?'Updating landing page…':'<span style="color:#F0CB78">Published ✓</span>';
      items.forEach((e,k)=>{const a=clamp(an(t,17.6+0.15*k,0.28,eBack),0,1.2),ck=e.querySelector('.ck');const on=clamp(a,0,1);
        ck.style.background=mixC('#F6F8FC','#E7BE68',on);ck.style.borderColor=mixC('#BCC8DA','#E7BE68',on);ck.firstChild.style.opacity=on;
        e.querySelector('.st').innerHTML=on>0.5?chipS('#FFF1D6','#8A6210','Done','font-size:13px'):'';});
    });
  })();

  // ===== headlines =====
  const H=(lines,cy)=>{const L=lockup(lines.map((t,i)=>({t,cap:138,cls:i==2?'gold':'white'})),{gap:30,maxW:920,uniform:true}).place(cy);txtL.appendChild(L.box);return L;};
  const shade2=el('div','abs','',`width:1080px;height:760px;background:linear-gradient(180deg,rgba(5,13,30,.95) 0%,rgba(5,13,30,.8) 50%,rgba(5,13,30,0) 100%);opacity:0`);txtL.appendChild(shade2);
  const HA=H(['YOU DON’T','HAVE TO','DO IT ALL.'],440),HB=H(['LESS TIME','JUGGLING','TASKS.'],440),HC=H(['MORE TIME','FOR WHAT','MATTERS.'],440);
  const ul=el('div','abs','',`left:300px;top:${parseFloat(HA.box.style.top)+HA.total+8}px;width:480px;height:6px;border-radius:3px;background:linear-gradient(90deg,rgba(214,168,76,0),#F6D98C,rgba(214,168,76,0));transform-origin:50% 50%;opacity:0`);
  txtL.appendChild(ul);
  const winP=[[14.3,15.6],[15.1,16.4],[15.9,17.2],[16.7,18.0]];
  const pulse=(t,w)=>eO3(prog(t,w[0],w[0]+0.2))*(1-eI2(prog(t,w[1]-0.25,w[1])));
  return {update(t){
    // tiles
    const bvis=t>10.1&&t<19.4;BOARD_G.style.display=bvis?'block':'none';
    if(bvis){
      let any=0;winP.forEach(w=>{any=Math.max(any,pulse(t,w));});
      const allOn=an(t,18.0,0.3);
      tiles.forEach((o,i)=>{
        const a=an(t,10.2+0.08*i,0.55,eO4);
        const p=pulse(t,winP[i]);
        const pp=Math.max(p,allOn*0.55);
        const dim=t>14.2&&t<18.0?lerp(1,0.78,any*(1-p)):1;
        o.t.style.opacity=(a*dim).toFixed(3);
        o.t.style.transform=`translateY(${((1-a)*40-8*pp).toFixed(1)}px) scale(${(1+0.022*pp).toFixed(4)})`;
        o.t.style.boxShadow=`0 30px 70px rgba(0,0,0,.4),0 0 0 ${(2.5*pp).toFixed(1)}px rgba(240,203,120,${(0.95*pp).toFixed(2)}),0 0 ${(60*pp).toFixed(0)}px rgba(240,203,120,${(0.32*pp).toFixed(2)}),inset 0 0 0 1.5px rgba(255,255,255,.16)`;
        o.tc.style.opacity=an(t,13.8+0.06*i,0.4).toFixed(3);
        let done=0;for(let k=0;k<5;k++){if(t>11.8+0.075*(i*5+k)+0.13)done++;}
        o.cnt.textContent=done+'/5';o.cnt.style.background=done==5?'rgba(231,190,104,.95)':'rgba(255,255,255,.12)';o.cnt.style.color=done==5?'#3A2A07':'#DCE6F7';
      });
      if(t>13.7)ui.forEach(f=>f(t));
      // gold cross + hub
      const c=eIO3(prog(t,18.0,18.55));
      lh.setAttribute('x1',540-500*c);lh.setAttribute('x2',540+500*c);lh.setAttribute('y1',1130);lh.setAttribute('y2',1130);
      lv.setAttribute('x1',540);lv.setAttribute('x2',540);lv.setAttribute('y1',1130-460*c);lv.setAttribute('y2',1130+460*c);
      const lo=(t>18.0?1:0)*(1-prog(t,18.9,19.2));lh.style.opacity=lv.style.opacity=lo;
      hub.setAttribute('r',22*an(t,18.0,0.35,eBack)*(t>18.0?1:0));hub.style.opacity=lo;
      const rp=prog(t,18.35,19.1);hubr.setAttribute('r',22+160*eO3(rp));hubr.style.opacity=(rp>0&&rp<1)?(1-rp):0;
    }
    shade2.style.opacity=(prog(t,10.15,10.45)*(1-prog(t,11.25,11.9))).toFixed(3);
    // headlines
    HA.box.style.display=(t>10.3&&t<14.2)?'block':'none';maskLines(HA.items,t,10.38,13.72,0.14,0.62,0.35);
    HB.box.style.display=(t>14.15&&t<17.2)?'block':'none';maskLines(HB.items,t,14.22,16.76,0.12,0.6,0.32);
    HC.box.style.display=(t>16.9&&t<19.2)?'block':'none';maskLines(HC.items,t,17.0,18.62,0.12,0.6,0.3);
    ul.style.opacity=(t>10.9&&t<14.0)?(1-prog(t,13.6,13.95)).toFixed(2):0;ul.style.transform=`scaleX(${eIO3(prog(t,11.0,11.7)).toFixed(3)})`;
  }};
}
