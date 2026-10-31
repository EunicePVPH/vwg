// ---------- SCENE 4a : Murcia + Cartagena (daylight map) ----------
const CITIES4 = [
  { n: 'MADRID', lon: -3.7038, lat: 40.4168, t: 14.0, side: 'r', dy: 0 },
  { n: 'GRANADA', lon: -3.5986, lat: 37.1773, t: 14.0, side: 'r', dy: 0 },
  { n: 'MURCIA', lon: -1.1307, lat: 37.9922, sub: '', t: 15.35, side: 'l', dy: -78 },
  { n: 'CARTAGENA', lon: -0.9863, lat: 37.6, sub: 'ROMAN THEATRE', t: 15.75, side: 'l', dy: 64 },
];
function s4cam(t) { return keyAt([[14.7, -1.95, 37.78, 335, 945], [17.1, -1.85, 37.8, 372, 945]], t); }
function drawS4a(ctx, t) {
  const cam = s4cam(t);
  drawMapBase(ctx, t, cam, 'day');
  const saved = CITIES.slice();
  for (let i = 0; i < 4; i++) CITIES[i] = CITIES4[i];
  drawRoute(ctx, t, cam, 'day', [[0, 1, 14, 14.01, 0.35], [1, 2, 14, 14.01, 0.35], [2, 3, 15.6, 16.1, 1]]);
  drawPinLabel(ctx, t, CITIES4[0], cam, 'day', { noLabel: true, big: 0.55 });
  drawPinLabel(ctx, t, CITIES4[1], cam, 'day', { noLabel: true, big: 0.55 });
  drawPinLabel(ctx, t, CITIES4[3], cam, 'day');
  drawPinLabel(ctx, t, CITIES4[2], cam, 'day');
  for (let i = 0; i < 4; i++) CITIES[i] = saved[i];
  // Roman theatre tiers icon beside Cartagena
  const [x, y] = proj(CITIES4[3].lon, CITIES4[3].lat, cam);
  const ip = E.outBack(prog(t, 16.0, 16.4), 2);
  if (ip > 0) {
    ctx.save(); ctx.translate(x + 66, y + 24); ctx.scale(ip, ip);
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(0, 0, 18 + k * 13, Math.PI, Math.PI * 2); ctx.strokeStyle = k % 2 ? C.cream : C.ink; ctx.lineWidth = 6; ctx.stroke(); }
    ctx.restore();
  }
  const g = ctx.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, 'rgba(246,231,208,0.95)'); g.addColorStop(1, 'rgba(246,231,208,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 720);
}

