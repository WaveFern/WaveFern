/* ---------- save / load ---------- */
/* save codes: FW3- = current (see below); FW2- = LZW-packed JSON with ASCII-escaped text and base-46 digits (same data, roughly 40-70% shorter); FW1- = old base64 JSON, still loads */
const SC_A=Array.from({length:94},(_,i)=>String.fromCharCode(33+i)).filter(c=>c!='"'&&c!='\\');
function scPack(s,A=SC_A,B=46){s=s.replace(/[\u0080-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));const D=new Map(),o=[];let w='',nx=128;for(let i=0;i<s.length;i++){const c=s[i],wc=w+c;if(w&&D.has(wc)){w=wc;continue}if(w)o.push(w.length>1?D.get(w):w.charCodeAt(0));if(w)D.set(wc,nx++);w=c}if(w)o.push(w.length>1?D.get(w):w.charCodeAt(0));return o.map(n=>{let t='';do{const d=n%B;n=Math.floor(n/B);t=A[(t?B:0)+d]+t}while(n);return t}).join('')}
function scUnpack(t,A=SC_A,B=46){const C=[];let n=0;for(const ch of t){const v=A.indexOf(ch);if(v<0)throw new Error('bad character in save code: '+ch);n=n*B+v%B;if(v<B){C.push(n);n=0}}const T=[];let out='',p=null;for(const k of C){const cur=k<128?String.fromCharCode(k):k-128<T.length?T[k-128]:p+p[0];out+=cur;if(p!==null)T.push(p+cur[0]);p=cur}return out}
/* v26.145.2: FW3- = same packing with a 76-character alphabet (base 38) that leaves out the characters chat apps eat or change
   (Discord/WhatsApp markdown * _ ~ ` |, smart quotes/dashes/emoji ' - . < > & : @ #), so a code sent through a chat survives.
   scClean also undoes harmless copy damage: line breaks and spaces, smart quotes and dashes. */
const SC_C=SC_A.filter(c=>!"*_~`|'-.<>&:@#".includes(c)).slice(0,76);
function scClean(c){return String(c||'').replace(/[\s\u200b-\u200d\ufeff]+/g,'').replace(/[\u2018\u2019\u2032]/g,"'").replace(/\u2014/g,'--').replace(/\u2013/g,'-').replace(/\u2026/g,'...')}
function scDecode(c){c=scClean(c);const h=c.slice(0,4).toUpperCase();if(h=='FW3-')return JSON.parse(scUnpack(c.slice(4),SC_C,38));if(h=='FW2-')return JSON.parse(scUnpack(c.slice(4)));return JSON.parse(decodeURIComponent(escape(atob(c.slice(4)))))}
function saveCode(){return'FW3-'+scPack(JSON.stringify({S,ch,PL:PL.map(q=>({t:q.t,x:q.x,z:q.z,r:q.r})),VOL,FX}),SC_C,38)}
/* fresh-new-game defaults, snapshotted at boot (27-boot.js) before any save is applied */
let S0=null;function snapS(){S0=JSON.stringify(S)}
function resetState(){if(!S0)return;Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,JSON.parse(S0));rec=null;dr=null;hold=null}
/* v26.144.2: tolerant load. Missing/null fields fall back to new-game defaults, furniture of an unknown type is skipped, and a code that still fails is kept as a recoverable backup (fw_bak_N) instead of being lost */
function loadCode(c){let raw=c;try{c=scClean(c);if(c.toLowerCase()=='test'){cheat();return}if(!/^FW[123]-/i.test(c))throw new Error('not a WaveFern save code (should start with FW3-, FW2- or FW1-), starts with: '+c.slice(0,10));const d=scDecode(c);if(!d||typeof d!='object'||!d.S||typeof d.S!='object')throw new Error('no career data in code');resetState();const dflt=JSON.parse(S0||'{}');Object.assign(S,d.S);Object.keys(dflt).forEach(k=>{if(S[k]===null||S[k]===undefined)S[k]=JSON.parse(JSON.stringify(dflt[k]))});if(d.ch&&typeof d.ch=='object')ch=Object.assign({},ch,d.ch);PL.forEach(q=>scene.remove(q.m));PL=(Array.isArray(d.PL)?d.PL:[]).map(q=>{try{const m=mkF(q.t);m.position.set(q.x,0,q.z);m.rotation.y=q.r*Math.PI/2;scene.add(m);return{...q,m}}catch(e){console.warn('skipped furniture',q&&q.t,e);return null}}).filter(Boolean);buildStudio();refresh();parkCars();syncF();buildLots();syncArt();rec=null;dr=null;hold=null;clrGhost();SP='';mode='play';$('ui').innerHTML='';snd('chime');say('Loaded: Day '+S.day)}catch(e){console.error('Invalid save code:',e);try{if(typeof raw=='string'&&raw.length>200){for(let n=1;n<=SLOTS;n++)if(!localStorage.getItem('fw_bak_'+n)&&(n==1||localStorage.getItem('fw_bak_1')!==raw.trim())){localStorage.setItem('fw_bak_'+n,raw.trim());break}}}catch(x){}snd('err');say('Invalid save code.')}}

