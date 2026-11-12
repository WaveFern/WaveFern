/* ===== v52.2.0: pausing freezes everything =====
   The game loop already skips update() while paused, which stops the day clock, streams, walking, weather and the rest of the
   world. This file stops what update() does not reach, and makes resume clean (no catch-up jumps):
   1. Pending short setTimeouts that were started while playing stop counting down on pause and carry on with the time they had
      left on resume (NPC lines, app-install steps, "say" lines, bodyguards arriving, flight take-off and so on). Timers started
      WHILE paused (pause menu, settings, toasts) run normally. Timers longer than 20 s (network, saving) are left alone.
   2. Real-time deadlines that are saved or kept in game state (S.typ typing holds, S.dl downloads, the brand trip nudge, Big
      Vee's tip pacing) are pushed forward by the time spent paused when you resume.
   3. CSS animations on the game screens (download bars, ticker strips, HUD bits) are paused; the pause menu itself keeps moving.
   4. FWP.now() is a performance.now() that does not count paused time, for animations that time themselves (the flight map).
   Online: if anyone else in your band is still playing, time keeps running for you (v49.45.0 rule in 161-multiplayer), so
   nothing freezes then. The title screen is not a pause. Loads last, after 228. Balance is untouched. */
(function(){
 if(window.FWP)return;
 const pn=()=>performance.now(),st0=window.setTimeout,ct0=window.clearTimeout,LIM=20000;
 const F={fz:0,dt0:0,tot:0,subs:[],tm:new Map()};
 const frozen=()=>{try{return !!PAUSED&&mode=='pause'&&!(typeof window.fwMpRuns=='function'&&window.fwMpRuns())}catch(e){return false}};
 /* ---- 1. pausable timeouts ---- */
 window.setTimeout=function(fn,ms){
  if(typeof fn!='function'||F.fz||+ms>LIM)return st0.apply(window,arguments);
  const a=Array.prototype.slice.call(arguments,2),r={cur:0,due:0,left:0,pub:0};
  r.arm=d=>{r.due=pn()+d;r.cur=st0(()=>{F.tm.delete(r.pub);fn.apply(window,a)},d)};
  r.arm(+ms||0);r.pub=r.cur;F.tm.set(r.pub,r);return r.pub};
 window.clearTimeout=function(id){const r=F.tm.get(id);if(r){F.tm.delete(id);ct0(r.cur);return}return ct0.apply(window,arguments)};
 /* ---- freeze / thaw ---- */
 function freeze(){F.fz=pn();F.dt0=Date.now();F.tm.forEach(r=>{ct0(r.cur);r.left=Math.max(0,r.due-F.fz)});
  try{document.body.classList.add('fwpz')}catch(e){}}
 function thaw(){const d=pn()-F.fz,dd=Math.max(0,Date.now()-F.dt0);F.tot+=d;F.fz=0;F.tm.forEach(r=>r.arm(r.left));
  try{document.body.classList.remove('fwpz')}catch(e){}
  F.subs.forEach(f=>{try{f(dd,d)}catch(e){console.error('pause shift',e)}})}
 function sync(){const f=frozen();if(f&&!F.fz)freeze();else if(!f&&F.fz)thaw()}
 window.FWP={sync,frozen:()=>{sync();return !!F.fz},on:f=>F.subs.push(f),
  now:()=>pn()-F.tot-(F.fz?pn()-F.fz:0)};
 /* ---- 2. deadlines kept in game state move forward by the paused time ---- */
 F.subs.push(dd=>{if(!dd||typeof S!='object'||!S)return;
  if(Array.isArray(S.typ))S.typ.forEach(p=>{if(p&&+p.end)p.end+=dd});
  if(S.dl&&typeof S.dl=='object')for(const k in S.dl){const d=S.dl[k];if(d&&+d.end)d.end+=dd}});
 F.subs.push(dd=>{if(!dd)return;try{const o=window.BRD&&BRD.active&&BRD.active();if(o&&+o.nx)o.nx+=dd}catch(e){}});
 F.subs.push(dd=>{if(!dd)return;try{
  if(typeof TD!='undefined'&&TD&&+TD.wait)TD.wait+=dd;
  if(typeof TUTLAST!='undefined'&&TUTLAST)TUTLAST+=dd;
  if(typeof TUTQ!='undefined'&&TUTQ)TUTQ+=dd;
  if(typeof TUTBUB!='undefined'&&TUTBUB&&+TUTBUB.end)TUTBUB.end+=dd}catch(e){}});
 /* ---- 3. CSS animations on the game screens stand still (the pause menu and what it opens keep moving) ---- */
 {const s=document.createElement('style');
  s.textContent='body.fwpz :not(#ui):not(#ui *),body.fwpz #ui #pc,body.fwpz #ui #pc *{animation-play-state:paused!important}';
  document.head.appendChild(s)}
 /* ---- hook pause / resume so the switch happens in the same call, and watch for anything that flips PAUSED directly ---- */
 if(typeof pauseGame=='function'){const p0=pauseGame;pauseGame=function(){sync();const r=p0.apply(this,arguments);sync();return r}}
 if(typeof resumeGame=='function'){const r0=resumeGame;resumeGame=function(){sync();const r=r0.apply(this,arguments);sync();return r}}
 setInterval(sync,50);
})();
