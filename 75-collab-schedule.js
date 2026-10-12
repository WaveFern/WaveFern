/* ===== v26.46.0: scheduled collabs, one fee function, popularity-based DMs =====
   Flow: an artist DMs you (or you message them) -> you negotiate the fee (33-haggle.js) -> you agree on a date, time and place ->
   the session becomes a 'collab' event in S.cal (74-calendar.js) and the thread goes to state 4 (scheduled).
   When that moment arrives (calTick, also after sleeping, skipped days and loading a save) the existing booking flow runs: the money
   moves (payCollab, once), the thread goes to state 1 and the artist waits at the place (gold beacon) until the session ends (3 hours).
   Walking up to them starts the usual meeting and recording (collabDone), which marks the event done and gives the reputation bonus.
   Money: nothing is charged when you schedule (you only need the fee in your pocket then, and again on the day: a few minutes of
   grace until the session ends). Cancelling or moving a session more than a day ahead is free. Under a day: cancelling costs 25% of
   the fee when you pay (and 1 reputation either way), moving costs 10%. If the artist is already waiting and you cancel, a fee you paid
   comes back minus 25%, and a payment the artist made comes back to them in full.
   Missed (you never show): a fee you paid is lost, a payment you received is taken back, reputation -2 and relationship -3
   (-1 and -1 if it never even started), and the artist does not DM again for 5 days.
   Everything about the price comes from collabFee(); everything about who contacts you comes from dmWeight().  */

/* ---- 1. the fee function ---- */
let MKT=null;
/* the roster's normal fee for an artist of this size (log-log interpolation through the roster rows) */
function mktFee(size){if(!MKT)MKT=ART.map(a=>[Math.log(Math.max(1,a[2])),Math.log(a[3])]).sort((p,q)=>p[0]-q[0]);
 const x=Math.log(Math.max(1,size)),f=MKT[0],l=MKT[MKT.length-1];if(x<=f[0])return Math.exp(f[1]+(x-f[0])*.6);if(x>=l[0])return Math.exp(l[1]+(x-l[0])*.9);
 for(let j=1;j<MKT.length;j++)if(x<=MKT[j][0]){const[x0,y0]=MKT[j-1],[x1,y1]=MKT[j],t=x1==x0?0:(x-x0)/(x1-x0);return Math.exp(y0+(y1-y0)*t)}return l[1]}
/* small artists charge a fraction of the headline fee: ~18% at a handful of listeners, ~50% at 1,000, ~90% at 15,000 and up */
const smallK=A=>.18+.82*A/(A+1500);
/* collabFee(i, dir, k): the ONE price function.
   dir 'p' = what artist i charges the player (the player contacted them)
   dir 'a' = what artist i pays the player (they contacted the player)
   k       = optional multiplier (1.2 for a repeat session)
   'p': the artist's headline fee x smallK (fee scales with audience), x a seeded markup (0.92-1.12), x how much bigger they are than the
        player (a bigger audience is worth more to you: (A/L)^0.2, clamped 0.75-1.35), x 0.92 for artists you already worked with,
        x a small discount for a good reputation.
   'a': the market price of the player's own audience, 55% of it, never more than 80% of what the artist would charge themselves. */
function collabFee(i,dir,k){const a=ART[i];if(!a)return 5;const A=a[2],x=artX(i),L=Math.max(0,S.listeners||0),rep=Math.max(-5,Math.min(10,S.rep||0));
 const prev=S.msgs.some(m=>m.a===i&&m.state==3)?.92:1,rel=Math.min(1.35,Math.max(.75,Math.pow((A+5)/(L+5),.2)));
 const fee=a[3]*smallK(A)*x.mk*rel*prev*(1-rep*.01);
 let v;if(dir=='a'){const M=mktFee(Math.max(1,L))*smallK(Math.max(1,L));v=Math.min(M*.55*(.9+(x.mk-.92)),fee*.8)}else v=fee;
 return Math.max(3,nr(v*(k||1)))}

/* ---- 2. who messages you: popularity weights ---- */
const GENREL=[['Hip-Hop','Rap'],['Pop','R&B','Indie'],['Lo-fi','Electronic','Folk'],['Rock','Country','Folk','Indie'],['R&B','Latin','Pop']];
/* 0..1: how fast the player is growing (monthly listeners now vs a week ago) and how much interest their releases have */
function dmMomentum(){const h=S.mlHist||[],cur=h.length?h[h.length-1].ml:S.listeners||0,old=(h.filter(q=>q.day<=S.day-7).pop()||h[0]||{ml:cur}).ml,g=Math.max(0,Math.min(1,((cur+1)/(old+1)-1)));return Math.min(1,g*.7+(S.interest||0)*.3)}
function dmWeight(i,mo){const a=ART[i],A=a[2],L=Math.max(S.listeners||0,5),d=Math.log10(A/L),M=mo==null?dmMomentum():mo,rep=Math.max(-10,Math.min(15,S.rep||0));let w;
 if(Math.abs(d)<=.35)w=1;/* similar size: the most common */
 else if(d<0&&d>-.9)w=.7;/* a bit smaller: frequent */
 else if(d>0&&d<=1)w=.3*(1+2*M);/* a bit bigger: occasional, more when you are gaining momentum */
 else if(d<0){/* much smaller: rare unless there is a believable reason (a previous collab, or the same sound as your latest releases) */
  const rec=(S.songs||[]).slice(-5).map(s=>s.g);w=(rec.includes(a[1])||S.msgs.some(m=>m.a===i&&m.state==3))?.12:.015}
 else{/* much bigger: rare for an unknown, rising with your size, your reputation and your momentum */
  const rise=1+Math.min(4,Math.max(0,rep)*.15)+Math.min(3,Math.log10(L+1)*.5)+M*2;w=(d<=2.2?.02:.004*Math.pow(10,-(d-2.2)*.35))*rise}
 /* secondary: genre fit with your recent releases, reputation */
 const rec=(S.songs||[]).slice(-5).map(s=>s.g);if(rec.length){w*=rec.includes(a[1])?1.6:GENREL.some(g=>g.includes(a[1])&&rec.some(r=>g.includes(r)))?1.25:.85}
 return w*(1+.03*rep)}
