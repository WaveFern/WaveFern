/* ===== v51.0.0: brand sponsorships (Label HQ app) =====
   Companies based on real brands (Converse, Monster Energy, Ray-Ban, Supreme, Levi's, Beats, Pepsi, Adidas, Coca-Cola, Samsung,
   Nike, Gucci, Apple, Louis Vuitton) write to you in Messages, less often than artists. Their profile picture is their logo,
   drawn on a canvas here (no images are fetched). Bigger brands need a higher Fame Level (BRD.tiers).
   - rarity: each morning a 12% chance, never within 8 days of the last offer, never while a deal is open. Needs Fame Level 20,
     an artist name and a song. The first offer also adds the free Label HQ app to your computer.
   - the Label HQ app (82-label-hq.js, gated by 101/106) has a Brand deals tab (offers, the active job, past deals, the brand
     roster) next to the old Team tab (record-label upgrades, still off until labels return).
   - a deal is one photoshoot day. Pay = a multiple of your last 30 days of income with a floor per tier, then +-25% by how well
     the shoot went. Offers stand for 4 days. Some (from Fame Level 45, 38% of offers) are trips: the brand books you a Swiftwing
     flight to one of the world-tour places. Accept and you get a free, checked-in ticket on the next flight from home that
     leaves at least 90 minutes from now (usually today). After you land and reach the city, a company car takes you to the studio
     (224-brand-studio.js). When the shoot is done the brand books a free flight home.
   State: S.brands={last,list:[{id,b:brandId,k:'home'|'trip',d:destId,pay,exp,st,due,tk,brief:{mood,light},res}],done,earned}
     st: 0 offer, 1 accepted (shoot to do), 2 declined, 3 done, 4 expired, 5 failed (missed flight or ran out of time). */
