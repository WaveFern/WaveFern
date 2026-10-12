/* ===== v26.46.0: Calendar, weekdays, artist availability and location rules =====
   One event store: S.cal (saved with the game, wiped by loadCode's resetState, and part of save codes).
   Event = {id, k, t, day, s, e, loc, a, p, dir, pay, st, mid, note, rm}
     k    'collab' (a scheduled session with an artist, see 75-collab-schedule.js), 'rec' (recording session), 'rel' (release day),
          'promo' (promo event) or 'misc'. Festival sets are NOT copied into S.cal: they stay in S.festBk (the festival code owns them)
          and calFest() turns them into events on the fly, so there is exactly one list of festival bookings and the calendar can
          never disagree with FestivalApp. calAll() is S.cal plus calFest(); every conflict check goes through calAll().
     day  game day, s/e minutes on that day's clock: 360 = 06:00 on that day ... 1800 = 06:00 the next morning (the festival's scale,
          so a 22:00-02:00 slot is 1320-1560 on the festival day). Absolute time = (day-1)*1440 + minutes.
     loc  a key of CLOC (the meeting places, the festival grounds 'fest' and the stages 'st1'-'st4')
     a/p  the artist (ART index) / everybody else involved (ART indexes)
     dir  'p' the player pays pay when the session starts, 'a' the artist pays the player
     st   0 scheduled, 1 under way, 2 done, 3 cancelled, 4 missed
   Weekdays: day 1 is a Monday, so the festival (every 7th day) is always a Sunday.
   Artists: nothing is added to the ART roster rows. artX(i) generates (seeded by the artist's name, so it is the same in every
   save and never stored) a negotiation personality, permanent location bans, weekday-only locations, a rest day, working hours,
   how much notice they need, how far ahead they commit and how often they are off on other business.
   The player gets the same busy check, so nobody (player or artist) is ever in two places at once, with a travel gap between places. */
const WDN=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],WDS=WDN.map(x=>x.slice(0,3));
const wdOf=d=>(((d-1)%7)+7)%7,wdName=d=>WDN[wdOf(d)],wdShort=d=>WDS[wdOf(d)];
const absT=(day,m)=>(day-1)*1440+m,calNow=()=>absT(S.day,festMins());
/* places: the eight meeting places, the festival grounds and the four stages */
const CLOC={skyline:'Skyline Tower',pulse:'Pulse Records HQ',cafe:'the City Cafe',store:'the Music Store',radio:'the Radio Station',park:'Central Park',home:'outside your place',street:'the shops on your street',fest:'the Park Fields grounds',st1:'the Main Stage',st2:'the Riverside Stage',st3:'The Pit',st4:'the Fresh Fern Tent'};
const CLOCS={skyline:'Skyline Tower',pulse:'Pulse HQ',cafe:'City Cafe',store:'Music Store',radio:'Radio Station',park:'Central Park',home:'Your place',street:'Your street',fest:'Festival grounds',st1:'Main Stage',st2:'Riverside Stage',st3:'The Pit',st4:'Fresh Fern Tent'};
const CMEETK=['skyline','pulse','cafe','store','radio','park','home','street'];
const wdList=(a,j)=>{const n=a.map(d=>WDN[d]+'s');return n.length<2?n.join(''):n.slice(0,-1).join(', ')+' '+(j||'and')+' '+n[n.length-1]};
const dayWord=d=>d==S.day?'today':d==S.day+1?'tomorrow':d==S.day-1?'yesterday':wdShort(d)+' (Day '+d+')';

