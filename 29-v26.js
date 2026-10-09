/* ---------- v26 ---------- */
/* energy costs: a collab session costs half of a solo session */
const REC_E=15,COLLAB_E=REC_E/2;

/* ===== 1. artist collabs ===== */
/* the player pays the artist's fee to book a collab; the fee is shown on a confirm button before it is taken */
RB.confirm=['sweet. my fee is ${pay}. hit confirm and I will see you {loc}.','deal, once the ${pay} fee is sorted we are on. confirm when you are ready.','love it. ${pay} and we are booked. confirm and I will meet you {loc}.'];
function refundM(m){if(m&&m.paid){S.money=+(S.money+m.paid).toFixed(2);say('Refunded '+$$(m.paid)+' collab fee.');m.paid=0}}
function payCollab(id){const m=S.msgs.find(x=>x.id==id);if(!m||m.state!=0||m.stage!=2||!m.ready)return;const a=ART[m.a];if(S.money<m.pay){snd('err');return say('Not enough money for the '+$$(m.pay)+' fee.')}
 S.money=+(S.money-m.pay).toFixed(2);m.paid=m.pay;m.state=1;m.ready=0;m.log.push({f:'a',t:deco(a,fill(pick(RB.deal),ctxOf(m))),d:S.day});syncArt();updateVersion();snd('cash');say('Paid '+$$(m.pay)+'. Go meet '+a[0]+' (gold beacon).');pcR()}
function unready(id){const m=S.msgs.find(x=>x.id==id);if(m)m.ready=0;pcR()}
{const rp=reply;reply=function(m,t){rp(m,t);const n=NZ(t);if(m.state==0&&IR.some(r=>(r[0]=='no'||r[0]=='cancel')&&r[1].test(n))&&!IR.some(r=>r[0]=='yes'&&r[1].test(n)))m.ready=0;
 if(m.want&&!m.asked&&m.stage==0&&m.state==0){m.asked=1;m.stage=1;m.log.push({f:'a',t:deco(ART[m.a],fill(pick(RB.ask),ctxOf(m))),d:S.day})}}}
/* contacts: red dot = genuinely wants to collab, blue = just chatting */
const wantA=i=>hs(ART[i][0])%3!=0,wantC=m=>m.a!==undefined&&m.state!=2&&m.state!=3&&!!(m.want||m.stage>=1||m.state==1);
const pdot=(src,red)=>`<span class=pfw><img src="${src}"><i class="cdot ${red?'r':'b'}" title="${red?'Wants to collab':'Just chatting'}"></i></span>`;
{const sc0=startChat;startChat=function(i){sc0(i);const m=S.msgs[S.msgs.length-1];if(m&&m.a===i&&wantA(i)){m.want=1;pcR()}}}
const NL2=()=>ART.map((a,i)=>S.listeners>=a[2]&&!S.msgs.some(m=>m.a===i)?`<div class=cr onclick="startChat(${i})">${pdot(pf2(a[4]),wantA(i))}<div class=t><b>${esc(a[0])}</b><small>${esc(a[1])} · ${wantA(i)?'open to a collab':'start a chat'}</small></div></div>`:'').join('')||'<div class=cr><small>Nobody new is reachable yet. Grow your listeners.</small></div>';
PA.msg=()=>{const L=S.msgs,cur=L.find(m=>m.id==S.chat)||L[L.length-1];S.chat=cur.id;cur.unread=0;const art=cur.a!==undefined,
 bar=art&&cur.state==0&&cur.stage==2&&cur.ready?`<div class=cfm><span>Collab fee <b>${$$(cur.pay)}</b> · you have ${$$(S.money)}</span><button class=go ${S.money<cur.pay?'disabled':''} onclick="payCollab(${cur.id})">Confirm &amp; pay ${$$(cur.pay)}</button><button onclick="unready(${cur.id})">Not now</button></div>`:'';
 return`<div class=chat><div class=cl><h2>Chats <button onclick="ncv=!ncv;pcR()" style="float:right;font-size:12px">+ New</button></h2><div class=crs>${ncv?NL2():''}${L.slice().reverse().map(m=>`<div class="cr ${m.id==cur.id?'on':''}" onclick="openChat(${m.id})">${m.a===undefined?`<img src="${cpic(m)}">`:pdot(cpic(m),wantC(m))}<div class=t><b>${esc(cname(m))}</b><small>${esc(clast(m))}</small></div>${m.unread?'<span class=ub>new</span>':''}</div>`).join('')}</div></div><div class=cv><div class=cvh>${art?pdot(cpic(cur),wantC(cur)):`<img src="${cpic(cur)}">`}<div><b>${esc(cname(cur))}</b><br><small style="color:#8aa094">${!art?'Official':esc(ART[cur.a][1])+' · '+(ART[cur.a][8]?'fictional in-game stand-in':'fictional artist')}${cur.state==1?' · collab booked, fee paid':cur.state==2?' · declined':cur.state==3?' · collab done':''}</small></div></div>
 <div class=cvb id=cv>${!art?`<div class="bb a">${esc(cur.body)}</div>`:cur.log.map(x=>`<div class="bb ${x.f}">${esc(x.t)}<small>Day ${x.d||''}</small></div>`).join('')}${TY==cur.id?'<div class="bb a"><i>typing…</i></div>':''}</div>
 ${bar}${!art?`<div class=cin><small style="padding:8px;color:#8aa094">Official account. No replies.</small></div>`:`<div class=cin><input id=cin placeholder="Type a message…" maxlength=140 onkeydown="if(event.key=='Enter')sendMsg()"><button class=go onclick="sendMsg()">Send</button></div>`}
 <div style="padding:4px 12px;font-size:11px;color:#8aa094;background:#16201b">Fictional in-game conversations. Real artist names are used for fictional stand-ins; no endorsement, no real music. You pay the artist's fee to book a collab.</div></div></div>`};
