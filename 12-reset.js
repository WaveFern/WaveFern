/* ---------- v49.71.0: the fresh start ----------
   One reset of every career, at one moment: RS.CUT (6 November 2026, 13:30 UTC = 1:30pm in England). Before that moment this file does nothing.
   At and after it:
   - Every career on this device is moved into the Legacy store (fw_legacy) and its slot is emptied: guest slots, every Google
     account's slots, the recovered backups (fw_bak_N) and the copies in the save vault. The cloud copy is handled the same way
     the first time it is read. Nothing is ever deleted: Legacy careers stay in fw_legacy, in Export save, and can be looked at
     in Settings > Save > Legacy careers.
   - A career is "old" when its save has no S.rv (reset version). A career started after the cutover gets S.rv=RS.V when the
     character is confirmed, so the reset runs exactly once per career and can never run again on a new one.
   - A career that has been played (Day 2 or later, or at least one song) earns one Founder claim, stored on its Legacy entry.
     Founder belongs to the player, so every new career they make in the same place is a Founder career (see 206-founder.js). Starting fresh after the cutover earns nothing.
   - loadCode refuses an old career after the cutover (a save code, an import, a backup, the cloud), so nothing can bring the
     old money back; it goes to the Legacy store instead.
   Caveat: this all runs in the browser, so a save can be edited by the person who owns it. The signed saves work is what will
   make S.rv and S.fdr tamper-proof; both are plain fields in the career so they travel inside whatever is signed. */
const RS={V:1,CUT:Date.UTC(2026,10,6,13,30,0),MIN_DAY:2,K:'fw_legacy'};
/* the password-protected /dev/ page (00-dev.js) can move this clock; on the real site it is just Date.now() */
const rsNow=()=>{try{return window.FW_CLOCK?FW_CLOCK.now():Date.now()}catch(e){return Date.now()}};
const rsOn=()=>!FW_TRL&&rsNow()>=RS.CUT;
const rsHash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return h.toString(36)+'.'+s.length.toString(36)};
function rsGet(){try{const raw=localStorage.getItem(RS.K);if(!raw)return{v:1,e:[]};const v=JSON.parse(raw);return v&&Array.isArray(v.e)?v:{v:1,e:[]}}catch(e){return{v:1,e:[]}}}
/* never overwrite a Legacy store that cannot be read: keep the unreadable text next to it first */
function rsPut(v){try{const raw=localStorage.getItem(RS.K);if(raw){let ok=false;try{const o=JSON.parse(raw);ok=!!(o&&Array.isArray(o.e))}catch(e){}if(!ok)localStorage.setItem(RS.K+'_unreadable_'+Date.now(),raw)}
 localStorage.setItem(RS.K,JSON.stringify(v));return true}catch(e){return false}}
function rsStats(code){try{const s=scDecode(code).S;if(!s||typeof s!='object')return null;return{s,artist:String(s.artist||''),day:+s.day||0,money:+s.money||0,followers:+s.followers||0,songs:Array.isArray(s.songs)?s.songs.length:0,rv:+s.rv||0}}catch(e){return null}}
/* played enough to count as a player who existed before the reset */
const rsEligible=(st,code)=>{if(st){if(isTrlCareer(code))return false;return st.day>=RS.MIN_DAY||st.songs>=1}
 const c=scClean(code);return /^FW[1234]-/i.test(c)&&c.length>=1000};
/* put a career in the Legacy store (once per exact code). Returns true when it is safely there. */
function rsArchive(code,scope,slot,why){if(typeof code!='string'||!code)return true;
 const v=rsGet(),id=rsHash(code);if(v.e.some(e=>e.id==id))return true;
 const st=rsStats(code),fd=rsEligible(st,code);
 /* one Founder claim per career: a second snapshot of the same career (another tab, a vault copy) does not add one */
 const dup=st&&v.e.some(e=>e.fd&&e.scope==scope&&e.artist==st.artist&&st.artist);
 v.e.push({id,scope:scope||'guest',slot:slot||0,why:why||'',t:Date.now(),artist:st?st.artist:'',day:st?st.day:0,money:st?st.money:0,followers:st?st.followers:0,songs:st?st.songs:0,bad:st?0:1,fd:fd&&!dup?1:0,used:0,code});
 return rsPut(v)}
