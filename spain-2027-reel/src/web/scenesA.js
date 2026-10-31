// ---------- SCENE 1 : the hook (arch tunnel) ----------
function s1cam(t) { return 8.5 * E.outCubic(clamp(t / 2.7)) + 0.35 * t; }
function drawS1(ctx, t) {
  const HZ = 1040;
  ctx.save();
  const sh = pulse(t, [[0, 1], [1.5, 0.7]], 0.09);
  ctx.translate(Math.sin(t * 90) * 16 * sh, Math.cos(t * 77) * 16 * sh);
  let g = ctx.createRadialGradient(540, HZ, 10, 540, HZ, 1400);
  g.addColorStop(0, '#FFE6A8'); g.addColorStop(0.16, '#FFA83F'); g.addColorStop(0.5, '#B0401A'); g.addColorStop(1, '#2A0F08');
  ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, H + 120);
  // sun disc
  glowDisc(ctx, 540, HZ - 10, 120, 'rgba(255,244,214,1)', 'rgba(255,170,60,1)', 3.2);
  // floor
  g = ctx.createLinearGradient(0, HZ, 0, H);
  g.addColorStop(0, '#FFB458'); g.addColorStop(0.2, '#A8421B'); g.addColorStop(1, '#1C0B06');
  ctx.fillStyle = g; ctx.fillRect(-60, HZ, W + 120, H - HZ + 60);
  // floor perspective lines
  ctx.strokeStyle = 'rgba(255,200,120,0.18)'; ctx.lineWidth = 3;
  for (let i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(540, HZ); ctx.lineTo(540 + i * 260, H + 50); ctx.stroke(); }
  const cam = s1cam(t), first = Math.floor(cam) + 1;
  for (let k = 11; k >= 0; k--) {
    const i = first + k, rel = i - cam;
    if (rel < 0.2) continue;
    const s = 1 / rel, n = 360 * s, r = n / 0.86, hgt = 2.5 * r, baseY = HZ + 300 * s;
    const fog = Math.pow(clamp((rel - 1.0) / 8.5), 0.75);
    const wc = mixc(i % 2 ? '#2A0E06' : '#3C1609', '#FF9A3C', fog);
    ctx.beginPath(); ctx.rect(-80, -80, W + 160, baseY + 80); archPath(ctx, 540, baseY, n, hgt);
    const wg = ctx.createLinearGradient(0, baseY - hgt, 0, baseY);
    wg.addColorStop(0, mixc('#160804', '#FF9A3C', fog)); wg.addColorStop(1, wc);
    ctx.fillStyle = wg; ctx.fill('evenodd');
    // lit rim of the arch
    ctx.save();
    ctx.beginPath(); archPath(ctx, 540, baseY, n, hgt);
    ctx.shadowColor = 'rgba(255,150,50,0.9)'; ctx.shadowBlur = 40 * s;
    ctx.strokeStyle = rgba('#FFC46B', 0.95 - fog * 0.6); ctx.lineWidth = Math.max(2, 9 * s); ctx.stroke();
    ctx.restore();
    ctx.beginPath(); archPath(ctx, 540, baseY, n * 0.9, hgt * 0.93);
    ctx.strokeStyle = rgba('#FFE2A8', 0.5 * (1 - fog)); ctx.lineWidth = Math.max(1, 3 * s); ctx.stroke();
  }
  // god rays
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.2 + t * 0.03, len = 1500;
    const rg = ctx.createLinearGradient(540, HZ, 540 + Math.cos(a) * len, HZ + Math.sin(a) * len);
    rg.addColorStop(0, 'rgba(255,190,90,0.20)'); rg.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(540, HZ);
    ctx.lineTo(540 + Math.cos(a - 0.05) * len, HZ + Math.sin(a - 0.05) * len);
    ctx.lineTo(540 + Math.cos(a + 0.05) * len, HZ + Math.sin(a + 0.05) * len); ctx.fill();
  }
  ctx.restore();
  // darken top for type contrast
  g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, 'rgba(20,8,4,0.55)'); g.addColorStop(1, 'rgba(20,8,4,0)');
  ctx.fillStyle = g; ctx.fillRect(-60, 0, W + 120, 900);
  ctx.restore();
  // ---- kinetic type
  const sd = { c: 'rgba(20,8,4,0.55)', b: 40, y: 8 };
  const pe = E.inExpo(prog(t, 1.38, 1.68));
  const p1 = prog(t, -0.14, 0.30), p2 = prog(t, -0.02, 0.40);
  if (pe < 1) {
    const f = F.disp(360);
    text(ctx, 'SUMMER', 540, 560, { f, align: 'center', track: 6, color: C.cream, shadow: sd, sc: lerp(1.9, 1, E.outExpo(p1)) + pe * 1.8, alpha: clamp(p1 * 4) * (1 - pe) });
    text(ctx, '2027.', 540, 880, { f, align: 'center', track: 6, color: C.amber, shadow: sd, sc: lerp(1.9, 1, E.outExpo(p2)) + pe * 1.8, alpha: clamp(p2 * 4) * (1 - pe) });
  }
  const pg = prog(t, 1.5, 1.9);
  if (pg > 0) {
    const fo = 1 - prog(t, 2.78, 3.05);
    const fs = fitSize(ctx, 'BIGGER.', F.disp, 930, 330, 4);
    const a = E.outExpo(pg), b = E.outBack(prog(t, 1.56, 1.98), 2.2);
    text(ctx, 'GO', 540 - (1 - a) * 700, 600, { f: F.disp(440), align: 'center', track: 6, color: C.cream, shadow: sd, sc: lerp(1.0, 1, b), alpha: fo });
    text(ctx, 'BIGGER.', 540 + (1 - a) * 700, 880, { f: F.disp(fs), align: 'center', track: 4, color: C.amber, shadow: sd, sc: lerp(1.3, 1, b), alpha: fo });
  }
  // impact flash + shock ring
  const fl = pulse(t, [[0, 0.0], [1.5, 0.55]], 0.07);
  if (fl > 0.01) { ctx.fillStyle = `rgba(255,236,200,${clamp(fl)})`; ctx.fillRect(0, 0, W, H); }
  const sr = prog(t, 1.5, 1.95);
  if (sr > 0 && sr < 1) { ctx.strokeStyle = `rgba(255,226,170,${0.8 * (1 - sr)})`; ctx.lineWidth = 12 * (1 - sr) + 2; ctx.beginPath(); ctx.arc(540, 760, 80 + E.outCubic(sr) * 1100, 0, Math.PI * 2); ctx.stroke(); }
}

