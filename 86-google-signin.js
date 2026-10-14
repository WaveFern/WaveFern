/* ---------- v26.83: optional Google sign-in (Firebase Auth) ----------
   Paste the web app config from the Firebase console (Project settings > Your apps) into FB_CFG.
   While apiKey is still the placeholder, nothing loads and the pause menu shows no sign-in button.
   Sign-in is optional: saves stay in this browser (fw_save) exactly as before. */
const FB_CFG={
 apiKey:'PASTE_API_KEY',
 authDomain:'PASTE_PROJECT_ID.firebaseapp.com',
 projectId:'PASTE_PROJECT_ID',
 storageBucket:'PASTE_PROJECT_ID.appspot.com',
 messagingSenderId:'PASTE_SENDER_ID',
 appId:'PASTE_APP_ID'
};
const FB_V='10.12.2',FB_ON=!/^PASTE_/.test(FB_CFG.apiKey);
let FBU=null,FBA=null,FBM=null;
function fbLoad(){if(!FB_ON)return Promise.reject('off');if(FBA)return Promise.resolve();
 const u='https://www.gstatic.com/firebasejs/'+FB_V+'/firebase-';
 return Promise.all([import(u+'app.js'),import(u+'auth.js')]).then(([a,m])=>{FBM=m;FBA=m.getAuth(a.initializeApp(FB_CFG));
  m.onAuthStateChanged(FBA,usr=>{FBU=usr;if(mode=='pause')pauseUI()});return m.getRedirectResult(FBA).catch(()=>{})})}
function fbSignIn(){snd('click');fbLoad().then(()=>{const p=new FBM.GoogleAuthProvider();
 return FBM.signInWithPopup(FBA,p).then(r=>say('Signed in as '+(r.user.displayName||r.user.email)),e=>{
  if(e&&(e.code=='auth/popup-blocked'||e.code=='auth/operation-not-supported-in-this-environment'))return FBM.signInWithRedirect(FBA,p);
  if(e&&(e.code=='auth/popup-closed-by-user'||e.code=='auth/cancelled-popup-request'))return;
  throw e})}).catch(e=>{snd('err');say(e&&e.code=='auth/unauthorized-domain'?'Sign-in is not allowed on this website yet.':'Could not sign in. Try again.')})}
function fbSignOut(){if(!FBA)return;snd('click');FBM.signOut(FBA).then(()=>say('Signed out'))}
if(FB_ON)fbLoad().catch(()=>{});
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(!m||!FB_ON)return;const d=document.createElement('div');d.className='fbg';
 if(FBU){const n=document.createElement('p');n.className='m';n.innerHTML='<small>Signed in as <b></b></small>';n.querySelector('b').textContent=FBU.displayName||FBU.email||'Google user';
  const b=document.createElement('button');b.textContent='Sign out';b.onclick=fbSignOut;d.append(n,b)}
 else{const b=document.createElement('button');b.textContent='🔑 Sign in with Google';b.onclick=fbSignIn;d.appendChild(b)}
 m.appendChild(d)}}
