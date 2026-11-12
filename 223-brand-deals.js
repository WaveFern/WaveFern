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

/* ---------- Label HQ: Brand deals tab ---------- */
const STT=['Offer','In progress','Declined','Done','Expired','Fell through'];
const cityOf=id=>{try{const d=wtDest(id);return d.city||d.country}catch(e){return''}};
function row(o,btns){const b=BRD.by(o.b);return`<div class="bdrow${o.st==1?' act':''}"><img class=lg src="${BRD.logo(o.b,64)}"><div class=tx><b>${esc(b.n)}</b><small>${esc(b.cat)} campaign · HQ in ${esc(BRD.place(o))}</small><small>${fm(o.pay)} · ${o.brief.mood} mood, ${o.brief.light} light${o.st==0?' · expires Day '+o.exp:''}${o.st>=2?' · '+STT[o.st]+(o.res?' · paid '+fm(o.res.pay):''):''}</small></div>${btns?`<div class=bt>${btns}</div>`:''}</div>`}
/* the four stages of a trip, with the current one lit */
function steps(o){const tr=T(),tk=tr?tr.st().tickets.find(q=>q.id===o.tk):null,there=tr&&tr.loc()==o.d,hqIn=BRD.inStudio&&BRD.inStudio();
 const cur=hqIn?2:there?1:0,L=['Flight out','Car to HQ','Photoshoot','Flight home'];
 const msg=cur==0?(tk&&tk.st=='booked'?'Flight '+esc(tk.fl)+' · Gate '+tk.gate+' · boards '+tr.hm(tk.dep-120)+' · gate closes '+tr.hm(tk.dep-10)+'. Everything is paid for.':'Fly to '+esc(BRD.place(o))+'.')
  :cur==1?'You are in '+esc(cityOf(o.d))+'. A company car waits outside the airport, or walk: the HQ is marked on the city map. Walk through the front door to reach the studio.':'You are in the studio. Press Start the photoshoot by the camera.';
 return`<div class=bdsteps>${L.map((n,i)=>`<span class="${i<cur?'dn':i==cur?'on':''}">${i+1}. ${n}</span>`).join('')}</div><p class=m style="margin:6px 0 0">${msg}</p>`}
function dealsTab(){const s=st(),L=fl(),act=BRD.active(),offs=BRD.open(),past=s.list.filter(o=>o.st>=2).slice(-8).reverse();
 const ban=BRD.facade?`<img class=bdban src="${BRD.facade(act?act.b:null,act?BRD.place(act):null)}">`:'';
 let side=`<div class=bdst><span><small>Brand shoots</small><b>${s.done}</b></span><span><small>Earned</small><b>${fm(s.earned)}</b></span><span><small>Fame Level</small><b>${L}</b></span></div>`;
 side+='<h3>Active shoot</h3>'+(act?`${row(act)}${steps(act)}`:`<p class=m>No shoot booked. ${L<FAME[0]?'Brands start writing at Fame Level '+FAME[0]+'.':'Brands write now and then as your fame grows. Every deal is at the brand\'s own HQ abroad and the brand pays for the whole trip.'}</p>`);
 let h=`<div class=hqx><div class=bdtop><div class=bdhero>${ban}</div><div class=bdside>${side}</div></div>`;
 h+='<h3>Offers</h3>'+(offs.length?`<div class=bdlist>${offs.map(o=>row(o,`<button class=go onclick="bdAccept(${o.id})">Accept</button><button onclick="bdDecline(${o.id})">Decline</button>`)).join('')}</div>`:`<p class=m>${L<FAME[0]?'Brands start writing at Fame Level '+FAME[0]+'.':'No offers right now.'}</p>`);
 if(past.length)h+='<h3>Past deals</h3><div class=bdlist>'+past.map(o=>row(o)).join('')+'</div>';
 h+='<h3>Brands</h3><div class=bdg>'+BR.map(b=>{const lk=FAME[b.t]>L;return`<div class="${lk?'lk':''}"><img src="${BRD.logo(b.id,64)}"><b>${esc(b.n)}</b><small>HQ ${esc(cityOf(HQC[b.id]))}</small><small>${lk?'Fame '+FAME[b.t]:'Open'}</small></div>`}).join('')+'</div></div>';return h}
