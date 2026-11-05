/* WaveFern dev: ADVENT CALENDAR (Christmas event). Only loaded on /dev/ for now. Add ?noadvent to the address to skip it.

   24 doors, numbered 1 to 24 in a fixed random order like a real advent calendar. Door N opens from midnight (the player's own
   time) on N December. Behind each door is one free, brand-new Christmas item (made in dev-xmas-items-v1.js): clothing, furniture, a pet, or (only once, door 24) Santa's Sleigh. Never money,
   streams or monthly listeners. A missed door can still be opened later in December. Opening a door swings it open, shows the
   item small inside, then the item comes out big with a Claim button.

   LOCKED UNTIL 1 DECEMBER, in code, not just by being on /dev/:
   - On the real site (no window.FW_DEV) the button only exists from 1 December to 31 December, and nothing can be claimed
     outside those dates. So if this file is ever moved into the main game early, players still see nothing until 1 December.
   - On /dev/ the calendar is NOT locked: every door can be opened and claimed straight away, for testing.
     The dev panel (DEV button, "Advent calendar") can set a TEST DATE to see the real one-door-a-day behaviour; only this
     calendar reads it (sessionStorage, this tab only). It does not move the game clock, so it cannot trigger the fresh-start reset.

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
 /* on /dev/ every door is open for testing, unless a test date is set (then it behaves like the real game on that date) */
 const devOpen=()=>DEV&&!testOn();
 const ready=d=>devOpen()||(season()&&now()>=opensAt(d));
 const today=()=>season()?Math.min(24,new Date(now()).getDate()):0;

 /* ---------- the 24 rewards (items only; exactly one car) ---------- */
 /* t: k = clothing (GAR name), f = furniture (F key), p = pet (PETS name), c = car (CARS name). All of them are made in dev-xmas-items-v1.js. */
 const PLAN={
  1:{t:'k',n:'Santa Hat'},2:{t:'f',n:'xm_tree'},3:{t:'k',n:'Candy Cane Scarf'},4:{t:'f',n:'xm_snowman'},5:{t:'k',n:'Ugly Christmas Sweater'},6:{t:'f',n:'xm_rug'},
  7:{t:'k',n:'Elf Boots'},8:{t:'f',n:'xm_chair'},9:{t:'f',n:'xm_cocoa'},10:{t:'k',n:'Santa Coat'},11:{t:'f',n:'xm_mantel'},12:{t:'p',n:'Rudy the Reindeer'},
  13:{t:'k',n:'Gingerbread Hoodie'},14:{t:'f',n:'xm_globe'},15:{t:'f',n:'xm_presents'},16:{t:'k',n:'Elf Jacket'},17:{t:'f',n:'xm_ginger'},18:{t:'p',n:'Snowy the Polar Cub'},
  19:{t:'k',n:'Reindeer Antlers'},20:{t:'f',n:'xm_reindeer'},21:{t:'f',n:'xm_cane'},22:{t:'k',n:'Elf Tights'},23:{t:'f',n:'xm_nutcracker'},24:{t:'c',n:"Santa's Sleigh"}
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

 const garFind=n=>typeof GAR!='undefined'?GAR.find(g=>g.n==n&&g.xm):null;
 /* what door d gives this player right now */
 function resolve(d){
  const p=PLAN[d],s=Sv();if(!p||!s)return null;
  if(p.t=='k'){const g=garFind(p.n);if(!g)return fur('xm_presents');const own=(s.wr||[]).includes(g.id);
   return{t:'k',k:'k:'+g.id,id:g.id,n:g.n,note:own?'You already have this one, so it stays in your wardrobe.':'In your wardrobe now. Wear it from the wardrobe in your bedroom.'}}
  if(p.t=='f')return fur(p.n);
  if(p.t=='p'){
   if(typeof PETS=='undefined')return fur('xm_petbed');
   const pets=s.pets||[],i=PETS.findIndex(x=>x[0]==p.n);
   if(i>=0&&pets.includes(i))return{t:'p',k:'p:'+i,i,n:PETS[i][0],own:1,note:'Already one of your pets, so it keeps following you.'};
   if(i>=0&&pets.length<3)return{t:'p',k:'p:'+i,i,n:PETS[i][0],note:'Your new pet follows you around and adds +1 song quality.'};
   const r=fur(p.n=='Rudy the Reindeer'?'xm_petbed':'xm_sled');r.note='You already have a full pet crew, so here is a '+r.n+' instead. It is in your Storage.';return r}
  if(p.t=='c'){
   if(typeof CARS=='undefined')return fur('xm_presents');
   const cars=s.cars||[],i=CARS.findIndex(c=>c.n==p.n);if(i<0)return fur('xm_presents');
   return{t:'c',k:'c:'+i,i,n:CARS[i].n,own:cars.includes(i),note:cars.includes(i)?'Already in your garage.':'Top speed 80 mph. Parked outside your garage east of the house: walk to it and press E.'+(s.garage?'':' Your garage is unlocked too.')}}
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


 /* ---------- 3D: the game's own item models (11-os-v2.js pvModel), lit and drawn by this calendar ---------- */
 const lights=sc=>{sc.add(new THREE.AmbientLight(0xfff4e6,.5));const k=new THREE.DirectionalLight(0xffe2b0,.72);k.position.set(3,6,5);sc.add(k);
  const r=new THREE.DirectionalLight(0x9fc8ff,.35);r.position.set(-4,3,-4);sc.add(r);const f=new THREE.DirectionalLight(0xffffff,.18);f.position.set(0,1,6);sc.add(f)};
 /* a copy of the item model, centred, sitting with its bottom at y=0 and about `size` across */
 function itemModel(k,size){const src=pvModel(k),m=src.clone(true),g=new THREE.Group();m.position.set(0,0,0);m.rotation.set(0,0,0);m.scale.setScalar(1);g.add(m);
  const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3()),s=size/Math.max(sz.x,sz.y,sz.z,.001);
  m.scale.setScalar(s);m.position.set(-c.x*s,-bb.min.y*s,-c.z*s);return g}
 /* door pictures: one small renderer, each item drawn once and kept as an image */
 const PIC={};let TR=null,TS=null,TC=null;
 function pic(k){if(!k)return'';if(PIC[k])return PIC[k];return safe(()=>{
  if(!TR){TR=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true});TR.setPixelRatio(1);TR.setSize(64,64);TS=new THREE.Scene();lights(TS);TC=new THREE.PerspectiveCamera(30,1,.1,50)}
  const g=itemModel(k,1.6);TS.add(g);g.rotation.y=.62;TC.position.set(0,1.75,4.6);TC.lookAt(0,.62,0);TR.render(TS,TC);TS.remove(g);
  return PIC[k]=TR.domElement.toDataURL()},'pic')||''}

 /* the reveal: a real 3D view of the item on a snowy stand. Drag (mouse or finger) to spin it, wheel or pinch to zoom. */
 function Viewer(cv,k){
  const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:false});R.setPixelRatio(1);cv.style.imageRendering='pixelated';const PXS=4;/* one screen pixel of the picture is a 4x4 block, like the game's own pictures */
  const sc=new THREE.Scene();lights(sc);
  const cam=new THREE.PerspectiveCamera(32,1,.1,60);
  const own=[];const mk=(geo,mat)=>{own.push(geo,mat);return new THREE.Mesh(geo,mat)};
  const turn=new THREE.Group();sc.add(turn);
  /* the stand: a chunky stepped plinth built from blocks, snow on top */
  const stand=new THREE.Group();stand.position.y=-.36;stand.scale.set(.74,1,.74);turn.add(stand);
  const blk=(w,h,d,c,x,y,z)=>{const m=mk(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);stand.add(m);return m};
  blk(2.9,.2,2.9,0x7a1420,0,.1,0);blk(2.96,.06,2.96,0xe6b422,0,.23,0);blk(2.7,.2,2.7,0xb5282f,0,.36,0);blk(2.76,.05,2.76,0xf4f4f4,0,.49,0);
  [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2],[0,1.35],[1.35,0],[-1.35,0],[0,-1.35]].forEach(([x,z],i)=>blk(.34,.12+(i%3)*.04,.34,0xf4f4f4,x,.56,z));
  [[-.5,1.28],[.6,-1.25],[1.3,.7],[-1.28,-.4]].forEach(([x,z])=>blk(.12,.12,.12,0xc0392b,x,.58,z));
  const item=itemModel(k,1.75);item.position.y=.02;turn.add(item);
  /* falling snow around it */
  const N=70,pos=new Float32Array(N*3),spd=new Float32Array(N);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*6;pos[i*3+1]=Math.random()*4-1;pos[i*3+2]=(Math.random()-.5)*4-.5;spd[i]=.004+Math.random()*.01}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pm=new THREE.PointsMaterial({color:0xffffff,size:.11,sizeAttenuation:true,transparent:false,opacity:1,depthWrite:false});own.push(pg,pm);sc.add(new THREE.Points(pg,pm));
  /* controls */
  let yaw=-.5,pitch=.2,vy=0,dist=5.6,drag=null,idle=0,t0=performance.now(),raf=0,dragged=false;const ptr=new Map();let pinch=0;
  const size=()=>{const w=cv.clientWidth||300,h=cv.clientHeight||300;R.setSize(Math.max(8,Math.ceil(w/PXS)),Math.max(8,Math.ceil(h/PXS)),false);cam.aspect=w/h;cam.updateProjectionMatrix()};size();
  const down=e=>{cv.setPointerCapture&&safe(()=>cv.setPointerCapture(e.pointerId),'cap');ptr.set(e.pointerId,[e.clientX,e.clientY]);
   if(ptr.size==1){drag={x:e.clientX,y:e.clientY,t:performance.now()};vy=0;cv.classList.add('grab')}else if(ptr.size==2){const p=[...ptr.values()];pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);drag=null}};
  const move=e=>{if(!ptr.has(e.pointerId))return;ptr.set(e.pointerId,[e.clientX,e.clientY]);
   if(ptr.size==2&&pinch){const p=[...ptr.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);dist=Math.max(3.4,Math.min(8,dist*pinch/d));pinch=d;return}
   if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,dt=Math.max(1,performance.now()-drag.t);
   yaw+=dx*.011;pitch=Math.max(-.25,Math.min(.75,pitch+dy*.007));vy=dx*.011/dt*16;drag={x:e.clientX,y:e.clientY,t:performance.now()};idle=0;
   if(!dragged&&Math.abs(dx)+Math.abs(dy)>2){dragged=true;const h=cv.parentNode&&cv.parentNode.querySelector('.hint');if(h)h.classList.add('gone')}};
  const up=e=>{ptr.delete(e.pointerId);if(ptr.size<2)pinch=0;if(!ptr.size){drag=null;cv.classList.remove('grab')}};
  const wheel=e=>{e.preventDefault();dist=Math.max(3.4,Math.min(8,dist*(1+Math.sign(e.deltaY)*.08)))};
  cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('wheel',wheel,{passive:false});
  addEventListener('resize',size);
  const ease=x=>{const c=1.70158*1.3;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
  function loop(){raf=requestAnimationFrame(loop);const t=performance.now(),a=Math.min(1,(t-t0)/750);
   if(!drag){yaw+=vy;vy*=.94;idle++;if(idle>70&&Math.abs(vy)<.002)yaw+=.006}
   const pop=a<1?ease(a):1;item.scale.setScalar(Math.max(.01,pop));item.position.y=.02+Math.sin(t/600)*.04;
   turn.rotation.y=yaw+(1-pop)*-3;
   cam.position.set(0,Math.sin(pitch)*dist+.6,Math.cos(pitch)*dist);cam.lookAt(0,.55,0);
   for(let i=0;i<N;i++){pos[i*3+1]-=spd[i];pos[i*3]+=Math.sin(t/900+i)*.002;if(pos[i*3+1]<-1.2)pos[i*3+1]=3}
   pg.attributes.position.needsUpdate=true;R.render(sc,cam)}
  loop();
  return{dispose(){cancelAnimationFrame(raf);removeEventListener('resize',size);cv.removeEventListener('pointerdown',down);cv.removeEventListener('pointermove',move);
   cv.removeEventListener('pointerup',up);cv.removeEventListener('pointercancel',up);cv.removeEventListener('wheel',wheel);
   own.forEach(o=>safe(()=>o.dispose(),'disp'));safe(()=>R.dispose(),'rd');safe(()=>R.forceContextLoss(),'rl')}}}

 /* ---------- sounds ---------- */
 const jingle=()=>safe(()=>{const N=[659,659,659,0,659,659,659,0,659,784,523,587,659];let t=0;
  N.forEach(f=>{if(f)sdHit(f,.7,.07,TINE,{del:t,jit:0,rev:.3});t+=.13});sdHit(1318,1.2,.03,TINE,{del:t,jit:0,rev:.4})},'jingle')||safe(()=>snd('chime'),'chime');
 const creak=()=>safe(()=>{sdNz(.25,700,.08,{q:6,f2:380,sw:.25});sdHit(220,.12,.12,WOOD,{bend:.2})},'creak')||safe(()=>snd('pop'),'pop');
 const sfx=n=>safe(()=>snd(n),'snd');

 /* ---------- little pixel icons for the doors (16x16) ---------- */
 const ICO={
  star:'<path d="M8 1l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z"/>',
  tree:'<path d="M8 1l4 5h-2l3 4h-2l3 4H2l3-4H3l3-4H4z"/><rect x="7" y="14" width="2" height="2"/>',
  bell:'<path d="M7 1h2v2c3 1 4 3 4 6v3l2 2H1l2-2V9c0-3 1-5 4-6z"/><rect x="6" y="14" width="4" height="2"/>',
  flake:'<path d="M7 0h2v16H7zM0 7h16v2H0zM2 3l1-1 11 11-1 1zM13 2l1 1L3 14l-1-1z"/>',
  bauble:'<rect x="6" y="1" width="4" height="3"/><circle cx="8" cy="10" r="6"/>',
  cane:'<path d="M4 15V6a4 4 0 018 0v2h-3V6a1 1 0 00-2 0v9z"/>',
  gift:'<rect x="1" y="6" width="14" height="10"/><rect x="0" y="4" width="16" height="3"/><path d="M8 4C6 0 3 1 4 4zM8 4c2-4 5-3 4 0z"/>',
  sock:'<path d="M5 0h7v9l-3 5c-1 2-4 2-6 1s-2-4-1-5l3-3z"/>'};
 const ICK=Object.keys(ICO);
 const icon=(n,cls)=>`<svg class="${cls||'ic'}" viewBox="0 0 16 16" aria-hidden="true">${ICO[n]}</svg>`;

 /* ---------- styles ---------- */
 const css=document.createElement('style');
 css.textContent=`
#advb{position:fixed;right:10px;top:96px;z-index:60;display:none;align-items:center;gap:8px;padding:7px 10px;background:#000;color:#e8f3ec;border:2px solid #000;box-shadow:inset 0 -3px #0007,0 0 0 2px #c0392b;font:12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;cursor:pointer}
#advb:hover{background:#1a1a1a}#advb.on{display:flex}
#advb .ic{width:16px;height:16px;fill:#e74c3c}
#advb .bd{min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;background:#c0392b;color:#fff;font:700 11px/18px ui-monospace,monospace;text-align:center}
#advb .bd:empty{display:none}
@keyframes advfade{from{opacity:0}to{opacity:1}}
@keyframes advpop{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}

#advw{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;font:14px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#e8f3ec;background:#050706dd;animation:advfade .2s ease-out}
#advw .advf{position:relative;width:min(960px,96vw);height:min(760px,94vh);display:flex;flex-direction:column;box-sizing:border-box;padding:22px 18px 12px;background:#161b18;border:3px solid #000;box-shadow:inset 0 0 0 2px #26302a,6px 6px 0 #000a;animation:advpop .25s ease-out}
#advw .advf:before{content:'';position:absolute;left:0;right:0;top:0;height:8px;background:repeating-linear-gradient(135deg,#c0392b 0 8px,#f4f4f4 8px 16px);border-bottom:3px solid #000}
#advw .hd{display:flex;align-items:flex-start;gap:14px;margin-bottom:10px}
#advw .hd h2{margin:0 0 4px;font:700 clamp(18px,3vw,26px) Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#fff}
#advw .hd h2 b{color:#e74c3c}
#advw .sub{flex:1;min-width:0}
#advw .sub p{margin:0 0 7px;color:#8aa094;font-size:13px}
#advw .prog{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
#advw .bar{width:150px;height:12px;background:#0c0f0d;border:2px solid #000;display:flex;gap:1px;padding:1px;box-sizing:border-box}
#advw .bar i{flex:1;background:#26302a}#advw .bar i.on{background:#2fe68a}
#advw .st{font:11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#8aa094}
#advw .tt{color:#f2c14e;font-size:11px}
#advw .x{flex:none;width:36px;height:36px;padding:0;font:700 14px Silkscreen,ui-monospace,monospace}
#advw .gw{position:relative;flex:1;min-height:0;overflow:auto;padding:8px;background:#0c0f0d;border:2px solid #000;box-shadow:inset 0 0 0 2px #1c231f;scrollbar-width:thin}
#advw .grid{display:grid;height:100%;min-height:400px;box-sizing:border-box;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(5,1fr);grid-auto-flow:row dense;gap:8px}
#advw .ft{margin-top:8px;color:#8aa094;font-size:12px;text-align:center}

/* a door: a flat painted square, like the rest of the game's buttons */
.advd{position:relative;padding:0;border:0;background:none;cursor:pointer;perspective:800px;font:inherit;color:inherit;min-width:0}
.advd.b22{grid-column:span 2;grid-row:span 2}.advd.b21{grid-column:span 2}.advd.b12{grid-row:span 2}
.advd .in{position:absolute;inset:0;isolation:isolate;z-index:0;background:#2a1a10;border:3px solid #000;box-shadow:inset 0 0 0 3px #4a2f1c,inset 0 -6px 0 #0006;display:flex;align-items:center;justify-content:center;overflow:hidden;box-sizing:border-box}
.advd .in img{position:relative;width:72%;max-width:150px;aspect-ratio:1;object-fit:contain;image-rendering:pixelated}
.advd .lf{position:absolute;inset:0;transform-origin:0 50%;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.35,0,.25,1)}
.advd .fr,.advd .bk{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:3px solid #000;box-sizing:border-box}
.advd .bk{transform:rotateY(180deg);background:#6e4024}
.advd .fr{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;overflow:hidden;background:var(--bg);box-shadow:inset 0 3px 0 #ffffff33,inset 0 -5px 0 #0000004d}
.advd .fr:before{content:'';position:absolute;left:0;right:0;top:0;height:6px;background:#f4f4f4;border-bottom:2px solid #0005}
.advd .knob{position:absolute;right:7px;top:52%;width:6px;height:6px;background:#e6b422;border:2px solid #000}
.advd .n{position:relative;z-index:1;margin-top:4px;font:700 clamp(18px,3vw,32px) Silkscreen,ui-monospace,monospace;color:var(--nc);text-shadow:2px 2px 0 #0006;line-height:1}
.advd .ic{position:relative;z-index:1;width:clamp(12px,1.7vw,18px);height:clamp(12px,1.7vw,18px);fill:var(--ic);shape-rendering:crispEdges}
.advd.b22 .n{font-size:clamp(30px,5.4vw,62px)}
.advd.b22 .ic,.advd.b21 .ic,.advd.b12 .ic{width:clamp(16px,2.2vw,26px);height:clamp(16px,2.2vw,26px)}
.advd .lk{position:absolute;left:7px;bottom:6px;width:10px;height:8px;background:#cfd6d2;border:2px solid #000;z-index:2}
.advd .lk:before{content:'';position:absolute;left:0;top:-7px;width:4px;height:5px;border:2px solid #000;border-bottom:0;background:none;box-shadow:inset 0 0 0 1px #cfd6d2}
.advd .tg{position:absolute;right:-4px;top:-5px;padding:2px 6px;background:#2fe68a;color:#04120a;font:700 9px Silkscreen,ui-monospace,monospace;letter-spacing:1px;border:2px solid #000;z-index:4}
.advd .ck{position:absolute;right:5px;top:9px;width:18px;height:18px;background:#2fe68a;color:#04120a;border:2px solid #000;font:700 12px/14px ui-monospace,monospace;text-align:center;z-index:3}
.advd .dn{position:absolute;left:9px;top:9px;z-index:2;font:700 11px Silkscreen,ui-monospace,monospace;color:#f2c14e;text-shadow:1px 1px 0 #000}
.advd .nm{position:absolute;z-index:2;left:6px;right:6px;bottom:6px;font:700 10px ui-monospace,monospace;color:#fff;text-shadow:1px 1px 0 #000;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.advd.red{--bg:#b5282f;--nc:#fff;--ic:#f2c14e}
.advd.grn{--bg:#238a4e;--nc:#fff;--ic:#fff}
.advd.cane{--bg:repeating-linear-gradient(135deg,#f4f4f4 0 8px,#c0392b 8px 16px);--nc:#9c1c26;--ic:#238a4e}
.advd.cane .n{background:#f4f4f4;padding:2px 7px;border:2px solid #000;text-shadow:none}
.advd.navy{--bg:#27437d;--nc:#f2c14e;--ic:#cfe9ff}
.advd.gold{--bg:#d9a521;--nc:#7a1420;--ic:#7a1420}
.advd.gold .n{text-shadow:2px 2px 0 #fff6}
.advd.plum{--bg:#7d2f6e;--nc:#fff;--ic:#f2c14e}
.advd.d24 .fr{background:linear-gradient(90deg,transparent 44%,#c0392b 44% 56%,transparent 56%),linear-gradient(transparent 44%,#c0392b 44% 56%,transparent 56%),#1f7a45}
.advd.d24 .n{color:#f2c14e;background:#0f4a28;padding:4px 14px;border:3px solid #000}
.advd.d24 .eve{position:relative;z-index:1;margin-top:6px;padding:2px 8px;background:#c0392b;border:2px solid #000;font:700 clamp(9px,1.2vw,12px) Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#fff}
.advd.d24 .ic{width:clamp(22px,3vw,34px);height:clamp(22px,3vw,34px);fill:#f2c14e}
.advd.lock{cursor:not-allowed}
.advd.lock .fr{filter:saturate(.45) brightness(.7)}
.advd.rdy .fr{outline:3px solid #2fe68a;outline-offset:1px}
.advd.rdy:hover{transform:translateY(-2px)}
.advd.rdy:hover .lf{transform:rotateY(-14deg)}
.advd.open .lf{transform:rotateY(-112deg)}
.advd.done .lf,.advd.peek .lf{display:none}
.advd.done:hover .in img{transform:scale(1.06)}
.advd.open .tg,.advd.peek .tg{display:none}
.advd.shake{animation:advshake .35s}
@keyframes advshake{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
.advd:focus-visible{outline:3px solid #6fd3ff;outline-offset:2px}
#advw .tip{position:fixed;z-index:5;padding:5px 9px;background:#000;color:#e8f3ec;border:2px solid #2fe68a;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none;white-space:nowrap;transform:translate(-50%,-100%)}

/* the reveal */
#advr{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:#050706ee;animation:advfade .2s}
#advr .card{position:relative;width:min(500px,94vw);max-height:94vh;overflow:auto;padding:0 0 18px;box-sizing:border-box;text-align:center;background:#161b18;border:3px solid #000;box-shadow:inset 0 0 0 2px #26302a,6px 6px 0 #000a;animation:advpop .25s ease-out}
#advr .card:before{content:'';display:block;height:8px;background:repeating-linear-gradient(135deg,#c0392b 0 8px,#f4f4f4 8px 16px);border-bottom:3px solid #000}
#advr .rib{margin:12px 0 0;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#f2c14e}
#advr .stage{position:relative;margin:10px 14px 6px;height:min(320px,40vh);background:linear-gradient(#0c1410 0 72%,#13221a 72% 100%);border:2px solid #000;box-shadow:inset 0 0 0 2px #1c231f;overflow:hidden}
#advr .stage canvas{display:block;width:100%;height:100%;cursor:grab;touch-action:none}
#advr .stage canvas.grab{cursor:grabbing}
#advr .hint{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);padding:3px 8px;background:#000;border:2px solid #26302a;color:#8aa094;font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none;transition:opacity .4s;white-space:nowrap}
#advr .hint.gone{opacity:0}
#advr h3{margin:8px 12px 5px;font:700 22px Silkscreen,ui-monospace,monospace;color:#fff}
#advr .cat{display:inline-flex;align-items:center;gap:6px;margin-bottom:8px;padding:2px 8px;background:#0c0f0d;color:#2fe68a;border:2px solid #000;font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px}
#advr .cat .ic{width:12px;height:12px;fill:#2fe68a}
#advr p{margin:0 18px 12px;color:#8aa094;font-size:13px;line-height:1.45}
#advr .cl{display:block;margin:12px auto 0;min-width:200px;padding:12px 30px;background:#2fe68a;color:#04120a;border:3px solid #000;box-shadow:inset 0 -4px 0 #0007;font:700 16px Silkscreen,ui-monospace,monospace;letter-spacing:2px;cursor:pointer}
#advr .cl:hover{background:#5cf0a6}
#advr .cl:active{transform:translateY(1px)}
#advr .cl:disabled{background:#26302a;color:#8aa094;cursor:default}
#advr .later{display:block;margin:10px auto 0}
.advfly{position:fixed;z-index:95;pointer-events:none;will-change:transform;image-rendering:pixelated}
.advcf{position:fixed;z-index:96;width:8px;height:8px;pointer-events:none;will-change:transform,opacity}

@media (max-width:640px){
 #advw .advf{padding:20px 10px 10px;height:96vh}
 #advw .hd{flex-wrap:wrap;gap:8px}
 #advw .sub{order:3;flex-basis:100%}
 #advw .gw{padding:6px}
 #advw .grid{grid-template-columns:repeat(4,1fr);grid-template-rows:none;grid-auto-rows:minmax(76px,1fr);height:auto;gap:6px}
 .advd.m21{grid-column:span 2}
 #advr .stage{height:min(270px,36vh)}
}
@media (prefers-reduced-motion:reduce){#advw *,#advr *{animation-duration:.01s!important}.advd .lf{transition-duration:.2s}}
`;
 document.head.appendChild(css);

 /* ---------- HUD button ---------- */
 const btn=document.createElement('button');btn.id='advb';btn.type='button';btn.setAttribute('aria-label','Advent calendar');
 btn.innerHTML=icon('gift')+'<span>ADVENT</span><span class=bd></span>';
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
 let W=null,REV=null;const PEEK={};/* doors swung open but not claimed yet (this visit only) */
 const fmtD=d=>d+' December';
 function status(){
  const y=yr(),t=now(),a=st()||{c:{}},got=Object.keys(a.c).length;
  if(devOpen()){const left=24-got;return'Dev build: every door is unlocked · '+(left?left+' to open · ':'')+got+'/24 claimed'}
  if(!season()){
   if(new Date(t).getMonth()<11){const ms=opensAt(1,y)-t,days=Math.ceil(ms/864e5);return days>1?'Opens in '+days+' days':ms>36e5?'Opens tomorrow':'Opens at midnight'}
   return'See you next December'}
  const td=today(),left=[];for(let d=1;d<=24;d++)if(ready(d)&&!a.c[d])left.push(d);
  if(td>=24&&!left.length)return'All 24 doors opened. Merry Christmas!';
  return(left.length?(left.length==1?'1 door ready':left.length+' doors ready'):'Next door opens tomorrow')+' · '+got+'/24 claimed'}
 function doorHTML(d,i){
  const a=st(),c=a&&a.c[d],r=ready(d),cls=['advd',STY[(i*5+d)%6],BIG[d]||'',MW[d]||''];
  const pk=!c&&r&&PEEK[d];if(d==24)cls.push('d24');
  if(c)cls.push('done');else if(pk)cls.push('peek');else if(r)cls.push('rdy');else cls.push('lock');
  const td=today()==d&&!c;
  const inner=c?`<img alt="" src="${pic(c.k)}"><span class=nm>${esc2(c.n)}</span>`:pk?`<img alt="" src="${pic(PEEK[d].k)}">`:'';
  const ic=d==24?icon('tree'):icon(ICK[(d*3+i)%ICK.length]);
  return`<button type=button class="${cls.join(' ')}" data-d="${d}" aria-label="Door ${d}${c?', claimed: '+esc2(c.n):r?', ready to open':', opens on '+fmtD(d)}">
   <span class=in>${inner}</span>
   <span class=lf><span class=fr>${d==24?ic:''}<span class=n>${d}</span>${d==24?'<span class=eve>CHRISTMAS EVE</span>':ic}<i class=knob></i>${!r&&!c?'<i class=lk></i>':''}</span><span class=bk></span></span>
   ${td&&r?'<span class=tg>TODAY</span>':''}${c?'<span class=ck>&#10003;</span>':''}${c||pk?`<span class=dn>${d}</span>`:''}</button>`}
 const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function render(){if(!W)return;
  W.querySelector('.st').textContent=status();
  const a=st()||{c:{}};W.querySelector('.bar').innerHTML=Array.from({length:24},(x,i)=>`<i class="${a.c[i+1]?'on':''}"></i>`).join('');
  W.querySelector('.tt').textContent=testOn()?'Test date '+new Date(now()).toDateString():'';
  W.querySelector('.grid').innerHTML=ORDER.map(doorHTML).join('')}
 function open(){
  if(!Sv())return;if(!visible())return;
  if(typeof mode!='undefined'&&mode!='play'&&mode!='menu')return;
  safe(()=>{$('ui').innerHTML=''},'ui');mode='menu';
    W=document.createElement('div');W.id='advw';W.setAttribute('role','dialog');W.setAttribute('aria-label','Advent calendar');
  W.innerHTML=`<div class=advf>
   <div class=hd><div class=sub><h2><b>*</b> ADVENT CALENDAR</h2><p>A free gift behind every door, 1 to 24 December. A new door opens every morning.</p><div class=prog><div class=bar></div><span class=st></span><span class=tt></span></div></div>
    <button type=button class=x aria-label=Close>X</button></div>
   <div class=gw><div class=grid></div></div>
   <div class=ft>Clothes, furniture, pets and one very special car. Missed a day? Open it any time in December.</div>
  </div>`;
  document.body.appendChild(W);
  W.querySelector('.x').onclick=()=>{sfx('click');close()};
  W.querySelector('.grid').addEventListener('click',e=>{const b=e.target.closest('.advd');if(b)tap(b,+b.dataset.d)});
  render()}
 function close(){if(REV){if(!REV.done&&!REV.view)return;return endReveal(1)}if(W){W.remove();W=null}if(typeof mode!='undefined'&&mode=='menu')mode='play'}
 function tip(b,t){if(!W)return;W.querySelectorAll('.tip').forEach(x=>x.remove());const r=b.getBoundingClientRect(),e=document.createElement('div');e.className='tip';e.textContent=t;
  e.style.left=(r.left+r.width/2)+'px';e.style.top=(r.top-6)+'px';W.appendChild(e);setTimeout(()=>e.remove(),1600)}
 function tap(b,d){
  if(REV||b.dataset.busy)return;
  if(claimed(d)){const c=st().c[d];sfx('pop');return reveal(b,d,{t:c.t,k:c.k,n:c.n,note:'You claimed this on door '+d+'.'},1)}
  if(!ready(d)){sfx('err');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');tip(b,season()||new Date(now()).getMonth()<11?'Opens on '+fmtD(d):'This year’s calendar is over');return}
  const r=resolve(d);if(!r)return;
  if(PEEK[d]){sfx('pop');return reveal(b,d,r)}
  /* swing the door open, show the item small inside, then bring it out big */
  b.dataset.busy=1;b.querySelector('.in').innerHTML=`<img alt="" src="${pic(r.k)}">`;
  PEEK[d]=r;b.classList.remove('rdy');creak();
  requestAnimationFrame(()=>b.classList.add('open'));
  setTimeout(()=>{delete b.dataset.busy;reveal(b,d,r)},1250)}

 /* the item flies out of the door into a 3D stage you can spin. `view` = looking again at something already claimed */
 function reveal(b,d,r,view){
  if(!W)return;
  const img=b.querySelector('.in img'),from=(img||b).getBoundingClientRect();
  REV={b,d,r,view};
  const o=document.createElement('div');o.id='advr';
  o.innerHTML=`<div class=rays></div><div class=card><div class=rib>DOOR ${d} · ${fmtD(d).toUpperCase()}</div>
   <div class=stage><canvas aria-label="3D view of ${esc2(r.n)}. Drag to spin."></canvas><div class=hint>&#8596; DRAG TO SPIN</div></div>
   <h3>${esc2(r.n)}</h3><span class=cat>${icon({k:'sock',f:'gift',p:'star',c:'bell'}[r.t]||'gift')}${CAT[r.t]||''}</span><p>${esc2(r.note)}</p>
   ${view?'<button type=button class=cl>CLOSE</button>':'<button type=button class=cl>CLAIM</button>'}</div>`;
  W.appendChild(o);REV.o=o;
  const cv=o.querySelector('canvas'),stage=o.querySelector('.stage');
  cv.style.visibility='hidden';
  /* the small picture flies out of the door and grows into the stage, then the 3D model takes over */
  const fly=document.createElement('img');fly.className='advfly';fly.src=pic(r.k);
  Object.assign(fly.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});document.body.appendChild(fly);
  if(img)img.style.visibility='hidden';
  requestAnimationFrame(()=>{const sr=stage.getBoundingClientRect(),s=Math.min(sr.width,sr.height)*.62,to={left:sr.left+(sr.width-s)/2,top:sr.top+(sr.height-s)/2,width:s,height:s};
   const sx=to.width/from.width,sy=to.height/from.height,dx=to.left-from.left,dy=to.top-from.top;
   const an=fly.animate([{transform:'translate(0,0) scale(1) rotate(0)'},{transform:`translate(${dx*.5}px,${dy*.5-70}px) scale(${sx*.6},${sy*.6}) rotate(-10deg)`,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy}) rotate(0)`}],{duration:view?420:780,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
   an.onfinish=()=>{if(!REV||REV.o!==o){fly.remove();return}cv.style.visibility='';REV.v=safe(()=>Viewer(cv,r.k),'viewer');fly.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}).onfinish=()=>fly.remove();}});
  sfx('whoosh');if(!view)setTimeout(()=>jingle(),380);
  const cb=o.querySelector('.cl');
  if(view){cb.onclick=()=>{sfx('click');endReveal(1)};o.addEventListener('click',e=>{if(e.target===o)endReveal(1)})}
  else{/* claiming is the only way out: no backdrop click, no Esc. pointerup and click both claim (claim() ignores the second), so a tap never gets lost */
   cb.addEventListener('pointerup',e=>{if(e.button===0||e.pointerType=='touch'||e.pointerType=='pen')claim(cb)});cb.addEventListener('click',()=>claim(cb))}}

 function claim(cb){
  if(!REV||REV.done||REV.view||REV.busy)return;const {d}=REV;REV.busy=1;
  let r=null;try{r=claimed(d)?true:give(d)}catch(e){r=null}
  if(!r){REV.busy=0;sfx('err');cb.textContent='TRY AGAIN';return}
  REV.done=1;cb.disabled=true;cb.innerHTML='&#10003; CLAIMED!';sfx('cash');setTimeout(()=>sfx('chime'),120);
  confetti(cb);
  setTimeout(()=>endReveal(0),1500)}

 /* close the reveal: the item shrinks back into its door */
 function endReveal(backOut){
  if(!REV)return;const {d,o,r,v}=REV,done=REV.done||REV.view;REV=null;if(v)v.dispose();
  const stage=o.querySelector('.stage'),sr=stage.getBoundingClientRect(),s=Math.min(sr.width,sr.height)*.62,from={left:sr.left+(sr.width-s)/2,top:sr.top+(sr.height-s)/2,width:s,height:s};
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
  for(let i=0;i<n;i++){const s=document.createElement('i');s.className='advcf';const a=Math.random()*Math.PI*2,dist=90+Math.random()*120,sz=4+Math.random()*7;
   Object.assign(s.style,{left:cx+'px',top:cy+'px',width:sz+'px',height:sz+'px',background:Math.random()<.5?'#fff6c8':'#f2c14e',transform:'rotate(45deg)'});document.body.appendChild(s);
   s.animate([{transform:'translate(0,0) rotate(45deg) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist}px) rotate(225deg) scale(.2)`,opacity:0}],{duration:700+Math.random()*600,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>s.remove()}}
 function confetti(el){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top;const C=['#ff4b4b','#f2c14e','#46e083','#fff','#3fa9ff'];
  for(let i=0;i<32;i++){const s=document.createElement('i');s.className='advcf';const a=-Math.PI/2+(Math.random()-.5)*2.2,v=160+Math.random()*260;
   Object.assign(s.style,{left:cx+'px',top:cy+'px',background:C[i%C.length],borderRadius:'0'});document.body.appendChild(s);
   const dx=Math.cos(a)*v,dy=Math.sin(a)*v;
   s.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${360*Math.random()}deg)`,opacity:1,offset:.5},{transform:`translate(${dx*1.3}px,${dy+280}px) rotate(${720*Math.random()}deg)`,opacity:0}],{duration:1300+Math.random()*700,easing:'cubic-bezier(.15,.6,.4,1)'}).onfinish=()=>s.remove()}}

 /* Esc closes (the reveal first), and keeps the game's own Esc (pause) from firing underneath */
 addEventListener('keydown',e=>{if(!W)return;if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!(REV&&!REV.done&&!REV.view))close()}
  else if((e.key=='Enter'||e.key==' ')&&REV&&!REV.done&&!REV.view&&document.activeElement&&!document.activeElement.closest('#advr')){e.preventDefault();e.stopImmediatePropagation();claim(REV.o.querySelector('.cl'))}},true);
 /* anything else that clears the UI (pause, a modal, closeUI) also closes the calendar */
 setInterval(()=>{if(W&&typeof mode!='undefined'&&mode!='menu'){if(REV&&REV.v)REV.v.dispose();REV=null;W.remove();W=null}},300);

 window.FW_ADVENT={open,close,now,ready,resolve,PLAN,ORDER,setTest,claimed,pic,itemModel,Viewer};

 /* ---------- dev panel: calendar-only test dates ---------- */
 if(DEV)safe(()=>{
  const box=document.getElementById('fwdvb');if(!box)return;
  const msg=t=>{const e=document.getElementById('fwdvs');if(e)e.textContent=t};
  const h=document.createElement('h5');h.textContent='Advent calendar (all doors unlocked on dev; a test date shows the real locks)';box.appendChild(h);
  const y=new Date().getFullYear(),at=(m,d,hh)=>new Date(y,m,d,hh||9,0,0).getTime();
  const B=[['Open the calendar',()=>{if(!Sv())return msg('Start or load a career first.');if(W)close();open()}],
   ['Test date: 30 Nov (all locked)',()=>{setTest(at(10,30));msg('Advent test date 30 Nov');if(W)render()}],
   ['Test date: 1 Dec',()=>{setTest(at(11,1));msg('Advent test date 1 Dec');if(W)render()}],
   ['Test date: 12 Dec',()=>{setTest(at(11,12));msg('Advent test date 12 Dec');if(W)render()}],
   ['Test date: 24 Dec (every door)',()=>{setTest(at(11,24));msg('Advent test date 24 Dec');if(W)render()}],
   ['Test date: 1 Jan (over)',()=>{setTest(new Date(y+1,0,1,9).getTime());msg('Advent test date 1 Jan');if(W)render()}],
   ['Back to dev: every door unlocked',()=>{setTest(null);msg('Advent: every door unlocked (dev)');if(W)render()}],
   ['Close all advent doors on this save',()=>{const s=Sv();if(!s)return msg('Start or load a career first.');s.adv={y:yr(),c:{}};safe(()=>autoSave(),'save');msg('Advent doors closed (items you got are kept)');if(W)render()}]];
  B.forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;box.appendChild(b)})},'panel');
})();