// ---------- SCENE 4b : new friends (network of 24 nodes) ----------
const NODES = (() => {
  const a = []; for (let i = 0; i < 24; i++) { const ang = i * 2.39996 + 0.4, r = 72 * Math.sqrt(i + 0.8); a.push({ x: 540 + Math.cos(ang) * r, y: 1040 + Math.sin(ang) * r * 0.92, t: 17.0 + i * (0.86 / 24) }); }
  a.forEach((n, i) => { n.e = []; const d = a.slice(0, i).map((m, j) => [Math.hypot(n.x - m.x, n.y - m.y), j]).sort((p, q) => p[0] - q[0]); d.slice(0, i > 4 ? 2 : 1).forEach(([, j]) => n.e.push(j)); });
  return a;
})();
function drawS4b(ctx, t) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(540, 960, 20, 540, 960, 760); g.addColorStop(0, 'rgba(255,196,107,0.65)'); g.addColorStop(1, 'rgba(255,196,107,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(20,12,8,0.07)'; ctx.lineWidth = 2;
  for (let r = 160; r < 1000; r += 130) { ctx.beginPath(); ctx.arc(540, 960, r, 0, 7); ctx.stroke(); }
  const breathe = 1 + 0.04 * Math.sin((t - 17.9) * 6) * prog(t, 17.9, 18.2);
  ctx.save(); ctx.translate(540, 960); ctx.scale(breathe, breathe); ctx.translate(-540, -960);
  NODES.forEach((n, i) => n.e.forEach(j => {
    const m = NODES[j], p = E.outCubic(prog(t, Math.max(n.t, m.t) + 0.05, Math.max(n.t, m.t) + 0.3)); if (p <= 0) return;
    ctx.strokeStyle = 'rgba(20,12,8,0.55)'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(lerp(m.x, n.x, p), lerp(m.y, n.y, p)); ctx.stroke();
  }));
  const cols = [C.orange, C.ink, C.terra, C.amber];
  NODES.forEach((n, i) => {
    const p = E.outBack(prog(t, n.t, n.t + 0.2), 2.4); if (p <= 0) return;
    ctx.save(); ctx.shadowColor = 'rgba(20,12,8,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
    ctx.fillStyle = cols[i % 4]; ctx.strokeStyle = C.paper; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(n.x, n.y, 25 * p, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  });
  ctx.restore();
  g = ctx.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, 'rgba(246,231,208,0.95)'); g.addColorStop(1, 'rgba(246,231,208,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 720);
}

// ---------- SCENE 4c : new perspectives (sunlit terrace view) ----------
const ROOFS = (() => {
  const HMIN = [110, 150, 190];
  const layers = [];
  [[11, 90, 150, 110, 230, '#E9B58C', 0.3], [23, 110, 180, 150, 300, '#D98A55', 0.2], [41, 130, 210, 190, 380, '#A9481F', 0.0]].forEach(([seed, wmin, wmax, hmin, hmax, col, haze], li) => {
    const R = rng(seed), b = []; let x = -240;
    while (x < 1500) { const w = wmin + R() * (wmax - wmin), h = hmin + R() * (hmax - hmin); b.push({ x, w, h, type: Math.floor(R() * 3), win: Math.floor(R() * 3) + 1 }); x += w; }
    layers.push({ b, col, haze, w: 1740, hmin: hmin });
  });
  return layers;
})();
function drawS4c(ctx, t) {
  const sc = t - 18.0, rise = E.inOutCubic(prog(t, 18.0, 21.9));
  const HZ = lerp(1090, 880, rise);
  let g = ctx.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, '#F7C99A'); g.addColorStop(0.6, '#FDE3BF'); g.addColorStop(1, '#FFF1DA');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sy = HZ - 260 + 40 * (1 - rise);
  glowDisc(ctx, 540, sy, 190, 'rgba(255,138,52,1)', 'rgba(255,170,90,1)', 2.6);
  // sea
  g = ctx.createLinearGradient(0, HZ, 0, H); g.addColorStop(0, '#46B3B0'); g.addColorStop(0.5, '#1B7C86'); g.addColorStop(1, '#0C4A57'); ctx.fillStyle = g; ctx.fillRect(0, HZ, W, H - HZ);
  for (let i = 0; i < 26; i++) { const y = HZ + 6 + i * i * 1.6 + i * 6; const wv = (1 - i / 26); ctx.fillStyle = `rgba(255,190,110,${0.5 * wv})`; const w = 340 * wv + 60 + 30 * Math.sin(sc * 3 + i); ctx.fillRect(540 - w / 2, y, w, 3 + i * 0.25); }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, HZ, W, 3);
  // rooftop layers with slow parallax + tilt
  ROOFS.forEach((L, li) => {
    const base = 1560 + (li - 2) * -50 + rise * (60 + li * 90), ox = -sc * (8 + li * 16);
    const shift = ((ox % L.w) + L.w) % L.w - L.w * 0;
    ctx.fillStyle = L.haze ? mixc(L.col, '#FFE9CF', L.haze) : L.col; ctx.fillRect(0, base - L.hmin, W, H);
    for (let rep = -1; rep <= 1; rep++) {
      L.b.forEach(b => {
        const x = b.x + shift + rep * L.w; if (x > W + 10 || x + b.w < -10) return;
        const top = base - b.h, col = L.haze ? mixc(L.col, '#FFE9CF', L.haze) : L.col;
        ctx.fillStyle = col; ctx.fillRect(x, top, b.w, b.h + 400);
        if (b.type === 1) { ctx.beginPath(); ctx.moveTo(x - 6, top); ctx.lineTo(x + b.w / 2, top - b.w * 0.28); ctx.lineTo(x + b.w + 6, top); ctx.fill(); }
        if (b.type === 2) { ctx.fillRect(x - 4, top - 14, b.w + 8, 14); }
        ctx.fillStyle = 'rgba(20,12,8,0.38)';
        for (let k = 0; k < b.win; k++) { const wx = x + (k + 0.5) * b.w / b.win - 11, wy = top + 34 + (k % 2) * 26; ctx.beginPath(); ctx.moveTo(wx, wy + 44); ctx.lineTo(wx, wy + 10); ctx.arc(wx + 11, wy + 10, 11, Math.PI, 0); ctx.lineTo(wx + 22, wy + 44); ctx.fill(); }
      });
    }
    if (li === 1) { // bell tower
      const tx = ((420 + shift) % L.w + L.w) % L.w - 80; ctx.fillStyle = mixc(L.col, '#FFE9CF', L.haze);
      ctx.fillRect(tx, base - 520, 92, 540); ctx.beginPath(); ctx.moveTo(tx - 8, base - 520); ctx.lineTo(tx + 46, base - 600); ctx.lineTo(tx + 100, base - 520); ctx.fill();
      ctx.fillStyle = 'rgba(20,12,8,0.45)'; ctx.beginPath(); ctx.moveTo(tx + 26, base - 440); ctx.lineTo(tx + 26, base - 480); ctx.arc(tx + 46, base - 480, 20, Math.PI, 0); ctx.lineTo(tx + 66, base - 440); ctx.fill();
    }
  });
  g = ctx.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, 'rgba(246,231,208,0.7)'); g.addColorStop(1, 'rgba(246,231,208,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 800);
}

