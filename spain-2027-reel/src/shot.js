// usage: node shot.js outdir t1 t2 ...   (renders single frames to PNG for review)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const times = process.argv.slice(3).map(Number);
  const br = await chromium.launch({ args: ['--no-sandbox'] });
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => console.log('PAGEERR', e.message)); pg.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await pg.goto('file://' + path.resolve(__dirname, 'web/index.html'));
  await pg.waitForFunction('window.READY||window.ERR', null, { timeout: 30000 });
  const err = await pg.evaluate('window.ERR'); if (err) { console.log('INIT ERR', err); process.exit(1); }
  const el = await pg.$('#cv');
  for (const t of times) {
    const t0 = Date.now();
    await pg.evaluate(([t]) => window.renderFrame(t, Math.round(t * 30)), [t]);
    await el.screenshot({ path: path.join(out, 't' + t.toFixed(2).replace('.', '_') + '.png') });
    console.log('t=', t, (Date.now() - t0) + 'ms');
  }
  await br.close();
})();
