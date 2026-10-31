// usage: node render.js start end outdir   (frames [start,end) at 30fps)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [s, e] = [Number(process.argv[2]), Number(process.argv[3])], out = process.argv[4]; fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch({ args: ['--no-sandbox'] });
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', er => console.log('PAGEERR', er.message));
  await pg.goto('file://' + path.resolve(__dirname, 'web/index.html'));
  await pg.waitForFunction('window.READY||window.ERR', null, { timeout: 30000 });
  const el = await pg.$('#cv');
  for (let i = s; i < e; i++) {
    await pg.evaluate(([i]) => window.renderFrame(i / 30, i), [i]);
    await el.screenshot({ path: path.join(out, 'f_' + String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 95 });
    if ((i - s) % 25 === 0) console.log('worker', s, 'frame', i);
  }
  await br.close(); console.log('done', s, e);
})();