/* ---- Label HQ: Brand deals | Labels | Team (once signed). Each record label themes the whole app. ---- */
const COL={disc:['#e05252','#2a1517'],flip:['#ffb300','#2a2211'],brick:['#d2763f','#2a1c14'],north:['#5ac8fa','#102230'],merid:['#9c7bff','#1a1633'],crown:['#e6b422','#1f1b3a']};
const LROWS=['....GG....','...GGGG...','..NNNNNN..','..NWNNWN..','..NNNNNN..','..NWNNWN..','..NNNNNN..','..NWNNWN..','..NNDDNN..','KKKKDDKKKK'];
const LIC={};const lIc=id=>LIC[id]||(LIC[id]=mkIc(LROWS,{G:COL[id][0],N:COL[id][0]+'99',W:'#ffffffcc',D:COL[id][0],K:'#1a1d2b'}));
let HQT='deals',HQJ=0;window.bdTab=t=>{HQT=t;pcR()};window.bdOffer=id=>{HQJ=id;pcR()};
const labels=()=>typeof LABELS_ENABLED!='undefined'&&LABELS_ENABLED&&typeof LABELS!='undefined';
const offerOf=mid=>S.msgs.find(m=>m.id==mid&&m.lo&&m.lo.st==0);
/* the link in a label's offer message: opens Label HQ and asks if you want to join */
window.bdJoin=function(mid){if(!offerOf(mid)||S.label)return;S.hqLink=1;S.apps=S.apps||{};S.apps.hq=1;HQJ=mid;HQT='labels';openPC();app='hq';pcR()};
window.bdJoinYes=function(){const mid=HQJ;HQJ=0;if(offerOf(mid)&&!S.label){lbSign(mid);HQT='team'}pcR()};
window.bdJoinNo=function(){HQJ=0;snd('pop');pcR()};
function joinCard(){const m=HQJ&&offerOf(HQJ);if(!m||S.label){HQJ=0;return''}const l=lbById(m.lo.id);if(!l)return'';
 return`<div class=bdjoin><img src="${lIc(l.id)}" style="width:44px;image-rendering:pixelated"><div class=tx><b>Do you want to join ${esc(l.n)}?</b><small>${esc(l.pitch)}</small><small>Signing bonus $${l.adv.toLocaleString()} · they keep ${Math.round(l.cut*100)}% of your streaming income · you can leave later for a fee.</small></div><div class=bt><button class=go onclick="bdJoinYes()">Join ${esc(l.n)}</button><button onclick="bdJoinNo()">Not now</button></div></div>`}
function labelsTab(){const L=S.label,rows=LABELS.map(l=>{const sg=L&&L.id==l.id,off=S.msgs.find(m=>m.lo&&m.lo.id==l.id&&m.lo.st==0),ok=typeof lbElig=='function'&&lbElig(l);
  const stt=sg?'<b style="color:var(--hqa)">Signed</b>':off?`<button class=go onclick="bdOffer(${off.id})">Offer waiting</button>`:ok?'<small class=m>Eligible. They may send an offer.</small>':`<small class=m>Needs ${l.ml.toLocaleString()} monthly listeners and ${l.st.toLocaleString()} streams${l.rep>0?' and reputation '+l.rep:''}</small>`;
  return`<div class="bdrow${sg?' act':''}"><img class=lg style="border-radius:6px;image-rendering:pixelated;border:0" src="${lIc(l.id)}"><div class=tx><b>${esc(l.n)}</b> <small style="display:inline">${esc(lbStars(l.q))}</small><small>${esc(l.pitch)}</small><small>Keeps ${Math.round(l.cut*100)}% · signing bonus $${l.adv.toLocaleString()}</small></div><div class=bt>${stt}</div></div>`}).join('');
 return`<div class=hqx>${joinCard()}<p class=m>${L?'You are signed with '+esc(lbCur().n)+'. Leave on the Team tab.':'Labels send offers to Messages when your numbers are high enough. The offer links here.'}</p><div class=bdlist>${rows}</div></div>`}
