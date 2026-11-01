/* ===== RESEARCH & LEAD GENERATION station (scene 5a) ===== */
const RES = station('res', [17.6, 23.2]);
div('ghost', `left:-900px;top:-1250px;font-size:400px;transform:translateZ(-260px)`, 'RESEARCH', RES.el);
const BIZ = [
  ['Brightway Dental', 'Healthcare', '#12285a'], ['Oakline Coaching', 'Coaching', '#b8892f'], ['Summit Realty', 'Real estate', '#4b78b5'], ['Willow Wellness', 'Wellness', '#4f8a78'],
  ['Pioneer Fitness', 'Fitness', '#b0654a'], ['Cedar Law Group', 'Legal', '#2c5296'], ['Lakeview Designs', 'Design', '#5b6577'], ['Harbor Consulting', 'Consulting', '#12285a'],
];
const monogram = (b, sz = 60) => `<div style="width:${sz}px;height:${sz}px;border-radius:${sz * .28}px;background:${b[2]};color:#fff;font-weight:900;font-size:${sz * .5}px;display:flex;align-items:center;justify-content:center;flex:none">${b[0][0]}</div>`;

/* profile list panel */
const PX = -640, PYc = 0, PW = 780, PH = 1180;
const prof = panel(RES, { x: PX, y: PYc, w: PW, h: PH, t0: 18.7, dur: 1.0, ry: 12, z: -30, from: [-500, 0, -900], ry0: 34 });
const profCards = [];
(() => {
  const el = prof.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:42px">${ic('search', 44, '#12285a', 2.6)}<span>Business research</span></div>
   <div class="abs" style="left:30px;right:30px;top:126px;height:84px;border-radius:42px;background:#f3f6fb;border:3px solid #dbe3f0;display:flex;align-items:center;padding:0 28px;gap:16px;font-weight:700;font-size:28px;color:#6b7690">${ic('search', 34, '#8892a6', 2.4)}<span id="qtxt"></span></div>`;
  const q = el.querySelector('#qtxt'); const qs = 'Services · Remote-friendly';
  A(t => { q.textContent = qs.slice(0, Math.floor(P(t, 19.2, 19.9) * qs.length)); });
  BIZ.forEach((b, i) => {
    const d = div('abs', `left:30px;top:${236 + i * 118}px;width:${PW - 60}px;height:104px;border-radius:24px;background:#fff;border:3px solid #e6ecf6;display:flex;align-items:center;padding:0 24px;gap:22px;box-shadow:0 10px 22px -12px rgba(18,40,90,.35);opacity:0`,
      `${monogram(b, 70)}<div style="flex:1"><div style="font-weight:800;font-size:33px;color:#0f1b3d">${b[0]}</div><div style="font-weight:600;font-size:24px;color:#7b869b;margin-top:2px">${b[1]}</div></div>${ic('star', 32, '#cdd5e4', 2.2)}`, el);
    profCards.push(d);
  });
})();
const cardStart = i => [PX, -PH / 2 + 236 + i * 118 + 52];

/* CRM prospect table */
const TX = 480, TW = 940, TH = 1180;
const tbl = panel(RES, { x: TX, y: 0, w: TW, h: TH, t0: 18.9, dur: 1.0, ry: -10, z: -20, from: [500, 0, -900], ry0: -34 });
const rowEls = [], chipEls = [];
const rowPos = i => [TX, -TH / 2 + 190 + i * 118 + 55];
(() => {
  const el = tbl.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:42px">${ic('grid', 44, '#12285a', 2.4)}<span>Prospect list</span><span style="flex:1"></span><span class="chip" style="background:#f7ecd0;color:#8a6418">CRM</span></div>
   <div class="abs" style="left:30px;right:30px;top:118px;height:56px;display:flex;align-items:center;font-weight:800;font-size:23px;color:#8892a6;letter-spacing:.14em"><div style="width:470px;padding-left:94px">COMPANY</div><div style="flex:1">STATUS</div></div>`;
  BIZ.forEach((b, i) => {
    const d = div('abs', `left:30px;top:${190 + i * 118}px;width:${TW - 60}px;height:110px;border-radius:22px;background:#f8fafd;border:3px solid #eaeff7;display:flex;align-items:center;padding:0 24px;gap:22px;opacity:0`,
      `${monogram(b, 66)}<div style="width:330px"><div style="font-weight:800;font-size:31px;color:#0f1b3d">${b[0]}</div><div style="font-weight:600;font-size:23px;color:#7b869b">${b[1]}</div></div><div class="stc" style="flex:1"></div>`, el);
    rowEls.push(d); chipEls.push(d.querySelector('.stc'));
  });
  const status = ['q', 'q', 'n', 'q', 'n', 'q', 'q', 'n'];
  const ST = { new: ['#e4ebf8', '#12285a', 'NEW'], q: ['#f7ecd0', '#8a6418', 'QUALIFIED'], n: ['#e5ecea', '#2f6a58', 'NURTURE'], r: ['#d6ebe3', '#1f6a50', 'OUTREACH READY'] };
  A(t => {
    rowEls.forEach((d, i) => {
      const land = 20.55 + i * .17 + 1.0;
      const k = E.out3(P(t, land - .1, land + .2));
      d.style.opacity = k;
      const flash = Math.max(0, 1 - Math.abs(t - land) / .35);
      d.style.borderColor = flash > 0 ? `rgba(212,168,75,${flash})` : '#eaeff7';
      d.style.background = flash > 0 ? `rgb(${lerp(248, 253, flash)},${lerp(250, 244, flash)},${lerp(253, 222, flash)})` : '#f8fafd';
      const q1 = t > 21.2 + i * .1, r1 = t > 22.0 && (i < 3);
      let key = 'new'; if (q1) key = status[i]; if (r1 && status[i] === 'q') key = 'r';
      const [bg, fg, tx] = ST[key];
      chipEls[i].innerHTML = `<span class="chip" style="background:${bg};color:${fg};font-size:22px;letter-spacing:.06em">${tx}</span>`;
    });
  });
})();

