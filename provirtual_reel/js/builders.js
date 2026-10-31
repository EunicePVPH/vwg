// ---------- Fictional demo brand: "alder&co." (original, not a client) ----------
const GREEN='#1F5E57', TERRA='#D9663A', INK='#1B2A2A', CREAM='#FAF7F2';

function desktopSite(){
  const cards=[['target','Strategy Sessions','One-to-one planning to turn goals into a clear roadmap.'],
               ['chat','Founder Coaching','Steady guidance and accountability as you grow.'],
               ['pres','Team Workshops','Hands-on sessions that align your people and priorities.']];
  return `
<div class="site in" style="position:absolute;inset:0;background:${CREAM};color:${INK};overflow:hidden">
  <div class="s-nav" style="position:absolute;left:0;top:0;width:1440px;height:96px;background:${CREAM};border-bottom:1px solid #E9E1D3;display:flex;align-items:center;padding:0 90px">
    <div class="s-logo pf" style="font-weight:800;font-size:38px;letter-spacing:-.5px">alder<span style="color:${TERRA}">&amp;</span>co.</div>
    <div style="flex:1"></div>
    <div class="s-links" style="display:flex;gap:46px;font-weight:500;font-size:20px;color:#3B4A47"><span>Services</span><span>Approach</span><span>Stories</span><span>Contact</span></div>
    <div class="s-navbtn" style="margin-left:58px;background:${GREEN};color:#fff;font-weight:600;font-size:19px;padding:16px 32px;border-radius:40px">Book a call</div>
  </div>
  <div class="s-eyebrow" style="position:absolute;left:90px;top:142px;font-weight:700;font-size:17px;letter-spacing:3.2px;color:${GREEN}">STRATEGY · COACHING · GROWTH</div>
  <div style="position:absolute;left:90px;top:182px;width:720px">
    <div class="hlw" style="height:104px;overflow:hidden"><div class="hl pf" style="font-weight:800;font-size:96px;line-height:104px;letter-spacing:-2px">Grow your</div></div>
    <div class="hlw" style="height:104px;overflow:hidden"><div class="hl pf" style="font-weight:800;font-size:96px;line-height:104px;letter-spacing:-2px">business with</div></div>
    <div class="hlw" style="height:104px;overflow:hidden"><div class="hl pf" style="font-weight:800;font-size:96px;line-height:104px;letter-spacing:-2px;color:${TERRA}">clarity.</div></div>
  </div>
  <div class="s-sub" style="position:absolute;left:90px;top:518px;width:590px;font-size:23px;line-height:35px;color:#55625F">Practical strategy and hands-on coaching for founders who are ready to grow with confidence.</div>
  <div class="s-btns" style="position:absolute;left:90px;top:610px;display:flex;gap:18px">
    <div style="background:${GREEN};color:#fff;font-weight:600;font-size:21px;padding:0 38px;height:64px;line-height:64px;border-radius:40px;box-shadow:0 14px 30px rgba(31,94,87,.32)">Book a free call</div>
    <div style="border:2px solid #CFC6B5;color:${INK};font-weight:600;font-size:21px;padding:0 34px;height:64px;line-height:60px;border-radius:40px">See how it works</div>
  </div>
  <div class="s-art" style="position:absolute;left:800px;top:128px;width:550px;height:530px;border-radius:275px 275px 30px 30px;overflow:hidden;background:linear-gradient(180deg,#F8DDBD 0%,#F1B58F 36%,#DC6B3E 70%,#9C4426 100%);box-shadow:0 44px 90px rgba(80,45,20,.28)">
    <div style="position:absolute;left:150px;top:96px;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle at 42% 38%,#FFF7E2 0%,#FDE6B8 52%,rgba(253,230,184,0) 74%)"></div>
    <div style="position:absolute;left:-170px;top:340px;width:700px;height:420px;border-radius:50%;background:#8A3F26"></div>
    <div style="position:absolute;left:190px;top:392px;width:640px;height:420px;border-radius:50%;background:#5E2917"></div>
    <div style="position:absolute;left:0;top:0;width:550px;height:530px;background:linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,0) 40%)"></div>
  </div>
  <div class="s-chip" style="position:absolute;left:735px;top:528px;width:318px;height:96px;border-radius:24px;background:#fff;box-shadow:0 24px 50px rgba(30,30,20,.20);display:flex;align-items:center;gap:18px;padding:0 24px">
    <div style="width:54px;height:54px;border-radius:16px;background:#E6F0EC;color:${GREEN};display:flex;align-items:center;justify-content:center">${ic('cal',28,2)}</div>
    <div><div style="font-size:15px;font-weight:600;color:#7A857F;letter-spacing:.4px">NEXT AVAILABLE</div><div style="font-size:23px;font-weight:700;color:${INK}">Tue · 10:00 AM</div></div>
  </div>
  ${cards.map((c,i)=>`
  <div class="s-card" style="position:absolute;left:${90+i*430}px;top:730px;width:400px;height:226px;border-radius:24px;background:#fff;border:1px solid #EBE3D6;box-shadow:0 22px 46px rgba(60,50,30,.10);padding:30px 32px">
    <div style="width:60px;height:60px;border-radius:18px;background:#E6F0EC;color:${GREEN};display:flex;align-items:center;justify-content:center">${ic(c[0],30,1.9)}</div>
    <div class="pf" style="font-weight:700;font-size:30px;margin-top:20px">${c[1]}</div>
    <div style="font-size:18px;line-height:27px;color:#5A6663;margin-top:8px">${c[2]}</div>
  </div>`).join('')}
  <div class="s-contact" style="position:absolute;left:0;top:988px;width:1440px;height:212px;background:linear-gradient(120deg,#0F3A36,#17504A)">
    <div style="position:absolute;left:90px;top:44px;font-weight:700;font-size:15px;letter-spacing:3px;color:#F2A27B">READY WHEN YOU ARE</div>
    <div class="pf" style="position:absolute;left:90px;top:76px;font-weight:800;font-size:50px;line-height:56px;color:#fff">Let's talk about<br>your goals.</div>
    <div class="s-form" style="position:absolute;left:760px;top:74px;display:flex;gap:16px">
      <div style="width:400px;height:64px;border-radius:40px;background:#fff;color:#8C9794;font-size:20px;line-height:64px;padding-left:30px">Your email address</div>
      <div style="height:64px;border-radius:40px;background:${TERRA};color:#fff;font-weight:700;font-size:20px;line-height:64px;padding:0 34px">Get in touch</div>
    </div>
  </div>
</div>`;
}

