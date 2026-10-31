/* ProVirtual PH — Reel #7: scenes, transitions, compositor */
const TR = { t1: [2.55, 3.2], t2: [6.6, 7.2], t3: [13.7, 14.3], t4: [18.7, 19.35], t5: [21.8, 22.3] };
const P3 = (img, X, Y, o, opt) => plane(img, Object.assign({}, o, { x: X - W / 2, y: Y - H / 2 }), opt);

/* ---------- shared type helpers ---------- */
function goldFill(c, x, y, w, h) { return goldGrad(c, x, y, x + w, y + h); }
function bigText(txt, cx, base, size, o = {}) {
  // o: col ('white'|'gold'), p (reveal 0..1), mode 'slam'|'wipe'|'rise', w, ls, a
  const p = o.p == null ? 1 : o.p; if (p <= 0) return;
  const wt = o.w || 900, ls = o.ls || 0, wd = tw(ctx, txt, size, wt, ls);
  ctx.save(); ctx.font = `${wt} ${size}px Inter`; ctx.letterSpacing = (ls * size) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const mode = o.mode || 'slam';
  let sc = 1, dy = 0, al = (o.a == null ? 1 : o.a);
  if (mode === 'slam') { const e = eo5(p); sc = lerp(1.45, 1, e); dy = (1 - e) * -22; al *= clamp(p * 5); }
  if (mode === 'rise') { const e = eo5(p); dy = (1 - e) * 50; al *= clamp(p * 3); }
  ctx.globalAlpha *= al; ctx.translate(cx, base + dy - size * .35); ctx.scale(sc, sc); ctx.translate(-cx, -(base - size * .35));
  if (mode === 'wipe') { const e = eio3(p); ctx.beginPath(); ctx.rect(cx - wd / 2 - 30, base - size * 1.1, (wd + 60) * e, size * 1.4); ctx.clip(); }
  if (o.col === 'gold') ctx.fillStyle = goldFill(ctx, cx - wd / 2, base - size, wd, size); else ctx.fillStyle = o.col || '#fff';
  if (o.shadow !== false) { ctx.shadowColor = o.col === 'gold' ? 'rgba(214,173,69,.45)' : 'rgba(0,0,0,.5)'; ctx.shadowBlur = size * .25; ctx.shadowOffsetY = size * .04; }
  ctx.fillText(txt, cx, base);
  if (mode === 'wipe' && p < 1) { // light edge, only on the glyphs
    const e = eio3(p), x = cx - wd / 2 - 30 + (wd + 60) * e; const g = ctx.createLinearGradient(x - 110, 0, x + 6, 0);
    g.addColorStop(0, 'rgba(255,240,190,0)'); g.addColorStop(1, 'rgba(255,240,190,.95)'); ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillText(txt, cx, base);
  }
  ctx.restore();
}
// heading that slams in, holds, exits upward
function head(word, t, t0, t1, base, col, maxSize = 300, width = 880) {
  if (t < t0 || t > t1 + .3) return;
  const size = fit(ctx, word, width, 900, 0, maxSize), pin = seg(t, t0, t0 + .28), pout = seg(t, t1, t1 + .25);
  ctx.save(); ctx.translate(0, -pout * 60); bigText(word, W / 2, base, size, { col, p: pin, a: 1 - pout }); ctx.restore();
}
function pill(txt, cx, cy, size, o = {}) {
  const wd = tw(ctx, txt, size, 800, .06) + size * 1.6, h = size * 1.9, a = o.a == null ? 1 : o.a;
  ctx.save(); ctx.globalAlpha *= a; rr(ctx, cx - wd / 2, cy - h / 2, wd, h, h / 2);
  ctx.fillStyle = o.fill || goldFill(ctx, cx - wd / 2, cy - h / 2, wd, h); ctx.shadowColor = 'rgba(214,173,69,.45)'; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0;
  T(ctx, txt, cx, cy + size * .36, { size, w: 800, col: o.col || C.navy1, al: 'center', ls: .06 }); ctx.restore();
}
function flash(p, col = '247,220,134', max = .85) { // 0..1 → bell
  const a = Math.sin(clamp(p) * Math.PI) * max; if (a <= 0) return;
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 1300); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function goldBar(x, w, a = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, 'rgba(214,173,69,0)'); g.addColorStop(.5, 'rgba(255,236,170,.95)'); g.addColorStop(1, 'rgba(214,173,69,0)');
  ctx.transform(1, 0, -.25, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(x - w, -100, w * 2, H + 200); ctx.restore();
}

/* ============================================================
   SCENE 1 — HOOK (0–3 s)
   ============================================================ */
const S1_ROWS = ['v2', 'v1', 'a1', 'a2', 'v2', 'v1', 'a1', 'a2', 'fx', 'cc', 'hl', 'th'].map((k, i) => ({ k, label: (k[0] === 'v' ? 'V' : k[0] === 'a' ? 'A' : k.toUpperCase()) + (i % 4 + 1), wt: k === 'v1' ? 1.4 : (k === 'cc' || k === 'hl' ? .5 : 1), p: 1 }));
let NLE1 = null;
function s1(t, ov) {
  if (!ov) bg(t);
  const p = clamp(t / 3.1), pz = Math.pow(p, 1.7);
  if (!NLE1) NLE1 = mk(1800, 2300);
  const c = NLE1.getContext('2d'); c.clearRect(0, 0, 1800, 2300);
  const ph = 40 + t * 150;
  drawNLE(c, 1800, 2300, { rows: S1_ROWS, pps: 16, t0: 30 + t * 38, ph, t, tcLabels: true, tc: fmtTC(ph * 1.0), title: 'Interview_Ep12_RAW.mov  —  47:32', status: 'SOURCE  ·  47:32  ·  1080p  ·  48 kHz', sel: { a: ph - 70, b: ph + 20, p: 1 } });
  const z = lerp(330, -860, pz), ry = lerp(-27, -5, eo3(p)), rx = lerp(21, 5, eo3(p)), rz = lerp(-6, 0, p);
  P3(NLE1, W / 2 + lerp(-90, 0, p), H / 2 + lerp(120, -20, p), { z, ry, rx, rz, s: 1 }, { nx: 10, ny: 12, shadow: 80 });
  // vignette scrim for type legibility
  const sa = .35 + .5 * seg(t, 0, .5);
  const g = ctx.createRadialGradient(W / 2, 900, 80, W / 2, 900, 900); g.addColorStop(0, `rgba(3,10,27,${sa})`); g.addColorStop(1, 'rgba(3,10,27,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  scrim(0, 360, .6, 0); scrim(1500, H, 0, .6);
  // speed-lines flash at start
  if (t < .35) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const y = hash(i * 3.7) * H, a = (1 - t / .35) * .35; ctx.fillStyle = `rgba(247,220,134,${a})`; ctx.fillRect(0, y, W, 2 + hash(i) * 4); } ctx.restore(); }
  // type
  const sW = fit(ctx, 'RECORDING.', 900, 900), sG = fit(ctx, 'CONTENT.', 900, 900);
  const y1 = 690, y2 = y1 + sW * .98, y3 = y2 + sG * 1.2, y4 = y3 + sG * .98;
  const drift = 1 + t * .008; ctx.save(); ctx.translate(W / 2, 900); ctx.scale(drift, drift); ctx.translate(-W / 2, -900);
  bigText('ONE', W / 2, y1, sW, { p: seg(t, 0, .3), mode: 'slam' });
  bigText('RECORDING.', W / 2, y2, sW, { p: seg(t, .1, .42), mode: 'slam' });
  bigText('MORE', W / 2, y3, sG, { col: 'gold', p: seg(t, 1.2, 1.75), mode: 'wipe' });
  bigText('CONTENT.', W / 2, y4, sG, { col: 'gold', p: seg(t, 1.4, 2.0), mode: 'wipe' });
  // gold rule
  const rp = eo3(seg(t, 1.9, 2.4)); if (rp > 0) { ctx.fillStyle = goldFill(ctx, 90, 0, 900, 0); ctx.fillRect(W / 2 - 450 * rp, y4 + 46, 900 * rp, 5); }
  ctx.restore();
  flash(seg(t, 1.2, 1.9), '247,220,134', .28);
}

