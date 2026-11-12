/* ===== v51.0.0: brand sponsorships (Label HQ app) =====
   Companies with parody names of real brands (Conversa, Monstar Energy, Ray-Bam, Supremo, Leevi's, Beatz by Dro, Pepzi, Adadas,
   Koka-Cola, Samsong, Nyke, Guchi, Appel, Lewis Vitton) write to you in Messages, less often than artists. Their profile picture is their logo,
   drawn on a canvas here (no images are fetched). Bigger brands need a higher Fame Level (BRD.tiers).
   - rarity: each morning a 12% chance, never within 8 days of the last offer, never while a deal is open. Needs Fame Level 20,
     an artist name and a song. Label HQ is not in the App Barn: the first offer's chat has a Download Label HQ link.
   - the Label HQ app (82-label-hq.js, gated by 101/106) is the Brand deals app (offers, the active job, past deals, the brand
     roster). The record-label team upgrades live in each label's own app (225-label-apps.js).
   - a deal is one photoshoot day at the brand's own HQ, which is always in another country (BRD.hq has each brand's city). Pay = a
     multiple of your last 30 days of income with a floor per tier, then +-25% by how well the shoot went. Offers stand for 4 days.
     Accept and the brand books and pays everything: a free, checked-in Swiftwing ticket on the next flight from home that leaves
     at least 90 minutes from now, a company car in the city, and the flight home. The HQ is a real walkable building with its
     own look and its own studio inside (225-brand-hq.js); the photoshoot itself is in 224-brand-studio.js.
   State: S.brands={last,list:[{id,b:brandId,k:'trip',d:destId,pay,exp,st,due,tk,brief:{mood,light},res}],done,earned}
     st: 0 offer, 1 accepted (shoot to do), 2 declined, 3 done, 4 expired, 5 failed (missed flight or ran out of time). */
(function(){
const fm=n=>'$'+Math.round(n).toLocaleString('en-US');
const fl=()=>{try{return fameLevel()||0}catch(e){return 0}};
const BRD=window.BRD={};

/* ---------- brands and their logos ---------- */
const FAME=[20,60,110,170,240],FLOOR=[2000,6000,18000,60000,180000],TRIP_FAME=45,TRIP_P=.38,CHANCE=.12,COOL=8,EXPIRE=4,TICKET_LEAD=90;
const HQC={converse:'tor',monster:'la',rayban:'bcn',supreme:'nyc',levis:'bue',beats:'mel',pepsi:'rio',adidas:'ber',cocacola:'jnb',samsung:'sel',nike:'lon',gucci:'rom',apple:'sha',lv:'par'};
const STAR=(x,cx,cy,r,ri)=>{x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?ri:r;x[i?'lineTo':'moveTo'](cx+Math.cos(a)*q,cy+Math.sin(a)*q)}x.closePath()};
const POLY=(x,pts)=>{x.beginPath();pts.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0],p[1]));x.closePath()};
const TXT=(x,t,cx,cy,font,col,ls)=>{x.font=font;x.fillStyle=col;x.textAlign='center';x.textBaseline='middle';if(ls&&'letterSpacing' in x)x.letterSpacing=ls+'px';x.fillText(t,cx,cy);if('letterSpacing' in x)x.letterSpacing='0px'};
/* every logo is drawn on a 64x64 grid */
const BR=[
 {id:'converse',n:'Conversa',t:0,cat:'sneaker',bg:'#f4f1ea',c:'#d4202c',p(x){x.fillStyle='#1c3f94';POLY(x,[[32,5],[59,32],[32,59],[5,32]]);x.fill();x.fillStyle='#f4f1ea';POLY(x,[[32,11],[53,32],[32,53],[11,32]]);x.fill();x.fillStyle='#d4202c';STAR(x,32,33,13,5.2);x.fill();x.fillStyle='#1c3f94';x.fillRect(27,30,10,2)}},
 {id:'monster',n:'Monstar Energy',t:0,cat:'drink',bg:'#0b0b0b',c:'#95d600',p(x){x.fillStyle='#95d600';STAR(x,32,32,26,10);x.fill();x.fillStyle='#0b0b0b';x.beginPath();x.arc(32,32,8,0,7);x.fill();x.fillStyle='#95d600';x.fillRect(30,24,4,16)}},
 {id:'rayban',n:'Ray-Bam',t:0,cat:'eyewear',bg:'#16161a',c:'#d71920',p(x){x.fillStyle='#d71920';x.beginPath();x.ellipse(32,32,29,18,0,0,7);x.fill();x.fillStyle='#16161a';[18,46].forEach(cx=>{x.beginPath();x.ellipse(cx,31,9,7,0,0,7);x.fill()});x.fillRect(26,29,12,3);TXT(x,'Bam',32,48,'800 9px Arial,sans-serif','#fff',.5)}},
 {id:'supreme',n:'Supremo',t:0,cat:'streetwear',bg:'#f1ece0',c:'#1d4ed8',p(x){x.fillStyle='#1d4ed8';x.fillRect(7,19,50,26);x.fillStyle='#f1ece0';x.fillRect(10,22,44,20);TXT(x,'SUP',32,33,'800 17px "Arial Black",Arial,sans-serif','#1d4ed8')}},
 {id:'levis',n:"Leevi's",t:1,cat:'denim',bg:'#f2b705',c:'#1e3f8a',p(x){x.strokeStyle='#1e3f8a';x.lineWidth=2.4;x.setLineDash([3,2.4]);x.beginPath();x.moveTo(10,12);x.lineTo(10,34);x.quadraticCurveTo(32,58,54,34);x.lineTo(54,12);x.closePath();x.stroke();x.setLineDash([]);TXT(x,'Leevi',32,26,'800 12px Georgia,serif','#1e3f8a')}},
 {id:'beats',n:'Beatz by Dro',t:1,cat:'audio',bg:'#f2f2f2',c:'#6a2bd9',p(x){x.fillStyle='#6a2bd9';x.fillRect(8,8,48,48);x.fillStyle='#f2f2f2';x.beginPath();x.arc(22,36,8,0,7);x.arc(42,36,8,0,7);x.fill();x.fillRect(29,14,3,22);x.fillRect(49,14,3,22);x.fillRect(29,14,23,4)}},
 {id:'pepsi',n:'Pepzi',t:1,cat:'drink',bg:'#f6f8fb',c:'#0a4a96',p(x){x.save();x.beginPath();x.moveTo(32,5);x.lineTo(59,32);x.lineTo(32,59);x.lineTo(5,32);x.closePath();x.clip();x.fillStyle='#e32934';x.fillRect(0,0,64,64);x.fillStyle='#0a4a96';x.fillRect(0,32,64,32);x.strokeStyle='#fff';x.lineWidth=4;x.beginPath();x.moveTo(0,32);x.bezierCurveTo(16,22,32,42,64,30);x.stroke();x.restore()}},
 {id:'adidas',n:'Adadas',t:2,cat:'sportswear',bg:'#ffffff',c:'#111',p(x){x.strokeStyle='#111';x.lineWidth=5;[0,1,2].forEach(i=>{x.beginPath();x.arc(32,46,10+i*9,Math.PI*1.12,Math.PI*1.88);x.stroke()})}},
 {id:'cocacola',n:'Koka-Cola',t:2,cat:'drink',bg:'#e41e2b',c:'#e41e2b',p(x){x.fillStyle='#fff';x.beginPath();x.arc(32,32,24,0,7);x.fill();x.fillStyle='#e41e2b';x.beginPath();x.arc(32,32,21,0,7);x.fill();TXT(x,'Koka',32,27,'800 14px "Arial Black",Arial,sans-serif','#fff');x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(14,38);x.bezierCurveTo(26,46,38,30,50,38);x.stroke()}},
 {id:'samsung',n:'Samsong',t:2,cat:'tech',bg:'#f4f6fb',c:'#1428a0',p(x){x.fillStyle='#1428a0';x.fillRect(6,16,52,32);x.fillStyle='#f4f6fb';x.beginPath();x.ellipse(20,38,5,3.6,-.3,0,7);x.fill();x.fillRect(24,20,2.4,18);x.fillRect(24,20,9,3);x.fillRect(36,24,3,14);x.fillRect(44,24,3,14);x.fillRect(52,24,3,14)}},
 {id:'nike',n:'Nyke',t:3,cat:'sportswear',bg:'#f4f4f1',c:'#111',p(x){x.strokeStyle='#111';x.lineCap='round';x.lineWidth=7;x.beginPath();x.moveTo(10,24);x.quadraticCurveTo(24,52,56,16);x.stroke();x.lineWidth=3;x.beginPath();x.moveTo(12,44);x.quadraticCurveTo(28,54,40,46);x.stroke()}},
 {id:'gucci',n:'Guchi',t:3,cat:'luxury',bg:'#0f3d2e',c:'#c9a24b',p(x){x.strokeStyle='#e2c06a';x.lineWidth=3.4;[23,41].forEach(cx=>{x.beginPath();x.arc(cx,26,12,0,7);x.stroke()});TXT(x,'GUCHI',32,50,'700 9px Georgia,serif','#e2c06a',1.2)}},
 {id:'apple',n:'Appel',t:4,cat:'tech',bg:'#f2f2f4',c:'#111',p(x){x.fillStyle='#111';x.beginPath();x.arc(32,42,15,0,7);x.fill();x.beginPath();x.arc(32,24,9,0,7);x.fill();x.fillRect(30,8,3,10);x.fillStyle='#2e9a58';x.save();x.translate(40,12);x.rotate(.5);x.beginPath();x.ellipse(0,0,8,3.4,0,0,7);x.fill();x.restore()}},
 {id:'lv',n:'Lewis Vitton',t:4,cat:'luxury',bg:'#4a2e18',c:'#c9a24b',p(x){x.strokeStyle='#d8b45e55';x.lineWidth=1;for(let i=-64;i<128;i+=12){x.beginPath();x.moveTo(i,0);x.lineTo(i+64,64);x.stroke();x.beginPath();x.moveTo(i+64,0);x.lineTo(i,64);x.stroke()}x.fillStyle='#4a2e18';x.beginPath();x.arc(32,32,19,0,7);x.fill();x.strokeStyle='#e2c06a';x.lineWidth=2;x.stroke();TXT(x,'LW',32,33,'700 22px Georgia,serif','#e2c06a')}}];