function browserShell(){
  return `
<div class="bshell" style="position:absolute;inset:0;border-radius:30px;overflow:hidden;background:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.14),0 0 0 4px rgba(227,176,75,.20),0 90px 180px rgba(0,0,0,.6)">
  <div class="chrome" style="position:absolute;left:0;top:0;width:1440px;height:88px;background:linear-gradient(180deg,#F1F3F7,#E6E9EF);border-bottom:1px solid #D5D9E2">
    <div style="position:absolute;left:36px;top:34px;display:flex;gap:14px"><i style="width:20px;height:20px;border-radius:50%;background:#FF5F57;display:block"></i><i style="width:20px;height:20px;border-radius:50%;background:#FEBC2E;display:block"></i><i style="width:20px;height:20px;border-radius:50%;background:#28C840;display:block"></i></div>
    <div style="position:absolute;left:250px;top:20px;width:940px;height:48px;border-radius:24px;background:#fff;box-shadow:0 0 0 1px #D5D9E2 inset;display:flex;align-items:center;padding:0 22px;gap:12px;color:#5C6675;font-size:22px" class="in">
      ${ic('lock',22,2,'#5C6675')}<span class="url">alderandco.com</span><span class="curs" style="width:2px;height:26px;background:#5C6675;margin-left:-8px"></span>
    </div>
  </div>
  <div class="viewport" style="position:absolute;left:0;top:88px;width:1440px;height:1200px;background:#fff">${desktopSite()}</div>
  <div class="glare" style="position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,0) 40%,rgba(255,255,255,.16) 50%,rgba(255,255,255,0) 60%);transform:translateX(-120%)"></div>
</div>`;
}

