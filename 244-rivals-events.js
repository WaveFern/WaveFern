/* ===== v55.9.0: RIVALS, ROLLING EVENTS and VIRAL POSTS =====
   Loads after 241-brand-posts / 212-endgame. Everything is driven from wakeUp (the morning), so a paused game runs none of it
   (the only timer is a 2 s setInterval, which 00-pause-core freezes while paused). ?norivals skips the whole file.
   State: S.rvl (lazy, old saves start empty): {rv:[rivals], rank, ev:pending event, next, fx:[boosts], log:[news], vr:{n,last,max}, due}.

   1 RIVALS  Seven AI artists on one chart with you. Each has a monthly-listener count that chases where you were about 20 days ago times a personal factor
     (0.3x to 2x, re-rolled every 20-40 days), with a floor that rises over time so they climb even before you have listeners,
     random wobble and occasional "new single" spikes. Your chart rank = 1 + rivals above you.
     Beating a rival (first time in 10 days) pays cash + followers; the top rival pays most. Being passed costs a few followers.
     Brand deals: new offers pay +25% at #1, +10% at #2-3, nothing at #4-5, -10% at #7-8 (the message says so). From #6 down, a rival can
     steal an open brand offer (20%/day). Taking #1 also tempts a brand (a free offer if you have none open).
   2 EVENTS  A new event every 3-6 days (never the same twice in a row): award night, scandal (pay PR / ignore / lean in), bidding war
     (cash now or hold out), rival diss track (reply / laugh it off), playlist feature, festival season, algorithm change.
     Choice events have no screen: they take the safe default at once (an old save's pending event is settled on the next morning). Stream boosts are daily multipliers (planOf).
   3 VIRAL   Going viral on Instagrime. Rolled once per post, the morning after (any posting path). Chance per post:
       base by day  <100: 0.02%   100-250: 0.08% rising to 0.20%   250-400: 0.20% rising to 0.60%   400+: 1.0%   (see VB)
       x fame factor 0.3..1 (log of monthly listeners, full at 100M), x 0.5 for each earlier viral post, 45 day cooldown, max 4 a career.
     Expected: ~1% of daily posters have one before day 100, ~15% by day 250, ~50% by day 400; most careers never see a second.
     A viral post: likes x40-120, followers + instagram followers, a 7 day stream boost that fades, possible brand offer.
     tools/viral-sim.js runs the real odds over thousands of careers. */