/* draw k artists (nobody who already has a thread) in proportion to their weight, with noise so it is never predictable */
function dmDraw(k){const mo=dmMomentum(),c=ART.map((a,i)=>i).filter(i=>!S.msgs.some(m=>m.a===i)&&!(typeof BLKI!='undefined'&&BLKI&&BLKI.has(i))),out=[];
 const w=c.map(i=>[i,dmWeight(i,mo)*(.5+Math.random())]);
 while(out.length<k&&w.length){const tot=w.reduce((p,q)=>p+q[1],0);if(tot<=0)break;let r=Math.random()*tot,j=0;for(;j<w.length-1;j++){if(r<w[j][1])break;r-=w[j][1]}out.push(w[j][0]);w.splice(j,1)}
 return out}
/* how many new DMs today: usually none or one, sometimes two */
function dmDaily(){const r=Math.random(),k=r<.3?0:r<.75?1:2,pend=S.msgs.filter(m=>m.a!==undefined&&!m.blocked&&m.state==0&&m.stage>=1&&m.unread).length,n=Math.max(0,Math.min(k,3-pend));
 const L=dmDraw(n);L.forEach(i=>newConv(i));return L.length}

/* ---- 3. offers with dates ---- */
const isInM=m=>m&&m.init=='a';
const thr=m=>m&&m.ev!=null?calEvOf(m.ev):null;
const slotShort=o=>wdShort(o.day)+' Day '+o.day+' at '+fHM(o.tm)+' ('+CLOCS[o.loc]+')';
function schOffer(m){const alts=calAlts(m.a,meetLoc(m),3);m.opt=alts;return alts}
function schOfferTxt(m){const L=schOffer(m);if(!L.length)return'';const s=L.map(slotShort);return(L.length>1?'i could do ':'i could do ')+(s.length>1?s.slice(0,-1).join(', ')+' or '+s[s.length-1]:s[0])+'.'}
/* add "i could do ..." to the artist's last line (once) */
function schAppendOffer(m){const l=m.log[m.log.length-1];if(!l||l.f!='a'||/ Day \d/.test(l.t))return;const t=schOfferTxt(m);if(t)l.t+=' '+t}
const INOFFER=['want to make a {g} track together? i will pay you ${pay} for one session and you get the feature. {dates}','i have an idea for us, a {g} track. ${pay} from me for one session, your name on it next to mine. {dates}','been listening to your stuff. {g} collab? i pay you ${pay} for a session and we split the song. {dates}'];
function incomingOffer(m){const a=ART[m.a];m.init='a';m.pay=collabFee(m.a,'a');m.stage=2;m.want=1;m.asked=1;m.ready=0;delete m.ng;
 const c=ctxOf(m);c.pay=m.pay;c.dates=schOfferTxt(m)||'tell me which day works for you.';const l=m.log[m.log.length-1];
 const t=fill(pick(INOFFER),c);if(l&&l.f=='a'&&m.log.length>=2)l.t=t;else m.log.push({f:'a',t,d:S.day})}
{const nc0=newConv;newConv=function(i,q){const n0=S.nid;nc0(i,q);const m=S.msgs.find(x=>x.id>=n0&&x.a===i);if(m)incomingOffer(m)}}
/* the first in-game day: same weights as every other day, so tiny artists reach out to a brand-new player */
firstDMs=function(){S.dm1=1;const k=RI(2,3),pool=dmDraw(k);
 pool.forEach((i,j)=>{const a=ART[i],w=j<2,m={id:S.nid++,a:i,state:0,stage:0,ex:0,neg:0,pay:a[3],unread:1,log:[],rel:0,init:'a'};
  m.log.push({f:'a',t:deco(a,pick(FDM[w?'w':'f'])),d:S.day});S.msgs.push(m);
  if(w){m.log.push({f:'a',t:'x',d:S.day});incomingOffer(m)}else m.pay=collabFee(i,'a')});
 if(pool.length){snd('ping');say(pool.length+' artist'+(pool.length>1?'s':'')+' messaged you. Check Messages on your computer.')}updateVersion()};
{const sc0=startChat;startChat=function(i){sc0(i);const m=S.msgs[S.msgs.length-1];if(m&&m.a===i){m.pay=collabFee(i,'p')}}}
/* a new DM roll each morning is in genMsgs (19-...js calls dmDaily); the offers that come out of a nudge get dates too */
{const g0=genMsgs;genMsgs=function(){const snap=S.msgs.filter(m=>m.a!==undefined&&Array.isArray(m.log)).map(m=>[m,m.state,m.stage,m.log.length]);g0();
  snap.forEach(([m,st,sg,len])=>{if(m.a===undefined||m.blocked||m.log.length<=len)return;if(m.state==0&&m.stage==2&&(st!=0||sg<2)){if(st==3){m.init='a';m.pay=collabFee(m.a,'a',1.2);const l=m.log[m.log.length-1];l.t=l.t.replace(/\$[\d,]+(\.\d+)?/,'$'+m.pay)}schAppendOffer(m)}})}}
