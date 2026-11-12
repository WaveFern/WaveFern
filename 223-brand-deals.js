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
/* the same logo as a smooth black-only mark on a transparent background (Label HQ brand pages): anything that differs from the logo's own background becomes black, so cut-outs stay clear */
const MC={};
BRD.mono=function(id,px){const s=px||256,k=id+'|'+s;if(MC[k])return MC[k];const b=BRD.by(id),c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');
 try{x.scale(s/64,s/64);x.fillStyle=b.bg;x.fillRect(0,0,64,64);const bg=x.getImageData(0,0,1,1).data;try{b.p(x)}catch(e){}x.setTransform(1,0,0,1,0,0);
  const d=x.getImageData(0,0,s,s),a=d.data;for(let i=0;i<a.length;i+=4){const df=Math.max(Math.abs(a[i]-bg[0]),Math.abs(a[i+1]-bg[1]),Math.abs(a[i+2]-bg[2])),al=Math.max(0,Math.min(1,(df-105)/40));a[i]=a[i+1]=a[i+2]=0;a[i+3]=Math.round(al*255)}x.putImageData(d,0,0)}catch(e){}
 return MC[k]=c.toDataURL()};
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

/* ---------- Label HQ (v51.9.0): the Brand Deals website. White page, black type, light grey hairlines; no pictures, logos,
   icons, cards or colour. A slim top bar holds the pages: Brand Deals (overview + brand directory), Active Deals, Past Deals,
   and on the right Labels and Team (record labels, unchanged; a signed label only tints those two pages).
   Clicking a brand in the directory opens its page (HQB). Type: Helvetica LT Pro for text and Norman (variable) for headings, font-weight 600 set in each heading's font shorthand (a font shorthand resets font-variation-settings), both from Adobe Fonts kit ngq0vsd, loaded the
   first time the app opens; system fonts if offline). The layout follows the window width (container queries). ---------- */
const STT=['Offer','In progress','Declined','Completed','Expired','Fell through'];
const cityOf=id=>{try{const d=wtDest(id);return d.city||d.country}catch(e){return''}};
const THM={disc:{a:'#b42318',f:'"Arial Black","Helvetica Neue",Arial,sans-serif',t:'uppercase',w:900,s:'.02em'},
 flip:{a:'#b54708',f:'Impact,"Haettenschweiler","Arial Narrow Bold",sans-serif',t:'uppercase',w:400,s:'.06em'},
 brick:{a:'#9c4221',f:'Rockwell,"Roboto Slab","Courier New",serif',t:'none',w:700,s:'0'},
 north:{a:'#0b6b93',f:'"Helvetica Neue",Helvetica,Arial,sans-serif',t:'uppercase',w:300,s:'.22em'},
 merid:{a:'#4f3cc9',f:'Georgia,"Times New Roman",serif',t:'none',w:400,s:'.04em',v:'small-caps'},
 vanta:{a:'#111',f:'Georgia,serif',t:'none',w:400,s:'.02em'},
 solst:{a:'#3d3d3a',f:'Georgia,serif',t:'none',w:400,s:'.02em'},
 obel:{a:'#000',f:'Georgia,serif',t:'none',w:400,s:'.02em'},
 crown:{a:'#8a6a12',f:'Didot,"Bodoni 72","Bodoni MT",Georgia,serif',t:'uppercase',w:400,s:'.16em'}};
const lm=()=>'';
const cap=s=>String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1);
const pill=(t,k)=>`<span class="lh-pill ${k||''}">${t}</span>`;
const kpi=(k,v,s)=>`<div class=lh-kpi><span>${k}</span><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`;
const phead=(eb,t,lede)=>`<header class=lh-ph><h1 class=lh-h1>${t}</h1>${lede?`<p class=lh-lede>${lede}</p>`:''}</header>`;
const sec=(t,meta,body)=>`<section class=lh-sec><div class=lh-sh><h2 class=lh-h2>${t}</h2>${meta?`<span class=lh-meta>${meta}</span>`:''}</div>${body}</section>`;
const empty=t=>`<p class=lh-empty>${t}</p>`;
const td=(l,v,c)=>`<td data-l="${l}"${c?` class=${c}`:''}>${v}</td>`;
const lk=(t,on)=>`<button class=lh-lk onclick="${on}">${t}</button>`;
const offerFrom=id=>BRD.open().find(o=>o.b==id)||null;
const day0=o=>Math.max(1,(o.exp||1)-EXPIRE);
/* the four stages of a trip, with the current one marked */
function steps(o){const tr=T(),tk=tr?tr.st().tickets.find(q=>q.id===o.tk):null,there=tr&&tr.loc()==o.d,hqIn=BRD.inStudio&&BRD.inStudio();
 const cur=hqIn?2:there?1:0,L=['Flight out','Car to HQ','Photoshoot','Flight home'];
 const msg=cur==0?(tk&&tk.st=='booked'?'Flight '+esc(tk.fl)+', gate '+tk.gate+'. Boarding '+tr.hm(tk.dep-120)+', gate closes '+tr.hm(tk.dep-10)+'. Everything is paid for.':'Fly to '+esc(BRD.place(o))+'.')
  :cur==1?'You are in '+esc(cityOf(o.d))+'. A company car waits outside the airport, or walk: the HQ is marked on the city map. Walk through the front door to reach the studio.':'You are in the studio. Press Start the photoshoot by the camera.';
 return`<ol class=lh-steps>${L.map((n,i)=>`<li class="${i<cur?'dn':i==cur?'on':''}"><span>${i+1}</span>${n}</li>`).join('')}</ol><p class=lh-next><b>Next step</b>${msg}</p>`}
