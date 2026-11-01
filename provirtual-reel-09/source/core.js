/* ProVirtual PH — Reel 09 · core engine (deterministic, time-driven) */
const W = 1080, H = 1920, PERSP = 1600;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  lin: k => k,
  in2: k => k * k, in3: k => k * k * k,
  out2: k => 1 - (1 - k) * (1 - k),
  out3: k => 1 - Math.pow(1 - k, 3),
  out5: k => 1 - Math.pow(1 - k, 5),
  expo: k => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  io2: k => (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  io3: k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  back: k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  back2: k => { const c1 = 2.6, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  sin: k => .5 - .5 * Math.cos(Math.PI * k),
};
const G = '#d4a84b', GOLD = '#d4a84b', GOLDL = '#f0cf85';
const $ = id => document.getElementById(id);
const world = $('world');
const ANIMS = [];           // per-frame closures (t)=>{}
const A = fn => ANIMS.push(fn);

function div(cls, css, html, parent) {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  if (css) d.style.cssText = css;
  if (html != null) d.innerHTML = html;
  if (parent) parent.appendChild(d);
  return d;
}
function setT(el, x = 0, y = 0, s = 1, rot = 0, extra = '') {
  el.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${rot}deg) ${extra}`;
}
const fmtc = (n, d = 2) => n.toFixed(d);

/* ---------- icons (simple stroked svgs) ---------- */
const ICONS = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  share: '<path d="M5 12v7h14v-7M12 15V4M8 8l4-4 4 4"/>',
  doc: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
  mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
  star: '<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.500"/><rect x="13" y="4" width="7" height="7" rx="1.500"/><rect x="4" y="13" width="7" height="7" rx="1.500"/><rect x="13" y="13" width="7" height="7" rx="1.500"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
  flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cursor: '<path d="M5 3l14 7-6 2-2 6z" fill="#0f1b3d" stroke="#fff" stroke-width="1.5"/>',
};
function ic(name, size = 32, color = 'currentColor', sw = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="flex:none;display:block">${ICONS[name] || ''}</svg>`;
}

/* ---------- stations + panels ---------- */
const STN = {
  ops: [0, -1850], mkt: [1379, -572], web: [852, 1497], res: [-852, 1497], con: [-1379, -572],
};
const STATIONS = {};
function station(id, vis) {
  const [x, y] = STN[id];
  const el = div('stn', `left:${x}px;top:${y}px`, null, world);
  STATIONS[id] = { id, x, y, el, vis, scale: 1 };
  return STATIONS[id];
}
const PANELS = [];
function panel(st, o) {
  const el = div('panel ' + (o.cls || ''), `left:${o.x - o.w / 2}px;top:${o.y - o.h / 2}px;width:${o.w}px;height:${o.h}px;` + (o.css || ''), o.html || '', st.el);
  const it = { el, o, st, ph: Math.random() * 6.28 };
  it.ph = (PANELS.length * 1.7) % 6.28;
  PANELS.push(it);
  return it;
}
function renderPanels(t) {
  for (const it of PANELS) {
    const o = it.o;
    const t0 = o.t0 ?? 0, dur = o.dur ?? 1.0;
    const k = P(t, t0, t0 + dur);
    const p = E.out5(k);
    const fr = o.from || [0, 140, -700];
    const fl = o.float === 0 ? 0 : 1;
    const fz = fl * Math.sin(t * .8 + it.ph) * 16;
    const fy = fl * Math.sin(t * .6 + it.ph * 1.3) * 9;
    const op = clamp(k * 2.2);
    it.el.style.opacity = op;
    it.el.style.display = op <= 0 ? 'none' : 'block';
    it.el.style.transform =
      `translate3d(${fr[0] * (1 - p)}px,${fr[1] * (1 - p) + fy}px,${(o.z || 0) + fr[2] * (1 - p) + fz}px) ` +
      `rotateX(${(o.rx || 0) + (o.rx0 || 0) * (1 - p)}deg) rotateY(${(o.ry || 0) + (o.ry0 ?? -24) * (1 - p)}deg) rotateZ(${(o.rz || 0)}deg)`;
  }
}