/* first in-game day: a few artists slide into your DMs, once per new game (saved, so a reload does not repeat it) */
const FDM={w:['saw you just set up your page. new artists are my favourite thing to find. want to make something together?','heard a rumour there is a new name in town. that you? we should cook something up.','just found your profile, the vibe is right. I have a beat with your name on it.'],f:['welcome to the scene! no pressure, just saying hi.','hey, new neighbour in the music world. good luck with the first track.','saw your page pop up. hope the first week treats you well.']};
function firstDMs(){S.dm1=1;const pool=ART.map((a,i)=>i).filter(i=>!ART[i][8]&&ART[i][2]<=60&&!S.msgs.some(m=>m.a===i)).sort(()=>Math.random()-.5),k=Math.min(pool.length,RI(2,3));
 pool.slice(0,k).forEach((i,j)=>{const a=ART[i],w=j<2,m={id:S.nid++,a:i,state:0,stage:w?1:0,ex:0,neg:0,pay:a[3],unread:1,log:[],rel:0,want:w?1:0,asked:w?1:0};m.log.push({f:'a',t:deco(a,pick(FDM[w?'w':'f'])),d:S.day});if(w)m.log.push({f:'a',t:deco(a,fill(pick(RB.ask),ctxOf(m))),d:S.day});S.msgs.push(m)});
 if(k){snd('ping');say(k+' artists messaged you. Check Messages on your computer.')}updateVersion()}
/* collab songs always carry exactly one "(feat. NAME)" */
const featT=(t,ft)=>String(t||'').replace(/\s*[([](feat|ft)\.?\s[^)\]]*[)\]]/gi,'').trim().replace(/^$/,'Untitled')+' (feat. '+ft+')';
{const st0=saveT;saveT=function(id){const d=S.drafts.find(x=>x.id==id),i=$('tin');if(d&&d.ft&&i&&i.value.trim())i.value=featT(i.value,d.ft);st0(id)}
 const up0=upl;upl=function(id){const d=S.drafts.find(x=>x.id==id);if(d&&d.ft&&d.title.trim())d.title=featT(d.title,d.ft);up0(id)}}
/* in-person meeting: three replies per exchange, 1-3 exchanges, each reply moves the artist's opinion */
const PERS={chill:'laid-back',hype:'high energy',shy:'shy',formal:'professional',goofy:'goofy'};
const TONE={hype:['Wassup! Let\'s cook something crazy today.','Yooo, finally! I\'ve been hyped for this all week.','Let\'s gooo, this track is gonna slap.','What\'s good! Turn it up, let\'s make noise.'],
 chill:['Hey, good to finally meet. No rush, let\'s just vibe.','All good, take your time. We\'ll find the groove.','Easy pace today. Let\'s see where the sound goes.','Nice to meet you properly. Coffee first?'],
 pro:['Thanks for coming. I\'ve got a plan for the hook, want to hear it?','I mapped out the structure: verse, hook, your verse, bridge.','Let\'s get levels checked and do a clean first take.','I prepped a reference track so we don\'t waste your time.'],
 joke:['Fair warning, my mic is held together with tape and hope.','If this flops, we blame the pigeon outside.','I practised my best studio face in the mirror. Rate it.','Snacks are on me. That\'s my whole budget gone.'],
 cocky:['Honestly, you\'re lucky to be on my track.','Just follow my lead and it\'ll be a hit.','My fans are gonna carry this one anyway.','Try to keep up, yeah?']};
const PREF={chill:{hype:0,chill:1,pro:0,joke:1,cocky:-1},hype:{hype:1,chill:-1,pro:0,joke:1,cocky:0},shy:{hype:-1,chill:1,pro:1,joke:0,cocky:-1},formal:{hype:-1,chill:0,pro:1,joke:-1,cocky:-1},goofy:{hype:1,chill:0,pro:-1,joke:1,cocky:-1}};
const OPEN={chill:['hey, you made it. no stress, the studio is all ours.','yo, good to see you in person. what is the vibe today?'],hype:['YOOO there they are! you ready to cook?!','LETS GO, the session is finally happening!'],shy:['oh, hi... um, thanks for booking this.','hey... sorry, I get a bit nervous meeting people. hi.'],formal:['Good to meet you in person. Shall we discuss the session?','Thank you for booking. I am ready when you are.'],goofy:['ahoy, collab buddy! I brought exactly zero snacks.','greetings, fellow human. the beat awaits.']};
const RCT={pos:{chill:['ha, I like that energy.','yeah, that feels right.'],hype:['THAT is what I am talking about!','YES, love it!!'],shy:['oh, that is... actually really nice.','okay, I feel a bit better now.'],formal:['Excellent, that is very sensible.','I appreciate that approach.'],goofy:['ha! you are my kind of weird.','okay that got a laugh out of me.']},
 neu:{chill:['mm, okay, cool.','fair enough.'],hype:['okay okay, sure.','alright, I hear you.'],shy:['um, okay.','sure, I guess.'],formal:['Understood.','Very well.'],goofy:['huh. okay then.','noted, captain.']},
 neg:{chill:['eh, bit much, but alright.','hm, that is not really my vibe.'],hype:['bro, where is the energy?','come on, that is kind of flat.'],shy:['oh... okay.','that is a bit intense for me.'],formal:['I would prefer we keep it focused.','That is not quite how I work.'],goofy:['wow, tough crowd.','okay, mister serious.']}};
