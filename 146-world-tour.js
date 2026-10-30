/* ===== v43.5.0: World Tour app =====
   A laptop app that shows up in the App Barn at Fame Level 275 and costs $250,000 once (kept for that save, in S.apps.wtour).
   Inside: an interactive world map (Miller projection, shapes in 137-world-map-data.js). Hover a continent to make it glow and see
   its name, click it to zoom in and see its countries (they glow too, with name labels), click a country to see its stops
   (city shows for big cities, a country show where there is no famous city) and add them to your tour, up to 5 stops.
   A tour is either a country tour (several cities in one country) or a continent/world tour (one city per country).
   Drag to move the map, mouse wheel or pinch to zoom, + / - buttons too. Each stop gets a setlist (songs or a whole album).
   The app only plans: flights are booked in the flight app, then you go to the airport and fly (other files).
   State (saved with S): S.wtour={stops:[{d:destId,songs:[songIds],alb:albumId|null}],done:{'dest|venue':{day,att,money,fol,str}},log:[],told}
   Travel (where you are, tickets) is read from S.travel (137-travel.js).
   Shared helpers for the stadium shows: wtSetlist(id), wtCanPlay(id,kind), wtPay(id,kind,score), wtShowDone(id,kind,res), wtPlan().
   Old saves: S.wtour is created when first needed; nothing else changes. */
