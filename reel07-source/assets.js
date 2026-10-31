/* ProVirtual PH — Reel #7: original fictional assets (editing UI, recording frames, content cards) */

/* ---------- icons ---------- */
function icon(c, name, x, y, s, col = C.gold, lw = 3) {
  c.save(); c.translate(x, y); c.scale(s / 40, s / 40); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw * 40 / s * (s / 40) * 1; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 3.2;
  if (name === 'trim') {
    c.beginPath(); c.arc(-9, 12, 6, 0, 7); c.stroke(); c.beginPath(); c.arc(9, 12, 6, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(-6, 7); c.lineTo(10, -16); c.moveTo(6, 7); c.lineTo(-10, -16); c.stroke();
  } else if (name === 'cc') {
    rr(c, -17, -12, 34, 24, 5); c.stroke(); T(c, 'CC', 0, 5.5, { size: 15, w: 900, col, al: 'center' });
  } else if (name === 'star') {
    c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 17, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r + 1); } c.closePath(); c.stroke();
  } else if (name === 'audio') {
    [-12, -6, 0, 6, 12].forEach((dx, i) => { const hh = [6, 14, 20, 11, 5][i]; c.beginPath(); c.moveTo(dx, -hh); c.lineTo(dx, hh); c.stroke(); });
  } else if (name === 'thumb') {
    rr(c, -17, -13, 34, 26, 4); c.stroke(); c.beginPath(); c.moveTo(-13, 9); c.lineTo(-4, -2); c.lineTo(3, 5); c.lineTo(8, 0); c.lineTo(14, 9); c.stroke(); c.beginPath(); c.arc(8, -6, 2.6, 0, 7); c.fill();
  } else if (name === 'social') {
    rr(c, -10, -17, 20, 34, 5); c.stroke(); c.beginPath(); c.moveTo(-3, -5); c.lineTo(5, 0); c.lineTo(-3, 5); c.closePath(); c.fill();
  } else if (name === 'play') {
    c.beginPath(); c.moveTo(-8, -12); c.lineTo(12, 0); c.lineTo(-8, 12); c.closePath(); c.fill();
  } else if (name === 'check') {
    c.beginPath(); c.moveTo(-12, 1); c.lineTo(-3, 10); c.lineTo(13, -9); c.stroke();
  } else if (name === 'heart') {
    c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-22, -4, -10, -20, 0, -8); c.bezierCurveTo(10, -20, 22, -4, 0, 12); c.stroke();
  } else if (name === 'comment') {
    c.beginPath(); c.arc(0, -2, 14, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-8, 10); c.lineTo(-13, 18); c.lineTo(-2, 12); c.stroke();
  } else if (name === 'share') {
    c.beginPath(); c.moveTo(-14, 4); c.lineTo(14, -12); c.lineTo(6, 14); c.lineTo(1, 4); c.closePath(); c.stroke();
  }
  c.restore();
}