function schLine(m){const e=thr(m);return e?'looking forward to '+calSlotTxt(e.day,e.s,e.loc)+'.':'see you soon.'}

/* ---- 4. scheduling ---- */
let SCH={id:null,day:null,tm:900,loc:null,re:0,msg:''},CALX=0;
const SCHT=[];for(let t=480;t<=1380;t+=60)SCHT.push(t);
/* what to check for a thread's proposal: the event being moved is ignored */
const schIgn=m=>SCH.re&&m.ev!=null?m.ev:null;
function schCheck(m,day,tm,loc,ign){const r=artAvail(m.a,day,tm,loc,{ign});if(!r.ok)return r;const pb=plBusy(day,tm,tm+180,loc,ign);if(pb)return{ok:false,k:'you',why:'You already have "'+pb.t+'" then ('+fHM(pb.s)+' to '+fHM(pb.e)+'). Your calendar would be double-booked.'};return{ok:true}}
function schInit(m){if(SCH.id===m.id&&SCH.day!=null)return;const e=thr(m);let d=null,tm=900,loc=meetLoc(m);
 if(m.pd){d=m.pd.day;tm=m.pd.tm??tm;loc=m.pd.loc||loc}else{const o=(m.opt||[]).find(o=>o.day>=S.day&&schCheck(m,o.day,o.tm,o.loc).ok)||calAlts(m.a,loc,1)[0];if(o){d=o.day;tm=o.tm;loc=o.loc}}
 SCH={id:m.id,day:d==null?S.day+1:d,tm,loc,re:SCH.id===m.id?SCH.re:0,msg:''}}
function schSet(k,v){SCH[k]=v;SCH.msg='';pcR()}
function schPick(day,tm,loc){SCH.day=day;SCH.tm=tm;SCH.loc=loc;SCH.msg='';pcR()}
function schBar(m){schInit(m);const ign=schIgn(m),ev=thr(m),pp=!isInM(m),r=schCheck(m,SCH.day,SCH.tm,SCH.loc,ign);
 const days=[];for(let d=S.day;d<S.day+28;d++)days.push(d);
 const dopt=days.map(d=>{const ok=schCheck(m,d,SCH.tm,SCH.loc,ign).ok;return`<option value=${d} ${SCH.day==d?'selected':''}>${ok?'✓':'✗'} ${wdShort(d)} · Day ${d}${d==S.day?' · today':d==S.day+1?' · tomorrow':''}</option>`}).join('');
 const topt=SCHT.map(t=>{const ok=schCheck(m,SCH.day,t,SCH.loc,ign).ok;return`<option value=${t} ${SCH.tm==t?'selected':''}>${ok?'✓':'✗'} ${fHM(t)}</option>`}).join('');
 const lopt=CMEETK.map(k=>{const ok=schCheck(m,SCH.day,SCH.tm,k,ign).ok,pb=locBan(m.a,k);return`<option value=${k} ${SCH.loc==k?'selected':''}>${pb?'✗ never':ok?'✓':'✗'} ${esc(CLOCS[k])}</option>`}).join('');
 const alts=r.ok?[]:calAlts(m.a,SCH.loc,3,{ign}),opts=(m.opt||[]).filter(o=>o.day>=S.day&&schCheck(m,o.day,o.tm,o.loc,ign).ok).slice(0,3);
 const chips=(r.ok?opts:alts.concat(opts)).filter((o,i,a)=>a.findIndex(q=>q.day==o.day&&q.tm==o.tm&&q.loc==o.loc)==i).slice(0,4).map(o=>`<button class=chp onclick="schPick(${o.day},${o.tm},'${o.loc}')">${esc(slotShort(o))}</button>`).join('');
 const money=pp?`You pay <b>${$$(m.pay)}</b> when the session starts${S.money<m.pay?` · <span style="color:#ff9a6a">you only have ${$$(S.money)}</span>`:''}`:`${esc(ART[m.a][0])} pays you <b>${$$(m.pay)}</b> when the session starts`;
 return`<div class=sch><div class=schh><b>${SCH.re?'Move the session':'Pick a date for the session'}</b><span>${money}</span></div>
  <div class=schr><label>Day <select onchange="schSet('day',+this.value)">${dopt}</select></label><label>Time <select onchange="schSet('tm',+this.value)">${topt}</select></label><label>Place <select onchange="schSet('loc',this.value)">${lopt}</select></label></div>
  <div class="schs ${r.ok?'ok':'no'}">${r.ok?'✓ '+esc(ART[m.a][0])+' is free then and so are you: '+esc(calSlotTxt(SCH.day,SCH.tm,SCH.loc)):'✗ '+esc(r.why)}</div>
  ${SCH.msg?`<div class="schs no">${esc(SCH.msg)}</div>`:''}${chips?`<div class=schc><small>${r.ok?'Their other offers':'Try one of these'}:</small> ${chips}</div>`:''}
  <div class=schb><button class=go onclick="schGo(${m.id})">${SCH.re?'Propose new time':'Propose this time'}</button>${SCH.re?`<button onclick="SCH.re=0;pcR()">Keep the current time</button>`:`<button onclick="unready(${m.id})">Not now</button>`}</div></div>`}