// ---------- SCENE 2 : the map ----------
const CITIES = [
  { n: 'MADRID', lon: -3.7038, lat: 40.4168, sub: 'THE CAPITAL', t: 3.5, side: 'r', dy: -4 },
  { n: 'GRANADA', lon: -3.5986, lat: 37.1773, sub: 'THE ALHAMBRA', t: 5.12, side: 'r', dy: -2, fo: [6.85, 7.15] },
  { n: 'MURCIA', lon: -1.1307, lat: 37.9922, sub: '', t: 6.4, side: 'l', dy: -78 },
  { n: 'CARTAGENA', lon: -0.9863, lat: 37.6, sub: 'ROMAN THEATRE', t: 7.0, side: 'l', dy: 50 },
];
const ROUTE = [[0, 1, 3.65, 5.08], [1, 2, 5.4, 6.3], [2, 3, 6.6, 6.95]];
const KS = Math.cos(40 * Math.PI / 180);
function proj(lon, lat, cam) { return [W / 2 + (lon - cam[0]) * KS * cam[2], cam[3] - (lat - cam[1]) * cam[2]]; }
function mapPath(ctx, rings, cam) {
  ctx.beginPath();
  for (const poly of rings) for (const ring of poly) { ring.forEach(([lo, la], i) => { const [x, y] = proj(lo, la, cam); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
}
function drawMapBase(ctx, t, cam, theme) {
  const night = theme === 'night';
  if (night) {
    const g = ctx.createRadialGradient(540, 960, 100, 540, 960, 1300); g.addColorStop(0, '#0F5967'); g.addColorStop(1, '#04202A');
    ctx.fillStyle = g;
  } else ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  // graticule
  ctx.strokeStyle = night ? 'rgba(255,242,223,0.07)' : 'rgba(20,12,8,0.08)'; ctx.lineWidth = 2;
  for (let lo = -12; lo <= 6; lo += 1) { const [x] = proj(lo, 40, cam); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let la = 33; la <= 46; la += 1) { const [, y] = proj(-3, la, cam); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // neighbours
  for (const k of ['Portugal', 'France', 'Morocco', 'Algeria', 'Andorra']) {
    mapPath(ctx, MAP[k], cam);
    ctx.fillStyle = night ? '#134F5B' : '#EBD6B2'; ctx.fill();
    ctx.strokeStyle = night ? 'rgba(255,242,223,0.14)' : 'rgba(20,12,8,0.14)'; ctx.lineWidth = 2; ctx.stroke();
  }
  // coastal ripples + shadow
  mapPath(ctx, MAP.Spain, cam);
  ctx.save(); ctx.lineJoin = 'round';
  for (const [w, a] of [[56, 0.05], [34, 0.07], [16, 0.10]]) { ctx.lineWidth = w; ctx.strokeStyle = night ? `rgba(255,242,223,${a})` : `rgba(242,107,29,${a})`; ctx.stroke(); }
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  const sg = ctx.createLinearGradient(0, 400, 0, 1500);
  if (night) { sg.addColorStop(0, '#F6E3C2'); sg.addColorStop(1, '#E5B77C'); } else { sg.addColorStop(0, '#F5893A'); sg.addColorStop(1, '#E3550B'); }
  ctx.fillStyle = sg; ctx.fill(); ctx.restore();
  // hatch texture on land
  ctx.save(); mapPath(ctx, MAP.Spain, cam); ctx.clip();
  ctx.strokeStyle = night ? 'rgba(140,70,20,0.10)' : 'rgba(255,242,223,0.12)'; ctx.lineWidth = 2;
  for (let i = -30; i < 60; i++) { ctx.beginPath(); ctx.moveTo(i * 36, 0); ctx.lineTo(i * 36 + 1400, 1400 * 1.0 + 520); ctx.stroke(); }
  ctx.restore();
  mapPath(ctx, MAP.Spain, cam); ctx.strokeStyle = night ? 'rgba(255,255,255,0.9)' : C.cream; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.stroke();
  // sea labels
  const lab = (s, lo, la, rot) => { const [x, y] = proj(lo, la, cam); text(ctx, s, x, y, { f: F.sans(24, 600), track: 8, align: 'center', color: night ? 'rgba(255,242,223,0.28)' : 'rgba(20,12,8,0.28)', rot }); };
  lab('MEDITERRANEAN SEA', 0.8, 37.7, 0.0); lab('ATLANTIC OCEAN', -9.6, 36.5, -1.2);
}
function routePoint(a, b, p, cam) {
  const A = proj(a.lon, a.lat, cam), B = proj(b.lon, b.lat, cam);
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * L * 0.14, cy = my + dx / L * L * 0.14;
  const u = 1 - p; return [u * u * A[0] + 2 * u * p * cx + p * p * B[0], u * u * A[1] + 2 * u * p * cy + p * p * B[1]];
}
function drawRoute(ctx, t, cam, theme, legs) {
  const night = theme === 'night';
  for (const [i, j, t0, t1, alpha = 1] of legs) {
    const p = E.inOutCubic(prog(t, t0, t1)); if (p <= 0) continue;
    ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = alpha;
    ctx.beginPath(); for (let s = 0; s <= 48; s++) { const q = routePoint(CITIES[i], CITIES[j], p * s / 48, cam); s ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
    ctx.shadowColor = night ? 'rgba(242,107,29,0.9)' : 'rgba(20,12,8,0.3)'; ctx.shadowBlur = night ? 24 : 8;
    ctx.strokeStyle = night ? C.orange : C.ink; ctx.lineWidth = 7; ctx.setLineDash([1, 20]); ctx.stroke();
    const q = routePoint(CITIES[i], CITIES[j], p, cam);
    if (p < 1) { ctx.setLineDash([]); ctx.fillStyle = C.cream; ctx.shadowColor = C.orange; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(q[0], q[1], 13, 0, 7); ctx.fill(); }
    ctx.restore();
  }
}
function drawPinLabel(ctx, t, c, cam, theme, o = {}) {
  const night = theme === 'night';
  const ap = prog(t, c.t, c.t + 0.45); if (ap <= 0) return;
  const [x, y] = proj(c.lon, c.lat, cam);
  const big = o.big == null ? 1 : o.big;
  // pulse rings
  for (let k = 0; k < 2; k++) {
    const q = ((t - c.t) * 0.9 + k * 0.5) % 1; if (t < c.t) break;
    ctx.strokeStyle = rgba(night ? '#FFC46B' : '#140C08', 0.55 * (1 - q)); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, (16 + q * 54) * big, 0, 7); ctx.stroke();
  }
  const pr = E.outBack(prog(t, c.t, c.t + 0.3), 3) * big;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.fillStyle = night ? C.orange : C.ink; ctx.strokeStyle = C.cream; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(x, y, 17 * pr, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  if (o.noLabel) return;
  // label card
  const labA = c.fo ? 1 - prog(t, c.fo[0], c.fo[1]) : 1; if (labA <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= labA;
  const nf = F.sans(48, 800), sf = F.sans(23, 700);
  const nw = measure(ctx, c.n, nf, 5), sw = c.sub ? measure(ctx, c.sub, sf, 5) : 0;
  const bw = Math.max(nw, sw) + 62, bh = c.sub ? 108 : 80;
  const left = c.side === 'r' ? x + 44 : x - 44 - bw, top = y + c.dy - bh / 2;
  const lp = E.outExpo(prog(t, c.t + 0.08, c.t + 0.5));
  ctx.save();
  ctx.beginPath();
  if (c.side === 'r') ctx.rect(left - 4, top - 10, bw * lp + 8, bh + 20); else ctx.rect(left + bw * (1 - lp) - 4, top - 10, bw * lp + 8, bh + 20);
  ctx.clip();
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  roundRect(ctx, left, top, bw, bh, 14); ctx.fillStyle = night ? 'rgba(20,12,8,0.86)' : 'rgba(255,242,223,0.95)'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.orange; ctx.fillRect(c.side === 'r' ? left : left + bw - 8, top, 8, bh);
  const tx = left + 31 + (c.side === 'r' ? 4 : 0);
  text(ctx, c.n, tx, top + (c.sub ? 50 : 54), { f: nf, track: 5, color: night ? C.cream : C.ink });
  if (c.sub) text(ctx, c.sub, tx, top + 88, { f: sf, track: 5, color: night ? C.amber : C.terra });
  ctx.restore();
  // leader
  ctx.strokeStyle = night ? C.cream : C.ink; ctx.lineWidth = 3; ctx.beginPath();
  const sx = c.side === 'r' ? x + 20 : x - 20, ex = c.side === 'r' ? left : left + bw;
  ctx.moveTo(sx, y); ctx.lineTo(sx + (ex - sx) * lp, y + (top + bh / 2 - y) * lp); ctx.stroke();
  ctx.restore();
}
function s2cam(t) { return keyAt([[2.7, -3.3, 40.0, 92, 1000], [4.3, -3.4, 39.6, 108, 1020], [5.3, -3.65, 38.8, 148, 950], [6.2, -3.0, 38.2, 230, 985], [7.9, -1.95, 37.78, 335, 960]], t); }
function drawS2(ctx, t) {
  const cam = s2cam(t);
  drawMapBase(ctx, t, cam, 'night');
  drawRoute(ctx, t, cam, 'night', ROUTE);
  // draw lower cities first so labels overlap sensibly
  [3, 2, 1, 0].forEach(i => drawPinLabel(ctx, t, CITIES[i], cam, 'night'));
  // top scrim for the title
  const g = ctx.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(4,22,28,1)'); g.addColorStop(0.62, 'rgba(4,22,28,0.94)'); g.addColorStop(1, 'rgba(4,22,28,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 820);
}

// ---------- SCENE 3a : the coast & kayak ----------
function drawS3a(ctx, t) {
  const sc = t - 8.0, travel = sc * 520;
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16899A'); g.addColorStop(0.55, '#0E6573'); g.addColorStop(1, '#08404B');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const a0 = Math.floor(-travel / 130) - 2;
  for (let a = a0; a < a0 + 18; a++) {
    const y = a * 130 + travel;
    ctx.beginPath(); ctx.moveTo(-10, y);
    for (let x = -10; x <= W + 10; x += 30) ctx.lineTo(x, y + 26 * Math.sin(x * 0.010 + a * 1.37 + sc * 1.8));
    for (let x = W + 10; x >= -10; x -= 30) ctx.lineTo(x, y + 66 + 26 * Math.sin(x * 0.010 + a * 1.37 + 0.6 + sc * 1.8));
    ctx.closePath(); ctx.fillStyle = `rgba(255,255,255,${0.035 + 0.03 * ((a & 1) ? 1 : 0)})`; ctx.fill();
  }
  // sun glints
  const R = rng(7); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 110; i++) {
    const x = R() * W, yw = R() * H * 1.4, ph = R() * 6.28, y = ((yw + travel) % (H * 1.4)) - 120;
    const a = Math.pow(Math.max(0, Math.sin(sc * 7 + ph)), 3) * 0.75; if (a < 0.03) continue;
    ctx.fillStyle = `rgba(255,226,160,${a})`; ctx.beginPath(); ctx.ellipse(x, y, 20 + R() * 16, 4, 0, 0, 7); ctx.fill();
  }
  ctx.restore();
  // coast on the right
  const edge = y => 905 - 70 * Math.sin((y - travel) * 0.0045) - 38 * Math.sin((y - travel) * 0.013 + 1);
  for (const [dx, col, al] of [[-52, '#FFFFFF', 0.18], [-28, '#FFFFFF', 0.35], [-10, '#FFFFFF', 0.75]]) {
    ctx.beginPath(); for (let y = -60; y <= H + 60; y += 24) { const x = edge(y) + dx + 10 * Math.sin(sc * 2.2 + y * 0.02); y === -60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.strokeStyle = rgba(col, al); ctx.lineWidth = 8; ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(W + 40, -60); for (let y = -60; y <= H + 60; y += 24) ctx.lineTo(edge(y), y); ctx.lineTo(W + 40, H + 60); ctx.closePath();
  const sg = ctx.createLinearGradient(850, 0, W, 0); sg.addColorStop(0, '#F3DDB8'); sg.addColorStop(0.55, '#E2B07C'); sg.addColorStop(1, '#B7622E');
  ctx.fillStyle = sg; ctx.fill();
  // kayak
  const ky = 1130 + 8 * Math.sin(sc * 3), sway = 0.06 * Math.sin(sc * 2.4);
  // wake
  ctx.save(); ctx.translate(500, ky); ctx.rotate(sway);
  for (const sgn of [-1, 1]) {
    const wg = ctx.createLinearGradient(0, 230, sgn * 330, 930); wg.addColorStop(0, 'rgba(255,255,255,0.75)'); wg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = wg; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sgn * 34, 220);
    ctx.quadraticCurveTo(sgn * 120, 520, sgn * 360, 930); ctx.stroke();
  }
  // shadow
  ctx.fillStyle = 'rgba(0,30,40,0.35)'; ctx.beginPath(); ctx.ellipse(18, 22, 78, 270, 0, 0, 7); ctx.fill();
  // hull
  ctx.beginPath(); ctx.moveTo(0, -275); ctx.bezierCurveTo(78, -130, 78, 130, 0, 275); ctx.bezierCurveTo(-78, 130, -78, -130, 0, -275);
  const hg = ctx.createLinearGradient(-78, 0, 78, 0); hg.addColorStop(0, '#C73E0F'); hg.addColorStop(0.5, '#FF7A2B'); hg.addColorStop(1, '#C73E0F');
  ctx.fillStyle = hg; ctx.fill(); ctx.strokeStyle = C.cream; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -240); ctx.bezierCurveTo(46, -120, 46, 120, 0, 240); ctx.strokeStyle = 'rgba(255,242,223,0.55)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(0, 20, 40, 78, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#0E4C57'; ctx.beginPath(); ctx.ellipse(0, 16, 54, 26, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#F3DDB8'; ctx.beginPath(); ctx.arc(0, 14, 19, 0, 7); ctx.fill();
  // paddle (across the hull, swinging with each stroke)
  const ph = sc * Math.PI * 2 / 0.95, th = 0.55 * Math.sin(ph);
  ctx.save(); ctx.translate(0, 16); ctx.rotate(th);
  ctx.strokeStyle = '#2B1A10'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-330, 0); ctx.lineTo(330, 0); ctx.stroke();
  for (const sgn of [-1, 1]) { ctx.fillStyle = sgn > 0 ? '#FFC46B' : '#FFF2DF'; ctx.beginPath(); ctx.ellipse(sgn * 330, 0, 78, 30, 0, 0, 7); ctx.fill(); }
  ctx.restore();
  // ripples where the blades touch the water
  for (const sgn of [-1, 1]) {
    const rp = ((ph / (2 * Math.PI)) + (sgn > 0 ? 0 : 0.5)) % 1;
    const bx = sgn * 330 * Math.cos(th), by = 16 + sgn * 330 * Math.sin(th);
    ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - rp)})`; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(bx, by, 24 + rp * 100, (24 + rp * 100) * 0.55, 0, 0, 7); ctx.stroke();
  }
  ctx.restore();
  // vignette for contrast of type
  g = ctx.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, 'rgba(4,28,36,0.6)'); g.addColorStop(1, 'rgba(4,28,36,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 800);
}

// ---------- SCENE 3b1 : Alhambra-style arcade ----------
function starLattice(ctx, x0, y0, w, h, g, ox, al) {
  ctx.strokeStyle = `rgba(255,214,140,${al})`; ctx.lineWidth = 2.5;
  for (let cx = -ox % g - g; cx < w + g; cx += g) for (let cy = 0; cy < h + g; cy += g) {
    for (const rot of [0, Math.PI / 4]) {
      ctx.save(); ctx.translate(x0 + cx + g / 2, y0 + cy + g / 2); ctx.rotate(rot); ctx.strokeRect(-g * 0.3, -g * 0.3, g * 0.6, g * 0.6); ctx.restore();
    }
  }
}
function arcadeLayer(ctx, baseY, n, hgt, spacing, offset, wallTop, color, al, lattice) {
  const first = Math.floor((-offset - n) / spacing) - 1, cnt = Math.ceil(W / spacing) + 3;
  ctx.beginPath(); ctx.rect(-10, wallTop, W + 20, baseY - wallTop);
  for (let i = first; i < first + cnt; i++) archPath(ctx, i * spacing + offset + spacing / 2, baseY, n, hgt);
  ctx.save(); ctx.fillStyle = color; ctx.fill('evenodd');
  if (lattice) { ctx.clip('evenodd'); starLattice(ctx, 0, wallTop, W, baseY - wallTop, lattice, offset, al); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = rgba('#FFD590', 0.8); ctx.lineWidth = 6; ctx.shadowColor = 'rgba(255,170,70,.8)'; ctx.shadowBlur = 20;
  for (let i = first; i < first + cnt; i++) { ctx.beginPath(); archPath(ctx, i * spacing + offset + spacing / 2, baseY, n, hgt); ctx.stroke(); }
  ctx.restore();
}
function drawS3b1(ctx, t) {
  const sc = t - 10.3;
  let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#F08A38'); g.addColorStop(0.5, '#FFD9A0'); g.addColorStop(1, '#FFB35A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glowDisc(ctx, 700, 760, 110, 'rgba(255,248,226,1)', 'rgba(255,200,110,1)', 3);
  // far arcade
  arcadeLayer(ctx, 1420, 130, 400, 330, -sc * 110, 560, '#B8541F', 0.35, 90);
  // mid arcade
  arcadeLayer(ctx, 1500, 205, 640, 520, -sc * 260, -20, '#7A2F13', 0.28, 120);
  // floor
  g = ctx.createLinearGradient(0, 1480, 0, H); g.addColorStop(0, '#E39A4C'); g.addColorStop(0.15, '#8E3C18'); g.addColorStop(1, '#1E0C06'); ctx.fillStyle = g; ctx.fillRect(0, 1500, W, H - 1500);
  ctx.fillStyle = 'rgba(255,214,140,0.25)'; ctx.fillRect(0, 1500, W, 5);
  // foreground columns (blurred, fast parallax)
  ctx.save(); ctx.filter = 'blur(5px)';
  const sp = 1000, off = -sc * 620 + 80;
  for (let i = -1; i < 3; i++) {
    const x = ((i * sp + off) % (sp * 2)) + 0; const cx = ((x % (sp * 2)) + sp * 2) % (sp * 2) - 200;
    ctx.fillStyle = '#170A05'; ctx.fillRect(cx - 75, -20, 150, H + 40);
    ctx.fillStyle = '#2A1209'; ctx.fillRect(cx - 105, 260, 210, 70);
  }
  ctx.restore();
  // light beam
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const bg = ctx.createLinearGradient(1000, 0, 200, 1500); bg.addColorStop(0, 'rgba(255,200,120,0.28)'); bg.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(760, 0); ctx.lineTo(1080, 0); ctx.lineTo(300, 1500); ctx.lineTo(-100, 1500); ctx.fill(); ctx.restore();
  g = ctx.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, 'rgba(26,10,4,0.65)'); g.addColorStop(1, 'rgba(26,10,4,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 800);
}

// ---------- SCENE 3b2 : Roman theatre ----------
function drawS3b2(ctx, t) {
  const sc = t - 11.4;
  ctx.fillStyle = '#1A0D08'; ctx.fillRect(0, 0, W, H);
  ctx.save();
  const z = lerp(1.0, 1.28, E.outCubic(prog(sc, 0, 1.4))), rot = lerp(-0.16, 0.05, E.outCubic(prog(sc, 0, 1.4)));
  ctx.translate(540, 1150); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-540, -1150);
  const cx = 540, cy = 1150;
  // stage
  ctx.fillStyle = '#6B3418'; ctx.fillRect(cx - 330, cy + 20, 660, 200);
  ctx.strokeStyle = 'rgba(255,214,140,0.5)'; ctx.lineWidth = 4;
  for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(cx - 330 + i * 82.5, cy + 20); ctx.lineTo(cx - 330 + i * 82.5, cy + 220); ctx.stroke(); }
  // orchestra
  ctx.fillStyle = '#E7C58E'; ctx.beginPath(); ctx.arc(cx, cy, 200, Math.PI, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(140,80,30,0.35)'; ctx.lineWidth = 3;
  for (let r = 40; r < 200; r += 40) { ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI * 2); ctx.stroke(); }
  // cavea rings
  for (let k = 0; k < 9; k++) {
    const p = E.outCubic(prog(sc, k * 0.05, k * 0.05 + 0.4)); if (p <= 0) continue;
    const r0 = 216 + k * 80, r1 = r0 + 64;
    ctx.beginPath(); ctx.arc(cx, cy, r0 + (r1 - r0), Math.PI, Math.PI * 2); ctx.arc(cx, cy, r0, Math.PI * 2, Math.PI, true); ctx.closePath();
    ctx.globalAlpha = p; ctx.fillStyle = k % 2 ? '#B6551F' : '#D2692F'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,190,0.35)'; ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = 'rgba(26,13,8,0.8)'; ctx.lineWidth = 8;
  for (let j = 1; j < 8; j++) { const a = Math.PI + j * Math.PI / 8; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 216, cy + Math.sin(a) * 216); ctx.lineTo(cx + Math.cos(a) * 960, cy + Math.sin(a) * 960); ctx.stroke(); }
  // sweeping light
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const aw = Math.PI + Math.PI * E.inOutCubic(prog(sc, 0.05, 1.25));
  const lg = ctx.createRadialGradient(cx, cy, 200, cx, cy, 1000); lg.addColorStop(0, 'rgba(255,214,140,0.5)'); lg.addColorStop(1, 'rgba(255,214,140,0.05)');
  ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 1000, aw - 0.22, aw + 0.22); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
  const g = ctx.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, 'rgba(10,4,2,0.75)'); g.addColorStop(1, 'rgba(10,4,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 800);
}

// ---------- SCENE 3c : rhythm (flamenco palmas) ----------
function drawS3c(ctx, t) {
  const sc = t - 12.4, claps = EV.claps.filter(c => c[1] >= 0.9).map(c => [c[0], c[1]]);
  const all = EV.claps.map(c => [c[0], c[1]]);
  let g = ctx.createRadialGradient(540, 1000, 50, 540, 1000, 1300); g.addColorStop(0, '#6A1218'); g.addColorStop(1, '#1B0709');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const pAcc = pulse(t, claps, 0.16), pAny = pulse(t, all, 0.10);
  // rotation steps on each accent
  let ang = 0; for (const [tc] of claps) if (t >= tc) ang += 0.30 * E.outCubic(prog(t, tc, tc + 0.28));
  ang += (t - 12.4) * 0.05;
  const sc2 = 1 + 0.09 * pAcc + 0.03 * pAny;
  ctx.save(); ctx.translate(540, 1000); ctx.scale(sc2, sc2); ctx.rotate(ang);
  const cols = ['#B3202F', '#F26B1D', '#FFC46B', '#FFF2DF', '#F26B1D', '#8E1522', '#E44A1B'];
  for (let k = 6; k >= 0; k--) {
    const R = 120 + k * 112, n = 14 + 2 * k, rr = (Math.PI * R / n) * 0.95;
    const grow = E.outBack(prog(t, 12.45 + (6 - k) * 0.03, 12.8 + (6 - k) * 0.03), 1.6);
    ctx.save(); ctx.scale(grow, grow); ctx.rotate(k % 2 ? Math.PI / n : 0);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ctx.moveTo(Math.cos(a) * R + rr, Math.sin(a) * R); ctx.arc(Math.cos(a) * R, Math.sin(a) * R, rr, 0, Math.PI * 2); }
    ctx.fillStyle = cols[k % cols.length]; ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.fill();
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
  ctx.restore();
  // shock rings on every clap
  for (const [tc, w] of all) {
    const q = prog(t, tc, tc + 0.55); if (q <= 0 || q >= 1) continue;
    ctx.strokeStyle = `rgba(255,226,170,${0.7 * (1 - q) * (w >= 0.9 ? 1 : 0.5)})`; ctx.lineWidth = (w >= 0.9 ? 14 : 7) * (1 - q) + 1;
    ctx.beginPath(); ctx.arc(540, 1000, 120 + E.outCubic(q) * 900, 0, 7); ctx.stroke();
  }
  g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, 'rgba(12,3,5,0.92)'); g.addColorStop(0.7, 'rgba(12,3,5,0.62)'); g.addColorStop(1, 'rgba(12,3,5,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900);
}