(function(){
const NEED=275,PRICE=250000,MAXS=5,MAXSONGS=12,COOL=14;
const fl=()=>{try{return fameLevel()||0}catch(e){return 0}};
const fm=n=>'$'+Math.round(n).toLocaleString('en-US'),fmt=n=>n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(1)+'k':Math.round(n).toLocaleString('en-US');
const E=s=>{try{return esc(s)}catch(e){return String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';')}};
function st(){if(!S.wtour||typeof S.wtour!='object')S.wtour={};const T=S.wtour;
 if(!Array.isArray(T.stops))T.stops=[];T.stops=T.stops.filter(s=>s&&wtDest(s.d)).slice(0,MAXS);T.stops.forEach(s=>{if(!Array.isArray(s.songs))s.songs=[];if(s.alb===undefined)s.alb=null});
 if(!T.done||typeof T.done!='object')T.done={};if(!Array.isArray(T.log))T.log=[];return T}
const own=()=>!!(S.apps&&S.apps.wtour);
const songs=()=>(Array.isArray(S.songs)?S.songs:[]),albums=()=>(Array.isArray(S.albums)?S.albums:[]);
const songById=id=>songs().find(s=>s.id===id);

/* ---------- map projection (same as the shapes) ---------- */
const M=WT_MAP,my=l=>1.25*Math.log(Math.tan(Math.PI/4+.4*l*Math.PI/180)),Y0=my(M.lat0),Y1=my(M.lat1);
const P=(lat,lon)=>[(lon+180)/360*M.W,(Y0-my(Math.max(M.lat1-10,Math.min(M.lat0,lat))))/(Y0-Y1)*M.H];
const box=(la0,lo0,la1,lo1)=>{const a=P(la0,lo0),b=P(la1,lo1);return[a[0],a[1],b[0]-a[0],b[1]-a[1]]};
const CV={na:{lab:[47,-100],vb:box(72,-170,6,-50)},sa:{lab:[-14,-59],vb:box(14,-95,-56,-30)},eu:{lab:[53,14],vb:box(71,-26,34,46)},
 af:{lab:[6,20],vb:box(38,-22,-36,56)},as:{lab:[44,92],vb:box(60,24,-12,150)},oc:{lab:[-25,134],vb:box(2,108,-48,180)}};
const WORLD=[0,0,M.W,M.H];
const destIso=new Set(WT_DEST.map(d=>d.iso));
const cRow=iso=>M.c.find(r=>r[0]===iso);
const contOf=iso=>{const r=cRow(iso);return r?r[2]:null};

/* ---------- UI state (not saved) ---------- */
const U={tab:'map',cont:null,iso:null,vb:WORLD.slice(),set:0,anim:null};
function fitVb(v){const r=v.slice(),ar=M.W/M.H,cx=r[0]+r[2]/2,cy=r[1]+r[3]/2;let w=r[2],h=r[3];if(w/h>ar)h=w/ar;else w=h*ar;w*=1.12;h*=1.12;return[cx-w/2,cy-h/2,w,h]}
function clampVb(v){let[x,y,w,h]=v;w=Math.max(40,Math.min(M.W*1.1,w));h=w*M.H/M.W;x=Math.max(-w*.4,Math.min(M.W-w*.6,x));y=Math.max(-h*.4,Math.min(M.H-h*.6,y));return[x,y,w,h]}

/* ---------- shows: fame, setlist strength, pay ---------- */
function setStrength(stop){const L=(stop?stop.songs:[]).map(songById).filter(Boolean);if(!L.length)return 0;
 const q=L.reduce((a,s)=>a+Math.min(100,+s.q||0),0)/L.length/100,n=Math.min(1,L.length/10),hit=Math.min(1,L.reduce((a,s)=>a+Math.log10(1+(+s.streams||0)),0)/L.length/7);
 return Math.max(0,Math.min(1,q*.55+n*.25+hit*.2))}
const stopFor=id=>st().stops.find(s=>s.d===id)||null;
const venueOf=(d,kind)=>d?(kind=='club'?d.club:d.venue):null;
function canPlay(id,kind){kind=kind=='club'?'club':'venue';const d=wtDest(id),v=venueOf(d,kind);if(!v)return{ok:0,why:'Unknown show.'};
 if(fl()<v.fame)return{ok:0,why:v.n+' needs Fame Level '+v.fame+'. You are Level '+fl()+'.'};
 const T=st(),k=id+'|'+kind,last=T.done[k];if(last&&S.day-last.day<COOL)return{ok:0,why:'You played '+v.n+' on day '+last.day+'. It can book you again from day '+(last.day+COOL)+'.'};
 if(T.log.some(r=>r.day===S.day))return{ok:0,why:'You already played a show today. One show a day.'};
 return{ok:1,why:''}}
function pay(id,kind,score){kind=kind=='club'?'club':'venue';const d=wtDest(id),v=venueOf(d,kind);if(!v)return{att:0,money:0,fol:0,str:0};
 score=Math.max(0,Math.min(1,isFinite(score)?score:.7));const prep=setStrength(stopFor(id)),ex=fl()-v.fame;
 const fill=Math.max(.3,Math.min(1,.55+.012*ex+.25*prep)),att=Math.round(v.cap*fill*(.7+.3*score));
 return{att,money:Math.round(att*(v.tix*.05+1)),fol:Math.round(att*.12*(.5+score)),str:Math.round(att*18*(.5+score)),fill,prep}}
function done(id,kind,res){kind=kind=='club'?'club':'venue';const d=wtDest(id);if(!d)return;const T=st(),r=Object.assign({day:S.day},res||{});T.done[id+'|'+kind]=r;
 T.log.push(Object.assign({d:id,kind},r));if(T.log.length>60)T.log=T.log.slice(-60)}
window.wtSetlist=id=>{const s=stopFor(id);return s?s.songs.map(songById).filter(Boolean):[]};
window.wtCanPlay=canPlay;window.wtPay=pay;window.wtShowDone=done;window.wtPlan=()=>st().stops.slice();

/* ---------- tour editing ---------- */
const tourKind=()=>{const L=st().stops.map(s=>wtDest(s.d));if(!L.length)return'';const cs=new Set(L.map(d=>d.country)),ks=new Set(L.map(d=>d.cont));
 return cs.size==1&&L.length>1?L[0].country+' Tour':cs.size==1?L[0].country+' Show':ks.size==1?WT_CONT[L[0].cont].n+' Tour':'World Tour'};
function addStop(id){const T=st(),d=wtDest(id);if(!d||T.stops.some(s=>s.d===id))return;
 if(fl()<Math.min(d.venue.fame,d.club.fame))return say('You need Fame Level '+Math.min(d.venue.fame,d.club.fame)+' for '+wtPlace(d)+'.');
 const L=T.stops.map(s=>wtDest(s.d)),same=L.filter(x=>x.country===d.country),allSame=L.length&&L.every(x=>x.country===d.country);
 /* a mixed tour plays one city per country: picking another city in a country already on the tour swaps it */
 if(same.length&&!allSame){const i=T.stops.findIndex(s=>wtDest(s.d).country===d.country);const old=wtDest(T.stops[i].d);T.stops[i]={d:id,songs:T.stops[i].songs,alb:T.stops[i].alb};snd2('pop');say(d.city+' replaces '+old.city+' on your tour.');return}
 if(T.stops.length>=MAXS)return say('A tour has at most '+MAXS+' stops. Remove one first.'),snd2('err');
 const prev=T.stops[T.stops.length-1];T.stops.push({d:id,songs:prev?prev.songs.slice():[],alb:prev?prev.alb:null});snd2('cash');say(wtPlace(d)+' added to your tour.')}
function rmStop(id){const T=st();T.stops=T.stops.filter(s=>s.d!==id);U.set=Math.min(U.set,Math.max(0,T.stops.length-1));snd2('click')}
function snd2(k){try{snd(k)}catch(e){}}

/* ---------- styles ---------- */
function css(){if($('wtxcss'))return;const s=document.createElement('style');s.id='wtxcss';s.textContent=`
.mn.wtxmn{padding:0!important;background:#060a1c}
.wtx{--wn:#060a1c;--wp:#0d1533;--wl:#1a2650;--wg:#ffcc4d;--wc:#ff6f61;--wt:#eaf0ff;--wm:#8d9cc8;min-height:100%;box-sizing:border-box;color:var(--wt);font:13px ui-monospace,Menlo,Consolas,monospace;background:radial-gradient(ellipse at 20% -10%,#1d2c6e 0%,#0b1230 45%,#060a1c 100%);padding:14px 16px 18px;display:flex;flex-direction:column;gap:10px}
.wtx .wh{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.wtx .wh img{width:40px;image-rendering:pixelated;filter:drop-shadow(0 0 6px #ffcc4d88)}
.wtx .wh h1{margin:0;font:24px Silkscreen,ui-monospace,monospace;letter-spacing:3px;background:linear-gradient(180deg,#fff3c4,#ffcc4d 55%,#ff9f43);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(2px 2px 0 #000)}
.wtx .wh small{display:block;color:var(--wm)}.wtx .wh .wst{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.wtx .pill{border:2px solid #000;background:#0d1533;padding:5px 10px;box-shadow:inset 0 0 0 1px #2a3a78;white-space:nowrap}.wtx .pill b{color:var(--wg)}
.wtx .tabs{display:flex;border:3px solid #000;width:max-content;max-width:100%;box-shadow:4px 4px 0 #0008;flex-wrap:wrap}
.wtx .tabs button{all:unset;cursor:pointer;padding:8px 18px;min-height:20px;font:12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;background:#111a40;color:var(--wm)}
.wtx .tabs button.on{background:var(--wg);color:#1a1240}.wtx .tabs button:not(.on):hover{background:#1f2c66;color:#fff}
.wtx .body{display:flex;gap:12px;align-items:stretch;min-height:0;flex-wrap:wrap}
.wtx .mapw{position:relative;flex:1 1 440px;min-width:280px;border:3px solid #000;box-shadow:4px 4px 0 #0008,inset 0 0 0 2px #2a3a78;background:#081233;overflow:hidden;aspect-ratio:1000/520;max-height:62vh}
.wtx svg.map{display:block;width:100%;height:100%;touch-action:none;cursor:grab;user-select:none}.wtx svg.map.drag{cursor:grabbing}
.wtx svg .sea{fill:url(#wtxsea)}.wtx svg .grat{stroke:#2a3d82;stroke-width:.35;fill:none;opacity:.55;vector-effect:non-scaling-stroke}
.wtx svg path.cy{fill:#2a3768;stroke:#0a1130;stroke-width:.6;vector-effect:non-scaling-stroke;transition:fill .18s}
.wtx svg g.ct{cursor:pointer}.wtx svg g.ct:hover path.cy{fill:var(--cc)}.wtx svg g.ct:hover{filter:drop-shadow(0 0 3px var(--cc)) drop-shadow(0 0 7px var(--cc));animation:wtxfl 1s ease-in-out infinite}
@keyframes wtxfl{0%,100%{opacity:1}50%{opacity:.82}}
.wtx svg.lv1 g.ct{cursor:default;filter:none!important;animation:none}.wtx svg.lv1 g.ct path.cy{fill:#17204a}.wtx svg.lv1 g.ct.cur path.cy{fill:#2b3a74}
.wtx svg.lv1 g.ct.cur path.cy.d{fill:color-mix(in srgb,var(--cc) 45%,#2b3a74)}
.wtx svg.lv1 g.ct path.cy:hover,.wtx svg.lv1 g.ct path.cy.sel{fill:var(--cc)!important;filter:drop-shadow(0 0 2px var(--cc)) drop-shadow(0 0 6px var(--cc));cursor:pointer}
.wtx svg.lv1 g.ct:not(.cur) path.cy:hover{fill:#3a4a8a!important;filter:none}
.wtx svg text{pointer-events:none;font-family:Silkscreen,ui-monospace,monospace;paint-order:stroke;stroke:#050816;stroke-linejoin:round;fill:#fff}
.wtx svg text.cl{fill:#fff7d6;letter-spacing:.06em}.wtx svg text.nl{fill:#e7ecff}.wtx svg text.nl.d{fill:#ffe08a}
.wtx svg .pin{fill:var(--wg);stroke:#000;vector-effect:non-scaling-stroke;stroke-width:1.2}.wtx svg .pin.in{fill:#7dffb0}.wtx svg .pring{fill:none;stroke:var(--wg);vector-effect:non-scaling-stroke;stroke-width:1.5;animation:wtxpr 1.6s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes wtxpr{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.6);opacity:0}}
.wtx svg .route{fill:none;stroke:#ffcc4d;stroke-dasharray:4 4;vector-effect:non-scaling-stroke;stroke-width:1.6;opacity:.85;animation:wtxdash 1.2s linear infinite}@keyframes wtxdash{to{stroke-dashoffset:-16}}
.wtx .mctl{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:6px}.wtx .mctl button,.wtx .mback{all:unset;cursor:pointer;min-width:36px;height:36px;display:grid;place-items:center;background:#0d1533e6;border:2px solid #000;box-shadow:inset 0 0 0 1px #3a4c98;color:#fff;font:16px Silkscreen,ui-monospace,monospace}
.wtx .mback{position:absolute;left:8px;top:8px;padding:0 12px;font-size:12px}.wtx .mctl button:hover,.wtx .mback:hover{background:#1f2c66}
.wtx .mhint{position:absolute;left:8px;bottom:8px;right:8px;pointer-events:none;color:#c8d2ff;font-size:11px;text-shadow:1px 1px 0 #000}
.wtx .side{flex:0 1 300px;min-width:240px;display:flex;flex-direction:column;gap:10px;max-height:62vh;overflow:auto}
.wtx .pan{background:#0d1533;border:3px solid #000;box-shadow:4px 4px 0 #0008,inset 0 0 0 2px #22306a;padding:10px 12px}
.wtx .pan h2{margin:0 0 6px;font:15px Silkscreen,ui-monospace,monospace;color:var(--wg);letter-spacing:1px}.wtx .pan h2 small{color:var(--wm);font:11px ui-monospace,monospace;letter-spacing:0;display:block}
.wtx .m2{color:var(--wm);font-size:12px;margin:4px 0}
.wtx .dc{position:relative;background:linear-gradient(135deg,#16224f,#0f1838);border:2px solid #000;margin:8px 0;padding:10px 12px 10px 16px}.wtx .dc:before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--cc,#ffcc4d)}
.wtx .dc b.cn{display:block;font:14px Silkscreen,ui-monospace,monospace;color:#fff}.wtx .dc .rw{display:flex;justify-content:space-between;gap:8px;font-size:12px;margin-top:3px}.wtx .dc .rw span:first-child{color:var(--wm)}
.wtx .lk{color:#ff9a8a}.wtx .okc{color:#7dffb0}
.wtx .btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;padding:6px 12px;margin-top:8px;border:2px solid #000;background:#1f2c66;color:#fff;font:12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;box-shadow:inset 0 -3px 0 #0006}
.wtx .btn:hover{background:#2c3c85}.wtx .btn:active{transform:scale(.97)}.wtx .btn.go{background:linear-gradient(180deg,#ffe08a,#ffb83d);color:#2a1600}.wtx .btn.go:hover{filter:brightness(1.08)}.wtx .btn.red{background:#5a1f2a}.wtx .btn[disabled]{opacity:.4;pointer-events:none}
.wtx .chips{display:flex;flex-wrap:wrap;gap:6px}.wtx .chip{all:unset;cursor:pointer;min-height:30px;display:inline-flex;align-items:center;padding:3px 10px;border:2px solid #000;background:#16224f;font-size:12px}.wtx .chip:hover{background:var(--cc,#2c3c85);color:#000}
.wtx .tk{display:flex;align-items:stretch;margin:0 0 10px;background:#f4ecd6;color:#2a2138;border:3px solid #000;box-shadow:4px 4px 0 #0008}
.wtx .tk .tn{width:46px;flex:none;display:grid;place-items:center;background:var(--cc,#ffcc4d);font:20px Silkscreen,ui-monospace,monospace;color:#1a1240;border-right:3px dashed #000}
.wtx .tk .tb2{flex:1;padding:8px 12px;min-width:0}.wtx .tk .tb2 b{font:14px Silkscreen,ui-monospace,monospace;display:block}.wtx .tk .tb2 .m3{font-size:12px;color:#5d5470}
.wtx .tk .ta{display:flex;flex-direction:column;gap:4px;padding:6px;justify-content:center}.wtx .tk .ta button{all:unset;cursor:pointer;width:32px;height:24px;display:grid;place-items:center;border:2px solid #000;background:#fff;color:#1a1240;font-weight:700}.wtx .tk .ta button:hover{background:#ffe08a}
.wtx .tk.on{outline:3px solid var(--wg);outline-offset:2px}.wtx .tk.dn{background:#d7f5e4}
.wtx .bar{width:100%;box-sizing:border-box;height:10px;background:#060a1c;border:2px solid #000;margin-top:4px}.wtx .bar i{display:block;height:100%;background:linear-gradient(90deg,#ff6f61,#ffcc4d,#7dffb0)}
.wtx .sl{max-height:260px;overflow:auto;border:2px solid #000;background:#0a1130}.wtx .sl label{display:flex;gap:8px;align-items:center;padding:6px 8px;border-bottom:1px solid #1d2a5a;cursor:pointer;min-height:24px}.wtx .sl label:hover{background:#16224f}
.wtx .sl input{accent-color:#ffcc4d;width:16px;height:16px}.wtx .sl .q{margin-left:auto;color:var(--wm);font-size:11px;white-space:nowrap}
.wtx select{background:#0a1130;color:#fff;border:2px solid #000;min-height:34px;padding:0 8px;font:12px ui-monospace,monospace;max-width:100%}
.wtx .steps{display:flex;gap:6px;flex-wrap:wrap;counter-reset:s}.wtx .steps div{flex:1 1 120px;background:#0a1130;border:2px solid #000;padding:8px;font-size:11px;color:var(--wm)}.wtx .steps div b{display:block;color:#fff;font:11px Silkscreen,ui-monospace,monospace;margin-bottom:3px}.wtx .steps div.ok{background:#123326}.wtx .steps div.ok b{color:#7dffb0}.wtx .steps div.now{outline:2px solid var(--wg)}
.wtx .lock{max-width:520px;margin:30px auto;text-align:center}.wtx .lock .big{font:48px Silkscreen,ui-monospace,monospace;color:var(--wg)}
.wtx table{width:100%;border-collapse:collapse;font-size:12px}.wtx td,.wtx th{border-bottom:1px solid #1d2a5a;padding:6px;text-align:left}.wtx th{color:var(--wg);font:11px Silkscreen,ui-monospace,monospace}
@media (max-width:760px){.wtx .side{flex:1 1 100%;max-height:none}.wtx .mapw{max-height:50vh}}`;document.head.appendChild(s)}

/* ---------- icon ---------- */
try{IC.wtour=mkIc(['...BBBB...','..BGGBBB..','.BGGGBBGB.','BBGGBBGGGB','BBBGBBBGGB','BGBBBBBBGB','BGGBBGBBBB','.BGGBGGBB.','..BBBGGB..','...BBBB...'],{B:'#2f6fe0',G:'#3ddc84'})}catch(e){try{IC.wtour=IC.store}catch(e2){}}
APPD.wtour={n:'World Tour',p:PRICE,d:'Plan a world tour: a zoomable world map, every country and city you can play, their stadiums, ticket prices and fame needed, and a setlist for each show. Opens in the App Barn at Fame Level '+NEED+'. Pay once, keep it for good.'};

/* App Barn: locked below Fame 275, with the price and what it does shown either way */
{const s0=PA.store;PA.store=function(){let h=s0.apply(this,arguments);try{if(!own()&&fl()<NEED)h=h.replace(/<button class=go[^>]*onclick="inst\('wtour'\)">[^<]*<\/button>/,`<button disabled title="Reach Fame Level ${NEED}">Fame Level ${NEED} · ${fm(PRICE)}</button>`)}catch(e){}return h}}
{const i0=inst;inst=function(k){if(k=='wtour'&&!own()&&fl()<NEED){snd2('err');return say('World Tour opens at Fame Level '+NEED+'. You are Level '+fl()+'.')}const had=own(),r=i0.apply(this,arguments);if(k=='wtour'&&!had&&own()){st();say('World Tour unlocked for good. Open it from the desktop.')}return r}}
/* tell the player once when it unlocks */
setInterval(()=>{try{if(!S||!S.artist)return;const T=st();if(!T.told&&!own()&&fl()>=NEED){T.told=1;say('Fame Level '+NEED+'! The World Tour app is now in the App Barn ('+fm(PRICE)+').')}}catch(e){}},2000);

/* ---------- map svg ---------- */
function grat(){let d='';for(let lo=-150;lo<=180;lo+=30){const a=P(M.lat0,lo),b=P(M.lat1,lo);d+=`M${a[0].toFixed(1)} 0V${M.H}`}for(const la of [-30,0,30,60]){const y=P(la,0)[1].toFixed(1);d+=`M0 ${y}H${M.W}`}return d}
function mapSvg(){const T=st(),lv=U.cont?1:0;let g='';
 for(const k of Object.keys(WT_CONT)){const cc=WT_CONT[k].c,rows=M.c.filter(r=>r[2]==k);
  g+=`<g class="ct${U.cont==k?' cur':''}" data-c="${k}" style="--cc:${cc}">`+rows.map(r=>`<path class="cy${destIso.has(r[0])?' d':''}${U.iso===r[0]?' sel':''}" data-i="${r[0]}" d="${r[3]}"><title>${E(r[1])}${destIso.has(r[0])?' · tour stops':''}</title></path>`).join('')+'</g>'}
 /* the tour route */
 let rt='';const pts=T.stops.map(s=>{const d=wtDest(s.d);return P(d.lat,d.lon)});if(pts.length>1)rt=`<path class=route d="M${pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')}"/>`;
 return`<svg class="map lv${lv}" id=wtxsvg viewBox="${U.vb.map(v=>v.toFixed(2)).join(' ')}" preserveAspectRatio="xMidYMid meet"><defs><radialGradient id=wtxsea cx=50% cy=40% r=75%><stop offset=0 stop-color="#12235c"/><stop offset=1 stop-color="#060c26"/></radialGradient></defs>
 <rect class=sea x="-2000" y="-2000" width="5000" height="5000"/><path class=grat d="${grat()}"/>${g}${rt}<g id=wtxpins></g><g id=wtxlab></g></svg>`}
/* labels and pins sized for the current zoom, so text stays the same size on screen */
function decorate(){const sv=$('wtxsvg');if(!sv)return;const r=sv.getBoundingClientRect();if(!r.width)return;const k=Math.min(r.width/U.vb[2],r.height/U.vb[3]),px=n=>(n/k).toFixed(2);
 let lab='',pins='';const T=st(),inT=new Set(T.stops.map(s=>s.d));
 if(!U.cont){for(const c of Object.keys(CV)){const p=P(...CV[c].lab);lab+=`<text class=cl x="${p[0]}" y="${p[1]}" text-anchor=middle dominant-baseline=middle font-size="${px(r.width<520?11:14)}" stroke-width="${px(3)}">${E(WT_CONT[c].n.toUpperCase())}</text>`}}
 else{const rows=M.c.filter(q=>q[2]==U.cont).sort((a,b)=>b[6]-a[6]);
  rows.sort((a,b)=>destIso.has(b[0])-destIso.has(a[0]));const placed=[];
  for(const q of rows){const d=destIso.has(q[0]),w=(q[9]-q[7])*k,fs=d?12:10,tw=q[1].length*fs*.62;if(!d&&w<tw*.8)continue;
   /* skip a label that would sit on top of one already placed (sizes in screen pixels) */
   const bx=[q[4]*k-tw/2-2,q[5]*k-fs/2-1,q[4]*k+tw/2+2,q[5]*k+fs/2+1];if(placed.some(o=>bx[0]<o[2]&&bx[2]>o[0]&&bx[1]<o[3]&&bx[3]>o[1]))continue;placed.push(bx);
   lab+=`<text class="nl${d?' d':''}" x="${q[4]}" y="${q[5]}" text-anchor=middle dominant-baseline=middle font-size="${px(fs)}" stroke-width="${px(3)}">${E(q[1])}</text>`}
  for(const d of WT_DEST){if(d.cont!==U.cont)continue;const p=P(d.lat,d.lon),on=inT.has(d.id);pins+=`<circle class=pring cx="${p[0]}" cy="${p[1]}" r="${px(5)}"/><circle class="pin${on?' in':''}" cx="${p[0]}" cy="${p[1]}" r="${px(on?4.5:3.5)}"><title>${E(wtPlace(d))}</title></circle>`;
   if(U.iso===d.iso&&d.city)lab+=`<text class=nl x="${p[0]+5.5/k}" y="${p[1]}" dominant-baseline=middle font-size="${px(11)}" stroke-width="${px(3)}">${E(d.city)}</text>`}}
 if(!U.cont)for(const s of T.stops){const d=wtDest(s.d),p=P(d.lat,d.lon);pins+=`<circle class="pin in" cx="${p[0]}" cy="${p[1]}" r="${px(3.5)}"/>`}
 $('wtxlab').innerHTML=lab;$('wtxpins').innerHTML=pins}
function setVb(v,anim){v=clampVb(v);if(U.anim)cancelAnimationFrame(U.anim);const sv=$('wtxsvg');if(!anim||!sv){U.vb=v;if(sv)sv.setAttribute('viewBox',v.join(' '));decorate();return}
 const a=U.vb.slice(),t0=performance.now(),D=420;const step=t=>{const f=Math.min(1,(t-t0)/D),e=1-Math.pow(1-f,3);U.vb=a.map((x,i)=>x+(v[i]-x)*e);const s2=$('wtxsvg');if(!s2)return;s2.setAttribute('viewBox',U.vb.join(' '));decorate();if(f<1)U.anim=requestAnimationFrame(step);else U.anim=null};U.anim=requestAnimationFrame(step)}
function zoomAt(f,cx,cy){const v=U.vb,w=Math.max(40,Math.min(M.W*1.1,v[2]*f)),h=w*M.H/M.W,fx=(cx-v[0])/v[2],fy=(cy-v[1])/v[3];setVb([cx-fx*w,cy-fy*h,w,h])}
function toMap(sv,x,y){const m=sv.getScreenCTM();if(!m)return[0,0];const p=sv.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(m.inverse());return[q.x,q.y]}
function hook(){const sv=$('wtxsvg');if(!sv||sv.dataset.h)return;sv.dataset.h=1;const pt=new Map();let drag=null,pinch=null,moved=0;
 sv.addEventListener('wheel',e=>{e.preventDefault();const[x,y]=toMap(sv,e.clientX,e.clientY);zoomAt(e.deltaY>0?1.15:1/1.15,x,y)},{passive:false});
 sv.addEventListener('pointerdown',e=>{pt.set(e.pointerId,[e.clientX,e.clientY]);try{sv.setPointerCapture(e.pointerId)}catch(_){}
  if(pt.size==1){drag={x:e.clientX,y:e.clientY,vb:U.vb.slice(),m:sv.getScreenCTM()};moved=0}
  else if(pt.size==2){const[a,b]=[...pt.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),vb:U.vb.slice(),c:toMap(sv,(a[0]+b[0])/2,(a[1]+b[1])/2)};drag=null;moved=1}});
 sv.addEventListener('pointermove',e=>{if(!pt.has(e.pointerId))return;pt.set(e.pointerId,[e.clientX,e.clientY]);
  if(pinch&&pt.size>=2){const[a,b]=[...pt.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d>0){const f=pinch.d/d,v=pinch.vb,w=v[2]*f,h=w*M.H/M.W,c=pinch.c,fx=(c[0]-v[0])/v[2],fy=(c[1]-v[1])/v[3];setVb([c[0]-fx*w,c[1]-fy*h,w,h])}return}
  if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5){moved=1;sv.classList.add('drag')}
  if(moved&&drag.m){const s=drag.m.a||1;setVb([drag.vb[0]-dx/s,drag.vb[1]-dy/s,drag.vb[2],drag.vb[3]])}});
 const up=e=>{pt.delete(e.pointerId);if(pt.size<2)pinch=null;if(!pt.size){sv.classList.remove('drag');const was=moved;drag=null;if(!was&&e.type=='pointerup')pick(e)}};
 sv.addEventListener('pointerup',up);sv.addEventListener('pointercancel',up);
 addEventListener('resize',()=>{try{decorate()}catch(_){}})}
