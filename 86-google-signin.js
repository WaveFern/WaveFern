/* ---------- v26.83: optional Google sign-in (Firebase Auth), v26.84: cloud saves ----------
   Config is the waveferngame web app from the Firebase console (Project settings > Your apps).
   If apiKey is ever set back to a PASTE_ placeholder, nothing loads and no sign-in button shows.
   Sign-in is optional: saves stay in this browser (fw_save_1 / fw_save_2) exactly as before. */
/* ===== FIREBASE CONFIG: the ONLY place to paste new project values (Firebase console > Project settings > Your apps > Web app > Config),
   plus databaseURL from Realtime Database. Public web config, safe to commit. Never put a service account, admin key or secret here.
   Currently the waveferndata project (moved from waveferngame). ===== */
const FB_CFG={
 apiKey:'AIzaSyBK_7wiX2SEtEhacUsFrgt8URcG1DyHdmA',
 authDomain:'waveferndata.firebaseapp.com',
 projectId:'waveferndata',
 storageBucket:'waveferndata.firebasestorage.app',
 messagingSenderId:'729312399087',
 appId:'1:729312399087:web:09d5d134ce654e223ed51a',
 measurementId:'G-5CG4LPGD18',
 databaseURL:'https://waveferndata-default-rtdb.europe-west1.firebasedatabase.app'
};
/* ===== END FIREBASE CONFIG ===== */
const FB_V='10.12.2',FB_RC='6Lcv_ycuAAAAAEB34hu7jkN3uogbbgyCDmun3DDm'/* v55.29.0: public reCAPTCHA Enterprise site key for Firebase App Check */,FB_ON=!/^PASTE_/.test(FB_CFG.apiKey)&&!FW_TRL&&(!window.FW_DEV||!!window.FW_DEV_AUTH)/* v56.0.4: /dev?devauth=1 lets only sign-in through (dev/dev-shim.js); saves, rooms and friends stay blocked */;
/* v55.29.0: App Check. Attaches a reCAPTCHA token to every Firebase request so Firebase can later reject calls that do not come from the real game. Best effort: if it cannot load, the game carries on without a token. */
function fbAppCheck(ac,app){if(!ac)return;try{ac.initializeAppCheck(app,{provider:new ac.ReCaptchaEnterpriseProvider(FB_RC),isTokenAutoRefreshEnabled:true})}catch(e){}}
let FBU=null,FBA=null,FBM=null,FBD=null,FBF=null;
function fbLoad(){if(!FB_ON)return Promise.reject('off');if(FBA)return Promise.resolve();
 const u='https://www.gstatic.com/firebasejs/'+FB_V+'/firebase-';
 return Promise.all([import(u+'app.js'),import(u+'auth.js'),import(u+'firestore.js'),import(u+'app-check.js').catch(()=>null)]).then(([a,m,f,ac])=>{const app=a.initializeApp(FB_CFG);fbAppCheck(ac,app);FBM=m;FBF=f;FBA=m.getAuth(app);try{FBD=f.initializeFirestore(app,{experimentalAutoDetectLongPolling:true})}catch(e){FBD=f.getFirestore(app)}
  m.onAuthStateChanged(FBA,fbAuthSet);
  return m.getRedirectResult(FBA).then(r=>{if(r&&r.user)fbSignedIn(r.user)},e=>{if(CLD.signing)fbSignErr(e)}).finally(()=>{if(CLD.signing&&!wiping){CLD.signing=0;try{sessionStorage.removeItem('fw_signing')}catch(e){}if(FBU)csCheck();else if(!FBA.currentUser)setTimeout(()=>say('Sign-in did not finish. Allow pop-ups for this site and try again.'),1500)}})})}
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
 $('ui').innerHTML=`<div class="box modal" style="width:min(420px,92vw)"><h2>New Google account</h2><p>This Google account has no career yet. Bring your career from this device${a?' ('+esc(a)+')':''} into it, or start a new one?</p><p class=m><small>Bringing it copies it: the original stays on this device for when you play signed out.</small></p><div class=row2><button class=go onclick="csPick(1)">Bring my career</button><button onclick="csPick(2)">Start a new career</button></div></div>`}
function csPick(k){const uid=FBU&&FBU.uid;if(!uid)return;snd('click');CLD.asking=0;
 if(k==2){csSetMark(0);try{localStorage.setItem(CS_KEY,JSON.stringify({uid,t:0,fresh:1}))}catch(e){}CLD.ok=1;fbSignInBack();return fbRedraw()}
 const c=csGuestCode();if(!c){CLD.ok=1;fbSignInBack();return fbRedraw()}
 wiping=true;try{localStorage.setItem(slotKey(),c);localStorage.setItem(CS_KEY,JSON.stringify({uid,t:0}));sessionStorage.setItem('fw_go','1');sessionStorage.setItem('fw_msg','Your career is now on your Google account')}catch(e){wiping=false;return say('No room to copy your career.')}
 location.reload()}
