/* ===== v26.110: working furniture, Storage (Furniture + Food), permanent desk =====
   - Any bed (the starter bed or an Amazoom one) is where you sleep; a placed wardrobe opens your wardrobe; piano, drums and
     guitar stands can be played. Everything lives in PL (placed) and S.inv (stored), which are saved.
   - Desks are not sold on Amazoom any more (desk upgrades are in the Gear shop). The starter desk cannot be stored or picked up.
   - Food from Goober Eats goes to Storage (S.fd = {foodIndex: count}); click it in Storage to eat it.
   - You cannot leave Storage while there is no bed placed. */
const isBed=t=>t=='bed'||/^bed(1|3|_\d+)$/.test(t),hasBed=()=>PL.some(q=>isBed(q.t));
['desk1','desk2','desk3'].forEach(k=>{if(F[k])Object.defineProperty(F,k,{enumerable:false,writable:true,configurable:true,value:F[k]})});
if(GEAR.desk){GEAR.desk.n='Desk';GEAR.desk.d='Upgrade your desk: better mixing and a bigger setup'}

/* sleeping follows whichever bed is placed (the starter bed first) */
{const pick=()=>PL.find(q=>q.t=='bed')||PL.find(q=>isBed(q.t));
 const bed=INT[0];Object.defineProperty(bed,'x',{get(){const q=pick();return q?q.x+spRot(1.5,.55,q.r)[0]:-9999},set(){},configurable:true});
 Object.defineProperty(bed,'z',{get(){const q=pick();return q?q.z+spRot(1.5,.55,q.r)[1]:-9999},set(){},configurable:true})}

/* wardrobe, piano, drums, guitar stand: usable when placed */
{const di0=dynInt;dynInt=function(){const a=di0();if(HIN&&!IN)PL.forEach(q=>{if(Math.hypot(P.x-q.x,P.z-q.z)>2.8)return;
  if(q.t=='ward2')a.push({x:q.x,z:q.z,r:2.4,l:'Open wardrobe',a:()=>wardrobe()});
  else if(q.t=='piano')a.push({x:q.x,z:q.z,r:2.4,l:'Play piano',a:()=>{snd('pop');say(['You play a slow chord progression. Lovely.','You pick out a melody with one finger. It has potential.'][RI(0,1)])}});
  else if(q.t=='drums')a.push({x:q.x,z:q.z,r:2.4,l:'Play drums',a:()=>{snd('thunk');say('You hammer out a rhythm. The neighbours knock on the wall.')}});
  else if(q.t=='gstand')a.push({x:q.x,z:q.z,r:2.4,l:'Play guitar',a:()=>say('You strum a few chords. Not bad.')})});return a}}

/* the starter desk is permanent: always placed, never stored */
function ensureDesk(){if(!S.sp||typeof PL=='undefined'||!scene||mode=='load'||mode=='creator'||hold=='desk')return;if(PL.some(q=>q.t=='desk'))return;
 if(S.inv&&S.inv.desk>0)S.inv.desk=0;const m=mkF('desk');m.position.set(6,0,.7);scene.add(m);PL.push({t:'desk',x:6,z:.7,r:0,m})}
{const b0=buildTick;buildTick=function(){try{ensureDesk()}catch(e){}return b0.apply(this,arguments)}}
{const sk0=storeKey;storeKey=function(){if(mode=='build'){if(hold=='desk'){snd('err');return say('Your desk is part of the house. It cannot be stored.')}
  if(!hold){const i=hovFind();if(i>=0&&PL[i].t=='desk'){snd('err');return say('Your desk is part of the house. It cannot be stored.')}}}return sk0.apply(this,arguments)}}
/* clicking the desk does not pick it up */
addEventListener('mousedown',e=>{if(mode!='build'||hold||e.button!=0||e.target.closest('#ui>*,#hud button'))return;const i=hovFind();if(i>=0&&PL[i].t=='desk'){e.stopImmediatePropagation();snd('err');say('Your desk is fixed in place. Upgrade it in the Gear shop.')}},true);

/* Storage: Furniture and Food tabs */
let SGT='f';S.fd=S.fd||{};
const fdN=()=>Object.values(S.fd||{}).reduce((a,b)=>a+(b>0?b:0),0);
function eatFood(i){S.fd=S.fd||{};if(!(S.fd[i]>0))return;if((S.energy||0)>=100){snd('err');return say('You are already full of energy.')}
 S.fd[i]--;if(S.fd[i]<=0)delete S.fd[i];const f=FOOD[i];S.energy=Math.min(100,(S.energy||0)+f[2]);updateVersion();snd('eat');say('Yum! +'+f[2]+' energy');buildUI()}
function order(i){const f=FOOD[i];if(!f)return;if(S.money<f[1])return snd('err');S.money=+(S.money-f[1]).toFixed(2);S.fd=S.fd||{};S.fd[i]=(S.fd[i]||0)+1;updateVersion();snd('cash');say(f[0]+' delivered to Storage');pcR()}
buildUI=function(){S.fd=S.fd||{};const k=Object.keys(S.inv).filter(x=>S.inv[x]>0&&F[x]&&x!='desk'),fd=Object.keys(S.fd).filter(i=>S.fd[i]>0&&FOOD[i]);
 const tab=(t,n)=>`<button class="${SGT==t?'go':''}" onclick="SGT='${t}';buildUI()">${n}</button>`;
 const body=SGT=='f'?(k.length?k.map(t=>`<button onclick="holdItem('${t}')">${F[t].n} ×${S.inv[t]}</button>`).join(''):'<span class=m>No furniture in storage. Buy furniture on Amazoom (computer).</span>')
  :(fd.length?fd.map(i=>`<button onclick="eatFood(${i})">${FOOD[i][0]} ×${S.fd[i]} · +${FOOD[i][2]} energy</button>`).join(''):'<span class=m>No food in storage. Order from Goober Eats (computer).</span>');
 $('ui').innerHTML=`<div class=box style="position:absolute;left:50%;bottom:10px;transform:translateX(-50%);max-width:94vw;max-height:60vh;overflow:auto"><h3>Storage ${hold?'· placing '+F[hold].n:''}</h3><div style="display:flex;gap:6px;margin-bottom:6px">${tab('f','Furniture ('+k.reduce((a,t)=>a+S.inv[t],0)+')')}${tab('d','Food ('+fdN()+')')}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${body}<button class=go onclick="exitBuild()">Done</button></div><small class=m>${SGT=='f'?'Click: place · R: rotate · E: store (held item or hovered item) · Click placed item: move · F/Esc: exit · The desk is fixed and the room needs a bed':'Click food to eat it and restore energy. Food stays in storage until you eat it.'}</small></div>`};
/* v47.2.0: upstairs (the annex) counts as home too */
canFurn=function(){const up=!!IN&&ANX.idx!=null&&IN.i==ANX.idx&&ANX.lv>0;return up||!IN&&(HIN||mode=='build')};
{const e0=exitBuild;exitBuild=function(){if(mode=='build'){ensureDesk();const bedHeld=hold&&isBed(hold);if(!hasBed()){
   if(!bedHeld&&!Object.keys(S.inv).some(t=>isBed(t)&&S.inv[t]>0))S.inv.bed=(S.inv.bed||0)+1;
   snd('err');SGT='f';buildUI();return say('Place a bed before you leave Storage. You need somewhere to sleep.')}}return e0.apply(this,arguments)}}
/* spawn the bed for old saves: the hold item must come from storage in the UI */