// ---------- SCENE 5 : the big reveal ----------
function drawS5(ctx, t) {
  const sc = t - 21.6, zoom = 1 + 0.07 * prog(sc, 0, 4.6);
  ctx.save(); ctx.translate(540, 1000); ctx.scale(zoom, zoom); ctx.translate(-540, -1000);
  const HZ = 1360;
  let g = ctx.createLinearGradient(0, -200, 0, HZ);
  g.addColorStop(0, '#0E1426'); g.addColorStop(0.35, '#3C1D35'); g.addColorStop(0.62, '#BF4419'); g.addColorStop(0.84, '#FF9A3C'); g.addColorStop(1, '#FFD28A');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, HZ + 200);
  const sunY = lerp(1500, 1355, E.outCubic(prog(sc, 0.1, 3.2)));
  ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, W + 400, HZ + 200); ctx.clip();
  glowDisc(ctx, 540, sunY, 170, 'rgba(255,244,214,1)', 'rgba(255,170,70,1)', 3.6);
  ctx.restore();
  // sea
  g = ctx.createLinearGradient(0, HZ, 0, 1700); g.addColorStop(0, '#6A3022'); g.addColorStop(0.3, '#2A1620'); g.addColorStop(1, '#0B0810'); ctx.fillStyle = g; ctx.fillRect(-200, HZ, W + 400, 700);
  for (let i = 0; i < 22; i++) { const y = HZ + 8 + i * i * 0.9 + i * 8, wv = 1 - i / 22; ctx.fillStyle = `rgba(255,170,80,${0.55 * wv})`; const w = (300 * wv + 40) * (1 + 0.1 * Math.sin(sc * 2.6 + i)); ctx.fillRect(540 - w / 2, y, w, 3 + i * 0.2); }
  // far arcade silhouettes
  ctx.beginPath(); ctx.rect(-200, 1180, W + 400, HZ - 1180 + 40);
  const sp = 300, off = -sc * 18; for (let i = -2; i < 8; i++) archPath(ctx, i * sp + off + sp / 2, HZ + 40, 100, 250);
  ctx.fillStyle = 'rgba(40,16,24,0.92)'; ctx.fill('evenodd');
  // near arch frame
  const bY = 1560; ctx.beginPath(); ctx.rect(-300, -300, W + 600, bY + 300); archPath(ctx, 540, bY, 450, 1180);
  ctx.fillStyle = '#0B0605'; ctx.fill('evenodd');
  ctx.beginPath(); archPath(ctx, 540, bY, 450, 1180); ctx.strokeStyle = 'rgba(255,196,107,0.55)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); archPath(ctx, 540, bY, 484, 1260); ctx.strokeStyle = 'rgba(255,196,107,0.18)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#0B0605'; ctx.fillRect(-200, bY, W + 400, 500);
  ctx.restore();
  // light haze
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; g = ctx.createRadialGradient(540, 1400, 10, 540, 1400, 900); g.addColorStop(0, 'rgba(255,150,60,0.16)'); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  // ---- type
  const sd = { c: 'rgba(0,0,0,0.5)', b: 30, y: 6 };
  const pS = prog(t, 22.0, 22.45), pY = prog(t, 22.12, 22.6);
  letters(ctx, 'SPAIN', 540, 705, { f: F.disp(250), align: 'center', track: 10, color: C.cream, shadow: sd }, (i) => { const p = prog(t, 22.0 + i * 0.045, 22.3 + i * 0.045); return { dy: (1 - E.outExpo(p)) * 160, sc: lerp(1.5, 1, E.outBack(p, 1.4)), alpha: clamp(p * 3) }; });
  letters(ctx, '2027', 540, 940, { f: F.disp(250), align: 'center', track: 14, color: C.amber, shadow: sd }, (i) => { const p = prog(t, 22.18 + i * 0.05, 22.5 + i * 0.05); return { dy: (1 - E.outExpo(p)) * 160, sc: lerp(1.5, 1, E.outBack(p, 1.4)), alpha: clamp(p * 3) }; });
  // date
  const pd = prog(t, 23.95, 24.45);
  if (pd > 0) {
    const dl = 'JULY 12–22, 2027', df = F.sans(64, 700), dw = measure(ctx, dl, df, 6);
    ctx.save(); ctx.fillStyle = C.orange; ctx.fillRect(540 - dw / 2 - 4, 1022, (dw + 8) * E.outExpo(pd), 5); ctx.restore();
    maskLine(ctx, dl, 540, 1010 + 98 * 0, { f: df, align: 'center', track: 6, color: C.cream, shadow: sd }, 0, 70);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 1020, W, 100); ctx.clip();
    text(ctx, dl, 540, 1105 + (1 - E.outExpo(pd)) * 90, { f: df, align: 'center', track: 6, color: C.cream, shadow: sd }); ctx.restore();
  }
  const pp = E.outBack(prog(t, 25.0, 25.4), 2);
  if (pp > 0) {
    const pl = '24 STUDENT SPOTS', pf = F.sans(46, 800), pw = measure(ctx, pl, pf, 5) + 90;
    ctx.save(); ctx.translate(540, 1215); ctx.scale(pp, pp);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    roundRect(ctx, -pw / 2, -50, pw, 100, 50); ctx.fillStyle = C.orange; ctx.fill(); ctx.shadowColor = 'transparent';
    text(ctx, pl, 0, 16, { f: pf, align: 'center', track: 5, color: C.cream }); ctx.restore();
  }
}

