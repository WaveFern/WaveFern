/* ---------- v26.83: optional Google sign-in (Firebase Auth), v26.84: cloud saves ----------
   Config is the waveferngame web app from the Firebase console (Project settings > Your apps).
   If apiKey is ever set back to a PASTE_ placeholder, nothing loads and no sign-in button shows.
   Sign-in is optional: saves stay in this browser (fw_save_1 / fw_save_2) exactly as before. */
const FB_CFG={
 apiKey:'AIzaSyCd1y8e0G6dKn4h4OuUzksePKufyltmvlo',
 authDomain:'waveferngame.firebaseapp.com',
 projectId:'waveferngame',
 storageBucket:'waveferngame.firebasestorage.app',
 messagingSenderId:'696041816952',
 appId:'1:696041816952:web:d3ce1fbc7a33e36f8ebe8d',
 measurementId:'G-4PMWS9D7BV'
};
const FB_V='10.12.2',FB_ON=!/^PASTE_/.test(FB_CFG.apiKey);
let FBU=null,FBA=null,FBM=null,FBD=null,FBF=null;
function fbLoad(){if(!FB_ON)return Promise.reject('off');if(FBA)return Promise.resolve();
 const u='https://www.gstatic.com/firebasejs/'+FB_V+'/firebase-';
 return Promise.all([import(u+'app.js'),import(u+'auth.js'),import(u+'firestore.js')]).then(([a,m,f])=>{const app=a.initializeApp(FB_CFG);FBM=m;FBF=f;FBA=m.getAuth(app);FBD=f.getFirestore(app);
  m.onAuthStateChanged(FBA,usr=>{if(csAcct(usr))return;FBU=usr;CLD.ok=0;CLD.last='';if(usr&&!CLD.signing)csCheck();fbRedraw()});
  return m.getRedirectResult(FBA).then(r=>{if(r&&r.user)fbSignedIn(r.user)},()=>{}).finally(()=>{if(CLD.signing&&!wiping){CLD.signing=0;try{sessionStorage.removeItem('fw_signing')}catch(e){}if(FBU)csCheck()}})})}
/* v42.7.3: signing in to an account (or out) reloads into that account's own careers on this device, so one account's
   cloud save never lands on another account's or a guest's career. The first time after this update, careers this device
   already synced with the signed-in account move into its slots. */
const CS_KEY=SAVE_PRE+'cloud';
function csAcct(usr){const id=usr?usr.uid:'';if(id==FW_ACCT)return false;autoSave();
 try{if(id){const p='fw_u_'+id+'_';let m={};try{m=JSON.parse(localStorage.getItem('fw_cloud'))||{}}catch(e){}
   if(!FW_ACCT&&m.uid==id&&!localStorage.getItem(p+'save_1')&&!localStorage.getItem(p+'save_2')){
    for(let n=1;n<=SLOTS;n++){const c=localStorage.getItem('fw_save_'+n);if(c){localStorage.setItem(p+'save_'+n,c);localStorage.removeItem('fw_save_'+n)}}
    const s=localStorage.getItem('fw_slot');if(s)localStorage.setItem(p+'slot',s);localStorage.setItem(p+'cloud',JSON.stringify(m));localStorage.removeItem('fw_cloud')}
   localStorage.setItem('fw_acct',id);localStorage.setItem('fw_acctnm',String(usr.displayName||usr.email||'').split(' ')[0].slice(0,16));sessionStorage.setItem('fw_msg','Signed in as '+(usr.displayName||usr.email||'Google user'))}
  else{localStorage.removeItem('fw_acct');sessionStorage.setItem('fw_msg','Signed out. These are the careers on this device without an account.')}}catch(e){return false}
 wiping=true;try{sessionStorage.removeItem('fw_signing')}catch(e){}location.reload();return true}
function csGuestCode(){try{const s=+localStorage.getItem('fw_slot')==2?2:1;return localStorage.getItem('fw_save_'+s)||localStorage.getItem('fw_save_'+(3-s))}catch(e){return null}}
/* v26.115: an account that has played before just loads its cloud save. A brand new account (no cloud save) on a device with a game
   asks: start a new career or keep the current one (either way the chosen save is then saved to the account). */