/* ---------- camera (Hermite spline through keys, zoom in log space) ---------- */
let CAM = [];
function camKeys(keys) { CAM = keys; }
const CK = ['x', 'y', 'ls', 'rx', 'ry', 'rz'];
function camAt(t) {
  const n = CAM.length;
  let i = 0;
  while (i < n - 2 && t >= CAM[i + 1].t) i++;
  const a = CAM[i], b = CAM[i + 1];
  const u = clamp((t - a.t) / (b.t - a.t));
  const dt = b.t - a.t;
  const out = {};
  const tan = (idx, key) => {
    const k = CAM[idx];
    if (k.stop) return 0;
    const p = CAM[Math.max(0, idx - 1)], q = CAM[Math.min(n - 1, idx + 1)];
    const dtt = q.t - p.t;
    return dtt > 0 ? (q[key] - p[key]) / dtt : 0;
  };
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  for (const key of CK) {
    const p0 = a[key], p1 = b[key];
    out[key] = h00 * p0 + h10 * dt * tan(i, key) + h01 * p1 + h11 * dt * tan(i + 1, key);
  }
  out.s = Math.exp(out.ls);
  return out;
}
function C(t, x, y, s, rx = 0, ry = 0, rz = 0, stop = false) {
  return { t, x, y, ls: Math.log(s), rx, ry, rz, stop };
}
const SHAKES = []; // [t, amp]
function shakeAt(t) {
  let sx = 0, sy = 0, sr = 0;
  for (const [t0, amp] of SHAKES) {
    const d = t - t0;
    if (d < 0 || d > 0.8) continue;
    const e = Math.exp(-d * 7) * amp;
    sx += Math.sin(d * 71) * e * 14;
    sy += Math.cos(d * 59) * e * 11;
    sr += Math.sin(d * 47) * e * .5;
  }
  return [sx, sy, sr];
}
function applyCamera(t) {
  const c = camAt(t);
  const zc = PERSP * (1 - 1 / c.s);
  const [sx, sy, sr] = shakeAt(t);
  world.style.transform =
    `translate3d(${sx}px,${sy}px,${zc}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz + sr}deg) translate3d(${-c.x}px,${-c.y}px,0)`;
  // parallax grid
  const gs = Math.max(.12, c.s);
  const gx = -c.x * c.s * .35, gy = -c.y * c.s * .35;
  const g = $('grid'), g2 = $('grid2');
  const cell = 96 * Math.max(.5, Math.min(1.6, Math.pow(c.s, .35)));
  g.style.backgroundSize = `${cell}px ${cell}px`;
  g.style.backgroundPosition = `${gx}px ${gy}px`;
  g.style.transform = `rotate(${c.rz * .6}deg) translate(${sx}px,${sy}px)`;
  const cell2 = cell * 4;
  g2.style.backgroundSize = `${cell2}px ${cell2}px`;
  g2.style.backgroundPosition = `${gx * 1.2}px ${gy * 1.2}px`;
  g2.style.transform = g.style.transform;
  return c;
}

/* ---------- kinetic type ---------- */
const TXT = $('txt');
const TCARDS = [];
/* lines: [[{t:'TEXT',c:'#fff'}...], ...]  */
function textCard(o) {
  const el = div('tc', `left:${o.x}px;top:${o.y}px;font-size:${o.size}px;` + (o.align === 'center' ? 'transform:translateX(-50%);text-align:center;' : '') + (o.css || ''), null, TXT);
  const lines = o.lines.map(segs => {
    const ln = div('ln', '', null, el);
    const inn = div('in', '', null, ln);
    const chars = [];
    for (const sg of segs) {
      const col = sg.c || '#fff';
      for (const chr of sg.t) {
        const sp = document.createElement('span');
        sp.className = 'ch';
        sp.textContent = chr === ' ' ? ' ' : chr;
        sp.style.color = col;
        if (sg.css) sp.style.cssText += sg.css;
        inn.appendChild(sp); chars.push(sp);
      }
    }
    return { ln, inn, chars };
  });
  const card = { o, el, lines };
  TCARDS.push(card);
  return card;
}
function renderCards(t) {
  for (const c of TCARDS) {
    const o = c.o;
    const vis = t >= o.t0 - .01 && t <= o.t1 + .6;
    c.el.style.display = vis ? 'block' : 'none';
    if (!vis) continue;
    const v = o.variant || 'rise';
    const exitDur = o.exit ?? .38;
    const q = P(t, o.t1 - exitDur, o.t1);
    c.lines.forEach((L, li) => {
      const d0 = o.t0 + li * (o.stagger ?? .11);
      if (v === 'rise') {
        const p = E.out5(P(t, d0, d0 + .75));
        const x = E.in3(q);
        L.inn.style.transform = `translateY(${(1 - p) * 118 - x * 118}%) rotate(${(1 - p) * 5}deg)`;
        L.inn.style.opacity = '1';
        L.chars.forEach(ch => { ch.style.transform = ''; ch.style.opacity = 1; });
      } else if (v === 'letters') {
        L.inn.style.transform = '';
        L.chars.forEach((ch, i) => {
          const p = E.out5(P(t, d0 + i * .028, d0 + i * .028 + .62));
          const x = E.in3(P(t, o.t1 - exitDur + i * .01, o.t1 + i * .01));
          ch.style.transform = `translateY(${(1 - p) * 125 - x * 125}%) rotate(${(1 - p) * 8}deg)`;
        });
      } else if (v === 'slam') {
        const p = E.back2(P(t, d0, d0 + .42));
        const bl = (1 - E.out3(P(t, d0, d0 + .3))) * 22;
        const x = E.in3(q);
        L.inn.style.transform = `scale(${lerp(1.55, 1, p) * (1 - x * .12)})`;
        L.inn.style.opacity = clamp(P(t, d0, d0 + .14) * (1 - x));
        L.inn.style.filter = bl > 0.3 ? `blur(${bl}px)` : 'none';
        L.chars.forEach(ch => { ch.style.transform = ''; });
      } else if (v === 'wipe') {
        const p = E.out5(P(t, d0, d0 + .7));
        const x = E.io3(q);
        L.inn.style.transform = '';
        L.inn.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 ${x * 100}%)`;
        L.inn.style.opacity = '1';
      }
      L.ln.style.overflow = (v === 'slam') ? 'visible' : 'hidden';
    });
    if (o.fadeAll) c.el.style.opacity = 1 - E.in2(q) * 0;
  }
}