(function(){
const fm=n=>'$'+Math.round(n).toLocaleString('en-US');
const fl=()=>{try{return fameLevel()||0}catch(e){return 0}};
const BRD=window.BRD={};

/* ---------- brands and their logos ---------- */
const FAME=[20,60,110,170,240],FLOOR=[2000,6000,18000,60000,180000],TRIP_FAME=45,TRIP_P=.38,CHANCE=.12,COOL=8,EXPIRE=4,TICKET_LEAD=90;
const STAR=(x,cx,cy,r,ri)=>{x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?ri:r;x[i?'lineTo':'moveTo'](cx+Math.cos(a)*q,cy+Math.sin(a)*q)}x.closePath()};
const POLY=(x,pts)=>{x.beginPath();pts.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0],p[1]));x.closePath()};
const TXT=(x,t,cx,cy,font,col,ls)=>{x.font=font;x.fillStyle=col;x.textAlign='center';x.textBaseline='middle';if(ls&&'letterSpacing' in x)x.letterSpacing=ls+'px';x.fillText(t,cx,cy);if('letterSpacing' in x)x.letterSpacing='0px'};
/* every logo is drawn on a 64x64 grid */
const BR=[
 {id:'converse',n:'Converse',t:0,cat:'sneaker',bg:'#f4f1ea',c:'#d4202c',p(x){x.fillStyle='#111';x.beginPath();x.arc(32,32,25,0,7);x.fill();x.fillStyle='#f4f1ea';x.beginPath();x.arc(32,32,21,0,7);x.fill();x.fillStyle='#111';STAR(x,32,33,14,5.6);x.fill();x.fillStyle='#d4202c';x.fillRect(7,28,8,3);x.fillRect(49,28,8,3);x.fillStyle='#1c3f94';x.fillRect(7,33,8,3);x.fillRect(49,33,8,3)}},
 {id:'monster',n:'Monster Energy',t:0,cat:'drink',bg:'#0b0b0b',c:'#95d600',p(x){x.fillStyle='#95d600';[0,1,2].forEach(i=>{const a=11+i*15;POLY(x,[[a,7],[a+9,12],[a+8,38+i*2],[a+12,57],[a+2,50],[a-3,34]]);x.fill()})}},
 {id:'rayban',n:'Ray-Ban',t:0,cat:'eyewear',bg:'#16161a',c:'#d71920',p(x){x.fillStyle='#d71920';x.beginPath();x.ellipse(32,32,29,18,0,0,7);x.fill();TXT(x,'Ray-Ban',32,33,'italic 700 14px Georgia,serif','#fff')}},
 {id:'supreme',n:'Supreme',t:0,cat:'streetwear',bg:'#da1f26',c:'#da1f26',p(x){TXT(x,'Supreme',32,33,'italic 800 16px "Arial Black",Arial,sans-serif','#fff',-.3)}},
 {id:'levis',n:"Levi's",t:1,cat:'denim',bg:'#c41230',c:'#c41230',p(x){x.strokeStyle='#fff';x.lineWidth=2.2;x.setLineDash([3,2.4]);x.beginPath();x.moveTo(8,14);x.quadraticCurveTo(32,46,56,14);x.stroke();x.setLineDash([]);TXT(x,"Levi's",32,44,'italic 800 15px Georgia,serif','#fff')}},
 {id:'beats',n:'Beats by Dre',t:1,cat:'audio',bg:'#f2f2f2',c:'#e01a2d',p(x){x.fillStyle='#e01a2d';x.beginPath();x.arc(32,32,26,0,7);x.fill();TXT(x,'b',32,35,'800 44px "Arial Rounded MT Bold",Arial,sans-serif','#fff')}},
 {id:'pepsi',n:'Pepsi',t:1,cat:'drink',bg:'#f6f8fb',c:'#0a4a96',p(x){x.save();x.beginPath();x.arc(32,32,26,0,7);x.clip();x.fillStyle='#e32934';x.fillRect(0,0,64,64);x.fillStyle='#0a4a96';x.beginPath();x.moveTo(0,64);x.lineTo(0,38);x.bezierCurveTo(18,22,38,52,64,26);x.lineTo(64,64);x.fill();x.strokeStyle='#fff';x.lineWidth=5;x.beginPath();x.moveTo(0,38);x.bezierCurveTo(18,22,38,52,64,26);x.stroke();x.restore()}},
 {id:'adidas',n:'Adidas',t:2,cat:'sportswear',bg:'#ffffff',c:'#111',p(x){x.fillStyle='#111';[0,1,2].forEach(i=>{const a=9+i*14,h=14+i*10;POLY(x,[[a,50],[a+9,50],[a+9+h*.5,50-h],[a+h*.5,50-h]]);x.fill()})}},
 {id:'cocacola',n:'Coca-Cola',t:2,cat:'drink',bg:'#e41e2b',c:'#e41e2b',p(x){TXT(x,'Coca-Cola',32,31,'italic 700 17px "Brush Script MT","Segoe Script","Snell Roundhand",cursive','#fff');x.strokeStyle='#fff';x.lineWidth=1.6;x.beginPath();x.moveTo(8,41);x.bezierCurveTo(24,50,42,34,57,43);x.stroke()}},
 {id:'samsung',n:'Samsung',t:2,cat:'tech',bg:'#f4f6fb',c:'#1428a0',p(x){x.fillStyle='#1428a0';x.beginPath();x.ellipse(32,32,30,12.5,0,0,7);x.fill();TXT(x,'SAMSUNG',32,33,'800 9.6px Arial,sans-serif','#fff',.4)}},
 {id:'nike',n:'Nike',t:3,cat:'sportswear',bg:'#f4f4f1',c:'#111',p(x){x.fillStyle='#111';x.beginPath();x.moveTo(5,35);x.bezierCurveTo(13,48,28,50,39,41);x.bezierCurveTo(47,35,53,27,59,18);x.bezierCurveTo(50,25,41,29,32,32);x.bezierCurveTo(22,36,13,37,5,35);x.fill()}},
 {id:'gucci',n:'Gucci',t:3,cat:'luxury',bg:'#0f3d2e',c:'#c9a24b',p(x){TXT(x,'GUCCI',32,29,'700 14px Georgia,"Times New Roman",serif','#e2c06a',1.4);x.fillStyle='#0f3d2e';x.fillRect(8,41,48,4);x.fillStyle='#b5172a';x.fillRect(8,43.2,48,1.6);x.fillStyle='#e2c06a';x.fillRect(8,40,48,.8);x.fillRect(8,45.2,48,.8)}},
 {id:'apple',n:'Apple',t:4,cat:'tech',bg:'#f2f2f4',c:'#111',p(x){x.fillStyle='#111';x.beginPath();x.arc(26,38,15,0,7);x.arc(38,38,15,0,7);x.fill();x.fillRect(27,25,10,12);x.fillStyle='#f2f2f4';x.beginPath();x.arc(52,31,7.5,0,7);x.fill();x.fillStyle='#111';x.save();x.translate(35,15);x.rotate(-.7);x.beginPath();x.ellipse(0,0,8,3.6,0,0,7);x.fill();x.restore()}},
 {id:'lv',n:'Louis Vuitton',t:4,cat:'luxury',bg:'#4a2e18',c:'#c9a24b',p(x){x.fillStyle='#d8b45e';[[10,10],[54,10],[10,54],[54,54],[32,6],[32,58],[6,32],[58,32]].forEach(q=>{STAR(x,q[0],q[1],4.2,1.5);x.fill()});TXT(x,'LV',32,33,'700 28px Georgia,serif','#e2c06a')}}];