BRD.brands=BR;BRD.tiers=FAME;BRD.hq=HQC;
BRD.by=id=>BR.find(b=>b.id==id)||BR[0];
const LC={},PX={},GRID=32;
/* the logos are pixel art: drawn on a 32x32 grid, colours cut to a few levels, shown with hard pixel edges */
function pix(id){if(PX[id])return PX[id];const b=BRD.by(id),c=document.createElement('canvas');c.width=c.height=GRID;const x=c.getContext('2d');
 x.scale(GRID/64,GRID/64);x.fillStyle=b.bg;x.fillRect(0,0,64,64);try{b.p(x)}catch(e){}x.setTransform(1,0,0,1,0,0);
 try{const d=x.getImageData(0,0,GRID,GRID),a=d.data;for(let i=0;i<a.length;i+=4){for(let k=0;k<3;k++)a[i+k]=Math.min(255,Math.round(a[i+k]/48)*48);a[i+3]=255}x.putImageData(d,0,0)}catch(e){}
 return PX[id]=c}
BRD.logo=function(id,px){const k=id+'|'+(px||64);if(LC[k])return LC[k];const s=px||64,c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(pix(id),0,0,s,s);return LC[k]=c.toDataURL()};
/* draw a logo onto any canvas context (the studio sets use it) */
BRD.paint=function(x,id,px,py,s){const o=x.imageSmoothingEnabled;x.imageSmoothingEnabled=false;x.drawImage(pix(id),px,py,s,s);x.imageSmoothingEnabled=o};

/* ---------- state ---------- */
function st(){if(!S.brands||typeof S.brands!='object')S.brands={last:-999,list:[],done:0,earned:0};const b=S.brands;if(!Array.isArray(b.list))b.list=[];if(!(b.done>=0))b.done=0;if(!(b.earned>=0))b.earned=0;if(typeof b.last!='number')b.last=-999;b.list.forEach(o=>{if(o.k!='trip'||!o.d){o.k='trip';o.d=HQC[o.b]||'nyc'}});return b}
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
BRD.place=o=>placeOf(o.d);
const CAMP={sneaker:'sneaker',drink:'summer drinks',eyewear:'eyewear',streetwear:'streetwear drop',denim:'denim',audio:'headphone',sportswear:'sportswear',tech:'tech',luxury:'luxury'};
const pick=a=>a[Math.floor(Math.random()*a.length)];
/* each brand writes through a named agent with a face of their own */
const AGN=['Dana Reyes','Marcus Hale','Priya Nair','Jonas Weber','Chloe Martin','Theo Bianchi','Aiko Tanaka','Sam Okafor','Lena Novak','Rafael Costa'];
BRD.agent=function(o){const b=BRD.by(o.b);if(!o.ag||!o.ag.n){let cfg=null;try{cfg=fCfg()}catch(e){}o.ag={n:pick(AGN),cfg}}o.ag.from=o.ag.n+' · '+b.n;return o.ag};
function mk(){const s=st(),b=pickBrand();if(!b)return;const d=HQC[b.id];
 const pay=Math.max(FLOOR[b.t],Math.round(monthly()*(.8+Math.random()*.8)/100)*100)*1.2,
  o={id:S.nid++,b:b.id,k:'trip',d,pay:Math.round(pay/100)*100,exp:S.day+EXPIRE,st:0,due:0,brief:{mood:pick(BRD.mood),light:pick(BRD.light)}};
 s.list.push(o);s.last=S.day;if(s.list.length>24)s.list=s.list.filter(q=>q.st<2||q.st==3&&q.res).slice(-24);
 const pl=BRD.place(o),open=(S.artist||'there');
 const ag=BRD.agent(o),A=['Hi '+open+', it is '+ag.n.split(' ')[0]+', the partnerships agent at '+b.n+'. ','Hello '+open+'. '+ag.n+' here, I handle sponsorships for '+b.n+'. '];
 let t=pick(A)+'We at '+b.n+' have watched you rise to Fame Level '+fl()+' and we want you as the face of our next '+CAMP[b.cat]+' campaign. It is one photoshoot day at our own headquarters in '+pl+', in our studio. Fee: '+fm(o.pay)+', paid when the shoot wraps, and the photos go on your Instagrime tagged as a partnership. ';
 t+='We pay for everything: your Swiftwing flight out (booked and checked in the moment you accept), a company car in the city, and your flight home. ';
 t+='Our brief: a '+o.brief.mood.toLowerCase()+' mood with '+o.brief.light.toLowerCase()+' lighting. This offer stands for '+EXPIRE+' days.';
 S.msgs.push({id:S.nid++,from:BRD.agent(o).from,state:9,unread:1,day:S.day,bd:o.id,body:t});
 S.hqLink=1;
 try{snd('ping');say(b.n+' wants to sponsor you. Check Messages.')}catch(e){}try{updateVersion()}catch(e){}}

