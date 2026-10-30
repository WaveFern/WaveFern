/* ===== v43.5.0: Swiftwing Airways flights =====
   Swiftwing is the game's airline. Its app (computer, Gphone, and the ticket desk at any airport) books seats with in-game money.
   - schedule: one flight a day on every route, from home (Fernfield International) to every WT_DEST place, and between any two
     places. Departure times 07:00-23:30 (home time, the game clock), flight time and fare from the great-circle distance
     (same formula as 135-destinations.js), the day's fare varies a little, gates 1-6. Same day + route = same flight on reload.
   - rules (shown in the app before you pay):
       book until 60 min before departure, up to 3 days ahead, from where you are (or where a booked flight takes you)
       check in from 24 h before until 45 min before (in the app or at a check-in desk); security needs a boarding pass
       boarding opens 2 h before departure at the gate, the gate closes 10 min before departure
       miss the gate and the ticket is lost (no refund); book a new flight any time
       cancel more than 2 h before departure for a 70% refund
   - tickets live in S.travel.tickets (137-travel.js). The airport (139-airport.js) handles boarding, the cabin and the flight.
   - the departures board, the app and the HUD strip all read the same schedule. */
(function(){
const T=TRAVEL;
const DEP0=420,DEP1=1410,BOARD=120,FINAL=30,CLOSE=10,CK_OPEN=1440,CK_CLOSE=45,BOOK_CUT=60,CANCEL_CUT=120,REFUND=.7,DAYS=3,GATES=6;
const AIRLINE='Swiftwing Airways',HOME_AP='Fernfield International';
const fmtM=n=>'$'+Math.round(+n||0).toLocaleString();
function hsh(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let h=hsh(seed);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const ll=id=>T.dest(id)||WT_HOME;
function km(a,b){const r=Math.PI/180,x=a.lat*r,y=b.lat*r,c=Math.sin(x)*Math.sin(y)+Math.cos(x)*Math.cos(y)*Math.cos((b.lon-a.lon)*r);return 6371*Math.acos(Math.max(-1,Math.min(1,c)))}
function route(from,to){const k=km(ll(from),ll(to));return{km:Math.round(k),hrs:Math.max(2,Math.round(k/800+.7)),fare:Math.round((180+k*.11)/10)*10}}
const CODE={home:'FRN',la:'LAX',tyo:'TYO',osa:'OSA',sel:'SEL',idn:'DPS',nzl:'AKL',col:'BOG',chl:'SCL',swe:'STO',irl:'DUB',ken:'NBO',mar:'RAK',lag:'LOS'};
const code=id=>CODE[id]||String(id||'').toUpperCase().slice(0,3).padEnd(3,'X');
const places=()=>['home'].concat(WT_DEST.map(d=>d.id));
const SCH={};
/* every flight leaving `from` on game day `day` */
function flights(from,day){const k=from+'#'+day;if(SCH[k])return SCH[k];
 const L=places().filter(p=>p!=from).map(to=>{const R=rng(from+'>'+to+'#'+day),r=route(from,to),m=DEP0+Math.floor(R()*((DEP1-DEP0)/5+1))*5,dep=day*1440+m;
  return{fl:'SW '+(100+hsh(from+'>'+to)%800),from,to,dep,arr:dep+r.hrs*60,hrs:r.hrs,km:r.km,gate:1+Math.floor(R()*GATES),fare:Math.max(90,Math.round(r.fare*(.88+R()*.3)/5)*5)}}).sort((a,b)=>a.dep-b.dep);
 const ks=Object.keys(SCH);if(ks.length>40)ks.slice(0,20).forEach(q=>delete SCH[q]);return SCH[k]=L}
const fKey=f=>f.from+'>'+f.to+'#'+f.dep;
/* the next departures from a place (today's day and the next two), for boards */
function upcoming(from,n){const now=T.now(),d=T.dayOf(now);let L=[];for(let i=0;i<3&&L.length<n;i++)L=L.concat(flights(from,d+i).filter(f=>f.dep>now-30));return L.slice(0,n)}
function fStatus(f,now){now=now==null?T.now():now;const m=f.dep-now;
 return m<=0?{t:'Departed',c:'gone'}:m<=CLOSE?{t:'Gate closed',c:'closed'}:m<=FINAL?{t:'Final call',c:'final'}:m<=BOARD?{t:'Boarding',c:'board'}:{t:'On time',c:'ok'}}
const lastMin=f=>f.dep-T.now()<360;
const price=f=>Math.round(f.fare*(lastMin(f)?1.2:1));
/* where the player can book from: here, and wherever a booked flight takes them */
function origins(){const o=[T.loc()];T.active().forEach(k=>{if(!o.includes(k.to))o.push(k.to)});return o}
function earliest(from){/* a later leg must leave at least 60 min after you land there */
 if(from==T.loc())return T.now()+BOOK_CUT;const a=T.active().filter(k=>k.to==from).map(k=>k.arr);return a.length?Math.max(...a)+60:Infinity}
function canBook(f){if(T.st().loc==f.from||T.active().some(k=>k.to==f.from)){}else return 'You can only fly from where you are or where a booked flight lands.';
 if(f.dep<earliest(f.from))return f.from==T.loc()?'Too late to book: booking closes 60 min before departure.':'This leaves before your earlier flight lands there.';
 if(T.active().some(k=>k.from==f.from&&Math.abs(k.dep-f.dep)<180))return 'You already have a flight from there around then.';
 if((+S.money||0)<price(f))return 'Not enough money ('+fmtM(price(f))+').';return ''}
function seatFor(id){const R=rng('seat'+id);return(3+Math.floor(R()*18))+'ABCDEF'[Math.floor(R()*6)]}
function book(f){const e=canBook(f);if(e){try{snd('err')}catch(x){}say(e);return null}const t=T.st(),p=price(f);
 S.money=+(S.money-p).toFixed(2);const id='T'+(t.nid++);
 const tk={id,fl:f.fl,from:f.from,to:f.to,dep:f.dep,arr:f.arr,hrs:f.hrs,gate:f.gate,seat:seatFor(id+S.day),price:p,st:'booked',bd:S.day,ck:0,bt:0};
 t.tickets.push(tk);if(t.tickets.length>60)t.tickets=t.tickets.filter(k=>k.st=='booked').concat(t.tickets.filter(k=>k.st!='booked').slice(-40));
 try{snd('cash')}catch(x){}try{updateVersion()}catch(x){}
 try{glCard('BOOKED · '+tk.fl,code(tk.from)+' ✈ '+code(tk.to),'Gate '+tk.gate+' · boards '+T.hm(tk.dep-BOARD)+' · gate closes '+T.hm(tk.dep-CLOSE))}catch(x){}
 say('✈ Booked '+tk.fl+' to '+T.place(tk.to)+'. Be at Gate '+tk.gate+' before '+T.hm(tk.dep-CLOSE)+'.');return tk}
function refundOf(tk){return tk.dep-T.now()>CANCEL_CUT?Math.round(tk.price*REFUND*100)/100:0}
function cancel(id){const tk=T.st().tickets.find(k=>k.id==id);if(!tk||tk.st!='booked'||tk.bt)return;const r=refundOf(tk);
 if(!(r>0)){try{snd('err')}catch(x){}return say('Too late to cancel: within 2 hours of departure.')}
 tk.st='cancelled';tk.ref=r;S.money=+(S.money+r).toFixed(2);try{snd('cash')}catch(x){}say('Cancelled '+tk.fl+'. Refunded '+$$(r)+' (70%).')}
function ckWin(tk){const m=tk.dep-T.now();return m<=CK_OPEN&&m>CK_CLOSE}
function checkIn(id){const tk=T.st().tickets.find(k=>k.id==id);if(!tk||tk.st!='booked')return;if(tk.ck)return say('Already checked in. Seat '+tk.seat+'.');
 const m=tk.dep-T.now();if(m>CK_OPEN){try{snd('err')}catch(x){}return say('Check-in opens 24 hours before departure.')}
 if(m<=CK_CLOSE){try{snd('err')}catch(x){}return say('Check-in closed 45 minutes before departure.')}
 tk.ck=1;try{snd('chime')}catch(x){}say('🎫 Checked in. Boarding pass for '+tk.fl+', seat '+tk.seat+', Gate '+tk.gate+'.')}
/* missed flights: once the gate closes on a ticket that was not boarded, it is lost */
function missTick(){try{if(!S||!S.artist||!S.travel)return;if(typeof mode!='undefined'&&(mode=='load'||mode=='creator'))return;const n=T.now();
 T.st().tickets.forEach(tk=>{if(tk.st=='booked'&&!tk.bt&&n>=tk.dep-CLOSE){tk.st='missed';T.emit('missed',tk);
  try{snd('err')}catch(x){}
  try{glCard('MISSED FLIGHT',tk.fl+' to '+T.city(tk.to),'The gate closed at '+T.hm(tk.dep-CLOSE)+'. The ticket is lost. Book again in Swiftwing.')}catch(x){}
  say('✈ You missed '+tk.fl+' to '+T.place(tk.to)+'. The ticket is lost (no refund). Book a new flight in Swiftwing.')}})}catch(e){console.error('flights',e)}}
/* never stranded abroad: in a terminal abroad with no flight out and too little money for any flight home,
   Swiftwing gives you a free seat on the next flight home */
function rescue(){try{if(!S||!S.artist||!S.travel||!T.abroad())return;const w=typeof window.apWhere=='function'?window.apWhere():'';if(!w||w=='cabin')return;
 const from=T.loc();if(T.active().some(k=>k.from==from))return;const n=T.now(),L=upcoming(from,40).filter(f=>f.to=='home'&&f.dep>=n+BOOK_CUT);if(!L.length)return;
 if((+S.money||0)>=Math.min(...L.map(price)))return;const f=L[0],t=T.st(),id='T'+(t.nid++);
 t.tickets.push({id,fl:f.fl,from:f.from,to:'home',dep:f.dep,arr:f.arr,hrs:f.hrs,gate:f.gate,seat:seatFor(id+S.day),price:0,st:'booked',bd:S.day,ck:0,bt:0,free:1});
 try{glCard('FREE SEAT HOME',f.fl+' to '+T.city('home'),'You cannot afford a flight, so Swiftwing put you on the '+T.hm(f.dep)+' flight home for free. Check in, then Gate '+f.gate+'.')}catch(x){}
 say('✈ Swiftwing gave you a free seat home: '+f.fl+' at '+T.hm(f.dep)+', Gate '+f.gate+'. Check in at a desk first.')}catch(e){console.error('flights rescue',e)}}
setInterval(missTick,500);setInterval(rescue,2000);
Object.assign(T,{flights,upcoming,fStatus,route,code,book,cancel,checkIn,ckWin,price,refundOf,canBook,
 RULES:{BOARD,FINAL,CLOSE,CK_OPEN,CK_CLOSE,BOOK_CUT,CANCEL_CUT,REFUND,GATES},AIRLINE,
 apName:id=>id&&id!='home'?T.city(id)+' Airport':HOME_AP,
 /* a valid boarding pass for a flight leaving from here soon (security and gates) */
 pass(){const n=T.now(),here=T.loc();return T.active().find(k=>k.from==here&&k.ck&&k.dep-n<=CK_OPEN&&k.dep-n>CLOSE)||null},
 openFlights(to){SW.to=to||SW.to;SW.tab='book';if(typeof mode!='undefined'&&mode=='pc'){app='sw';pcR()}else swDesk()}});

/* ---------------- the app ---------------- */
const SW={tab:'book',from:null,to:null,cont:'',ctx:'pc',conf:null,hov:null};
APPD.sw={n:'Swiftwing Flights',p:0,d:'Preinstalled. Book flights with Swiftwing Airways: destinations, times, gates and your boarding passes.'};
try{IC.sw=mkIc(['..........','.......WW.','......WWC.','WW...WWW..','.WWWWWWW..','..WWWWWW..','...WWWWWW.','....W...W.','..........','..........'].map((r,i)=>i>7?'BBBBBBBBBB':r.replace(/\./g,'B')),{B:'#1565d8',W:'#ffffff',C:'#ff6b4a'})}catch(e){IC.sw=IC.store}
setInterval(()=>{try{if(S&&S.artist&&S.apps&&!S.apps.sw)S.apps.sw=1}catch(e){}},1000);
function css(){if($('swcss'))return;const s=document.createElement('style');s.id='swcss';s.textContent=`
.mn.swmn{padding:0!important;background:#eaf4ff}
.swa{min-height:100%;box-sizing:border-box;background:linear-gradient(180deg,#bfe0ff 0,#eaf4ff 220px,#f6faff 100%);color:#0b2a5b;font:14px/1.35 "Trebuchet MS","Segoe UI",Arial,sans-serif;padding:0 0 20px}
.swa *{box-sizing:border-box}.swa b{color:#0b2a5b}
.swa .swh{display:flex;align-items:center;gap:10px;padding:14px 18px 10px;background:linear-gradient(120deg,#0b2a5b,#1565d8 70%,#3fa0ff);color:#fff;border-bottom:4px solid #ff6b4a}
.swa .swh img{width:34px;height:34px;image-rendering:pixelated;border-radius:9px;box-shadow:0 2px 0 #0004}
.swa .swh h1{margin:0;font:700 22px "Trebuchet MS",Arial,sans-serif;letter-spacing:.5px;color:#fff}.swa .swh small{display:block;color:#cfe6ff;font-size:12px}
.swa .swh .bal{margin-left:auto;text-align:right;font-size:12px;color:#cfe6ff}.swa .swh .bal b{display:block;color:#fff;font-size:16px}
.swa .swt{display:flex;gap:6px;padding:10px 18px 0;flex-wrap:wrap}
.swa .swt button{all:unset;cursor:pointer;padding:8px 16px;border-radius:999px;background:#ffffffaa;color:#1565d8;font-weight:700;font-size:13px;border:2px solid #1565d822}
.swa .swt button.on{background:#0b2a5b;color:#fff;border-color:#0b2a5b}.swa .swt button:not(.on):hover{background:#fff}
.swa .swb{padding:12px 18px}
.swa .swc{background:#fff;border-radius:14px;padding:12px 14px;margin:0 0 10px;box-shadow:0 2px 0 #0b2a5b14,0 6px 18px #1565d814;border:1px solid #d6e6f8}
.swa h3{margin:4px 0 8px;font:700 13px "Trebuchet MS",Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:#1565d8}
.swa .m2{color:#5a7194;font-size:12px}
.swa button.swgo,.swa button.swb2{all:unset;cursor:pointer;display:inline-block;padding:8px 14px;border-radius:10px;font-weight:700;font-size:13px;text-align:center;min-height:18px}
.swa button.swgo{background:#ff6b4a;color:#fff;box-shadow:0 3px 0 #c84528}.swa button.swgo:hover{background:#ff8466}
.swa button.swb2{background:#e3effd;color:#1565d8;box-shadow:0 3px 0 #b9d3f2}.swa button.swb2:hover{background:#d3e6fc}
.swa button[disabled]{opacity:.45;cursor:default;pointer-events:none}
.swa .swfrom{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.swa select{font:inherit;padding:6px 8px;border-radius:9px;border:2px solid #b9d3f2;background:#fff;color:#0b2a5b}
.swa .swmap{position:relative;border-radius:14px;overflow:hidden;background:#7cc2ff;border:2px solid #0b2a5b22}
.swa .swmap canvas{display:block;width:100%;height:auto;aspect-ratio:1000/493;touch-action:none;cursor:grab}
.swa .swzm{position:absolute;top:8px;right:8px;display:flex;flex-direction:column;gap:4px;align-items:center}
.swa .swzm button{all:unset;cursor:pointer;width:30px;height:30px;line-height:30px;text-align:center;border-radius:9px;background:#ffffffe6;color:#0b2a5b;font-weight:700;font-size:18px;box-shadow:0 2px 0 #0b2a5b33}.swa .swzm button:hover{background:#fff}
.swa .swzm span{font-size:11px;font-weight:700;color:#0b2a5b;background:#ffffffb0;border-radius:6px;padding:1px 5px}
.swa .swmh{position:absolute;left:8px;bottom:6px;font-size:11px;color:#0b2a5b;background:#ffffffa0;border-radius:6px;padding:1px 6px;pointer-events:none}
.swa .swtip{position:absolute;pointer-events:none;background:#0b2a5b;color:#fff;font-size:12px;padding:4px 8px;border-radius:8px;white-space:nowrap;transform:translate(-50%,-130%);display:none}
.swa .swch{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.swa .swch button{all:unset;cursor:pointer;font-size:12px;padding:5px 10px;border-radius:999px;background:#fff;border:2px solid #d6e6f8;color:#0b2a5b}.swa .swch button.on{border-color:#ff6b4a;color:#ff6b4a;font-weight:700}
.swa .swdl{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}
.swa .swd{all:unset;cursor:pointer;background:#fff;border:2px solid #d6e6f8;border-radius:12px;padding:8px 10px;display:block}.swa .swd:hover{border-color:#1565d8}.swa .swd.on{border-color:#ff6b4a;background:#fff4f1}
.swa .swd b{display:block;font-size:14px}.swa .swd small{color:#5a7194}
.swa .swfl{display:grid;grid-template-columns:auto 1fr auto;gap:6px 12px;align-items:center;padding:10px 0;border-top:1px dashed #c5d9f0}
.swa .swfl:first-of-type{border-top:0}
.swa .swtm{font:700 20px "Trebuchet MS",Arial,sans-serif;color:#0b2a5b}.swa .swtm small{display:block;font-size:11px;font-weight:400;color:#5a7194}
.swa .chip{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:#e3effd;color:#1565d8}
.swa .chip.board{background:#dff7e8;color:#147a3d}.swa .chip.final{background:#fff1d6;color:#a8650a}.swa .chip.closed,.swa .chip.missed{background:#ffe1dc;color:#c0391c}.swa .chip.gone,.swa .chip.cancelled{background:#eceff3;color:#6a7686}.swa .chip.flown{background:#e7e3ff;color:#5b3fd0}
.swa .swbp{display:grid;grid-template-columns:1fr 150px;background:#fff;border-radius:16px;overflow:hidden;margin:0 0 12px;box-shadow:0 3px 0 #0b2a5b1c,0 8px 22px #1565d81a;border:1px solid #d6e6f8}
.swa .swbp .l{padding:12px 16px;border-right:3px dashed #c5d9f0;position:relative}
.swa .swbp .r{padding:12px 14px;background:#f2f8ff;display:flex;flex-direction:column;gap:8px;justify-content:center}
.swa .swbp .cd{display:flex;align-items:center;gap:10px;margin:4px 0 6px}.swa .swbp .cd b{font:700 30px "Trebuchet MS",Arial,sans-serif;letter-spacing:1px}.swa .swbp .cd i{font-style:normal;color:#ff6b4a;font-size:20px}
.swa .swbp .g{display:grid;grid-template-columns:repeat(4,auto);gap:2px 14px;font-size:11px;color:#5a7194}.swa .swbp .g b{font-size:15px;display:block}
.swa .swbp .cnt{font-weight:700;font-size:13px;margin-top:8px}.swa .swbp .cnt.warn{color:#c0391c}
.swa .swbp.hist{opacity:.8}.swa .swrule{font-size:12px;color:#5a7194;margin:6px 0 0;padding-left:16px}.swa .swrule li{margin:2px 0}
.swa .swbd{background:#0d1522;color:#ffd84a;border-radius:12px;padding:8px;font:13px ui-monospace,Menlo,Consolas,monospace;overflow-x:auto}
.swa .swbd table{width:100%;border-collapse:collapse}.swa .swbd th{color:#8fb4e8;text-align:left;font-weight:400;font-size:11px;padding:3px 6px;border-bottom:1px solid #2a3a52}.swa .swbd td{padding:4px 6px;border-bottom:1px solid #1a2638;white-space:nowrap}
.swa .swbd td.st.board{color:#56f08a}.swa .swbd td.st.final{color:#ffb347}.swa .swbd td.st.closed,.swa .swbd td.st.gone{color:#ff6a5a}.swa .swbd tr.me td{background:#1d2c45}
.swa .swconf{border:2px solid #ff6b4a}
#ph .swa{min-height:auto;border-radius:0}#ph .swa .swh{padding:10px 12px}#ph .swa .swb{padding:10px 10px}#ph .swa .swt{padding:8px 10px 0}
#ph .swa .swbp{grid-template-columns:1fr}#ph .swa .swbp .l{border-right:0;border-bottom:3px dashed #c5d9f0}#ph .swa .swbp .cd b{font-size:24px}
#ph .swa .swdl{grid-template-columns:1fr 1fr}#ph .swa .swfl{grid-template-columns:auto 1fr}#ph .swa .swfl>div:last-child{grid-column:1/3}
.swdesk{width:min(820px,96vw);max-height:90vh;overflow:auto;padding:0!important;background:#eaf4ff!important}.swdesk .swx{display:flex;justify-content:flex-end;padding:8px 12px;background:#0b2a5b}
@media (max-width:700px){.swa .swbp{grid-template-columns:1fr}.swa .swbp .l{border-right:0;border-bottom:3px dashed #c5d9f0}.swa .swdl{grid-template-columns:1fr 1fr}}
#swhud{position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:20;background:#0b2a5bee;color:#fff;border:2px solid #000;border-bottom:3px solid #ff6b4a;border-radius:10px;padding:6px 14px;font:13px "Trebuchet MS",Arial,sans-serif;box-shadow:3px 3px 0 #0007;pointer-events:none;text-align:center;max-width:min(560px,92vw)}
#swhud b{color:#ffd84a}#swhud.warn{background:#7a1c0cee;border-bottom-color:#ffd84a}#swhud small{display:block;color:#cfe6ff;font-size:11px}
`;document.head.appendChild(s)}
const dayLbl=d=>{const t=T.dayOf(T.now());return d==t?'Today':d==t+1?'Tomorrow':'Day '+d};
function tmCell(a,id,sub){return`<div class=swtm>${T.hm(a)}<small>${sub}${T.abroad()||id!='home'?' · local '+T.local(a,id):''}</small></div>`}
function head(){return`<div class=swh><img src="${IC.sw}" alt=""><div><h1>Swiftwing</h1><small>${AIRLINE} · fly further</small></div><div class=bal>Balance<b>${$$(S.money)}</b></div></div>`}
function tabs(){const n=T.active().length;return`<div class=swt>${[['book','Book a flight'],['trips','My trips'+(n?' ('+n+')':'')],['dep','Departures']].map(t=>`<button class="${SW.tab==t[0]?'on':''}" onclick="swTab('${t[0]}')">${t[1]}</button>`).join('')}</div>`}
function destName(id){const d=T.dest(id);return d?`${esc(d.city||d.country)}<small> ${d.city?esc(d.country):''}</small>`:'Home'}
function bookPage(){const O=origins();if(!O.includes(SW.from))SW.from=O[0];const from=SW.from,C=SW.cont;
 const list=places().filter(p=>p!=from&&(!C||(T.dest(p)&&T.dest(p).cont==C)||(C=='home'&&p=='home')));
 const R=to=>route(from,to),d0=T.dayOf(T.now());
 let h=`<div class=swc><div class=swfrom><b>From</b><select onchange="swFrom(this.value)">${O.map(o=>`<option value="${o}" ${o==from?'selected':''}>${esc(T.apName(o))} (${code(o)})</option>`).join('')}</select><span class=m2>${from==T.loc()?'You are here.':'Where a booked flight lands.'}</span></div>
 <div class=swmap><canvas id=swmapc width=1000 height=493></canvas><div class=swtip id=swtip></div><div class=swzm><button onclick="swZoom(1)" title="Zoom in">+</button><button onclick="swZoom(-1)" title="Zoom out">−</button><button onclick="swZoom(0)" title="Whole world">⤢</button><span id=swzl>x1</span></div><div class=swmh>Drag to move · scroll or pinch to zoom</div></div>
 <div class=swch><button class="${!C?'on':''}" onclick="swCont('')">All</button>${from!='home'?`<button class="${C=='home'?'on':''}" onclick="swCont('home')">Home</button>`:''}${Object.keys(WT_CONT).map(k=>`<button class="${C==k?'on':''}" onclick="swCont('${k}')">${WT_CONT[k].n}</button>`).join('')}</div>
 <div class=swdl>${list.map(p=>{const r=R(p);return`<button class="swd ${SW.to==p?'on':''}" onclick="swTo('${p}')"><b>${p=='home'?'Home · '+HOME_AP:esc(T.city(p))}</b><small>${p=='home'?'':(T.dest(p).city?esc(T.dest(p).country):'Country stop')+' · '}${r.hrs} h · from ${fmtM(r.fare*.88)}</small></button>`}).join('')}</div></div>`;
 if(SW.to&&SW.to!=from){const to=SW.to,r=R(to);let fl=[];for(let i=0;i<DAYS;i++)fl=fl.concat(flights(from,d0+i).filter(f=>f.to==to));
  h+=`<div class=swc id=swfls><h3>${esc(T.apName(from))} → ${esc(T.apName(to))}</h3><div class=m2>${r.km.toLocaleString()} km · ${r.hrs} hours · times are your game clock (local time below)</div>${fl.map(f=>{const st=fStatus(f),e=canBook(f),ok=!e,cf=SW.conf==fKey(f);
   return`<div class=swfl><div>${tmCell(f.dep,f.from,dayLbl(T.dayOf(f.dep)))}</div><div><b>${f.fl}</b> · Gate ${f.gate} <span class="chip ${st.c}">${st.t}</span><div class=m2>Arrives ${T.hm(f.arr)}${to!='home'?' (local '+T.local(f.arr,to)+')':''}${T.dayOf(f.arr)>T.dayOf(f.dep)?' next day':''} · boards ${T.hm(f.dep-BOARD)} · gate closes ${T.hm(f.dep-CLOSE)}</div>${e&&st.c!='gone'?`<div class=m2 style="color:#c0391c">${esc(e)}</div>`:''}</div>
   <div>${st.c=='gone'?'':`<button class=swgo ${ok?'':'disabled'} onclick="swConf('${fKey(f)}')">${fmtM(price(f))}</button>`}</div></div>${cf&&ok?confBox(f):''}`}).join('')}</div>`}
 else h+=`<div class=swc><div class=m2>Pick a destination on the map or in the list to see flights for the next ${DAYS} days.</div></div>`;
 return h}
function confBox(f){return`<div class="swc swconf"><h3>Confirm ${f.fl}</h3><b>${esc(T.apName(f.from))} → ${esc(T.apName(f.to))}</b> · ${dayLbl(T.dayOf(f.dep))} ${T.hm(f.dep)} · Gate ${f.gate} · ${fmtM(price(f))}${lastMin(f)?' <span class="chip final">last-minute +20%</span>':''}
 <ul class=swrule><li>Go to ${esc(T.apName(f.from))}, check in (here in the app from 24 h before, or at a check-in desk) and pass security.</li><li>Boarding at <b>Gate ${f.gate}</b> opens at <b>${T.hm(f.dep-BOARD)}</b>. The gate <b>closes at ${T.hm(f.dep-CLOSE)}</b>.</li><li>Not on board by then? You miss the flight and <b>the ticket is lost, no refund</b>. You can book again.</li><li>Cancel more than 2 hours before departure for a 70% refund.</li><li>Sleeping or being elsewhere when the gate closes counts as missing it.</li></ul>
 <div style="display:flex;gap:8px;margin-top:10px"><button class=swgo onclick="swBuy('${fKey(f)}')">Pay ${fmtM(price(f))}</button><button class=swb2 onclick="swConf('')">Back</button></div></div>`}
function bp(tk){const n=T.now(),st=tk.st,live=st=='booked',m=tk.dep-n,cl=tk.dep-CLOSE-n,s=fStatus(tk,n),r=refundOf(tk);
 const cnt=live?(tk.bt?'On board':cl>0?`Gate closes in ${T.left(tk.dep-CLOSE)}`:''):st=='missed'?'Missed · ticket lost (no refund). Book again any time.':st=='cancelled'?'Cancelled · refunded '+$$(tk.ref||0):st=='flown'?'Flown':'';
 return`<div class="swbp ${live?'':'hist'}"><div class=l><div class=m2>${tk.fl} · ${AIRLINE}${live?` <span class="chip ${tk.bt?'board':s.c}">${tk.bt?'Boarded':s.t}</span>`:` <span class="chip ${st}">${st=='missed'?'Missed':st=='cancelled'?'Cancelled':'Flown'}</span>`}</div>
 <div class=cd><b>${code(tk.from)}</b><i>✈</i><b>${code(tk.to)}</b></div><div class=m2>${esc(T.apName(tk.from))} → ${esc(T.place(tk.to))}</div>
 <div class=g style="margin-top:8px"><span>Date<b>${dayLbl(T.dayOf(tk.dep))}</b></span><span>Departs<b>${T.hm(tk.dep)}</b></span><span>Gate<b>${tk.gate}</b></span><span>Seat<b>${tk.seat}</b></span><span>Boards<b>${T.hm(tk.dep-BOARD)}</b></span><span>Gate closes<b>${T.hm(tk.dep-CLOSE)}</b></span><span>Arrives<b>${T.hm(tk.arr)}</b></span><span>Paid<b>${fmtM(tk.price)}</b></span></div>
 ${cnt?`<div class="cnt ${live&&cl<90&&!tk.bt?'warn':''}">${cnt}</div>`:''}</div>
 <div class=r>${live&&!tk.bt?(tk.ck?`<span class="chip board">✓ Checked in</span><span class=m2>Pass security, then go to Gate ${tk.gate}.</span>`:ckWin(tk)?`<button class=swgo onclick="swCk('${tk.id}')">Check in</button>`:`<span class=m2>${m>CK_OPEN?'Check-in opens '+T.hm(tk.dep-CK_OPEN)+' '+dayLbl(T.dayOf(tk.dep-CK_OPEN)).toLowerCase():'Check-in closed. Hurry to the airport desk only if it still opens.'}</span>`)
  +(r>0?`<button class=swb2 onclick="swCancel('${tk.id}')">Cancel · refund ${$$(r)}</button>`:`<span class=m2>Too late to cancel.</span>`):st=='missed'?`<button class=swgo onclick="swTo('${tk.to}',1)">Book again</button>`:''}</div></div>`}
function tripsPage(){const L=T.st().tickets,act=T.active(),old=L.filter(k=>k.st!='booked').slice(-8).reverse();
 return`<div class=swc><h3>Where you are</h3><b>${esc(T.place(T.loc()))}</b>${T.abroad()?' <span class=m2>· local time '+T.local(T.now(),T.loc())+'</span>':''}<div class=m2>Clock: Day ${S.day} · ${clk()}</div></div>
 ${act.length?act.map(bp).join(''):`<div class=swc><div class=m2>No upcoming flights. Book one in the first tab.</div></div>`}
 ${old.length?`<h3 style="margin:14px 0 8px">Past tickets</h3>`+old.map(bp).join(''):''}`}
function board(from,n,me){const L=upcoming(from,n),mine=new Set(T.active().map(k=>k.from+'>'+k.to+'#'+k.dep));
 return`<div class=swbd><table><tr><th>Time</th><th>Flight</th><th>To</th><th>Gate</th><th>Status</th></tr>${L.map(f=>{const s=fStatus(f);return`<tr class="${mine.has(fKey(f))?'me':''}"><td>${T.hm(f.dep)}</td><td>${f.fl}</td><td>${esc(T.city(f.to))}</td><td>${f.gate}</td><td class="st ${s.c}">${s.t}</td></tr>`}).join('')}</table></div>`}
function depPage(){return`<div class=swc><h3>Departures · ${esc(T.apName(T.loc()))}</h3><div class=m2 style="margin-bottom:8px">The same list is on the boards in the terminal. Your flights are highlighted.</div>${board(T.loc(),14)}</div>`}
function page(ctx){css();SW.ctx=ctx;let b='';try{b=SW.tab=='trips'?tripsPage():SW.tab=='dep'?depPage():bookPage()}catch(e){console.error('Swiftwing',e);b='<div class=swc>Swiftwing hit a snag. Close it and try again.</div>'}
 if(SW.tab=='book')setTimeout(drawMap,0);return`<div class=swa>${head()}${tabs()}<div class=swb>${b}</div></div>`}
function rr(){if(SW.ctx=='ph'&&$('ph'))phR();else if(SW.ctx=='desk'&&$('swdk'))swDesk();else if(typeof mode!='undefined'&&mode=='pc'&&app=='sw')pcR()}
window.swTab=t=>{SW.tab=t;SW.conf=null;try{snd('click')}catch(e){}rr()};
window.swFrom=v=>{SW.from=v;SW.to=null;SW.conf=null;rr()};
window.swCont=c=>{SW.cont=c;SW.fit=c;rr()};
window.swTo=(p,b)=>{if(b){SW.tab='book';SW.from=T.loc()}SW.to=p;SW.conf=null;try{snd('click')}catch(e){}rr();setTimeout(()=>{const e=document.getElementById('swfls');if(e&&e.scrollIntoView)e.scrollIntoView({block:'nearest',behavior:'smooth'})},30)};
const findF=k=>{const [ft,dep]=k.split('#'),[from,to]=ft.split('>');return flights(from,T.dayOf(+dep)).find(f=>f.to==to)};
window.swConf=k=>{SW.conf=k||null;rr()};
window.swBuy=k=>{const f=findF(k);if(!f)return;const tk=book(f);SW.conf=null;if(tk){SW.tab='trips'}rr()};
window.swCancel=id=>{cancel(id);rr()};
window.swCk=id=>{checkIn(id);rr()};
/* desk (ticket counter at an airport, or anywhere without a computer) */
window.swDesk=function(){try{mode='menu';css();$('ui').innerHTML=`<div class="box modal swdesk" id=swdk><div class=swx><button onclick="closeUI()">Close</button></div>${page('desk')}</div>`}catch(e){console.error(e)}};
PA.sw=()=>page('pc');
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{const m=document.querySelector('#pc .mn');if(m)m.classList.toggle('swmn',app=='sw'&&!!m.querySelector('.swa'))}catch(e){}return r}}
/* Gphone */
try{if(typeof GP_APPS!='undefined'&&!GP_APPS.some(a=>a[0]=='sw')){GP_APPS.push(['sw','Swiftwing',()=>IC.sw,'#1565d8']);if(typeof GP_TITLE!='undefined')GP_TITLE.sw='Swiftwing'}
 if(typeof phBody=='function'){const b0=phBody;phBody=function(){if(typeof PH!='undefined'&&PH.app=='sw')return`<div class=phx>${page('ph')}</div>`;return b0.apply(this,arguments)}}}catch(e){console.error('swiftwing phone',e)}

/* ---- the world map: vector country shapes (WT_MAP in 145-world-map-data.js, Natural Earth 110m, Miller projection), drawn at the
   screen's real pixel density so it stays sharp at any size. Drag to move; mouse wheel, pinch or the + / - buttons zoom from x1
   (the whole world, the furthest out it goes) up to x8. Picking a region in the chips flies the map to it. ---- */
let SHP=null;
function shapes(){if(SHP)return SHP;const o=[];try{WT_MAP.c.forEach(r=>{try{o.push(new Path2D(r[3]))}catch(e){}})}catch(e){return o}return SHP=o}
const mlat=l=>1.25*Math.log(Math.tan(Math.PI/4+.4*l*Math.PI/180));
function proj(lat,lon){const M=WT_MAP,Y0=mlat(M.lat0),Y1=mlat(M.lat1);return[(lon+180)/360*M.W,(Y0-mlat(Math.max(M.lat1-10,Math.min(M.lat0,lat))))/(Y0-Y1)*M.H]}
/* a view is {cx,cy,z}: the map point in the middle and the zoom. k = css px per map unit for a canvas cssW wide */
function clampV(v,cw,chh){const M=WT_MAP;v.z=Math.max(1,Math.min(ZMAX,v.z||1));const k=cw*v.z/M.W,w=cw/k,h=chh/k;
 v.cx=w>=M.W?M.W/2:Math.max(w/2,Math.min(M.W-w/2,v.cx));v.cy=h>=M.H?M.H/2:Math.max(h/2,Math.min(M.H-h/2,v.cy));return k}
const ZMAX=8;
/* paint sea, grid and land onto x (any size), with map units -> device px: dev = o + map*s. lw = device px per css px */
function paintWorld(x,s,ox,oy,W,H,lw){const M=WT_MAP;x.setTransform(1,0,0,1,0,0);
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#8fd0ff');g.addColorStop(1,'#62b2f5');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.setTransform(s,0,0,s,ox,oy);x.strokeStyle='#ffffff40';x.lineWidth=lw/s;x.beginPath();
 for(let lo=-180;lo<=180;lo+=15){const a=proj(0,lo)[0];x.moveTo(a,0);x.lineTo(a,M.H)}
 for(let la=-45;la<=75;la+=15){const b=proj(la,0)[1];x.moveTo(0,b);x.lineTo(M.W,b)}x.stroke();
 const L=shapes();x.fillStyle='#f4efe2';L.forEach(p=>x.fill(p));x.strokeStyle='#b9ad92';x.lineWidth=.8*lw/s;x.lineJoin='round';L.forEach(p=>x.stroke(p));
 x.setTransform(1,0,0,1,0,0)}
/* fit a view around map points (array of [x,y]) for a canvas cw x chh css px */
function fitV(pts,cw,chh,pad){const M=WT_MAP;if(!pts.length)return{cx:M.W/2,cy:M.H/2,z:1};let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
 const w=Math.max(60,x1-x0)*(pad||1.5),h=Math.max(30,y1-y0)*(pad||1.5),z=Math.min(M.W/w,(M.W*chh/cw)/h);const v={cx:(x0+x1)/2,cy:(y0+y1)/2,z};clampV(v,cw,chh);return v}
let PINS=[];
const mview=()=>SW.mv||(SW.mv={cx:500,cy:246.5,z:1});
function drawMap(){const c=document.getElementById('swmapc');if(!c)return;const r=c.getBoundingClientRect();if(!r.width||!r.height)return;
 const dpr=Math.min(3,window.devicePixelRatio||1),W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(c.width!=W||c.height!=H){c.width=W;c.height=H}
 const from=SW.from||T.loc(),hov=SW.hov,cont=SW.cont;
 if(SW.fit!=null){const f=SW.fit;SW.fit=null;const L=places().filter(p=>{const d=T.dest(p);return f=='home'?p=='home':d&&d.cont==f}).map(p=>{const d=ll(p);return proj(d.lat,d.lon)});
  SW.mv=f?fitV(L,r.width,r.height,1.35):{cx:500,cy:246.5,z:1}}
 const v=mview(),k=clampV(v,r.width,r.height),ox=r.width/2-v.cx*k,oy=r.height/2-v.cy*k,x=c.getContext('2d');
 paintWorld(x,k*dpr,ox*dpr,oy*dpr,W,H,dpr);x.setTransform(dpr,0,0,dpr,0,0);
 PINS=places().map(p=>{const d=ll(p),q=proj(d.lat,d.lon);return{p,x:ox+q[0]*k,y:oy+q[1]*k}});
 const A=PINS.find(q=>q.p==from),B=SW.to&&PINS.find(q=>q.p==SW.to);
 if(A&&B){const dd=Math.hypot(B.x-A.x,B.y-A.y);x.strokeStyle='#ff6b4a';x.lineWidth=2.5;x.lineCap='round';x.setLineDash([6,5]);x.beginPath();x.moveTo(A.x,A.y);x.quadraticCurveTo((A.x+B.x)/2,Math.min(A.y,B.y)-Math.min(90,dd*.22),B.x,B.y);x.stroke();x.setLineDash([])}
 const big=Math.min(1.4,.9+v.z*.08),names=v.z>=2.4,lab=[];x.textBaseline='middle';x.lineJoin='round';
 PINS.forEach(q=>{if(q.x<-20||q.y<-20||q.x>r.width+20||q.y>r.height+20)return;const d=T.dest(q.p),dim=cont&&(cont=='home'?q.p!='home':!d||d.cont!=cont),on=q.p==SW.to||q.p==hov,me=q.p==from;
  x.globalAlpha=dim?.3:1;x.fillStyle=me?'#0b2a5b':d?WT_CONT[d.cont].c:'#2fe68a';x.strokeStyle='#0b2a5b';x.lineWidth=on?2.5:1.4;
  x.beginPath();x.arc(q.x,q.y,(on?6.5:me?5.5:4.5)*big,0,7);x.fill();x.stroke();
  if(names&&!me&&!dim||on&&!me)lab.push({q,on});x.globalAlpha=1});
 /* city names once zoomed in: the picked / hovered one first, then any that do not overlap one already drawn */
 const box=[];if(A)box.push([A.x+6,A.y-8,A.x+150,A.y+8]);lab.sort((a,b)=>b.on-a.on).forEach(l=>{const q=l.q,t=T.city(q.p);x.font=(l.on?'bold ':'')+'12px Trebuchet MS,Arial';
  const bx=[q.x+6,q.y-8,q.x+10+x.measureText(t).width,q.y+8];if(!l.on&&box.some(o=>bx[0]<o[2]&&bx[2]>o[0]&&bx[1]<o[3]&&bx[3]>o[1]))return;box.push(bx);
  x.strokeStyle='#ffffffd0';x.lineWidth=3;x.strokeText(t,q.x+8,q.y);x.fillStyle='#0b2a5b';x.fillText(t,q.x+8,q.y)});
 if(A){x.font='bold 12px Trebuchet MS,Arial';const t=from=='home'?'You · Home':'You · '+T.city(from);x.strokeStyle='#ffffffd0';x.lineWidth=3;x.strokeText(t,A.x+9,A.y);x.fillStyle='#0b2a5b';x.fillText(t,A.x+9,A.y)}
 const zl=document.getElementById('swzl');if(zl)zl.textContent='x'+(Math.round(v.z*10)/10);
 if(!c.dataset.on){c.dataset.on=1;const P=new Map();let drag=false,pinch=null,down=null;
  const pt=e=>{const b=c.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top,w:b.width,h:b.height}};
  const pick=e=>{const p=pt(e);let b=null,bd=e.pointerType=='touch'?22:14;PINS.forEach(q=>{const dd=Math.hypot(q.x-p.x,q.y-p.y);if(dd<bd&&q.p!=(SW.from||T.loc())){bd=dd;b=q}});return b};
  const tipOff=()=>{const tip=document.getElementById('swtip');if(tip)tip.style.display='none'};
  c.addEventListener('pointerdown',e=>{P.set(e.pointerId,pt(e));try{c.setPointerCapture(e.pointerId)}catch(x){}
   if(P.size==1){down=pt(e);drag=false}else if(P.size==2){const[a,b]=[...P.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1};drag=true;tipOff()}});
  c.addEventListener('pointermove',e=>{const p=pt(e);
   if(P.has(e.pointerId)){const o=P.get(e.pointerId);P.set(e.pointerId,p);
    if(P.size>=2&&pinch){const[a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1;zoomAt((a.x+b.x)/2,(a.y+b.y)/2,d/pinch.d,p.w,p.h);pinch.d=d;return}
    if(!drag&&down&&Math.hypot(p.x-down.x,p.y-down.y)>5){drag=true;c.style.cursor='grabbing';SW.hov=null;tipOff()}
    if(drag){const v=mview(),k=clampV(v,p.w,p.h);v.cx-=(p.x-o.x)/k;v.cy-=(p.y-o.y)/k;drawMap()}return}
   const q=pick(e),tip=document.getElementById('swtip');const kk=q?q.p:null;if(kk!=SW.hov){SW.hov=kk;drawMap()}
   if(tip){if(q){tip.style.display='block';tip.style.left=q.x+'px';tip.style.top=q.y+'px';const rt=route(SW.from||T.loc(),q.p);tip.textContent=T.place(q.p)+' · '+rt.hrs+' h · from '+fmtM(rt.fare*.88)}else tip.style.display='none'}});
  const up=e=>{const was=P.has(e.pointerId),tap=was&&!drag&&P.size==1&&e.type=='pointerup';P.delete(e.pointerId);if(P.size<2)pinch=null;if(!P.size){c.style.cursor='';down=null}
   if(tap){const q=pick(e);drag=false;if(q)swTo(q.p)}else if(!P.size)drag=false};
  c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
  c.addEventListener('pointerleave',e=>{if(P.size)return;SW.hov=null;tipOff();drawMap()});
  c.addEventListener('wheel',e=>{e.preventDefault();const p=pt(e);zoomAt(p.x,p.y,Math.exp(-Math.max(-120,Math.min(120,e.deltaY*(e.deltaMode?33:1)))*.0025),p.w,p.h)},{passive:false});
  c.addEventListener('dblclick',e=>{const p=pt(e);zoomAt(p.x,p.y,2,p.w,p.h)})}}
/* zoom by f around css point (px,py), keeping the map point under it in place */
function zoomAt(px,py,f,cw,chh){const v=mview(),k=clampV(v,cw,chh),mx=v.cx+(px-cw/2)/k,my=v.cy+(py-chh/2)/k;v.z=Math.max(1,Math.min(ZMAX,v.z*f));
 const k2=cw*v.z/WT_MAP.W;v.cx=mx-(px-cw/2)/k2;v.cy=my-(py-chh/2)/k2;drawMap()}
window.swZoom=d=>{const c=document.getElementById('swmapc');if(!c)return;const r=c.getBoundingClientRect();if(!d){SW.mv={cx:500,cy:246.5,z:1};drawMap()}else zoomAt(r.width/2,r.height/2,d>0?1.6:1/1.6,r.width,r.height)};
window.addEventListener('resize',()=>{try{if(document.getElementById('swmapc'))drawMap()}catch(e){}});
T.paintWorld=paintWorld;T.proj=proj;T.fitView=fitV;T.clampView=clampV;

/* ---- HUD strip: the next flight, its gate and the time left ---- */
function hud(){let e=document.getElementById('swhud');const on=S&&S.artist&&typeof mode!='undefined'&&(mode=='play'||mode=='drive'||mode=='phone');
 const tk=on?T.active()[0]:null,n=T.now(),show=tk&&(tk.dep-n<720||tk.bt);
 if(!show){if(e)e.style.display='none';return}
 if(!e){css();e=document.createElement('div');e.id='swhud';document.body.appendChild(e)}
 const cl=tk.dep-CLOSE-n,here=tk.from==T.loc(),inAp=typeof window.apWhere=='function'?window.apWhere():'',
  step=tk.bt?(window.apCabinHint?window.apCabinHint(tk):'On board · find seat '+tk.seat):!here?'You are not at the departure airport!':inAp=='air'||inAp=='gate'?(n>=tk.dep-BOARD?'Boarding now at Gate '+tk.gate:'Boarding at Gate '+tk.gate+' opens '+T.hm(tk.dep-BOARD)):inAp=='land'?(tk.ck?'Go through security, then to Gate '+tk.gate:'Check in at a Swiftwing desk, then security'):'Go to '+T.apName(tk.from)+(tk.ck?'':' and check in');
 const h=`✈ <b>${tk.fl}</b> to ${esc(T.city(tk.to))} · Gate ${tk.gate} · gate closes <b>${T.hm(tk.dep-CLOSE)}</b>${tk.bt?'':' ('+T.left(tk.dep-CLOSE)+')'}<small>${esc(step)}</small>`;
 e.className=!tk.bt&&cl<60?'warn':'';if(e.innerHTML!=h)e.innerHTML=h;e.style.display='block'}
setInterval(()=>{try{hud()}catch(x){}},400);

/* ---- sleeping through a flight: warn first ---- */
{const q0=sleepQ;sleepQ=function(){q0.apply(this,arguments);try{const end=(S.day+1)*1440+360,L=T.active().filter(k=>!k.bt&&k.dep-CLOSE<end+120),bx=document.querySelector('#ui .box');
 if(L.length&&bx){const p=document.createElement('p');p.style.cssText='background:#3a1410;border:2px solid #ff6b4a;padding:6px 8px;margin:6px 0';
  p.innerHTML='✈ <b>You have '+(L.length>1?L.length+' flights':'a flight')+' soon:</b> '+L.map(k=>esc(k.fl)+' to '+esc(T.city(k.to))+', gate closes '+T.hm(k.dep-CLOSE)).join('; ')+'. You wake at 06:00. If the gate closes before you get there, the ticket is lost.';
  const h=bx.querySelector('h2');h?h.after(p):bx.prepend(p)}}catch(e){}}}
/* morning card */
{const w0=wakeUp;wakeUp=function(){w0.apply(this,arguments);try{const L=T.active().filter(k=>k.dep-T.now()<1440),bx=document.querySelector('#ui .box');if(!L.length||!bx)return;
 const p=document.createElement('p');p.style.cssText='background:#0b2a5b;border:2px solid #ff6b4a;padding:6px 8px;margin:6px 0';
 p.innerHTML='✈ <b>Flights today:</b> '+L.map(k=>esc(k.fl)+' '+esc(T.apName(k.from))+' → '+esc(T.city(k.to))+', Gate '+k.gate+', gate closes '+T.hm(k.dep-CLOSE)).join('<br>');
 const h=bx.querySelector('h2');h?h.after(p):bx.prepend(p)}catch(e){}}}
window.SWAPP=SW;
})();
