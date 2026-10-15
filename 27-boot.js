/* ---------- boot ---------- */
buildHouse();buildHouseX();buildWorld();buildHomes();buildInteriors();buildNPCs();buildBigWorld();buildCity();buildVenues();finishRoads();flushSB();buildTraffic();cityTraffic();snapS();refresh();parkCars();syncF();buildLots();syncArt();P.mesh.position.set(P.x,0,P.z);pvLoop();requestAnimationFrame(loop);
/* v26.86.1: the bar used to keep counting up for about 2.3 s after the world was already built (25 steps of 90 ms);
   now the loading screen goes as soon as the first frame has drawn behind it */
$('lb').style.width='100%';
/* v26.87: open on the main menu; a save in this browser is loaded behind it */
requestAnimationFrame(()=>requestAnimationFrame(()=>{$('load').remove();TT.game=restoreSave();titleOpen();try{if(sessionStorage.getItem('fw_go')){sessionStorage.removeItem('fw_go');ttPlay()}}catch(e){}}));
