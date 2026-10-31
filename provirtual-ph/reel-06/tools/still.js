// Usage: node still.js <outDir> t1 t2 t3 ...   -> renders PNG stills of the scene at the given times
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [outDir, ...times] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const cues = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/cues.json'), 'utf8'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', m => console.log('console:', m.text()));
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await page.addInitScript(c => { window.CUES = c; }, cues);
  await page.goto('file://' + path.resolve(__dirname, '../src/index.html'));
  await page.evaluate(() => window.READY);
  for (const t of times) {
    const t0 = Date.now();
    await page.evaluate(tt => window.renderFrame(tt), parseFloat(t));
    await page.screenshot({ path: path.join(outDir, `t_${parseFloat(t).toFixed(2).padStart(5, '0')}.png`) });
    console.log('t=' + t, (Date.now() - t0) + 'ms');
  }
  await browser.close();
})();
