/* WaveFern dev: buildings fade out much more when you walk behind them. Only loaded on /dev/ (see dev/index.html).
   The live game keeps its normal fade (about 12% visible); here a building between the camera and you drops to about 4%,
   a little before it actually covers you, and eases back in smoothly. Add ?nofade to the address to skip it. */
(function(){
 if(!window.FW_FEAT||/[?&]nofade/.test(location.search))return;
 function boot(){try{
  if(typeof fadeT!=='function'||typeof CT==='undefined'||typeof P==='undefined')return false;
  const f0=fadeT,LOW=.04,MARGIN=1.4;
  fadeT=function(dt){
   f0.apply(this,arguments);
   try{
    /* the trailer and phone cameras keep buildings solid on purpose */
    if(typeof TRL!=='undefined'&&TRL.run&&TRL.shots&&TRL.shots[TRL.i]&&TRL.shots[TRL.i].cam)return;
    if(typeof PH!=='undefined'&&PH.camOn&&typeof phGV==='function'&&!phGV())return;
    const px=P.x,pz=P.z,k=Math.min(1,dt*7);
    CT.forEach(b=>{
     if(Math.abs(b.x0-px)>70)return;
     const m=b.mat;
     let lo=0,hi=1e9;const f=(p,a,c)=>{const t1=(a-p)/16,t2=(c-p)/16;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2))};
     f(px,b.x0-MARGIN,b.x1+MARGIN);f(pz,b.z0-MARGIN,b.z1+MARGIN);hi=Math.min(hi,(b.h-1)/13);
     const behind=lo<hi;
     if(b._fo===undefined)b._fo=m.opacity;
     b._fo+=((behind?LOW:1)-b._fo)*k;
     if(b._fo<m.opacity){m.opacity=b._fo;m.depthWrite=m.opacity>.95;if(b.dm){b.dm.opacity=m.opacity;b.dm.depthWrite=m.depthWrite}}
    });
   }catch(e){}
  };
  return true;
 }catch(e){return true}}
 let n=0;const t=setInterval(()=>{if(boot()||++n>200)clearInterval(t)},100);
})();
