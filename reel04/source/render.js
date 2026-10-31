const {chromium}=require('playwright');const fs=require('fs');
const FROM=+(process.argv[5]||0),TO=+(process.argv[6]||750);const W=+process.argv[2],NW=+process.argv[3],OUT=process.argv[4],SUB=4,FPS=30,N=750;
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
  pg.on('pageerror',e=>console.log('PAGEERROR',e.message));
  await pg.goto('file://'+__dirname+'/reel.html');await pg.waitForFunction(()=>window.READY,null,{timeout:30000});
  for(let i=FROM+W;i<TO;i+=NW){
    for(let k=0;k<SUB;k++){
      const t=i/FPS+((k+0.5)/SUB-0.5)*0.5/FPS;
      await pg.evaluate(([t,i])=>window.renderFrame(Math.max(0,t),i),[t,i]);
      const buf=await pg.screenshot({type:'jpeg',quality:97});
      fs.writeFileSync(`${OUT}/s_${String(i*SUB+k).padStart(5,'0')}.jpg`,buf);
    }
    if(i%20===W)console.log('worker',W,'frame',i);
  }
  await b.close();console.log('worker',W,'DONE');
})();
