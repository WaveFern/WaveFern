/* ===== v26.80: late-game money sinks =====
   Income grows with monthly listeners (about $0.012 a day per monthly listener at $0.10 a stream), so once you pass
   the early stages the old top prices go quickly. Two changes, early prices untouched:
   1. The top cars and homes cost more (LATE below). Prices only change for things you have not bought yet.
   2. Label HQ, a free app: five team and studio upgrades, four levels each, that clearly help.
      Each level unlocks at a fame tier (fl: index into FTL(), like the Gear shop) and costs roughly 15 to 60 days
      of income at the tier where it unlocks.
      s = extra share of streams per level, q = song quality added per level when a recording is finished,
      h = extra hit chance per level (0.2 = +20% of the normal chance), pr = Promotion discount and extra days (83-promotions.js). */
const LATE={cars:{3:25000,4:90000},homes:{1:75000,2:250000}};
Object.entries(LATE.cars).forEach(([i,p])=>{if(CARS[i])CARS[i].p=p});
Object.entries(LATE.homes).forEach(([i,p])=>{if(PROPS[i])PROPS[i][1]=p});
const HQ={
 manager:{n:'Manager',d:'Gets your songs on playlists and radio',lv:['No manager','Part-time manager','Full-time manager','Industry veteran','Superstar manager'],c:[5e3,6e4,5e5,1.2e7],fl:[3,5,7,9],s:.1},
 producer:{n:'Producer',d:'A pro in the room for every session',lv:['Just you','Session producer','Staff producer','Hitmaker','Legend producer'],c:[8e3,9e4,8e5,1.8e7],fl:[3,5,7,9],q:4},
 studio:{n:'Studio build-out',d:'Turns your room into a real studio',lv:['Bedroom studio','Project studio','Pro studio','World-class studio','Private studio complex'],c:[1.5e4,1.5e5,1.2e6,2.5e7],fl:[4,6,8,10],q:5,b:'Build'},
 pr:{n:'PR team',d:'Press, interviews and smarter promotion',lv:['No PR','Freelance publicist','PR agency','Global PR firm','Celebrity PR'],c:[6e3,7e4,6e5,1.4e7],fl:[3,5,7,9],pr:1},
 mkt:{n:'Marketing',d:'Pushes every release on day one',lv:['No marketing','Ad budget','Marketing team','Label marketing','Worldwide campaign'],c:[2e4,2e5,1.5e6,3e7],fl:[4,6,8,10],h:.2,b:'Fund'}};
const hqL=k=>(S.hq&&S.hq[k])||0,hqFill=()=>{if(!S.hq||typeof S.hq!='object')S.hq={};Object.keys(HQ).forEach(k=>{if(!(S.hq[k]>=0))S.hq[k]=0})};hqFill();
const hqSum=f=>Object.keys(HQ).reduce((a,k)=>a+hqL(k)*(HQ[k][f]||0),0),hqS=()=>hqSum('s'),hqQ=()=>hqSum('q'),hqH=()=>hqSum('h'),hqPR=()=>hqL('pr');
const hqLock=k=>{const H=HQ[k],l=hqL(k);if(l>=4)return 0;const t=FTL()[H.fl[l]];return fameLevel()<t?t:0};
const hqEff=k=>{const H=HQ[k];return H.s?'+'+Math.round(H.s*100)+'% streams per level':H.q?'+'+H.q+' song quality per level':H.h?'+'+Math.round(H.h*100)+'% hit chance per level':'Promotions 10% cheaper and 1 day longer per level'};
const $k=n=>'$'+Math.round(n).toLocaleString('en-US');
{const lc=loadCode;loadCode=function(c){const r=lc.apply(this,arguments);hqFill();return r}}

function hqBuy(k){hqFill();const H=HQ[k],l=hqL(k);if(!H||l>=4)return;const lk=hqLock(k);if(lk){snd('err');return say(H.n+': '+H.lv[l+1]+' unlocks at Fame Level '+lk+'.')}
 const c=H.c[l];if(S.money<c){snd('err');return say('Not enough money.')}S.money=+(S.money-c).toFixed(2);S.hq[k]=l+1;updateVersion();snd('cash');say('Label HQ: '+H.lv[l+1]+' is on board.');pcR()}

