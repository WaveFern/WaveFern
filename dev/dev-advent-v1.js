/* WaveFern dev: ADVENT CALENDAR (Christmas event). Only loaded on /dev/ for now. Add ?noadvent to the address to skip it.

   24 doors, numbered 1 to 24 in a fixed random order like a real advent calendar. Door N opens from midnight (the player's own
   time) on N December. Behind each door is one free item: clothing, furniture, a pet, or (only once, door 24) a car. Never money,
   streams or monthly listeners. A missed door can still be opened later in December. Opening a door swings it open, shows the
   item small inside, then the item comes out big with a Claim button.

   LOCKED UNTIL 1 DECEMBER, in code, not just by being on /dev/:
   - On the real site (no window.FW_DEV) the button only exists from 1 December to 31 December, and nothing can be claimed
     outside those dates. So if this file is ever moved into the main game early, players still see nothing until 1 December.
   - On /dev/ the button is always there so testers can look at it, but every door stays locked until its real December day.
     The dev panel (DEV button, "Advent calendar") can set a TEST DATE that only this calendar reads (sessionStorage, this tab
     only). It does not move the game clock, so it cannot trigger the fresh-start reset.

   Saved in the career as S.adv = {y: year, c: {day: {t, k, n}}} (claimed doors and what each one gave). */
