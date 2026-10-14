/* ---------- v26.83: optional Google sign-in (Firebase Auth), v26.84: cloud saves ----------
   Config is the waveferngame web app from the Firebase console (Project settings > Your apps).
   If apiKey is ever set back to a PASTE_ placeholder, nothing loads and no sign-in button shows.
   Sign-in is optional: saves stay in this browser (fw_save) exactly as before. */
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
  m.onAuthStateChanged(FBA,usr=>{FBU=usr;CLD.ok=0;CLD.last='';if(usr)csCheck();fbRedraw()});return m.getRedirectResult(FBA).catch(()=>{})})}
function fbSignIn(){snd('click');fbLoad().then(()=>{const p=new FBM.GoogleAuthProvider();
 return FBM.signInWithPopup(FBA,p).then(r=>say('Signed in as '+(r.user.displayName||r.user.email)),e=>{
  if(e&&(e.code=='auth/popup-blocked'||e.code=='auth/operation-not-supported-in-this-environment'))return FBM.signInWithRedirect(FBA,p);
  if(e&&(e.code=='auth/popup-closed-by-user'||e.code=='auth/cancelled-popup-request'))return;
  throw e})}).catch(e=>{snd('err');say(e&&e.code=='auth/unauthorized-domain'?'Sign-in is not allowed on this website yet.':'Could not sign in. Try again.')})}
/* v26.85: in-game notice before Google sign-in: back up the save code first, since a cloud save can replace it */
function fbSignInAsk(){snd('click');const prev=mode,fresh=prev=='creator'||(prev=='title'&&!TT.game);CLD.pre=prev;
 $('ui').innerHTML=`<div id=fbq class="box modal" style="width:min(420px,92vw)"><h2>🔑 Before you sign in</h2><p>${fresh?'Have a save code from another device? Keep a copy somewhere safe before you sign in.':'You may need your save code, so copy it and keep it somewhere safe before you sign in.'}</p><p class=m><small>If your Google account already has a cloud save, it loads instead of the save on this device. If the account has never been used here, a brand new game starts and this save is wiped. Your save code is your backup.</small></p>${fresh?'':`<textarea id=fbsc rows=3 readonly style="width:100%;display:none"></textarea><button onclick="fbCopy()">📋 Copy save code</button>`}<div class=row2><button class=go onclick="fbSignInGo()">Continue to Google</button><button onclick="fbSignInBack()">Cancel</button></div></div>`}
function fbCopy(){const t=$('fbsc');t.value=saveCode();t.style.display='block';t.select();try{navigator.clipboard.writeText(t.value).then(()=>say('Save code copied'),()=>say('Copy the code from the box'))}catch(e){say('Copy the code from the box')}}
function fbSignInBack(){const prev=CLD.pre;CLD.pre=null;if(prev=='title'){mode='title';titleUI()}else if(prev=='creator'){mode='creator';creatorUI()}else if(prev=='pause'){mode='pause';pauseUI()}else closeUI()}
function fbSignInGo(){fbSignInBack();fbSignIn()}
function fbSignOut(){if(!FBA)return;snd('click');csPush(1).finally(()=>FBM.signOut(FBA).then(()=>say('Signed out. Your save stays on this device.')))}
function fbRedraw(){if(mode=='pause')pauseUI();else if(mode=='title'&&document.getElementById('ttl'))titleUI()}

/* v26.84: cloud saves. Signed-in players keep one save in Firestore at saves/{uid} = {code, day, artist, t}.
   The rules in docs/firestore.rules let each player read and write only their own save.
   v26.87: the cloud save always wins. fw_cloud remembers which cloud save (uid + t) this device last wrote or loaded:
   if the cloud is still that one, this device has the newest game and uploads it; otherwise the cloud save is loaded. */
