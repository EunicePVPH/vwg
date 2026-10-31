// Usage: node render.js <outDir> <worker> <nWorkers> [fps=30] [sub=3] [shutterDeg=180] [frameStart] [frameEnd]
// Renders sub-frames (for real motion blur) as JPEGs: f_<frame>_<sub>.jpg
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [outDir, wi, nw, fpsA, subA, shA, fsA, feA] = process.argv.slice(2);
  const worker = +wi, nWorkers = +nw, fps = +(fpsA || 30), sub = +(subA || 3), shutter = +(shA || 180) / 360;
  const cues = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/cues.json'), 'utf8'));
  const total = Math.round(cues.end * fps);
  const f0 = fsA ? +fsA : 0, f1 = feA ? +feA : total - 1;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await page.addInitScript(c => { window.CUES = c; }, cues);
  await page.goto('file://' + path.resolve(__dirname, '../src/index.html'));
  await page.evaluate(() => window.READY);
  const t0 = Date.now(); let n = 0;
  for (let f = f0 + worker; f <= f1; f += nWorkers) {
    for (let k = 0; k < sub; k++) {
      const off = sub === 1 ? 0 : ((k / (sub - 1)) - 0.5) * shutter / fps;   // centred on the frame time
      const t = Math.min(cues.end, Math.max(0, f / fps + off));
      await page.evaluate(tt => window.renderFrame(tt), t);
      const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
      fs.writeFileSync(path.join(outDir, `f_${String(f).padStart(5, '0')}_${k}.jpg`), buf);
    }
    n++; if (n % 10 === 0) console.log(`w${worker}: ${n} frames, ${((Date.now() - t0) / n | 0)} ms/frame`);
  }
  if (worker === 0) fs.writeFileSync(path.join(outDir, '..', 'events.json'), JSON.stringify(await page.evaluate(() => window.getAudioEvents())));
  await browser.close();
  console.log(`w${worker} done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
})();
