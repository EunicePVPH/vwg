// Usage: node render.js <outDir> <startFrame> <endFrameExclusive> [fps]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const [outDir, a, b, fpsArg] = process.argv.slice(2);
  const fps = Number(fpsArg || 30);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'video.html'));
  await page.evaluate(() => window.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode ? i.decode().catch(() => {}) : 0)));
  for (let f = Number(a); f < Number(b); f++) {
    await page.evaluate(t => window.seek(t), f / fps);
    const name = path.join(outDir, 'f' + String(f).padStart(4, '0') + '.jpg');
    await page.screenshot({ path: name, type: 'jpeg', quality: 94 });
  }
  await browser.close();
})();
