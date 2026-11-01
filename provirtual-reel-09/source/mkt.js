/* ===== DIGITAL MARKETING station (scene 3) ===== */
const MKT = station('mkt', [7.5, 14.8]);
div('ghost', `left:-700px;top:-1230px;font-size:400px;transform:translateZ(-260px)`, 'MARKETING', MKT.el);

/* ---- CONTENT CALENDAR (hero) ---- */
const calW = 940, calH = 1100, GX = 30, GTOP = 176, CWD = (calW - 60) / 7, RH = 172;
const mcal = panel(MKT, { x: 0, y: 0, w: calW, h: calH, t0: 8.7, dur: 1.1, ry: 0, from: [0, 200, -900], ry0: 0, rx0: 30 });
const POSTS = [
  [0, 1, 'play', '#12285a'], [1, 2, 'image', '#d4a84b'], [1, 0, 'doc', '#4b78b5'], [2, 3, 'play', '#4f8a78'], [0, 4, 'image', '#12285a'],
  [2, 1, 'image', '#4b78b5'], [3, 2, 'play', '#d4a84b'], [0, 6, 'doc', '#4f8a78'], [2, 5, 'play', '#12285a'], [3, 4, 'image', '#4b78b5'], [1, 5, 'doc', '#d4a84b'], [3, 0, 'image', '#4f8a78'],
];
const POSTEL = [];
(() => {
  const el = mcal.el;
  let h = `<div class="ph" style="gap:20px;font-size:44px">${ic('cal', 48, '#12285a', 2.4)}<span>Content calendar</span><span style="flex:1"></span>
    <span class="chip" style="background:#e4ebf8;color:#12285a">Reels</span><span class="chip" style="background:#f7ecd0;color:#8a6418">Posts</span></div>`;
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, i) => { h += `<div class="abs" style="left:${GX + i * CWD}px;top:122px;width:${CWD}px;text-align:center;font-weight:800;font-size:27px;color:#8892a6;letter-spacing:.1em">${d}</div>`; });
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    h += `<div class="abs" style="left:${GX + c * CWD + 5}px;top:${GTOP + r * RH + 5}px;width:${CWD - 10}px;height:${RH - 10}px;border-radius:18px;background:#f3f6fb;border:2px dashed #dbe3f0"><div style="position:absolute;left:12px;top:8px;font-weight:700;font-size:20px;color:#b3bccd">${r * 7 + c + 1}</div></div>`;
  }
  el.insertAdjacentHTML('beforeend', h);
  POSTS.forEach((p, i) => {
    const d = div('abs', `left:${GX + p[1] * CWD + 5}px;top:${GTOP + p[0] * RH + 5}px;width:${CWD - 10}px;height:${RH - 10}px;border-radius:18px;background:#fff;box-shadow:0 14px 28px -10px rgba(18,40,90,.4);border-left:9px solid ${p[3]};padding:34px 12px 0 14px;opacity:0`,
      `<div style="position:absolute;left:14px;top:12px;width:40px;height:40px;border-radius:12px;background:${p[3]};display:flex;align-items:center;justify-content:center">${ic(p[2], 22, '#fff', 2.4)}</div>
       <div class="sk" style="width:80%;height:11px;margin-top:30px"></div><div class="sk" style="width:55%;height:11px;margin-top:10px"></div>`, el);
    POSTEL.push(d);
  });
})();
const cellPos = (r, c) => [-calW / 2 + GX + c * CWD + CWD / 2, -calH / 2 + GTOP + r * RH + RH / 2];