function pick(e){const el=document.elementFromPoint(e.clientX,e.clientY);if(!el||!el.closest)return;const p=el.closest('path.cy'),g=el.closest('g.ct');if(!g)return;const c=g.dataset.c;if(!WT_CONT[c])return;
 /* world view, or a country on another continent: open that continent */
 if(U.cont!==c){U.cont=c;U.iso=null;snd2('pop');redraw(CV[c].vb);return}
 if(p){U.iso=+p.dataset.i;snd2('click');redraw()}}
function redraw(goto){pcR();if(goto)setVb(fitVb(goto),1)}
window.wtxBack=()=>{snd2('click');if(U.iso){U.iso=null;return pcR()}U.cont=null;redraw(WORLD)};
window.wtxZoom=f=>{const v=U.vb;zoomAt(f,v[0]+v[2]/2,v[1]+v[3]/2)};
window.wtxCont=c=>{if(!WT_CONT[c])return;U.cont=c;U.iso=null;snd2('pop');redraw(CV[c].vb)};
window.wtxIso=i=>{const c=contOf(+i);if(!c)return;const nw=U.cont!==c;U.cont=c;U.iso=+i;snd2('click');redraw(nw?CV[c].vb:null)};
window.wtxTab=t=>{U.tab=t;snd2('click');pcR()};
window.wtxAdd=id=>{addStop(id);pcR()};window.wtxRm=id=>{rmStop(id);pcR()};
window.wtxMove=(i,d)=>{const L=st().stops,j=i+d;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];U.set=j;snd2('click');pcR()};
window.wtxSet=i=>{U.set=i;pcR()};
window.wtxSong=(i,id,on)=>{const s=st().stops[i];if(!s)return;s.alb=null;s.songs=s.songs.filter(x=>x!==id);if(on){if(s.songs.length>=MAXSONGS){snd2('err');say('A setlist holds up to '+MAXSONGS+' songs.')}else s.songs.push(id)}pcR()};
window.wtxAlb=(i,v)=>{const s=st().stops[i];if(!s)return;const a=albums().find(x=>String(x.id)===String(v));if(!a){s.alb=null;return pcR()}s.alb=a.id;s.songs=(a.songs||[]).filter(id=>songById(id)).slice(0,MAXSONGS);snd2('pop');pcR()};
window.wtxBest=i=>{const s=st().stops[i];if(!s)return;s.alb=null;s.songs=songs().slice().sort((a,b)=>(b.streams||0)-(a.streams||0)||(b.q||0)-(a.q||0)).slice(0,10).map(x=>x.id);snd2('pop');pcR()};
window.wtxAll=i=>{const T=st(),s=T.stops[i];if(!s)return;T.stops.forEach(o=>{o.songs=s.songs.slice();o.alb=s.alb});snd2('cash');say('Every stop now plays this setlist.');pcR()};
window.wtxClear=()=>{if(!confirm('Clear your whole tour plan? Shows you already played stay in your history.'))return;st().stops=[];U.set=0;pcR()};
window.wtxFly=()=>{const k=flyApp();if(k){app=k;snd2('click');pcR()}else say('Book flights in the flight app on your laptop.')};
function flyApp(){try{for(const k in APPD){if(k!='wtour'&&/flight|fly|air/i.test(APPD[k].n+' '+k)&&(S.apps[k]||PA[k]))return k}}catch(e){}return null}