/* ---- artist traits, generated from the name ---- */
const PERMWHY={skyline:['has history with the owners of Skyline Tower','got thrown out of Skyline Tower once and never went back'],pulse:['is in a contract dispute with Pulse Records','has a bad history with Pulse Records'],cafe:['was banned from the City Cafe over a coffee incident','flatly refuses to go to the City Cafe'],store:['has a feud with the Music Store owner','refuses to set foot in the Music Store'],radio:['has a beef with the radio station DJs','cannot stand the people at the Radio Station'],park:['has a thing about the Central Park pigeons','refuses to record outdoors'],home:['does not do sessions at people\'s homes','keeps work and home strictly separate'],street:['avoids the shops on your street','does not like street meetings'],fest:['never plays festival grounds','refuses outdoor festivals'],st1:['will not play the Main Stage'],st2:['will not play the Riverside Stage'],st3:['will not play The Pit'],st4:['will not play the Fresh Fern Tent']};
const CMTW=['is away on a promo trip','is shooting a video','is locked in at their own studio','is playing a private show','is doing press interviews all day','is travelling for a gig','has family plans'];
const RESTW=['keeps it as a family day','takes it as a rest day','does admin and emails then'];
const NPW={flexible:22,stubborn:16,proud:12,greedy:14,generous:20,shrewd:16};
const ARTXC={};
function artGen(a){const rnd=fRng(fHash('artx|'+a[0])),big=a[7]?1:0,rap=a[1]=='Rap'||a[1]=='Hip-Hop',A=a[2],x={perm:[],wd:{}};
 /* negotiation personality: big names lean proud, small ones lean generous */
 const w=Object.assign({},NPW);w.proud+=big*20;w.stubborn+=big*6;w.generous-=big*10;w.flexible-=big*6;if(A<150){w.generous+=8;w.flexible+=6}
 let r=rnd()*Object.values(w).reduce((p,c)=>p+c,0);x.np='shrewd';for(const k in w){if(r<w[k]){x.np=k;break}r-=w[k]}
 /* locations: shuffle the meeting places once, then take permanent bans from the front and weekday-only places after them */
 const pool=CMEETK.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
 const r1=rnd(),nb=rap?(r1<.5?1:2):(r1<.62?0:r1<.95?1:2),r2=rnd(),nw=r2<.42?0:r2<.82?1:2;
 for(let i=0;i<nb;i++){const k=pool[i],L=PERMWHY[k];x.perm.push({k,why:L[Math.floor(rnd()*L.length)]})}
 for(let i=0;i<nw;i++){const k=pool[nb+i],n=rnd()<.6?1:2,d=[];while(d.length<n){const v=Math.floor(rnd()*7);if(!d.includes(v))d.push(v)}x.wd[k]={d:d.sort((p,q)=>p-q)}}
 /* festival grounds and stages: bans only (a festival is always a Sunday, so weekday rules would be all or nothing) */
 const rf=rnd();if(rf<(rap?.14:.07))x.perm.push({k:'fest',why:PERMWHY.fest[Math.floor(rnd()*2)]});else for(let n=1;n<=4;n++)if(rnd()<.05)x.perm.push({k:'st'+n,why:PERMWHY['st'+n][0]});
 x.rest=rnd()<.5?Math.floor(rnd()*7):-1;x.restWhy=RESTW[Math.floor(rnd()*RESTW.length)];
 const late=/^(Electronic|Hip-Hop|Rap|R&B)$/.test(a[1]),early=/^(Country|Folk|Pop|Indie)$/.test(a[1]),rh=rnd();
 x.hrs=rh<.2?[480,1380]:late?(rh<.7?[780,1380]:[600,1380]):early?(rh<.7?[480,960]:[540,1140]):(rh<.6?[540,1140]:[600,1260]);
 /* notice needed (days) grows with size; some big names are quick anyway; how far ahead they will commit */
 let ld=A<150?0:A<3000?1:A<50000?2:A<2e6?4:7;const rl=rnd();if(rl<.28&&ld>1)ld=Math.ceil(ld/2);else if(rl>.8)ld+=1;x.leadD=ld;x.hor=14+7*Math.floor(rnd()*3);
 x.pCmt=Math.min(.4,.04+.05*Math.log10(A+1));x.mk=.92+rnd()*.2;return x}
function artX(i){const a=ART[i];if(!a)return null;return ARTXC[a[0]]||(ARTXC[a[0]]=artGen(a))}
const artIdx=n=>ART.findIndex(a=>a[0]==n);
/* a permanent ban for loc (a stage is also banned when the whole festival grounds are), or null */
function locBan(i,k){const x=artX(i);if(!x)return null;return x.perm.find(p=>p.k==k||(p.k=='fest'&&/^st\d$/.test(k)))||null}
const locWd=(i,k)=>{const x=artX(i);return x&&x.wd[k]||null};
/* does the artist have other business that day? (stable per artist and day) */
function artCmt(i,day){const x=artX(i),h=fRng(fHash('cmt|'+ART[i][0]+'|'+day))();return h<x.pCmt?CMTW[Math.floor(h/x.pCmt*CMTW.length)%CMTW.length]:null}
/* a short summary of an artist's rules, for the calendar */
function artRules(i){const x=artX(i),L=[];x.perm.filter(p=>!/^st\d$/.test(p.k)||!x.perm.some(q=>q.k=='fest')).forEach(p=>L.push('Never: '+CLOCS[p.k]));for(const k in x.wd)L.push(CLOCS[k]+': only '+x.wd[k].d.map(d=>WDS[d]).join('/'));
 if(x.rest>=0)L.push('No sessions on '+WDN[x.rest]+'s');L.push('Sessions '+fHM(x.hrs[0])+' to '+fHM(x.hrs[1])+' start');L.push('Needs '+(x.leadD?x.leadD+' day'+(x.leadD>1?'s':'')+' notice':'90 min notice')+', books up to '+x.hor+' days ahead');return L}

/* ---- festival acts on the art stages, kept away from places and times they cannot do ---- */
const FNAC={};
function festNpcActs(day){if(FNAC[day])return FNAC[day];const M={1:[],2:[]},len=ART.length;
 [1,2].forEach(n=>{for(let k=0;k<4;k++){if(!festSlotTaken(day,n)[k]){M[n][k]=-1;continue}
  const h=(fRng(fHash('act'+day+':'+n))()*1e6)|0;let pick2=-1;
  for(let j=0;j<len&&pick2<0;j++){const i=(h+k*7+j*5)%len,x=artX(i);
   if(locBan(i,'st'+n)||artCmt(i,day))continue;
   if(M[n].includes(i))continue;/* not twice on one stage */
   const other=M[n==1?2:1];if(n==2&&other[k]===i)continue;/* not on two stages at the same time */
   pick2=i}
  M[n][k]=pick2}});
 return FNAC[day]=M}