// ---------- SCENE 6 : final call to action ----------
function drawS6(ctx, t) {
  const sc = t - 26.0;
  let g = ctx.createRadialGradient(540, 1200, 20, 540, 1200, 1300); g.addColorStop(0, '#9A4216'); g.addColorStop(0.5, '#3D1A0C'); g.addColorStop(1, '#120A07');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // faint Spain outline
  const cam = [-3.3, 39.4, 128, 960];
  ctx.save(); ctx.globalAlpha = 0.9 * E.outCubic(prog(sc, 0.1, 1.2));
  mapPath(ctx, MAP.Spain, cam); ctx.fillStyle = 'rgba(255,242,223,0.045)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,242,223,0.2)'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
  // arch frame drawing in
  const ap = E.outCubic(prog(sc, 0.05, 1.1));
  ctx.save(); ctx.setLineDash([6000, 6000]); ctx.lineDashOffset = 6000 * (1 - ap);
  ctx.beginPath(); archPath(ctx, 540, 1330, 440, 1230); ctx.strokeStyle = 'rgba(255,214,150,0.55)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); archPath(ctx, 540, 1330, 476, 1310); ctx.strokeStyle = 'rgba(255,214,150,0.2)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  // sun glow behind the title
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; g = ctx.createRadialGradient(540, 760, 10, 540, 760, 620); g.addColorStop(0, 'rgba(255,150,60,0.35)'); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  const sd = { c: 'rgba(0,0,0,0.5)', b: 30, y: 6 };
  const p1 = prog(sc, 0.0, 0.45);
  const fS = fitSize(ctx, 'SPAIN 2027', F.disp, 840, 250, 8);
  text(ctx, 'SPAIN 2027', 540, 690, { f: F.disp(fS), align: 'center', track: 8, color: C.cream, shadow: sd, sc: lerp(1.5, 1, E.outExpo(p1)), alpha: clamp(p1 * 4) });
  // tagline
  maskLine(ctx, 'YOUR SUMMER. YOUR STORY.', 540, 800, { f: F.sans(46, 700), align: 'center', track: 6, color: C.amber, shadow: sd }, prog(sc, 0.4, 0.95), 56);
  // CTA pill
  const pc = E.outBack(prog(sc, 0.9, 1.45), 1.9);
  if (pc > 0) {
    const cl = 'DM “2027” TO LEARN MORE', cf = F.sans(52, 800), cw = measure(ctx, cl, cf, 4) + 100;
    ctx.save(); ctx.translate(540, 960); ctx.scale(pc, pc);
    ctx.shadowColor = 'rgba(242,107,29,0.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 12;
    roundRect(ctx, -cw / 2, -62, cw, 124, 62); ctx.fillStyle = C.orange; ctx.fill(); ctx.shadowColor = 'transparent';
    // shimmer sweep
    ctx.save(); roundRect(ctx, -cw / 2, -62, cw, 124, 62); ctx.clip();
    const sx = lerp(-cw, cw, ((sc - 1.5) * 0.55) % 1.6 - 0.3); if (sc > 1.5) { const sg = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(sx - 90, -62, 180, 124); }
    ctx.restore();
    text(ctx, cl, 0, 18, { f: cf, align: 'center', track: 4, color: C.cream });
    ctx.restore();
  }
  // supporting line
  const ps = prog(sc, 1.3, 1.8);
  text(ctx, 'JULY 12–22, 2027  ·  24 STUDENT SPOTS', 540, 1100, { f: F.sans(32, 600), align: 'center', track: 4, color: C.cream, alpha: 0.9 * ps });
  // brand
  const pb = prog(sc, 1.5, 2.1);
  if (pb > 0) {
    ctx.fillStyle = rgba('#FFC46B', 0.9 * pb); ctx.fillRect(540 - 40, 1240, 80 * E.outExpo(pb) , 3);
    text(ctx, 'TOUR ARCHITEX', 540, 1300, { f: F.sans(38, 700), align: 'center', track: 16, color: C.cream, alpha: pb });
  }
  // impact
  const fl = pulse(t, [[26.0, 0.85]], 0.06); if (fl > 0.01) { ctx.fillStyle = `rgba(255,236,200,${clamp(fl)})`; ctx.fillRect(0, 0, W, H); }
  const sr = prog(sc, 0, 0.8); if (sr > 0 && sr < 1) { ctx.strokeStyle = `rgba(255,226,170,${0.8 * (1 - sr)})`; ctx.lineWidth = 16 * (1 - sr) + 2; ctx.beginPath(); ctx.arc(540, 700, 60 + E.outCubic(sr) * 1200, 0, 7); ctx.stroke(); }
}