/* ---------- travel status (the travel state belongs to the airport/flight files: read it if it is there) ---------- */
function trav(){try{const t=S.travel;if(!t||typeof t!='object')return{};return{at:typeof t.loc=='string'&&t.loc!='home'?t.loc:null,tk:Array.isArray(t.tickets)?t.tickets:[]}}catch(e){return{}}}
const tkTo=(tr,id)=>(tr.tk||[]).find(t=>t&&t.to===id&&t.st=='booked');
const localT=d=>{try{const m=S.t<300?360+S.t/300*840:1200+(S.t-300)/300*600,l=((m+d.tz*60)%1440+1440)%1440;return String(Math.floor(l/60)).padStart(2,'0')+':'+String(Math.floor(l%60)).padStart(2,'0')}catch(e){return'--:--'}};

/* ---------- pages ---------- */
function head(){const T=st();return`<div class=wh><img src="${IC.wtour}" alt=""><div><h1>WORLD TOUR</h1><small>${T.stops.length?E(tourKind())+' · '+T.stops.length+'/'+MAXS+' stops':'Plan up to '+MAXS+' stops around the world'}</small></div>
 <div class=wst><span class=pill>Fame <b>${fl()}</b>/${typeof FAME_MAX!='undefined'?FAME_MAX:350}</span><span class=pill>Balance <b>${fm(S.money)}</b></span></div></div>
 <div class=tabs>${[['map','Map'],['tour','My tour'+(T.stops.length?' ('+T.stops.length+')':'')],['done','Shows played']].map(t=>`<button class="${U.tab==t[0]?'on':''}" onclick="wtxTab('${t[0]}')">${t[1]}</button>`).join('')}</div>`}
