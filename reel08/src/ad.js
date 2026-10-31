/* ProVirtual PH — Reel #8 — Flexible Virtual Assistance
   Fully deterministic: every pixel is a pure function of time t (seconds). window.renderFrame(t) draws one frame. */
(() => {
const W = 1080, H = 1920;
const TL = window.TL, C = TL.cues;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: x => x, out2: x => 1 - (1 - x) * (1 - x), out3: x => 1 - Math.pow(1 - x, 3), in2: x => x * x, in3: x => x * x * x,
  io2: x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
  io3: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  expo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  back: x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  back2: x => { const c1 = 2.8, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function el(tag, cls, parent, css, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
const stage = document.getElementById('stage');
const mc = document.createElement('canvas').getContext('2d');
function fit(text, weight, target, ls = -0.01, fam = 'Montserrat') { mc.font = `${weight} 100px ${fam}`; const w = mc.measureText(text).width + ls * 100 * text.length; return 100 * target / w; }
const BG = 'radial-gradient(1300px 1100px at 50% 28%,#123069 0%,#0A2350 42%,#06142E 100%)';
const SHOW = (e, on) => { const d = on ? 'block' : 'none'; if (e.style.display !== d) e.style.display = d; };

/* mask-reveal text line */
function maskLine(parent, text, o) {
  const size = o.size, lh = Math.round(size * 1.14);
  const m = el('div', 'mask', parent, `left:${o.x || 0}px;top:${o.y}px;width:${o.w || W}px;height:${lh}px;`);
  const s = el('div', 'mt ' + (o.cls || ''), m, `font-size:${size}px;line-height:${lh}px;letter-spacing:${o.ls ?? -0.01}em;font-weight:${o.weight || 900};${o.css || ''}`, text);
  return { m, s, size, lh };
}
function pair(parent, l1, l2, y, o = {}) {
  const s1 = Math.min(o.max1 || 130, fit(l1, 900, o.w || 920)), s2 = Math.min(s1, fit(l2, 900, o.w || 920));
  const a = maskLine(parent, l1, { y, size: s1 }), b = maskLine(parent, l2, { y: y + s1 * 1.0, size: s2, cls: 'gold drop' });
  return { a, b };
}
function showPair(p, t, tin, tout) {
  const f = (L, d) => { const pi = E.expo(seg(t, tin + d, tin + d + .55)), po = E.in3(seg(t, tout + d, tout + d + .32)); const y = (1 - pi) * 112 - po * 112; L.s.style.transform = `translateY(${y}%)`; };
  f(p.a, 0); f(p.b, .12);
  const on = t >= tin && t < tout + .5; SHOW(p.a.m, on); SHOW(p.b.m, on);
}
const CHK = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path class="cp" d="M5.5 12.5l4.2 4.3L18.8 7.6" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="22" stroke-dashoffset="22"/></svg>';
function mkCheck(parent, cls, css) { const b = el('div', cls, parent, css, CHK); const p = b.querySelector('.cp'); return { b, set(v, col = '#D6A84F') { p.style.strokeDashoffset = 22 * (1 - clamp(v * 1.4 - .2)); b.style.background = v > 0 ? col : '#fff'; b.style.borderColor = v > 0 ? col : '#B9C3D6'; b.style.transform = v > 0 ? `scale(${1 + .18 * Math.sin(clamp(v) * Math.PI)})` : ''; } }; }
const typed = (e, text, t, t0, dur) => { const n = Math.floor(seg(t, t0, t0 + dur) * text.length); const s = text.slice(0, n) + ((t > t0 && t < t0 + dur + .25) ? '<span style="color:#D6A84F">|</span>' : ''); if (e._s !== s) { e.innerHTML = s; e._s = s; } };
const shake = (t, t0, a = 14, f = 70, d = 12) => { const x = t - t0; return x < 0 || x > .5 ? 0 : Math.sin(x * f) * Math.exp(-x * d) * a; };

/* ===================================================== SCENE 1 — HOOK */
function buildS1() {
  const root = el('div', 'scene', stage, `background:${BG};`);
  const cam = el('div', 'abs', root, `left:0;top:0;width:${W}px;height:${H}px;transform-origin:540px 900px;`);
  const cal = el('div', 'abs', cam, 'left:-310px;top:-300px;width:1700px;height:2420px;');
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], cw = 1700 / 7, hh = 90, rh = 290;
  days.forEach((d, i) => el('div', 'calhd', cal, `left:${i * cw}px;top:0;width:${cw}px;height:${hh}px;`, d));
  const cells = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 7; c++) { const n = r * 7 + c; el('div', 'calcell', cal, `left:${c * cw}px;top:${hh + r * rh}px;width:${cw}px;height:${rh}px;`, `<span>${(n + 2) % 30 + 1}</span>`); cells.push({ x: c * cw, y: hh + r * rh }); }
  const R = rng(11), order = cells.map((_, i) => i).filter(i => { const c = i % 7; return c >= 1 && c <= 5; }).sort(() => R() - .5);
  const titles = ['9:00 Client call', 'Invoice due', 'Send proposal', 'Team sync', 'Follow up: Reyes', 'Report due', 'Payroll', 'Post schedule', 'Call back', 'Research', 'Reply needed', 'Review draft', 'Book travel', 'Update sheet', 'Webinar prep', 'Lunch w/ Maya', 'Confirm venue', 'Send invoices', '3:30 Check-in', 'Edit reel'];
  const chips = TL.chip_t.map((tt, k) => {
    const cell = cells[order[k % order.length]], j = Math.floor(k / order.length), kind = Math.floor(R() * 5);
    const e = el('div', 'chip k' + kind, cal, `left:${cell.x + 10}px;top:${cell.y + 50 + j * 78}px;width:${cw - 20}px;height:66px;`, titles[Math.floor(R() * titles.length)]);
    return { e, t: tt };
  });
  const scrim = el('div', 'abs', root, 'inset:0;');
  const L = {}, nSize = fit('HELP?', 900, 840);
  const mk = (txt, y, size, cls) => el('div', 'mt ' + (cls || ''), root, `top:${y}px;font-size:${size}px;line-height:${size * 1.1}px;letter-spacing:-.02em;transform-origin:50% 55%;`, txt);
  L.need = mk('NEED', 300, nSize); L.help = mk('HELP?', 300 + nSize * .93, nSize);
  const gS = fit('FULL-TIME', 900, 900);
  const g1 = maskLine(root, 'NOT A', { y: 300 + nSize * 1.86 + 70, size: 104, cls: 'gold drop', ls: .02 });
  const g2 = maskLine(root, 'FULL-TIME', { y: 300 + nSize * 1.86 + 165, size: gS, cls: 'gshine drop' });
  const g3 = maskLine(root, 'HIRE?', { y: 300 + nSize * 1.86 + 165 + gS * 1.0, size: gS, cls: 'gshine drop' });
  return {
    root, update(t) {
      const on = t < 3.5; SHOW(root, on); if (!on) return;
      const p = seg(t, 0, 3.1), sc = lerp(1.0, 1.2, E.io2(p)), rx = lerp(24, 10, E.out2(p)), rz = lerp(-6, -3, p), ty = lerp(60, -90, E.io2(p));
      const sx = shake(t, .05) + shake(t, .2) * .6 + shake(t, C.gold1) * .8, sy = shake(t, .05, 10, 83) + shake(t, C.gold1, 8, 77);
      const out = seg(t, 2.9, 3.3);
      cam.style.transform = `translate(${sx}px,${sy}px) perspective(2400px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${sc}) translateY(${ty}px)`;
      chips.forEach(c => { const a = seg(t, c.t, c.t + .2); if (a <= 0) { c.e.style.display = 'none'; return; } c.e.style.display = 'flex'; const s = .55 + .45 * E.back(a); c.e.style.transform = `scale(${s})`; c.e.style.opacity = Math.min(1, a * 3); });
      const dk = lerp(.35, .72, seg(t, .2, 1.5));
      scrim.style.background = `radial-gradient(900px 900px at 50% 48%,rgba(4,13,32,${dk + .15}) 0%,rgba(4,13,32,${dk * .7}) 70%,rgba(4,13,32,${dk * .55}) 100%)`;
      const slam = (e, t0) => { const a = seg(t, t0, t0 + .3), b = E.expo(a); e.style.opacity = clamp(a * 5); e.style.transform = `scale(${1 + (1 - b) * 1.3}) translateY(${(1 - b) * -40}px)`; e.style.filter = `blur(${(1 - b) * 22}px)`; };
      slam(L.need, 0); slam(L.help, C.help);
      const gp = (g, t0) => { g.s.style.transform = `translateY(${(1 - E.expo(seg(t, t0, t0 + .5))) * 112}%)`; };
      gp(g1, C.gold1); gp(g2, C.gold2); gp(g3, C.gold3);
      const sh = seg(t, 2.0, 2.9) * 260 - 40; g2.s.style.backgroundPosition = g3.s.style.backgroundPosition = `${100 - sh * .4}% 0`;
      const wob = 1 + .018 * Math.sin(t * 2.2);
      [L.need, L.help].forEach(e => e.style.marginTop = `${-seg(t, C.gold1, C.gold1 + .5) * 0}px`);
      root.style.opacity = 1 - E.in2(out); root.style.transform = `scale(${1 + E.in3(out) * .35})`; root.style.filter = out > 0 ? `blur(${out * 26}px)` : 'none';
    }
  };
}

/* ===================================================== SCENE 2 — THE WORKLOAD */
const SENDERS = [['Maya Reyes', 'MR', '#3E6AA8'], ['Orchard Lane Bakery', 'OL', '#B5832E'], ['Daniel Ortiz', 'DO', '#5B7BA8'], ['Cedar & Co. Consulting', 'CC', '#2F7D6B'], ['Lena Park', 'LP', '#7A5BA8'], ['Harbor Realty', 'HR', '#A85B5B'], ['Brightleaf Studio', 'BS', '#3E6AA8'], ['Northfield Dental', 'ND', '#4A8FA8'], ['Alder Creek Events', 'AE', '#8A6B3E'], ['Jordan Tate', 'JT', '#6B7A99'], ['Pine & Co. Interiors', 'PC', '#2F7D6B'], ['Sofia Mendes', 'SM', '#A85B8A']];
const SUBJ = ['Booking request for next week', 'Invoice #1048 — payment reminder', 'Re: Proposal review', 'Can we move our call?', 'Quick question about onboarding', 'Following up on the listing', 'Monthly report needed by Friday', 'Can you reschedule Thursday?', 'Venue options attached', 'Re: Social media calendar', 'Contract draft for your review', 'Can you send the slides?', 'Urgent: client needs an update', 'Reminder: payment overdue'];
function buildS2() {
  const root = el('div', 'scene', stage, `background:${BG};`);
  const cam = el('div', 'abs', root, 'left:0;top:0;width:1080px;height:1920px;transform-origin:540px 800px;');
  // faint grid
  el('div', 'abs', cam, 'inset:0;opacity:.5;background-image:linear-gradient(rgba(255,255,255,.035) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.035) 2px,transparent 2px);background-size:90px 90px;');
  /* inbox */
  const inbox = el('div', 'win', cam, 'left:40px;top:270px;width:1000px;height:540px;');
  const ih = el('div', 'winhd', inbox, '');
  const pInbox = el('span', 'pill gold2', ih, '', 'INBOX'); el('span', 'hdt', ih, '', 'Client Messages');
  const badge = el('span', 'badge', ih, '', '14');
  const rowsBox = el('div', 'abs', inbox, 'left:0;top:76px;width:1000px;height:464px;overflow:hidden;');
  const A = [-9, -8, -7, -6, -5].concat(TL.email_t);
  const rows = A.map((ta, i) => {
    const s = SENDERS[(i * 5 + 3) % SENDERS.length], sub = SUBJ[(i * 3 + 1) % SUBJ.length];
    const e = el('div', 'row', rowsBox, '', `<div class="av" style="background:${s[2]}">${s[1]}</div><div class="rt"><div class="rs">${s[0]}</div><div class="rj">${sub}</div></div><div class="rtm">${9 + Math.floor(i / 6)}:${String((i * 7) % 60).padStart(2, '0')} AM</div><div class="dot"></div>`);
    return { e, ta };
  });
  /* calendar */
  const calw = el('div', 'win', cam, 'left:40px;top:830px;width:620px;height:490px;');
  const ch = el('div', 'winhd', calw, '', ''); const pCal = el('span', 'pill gold2', ch, '', 'APPOINTMENTS');
  const clock = el('span', 'badge', ch, 'background:rgba(255,255,255,.14);font-size:24px;', '8:00 AM');
  const body = el('div', 'abs', calw, 'left:0;top:76px;width:620px;height:414px;overflow:hidden;');
  for (let h = 0; h < 10; h++) { el('div', 'hour', body, `top:${h * 41 + 6}px;`); el('div', 'hlab', body, `top:${h * 41 - 2}px;`, `${(h + 8) > 12 ? (h + 8) - 12 : h + 8} ${h + 8 < 12 ? 'AM' : 'PM'}`); }
  const evd = [[1, 1.2, 'Client call', '#3E6AA8', 0], [1.5, 1.3, 'Team sync', '#46536F', .36], [2.5, 1.2, 'Proposal review', '#B5832E', .12], [3, 1.4, 'Vendor call', '#2F7D6B', .5], [3.5, 1, 'Send report', '#A85B5B', .24], [4.5, 1.2, 'Invoice check', '#5B7BA8', .0], [5, 1.3, 'Lunch w/ Maya', '#7A5BA8', .42], [5.6, 1, 'Post content', '#3E6AA8', .18], [6.5, 1.3, 'Follow-up calls', '#B5832E', .06], [7, 1.2, 'Client demo', '#46536F', .4], [7.4, 1, 'Admin hour', '#2F7D6B', .2], [8.2, 1, 'Research', '#A85B5B', .5], [8.6, 1, 'Payroll', '#3E6AA8', .1], [9, .9, 'Reply to all', '#7A5BA8', .34]];
  const evs = evd.map((d, i) => ({ e: el('div', 'ev', body, `left:${86 + d[4] * 300}px;top:${d[0] * 41 + 7}px;width:300px;height:${Math.max(44, d[1] * 41 - 4)}px;background:${d[3]};`, d[2]), t: TL.calev_t[i] }));
  const nowLine = el('div', 'abs', body, 'left:70px;right:0;height:4px;background:#E5584B;box-shadow:0 0 14px #E5584B;');
  /* right-hand counters */
  const mdefs = [['REPORTS', 'due today', 3, 12, 3.70], ['RESEARCH', 'need review', 2, 9, 3.90], ['FOLLOW-UPS', 'overdue', 6, 24, 4.10], ['ADMIN TASKS', 'waiting', 5, 18, 4.30]];
  const minis = mdefs.map((d, i) => { const e = el('div', 'mini', cam, `left:680px;top:${830 + i * 126}px;width:360px;height:112px;`, `<div class="ml">${d[0]}</div><div class="mn">${d[2]}</div><div class="ms">${d[1]}</div>`); return { e, d, n: e.querySelector('.mn'), i }; });
  /* toasts */
  const td = [['Reminder: send monthly report', 'Due today · 5:00 PM', 120, 420, -3, '#E5584B'], ['New message · Harbor Realty', '“Any update on the listing?”', 300, 620, 2.5, '#D6A84F'], ['Meeting starts in 5 min', 'Client call · Cedar & Co.', 80, 980, -2, '#3E6AA8'], ['Invoice #1048 is overdue', 'Orchard Lane Bakery', 330, 380, 3.4, '#E5584B'], ['3 follow-ups waiting', 'Reply needed today', 260, 1130, -3.2, '#D6A84F'], ['Report due in 1 hour', 'Brightleaf Studio', 150, 760, 2, '#E5584B']];
  const toasts = td.map((d, i) => ({ e: el('div', 'toast', cam, `left:${d[2]}px;top:${d[3]}px;border-left-color:${d[5]};`, `<div><b>${d[0]}</b><i>${d[1]}</i></div>`), d, t: TL.toast_t[i] }));
  /* red pressure + caption */
  const red = el('div', 'abs', root, 'inset:0;background:radial-gradient(900px 1100px at 50% 45%,transparent 45%,rgba(229,60,45,.55) 100%);opacity:0;');
  const band = el('div', 'abs', root, 'left:0;top:1180px;width:1080px;height:740px;background:linear-gradient(180deg,rgba(4,13,32,0) 0%,rgba(4,13,32,.92) 30%,rgba(4,13,32,.97) 100%);');
  const cA = pair(root, 'SO MUCH', 'TO DO.', 1330, { max1: 124 }), cB = pair(root, 'ONLY SO MANY', 'HOURS.', 1330, { max1: 112 });
  cB.b.s.style.fontSize = '150px'; cB.b.m.style.height = '170px'; cB.b.s.style.lineHeight = '170px';
  const stampEls = [pInbox, pCal, minis[0].e.querySelector('.ml'), minis[1].e.querySelector('.ml'), minis[2].e.querySelector('.ml'), minis[3].e.querySelector('.ml')];
  const ml = (a) => 5 + a;
  return {
    root, update(t) {
      const on = t > 2.8 && t < 9.4; SHOW(root, on); if (!on) return;
      const tt = Math.min(t, C.freeze);
      const fz = t > C.freeze;
      const fade = seg(t, 2.9, 3.3); root.style.opacity = E.out2(fade);
      const inP = seg(t, 2.95, 3.4); root.style.transform = `scale(${1 + (1 - E.out3(inP)) * .14})`; root.style.filter = t < 3.45 ? `blur(${(1 - E.out3(inP)) * 16}px)` : (fz ? `saturate(${lerp(1, .35, seg(t, 8, 8.4))}) blur(${seg(t, 8.5, 9.3) * 10}px)` : 'none');
      const amp = lerp(0, 5.5, seg(tt, 5, 7.9)); cam.style.transform = `translate(${Math.sin(tt * 47) * amp}px,${Math.cos(tt * 53) * amp * .7}px) scale(${1 + .035 * seg(tt, 3.2, 8)})`;
      // windows enter
      const wIn = (e, t0, y) => { const p = E.out3(seg(t, t0, t0 + .45)); e.style.opacity = p; e.style.transform = `translateY(${(1 - p) * y}px) scale(${.96 + .04 * p})`; };
      wIn(inbox, 3.02, 90); wIn(calw, 3.2, 90); minis.forEach((m, i) => wIn(m.e, 3.3 + i * .12, 70));
      // stamps
      stampEls.forEach((e, i) => { const p = seg(t, C.stamps[i], C.stamps[i] + .28); e.style.transform = p < 1 ? `scale(${1 + (1 - E.out3(p)) * .6})` : 'scale(1)'; });
      // emails
      let arrived = 0;
      rows.forEach((r, i) => {
        const a = seg(tt, r.ta, r.ta + .26); if (r.ta <= tt) arrived++;
        let rank = 0; for (let j = i + 1; j < rows.length; j++) { const q = seg(tt, rows[j].ta, rows[j].ta + .26); if (q <= 0) break; rank += E.out3(q); }
        if (a <= 0 || rank > 6) { r.e.style.display = 'none'; return; }
        r.e.style.display = 'flex'; const ea = E.out3(a); r.e.style.transform = `translate(${(1 - ea) * -170}px,${rank * 92}px)`; r.e.style.opacity = ea;
        const fl = r.ta > 0 ? 1 - seg(tt, r.ta, r.ta + .8) : 0; r.e.style.background = fl > 0 ? `rgba(246,228,170,${.38 * fl}) ` : '#fff'; if (fl <= 0) r.e.style.background = '#fff';
      });
      const nUn = 14 + Math.floor((arrived - 5) * 4.6); badge.textContent = nUn > 99 ? '99+' : nUn;
      // calendar
      const hr = 8 + 9.6 * E.in2(seg(tt, 3.3, 8.0)); const hh_ = Math.floor(hr), mm = Math.floor((hr % 1) * 60);
      clock.textContent = `${hh_ > 12 ? hh_ - 12 : hh_}:${String(mm).padStart(2, '0')} ${hh_ >= 12 ? 'PM' : 'AM'}`; nowLine.style.top = `${(hr - 8) * 41 + 4}px`;
      evs.forEach(v => { const a = seg(t, v.t, v.t + .25); if (a <= 0) { v.e.style.display = 'none'; return; } v.e.style.display = 'block'; v.e.style.transform = `scale(${.6 + .4 * E.back(a)}) translateY(${(1 - E.out3(a)) * -30}px)`; v.e.style.opacity = Math.min(1, a * 3); });
      // minis
      minis.forEach(m => { const g = seg(tt, m.d[4], 7.9); m.n.textContent = Math.round(lerp(m.d[2], m.d[3], E.in2(g))); });
      // toasts
      toasts.forEach(o => { const a = seg(tt, o.t, o.t + .32); if (a <= 0) { o.e.style.display = 'none'; return; } o.e.style.display = 'flex'; o.e.style.opacity = Math.min(1, a * 2.5); o.e.style.transform = `translateX(${(1 - E.out3(a)) * 140}px) rotate(${o.d[4] * (.5 + .5 * E.back(a))}deg) scale(${.9 + .1 * E.back(a)})`; });
      red.style.opacity = E.in2(seg(tt, 5.2, 7.9)) * .85;
      // captions
      const bo = seg(t, C.cap_a - .2, C.cap_a + .3); band.style.opacity = bo;
      showPair(cA, t, C.cap_a, C.cap_b - .45); showPair(cB, t, C.cap_b, 99);
      if (t >= C.freeze) { const f = seg(t, C.freeze + .05, C.freeze + .4); cB.a.s.style.opacity = cB.b.s.style.opacity = 1 - f; band.style.opacity = bo * (1 - f); }
      else { cB.a.s.style.opacity = cB.b.s.style.opacity = 1; }
    }
  };
}

/* ===================================================== SCENE 3 — ORGANIZED SUPPORT */
const LANES = [
  ['INBOX', ['Sort client emails', 'Draft reply: Cedar & Co.', 'Flag urgent messages'], 540, 540], ['CALENDAR', ['Confirm Tuesday call', 'Resolve double-booking', 'Send meeting invites'], 350, 1075],
  ['REPORTS', ['Monthly sales report', 'Update tracking sheet', 'Weekly summary'], 860, 890], ['RESEARCH', ['Vendor comparison notes', 'Competitor overview', 'Event venue options'], 860, 1016],
  ['FOLLOW-UPS', ['Check in: Harbor Realty', 'Send proposal reminder', 'Thank-you notes'], 860, 1142], ['ADMIN', ['Prepare onboarding doc', 'File signed forms', 'Organize shared folder'], 860, 1268]];
function buildS3() {
  const root = el('div', 'scene', stage, '');
  const dim = el('div', 'abs', root, `inset:0;background:${BG};opacity:0;`);
  const bd = el('div', 'abs', root, 'left:0;top:0;width:1080px;height:1920px;transform-origin:540px 1000px;');
  const R = rng(5); const ini = ['JM', 'KT', 'AR', 'DL', 'SP', 'MV'];
  const lanes = LANES.map((L, i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 40 + col * 512, y = 520 + row * 352;
    const e = el('div', 'lane', bd, `left:${x}px;top:${y}px;width:488px;height:332px;`);
    const hd = el('div', 'lanehd', e, '', `<b>${L[0]}</b>`); const stt = el('span', '', hd, '', 'ASSIGNED');
    const cards = L[1].map((txt, k) => {
      const ce = el('div', 'card', bd, `width:464px;left:0;top:0;height:76px;font-size:27px;`, ''); const ck = mkCheck(ce, 'st', ''); el('span', '', ce, 'overflow:hidden;text-overflow:ellipsis', txt); el('div', 'ini', ce, '', ini[(i + k) % 6]);
      return { e: ce, ck, tx: x + 12, ty: y + 76 + k * 85, sx: L[2] - 232 + (R() - .5) * 90, sy: L[3] - 34 + (R() - .5) * 70, rot: (R() - .5) * 30, ts: C.cards_start + (i * 3 + k) * .05 };
    });
    return { e, stt, cards, i, x, y };
  });
  const cp = [pair(bd, 'GET SUPPORT', 'WHERE YOU NEED IT.', 240, { max1: 124 }), pair(bd, 'FLEXIBLE', 'REMOTE ASSISTANCE.', 240, { max1: 124 })];
  const sweep = el('div', 'abs', root, 'left:-300px;top:-200px;width:260px;height:2400px;background:linear-gradient(90deg,transparent,rgba(241,213,139,.55),transparent);transform:rotate(14deg);filter:blur(8px);');
  return {
    root, update(t) {
      const on = t >= C.freeze - .01 && t < 13.5; SHOW(root, on); if (!on) return;
      dim.style.opacity = E.io2(seg(t, 8.3, 9.2));
      const tilt = 1 - E.out3(seg(t, 8.5, 9.7));
      const drift = 1 + .035 * seg(t, 9.7, 13);
      const out = seg(t, 12.6, 12.95);
      root.style.opacity = 1 - out;
      bd.style.transform = `perspective(2000px) rotateX(${tilt * 34}deg) translateY(${tilt * 120}px) scale(${(1 - tilt * .12) * drift * (1 + out * .05)})`;
      lanes.forEach(L => {
        const p = E.out3(seg(t, 8.7 + L.i * .06, 9.3 + L.i * .06)); L.e.style.opacity = p;
        const a = seg(t, 10.35 + L.i * .22, 10.6 + L.i * .22), b = seg(t, 11.55 + L.i * .2, 11.8 + L.i * .2);
        const txt = b > 0 ? 'DONE' : (a > 0 ? 'IN PROGRESS' : 'ASSIGNED'); if (L.stt.textContent !== txt) L.stt.textContent = txt;
        L.stt.style.background = b > 0 ? 'linear-gradient(180deg,#F1D58B,#D6A84F)' : (a > 0 ? '#3E6AA8' : 'rgba(255,255,255,.14)'); L.stt.style.color = b > 0 ? '#2A1D05' : '#fff';
        L.cards.forEach(c => {
          const q = seg(t, c.ts, c.ts + .75), m = E.out3(q), o = clamp((t - c.ts) / .12);
          if (o <= 0) { c.e.style.display = 'none'; return; } c.e.style.display = 'flex';
          const x = lerp(c.sx, c.tx, m), y = lerp(c.sy, c.ty, m) - Math.sin(q * Math.PI) * 90, rot = lerp(c.rot, 0, E.out3(q)), sc = 1 + .1 * Math.sin(q * Math.PI);
          c.e.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${sc})`; c.e.style.opacity = Math.min(1, o) * (1 - seg(t, 12.6, 12.95));
          const ca = seg(t, 10.35 + L.i * .22 + 0.0, 10.6 + L.i * .22), cb = seg(t, 11.55 + L.i * .2 + c.ts * 0, 11.8 + L.i * .2);
          c.ck.set(cb > 0 ? cb : (ca > 0 ? .0001 : 0), cb > 0 ? '#D6A84F' : '#3E6AA8'); if (ca > 0 && cb <= 0) { c.ck.b.style.background = '#3E6AA8'; c.ck.b.style.borderColor = '#3E6AA8'; }
        });
      });
      showPair(cp[0], t, C.cap3a, C.cap3b - .45); showPair(cp[1], t, C.cap3b, 12.45);
      const sw = seg(t, 9.55, 10.3); sweep.style.transform = `translateX(${sw * 1500}px) rotate(14deg)`; sweep.style.opacity = sw > 0 && sw < 1 ? 1 : 0;
    }
  };
}

/* ===================================================== SCENE 4 — THE SERVICES */
function buildS4() {
  const root = el('div', 'scene', stage, `background:${BG};`);
  el('div', 'abs', root, 'inset:0;opacity:.45;background-image:linear-gradient(rgba(255,255,255,.03) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.03) 2px,transparent 2px);background-size:90px 90px;');
  const world = el('div', 'abs', root, 'left:0;top:0;width:1080px;height:1920px;perspective:2600px;perspective-origin:540px 760px;');
  const names = [['ADMIN SUPPORT', 'Client Onboarding Summary'], ['CALENDAR COORDINATION', 'Week of Nov 10'], ['RESEARCH & FOLLOW-UPS', 'Research & Follow-ups'], ['EMAIL MANAGEMENT', 'Inbox · Client Messages']];
  const stgs = names.map((n, i) => {
    const s = el('div', 'abs', world, `left:60px;top:0;width:960px;height:1920px;transform-origin:480px 760px;`);
    const sl = el('div', 'slabel', s, '', `<i>0${i + 1}</i><span class="gold">${n[0]}</span>`); const sls = sl.querySelector('span'); sls.style.fontSize = Math.min(40, fit(n[0], 800, 780, .07)) + 'px';
    const win = el('div', 'win', s, 'left:0;top:330px;width:960px;height:860px;');
    const hd = el('div', 'winhd', win, 'padding:0 30px;', `<span class="hdt" style="color:#fff;font-weight:700">${n[1]}</span>`);
    const body = el('div', 'abs', win, 'left:0;top:76px;width:960px;height:784px;overflow:hidden;');
    return { s, win, hd, body, i };
  });
  /* --- stage 0: admin doc + sheet --- */
  const S0 = stgs[0], d0 = {}; const b0 = S0.body;
  const pill0 = el('span', 'pill ghost', S0.hd, 'margin-left:auto;font-size:21px;height:38px;', 'DRAFT');
  d0.h1 = el('div', 'abs', b0, 'left:40px;top:26px;font:800 40px Montserrat;color:var(--navy);white-space:nowrap;');
  d0.sk = [100, 92, 72].map((w, i) => el('div', 'skel', b0, `left:40px;top:${96 + i * 28}px;width:${w * 8.8}px;`));
  const chkItems = ['Welcome email sent', 'Intake form received', 'Kickoff call scheduled'];
  d0.ck = chkItems.map((txt, i) => { const r = el('div', 'abs', b0, `left:40px;top:${200 + i * 56}px;display:flex;align-items:center;gap:18px;font:600 29px Inter;color:var(--txt);`); const ck = mkCheck(r, 'chk', ''); const tx = el('span', '', r, ''); return { r, ck, tx, txt }; });
  const tdat = [['Client', 'Stage', 'Next step'], ['Cedar & Co.', 'Onboarding', 'Kickoff call'], ['Orchard Lane', 'Active', 'Monthly report'], ['Harbor Realty', 'Proposal', 'Follow up Tue'], ['Brightleaf', 'Active', 'Content review'], ['Pine & Co.', 'Intake', 'Send forms']];
  d0.tb = tdat.map((r, i) => el('div', 'tbl', b0, `top:${392 + i * 64}px;${i == 0 ? 'background:var(--navy);color:#fff;border-radius:14px;left:40px;right:40px;font-weight:800;padding:0 18px;font-size:23px;letter-spacing:.05em;text-transform:uppercase;' : 'padding:0 18px;'}`, r.map(c => `<span>${c}</span>`).join('')));
  /* --- stage 1: calendar --- */
  const S1 = stgs[1], b1 = S1.body; const pill1 = el('span', 'pill red', S1.hd, 'margin-left:auto;font-size:21px;height:38px;', '2 CONFLICTS');
  const dcw = (960 - 90) / 3; ['TUE 11', 'WED 12', 'THU 13'].forEach((d, i) => el('div', 'abs', b1, `left:${90 + i * dcw}px;top:0;width:${dcw}px;height:64px;display:flex;align-items:center;justify-content:center;font:800 24px Montserrat;letter-spacing:.06em;color:var(--navy);border-left:2px solid var(--line);`, d));
  for (let h = 0; h < 8; h++) { el('div', 'hour', b1, `top:${64 + h * 90}px;`); el('div', 'hlab', b1, `top:${64 + h * 90 + 6}px;font-size:22px;`, `${h + 9 > 12 ? h + 9 - 12 : h + 9} ${h + 9 < 12 ? 'AM' : 'PM'}`); }
  for (let i = 0; i < 3; i++) el('div', 'abs', b1, `left:${90 + i * dcw}px;top:64px;width:2px;height:720px;background:var(--line);`);
  const evc = (day, h, dur, txt, col, extra = '') => el('div', 'ev', b1, `left:${90 + day * dcw + 8}px;top:${64 + (h - 9) * 90 + 4}px;width:${dcw - 16}px;height:${dur * 90 - 8}px;background:${col};font-size:23px;padding:10px 12px;${extra}`, txt);
  const c1 = {}; c1.sync = evc(0, 9, 1, 'Team sync', '#46536F'); c1.rep = evc(2, 15, 1, 'Report due', '#A85B5B'); c1.lunch = evc(1, 12, 1, 'Lunch w/ Maya', '#7A5BA8');
  c1.prop = evc(1, 10, 1.5, 'Proposal review', '#3E6AA8', 'z-index:2;'); c1.vend = evc(1, 10.5, 1.5, 'Vendor call', '#2F7D6B', 'z-index:3;left:' + (90 + dcw + 8 + 70) + 'px;width:' + (dcw - 86) + 'px;');
  c1.cc = evc(0, 11, 1.2, '<b>Client call</b><br><span style="font-weight:600;font-size:20px">Cedar & Co.</span>', 'linear-gradient(180deg,#F1D58B,#D6A84F)', 'color:#2A1D05;box-shadow:0 0 0 4px rgba(214,168,79,.35),0 14px 30px rgba(10,35,80,.35);');
  c1.tagC = el('div', 'tag', b1, `left:${90 + dcw + 20}px;top:${64 + 20 + 90 * 1.5 + 100}px;background:#E5584B;color:#fff;`, 'CONFLICT');
  c1.tagI = el('div', 'tag', b1, `left:${90 + 20}px;top:${64 + 2 * 90 + 100 + 8}px;background:#fff;color:#8A6417;border:2px solid #D6A84F;`, 'INVITE SENT');
  /* --- stage 2: research & follow-ups --- */
  const S2 = stgs[2], b2 = S2.body; const d2 = {};
  el('div', 'abs', b2, 'left:40px;top:22px;font:800 22px Montserrat;letter-spacing:.08em;color:#98A3B8;', 'RESEARCH NOTES');
  const srcs = ['Vendor comparison', 'Competitor overview', 'Industry article'];
  d2.src = srcs.map((s, i) => ({ e: el('div', 'abs', b2, `left:40px;top:${72 + i * 96}px;width:340px;height:80px;border-radius:18px;background:#fff;border:2px solid var(--line);box-shadow:0 10px 22px rgba(10,35,80,.12);display:flex;align-items:center;gap:14px;padding:0 20px;font:700 25px Inter;color:var(--txt);`, `<span style="width:14px;height:36px;border-radius:7px;background:${['#3E6AA8', '#B5832E', '#2F7D6B'][i]}"></span>${s}`), i }));
  d2.sum = el('div', 'abs', b2, 'left:420px;top:72px;width:500px;height:272px;border-radius:24px;background:linear-gradient(180deg,#0E2B5E,#0A2350);color:#fff;padding:26px 30px;box-shadow:0 20px 40px rgba(10,35,80,.35);', '<div style="font:800 21px Montserrat;letter-spacing:.08em;color:#F1D58B">SUMMARY</div>');
  const sumTx = ['Top options shortlisted', 'Key differences noted', 'Open questions flagged']; d2.sb = sumTx.map((s, i) => el('div', 'abs', d2.sum, `left:30px;top:${70 + i * 62}px;font:600 27px Inter;white-space:nowrap;display:flex;gap:14px;align-items:center;`, `<span style="width:14px;height:14px;border-radius:50%;background:#D6A84F;flex:none"></span><span></span>`));
  el('div', 'abs', b2, 'left:40px;top:392px;font:800 22px Montserrat;letter-spacing:.08em;color:#98A3B8;', 'FOLLOW-UP TRACKER');
  const fu = [['Proposal reminder · Cedar & Co.', 'SENT', '#3E6AA8'], ['Check in · Harbor Realty', 'SCHEDULED', '#B5832E'], ['Confirm onboarding call', 'DONE', '#2F7D6B'], ['Thank-you note · Maya R.', 'SENT', '#3E6AA8']];
  d2.fu = fu.map((f, i) => { const r = el('div', 'abs', b2, `left:40px;top:${436 + i * 84}px;width:880px;height:72px;border-radius:18px;background:#fff;border:2px solid var(--line);display:flex;align-items:center;gap:18px;padding:0 20px;font:700 25px Inter;color:var(--txt);`); const ck = mkCheck(r, 'chk', ''); el('span', '', r, 'flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;', f[0]); const tg = el('span', 'tag', r, `background:${f[2]};color:#fff;`, 'PENDING'); return { r, ck, tg, f }; });
  /* --- stage 3: email --- */
  const S3 = stgs[3], b3 = S3.body; const pill3 = el('span', 'pill ghost', S3.hd, 'margin-left:auto;font-size:21px;height:38px;', 'UNSORTED');
  const eml = [['Maya Reyes', 'Booking request for next week', 'MR', '#3E6AA8', 'CLIENT', '#3E6AA8', 1], ['Orchard Lane Bakery', 'Invoice #1048 — payment reminder', 'OL', '#B5832E', 'INVOICE', '#6B7A99', 4], ['SaaS Weekly', '10 tips for your Monday', 'SW', '#98A3B8', 'NEWSLETTER', '#98A3B8', -1], ['Daniel Ortiz', 'Re: Proposal review', 'DO', '#5B7BA8', 'PRIORITY', '#D6A84F', 0], ['Cedar & Co. Consulting', 'Can we move our call?', 'CC', '#2F7D6B', 'CLIENT', '#3E6AA8', 2], ['Brightleaf Studio', 'Monthly report needed by Friday', 'BS', '#3E6AA8', 'REPORTS', '#46536F', 5], ['Lena Park', 'Quick question about onboarding', 'LP', '#7A5BA8', 'CLIENT', '#3E6AA8', 3]];
  const rh3 = 104; const d3 = eml.map((m, i) => { const r = el('div', 'row', b3, `width:960px;height:${rh3 - 2}px;padding:0 24px;`, `<div class="av" style="background:${m[3]}">${m[2]}</div><div class="rt"><div class="rs">${m[0]}</div><div class="rj">${m[1]}</div></div>`); const tg = el('span', 'tag', r, `background:${m[5]};color:${m[4] == 'PRIORITY' ? '#2A1D05' : '#fff'};opacity:0;`, m[4]); const dot = el('div', 'dot', r, ''); return { r, m, tg, dot, i }; });
  d3[0].dft = null; const draft = el('div', 'abs', b3, `left:24px;width:912px;top:${rh3 * 1 - 2}px;height:122px;border-radius:20px;background:linear-gradient(180deg,#FFF8E4,#FBEFC8);border:2px solid #D6A84F;padding:50px 22px 0;font:600 25px Inter;color:#4A3A12;opacity:0;`, '');
  const dtxt = el('div', '', draft, ''); el('div', 'tag', draft, 'position:absolute;right:20px;top:16px;background:#D6A84F;color:#2A1D05;font-size:17px;height:32px;', 'READY FOR YOUR REVIEW');
  /* indicator dots + stack text */
  const dots = [0, 1, 2, 3].map(i => el('div', 'abs', root, `left:${540 - 66 + i * 44 - 7}px;top:1214px;width:14px;height:14px;border-radius:7px;background:#fff;`));
  const stack = [['YOUR BUSINESS.', ''], ['YOUR PRIORITIES.', ''], ['THE RIGHT SUPPORT.', 'gold drop']].map((l, i) => maskLine(root, l[0], { y: 1262 + i * 86, size: 74, cls: l[1], ls: -0.005 }));
  const bnd = C.stage_b;
  return {
    root, update(t) {
      const on = t > 12.7 && t < 19.4; SHOW(root, on); if (!on) return;
      root.style.opacity = E.out2(seg(t, 12.95, 13.3)) * (1 - seg(t, 18.85, 19.15)); root.style.transform = `scale(${1 + E.in3(seg(t, 18.85, 19.15)) * .12 + (1 - E.out3(seg(t, 12.95, 13.45))) * .05})`;
      let f = 0; for (let k = 1; k < 4; k++) f += E.io3(seg(t, bnd[k] - .27, bnd[k] + .27));
      stgs.forEach(S => { const rel = S.i - f, ar = Math.min(1, Math.abs(rel)); S.s.style.transform = `translateX(${rel * 930}px) rotateY(${-rel * 26}deg) scale(${1 - .13 * ar}) translateY(${Math.sin(t * 1.3 + S.i) * 4}px)`; S.s.style.opacity = 1 - .62 * ar; SHOW(S.s, ar < 1.9); });
      dots.forEach((d, i) => { const a = clamp(1 - Math.abs(i - f)); d.style.width = (14 + 30 * a) + 'px'; d.style.left = (540 - 66 + i * 44 - 7 + (i > Math.floor(f) ? 30 * (1 - clamp(f - Math.floor(f))) * 0 : 0)) + 'px'; d.style.background = a > .5 ? '#D6A84F' : 'rgba(255,255,255,.4)'; });
      stack.forEach((L, i) => { L.s.style.transform = `translateY(${(1 - E.expo(seg(t, C.stack[i], C.stack[i] + .55))) * 112}%)`; });
      /* stage 0 */
      { const u = 13.05; typed(d0.h1, 'Client Onboarding Summary', t, u, .55);
        d0.sk.forEach((s, i) => s.style.opacity = seg(t, u + .3 + i * .1, u + .45 + i * .1)); d0.sk.forEach((s, i) => s.style.transform = `scaleX(${E.out3(seg(t, u + .3 + i * .1, u + .75 + i * .1))})`); d0.sk.forEach(s => s.style.transformOrigin = 'left');
        d0.ck.forEach((c, i) => { typed(c.tx, c.txt, t, u + .45 + i * .2, .3); c.r.style.opacity = seg(t, u + .45 + i * .2, u + .55 + i * .2); c.ck.set(E.out3(seg(t, u + .8 + i * .2, u + 1.0 + i * .2))); });
        d0.tb.forEach((r, i) => { const a = E.out3(seg(t, u + .6 + i * .11, u + .85 + i * .11)); r.style.opacity = a; r.style.transform = `translateY(${(1 - a) * 24}px)`; });
        pill0.textContent = t > u + 1.2 ? 'PREPARED' : 'DRAFT'; pill0.style.background = t > u + 1.2 ? 'linear-gradient(180deg,#F1D58B,#D6A84F)' : ''; pill0.style.color = t > u + 1.2 ? '#2A1D05' : ''; }
      /* stage 1 */
      { const u = bnd[1] - .1, mv = E.io3(seg(t, u + .45, u + 1.0)), dd = seg(t, u + .15, u + .5);
        const tx = (90 + dcw + 8 + 70) + mv * ((90 + 2 * dcw + 8) - (90 + dcw + 8 + 70) + 0), ty = 64 + 1.5 * 90 + 4 + mv * (64 + 6 * 90 - 64 - 1.5 * 90) * .0;
        c1.vend.style.left = (90 + dcw + 8 + 70 + mv * (dcw - 70)) + 'px'; c1.vend.style.top = (64 + (10.5 - 9) * 90 + 4 + mv * (4.5 * 90)) + 'px'; c1.vend.style.width = (dcw - 86 + mv * 70) + 'px';
        c1.vend.style.outline = mv < 1 ? '4px dashed #E5584B' : 'none'; c1.prop.style.outline = mv < 1 ? '4px dashed #E5584B' : 'none';
        c1.tagC.style.opacity = (seg(t, u + .2, u + .35)) * (1 - seg(t, u + .5, u + .7));
        const cc = E.back(seg(t, u + .75, u + 1.1)); c1.cc.style.opacity = seg(t, u + .75, u + .85); c1.cc.style.transform = `translateY(${(1 - cc) * -90}px) scale(${.85 + .15 * cc})`;
        c1.tagI.style.opacity = seg(t, u + 1.15, u + 1.3);
        [c1.sync, c1.rep, c1.lunch, c1.prop, c1.vend].forEach((e, i) => { if (e !== c1.vend) { const a = E.out3(seg(t, u - .1 + i * .05, u + .2 + i * .05)); e.style.opacity = a; } });
        const ok = t > u + 1.0; pill1.textContent = ok ? 'COORDINATED' : '2 CONFLICTS'; pill1.style.background = ok ? 'linear-gradient(180deg,#F1D58B,#D6A84F)' : '#E5584B'; pill1.style.color = ok ? '#2A1D05' : '#fff'; }
      /* stage 2 */
      { const u = bnd[2] - .1; d2.src.forEach((s, i) => { const m = E.io3(seg(t, u + .45 + i * .14, u + 1.0 + i * .14)); s.e.style.transform = `translateX(${m * 70}px) scale(${1 - m * .15})`; s.e.style.opacity = (1 - seg(t, u + .75 + i * .14, u + 1.05 + i * .14)) * seg(t, u - .05, u + .15); });
        d2.sum.style.opacity = E.out3(seg(t, u + .3, u + .6)); d2.sum.style.transform = `scale(${.94 + .06 * E.out3(seg(t, u + .3, u + .7))})`;
        d2.sb.forEach((b, i) => { const tx = b.lastChild; typed(tx, sumTx[i], t, u + 1.0 + i * .17, .3); });
        d2.fu.forEach((r, i) => { const a = E.out3(seg(t, u + .2 + i * .1, u + .45 + i * .1)); r.r.style.opacity = a; r.r.style.transform = `translateX(${(1 - a) * 60}px)`; const c = seg(t, u + .85 + i * .17, u + 1.05 + i * .17); r.ck.set(E.out3(c), r.f[2]); r.tg.textContent = c > 0 ? r.f[1] : 'PENDING'; r.tg.style.background = c > 0 ? r.f[2] : '#DCE3EF'; r.tg.style.color = c > 0 ? '#fff' : '#6A768E'; }); }
      /* stage 3 */
      { const u = bnd[3] - .1; const labelP = seg(t, u + .1, u + .55); const moveP = E.io3(seg(t, u + .55, u + 1.1)); const orderOf = i => eml[i][6];
        d3.forEach((r, i) => { const from = i, to = eml[i][6] < 0 ? 6.4 : eml[i][6]; const y = lerp(from, to, moveP) * rh3 + (t > u + 1.15 ? 0 : 0) + (i !== 0 || true ? 0 : 0);
          const extra = (to >= 1 ? seg(t, u + .9, u + 1.15) * (draft_h(t, u)) : 0);
          r.r.style.transform = `translateY(${y + (eml[i][6] >= 1 ? extra : 0)}px)`;
          const a = seg(t, u + .1 + i * .06, u + .25 + i * .06); r.tg.style.opacity = a; r.tg.style.transform = `scale(${.6 + .4 * E.back(a)})`; r.dot.style.opacity = 1 - seg(t, u + .55 + i * .05, u + .8 + i * .05);
          r.r.style.opacity = eml[i][6] < 0 ? 1 - seg(t, u + .75, u + 1.05) : 1; if (eml[i][6] < 0) r.r.style.transform += ` translateX(${seg(t, u + .75, u + 1.05) * 300}px)`; });
        const dh = seg(t, u + .9, u + 1.15); draft.style.opacity = dh; draft.style.top = (rh3 * 1 + 4) + 'px'; draft.style.transform = `scaleY(${.6 + .4 * E.out3(dh)})`; draft.style.transformOrigin = 'top';
        typed(dtxt, 'Hi Maya, thanks for reaching out — Tuesday at 10 AM works. Invite to follow.', t, u + 1.0, .4);
        dtxt.style.maxWidth = '640px'; dtxt.style.whiteSpace = 'normal'; dtxt.style.lineHeight = '1.3';
        const sorted = t > u + .9; pill3.textContent = sorted ? 'ORGANIZED' : 'UNSORTED'; pill3.style.background = sorted ? 'linear-gradient(180deg,#F1D58B,#D6A84F)' : ''; pill3.style.color = sorted ? '#2A1D05' : ''; }
    }
  };
}
function draft_h(t, u) { return 128; }

/* ===================================================== SCENE 5 — FLEXIBLE PLAN */
function buildS5() {
  const root = el('div', 'scene', stage, `background:${BG};`);
  el('div', 'abs', root, 'inset:0;opacity:.45;background-image:linear-gradient(rgba(255,255,255,.03) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.03) 2px,transparent 2px);background-size:90px 90px;');
  const wrap = el('div', 'abs', root, 'left:0;top:0;width:1080px;height:1920px;transform-origin:540px 780px;');
  const tag = el('div', 'abs', wrap, 'left:0;top:262px;width:1080px;display:flex;justify-content:center;', '<span class="pill ghost" style="height:50px;font-size:25px;letter-spacing:.14em;padding:0 30px">YOUR SUPPORT PLAN</span>');
  const pA = el('div', 'abs', wrap, 'left:40px;top:340px;width:1000px;height:300px;border-radius:34px;border:3px solid rgba(214,168,79,.8);background:rgba(214,168,79,.07);');
  el('div', 'abs', pA, 'left:34px;top:20px;font:800 24px Montserrat;letter-spacing:.1em;color:#F1D58B;', 'YOU FOCUS ON');
  const pB = el('div', 'abs', wrap, 'left:40px;top:700px;width:1000px;height:596px;border-radius:34px;border:3px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);');
  el('div', 'abs', pB, 'left:34px;top:20px;font:800 24px Montserrat;letter-spacing:.1em;color:#C9D6EE;', 'HANDED OFF TO YOUR SUPPORT');
  const arrow = el('div', 'abs', wrap, 'left:520px;top:640px;width:40px;height:60px;', '<svg viewBox="0 0 40 60" width="40" height="60"><path d="M20 2v46M6 36l14 14 14-14" stroke="#D6A84F" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  const R = rng(9);
  const focus = ['Strategy', 'Clients', 'Growth'].map((n, i) => { const e = el('div', 'tile f', wrap, `left:0;top:0;width:300px;height:170px;justify-content:center;font-size:40px;`, n); return { e, tx: 70 + i * 320, ty: 340 + 96, sx: 540 - 150 + (R() - .5) * 400, sy: -300, i }; });
  const hand = ['Email', 'Scheduling', 'Admin', 'Research', 'Follow-ups', 'Reports'].map((n, i) => { const e = el('div', 'tile', wrap, `left:0;top:0;width:460px;height:142px;font-size:40px;`, `<span>${n}</span>`); const ck = mkCheck(e, 'tc', ''); const c = i % 2, r = Math.floor(i / 2); return { e, ck, tx: 70 + c * 480, ty: 700 + 84 + r * 158, sx: 540 - 230 + (R() - .5) * 140, sy: 700 + (R() - .5) * 400, rot: (R() - .5) * 40, i }; });
  const cp = [pair(root, 'SUPPORT THAT', 'FITS YOUR NEEDS.', 1340, { max1: 118 }), pair(root, 'FOCUS ON WHAT', 'MATTERS MOST.', 1340, { max1: 118 })];
  const glowA = el('div', 'abs', wrap, 'left:40px;top:340px;width:1000px;height:300px;border-radius:34px;box-shadow:0 0 90px 10px rgba(214,168,79,.55),inset 0 0 60px rgba(214,168,79,.25);opacity:0;');
  return {
    root, update(t) {
      const on = t > 18.6 && t < 22.3; SHOW(root, on); if (!on) return;
      root.style.opacity = E.out2(seg(t, 18.85, 19.2)); root.style.transform = `scale(${1 + (1 - E.out3(seg(t, 18.85, 19.5))) * -.08})`;
      const a = E.out3(seg(t, 19.0, 19.4)); tag.style.opacity = a; pA.style.opacity = pB.style.opacity = arrow.style.opacity = a; pA.style.transform = `translateY(${(1 - a) * 40}px)`; pB.style.transform = `translateY(${(1 - a) * 60}px)`;
      const pulse = seg(t, C.cap5b, C.cap5b + .5); const dimB = pulse * .45;
      focus.forEach(f => { const q = E.out3(seg(t, 19.05 + f.i * .1, 19.7 + f.i * .1)); const sc = 1 + pulse * .05 * (1 + Math.sin((t - C.cap5b) * 5 + f.i)) * .5; f.e.style.opacity = clamp(q * 4); f.e.style.transform = `translate(${lerp(f.sx, f.tx, q)}px,${lerp(f.sy, f.ty, q) - Math.sin(q * Math.PI) * 40}px) scale(${sc})`; });
      hand.forEach(h => { const ts = 19.1 + h.i * .09, q = E.out3(seg(t, ts, ts + .7)), c = seg(t, 19.95 + h.i * .15, 20.15 + h.i * .15);
        h.e.style.opacity = clamp(q * 4) * (1 - dimB); h.e.style.transform = `translate(${lerp(h.sx, h.tx, q)}px,${lerp(h.sy, h.ty, q) - Math.sin(q * Math.PI) * 60}px) rotate(${lerp(h.rot, 0, q)}deg) scale(${1 + .04 * Math.sin(c * Math.PI)})`; h.ck.set(E.out3(c)); });
      pB.style.opacity = a * (1 - dimB * .8);
      glowA.style.opacity = pulse * (.7 + .3 * Math.sin((t - C.cap5b) * 5));
      showPair(cp[0], t, C.cap5a, C.cap5b - .45); showPair(cp[1], t, C.cap5b, 99);
    }
  };
}

/* ===================================================== SCENE 6 — CTA */
function buildS6() {
  const root = el('div', 'scene', stage, 'background:radial-gradient(1200px 1000px at 50% 18%,#17387A 0%,#0A2350 38%,#050F26 100%);');
  const beams = [0, 1].map(i => el('div', 'abs', root, `left:${i ? 620 : -200}px;top:-300px;width:${i ? 380 : 520}px;height:2600px;background:linear-gradient(90deg,transparent,rgba(214,168,79,${i ? .16 : .12}),transparent);transform:rotate(${i ? 24 : 28}deg);filter:blur(6px);`));
  const glow = el('div', 'abs', root, 'left:140px;top:480px;width:800px;height:500px;background:radial-gradient(closest-side,rgba(214,168,79,.28),transparent);');
  const comp = el('div', 'abs', root, 'left:0;top:0;width:1080px;height:1920px;transform-origin:540px 960px;');
  const wmS = fit('PROVIRTUAL PH', 900, 900, .02);
  const wm = el('div', 'mask', comp, `left:0;top:560px;width:1080px;height:${wmS * 1.2}px;`); const wmi = el('div', 'mt', wm, `font-size:${wmS}px;line-height:${wmS * 1.2}px;letter-spacing:.02em;`, 'PROVIRTUAL <span class="gold">PH</span>');
  const line = el('div', 'abs', comp, `left:270px;top:${560 + wmS * 1.2 + 26}px;width:540px;height:5px;border-radius:3px;background:linear-gradient(90deg,transparent,#D6A84F,transparent);transform-origin:center;`);
  const h1 = maskLine(comp, 'READY FOR', { y: 830, size: 132 });
  const h2s = fit('EXTRA SUPPORT?', 900, 930);
  const h2 = maskLine(comp, 'EXTRA SUPPORT?', { y: 830 + 132 * 1.02, size: h2s, cls: 'gshine drop' });
  const cw = 900, ch = 156, cx = 90, cy = 1215;
  const cta = el('div', 'cta', comp, `left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px;`, ''); const ctas = fit('DM “VA” TO GET STARTED.', 800, 790, -.005); const ctt = el('span', '', cta, `font-size:${ctas}px;white-space:nowrap;position:relative;`, 'DM “VA” TO GET STARTED.');
  const shine = el('div', 'abs', cta, 'left:-200px;top:-40px;width:140px;height:260px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);transform:rotate(20deg);');
  const sub = el('div', 'abs', comp, 'left:0;top:1415px;width:1080px;text-align:center;font:600 33px Inter;letter-spacing:.14em;color:#9FB3D6;text-transform:uppercase;', 'Flexible remote business support');
  const svc = el('div', 'abs', comp, 'left:0;top:1478px;width:1080px;text-align:center;font:500 29px Inter;color:rgba(201,214,238,.8);letter-spacing:.04em;', 'Admin · Scheduling · Email · Research · Follow-ups');
  const flash = el('div', 'abs', root, 'inset:0;background:#F1D58B;opacity:0;');
  return {
    root, update(t) {
      const on = t > 22.0; SHOW(root, on); if (!on) return;
      root.style.opacity = seg(t, 22.0, 22.16);
      const k = t - 22.0;
      comp.style.transform = `scale(${1 + .035 * seg(t, 22.2, 25)})`;
      beams[0].style.transform = `translateX(${lerp(-150, 120, E.out3(seg(t, 22.0, 25)))}px) rotate(28deg)`; beams[1].style.transform = `translateX(${lerp(200, -80, E.out3(seg(t, 22.0, 25)))}px) rotate(24deg)`;
      glow.style.opacity = .7 + .3 * Math.sin(t * 2.4);
      wmi.style.transform = `translateY(${(1 - E.expo(seg(t, C.word, C.word + .7))) * 115}%)`;
      line.style.transform = `scaleX(${E.out3(seg(t, C.word + .45, C.word + 1.1))})`; line.style.opacity = seg(t, C.word + .45, C.word + .7);
      h1.s.style.transform = `translateY(${(1 - E.expo(seg(t, C.headline, C.headline + .6))) * 115}%)`; h2.s.style.transform = `translateY(${(1 - E.expo(seg(t, C.headline + .13, C.headline + .73))) * 115}%)`;
      h2.s.style.backgroundPosition = `${100 - seg(t, 22.9, 24.6) * 90}% 0`;
      const cp = E.back2(seg(t, C.cta, C.cta + .55)); cta.style.opacity = clamp(seg(t, C.cta, C.cta + .2)); cta.style.transform = `scale(${.6 + .4 * cp}) translateY(${(1 - cp) * 60}px)`;
      const pulse = t > C.cta + .6 ? 1 + .02 * Math.sin((t - C.cta) * 6) : 1; cta.style.transform += ` scale(${pulse})`;
      cta.style.boxShadow = `0 30px 80px rgba(214,168,79,${.3 + .2 * Math.sin((t - C.cta) * 5) * (t > C.cta + .5 ? 1 : 0)}),0 0 0 ${seg(t, C.cta + .3, C.cta + .8) * 6}px rgba(241,213,139,.25)`;
      shine.style.transform = `translateX(${seg(t, C.cta + .45, C.cta + 1.1) * 1200 + seg(t, 24.2, 24.8) * 1200 * 0}px) rotate(20deg)`;
      sub.style.opacity = E.out3(seg(t, C.cta + .5, C.cta + 1.0)); svc.style.opacity = E.out3(seg(t, C.cta + .75, C.cta + 1.25));
      flash.style.opacity = 0;
    }
  };
}

/* ===================================================== GLOBAL */
function buildGlobal() {
  const wm = el('div', 'abs', stage, 'left:0;top:196px;width:1080px;text-align:center;font:800 25px Montserrat;letter-spacing:.32em;color:rgba(255,255,255,.72);z-index:50;', 'PROVIRTUAL <span style="color:#D6A84F">PH</span>');
  const band = el('div', 'abs', stage, 'left:-500px;top:-300px;width:420px;height:2600px;background:linear-gradient(90deg,transparent,rgba(248,228,168,.9) 45%,rgba(255,255,255,.95) 50%,rgba(248,228,168,.9) 55%,transparent);filter:blur(10px);z-index:60;opacity:0;');
  const vig = el('div', 'abs', stage, 'inset:0;z-index:40;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 60%,rgba(0,0,0,.28) 100%);');
  return { update(t) {
    wm.style.opacity = seg(t, 3.1, 3.5) * (1 - seg(t, 21.7, 21.95));
    const p = seg(t, C.flash, C.flash + .5); band.style.opacity = p > 0 && p < 1 ? 1 : 0; band.style.transform = `translateX(${lerp(-200, 1700, E.io2(p))}px) rotate(18deg)`;
  } };
}

let S;
window.__ready = (async () => {
  await document.fonts.load('900 100px Montserrat'); await document.fonts.load('800 100px Montserrat'); await document.fonts.load('700 100px Montserrat');
  for (const w of [400, 500, 600, 700]) await document.fonts.load(`${w} 20px Inter`);
  S = [buildS1(), buildS2(), buildS3(), buildS4(), buildS5(), buildS6(), buildGlobal()];
  return true;
})();
window.renderFrame = t => { S.forEach(s => s.update(t)); };
})();