const MID={chill:['so what kind of sound are you hearing?','how do you usually start a track?'],hype:['what is the big idea for the drop?!','how loud are we going?'],shy:['do you, um, want me on the hook or a verse?','should I warm up first?'],formal:['How would you like to split the verses?','Do you have a reference in mind?'],goofy:['should the song be about soup? asking seriously.','what if the chorus was just clapping?']};
const READY={chill:['alright, let us lay it down.'],hype:['okay, mics on, LETS RECORD!'],shy:['okay... I think I am ready.'],formal:['Shall we begin recording?'],goofy:['to the microphone, onward!']};
const opLbl=o=>o>=2?'loves you':o==1?'warming up':o==0?'neutral':o==-1?'unsure':'annoyed';
let MEET=null;
function mtOpts(){return Object.keys(TONE).sort(()=>Math.random()-.5).slice(0,3).map(t=>[t,pick(TONE[t])])}
function collab(o){const m=S.msgs.find(x=>x.a===o.i);if(!m)return;const a=ART[o.i];let op=0;if((m.rel||0)>=5)op++;if(m.neg)op--;MEET={o,m,a,n:RI(1,3),k:0,op,line:pick(OPEN[a[5]]),opts:mtOpts()};mode='menu';meetR()}
function meetR(){const M=MEET,a=M.a,done=M.k>=M.n;$('ui').innerHTML=`<div class="box modal mtg"><div class=mth><img src="${pf2(a[4])}"><div><b>${esc(a[0])}</b><br><small class=m>${esc(a[1])} · ${PERS[a[5]]} · opinion: <b>${opLbl(M.op)}</b></small></div></div><p class=mtl>"${esc(M.line)}"</p>${done?`<p class=m>Collab recording costs ${COLLAB_E} energy (half a solo session). You have ${Math.round(S.energy)}.</p><div class=row2><button class=go onclick="meetRec()">Start recording</button><button onclick="closeUI()">Later</button></div>`:M.opts.map((t,i)=>`<button class=mto onclick="meetPick(${i})">${esc(t[1])}</button>`).join('')+`<small class=m>Exchange ${M.k+1} of ${M.n} · pick a reply</small>`}</div>`}
function meetPick(i){const M=MEET;if(!M||M.k>=M.n)return;const t=M.opts[i][0],p=M.a[5];let d=PREF[p][t];
 /* context: bragging lands worse when they are bigger than you; hype lands worse late at night with laid-back or shy artists */
 if(t=='cocky'&&S.listeners<M.a[2])d--;if(t=='hype'&&S.t>=300&&(p=='chill'||p=='shy'))d--;if(t=='pro'&&M.m.neg&&p=='formal')d++;
 d=Math.max(-2,Math.min(2,d));M.op=Math.max(-3,Math.min(3,M.op+d));M.k++;M.line=pick(RCT[d>0?'pos':d<0?'neg':'neu'][p])+' '+pick(M.k<M.n?MID[p]:READY[p]);M.opts=mtOpts();snd(d>0?'ping':d<0?'err':'pop');meetR()}
function meetRec(){const M=MEET;if(!M)return;if(S.energy<COLLAB_E){snd('err');return say('Too tired to record, even a collab. Rest and come back.')}S.energy=Math.max(0,+(S.energy-COLLAB_E).toFixed(1));updateVersion();$('ui').innerHTML='';const o=M.o;mode='cut';cs2={o,t:0,op:M.op};P.x=o.x-1.4;P.z=o.z;P.rot=Math.PI/2;MEET=null;say('Recording with '+o.name+' (fictional)')}
collabDone=function(){const o=cs2.o,op=cs2.op||0,a=ART[o.i],m=S.msgs.find(x=>x.a===o.i);if(o.m.parent)o.m.parent.remove(o.m);if(m){m.state=3;m.doneDay=S.day;m.ready=0;m.paid=0;m.log.push({f:'a',t:deco(a,op>=1?'that session was great, thanks again!':op<=-1?'well, we got a track out of it.':'good session, thanks.'),d:S.day})}ART_M=ART_M.filter(x=>x!==o);
 const q=Math.max(5,Math.round(R(30,40)+S.gear.chair*4+S.gear.mic*8+S.gear.guitar*6+(S.home||0)*3)+Math.min(25,6+Math.round(a[3]/60))+op*4),
 d={id:S.nid++,title:featT(pick(A)+' '+pick(Bn),a[0]),g:a[1],q,ft:a[0],fm:+((1.1+Math.min(.6,a[3]/6000))*(1+op*.12)).toFixed(2),op,role:pick(['Featured verse','Co-writer and hook','Producer and beats','Backing vocals'])};
 S.drafts.push(d);updateVersion();cs2=null;snd('chime');nameModal(d,`<p style="color:var(--g)">Collab with ${esc(a[0])} done. Chemistry: <b>${opLbl(op)}</b>${op>0?' (better quality, more streams)':op<0?' (lower quality, fewer streams)':''}. Fictional in-game event with a stand-in character.</p>`)};
{const st=document.createElement('style');st.textContent='.pfw{position:relative;display:inline-block;flex-shrink:0;line-height:0}.cdot{position:absolute;top:0;right:0;width:11px;height:11px;border-radius:50%;border:2px solid #0d1411;box-sizing:border-box}.cdot.r{background:#ff3b5c}.cdot.b{background:#3b82f6}.cfm{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 12px;background:#16201b;border-top:1px solid #1a2520}.cfm span{flex:1}.mtg{width:min(480px,94vw)}.mth{display:flex;gap:12px;align-items:center}.mth img{width:56px;height:56px;border-radius:50%;image-rendering:pixelated;background:#2a4a38}.mtl{font-size:15px;margin:12px 0}.mto{display:block;width:100%;text-align:left;margin:6px 0}';document.head.appendChild(st)}

