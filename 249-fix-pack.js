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

/* v55.21.8: Settings opened from the main menu lists only options that do something there. Rows that only change the in-game
   HUD and world (name tags, key hints, camera, FPS counter, clock, sunbeams, pause menu options...) are left out. */
if(typeof stBody=='function'){const sb0=stBody;
 const HUD=/^(Name tags|First-person monitor|Camera zoom|Always run|Key hints|Auto-pause|12-hour clock|FPS counter|Sunbeams|Pause menu music|Pause menu blur|Pause actually pauses)/;
 stBody=function(){const h=sb0.apply(this,arguments);
  try{if(typeof TT!='object'||!TT.on||typeof h!='string')return h;
   const t=document.createElement('template');t.innerHTML=h;
   t.content.querySelectorAll('.so').forEach(r=>{const s=r.firstElementChild;if(s&&HUD.test(s.textContent.trim()))r.remove()});
   return t.innerHTML}catch(e){return h}}}

/* v55.21.8: pause menu "Autosave" button for Google accounts (replaces the old save-to-account toast). Press it to save to the device and the account now:
   three pixel dots pulse while it works (opacity steps), then a pixel tick fades in. It also runs by itself every time the pause menu opens. */
if(typeof pauseUI=='function'){const pu0=pauseUI;
 const st=document.createElement('style');st.textContent=`.asv{display:flex!important;align-items:center;justify-content:center;gap:10px}
.asv .asd{display:inline-flex;gap:3px;height:12px;align-items:center}.asv .asd i{width:4px;height:4px;background:currentColor;opacity:.2;animation:asvd .9s steps(1) infinite}
.asv .asd i:nth-child(2){animation-delay:.3s}.asv .asd i:nth-child(3){animation-delay:.6s}
@keyframes asvd{0%{opacity:.2}33%{opacity:1}66%{opacity:.2}100%{opacity:.2}}
.asv .ast{width:14px;height:11px;opacity:0;transition:opacity .35s steps(4);color:var(--g,#2ee88e)}.asv.done .ast{opacity:1}
.asv .asd{opacity:0;transition:opacity .2s steps(2)}.asv.busy .asd{opacity:1}`;document.head.appendChild(st);
 const TICK='<svg class=ast viewBox="0 0 7 6" shape-rendering="crispEdges" fill="currentColor"><path d="M0 3h1v1h1v1h1V4h1V3h1V2h1V1h1V0h-1v1h-1v1h-1v1H4v1H3v1H2V4H1V3z"/></svg>';
 let ASV='';/* '', busy, done, fail: kept here because the pause menu is redrawn and the button node is replaced */
 const paint=()=>{const b=document.getElementById('asvb');if(!b)return;b.classList.toggle('busy',ASV=='busy');b.classList.toggle('done',ASV=='done');b.querySelector('.asl').textContent=ASV=='done'?'Autosaved':ASV=='fail'?'Autosave failed':'Autosave'};
 window.fwAutosave=function(){if(ASV=='busy')return;ASV='busy';paint();const t0=Date.now();
  let p;try{try{autoSave()}catch(e){}p=(typeof FBU!='undefined'&&FBU&&typeof CLD!='undefined'&&CLD.ok&&typeof csPush=='function')?csPush(1):Promise.resolve(1)}catch(e){p=Promise.resolve(0)}
  Promise.resolve(p).catch(()=>0).then(r=>{setTimeout(()=>{ASV=(r===0||r===false||(typeof CLD!='undefined'&&CLD.err&&FBU))?'fail':'done';paint()},Math.max(0,700-(Date.now()-t0)))})};
 pauseUI=function(){pu0.apply(this,arguments);try{
  if(typeof FBU=='undefined'||!FBU)return;const m=document.getElementById('pzm');if(!m||m.querySelector('#asvb'))return;
  const b=document.createElement('button');b.id='asvb';b.className='asv';b.innerHTML='<span class=asl>Autosave</span><span class=asd><i></i><i></i><i></i></span>'+TICK;b.onclick=()=>{try{snd('click')}catch(e){}ASV='';fwAutosave()};
  const q=[...m.querySelectorAll('button')].find(x=>/^Save and quit$/.test(x.textContent.trim()));m.insertBefore(b,q||null);
  paint();if(!ASV)fwAutosave()}catch(e){}}}
