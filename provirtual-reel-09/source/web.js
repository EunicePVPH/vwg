/* ===== WEBSITES & SALES FUNNELS station (scene 4) ===== */
const WEB = station('web', [12.8, 20.0]);
div('ghost', `left:-1000px;top:-1000px;font-size:400px;transform:translateZ(-260px)`, 'WEBSITES', WEB.el);

/* helpers to build "site" content */
function blk(parent, css, html, i, f) { // assembling block
  const d = div('abs', css, html, parent);
  d._i = i; d._f = f || [(i % 2 ? 1 : -1) * 220, -160 - (i % 3) * 60, -500 - i * 60]; return d;
}
function heroArt() {
  return `<div class="abs" style="inset:0;background:linear-gradient(135deg,#0b2252,#2c5296)"></div>
   <div class="abs" style="right:-60px;top:-70px;width:340px;height:340px;border-radius:50%;background:linear-gradient(135deg,#f0cf85,#b8892f)"></div>
   <div class="abs" style="left:40px;bottom:-90px;width:260px;height:260px;border-radius:50%;border:30px solid rgba(255,255,255,.13)"></div>
   <div class="abs" style="left:60px;top:44px;display:flex;gap:14px;align-items:flex-end;height:120px">${[.45, .8, .6, 1].map(v => `<i style="display:block;width:30px;height:${v * 120}px;border-radius:9px;background:rgba(255,255,255,${.35 + v * .4})"></i>`).join('')}</div>`;
}
const cardTitles = [['Design', 'grid', '#12285a'], ['Build', 'bolt', '#d4a84b'], ['Launch', 'globe', '#4b78b5']];

/* ---- DESKTOP BROWSER ---- */
const brw = panel(WEB, { x: -450, y: 0, w: 1000, h: 1000, t0: 13.9, dur: 1.0, ry: 0, from: [0, 0, -900], ry0: -20 });
const deskBlocks = [];
(() => {
  const el = brw.el;
  el.innerHTML = `<div class="abs" style="left:0;right:0;top:0;height:96px;background:#eef2f9;border-bottom:2px solid #e0e6f1;display:flex;align-items:center;padding:0 30px;gap:12px">
     <i style="width:20px;height:20px;border-radius:50%;background:#ff6b6b;display:block"></i><i style="width:20px;height:20px;border-radius:50%;background:#ffd166;display:block"></i><i style="width:20px;height:20px;border-radius:50%;background:#6bd48c;display:block"></i>
     <div style="margin-left:24px;flex:1;height:50px;border-radius:25px;background:#fff;border:2px solid #dde4f0;display:flex;align-items:center;padding:0 22px;gap:12px;font-weight:600;font-size:25px;color:#6b7690">${ic('link', 26, '#8892a6', 2.2)}yourbusiness.com</div></div>
   <div id="site" class="abs" style="left:0;right:0;top:96px;bottom:0;background:#fff;overflow:hidden;perspective:1400px"></div>`;
  const s = el.querySelector('#site');
  let i = 0;
  deskBlocks.push(blk(s, 'left:0;right:0;top:0;height:100px;display:flex;align-items:center;padding:0 50px;gap:36px;border-bottom:2px solid #eef1f7;background:#fff',
    `<div style="width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#12285a,#2c5296)"></div><div style="font-weight:900;font-size:32px;color:#12285a;letter-spacing:-.02em">Lumen<span style="color:#b8892f">&Co.</span></div><span style="flex:1"></span>
     ${['About', 'Services', 'Contact'].map(x => `<span style="font-weight:700;font-size:26px;color:#5b6577">${x}</span>`).join('')}<span class="chip" style="background:#12285a;color:#fff;font-size:24px">Book a call</span>`, i++));
  deskBlocks.push(blk(s, 'left:50px;top:132px;width:900px;font-weight:900;font-size:76px;line-height:.98;letter-spacing:-.04em;color:#0b1f4a', `Websites that work<br><span style="color:#b8892f">as hard as you do.</span>`, i++));
  deskBlocks.push(blk(s, 'left:50px;top:310px;width:620px', `<div class="sk" style="height:20px;margin-bottom:18px"></div><div class="sk" style="height:20px;width:85%;margin-bottom:18px"></div><div class="sk" style="height:20px;width:60%"></div>`, i++));
  deskBlocks.push(blk(s, 'left:50px;top:392px;display:flex;gap:20px', `<span style="background:linear-gradient(135deg,#f0cf85,#d4a84b);color:#12285a;font-weight:800;font-size:30px;padding:22px 42px;border-radius:99px;box-shadow:0 18px 30px -12px rgba(212,168,75,.8)">Get started</span><span style="border:3px solid #12285a;color:#12285a;font-weight:800;font-size:30px;padding:19px 38px;border-radius:99px">Learn more</span>`, i++));
  deskBlocks.push(blk(s, 'left:50px;right:50px;top:500px;height:200px;border-radius:30px;overflow:hidden', heroArt(), i++));
  cardTitles.forEach((c, k) => deskBlocks.push(blk(s, `left:${50 + k * 292}px;top:732px;width:272px;height:162px;border-radius:26px;background:#f3f6fb;padding:20px 26px`,
    `<div style="width:62px;height:62px;border-radius:18px;background:${c[2]};display:flex;align-items:center;justify-content:center">${ic(c[1], 34, '#fff', 2.2)}</div><div style="font-weight:800;font-size:34px;color:#0f1b3d;margin-top:14px">${c[0]}</div><div class="sk" style="width:80%;height:12px;margin-top:10px"></div>`, i++)));
  A(t => deskBlocks.forEach(d => {
    const k = E.out5(P(t, 14.55 + d._i * .13, 15.35 + d._i * .13));
    d.style.opacity = clamp(k * 2);
    d.style.transform = `translate3d(${d._f[0] * (1 - k)}px,${d._f[1] * (1 - k)}px,${d._f[2] * (1 - k)}px) rotateX(${30 * (1 - k)}deg)`;
  }));
  // browser: slide aside when phone arrives
  A(t => {
    const m = E.io3(P(t, 16.0, 16.9));
    brw.o.x = lerp(-450, -560, m); brw.o.ry = lerp(0, 18, m); brw.o.z = lerp(0, -120, m);
    brw.el.style.left = (brw.o.x - 500) + 'px';
  });
})();