function csWipe(uid,msg){if(!bakKeep(localStorage.getItem(slotKey()),'Kept before a new career started'))return;wiping=true;try{localStorage.removeItem(slotKey());localStorage.setItem(CS_KEY,JSON.stringify({uid,t:0}));if(msg)sessionStorage.setItem('fw_msg',msg)}catch(e){}location.reload()}
const csSetMarkFor=(uid,t)=>{CLD.t=t;try{localStorage.setItem(CS_KEY,JSON.stringify({uid,t}))}catch(e){}};
/* v56.0.1: one sign-in at a time (a second click used to cancel the open popup), clear messages for the usual failures, and a notice
   when the redirect fallback comes back signed out (it silently did nothing before) */
let fbBusy=0;
const fbInApp=()=>/FBAN|FBAV|Instagram|TikTok|musical_ly|Snapchat|\bLine\/|MicroMessenger|; wv\)/i.test(navigator.userAgent||'');
function fbSignErr(e){const c=e&&e.code;snd('err');say(c=='auth/unauthorized-domain'?'Sign-in is not allowed on this website yet.':c=='auth/network-request-failed'?'No connection. Check your internet and try again.':c=='auth/web-storage-unsupported'||c=='auth/operation-not-supported-in-this-environment'?'This browser blocks sign-in. Open wavefern.com in Chrome or Safari.':fbInApp()?'Google blocks sign-in inside this app. Open wavefern.com in Chrome or Safari.':'Could not sign in. Try again.')}
function fbSignIn(){if(fbBusy)return;fbBusy=1;snd('click');CLD.signing=1;fbLoad().then(()=>{const p=new FBM.GoogleAuthProvider();
 return FBM.signInWithPopup(FBA,p).then(r=>fbSignedIn(r.user),e=>{
  if(e&&(e.code=='auth/popup-blocked'||e.code=='auth/operation-not-supported-in-this-environment')&&!fbInApp()){try{sessionStorage.setItem('fw_signing','1')}catch(x){}return FBM.signInWithRedirect(FBA,p)}
  CLD.signing=0;if(e&&(e.code=='auth/popup-closed-by-user'||e.code=='auth/cancelled-popup-request'))return;
  throw e})}).catch(e=>{CLD.signing=0;fbSignErr(e)}).finally(()=>{fbBusy=0})}
/* v26.85: in-game notice before Google sign-in: back up the save code first, since a cloud save can replace it */
function fbSignInAsk(){snd('click');const prev=mode,fresh=prev=='creator'||(prev=='title'&&!TT.game);CLD.pre=prev;
 $('ui').innerHTML=`<div id=fbq class="box modal" style="width:min(420px,92vw)"><h2>Before you sign in</h2><p>${fresh?'Have a save code from another device? Keep a copy somewhere safe before you sign in.':'You may need your save code, so copy it and keep it somewhere safe before you sign in.'}</p><p class=m><small>Each account has its own careers. Signing in shows that account's careers, and signing out brings back the ones on this device, so nothing is replaced. A brand new account can bring your current career with it.</small></p>${fresh?'':`<textarea id=fbsc rows=3 readonly style="width:100%;display:none"></textarea><button onclick="fbCopy()">Copy save code</button>`}<div class=row2><button class=go onclick="fbSignInGo()">Continue to Google</button>${FB_EMAIL?'<button onclick="fbEmailOpen(\'in\')">Use email instead</button>':''}<button onclick="fbSignInBack()">Cancel</button></div></div>`}
function fbCopy(){const t=$('fbsc');t.value=saveCode();t.style.display='block';t.select();try{navigator.clipboard.writeText(t.value).then(()=>say('Save code copied'),()=>say('Copy the code from the box'))}catch(e){say('Copy the code from the box')}}
function fbSignInBack(){const prev=CLD.pre;CLD.pre=null;if(prev=='title'){mode='title';titleUI()}else if(prev=='creator'){mode='creator';creatorUI()}else if(prev=='pause'){mode='pause';pauseUI()}else closeUI()}
function fbSignInGo(){fbSignInBack();fbSignIn()}
/* v56.0.4 (HELD behind FB_EMAIL): email + password sign-in next to Google. Same Firebase Auth, same cloud save and profile code: only the
   way in differs. A password account that has not clicked its confirm link is kept OUT of the game (FBU stays null, FBP holds it), so
   it can never reach saves, friends or band rooms; the rules also refuse it (firebase-rules/v56.0.4). Same address as a Google account =
   one account: Firebase links them, and "Forgot password?" lets a Google player add a password. Emails are sent by the Cloudflare Worker in worker/ through Resend; links open /account/. */
