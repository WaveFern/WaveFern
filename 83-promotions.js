/* ===== v26.81: promotions priced by monthly listeners, with before / during / after stats =====
   Three packages on Instagrime. Price = (base + monthly listeners x per) x (1 - 10% per PR team level, 82-label-hq.js).
   The PR team also adds one day per level. A promoted song streams m times its normal amount (still inside the song's
   lifetime limit, songCap) on every day of the campaign, starting straight away, and you gain followers when it starts.
   Extra streams (p.x) is what the multiplier added on top of the song's normal plan, so it is the promotion's real effect.
   Stats: when you start, the game notes the song's streams per day, your monthly listeners and followers (Before).
   Each night it records the song's streams that day, monthly listeners and followers, for every campaign day (During)
   and for AFTER_DAYS days after it ends (After). Older saves: songs still promoted the old way keep their old boost. */
const PROMO_T=[{n:'Boost',days:3,m:1.5,base:40,per:.002,f:.01},{n:'Campaign',days:5,m:2,base:150,per:.006,f:.02},{n:'Blitz',days:7,m:3,base:600,per:.015,f:.04}],AFTER_DAYS=3,PROMO_KEEP=8;
const prFill=()=>{if(!Array.isArray(S.promos))S.promos=[]};prFill();
{const lc=loadCode;loadCode=function(c){const r=lc.apply(this,arguments);prFill();return r}}
const prCost=k=>{const T=PROMO_T[k];return Math.round((T.base+(S.listeners||0)*T.per)*(1-.1*(typeof hqPR=='function'?hqPR():0)))};
const prDays=k=>PROMO_T[k].days+(typeof hqPR=='function'?hqPR():0);
const igFol=()=>S.followers+(S.igF||0);
const prOn=(s,d)=>S.promos.find(p=>p.s==s.id&&d>=p.d0&&d<=p.d1);
const prRun=s=>prOn(s,S.day);

/* the boost itself, on top of gear and Label HQ */
const prApply=(s,m)=>{const x=s.vx||0,n=s.pv-x,cap=songCap(s)-x;s.pv=x+Math.max(n,Math.min(Math.round(n*m),Math.round(cap)))};
const prBoost=(s,p)=>{const v0=s.pv;prApply(s,p.m);p.x=(p.x||0)+Math.max(0,s.pv-v0)};
{const po=planOf;planOf=function(s){const fresh=s.pd!==S.day,v=po(s);if(!fresh||!(v>0))return v;const p=prRun(s);if(p)prBoost(s,p);return s.pv}}

let PRS=null,PRK=1;
function prStart(id,k){prFill();const s=S.songs.find(x=>x.id==id),T=PROMO_T[k];if(!s||!T)return;if(prRun(s)){snd('err');return say('"'+s.title+'" is already being promoted.')}
 const c=prCost(k);if(S.money<c){snd('err');return say('Not enough money.')}
 const base=planOf(s),ml=S.listeners||0,f0=igFol();S.money=+(S.money-c).toFixed(2);
 const p={id:S.nid++,s:s.id,t:s.title,k,c,m:T.m,d0:S.day,d1:S.day+prDays(k)-1,b:{st:base,ml,f:f0},h:[],x:0};S.promos.push(p);
 prBoost(s,p);const nf=RI(3,12)+Math.round(ml*T.f);S.followers+=nf;
 const done=S.promos.filter(q=>S.day>q.d1+AFTER_DAYS);if(done.length>PROMO_KEEP){const drop=new Set(done.slice(0,done.length-PROMO_KEEP));S.promos=S.promos.filter(q=>!drop.has(q))}
 updateVersion();snd('cash');say(T.n+' started for "'+s.title+'": '+T.m+'x streams for '+prDays(k)+' days, +'+nf.toLocaleString()+' followers.');pcR()}
/* old entry point (older Instagrime screens): the cheapest package */
function promo(id){prStart(id,0)}

/* nightly stats: the song's streams yesterday, monthly listeners and followers after the night's update */
{const w0=wakeUp;wakeUp=function(auto){const r=w0.apply(this,arguments);try{prNight()}catch(e){console.error('promo stats',e)}return r}}
function prNight(){prFill();const y=S.day-1;S.promos.forEach(p=>{if(y<p.d0||y>p.d1+AFTER_DAYS||p.h.some(e=>e[0]==y))return;const s=S.songs.find(x=>x.id==p.s);
 p.h.push([y,s&&s.pd===y?Math.round(s.today||0):0,S.listeners||0,igFol()]);
 if(y==p.d1+AFTER_DAYS&&Array.isArray(S.msgs)){const r=prRes(p),pc=v=>(v>=0?'+':'')+v+'%';
  S.msgs.push({id:S.nid++,from:'Instagrime Ads',body:'Your '+PROMO_T[p.k].n+' for "'+p.t+'" is over. Song streams per day: '+pc(r.dSt)+' during and '+pc(r.aSt)+' after, compared with before. It brought in about '+fmtN(p.x)+' extra streams. Monthly listeners went from '+p.b.ml.toLocaleString()+' to '+r.aMl.toLocaleString()+'. Full stats are in Instagrime > Account > Promotions.',state:9,unread:1,day:S.day})}})}

