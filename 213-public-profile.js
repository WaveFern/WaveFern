/* ---------- v49.80.0: public profile, tied to the username chosen in 208-onboarding.js ----------
   The username is reserved in the Realtime Database (f/n/HANDLE = uid, one owner per name, enforced by the rules) and the same name is copied to the
   public profile in Firestore (profiles/{uid}: a artist name, h username, bio, fame, lis listeners, t). Any signed-in player can open a profile by username;
   only the owner writes theirs. Open one with fwProfileOpen('name') (Friends has a Profile button). */
(function(){
if(typeof FW_ACCT=='undefined'||!FW_ACCT||typeof FW_TRL!='undefined'&&FW_TRL)return;
const cl=(v,m)=>Math.max(0,Math.min(m,Math.floor(+v||0)));
const live=()=>typeof FBU!='undefined'&&FBU&&typeof FBF!='undefined'&&FBF&&typeof FBD!='undefined'&&FBD;
let lastSig='',lastAt=0,busy=0;
window.fwProfileSync=function(force){try{
 const h=typeof fwUsername=='function'?fwUsername():'';if(busy||!live()||!h||typeof S!='object'||!S||!S.artist||mode=='creator')return Promise.resolve(0);
 const a=String((typeof fwDisplayName=='function'&&fwDisplayName())||S.artist).replace(/[<>"]/g,'').slice(0,24);if(!a)return Promise.resolve(0);
 const d={a,h,bio:'',fame:cl((()=>{try{return fameLevel()}catch(e){return 0}})(),1000),lis:cl(S.listeners,1e12)},sig=JSON.stringify(d)+FBU.uid,n=Date.now();
 if(!force&&sig==lastSig&&n-lastAt<900000)return Promise.resolve(0);busy=1;
 return FBF.getDoc(FBF.doc(FBD,'profiles',FBU.uid)).then(x=>{if(x.exists()&&typeof x.data().bio=='string')d.bio=x.data().bio.slice(0,160)},()=>{})
  .then(()=>FBF.setDoc(FBF.doc(FBD,'profiles',FBU.uid),Object.assign(d,{t:Date.now()}))).then(()=>{lastSig=sig;lastAt=n;return 1},e=>{console.warn('[profile] write',e&&e.code);return 0}).finally(()=>{busy=0})}catch(e){return Promise.resolve(0)}};
setInterval(()=>{try{if(mode=='play'||mode=='pause')fwProfileSync()}catch(e){}},60000);
const num=n=>Math.round(+n||0).toLocaleString();
window.fwProfileOpen=async function(handle,byUid){
 handle=String(handle||'').replace(/^@/,'').toLowerCase();if(!byUid&&!/^[a-z0-9_]{3,16}$/.test(handle))return;
 const X=window.FRX,F=X&&X.FR;if(!F||!F.r||!live())return say('Profiles need you signed in and online.');
 document.getElementById('pubpf')?.remove();
 const o=document.createElement('div');o.id='pubpf';o.style.cssText='position:fixed;inset:0;z-index:9995;background:#000a;display:flex;align-items:center;justify-content:center;padding:12px';o.onclick=e=>{if(e.target===o)o.remove()};
 const box=h=>{o.innerHTML='<div class="box modal" style="width:min(380px,94vw)">'+h+'<div class=row2 style="margin-top:10px"><button onclick="document.getElementById(\'pubpf\').remove()">Close</button></div></div>'};
 box('<p class=m>Loading…</p>');document.body.appendChild(o);
 try{const{R,db}=F.r,uid=byUid||(await R.get(R.ref(db,'f/n/'+handle))).val();
  if(!uid){box('<h2>@'+esc(handle)+'</h2><p class=m>No player has that username.</p>');return}
  const d=await FBF.getDoc(FBF.doc(FBD,'profiles',uid)),p=d.exists()?d.data():null;
  if(!p){box('<h2>'+(handle?'@'+esc(handle):'Player')+'</h2><p class=m>This player has not opened the game since profiles started, so there is nothing to show yet.</p>');return}
  if(byUid&&p.h)handle=p.h;const me=uid==FBU.uid;
  box('<small class=m>PUBLIC PROFILE</small><h2 style="margin:2px 0">@'+esc(handle)+(me?' (you)':'')+'</h2><p style="margin:2px 0"><b>'+esc(p.a||'')+'</b></p><p class=m style="margin:6px 0">Fame level '+num(p.fame)+' · '+num(p.lis)+' monthly listeners</p>'+(p.bio?'<p>'+esc(p.bio)+'</p>':''))
 }catch(e){console.warn('[profile]',e);box('<h2>@'+esc(handle)+'</h2><p class=m>Could not load this profile.</p>')}};
})();