const FB_EMAIL=!!window.FW_DEV/* HELD: /dev only. On release day set true */;/* before release: functions deployed, RESEND_API_KEY set, Email/Password enabled in Firebase Authentication, rules v56.0.4 published */;
let FBP=null,FBFM=null;const FBE={v:'in',msg:'',bad:0,t:0,busy:0};
const fbHold=u=>!!u&&!u.emailVerified&&u.providerData.length>0&&u.providerData.every(p=>p.providerId=='password');
function fbAuthSet(usr){window.FW_AUTH_DONE=1;if(fbHold(usr)){FBP=usr;FBU=null;CLD.ok=0;fbRedraw();return}FBP=null;if(csAcct(usr))return;FBU=usr;CLD.ok=0;CLD.last='';if(usr&&!CLD.signing)csCheck();fbRedraw()}
const FB_MAIL_URL='https://wavefern-mail.wavefernfirebase.workers.dev'/* set to the Worker's address after deploy (worker/, docs/email-signin-setup.md) */;
function fbMail(kind,email){const h={'Content-Type':'application/json'};
 const go=()=>fetch(FB_MAIL_URL+(kind=='verify'?'/verify':'/reset'),{method:'POST',headers:h,body:JSON.stringify(kind=='verify'?{}:{email})}).then(r=>{if(!r.ok){const e=new Error('mail');e.code=r.status==429?'mail/busy':'mail/fail';throw e}return r.json()});
 return fbLoad().then(()=>kind=='verify'?(FBP||FBA.currentUser).getIdToken().then(t=>{h.Authorization='Bearer '+t}):0).then(go)}
const FB_ERR={'auth/invalid-email':'That email address does not look right.','auth/invalid-credential':'Wrong email or password.','auth/wrong-password':'Wrong email or password.','auth/user-not-found':'Wrong email or password.',
 'auth/email-already-in-use':'That email already has an account. Sign in, or use Forgot password (also works if you used Google before).','auth/weak-password':'Use a password with at least 8 characters.',
 'auth/too-many-requests':'Too many tries. Wait a few minutes.','auth/network-request-failed':'No connection. Try again.','auth/operation-not-allowed':'Email sign-in is not switched on yet.','mail/busy':'Wait a minute, then try again.'};
const fbErr=e=>FB_ERR[e&&e.code]||'Something went wrong. Try again.';
function fbEmailOpen(v){if(!FB_EMAIL)return;snd('click');if(!CLD.pre&&mode=='title')CLD.pre='title';fbLoad().then(()=>{FBE.v=FBP?'verify':(v||'in');FBE.msg='';fbEmailUI()},()=>say('Sign-in is not available right now.'))}
function fbEmailUI(msg,bad){clearInterval(FBE.t);if(msg!==undefined){FBE.msg=msg;FBE.bad=bad?1:0}const v=FBE.v,e=($('fbe_e')||{}).value||'',m=FBE.msg?`<p class=m style="color:${FBE.bad?'#ff9b9b':'#9dffc4'}">${esc(FBE.msg)}</p>`:'';
 const inp=(id,t,ph,ac)=>`<input id=${id} type=${t} placeholder="${ph}" autocomplete=${ac} maxlength=128 style="margin:4px 0" onkeydown="if(event.key=='Enter')fbEmailGo()">`;
 let h;
 if(v=='verify'){const a=FBP?esc(FBP.email||''):'';h=`<h2>Check your email</h2><p>We sent a link to <b>${a}</b>. Open it to confirm your address, then come back and press the button.</p>${m}<div class=row2><button class=go onclick="fbEmailGo()">I confirmed it</button><button onclick="fbEmailResend()">Send it again</button></div><p class=m><small>Nothing there? Look in spam. Wrong address?</small></p><div class=row2><button onclick="fbEmailOther()">Use a different email</button><button onclick="fbEmailBack()">Close</button></div>`}
 else if(v=='reset')h=`<h2>Reset password</h2><p>Enter your email and we will send a link to choose a new password.</p>${inp('fbe_e','email','Email','email')}${m}<div class=row2><button class=go onclick="fbEmailGo()">Send reset email</button><button onclick="FBE.v='in';fbEmailUI('')">Back</button></div>`;
 else if(v=='up')h=`<h2>Create account</h2>${inp('fbe_e','email','Email','email')}${inp('fbe_p','password','Password (8+ characters)','new-password')}${m}<p class=m><small>By creating an account you agree to the <a href="terms/" target="_blank" rel="noopener">Terms</a> and <a href="privacy/" target="_blank" rel="noopener">Privacy Policy</a>. We email you once to confirm your address.</small></p><div class=row2><button class=go onclick="fbEmailGo()">Create account</button><button onclick="FBE.v='in';fbEmailUI('')">I have an account</button></div>`;
 else h=`<h2>Sign in with email</h2>${inp('fbe_e','email','Email','email')}${inp('fbe_p','password','Password','current-password')}${m}<div class=row2><button class=go onclick="fbEmailGo()">Sign in</button><button onclick="FBE.v='reset';fbEmailUI('')">Forgot password?</button></div><div class=row2><button onclick="FBE.v='up';fbEmailUI('')">Create account</button><button onclick="fbEmailBack()">Cancel</button></div>`;
 $('ui').innerHTML=`<div id=fbem class="box modal" style="width:min(420px,92vw)">${h}</div>`;
 const i=$('fbe_e');if(i){i.value=e;i.focus()}
 if(v=='verify')FBE.t=setInterval(()=>{if(!document.getElementById('fbem')||FBE.v!='verify')return clearInterval(FBE.t);fbVerifyCheck(1)},6000)}
