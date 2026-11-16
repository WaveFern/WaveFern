/* ---------- v55.14.0: Music Mastery v2 (dev build) ----------
   A long-term progress number, 0 to 100 %, that rises the better you get at things and the more you do them.
   Press Tab while walking about (or tap the small "Tab Mastery" pill at the bottom left) for the full-screen Mastery panel: a slow
   turntable 3D model of your player with the big % gauge, rank and a compact "What got you here" strip (the top contributing
   activities, ranked, with mini bars), a reward track, the ledger of every category (each shows a big "N% complete" of its OWN cap
   and its share of the total; click or arrow keys + Enter for the breakdown) and the last 20 contributions. Tab or Esc closes it.
   The panel is mode 'menu' like the other menus, so time stands still and movement is off while it is open; if the game pauses
   (focus lost, pause menu) the panel hides until you resume.

   PUBLIC API (other features feed it):  FW_MASTERY = { add(categoryId, points, reason), get(), cats, qualityBonus(q), open(), close() }
     add(cat, points, reason)  skill-weighted points go IN (you decide how many from how well the player did; 0..60 per call).
                               Returns the points that were really applied after the daily rules below.
     get()                     {pct, base, factor, weakest, rank, next, cats:[{id,name,raw,cap,frac,done,pct,weight,today,dayCap,...}], rewards, qBonus ...}
                               done = completion of that category's own cap, 0..100 (what the panel shows as "N% complete")
     cats                      the category table (id -> {name, w, cap, day, exp, how, state})
   Category ids: songs, qual, gigs, fest, golf, surf, mgolf, skate, fish, brand, collab, fame, days.
   surf / mgolf / skate / fish have no activity in the game yet: call FW_MASTERY.add('surf', pts, 'Wave ridden') from the new feature.

   HOW THE NUMBER IS BUILT (tuning table; change the numbers here)
     Every category has a weight W (its share of the 100 %; the thirteen add up to 100), a points cap R, a daily cap D and a curve exponent X.
     category completion  c = min(1, raw / R) ^ X       (0..1, shown as "N% complete"; X < 1 only softens the very start a little)
     base = sum of W * c                               (each category's share of the total)
     Music Mastery % = base * (1 - .08 * worst)        worst = max over categories of max(0, .95 - c) / .95
     The balance penalty is gentle but real: a category left at 0 % caps the total at 92 % of what the rest earned, so skipping one
     activity lands around 82-88 % (its own share is missing too), and the penalty only disappears once EVERY category is above 95 %.
     So 100 % needs all thirteen near complete; maxing only 8 of 13 reaches about 70 %.
     id      W    R(cap)  D(per day)  X     what feeds it
     songs    9   4000    8           .75   each released song: 1.2 + 5 * (quality/100)^2
     qual    12   4000    8           .75   each released song over quality 45: 9 * ((q-45)/55)^1.6, +3 at 90+
     gigs     6   6000    12          .75   Beach Club gig: 3 + 15 * crowd skill^2
     fest    10   9000    20          .75   festival set: 3 + 22 * avg score^2, +1.5 per full song (x0.3 if you quit early)
     golf     8   7000    14          .75   round: 8 - 1.6 * (strokes under/over par), +1.5 per stroke under par on a hole, ace +20
     surf     5   3600    8           .75   API only
     mgolf    4   3000    6           .75   API only
     skate    4   3000    6           .75   API only
     fish     6   3600    8           .75   API only (Fishing)
     brand    7   5400    12          .75   brand deal finished: 10 + 20 * photoshoot quality
     collab   5   3000    6           .75   released song with a feature artist: 4 + 4 * quality/100
     fame    14     10    -           1     (state) fame tier 0..10 with the progress to the next one
     days    10    900    -           .75   (state) 0.5 * days survived + 0.5 * days you earned anything
     Anti-farming: each category stops at its daily cap D per game day; the n-th contribution of a day in a category is worth 0.88^n;
     repeating the same reason (same song, course, stage...) in one day is worth 0.6^repeats. Event points cannot pass R.
     PACING (headless simulation through FW_MASTERY.add, one game day per step; fame modelled as listeners growing 4 % a day):
       normal long session (50 game days at 40 % of every daily cap): 10.6 %  (30 days 7.4, 100 days 17.7, 365 days 49.7)
       heavy varied play (every category at its daily cap, every day): 30 days 11.6 %, 50 days 16.8, 100 days 28.5, 200 days 49.6,
         365 days 77.9; 50 % takes about 200 maxed-out days (many weeks, realistically a lot longer). Consistency alone needs 900 days,
         so 100 % cannot come before day 900 and needs every other category near its cap too.
       all categories at 95 % -> 95 %, at 90 % -> 89.6 %, at 80 % -> 79 %; one missing small category (mini golf) -> 88 %, surfing 87 %.
   ACTIVITY MASTERIES: every category is the player's own mastery of one activity (titled 'Golf Mastery' etc.) with a percent complete
     and a rank name that changes at 0/15/35/60/85 % complete (golf: Range Rookie, Weekend Swinger, Club Regular, Scratch Player,
     Tour Pro). Music Mastery is derived from them; a neglected activity holds the total back (balance penalty above).
   RANKS: Newcomer 0, Local Act 5, Rising 15, Headliner 30, Icon 55, Legend 80.
   REWARDS (RW below): milestones from 5 % to 100 % pay out automatically once: cash, followers, titles, studio perks (+1 song
     quality each at 15 / 40 / 90 %) and panel cosmetics (halo 20 %, gold stage 50 %, aurora 80 %, crown 100 %).
   SONG QUALITY: every new recording gets + round(quality * 0.15 * mastery/100) plus the perk points, never above 100 by this bonus.
   HOOKS (no old file edited; all wrapped in try/catch): S.songs diff (songs, quality, collabs) and S.brands.done diff and
     S.golf.aces diff every second, festEnd (festival sets), bcPlay (Beach Club gig), golfNext on the last hole (golf rounds), mgFinish
     (quality bonus), fame tier and days read live.
   SAVE: S.mst (created lazily the first time the game is running, so an old save starts with a baseline of what it already had).
     { v, raw:{cat:pts}, dy:{d, u:{cat:pts}, n:{cat:count}, w:{'cat|reason':count}}, rs:{cat:{reason:pts}}, log:[{c,p,r,d,t}],
       seen:{sg, ac, br:[ids]}, ad, la, rw:[claimed milestone %] } */