/* flying business cards */
(() => {
  const fl = BIZ.map((b, i) => div('', `position:absolute;left:0;top:0;width:720px;height:104px;border-radius:24px;background:#fff;border:3px solid ${GOLD};display:flex;align-items:center;padding:0 24px;gap:22px;box-shadow:0 30px 50px -14px rgba(0,0,0,.55),0 0 40px rgba(212,168,75,.45);opacity:0;z-index:4`,
    `${monogram(b, 70)}<div style="flex:1"><div style="font-weight:800;font-size:33px;color:#0f1b3d">${b[0]}</div><div style="font-weight:600;font-size:24px;color:#7b869b;margin-top:2px">${b[1]}</div></div>`, RES.el));
  A(t => {
    fl.forEach((el, i) => {
      const ts = 20.55 + i * .17, k = P(t, ts, ts + 1.0);
      // list card appearance (before fly)
      const appear = E.back(P(t, 19.45 + i * .07, 19.8 + i * .07));
      profCards[i].style.opacity = k > 0 ? 0 : clamp(appear * 2);
      profCards[i].style.transform = `scale(${lerp(.85, 1, Math.min(1, appear))})`;
      const s0 = cardStart(i), s1 = rowPos(i), e = E.io3(k);
      const x = lerp(s0[0], s1[0], e), y = lerp(s0[1], s1[1], e) - Math.sin(e * Math.PI) * 140, z = Math.sin(e * Math.PI) * 220 + 20;
      el.style.opacity = (k > 0 && k < 1) ? 1 : 0;
      el.style.transform = `translate3d(${x}px,${y}px,${z}px) translate(-50%,-50%) rotate(${Math.sin(e * Math.PI) * -3}deg) scale(${lerp(1, 1.04, Math.sin(e * Math.PI))})`;
      el.style.width = lerp(720, 880, e) + 'px';
    });
  });
})();

/* outreach draft */
const draft = panel(RES, { x: 460, y: 880, w: 880, h: 440, t0: 20.9, dur: 1.0, ry: -9, z: -10, from: [400, 200, -900], ry0: -30 });
(() => {
  const el = draft.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:40px">${ic('mail', 42, '#12285a', 2.4)}<span>Outreach draft</span><span style="flex:1"></span><span class="chip" style="background:#d6ebe3;color:#1f6a50">PERSONALIZED</span></div>
   <div class="abs" style="left:36px;top:128px;right:36px;display:flex;align-items:center;gap:14px;font-weight:700;font-size:26px;color:#8892a6">TO <span class="chip" style="background:#e4ebf8;color:#12285a;font-size:25px">Brightway Dental</span></div>
   <div class="abs" style="left:36px;top:190px;right:36px;font-weight:800;font-size:33px;color:#0f1b3d">Quick idea for Brightway Dental</div>
   <div class="abs" id="dl" style="left:36px;top:256px;right:36px"></div>
   <div class="abs" style="right:36px;bottom:28px;padding:16px 34px;border-radius:99px;background:#12285a;color:#fff;font-weight:800;font-size:27px">Ready to send</div>`;
  const dl = el.querySelector('#dl');
  const ls = [100, 94, 98, 60].map(w => div('sk', `width:${w}%;height:17px;margin-bottom:20px;transform-origin:left`, '', dl));
  A(t => ls.forEach((l, i) => l.style.transform = `scaleX(${E.out3(P(t, 21.4 + i * .15, 21.9 + i * .15))})`));
})();