const teamTab=()=>{HQAUTH=true;let h=BRD.teamPage?BRD.teamPage():'';return h.replace(/<button onclick="HQAUTH=false;pcR\(\)">Sign out<\/button> ?/,'').replace(/<h1><img [^>]*> Label HQ<\/h1>/,'')};
const h0=PA.hq;BRD.teamPage=h0;
PA.hq=function(){const L=labels()&&S.label?lbCur():null;if(!L&&HQT=='team')HQT='deals';if(!labels()&&HQT=='labels')HQT='deals';
 const th=L?COL[L.id]:null,sty=th?`--hqa:${th[0]};--hqb:${th[1]};`:'',tabs=`<div class=bdtabs><button class="${HQT=='deals'?'on':''}" onclick="bdTab('deals')">Brand deals</button>${labels()?`<button class="${HQT=='labels'?'on':''}" onclick="bdTab('labels')">Labels${HQJ?' (1)':''}</button>`:''}${L?`<button class="${HQT=='team'?'on':''}" onclick="bdTab('team')">Team</button>`:''}</div>`;
 let body;try{body=HQT=='team'?teamTab():HQT=='labels'?labelsTab():joinCard()+dealsTab()}catch(e){console.error('label hq',e);body='<p class=m>Label HQ hit a problem. Close and open it again.</p>'}
 return`<div class="bdw${L?' bdth':''}" style="${sty}"><div class=bdhd><h1><img src="${L?lIc(L.id):IC.hq}"> ${L?esc(L.n)+' · ':''}Label HQ</h1>${tabs}</div>${body}</div>`};
{const st=document.createElement('style');st.textContent=`.bdw{--hqa:#e6b422;width:100%;box-sizing:border-box;min-height:100%}
.bdw .bdhd{display:flex;align-items:center;gap:8px 18px;flex-wrap:wrap;margin:0 0 10px}.bdw .bdhd h1{margin:0;font-size:28px;display:flex;align-items:center;gap:10px}.bdw .bdhd h1 img{width:34px;image-rendering:pixelated}
.bdw .bdtabs{display:flex;gap:6px;flex-wrap:wrap}.bdw .bdtabs button{padding:7px 14px}.bdw .bdtabs button.on{background:var(--hqa);color:#0a0a0a;font-weight:700}
.bdw.bdth{background:linear-gradient(180deg,var(--hqb),#0000 55%);border-radius:8px;padding:10px 14px;box-shadow:inset 0 0 0 2px var(--hqa)}
.bdw h3{margin:18px 0 8px;font-size:13px;letter-spacing:.6px;text-transform:uppercase;color:var(--hqa)}
.bdw .bdtop{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,1fr);gap:16px;align-items:start}@media(max-width:820px){.bdw .bdtop{grid-template-columns:1fr}}
.bdw .bdhero{border:3px solid #000;border-radius:8px;overflow:hidden;box-shadow:0 5px 0 #0008;background:#000;line-height:0}.bdw .bdban{width:100%;height:auto;display:block;image-rendering:pixelated}
.bdw .bdside h3{margin-top:6px}.bdw .bdst{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 8px}.bdw .bdst span{background:#151a17;border-radius:8px;padding:8px 10px;min-width:0}.bdw .bdst span small{display:block;color:var(--m);font-size:11px}.bdw .bdst b{display:block;color:var(--hqa);font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bdw .bdlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:10px}
.bdw .bdrow{display:flex;gap:12px;align-items:center;background:#151a17;border-radius:8px;padding:10px 12px;margin:0;min-width:0}.bdw .bdrow img.lg{width:54px;height:54px;border-radius:50%;border:2px solid #000;flex:none;image-rendering:pixelated}
.bdw .bdrow .tx{flex:1;min-width:0}.bdw .bdrow .tx b{font-size:15px}.bdw .bdrow .tx small{display:block;color:var(--m);margin-top:2px}.bdw .bdrow .bt{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.bdw .bdrow.act{box-shadow:inset 0 0 0 2px var(--hqa)}
.bdw .bdsteps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin-top:8px}.bdw .bdsteps span{background:#151a17;border-radius:6px;padding:6px 4px;font-size:11px;text-align:center;color:var(--m);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bdw .bdsteps span.dn{color:var(--hqa)}.bdw .bdsteps span.on{background:var(--hqa);color:#0a0a0a;font-weight:700}
.bdw .bdg{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}.bdw .bdg div{text-align:center;background:#151a17;border-radius:8px;padding:10px 6px;font-size:12px;min-width:0}.bdw .bdg img{width:56px;height:56px;border-radius:50%;border:2px solid #000;display:block;margin:0 auto 6px;image-rendering:pixelated}.bdw .bdg .lk img{filter:grayscale(1) brightness(.5)}.bdw .bdg small{display:block;color:var(--m)}.bdw .bdg b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bdw .bdjoin{display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:#151a17;border:2px solid var(--hqa);border-radius:8px;padding:14px;margin:8px 0}.bdw .bdjoin .tx{flex:1;min-width:220px}.bdw .bdjoin small{display:block;color:var(--m);margin-top:3px}.bdw .bdjoin .bt{display:flex;gap:6px}
.bdw button.go{background:var(--hqa);color:#0a0a0a}.bdw .hqx{border-color:var(--hqa)!important}.bdw .hqx .gpip i.on{background:var(--hqa)}.bdw .hqx .hqc.hqmax{box-shadow:inset 0 0 0 2px var(--hqa)}.bdw .hqx .cards{grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))!important}`;document.head.appendChild(st)}
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
