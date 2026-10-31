// ---------- Tour Architex · Spain 2027 reel : shared helpers ----------
const W = 1080, H = 1920, FPS = 30;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: x => x,
  outQuad: x => 1 - (1 - x) * (1 - x),
  inQuad: x => x * x,
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inCubic: x => x * x * x,
  inOutCubic: x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuart: x => 1 - Math.pow(1 - x, 4),
  outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: x => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x, s = 1.70158) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
};
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const C = {
  ink: '#140C08', night: '#1B1210', clay: '#5A210F', terra: '#C4501B', orange: '#F26B1D', amber: '#FF9A3C',
  gold: '#FFC46B', sand: '#EBD3AC', paper: '#F6E7D0', cream: '#FFF2DF', teal: '#0E4C57', teal2: '#1B7A84', sea: '#0A3A44',
  crimson: '#B3202F',
};
const hex2rgb = h => { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; };
const mixc = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; };
const rgba = (h, a) => { const c = hex2rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

const F = {
  disp: s => `700 ${s}px "Bebas Neue"`,
  sans: (s, w = 700) => `${w} ${s}px "League Spartan"`,
  serif: s => `italic 500 ${s}px "EB Garamond"`,
  mont: (s, w = 600) => `${w} ${s}px "Montserrat"`,
};

// draw text. o: f, color, align, track, alpha, sc, rot, shadow{c,b,y,x}, stroke{c,w}, noFill
function text(ctx, str, x, y, o = {}) {
  const { f, color = C.cream, align = 'left', track = 0, alpha = 1, sc = 1, rot = 0, shadow = null, stroke = null } = o;
  if (alpha <= 0.002) return 0;
  ctx.save();
  ctx.font = f; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = track + 'px'; ctx.textAlign = 'left';
  const w = ctx.measureText(str).width - track;
  const ox = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
  ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sc !== 1) ctx.scale(sc, sc);
  ctx.globalAlpha *= alpha;
  if (shadow) { ctx.shadowColor = shadow.c; ctx.shadowBlur = shadow.b; ctx.shadowOffsetY = shadow.y || 0; ctx.shadowOffsetX = shadow.x || 0; }
  if (stroke) { ctx.lineWidth = stroke.w; ctx.strokeStyle = stroke.c; ctx.lineJoin = 'round'; ctx.strokeText(str, ox, 0); }
  if (!o.noFill) { ctx.fillStyle = color; ctx.fillText(str, ox, 0); }
  ctx.restore();
  return w;
}
function measure(ctx, str, f, track = 0) {
  ctx.save(); ctx.font = f; ctx.letterSpacing = track + 'px';
  const w = ctx.measureText(str).width - track; ctx.restore(); return w;
}
// fit font size so the string is at most maxW wide
function fitSize(ctx, str, fam, maxW, size, track = 0) {
  const w = measure(ctx, str, fam(size), track);
  return w > maxW ? size * maxW / w : size;
}
// text that rises out of an invisible mask line
function maskLine(ctx, str, x, y, o, p, h) {
  if (p <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - h * 0.92, W, h * 1.12); ctx.clip();
  text(ctx, str, x, y + (1 - E.outExpo(p)) * h * 1.15, o);
  ctx.restore();
}
// per-letter animated text; fn(i,n)->{dx,dy,sc,alpha,rot}
function letters(ctx, str, x, y, o, fn) {
  ctx.save();
  ctx.font = o.f; ctx.letterSpacing = '0px';
  const tr = o.track || 0, ch = [...str];
  const adv = ch.map((c, i) => ctx.measureText(str.slice(0, i + 1)).width - ctx.measureText(str.slice(0, i)).width + tr);
  const total = adv.reduce((a, b) => a + b, 0) - tr;
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  ctx.restore();
  ch.forEach((c, i) => {
    const a = fn(i, ch.length) || {};
    const w = adv[i] - tr;
    if (c !== ' ') text(ctx, c, cx + w / 2 + (a.dx || 0), y + (a.dy || 0),
      Object.assign({}, o, { align: 'center', track: 0, sc: a.sc == null ? 1 : a.sc, alpha: (o.alpha == null ? 1 : o.alpha) * (a.alpha == null ? 1 : a.alpha), rot: a.rot || 0 }));
    cx += adv[i];
  });
  return total;
}
// horseshoe (Moorish) arch path: opening half-width n, ground line baseY, total height hgt
function archPath(ctx, cx, baseY, n, hgt) {
  const r = n / 0.86, cy = baseY - hgt + r, h = Math.sqrt(r * r - n * n);
  ctx.moveTo(cx - n, baseY); ctx.lineTo(cx - n, cy + h);
  ctx.arc(cx, cy, r, Math.atan2(h, -n), Math.atan2(h, n) + Math.PI * 2, false);
  ctx.lineTo(cx + n, baseY);
}
function glowDisc(ctx, x, y, r, inner, outer, k = 3) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * k);
  g.addColorStop(0, inner); g.addColorStop(1 / k * 0.98, inner); g.addColorStop(1 / k, outer.replace(/[\d.]+\)$/, '0.55)'));
  g.addColorStop(1, outer.replace(/[\d.]+\)$/, '0)'));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * k, 0, Math.PI * 2); ctx.fill();
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
// keyframe camera interpolation. K = [[t, v0, v1, ...], ...]
function keyAt(K, t) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 0; i < K.length - 1; i++) {
    if (t <= K[i + 1][0]) {
      const p = E.inOutCubic(prog(t, K[i][0], K[i + 1][0]));
      return K[i].slice(1).map((v, j) => lerp(v, K[i + 1][j + 1], p));
    }
  }
  return K[K.length - 1].slice(1);
}
function pulse(t, times, decay = 0.12) { // sum of exponential decays after each time
  let s = 0; for (const [tc, w] of times) { const d = t - tc; if (d >= 0) s += (w == null ? 1 : w) * Math.exp(-d / decay); } return s;
}
