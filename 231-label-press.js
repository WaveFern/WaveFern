/* ===== v52.5.0: vinyl and CD pressing (Label HQ, "Vinyl & CD" tab) =====
   Press physical copies of a released album. You pick the album, the format, how many to make and the price per copy.
   - Cost: a one-off setup (plate / glass master) plus a unit cost that grows with the number of songs, with a volume discount
     above 100 copies. Paid up front when you order.
   - Demand (PRESS.forecast): a fan pool from the album's lifetime streams and your monthly listeners, scaled by song quality, then
     by price against a fair price for the format (cheaper sells more, dearer falls off fast), then by saturation from copies you
     already sold of that album and format. One hidden roll (+-15%) is made when you order. Copies sold = min(printed, demand), so
     printing more than the fans want or pricing too high is a loss and nothing breaks even by luck on a tiny audience.
   - Time: CDs arrive after 1 day, vinyl after 3. Then the copies sell over 10 days, front loaded. Money arrives each morning;
     after the last day unsold copies are written off and a result card (sold, revenue, cost, profit) is mailed and kept in the tab.
   - State: S.press={nid,runs:[{id,alb,fmt,qty,price,cost,day,ready,dem,sold,rev,state,sg}],sold:{'albumId|fmt':copies},rev,cost,printed,units}.
     state 0 = being pressed / on sale, 1 = finished. sg = copies signed so far, sgs = signed copies already sold.
   Signing (BRD.pressSign, uses signGame of 232-signature-game.js): each signed item adds ~SGC copies (scaled by signature quality), only
   to copies still unsold. Signed copies sell for +60% and each signed share of the run lifts total demand up to +25%.
   - UI: BRD.press() returns the page body; 223-brand-deals.js adds the tab and calls it. Styles reuse the .lhq classes. */
