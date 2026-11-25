/* ===== v55.53: pets overhaul (held: FW_DEV only until release day) =====
   - You can own every pet and name each one, but only 3 are equipped at a time. S.pets stays the EQUIPPED list (everything
     that already reads S.pets: song quality, Instagrime photos, syncF, the 58-pets models); S.petOwn is every pet you own
     and S.petNames the names by pet kind. Old saves: petOwn is filled from pets (mig()).
   - Each pet already has one small powerup in the dev pets pack (dev/dev-pets.js, window.PET_PERK, applied through S.pets = the
     equipped list). This file only shows them and announces them when you equip a pet, so it ships together with that pack.
   - P opens the pet menu (3 slots, equip / unequip, rename) in the world; the Pets page on the computer is the shop.
   - Pets follow you outside (old follow code). At home (downstairs or upstairs) they roam, visit the pet furniture and sleep,
     eat or play there, with poses added on top of the 58-pets rig (petAnim wrapper). In other buildings they wait outside.
   - Bodyguards no longer follow you into your home: they wait by the front door (flwSpot wrapper).
   - The "Bring pets along" button is gone from the bodyguard page.
   Reused, not copied: 58-pets rigs and previews (pvc), 22f petUse/PETF (petUse is replaced here), 129 follow code, appointment shop flow. */
