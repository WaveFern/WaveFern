/* WaveFern dev: makes sure every menu button added by a dev script is there on first load. Only loaded on /dev/.
   The game draws the main menu while it boots, which can be before the dev scripts have wrapped titleUI/pauseUI, so the first
   draw misses their buttons (Leaderboard, Profile avatar). This script loads last: once everything has wrapped, it redraws
   the menu that is already on screen. Redrawing is safe to repeat: each dev button checks for itself before it is added. */
(function(){
 if(!window.FW_DEV)return;
 function sync(){
  try{
   if(typeof titleUI=='function'&&document.getElementById('ttl')&&typeof TT=='object'&&TT.on&&!TT.sel&&!document.getElementById('lbd')){
    const t=document.getElementById('ttl');
    if(!t.querySelector('button[onclick="LB.open()"]')&&window.LB||!t.querySelector('.fwpf-ic')&&window.FW_PROFILE)titleUI();
   }
   if(typeof pauseUI=='function'&&document.getElementById('pzm')){
    const m=document.getElementById('pzm');
    if(window.LB&&!m.querySelector('button[onclick="LB.open()"]'))pauseUI();
   }
  }catch(e){console.error('menu sync',e)}
 }
 sync();
 addEventListener('load',sync);
 /* the boot can finish after load (saves, sign-in): re-check a few times, then stop */
 let n=0;const iv=setInterval(()=>{sync();if(++n>=10)clearInterval(iv)},500);
})();
