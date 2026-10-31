// usage: node render.js <outDir> <startFrame> <endFrameExclusive> [fps=30] [quality=93]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [out, a, b, fps = '30', q = '93'] = process.argv.slice(2);
  const tl = fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8');
  const browser = await chromium.launch({ args: ['--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none'] });
  const page = await (await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.addInitScript(`window.TL=${tl};`);
  await page.goto('file://' + path.join(__dirname, 'ad.html'));
  await page.evaluate(() => window.__ready);
  fs.mkdirSync(out, { recursive: true });
  const times = a.includes(',') ? a.split(',').map(Number) : null;
  if (times) { for (const t of times) { await page.evaluate(t => window.renderFrame(t), t); await page.screenshot({ path: `${out}/t_${t.toFixed(2)}.jpg`, type: 'jpeg', quality: +q }); } }
  else for (let f = +a; f < +b; f++) {
    const t = f / +fps;
    await page.evaluate(t => window.renderFrame(t), t);
    await page.screenshot({ path: `${out}/f_${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: +q });
  }
  await browser.close();
})();