function destCard(d){const T=st(),inT=T.stops.some(s=>s.d===d.id),lv=fl(),cc=WT_CONT[d.cont].c,tr=trav(),here=tr.at===d.id;
 const vrow=(v,lab)=>`<div class=rw><span>${lab}</span><span>${E(v.n)}</span></div><div class=rw><span>Crowd · ticket</span><span>${fmt(v.cap)} · ${fm(v.tix)}</span></div><div class=rw><span>Fame needed</span><span class="${lv>=v.fame?'okc':'lk'}">${lv>=v.fame?'✓ ':''}Level ${v.fame}</span></div>`;
 const L=T.stops.map(s=>wtDest(s.d)),swap=!inT&&L.some(x=>x.country===d.country)&&!L.every(x=>x.country===d.country);
 const full=!inT&&!swap&&T.stops.length>=MAXS,low=lv<Math.min(d.venue.fame,d.club.fame);
 return`<div class=dc style="--cc:${cc}"><b class=cn>${E(d.city||d.country+' (country show)')}</b>${d.city?'':`<div class=m2>No big city here: you play a smaller town with its own stadium.</div>`}
 ${vrow(d.venue,'Stadium')}${vrow(d.club,'Smaller show')}
 <div class=rw><span>Flight from home</span><span>${d.hrs}h · from ${fm(d.fare)}</span></div><div class=rw><span>Local time now</span><span>${localT(d)}</span></div>
 ${here?'<div class="rw okc"><span>You are here</span><span>✓</span></div>':''}
 ${inT?`<button class="btn red" onclick="wtxRm('${d.id}')">Remove from tour</button>`:`<button class="btn go" ${full||low?'disabled':''} onclick="wtxAdd('${d.id}')">${swap?'Swap into tour':'Add to tour'}</button>`}
 ${full?'<div class="m2 lk">Your tour is full (5 stops).</div>':''}${swap?'<div class=m2>Your tour plays one city per country, so this swaps out the other city.</div>':''}</div>`}
