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
function fbSignOut(){if(!FBA)return;snd('click');csPush(1).finally(()=>FBM.signOut(FBA).then(()=>say('Signed out. Your save stays on this device.')))}
function fbRedraw(){if(mode=='pause')pauseUI();else if(mode=='creator'&&document.getElementById('cre'))creatorUI()}

/* v26.84: cloud saves. Signed-in players keep one save in Firestore at saves/{uid} = {code, day, artist, t}.
   The rules in docs/firestore.rules let each player read and write only their own save.
   fw_cloud remembers which cloud save (uid + t) this device last wrote or loaded: if the cloud save is
   still that one, this device is the newest and simply uploads; if another device saved since, the player picks. */
const CLD={ok:0,last:'',t:0,err:'',busy:0,ask:0};
const csMark=()=>{try{return JSON.parse(localStorage.getItem('fw_cloud'))||{}}catch(e){return{}}};
const csSetMark=t=>{CLD.t=t;try{localStorage.setItem('fw_cloud',JSON.stringify({uid:FBU.uid,t}))}catch(e){}};
const csRef=()=>FBF.doc(FBD,'saves',FBU.uid);
function csFail(e){CLD.err=e&&e.code=='permission-denied'?'Cloud saves are not set up yet.':'Cloud save is offline. Your game still saves on this device.';fbRedraw()}
function csCheck(){const uid=FBU&&FBU.uid;if(!uid)return;
 if(document.getElementById('load')||!['play','creator','pause'].includes(mode))return setTimeout(()=>{if(FBU&&FBU.uid==uid&&!CLD.ok)csCheck()},1000);
 CLD.err='';FBF.getDoc(csRef()).then(d=>{if(!FBU||FBU.uid!=uid)return;
  if(!d.exists()){CLD.ok=1;CLD.t=0;fbRedraw();return csPush(1)}
  const c=d.data(),m=csMark();
  if(mode=='creator')return csAsk(c,1);
  if(m.uid==uid&&m.t==c.t){CLD.ok=1;CLD.t=c.t;fbRedraw();return csPush()}
  if(c.code==saveCode()){CLD.ok=1;CLD.last=c.code;csSetMark(c.t);return fbRedraw()}
  csAsk(c,0)}).catch(csFail)}
function csAsk(c,fresh){if(!['play','creator','pause'].includes(mode))return setTimeout(()=>csAsk(c,fresh),1000);
 const prev=mode,when=new Date(c.t).toLocaleString(),who=c.artist?esc(c.artist)+', ':'';CLD.ask={c,prev,fresh};if(prev=='play')mode='menu';
 $('ui').innerHTML=`<div id=csq class="box modal" style="width:min(400px,92vw)"><h2>☁ Cloud save found</h2><p>${who}Day ${c.day}<br><small class=m>saved ${esc(when)}</small></p>${fresh?'':`<p class=m>This device has a different save: ${S.artist?esc(S.artist)+', ':''}Day ${S.day}.</p>`}<div class=row2><button class=go onclick="csPick(1)">Load cloud save</button><button onclick="csPick(0)">${fresh?'Start a new game':'Keep this device'}</button></div><p class=m><small>${fresh?'A new game will replace the cloud save once you start playing.':'The one you don\'t pick is replaced.'}</small></p></div>`}
function csPick(load){const a=CLD.ask;if(!a||!FBU)return;CLD.ask=0;snd('click');CLD.ok=1;
 if(load){if(PAUSED)resumeGame();loadCode(a.c.code);CLD.last=a.c.code;csSetMark(a.c.t);autoSave();return}
 csSetMark(a.c.t);if(a.prev=='creator'){mode='creator';creatorUI()}else if(a.prev=='pause'){mode='pause';pauseUI()}else closeUI();csPush(1)}
function csPush(force){if(!FBU||!CLD.ok||CLD.busy||!FBF||['creator','load'].includes(mode)||wiping)return Promise.resolve();
 const code=saveCode();if(code==CLD.last&&!force)return Promise.resolve();if(code.length>1e6){CLD.err='Your save is too big for the cloud.';return Promise.resolve()}
 const t=Date.now(),uid=FBU.uid;CLD.busy=1;
 /* only write over the cloud save this device last saw; if another device saved since, stop and let the player pick */
 return FBF.getDoc(csRef()).then(d=>{if(!FBU||FBU.uid!=uid)return;const c=d.exists()?d.data():null;
  if(c&&c.t!=CLD.t){CLD.ok=0;csAsk(c,0);return}
  csSetMark(t);return FBF.setDoc(csRef(),{code,day:S.day,artist:S.artist||'',t}).then(()=>{CLD.last=code;CLD.err=''})}).catch(csFail).finally(()=>{CLD.busy=0})}
setInterval(()=>csPush(),90000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)csPush()});
addEventListener('pagehide',()=>csPush());
if(FB_ON)fbLoad().catch(()=>{});

/* pause menu: sign in / who is signed in + cloud save state; character creator: sign in to load a cloud save */
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(!m||!FB_ON)return;const d=document.createElement('div');
 if(FBU){const n=document.createElement('p');n.className='m';n.innerHTML='<small>Signed in as <b></b><br><span></span></small>';n.querySelector('b').textContent=FBU.displayName||FBU.email||'Google user';
  n.querySelector('span').textContent=CLD.err||(CLD.ok?'☁ Cloud save on'+(CLD.t?' · saved '+new Date(CLD.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''):'☁ Checking cloud save…');
  const b=document.createElement('button');b.textContent='Sign out';b.onclick=fbSignOut;d.append(n,b);
  if(CLD.ask&&!CLD.ok){const q=document.createElement('button');q.className='go';q.textContent='☁ Choose which save to keep';q.onclick=()=>csAsk(CLD.ask.c,CLD.ask.fresh);d.insertBefore(q,b)}}
 else{const b=document.createElement('button');b.textContent='🔑 Sign in with Google';b.onclick=fbSignIn;const n=document.createElement('p');n.className='m';n.innerHTML='<small>Sign in to keep your save in the cloud and play on any device.</small>';d.append(b,n)}
 m.appendChild(d)};
 const pg=pauseGame;pauseGame=function(){pg();csPush()};
 const c0=creatorUI;creatorUI=function(){c0();const cr=$('cre');if(!cr||!FB_ON)return;const d=document.createElement('div');d.className='m';d.style.cssText='margin-top:10px;text-align:center';
  if(FBU){d.innerHTML='<small></small>';d.firstChild.textContent=CLD.err||(CLD.ok?'☁ Signed in. This new game will save to the cloud.':'☁ Checking cloud save…')}
  else{d.innerHTML='<small>Played before on another device?</small><br>';const b=document.createElement('button');b.textContent='🔑 Sign in with Google';b.style.marginTop='6px';b.onclick=fbSignIn;d.appendChild(b)}
  cr.appendChild(d)}}