const CLD={ok:0,last:'',t:0,err:'',busy:0};
const csMark=()=>{try{return JSON.parse(localStorage.getItem('fw_cloud'))||{}}catch(e){return{}}};
const csSetMark=t=>{CLD.t=t;try{localStorage.setItem('fw_cloud',JSON.stringify({uid:FBU.uid,t}))}catch(e){}};
const csRef=()=>FBF.doc(FBD,'saves',FBU.uid);
const csGame=()=>mode=='title'?!!TT.game:mode!='creator';
const csReady=()=>!document.getElementById('load')&&['title','play','pause'].includes(mode)&&!document.getElementById('fbq');
function csFail(e){CLD.err=e&&e.code=='permission-denied'?'Cloud saves are not set up yet.':'Cloud save is offline. Your game still saves on this device.';fbRedraw()}
function csCheck(){const uid=FBU&&FBU.uid;if(!uid)return;
 if(!csReady()&&mode!='creator')return setTimeout(()=>{if(FBU&&FBU.uid==uid&&!CLD.ok)csCheck()},700);
 CLD.err='';FBF.getDoc(csRef()).then(d=>{if(!FBU||FBU.uid!=uid)return;
  if(!d.exists()){if(csGame()&&csMark().uid!=uid)return csFresh(uid);CLD.ok=1;CLD.t=0;fbRedraw();return csPush(1)}
  const c=d.data(),m=csMark();
  if(csGame()&&m.uid==uid&&m.t==c.t){CLD.ok=1;CLD.t=c.t;fbRedraw();return csPush()}
  if(csGame()&&c.code==saveCode()){CLD.ok=1;CLD.last=c.code;csSetMark(c.t);return fbRedraw()}
  csLoad(c)}).catch(csFail)}
function csLoad(c){const uid=FBU&&FBU.uid;if(!csReady())return setTimeout(()=>{if(FBU&&FBU.uid==uid)csLoad(c)},700);
 if(mode=='pause')resumeGame();loadCode(c.code);if(!FBU)return;CLD.ok=1;CLD.last=c.code;csSetMark(c.t);autoSave();say('☁ Loaded your cloud save (Day '+c.day+')');fbRedraw()}
/* v26.86: a Google account signing in for the first time (no cloud save yet) starts a fresh game instead of taking this device's save */
function csFresh(uid){if(!csReady())return setTimeout(()=>{if(FBU&&FBU.uid==uid&&!CLD.ok)csCheck()},700);
 if(mode=='play')mode='menu';CLD.fresh=uid;
 $('ui').innerHTML=`<div id=csf class="box modal" style="width:min(400px,92vw)"><h2>☁ New Google account</h2><p>This Google account has never been used in WaveFern before, so it starts a <b>brand new game</b>. The save on this device is wiped.</p><p class=m><small>If you copied your save code, you can load it later in Settings.</small></p><button class=go onclick="csFreshGo()">Start new game</button></div>`}
function csFreshGo(){if(!FBU)return;snd('click');wiping=true;try{localStorage.removeItem('fw_save');localStorage.setItem('fw_cloud',JSON.stringify({uid:FBU.uid,t:0}))}catch(e){}location.reload()}
function csPush(force){if(!FBU||!CLD.ok||CLD.busy||!FBF||['creator','load'].includes(mode)||(mode=='title'&&!TT.game)||wiping)return Promise.resolve();
 const code=saveCode();if(code==CLD.last&&!force)return Promise.resolve();if(code.length>1e6){CLD.err='Your save is too big for the cloud.';return Promise.resolve()}
 const t=Date.now(),uid=FBU.uid;CLD.busy=1;
 /* only write over the cloud save this device last saw; if another device saved since, load that one instead */
 return FBF.getDoc(csRef()).then(d=>{if(!FBU||FBU.uid!=uid)return;const c=d.exists()?d.data():null;
  if(c&&c.t!=CLD.t){CLD.ok=0;csLoad(c);return}
  csSetMark(t);return FBF.setDoc(csRef(),{code,day:S.day,artist:S.artist||'',t}).then(()=>{CLD.last=code;CLD.err='';return 1})}).catch(csFail).finally(()=>{CLD.busy=0})}
setInterval(()=>csPush(),90000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)csPush()});
addEventListener('pagehide',()=>csPush());
if(FB_ON)fbLoad().catch(()=>{});

/* v26.87: main menu shown when the site opens: Play, Settings, Google sign-in, profile in the top right.
   The world stays paused behind it; Save & quit in the pause menu comes back here. */