function festNpcArt(day,n,k){if(n>2)return -1;const i=festNpcActs(day)[n][k];return i==null?-1:i}
function festNpcSlots(i,day){const out=[];if(festPhaseOf(day)!='fest')return out;const M=festNpcActs(day);[1,2].forEach(n=>M[n].forEach((v,k)=>{if(v===i)out.push({s:FSLOT[k][0],e:FSLOT[k][1],loc:'st'+n,n,why:'is performing on '+fStage(n).name})}));return out}

/* ---- events ---- */
if(!Array.isArray(S.cal))S.cal=[];
const calKinds={collab:['Collab session','#2fe68a'],rec:['Recording session','#ffb04a'],rel:['Release day','#5ad1ff'],promo:['Promo event','#c58cff'],misc:['Other','#aab7c4'],fest:['Festival set','#ff6ad5']};
const calGap=(l1,l2)=>l1==l2?15:((/^st\d$|^fest$/.test(l1)||/^st\d$|^fest$/.test(l2))?60:45);
function calFest(){if(typeof fBk!='function')return[];return fBk().filter(b=>b.st!=2).map(b=>{const s=fStage(b.n),sl=FSLOT[b.slot],fts=[...new Set(b.songs.map(id=>S.songs.find(x=>x.id==id)).filter(x=>x&&x.ft).map(x=>x.ft))].map(artIdx).filter(i=>i>=0);
  return{id:'f'+b.id,k:'fest',t:'Festival set: '+s.name,day:b.day,s:sl[0],e:sl[1],loc:'st'+b.n,a:null,p:fts,dir:null,pay:0,st:b.st==1?2:0,fb:b.id,note:b.songs.length+' song'+(b.songs.length==1?'':'s')+' · pay x'+s.mult+' per fan'+(b.res?' · played to '+b.res.c.toLocaleString()+' · earned '+$$(b.res.pay):'')}})}
const calAll=()=>S.cal.concat(calFest());
const calSort=(a,b)=>absT(a.day,a.s)-absT(b.day,b.s);
const calOn=day=>calAll().filter(e=>e.day==day).sort(calSort);
const calEvOf=id=>calAll().find(e=>e.id==id);
const calOv=(s1,e1,l1,s2,e2,l2)=>{const g=calGap(l1,l2);return s1<e2+g&&e1>s2-g};
/* the first live event that collides with [s,e) on that day at that place (the player is in every event) */
function plBusy(day,s,e,loc,ign,noFest){const A0=absT(day,s),A1=absT(day,e);return calAll().find(v=>v.st<=1&&v.id!=ign&&!(noFest&&v.k=='fest')&&calOv(A0,A1,loc,absT(v.day,v.s),absT(v.day,v.e),v.loc))||null}
function artBusyEv(i,day,s,e,loc,ign){const A0=absT(day,s),A1=absT(day,e);
 const v=calAll().find(v=>v.st<=1&&v.id!=ign&&(v.a===i||(v.p&&v.p.includes(i)))&&calOv(A0,A1,loc,absT(v.day,v.s),absT(v.day,v.e),v.loc));
 if(v)return{why:v.k=='fest'?'is already on the festival bill ('+fHM(v.s)+' to '+fHM(v.e)+')':'already has a session '+fHM(v.s)+' to '+fHM(v.e)+' that day',ev:v};
 const f=festNpcSlots(i,day).find(q=>calOv(A0,A1,loc,absT(day,q.s),absT(day,q.e),q.loc));return f?{why:f.why+' ('+fHM(f.s)+' to '+fHM(f.e)+')'}:null}
/* can artist i do [s, s+dur) on that day at loc? {ok} or {ok:false, k, why}
   o: dur, ign (event id to ignore, for rescheduling), fest (festival feature: no weekday/hours/notice rules), noRest, noHours, noLead, noAcc */
