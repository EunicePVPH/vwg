/* ProVirtual PH - Business Delegation Audit Reel : scene engine. render(t) draws any frame deterministically. */
const TLD = window.TL;
const PERSP = TLD.persp, FREEZE = TLD.freeze, CAM_Z = TLD.camZ;
const $world = $('#world'), $cam = $('#cam'), $hud = $('#hud'), $trails = $('#trails');
const S = { cards: [], lines: {}, ready: false };

/* ============================== BACKGROUND ============================== */
const BGK = [
  // t,  top,       bot,       gx,  gy,  ga,  bx,  by,  ba
  [0,    '#0C2150', '#040B1D', 540, 1050, .20, 820, 220, .40],
  [3,    '#0C2150', '#040B1D', 540, 1000, .22, 820, 220, .40],
  [7,    '#0A1B42', '#030918', 540, 1000, .10, 540, 500, .25],
  [7.7,  '#0B2250', '#040B1D', 540, 1090, .24, 540, 300, .38],
  [11.8, '#0B2250', '#040B1D', 540, 1090, .24, 540, 300, .38],
  [12.6, '#0E2C66', '#061633', 900, 350, .30, 160, 1150, .55],
  [16.8, '#0E2C66', '#061633', 900, 350, .30, 160, 1150, .55],
  [17.6, '#15407F', '#0A2455', 540, 1000, .12, 540, 300, .65],
  [20.8, '#15407F', '#0A2455', 540, 1000, .12, 540, 300, .65],
  [21.5, '#071942', '#030918', 540, 760, .40, 540, 1500, .30],
  [25.1, '#071942', '#030918', 540, 760, .46, 540, 1500, .30],
];
function updateBG(t) {
  let i = 0; while (i < BGK.length - 2 && t > BGK[i + 1][0]) i++;
  const a = BGK[i], b = BGK[i + 1];
  const k = E.sm(prog(t, a[0], b[0]));
  const top = mixc(a[1], b[1], k), bot = mixc(a[2], b[2], k);
  let ga = lerp(a[5], b[5], k);
  const pulse = (Math.sin(t * Math.PI * 4) * .5 + .5);
  ga += .10 * pulse * sm(3, 6.9, t) * (t < 7 ? 1 : 0);
  const gx = lerp(a[3], b[3], k), gy = lerp(a[4], b[4], k);
  const bx = lerp(a[6], b[6], k), by = lerp(a[7], b[7], k), ba = lerp(a[8], b[8], k);
  $('#bgA').style.background = `linear-gradient(180deg,${top},${bot})`;
  $('#glowG').style.background = `radial-gradient(circle at ${gx}px ${gy}px,rgba(201,160,74,${ga}) 0,rgba(201,160,74,0) 640px)`;
  $('#glowB').style.background = `radial-gradient(circle at ${bx}px ${by}px,rgba(61,111,217,${ba * .55}) 0,rgba(61,111,217,0) 950px)`;
}