/* before / during / after */
const prAvg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0,pctOf=(a,b)=>b>0?Math.round((a-b)/b*100):0;
function prRes(p){const D=p.h.filter(e=>e[0]<=p.d1),A=p.h.filter(e=>e[0]>p.d1),lastD=D[D.length-1],lastA=A[A.length-1];
 const dSt=prAvg(D.map(e=>e[1])),aSt=prAvg(A.map(e=>e[1]));
 return{D,A,dSt0:dSt,aSt0:aSt,dSt:pctOf(dSt,p.b.st),aSt:pctOf(aSt,p.b.st),dMl:lastD?lastD[2]:null,aMl:lastA?lastA[2]:lastD?lastD[2]:p.b.ml,dF:lastD?lastD[3]:null,aF:lastA?lastA[3]:null}}
function prState(p){if(S.day<=p.d1)return{t:'Running · day '+(S.day-p.d0+1)+' of '+(p.d1-p.d0+1),c:'pm-run'};if(S.day<=p.d1+AFTER_DAYS)return{t:'Finished · tracking after ('+Math.min(AFTER_DAYS,S.day-p.d1-1)+'/'+AFTER_DAYS+' days)',c:'pm-aft'};return{t:'Done',c:'pm-done'}}
const fmtN=v=>v==null?'–':Math.round(v).toLocaleString('en-US');
const chg=(v,b)=>{if(v==null||!(b>0))return'';const d=pctOf(v,b);return` <small class="${d>0?'up':d<0?'dn':''}">${d>0?'+':''}${d}%</small>`};
function prCard(p){const st=prState(p),r=prRes(p),s=S.songs.find(x=>x.id==p.s),T=PROMO_T[p.k],now=st.c=='pm-run'&&s&&s.pd===S.day?Math.round(s.today||0):null;
 const rows=[['Song streams / day',p.b.st,r.D.length?r.dSt0:null,r.A.length?r.aSt0:null],['Monthly listeners',p.b.ml,r.dMl,r.A.length?r.aMl:null],['Followers',p.b.f,r.dF,r.aF]];
 const all=[p.b.st,...p.h.map(e=>e[1]),now||0],mx=Math.max(1,...all),bar=(v,c,l)=>`<i class="${c}" style="height:${Math.max(2,Math.round(v/mx*48))}px" title="${l}: ${fmtN(v)} streams"></i>`;
 const bars=bar(p.b.st,'qb','Before')+p.h.map(e=>bar(e[1],e[0]<=p.d1?'qd':'qa',(e[0]<=p.d1?'During':'After')+', day '+e[0])).join('')+(now!=null?bar(now,'qd qn','Today so far'):'');
 return`<div class="pmc ${st.c}"><div class=pmh><b>${esc(p.t)}</b><span>${T.n} · ${T.m}x · ${$k(p.c)}</span></div><div class=pms>${st.t}${now!=null?' · today so far '+fmtN(now)+' streams':''}${s?'':' · song deleted'}</div><div class=pmx>Extra streams from this promotion: <b>${fmtN(p.x||0)}</b>${p.x>0?' (about '+$k((p.x||0)*PAY_RATE)+' in pay)':''}</div>
 <table class=pmt><tr><th></th><th>Before</th><th>During</th><th>After</th></tr>${rows.map(x=>`<tr><td>${x[0]}</td><td>${fmtN(x[1])}</td><td>${fmtN(x[2])}${chg(x[2],x[1])}</td><td>${fmtN(x[3])}${chg(x[3],x[1])}</td></tr>`).join('')}</table>
 <div class=pmb>${bars}</div><div class=pml><span><i class=qb></i>Before</span><span><i class=qd></i>During</span><span><i class=qa></i>After</span><small>Streams per day for this song. During and After are daily averages; listeners and followers are the latest count.</small></div></div>`}