function fbEmailBack(){clearInterval(FBE.t);fbSignInBack()}
function fbEmailOther(){if(!FBA)return;snd('click');clearInterval(FBE.t);FBM.signOut(FBA).then(()=>{FBP=null;FBE.v='up';fbEmailUI('')})}
function fbVerifyCheck(quiet){const u=FBP;if(!u||FBE.busy)return;FBE.busy=1;return FBM.reload(u).then(()=>{if(u.emailVerified)return u.getIdToken(true).then(()=>{clearInterval(FBE.t);fbSignedIn(u);fbAuthSet(u)});if(!quiet){snd('err');fbEmailUI('Not confirmed yet. Open the link in the email first.',1)}}).catch(e=>{if(!quiet)fbEmailUI(fbErr(e),1)}).finally(()=>{FBE.busy=0})}
function fbEmailResend(){if(!FBP)return;snd('click');fbMail('verify').then(()=>fbEmailUI('Sent. It can take a minute.'),e=>fbEmailUI(fbErr(e),1))}
function fbEmailGo(){if(FBE.busy&&FBE.v!='verify')return;const v=FBE.v;if(v=='verify')return fbVerifyCheck();
 const em=(($('fbe_e')||{}).value||'').trim(),pw=($('fbe_p')||{}).value||'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))return fbEmailUI('Enter a valid email address.',1);
 if(v=='reset'){FBE.busy=1;return fbMail('reset',em).then(()=>{FBE.v='in';fbEmailUI('If that email has an account, a reset link is on its way. Check spam too.')},e=>fbEmailUI(fbErr(e),1)).finally(()=>{FBE.busy=0})}
 if(v=='up'&&pw.length<8)return fbEmailUI('Use a password with at least 8 characters.',1);
 if(!pw)return fbEmailUI('Enter your password.',1);
 FBE.busy=1;CLD.signing=1;
 const go=v=='up'?FBM.createUserWithEmailAndPassword(FBA,em,pw).then(r=>{CLD.signing=0;FBP=r.user;FBE.v='verify';fbEmailUI('');return fbMail('verify').catch(x=>fbEmailUI(fbErr(x),1))}):FBM.signInWithEmailAndPassword(FBA,em,pw).then(r=>{if(fbHold(r.user)){CLD.signing=0;FBP=r.user;FBE.v='verify';fbEmailUI('Confirm your email to finish signing in.');return fbMail('verify').catch(()=>{})}fbSignedIn(r.user)});
 go.catch(e=>{CLD.signing=0;snd('err');fbEmailUI(fbErr(e),1)}).finally(()=>{FBE.busy=0})}
/* v49.95.0: "Sign out of Google" on the main menu. Asks first, saves the cloud career, then signs out. The auth change
   reloads into the signed-out set of careers. No save is deleted: cloud save and device careers stay where they are. */
function fbSignOutAsk(){if(!FBA||!FBU)return;snd('click');if(!confirm('Sign out? Your cloud save stays on your account, and the careers on this device are kept. You will go back to the signed-out menu.'))return;fbSignOut()}
function fbSignOut(){if(!FBA)return;snd('click');csPush(1).catch(()=>{}).then(()=>FBM.signOut(FBA)).catch(()=>say('Could not sign out. Try again.'))}
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
 CLD.err='';let late=0;/* slow or stalled network: after 15 s Play is allowed (offline notice); a late answer only loads if the title is still showing */
 const to=setTimeout(()=>{if(FBU&&FBU.uid==uid&&!CLD.ok){late=1;csFail({code:'timeout'})}},15000);
 FBF.getDoc(csRef()).then(d=>{clearTimeout(to);if(!FBU||FBU.uid!=uid)return;if(late){if(mode!='title'||TT.game)return;CLD.err='';fbRedraw()}
  if(!d.exists()){if(!csGame()&&!csMark().fresh&&!slotInfo(1)&&!slotInfo(2)&&csGuestCode())return csAsk();CLD.ok=1;CLD.t=0;fbRedraw();return csPush(1)}
  const c=d.data(),m=csMark();
  if(!csGame()&&m.uid==uid&&m.fresh){CLD.ok=1;CLD.t=c.t;return fbRedraw()}
  if(csGame()&&m.uid==uid&&m.t==c.t){CLD.ok=1;CLD.t=c.t;fbRedraw();return csPush()}
  if(csGame()&&c.code==saveCode()){CLD.ok=1;CLD.last=c.code;csSetMark(c.t);return fbRedraw()}
  if(csGame()&&csAhead(saveCode(),c.code)){CLD.ok=1;CLD.t=c.t;fbRedraw();return csPush(1)}
  csLoad(c)}).catch(e=>{clearTimeout(to);if(!late)csFail(e)})}