BRD.brands=BR;BRD.tiers=FAME;
BRD.by=id=>BR.find(b=>b.id==id)||BR[0];
const LC={};
BRD.logo=function(id,px){const k=id+'|'+(px||64);if(LC[k])return LC[k];const b=BRD.by(id),s=px||64,c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');
 x.scale(s/64,s/64);x.fillStyle=b.bg;x.fillRect(0,0,64,64);try{b.p(x)}catch(e){}return LC[k]=c.toDataURL()};
/* draw a logo onto any canvas context (the studio sets use it) */
BRD.paint=function(x,id,px,py,s){const b=BRD.by(id);x.save();x.translate(px,py);x.scale(s/64,s/64);x.fillStyle=b.bg;x.fillRect(0,0,64,64);try{b.p(x)}catch(e){}x.restore()};

/* ---------- state ---------- */
function st(){if(!S.brands||typeof S.brands!='object')S.brands={last:-999,list:[],done:0,earned:0};const b=S.brands;if(!Array.isArray(b.list))b.list=[];if(!(b.done>=0))b.done=0;if(!(b.earned>=0))b.earned=0;if(typeof b.last!='number')b.last=-999;return b}
BRD.st=st;st();
const job=id=>st().list.find(o=>o.id===id);
BRD.job=job;
BRD.active=()=>st().list.find(o=>o.st==1)||null;
BRD.open=()=>st().list.filter(o=>o.st==0&&S.day<=o.exp);
BRD.mood=['Confident','Playful','Candid','Cool','Hero'];
BRD.light=['Warm','Cool','Neon','Mono'];