function artAvail(i,day,s,loc,o){o=o||{};const a=ART[i],x=artX(i),e=s+(o.dur||180),nm=a[0],sh=wdName(day),now=calNow(),st=absT(day,s),no=(k,why)=>({ok:false,k,why});
 if(loc){const pb=locBan(i,loc);if(pb)return no('perm',nm+' '+pb.why+'. '+CLOC[loc].replace(/^the /,'The ').replace(/^outside your place$/,'Your place')+' is off the table for good and no fee changes that. Pick another place.');
  if(!o.fest){const w=locWd(i,loc);if(w&&!w.d.includes(wdOf(day)))return no('wd',nm+' only goes to '+CLOC[loc]+' on '+wdList(w.d,'and')+', and Day '+day+' is a '+sh+'. Pick another place, or a '+w.d.map(d=>WDN[d]).join(' or ')+'.')}}
 if(!o.noRest&&x.rest>=0&&wdOf(day)==x.rest)return no('rest',nm+' '+x.restWhy+' on '+WDN[x.rest]+'s, so Day '+day+' is out.');
 const cm=artCmt(i,day);if(cm)return no('cmt',nm+' '+cm+' on Day '+day+' ('+sh+').');
 if(!o.noHours&&(s<x.hrs[0]||s>x.hrs[1]))return no('hours',nm+' does not start sessions that '+(s<x.hrs[0]?'early':'late')+'. They start between '+fHM(x.hrs[0])+' and '+fHM(x.hrs[1])+'.');
 if(!o.noLead){const need=Math.max(90,x.leadD*1440);if(st-now<0)return no('past','That time has already passed.');
  if(st-now<need)return no('lead',nm+' needs '+(x.leadD?x.leadD+(x.leadD>1?' days\' notice':' day\'s notice'):'at least 90 minutes\' notice')+', so the earliest they can do is '+calFmtAbs(now+need)+'.');
  if(st-now>x.hor*1440)return no('far',nm+' will not commit more than '+x.hor+' days ahead. Ask again closer to the date.')}
 const b=artBusyEv(i,day,s,e,loc,o.ign);if(b)return no('busy',nm+' '+b.why+'.');
 if(!o.noAcc&&!o.fest){const lead=(st-now)/1440,tight=x.leadD>0&&lead<x.leadD*1.6;if(fRng(fHash('acc|'+nm+'|'+day+'|'+s))()<(tight?.4:.06))return no('acc',tight?nm+' could maybe squeeze that in, but it is too close to their other plans. Give them a bit more notice.':nm+' has a personal thing that day and passes on that slot.')}
 return{ok:true}}
/* the same time of day but rendered from an absolute minute count */
function calFmtAbs(t){t=Math.ceil(t/30)*30;const d=Math.floor((t-360)/1440)+1;return wdShort(d)+' Day '+d+' '+fHM(t-(d-1)*1440)}
/* up to n alternative slots for artist i (same place first, then the other places) */
function calAlts(i,loc,n,o){o=Object.assign({},o||{});const out=[],x=artX(i),tms=[900,720,1080,1200,600,1260,840],others=CMEETK.filter(k=>k!=loc);
 for(let d=S.day;d<=S.day+Math.min(28,x.hor)&&out.length<n;d++){let hit=null;
  const ok=(tm,L)=>artAvail(i,d,tm,L,o).ok&&!plBusy(d,tm,tm+(o.dur||180),L,o.ign);
  for(const tm of tms)if(ok(tm,loc)){hit={day:d,tm,loc};break}
  if(!hit)for(const tm of tms){const L=others.find(L=>ok(tm,L));if(L){hit={day:d,tm,loc:L};break}}
  if(hit)out.push(hit)}
 return out}
/* "Fri Day 12 at 15:00 at the City Cafe" */
const calSlotTxt=(d,tm,loc)=>wdShort(d)+' Day '+d+' at '+fHM(tm)+(loc?' at '+CLOC[loc].replace(/^outside your place$/,'your place'):'');

/* festival hooks (called from 71-festival-booking.js) */
function calFestCheck(day,n,k){const sl=FSLOT[k],c=plBusy(day,sl[0],sl[1],'st'+n,null,1);return c?'You already have "'+c.t+'" on Day '+day+' ('+fHM(c.s)+' to '+fHM(c.e)+'). Move it or pick another slot.':''}
function calFestFeat(ids,day,n,k,ign){const sl=FSLOT[k],seen={};
 for(const id of ids){const s=S.songs.find(x=>x.id==id);if(!s||!s.ft||seen[s.ft])continue;seen[s.ft]=1;const i=artIdx(s.ft);if(i<0)continue;
  const r=artAvail(i,day,sl[0],'st'+n,{fest:1,noRest:1,noHours:1,noLead:1,noAcc:1,dur:sl[1]-sl[0],ign});
  if(!r.ok){const pb=r.k=='perm'?locBan(i,'st'+n):null;return '"'+s.title+'" features '+s.ft+', but '+(pb?s.ft+' '+pb.why+' and will not join a set on '+CLOC['st'+n]+'.':r.why+' '+s.ft+' cannot join this set.')+' Pick another song, stage or slot.'}}
 return ''}

