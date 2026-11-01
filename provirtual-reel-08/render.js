// usage: node render.js <outDir> <startFrame> <endFrameExclusive> [fps=30]
const {chromium}=require('playwright');
const path=require('path');
(async()=>{
  const [out,s,e,fps]=[process.argv[2],+process.argv[3],+process.argv[4],+(process.argv[5]||30)];
  const b=await chromium.launch({args:['--no-sandbox','--disable-gpu','--force-device-scale-factor=1']});
  const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  p.on('pageerror',err=>{console.error('PAGEERR',err.message);});
  p.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text())});
  await p.goto('file://'+path.resolve(__dirname,'reel.html'));
  await p.evaluate(()=>document.fonts.ready);
  await p.waitForFunction('window.ready===true');
  for(let f=s;f<e;f++){
    await p.evaluate(t=>window.render(t),f/fps);
    await p.screenshot({path:`${out}/f_${String(f).padStart(5,'0')}.png`,type:'png'});
  }
  await b.close();
})();