/* autosave: keeps the game in the browser so a refresh doesn't reset it */
let wiping=false;
/* v26.125: two career slots. fw_save_1 / fw_save_2 hold the careers, fw_slot is the active one. The old single fw_save moves into slot 1. */
/* v42.7.3: each Google account has its own career slots on this device (fw_u_{uid}_save_N, fw_u_{uid}_slot, fw_u_{uid}_cloud).
   Guests keep fw_save_N / fw_slot / fw_cloud. fw_acct is the account signed in here; signing in or out reloads into that set. */
const FW_ACCT=(()=>{try{return localStorage.getItem('fw_acct')||''}catch(e){return''}})();
const SAVE_PRE=FW_ACCT?'fw_u_'+FW_ACCT+'_':'fw_',SLOT_K=SAVE_PRE+'slot';
const SLOTS=2;
function curSlot(){try{const n=+localStorage.getItem(SLOT_K);return n==2?2:1}catch(e){return 1}}
const BOOT_SLOT=curSlot();
/* v26.139.2: a tab saves only to the slot it booted into, so a second tab on the other career can't overwrite it */
function slotKey(n){return SAVE_PRE+'save_'+(n||BOOT_SLOT)}
/* recovered backups are shared by every account on this device (fw_bak_1..12, label in fw_bakw_N), so a backup is never pushed out by another one */
const BK_MAX=12;
function bakKeep(code,why){if(!code)return true;try{let e=0;for(let k=1;k<=BK_MAX;k++){const b=localStorage.getItem('fw_bak_'+k);if(b===code)return true;if(!b&&!e)e=k}
 const k=e||BK_MAX;localStorage.setItem('fw_bak_'+k,code);localStorage.setItem('fw_bakw_'+k,why||'');return true}catch(e){return false}}
/* v49.24.8: the trailer page (wavefern.com/trailer, or ?trailer) never writes a career, a backup, the slot choice, the account or
   the cloud mark. Before this the save on closing or hiding the tab still ran there and put the trailer's career over the player's. */
const FW_TRL=!!(window.FW_TRAILER||/[?&]trailer\b/.test(location.search));
if(FW_TRL){const si=Storage.prototype.setItem,ri=Storage.prototype.removeItem,no=k=>/^fw_(u_.+?_)?(save|bak|bakw|slot|cloud|acct)/.test(String(k));
 Storage.prototype.setItem=function(k,v){if(this===localStorage&&no(k))return;return si.call(this,k,v)};
 Storage.prototype.removeItem=function(k){if(this===localStorage&&no(k))return;return ri.call(this,k)}}