/* ---- event operations ---- */
const CALH={};/* per kind: start(ev)->true if it began, late(ev), end(ev), cancel(ev,why) */
function calAdd(ev){ev.id=S.nid++;ev.st=ev.st||0;S.cal.push(ev);S.cal.sort(calSort);updateVersion();return ev}
function calPrune(){const keep=S.cal.filter(e=>e.st<=1||e.day>=S.day-14);S.cal=keep.length>240?keep.slice(-240):keep}
function calStatusTxt(ev){return['scheduled','under way','done','cancelled','missed'][ev.st]||''}
let CALT=0;
function calTick(dt){CALT-=dt;if(CALT>0)return;CALT=.5;
 if(!S||!Array.isArray(S.cal)||!S.artist||mode=='load'||mode=='creator'||mode=='sleep'||PAUSED)return;
 if(S.apps&&!S.apps.cal&&!S.calApp){S.apps.cal=1;S.calApp=1;if(S.day>1||(S.songs&&S.songs.length)){try{say('Calendar installed on your computer.')}catch(e){}}}
 if(typeof schRepair=='function')schRepair();
 const now=calNow();let ch=0;
 S.cal.slice().forEach(ev=>{if(ev.st>1)return;const st=absT(ev.day,ev.s),en=absT(ev.day,ev.e),H=CALH[ev.k]||CALH.misc;
  if(ev.st==0&&!ev.rm&&now>=st-60&&now<st){ev.rm=1;try{say('📅 In an hour: '+ev.t+' at '+fHM(ev.s)+(ev.loc?' · '+CLOCS[ev.loc]:''))}catch(e){}}
  if(ev.st==0&&now>=st){if(now>=en){if(H.late)H.late(ev);else{ev.st=4;ch=1}}else if(H.start(ev)!==false)ch=1;if(ev.st==4||ev.st==1||ev.st==2)ch=1}
  else if(ev.st==1&&now>=en){H.end(ev);ch=1}});
 if(ch){calPrune();updateVersion();if(mode=='pc'&&app=='cal')pcR()}}
CALH.misc={start(ev){ev.st=1;try{say('📅 Now: '+ev.t+(ev.loc?' · '+CLOC[ev.loc]:''))}catch(e){}return true},end(ev){ev.st=2}};
['rec','rel','promo'].forEach(k=>CALH[k]=CALH.misc);
{const u0=update;update=function(dt){u0(dt);try{calTick(dt)}catch(e){if(!CALT_ERR){CALT_ERR=1;console.error('calendar tick',e)}}}}
let CALT_ERR=0;
function calCancelManual(id){const ev=S.cal.find(e=>e.id==id);if(!ev||ev.st>1||ev.k=='collab')return;ev.st=3;updateVersion();snd('pop');pcR()}

/* ---- the Calendar app ---- */
APPD.cal={n:'Calendar',p:0,d:'Free! Sessions, collabs, festival sets and release days in one place, and when your collaborators are free.'};
if(typeof APPMOD!='undefined')APPMOD.cal=[[.95,.9,.2,'#f4f4f4',0,.45,0],[.95,.22,.22,'#e74c3c',0,.9,0],[.15,.15,.24,'#3b82f6',-.25,.5,0],[.15,.15,.24,'#3b82f6',.1,.5,0],[.15,.15,.24,'#3b82f6',-.25,.2,0]];
IC.cal=mkIc(['..........','KKKKKKKKKK','KRRRRRRRRK','KWWWWWWWWK','KWBWBWBWWK','KWWWWWWWWK','KWBWBWBWWK','KWWWWWWWWK','KWBWWWWWWK','KKKKKKKKKK'],{K:'#222',R:'#e74c3c',W:'#fff',B:'#3b82f6'});
{const s0=PA.store;PA.store=()=>s0().replace(/(onclick="inst\('cal'\)">)[^<]*</,'$1Get · Free<')}
let CAL={v:'month',base:null,day:null,who:'you',form:null,msg:''};
const calWho=()=>CAL.who=='you'?null:+CAL.who;
function calContacts(){const seen={},L=[];S.msgs.forEach(m=>{if(m.a!==undefined&&!m.blocked&&!seen[m.a]){seen[m.a]=1;L.push(m.a)}});calAll().forEach(e=>{[e.a].concat(e.p||[]).forEach(i=>{if(i!=null&&!seen[i]){seen[i]=1;L.push(i)}})});return L}
function calGo(p){Object.assign(CAL,p);CAL.msg=p.msg||'';snd('pop');pcR()}
function calMonday(d){return d-wdOf(d)}
/* what a day looks like for the viewed person: 'free', 'busy' (events), 'off' (rest day / other business) */
function calDayState(day){const w=calWho();if(w==null){return calOn(day).some(e=>e.st<=1)?'busy':'free'}
 const x=artX(w);if(x.rest>=0&&wdOf(day)==x.rest)return'off';if(artCmt(w,day))return'off';
 const A0=absT(day,360),A1=absT(day,1800);if(calAll().some(v=>v.st<=1&&v.day==day&&(v.a===w||(v.p&&v.p.includes(w))))||festNpcSlots(w,day).length)return'busy';return'free'}