const TT={on:0,game:0};
function titleOpen(){TT.on=1;mode='title';PAUSED=1;for(const k in keys)delete keys[k];MU.hold=1;try{const a=MU.a[MU.cur];if(MU.pl&&a)a.pause()}catch(e){}pauseOverlay(1);menuMusic(1);titleUI()}
function titleUI(){if(!TT.on)return;const busy=FBU&&!CLD.ok&&!CLD.err,nm=FBU?(FBU.displayName||FBU.email||'Google user'):'';
 const pf=FBU?`<div class=ttpf>${FBU.photoURL?`<img src="${esc(FBU.photoURL)}" referrerpolicy=no-referrer alt="">`:`<i>${esc(nm[0]||'?').toUpperCase()}</i>`}<span><b>${esc(nm)}</b><small>${esc(CLD.err||(CLD.ok?'☁ Cloud save on':'☁ Loading…'))}</small></span><button onclick="fbSignOut()">Sign out</button></div>`:`<div class=ttpf><i>👤</i><span><b>Guest</b><small>Saves on this device</small></span></div>`;
 $('ui').innerHTML=`<div id=ttl>${FB_ON?pf:''}<div class=ttm><h1>WAVEFERN<br>RECORDS</h1><div class=px>Music Career Sim</div>
  <button class=go onclick="ttPlay()" ${busy?'disabled':''}>${busy?'☁ Loading your save…':TT.game?'▶ Play'+(S.day?' · Day '+S.day:''):'▶ Play · New game'}</button>
  <button onclick="ttSet()">⚙ Settings</button>${FB_ON&&!FBU?`<button onclick="fbSignInAsk()">🔑 Sign in with Google</button><p class=m><small>Sign in to keep your game in the cloud and play on any device.</small></p>`:''}</div></div>`}
function ttPlay(){if(FBU&&!CLD.ok&&!CLD.err)return;snd('click');TT.on=0;pauseOverlay(0);menuMusic(0);PAUSED=0;PS='';MU.hold=0;try{const a=MU.a[MU.cur];if(MU.pl&&a&&a.paused)a.play().catch(()=>{})}catch(e){}
 if(TT.game){mode='play';$('ui').innerHTML=''}else{mode='creator';creatorUI()}}
function ttSet(){mode='pause';settings();SP='title'}
function saveQuit(){snd('click');autoSave();TT.game=1;
 if(FBU&&CLD.ok)csPush(1).then(r=>say(r?'☁ Saved to your Google account':CLD.err||'Saved on this device'));else say(FBU&&CLD.err?CLD.err:'Saved on this device');
 PS='';titleOpen()}
{const cs0=closeSet;closeSet=function(){cs0();if(mode=='title')titleUI()}
 const lc=loadCode;loadCode=function(c){const t=TT.on;lc(c);if(t&&mode=='play'){TT.game=1;titleOpen()}}
 const cf0=confirmChar;confirmChar=function(){TT.game=1;return cf0.apply(this,arguments)}}

/* pause menu: Save & quit, plus who is signed in and the cloud save state */
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(!m)return;const q=document.createElement('button');q.textContent='💾 Save & quit';q.onclick=saveQuit;m.appendChild(q);
 if(!FB_ON||!FBU)return;const n=document.createElement('p');n.className='m';n.innerHTML='<small>Signed in as <b></b><br><span></span></small>';n.querySelector('b').textContent=FBU.displayName||FBU.email||'Google user';
 n.querySelector('span').textContent=CLD.err||(CLD.ok?'☁ Cloud save on'+(CLD.t?' · saved '+new Date(CLD.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''):'☁ Checking cloud save…');m.appendChild(n);
 if(CLD.fresh==FBU.uid&&!CLD.ok){const b=document.createElement('button');b.className='go';b.textContent='☁ Start new game for this account';b.onclick=()=>csFresh(FBU.uid);m.appendChild(b)}};
 const pg=pauseGame;pauseGame=function(){pg();csPush()}}
/* browsers block sound until the first click, so start the menu music then */
addEventListener('pointerdown',()=>{if(TT.on&&MENUA&&MENUA.paused)MENUA.play().catch(()=>{})},{capture:true});