/* merge a Legacy store from an exported file. Eligibility is worked out again from the code, never trusted from the file. */
function rsMerge(inc){if(!inc||!Array.isArray(inc.e))return 0;let n=0;const v=rsGet();
 for(const x of inc.e){if(!x||typeof x.code!='string'||!x.code)continue;const id=rsHash(x.code),have=v.e.find(e=>e.id==id);
  if(have){if(x.used&&!have.used)have.used=x.used;continue}
  const st=rsStats(x.code),fd=rsEligible(st,x.code),dup=st&&v.e.some(e=>e.fd&&e.scope==(x.scope||'guest')&&e.artist==st.artist&&st.artist);
  v.e.push({id,scope:String(x.scope||'guest').slice(0,40),slot:+x.slot||0,why:String(x.why||'Imported').slice(0,80),t:+x.t||Date.now(),artist:st?st.artist:'',day:st?st.day:0,money:st?st.money:0,followers:st?st.followers:0,songs:st?st.songs:0,bad:st?0:1,fd:fd&&!dup?1:0,used:x.used||0,code:x.code});n++}
 if(n||inc.e.length)rsPut(v);return n}
const rsIsOld=code=>{const st=rsStats(code);return!!st&&!(st.rv>=RS.V)};
/* the pass over everything stored in this browser. Returns how many careers it moved. */
function rsRun(){if(!rsOn())return 0;let n=0;
 try{const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&/^fw_(u_.+?_)?save_[12]$|^fw_bak_\d+$/.test(k))keys.push(k)}
  for(const k of keys){let c=null;try{c=localStorage.getItem(k)}catch(e){}if(!c)continue;
   const m=/^fw_(u_(.+?)_)?save_([12])$/.exec(k),bk=/^fw_bak_(\d+)$/.exec(k);
   const st=rsStats(c);if(st&&st.rv>=RS.V)continue;if(st&&isTrlCareer(c))continue;
   if(!rsArchive(c,m?(m[2]||'guest'):'guest',m?+m[3]:0,bk?(localStorage.getItem('fw_bakw_'+bk[1])||'Recovered backup'):'Career before the fresh start'))continue;
   try{localStorage.removeItem(k);if(bk)localStorage.removeItem('fw_bakw_'+bk[1]);n++}catch(e){}}
  /* the save vault keeps a copy of each career; old copies would block the new career from ever being vaulted */
  try{const raw=localStorage.getItem('fw_vault'),v=raw&&JSON.parse(raw);
   if(v&&v.e&&typeof v.e=='object'){let ch=0;for(const k in v.e){const e=v.e[k],m=/^fw_(u_(.+?)_)?save_([12])$/.exec(k),sc=m?(m[2]||'guest'):'guest';if(!e)continue;
    for(const f of ['code','prev']){const c=e[f];if(!c||typeof c!='string')continue;const st=rsStats(c);if(st&&st.rv>=RS.V)continue;if(!rsArchive(c,sc,m?+m[3]:0,'Vault copy before the fresh start'))continue;
     if(f=='code'){delete v.e[k]}else{delete e.prev;delete e.prevT}ch=1}}
    if(ch)localStorage.setItem('fw_vault',JSON.stringify(v))}}catch(e){console.warn('reset vault',e)}
  if(n){try{sessionStorage.setItem('fw_msg','Fresh start: everyone began again today. Your old career is kept as a Legacy career in Settings > Save.')}catch(e){}}
 }catch(e){console.warn('reset pass',e)}
 return n}
if(!FW_TRL)rsRun();

/* a career that is still in a tab when the cutover passes: save it, move it, reload into the fresh start */
function rsLive(){try{if(FW_TRL||!rsOn()||wiping)return;
 if(typeof S=='object'&&S&&S.rv>=RS.V)return;if(mode=='creator'||mode=='load')return;
 const t=+sessionStorage.getItem('fw_rsn')||0,now=Date.now();if(now-t<60000)return;
 try{autoSave()}catch(e){}
 if(rsRun()>0){sessionStorage.setItem('fw_rsn',String(now));wiping=true;location.reload()}}catch(e){console.warn('reset live',e)}}
