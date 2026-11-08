/* ===== v49.93.25: Spotifly profile pictures are always the detailed 3D press shot =====
   Some Spotifly pictures (artists in lists, your own picture in the sidebar and artist page, the Gphone app) stayed as the
   old 16x16 face when their 3D version was not ready in time or the page changed first. This sweeper runs while Spotifly is
   on screen, finds any <img> still showing a 16x16 face (an artist look from the pf2 cache, or your own drawn face) and swaps
   in the 3D press shot, a few per frame so nothing stalls. An uploaded picture still wins. */
(function(){
if(typeof igxPortrait!='function'||typeof IGX!='object'||typeof PFC2!='object')return;
const RV=new Map();let RVn=-1;
function rv(){try{const ks=Object.keys(PFC2);if(ks.length!==RVn){RVn=ks.length;ks.forEach(j=>{const u=PFC2[j];if(!RV.has(u))try{RV.set(u,JSON.parse(j))}catch(e){}})}}catch(e){}return RV}
function onSf(){try{return mode=='phone'?(PH.app=='sf'||PH.app=='spot'):mode=='pc'?app==1:false}catch(e){return false}}
const Q=[],QK=new Set;let busy=0,fail=0;
function pump(){const t=performance.now();
 while(Q.length&&performance.now()-t<8){const j=Q.shift();QK.delete(j.old);let u;
  try{u=igxPortrait(j.c,j.mine,'sf')}catch(e){fail++;Q.push(j);QK.add(j.old);busy=1;setTimeout(()=>{busy=0;if(Q.length)busy=requestAnimationFrame(pump)},Math.min(8000,500*fail));return}
  if(u)document.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')===j.old)i.src=u})}
 fail=0;busy=Q.length?requestAnimationFrame(pump):0}
function add(c,mine,old){if(QK.has(old))return;QK.add(old);Q.push({c,mine,old});if(!busy)busy=requestAnimationFrame(pump)}
function sweep(){if(!onSf())return;if(!IGX.on)IGX.on=1;
 let mine=null,mineU=null;try{if(!S.pfpSp){mineU=pfp(ch);mine=ch}}catch(e){}
 const m=rv();
 document.querySelectorAll('img').forEach(i=>{const s=i.getAttribute('src');if(!s||s.length<40||s.slice(0,22)!=='data:image/png;base64,')return;
  if(mineU&&s===mineU)return add(mine,1,s);
  const c=m.get(s);if(c)add(c,0,s)})}
setInterval(sweep,400);
})();