/* ---------- fictional recording frames (wide 16:9) ---------- */
const FRV = [
  { top: '#16336f', bot: '#050c1f', glow: 'rgba(214,173,69,A)', gx: .12, gy: .12, sk: ['#223a69', '#0a1226'], rim: '#f1d27a' },
  { top: '#2a2a3a', bot: '#080b17', glow: 'rgba(214,173,69,A)', gx: .88, gy: .2, sk: ['#2d3550', '#0a0f1e'], rim: '#ffe3a0' },
  { top: '#0f3a5e', bot: '#040d1b', glow: 'rgba(143,169,212,A)', gx: .5, gy: .1, sk: ['#1f3d63', '#08111f'], rim: '#bcd2f5' },
];
let FR = [];
function sil(c, cx, by, s, v, kind) {
  const sk = v.sk;
  const body = (dx, grad) => {
    c.save(); c.translate(dx, 0);
    c.fillStyle = grad;
    c.beginPath(); c.moveTo(cx - 200 * s, by);
    c.bezierCurveTo(cx - 200 * s, by - 110 * s, cx - 150 * s, by - 135 * s, cx - 70 * s, by - 150 * s);
    c.lineTo(cx - 46 * s, by - 190 * s); c.lineTo(cx + 46 * s, by - 190 * s); c.lineTo(cx + 70 * s, by - 150 * s);
    c.bezierCurveTo(cx + 150 * s, by - 135 * s, cx + 200 * s, by - 110 * s, cx + 200 * s, by); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(cx, by - 262 * s, 60 * s, 74 * s, 0, 0, 7); c.fill();
    if (kind === 'guest') { c.beginPath(); c.ellipse(cx, by - 292 * s, 66 * s, 52 * s, 0, Math.PI, 0); c.fill(); }
    c.restore();
  };
  body(-5 * s, v.rim); // rim light (offset)
  const g = c.createLinearGradient(0, by - 340 * s, 0, by); g.addColorStop(0, sk[0]); g.addColorStop(1, sk[1]);
  body(0, g);
  if (kind === 'host') { // headphones
    c.strokeStyle = '#0a0f1e'; c.lineWidth = 11 * s; c.beginPath(); c.arc(cx, by - 270 * s, 72 * s, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
    c.fillStyle = '#0a0f1e'; [-1, 1].forEach(d => { rr(c, cx + d * 72 * s - 13 * s, by - 282 * s, 26 * s, 50 * s, 10 * s); c.fill(); });
    c.fillStyle = C.gold; [-1, 1].forEach(d => { c.beginPath(); c.arc(cx + d * 72 * s, by - 256 * s, 4 * s, 0, 7); c.fill(); });
  }
  // microphone
  const mx = cx + (kind === 'guest' ? -78 : 78) * s;
  c.fillStyle = '#05080f'; rr(c, mx - 15 * s, by - 232 * s, 30 * s, 74 * s, 14 * s); c.fill();
  c.fillStyle = 'rgba(214,173,69,.55)'; c.fillRect(mx - 15 * s, by - 204 * s, 30 * s, 3 * s);
  c.strokeStyle = '#05080f'; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(mx, by - 160 * s); c.lineTo(mx, by + 10 * s); c.stroke();
}
function buildFrame(vi) {
  const v = FRV[vi], c0 = mk(1280, 720), c = c0.getContext('2d');
  c.fillStyle = lg(c, 0, 0, 0, 720, [[0, v.top], [1, v.bot]]); c.fillRect(0, 0, 1280, 720);
  // acoustic wall panels
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 145; c.fillStyle = lg(c, x, 0, x + 90, 0, [[0, 'rgba(255,255,255,.07)'], [1, 'rgba(255,255,255,.01)']]);
    rr(c, x, 70, 96, 300, 12); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 12; k++) c.fillRect(x + 8, 84 + k * 24, 80, 3);
  }
  // key light glow + bokeh
  const gx = v.gx * 1280, gy = v.gy * 720, g = c.createRadialGradient(gx, gy, 10, gx, gy, 520);
  g.addColorStop(0, v.glow.replace('A', .5)); g.addColorStop(1, v.glow.replace('A', 0)); c.fillStyle = g; c.fillRect(0, 0, 1280, 720);
  for (let i = 0; i < 14; i++) {
    const bx = hash(i * 4.1 + vi) * 1280, by = hash(i * 2.3 + vi) * 380, br = 14 + hash(i * 9.1) * 34;
    const bg2 = c.createRadialGradient(bx, by, 0, bx, by, br); bg2.addColorStop(0, `rgba(247,220,134,${.10 + hash(i) * .12})`); bg2.addColorStop(1, 'rgba(247,220,134,0)');
    c.fillStyle = bg2; c.fillRect(bx - br, by - br, br * 2, br * 2);
  }
  // desk
  c.fillStyle = lg(c, 0, 560, 0, 720, [[0, 'rgba(0,0,0,.0)'], [1, 'rgba(0,0,0,.65)']]); c.fillRect(0, 560, 1280, 160);
  sil(c, 380, 760, 1.2, v, 'host'); sil(c, 870, 760, 1.2, v, 'guest');
  c.fillStyle = 'rgba(2,6,16,.55)'; c.fillRect(0, 700, 1280, 20);
  return c0;
}
function initFrames() { FR = [0, 1, 2].map(buildFrame); }
function hudOverlay(c, w, h, t) {
  const m = w * .035, L = w * .05;
  c.save(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(2, w * .003);
  [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(a => { c.beginPath(); c.moveTo(a[0], a[1] + a[3] * L); c.lineTo(a[0], a[1]); c.lineTo(a[0] + a[2] * L, a[1]); c.stroke(); });
  c.fillStyle = '#ff5a52'; c.beginPath(); c.arc(m + w * .02, m + w * .028, w * .008, 0, 7); c.fill();
  T(c, 'REC', m + w * .036, m + w * .0365, { size: w * .022, w: 800, col: '#fff', ls: .08 });
  T(c, fmtTC(t), w - m - w * .012, h - m - w * .02, { size: w * .022, w: 700, col: '#fff', al: 'right', ls: .04 });
  c.restore();
}

/* ---------- captions ---------- */
function capWords(c, cx, y, lines, n, size, o = {}) {
  const flat = lines.flat(); const hlIdx = o.hl == null ? -1 : o.hl;
  let k = 0;
  lines.forEach((ln, li) => {
    const ws = ln.map(w => tw(c, w, size, 900, 0)), sp = size * .4, total = ws.reduce((a, b) => a + b, 0) + sp * (ln.length - 1);
    let x = cx - total / 2; const yy = y + li * size * 1.22;
    ln.forEach((w, wi) => {
      const idx = k++, p = clamp(n - idx); if (p <= 0) { x += ws[wi] + sp; return; }
      const act = (idx === Math.floor(n - 1e-6) && n < flat.length + .0) ? 1 : 0; const pop = 1 + .35 * (1 - eoBack(clamp(p * 1.0))) * -1 * 0 + (p < 1 ? (1 - p) * .35 : 0);
      const isHL = hlIdx === idx || (o.hlLast && idx === Math.floor(n - 1e-6));
      c.save(); c.translate(x + ws[wi] / 2, yy - size * .32); c.scale(pop, pop); c.globalAlpha = clamp(p * 3);
      c.font = `900 ${size}px Inter`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
      c.lineWidth = size * .15; c.strokeStyle = 'rgba(3,8,22,.92)'; c.strokeText(w, 0, size * .32);
      c.fillStyle = isHL ? C.goldL : '#fff'; c.fillText(w, 0, size * .32); c.restore();
      x += ws[wi] + sp;
    });
  });
}

/* ---------- phone (9:16) ---------- */
const PH_CACHE = {};
function phoneBase(w, h, v, cx) {
  const key = [w, h, v, cx].join('_'); if (PH_CACHE[key]) return PH_CACHE[key];
  const c0 = mk(w, h), c = c0.getContext('2d');
  rr(c, 0, 0, w, h, w * .13); c.fillStyle = lg(c, 0, 0, w, h, [[0, '#39446a'], [.5, '#0d1324'], [1, '#222c4a']]); c.fill();
  const m = w * .03, sw = w - 2 * m, sh = h - 2 * m;
  c.save(); rr(c, m, m, sw, sh, w * .105); c.clip();
  const cw = 720 * sw / sh; c.drawImage(FR[v], cx - cw / 2, 0, cw, 720, m, m, sw, sh);
  c.fillStyle = lg(c, 0, m + sh * .5, 0, m + sh, [[0, 'rgba(2,6,18,0)'], [1, 'rgba(2,6,18,.82)']]); c.fillRect(m, m, sw, sh);
  c.fillStyle = lg(c, 0, m, 0, m + sh * .16, [[0, 'rgba(2,6,18,.6)'], [1, 'rgba(2,6,18,0)']]); c.fillRect(m, m, sw, sh * .2);
  c.restore();
  // side icons
  const ix = w - m - w * .1; ['heart', 'comment', 'share'].forEach((n, i) => icon(c, n, ix, m + sh * (.52 + i * .1), w * .09, 'rgba(255,255,255,.9)'));
  // bottom handle
  c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(m + w * .07, m + sh * .945, w * .035, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.7)'; rr(c, m + w * .13, m + sh * .93, w * .26, h * .008, 3); c.fill();
  c.fillStyle = 'rgba(255,255,255,.4)'; rr(c, m + w * .13, m + sh * .955, w * .4, h * .006, 3); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 2; rr(c, m, m, sw, sh, w * .105); c.stroke();
  return PH_CACHE[key] = c0;
}
const CAP_LINES = [['YOUR', 'BEST', 'IDEAS'], ['DESERVE', 'TO'], ['BE', 'HEARD']];
const CAP_LINES2 = [['ONE', 'RECORDING.'], ['MANY', 'FORMATS.']];
function phone(w, h, o = {}) {
  const v = o.v || 0, c0 = mk(w, h), c = c0.getContext('2d');
  c.drawImage(phoneBase(w, h, v, o.cx || 870), 0, 0);
  const m = w * .03, sh = h - 2 * m;
  // progress segments
  c.fillStyle = 'rgba(255,255,255,.28)'; rr(c, m + w * .06, m + sh * .03, w - 2 * m - w * .12, 5, 3); c.fill();
  c.fillStyle = C.goldL; rr(c, m + w * .06, m + sh * .03, (w - 2 * m - w * .12) * (o.prog == null ? .35 : o.prog), 5, 3); c.fill();
  if (o.cap != null && o.cap > 0) {
    const L = o.lines || CAP_LINES, size = (o.capSize || w * .082);
    capWords(c, w / 2 - w * .05, m + sh * .62, L, o.cap, size, { hl: o.hl == null ? 6 : o.hl });
  }
  if (o.badge) { rr(c, m + w * .06, m + sh * .07, w * .27, w * .075, w * .02); c.fillStyle = 'rgba(214,173,69,.95)'; c.fill(); T(c, o.badge, m + w * .06 + w * .135, m + sh * .07 + w * .052, { size: w * .04, w: 900, col: C.navy1, al: 'center', ls: .05 }); }
  return c0;
}

/* ---------- podcast cover / thumbnail / audiogram / social ---------- */
function bars(c, x, y, w, h, n, t, col, o = {}) {
  const bw = w / n; c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const a = o.static ? SPEECH[(i * 3 + (o.off || 0)) % 5000] : (.25 + .75 * (.5 + .5 * Math.sin(t * (o.sp || 6) + i * .55 + vnoise(i * .3) * 6)) * (.45 + .55 * vnoise(i * .21 + t * 1.2)));
    const bh = Math.max(3, a * h); rr(c, x + i * bw + bw * .18, y - bh / 2, bw * .64, bh, bw * .3); c.fill();
  }
}
function podcastCover(s, o = {}) {
  const c0 = mk(s, s), c = c0.getContext('2d'), t = o.t || 0;
  rr(c, 0, 0, s, s, s * .06); c.fillStyle = lg(c, 0, 0, s, s, [[0, C.navy3], [.55, C.navy1], [1, C.navy0]]); c.fill();
  c.save(); rr(c, 0, 0, s, s, s * .06); c.clip();
  c.strokeStyle = 'rgba(214,173,69,.28)'; c.lineWidth = s * .006; [.5, .72, .96].forEach(r => { c.beginPath(); c.arc(s * .88, s * .12, s * r, 0, 7); c.stroke(); });
  T(c, 'FOUNDER TALKS', s * .08, s * .14, { size: s * .052, w: 800, col: C.blue, ls: .22 });
  T(c, 'EP.', s * .07, s * .55, { size: s * .2, w: 900, col: '#fff' });
  c.save(); c.fillStyle = goldGrad(c, 0, s * .3, 0, s * .6); c.font = `900 ${s * .36}px Inter`; c.letterSpacing = '0px'; c.fillText('12', s * .08 + tw(c, 'EP.', s * .2, 900) * .0 + s * .32, s * .55); c.restore();
  bars(c, s * .08, s * .76, s * .84, s * .16, 36, t, C.gold, { sp: 5 });
  T(c, 'THE STUDIO SESSIONS', s * .08, s * .93, { size: s * .04, w: 700, col: C.mute, ls: .2 });
  c.restore(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; rr(c, 1, 1, s - 2, s - 2, s * .06); c.stroke();
  return c0;
}
function thumbCard(w, h) {
  const c0 = mk(w, h), c = c0.getContext('2d');
  rr(c, 0, 0, w, h, w * .03); c.clip();
  c.drawImage(FR[0], 330, 0, 950, 535 * 1, 0, 0, w, h * 1.0); // guest side
  c.fillStyle = lg(c, 0, 0, w, 0, [[0, 'rgba(3,10,27,.92)'], [.55, 'rgba(3,10,27,.45)'], [1, 'rgba(3,10,27,0)']]); c.fillRect(0, 0, w, h);
  T(c, 'MAKE IT', w * .06, h * .43, { size: h * .21, w: 900, col: '#fff' });
  c.save(); c.fillStyle = goldGrad(c, 0, h * .5, 0, h * .8); c.font = `900 ${h * .25}px Inter`; c.fillText('STICK.', w * .06, h * .72); c.restore();
  rr(c, w - w * .15, h - h * .17, w * .13, h * .11, 5); c.fillStyle = 'rgba(0,0,0,.78)'; c.fill(); T(c, '38:12', w - w * .085, h - h * .095, { size: h * .06, w: 800, col: '#fff', al: 'center' });
  return c0;
}
function audiogram(s, o = {}) {
  const t = o.t || 0, c0 = mk(s, s), c = c0.getContext('2d');
  rr(c, 0, 0, s, s, s * .06); c.fillStyle = lg(c, 0, 0, s, s, [[0, '#14357a'], [1, C.navy0]]); c.fill();
  c.save(); rr(c, 0, 0, s, s, s * .06); c.clip();
  glow(s * .5, s * .45, s * .6, 'rgba(214,173,69,A)', .22);
  const pc = podcastCover(s * .2); c.drawImage(pc, s * .07, s * .07);
  T(c, 'EPISODE 12', s * .31, s * .13, { size: s * .045, w: 800, col: '#fff', ls: .15 }); T(c, 'AUDIOGRAM', s * .31, s * .185, { size: s * .037, w: 700, col: C.gold, ls: .2 });
  bars(c, s * .07, s * .47, s * .86, s * .3, 34, t, C.goldL, { sp: 7 });
  c.fillStyle = 'rgba(255,255,255,.16)'; rr(c, s * .07, s * .68, s * .86, 5, 3); c.fill(); c.fillStyle = C.gold; rr(c, s * .07, s * .68, s * .86 * .42, 5, 3); c.fill();
  T(c, '“Your best ideas', s * .07, s * .79, { size: s * .075, w: 900, col: '#fff' }); T(c, 'deserve to be heard.”', s * .07, s * .88, { size: s * .075, w: 900, col: C.goldL });
  c.restore(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; rr(c, 1, 1, s - 2, s - 2, s * .06); c.stroke();
  return c0;
}
function socialCard(w, h, o = {}) {
  const c0 = mk(w, h), c = c0.getContext('2d');
  rr(c, 0, 0, w, h, w * .05); c.fillStyle = '#f3f6fc'; c.fill(); c.save(); rr(c, 0, 0, w, h, w * .05); c.clip();
  const p = w * .05;
  c.fillStyle = C.navy2; c.beginPath(); c.arc(p + w * .06, p + w * .06, w * .06, 0, 7); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
  T(c, 'PV', p + w * .06, p + w * .082, { size: w * .05, w: 900, col: C.goldL, al: 'center' });
  c.fillStyle = '#1b2336'; rr(c, p + w * .15, p + w * .035, w * .3, w * .026, 5); c.fill(); c.fillStyle = '#aab4c8'; rr(c, p + w * .15, p + w * .08, w * .2, w * .02, 5); c.fill();
  const iy = p + w * .15, ih = h * .56, iw = w - 2 * p; c.save(); rr(c, p, iy, iw, ih, w * .03); c.clip();
  const cw = 720 * iw / ih; c.drawImage(FR[0], 870 - cw / 2, 0, cw, 720, p, iy, iw, ih);
  c.fillStyle = lg(c, 0, iy + ih * .5, 0, iy + ih, [[0, 'rgba(2,6,18,0)'], [1, 'rgba(2,6,18,.85)']]); c.fillRect(p, iy, iw, ih);
  capWords(c, w / 2, iy + ih * .68, CAP_LINES, 99, w * .07, { hl: 6 }); c.restore();
  const ay = iy + ih + w * .07; ['heart', 'comment', 'share'].forEach((n, i) => icon(c, n, p + w * .045 + i * w * .1, ay, w * .075, '#1b2336'));
  c.fillStyle = '#1b2336'; rr(c, p, ay + w * .08, w * .55, w * .024, 5); c.fill(); c.fillStyle = '#b8c1d4'; rr(c, p, ay + w * .12, w * .75, w * .02, 5); c.fill(); rr(c, p, ay + w * .155, w * .45, w * .02, 5); c.fill();
  c.restore();
  return c0;
}

/* ---------- NLE (editing timeline interface) ---------- */
const V2CLIPS = (() => { const a = []; let t = 14; for (let i = 0; i < 60; i++) { const d = 25 + hash(i * 3.3) * 80; a.push([t, t + d]); t += d + 20 + hash(i * 1.9) * 120; } return a; })();
const V2COARSE = (() => { const a = []; let t = 40; for (let i = 0; i < 30; i++) { const d = 70 + hash(i * 3.3) * 160; a.push([t, t + d]); t += d + 50 + hash(i * 1.9) * 200; } return a; })();
const HLMARKS = (() => { const a = []; for (let i = 0; i < 40; i++) a.push(20 + i * 70 + hash(i * 5.5) * 50); return a; })();
function thumbMini(c, x, y, w, h, i) {
  i = Math.abs(Math.floor(i));
  const gx = c.createLinearGradient(x, y, x + w, y + h); gx.addColorStop(0, ['#2a4f94', '#335aa3', '#244884'][i % 3]); gx.addColorStop(1, '#0c1a3a');
  c.fillStyle = gx; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(8,14,30,.85)'; c.beginPath(); c.ellipse(x + w * (.32 + (i % 2) * .05), y + h * .46, w * .08, h * .18, 0, 0, 7); c.fill(); c.fillRect(x + w * .2, y + h * .62, w * .24, h * .4);
  c.beginPath(); c.ellipse(x + w * .72, y + h * .46, w * .08, h * .18, 0, 0, 7); c.fill(); c.fillRect(x + w * .6, y + h * .62, w * .24, h * .4);
}
function drawNLE(c, w, h, o = {}) {
  const u = w / 1000, hdr = 96 * u, t = o.t || 0;
  const pps = (o.pps || 35), t0 = o.t0 || 0, X = s => hdr + (s - t0) * pps * u, top = 128 * u, bot = h - 26 * u;
  rr(c, 0, 0, w, h, 18 * u); c.fillStyle = C.char; c.fill();
  c.save(); rr(c, 0, 0, w, h, 18 * u); c.clip();
  // title bar
  c.fillStyle = '#0c111e'; c.fillRect(0, 0, w, 48 * u);
  [0, 1, 2].forEach(i => { c.fillStyle = ['#ff6058', '#ffbd2e', '#27c93f'][i] + '99'; c.beginPath(); c.arc((28 + i * 24) * u, 24 * u, 7 * u, 0, 7); c.fill(); });
  T(c, o.title || 'Interview_Ep12_RAW.mov  —  Sequence 01', w / 2, 31 * u, { size: 17 * u, w: 600, col: C.mute, al: 'center' });
  T(c, o.tc || fmtTC((o.ph == null ? 0 : o.ph)), w - 22 * u, 32 * u, { size: 19 * u, w: 800, col: C.gold, al: 'right', ls: .03 });
  // toolbar
  c.fillStyle = '#0f1627'; c.fillRect(0, 48 * u, w, 44 * u);
  ['sel', 'razor', 'hand', 'zoom'].forEach((n, i) => {
    const x = (36 + i * 52) * u, y = 70 * u; const act = (o.tool || 'sel') === n;
    if (act) { rr(c, x - 19 * u, y - 17 * u, 38 * u, 34 * u, 7 * u); c.fillStyle = 'rgba(214,173,69,.22)'; c.fill(); }
    c.strokeStyle = act ? C.goldL : C.mute; c.fillStyle = act ? C.goldL : C.mute; c.lineWidth = 2.4 * u; c.lineCap = 'round';
    if (n === 'sel') { c.beginPath(); c.moveTo(x - 6 * u, y - 9 * u); c.lineTo(x + 8 * u, y + 2 * u); c.lineTo(x + 1 * u, y + 3 * u); c.lineTo(x - 2 * u, y + 10 * u); c.closePath(); c.stroke(); }
    if (n === 'razor') { c.beginPath(); c.moveTo(x, y - 11 * u); c.lineTo(x, y + 11 * u); c.stroke(); c.beginPath(); c.moveTo(x - 9 * u, y - 5 * u); c.lineTo(x - 3 * u, y - 5 * u); c.moveTo(x + 3 * u, y + 5 * u); c.lineTo(x + 9 * u, y + 5 * u); c.stroke(); }
    if (n === 'hand') { rr(c, x - 7 * u, y - 4 * u, 14 * u, 14 * u, 4 * u); c.stroke(); c.beginPath(); c.moveTo(x - 4 * u, y - 4 * u); c.lineTo(x - 4 * u, y - 11 * u); c.moveTo(x, y - 4 * u); c.lineTo(x, y - 13 * u); c.moveTo(x + 4 * u, y - 4 * u); c.lineTo(x + 4 * u, y - 11 * u); c.stroke(); }
    if (n === 'zoom') { c.beginPath(); c.arc(x - 2 * u, y - 2 * u, 8 * u, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x + 4 * u, y + 4 * u); c.lineTo(x + 10 * u, y + 10 * u); c.stroke(); }
  });
  T(c, o.seq || 'SNAP  ·  RIPPLE  ·  LINK', w - 22 * u, 76 * u, { size: 13 * u, w: 700, col: '#55617f', al: 'right', ls: .12 });
  // ruler
  c.fillStyle = '#0b101c'; c.fillRect(0, 92 * u, w, 36 * u);
  const ticks = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600]; let maj = 600; for (const v of ticks) if (v * pps * u >= 120 * u) { maj = v; break; }
  const sMin = t0 + (0 - hdr) / (pps * u), sMax = t0 + (w - hdr) / (pps * u);
  for (let s = Math.floor(sMin / (maj / 5)) * (maj / 5); s < sMax; s += maj / 5) {
    const x = X(s); if (x < hdr) continue; const isM = Math.abs(s / maj - Math.round(s / maj)) < 1e-6;
    c.fillStyle = isM ? '#6f7c9b' : '#3b4663'; c.fillRect(x, isM ? 110 * u : 118 * u, 1.5 * u, isM ? 18 * u : 10 * u);
    if (isM) T(c, o.tcLabels ? fmtTC(s) : fmtMS(s), x + 5 * u, 106 * u, { size: 12.5 * u, w: 600, col: '#7f8cab' });
  }
  // rows
  const rows = o.rows || [{ k: 'v2', label: 'V2', wt: .8, p: 1 }, { k: 'v1', label: 'V1', wt: 1.5, p: 1 }, { k: 'a1', label: 'A1', wt: 1, p: 1 }, { k: 'a2', label: 'A2', wt: 1, p: 1 }];
  const tot = rows.reduce((a, r) => a + r.wt * r.p, 0) || 1, gap = 5 * u; let y = top; const rpos = [];
  rows.forEach(r => {
    const rh = (bot - top - gap * rows.length) * r.wt * r.p / tot; if (rh < 2) return; rpos.push({ r, y, h: rh });
    c.fillStyle = '#10172a'; c.fillRect(0, y, w, rh);
    c.fillStyle = '#0c1220'; c.fillRect(0, y, hdr, rh);
    if (rh > 22 * u) { T(c, r.label, 14 * u, y + rh / 2 + 5 * u, { size: 15 * u, w: 800, col: r.hl ? C.goldL : '#8a97b5', ls: .05, a: clamp(r.p * 1.6) }); [0, 1].forEach(i => { c.fillStyle = '#2a3552'; c.beginPath(); c.arc(hdr - 36 * u + i * 16 * u, y + rh / 2, 4.2 * u, 0, 7); c.fill(); }); }
    y += rh + gap;
  });
  const x0 = hdr, wlim = w;
  rpos.forEach(({ r, y, h: rh }) => {
    if (rh - 8 * u < 6) return;
    c.save(); c.beginPath(); c.rect(hdr, y, w - hdr, rh); c.clip(); c.globalAlpha = clamp(r.p * 1.4);
    const pad = 4 * u, ch = rh - pad * 2, k = r.k;
    if (k === 'v2') {
      (pps < 1 ? V2COARSE : V2CLIPS).forEach(([a, b]) => { const xa = X(a), xb = X(b); if (xb < hdr || xa > w) return; rr(c, xa, y + pad, xb - xa, ch, 5 * u); c.fillStyle = lg(c, 0, y, 0, y + rh, [[0, '#3b6aa8'], [1, '#27497a']]); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(xa + 6 * u, y + pad + 5 * u, Math.min(40 * u, xb - xa - 12 * u), 3 * u); });
    }
    if (k === 'v1') {
      const cuts = o.cuts || [], end = o.end == null ? 2852 : o.end;
      const segs = []; let sa = 0; cuts.forEach(s => { segs.push([sa, s.s]); sa = s.s; }); segs.push([sa, end]);
      segs.forEach(([a, b], si) => {
        let xa = X(a) + (si > 0 ? (cuts[si - 1].gap || 0) * u : 0), xb = X(b) - (si < cuts.length ? (cuts[si].gap || 0) * u : 0);
        let lift = 0; const mid = o.sel && cuts.length >= 2 && si === 1; if (mid) lift = (o.lift || 0) * u;
        c.save(); c.translate(0, -lift); rr(c, xa, y + pad, xb - xa, ch, 6 * u); c.save(); c.clip();
        c.fillStyle = lg(c, 0, y, 0, y + rh, [[0, '#24478c'], [1, '#13285a']]); c.fillRect(xa, y, xb - xa, rh);
        const fw = ch * 1.78; for (let fx = Math.max(xa, hdr - fw); fx < Math.min(xb, w); fx += fw) thumbMini(c, fx, y + pad + ch * .0, Math.min(fw, xb - fx), ch, Math.floor((fx - xa) / fw));
        c.fillStyle = 'rgba(8,14,34,.52)'; c.fillRect(xa, y + pad, xb - xa, 22 * u);
        T(c, 'Interview_Ep12_RAW.mov', Math.max(xa, hdr) + 10 * u, y + pad + 16 * u, { size: 13 * u, w: 700, col: '#dfe8fa' });
        c.restore(); c.lineWidth = (mid ? 3 : 1.6) * u; c.strokeStyle = mid ? C.goldL : '#4a72bd'; rr(c, xa, y + pad, xb - xa, ch, 6 * u); c.stroke();
        if (mid) { c.shadowColor = 'rgba(214,173,69,.8)'; c.shadowBlur = 24 * u; c.stroke(); }
        c.restore();
      });
    }
    if (k === 'a1' || k === 'a2' || k === 'fx') {
      c.fillStyle = k === 'a2' ? '#1c2438' : '#16213a'; rr(c, hdr + 2 * u, y + pad, w - hdr - 4 * u, ch, 5 * u); c.fill();
      const col = k === 'a2' ? '#caa650' : (k === 'fx' ? '#d9bb6a' : '#8db0ea'), step = 3.4 * u; c.fillStyle = col;
      const off = k === 'a2' ? 777 : (k === 'fx' ? 333 : 0);
      for (let x = hdr + 4 * u, i = 0; x < w - 4 * u; x += step, i++) {
        const idx = Math.floor(((x - hdr) / u + t0 * pps) / 3.4) + off; const a = SPEECH[((idx % 5900) + 5900) % 5900] * (o.a_amp == null ? 1 : o.a_amp);
        const bh = Math.max(2 * u, a * (ch - 6 * u)); c.fillRect(x, y + pad + ch / 2 - bh / 2, step * .62, bh);
      }
    }
    if (k === 'cc') {
      const m = pps < 1 ? 22 : 1; for (let a = 8, i = 0; a < sMax + 50; a += (7 + hash(i * 3.1) * 8) * m, i++) { const d = (4 + hash(i * 1.7) * 6) * m, xa = X(a), xb = X(a + d); if (xb < hdr || xa > w) continue; rr(c, xa, y + pad, Math.max(6, xb - xa - 2 * u), ch, 4 * u); c.fillStyle = '#2d3b60'; c.fill(); c.fillStyle = C.gold; c.fillRect(xa + 2 * u, y + pad, Math.max(4, xb - xa - 6 * u), 3 * u); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(xa + 6 * u, y + pad + ch / 2 - 1 * u, Math.max(4, (xb - xa) * .55), 3 * u); }
    }
    if (k === 'hl') {
      HLMARKS.forEach(s0 => { const s = pps < 1 ? s0 * 6 : s0; const x = X(s); if (x < hdr - 20 || x > w) return; c.fillStyle = C.gold; c.beginPath(); c.moveTo(x, y + pad); c.lineTo(x + 11 * u, y + pad + ch * .5); c.lineTo(x, y + pad + ch); c.lineTo(x - 2 * u, y + pad + ch); c.lineTo(x - 2 * u, y + pad); c.closePath(); c.fill(); c.fillStyle = 'rgba(214,173,69,.18)'; c.fillRect(x, y + pad + ch * .35, 70 * u, ch * .3); });
    }
    if (k === 'th') {
      const tw2 = ch * 1.78 + 6 * u; for (let x = hdr + 8 * u, i = 0; x < w; x += tw2 + 12 * u, i++) { rr(c, x, y + pad, tw2, ch, 4 * u); c.save(); c.clip(); thumbMini(c, x, y + pad, tw2, ch, i); c.restore(); c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1.5 * u; rr(c, x, y + pad, tw2, ch, 4 * u); c.stroke(); }
    }
    if (k === 'sc') {
      const sw2 = ch * .5625; for (let x = hdr + 16 * u, i = 0; x < w; x += sw2 + 30 * u, i++) { rr(c, x, y + pad, sw2, ch, 4 * u); c.save(); c.clip(); c.fillStyle = lg(c, 0, y, 0, y + rh, [[0, '#2f5fb0'], [1, '#12285a']]); c.fillRect(x, y, sw2, rh); c.fillStyle = C.goldL; c.fillRect(x + sw2 * .15, y + rh * .72, sw2 * .7, 3 * u); c.restore(); c.strokeStyle = 'rgba(214,173,69,.7)'; c.lineWidth = 1.5 * u; rr(c, x, y + pad, sw2, ch, 4 * u); c.stroke(); }
    }
    c.restore();
  });
  // selection
  if (o.sel && o.sel.p > 0) {
    const xa = X(o.sel.a), xb = xa + (X(o.sel.b) - xa) * o.sel.p;
    c.fillStyle = 'rgba(214,173,69,.22)'; c.fillRect(xa, 92 * u, xb - xa, bot - 92 * u);
    c.fillStyle = C.goldL; c.fillRect(xa - 1.5 * u, 92 * u, 3 * u, bot - 92 * u); c.fillRect(xb - 1.5 * u, 92 * u, 3 * u, bot - 92 * u);
    c.fillStyle = C.gold; rr(c, xa - 4 * u, 92 * u, 22 * u, 18 * u, 3 * u); c.fill(); rr(c, xb - 18 * u, 92 * u, 22 * u, 18 * u, 3 * u); c.fill();
    if (o.sel.p > .6) { const al = clamp((o.sel.p - .6) * 4); T(c, 'IN', xa + 9 * u, 106 * u, { size: 11 * u, w: 900, col: C.navy1, al: 'center', a: al }); T(c, 'OUT', xb - 7 * u, 106 * u, { size: 11 * u, w: 900, col: C.navy1, al: 'center', a: al }); }
  }
  // razor flashes
  (o.razor || []).forEach(rz => {
    if (rz.p <= 0 || rz.p >= 1) return; const x = X(rz.s), a = 1 - rz.p;
    c.save(); c.globalAlpha = a; c.fillStyle = '#fff'; c.fillRect(x - 2 * u, top - 10 * u, 4 * u, bot - top + 20 * u); c.shadowColor = '#fff'; c.shadowBlur = 30 * u; c.fillRect(x - 1 * u, top, 2 * u, bot - top);
    for (let i = 0; i < 10; i++) { const ang = hash(i * 3.3 + rz.s) * 6.28, d = rz.p * (40 + hash(i * 5.1) * 90) * u; c.fillStyle = C.goldL; c.fillRect(x + Math.cos(ang) * d * .6, top + (bot - top) * (.3 + .4 * hash(i * 2.2)) + Math.sin(ang) * d, 4 * u, 4 * u); }
    c.restore();
  });
  // playhead
  if (o.ph != null) {
    const x = X(o.ph); if (x > hdr - 2 && x < w) {
      c.save(); c.shadowColor = 'rgba(214,173,69,.8)'; c.shadowBlur = 16 * u; c.fillStyle = C.goldL; c.fillRect(x - 1.5 * u, 92 * u, 3 * u, bot - 92 * u);
      c.beginPath(); c.moveTo(x - 10 * u, 92 * u); c.lineTo(x + 10 * u, 92 * u); c.lineTo(x + 10 * u, 108 * u); c.lineTo(x, 120 * u); c.lineTo(x - 10 * u, 108 * u); c.closePath(); c.fill(); c.restore();
    }
  }
  // bottom status bar
  c.fillStyle = '#0a0f1b'; c.fillRect(0, bot + 0, w, h - bot);
  T(c, o.status || 'RENDER READY  ·  30 FPS  ·  1080×1920', 18 * u, h - 8 * u, { size: 11 * u, w: 700, col: '#55617f', ls: .12 });
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; rr(c, 1, 1, w - 2, h - 2, 18 * u); c.stroke();
}