/* ============================== WORLD / CARDS ============================== */
function initWorld() {
  const defs = `<defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF1BE"/><stop offset="1" stop-color="#C9A04A"/></linearGradient></defs>`;
  $trails.innerHTML = defs;
  TLD.cards.forEach(c => {
    const el = document.createElement('div');
    el.className = 'card';
    el.style.display = 'none';
    let html = faceHTML(c);
    if (c.sorted) html += chipHTML(c);
    html += `<div class="pill ${['', 'pw', 'pb'][c.id % 3]}" style="left:0;top:0">${c.pill}</div>`;
    el.innerHTML = html;
    $world.appendChild(el);
    const o = {
      c, el,
      real: el.querySelector('.face-real'), chip: el.querySelector('.chip'), pill: el.querySelector('.pill'),
      ring: el.querySelector('.ring'), shine: el.querySelector('.shine'),
    };
    const shade = document.createElement('div'); shade.className = 'shade'; shade.style.borderRadius = '20px';
    o.real.appendChild(shade); o.shade = shade;
    if (o.chip) { const sh2 = document.createElement('div'); sh2.className = 'shade'; o.chip.appendChild(sh2); o.shade2 = sh2; }
    // frozen pose (for the sort flight + trail)
    const age = FREEZE - c.ts;
    o.fx = c.x + c.vx * age + c.swayA * Math.sin(c.swayF * FREEZE + c.swayP);
    o.fy = c.y + c.vy * age + c.swayA * Math.cos(c.swayF * FREEZE * .8 + c.swayP);
    o.fz = c.z;
    o.frx = c.rx + 3 * Math.sin(FREEZE * 1.1 + c.swayP); o.fry = c.ry + 4 * Math.sin(FREEZE * .9 + c.swayP); o.frz = c.rz + c.rr * age + 2 * Math.sin(FREEZE * c.swayF);
    if (c.sorted) {
      const f0 = PERSP / (PERSP - (o.fz + CAM_Z));
      o.p0 = [540 + o.fx * f0, 960 + o.fy * f0];
      o.p1 = [c.slot.x, c.slot.y];
      const mx = (o.p0[0] + o.p1[0]) / 2, my = (o.p0[1] + o.p1[1]) / 2;
      const dx = o.p1[0] - o.p0[0], dy = o.p1[1] - o.p0[1], L = Math.hypot(dx, dy) || 1;
      o.pc = [mx - dy / L * c.bend, my + dx / L * c.bend];
      const d = `M${o.p0[0].toFixed(1)},${o.p0[1].toFixed(1)} Q${o.pc[0].toFixed(1)},${o.pc[1].toFixed(1)} ${o.p1[0].toFixed(1)},${o.p1[1].toFixed(1)}`;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = `<path d="${d}" stroke="rgba(232,200,114,.22)" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="url(#gg)" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      $trails.appendChild(g);
      o.trail = [...g.querySelectorAll('path')];
      o.len = o.trail[1].getTotalLength();
      o.g = g;
      g.style.display = 'none';
    }
    S.cards.push(o);
  });
}

function camState(t) {
  let z = CAM_Z * Math.pow(prog(t, 2.3, FREEZE), 1.6);
  if (t > FREEZE) z = CAM_Z;
  const sway = 1 - sm(6.2, FREEZE, t);
  let rx = 2.5 * Math.sin(t * .9) * sway, ry = 4 * Math.sin(t * .7 + 1) * sway, rz = 1.8 * Math.sin(t * .5) * sway;
  const sh = 6 * sm(5.0, 6.9, t) * (t < FREEZE ? 1 : 0);
  const sx = sh * (Math.sin(t * 61) * .6 + Math.sin(t * 37 + 1) * .4);
  const sy = sh * (Math.sin(t * 53 + 2) * .6 + Math.sin(t * 29) * .4);
  if (t > 9.7) { const k = sm(9.7, 10.5, t); rx += k * 2.4 * Math.sin((t - 9.7) * 1.0); ry += k * 3.4 * Math.sin((t - 9.7) * .75); }
  let op = 1;
  if (t > 11.5) { const q = prog(t, 11.5, 12.4), e = E.in3(q); z -= e * 1700; ry += -e * 38; rx += e * 12; op = 1 - E.in2(q); }
  return { z, rx, ry, rz, sx, sy, op };
}

function updateWorld(t) {
  const cs = camState(t);
  if (t > 12.45) { $cam.style.display = 'none'; $trails.style.display = 'none'; return; }
  $cam.style.display = ''; $trails.style.display = '';
  $cam.style.opacity = cs.op;
  $world.style.transform = `translate3d(${cs.sx}px,${cs.sy}px,0) translateZ(${cs.z}px) rotateX(${cs.rx}deg) rotateY(${cs.ry}deg) rotateZ(${cs.rz}deg)`;
  const tc = Math.min(t, FREEZE);
  const dimAmt = .52 * sm(FREEZE, FREEZE + .3, t);
  for (const o of S.cards) {
    const c = o.c;
    if (t < c.ts) { o.el.style.display = 'none'; if (o.g) o.g.style.display = 'none'; continue; }
    o.el.style.display = '';
    const age = tc - c.ts;
    const pop = lerp(.5, 1, E.outBack(prog(age, 0, .4), 2.0));
    let x = c.x + c.vx * age + c.swayA * Math.sin(c.swayF * tc + c.swayP);
    let y = c.y + c.vy * age + c.swayA * Math.cos(c.swayF * tc * .8 + c.swayP);
    let z = c.z;
    let rx = c.rx + 3 * Math.sin(tc * 1.1 + c.swayP), ry = c.ry + 4 * Math.sin(tc * .9 + c.swayP), rz = c.rz + c.rr * age + 2 * Math.sin(tc * c.swayF);
    let sr = c.s * pop, sc = c.s * pop * 520 / 300;
    let opacity = clamp(age / .12);
    let realA = 1, chipA = 0, pillA = 1, blur = 0, shadeA = 0;
    const zt0 = z + (t < FREEZE ? cs.z : CAM_Z);
    shadeA = clamp((260 - zt0) / 1500, 0, .6) * .6;
    let p = 0;
    if (c.sorted && t > c.start) {
      p = prog(t, c.start, c.start + c.dur);
      const e = E.out4(p);
      // screen-space quadratic bezier, then un-project at the card's current depth
      const X = (1 - e) * (1 - e) * o.p0[0] + 2 * (1 - e) * e * o.pc[0] + e * e * o.p1[0];
      const Y = (1 - e) * (1 - e) * o.p0[1] + 2 * (1 - e) * e * o.pc[1] + e * e * o.p1[1];
      z = lerp(o.fz, -CAM_Z, e);
      const f = PERSP / (PERSP - (z + CAM_Z));
      x = (X - 540) / f; y = (Y - 960) / f;
      rx = lerp(o.frx, 0, e); ry = lerp(o.fry, 0, e);
      rz = lerp(o.frz, 0, e);
      sr = lerp(c.s, 300 / 520, e);
      sc = lerp(c.s * 520 / 300, 1, e);
      realA = 1 - sm(.18, .55, p); chipA = sm(.32, .72, p); pillA = 1 - sm(0, .3, p);
      blur = Math.max(0, (1 - p) * 0 );
      shadeA = (shadeA + dimAmt) * (1 - E.out2(p));
    } else if (c.sorted) {
      x = o.fx; y = o.fy; z = o.fz;
      rx = o.frx; ry = o.fry; rz = o.frz;
      shadeA += dimAmt;
      if (t < FREEZE) { x = c.x + c.vx * age + c.swayA * Math.sin(c.swayF * tc + c.swayP); y = c.y + c.vy * age + c.swayA * Math.cos(c.swayF * tc * .8 + c.swayP); z = c.z; rx = c.rx + 3 * Math.sin(tc * 1.1 + c.swayP); ry = c.ry + 4 * Math.sin(tc * .9 + c.swayP); rz = c.rz + c.rr * age + 2 * Math.sin(tc * c.swayF); }
    } else if (t > c.fly) {
      const q = prog(t, c.fly, c.fly + .85);
      const e = E.in3(q);
      x = o.fx; y = o.fy; z = o.fz - 3200 * e;
      rx = o.frx; ry = o.fry + 40 * e; rz = o.frz + 12 * e;
      opacity *= 1 - E.in2(clamp(q * 1.15));
      shadeA += dimAmt;
      if (q >= 1) { o.el.style.display = 'none'; continue; }
    } else if (t >= FREEZE) {
      x = o.fx; y = o.fy; z = o.fz; rx = o.frx; ry = o.fry; rz = o.frz;
      shadeA += dimAmt;
    }
    o.el.style.opacity = opacity;
    o.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
    o.real.style.transform = `scale(${sr.toFixed(4)})`;
    o.real.style.opacity = realA;
    o.pill.style.transform = `translate(${(-244 * sr).toFixed(2)}px,${((-c.h / 2 - 17) * sr).toFixed(2)}px) scale(${sr.toFixed(4)})`;
    o.pill.style.opacity = pillA;
    o.shade.style.opacity = Math.min(.8, shadeA).toFixed(3);
    if (o.chip) {
      let bump = 1, ringA = 0, ringS = 1;
      if (c.sorted) {
        const tl = t - c.land;
        if (tl > 0 && tl < .5) { bump = 1 + .07 * Math.sin(Math.PI * clamp(tl / .32)); ringA = Math.pow(1 - tl / .5, 1.5); ringS = 1 + tl * .5; }
        // post-sort shine sweep
        const row = (c.slot.y - 690) / 98, colI = ['KEEP', 'DELEGATE', 'STREAMLINE'].indexOf(c.col);
        const ts2 = 9.85 + row * .055 + colI * .12, q2 = prog(t, ts2, ts2 + .55);
        o.shine.style.opacity = q2 > 0 && q2 < 1 ? 1 : 0;
        o.shine.style.left = lerp(-120, 330, q2) + 'px';
      }
      o.chip.style.transform = `scale(${(sc * bump).toFixed(4)})`;
      o.chip.style.opacity = chipA;
      o.ring.style.opacity = ringA; o.ring.style.transform = `scale(${ringS})`;
      o.shade2.style.opacity = Math.min(.8, shadeA).toFixed(3);
    }
    if (o.g) {
      if (t > c.start && p < 1.001) {
        o.g.style.display = '';
        const head = E.out4(p);
        const st = Math.max(0, head - .3);
        const vis = (head - st) * o.len;
        const off = -st * o.len;
        o.trail.forEach(pa => { pa.style.strokeDasharray = `${Math.max(0, vis).toFixed(1)} ${o.len.toFixed(1)}`; pa.style.strokeDashoffset = off.toFixed(1); });
        o.g.style.opacity = (p > .6 ? 1 - (p - .6) / .4 : 1) * .85;
      } else o.g.style.display = 'none';
    }
  }
}

/* ============================== LANES / HUD 1-3 ============================== */
const COLS = [
  { k: 'KEEP', x: 195, icon: 'star', cap: 'Needs your attention' },
  { k: 'DELEGATE', x: 540, icon: 'send', cap: 'Could be handed off' },
  { k: 'STREAMLINE', x: 885, icon: 'repeat', cap: 'Could be simplified' },
];
function initLanes() {
  const L = $('#lanes');
  S.lanes = COLS.map(col => {
    const lane = document.createElement('div'); lane.className = 'lane ' + col.k;
    lane.style.left = (col.x - 166) + 'px'; lane.style.top = '438px'; lane.style.height = '1200px';
    const head = document.createElement('div'); head.className = 'lh ' + col.k;
    head.style.left = (col.x - 166) + 'px'; head.style.top = '456px';
    const ic = col.k === 'DELEGATE' ? '#0B1B3F' : '#fff';
    head.innerHTML = `<div class="ico">${ico(col.icon, 32, ic, 2.3)}</div><div class="t">${col.k}</div><div class="c">${col.cap}</div><div class="bar"></div>`;
    L.appendChild(lane); L.appendChild(head);
    return { col, lane, head };
  });
}
function updateLanes(t) {
  const show = t > 7.5 && t < 12.45;
  $('#lanes').style.display = show ? '' : 'none';
  if (!show) return;
  const exit = prog(t, 11.5, 12.3), ex = E.in3(exit);
  S.lanes.forEach((l, i) => {
    const p = E.outExpo(prog(t, 7.62 + i * .13, 8.3 + i * .13));
    const hp = E.outExpo(prog(t, 7.85 + i * .13, 8.5 + i * .13));
    l.lane.style.opacity = p * (1 - ex);
    l.lane.style.transform = `translateY(${(1 - p) * 60 + ex * 80}px) scale(${lerp(.96, 1, p)})`;
    l.head.style.opacity = hp * (1 - ex);
    l.head.style.transform = `translateY(${(1 - hp) * 30}px)`;
  });
}

function initHUD() {
  const L = S.lines;
  // --- Scene 1
  L.a1 = new Line($hud, { text: 'ARE YOU', cls: 'white', fit: 900, maxSize: 260, y: 700, t0: 0.02, dur: .4, stag: .028, mode: 'slam', t1: 2.78, out: 'blast', outDur: .32 });
  const S1 = L.a1.o.size, pitch = S1 * .9;
  const yc = 872;
  L.a1.el.style.top = (yc - pitch) + 'px';
  L.a2 = new Line($hud, { text: 'STILL', cls: 'white', size: S1, y: yc, t0: 0.2, dur: .4, stag: .035, mode: 'slam', t1: 2.82, out: 'blast', outDur: .32 });
  L.a3 = new Line($hud, { text: 'DOING', cls: 'gold', size: S1, y: yc + pitch, t0: 0.98, dur: .45, stag: .04, mode: 'slam', t1: 2.86, out: 'blast', outDur: .32, shine: { t0: 1.05, dur: 1.1 } });
  L.a4 = new Line($hud, { text: 'EVERYTHING?', cls: 'gold', fit: 960, maxSize: 200, y: yc + pitch + S1 * .5 + 60, t0: 1.18, dur: .42, stag: .03, mode: 'slam', t1: 2.9, out: 'blast', outDur: .32, shine: { t0: 1.3, dur: 1.1 } });
  L.a4.el.style.top = (yc + pitch + S1 * .46 + L.a4.o.size * .55) + 'px';
  // --- Scene 2: EVERY / WORD
  const words = [['TASK.', 3.24, 4.52], ['DEADLINE.', 4.56, 5.84], ['DAY.', 5.88, 7.14]];
  L.s2 = words.map(([w, t0, t1], i) => {
    const big = new Line($hud, { text: w, cls: 'gold', fit: 920, maxSize: 270, y: 1000, t0: t0 + .05, dur: .4, stag: .035, mode: 'slam', t1, out: i === 2 ? 'blast' : 'maskup', outDur: i === 2 ? .3 : .22, shine: { t0: t0 + .2, dur: .9 } });
    const bs = big.o.size;
    big.el.style.top = '1010px';
    const sm_ = new Line($hud, { text: 'EVERY', cls: 'white', size: 86, ls: .34, y: 1010 - bs * .5 - 52, t0, dur: .35, stag: .03, mode: 'rise', t1, out: i === 2 ? 'blast' : 'maskup', outDur: i === 2 ? .3 : .22 });
    return [sm_, big];
  });
  // --- Scene 3 headline
  L.h3a = new Line($hud, { text: 'WHAT IF YOU KNEW', cls: 'white', fit: 920, maxSize: 120, y: 270, t0: 7.32, dur: .5, stag: .018, mode: 'mask', t1: 11.45, out: 'maskup', outDur: .35, shadow: false });
  const h3 = L.h3a.o.size;
  L.h3a.setSize(h3 * .9);
  L.h3b = new Line($hud, { text: 'WHAT TO DELEGATE?', cls: 'gold', size: h3 * .9, y: 270 + h3 * .9 + 14, t0: 7.5, dur: .5, stag: .018, mode: 'mask', t1: 11.5, out: 'maskup', outDur: .35, shadow: false, shine: { t0: 8.1, dur: 1.3 } });
  L.h3b.fit(920, 120); L.h3a.setSize(L.h3b.o.size);
  L.h3a.el.style.top = '262px'; L.h3b.el.style.top = (262 + L.h3b.o.size + 16) + 'px';
  // --- Scene 4 headline (3 lines)
  L.h4 = [];
  const h4t = ["FIND THE WORK THAT", "DOESN'T NEED TO STAY", "ON YOUR PLATE."];
  const probe = new Line($hud, { text: h4t[1], cls: 'white', fit: 900, maxSize: 90, y: 0, t0: 99 });
  const h4s = probe.o.size; probe.el.remove();
  h4t.forEach((tx, i) => {
    L.h4.push(new Line($hud, { text: tx, cls: i === 2 ? 'gold' : 'white', size: h4s, y: 292 + i * (h4s + 12), t0: 12.55 + i * .17, dur: .5, stag: .014, mode: 'mask', t1: 16.78, out: 'maskup', outDur: .3, shadow: false, shine: i === 2 ? { t0: 13.2, dur: 1.2 } : null }));
  });
  // --- Scene 5 headlines
  const A1 = new Line($hud, { text: 'JUGGLING TASKS.', cls: 'white', fit: 900, maxSize: 120, y: 0, t0: 99 }); const a5 = A1.o.size; A1.el.remove();
  L.h5a = [new Line($hud, { text: 'LESS TIME', cls: 'white', size: a5, y: 292, t0: 17.28, dur: .5, stag: .02, mode: 'mask', t1: 18.88, out: 'maskup', outDur: .32, shadow: false }),
    new Line($hud, { text: 'JUGGLING TASKS.', cls: 'white', size: a5, y: 292 + a5 + 14, t0: 17.42, dur: .5, stag: .016, mode: 'mask', t1: 18.88, out: 'maskup', outDur: .32, shadow: false })];
  const B1 = new Line($hud, { text: 'MORE ROOM', cls: 'gold', fit: 880, maxSize: 124, y: 0, t0: 99 }); const b5 = B1.o.size; B1.el.remove();
  L.h5b = [new Line($hud, { text: 'MORE ROOM', cls: 'gold', size: b5, y: 292, t0: 19.0, dur: .55, stag: .02, mode: 'mask', t1: 20.78, out: 'maskup', outDur: .3, shadow: false, shine: { t0: 19.2, dur: 1.2 } }),
    new Line($hud, { text: 'TO FOCUS.', cls: 'gold', size: b5, y: 292 + b5 + 12, t0: 19.14, dur: .55, stag: .02, mode: 'mask', t1: 20.78, out: 'maskup', outDur: .3, shadow: false, shine: { t0: 19.4, dur: 1.2 } })];
  S.h5size = [a5, b5];
}
function updateHUD(t) {
  const L = S.lines;
  [L.a1, L.a2, L.a3, L.a4, L.h3a, L.h3b, ...L.h4, ...L.h5a, ...L.h5b].forEach(l => l.update(t));
  L.s2.forEach(pair => pair.forEach(l => l.update(t)));
}
function initDim() {
  $('#dim').innerHTML = `<div id="d1" style="position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse 760px 560px at 50% 53%,rgba(3,9,28,.86),rgba(3,9,28,.5) 62%,rgba(3,9,28,0) 100%)"></div><div id="d2" style="position:absolute;inset:0;opacity:0;background:linear-gradient(180deg,rgba(3,9,28,.92) 0,rgba(3,9,28,.72) 300px,rgba(3,9,28,0) 440px)"></div>`;
}
function updateDim(t) {
  const d1 = sm(3.05, 3.5, t) * (1 - sm(7.1, 7.5, t));
  const d2 = sm(7.0, 7.4, t) * (1 - sm(11.2, 11.8, t));
  const e1 = $('#d1'), e2 = $('#d2');
  if (e1) e1.style.opacity = d1;
  if (e2) e2.style.opacity = d2 * (t < 7.3 ? 1 : 1);
}

/* ============================== SCENE 4 : AUDIT WORKSPACE ============================== */
const ROWS = [
  { t: 'Sorting the inbox', f: 'EVERY DAY', i: 'mail', tag: 'DELEGATE', o0: 0, o1: 1 },
  { t: 'Booking client calls', f: 'EVERY DAY', i: 'calendar', tag: 'STREAMLINE', o0: 1, o1: 4 },
  { t: 'Posting on social media', f: 'EVERY WEEK', i: 'share', tag: 'DELEGATE', o0: 2, o1: 2 },
  { t: 'Following up with leads', f: 'EVERY DAY', i: 'send', tag: 'DELEGATE', o0: 3, o1: 0 },
  { t: 'Writing weekly reports', f: 'EVERY WEEK', i: 'file', tag: 'DELEGATE', o0: 4, o1: 3 },
  { t: 'Choosing business direction', f: 'YOUR CALL', i: 'flag', tag: 'KEEP', o0: 5, o1: 5 },
];
const ROW_Y0 = 312, ROW_P = 98;
function initS4() {
  const root = $('#s4');
  const card = document.createElement('div'); card.className = 's4card';
  card.innerHTML = `<div class="s4hd"><div class="a">BUSINESS DELEGATION AUDIT</div><div class="b">PLANNING WORKSPACE</div><div class="g"></div></div>
  <div id="steps"></div><div class="steptitle" id="stt"></div><div class="rule"></div><div id="rows"></div><div id="scanb" class="scanband" style="display:none"></div>
  <svg id="conn" width="960" height="940" viewBox="0 0 960 940" style="position:absolute;left:0;top:0;pointer-events:none"></svg>`;
  root.appendChild(card);
  $('#decor').innerHTML = `<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0"><g id="arcs" fill="none" stroke="#E8C872" stroke-width="2"><circle cx="1180" cy="1700" r="520" opacity=".30"/><circle cx="1180" cy="1700" r="700" opacity=".20"/><circle cx="1180" cy="1700" r="900" opacity=".12"/><circle cx="-120" cy="1560" r="420" opacity=".18"/><circle cx="-120" cy="1560" r="600" opacity=".10"/></g></svg>`;
  S.s4 = { card };
  // steps
  const sx = [40, 350, 660], names = ['REVIEW', 'IDENTIFY', 'PRIORITIZE'];
  const stepsEl = card.querySelector('#steps');
  S.s4.steps = names.map((n, i) => {
    const d = document.createElement('div'); d.className = 'step'; d.style.left = sx[i] + 'px';
    d.innerHTML = `<div class="n">${i + 1}</div><div class="lb">${n}</div>`;
    stepsEl.appendChild(d); return d;
  });
  stepsEl.insertAdjacentHTML('afterbegin', `<div id="sl1" style="position:absolute;left:205px;top:156px;width:130px;height:3px;background:#D5DBE9;border-radius:2px"></div><div id="sl1p" style="position:absolute;left:${40 + 44 + 10 + 140}px;top:156px;width:0;height:3px;background:#C9A04A;border-radius:2px"></div><div id="sl2" style="position:absolute;left:545px;top:156px;width:105px;height:3px;background:#D5DBE9;border-radius:2px"></div><div id="sl2p" style="position:absolute;left:${350 + 44 + 10 + 160}px;top:156px;width:0;height:3px;background:#C9A04A;border-radius:2px"></div>`);
  // step titles
  const titles = ['REVIEW YOUR WORKLOAD', 'IDENTIFY DELEGATION OPPORTUNITIES', 'PRIORITIZE YOUR NEXT STEPS'];
  const stt = card.querySelector('#stt');
  S.s4.titles = titles.map(tx => { const d = document.createElement('div'); d.className = 'st'; d.textContent = tx; d.style.opacity = 0; stt.appendChild(d); return d; });
  // rows
  const rowsEl = card.querySelector('#rows');
  S.s4.rows = ROWS.map((r, i) => {
    const d = document.createElement('div'); d.className = 'row';
    d.innerHTML = `<div class="ri">${ico(r.i, 28, '#12306E', 2.2)}</div><div class="rx"><div class="rt">${r.t}</div><div class="rf">${r.f}</div></div><div class="tag ${r.tag}" style="opacity:0">${r.tag}</div>`;
    rowsEl.appendChild(d);
    const num = document.createElement('div'); num.className = 'num'; num.style.opacity = 0; d.appendChild(num);
    const go = document.createElement('div'); go.className = 'go'; go.textContent = 'START HERE'; go.style.opacity = 0; d.appendChild(go);
    return { d, r, tag: d.querySelector('.tag'), num, go };
  });
  card.querySelector('#conn').innerHTML = `<path id="connp" d="M10,${ROW_Y0 + 42} L10,${ROW_Y0 + 2 * ROW_P + 42}" stroke="#C9A04A" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round" fill="none"/>`;
  S.s4.connLen = card.querySelector('#connp').getTotalLength();
}
function updateS4(t) {
  const root = $('#s4');
  const vis = t > 11.8 && t < 17.5;
  root.style.display = vis ? '' : 'none';
  $('#decor').style.opacity = sm(12.2, 13, t) * (1 - sm(16.8, 17.5, t));
  if (!vis) return;
  const { card, steps, titles, rows } = S.s4;
  const pin = E.outExpo(prog(t, 11.88, 12.8)), pout = E.in3(prog(t, 16.72, 17.45));
  const fl = sm(12.8, 14, t);
  const rx = (1 - pin) * 36 + 1.6 * Math.cos((t - 12) * .7) * fl;
  const ry = -3.5 * (1 - pin) + 2.6 * Math.sin((t - 12) * .55) + pout * 70;
  card.style.opacity = clamp(pin * 2.2) * (1 - clamp(pout * 1.3));
  card.style.transform = `translate3d(${-pout * 1250}px,${(1 - pin) * 950}px,${(1 - pin) * -300}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${lerp(.9, 1, pin)})`;
  // stepper state
  const act = t < 14.0 ? 0 : t < 15.2 ? 1 : 2;
  steps.forEach((s, i) => {
    const n = s.querySelector('.n'), lb = s.querySelector('.lb');
    const done = i < act, on = i === act && t > 12.75;
    n.style.background = done ? '#12306E' : on ? 'linear-gradient(180deg,#F1D58A,#C9A04A)' : '#fff';
    n.style.borderColor = done ? '#12306E' : on ? '#C9A04A' : '#C4CBDC';
    n.style.color = done ? '#fff' : on ? '#0B1B3F' : '#8B96B2';
    n.innerHTML = done ? ico('check', 24, '#fff', 3.2) : (i + 1);
    lb.style.color = (on || done) ? '#0B1B3F' : '#8B96B2';
    const pp = on ? E.outBack(prog(t, [12.75, 14.0, 15.2][i], [12.75, 14.0, 15.2][i] + .35), 2.2) : 1;
    n.style.transform = `scale(${on ? lerp(.8, 1, pp) : 1})`;
  });
  $('#sl1p').style.width = 130 * E.io2(prog(t, 13.75, 14.1)) + 'px';
  $('#sl2p').style.width = 105 * E.io2(prog(t, 14.95, 15.3)) + 'px';
  // step titles
  const tin = [12.8, 14.05, 15.25], tout = [13.95, 15.2, 99];
  titles.forEach((d, i) => {
    const a = E.outExpo(prog(t, tin[i], tin[i] + .45)), b = E.in3(prog(t, tout[i], tout[i] + .28));
    d.style.opacity = t >= tin[i] && t < tout[i] + .3 ? 1 : 0;
    d.style.transform = `translateY(${(1 - a) * 66 - b * 66}px)`;
    d.style.fontSize = i === 1 ? '37px' : '40px';
  });
  // rows
  rows.forEach((R, i) => {
    const a = E.outExpo(prog(t, 12.95 + i * .09, 13.55 + i * .09));
    // reorder
    const mv = E.io3(prog(t, 15.35 + i * .045, 15.95 + i * .045));
    const slot = lerp(R.r.o0, R.r.o1, mv);
    const y = ROW_Y0 + slot * ROW_P;
    const top3 = R.r.o1 <= 2;
    const dimP = sm(16.0, 16.35, t);
    let op = clamp(a * 1.6);
    if (!top3 || R.r.tag === 'KEEP') op *= 1 - .52 * dimP;
    R.d.style.opacity = op;
    R.d.style.top = y + 'px';
    R.d.style.transform = `translateX(${(1 - a) * 140}px)`;
    // tags
    const tp = E.outBack(prog(t, 14.28 + i * .13, 14.62 + i * .13), 2.4);
    R.tag.style.opacity = clamp(tp * 3);
    R.tag.style.transform = `scale(${lerp(.4, 1, tp)})`;
    // tint by tag
    const tint = sm(14.3 + i * .13, 14.7 + i * .13, t);
    let bg = '#fff', ring = '#E4E8F1';
    if (R.r.tag === 'DELEGATE') { bg = mixc('#ffffff', '#FFF6DC', tint); ring = mixc('#E4E8F1', '#E0B85A', tint); }
    if (R.r.tag === 'KEEP') { bg = mixc('#ffffff', '#E9EEF9', tint); ring = mixc('#E4E8F1', '#12306E', tint); }
    if (R.r.tag === 'STREAMLINE') { bg = mixc('#ffffff', '#EEF3FB', tint); ring = mixc('#E4E8F1', '#5B7BB0', tint); }
    // review scan highlight
    const sc = Math.exp(-Math.pow((t - (13.45 + i * .1)) / .14, 2));
    if (sc > .02) ring = mixc(ring, '#C9A04A', clamp(sc * 1.2));
    R.d.style.background = bg;
    R.d.style.boxShadow = `0 8px 22px rgba(11,27,63,${.10 + .12 * sc}),inset 0 0 0 ${1.5 + 1.5 * (tint + sc * .5)}px ${ring}`;
    // numbers
    if (top3) {
      const k = R.r.o1, np = E.outBack(prog(t, 16.0 + k * .13, 16.32 + k * .13), 2.6);
      R.num.style.opacity = clamp(np * 3); R.num.textContent = k + 1; R.num.style.transform = `scale(${lerp(.3, 1, np)})`;
    }
    if (R.r.o1 === 0) { const gp = E.outBack(prog(t, 16.38, 16.62), 2.2); R.go.style.opacity = clamp(gp * 3); R.go.style.transform = `scale(${lerp(.5, 1, gp)})`; }
  });
  // scan band
  const sb = $('#scanb');
  const sp = prog(t, 13.28, 14.05);
  sb.style.display = sp > 0 && sp < 1 ? '' : 'none';
  sb.style.top = (ROW_Y0 - 8 + E.io2(sp) * (ROW_P * 5)) + 'px';
  sb.style.opacity = Math.sin(Math.PI * sp);
  // connector
  const cp = E.io2(prog(t, 16.1, 16.55));
  const pth = $('#connp');
  pth.style.opacity = cp > 0 ? 1 : 0;
  pth.setAttribute('stroke-dashoffset', '0');
  pth.setAttribute('d', `M10,${ROW_Y0 + 42} L10,${ROW_Y0 + 42 + 2 * ROW_P * cp}`);
}

/* ============================== SCENE 5 : LESS JUGGLING, MORE ROOM ============================== */
const HOURS0 = 8, HY0 = 84, HP = 76;
const hy = h => HY0 + (h - HOURS0) * HP;
const CLUT = [
  { n: 'Inbox', s: 'Replies and sorting', h: 9.0, d: 1.5, x: 0, w: 520, c: '#5B7BB0', r: -1.2 },
  { n: 'Client follow-ups', s: 'Leads and check-ins', h: 9.5, d: 1.5, x: 100, w: 520, c: '#E0766B', r: 1.0 },
  { n: 'Social posts', s: 'Captions and scheduling', h: 10.0, d: 1.25, x: 200, w: 520, c: '#8B7BE8', r: -.8 },
  { n: 'Weekly report', s: 'Draft and review', h: 10.5, d: 1.75, x: 60, w: 560, c: '#36A3A3', r: 1.4 },
  { n: 'Scheduling', s: 'Booking and reminders', h: 11.0, d: 1.25, x: 220, w: 520, c: '#3D6FD9', r: -1.0 },
  { n: 'Research', s: 'Vendors and ideas', h: 13.0, d: 1.5, x: 0, w: 520, c: '#D9A441', r: .9 },
  { n: 'Website edits', s: 'Pages and updates', h: 13.5, d: 1.5, x: 130, w: 520, c: '#E0766B', r: -1.3 },
];
function initS5() {
  const root = $('#s5');
  const wrap = document.createElement('div'); wrap.style.cssText = 'position:absolute;inset:0;';
  // workflow nodes
  const labels = ['CLEAR<br>RESPONSIBILITIES', 'DELEGATION<br>OPPORTUNITIES', 'ORGANIZED<br>WORKFLOWS'];
  const xs = [190, 540, 890];
  let nodes = `<div id="n_l1" style="position:absolute;left:${190 + 50}px;top:586px;width:${300 - 100}px;height:4px;border-radius:2px;background:rgba(255,255,255,.22)"></div><div id="n_l1p" style="position:absolute;left:${190 + 50}px;top:586px;width:0;height:4px;border-radius:2px;background:linear-gradient(90deg,#C9A04A,#F1D58A)"></div><div id="n_l2" style="position:absolute;left:${540 + 50}px;top:586px;width:${300 - 100}px;height:4px;border-radius:2px;background:rgba(255,255,255,.22)"></div><div id="n_l2p" style="position:absolute;left:${540 + 50}px;top:586px;width:0;height:4px;border-radius:2px;background:linear-gradient(90deg,#C9A04A,#F1D58A)"></div>`;
  xs.forEach((x, i) => { nodes += `<div class="nd" id="nd${i}" style="left:${x - 150}px;top:544px"><div class="c"><div class="ck" style="position:absolute;inset:0;border-radius:50%;background:linear-gradient(180deg,#F1D58A,#C9A04A);opacity:0"></div><div style="position:relative">${ico('check', 40, '#0B1B3F', 3.2)}</div></div><div class="l">${labels[i]}</div></div>`; });
  wrap.innerHTML = nodes;
  const cal = document.createElement('div'); cal.className = 'cal'; cal.id = 'cal';
  let inner = `<div class="ch"><div class="d">TUESDAY</div><div class="e">YOUR DAY</div></div>`;
  for (let h = 8; h <= 16; h++) inner += `<div class="hr" style="top:${hy(h)}px"></div><div class="hl" style="top:${hy(h) - 11}px">${h <= 12 ? h : h - 12} ${h < 12 ? 'AM' : 'PM'}</div>`;
  cal.innerHTML = inner;
  const evWrap = document.createElement('div'); evWrap.style.cssText = 'position:absolute;left:128px;top:0;width:740px;height:770px';
  cal.appendChild(evWrap);
  const keep = document.createElement('div'); keep.className = 'ev'; keep.style.cssText = `left:0;width:740px;top:${hy(10)}px;height:${HP}px;background:linear-gradient(100deg,#0B1B3F,#12306E)`;
  keep.innerHTML = `<div class="stripe" style="background:#E8C872"></div><div style="padding-left:8px">Strategy call<small>Your time - needs your attention</small></div>`;
  evWrap.appendChild(keep);
  const clut = CLUT.map(e => {
    const d = document.createElement('div'); d.className = 'ev';
    d.style.cssText = `left:${e.x}px;width:${e.w}px;top:${hy(e.h)}px;height:${e.d * HP - 4}px;background:${e.c}`;
    d.innerHTML = `<div class="stripe"></div><div style="padding-left:8px">${e.n}<small>${e.s}</small></div>`;
    evWrap.appendChild(d); return { d, e };
  });
  const focus = document.createElement('div'); focus.className = 'focus';
  focus.style.cssText = `left:0;width:740px;top:${hy(11.5)}px;height:${hy(15.5) - hy(11.5)}px;transform-origin:50% 50%`;
  focus.innerHTML = `<div class="a">FOCUS TIME</div><div class="b">ROOM FOR WHAT<br>MATTERS MOST</div><div class="sh"></div>`;
  evWrap.appendChild(focus);
  root.appendChild(wrap); root.appendChild(cal);
  S.s5 = { wrap, cal, keep, clut, focus };
}
function updateS5(t) {
  const root = $('#s5');
  const vis = t > 16.85 && t < 21.5;
  root.style.display = vis ? '' : 'none';
  if (!vis) return;
  const { wrap, cal, keep, clut, focus } = S.s5;
  const pin = E.outExpo(prog(t, 16.95, 17.75)), pout = E.in3(prog(t, 20.82, 21.25));
  const fl = Math.sin((t - 17) * .6);
  cal.style.opacity = clamp(pin * 2) * (1 - pout);
  cal.style.transform = `translate3d(${(1 - pin) * 1100}px,${pout * 60}px,${-pout * 500}px) rotateY(${(1 - pin) * -60 + fl * 1.8}deg) rotateX(${2.2 * Math.sin((t - 17) * .5)}deg) scale(${1 - pout * .1})`;
  wrap.style.opacity = clamp(pin * 2) * (1 - pout);
  wrap.style.transform = `translateY(${(1 - pin) * -40}px)`;
  // nodes
  const na = [17.75, 18.25, 18.75];
  for (let i = 0; i < 3; i++) {
    const p = E.outBack(prog(t, na[i], na[i] + .35), 2.3);
    const nd = $('#nd' + i);
    nd.querySelector('.ck').style.opacity = clamp(p * 3);
    nd.querySelector('.c').style.transform = `scale(${lerp(1, 1.08, Math.sin(Math.PI * prog(t, na[i], na[i] + .4)) )})`;
    nd.querySelector('.l').style.color = mixc('#9FB2D6', '#FFFFFF', clamp(p));
    nd.querySelector('svg').style.opacity = p > 0 ? 1 : .35;
  }
  $('#n_l1p').style.width = 200 * E.io2(prog(t, 18.0, 18.3)) + 'px';
  $('#n_l2p').style.width = 200 * E.io2(prog(t, 18.5, 18.8)) + 'px';
  // clutter in
  clut.forEach((o, i) => {
    const a = E.outBack(prog(t, 17.3 + i * .05, 17.62 + i * .05), 1.6);
    const outT = 17.95 + i * .085;
    const b = E.in3(prog(t, outT, outT + .5));
    o.d.style.opacity = clamp(a * 2) * (1 - clamp(b * 1.2));
    o.d.style.transform = `translateX(${b * 980}px) rotate(${o.e.r * (1 - b * 0.6) * (1 - sm(17.9, 18.5, t))}deg) scale(${lerp(.92, 1, a)})`;
    o.d.style.display = b >= 1 ? 'none' : '';
  });
  keep.style.opacity = clamp(prog(t, 17.3, 17.55));
  // focus
  const f = E.outExpo(prog(t, 19.0, 19.75));
  focus.style.opacity = clamp(f * 2.5);
  focus.style.transform = `scaleY(${lerp(.1, 1, f)}) scaleX(${lerp(.9, 1, f)})`;
  const fs = focus.querySelector('.sh');
  const sp = prog(t, 19.55, 20.25);
  fs.style.left = lerp(-200, 900, E.io2(sp)) + 'px';
  focus.querySelector('.a').style.opacity = sm(19.4, 19.7, t);
  focus.querySelector('.b').style.opacity = sm(19.45, 19.8, t);
  focus.querySelector('.b').style.transform = `translateY(${(1 - E.outExpo(prog(t, 19.45, 19.95))) * 24}px)`;
}

/* ============================== SCENE 6 : FINAL CTA ============================== */
function initS6() {
  const root = $('#s6');
  const L = S.lines;
  const beam = document.createElement('div');
  beam.id = 'beam';
  beam.style.cssText = 'position:absolute;left:0;top:0;width:1080px;height:1920px;';
  beam.innerHTML = `<div id="bm1" style="position:absolute;left:-200px;top:-200px;width:520px;height:2400px;background:linear-gradient(90deg,transparent,rgba(232,200,114,.20),transparent);transform:rotate(22deg);filter:blur(10px)"></div><div id="bm2" style="position:absolute;left:700px;top:-200px;width:360px;height:2400px;background:linear-gradient(90deg,transparent,rgba(232,200,114,.12),transparent);transform:rotate(22deg);filter:blur(10px)"></div>`;
  root.appendChild(beam);
  const tl = new Line(root, { text: 'DELEGATION', cls: 'white', fit: 920, maxSize: 150, y: 0, t0: 99 }); const ts = tl.o.size; tl.el.remove();
  const ty = 300, tp = ts * .94;
  L.t6 = [
    new Line(root, { text: 'BUSINESS', cls: 'white', size: ts, y: ty, t0: 21.1, dur: .55, stag: .02, mode: 'mask', t1: 99, shadow: false }),
    new Line(root, { text: 'DELEGATION', cls: 'white', size: ts, y: ty + tp, t0: 21.24, dur: .55, stag: .02, mode: 'mask', t1: 99, shadow: false }),
    new Line(root, { text: 'AUDIT', cls: 'gold', size: ts, y: ty + tp * 2, t0: 21.38, dur: .55, stag: .03, mode: 'mask', t1: 99, shadow: false, shine: { t0: 21.7, dur: 1.2 } }),
  ];
  L.sub6 = [
    new Line(root, { text: 'FIND OUT WHAT YOU', cls: 'white', size: 50, ls: .06, weight: 800, y: 735, t0: 21.95, dur: .45, stag: .012, mode: 'mask', t1: 99, shadow: false }),
    new Line(root, { text: 'CAN DELEGATE.', cls: 'gold', size: 50, ls: .06, weight: 800, y: 797, t0: 22.08, dur: .45, stag: .016, mode: 'mask', t1: 99, shadow: false, shine: { t0: 22.4, dur: 1.0 } }),
  ];
  const rule = document.createElement('div'); rule.id = 'rule6';
  rule.style.cssText = `position:absolute;left:540px;top:${ty + tp * 2 + ts * .55 + 14}px;height:4px;width:0;margin-left:0;transform:translateX(-50%);background:linear-gradient(90deg,transparent,#E8C872,transparent);border-radius:2px;box-shadow:0 0 24px rgba(232,200,114,.7)`;
  root.appendChild(rule); S.rule6y = ty + tp * 2 + ts * .55 + 14;
  const cov = document.createElement('div'); cov.id = 'covw'; cov.style.cssText = 'position:absolute;left:356px;top:850px;width:368px;height:460px;';
  cov.innerHTML = `<div class="cover"><img src="../assets/cover.png"><div class="glare"></div></div>`;
  root.appendChild(cov);
  const wm = document.createElement('div'); wm.id = 'wm6'; wm.className = 'wm'; wm.style.cssText += ';left:540px;top:1378px;font-size:60px';
  wm.innerHTML = `<span style="color:#fff">PROVIRTUAL</span> <span id="wph" style="background:linear-gradient(180deg,#F7DE95,#C9A04A 60%,#A8782A);-webkit-background-clip:text;background-clip:text;color:transparent">PH</span>`;
  root.appendChild(wm);
  const wl = document.createElement('div'); wl.id = 'wl6'; wl.style.cssText = 'position:absolute;left:540px;top:1422px;height:3px;width:0;transform:translateX(-50%);background:linear-gradient(90deg,transparent,#E8C872,transparent)';
  root.appendChild(wl);
  const cta = document.createElement('div'); cta.id = 'ctaw'; cta.style.cssText = 'position:absolute;left:110px;top:1470px;width:860px;height:118px;';
  cta.innerHTML = `<div class="cta"><span id="ctat">DM &ldquo;AUDIT&rdquo; TO GET STARTED</span><div class="sh"></div></div>`;
  root.appendChild(cta);
  const star = document.createElement('div'); star.id = 'star6';
  star.style.cssText = 'position:absolute;left:0;top:0;width:90px;height:90px;margin:-45px 0 0 -45px;opacity:0';
  star.innerHTML = `<svg viewBox="-50 -50 100 100" width="90" height="90"><path d="M0,-46 C3,-12 12,-3 46,0 C12,3 3,12 0,46 C-3,12 -12,3 -46,0 C-12,-3 -3,-12 0,-46Z" fill="#FFF3C4"/></svg>`;
  root.appendChild(star);
  S.s6 = { beam, rule, cov, wm, wl, cta, star };
}
function updateS6(t) {
  const root = $('#s6');
  const vis = t > 20.85;
  root.style.display = vis ? '' : 'none';
  if (!vis) return;
  const L = S.lines;
  L.t6.forEach(l => l.update(t)); L.sub6.forEach(l => l.update(t));
  const { beam, rule, cov, wm, wl, cta, star } = S.s6;
  $('#bm1').style.transform = `translateX(${lerp(-300, 500, E.io2(prog(t, 21, 25)))}px) rotate(22deg)`;
  $('#bm2').style.transform = `translateX(${lerp(200, -300, E.io2(prog(t, 21, 25)))}px) rotate(22deg)`;
  beam.style.opacity = sm(20.95, 21.6, t);
  // rule
  const rp = E.outExpo(prog(t, 21.75, 22.4));
  rule.style.width = 560 * rp + 'px'; rule.style.opacity = rp > 0 ? 1 : 0;
  // cover
  const cp = E.outExpo(prog(t, 22.0, 22.95));
  const bob = Math.sin((t - 22) * 1.3);
  cov.style.opacity = clamp(cp * 2.2);
  cov.style.transform = `translateY(${(1 - cp) * 300 + bob * 6}px) rotateY(${lerp(-55, -13, cp) + Math.sin((t - 22) * .9) * 3}deg) rotateX(${lerp(14, 3, cp)}deg) scale(${lerp(.82, 1, cp)})`;
  const gl = prog(t, 22.9, 23.6);
  cov.querySelector('.glare').style.transform = `translateX(${lerp(-120, 120, E.io2(gl))}%)`;
  // wordmark
  const wp = E.outExpo(prog(t, 22.5, 23.1));
  wm.style.opacity = clamp(wp * 2.5);
  wm.style.transform = `translate(-50%,-50%) translateY(${(1 - wp) * 30}px)`;
  wm.style.letterSpacing = lerp(.5, .2, wp) + 'em';
  wl.style.width = 640 * E.outExpo(prog(t, 22.8, 23.4)) + 'px';
  // CTA
  const ca = E.outBack(prog(t, 22.9, 23.55), 1.5);
  const pulse = 1 + .012 * Math.sin((t - 23.6) * 6) * sm(23.6, 24, t);
  cta.style.opacity = clamp(ca * 3);
  cta.style.transform = `scale(${lerp(.7, 1, ca) * pulse})`;
  cta.querySelector('.sh').style.left = lerp(-250, 1000, E.io2(prog(t, 23.55, 24.25))) + 'px';
  // final accent: second shimmer + star on PH + gold sweep
  const sp2 = prog(t, 24.3, 24.95);
  const sh2 = cta.querySelector('.sh');
  if (sp2 > 0) sh2.style.left = lerp(-250, 1000, E.io2(sp2)) + 'px';
  const ph = $('#wph').getBoundingClientRect();
  const stp = prog(t, 23.9, 24.6);
  star.style.left = (ph.right - 14) + 'px'; star.style.top = (ph.top + 6) + 'px';
  star.style.opacity = Math.sin(Math.PI * stp);
  star.style.transform = `scale(${lerp(.2, 1.5, E.outExpo(stp))}) rotate(${stp * 90}deg)`;
}

/* ============================== FX ============================== */
function updateFX(t) {
  // freeze scan line
  const sp = prog(t, FREEZE, FREEZE + .6);
  const scan = $('#scan');
  scan.style.display = sp > 0 && sp < 1 ? '' : 'none';
  if (sp > 0 && sp < 1) {
    const y = lerp(-20, 1960, E.io2(sp));
    scan.querySelector('.scanline').style.top = y + 'px';
    scan.querySelector('.scantail').style.top = (y - 260) + 'px';
    scan.style.opacity = 1 - sm(.8, 1, sp);
  }
  // transition sweeps
  const sw = $('#sweep'), sweepEl = sw.firstElementChild;
  let sx = null, a = 0;
  [[11.75, 12.45], [16.85, 17.5], [20.82, 21.35]].forEach(([a0, a1]) => { const q = prog(t, a0, a1); if (q > 0 && q < 1) { sx = lerp(-500, 1500, E.io2(q)); a = Math.sin(Math.PI * q); } });
  sw.style.display = sx === null ? 'none' : '';
  if (sx !== null) { sweepEl.style.left = sx + 'px'; sw.style.opacity = a * .9; }
  // flashes
  let fl = 0;
  fl = Math.max(fl, .30 * (1 - prog(t, FREEZE, FREEZE + .22)) * (t >= FREEZE ? 1 : 0));
  fl = Math.max(fl, .38 * (1 - prog(t, 21.0, 21.4)) * (t >= 21.0 ? 1 : 0));
  fl = Math.max(fl, .16 * (1 - prog(t, 0.98, 1.3)) * (t >= .98 ? 1 : 0));
  $('#flash').style.opacity = fl;
  $('#flash').style.background = (t > 20 || (t > .9 && t < 1.4)) ? '#F7E3A0' : '#fff';
}

/* ============================== MAIN ============================== */
window.render = function (t) {
  if (!S.ready) return false;
  updateBG(t);
  updateWorld(t);
  updateLanes(t);
  updateHUD(t);
  updateDim(t);
  updateS4(t);
  updateS5(t);
  updateS6(t);
  updateFX(t);
  return true;
};
(async function init() {
  await document.fonts.ready;
  try { await document.fonts.load('900 100px "Inter Display"'); await document.fonts.load('800 24px "Inter"'); await document.fonts.load('700 24px "Inter"'); } catch (e) {}
  initDim(); initWorld(); initLanes(); initHUD(); initS4(); initS5(); initS6();
  const img = document.querySelector('.cover img');
  if (img && !img.complete) await new Promise(r => { img.onload = r; img.onerror = r; });
  S.ready = true;
  window.__ready = true;
})();
