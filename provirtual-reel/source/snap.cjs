// usage: node snap.cjs outdir t1 t2 ...   -> outdir/f_<t>.png
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const times = process.argv.slice(3).map(Number);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  for (const t of times) {
    const t0 = Date.now();
    await page.evaluate(t => window.render(t), t);
    await page.screenshot({ path: path.join(out, 'f_' + t.toFixed(2) + '.png') });
    console.log('t=' + t, (Date.now() - t0) + 'ms');
  }
  await browser.close();
})();