/* a career the trailer made: its songs use the trailer's own ids (900000 and up), which the game never hands out */
function isTrlCareer(code){try{const x=scDecode(code).S;return!!x&&(x.songs||[]).some(q=>q&&q.id>=9e5&&q.id<9e5+100)}catch(e){return false}}
/* v49.24.8: put back any career the trailer overwrote. When the trailer saved over a slot, the game had already kept the career
   that was there as a backup ("Backup from career N"), and that goes back in the slot. A trailer career with no backup is cleared */
function trlRepair(){if(FW_TRL)return;try{for(const n of [1,2]){const k=slotKey(n),c=localStorage.getItem(k);if(!c||!isTrlCareer(c))continue;
  /* backups fill the first free spot, so the latest one kept for this slot has the highest number */
  let best=null,bd=0,bk=0;for(let i=1;i<=BK_MAX;i++){const b=localStorage.getItem('fw_bak_'+i),w=localStorage.getItem('fw_bakw_'+i)||'';if(!b||isTrlCareer(b)||w!='Backup from career '+n)continue;
   try{bd=scDecode(b).S.day||0}catch(e){continue}best=b;bk=i}
  if(!best){localStorage.removeItem(k);continue}
  localStorage.setItem(k,best);localStorage.removeItem('fw_bak_'+bk);localStorage.removeItem('fw_bakw_'+bk);
  try{const a=scDecode(best).S.artist||'your career';sessionStorage.setItem('fw_msg','Restored '+a+' (Day '+bd+'). The trailer page had saved over it, sorry about that.')}catch(e){}}}catch(e){console.warn('trailer repair',e)}}
try{const o=localStorage.getItem('fw_save');if(o){if(!localStorage.getItem('fw_save_1'))localStorage.setItem('fw_save_1',o);localStorage.removeItem('fw_save')}}catch(e){}
function slotInfo(n){try{const c=localStorage.getItem(slotKey(n));if(!c)return null;let a='',d=0;try{const x=scDecode(c).S;a=x.artist||'';d=x.day||0}catch(e){}return{artist:a,day:d}}catch(e){return null}}
trlRepair();
let lastWrote=null;
/* v26.145.2: the same career at the same or an earlier day (e.g. the first re-save in a new code format) is not backed up, so it can't push out a real backup */
function sameCareer(old){try{const o=scDecode(old).S;return o.artist==S.artist&&(o.day||0)<=(S.day||0)}catch(e){return false}}
/* before overwriting a slot with something this tab did not write, keep the old code as fw_bak_N (recoverable from the career select) */
function autoSave(){if(wiping||mode=='creator'||mode=='load'||(typeof TT!='undefined'&&TT.on&&!TT.game))return;try{const k=slotKey(),c=saveCode(),old=localStorage.getItem(k);if(old&&old!==lastWrote&&old!==c&&!sameCareer(old)){bakKeep(old,'Backup from career '+BOOT_SLOT)}localStorage.setItem(k,c);lastWrote=c}catch(e){}}
function restoreSave(){let c=null;try{c=localStorage.getItem(slotKey())}catch(e){}if(!c)return false;loadCode(c);if(mode=='play')return true;bakKeep(c,'Career '+BOOT_SLOT+' that did not load');return false}
/* v26.140: packing a big save takes ~100ms+, so the timer saves every 30s when the browser is idle (and waits out driving/recording/camera) instead of every 5s */
let asLast=0;
function autoSaveTick(){const n=Date.now();if(n-asLast<30000)return;if((mode=='drive'||mode=='rec'||(typeof PH!='undefined'&&PH.camOn))&&n-asLast<120000)return;asLast=n;autoSave()}
setInterval(()=>{if(typeof requestIdleCallback=='function')requestIdleCallback(autoSaveTick,{timeout:3000});else autoSaveTick()},5000);
addEventListener('pagehide',autoSave);
document.addEventListener('visibilitychange',()=>{if(document.hidden)autoSave()});
function wipeSave(){if(!confirm('Wipe your save and start a new game? This cannot be undone.'))return;wiping=true;try{localStorage.removeItem(slotKey())}catch(e){}location.reload()}