function monthly(){const h=Array.isArray(S.hist)?S.hist:[];let t=0;for(let i=h.length-1;i>=0&&h[i].d>S.day-31;i--)t+=+h[i].e||0;return t}
function pickBrand(){const L=fl(),last=(st().list.slice(-1)[0]||{}).b,pool=[];BR.forEach(b=>{if(FAME[b.t]<=L&&b.id!=last)for(let i=0;i<1+b.t;i++)pool.push(b)});return pool.length?pool[Math.floor(Math.random()*pool.length)]:null}
function pickDest(){try{if(typeof WT_DEST=='undefined'||!Array.isArray(WT_DEST)||!WT_DEST.length)return null;return WT_DEST[Math.floor(Math.random()*WT_DEST.length)]}catch(e){return null}}
const placeOf=id=>{try{return id&&id!='home'?wtPlace(wtDest(id)):'your home city'}catch(e){return'abroad'}};
BRD.place=o=>o.k=='trip'?placeOf(o.d):'your home city';
const CAMP={sneaker:'sneaker',drink:'summer drinks',eyewear:'eyewear',streetwear:'streetwear drop',denim:'denim',audio:'headphone',sportswear:'sportswear',tech:'tech',luxury:'luxury'};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function mk(){const s=st(),b=pickBrand();if(!b)return;const trip=fl()>=TRIP_FAME&&Math.random()<TRIP_P,d=trip?pickDest():null,k=d?'trip':'home';
 const pay=Math.max(FLOOR[b.t],Math.round(monthly()*(.8+Math.random()*.8)/100)*100)*(k=='trip'?1.3:1),
  o={id:S.nid++,b:b.id,k,d:d?d.id:null,pay:Math.round(pay/100)*100,exp:S.day+EXPIRE,st:0,due:0,brief:{mood:pick(BRD.mood),light:pick(BRD.light)}};
 s.list.push(o);s.last=S.day;if(s.list.length>24)s.list=s.list.filter(q=>q.st<2||q.st==3&&q.res).slice(-24);
 const pl=BRD.place(o),open=(S.artist||'there');
 const A=['Hi '+open+', it is the partnerships team at '+b.n+'. ','Hello '+open+'. '+b.n+' here (partnerships). '];
 let t=pick(A)+'We have watched you rise to Fame Level '+fl()+' and we want you as the face of our next '+CAMP[b.cat]+' campaign. It is one photoshoot day. Fee: '+fm(o.pay)+', paid when the shoot wraps, and the photos go on your Instagrime tagged as a partnership. ';
 t+=k=='trip'?'The shoot is in '+pl+'. We book and pay your Swiftwing flight and a car in the city, and you fly the next flight out as soon as you accept. ':'The studio is here in your home city and a car will take you there. ';
 t+='Our brief: a '+o.brief.mood.toLowerCase()+' mood with '+o.brief.light.toLowerCase()+' lighting. This offer stands for '+EXPIRE+' days.';
 S.msgs.push({id:S.nid++,from:b.n+' Partnerships',state:9,unread:1,day:S.day,bd:o.id,body:t});
 if(!S.apps)S.apps={};if(!S.apps.hq){S.apps.hq=1;try{say('Label HQ was added to your computer for brand deals.')}catch(e){}}
 try{snd('ping');say(b.n+' wants to sponsor you. Check Messages.')}catch(e){}try{updateVersion()}catch(e){}}

/* ---------- flights: a free, checked-in ticket on the company ---------- */
const T=()=>window.TRAVEL;
function giveTicket(f,co){const t=T().st(),id='T'+(t.nid++),r=3+Math.floor(Math.random()*18),seat=r+'ABCDEF'[Math.floor(Math.random()*6)],
 tk={id,fl:f.fl,from:f.from,to:f.to,dep:f.dep,arr:f.arr,hrs:f.hrs,gate:f.gate,seat,price:0,st:'booked',bd:S.day,ck:1,bt:0,co};t.tickets.push(tk);return tk}
function flightFor(from,to,lead){const n=T().now();return T().upcoming(from,80).find(f=>f.to==to&&f.dep>=n+lead)||null}
BRD.dayWord=f=>{const d=T().dayOf(f.dep)-T().dayOf(T().now());return d<=0?'today':d==1?'tomorrow':'in '+d+' days'};