function side(){const T=st();
 if(!U.cont)return`<div class=pan><h2>Pick a continent<small>Hover to light it up, click to open it.</small></h2><div class=chips>${Object.keys(WT_CONT).map(c=>`<button class=chip style="--cc:${WT_CONT[c].c}" onclick="wtxCont('${c}')">${WT_CONT[c].n}</button>`).join('')}</div></div>${tourMini()}`;
 const cs=[...new Set(WT_DEST.filter(d=>d.cont==U.cont).map(d=>d.iso))].map(i=>WT_DEST.find(d=>d.iso==i));
 if(!U.iso)return`<div class=pan><h2>${E(WT_CONT[U.cont].n)}<small>Click a glowing country on the map, or pick one here.</small></h2><div class=chips>${cs.map(d=>`<button class=chip style="--cc:${WT_CONT[U.cont].c}" onclick="wtxIso(${d.iso})">${E(d.country)}</button>`).join('')}</div></div>${tourMini()}`;
 const r=cRow(U.iso),L=WT_DEST.filter(d=>d.iso===U.iso);
 return`<div class=pan><h2>${E(r?r[1]:'')}<small>${E(WT_CONT[U.cont].n)}${L.length>1?' · pick a city, or several for a country tour':''}</small></h2>${L.length?L.map(destCard).join(''):`<p class=m2>No tour stops in ${E(r?r[1]:'this country')} yet. The glowing countries have stadiums.</p>`}</div>${tourMini()}`}
