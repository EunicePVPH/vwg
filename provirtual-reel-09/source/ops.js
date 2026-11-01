/* ===== OPERATIONS station (scene 1 hook + scene 2) ===== */
const OPS = station('ops');
const AVC = ['#12285a', '#b8892f', '#4b78b5', '#5b6577', '#4f8a78', '#b0654a', '#2c5296', '#8a7a4a'];

/* ---- ghost word ---- */
div('ghost', `left:-900px;top:-1200px;font-size:420px;transform:translateZ(-260px)`, 'OPERATIONS', OPS.el);

/* ---- INBOX (hero) ---- */
const MAILS = [
  ['Northwind Co.', 'Quick question about Friday', 'Hi! Are we still on for the walkthrough…', '9:41', 'CLIENT', 0],
  ['Alder & Pine', 'Invoice #2041 attached', 'Please find the invoice for last month…', '9:38', 'INVOICE', 1],
  ['Studio Lumen', 'Can we reschedule our call?', 'Something came up on Thursday morning…', '9:30', 'SCHEDULING', 2],
  ['Harbor Legal', 'Re: Contract draft v2', 'Thanks — a few edits in the second section…', '9:12', 'CLIENT', 0],
  ['Bright Fox Media', 'Monthly report?', 'Could you send over the latest summary…', '8:55', 'REPORT', 3],
  ['Cedar & Co.', 'New inquiry from website', 'Hello, I would love to learn more about…', '8:40', 'LEAD', 4],
  ['Maple Street Café', 'Menu update for socials', 'We changed two items, see attached…', '8:21', 'CONTENT', 5],
  ['Oakline Partners', 'Follow-up from our meeting', 'It was great speaking yesterday. Next steps…', '8:02', 'CLIENT', 0],
  ['Willow Wellness', 'Booking confirmation', 'Your appointment has been confirmed for…', '7:50', 'SCHEDULING', 2],
  ['Pioneer Supply', 'Purchase order #118', 'Attached is the PO for the next shipment…', '7:31', 'INVOICE', 1],
  ['Lakeview Studio', 'Photos for the website', 'Here is the folder with the final images…', '7:12', 'CONTENT', 5],
  ['Summit Advisory', 'Quick intro?', 'A mutual contact suggested we connect…', '6:58', 'LEAD', 4],
];
const TAGC = { CLIENT: ['#e4ebf8', '#12285a'], INVOICE: ['#f7ecd0', '#8a6418'], SCHEDULING: ['#dbe9f8', '#2c5296'], REPORT: ['#e5ecea', '#2f6a58'], LEAD: ['#f7ecd0', '#8a6418'], CONTENT: ['#efe4de', '#8d4a33'] };
const inboxP = panel(OPS, { x: 0, y: 0, w: 940, h: 1640, t0: -5, dur: .01, float: 0, from: [0, 0, 0] });
(() => {
  const el = inboxP.el;
  el.innerHTML = `<div class="ph" style="height:140px;padding:0 44px;font-size:56px;font-weight:900;gap:22px">${ic('mail', 52, '#12285a', 2.4)}<span>Inbox</span>
    <span class="chip" id="ibcount" style="background:#12285a;color:#fff;font-size:28px;padding:8px 22px">12 new</span>
    <span style="flex:1"></span>${ic('search', 48, '#5b6577', 2.4)}</div>
    <div id="ibrows" style="position:absolute;left:0;top:140px;right:0;bottom:0;overflow:hidden"></div>
    <div id="ibscan" style="position:absolute;left:0;right:0;top:140px;height:165px;background:linear-gradient(180deg,rgba(212,168,75,0),rgba(212,168,75,.28) 50%,rgba(212,168,75,0));border-top:3px solid rgba(212,168,75,.8);opacity:0"></div>`;
  const box = el.querySelector('#ibrows');
  const rows = MAILS.map((m, i) => {
    const r = div('', `position:absolute;left:0;right:0;height:165px;border-bottom:2px solid #eef1f7;display:flex;align-items:center;padding:0 44px;gap:28px;background:#fff`, `
      <div style="width:96px;height:96px;border-radius:50%;background:${AVC[i % AVC.length]};color:#fff;font-weight:800;font-size:42px;display:flex;align-items:center;justify-content:center;flex:none">${m[0][0]}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:14px"><span style="font-weight:800;font-size:37px;color:#0f1b3d">${m[0]}</span><span class="tg" style="opacity:0"></span><span style="flex:1"></span><span style="font-size:27px;color:#8892a6;font-weight:600">${m[3]}</span></div>
        <div style="font-weight:700;font-size:33px;color:#1d2a4d;margin-top:4px;white-space:nowrap;overflow:hidden">${m[1]}</div>
        <div style="font-size:28px;color:#7b869b;margin-top:2px;white-space:nowrap;overflow:hidden">${m[2]}</div>
      </div>
      <div class="dot" style="width:22px;height:22px;border-radius:50%;background:#2c5296;flex:none;position:relative"></div>`, box);
    const tg = r.querySelector('.tg');
    const [bg, fg] = TAGC[m[4]];
    tg.innerHTML = `<span class="chip" style="background:${bg};color:${fg};font-size:22px;padding:5px 14px">${m[4]}</span>`;
    return { r, tg, dot: r.querySelector('.dot'), m };
  });
  const arrive = [0.28, 0.72, 1.12]; // top 3 drop in
  const scan = el.querySelector('#ibscan');
  const cnt = el.querySelector('#ibcount');
  A(t => {
    let U = 0;
    arrive.forEach(ta => { U += 1 - E.out3(P(t, ta, ta + .45)); });
    rows.forEach((o, j) => {
      let y, op = 1;
      if (j < 3) {
        const e = E.out5(P(t, arrive[j], arrive[j] + .55));
        y = j * 165 - (1 - e) * 260; op = clamp(e * 3);
        o.r.style.background = e < 1 && t < 2 ? `rgb(${lerp(255, 244, 1 - e)},${lerp(255, 233, 1 - e)},${lerp(255, 200, 1 - e)})` : '#fff';
      } else y = (j - U) * 165;
      // scene 2: triage — rows 4+ slide up when archived rows leave
      o.r.style.top = y + 'px';
      o.r.style.opacity = op;
      // tags + done checks
      const tg = E.out3(P(t, 4.5 + j * .13, 4.5 + j * .13 + .35));
      o.tg.style.opacity = tg;
      o.tg.style.transform = `translateX(${(1 - tg) * 20}px)`;
      const dn = E.back(P(t, 5.7 + j * .16, 5.7 + j * .16 + .4));
      if (dn > 0) {
        o.dot.style.background = '#d4a84b';
        o.dot.style.transform = `scale(${lerp(1, 1.55, dn)})`;
        o.dot.innerHTML = dn > .5 ? `<svg viewBox="0 0 24 24" width="22" height="22" style="position:absolute;left:0;top:0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12.5l4 4 8-9"/></svg>` : '';
      } else { o.dot.style.background = '#2c5296'; o.dot.style.transform = ''; o.dot.innerHTML = ''; }
      const sub = j < 9 ? 1 : 0;
      o.r.querySelector('div:nth-child(2)>div:nth-child(1)>span:first-child').style.fontWeight = dn > .5 ? 700 : 800;
    });
    // gold triage scanner
    const sp = P(t, 4.4, 7.6);
    scan.style.opacity = sp > 0 && sp < 1 ? 1 : 0;
    scan.style.top = (140 + lerp(0, 8, E.io2(sp)) * 165) + 'px';
    cnt.textContent = t < 5.7 ? '12 new' : t < 7 ? '5 new' : 'All sorted';
    cnt.style.background = t < 7 ? '#12285a' : '#d4a84b';
    cnt.style.color = t < 7 ? '#fff' : '#12285a';
  });
})();