(function(){
const HELD=true;
if(HELD&&!window.FW_DEV)return;
const MAX=3;
/* the powerups come from dev/dev-pets.js (window.PET_PERK[k]=[name,text]); without that pack a pet only adds +1 song quality */
const PERK0=['+1 song quality','Every equipped pet adds a little to songs you record.'];
const pk=k=>(window.PET_PERK&&window.PET_PERK[k])||PERK0;
const BIRD=k=>k==2||k==6,SLEEP=k=>BIRD(k)?['perch']:k==0?['cattree','petbed']:k==1||k==5?['dogh','petbed']:['petbed','dogh'],PREF=k=>k==2?['pbowl','ptoy']:['ptoy','pbowl'];
const ST={ren:null,still:0,lx:0,lz:0,T:0};
const nm=k=>(S.petNames&&S.petNames[k])||PETS[k][0];
const eqd=k=>(S.pets||[]).includes(k);
function mig(){
 if(!Array.isArray(S.pets))S.pets=[];if(!Array.isArray(S.petOwn))S.petOwn=[];if(!S.petNames||typeof S.petNames!='object'||Array.isArray(S.petNames))S.petNames={};
 const ok=(k,i,a)=>typeof k=='number'&&PETS[k]&&a.indexOf(k)==i;
 S.pets=S.pets.filter(ok).slice(0,MAX);S.petOwn=S.petOwn.filter(ok);S.pets.forEach(k=>{if(!S.petOwn.includes(k))S.petOwn.push(k)});S.petsOut=true}
mig();
{const w0=worldTick;worldTick=function(dt){try{pre()}catch(e){}const r=w0.apply(this,arguments);try{post(dt)}catch(e){}return r}}
/* ---------- where am I ---------- */
const zone=()=>IN?(ANX.idx!=null&&IN.i==ANX.idx?'up':'in'):HIN?'home':'out';
const wait=f=>[6+(f.ox||0)*.9,14.4+(f.oz||0)*.5];/* bodyguards wait by the front door (Enter home is at x 6, z 12.9) */
const bounds=z=>z=='up'?[IN.x+1,IN.x+(IN.w||10)-1,321,319+(IN.d||8)]:[1,15,-(WGX||0)+1.2,10.8];
const inZ=(q,z)=>z=='up'?q.x>800:q.x<100&&q.z<14;
function place(f,z){/* put pet f beside you after you change zone */
 if(z=='out'){f.home=0;f.x=P.x+(f.ox||0);f.z=P.z+(f.oz||0);f.path=null;f.tp=1;f.act=null;return}
 f.home=1;f.px=P.x+(Math.random()-.5)*2;f.pz=P.z+.8+Math.random()*.6;if(z!='in'&&hit(f.px,f.pz,.25)){f.px=P.x;f.pz=P.z}f.x=f.px;f.z=f.pz;f.act=null}
function pre(){const z=zone();FOL.forEach(f=>{if(!f.pet)return;if(f.zn!==z){f.zn=z;place(f,z)}})}
/* ---------- pick what a pet at home does next ---------- */
const rnd=(a,b)=>a+Math.random()*(b-a);
function clearTo(f,tx,tz,m){const dx=tx-f.px,dz=tz-f.pz,d=Math.hypot(dx,dz);if(d<m+.1)return true;return fpClear(f.px,f.pz,tx-dx/d*m,tz-dz/d*m)}
function pick(f,z,items){
 const k=f.k,T=ST.T,B=bounds(z),taken=q=>FOL.some(o=>o!==f&&o.act&&o.act.item===q);
 const ofType=ts=>{for(const t of ts){const l=items.filter(q=>q.t==t&&!taken(q)&&clearTo(f,q.x,q.z,.6));if(l.length)return l[Math.random()*l.length|0]}};
 const mk=(pose,tx,tz,dur,item)=>({pose,tx,tz,dur,item,until:T+25,arr:0});
 const r=Math.random();
 if(f.tired>=2||r<.16){const q=ofType(SLEEP(k));if(q){f.tired=0;return mk('sleep',q.x,q.z,rnd(20,40),q)}}
 if(r<.42){const q=ofType(PREF(k));if(q){const eat=PETF[q.t][2]=='eat';return mk(eat?'eat':'play',q.x,q.z+(eat?.6:0),rnd(5,9),q)}}
 if(r<.6){const a=rnd(0,6.28),x=P.x+Math.cos(a)*1.6,zz=P.z+Math.sin(a)*1.6;if(x>B[0]&&x<B[1]&&zz>B[2]&&zz<B[3]&&!hit(x,zz,.3)&&fpClear(f.px,f.pz,x,zz))return mk('sit',x,zz,rnd(4,8))}
 for(let i=0;i<10;i++){const x=rnd(B[0],B[1]),zz=rnd(B[2],B[3]);if(!hit(x,zz,.3)&&fpClear(f.px,f.pz,x,zz)){f.tired=(f.tired||0)+1;
  if(f.tired>=3&&!BIRD(k)&&Math.random()<.5){f.tired=0;return mk('sleep',x,zz,rnd(14,26))}return mk('idle',x,zz,rnd(2,6))}}
 return mk('idle',f.px,f.pz,3)}
/* ---------- the home controller (replaces 22f petUse; follow code in 14 / 129 still runs outside) ---------- */
petUse=function(dt){
 const z=zone();if(z=='out')return;ST.T+=dt;
 const items=z=='in'?[]:PL.filter(q=>PETF[q.t]&&inZ(q,z));
 FOL.forEach((f,j)=>{if(!f.pet||!f.home)return;const g=f.m;
  if(z=='in'){g.visible=false;return}
  g.visible=true;if(f.px===undefined){f.px=f.x;f.pz=f.z}
  if(!f.act||ST.T>=f.act.until)f.act=pick(f,z,items);
  const a=f.act,dx=a.tx-f.px,dz=a.tz-f.pz,d=Math.hypot(dx,dz);let mv=0;
  if(!a.arr){if(d>.06){const st=Math.min(d,(a.pose=='idle'||a.pose=='sleep'?1.4:1.7)*dt);f.px+=dx/d*st;f.pz+=dz/d*st;mv=1;
    const ty=Math.atan2(dx,dz),df=((ty-g.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;g.rotation.y+=df*Math.min(1,dt*9)}
   else{a.arr=1;a.until=ST.T+a.dur}}
  const pose=mv||!a.arr?null:a.pose;let y=0;
  if(pose=='sleep'||pose=='eat'||pose=='play'){const t=a.item&&a.item.t;if(t=='cattree'||t=='perch')y=.95;else if(t=='petbed')y=.12;else if(t=='dogh')y=.05}
  g.userData.p2=pose;g.position.set(f.px,y,f.pz);g.scale.set(.7,.7,.7)})};
/* ---------- poses on top of the 58-pets animation ---------- */
const lerp=(a,b,t)=>a+(b-a)*t;
{const pa0=petAnim;petAnim=function(g,dt){pa0.apply(this,arguments);const r=g.userData.pr;if(!r)return;const w=g.userData.p2b||(g.userData.p2b={sl:0,ea:0,pl:0,si:0,li:0}),p=g.userData.p2,P=r.P,R=r.R,t=r.t,u=Math.min(1,dt*4);
  w.sl=lerp(w.sl,p=='sleep'?1:0,u);w.ea=lerp(w.ea,p=='eat'?1:0,u);w.pl=lerp(w.pl,p=='play'?1:0,u);w.si=lerp(w.si,p=='sit'?1:0,u);w.li=lerp(w.li,p=='lie'?1:0,u);
  const lie=Math.max(w.sl,w.li),bird=BIRD(r.k);
  if(lie>.01){R.position.y=lerp(R.position.y,bird?-.02:-.05,lie);R.scale.y=1-(bird?.1:.34)*lie;R.scale.x=R.scale.z=1+.08*lie;
   if(!bird)r.legs.forEach((l,i)=>{l.rotation.x=lerp(l.rotation.x,i<2?-1.2:1.2,lie)});
   if(P.head){P.head.rotation.x=lerp(P.head.rotation.x,bird?.6:.5,lie);P.head.rotation.z=lerp(P.head.rotation.z,.35,lie)}
   if(r.tails[0])r.tails[0].rotation.y=lerp(r.tails[0].rotation.y,1.2,lie);
   [P.ear0,P.ear1].forEach(e=>{if(e)e.rotation.x=lerp(e.rotation.x,.4,lie)})}
  else R.scale.set(1,1,1);
  if(w.sl>.01){if(P.eyes)P.eyes.scale.y=lerp(P.eyes.scale.y,.08,w.sl);if(P.body)P.body.scale.y+=Math.sin(t*1.8)*.05*w.sl;if(P.tongue)P.tongue.visible=false}
  if(w.ea>.01&&P.head){P.head.rotation.x=lerp(P.head.rotation.x,.75+Math.sin(t*10)*.14,w.ea);P.head.position.y-=.02*w.ea}
  if(w.pl>.01){R.position.y+=Math.abs(Math.sin(t*7))*.2*w.pl;R.rotation.z=Math.sin(t*7)*.14*w.pl;if(P.head)P.head.rotation.y+=Math.sin(t*5)*.4*w.pl}else R.rotation.z=0;
  if(w.si>.01&&!bird){R.rotation.x=lerp(R.rotation.x,-.3,w.si);R.position.y-=.04*w.si;if(P.head)P.head.rotation.x-=.2*w.si}}}
/* ---------- name tags, sleeping Zs, loafing when you stand still ---------- */
const tex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);return t};
function tagOf(f){const g=f.m;let T=g.userData.p2t;if(!T){
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(2,2,()=>{}),transparent:true,depthWrite:false})),zz=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(64,64,(c)=>{c.font='bold 40px monospace';c.fillStyle='#d6c8ff';c.strokeStyle='#241a44';c.lineWidth=6;c.strokeText('Z',20,44);c.fillText('Z',20,44)}),transparent:true,depthWrite:false}));
  sp.scale.set(1.5,.36,1);sp.position.set(0,1.3,0);zz.scale.set(.5,.5,1);zz.visible=false;g.add(sp,zz);T=g.userData.p2t={sp,zz,n:null}}
 const n=nm(f.k);if(T.n!==n){T.n=n;T.sp.material.map=tex(256,60,(c,W,H)=>{c.font='bold 30px monospace';c.textAlign='center';c.fillStyle='#000a';c.fillRect(0,6,W,H-12);c.strokeStyle='#2fe68a';c.lineWidth=3;c.strokeRect(1.5,7.5,W-3,H-15);c.fillStyle='#fff';c.fillText(n.slice(0,14),W/2,H/2+10)});T.sp.material.needsUpdate=true}return T}