(function(){
 if(/[?&]norivals/.test(location.search))return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('rivals '+t,e)}}};
 const live=()=>safe(()=>S&&S.artist&&!(typeof TRL!='undefined'&&(TRL.on||TRL.run)),'live');
 const fm=n=>n>=1e9?+(n/1e9).toFixed(2)+'B':n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(n>=1e5?0:1)+'K':Math.round(n).toLocaleString();
 const card=(k,t,s)=>safe(()=>glCard(k,t,s),'card');
 const RND=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(RND(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
 const NAMES=[['Luna Vox',.3],['DJ Static',.5],['Kid Mirage',.75],['Velvet Ash',1],['Marlo Reyes',1.3],['The Pale Hours',1.7],['Atlas Kane',2]];
 /* viral odds: [day it applies from, chance per post at full fame]; linear blend between rows */
 const VB=[[0,.0002],[100,.0008],[250,.002],[400,.006],[600,.01]];
 const VCOOL=45,VMAX=4;
 const base=d=>{if(d<100)return VB[0][1];for(let i=1;i<VB.length;i++)if(d<VB[i][0]){const a=VB[i-1],b=VB[i];return a[1]+(b[1]-a[1])*(d-a[0])/(b[0]-a[0])}return VB[VB.length-1][1]};
 const fameF=L=>Math.max(.3,Math.min(1,.3+.7*Math.log10((+L||0)+1)/8));
 /* day: game day, L: monthly listeners, n: viral posts so far, sinceLast: days since the last one */
 function viralP(day,L,n,sinceLast){if(n>=VMAX)return 0;if(n>0&&sinceLast<VCOOL)return 0;return base(day)*fameF(L)*Math.pow(.5,n||0)}

 const rs=()=>{if(!S.rvl||typeof S.rvl!='object')S.rvl={};const r=S.rvl;if(!Array.isArray(r.rv))r.rv=[];if(!Array.isArray(r.fx))r.fx=[];if(!Array.isArray(r.log))r.log=[];
  if(!r.vr||typeof r.vr!='object')r.vr={n:0,last:-999,max:0};if(r.next==null)r.next=0;if(r.rolled==null)r.rolled=0;return r};
 const L0=()=>+S.listeners||0;
 const inc=()=>{const h=(S.hist||[]).slice(-7);return Math.max(100,h.reduce((a,x)=>a+(+x.e||0),0)/Math.max(1,h.length))};
 const cash=n=>{S.money=+((+S.money||0)+n).toFixed(2);S.earn=(+S.earn||0)+Math.max(0,n)};
 const fol=n=>{S.igF=Math.max(0,(+S.igF||0)+n)};
 const log=t=>{const r=rs();r.log.unshift({d:S.day,t});if(r.log.length>30)r.log.length=30};
 const $$c=n=>'$'+fm(n);

 /* ---------- rivals ---------- */
 function rivalsInit(){const r=rs();if(r.rv.length)return;const L=L0();r.rv=NAMES.map(([n,f])=>({n,b:f,f:f*RND(.9,1.15),ph:S.day+RI(10,40),hot:0,l:Math.max(3000,L*f)*RND(.9,1.1),ab:null,ot:-99}));r.rv.forEach(x=>x.ab=x.l>L)}
 const floorL=(d,b)=>3000*Math.pow(1.012,Math.min(d,250))*b;
 function rivalsStep(){const r=rs(),L=L0(),d=inc(),news=[];
  /* rivals chase where you were ~20 days ago, so a fast climber really does pass them */
  if(!Array.isArray(r.h))r.h=[];r.h.push(L);if(r.h.length>22)r.h.shift();const lag=r.h[0];
  r.rv.forEach((x,i)=>{
   if(S.day>=x.ph){x.f=x.b*RND(.85,1.2);x.ph=S.day+RI(20,40)}
   if(x.hot>0)x.hot--;else if(Math.random()<.04){x.hot=3;news.push(x.n+' dropped a new single.');log(x.n+' dropped a new single')}
   const tg=Math.max(floorL(S.day,x.b),lag*x.f*(x.hot?1.35:1));
   x.l=Math.max(1000,x.l+(tg-x.l)*.07+x.l*RND(-.04,.04));
   const ab=x.l>L;
   if(x.ab===null)x.ab=ab;
   else if(x.ab&&!ab){x.ab=false;
    if(S.day-x.ot>=10){x.ot=S.day;const k=1+i*.3,c=Math.round(Math.max(100,d*.5)*k),f=Math.max(30,Math.round(L*.0015*k));cash(c);fol(f);
     card('YOU PASSED '+x.n.toUpperCase(),'Now ahead on the charts','+'+$$c(c)+' and +'+fm(f)+' Instagrime followers.');log('You passed '+x.n+' (+'+$$c(c)+')');safe(()=>snd('chime'),'snd')}
    else log('You passed '+x.n+' again')}
   else if(!x.ab&&ab){x.ab=true;const f=Math.max(10,Math.round(L*.0008));fol(-f);log(x.n+' passed you (-'+fm(f)+' followers)');news.push(x.n+' passed you.')}
  });
  const rank=1+r.rv.filter(x=>x.l>L).length;
  if(rank==1&&r.rank!==1&&S.day-(r.top||-99)>=20){r.top=S.day;card('#1 ON THE CHARTS','You are above every rival','Brands are watching.');log('You hit #1 on the charts');
   safe(()=>{if(typeof BRD!='undefined'&&BRD.mk&&!BRD.open().length&&!BRD.active())BRD.mk()},'top brand')}
  r.rank=rank;if(!(r.best<=rank))r.best=rank;return news};

 /* ---------- brand deals tie-in ---------- */
 const bmul=rk=>rk==1?1.25:rk<=3?1.1:rk>=7?.9:1;
 function brands(){const b=S.brands;if(!b||!Array.isArray(b.list))return;const r=rs(),rk=r.rank||1,m=bmul(rk);
  b.list.forEach(o=>{if(o.st!=0||o.rk)return;o.rk=1;
   if(m!=1){const was=o.pay;o.pay=Math.round(o.pay*m/100)*100;
    safe(()=>{const ms=(S.msgs||[]).find(q=>q.bd===o.id);if(ms)ms.body+=' Update: '+(m>1?'you sit #'+rk+' on the charts, so we raised the fee to '+$$c(o.pay)+'.':'rivals are ahead of you on the charts, so we trimmed the fee to '+$$c(o.pay)+'.')},'brand msg')}});
  if(rk>=6)b.list.forEach(o=>{if(o.st==0&&o.rk&&Math.random()<.2){const x=r.rv.filter(q=>q.l>L0());const w=x.length?pick(x).n:'another artist';o.st=4;
   safe(()=>S.msgs.push({id:S.nid++,from:BRD.agent(o).from,state:9,unread:1,day:S.day,bd:o.id,body:'We have signed '+w+' for this campaign instead. They are higher on the charts. Climb and we will talk again.'}),'steal');log(w+' took a brand deal from you')}})}

 /* ---------- streams boosts ---------- */
 const fxM=()=>{const r=rs();let m=1;r.fx.forEach(f=>{const k=Math.max(0,1-(S.day-f.s)/f.len);m*=1+(f.m-1)*k});return m};
 const addFx=(k,m,len)=>{const r=rs();r.fx.push({k,m,s:S.day,len});};
 {const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!(v>0))return v;
  try{const m=fxM();if(Math.abs(m-1)<.002)return v;const x=(s.vx||0)+(s.fx||0),n=v-x,nv=Math.round(n*m);s.pv=x+Math.max(0,m>1?Math.min(nv,Math.max(n,Math.round(songCap(s)-x))):nv);return s.pv}catch(e){return v}}}

 /* ---------- events ---------- */
 const EV={
  award:{w:2,min:15,make(){return{}},auto:1,run(){const r=rs(),win=(r.rank||9)<=2||Math.random()<.12,c=Math.round(inc()*(win?3:.7)),f=Math.round(Math.max(40,L0()*(win?.004:.0008)));cash(c);fol(f);
   if(win){addFx('award',1.1,5);card('AWARD WON','WaveFern Awards night','You took the trophy. +'+$$c(c)+', +'+fm(f)+' followers, streams up for a few days.');log('Won an award (+'+$$c(c)+')')}
   else{card('AWARD NIGHT','Nominated, not the winner','A rival took the trophy. +'+$$c(c)+' for turning up.');log('Lost an award night')}}},
  playlist:{w:2,min:6,auto:1,run(){addFx('playlist',1.12,3);card('PLAYLIST FEATURE','Editors added your song','Streams +12% fading over 3 days.');log('Big playlist feature')}},
  fest:{w:1.5,min:10,auto:1,run(){addFx('fest',1.06,5);card('FESTIVAL SEASON','Everyone is out listening','Streams +6% fading over 5 days.');log('Festival season boost')}},
  algo:{w:1,min:10,auto:1,run(){addFx('algo',.93,2);card('ALGORITHM CHANGE','The feed shuffled','Streams -7% for 2 days. It passes.');log('Algorithm change dip')}},
  scandal:{w:2,min:12,make(){return{cost:Math.round(inc()*1.5)}},t:'SCANDAL',h:()=>'A clip of you is going around',
   p:e=>'A blurry clip of you is all over the feed and people have opinions.',
   o:e=>[['Pay PR firm '+$$c(e.cost),(S.money||0)>=e.cost,()=>{cash(-e.cost);card('SCANDAL KILLED','PR firm handled it','No harm done.');log('Paid PR to bury a scandal')}],
    ['Say nothing',1,()=>{addFx('scandal',.9,3);card('SCANDAL','You stayed quiet','Streams -10% for 3 days.');log('Scandal hit streams')}],
    ['Lean into it',1,()=>{if(Math.random()<.5){addFx('lean',1.2,3);card('IT WORKED','Controversy sells','Streams +20% for 3 days.');log('Leaned into a scandal: it paid off')}else{addFx('lean',.8,3);card('IT BACKFIRED','Fans turned on you','Streams -20% for 3 days.');log('Leaned into a scandal: it backfired')}}]],def:1},
  bid:{w:2,min:20,gate:()=>L0()>=50000,make(){const a=Math.round(inc()*2.5),b=pick(['Nova Cola','Swiftwing','Pixel Kicks','Aurora Audio','Kite Denim']);return{a,b}},t:'BIDDING WAR',h:e=>e.b+' and a rival brand want you',
   p:e=>e.b+' offers '+$$c(e.a)+' now. Another brand is circling. You can take it or hold out for more.',
   o:e=>[['Take '+$$c(e.a)+' now',1,()=>{cash(e.a);card('DEAL SIGNED',e.b,'+'+$$c(e.a));log(e.b+' paid '+$$c(e.a))}],
    ['Hold out',1,()=>{const win=Math.random()<.6,c=Math.round(e.a*(win?2.2:.5));rs().due={d:S.day+1,c,t:win?'The bidding war paid off':'The offers dried up'};card('HOLDING OUT','Answer tomorrow','Brands are thinking it over.')}]],def:0},
  diss:{w:2,min:12,gate:()=>rs().rv.length>0,make(){const r=rs(),L=L0(),up=r.rv.filter(x=>x.l>L).sort((a,b)=>a.l-b.l)[0]||pick(r.rv);return{n:up.n,up:up.l>L,cost:Math.round(inc()*.5)}},
   t:'DISS TRACK',h:e=>e.n+' dropped a diss track at you',p:e=>e.n+' is calling you out in a new song. '+(e.up?'They are above you on the charts.':'You are above them, which makes it worse for them.'),
   o:e=>[['Reply track '+$$c(e.cost),(S.money||0)>=e.cost,()=>{cash(-e.cost);if(!e.up||Math.random()<.4){addFx('reply',1.15,3);fol(Math.round(Math.max(40,L0()*.002)));card('YOU WON THE BEEF','Reply track hit','Streams +15% for 3 days and new followers.');log('Won a beef with '+e.n)}else{addFx('reply',.95,3);card('BEEF LOST','The reply fell flat','Streams -5% for 3 days.');log('Lost a beef with '+e.n)}}],
    ['Laugh it off',1,()=>{card('SHRUGGED','Ignored it','Nothing changes.');log('Ignored '+e.n)}]],def:1}};
 const EVK=Object.keys(EV);
 function evNew(){const r=rs();if(r.ev||S.day<5||S.day<r.next)return;
  const L=L0(),ok=EVK.filter(k=>{const e=EV[k];return S.day>=e.min&&k!==r.lastEv&&(!e.gate||safe(e.gate,'gate'))&&!(k=='award'&&S.day-(r.lastAward||-99)<20)});
  if(!ok.length)return;let t=0;ok.forEach(k=>t+=EV[k].w);let x=Math.random()*t,k=ok[0];for(const q of ok){x-=EV[q].w;if(x<=0){k=q;break}}
  r.lastEv=k;r.next=S.day+RI(3,6);const e=EV[k];
  if(e.auto){if(k=='award')r.lastAward=S.day;e.run();return}
  r.ev=Object.assign({k,d:S.day,x:S.day+2},e.make());safe(()=>snd('ping'),'snd');evExpire(true)}
 function evPick(i){const r=rs(),ev=r.ev;if(!ev)return;const e=EV[ev.k],o=e.o(ev)[i];if(!o||!o[1])return;r.ev=null;o[2]()}
 function evExpire(now){const r=rs(),ev=r.ev;if(ev&&(now||S.day>=ev.x)){const e=EV[ev.k],o=e.o(ev)[e.def];r.ev=null;if(o)o[2]()}
  if(r.due&&S.day>=r.due.d){const u=r.due;r.due=null;cash(u.c);card('BRAND ANSWER',u.t,'+'+$$c(u.c));log(u.t+' ('+$$c(u.c)+')')}
  r.fx=r.fx.filter(f=>S.day-f.s<f.len)}

 /* ---------- viral ---------- */
 function viral(){const r=rs(),v=r.vr,y=S.day-1;if(!(S.lastPost===y)||r.rolled>=y||!(S.apps&&S.apps.ig))return;r.rolled=y;
  if(Math.random()>=viralP(S.day,L0(),v.n,S.day-v.last))return;
  v.n++;v.last=S.day;const L=L0(),fo=Math.round(Math.max(2000,L*.15)),f2=Math.round(Math.max(300,L*.01));fol(fo);S.followers=(+S.followers||0)+f2;
  const p=(S.igPosts||[]).filter(q=>q&&q.mine&&q.day===y).pop();if(p){p.l=Math.round((p.l||50)*RI(40,120));p.vir=1}
  addFx('viral',1.6,7);log('Your Instagrime post went VIRAL');
  card('YOU WENT VIRAL','Your post is everywhere','+'+fm(fo)+' Instagrime followers, +'+fm(f2)+' fans, streams +60% fading over a week.');safe(()=>{snd('chime');snd('cash')},'snd');
  safe(()=>{if(typeof BRD!='undefined'&&BRD.mk&&!BRD.open().length&&!BRD.active())BRD.mk()},'viral brand')}

 function daily(){if(!live()||!(S.songs||[]).length)return;safe(()=>{rs();evExpire();rivalsInit();rivalsStep();brands();viral();evNew()},'daily')}
 {const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{daily()}catch(e){console.error('rivals',e)}return r}}

 /* test hooks (tools/viral-sim.js) */
 window.FW_RIVALS={viralP,base,fameF,rs,daily,rivalsStep,EV,evPick,fxM,bmul,VB};
})();