/* ---- AUDIENCE RESEARCH ---- */
const aud = panel(MKT, { x: -930, y: -300, w: 740, h: 920, t0: 8.9, dur: 1.2, z: -70, ry: 15, from: [-500, 0, -900], ry0: 38 });
const INS = [['Busy owners', 'user', '#12285a'], ['Behind the scenes', 'film', '#4b78b5'], ['Short video', 'play', '#4f8a78'], ['Weekly tips', 'bolt', '#b8892f'], ['Local community', 'globe', '#12285a']];
const INSPOS = []; // start pos in station coords
(() => {
  const el = aud.el;
  let h = `<div class="ph" style="gap:18px;font-size:42px">${ic('search', 44, '#12285a', 2.6)}<span>Audience research</span></div>
   <div class="abs" style="left:40px;top:128px;font-weight:800;font-size:25px;letter-spacing:.14em;color:#8892a6">TOP INTERESTS</div>`;
  const bars = [['Small business', .86], ['Wellness', .6], ['Local events', .74], ['Home & living', .48], ['Travel', .35]];
  bars.forEach((b, i) => {
    h += `<div class="abs" style="left:40px;right:40px;top:${176 + i * 74}px;height:58px">
      <div style="font-weight:700;font-size:26px;color:#1d2a4d;margin-bottom:6px">${b[0]}</div>
      <div style="height:16px;border-radius:9px;background:#edf1f8"><div class="bar" data-w="${b[1]}" style="height:16px;border-radius:9px;width:0;background:linear-gradient(90deg,#12285a,#2c5296)"></div></div></div>`;
  });
  h += `<div class="abs" style="left:40px;top:572px;font-weight:800;font-size:25px;letter-spacing:.14em;color:#8892a6">AUDIENCE MIX</div>
   <svg class="abs" style="left:40px;top:616px" width="250" height="250" viewBox="0 0 250 250"><g transform="rotate(-90 125 125)" fill="none" stroke-width="40">
     <circle cx="125" cy="125" r="85" stroke="#edf1f8"/>
     <circle class="dn" data-a="0" data-l=".42" cx="125" cy="125" r="85" stroke="#12285a" stroke-dasharray="0 600"/>
     <circle class="dn" data-a=".42" data-l=".3" cx="125" cy="125" r="85" stroke="#d4a84b" stroke-dasharray="0 600"/>
     <circle class="dn" data-a=".72" data-l=".28" cx="125" cy="125" r="85" stroke="#4b78b5" stroke-dasharray="0 600"/></g></svg>
   <div class="abs" style="left:330px;top:640px;right:40px;display:flex;flex-direction:column;gap:18px">
     ${[['#12285a', 'Owners'], ['#d4a84b', 'Creators'], ['#4b78b5', 'Managers']].map(x => `<div style="display:flex;align-items:center;gap:14px;font-weight:700;font-size:27px;color:#1d2a4d"><i style="display:block;width:22px;height:22px;border-radius:7px;background:${x[0]}"></i>${x[1]}</div>`).join('')}
   </div>`;
  el.insertAdjacentHTML('beforeend', h);
  const bs = [...el.querySelectorAll('.bar')], ds = [...el.querySelectorAll('.dn')];
  A(t => {
    bs.forEach((b, i) => b.style.width = (+b.dataset.w * 100 * E.out5(P(t, 9.5 + i * .12, 10.2 + i * .12))) + '%');
    ds.forEach(d => { const L = +d.dataset.l * 534 * E.out5(P(t, 9.8, 10.8)); d.setAttribute('stroke-dasharray', `${L} 600`); d.setAttribute('stroke-dashoffset', -(+d.dataset.a * 534)); });
  });
})();

/* ---- COMPETITOR ANALYSIS ---- */
const comp = panel(MKT, { x: -850, y: 720, w: 800, h: 580, t0: 9.1, dur: 1.2, z: -90, ry: 14, from: [-500, 80, -900], ry0: 36 });
(() => {
  const el = comp.el;
  const rows = [['Posting rhythm', [3, 2, 4]], ['Content mix', [2, 4, 3]], ['Brand voice', [4, 2, 2]]];
  let h = `<div class="ph" style="gap:18px;font-size:40px">${ic('grid', 42, '#12285a', 2.4)}<span>Competitor analysis</span></div>
    <div class="abs" style="left:220px;right:30px;top:120px;display:flex;font-weight:800;font-size:25px;color:#12285a;letter-spacing:.04em">${['BRAND A', 'BRAND B', 'BRAND C'].map(b => `<div style="flex:1;text-align:center">${b}</div>`).join('')}</div>`;
  rows.forEach((r, i) => {
    h += `<div class="abs" style="left:0;right:0;top:${176 + i * 108}px;height:100px;display:flex;align-items:center;padding:0 30px;border-top:2px solid #eef1f7">
      <div style="width:190px;font-weight:700;font-size:27px;color:#1d2a4d;line-height:1.15">${r[0]}</div>
      ${r[1].map((v, j) => `<div style="flex:1;display:flex;gap:7px;justify-content:center">${[0, 1, 2, 3].map(k => `<i class="dt" data-k="${i * 12 + j * 4 + k}" style="display:block;width:20px;height:20px;border-radius:50%;background:${k < v ? '#12285a' : '#dbe3f0'};transform:scale(0)"></i>`).join('')}</div>`).join('')}
    </div>`;
  });
  h += `<div class="abs" id="gap" style="left:30px;right:30px;top:504px;height:56px;border-radius:16px;background:#f7ecd0;display:flex;align-items:center;gap:14px;padding:0 20px;font-weight:800;font-size:26px;color:#8a6418;opacity:0">${ic('star', 30, '#b8892f', 2.4)}Opportunity: consistent short-form video</div>`;
  el.insertAdjacentHTML('beforeend', h);
  const dts = [...el.querySelectorAll('.dt')], gp = el.querySelector('#gap');
  A(t => {
    dts.forEach(d => { const k = +d.dataset.k; d.style.transform = `scale(${E.back(P(t, 10.0 + k * .03, 10.3 + k * .03))})`; });
    const g = E.out5(P(t, 11.3, 11.8)); gp.style.opacity = g; gp.style.transform = `translateY(${(1 - g) * 20}px)`;
  });
})();