/* ---------- accept / decline ---------- */
function note(o,body){const b=BRD.by(o.b);S.msgs.push({id:S.nid++,from:b.n+' Partnerships',state:9,unread:1,day:S.day,bd:o.id,body})}
window.bdAccept=function(id){const o=job(id);if(!o||o.st!=0)return;
 if(S.day>o.exp){o.st=4;return pcR()}
 if(BRD.active()){snd('err');return say('You already have a brand shoot to finish.')}
 const b=BRD.by(o.b);
 if(o.k=='trip'){
  if(!T()||T().abroad()){snd('err');return say('You are abroad. Fly home first, then accept this trip.')}
  const f=flightFor('home',o.d,TICKET_LEAD);if(!f){snd('err');return say('No flight to '+placeOf(o.d)+' is free for the next few days. Try again later.')}
  const tk=giveTicket(f,o.b);o.tk=tk.id;o.due=S.day+3;o.st=1;
  note(o,'Confirmed. Your '+tk.fl+' ticket to '+placeOf(o.d)+' is booked and checked in: Gate '+tk.gate+', seat '+tk.seat+', boarding '+T().hm(tk.dep-120)+', gate closes '+T().hm(tk.dep-10)+' ('+BRD.dayWord(f)+'). Be at the airport. A car meets you in the city. Miss the gate and we have to give the slot to another artist.');
  try{glCard('BRAND FLIGHT · '+tk.fl,T().code(tk.from)+' ✈ '+T().code(tk.to),'Paid by '+b.n+' · Gate '+tk.gate+' · boards '+T().hm(tk.dep-120)+' · closes '+T().hm(tk.dep-10))}catch(e){}
  say(b.n+' booked you on '+tk.fl+' to '+placeOf(o.d)+' ('+BRD.dayWord(f)+'). Head to the airport.');
 }else{
  o.st=1;o.due=S.day+4;
  note(o,'Confirmed. The studio is ready for you. Open Label HQ and press Go to the studio when you are ready (within '+4+' days). Brief: '+o.brief.mood.toLowerCase()+' mood, '+o.brief.light.toLowerCase()+' lighting.');
  say('Deal accepted. Open Label HQ to go to the studio.');
 }
 snd('chime');try{updateVersion()}catch(e){}pcR()};
window.bdDecline=function(id){const o=job(id);if(!o||o.st!=0)return;o.st=2;snd('pop');pcR()};

/* ---------- each morning: new offers, expiry ---------- */
function daily(){const s=st();
 s.list.forEach(o=>{if(o.st==0&&S.day>o.exp)o.st=4;
  if(o.st==1&&S.day>o.due){o.st=5;note(o,'We could not wait any longer and booked another artist for this campaign. We hope to work with you again.')}});
 if(!(S.artist&&fl()>=FAME[0]&&S.songs&&S.songs.length))return;
 if(s.list.some(o=>o.st==0||o.st==1)||S.day-s.last<COOL||Math.random()>CHANCE)return;mk()}
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{daily()}catch(e){console.error('brand deals',e)}return r}}
/* a lost ticket loses the job */
{const tr=window.TRAVEL;if(tr&&tr.on)tr.on('missed',tk=>{try{const o=tk&&st().list.find(q=>q.st==1&&q.tk===tk.id);if(o){o.st=5;note(o,'You missed the flight, so we gave the shoot to another artist. Next time, be at the gate before it closes.')}}catch(e){}})}
BRD.failCheck=function(){const tr=T();if(!tr)return;st().list.forEach(o=>{if(o.st==1&&o.k=='trip'&&o.tk){const k=tr.st().tickets.find(q=>q.id===o.tk);if(k&&(k.st=='cancelled'||k.st=='missed')&&!BRD.shootOn){o.st=5;note(o,'The flight did not happen, so we gave the shoot to another artist.')}}})};
setInterval(()=>{try{BRD.failCheck()}catch(e){}},2000);