function schInfoBar(m){const e=thr(m);if(!e)return'';const pp=e.dir=='p',late=absT(e.day,e.s)-calNow()<1440;
 if(m.state==1&&e.st==1)return`<div class=sch><div class=schh><b>${esc(ART[m.a][0])} is waiting for you</b><span>${esc(CLOC[e.loc])} until ${fHM(e.e)} · walk up to them (gold beacon)</span></div></div>`;
 if(m.state!=4)return'';const cx=SCH.cx==m.id;
 return`<div class=sch><div class=schh><b>📅 Scheduled: ${esc(calSlotTxt(e.day,e.s,e.loc))}</b><span>${pp?'You pay '+$$(e.pay):esc(ART[m.a][0])+' pays you '+$$(e.pay)} when it starts</span></div><div class=schb>${cx?`<span class=m>${pp&&late?'Late cancel: you lose '+$$(calKillFee(e))+' and 1 reputation. ':late?'Late cancel: -1 reputation. ':'Free to cancel. '}Sure?</span><button class=go onclick="calCancelCollab(${e.id})">Yes, cancel</button><button onclick="SCH.cx=0;pcR()">Keep it</button>`:`<button onclick="calResched(${e.id})">Reschedule</button><button onclick="SCH.cx=${m.id};pcR()">Cancel</button><button onclick="app='cal';CAL.v='day';CAL.day=${e.day};pcR()">Open calendar</button>`}</div></div>`}
{const pm=PA.msg;PA.msg=function(){const h=pm.apply(this,arguments);try{const m=S.msgs.find(x=>x.id==S.chat);if(typeof h!='string'||!m||m.a===undefined||m.blocked)return h;
  if(m.state==0&&m.stage==2&&m.ready){const b=schBar(m);return h.replace(/<div class=mloc>[\s\S]*?<\/div>(?=<div class=cfm>)/,'').replace(/<div class=cfm>[\s\S]*?<\/div>/,b)}
  if(m.state==4||(m.state==1&&m.ev!=null)){const b=m.state==4&&SCH.re&&SCH.id===m.id?schBar(m):schInfoBar(m);const i=h.indexOf('<div class=cin>');return i<0?h:h.slice(0,i)+b+h.slice(i)}
  return h}catch(e){console.error('schedule bar',e);return h}}}
function schSay(m,t,deco2){m.log.push({f:'a',t:deco2===false?t:deco(ART[m.a],t),d:S.day})}
const SCHOK=['works for me','yep, i can do that','perfect','sounds good','done, that works'],SCHNO=['sorry,','ah,','hmm,','so,'];
/* the player proposes a slot (from the panel or typed). Anything missing comes from the panel / the thread. */
function schGo(id){const m=S.msgs.find(x=>x.id==id);if(!m)return;m.log.push({f:'me',t:(SCH.re?'can we move it to ':'how about ')+calSlotTxt(SCH.day,SCH.tm,SCH.loc)+'?',d:S.day});schPropose(m,{day:SCH.day,tm:SCH.tm,loc:SCH.loc});pcR()}
function schPropose(m,p){const a=ART[m.a],ev=SCH.re&&m.ev!=null?thr(m):null,e0=m.state==4?thr(m):null,ign=e0?e0.id:null;
 const day=p.day!=null?p.day:(e0?e0.day:(SCH.id===m.id&&SCH.day)||S.day+1),tm=p.tm!=null?p.tm:(e0?e0.s:(SCH.id===m.id&&SCH.tm)||900),loc=p.loc||(e0?e0.loc:meetLoc(m));
 SCH.id=m.id;SCH.day=day;SCH.tm=tm;SCH.loc=loc;const pp=!isInM(m);
 if(!(tm>=480&&tm<=1380)){schSay(m,'i only do sessions between '+fHM(480)+' and '+fHM(1380)+'. what time works?');return false}
 const r=schCheck(m,day,tm,loc,ign);
 if(!r.ok){const alts=calAlts(m.a,loc,3,{ign});m.alt=alts;m.rel=(m.rel||0)+0;
  let t=pick(SCHNO)+' '+(r.k=='you'?'i think you are busy then: '+r.why.replace(/^You already have/,'you have'):r.why);
  if(alts.length){const s=alts.map(slotShort);t+=' how about '+(s.length>1?s.slice(0,-1).join(', ')+' or '+s[s.length-1]:s[0])+'?'}else if(r.k!='perm')t+=' i do not see a free slot in the next few weeks, try later.';
  schSay(m,t,false);return false}
 if(pp&&S.money<m.pay&&!ev){schSay(m,'before we lock it in: you only have '+$$(S.money)+' and my fee is '+$$(m.pay)+'. come back when you can cover it and pick the day again.',false);SCH.msg='Not enough money for the '+$$(m.pay)+' fee yet.';snd('err');return false}
 const sure=pick(SCHOK);
 if(e0){/* moving a scheduled session */
  const late=absT(e0.day,e0.s)-calNow()<1440;let fee=0;
  if(late&&pp&&(day!=e0.day||tm!=e0.s)){fee=Math.round(e0.pay*.1);if(S.money<fee){schSay(m,'moving it this late costs '+$$(fee)+' and you only have '+$$(S.money)+'. keep the current time or cancel.',false);snd('err');return false}S.money=+(S.money-fee).toFixed(2)}
  e0.day=day;e0.s=tm;e0.e=tm+180;e0.loc=loc;e0.rm=0;e0.due=0;m.loc=loc;SCH.re=0;S.cal.sort(calSort);m.pd=null;
  schSay(m,sure+', moved to '+calSlotTxt(day,tm,loc)+'.'+(fee?' i keep '+$$(fee)+' for the short notice.':''),false);if(fee)say('Short-notice change: '+$$(fee)+' to '+ART[m.a][0]);
  snd('chime');say('Rescheduled to '+calSlotTxt(day,tm,loc));updateVersion();return true}
 schLock(m,day,tm,loc,sure);return true}