/* ===== per-frame hooks ===== */
{const u0=update;update=function(dt){u0(dt);if(mode=='play'&&S.day==1&&!S.dm1&&S.t>4)firstDMs()}}

/* ===== 2. recording, energy, footsteps ===== */
/* energy refills slowly while the clock runs (about 36 per full day), never above 100 */
const clockOn=()=>!PAUSED&&(mode=='play'||mode=='rec'||mode=='drive'||mode=='pc');
function energyTick(dt){if(!clockOn()||S.energy>=100)return;S.eacc=(S.eacc||0)+dt*.06;if(S.eacc>=1){const k=Math.floor(S.eacc);S.eacc-=k;S.energy=Math.min(100,S.energy+k)}}
/* one footstep scheduler: steps follow actual movement, never overlap, and fade in so they do not pop */
const STP={t:.2,last:0,px:0,pz:0};
function stepSnd(run){if(!FX)return;try{ac();const t=AC.currentTime;if(t-STP.last<.18)return;STP.last=t;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;f.type='lowpass';f.frequency.value=360+R(0,160);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(run?.3:.22,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.09);s.connect(f);f.connect(g);g.connect(MG);s.start(t,R(0,.5));s.stop(t+.12)}catch(e){}}
function stepTick(dt,mv){const d=Math.hypot(P.x-STP.px,P.z-STP.pz);STP.px=P.x;STP.pz=P.z;if(!mv||mode!='play'||d<1e-4){STP.t=Math.min(STP.t,.2);return}const sp=d/Math.max(dt,1e-4);STP.t+=dt;if(STP.t>=(sp>5?.27:.4)){STP.t=0;stepSnd(sp>5)}}
{const u1=update;update=function(dt){u1(dt);energyTick(dt)}}
{const st=document.createElement('style');st.textContent='.dsel{background:#0d1411;color:inherit;border:2px solid #000;padding:6px 10px;font:inherit}';document.head.appendChild(st)}

/* ===== 3. streams through the day, paid once on waking ===== */
/* each song gets a plan for the day (same formula as the old overnight roll); streams accrue towards it as the clock runs, twice as fast at night */
const prog=t=>{t=Math.max(0,Math.min(600,t));return t<300?t/900:(300+2*(t-300))/900};
function planOf(s){if(s.pd===S.day)return s.pv;const age=S.day-s.day,mI=.3+.7*(S.interest||0),mL=Math.pow(2.2,fameLv())*(1+Math.min(1,Math.sqrt(S.listeners)/60));
 let v=s.q*.8*R(.75,1.25)*(S.hype[s.g]||1)*(Math.pow(.86,age)+.03)*mL*mI*(1+S.gear.promo*.3+(S.gear.decks||0)*.2+(S.home||0)*.1)*(s.ft?(s.fm||1.4):1)*(age==0?1.5:1);if(s.boost>0){v*=1.5;s.boost--}if(Math.random()<.02&&age<8)v*=R(2,5);
 const cap=s.q*s.q*25*Math.pow(2.2,fameLv())-s.streams;v=Math.max(0,Math.min(Math.round(v||0),cap));s.pd=S.day;s.pv=isFinite(v)?v:0;s.acc=0;s.today=0;s.p0=s.day==S.day?prog(S.t):0;return s.pv}