setInterval(rsLive,15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)rsLive()});setTimeout(rsLive,3000);

/* a career made after the cutover is stamped, and uses a Founder claim if this device has one waiting */
/* Founder is a player, not one career: deleting a career and starting again keeps it. A career made in the same place (guest, or the same
   Google account) as a played Legacy career is a Founder career. A Google account with no Legacy career of its own adopts one played as a
   guest on this device, once (so one old career cannot make Founders of several accounts). */
function rsClaim(scope){const v=rsGet();let e=v.e.find(x=>x.fd&&x.scope==scope);
 if(!e&&scope!='guest'){e=v.e.find(x=>x.fd&&x.scope=='guest'&&(!x.used||x.used.acct==scope));if(e){e.used={acct:scope,t:Date.now()};if(!rsPut(v))return null}}
 return e?{a:e.artist||'',d:e.day||0}:null}
function rsNewCareer(){if(FW_TRL||!rsOn()||!S||S.rv>=RS.V)return;
 S.rv=RS.V;S.rvt=Date.now();
 const c=rsClaim(FW_ACCT||'guest');if(c)S.fdr={v:1,a:String(c.a).slice(0,24),d:Math.min(9999,c.d|0),g:{}};
 try{if(typeof founderSync=='function')founderSync(true)}catch(e){console.warn('founder',e)}
 try{autoSave()}catch(e){}}
{const c0=confirmChar;confirmChar=function(){const r=c0.apply(this,arguments);try{rsNewCareer()}catch(e){console.warn('new career',e)}return r}}

/* nothing old can come back in: a code, an import, a backup or the cloud copy is moved to Legacy instead of being loaded */
function rsGuardCode(c){if(!rsOn())return false;try{const s=scClean(c);if(!/^FW[1234]-/i.test(s))return false;if(!rsIsOld(s))return false;
  rsArchive(s,FW_ACCT||'guest',0,'Old career that was loaded after the fresh start');return true}catch(e){return false}}
{const l0=loadCode;loadCode=function(c){if(rsGuardCode(c)){try{say('That career is from before the fresh start. It is kept as a Legacy career in Settings > Save.')}catch(e){}return}return l0.apply(this,arguments)}}
{const b0=bakKeep;bakKeep=function(code,why){if(rsOn()&&typeof code=='string'&&rsIsOld(code))return rsArchive(code,FW_ACCT||'guest',0,why||'Old career');return b0.apply(this,arguments)}}
/* Settings > Save: look at the Legacy careers (read only) */
function rsFmt(n){return Number(n||0).toLocaleString('en-US')}
function rsView(){snd('click');const v=rsGet(),L=v.e.slice().sort((a,b)=>b.day-a.day);
 const rows=L.length?L.map(e=>`<div class=lst style="align-items:flex-start"><div style="flex:1"><h3>${esc(e.artist||'Unreadable career')}</h3>${e.bad?`<div class=m>This career could not be read. It is kept exactly as it was.</div>`:`<div class=m>Day ${rsFmt(e.day)} · $${rsFmt(Math.round(e.money))} · ${rsFmt(e.followers)} followers · ${rsFmt(e.songs)} song${e.songs==1?'':'s'}</div>`}<div class=m><small>Kept ${new Date(e.t).toLocaleDateString([],{dateStyle:'medium'})}${e.why?' · '+esc(e.why):''}</small></div></div></div>`).join(''):'<p class=m>No Legacy careers on this device.</p>';
 $('ui').innerHTML=`<div class="box modal" style="width:min(520px,94vw)"><h2>Legacy careers</h2><p class=m><small>These careers are from before the fresh start. They are read only and never deleted. Export save puts them in the file, so they can be kept anywhere.</small></p><div style="max-height:46vh;overflow:auto">${rows}</div><div class=row2 style="margin-top:10px"><button onclick="vtExport()">Export save</button><button onclick="mode=SP;settings()">Back</button></div></div>`}
{const b0=stBody;stBody=function(){const h=b0.apply(this,arguments);if(STAB!='save')return h;const n=rsGet().e.length;
 return h+(n?`<div class=row2 style="margin-top:6px"><button onclick="rsView()">Legacy careers (${n})</button></div>`:'')}}