/* ---- PHONES (post previews) ---- */
function phoneHTML(art, name) {
  return `<div class="abs" style="inset:0;background:#0b1226;border-radius:66px"></div>
  <div class="abs" style="left:14px;top:14px;right:14px;bottom:14px;background:#fff;border-radius:54px;overflow:hidden">
    <div class="abs" style="left:50%;top:12px;width:110px;height:30px;margin-left:-55px;border-radius:20px;background:#0b1226;z-index:3"></div>
    <div class="abs" style="left:0;right:0;top:62px;height:84px;display:flex;align-items:center;padding:0 26px;gap:16px">
      <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#d4a84b,#12285a)"></div>
      <div><div style="font-weight:800;font-size:25px;color:#0f1b3d">${name}</div><div class="sk" style="width:90px;height:10px;margin-top:8px"></div></div>
    </div>
    <div class="abs" style="left:0;right:0;top:146px;height:${'${S}'}px;overflow:hidden">${art}</div>
    <div class="abs hrow" style="left:26px;top:${'${H}'}px;display:flex;gap:22px;align-items:center">${ic('heart', 40, '#0f1b3d', 2.2)}${ic('chat', 40, '#0f1b3d', 2.2)}${ic('share', 40, '#0f1b3d', 2.2)}</div>
    <div class="abs" style="left:26px;top:${'${L}'}px;right:26px"><div class="sk" style="width:92%;height:13px"></div><div class="sk" style="width:70%;height:13px;margin-top:12px"></div></div>
  </div>`;
}
function phone(x, y, art, name, t0, ry) {
  const w = 400, h = 800, S = 372, Hh = 146 + S + 18, L = Hh + 66;
  const html = phoneHTML(art, name).replace('${S}', S).replace('${H}', Hh - 146 + 146).replace('${L}', L);
  const p = panel(MKT, { x, y, w, h, cls: 'dark', css: 'background:transparent;box-shadow:0 60px 100px -20px rgba(1,6,20,.8);border-radius:66px', html, t0, dur: 1.1, z: 30, ry, from: [500, 40, -800], ry0: -40 });
  return p;
}
const artA = `<div class="abs" style="inset:0;background:linear-gradient(135deg,#12285a,#2c5296)"></div>
  <div class="abs" style="left:150px;top:-40px;width:340px;height:340px;border-radius:50%;background:linear-gradient(135deg,#f0cf85,#b8892f)"></div>
  <div class="abs" style="left:-60px;top:230px;width:260px;height:260px;border-radius:50%;border:26px solid rgba(255,255,255,.14)"></div>
  <div class="abs" style="left:34px;bottom:34px;font-weight:900;font-size:62px;line-height:.95;color:#fff;letter-spacing:-.03em">BIG IDEAS<br><span style="color:#f0cf85">START HERE.</span></div>`;