function addSt(s,k){if(k<=0)return;s.acc+=k;s.streams+=k;s.today=(s.today||0)+k;S.streams+=k}
function streamTick(){if(mode=='sleep'||mode=='load'||mode=='creator')return;S.songs.forEach(s=>{const pv=planOf(s),f=s.p0>=.999?0:Math.max(0,Math.min(1,(prog(S.t)-s.p0)/(1-s.p0)));addSt(s,Math.floor(pv*f)-s.acc)})}
function sleepNow(auto){snd('whoosh');mode='sleep';$('ui').innerHTML='<div class=fade></div>';setTimeout(()=>{
 const before=mentors(),old=S.listeners;S.songs.forEach(s=>addSt(s,planOf(s)-s.acc));
 let tot=0;S.songs.forEach(s=>{if(s.pd===S.day)tot+=s.today||0});tot=isFinite(tot)?tot:0;let e=0;
 if(S.paidDay!==S.day){S.paidDay=S.day;e=+(tot*.05).toFixed(2);S.money=+(S.money+e).toFixed(2);S.earn+=e;S.hist.push({d:S.day,st:tot,e})}
 const rel=S.songs.filter(x=>x.day==S.day).length;S.interest=Math.min(1,(S.interest||0)*.9+rel*.22);
 S.listeners=Math.round(S.hist.slice(-30).reduce((a,h)=>a+(h.st||0),0)/3);if(S.cheat)S.listeners=Math.max(S.listeners,1e9);if(!isFinite(S.money))S.money=0;S.followers+=Math.round(tot*.05);genMsgs();
 S.day++;S.t=0;S.energy=auto?70:100;S.eacc=0;GEN.forEach(g=>S.hype[g]=+R(.8,1.3).toFixed(2));updateVersion();
 const nm=mentors()>before?MEN[mentors()-1][1]:null;
 $('ui').innerHTML=`<div class="box modal" style="background:#0b0f0d"><h2>☀ Day ${S.day}</h2>${auto?'<p class=m>You passed out (energy only 70%).</p>':''}<p>Yesterday's results, paid now:</p><div class=cards><div class=card>Streams<b>+${tot.toLocaleString()}</b></div><div class=card>Earned<b>${$$(e)}</b></div><div class=card>Monthly listeners<b>${old} → ${S.listeners}</b></div><div class=card>Interest<b>${Math.round(S.interest*100)}%</b></div></div><p class=m><small>${rel?rel+' new release(s) boosted interest.':'No new releases: interest fades and old songs keep decaying.'} Streams build up through the day and faster at night.</small></p>${nm?`<p>🌟 New fictional mentor unlocked: <b>${nm}</b> (see Legends)</p>`:''}${!S.songs.length?'<p class=m>Upload a song to start earning!</p>':''}<button class=go onclick="closeUI()">Start the day</button></div>`},950)}
/* the clock keeps running while the computer is open; the taskbar clock follows it */
{const u2=update;update=function(dt){if(mode=='pc'&&!PAUSED){S.t+=dt;if(S.t>=600){sleepNow(1);return}const tb=document.querySelector('#pc .tb>span:last-child'),tx='Day '+S.day+' · '+clk();if(tb&&tb.textContent!=tx)tb.textContent=tx}u2(dt);streamTick()}}

/* ===== 5. messages dot, upload all, top songs ===== */
/* red dot on the Messages desktop icon while any message is unread; kept in sync every frame */
function msgDot(){const el=[...document.querySelectorAll('#pc .ico')].find(e=>(e.getAttribute('onpointerdown')||'').includes("'msg'"));if(!el)return;let d=el.querySelector('.udot');if(!d){d=document.createElement('span');d.className='udot';el.appendChild(d)}const on=unr()>0;if(d.style.display!=(on?'block':'none'))d.style.display=on?'block':'none'}
{const p0=pcR;pcR=function(){p0();msgDot()}}
/* upload every draft that has a title in one go; each draft is removed as it uploads, so nothing uploads twice */
let UPA=0;
function uplAll(){if(UPA)return;UPA=1;const ids=S.drafts.filter(d=>d.title.trim()).map(d=>d.id),fx=FX,sy=say;let n=0;FX=0;say=()=>{};try{ids.forEach(id=>{if(S.drafts.some(d=>d.id==id)){upl(id);n++}})}finally{FX=fx;say=sy;UPA=0}
 if(n){chime();say('Uploaded '+n+' song'+(n>1?'s':'')+(S.drafts.length?'. '+S.drafts.length+' draft(s) still need a title.':'.'))}else say('Give your drafts a title first.');pg=n?'home':'upload';pcR()}
PG.upload=()=>{const ok=S.drafts.filter(d=>d.title.trim()).length;return`<h1>Upload</h1>${S.drafts.length?`<div class=ng><span class=m style="flex:1">${S.drafts.length} draft${S.drafts.length>1?'s':''} waiting</span><button class=go ${ok?'':'disabled'} onclick="uplAll()">Upload all (${ok})</button></div>`+S.drafts.map(d=>`<div class=ng><input value="${esc(d.title)}" maxlength=48 oninput="S.drafts.find(x=>x.id==${d.id}).title=this.value"><span class=m>${esc(d.g)} · Q${d.q}${d.ft?' · feat. '+esc(d.ft):''}</span><button class=go onclick="upl(${d.id})">Upload</button></div>`).join(''):'<p class=m>No recorded songs. Use the microphone in your studio.</p>'}<p class=m><small>Edit the title any time before uploading. Collab songs keep their (feat. NAME) tag.</small></p>`};
/* artist page: top 5 songs by popularity (streams), with a Show all toggle */
let SALL=0;
PG.home=()=>{const L=S.songs.slice().sort((a,b)=>b.streams-a.streams||b.id-a.id),sh=SALL?L:L.slice(0,5);return`<div class=ban style="display:flex;gap:16px;align-items:center"><img class=pf src="${pfp()}"><div><small class=m>ARTIST</small><h1>${esc(S.artist)}</h1><p>${S.listeners.toLocaleString()} monthly listeners · ${S.followers.toLocaleString()} followers · Fame ${fameStr()}</p></div></div><h3>${SALL?'All songs':'Top songs'} <small class=m>by popularity</small></h3>${L.length?sh.map((s,i)=>row(i+1,s)).join('')+(L.length>5?`<div style="margin-top:8px"><button onclick="SALL=!SALL;pcR()">${SALL?'Show top 5':'Show all ('+L.length+')'}</button></div>`:''):'<p class=m>No releases yet. Record a song in the studio, then upload it from the Upload tab.</p>'}`+albumsHTML()};
let HRF=0;{const u3=update;update=function(dt){u3(dt);if(mode=='pc'){msgDot();if((HRF+=dt)>2){HRF=0;const ae=document.activeElement;if(app==1&&pg=='home'&&S.artist&&!dg&&!(ae&&/INPUT|TEXTAREA/.test(ae.tagName)))pcR()}}}}
{const st=document.createElement('style');st.textContent='.udot{position:absolute;top:-3px;left:61px;width:14px;height:14px;border-radius:50%;background:#ff3b5c;border:2px solid #000;box-sizing:border-box;pointer-events:none}';document.head.appendChild(st)}