/* the booked shoot, in full (Active Deals) */
function actBlock(o){const b=BRD.by(o.b);
 return`<div class=lh-act><div class=lh-acth><div><h3 class=lh-h3>${esc(b.n)}</h3><p class=lh-mut>${esc(cap(b.cat))} campaign, ${esc(BRD.place(o))}</p></div><div class=lh-fee><span>Fee</span><b>${fm(o.pay)}</b></div></div>
 <dl class=lh-dl><div><dt>Creative brief</dt><dd>${esc(cap(o.brief.mood))} mood, ${esc(o.brief.light.toLowerCase())} light</dd></div><div><dt>Location</dt><dd>Brand HQ, ${esc(BRD.place(o))}</dd></div><div><dt>Travel</dt><dd>Flights and car paid by the brand</dd></div><div><dt>Status</dt><dd>In progress</dd></div></dl>${steps(o)}</div>`}
/* open offers as a table with the accept / decline buttons (Active Deals) */
/* open offers as panels: brand and its Fame Level, two fields, a title and line, then View details / Accept (Decline under) */
function offerCards(offs,nov){return`<div class=lh-ocs>${offs.map(o=>{const b=BRD.by(o.b);
 return`<article class=lh-oc><div class=lh-oct><h3 class=lh-ocn>${esc(b.n)}</h3><span class=lh-tag>Fame Level ${FAME[b.t]}</span></div>
 <div class=lh-ocf><div><span>Location</span><b>${esc(BRD.place(o))}</b></div><div><span>Expires</span><b>Day ${o.exp}</b></div></div>
 <h4 class=lh-oh>${esc(cap(b.cat))} campaign</h4><p class=lh-ocd>One photoshoot day at ${esc(b.n)} HQ. ${esc(cap(o.brief.mood))} mood, ${esc(o.brief.light.toLowerCase())} light. Flights and car paid by the brand.</p>
 <div class=lh-ocb>${nov?'':`<button class=lh-btn onclick="bdBrand('${b.id}')">View details</button>`}<button class="lh-btn pri" onclick="bdAccept(${o.id})">Accept ${fm(o.pay)}</button></div><button class="lh-lk lh-dec" onclick="bdDecline(${o.id})">Decline</button></article>`}).join('')}</div>`}
function pastTable(past){return`<table class=lh-t><thead><tr><th>Brand</th><th>Location</th><th>Offered</th><th>Outcome</th><th class=lh-r>Fee</th></tr></thead><tbody>${past.map(o=>{const b=BRD.by(o.b);
 return`<tr class="${o.st==3?'':'lh-dim'}">${td('Brand',`<button class=lh-bnm onclick="bdBrand('${b.id}')">${esc(b.n)}</button>`)}${td('Location',esc(BRD.place(o)))}${td('Offered','Day '+day0(o))}${td('Outcome',STT[o.st]||'')}${td('Fee',o.res?fm(o.res.pay):fm(o.pay),'lh-r lh-num')}</tr>`}).join('')}</tbody></table>`}