(function(){
if(window.FW_MASTERY)return;
/* trailer recordings and the like add fake songs: stay out of them */
try{if(/[?&]trailer/.test(location.search))return}catch(e){}

const CATS=[
 {id:'songs',name:'Songs',w:9,rk:'Doodler,Songwriter,Hitmaker,Chart Smith,Song Legend'.split(','),cap:4000,day:8,exp:.75,how:'Release songs. A great song is worth many rough ones.'},
 {id:'qual',name:'Song quality',w:12,rk:'Rough Cut,Clean Mix,Polished,Studio Ace,Perfectionist'.split(','),cap:4000,day:8,exp:.75,how:'Release songs above quality 45. Quality 90+ is a perfect song.'},
 {id:'gigs',name:'Gigs',w:6,rk:'Open Mic,Regular Act,Crowd Pleaser,Headline Act,Stage Legend'.split(','),cap:6000,day:12,exp:.75,how:'Play Beach Club gigs with your best songs for a wild crowd.'},
 {id:'fest',name:'Festivals',w:10,rk:'Opening Slot,Side Stage,Main Stage,Festival Star,Festival Legend'.split(','),cap:9000,day:20,exp:.75,how:'Book festival sets and keep the crowd hyped to the last song.'},
 {id:'golf',name:'Golf',w:8,rk:'Range Rookie,Weekend Swinger,Club Regular,Scratch Player,Tour Pro'.split(','),cap:7000,day:14,exp:.75,how:'Finish rounds under par. Birdies, eagles and holes in one pay best.'},
 {id:'surf',name:'Surfing',w:5,rk:'Beach Walker,Wave Paddler,Board Rider,Barrel Chaser,Big Wave Legend'.split(','),cap:3600,day:8,exp:.75,how:'Ride waves (coming soon: counts as soon as surfing is in the game).'},
 {id:'mgolf',name:'Mini Golf',w:4,rk:'Putt Rookie,Windmill Dodger,Clown Slayer,Hole-in-One Hunter,Putt Master'.split(','),cap:3000,day:6,exp:.75,how:'Low scores on the mini golf course (coming soon).'},
 {id:'skate',name:'Skating',w:4,rk:'Board Wobbler,Ollie Kid,Park Regular,Rail Grinder,Skate Legend'.split(','),cap:3000,day:6,exp:.75,how:'Land tricks and long runs on the skate park (coming soon).'},
 {id:'fish',name:'Fishing',w:6,rk:'Bait Fumbler,Pier Angler,Reel Regular,Boat Captain,Fish Whisperer'.split(','),cap:3600,day:8,exp:.75,how:'Catch fish, rare ones pay best (coming soon: counts as soon as fishing is in the game).'},
 {id:'brand',name:'Brand work',w:7,rk:'Fresh Face,Gig Model,Campaign Face,Brand Ambassador,Household Name'.split(','),cap:5400,day:12,exp:.75,how:'Finish brand shoots; a better photoshoot earns more.'},
 {id:'collab',name:'Collabs',w:5,rk:'Solo Act,Feature Guest,Duo Partner,Collab King,Supergroup'.split(','),cap:3000,day:6,exp:.75,how:'Release songs with a feature artist.'},
 {id:'fame',name:'Fame',w:14,rk:'Unknown,Local Buzz,Rising Name,Star,Icon'.split(','),cap:10,day:0,exp:1,state:1,how:'Grow your listeners to climb the fame tiers.'},
 {id:'days',name:'Consistency',w:10,rk:'Newcomer,Regular,Veteran,Lifer,Island Legend'.split(','),cap:900,day:0,exp:.75,state:1,how:'Stay in the game: days survived, and days you actually earned something.'}];
const PEN=.08,PFREE=.95;/* balance penalty: max share lost, and the completion above which a category costs nothing */
const BY={};CATS.forEach(c=>BY[c.id]=c);
const TIERS=[0,15,35,60,85];/* an activity's rank changes at these completions (%) of its own cap */
const RANKS=[[0,'Newcomer'],[5,'Local Act'],[15,'Rising'],[30,'Headliner'],[55,'Icon'],[80,'Legend']];
/* milestone rewards: cash ($), fol (followers), q (flat song quality), badge (title), fx (panel cosmetic) */
const RW=[
 {at:5,k:'badge',n:'Open Mic Regular',d:'Title badge and $250',cash:250,badge:'Open Mic Regular'},
 {at:10,k:'fame',n:'Local buzz',d:'+150 followers',fol:150},
 {at:15,k:'perk',n:'Sharp Ears',d:'+1 song quality on every new recording',q:1},
 {at:20,k:'style',n:'Green halo',d:'A halo over your player in this panel and $1,000',fx:'halo',cash:1000},
 {at:30,k:'badge',n:'Headliner Pass',d:'Title badge and +600 followers',badge:'Headliner Pass',fol:600},
 {at:40,k:'perk',n:'Golden Ears',d:'+1 more song quality and $2,500',q:1,cash:2500},
 {at:50,k:'style',n:'Gold stage',d:'A golden stage and backdrop in this panel and $5,000',fx:'gold',cash:5000},
 {at:60,k:'fame',n:'Press darling',d:'+2,500 followers',fol:2500},
 {at:70,k:'badge',n:'Icon Status',d:'Title badge and $10,000',badge:'Icon Status',cash:10000},
 {at:80,k:'style',n:'Aurora sparkles',d:'Sparkles around your player and $20,000',fx:'aurora',cash:20000},
 {at:90,k:'perk',n:'Master Ear',d:'+1 more song quality and +10,000 followers',q:1,fol:10000},
 {at:100,k:'style',n:'Legend crown',d:'A golden crown, the Music Master title and $100,000',fx:'crown',badge:'Music Master',cash:100000}];
const QCAP=.15;/* song quality bonus at 100 % mastery */
const KIND={cash:'CASH',fame:'FAME',perk:'PERK',badge:'BADGE',style:'STYLE'};

const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d)=>typeof v=='number'&&isFinite(v)?v:(d||0);
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const soft=(e,w)=>{try{if(window.fwSoftErr)fwSoftErr(e,w||'mastery');else console.warn('mastery',w,e)}catch(_){}};
const wasSeen=()=>typeof S=='object'&&S;

/* ---------- state ---------- */
function ens(){
 if(!wasSeen())return null;
 let m=S.mst;
 if(!m||typeof m!='object'||Array.isArray(m)){
  const br=[];try{((S.brands&&S.brands.list)||[]).forEach(o=>{if(o&&o.st==3)br.push(String(o.id))})}catch(e){}
  m=S.mst={v:1,raw:{},dy:{d:-1,u:{},n:{},w:{}},rs:{},log:[],seen:{sg:(S.songs||[]).length,ac:num(S.golf&&S.golf.aces),br},ad:0,la:-1,rw:[]}}
 if(!m.raw||typeof m.raw!='object')m.raw={};
 if(!m.dy||typeof m.dy!='object')m.dy={d:-1,u:{},n:{},w:{}};
 if(!m.rs||typeof m.rs!='object')m.rs={};
 if(!Array.isArray(m.log))m.log=[];
 if(!m.seen||typeof m.seen!='object')m.seen={sg:(S.songs||[]).length,ac:0,br:[]};
 if(!Array.isArray(m.seen.br))m.seen.br=[];
 if(!Array.isArray(m.rw))m.rw=[];
 if(m.dy.d!==S.day){m.dy={d:S.day,u:{},n:{},w:{}}}
 return m}

let DIRTY=1;
/* ---------- public add ---------- */
function add(id,pts,reason){
 try{
  const c=BY[id],m=ens();
  if(!c||!m){if(!c)console.warn('FW_MASTERY.add: unknown category',id);return 0}
  if(c.state)return 0;
  pts=num(+pts);if(!(pts>0))return 0;pts=Math.min(60,pts);
  reason=String(reason||c.name).replace(/[<>]/g,'').slice(0,60);
  const dy=m.dy,n=dy.n[id]||0,key=id+'|'+reason,rn=dy.w[key]||0,used=dy.u[id]||0;
  let v=pts*Math.pow(.88,n)*Math.pow(.6,rn);
  v=Math.min(v,c.day-used,c.cap-num(m.raw[id]));
  dy.n[id]=n+1;dy.w[key]=rn+1;
  /* the per-reason counter table stays small: only today's keys live in it */
  if(v<.05)return 0;
  v=+v.toFixed(2);
  dy.u[id]=+(used+v).toFixed(2);m.raw[id]=+(num(m.raw[id])+v).toFixed(2);
  const rs=m.rs[id]=m.rs[id]||{};rs[reason]=+(num(rs[reason])+v).toFixed(2);
  const ks=Object.keys(rs);if(ks.length>14){ks.sort((a,b)=>rs[a]-rs[b]);delete rs[ks[0]]}
  if(m.la!==S.day){m.la=S.day;m.ad=num(m.ad)+1}
  m.log.push({c:id,p:v,r:reason,d:S.day,t:typeof clk=='function'?clk():''});if(m.log.length>30)m.log.splice(0,m.log.length-30);
  DIRTY=1;return v
 }catch(e){soft(e,'add');return 0}}

/* ---------- reading ---------- */
function fameRaw(){
 try{
  const val=typeof fameVal=='function'?fameVal():num(S.listeners),F=typeof FT!='undefined'?FT:[150,600,2500,9000,30000,90000,300000,1e6,5e6,25e6,1e8,1e9];
  let t=0;while(t<F.length&&val>=F[t])t++;
  if(t>=F.length)return F.length;
  const lo=t?Math.log(F[t-1]):0,hi=Math.log(F[t]);
  return t+cl((Math.log(Math.max(1,val))-lo)/(hi-lo),0,1)*.999}catch(e){return 0}}
function rawOf(c,m){
 if(c.id=='fame')return fameRaw();
 if(c.id=='days')return .5*num(S.day)+.5*num(m.ad);
 return num(m.raw[c.id])}
function tierOf(d){let t=0;TIERS.forEach((a,i)=>{if(d>=a)t=i});return t}
function rankOf(p){let r=RANKS[0],nx=null;for(let i=0;i<RANKS.length;i++){if(p>=RANKS[i][0]){r=RANKS[i];nx=RANKS[i+1]||null}}return{name:r[1],at:r[0],next:nx?{name:nx[1],at:nx[0]}:null}}
function perkQ(m){let q=0;RW.forEach(r=>{if(r.q&&m.rw.includes(r.at))q+=r.q});return q}
function get(){
 const m=ens();
 if(!m)return{pct:0,base:0,factor:1,weakest:'',rank:'Newcomer',next:{name:'Local Act',at:5},cats:[],rewards:[],qBonus:0,qFlat:0,log:[],title:''};
 let tot=0,worst=0,wc=null;
 const cats=CATS.map(c=>{
  const raw=Math.min(c.cap,rawOf(c,m)),frac=Math.pow(cl(raw/c.cap,0,1),c.exp),pct=c.w*frac;tot+=pct;
  const d=Math.max(0,PFREE-frac)/PFREE;if(d>worst){worst=d;wc=c.name}
  return{id:c.id,name:c.name,mname:c.name+' Mastery',rank:c.rk[tierOf(frac*100)],tier:tierOf(frac*100),how:c.how,state:!!c.state,weight:c.w,raw:+raw.toFixed(1),cap:c.cap,frac,done:+(frac*100).toFixed(1),pct:+pct.toFixed(2),
   today:+(m.dy.u[c.id]||0).toFixed(1),dayCap:c.day,count:m.dy.n[c.id]||0,mult:c.day?+Math.pow(.88,m.dy.n[c.id]||0).toFixed(2):1,
   reasons:Object.entries(m.rs[c.id]||{}).sort((a,b)=>b[1]-a[1]).slice(0,5)}});
 const factor=1-PEN*worst,pct=Math.min(100,+(tot*factor).toFixed(2)),rk=rankOf(pct);
 const rewards=RW.map(r=>({at:r.at,k:r.k,n:r.n,d:r.d,fx:r.fx||'',got:m.rw.includes(r.at)}));
 const flat=perkQ(m),qBonus=QCAP*pct/100;
 let title='';RW.forEach(r=>{if(r.badge&&m.rw.includes(r.at))title=r.badge});
 return{pct,base:+tot.toFixed(2),factor,weakest:worst>0?wc:'',rank:rk.name,next:rk.next,cats,rewards,qBonus,qFlat:flat,log:m.log.slice(-20).reverse(),title,ad:num(m.ad),claimed:m.rw.length}}

/* the extra quality a new recording of quality q gets (a share of q plus the perk points); used by the mgFinish wrapper */
function qualityBonus(q){try{const g=get();let b=Math.round(num(q)*g.qBonus)+g.qFlat;if(b<=0)return 0;const room=Math.max(0,100-num(q));return q>=100?0:Math.min(b,Math.max(room,0))}catch(e){return 0}}

/* ---------- rewards ---------- */
function claimAll(){
 const m=ens();if(!m)return;const g=get();
 RW.forEach(r=>{
  if(g.pct+1e-9<r.at||m.rw.includes(r.at))return;
  m.rw.push(r.at);
  try{
   if(r.cash){S.money=+((+S.money||0)+r.cash).toFixed(2)}
   if(r.fol){S.followers=(+S.followers||0)+r.fol}
   m.log.push({c:'reward',p:0,r:r.n,d:S.day,t:typeof clk=='function'?clk():''});if(m.log.length>30)m.log.splice(0,m.log.length-30);
   if(typeof say=='function')say('Mastery '+r.at+'%: '+r.n+' unlocked!');
   if(typeof snd=='function')snd('chime');
   if(typeof updateVersion=='function')updateVersion();
  }catch(e){soft(e,'reward')}
  DIRTY=1})}

/* ---------- hooks ---------- */
function live(){return wasSeen()&&typeof mode!='undefined'&&mode!='load'&&S.day>0}
function songTick(){
 const m=ens(),L=S.songs||[];
 if(L.length<m.seen.sg)m.seen.sg=L.length;
 for(;m.seen.sg<L.length;m.seen.sg++){
  const s=L[m.seen.sg];if(!s||typeof s!='object')continue;
  const q=cl(num(+s.q),0,140),t=String(s.title||'a song');
  add('songs',1.2+5*Math.pow(Math.min(q,100)/100,2),t);
  if(q>45)add('qual',9*Math.pow(Math.min(q-45,55)/55,1.6)+(q>=90?3:0),t);
  if(s.ft)add('collab',4+4*Math.min(q,100)/100,t)}
}
function golfTick(){
 const m=ens(),a=num(S.golf&&S.golf.aces);
 if(a<m.seen.ac)m.seen.ac=a;
 if(a>m.seen.ac){for(let i=m.seen.ac;i<a;i++)add('golf',20,'Hole in one #'+(i+1));m.seen.ac=a}
}
function brandTick(){
 const m=ens(),L=(S.brands&&Array.isArray(S.brands.list))?S.brands.list:[];
 L.forEach(o=>{if(!o||o.st!=3)return;const id=String(o.id);if(m.seen.br.includes(id))return;m.seen.br.push(id);if(m.seen.br.length>400)m.seen.br.shift();
  const q=cl(num(o.res&&o.res.q,50),0,100)/100;add('brand',10+20*q,'Brand shoot '+(o.b||id))})}
function tick(){
 try{
  if(!live())return;
  ens();
  try{songTick()}catch(e){soft(e,'songs')}
  try{golfTick()}catch(e){soft(e,'golf')}
  try{brandTick()}catch(e){soft(e,'brand')}
  claimAll();pill()
 }catch(e){soft(e,'tick')}}
setInterval(tick,1000);

/* festival sets */
try{if(typeof festEnd=='function'){const f0=festEnd;festEnd=function(quit){
 const set=typeof FEST!='undefined'&&FEST.set,was=set&&!set.end;const r=f0.apply(this,arguments);
 try{if(was&&set&&set.end&&live()){const avg=cl(num(set.avg,.4),0,1),full=num(set.full),k=quit?.3:1;
  add('fest',(3+22*avg*avg+full*1.5)*k,'Festival set '+((set.st&&(set.st.name||set.st.n))||''))}}catch(e){soft(e,'fest')}
 return r}}}catch(e){soft(e,'wrap fest')}
/* Beach Club gigs */
try{if(typeof window.bcPlay=='function'){const b0=window.bcPlay;window.bcPlay=function(){
 const m0=num(S.money),st0=(S.songs||[]).map(s=>num(s.streams));const r=b0.apply(this,arguments);
 try{if(num(S.money)>m0){const L=(S.songs||[]).filter((s,i)=>num(s.streams)>(st0[i]==null?1e99:st0[i]));
  const q=L.length?L.reduce((a,s)=>a+num(s.q),0)/L.length:50,sk=cl(q/100,.1,1);add('gigs',3+15*sk*sk,'Beach Club gig')}}catch(e){soft(e,'gig')}
 return r}}}catch(e){soft(e,'wrap gig')}
/* golf rounds: read the card when the last hole is finished */
try{if(typeof window.golfNext=='function'&&window.GOLF&&GOLF.ui){const g0=window.golfNext;window.golfNext=function(){
 let info=null;try{const G=GOLF.ui.G();if(G&&G.card==1&&G.hi>=G.hs.length-1){info={sc:G.sc.slice(),par:G.hs.map(h=>h.par),prac:!!G.practice,tour:!!G.tour,name:G.tour?'Grand Tour':(G.C&&G.C.n)||'Golf Club'}}}catch(e){}
 const r=g0.apply(this,arguments);
 try{if(info&&live()){let tot=0,par=0,under=0;info.sc.forEach((s,i)=>{if(s==null)return;tot+=s;par+=info.par[i];if(s<info.par[i])under+=info.par[i]-s});
  const d=tot-par;let p=cl(8-1.6*d,1.5,24)+Math.min(8,under*1.5);if(info.tour)p*=1.3;if(info.prac)p*=.15;
  add('golf',p,(info.prac?'Practice at ':'Round at ')+info.name)}}catch(e){soft(e,'golf')}
 return r}}}catch(e){soft(e,'wrap golf')}
/* song quality bonus: after every other wrapper has added its part to the new draft */
try{if(typeof mgFinish=='function'){const f0=mgFinish;mgFinish=function(){
 const n0=S.nid;const r=f0.apply(this,arguments);
 try{const d=S.drafts&&S.drafts[S.drafts.length-1];if(d&&d.id===n0&&!d.mst){const b=qualityBonus(d.q);d.mst=1;if(b>0){d.q+=b;
  const g=get();
  const p=document.querySelector('#ui .modal p.m');
  if(p){const fq=document.getElementById('fxq');if(fq)fq.textContent=d.q;else p.innerHTML=p.innerHTML.replace(/mix quality \d+/,'mix quality '+d.q);
   if(!p.querySelector('.mstq'))p.insertAdjacentHTML('beforeend',' <span class=mstq style="color:#ffd23f;white-space:nowrap" title="Music Mastery '+g.pct.toFixed(1)+'%">· Mastery +'+b+'</span>')}}}}catch(e){soft(e,'quality')}
 return r}}}catch(e){soft(e,'wrap quality')}

/* ---------- UI ---------- */
const CSS=`
#mst{position:fixed;inset:0;z-index:40;display:none;color:var(--t,#e8f3ec);font:13px/1.35 ui-monospace,Menlo,Consolas,monospace;background:radial-gradient(120% 90% at 30% 20%,#14281f 0%,#0a1210 45%,#040605 100%);user-select:none;pointer-events:auto;overflow:hidden}
#mst.on{display:grid;grid-template-columns:minmax(300px,40%) 1fr}
#mst *{box-sizing:border-box}
#mst .mL{position:relative;min-height:0;background:radial-gradient(70% 60% at 50% 55%,#1c3a2d 0%,#0c1612 60%,#050807 100%);border-right:3px solid #000;box-shadow:inset -2px 0 #2a352e}
#mst.gold .mL{background:radial-gradient(70% 60% at 50% 55%,#4a3a12 0%,#1c160a 60%,#070604 100%)}
#mst canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#mst .mG{position:absolute;left:16px;top:14px;width:170px;height:170px;pointer-events:none}
#mst .mG svg{width:100%;height:100%;transform:rotate(-90deg);filter:drop-shadow(0 0 10px #2fe68a66)}
#mst .mG circle{fill:none;stroke-width:11}
#mst .mG .bg{stroke:#0b1511;stroke-width:13}
#mst .mG .tk{stroke:#1d2e26}
#mst .mG .fg{stroke:var(--g,#2fe68a);stroke-linecap:butt;transition:stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)}
#mst.gold .mG .fg{stroke:#ffd23f}
#mst .mGt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-shadow:2px 2px 0 #000}
#mst .mGt b{font:700 34px 'Silkscreen',ui-monospace,monospace;line-height:1}
#mst .mGt u{text-decoration:none;font:700 16px ui-monospace,Menlo,Consolas,monospace;margin-left:2px;color:var(--m,#8aa094)}
#mst .mGt small{font:10px 'Silkscreen',ui-monospace,monospace;color:var(--m,#8aa094);margin-top:5px;letter-spacing:.5px}
#mst .mRk{position:absolute;left:16px;right:16px;bottom:16px;padding:10px 12px;background:#000b;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e;pointer-events:none}
#mst .mRk .px{font-size:24px;color:var(--g,#2fe68a);margin:0}
#mst.gold .mRk .px{color:#ffd23f}
#mst .mRk small{display:block;color:var(--m,#8aa094);margin-top:3px}
#mst .mTi{position:absolute;right:16px;top:16px;font:11px 'Silkscreen',ui-monospace,monospace;color:#ffd23f;text-shadow:2px 2px 0 #000;text-align:right;max-width:40%}
#mst .mR{min-height:0;overflow-y:auto;padding:18px 22px 30px}
#mst .mH{display:flex;align-items:center;gap:12px;margin-bottom:10px}
#mst .mH h2{font-size:26px;margin:0;flex:1;color:var(--g,#2fe68a);text-shadow:3px 3px 0 #000}
#mst h3{font-size:14px;margin:18px 0 8px;color:var(--m,#8aa094);letter-spacing:1px;text-transform:uppercase}
#mst .mC{display:flex;gap:8px;flex-wrap:wrap}
#mst .chip{background:#0b0f0dd9;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e;padding:6px 10px;min-width:130px;flex:1}
#mst .chip b{display:block;font-size:16px;color:var(--g,#2fe68a)}
#mst .chip small{color:var(--m,#8aa094)}
#mst .mRw{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
#mst .rw{background:#0b0f0d;border:3px solid #000;box-shadow:inset 0 0 0 2px #1d2621;padding:7px 9px;opacity:.55;position:relative}
#mst .rw.got{opacity:1;box-shadow:inset 0 0 0 2px var(--g,#2fe68a)}
#mst .rw.nx{opacity:1;box-shadow:inset 0 0 0 2px #ffd23f}
#mst .rw .at{font:12px 'Silkscreen',ui-monospace,monospace;color:var(--m,#8aa094)}
#mst .rw.got .at{color:var(--g,#2fe68a)}
#mst .rw.nx .at{color:#ffd23f}
#mst .rw b{display:block;margin:3px 0 2px}
#mst .rw small{color:var(--m,#8aa094);display:block;min-height:30px}
#mst .rw i{position:absolute;right:7px;top:7px;font:9px 'Silkscreen',ui-monospace,monospace;font-style:normal;padding:1px 4px;background:#26302a;color:var(--t,#e8f3ec)}
#mst .rw.got i{background:var(--g,#2fe68a);color:#04120a}
#mst .mNx{margin-top:8px;color:var(--m,#8aa094)}
#mst .mNx b{color:#ffd23f}
#mst .bar2{height:10px;background:#000;border:2px solid #000;margin-top:4px;position:relative}
#mst .bar2 i{display:block;height:100%;background:var(--g,#2fe68a)}
#mst .lg{background:#0b0f0dd9;border:3px solid #000;box-shadow:inset 0 0 0 2px #1d2621;margin-bottom:6px;cursor:pointer;padding:8px 10px}
#mst .lg:hover,#mst .lg.sel{box-shadow:inset 0 0 0 2px var(--g,#2fe68a)}
#mst .lg .t{display:flex;gap:10px;align-items:center}
#mst .lg .nm{flex:1;min-width:0}#mst .lg .nm b{display:block;font-size:15px}#mst .lg .nm span{display:block;margin-top:2px}#mst .lg .nm u{text-decoration:none;color:#ffd23f}#mst .lg .pc{text-align:right;min-width:92px}#mst .lg .pc b{display:block;font:800 32px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:-1px;color:var(--g,#2fe68a);text-shadow:2px 2px 0 #000}#mst .lg .pc small{color:var(--m,#8aa094);font-size:11px}#mst .lg .sh{font-size:12px;margin-top:4px}#mst .lg .sh b{color:var(--g,#2fe68a)}#mst .intro{color:var(--m,#8aa094);font-size:12px;margin:-2px 0 8px}
#mst .mL canvas{left:0;right:auto;width:calc(100% - 226px)}
#mst .mSm{position:absolute;right:10px;top:52px;width:206px;padding:8px 10px;background:#000c;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e;pointer-events:none}
#mst .mSm h4{margin:0 0 6px;font:10px/1.3 'Silkscreen',ui-monospace,monospace;color:var(--m,#8aa094);letter-spacing:.5px;text-transform:uppercase}
#mst .sr{display:flex;flex-wrap:wrap;gap:0 8px;align-items:baseline;margin-bottom:5px}#mst .sr span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#mst .sr b{font-size:15px;color:var(--g,#2fe68a)}#mst .sr i{flex:0 0 100%;height:6px;background:#000;display:block;margin-top:2px}#mst .sr s{display:block;height:100%;background:var(--g,#2fe68a)}#mst.gold .sr s{background:#ffd23f}#mst.gold .sr b{color:#ffd23f}
#mst .sn,#mst .sp{font-size:11px;color:var(--m,#8aa094)}#mst .sp{margin-top:4px;color:#ffd23f}
#mst .lg .t span{color:var(--m,#8aa094);font-size:12px}

#mst .lg .h{color:var(--m,#8aa094);font-size:12px;margin-top:3px}
#mst .lg .dt{display:none;margin-top:8px;padding-top:8px;border-top:2px dashed #26302a;font-size:12px}
#mst .lg.open .dt{display:block}
#mst .dt div{margin:2px 0}
#mst .dt .m{color:var(--m,#8aa094)}
#mst .lo{background:#0b0f0dd9;border:3px solid #000;box-shadow:inset 0 0 0 2px #1d2621;padding:4px 10px}
#mst .lo div{display:flex;gap:10px;padding:4px 0;border-bottom:1px solid #1d2621}
#mst .lo div:last-child{border:0}
#mst .lo span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#mst .lo em{font-style:normal;color:var(--g,#2fe68a);min-width:56px;text-align:right}
#mst .lo small{color:var(--m,#8aa094);min-width:110px;text-align:right}
#mst .lo .none{color:var(--m,#8aa094)}
#mst .ft{margin-top:14px;color:var(--m,#8aa094);font-size:11px}
#mstpill{position:fixed;left:10px;bottom:10px;z-index:3;display:none;padding:4px 9px;font:11px 'Silkscreen',ui-monospace,monospace;color:#8aa094;background:#000a;border:2px solid #000;box-shadow:inset 0 0 0 1px #2a352e;cursor:pointer;opacity:.75}
#mstpill:hover{opacity:1;color:#e8f3ec}
#mstpill b{color:#2fe68a}
@media(max-width:820px){#mst.on{grid-template-columns:1fr;grid-template-rows:minmax(190px,36vh) 1fr}#mst .mL{border-right:0;border-bottom:3px solid #000}#mst .mG{width:110px;height:110px;left:10px;top:8px}#mst .mGt b{font-size:22px}#mst .mGt small{display:none}#mst .mL canvas{width:100%}#mst .mSm{top:auto;bottom:8px;right:10px;width:min(190px,44%);padding:5px 7px}#mst .mSm h4,#mst .mSm .sp{display:none}#mst .mSm .sr:nth-child(n+5){display:none}#mst .mSm .sr{margin-bottom:3px}#mst .mSm .sr b{font-size:13px}#mst .mRk{bottom:8px;padding:6px 8px;right:auto;left:10px;max-width:50%}#mst .mRk .px{font-size:16px}#mst .mR{padding:12px 12px 24px}}
`;
let ST=null,CV=null,RD=null,SC=null,CA=null,PIV=null,MD=null,RAF=0,T0=0,SELI=0,OPEN=0,RUN=0,FX={},EXP={};
function css(){if(document.getElementById('mstcss'))return;const s=document.createElement('style');s.id='mstcss';s.textContent=CSS;document.head.appendChild(s)}
function pill(){
 try{let p=document.getElementById('mstpill');if(!p){p=document.createElement('div');p.id='mstpill';p.title='Open Music Mastery';p.onclick=()=>{if(mode=='play')open()};document.body.appendChild(p)}
  const show=typeof mode!='undefined'&&mode=='play'&&!OPEN&&live()&&!(typeof cr=='function'&&cr());
  const hide=document.body.classList.contains('fston');
  p.style.display=show&&!hide?'block':'none';
  if(show){const g=get(),t='Tab Mastery '+g.pct.toFixed(1)+'%';if(p._t!==t){p._t=t;p.innerHTML='Tab · Mastery <b>'+g.pct.toFixed(1)+'%</b>'}}
 }catch(e){}}

function ring(pct){const r=54,c=2*Math.PI*r;return`<svg viewBox="0 0 140 140"><circle class=bg cx=70 cy=70 r=${r}></circle><circle class=tk cx=70 cy=70 r=${r} stroke-dasharray="3 5.5"></circle><circle class=fg id=mstfg cx=70 cy=70 r=${r} stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" data-c="${c.toFixed(1)}" data-p="${pct}"></circle></svg>`}
function ago(d){const n=num(S.day)-d;return n<=0?'today':n==1?'yesterday':n+' days ago'}
function render(first){
 const el=ST;if(!el)return;const g=get();
 const gold=g.rewards.some(r=>r.fx=='gold'&&r.got);el.classList.toggle('gold',gold);
 const nx=g.rewards.find(r=>!r.got);
 /* left side */
 const L=el.querySelector('.mL');
 if(first){L.querySelector('.mG').innerHTML=ring(g.pct)+`<div class=mGt><b><span id=mstpc>${g.pct.toFixed(1)}</span><u>%</u></b><small>MUSIC MASTERY</small></div>`}
 else{const b=L.querySelector('#mstpc');if(b)b.textContent=g.pct.toFixed(1);const fg=L.querySelector('#mstfg');if(fg){const c=+fg.dataset.c;fg.style.strokeDashoffset=(c*(1-g.pct/100)).toFixed(1)}}
 L.querySelector('.mRk').innerHTML=`<h2 class=px>${E(g.rank)}</h2><small>${g.next?'Next rank: '+E(g.next.name)+' at '+g.next.at+'% ('+(g.next.at-g.pct).toFixed(1)+'% to go)':'Top rank reached.'}</small>`;
 L.querySelector('.mTi').innerHTML=g.title?E(g.title):'';
 /* right side */
 const R=el.querySelector('.mR');
 const qb=g.qBonus*100;
 R.querySelector('.mC').innerHTML=
  `<div class=chip><b>+${qb.toFixed(1)}%${g.qFlat?' +'+g.qFlat:''}</b><small>song quality bonus from mastery${g.qFlat?' and studio perks':''}</small></div>`+
  `<div class=chip><b>${g.base.toFixed(1)}%</b><small>from your activity masteries${g.weakest?' (-'+((1-g.factor)*100).toFixed(1)+'% balance: '+E(g.weakest)+' holds it back)':', no balance penalty'}</small></div>`+
  `<div class=chip><b>${g.claimed}/${RW.length}</b><small>rewards unlocked</small></div>`+
  `<div class=chip><b>${g.ad}</b><small>days you earned mastery (day ${num(S.day)})</small></div>`;
 R.querySelector('.mRw').innerHTML=g.rewards.map(r=>{const st=r.got?'got':r===nx?'nx':'';return`<div class="rw ${st}" title="${E(r.d)}"><i>${r.got?'UNLOCKED':r===nx?'NEXT':'LOCKED'}</i><div class=at>${r.at}%</div><b>${E(r.n)}</b><small>${E(KIND[r.k])} · ${E(r.d)}</small></div>`}).join('');
 R.querySelector('.mNx').innerHTML=nx?`Next reward: <b>${nx.at}% ${E(nx.n)}</b> · ${(nx.at-g.pct).toFixed(1)}% to go<div class=bar2><i style="width:${cl(((g.pct-(prevAt(nx.at)))/(nx.at-prevAt(nx.at)))*100,0,100).toFixed(1)}%"></i></div>`:'Every reward unlocked. You are a Music Master.';
 R.querySelector('.mLg').innerHTML=g.cats.map((c,i)=>{
  const sub=c.state?(c.id=='fame'?'Fame tier '+c.raw.toFixed(1)+' of '+c.cap:'Day '+num(S.day)+' · '+g.ad+' active days'):c.raw.toFixed(0)+' / '+c.cap+' pts';
  const rs=c.reasons.length?c.reasons.map(q=>'<div>'+E(q[0])+' <span class=m>+'+q[1].toFixed(1)+' pts</span></div>').join(''):'<div class=m>Nothing yet.</div>';
  const day=c.dayCap?`<div><span class=m>Today:</span> ${c.today.toFixed(1)} / ${c.dayCap} pts${c.today>=c.dayCap-.05?' (daily cap reached)':''} · next contribution worth x${c.mult}</div>`:'<div class=m>No daily cap: this one follows your progress.</div>';
  return`<div class="lg${EXP[c.id]?' open':''}${i==SELI?' sel':''}" data-i=${i} data-id=${c.id} title="${E(c.mname)} ${c.done.toFixed(0)}% complete: ${c.raw.toFixed(0)} of ${c.cap} points, worth ${c.pct.toFixed(1)} of ${c.weight}% of Music Mastery">
  <div class=t><div class=nm><b>${E(c.mname)}</b><span>Rank: <u>${E(c.rank)}</u> · ${sub}</span></div><div class=pc><b>${c.done.toFixed(0)}%</b><small>complete</small></div></div>
  <div class=bar2><i style="width:${c.done.toFixed(1)}%"></i></div>
  <div class=sh>Adds <b>${c.pct.toFixed(1)}</b> of its <b>${c.weight}</b> points to your Music Mastery (${c.weight}% weight)</div>
  <div class=h>Raises it: ${E(c.how)}</div>
  <div class=dt><div><span class=m>Points:</span> ${c.raw.toFixed(1)} of ${c.cap} (${c.done.toFixed(1)}% complete)</div>${day}<div class=m>Best sources:</div>${rs}</div></div>`}).join('');
 /* the compact strip beside the player: top contributors, ranked */
 const top=g.cats.filter(c=>c.pct>=.05).sort((a,b)=>b.pct-a.pct).slice(0,6);
 L.querySelector('.mSm').innerHTML='<h4>Your activity masteries (% complete)</h4>'+(top.length?top.map(c=>`<div class=sr><span>${E(c.name)}</span><b>${c.done.toFixed(0)}%</b><i><s style="width:${c.done.toFixed(1)}%"></s></i></div>`).join(''):'<div class=sn>Nothing yet. Play, perform, golf, shoot...</div>')+(g.weakest?`<div class=sp>Held back ${((1-g.factor)*100).toFixed(1)}% by ${E(g.weakest)}</div>`:'');
 R.querySelector('.lo').innerHTML=g.log.length?g.log.map(e=>{const c=BY[e.c];return e.c=='reward'?`<div><span>Reward: ${E(e.r)}</span><em>unlocked</em><small>Day ${e.d} ${E(e.t)} · ${ago(e.d)}</small></div>`:`<div><span>${E(c?c.name:e.c)}: ${E(e.r)}</span><em>+${(+e.p).toFixed(1)}</em><small>Day ${e.d} ${E(e.t)} · ${ago(e.d)}</small></div>`}).join(''):'<div class=none>Nothing yet. Release a song, play a set or finish a round.</div>';
 DIRTY=0}
function prevAt(a){let p=0;RW.forEach(r=>{if(r.at<a)p=r.at});return p}

function build(){
 if(ST)return;css();
 ST=document.createElement('div');ST.id='mst';
 ST.innerHTML=`<div class=mL><canvas id=mstc></canvas><div class=mG></div><div class=mTi></div><div class=mSm></div><div class=mRk></div></div>
 <div class=mR><div class=mH><h2 class=px>Music Mastery</h2><button id=mstx>Close (Tab)</button></div>
 <div class=mC></div><h3>Reward track</h3><div class=mRw></div><div class=mNx></div><h3>Activity masteries</h3><div class=intro>Music Mastery is built from your activity masteries. Each activity has its own mastery (0 to 100% of its own goal) that you raise by playing it well and often; the total is the sum of their shares. An activity you leave untouched holds the total back: 100% needs every activity above 95%.</div><div class=mLg></div><h3>Recent activity</h3><div class=lo></div>
 <div class=ft>Click a row or use Up / Down and Enter for its breakdown. Points are skill-weighted, capped per day and worth less when repeated, so this takes a very long time. Tab or Esc closes.</div></div>`;
 document.body.appendChild(ST);
 ST.querySelector('#mstx').onclick=close;
 ST.querySelector('.mLg').addEventListener('click',e=>{const r=e.target.closest('.lg');if(!r)return;SELI=+r.dataset.i;EXP[r.dataset.id]=!EXP[r.dataset.id];render()});
 ST.querySelector('.mLg').addEventListener('mousemove',e=>{const r=e.target.closest('.lg');if(r&&+r.dataset.i!==SELI){SELI=+r.dataset.i;ST.querySelectorAll('.lg').forEach(x=>x.classList.toggle('sel',x===r))}});
}
/* ---------- 3D player ---------- */
function stage3d(){
 try{
  CV=ST.querySelector('#mstc');
  RD=new THREE.WebGLRenderer({canvas:CV,antialias:true,alpha:true});RD.setClearColor(0x000000,0);
  SC=new THREE.Scene();
  const hemi=new THREE.HemisphereLight(0xcfeaff,0x10201a,.75);SC.add(hemi);
  const key=new THREE.DirectionalLight(0xfff0d8,1.05);key.position.set(3,5,4);SC.add(key);
  const rim=new THREE.DirectionalLight(0x2fe68a,.95);rim.position.set(-4,3,-4);SC.add(rim);
  const rim2=new THREE.DirectionalLight(0x6a8cff,.5);rim2.position.set(4,2,-3);SC.add(rim2);
  PIV=new THREE.Group();SC.add(PIV);
  const o=buildChar(ch),g=o.g;MD=o;
  g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);PIV.add(g);
  const bb=new THREE.Box3().setFromObject(g),h=Math.max(.5,bb.max.y-bb.min.y);g.position.y-=bb.min.y;
  const gold=FX.gold,rc=gold?0xffd23f:0x2fe68a;
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(h*.52,h*.56,.08,40),new THREE.MeshStandardMaterial({color:gold?0x3a2e10:0x0d1713,roughness:.6,metalness:.4}));disc.position.y=-.04;PIV.add(disc);
  const ring1=new THREE.Mesh(new THREE.RingGeometry(h*.46,h*.5,48),new THREE.MeshBasicMaterial({color:rc,side:THREE.DoubleSide}));ring1.rotation.x=-Math.PI/2;ring1.position.y=.01;PIV.add(ring1);
  const ring2=new THREE.Mesh(new THREE.RingGeometry(h*.62,h*.63,64),new THREE.MeshBasicMaterial({color:rc,transparent:true,opacity:.35,side:THREE.DoubleSide}));ring2.rotation.x=-Math.PI/2;ring2.position.y=-.05;SC.add(ring2);SC.userData.r2=ring2;
  if(FX.halo){const hl=new THREE.Mesh(new THREE.TorusGeometry(h*.13,h*.012,8,32),new THREE.MeshBasicMaterial({color:0x7dffc0}));hl.rotation.x=Math.PI/2;hl.position.y=h+h*.07;PIV.add(hl);SC.userData.halo=hl}
  if(FX.crown){const cg=new THREE.Group(),cm=new THREE.MeshStandardMaterial({color:0xffd23f,emissive:0x6a4a00,roughness:.3,metalness:.8});
   const base=new THREE.Mesh(new THREE.CylinderGeometry(h*.085,h*.095,h*.04,12),cm);cg.add(base);
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2,sp=new THREE.Mesh(new THREE.ConeGeometry(h*.02,h*.06,4),cm);sp.position.set(Math.cos(a)*h*.08,h*.05,Math.sin(a)*h*.08);cg.add(sp)}
   cg.position.y=h+h*.03;PIV.add(cg);SC.userData.crown=cg}
  if(FX.aurora){const n=70,pos=new Float32Array(n*3),ph=[];for(let i=0;i<n;i++){ph.push([Math.random()*6.28,.3+Math.random()*.4,Math.random()*h*1.1,.3+Math.random()*.9]);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
   const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:gold?0xffe38a:0x7dffc0,size:h*.035,transparent:true,opacity:.9,depthWrite:false}));pts.frustumCulled=false;pts.userData.ph=ph;pts.userData.h=h;SC.add(pts);SC.userData.aur=pts}
  CA=new THREE.PerspectiveCamera(28,1,.1,100);
  const d=(h*1.3/2)/Math.tan(CA.fov*Math.PI/360);CA.position.set(0,h*.52,d);CA.lookAt(0,h*.48,0);CA.userData.h=h;
  return true
 }catch(e){soft(e,'stage3d');try{if(RD){RD.dispose();RD=null}}catch(_){}return false}}
