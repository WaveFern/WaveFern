/* ---------- boot ---------- */
/* v41.1.0: each build step runs on its own, so one broken part of the world is logged (and named in the warning bar)
   instead of stopping the whole game from starting. Without the 3D library nothing can be built, so that still fails loudly. */
if(typeof THREE=='undefined'||typeof scene=='undefined')throw new Error('3D engine did not start');
[['buildHouse',()=>buildHouse()],['buildHouseX',()=>buildHouseX()],['buildWorld',()=>buildWorld()],['buildHomes',()=>buildHomes()],['buildInteriors',()=>buildInteriors()],['buildNPCs',()=>buildNPCs()],['buildBigWorld',()=>buildBigWorld()],['buildCity',()=>buildCity()],['buildVenues',()=>buildVenues()],['finishRoads',()=>finishRoads()],['flushSB',()=>flushSB()],['buildTraffic',()=>buildTraffic()],['cityTraffic',()=>cityTraffic()],['snapS',()=>snapS()],['refresh',()=>refresh()],['parkCars',()=>parkCars()],['syncF',()=>syncF()],['buildLots',()=>buildLots()],['syncArt',()=>syncArt()]].forEach(([f,run])=>{try{run()}catch(e){fwSoftErr(e,f)}});
try{P.mesh.position.set(P.x,0,P.z)}catch(e){fwSoftErr(e,'boot')}
try{pvLoop()}catch(e){fwSoftErr(e,'pvLoop')}
requestAnimationFrame(loop);
/* v26.86.1: the bar used to keep counting up for about 2.3 s after the world was already built (25 steps of 90 ms);
   now the loading screen goes as soon as the first frame has drawn behind it */
/* v49.93.11: the loading screen now waits until the main menu is really ready behind it: every menu button (Leaderboard, Profile, Friends),
   the stadium scene and the signed-in profile / cloud save. It gives up after 15 s so it can never hang. */
requestAnimationFrame(()=>requestAnimationFrame(()=>{
 if(window.fwBooted)fwBooted();
 try{TT.game=restoreSave()}catch(e){fwSoftErr(e,'restoreSave')}
 try{titleOpen()}catch(e){fwSoftErr(e,'titleOpen')}
 const t0=performance.now(),T=15000;let done=0;
 /* honest progress: the parts are checked in order, the bar rests at a fixed mark when a part is done and eases toward the next mark
    while it waits, so it keeps moving but never claims a part is ready before it is */
 const stages=[
  [55,()=>document.readyState=='complete'], /* every script has loaded and run */
  [70,()=>{const t=document.getElementById('ttl'),fb=typeof FBU!='undefined'&&FBU; /* menu buttons */
   return t&&t.querySelector('.ttm')&&(!window.LB||t.querySelector('button[onclick="LB.open()"]'))&&(!fb||!window.FW_PROFILE||t.querySelector('.fwpf-ic'))&&(!fb||typeof menuIcon!='function'||t.querySelector('.fhic'))}],
  [80,()=>(typeof FB_ON=='undefined'||!FB_ON||window.FW_AUTH_DONE)&&(!(typeof FBU!='undefined'&&FBU)||typeof CLD=='undefined'||CLD.ok||CLD.err)], /* sign-in and profile / cloud save */
  [100,()=>{const M=window.FW_MENUSTAGE;return !M||!(M.state=='idle'||M.state=='building')||!document.body.classList.contains('fwmenubg')||performance.now()-stT>7000}]]; /* stadium scene (waits at most 7 s, then the still picture shows) */
 let st=0,stT=performance.now(),shown=0;
 const ready=()=>{
  let ok=false;
  while(st<stages.length){let r=false;try{r=!!stages[st][1]()}catch(e){r=true}if(!r)break;st++;stT=performance.now()}
  ok=st>=stages.length;
  try{const lo=st?stages[st-1][0]:40,hi=ok?100:stages[st][0],v=ok?100:lo+(hi-lo)*.95*(1-Math.exp(-(performance.now()-stT)/4000));
   shown=Math.max(shown,v);const b=$('lb'),p=$('lp'),w=parseFloat(b.style.width)||0,x=Math.max(w,shown);b.style.width=x.toFixed(1)+'%';p.textContent=Math.round(x)+'%'}catch(e){}
  return ok};
 const fin=()=>{if(done)return;done=1;try{const b=$('lb');if(b)b.style.width='100%'}catch(e){}
  setTimeout(()=>{const l=document.getElementById('load');if(l)l.remove();
   try{if(sessionStorage.getItem('fw_go')){sessionStorage.removeItem('fw_go');ttPlay()}}catch(e){}},120)};
 const poll=()=>{if(done)return;let ok=false;try{ok=ready()}catch(e){ok=true}
  if(ok||performance.now()-t0>T)fin();else setTimeout(poll,100)};
 poll()}));