const artB = `<div class="abs" style="inset:0;background:#f4ead2"></div>
  <div class="abs" style="left:0;right:0;bottom:0;height:200px;display:flex;align-items:flex-end;gap:18px;padding:0 34px">
    ${[.5, .8, .65, 1, .75].map((v, i) => `<div style="flex:1;height:${v * 190}px;background:${i === 3 ? '#d4a84b' : '#12285a'};border-radius:12px 12px 0 0"></div>`).join('')}</div>
  <div class="abs" style="left:34px;top:36px;font-weight:900;font-size:60px;line-height:.95;color:#12285a;letter-spacing:-.03em">3 TIPS<br><span style="color:#b8892f">FOR GROWTH.</span></div>`;
const phA = phone(840, -330, artA, 'yourbrand', 8.9, -15);
const phB = phone(1260, -120, artB, 'yourbrand', 9.1, -12);
A(t => {
  [phA, phB].forEach((p, i) => {
    const hr = p.el.querySelector('.hrow svg');
    const k = E.back(P(t, 12.3 + i * .55, 12.7 + i * .55));
    if (k > 0) { hr.setAttribute('fill', '#d4a84b'); hr.setAttribute('stroke', '#d4a84b'); hr.style.transform = `scale(${lerp(.6, 1.15, Math.min(1, k))})`; }
    else { hr.setAttribute('fill', 'none'); hr.setAttribute('stroke', '#0f1b3d'); hr.style.transform = ''; }
  });
});

/* ---- CAMPAIGN PLAN (gantt) ---- */
const gan = panel(MKT, { x: 920, y: 680, w: 840, h: 600, t0: 9.2, dur: 1.2, z: -50, ry: -12, from: [500, 100, -900], ry0: -34 });
(() => {
  const el = gan.el;
  const rows = [['Awareness', 0, .5, '#12285a'], ['Launch', .25, .75, '#d4a84b'], ['Promote', .45, 1, '#4b78b5'], ['Review', .75, 1, '#4f8a78']];
  let h = `<div class="ph" style="gap:18px;font-size:40px">${ic('flag', 42, '#12285a', 2.4)}<span>Campaign plan</span><span style="flex:1"></span><span class="chip" style="background:#e4ebf8;color:#12285a">4 weeks</span></div>`;
  ['W1', 'W2', 'W3', 'W4'].forEach((w, i) => { h += `<div class="abs" style="left:${220 + i * 148}px;top:124px;width:148px;text-align:center;font-weight:800;font-size:23px;color:#8892a6;letter-spacing:.1em">${w}</div><div class="abs" style="left:${220 + i * 148}px;top:164px;bottom:20px;width:2px;background:#edf0f6"></div>`; });
  rows.forEach((r, i) => { h += `<div class="abs" style="left:34px;top:${196 + i * 98}px;width:180px;height:64px;display:flex;align-items:center;font-weight:800;font-size:27px;color:#1d2a4d">${r[0]}</div>`; });
  el.insertAdjacentHTML('beforeend', h);
  const bs = rows.map((r, i) => div('abs', `left:${220 + r[1] * 592}px;top:${196 + i * 98}px;height:64px;width:0;border-radius:18px;background:${r[3]};box-shadow:0 12px 24px -10px ${r[3]}`, '', el));
  const fl = div('abs', `left:${220 + 592 * .5 - 14}px;top:154px;opacity:0`, ic('flag', 44, '#d4a84b', 2.6), el);
  A(t => {
    bs.forEach((b, i) => b.style.width = ((rows[i][2] - rows[i][1]) * 592 * E.out5(P(t, 12.7 + i * .16, 13.4 + i * .16))) + 'px');
    fl.style.opacity = E.out3(P(t, 13.4, 13.8));
  });
})();