/* ============================================================
   SCENE 2 — THE CONTENT CHALLENGE (3–7 s)
   ============================================================ */
const CHIPS = [
  { k: 'trim', label: 'TRIM', x: 172, y: 520, at: 3.45 }, { k: 'cc', label: 'CAPTIONS', x: 906, y: 640, at: 3.8 },
  { k: 'star', label: 'HIGHLIGHTS', x: 172, y: 790, at: 4.15 }, { k: 'audio', label: 'AUDIO', x: 906, y: 920, at: 4.5 },
  { k: 'thumb', label: 'THUMBNAILS', x: 172, y: 1050, at: 4.85 }, { k: 'social', label: 'SOCIAL CLIPS', x: 906, y: 1190, at: 5.2 },
];
let NLE2 = null;
function chipImg(ch, a) {
  const w = 316, h = 92, c0 = mk(w, h), c = c0.getContext('2d');
  rr(c, 2, 2, w - 4, h - 4, 46); c.fillStyle = lg(c, 0, 0, 0, h, [[0, '#22345e'], [1, '#0d1832']]); c.fill();
  c.lineWidth = 2.5; c.strokeStyle = goldGrad(c, 0, 0, w, h); c.stroke();
  c.fillStyle = 'rgba(214,173,69,.14)'; c.beginPath(); c.arc(50, h / 2, 31, 0, 7); c.fill();
  icon(c, ch.k, 50, h / 2, 36, C.goldL);
  T(c, ch.label, 94, h / 2 + 11, { size: ch.label.length > 10 ? 25 : ch.label.length > 8 ? 27 : 30, w: 800, col: '#fff', ls: .03 });
  return c0;
}
function s2(t, ov) {
  if (!ov) bg(t);
  const u = t - 3, p = clamp(u / 4);
  // timeline rows reveal as chips land
  const pr = i => eo3(seg(t, CHIPS[i].at + .15, CHIPS[i].at + .75));
  const rows = [{ k: 'v2', label: 'V2', wt: .8, p: 1 }, { k: 'v1', label: 'V1', wt: 1.6, p: 1 }, { k: 'a1', label: 'A1', wt: 1, p: 1 }, { k: 'a2', label: 'A2', wt: 1, p: 1 },
    { k: 'cc', label: 'CC', wt: .55, p: pr(1) }, { k: 'hl', label: 'HL', wt: .5, p: pr(2) }, { k: 'fx', label: 'A3', wt: .8, p: pr(3), hl: 1 }, { k: 'th', label: 'TH', wt: .8, p: pr(4) }, { k: 'sc', label: 'SC', wt: .9, p: pr(5) }];
  const tp = pr(0), cuts = [300, 620, 910, 1500, 1900, 2300].map(s => ({ s, gap: 9 * tp }));
  if (!NLE2) NLE2 = mk(1000, 900); const c = NLE2.getContext('2d'); c.clearRect(0, 0, 1000, 900);
  drawNLE(c, 1000, 900, { rows, pps: .3, t0: 0, ph: 120 + u * 260, t, cuts: tp > .01 ? cuts : [], tc: fmtTC(120 + u * 260), title: 'Interview_Ep12_RAW.mov  —  47:32', tool: tp > .01 ? 'razor' : 'sel' });
  const enter = eo5(seg(t, 2.6, 3.4));
  P3(NLE2, W / 2, lerp(900, 800, enter), { z: lerp(240, 40, enter) - u * 18, ry: lerp(-20, -5, eio3(p)) , rx: lerp(14, 7, eio3(p)), rz: lerp(3, 0, enter), s: .88 }, { nx: 10, ny: 10, shadow: 70, edge: 'rgba(255,255,255,.12)' });
  // chips
  CHIPS.forEach((ch, i) => {
    const q = clamp((t - ch.at) / .55); if (q <= 0) return; const e = eoBack(q, 1.3);
    const fromX = ch.x < W / 2 ? -380 : W + 380, x = lerp(fromX, ch.x, e), y = ch.y + (1 - e) * 60;
    const img = chipImg(ch);
    const fl = Math.sin(t * 2 + i * 1.3) * 5 * seg(t, ch.at + .6, ch.at + 1);
    P3(img, x, y + fl, { z: -80 - (i % 2) * 40, ry: (ch.x < W / 2 ? 14 : -14) * (1 - q * .5), rz: (ch.x < W / 2 ? -2 : 2), s: 1 }, { nx: 6, ny: 3, shadow: 30, shadowY: 12 });
    // landing ring
    const rg = seg(t, ch.at + .4, ch.at + .85); if (rg > 0 && rg < 1) { ctx.save(); ctx.strokeStyle = `rgba(247,220,134,${(1 - rg) * .8})`; ctx.lineWidth = 3; rr(ctx, ch.x - 158 - rg * 24, y - 46 - rg * 24, 316 + rg * 48, 92 + rg * 48, 46 + rg * 24); ctx.stroke(); ctx.restore(); }
  });
  // raw-footage counter (until headline lands)
  { const ca = eo3(seg(t, 3.3, 3.7)) * (1 - seg(t, 4.85, 5.1)); if (ca > 0) { pill('47:32 OF RAW RECORDING', W / 2, 1385, 30, { a: ca, fill: 'rgba(13,36,86,.95)', col: C.goldL }); } }
  // type
  scrim(1240, 1560, 0, .85); ctx.fillStyle = 'rgba(3,10,27,.85)'; ctx.fillRect(0, 1560, W, H - 1560);
  const ty = 1385, size = 80;
  const l1 = seg(t, 4.95, 5.4), l2 = seg(t, 5.15, 5.65);
  if (l1 > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, ty - size * 1.0, W, size * 1.3); ctx.clip(); bigText('THE RECORDING', W / 2, ty, fit(ctx, 'IS JUST THE START.', 900, 900), { p: l1, mode: 'rise', ls: 0 }); ctx.restore(); }
  if (l2 > 0) {
    const sz = fit(ctx, 'IS JUST THE START.', 900, 900), wA = tw(ctx, 'IS JUST THE ', sz, 900), wB = tw(ctx, 'START.', sz, 900), tot = wA + wB, x0 = W / 2 - tot / 2, by = ty + sz * 1.12;
    ctx.save(); ctx.beginPath(); ctx.rect(0, by - sz * 1.0, W, sz * 1.4); ctx.clip();
    ctx.globalAlpha = clamp(l2 * 3); ctx.translate(0, (1 - eo5(l2)) * 60); ctx.font = `900 ${sz}px Inter`; ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.fillText('IS JUST THE ', x0, by);
    ctx.fillStyle = goldFill(ctx, x0 + wA, by - sz, wB, sz); ctx.fillText('START.', x0 + wA, by); ctx.restore();
  }
  // small brand tag
  T(ctx, 'PROVIRTUAL', 60, 200, { size: 24, w: 800, col: '#fff', ls: .3, a: .75 }); T(ctx, 'PH', 60 + tw(ctx, 'PROVIRTUAL', 24, 800, .3) + 10, 200, { size: 24, w: 800, col: C.gold, ls: .3, a: .9 });
}

/* ============================================================
   SCENE 3 — THE TRANSFORMATION (7–14 s)
   ============================================================ */