/* ---------- flights: a free, checked-in ticket on the company ---------- */
const T=()=>window.TRAVEL;
function giveTicket(f,co){const t=T().st(),id='T'+(t.nid++),r=3+Math.floor(Math.random()*18),seat=r+'ABCDEF'[Math.floor(Math.random()*6)],
 tk={id,fl:f.fl,from:f.from,to:f.to,dep:f.dep,arr:f.arr,hrs:f.hrs,gate:f.gate,seat,price:0,st:'booked',bd:S.day,ck:1,bt:0,co};t.tickets.push(tk);return tk}
function flightFor(from,to,lead){const n=T().now();return T().upcoming(from,80).find(f=>f.to==to&&f.dep>=n+lead)||null}
BRD.dayWord=f=>{const d=T().dayOf(f.dep)-T().dayOf(T().now());return d<=0?'today':d==1?'tomorrow':'in '+d+' days'};

/* ---------- accept / decline ---------- */
function note(o,body){S.msgs.push({id:S.nid++,from:BRD.agent(o).from,state:9,unread:1,day:S.day,bd:o.id,body})}
function book(o){const b=BRD.by(o.b),f=flightFor('home',o.d,TICKET_LEAD);if(!f)return null;
 const tk=giveTicket(f,o.b);o.tk=tk.id;o.due=S.day+4;o.st=1;
 note(o,'Confirmed. Your '+tk.fl+' ticket to '+placeOf(o.d)+' is booked and checked in: Gate '+tk.gate+', seat '+tk.seat+', boarding '+T().hm(tk.dep-120)+', gate closes '+T().hm(tk.dep-10)+' ('+BRD.dayWord(f)+'). Be at the airport. When you land a company car takes you to our HQ, and we cover the flight home too. Miss the gate and we have to give the slot to another artist.');
 try{glCard('BRAND FLIGHT · '+tk.fl,T().code(tk.from)+' ✈ '+T().code(tk.to),'Paid by '+b.n+' · Gate '+tk.gate+' · boards '+T().hm(tk.dep-120)+' · closes '+T().hm(tk.dep-10))}catch(e){}
 say(b.n+' booked you on '+tk.fl+' to '+placeOf(o.d)+' ('+BRD.dayWord(f)+'). Head to the airport.');return tk}
window.bdAccept=function(id){const o=job(id);if(!o||o.st!=0)return;
 if(S.day>o.exp){o.st=4;return pcR()}
 if(BRD.active()){snd('err');return say('You already have a brand shoot to finish.')}
 if(!T()||T().abroad()){snd('err');return say('You are abroad. Fly home first, then accept this trip.')}
 if(!book(o)){snd('err');return say('No flight to '+placeOf(o.d)+' is free for the next few days. Try again later.')}
 snd('chime');try{updateVersion()}catch(e){}pcR()};
window.bdDecline=function(id){const o=job(id);if(!o||o.st!=0)return;o.st=2;snd('pop');pcR()};

/* ---------- each morning: new offers, expiry ---------- */
function daily(){const s=st();
 s.list.forEach(o=>{if(o.st==0&&S.day>o.exp)o.st=4;
  if(o.st==1&&!o.tk&&T()&&!T().abroad()&&!book(o)){o.st=5;note(o,'We could not book a flight for you in time, so we gave the shoot to another artist.')}
  if(o.st==1&&S.day>o.due+(T()&&T().loc()==o.d?3:0)){o.st=5;note(o,'We could not wait any longer and booked another artist for this campaign. We hope to work with you again.')}});
 if(!(S.artist&&fl()>=FAME[0]&&S.songs&&S.songs.length))return;
 if(s.list.some(o=>o.st==0||o.st==1)||S.day-s.last<COOL||Math.random()>CHANCE)return;mk()}
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{daily()}catch(e){console.error('brand deals',e)}return r}}
/* a lost ticket loses the job */
{const tr=window.TRAVEL;if(tr&&tr.on)tr.on('missed',tk=>{try{const o=tk&&st().list.find(q=>q.st==1&&q.tk===tk.id);if(o){o.st=5;note(o,'You missed the flight, so we gave the shoot to another artist. Next time, be at the gate before it closes.')}}catch(e){}})}
BRD.failCheck=function(){const tr=T();if(!tr)return;st().list.forEach(o=>{if(o.st==1&&o.tk){const k=tr.st().tickets.find(q=>q.id===o.tk);if(k&&(k.st=='cancelled'||k.st=='missed')&&!BRD.shootOn){o.st=5;note(o,'The flight did not happen, so we gave the shoot to another artist.')}}})};
setInterval(()=>{try{BRD.failCheck()}catch(e){}},2000);

/* ---------- Messages: logo as the profile picture, Accept / Decline buttons ---------- */
{const pm=PA.msg;PA.msg=function(){let h=pm.apply(this,arguments);if(typeof h!='string')return h;
 try{const L=S.msgs.filter(m=>m.bd!=null);
  L.forEach(m=>{const o=job(m.bd);if(!o)return;const ag=BRD.agent(o);let lg=BRD.logo(o.b,64);try{if(ag.cfg)lg=pfp(ag.cfg)}catch(e){}
   h=h.replace(new RegExp('(onclick="openChat\\('+m.id+'\\)">)<img src="[^"]*"'),'$1<img src="'+lg+'" style="border-radius:50%"');
   if(S.chat==m.id){h=h.replace(/(<div class=cvh>(?:<button[^>]*>[^<]*<\/button>)?)<img src="[^"]*"/,'$1<img src="'+lg+'" style="border-radius:50%"');
    const b=BRD.by(o.b),sub=ag.n+' · agent for '+b.n;h=h.replace(/(<div class=cvh>[\s\S]*?<br><small[^>]*>)[^<]*/,'$1'+sub);
    if(!(S.apps&&S.apps.hq))h=h.replace('<div class=cin','<div class=cfm><span>'+esc(b.n)+' sent a link: Label HQ app</span><button class=go onclick="bdGetHQ()">Download Label HQ</button></div><div class=cin');
    if(o.st==0&&S.day<=o.exp)h=h.replace(/<div class=cin><small[^>]*>Official account\. No replies\.<\/small><\/div>/,`<div class=cin style="gap:8px;padding:8px"><button class=go onclick="bdAccept(${o.id})">Accept ${fm(o.pay)} shoot + paid trip</button><button onclick="bdDecline(${o.id})">Decline</button></div>`);
    else h=h.replace(/Official account\. No replies\./,o.st==2?'You declined this offer.':o.st==3?'Shoot done. Thanks!':o.st==1?'Deal accepted. Fly to their HQ.':o.st==5?'This deal has fallen through.':o.st==4?'This offer has expired.':'Official account. No replies.')}})}catch(e){console.error('brand msg',e)}
 return h}}

