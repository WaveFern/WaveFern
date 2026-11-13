/* ---------- v49.73.0: choose a username and a display name, with name rules ----------
   After the fresh start (12-reset.js), the first time an account signs in on this device with no username, or no display name chosen,
   one box asks for both. The username is the Friends username (f/n/HANDLE in the Realtime Database, see 161-multiplayer.js), so there
   is one flow. The display name is what friends and bandmates see next to it (it goes out as the presence name, frNm in 161-multiplayer.js).
   RULES, checked here and again by docs/security/database.rules.proposed.json (the game can be edited, the rules can not):
   - username: 3 to 16 of a-z 0-9 _ (at least one letter). Display name: 2 to 24 of A-Z a-z 0-9 space . _ ' - , no leading, trailing or
     double spaces, no run of 4 of the same character.
   - changes are limited: a username can be changed once every 30 days, a display name once every 7 days (stamps in f/u/{uid}: t, d).
   - impersonation is refused: names that contain or imitate WaveFern, admin, moderator, staff, official, support, founder, Big Vee or the makers,
     including look-alikes (0 for o, 1 for i, 3 for e, @ for a and so on, spaces and dots ignored).
   - offensive names are refused with a short list of slurs and strong swear words, also matched through look-alikes. No list catches everything.
   Kept per Google account on this device (fw_u_{uid}_dn). "Not now" asks again next time the game opens. */