function tourMini(){const T=st();if(!T.stops.length)return`<div class=pan><h2>Your tour<small>Empty. Add up to ${MAXS} stops from the map.</small></h2></div>`;
 return`<div class=pan><h2>${E(tourKind())}<small>${T.stops.length}/${MAXS} stops</small></h2>${T.stops.map((s,i)=>{const d=wtDest(s.d);return`<div class=rw style="display:flex;justify-content:space-between;gap:6px;margin:3px 0"><span>${i+1}. ${E(wtPlace(d))}</span><span class=m2>${s.songs.length} songs</span></div>`}).join('')}<button class=btn onclick="wtxTab('tour')">Setlists and next steps</button></div>`}
function mapPage(){const lv=U.cont?1:0;
 return`<div class=body><div class=mapw>${mapSvg()}<div class=mctl><button title="Zoom in" onclick="wtxZoom(1/1.4)">+</button><button title="Zoom out" onclick="wtxZoom(1.4)">−</button></div>
 ${lv?`<button class=mback onclick="wtxBack()">◀ ${U.iso?E(WT_CONT[U.cont].n):'World'}</button>`:''}<div class=mhint>${lv?'Click a country · drag to move · scroll or pinch to zoom':'Hover a continent and click it · drag to move · scroll or pinch to zoom'}</div></div><div class=side>${side()}</div></div>`}
function stepsHtml(){const T=st(),tr=trav(),fa=flyApp();const nxt=T.stops.find(s=>!T.done[s.d+'|venue']&&!T.done[s.d+'|club']),d=nxt&&wtDest(nxt.d),tk=d&&tkTo(tr,d.id),here=d&&tr.at===d.id;
 const S1=T.stops.length>0,S2=S1&&nxt&&nxt.songs.length>0,S3=!!tk||here,S4=here;
 const c=(ok,now,t,x)=>`<div class="${ok?'ok':now?'now':''}"><b>${ok?'✓ ':''}${t}</b>${x}</div>`;
 return`<div class=pan><h2>Your journey${d?`<small>Next stop: ${E(wtPlace(d))}</small>`:T.stops.length?'<small>Every stop on this tour is played.</small>':''}</h2><div class=steps>
 ${c(S1,!S1,'1 Plan','Add stops on the map.')}${c(S2,S1&&!S2,'2 Setlist','Pick songs or an album for the show.')}
 ${c(S3,S2&&!S3,'3 Book a flight',tk?'Ticket booked.':'In the flight app'+(d?' to '+E(d.city||d.country):'')+'. Check the gate and boarding time.')}
 ${c(S4,S3&&!S4,'4 Fly','Go to the airport and board at your gate before the deadline. Late means missed.')}
 ${c(0,S4,'5 Perform','Head to the stadium, enter and play your setlist.')}</div>
 ${S2&&!S3?`<button class="btn go" onclick="wtxFly()">Open the flight app</button>`:''}</div>`}
