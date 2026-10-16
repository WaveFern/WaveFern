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
$('lb').style.width='100%';
/* v26.87: open on the main menu; a save in this browser is loaded behind it */
requestAnimationFrame(()=>requestAnimationFrame(()=>{$('load').remove();if(window.fwBooted)fwBooted();try{TT.game=restoreSave()}catch(e){fwSoftErr(e,'restoreSave')}titleOpen();try{if(sessionStorage.getItem('fw_go')){sessionStorage.removeItem('fw_go');ttPlay()}}catch(e){}}));
