/* ===== v55.5.1: pause stops every background timer and animation loop =====
   Loads first (right after 00-guard) so it wraps setInterval and requestAnimationFrame before any other file uses them.
   229-pause-freeze calls FWPX.freeze() / FWPX.thaw() when the game really pauses (same rule as its setTimeout freeze).
   - setInterval: every interval started while playing stops on pause and starts again on resume. Intervals started WHILE paused
     (pause menu, settings) run normally. Intervals made by the files in KEEP keep running: audio fades, saving, network, the
     pause menu itself, the main game loop and gamepad.
   - requestAnimationFrame: callbacks booked while playing are held on pause and booked again on resume, so mini-game loops,
     spinners and other animation loops stand still. The main render loop (window.loop) and files in KEEP carry on. */
(function(){
 if(window.FWPX)return;
 const KEEP=/\/(00-|07-input|08-music|09-settings|12-|27-boot|28-v25|67-beats|73-ambience|86-google|94-update|122-graphics|154-touch|157-spotifly|161-multi|162-fun|168-gamepad|169-popups|175-trailer|186-spotifly|202-trailer|205-announce|206-founder|207-dev|208-onb|209-founder|213-public|216-friends|217-spotifly|228-chat|229-|dev\/|dev-)/;
 function keepHere(){try{const L=(new Error().stack||'').split('\n').slice(1);
  for(const l of L){if(l.indexOf('00-pause-core')>-1)continue;if(!/\.js|index\.html|<anonymous>/.test(l))continue;return !/\.js/.test(l)||KEEP.test(l)}}catch(e){}return true}
 let fz=0,sl=0;
 /* ---- intervals ---- */
 const si=window.setInterval,ci=window.clearInterval,IV=new Map();
 window.setInterval=function(fn,ms){
  if(typeof fn!='function'||fz||sl)return si.apply(window,arguments);
  const kp=keepHere(),a=Array.prototype.slice.call(arguments,2),r={fn,ms,a,cur:0,kp};
  r.cur=si.apply(window,[fn,ms].concat(a));IV.set(r.cur,r);return r.cur};
 window.clearInterval=function(id){const r=IV.get(id);if(r){IV.delete(id);ci(r.cur);return}return ci.apply(window,arguments)};
 /* ---- animation frames ---- */
 const raf=window.requestAnimationFrame.bind(window),caf=window.cancelAnimationFrame.bind(window),RF=new Map(),HELD=new Set(),KW=new WeakMap();
 function book(r){r.cur=raf(t=>{if(fz){HELD.add(r);return}RF.delete(r.pub);r.fn(t)})}
 window.requestAnimationFrame=function(fn){
  if(typeof fn!='function'||fz||fn===window.loop)return raf(fn);
  let k=KW.get(fn);if(k===undefined){k=keepHere();KW.set(fn,k)}
  if(k)return raf(fn);
  const r={fn,cur:0,pub:0};book(r);r.pub=r.cur;RF.set(r.pub,r);return r.pub};
 window.cancelAnimationFrame=function(id){const r=RF.get(id);if(r){RF.delete(id);HELD.delete(r);caf(r.cur);return}return caf(id)};
 window.FWPX={
  freeze(){if(fz)return;fz=1;IV.forEach(r=>{if(!r.kp&&r.cur){ci(r.cur);r.cur=0}})},
  /* v55.18.0: sleep = the tab is hidden and silent: stop EVERY interval (kept ones too); wake restarts them */
  sleep(){if(sl)return;sl=1;IV.forEach(r=>{if(r.cur){ci(r.cur);r.cur=0}})},
  wake(){if(!sl)return;sl=0;IV.forEach(r=>{if(!r.cur&&(!fz||r.kp))r.cur=si.apply(window,[r.fn,r.ms].concat(r.a))})},
  thaw(){if(!fz)return;fz=0;if(!sl)IV.forEach(r=>{if(!r.cur)r.cur=si.apply(window,[r.fn,r.ms].concat(r.a))});
   const h=Array.from(HELD);HELD.clear();h.forEach(book)},
  counts:()=>({iv:IV.size,raf:RF.size,held:HELD.size})};
})();