/* ---- flying mail cards (scene 1, 3D streaming past camera) ---- */
(() => {
  const subs = [['Invoice #2041', 'mail'], ['Can we reschedule?', 'cal'], ['Quick question', 'chat'], ['New inquiry', 'mail'], ['Monthly report?', 'doc'], ['Re: Proposal', 'mail'], ['Follow-up', 'chat']];
  const spec = [
    [-640, -250, 0.15, 1.9, -9], [640, -40, 0.35, 1.9, 7], [-560, 450, 0.6, 1.8, 6], [610, 640, 0.85, 1.8, -7],
    [-600, -640, 1.1, 1.6, 5], [580, -520, 1.35, 1.5, -5], [-560, 80, 1.6, 1.4, 8],
  ];
  const cards = spec.map(([x, y, ts, dur, rz], i) => {
    const el = div('panel', `left:${x - 270}px;top:${y - 70}px;width:540px;height:140px;border-radius:30px;display:flex;align-items:center;padding:0 30px;gap:22px;box-shadow:0 30px 80px rgba(0,0,0,.5)`,
      `<div style="width:76px;height:76px;border-radius:22px;background:${AVC[i % 8]};display:flex;align-items:center;justify-content:center;flex:none">${ic(subs[i][1], 40, '#fff', 2.2)}</div>
       <div style="flex:1"><div style="font-weight:800;font-size:32px;color:#0f1b3d">${subs[i][0]}</div><div class="sk" style="width:70%;margin-top:12px"></div></div>`, OPS.el);
    return { el, x, y, ts, dur, rz };
  });
  A(t => cards.forEach(c => {
    const k = P(t, c.ts, c.ts + c.dur);
    const z = lerp(-1700, 1000, E.in2(k) * .7 + k * .3);
    c.el.style.display = (k <= 0 || k >= 1) ? 'none' : 'flex';
    c.el.style.opacity = Math.min(1, k * 5) * (1 - E.in3(P(k, .8, 1)));
    c.el.style.transform = `translate3d(0,0,${z}px) rotateZ(${c.rz * (1 - k)}deg) rotateY(${(1 - k) * -12}deg)`;
  }));
})();

