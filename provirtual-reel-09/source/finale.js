/* ===== THREAD + ECOSYSTEM (scene 6) + FINAL BRAND FRAME (scene 7) ===== */
const ORDER = ['ops', 'mkt', 'web', 'res', 'con'];
const NAMES = { ops: 'OPERATIONS', mkt: 'MARKETING', web: 'WEBSITES', res: 'RESEARCH', con: 'CONTENT' };
const SUBS = { ops: 'Admin · Scheduling · Reports', mkt: 'Social · Content · SEO', web: 'Sites · Funnels · Leads', res: 'Research · Lead gen · CRM', con: 'Video · Podcast · Shorts' };
const ICN = { ops: 'cal', mkt: 'trend', web: 'globe', res: 'search', con: 'film' };

/* ---- world SVG: thread, spokes, hub rings ---- */
const svgNS = 'http://www.w3.org/2000/svg';
const wsvg = document.createElementNS(svgNS, 'svg');
wsvg.setAttribute('width', 4800); wsvg.setAttribute('height', 6000); wsvg.setAttribute('viewBox', '-2400 -3000 4800 6000');
wsvg.style.cssText = 'position:absolute;left:-2400px;top:-3000px;transform:translateZ(-70px);overflow:visible';
world.insertBefore(wsvg, world.firstChild);
function mkp(d, stroke, w, extra = '') { const p = document.createElementNS(svgNS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', w); p.setAttribute('stroke-linecap', 'round'); if (extra) p.setAttribute('style', extra); wsvg.appendChild(p); return p; }
function ctrl(a, b, bulge) { // control points bulging away from origin
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = Math.hypot(mx, my) || 1;
  return [mx + mx / L * bulge, my + my / L * bulge];
}
const segs = [];
for (let i = 0; i < 5; i++) {
  const a = STN[ORDER[i]], b = STN[ORDER[(i + 1) % 5]];
  const c = ctrl(a, b, 520);
  const d = `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`;
  const glow = mkp(d, 'rgba(212,168,75,.25)', 44);
  const line = mkp(d, '#d4a84b', 14);
  const L = line.getTotalLength();
  [glow, line].forEach(p => p.style.strokeDasharray = L);
  segs.push({ glow, line, L, d });
}
const THR = [[8.35, 9.45], [13.4, 14.5], [18.4, 19.5], [21.85, 22.95], [25.0, 26.2]];
A(t => segs.forEach((s, i) => { const k = E.io3(P(t, THR[i][0], THR[i][1])); s.glow.style.strokeDashoffset = s.line.style.strokeDashoffset = s.L * (1 - k); }));
// spokes
const spokes = ORDER.map((id, i) => {
  const a = STN[id];
  const d = `M0,0 L${a[0]},${a[1]}`;
  const glow = mkp(d, 'rgba(240,207,133,.22)', 40), line = mkp(d, '#f0cf85', 10);
  const L = line.getTotalLength(); [glow, line].forEach(p => p.style.strokeDasharray = L);
  const pulse = document.createElementNS(svgNS, 'circle'); pulse.setAttribute('r', 36); pulse.setAttribute('fill', '#fff'); pulse.setAttribute('style', 'filter:drop-shadow(0 0 24px #f0cf85)'); wsvg.appendChild(pulse);
  return { glow, line, L, pulse, a };
});
// hub rings
const hubRings = [0, 1, 2].map(i => { const c = document.createElementNS(svgNS, 'circle'); c.setAttribute('cx', 0); c.setAttribute('cy', 0); c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#d4a84b'); c.setAttribute('stroke-width', 10); wsvg.appendChild(c); return c; });
const hubDisc = document.createElementNS(svgNS, 'circle'); hubDisc.setAttribute('cx', 0); hubDisc.setAttribute('cy', 0); hubDisc.setAttribute('fill', '#12285a'); hubDisc.setAttribute('stroke', '#d4a84b'); hubDisc.setAttribute('stroke-width', 18); wsvg.appendChild(hubDisc);
A(t => {
  spokes.forEach((s, i) => {
    const k = E.out3(P(t, 25.35 + i * .12, 26.1 + i * .12));
    s.glow.style.strokeDashoffset = s.line.style.strokeDashoffset = s.L * (1 - k);
    const pk = ((t - 25.9 - i * .17) * .9) % 1;
    const on = t > 25.9 + i * .17 && t < 27.6;
    s.pulse.setAttribute('opacity', on ? 1 : 0);
    const f = on ? (pk < 0 ? pk + 1 : pk) : 0;
    s.pulse.setAttribute('cx', s.a[0] * (1 - f)); s.pulse.setAttribute('cy', s.a[1] * (1 - f));
  });
  const hk = E.back2(P(t, 25.2, 25.8));
  hubDisc.setAttribute('r', 330 * Math.max(0, hk)); hubDisc.setAttribute('opacity', clamp(hk * 3));
  hubRings.forEach((c, i) => { const k = ((t - 25.7 - i * .55) * .7); const f = k < 0 ? 0 : k % 1; c.setAttribute('r', 340 + f * 760); c.setAttribute('opacity', k < 0 ? 0 : (1 - f) * .75); });
});
// station clusters shrink + calm for ecosystem moment
A(t => {
  const k = E.io3(P(t, 24.7, 26.0));
  ORDER.forEach(id => { const s = STATIONS[id]; s.scale = lerp(1, .5, k); s.el.style.transform = `scale(${s.scale})`; });
});

/* ---- projection (screen overlay positions) ---- */
function proj(wx, wy, c) {
  const d = Math.PI / 180;
  let x = wx - c.x, y = wy - c.y, z = 0;
  const rz = c.rz * d; let x1 = x * Math.cos(rz) - y * Math.sin(rz), y1 = x * Math.sin(rz) + y * Math.cos(rz); x = x1; y = y1;
  const ry = c.ry * d; let x2 = x * Math.cos(ry) + z * Math.sin(ry), z2 = -x * Math.sin(ry) + z * Math.cos(ry); x = x2; z = z2;
  const rx = c.rx * d; let y3 = y * Math.cos(rx) - z * Math.sin(rx), z3 = y * Math.sin(rx) + z * Math.cos(rx); y = y3; z = z3;
  z += PERSP * (1 - 1 / c.s);
  const k = PERSP / (PERSP - z);
  return [540 + x * k, 580 + y * k, k];
}

/* ---- ecosystem overlay (screen space) ---- */
const eco = div('', 'position:absolute;inset:0;pointer-events:none;opacity:0', null, $('shake'));
$('shake').insertBefore(eco, $('txt'));
const ecodim = div('', 'position:absolute;inset:0;background:radial-gradient(70% 50% at 50% 38%,rgba(5,15,38,.15),rgba(5,15,38,.55));opacity:0;pointer-events:none', null, $('shake'));
$('shake').insertBefore(ecodim, eco);
const pills = ORDER.map(id => {
  const d = div('', 'position:absolute;left:0;top:0;opacity:0', `
    <div style="display:flex;align-items:center;gap:14px;padding:11px 28px 11px 12px;border-radius:99px;background:linear-gradient(180deg,#14306b,#0b2252);border:3px solid #d4a84b;box-shadow:0 18px 40px -10px rgba(0,0,0,.65),0 0 40px rgba(212,168,75,.35);white-space:nowrap">
      <span style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#f0cf85,#b8892f);display:flex;align-items:center;justify-content:center">${ic(ICN[id], 32, '#12285a', 2.6)}</span>
      <span style="font-weight:900;font-size:40px;letter-spacing:.02em;color:#fff">${NAMES[id]}</span></div>
    <div style="text-align:center;margin-top:12px;font-weight:700;font-size:22px;letter-spacing:.06em;color:#cfd9ee;white-space:nowrap;text-shadow:0 2px 14px rgba(2,8,24,.9)">${SUBS[id]}</div>`, eco);
  return d;
});
const hubL = div('', 'position:absolute;left:0;top:0;width:250px;height:250px;margin:-125px 0 0 -125px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,#1c3d86,#0b2252);border:6px solid #d4a84b;opacity:0',
  `<div style="font-weight:900;font-size:33px;letter-spacing:.14em;color:#fff;margin-left:.14em">PROVIRTUAL</div><div style="font-weight:900;font-size:62px;letter-spacing:.06em;color:#d4a84b;line-height:1;margin-top:2px">PH</div>`, eco);

/* ---- FINAL BRAND FRAME ---- */
const fin = div('', 'position:absolute;inset:0;overflow:hidden;clip-path:circle(0px at 540px 600px);background:radial-gradient(90% 55% at 50% 40%,#17397f 0%,#0b2252 48%,#050f26 100%)', null, $('shake'));
$('shake').insertBefore(fin, $('txt'));
fin.innerHTML = `
  <div class="abs" style="inset:0;opacity:.35;background-image:radial-gradient(circle,rgba(150,180,235,.5) 2px,transparent 2.6px);background-size:84px 84px;background-position:12px 30px"></div>
  <div id="frg" class="abs" style="left:540px;top:760px;width:0;height:0">
    ${[560, 860, 1160].map((r, i) => `<div class="abs" style="left:${-r / 2}px;top:${-r / 2}px;width:${r}px;height:${r}px;border-radius:50%;border:${3 - i * .6}px solid rgba(212,168,75,${.45 - i * .12})"></div>`).join('')}
  </div>
  <div id="plate" class="abs" style="left:100px;top:370px;width:880px;height:238px;border-radius:48px;background:#fdfdfd;box-shadow:0 50px 100px -20px rgba(0,0,0,.7),0 0 0 3px rgba(212,168,75,.9),0 0 90px rgba(212,168,75,.35);overflow:hidden">
    <img src="assets/logo.png" style="position:absolute;left:50px;top:20px;width:780px;height:auto"/>
    <div id="shine" class="abs" style="top:-40px;bottom:-40px;width:150px;left:-300px;transform:skewX(-20deg);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,236,190,.95),rgba(255,255,255,0))"></div>
  </div>
  <div id="rule" class="abs" style="left:540px;top:1118px;width:0;height:6px;margin-left:0;background:linear-gradient(90deg,transparent,#d4a84b,transparent);border-radius:3px"></div>
  <div id="cta" class="abs" style="left:90px;top:1190px;width:900px;height:250px;border-radius:70px;background:linear-gradient(135deg,#f6dc9c,#d4a84b 55%,#b8892f);box-shadow:0 40px 90px -20px rgba(0,0,0,.65),0 0 100px rgba(212,168,75,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#0b1f4a">
    <div style="font-weight:900;font-size:66px;letter-spacing:-.01em;line-height:1">DM “PROVIRTUAL”</div>
    <div style="font-weight:800;font-size:46px;letter-spacing:.05em;margin-top:10px;line-height:1">TO GET STARTED.</div>
    <div id="ctashine" class="abs" style="top:-30px;bottom:-30px;width:140px;left:-300px;transform:skewX(-20deg);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.65),rgba(255,255,255,0))"></div>
  </div>
  <div id="tag" class="abs" style="left:0;right:0;top:1478px;text-align:center;font-weight:800;font-size:29px;letter-spacing:.32em;color:rgba(255,255,255,.78);margin-left:.32em">ONE TEAM. <span style="color:#d4a84b">MULTIPLE CAPABILITIES.</span></div>`;
const tag = fin.querySelector('#tag'); const frg = fin.querySelector('#frg'), plate = fin.querySelector('#plate'), shine = fin.querySelector('#shine'), rule = fin.querySelector('#rule'), cta = fin.querySelector('#cta'), ctashine = fin.querySelector('#ctashine');
const hl = textCard({ x: 540, y: 705, size: 142, align: 'center', lines: [[{ t: 'MORE THAN', c: '#ffffff' }], [{ t: 'JUST A VA', c: GOLD }, { t: '.', c: '#ffffff' }]], t0: 27.85, t1: 99, variant: 'letters', stagger: .16, css: 'text-shadow:0 8px 60px rgba(2,8,24,.7)' });

A(t => {
  // ecosystem overlay
  const c = camAt(t);
  const e = P(t, 25.15, 26.05);
  eco.style.opacity = (e * (1 - P(t, 27.2, 27.5))).toFixed(3);
  ecodim.style.opacity = (E.out3(P(t, 24.9, 25.8)) * (1 - P(t, 27.4, 27.7))).toFixed(3);
  ORDER.forEach((id, i) => {
    const s = STATIONS[id];
    const [px, py, k] = proj(s.x, s.y, c);
    const p = E.back(P(t, 25.2 + i * .1, 25.65 + i * .1));
    pills[i].style.opacity = clamp(p * 2);
    pills[i].style.transform = `translate(${px}px,${py}px) translate(-50%,-50%) scale(${lerp(.6, 1, Math.min(1.1, p))})`;
  });
  const [hx, hy] = proj(0, 0, c);
  const hp = E.back2(P(t, 25.3, 25.85));
  hubL.style.opacity = clamp(hp * 2.5);
  hubL.style.transform = `translate(${hx}px,${hy}px) scale(${lerp(.4, 1, Math.min(1.1, hp)) * (1 + Math.sin(t * 5) * .018)})`;
  // final frame: circle wipe from hub
  const w = E.io3(P(t, 27.0, 27.6));
  fin.style.clipPath = `circle(${w * 2300}px at ${hx.toFixed(0)}px ${hy.toFixed(0)}px)`;
  fin.style.display = w <= 0 ? 'none' : 'block';
  // elements
  const pp = E.back2(P(t, 27.3, 27.85));
  plate.style.opacity = clamp(pp * 2); plate.style.transform = `translateY(${(1 - pp) * 120}px) scale(${lerp(.82, 1, Math.min(1.08, pp))})`;
  shine.style.left = lerp(-300, 1100, E.io2(P(t, 27.9, 28.6))) + 'px';
  frg.style.transform = `rotate(${(t - 27) * 8}deg) scale(${lerp(.7, 1, E.out3(P(t, 27.2, 28.2)))})`;
  frg.style.opacity = clamp(P(t, 27.2, 27.8));
  rule.style.left = (540 - 220 * E.out5(P(t, 28.15, 28.6))) + 'px'; rule.style.width = (440 * E.out5(P(t, 28.15, 28.6))) + 'px';
  tag.style.opacity = E.out3(P(t, 28.9, 29.4));
  const ck = E.out5(P(t, 28.35, 28.95));
  cta.style.opacity = clamp(ck * 2.5); cta.style.transform = `translateY(${(1 - ck) * 140}px) scale(${lerp(.9, 1, ck)})`;
  const pulseK = t > 29.0 ? 1 + Math.sin((t - 29.0) * 6) * .012 : 1;
  cta.style.transform += ` scale(${pulseK})`;
  ctashine.style.left = lerp(-300, 1100, E.io2(P(t, 29.0, 29.7))) + 'px';
});
