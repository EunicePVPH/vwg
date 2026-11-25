// Motion-graphics reel builder.
// Usage: node reels/build.mjs reels/comfort-one.json [--preview]
//   --preview  renders only 6 still frames to reels/out/<name>-preview-N.png (fast check)
// Output: reels/out/<name>.mp4  (1080x1920, 30fps, silent)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const cfgPath = process.argv[2];
const preview = process.argv.includes('--preview');
if (!cfgPath) { console.error('Usage: node reels/build.mjs <config.json> [--preview]'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const W = 1080, H = 1920, FPS = cfg.fps || 30, DUR = cfg.duration;
const outDir = path.join(path.dirname(cfgPath), 'out');
fs.mkdirSync(outDir, { recursive: true });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const f = n => n.toFixed(3);

// ---------- building blocks ----------
// A line of headline text. "{word}" wraps the accent colour.
const accentize = t => esc(t).replace(/\{(.+?)\}/g, '<em>$1</em>');
const rise = (at, dur = 0.38) => `style="animation:rise ${dur}s cubic-bezier(.18,.9,.25,1) ${f(at)}s both"`;
const fade = (at, dur = 0.4) => `style="animation:fadein ${dur}s ease-out ${f(at)}s both"`;

function lines(arr, t0, d0 = 0, gap = 0.28) {
  return arr.map((l, i) => {
    const o = typeof l === 'string' ? { text: l } : l;
    const size = o.size || 112;
    return `<div class="hl${o.small ? ' small' : ''}" style="font-size:${size}px;animation:rise .38s cubic-bezier(.18,.9,.25,1) ${f(t0 + d0 + i * gap)}s both">${accentize(o.text)}</div>`;
  }).join('');
}

function thermostat(c, t0) {
  const from = c.from, to = c.to;
  const swapAt = t0 + (c.swapAt ?? 1.4);
  return `<div class="card thermo" ${rise(t0 + (c.delay ?? 0.5), 0.5)}>
    <div class="cardlabel">${esc(c.label || 'LIVING ROOM')}</div>
    <div class="dial">
      <div class="num" style="${to ? `animation:gone .01s linear ${f(swapAt)}s both` : ''}">${from}°<small>F</small></div>
      ${to ? `<div class="num acc" style="animation:fadein .01s linear ${f(swapAt)}s both">${to}°<small>F</small></div>` : ''}
    </div>
    <div class="cardfoot">${esc(c.foot || 'HEATING · HOLD')}</div>
  </div>`;
}

function checklist(c, t0) {
  const rows = c.rows.map((r, i) => {
    const at = t0 + (c.delay ?? 0.4) + 0.45 + i * (c.step ?? 0.5);
    return `<div class="row" ${rise(at - 0.1, 0.3)}>
      <span class="tick" style="animation:pop .3s ease-out ${f(at + 0.25)}s both">✓</span>
      <span class="rl"><b>${esc(r[0])}</b><i>${esc(r[1] || '')}</i></span></div>`;
  }).join('');
  return `<div class="card list" ${rise(t0 + (c.delay ?? 0.4), 0.45)}>
    <div class="cardlabel">${esc(c.label)}</div>${rows}
    ${c.sample ? '<div class="sample">SAMPLE DATA · CONCEPT DEMO ONLY</div>' : ''}</div>`;
}

function bars(c, t0) {
  const bs = c.bars.map((b, i) => {
    const at = t0 + (c.delay ?? 0.4) + 0.5 + i * 0.12;
    return `<div class="bcol"><div class="bar${b.acc ? ' acc' : ''}" style="height:${b.h}px;animation:grow .7s cubic-bezier(.2,.8,.2,1) ${f(at)}s both"></div><span>${esc(b.l)}</span></div>`;
  }).join('');
  return `<div class="card barsC" ${rise(t0 + (c.delay ?? 0.4), 0.45)}>
    <div class="cardlabel">${esc(c.label)}</div>
    <div class="bwrap">${bs}</div>
    <div class="cardfoot">${esc(c.foot || '')}</div>
    ${c.sample ? '<div class="sample">SAMPLE DATA · CONCEPT DEMO ONLY</div>' : ''}</div>`;
}

function progress(c, t0) {
  const rows = c.rows.map((r, i) => {
    const at = t0 + (c.delay ?? 0.4) + 0.5 + i * 0.45;
    return `<div class="prow" ${rise(at - 0.1, 0.3)}><div class="ptop"><b>${esc(r[0])}</b><i>${esc(r[1] || '')}</i></div>
      <div class="track"><div class="fill" style="animation:fillx .8s cubic-bezier(.2,.8,.2,1) ${f(at + 0.1)}s both"></div></div></div>`;
  }).join('');
  return `<div class="card progC" ${rise(t0 + (c.delay ?? 0.4), 0.45)}>
    <div class="cardlabel">${esc(c.label)}</div>${rows}
    ${c.sample ? '<div class="sample">SAMPLE DATA · CONCEPT DEMO ONLY</div>' : ''}</div>`;
}

const CARDS = { thermostat, checklist, bars, progress };

function wordmark(text, t0, d = 0.2, big = false) {
  return `<div class="wordmark${big ? ' big' : ''}" ${rise(t0 + d, 0.5)}>${esc(text)}</div>`;
}

function stepper(n, total, t0) {
  let dots = '';
  for (let i = 1; i <= total; i++) dots += `<span class="${i <= n ? 'on' : ''}"></span>`;
  return `<div class="stepper" ${fade(t0 + 0.1)}>${dots}</div>`;
}

const sceneKF = [];
function buildScene(s) {
  const t0 = s.start, len = s.end - s.start;
  const a = Math.min(0.25 / len, 0.2) * 100, b = 100 - a;
  let inner = '';
  switch (s.type) {
    case 'hook':
      inner = `<div class="top">${lines(s.lines, t0, 0.1)}</div>` + (s.card ? `<div class="mid">${CARDS[s.card.kind](s.card, t0)}</div>` : '');
      break;
    case 'brand':
      inner = `<div class="center">${wordmark(cfg.brand, t0, 0.15, true)}
        <div class="sub" ${rise(t0 + 0.6)}>${accentize(s.sub)}</div>
        ${s.tag ? `<div class="tag" ${rise(t0 + 1.0)}>${esc(s.tag)}</div>` : ''}</div>`;
      break;
    case 'step':
      inner = `${stepper(s.n, s.of, t0)}<div class="stepno" ${fade(t0 + 0.1)}>${String(s.n).padStart(2, '0')} —</div>
        <div class="top step">${lines(s.lines, t0, 0.2)}</div>
        <div class="mid">${CARDS[s.card.kind](s.card, t0)}</div>`;
      break;
    case 'statement':
      inner = `<div class="center">${lines(s.lines, t0, 0.15, 0.32)}${s.sub ? `<div class="sub" ${rise(t0 + 1.4)}>${accentize(s.sub)}</div>` : ''}</div>`;
      break;
    case 'cta':
      inner = `<div class="center cta">${wordmark(cfg.brand, t0, 0.1, true)}
        <div class="tag" ${rise(t0 + 0.4)}>${esc(s.services)}</div>
        <div class="ctahl">${lines(s.lines, t0, 0.8, 0.25)}</div>
        <div class="pill" ${rise(t0 + 1.6, 0.45)}>${esc(s.button)}</div>
        ${s.foot ? `<div class="foot" ${fade(t0 + 2.0)}>${esc(s.foot)}</div>` : ''}</div>`;
      break;
  }
  sceneKF.push(`@keyframes sc${s.start}{0%{opacity:0}${a.toFixed(2)}%{opacity:1}${b.toFixed(2)}%{opacity:1}100%{opacity:0}}`);
  return `<section class="scene" style="animation:sc${s.start} ${f(len)}s linear ${f(t0)}s both">${inner}</section>`;
}

const css = `
:root{ --navy:${cfg.navy || '#0A1B3F'}; --navy2:${cfg.navy2 || '#10306B'}; --accent:${cfg.accent}; --white:#fff; }
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--navy);font-family:'Inter','Inter Display',sans-serif;color:#fff}
#stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;
  background:radial-gradient(120% 70% at 50% 18%, var(--navy2) 0%, var(--navy) 62%, #050E26 100%)}
.grid{position:absolute;inset:0;opacity:.07;background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:90px 90px;
  mask-image:radial-gradient(80% 60% at 50% 40%,#000,transparent)}
.streak{position:absolute;top:-20%;left:-30%;width:70%;height:150%;transform:rotate(18deg);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);filter:blur(28px);animation:drift ${DUR}s linear 0s both}
.streak.s2{left:20%;width:40%;opacity:.7;animation-duration:${DUR * 1.25}s}
@keyframes drift{from{transform:translateX(0) rotate(18deg)}to{transform:translateX(${W * 0.9}px) rotate(18deg)}}
.scene{position:absolute;inset:0;opacity:0}
@keyframes rise{from{opacity:0;transform:translateY(56px)}to{opacity:1;transform:none}}
@keyframes fadein{from{opacity:0}to{opacity:1}}
@keyframes gone{from{opacity:1}to{opacity:0}}
@keyframes hold{from{opacity:1}to{opacity:1}}
@keyframes pop{0%{opacity:0;transform:scale(.4)}70%{transform:scale(1.15)}100%{opacity:1;transform:none}}
@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes fillx{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.top{position:absolute;left:80px;right:80px;top:300px}
.top.step{top:380px}
.hl{font-weight:900;text-transform:uppercase;letter-spacing:-.015em;line-height:1.04;text-shadow:0 6px 30px rgba(0,0,0,.35)}
.hl em{font-style:normal;color:var(--accent)}
.hl.small{font-weight:800;letter-spacing:.06em;opacity:.95}
.mid{position:absolute;left:80px;right:80px;top:880px}
.center{position:absolute;left:80px;right:80px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:34px;padding-bottom:120px}
.center .hl{text-align:left}
.sub{font-size:46px;font-weight:700;line-height:1.25;letter-spacing:.01em;color:#E8EEFB;max-width:900px}
.sub em{font-style:normal;color:var(--accent)}
.tag{font-size:30px;font-weight:800;letter-spacing:.14em;color:#B9C7E6;text-transform:uppercase}
.wordmark{font-weight:900;font-size:64px;letter-spacing:.04em;background:#fff;color:var(--navy);padding:26px 46px;border-radius:22px;
  box-shadow:0 0 0 2px rgba(255,255,255,.25),0 30px 70px rgba(0,0,0,.45);text-transform:uppercase}
.wordmark.big{font-size:78px}
.stepno{position:absolute;left:80px;top:300px;font-size:34px;font-weight:800;letter-spacing:.1em;color:var(--accent)}
.stepper{position:absolute;left:80px;right:80px;top:230px;display:flex;gap:14px}
.stepper span{flex:1;height:8px;border-radius:6px;background:rgba(255,255,255,.18)}
.stepper span.on{background:var(--accent)}
.card{position:relative;border-radius:36px;padding:44px 48px;background:linear-gradient(160deg,rgba(33,66,138,.55),rgba(12,30,72,.75));
  border:2px solid rgba(255,255,255,.16);box-shadow:0 40px 90px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12)}
.cardlabel{font-size:26px;font-weight:800;letter-spacing:.16em;color:#9FB2DC;margin-bottom:26px}
.cardfoot{font-size:28px;font-weight:700;letter-spacing:.12em;color:#9FB2DC;margin-top:24px}
.sample{margin-top:30px;text-align:center;font-size:20px;font-weight:700;letter-spacing:.18em;color:#7E92BF}
.thermo{text-align:center;padding:60px 48px}
.thermo .dial{position:relative;height:300px}
.thermo .num{position:absolute;inset:0;font-weight:900;font-size:260px;line-height:300px;letter-spacing:-.04em}
.thermo .num small{font-size:90px;vertical-align:top;line-height:1;margin-left:6px;position:relative;top:48px;color:#B9C7E6}
.thermo .num.acc{color:var(--accent)}
.row{display:flex;align-items:center;gap:28px;padding:26px 0;border-top:2px solid rgba(255,255,255,.1)}
.row:first-of-type{border-top:0}
.tick{flex:none;width:64px;height:64px;border-radius:50%;background:var(--accent);color:var(--navy);font-weight:900;font-size:40px;display:flex;align-items:center;justify-content:center}
.rl b{display:block;font-size:44px;font-weight:800;letter-spacing:.01em}
.rl i{display:block;font-style:normal;font-size:28px;font-weight:600;color:#9FB2DC;margin-top:4px}
.bwrap{display:flex;align-items:flex-end;justify-content:space-between;height:360px;gap:22px;border-bottom:2px solid rgba(255,255,255,.15)}
.bcol{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative}
.bar{width:100%;border-radius:14px 14px 0 0;background:linear-gradient(#8FA6D8,#4C69B0);transform-origin:bottom}
.bar.acc{background:linear-gradient(var(--accent),color-mix(in srgb,var(--accent) 60%,#000))}
.bcol span{position:absolute;bottom:-52px;font-size:24px;font-weight:800;letter-spacing:.1em;color:#9FB2DC}
.barsC .cardfoot{margin-top:76px}
.prow{padding:20px 0}
.ptop{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px}
.ptop b{font-size:42px;font-weight:800}
.ptop i{font-style:normal;font-size:26px;font-weight:700;letter-spacing:.1em;color:#9FB2DC}
.track{height:18px;border-radius:12px;background:rgba(255,255,255,.14);overflow:hidden}
.fill{height:100%;width:100%;border-radius:12px;background:linear-gradient(90deg,#8FA6D8,var(--accent));transform-origin:left}
.cta{align-items:flex-start;gap:30px}
.ctahl{display:flex;flex-direction:column;margin-top:10px}
.pill{margin-top:14px;background:var(--accent);color:var(--navy);font-weight:900;font-size:46px;letter-spacing:.04em;padding:36px 64px;border-radius:80px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.foot{margin-top:6px;font-size:28px;font-weight:700;letter-spacing:.1em;color:#B9C7E6}
`;

const sceneHtml = cfg.scenes.map(buildScene).join('\n');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}${sceneKF.join('')}</style></head><body>
<div id="stage"><div class="grid"></div><div class="streak"></div><div class="streak s2"></div>
${sceneHtml}
</div></body></html>`;
const htmlPath = path.join(outDir, `${cfg.name}.html`);
fs.writeFileSync(htmlPath, html);

// ---------- render ----------
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto('file://' + path.resolve(htmlPath));
await page.evaluate(() => document.fonts.ready);
const seek = t => page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; }), t);

if (preview) {
  const times = cfg.previewTimes || cfg.scenes.map(s => +(s.start + Math.min(2.2, (s.end - s.start) * 0.7)).toFixed(2));
  for (let i = 0; i < times.length; i++) {
    await seek(times[i]);
    await page.screenshot({ path: path.join(outDir, `${cfg.name}-preview-${i + 1}.png`) });
  }
  await browser.close();
  console.log('Preview frames written for t =', times.join(', '));
  process.exit(0);
}

const framesDir = path.join(outDir, `${cfg.name}-frames`);
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });
const total = Math.round(DUR * FPS);
for (let i = 0; i < total; i++) {
  await seek(i / FPS);
  await page.screenshot({ path: path.join(framesDir, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
  if (i % 60 === 0) console.log(`frame ${i}/${total}`);
}
await browser.close();
const mp4 = path.join(outDir, `${cfg.name}.mp4`);
const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%05d.jpg'),
  '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', mp4], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status);
fs.rmSync(framesDir, { recursive: true, force: true });
console.log('Wrote', mp4);