/* ===== 7. house and garage ===== */
/* patch the gap in the east (right-hand) low wall at z 9 to 11, which showed while inside the house */
B(WORLD,.25,.4,2,'#8a8f96',16,.2,10);
/* the outside front door gets panels, a frame and a handle */
[5.5,6.5].forEach(x=>{B(HX,.7,.9,.03,'#6b4a2e',x,1.7,12.24);B(HX,.7,.7,.03,'#6b4a2e',x,.6,12.24)});B(HX,.1,.1,.08,'#e6b422',6.75,1.15,12.27);B(HX,2.3,.12,.22,'#3a2412',6,2.45,12.2);
/* no garage at all until it is bought: no building, pad, sign, collision, door prompt or map marker */
let GREF=null;
function garageSync(){if(!GREF){const c=cols.find(c=>c[0]==17.5&&c[1]==1.5&&c[2]==27.5&&c[3]==7),i=INT.find(o=>o.l=='Enter garage'),p=POIS.find(p=>p[2]=='Garage');if(!c||!i)return;GREF={c,i,p}}
 const own=!!S.garage,tg=(arr,o)=>{if(!o)return;const k=arr.indexOf(o);if(own&&k<0)arr.push(o);else if(!own&&k>=0)arr.splice(k,1)};tg(cols,GREF.c);tg(INT,GREF.i);tg(POIS,GREF.p);
 GARM.forEach(m=>m.visible=own&&!HIN);if(GPAD)GPAD.visible=own;if(GLBL)GLBL.visible=own&&!HIN}
{const wt8=worldTick;worldTick=function(dt){wt8(dt);garageSync()}}

/* ===== 8. city: wider roads, junction traffic, more people, solid NPCs and cars ===== */
/* roads widen to the south (horizontal) and east (vertical) so the house side of every street stays where it was:
   asphalt 5 -> 6.4 wide, far-side pavement 1.2 -> 1.8 wide. Road centre lines move to +0.7. */
function roadH(zr,x0,x1){const L=x1-x0,cx=(x0+x1)/2;SB(L,.04,6.4,'#3a3d44',cx,-.03,zr+.7);SB(L,.06,1.2,'#b9b5ab',cx,-.02,zr-3.1);SB(L,.06,1.8,'#b9b5ab',cx,-.02,zr+4.8);for(let x=x0;x<x1;x+=5)SB(2,.02,.16,'#e8d9a0',x,0,zr+.7);ROADS.push([x0,zr-2.5,x1,zr+3.9]);RH.push([zr,x0,x1])}
function roadV(xr,z0,z1){const L=z1-z0,cz=(z0+z1)/2;SB(6.4,.04,L,'#3a3d44',xr+.7,-.03,cz);SB(1.2,.06,L,'#b9b5ab',xr-3.1,-.02,cz);SB(1.8,.06,L,'#b9b5ab',xr+4.8,-.02,cz);for(let z=z0;z<z1;z+=5)SB(.16,.02,2,'#e8d9a0',xr+.7,0,z);ROADS.push([xr-2.5,z0,xr+3.9,z1]);RVV.push([xr,z0,z1])}
const onX=(h,v)=>v[0]>=h[1]-.01&&v[0]<=h[2]+.01&&h[0]>=v[1]-.01&&h[0]<=v[2]+.01;
function finishRoads(){for(let x=-120;x<485;x+=24)if(x<-10||x>70)lamp(x,13.1);const C='#3a3d44';RH.forEach(h=>RVV.forEach(v=>{if(!onX(h,v))return;const X=v[0],Z=h[0];SB(6.4,.04,6.4,C,X+.7,.015,Z+.7);if(v[1]<Z-.1)SB(6.4,.04,1.3,C,X+.7,.015,Z-3.1);if(v[2]>Z+.1)SB(6.4,.04,1.9,C,X+.7,.015,Z+4.8);if(h[1]<X-.1)SB(1.3,.04,6.4,C,X-3.1,.015,Z+.7);if(h[2]>X+.1)SB(1.9,.04,6.4,C,X+4.8,.015,Z+.7)}))}
/* city towers step back from the wider pavements; tower entrances keep their original ids */
function tower(x0,z0,x1,z1){const ox=x0,oz=z0;if(x0>=490&&x0%40==14)x0+=2;if(z0==-37)z0=-34;else if(z0==64)z0=66;
 const w=x1-x0-R(0,5),d=z1-z0-R(0,5),cx=(x0+x1)/2,cz=(z0+z1)/2,h=R(8,36),t=winTex().clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(w/3)),Math.max(1,Math.round(h/3)));const mat=new THREE.MeshLambertMaterial({color:pick(['#8fa6b8','#a9b7c4','#7b8da0','#b8a99a','#9db4a0','#c4a08a']),map:t,transparent:true}),m=new THREE.Mesh(geo(w,h,d),mat);m.position.set(cx,h/2,cz);WORLD.add(m);SB(2,1.8,.1,'#2a1f1a',cx,.9,cz+d/2+.05);col(cx-w/2,cz-d/2,cx+w/2,cz+d/2);BLD.push([cx-w/2,cz-d/2,cx+w/2,cz+d/2]);CT.push({mat,x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2,h});if(typeof twHook=='function')twHook(ox,oz,cx,cz+d/2,w,h)}