// ---------- global overlay : kinetic words + captions ----------
function kWord(ctx, word, t, t0, t1, x, y, o, stag = 0.035) {
  if (t < t0 - 0.02 || t > t1 + 0.1) return;
  const out = prog(t, t1 - 0.12, t1 + 0.05);
  letters(ctx, word, x, y, o, (i) => {
    const p = prog(t, t0 + i * stag, t0 + i * stag + 0.24);
    return { dy: (1 - E.outExpo(p)) * 170 + out * -60, sc: lerp(1.35, 1, E.outBack(p, 1.6)), alpha: clamp(p * 3) * (1 - out) };
  });
}
const CAPS = [
  [0.55, 2.85, ['What if this summer took you', 'somewhere extraordinary?']],
  [3.35, 4.85, ["From Madrid's vibrant streets,"]], [5.02, 7.0, ["to Granada's breathtaking Alhambra."]],
  [8.2, 10.0, ["Kayak along Spain's coast."]], [10.55, 12.3, ['Discover ancient cities.']], [12.55, 14.2, ['Dance to new rhythms.']],
  [15.15, 17.1, ['Explore Murcia and Cartagena.']], [17.3, 19.5, ['Make friends. Build confidence.']], [19.65, 21.9, ['Experience a world', 'beyond the classroom.']],
];
function drawCaption(ctx, t) {
  for (const [a, b, lines] of CAPS) {
    if (t < a || t > b) continue;
    const pin = E.outCubic(prog(t, a, a + 0.18)), pout = prog(t, b - 0.14, b), al = pin * (1 - pout);
    const f = F.sans(44, 700), ws = lines.map(l => measure(ctx, l, f, 1)), bw = Math.max(...ws) + 76, bh = lines.length * 58 + 34;
    const cy = 1340 + (1 - pin) * 18;
    ctx.save(); ctx.globalAlpha = al; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    roundRect(ctx, 540 - bw / 2, cy - bh / 2, bw, bh, 22); ctx.fillStyle = 'rgba(20,12,8,0.72)'; ctx.fill(); ctx.shadowColor = 'transparent';
    lines.forEach((l, i) => text(ctx, l, 540, cy - bh / 2 + 17 + 46 + i * 58 - 8, { f, align: 'center', track: 1, color: C.cream }));
    ctx.restore();
  }
}
function drawOverlay(ctx, t) {
  const sd = { c: 'rgba(0,0,0,0.55)', b: 34, y: 6 };
  // scene 2
  kWord(ctx, '4 CITIES.', t, 3.12, 7.95, 84, 480, { f: F.disp(270), color: C.cream, track: 6, shadow: sd });
  if (t >= 4.2 && t < 8.0) { const p = prog(t, 4.2, 4.7), o = prog(t, 7.85, 8.0); maskLine(ctx, 'ONE UNFORGETTABLE JOURNEY.', 90, 570, { f: F.sans(40, 700), color: C.amber, track: 7, alpha: 1 - o }, p, 46); }
  // scene 3
  const tag = (n, a, b, nm) => { if (t > a - 0.02 && t < b + 0.05) { const p = prog(t, a, a + 0.3), o = prog(t, b - 0.1, b); ctx.fillStyle = rgba('#FFC46B', 1 - o); ctx.fillRect(90, 330, 90 * E.outExpo(p), 4); text(ctx, n, 200, 342, { f: F.sans(34, 700), color: C.amber, track: 6, alpha: p * (1 - o) }); } };
  tag('01', 8.1, 10.45); tag('02', 10.55, 12.4); tag('03', 12.5, 14.95);
  const bw = (s) => fitSize(ctx, s, F.disp, 930, 300, 6);
  kWord(ctx, 'EXPLORE.', t, 8.1, 10.4, 84, 640, { f: F.disp(bw('EXPERIENCE.')), color: C.cream, track: 6, shadow: sd });
  kWord(ctx, 'DISCOVER.', t, 10.55, 12.35, 84, 640, { f: F.disp(bw('EXPERIENCE.')), color: C.cream, track: 6, shadow: sd });
  kWord(ctx, 'EXPERIENCE.', t, 12.5, 14.9, 84, 640, { f: F.disp(bw('EXPERIENCE.')), color: C.amber, track: 6, shadow: sd });
  // scene 4
  const ink = { c: 'rgba(255,242,223,0.7)', b: 30, y: 0 };
  const newWord = (w, a, b) => {
    if (t < a - 0.02 || t > b + 0.12) return;
    const pS = prog(t, a, a + 0.4), out = prog(t, b - 0.12, b + 0.05);
    text(ctx, 'new', 90, 392, { f: F.serif(150), color: C.terra, alpha: E.outCubic(pS) * (1 - out), shadow: ink });
    const fs = fitSize(ctx, w, F.disp, 920, 300, 6);
    kWord(ctx, w, t, a + 0.05, b, 84, 640, { f: F.disp(fs), color: C.ink, track: 6, shadow: ink });
  };
  newWord('PLACES.', 15.06, 17.0); newWord('FRIENDS.', 17.06, 18.0); newWord('PERSPECTIVES.', 18.02, 19.5);
  if (t > 19.5 && t < 21.95) {
    const out = prog(t, 21.4, 21.9);
    kWord(ctx, 'MORE THAN', t, 19.5, 22.2, 84, 600, { f: F.disp(250), color: C.ink, track: 6, shadow: ink }, 0.03);
    const p = prog(t, 19.95, 20.4); const o = { f: F.disp(250), track: 6 };
    ctx.save(); ctx.globalAlpha = (1 - out);
    text(ctx, 'A TRIP.', 84, 850 + (1 - E.outExpo(p)) * 120, Object.assign({ color: 'rgba(0,0,0,0)', stroke: { c: C.ink, w: 4 }, noFill: false, alpha: E.outCubic(p) }, o));
    const sp = E.outExpo(prog(t, 20.7, 21.0)); ctx.fillStyle = C.orange; ctx.fillRect(70, 760, 620 * sp, 16);
    ctx.restore();
  }
  drawCaption(ctx, t);
}