const pastList=()=>st().list.filter(o=>o.st>=2).slice().reverse();
const early=()=>fl()<FAME[0];
/* Brand Deals: heading, the four figures, the booked shoot and offers in brief, the Fame Level note and the brand directory */
function dealsTab(){const s=st(),L=fl(),act=BRD.active(),offs=BRD.open(),open=BR.filter(b=>FAME[b.t]<=L).length;
 let h=phead('','Brand Deals','Brands book you for one photoshoot day at their own headquarters abroad. Every trip is paid for by the brand, and the fee is set by your recent income.');
 h+=`<div class=lh-kpis>${kpi('Completed shoots',s.done)}${kpi('Earned from brands',fm(s.earned))}${kpi('Open offers',offs.length)}${kpi('Fame Level',L)}</div>`;
 h+=`<section class=lh-par aria-label="Our partnered brands"><div class=lh-parh><h2 class=lh-h4>Our partnered brands</h2></div><div class=lh-mq><div class=lh-mt>${[0,1].map(n=>`<ul${n?' aria-hidden=true':''}>${BR.map(b=>`<li><button class=lh-pn${n?' tabindex=-1':''} onclick="bdBrand('${b.id}')">${esc(b.n)}</button></li>`).join('')}</ul>`).join('')}</div></div></section>`;
 const ab=act?(()=>{const b=BRD.by(act.b);return`<div class=lh-sum><p class=lh-big>${esc(b.n)}</p><p class=lh-mut>${esc(cap(b.cat))} campaign in ${esc(BRD.place(act))}. Fee ${fm(act.pay)}.</p>${lk('View the booking',"bdTab('active')")}</div>`})()
  :empty(early()?'Brands start writing at Fame Level '+FAME[0]+'.':'No shoot booked. Brands write now and then as your fame grows. Every deal is at the brand\'s own HQ abroad and the brand pays for the whole trip.');
 const nx=FAME.find(f=>f>L);
 h+=`<section class=lh-sec><div class=lh-sh><h2 class=lh-h2>Active Engagement</h2></div>${ab}</section>`;
 h+=sec('Open Offers',offs.length?offs.length+(offs.length==1?' offer':' offers')+' &nbsp;·&nbsp; '+lk('View offers',"bdTab('active')"):'',offs.length?offerCards(offs):empty(early()?'Brands start writing at Fame Level '+FAME[0]+'.':'No offers right now. New offers arrive in Messages.'));
 h+=`<div class=lh-fame><h2 class=lh-h4>About Fame Level</h2><p>Brands only write to artists they have heard of. The first offers come at Fame Level ${FAME[0]}, and the larger names wait for Fame Level ${FAME.slice(1,-1).join(', ')} or ${FAME[FAME.length-1]}. ${L<FAME[0]?'You are at Fame Level '+L+'.':nx?'You are at Fame Level '+L+', and the next brands open at Fame Level '+nx+'.':'You are at Fame Level '+L+': every brand can write to you.'}</p></div>`;
 h+=`<section class="lh-sec lh-cat"><div class=lh-sh><h2 class=lh-h2>Brand directory</h2><span class=lh-meta>${open} of ${BR.length} open to you</span></div><div class=lh-tabs>${[['all','All brands',BR.length],['open','Open to you',open],['locked','Higher Fame Level',BR.length-open]].map(t=>`<button class="${HQF==t[0]?'on':''}" onclick="bdFilter('${t[0]}')">${t[1]}<em>${t[2]}</em></button>`).join('')}</div><ul class=lh-grid>${BR.filter(b=>HQF=='all'||(HQF=='open')==(FAME[b.t]<=L)).map(b=>{const lkd=FAME[b.t]>L,of=offerFrom(b.id);
   return`<li class="${lkd?'lk':''}"><button class=lh-item onclick="bdBrand('${b.id}')"><span class=lh-in1>${esc(b.n)}</span><span class=lh-in2><span>Fame Level ${FAME[b.t]}${of?' · Offer waiting':''}</span><span class=lh-vo>View offer</span></span></button></li>`}).join('')}</ul></section>`;
 return h}
/* Active Deals: the booked shoot and every open offer */
function activeTab(){const act=BRD.active(),offs=BRD.open();
 let h=phead('','Active Deals','Your booked photoshoot and the offers waiting for a reply. Offers also arrive in Messages, where you can accept them too.');
 h+=sec('In progress',act?'1 booking':'',act?actBlock(act):empty(early()?'Brands start writing at Fame Level '+FAME[0]+'.':'No shoot booked. Accept an offer below or in Messages and the brand books your flight at once.'));
 h+=sec('Open offers',offs.length?offs.length+' waiting':'',offs.length?offerCards(offs):empty(early()?'Brands start writing at Fame Level '+FAME[0]+'.':'No offers right now. New offers arrive in Messages.'));
 return h}
/* Past Deals: every finished, declined, expired or failed offer the save still holds */
function pastTab(){const s=st(),past=pastList();
 let h=phead('','Past Deals','Every brand offer that has ended: shoots you completed, offers you declined and ones that ran out of time.');
 h+=`<div class="lh-kpis lh-k3">${kpi('Completed shoots',s.done)}${kpi('Earned from brands',fm(s.earned))}${kpi('Offers ended',past.length)}</div>`;
 h+=sec('History',past.length?past.length+(past.length==1?' deal':' deals'):'',past.length?pastTable(past):empty('Nothing here yet. Finished and declined offers are listed here.'));
 return h}
/* one brand's page, opened from the directory */
function brandPage(id){const b=BR.find(x=>x.id==id);if(!b)return dealsTab();const L=fl(),need=FAME[b.t],of=offerFrom(b.id),act=BRD.active(),mine=act&&act.b==b.id?act:null,hist=pastList().filter(o=>o.b==b.id);
 let h=`<nav class=lh-crumb>${lk('Brand Deals',"bdTab('deals')")}<span>/</span><span>${esc(b.n)}</span></nav><img class=lh-logo src="${BRD.mono(b.id)}" alt="${esc(b.n)} logo" width=104 height=104>`+phead('',esc(b.n),'');
 h+=`<dl class="lh-dl lh-bdl"><div><dt>Headquarters</dt><dd>${esc(cityOf(HQC[b.id]))}</dd></div><div><dt>Category</dt><dd>${esc(cap(b.cat))}</dd></div><div><dt>Required Fame Level</dt><dd>${need}</dd></div><div><dt>Your Fame Level</dt><dd>${L}${L>=need?'':' (needs '+(need-L)+' more)'}</dd></div></dl>`;
 const body=mine?actBlock(mine):of?offerCards([of],1):empty(L<need?esc(b.n)+' works with artists from Fame Level '+need+'. Keep growing and they may write to you.':'No offer from '+esc(b.n)+' right now. When they want you for a campaign, the offer arrives in Messages and appears here.');
 h+=sec(mine?'Your booking':'Offer',mine?'In progress':of?'Expires Day '+of.exp:'',body);
 if(hist.length)h+=sec('History with '+esc(b.n),'',pastTable(hist));
 return h}
