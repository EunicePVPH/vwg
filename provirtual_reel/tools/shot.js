const {chromium}=require('playwright');
(async()=>{
  const times=process.argv.slice(2).map(Number);
  const out=process.env.OUT||'/tmp/claude-0/-home-user-vwg/c8ca43b1-0312-58fd-852e-29310ca1461f/scratchpad/shots';
  require('fs').mkdirSync(out,{recursive:true});
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
  p.on('console',m=>console.log('console:',m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+process.cwd()+'/reel.html'); await p.evaluate(()=>window.fontsReady);
  for(const t of times){ const t0=Date.now(); await p.evaluate(t=>renderFrame(t),t); await p.screenshot({path:`${out}/f_${t.toFixed(2)}.png`}); console.log(t,Date.now()-t0,'ms'); }
  await b.close();
})();