function fbSignedIn(u){CLD.signing=0;try{sessionStorage.removeItem('fw_signing')}catch(e){}csCheck()}
function csAsk(){const uid=FBU&&FBU.uid;if(!uid)return;if(!CLD.asking){CLD.asking=1;CLD.pre=mode}let a='';try{a=scDecode(csGuestCode()).S.artist||''}catch(e){}
 $('ui').innerHTML=`<div class="box modal" style="width:min(420px,92vw)"><h2>☁ New Google account</h2><p>This Google account has no career yet. Bring your career from this device${a?' ('+esc(a)+')':''} into it, or start a new one?</p><p class=m><small>Bringing it copies it: the original stays on this device for when you play signed out.</small></p><div class=row2><button class=go onclick="csPick(1)">Bring my career</button><button onclick="csPick(2)">Start a new career</button></div></div>`}
function csPick(k){const uid=FBU&&FBU.uid;if(!uid)return;snd('click');CLD.asking=0;
 if(k==2){csSetMark(0);try{localStorage.setItem(CS_KEY,JSON.stringify({uid,t:0,fresh:1}))}catch(e){}CLD.ok=1;fbSignInBack();return fbRedraw()}
 const c=csGuestCode();if(!c){CLD.ok=1;fbSignInBack();return fbRedraw()}
 wiping=true;try{localStorage.setItem(slotKey(),c);localStorage.setItem(CS_KEY,JSON.stringify({uid,t:0}));sessionStorage.setItem('fw_go','1');sessionStorage.setItem('fw_msg','☁ Your career is now on your Google account')}catch(e){wiping=false;return say('No room to copy your career.')}
 location.reload()}
function csWipe(uid,msg){if(!bakKeep(localStorage.getItem(slotKey()),'Kept before a new career started'))return;wiping=true;try{localStorage.removeItem(slotKey());localStorage.setItem(CS_KEY,JSON.stringify({uid,t:0}));if(msg)sessionStorage.setItem('fw_msg',msg)}catch(e){}location.reload()}
const csSetMarkFor=(uid,t)=>{CLD.t=t;try{localStorage.setItem(CS_KEY,JSON.stringify({uid,t}))}catch(e){}};
function fbSignIn(){snd('click');CLD.signing=1;fbLoad().then(()=>{const p=new FBM.GoogleAuthProvider();
 return FBM.signInWithPopup(FBA,p).then(r=>fbSignedIn(r.user),e=>{
  if(e&&(e.code=='auth/popup-blocked'||e.code=='auth/operation-not-supported-in-this-environment')){try{sessionStorage.setItem('fw_signing','1')}catch(x){}return FBM.signInWithRedirect(FBA,p)}
  CLD.signing=0;if(e&&(e.code=='auth/popup-closed-by-user'||e.code=='auth/cancelled-popup-request'))return;
  throw e})}).catch(e=>{CLD.signing=0;snd('err');say(e&&e.code=='auth/unauthorized-domain'?'Sign-in is not allowed on this website yet.':'Could not sign in. Try again.')})}
/* v26.85: in-game notice before Google sign-in: back up the save code first, since a cloud save can replace it */
function fbSignInAsk(){snd('click');const prev=mode,fresh=prev=='creator'||(prev=='title'&&!TT.game);CLD.pre=prev;
 $('ui').innerHTML=`<div id=fbq class="box modal" style="width:min(420px,92vw)"><h2>🔑 Before you sign in</h2><p>${fresh?'Have a save code from another device? Keep a copy somewhere safe before you sign in.':'You may need your save code, so copy it and keep it somewhere safe before you sign in.'}</p><p class=m><small>Each Google account has its own careers. Signing in shows that account's careers, and signing out brings back the ones on this device, so nothing is replaced. A brand new account can bring your current career with it.</small></p>${fresh?'':`<textarea id=fbsc rows=3 readonly style="width:100%;display:none"></textarea><button onclick="fbCopy()">📋 Copy save code</button>`}<div class=row2><button class=go onclick="fbSignInGo()">Continue to Google</button><button onclick="fbSignInBack()">Cancel</button></div></div>`}
