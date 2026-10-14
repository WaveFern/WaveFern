/* ---------- v26.82.1: one bad app or message can never freeze the computer ----------
   Before this, if drawing any part of the computer threw an error (one broken chat in Messages, an app the save
   remembers but the game no longer has, an out-of-range wallpaper), the whole screen stopped redrawing: the Start
   button and every icon did nothing, and the save kept the bad data so it happened again after a reload.
   Now:
   - each app and Spotifly page draws inside its own guard; a failure repairs the save data and tries once more,
     and if it still fails the window shows a short notice instead of taking the desktop down with it
   - if the desktop itself fails, the save data is repaired and it redraws; failing that, the broken app is closed;
     failing that, a plain desktop with a working Start menu and Shut down comes up
   - Messages repairs broken chats (missing entries, chats with no history, unknown artists) before giving up
   - a failing song or frame step is logged and skipped, so the day clock and the world keep running
   - saves are repaired when they load, and again every morning, so a save already stuck in this state recovers */

/* repairs the chat list in place; safe to call any time */
function msgFix(){if(!S)return;if(!Array.isArray(S.msgs))S.msgs=[];
 S.msgs=S.msgs.filter(m=>m&&typeof m=='object');
 let top=0;S.msgs.forEach(m=>{if(isFinite(m.id))top=Math.max(top,+m.id)});if(!isFinite(S.nid)||S.nid<=top)S.nid=top+1;
 S.msgs.forEach(m=>{
  if(m.a===null)delete m.a;
  /* a chat pointing at an artist the roster no longer has: keep it as a plain message so it still opens */
  if(m.a!==undefined&&!ART[m.a]){m.aBad=m.a;delete m.a;if(typeof m.from!='string')m.from='Unknown artist';if(m.body==null){const L=Array.isArray(m.log)?m.log[m.log.length-1]:null;m.body=L&&L.t?L.t:''}}
  if(m.log!==undefined&&!Array.isArray(m.log))m.log=[];
  if(m.a!==undefined&&!Array.isArray(m.log))m.log=[];
  if(Array.isArray(m.log))m.log=m.log.filter(x=>x&&typeof x=='object');
  if(m.a===undefined){if(typeof m.from!='string')m.from=m.from==null?'Spotifly Team':String(m.from);if(m.body==null)m.body=''}
  if(!isFinite(m.id))m.id=S.nid++});
 if(S.chat!=null&&!S.msgs.some(m=>m.id==S.chat))S.chat=0}

/* repairs everything the desktop reads */
function pcSafeFix(){if(!S)return;
 try{msgFix()}catch(e){console.error('message repair failed',e)}
 if(!S.apps||typeof S.apps!='object')S.apps={};
 /* apps the save owns but this version does not know are set aside, not deleted, and come back if the app does */
 for(const k in S.apps)if(!APPD[k]&&!BI[k]){S.appsOff=S.appsOff||{};S.appsOff[k]=S.apps[k];delete S.apps[k]}
 if(S.appsOff)for(const k in S.appsOff)if(APPD[k]||BI[k]){S.apps[k]=S.appsOff[k];delete S.appsOff[k]}
 if(!S.ipos||typeof S.ipos!='object')S.ipos={};
 for(const k in S.ipos){const q=S.ipos[k];if(!Array.isArray(q)||!isFinite(q[0])||!isFinite(q[1]))delete S.ipos[k]}
 if(!WP[S.wp])S.wp=WP[10]?10:0;
 if(!Array.isArray(OA))OA=[];
 OA=OA.filter(k=>k=='1'||k=='store'||k=='web'||k=='msg'||k=='gear'||(S.apps[k]&&PA[k]));
 if(app&&app!=1&&!PA[app])app=0}

/* every app and Spotifly page draws inside its own guard */
const appFail=n=>`<div style="padding:24px"><h1>${esc(n)}</h1><p class=m>This app hit a problem and could not open. Close it with X and carry on; the rest of the computer still works.</p></div>`;
function guardDraw(T,k,name){const f=T[k];if(typeof f!='function'||f.guarded)return;
 const g=function(){try{return f.apply(this,arguments)}catch(e){console.error('app failed to draw: '+k,e);
  try{pcSafeFix();return f.apply(this,arguments)}catch(e2){console.error('app failed to draw after repair: '+k,e2)}
  return appFail(name(k))}};g.guarded=1;T[k]=g}
