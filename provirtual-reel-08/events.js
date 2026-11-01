// writes the shared SFX/timing event list used by audio.py
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.resolve(__dirname,'reel.html'));await p.waitForFunction('window.ready===true');
const ev=await p.evaluate(()=>window.getEvents());fs.writeFileSync(process.argv[2],JSON.stringify(ev,null,1));console.log(ev.length,'events');await b.close()})();