// ---------- phone ----------
function mobileSite(){
  const cards=[['target','Strategy Sessions','Turn goals into a clear roadmap.'],['chat','Founder Coaching','Guidance and accountability.'],['pres','Team Workshops','Align your people and priorities.']];
  return `
<div class="mob in" style="position:absolute;left:0;top:0;width:390px;height:1720px;background:${CREAM};color:${INK}">
  <div style="position:absolute;left:0;top:0;width:390px;height:100px;background:${CREAM};border-bottom:1px solid #E9E1D3"></div>
  <div class="pf" style="position:absolute;left:24px;top:56px;font-weight:800;font-size:28px;letter-spacing:-.4px">alder<span style="color:${TERRA}">&amp;</span>co.</div>
  <div style="position:absolute;right:24px;top:60px;color:${INK}">${ic('menu',30,2)}</div>
  <div style="position:absolute;left:24px;top:128px;font-weight:700;font-size:12px;letter-spacing:2.6px;color:${GREEN}">STRATEGY · COACHING · GROWTH</div>
  <div class="pf" style="position:absolute;left:24px;top:152px;width:342px;font-weight:800;font-size:44px;line-height:46px;letter-spacing:-1px">Grow your business with <span style="color:${TERRA}">clarity.</span></div>
  <div style="position:absolute;left:24px;top:306px;width:330px;font-size:16px;line-height:24px;color:#55625F">Practical strategy and hands-on coaching for founders ready to grow with confidence.</div>
  <div style="position:absolute;left:24px;top:394px;width:342px;height:56px;border-radius:30px;background:${GREEN};color:#fff;font-weight:600;font-size:17px;line-height:56px;text-align:center;box-shadow:0 12px 24px rgba(31,94,87,.3)">Book a free call</div>
  <div style="position:absolute;left:24px;top:462px;width:342px;height:56px;border-radius:30px;border:2px solid #CFC6B5;font-weight:600;font-size:17px;line-height:52px;text-align:center">See how it works</div>
  <div style="position:absolute;left:24px;top:552px;width:342px;height:400px;border-radius:171px 171px 24px 24px;overflow:hidden;background:linear-gradient(180deg,#F8DDBD 0%,#F1B58F 36%,#DC6B3E 70%,#9C4426 100%);box-shadow:0 26px 50px rgba(80,45,20,.25)">
    <div style="position:absolute;left:92px;top:78px;width:170px;height:170px;border-radius:50%;background:radial-gradient(circle at 42% 38%,#FFF7E2 0%,#FDE6B8 52%,rgba(253,230,184,0) 74%)"></div>
    <div style="position:absolute;left:-120px;top:240px;width:480px;height:300px;border-radius:50%;background:#8A3F26"></div>
    <div style="position:absolute;left:130px;top:280px;width:440px;height:300px;border-radius:50%;background:#5E2917"></div>
  </div>
  ${cards.map((c,i)=>`
  <div style="position:absolute;left:24px;top:${988+i*148}px;width:342px;height:132px;border-radius:22px;background:#fff;border:1px solid #EBE3D6;box-shadow:0 14px 30px rgba(60,50,30,.09);padding:22px 22px">
    <div style="width:52px;height:52px;border-radius:16px;background:#E6F0EC;color:${GREEN};display:flex;align-items:center;justify-content:center;position:absolute;left:22px;top:22px">${ic(c[0],26,1.9)}</div>
    <div class="pf" style="position:absolute;left:92px;top:24px;font-weight:700;font-size:23px">${c[1]}</div>
    <div style="position:absolute;left:92px;top:60px;width:230px;font-size:15px;line-height:22px;color:#5A6663">${c[2]}</div>
    <div style="position:absolute;left:92px;top:98px;font-size:14.5px;font-weight:600;color:${GREEN}">Learn more →</div>
  </div>`).join('')}
  <div style="position:absolute;left:0;top:1450px;width:390px;height:270px;background:linear-gradient(120deg,#0F3A36,#17504A)">
    <div style="position:absolute;left:24px;top:34px;font-weight:700;font-size:12px;letter-spacing:2.6px;color:#F2A27B">READY WHEN YOU ARE</div>
    <div class="pf" style="position:absolute;left:24px;top:58px;font-weight:800;font-size:32px;line-height:36px;color:#fff;width:300px">Let's talk about your goals.</div>
    <div style="position:absolute;left:24px;top:150px;width:342px;height:54px;border-radius:30px;background:#fff;color:#8C9794;font-size:16px;line-height:54px;padding-left:24px">Your email address</div>
    <div style="position:absolute;left:24px;top:214px;width:342px;height:0"></div>
  </div>
</div>`;
}