const appName=k=>{try{return k==1?'Spotifly':k=='store'?'App Barn':k=='msg'?'Messages':k=='web'?'Browser':BI[k]||(APPD[k]&&APPD[k].n)||String(k)}catch(e){return String(k)}};
Object.keys(PA).forEach(k=>{if(k!='msg')guardDraw(PA,k,appName)});
Object.keys(PG).forEach(k=>guardDraw(PG,k,()=>'Spotifly'));

/* Messages: if the full chat view cannot draw even after repair, a plain list of chats still opens */
{const pm=PA.msg;PA.msg=function(){try{return pm.apply(this,arguments)}catch(e){console.error('messages failed',e)}
 try{msgFix();return pm.apply(this,arguments)}catch(e){console.error('messages failed after repair',e)}
 const L=(Array.isArray(S.msgs)?S.msgs:[]).filter(m=>m&&!m.hid).slice().reverse();
 return`<div style="padding:16px"><h1>Messages</h1><p class=m>Some chats could not be shown in full.</p>${L.map(m=>{let n='',t='';try{n=m.a!==undefined&&ART[m.a]?ART[m.a][0]:m.from||'';const g=Array.isArray(m.log)&&m.log.length?m.log[m.log.length-1].t:m.body;t=g==null?'':g}catch(e){}return`<div class=card style="margin:8px 0"><b>${esc(n)}</b><p>${esc(t)}</p></div>`}).join('')||'<p class=m>No chats yet.</p>'}</div>`}}

/* the desktop: repair and redraw, then close the broken app, then a plain desktop that still has Start */
function pcBare(){const ks=[1,'store','web','msg','gear',...Object.keys(S.apps||{})];
 $('ui').innerHTML=`<div id=pc style="background:#10261b"><div class=sm>${ks.map(k=>`<button onclick="app='${k}';smo=0;pcR()">${esc(appName(k))}</button>`).join('')}<button onclick="closePC()">Shut down</button></div><div class=tb><button class=go onclick="smo=!smo;pcR()">Start</button><span style="flex:1"></span><span>Day ${S.day}</span></div></div>`}
{const p0=pcR;pcR=function(){try{return p0.apply(this,arguments)}catch(e){console.error('computer failed to draw',e)}
 try{pcSafeFix();return p0.apply(this,arguments)}catch(e){console.error('computer failed to draw after repair',e)}
 const bad=app;if(bad){OA=(OA||[]).filter(k=>k!=String(bad));app=0;try{p0.apply(this,arguments);say(appName(bad)+' hit a problem and was closed. Everything else still works.');return}catch(e){console.error('desktop failed to draw',e)}}
 try{pcBare()}catch(e){console.error('plain desktop failed',e);closeUI()}}}

/* a stray pause dim must never sit over the computer */
{const o0=openPC;openPC=function(){try{if(!PAUSED)pauseOverlay(0)}catch(e){}return o0.apply(this,arguments)}}

/* one song that cannot work out its streams earns nothing today instead of stopping the clock */
{const po=planOf;planOf=function(s){try{return po.apply(this,arguments)}catch(e){console.error('song streams failed',s&&s.title,e);
 if(!s)return 0;if(s.pd!==S.day){s.pd=S.day;s.pv=0;s.acc=0;s.today=0;s.p0=0}return isFinite(s.pv)?s.pv:0}}}

/* a failing step in one frame is logged and skipped, so the game loop keeps going */
{const u0=update;let n=0;update=function(dt){try{u0(dt)}catch(e){if(n++<5)console.error('frame step failed',e)}}}

/* saves are repaired when they load and every morning */
{const l0=loadCode;loadCode=function(){const r=l0.apply(this,arguments);try{pcSafeFix()}catch(e){console.error('save repair failed',e)}return r}}
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{pcSafeFix()}catch(e){console.error('morning repair failed',e)}return r}}