function calChip(e){const c=calKinds[e.k]||calKinds.misc;return`<div class="ca-ch ${e.st>=3?'x':''}" style="border-left-color:${c[1]}" title="${esc(e.t)}"><b>${fHM(e.s)}</b> ${esc(e.t)}</div>`}
function calMonthHTML(){if(CAL.base==null)CAL.base=calMonday(S.day);const b=CAL.base,cells=[];
 for(let i=0;i<35;i++){const d=b+i;if(d<1){cells.push('<div class="ca-c void"></div>');continue}const ev=calOn(d).filter(e=>e.st!=3),ph=festPhaseOf(d),fs=calDayState(d);
  cells.push(`<div class="ca-c ${d==S.day?'today':''} ${d<S.day?'past':''} ${CAL.day==d?'sel':''} s-${CAL.who=='you'?(ev.some(e=>e.st<=1)?'busy':''):fs}" onclick="calGo({v:'day',day:${d}})"><div class=ca-n><span>${d}</span>${ph=='fest'?'<i title="Park Fields Festival">🎪</i>':ph=='build'?'<i title="Festival crew building">🔧</i>':ph=='down'?'<i title="Festival take-down">🧹</i>':''}</div>${ev.slice(0,3).map(calChip).join('')}${ev.length>3?`<small class=m>+${ev.length-3} more</small>`:''}</div>`)}
 return`<div class=ca-bar><button onclick="calGo({base:${b-28}})">◀ 4 weeks</button><button onclick="calGo({base:null})">Today</button><button onclick="calGo({base:${b+28}})">4 weeks ▶</button><b style="margin-left:8px">Days ${Math.max(1,b)} to ${b+34}</b></div>
 <div class=ca-g>${WDS.map(w=>`<div class=ca-wh>${w}</div>`).join('')}${cells.join('')}</div>
 <p class=m style="font-size:12px">${CAL.who=='you'?'Click a day to see its schedule. Highlighted days have something on.':'Showing '+esc(ART[calWho()][0])+': green is free, orange has a session, red is off (rest day or other business).'} 🎪 festival day (always a Sunday).</p>`}
function calEvCard(e){const c=calKinds[e.k]||calKinds.misc,who=[e.a].concat(e.p||[]).filter((v,i,a)=>v!=null&&a.indexOf(v)==i).map(i=>ART[i][0]);
 const money=e.k=='collab'?(e.dir=='p'?`Fee <b>${$$(e.pay)}</b> ${e.st==2?'paid':e.st==1?'paid at the start':'you pay when it starts'}`:`You earn <b>${$$(e.pay)}</b> ${e.st==2?'(received)':e.st==1?'(received at the start)':'when it starts'}`):e.note&&e.k=='fest'?esc(e.note):'';
 const m=e.mid!=null?S.msgs.find(x=>x.id==e.mid):null,mine=e.st<=1;
 const btn=e.k=='collab'?`${m?`<button onclick="calOpenChat(${m.id})">Open chat</button>`:''}${e.st==0?`<button onclick="calResched(${e.id})">Reschedule</button><button onclick="calAskCancel(${e.id})">Cancel</button>`:''}`:e.k=='fest'?`<button onclick="app='fest';FAPP={v:'home'};pcR()">Open FestivalApp</button>`:(mine?`<button onclick="calCancelManual(${e.id})">Delete</button>`:'');
 const late=e.k=='collab'&&e.st==0&&absT(e.day,e.s)-calNow()<1440,cx=CAL.cx==e.id;
 return`<div class="card ca-e ${e.st>=3?'x':''}" style="border-left:6px solid ${c[1]}"><div style="flex:1;min-width:0"><b style="color:${c[1]};font-size:16px">${esc(e.t)}</b> <span class=m>· ${c[0]}${e.st?' · '+calStatusTxt(e):''}</span><br>
  <span class=m>🕒 ${wdShort(e.day)} Day ${e.day}, ${fHM(e.s)} to ${fHM(e.e)}${e.loc?' · 📍 '+esc(CLOC[e.loc].replace(/^the /,'The ').replace(/^outside your place$/,'Your place')):''}${who.length?' · 👥 '+esc(who.join(', ')):''}</span>${money?`<br><span class=m>💵 ${money}</span>`:''}</div>
  <div class=ca-bt>${cx?`<span class=m>${e.dir=='p'?(late?'Late cancel: you lose 25% of the fee ('+$$(calKillFee(e))+') and 1 reputation. ':'Free to cancel. '):(late?'Late cancel: -1 reputation. ':'Free to cancel. ')}Sure?</span><button class=go onclick="calCancelCollab(${e.id})">Yes, cancel</button><button onclick="CAL.cx=0;pcR()">Keep it</button>`:btn}</div></div>`}
