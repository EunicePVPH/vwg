/* ProVirtual PH reel - helpers: easing, icons, kinetic text, card faces */
const $ = (s, p = document) => p.querySelector(s);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: x => x,
  in2: x => x * x,
  in3: x => x * x * x,
  out2: x => 1 - (1 - x) * (1 - x),
  out3: x => 1 - Math.pow(1 - x, 3),
  out4: x => 1 - Math.pow(1 - x, 4),
  io2: x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
  io3: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  inExpo: x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10),
  outBack: (x, s = 1.70158) => { x -= 1; return x * x * ((s + 1) * x + s) + 1; },
  sm: x => x * x * (3 - 2 * x),
};
const sm = (a, b, t) => E.sm(prog(t, a, b));

function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mixc(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }

/* ---------- icons (24x24 stroke icons) ---------- */
const IC = {
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  play: '<polygon points="7 4 20 12 7 20 7 4" fill="currentColor"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  cursor: '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="currentColor"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  handoff: '<path d="M5 12h12"/><polyline points="13 7 18 12 13 17"/><circle cx="4" cy="12" r="1.6" fill="currentColor"/>',
};
function ico(name, size = 24, color = 'currentColor', sw = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${IC[name] || ''}</svg>`;
}

/* ---------- kinetic text ---------- */
class Line {
  /* o: text, cls(white|gold|navy|mut), size, x, y, fit(maxWidth), maxSize, t0, dur, t1, outDur, mode(slam|mask|rise), out(blast|maskup|fade|none), stag, ls, shine */
  constructor(parent, o) {
    this.o = Object.assign({ x: 540, y: 960, size: 100, mode: 'slam', out: 'fade', stag: 0.022, dur: 0.42, outDur: 0.3, t1: 1e9, shine: null, ls: null, glow: false }, o);
    const el = document.createElement('div');
    el.className = 'km';
    el.style.left = this.o.x + 'px';
    el.style.top = this.o.y + 'px';
    el.style.width = '0px';
    const inner = document.createElement('div');
    inner.className = 'kl ' + (this.o.cls || 'white') + (this.o.shadow === false ? '' : ' tshadow');
    inner.style.fontSize = this.o.size + 'px';
    if (this.o.ls != null) inner.style.letterSpacing = this.o.ls + 'em';
    if (this.o.weight) inner.style.fontWeight = this.o.weight;
    if (this.o.mode === 'mask') inner.style.clipPath = 'inset(0 -60px 0 -60px)';
    inner.innerHTML = [...this.o.text].map(ch => ch === ' ' ? '<span class="sp"> </span>' : `<span class="lt">${ch}</span>`).join('');
    el.appendChild(inner);
    parent.appendChild(el);
    this.el = el; this.inner = inner;
    this.letters = [...inner.querySelectorAll('.lt')];
    this.N = this.letters.length;
    if (this.o.fit) this.fit(this.o.fit, this.o.maxSize || 400);
    el.style.display = 'none';
  }
  width() { return this.inner.getBoundingClientRect().width; }
  fit(maxW, maxSize) {
    this.el.style.display = '';
    this.inner.style.fontSize = '100px';
    const w = this.width();
    const sz = Math.min(maxSize, 100 * maxW / w);
    this.setSize(sz);
    this.el.style.display = 'none';
  }
  setSize(sz) { this.o.size = sz; this.inner.style.fontSize = sz + 'px'; }
  update(t) {
    const o = this.o;
    const inStart = o.t0, outStart = o.t1;
    if (t < inStart - 1e-6 || t > outStart + o.outDur + .02) { this.el.style.display = 'none'; return; }
    this.el.style.display = '';
    const N = this.N;
    let ci = 0;
    for (let i = 0; i < this.letters.length; i++) {
      const L = this.letters[i];
      const idx = i;
      const a = inStart + idx * o.stag;
      let p = prog(t, a, a + o.dur);
      let op = 1, tx = 0, ty = 0, sc = 1, bl = 0, rot = 0;
      if (o.mode === 'slam') {
        const e = E.outBack(p, 1.25);
        sc = lerp(2.3, 1, e); op = clamp(p * 3.2); bl = (1 - E.out3(p)) * 16; ty = (1 - E.outExpo(p)) * -30;
      } else if (o.mode === 'mask') {
        const e = E.outExpo(p);
        ty = (1 - e) * o.size * 1.1; op = p > 0 ? 1 : 0;
      } else if (o.mode === 'rise') {
        const e = E.out3(p);
        ty = (1 - e) * 60; op = e; bl = (1 - e) * 8;
      } else if (o.mode === 'zoom') {
        const e = E.outExpo(p);
        sc = lerp(0.6, 1, e); op = clamp(p * 2.5); bl = (1 - e) * 10;
      }
      if (t > outStart) {
        const q = prog(t, outStart + idx * 0.012, outStart + idx * 0.012 + o.outDur);
        if (o.out === 'blast') { const e = E.in3(q); sc *= lerp(1, 1.9, e); op *= 1 - e; bl += e * 22; tx += (idx - N / 2) * 14 * e; ty += -30 * e; }
        else if (o.out === 'maskup') { const e = E.in3(q); ty += -e * o.size * 1.1; }
        else if (o.out === 'fade') { op *= 1 - E.in2(q); ty += -14 * q; }
        else if (o.out === 'drop') { const e = E.in3(q); ty += e * 120; op *= 1 - e; bl += e * 8; }
      }
      L.style.opacity = op;
      L.style.transform = `translate(${tx}px,${ty}px) scale(${sc}) rotate(${rot}deg)`;
      L.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : '';
      if (o.shine) {
        const s = o.shine; // {t0,dur}
        const k = (t - s.t0) / s.dur - idx * 0.03;
        L.style.backgroundPosition = (100 - 200 * clamp(k * 1.25, -0.2, 1.2)) + '% 0%';
      }
    }
  }
}

/* ---------- card face builders ---------- */
function faceHTML(c) {
  const d = c.data, k = c.kind;
  if (k === 'email') return `<div class="face-real f-email" style="height:${c.h}px;top:${-c.h / 2}px"><div class="av" style="background:${d.color}">${d.initial}</div><div class="tx"><div class="r1"><b>${d.from}</b><span class="tm">${d.time}</span></div><div class="sj">${d.subject}</div><div class="pv">${d.preview}</div></div>${d.unread ? '<div class="ud"></div>' : ''}</div>`;
  if (k === 'event') return `<div class="face-real f-event" style="height:${c.h}px;top:${-c.h / 2}px"><div class="bar" style="background:${d.color}"></div><div class="tt">${d.title}</div><div class="tr">${ico('clock', 20, '#53628a')}${d.time}</div><div class="wh">${ico('users', 16, '#3a4b78')}${d.where}</div></div>`;
  if (k === 'kanban') return `<div class="face-real f-kanban" style="height:${c.h}px;top:${-c.h / 2}px"><span class="tg" style="background:${d.tagc}">${d.tag}</span><div class="tt">${d.title}</div><div class="ft"><span class="d">${ico('clock', 19, '#6B7690')}Due ${d.due}</span><span style="display:flex;align-items:center;gap:14px"><span style="display:flex;align-items:center;gap:6px">${ico('chat', 18, '#6B7690')}3</span><span class="avs"><i style="background:#5B7BB0"></i><i style="background:#C9A04A"></i></span></span></div></div>`;
  if (k === 'toast') return `<div class="face-real f-toast ${d.dark ? '' : 'light'}" style="height:${c.h}px;top:${-c.h / 2}px"><div class="ic">${ico(d.icon, 32, '#0B1B3F', 2.4)}</div><div><div class="t1">${d.title}</div><div class="t2">${d.sub}</div></div><div class="nw">now</div></div>`;
  if (k === 'post') return `<div class="face-real f-post" style="height:${c.h}px;top:${-c.h / 2}px"><div class="th" style="background:linear-gradient(135deg,${d.g1},${d.g2})"><div class="fm">${d.fmt.toUpperCase()}</div><div class="pl">${ico('play', 26, '#0B1B3F')}</div></div><div class="tx"><div class="cp">${d.caption}</div><div class="sc">${ico('calendar', 16, '#7A5714', 2.4)}${d.when}</div></div></div>`;
  if (k === 'doc') {
    let body = '';
    if (d.sheet) { body = '<div class="tb">' + '<div class="tr"><span></span><span></span><span></span></div>'.repeat(4) + '</div>'; }
    else { for (let i = 0; i < d.lines; i++) body += `<div class="ln ${i === 0 ? 'h' : ''}" style="width:${[88, 96, 82, 92, 60][i % 5]}%"></div>`; }
    return `<div class="face-real f-doc" style="height:${c.h}px;top:${-c.h / 2}px"><div class="hd">${ico('file', 26, '#12306E')}${d.title}<i>DRAFT</i></div>${body}</div>`;
  }
  if (k === 'browser') return `<div class="face-real f-browser" style="height:${c.h}px;top:${-c.h / 2}px"><div class="tb"><i></i><i></i><i></i><div class="u">${d.url}</div></div><div class="bd"><div class="l"><div class="h1">${d.head}</div><div class="ln" style="width:92%"></div><div class="ln" style="width:78%"></div><div class="ln" style="width:85%"></div><div class="bt">Learn more</div></div><div class="im"></div></div><div class="ed">${ico('edit', 22, '#fff')}</div></div>`;
  if (k === 'search') return `<div class="face-real f-search" style="height:${c.h}px;top:${-c.h / 2}px"><div class="sb">${ico('search', 22, '#53628a')}${d.q}</div><div class="r"><div class="r1">${d.r1}</div><div class="r2">www.example.com/guide</div><div class="r3" style="width:94%"></div><div class="r3" style="width:70%"></div></div><div class="r"><div class="r1">${d.r2}</div><div class="r3" style="width:88%"></div></div></div>`;
  return '';
}
function chipHTML(c) {
  const iconColor = c.col === 'DELEGATE' ? '#0B1B3F' : '#fff';
  return `<div class="chip ${c.col}" style="top:-39px"><div class="ci">${ico(c.icon, 28, iconColor, 2.2)}</div><div class="cl">${c.label}</div><div class="cd"></div><div class="shine"></div><div class="ring"></div></div>`;
}