/* ---- CALENDAR ---- */
const calP = panel(OPS, { x: 880, y: -340, w: 860, h: 940, t0: 3.0, dur: 1.2, z: -60, ry: -17, from: [500, 0, -900], ry0: -40 });
(() => {
  const el = calP.el;
  const days = ['MON', 'TUE', 'WED', 'THU'];
  const cw = 185, gx = 100, top = 190, rh = 96;
  let h = `<div class="ph" style="gap:20px;font-size:42px">${ic('cal', 46, '#12285a', 2.4)}<span>Schedule</span><span style="flex:1"></span><span class="chip" style="background:#f7ecd0;color:#8a6418">This week</span></div>`;
  days.forEach((d, i) => { h += `<div class="abs" style="left:${gx + i * cw}px;top:116px;width:${cw}px;text-align:center;font-weight:800;font-size:26px;letter-spacing:.14em;color:#8892a6">${d}</div>`; });
  for (let r = 0; r < 7; r++) {
    h += `<div class="abs" style="left:0;top:${top + r * rh}px;width:100px;text-align:center;font-weight:700;font-size:22px;color:#a2abbd">${9 + r > 12 ? 9 + r - 12 : 9 + r}${9 + r >= 12 ? 'PM' : 'AM'}</div>`;
    h += `<div class="abs" style="left:100px;right:30px;top:${top + r * rh}px;height:2px;background:#edf0f6"></div>`;
  }
  const ev = [
    [0, .3, 1.7, 'Client call', '#12285a', '#fff'], [1, 1, 1.1, 'Team sync', '#4b78b5', '#fff'], [2, 0, 1.3, 'Strategy', '#d4a84b', '#12285a'],
    [3, 2.2, 1.6, 'Onboarding', '#4f8a78', '#fff'], [1, 3.6, 1.5, 'Follow-up', '#12285a', '#fff'], [2, 3.3, 1.3, 'Workshop', '#4b78b5', '#fff'],
    [0, 3.4, 1.1, 'Review', '#d4a84b', '#12285a'],
  ];
  el.insertAdjacentHTML('beforeend', h);
  const evEls = ev.map((e, i) => div('abs', `left:${gx + e[0] * cw + 8}px;top:${top + e[1] * rh + 6}px;width:${cw - 16}px;height:${e[2] * rh - 12}px;border-radius:18px;background:${e[4]};color:${e[5]};font-weight:800;font-size:25px;padding:14px 16px;line-height:1.15;box-shadow:0 14px 30px -10px rgba(0,0,0,.35)`, `${e[3]}<div style="font-weight:600;font-size:19px;opacity:.75;margin-top:6px">${9 + Math.floor(e[1])}:${e[1] % 1 ? '30' : '00'}</div>`, el));
  const nowl = div('abs', `left:100px;right:30px;top:${top}px;height:4px;background:#d4a84b;border-radius:4px;box-shadow:0 0 18px #d4a84b`, '<div style="position:absolute;left:-10px;top:-8px;width:20px;height:20px;border-radius:50%;background:#d4a84b"></div>', el);
  const cur = div('abs', `left:0;top:0;width:44px;height:44px;opacity:0;z-index:5;filter:drop-shadow(0 6px 8px rgba(0,0,0,.4))`, ic('cursor', 44), el);
  const order = [2, 0, 1, 3, 5, 4, 6];
  A(t => {
    evEls.forEach((e, i) => {
      const k = order.indexOf(i);
      const p = E.back(P(t, 3.5 + k * .22, 3.5 + k * .22 + .5));
      e.style.opacity = clamp(p * 2); e.style.transform = `scale(${lerp(.7, 1, p)})`;
    });
    // drag "Review" (idx 6) from MON 12:24 slot to THU
    const d = E.io3(P(t, 5.7, 6.5));
    const rv = evEls[6];
    const baseX = gx + 0 * cw + 8, baseY = top + 3.4 * rh + 6;
    const tx = gx + 3 * cw + 8, ty = top + 4.3 * rh + 6;
    rv.style.left = lerp(baseX, tx, d) + 'px'; rv.style.top = lerp(baseY, ty, d) + 'px';
    rv.style.boxShadow = d > 0 && d < 1 ? '0 0 0 4px #fff,0 0 40px 6px rgba(212,168,75,.9)' : '0 14px 30px -10px rgba(0,0,0,.35)';
    rv.style.zIndex = d > 0 && d < 1 ? 4 : 1;
    const cp = P(t, 5.55, 6.7);
    cur.style.opacity = cp > 0 && cp < 1 ? 1 : 0;
    cur.style.left = lerp(baseX + 90, tx + 90, d) + 'px'; cur.style.top = lerp(baseY + 70, ty + 70, d) + 'px';
    nowl.style.top = (top + lerp(.4, 5.6, E.io2(P(t, 3.6, 9))) * rh) + 'px';
  });
})();