function size3d(){
 if(!RD||!CV)return;const w=CV.clientWidth,h=CV.clientHeight;if(!w||!h)return;
 const dpr=Math.min(window.devicePixelRatio||1,2);
 if(CV._w!==w||CV._h!==h||CV._d!==dpr){CV._w=w;CV._h=h;CV._d=dpr;RD.setPixelRatio(dpr);RD.setSize(w,h,false);CA.aspect=w/h;
  /* a narrow pane needs the camera further back so the whole player fits */
  const hh=CA.userData.h,need=(hh*1.3/2)/Math.tan(CA.fov*Math.PI/360)/Math.min(1,CA.aspect*1.15);CA.position.z=need;CA.updateProjectionMatrix()}}
function frame(t){
 RAF=0;if(!OPEN)return;
 if(typeof mode!='undefined'&&mode=='pause'){ST.style.visibility='hidden';RAF=requestAnimationFrame(frame);return}
 ST.style.visibility='';
 try{
  const dt=Math.min(.05,(t-(T0||t))/1000);T0=t;
  if(DIRTY)render();
  if(RD){size3d();PIV.rotation.y+=dt*.55;const tt=t/1000;
   try{if(MD&&MD.arms){MD.arms[0].rotation.x=Math.sin(tt*1.6)*.05;MD.arms[1].rotation.x=-Math.sin(tt*1.6)*.05}}catch(e){}
   const u=SC.userData;if(u.halo){u.halo.position.y=CA.userData.h*1.07+Math.sin(tt*2)*.02;u.halo.rotation.z=tt}
   if(u.crown)u.crown.rotation.y=-tt*.8;
   if(u.r2){const k=1+.06*Math.sin(tt*1.5);u.r2.scale.set(k,k,1)}
   if(u.aur){const a=u.aur.geometry.attributes.position,p=u.aur.userData.ph,h=u.aur.userData.h;for(let i=0;i<p.length;i++){const q=p[i],ang=q[0]+tt*q[3],y=(q[2]+tt*.12*h*q[3])%(h*1.15);a.setXYZ(i,Math.cos(ang)*h*q[1],y,Math.sin(ang)*h*q[1])}a.needsUpdate=true}
   RD.render(SC,CA)}
 }catch(e){soft(e,'frame')}
 RAF=requestAnimationFrame(frame)}