function post(dt){
 const mv=Math.hypot(P.x-ST.lx,P.z-ST.lz);ST.lx=P.x;ST.lz=P.z;ST.still=mv>.002||mode!='play'?0:ST.still+dt;
 const z=zone();FOL.forEach(f=>{if(!f.pet||!f.m)return;const g=f.m,T=tagOf(f),near=g.visible&&mode=='play'&&Math.hypot(g.position.x-P.x,g.position.z-P.z)<6;T.sp.visible=near;
  if(z=='out')g.userData.p2=ST.still>14&&!BIRD(f.k)?'lie':null;
  const sl=g.userData.p2=='sleep';T.zz.visible=sl&&near;if(sl){const k=(ST.T*.5+f.k*.3)%1;T.zz.position.set(.25+k*.2,.7+k*.6,0);T.zz.material.opacity=1-k;T.zz.scale.setScalar(.35+k*.3)}})}
/* ---------- bodyguards stay outside your home ---------- */
{const fs0=flwSpot;flwSpot=function(f){if(!f.pet){const z=zone();if(z=='home'||z=='up')return wait(f)}return fs0.apply(this,arguments)}}
/* ---------- companions: rebuilt by syncF ---------- */
{const s0=syncF;syncF=function(){mig();const r=s0.apply(this,arguments);const z=zone();
  FOL.forEach((f,i)=>{if(i<S.pets.length){f.pet=1;f.k=S.pets[i];f.zn=null}else if(!f.pet&&(z=='home'||z=='up')){const s=wait(f);f.x=s[0];f.z=s[1];f.m.position.set(f.x,0,f.z)}});return r}}
