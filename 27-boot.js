/* ---------- boot ---------- */
buildHouse();buildHouseX();buildWorld();buildHomes();buildInteriors();buildNPCs();buildBigWorld();buildCity();buildVenues();finishRoads();flushSB();buildTraffic();cityTraffic();snapS();refresh();parkCars();syncF();buildLots();syncArt();P.mesh.position.set(P.x,0,P.z);pvLoop();requestAnimationFrame(loop);
let lp=0;const tips=['Tuning guitars…','Plugging in the mic…','Hanging posters…','Warming up the vocals…'];
const iv=setInterval(()=>{lp+=4;$('lb').style.width=lp+'%';$('lt').textContent=tips[Math.min(3,lp/26|0)];if(lp>=100){clearInterval(iv);$('load').remove();if(!restoreSave()){mode='creator';creatorUI()}}},90);