function landingPage(){
  return `
<div class="land in" style="position:absolute;left:0;top:0;width:390px;height:1260px;background:#FBF8F2;overflow:hidden">
  <div style="position:absolute;left:0;top:0;width:390px;height:760px;background:linear-gradient(180deg,#0E2F2C 0%,#134039 100%)"></div>
  <div style="position:absolute;left:230px;top:-60px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(226,105,59,.28),rgba(226,105,59,0) 68%)"></div>
  <div class="l-top" style="position:absolute;left:24px;top:56px;width:342px;height:40px">
    <div class="pf" style="position:absolute;left:0;top:2px;font-weight:800;font-size:27px;color:#fff;letter-spacing:-.4px">alder<span style="color:#F2A27B">&amp;</span>co.</div>
    <div style="position:absolute;right:0;top:3px;height:34px;padding:0 15px;border-radius:20px;border:1.5px solid rgba(255,255,255,.28);color:#fff;font-weight:600;font-size:13px;line-height:31px">Free session</div>
  </div>
  <div class="l-badge" style="position:absolute;left:24px;top:124px;height:32px;padding:0 14px;border-radius:20px;background:rgba(226,105,59,.18);border:1px solid rgba(226,105,59,.55);color:#F7B08D;font-weight:700;font-size:11.5px;letter-spacing:1.6px;line-height:30px">FREE 30-MINUTE STRATEGY SESSION</div>
  <div style="position:absolute;left:24px;top:172px;width:342px">
    ${['Turn your big','idea into a','<span style="color:#F7B08D">business that</span>','<span style="color:#F7B08D">grows.</span>'].map(l=>`<div class="l-hw" style="height:46px;overflow:hidden"><div class="l-h pf" style="font-weight:800;font-size:43px;line-height:46px;letter-spacing:-.8px;color:#fff">${l}</div></div>`).join('')}
  </div>
  <div class="l-p" style="position:absolute;left:24px;top:370px;width:322px;font-size:15.5px;line-height:23.5px;color:#CFE0DC">Book a free session and leave with a clear, simple plan for your next 90 days.</div>
  <div class="l-cta" style="position:absolute;left:24px;top:462px;width:342px;height:58px;border-radius:18px;background:linear-gradient(180deg,#EC7646,#D95F32);color:#fff;font-weight:700;font-size:17.5px;line-height:58px;text-align:center;box-shadow:0 16px 34px rgba(226,105,59,.45);display:flex;align-items:center;justify-content:center;gap:10px">Book My Free Session ${ic('arrow',20,2.4)}</div>
  <div class="l-micro" style="position:absolute;left:24px;top:534px;width:342px;text-align:center;font-size:12.5px;color:#9DB8B2;letter-spacing:.3px">No cost  ·  No pressure  ·  30 minutes</div>
  ${['A clear plan for your next 90 days','Advice tailored to your business','Honest next steps, no obligation'].map((b,i)=>`
  <div class="l-bul" style="position:absolute;left:30px;top:${582+i*38}px;display:flex;align-items:center;gap:12px;font-size:14.5px;color:#DCEBE7"><span style="width:24px;height:24px;border-radius:50%;background:rgba(242,162,123,.2);color:#F7B08D;display:flex;align-items:center;justify-content:center">${ic('check',14,2.8)}</span>${b}</div>`).join('')}
  <div class="l-form" style="position:absolute;left:0;top:716px;width:390px;height:560px;border-radius:34px 34px 0 0;background:#FBF8F2;box-shadow:0 -20px 50px rgba(0,0,0,.25)">
    <div class="pf" style="position:absolute;left:24px;top:30px;font-weight:700;font-size:27px;color:${INK}">Tell us about your goals</div>
    <div style="position:absolute;left:24px;top:68px;font-size:14px;color:#6A7673">Takes less than a minute.</div>
    ${[['Full name',100,54,'l-f1'],['Email address',194,54,'l-f2'],['How can we help?',288,90,'l-f3']].map(f=>`
    <div style="position:absolute;left:24px;top:${f[1]}px;font-weight:600;font-size:13px;color:#55625F">${f[0]}</div>
    <div class="l-box ${f[3]}" style="position:absolute;left:24px;top:${f[1]+22}px;width:342px;height:${f[2]}px;border-radius:14px;background:#fff;border:1.5px solid #DDD5C6;padding:${f[2]>60?'15px':'0'} 16px;display:flex;align-items:${f[2]>60?'flex-start':'center'};font-size:16px;color:${INK}"><span class="txt"></span><i class="car" style="display:none;width:2px;height:20px;background:${TERRA};margin-left:1px"></i></div>`).join('')}
    <div class="l-sub" style="position:absolute;left:24px;top:424px;width:342px;height:58px;border-radius:18px;background:${GREEN};color:#fff;font-weight:700;font-size:17px;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 14px 30px rgba(31,94,87,.35)"><span class="subtxt">Send My Inquiry</span>${ic('send',19,2.2)}</div>
    <div style="position:absolute;left:24px;top:494px;width:342px;text-align:center;font-size:12.5px;color:#7A857F">We reply within one business day.</div>
    <div class="l-ok" style="position:absolute;left:0;top:0;width:390px;height:560px;border-radius:34px 34px 0 0;background:#FBF8F2;opacity:0">
      <div class="okc" style="position:absolute;left:153px;top:96px;width:84px;height:84px;border-radius:50%;background:${GREEN};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 18px 40px rgba(31,94,87,.4)">${ic('check',44,3)}</div>
      <div class="pf" style="position:absolute;left:0;top:206px;width:390px;text-align:center;font-weight:800;font-size:34px;color:${INK}">Inquiry sent!</div>
      <div style="position:absolute;left:44px;top:258px;width:302px;text-align:center;font-size:15.5px;line-height:23px;color:#5A6663">Thank you, Maria. We'll be in touch within one business day.</div>
      <div style="position:absolute;left:24px;top:322px;width:342px;height:176px;border-radius:20px;background:#fff;border:1.5px solid #E7DFD0;box-shadow:0 14px 30px rgba(60,50,30,.08)">
        ${[['user','Maria Santos'],['mail','maria@brightpath.co'],['chat','Website + landing page']].map((r,i)=>`<div style="position:absolute;left:18px;top:${16+i*52}px;display:flex;align-items:center;gap:14px;font-size:16px;font-weight:500;color:${INK}"><span style="width:38px;height:38px;border-radius:12px;background:#E6F0EC;color:${GREEN};display:flex;align-items:center;justify-content:center">${ic(r[0],20,2)}</span>${r[1]}</div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
}