// ---------- compositor ----------
const SCN = [drawS1, drawS2, drawS3a, drawS3b1, drawS3b2, drawS3c, drawS4a, drawS4b, drawS4c, drawS5, drawS6];
const TR = [
  { a: 2.72, b: 3.12, type: 'iris' }, { a: 7.86, b: 8.10, type: 'whip', d: 1 }, { a: 10.30, b: 10.52, type: 'whip', d: 1 },
  { a: 11.40, b: 11.60, type: 'whip', d: -1 }, { a: 12.34, b: 12.52, type: 'whip', d: 1 }, { a: 14.78, b: 15.06, type: 'band' },
  { a: 16.82, b: 17.06, type: 'iris' }, { a: 17.82, b: 18.02, type: 'whip', d: 1 }, { a: 21.52, b: 21.95, type: 'diag' }, { a: 25.96, b: 26.04, type: 'flash' },
];
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
let cvs, mctx, LA, LB, SUB, ACC, GR;
function inTransition(t) { for (let j = 0; j < TR.length; j++) if (t >= TR[j].a && t <= TR[j].b) return j; return -1; }
function composite(sctx, t) {
  const j = inTransition(t);
  if (j < 0) {
    let i = 0; for (let k = 0; k < TR.length; k++) if (t > TR[k].b) i = k + 1;
    SCN[i](sctx, t);
  } else {
    const T = TR[j], p = prog(t, T.a, T.b), a = LA.getContext('2d'), b = LB.getContext('2d');
    a.save(); SCN[j](a, t); a.restore(); b.save(); SCN[j + 1](b, t); b.restore();
    if (T.type === 'whip') {
      const e = E.inOutCubic(p), blur = 14 * Math.sin(Math.PI * p);
      sctx.save(); sctx.filter = `blur(${blur.toFixed(1)}px)`;
      sctx.drawImage(LA, -T.d * e * W, 0); sctx.drawImage(LB, T.d * (1 - e) * W, 0); sctx.restore();
    } else if (T.type === 'iris') {
      const e = E.inOutCubic(p), R = e * 2300, cy = j === 0 ? 1040 : 1000;
      sctx.drawImage(LA, 0, 0);
      sctx.save(); sctx.beginPath(); sctx.arc(540, cy, R, 0, 7); sctx.clip(); sctx.drawImage(LB, 0, 0); sctx.restore();
      sctx.strokeStyle = `rgba(255,214,150,${1 - p})`; sctx.lineWidth = 16 * (1 - p) + 2; sctx.beginPath(); sctx.arc(540, cy, R, 0, 7); sctx.stroke();
    } else if (T.type === 'band') {
      const e = E.inOutCubic(p), yc = lerp(H + 300, -300, e);
      sctx.drawImage(LA, 0, 0);
      sctx.save(); sctx.beginPath(); sctx.moveTo(0, yc + 160); sctx.lineTo(W, yc - 160); sctx.lineTo(W, H + 10); sctx.lineTo(0, H + 10); sctx.closePath(); sctx.clip(); sctx.drawImage(LB, 0, 0); sctx.restore();
      sctx.save(); sctx.fillStyle = C.orange; sctx.beginPath(); sctx.moveTo(0, yc + 160); sctx.lineTo(W, yc - 160); sctx.lineTo(W, yc - 160 - 70); sctx.lineTo(0, yc + 160 - 70); sctx.closePath(); sctx.fill(); sctx.restore();
    } else if (T.type === 'diag') {
      const e = E.inOutCubic(p), xc = lerp(-500, W + 700, e);
      sctx.drawImage(LA, 0, 0);
      sctx.save(); sctx.beginPath(); sctx.moveTo(0, 0); sctx.lineTo(xc + 260, 0); sctx.lineTo(xc - 260, H); sctx.lineTo(0, H); sctx.closePath(); sctx.clip(); sctx.drawImage(LB, 0, 0); sctx.restore();
      sctx.save(); sctx.fillStyle = C.orange; sctx.beginPath(); sctx.moveTo(xc + 260, 0); sctx.lineTo(xc + 260 + 90, 0); sctx.lineTo(xc - 260 + 90, H); sctx.lineTo(xc - 260, H); sctx.closePath(); sctx.fill(); sctx.restore();
    } else { sctx.drawImage(p < 0.5 ? LA : LB, 0, 0); }
  }
  drawOverlay(sctx, t);
}
function renderFrame(t, frameIdx) {
  const tr = inTransition(t) >= 0;
  const N = tr ? 8 : 4, shutter = (tr ? 0.9 : 0.5) / FPS, sctx = SUB.getContext('2d'), actx = ACC.getContext('2d');
  for (let i = 0; i < N; i++) {
    const tt = t + ((i + 0.5) / N - 0.5) * shutter;
    sctx.save(); sctx.clearRect(0, 0, W, H); composite(sctx, tt); sctx.restore();
    actx.globalAlpha = 1 / (i + 1); actx.drawImage(SUB, 0, 0);
  }
  actx.globalAlpha = 1;
  mctx.globalCompositeOperation = 'source-over'; mctx.globalAlpha = 1; mctx.drawImage(ACC, 0, 0);
  // grade: warm tint + vignette + grain
  mctx.save(); mctx.globalCompositeOperation = 'soft-light'; mctx.fillStyle = 'rgba(255,170,90,0.10)'; mctx.fillRect(0, 0, W, H); mctx.restore();
  const vg = mctx.createRadialGradient(540, 960, 520, 540, 960, 1250); vg.addColorStop(0, 'rgba(10,5,2,0)'); vg.addColorStop(1, 'rgba(10,5,2,0.42)'); mctx.fillStyle = vg; mctx.fillRect(0, 0, W, H);
  const R = rng(frameIdx * 7919 + 13); const ox = Math.floor(R() * 256), oy = Math.floor(R() * 256);
  mctx.save(); mctx.globalAlpha = 0.085; mctx.globalCompositeOperation = 'overlay'; mctx.translate(-ox, -oy); mctx.fillStyle = mctx.createPattern(GR, 'repeat'); mctx.fillRect(ox, oy, W, H); mctx.restore();
}
async function initRenderer() {
  cvs = document.getElementById('cv'); mctx = cvs.getContext('2d');
  LA = mk(); LB = mk(); SUB = mk(); ACC = mk(); GR = document.createElement('canvas'); GR.width = GR.height = 256;
  const g = GR.getContext('2d'), id = g.createImageData(256, 256), R = rng(99);
  for (let i = 0; i < id.data.length; i += 4) { const v = Math.floor(R() * 255); id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  await Promise.all(['100px "Bebas Neue"', '700 40px "League Spartan"', '800 40px "League Spartan"', 'italic 500 40px "EB Garamond"', '600 40px "Montserrat"'].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  window.renderFrame = renderFrame; window.READY = true;
}