/* ---- PERFORMANCE REPORT (sample, no figures) ---- */
const perf = panel(MKT, { x: 0, y: 960, w: 900, h: 560, cls: 'dark', t0: 9.3, dur: 1.2, z: -30, from: [0, 300, -900], rx0: 25, ry0: 0 });
(() => {
  const el = perf.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:40px">${ic('trend', 44, '#d4a84b', 2.6)}<span>Performance report</span><span style="flex:1"></span><span class="chip" style="background:rgba(212,168,75,.16);color:#f0cf85;font-size:21px">SAMPLE DATA</span></div>
  <svg class="abs" style="left:30px;top:130px" width="560" height="380" viewBox="0 0 560 380">
    ${[0, 1, 2, 3].map(i => `<line x1="0" x2="560" y1="${40 + i * 90}" y2="${40 + i * 90}" stroke="rgba(255,255,255,.08)" stroke-width="2"/>`).join('')}
    <path id="pl1" d="M0,250 C60,190 110,290 175,215 S290,110 355,185 S470,250 560,140" fill="none" stroke="#d4a84b" stroke-width="7" stroke-linecap="round"/>
    <path id="pl2" d="M0,310 C70,280 130,330 200,290 S320,250 390,280 S490,300 560,250" fill="none" stroke="#4b78b5" stroke-width="6" stroke-linecap="round"/>
  </svg>
  <div class="abs" style="left:620px;top:136px;right:30px;display:flex;flex-direction:column;gap:22px">
    ${['Reach', 'Engagement', 'Clicks'].map((x, i) => `<div style="padding:18px 20px;border-radius:20px;background:rgba(255,255,255,.06)"><div style="font-weight:700;font-size:23px;color:#9fb0cf;letter-spacing:.06em">${x.toUpperCase()}</div><div class="sk" style="width:${70 - i * 12}%;height:20px;margin-top:14px;background:rgba(240,207,133,.5)"></div></div>`).join('')}
  </div>`;
  const p1 = el.querySelector('#pl1'), p2 = el.querySelector('#pl2');
  const L1 = p1.getTotalLength(), L2 = p2.getTotalLength();
  p1.style.strokeDasharray = L1; p2.style.strokeDasharray = L2;
  A(t => { p1.style.strokeDashoffset = L1 * (1 - E.out3(P(t, 12.9, 14.0))); p2.style.strokeDashoffset = L2 * (1 - E.out3(P(t, 13.0, 14.1))); });
})();

/* ---- insight chips: research → content plan ---- */
(() => {
  const starts = [[-930 + 0, -300 - 150], [-930 + 40, -300 - 30], [-930 - 30, -300 + 110], [-930 + 30, -300 + 210], [-930 - 20, -300 + 320]];
  const ch = INS.map((n, i) => {
    const el = div('', `position:absolute;left:0;top:0;z-index:3;white-space:nowrap;display:flex;align-items:center;gap:12px;padding:12px 24px 12px 14px;border-radius:99px;background:#fff;border:3px solid ${GOLD};font-weight:800;font-size:29px;color:#12285a;box-shadow:0 20px 40px -10px rgba(0,0,0,.5),0 0 40px rgba(212,168,75,.5);opacity:0`,
      `<span style="width:44px;height:44px;border-radius:50%;background:${n[2]};display:flex;align-items:center;justify-content:center">${ic(n[1], 24, '#fff', 2.4)}</span>${n[0]}`, MKT.el);
    return el;
  });
  const T0 = [10.25, 10.4, 10.55, 10.7, 10.85], DUR = 1.0;
  A(t => ch.forEach((el, i) => {
    const k = P(t, T0[i], T0[i] + DUR);
    const sp = starts[i];
    const pe = cellPos(POSTS[i][0], POSTS[i][1]);
    const e = E.io3(k);
    const x = lerp(sp[0], pe[0], e), y = lerp(sp[1], pe[1], e) - Math.sin(e * Math.PI) * 180;
    const z = Math.sin(e * Math.PI) * 220 + 40;
    const pop = E.back(P(t, T0[i] - .25, T0[i]));
    const sc = lerp(1, .42, E.in2(P(k, .55, 1)));
    el.style.opacity = (k >= 1 || pop <= 0) ? 0 : clamp(pop * 3);
    el.style.transform = `translate3d(${x}px,${y}px,${z}px) translate(-50%,-50%) scale(${sc * lerp(.6, 1, Math.min(1, pop))}) rotate(${(1 - e) * -4}deg)`;
    // landing → card in cell appears
    const land = E.back2(P(t, T0[i] + DUR - .1, T0[i] + DUR + .3));
    POSTEL[i].style.opacity = clamp(land * 2);
    POSTEL[i].style.transform = `scale(${lerp(.5, 1, land)})`;
  }));
  A(t => POSTEL.forEach((el, i) => { if (i < 5) return; const k = i - 5; const p = E.back2(P(t, 11.4 + k * .17, 11.8 + k * .17)); el.style.opacity = clamp(p * 2); el.style.transform = `scale(${lerp(.5, 1, p)})`; }));
})();