function canOpen(){return typeof mode!='undefined'&&mode=='play'&&!PAUSED&&live()}
function open(){
 try{
  if(OPEN||!canOpen())return false;
  ens();claimAll();
  const g=get();FX={};g.rewards.forEach(r=>{if(r.fx&&r.got)FX[r.fx]=1});
  for(const k in keys)delete keys[k];
  build();mode='menu';OPEN=1;DIRTY=1;SELI=0;
  ST.classList.add('on');ST.style.visibility='';
  render(true);
  /* animate the ring from empty */
  requestAnimationFrame(()=>{const fg=ST.querySelector('#mstfg');if(fg){const c=+fg.dataset.c;fg.getBoundingClientRect();fg.style.strokeDashoffset=(c*(1-g.pct/100)).toFixed(1)}});
  if(!stage3d()){CV.style.display='none'}
  T0=0;if(!RAF)RAF=requestAnimationFrame(frame);
  try{snd('pop')}catch(e){}
  const p=document.getElementById('mstpill');if(p)p.style.display='none';
  return true
 }catch(e){soft(e,'open');try{OPEN=0;if(ST)ST.classList.remove('on');if(mode=='menu')mode='play'}catch(_){}return false}}
function close(external){
 if(!OPEN)return;OPEN=0;
 try{if(RAF){cancelAnimationFrame(RAF);RAF=0}}catch(e){}
 try{if(ST){ST.classList.remove('on');ST.classList.remove('gold')}}catch(e){}
 try{if(RD){RD.dispose();try{RD.forceContextLoss()}catch(e){}RD=null}SC=null;PIV=null;CA=null;MD=null;if(CV){CV.style.display='';CV._w=0}}catch(e){}
 /* a fresh canvas next time: a lost WebGL context cannot be reused */
 try{if(ST){ST.remove();ST=null;CV=null}}catch(e){}
 if(!external&&typeof mode!='undefined'&&mode=='menu')mode='play';
 for(const k in keys)delete keys[k];
 try{snd('pop')}catch(e){}pill()}

