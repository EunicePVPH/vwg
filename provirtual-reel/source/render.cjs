// usage: node render.cjs outdir workerIdx workerCount [fromFrame toFrame]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const FPS = 30, TOTAL = 750;
const BLUR = [[0, .7], [2.7, 3.5], [7.0, 9.9], [11.5, 12.9], [16.6, 17.9], [20.8, 22.3]];
(async () => {
  const out = process.argv[2], k = +process.argv[3], N = +process.argv[4];
  const from = +(process.argv[5] ?? 0), to = +(process.argv[6] ?? TOTAL);
  fs.mkdirSync(out + '/frames', { recursive: true }); fs.mkdirSync(out + '/sub', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const shot = async (t, file) => { await page.evaluate(t => window.render(t), t); await page.screenshot({ path: file, type: 'jpeg', quality: 96 }); };
  let n = 0; const t0 = Date.now();
  for (let i = from; i < to; i++) {
    if (i % N !== k) continue;
    const t = i / FPS, id = String(i).padStart(5, '0');
    const blur = BLUR.some(([a, b]) => t >= a && t <= b);
    if (blur) { for (let j = 0; j < 3; j++) await shot(Math.max(0, t + (j - 1) * 0.3 / FPS), `${out}/sub/${id}_${j}.jpg`); }
    else await shot(t, `${out}/frames/${id}.jpg`);
    if (++n % 20 === 0) console.log(`w${k} ${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close(); console.log(`w${k} done`);
})();
