/* ===== CREATIVE PRODUCTION station (scene 5b) ===== */
const CON = station('con', [20.7, 28.5]);
div('ghost', `left:-900px;top:-1200px;font-size:400px;transform:translateZ(-260px)`, 'CONTENT', CON.el);
const PH_T0 = 21.9; // station arrival time

/* ---- PREVIEW (vertical video) ---- */
const prev = panel(CON, { x: -600, y: -110, w: 460, h: 880, cls: 'dark', css: 'background:transparent;box-shadow:0 60px 100px -20px rgba(1,6,20,.85);border-radius:66px', t0: 21.9, dur: 1.0, z: 30, ry: 11, from: [-400, 0, -900], ry0: 36 });
(() => {
  const el = prev.el;
  el.innerHTML = `<div class="abs" style="inset:0;background:#0b1226;border-radius:66px"></div>
   <div class="abs" style="left:14px;top:14px;right:14px;bottom:14px;border-radius:54px;overflow:hidden;background:linear-gradient(160deg,#0b2252,#2c5296 60%,#12285a)">
     <div id="va" class="abs" style="inset:-40px"><div class="abs" style="left:150px;top:90px;width:300px;height:300px;border-radius:50%;background:linear-gradient(135deg,#f0cf85,#b8892f)"></div>
       <div class="abs" style="left:-80px;top:380px;width:340px;height:340px;border-radius:50%;border:34px solid rgba(255,255,255,.12)"></div>
       <div class="abs" style="left:270px;top:480px;width:200px;height:200px;border-radius:50%;background:rgba(75,120,181,.55)"></div></div>
     <div class="abs" style="left:24px;top:30px;display:flex;gap:10px"><span class="chip" style="background:rgba(255,255,255,.16);color:#fff;font-size:20px"><i id="rec" style="display:block;width:14px;height:14px;border-radius:50%;background:#ff6b6b"></i>EDITING</span></div>
     <div id="cap" class="abs" style="left:26px;right:26px;bottom:150px;text-align:center;font-weight:900;font-size:50px;line-height:1.05;letter-spacing:-.02em;color:#fff;text-shadow:0 4px 18px rgba(0,0,0,.5)"></div>
     <div class="abs" style="left:30px;right:30px;bottom:56px;height:10px;border-radius:5px;background:rgba(255,255,255,.22)"><div id="vp" style="height:10px;border-radius:5px;width:0;background:#d4a84b"></div></div>
   </div>`;
  const cap = el.querySelector('#cap'), vp = el.querySelector('#vp'), va = el.querySelector('#va'), rec = el.querySelector('#rec');
  const words = ['YOUR', 'STORY,', 'TOLD', 'WELL.'];
  cap.innerHTML = words.map(w => `<span class="cw" style="display:inline-block;margin:0 7px">${w}</span>`).join('');
  const cws = [...cap.querySelectorAll('.cw')];
  A(t => {
    const p = P(t, 22.8, 24.7);
    vp.style.width = (p * 100) + '%';
    va.style.transform = `scale(${1 + p * .12}) translate(${p * -16}px,${p * -10}px)`;
    rec.style.opacity = Math.floor(t * 2.2) % 2 ? .25 : 1;
    cws.forEach((w, i) => {
      const k = P(t, 22.9 + i * .38, 23.15 + i * .38);
      w.style.color = (t > 22.9 + i * .38) ? (t < 23.3 + i * .38 ? '#f0cf85' : '#fff') : 'rgba(255,255,255,.35)';
      w.style.transform = `scale(${1 + Math.sin(k * Math.PI) * .12})`;
    });
  });
})();