let HQT='deals',HQJ=0,HQB=0,HQF='all';window.bdFilter=f=>{HQF=f;const m=document.querySelector('#pc .mn'),t=m?m.scrollTop:0;pcR();const n=document.querySelector('#pc .mn');if(n)n.scrollTop=t};window.bdTab=t=>{HQT=t;HQB=0;pcR();hqTop()};window.bdOffer=id=>{HQJ=id;pcR()};
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
const hqTop=()=>{try{const m=document.querySelector('#pc .mn');if(m)m.scrollTop=0}catch(e){}};
window.bdBrand=id=>{HQT='deals';HQB=id;pcR();hqTop()};
const hqFont=()=>{if(document.getElementById('lhqtk'))return;const a=document.createElement('link');a.id='lhqtk';a.rel='stylesheet';a.href='https://use.typekit.net/ngq0vsd.css';document.head.appendChild(a)};
PA.hq=function(){const L=labels()&&S.label?lbCur():null;if(!L&&HQT=='team')HQT='deals';if(!labels()&&HQT=='labels')HQT='deals';if(HQT!='deals')HQB=0;
 try{hqFont()}catch(e){}
 const th=L&&(HQT=='labels'||HQT=='team')?THM[L.id]:null,sty=th?`--ac:${th.a}`:'';
 const tab=(k,n,b)=>`<button class="${HQT==k?'on':''}" onclick="bdTab('${k}')"${HQT==k?' aria-current="page"':''}>${n}${b?`<em>${b}</em>`:''}</button>`;
 const nav=tab('deals','Brand Deals')+tab('active','Active Deals',BRD.open().length||'')+tab('past','Past Deals');
 const nav2=(labels()?tab('labels','Labels',HQJ?1:''):'')+(L?tab('team','Team'):'');
 let body;try{body=HQT=='team'?teamTab():HQT=='labels'?labelsTab():HQT=='active'?activeTab():HQT=='past'?pastTab():HQB?brandPage(HQB):joinCard()+dealsTab()}catch(e){console.error('label hq',e);body=empty('Label HQ hit a problem. Close and open it again.')}
 return`<div class="bdw lhq${th?' lhth':''}" style="${sty}"><header class=lh-top><div class=lh-in><nav class=lh-nav aria-label="Brand Deals">${nav}</nav>${nav2?`<nav class="lh-nav lh-nav2" aria-label="Labels">${nav2}</nav>`:''}</div></header>
 <main class=lh-main><div class=lh-in>${body}</div></main></div>`};