/* ---- MOBILE (responsive) ---- */
const mob = panel(WEB, { x: 330, y: 20, w: 440, h: 860, css: 'background:transparent;box-shadow:0 60px 100px -20px rgba(1,6,20,.8);border-radius:70px', t0: 16.15, dur: .9, z: 40, ry: -10, from: [260, 0, -800], ry0: -38 });
const mobBlocks = [];
(() => {
  const el = mob.el;
  el.innerHTML = `<div class="abs" style="inset:0;background:#0b1226;border-radius:70px"></div>
   <div class="abs" style="left:14px;top:14px;right:14px;bottom:14px;background:#fff;border-radius:58px;overflow:hidden;perspective:1200px" id="ms">
   <div class="abs" style="left:50%;top:12px;width:120px;height:32px;margin-left:-60px;border-radius:20px;background:#0b1226;z-index:5"></div></div>`;
  const s = el.querySelector('#ms');
  let i = 0;
  mobBlocks.push(blk(s, 'left:0;right:0;top:56px;height:84px;display:flex;align-items:center;padding:0 28px;border-bottom:2px solid #eef1f7;background:#fff', `<div style="width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#12285a,#2c5296)"></div><div style="font-weight:900;font-size:27px;color:#12285a;margin-left:12px">Lumen<span style="color:#b8892f">&Co.</span></div><span style="flex:1"></span><div style="width:36px"><i style="display:block;height:4px;background:#12285a;border-radius:2px;margin:6px 0"></i><i style="display:block;height:4px;background:#12285a;border-radius:2px;margin:6px 0"></i><i style="display:block;height:4px;background:#12285a;border-radius:2px;margin:6px 0"></i></div>`, i++));
  mobBlocks.push(blk(s, 'left:28px;top:166px;right:20px;font-weight:900;font-size:56px;line-height:.98;letter-spacing:-.04em;color:#0b1f4a', `Websites that <span style="color:#b8892f">work as hard</span> as you do.`, i++));
  mobBlocks.push(blk(s, 'left:28px;top:372px;right:28px', `<div class="sk" style="height:15px;margin-bottom:12px"></div><div class="sk" style="height:15px;width:70%"></div>`, i++));
  mobBlocks.push(blk(s, 'left:28px;right:28px;top:446px;text-align:center;background:linear-gradient(135deg,#f0cf85,#d4a84b);color:#12285a;font-weight:800;font-size:28px;padding:20px 0;border-radius:99px;box-shadow:0 16px 26px -12px rgba(212,168,75,.8)', 'Get started', i++));
  mobBlocks.push(blk(s, 'left:28px;right:28px;top:546px;height:156px;border-radius:26px;overflow:hidden', heroArt(), i++));
  cardTitles.forEach((c, k) => mobBlocks.push(blk(s, `left:28px;right:28px;top:${762 + k * 0}px;height:0`, '', i++)));
  mobBlocks.push(blk(s, 'left:28px;right:28px;top:728px;height:86px;border-radius:22px;background:#f3f6fb;display:flex;align-items:center;gap:18px;padding:0 20px', `<div style="width:50px;height:50px;border-radius:15px;background:#12285a;display:flex;align-items:center;justify-content:center">${ic('grid', 28, '#fff', 2.2)}</div><div style="font-weight:800;font-size:28px;color:#0f1b3d">Design</div>`, i++));
  A(t => mobBlocks.forEach(d => {
    const k = E.out5(P(t, 16.35 + d._i * .1, 17.05 + d._i * .1));
    d.style.opacity = clamp(k * 2);
    d.style.transform = `translate3d(${d._f[0] * .4 * (1 - k)}px,${d._f[1] * .5 * (1 - k)}px,${d._f[2] * .6 * (1 - k)}px) rotateX(${25 * (1 - k)}deg)`;
  }));
})();