/* ---- TIMELINE ---- */
const TLW = 1440, TLH = 540;
const tlp = panel(CON, { x: -20, y: 730, w: TLW, h: TLH, cls: 'dark', t0: 22.0, dur: 1.0, z: -10, from: [0, 300, -900], rx0: 28, ry0: 0 });
(() => {
  const el = tlp.el;
  const LX = 180, RX = TLW - 36; // track x range
  let h = `<div class="ph" style="gap:18px;font-size:38px;height:92px">${ic('film', 42, '#d4a84b', 2.4)}<span>Video editor</span><span style="flex:1"></span><span class="chip" style="background:rgba(212,168,75,.16);color:#f0cf85;font-size:22px">9:16</span><span class="chip" style="background:rgba(255,255,255,.08);color:#c9d6ee;font-size:22px">CAPTIONS</span></div>`;
  // ruler
  for (let i = 0; i <= 12; i++) h += `<div class="abs" style="left:${LX + i * ((RX - LX) / 12)}px;top:104px;width:2px;height:${i % 2 ? 12 : 22}px;background:rgba(255,255,255,.25)"></div>`;
  const tracks = ['V1', 'V2', 'CC', 'A1'];
  tracks.forEach((n, i) => { h += `<div class="abs" style="left:28px;top:${142 + i * 98}px;width:130px;height:84px;border-radius:14px;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:25px;color:#8fa2c6;letter-spacing:.08em">${n}</div><div class="abs" style="left:${LX}px;right:36px;top:${142 + i * 98}px;height:84px;border-radius:14px;background:rgba(255,255,255,.035)"></div>`; });
  el.insertAdjacentHTML('beforeend', h);
  const tw = RX - LX;
  const clips = [
    [0, 0, .24, '#2c5296'], [0, .25, .3, '#12285a'], [0, .56, .2, '#4b78b5'], [0, .77, .23, '#2c5296'],
    [1, .1, .18, '#b8892f'], [1, .48, .22, '#d4a84b'],
    [2, .04, .1, '#4f8a78'], [2, .16, .1, '#4f8a78'], [2, .28, .12, '#4f8a78'], [2, .42, .1, '#4f8a78'], [2, .54, .14, '#4f8a78'], [2, .7, .1, '#4f8a78'], [2, .82, .12, '#4f8a78'],
  ];
  const CL = clips.map((c, i) => div('abs', `left:${LX + c[1] * tw + 4}px;top:${142 + c[0] * 98 + 6}px;width:${c[2] * tw - 8}px;height:72px;border-radius:12px;background:${c[3]};box-shadow:0 8px 16px -8px rgba(0,0,0,.6);transform-origin:left;display:flex;align-items:center;padding:0 12px;overflow:hidden`,
    c[0] === 2 ? `<div class="sk" style="width:100%;height:10px;background:rgba(255,255,255,.55)"></div>` : `<div style="display:flex;gap:6px;width:100%">${[0, 1, 2, 3, 4, 5, 6, 7].map(() => `<i style="display:block;flex:1;height:48px;border-radius:6px;background:rgba(255,255,255,.14)"></i>`).join('')}</div>`, el));
  // audio waveform
  const nb = 64; const wf = []; const wfw = tw / nb;
  for (let i = 0; i < nb; i++) wf.push(div('abs', `left:${LX + i * wfw + 2}px;width:${wfw - 4}px;bottom:${540 - (142 + 3 * 98 + 78)}px;background:#d4a84b;border-radius:3px;opacity:.9`, '', el));
  const play = div('abs', `top:100px;width:4px;height:${TLH - 112}px;background:#fff;border-radius:2px;box-shadow:0 0 16px rgba(255,255,255,.8);z-index:5`, `<div style="position:absolute;left:-14px;top:-4px;width:32px;height:28px;background:#fff;clip-path:polygon(0 0,100% 0,50% 100%)"></div>`, el);
  A(t => {
    CL.forEach((c, i) => { const k = E.out5(P(t, 22.5 + i * .06, 22.95 + i * .06)); c.style.opacity = clamp(k * 3); c.style.transform = `scaleX(${k})`; });
    const p = P(t, 22.8, 24.7);
    play.style.left = (LX + p * tw - 2) + 'px'; play.style.opacity = P(t, 22.7, 22.9);
    wf.forEach((b, i) => {
      const amp = (.3 + .7 * Math.abs(Math.sin(i * .7) * Math.cos(i * .21 + 1))) * (.55 + .45 * Math.abs(Math.sin(t * 7 + i * .9)));
      const kk = E.out3(P(t, 22.6 + i * .006, 23.1 + i * .006));
      b.style.height = (62 * amp * kk) + 'px';
      b.style.background = (i / nb < p) ? '#f0cf85' : '#8a6a2a';
    });
  });
})();