/* ---------- Messages: logo as the profile picture, Accept / Decline buttons ---------- */
{const pm=PA.msg;PA.msg=function(){let h=pm.apply(this,arguments);if(typeof h!='string')return h;
 try{const L=S.msgs.filter(m=>m.bd!=null);
  L.forEach(m=>{const o=job(m.bd);if(!o)return;const lg=BRD.logo(o.b,48);
   h=h.replace(new RegExp('(onclick="openChat\\('+m.id+'\\)">)<img src="[^"]*"'),'$1<img src="'+lg+'" style="border-radius:50%"');
   if(S.chat==m.id){h=h.replace(/(<div class=cvh>)<img src="[^"]*"/,'$1<img src="'+lg+'" style="border-radius:50%"');
    const b=BRD.by(o.b),sub=b.n+' · official brand account';h=h.replace(/(<div class=cvh>[\s\S]*?<br><small[^>]*>)[^<]*/,'$1'+sub);
    if(o.st==0&&S.day<=o.exp)h=h.replace(/<div class=cin><small[^>]*>Official account\. No replies\.<\/small><\/div>/,`<div class=cin style="gap:8px;padding:8px"><button class=go onclick="bdAccept(${o.id})">Accept ${fm(o.pay)} shoot${o.k=='trip'?' + flight':''}</button><button onclick="bdDecline(${o.id})">Decline</button></div>`);
    else if(o.st==1&&o.k=='home')h=h.replace(/<div class=cin><small[^>]*>Official account\. No replies\.<\/small><\/div>/,`<div class=cin style="gap:8px;padding:8px"><button class=go onclick="BRD.go(${o.id})">Go to the studio</button></div>`);
    else h=h.replace(/Official account\. No replies\./,o.st==2?'You declined this offer.':o.st==3?'Shoot done. Thanks!':o.st==1?'Deal accepted. Fly to the shoot.':o.st==5?'This deal has fallen through.':o.st==4?'This offer has expired.':'Official account. No replies.')}})}catch(e){console.error('brand msg',e)}
 return h}}

/* ---------- Label HQ: Brand deals tab ---------- */
let HQT='deals';window.bdTab=t=>{HQT=t;pcR()};
const css=document.createElement('style');css.textContent=`.bdw .bdtabs{display:flex;gap:6px;margin:6px 0 10px}.bdw .bdtabs button{padding:6px 12px}.bdw .bdtabs button.on{background:var(--g);color:#04120a;font-weight:700}
.bdw .bdban{width:100%;max-width:640px;display:block;image-rendering:pixelated;border:2px solid #000;border-radius:6px;box-shadow:0 4px 0 #0008}
.bdw .bdrow{display:flex;gap:10px;align-items:center;background:#151a17;border-radius:6px;padding:10px;margin:8px 0;max-width:640px}.bdw .bdrow img.lg{width:52px;height:52px;border-radius:50%;border:2px solid #000;flex:none}
.bdw .bdrow .tx{flex:1;min-width:0}.bdw .bdrow .tx b{font-size:15px}.bdw .bdrow .tx small{display:block;color:var(--m)}.bdw .bdrow .bt{display:flex;gap:6px;flex-wrap:wrap}
.bdw .bdrow.act{box-shadow:inset 0 0 0 2px #e6b422}.bdw .bdg{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px;max-width:640px}.bdw .bdg div{text-align:center;background:#151a17;border-radius:6px;padding:8px 4px;font-size:11px}
.bdw .bdg img{width:44px;height:44px;border-radius:50%;border:2px solid #000;display:block;margin:0 auto 4px}.bdw .bdg .lk img{filter:grayscale(1) brightness(.5)}.bdw .bdg small{display:block;color:var(--m)}
.bdw .bdst{display:flex;gap:14px;flex-wrap:wrap;margin:8px 0}.bdw .bdst span{background:#151a17;border-radius:6px;padding:6px 10px}.bdw .bdst b{color:var(--g)}.bdw h3{margin:14px 0 4px;font-size:13px;color:#e6b422}`;document.head.appendChild(css);
const STT=['Offer','In progress','Declined','Done','Expired','Fell through'];
function row(o,btns){const b=BRD.by(o.b);return`<div class="bdrow${o.st==1?' act':''}"><img class=lg src="${BRD.logo(o.b,64)}"><div class=tx><b>${esc(b.n)}</b> <small style="display:inline">${esc(b.cat)} campaign · ${o.k=='trip'?'trip to '+esc(BRD.place(o)):'home city studio'}</small><small>${fm(o.pay)} · brief: ${o.brief.mood} mood, ${o.brief.light} light${o.st==0?' · expires Day '+o.exp:o.st==1?(o.k=='trip'?' · flight is booked':' · do it by Day '+o.due):''}${o.st>=2?' · '+STT[o.st]+(o.res?' · paid '+fm(o.res.pay):''):''}</small></div>${btns?`<div class=bt>${btns}</div>`:''}</div>`}
function dealsTab(){const s=st(),L=fl(),act=BRD.active(),offs=BRD.open(),past=s.list.filter(o=>o.st>=2).slice(-6).reverse();
 let h=`<div class=hqx>${BRD.facade?`<img class=bdban src="${BRD.facade(act?act.b:null,act&&act.k=='trip'?BRD.place(act):null)}">`:''}<div class=bdst><span>Brand shoots <b>${s.done}</b></span><span>Earned <b>${fm(s.earned)}</b></span><span>Fame Level <b>${L}</b></span></div>`;
 h+='<h3>Active</h3>';
 if(act){const tk=act.k=='trip'&&T()?T().st().tickets.find(q=>q.id===act.tk):null,here=act.k=='trip'?T().loc()==act.d:1;
  h+=row(act,act.k=='home'?`<button class=go onclick="BRD.go(${act.id})">Go to the studio</button>`:here?`<button class=go onclick="BRD.go(${act.id})">Go to the studio</button>`:`<small class=m>${tk&&tk.st=='booked'?'Flight '+esc(tk.fl)+' · Gate '+tk.gate+' · closes '+T().hm(tk.dep-10):'Fly to '+esc(BRD.place(act))}</small>`)}
 else h+='<p class=m>No shoot booked.</p>';
 h+='<h3>Offers</h3>'+(offs.length?offs.map(o=>row(o,`<button class=go onclick="bdAccept(${o.id})">Accept</button><button onclick="bdDecline(${o.id})">Decline</button>`)).join(''):`<p class=m>${L<FAME[0]?'Brands start writing at Fame Level '+FAME[0]+'.':'No offers right now. Brands write now and then as your fame grows.'}</p>`);
 if(past.length)h+='<h3>Past deals</h3>'+past.map(o=>row(o)).join('');
 h+='<h3>Brands</h3><div class=bdg>'+BR.map(b=>{const lk=FAME[b.t]>L;return`<div class="${lk?'lk':''}"><img src="${BRD.logo(b.id,64)}"><b>${esc(b.n)}</b><small>${lk?'Fame '+FAME[b.t]:'Open'}</small></div>`}).join('')+'</div></div>';return h}