/* b is the same career as a and at least as far along, so replacing a with b loses nothing */
function csCovers(a,b){if(!a||a==b)return true;try{const x=scDecode(a).S,y=scDecode(b).S;return x.artist==y.artist&&(y.day||0)>=(x.day||0)}catch(e){return false}}
function csAhead(a,b){try{const x=scDecode(a).S,y=scDecode(b).S;return x.artist==y.artist&&(x.day||0)>(y.day||0)}catch(e){return false}}
/* v49.24.12: the trailer page used to upload its own career over a signed-in player's cloud save. A cloud save that is a trailer
   career is never loaded: this device keeps its career and uploads it over the trailer one instead */
function csLoad(c){const uid=FBU&&FBU.uid;if(c&&isTrlCareer(c.code)){CLD.ok=1;csSetMark(c.t);fbRedraw();setTimeout(()=>csPush(1),50);return}if(!csReady())return setTimeout(()=>{if(FBU&&FBU.uid==uid)csLoad(c)},700);
 let cur=null;try{cur=csGame()?saveCode():localStorage.getItem(slotKey())}catch(e){}
 if(cur&&!csCovers(cur,c.code)&&!bakKeep(cur,'Kept before your cloud save loaded')){CLD.err='No room to back up this career, so the cloud save was not loaded.';return fbRedraw()}
 if(mode=='pause')resumeGame();loadCode(c.code);if(!FBU)return;CLD.ok=1;CLD.last=c.code;csSetMark(c.t);autoSave();say('Loaded your cloud save (Day '+c.day+')');fbRedraw()}
function csPush(force){if(!FBU||!CLD.ok||CLD.busy||!FBF||['creator','load'].includes(mode)||(mode=='title'&&!TT.game)||wiping)return Promise.resolve();
 /* v55.31.0: the pack + seal runs in the save worker (saveCodeAsync), not on the main thread; a hidden tab / closing page still packs on the spot */
 const uid=FBU.uid;CLD.busy=1;
 return (document.hidden?Promise.resolve(saveCode()):saveCodeAsync()).then(code=>{if(code==CLD.last&&!force)return;if(code.length>1e6){CLD.err='Your save is too big for the cloud.';return}
 const t=Date.now();
 /* only write over the cloud save this device last saw; if another device saved since, load that one instead */
 return FBF.getDoc(csRef()).then(d=>{if(!FBU||FBU.uid!=uid)return;const c=d.exists()?d.data():null;
  if(c&&c.t!=CLD.t){CLD.ok=0;csLoad(c);return}
  if(c&&![1,2].some(n=>csCovers(c.code,localStorage.getItem(slotKey(n))||''))&&!csCovers(c.code,code)&&!bakKeep(c.code,'Cloud save kept before it was replaced')){CLD.err='No room to back up your cloud save, so it was not replaced.';return}
  csSetMark(t);return FBF.setDoc(csRef(),{code,day:S.day,artist:S.artist||'',t}).then(()=>{CLD.last=code;CLD.err='';return 1})})}).catch(csFail).finally(()=>{CLD.busy=0})}
setInterval(()=>csPush(),90000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)csPush()});
addEventListener('pagehide',()=>csPush());
if(FB_ON)fbLoad().catch(()=>{window.FW_AUTH_DONE=1});

/* v26.87: main menu shown when the site opens: Play, Settings, Google sign-in, profile in the top right.
   The world stays paused behind it; Save & quit in the pause menu comes back here. */