/* ---------- equip, name, notification ---------- */
function note(k){const old=document.getElementById('pt2n');if(old)old.remove();const d=document.createElement('div');d.id='pt2n';d.className='pt2n';
 d.innerHTML=`<div><small>PET EQUIPPED</small><b>${esc(nm(k))}</b><span><i>Powerup: ${pk(k)[0]}</i> ${pk(k)[1]}</span></div>`;document.body.appendChild(d);setTimeout(()=>d.classList.add('x'),5200);setTimeout(()=>d.remove(),5800)}
function refresh(){if(mode=='menu'&&document.getElementById('pt2'))render();else if(mode=='pc')pcR()}
function eq(k){mig();if(!S.petOwn.includes(k))return;
 if(eqd(k)){S.pets=S.pets.filter(x=>x!=k);snd('pop');say(nm(k)+' is resting at home.')}
 else{if(S.pets.length>=MAX){snd('err');return say('All 3 slots are full. Unequip a pet first.')}S.pets.push(k);snd('ping')}
 syncF();if(eqd(k))note(k);refresh()}
function ren(k){ST.ren=k;refresh();setTimeout(()=>{const i=document.getElementById('pt2in');if(i){i.focus();i.select()}},30)}
function saveName(k){const i=document.getElementById('pt2in'),v=i?i.value.replace(/[<>&"]/g,'').trim().slice(0,14):'';if(v)S.petNames[k]=v;else delete S.petNames[k];ST.ren=null;snd('pop');refresh()}
function cancelName(){ST.ren=null;refresh()}
const nameBox=k=>ST.ren===k?`<div class=pt2-r><input id=pt2in maxlength=14 value="${esc(S.petNames[k]||'')}" placeholder="${esc(PETS[k][0])}" onkeydown="if(event.key=='Enter')FW_PETS.saveName(${k});else if(event.key=='Escape'){event.stopPropagation();FW_PETS.cancelName()}"><button class=go onclick="FW_PETS.saveName(${k})">Save</button></div>`
 :`<div class=pt2-n><b>${esc(nm(k))}</b><button class=pt2-pen title="Rename" onclick="FW_PETS.ren(${k})">Rename</button></div>`;
const perk=k=>`<span class=pt2-perk><b>${esc(pk(k)[0])}</b>${esc(pk(k)[1])}</span>`;
/* ---------- the P menu ---------- */
function render(){mig();const ui=document.getElementById('pt2');if(!ui)return;
 const slots=[0,1,2].map(i=>{const k=S.pets[i];return k==null?`<div class="pt2-slot e"><b>Empty slot ${i+1}</b><span>Equip a pet from below</span></div>`
  :`<div class="pt2-slot"><small>SLOT ${i+1}</small>${pvc('p:'+k,112)}${nameBox(k)}<span class=pt2-sp>${esc(PETS[k][0])}</span>${perk(k)}<button onclick="FW_PETS.eq(${k})">Unequip</button></div>`}).join('');
 const cards=S.petOwn.map(k=>`<div class="pt2-card${eqd(k)?' on':''}">${pvc('p:'+k,88)}${nameBox(k)}<span class=pt2-sp>${esc(PETS[k][0])}</span>${perk(k)}${eqd(k)?'<button onclick="FW_PETS.eq('+k+')">Unequip</button>':`<button class=go ${S.pets.length>=MAX?'disabled':''} onclick="FW_PETS.eq(${k})">${S.pets.length>=MAX?'Slots full':'Equip'}</button>`}</div>`).join('');
 const locked=PETS.map((c,k)=>k).filter(k=>!S.petOwn.includes(k)&&PETS[k][1]>0).map(k=>`<div class="pt2-card off">${pvc('p:'+k,72)}<b>${esc(PETS[k][0])}</b><span class=pt2-sp>${$$(PETS[k][1])} at the Pet Shop</span></div>`).join('');
 ui.innerHTML=`<div class=pt2-h><h2>Pets</h2><span class=pt2-c>${S.pets.length}/${MAX} equipped</span><button onclick="closeUI()" style="margin-left:auto">Close (P)</button></div>
 <p class=pt2-i>Pick up to ${MAX} pets. Equipped pets follow you around town, roam your home and each give you a small powerup. Pets you are not using wait at home.</p>
 <div class=pt2-slots>${slots}</div><h3>Your pets</h3>${cards?`<div class=pt2-grid>${cards}</div>`:'<p class=pt2-i>You have no pets yet. Book one on the computer (Pets page), then visit the Pet Shop.</p>'}
 ${locked?`<h3>Still to adopt</h3><div class="pt2-grid pt2-lk">${locked}</div>`:''}`}
function open(r){if(mode!='play'||document.getElementById('ui').innerHTML)return;mode='menu';ST.ren=r==null?null:r;$('ui').innerHTML='<div id=pt2 class="box modal gu wrd pt2"></div>';render();snd('pop');if(r!=null)setTimeout(()=>{const i=document.getElementById('pt2in');if(i)i.focus()},30)}
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.key.toLowerCase()!='p'||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;
 if(mode=='play')open();else if(mode=='menu'&&document.getElementById('pt2'))closeUI()});
/* ---------- buying: own them all, then name and equip ---------- */
{const bx0=buyX;buyX=function(t,i){if(t!='pet')return bx0.apply(this,arguments);mig();const c=PETS[i];if(!c)return;
  if(S.petOwn.includes(i))return say('You already have '+nm(i)+'.');if(S.money<c[1])return snd('err');
  S.money=+(S.money-c[1]).toFixed(2);S.petOwn.push(i);const e=S.pets.length<MAX;if(e)S.pets.push(i);syncF();try{updateVersion()}catch(x){}
  snd('cash');say('Adopted '+c[0]+'!'+(e?'':' Your 3 slots are full, so it waits at home.'));if(e)note(i);if(mode=='pc')pcR();else open(i)}}
/* ---------- the shop page (computer) ---------- */
PA.pets=function(){mig();return`<h1>Pets</h1><p class=m>Balance ${$$(S.money)}. Adopt them all, give each a name and equip ${MAX} at a time. In the world, press P to change who comes with you.</p>
 <div class="pt2-shop">${PETS.map((c,k)=>{if(!S.petOwn.includes(k)&&!(c[1]>0))return'';const own=S.petOwn.includes(k),bk=S.appt.some(a=>a.t=='pet'&&a.i===k);return`<div class="pt2-card${eqd(k)?' on':''}">${eqd(k)?'<small class=pt2-eq>EQUIPPED</small>':''}${pvc('p:'+k,150)}${own?nameBox(k):`<div class=pt2-n><b>${esc(c[0])}</b></div>`}${own?`<span class=pt2-sp>${esc(c[0])}</span>`:''}${perk(k)}
  ${own?(eqd(k)?`<button onclick="FW_PETS.eq(${k})">Unequip</button>`:`<button class=go ${S.pets.length>=MAX?'disabled':''} onclick="FW_PETS.eq(${k})">${S.pets.length>=MAX?'Slots full (unequip one)':'Equip'}</button>`)
  :bk?'<button disabled>Booked: visit the Pet Shop</button>':`<button class=go ${S.money<c[1]?'disabled':''} onclick="book('pet',${k})">Book · ${$$(c[1])}</button>`}</div>`}).join('')}</div>`};
/* the bodyguard page keeps its own companion card but loses the pets half */
{const g0=PA.guard;PA.guard=function(){const h=String(g0.apply(this,arguments));let c='';try{c=comp()}catch(e){}if(!c||h.indexOf(c)<0)return h;
  return h.replace(c,`<div class=card style="margin:14px 0"><b>Bodyguards</b><p class=m>${gsTxt()} (${S.guards} hired). They wait outside when you go into your home.</p><button ${S.guards&&S.gs=='follow'?'':'disabled'} onclick="gsSet('away')">Dismiss</button> <button class=go ${S.guards&&S.gs=='away'?'':'disabled'} onclick="gsSet('returning')">Call back</button></div>`)}}
/* pause menu: a Pets button for touch players */
{const p0=pauseUI;pauseUI=function(){const r=p0.apply(this,arguments);try{const m=document.getElementById('pzm');if(m&&!m.querySelector('.pt2btn')){const b=document.createElement('button');b.className='pt2btn';b.textContent='Pets';b.onclick=()=>{resumeGame();open()};m.appendChild(b)}}catch(e){}return r}}
/* ---------- look ---------- */
const st=document.createElement('style');st.textContent=`
.pt2{--pa:#2fe68a;width:min(1000px,96vw);max-height:92vh;overflow:auto;display:flex;flex-direction:column;gap:12px}
.pt2-shop{--pa:#2fe68a;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;margin:12px 0}
.pt2-h{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.pt2-h h2{margin:0}
.pt2-c{border:2px solid var(--pa);color:var(--pa);padding:3px 10px;font:700 13px Silkscreen,monospace}
.pt2-i{margin:0;color:#9a9a9a;font-size:13px;line-height:1.45}.pt2 h3{margin:6px 0 0;font:700 14px Silkscreen,monospace;color:#f2f2f2;letter-spacing:1px}
.pt2-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.pt2-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.pt2-slot,.pt2-card{position:relative;background:#0f0f0f;border:2px solid #2e2e2e;padding:12px;display:flex;flex-direction:column;gap:7px;text-align:center;min-width:0;color:#f2f2f2}
.pt2-slot{border-color:var(--pa);box-shadow:4px 4px 0 #1a8a52}.pt2-slot small{color:var(--pa);font:700 11px Silkscreen,monospace;letter-spacing:1px}
.pt2-slot.e{border:2px dashed #3a3a3a;box-shadow:none;justify-content:center;align-items:center;color:#6a6a6a;min-height:230px}.pt2-slot.e b{color:#8a8a8a}
.pt2-card.on{border-color:var(--pa)}.pt2-card.off{opacity:.55;padding:8px}.pt2-lk{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.pt2 canvas.pv,.pt2-shop canvas.pv{margin:0 auto}
.pt2-n{display:flex;align-items:center;justify-content:center;gap:8px;min-width:0}.pt2-n b{font:700 16px Silkscreen,monospace;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pt2-pen{padding:2px 7px!important;font-size:11px!important}
.pt2-r{display:flex;gap:6px}.pt2-r input{flex:1;min-width:0;padding:6px 8px;font:700 14px Silkscreen,monospace}
.pt2-sp{font-size:11px;color:#8a8a8a}
.pt2-perk{display:block;text-align:left;border-left:3px solid var(--pa);background:#141b17;padding:6px 8px;font-size:12px;line-height:1.35;color:#d4e8dc}.pt2-perk b{display:block;color:var(--pa);font:700 12px Silkscreen,monospace;margin-bottom:2px}
.pt2-eq{position:absolute;top:8px;left:8px;background:var(--pa);color:#04120a;padding:2px 6px;font:700 10px Silkscreen,monospace}
.pt2 button,.pt2-shop button{cursor:pointer}
.pt2n{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:90;display:flex;gap:12px;align-items:center;background:#000;border:2px solid #2fe68a;box-shadow:5px 5px 0 #1a8a52;padding:10px 14px;color:#f2f2f2;max-width:min(440px,92vw);animation:pt2in .35s ease-out;transition:opacity .5s}
.pt2n.x{opacity:0}.pt2n small{display:block;color:#2fe68a;font:700 10px Silkscreen,monospace;letter-spacing:1px}.pt2n b{display:block;font:700 16px Silkscreen,monospace}.pt2n span{display:block;font-size:12px;line-height:1.35;color:#cfd8d3}.pt2n i{font-style:normal;color:#2fe68a;font-weight:700}
@keyframes pt2in{from{transform:translate(-50%,24px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
@media(max-width:640px){.pt2-slots{gap:6px}.pt2-slot{padding:6px}.pt2-slot canvas.pv{width:72px!important;height:72px!important}.pt2-perk{font-size:11px}}`;
document.head.appendChild(st);
window.FW_PETS={eq,ren,saveName,cancelName,open,zone,state:ST};
})();