/* ---- PODCAST ---- */
const pod = panel(CON, { x: -30, y: -340, w: 760, h: 540, cls: 'dark', t0: 22.2, dur: 1.0, z: -40, ry: -8, from: [300, -100, -900], ry0: -30 });
(() => {
  const el = pod.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:40px">${ic('mic', 44, '#d4a84b', 2.4)}<span>Podcast</span><span style="flex:1"></span><span class="chip" style="background:rgba(255,255,255,.08);color:#c9d6ee;font-size:22px">EPISODE 12</span></div>
   <div class="abs" style="left:38px;top:126px;display:flex;gap:22px;align-items:center">
     <div style="width:118px;height:118px;border-radius:26px;background:linear-gradient(135deg,#d4a84b,#12285a);display:flex;align-items:center;justify-content:center">${ic('mic', 60, '#fff', 2)}</div>
     <div><div style="font-weight:900;font-size:38px;color:#fff;letter-spacing:-.02em">Growing a Business</div><div class="sk" style="width:260px;height:14px;margin-top:14px"></div></div></div>
   <div id="pw" class="abs" style="left:38px;right:38px;top:290px;height:170px;display:flex;align-items:center;gap:5px"></div>
   <div class="abs" style="left:38px;right:38px;top:480px;height:8px;border-radius:4px;background:rgba(255,255,255,.14)"><div id="pp" style="height:8px;border-radius:4px;background:#d4a84b;width:0"></div></div>`;
  const pw = el.querySelector('#pw'), pp = el.querySelector('#pp');
  const N = 48; const bars = [];
  for (let i = 0; i < N; i++) bars.push(div('', `flex:1;border-radius:4px;background:#d4a84b;height:10px`, '', pw));
  A(t => {
    const p = P(t, 22.9, 24.7);
    pp.style.width = (p * 100) + '%';
    bars.forEach((b, i) => {
      const env = .35 + .65 * Math.abs(Math.sin(i * .38 + 1) * Math.cos(i * .13));
      const m = .5 + .5 * Math.abs(Math.sin(t * 6.5 + i * .8));
      const k = E.out3(P(t, 22.5 + i * .01, 23.0 + i * .01));
      b.style.height = (160 * env * m * k + 8) + 'px';
      b.style.background = (i / N < p) ? '#f0cf85' : '#8a6a2a';
    });
  });
})();

/* ---- SHORT-FORM ---- */
const shorts = panel(CON, { x: -30, y: 150, w: 760, h: 420, cls: 'dark', t0: 22.35, dur: 1.0, z: -20, ry: -8, from: [300, 100, -900], ry0: -30 });
(() => {
  const el = shorts.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:40px">${ic('play', 40, '#d4a84b', 2)}<span>Short-form clips</span><span style="flex:1"></span><span class="chip" style="background:rgba(212,168,75,.16);color:#f0cf85;font-size:22px">REPURPOSED</span></div>`;
  const arts = [
    ['linear-gradient(160deg,#12285a,#2c5296)', '#d4a84b', '0:15'], ['linear-gradient(160deg,#f4ead2,#e7d6a8)', '#12285a', '0:22'], ['linear-gradient(160deg,#2c5296,#0b2252)', '#f0cf85', '0:30'],
  ];
  const th = arts.map((a, i) => div('abs', `left:${44 + i * 232}px;top:122px;width:200px;height:276px;border-radius:24px;background:${a[0]};overflow:hidden;box-shadow:0 16px 30px -10px rgba(0,0,0,.6);opacity:0`,
    `<div class="abs" style="left:50px;top:30px;width:120px;height:120px;border-radius:50%;background:${a[1]};opacity:.9"></div>
     <div class="abs" style="left:-30px;top:150px;width:130px;height:130px;border-radius:50%;border:16px solid rgba(255,255,255,.18)"></div>
     <div class="abs" style="left:50%;top:92px;width:64px;height:64px;margin-left:-32px;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center">${ic('play', 30, '#12285a', 2)}</div>
     <div class="abs" style="left:14px;right:14px;bottom:42px;height:20px"><div style="height:10px;width:70%;background:${a[2] === '0:22' ? '#12285a' : '#fff'};border-radius:5px;opacity:.9"></div></div>
     <span class="chip" style="position:absolute;right:12px;top:12px;background:rgba(5,15,38,.7);color:#fff;font-size:20px;padding:4px 12px">${a[2]}</span>
     <div class="abs" style="left:10px;right:10px;bottom:10px;height:22px;border-radius:8px;background:rgba(255,255,255,.88);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#12285a;letter-spacing:.1em">CAPTIONS</div>`, el));
  A(t => th.forEach((d, i) => { const k = E.back2(P(t, 23.1 + i * .22, 23.55 + i * .22)); d.style.opacity = clamp(k * 2); d.style.transform = `translateY(${(1 - k) * 60}px) scale(${lerp(.7, 1, k)})`; }));
})();
