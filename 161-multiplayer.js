/* ===== v45.4.0: band rooms (multiplayer) =====
   The main menu offers Multiplayer (its own screen with Your rooms, Create a room and Join a room) and Single player. A room is a band of up to 4 players who live in the
   starter house together. Networking is browser to browser (WebRTC) through PeerJS and its free public signalling server,
   so there is no server of our own: the player who creates the room is the host and relays everything. If the host
   leaves, the room closes and the others carry on alone.
   - Each band member has their own band career, saved on their own device under the room code and instrument
     (never in the two career slots and never in the cloud save). sessionStorage fw_mp says this tab is in a room.
   - The instrument is picked when you first join and is kept for that band career.
   - Everyone spawns in the studio, which holds every member's instrument at the lowest level. The bedroom has 2 bunk beds.
   - The host's clock is the band's clock: day and time follow the host, and only the host's bed ends the day.
   - Recording and festival sets need every online member present and ready ("1/3 members ready").
   - The middle recording step and the festival crowd games depend on your instrument (only vocals rhyme). */
(()=>{
const SK='fw_mp',LK=SAVE_PRE+'mpl',MAXN=4,MPMAX=2;
let MPS=null;try{MPS=JSON.parse(sessionStorage.getItem(SK)||'null')}catch(e){}
if(MPS&&!(MPS.code&&MPS.inst))MPS=null;
/* v46.1.0: band rooms need a Google sign-in (FW_ACCT is only set by the Google account, never by the anonymous room-list login) */
if(MPS&&!FW_ACCT){MPS=null;try{sessionStorage.removeItem(SK);sessionStorage.removeItem('fw_go')}catch(e){}}
const TABK='fw_mp_tab',TABID=(()=>{try{let t=sessionStorage.getItem('fw_mp_tabid');if(!t){t=Math.random().toString(36).slice(2,10);sessionStorage.setItem('fw_mp_tabid',t)}return t}catch(e){return Math.random().toString(36).slice(2,10)}})();
const acctNm=()=>{try{return localStorage.getItem('fw_acctnm')||''}catch(e){return''}};
function needLogin(){if(FW_ACCT)return false;snd('err');const o=document.getElementById('mpli');if(o)o.remove();const d=document.createElement('div');d.id='mpli';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000a';
 d.innerHTML=`<div class="box modal" style="width:min(380px,92vw)"><h2>Sign in to play with the band</h2><p>Band rooms need a Google account, so your band character is kept safe on your account and each account can only be in a room once.</p>${FB_ON?'<div class=row2><button class=go onclick="document.getElementById(\'mpli\').remove();fbSignInAsk()">Sign in with Google</button><button onclick="document.getElementById(\'mpli\').remove()">Cancel</button></div>':'<p class=m>Sign-in is not available right now.</p><button onclick="document.getElementById(\'mpli\').remove()">OK</button>'}</div>`;document.body.appendChild(d);return true}
function dupTab(){NET.closed=1;const d=document.createElement('div');d.id='mpno';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000e';
 d.innerHTML='<div class="box modal" style="width:min(380px,92vw)"><h2>Already open</h2><p>This band room is already open in another tab on this browser. Only one tab per account can be in a room.</p><button class=go onclick="mpDupLeave()">Back to menu</button></div>';document.body.appendChild(d)}
window.mpDupLeave=()=>{wiping=true;try{sessionStorage.removeItem(SK);sessionStorage.removeItem('fw_go')}catch(e){}location.reload()};
function tabLock(){const rd=()=>{try{return JSON.parse(localStorage.getItem(TABK)||'null')}catch(e){return null}};
 const l=rd();if(l&&l.id!==TABID&&Date.now()-l.t<9000)return false;
 const beat=()=>{if(NET.closed)return;const c=rd();if(c&&c.id!==TABID&&Date.now()-c.t<9000){dupTab();return}try{localStorage.setItem(TABK,JSON.stringify({id:TABID,t:Date.now()}))}catch(e){}};
 beat();setInterval(beat,3000);addEventListener('pagehide',()=>{const c=rd();if(c&&c.id===TABID)try{localStorage.removeItem(TABK)}catch(e){}});return true}
const INS={vo:{n:'Vocals',e:'🎤',st:'Lyrics'},gt:{n:'Guitar',e:'🎸',st:'Riff'},bs:{n:'Bass',e:'🔊',st:'Groove'},dr:{n:'Drums',e:'🥁',st:'Drums'},ky:{n:'Keys',e:'🎹',st:'Melody'}};
const IK=Object.keys(INS),iName=k=>INS[k]?INS[k].e+' '+INS[k].n:'?';
/* where each instrument stands in the studio (x, z, facing) and its offset on a festival stage */
const SPOT={vo:[12.2,2.3,Math.PI],gt:[14.3,2.3,Math.PI],bs:[14.9,3.6,Math.PI/2],dr:[10.8,3.1,Math.PI],ky:[10.2,4.2,0]};
const STOFF={vo:[0,0],gt:[-1.5,.2],bs:[1.5,.2],dr:[0,-1.3],ky:[2.8,.1]};
const pid=c=>'wavefern-rm-'+String(c).toLowerCase();
const newCode=()=>{const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=a[Math.random()*a.length|0];return s};
const lsGet=()=>{try{const l=JSON.parse(localStorage.getItem(LK)||'[]');return Array.isArray(l)?l:[]}catch(e){return[]}};
function lsAdd(o){const l=lsGet().filter(x=>!(x.code==o.code&&x.inst==o.inst));l.unshift(Object.assign({t:Date.now()},o));try{localStorage.setItem(LK,JSON.stringify(l.slice(0,8)))}catch(e){}}
const lastNm=()=>{try{return localStorage.getItem(SAVE_PRE+'mpnm')||''}catch(e){return''}};
const mpKey=()=>SAVE_PRE+'mp_'+MPS.code+'_'+MPS.inst;

/* ---- saves: a band career lives under its own key and stays off the cloud ---- */
if(MPS){
 {const k0=slotKey;slotKey=function(n){return n?k0.apply(this,arguments):mpKey()}}
 CLD.err='Band rooms save on this device only.';
 csCheck=function(){CLD.err='Band rooms save on this device only.';try{fbRedraw()}catch(e){}};
 csPush=function(){return Promise.resolve()};csLoad=function(){};
}

/* ---- ICE servers: STUN plus TURN relays so players on different networks (wifi vs mobile data, strict NATs) can connect.
   To use your own TURN account, set window.WF_TURN=[{urls:'turn:...',username:'...',credential:'...'}] before this file loads. ---- */
function peerOpts(){const ice=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}];
 if(Array.isArray(window.WF_TURN))ice.push(...window.WF_TURN);
 else ice.push({urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp','turns:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'});
 return{debug:0,config:{iceServers:ice,iceCandidatePoolSize:4}}}
/* ---- PeerJS, loaded only when a room is used ---- */
let libP=null;
function lib(){if(window.Peer)return Promise.resolve();if(libP)return libP;
 const urls=['https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js','https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
 return libP=new Promise((res,rej)=>{let i=0;const go=()=>{if(i>=urls.length){libP=null;return rej(new Error('PeerJS did not load'))}
  const s=document.createElement('script');s.src=urls[i++];s.onload=()=>window.Peer?res():go();s.onerror=()=>{s.remove();go()};document.head.appendChild(s)};go()})}

/* ---- main menu ---- */
const U={inst:'vo',q:null,qp:null};
{const t0=titleUI;titleUI=function(){t0.apply(this,arguments);try{menu()}catch(e){console.error('mp menu',e)}}}
function menu(){const m=document.querySelector('#ttl .ttm');if(!m)return;const play=m.querySelector('button[onclick="ttWorlds()"]');if(!play)return;
 if(MPS){const busy=play.disabled;play.textContent=busy?play.textContent:'Play with the band';play.setAttribute('onclick','mpPlay()');
  play.insertAdjacentHTML('beforebegin',`<p class=m style="margin:4px 0">Room <b>${esc(MPS.code)}</b> · ${esc(MPS.band||'Your band')} · ${iName(MPS.inst)}${MPS.host?' · you host':''}</p>`);
  play.insertAdjacentHTML('afterend','<button onclick="mpLeave()">Leave room</button>');
  m.querySelectorAll('button[onclick="fbSignInAsk()"]').forEach(b=>{const p=b.nextElementSibling;if(p&&p.tagName=='P')p.remove();b.remove()});return}
 play.textContent=play.disabled?play.textContent:'Single player';
 const last=FW_ACCT?lsGet()[0]:null;
 play.insertAdjacentHTML('beforebegin',(last?`<button class=go onclick="mpContinue()">Continue as ${esc(last.nm||lastNm()||acctNm()||'your band player')}</button><p class=m style="margin:2px 0 6px"><small>${last.host?'Host':'Join'} room ${esc(last.code)} · ${esc(last.band||'Band')} · ${iName(last.inst)}</small></p>`:'')+'<button class=go onclick="mpHub()">Multiplayer</button>')}
/* v46.4.0: Multiplayer opens its own screen (like Play opens the career list) with Your rooms, Create a room and Join a room */
window.mpHub=()=>{if(!TT.on)return ttBack();snd('click');TT.sel=1;const n=lsGet().length;
 $('ui').innerHTML=`<div id=ttl><div class=ttw><h2>Multiplayer</h2><p class=m style="text-align:center;margin:0">Play as a band of up to ${MAXN} with friends. You can keep up to ${MPMAX} band careers.</p>
  <button class=go onclick="mpRooms()">Your rooms (${Math.min(n,MPMAX)}/${MPMAX})</button><button class=go onclick="mpCreateUI()">Create a room</button><button class=go onclick="mpJoinUI()">Join a room</button>
  ${FW_ACCT?'':'<p class=m style="margin:0;text-align:center"><small>Band rooms need a Google sign-in.</small></p>'}<button onclick="ttBack()">Back</button></div></div>`};
/* Your rooms: the band careers on this device, at most MPMAX. Older lists may hold more; those still show and play, but no new one can start until there is room. */
const svInfo=x=>{try{const c=localStorage.getItem(SAVE_PRE+'mp_'+x.code+'_'+x.inst);if(!c)return null;const q=scDecode(c).S;return{day:q.day||1}}catch(e){return null}};
window.mpRooms=()=>{if(needLogin())return;snd('click');TT.sel=1;const L=lsGet(),rows=L.map((x,i)=>{const v=svInfo(x);
  return`<div class=ttsl><div><b>${esc(x.band||'Band')}</b><small>Room ${esc(x.code)} · ${iName(x.inst)} · ${x.host?'you host':'you joined'}${v?' · Day '+v.day:''}</small></div><button class=go onclick="mpRoomGo(${i})">${x.host?'Host':'Join'}</button><button class=ttdel title="Delete this band career" aria-label="Delete band career ${i+1}" onclick="mpRoomDel(${i})">✕</button></div>`});
 for(let i=L.length;i<MPMAX;i++)rows.push(`<div class="ttsl empty"><div><b>Empty slot</b><small>Band career ${i+1}</small></div></div>`);
 $('ui').innerHTML=`<div id=ttl><div class=ttw><h2>Your rooms</h2>${rows.join('')}${L.length>=MPMAX?`<p class=m style="margin:0"><small>You have ${MPMAX} band careers. Delete one to create or join a new room.</small></p>`:''}
  <div class=row2><button class=go ${L.length>=MPMAX?'disabled':''} onclick="mpCreateUI()">Create a room</button><button class=go ${L.length>=MPMAX?'disabled':''} onclick="mpJoinUI()">Join a room</button></div><button onclick="mpHub()">Back</button></div></div>`};
window.mpRoomGo=i=>{const x=lsGet()[i];if(!x)return;if(x.host)return mpHostAgain(x.code,x.inst);mpJoinUI();$('mpcd').value=x.code;mpFind()};
window.mpRoomDel=i=>{const x=lsGet()[i];if(!x)return;if(!confirm('Delete your band career in '+(x.band||'Band')+' (room '+x.code+')? Your progress in that band is lost.'))return;snd('click');
 try{localStorage.setItem(LK,JSON.stringify(lsGet().filter(q=>!(q.code==x.code&&q.inst==x.inst))));localStorage.removeItem(SAVE_PRE+'mp_'+x.code+'_'+x.inst)}catch(e){}mpRooms()};
function roomsFull(o){const L=lsGet();return!L.some(x=>x.code==o.code&&x.inst==o.inst)&&L.length>=MPMAX}
function fullMsg(){snd('err');const o=document.getElementById('mpli');if(o)o.remove();const d=document.createElement('div');d.id='mpli';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000a';
 d.innerHTML=`<div class="box modal" style="width:min(380px,92vw)"><h2>Your rooms are full</h2><p>You can keep up to ${MPMAX} band careers. Delete one in Your rooms to start a new one.</p><div class=row2><button class=go onclick="document.getElementById('mpli').remove();mpRooms()">Your rooms</button><button onclick="document.getElementById('mpli').remove()">Cancel</button></div></div>`;document.body.appendChild(d)}
window.mpContinue=()=>{if(needLogin())return;snd('click');const x=lsGet()[0];if(!x)return;enter(Object.assign({},x))};
window.mpPlay=()=>ttPlay();
window.mpLeave=()=>{snd('click');try{autoSave()}catch(e){}wiping=true;try{sessionStorage.removeItem(SK);sessionStorage.removeItem('fw_go')}catch(e){}location.reload()};
function insBtns(taken,lock){return`<div class=mpins>${IK.map(k=>{const off=(taken||[]).includes(k)||(lock&&lock!=k);return`<button class="${U.inst==k?'on':''}" ${off?'disabled':''} onclick="mpPick('${k}')">${INS[k].e}<br><small>${INS[k].n}</small></button>`}).join('')}</div>`}
window.mpPick=k=>{snd('click');U.inst=k;document.querySelectorAll('.mpins button').forEach(b=>b.classList.toggle('on',b.getAttribute('onclick')==`mpPick('${k}')`))};
window.mpCreateUI=()=>{if(needLogin())return;snd('click');TT.sel=1;U.inst='vo';const mine=lsGet().filter(x=>x.host);
 $('ui').innerHTML=`<div id=ttl><div class=ttw><h2>Create a room</h2><p class=m>Up to ${MAXN} players live in one house as a band. Everyone picks one instrument and keeps it. Your friends join with the room code.</p>
  <div class=r><span>Band name</span><input id=mpbn maxlength=24 placeholder="The Ferns"></div><div class=r><span>Your name</span><input id=mpyn maxlength=16 placeholder="Your name" value="${esc(lastNm()||acctNm())}"></div><p style="margin:10px 0 0">Your instrument</p>${insBtns()}
  <button class=go onclick="mpCreateGo()">Create room</button>
  ${mine.length?`<details class=ttrb open><summary>Your bands (host again)</summary>${mine.map(x=>`<div class=ttsl><div><b>${esc(x.band||'Band')}</b><small>Room ${esc(x.code)} · ${iName(x.inst)}</small></div><button onclick="mpHostAgain('${esc(x.code)}','${x.inst}')">Host</button></div>`).join('')}</details>`:''}
  <p class=m><small>Rooms connect browser to browser. Very strict networks (some schools and offices) can block them.</small></p><button onclick="mpHub()">Back</button></div></div>`};
function enter(o){if(needLogin())return;if(roomsFull(o))return fullMsg();const y=$('mpyn');if(y){o.nm=(y.value||'').trim().slice(0,16);try{localStorage.setItem(SAVE_PRE+'mpnm',o.nm)}catch(e){}}lsAdd(o);wiping=true;try{sessionStorage.setItem(SK,JSON.stringify(o));sessionStorage.setItem('fw_go','1')}catch(e){wiping=false;return say('Could not start the room in this browser.')}location.reload()}
window.mpCreateGo=()=>{snd('click');const b=($('mpbn').value||'').trim()||'The Ferns';enter({code:newCode(),inst:U.inst,band:b,host:1})};
window.mpHostAgain=(c,i)=>{snd('click');const x=lsGet().find(q=>q.code==c&&q.inst==i);enter({code:c,inst:i,band:x&&x.band||'Band',host:1,nm:x&&x.nm||''})};
window.mpJoinUI=()=>{if(needLogin())return;snd('click');TT.sel=1;const rec=lsGet().filter(x=>!x.host);
 $('ui').innerHTML=`<div id=ttl><div class=ttw><h2>Join a room</h2><p class=m>Type the room code your friend sees on their screen.</p>
  <div class=ng><input id=mpcd maxlength=5 placeholder="CODE" style="text-transform:uppercase;letter-spacing:3px" onkeydown="if(event.key=='Enter')mpFind()"><button class=go onclick="mpFind()">Find room</button></div>
  ${rec.length?`<p class=m style="margin:8px 0 0"><small>Rooms you joined: ${rec.map(x=>`<button onclick="$('mpcd').value='${esc(x.code)}';mpFind()">${esc(x.code)}</button>`).join(' ')}</small></p>`:''}
  <div id=mpjr></div><button onclick="mpHub()">Back</button></div></div>`;setTimeout(()=>{const i=$('mpcd');i&&i.focus()},50)};
window.mpFind=()=>{if(needLogin())return;const c=($('mpcd').value||'').trim().toUpperCase(),out=$('mpjr');if(!/^[A-Z0-9]{5}$/.test(c)){snd('err');out.innerHTML='<p class=m>A room code has 5 letters or numbers.</p>';return}
 snd('click');out.innerHTML='<p class=m>Looking for room '+esc(c)+'…</p>';if(U.qp)try{U.qp.destroy()}catch(e){}
 const fail=t=>{if(U.qc!==c||U.qok===c)return;out.innerHTML='<p class=m>'+t+'</p>';if(U.qp)try{U.qp.destroy()}catch(e){}U.qp=null};U.qc=c;U.qok='';
 /* ask the Firebase relay at the same time: it answers even when direct connections are blocked */
 fbRoomInfo(c).then(d=>{if(d&&U.qc===c)qShow(c,d)}).catch(()=>{});
 lib().then(()=>{const p=U.qp=new Peer(peerOpts());const to=setTimeout(()=>fail('No answer from room '+esc(c)+'. Check the code and that the host is in the game.'),15000);
  p.on('error',e=>{clearTimeout(to);fail(e&&e.type=='peer-unavailable'?'There is no room '+esc(c)+' right now. Check the code and that the host is in the game.':'Could not reach the room service. Check your connection and try again.')});
  p.on('open',()=>{const cn=p.connect(pid(c),{reliable:true,serialization:'json'});cn.on('open',()=>cn.send({t:'q'}));
   cn.on('data',d=>{if(!d||d.t!='qi')return;clearTimeout(to);try{p.destroy()}catch(e){}U.qp=null;if(U.qc!==c)return;qShow(c,cln(d))})})
 }).catch(()=>setTimeout(()=>fail('Could not reach room '+esc(c)+'. Check the code and your connection, then try again.'),4000))};
function qShow(c,d){const out=$('mpjr');if(!out||U.qok===c)return;U.qok=c;const taken=Array.isArray(d.taken)?d.taken:[],n=+d.n||0;
 const old=lsGet().find(x=>x.code==c&&!x.host),lock=old&&old.inst;
 if(n>=MAXN&&!lock){out.innerHTML='<p class=m>That room is full ('+MAXN+' players).</p>';return}
 if(lock&&taken.includes(lock)){out.innerHTML='<p class=m>You play '+iName(lock)+' in this band, but someone else is playing it right now.</p>';return}
 U.inst=lock||IK.find(k=>!taken.includes(k))||'vo';U.q={code:c,band:d.band||'Band'};
 out.innerHTML=`<div class=ttsl style="margin-top:10px"><div><b>${esc(d.band||'Band')}</b><small>Room ${esc(c)} · ${n}/${MAXN} players</small></div></div>
  <p style="margin:10px 0 0">${lock?'Your instrument in this band (it cannot change)':'Pick your instrument. You keep it for this band.'}</p>${insBtns(taken,lock)}<div class=r><span>Your name</span><input id=mpyn maxlength=16 placeholder="Your name" value="${esc(lastNm()||acctNm())}"></div><button class=go onclick="mpJoinGo()">Join the band</button>`}
window.mpJoinGo=()=>{if(!U.q)return;snd('click');enter({code:U.q.code,inst:U.inst,band:U.q.band,host:0})};

/* ---- network: star around the host ---- */
const NET={kk:{},peer:null,hc:null,conns:{},id:'',on:0,tries:0,closed:0,lastSt:'',stT:0,lkT:0,clkT:0};
const MB={};/* every member by peer id, yourself included */
const ME={id:'',nm:'',inst:MPS?MPS.inst:'',look:null,x:0,z:0,r:0,zone:'menu',where:'',studio:0,stg:0,rd:null};
let MPGO=0,MPF=0,festBk=null,sleepW=0;
const isHost=()=>!!(MPS&&MPS.host);
const online=()=>!!(MPS&&NET.on&&(isHost()||(NET.hc&&NET.hc.open)));
const list=()=>online()?Object.values(MB):[];
const band=()=>list().length>1;
const pub=m=>({id:m.id,nm:m.nm,inst:m.inst,look:m.look,ad:m.ad?1:0});
function sendAll(o,ex){for(const id in NET.conns){const c=NET.conns[id];if(id!==ex&&c.open&&c.mp)try{c.send(o)}catch(e){}}}
function send(o){if(isHost()){o.id=ME.id;handle(o,ME.id,1);sendAll(o)}else if(NET.hc&&NET.hc.open)try{NET.hc.send(o)}catch(e){}}
function roster(){sendAll({t:'ros',band:MPS.band,mem:Object.values(MB).map(pub)});fbInfo()}
function start(){if(!MPS)return;if(!tabLock())return dupTab();ME.uid=myUid();if(isHost())fbHost();lib().then(()=>{isHost()?hostOpen():joinOpen()}).catch(()=>{if(!isHost())fbJoin()})}
function hostOpen(){const p=NET.peer=new Peer(pid(MPS.code),peerOpts());
 p.on('open',id=>{const was=NET.on;NET.pOn=1;NET.id=ME.id=id;NET.on=1;NET.tries=0;MB[id]=ME;regBeat();if(!was)say('Room '+MPS.code+' is open. Friends join with this code.')});
 p.on('connection',c=>{c.on('data',d=>hostData(c,d));c.on('close',()=>drop(c.peer));c.on('error',()=>drop(c.peer))});
 p.on('disconnected',()=>{if(!NET.closed)setTimeout(()=>{try{p.reconnect()}catch(e){}},2000)});
 p.on('error',e=>{if(e&&e.type=='unavailable-id'){try{p.destroy()}catch(x){}if(++NET.tries<6)return setTimeout(hostOpen,2500);
   const o=MPS.code;try{const k=SAVE_PRE+'mp_'+o+'_'+MPS.inst,v=localStorage.getItem(k);localStorage.setItem(LK,JSON.stringify(lsGet().filter(x=>!(x.code==o&&x.inst==MPS.inst))));MPS.code=newCode();if(v){localStorage.setItem(mpKey(),v);localStorage.removeItem(k)}}catch(x){MPS.code=newCode()}NET.tries=0;try{sessionStorage.setItem(SK,JSON.stringify(MPS))}catch(x){}lsAdd(MPS);say('Room code '+o+' is busy, so your room is now '+MPS.code+'.');fbHostStop();fbHost();return setTimeout(hostOpen,500)}
  if(e&&(e.type=='network'||e.type=='server-error'||e.type=='socket-error')&&!NET.pOn){try{p.destroy()}catch(x){}if(!NET.on)say('Could not reach the room service. Trying again…');setTimeout(hostOpen,6000)}})}
/* v45.7.0: public room list for the admin. The host writes rooms/CODE (using a separate anonymous Firebase login, so Google sign-in is not needed) (band name, player count, heartbeat);
   the admin panel lists fresh entries. Best effort: hosts who are not signed in, or offline, just do not appear. */
function regAuth(){if(NET.ra)return NET.ra;if(typeof FB_ON=='undefined'||!FB_ON)return Promise.reject('off');const u='https://www.gstatic.com/firebasejs/'+FB_V+'/firebase-';
 return NET.ra=Promise.all([import(u+'app.js'),import(u+'auth.js'),import(u+'firestore.js')]).then(([a,m,f])=>{const app=a.initializeApp(FB_CFG,'rooms');const au=m.getAuth(app);
  return(au.currentUser?Promise.resolve(au.currentUser):m.signInAnonymously(au).then(r=>r.user)).then(usr=>({uid:usr.uid,F:f,D:f.getFirestore(app)}))}).catch(e=>{NET.ra=null;throw e})}
function regBeat(){if(NET.regT||!isHost())return;const w=()=>{if(NET.closed||!NET.on)return;
  regAuth().then(r=>r.F.setDoc(r.F.doc(r.D,'rooms',MPS.code),{code:MPS.code,band:String(MPS.band||'Band').slice(0,24),n:Object.keys(MB).length,uid:r.uid,t:Date.now()})).then(()=>{if(NET.regBad){NET.regBad=0;try{say('Room list: registered.')}catch(e){}}console.log('[rooms] registered',MPS.code)},e=>{const c=(e&&e.code)||String(e);console.warn('[rooms] register failed',c,e);if(!NET.regBad){NET.regBad=1;try{say('Admin room list: could not register this room ('+c+').')}catch(x){}}})};
 w();NET.regT=setInterval(w,20000);addEventListener('visibilitychange',()=>{if(!document.hidden)w()});addEventListener('online',w)}
window.mpAdminJoin=c=>{try{mpJoinUI();$('mpcd').value=c;mpFind()}catch(e){console.error(e)}};
function hostData(c,d){if(!d||!d.t)return;d=cln(d);
 if(NET.kk[c.peer]){try{c.close()}catch(e){}return}
 if(d.t=='q'){const L=Object.values(MB);try{c.send({t:'qi',band:MPS.band,n:L.length,taken:L.map(m=>m.inst)})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},1500);return}
 if(d.t=='hi'){const gu=String(d.uid||'').slice(0,16);
  if(!gu){try{c.send({t:'no',why:'Sign in with Google to join a band room.'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},1500);return}
  const du=Object.values(MB).find(m=>m.uid==gu&&m.id!==c.peer&&m.id!==ME.id);
  if(gu==myUid()||(du&&NET.conns[du.id]&&NET.conns[du.id].open)){try{c.send({t:'no',why:'This Google account is already in the room (maybe in another tab or on another device).'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},1500);return}
  if(du)drop(du.id);
  const cl=Object.values(MB).find(m=>m.inst==d.inst&&m.id!==c.peer&&m.id!==ME.id);if(cl&&(!NET.conns[cl.id]||!NET.conns[cl.id].open||cl.nm==d.nm))drop(cl.id);
  const L=Object.values(MB).filter(m=>m.id!==c.peer);
  const kd=!d.ad&&(NET.kk[c.peer]||(d.uid&&NET.kk['u'+d.uid]));
  const no=kd?'The host removed you from this room.':L.length>=MAXN?'The room is full.':L.some(m=>m.inst==d.inst)?'Someone in the room already plays '+(INS[d.inst]?INS[d.inst].n:'that')+'.':!INS[d.inst]?'Unknown instrument.':'';
  if(no){try{c.send({t:'no',why:no})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},1500);return}
  c.mp=1;NET.conns[c.peer]=c;MB[c.peer]=Object.assign(MB[c.peer]||{},{ad:d.ad?1:0,id:c.peer,uid:String(d.uid||'').slice(0,16),nm:String(d.nm||'Player').slice(0,24),inst:d.inst,look:d.look||null,rd:null,zone:'menu'});
  c.send({t:'wel',band:MPS.band,an:S.artist||'',you:c.peer,day:S.day,tm:S.t,mem:Object.values(MB).map(m=>Object.assign(pub(m),{x:m.x,z:m.z,zone:m.zone,where:m.where,studio:m.studio,stg:m.stg,rd:m.rd}))});
  NET.gk='';NET.cs={};roster();say(MB[c.peer].nm+' joined on '+INS[d.inst].n+'.');return}
 if(!c.mp||!['st','rd','dn','an','em','rel','scr','gr','cm','fx'].includes(d.t))return;if(d.t=='fx'&&!MB[c.peer].ad)return;d.id=c.peer;handle(d,c.peer);sendAll(d,c.peer)}
/* v45.9.0: host removes a member: tell them, close their link, remember their ids for this session */
function kick(id){if(!isHost()||id===ME.id)return;const m=MB[id],c=NET.conns[id];NET.kk[id]=1;if(m&&m.uid)NET.kk['u'+m.uid]=1;if(c){try{c.send({t:'kick'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},800)}if(m){say('You removed '+m.nm+' from the room.');rmAv(id);delete MB[id]}delete NET.conns[id];roster()}
window.mpKick=id=>{const m=MB[id];if(!m||!isHost())return;if(!confirm('Remove '+m.nm+' from the band room? They will not be able to rejoin this room until you close it.'))return;snd('click');kick(id)};
function kicked(){NET.closed=1;NET.on=0;const h=NET.hc;NET.hc=null;try{h&&h.close()}catch(e){}for(const k in MB)if(k!==ME.id){rmAv(k);delete MB[k]}ME.rd=null;try{localStorage.setItem(LK,JSON.stringify(lsGet().filter(x=>x.code!=MPS.code)))}catch(e){}say('The host removed you from the band room.');const d=document.createElement('div');d.id='mpno';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000a';
 d.innerHTML='<div class="box modal" style="width:min(380px,92vw)"><h2>Removed from the room</h2><p>The host removed you from this band room. You cannot rejoin it right now.</p><div class=row2><button class=go onclick="mpLeave()">Back to menu</button><button onclick="this.closest(\'#mpno\').remove()">Play alone</button></div></div>';document.body.appendChild(d)}
function drop(id){const c=NET.conns[id];if(!c)return;delete NET.conns[id];const m=MB[id];if(m){say(m.nm+' left the room.');rmAv(id);delete MB[id]}roster()}
function joinOpen(){const p=NET.peer=new Peer(peerOpts());
 p.on('open',id=>{NET.id=ME.id=id;connectHost()});
 p.on('disconnected',()=>{if(!NET.closed)setTimeout(()=>{try{p.reconnect()}catch(e){}},2000)});
 p.on('error',e=>{if(NET.fb)return;if(e&&(e.type=='peer-unavailable'||e.type=='network'||e.type=='server-error'||e.type=='socket-error'||e.type=='browser-incompatible'||e.type=='webrtc'))fbJoin()})}
function connectHost(){if(NET.closed)return;if(NET.fb)return fbConnect();if(!NET.peer)return;const c=NET.hc=NET.peer.connect(pid(MPS.code),{reliable:true,serialization:'json'});
 /* no direct link after 9 s: the network is probably blocking it, so use the Firebase relay */
 setTimeout(()=>{if(!c.open&&!NET.closed&&NET.hc===c)fbJoin()},9000);bindHost(c)}
function bindHost(c){
 c.on('open',()=>{c.send({t:'hi',nm:myName(),inst:MPS.inst,look:myLook(),uid:myUid(),ad:(typeof isAdmin=='function'&&isAdmin())?1:0})});
 c.on('data',d=>{if(!d||!d.t)return;d=cln(d);
  if(d.t=='kick'){kicked();return}
  if(d.t=='no'){NET.closed=1;NET.on=0;noJoin(d.why);return}
  if(d.t=='wel'){NET.on=1;NET.tries=0;for(const k in MB)if(k!==ME.id){rmAv(k);delete MB[k]}MB[ME.id]=ME;(d.mem||[]).forEach(m=>{if(m.id!==ME.id)MB[m.id]=Object.assign({},m)});
   if(d.band){MPS.band=d.band;try{sessionStorage.setItem(SK,JSON.stringify(MPS))}catch(e){}}if(d.an){S.artist=d.an;NET.an=d.an}clock({day:d.day,tm:d.tm},1);say('Joined '+(MPS.band||'the band')+' in room '+MPS.code+(NET.fb?' through the Firebase relay.':'.'));NET.lastSt='';NET.gk='';NET.cs={};return}
  handle(d,d.id)});
 c.on('close',()=>{if(NET.hc===c){NET.hc=null;lost()}})}
function lost(){if(NET.closed||NET.rt)return;for(const k in MB)if(k!==ME.id){rmAv(k);delete MB[k]}ME.rd=null;
 if(NET.tries==0&&NET.on)say('Lost the room. Trying to reconnect…');NET.on=0;
 if(++NET.tries<=12)NET.rt=setTimeout(()=>{NET.rt=0;connectHost()},5000);else say('Room '+MPS.code+' is closed. You are playing this band career on your own.')}
function noJoin(why){say('Could not join: '+why);const d=document.createElement('div');d.id='mpno';d.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#000a';
 d.innerHTML=`<div class="box modal" style="width:min(380px,92vw)"><h2>Could not join</h2><p>${esc(why)}</p><div class=row2><button class=go onclick="mpLeave()">Leave room</button><button onclick="this.closest('#mpno').remove()">Play alone</button></div></div>`;document.body.appendChild(d)}
/* ---- v46.6.0: Firebase relay. When a direct (WebRTC) link cannot be made, for example on a school network, a guest
   talks to the host through Firebase Realtime Database instead. The host always listens there too and passes messages
   between direct and relay players, so everyone shares one room. Layout under r/CODE (rules in docs/database.rules.json):
     h: {u,t} the host's claim · i: {b,n,k} room info for Join a room
     u/UID: what a relay guest sends: o 1 while connected, p "x,z,r", m meta JSON, l look JSON, e/* other messages (JSON, removed once read)
     d/UID: what the host sends that guest: p/ID, m/ID, l/ID per member, c clock "day,time", e/* other messages
   To keep downloads small: positions only go to players in the same area, nothing is re-sent unless it changed,
   and a player's position, area info and look each overwrite one spot instead of piling up. ---- */
const RTDB_URL='https://waveferngame-default-rtdb.europe-west1.firebasedatabase.app';
const MK=['zone','where','studio','stg','nm','ctry','col'];
const FB={vc:{},un:[],gun:[],r:null};
let FBRP=null;
function rtdb(){if(FBRP)return FBRP;if(typeof FB_ON=='undefined'||!FB_ON)return Promise.reject(new Error('off'));
 const u='https://www.gstatic.com/firebasejs/'+FB_V+'/firebase-';
 const waitA=()=>new Promise((res,rej)=>{let n=0;const t=setInterval(()=>{if(FBA){clearInterval(t);res()}else if(++n>300){clearInterval(t);rej(new Error('auth'))}},100)});
 return FBRP=waitA().then(()=>FBA.authStateReady()).then(()=>import(u+'database.js')).then(R=>{const usr=FBA.currentUser;if(!usr||usr.isAnonymous)throw new Error('Google sign-in needed');
  return FB.r={R,db:R.getDatabase(FBA.app,RTDB_URL),uid:usr.uid}}).catch(e=>{FBRP=null;throw e})}
/* everything from other players is cleaned before the game uses it: no HTML characters, bounded sizes */
function cln(v,dp){dp=dp||0;if(typeof v=='string')return v.slice(0,4000).replace(/[<>"]/g,c=>c=='<'?'‹':c=='>'?'›':'”');
 if(typeof v=='number')return isFinite(v)?v:0;if(typeof v=='boolean'||v==null)return v;if(dp>8)return null;
 if(Array.isArray(v))return v.slice(0,2000).map(x=>cln(x,dp+1));
 if(typeof v=='object'){const o={};let n=0;for(const k in v){if(++n>300)break;if(k=='__proto__'||k=='constructor'||k=='prototype')continue;o[k]=cln(v[k],dp+1)}return o}return null}
const pos3=(x,z,r)=>[x,z,r].map(v=>Math.round((+v||0)*100)/100).join(',');
const unpos=p=>{const a=String(p||'').split(',').map(Number);return a.length==3&&a.every(isFinite)?{x:a[0],z:a[1],r:a[2]}:null};
const jp=s=>{try{return JSON.parse(s)}catch(e){return null}};
function fbRoomInfo(c){return rtdb().then(({R,db})=>R.get(R.ref(db,'r/'+c+'/i'))).then(s=>{const v=s.val();if(!v)return null;
 return{band:String(v.b||'Band'),n:+v.n||0,taken:String(v.k||'').split(',').filter(k=>INS[k])}})}

/* host side */
function fbHost(){if(!isHost())return;rtdb().then(r=>{const{R,db,uid}=r,code=MPS.code,base=R.ref(db,'r/'+code);
 return R.set(base,{h:{u:uid,t:R.serverTimestamp()}}).then(()=>{if(MPS.code!==code)return R.remove(base);R.onDisconnect(base).remove();FB.code=code;
  if(!NET.on){NET.id=ME.id=pid(code);NET.on=1;NET.tries=0;MB[ME.id]=ME;regBeat();say('Room '+code+' is open. Friends join with this code.')}
  fbInfo();FB.un.push(R.onValue(R.ref(db,'r/'+code+'/u'),s=>{try{fbHostIn(s.val()||{})}catch(e){console.error('[relay] host',e)}}))})})
 .catch(e=>console.warn('[relay] host relay off:',e&&e.message||e))}
function fbHostStop(){const r=FB.r,c=FB.code;FB.un.forEach(f=>{try{f()}catch(e){}});FB.un=[];FB.vc={};FB.code='';if(r&&c){try{r.R.onDisconnect(r.R.ref(r.db,'r/'+c)).cancel();r.R.remove(r.R.ref(r.db,'r/'+c))}catch(e){}}}
function fbInfo(){const r=FB.r;if(!r||!FB.code||!isHost())return;const L=Object.values(MB);
 r.R.set(r.R.ref(r.db,'r/'+FB.code+'/i'),{b:String(MPS.band||'Band').slice(0,24),n:Math.min(L.length,MAXN),k:L.map(m=>m.inst).filter(k=>INS[k]).join(',')}).catch(()=>{})}
function fbHostIn(all){const{R,db}=FB.r,code=FB.code;
 for(const uid in FB.vc)if(!all[uid]){const vc=FB.vc[uid];delete FB.vc[uid];vc.open=false;if(NET.conns[vc.peer]===vc)drop(vc.peer);R.remove(R.ref(db,'r/'+code+'/d/'+uid)).catch(()=>{})}
 for(const uid in all){const g=all[uid]||{};let vc=FB.vc[uid];if(!vc){vc=FB.vc[uid]=hostVC(uid);R.remove(R.ref(db,'r/'+code+'/d/'+uid)).catch(()=>{})}
  const was=vc.mp;
  Object.keys(g.e||{}).sort().forEach(k=>{if(vc.seen[k])return;vc.seen[k]=1;R.remove(R.ref(db,'r/'+code+'/u/'+uid+'/e/'+k)).catch(()=>{});
   const d=jp(g.e[k]);if(!d||!vc.open)return;if(d.t=='hi')d.uid=uid.slice(0,16);hostData(vc,d)});
  if(!vc.open||!vc.mp)continue;if(!was){vc.im=vc.ip=vc.il=undefined}
  if(g.m!==vc.im){vc.im=g.m;const o=jp(g.m);if(o){const m=MB[vc.peer],z0=m&&m.zone,d={t:'st'};MK.forEach(k=>{if(o[k]!==undefined)d[k]=o[k]});hostData(vc,d);if(m&&m.zone!==z0)vc.flush()}}
  if(g.p!==vc.ip){vc.ip=g.p;const p=unpos(g.p);if(p)hostData(vc,Object.assign({t:'st'},p))}
  if(g.l!==vc.il){vc.il=g.l;const l=jp(g.l);if(l)hostData(vc,{t:'st',look:l})}}}
function hostVC(uid){const{R,db}=FB.r,code=FB.code,dp='r/'+code+'/d/'+uid,ref=k=>R.ref(db,dp+'/'+k),peer='fb-'+uid;
 const same=mid=>{const a=MB[mid],b=MB[peer];return!a||!b||a.zone===b.zone};
 const vc={peer,open:true,mp:0,seen:{},lp:{},sp:{},sm:{},sl:{},mm:{},on(){},
  close(){vc.open=false;setTimeout(()=>R.remove(R.ref(db,dp)).catch(()=>{}),5000)},
  flush(){for(const mid in vc.lp)if(mid!==peer&&same(mid)&&vc.lp[mid]!==vc.sp[mid]){vc.sp[mid]=vc.lp[mid];R.set(ref('p/'+mid),vc.lp[mid]).catch(()=>{})}},
  send(o){if(!vc.open||!o)return;
   if(o.t=='st'){const mid=o.id;if(!mid||mid===peer)return;
    const mm={};let has=0;MK.forEach(k=>{if(o[k]!==undefined){mm[k]=o[k];has=1}});
    if(has){const s=JSON.stringify(vc.mm[mid]=Object.assign(vc.mm[mid]||{},mm));if(s!==vc.sm[mid]){vc.sm[mid]=s;R.set(ref('m/'+mid),s).catch(()=>{})}}
    if(o.x!==undefined){const p=vc.lp[mid]=pos3(o.x,o.z,o.r);if(same(mid)&&p!==vc.sp[mid]){vc.sp[mid]=p;R.set(ref('p/'+mid),p).catch(()=>{})}}
    if(o.look){const s=JSON.stringify(o.look);if(s.length<=4000&&s!==vc.sl[mid]){vc.sl[mid]=s;R.set(ref('l/'+mid),s).catch(()=>{})}}return}
   if(o.t=='clk'){R.set(ref('c'),o.day+','+(+o.tm||0).toFixed(2)).catch(()=>{});return}
   if(o.t=='wel'){vc.mm={};vc.sm={};vc.sl={};vc.sp={}}
   R.push(R.ref(db,dp+'/e'),JSON.stringify(o)).catch(()=>{})}};
 return vc}

/* guest side */
function fbJoin(){if(NET.fb||NET.closed||isHost())return;NET.fb=1;const p=NET.peer;NET.peer=null;try{p&&p.destroy()}catch(e){}
 const h=NET.hc;if(h){NET.hc=null;try{h.close()}catch(e){}}say('Direct connection blocked, so the band is joining through the Firebase relay…');connectHost()}
function fbConnect(){if(NET.closed)return;FB.gun.forEach(f=>{try{f()}catch(e){}});FB.gun=[];
 rtdb().then(r=>{const{R,db,uid}=r,base='r/'+MPS.code;return R.get(R.ref(db,base+'/h')).then(h=>{if(!h.exists())throw new Error('no room');
  const up=R.ref(db,base+'/u/'+uid);NET.id=ME.id='fb-'+uid;
  return R.set(up,{o:1}).then(()=>{R.onDisconnect(up).remove();const vc=guestVC(r,base,uid);NET.hc=vc;bindHost(vc);
   FB.gun=[R.onValue(R.ref(db,base+'/d/'+uid),s=>{try{vc.in(s.val()||{})}catch(e){console.error('[relay] guest',e)}}),R.onValue(R.ref(db,base+'/h'),s=>{if(!s.exists())vc.gone()})];vc.emit('open')})})})
 .catch(e=>{console.warn('[relay] join failed:',e&&e.message||e);NET.hc=null;lost()})}
function guestVC(r,base,uid){const{R,db}=r,up=k=>R.ref(db,base+'/u/'+uid+'/'+k),H={open:[],data:[],close:[]};
 const vc={peer:pid(MPS.code),open:true,seen:{},mm:{},im:{},ip:{},il:{},
  on(ev,f){(H[ev]||[]).push(f)},emit(ev,a){(H[ev]||[]).slice().forEach(f=>{try{f(a)}catch(e){console.error('[relay]',e)}})},
  send(o){if(!vc.open||!o)return;
   if(o.t=='st'){const mm={};let has=0;MK.forEach(k=>{if(o[k]!==undefined){mm[k]=o[k];has=1}});
    if(has){const s=JSON.stringify(Object.assign(vc.mm,mm));if(s!==vc.sm){vc.sm=s;R.set(up('m'),s).catch(()=>{})}}
    if(o.x!==undefined){const p=pos3(o.x,o.z,o.r),share=Object.values(MB).some(m=>m.id!==ME.id&&m.zone===ME.zone);
     if(!share)vc.sp=null;else if(p!==vc.sp){vc.sp=p;R.set(up('p'),p).catch(()=>{})}}
    if(o.look){const s=JSON.stringify(o.look);if(s.length<=4000&&s!==vc.sl){vc.sl=s;R.set(up('l'),s).catch(()=>{})}}return}
   R.push(up('e'),JSON.stringify(o)).catch(()=>{})},
  in(v){Object.keys(v.e||{}).sort().forEach(k=>{if(vc.seen[k])return;vc.seen[k]=1;R.remove(R.ref(db,base+'/d/'+uid+'/e/'+k)).catch(()=>{});
    const d=jp(v.e[k]);if(!d||!vc.open)return;if(d.t=='wel'){vc.im={};vc.ip={};vc.il={}}vc.emit('data',d)});
   if(!vc.open)return;
   if(v.c&&v.c!==vc.ic){vc.ic=v.c;const a=String(v.c).split(',').map(Number);if(a.length==2&&a.every(isFinite))vc.emit('data',{t:'clk',day:a[0],tm:a[1]})}
   const m=v.m||{},p=v.p||{},l=v.l||{};
   for(const id in m)if(m[id]!==vc.im[id]){vc.im[id]=m[id];const o=jp(m[id]);if(o){const d={t:'st',id};MK.forEach(k=>{if(o[k]!==undefined)d[k]=o[k]});vc.emit('data',d)}}
   for(const id in p)if(p[id]!==vc.ip[id]){vc.ip[id]=p[id];const q=unpos(p[id]);if(q)vc.emit('data',Object.assign({t:'st',id},q))}
   for(const id in l)if(l[id]!==vc.il[id]){vc.il[id]=l[id];const o=jp(l[id]);if(o)vc.emit('data',{t:'st',id,look:o})}},
  stop(){vc.open=false;FB.gun.forEach(f=>{try{f()}catch(e){}});FB.gun=[]},
  gone(){if(!vc.open)return;vc.stop();vc.emit('close')},
  close(){if(!vc.open)return;vc.stop();try{R.onDisconnect(R.ref(db,base+'/u/'+uid)).cancel();R.remove(R.ref(db,base+'/u/'+uid)).catch(()=>{})}catch(e){}}};
 return vc}
/* messages from members (relayed by the host) */
function handle(d,id,self){
 if(d.t=='ros'){if(isHost())return;const ids=new Set(d.mem.map(m=>m.id));for(const k in MB)if(k!==ME.id&&!ids.has(k)){rmAv(k);delete MB[k]}
  d.mem.forEach(m=>{if(m.id===ME.id)return;MB[m.id]=Object.assign(MB[m.id]||{},m)});if(d.band)MPS.band=d.band;return}
 if(d.t=='clk'){if(!isHost())clock(d);return}
 if(d.t=='go'){go(d);return}
 if(!id||self||id===ME.id)return;const m=MB[id];if(!m)return;
 if(d.t=='st'){['x','z','r','zone','where','studio','stg','nm','ctry','col'].forEach(k=>{if(d[k]!==undefined)m[k]=d[k]});if(d.look){m.look=d.look}}
 else if(d.t=='rd'){const was=m.rd;m.rd=d.rd||null;if(d.rd&&!was)say(m.nm+(d.rd.k=='rec'?' is ready to record.':d.rd.k=='slp'?' is in bed and wants to sleep.':d.rd.k=='col'?' is ready to record with '+artN(d.rd.a)+'.':' is ready to play Stage '+d.rd.n+'.'))}
 else if(d.t=='dn'){if(d.bl){(BQ[d.bl]=BQ[d.bl]||{})[id]=d.q}say(d.c?m.nm+' finished the collab session.':m.nm+' ('+(INS[m.inst]?INS[m.inst].n:'')+') finished their part: '+Math.round((d.sc||0)*100)+'%')}
 else if(d.t=='an'){if(d.v&&d.v!==S.artist){S.artist=d.v;NET.an=d.v;try{updateVersion()}catch(e){}say(m.nm+' named the band\'s Spotifly account "'+d.v+'".')}}
 else if(d.t=='em'){const a=AV[id];if(a&&EMK[d.k]&&a.g.visible){a.em={k:d.k,t:0};emFloat(a.g,d.k)}}
 else if(d.t=='rel')relRecv(d,m)
 else if(d.t=='scr')scrRecv(d,m)
 else if(d.t=='gr')gearRecv(d,m)
 else if(d.t=='cm')cmRecv(d,m)
 else if(d.t=='fx'&&m.ad&&window.WFUN_RECV)window.WFUN_RECV(id,d)}
const myUid=()=>{if(FW_ACCT)return FW_ACCT.slice(0,16);try{let u=localStorage.getItem(SAVE_PRE+'mpuid');if(!u){u=Math.random().toString(36).slice(2,12);localStorage.setItem(SAVE_PRE+'mpuid',u)}return u}catch(e){return''}};
const myName=()=>String(MPS.nm||(INS[MPS.inst]?INS[MPS.inst].n:'Band')+' player').slice(0,24);
const myLook=()=>{try{return JSON.parse(JSON.stringify(ch))}catch(e){return null}};

/* ---- your own state: sent about 8 times a second while it changes ---- */
function stg(){try{if(typeof FEST=='undefined'||FEST.ph!='fest'||IN)return 0;const s=FSTG.find(s=>P.x>s.x0-10&&P.x<s.x1+10&&P.z>s.zb-6&&P.z<s.zf+35);return s?s.n:0}catch(e){return 0}}
function zone(){if(['title','creator','load'].includes(mode))return'menu';try{return IN?'i'+IN.i+(IN.i==7?'f'+S.fl:''):'o'}catch(e){return'o'}}
function where(){try{if(['title','creator','load'].includes(mode))return'in the menu';if(IN)return SHOPS[IN.i].name;if(typeof FEST!='undefined'&&FEST.view)return'on stage';const n=stg();if(n)return'Festival, Stage '+n;
 if(P.x>=0&&P.x<=16&&P.z>=0&&P.z<=12)return P.x<8?(P.z<6?'Bedroom':'Living room'):(P.z<6?'Studio':'Kitchen');return mode=='drive'?'driving':'out in town'}catch(e){return''}}
function netTick(){if(!MPS||!S)return;ME.nm=myName();ME.inst=MPS.inst;ME.ad=(typeof isAdmin=='function'&&isAdmin())?1:0;ME.x=+P.x.toFixed(2);ME.z=+P.z.toFixed(2);ME.r=+(P.rot||0).toFixed(2);ME.zone=zone();ME.where=where();
 ME.ctry=ctry();ME.studio=ME.zone=='o'&&P.x>8&&P.x<16&&P.z>0&&P.z<6?1:0;ME.stg=stg();ME.col=colNear();
 /* ready only holds while you are where it counts */
 if(ME.rd&&((ME.rd.k=='rec'&&!ME.studio&&mode!='rec')||(ME.rd.k=='fest'&&ME.stg!=ME.rd.n&&mode!='fest')||(ME.rd.k=='slp'&&(Math.hypot(P.x-ME.rd.x,P.z-ME.rd.z)>2.5||mode!='play'))||(ME.rd.k=='col'&&ME.col!==ME.rd.a&&mode!='cut'))){ME.rd=null;send({t:'rd',rd:null});say('You walked away, so you are no longer ready.')}
 if(ME.rd&&!band()){const r=ME.rd;ME.rd=null;if(r.k=='rec'){MPGO=1;try{startRec(r.g)}finally{MPGO=0}}else if(r.k=='slp'){if(mode=='play')sleepNow(0)}else if(r.k=='fest'&&r.lead&&festBk){MPGO=1;try{festStartBooked(festBk)}finally{MPGO=0}}else if(r.k=='col')goCol({a:r.a,op:r.op,n:1})}
 if(online()&&S.artist&&S.artist!==NET.an&&mode!='creator'){NET.an=S.artist;send({t:'an',v:S.artist})}
 if(online()&&S.gear&&mode!='creator'){const gk=JSON.stringify(S.gear);if(gk!==NET.gk){NET.gk=gk;send({t:'gr',g:S.gear})}}
 if(!online())return;const now=Date.now(),o={t:'st',ctry:ME.ctry,x:ME.x,z:ME.z,r:ME.r,zone:ME.zone,where:ME.where,studio:ME.studio,stg:ME.stg,nm:ME.nm,col:ME.col},k=JSON.stringify(o);
 if(k!==NET.lastSt||now-NET.stT>1000){NET.lastSt=k;NET.stT=now;if(now-NET.lkT>4000){NET.lkT=now;ME.look=o.look=myLook()}send(o)}
 if(isHost()){if(now-NET.clkT>2000){NET.clkT=now;sendAll({t:'clk',day:S.day,tm:S.t})}hostCheck()}}
setInterval(()=>{try{netTick()}catch(e){console.error('mp tick',e)}},120);
/* the host starts a band take or set once every online member is there and ready */
function hostCheck(){const L=list();if(L.length<2)return;
 if(L.every(m=>m.rd&&m.rd.k=='rec'&&m.studio)){const f=L.slice().sort((a,b)=>a.rd.ts-b.rd.ts)[0];send({t:'go',k:'rec',g:f.rd.g,n:L.length,title:f.rd.title||'',bl:MPS.code+'-'+Date.now().toString(36)});return}
 const sl=L.find(m=>m.rd&&m.rd.k=='slp');if(sl){const G=L.filter(m=>(m.ctry||'home')==(sl.ctry||'home'));if(G.every(m=>m.rd&&m.rd.k=='slp')){send({t:'go',k:'slp',ctry:sl.ctry||'home'});return}}
 const cl=L.slice().sort((a,b)=>(a.rd&&a.rd.ts||0)-(b.rd&&b.rd.ts||0)).find(m=>m.rd&&m.rd.k=='col');
 if(cl&&L.every(m=>m.rd&&m.rd.k=='col'&&m.rd.a===cl.rd.a&&m.col===cl.rd.a)){const a=ART[cl.rd.a];send({t:'go',k:'col',a:cl.rd.a,op:cl.rd.op||0,n:L.length,title:featT(pick(A)+' '+pick(Bn),a[0]),bl:MPS.code+'-c'+Date.now().toString(36)});return}
 const ld=L.find(m=>m.rd&&m.rd.k=='fest'&&m.rd.lead);
 if(ld&&L.every(m=>m.rd&&m.rd.k=='fest'&&m.rd.n==ld.rd.n&&m.stg==ld.rd.n))send({t:'go',k:'fest',n:ld.rd.n,lead:ld.id,slot:ld.rd.slot,songs:ld.rd.songs,cnt:L.length})}
function go(d){const r=ME.rd;for(const k in MB)MB[k].rd=null;ME.rd=null;if(!r||r.k!==d.k)return;
 if(d.k=='rec'){MPGO=1;try{startRec(d.g)}finally{MPGO=0}if(rec&&mode=='rec'){rec.band=d.n;rec.bt=d.title||'';rec.bl=d.bl;BT=d.bl;const sp=SPOT[MPS.inst];P.x=sp[0];P.z=sp[1];P.rot=sp[2];say('Band take! Everyone plays their part.')}}
 else if(d.k=='col'){closeUI();goCol(d)}
 else if(d.k=='slp'){closeUI();say('The whole band is in bed. Good night!');sleepNow(0)}
 else if(d.k=='fest'){MPF=1;if(d.lead===ME.id&&festBk){MPGO=1;try{festStartBooked(festBk)}finally{MPGO=0}}else guestSet(d);if(mode!='fest')MPF=0}}
/* the host's clock is the band's clock */
function clock(d,force){if(mode=='sleep'||mode=='creator'||mode=='load'||!S)return;
 if(d.day==S.day){if(force||Math.abs(S.t-d.tm)>1.5)S.t=d.tm}
 else if(d.day==S.day+1){if(mode=='play'&&!sleepW){sleepW=1;say('The band went to bed, so your day moves on with them.');sleepNow(1);setTimeout(()=>sleepW=0,9000)}}
 else if(d.day>S.day+1){S.day=d.day;S.t=d.tm;try{updateVersion()}catch(e){}}}
/* the band goes to bed together: everyone online in the same country has to be at a bed and press it */
const ctry=()=>{try{const l=S.travel&&S.travel.loc;if(!l||l=='home')return'home';const d=wtDest(l);return d&&d.country||l}catch(e){return'home'}};
const sleepGroup=()=>list().filter(m=>(m.ctry||'home')==ctry());
{const q0=sleepQ;sleepQ=function(){if(!MPS||!online()||sleepGroup().length<2)return q0.apply(this,arguments);
 if(ME.rd&&ME.rd.k=='slp'){snd('pop');return say('You are in bed. Waiting for the rest of the band.')}
 ME.rd={k:'slp',x:P.x,z:P.z,ts:Date.now()};send({t:'rd',rd:ME.rd});snd('pop');say('In bed. The night ends when every bandmate here is in bed too.')}}

/* ---- the other members in the world ---- */
const AV={};
function rmAv(id){const a=AV[id];if(a){scene.remove(a.g);delete AV[id]}}
function avTick(dt){const myZ=zone();for(const id in AV)if(!MB[id]||id===ME.id)rmAv(id);
 for(const id in MB){if(id===ME.id)continue;const m=MB[id];if(m.x==null)continue;let a=AV[id];const lk=JSON.stringify(m.look||{})+'|'+m.nm;
  if(!a||a.k!==lk){rmAv(id);let o;try{o=buildChar(Object.assign({skin:2,eyes:0,mouth:0,hair:2,hc:1,top:0,tc:1,pc:0,body:.4,hgt:.5},m.look||{}))}catch(e){continue}
   const l=lbl(m.nm+' · '+(INS[m.inst]?INS[m.inst].n:''),2.6);l.position.set(0,2.3,0);o.g.add(l);o.g.position.set(m.x,0,m.z);scene.add(o.g);a=AV[id]={g:o.g,legs:o.legs||[],arms:o.arms||[],k:lk,t:0}}
  a.g.visible=m.zone===myZ&&myZ!=='menu';const g=a.g,dx=m.x-g.position.x,dz=m.z-g.position.z,dd=Math.hypot(dx,dz);
  if(dd>6){g.position.set(m.x,0,m.z)}else{const f=Math.min(1,dt*10);g.position.x+=dx*f;g.position.z+=dz*f}
  g.rotation.y=m.r||0;const mv=dd>.05;a.t+=dt*(mv?10:2);const s=mv?.7:.05;
  if(a.legs.length==2&&a.arms.length==2){a.legs[0].rotation.x=Math.sin(a.t)*s;a.legs[1].rotation.x=-Math.sin(a.t)*s;a.arms[0].rotation.x=-Math.sin(a.t)*s;a.arms[1].rotation.x=Math.sin(a.t)*s;
   if(a.em){a.em.t+=dt;if(mv||!emApply(a.em,a,g,m.r||0,0)){emReset(a,g);a.em=null}}}}}
{const u0=update;update=function(dt){u0.apply(this,arguments);if(!MPS)return;try{avTick(dt);gearTick();panel()}catch(e){console.error('mp',e)}}}

/* ---- the house: bunk beds, everyone's instruments, spawn in the studio ---- */
const bunk=(a,b)=>{const W='#6b4a2e',D='#5a3d24',p=[];[[-.6,-1.1],[.6,-1.1],[-.6,1.1],[.6,1.1]].forEach(([x,z])=>p.push([.08,2.1,.08,D,x,1.05,z]));
 [[.3,.48,.56,.6],[1.35,1.5,1.58,1.62]].forEach(([y0,y1,y2,y3],i)=>{p.push([1.25,.18,2.25,W,0,y0,0],[1.12,.16,2.1,'#e8e4da',0,y1,0],[1.14,.12,1.3,i?b:a,0,y2,.35],[.8,.1,.35,'#fff',0,y3,-.8])});
 p.push([.05,.18,1.4,D,.6,1.78,-.35],[.05,1.55,.05,D,.64,.95,.95],[.05,1.55,.05,D,.64,.95,.55]);[.55,.85,1.15].forEach(y=>p.push([.05,.04,.4,D,.66,y,.75]));return p};
[['bunk','Bunk bed',bunk('#3b6fb5','#c0392b')],['bunk2','Bunk bed',bunk('#2e8b57','#e6b422')],['bed_91','Bunk bed',bunk('#3b6fb5','#c0392b')],['bed_92','Bunk bed',bunk('#2e8b57','#e6b422')]].forEach(([k,n,b])=>Object.defineProperty(F,k,{value:{n,p:0,w:1.3,d:2.3,b},enumerable:false,writable:true,configurable:true}));
['bed_91','bed_92'].forEach(k=>{const o={r:1.4,get l(){return INT[0].l},a:()=>INT[0].a()};spFollow(o,k,.95,0);INT.push(o)});
{const e0=ensureStarters;ensureStarters=function(){if(S.sp||!MPS)return e0.apply(this,arguments);if(typeof PL=='undefined'||!scene)return;S.sp=1;if(!S.inv)S.inv={};
 [['bed_91',1,1.55,0],['bed_92',1,4.45,0],['nstand',2.2,.45,0],['desk',6,.7,0],['srug',4.5,4,0]].forEach(([k,x,z,r])=>{if(PL.some(q=>q.t==k)||S.inv[k]>0)return;const m=mkF(k);m.position.set(x,0,z);m.rotation.y=r*Math.PI/2;scene.add(m);PL.push({t:k,x,z,r,m})})}}
let bassG=null,gearK='';
function gearTick(){if(!S||!S.gear||mode=='creator')return;migBunk();const mp=S.mp=S.mp&&typeof S.mp=='object'?S.mp:{};mp.code=MPS.code;mp.inst=MPS.inst;mp.band=MPS.band;mp.host=MPS.host?1:0;
 if(!Array.isArray(mp.seen))mp.seen=[];list().concat([ME]).forEach(m=>{if(INS[m.inst]&&!mp.seen.includes(m.inst))mp.seen.push(m.inst)});
 const k=mp.seen.join();if(k===gearK)return;gearK=k;let ch0=0;
 if(mp.seen.includes('ky')&&!(S.gear.keys>=1)){S.gear.keys=1;ch0=1}if(mp.seen.includes('dr')&&!(S.gear.drums>=1)){S.gear.drums=1;ch0=1}
 if(ch0)try{buildStudio()}catch(e){}
 if(mp.seen.includes('bs')&&!bassG){const g=bassG=new THREE.Group();B(g,.06,.9,.06,'#222',0,.45,0);B(g,.4,.05,.3,'#222',0,.03,0);const t=new THREE.Group();t.position.set(0,.75,.1);t.rotation.z=-.15;g.add(t);
  B(t,.42,.55,.12,'#1f3a6e',0,-.15,0);B(t,.1,1,.07,'#3a2a1a',0,.6,0);B(t,.18,.16,.09,'#222',0,1.15,0);B(t,.3,.04,.13,'#ddd',0,-.12,.01);g.position.set(15.45,0,4);scene.add(g);
  INT.push({x:15.1,z:3.6,r:1,l:'Play bass',a:()=>say(pick(['You lock into a deep groove.','Thump, thump. The floor shakes a little.','You slide up the neck and back down.']))})}}
function spawn(){if(!MPS||IN)return;const sp=SPOT[MPS.inst]||SPOT.vo;P.x=sp[0];P.z=sp[1]+.5;P.rot=0;camT.x=P.x;camT.z=P.z;if(P.mesh)P.mesh.position.set(P.x,0,P.z)}
{const p0=ttPlay;ttPlay=function(){const r=p0.apply(this,arguments);if(MPS&&mode=='play')try{spawn()}catch(e){}return r}}
{const c0=confirmChar;confirmChar=function(){const r=c0.apply(this,arguments);if(MPS)try{spawn();const b=document.querySelector('#ui .box');if(b)b.querySelector('h2').insertAdjacentHTML('afterend',`<p>You play <b>${iName(MPS.inst)}</b> in <b>${esc(MPS.band||'the band')}</b>. Your bandmates live here too: bunk beds in the bedroom, everyone's instruments in the studio. Room code <b>${esc(MPS.code)}</b>.</p>`)}catch(e){}return r}}

/* ---- recording: everyone online must be in the studio and ready ---- */
{const s0=startRec;startRec=function(i){if(!MPS||MPGO||!band())return s0.apply(this,arguments);
 const ti=$('mpst'),o=list().filter(m=>m.rd&&m.rd.k=='rec').sort((a,b)=>a.rd.ts-b.rd.ts)[0];
 ME.rd={k:'rec',g:o?o.rd.g:i,title:o?o.rd.title:(ti&&ti.value.trim()||pick(A)+' '+pick(Bn)).slice(0,32),ts:Date.now()};send({t:'rd',rd:ME.rd});closeUI();snd('pop');say('Ready to record. Waiting for the whole band in the studio.')}}
window.mpRecReady=()=>{if(!S.artist)return say('Pick an artist name on the computer first.');if(S.energy<15)return say('Too tired to record. Get some sleep.');
 const o=list().filter(m=>m.rd&&m.rd.k=='rec').sort((a,b)=>a.rd.ts-b.rd.ts)[0];startRec(o?o.rd.g:0)};
window.mpUnready=()=>{snd('click');ME.rd=null;send({t:'rd',rd:null})};
/* the band take is better with more members */
{const f0=mgFinish;mgFinish=function(){if(rec&&rec.bl===BT)BT=null;const bt=rec&&rec.bt,bl=rec&&rec.bl,b=rec&&rec.band||0,sc=rec&&rec.sc?[rec.sc.l||0,rec.sc.x||0]:[0,0],n0=S.nid;const r=f0.apply(this,arguments);
 try{if(MPS){const d=S.drafts[S.drafts.length-1],add=b>1?3*(b-1):0;if(d&&d.id===n0&&add){d.q+=add;const p=document.querySelector('#ui .box p.m');if(p)p.insertAdjacentHTML('afterend',`<p class=m>Band take with ${b} members: +${add} quality</p>`)}
  if(MPS.inst!='vo'){const c=[...document.querySelectorAll('#ui .box .card')].find(c=>c.firstChild&&c.firstChild.textContent=='Lyrics');if(c)c.firstChild.textContent=INS[MPS.inst].st}
  const d2=S.drafts[S.drafts.length-1];if(bl&&d2&&d2.id===n0){d2.title=bt||d2.title;d2.bt=d2.title;d2.bl=bl;(BQ[bl]=BQ[bl]||{})[ME.id]=d2.q;const t=$('tin');if(t){t.value=d2.title;t.readOnly=true;t.blur();t.insertAdjacentHTML('afterend','<p class=m><small>Band song: everyone in the take gets it, and releasing it releases it for the whole band.</small></p>')}if(REL[bl])setTimeout(()=>relDo(bl),300)}
  if(b>1)send({t:'dn',sc:(sc[0]+sc[1])/2,q:d2&&d2.q,bl})}}catch(e){console.error('mp finish',e)}return r}}

/* ---- the middle recording step depends on your instrument (vocals keep the rhyming) ---- */
const igKind=()=>MPS&&MPS.inst!='vo'?MPS.inst:'';
const IG_HOW={dr:'Hit each drum as its note reaches the line: keys 1-4 (or D F J K), or tap the pads.',gt:'Watch the riff light up the strings, then play it back with keys 1-4 or tap. Three riffs.',
 bs:'Press SPACE (or tap) exactly on every beat of the groove. The first two beats count you in.',ky:'Press the lit piano key before time runs out: keys A S D F G H J, 1-7, or tap.'};
if(igKind()){MG_N[1]=INS[igKind()].st;MG_HOW[1]=IG_HOW[igKind()]}
const PADC=['#ff5a5a','#f5c542','#2fe68a','#5aa8ff'],DRN=['Kick','Snare','Hat','Crash'],STR=['E','A','D','G'],KBL=['A','S','D','F','G','H','J'],KBN=[262,294,330,349,392,440,494];
function igNew(k){
 if(k=='dr'){const N=[];let t=1.4;for(let i=0;i<16;i++){N.push({l:Math.random()*4|0,at:t,h:0});t+=pick([.42,.56,.56,.7,.84])}return{k,t:0,N,pts:0,end:t+.5,fb:'',lit:[0,0,0,0]}}
 if(k=='gt')return{k,t:0,R:[3,4,5].map(n=>Array.from({length:n},()=>Math.random()*4|0)),r:0,ph:'show',i:0,lt:0,ok:0,tot:12,lit:-1,lim:0,fb:''};
 if(k=='bs')return{k,t:0,bp:.62,t0:1.2,lead:2,n:10,res:[],fb:''};
 return{k,t:0,i:0,n:10,ok:0,cur:Math.random()*7|0,lt:0,lim:1.7,fb:'',pk:-1,fbt:0}}
const igBeat=(g,j)=>g.t0+j*g.bp;
function igEnd(sc){rec.sc.l=Math.max(0,Math.min(1,sc));rec.ig=null;MGK='';mgStage(2)}
function igTick(dt){const g=rec.ig;g.t+=dt;
 if(g.k=='dr'){g.lit=g.lit.map(v=>Math.max(0,v-dt));g.N.forEach(n=>{if(!n.h&&g.t>n.at+.22){n.h=-1;g.fb='Miss'}});if(g.t>=g.end)igEnd(g.pts/g.N.length)}
 else if(g.k=='gt'){const q=g.R[g.r];g.lt+=dt;
  if(g.ph=='show'){const j=Math.floor(g.lt/.55);g.lit=j<q.length&&g.lt-j*.55<.4?q[j]:-1;if(g.lit>=0&&g.lit!==g.pl){g.pl=g.lit;sfx(MG_NOTE[g.lit]/2,.25,'sawtooth',.06)}if(g.lit<0)g.pl=-1;if(j>=q.length+.5){g.ph='play';g.i=0;g.lt=0;g.lim=2.5+q.length*.9;g.lit=-1;g.fb='Your turn'}}
  else if(g.ph=='play'){if(g.lt>=g.lim){g.fb='Too slow';g.ph='gap';g.lt=0}}
  else if(g.ph=='gap'&&g.lt>.9){g.lit=-1;if(++g.r>=g.R.length)return igEnd(g.ok/g.tot);g.ph='show';g.lt=0;g.fb='Watch the riff'}}
 else if(g.k=='bs'){for(let j=g.lead;j<g.lead+g.n;j++){const k=j-g.lead;if(g.res[k]==null&&g.t>igBeat(g,j)+.25){g.res[k]=0;g.fb='Missed a beat'}}
  const jb=Math.floor((g.t-g.t0)/g.bp+.001);if(jb>=0&&jb!==g.lb&&jb<g.lead+g.n){g.lb=jb;sfx(jb<g.lead?660:110,.08,jb<g.lead?'square':'sine',.08)}
  if(g.t>igBeat(g,g.lead+g.n-1)+.5)igEnd(g.res.reduce((a,b)=>a+(b||0),0)/g.n)}
 else{g.lt+=dt;if(g.fbt>0)g.fbt-=dt;if(g.lt>=g.lim){g.fb='Too slow';g.fbt=.5;g.pk=-1;igNext(g)}}}
function igNext(g){if(++g.i>=g.n)return igEnd(g.ok/g.n);let c;do c=Math.random()*7|0;while(c===g.cur);g.cur=c;g.lt=0;g.lim=Math.max(.85,1.7-g.i*.09)}
window.mpIg=p=>{if(!rec||!rec.ig||mode!='rec'||rec.wait||rec.cdn>0)return;const g=rec.ig;
 if(g.k=='dr'){if(p<0||p>3)return;g.lit[p]=.15;sfx([70,190,900,600][p],.08,p<2?'sine':'square',.09);let b=null,bd=.22;g.N.forEach(n=>{const d=Math.abs(g.t-n.at);if(!n.h&&n.l==p&&d<bd){bd=d;b=n}});
  if(b){b.h=1;g.pts+=bd<.08?1:bd<.15?.7:.4;g.fb=bd<.08?'Perfect':bd<.15?'Good':'OK'}else{g.pts=Math.max(0,g.pts-.1);g.fb='Off the beat'}}
 else if(g.k=='gt'){if(g.ph!='play'||p<0||p>3)return;const q=g.R[g.r];g.lit=p;g.pt=g.t;sfx(MG_NOTE[p]/2,.2,'sawtooth',.07);
  if(q[g.i]===p){g.ok++;if(++g.i>=q.length){g.fb='Nailed it';g.ph='gap';g.lt=0}}else{g.fb='Wrong string';g.ph='gap';g.lt=0}}
 else if(g.k=='bs'){let bj=-1,bd=g.bp/2;for(let j=g.lead;j<g.lead+g.n;j++){const d=Math.abs(g.t-igBeat(g,j));if(d<bd&&g.res[j-g.lead]==null){bd=d;bj=j}}sfx(90,.12,'sine',.12);
  if(bj<0){g.fb='Wait for the beat';return}const off=g.t-igBeat(g,bj);g.res[bj-g.lead]=bd<.06?1:bd<.12?.7:bd<.2?.4:.1;g.fb=bd<.06?'Perfect':off<0?'Early':'Late'}
 else{if(p<0||p>6)return;sfx(KBN[p],.2,'triangle',.08);g.pk=p;g.fbt=.25;if(p===g.cur){g.ok++;g.fb='✓'}else g.fb='✗';igNext(g)}};
addEventListener('keydown',e=>{if(mode!='rec'||!rec||!rec.ig||rec.wait||rec.cdn>0||e.repeat||/INPUT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase(),g=rec.ig,n=parseInt(k);
 if(g.k=='dr'){const i=n>=1&&n<=4?n-1:['d','f','j','k'].indexOf(k);if(i>=0)mpIg(i)}
 else if(g.k=='gt'){if(n>=1&&n<=4)mpIg(n-1)}
 else if(g.k=='bs'){if(k==' '||k=='enter'||k=='e'){e.preventDefault();mpIg(0)}}
 else{const i=n>=1&&n<=7?n-1:KBL.map(x=>x.toLowerCase()).indexOf(k);if(i>=0)mpIg(i)}});
{const s0=mgStage;mgStage=function(n){const k=igKind();if(n==1&&k&&rec){snd('pop');rec.st=1;rec.wait=1;rec.wt=0;rec.ig=igNew(k);return}return s0.apply(this,arguments)}}
{const t0=recTick;recTick=function(dt){if(rec&&rec.ig&&rec.st==1){if(rec.wait){rec.wt+=dt;return}if(rec.cdn>0){rec.cdn-=dt;if(rec.cdn<=0){rec.cdn=0;rec.cgo=.5}return}if(rec.cgo>0)rec.cgo-=dt;return igTick(dt)}return t0.apply(this,arguments)}}
{const p0=mgPress;mgPress=function(){if(rec&&rec.ig)return;return p0.apply(this,arguments)}}
{const d0=mgDraw;mgDraw=function(){if(mode=='rec'&&rec&&rec.ig&&rec.st==1&&!rec.wait)return igDraw();return d0.apply(this,arguments)}}
let IGK='';
function igDraw(){let el=$('mg');if(!el){el=document.createElement('div');el.id='mg';document.body.appendChild(el)}document.body.classList.add('mgon');const g=rec.ig;
 const strip='<div class=mgs>'+MG_N.map((n,i)=>i==1?'<b>2. '+n+'</b>':(i+1)+'. '+n).join(' → ')+'</div>',key=g.k+(g.r||0);
 if(key!==IGK||MGK!=='ig'){IGK=key;MGK='ig';el.className='box mpig';el.style.bottom='';let h=strip+`<b>${INS[g.k].e} ${INS[g.k].st}</b> <small class=m id=mpis></small><div class=fb id=mpfb></div>`;
  if(g.k=='dr')h+=`<div class=lanes id=mpln></div><div class=pads>${DRN.map((n,i)=>`<button class=pad style="--c:${PADC[i]}" onpointerdown="mpIg(${i})">${i+1}<br><small>${n}</small></button>`).join('')}</div>`;
  else if(g.k=='gt')h+=`<div class=pads>${STR.map((n,i)=>`<button class=pad style="--c:${PADC[i]}" onpointerdown="mpIg(${i})">${i+1}<br><small>${n} string</small></button>`).join('')}</div><div class=bar style="width:100%;height:8px;margin-top:8px"><i id=mgtm></i></div>`;
  else if(g.k=='bs')h+=`<div class=ring><b></b><i id=mprg></i></div><div class=dots id=mpdt></div><button class="go mphit" onpointerdown="mpIg(0)">Hit (Space)</button>`;
  else h+=`<div class=kb>${KBL.map((n,i)=>`<button onpointerdown="mpIg(${i})">${n}</button>`).join('')}</div><div class=bar style="width:100%;height:8px"><i id=mgtm></i></div>`;
  el.innerHTML=h}
 const fb=$('mpfb'),is=$('mpis'),tm=$('mgtm');if(fb)fb.textContent=g.fb||' ';
 if(g.k=='dr'){if(is)is.textContent='· hit the notes on the line';const L=$('mpln');if(L){let h='<div class=hl></div>';g.N.forEach(n=>{const a=n.at-g.t;if(n.h==1||a>1.6||a<-.25)return;h+=`<div class=nt style="left:${n.l*25+3}%;top:${Math.round((1-a/1.6)*128)}px;background:${PADC[n.l]};opacity:${n.h<0?.3:1}"></div>`});L.innerHTML=h}
  el.querySelectorAll('.pad').forEach((b,i)=>b.classList.toggle('on',g.lit[i]>0))}
 else if(g.k=='gt'){const q=g.R[g.r];if(is)is.textContent='· riff '+(g.r+1)+'/3 · '+(g.ph=='show'?'watch':g.ph=='play'?'play it back '+g.i+'/'+q.length:'');el.querySelectorAll('.pad').forEach((b,i)=>b.classList.toggle('on',g.lit===i));
  if(tm)tm.style.width=g.ph=='play'?Math.max(0,100-g.lt/g.lim*100)+'%':'0%';if(g.ph!='show'&&g.t-(g.pt||0)>.2)g.lit=-1}
 else if(g.k=='bs'){const j=Math.max(0,Math.ceil((g.t-g.t0)/g.bp-.001)),f=Math.max(0,Math.min(1,(igBeat(g,j)-g.t)/g.bp)),rg=$('mprg');if(rg){const s=Math.round(24+f*96);rg.style.width=rg.style.height=s+'px'}
  if(is)is.textContent=j<g.lead?'· count in: '+(j+1):'· beat '+Math.min(g.n,j-g.lead+1)+'/'+g.n;const dt=$('mpdt');if(dt)dt.innerHTML=Array.from({length:g.n},(_,i)=>{const v=g.res[i];return`<span style="background:${v==null?'#333':v>=.7?'#2fe68a':v>=.4?'#f5c542':'#ff4455'}"></span>`}).join('')}
 else{if(is)is.textContent='· note '+Math.min(g.n,g.i+1)+'/'+g.n;if(tm)tm.style.width=Math.max(0,100-g.lt/g.lim*100)+'%';el.querySelectorAll('.kb button').forEach((b,i)=>{b.classList.toggle('on',i===g.cur);b.classList.toggle('no',g.fbt>0&&i===g.pk&&g.fb=='✗')})}}

/* ---- festivals: the whole band at the stage, crowd games that fit your instrument ---- */
{const f0=festStartBooked;festStartBooked=function(bk){if(!MPS||MPGO||!band())return f0.apply(this,arguments);
 const L=(bk.songs||[]).map(id=>S.songs.find(x=>x.id==id)).filter(Boolean);if(!L.length||S.energy<15)return f0.apply(this,arguments);
 festBk=bk;ME.rd={k:'fest',n:bk.n,lead:1,slot:bk.slot,songs:L.map(s=>({id:s.id,t:s.title,q:s.q,g:s.g})),ts:Date.now()};send({t:'rd',rd:ME.rd});snd('pop');say('Waiting for the whole band at Stage '+bk.n+'.')}}
window.mpFestReady=n=>{if(S.energy<15){snd('err');return say('Too tired to perform. Grab some food first (15 energy needed).')}snd('pop');ME.rd={k:'fest',n,ts:Date.now()};send({t:'rd',rd:ME.rd})};
function guestSet(d){const s=fStage(d.n);if(!s||!s.cr||FEST.ph!='fest'){MPF=0;return say('The festival is not on for you, so you could not join the set.')}
 const list=(d.songs||[]).map(x=>({id:x.id,title:x.t,q:x.q||10,g:x.g,day:S.day,streams:0,today:0}));if(!list.length)return;
 const bk={id:-1,day:S.day,n:d.n,slot:d.slot||0,songs:[],st:0};S.energy=Math.max(0,S.energy-15);$('ui').innerHTML='';const C0=festC0(s,list[0]);
 FEST.set={st:s,bk,list,i:0,song:list[0],sm:0,dur:festDur(list[0]),C0,C:C0*.45,T:C0*.6,start:Math.round(C0*.45),t:0,mg:null,next:R(4,6.5),sc:[],ss:[],last:'',beat:0,bt:0,songT:0,hype:.45,end:0,peak:0,
  pay:0,str:0,fol:0,done:[],fin:0,m0:festMins()};
 mode='fest';P.rot=0;festViewOn(s);festSongStart();snd('whoosh');setTimeout(()=>nz(2.2,900,.16,.6,'bandpass'),200)}
{const p0=festStagePeople;festStagePeople=function(){const r=p0.apply(this,arguments);if(MPS&&MPF){const o=STOFF[MPS.inst]||[0,0];P.x+=o[0];P.z+=o[1]}return r}}
{const l0=festLeave;festLeave=function(){MPF=0;return l0.apply(this,arguments)}}
const FOK={vo:['lyric','hold','call','hype'],gt:['call','drop','hype'],bs:['drop','hold','hype'],dr:['drop','hype','call'],ky:['call','hold','drop']};
if(MPS){const k=MPS.inst,T={gt:{hype:'Shred a solo!',call:'Play the riff back!',drop:'Hit the power chord!'},bs:{hype:'Slap the bass!',drop:'Drop the bass!',hold:'Hold the low note!'},dr:{hype:'Drum fill!',drop:'Hit the crash!',call:'Copy the beat!'},ky:{call:'Play the melody back!',hold:'Hold the chord!',drop:'Hit the stab!'}}[k];if(T)Object.assign(FMG,T)}
{const m0=festMgStart;festMgStart=function(){const r=m0.apply(this,arguments);try{const ok=MPS&&FOK[MPS.inst];if(ok){for(let i=0;i<12;i++){const m=FEST.set&&FEST.set.mg;if(!m||ok.includes(m.k))break;m0.apply(this,arguments)}}}catch(e){}return r}}

/* ---- band panel ---- */
{const st=document.createElement('style');st.textContent=`#mpb{position:fixed;left:10px;top:120px;z-index:4;width:min(270px,72vw);font-size:12px;pointer-events:auto}
#mpb .mph{display:flex;justify-content:space-between;align-items:center;gap:6px;cursor:pointer}#mpb .mph b{color:var(--g)}
#mpb .mpr{display:flex;gap:6px;margin-top:3px;align-items:baseline}#mpb .mpr span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#mpb .ok{color:var(--g)}
#mpb .mps{margin-top:6px;padding-top:6px;border-top:1px solid #2a352e}#mpb button{padding:4px 8px;font-size:12px;margin:4px 4px 0 0}
body.fston #mpb,body.mgon #mpb,body.dsshow #mpb{display:none}
.mpins{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:8px 0 12px}.mpins button{padding:8px 2px;line-height:1.3}.mpins button.on{background:var(--g);color:#04120a}
.mpig .fb{min-height:18px;font-weight:bold;color:#f5c542;margin:4px 0}
.mpig .lanes{position:relative;height:150px;margin:6px 0;background:#0a0d0b;border:2px solid #000;overflow:hidden}
.mpig .hl{position:absolute;left:0;right:0;top:134px;height:4px;background:#ffffff66}.mpig .nt{position:absolute;width:19%;height:12px;border:2px solid #000}
.mpig .pads{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}.mpig .pad{height:56px;background:var(--c);border:3px solid #000;opacity:.4;font:inherit;color:#000;cursor:pointer}.mpig .pad.on{opacity:1;box-shadow:0 0 14px var(--c)}
.mpig .kb{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin:8px 0}.mpig .kb button{height:84px;background:#f4f4f4;color:#111;border:2px solid #000;display:flex;align-items:flex-end;justify-content:center;padding:0 0 6px}.mpig .kb button.on{background:#2fe68a}.mpig .kb button.no{background:#ff4455}
.mpig .ring{width:120px;height:120px;margin:6px auto;position:relative}.mpig .ring b{position:absolute;left:50%;top:50%;width:24px;height:24px;transform:translate(-50%,-50%);border:4px solid var(--g);border-radius:50%}
.mpig .ring i{position:absolute;left:50%;top:50%;border:3px solid #fff;border-radius:50%;transform:translate(-50%,-50%)}
.mpig .dots{display:flex;gap:4px;justify-content:center;margin:6px 0}.mpig .dots span{width:14px;height:14px;border:2px solid #000}.mpig .mphit{width:100%;height:52px}`;document.head.appendChild(st)}
let PK='',PMIN=0;window.mpTog=()=>{PMIN=!PMIN;PK=''};
function panel(){let el=$('mpb');const on=['play','menu','drive'].includes(mode);
 if(!on){if(el)el.style.display='none';return}if(!el){el=document.createElement('div');el.id='mpb';el.className='hb';document.body.appendChild(el)}el.style.display='';
 const L=list(),me=L.length?L:[ME],n=me.length,head=`<div class=mph onclick="mpTog()"><span><b>${esc(MPS.band||'Band')}</b> <small class=m>Room ${esc(MPS.code)}${NET.fb?' · relay':''}</small></span><small class=m>${PMIN?'▸':'▾'}</small></div>`;
 let h=head;if(!PMIN){
  if(!online())h+=`<div class=m style="margin-top:4px">${NET.closed?'Not in the room.':NET.on||NET.tries?'Room offline. Reconnecting…':'Connecting to the room…'} You play ${iName(MPS.inst)}.</div>`;
  else{h+=me.map(m=>`<div class=mpr><i class="${m.rd?'ok':''}" style="font-style:normal">${m.rd?'✓':'·'}</i><span><b>${esc(m.nm||'Player')}</b>${m.id===ME.id?' (you)':''} · ${INS[m.inst]?INS[m.inst].e:''} <small class=m>${esc(m.where||'')}</small></span>${isHost()&&m.id!==ME.id?`<button title="Remove from room" style="margin-left:auto;padding:0 6px" onclick="mpKick('${m.id}')">✕</button>`:''}</div>`).join('');
   if(n>1){const rr=me.filter(m=>m.rd&&m.rd.k=='rec');if(rr.length){h+=`<div class=mps>Recording${rr[0].rd.title?' "'+esc(rr[0].rd.title)+'"':''}: <b>${rr.length}/${n} members ready</b>`;
     const away=me.filter(m=>!m.studio).map(m=>esc(m.nm));if(away.length)h+=`<br><small class=m>Not in the studio: ${away.join(', ')}</small>`;
     h+=ME.rd&&ME.rd.k=='rec'?'<br><button onclick="mpUnready()">Not ready</button>':ME.studio?'<br><button class=go onclick="mpRecReady()">Ready to record</button>':'<br><small class=m>Go to the studio to join the take.</small>';h+='</div>'}
    const sp=me.filter(m=>m.rd&&m.rd.k=='slp');if(sp.length){const G=me.filter(m=>(m.ctry||'home')==(sp[0].ctry||'home')),aw=G.filter(m=>!(m.rd&&m.rd.k=='slp')).map(m=>esc(m.nm)),ab=me.length-G.length;
     h+=`<div class=mps>Going to sleep: <b>${sp.length}/${G.length} in bed</b>${aw.length?`<br><small class=m>Not in bed: ${aw.join(', ')}</small>`:''}${ab?`<br><small class=m>${ab} abroad, so not needed</small>`:''}`+(ME.rd&&ME.rd.k=='slp'?'<br><button onclick="mpUnready()">Get up</button>':'<br><small class=m>Press E at a bed to join.</small>')+'</div>'}
    const cr=me.find(m=>m.rd&&m.rd.k=='col');if(cr){const ca=cr.rd.a,cn=artN(ca),cy=me.filter(m=>m.rd&&m.rd.k=='col'&&m.rd.a===ca),aw=me.filter(m=>m.col!==ca).map(m=>esc(m.nm));
     h+=`<div class=mps>Collab with ${esc(cn)}: <b>${cy.length}/${n} members ready</b>${aw.length?`<br><small class=m>Not with ${esc(cn)}: ${aw.join(', ')}</small>`:''}`+(ME.rd&&ME.rd.k=='col'?'<br><button onclick="mpUnready()">Not ready</button>':ME.col===ca?`<br><button class=go onclick="mpColReady(${ca})">Ready to record</button>`:`<br><small class=m>Go to ${esc(cn)} to join.</small>`)+'</div>'}
    const ld=me.find(m=>m.rd&&m.rd.k=='fest'&&m.rd.lead);if(ld){const fr=me.filter(m=>m.rd&&m.rd.k=='fest'&&m.rd.n==ld.rd.n);h+=`<div class=mps>Stage ${ld.rd.n} set: <b>${fr.length}/${n} members ready</b>`;
     const away=me.filter(m=>m.stg!=ld.rd.n).map(m=>esc(m.nm));if(away.length)h+=`<br><small class=m>Not at Stage ${ld.rd.n}: ${away.join(', ')}</small>`;
     h+=ME.rd&&ME.rd.k=='fest'?(ME.rd.lead?'<br><button onclick="mpUnready()">Cancel the set</button>':'<br><button onclick="mpUnready()">Not ready</button>'):ME.stg==ld.rd.n?`<br><button class=go onclick="mpFestReady(${ld.rd.n})">Ready to play</button>`:`<br><small class=m>Go to Stage ${ld.rd.n} at the festival.</small>`;h+='</div>'}}}}
 if(!PMIN)h+='<div class=mps><button onclick="emWheel()">😀 Emotes (B)</button></div>';
 if(h!==PK){PK=h;el.innerHTML=h}}

/* ===== v45.5.0: band room fixes, shared artist account, linked band songs ===== */
/* the bunks are beds (bed_91, bed_92) so Storage knows the band has somewhere to sleep; v45.4.0 band saves are moved over */
/* gear shop upgrades are for the shared house: everyone gets the best level any bandmate has bought */
function gearRecv(d,m){if(!d.g||typeof d.g!='object'||!S.gear)return;const up=[];for(const k in d.g){const v=+d.g[k];if(typeof GEAR!='undefined'&&GEAR[k]&&isFinite(v)&&v>(S.gear[k]||0)){S.gear[k]=Math.min(v,(GEAR[k].c||[]).length||v);up.push(GEAR[k].n||k)}}
 if(up.length){NET.gk=JSON.stringify(S.gear);try{buildStudio()}catch(e){}try{updateVersion()}catch(e){}say(m.nm+' upgraded the band\'s '+up.join(', ')+'.')}}
function migBunk(){if(S.mpb2||typeof PL=='undefined')return;S.mpb2=1;
 PL.forEach(q=>{if(q.t!='bunk'&&q.t!='bunk2')return;const nk=q.t=='bunk'?'bed_91':'bed_92';if(q.m)scene.remove(q.m);q.t=nk;q.m=mkF(nk);q.m.position.set(q.x,0,q.z);q.m.rotation.y=q.r*Math.PI/2;scene.add(q.m)});
 if(S.inv){['bunk','bunk2'].forEach((k,i)=>{if(S.inv[k]>0){const nk='bed_9'+(i+1);S.inv[nk]=(S.inv[nk]||0)+S.inv[k]}delete S.inv[k]});if(S.inv.bed>0&&PL.some(q=>/^bed_9[12]$/.test(q.t)))delete S.inv.bed}}
/* the wardrobe stood inside the second bunk: in a band house it stands against the studio wall instead */
if(MPS)try{const w=scene.children.find(g=>g.isGroup&&g.children[0]&&g.children[0].geometry&&g.children[0].geometry.parameters&&Math.abs(g.children[0].position.x-.6)<.01&&Math.abs(g.children[0].position.z-4.4)<.01&&Math.abs(g.children[0].geometry.parameters.height-2.2)<.01);
 if(w){w.rotation.y=Math.PI;w.position.set(8,0,9.3)}const c=cols.find(c=>c[0]==.2&&c[1]==3.7&&c[2]==1&&c[3]==5.1);if(c){c[0]=7;c[1]=4.2;c[2]=7.8;c[3]=5.6}
 const o=INT.find(o=>o.l=='Open wardrobe'&&o.x==1.9);if(o){o.x=6.2;o.z=4.9}}catch(e){console.error('band wardrobe',e)}

/* one Spotifly account for the band: the drawn picture shows every member */
const bandLooks=()=>{const m=S&&S.mp&&S.mp.mem;return m?IK.filter(k=>m[k]&&m[k].look).map(k=>m[k].look):[]};
let MEMT=0;setInterval(()=>{if(!MPS||!S||!S.mp||mode=='creator'||mode=='load')return;const mem=S.mp.mem=S.mp.mem&&typeof S.mp.mem=='object'?S.mp.mem:{};
 mem[MPS.inst]={nm:myName(),look:myLook()};list().forEach(m=>{if(m.id!==ME.id&&INS[m.inst]&&m.look)mem[m.inst]={nm:m.nm,look:m.look}})},2000);
let PFK='',PFU='';
function pfComp(im){const k=document.createElement('canvas');k.width=k.height=32;const x=k.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#2a4a38';x.fillRect(0,0,32,32);
 const n=im.length,pos=n==2?[[0,8],[16,8]]:n==3?[[0,0],[16,0],[8,16]]:[[0,0],[16,0],[0,16],[16,16]];im.slice(0,4).forEach((i,j)=>x.drawImage(i,pos[j][0],pos[j][1],16,16));return k.toDataURL()}
{const p0=pfp;pfp=function(c){if(arguments.length||!MPS||(S&&S.pfpSp))return p0.apply(this,arguments);const L=bandLooks();if(L.length<2)return p0();const k=JSON.stringify(L);if(k===PFK&&PFU)return PFU;
 if(k!==PFK){PFK=k;PFU='';let n=0;const im=L.map(l=>{const i=new Image();i.onload=()=>{if(++n==L.length&&PFK===k){PFU=pfComp(im);try{if(mode=='pc')pcR()}catch(e){}}};i.src=p0(l);return i})}return p0()}}

/* band songs: whoever starts the take names it, everyone records it together, and releasing it releases it for the whole band */
const BQ={},REL={};let RELF=0,BT=null;
/* one member running out of goes (or leaving the take) scraps it for the whole band */
setInterval(()=>{if(BT&&!(rec&&rec.bl===BT)){const bl=BT;BT=null;send({t:'scr',bl})}},150);
function scrRecv(d,m){if(!d.bl)return;let hit=0;if(rec&&rec.bl===d.bl){BT=null;rec=null;mode='play';try{mgDraw()}catch(e){}hit=1}
 const i=S.drafts.findIndex(x=>x.bl===d.bl);if(i>=0){S.drafts.splice(i,1);hit=1;if($('tin'))closeUI()}
 if(hit){snd('err');say(m.nm+' ran out of goes, so the band take is scrapped.')}}
const bqAvg=bl=>{const q=Object.values(BQ[bl]||{}).filter(v=>typeof v=='number'&&isFinite(v));return q.length?Math.round(q.reduce((a,b)=>a+b,0)/q.length):null};
function relDo(bl){const d=S.drafts.find(x=>x.bl===bl);if(!d){REL[bl]=1;return}delete REL[bl];const q=bqAvg(bl);if(q!=null)d.q=q;d.title=d.bt||d.title;
 RELF=1;const p=pcR;if(mode!='pc')pcR=()=>{};try{upl(d.id)}catch(e){console.error('band release',e)}finally{pcR=p;RELF=0}}
function relRecv(d,m){if(!d.bl)return;say(m.nm+' released the band song "'+(d.title||'')+'". It is out for the whole band.');relDo(d.bl)}
{const u0=upl;upl=function(id){const d=S.drafts.find(x=>x.id==id),bl=d&&d.bl;if(bl&&MPS&&!RELF){const q=bqAvg(bl);if(q!=null)d.q=q;d.title=d.bt||d.title}
 const r=u0.apply(this,arguments);if(bl&&MPS&&!RELF&&!S.drafts.some(x=>x.id==id))send({t:'rel',bl,title:d.title});return r}}
/* a band song can be released by a bandmate while your title box is still open */
{const t0=saveT;saveT=function(id){if(MPS&&!S.drafts.some(d=>d.id==id)){closeUI();return say('Your band already released this song.')}return t0.apply(this,arguments)}}
{const r0=recMenu;recMenu=function(){if(!MPS||!band())return r0.apply(this,arguments);if(list().some(m=>m.rd&&m.rd.k=='rec'))return mpRecReady();
 const r=r0.apply(this,arguments);try{const b=document.querySelector('#ui .box'),g=b&&b.querySelector('.gen');if(g&&!$('mpst'))g.insertAdjacentHTML('beforebegin',`<div class=r><span>Song name</span><input id=mpst maxlength=32 value="${esc(pick(A)+' '+pick(Bn))}"></div><p class=m style="margin:4px 0 8px"><small>The whole band records this song together, then pick a genre to get ready.</small></p>`)}catch(e){}return r}}

/* ===== emote wheel: B (or the band panel button) opens 8 animated emotes; bandmates see them ===== */
const EMO=[{k:'wave',n:'Wave',e:'👋',d:2.6},{k:'dance',n:'Dance',e:'🕺',d:4.2},{k:'clap',n:'Clap',e:'👏',d:2.6},{k:'cheer',n:'Cheer',e:'🙌',d:2.6},
 {k:'laugh',n:'Laugh',e:'😂',d:2.6},{k:'guitar',n:'Air guitar',e:'🎸',d:3.4},{k:'spin',n:'Spin',e:'🌀',d:1.6},{k:'heart',n:'Love',e:'❤️',d:2.8}];
const EMK={};EMO.forEach(e=>EMK[e.k]=e);
function emReset(L,g){g.position.y=0;(L.arms||[]).forEach(a=>a.rotation.z=0);(L.legs||[]).forEach(a=>a.rotation.z=0);g.rotation.x=0;g.rotation.z=0}
function emApply(em,L,g,r0,y0){const e=EMK[em.k],t=em.t,d=e.d,A=L.arms||[],G=L.legs||[];if(t>=d||A.length<2||G.length<2)return false;
 const v=Math.min(1,t/.2,(d-t)/.2),sn=Math.sin,ab=Math.abs;let y=0,ry=0,rx=0,rz=0,ax=[0,0],az=[0,0],lx=[null,null],lz=[0,0];
 switch(em.k){
  case'wave':az=[0,2.5+.35*sn(t*10)];ax=[.1,-.2];ry=.1*sn(t*5);break;
  case'dance':y=ab(sn(t*6))*.12;ry=.4*sn(t*3);ax=[-1.1*sn(t*6),1.1*sn(t*6)];az=[-.5,.5];lx=[.5*sn(t*6),-.5*sn(t*6)];rz=.08*sn(t*6);break;
  case'clap':{const c=.5+.5*sn(t*14);ax=[-1.35,-1.35];az=[.15+.35*c,-(.15+.35*c)];y=ab(sn(t*7))*.03;break}
  case'cheer':{const j=Math.max(0,sn(t*7));y=j*.35;az=[-(2.7+.2*sn(t*14)),2.7+.2*sn(t*14)];lx=[-.4*j,-.4*j];break}
  case'laugh':rx=-.18+.06*sn(t*18);ax=[-.5,-.5];az=[.6,-.6];y=ab(sn(t*18))*.03;break;
  case'guitar':ax=[-1.1,-.5+.45*sn(t*16)];az=[.6,-.2];rx=.15*Math.max(0,sn(t*8));lz=[-.2,.2];y=ab(sn(t*8))*.04;break;
  case'spin':{const u=t/d,s2=u*u*(3-2*u);ry=s2*Math.PI*2;az=[-1.4,1.4];y=.15*sn(u*Math.PI);break}
  default:az=[-2.3,2.3];ax=[-.35,-.35];ry=.12*sn(t*3);y=.03*sn(t*4)}
 A.forEach((a,i)=>{a.rotation.x=a.rotation.x*(1-v)+ax[i]*v;a.rotation.z=az[i]*v});G.forEach((l,i)=>{if(lx[i]!=null)l.rotation.x=l.rotation.x*(1-v)+lx[i]*v;l.rotation.z=lz[i]*v});
 g.position.y=y0+y*v;g.rotation.y=r0+(em.k=='spin'?ry:ry*v);g.rotation.x=rx*v;g.rotation.z=rz*v;return true}
const EF=[],EV=new THREE.Vector3();
function emFloat(g,k){const el=document.createElement('div');el.className='emf';el.textContent=EMK[k].e;document.body.appendChild(el);EF.push({el,g,t:0})}
let LEM=null;
function emPlay(k){emClose();if(!EMK[k]||mode!='play'||!P.mesh)return;if(LEM)emReset(P,P.mesh);LEM={k,t:0,x:P.x,z:P.z};emFloat(P.mesh,k);snd('pop');if(MPS&&online())send({t:'em',k})}
function emTick(dt){if(LEM){LEM.t+=dt;const mv=Math.hypot(P.x-LEM.x,P.z-LEM.z)>.05;if(mv||mode!='play'||!P.mesh||!emApply(LEM,P,P.mesh,P.rot,P.mesh.position.y)){if(P.mesh)emReset(P,P.mesh);LEM=null}}
 for(let i=EF.length-1;i>=0;i--){const f=EF[i];f.t+=dt;if(f.t>2.2||!f.g.parent){f.el.remove();EF.splice(i,1);continue}
  const on=f.g.visible&&!(typeof FEST!='undefined'&&FEST.view)&&['play','menu','drive'].includes(mode);f.el.style.display=on?'':'none';if(!on)continue;
  EV.set(f.g.position.x,f.g.position.y+2.5+f.t*.5,f.g.position.z).project(cam);f.el.style.left=((EV.x+1)/2*innerWidth)+'px';f.el.style.top=((1-EV.y)/2*innerHeight)+'px';f.el.style.opacity=Math.min(1,(2.2-f.t)/.6)}
 if($('emw')&&mode!='play')emClose()}
{const u0=update;update=function(dt){u0.apply(this,arguments);try{emTick(dt)}catch(e){console.error('emote',e)}}}
function emClose(){const w=$('emw');if(w)w.remove()}
window.emWheel=()=>{if($('emw'))return emClose();if(mode!='play')return;snd('click');const w=document.createElement('div');w.id='emw';
 w.innerHTML=`<div class=emr>${EMO.map((e,i)=>{const a=i/EMO.length*Math.PI*2-Math.PI/2;return`<button style="left:calc(50% + ${Math.round(Math.cos(a)*112)}px);top:calc(50% + ${Math.round(Math.sin(a)*112)}px)" onclick="emPick('${e.k}')"><b>${e.e}</b><small>${i+1} ${e.n}</small></button>`}).join('')}<div class=emc>Emotes<br><small class=m>1-8 · B to close</small></div></div>`;
 w.onclick=e=>{if(e.target===w)emClose()};document.body.appendChild(w)};
window.emPick=k=>emPlay(k);
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.repeat)return;const k=e.key.toLowerCase(),open=!!$('emw');
 if(k=='b'&&(mode=='play'||open)){e.preventDefault();e.stopImmediatePropagation();emWheel();return}
 if(!open)return;const n=parseInt(k);if(n>=1&&n<=8){e.preventDefault();e.stopImmediatePropagation();emPlay(EMO[n-1].k)}else if(k=='escape'){e.preventDefault();e.stopImmediatePropagation();emClose()}},true);
{const st=document.createElement('style');st.textContent=`#emw{position:fixed;inset:0;z-index:7;background:#0006}
#emw .emr{position:absolute;left:50%;top:50%;width:0;height:0}
#emw button{position:absolute;transform:translate(-50%,-50%);width:92px;height:76px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0;background:#0b0f0de6;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008;transition:transform .12s}
#emw button:hover,#emw button:focus{transform:translate(-50%,-50%) scale(1.12);box-shadow:inset 0 0 0 2px var(--g),4px 4px 0 #0008}#emw button b{font-size:28px;line-height:1}#emw button small{font-size:11px;color:var(--t)}
#emw .emc{position:absolute;transform:translate(-50%,-50%);width:96px;height:96px;border-radius:50%;background:#0b0f0de6;border:3px solid #000;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-family:Silkscreen,ui-monospace,monospace;color:var(--g)}
.emf{position:fixed;z-index:4;pointer-events:none;font-size:30px;transform:translate(-50%,-100%);text-shadow:2px 2px 0 #000;animation:emfp .35s ease-out}
@keyframes emfp{0%{transform:translate(-50%,-100%) scale(.2)}70%{transform:translate(-50%,-100%) scale(1.25)}100%{transform:translate(-50%,-100%) scale(1)}}`;document.head.appendChild(st)}

/* ===== band collabs: every artist chat is shared, the whole band records the collab together, and the song is linked ===== */
const artN=i=>{try{return ART[i][0]}catch(e){return'the artist'}};
function colNear(){if(!MPS||IN&&!(typeof TW!='undefined'&&TW))return -1;let b=-1,bd=6;try{ART_M.forEach(o=>{if(o.m&&!o.m.parent)return;const d=Math.hypot(P.x-o.x,P.z-o.z);if(d<bd){bd=d;b=o.i}})}catch(e){}return b}
window.mpColReady=a=>{if(S.energy<COLLAB_E){snd('err');return say('Too tired to record, even a collab. Rest and come back.')}const m=S.msgs.find(x=>x.a===a);let op=0;if(m){if((m.rel||0)>=5)op++;if(m.neg)op--}
 snd('pop');closeUI();MEET=null;ME.rd={k:'col',a,op,ts:Date.now()};send({t:'rd',rd:ME.rd});say('Ready to record with '+artN(a)+'. Waiting for the rest of the band.')};
{const m0=meetRec;meetRec=function(){const M=MEET;if(!M||!MPS||!band())return m0.apply(this,arguments);if(S.energy<COLLAB_E){snd('err');return say('Too tired to record, even a collab. Rest and come back.')}
 const a=M.o.i;snd('pop');$('ui').innerHTML='';MEET=null;ME.rd={k:'col',a,op:M.op||0,ts:Date.now()};send({t:'rd',rd:ME.rd});
 const w=list().filter(m=>m.id!==ME.id&&!(m.rd&&m.rd.k=='col'&&m.rd.a===a)).length;say(w?'Ready to record with '+artN(a)+'. Waiting for '+w+' more bandmate'+(w>1?'s':'')+'.':'Ready to record with '+artN(a)+'.')}}
const COFF={vo:[0,0],gt:[-.6,1.1],bs:[-.6,-1.1],dr:[-1.4,1.6],ky:[-1.4,-1.6]};
function goCol(d){const o=ART_M.find(x=>x.i===d.a);if(!o)return say('That artist is not around any more.');S.energy=Math.max(0,+(S.energy-COLLAB_E).toFixed(1));try{updateVersion()}catch(e){}
 $('ui').innerHTML='';MEET=null;mode='cut';cs2={o,t:0,op:d.op||0,band:d.n||1,bt:d.title||'',bl:d.n>1?d.bl:null};const f=COFF[MPS.inst]||[0,0];P.x=o.x-1.4+f[0];P.z=o.z+f[1];P.rot=Math.PI/2;
 say(d.n>1?'Band collab with '+o.name+' (fictional). Everyone records together.':'Recording with '+o.name+' (fictional)')}
{const c0=collabDone;collabDone=function(){const c=cs2||{},b=c.band||0,bt=c.bt,bl=c.bl,n0=S.nid;const r=c0.apply(this,arguments);
 try{const d=S.drafts[S.drafts.length-1];if(MPS&&bl&&d&&d.id===n0){const add=b>1?3*(b-1):0;d.q+=add;d.title=bt||d.title;d.bt=d.title;d.bl=bl;(BQ[bl]=BQ[bl]||{})[ME.id]=d.q;
  const t=$('tin');if(t){t.value=d.title;t.readOnly=true;t.blur();t.insertAdjacentHTML('afterend',`<p class=m><small>Band collab with ${b} members (+${add} quality). Everyone gets this song, and releasing it releases it for the whole band.</small></p>`)}
  send({t:'dn',c:1,q:d.q,bl});if(REL[bl])setTimeout(()=>relDo(bl),300)}}catch(e){console.error('mp collab',e)}return r}}
/* artist chats: any change to one (a new message, a deal, a collab done) goes to the whole band */
const cmSig=m=>{try{return JSON.stringify(Object.assign({},m,{id:0,unread:0,recv:0}))}catch(e){return''}};
setInterval(()=>{try{if(!MPS||!S||!Array.isArray(S.msgs)||!online()||mode=='creator'||mode=='load')return;NET.cs=NET.cs||{};
 S.msgs.forEach(m=>{if(m.a===undefined||m.a===null)return;const k=cmSig(m);if(NET.cs[m.a]!==k){NET.cs[m.a]=k;const c=JSON.parse(k);delete c.id;delete c.unread;delete c.recv;send({t:'cm',m:c})}})}catch(e){console.error('mp chats',e)}},1000);
function cmRecv(d,from){const r=d.m;if(!r||typeof r!='object'||typeof r.a!='number'||!ART[r.a]||!Array.isArray(r.log)||!Array.isArray(S.msgs))return;NET.cs=NET.cs||{};
 let m=S.msgs.find(x=>x.a===r.a);const grew=!m||r.log.length>m.log.length,st0=m?m.state:null;
 if(m&&r.log.length<(m.log||[]).length)return;
 if(!m){m={id:S.nid++};S.msgs.push(m)}const id=m.id,un=m.unread,rv=m.recv;Object.assign(m,r);m.id=id;m.recv=rv;m.unread=grew&&r.log.length&&r.log[r.log.length-1].f!='p'&&S.chat!==id?1:un||0;
 NET.cs[r.a]=cmSig(m);if(st0!==m.state&&(st0==1||m.state==1)){try{syncArt()}catch(e){}}
 if(grew&&st0!==null&&m.state==1&&st0!=1)say(from.nm+' agreed a collab with '+artN(r.a)+'. It is for the whole band.');
 try{if(mode=='pc')pcR()}catch(e){}}

/* v46.0.0: lets the admin fun effects (162-fun-admin.js) ride on the room: send, who is in the room, their avatars */
window.MPFX={on:()=>online(),send:o=>send(o),mem:()=>MB,av:()=>AV};
if(MPS)setTimeout(start,0);
})();