function schLock(m,day,tm,loc,sure){const a=ART[m.a],pp=!isInM(m);
 const ev=calAdd({k:'collab',t:'Collab with '+a[0],day,s:tm,e:tm+180,loc,a:m.a,p:[],dir:pp?'p':'a',pay:m.pay,mid:m.id});
 m.ev=ev.id;m.loc=loc;m.state=4;m.stage=2;m.ready=0;m.pd=null;m.alt=null;SCH={id:m.id,day:null,tm:900,loc:null,re:0,msg:''};
 schSay(m,(sure||'works for me')+'. locked in: '+calSlotTxt(day,tm,loc)+'. '+(pp?'the '+$$(m.pay)+' fee is paid when we start.':'i pay you '+$$(m.pay)+' when we start.')+' it is in your calendar.',false);
 snd('chime');say('Scheduled: '+a[0]+', '+calSlotTxt(day,tm,loc));updateVersion()}
/* cancel a scheduled or running session; late = under a day to go */
const calKillFee=e=>Math.round(e.pay*.25);
function schCancel(m,how){const e=thr(m);if(!e||e.st>1)return;const a=ART[m.a],pp=e.dir=='p',late=absT(e.day,e.s)-calNow()<1440;let note='';
 if(e.st==0){if(late){S.rep=(S.rep||0)-1;if(pp){const f=Math.min(S.money,calKillFee(e));S.money=+(S.money-f).toFixed(2);note='cancelled late: '+$$(f)+' (25%) kept for the short notice. reputation -1.'}else note='cancelled late. reputation -1.'}else note='cancelled in good time, no charge.'}
 else{S.rep=(S.rep||0)-1;if(pp&&m.paid){const back=+(m.paid*.75).toFixed(2);S.money=+(S.money+back).toFixed(2);note='cancelled while the artist was waiting: '+$$(back)+' back (they keep 25%). reputation -1.';m.paid=0}else if(m.recv){const b=Math.min(S.money,m.recv);S.money=+(S.money-b).toFixed(2);m.recv=0;note='cancelled while the artist was waiting: you gave back the '+$$(b)+'. reputation -1.'}else note='cancelled. reputation -1.'}
 e.st=3;m.ev=null;m.state=0;m.stage=0;m.ready=0;m.paid=0;m.recv=0;delete m.ng;SCH={id:null,day:null,tm:900,loc:null,re:0,msg:''};
 schSay(m,pick(['ok, no hard feelings. ','understood. ','fine, plans change. '])+'the session is cancelled.',false);m.log.push({f:'a',t:'(calendar) '+note,d:S.day});
 syncArt();updateVersion();snd('pop');say('Cancelled the session with '+a[0]+'. '+note);CAL.cx=0;pcR()}
function calCancelCollab(id){const e=S.cal.find(x=>x.id==id),m=e&&S.msgs.find(x=>x.id==e.mid);if(m)schCancel(m,'ui');else if(e){e.st=3;pcR()}}
function calAskCancel(id){CAL.cx=id;pcR()}
function calOpenChat(mid){app='msg';S.chat=mid;const m=S.msgs.find(x=>x.id==mid);if(m)m.unread=0;pcR()}
function calResched(eid){const e=calEvOf(eid);if(!e||e.st!=0)return;const m=S.msgs.find(x=>x.id==e.mid);if(!m)return;SCH={id:m.id,day:e.day,tm:e.s,loc:e.loc,re:e.id,msg:''};app='msg';S.chat=m.id;m.unread=0;snd('pop');pcR()}