(function(){
const FM={
 vinyl:{n:'Vinyl',ref:28,unit:8.5,per:.35,setup:450,lead:3},
 cd:{n:'CD',ref:12,unit:1.6,per:.05,setup:120,lead:1}};
const SGP=.6,SGD=.25,SGN=5,SGC=10,WIN=10,DECAY=.78,MINQ=10,MAXQ=20000,NOISE=.15;
const fm=n=>'$'+Math.round(n).toLocaleString('en-US'),fm2=n=>'$'+(+n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),num=n=>Math.round(n).toLocaleString('en-US');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function st(){if(!S.press||typeof S.press!='object')S.press={nid:1,runs:[],sold:{},rev:0,cost:0,printed:0,units:0};const p=S.press;
 if(!Array.isArray(p.runs))p.runs=[];if(!p.sold||typeof p.sold!='object')p.sold={};['nid','rev','cost','printed','units'].forEach(k=>{if(!(p[k]>=0))p[k]=k=='nid'?1:0});return p}
const albums=()=>Array.isArray(S.albums)?S.albums:[];
const albById=id=>albums().find(a=>a.id==id);
const songsOf=a=>(a.songs||[]).map(id=>(S.songs||[]).find(s=>s.id==id)).filter(Boolean);
const key=(a,f)=>a+'|'+f;
const cumW=k=>{let t=0,n=0;for(let i=0;i<WIN;i++){const w=Math.pow(DECAY,i);n+=w;if(i<k)t+=w}return t/n};
/* what it costs to press qty copies of a format for an album with n songs */
function costOf(f,qty,n){const F=FM[f],unit=F.unit+F.per*n,disc=qty>=100?clamp(.12*Math.log10(qty/100),0,.3):0;
 return{setup:F.setup,unit:+(unit*(1-disc)).toFixed(2),disc,total:+(F.setup+unit*(1-disc)*qty).toFixed(2)}}
/* the size of the market for one album in one format, before price: fans who would buy a physical copy */
function poolOf(a,f){const so=songsOf(a),streams=so.reduce((t,s)=>t+(+s.streams||0),0),q=so.length?so.reduce((t,s)=>t+(+s.q||40),0)/so.length:40;
 let raw=(+S.listeners||0)*.003+streams*.0006;if(raw>20000)raw=20000+Math.pow(raw-20000,.85);
 const qf=clamp(q/50,.6,1.4),sold=st().sold[key(a.id,f)]||0;let p=raw*qf*(f=='cd'?1.5:1);p=Math.max(p*.2,p-sold*.6);return{pool:p,streams,q,qf}}
/* demand multiplier from the price: cheaper than the fair price sells a bit more, dearer falls off fast */
function priceMult(f,price){const r=Math.max(.4,price/FM[f].ref);return r<=1?1+(1-r)*.9:Math.pow(r,-2.2)}
function forecast(a,f,qty,price){const F=FM[f],c=costOf(f,qty,songsOf(a).length),P=poolOf(a,f),mult=priceMult(f,price),base=P.pool*mult;
 const at=k=>{const sold=Math.min(qty,Math.round(base*k)),rev=sold*price;return{sold,rev,profit:rev-c.total}};
 const lo=at(1-NOISE),mid=at(1),hi=at(1+NOISE);
 /* break-even copies and the lowest price that breaks even if the expected demand at that price holds */
 const be=price>c.unit?Math.ceil((c.setup)/(price-c.unit)):Infinity;
 let verdict='Profitable';if(mid.profit<0)verdict='Likely loss';else if(lo.profit<0)verdict='Risky';
 return{c,P,mult,base,lo,mid,hi,be,verdict,ref:F.ref}}
/* ---------- the order ---------- */
const PRD={alb:0,fmt:'vinyl',qty:200,price:FM.vinyl.ref};
function ensure(){const al=albums();if(!al.length){PRD.alb=0;return}if(!albById(PRD.alb))PRD.alb=al[al.length-1].id}
function order(){const a=albById(PRD.alb);if(!a)return say('Make an album first.');const f=PRD.fmt,qty=Math.floor(+PRD.qty),price=+PRD.price;
 if(!(qty>=MINQ&&qty<=MAXQ))return say('Print between '+MINQ+' and '+num(MAXQ)+' copies.');if(!(price>=1&&price<=500))return say('Set a price from $1 to $500.');
 const p=st();if(p.runs.some(r=>r.state==0&&r.alb==a.id&&r.fmt==f))return say('That album is already being pressed on '+FM[f].n+'. Wait for it to finish selling.');
 const fc=forecast(a,f,qty,price);if(S.money<fc.c.total){try{snd('err')}catch(e){}return say('Not enough money. This pressing costs '+fm(fc.c.total)+'.')}
 S.money=+(S.money-fc.c.total).toFixed(2);
 const dem=Math.max(0,Math.round(fc.base*(1-NOISE+Math.random()*2*NOISE)));
 p.runs.push({id:p.nid++,alb:a.id,fmt:f,qty,price,cost:fc.c.total,day:S.day,ready:S.day+FM[f].lead,dem,sold:0,rev:0,state:0,sg:0});
 p.cost+=fc.c.total;p.printed+=qty;try{updateVersion();snd('cash')}catch(e){}
 say('Ordered '+num(qty)+' '+FM[f].n+(f=='cd'?'s':' records')+' of "'+a.name+'" for '+fm(fc.c.total)+'. They arrive in '+FM[f].lead+(FM[f].lead>1?' days.':' day.'));pcR()}
const mail=b=>{try{if(Array.isArray(S.msgs))S.msgs.push({id:S.nid++,from:'WaveFern Team',body:b,state:9,unread:1,day:S.day})}catch(e){}};
/* each morning: sell what the days since the last visit would have sold, pay for it, and close finished runs */
function daily(){const p=st();p.runs.forEach(r=>{if(r.state!=0)return;const k=clamp(S.day-r.ready,0,WIN),a=albById(r.alb),nm=a?a.name:'your album',F=FM[r.fmt];
  if(!r.arr&&S.day>=r.ready){r.arr=1;mail('Your '+F.n+' pressing of "'+nm+'" has arrived: '+num(r.qty)+' copies at '+fm2(r.price)+'. Sales have started and run for '+WIN+' days. Open Label HQ, Vinyl & CD, to follow them.')}
  const total=Math.min(r.qty,Math.round(r.dem*(1+SGD*(r.sg||0)/r.qty))),sold=Math.min(total,Math.round(total*cumW(k))),d=sold-r.sold;
  if(d>0){const un=r.qty-r.sold,sa=Math.max(0,(r.sg||0)-(r.sgs||0)),ds=un>0?Math.min(d,sa,Math.round(d*sa/un)):0;r.sgs=(r.sgs||0)+ds;const e=+((d+ds*SGP)*r.price).toFixed(2);r.sold=sold;r.rev=+(r.rev+e).toFixed(2);S.money=+(S.money+e).toFixed(2);S.earn=+((S.earn||0)+e).toFixed(2);p.rev+=e;p.units+=d;p.sold[key(r.alb,r.fmt)]=(p.sold[key(r.alb,r.fmt)]||0)+d}
  if(k>=WIN){r.state=1;r.res={sold:r.sold,left:r.qty-r.sold,rev:r.rev,cost:r.cost,profit:+(r.rev-r.cost).toFixed(2)};
   mail('Pressing result for "'+nm+'" on '+F.n+': sold '+num(r.sold)+' of '+num(r.qty)+' copies at '+fm2(r.price)+'. Revenue '+fm(r.rev)+', cost '+fm(r.cost)+', '+(r.res.profit>=0?'profit '+fm(r.res.profit):'loss '+fm(-r.res.profit))+'.'+(r.res.left>0?' '+num(r.res.left)+' unsold copies were written off.':' Sold out.'))}})}
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{daily()}catch(e){console.error('label press',e)}return r}}
/* ---------- the page ---------- */
const sec=(t,meta,body)=>`<section class=lh-sec><div class=lh-sh><h2 class=lh-h2>${t}</h2>${meta?`<span class=lh-meta>${meta}</span>`:''}</div>${body}</section>`;
const kpi=(k,v,s)=>`<div class=lh-kpi><span>${k}</span><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`;
const money=n=>(n<0?'-':'')+fm(Math.abs(n));
function forecastHTML(a){if(!a)return'';const f=PRD.fmt,qty=Math.floor(+PRD.qty),price=+PRD.price;
 if(!(qty>=MINQ&&qty<=MAXQ&&price>=1))return`<p class=lh-mut>Enter between ${MINQ} and ${num(MAXQ)} copies and a price of at least $1.</p>`;
 const x=forecast(a,f,qty,price),m=x.mid,sell=Math.round(x.base),pos=m.profit>=0;
 const over=sell<qty*.8?`Fans would buy about <b>${num(sell)}</b>, so roughly <b>${num(Math.max(0,qty-sell))}</b> copies would be left unsold.`:sell>qty*1.15?`Demand looks higher than <b>${num(qty)}</b> copies, so you would sell out. A bigger run or a higher price would earn more.`:`Demand roughly matches the run.`;
 return`<dl class=lh-dl><div><dt>Cost</dt><dd>${fm(x.c.total)} <span class=lh-mut>(${fm(x.c.setup)} setup + ${fm2(x.c.unit)} a copy${x.c.disc>0?', '+Math.round(x.c.disc*100)+'% volume discount':''})</span></dd></div>
 <div><dt>Likely sales</dt><dd>${x.lo.sold==x.hi.sold?num(m.sold)+' copies (sell-out)':num(x.lo.sold)+' to '+num(x.hi.sold)+' copies, about '+num(m.sold)}</dd></div>
 <div><dt>Revenue</dt><dd>${x.lo.rev==x.hi.rev?fm(m.rev):fm(x.lo.rev)+' to '+fm(x.hi.rev)}</dd></div>
 <div><dt>Profit</dt><dd>${x.lo.profit==x.hi.profit?'<b>'+money(m.profit)+'</b>':'<b>'+money(x.lo.profit)+' to '+money(x.hi.profit)+'</b> <span class=lh-mut>(about '+money(m.profit)+')</span>'}</dd></div>
 <div><dt>Break-even</dt><dd>${isFinite(x.be)?num(x.be)+' copies sold at this price':'Price is below the unit cost'}</dd></div></dl>
 <p class="lh-pv ${pos?'':'lh-bad'}"><b>${x.verdict}.</b> ${over}${price>x.ref*1.4?' At '+fm2(price)+' fewer fans will pay; a fair price is about '+fm(x.ref)+'.':''}${x.P.pool<5?' This album has very few fans so far: streams and monthly listeners drive physical sales.':''}</p>`}