/* traffic: a road graph (junctions, T-junctions and dead ends); cars keep to their lane, turn at junctions and U-turn only at dead ends */
const TG2={N:[],E:[]};
function trafGraph(){const N=new Map(),node=(x,z)=>{const k=x.toFixed(1)+','+z.toFixed(1);if(!N.has(k))N.set(k,{x,z,e:[]});return N.get(k)},link=(a,b)=>{if(a===b)return;const L=Math.hypot(b.x-a.x,b.z-a.z);a.e.push({to:b,ux:(b.x-a.x)/L,uz:(b.z-a.z)/L,len:L});b.e.push({to:a,ux:(a.x-b.x)/L,uz:(a.z-b.z)/L,len:L})};
 RH.forEach(h=>{const J=RVV.filter(v=>onX(h,v)).map(v=>v[0]),P=[...J.map(x=>x+.7)];[h[1],h[2]].forEach(x=>{if(!J.some(j=>Math.abs(j-x)<.01))P.push(x)});const u=[...new Set(P.map(x=>+x.toFixed(1)))].sort((a,b)=>a-b);for(let i=0;i<u.length-1;i++)link(node(u[i],h[0]+.7),node(u[i+1],h[0]+.7))});
 RVV.forEach(v=>{const J=RH.filter(h=>onX(h,v)).map(h=>h[0]),P=[...J.map(z=>z+.7)];[v[1],v[2]].forEach(z=>{if(!J.some(j=>Math.abs(j-z)<.01))P.push(z)});const u=[...new Set(P.map(z=>+z.toFixed(1)))].sort((a,b)=>a-b);for(let i=0;i<u.length-1;i++)link(node(v[0]+.7,u[i]),node(v[0]+.7,u[i+1]))});
 TG2.N=[...N.values()];TG2.E=[];TG2.N.forEach(n=>n.e.forEach(e=>TG2.E.push([n,e])))}
const LANE=1.6,CCOL=['#e6b422','#3b82f6','#2f8f5a','#c0392b','#e8e8ec','#ff8a30','#8e44ad'];
function carPos(c){c.x=c.a.x+c.e.ux*c.t+c.e.uz*LANE;c.z=c.a.z+c.e.uz*c.t-c.e.ux*LANE}
function buildTraffic(){morePeople();trafGraph();const tot=TG2.E.reduce((s,q)=>s+q[1].len,0)/2,n=Math.min(120,Math.round(tot/15));let g=0;
 while(TRAF.length<n&&g++<n*20){const[a,e]=pick(TG2.E),t=R(0,e.len);if(TRAF.some(o=>o.a===a&&o.e===e&&Math.abs(o.t-t)<9))continue;const m=mkS(carb(RI(0,4),pick(CCOL)));m.scale.setScalar(1.5);m.visible=false;scene.add(m);const c={m,a,e,t,s:0,cr:R(8,13),w:0,dir:0,sp:0,v:0,lo:-1e9,hi:1e9,h:Math.atan2(e.ux,e.uz),f:1};carPos(c);TRAF.push(c)}}