function teamSoon(){return`<div class=hqx><div class=card style="max-width:420px"><b style="font-size:15px;color:#e6b422">Team upgrades are coming soon</b><p class=m>The manager, producer, studio build-out, PR team and marketing upgrades belong to record labels. Labels are not open yet.</p></div></div>`}
{const h0=PA.hq;PA.hq=function(){
 const labels=typeof LABELS_ENABLED!='undefined'&&LABELS_ENABLED,tabs=`<div class=bdtabs><button class="${HQT=='deals'?'on':''}" onclick="bdTab('deals')">Brand deals</button><button class="${HQT=='team'?'on':''}" onclick="bdTab('team')">Team</button></div>`;
 let body;try{body=HQT=='team'?(labels?h0.apply(this,arguments):teamSoon()):dealsTab()}catch(e){console.error('label hq',e);body='<p class=m>Label HQ hit a problem. Close and open it again.</p>'}
 return`<div class="bdw"><h1 style="margin:0 0 4px"><img src="${IC.hq}" style="width:32px;image-rendering:pixelated;vertical-align:middle"> Label HQ</h1>${tabs}${body}</div>`}}
{const s0=PA.store;PA.store=function(){return s0.apply(this,arguments).replace(/(onclick="inst\('hq'\)">)[^<]*</,'$1Get · Free<')}}
{const o0=openPC;openPC=function(){HQT='deals';return o0.apply(this,arguments)}}
{const lc=loadCode;loadCode=function(){const r=lc.apply(this,arguments);try{st()}catch(e){}return r}}
})();