const TT={on:0,game:0};
/* v51.0.5: the in-game HUD (day, time, money, listeners, minimap) is hidden whenever the main menu is open, e.g. after Save and quit. TT.on drives a body class so every exit path is covered. */
{let on=0;Object.defineProperty(TT,'on',{get:()=>on,set(v){on=v;try{document.body.classList.toggle('ttitle',!!v)}catch(e){}},enumerable:true});const st=document.createElement('style');st.textContent='body.ttitle #hud,body.ttitle #swhud,body.ttitle #mpb,body.ttitle #ntags{display:none!important}';document.head.appendChild(st)}
function titleMsg(){try{const m=sessionStorage.getItem('fw_msg');if(m){sessionStorage.removeItem('fw_msg');say(m)}}catch(e){}}
function titleOpen(){titleMsg();TT.on=1;mode='title';PAUSED=1;for(const k in keys)delete keys[k];MU.hold=1;try{const a=MU.a[MU.cur];if(MU.pl&&a)a.pause()}catch(e){}pauseOverlay(1);menuMusic(1);titleUI()}
function titleUI(){if(!TT.on)return;const busy=FBU&&!CLD.ok&&!CLD.err,nm=FBU?(FBU.displayName||FBU.email||'Player'):'';
 const NI='<i class=ttni aria-label="Not signed in"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 21c0-4.6 3.8-7.5 8.5-7.5s8.5 2.9 8.5 7.5z"/></svg></i>';
 const pf=FBU?`<div class=ttpf title="${esc(nm)}">${fwPhoto()?`<img src="${esc(fwPhoto())}" referrerpolicy=no-referrer alt="Your profile picture" onerror="this.outerHTML=${esc(JSON.stringify(NI))}">`:NI}</div>`:`<div class=ttpf>${NI}</div>`;
 $('ui').innerHTML=`<div id=ttl>${FB_ON?pf:''}<div class=ttm><h1>WAVEFERN</h1><div class=px>Music Career Sim</div><div class=ttbx>
  <button class=go onclick="ttWorlds()" ${busy?'disabled':''}>${busy?'Loading your save…':'Play'}</button>
  <button onclick="ttSet()">Settings</button><button onclick="ttWiki()">Wiki</button><button onclick="ttLink('newsletter')">Newsletter</button>${FBU?`<button onclick="fbSignOutAsk()" ${busy?'disabled':''}>Sign out${FBU.providerData&&FBU.providerData.some(x=>x.providerId=='google.com')?' of Google':''}</button>`:''}${FB_ON&&!FBU&&FBP?`<button class=go onclick="CLD.pre='title';fbEmailOpen('verify')">Confirm your email</button><p class=m><small>${esc(FBP.email||'')} is waiting to be confirmed.</small></p>`:''}${FB_ON&&!FBU&&!FBP?`<button onclick="fbSignInAsk()">${FB_EMAIL?'Sign in':'Sign in with Google'}</button><p class=m><small>Sign in to keep your game in the cloud and play on any device.</small></p>`:''}</div></div><div class=ttft>${typeof GAME_VERSION!='undefined'?fwShowVer(GAME_VERSION)+' · ':''}Fictional game · <a href="privacy/" target="_blank" rel="noopener">Privacy</a> · <a href="terms/" target="_blank" rel="noopener">Terms</a> · <a href="legal/" target="_blank" rel="noopener">Legal</a> · <a href="#" onclick="ttLink('contact');return false">Contact</a> · <a href="https://buymeacoffee.com/wavefern" target="_blank" rel="noopener">Buy me a coffee</a></div></div>`}
/* Main menu Newsletter button + footer Contact link: both open a page of this site in a new tab. Live for everyone since v56.0.0. */
const WF_LINKS={newsletter:'newsletter/',contact:'wiki/contact/'};
function ttLink(k){snd('click');const v=WF_LINKS[k];const w=window.open(v,'_blank');if(w)w.opener=null;else location.href=v}
/* v47.3.0: the Wiki button opens the game wiki (wiki/) in a new tab, so the game stays where it is */
function ttWiki(){snd('click');const w=window.open('wiki/','_blank');if(w)w.opener=null;else location.href='wiki/'}
function ttPlay(){if(FBU&&!CLD.ok&&!CLD.err)return;snd('click');TT.on=0;TT.sel=0;pauseOverlay(0);menuMusic(0);PAUSED=0;PS='';MU.hold=0;try{const a=MU.a[MU.cur];if(MU.pl&&a&&a.paused)a.play().catch(()=>{})}catch(e){}
 if(TT.game){mode='play';$('ui').innerHTML=''}else{mode='creator';creatorUI()}}
/* v26.125: career select (two slots, Minecraft style). Switching slot reloads the page into the chosen career so no state leaks between them.
   Cloud save stays one doc per account and follows the active career. */
