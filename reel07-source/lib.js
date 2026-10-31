/* ProVirtual PH — Reel #7 renderer: core library (deterministic canvas drawing) */
const W = 1080, H = 1920;
const C = {
  navy0: '#030a1b', navy1: '#071531', navy2: '#0d2456', navy3: '#16397a', navy4: '#1f4c9c',
  blue: '#8fa9d4', blueD: '#4a6591', char: '#121826', char2: '#1b2336', char3: '#2a3450',
  gold: '#d6ad45', goldL: '#f7dc86', goldD: '#9c7620', white: '#ffffff', mute: '#8e9bb5'
};
let ctx;                       // current drawing context
const setCtx = c => { ctx = c; };

/* ---------- math helpers ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo3 = x => 1 - Math.pow(1 - x, 3);
const eo5 = x => 1 - Math.pow(1 - x, 5);
const ei3 = x => x * x * x;
const eio3 = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eoExp = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const eiExp = x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10);
const eoBack = (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const eoElastic = x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -9 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1;
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const vnoise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); };
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const D2R = Math.PI / 180;

function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rr(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function goldGrad(c, x0, y0, x1, y1) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, C.goldD); g.addColorStop(.35, C.gold); g.addColorStop(.6, C.goldL); g.addColorStop(1, C.gold);
  return g;
}
function lg(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g;
}

/* ---------- text ---------- */
function T(c, s, x, y, o = {}) {
  const { size = 40, w = 800, col = '#fff', al = 'left', ls = 0, a = 1, base = 'alphabetic', font = 'Inter' } = o;
  c.save(); c.globalAlpha *= a; c.font = `${w} ${size}px ${font}`; c.letterSpacing = (ls * size) + 'px';
  c.textAlign = al; c.textBaseline = base; c.fillStyle = col; c.fillText(s, x, y); c.restore();
}
function tw(c, s, size, w = 800, ls = 0) {
  c.save(); c.font = `${w} ${size}px Inter`; c.letterSpacing = (ls * size) + 'px'; const m = c.measureText(s).width; c.restore(); return m;
}
function fit(c, s, target, w = 900, ls = 0, maxSize = 400) {
  const m = tw(c, s, 100, w, ls); return Math.min(maxSize, 100 * target / m);
}

/* ---------- 3D plane projection (triangle-mesh texture mapping) ---------- */
const CAM = { f: 1500, cx: W / 2, cy: H / 2 };
function det3(a, b, c, d, e, f, g, h, i) { return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g); }
function planePts(w, h, o) {
  // o: x,y,z (screen-centred offsets, z away from camera), rx,ry,rz in degrees, s scale
  const s = o.s == null ? 1 : o.s, rx = (o.rx || 0) * D2R, ry = (o.ry || 0) * D2R, rz = (o.rz || 0) * D2R;
  const cz = Math.cos(rz), sz = Math.sin(rz), cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  return (lx, ly) => {
    let x = (lx - w / 2) * s, y = (ly - h / 2) * s, z = 0;
    let x1 = x * cz - y * sz, y1 = x * sz + y * cz; x = x1; y = y1;       // roll
    let y2 = y * cx - z * sx, z2 = y * sx + z * cx; y = y2; z = z2;       // pitch
    let x3 = x * cy + z * sy, z3 = -x * sy + z * cy; x = x3; z = z3;      // yaw
    x += o.x || 0; y += o.y || 0; z += o.z || 0;
    const k = CAM.f / Math.max(60, CAM.f + z);
    return [CAM.cx + x * k, CAM.cy + y * k, k];
  };
}
function drawTri(img, u0, v0, u1, v1, u2, v2, x0, y0, x1, y1, x2, y2) {
  const D = det3(u0, v0, 1, u1, v1, 1, u2, v2, 1); if (Math.abs(D) < 1e-9) return;
  const a = det3(x0, v0, 1, x1, v1, 1, x2, v2, 1) / D, c = det3(u0, x0, 1, u1, x1, 1, u2, x2, 1) / D, e = det3(u0, v0, x0, u1, v1, x1, u2, v2, x2) / D;
  const b = det3(y0, v0, 1, y1, v1, 1, y2, v2, 1) / D, d = det3(u0, y0, 1, u1, y1, 1, u2, y2, 1) / D, f = det3(u0, v0, y0, u1, v1, y1, u2, v2, y2) / D;
  const mx = (x0 + x1 + x2) / 3, my = (y0 + y1 + y2) / 3, ex = .75;
  const px = (x, y) => { const dx = x - mx, dy = y - my, l = Math.hypot(dx, dy) || 1; return [x + dx / l * ex, y + dy / l * ex]; };
  const p0 = px(x0, y0), p1 = px(x1, y1), p2 = px(x2, y2);
  ctx.save(); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.closePath(); ctx.clip();
  ctx.transform(a, b, c, d, e, f); ctx.drawImage(img, 0, 0); ctx.restore();
}
function plane(img, o, opt = {}) {
  const w = img.width, h = img.height, P = planePts(w, h, o);
  const nx = opt.nx || 8, ny = opt.ny || 8;
  const g = [];
  for (let j = 0; j <= ny; j++) { g[j] = []; for (let i = 0; i <= nx; i++) g[j][i] = P(i / nx * w, j / ny * h); }
  const q = [P(0, 0), P(w, 0), P(w, h), P(0, h)];
  ctx.save();
  if (o.a != null) ctx.globalAlpha *= o.a;
  if (opt.shadow) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = opt.shadow; ctx.shadowOffsetY = opt.shadowY == null ? 30 : opt.shadowY; ctx.shadowOffsetX = -9000;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(q[0][0] + 9000, q[0][1]); q.slice(1).forEach(p => ctx.lineTo(p[0] + 9000, p[1])); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = g[j][i], b = g[j][i + 1], c = g[j + 1][i + 1], d = g[j + 1][i];
    const u0 = i / nx * w, u1 = (i + 1) / nx * w, v0 = j / ny * h, v1 = (j + 1) / ny * h;
    drawTri(img, u0, v0, u1, v0, u1, v1, a[0], a[1], b[0], b[1], c[0], c[1]);
    drawTri(img, u0, v0, u1, v1, u0, v1, a[0], a[1], c[0], c[1], d[0], d[1]);
  }
  if (opt.edge) {
    ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); q.slice(1).forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath();
    ctx.lineWidth = opt.edgeW || 2; ctx.strokeStyle = opt.edge; ctx.stroke();
  }
  ctx.restore();
  return { q, k: P(w / 2, h / 2)[2], P };
}

