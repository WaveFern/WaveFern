/* ---------- boot ---------- */
buildHouse();buildHouseX();buildWorld();buildHomes();buildInteriors();buildNPCs();buildBigWorld();buildCity();buildVenues();finishRoads();flushSB();buildTraffic();cityTraffic();snapS();refresh();parkCars();syncF();buildLots();syncArt();P.mesh.position.set(P.x,0,P.z);pvLoop();requestAnimationFrame(loop);
/* v26.86.1: the bar used to keep counting up for about 2.3 s after the world was already built (25 steps of 90 ms);
   now the loading screen goes as soon as the first frame has drawn behind it */
$('lb').style.width='100%';
requestAnimationFrame(()=>requestAnimationFrame(()=>{$('load').remove();if(!restoreSave()){mode='creator';creatorUI()}}));