(function(){
if(typeof FW_ACCT=='undefined'||typeof RS=='undefined')return;
const X=()=>window.FRX,FR_=()=>X()&&X().FR,DAY=864e5,U_CD=30*DAY,D_CD=7*DAY;
const DK=()=>'fw_u_'+FW_ACCT+'_dn',SK=()=>'fw_u_'+FW_ACCT+'_nct';
const dnGet=()=>{try{return FW_ACCT?String(localStorage.getItem(DK())||''):''}catch(e){return''}};
window.fwDisplayName=dnGet;
/* the chosen username (lower case, no @): from the database once Friends has loaded, else the copy remembered on this device */
const UK=()=>'fw_u_'+FW_ACCT+'_h';
const uCached=()=>{try{return FW_ACCT?String(localStorage.getItem(UK())||''):''}catch(e){return''}};
window.fwUsername=()=>{try{const F=FR_();return(F&&F.h)||uCached()}catch(e){return uCached()}};
/* ---- the rules ---- */
const SUB=['wavefern','admin','moderator','official','support','founder','bigvee','fuck','shit','cunt','nigg','fagg','rape','nazi','hitler','bitch','whore','retard','kike','chink'],
 EXACT=['mod','dev','owner','staff','system','james','rowan','ceo','team','wf','vee','server','bot'];
const LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a','$':'s','!':'i','|':'i','+':'t'};
const norm=v=>String(v||'').toLowerCase().replace(/[01345788@$!|+]/g,c=>LEET[c]||c).replace(/[^a-z]/g,'').replace(/(.)\1+/g,'$1');
function banned(v){const n=norm(v);if(!n)return false;if(EXACT.includes(n))return true;const n2=n.replace(/(.)\1+/g,'$1');return SUB.some(w=>{const x=w.replace(/(.)\1+/g,'$1');return n2.includes(x)})}
window.fwNameCheck=(kind,v)=>{v=String(v||'');
 if(kind=='u'){if(!/^[a-z0-9_]{3,16}$/.test(v))return'A username has 3 to 16 letters, numbers or _ (lower case).';if(!/[a-z]/.test(v))return'A username needs at least one letter.'}
 else{if(v.length<2||v.length>24)return'A display name has 2 to 24 characters.';if(!/^[A-Za-z0-9 ._'-]+$/.test(v))return'A display name can use letters, numbers, spaces and . _ \' - only.';if(v!==v.trim()||/ {2}/.test(v))return'No spaces at the start or end, and no double spaces.';if(/(.)\1{3}/.test(v))return'No more than 3 of the same character in a row.';if(!/[A-Za-z0-9]/.test(v))return'Use at least one letter or number.'}
 if(banned(v))return'That name is not allowed. Pick another.';return''};
/* what goes out as the presence name when no display name was chosen: the artist name, made safe */
window.fwNameSafe=a=>{let v=String(a||'').replace(/[^A-Za-z0-9 ._'-]/g,'').replace(/ +/g,' ').trim().replace(/(.)\1{3,}/g,'$1$1$1').slice(0,24).trim();return v.length>=2&&!banned(v)?v:'Player'};
const clean=v=>String(v||'').replace(/ +/g,' ').trim();
/* ---- change stamps: the database copy (f/u/{uid}) and a local copy ---- */
const stLocal=()=>{try{return JSON.parse(localStorage.getItem(SK()))||{}}catch(e){return{}}};
async function stamps(){const s=stLocal();return{t:+s.t||0,d:+s.d||0}}
const when=t=>new Date(t).toLocaleDateString([],{dateStyle:'medium'});
let shown=0,later=0;
async function box(){const F={h:window.fwUsername()},st=await stamps(),now=Date.now(),hasU=!!F.h,hasD=!!dnGet(),canU=!hasU||now-st.t>U_CD,canD=!hasD||now-st.d>D_CD;
 if(document.getElementById('onbx'))return;
 const o=document.createElement('div');o.id='onbx';o.style.cssText='position:fixed;inset:0;z-index:99990;background:#000d;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box';
 const first=!hasU||!hasD;
 o.innerHTML=`<div class="box modal" style="width:min(430px,94vw)"><small style="font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:var(--g)">${first?'WELCOME TO THE FRESH START':'YOUR NAME'}</small><h2 style="margin:4px 0 8px">${first?'Choose how you appear':'Change your name'}</h2>
<p class=m>${hasU?'':'<b>Pick a username to finish setting up your account.</b> '}This is how friends and bandmates find and see you. Keep your real name out of it. Names that copy WaveFern, staff or someone else, or that are offensive, are refused.</p>
<label class=m style="display:block;margin-top:8px">Username</label><input id=onbu maxlength=16 autocomplete=off spellcheck=false placeholder="3 to 16 letters, numbers or _" value="${esc(F.h||'')}" ${canU?'':'disabled'} style="width:100%;box-sizing:border-box">
<p class=m style="margin:2px 0 0"><small>${canU?(hasU?'You can change it once every 30 days.':'Choose carefully: you can change it only once every 30 days.'):'You can change your username again on '+when(st.t+U_CD)+'.'}</small></p>
<label class=m style="display:block;margin-top:8px">Display name</label><input id=onbd maxlength=24 autocomplete=off placeholder="Shown next to your username" value="${esc(dnGet())}" ${canD?'':'disabled'} style="width:100%;box-sizing:border-box">
<p class=m style="margin:2px 0 0"><small>${canD?'Letters, numbers, spaces and . _ \' - . You can change it once every 7 days.':'You can change your display name again on '+when(st.d+D_CD)+'.'}</small></p>
<p id=onbm class=m style="min-height:18px;color:#ff9a9a"></p>
<div class=row2><button class=go id=onbs ${canU||canD?'':'disabled'}>Save</button>${hasU?`<button id=onbl>${first?'Not now':'Close'}</button>`:''}</div></div>`;
 document.body.appendChild(o);const m=o.querySelector('#onbm'),u=o.querySelector('#onbu'),d=o.querySelector('#onbd'),s=o.querySelector('#onbs');
 const close=()=>{o.remove();shown=0};
 const lb=o.querySelector('#onbl');if(lb)lb.onclick=()=>{if(first)later=1;close()};
 s.onclick=async()=>{const h=u.value.trim().replace(/^@/,'').toLowerCase(),dn=clean(d.value);
  const chU=canU&&h!==(F.h||''),chD=canD&&dn!==dnGet();
  if(!hasU&&!h){m.textContent='Choose a username.';return}if(!hasD&&!dn){m.textContent='Choose a display name.';return}
  let e='';if(chU)e=fwNameCheck('u',h);if(!e&&chD)e=fwNameCheck('d',dn);if(e){m.textContent=e;snd('err');return}
  if(!chU&&!chD){close();return}
  s.disabled=true;m.style.color='';m.textContent='Checking…';
  try{const uid=FBU.uid;
   if(chU){const x=await FBF.getDoc(FBF.doc(FBD,'usernames',h));if(x.exists()&&x.data().uid!==uid){m.style.color='#ff9a9a';m.textContent='@'+h+' is taken. Try another.';s.disabled=false;return}}
   const nh=chU?h:F.h,nd=chD?dn:dnGet();
   if(chU)await fsClaim(nh,F.h||'');
   try{localStorage.setItem(UK(),nh)}catch(e5){}
   const L=stLocal();if(chU)L.t=Date.now();if(chD||(!hasU&&canD))L.d=Date.now();try{localStorage.setItem(SK(),JSON.stringify(L));if(nd)localStorage.setItem(DK(),nd)}catch(e2){}
   NM.st='ok';rtMirror(nh,nd,chU,chD||(!hasU&&canD));try{if(window.fwProfileSync)fwProfileSync(1)}catch(e5){}
   close();try{snd('chime');say('Saved: '+(nd?nd+' ':'')+'(@'+nh+')')}catch(e3){}}
  catch(e4){console.warn('[names]',e4);dlog('save failed: '+errTxt(e4));m.style.color='#ff9a9a';s.disabled=false;
   m.textContent=e4&&e4.code=='permission-denied'?'The server refused that. The Firestore rules need publishing (permission denied).':'Could not save that ('+errTxt(e4)+'). Try again.';snd('err')}};
 (!hasU?u:d).focus()}
window.fwNameBox=()=>{if(shown)return;if(document.getElementById('onbx'))return;if(typeof FBU=='undefined'||!FBU||typeof FBF=='undefined'||!FBF)return;shown=1;box().catch(()=>{shown=0})};
/* ---- username gate (v49.80.7): Firestore only. The Realtime Database is no longer needed to know or choose a username.
   profiles/{uid}.h holds the chosen name; usernames/{name} = {uid,t} reserves it (created in the same batch, so a taken name fails: see firebase-rules/live/firestore.rules).
   Never blocks play: a failed check shows a small notice with Details and a Copy button, and retries by itself. ---- */
const NM={st:'idle',busy:0,at:0,log:[],err:''};
const errWhy=e=>{const c=String(e&&e.code||'').replace('firestore/',''),m=String(e&&e.message||e||'');
 if(c=='permission-denied')return'Firestore refused the read (permission denied). The Firestore rules in firebase-rules/v51.3.0/firestore.rules need publishing (Firebase console > Firestore Database > Rules > Publish) in the waveferndata project.';
 if(c=='unauthenticated')return'Google sign-in has expired on this device. Sign out and sign in again.';
 if(c=='unavailable'||/offline|no answer|network/i.test(m))return'Could not reach Firestore (blocked by a browser extension or network, or the database is not created in waveferndata). Try another browser or turn off ad blockers for this site.';
 if(c=='not-found'||/database.*(not exist|not found)/i.test(m))return'The Firestore database does not exist in the waveferndata project. Create it in the Firebase console > Firestore Database.';
 return'';};
const errTxt=e=>String(e&&(e.code?e.code+': ':'')+(e&&e.message||e||'')).slice(0,200);
function dlog(t){NM.log.push(new Date().toISOString().slice(11,19)+' '+t);if(NM.log.length>16)NM.log.shift();try{console.info('[names]',t)}catch(e){}}
function diag(){const F=FR_()||{};let h='';try{h=new URL(FB_CFG.databaseURL).host}catch(e){}
 return ['WaveFern '+(typeof GAME_VERSION!='undefined'?GAME_VERSION:'?'),'state: '+NM.st,'signed in: '+(typeof FBU!='undefined'&&FBU?'yes uid '+FBU.uid:'NO'),'project: '+FB_CFG.projectId,'database host: '+h,
  'friends database: '+(F.ok?'connected':'not connected'+(F.rerr?' ('+F.rerr+')':'')),'cached username: '+(uCached()||'none'),'online: '+navigator.onLine,'---'].concat(NM.log).join('\n')}
async function fsClaim(nh,old){const uid=FBU.uid,F=FBF,b=F.writeBatch(FBD),now=Date.now();let bio='';
 try{const x=await F.getDoc(F.doc(FBD,'profiles',uid));if(x.exists()&&typeof x.data().bio=='string')bio=x.data().bio.slice(0,160)}catch(e){}
 b.set(F.doc(FBD,'usernames',nh),{uid,t:now});if(old&&old!==nh)b.delete(F.doc(FBD,'usernames',old));
 const cl=(v,m)=>Math.max(0,Math.min(m,Math.floor(+v||0)));let fl=0;try{fl=fameLevel()}catch(e){}
 const a=String((typeof S=='object'&&S&&S.artist)||'Player').replace(/[<>"]/g,'').slice(0,24)||'Player';
 b.set(F.doc(FBD,'profiles',uid),{a,h:nh,bio,fame:cl(fl,1000),lis:cl(typeof S=='object'&&S&&S.listeners,1e12),t:now});
 dlog('saving @'+nh);await b.commit();dlog('saved @'+nh)}
/* copy to the Realtime Database for Friends, best effort only */
function rtMirror(nh,nd,chU,chD){try{const x=X(),F=x&&x.FR;if(!F||!F.ok||!F.r)return;const{R,db,uid}=F.r,ts=R.serverTimestamp(),up={['f/p/'+uid]:{h:nh,nm:nd||fwNameSafe((typeof S=='object'&&S&&S.artist)||''),o:1,rm:'',t:ts}},stp={};
 if(chU){up['f/n/'+nh]=uid;if(F.h&&F.h!==nh)up['f/n/'+F.h]=null;stp['f/u/'+uid+'/t']=ts}if(chD)stp['f/u/'+uid+'/d']=ts;
 R.update(R.ref(db),Object.assign({},up,stp)).catch(()=>{/* v49.94.8: a refused display name (stamp used this week) must not stop the username and presence from saving: retry without nm */const pv=Object.assign({},up['f/p/'+uid]);delete pv.nm;return R.update(R.ref(db),{['f/p/'+uid]:pv})}).then(()=>{F.h=nh;F.pk='';F.od=0;x.frPresence()},e=>console.warn('[names] friends copy',e&&e.code))}catch(e){}}
function fsCheck(){if(NM.busy)return;if(typeof FBU=='undefined'||!FBU){NM.st='nouser';return}if(typeof FBF=='undefined'||!FBF||typeof FBD=='undefined'||!FBD){NM.st='nouser';return}
 NM.busy=1;NM.at=Date.now();const uid=FBU.uid;dlog('reading profile of '+uid.slice(0,6)+'… in '+FB_CFG.projectId);
 FBU.getIdToken().then(()=>dlog('login token ok'),e=>dlog('login token FAILED '+errTxt(e)));
 Promise.race([FBF.getDoc(FBF.doc(FBD,'profiles',uid)),new Promise((_,j)=>setTimeout(()=>j(new Error('no answer in 15 seconds')),15000))]).then(d=>{
  const h=d.exists()&&d.data()&&d.data().h;
  if(typeof h=='string'&&/^[a-z0-9_]{3,16}$/.test(h)){NM.st='ok';dlog('username is @'+h);try{localStorage.setItem(UK(),h)}catch(e){}const e=document.getElementById('onbe');if(e)e.remove();
   /* a profile written before usernames/ existed: reserve its name now (ignored if the rules are not published yet) */
   return FBF.getDoc(FBF.doc(FBD,'usernames',h)).then(r=>{if(!r.exists())return fsClaim(h,'')}).catch(e=>dlog('reserve check skipped: '+errTxt(e)))}
  const F=FR_();if(F&&F.h&&/^[a-z0-9_]{3,16}$/.test(F.h)){dlog('moving @'+F.h+' from Friends');return fsClaim(F.h,'').then(()=>{NM.st='ok';try{localStorage.setItem(UK(),F.h)}catch(e){}},e=>{NM.st='need';dlog('move failed '+errTxt(e))})}
  NM.st='need';dlog('no username on this account yet')
 }).catch(e=>{NM.st='err';NM.err=(errWhy(e)?errWhy(e)+' ':'')+errTxt(e);dlog('profile read failed: '+NM.err)}).finally(()=>{NM.busy=0})}
let eDis=0;
function errBox(why){if(document.getElementById('onbe')||document.getElementById('onbx')||Date.now()-eDis<300000)return;const o=document.createElement('div');o.id='onbe';o.style.cssText='position:fixed;left:50%;bottom:calc(12px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:99991;max-width:calc(100% - 24px);width:420px;padding:8px 10px 8px 12px;background:var(--p);color:var(--t);border:2px solid var(--g);border-radius:8px;box-shadow:0 4px 18px rgba(0,0,0,.5);font-size:12px';
 o.innerHTML='<div style="display:flex;align-items:center;gap:8px"><span style="flex:1">Your username could not be checked yet. You can keep playing; this retries by itself.<br><small class=m>'+esc(why)+'</small></span><button class=go id=onre style="margin:0;padding:5px 10px">Retry</button><button id=onro title="Hide" style="margin:0;padding:5px 8px;background:none;border:none;color:var(--m)">✕</button></div><details style="margin-top:6px"><summary class=m>Details</summary><pre id=ondt style="white-space:pre-wrap;word-break:break-all;font-size:10px;max-height:140px;overflow:auto;margin:4px 0"></pre><button id=oncp style="margin:0;padding:4px 10px">Copy details</button></details>';
 document.body.appendChild(o);const pre=o.querySelector('#ondt'),fill=()=>{pre.textContent=diag()};fill();o.querySelector('details').addEventListener('toggle',fill);
 o.querySelector('#oncp').onclick=()=>{fill();const t=diag();try{navigator.clipboard.writeText(t).then(()=>say('Details copied.'),()=>{pre.focus()})}catch(e){const r=document.createRange();r.selectNodeContents(pre);const g=getSelection();g.removeAllRanges();g.addRange(r)}};
 o.querySelector('#onre').onclick=()=>{o.remove();NM.st='idle';NM.busy=0;dlog('retry pressed');const x=X();if(x){x.FR.rerr='';x.FR.on=0;x.frStart()}};
 o.querySelector('#onro').onclick=()=>{o.remove();eDis=Date.now()}}
setInterval(()=>{try{if(shown||later||!FW_ACCT||FW_TRL)return;const x=X();if(x&&!x.trailer&&!x.FR.on)x.frStart();
 if(!['title','creator','play','pause'].includes(mode))return;
 if(uCached()){NM.st='ok';return}
 if(NM.st=='idle'||NM.st=='nouser'||NM.st=='err'&&Date.now()-NM.at>20000)fsCheck();
 if(NM.st=='need'){if(document.getElementById('annov'))return;fwNameBox();return}
 if(NM.st=='nouser'&&Date.now()-NM.at>0&&typeof FBU!='undefined'&&!FBU){if(!NM.t1)NM.t1=Date.now();if(Date.now()-NM.t1>20000)errBox('You are not signed in with Google on this device. Sign out and sign in again.')}
 if(NM.st=='err')errBox(NM.err)}catch(e){}},1000);
/* Friends is only started when needed; start it as soon as someone is signed in after the reset so this can run */
})();
