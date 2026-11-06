/* ===== v49.89.0: Friends hub. A friends icon in the top left of the main menu opens a panel with your friends in alphabetical order, Online and Offline.
   Tap a friend's mini profile to see their profile or nudge them to play. Your own profile gets a Notifications section with friend requests,
   band invites and nudges, each with Accept / Deny. Nudges are limited to one per friend per hour (checked here and in the database rules):
     k/TO/FROM = nudge {nm,t} (the person nudged reads and clears it) · kc/FROM/TO = time you last nudged that friend (1 hour between nudges) ===== */
(function(){
const HOUR=3600000,X=()=>window.FRX&&window.FRX.FR,FH={open:0,sel:'',K:{},sub:0,msg:''};
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const okU=u=>/^[A-Za-z0-9_-]{6,128}$/.test(String(u||''));
const F2=['..##..##..','.####.####','.#########','.#########','..#######.','...#####..','....###...','.....#....'];
const ICON='<svg viewBox="0 0 10 8" width="22" height="18" shape-rendering="crispEdges" fill="currentColor">'+F2.map((r,y)=>[...r].map((c,x)=>c=='#'?`<rect x="${x}" y="${y}" width="1" height="1"/>`:'').join('')).join('')+'</svg>';
const nm=f=>{const F=X(),p=F&&F.P[f];return p&&p.h?p.h:'friend'};
const cdKey=f=>'fw_nudge_'+((X()||{}).me||'')+'_'+f;
const lastN=f=>{try{return+localStorage.getItem(cdKey(f))||0}catch(e){return 0}};
const wait=f=>Math.max(0,lastN(f)+HOUR-Date.now());
const mins=ms=>Math.ceil(ms/60000)+' min';
/* ---- nudges ---- */
function sub(){const F=X();if(FH.sub||!F||!F.r||!F.h)return;FH.sub=1;const{R,db,uid}=F.r;
 R.onValue(R.ref(db,'f/k/'+uid),s=>{const v=s.val()||{},now=Date.now();let first=!FH.kd;
  for(const k in v){if(!okU(k)||!v[k]||now-(+v[k].t||0)>86400000){try{R.remove(R.ref(db,'f/k/'+uid+'/'+k))}catch(e){}delete v[k]}}
  if(FH.kd)for(const k in v)if(!FH.K[k]||FH.K[k].t!==v[k].t){try{snd('ping');say((v[k].nm||'A friend')+' nudged you to play together.')}catch(e){}}
  FH.kd=1;FH.K=v;draw();notif()},()=>{})}
window.fhNudge=f=>{const F=X();if(!F||!F.r||!okU(f))return;const w=wait(f);if(w>0){FH.msg='You can nudge @'+nm(f)+' again in '+mins(w)+'.';try{snd('err')}catch(e){}return draw()}
 const{R,db,uid}=F.r,ts=R.serverTimestamp();
 R.update(R.ref(db),{['f/k/'+f+'/'+uid]:{nm:'@'+F.h,t:ts},['f/kc/'+uid+'/'+f]:ts}).then(()=>{try{localStorage.setItem(cdKey(f),String(Date.now()))}catch(e){}FH.msg='Nudged @'+nm(f)+'. They will get a notification.';try{snd('pop')}catch(e){}draw()})
 .catch(()=>{try{localStorage.setItem(cdKey(f),String(Date.now()))}catch(e){}FH.msg='You nudged @'+nm(f)+' recently. Try again in about an hour.';try{snd('err')}catch(e){}draw()})};
window.fhClearK=f=>{const F=X();if(!F||!F.r||!okU(f))return;F.r.R.remove(F.r.R.ref(F.r.db,'f/k/'+F.r.uid+'/'+f)).catch(()=>{})};
/* ---- notifications on your profile ---- */
function items(){const F=X();if(!F)return[];const a=[];
 for(const f in F.Q)if(okU(f)&&F.Q[f]&&F.Q[f].h)a.push({t:'q',f,n:'@'+F.Q[f].h,s:'sent you a friend request',at:+F.Q[f].t||0});
 for(const f in F.I){const v=F.I[f];if(okU(f)&&v&&Date.now()-(+v.t||0)<600000)a.push({t:'i',f,n:v.nm||'A friend',s:'invited you to the band '+(v.b||''),c:v.c,at:+v.t||0})}
 for(const f in FH.K){const v=FH.K[f];if(okU(f)&&v)a.push({t:'k',f,n:v.nm||'A friend',s:'nudged you to play together',at:+v.t||0})}
 return a.sort((x,y)=>y.at-x.at)}
function nHtml(){const a=items();
 return'<h3>NOTIFICATIONS'+(a.length?' ('+a.length+')':'')+'</h3>'+(a.length?a.map(i=>`<div class=fhrow><div><b>${E(i.n)}</b><small>${E(i.s)}</small></div>`+
  (i.t=='q'?`<button class=go onclick="fhAct('qa','${i.f}')">Accept</button><button onclick="fhAct('qd','${i.f}')">Deny</button>`:i.t=='i'?`<button class=go onclick="fhAct('ia','${i.f}')">Accept</button><button onclick="fhAct('id','${i.f}')">Deny</button>`:`<button onclick="fhAct('kd','${i.f}')">Dismiss</button>`)+'</div>').join(''):'<p class=fhe>Nothing new. Friend requests, band invites and nudges show up here.</p>')}
window.fhAct=(k,f)=>{const F=X();if(!F||!F.r||!okU(f))return;const{R,db,uid}=F.r;
 if(k=='qa')frAcc(f);else if(k=='qd')frDec(f);else if(k=='kd')fhClearK(f);
 else if(k=='id')R.remove(R.ref(db,'f/i/'+uid+'/'+f)).catch(()=>{});
 else if(k=='ia'){const v=F.I[f];if(v&&v.c){R.remove(R.ref(db,'f/i/'+uid+'/'+f)).catch(()=>{});frGo(v.c)}}
 setTimeout(()=>{notif();draw()},250)};
function notif(){document.querySelectorAll('.fhn').forEach(e=>{e.innerHTML=nHtml()});const n=items().length;document.querySelectorAll('.fhbadge').forEach(b=>{b.textContent=n?String(n):'';b.style.display=n?'':'none'})}
function inject(){const c=document.querySelector('#pfx .fwpc');if(!c||c.querySelector('.fhn')||!c.querySelector('[data-pf=edit]'))return;
 const d=document.createElement('div');d.className='pf-sec fhn';d.innerHTML=nHtml();const at=c.querySelector('.pf-priv')||c.querySelector('.pf-acts');at?at.parentNode.insertBefore(d,at):c.appendChild(d)}
/* ---- the Friends panel ---- */
window.fhOpen=()=>{if(typeof needLogin=='function'&&needLogin())return;try{snd('click')}catch(e){}FH.open=1;FH.sel='';FH.msg='';try{frStart()}catch(e){}draw()};
window.fhClose=()=>{FH.open=0;const d=document.getElementById('fhub');if(d)d.remove()};
window.fhSel=f=>{FH.sel=FH.sel==f?'':f;FH.msg='';draw()};
function row(f){const F=X(),p=F.P[f]||{},on=!!p.o,sel=FH.sel==f,w=wait(f),h=p.h||'friend';
 let r=`<div class="fhf${sel?' sel':''}" onclick="fhSel('${f}')"><i class="fhav ${on?'on':''}">${E(h[0]||'?').toUpperCase()}</i><div><b>@${E(h)}</b><small>${on?(p.rm?'In a band room':'Online'):'Offline'}${p.nm?' · '+E(p.nm):''}</small></div></div>`;
 if(sel)r+=`<div class=fhcard><button onclick="fwProfileOpen('${E(h)}')">Profile</button><button class=go ${w?'disabled':''} onclick="fhNudge('${f}')">${w?'Nudged ('+mins(w)+')':'Nudge to play'}</button>${on&&p.rm&&!(typeof MPS!='undefined'&&MPS&&MPS.code===p.rm)?`<button onclick="frJoin('${f}')">Join band</button>`:''}</div>`;
 return r}
function draw(){if(!FH.open)return;const F=X();let h='<h2>Friends</h2>';
 if(!F||!F.ok)h+='<p class=fhe>Connecting…</p>';else if(!F.h)h+='<p class=fhe>Pick a username first so friends can find you.</p><button class=go onclick="fhClose();frOpen()">Choose username</button>';
 else{const L=Object.keys(F.L).filter(okU).sort((a,b)=>nm(a).localeCompare(nm(b))),on=L.filter(f=>(F.P[f]||{}).o),off=L.filter(f=>!(F.P[f]||{}).o);
  h+=`<h3>ONLINE (${on.length})</h3>`+(on.map(row).join('')||'<p class=fhe>Nobody online right now.</p>')+`<h3>OFFLINE (${off.length})</h3>`+(off.map(row).join('')||'<p class=fhe>No offline friends.</p>');
  if(!L.length)h+='<p class=fhe>No friends yet. Add one by username.</p>';
  h+='<div class=fhr><button onclick="fhClose();frOpen()">Add or manage friends</button></div>';
  h+='<p class=fhe>Tap a friend to nudge them. One nudge per friend per hour.</p>'}
 if(FH.msg)h+=`<p class=fhm>${E(FH.msg)}</p>`;h+='<button onclick="fhClose()">Close</button>';
 let d=document.getElementById('fhub');if(!d){d=document.createElement('div');d.id='fhub';d.onclick=e=>{if(e.target===d)fhClose()};document.body.appendChild(d)}
 const sc=d.firstElementChild?d.firstElementChild.scrollTop:0;d.innerHTML='<div class="box modal fhw">'+h+'</div>';d.firstElementChild.scrollTop=sc}
addEventListener('keydown',e=>{if(e.key=='Escape'&&FH.open){e.stopImmediatePropagation();fhClose()}},true);
/* ---- main menu icon (top left) ---- */
function menuIcon(){const t=document.getElementById('ttl');if(!t||t.querySelector('.fhic')||typeof FBU=='undefined'||!FBU)return;
 const b=document.createElement('button');b.type='button';b.className='fhic';b.title='Friends';b.setAttribute('aria-label','Open friends');b.innerHTML=ICON+'<span class=fhbadge style="display:none"></span>';b.onclick=fhOpen;t.insertBefore(b,t.firstChild);notif()}
try{const t0=titleUI;titleUI=function(){const r=t0.apply(this,arguments);try{menuIcon()}catch(e){}return r}}catch(e){}
new MutationObserver(()=>{try{menuIcon();inject()}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true});
setInterval(()=>{try{sub();notif();if(FH.open)draw()}catch(e){}},3000);
{const s=document.createElement('style');s.textContent=`#ttl .fhic{position:fixed;top:12px;left:12px;width:44px;height:44px;padding:0;display:flex;align-items:center;justify-content:center;background:#0b0f0dd9;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e;color:var(--g);cursor:pointer}
#ttl .fhic:hover{box-shadow:inset 0 0 0 2px var(--g)}.fhbadge{position:absolute;top:-8px;right:-8px;min-width:18px;padding:1px 4px;background:#e0453a;color:#fff;border:2px solid #000;font-size:11px;line-height:14px;text-align:center}
#fhub{position:fixed;inset:0;z-index:9991;display:flex;align-items:center;justify-content:center;background:#000a;padding:12px}
#fhub .fhw{width:min(440px,94vw);max-height:88vh;overflow:auto;display:flex;flex-direction:column;gap:8px}#fhub h2{color:var(--g)}#fhub h3,.fhn h3{margin:8px 0 2px;font-size:14px}
.fhf{display:flex;align-items:center;gap:10px;background:#0b0f0dd9;border:3px solid #000;padding:8px;cursor:pointer}.fhf.sel,.fhf:hover{border-color:var(--g)}.fhf>div{flex:1;min-width:0;display:flex;flex-direction:column}
.fhf b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fhf small,.fhrow small,.fhe{color:var(--m)}.fhe{font-size:12px;margin:2px 0}.fhm{color:var(--g);font-size:13px;margin:0}
.fhav{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:700;background:#2a352e;border:3px solid #000;color:#8aa094}.fhav.on{background:var(--g);color:#000}
.fhcard,.fhr{display:flex;gap:6px;flex-wrap:wrap;padding:6px;background:#0b0f0d;border:3px solid #000;margin-top:-6px}.fhr{background:none;border:0;margin:0;padding:0}.fhcard button,.fhr button{flex:1;padding:7px 9px;font-size:12px}
.fhrow{display:flex;align-items:center;gap:6px;background:#0b0f0dd9;border:3px solid #000;padding:8px;margin-top:6px}.fhrow>div{flex:1;min-width:0;display:flex;flex-direction:column}.fhrow button{padding:6px 9px;font-size:12px}`;document.head.appendChild(s)}
})();