function phoneShell(){
  const sb=(col)=>`<div style="position:absolute;left:0;top:0;width:390px;height:50px;color:${col}"><div class="in" style="position:absolute;left:34px;top:15px;font-weight:700;font-size:16px">9:41</div>
    <div style="position:absolute;right:30px;top:19px;display:flex;gap:6px;align-items:flex-end"><i style="display:block;width:4px;height:7px;background:${col};border-radius:1px"></i><i style="display:block;width:4px;height:10px;background:${col};border-radius:1px"></i><i style="display:block;width:4px;height:13px;background:${col};border-radius:1px"></i><i style="display:block;width:26px;height:13px;border:1.6px solid ${col};border-radius:4px;margin-left:8px;position:relative"><b style="position:absolute;left:1.5px;top:1.5px;right:5px;bottom:1.5px;background:${col};border-radius:1.5px"></b></i></div></div>`;
  return `
<div class="pframe" style="position:absolute;inset:0;border-radius:68px;background:linear-gradient(145deg,#2B2F3B,#0B0C12 40%,#1B1E27);box-shadow:0 0 0 2px rgba(255,255,255,.10),0 0 0 4px rgba(227,176,75,.18),0 80px 150px rgba(0,0,0,.65)"></div>
<div class="screen" style="position:absolute;left:14px;top:14px;width:390px;height:844px;border-radius:54px;overflow:hidden;background:#fff">
  <div id="scrM" style="position:absolute;left:0;top:0;width:390px;height:844px;overflow:hidden"><div id="mobScroll" style="position:absolute;left:0;top:0;width:390px">${mobileSite()}</div>${sb(INK)}</div>
  <div id="scrL" style="position:absolute;left:0;top:0;width:390px;height:844px;overflow:hidden;clip-path:inset(0 0 100% 0)"><div id="landScroll" style="position:absolute;left:0;top:0;width:390px">${landingPage()}</div><div id="sbL"><div style="position:absolute;left:0;top:0;width:390px;height:50px;background:#0E2F2C"></div>${sb('#fff')}</div>
    <div id="notif" style="position:absolute;left:12px;top:54px;width:366px;height:84px;border-radius:24px;background:rgba(24,28,38,.94);box-shadow:0 20px 40px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.08) inset;opacity:0">
      <div style="position:absolute;left:16px;top:18px;width:48px;height:48px;border-radius:14px;background:linear-gradient(180deg,#F6DA8C,#D49A2E);color:#091634;display:flex;align-items:center;justify-content:center">${ic('mail',26,2.2)}</div>
      <div class="in" style="position:absolute;left:78px;top:15px;font-size:15.5px;font-weight:700;color:#fff">New inquiry received</div>
      <div class="in" style="position:absolute;left:78px;top:38px;font-size:13.5px;line-height:19px;color:#C5CCDA;width:240px">Maria Santos · Website + landing page</div>
      <div class="in" style="position:absolute;right:18px;top:17px;font-size:12px;color:#8E97A8">now</div>
    </div>
    <div id="touch" style="position:absolute;left:0;top:0;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.75) 0%,rgba(255,255,255,.35) 60%,rgba(255,255,255,.1) 100%);border:2px solid rgba(255,255,255,.7);box-shadow:0 8px 22px rgba(0,0,0,.35);opacity:0"></div>
    <div id="ripple" style="position:absolute;left:0;top:0;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:3px solid rgba(255,255,255,.9);opacity:0"></div>
  </div>
  <div class="in" style="position:absolute;left:50%;top:0;width:0;height:0"></div>
  <div style="position:absolute;left:50%;top:11px;width:122px;height:36px;margin-left:-61px;border-radius:20px;background:#05060A"></div>
  <div style="position:absolute;left:50%;bottom:9px;width:140px;height:5px;margin-left:-70px;border-radius:3px;background:rgba(10,10,10,.55)" id="homebar"></div>
  <div class="sheen" style="position:absolute;inset:0;border-radius:54px;background:linear-gradient(120deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,0) 35%);pointer-events:none"></div>
</div>`;
}

