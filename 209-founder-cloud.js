/* ---------- Founder list in the cloud ----------
   Why: a Founder claim lives in the browser (fw_legacy), so clearing site data or switching device would lose it.
   What: Firestore founders/{uid} = {a:artist, d:day, t:time, f:1 or 0 (optional, see below)}. Only the admin can write it (see docs/security/firestore.rules.proposed);
   a player can only read their own. Nobody can give themselves a Founder entry.
   1. fdSnapshot(): run ONCE by the admin (signed in with the admin Google account) BEFORE the fresh start, from the browser console.
      fdSnapshot() is a dry run: it reads every cloud save and says how many players would be listed. fdSnapshot(true) writes the list.
      It uses the same test as the fresh start (played to Day 2 or at least one song, not a trailer career; a career made after the first reset only counts if it already has S.fdr), and is safe to run again. Run it again BEFORE the second reset (RS.V=2) goes live, because the reset replaces each player's cloud save.
   2. Every Google player, on sign-in after the fresh start, reads their own founders/{uid}. If it exists, a Founder claim for that
      account is added to this device's Legacy store, and a career without Founder status is given it. Nothing else changes.
   Guest players (no Google account) cannot be listed server-side; their claim stays on their device. */
(function(){
if(typeof RS=='undefined'||typeof rsGet!='function'||typeof FB_ON=='undefined'||!FB_ON)return;
const ADMIN='wE6oPZIHYifrqBFxzpPse6ripGY2';const ADMINS=typeof ADMIN_UIDS!='undefined'?ADMIN_UIDS:[ADMIN];
const rd=()=>FBF&&FBD&&FBU;

/* v51.5.1: fdBackfill(write). Admin only. fdSnapshot lists only careers made before the fresh start, so a Founder whose cloud save is already a new career (or who was missed) has no founders/{uid} entry, and the rules then refuse their Founder flag on the leaderboard and profile.
   This reads every cloud save, and for each career that carries a Founder claim (S.fdr) or is an eligible old career it creates the missing founders/{uid} entry. Existing entries (including f:0 set by hand) are never changed.
   fdBackfill() is a dry run; fdBackfill(true) writes. */
window.fdBackfill=async function(write){
 if(!rd())return console.warn('Sign in with the admin Google account first.');
 if(!ADMINS.includes(FBU.uid))return console.warn('Only the admin account can do this.');
 const F=FBF,have=new Set();
 for(let last=null;;){const q=last?F.query(F.collection(FBD,'founders'),F.orderBy(F.documentId()),F.startAfter(last),F.limit(100)):F.query(F.collection(FBD,'founders'),F.orderBy(F.documentId()),F.limit(100));
  const s=await F.getDocs(q);if(s.empty)break;s.forEach(d=>have.add(d.id));last=s.docs[s.docs.length-1];if(s.size<100)break}
 const col=F.collection(FBD,'saves');let last=null,seen=0,add=[],listed=0;
 for(;;){
  const q=last?F.query(col,F.orderBy(F.documentId()),F.startAfter(last),F.limit(100)):F.query(col,F.orderBy(F.documentId()),F.limit(100));
  const s=await F.getDocs(q);if(s.empty)break;
  s.forEach(d=>{seen++;if(have.has(d.id)){listed++;return}const x=d.data();let st=null;try{st=rsStats(x.code)}catch(e){}if(!st)return;
   const claim=st.s&&st.s.fdr,old=!(st.rv>=RS.V)&&rsEligible(st,x.code);
   if(claim||old)add.push({uid:d.id,a:String((claim&&claim.a)||st.artist||'').slice(0,24),d:Math.min(9999,(claim?claim.d:st.day)|0)})});
  last=s.docs[s.docs.length-1];if(s.size<100)break}
 console.log('Cloud saves read: '+seen+'. Already listed: '+listed+'. Founders missing from the list: '+add.length+'.');
 if(!write){console.log('Dry run: nothing written. Run fdBackfill(true) to add them.');return{seen,listed,missing:add.length}}
 let n=0;for(let i=0;i<add.length;i+=400){const b=F.writeBatch(FBD);add.slice(i,i+400).forEach(e=>b.set(F.doc(FBD,'founders',e.uid),{a:e.a,d:e.d,t:Date.now()}));await b.commit();n+=Math.min(400,add.length-i)}
 console.log('Written: '+n+' Founder entries.');return{seen,listed,written:n}};

window.fdSnapshot=async function(write){
 if(!rd())return console.warn('Sign in with the admin Google account first.');
 if(!ADMINS.includes(FBU.uid))return console.warn('Only the admin account can do this.');
 const F=FBF,col=F.collection(FBD,'saves');let last=null,seen=0,elig=[],skipped=0;
 for(;;){
  const q=last?F.query(col,F.orderBy(F.documentId()),F.startAfter(last),F.limit(100)):F.query(col,F.orderBy(F.documentId()),F.limit(100));
  const s=await F.getDocs(q);if(s.empty)break;
  s.forEach(d=>{seen++;const x=d.data();let st=null;try{st=rsStats(x.code)}catch(e){}
   if(st&&!(st.rv>=RS.V)&&rsEligible(st,x.code))elig.push({uid:d.id,a:String((st.rv>=1&&st.s.fdr&&st.s.fdr.a)||st.artist||'').slice(0,24),d:Math.min(9999,(st.rv>=1&&st.s.fdr?st.s.fdr.d:st.day)|0)});else skipped++});
  last=s.docs[s.docs.length-1];if(s.size<100)break}
 console.log('Cloud saves read: '+seen+'. Founders to list: '+elig.length+'. Not eligible (already new, too new, or trailer): '+skipped+'.');
 if(!write){console.log('Dry run: nothing written. Run fdSnapshot(true) to write the list.');return{seen,founders:elig.length}}
 let n=0;for(let i=0;i<elig.length;i+=400){const b=F.writeBatch(FBD);elig.slice(i,i+400).forEach(e=>b.set(F.doc(FBD,'founders',e.uid),{a:e.a,d:e.d,t:Date.now()}));await b.commit();n+=Math.min(400,elig.length-i)}
 console.log('Written: '+n+' Founder entries.');return{seen,founders:n}};

/* v49.93.0: the founder flag. profiles/{uid}.founder (a number) is the main switch, and founders/{uid}.f works the same. The rest of this note is about founders/{uid}.f, which is a number: 1 = Founder, 0 = not a Founder. The admin edits it in the Firebase console
   (Firestore > founders > the player's uid > f). 1 grants Founder even to a player the list missed (create founders/{uid} with f = 1 if there is no
   entry yet), 0 takes it away and beats the local Founder logic. An entry with no f field still means Founder (old entries). */
let done='',doneAt=0;
const flag=f=>{const v=f&&f.f;return v===undefined||v===null?1:(v===true||+v===1)?1:0};
function apply(uid,f){
 const on=flag(f),explicit=f&&f.f!==undefined&&f.f!==null;
 if(FW_ACCT==uid)window.__fdOff=on?0:1;
 if(!on){try{if(typeof S=='object'&&S&&S.fdr&&FW_ACCT==uid){delete S.fdr;if(typeof founderSync=='function')founderSync(0);autoSave()}}catch(e){console.warn('founder list apply',e)}return}
 const v=rsGet(),id='fdl-'+uid;
 if(!v.e.some(e=>e.id==id)){v.e.push({id,scope:uid,slot:0,why:'Founder list',t:Date.now(),artist:String(f.a||'').slice(0,24),day:Math.min(9999,+f.d|0),money:0,followers:0,songs:0,bad:0,fd:1,used:0,code:''});rsPut(v)}
 try{if(typeof S=='object'&&S&&(explicit||S.rv>=RS.V)&&!S.fdr&&FW_ACCT==uid){S.fdr={v:1,a:String(f.a||S.artist||'').slice(0,24),d:Math.min(9999,+f.d|0),g:{}};if(typeof founderSync=='function')founderSync(true);autoSave()}}catch(e){console.warn('founder list apply',e)}}
function check(){
 if(!rd()||!rsOn()||FBU.isAnonymous)return;const uid=FBU.uid,k=uid+'|';
 if(done===k&&Date.now()-doneAt<600000)return;
 done=k;doneAt=Date.now();
 /* profiles/{uid}.founder (1 or 0, set by the admin) wins over founders/{uid}; with neither flag set, the old Founder logic is left alone */
 const g=(c)=>FBF.getDoc(FBF.doc(FBD,c,uid)).catch(e=>{if(!e||e.code!=='permission-denied')throw e;return null});
 Promise.all([g('founders'),g('profiles')]).then(([d,p])=>{
  const fd=d&&d.exists()?d.data():null,pf=p&&p.exists()?p.data().founder:undefined,has=pf===1||pf===0||pf===true||pf===false;
  if(has)apply(uid,Object.assign({a:(p.data().a||'')},fd||{},{f:+pf}));
  else if(fd)apply(uid,fd);else if(FW_ACCT==uid)window.__fdOff=0},()=>{done=''})}
setInterval(check,6000);setTimeout(check,2500);
})();
