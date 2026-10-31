const clamp=(x,a=0,b=1)=>x<a?a:x>b?b:x;
const P=(t,a,b)=>clamp((t-a)/(b-a));
const lerp=(a,b,x)=>a+(b-a)*x;
const eOut2=x=>1-(1-x)*(1-x), eOut3=x=>1-Math.pow(1-x,3), eOut4=x=>1-Math.pow(1-x,4), eOut5=x=>1-Math.pow(1-x,5);
const eIn2=x=>x*x, eIn3=x=>x*x*x, eIn4=x=>x*x*x*x;
const eIO=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eIO2=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const eBack=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const eBackS=s=>x=>{const c3=s+1;return 1+c3*Math.pow(x-1,3)+s*Math.pow(x-1,2)};
const lin=x=>x;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
// keyframe interpolation: frames [{t,e?,...numeric props}]; easing e belongs to the segment ENDING at that frame
function kf(t,F){
  if(t<=F[0].t) return F[0];
  const L=F[F.length-1]; if(t>=L.t) return L;
  let i=0; while(t>F[i+1].t) i++;
  const A=F[i],B=F[i+1]; const p=(B.e||eIO)(clamp((t-A.t)/(B.t-A.t)));
  const o={};
  for(const k in A){ if(k==='t'||k==='e') continue; o[k]=(typeof A[k]==='number'&&typeof B[k]==='number')?A[k]+(B[k]-A[k])*p:A[k]; }
  return o;
}
// apply transform/opacity/blur to element
function T(el,o){
  if(!el) return;
  const op=o.o===undefined?1:o.o;
  if(op<=0.001){ if(!el._h){el.classList.add('hid');el._h=1} return; }
  if(el._h){el.classList.remove('hid');el._h=0}
  const sx=o.sx!==undefined?o.sx:(o.s!==undefined?o.s:1), sy=o.sy!==undefined?o.sy:(o.s!==undefined?o.s:1);
  let tr='translate3d('+(o.x||0).toFixed(2)+'px,'+(o.y||0).toFixed(2)+'px,'+(o.z||0).toFixed(2)+'px)';
  if(o.rx) tr+=' rotateX('+o.rx.toFixed(3)+'deg)';
  if(o.ry) tr+=' rotateY('+o.ry.toFixed(3)+'deg)';
  if(o.r) tr+=' rotate('+o.r.toFixed(3)+'deg)';
  tr+=' scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';
  el.style.transform=tr;
  el.style.opacity=op>=0.999?'':op.toFixed(3);
  el.style.filter=(o.b&&o.b>0.4)?'blur('+o.b.toFixed(2)+'px)':'';
}
const pulse=(t,c,w,pk)=>{const d=Math.abs(t-c)/w;return d>=1?0:pk*(1-d)*(1-d)*(3-2*(1-d))};
const typed=(t,t0,str,cps)=>str.slice(0,clamp(Math.floor((t-t0)*cps),0,str.length));
// SVG icon set
const ICONS={
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5l8.5 6 8.5-6"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4.5-6 8-6s7 2 8 6"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
 chat:'<path d="M4 5h16v11H9.5L4 20.5z"/>', pres:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.5 3.2 3.5 14.8 0 18M12 3c-3.5 3.2-3.5 14.8 0 18"/>',
 cursor:'<path d="M5 3l14 7-6 2-2 6z"/>', funnel:'<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
 send:'<path d="M21 3L3 11l7 3 3 7z"/><path d="M21 3L10 14"/>', menu:'<path d="M4 7h16M4 12h16M4 17h10"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>'
};
function ic(n,sz,sw,col){return '<svg class="ic" viewBox="0 0 24 24" width="'+sz+'" height="'+sz+'" style="stroke-width:'+(sw||2)+(col?';color:'+col:'')+'">'+ICONS[n]+'</svg>';}