/* ---------- Label HQ (v51.7.0): a plain corporate web portal. No pictures: type, hairline rules, tables and cards.
   Tabs: Brand deals | Labels | Team (once signed). A signed label sets the accent colour and the type of the wordmark (THM).
   The layout follows the width of the app window (container queries), so it works maximised, windowed and on phones. ---------- */
const STT=['Offer','In progress','Declined','Completed','Expired','Fell through'],STK=['ac','ac','','ok','','bad'];
const cityOf=id=>{try{const d=wtDest(id);return d.city||d.country}catch(e){return''}};
const THM={disc:{a:'#b42318',f:'"Arial Black","Helvetica Neue",Arial,sans-serif',t:'uppercase',w:900,s:'.02em'},
 flip:{a:'#b54708',f:'Impact,"Haettenschweiler","Arial Narrow Bold",sans-serif',t:'uppercase',w:400,s:'.06em'},
 brick:{a:'#9c4221',f:'Rockwell,"Roboto Slab","Courier New",serif',t:'none',w:700,s:'0'},
 north:{a:'#0b6b93',f:'"Helvetica Neue",Helvetica,Arial,sans-serif',t:'uppercase',w:300,s:'.22em'},
 merid:{a:'#4f3cc9',f:'Georgia,"Times New Roman",serif',t:'none',w:400,s:'.04em',v:'small-caps'},
 crown:{a:'#8a6a12',f:'Didot,"Bodoni 72","Bodoni MT",Georgia,serif',t:'uppercase',w:400,s:'.16em'}};
const ini=n=>String(n).replace(/[^A-Za-z& ]/g,'').split(/\s+/).filter(w=>w&&!/^(by|and|the|of|&)$/i.test(w)).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'?';
const bm=b=>`<span class=lh-mg style="--bc:${b.c}">${esc(ini(b.n))}</span>`;
const lm=l=>`<span class=lh-mg style="--bc:${(THM[l.id]||{}).a||'#1f3a5f'}">${esc(ini(l.n))}</span>`;
const pill=(t,k)=>`<span class="lh-pill ${k||''}">${t}</span>`;
const kpi=(k,v,s)=>`<div class=lh-kpi><span>${k}</span><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`;
const phead=(eb,t,lede)=>`<div class=lh-ph><div class=lh-eb>${eb}</div><div class=lh-h1>${t}</div>${lede?`<p class=lh-lede>${lede}</p>`:''}</div>`;
const sec=(t,meta,body)=>`<section class=lh-sec><div class=lh-sh><div class=lh-h2>${t}</div>${meta?`<span class=lh-meta>${meta}</span>`:''}</div>${body}</section>`;
const empty=t=>`<div class=lh-empty>${t}</div>`;
const td=(l,v,c)=>`<td data-l="${l}"${c?` class=${c}`:''}>${v}</td>`;
const bcell=(b,sub)=>`<div class=lh-bn>${bm(b)}<div><b>${esc(b.n)}</b>${sub?`<small>${sub}</small>`:''}</div></div>`;
/* the four stages of a trip, with the current one lit */
function steps(o){const tr=T(),tk=tr?tr.st().tickets.find(q=>q.id===o.tk):null,there=tr&&tr.loc()==o.d,hqIn=BRD.inStudio&&BRD.inStudio();
 const cur=hqIn?2:there?1:0,L=['Flight out','Car to HQ','Photoshoot','Flight home'];
 const msg=cur==0?(tk&&tk.st=='booked'?'Flight '+esc(tk.fl)+' · Gate '+tk.gate+' · boards '+tr.hm(tk.dep-120)+' · gate closes '+tr.hm(tk.dep-10)+'. Everything is paid for.':'Fly to '+esc(BRD.place(o))+'.')
  :cur==1?'You are in '+esc(cityOf(o.d))+'. A company car waits outside the airport, or walk: the HQ is marked on the city map. Walk through the front door to reach the studio.':'You are in the studio. Press Start the photoshoot by the camera.';
 return`<ol class=lh-steps>${L.map((n,i)=>`<li class="${i<cur?'dn':i==cur?'on':''}"><i>${i<cur?'&#10003;':i+1}</i><span>${n}</span></li>`).join('')}</ol><p class=lh-note><b>Next step.</b> ${msg}</p>`}
function actCard(o){const b=BRD.by(o.b);
 return`<div class="lh-card lh-act"><div class=lh-acth>${bm(b)}<div class=lh-grow><div class=lh-h3>${esc(b.n)}</div><div class=lh-mut>${esc(b.cat)} campaign · ${esc(BRD.place(o))}</div></div><div class=lh-fee><span>Fee</span><b>${fm(o.pay)}</b></div></div>
 <dl class=lh-dl><div><dt>Creative brief</dt><dd>${esc(o.brief.mood)} mood, ${esc(o.brief.light)} light</dd></div><div><dt>Location</dt><dd>Brand HQ, ${esc(BRD.place(o))}</dd></div><div><dt>Travel</dt><dd>Flights and car paid by the brand</dd></div><div><dt>Status</dt><dd>${pill('In progress','ac')}</dd></div></dl>${steps(o)}</div>`}
function dealsTab(){const s=st(),L=fl(),act=BRD.active(),offs=BRD.open(),past=s.list.filter(o=>o.st>=2).slice(-8).reverse(),early=L<FAME[0];
 let h=phead('Partnerships','Brand deals','Brands book you for one photoshoot day at their own headquarters abroad. Every trip is paid for by the brand, and the fee is set by your recent income.');
 h+=`<div class=lh-kpis>${kpi('Completed shoots',s.done)}${kpi('Earned from brands',fm(s.earned))}${kpi('Open offers',offs.length)}${kpi('Fame Level',L,early?'Brands write from Level '+FAME[0]:'')}</div>`;
 h+=sec('Active engagement',act?'1 booking':'',act?actCard(act):empty(early?'Brands start writing at Fame Level '+FAME[0]+'.':'No shoot booked. Brands write now and then as your fame grows. Every deal is at the brand\'s own HQ abroad and the brand pays for the whole trip.'));
 h+=sec('Open offers',offs.length?offs.length+' awaiting reply':'',offs.length?`<div class=lh-tw><table class=lh-t><thead><tr><th>Brand</th><th>Location</th><th>Creative brief</th><th>Expires</th><th class=lh-r>Fee</th><th class=lh-r>Action</th></tr></thead><tbody>${offs.map(o=>{const b=BRD.by(o.b);
   return`<tr>${td('Brand',bcell(b,esc(b.cat)+' campaign'))}${td('Location',esc(BRD.place(o)))}${td('Brief',esc(o.brief.mood)+' mood, '+esc(o.brief.light)+' light')}${td('Expires','Day '+o.exp)}${td('Fee','<b>'+fm(o.pay)+'</b>','lh-r')}<td class="lh-r lh-acts"><button class="lh-btn pri" onclick="bdAccept(${o.id})">Accept</button><button class=lh-btn onclick="bdDecline(${o.id})">Decline</button></td></tr>`}).join('')}</tbody></table></div>`:empty(early?'Brands start writing at Fame Level '+FAME[0]+'.':'No offers right now. New offers arrive in Messages.'));
 if(past.length)h+=sec('History','Last '+past.length,`<div class=lh-tw><table class=lh-t><thead><tr><th>Brand</th><th>Location</th><th>Status</th><th class=lh-r>Fee</th></tr></thead><tbody>${past.map(o=>{const b=BRD.by(o.b);
   return`<tr>${td('Brand',bcell(b,esc(b.cat)))}${td('Location',esc(BRD.place(o)))}${td('Status',pill(STT[o.st],STK[o.st]))}${td('Fee',o.res?'<b>'+fm(o.res.pay)+'</b>':'<span class=lh-mut>'+fm(o.pay)+'</span>','lh-r')}</tr>`}).join('')}</tbody></table></div>`);
 h+=sec('Brand directory',BR.filter(b=>FAME[b.t]<=L).length+' of '+BR.length+' open to you',`<div class=lh-dir>${BR.map(b=>{const lk=FAME[b.t]>L;
   return`<div class="lh-dc${lk?' lk':''}">${bm(b)}<div class=lh-grow><b>${esc(b.n)}</b><small>${esc(cityOf(HQC[b.id]))} · ${esc(b.cat)}</small></div>${lk?pill('Level '+FAME[b.t]):pill('Open','ok')}</div>`}).join('')}</div>`);
 return h}
