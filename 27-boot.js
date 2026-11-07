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
  if(document.readyState!='complete')return false; /* every script has loaded and run */
  const t=document.getElementById('ttl');if(!t)return false;
  if(!t.querySelector('.ttm'))return false;
  if(window.LB&&!t.querySelector('button[onclick="LB.open()"]'))return false; /* Leaderboard button */
  if(typeof FBU!='undefined'&&FBU){
   if(window.FW_PROFILE&&!t.querySelector('.fwpf-ic'))return false; /* Profile avatar */
   if(typeof menuIcon=='function'&&!t.querySelector('.fhic'))return false; /* Friends icon */
   if(typeof CLD!='undefined'&&!CLD.ok&&!CLD.err)return false; /* profile / cloud save */
  }
  if(typeof FB_ON!='undefined'&&FB_ON&&!window.FW_AUTH_DONE)return false; /* sign-in state known */
  const M=window.FW_MENUSTAGE;
  if(M&&(M.state=='idle'||M.state=='building')&&document.body.classList.contains('fwmenubg'))return false; /* stadium scene */
  return true};
 const fin=()=>{if(done)return;done=1;try{const b=$('lb');if(b)b.style.width='100%'}catch(e){}
  setTimeout(()=>{const l=document.getElementById('load');if(l)l.remove();
   try{if(sessionStorage.getItem('fw_go')){sessionStorage.removeItem('fw_go');ttPlay()}}catch(e){}},120)};
 const poll=()=>{if(done)return;let ok=false;try{ok=ready()}catch(e){ok=true}
  if(ok||performance.now()-t0>T)fin();else setTimeout(poll,100)};
 poll()}));
