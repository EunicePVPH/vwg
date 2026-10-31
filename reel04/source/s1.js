// ================= SCENE 1: HOOK (0-4s) =================
function buildS1(parent){
  const box=el('div','abs','',`width:1080px;height:1920px;perspective:1300px;perspective-origin:540px 930px`);
  const g=el('div','abs','',`width:1080px;height:1920px;transform-style:preserve-3d;transform-origin:540px 930px`);
  box.appendChild(g);
  const white=lockup([{t:'YOU',cap:400},{t:'STARTED',cap:400},{t:'A BUSINESS.',cap:400}],{gap:44,maxW:880}).place(930);
  const gold=lockup([{t:'NOT A',cap:400,cls:'gold'},{t:'SECOND',cap:400,cls:'gold'},{t:'FULL-TIME',cap:400,cls:'gold'},{t:'JOB.',cap:400,cls:'gold'}],{gap:38,noMask:true,maxW:880}).place(930);
  const gw=el('div','abs','',`width:1080px;height:1920px;transform-origin:540px 1180px`);
  gw.appendChild(gold.box);
  g.appendChild(white.box);g.appendChild(gw);
  // thin gold rule that draws under "A BUSINESS."
  const lastW=white.items[2];
  const rule=el('div','abs','',`left:270px;top:${parseFloat(white.box.style.top)+lastW.y+lastW.mh+22}px;width:540px;height:6px;border-radius:3px;background:linear-gradient(90deg,rgba(214,168,76,0),#F0CB78,rgba(214,168,76,0));transform-origin:50% 50%`);
  white.box.appendChild(rule);rule.style.top=(lastW.y+lastW.mh+22)+'px';
  parent.appendChild(box);
  const HITS=[1.62,1.90,2.20,2.70], AMP=[16,12,14,28];
  return {update(t){
    const vis=t<4.5;box.style.display=vis?'block':'none';if(!vis)return;
    const push=1+0.07*prog(t,0,3.8);
    const sh=shakeAt(t,HITS,AMP);
    g.style.transform=`translate3d(${sh.x.toFixed(1)}px,${sh.y.toFixed(1)}px,0) scale(${push.toFixed(4)}) rotateY(${lerp(-5,3,prog(t,0,3.8)).toFixed(2)}deg)`;
    // white lockup
    white.box.style.display=t<1.7?'block':'none';
    white.items.forEach((it,i)=>{
      const tin=-0.20+0.15*i,a=eO4(prog(t,tin,tin+0.62));
      const tout=1.16+0.06*(2-i),b=eI3(prog(t,tout,tout+0.24));
      const y=lerp(1.4*it.mh,0,a)+lerp(0,-1.4*it.mh,b);
      const rx=lerp(-62,0,a)+lerp(0,34,b);
      it.ln.style.transform=`translateY(${y.toFixed(1)}px) rotateX(${rx.toFixed(1)}deg)`;
    });
    rule.style.transform=`scaleX(${eIO3(prog(t,0.75,1.35)).toFixed(3)})`;rule.style.opacity=(1-prog(t,1.2,1.4)).toFixed(2);
    // gold slams on the narration words
    gold.box.style.display=t>1.55?'block':'none';
    const T=[1.62,1.90,2.20,2.70];
    gold.items.forEach((it,i)=>{
      const a=eO5(prog(t,T[i],T[i]+0.26));
      const s=lerp(2.4,1,a);
      it.mask.style.transform=`translate3d(0,0,${lerp(420,0,a).toFixed(1)}px) scale(${s.toFixed(4)})`;
      it.mask.style.opacity=clamp(a*2.4,0,1).toFixed(3);
      it.mask.style.filter=a<1?'none':'drop-shadow(0 12px 28px rgba(0,0,0,.45))';
      const sh2=prog(t,T[i]+0.55+0.09*i,T[i]+1.15+0.09*i);
      it.ln.style.backgroundImage=`linear-gradient(105deg,rgba(255,255,255,0) ${(sh2*160-40).toFixed(1)}%,rgba(255,255,255,.95) ${(sh2*160-30).toFixed(1)}%,rgba(255,255,255,0) ${(sh2*160-18).toFixed(1)}%),linear-gradient(180deg,#FFEFC2 0%,#EDC36A 34%,#CC9832 68%,#96691D 100%)`;
    });
    // camera dive through the gold type into the workspace
    const z=eI3(prog(t,3.62,4.32));
    gw.style.transform=`scale(${lerp(1,9,z).toFixed(3)})`;
    gw.style.opacity=(1-prog(t,3.92,4.24)).toFixed(3);
  }};
}