function runCard(r){const a=albById(r.alb),F=FM[r.fmt],wait=r.ready-S.day,k=clamp(S.day-r.ready,0,WIN);
 const stat=wait>0?`Arrives in ${wait} day${wait>1?'s':''}`:`Day ${k} of ${WIN} on sale`;
 return`<article class=lh-oc><div class=lh-oct><h3 class=lh-ocn>${esc(a?a.name:'Album')}</h3><span class=lh-tag>${F.n}</span></div>
 <div class=lh-ocf><div><span>Printed</span><b>${num(r.qty)} at ${fm2(r.price)}</b></div><div><span>Status</span><b>${stat}</b></div><div><span>Sold so far</span><b>${num(r.sold)} copies</b></div><div><span>Revenue so far</span><b>${fm(r.rev)} of ${fm(r.cost)} cost</b></div><div><span>Signed copies left</span><b>${num(Math.max(0,(r.sg||0)-(r.sgs||0)))}</b></div></div>${canSign(r)?`<div class=lh-ocb><button class="lh-btn pri" onclick="BRD.pressSign(${r.id})">Sign ${F.n=='CD'?'CDs':'vinyls'}</button></div>`:''}</article>`}
const canSign=r=>r.state==0&&S.day>=r.ready&&typeof signGame=='function'&&(r.qty-r.sold)-Math.max(0,(r.sg||0)-(r.sgs||0))>0;
BRD.pressSign=function(id){const r=st().runs.find(x=>x.id==id);if(!r||!canSign(r))return say('Nothing left to sign on this pressing.');const a=albById(r.alb),F=FM[r.fmt];
 const items=[];for(let i=0;i<SGN;i++)items.push({kind:r.fmt,art:{title:a?a.name:'Album',artist:S.artist||'Artist'}});
 signGame({items,title:'Sign your '+F.n+' copies of '+(a?a.name:'your album'),onDone:()=>{}}).then(res=>{try{if(!res||res.cancelled)return;
  const room=(r.qty-r.sold)-Math.max(0,(r.sg||0)-(r.sgs||0));let n=0;(res.items||[]).forEach(it=>{if(it.signed)n+=Math.round(SGC*(.5+.5*(+it.q||0)))});n=Math.min(n,Math.max(0,room));
  if(n>0){r.sg=(r.sg||0)+n;try{updateVersion()}catch(e){}say('Signed '+num(n)+' '+F.n+' copies. Signed copies sell for more.')}else say('No copies signed.');pcR()}catch(e){console.error('label press sign',e)}})};