function calDayHTML(){const d=CAL.day||S.day,ev=calOn(d),w=calWho(),ph=festPhaseOf(d);
 let av='';
 if(w==null){const hrs=[];for(let tm=480;tm<=1380;tm+=60){const c=plBusy(d,tm,tm+60,null);hrs.push(`<span class="ca-h ${c?'b':'f'}" title="${c?esc(c.t):'free'}">${fHM(tm)}</span>`)}av=`<h3>You</h3><div class=ca-hr>${hrs.join('')}</div><p class=m style="font-size:12px">Green hours are free for you. Orange is taken by an event.</p>`}
 else{const a=ART[w],x=artX(w),notes=[];if(x.rest>=0&&wdOf(d)==x.rest)notes.push(`${esc(a[0])} ${x.restWhy} on ${WDN[x.rest]}s.`);const cm=artCmt(w,d);if(cm)notes.push(`${esc(a[0])} ${cm} today.`);
  const hrs=[];for(let tm=480;tm<=1380;tm+=60){const r=artAvail(w,d,tm,null,{noAcc:1});hrs.push(`<span class="ca-h ${r.ok?'f':'b'}" title="${esc(r.ok?'free':r.why)}">${fHM(tm)}</span>`)}
  av=`<h3>${esc(a[0])} <small class=m>${wdName(d)}</small></h3>${notes.map(n=>`<p class=ca-warn>${n}</p>`).join('')}<div class=ca-hr>${hrs.join('')}</div><p class=m style="font-size:12px">Green: free to start a session. Hover an orange hour for the reason. Places: ${CMEETK.map(k=>{const r=artAvail(w,d,720,k,{noAcc:1,noLead:1,noHours:1,noRest:1});const bad=!r.ok&&(r.k=='perm'||r.k=='wd');return`<span class="ca-l ${bad?'b':'f'}" title="${esc(bad?r.why:'ok')}">${esc(CLOCS[k])}</span>`}).join(' ')}</p><details><summary class=m>${esc(a[0])}'s rules</summary><ul class=m style="margin:4px 0 4px 18px">${artRules(w).map(t=>`<li>${esc(t)}</li>`).join('')}</ul></details>`}
 return`<div class=ca-bar><button onclick="calGo({v:'month',base:${calMonday(d)}})">◀ Month</button><button onclick="calGo({day:${d-1}})" ${d<=1?'disabled':''}>◀</button><b style="font-size:17px;margin:0 6px">${wdName(d)} · Day ${d}${d==S.day?' · today':''}</b><button onclick="calGo({day:${d+1}})">▶</button><button onclick="calGo({day:null,base:null})">Today</button></div>
  ${ph=='fest'?'<p class=ca-fest>🎪 Park Fields Festival is on today.</p>':ph=='build'?'<p class=ca-fest>🔧 The festival crew is building the grounds today.</p>':ph=='down'?'<p class=ca-fest>🧹 The festival crew is taking everything down today.</p>':''}
  ${ev.length?ev.map(calEvCard).join(''):'<p class=m>Nothing on this day.</p>'}${av}`}
function calUpcoming(){const now=calNow(),L=calAll().filter(e=>e.st<=1&&absT(e.day,e.e)>=now).sort(calSort).slice(0,8);
 return`<h3>Coming up</h3>${L.length?L.map(calEvCard).join(''):'<p class=m>Nothing scheduled. Collabs you arrange in Messages, festival sets you book in FestivalApp and anything you add here will show up.</p>'}`}
function calFormHTML(){const f=CAL.form;if(!f)return'';const days=[];for(let d=S.day;d<S.day+28;d++)days.push(d);
 const tms=[];for(let tm=480;tm<=1380;tm+=30)tms.push(tm);
 return`<div class="card ca-f"><b>New event</b><div class=ca-fr><label>Type <select onchange="CAL.form.k=this.value;CAL.form.t='';pcR()">${['rec','rel','promo','misc'].map(k=>`<option value=${k} ${f.k==k?'selected':''}>${calKinds[k][0]}</option>`).join('')}</select></label>
  <label>Name <input value="${esc(f.t)}" placeholder="${esc(calKinds[f.k][0])}" maxlength=40 oninput="CAL.form.t=this.value"></label></div>
  <div class=ca-fr><label>Day <select onchange="CAL.form.day=+this.value;pcR()">${days.map(d=>`<option value=${d} ${f.day==d?'selected':''}>${wdShort(d)} · Day ${d}${d==S.day?' (today)':''}</option>`).join('')}</select></label>
  <label>Time <select onchange="CAL.form.s=+this.value;pcR()">${tms.map(t=>`<option value=${t} ${f.s==t?'selected':''}>${fHM(t)}</option>`).join('')}</select></label>
  <label>Length <select onchange="CAL.form.len=+this.value;pcR()">${[60,120,180,240].map(t=>`<option value=${t} ${f.len==t?'selected':''}>${t/60} h</option>`).join('')}</select></label>
  <label>Place <select onchange="CAL.form.loc=this.value;pcR()">${CMEETK.map(k=>`<option value=${k} ${f.loc==k?'selected':''}>${esc(CLOCS[k])}</option>`).join('')}</select></label></div>
  ${(()=>{const c=calFormCheck(f);return c?`<p class=ca-warn>${esc(c)}</p>`:''})()}
  <div class=ca-fr><button class=go onclick="calFormSave()">Add to calendar</button><button onclick="CAL.form=null;pcR()">Close</button></div></div>`}