let NLE3 = null, AUD = null;
const SEL = { a: 1430, b: 1520 };
function wideCard(w, a) { const h = w * 9 / 16, c0 = mk(w, h), c = c0.getContext('2d'); rr(c, 0, 0, w, h, 18); c.clip(); c.drawImage(FR[0], 0, 0, 1280, 720, 0, 0, w, h); hudOverlay(c, w, h, 1430 + a); return c0; }
function audioPanel(t, sp) {
  const w = 960, h = 640; if (!AUD) AUD = mk(w, h); const c = AUD.getContext('2d'); c.clearRect(0, 0, w, h);
  rr(c, 0, 0, w, h, 22); c.fillStyle = C.char; c.fill(); c.save(); rr(c, 0, 0, w, h, 22); c.clip();
  c.fillStyle = '#0c111e'; c.fillRect(0, 0, w, 130);
  T(c, 'AUDIO  ·  CLEANUP', 200, 56, { size: 22, w: 800, col: '#fff', ls: .16 }); T(c, 'Clip_01_9x16  —  Voice', 200, 94, { size: 20, w: 600, col: C.mute });
  const lu = lerp(-23.4, -14.0, eio3(sp)); T(c, 'LOUDNESS', w - 40, 50, { size: 15, w: 800, col: C.mute, al: 'right', ls: .16 }); T(c, lu.toFixed(1) + ' LUFS', w - 40, 96, { size: 38, w: 900, col: sp > .98 ? C.goldL : '#fff', al: 'right' });
  // lanes
  const lanes = [{ y: 160, lab: 'RAW  ·  BACKGROUND NOISE', clean: false }, { y: 330, lab: 'REFINED  ·  NOISE REMOVED, LEVELS BALANCED', clean: true }];
  const lx = 40, lw = w - 80, lh = 140, scan = lx + lw * eio3(sp);
  lanes.forEach(L => {
    rr(c, lx, L.y, lw, lh, 12); c.fillStyle = '#111a2e'; c.fill(); T(c, L.lab, lx + 16, L.y + 26, { size: 14, w: 800, col: L.clean ? C.goldL : C.mute, ls: .14 });
    c.save(); rr(c, lx, L.y, lw, lh, 12); c.clip();
    const n = 120, bw = lw / n;
    for (let i = 0; i < n; i++) {
      const x = lx + i * bw, base = SPEECH[(i * 2 + 400) % 5000], noise = .22 + .5 * hash(i * 3.9 + Math.floor(t * 12) * .37) * (.4 + .6 * vnoise(i * .4));
      const dirtyA = Math.min(1, base * .85 + noise * .7), cleanA = base * .78;
      const isClean = L.clean && x < scan; const a = isClean ? cleanA : dirtyA, bh = Math.max(3, a * (lh - 50));
      c.fillStyle = isClean ? C.gold : (L.clean ? 'rgba(143,169,212,.55)' : 'rgba(143,169,212,.7)');
      c.fillRect(x + 1.5, L.y + lh / 2 + 10 - bh / 2, bw - 3, bh);
    }
    if (L.clean && sp > 0 && sp < 1) { c.fillStyle = C.goldL; c.fillRect(scan - 1.5, L.y, 3, lh); c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(scan - 90, 0, scan, 0); g.addColorStop(0, 'rgba(247,220,134,0)'); g.addColorStop(1, 'rgba(247,220,134,.35)'); c.fillStyle = g; c.fillRect(scan - 90, L.y, 90, lh); c.restore(); }
    c.restore();
  });
  // EQ strip
  c.fillStyle = '#111a2e'; rr(c, lx, 500, lw, 110, 12); c.fill(); T(c, 'EQ  ·  VOICE CLARITY', lx + 16, 526, { size: 14, w: 800, col: C.mute, ls: .14 });
  c.save(); rr(c, lx, 500, lw, 110, 12); c.clip(); c.beginPath();
  for (let i = 0; i <= 80; i++) { const x = lx + lw * i / 80, f = i / 80, tgt = Math.exp(-Math.pow((f - .62) * 4.2, 2)) * 34 + Math.exp(-Math.pow((f - .18) * 6, 2)) * -14, y = 560 - tgt * eio3(sp) - 4 * Math.sin(f * 20); i ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.lineWidth = 4; c.strokeStyle = C.goldL; c.stroke(); c.lineTo(lx + lw, 610); c.lineTo(lx, 610); c.closePath(); c.fillStyle = 'rgba(214,173,69,.14)'; c.fill(); c.restore();
  c.restore(); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; rr(c, 1, 1, w - 2, h - 2, 22); c.stroke();
  return AUD;
}
function s3(t, ov) {
  if (!ov) bg(t);
  // ---- 3a  timeline, selection, razor (7.0–8.5)
  const ta = 1 - seg(t, 8.35, 8.8);
  if (ta > 0) {
    const g1 = eo3(seg(t, 7.0, 7.45)), phs = t < 7.6 ? lerp(1370, 1430, seg(t, 7.0, 7.6)) : lerp(1430, 1520, seg(t, 7.6, 8.3));
    const sp = eio3(seg(t, 7.55, 8.0)), r1 = seg(t, 8.0, 8.35), r2 = seg(t, 8.12, 8.47), cg = 12 * seg(t, 8.0, 8.5);
    const cuts = t >= 8.0 ? [{ s: SEL.a, gap: cg }, { s: SEL.b, gap: cg }] : [];
    if (!NLE3) NLE3 = mk(1000, 600); const c = NLE3.getContext('2d'); c.clearRect(0, 0, 1000, 600);
    drawNLE(c, 1000, 760, { rows: [{ k: 'v1', label: 'V1', wt: 1.7, p: 1 }, { k: 'a1', label: 'A1', wt: 1, p: 1 }, { k: 'a2', label: 'A2', wt: 1, p: 1 }], pps: 4, t0: 1370, ph: phs, t, tc: fmtTC(phs), sel: { a: SEL.a, b: SEL.b, p: sp }, cuts, lift: 16 * seg(t, 8.3, 8.6), razor: [{ s: SEL.a, p: r1 }, { s: SEL.b, p: r2 }], tool: t > 7.9 ? 'razor' : 'sel' });
    const out = seg(t, 8.35, 8.8);
    P3(NLE3, W / 2, lerp(1120, 1000, g1), { z: lerp(300, 0, g1) + out * 500, ry: lerp(-14, -5, g1), rx: lerp(18, 9, g1), s: 1.02, a: ta * g1 }, { nx: 8, ny: 6, shadow: 60, edge: 'rgba(255,255,255,.12)' });
  }
  head('CUT.', t, 7.15, 8.5, 470, '#fff', 330);
  // ---- 3b/3c  reframe to vertical + captions (8.45–10.6)
  const tb = seg(t, 8.45, 8.95), pr = eio3(seg(t, 8.95, 9.55)), ph = 1 - eio3(seg(t, 9.95, 10.65));
  const hold = eo3(seg(t, 8.45, 8.9));
  if (t > 8.4 && t < 11.0) {
    // geometry
    const srcX = lerp(0, 870 - 405 / 2, pr) , srcW = lerp(1280, 405, pr);
    const baseH = lerp(540, 1060, pr);
    // position: center (540, 900) -> thumbnail slot (155, 700) as phone shrinks
    const k = eio3(seg(t, 9.95, 10.65)), pxc = lerp(540, 155, k), pyc = lerp(970, 806, k), scl = lerp(1, 150 / 1060, k);
    const Hs = baseH * scl, Ws = Hs * (srcW / 720);
    const rise = lerp(40, 0, hold);
    ctx.save(); ctx.globalAlpha = clamp(tb * 1.4) * (1 - seg(t, 10.9, 11.1));
    // shadow + glow
    ctx.save(); ctx.shadowColor = 'rgba(214,173,69,.5)'; ctx.shadowBlur = 60; rr(ctx, pxc - Ws / 2, pyc - Hs / 2 + rise, Ws, Hs, 20); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, pxc - Ws / 2, pyc - Hs / 2 + rise, Ws, Hs, lerp(18, 60, pr) * scl + 4); ctx.clip();
    ctx.drawImage(FR[0], srcX, 0, srcW, 720, pxc - Ws / 2, pyc - Hs / 2 + rise, Ws, Hs); ctx.restore();
    if (pr < 1) { ctx.strokeStyle = C.goldL; ctx.lineWidth = 4; rr(ctx, pxc - Ws / 2, pyc - Hs / 2 + rise, Ws, Hs, 18); ctx.stroke(); }
    if (pr > .8) { // phone chrome crossfade
      const ph2 = phone(596, 1060, { v: 0, cap: clamp((t - 9.45) / .13, 0, 7.2), prog: seg(t, 9.5, 10.6), badge: '9:16' });
      ctx.globalAlpha *= clamp((pr - .8) * 5); ctx.drawImage(ph2, pxc - Ws / 2, pyc - Hs / 2 + rise, Ws, Hs);
    }
    ctx.restore();
    // guides around vertical crop
    if (pr > 0 && pr < 1) { ctx.save(); ctx.strokeStyle = 'rgba(247,220,134,.9)'; ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.strokeRect(pxc - Ws / 2, pyc - Hs / 2, Ws, Hs); ctx.restore(); T(ctx, '9:16', pxc, pyc - Hs / 2 - 20, { size: 30, w: 900, col: C.goldL, al: 'center', ls: .1, a: pr }); }
  }
  head('REFINE.', t, 9.95, 11.45, 480, '#fff', 330);
  // ---- 3d  audio refine (9.95–11.6)
  if (t > 9.9 && t < 11.8) {
    const inn = eo5(seg(t, 9.95, 10.5)), outt = seg(t, 11.45, 11.8), sp = clamp((t - 10.3) / 1.0);
    const img = audioPanel(t, sp);
    P3(img, W / 2, lerp(1350, 1060, inn) , { z: lerp(250, -80, inn) + outt * 700, ry: 0, rx: lerp(25, 4, inn), s: 1.06, a: inn * (1 - outt) }, { nx: 8, ny: 8, shadow: 60, edge: 'rgba(214,173,69,.45)', edgeW: 2 });
    // phone thumbnail sits in header slot (drawn when panel is there)
    if (t > 10.6) { const tha = (1 - outt) * seg(t, 10.6, 10.75); ctx.save(); ctx.globalAlpha = tha; const th = phone(84, 150, { v: 0, cap: 0, prog: 1 }); ctx.drawImage(th, 155 - 42, 806 - 75); ctx.restore(); }
    // refined flash
    if (sp > .985) { const q = seg(t, 11.25, 11.7); if (q < 1) { pill('✓  AUDIO CLEAN', W / 2, 1440, 34, { a: eo3(seg(t, 11.25, 11.4)) * (1 - outt) }); } }
  }
  // ---- 3e  assembly (11.5–14.0)
  head('REPURPOSE.', t, 11.5, 14.4, 480, 'gold', 260);
  if (t > 11.4) {
    const ex = eio3(seg(t, 13.75, 14.3));
    glow(W / 2, 1080, 700, 'rgba(214,173,69,A)', .22 * eo3(seg(t, 12, 13)) * (1 - ex));
    const defs = [
      { id: 'pod', at: 11.7, x: 178, y: 850, z: 0, ry: 24, rz: -3, from: [-420, 760], mk: () => podcastCover(290, { t }) },
      { id: 'thumb', at: 11.9, x: 872, y: 820, z: 0, ry: -24, rz: 3, from: [1500, 560], mk: () => thumbCard(372, 209) },
      { id: 'aud', at: 12.1, x: 178, y: 1300, z: 0, ry: 22, rz: 3, from: [-420, 1600], mk: () => audiogram(290, { t }) },
      { id: 'soc', at: 12.3, x: 880, y: 1310, z: 0, ry: -22, rz: -3, from: [1500, 1650], mk: () => socialCard(270, 346) },
      { id: 'phone', at: 11.55, x: 540, y: 1080, z: -60, ry: 0, rz: 0, from: [540, 2500], mk: () => phone(346, 615, { v: 0, cap: 7.2, prog: .6, badge: '9:16' }), nx: 8 },
    ];
    defs.forEach((d, i) => {
      const q = seg(t, d.at, d.at + .75); if (q <= 0) return; const e = eoBack(q, 1.1), st = seg(t, d.at + .75, d.at + 1.1);
      const fl = Math.sin(t * 1.8 + i * 1.7) * 7 * st;
      const x = lerp(d.from[0], d.x, e) + (d.x - W / 2) * ex * 1.6, y = lerp(d.from[1], d.y, e) + fl + (d.y - H / 2) * ex * 1.2;
      const img = d.mk();
      P3(img, x, y, { z: d.z + ex * 900, ry: d.ry * (1 - ex * .4) + (1 - q) * (d.ry > 0 ? -50 : 50), rz: d.rz, s: lerp(.7, 1, e), a: clamp(q * 3) * (1 - ex) }, { nx: 7, ny: 7, shadow: 50, edge: 'rgba(247,220,134,.35)' });
      const rg = seg(t, d.at + .55, d.at + 1.0); if (rg > 0 && rg < 1 && d.id !== 'phone') { ctx.save(); ctx.globalAlpha = (1 - rg) * .6; ctx.strokeStyle = C.goldL; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(d.x, d.y, 120 + rg * 120, 0, 7); ctx.stroke(); ctx.restore(); }
    });
  }
}

