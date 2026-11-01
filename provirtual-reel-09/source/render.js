const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [,, outDir, startS, endS, stepS, offS] = process.argv;
const FPS = 30, start = +startS, end = +endS, step = +stepS || 1, off = +offS || 0;
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.waitForFunction('window.READY===true');
  let n = 0; const t0 = Date.now();
  for (let f = start + off; f < end; f += step) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
    fs.writeFileSync(path.join(outDir, String(f).padStart(5, '0') + '.jpg'), buf);
    n++;
    if (n % 20 === 0) console.log(`worker off=${off}: ${n} frames, ${((Date.now() - t0) / n / 1000).toFixed(2)} s/frame`);
  }
  await browser.close();
})();