let HQT='deals',HQJ=0;window.bdTab=t=>{HQT=t;pcR()};window.bdOffer=id=>{HQJ=id;pcR()};
const labels=()=>typeof LABELS_ENABLED!='undefined'&&LABELS_ENABLED&&typeof LABELS!='undefined';
const offerOf=mid=>S.msgs.find(m=>m.id==mid&&m.lo&&m.lo.st==0);
/* the link in a label's offer message: opens Label HQ and asks if you want to join */
window.bdJoin=function(mid){if(!offerOf(mid)||S.label)return;S.hqLink=1;S.apps=S.apps||{};S.apps.hq=1;HQJ=mid;HQT='labels';openPC();app='hq';pcR()};
window.bdJoinYes=function(){const mid=HQJ;HQJ=0;if(offerOf(mid)&&!S.label){lbSign(mid);HQT='team'}pcR()};
window.bdJoinNo=function(){HQJ=0;snd('pop');pcR()};
function joinCard(){const m=HQJ&&offerOf(HQJ);if(!m||S.label){HQJ=0;return''}const l=lbById(m.lo.id);if(!l)return'';const a=(THM[l.id]||{}).a||'';
 return`<div class=lh-offer style="--oa:${a}"><div class=lh-eb>Offer received</div><div class=lh-h2>Do you want to join ${esc(l.n)}?</div><p class=lh-lede>${esc(l.pitch)}</p>
 <dl class=lh-dl><div><dt>Signing bonus</dt><dd>$${l.adv.toLocaleString()}</dd></div><div><dt>Label share</dt><dd>${Math.round(l.cut*100)}% of your streaming income</dd></div><div><dt>Rating</dt><dd class=lh-star>${esc(lbStars(l.q))}</dd></div><div><dt>Term</dt><dd>You can leave later for a fee</dd></div></dl>
 <div class=lh-btns><button class="lh-btn pri" onclick="bdJoinYes()">Join ${esc(l.n)}</button><button class=lh-btn onclick="bdJoinNo()">Not now</button></div></div>`}
function labelsTab(){const L=S.label;
 const rows=LABELS.map(l=>{const sg=L&&L.id==l.id,off=S.msgs.find(m=>m.lo&&m.lo.id==l.id&&m.lo.st==0),ok=typeof lbElig=='function'&&lbElig(l);
  const stt=sg?pill('Signed','ok'):off?`<button class="lh-btn pri" onclick="bdOffer(${off.id})">Review offer</button>`:ok?pill('Eligible','ac'):`<span class=lh-req>Requires ${l.ml.toLocaleString()} monthly listeners · ${l.st.toLocaleString()} streams${l.rep>0?' · reputation '+l.rep:''}</span>`;
  return`<tr class="${sg?'sg':''}">${td('Label',`<div class=lh-bn>${lm(l)}<div><b>${esc(l.n)}</b><small>${esc(l.pitch)}</small></div></div>`)}${td('Rating','<span class=lh-star>'+esc(lbStars(l.q))+'</span>')}${td('Label share',Math.round(l.cut*100)+'%','lh-r')}${td('Signing bonus','$'+l.adv.toLocaleString(),'lh-r')}${td('Status',stt,'lh-r')}</tr>`}).join('');
 return phead('Representation','Record labels',L?'You are signed with '+esc(lbCur().n)+'. You can leave on the Team page.':'Labels send offers to Messages once your numbers are high enough. Each offer links here, where you can review the terms.')
  +joinCard()+sec('Label directory',LABELS.length+' labels',`<div class=lh-tw><table class="lh-t lh-lt"><thead><tr><th>Label</th><th>Rating</th><th class=lh-r>Label share</th><th class=lh-r>Signing bonus</th><th class=lh-r>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`)}
/* Team: the label account and the five upgrades of 82-label-hq.js (no login: signing is enough) */
function teamTab(){hqFill();const l=lbCur();if(!l)return'';const fee=Math.round(l.adv*UPX.leaveFee),s=hqS(),q=hqQ(),hh=hqH(),pr=hqPR(),mxL=hqMax();
 const up=k=>{const H=HQ[k],lv=hqL(k),mx=lv>=mxL,lk=hqLock(k),c=mx?0:lbCost(H.c[lv]);
  const btn=mx?`<button class=lh-btn disabled>Top level</button>`:lk?`<button class=lh-btn disabled>Unlocks at Fame Level ${lk}</button>`:`<button class="lh-btn pri" ${S.money<c?'disabled':''} onclick="hqBuy('${k}')">${H.b||'Hire'} · ${$k(c)}</button>`;
  return`<div class="lh-card lh-up${mx?' mx':''}"><div class=lh-eb>${esc(H.n)}</div><div class=lh-h3>${esc(H.lv[lv])}</div><div class=lh-mut>${esc(H.d)}</div>
  <div class=lh-lvl>${[1,2,3,4].map(i=>`<i class="${i<=lv?'on':''}${i>mxL?' x':''}"></i>`).join('')}<span>Level ${lv} of ${mxL}</span></div>
  <dl class=lh-dl1><div><dt>Effect</dt><dd>${hqEff(k)}</dd></div><div><dt>Next</dt><dd>${mx?'None, top level reached':esc(H.lv[lv+1])+(lk?'':' · '+$k(c))}</dd></div></dl>${btn}</div>`};
 return phead('Your label','Team and studio','Hire your team and build out your studio through '+esc(l.n)+'. Prices and benefits depend on the label, and upgrades unlock as your fame grows.')
  +`<div class=lh-kpis>${kpi('Balance',$k(S.money))}${kpi('Fame Level',fameLevel())}${kpi('Monthly listeners',S.listeners.toLocaleString())}${kpi('Paid to label',$k(S.lbPaid||0))}</div>`
  +sec('Account','Signed Day '+((S.label&&S.label.since)||1),`<div class="lh-card lh-acc"><div class=lh-acth>${lm(l)}<div class=lh-grow><div class=lh-h3>${esc(l.n)}</div><div class="lh-mut lh-star">${esc(lbStars(l.q))}</div></div><button class="lh-btn${LBLQ?' dng':''}" onclick="lbLeave()">${LBLQ?'Confirm: leave for $'+fee.toLocaleString():'Leave label'}</button></div>
  <dl class=lh-dl><div><dt>Label share</dt><dd>${Math.round(l.cut*100)}% of streaming income</dd></div><div><dt>Upgrade prices</dt><dd>×${(UPX.priceBase+UPX.priceQ*l.q).toFixed(2)}</dd></div><div><dt>Team benefits</dt><dd>×${(UPX.benBase+UPX.benQ*l.q).toFixed(2)}</dd></div><div><dt>Highest level</dt><dd>${mxL}</dd></div><div><dt>Exit fee</dt><dd>$${fee.toLocaleString()}</dd></div></dl></div>`)
  +sec('Team effect','',`<div class=lh-kpis>${kpi('Streams','+'+Math.round(s*100)+'%')}${kpi('Song quality','+'+q)}${kpi('Hit chance','+'+Math.round(hh*100)+'%')}${kpi('Promotions',pr?pr*10+'% cheaper':'Standard',pr?'+'+pr+' day'+(pr>1?'s':''):'')}</div>`)
  +sec('Upgrades',Object.keys(HQ).length+' roles',`<div class=lh-ups>${Object.keys(HQ).map(up).join('')}</div>`)}