(function(){
 if(/[?&]noadvent/.test(location.search))return;
 const DEV=!!window.FW_DEV;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('advent '+t,e)}}};

 /* ---------- clock: real time, or on /dev/ only a calendar-only test date ---------- */
 const TK='fw_adv_clock';
 const now=()=>{if(DEV){try{const c=JSON.parse(sessionStorage.getItem(TK));if(c&&c.f)return c.f+(Date.now()-c.at)}catch(e){}}return Date.now()};
 const setTest=f=>{try{if(f)sessionStorage.setItem(TK,JSON.stringify({f,at:Date.now()}));else sessionStorage.removeItem(TK)}catch(e){}};
 const testOn=()=>{try{return DEV&&!!sessionStorage.getItem(TK)}catch(e){return false}};
 const yr=()=>new Date(now()).getFullYear();
 const opensAt=(d,y)=>new Date(y==null?yr():y,11,d,0,0,0).getTime();
 const season=()=>new Date(now()).getMonth()==11;/* 1 to 31 December */
 const ready=d=>season()&&now()>=opensAt(d);
 const today=()=>season()?Math.min(24,new Date(now()).getDate()):0;

 /* ---------- the 24 rewards (items only; exactly one car) ---------- */
 /* t: k = clothing (GAR name), f = furniture (F key), p = pet (PETS name), c = car (CARS name). alt = what to give instead if
    it is already owned. */
 const PLAN={
  1:{t:'k',n:'Pom Beanie',alt:['Beanie','Cosy Scarf']},
  2:{t:'f',n:'lavalamp'},
  3:{t:'k',n:'Cosy Scarf',alt:['Pom Beanie','Beanie']},
  4:{t:'f',n:'bonsai'},
  5:{t:'k',n:'Knit Sweater',alt:['Turtleneck','Cable Cardigan']},
  6:{t:'f',n:'rug_0'},
  7:{t:'k',n:'Fluffy Boots',alt:['Boots','Chelsea Boots']},
  8:{t:'f',n:'armchair_0'},
  9:{t:'f',n:'popcorn'},
  10:{t:'k',n:'Puffer Jacket',alt:['Parka','Quilted Jacket']},
  11:{t:'f',n:'fireplace'},
  12:{t:'p',n:'Husky',alt:['Good Boy Dog','Bunny']},
  13:{t:'k',n:'Cable Cardigan',alt:['Knit Sweater','Turtleneck']},
  14:{t:'f',n:'eggchair'},
  15:{t:'f',n:'clock'},
  16:{t:'k',n:'Sherpa Jacket',alt:['Parka','Long Coat']},
  17:{t:'f',n:'turntable'},
  18:{t:'p',n:'Red Panda',alt:['Foxy','Pixel Cat']},
  19:{t:'k',n:'Faux Fur Coat',alt:['Long Coat','Trench Coat']},
  20:{t:'f',n:'arcadecab'},
  21:{t:'f',n:'piano'},
  22:{t:'k',n:'Shearling Aviator',alt:['Leather Jacket','Puffer Jacket']},
  23:{t:'f',n:'jukebox'},
  24:{t:'c',n:'Phantom GT'}
 };
 /* the doors on the board, left to right, top to bottom (a real advent calendar's mixed-up order). BIG doors are larger. */
 const ORDER=[17,4,22,9,1,13,24,6,19,11,2,15,8,21,3,14,23,10,5,18,12,7,20,16];
 const BIG={24:'b22',12:'b21',6:'b12',18:'b21'};
 const MW={1:'m21',9:'m21'};/* on phones (4 columns) two more wide doors so the board stays a full rectangle */
 const STY=['red','grn','cane','navy','gold','plum'];
 const CAT={k:'Clothing',f:'Furniture',p:'Pet',c:'Car'};

 const Sv=()=>{const s=typeof S!='undefined'?S:null;return s&&typeof s=='object'&&s.day!==undefined?s:null};
 const st=()=>{const s=Sv();if(!s)return null;const y=yr();if(!s.adv||typeof s.adv!='object'||s.adv.y!==y)s.adv={y,c:{}};if(!s.adv.c||typeof s.adv.c!='object')s.adv.c={};return s.adv};
 const claimed=d=>{const a=st();return!!(a&&a.c[d])};

 const garFind=n=>typeof GAR!='undefined'?GAR.find(g=>g.n==n&&!g.fdr):null;
 const ownK=g=>(Sv().wr||[]).includes(g.id);
 /* what door d gives this player right now (handles things they already own) */
 function resolve(d){
  const p=PLAN[d],s=Sv();if(!p||!s)return null;
  if(p.t=='k'){
   let g=[p.n].concat(p.alt||[]).map(garFind).find(g=>g&&!ownK(g));
   if(!g){const g0=garFind(p.n);if(g0)g=GAR.find(x=>x.slot==g0.slot&&!x.fdr&&!ownK(x))}
   if(!g)return fur('fireplace');
   return{t:'k',k:'k:'+g.id,id:g.id,n:g.n,note:'In your wardrobe now. Wear it from the wardrobe in your bedroom.'}}
  if(p.t=='f')return fur(p.n);
  if(p.t=='p'){
   if(typeof PETS=='undefined')return fur('petbed');
   const pets=s.pets||[];
   if(pets.length<3){
    const names=[p.n].concat(p.alt||[]);
    let i=names.map(n=>PETS.findIndex(x=>x[0]==n)).find(i=>i>=0&&!pets.includes(i));
    if(i==null)i=PETS.findIndex((x,j)=>!pets.includes(j));
    if(i!=null&&i>=0)return{t:'p',k:'p:'+i,i,n:PETS[i][0],note:'Your new pet follows you around and adds +1 song quality.'}}
   const r=fur('petbed');r.note='You already have a full pet crew, so here is a '+r.n+' for them. It is in your Storage.';return r}
  if(p.t=='c'){
   if(typeof CARS=='undefined')return fur('jukebox');
   const cars=s.cars||[];let i=CARS.findIndex(c=>c.n==p.n);
   if(i<0||cars.includes(i)){let best=-1;CARS.forEach((c,j)=>{if(!cars.includes(j)&&(best<0||c.p>CARS[best].p))best=j});i=best}
   if(i<0){const r=fur('arcadecab');r.note='You already own every car, so here is a '+r.n+' instead. It is in your Storage.';return r}
   return{t:'c',k:'c:'+i,i,n:CARS[i].n,note:'Parked in your garage east of the house. Walk to it and press E.'+(s.garage?'':' Your garage is unlocked too, so you can drive it.')}}
  return null}
 function fur(key){const f=typeof F!='undefined'&&F[key]?F[key]:null;if(!f)return{t:'f',k:'',key,n:key,note:''};return{t:'f',k:'f:'+key,key,n:f.n,note:'Delivered to your Storage. Press F at home to place it.'}}

 function give(d){
  const s=Sv(),a=st();if(!s||!a||a.c[d]||!ready(d))return null;
  const r=resolve(d);if(!r)return null;
  if(r.t=='k'){s.wr=s.wr||[];if(!s.wr.includes(r.id))s.wr.push(r.id);s.wc=s.wc||{};const g=GAR.find(x=>x.id==r.id);let c=null;safe(()=>{c=THC[r.id]},'thc');if(!s.wc[r.id])s.wc[r.id]=c||g.dc}
  if(r.t=='f'){s.inv=s.inv||{};s.inv[r.key]=(s.inv[r.key]||0)+1}
  if(r.t=='p'){s.pets=s.pets||[];if(!s.pets.includes(r.i))s.pets.push(r.i);safe(()=>syncF(),'pet')}
  if(r.t=='c'){s.cars=s.cars||[];if(!s.cars.includes(r.i))s.cars.push(r.i);if(!s.garage)s.garage=1;safe(()=>parkCars(),'car')}
  a.c[d]={t:r.t,k:r.k,n:r.n};
  safe(()=>updateVersion(),'ver');safe(()=>autoSave(),'save');safe(()=>{if(typeof csPush=='function')csPush(1)},'cloud');
  return r}

 /* ---------- item pictures: the game's own 3D preview models (11-os-v2.js pvModel) ---------- */
 const PIC={};
 function draw(k,ang,cv){return safe(()=>{if(!k)return null;if(!PVR)pvInit();const m=pvModel(k);PVS.add(m);m.rotation.y=ang;PVR.render(PVS,PVC);PVS.remove(m);
  if(cv){const x=cv.getContext('2d');x.clearRect(0,0,cv.width,cv.height);x.drawImage(PVR.domElement,0,0,cv.width,cv.height)}return PVR.domElement},'draw')}
 function pic(k){if(!k)return'';if(PIC[k])return PIC[k];const c=draw(k,.7);if(!c)return'';try{return PIC[k]=c.toDataURL()}catch(e){return''}}

 /* ---------- sounds ---------- */
 const jingle=()=>safe(()=>{const N=[659,659,659,0,659,659,659,0,659,784,523,587,659];let t=0;
  N.forEach(f=>{if(f)sdHit(f,.7,.07,TINE,{del:t,jit:0,rev:.3});t+=.13});sdHit(1318,1.2,.03,TINE,{del:t,jit:0,rev:.4})},'jingle')||safe(()=>snd('chime'),'chime');
 const creak=()=>safe(()=>{sdNz(.25,700,.08,{q:6,f2:380,sw:.25});sdHit(220,.12,.12,WOOD,{bend:.2})},'creak')||safe(()=>snd('pop'),'pop');
 const sfx=n=>safe(()=>snd(n),'snd');

 /* ---------- styles ---------- */
 const css=document.createElement('style');
 css.textContent=`
#advb{position:fixed;right:10px;top:96px;z-index:60;display:none;align-items:center;gap:8px;padding:7px 12px 7px 9px;background:linear-gradient(#c8283a,#8e1424);color:#fff6e0;border:3px solid #000;box-shadow:inset 0 0 0 2px #f2c14e,4px 4px 0 #0008;font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;cursor:pointer;animation:advbob 3s ease-in-out infinite}
#advb:hover{filter:brightness(1.12)}#advb.on{display:flex}
#advb .gi{width:18px;height:16px;position:relative;background:#1f8a4c;box-shadow:inset 0 0 0 2px #0a3f22}
#advb .gi:before{content:'';position:absolute;left:7px;top:0;width:4px;height:16px;background:#f2c14e}
#advb .gi:after{content:'';position:absolute;left:3px;top:-6px;width:12px;height:6px;background:radial-gradient(circle at 25% 60%,#f2c14e 0 3px,transparent 3.5px),radial-gradient(circle at 75% 60%,#f2c14e 0 3px,transparent 3.5px)}
#advb .bd{min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:#f2c14e;color:#5a0a14;font:700 11px/18px ui-monospace,monospace;text-align:center;animation:advpulse 1.4s ease-in-out infinite}
#advb .bd:empty{display:none}
@keyframes advbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes advpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}

#advw{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 0%,#1c3a63 0%,#0b1630 55%,#050a18 100%);overflow:hidden;font:14px ui-monospace,Menlo,Consolas,monospace;color:#fff6e0;animation:advfade .35s ease-out}
@keyframes advfade{from{opacity:0}to{opacity:1}}
#advw .sn{position:absolute;top:-12px;border-radius:50%;background:#fff;pointer-events:none;animation:advfall linear infinite;opacity:.85}
@keyframes advfall{0%{transform:translate(0,-10px)}25%{transform:translate(14px,25vh)}50%{transform:translate(-8px,50vh)}75%{transform:translate(12px,75vh)}100%{transform:translate(0,104vh)}}
#advw .hill{position:absolute;left:-5%;right:-5%;bottom:-60px;height:140px;background:#e9f1f8;border-radius:50% 50% 0 0;box-shadow:0 -6px 0 #cfdde9;pointer-events:none}
#advw .advf{position:relative;width:min(960px,96vw);height:min(780px,94vh);display:flex;flex-direction:column;box-sizing:border-box;padding:26px 22px 16px;background:
 repeating-linear-gradient(90deg,#00000014 0 2px,transparent 2px 46px),linear-gradient(#6b2a17,#4a1a0d);border:4px solid #000;box-shadow:inset 0 0 0 4px #f2c14e,inset 0 0 0 7px #3a1208,8px 8px 0 #0009;animation:advpop .45s cubic-bezier(.2,1.4,.4,1)}
@keyframes advpop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
#advw .lights{position:absolute;left:10px;right:10px;top:-11px;height:22px;display:flex;justify-content:space-between;pointer-events:none}
#advw .lights:before{content:'';position:absolute;left:0;right:0;top:6px;height:2px;background:#1b2a1f}
#advw .lights i{position:relative;width:10px;height:14px;margin-top:6px;border-radius:40% 40% 50% 50%;background:var(--c);box-shadow:0 0 10px 2px var(--c);animation:advtw 1.6s ease-in-out infinite;animation-delay:var(--d)}
#advw .lights i:before{content:'';position:absolute;left:2px;top:-4px;width:6px;height:4px;background:#2c3a30}
@keyframes advtw{0%,100%{opacity:1}50%{opacity:.35;box-shadow:none}}
#advw .hd{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
#advw .hd h2{margin:0;font:700 clamp(18px,3.4vw,30px) Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#f2c14e;text-shadow:3px 3px 0 #8e1424,5px 5px 0 #0008}
#advw .hd p{margin:4px 0 0;color:#f3dcc0;font-size:13px;line-height:1.4}
#advw .hd .st{display:inline-block;margin-top:6px;padding:3px 8px;background:#0006;border:2px solid #f2c14e55;color:#fff6e0;font:700 11px Silkscreen,ui-monospace,monospace;letter-spacing:1px}
#advw .hd .st.t{border-color:#6fd3ff;color:#bfeaff}
#advw .x{margin-left:auto;flex:none;width:40px;height:40px;padding:0;background:#8e1424;color:#fff6e0;border:3px solid #000;box-shadow:inset 0 0 0 2px #f2c14e;font:700 16px Silkscreen,ui-monospace,monospace;cursor:pointer}
#advw .x:hover{background:#b01d30}
#advw .gw{flex:1;min-height:0;overflow:auto;padding:6px;margin:0 -6px;scrollbar-width:thin}
#advw .grid{display:grid;height:100%;min-height:400px;box-sizing:border-box;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(5,1fr);grid-auto-flow:row dense;gap:10px}
#advw .ft{margin-top:10px;color:#e0c7a5;font-size:12px;text-align:center}

/* a door */
.advd{position:relative;padding:0;border:0;background:none;cursor:pointer;perspective:700px;font:inherit;color:inherit;min-width:0}
.advd.b22{grid-column:span 2;grid-row:span 2}.advd.b21{grid-column:span 2}.advd.b12{grid-row:span 2}
.advd .in{position:absolute;inset:0;background:radial-gradient(circle at 50% 55%,#ffe7a3 0%,#d99a3a 30%,#3a1a0c 75%);box-shadow:inset 0 0 0 3px #000,inset 0 0 18px #000c;display:flex;align-items:center;justify-content:center;overflow:hidden}
.advd .in img{width:62%;max-width:120px;aspect-ratio:1;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 4px 0 #0007);animation:advbob 2.2s ease-in-out infinite}
.advd .lf{position:absolute;inset:0;transform-origin:0 50%;transform-style:preserve-3d;transition:transform .95s cubic-bezier(.35,.0,.25,1)}
.advd .fr,.advd .bk{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:3px solid #000;box-sizing:border-box}
.advd .bk{transform:rotateY(180deg);background:repeating-linear-gradient(0deg,#00000022 0 2px,transparent 2px 10px),#7a4a2a}
.advd .fr{display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg);box-shadow:inset 0 0 0 3px var(--rim),inset -6px -6px 0 #0003;transition:filter .2s}
.advd .fr:before{content:'';position:absolute;left:-2px;right:-2px;top:-2px;height:12px;background:radial-gradient(circle at 10% 0,#fff 0 9px,transparent 9.5px) 0 0/22px 12px repeat-x,linear-gradient(#fff 0 4px,transparent 4px);opacity:.95}
.advd .fr:after{content:'';position:absolute;right:8px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#f2c14e;box-shadow:0 0 0 2px #000}
.advd .n{position:relative;font:700 clamp(20px,3.6vw,38px) Silkscreen,ui-monospace,monospace;color:var(--nc);text-shadow:3px 3px 0 #0007;letter-spacing:1px}
.advd.b22 .n{font-size:clamp(34px,6vw,66px)}
.advd .lk{position:absolute;left:7px;bottom:6px;width:11px;height:9px;background:#d8d8d8;border:2px solid #000;opacity:.85}
.advd .lk:before{content:'';position:absolute;left:1px;top:-8px;width:5px;height:6px;border:2px solid #000;border-bottom:0;border-radius:5px 5px 0 0;background:transparent;box-shadow:inset 0 0 0 1px #d8d8d8}
.advd .tg{position:absolute;right:-4px;top:8px;padding:2px 6px;background:#f2c14e;color:#5a0a14;font:700 9px Silkscreen,ui-monospace,monospace;letter-spacing:1px;border:2px solid #000;transform:rotate(6deg);z-index:2}
.advd .ck{position:absolute;right:5px;top:5px;width:20px;height:20px;border-radius:50%;background:#1f8a4c;color:#eaffef;border:2px solid #000;font:700 12px/20px ui-monospace,monospace;text-align:center;z-index:3}
.advd .dn{position:absolute;left:16px;top:4px;font:700 12px Silkscreen,ui-monospace,monospace;color:#ffe7a3;text-shadow:1px 1px 0 #000}
.advd .nm{position:absolute;left:14px;right:4px;bottom:4px;font:700 10px ui-monospace,monospace;color:#fff6e0;text-shadow:1px 1px 0 #000;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.advd.red{--bg:linear-gradient(135deg,#d43a3a,#9c1c26);--rim:#f2c14e;--nc:#fff6e0}
.advd.grn{--bg:radial-gradient(circle at 30% 30%,#ffffff22 0 3px,transparent 4px) 0 0/18px 18px,linear-gradient(135deg,#2d9a58,#16613a);--rim:#e9f1f8;--nc:#fff6e0}
.advd.cane{--bg:repeating-linear-gradient(45deg,#f7efe2 0 10px,#d43a3a 10px 20px);--rim:#9c1c26;--nc:#9c1c26}
.advd.cane .n{background:#f7efe2;padding:2px 8px;border:3px solid #9c1c26;text-shadow:none}
.advd.navy{--bg:radial-gradient(circle,#fff 0 1.5px,transparent 2px) 0 0/22px 22px,radial-gradient(circle,#fff8 0 1px,transparent 1.5px) 11px 11px/22px 22px,linear-gradient(#1d3b78,#0f2148);--rim:#bfeaff;--nc:#ffe9a3}
.advd.gold{--bg:linear-gradient(135deg,#f6d36b,#c9902a);--rim:#8e1424;--nc:#8e1424}
.advd.gold .n{text-shadow:2px 2px 0 #fff6}
.advd.plum{--bg:linear-gradient(90deg,transparent 45%,#f2c14e 45% 55%,transparent 55%),linear-gradient(transparent 45%,#f2c14e 45% 55%,transparent 55%),linear-gradient(135deg,#7b2f6a,#4a1440);--rim:#f2c14e;--nc:#fff6e0}
.advd.d24 .fr{background:radial-gradient(circle at 50% 50%,#ffffff1c 0 30%,transparent 31%),linear-gradient(90deg,transparent 46%,#d43a3a 46% 54%,transparent 54%),linear-gradient(transparent 46%,#d43a3a 46% 54%,transparent 54%),linear-gradient(135deg,#2d9a58,#145a33);box-shadow:inset 0 0 0 4px #f2c14e,inset -8px -8px 0 #0003}
.advd.d24 .n{color:#ffe9a3;background:#145a33;padding:4px 14px;border:4px solid #f2c14e}
.advd.d24 .eve{position:absolute;left:0;right:0;bottom:12%;text-align:center;font:700 clamp(9px,1.2vw,13px) Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#fff6e0;text-shadow:2px 2px 0 #000}
.advd.d24 .bow{position:absolute;left:50%;top:14%;width:44px;height:22px;margin-left:-22px;background:radial-gradient(ellipse at 25% 50%,#e04848 0 10px,transparent 11px),radial-gradient(ellipse at 75% 50%,#e04848 0 10px,transparent 11px),radial-gradient(circle,#9c1c26 0 6px,transparent 7px)}
.advd.lock .fr{filter:saturate(.55) brightness(.78)}
.advd.lock{cursor:not-allowed}
.advd.rdy .fr{animation:advglow 1.6s ease-in-out infinite}
@keyframes advglow{0%,100%{box-shadow:inset 0 0 0 3px var(--rim),0 0 0 0 #ffd76a00}50%{box-shadow:inset 0 0 0 3px var(--rim),0 0 18px 5px #ffd76acc}}
.advd.rdy:hover .lf{transform:rotateY(-14deg)}
.advd.open .lf{transform:rotateY(-112deg)}
/* once opened, the door is folded flat against the hinge (a wood strip on the left) so it never covers its neighbour */
.advd.done .lf,.advd.peek .lf{display:none}
.advd.done .in,.advd.peek .in{box-shadow:inset 0 0 0 3px #000,inset 9px 0 0 #7a4a2a,inset 12px 0 0 #000,inset 0 0 18px #000c}
.advd.peek .in{animation:advglow2 1.6s ease-in-out infinite}
@keyframes advglow2{50%{filter:brightness(1.25)}}
.advd.open .tg,.advd.peek .tg{display:none}
.advd.shake{animation:advshake .4s}
@keyframes advshake{20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.advd:focus-visible{outline:3px solid #6fd3ff;outline-offset:2px}
#advw .tip{position:absolute;z-index:5;padding:6px 10px;background:#000;color:#fff6e0;border:2px solid #f2c14e;font:700 11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none;white-space:nowrap;transform:translate(-50%,-100%);animation:advfade .15s}

/* the reveal */
#advr{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:#050a18cc;animation:advfade .3s}
#advr .card{position:relative;width:min(420px,92vw);padding:22px 20px 18px;box-sizing:border-box;text-align:center;background:linear-gradient(#a3202f,#6e0f1c);border:4px solid #000;box-shadow:inset 0 0 0 3px #f2c14e,8px 8px 0 #0009;animation:advpop .5s cubic-bezier(.2,1.5,.4,1)}
#advr .rays{position:absolute;left:50%;top:116px;width:420px;height:420px;margin:-210px 0 0 -210px;background:repeating-conic-gradient(#ffe7a344 0 10deg,transparent 10deg 24deg);border-radius:50%;-webkit-mask:radial-gradient(circle,#000 25%,transparent 68%);mask:radial-gradient(circle,#000 25%,transparent 68%);animation:advspin 9s linear infinite;pointer-events:none}
@keyframes advspin{to{transform:rotate(360deg)}}
#advr .day{font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#f2c14e}
#advr .big{position:relative;display:block;width:200px;height:200px;margin:4px auto 6px;image-rendering:pixelated;filter:drop-shadow(0 8px 0 #0006)}
#advr h3{position:relative;margin:0 0 4px;font:700 22px Silkscreen,ui-monospace,monospace;color:#fff6e0;text-shadow:2px 2px 0 #000}
#advr .cat{display:inline-block;margin-bottom:8px;padding:2px 8px;background:#f2c14e;color:#5a0a14;font:700 10px Silkscreen,ui-monospace,monospace;letter-spacing:1px}
#advr p{position:relative;margin:0 0 14px;color:#f3dcc0;font-size:13px;line-height:1.45;min-height:19px}
#advr .cl{position:relative;padding:12px 30px;background:linear-gradient(#36c06e,#1f8a4c);color:#fff;border:3px solid #000;box-shadow:inset 0 -4px 0 #0005,inset 0 0 0 2px #b6ffd0;font:700 16px Silkscreen,ui-monospace,monospace;letter-spacing:2px;cursor:pointer;animation:advpulse 1.4s ease-in-out infinite}
#advr .cl:hover{filter:brightness(1.1)}
#advr .cl:disabled{animation:none;filter:none;opacity:.9;cursor:default}
#advr .later{display:block;margin:10px auto 0;padding:4px 10px;background:none;border:0;color:#f3dcc0aa;font:12px ui-monospace,monospace;cursor:pointer;text-decoration:underline}
.advfly{position:fixed;z-index:95;pointer-events:none;image-rendering:pixelated;will-change:transform}
.advcf{position:fixed;z-index:96;width:8px;height:12px;pointer-events:none;will-change:transform,opacity}

@media (max-width:640px){
 #advw .advf{padding:22px 10px 10px;max-height:96vh}
 #advw .advf{height:96vh}
 #advw .grid{grid-template-columns:repeat(4,1fr);grid-template-rows:none;grid-auto-rows:minmax(74px,1fr);height:auto;gap:7px}
 .advd.b22{grid-column:span 2;grid-row:span 2}.advd.b21{grid-column:span 2;grid-row:span 1}.advd.b12{grid-column:span 1;grid-row:span 2}
 .advd.m21{grid-column:span 2}
 #advw .hd p{font-size:12px}
 #advr .big{width:160px;height:160px}
}
@media (prefers-reduced-motion:reduce){#advw *,#advb,#advr *{animation-duration:.01s!important;animation-iteration-count:1!important}.advd .lf{transition-duration:.2s}}
`;
 document.head.appendChild(css);

 /* ---------- HUD button ---------- */
 const btn=document.createElement('button');btn.id='advb';btn.type='button';btn.setAttribute('aria-label','Advent calendar');
 btn.innerHTML='<span class=gi></span><span>ADVENT</span><span class=bd></span>';
 btn.onclick=()=>{sfx('click');open()};
 document.body.appendChild(btn);
 const visible=()=>DEV||season();
 function hudTick(){safe(()=>{
  const m=typeof mode!='undefined'?mode:'',on=!!Sv()&&m=='play'&&visible()&&!document.getElementById('advw')&&!(typeof PAUSED!='undefined'&&PAUSED);
  btn.classList.toggle('on',on);if(!on)return;
  const tr=document.querySelector('#hud .hb.tr');if(tr){const r=tr.getBoundingClientRect();if(r.height)btn.style.top=Math.round(r.bottom+8)+'px'}
  let n=0;for(let d=1;d<=24;d++)if(ready(d)&&!claimed(d))n++;
  const bd=btn.querySelector('.bd'),t=n?String(n):'';if(bd.textContent!==t)bd.textContent=t},'hud')}
 setInterval(hudTick,400);

 /* ---------- the calendar ---------- */
 let W=null,REV=null,spin=0;const PEEK={};/* doors swung open but not claimed yet (this visit only) */
 const fmtD=d=>d+' December';
 function status(){
  const y=yr(),t=now(),a=st()||{c:{}},got=Object.keys(a.c).length;
  if(!season()){
   if(new Date(t).getMonth()<11){const ms=opensAt(1,y)-t,days=Math.ceil(ms/864e5);
    return{cls:'',txt:days>1?'Opens in '+days+' days':ms>36e5?'Opens tomorrow':'Opens at midnight'}}
   return{cls:'',txt:'See you next December'}}
  const td=today(),left=[];for(let d=1;d<=24;d++)if(ready(d)&&!a.c[d])left.push(d);
  if(td>=24&&!left.length)return{cls:'',txt:'All '+got+' doors opened. Merry Christmas!'};
  return{cls:'',txt:left.length?(left.length==1?'1 door ready to open':left.length+' doors ready to open')+' · '+got+'/24 claimed':'Come back tomorrow for door '+(td+1)+' · '+got+'/24 claimed'}}
 function doorHTML(d,i){
  const a=st(),c=a&&a.c[d],r=ready(d),cls=['advd',STY[(i*5+d)%6],BIG[d]||'',MW[d]||''];
  const pk=!c&&r&&PEEK[d];if(d==24)cls.push('d24');
  if(c)cls.push('done');else if(pk)cls.push('peek');else if(r)cls.push('rdy');else cls.push('lock');
  const td=today()==d&&!c;
  const inner=c?`<img alt="" src="${pic(c.k)}"><span class=nm>${esc2(c.n)}</span>`:pk?`<img alt="" src="${pic(PEEK[d].k)}">`:'';
  return`<button type=button class="${cls.join(' ')}" data-d="${d}" aria-label="Door ${d}${c?', claimed: '+esc2(c.n):r?', ready to open':', opens on '+fmtD(d)}">
   <span class=in>${inner}</span>
   <span class=lf><span class=fr>${d==24?'<i class=bow></i>':''}<span class=n>${d}</span>${d==24?'<span class=eve>CHRISTMAS EVE</span>':''}${!r&&!c?'<i class=lk></i>':''}</span><span class=bk></span></span>
   ${td&&r?'<span class=tg>TODAY</span>':''}${c?'<span class=ck>&#10003;</span>':''}${c||pk?`<span class=dn>${d}</span>`:''}</button>`}
 const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function snow(n){let h='';for(let i=0;i<n;i++){const s=2+Math.random()*4;h+=`<i class=sn style="left:${(Math.random()*100).toFixed(1)}%;width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;opacity:${(.4+Math.random()*.55).toFixed(2)};animation-duration:${(7+Math.random()*9).toFixed(1)}s;animation-delay:-${(Math.random()*16).toFixed(1)}s"></i>`}return h}
 function lights(n){const C=['#ff4b4b','#ffd23f','#3fa9ff','#46e083'];let h='';for(let i=0;i<n;i++)h+=`<i style="--c:${C[i%4]};--d:-${(Math.random()*1.6).toFixed(2)}s"></i>`;return h}
 function render(){if(!W)return;const s=status();
  W.querySelector('.st').textContent=s.txt;W.querySelector('.st').className='st'+(testOn()?' t':'');
  const tt=W.querySelector('.tt');if(tt)tt.textContent=testOn()?'TEST DATE '+new Date(now()).toDateString():'';
  W.querySelector('.grid').innerHTML=ORDER.map(doorHTML).join('')}
 function open(){
  if(!Sv())return;if(!visible())return;
  if(typeof mode!='undefined'&&mode!='play'&&mode!='menu')return;
  safe(()=>{$('ui').innerHTML=''},'ui');mode='menu';
  W=document.createElement('div');W.id='advw';W.setAttribute('role','dialog');W.setAttribute('aria-label','Advent calendar');
  W.innerHTML=`${snow(window.innerWidth<640?34:70)}<div class=hill></div>
  <div class=advf><div class=lights>${lights(window.innerWidth<640?14:26)}</div>
   <div class=hd><div><h2>ADVENT CALENDAR</h2><p>A free gift behind every door, from 1 to 24 December. A new door opens every morning.</p><span class=st></span> <span class=tt style="color:#bfeaff;font-size:11px"></span></div><button type=button class=x aria-label=Close>X</button></div>
   <div class=gw><div class=grid></div></div>
   <div class=ft>Clothes, furniture, pets and one very special car. Missed a day? You can still open it any time in December.</div>
  </div>`;
  document.body.appendChild(W);
  W.querySelector('.x').onclick=()=>{sfx('click');close()};
  W.querySelector('.grid').addEventListener('click',e=>{const b=e.target.closest('.advd');if(b)tap(b,+b.dataset.d)});
  render()}
 function close(){if(REV)return endReveal(1);if(W){W.remove();W=null}cancelAnimationFrame(spin);spin=0;if(typeof mode!='undefined'&&mode=='menu')mode='play'}
 function tip(b,t){if(!W)return;W.querySelectorAll('.tip').forEach(x=>x.remove());const r=b.getBoundingClientRect(),e=document.createElement('div');e.className='tip';e.textContent=t;
  e.style.left=(r.left+r.width/2)+'px';e.style.top=(r.top-6)+'px';e.style.position='fixed';W.appendChild(e);setTimeout(()=>e.remove(),1600)}
 function tap(b,d){
  if(REV||b.dataset.busy)return;
  if(claimed(d)){const c=st().c[d];tip(b,'Day '+d+': '+c.n);sfx('click');return}
  if(!ready(d)){sfx('err');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');tip(b,season()||new Date(now()).getMonth()<11?'Opens on '+fmtD(d):'This year’s calendar is over');return}
  const r=resolve(d);if(!r)return;
  if(PEEK[d]){sfx('pop');return reveal(b,d,r)}
  /* swing the door open, show the item small inside, then bring it out big */
  b.dataset.busy=1;b.querySelector('.in').innerHTML=`<img alt="" src="${pic(r.k)}">`;
  PEEK[d]=r;b.classList.remove('rdy');creak();
  requestAnimationFrame(()=>b.classList.add('open'));
  setTimeout(()=>{delete b.dataset.busy;reveal(b,d,r)},1250)}

 function reveal(b,d,r){
  if(!W)return;
  const img=b.querySelector('.in img'),from=img?img.getBoundingClientRect():b.getBoundingClientRect();
  REV={b,d,r};
  const o=document.createElement('div');o.id='advr';
  o.innerHTML=`<div class=card><div class=rays></div><div class=day>DOOR ${d} · ${fmtD(d).toUpperCase()}</div><canvas class=big width=128 height=128 style="visibility:hidden"></canvas>
   <h3>${esc2(r.n)}</h3><span class=cat>${CAT[r.t]}</span><p>${esc2(r.note)}</p><button type=button class=cl>CLAIM</button><button type=button class=later>Not now</button></div>`;
  W.appendChild(o);REV.o=o;
  const big=o.querySelector('.big');
  /* the small picture flies out of the door and grows into the big one */
  const fly=document.createElement('img');fly.className='advfly';fly.src=pic(r.k);
  Object.assign(fly.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});document.body.appendChild(fly);
  if(img)img.style.visibility='hidden';
  requestAnimationFrame(()=>{const to=big.getBoundingClientRect(),sx=to.width/from.width,sy=to.height/from.height,dx=to.left-from.left,dy=to.top-from.top;
   const an=fly.animate([{transform:'translate(0,0) scale(1) rotate(0)'},{transform:`translate(${dx*.5}px,${dy*.5-60}px) scale(${sx*.6},${sy*.6}) rotate(-8deg)`,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy}) rotate(0)`}],{duration:750,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
   an.onfinish=()=>{fly.remove();big.style.visibility='';let a=.7;const loop=()=>{if(!REV)return;a+=.025;draw(r.k,a,big);spin=requestAnimationFrame(loop)};loop();sparkle(big,18)}});
  sfx('whoosh');setTimeout(()=>jingle(),380);
  o.querySelector('.cl').onclick=e=>claim(e.currentTarget);
  o.querySelector('.later').onclick=()=>{sfx('click');endReveal(1)}}

 function claim(cb){
  if(!REV||REV.done)return;const {d,b}=REV;
  const r=give(d);
  if(!r){sfx('err');cb.textContent='TRY AGAIN';return}
  REV.done=1;cb.disabled=true;cb.textContent='CLAIMED!';sfx('cash');setTimeout(()=>sfx('chime'),120);
  confetti(cb);
  setTimeout(()=>endReveal(0),1300)}

 /* close the reveal: the item shrinks back into its door */
 function endReveal(backOut){
  if(!REV)return;const {b,d,o,r}=REV,done=REV.done;REV=null;cancelAnimationFrame(spin);spin=0;
  const big=o.querySelector('.big'),from=big.getBoundingClientRect();
  o.style.transition='opacity .3s';o.style.opacity='0';setTimeout(()=>o.remove(),320);
  if(!W)return;
  render();
  const nb=W.querySelector(`.advd[data-d="${d}"]`);if(!nb)return;
  if(!done)return;/* not claimed: render() left it open with the item inside, tap it again to claim */
  delete PEEK[d];
  const ti=nb.querySelector('.in img');if(!ti||!from.width)return;
  const to=ti.getBoundingClientRect(),fly=document.createElement('img');fly.className='advfly';fly.src=pic(r.k);
  Object.assign(fly.style,{left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'});document.body.appendChild(fly);ti.style.visibility='hidden';
  const sx=from.width/to.width,sy=from.height/to.height,dx=from.left-to.left,dy=from.top-to.top;
  fly.animate([{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`},{transform:'translate(0,0) scale(1)'}],{duration:520,easing:'cubic-bezier(.5,0,.3,1)'}).onfinish=()=>{fly.remove();ti.style.visibility=''}}

 function sparkle(el,n){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  for(let i=0;i<n;i++){const s=document.createElement('i');s.className='advcf';const a=Math.random()*Math.PI*2,dist=70+Math.random()*90,sz=4+Math.random()*6;
   Object.assign(s.style,{left:cx+'px',top:cy+'px',width:sz+'px',height:sz+'px',background:Math.random()<.5?'#fff6c8':'#f2c14e',transform:'rotate(45deg)'});document.body.appendChild(s);
   s.animate([{transform:'translate(0,0) rotate(45deg) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist}px) rotate(225deg) scale(.2)`,opacity:0}],{duration:700+Math.random()*500,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>s.remove()}}
 function confetti(el){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top;const C=['#ff4b4b','#f2c14e','#46e083','#fff','#3fa9ff'];
  for(let i=0;i<60;i++){const s=document.createElement('i');s.className='advcf';const a=-Math.PI/2+(Math.random()-.5)*2.2,v=160+Math.random()*240;
   Object.assign(s.style,{left:cx+'px',top:cy+'px',background:C[i%C.length],borderRadius:i%3?'0':'50%'});document.body.appendChild(s);
   const dx=Math.cos(a)*v,dy=Math.sin(a)*v;
   s.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${360*Math.random()}deg)`,opacity:1,offset:.5},{transform:`translate(${dx*1.3}px,${dy+260}px) rotate(${720*Math.random()}deg)`,opacity:0}],{duration:1300+Math.random()*700,easing:'cubic-bezier(.15,.6,.4,1)'}).onfinish=()=>s.remove()}}

 /* Esc closes (the reveal first), and keeps the game's own Esc (pause) from firing underneath */
 addEventListener('keydown',e=>{if(!W)return;if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}
  else if((e.key=='Enter'||e.key==' ')&&REV&&!REV.done&&document.activeElement&&!document.activeElement.closest('#advr')){e.preventDefault();e.stopImmediatePropagation();claim(REV.o.querySelector('.cl'))}},true);
 /* anything else that clears the UI (pause, a modal, closeUI) also closes the calendar */
 setInterval(()=>{if(W&&typeof mode!='undefined'&&mode!='menu'){REV=null;cancelAnimationFrame(spin);W.remove();W=null}},300);

 window.FW_ADVENT={open,close,now,ready,resolve,PLAN,ORDER,setTest,claimed};

 /* ---------- dev panel: calendar-only test dates ---------- */
 if(DEV)safe(()=>{
  const box=document.getElementById('fwdvb');if(!box)return;
  const msg=t=>{const e=document.getElementById('fwdvs');if(e)e.textContent=t};
  const h=document.createElement('h5');h.textContent='Advent calendar (test date is for the calendar only)';box.appendChild(h);
  const y=new Date().getFullYear(),at=(m,d,hh)=>new Date(y,m,d,hh||9,0,0).getTime();
  const B=[['Open the calendar',()=>{if(!Sv())return msg('Start or load a career first.');if(W)close();open()}],
   ['Test date: 30 Nov (all locked)',()=>{setTest(at(10,30));msg('Advent test date 30 Nov');if(W)render()}],
   ['Test date: 1 Dec',()=>{setTest(at(11,1));msg('Advent test date 1 Dec');if(W)render()}],
   ['Test date: 12 Dec',()=>{setTest(at(11,12));msg('Advent test date 12 Dec');if(W)render()}],
   ['Test date: 24 Dec (every door)',()=>{setTest(at(11,24));msg('Advent test date 24 Dec');if(W)render()}],
   ['Test date: 1 Jan (over)',()=>{setTest(new Date(y+1,0,1,9).getTime());msg('Advent test date 1 Jan');if(W)render()}],
   ['Use the real date',()=>{setTest(null);msg('Advent uses the real date');if(W)render()}],
   ['Close all advent doors on this save',()=>{const s=Sv();if(!s)return msg('Start or load a career first.');s.adv={y:yr(),c:{}};safe(()=>autoSave(),'save');msg('Advent doors closed (items you got are kept)');if(W)render()}]];
  B.forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;box.appendChild(b)})},'panel');
})();
