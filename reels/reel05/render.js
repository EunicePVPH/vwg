// Usage:
//   node render.js preview <outdir> t1 t2 t3 ...        -> one JPEG per time (seconds)
//   node render.js frames  <outdir> <start> <end> <step> -> frames start..end-1, every <step>th (parallel workers)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const html = 'file://' + path.join(__dirname, 'reel.html');

async function openPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto(html);
  await page.waitForFunction('window.READY===true', null, { timeout: 30000 });
  return page;
}

async function main() {
  const [mode, outdir, ...rest] = process.argv.slice(2);
  fs.mkdirSync(outdir, { recursive: true });
  const browser = await chromium.launch();
  if (mode === 'preview') {
    const page = await openPage(browser);
    for (const ts of rest) {
      await page.evaluate(t => window.setT(t), parseFloat(ts));
      await page.screenshot({ path: path.join(outdir, `t_${ts}.jpg`), type: 'jpeg', quality: 92 });
    }
  } else if (mode === 'frames') {
    const [start, end, step] = rest.map(Number);
    const page = await openPage(browser);
    for (let i = start; i < end; i += step) {
      await page.evaluate(t => window.setT(t), i / FPS);
      await page.screenshot({ path: path.join(outdir, `f_${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
    }
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
