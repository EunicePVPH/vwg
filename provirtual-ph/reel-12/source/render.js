const {chromium}=require('playwright');const fs=require('fs');
const [,, w, nw, outdir]=process.argv;const W=+w,NW=+nw;
const F0=+(process.env.F0||0),FPS=30,N=+(process.env.F1||750),SUB=8,SPAN=1/480; // 8 sub-samples, 1/480s apart (180deg shutter)
(async()=>{
 fs.mkdirSync(outdir,{recursive:true});
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto('file://'+process.cwd()+'/reel.html');await p.waitForTimeout(500);
 const t0=Date.now();let done=0;
 for(let f=F0+W;f<N;f+=NW){
  for(let k=0;k<SUB;k++){
   const t=f/FPS+(k-(SUB-1)/2)*SPAN;
   await p.evaluate(t=>render(t),t);
   const buf=await p.screenshot({type:'jpeg',quality:95});
   fs.writeFileSync(`${outdir}/s_${String(f*SUB+k).padStart(5,'0')}.jpg`,buf);
  }
  done++;if(done%25===0)console.log(`w${W} ${done} frames, ${((Date.now()-t0)/1000).toFixed(0)}s`);
 }
 await b.close();console.log(`w${W} DONE`);
})();
