const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
  const [,, wi, wn, fps, dur, outdir]=process.argv;
  const W=+wi, N=+wn, FPS=+fps, DUR=+dur;
  fs.mkdirSync(outdir,{recursive:true});
  const total=Math.round(FPS*DUR);
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+process.cwd()+'/reel.html'); await p.evaluate(()=>window.fontsReady);
  let done=0; const t0=Date.now();
  const R=(process.env.RANGE||'0-99999').split('-').map(Number);
  for(let k=W;k<total;k+=N){ if(k<R[0]||k>R[1]) continue;
    const t=k/FPS;
    await p.evaluate(t=>renderFrame(t),t);
    await p.screenshot({path:`${outdir}/${String(k).padStart(5,'0')}.jpg`,type:'jpeg',quality:94});
    done++; if(done%25==0) console.log(`w${W} ${done} frames, ${((Date.now()-t0)/done/1000).toFixed(2)}s/frame`);
  }
  await b.close(); console.log(`w${W} finished`);
})();
