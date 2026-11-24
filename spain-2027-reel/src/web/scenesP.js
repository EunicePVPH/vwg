// ---------- PHOTO-BASED SCENES (user-supplied photos & video) ----------
const IMG = {}, BGI = {}, VID = [];
const PHOTO_KEYS = ['hero', 'lions', 'charles', 'court', 'door', 'myrtles', 'night', 'beach', 'arch', 'caixa', 'prado', 'hall', 'street', 'cypress', 'flam'];
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load ' + src)); i.src = src; }); }
async function loadMedia() {
  await Promise.all(PHOTO_KEYS.map(async k => { IMG[k] = await loadImg(`media/${k}.jpg`); BGI[k] = await loadImg(`media/${k}_bg.jpg`); }));
  const n = 155, frames = await Promise.all(Array.from({ length: n }, (_, i) => loadImg(`media/vid/v_${String(i + 1).padStart(3, '0')}.jpg`)));
  frames.forEach(f => VID.push(f));
}
// full-bleed 9:16 crop with a slow push / pan. o: z0,z1,fx0,fy0,fx1,fy1,t0,t1,ease
function photoFill(ctx, key, t, o) {
  const im = IMG[key], iw = im.width, ih = im.height, s = Math.max(W / iw, H / ih);
  const p = (o.ease || E.inOutSine)(prog(t, o.t0, o.t1));
  const z = lerp(o.z0, o.z1, p) * (o.punch || 1), dw = iw * s * z, dh = ih * s * z;
  const fx = lerp(o.fx0, o.fx1 == null ? o.fx0 : o.fx1, p), fy = lerp(o.fy0, o.fy1 == null ? o.fy0 : o.fy1, p);
  const ox = clamp(W / 2 - fx * dw, W - dw, 0), oy = clamp(H / 2 - fy * dh, H - dh, 0);
  ctx.drawImage(im, ox, oy, dw, dh);
}
// framed photo on a blurred, darkened copy of itself (keeps whole groups in shot)
function photoCard(ctx, key, t, o) {
  const im = IMG[key], iw = im.width, ih = im.height;
  ctx.drawImage(BGI[key], 0, 0, W, H);
  const cw = o.cw || 1000, ch = Math.min(o.chMax || 1300, cw * ih / iw), x = (W - cw) / 2, y = (o.cy || 960) - ch / 2;
  const p = (o.ease || E.inOutSine)(prog(t, o.t0, o.t1)), z = lerp(o.z0 || 1, o.z1 || 1.1, p) * (o.punch || 1);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24; roundRect(ctx, x, y, cw, ch, 30); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.save(); roundRect(ctx, x, y, cw, ch, 30); ctx.clip();
  const dw = cw * z, dh = ch * z, fx = lerp(o.fx0 == null ? 0.5 : o.fx0, o.fx1 == null ? (o.fx0 == null ? 0.5 : o.fx0) : o.fx1, p), fy = lerp(o.fy0 == null ? 0.5 : o.fy0, o.fy1 == null ? (o.fy0 == null ? 0.5 : o.fy0) : o.fy1, p);
  const ox = x + clamp(cw / 2 - fx * dw, cw - dw, 0), oy = y + clamp(ch / 2 - fy * dh, ch - dh, 0);
  ctx.drawImage(im, ox, oy, dw, dh); ctx.restore();
  ctx.save(); roundRect(ctx, x, y, cw, ch, 30); ctx.strokeStyle = 'rgba(255,242,223,0.85)'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
}
function scrim(ctx, y0, y1, a0, a1, rgb = '14,8,5') {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(${rgb},${a0})`); g.addColorStop(1, `rgba(${rgb},${a1})`);
  ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0));
}
// play a list of shots with a short cross-fade; shot: {t0,t1,draw(ctx,t,shot)}
function playShots(ctx, t, shots, fade = 0.16) {
  let i = 0; for (let k = 0; k < shots.length; k++) if (t >= shots[k].t0) i = k;
  const s = shots[i];
  if (i > 0 && t < s.t0 + fade) { const pv = shots[i - 1]; pv.draw(ctx, Math.min(t, pv.t1), pv); ctx.save(); ctx.globalAlpha = E.outQuad(prog(t, s.t0, s.t0 + fade)); s.draw(ctx, t, s); ctx.restore(); }
  else s.draw(ctx, t, s);
}

// ---- scene 1: hook
function drawP1(ctx, t) {
  photoFill(ctx, 'hero', t, { t0: -0.1, t1: 3.2, z0: 1.7, z1: 1.12, fx0: 0.56, fy0: 0.50, fx1: 0.6, fy1: 0.5, ease: E.outCubic });
  scrim(ctx, 0, 1000, 0.62, 0, '10,5,3'); scrim(ctx, 1000, H, 0, 0.55, '10,5,3');
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(840, 380, 10, 840, 380, 900); g.addColorStop(0, 'rgba(255,170,70,0.35)'); g.addColorStop(1, 'rgba(255,170,70,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  const k = lerp(1.18, 1.0, E.outExpo(prog(t, 0, 0.9)));
  ctx.save(); ctx.translate(540, 1500); ctx.scale(k, k); ctx.translate(-540, -1500);
  ctx.beginPath(); archPath(ctx, 540, 1500, 440, 1330); ctx.strokeStyle = 'rgba(255,214,150,0.55)'; ctx.lineWidth = 5; ctx.shadowColor = 'rgba(255,150,50,0.8)'; ctx.shadowBlur = 30; ctx.stroke(); ctx.restore();
  drawS1Text(ctx, t);
}
// ---- scene 3a: coast + city exploring
function drawP3a(ctx, t) {
  playShots(ctx, t, [
    { t0: 7.8, t1: 9.4, draw: (c, tt, s) => photoFill(c, 'beach', tt, { t0: 7.9, t1: 9.5, z0: 1.0, z1: 1.2, fx0: 0.62, fy0: 0.5, fx1: 0.5, fy1: 0.5 }) },
    { t0: 9.3, t1: 10.7, draw: (c, tt, s) => photoCard(c, 'caixa', tt, { t0: 9.3, t1: 10.7, cy: 1090, z0: 1.0, z1: 1.14, fx0: 0.45, fy0: 0.6 }) },
  ]);
  scrim(ctx, 0, 900, 0.65, 0, '8,20,26');
}
// ---- scene 3b1: Alhambra gate (user's video clip)
function drawP3b1(ctx, t) {
  // the clip is a true 720x1280 portrait recording: play it full-bleed, no resizing distortion
  const ct = 0.35 + (t - 10.3) * 0.95, f = VID[clamp(Math.round(ct * 30), 0, VID.length - 1)];
  const z = lerp(1.0, 1.08, prog(t, 10.3, 11.6)), sw = 720 / z, sh = 1280 / z;
  ctx.drawImage(f, (720 - sw) / 2, (1280 - sh) / 2, sw, sh, 0, 0, W, H);
  scrim(ctx, 0, 800, 0.55, 0, '16,8,4'); scrim(ctx, 1200, H, 0, 0.35, '16,8,4');
}
// ---- scene 3b2: arch with Roman ruins
function drawP3b2(ctx, t) {
  photoCard(ctx, 'arch', t, { t0: 11.4, t1: 12.6, cy: 1090, z0: 1.0, z1: 1.16, fx0: 0.5, fy0: 0.5 });
  scrim(ctx, 0, 800, 0.6, 0, '16,8,4');
}
// ---- scene 3c: flamenco class, punched on every accent clap
function drawP3c(ctx, t) {
  const acc = EV.claps.filter(c => c[1] >= 0.9), pAcc = pulse(t, acc, 0.14), pAny = pulse(t, EV.claps, 0.09);
  photoCard(ctx, 'flam', t, { t0: 12.4, t1: 15.1, cy: 1150, cw: 920, z0: 1.0, z1: 1.2, fx0: 0.5, fy0: 0.62, punch: 1 + 0.035 * pAcc + 0.012 * pAny });
  for (const [tc, w] of EV.claps) {
    const q = prog(t, tc, tc + 0.5); if (q <= 0 || q >= 1) continue;
    ctx.strokeStyle = `rgba(255,214,150,${0.55 * (1 - q) * (w >= 0.9 ? 1 : 0.45)})`; ctx.lineWidth = (w >= 0.9 ? 12 : 6) * (1 - q) + 1;
    ctx.beginPath(); ctx.arc(540, 1150, 160 + E.outCubic(q) * 820, 0, 7); ctx.stroke();
  }
  const fl = pulse(t, acc.map(c => [c[0], 0.18]), 0.06); if (fl > 0.01) { ctx.fillStyle = `rgba(255,200,130,${clamp(fl, 0, 0.3)})`; ctx.fillRect(0, 0, W, H); }
  scrim(ctx, 0, 900, 0.75, 0, '12,3,5');
}
// ---- scene 4b: new friends (group at blue hour)
function drawP4b(ctx, t) {
  photoCard(ctx, 'night', t, { t0: 16.9, t1: 18.1, cy: 1140, cw: 900, z0: 1.0, z1: 1.14, fx0: 0.5, fy0: 0.58 });
  scrim(ctx, 0, 820, 0.65, 0, '12,6,4');
}
// ---- scene 4c/4d: new perspectives (tilt up) -> more than a trip
function drawP4cd(ctx, t) {
  playShots(ctx, t, [
    { t0: 17.8, t1: 19.6, draw: (c, tt) => photoFill(c, 'charles', tt, { t0: 17.9, t1: 19.7, z0: 1.0, z1: 1.0, fx0: 0.5, fy0: 0.85, fx1: 0.5, fy1: 0.18, ease: E.inOutCubic }) },
    { t0: 19.5, t1: 22.1, draw: (c, tt) => photoFill(c, 'door', tt, { t0: 19.5, t1: 22.1, z0: 1.25, z1: 1.38, fx0: 0.47, fy0: 0.3 }) },
  ], 0.2);
  scrim(ctx, 0, 1000, 0.7, 0, '14,7,4'); scrim(ctx, 1100, H, 0, 0.5, '14,7,4');
}
// ---- scene 5: the reveal
function drawP5(ctx, t) {
  photoFill(ctx, 'court', t, { t0: 21.5, t1: 26.1, z0: 1.5, z1: 1.3, fx0: 0.5, fy0: 0.3, ease: E.outCubic });
  scrim(ctx, 0, 1100, 0.7, 0.25, '10,5,6'); scrim(ctx, 1100, H, 0.25, 0.7, '10,5,6');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, 1500, 10, 540, 1500, 1000); g.addColorStop(0, 'rgba(255,140,50,0.28)'); g.addColorStop(1, 'rgba(255,140,50,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.beginPath(); archPath(ctx, 540, 1560, 470, 1300); ctx.strokeStyle = 'rgba(255,214,150,0.45)'; ctx.lineWidth = 5; ctx.stroke();
  drawS5Text(ctx, t);
}