function fbCopy(){const t=$('fbsc');t.value=saveCode();t.style.display='block';t.select();try{navigator.clipboard.writeText(t.value).then(()=>say('Save code copied'),()=>say('Copy the code from the box'))}catch(e){say('Copy the code from the box')}}
function fbSignInBack(){const prev=CLD.pre;CLD.pre=null;if(prev=='title'){mode='title';titleUI()}else if(prev=='creator'){mode='creator';creatorUI()}else if(prev=='pause'){mode='pause';pauseUI()}else closeUI()}
function fbSignInGo(){fbSignInBack();fbSignIn()}
function fbSignOut(){if(!FBA)return;snd('click');csPush(1).finally(()=>FBM.signOut(FBA))}
function fbRedraw(){if(mode=='pause')pauseUI();else if(mode=='title'&&document.getElementById('ttl'))titleUI()}

/* v26.84: cloud saves. Signed-in players keep one save in Firestore at saves/{uid} = {code, day, artist, t}.
   The rules in docs/firestore.rules let each player read and write only their own save.
   v26.87: the cloud save always wins. fw_cloud remembers which cloud save (uid + t) this device last wrote or loaded:
   if the cloud is still that one, this device has the newest game and uploads it; otherwise the cloud save is loaded. */
const CLD={ok:0,last:'',t:0,err:'',busy:0,signing:(()=>{try{return sessionStorage.getItem('fw_signing')?1:0}catch(e){return 0}})()};
const csMark=()=>{try{return JSON.parse(localStorage.getItem(CS_KEY))||{}}catch(e){return{}}};
const csSetMark=t=>{CLD.t=t;try{localStorage.setItem(CS_KEY,JSON.stringify({uid:FBU.uid,t}))}catch(e){}};
const csRef=()=>FBF.doc(FBD,'saves',FBU.uid);
const csGame=()=>mode=='title'?!!TT.game:mode!='creator';
const csReady=()=>!document.getElementById('load')&&['title','play','pause'].includes(mode)&&!document.getElementById('fbq');
function csFail(e){CLD.err=e&&e.code=='permission-denied'?'Cloud saves are not set up yet.':'Cloud save is offline. Your game still saves on this device.';fbRedraw()}
function csCheck(){const uid=FBU&&FBU.uid;if(!uid)return;
 if(!csReady()&&mode!='creator')return setTimeout(()=>{if(FBU&&FBU.uid==uid&&!CLD.ok)csCheck()},700);
 if(CLD.asking)return;
 CLD.err='';FBF.getDoc(csRef()).then(d=>{if(!FBU||FBU.uid!=uid)return;
  if(!d.exists()){if(!csGame()&&!csMark().fresh&&!slotInfo(1)&&!slotInfo(2)&&csGuestCode())return csAsk();CLD.ok=1;CLD.t=0;fbRedraw();return csPush(1)}
  const c=d.data(),m=csMark();
  if(!csGame()&&m.uid==uid&&m.fresh){CLD.ok=1;CLD.t=c.t;return fbRedraw()}
  if(csGame()&&m.uid==uid&&m.t==c.t){CLD.ok=1;CLD.t=c.t;fbRedraw();return csPush()}
  if(csGame()&&c.code==saveCode()){CLD.ok=1;CLD.last=c.code;csSetMark(c.t);return fbRedraw()}
  if(csGame()&&csAhead(saveCode(),c.code)){CLD.ok=1;CLD.t=c.t;fbRedraw();return csPush(1)}
  csLoad(c)}).catch(csFail)}
/* b is the same career as a and at least as far along, so replacing a with b loses nothing */
function csCovers(a,b){if(!a||a==b)return true;try{const x=scDecode(a).S,y=scDecode(b).S;return x.artist==y.artist&&(y.day||0)>=(x.day||0)}catch(e){return false}}
function csAhead(a,b){try{const x=scDecode(a).S,y=scDecode(b).S;return x.artist==y.artist&&(x.day||0)>(y.day||0)}catch(e){return false}}
function csLoad(c){const uid=FBU&&FBU.uid;if(!csReady())return setTimeout(()=>{if(FBU&&FBU.uid==uid)csLoad(c)},700);
 let cur=null;try{cur=csGame()?saveCode():localStorage.getItem(slotKey())}catch(e){}
 if(cur&&!csCovers(cur,c.code)&&!bakKeep(cur,'Kept before your cloud save loaded')){CLD.err='No room to back up this career, so the cloud save was not loaded.';return fbRedraw()}
 if(mode=='pause')resumeGame();loadCode(c.code);if(!FBU)return;CLD.ok=1;CLD.last=c.code;csSetMark(c.t);autoSave();say('☁ Loaded your cloud save (Day '+c.day+')');fbRedraw()}
