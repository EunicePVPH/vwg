// ================= SCENE 5: BRAND REVEAL + CTA (19-25s) =================
function buildS5(txtL){
  const box=el('div','abs','',`width:1080px;height:1920px;display:none`);
  const cam=el('div','abs','',`width:1080px;height:1920px;transform-origin:540px 900px`);box.appendChild(cam);
  const flare=el('div','abs','',`left:140px;top:360px;width:800px;height:1080px;background:radial-gradient(ellipse at 50% 50%,rgba(255,226,160,.95) 0%,rgba(240,190,95,.45) 30%,rgba(214,168,76,0) 70%);opacity:0;transform-origin:50% 50%`);
  const streak=el('div','abs','',`left:0;top:897px;width:1080px;height:5px;background:linear-gradient(90deg,rgba(246,217,140,0),#FFF1C9 50%,rgba(246,217,140,0));filter:blur(2px);opacity:0;transform-origin:50% 50%`);
  const frame=el('div','abs','',`left:40px;top:150px;width:1000px;height:1620px;border-radius:44px;border:2px solid rgba(240,203,120,.5);opacity:0`);
  cam.appendChild(frame);cam.appendChild(flare);cam.appendChild(streak);
  // wordmark
  const wm=lockup([{t:'PROVIRTUAL',cap:200,letters:true,ls:0.02,cls:'white'},{t:'PH',cap:200,letters:true,ls:0.06,cls:'gold'}],{gap:26,maxW:900,uniform:true}).place(960);
  const wmTop=parseFloat(wm.box.style.top);
  const ph=wm.items[1];const phCy=ph.y+ph.mh/2;
  const phW=measure('PH',0.06)*ph.fs/100;
  const hl=el('div','abs','',`left:${540+phW/2+34}px;top:${phCy-2}px;width:210px;height:4px;border-radius:2px;background:linear-gradient(90deg,#F6D98C,rgba(214,168,76,0));transform-origin:0 50%`);
  const hr=el('div','abs','',`left:${540-phW/2-34-210}px;top:${phCy-2}px;width:210px;height:4px;border-radius:2px;background:linear-gradient(270deg,#F6D98C,rgba(214,168,76,0));transform-origin:100% 50%`);
  wm.box.appendChild(hl);wm.box.appendChild(hr);
  const glint=el('div','abs','',`left:0;top:-30px;width:90px;height:${wm.total+60}px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));filter:blur(8px);transform:skewX(-20deg);opacity:0`);
  wm.box.appendChild(glint);
  wm.box.style.transformOrigin='540px '+(wm.total/2)+'px';
  cam.appendChild(wm.box);
  // tagline
  const tg=lockup([{t:'YOUR BUSINESS.',cap:90,ls:0.02,cls:'white'},{t:'BACKED BY SUPPORT.',cap:90,ls:0.02,cls:'gold'}],{gap:22,maxW:900,uniform:true}).place(960);
  tg.box.style.transformOrigin='540px '+(tg.total/2)+'px';cam.appendChild(tg.box);
  // CTA
  const cta=lockup([{t:'READY TO',cap:170,cls:'white'},{t:'DELEGATE?',cap:170,cls:'gold'}],{gap:24,maxW:900,uniform:true}).place(960);
  cam.appendChild(cta.box);
  const pill=el('div','abs',`<div style="display:flex;align-items:center;justify-content:center;gap:18px;height:100%;position:relative;z-index:2">${svg('chat',46,'#0A1D3F',2.4)}<span class="disp" style="font-weight:800;font-size:37px;letter-spacing:.015em;color:#0A1D3F">DM “SUPPORT” TO GET STARTED.</span></div><div class="sh" style="position:absolute;top:0;left:0;width:150px;height:100%;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.65),rgba(255,255,255,0));transform:skewX(-20deg);z-index:3"></div>`,
    `left:70px;top:1254px;width:940px;height:132px;border-radius:66px;background:linear-gradient(180deg,#FFE9AE 0%,#E9BE63 45%,#C79230 100%);overflow:hidden;opacity:0;transform-origin:50% 50%`);
  const pillW=el('div','abs','',`width:1080px;height:1920px;`);pillW.appendChild(pill);cam.appendChild(pillW);
  const sh=pill.querySelector('.sh');
  txtL.appendChild(box);
  const WM_A=900,WM_B=580,TG_A=1215,TG_B=785,MV=[21.5,22.2];
  return {update(t){
    const vis=t>18.9;box.style.display=vis?'block':'none';if(!vis)return;
    cam.style.transform=`scale(${(1+0.05*prog(t,19,25)).toFixed(4)})`;
    // light
    const fa=prog(t,18.95,19.35)*(1-prog(t,19.5,20.6));
    flare.style.opacity=clamp(fa,0,1).toFixed(3);flare.style.transform=`scale(${lerp(0.25,1.6,eO3(prog(t,18.95,19.9))).toFixed(3)})`;
    const sa=Math.sin(Math.PI*prog(t,19.15,20.5));streak.style.opacity=clamp(sa,0,1).toFixed(3);streak.style.transform=`translateY(${WM_A-900+(1-prog(t,22,22.8)>0?0:0)}px) scaleX(${lerp(0.15,1,eO3(prog(t,19.15,19.9))).toFixed(3)})`;
    frame.style.opacity=(0.9*an(t,19.7,0.8,eO3)).toFixed(3);
    // wordmark
    const m=eIO3(prog(t,MV[0],MV[1]));const wcy=lerp(WM_A,WM_B,m),wsc=lerp(1,0.78,m);
    wm.box.style.transform=`translateY(${(wcy-960).toFixed(1)}px) scale(${wsc.toFixed(4)})`;
    const rf=0.22*(1-prog(t,21.2,21.5));
    wm.box.style.webkitBoxReflect=rf>0.01?`below 14px linear-gradient(to bottom,rgba(255,255,255,0) 52%,rgba(255,255,255,${rf.toFixed(3)}))`:'none';
    wm.items[0].spans.forEach((s,i)=>{const a=eO4(prog(t,19.18+0.045*i,19.18+0.045*i+0.55));s.style.transform=`translateY(${((1-a)*(wm.items[0].mh*1.3)).toFixed(1)}px) rotateX(${((1-a)*-50).toFixed(1)}deg)`;s.style.opacity=clamp(a*3,0,1);});
    wm.items[1].spans.forEach((s,i)=>{const a=eO4(prog(t,19.62+0.1*i,19.62+0.1*i+0.55));s.style.transform=`translateY(${((1-a)*(wm.items[1].mh*1.3)).toFixed(1)}px) rotateX(${((1-a)*-50).toFixed(1)}deg)`;s.style.opacity=clamp(a*3,0,1);});
    const hlS=eIO3(prog(t,19.95,20.5));hl.style.transform=`scaleX(${hlS.toFixed(3)})`;hr.style.transform=`scaleX(${hlS.toFixed(3)})`;
    // glint across the wordmark on "ProVirtual PH"
    const gp=prog(t,20.7,21.35);glint.style.opacity=(Math.sin(Math.PI*gp)*0.35).toFixed(3);glint.style.left=lerp(-120,1100,eIO2(gp))+'px';
    // gold shine on PH letters
    const sp=prog(t,20.75,21.4);wm.items[1].spans.forEach(sp2=>sp2.style.backgroundImage=`linear-gradient(105deg,rgba(255,255,255,0) ${(sp*170-40).toFixed(1)}%,rgba(255,255,255,.95) ${(sp*170-28).toFixed(1)}%,rgba(255,255,255,0) ${(sp*170-14).toFixed(1)}%),linear-gradient(180deg,#FFEFC2 0%,#EDC36A 34%,#CC9832 68%,#96691D 100%)`);
    // tagline
    const tcy=lerp(TG_A,TG_B,m),tsc=lerp(1,0.92,m);
    tg.box.style.transform=`translateY(${(tcy-960).toFixed(1)}px) scale(${tsc.toFixed(4)})`;
    tg.box.style.display=t>20.8?'block':'none';
    maskLines(tg.items,t,20.88,99,0.42,0.55,0.3);
    // CTA
    cta.box.style.transform=`translateY(${(1030-960)}px)`;
    cta.box.style.display=t>22.1?'block':'none';
    maskLines(cta.items,t,22.28,99,0.15,0.6,0.3);
    // pill
    const pa=eBack(prog(t,22.5,23.0),1.3);
    pill.style.opacity=clamp(pa*2,0,1).toFixed(3);pill.style.transform=`translateY(0px) scale(${lerp(0.2,1,clamp(pa,0,1.1)).toFixed(3)},${lerp(0.6,1,clamp(pa,0,1.1)).toFixed(3)})`;
    const pg=prog(t,23.15,23.8);sh.style.left=lerp(-200,1100,eIO2(pg))+'px';
    const gl=t>23.6?0.5+0.5*Math.sin((t-23.6)*5):0;
    pill.style.boxShadow=`0 18px 50px rgba(0,0,0,.45),0 0 ${(30+30*gl).toFixed(0)}px rgba(240,203,120,${(0.35+0.3*gl).toFixed(2)})`;
  }};
}
