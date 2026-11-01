const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const mode = process.argv[2];
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox','--force-color-profile=srgb','--disable-lcd-text'] });
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  page.on('console', m => { if (m.type()==='error') console.error('CONSOLE', m.text()); });
  await page.goto('file://' + path.join(__dirname, 'reel.html'));
  await page.waitForFunction('window.READY===true', null, { timeout: 30000 });
  const outDir = process.argv[3];
  fs.mkdirSync(outDir, { recursive: true });
  if (mode === 'preview') {
    const times = process.argv[4].split(',').map(Number);
    for (const t of times) {
      await page.evaluate(t => window.tick(t), t);
      await page.screenshot({ path: path.join(outDir, `p_${t.toFixed(2)}.png`) });
    }
  } else if (mode === 'frames') {
    const a = +process.argv[4], b = +process.argv[5], step = +process.argv[6];
    for (let f = a; f < b; f += step) {
      await page.evaluate(t => window.tick(t), f / 30);
      await page.screenshot({ path: path.join(outDir, `f_${String(f).padStart(4,'0')}.png`) });
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