function csPush(force){if(!FBU||!CLD.ok||CLD.busy||!FBF||['creator','load'].includes(mode)||(mode=='title'&&!TT.game)||wiping)return Promise.resolve();
 const code=saveCode();if(code==CLD.last&&!force)return Promise.resolve();if(code.length>1e6){CLD.err='Your save is too big for the cloud.';return Promise.resolve()}
 const t=Date.now(),uid=FBU.uid;CLD.busy=1;
 /* only write over the cloud save this device last saw; if another device saved since, load that one instead */
 return FBF.getDoc(csRef()).then(d=>{if(!FBU||FBU.uid!=uid)return;const c=d.exists()?d.data():null;
  if(c&&c.t!=CLD.t){CLD.ok=0;csLoad(c);return}
  if(c&&![1,2].some(n=>csCovers(c.code,localStorage.getItem(slotKey(n))||''))&&!csCovers(c.code,code)&&!bakKeep(c.code,'Cloud save kept before it was replaced')){CLD.err='No room to back up your cloud save, so it was not replaced.';return}
  csSetMark(t);return FBF.setDoc(csRef(),{code,day:S.day,artist:S.artist||'',t}).then(()=>{CLD.last=code;CLD.err='';return 1})}).catch(csFail).finally(()=>{CLD.busy=0})}
setInterval(()=>csPush(),90000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)csPush()});
addEventListener('pagehide',()=>csPush());
if(FB_ON)fbLoad().catch(()=>{});

/* v26.87: main menu shown when the site opens: Play, Settings, Google sign-in, profile in the top right.
   The world stays paused behind it; Save & quit in the pause menu comes back here. */
const TT={on:0,game:0};
function titleMsg(){try{const m=sessionStorage.getItem('fw_msg');if(m){sessionStorage.removeItem('fw_msg');say(m)}}catch(e){}}
function titleOpen(){titleMsg();TT.on=1;mode='title';PAUSED=1;for(const k in keys)delete keys[k];MU.hold=1;try{const a=MU.a[MU.cur];if(MU.pl&&a)a.pause()}catch(e){}pauseOverlay(1);menuMusic(1);titleUI()}
function titleUI(){if(!TT.on)return;const busy=FBU&&!CLD.ok&&!CLD.err,nm=FBU?(FBU.displayName||FBU.email||'Google user'):'';
 const pf=FBU?`<div class=ttpf>${FBU.photoURL?`<img src="${esc(FBU.photoURL)}" referrerpolicy=no-referrer alt="">`:`<i>${esc(nm[0]||'?').toUpperCase()}</i>`}<span><b>${esc(nm)}</b><small>${esc(CLD.err||(CLD.ok?'Cloud save on':'Loading…'))}</small></span><button onclick="fbSignOut()">Sign out</button></div>`:`<div class=ttpf><span><b>Guest</b><small>Saves on this device</small></span></div>`;
 $('ui').innerHTML=`<div id=ttl>${FB_ON?pf:''}<div class=ttm><h1>WAVEFERN<br>RECORDS</h1><div class=px>Music Career Sim</div><div class=ttbx>
  <button class=go onclick="ttWorlds()" ${busy?'disabled':''}>${busy?'Loading your save…':'Play'}</button>
  <button onclick="ttSet()">Settings</button>${FB_ON&&!FBU?`<button onclick="fbSignInAsk()">Sign in with Google</button><p class=m><small>Sign in to keep your game in the cloud and play on any device.</small></p>`:''}</div></div><div class=ttft>${typeof GAME_VERSION!='undefined'?GAME_VERSION+' · ':''}Fictional game · Made with Three.js</div></div>`}
function ttPlay(){if(FBU&&!CLD.ok&&!CLD.err)return;snd('click');TT.on=0;TT.sel=0;pauseOverlay(0);menuMusic(0);PAUSED=0;PS='';MU.hold=0;try{const a=MU.a[MU.cur];if(MU.pl&&a&&a.paused)a.play().catch(()=>{})}catch(e){}
 if(TT.game){mode='play';$('ui').innerHTML=''}else{mode='creator';creatorUI()}}
