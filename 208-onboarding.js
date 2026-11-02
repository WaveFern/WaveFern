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
async function stamps(){const s=stLocal();try{const F=FR_(),{R,db,uid}=F.r,v=(await R.get(R.ref(db,'f/u/'+uid))).val()||{};return{t:Math.max(+v.t||0,+s.t||0),d:Math.max(+v.d||0,+s.d||0)}}catch(e){return{t:+s.t||0,d:+s.d||0}}}
const when=t=>new Date(t).toLocaleDateString([],{dateStyle:'medium'});
let shown=0,later=0;
async function box(){const F=FR_(),st=await stamps(),now=Date.now(),hasU=!!F.h,hasD=!!dnGet(),canU=!hasU||now-st.t>U_CD,canD=!hasD||now-st.d>D_CD;
 if(document.getElementById('onbx'))return;
 const o=document.createElement('div');o.id='onbx';o.style.cssText='position:fixed;inset:0;z-index:99990;background:#000d;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box';
 const first=!hasU||!hasD;
 o.innerHTML=`<div class="box modal" style="width:min(430px,94vw)"><small style="font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:var(--g)">${first?'WELCOME TO THE FRESH START':'YOUR NAME'}</small><h2 style="margin:4px 0 8px">${first?'Choose how you appear':'Change your name'}</h2>
<p class=m>This is how friends and bandmates find and see you. Keep your real name out of it. Names that copy WaveFern, staff or someone else, or that are offensive, are refused.</p>
<label class=m style="display:block;margin-top:8px">Username</label><input id=onbu maxlength=16 autocomplete=off spellcheck=false placeholder="3 to 16 letters, numbers or _" value="${esc(F.h||'')}" ${canU?'':'disabled'} style="width:100%;box-sizing:border-box">
<p class=m style="margin:2px 0 0"><small>${canU?(hasU?'You can change it once every 30 days.':'Choose carefully: you can change it only once every 30 days.'):'You can change your username again on '+when(st.t+U_CD)+'.'}</small></p>
<label class=m style="display:block;margin-top:8px">Display name</label><input id=onbd maxlength=24 autocomplete=off placeholder="Shown next to your username" value="${esc(dnGet())}" ${canD?'':'disabled'} style="width:100%;box-sizing:border-box">
<p class=m style="margin:2px 0 0"><small>${canD?'Letters, numbers, spaces and . _ \' - . You can change it once every 7 days.':'You can change your display name again on '+when(st.d+D_CD)+'.'}</small></p>
<p id=onbm class=m style="min-height:18px;color:#ff9a9a"></p>
<div class=row2><button class=go id=onbs ${canU||canD?'':'disabled'}>Save</button><button id=onbl>${first?'Not now':'Close'}</button></div></div>`;
 document.body.appendChild(o);const m=o.querySelector('#onbm'),u=o.querySelector('#onbu'),d=o.querySelector('#onbd'),s=o.querySelector('#onbs');
 const close=()=>{o.remove();shown=0};
 o.querySelector('#onbl').onclick=()=>{if(first)later=1;close()};
 s.onclick=async()=>{const h=u.value.trim().replace(/^@/,'').toLowerCase(),dn=clean(d.value);
  const chU=canU&&h!==(F.h||''),chD=canD&&dn!==dnGet();
  if(!hasU&&!h){m.textContent='Choose a username.';return}if(!hasD&&!dn){m.textContent='Choose a display name.';return}
  let e='';if(chU)e=fwNameCheck('u',h);if(!e&&chD)e=fwNameCheck('d',dn);if(e){m.textContent=e;snd('err');return}
  if(!chU&&!chD){close();return}
  s.disabled=true;m.style.color='';m.textContent='Checking…';const{R,db,uid}=F.r,ts=R.serverTimestamp();
  try{if(chU){const x=await R.get(R.ref(db,'f/n/'+h));if(x.exists()&&x.val()!==uid){m.style.color='#ff9a9a';m.textContent='@'+h+' is taken. Try another.';s.disabled=false;return}}
   const nh=chU?h:F.h,nd=chD?dn:dnGet(),p={h:nh,nm:nd||fwNameSafe((typeof S=='object'&&S&&S.artist)||''),o:1,rm:'',t:ts},up={['f/p/'+uid]:p},stp={};
   if(chU){up['f/n/'+h]=uid;if(F.h)up['f/n/'+F.h]=null;stp['f/u/'+uid+'/t']=ts}
   if(chD)stp['f/u/'+uid+'/d']=ts;
   /* with the proposed rules the change stamps must go in the same write; with the older rules they are refused, so try again without them */
   try{await R.update(R.ref(db),Object.assign({},up,stp))}catch(e1){if(!/permission/i.test(String(e1&&(e1.code||e1.message)||e1)))throw e1;await R.update(R.ref(db),up)}
   const L=stLocal();if(chU)L.t=Date.now();if(chD)L.d=Date.now();try{localStorage.setItem(SK(),JSON.stringify(L));localStorage.setItem(DK(),nd)}catch(e2){}
   F.h=nh;F.pk='';F.od=0;X().frPresence();close();try{snd('chime');say('Saved: '+nd+' (@'+nh+')')}catch(e3){}}
  catch(e4){m.style.color='#ff9a9a';m.textContent='Could not save that. Try again later.';s.disabled=false;console.warn('[names]',e4)}};
 (!hasU?u:d).focus()}
window.fwNameBox=()=>{if(shown)return;const F=FR_();if(!F||!F.ok||!F.r)return;shown=1;box().catch(()=>{shown=0})};
setInterval(()=>{try{if(shown||later||!FW_ACCT||!X()||X().trailer||!rsOn()||FW_TRL)return;
 const F=FR_();if(!F.ok||!F.r)return;if(F.h&&dnGet())return;
 if(document.getElementById('annov')||!['title','play','pause'].includes(mode))return;
 fwNameBox()}catch(e){}},2500);
/* Friends is only started when needed; start it as soon as someone is signed in after the reset so this can run */
setInterval(()=>{try{if(FW_ACCT&&X()&&rsOn()&&!FR_().on&&!X().trailer)X().frStart()}catch(e){}},3000);
})();