/* ============================================================
   SCENE 4 — FORMATS (14–19 s)
   ============================================================ */
const S4 = { a: [14.0, 15.05], b: [15.05, 16.05], c: [16.05, 17.05], d: [17.05, 19.0] };
function grpT(t, a, b, dirIn = 1) { // returns {vis, enter, exit}
  const en = eo5(seg(t, a, a + .5)), ex = eio3(seg(t, b - .35, b));
  return { vis: t >= a - .01 && t < b + .02, en, ex, x: (1 - en) * 700 * dirIn - ex * 700 };
}
function label4(txt, idx, t, a, b) {
  const en = eo5(seg(t, a + .1, a + .5)), ex = seg(t, b - .25, b); if (en <= 0 || ex >= 1) return;
  ctx.save(); ctx.globalAlpha = en * (1 - ex); ctx.translate(0, (1 - en) * 40);
  T(ctx, String(idx).padStart(2, '0') + ' / 04', W / 2, 1392, { size: 28, w: 800, col: C.gold, al: 'center', ls: .3 });
  const size = 70; ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = (.03 * size) + 'px'; const wd = ctx.measureText(txt).width;
  T(ctx, txt, W / 2, 1392 + size + 18, { size, w: 900, col: '#fff', al: 'center', ls: .03 });
  ctx.fillStyle = goldFill(ctx, W / 2 - wd / 2, 0, wd, 0); ctx.fillRect(W / 2 - wd / 2, 1392 + size + 40, wd, 5);
  ctx.restore();
}
function podEditor(t, u) {
  const w = 980, h = 640, c0 = mk(w, h), c = c0.getContext('2d');
  rr(c, 0, 0, w, h, 20); c.fillStyle = C.char; c.fill(); c.save(); rr(c, 0, 0, w, h, 20); c.clip();
  c.fillStyle = '#0c111e'; c.fillRect(0, 0, w, 56); [0, 1, 2].forEach(i => { c.fillStyle = ['#ff6058', '#ffbd2e', '#27c93f'][i] + '99'; c.beginPath(); c.arc(30 + i * 24, 28, 7, 0, 7); c.fill(); });
  T(c, 'Founder Talks  ·  Episode 12  —  Edit', w / 2, 36, { size: 19, w: 600, col: C.mute, al: 'center' });
  c.drawImage(podcastCover(210, { t }), 36, 84);
  T(c, 'EPISODE EDIT', 270, 120, { size: 17, w: 800, col: C.gold, ls: .22 }); T(c, 'Founder Talks — Ep. 12', 270, 168, { size: 36, w: 900, col: '#fff' });
  T(c, 'Host + Guest  ·  Cleaned  ·  Chaptered', 270, 204, { size: 20, w: 600, col: C.mute });
  const ph = .1 + .8 * ((u * .5) % 1); T(c, fmtMS(ph * 38 * 60 + 0), 270, 262, { size: 40, w: 900, col: C.goldL }); T(c, '/ 38:12', 270 + 124, 262, { size: 26, w: 700, col: C.mute });
  // chapters
  ['INTRO', 'THE STORY', 'Q&A', 'OUTRO'].forEach((lab, i) => { const x = 60 + i * 215; c.fillStyle = C.gold; c.fillRect(x, 318, 3, 28); rr(c, x + 3, 318, 18 + tw(c, lab, 14, 800, .12), 24, 4); c.fillStyle = 'rgba(214,173,69,.2)'; c.fill(); T(c, lab, x + 12, 335, { size: 14, w: 800, col: C.goldL, ls: .12 }); });
  const lanes = [{ y: 366, lab: 'HOST', col: '#8db0ea', off: 100 }, { y: 486, lab: 'GUEST', col: C.gold, off: 900 }];
  lanes.forEach(L => {
    rr(c, 36, L.y, w - 72, 104, 10); c.fillStyle = '#111a2e'; c.fill(); T(c, L.lab, 52, L.y + 24, { size: 13, w: 800, col: C.mute, ls: .2 });
    c.save(); rr(c, 36, L.y, w - 72, 104, 10); c.clip(); const n = 110, bw = (w - 72) / n;
    for (let i = 0; i < n; i++) { const talk = L.lab === 'HOST' ? (vnoise(i * .13 + 3) > .5) : (vnoise(i * .13 + 3) <= .5); const a = talk ? SPEECH[(i * 2 + L.off) % 5000] : .05; const bh = Math.max(2, a * 78); c.fillStyle = L.col; c.globalAlpha = talk ? 1 : .35; c.fillRect(36 + i * bw + 1.5, L.y + 56 - bh / 2, bw - 3, bh); }
    c.globalAlpha = 1; c.restore();
  });
  // removed silence regions
  [[300, 380], [610, 660], [790, 850]].forEach(([a, b]) => { c.save(); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(a, 366, b - a, 224); c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 2; for (let x = a - 230; x < b; x += 12) { c.beginPath(); c.moveTo(Math.max(a, x), 366 + Math.max(0, a - x)); c.lineTo(Math.min(b, x + 224), 366 + Math.min(224, b - x + 0)); c.stroke(); } c.restore(); });
  const px = 60 + (w - 120) * ph; c.fillStyle = C.goldL; c.fillRect(px - 1.5, 356, 3, 250); c.beginPath(); c.moveTo(px - 9, 356); c.lineTo(px + 9, 356); c.lineTo(px, 370); c.closePath(); c.fill();
  T(c, 'SILENCE TRIMMED  ·  LEVELS BALANCED', 36, 626, { size: 13, w: 800, col: '#55617f', ls: .14 });
  c.restore(); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; rr(c, 1, 1, w - 2, h - 2, 20); c.stroke();
  return c0;
}
function boxCaptions(c, cx, y, lines, n, size) {
  let k = 0;
  lines.forEach((ln, li) => {
    const txt = ln.join(' '), wd = tw(c, txt, size, 900) + size * .8, p = clamp(n - k) ; k += ln.length; const q = clamp((n - (k - ln.length)) / ln.length);
    if (q <= 0) return; const yy = y + li * size * 1.5;
    c.save(); c.beginPath(); c.rect(cx - wd / 2, yy - size * 1.2, wd * q, size * 1.8); c.clip(); rr(c, cx - wd / 2, yy - size * 1.0, wd, size * 1.35, size * .3); c.fillStyle = goldGrad(c, cx - wd / 2, 0, cx + wd / 2, 0); c.fill(); T(c, txt, cx, yy, { size, w: 900, col: C.navy1, al: 'center' }); c.restore();
  });
}
function s4(t, ov) {
  if (!ov) bg(t);
  // progress bars
  const idxNow = t < S4.b[0] ? 0 : t < S4.c[0] ? 1 : t < S4.d[0] ? 2 : 3;
  // ---- 4a  short-form fan
  let g = grpT(t, S4.a[0], S4.b[0], 0);
  if (g.vis) {
    const en = eo5(seg(t, 14.0, 14.6)), ex = g.ex;
    const defs = [{ v: 1, x: 235, r: -13, z: 120, cap: 3 }, { v: 2, x: 845, r: 13, z: 120, cap: 3 }, { v: 0, x: 540, r: 0, z: -40, cap: clamp((t - 14.3) / .13, 0, 7.2) }];
    defs.forEach((d, i) => {
      const img = phone(420, 747, { v: d.v, cap: d.cap, prog: .3 + (t - 14) * .35, lines: d.v === 1 ? CAP_LINES2 : CAP_LINES, hl: d.v === 1 ? 2 : 6, badge: i === 2 ? '9:16' : null, cx: d.v === 0 ? 870 : 640 });
      const yy = 860 + (1 - en) * 600 * (i === 2 ? .3 : 1) + Math.sin(t * 2 + i) * 6;
      P3(img, d.x + (d.x - 540) * ex * 1.3 + (d.x < 540 ? -1 : 1) * (1 - en) * 300 * (i === 2 ? 0 : 1), yy, { z: d.z + ex * 600, ry: d.r * 1.5 * (1 - ex * .2) - Math.sin(t * 1.4) * 4, rz: d.r * .25, s: i === 2 ? 1.06 : .86, a: (1 - ex) * clamp(en * 2) }, { nx: 8, ny: 10, shadow: 60, edge: 'rgba(247,220,134,.3)' });
    });
    label4('SHORT-FORM VIDEO', 1, t, S4.a[0], S4.a[1]);
  }
  // ---- 4b  podcast editing
  g = grpT(t, S4.b[0], S4.c[0], 1);
  if (g.vis && t >= S4.b[0] - .02) {
    const img = podEditor(t, t - S4.b[0]);
    P3(img, W / 2 + g.x, 840, { z: -20 - Math.abs(g.x) * .2, ry: -10 + g.x * .02, rx: 6, s: 1.06, a: clamp(g.en * 2) * (1 - g.ex * .5) }, { nx: 10, ny: 8, shadow: 60, edge: 'rgba(255,255,255,.12)' });
    label4('PODCAST EDITING', 2, t, S4.b[0], S4.b[1]);
  }
  // ---- 4c  captioned clips
  g = grpT(t, S4.c[0], S4.d[0], 1);
  if (g.vis && t >= S4.c[0] - .02) {
    const u = t - S4.c[0];
    const a1 = phone(440, 782, { v: 0, cap: clamp((u - .2) / .1, 0, 7.2), prog: .4 + u * .3, hl: 6 });
    const a2c = phone(440, 782, { v: 2, cap: 0, prog: .5 + u * .3, cx: 700 }); const x2 = a2c.getContext('2d'); boxCaptions(x2, 220 - 6, 590, [['EVERY WORD'], ['SEEN & HEARD']], clamp((u - .25) * 8, 0, 2), 42);
    P3(a1, 300 + g.x * 1.05, 850, { z: 20, ry: 12, rz: -2, s: .94, a: clamp(g.en * 2) * (1 - g.ex * .5) }, { nx: 8, ny: 10, shadow: 60, edge: 'rgba(247,220,134,.3)' });
    P3(a2c, 790 + g.x * 1.2, 880, { z: 60, ry: -12, rz: 2, s: .94, a: clamp(g.en * 2) * (1 - g.ex * .5) }, { nx: 8, ny: 10, shadow: 60, edge: 'rgba(247,220,134,.3)' });
    label4('CAPTIONED CLIPS', 3, t, S4.c[0], S4.c[1]);
  }
  // ---- 4d  repurposing flow + headline
  g = grpT(t, S4.d[0], S4.d[1] + 1, 1);
  if (t >= S4.d[0] - .02) {
    const u = t - S4.d[0], en = eo5(seg(t, 17.05, 17.6));
    // headline
    const hs = 90, hb = 262, gapL = 98;
    const lines = ['MORE WAYS TO', 'SHARE YOUR', 'MESSAGE.'];
    lines.forEach((ln, i) => { const q = seg(t, 17.5 + i * .13, 17.95 + i * .13); if (q <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(0, hb + i * gapL - hs, W, hs * 1.35); ctx.clip();
      if (i === 1) { const wA = tw(ctx, 'SHARE', hs, 900), wB = tw(ctx, ' YOUR', hs, 900), x0 = W / 2 - (wA + wB) / 2, yy = hb + i * gapL + (1 - eo5(q)) * 80; ctx.globalAlpha = clamp(q * 3); ctx.font = `900 ${hs}px Inter`; ctx.textAlign = 'left'; ctx.fillStyle = goldFill(ctx, x0, yy - hs, wA, hs); ctx.fillText('SHARE', x0, yy); ctx.fillStyle = '#fff'; ctx.fillText(' YOUR', x0 + wA, yy); }
      else bigText(ln, W / 2, hb + i * gapL, hs, { p: q, mode: 'rise', shadow: false }); ctx.restore(); });
    // diagram
    const sy = 735, srcP = eo5(seg(t, 17.1, 17.55));
    const src = wideCard(500, 0); const flo = Math.sin(t * 2) * 4;
    P3(src, W / 2, sy + (1 - srcP) * 200 + flo, { z: 0, ry: 0, rx: 0, s: 1, a: srcP }, { nx: 4, ny: 4, shadow: 40, edge: 'rgba(247,220,134,.5)' });
    T(ctx, 'ONE RECORDING  ·  47:32', W / 2, sy - 160, { size: 24, w: 800, col: C.goldL, al: 'center', ls: .2, a: srcP });
    const rowY = 1135;
    const cardsDef = [
      { x: 122, y: rowY, mk: () => phone(160, 284, { v: 0, cap: 7.2, prog: .6, capSize: 17, lines: CAP_LINES }), w: 160, h: 284, lab: 'SHORT-FORM' },
      { x: 372, y: rowY, mk: () => podcastCover(212, { t }), w: 212, h: 212, lab: 'PODCAST' },
      { x: 620, y: rowY, mk: () => audiogram(212, { t }), w: 212, h: 212, lab: 'AUDIOGRAM' },
      { x: 882, y: rowY, mk: () => thumbCard(236, 133), w: 236, h: 133, lab: 'THUMBNAIL' },
    ];
    const y0 = sy + 125;
    cardsDef.forEach((d, i) => {
      const at = 17.45 + i * .14, q = seg(t, at, at + .5), e = eoBack(q, 1.2);
      const lp = seg(t, 17.3 + i * .1, 17.8 + i * .1), ye = d.y - d.h / 2 - 16;
      ctx.save(); ctx.strokeStyle = 'rgba(247,220,134,.8)'; ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.lineDashOffset = -t * 40;
      ctx.beginPath(); ctx.moveTo(W / 2, y0); ctx.bezierCurveTo(W / 2, y0 + 110, d.x, ye - 110, d.x, ye);
      ctx.globalAlpha = lp; ctx.stroke(); ctx.restore();
      if (lp >= 1) { const pt = (t * .6 + i * .25) % 1, m = 1 - pt; const bx = m ** 3 * W / 2 + 3 * m * m * pt * W / 2 + 3 * m * pt * pt * d.x + pt ** 3 * d.x, by = m ** 3 * y0 + 3 * m * m * pt * (y0 + 110) + 3 * m * pt * pt * (ye - 110) + pt ** 3 * ye; ctx.save(); ctx.fillStyle = C.goldL; ctx.shadowColor = C.gold; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(bx, by, 6, 0, 7); ctx.fill(); ctx.restore(); }
      if (q > 0) { P3(d.mk(), d.x, d.y + (1 - e) * 120 + Math.sin(t * 2 + i) * 4, { z: 0, s: lerp(.6, 1, e), a: clamp(q * 3) }, { nx: 4, ny: 4, shadow: 36, edge: 'rgba(247,220,134,.4)' }); T(ctx, d.lab, d.x, d.y + d.h / 2 + 42, { size: 21, w: 800, col: C.mute, al: 'center', ls: .16, a: clamp(q * 2) }); }
    });
    label4('CONTENT REPURPOSING', 4, t, S4.d[0], 99);
  }
  // story-style progress bar
  const pa = seg(t, 14.0, 19.0), bx0 = 210, bw = 140, gp = 20;
  for (let i = 0; i < 4; i++) { const x = bx0 + i * (bw + gp), q = clamp(pa * 4 - i * 1 + (i === 3 ? 0 : 0)); const fill = i === 3 ? clamp((t - 17.05) / 1.9) : clamp((t - (14 + i * 1.0)) / 1.0); ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(ctx, x, 1538, bw, 7, 3.5); ctx.fill(); ctx.fillStyle = goldFill(ctx, x, 0, bw, 0); rr(ctx, x, 1538, bw * fill, 7, 3.5); ctx.fill(); }
}

/* ============================================================
   SCENE 5 — PROVIRTUAL SUPPORT (19–22 s)
   ============================================================ */
let WS = null, WS2 = null;
function buildWorkspace() {
  const w = 2000, h = 1400; WS = mk(w, h); const c = WS.getContext('2d');
  c.fillStyle = '#060f26'; c.fillRect(0, 0, w, h);
  const P = (x, y, ww, hh, title) => { rr(c, x, y, ww, hh, 22); c.fillStyle = C.char; c.fill(); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#0c111e'; c.save(); rr(c, x, y, ww, hh, 22); c.clip(); c.fillRect(x, y, ww, 56); c.restore(); T(c, title, x + 26, y + 37, { size: 21, w: 800, col: C.mute, ls: .2 }); };
  const cw = 620, ch = 420, gx = 70, gy = 60;
  // media bin
  P(60, 60, cw, ch, 'MEDIA BIN'); for (let i = 0; i < 6; i++) { const x = 90 + (i % 3) * 190, y = 140 + Math.floor(i / 3) * 150; rr(c, x, y, 176, 99, 8); c.save(); c.clip(); thumbMini(c, x, y, 176, 99, i); c.restore(); T(c, ['EP12_RAW', 'BROLL_01', 'INTRO', 'CLIP_01', 'CLIP_02', 'MUSIC'][i], x, y + 124, { size: 17, w: 700, col: C.mute }); }
  // preview
  P(690, 60, cw, ch, 'PROGRAM  ·  9:16'); c.drawImage(phone(190, 338, { v: 0, cap: 7.2, prog: .5, capSize: 22 }), 690 + cw / 2 - 95, 135);
  // captions
  P(1320, 60, cw, ch, 'CAPTION EDITOR'); [['00:00:02', 'YOUR BEST IDEAS'], ['00:00:04', 'DESERVE TO BE HEARD'], ['00:00:07', 'ONE RECORDING.'], ['00:00:09', 'MANY FORMATS.'], ['00:00:12', 'LET’S MAKE IT SHINE']].forEach((r, i) => { const y = 140 + i * 66; rr(c, 1350, y, cw - 60, 52, 8); c.fillStyle = i === 1 ? 'rgba(214,173,69,.18)' : '#141c30'; c.fill(); T(c, r[0], 1370, y + 34, { size: 19, w: 700, col: C.gold }); T(c, r[1], 1500, y + 34, { size: 21, w: 800, col: '#fff', ls: .03 }); });
  // timeline (wide)
  P(60, 530, 1880, 440, 'TIMELINE  ·  SEQUENCE 01');
  const t2 = mk(1840, 360); drawNLE(t2.getContext('2d'), 1840, 360, { rows: [{ k: 'v1', label: 'V1', wt: 1.2, p: 1 }, { k: 'a1', label: 'A1', wt: 1, p: 1 }, { k: 'a2', label: 'A2', wt: 1, p: 1 }, { k: 'cc', label: 'CC', wt: .6, p: 1 }], pps: 6, t0: 900, ph: 1010, title: 'Interview_Ep12_RAW.mov', status: 'EXPORT QUEUE  ·  3 ITEMS' }); c.drawImage(t2, 80, 590);
  // mixer
  P(60, 1000, cw, 340, 'AUDIO MIXER'); for (let i = 0; i < 6; i++) { const x = 120 + i * 90; rr(c, x, 1080, 14, 220, 7); c.fillStyle = '#0b1020'; c.fill(); const lv = [.7, .55, .8, .6, .72, .5][i]; rr(c, x, 1080 + 220 * (1 - lv), 14, 220 * lv, 7); c.fillStyle = goldGrad(c, 0, 1080, 0, 1300); c.fill(); rr(c, x - 12, 1080 + 220 * (1 - lv) - 8, 38, 18, 5); c.fillStyle = '#d7deef'; c.fill(); T(c, 'A' + (i + 1), x + 7, 1325, { size: 16, w: 700, col: C.mute, al: 'center' }); }
  // waveform
  P(690, 1000, cw, 340, 'VOICE  ·  CLEAN'); bars(c, 720, 1190, 560, 190, 54, 0, C.gold, { static: true, off: 1500 });
  // export
  P(1320, 1000, cw, 340, 'EXPORT QUEUE'); [['Clip_01_9x16.mp4', 1], ['Podcast_Ep12.wav', 1], ['Thumbnail_v2.png', .7]].forEach((r, i) => { const y = 1090 + i * 80; T(c, r[0], 1352, y + 8, { size: 24, w: 700, col: '#fff' }); rr(c, 1352, y + 24, 420, 10, 5); c.fillStyle = '#0b1020'; c.fill(); rr(c, 1352, y + 24, 420 * r[1], 10, 5); c.fillStyle = goldGrad(c, 1352, 0, 1772, 0); c.fill(); if (r[1] === 1) { c.fillStyle = 'rgba(214,173,69,.2)'; c.beginPath(); c.arc(1860, y + 12, 22, 0, 7); c.fill(); icon(c, 'check', 1860, y + 12, 26, C.goldL, 3); } });
}
function s5(t, ov) {
  if (!ov) bg(t);
  if (!WS) buildWorkspace();
  const p = clamp((t - 18.9) / 3.3), en = eo5(seg(t, 18.9, 19.7));
  P3(WS, W / 2 + lerp(20, -10, p), lerp(800, 600, en) - p * 20, { z: lerp(500, 120, eo3(p)), ry: lerp(-9, -4, p), rx: lerp(30, 21, eo3(p)), rz: lerp(-2, 0, p), s: .5, a: en }, { nx: 14, ny: 10, shadow: 70, edge: 'rgba(247,220,134,.35)', edgeW: 3 });
  // gold tracing lines
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(247,220,134,.5)'; ctx.lineWidth = 3; ctx.setLineDash([60, 400]); ctx.lineDashOffset = -t * 400;
  [250, 1480, 1560].forEach((y, i) => { ctx.beginPath(); ctx.moveTo(-100, y + i * 4); ctx.lineTo(W + 100, y + i * 4 + Math.sin(t) * 6); ctx.stroke(); }); ctx.restore();
  // type zone scrim
  const sa = seg(t, 19.2, 19.8); scrim(880, 1130, 0, .82 * sa); ctx.fillStyle = `rgba(3,10,27,${.82 * sa})`; ctx.fillRect(0, 1130, W, H - 1130);
  const sz1 = 108, sz2 = 84, sz3 = 108;
  const up = 0;
  ctx.save(); ctx.translate(0, -up);
  bigText('YOUR IDEAS.', W / 2, 1040, sz1, { p: seg(t, 19.3, 19.7), mode: 'slam' });
  bigText('OUR PRODUCTION', W / 2, 1040 + 100, sz2, { col: 'gold', p: seg(t, 20.0, 20.4), mode: 'slam' });
  bigText('SUPPORT.', W / 2, 1040 + 100 + 112, sz3, { col: 'gold', p: seg(t, 20.15, 20.55), mode: 'slam' });
  ctx.restore();
  const wp = seg(t, 21.15, 21.75); if (wp > 0) wordmark(W / 2, 1400, 92, wp, 1);
}
function wordmark(cx, cy, size, p, a) {
  const e = eo5(p), sz = size, ls = .06, wA = tw(ctx, 'PROVIRTUAL', sz, 900, ls), wB = tw(ctx, ' PH', sz, 900, ls), x0 = cx - (wA + wB) / 2;
  ctx.save(); ctx.globalAlpha = a * clamp(p * 3); ctx.beginPath(); ctx.rect(x0 - 40, cy - sz * 1.1, (wA + wB + 80) * eio3(p), sz * 1.5); ctx.clip();
  ctx.font = `900 ${sz}px Inter`; ctx.letterSpacing = (ls * sz) + 'px'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; ctx.fillText('PROVIRTUAL', x0, cy);
  ctx.shadowBlur = 0; ctx.fillStyle = goldFill(ctx, x0 + wA, cy - sz, wB, sz); ctx.fillText(' PH', x0 + wA, cy);
  if (p > 0 && p < 1) { const x = x0 - 40 + (wA + wB + 80) * eio3(p), g = ctx.createLinearGradient(x - 130, 0, x + 8, 0); g.addColorStop(0, 'rgba(255,240,190,0)'); g.addColorStop(1, 'rgba(255,240,190,.95)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillText('PROVIRTUAL', x0, cy); ctx.fillText(' PH', x0 + wA, cy); }
  ctx.restore();
  const lw = (wA + wB) * eo3(seg(p, .2, 1)); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = goldFill(ctx, cx - lw / 2, 0, lw, 0); ctx.fillRect(cx - lw / 2, cy + sz * .28, lw, 4); ctx.restore();

}

/* ============================================================
   SCENE 6 — CTA (22–25 s)
   ============================================================ */
function s6(t, ov) {
  if (!ov) bg(t, { dust: 1.4 });
  const u = t - 22;
  // sweeping light
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sx = lerp(-300, 1400, eio3(clamp(u / 3))); const g = ctx.createLinearGradient(sx - 220, 0, sx + 220, 0); g.addColorStop(0, 'rgba(214,173,69,0)'); g.addColorStop(.5, 'rgba(214,173,69,.10)'); g.addColorStop(1, 'rgba(214,173,69,0)'); ctx.transform(1, 0, -.35, 1, 0, 0); ctx.fillStyle = g; ctx.fillRect(sx - 220, -100, 440, H + 200); ctx.restore();
  glow(W / 2, 960, 800, 'rgba(36,86,170,A)', .35);
  // concentric gold rings
  ctx.save(); for (let i = 0; i < 3; i++) { const r = 260 + i * 150 + Math.sin(t * .8 + i) * 8, al = (.16 - i * .04) * seg(t, 22.1, 22.9); ctx.strokeStyle = `rgba(214,173,69,${al})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(W / 2, 960, r, 0, 7); ctx.stroke(); } ctx.restore();
  // headline
  const sA = 84, sB = fit(ctx, 'REPURPOSE', 900, 900, 0, 190), sC = fit(ctx, 'YOUR CONTENT?', 880, 900, 0, 120);
  const yA = 600, yB = yA + sB * 1.0 + 6, yC = yB + sC * 1.18;
  const mv = eio3(seg(t, 23.0, 23.6)) * 150;
  ctx.save(); ctx.translate(0, -mv);
  bigText('READY TO', W / 2, yA, sA, { p: seg(t, 22.1, 22.45), mode: 'slam' });
  bigText('REPURPOSE', W / 2, yB, sB, { col: 'gold', p: seg(t, 22.22, 22.6), mode: 'slam' });
  bigText('YOUR CONTENT?', W / 2, yC, sC, { p: seg(t, 22.34, 22.72), mode: 'slam' });
  ctx.restore();
  // wordmark
  const wp = seg(t, 23.05, 23.65); if (wp > 0) wordmark(W / 2, 1010, 84, wp, 1);
  // CTA
  const cp = seg(t, 23.6, 24.2), e = eoBack(cp, 1.2);
  if (cp > 0) {
    const w = 840, h = 230, cx = W / 2, cy = 1260 + (1 - e) * 60;
    ctx.save(); ctx.globalAlpha = clamp(cp * 2.5); ctx.translate(cx, cy); ctx.scale(lerp(.85, 1, e), lerp(.85, 1, e)); ctx.translate(-cx, -cy);
    ctx.shadowColor = 'rgba(214,173,69,.6)'; ctx.shadowBlur = 50; rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fillStyle = goldFill(ctx, cx - w / 2, cy - h / 2, w, h); ctx.fill(); ctx.shadowBlur = 0;
    ctx.save(); rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2); ctx.clip(); const sh = lerp(-300, w + 300, seg(t, 23.8, 24.5)); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createLinearGradient(cx - w / 2 + sh - 120, 0, cx - w / 2 + sh + 120, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.transform(1, 0, -.3, 1, 0, 0); ctx.fillStyle = gg; ctx.fillRect(cx - w / 2 + sh - 120, cy - h, 240, h * 2); ctx.restore();
    T(ctx, 'DM ‘CONTENT’', cx, cy + 8, { size: 96, w: 900, col: C.navy1, al: 'center', ls: .01 });
    T(ctx, 'TO GET STARTED.', cx, cy + 74, { size: 50, w: 800, col: C.navy1, al: 'center', ls: .08 });
    ctx.restore();
  }
  T(ctx, 'VIDEO EDITING  ·  PODCAST SUPPORT  ·  CONTENT REPURPOSING', W / 2, 1500, { size: 24, w: 700, col: C.blue, al: 'center', ls: .12, a: seg(t, 24.0, 24.4) });
  flash(seg(t, 22.0, 22.5), '247,220,134', .45);
}

/* ============================================================
   COMPOSITOR
   ============================================================ */
function compose(t) {
  const [a1, b1] = TR.t1, [a2, b2] = TR.t2, [a3, b3] = TR.t3, [a4, b4] = TR.t4, [a5, b5] = TR.t5;
  if (t < a1) { s1(t); }
  else if (t < b1) { // iris reveal into scene 2
    const p = eio3(seg(t, a1, b1)); s1(t); ctx.save(); ctx.fillStyle = `rgba(3,10,27,${p * .5})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    const R = lerp(10, 1450, p); ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 7); ctx.clip(); s2(t); ctx.restore();
    ctx.save(); ctx.strokeStyle = `rgba(247,220,134,${(1 - p) * .95})`; ctx.lineWidth = 14 * (1 - p) + 2; ctx.shadowColor = C.gold; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 7); ctx.stroke(); ctx.restore();
    flash(seg(t, a1, b1), '247,220,134', .3);
  }
  else if (t < a2) { s2(t); }
  else if (t < b2) { // dive through the recording into scene 3
    const p = seg(t, a2, b2), e = eiExp(p);
    s3(t); ctx.save(); ctx.fillStyle = `rgba(3,10,27,${(1 - p) * .0})`; ctx.restore();
    const L = mk(W, H), lc = L.getContext('2d'); const prev = ctx; setCtx(lc); s2(t, false); setCtx(prev);
    ctx.save(); ctx.globalAlpha = 1 - eio3(seg(p, .25, .95)); const sc = 1 + e * 2.4; ctx.translate(W / 2, 800); ctx.scale(sc, sc); ctx.translate(-W / 2, -800); ctx.drawImage(L, 0, 0); ctx.restore();
    goldBar(lerp(-200, 1300, eio3(p)), 90, .9); flash(seg(p, .3, .9), '247,220,134', .35);
  }
  else if (t < a3) { s3(t); }
  else if (t < b3) {
    const p = seg(t, a3, b3); s4(t); // incoming
    const L = mk(W, H), lc = L.getContext('2d'); const prev = ctx; setCtx(lc); s3(t, true); setCtx(prev);
    ctx.save(); ctx.globalAlpha = 1 - eio3(seg(p, .1, .8)); ctx.drawImage(L, 0, 0); ctx.restore();
    goldBar(lerp(-200, 1300, eio3(p)), 70, .85);
  }
  else if (t < a4) { s4(t); }
  else if (t < b4) { // split wipe into workspace
    const p = eio3(seg(t, a4, b4)); s5(t);
    const L = mk(W, H), lc = L.getContext('2d'); const prev = ctx; setCtx(lc); s4(t); setCtx(prev);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H / 2); ctx.clip(); ctx.translate(0, -p * H / 2); ctx.drawImage(L, 0, 0); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, H / 2, W, H / 2); ctx.clip(); ctx.translate(0, p * H / 2); ctx.drawImage(L, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const a = Math.sin(p * Math.PI) * .95; const g = ctx.createLinearGradient(0, H / 2 - 40, 0, H / 2 + 40); g.addColorStop(0, 'rgba(247,220,134,0)'); g.addColorStop(.5, `rgba(255,236,170,${a})`); g.addColorStop(1, 'rgba(247,220,134,0)'); ctx.fillStyle = g; ctx.fillRect(0, H / 2 - 40, W, 80); ctx.restore();
  }
  else if (t < a5) { s5(t); }
  else if (t < b5) { const p = seg(t, a5, b5); s6(t); const L = mk(W, H), lc = L.getContext('2d'); const prev = ctx; setCtx(lc); s5(t, true); setCtx(prev); ctx.save(); ctx.globalAlpha = 1 - eio3(p); ctx.drawImage(L, 0, 0); ctx.restore(); flash(p, '247,220,134', .5); }
  else { s6(t); }
  finishFx(t);
}
function mbCount(t) {
  if (t < 2.5) return 4; if (t < 3.3) return 5; if (t >= 3.4 && t < 5.7) return 3; if (t >= 6.5 && t < 7.3) return 5; if (t >= 8.0 && t < 9.7) return 4;
  if (t >= 11.5 && t < 13.2) return 3; if (t >= 13.6 && t < 14.5) return 5; if ((t >= 14.8 && t < 15.3) || (t >= 15.8 && t < 16.3) || (t >= 16.8 && t < 17.3)) return 4; if (t >= 17.3 && t < 18.2) return 3;
  if (t >= 18.6 && t < 19.5) return 5; if (t >= 21.7 && t < 22.4) return 4; return 1;
}
let OUT = null;
function renderFrame(t, quality) {
  const cv = document.getElementById('c'), oc = cv.getContext('2d');
  const N = quality === 'fast' ? 1 : mbCount(t);
  if (N === 1) { setCtx(oc); compose(t); return; }
  const sub = OUT || (OUT = mk(W, H)), sc = sub.getContext('2d'); const shutter = 1 / 30 * .75;
  for (let i = 0; i < N; i++) {
    const tt = t + (N === 1 ? 0 : (i / (N - 1) - .5) * shutter);
    setCtx(sc); compose(tt); setCtx(oc); oc.save(); oc.globalAlpha = 1 / (i + 1); oc.drawImage(sub, 0, 0); oc.restore();
  }
}
