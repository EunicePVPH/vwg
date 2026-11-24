// usage: node covers.js outdir   -> renders every cover as a 1080x1920 JPG
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch({ args: ['--no-sandbox'] }); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => console.log('PAGEERR', e.message));
  await pg.goto('file://' + path.resolve(__dirname, 'web/thumbs.html')); await pg.waitForFunction('window.READY||window.ERR', null, { timeout: 30000 });
  const err = await pg.evaluate('window.ERR'); if (err) { console.log('ERR', err); process.exit(1); }
  const ids = await pg.evaluate('window.COVER_IDS'), el = await pg.$('#cv');
  for (const [i, id] of ids.entries()) { await pg.evaluate(([id, s]) => window.drawCover(id, s), [id, 11 + i]); await el.screenshot({ path: path.join(out, id + '.jpg'), type: 'jpeg', quality: 93 }); console.log('made', id); }
  await br.close();
})();