const h0=PA.hq;BRD.teamPage=h0;
PA.hq=function(){const L=labels()&&S.label?lbCur():null;if(!L&&HQT=='team')HQT='deals';if(!labels()&&HQT=='labels')HQT='deals';
 const th=L?THM[L.id]:null,sty=th?`--ac:${th.a};--wf:${th.f};--wt:${th.t};--ww:${th.w};--ws:${th.s};--wv:${th.v||'normal'}`:'';
 const tab=(k,n,b)=>`<button class="${HQT==k?'on':''}" onclick="bdTab('${k}')">${n}${b?`<em>${b}</em>`:''}</button>`;
 const nav=tab('deals','Brand deals')+(labels()?tab('labels','Labels',HQJ?1:0):'')+(L?tab('team','Team'):'');
 let body;try{body=HQT=='team'?teamTab():HQT=='labels'?labelsTab():joinCard()+dealsTab()}catch(e){console.error('label hq',e);body=empty('Label HQ hit a problem. Close and open it again.')}
 return`<div class="bdw lhq${L?' lhth':''}" style="${sty}"><header class=lh-top><div class=lh-in><div class=lh-brand><span class=lh-wm>${L?esc(L.n):'Label HQ'}</span><span class=lh-sub>${L?'Artist portal':'Artist services'}</span></div><nav class=lh-nav>${nav}</nav><div class=lh-user><span>${esc(S.artist||'Artist')}</span><b>${fm(S.money)}</b></div></div></header>
 <main class=lh-main><div class=lh-in>${body}</div></main><footer class=lh-foot><div class=lh-in><span>${L?esc(L.n)+' · ':''}Label HQ</span><span>Artist services · Brand partnerships · Representation</span></div></footer></div>`};