function tourPage(){const T=st();if(!T.stops.length)return`<div class=pan><h2>No tour yet<small>Open the map, click a continent, then a country, and add stops.</small></h2><button class="btn go" onclick="wtxTab('map')">Open the map</button></div>`;
 U.set=Math.min(U.set,T.stops.length-1);const cur=T.stops[U.set],cd=wtDest(cur.d),str=setStrength(cur),lv=fl();
 const tks=T.stops.map((s,i)=>{const d=wtDest(s.d),dn=T.done[s.d+'|venue']||T.done[s.d+'|club'],est=pay(s.d,'venue',.75),ok=lv>=d.venue.fame;
  return`<div class="tk${i==U.set?' on':''}${dn?' dn':''}" style="--cc:${WT_CONT[d.cont].c}"><div class=tn>${i+1}</div><div class=tb2 onclick="wtxSet(${i})" style="cursor:pointer"><b>${E(wtPlace(d))}</b>
  <div class=m3>${E(d.venue.n)} · ${fmt(d.venue.cap)} seats · ${ok?'about '+fm(est.money)+' a show':'needs Fame '+d.venue.fame+' (smaller show: '+E(d.club.n)+')'}</div><div class=m3>${s.songs.length?s.songs.length+' songs'+(s.alb!=null?' · album':''):'No setlist yet'} · ${d.hrs}h flight from ${fm(d.fare)}${dn?' · ✓ played day '+dn.day:''}</div></div>
  <div class=ta><button title="Move up" onclick="wtxMove(${i},-1)">▲</button><button title="Move down" onclick="wtxMove(${i},1)">▼</button><button title="Remove" onclick="wtxRm('${s.d}')">✕</button></div></div>`}).join('');
 const SL=songs().slice().sort((a,b)=>(b.streams||0)-(a.streams||0)),AL=albums();
 const ed=`<div class=pan><h2>Setlist · ${E(cd.city||cd.country)}<small>${cur.songs.length}/${MAXSONGS} songs. Better songs, more of them and bigger hits fill more seats.</small></h2>
  <div class=rw style="display:flex;justify-content:space-between"><span class=m2>Show strength</span><span>${Math.round(str*100)}%</span></div><div class=bar><i style="width:${Math.round(str*100)}%"></i></div>
  ${AL.length?`<p class=m2>Play an album: <select onchange="wtxAlb(${U.set},this.value)"><option value="">Pick songs yourself</option>${AL.map(a=>`<option value="${a.id}" ${String(cur.alb)===String(a.id)?'selected':''}>${E(a.name)} (${(a.songs||[]).length})</option>`).join('')}</select></p>`:''}
  ${SL.length?`<div class=sl>${SL.map(s=>`<label><input type=checkbox ${cur.songs.includes(s.id)?'checked':''} onchange="wtxSong(${U.set},${s.id},this.checked)">${E(s.title)}<span class=q>Q${Math.round(s.q||0)} · ${fmt(s.streams||0)}</span></label>`).join('')}</div>`:'<p class=m2>Release some songs first, then build a setlist.</p>'}
  <div style="display:flex;gap:6px;flex-wrap:wrap"><button class=btn onclick="wtxBest(${U.set})">Top 10 hits</button>${T.stops.length>1?`<button class=btn onclick="wtxAll(${U.set})">Use for every stop</button>`:''}</div></div>`;
 return`${stepsHtml()}<div class=body><div style="flex:1 1 340px;min-width:260px">${tks}<button class="btn red" onclick="wtxClear()">Clear tour</button></div><div style="flex:1 1 300px;min-width:240px">${ed}</div></div>`}
function donePage(){const L=st().log.slice().reverse();if(!L.length)return`<div class=pan><h2>No shows yet<small>Shows you play on tour are listed here, with the crowd and what you earned.</small></h2></div>`;
 const tot=L.reduce((a,r)=>a+(+r.money||0),0);
 return`<div class=pan><h2>Shows played<small>${L.length} shows · ${fm(tot)} earned. A venue can book you again ${COOL} days after you play it.</small></h2><table><tr><th>Day</th><th>Where</th><th>Crowd</th><th>Earned</th><th>Fans</th></tr>${L.map(r=>{const d=wtDest(r.d),v=venueOf(d,r.kind);return`<tr><td>${r.day}</td><td>${E(wtPlace(d))}<br><span class=m2>${E(v?v.n:'')}</span></td><td>${fmt(r.att||0)}</td><td>${fm(r.money||0)}</td><td>+${fmt(r.fol||0)}</td></tr>`}).join('')}</table></div>`}
function lockPage(){const lv=fl();return`<div class=lock><div class=big>${pxIcon('lock')}</div><h2 style="font:18px Silkscreen,monospace;color:#ffcc4d">World Tour is locked</h2><p class=m2>${lv<NEED?'It opens in the App Barn at Fame Level '+NEED+'. You are Level '+lv+'.':'Buy it in the App Barn for '+fm(PRICE)+'.'}</p></div>`}
function page(){css();st();const b=!own()?lockPage():U.tab=='tour'?tourPage():U.tab=='done'?donePage():mapPage();return`<div class=wtx>${head()}${b}</div>`}
PA.wtour=()=>{try{return page()}catch(e){console.error('World Tour',e);return'<p>World Tour hit a snag. Close it and try again.</p>'}};
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{const m=document.querySelector('#pc .mn');if(m)m.classList.toggle('wtxmn',app=='wtour'&&!!m.querySelector('.wtx'));if(app=='wtour'&&$('wtxsvg')){hook();requestAnimationFrame(()=>{try{decorate()}catch(e){}})}}catch(e){console.error('World Tour',e)}return r}}
})();