addEventListener('keydown',e=>{
 try{
  const k=(e.key||'').toLowerCase();
  const tg=e.target&&e.target.tagName;
  if(OPEN){
   if(typeof mode!='undefined'&&mode=='pause')return;/* the pause menu owns the keys while paused */
   if(e.ctrlKey||e.metaKey||e.altKey||/^f\d+$/.test(k))return;
   e.preventDefault();e.stopImmediatePropagation();
   if(e.repeat&&(k=='tab'||k=='escape'))return;
   if(k=='tab'||k=='escape')return close();
   const n=CATS.length;
   if(k=='arrowdown'||k=='s'){SELI=(SELI+1)%n;DIRTY=1;scrollSel()}
   else if(k=='arrowup'||k=='w'){SELI=(SELI+n-1)%n;DIRTY=1;scrollSel()}
   else if(k=='enter'||k==' '){const c=CATS[SELI];if(c){EXP[c.id]=!EXP[c.id];DIRTY=1}}
   return}
  if(k!='tab'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(/INPUT|TEXTAREA|SELECT/.test(tg||'')||(e.target&&e.target.isContentEditable))return;
  if(typeof mode=='undefined')return;
  if(mode=='play'||mode=='drive'||mode=='rec'){e.preventDefault();/* no browser focus jump while playing */
   if(mode=='play'&&!e.repeat&&canOpen()){e.stopImmediatePropagation();open()}}
 }catch(er){soft(er,'key')}},true);
function scrollSel(){setTimeout(()=>{try{const r=ST&&ST.querySelector('.lg.sel');if(r)r.scrollIntoView({block:'nearest'})}catch(e){}},0)}
/* if something else takes the screen (a load, a sleep), drop the panel without touching mode */
setInterval(()=>{try{if(OPEN&&typeof mode!='undefined'&&mode!='menu'&&mode!='pause')close(true)}catch(e){}},400);

window.FW_MASTERY={add,get,cats:BY,qualityBonus,open,close,list:CATS,rewards:RW,isOpen:()=>!!OPEN};
})();