/* ---- 5. when the time comes ---- */
CALH.collab={
 start(ev){const m=S.msgs.find(x=>x.id==ev.mid);if(!m||m.ev!==ev.id){ev.st=3;return true}
  /* the usual booking step moves the money exactly once and puts the artist at the meeting place */
  m.state=0;m.stage=2;m.ready=1;m.pay=ev.pay;m.loc=ev.loc;CALX=1;try{payCollab(m.id)}finally{CALX=0}
  if(m.state==1){ev.st=1;ev.due=0;say('📅 '+ART[m.a][0]+' is waiting '+CLOC[ev.loc].replace(/^outside your place$/,'at your place')+' until '+fHM(ev.e)+'. Go meet them!');return true}
  m.state=4;m.ready=0;if(!ev.due){ev.due=1;say('📅 The session with '+ART[m.a][0]+' is on but you cannot cover '+$$(m.pay)+'. Get the money before '+fHM(ev.e)+'.')}return false},
 late(ev){/* the whole session passed before it could start (slept or away through it, or never had the money) */
  const m=S.msgs.find(x=>x.id==ev.mid);ev.st=4;if(m&&m.ev===ev.id)schMissed(m,ev,0)},
 end(ev){const m=S.msgs.find(x=>x.id==ev.mid);if(MEET||(typeof cs2!='undefined'&&cs2&&mode=='cut'))return;ev.st=4;if(m&&m.ev===ev.id)schMissed(m,ev,1)}};
function schMissed(m,ev,paid){const a=ART[m.a];
 S.rep=(S.rep||0)-(paid?2:1);m.rel=(m.rel||0)-(paid?3:1);m.neg=(m.neg||0)+1;m.cool=S.day+5;let note;
 if(paid){if(ev.dir=='p'){note='you did not show up: the '+$$(ev.pay)+' fee is lost. reputation -2.';m.paid=0}
  else{const b=Math.min(S.money,m.recv||0);S.money=+(S.money-b).toFixed(2);m.recv=0;note='you did not show up: '+a[0]+' took back their '+$$(b)+'. reputation -2.'}}
 else note='the session passed without you. reputation -1.';
 m.ev=null;m.state=0;m.stage=0;m.ready=0;delete m.ng;m.unread=1;syncArt();
 m.log.push({f:'a',t:deco(a,pick(['i waited and you never came. not cool.','hello? i was there and you were not. we are done for now.','that was a no-show. i will not be rebooking for a while.'])),d:S.day});m.log.push({f:'a',t:'(calendar) '+note,d:S.day});
 snd('err');say('⚠️ Missed the session with '+a[0]+'. '+note);updateVersion()}
/* the booking button can only be pressed by the calendar */
{const pc0=payCollab;payCollab=function(id){if(!CALX){const m=S.msgs.find(x=>x.id==id);if(m&&m.state==0&&m.stage==2&&m.ready){say('Pick a date first, then the session is added to your calendar.');return pcR()}}return pc0(id)}}
{const cd0=collabDone;collabDone=function(){const o=cs2&&cs2.o,m=o&&S.msgs.find(x=>x.a===o.i),ev=m&&thr(m),r=cd0.apply(this,arguments);
  if(ev&&ev.st==1){ev.st=2;S.rep=(S.rep||0)+1;if(m)m.ev=null;updateVersion();say('Collab done. Reputation +1.');
   /* the new track goes in the calendar as a release day tomorrow at noon, if you are free then (delete it if you like) */
   const d=S.drafts[S.drafts.length-1];if(d&&d.ft&&!plBusy(S.day+1,720,780,'home'))calAdd({k:'rel',t:'Release your collab with '+ART[m.a][0],day:S.day+1,s:720,e:780,loc:'home',a:m.a,p:[],dir:null,pay:0})}return r}}
/* a thread can never be left scheduled without a live event */
function schRepair(){S.msgs.forEach(m=>{if(m.a===undefined)return;const e=m.ev!=null?calEvOf(m.ev):null;if(m.state==4&&(!e||e.st>1)){m.state=0;m.stage=0;m.ev=null;m.ready=0}else if(m.state!=4&&m.state!=1&&m.ev!=null&&(!e||e.st>1))m.ev=null})}
/* a legacy booking from an old save (state 1 with no event) works as before */
/* an artist who blocks you drops the scheduled session (the old code refunds anything already paid) */
{const nb0=npcBlock;npcBlock=function(m,why){const e=m&&m.a!==undefined?thr(m):null;nb0(m,why);if(e&&e.st<=1&&m.blocked){e.st=3;m.ev=null;m.pd=null;SCH={id:null,day:null,tm:900,loc:null,re:0,msg:''}}}}