/* ---- LANDING PAGE + LEAD CAPTURE ---- */
const lpg = panel(WEB, { x: 1020, y: -20, w: 800, h: 980, t0: 16.7, dur: 1.0, z: -20, ry: -12, from: [500, 40, -900], ry0: -34 });
let LP = {};
(() => {
  const el = lpg.el;
  el.innerHTML = `<div class="abs" style="left:0;right:0;top:0;height:96px;background:#eef2f9;border-bottom:2px solid #e0e6f1;display:flex;align-items:center;padding:0 30px;gap:12px">
     <i style="width:20px;height:20px;border-radius:50%;background:#ff6b6b;display:block"></i><i style="width:20px;height:20px;border-radius:50%;background:#ffd166;display:block"></i><i style="width:20px;height:20px;border-radius:50%;background:#6bd48c;display:block"></i>
     <div style="margin-left:24px;flex:1;height:50px;border-radius:25px;background:#fff;border:2px solid #dde4f0;display:flex;align-items:center;padding:0 22px;gap:12px;font-weight:600;font-size:25px;color:#6b7690">${ic('link', 26, '#8892a6', 2.2)}yourbusiness.com/guide</div></div>
   <div class="abs" style="left:0;right:0;top:96px;bottom:0;background:linear-gradient(180deg,#0b2252,#12285a)"></div>
   <div class="abs" style="left:56px;top:136px;font-weight:800;font-size:25px;letter-spacing:.2em;color:#d4a84b">FREE GUIDE</div>
   <div class="abs" style="left:56px;top:184px;right:56px;font-weight:900;font-size:64px;line-height:1;letter-spacing:-.035em;color:#fff">Get the <span style="color:#f0cf85">growth checklist.</span></div>
   <div class="abs" style="left:56px;top:332px;right:56px;display:flex;flex-direction:column;gap:14px">
     ${[84, 66].map(w => `<div style="height:16px;width:${w}%;border-radius:9px;background:rgba(255,255,255,.2)"></div>`).join('')}</div>
   <div class="abs" style="left:48px;right:48px;top:420px;height:510px;border-radius:34px;background:#fff;padding:32px;box-shadow:0 40px 80px -20px rgba(0,0,0,.5)">
     <div style="font-weight:800;font-size:25px;color:#8892a6;letter-spacing:.06em;margin-bottom:10px">FULL NAME</div>
     <div id="f1" style="height:84px;border-radius:20px;border:3px solid #dbe3f0;background:#f8fafd;display:flex;align-items:center;padding:0 24px;font-weight:700;font-size:34px;color:#0f1b3d"><span id="f1t"></span><span id="c1" style="display:inline-block;width:3px;height:40px;background:#12285a;margin-left:2px;opacity:0"></span></div>
     <div style="font-weight:800;font-size:25px;color:#8892a6;letter-spacing:.06em;margin:24px 0 10px">EMAIL ADDRESS</div>
     <div id="f2" style="height:84px;border-radius:20px;border:3px solid #dbe3f0;background:#f8fafd;display:flex;align-items:center;padding:0 24px;font-weight:700;font-size:34px;color:#0f1b3d"><span id="f2t"></span><span id="c2" style="display:inline-block;width:3px;height:40px;background:#12285a;margin-left:2px;opacity:0"></span></div>
     <div id="btn" style="margin-top:34px;height:104px;border-radius:30px;background:linear-gradient(135deg,#f0cf85,#d4a84b);color:#12285a;font-weight:900;font-size:36px;display:flex;align-items:center;justify-content:center;gap:14px;box-shadow:0 20px 34px -12px rgba(212,168,75,.8)"><span id="bt">Send me the guide</span></div>
   </div>
   <div id="cur2" class="abs" style="left:0;top:0;width:54px;height:54px;z-index:9;opacity:0;filter:drop-shadow(0 8px 10px rgba(0,0,0,.45))">${ic('cursor', 54)}</div>`;
  LP = { f1: el.querySelector('#f1'), f2: el.querySelector('#f2'), f1t: el.querySelector('#f1t'), f2t: el.querySelector('#f2t'), c1: el.querySelector('#c1'), c2: el.querySelector('#c2'), btn: el.querySelector('#btn'), bt: el.querySelector('#bt'), cur: el.querySelector('#cur2') };
  const n1 = 'Alex Rivera', n2 = 'alex@example.com';
  A(t => {
    const a = P(t, 17.05, 17.55), b = P(t, 17.6, 18.2);
    LP.f1t.textContent = n1.slice(0, Math.floor(a * n1.length));
    LP.f2t.textContent = n2.slice(0, Math.floor(b * n2.length));
    LP.c1.style.opacity = (t > 17.0 && t < 17.6 && Math.floor(t * 8) % 2 === 0) || (t > 17.0 && t < 17.6) ? 1 : 0;
    LP.c2.style.opacity = (t > 17.6 && t < 18.25) ? 1 : 0;
    LP.f1.style.borderColor = (t > 17.0 && t < 17.6) ? '#d4a84b' : '#dbe3f0';
    LP.f2.style.borderColor = (t > 17.6 && t < 18.25) ? '#d4a84b' : '#dbe3f0';
    // cursor path: field1 → field2 → button
    const pts = [[660, 520, 16.8], [330, 560, 17.0], [380, 700, 17.55], [520, 810, 18.2], [540, 822, 18.3]];
    let cx = 700, cy = 1000, o = 0;
    for (let i = 0; i < pts.length - 1; i++) if (t >= pts[i][2] && t < pts[i + 1][2]) { const k = E.io2((t - pts[i][2]) / (pts[i + 1][2] - pts[i][2])); cx = lerp(pts[i][0], pts[i + 1][0], k); cy = lerp(pts[i][1], pts[i + 1][1], k); o = 1; }
    if (t >= pts[pts.length - 1][2]) { cx = pts[pts.length - 1][0]; cy = pts[pts.length - 1][1]; o = 1 - P(t, 18.9, 19.1); }
    LP.cur.style.opacity = t < 16.8 ? 0 : o; LP.cur.style.left = cx + 'px'; LP.cur.style.top = cy + 'px';
    const ck = P(t, 18.3, 18.45), sent = t > 18.45;
    LP.btn.style.transform = `scale(${1 - Math.sin(ck * Math.PI) * .05})`;
    LP.btn.style.background = sent ? 'linear-gradient(135deg,#6fb59c,#4f8a78)' : 'linear-gradient(135deg,#f0cf85,#d4a84b)';
    LP.btn.style.color = sent ? '#fff' : '#12285a';
    LP.bt.innerHTML = sent ? ic('check', 40, '#fff', 4) + ' Guide sent!' : 'Send me the guide';
  });
})();