/* ---- TASK BOARD ---- */
const taskP = panel(OPS, { x: -880, y: 380, w: 880, h: 760, t0: 3.2, dur: 1.2, z: -80, ry: 17, from: [-500, 80, -900], ry0: 40 });
(() => {
  const el = taskP.el;
  const cols = ['To do', 'In progress', 'Done'];
  const cwid = 270, gx = 28;
  el.innerHTML = `<div class="ph" style="gap:20px;font-size:42px">${ic('grid', 44, '#12285a', 2.4)}<span>Task tracker</span><span style="flex:1"></span><span class="chip" style="background:#e4ebf8;color:#12285a">Sprint</span></div>`;
  cols.forEach((c, i) => {
    div('abs', `left:${gx + i * (cwid + 14)}px;top:128px;width:${cwid}px;bottom:24px;background:#f3f6fb;border-radius:22px`, `<div style="padding:18px 20px;font-weight:800;font-size:26px;color:#5b6577;letter-spacing:.04em">${c.toUpperCase()}</div>`, el);
  });
  const cards = [
    ['Draft proposal', 0, 0, '#12285a'], ['Update CRM notes', 0, 1, '#4b78b5'], ['Book vendor call', 0, 2, '#d4a84b'],
    ['Weekly report', 1, 0, '#4f8a78'], ['Invoice follow-up', 2, 0, '#12285a'], ['Send recap', 0, 3, '#4b78b5'],
  ];
  const CE = cards.map(c => div('abs', `width:${cwid - 28}px;height:128px;border-radius:18px;background:#fff;box-shadow:0 10px 24px -8px rgba(18,40,90,.28);padding:16px 18px;border-left:8px solid ${c[3]}`,
    `<div style="font-weight:800;font-size:26px;color:#0f1b3d;line-height:1.15">${c[0]}</div><div class="sk" style="width:60%;margin-top:14px;height:12px"></div><div class="ck" style="position:absolute;right:14px;bottom:12px;width:36px;height:36px;border-radius:50%;background:#d4a84b;opacity:0;display:flex;align-items:center;justify-content:center">${ic('check', 22, '#fff', 3.4)}</div>`, el));
  const pos = (col, row) => [gx + col * (cwid + 14) + 14, 186 + row * 142];
  A(t => {
    CE.forEach((e, i) => {
      let col = cards[i][1], row = cards[i][2];
      let [x, y] = pos(col, row);
      const pe = E.back(P(t, 3.9 + i * .12, 4.4 + i * .12));
      let ox = 0, oy = 0, lift = 0, done = 0;
      if (i === 0) { const m = E.io3(P(t, 6.3, 7.0)); const [x2, y2] = pos(1, 1); x = lerp(x, x2, m); y = lerp(y, y2, m); lift = Math.sin(m * Math.PI); }
      if (i === 3) { const m = E.io3(P(t, 7.1, 7.8)); const [x2, y2] = pos(2, 1); x = lerp(x, x2, m); y = lerp(y, y2, m); lift = Math.sin(m * Math.PI); done = P(t, 7.7, 8.0); }
      if (i === 1) { const m = E.io3(P(t, 7.6, 8.3)); const [x2, y2] = pos(1, 0); x = lerp(x, x2, m); y = lerp(y, y2, m); lift = Math.sin(m * Math.PI); }
      if (i === 4) done = 1;
      if (i === 2 || i === 5) { y -= 142 * E.io3(P(t, 6.3, 6.9)) * 0; }
      e.style.left = x + 'px'; e.style.top = y + 'px';
      e.style.opacity = clamp(pe * 2);
      e.style.transform = `scale(${lerp(.8, 1, pe) + lift * .06}) rotate(${lift * -2.5}deg)`;
      e.style.boxShadow = lift > .05 ? '0 28px 50px -10px rgba(18,40,90,.5)' : '0 10px 24px -8px rgba(18,40,90,.28)';
      e.style.zIndex = lift > .05 ? 3 : 1;
      e.querySelector('.ck').style.opacity = done;
    });
  });
})();

