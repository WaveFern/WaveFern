/* ===== v26.142: release celebrations (the Next Goal ladder was replaced by the Quests app in v43.1.0, 133-quests.js) =====
   Old notes:
   A small chip (bottom-left) always shows the next career goal with progress; finishing one pays a cash reward with a
   card, chime and confetti. Goals run from first song to late-game fame. Releasing a song gets its own pop-up.
   Builds on the Big Vee tutorial (72-tutorial.js): reuses its card, confetti and styles, hides while the tutorial tracker is up.
   State: S.goals={done:{id:1},off:0}. Old saves: goals they already meet are marked done silently (no reward, no pop-up). */
const glN=n=>n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(1)+'k':Math.floor(n).toLocaleString();
function glCSS(){if($('glcss'))return;const s=document.createElement('style');s.id='glcss';s.textContent=`
#glc{position:fixed;left:10px;bottom:44px;z-index:58;width:min(250px,60vw);background:#0b0f0dd9;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008;padding:6px 9px;color:var(--t);font-size:12px;line-height:1.3;cursor:pointer}
#glc .g1{font:10px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:.5px}#glc .g2{margin:3px 0;color:#fff}#glc .g3{height:6px;background:#000;border:1px solid #2a352e}#glc .g3 i{display:block;height:100%;background:var(--g)}#glc small{color:#8aa094}
#glc.mini{width:auto;padding:3px 8px}@media (max-width:700px){#glc{bottom:150px}}
#glr{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:62;pointer-events:none;text-align:center;background:#0b0f0def;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 3px #ffd27a66,6px 6px 0 #0008;padding:12px 26px;min-width:min(300px,84vw);box-sizing:border-box;animation:tcIn 3s both}
#glr small{font:11px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:2px}#glr h2{font-size:20px;margin:5px 0 2px;color:#fff;text-shadow:3px 3px 0 #000}#glr p{margin:0;color:var(--g)}`;document.head.appendChild(s)}
function glCard(k,t,s){glCSS();const o=$('glr');if(o)o.remove();const e=document.createElement('div');e.id='glr';e.innerHTML=`<small>${k}</small><h2>${t}</h2><p>${s||''}</p>`;document.body.appendChild(e);setTimeout(()=>{if(e.parentNode)e.remove()},3000)}
function glBurst(n){try{tutBurst(innerWidth/2,innerHeight*.3,n)}catch(e){}}
/* release feedback: song count, quality and a first-song fanfare */
if(typeof upl=='function'){const u0=upl;upl=function(id){const n0=S.songs.length,d=S.drafts.find(x=>x.id==id),r=u0.apply(this,arguments);
 try{if(S.songs.length>n0){const s=S.songs[S.songs.length-1],q=+s.q||0,tag=q>=90?'Instant classic':q>=70?'Fire':q>=45?'Solid':'Rough but real';
  glCard(n0?'NEW RELEASE':'FIRST RELEASE',s.title,tag+' · song #'+S.songs.length+(n0?'':' · you are on Spotifly'));snd('chime');setTimeout(()=>snd('cash'),150);glBurst(n0?24:44)}}catch(e){}return r}}