/* v26.125: career select (two slots, Minecraft style). Switching slot reloads the page into the chosen career so no state leaks between them.
   Cloud save stays one doc per account and follows the active career. */
function ttWorlds(){if(FBU&&!CLD.ok&&!CLD.err)return;snd('click');TT.sel=1;const a=curSlot(),rows=[],free=[];
 for(let n=1;n<=SLOTS;n++){const i=n==a?(TT.game?{artist:S.artist||'',day:S.day||0}:null):slotInfo(n);if(!i)free.push(n);
  rows.push(i?`<div class="ttsl${n==a?' on':''}" data-slot=${n}><div><b>${esc(i.artist||'Unnamed artist')}</b><small>Career ${n} · Day ${i.day||1}${n==a?' · last played':''}</small></div><button class=go onclick="ttSlot(${n})">Play</button><button class=ttdel title="Delete this career" aria-label="Delete career ${n}" onclick="ttDel(${n})">✕</button></div>`
   :`<div class="ttsl empty" data-slot=${n}><div><b>Empty slot</b><small>Career ${n}</small></div></div>`)}
 const rec=[];for(let n=1;n<=BK_MAX;n++){try{const b=localStorage.getItem('fw_bak_'+n);if(b){let nm='';try{nm=scDecode(b).S.artist||''}catch(e){}rec.push(`<div class="ttsl ttbk" draggable=true data-bak=${n}><div><b>${esc(nm||'Recovered career')}</b><small>${esc(localStorage.getItem('fw_bakw_'+n)||'Backup from slot '+n)} · drag onto a career slot</small></div><button onclick="ttRecover(${n})">Recover</button></div>`)}}catch(e){}}
 $('ui').innerHTML=`<div id=ttl><div class=ttw><h2>Choose a career</h2>${rows.join('')}${rec.length?`<details class=ttrb><summary>Recovered backups (${rec.length})</summary>${rec.join('')}</details>`:''}<span class=ttnc title="${free.length?'':'Coming soon'}"><button ${free.length?`class=go onclick="ttSlot(${free[0]})"`:'disabled'}>+ New career</button>${free.length?'':'<em>Coming soon</em>'}</span><button onclick="ttBack()">Back</button></div></div>`}
function ttRecover(n,t){let b=null;try{b=localStorage.getItem('fw_bak_'+n)}catch(e){}if(!b)return;
 if(!t){for(let k=1;k<=SLOTS;k++){const i=k==curSlot()?(TT.game?1:null):slotInfo(k);if(!i){t=k;break}}
  if(!t){alert('No free career slot. Delete a career first, then press Recover again, or drag the backup onto a slot to overwrite it. Your backup is kept.');return}}
 snd('click');if(t==curSlot()&&TT.game)autoSave();
 let old=null;try{old=localStorage.getItem(slotKey(t))}catch(e){}
 wiping=true;
 try{localStorage.setItem(slotKey(t),b);localStorage.removeItem('fw_bak_'+n);localStorage.removeItem('fw_bakw_'+n);if(old){localStorage.setItem('fw_bak_'+n,old);localStorage.setItem('fw_bakw_'+n,'Replaced by a recovered backup')}localStorage.setItem(SLOT_K,t);sessionStorage.setItem('fw_go','1');if(FBU)localStorage.setItem(CS_KEY,JSON.stringify({uid:FBU.uid,t:CLD.t}))}catch(e){}
 location.reload()}
/* v26.140: drag a recovered backup onto a career slot; an occupied slot asks first and the replaced career becomes a backup */
function ttRecAsk(n,t){const i=t==curSlot()&&TT.game?{artist:S.artist}:slotInfo(t);if(!i)return ttRecover(n,t);
 const d=document.createElement('div');d.id='ttrc';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000a';
 d.innerHTML=`<div class="box modal" style="width:min(380px,92vw)"><h2>Overwrite career ${t}?</h2><p>Career ${t}${i.artist?' ('+esc(i.artist)+')':''} will be replaced by the recovered backup. The career it replaces is kept under Recovered backups.</p><div class=row2><button class=go id=ttrcy>Overwrite</button><button id=ttrcn>Cancel</button></div></div>`;
 document.body.appendChild(d);$('ttrcy').onclick=()=>{d.remove();ttRecover(n,t)};$('ttrcn').onclick=()=>d.remove()}