function ttWorlds(){if(FBU&&!CLD.ok&&!CLD.err)return;snd('click');TT.sel=1;const a=curSlot(),rows=[],free=[];
 for(let n=1;n<=SLOTS;n++){const i=n==a?(TT.game?{artist:S.artist||'',day:S.day||0}:null):slotInfo(n);if(!i)free.push(n);
  rows.push(i?`<div class="ttsl${n==a?' on':''}" data-slot=${n} draggable=true><div><b>${esc(i.artist||'Unnamed artist')}</b><small>Career ${n} · Day ${i.day||1}${n==a?' · last played':''}</small></div><button class=go onclick="ttSlot(${n})">Play</button><button class=ttdel title="Delete this career" aria-label="Delete career ${n}" onclick="ttDel(${n})">✕</button></div>`
   :`<div class="ttsl empty" data-slot=${n} draggable=true><div><b>Empty slot</b><small>Career ${n}</small></div></div>`)}
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
/* v55.21.0: drag a career onto another slot to swap them (an empty slot just takes the career). Drags carry 'slot:N'; backups carry a bare number. */
document.addEventListener('dragstart',e=>{const s=e.target.closest&&e.target.closest('#ttl .ttsl[data-slot]');if(s){try{e.dataTransfer.setData('text/plain','slot:'+s.dataset.slot);e.dataTransfer.effectAllowed='move'}catch(x){}return}const r=e.target.closest&&e.target.closest('#ttl .ttbk');if(r){try{e.dataTransfer.setData('text/plain',r.dataset.bak);e.dataTransfer.effectAllowed='move'}catch(x){}}});
document.addEventListener('dragover',e=>{const r=e.target.closest&&e.target.closest('#ttl .ttsl[data-slot]');if(r){e.preventDefault();r.classList.add('drop')}});
document.addEventListener('dragleave',e=>{const r=e.target.closest&&e.target.closest('#ttl .ttsl[data-slot]');if(r)r.classList.remove('drop')});
document.addEventListener('drop',e=>{const r=e.target.closest&&e.target.closest('#ttl .ttsl[data-slot]');if(!r)return;e.preventDefault();r.classList.remove('drop');let v='';try{v=e.dataTransfer.getData('text/plain')}catch(x){}if(/^slot:/.test(v))return ttSwap(+v.slice(5),+r.dataset.slot);const n=+v;if(n)ttRecAsk(n,+r.dataset.slot)});
/* v55.21.0: swap two career slots. The save keys move with the slot, the active pointer follows its career, then the slot list redraws (v55.21.8: no page reload; the loaded career follows its save key and keeps saving to it). */
function ttSwap(a,b){if(!a||!b||a==b)return;snd('click');if(TT.game)autoSave();
 try{const ka=slotKey(a),kb=slotKey(b),va=localStorage.getItem(ka),vb=localStorage.getItem(kb);
  if(vb)localStorage.setItem(ka,vb);else localStorage.removeItem(ka);
  if(va)localStorage.setItem(kb,va);else localStorage.removeItem(kb);
  const c=curSlot();if(c==a)localStorage.setItem(SLOT_K,b);else if(c==b)localStorage.setItem(SLOT_K,a);
  if(TT.game){if(BOOT_SLOT==a)BOOT_SLOT=b;else if(BOOT_SLOT==b)BOOT_SLOT=a}
  if(FBU)localStorage.setItem(CS_KEY,JSON.stringify({uid:FBU.uid,t:CLD.t}))}catch(e){return}
 ttWorlds()}
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
 if(FBU&&CLD.ok)csPush(1).then(r=>say(r?'Saved to your Google account':CLD.err||'Saved on this device'));else say(FBU&&CLD.err?CLD.err:'Saved on this device');
 PS='';titleOpen()}
{const cs0=closeSet;closeSet=function(){cs0();if(mode=='title')titleUI()}
 const lc=loadCode;loadCode=function(c){const t=TT.on;lc(c);if(t&&mode=='play'){TT.game=1;titleOpen()}}
 const cf0=confirmChar;confirmChar=function(){TT.game=1;const r=cf0.apply(this,arguments);try{autoSave()}catch(e){}return r}}

const NEUTRAL_ICON='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 21c0-4.6 3.8-7.5 8.5-7.5s8.5 2.9 8.5 7.5z"/></svg>';
/* pause menu: Save & quit, plus the Google profile picture */
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(!m)return;const q=document.createElement('button');q.textContent='Save and quit';q.onclick=saveQuit;m.appendChild(q);
 if(!FB_ON||!FBU)return;const h=m.querySelector('h2'),av=document.createElement('div');av.className='pzav';
 if(fwPhoto()){const im=document.createElement('img');im.src=fwPhoto();im.referrerPolicy='no-referrer';im.alt='Your Google profile picture';im.onerror=()=>{av.innerHTML=NEUTRAL_ICON};av.appendChild(im)}else av.innerHTML=NEUTRAL_ICON;
 if(h)h.before(av);};
 const pg=pauseGame;pauseGame=function(){pg();csPush()}}
/* browsers block sound until the first click, so start the menu music then */
addEventListener('pointerdown',()=>{if(TT.on&&MENUA&&MENUA.paused)MENUA.play().catch(()=>{})},{capture:true});

/* v49.64.0: no cloud save reads while the game is paused. Entering the pause does one last sync, then the 90 second timer and tab-hidden syncs stay quiet until you resume. */
{const c0=csPush;let pz=0;csPush=function(force){if(typeof PAUSED!='undefined'&&PAUSED&&!force){if(pz)return Promise.resolve();pz=1}else pz=0;return c0.apply(this,arguments)}}

/* v52 custom picture: an animated GIF cannot be shown as a profile picture, so when the Google photo is a GIF the player is asked to
   upload one instead. The picture is cropped to 128x128 and saved as a JPEG data URL on profiles/{uid}.pfp (firebase-rules allow it,
   24000 characters at most) and cached in localStorage fw_pfp_{uid}. fwPhoto() is the one helper every display path reads.
   "Later" asks again in the next session. */