function cityTraffic(){}
function trafTick(dt){const pl=mode=='play'||mode=='drive';TRAF.forEach(c=>{if(!c.e)return;let tg=c.cr;
  TRAF.forEach(o=>{if(o===c||o.a!==c.a||o.e!==c.e)return;const g=o.t-c.t;if(g>0&&g<8)tg=Math.min(tg,g<4.6?0:o.s)});
  if(pl&&!IN){const dx=P.x-c.x,dz=P.z-c.z,al=dx*c.e.ux+dz*c.e.uz,pp=dx*c.e.uz-dz*c.e.ux;if(al>0&&al<9&&Math.abs(pp)<1.5)tg=al<5?0:Math.min(tg,2.5)}
  if(c.e.len-c.t<4&&c.w<5){const to=c.e.to;if(TRAF.some(o=>o!==c&&o.e&&o.s>.5&&Math.hypot(o.x-to.x,o.z-to.z)<3.2&&!(o.a===c.a&&o.e===c.e)))tg=0}
  c.w=tg<.1&&c.s<.5?c.w+dt:0;c.s+=(tg-c.s)*Math.min(1,dt*(tg<c.s?4:1.2));c.t+=c.s*dt;
  while(c.t>=c.e.len){c.t-=c.e.len;const b=c.e.to,ops=b.e.filter(e=>e.to!==c.a);c.a=b;c.e=ops.length?pick(ops):b.e[0];c.w=0}
  carPos(c);const th=Math.atan2(c.e.ux,c.e.uz);let d=th-c.h;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;c.h+=d*Math.min(1,dt*6);
  const m=c.m;if(c.f||!m.visible){c.rx=c.x;c.rz=c.z;c.h=th;c.f=0}else{c.rx+=(c.x-c.rx)*Math.min(1,dt*8);c.rz+=(c.z-c.rz)*Math.min(1,dt*8)}m.position.set(c.rx,0,c.rz);m.rotation.y=c.h;m.visible=Math.abs(c.x-P.x)<50&&Math.abs(c.z-P.z)<50&&!HIN&&!IN})}
/* the player's car may always drive away from a traffic car, so it can never get boxed in for good */
function tcB(x0,z0,x,z){return TRAF.some(t=>t.m.visible&&Math.hypot(t.x-x,t.z-z)<2.8&&Math.hypot(t.x-x,t.z-z)<Math.hypot(t.x-x0,t.z-z0))}
/* more people on every pavement: horizontal walkers reuse the NPC system, vertical-street walkers get their own list */
const VPED=[];
function morePeople(){const cfg=()=>({skin:RI(0,5),eyes:RI(0,4),mouth:RI(0,3),hair:RI(0,11),hc:RI(0,11),top:RI(0,4),tc:RI(0,9),pc:RI(0,7),body:Math.random()});
 RH.forEach(h=>[h[0]-3.1,h[0]+4.8].forEach(z=>{const n=Math.round((h[2]-h[1])/26);for(let i=0;i<n;i++)addNPC(z,R(h[1]+2,h[2]-2),h[1]+1,h[2]-1,R(.8,1.7),Math.random()<.1)}));
 RVV.forEach(v=>[v[0]-3.1,v[0]+4.8].forEach(x=>{const n=Math.round((v[2]-v[1])/26);for(let i=0;i<n;i++){const o=buildChar(cfg());o.g.visible=false;scene.add(o.g);VPED.push({m:o.g,legs:o.legs,arms:o.arms,x,x0:x,z:R(v[1]+2,v[2]-2),mn:v[1]+1,mx:v[2]-1,dir:Math.random()<.5?1:-1,sp:R(.8,1.7),t:R(0,6)})}}))}
function pedTick(dt){VPED.forEach(n=>{const dd=Math.hypot(P.x-n.x,P.z-n.z);if(dd>60||HIN||IN){n.m.visible=false;return}n.m.visible=true;n.t+=dt*8;n.z+=n.dir*n.sp*dt;if(n.z>n.mx)n.dir=-1;if(n.z<n.mn)n.dir=1;n.x+=(n.x0-n.x)*Math.min(1,dt*2);n.m.rotation.y=n.dir>0?0:Math.PI;n.m.position.set(n.x,0,n.z);const s=Math.sin(n.t)*.6;n.legs[0].rotation.x=s;n.legs[1].rotation.x=-s;n.arms[0].rotation.x=-s;n.arms[1].rotation.x=s})}
/* solid people and cars: a move is refused only if it goes further into someone, so you can always step away */
function dynB(x0,z0,x,z){if(IN||HIN)return false;const R0=.62,ppl=o=>{const a=Math.hypot(o.x-x,o.z-z);return a<R0&&a<Math.hypot(o.x-x0,o.z-z0)};
 if(NPC.some(n=>n.m.visible&&ppl(n))||VPED.some(n=>n.m.visible&&ppl(n))||ART_M.some(o=>ppl(o)))return true;
 return TRAF.some(c=>{if(!c.e||!c.m.visible||Math.abs(c.x-x)>4||Math.abs(c.z-z)>4)return false;const dep=(px,pz)=>{const dx=px-c.x,dz=pz-c.z,al=Math.abs(dx*c.e.ux+dz*c.e.uz),pp=Math.abs(dx*c.e.uz-dz*c.e.ux);return Math.min(2.2-al,1.15-pp)};const n=dep(x,z);return n>0&&n>dep(x0,z0)})}
/* people step around you instead of walking through you (also around your car) */
function pushPeople(){if(HIN||IN)return;const r=mode=='drive'?1.7:.6;[NPC,VPED].forEach(L=>L.forEach(n=>{if(!n.m.visible)return;const dx=n.x-P.x,dz=n.z-P.z,d=Math.hypot(dx,dz);if(d<r){const k=d>1e-3?r/d:0;n.x=d>1e-3?P.x+dx*k:P.x+r;n.z=d>1e-3?P.z+dz*k:n.z;n.m.position.set(n.x,n.m.position.y,n.z)}}))}
{const wt9=worldTick;worldTick=function(dt){wt9(dt);trafTick(dt);pedTick(dt);pushPeople()}}
{const st0=stepTick;stepTick=function(dt,mv){if(!mv)P.sv=3.3;st0(dt,mv)}}