/* ---------- speech-like waveform data ---------- */
const SPEECH = (() => {
  const a = new Float32Array(6000);
  for (let i = 0; i < a.length; i++) {
    const ph = sstep(.36, .52, vnoise(i * .011 + 5)), syl = Math.pow(Math.abs(Math.sin(i * .29 + vnoise(i * .045) * 7)), .75);
    a[i] = .1 + .9 * ph * syl * (.55 + .45 * hash(i * 1.7));
  }
  return a;
})();
function fmtTC(s) { s = Math.max(0, s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = Math.floor(s % 60), f = Math.floor((s % 1) * 30); return [h, m, ss, f].map(v => String(v).padStart(2, '0')).join(':'); }
function fmtMS(s) { const m = Math.floor(s / 60), ss = Math.floor(s % 60); return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0'); }

/* ---------- background ---------- */
let BG0 = null, GRAIN = null;
function initBg() {
  BG0 = mk(W, H); const c = BG0.getContext('2d');
  c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#050e24'], [.5, '#08193c'], [1, '#030a1b']]); c.fillRect(0, 0, W, H);
  let g = c.createRadialGradient(W / 2, 760, 40, W / 2, 760, 1100); g.addColorStop(0, 'rgba(36,86,170,.55)'); g.addColorStop(.5, 'rgba(18,48,110,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  g = c.createRadialGradient(W * .9, H * .95, 20, W * .9, H * .95, 700); g.addColorStop(0, 'rgba(214,173,69,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  GRAIN = mk(540, 960); const gc = GRAIN.getContext('2d'); const id = gc.createImageData(540, 960);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (hash(i * .37) - .5) * 160; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  gc.putImageData(id, 0, 0);
}
function bg(t, o = {}) {
  ctx.drawImage(BG0, 0, 0);
  // drifting gold / blue dust
  ctx.save();
  for (let i = 0; i < 38; i++) {
    const sp = .012 + hash(i * 3.1) * .03, px = hash(i * 7.7) * W + Math.sin(t * .4 + i) * 24, py = ((hash(i * 5.3) - t * sp * 8) % 1 + 1) % 1 * H;
    const r = 2 + hash(i * 2.9) * 7, gold = i % 3 === 0, al = (.08 + hash(i * 1.3) * .22) * (o.dust == null ? 1 : o.dust);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * 2.2);
    g.addColorStop(0, gold ? `rgba(247,220,134,${al})` : `rgba(143,169,212,${al})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(px - r * 2.2, py - r * 2.2, r * 4.4, r * 4.4);
  }
  ctx.restore();
}
function finishFx(t) {
  // vignette + grain
  let g = ctx.createRadialGradient(W / 2, H / 2, 560, W / 2, H / 2, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,4,14,.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .05; ctx.globalCompositeOperation = 'overlay';
  const ox = Math.floor(hash(Math.floor(t * 30) * 1.3) * 300), oy = Math.floor(hash(Math.floor(t * 30) * 2.9) * 300);
  ctx.drawImage(GRAIN, -ox, -oy, 1080 + 300, 1920 + 300); ctx.restore();
}
function scrim(y0, y1, a0, a1, col = '3,10,27') {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(${col},${a0})`); g.addColorStop(1, `rgba(${col},${a1})`);
  ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0));
}
function glow(x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