/* the app fills its window edge to edge */
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{const m=document.querySelector('#pc .mn');if(m)m.classList.toggle('lhqmn',app=='hq'&&!!m.querySelector('.lhq'))}catch(e){}return r}}
{const st=document.createElement('style');st.textContent=`#pc .lhqmn{padding:0!important;background:#f6f5f1}
#pc .lhq{--ac:#1f3a5f;--wf:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;--wt:none;--ww:600;--ws:.01em;--wv:normal;--bg:#f6f5f1;--sf:#fff;--ln:#e4e1d9;--ln2:#d3cfc4;--ink:#16181d;--mu:#5d6169;--mu2:#8b8e94;--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
 container-type:inline-size;display:flex;flex-direction:column;min-height:100%;width:100%;box-sizing:border-box;background:var(--bg);color:var(--ink);font:14px/1.5 var(--sans);text-align:left;-webkit-font-smoothing:antialiased;text-shadow:none}
#pc .lhq *{box-sizing:border-box}
#pc .lhq .lh-in{max-width:1160px;margin:0 auto;padding:0 32px;width:100%}
#pc .lhq .lh-top{background:var(--sf);border-top:3px solid var(--ac);border-bottom:1px solid var(--ln);position:sticky;top:0;z-index:2}
#pc .lhq .lh-top .lh-in{display:flex;align-items:center;gap:28px;min-height:60px}
#pc .lhq .lh-brand{display:flex;flex-direction:column;line-height:1.15;min-width:0}
#pc .lhq .lh-wm{font-family:var(--wf);text-transform:var(--wt);font-weight:var(--ww);letter-spacing:var(--ws);font-variant:var(--wv);font-size:19px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pc .lhq.lhth .lh-wm{color:var(--ac)}
#pc .lhq .lh-sub{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--mu2);margin-top:3px}
#pc .lhq .lh-nav{display:flex;gap:4px;flex:1;align-self:stretch}
#pc .lhq .lh-nav button{all:unset;cursor:pointer;display:flex;align-items:center;gap:6px;padding:0 12px;font:500 13.5px var(--sans);color:var(--mu);border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
#pc .lhq .lh-nav button:hover{color:var(--ink)}
#pc .lhq .lh-nav button.on{color:var(--ink);border-bottom-color:var(--ac);font-weight:600}
#pc .lhq .lh-nav em{font-style:normal;font-size:10.5px;font-weight:700;background:var(--ac);color:#fff;border-radius:9px;padding:0 6px;line-height:16px}
#pc .lhq .lh-user{display:flex;flex-direction:column;align-items:flex-end;line-height:1.2;font-size:12px;color:var(--mu);white-space:nowrap}
#pc .lhq .lh-user b{font-size:14px;color:var(--ink);font-weight:600;font-variant-numeric:tabular-nums}
#pc .lhq .lh-main{flex:1;padding:36px 0 48px}
#pc .lhq .lh-ph{margin:0 0 28px;max-width:760px}
#pc .lhq .lh-eb{font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ac);margin:0 0 6px}
#pc .lhq .lh-h1{font:400 34px/1.15 var(--serif);letter-spacing:-.01em;color:var(--ink)}
#pc .lhq .lh-h2{font:600 15px/1.3 var(--sans);color:var(--ink)}
#pc .lhq .lh-h3{font:600 16px/1.3 var(--sans);color:var(--ink)}
#pc .lhq .lh-lede{margin:10px 0 0;font-size:15px;line-height:1.6;color:var(--mu)}
#pc .lhq .lh-mut{color:var(--mu);font-size:13px}
#pc .lhq .lh-grow{flex:1;min-width:0}
#pc .lhq .lh-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));background:var(--sf);border:1px solid var(--ln);border-radius:6px;margin:0 0 32px}
#pc .lhq .lh-kpi{padding:16px 20px;border-left:1px solid var(--ln);min-width:0}
#pc .lhq .lh-kpi:first-child{border-left:0}
#pc .lhq .lh-kpi span{display:block;font-size:11.5px;color:var(--mu);letter-spacing:.02em}
#pc .lhq .lh-kpi b{display:block;font:400 24px/1.25 var(--serif);color:var(--ink);margin-top:4px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pc .lhq .lh-kpi small{display:block;font-size:11.5px;color:var(--mu2);margin-top:2px}
#pc .lhq .lh-sec{margin:0 0 36px}
#pc .lhq .lh-sec .lh-kpis{margin:0}
#pc .lhq .lh-sh{display:flex;align-items:baseline;justify-content:space-between;gap:12px;border-bottom:1px solid var(--ink);padding:0 0 8px;margin:0 0 16px}
#pc .lhq .lh-meta{font-size:12px;color:var(--mu)}
#pc .lhq .lh-card{background:var(--sf);border:1px solid var(--ln);border-radius:6px;padding:20px 22px}
#pc .lhq .lh-empty{background:var(--sf);border:1px dashed var(--ln2);border-radius:6px;padding:22px;color:var(--mu);font-size:13.5px}
#pc .lhq .lh-mg{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:1px solid var(--ln2);border-radius:4px;background:var(--sf);font:600 14px/1 var(--serif);letter-spacing:.03em;color:var(--ink);box-shadow:inset 0 -3px 0 var(--bc)}
#pc .lhq .lh-acth{display:flex;align-items:center;gap:14px}
#pc .lhq .lh-fee{text-align:right}
#pc .lhq .lh-fee span{display:block;font-size:11.5px;color:var(--mu)}
#pc .lhq .lh-fee b{font:400 24px var(--serif);font-variant-numeric:tabular-nums}
#pc .lhq .lh-dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:0;margin:18px 0 0;border-top:1px solid var(--ln)}
#pc .lhq .lh-dl>div{padding:12px 16px 0 0}
#pc .lhq dt{font-size:11.5px;color:var(--mu);margin:0}
#pc .lhq dd{margin:2px 0 0;font-size:13.5px;color:var(--ink)}
#pc .lhq .lh-dl dd:first-letter{text-transform:uppercase}
#pc .lhq .lh-steps{list-style:none;margin:22px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));counter-reset:s}
#pc .lhq .lh-steps li{position:relative;display:flex;flex-direction:column;gap:8px;font-size:12.5px;color:var(--mu2);padding-right:8px;min-width:0}
#pc .lhq .lh-steps li:before{content:'';position:absolute;left:26px;right:0;top:11px;height:1px;background:var(--ln2)}
#pc .lhq .lh-steps li:last-child:before{display:none}
#pc .lhq .lh-steps li.dn:before{background:var(--ac)}
#pc .lhq .lh-steps i{position:relative;font-style:normal;width:23px;height:23px;border-radius:50%;border:1px solid var(--ln2);background:var(--sf);display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:600;color:var(--mu)}
#pc .lhq .lh-steps li.dn i{background:var(--ac);border-color:var(--ac);color:#fff}
#pc .lhq .lh-steps li.on i{border:2px solid var(--ac);color:var(--ac)}
#pc .lhq .lh-steps li.on,#pc .lhq .lh-steps li.dn{color:var(--ink)}
#pc .lhq .lh-steps li.on span{font-weight:600}
#pc .lhq .lh-steps span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pc .lhq .lh-note{margin:18px 0 0;padding:12px 14px;background:var(--bg);border-left:2px solid var(--ac);font-size:13.5px;color:var(--ink)}
#pc .lhq .lh-tw{background:var(--sf);border:1px solid var(--ln);border-radius:6px;overflow:hidden}
#pc .lhq .lh-t{width:100%;border-collapse:collapse;font-size:13.5px}
#pc .lhq .lh-t th{text-align:left;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mu);padding:11px 16px;border-bottom:1px solid var(--ln);background:#fbfaf7;white-space:nowrap}
#pc .lhq .lh-t td{padding:14px 16px;border-bottom:1px solid var(--ln);vertical-align:middle;color:var(--ink)}
#pc .lhq .lh-t tr:last-child td{border-bottom:0}
#pc .lhq .lh-t .lh-r{text-align:right}
#pc .lhq .lh-t td b{font-weight:600;font-variant-numeric:tabular-nums}
#pc .lhq .lh-t tr.sg td{background:#fbfaf7}
#pc .lhq .lh-t tr.sg td:first-child{box-shadow:inset 3px 0 0 var(--ac)}
#pc .lhq .lh-bn{display:flex;align-items:center;gap:12px;min-width:0}
#pc .lhq .lh-bn b{display:block}
#pc .lhq .lh-bn small{display:block;font-size:12.5px;color:var(--mu);margin-top:1px}
#pc .lhq .lh-lt .lh-bn small{max-width:340px}
#pc .lhq .lh-acts{white-space:nowrap}
#pc .lhq .lh-acts .lh-btn+.lh-btn{margin-left:8px}
#pc .lhq .lh-req{font-size:12px;color:var(--mu)}
#pc .lhq .lh-star{color:var(--ink);letter-spacing:.1em;white-space:nowrap}
#pc .lhq .lh-pill{display:inline-block;font-size:11.5px;font-weight:600;padding:2px 9px;border-radius:999px;border:1px solid var(--ln2);color:var(--mu);white-space:nowrap;background:var(--sf)}
#pc .lhq .lh-pill.ok{border-color:#a8d5b8;color:#1e6b3c;background:#eef8f1}
#pc .lhq .lh-pill.ac{border-color:var(--ac);color:var(--ac)}
#pc .lhq .lh-pill.bad{border-color:#e7b4ae;color:#a12a1e;background:#fcf1ef}
#pc .lhq .lh-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;height:34px;padding:0 16px;border-radius:4px;border:1px solid var(--ln2);background:var(--sf);color:var(--ink);font:500 13px var(--sans);white-space:nowrap;transition:background .12s,border-color .12s}
#pc .lhq .lh-btn:hover:not([disabled]){border-color:var(--ink)}
#pc .lhq .lh-btn.pri{background:var(--ac);border-color:var(--ac);color:#fff}
#pc .lhq .lh-btn.pri:hover:not([disabled]){filter:brightness(1.12);border-color:var(--ac)}
#pc .lhq .lh-btn.dng{background:#a12a1e;border-color:#a12a1e;color:#fff}
#pc .lhq .lh-btn[disabled]{cursor:default;opacity:1;background:#f1efea;border-color:var(--ln);color:var(--mu2)}
#pc .lhq .lh-btn:focus-visible,#pc .lhq .lh-nav button:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
#pc .lhq .lh-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
#pc .lhq .lh-offer{background:var(--sf);border:1px solid var(--ln);border-top:3px solid var(--oa,var(--ac));border-radius:6px;padding:24px;margin:0 0 32px}
#pc .lhq .lh-offer .lh-eb{color:var(--oa,var(--ac))}
#pc .lhq .lh-offer .lh-h2{font:400 24px/1.25 var(--serif)}
#pc .lhq .lh-offer .lh-btn.pri{background:var(--oa,var(--ac));border-color:var(--oa,var(--ac))}
#pc .lhq .lh-dir{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));background:var(--sf);border:1px solid var(--ln);border-radius:6px;overflow:hidden}
#pc .lhq .lh-dc{display:flex;align-items:center;gap:12px;background:var(--sf);padding:14px 16px;min-width:0;box-shadow:1px 0 0 var(--ln),0 1px 0 var(--ln)}
#pc .lhq .lh-dc b{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pc .lhq .lh-dc small{display:block;font-size:12px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pc .lhq .lh-dc.lk .lh-mg{box-shadow:inset 0 -3px 0 var(--ln2);color:var(--mu2)}
#pc .lhq .lh-dc.lk b{color:var(--mu)}
#pc .lhq .lh-ups{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
#pc .lhq .lh-up{display:flex;flex-direction:column;gap:4px}
#pc .lhq .lh-up.mx{border-color:var(--ac)}
#pc .lhq .lh-up .lh-mut{min-height:20px}
#pc .lhq .lh-lvl{display:flex;align-items:center;gap:4px;margin:12px 0 4px}
#pc .lhq .lh-lvl i{flex:1;max-width:36px;height:4px;border-radius:2px;background:var(--ln)}
#pc .lhq .lh-lvl i.on{background:var(--ac)}
#pc .lhq .lh-lvl i.x{background:repeating-linear-gradient(90deg,var(--ln) 0 3px,transparent 3px 5px)}
#pc .lhq .lh-lvl span{margin-left:8px;font-size:11.5px;color:var(--mu)}
#pc .lhq .lh-dl1{margin:8px 0 16px;flex:1}
#pc .lhq .lh-dl1>div{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-top:1px solid var(--ln)}
#pc .lhq .lh-dl1 dd{margin:0;text-align:right;font-size:13px}
#pc .lhq .lh-up .lh-btn{width:100%}
#pc .lhq .lh-acc .lh-dl{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
#pc .lhq .lh-foot{border-top:1px solid var(--ln);background:var(--sf);font-size:12px;color:var(--mu2)}
#pc .lhq .lh-foot .lh-in{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:16px;padding-bottom:16px}
@container (max-width:860px){
 #pc .lhq .lh-user span{display:none}
 #pc .lhq .lh-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
 #pc .lhq .lh-kpi:nth-child(3){border-left:0}
 #pc .lhq .lh-kpi:nth-child(n+3){border-top:1px solid var(--ln)}
 #pc .lhq .lh-t thead{display:none}
 #pc .lhq .lh-t,#pc .lhq .lh-t tbody,#pc .lhq .lh-t tr,#pc .lhq .lh-t td{display:block;width:100%}
 #pc .lhq .lh-t tr{padding:14px 16px;border-bottom:1px solid var(--ln)}
 #pc .lhq .lh-t tr:last-child{border-bottom:0}
 #pc .lhq .lh-t td{border:0;padding:3px 0;display:flex;justify-content:space-between;align-items:center;gap:16px;text-align:right}
 #pc .lhq .lh-t td:not(:first-child)>*{margin-left:auto}
 #pc .lhq .lh-t td:before{content:attr(data-l);font-size:12px;color:var(--mu);text-align:left;flex:none}
 #pc .lhq .lh-t td:first-child{padding:0 0 8px;text-align:left}
 #pc .lhq .lh-t td:first-child:before{display:none}
 #pc .lhq .lh-t td.lh-acts{justify-content:flex-end;padding-top:10px}
 #pc .lhq .lh-t td.lh-acts:before{display:none}
 #pc .lhq .lh-t tr.sg{box-shadow:inset 3px 0 0 var(--ac)}
 #pc .lhq .lh-t tr.sg td:first-child{box-shadow:none}
 #pc .lhq .lh-lt .lh-bn small{max-width:none}
}
@container (max-width:600px){
 #pc .lhq .lh-in{padding:0 16px}
 #pc .lhq .lh-top .lh-in{flex-wrap:wrap;gap:0 12px;min-height:0;padding-top:10px}
 #pc .lhq .lh-brand{flex:1}
 #pc .lhq .lh-nav{order:3;flex:0 0 100%;height:42px;overflow-x:auto;scrollbar-width:none}
 #pc .lhq .lh-nav button{padding:0 10px}
 #pc .lhq .lh-nav button:first-child{padding-left:0}
 #pc .lhq .lh-main{padding:24px 0 32px}
 #pc .lhq .lh-h1{font-size:27px}
 #pc .lhq .lh-lede{font-size:14px}
 #pc .lhq .lh-kpi{padding:12px 14px}
 #pc .lhq .lh-kpi b{font-size:20px}
 #pc .lhq .lh-card,#pc .lhq .lh-offer{padding:16px}
 #pc .lhq .lh-acth{flex-wrap:wrap}
 #pc .lhq .lh-fee{text-align:left;flex:0 0 100%;padding-left:54px}
 #pc .lhq .lh-acc .lh-acth .lh-btn{flex:0 0 100%;margin-top:4px}
 #pc .lhq .lh-steps{grid-template-columns:1fr 1fr;row-gap:14px}
 #pc .lhq .lh-steps li:nth-child(2):before{display:none}
 #pc .lhq .lh-dir{grid-template-columns:1fr}
 #pc .lhq .lh-ups{grid-template-columns:1fr}
 #pc .lhq .lh-btns .lh-btn{flex:1}
 #pc .lhq .lh-foot .lh-in{flex-direction:column;gap:2px}
}`;document.head.appendChild(st)}
/* Label HQ is in the App Barn (free), and links in Messages download it too */
{const s0=PA.store;PA.store=function(){return s0.apply(this,arguments).replace(/(onclick="inst\('hq'\)">)[^<]*</,'$1Get · Free<')}}
window.bdGetHQ=function(){S.hqLink=1;if(S.apps&&S.apps.hq)return;S.apps=S.apps||{};S.apps.hq=1;snd('chime');say('Label HQ downloaded. Find it on your desktop.');updateVersion();pcR()};
/* label offers in Messages: the Sign button becomes the link into Label HQ */
{const pm=PA.msg;PA.msg=function(){let h=pm.apply(this,arguments);if(typeof h!='string')return h;
 try{h=h.replace(/<button class=go onclick="lbSign\((\d+)\)">Sign the deal<\/button>/,(m,id)=>{const o=offerOf(id),l=o&&lbById(o.lo.id);return`<button class=go onclick="bdJoin(${id})">Open link: join ${l?esc(l.n):'label'}</button>`})}catch(e){}return h}}