/* ---- 6. the chat ---- */
const SCH_DATE=/\b(today|tonight|tomorrow|day after tomorrow|next week|this weekend|weekend|in (\d+|a|one|two|three|four|five|six|seven) days?|day \d+|mon(day)?|tue(s|sday)?|wed(nesday)?|thu(r|rs|rsday)?|thursday|fri(day)?|sat(urday)?|sun(day)?|noon|midnight|morning|afternoon|evening|\d{1,2}(:\d\d)? ?(am|pm)|\d{1,2}:\d\d)\b/;
const SCH_WD=[/\bmon(day)?\b/,/\btue(s|sday)?\b/,/\bwed(nesday)?\b/,/\bthu(r|rs|rsday)?\b|\bthursday\b/,/\bfri(day)?\b/,/\bsat(urday)?\b/,/\bsun(day)?\b/];
const SCH_NUM={a:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7};
/* "friday at 3pm", "tomorrow evening", "day 15", "in 3 days at the cafe" -> {day,tm,loc} (null parts are left out) or null */
function schParse(t){const s=' '+String(t||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9: ]+/g,' ').replace(/\s+/g,' ')+' ';let day=null,tm=null,loc=null,x;
 if(/\bday after tomorrow\b/.test(s))day=S.day+2;else if(/\btomorrow\b/.test(s))day=S.day+1;else if(/\b(today|tonight)\b/.test(s)){day=S.day;if(/\btonight\b/.test(s))tm=1200}
 else if(x=s.match(/\bin (\d+|a|one|two|three|four|five|six|seven) days?\b/))day=S.day+(SCH_NUM[x[1]]||+x[1]);
 else if(/\b(next week|in a week)\b/.test(s))day=S.day+7;
 else if(/\b(this )?weekend\b/.test(s))day=S.day+((5-wdOf(S.day)+7)%7||7);
 else if(x=s.match(/\bday (\d+)\b/))day=+x[1];
 else for(let w=0;w<7;w++)if(SCH_WD[w].test(s)){let d=S.day+((w-wdOf(S.day)+7)%7);if(d==S.day)d+=7;day=d;break}
 if(x=s.match(/\b(\d{1,2})(?::(\d\d))? ?(am|pm)\b/)){let h=+x[1]%12;if(x[3]=='pm')h+=12;tm=h*60+(+x[2]||0)}
 else if(x=s.match(/\b(\d{1,2}):(\d\d)\b/))tm=+x[1]*60+ +x[2];
 else if(/\bnoon\b/.test(s))tm=720;else if(/\bmidnight\b/.test(s))tm=1440;else if(/\bmorning\b/.test(s))tm=600;else if(/\bafternoon\b/.test(s))tm=900;else if(/\bevening\b/.test(s))tm=1140;else if(/\bnight\b/.test(s)&&tm==null)tm=1260;
 if(tm!=null){if(tm<360)tm+=1440;tm=Math.round(tm/30)*30}
 if(typeof MEETRX!='undefined')for(const[k,rx]of MEETRX)if(k!='studio'&&rx.test(s)){loc=k;break}
 return day!=null||tm!=null||loc?{day,tm,loc}:null}
/* the message with its date and time words taken out, so "friday at 3pm" or "day 15" is not read as a price */
const schStrip=t=>String(t||'').toLowerCase().replace(/\bday \d+\b/g,' ').replace(/\bin (\d+|a|one|two|three|four|five|six|seven) days?\b/g,' ').replace(/\b\d{1,2}(:\d\d)? ?(am|pm)\b/g,' ').replace(/\b\d{1,2}:\d\d\b/g,' ');
const hasMoney=t=>/[$£€]|\b(bucks?|dollars?|quid|grand)\b|\d\s?k\b/i.test(t);
const RX_CANCEL=/\b(cancel|call it off|call off|scrap (it|this)|drop it|forget it|not happening|cant make it|can not make it)\b/,RX_RESCH=/\b(resched|reschedule|move (it|this|the|our)|postpone|another (day|time)|different (day|time)|push it|change the (date|day|time)|later date)\b/;
/* typed messages in each phase of a collab */
{const r0=reply;reply=function(m,t){
  if(!m||m.a===undefined||m.blocked||!ART[m.a])return r0(m,t);
  const R=npcIntent(t);if(R.k=='abuse'||npcClaim(t))return r0(m,t);
  const s=' '+String(t).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9:$ ]+/g,' ')+' ',e=thr(m);
  /* a scheduled session: cancel, move, change place or just chat */
  if(m.state==4&&e){TY=0;m.rel=(m.rel||0)+1;
   if(RX_CANCEL.test(s)&&!RX_RESCH.test(s)){schCancel(m,'chat');return}
   const p=schParse(t);
   if(RX_RESCH.test(s)||(p&&(p.day!=null||p.tm!=null||p.loc))){if(!p||(p.day==null&&p.tm==null&&!p.loc)){schSay(m,pick(['sure, when works instead? pick a new time below.','no problem, what day is better for you? use the picker below.']),false);SCH={id:m.id,day:e.day,tm:e.s,loc:e.loc,re:e.id,msg:''};return}
    SCH.re=e.id;SCH.id=m.id;schPropose(m,p);return}
   {const n=NZ(t),tg=IR.filter(q=>q[1].test(n)).map(q=>q[0]);if((tg.includes('no')||tg.includes('cancel'))&&!tg.includes('yes')){schSay(m,'so are we still on for '+calSlotTxt(e.day,e.s,e.loc)+'? say "cancel" to call it off, or tell me a new day.',false);return}}
   m.state=1;try{r0(m,t)}finally{if(m.state==1)m.state=4}return}
  /* a session that is on right now: cancelling it has a price */
  if(m.state==1&&e&&e.st==1){const n=NZ(t),tg=IR.filter(q=>q[1].test(n)).map(q=>q[0]);TY=0;
   if(RX_CANCEL.test(s)){schCancel(m,'chat');return}
   if((tg.includes('no')||tg.includes('cancel'))&&!tg.includes('yes')){schSay(m,'i am at '+CLOC[e.loc]+' waiting. are you coming, or do you want to cancel? (cancelling now costs you)',false);return}}
  /* agreeing a date while the price is on the table */
  if(m.state==0&&m.stage==2&&!hasMoney(t)&&negNum(schStrip(t))==null){const p=schParse(t),n=NZ(t),tg=IR.filter(q=>q[1].test(n)).map(q=>q[0]);
   if(p&&(p.day!=null||p.tm!=null)&&(m.ready||!tg.includes('haggle'))){TY=0;m.rel=(m.rel||0)+1;
    if(!m.ready){m.pd=p;const f=p.day!=null?calSlotTxt(p.day,p.tm??900,p.loc||meetLoc(m)):fHM(p.tm);schSay(m,'noted, '+f+'. first, are we good on '+(isInM(m)?$$(m.pay)+' from me?':'my '+$$(m.pay)+' fee?'),false);return}
    schPropose(m,p);return}
   /* "yes" to the alternatives they just suggested */
   if(m.ready&&m.alt&&m.alt.length&&R.k=='yes'){const o=m.alt[0];TY=0;m.log.push({f:'me',t:'yes, '+calSlotTxt(o.day,o.tm,o.loc),d:S.day});schPropose(m,o);return}}
  /* run it back: a finished collab gets new terms at the repeat price */
  if(m.state==3&&(R.k=='yes'||IR.some(q=>q[0]=='collab'&&q[1].test(NZ(t))))){TY=0;m.state=0;m.stage=2;m.init='p';m.pay=collabFee(m.a,'p',1.2);delete m.ng;m.ready=0;
   const c=ctxOf(m);c.pay=m.pay;schSay(m,fill('sure, another session! my fee is ${pay}.',c));schAppendOffer(m);return}
  const st0=m.stage,sd0=m.state;r0(m,t);
  if(m.state==0&&m.stage==2&&(st0<2||sd0!=0)&&!m.ready)schAppendOffer(m)}}