/* ---- REPORT DOC ---- */
const repP = panel(OPS, { x: 790, y: 640, w: 620, h: 780, t0: 3.4, dur: 1.2, z: -40, ry: -11, from: [400, 140, -800], ry0: -34 });
(() => {
  const el = repP.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:38px">${ic('doc', 42, '#12285a', 2.4)}<span>Weekly report</span></div>
  <div class="abs" style="left:44px;top:134px;font-weight:900;font-size:46px;color:#0f1b3d;letter-spacing:-.02em">Weekly Summary</div>
  <div class="abs" style="left:44px;top:200px;font-weight:600;font-size:24px;color:#8892a6;letter-spacing:.06em">PREPARED BY PROVIRTUAL PH</div>
  <div id="rl" class="abs" style="left:44px;top:262px;right:44px"></div>
  <div class="abs" style="left:44px;right:44px;top:430px;height:260px;border-radius:22px;background:#f3f6fb;padding:22px 26px">
    <div style="font-weight:800;font-size:23px;color:#5b6577;letter-spacing:.08em">ACTIVITY OVERVIEW</div>
    <div id="rb" style="position:absolute;left:26px;right:26px;bottom:26px;height:160px;display:flex;align-items:flex-end;gap:18px"></div>
  </div>
  <div id="rc" class="abs" style="left:44px;top:716px;right:44px"></div>`;
  const rl = el.querySelector('#rl');
  const lines = [100, 92, 96, 70, 88];
  const ls = lines.map(w => div('sk', `width:${w}%;height:18px;margin-bottom:22px;transform-origin:left`, '', rl));
  const rb = el.querySelector('#rb');
  const hs = [.45, .7, .55, .9, .62, .8];
  const bs = hs.map((hh, i) => div('', `flex:1;border-radius:10px 10px 4px 4px;background:${i === 3 ? '#d4a84b' : '#12285a'};height:0`, '', rb));
  A(t => {
    ls.forEach((l, i) => l.style.transform = `scaleX(${E.out3(P(t, 6.9 + i * .12, 7.5 + i * .12))})`);
    bs.forEach((b, i) => b.style.height = (hs[i] * 160 * E.out5(P(t, 7.3 + i * .09, 7.9 + i * .09))) + 'px');
  });
})();

/* ---- CLIENT FOLLOW-UPS ---- */
const fuP = panel(OPS, { x: -800, y: -440, w: 760, h: 600, t0: 3.5, dur: 1.2, z: -110, ry: 15, from: [-500, -120, -900], ry0: 38 });
(() => {
  const el = fuP.el;
  el.innerHTML = `<div class="ph" style="gap:18px;font-size:40px">${ic('user', 44, '#12285a', 2.4)}<span>Client follow-ups</span></div>`;
  const rows = [['Northwind Co.', 'Send recap', 'Today'], ['Alder & Pine', 'Share invoice', 'Today'], ['Studio Lumen', 'Confirm new time', 'Tomorrow'], ['Oakline Partners', 'Next-steps email', 'Fri']];
  const R = rows.map((r, i) => {
    const d = div('abs', `left:0;right:0;top:${104 + i * 122}px;height:122px;display:flex;align-items:center;padding:0 38px;gap:24px;border-bottom:2px solid #eef1f7`,
      `<div class="bx" style="width:48px;height:48px;border-radius:50%;border:4px solid #c9d2e3;flex:none;display:flex;align-items:center;justify-content:center"></div>
       <div style="flex:1"><div class="nm" style="font-weight:800;font-size:33px;color:#0f1b3d">${r[0]}</div><div style="font-size:26px;color:#7b869b;margin-top:2px">${r[1]}</div></div>
       <span class="chip" style="background:${r[2] === 'Today' ? '#f7ecd0' : '#e4ebf8'};color:${r[2] === 'Today' ? '#8a6418' : '#12285a'};font-size:23px">${r[2]}</span>`, el);
    return d;
  });
  A(t => R.forEach((d, i) => {
    const p = E.back(P(t, 5.0 + i * .5, 5.4 + i * .5));
    const bx = d.querySelector('.bx'), nm = d.querySelector('.nm');
    if (p > 0) { bx.style.background = '#d4a84b'; bx.style.borderColor = '#d4a84b'; bx.style.transform = `scale(${lerp(.6, 1, p)})`; bx.innerHTML = ic('check', 28, '#fff', 4); nm.style.opacity = .55; }
    else { bx.style.background = ''; bx.style.borderColor = '#c9d2e3'; bx.innerHTML = ''; bx.style.transform = ''; nm.style.opacity = 1; }
  }));
})();