/* the app fills its window edge to edge */
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{const m=document.querySelector('#pc .mn');if(m)m.classList.toggle('lhqmn',app=='hq'&&!!m.querySelector('.lhq'))}catch(e){}return r}}
{const st=document.createElement('style');st.textContent=`#pc .lhqmn{padding:0!important;background:#fff}
#pc .lhq{--ac:#111;--bg:#fff;--soft:#f5f5f4;--ln:#e8e8e6;--ln2:#d4d4d1;--ink:#111;--mu:#666;--mu2:#9b9b98;--sans:helvetica-lt-pro,"Helvetica Neue",Helvetica,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--serif:"norman-variable","Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
 container-type:inline-size;display:flex;flex-direction:column;min-height:100%;width:100%;box-sizing:border-box;background:var(--bg);color:var(--ink);font:14px/1.55 var(--sans);text-align:left;-webkit-font-smoothing:antialiased;text-shadow:none;letter-spacing:0}
#pc .lhq *{box-sizing:border-box}
#pc .lhq h1,#pc .lhq h2,#pc .lhq h3,#pc .lhq p,#pc .lhq ul,#pc .lhq ol,#pc .lhq dl{margin:0;padding:0}
#pc .lhq button{font-family:var(--sans)}
#pc .lhq .lh-in{margin:0;padding:0 clamp(28px,4.5vw,88px);width:100%}
#pc .lhq .lh-top{background:var(--bg);border-bottom:1px solid var(--ln);position:sticky;top:0;z-index:2}
#pc .lhq .lh-top .lh-in{display:flex;align-items:stretch;justify-content:space-between;gap:24px;height:48px}
#pc .lhq .lh-nav{display:flex;gap:28px;align-items:stretch;min-width:0}
#pc .lhq .lh-nav button{all:unset;cursor:pointer;display:flex;align-items:center;gap:5px;font:400 13px var(--sans);color:var(--mu);border-bottom:1px solid transparent;margin-bottom:-1px;white-space:nowrap}
#pc .lhq .lh-nav button:hover{color:var(--ink)}
#pc .lhq .lh-nav button.on{color:var(--ink);border-bottom-color:var(--ink);font-weight:700}
#pc .lhq .lh-nav em{font-style:normal;font-size:11px;color:var(--mu2);font-variant-numeric:tabular-nums}
#pc .lhq .lh-main{flex:1;padding:48px 0 80px}
#pc .lhq .lh-ph{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:24px 64px;align-items:end;margin:0 0 44px}
#pc .lhq .lh-h1{font:600 44px/1.05 var(--serif);letter-spacing:-.01em;color:var(--ink)}
#pc .lhq .lh-lede{font-size:15px;line-height:1.6;color:var(--mu);max-width:520px;justify-self:end}
#pc .lhq .lh-h2{font:600 26px/1.2 var(--serif);color:var(--ink)}
#pc .lhq .lh-h3{font:600 26px/1.2 var(--serif);color:var(--ink)}
#pc .lhq .lh-h4{font:700 13px/1.4 var(--sans);color:var(--ink);margin:0 0 6px}
#pc .lhq .lh-mut{color:var(--mu);font-size:13.5px}
#pc .lhq .lh-grow{flex:1;min-width:0}
#pc .lhq .lh-lk{all:unset;cursor:pointer;font:700 13px var(--sans);color:var(--ink);text-decoration:underline;text-decoration-color:var(--ln2);text-underline-offset:4px;transition:text-decoration-color .12s}
#pc .lhq .lh-lk:hover{text-decoration-color:var(--ink)}
/* the four figures: one row, hairlines between, no boxes */
#pc .lhq .lh-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--ink);border-bottom:1px solid var(--ln);margin:0 0 64px}
#pc .lhq .lh-kpis.lh-k3{grid-template-columns:repeat(3,minmax(0,1fr))}
#pc .lhq .lh-kpi{padding:16px 24px 18px;border-left:1px solid var(--ln);min-width:0}
#pc .lhq .lh-kpi:first-child{border-left:0;padding-left:0}
#pc .lhq .lh-kpi span{display:block;font-size:12.5px;color:var(--mu)}
#pc .lhq .lh-kpi b{display:block;font:600 34px/1.15 var(--serif);color:var(--ink);margin-top:6px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pc .lhq .lh-kpi small{display:block;font-size:12px;color:var(--mu2);margin-top:2px}
#pc .lhq .lh-sec{margin:0 0 56px}
#pc .lhq .lh-sec .lh-kpis{margin:0}
#pc .lhq .lh-sh{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:0 0 14px;margin:0 0 4px;border-bottom:1px solid var(--ln)}
#pc .lhq .lh-meta{font-size:12.5px;color:var(--mu);white-space:nowrap}
#pc .lhq .lh-empty{padding:18px 0 0;color:var(--mu);font-size:14px;max-width:560px}
/* overview: booked shoot and offers side by side, then the Fame Level note */
#pc .lhq .lh-logo{display:block;width:104px;height:104px;margin:0 0 22px}
#pc .lhq .lh-par{margin:-24px 0 56px}
#pc .lhq .lh-parh .lh-h4{margin:0 0 10px;color:var(--mu);font-weight:400}
#pc .lhq .lh-mq{overflow:hidden;border-top:1px solid var(--ln);border-bottom:1px solid var(--ln)}
#pc .lhq .lh-mt{display:flex;width:max-content;animation:lhmq 70s linear infinite}
#pc .lhq .lh-mq:hover .lh-mt,#pc .lhq .lh-mq:focus-within .lh-mt{animation-play-state:paused}
#pc .lhq .lh-mt ul{list-style:none;display:flex;flex:none}
#pc .lhq .lh-pn{all:unset;cursor:pointer;display:block;padding:20px 28px 20px 0;margin-right:28px;font:600 30px/1.1 var(--serif);white-space:nowrap;color:var(--ink)}
#pc .lhq .lh-pn:hover{color:var(--mu)}
#pc .lhq .lh-pn:focus-visible{outline:1px solid var(--ink);outline-offset:-4px}
@keyframes lhmq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){#pc .lhq .lh-mq{overflow-x:auto}#pc .lhq .lh-mt{animation:none}}
#pc .lhq .lh-ocs{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:20px;padding-top:20px}
#pc .lhq .lh-oc{border:1px solid var(--ln);padding:22px 22px 18px;display:flex;flex-direction:column;min-width:0}
#pc .lhq .lh-oct{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--ln)}
#pc .lhq .lh-ocn{font:600 26px/1.15 var(--serif);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pc .lhq .lh-tag{font-size:12.5px;color:var(--mu);white-space:nowrap}
#pc .lhq .lh-ocf{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0 20px}
#pc .lhq .lh-ocf>div{background:var(--soft);padding:10px 12px;min-width:0}
#pc .lhq .lh-ocf span{display:block;font-size:12px;color:var(--mu)}
#pc .lhq .lh-ocf b{display:block;font-weight:700;font-size:13.5px;margin-top:1px;line-height:1.35}
#pc .lhq .lh-oh{font:600 22px/1.2 var(--serif);margin:0 0 6px}
#pc .lhq .lh-ocd{font-size:13.5px;color:var(--mu);flex:1;margin:0 0 20px}
#pc .lhq .lh-ocb{display:flex;gap:8px}
#pc .lhq .lh-ocb .lh-btn{flex:1;padding:0 10px}
#pc .lhq .lh-dec{align-self:center;margin-top:12px;font-weight:400;color:var(--mu);font-size:12.5px}
#pc .lhq .lh-tabs{display:flex;gap:26px;margin:0 0 4px;padding:6px 0 14px;flex-wrap:wrap}
#pc .lhq .lh-tabs button{all:unset;cursor:pointer;font:400 13.5px var(--sans);color:var(--mu);padding-bottom:5px;border-bottom:1px solid transparent}
#pc .lhq .lh-tabs button:hover{color:var(--ink)}
#pc .lhq .lh-tabs button.on{color:var(--ink);border-bottom-color:var(--ink)}
#pc .lhq .lh-tabs em{font-style:normal;font-size:12px;color:var(--mu2);margin-left:6px}
#pc .lhq .lh-tabs button:focus-visible{outline:1px solid var(--ink);outline-offset:3px}
#pc .lhq .lh-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 64px}
#pc .lhq .lh-two .lh-sec{margin-bottom:48px}
#pc .lhq .lh-sum{padding:18px 0 0}
#pc .lhq .lh-big{font:600 22px/1.3 var(--serif);color:var(--ink)}
#pc .lhq .lh-sum .lh-mut{margin:4px 0 14px}
#pc .lhq .lh-fame{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 64px;border-top:1px solid var(--ln);padding:20px 0 0;margin:0 0 80px}
#pc .lhq .lh-fame .lh-h4{margin:0}
#pc .lhq .lh-fame p{font-size:14px;color:var(--mu);max-width:520px}
/* brand directory: a catalogue of names */
#pc .lhq .lh-cat .lh-sh{border-bottom:0;margin:0 0 4px}
#pc .lhq .lh-grid{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0 48px}
#pc .lhq .lh-grid li{border-top:1px solid var(--ln);min-width:0}
#pc .lhq .lh-item{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:28px;width:100%;min-height:106px;padding:20px 0 18px}
#pc .lhq .lh-in1{font:600 28px/1.15 var(--serif);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pc .lhq .lh-in2{display:flex;justify-content:space-between;align-items:baseline;gap:12px;font-size:12.5px;color:var(--mu)}
#pc .lhq .lh-in2>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pc .lhq .lh-vo{color:var(--ink);font-weight:700;white-space:nowrap;text-decoration:underline;text-decoration-color:transparent;text-underline-offset:4px;transition:text-decoration-color .12s}
#pc .lhq .lh-item:hover .lh-vo,#pc .lhq .lh-item:focus-visible .lh-vo{text-decoration-color:var(--ink)}
#pc .lhq .lh-grid li.lk .lh-in1{color:var(--mu2)}
#pc .lhq .lh-grid li.lk .lh-vo{color:var(--mu)}
/* a booked shoot */
#pc .lhq .lh-act{padding:22px 0 0}
#pc .lhq .lh-acth{display:flex;align-items:flex-end;justify-content:space-between;gap:24px}
#pc .lhq .lh-acth .lh-mut{margin-top:4px}
#pc .lhq .lh-fee{text-align:right;white-space:nowrap}
#pc .lhq .lh-fee span{display:block;font-size:12.5px;color:var(--mu)}
#pc .lhq .lh-fee b{font:600 26px/1.2 var(--serif);font-variant-numeric:tabular-nums}
#pc .lhq .lh-dl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:24px 0 0;border-top:1px solid var(--ln)}
#pc .lhq .lh-dl>div{padding:14px 20px 14px 0;min-width:0}
#pc .lhq dt{font-size:12.5px;color:var(--mu);margin:0}
#pc .lhq dd{margin:3px 0 0;font-size:14px;color:var(--ink)}
#pc .lhq .lh-bdl{margin:0 0 56px;border-top:1px solid var(--ink);border-bottom:1px solid var(--ln)}
#pc .lhq .lh-steps{list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0 4px;margin:8px 0 0}
#pc .lhq .lh-steps li{border-top:1px solid var(--ln);padding:12px 12px 0 0;font-size:13.5px;color:var(--mu2);min-width:0}
#pc .lhq .lh-steps li span{display:block;font-size:12px;margin:0 0 2px;font-variant-numeric:tabular-nums}
#pc .lhq .lh-steps li.dn{color:var(--mu);border-top-color:var(--ink)}
#pc .lhq .lh-steps li.on{color:var(--ink);font-weight:700;border-top:2px solid var(--ink);padding-top:11px}
#pc .lhq .lh-next{margin:24px 0 0;font-size:14px;color:var(--ink);max-width:680px}
#pc .lhq .lh-next b{display:block;font-weight:700;font-size:12.5px;color:var(--mu);margin:0 0 3px}
/* tables: offers, history, labels */
#pc .lhq .lh-tw{overflow:hidden}
#pc .lhq .lh-t{width:100%;border-collapse:collapse;font-size:14px}
#pc .lhq .lh-t th{text-align:left;font-size:12.5px;font-weight:400;color:var(--mu);padding:14px 16px 10px 0;border-bottom:1px solid var(--ln);white-space:nowrap}
#pc .lhq .lh-t td{padding:16px 16px 16px 0;border-bottom:1px solid var(--ln);vertical-align:middle;color:var(--ink)}
#pc .lhq .lh-t .lh-r{text-align:right;padding-right:0}
#pc .lhq .lh-t th.lh-r+th.lh-r,#pc .lhq .lh-t td.lh-r+td.lh-r{padding-left:24px}
#pc .lhq .lh-num{font-variant-numeric:tabular-nums;white-space:nowrap}
#pc .lhq .lh-t tr.lh-dim td{color:var(--mu)}
#pc .lhq .lh-t tr.sg td{background:var(--soft)}
#pc .lhq .lh-bnm{all:unset;cursor:pointer;font:600 22px/1.2 var(--serif);color:var(--ink)}
#pc .lhq .lh-bnm:hover{text-decoration:underline;text-decoration-color:var(--ln2);text-underline-offset:4px}
#pc .lhq .lh-t tr.lh-dim .lh-bnm{color:var(--mu)}
#pc .lhq .lh-bn{display:flex;align-items:center;gap:12px;min-width:0}
#pc .lhq .lh-bn b{display:block;font:600 22px/1.2 var(--serif)}
#pc .lhq .lh-bn small{display:block;font-size:13px;color:var(--mu);margin-top:2px}
#pc .lhq .lh-lt .lh-bn small{max-width:380px}
#pc .lhq .lh-acts{white-space:nowrap}
#pc .lhq .lh-acts .lh-btn+.lh-btn{margin-left:8px}
#pc .lhq .lh-req{font-size:12.5px;color:var(--mu)}
#pc .lhq .lh-star{color:var(--ink);white-space:nowrap}
#pc .lhq .lh-pill{display:inline-block;font-size:13px;color:var(--mu);white-space:nowrap}
#pc .lhq .lh-pill.ok,#pc .lhq .lh-pill.ac{color:var(--ink);font-weight:700}
#pc .lhq .lh-crumb{display:flex;gap:8px;align-items:baseline;font-size:13px;color:var(--mu);margin:-24px 0 28px}
#pc .lhq .lh-crumb .lh-lk{font-weight:400;color:var(--mu)}
#pc .lhq .lh-crumb .lh-lk:hover{color:var(--ink)}
/* buttons: square, black or outlined */
#pc .lhq .lh-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 18px;border:1px solid var(--ink);background:var(--bg);color:var(--ink);font:700 13px var(--sans);white-space:nowrap;transition:background .12s,color .12s}
#pc .lhq .lh-btn:hover:not([disabled]){background:var(--soft)}
#pc .lhq .lh-btn.pri{background:var(--ac);border-color:var(--ac);color:#fff}
#pc .lhq .lh-btn.pri:hover:not([disabled]){background:#333;border-color:#333}
#pc .lhq.lhth .lh-btn.pri:hover:not([disabled]){background:var(--ac);border-color:var(--ac);opacity:.88}
#pc .lhq .lh-btn.dng{background:#111;border-color:#111;color:#fff}
#pc .lhq .lh-btn[disabled]{cursor:default;background:var(--soft);border-color:var(--ln);color:var(--mu2)}
#pc .lhq .lh-btn:focus-visible,#pc .lhq .lh-nav button:focus-visible,#pc .lhq .lh-lk:focus-visible,#pc .lhq .lh-item:focus-visible,#pc .lhq .lh-bnm:focus-visible{outline:1px solid var(--ink);outline-offset:3px}
#pc .lhq .lh-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:24px}
/* label pages (Labels, Team): same type and rules; a signed label tints only the buttons */
#pc .lhq .lh-card{border-top:1px solid var(--ln);padding:20px 0 0}
#pc .lhq .lh-offer{border-top:1px solid var(--ink);border-bottom:1px solid var(--ln);padding:24px 0;margin:0 0 48px}
#pc .lhq .lh-offer .lh-eb{font-size:12.5px;color:var(--mu);margin:0 0 6px}
#pc .lhq .lh-offer .lh-h2{font:600 24px/1.25 var(--serif)}
#pc .lhq .lh-offer .lh-lede{justify-self:auto;margin-top:8px;max-width:620px}
#pc .lhq .lh-offer .lh-btn.pri{background:var(--ink);border-color:var(--ink)}
#pc .lhq .lh-offer .lh-dl,#pc .lhq .lh-acc .lh-dl{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
#pc .lhq .lh-acc{border-top:0;padding-top:16px}
#pc .lhq .lh-acc .lh-h3{font-size:22px}
#pc .lhq .lh-ups{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:0 40px}
#pc .lhq .lh-up{display:flex;flex-direction:column;gap:2px;padding:20px 0 28px}
#pc .lhq .lh-up .lh-eb{font-size:12.5px;color:var(--mu)}
#pc .lhq .lh-up .lh-h3{font-size:20px}
#pc .lhq .lh-up.mx{border-top-color:var(--ink)}
#pc .lhq .lh-up .lh-mut{min-height:20px}
#pc .lhq .lh-lvl{display:flex;align-items:center;gap:4px;margin:12px 0 4px}
#pc .lhq .lh-lvl i{flex:1;max-width:36px;height:2px;background:var(--ln)}
#pc .lhq .lh-lvl i.on{background:var(--ink)}
#pc .lhq .lh-lvl i.x{background:repeating-linear-gradient(90deg,var(--ln) 0 3px,transparent 3px 5px)}
#pc .lhq .lh-lvl span{margin-left:8px;font-size:12px;color:var(--mu)}
#pc .lhq .lh-dl1{margin:8px 0 16px;flex:1}
#pc .lhq .lh-dl1>div{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-top:1px solid var(--ln)}
#pc .lhq .lh-dl1 dd{margin:0;text-align:right;font-size:13px}
#pc .lhq .lh-up .lh-btn{width:100%}
@container (max-width:980px){
 #pc .lhq .lh-dl{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@container (max-width:860px){
 #pc .lhq .lh-main{padding:40px 0 64px}
 #pc .lhq .lh-ph{grid-template-columns:1fr;gap:12px}
 #pc .lhq .lh-ocs{grid-template-columns:1fr}
 #pc .lhq .lh-lede{justify-self:start}
 #pc .lhq .lh-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
 #pc .lhq .lh-kpis.lh-k3{grid-template-columns:repeat(3,minmax(0,1fr))}
 #pc .lhq .lh-kpis:not(.lh-k3) .lh-kpi:nth-child(3){border-left:0;padding-left:0}
 #pc .lhq .lh-kpis:not(.lh-k3) .lh-kpi:nth-child(n+3){border-top:1px solid var(--ln)}
 #pc .lhq .lh-two{grid-template-columns:1fr}
 #pc .lhq .lh-fame{grid-template-columns:1fr}
 #pc .lhq .lh-t thead{display:none}
 #pc .lhq .lh-t,#pc .lhq .lh-t tbody,#pc .lhq .lh-t tr,#pc .lhq .lh-t td{display:block;width:100%}
 #pc .lhq .lh-t tr{padding:16px 0;border-bottom:1px solid var(--ln)}
 #pc .lhq .lh-t td{border:0;padding:3px 0;display:flex;justify-content:space-between;align-items:center;gap:16px;text-align:right}
 #pc .lhq .lh-t td.lh-r+td.lh-r{padding-left:0}
 #pc .lhq .lh-t td:not(:first-child)>*{margin-left:auto}
 #pc .lhq .lh-t td:before{content:attr(data-l);font-size:12.5px;color:var(--mu);text-align:left;flex:none}
 #pc .lhq .lh-t td:first-child{padding:0 0 8px;text-align:left}
 #pc .lhq .lh-t td:first-child:before{display:none}
 #pc .lhq .lh-t td.lh-acts{justify-content:flex-end;padding-top:12px}
 #pc .lhq .lh-t td.lh-acts:before{display:none}
 #pc .lhq .lh-t tr.sg{background:var(--soft)}
 #pc .lhq .lh-t tr.sg td{background:none}
 #pc .lhq .lh-lt .lh-bn small{max-width:none}
}
@container (max-width:600px){
 #pc .lhq .lh-in{padding:0 16px}
 #pc .lhq .lh-top .lh-in{gap:20px;overflow-x:auto;scrollbar-width:none}
 #pc .lhq .lh-nav{gap:20px}
 #pc .lhq .lh-main{padding:28px 0 48px}
 #pc .lhq .lh-h1{font-size:34px}
 #pc .lhq .lh-lede{font-size:14px}
 #pc .lhq .lh-kpi{padding:12px 14px 14px}
 #pc .lhq .lh-kpi b{font-size:21px}
 #pc .lhq .lh-kpis.lh-k3{grid-template-columns:1fr}
 #pc .lhq .lh-kpis.lh-k3 .lh-kpi{border-left:0;padding-left:0;border-top:1px solid var(--ln)}
 #pc .lhq .lh-kpis.lh-k3 .lh-kpi:first-child{border-top:0}
 #pc .lhq .lh-grid{grid-template-columns:1fr}
 #pc .lhq .lh-item{min-height:0;gap:14px}
 #pc .lhq .lh-acth{flex-wrap:wrap}
 #pc .lhq .lh-fee{text-align:left;flex:0 0 100%}
 #pc .lhq .lh-dl{grid-template-columns:1fr 1fr}
 #pc .lhq .lh-steps{grid-template-columns:1fr 1fr;row-gap:14px}
 #pc .lhq .lh-acc .lh-acth .lh-btn{flex:0 0 100%;margin-top:4px}
 #pc .lhq .lh-ups{grid-template-columns:1fr}
 #pc .lhq .lh-btns .lh-btn{flex:1}
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