/* ---- FUNNEL + LEAD CARD ---- */
const fun = panel(WEB, { x: 1020, y: 770, w: 800, h: 580, cls: 'dark', t0: 17.0, dur: 1.0, z: -40, ry: -10, from: [400, 250, -900], ry0: -30 });
(() => {
  const el = fun.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:40px">${ic('filter', 44, '#d4a84b', 2.6)}<span>Sales funnel</span></div>
   <svg class="abs" style="left:30px;top:122px" width="420" height="420" viewBox="0 0 470 470">
     <path class="fs" d="M0,0 L470,0 L420,140 L50,140 Z" fill="#2c5296"/>
     <path class="fs" d="M60,156 L410,156 L360,296 L110,296 Z" fill="#d4a84b"/>
     <path class="fs" d="M120,312 L350,312 L310,452 L160,452 Z" fill="#4f8a78"/>
     <text x="235" y="86" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="#fff">Visitors</text>
     <text x="235" y="242" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="#12285a">Leads</text>
     <text x="235" y="392" text-anchor="middle" font-family="Inter" font-weight="800" font-size="32" fill="#fff">Booked</text>
     <circle id="fdot" r="15" fill="#fff" cx="235" cy="-30" style="filter:drop-shadow(0 0 12px #fff)"/>
   </svg>
   <div id="lead" class="abs" style="left:470px;top:140px;right:26px;border-radius:22px;background:#fff;color:#0f1b3d;padding:22px;opacity:0;box-shadow:0 20px 40px -10px rgba(0,0,0,.5)">
     <div style="display:flex;align-items:center;gap:14px"><div style="width:58px;height:58px;border-radius:50%;background:#12285a;color:#fff;font-weight:800;font-size:28px;display:flex;align-items:center;justify-content:center">A</div><div><div style="font-weight:800;font-size:27px">Alex Rivera</div><div style="font-size:21px;color:#8892a6;font-weight:600">via guide form</div></div></div>
     <div style="margin-top:16px"><span class="chip" style="background:#f7ecd0;color:#8a6418;font-size:21px">NEW LEAD</span></div></div>
   <div id="crm" class="abs" style="left:470px;top:320px;right:26px;display:flex;flex-direction:column;gap:14px;opacity:0">
     ${['Follow-up email', 'Add to CRM', 'Book intro call'].map(x => `<div style="display:flex;align-items:center;gap:12px;font-weight:700;font-size:23px;color:#c9d6ee"><i class="cb" style="width:30px;height:30px;border-radius:50%;border:3px solid #55688f;display:flex;align-items:center;justify-content:center;flex:none"></i>${x}</div>`).join('')}</div>`;
  const dot = el.querySelector('#fdot'), lead = el.querySelector('#lead'), crm = el.querySelector('#crm'), cbs = [...el.querySelectorAll('.cb')];
  A(t => {
    const k = P(t, 18.45, 19.6);
    dot.setAttribute('cy', lerp(-30, 440, E.io3(k)));
    dot.setAttribute('cx', 235 + Math.sin(k * 9) * 12 * (1 - k * .5));
    dot.style.opacity = k > 0 && k < 1 ? 1 : 0;
    const l = E.back(P(t, 18.55, 18.95));
    lead.style.opacity = clamp(l * 2); lead.style.transform = `translateX(${(1 - l) * 60}px)`;
    crm.style.opacity = E.out3(P(t, 18.9, 19.2));
    cbs.forEach((c, i) => { const p = P(t, 19.1 + i * .3, 19.3 + i * .3); c.style.background = p > 0 ? '#d4a84b' : 'transparent'; c.style.borderColor = p > 0 ? '#d4a84b' : '#55688f'; c.innerHTML = p > 0 ? ic('check', 18, '#12285a', 4) : ''; });
  });
})();
