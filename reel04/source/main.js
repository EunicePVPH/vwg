// ================= MAIN =================
(async function(){
  await document.fonts.load('900 100px Mont');await document.fonts.load('800 20px Mont');await document.fonts.load('700 20px Mont');
  await document.fonts.load('400 20px Inter');await document.fonts.load('600 20px Inter');await document.fonts.load('700 20px Inter');await document.fonts.ready;
  bgEl=layer('bg');
  const worldL=layer('world','perspective:1800px;perspective-origin:540px 960px');
  const boardL=layer('boardCam');
  const txtL=layer('txt');
  const fxL=layer('fx');
  const scenes=[];
  scenes.push(buildS1(txtL));
  if(typeof buildS2==='function')scenes.push(buildS2(worldL,boardL,txtL));
  if(typeof buildS3==='function')scenes.push(buildS3(boardL,txtL));
  if(typeof buildS5==='function')scenes.push(buildS5(txtL));
  buildFx(fxL);
  window.renderFrame=function(t,f){
    bgUpdate(t);
    scenes.forEach(s=>s.update(t));
    fxUpdate(t,f||0);
  };
  window.READY=true;
})();
