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
  if(!TR){TR=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});TR.setPixelRatio(1);TR.setSize(192,192);TS=new THREE.Scene();lights(TS);TC=new THREE.PerspectiveCamera(30,1,.1,50)}
  const g=itemModel(k,1.6);TS.add(g);g.rotation.y=.62;TC.position.set(0,1.75,4.6);TC.lookAt(0,.62,0);TR.render(TS,TC);TS.remove(g);
  return PIC[k]=TR.domElement.toDataURL()},'pic')||''}

 /* the reveal: a real 3D view of the item on a snowy stand. Drag (mouse or finger) to spin it, wheel or pinch to zoom. */
 function Viewer(cv,k){
  const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  const sc=new THREE.Scene();lights(sc);
  const cam=new THREE.PerspectiveCamera(32,1,.1,60);
  const spot=new THREE.PointLight(0xffd88a,.55,9);spot.position.set(0,3.2,1.6);sc.add(spot);
  const own=[];const mk=(geo,mat)=>{own.push(geo,mat);return new THREE.Mesh(geo,mat)};
  const turn=new THREE.Group();sc.add(turn);
  /* the stand: snow on a red and gold drum */
  const stand=new THREE.Group();stand.position.y=-.36;turn.add(stand);
  const drum=mk(new THREE.CylinderGeometry(1.25,1.32,.3,48),new THREE.MeshLambertMaterial({color:0xa3202f}));drum.position.y=.15;stand.add(drum);
  const band=mk(new THREE.CylinderGeometry(1.335,1.335,.07,48,1,true),new THREE.MeshLambertMaterial({color:0xf2c14e,side:THREE.DoubleSide}));band.position.y=.15;stand.add(band);
  const snowTop=mk(new THREE.CylinderGeometry(1.28,1.27,.08,48),new THREE.MeshLambertMaterial({color:0xf4f8fc}));snowTop.position.y=.33;stand.add(snowTop);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=.08+((i*37)%5)*.012,lump=mk(new THREE.SphereGeometry(r,10,8),new THREE.MeshLambertMaterial({color:0xf4f8fc}));lump.position.set(Math.cos(a)*1.25,.3,Math.sin(a)*1.25);lump.scale.y=.7;stand.add(lump)}
  const shadow=mk(new THREE.CircleGeometry(.85,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.18}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.375;stand.add(shadow);
  const item=itemModel(k,1.75);item.position.y=.02;turn.add(item);
  /* falling snow around it */
  const N=160,pos=new Float32Array(N*3),spd=new Float32Array(N);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*6;pos[i*3+1]=Math.random()*4-1;pos[i*3+2]=(Math.random()-.5)*4-.5;spd[i]=.004+Math.random()*.01}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pm=new THREE.PointsMaterial({color:0xffffff,size:.05,transparent:true,opacity:.85,depthWrite:false});own.push(pg,pm);sc.add(new THREE.Points(pg,pm));
  /* controls */
  let yaw=-.5,pitch=.2,vy=0,dist=5.6,drag=null,idle=0,t0=performance.now(),raf=0,dragged=false;const ptr=new Map();let pinch=0;
  const size=()=>{const w=cv.clientWidth||300,h=cv.clientHeight||300;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()};size();
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

 /* the background hills with pine trees (an SVG made once) */
 function hills(){let s=1;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  const tree=(x,y,h,c)=>`<path d="M${x} ${y-h}L${x+h*.34} ${y-h*.45}H${x+h*.18}L${x+h*.42} ${y}H${x-h*.42}L${x-h*.18} ${y-h*.45}H${x-h*.34}Z" fill="${c}"/>`;
  let far='',near='';for(let x=-20;x<1040;x+=26+rnd()*30)far+=tree(x,150+Math.sin(x/90)*10,30+rnd()*34,'#16304a');
  for(let x=-20;x<1040;x+=40+rnd()*50)near+=tree(x,185+Math.sin(x/120+1)*8,44+rnd()*40,'#0d2236');
  return`<svg class=hl viewBox="0 0 1000 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <path d="M0 150Q120 120 260 142T520 136T780 140T1000 132V200H0Z" fill="#1d3a57"/>${far}
  <path d="M0 176Q160 150 330 170T640 166T1000 160V200H0Z" fill="#dfe9f3"/>${near}
  <path d="M0 190Q200 172 420 186T800 182T1000 178V200H0Z" fill="#f4f8fc"/></svg>`}

 /* ---------- styles ---------- */
 const css=document.createElement('style');
 css.textContent=`
#advb{position:fixed;right:10px;top:96px;z-index:60;display:none;align-items:center;gap:8px;padding:7px 12px 7px 9px;background:linear-gradient(#d0313f,#8e1424);color:#fff6e0;border:3px solid #000;box-shadow:inset 0 0 0 2px #f2c14e,inset 0 -4px 0 #0004,4px 4px 0 #0008;font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;cursor:pointer;animation:advbob 3s ease-in-out infinite}
#advb:hover{filter:brightness(1.12)}#advb.on{display:flex}
#advb .ic{width:18px;height:18px;fill:#f2c14e;filter:drop-shadow(1px 1px 0 #0008)}
#advb .bd{min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:#f2c14e;color:#5a0a14;font:700 11px/18px ui-monospace,monospace;text-align:center;animation:advpulse 1.4s ease-in-out infinite}
#advb .bd:empty{display:none}
@keyframes advbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes advpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes advfade{from{opacity:0}to{opacity:1}}
@keyframes advpop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}

/* the night outside */
#advw{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;overflow:hidden;font:14px ui-monospace,Menlo,Consolas,monospace;color:#fff6e0;
 background:radial-gradient(ellipse 60% 40% at 50% 105%,#ffcf8a33,transparent 70%),linear-gradient(#060b1f 0%,#0e1d44 45%,#27386b 75%,#3b3f72 100%);animation:advfade .35s ease-out}
#advw .stars{position:absolute;inset:0 0 40% 0;pointer-events:none;background-image:radial-gradient(1.5px 1.5px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 27% 8%,#fff,transparent),radial-gradient(1.5px 1.5px at 44% 26%,#fff,transparent),radial-gradient(1px 1px at 61% 12%,#fff,transparent),radial-gradient(2px 2px at 78% 22%,#fff,transparent),radial-gradient(1px 1px at 90% 6%,#fff,transparent),radial-gradient(1px 1px at 6% 40%,#fff,transparent),radial-gradient(1.5px 1.5px at 36% 44%,#fff,transparent),radial-gradient(1px 1px at 70% 38%,#fff,transparent),radial-gradient(1px 1px at 95% 34%,#fff,transparent);animation:advtw 4s ease-in-out infinite}
#advw .moon{position:absolute;left:7%;top:7%;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle at 38% 38%,#fffbe8,#f3e7bd 60%,#d9c98f);box-shadow:0 0 40px 12px #fff5c844,0 0 120px 40px #fff5c81a;pointer-events:none}
#advw .moon:after{content:'';position:absolute;left:44%;top:52%;width:12px;height:12px;border-radius:50%;background:#e2d3a066;box-shadow:-22px -18px 0 -3px #e2d3a055,8px -26px 0 -4px #e2d3a044}
#advw .hl{position:absolute;left:0;right:0;bottom:0;width:100%;height:32vh;pointer-events:none}
#advw .sn{position:absolute;top:-12px;border-radius:50%;background:#fff;pointer-events:none;animation:advfall linear infinite}
#advw .sn.b{filter:blur(1.5px)}
@keyframes advfall{0%{transform:translate(0,-10px)}25%{transform:translate(14px,25vh)}50%{transform:translate(-8px,50vh)}75%{transform:translate(12px,75vh)}100%{transform:translate(0,104vh)}}

/* the calendar board: a wooden cabinet with a pine garland, lights and holly */
#advw .advf{position:relative;width:min(980px,96vw);height:min(800px,94vh);display:flex;flex-direction:column;box-sizing:border-box;padding:40px 24px 14px;
 background:repeating-linear-gradient(90deg,#0000000f 0 2px,transparent 2px 7px,#ffffff08 7px 8px,transparent 8px 53px),linear-gradient(#7a3418,#5a220e 60%,#4a1a0a);
 border:4px solid #000;box-shadow:inset 0 0 0 4px #c9902a,inset 0 0 0 6px #f2c14e,inset 0 0 0 9px #3a1208,inset 0 14px 30px #0006,10px 10px 0 #0009,0 0 80px #ffb84d22;animation:advpop .5s cubic-bezier(.2,1.4,.4,1)}
#advw .gar{position:absolute;left:-14px;right:-14px;top:-18px;height:38px;pointer-events:none;
 background:radial-gradient(circle at 50% 60%,#2f7a43 0 13px,transparent 13.5px) 0 0/22px 34px repeat-x,radial-gradient(circle at 50% 40%,#1f5e31 0 14px,transparent 14.5px) 11px 4px/22px 34px repeat-x,radial-gradient(circle at 50% 50%,#3c9152 0 6px,transparent 6.5px) 5px 10px/17px 30px repeat-x;filter:drop-shadow(0 4px 0 #0007)}
#advw .lights{position:absolute;left:6px;right:6px;top:-6px;height:26px;display:flex;justify-content:space-around;pointer-events:none}
#advw .lights i{position:relative;width:9px;height:13px;margin-top:var(--y);border-radius:40% 40% 50% 50%;background:var(--c);box-shadow:0 0 12px 3px var(--c);animation:advtw 1.8s ease-in-out infinite;animation-delay:var(--d)}
#advw .lights i:before{content:'';position:absolute;left:2px;top:-4px;width:5px;height:4px;background:#1b2a1f}
@keyframes advtw{0%,100%{opacity:1}50%{opacity:.4;box-shadow:none}}
#advw .bow{position:absolute;left:50%;top:-30px;width:86px;height:56px;margin-left:-43px;pointer-events:none;filter:drop-shadow(0 4px 0 #0007)}
#advw .holly{position:absolute;width:64px;height:48px;pointer-events:none;filter:drop-shadow(0 3px 0 #0008)}
#advw .holly.l{left:-20px;bottom:-18px;transform:rotate(-12deg)}#advw .holly.r{right:-20px;bottom:-18px;transform:scaleX(-1) rotate(-12deg)}

#advw .hd{position:relative;display:flex;align-items:center;gap:14px;margin-bottom:10px}
#advw .ttl{position:relative;display:inline-block;padding:7px 22px 8px;background:linear-gradient(#c8283a,#8e1424);border:3px solid #000;box-shadow:inset 0 0 0 2px #f2c14e,inset 0 -5px 0 #0004}
#advw .ttl:before,#advw .ttl:after{content:'';position:absolute;top:8px;width:18px;height:100%;background:#7a0f1d;border:3px solid #000;z-index:-1}
#advw .ttl:before{left:-16px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,40% 50%)}#advw .ttl:after{right:-16px;clip-path:polygon(0 0,100% 0,60% 50%,100% 100%,0 100%)}
#advw .hd h2{margin:0;font:700 clamp(17px,3.1vw,30px) Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#ffd96b;text-shadow:2px 2px 0 #5a0a14,4px 4px 0 #0008;white-space:nowrap}
#advw .sub{flex:1;min-width:0}
#advw .sub p{margin:0 0 6px;color:#f6e2c4;font-size:13px;line-height:1.35}
#advw .prog{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
#advw .orn{display:flex;gap:3px}
#advw .orn i{position:relative;width:11px;height:11px;border-radius:50%;background:#0005;box-shadow:inset 0 0 0 1.5px #f2c14e66}
#advw .orn i:before{content:'';position:absolute;left:3px;top:-3px;width:5px;height:3px;background:#f2c14e66}
#advw .orn i.on{background:radial-gradient(circle at 35% 35%,#fff9 0 1.5px,transparent 2px),var(--c);box-shadow:0 0 6px var(--c)}
#advw .orn i.on:before{background:#f2c14e}
#advw .st{font:700 11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#fff6e0}
#advw .tt{color:#bfeaff;font-size:11px}
#advw .x{flex:none;align-self:flex-start;width:42px;height:42px;padding:0;background:linear-gradient(#c8283a,#8e1424);color:#fff6e0;border:3px solid #000;box-shadow:inset 0 0 0 2px #f2c14e,inset 0 -4px 0 #0004;font:700 16px Silkscreen,ui-monospace,monospace;cursor:pointer}
#advw .x:hover{filter:brightness(1.15)}
#advw .gw{position:relative;flex:1;min-height:0;overflow:auto;padding:10px;background:radial-gradient(circle,#ffffff0d 1px,transparent 1.5px) 0 0/9px 9px,linear-gradient(#1c4a2f,#123620);border:3px solid #000;box-shadow:inset 0 0 0 2px #c9902a,inset 0 8px 18px #0008;scrollbar-width:thin}
#advw .grid{display:grid;height:100%;min-height:400px;box-sizing:border-box;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(5,1fr);grid-auto-flow:row dense;gap:9px}
#advw .ft{margin-top:9px;color:#ecd2ae;font-size:12px;text-align:center}

/* a door */
.advd{position:relative;padding:0;border:0;background:none;cursor:pointer;perspective:800px;font:inherit;color:inherit;min-width:0;transition:transform .15s}
.advd.b22{grid-column:span 2;grid-row:span 2}.advd.b21{grid-column:span 2}.advd.b12{grid-row:span 2}
.advd .in{position:absolute;inset:0;isolation:isolate;z-index:0;background:radial-gradient(circle at 50% 58%,#fff1c4 0%,#f0b956 26%,#8a4a18 58%,#2a1206 85%);box-shadow:inset 0 0 0 3px #000,inset 0 0 22px #000c;display:flex;align-items:center;justify-content:center;overflow:hidden}
.advd .in:after{content:'';position:absolute;left:12%;right:12%;bottom:16%;height:5px;background:#4a2410;box-shadow:0 2px 0 #0006}
.advd .in img{position:relative;z-index:1;width:72%;max-width:150px;aspect-ratio:1;object-fit:contain;filter:drop-shadow(0 5px 3px #0008);animation:advbob 2.2s ease-in-out infinite}
.advd .lf{position:absolute;inset:0;transform-origin:0 50%;transform-style:preserve-3d;transition:transform .95s cubic-bezier(.35,0,.25,1)}
.advd .fr,.advd .bk{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:3px solid #000;box-sizing:border-box}
.advd .bk{transform:rotateY(180deg);background:repeating-linear-gradient(0deg,#00000022 0 2px,transparent 2px 10px),linear-gradient(90deg,#6e4024,#8a5432)}
.advd .fr{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;overflow:hidden;background:var(--bg);box-shadow:inset 0 0 0 3px var(--rim),inset 4px 4px 0 3px #ffffff22,inset -5px -5px 0 3px #0000002e;transition:filter .2s}
.advd .fr:before{content:'';position:absolute;left:-2px;right:-2px;top:-2px;height:13px;background:radial-gradient(circle at 50% 0,#fff 0 7px,transparent 7.5px) 0 0/16px 13px repeat-x,radial-gradient(circle at 50% 0,#fff 0 4px,transparent 4.5px) 8px 2px/16px 13px repeat-x,linear-gradient(#fff 0 3px,transparent 3px);opacity:.96;z-index:1}
.advd .knob{position:absolute;right:7px;top:50%;width:7px;height:7px;margin-top:-3px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff6 0 1px,#f2c14e 1.5px);box-shadow:0 0 0 2px #000}
.advd .n{position:relative;z-index:1;font:700 clamp(19px,3.3vw,36px) Silkscreen,ui-monospace,monospace;color:var(--nc);text-shadow:3px 3px 0 #0007;letter-spacing:1px;line-height:1}
.advd .ic{position:relative;z-index:1;width:clamp(14px,2vw,22px);height:clamp(14px,2vw,22px);fill:var(--ic);filter:drop-shadow(2px 2px 0 #0006);shape-rendering:crispEdges}
.advd.b22 .n{font-size:clamp(34px,6vw,70px)}
.advd.b22 .ic,.advd.b21 .ic,.advd.b12 .ic{width:clamp(18px,2.6vw,30px);height:clamp(18px,2.6vw,30px)}
.advd .lk{position:absolute;left:8px;bottom:7px;width:11px;height:9px;background:#e6e6e6;border:2px solid #000;z-index:2}
.advd .lk:before{content:'';position:absolute;left:1px;top:-8px;width:5px;height:6px;border:2px solid #000;border-bottom:0;border-radius:5px 5px 0 0;box-shadow:inset 0 0 0 1px #e6e6e6}
.advd .tg{position:absolute;right:-5px;top:9px;padding:3px 7px;background:#f2c14e;color:#5a0a14;font:700 9px Silkscreen,ui-monospace,monospace;letter-spacing:1px;border:2px solid #000;transform:rotate(6deg);z-index:4;box-shadow:2px 2px 0 #0007}
.advd .ck{position:absolute;right:5px;top:5px;width:20px;height:20px;border-radius:50%;background:#1f8a4c;color:#eaffef;border:2px solid #000;font:700 12px/20px ui-monospace,monospace;text-align:center;z-index:3}
.advd .dn{position:absolute;left:16px;top:5px;z-index:2;font:700 12px Silkscreen,ui-monospace,monospace;color:#ffe7a3;text-shadow:1px 1px 0 #000}
.advd .nm{position:absolute;z-index:2;left:14px;right:4px;bottom:5px;font:700 10px ui-monospace,monospace;color:#fff6e0;text-shadow:1px 1px 0 #000,0 0 4px #000;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.advd.red{--bg:radial-gradient(circle at 50% 50%,#ffffff14 0 1.5px,transparent 2px) 0 0/14px 14px,linear-gradient(135deg,#e04848,#a3202f 60%,#8a1826);--rim:#f2c14e;--nc:#fff6e0;--ic:#f2c14e}
.advd.grn{--bg:radial-gradient(circle at 30% 30%,#ffffff22 0 2.5px,transparent 3px) 0 0/16px 16px,linear-gradient(135deg,#34a862,#18683e);--rim:#e9f1f8;--nc:#fff6e0;--ic:#ffffff}
.advd.cane{--bg:repeating-linear-gradient(45deg,#f7efe2 0 9px,#d43a3a 9px 18px);--rim:#9c1c26;--nc:#9c1c26;--ic:#2d9a58}
.advd.cane .n{background:#f7efe2;padding:3px 8px;border:3px solid #9c1c26;text-shadow:none;box-shadow:3px 3px 0 #0004}
.advd.navy{--bg:radial-gradient(circle,#fff 0 1.2px,transparent 1.7px) 0 0/19px 19px,radial-gradient(circle,#fff8 0 .8px,transparent 1.3px) 9px 9px/19px 19px,linear-gradient(#24478e,#0f2148);--rim:#bfeaff;--nc:#ffe9a3;--ic:#bfeaff}
.advd.gold{--bg:radial-gradient(circle at 30% 25%,#fff7 0,transparent 40%),linear-gradient(135deg,#f8dc7c,#c9902a);--rim:#8e1424;--nc:#8e1424;--ic:#8e1424}
.advd.gold .n{text-shadow:2px 2px 0 #fff7}
.advd.plum{--bg:linear-gradient(90deg,transparent 45%,#f2c14e 45% 55%,transparent 55%),linear-gradient(transparent 45%,#f2c14e 45% 55%,transparent 55%),linear-gradient(135deg,#8e3a7c,#4a1440);--rim:#f2c14e;--nc:#fff6e0;--ic:#ffd96b}
.advd.d24 .fr{background:radial-gradient(circle at 50% 50%,#ffffff1a 0 32%,transparent 33%),linear-gradient(90deg,transparent 46%,#d43a3a 46% 54%,transparent 54%),linear-gradient(transparent 46%,#d43a3a 46% 54%,transparent 54%),radial-gradient(circle,#ffffff18 0 1.5px,transparent 2px) 0 0/15px 15px,linear-gradient(135deg,#2fa060,#145a33);box-shadow:inset 0 0 0 4px #f2c14e,inset 4px 4px 0 4px #ffffff22,inset -6px -6px 0 4px #0003}
.advd.d24 .n{color:#ffe9a3;background:#145a33;padding:6px 16px;border:4px solid #f2c14e;box-shadow:4px 4px 0 #0005}
.advd.d24 .eve{position:relative;z-index:1;margin-top:8px;padding:3px 8px;background:#8e1424;border:2px solid #000;font:700 clamp(9px,1.2vw,13px) Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#fff6e0}
.advd.d24 .ic{width:clamp(26px,3.5vw,42px);height:clamp(26px,3.5vw,42px);fill:#ffd96b;margin-bottom:4px}
/* locked: frosted over */
.advd.lock{cursor:not-allowed}
.advd.lock .fr{filter:saturate(.6) brightness(.8)}
.advd.lock .fr:after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 0 100%,#e9f4ffcc 0,#e9f4ff55 18%,transparent 36%),radial-gradient(circle at 100% 0,#e9f4ff88 0,transparent 22%);pointer-events:none}
/* ready: light spills out of the cracks */
.advd.rdy .fr{animation:advglow 1.7s ease-in-out infinite}
@keyframes advglow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.12)}}
.advd.rdy:before{content:'';position:absolute;inset:-3px;border-radius:2px;box-shadow:0 0 0 2px #ffd76a,0 0 16px 4px #ffcf5acc;animation:advhalo 1.7s ease-in-out infinite;pointer-events:none}
@keyframes advhalo{0%,100%{opacity:.35}50%{opacity:1}}
.advd.rdy:hover{transform:translateY(-3px)}
.advd.rdy:hover .lf{transform:rotateY(-16deg)}
.advd.open .lf{transform:rotateY(-112deg)}
.advd.done .lf,.advd.peek .lf{display:none}
.advd.done .in,.advd.peek .in{box-shadow:inset 0 0 0 3px #000,inset 9px 0 0 #7a4a2a,inset 12px 0 0 #000,inset 0 0 22px #000c}
.advd.done:hover .in img{transform:scale(1.08)}
.advd.peek .in{animation:advglow 1.6s ease-in-out infinite}
.advd.open .tg,.advd.peek .tg{display:none}
.advd.shake{animation:advshake .4s}
@keyframes advshake{20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.advd:focus-visible{outline:3px solid #6fd3ff;outline-offset:2px}
#advw .tip{position:fixed;z-index:5;padding:6px 10px;background:#000;color:#fff6e0;border:2px solid #f2c14e;font:700 11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none;white-space:nowrap;transform:translate(-50%,-100%);animation:advfade .15s}

/* the reveal */
#advr{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,#2a1a0acc,#050a18ee 70%);animation:advfade .3s}
#advr .rays{position:absolute;left:50%;top:50%;width:1100px;height:1100px;margin:-550px 0 0 -550px;background:repeating-conic-gradient(#ffe7a32a 0 8deg,transparent 8deg 22deg);-webkit-mask:radial-gradient(circle,#000 10%,transparent 60%);mask:radial-gradient(circle,#000 10%,transparent 60%);animation:advspin 14s linear infinite;pointer-events:none}
@keyframes advspin{to{transform:rotate(360deg)}}
#advr .card{position:relative;width:min(520px,94vw);max-height:94vh;overflow:auto;padding:0 0 18px;box-sizing:border-box;text-align:center;background:linear-gradient(#a3202f,#6e0f1c);border:4px solid #000;box-shadow:inset 0 0 0 3px #f2c14e,10px 10px 0 #0009,0 0 60px #ffcf5a55;animation:advpop .5s cubic-bezier(.2,1.5,.4,1)}
#advr .rib{margin:14px auto 0;display:inline-block;padding:4px 14px;background:#f2c14e;color:#5a0a14;border:2px solid #000;font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:2px;box-shadow:3px 3px 0 #0006}
#advr .stage{position:relative;margin:10px 14px 4px;height:min(330px,42vh);background:radial-gradient(ellipse 70% 60% at 50% 45%,#fff3c955,transparent 70%),radial-gradient(ellipse at 50% 100%,#3a0810,transparent 70%);border:3px solid #000;box-shadow:inset 0 0 0 2px #f2c14e55,inset 0 0 40px #0008;overflow:hidden}
#advr .stage canvas{display:block;width:100%;height:100%;cursor:grab;touch-action:none}
#advr .stage canvas.grab{cursor:grabbing}
#advr .hint{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);padding:4px 10px;background:#000a;border:2px solid #f2c14e88;color:#fff6e0;font:700 10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none;transition:opacity .4s;animation:advnudge 2s ease-in-out infinite;white-space:nowrap}
#advr .hint.gone{opacity:0}
@keyframes advnudge{0%,100%{margin-left:-8px}50%{margin-left:8px}}
#advr h3{position:relative;margin:8px 12px 4px;font:700 24px Silkscreen,ui-monospace,monospace;color:#fff6e0;text-shadow:2px 2px 0 #000}
#advr .cat{display:inline-flex;align-items:center;gap:6px;margin-bottom:8px;padding:3px 9px;background:#14301f;color:#bff5d0;border:2px solid #000;font:700 10px Silkscreen,ui-monospace,monospace;letter-spacing:1px}
#advr .cat .ic{width:12px;height:12px;fill:#f2c14e}
#advr p{position:relative;margin:0 18px 14px;color:#f6e2c4;font-size:13px;line-height:1.45}
#advr .cl{position:relative;display:block;width:max-content;max-width:90%;margin:14px auto 0;left:auto;right:auto;float:none;padding:13px 40px;background:linear-gradient(#3fd27a,#1f8a4c);color:#fff;border:3px solid #000;box-shadow:inset 0 -5px 0 #0005,inset 0 0 0 2px #b6ffd0,4px 4px 0 #0007;font:700 17px Silkscreen,ui-monospace,monospace;letter-spacing:2px;cursor:pointer;animation:advpulse 1.4s ease-in-out infinite}
#advr .cl:hover{filter:brightness(1.1)}
#advr .cl:disabled{animation:none;filter:none;cursor:default;background:linear-gradient(#f6d36b,#c9902a);color:#5a0a14;box-shadow:inset 0 -5px 0 #0003,inset 0 0 0 2px #fff6,4px 4px 0 #0007}
#advr .later{display:block;margin:10px auto 0;padding:4px 10px;background:none;border:0;color:#f6e2c4aa;font:12px ui-monospace,monospace;cursor:pointer;text-decoration:underline}
.advfly{position:fixed;z-index:95;pointer-events:none;will-change:transform;filter:drop-shadow(0 8px 6px #0008)}
.advcf{position:fixed;z-index:96;width:8px;height:12px;pointer-events:none;will-change:transform,opacity}

@media (max-width:640px){
 #advw .advf{padding:30px 10px 10px;height:96vh}
 #advw .hd{flex-wrap:wrap;gap:8px}
 #advw .sub{order:3;flex-basis:100%}
 #advw .moon{width:46px;height:46px}
 #advw .gw{padding:7px}
 #advw .grid{grid-template-columns:repeat(4,1fr);grid-template-rows:none;grid-auto-rows:minmax(76px,1fr);height:auto;gap:7px}
 .advd.m21{grid-column:span 2}
 #advw .holly{display:none}
 #advr .stage{height:min(280px,38vh)}
}
@media (prefers-reduced-motion:reduce){#advw *,#advb,#advr *{animation-duration:.01s!important;animation-iteration-count:1!important}.advd .lf{transition-duration:.2s}}
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
 const OC=['#ff4b4b','#f2c14e','#46e083','#3fa9ff','#ff7ad9','#ffffff'];
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
 function snow(n){let h='';for(let i=0;i<n;i++){const big=i%4==0,s=big?4+Math.random()*4:1.5+Math.random()*3;
  h+=`<i class="sn${big?' b':''}" style="left:${(Math.random()*100).toFixed(1)}%;width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;opacity:${(.45+Math.random()*.5).toFixed(2)};animation-duration:${(big?6+Math.random()*4:9+Math.random()*9).toFixed(1)}s;animation-delay:-${(Math.random()*18).toFixed(1)}s"></i>`}return h}
 function bulbs(n){const C=['#ff4b4b','#ffd23f','#3fa9ff','#46e083','#ff7ad9'];let h='';for(let i=0;i<n;i++)h+=`<i style="--c:${C[i%5]};--d:-${(Math.random()*1.8).toFixed(2)}s;--y:${(Math.sin(i*1.7)*3+6).toFixed(1)}px"></i>`;return h}
 const BOW='<svg class=bow viewBox="0 0 86 56" aria-hidden="true"><path d="M43 26C30 4 6 2 6 18s20 16 37 8z" fill="#d43a3a" stroke="#000" stroke-width="3"/><path d="M43 26C56 4 80 2 80 18S60 34 43 26z" fill="#d43a3a" stroke="#000" stroke-width="3"/><path d="M38 28L24 54h10l9-16 9 16h10L48 28z" fill="#b3202f" stroke="#000" stroke-width="3"/><rect x="35" y="18" width="16" height="16" rx="3" fill="#f2c14e" stroke="#000" stroke-width="3"/><path d="M14 14c4-3 10-2 14 2" stroke="#ff8a8a" stroke-width="3" fill="none"/></svg>';
 const HOLLY=c=>`<svg class="holly ${c}" viewBox="0 0 64 48" aria-hidden="true"><path d="M4 30c6-2 8-8 14-8 2 4 6 4 8 2 2 6 8 8 12 8-6 4-8 10-14 10-2-4-6-4-8-2-2-6-8-8-12-10z" fill="#2d8a4c" stroke="#000" stroke-width="2.5"/><path d="M30 26c4-6 10-6 14-12 2 4 6 6 10 4-2 6 0 12 4 16-6 0-12 4-16 8 0-4-4-8-8-8 0-4-2-6-4-8z" fill="#3aa35c" stroke="#000" stroke-width="2.5"/><circle cx="28" cy="22" r="5" fill="#e0242f" stroke="#000" stroke-width="2.5"/><circle cx="36" cy="18" r="5" fill="#e0242f" stroke="#000" stroke-width="2.5"/><circle cx="33" cy="27" r="5" fill="#e0242f" stroke="#000" stroke-width="2.5"/><circle cx="26" cy="20" r="1.5" fill="#fff9"/><circle cx="34" cy="16" r="1.5" fill="#fff9"/></svg>`;
 function render(){if(!W)return;
  W.querySelector('.st').textContent=status();
  const a=st()||{c:{}};W.querySelector('.orn').innerHTML=Array.from({length:24},(x,i)=>`<i class="${a.c[i+1]?'on':''}" style="--c:${OC[i%OC.length]}"></i>`).join('');
  W.querySelector('.tt').textContent=testOn()?'Test date '+new Date(now()).toDateString():'';
  W.querySelector('.grid').innerHTML=ORDER.map(doorHTML).join('')}
 function open(){
  if(!Sv())return;if(!visible())return;
  if(typeof mode!='undefined'&&mode!='play'&&mode!='menu')return;
  safe(()=>{$('ui').innerHTML=''},'ui');mode='menu';
  const ph=window.innerWidth<640;
  W=document.createElement('div');W.id='advw';W.setAttribute('role','dialog');W.setAttribute('aria-label','Advent calendar');
  W.innerHTML=`<div class=stars></div><div class=moon></div>${hills()}${snow(ph?40:90)}
  <div class=advf><div class=gar></div><div class=lights>${bulbs(ph?12:24)}</div>${BOW}${HOLLY('l')}${HOLLY('r')}
   <div class=hd><div class=ttl><h2>ADVENT CALENDAR</h2></div>
    <div class=sub><p>A free gift behind every door, 1 to 24 December. A new door opens every morning.</p><div class=prog><div class=orn></div><span class=st></span><span class=tt></span></div></div>
    <button type=button class=x aria-label=Close>X</button></div>
   <div class=gw><div class=grid></div></div>
   <div class=ft>Clothes, furniture, pets and one very special car. Missed a day? Open it any time in December.</div>
  </div>`;
  document.body.appendChild(W);
  W.querySelector('.x').onclick=()=>{sfx('click');close()};
  W.querySelector('.grid').addEventListener('click',e=>{const b=e.target.closest('.advd');if(b)tap(b,+b.dataset.d)});
  render()}
 function close(){if(REV)return endReveal(1);if(W){W.remove();W=null}if(typeof mode!='undefined'&&mode=='menu')mode='play'}
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
   ${view?'<button type=button class=cl disabled>&#10003; CLAIMED</button><button type=button class=later>Back to the calendar</button>':'<button type=button class=cl>CLAIM</button><button type=button class=later>Not now</button>'}</div>`;
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
   an.onfinish=()=>{if(!REV||REV.o!==o){fly.remove();return}cv.style.visibility='';REV.v=safe(()=>Viewer(cv,r.k),'viewer');fly.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}).onfinish=()=>fly.remove();if(!view)sparkle(stage,22)}});
  sfx('whoosh');if(!view)setTimeout(()=>jingle(),380);
  if(!view)o.querySelector('.cl').onclick=e=>claim(e.currentTarget);
  o.querySelector('.later').onclick=()=>{sfx('click');endReveal(1)};
  o.addEventListener('click',e=>{if(e.target===o)endReveal(1)})}

 function claim(cb){
  if(!REV||REV.done||REV.view)return;const {d}=REV;
  const r=give(d);
  if(!r){sfx('err');cb.textContent='TRY AGAIN';return}
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
  for(let i=0;i<70;i++){const s=document.createElement('i');s.className='advcf';const a=-Math.PI/2+(Math.random()-.5)*2.2,v=160+Math.random()*260;
   Object.assign(s.style,{left:cx+'px',top:cy+'px',background:C[i%C.length],borderRadius:i%3?'0':'50%'});document.body.appendChild(s);
   const dx=Math.cos(a)*v,dy=Math.sin(a)*v;
   s.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${360*Math.random()}deg)`,opacity:1,offset:.5},{transform:`translate(${dx*1.3}px,${dy+280}px) rotate(${720*Math.random()}deg)`,opacity:0}],{duration:1300+Math.random()*700,easing:'cubic-bezier(.15,.6,.4,1)'}).onfinish=()=>s.remove()}}

 /* Esc closes (the reveal first), and keeps the game's own Esc (pause) from firing underneath */
 addEventListener('keydown',e=>{if(!W)return;if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}
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