function pastTable(rs){return`<table class=lh-t><thead><tr><th>Album</th><th>Format</th><th class=lh-r>Printed</th><th class=lh-r>Sold</th><th class=lh-r>Price</th><th class=lh-r>Revenue</th><th class=lh-r>Cost</th><th class=lh-r>Result</th></tr></thead><tbody>${rs.map(r=>{const a=albById(r.alb),p=r.res?r.res.profit:r.rev-r.cost;
 return`<tr><td>${esc(a?a.name:'Album')}</td><td>${FM[r.fmt].n}</td><td class=lh-r>${num(r.qty)}</td><td class=lh-r>${num(r.sold)}</td><td class=lh-r>${fm2(r.price)}</td><td class=lh-r>${fm(r.rev)}</td><td class=lh-r>${fm(r.cost)}</td><td class=lh-r><b>${p>=0?'Profit '+fm(p):'Loss '+fm(-p)}</b></td></tr>`}).join('')}</tbody></table>`}
BRD.press=function(){const p=st(),al=albums();ensure();const act=p.runs.filter(r=>r.state==0),past=p.runs.filter(r=>r.state==1).reverse(),last=past[0];
 const profit=p.rev-p.runs.filter(r=>r.state==1||r.sold>0).reduce((t,r)=>t+r.cost,0);
 let h=`<header class=lh-ph><h1 class=lh-h1>Vinyl and CD pressing</h1><p class=lh-lede>Press physical copies of your albums. You choose the format, how many to make and the price. Fans of the album decide how many sell, so printing too many for your audience, or charging too much, loses money.</p></header>`;
 h+=`<div class=lh-kpis>${kpi('Copies printed',num(p.printed))}${kpi('Copies sold',num(p.units))}${kpi('Revenue',fm(p.rev))}${kpi('Profit so far',money(profit),'sales minus pressing costs')}</div>`;
 if(last){const r=last.res||{profit:last.rev-last.cost},a=albById(last.alb);h+=sec('Latest result',esc(a?a.name:'Album')+' · '+FM[last.fmt].n,`<div class=lh-sum><p class=lh-big>${r.profit>=0?'Profit '+fm(r.profit):'Loss '+fm(-r.profit)}</p><p class=lh-mut>Sold ${num(last.sold)} of ${num(last.qty)} copies at ${fm2(last.price)}. Revenue ${fm(last.rev)}, cost ${fm(last.cost)}.${last.qty-last.sold>0?' '+num(last.qty-last.sold)+' unsold copies were written off.':' Sold out.'}</p></div>`)}
 if(!al.length)return h+sec('New pressing','',`<p class=lh-empty>You need a released album first. Make one in the My Songs app by picking at least 2 released songs.</p>`);
 const a=albById(PRD.alb),f=PRD.fmt;
 const cov=typeof cover=='function'&&a?(()=>{try{return`<img class=lh-pcv src="${cover(a)}" alt="" width=96 height=96>`}catch(e){return''}})():'';
 const form=`<div class=lh-pform>${cov}<label>Album<select onchange="BRD.pressSet('alb',this.value)">${al.map(x=>`<option value="${x.id}"${x.id==PRD.alb?' selected':''}>${esc(x.name)} (${(x.songs||[]).length} songs)</option>`).join('')}</select></label>
 <div class=lh-pfmt role=group aria-label="Format">${Object.keys(FM).map(k=>`<button class="${f==k?'on':''}" onclick="BRD.pressSet('fmt','${k}')">${FM[k].n}<em>fair price ${fm(FM[k].ref)}</em></button>`).join('')}</div>
 <label>Copies to press<input type=number min=${MINQ} max=${MAXQ} step=10 value="${PRD.qty}" oninput="BRD.pressIn('qty',this.value)"></label>
 <label>Price per copy ($)<input type=number min=1 max=500 step=1 value="${PRD.price}" oninput="BRD.pressIn('price',this.value)"></label></div>`;
 h+=sec('New pressing',FM[f].n+' arrives in '+FM[f].lead+' day'+(FM[f].lead>1?'s':'')+', then sells for '+WIN+' days',`<div class=lh-two><div>${form}</div><div><div id=lhpfv>${forecastHTML(a)}</div><button id=lhpgo class="lh-btn pri" onclick="BRD.pressGo()">Order pressing</button></div></div>`);
 if(act.length)h+=sec('In production and on sale',act.length+(act.length==1?' pressing':' pressings'),`<div class=lh-ocs>${act.map(runCard).join('')}</div>`);
 if(past.length)h+=sec('Past pressings',past.length+(past.length==1?' pressing':' pressings'),`<div class=lh-tw>${pastTable(past)}</div>`);
 return h};
