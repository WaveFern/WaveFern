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
 const ready=()=>{
  const t=document.getElementById('ttl'),M=window.FW_MENUSTAGE,fb=typeof FBU!='undefined'&&FBU;
  const checks=[
   ()=>document.readyState=='complete', /* every script has loaded and run */
   ()=>t&&t.querySelector('.ttm'),
   ()=>!window.LB||t.querySelector('button[onclick="LB.open()"]'), /* Leaderboard button */
   ()=>!fb||!window.FW_PROFILE||t.querySelector('.fwpf-ic'), /* Profile avatar */
   ()=>!fb||typeof menuIcon!='function'||t.querySelector('.fhic'), /* Friends icon */
   ()=>!fb||typeof CLD=='undefined'||CLD.ok||CLD.err, /* profile / cloud save */
   ()=>typeof FB_ON=='undefined'||!FB_ON||window.FW_AUTH_DONE, /* sign-in state known */
   ()=>!M||!(M.state=='idle'||M.state=='building')||!document.body.classList.contains('fwmenubg')]; /* stadium scene */
  let n=0;for(const c of checks){let ok=false;try{ok=!!c()}catch(e){ok=true}if(ok)n++}
  /* the bar fills for real as each part is ready (it only ever moves forward), so it never sits on a number */
  try{const b=$('lb'),p=$('lp'),w=parseFloat(b.style.width)||0,v=Math.max(w,80+19*n/checks.length);b.style.width=v.toFixed(1)+'%';p.textContent=Math.round(v)+'%'}catch(e){}
  return n==checks.length};
 const fin=()=>{if(done)return;done=1;try{const b=$('lb');if(b)b.style.width='100%'}catch(e){}
  setTimeout(()=>{const l=document.getElementById('load');if(l)l.remove();
   try{if(sessionStorage.getItem('fw_go')){sessionStorage.removeItem('fw_go');ttPlay()}}catch(e){}},120)};
 const poll=()=>{if(done)return;let ok=false;try{ok=ready()}catch(e){ok=true}
  if(ok||performance.now()-t0>T)fin();else setTimeout(poll,100)};
 poll()}));