function prPage(){prFill();const L=S.songs.slice().sort((a,b)=>b.id-a.id);if(PRS==null||!L.some(s=>s.id==PRS))PRS=L.length?L[0].id:null;const s=L.find(x=>x.id==PRS),run=s&&prRun(s),pr=typeof hqPR=='function'?hqPR():0;
 const pick=L.length?`<select onchange="PRS=+this.value;pcR()">${L.map(x=>`<option value="${x.id}" ${x.id==PRS?'selected':''}>${esc(x.title)}${prRun(x)?' (promoted)':''}</option>`).join('')}</select>`:'<p style="color:#aaa">Upload a song first.</p>';
 const pace=s?planOf(s):0,near=s&&songCap(s)<pace*2;
 const tiers=s?`<div class=pmk>${PROMO_T.map((T,k)=>{const c=prCost(k);return`<div class="pmtier ${PRK==k?'on':''}" onclick="PRK=${k};pcR()"><b>${T.n}</b><span>${T.m}x streams · ${prDays(k)} days</span><span>+${Math.round(T.f*100)}% of listeners as followers</span><em>${$k(c)}</em><button class=go ${run||S.money<c?'disabled':''} onclick="event.stopPropagation();prStart(${s.id},${k})">Start</button></div>`}).join('')}</div>`:'';
 const list=S.promos.slice().reverse();
 return`<div class=pmw><h3>Promote your songs</h3><p class=pmn>Prices follow your monthly listeners (${(S.listeners||0).toLocaleString()}): the bigger you are, the more a campaign costs.${pr?` Your PR team takes ${pr*10}% off and adds ${pr} day${pr>1?'s':''}.`:''} Balance <b>${$k(S.money)}</b>.</p>${pick}${s?`<p class=pmn>"${esc(s.title)}" is on about <b>${fmtN(pace)}</b> streams today${run?`, promoted until day ${run.d1}`:''}.${near?' It is close to its lifetime streaming limit, so a promotion will do little.':''}</p>`:''}${tiers}
 <h3>Your promotions</h3>${list.length?list.map(prCard).join(''):'<p class=pmn>No promotions yet. Start one above and come back each day to see how it is doing.</p>'}</div>`}

/* Instagrime: the account page gets a Promotions button in place of the old list; the Promotions page has its own view */
{const ig0=PA.ig;PA.ig=()=>{if(igv=='promo'){const hd=`<div class=igh><span class=igl>Instagrime</span><span style="display:flex;gap:8px"><button onclick="igv='feed';pcR()">Feed</button><button class=go onclick="igv='acct';igt='posts';pcR()">Account</button></span></div>`;
  let b;try{b=prPage()}catch(e){console.error('promotions',e);b='<p style="padding:14px">Promotions hit a snag. Try again.</p>'}return`<div class=ig>${hd}<div style="padding:8px 14px"><button onclick="igv='acct';pcR()">‹ Back to account</button></div>${b}</div>`}
 const h=ig0();if(igv!='acct')return h;prFill();const n=S.songs.filter(s=>prRun(s)).length;
 return h.replace(/<b>Promote your songs<\/b>[\s\S]*?(<\/div><div class=igm>)/,`<div class=ng><span style="flex:1"><b>Promote your songs</b><br><small style="color:#aaa">${n?n+' running · ':''}price follows your monthly listeners</small></span><button class=go onclick="igv='promo';pcR()">Promotions</button></div>$1`)}}
{const st=document.createElement('style');st.textContent=`.ig .pmw{padding:4px 14px 14px}.ig .pmw h3{margin:12px 0 6px;font-size:15px}.ig .pmn{color:#aaa;font-size:13px;margin:4px 0 8px}.ig .pmn b{color:#fff}.ig .pmw select{width:100%;padding:8px;background:#121212;color:#fff;border:1px solid #363636;border-radius:6px}
.ig .pmk{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0}.ig .pmtier{border:1px solid #363636;border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:3px;cursor:pointer;font-size:12px;color:#aaa}.ig .pmtier b{color:#fff;font-size:14px}.ig .pmtier em{font-style:normal;color:#fff;font-weight:700;font-size:16px;margin:4px 0}.ig .pmtier.on{border-color:#e91e63;box-shadow:inset 0 0 0 1px #e91e63}
.ig .pmc{border:1px solid #262626;border-radius:8px;padding:10px;margin:8px 0}.ig .pmc.pm-run{border-color:#e91e63}.ig .pmh{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.ig .pmh span,.ig .pms{color:#aaa;font-size:12px}.ig .pms{margin:2px 0 6px}.ig .pmx{font-size:12px;color:#aaa;margin:0 0 6px}.ig .pmx b{color:#fff}
.ig .pmt{width:100%;border-collapse:collapse;font-size:12px}.ig .pmt th{color:#aaa;font-weight:400;text-align:right;padding:3px 4px}.ig .pmt td{text-align:right;padding:3px 4px;border-top:1px solid #262626;white-space:nowrap}.ig .pmt td:first-child{text-align:left;color:#aaa;white-space:normal}.ig .pmt small.up{color:#4cd964}.ig .pmt small.dn{color:#ff6b6b}
.ig .pmb{display:flex;align-items:flex-end;gap:3px;height:52px;margin:8px 0 4px;border-bottom:1px solid #363636}.ig .pmb i{flex:1;max-width:22px;border-radius:2px 2px 0 0}.ig i.qb{background:#777}.ig i.qd{background:#e91e63}.ig i.qd.qn{opacity:.55}.ig i.qa{background:#f9a825}
.ig .pml{display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:#aaa;align-items:center}.ig .pml span{display:inline-flex;align-items:center;flex-direction:row;width:auto}.ig .pml span i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:middle}.ig .pml small{flex-basis:100%}`;document.head.appendChild(st)}
