/* ===== admin tools: screen recording stadium teleports, hidden career, hide all UI ===== (admin account only, isAdmin() from 88-admin.js)
   - Admin panel gets a "Stadium shows" list: teleports to a world tour city and walks on stage at its stadium.
   - The admin's career is flagged S.noLB so its profile is never written to the leaderboard.
   - Key 8 toggles every on-screen UI off and on again. */
(function(){
if(typeof isAdmin!='function')return;
const ok=()=>{try{return isAdmin()&&!!S}catch(e){return false}};

/* career never shows on the leaderboard (fwProfileSync in 213-public-profile.js skips while S.noLB is set) */
window.admNoLB=function(){if(!ok())return;S.noLB=1;try{if(FBF&&FBD&&FBU){FBF.deleteDoc(FBF.doc(FBD,'profiles',FBU.uid)).catch(()=>{});FBF.deleteDoc(FBF.doc(FBD,'leaderboard',FBU.uid)).catch(()=>{})}}catch(e){}};

/* teleport: same setup as the game trailer's stadium show (175-trailer.js) */
window.admStadium=function(id,kind){if(!ok()||!window.DCITY||!wtDest(id))return;
 try{admNoLB();S.cheat=1;closeUI();DCITY.view=null;
  DCITY.arrive(id,{quiet:1});
  S.dcity=S.dcity||{};S.dcity.prep=S.dcity.prep||{};S.dcity.prep[id+'|'+(kind||'venue')]={songs:S.songs.slice(-6).map(s=>s.id),prod:{pyro:1,lasers:1,confetti:1,dancers:1},reh:2,rd:S.day};
  S.money=Math.max(S.money,1e7);S.energy=100;S.t=Math.max(S.t,380);
  DCITY.startShow(kind||'venue');
 }catch(e){console.error('admin stadium',e);say('Could not teleport there.')}};

/* admin panel section, added under the existing admin screen */
const sec=()=>{const L=WT_DEST.filter(d=>d.venue);
 return`<h3>Stadium shows (screen recording)</h3><div class=adml>${L.map(d=>`<div><span><b>${esc(d.venue.n)}</b><br><small class=m>${esc(d.city||d.country)}</small></span><button onclick="admStadium('${d.id}','venue')">Teleport</button></div>`).join('')}</div>
  <h3>Leaderboard</h3><p class=m><small>This career is hidden from the leaderboard${S.noLB?'':' (hiding it now)'}.</small></p>
  <p class=m><small>Press 8 in the game to hide all on-screen UI, and 8 again to show it.</small></p>`};
{const u0=admUI;admUI=function(){u0.apply(this,arguments);try{const p=$('admp');if(!p||!ok())return;if(!S.noLB)admNoLB();const h=p.querySelector('.admx');if(!h){const d=document.createElement('div');d.className='admx';d.innerHTML=sec();p.appendChild(d)}}catch(e){console.error(e)}}}

/* key 8: hide or show all on-screen UI */
addEventListener('keydown',e=>{if(e.key!='8'||e.repeat||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;if(!ok())return;document.body.classList.toggle('fwnoui')});
const st=document.createElement('style');st.textContent='body.fwnoui #hud,body.fwnoui #ui,body.fwnoui #dsst,body.fwnoui #dscr,body.fwnoui .hb{display:none!important}';document.head.appendChild(st);
})();