const PFP_MAX=24000,PFP_C={},PFP_ASK={};
function fwIsGif(u){u=String(u||'');if(!u)return Promise.resolve(false);if(u in PFP_C)return Promise.resolve(PFP_C[u]);
 /* v55.21.8: Google serves resized photos as a still frame, so also look at the original (=s0) and the animated (-rw) versions. */
 const byName=()=>/\.gif([?#]|$)/i.test(u);
 const sig=b=>{const a=new Uint8Array(b,0,Math.min(32,b.byteLength)),t=String.fromCharCode.apply(null,a.subarray(0,6));
  if(t=='GIF87a'||t=='GIF89a')return true;
  if(String.fromCharCode.apply(null,a.subarray(0,4))=='RIFF'&&String.fromCharCode.apply(null,a.subarray(8,12))=='WEBP'){const f=String.fromCharCode.apply(null,a.subarray(12,16));return f=='VP8X'&&!!(a[20]&2)}
  return false};
 const NOC='fw_gif_nocors';let off=0;try{off=localStorage.getItem(NOC)=='1'}catch(e){}
 if(off)return Promise.resolve(byName()).then(g=>(PFP_C[u]=!!g));/* v55.29.2: Google photos are served without CORS headers, so the byte check fails and the browser logs a console error each time; after one failure skip it and go by the file name */
 let bad=0;
 const look=x=>fetch(x,{credentials:'omit',referrerPolicy:'no-referrer'}).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(sig).catch(()=>{bad=1;return false});
 const alt=[];if(/=s\d+(-c)?$/.test(u)){alt.push(u.replace(/=s\d+(-c)?$/,'=s0'));alt.push(u.replace(/=s\d+(-c)?$/,'=s96-c-rw'))}
 return Promise.all([u].concat(alt).map(look)).then(r=>{if(bad)try{localStorage.setItem(NOC,'1')}catch(e){}return r.some(Boolean)||byName()}).catch(byName).then(g=>(PFP_C[u]=!!g))}
function fwCustomPfp(){try{const u=FBU&&FBU.uid;const v=u?localStorage.getItem('fw_pfp_'+u):'';return v&&v.indexOf('data:image/jpeg;base64,')==0?v:''}catch(e){return ''}}
function fwPhoto(){return FBU?(fwCustomPfp()||FBU.photoURL||''):''}
function fwPfpCache(v){try{if(FBU)localStorage.setItem('fw_pfp_'+FBU.uid,v)}catch(e){}}
function fwPfpPart(){const v=fwCustomPfp();return v?{pfp:v}:{}}
function fwPfpSave(v){const uid=FBU&&FBU.uid;if(!uid)return Promise.reject(new Error('Sign in first.'));
 try{localStorage.setItem('fw_pfp_'+uid,v)}catch(e){return Promise.reject(new Error('No room to save this picture.'))}
 if(!FBF||!FBD)return Promise.resolve();
 return FBF.setDoc(FBF.doc(FBD,'profiles',uid),{pfp:v},{merge:true}).catch(()=>{}).then(()=>{if(window.fwProfileSync)fwProfileSync(1)})}
function fwPfpResize(f){return new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();
 const done=(e,v)=>{URL.revokeObjectURL(u);e?rej(e):res(v)};
 im.onerror=()=>done(new Error('That file is not a picture.'));
 im.onload=()=>{try{const s=Math.min(im.naturalWidth,im.naturalHeight);if(!s)throw 0;const c=document.createElement('canvas');c.width=c.height=128;
   const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,128,128);x.drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,0,0,128,128);
   let v='';for(const q of [.8,.7,.6,.5]){v=c.toDataURL('image/jpeg',q);if(v.length<=PFP_MAX)break}
   v.length<=PFP_MAX?done(0,v):done(new Error('That picture is too detailed. Try a simpler one.'))}catch(e){done(new Error('That picture could not be used.'))}};
 im.src=u})}
function fwPfpShow(manual){if(document.getElementById('pfpq'))return;const d=document.createElement('div');d.id='pfpq';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000a';
 d.innerHTML=`<div class="box modal" style="width:min(420px,92vw)"><h2>Pick a profile picture</h2><p>${manual?'Upload your own picture to use instead of your Google one.':'Your Google profile picture is an animated GIF, which WaveFern cannot show. Upload a picture instead.'} It is cropped to a square and saved to your account.</p><p class=m id=pfpm></p><div class=row2><label class=go style="cursor:pointer">Upload picture<input type=file accept="image/*" id=pfpin style="display:none"></label><button id=pfpl>Later</button></div></div>`;
 document.body.appendChild(d);
 d.querySelector('#pfpl').onclick=()=>{try{sessionStorage.setItem('fw_pfp_later','1')}catch(e){}d.remove()};
 d.querySelector('#pfpin').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const m=d.querySelector('#pfpm');m.textContent='Saving...';
  fwPfpResize(f).then(v=>fwPfpSave(v)).then(()=>{d.remove();say('Your profile picture is saved');fbRedraw()},err=>{m.textContent=(err&&err.message)||'That picture could not be used.'})}}
function fwPfpPrompt(){try{if(!FB_ON||!FBU||!TT.on||fwCustomPfp()||!FBU.photoURL)return;const uid=FBU.uid;if(PFP_ASK[uid]||document.getElementById('pfpq'))return;
 try{if(sessionStorage.getItem('fw_pfp_later'))return}catch(e){}
 PFP_ASK[uid]=1;const u=FBU.photoURL;
 fwIsGif(u).then(g=>{if(g&&TT.on&&FBU&&FBU.uid==uid&&!fwCustomPfp())fwPfpShow()},()=>{})}catch(e){}}
{const pt0=titleUI;titleUI=function(){const r=pt0.apply(this,arguments);try{fwPfpPrompt()}catch(e){}return r}}
window.FW_PFP_isGif=fwIsGif;window.FW_PFP_show=fwPfpShow;
