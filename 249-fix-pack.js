/* ===== v55.20.1: critical bug fix pack (small patches that wrap older functions; loads last of the root scripts) =====
   (The double click sound on Play is fixed in 09-settings-effects.js.)
   2. Camera: the go-to-bed question and the sleep fade keep the zoom you had in play (no zoom-out).
   3. Phone: if an app (Instagrime) throws while drawing, the phone goes back to the feed instead of leaving a broken screen.
   4. Album cover: "Put my face on the cover" is a game button instead of a bare browser checkbox.
   5. Recovered backups (career select): each has a delete button, and a backup is deleted by itself after 30 days.
   Nothing here adds saved fields. */
(function(){
'use strict';
/* 2. keep the play zoom while going to bed */
{const v0=window.VIEWX;let lastV=0;
 window.VIEWX=function(){try{if(mode=='play'&&!IN)lastV=viewT;
  else if(lastV&&(mode=='sleep'||(mode=='menu'&&/Go to bed/i.test((document.getElementById('ui')||{}).textContent||''))))return lastV}catch(e){}
  return typeof v0=='function'?v0():0}}
/* 3. a throwing phone app falls back to its home view */
if(typeof phR=='function'){const p0=phR;let bad=0;
 phR=function(){try{return p0.apply(this,arguments)}catch(e){console.error('phone app failed: '+(PH&&PH.app),e);if(bad++<3){try{if(PH.app=='ig'){igv='feed';igp=null;igm=0}else PH.app='home';return p0.apply(this,arguments)}catch(x){console.error('phone fallback failed',x)}}}}}
/* 4. album cover: face toggle as a game button */
if(typeof PG=='object'&&PG.albums){const a0=PG.albums;
 PG.albums=function(){const h=a0.apply(this,arguments);try{return h.replace(/<label style="display:block;margin-top:8px"><input type=checkbox[^>]*>[^<]*<\/label>/,
  `<div style="margin-top:10px"><button class="${AL.face?'go':''}" onclick="AL.face=${AL.face?0:1};pcR()">${AL.face?'✓ ':''}Put my face on the cover</button><small class=m style="display:block;margin-top:4px">Pick a symbol too: it goes behind you.</small></div>`)}catch(e){return h}}}
/* 6. Instagrime on the laptop crashed on brand ad posts: their kind is 'brand' and the comment pool KCM (22a) had no 'brand' list
      (TypeError: KCM[kd] is not iterable). Give brand posts comments, and any other unknown kind a safe fallback. */
try{if(typeof KCM=='object'&&KCM){KCM.brand=['okay but I need this','the new drop looks so good','been waiting for this one','that colour is perfect','take my money','who else is getting it','ad or not, I am sold','their stuff always sells out fast'];
 Object.setPrototypeOf(KCM,new Proxy({},{get:(t,k)=>typeof k=='string'?(KCM.fit||[]):undefined}))}}catch(e){console.warn('KCM fallback',e)}
/* 7. house: the doorway cut in the bedroom's north wall is only for the extension; with no extension the wall must be whole */
{const wt=worldTick;worldTick=function(dt){wt.apply(this,arguments);try{if((S.home||0)<2&&typeof NWM!='undefined'&&NWM.length&&!(typeof WK!='undefined'&&WK>0)){NWM.forEach(q=>{if(q[0]&&!q[0].visible)q[0].visible=true});if(WIN&&WIN.children.length&&typeof WK!='undefined'&&WK==0)WIN.visible=false}}catch(e){}}}
/* 5. recovered backups: delete button + 30 day expiry (fw_bakt_N = when the backup was first seen) */
const BKD=30*864e5;
function bakSweep(){try{const now=Date.now();for(let n=1;n<=12;n++){const b=localStorage.getItem('fw_bak_'+n);
  if(!b){localStorage.removeItem('fw_bakt_'+n);continue}
  const t=+localStorage.getItem('fw_bakt_'+n)||0;
  if(!t)localStorage.setItem('fw_bakt_'+n,String(now));
  else if(now-t>BKD){localStorage.removeItem('fw_bak_'+n);localStorage.removeItem('fw_bakw_'+n);localStorage.removeItem('fw_bakt_'+n)}}}catch(e){}}
if(typeof bakKeep=='function'){const k0=bakKeep;bakKeep=function(){const r=k0.apply(this,arguments);bakSweep();return r}}
window.ttBakDel=function(n){const d=document.createElement('div');d.id='ttbd';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000a';
 d.innerHTML='<div class="box modal" style="width:min(380px,92vw)"><h2>Delete this backup?</h2><p>This recovered backup is removed for good. It cannot be brought back.</p><div class=row2><button class=go id=ttbdy>Delete</button><button id=ttbdn>Cancel</button></div></div>';
 document.body.appendChild(d);document.getElementById('ttbdy').onclick=()=>{d.remove();try{localStorage.removeItem('fw_bak_'+n);localStorage.removeItem('fw_bakw_'+n);localStorage.removeItem('fw_bakt_'+n)}catch(e){}try{ttWorlds()}catch(e){}};
 document.getElementById('ttbdn').onclick=()=>d.remove()};
if(typeof ttWorlds=='function'){const w0=ttWorlds;
 ttWorlds=function(){bakSweep();const r=w0.apply(this,arguments);try{document.querySelectorAll('#ttl .ttbk[data-bak]').forEach(row=>{if(row.querySelector('.ttbd'))return;
   const b=document.createElement('button');b.className='ttdel ttbd';b.textContent='✕';b.title='Delete this backup';b.setAttribute('aria-label','Delete backup');b.onclick=()=>ttBakDel(row.dataset.bak);row.appendChild(b)});
  const sm=document.querySelector('#ttl .ttrb summary');if(sm&&!document.querySelector('#ttl .ttrb .ttbn')){const p=document.createElement('p');p.className='m ttbn';p.style.cssText='margin:4px 0;font-size:12px';p.textContent='Backups are deleted automatically after 30 days.';sm.after(p)}}catch(e){}return r}}
bakSweep();
})();