/* signing: no login; the welcome message points at the app. Old saves: drop the old per-label apps */
{const s1=lbSign;lbSign=function(mid){const say0=say;say=function(t){return say0.call(this,String(t).replace(' Login details are in Messages.',' Label HQ now has their theme.'))};let r;try{r=s1.apply(this,arguments)}finally{say=say0}
 try{if(S.label){const w=S.msgs[S.msgs.length-1],l=lbCur();if(w&&/Label HQ login/.test(w.body||''))w.body='Welcome to '+l.n+'! Your signing bonus of $'+l.adv.toLocaleString()+' has been paid. Open Label HQ: it now has the '+l.n+' theme and your team and studio upgrades.';S.apps=S.apps||{};S.apps.hq=1;S.hqLink=1;HQT='team'}}catch(e){console.error('label join',e)}return r}}
{const fix=()=>{try{if(S.apps){Object.keys(S.apps).forEach(k=>{if(/^hq_/.test(k))delete S.apps[k]});if(S.label)S.apps.hq=1}}catch(e){}};const lc2=loadCode;loadCode=function(){const r=lc2.apply(this,arguments);fix();return r};fix()}
{const lc=loadCode;loadCode=function(){const r=lc.apply(this,arguments);try{st()}catch(e){}return r}}
})();