function calFormCheck(f){if(absT(f.day,f.s)<calNow())return'That time has already passed.';const c=plBusy(f.day,f.s,f.s+f.len,f.loc);return c?'Clashes with "'+c.t+'" ('+fHM(c.s)+' to '+fHM(c.e)+'). Pick another time.':''}
function calFormSave(){const f=CAL.form,c=calFormCheck(f);if(c){snd('err');CAL.msg=c;return pcR()}
 calAdd({k:f.k,t:(f.t||'').trim()||calKinds[f.k][0],day:f.day,s:f.s,e:f.s+f.len,loc:f.loc,a:null,p:[],dir:null,pay:0});CAL.form=null;CAL.day=f.day;CAL.msg='';snd('cash');say('Added to your calendar.');pcR()}
PA.cal=()=>{try{
 const who=calContacts(),hd=`<h1 style="margin:0 0 2px"><img src="${IC.cal}" style="width:32px;image-rendering:pixelated;vertical-align:middle"> Calendar</h1><p class=m style="margin-top:0">Today is ${wdName(S.day)}, Day ${S.day}, ${clk()}. Everything with a time: collabs, festival sets, releases and promo.</p>`;
 const ctl=`<div class=ca-bar><span class=m>View</span><button class="${CAL.v=='month'?'on':''}" onclick="calGo({v:'month'})">Month</button><button class="${CAL.v=='day'?'on':''}" onclick="calGo({v:'day',day:CAL.day||S.day})">Day</button>
  <span class=m style="margin-left:10px">Show</span><select onchange="calGo({who:this.value})"><option value=you ${CAL.who=='you'?'selected':''}>You</option>${who.map(i=>`<option value=${i} ${CAL.who==i?'selected':''}>${esc(ART[i][0])}</option>`).join('')}</select>
  <span style="flex:1"></span><button class=go onclick="CAL.form=CAL.form?null:{k:'rec',t:'',day:S.day,s:Math.max(480,Math.min(1380,Math.ceil((festMins()+90)/30)*30)),len:120,loc:'home'};pcR()">+ Add event</button></div>`;
 return`<div class=ca>${hd}${ctl}${CAL.msg?`<p class=ca-warn>${esc(CAL.msg)}</p>`:''}${calFormHTML()}${CAL.v=='day'?calDayHTML():calMonthHTML()+calUpcoming()}</div>`}catch(e){console.error('Calendar',e);return'<p>Calendar hit a snag. Close it and try again.</p>'}};
{const st=document.createElement('style');st.textContent=`.ca h3{font-size:15px;margin:12px 0 6px}.ca-bar{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:8px 0}.ca-bar button.on{background:#5ad1ff;color:#04202b;font-weight:700}.ca-bar select,.ca-f select,.ca-f input{background:#0d1411;color:inherit;border:2px solid #000;padding:5px 8px;font:inherit}
.ca-g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.ca-wh{font-size:12px;opacity:.7;text-align:center;font-weight:700}.ca-c{background:#151a17;border:2px solid #0000;border-radius:6px;min-height:78px;padding:3px 4px;cursor:pointer;overflow:hidden}.ca-c:hover{border-color:#5ad1ff88}.ca-c.void{background:none;cursor:default}.ca-c.past{opacity:.55}.ca-c.today{border-color:#5ad1ff}.ca-c.sel{box-shadow:inset 0 0 0 2px #fff6}
.ca-c.s-busy{background:#3a2a12}.ca-c.s-off{background:#3a1717}.ca-c.s-free{background:#13261b}.ca-n{display:flex;justify-content:space-between;font-weight:700;font-size:13px}.ca-n i{font-style:normal;font-size:12px}
.ca-ch{font-size:11px;border-left:3px solid #fff;padding:0 3px;margin:2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#0006;border-radius:2px}.ca-ch.x{text-decoration:line-through;opacity:.5}
.ca-e{display:flex;gap:8px;align-items:center;margin:6px 0;padding:10px 12px!important}.ca-e.x{opacity:.55}.ca-e .m{font-size:13px}.ca-bt{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.ca-bt span{max-width:300px}
.ca-hr{display:flex;gap:4px;flex-wrap:wrap}.ca-h,.ca-l{padding:3px 8px;border-radius:12px;font-size:12px;border:1px solid #0004}.ca-h.f,.ca-l.f{background:#1f6a42;color:#fff}.ca-h.b,.ca-l.b{background:#7a3d12;color:#ffd9b8}.ca-l.b{background:#6a1a1a;color:#ffd0d0;text-decoration:line-through}
.ca-warn{background:#4a2a12;color:#ffe2c4;padding:6px 8px;border-radius:4px;margin:6px 0}.ca-fest{background:#3a1a3f;color:#ffd0f4;padding:6px 8px;border-radius:4px}.ca-f{margin:8px 0}.ca-fr{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0;align-items:center}.ca-fr label{display:flex;gap:6px;align-items:center}
@media (max-width:760px){.ca-c{min-height:56px}.ca-ch{font-size:10px}.ca-e{flex-direction:column;align-items:flex-start}}`;document.head.appendChild(st)}