// ---------- funnel ----------
function funnelCards(){
  const ST=258;
  const chip=(txt,x,w)=>`<div style="position:absolute;left:${x}px;top:8px;height:48px;width:${w}px;border-radius:26px;border:1.5px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);color:#E8EEFC;font:600 22px/45px Inter;text-align:center">${txt}</div>`;
  const defs=[
   {n:'01',t:'VISITOR',s:'Finds you online',
    ui:`<div style="position:absolute;left:0;top:0;width:520px;height:130px">
        <div style="position:absolute;left:0;top:6px;width:76px;height:76px;border-radius:50%;background:linear-gradient(160deg,#F7DE9B,#C48B25);color:#091634;display:flex;align-items:center;justify-content:center">${ic('user',40,2.2)}</div>
        <div style="position:absolute;left:96px;top:0;width:410px;height:64px;border-radius:32px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.2);color:#fff;font:600 25px/61px Inter;padding-left:26px">Clicks your link <span style="position:absolute;right:20px;top:14px;color:#F0C866">${ic('cursor',34,2)}</span></div>
        <div style="position:absolute;left:96px;top:78px;width:420px;height:50px">${chip('Instagram',0,142)}${chip('Google',154,112)}${chip('Referral',278,132)}</div></div>`},
   {n:'02',t:'LANDING PAGE',s:'Grabs attention',
    ui:`<div style="position:absolute;left:0;top:-2px;width:520px;height:136px;border-radius:18px;background:#FBF8F2;overflow:hidden;box-shadow:0 14px 34px rgba(0,0,0,.35)">
        <div style="position:absolute;left:0;top:0;width:520px;height:28px;background:#E7EAF0"><i style="position:absolute;left:12px;top:9px;width:10px;height:10px;border-radius:50%;background:#FF5F57"></i><i style="position:absolute;left:28px;top:9px;width:10px;height:10px;border-radius:50%;background:#FEBC2E"></i><i style="position:absolute;left:44px;top:9px;width:10px;height:10px;border-radius:50%;background:#28C840"></i></div>
        <div style="position:absolute;left:0;top:28px;width:260px;height:108px;background:linear-gradient(180deg,#0E2F2C,#134039)"></div>
        <div class="pf" style="position:absolute;left:18px;top:38px;width:240px;font-weight:800;font-size:25px;line-height:27px;color:#fff">Turn your big idea into a business that grows.</div>
        <div style="position:absolute;left:18px;top:106px;width:132px;height:20px;border-radius:10px;background:#E2693B"></div>
        <div style="position:absolute;left:284px;top:44px;width:212px;height:20px;border-radius:7px;background:#fff;border:1.5px solid #DDD5C6"></div>
        <div style="position:absolute;left:284px;top:72px;width:212px;height:20px;border-radius:7px;background:#fff;border:1.5px solid #DDD5C6"></div>
        <div style="position:absolute;left:284px;top:102px;width:212px;height:24px;border-radius:9px;background:#1F5E57"></div></div>`},
   {n:'03',t:'INQUIRY',s:'Lead comes in',
    ui:`<div style="position:absolute;left:0;top:4px;width:520px;height:122px;border-radius:22px;background:rgba(255,255,255,.09);border:1.5px solid rgba(255,255,255,.2)">
        <div style="position:absolute;left:22px;top:22px;width:78px;height:78px;border-radius:50%;background:linear-gradient(160deg,#F7DE9B,#C48B25);color:#091634;font:800 30px/78px Montserrat;text-align:center">MS</div>
        <div style="position:absolute;left:122px;top:20px;font:700 30px/36px Inter;color:#fff">Maria Santos</div>
        <div style="position:absolute;left:122px;top:62px;font:500 23px/30px Inter;color:#B9C6E6">Website + landing page</div>
        <div style="position:absolute;right:20px;top:20px;height:38px;padding:0 16px;border-radius:20px;background:rgba(240,200,102,.18);border:1.5px solid rgba(240,200,102,.6);color:#F5D47E;font:700 18px/35px Inter;letter-spacing:.8px">NEW</div>
        <div style="position:absolute;right:26px;top:66px;color:#F0C866">${ic('mail',34,2)}</div></div>`},
   {n:'04',t:'FOLLOW-UP',s:'Conversation starts',
    ui:`<div style="position:absolute;left:0;top:0;width:520px;height:130px">
        <div style="position:absolute;left:0;top:0;width:392px;height:84px;border-radius:26px 26px 26px 6px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.2);color:#fff;font:600 22px/31px Inter;padding:11px 22px">Hi Maria! Thanks for reaching out. Let's book your call.</div>
        <div style="position:absolute;left:0;top:96px;font:600 19px/28px Inter;color:#B9C6E6">Sent ✓✓  just now</div>
        <div style="position:absolute;left:366px;top:84px;width:152px;height:48px;border-radius:26px;background:linear-gradient(180deg,#F8E3A0,#E3B04B);color:#091634;font:800 20px/48px Inter;text-align:center;box-shadow:0 10px 22px rgba(0,0,0,.35)">Tue · 10 AM</div></div>`}
  ];
  let h='';
  defs.forEach((d,i)=>{
    h+=`<div class="fcard" style="position:absolute;left:0;top:${i*ST}px;width:900px;height:200px;border-radius:30px;background:linear-gradient(135deg,rgba(23,52,120,.96),rgba(10,28,72,.97));border:1.5px solid rgba(255,255,255,.16);box-shadow:0 40px 80px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04) inset">
      <div class="fglow" style="position:absolute;inset:-2px;border-radius:32px;border:3px solid #F0C866;box-shadow:0 0 60px rgba(240,200,102,.55),0 0 24px rgba(240,200,102,.5) inset;opacity:0"></div>
      <div class="fbadge" style="position:absolute;left:34px;top:34px;width:66px;height:66px;border-radius:50%;border:2.5px solid #E3B04B;color:#F0C866;font:800 25px/61px Montserrat;text-align:center;background:rgba(227,176,75,.08)">${d.n}</div>
      <div style="position:absolute;left:34px;top:114px;font:800 32px/40px Montserrat;color:#fff;letter-spacing:-.2px;white-space:nowrap">${d.t}</div>
      <div style="position:absolute;left:34px;top:156px;font:500 22px/28px Inter;color:#9FB1DA;white-space:nowrap">${d.s}</div>
      <div style="position:absolute;left:366px;top:34px;width:520px;height:134px">${d.ui}</div>
    </div>`;
    if(i<3) h+=`<div class="fcon" style="position:absolute;left:65px;top:${i*ST+200}px;width:6px;height:58px"><i style="position:absolute;left:0;top:0;width:6px;height:58px;border-radius:3px;background:linear-gradient(180deg,rgba(240,200,102,.9),rgba(240,200,102,.35))"></i><span class="fchev" style="position:absolute;left:-9px;top:34px;color:#F0C866">${ic('arrow',24,3)}</span></div>`;
  });
  h+=`<div class="fpulse" style="position:absolute;left:55px;top:0;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#FBE7A6 38%,rgba(240,200,102,0) 72%);box-shadow:0 0 30px 10px rgba(240,200,102,.7)"></div>`;
  return h;
}

function buildAll(){
  $('#br').innerHTML=browserShell();
  $('#ph').innerHTML=phoneShell();
  $('#fgrp').innerHTML=funnelCards();
  buildText();
}
