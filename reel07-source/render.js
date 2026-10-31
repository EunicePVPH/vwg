// usage: node render.js <outDir> <startFrame> <endFrame> [fast|hq]   |   node render.js <outDir> still t1,t2,... [fast|hq]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [outDir, a, b, mode] = process.argv.slice(2); fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('PAGEERR', e.message)); page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'render.html')); await page.waitForFunction('window.READY===true');
  const save = async (name, t, q) => {
    const d = await page.evaluate(([t, q]) => { renderFrame(t, q); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, [t, q]);
    fs.writeFileSync(path.join(outDir, name), Buffer.from(d.split(',')[1], 'base64'));
  };
  if (a === 'still') { for (const t of b.split(',')) { await save(`still_${Number(t).toFixed(2)}.jpg`, Number(t), mode || 'fast'); } }
  else { const s = +a, e = +b; for (let f = s; f < e; f++) { await save(`f_${String(f).padStart(4, '0')}.jpg`, f / 30, mode || 'hq'); if (f % 25 === 0) console.log('frame', f); } }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