/* inputs update the forecast without redrawing the page, so typing never loses focus */
BRD.pressIn=(k,v)=>{PRD[k]=+v;const el=document.getElementById('lhpfv');if(el)el.innerHTML=forecastHTML(albById(PRD.alb))};
BRD.pressSet=(k,v)=>{if(k=='fmt'){if(PRD.fmt!=v){PRD.fmt=v;PRD.price=FM[v].ref}}else PRD[k]=+v;pcR()};
BRD.pressGo=()=>{try{order()}catch(e){console.error('label press',e)}};
BRD.pressModel={forecast,costOf,poolOf,priceMult,cumW,FM,WIN};
{const s=document.createElement('style');s.textContent=`#pc .lhq .lh-pform{display:grid;gap:16px;max-width:460px}
#pc .lhq .lh-pform label{display:grid;gap:6px;font-size:12.5px;color:var(--mu)}
#pc .lhq .lh-pform select,#pc .lhq .lh-pform input{font:400 15px var(--sans);color:var(--ink);background:var(--bg);border:1px solid var(--ln2);border-radius:0;padding:10px 12px;width:100%;box-sizing:border-box}
#pc .lhq .lh-pform select:focus,#pc .lhq .lh-pform input:focus{outline:1px solid var(--ink);outline-offset:1px}
#pc .lhq .lh-pcv{width:96px;height:96px;image-rendering:pixelated;border:1px solid var(--ln)}
#pc .lhq .lh-pfmt{display:flex;gap:12px}
#pc .lhq .lh-pfmt button{all:unset;cursor:pointer;flex:1;box-sizing:border-box;border:1px solid var(--ln2);padding:10px 12px;font:700 14px var(--sans);color:var(--ink);display:grid;gap:2px}
#pc .lhq .lh-pfmt button em{font:400 12px var(--sans);font-style:normal;color:var(--mu)}
#pc .lhq .lh-pfmt button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}#pc .lhq .lh-pfmt button.on em{color:var(--ln2)}
#pc .lhq .lh-pv{margin:16px 0 20px;font-size:14px;line-height:1.55;color:var(--mu);max-width:520px}#pc .lhq .lh-pv b{color:var(--ink)}
#pc .lhq .lh-pv.lh-bad{border-left:2px solid var(--ink);padding-left:12px}
#pc .lhq #lhpfv .lh-dl{display:block;border-top:1px solid var(--ink);margin:0}
#pc .lhq #lhpfv .lh-dl>div{display:flex;justify-content:space-between;align-items:baseline;gap:20px;padding:11px 0;border:0;border-bottom:1px solid var(--ln);font-size:14px}
#pc .lhq #lhpfv .lh-dl dt{font-size:12.5px;color:var(--mu);white-space:nowrap;margin:0}#pc .lhq #lhpfv .lh-dl dd{margin:0;text-align:right}
#pc .lhq #lhpgo{margin-top:4px}`;document.head.appendChild(s)}
})();