document.addEventListener('dragstart',e=>{const r=e.target.closest&&e.target.closest('#ttl .ttbk');if(r){try{e.dataTransfer.setData('text/plain',r.dataset.bak);e.dataTransfer.effectAllowed='move'}catch(x){}}});
document.addEventListener('dragover',e=>{const r=e.target.closest&&e.target.closest('#ttl .ttsl[data-slot]');if(r){e.preventDefault();r.classList.add('drop')}});
document.addEventListener('dragleave',e=>{const r=e.target.closest&&e.target.closest('#ttl .ttsl[data-slot]');if(r)r.classList.remove('drop')});
document.addEventListener('drop',e=>{const r=e.target.closest&&e.target.closest('#ttl .ttsl[data-slot]');if(!r)return;e.preventDefault();r.classList.remove('drop');let n=0;try{n=+e.dataTransfer.getData('text/plain')}catch(x){}if(n)ttRecAsk(n,+r.dataset.slot)});
function ttBack(){snd('click');TT.sel=0;titleUI()}
function ttSlot(n){snd('click');const a=curSlot();if(n==a){TT.sel=0;return ttPlay()}
 if(TT.game)autoSave();wiping=true;const i=slotInfo(n);
 try{localStorage.setItem(SLOT_K,n);sessionStorage.setItem('fw_go','1');if(FBU)localStorage.setItem(CS_KEY,JSON.stringify(i?{uid:FBU.uid,t:CLD.t}:{uid:FBU.uid,t:CLD.t,fresh:1}))}catch(e){}
 location.reload()}
function ttDel(n){const i=slotInfo(n)||(n==curSlot()&&TT.game?{artist:S.artist}:null);if(!i||!confirm('Delete career '+n+(i.artist?' ('+i.artist+')':'')+'? This cannot be undone.'))return;snd('click');
 try{localStorage.removeItem(slotKey(n))}catch(e){}
 if(n==curSlot()){wiping=true;try{if(FBU)localStorage.setItem(CS_KEY,JSON.stringify({uid:FBU.uid,t:CLD.t,fresh:1}))}catch(e){}location.reload()}else ttWorlds()}
{const t1=titleUI;titleUI=function(){if(TT.sel&&TT.on)return ttWorlds();return t1.apply(this,arguments)}}
function ttSet(){mode='pause';settings();SP='title'}
function saveQuit(){snd('click');autoSave();TT.game=1;
 if(FBU&&CLD.ok)csPush(1).then(r=>say(r?'☁ Saved to your Google account':CLD.err||'Saved on this device'));else say(FBU&&CLD.err?CLD.err:'Saved on this device');
 PS='';titleOpen()}
{const cs0=closeSet;closeSet=function(){cs0();if(mode=='title')titleUI()}
 const lc=loadCode;loadCode=function(c){const t=TT.on;lc(c);if(t&&mode=='play'){TT.game=1;titleOpen()}}
 const cf0=confirmChar;confirmChar=function(){TT.game=1;const r=cf0.apply(this,arguments);try{autoSave()}catch(e){}return r}}

/* pause menu: Save & quit, plus who is signed in and the cloud save state */
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(!m)return;const q=document.createElement('button');q.textContent='Save and quit';q.onclick=saveQuit;m.appendChild(q);
 if(!FB_ON||!FBU)return;const n=document.createElement('p');n.className='m';n.innerHTML='<small>Signed in as <b></b><br><span></span></small>';n.querySelector('b').textContent=FBU.displayName||FBU.email||'Google user';
 n.querySelector('span').textContent=CLD.err||(CLD.ok?'Cloud save on'+(CLD.t?' · saved '+new Date(CLD.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''):'Checking cloud save…');m.appendChild(n);};
 const pg=pauseGame;pauseGame=function(){pg();csPush()}}
/* browsers block sound until the first click, so start the menu music then */
addEventListener('pointerdown',()=>{if(TT.on&&MENUA&&MENUA.paused)MENUA.play().catch(()=>{})},{capture:true});