RB.confirm=['deal, ${pay}. now pick a day that works for both of us','sweet. ${pay} it is, due on the day. which day works?','love it. lets find a date, the ${pay} is paid when we start'];
RB_IN.confirm=['deal. i pay you ${pay} on the day. pick a date that works for you','love it, ${pay} from me when we start. which day suits you?','sorted, ${pay} on the day. what date works?'];
/* places: an artist never agrees to a place on their permanent list, and weekday places need the right day */
{const ml0=meetLoc;meetLoc=function(m){let L=ml0(m);if(m&&m.a!==undefined&&ART[m.a]&&locBan(m.a,L)){const alt=CMEETK.find(k=>!locBan(m.a,k)&&!locWd(m.a,k))||'cafe';m.loc=alt;L=alt}return L}}
{const sm0=setMeetLoc;setMeetLoc=function(id,v,quiet){const m=S.msgs.find(x=>x.id==id);
  if(m&&m.a!==undefined&&!m.blocked&&MEETL[v]&&ART[m.a]){const a=ART[m.a],e=thr(m),day=e&&e.st==0?e.day:(SCH.id===m.id?SCH.day:null);let why=null;
   const pb=locBan(m.a,v);if(pb)why=a[0]+' '+pb.why+'. '+CLOC[v].replace(/^the /,'The ').replace(/^outside your place$/,'Your place')+' is off the table for good and no fee changes that. Pick another place.';
   else if(day!=null){const w=locWd(m.a,v);if(w&&!w.d.includes(wdOf(day)))why=a[0]+' only goes to '+CLOC[v]+' on '+wdList(w.d,'and')+', and Day '+day+' is a '+wdName(day)+'. Pick another place or day.'}
   if(why){if(!quiet)m.log.push({f:'me',t:'can we meet '+MEETL[v].p+' instead?',d:S.day});schSay(m,why,false);snd('err');if(mode=='pc'&&typeof pcR=='function')pcR();return}
   if(e&&e.st==0&&v!=e.loc){const r=schCheck(m,e.day,e.s,v,e.id);if(!r.ok){if(!quiet)m.log.push({f:'me',t:'can we meet '+MEETL[v].p+' instead?',d:S.day});schSay(m,r.why,false);return}e.loc=v}}
  sm0(id,v,quiet)}}
{const st=document.createElement('style');st.textContent=`.sch{padding:8px 12px;background:#16201b;border-top:1px solid #1a2520;color:#e8f4ee}.schh{display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap;align-items:baseline}.schh span{font-size:13px;opacity:.9}.schr{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}.schr label{display:flex;gap:5px;align-items:center;font-size:13px}.schr select{background:#fff;color:#2a1a2e;border:2px solid #e7a5c9;border-radius:999px;padding:4px 10px;font:inherit;font-size:13px;max-width:210px}
.schs{font-size:13px;padding:4px 8px;border-radius:4px;margin:4px 0}.schs.ok{background:#14452c;color:#c7ffe0}.schs.no{background:#4a2a12;color:#ffe2c4}.schc{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:4px 0}.chp{border-radius:999px!important;font-size:12px!important;padding:3px 10px!important}.schb{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px}`;document.head.appendChild(st)}
