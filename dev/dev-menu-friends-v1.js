/* WaveFern dev: Friends moves under Multiplayer. Only loaded on /dev/.
   The main menu had too many buttons, so the separate Friends button is gone from it. Friends is still one tap away:
   the Multiplayer screen ("Your rooms") has its Friends button, and the friend-request count (frbadge) now shows on the
   Multiplayer button, so a new request is still noticed from the main menu. Invites, the band HUD Friends button and
   the pause menu are untouched. Add ?nofriendsgroup to the address to keep the old menu. */
(function(){
 if(!window.FW_DEV||/[?&]nofriendsgroup/.test(location.search))return;
 if(typeof titleUI!='function')return;
 function fix(){
  const m=document.querySelector('#ttl .ttm');if(!m)return;
  const mp=m.querySelector('button[onclick="mpRooms()"]');
  if(!mp)return; /* in a band room the menu has no Multiplayer button: leave that menu as it is */
  m.querySelectorAll('button[onclick="frOpen()"]').forEach(b=>b.remove());
  if(!mp.querySelector('.frbadge'))mp.insertAdjacentHTML('beforeend','<span class=frbadge></span>');
  try{if(typeof frDraw=='function')frDraw()}catch(e){}
 }
 const t0=titleUI;
 titleUI=function(){const r=t0.apply(this,arguments);try{fix()}catch(e){console.error('menu friends',e)}return r};
 try{fix()}catch(e){}
 /* the first menu is drawn while the game boots, before this script wraps titleUI, and other scripts redraw it later: watch the menu and take the button out the moment it appears, so it never flashes up */
 let busy=0;
 new MutationObserver(()=>{if(busy)return;if(!document.querySelector('#ttl .ttm button[onclick="frOpen()"]'))return;busy=1;try{fix()}catch(e){console.error('menu friends',e)}busy=0}).observe(document.documentElement,{childList:true,subtree:true});
})();