/* the bonuses: more streams (on top of gear), more quality on every new recording, more hits */
{const po=planOf;planOf=function(s){const fresh=s.pd!==S.day,v=po(s),m=hqS();if(!fresh||!(m>0)||!(v>0))return v;const x=s.vx||0,n=v-x,cap=songCap(s)-x;s.pv=x+Math.max(n,Math.min(Math.round(n*(1+m)),Math.round(cap)));return s.pv}}
{const mf0=mgFinish;mgFinish=function(){const n0=S.nid;const r=mf0.apply(this,arguments);const d=S.drafts[S.drafts.length-1];if(!d||d.id!==n0)return r;const b=hqQ();if(!b)return r;d.q+=b;
 const p=document.querySelector('#ui .modal p.m');if(p&&/mix quality \d+/.test(p.innerHTML))p.innerHTML=p.innerHTML.replace(/mix quality \d+/,'mix quality '+d.q)+' <span style="color:var(--g)">(+'+b+' Label HQ)</span>';return r}}
{const r0=rollLuck;rollLuck=function(s){const h=PERF.hitP;PERF.hitP=h*(1+hqH());try{return r0.apply(this,arguments)}finally{PERF.hitP=h}}}

/* ---- the app ---- */
APPD.hq={n:'Label HQ',p:0,d:'Free! Hire a manager, producer, PR and marketing, and build out your studio. For when the money starts rolling in.'};
if(typeof APPMOD!='undefined')APPMOD.hq=[[.9,1.1,.7,'#2a2f45',0,.55,0],[.7,.08,.02,'#e6b422',0,.95,.36],[.2,.35,.02,'#e6b422',0,.2,.36]];
IC.hq=mkIc(['....GG....','...GGGG...','..NNNNNN..','..NWNNWN..','..NNNNNN..','..NWNNWN..','..NNNNNN..','..NWNNWN..','..NNDDNN..','KKKKDDKKKK'],{G:'#e6b422',N:'#3a4466',W:'#9ad0ff',D:'#e6b422',K:'#1a1d2b'});
{const s0=PA.store;PA.store=()=>s0().replace(/(onclick="inst\('hq'\)">)[^<]*</,'$1Get · Free<')}
PA.hq=()=>{hqFill();const s=hqS(),q=hqQ(),h=hqH(),pr=hqPR();
 const card=k=>{const H=HQ[k],l=hqL(k),mx=l>=4,lk=hqLock(k);return`<div class="card hqc${mx?' hqmax':''}"><small class=m>${H.n} · ${H.d}</small><p style="margin:4px 0"><b style="font-size:15px">${H.lv[l]}</b> <span class=gpip>${[1,2,3,4].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</span></p><small style="color:var(--g)">${hqEff(k)}</small>${mx?'<p class=m>Top level</p>':`<p class=m>Next: ${H.lv[l+1]}</p>${lk?`<button disabled>🔒 Fame Level ${lk} · ${$k(H.c[l])}</button>`:`<button class=go ${S.money<H.c[l]?'disabled':''} onclick="hqBuy('${k}')">${H.b||'Hire'} · ${$k(H.c[l])}</button>`}`}</div>`};
 return`<div class=hqx><h1><img src="${IC.hq}" style="width:32px;image-rendering:pixelated;vertical-align:middle"> Label HQ</h1><p class=m>Balance <b style="color:var(--g)">${$k(S.money)}</b> · Fame Level ${fameLevel()} · ${S.listeners.toLocaleString()} monthly listeners</p><p class=m>Your team adds <b style="color:var(--g)">+${Math.round(s*100)}% streams</b>, <b style="color:var(--g)">+${q} quality</b> to every new recording, <b style="color:var(--g)">+${Math.round(h*100)}% hit chance</b>${pr?` and makes promotions <b style="color:var(--g)">${pr*10}% cheaper, +${pr} day${pr>1?'s':''}</b>`:''}. Upgrades unlock as your fame grows.</p><div class=cards>${Object.keys(HQ).map(card).join('')}</div></div>`};
{const st=document.createElement('style');st.textContent='.hqx .gpip{display:inline-flex;gap:3px;vertical-align:middle;margin-left:4px}.hqx .gpip i{width:9px;height:9px;border-radius:2px;background:#0005;box-shadow:inset 0 0 0 1px #fff3}.hqx .gpip i.on{background:#e6b422}.hqx .hqc.hqmax{box-shadow:inset 0 0 0 2px #e6b422}.hqx .hqc button[disabled]{opacity:.7}';document.head.appendChild(st)}
