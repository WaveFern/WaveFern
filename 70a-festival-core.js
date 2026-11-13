/* Part 1 of 3 (v50.0.1 split of 70-festival.js, code unchanged): schedule, helpers, tree clearing, stages, festival ground. 70b = board, crowds, walkers, phases, interactions; 70c = performing a set, frame loop, maps. Order 70a,70b,70c must stay. */
/* ===== v26.38.0: Park Fields Festival (every 7 days since v26.38.1) =====
   Every week (FEST_EVERY days, was every fortnight in v26.38.0) a Reading-style festival opens on the field east (right) of Park Avenue.
   - schedule: the festival is on every day that is a multiple of FEST_EVERY = 7 (day 7, 14, 21, ...). The day before, a crew builds it
     (fences going up, half-built stage frames, trucks, cones, workers); the day after, a crew takes it down again.
   - the ground (x 216-406, z -122..-4) is about the size of Central Park. Its wild trees are cleared once at boot (before
     the static city boxes are merged); everything else is built only when it is needed, in its own groups, so the field is
     empty grass on normal days. Geometry is merged per 60 m cell with the xg* helpers (40-city-fixes.js) with every face
     kept (G.all), because the stage camera looks at it from the other side than the normal view.
   - four stages, all facing south: 4 Fresh Fern Tent (Fame Level 10, pay x1.25), 3 The Pit (50, x1.5), 2 Riverside Stage
     (80, x1.75), 1 Main Stage (120, x2). Each has a crowd of instanced figures that fans out from the barrier, plus a
     "crowd carpet" of packed heads further back for big crowds, a few flags, and delay/light towers on the big stages.
   - performing (v26.39.0): you book a time slot (up to 4 in-game hours) on a stage on FestivalApp, a free app on your
     computer, at least 2 days before the festival, with a setlist of your songs and albums (71-festival-booking.js).
     On the day you walk to the steps of that stage during your slot and the set plays the setlist song by song. Short
     crowd minigames (Hype, Drop, Call and response, Lyrics, Hold the note) pop up at random gaps. Doing well brings
     more fans in (the crowd grows at the back), doing badly makes them leave. After each song you are paid
     FSONG_PAY ($0.08) x stage multiplier x people in the crowd, and the crowd streams that song (more monthly
     listeners tomorrow) and some of them follow you. The set ends when the last song ends or the slot is over.
   - during the set the camera stands behind you on the stage and looks out over the crowd (sky dome, haze, tree line,
     bubbles and light beams; the normal HUD is hidden). Only you are on stage, plus the featured artist while a collab
     song plays.
   - stage roofs, screens, delay towers and mix tents fade out when they hide you from the normal camera, like the
     city towers do.
   - food and drink: burger van, crepe van, taco van, candyfloss cart, popcorn cart and an open-air bar, about 1.4x the
     usual prices; food gives energy, drinks also refill stamina.
   - the world map, the minimap and the morning card show the festival; the map gets a taxi to the festival gate. */
const FEST={X0:216,X1:406,Z0:-122,Z1:-4,GZ:-64,ph:null,day:-1,grp:{},cols:[],ints:[],view:null,set:null,crowd:[],walk:[],work:[],lg:null,
 view3:null,acts:{},cleared:0,seen:{},t:0,fadeU:{}};
const FPAY=.4;/* dollars per person in the crowd at the end of the set, before the stage multiplier */
const FSTG=[
 {n:4,name:'Fresh Fern Tent',req:10,mult:1.25,cx:258,zb:-60,w:12,d:8,h:1,H:6,base:160,cap:450,figs:260,area:[246,-50,272,-16],col:'#2fae5a',tent:1},
 {n:3,name:'The Pit',req:50,mult:1.5,cx:296,zb:-60,w:16,d:9,h:1.3,H:8,base:1000,cap:3000,figs:450,area:[276,-49,316,-12],col:'#a24ae8'},
 {n:2,name:'Riverside Stage',req:80,mult:1.75,cx:280,zb:-121,w:22,d:11,h:1.6,H:11,base:5000,cap:12000,figs:700,area:[248,-108,314,-70],col:'#3a8ee0',tw:11,tz:24},
 {n:1,name:'Main Stage',req:120,mult:2,cx:364,zb:-121,w:32,d:13,h:1.9,H:15,base:20000,cap:60000,figs:1100,area:[324,-106,404,-14],col:'#e03a3a',tw:15,tz:36}];
FSTG.forEach(s=>{s.zf=s.zb+s.d;s.x0=s.cx-s.w/2;s.x1=s.cx+s.w/2;s.oz=s.zf+2.4;s.ex=[];
 if(s.tw){s.ex.push([s.cx-s.tw-2,s.zf+s.tz-2,s.cx-s.tw+2,s.zf+s.tz+2],[s.cx+s.tw-2,s.zf+s.tz-2,s.cx+s.tw+2,s.zf+s.tz+2],[s.cx-4.2,s.zf+s.tz-6.5,s.cx+4.2,s.zf+s.tz-1.5])}
 const n=Math.ceil(s.h/.3);s.ix=s.x1+.2+n*.36+1;s.iz=s.zb+2.2});
const fStage=n=>FSTG.find(s=>s.n==n);
/* the food and drink stalls: [key, name, x, z, facing (+1 east, -1 west), colour, kind, menu [name, price, energy, stamina?]] */
const FFOOD=[
 ['burger','Big Stack Burgers',219.6,-104,1,'#d8462b','van',[['Cheeseburger',12,16],['Double Stack Burger',18,24],['Loaded Fries',9,11]]],
 ['crepe','Crepe Escape',219.6,-94,1,'#f2a6c4','van',[['Lemon & Sugar Crepe',8,10],['Chocolate & Banana Crepe',11,14],['Strawberry Crepe',11,14]]],
 ['taco','Taco Loco',219.6,-84,1,'#f5b915','van',[['Three Tacos',13,18],['Loaded Nachos',10,12],['Churros',7,8]]],
 ['floss','Candyfloss Cart',240,-100,-1,'#ff7ac8','cart',[['Candyfloss',6,6],['Giant Candyfloss',9,9]]],
 ['pop','Popcorn Cart',240,-88,-1,'#e8463a','cart',[['Salted Popcorn',5,6],['Toffee Popcorn',7,8]]],
 ['bar','The Field Bar',223.2,-42,1,'#8a5a32','bar',[['Fizzy Lemonade',5,4,1],['Iced Tea',5,4,1],['Cola',4,4,1],['Berry Mocktail',8,6,1],['Bolt Bull Energy',9,12,1],['Bottle of Water',3,2,1]]]];
const FGREET={burger:'"Two patties, extra cheese, festival prices. Sorry!"',crepe:'"Fresh crepes, folded with love."',taco:'"Tacos! Hot sauce is free, at least."',
 floss:'"Spun right now, pink or blue, same price."',pop:'"Popping all day. Salty or sweet?"',bar:'"Cold drinks! It\'s a festival, so... yeah, the prices."'};
const FACTS=['Neon Ferns','Paper Satellites','Velvet Static','Kid Comet','Glass Harbour','Midnight Arcade','Sundown Riot','Honey Static','Polar Youth','Static Bloom','The Night Drives','Lowkey Lights','Saturn Kids','Mint Condition','Wild Signal','Dream Machine','Echo Valley','Coral Coast','Rooftop Radio','The Hollow Hours'];

/* ---- schedule ---- */
const FEST_EVERY=7;/* a festival every 7 days (v26.38.1; was 14) */
const festPhaseOf=d=>d>0&&d%FEST_EVERY==0?'fest':d%FEST_EVERY==FEST_EVERY-1?'build':d>FEST_EVERY&&d%FEST_EVERY==1?'down':null;
const festNext=d=>Math.ceil((d+(festPhaseOf(d)=='fest'?0:1))/FEST_EVERY)*FEST_EVERY;
const festPhase=()=>FEST.adm===S.day?'fest':festPhaseOf(S.day);/* v53.5.0: FEST.adm = the day an admin switched the festival on from the Teleport app */
/* festival progress for the current (or just finished) festival, saved with the game; old saves just start without it */
function festS(){const k=Math.round(S.day/FEST_EVERY);if(!S.fest||S.fest.k!==k||typeof S.fest.p!='object')S.fest={k,p:{}};return S.fest}
const festLv=()=>{try{return fameLevel()}catch(e){return 0}};
/* the crowd that turns up for you: grows 5.5% per fame level above the stage's requirement, up to the stage's capacity */
function festC0(st,song){const lv=festLv(),q=song?song.q||0:0;let c=Math.min(st.cap,st.base*Math.pow(1.055,Math.max(0,lv-st.req)));c*=.9+Math.min(.2,q/400);if(song&&song.ft)c*=1.15;return Math.max(20,Math.round(c))}

/* ---- small helpers ---- */
const fHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function fRng(seed){let a=seed>>>0||1;return()=>{a=Math.imul(a^a>>>15,a|1);a^=a+Math.imul(a^a>>>7,a|61);return((a^a>>>14)>>>0)/4294967296}}
function fTex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn(x,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;t.userData={c,x};return t}
function fPlane(tex,W,H,x,y,z,ry,par,basic){const m=new THREE.Mesh(new THREE.PlaneGeometry(W,H),basic===false?new THREE.MeshLambertMaterial({map:tex}):new THREE.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);m.rotation.y=ry||0;par.add(m);return m}
const FFONT='"Trebuchet MS",Verdana,"DejaVu Sans",sans-serif';
function fFit(x,t,max,size,w){let s=size;x.font='bold '+s+'px '+FFONT;while(x.measureText(t).width>w&&s>8){s--;x.font='bold '+s+'px '+FFONT}return s}
/* a sign: big title, optional small line, on a coloured board */
function fSignTex(t,sub,bg,fg,w,h){return fTex(w||512,h||128,(x,W,H)=>{x.fillStyle=bg||'#14121a';x.fillRect(0,0,W,H);x.strokeStyle=fg||'#fff';x.lineWidth=6;x.strokeRect(5,5,W-10,H-10);x.fillStyle=fg||'#fff';x.textAlign='center';x.textBaseline='middle';
 fFit(x,t,0,Math.round(H*(sub?.42:.55)),W-40);x.fillText(t,W/2,sub?H*.38:H/2);if(sub){fFit(x,sub,0,Math.round(H*.2),W-40);x.globalAlpha=.85;x.fillText(sub,W/2,H*.76);x.globalAlpha=1}})}
function fGroup(k){let g=FEST.grp[k];if(!g){g=FEST.grp[k]=new THREE.Group();g.visible=false;scene.add(g)}return g}
function fMerge(G,grp,mat){xgFlush(G,mat).forEach(m=>{scene.remove(m);grp.add(m)})}
const fAll=()=>{const G=xgNew();G.all=1;return G};
const fBox=(G,w,h,d,c,x,y,z,ry,tc)=>xgBox(G,w,h,d,c,x,y,z,ry,tc);
/* boxes in a local frame turned by ry; parts [w,h,d,col,lx,ly,lz,topCol] */
const fObj=(G,x,z,ry,parts)=>pkObj(G,x,z,ry,parts);
/* fade units (v26.39.0): a stage, a delay tower or a mix tent is merged on its own, with its own transparent materials,
   so it can fade out when it stands between the player and the normal camera (the same ray test as fadeT for towers).
   boxes are [x0,z0,x1,z1,top] */
function festFadeU(kind,boxes){const U={boxes,mats:[],o:1};(FEST.fadeU[kind]=FEST.fadeU[kind]||[]).push(U);return U}
function festFadeMerge(U,G,Gl,grp){const a=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true});fMerge(G,grp,a);U.mats.push(a);
 if(Gl){const b=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true});fMerge(Gl,grp,b);U.mats.push(b)}}
function festFadePlane(U,m){m.material.transparent=true;U.mats.push(m.material);return m}
function festStageBoxes(s){const{x0,x1,zb,zf,H,w}=s;if(s.tent)return[[x0-.9,zb-.3,x1+.9,zf+.9,H+1.8],[x0-4.1,zf+.5,x0-.7,zf+1.1,3.6]];
 const sw=Math.min(7,w*.3),sh=sw*.58,top=s.H*.55+sh/2+.3;return[[x0-1.9,zb-.4,x1+1.9,zf+2.1,H+.6],[x0-2.9-sw,zf-.1,x0-2.3,zf+.5,top],[x1+2.3,zf-.1,x1+2.9+sw,zf+.5,top]]}
function festFade(dt){const L=FEST.fadeU[FEST.ph];if(!L)return;const px=P.x,pz=P.z,on=!FEST.view&&!IN&&!HIN&&mode!='pc';
 L.forEach(U=>{let tg=1;if(on)for(const b of U.boxes){if(Math.abs((b[0]+b[2])/2-px)>70||Math.abs((b[1]+b[3])/2-pz)>70)continue;let lo=0,hi=1e9;
   const f=(p,a,c)=>{const t1=(a-p)/16,t2=(c-p)/16;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2))};f(px,b[0],b[2]);f(pz,b[1],b[3]);hi=Math.min(hi,(b[4]-1)/13);if(lo<hi){tg=.12;break}}
  if(U.o===tg)return;U.o+=(tg-U.o)*Math.min(1,dt*6);if(Math.abs(tg-U.o)<.01)U.o=tg;U.mats.forEach(m=>{m.opacity=U.o;m.depthWrite=U.o>.95})})}

/* ---- 1. clear the wild trees off the ground once, before the static boxes are merged ---- */
function festClear(){if(FEST.cleared)return;FEST.cleared=1;const{X0,X1,Z0,Z1}=FEST,inA=(x,z,m)=>x>X0-m&&x<X1+m&&z>Z0-m&&z<Z1+m;
 for(const k in SBC)SBC[k]=SBC[k].filter(e=>!(inA(e[4],e[6],1.5)&&e[0]<3&&e[2]<3));
 for(let i=cols.length-1;i>=0;i--){const c=cols[i];if(inA((c[0]+c[2])/2,(c[1]+c[3])/2,1)&&c[2]-c[0]<3&&c[3]-c[1]<3)cols.splice(i,1)}
 CTD.trees=CTD.trees.filter(t=>!inA(t[0],t[1],1.5));if(CTD.tree)CTD.tree=CTD.tree.filter(t=>!inA(t[0],t[1],1.5))}
{const f=flushSB;flushSB=function(){warpWorld();try{festClear()}catch(e){console.error('festClear',e)}f()}}

/* ---- 2. the stages ---- */
function festStageGeo(G,Gl,grp,st,kind){/* kind: 'fest' full stage, 'build' half-built, 'down' half taken down */
 const{cx,zb,zf,w,d,h,H,x0,x1}=st,full=kind=='fest',steel='#9aa0a8',blk='#17171c';
 const deck=(f)=>{fBox(G,w*f,h,d,'#1c1c21',x0+w*f/2,h/2,zb+d/2,0,'#33333b');for(let i=1;i<w*f/2;i++)fBox(G,.03,.005,d,'#2a2a31',x0+i*2,h+.003,zb+d/2)};
 if(kind=='down'&&st.n<=2)deck(.55);else if(kind=='build'&&st.n==1)deck(.6);else deck(1);
 /* stairs at the side, up to the deck from the back corner */
 if(full||kind=='build'&&st.n>2){const n=Math.ceil(h/.3);for(let i=0;i<n;i++)fBox(G,.36,(i+1)*h/n,2,'#55575e',x1+.2+(n-1-i)*.36+.18,(i+1)*h/n/2,zb+2.2,0,'#6b6e76')}
 if(st.tent){/* a striped marquee: posts, a pitched roof and white side walls */
  const r=kind=='fest'?1:0;const posts=[[x0-.6,zb],[x1+.6,zb],[x0-.6,zf+.6],[x1+.6,zf+.6],[cx,zb]];
  posts.forEach(p=>{if(kind=='down'&&p[0]!=cx)fBox(G,.14,.14,H,'#e8e8e8',p[0],.07,(zb+zf)/2+(p[0]<cx?-1:1));else fBox(G,.14,p[0]==cx?H+1.6:H,.14,'#e8e8e8',p[0],(p[0]==cx?H+1.6:H)/2,p[1])});
  if(r){const L=d+.8,half=w/2+.9,sl=Math.hypot(half,1.6),a=Math.atan2(1.6,half);
   for(let i=0;i<8;i++){const z=zb-.1+(i+.5)*L/8,c=i%2?'#ffffff':st.col;xgBoxR(G,sl,.06,L/8,c,cx-half/2,H+.8,z,0,0,a);xgBoxR(G,sl,.06,L/8,c,cx+half/2,H+.8,z,0,0,-a)}
   fBox(G,.06,H,d+.6,'#f4f4f0',x0-.6,H/2,zb+d/2+.3);fBox(G,.06,H,d+.6,'#f4f4f0',x1+.6,H/2,zb+d/2+.3);fBox(G,w+1.2,H,.06,'#f4f4f0',cx,H/2,zb-.05);
   /* scalloped valance over the front */
   for(let i=0;i<w+1;i++)fBox(G,.9,.35,.05,i%2?'#ffffff':st.col,x0-.1+i,H-.2,zf+.66)}
  else if(kind=='build'){for(let i=0;i<4;i++)fBox(G,w*.7,.25,.6,i%2?'#ffffff':st.col,cx,.13+i*.26,zf+4)}}
 else{const fr=full?1:kind=='build'?(st.n==1?.65:st.n==2?1:.8):(st.n==1?.4:st.n==2?.2:0);
  const cols4=[[x0-1.2,zb+.4],[x1+1.2,zb+.4],[x0-1.2,zf+.3],[x1+1.2,zf+.3]];
  /* towers (ground supports) at each corner, as scaffold: a column and cross braces */
  if(fr>0)cols4.forEach(([x,z])=>{const hh=H*fr;fBox(G,.5,hh,.5,steel,x,hh/2,z);for(let y=2;y<hh;y+=2.5)fBox(G,.08,.08,.5,'#c8ccd2',x,y,z)});
  if(full||kind=='build'&&st.n==2){/* roof and front truss */
   fBox(G,w+3.4,.5,d+1.6,'#26262c',cx,H+.25,zb+(d+1.6)/2-.3,0,'#3a3a42');fBox(G,w+3.4,.9,.7,steel,cx,H-.25,zf+.5);fBox(G,w+3.4,.9,.7,steel,cx,H-.25,zb+.4);
   for(let x=x0-1.4;x<x1+1.5;x+=1.2)xgBoxR(G,.06,1.2,.06,'#c8ccd2',x,H-.25,zf+.5,0,0,.7)}
  else if(kind=='build'&&st.n==1){/* truss sections waiting on the ground, one being lifted by the crane */
   for(let i=0;i<3;i++)fBox(G,10,.9,.7,steel,cx-8+i*1.3,.45+i*.9,zf+6+i*.9);fBox(G,12,.9,.7,steel,cx+4,H*.65+2,zf+.5)}
  if(full){fBox(G,w+2,H-h,.4,blk,cx,h+(H-h)/2,zb+.2);/* back wall */
   /* PA hangs at the front corners, side screens on scaffold, lights on the truss */
   [x0-1.2,x1+1.2].forEach(x=>{fBox(G,1.2,H*.42,1.2,'#121216',x,H*.62,zf+1.4);for(let y=H*.43;y<H*.83;y+=.7)fBox(G,1.22,.04,1.22,'#2b2b31',x,y,zf+1.4)});
   const sw=Math.min(7,w*.3),sh=sw*.58;[x0-2.6-sw/2,x1+2.6+sw/2].forEach(x=>{fBox(G,sw+.4,sh+.4,.4,'#0c0c0e',x,H*.55,zf+.2);fBox(G,.3,H*.55-sh/2,.3,steel,x-sw/2,(H*.55-sh/2)/2,zf+.2);fBox(G,.3,H*.55-sh/2,.3,steel,x+sw/2,(H*.55-sh/2)/2,zf+.2)});
   const LC=['#ff4a6a','#ffe066','#6ad5ff','#b07aff','#ffffff'];for(let x=x0-.6,i=0;x<x1+.7;x+=1.4,i++){fBox(Gl,.28,.28,.32,LC[i%LC.length],x,H-.95,zf+.6)}
   for(let x=x0;x<x1;x+=2.2)fBox(Gl,.22,.22,.22,'#fff5c8',x+1,H-.95,zb+3)}
  else if(fr>0){/* a few bare beams */fBox(G,w+2.4,.5,.5,steel,cx,H*fr,zf+.3);if(fr>.5)fBox(G,w+2.4,.5,.5,steel,cx,H*fr,zb+.4)}}
 if(full){/* stage furniture: drum riser and kit, amps, monitor wedges, a fan, the crowd barrier */
  fBox(G,Math.min(5,w*.3),.45,3,'#24242a',cx,h+.22,zb+2.4,0,'#2f2f36');
  xgPrism(G,.45,.45,.75,10,'#c23030',cx,h+.45,zb+2.6,{top:'#eeeeee'});xgPrism(G,.3,.3,.18,10,'#d8d8d8',cx-.8,h+.85,zb+2.9);xgPrism(G,.3,.3,.18,10,'#d8d8d8',cx+.8,h+.85,zb+2.9);
  xgPrism(G,.42,.42,.02,12,'#d9b54a',cx-1.1,h+1.55,zb+2.2);xgPrism(G,.42,.42,.02,12,'#d9b54a',cx+1.2,h+1.65,zb+2.1);fBox(G,.04,1.1,.04,'#888',cx-1.1,h+1,zb+2.2);fBox(G,.04,1.2,.04,'#888',cx+1.2,h+1.05,zb+2.1);
  [[cx-w*.33,'#222'],[cx+w*.33,'#222']].forEach(([x,c])=>{fBox(G,1.1,1.2,.7,c,x,h+.6,zb+3,0,'#333');fBox(G,.9,.9,.02,'#3a3a3a',x,h+.6,zb+3.36)});
  [-2.4,2.4].forEach(o=>xgBoxR(G,.8,.4,.5,'#141418',cx+o,h+.18,zf-.4,-.45,0,0));
  if(st.n<=2){xgPrism(G,.55,.55,.3,14,'#2a2a2a',x1-1.6,h+.75,zf-1.2,{top:'#3b3b3b'});fBox(G,.15,.5,.15,'#333',x1-1.6,h+.25,zf-1.2)}
  fBox(G,w+8,1.1,.45,'#b9bec6',cx,.55,st.zf+1.8,0,'#d5d9de');for(let x=x0-4;x<x1+4;x+=1)fBox(G,.05,1.1,.6,'#9aa0a8',x,.55,st.zf+1.8)}}

/* ---- 3. festival ground (fest day) ---- */
function festVan(G,Gl,grp,f){const[k,name,x,z,fc,col,kind]=f,ry=fc>0?0:Math.PI;
 if(kind=='van'){fObj(G,x,z,ry,[[2.1,2.2,4.4,col,0,1.5,0,dk(col,.85)],[2.05,.9,1.4,col,0,.85,2.7],[1.9,.7,.05,'#bfe3f5',0,1.55,3.42],[.05,.95,2.8,'#2a2a2a',1.06,1.75,-.3],[.5,.06,2.8,'#e8e8e8',1.3,1.25,-.3],
   [.62,.62,.28,'#151515',.9,.31,-1.4],[.62,.62,.28,'#151515',-.9,.31,-1.4],[.62,.62,.28,'#151515',.9,.31,2.5],[.62,.62,.28,'#151515',-.9,.31,2.5],[2.12,.12,4.42,'#eeeeee',0,.45,0]]);
  xgBoxR(G,1.1,.05,3.2,'#ffffff',x+fc*1.55,2.55,z-.3,0,0,-.35*fc);for(let i=0;i<4;i++)xgBoxR(G,1.11,.055,.4,col,x+fc*1.55,2.56,z-1.6+i*.8+.2,0,0,-.35*fc);
  const t=fSignTex(name,null,dk(col,.55),'#fff',512,96);fPlane(t,4,.75,x+fc*1.08,2.95,z-.3,fc>0?Math.PI/2:-Math.PI/2,grp)}
 else if(kind=='cart'){fObj(G,x,z,ry,[[1.3,1,2.2,col,0,.85,0,'#ffffff'],[.5,.5,.12,'#151515',.5,.25,-.7],[.5,.5,.12,'#151515',-.5,.25,-.7],[.5,.5,.12,'#151515',.5,.25,.7],[.5,.5,.12,'#151515',-.5,.25,.7],
   [.06,1.4,.06,'#cccccc',.6,2,-1],[.06,1.4,.06,'#cccccc',.6,2,1],[.06,1.4,.06,'#cccccc',-.6,2,-1],[.06,1.4,.06,'#cccccc',-.6,2,1]]);
  for(let i=0;i<6;i++)fObj(G,x,z,ry,[[1.6,.08,.42,i%2?'#ffffff':col,0,2.75,-1.05+i*.42]]);
  if(k=='floss')for(let i=0;i<5;i++){const a=i*1.3;xgPrism(G,.22,.12,.35,7,i%2?'#ff9ad5':'#9ad8ff',x+Math.cos(a)*.35,1.75,z+Math.sin(a)*.6)}
  else{fObj(G,x,z,ry,[[.9,.8,1.2,'#fff3c4',0,1.75,0,'#ffe9a0'],[.92,.08,1.22,col,0,2.18,0]]);for(let i=0;i<14;i++)fBox(G,.12,.1,.12,'#fff8dc',x+R(-.35,.35),1.5+R(0,.2),z+R(-.5,.5))}
  const t=fSignTex(name.replace(' Cart','').toUpperCase(),null,col,'#fff',512,96);fPlane(t,2.2,.42,x+fc*.67,1.05,z,fc>0?Math.PI/2:-Math.PI/2,grp)}
 else{/* the open-air bar: L-shaped counter, back bar, sail canopy on posts, festoon lights, standing tables */
  fBox(G,1,1.1,9,'#7a4a26',x,.55,z,0,'#a0683a');fBox(G,3.6,1.1,1,'#7a4a26',x-1.3,.55,z-4.5,0,'#a0683a');fBox(G,1.2,.12,9.2,'#b07a48',x+.1,1.12,z);
  fBox(G,.8,2.3,8,'#5a3a20',x-3.6,1.15,z,0,'#6b4a2e');for(let i=0;i<3;i++)fBox(G,.5,.04,7.6,'#3a2412',x-3.3,1.3+i*.45,z);
  for(let i=0;i<22;i++)fBox(G,.08,.24,.08,pick(['#3a8a3a','#c83a2a','#e8c84a','#5aa0e8','#f0f0f0']),x-3.25,1.47+(i%3)*.45,z-3.6+i*.34);
  fBox(G,.7,1.8,1.1,'#d8d8dc',x-3.4,.9,z+3.2,0,'#eeeeee');fBox(G,.02,1.2,.9,'#9ad8ff',x-3.04,1.1,z+3.2);
  [[x+2,z-5.5],[x+2,z+5.5],[x-4.6,z-5.5],[x-4.6,z+5.5]].forEach(p=>fBox(G,.14,3.6,.14,'#d8d8d8',p[0],1.8,p[1]));
  xgBoxR(G,6.4,.05,11,'#f6f2e6',x-1.3,3.4,z,0,0,.12);
  for(let i=0;i<12;i++){const zz=z-5.4+i*.98;fBox(Gl,.14,.14,.14,['#ffd36a','#ff8ad8','#8ae0ff','#fff2b0'][i%4],x+2,3.1-Math.sin(i/11*Math.PI)*.4,zz)}
  for(let i=0;i<4;i++){const tx=x+5.5+(i%2)*3,tz=z-3+(i>>1)*5;xgPrism(G,.38,.38,1.05,10,'#6b4a2e',tx,0,tz,{top:'#8a6a48'});fBox(G,.9,.06,.9,'#3a2a1a',tx,1.08,tz)}
  for(let i=0;i<5;i++){const sz=z-3.5+i*1.6;xgPrism(G,.2,.2,.75,8,'#333',x+1.2,0,sz,{top:'#c0392b'})}
  const t=fSignTex(name.toUpperCase(),'drinks · cold · festival prices',dk(col,.7),'#ffe9b0',512,128);fPlane(t,4.6,1.15,x+2.08,2.45,z,Math.PI/2,grp)}}
function festBuildFest(){const grp=fGroup('fest'),G=fAll(),Gl=fAll(),{X0,X1,Z0,Z1,GZ}=FEST;
 /* ground: worn grass in the arenas, metal trackway on the concourse and the food walkway */
 FSTG.forEach(s=>{const[a,b,c,d]=s.area;fBox(G,c-a+4,.01,d-b+3,'#7d9a4e',(a+c)/2,.006,(b+d)/2-1);fBox(G,s.w+10,.012,4.5,'#6f8a44',s.cx,.007,s.zf+3)});
 const track=(x0,z0,x1,z1)=>{fBox(G,x1-x0,.02,z1-z0,'#8d9488',(x0+x1)/2,.012,(z0+z1)/2);if(x1-x0>z1-z0)for(let x=x0+2.4;x<x1;x+=2.4)fBox(G,.06,.005,z1-z0,'#6d746a',x,.024,(z0+z1)/2);else for(let z=z0+2.4;z<z1;z+=2.4)fBox(G,x1-x0,.005,.06,'#6d746a',(x0+x1)/2,.024,z)};
 track(X0,GZ-3.5,322,GZ+3.5);track(225,-118,236,GZ-3.5);track(225,GZ+3.5,236,-8);track(317.5,-112,322,GZ-3.5);track(317.5,GZ+3.5,322,-8);
 /* the perimeter fence (steel mesh panels on blocks), with the main gate on Park Avenue */
 const panel=(x,z,along)=>{const w=3.4;if(along=='x'){fBox(G,w,.1,.08,'#c8ccd2',x,1.95,z);fBox(G,w,.08,.08,'#c8ccd2',x,.25,z);fBox(G,w-.1,1.7,.02,'#aeb4ba',x,1.1,z);fBox(G,.08,2,.08,'#c8ccd2',x-w/2,1,z);fBox(G,.5,.18,.3,'#7d7d7d',x-w/2,.09,z)}
  else{fBox(G,.08,.1,w,'#c8ccd2',x,1.95,z);fBox(G,.08,.08,w,'#c8ccd2',x,.25,z);fBox(G,.02,1.7,w-.1,'#aeb4ba',x,1.1,z);fBox(G,.08,2,.08,'#c8ccd2',x,1,z-w/2);fBox(G,.3,.18,.5,'#7d7d7d',x,.09,z-w/2)}};
 for(let x=X0+1.7;x<X1;x+=3.4){panel(x,Z0,'x');panel(x,Z1,'x')}for(let z=Z0+1.7;z<Z1;z+=3.4){panel(X1,z,'z');if(z<GZ-5||z>GZ+5)panel(X0,z,'z')}
 FEST.colsF=[[X0-.2,Z0-.2,X1+.2,Z0+.2],[X0-.2,Z1-.2,X1+.2,Z1+.2],[X1-.2,Z0,X1+.2,Z1],[X0-.2,Z0,X0+.2,GZ-4.6],[X0-.2,GZ+4.6,X0+.2,Z1]];
 /* the gate: two towers and a sign on both sides */
 [GZ-4.9,GZ+4.9].forEach(z=>{fBox(G,1,6,1,'#2b2b33',X0,3,z,0,'#ff6ad5');for(let y=.8;y<6;y+=1.2)fBox(G,1.02,.12,1.02,'#ff6ad5',X0,y,z)});fBox(G,.8,1.6,10.8,'#2b2b33',X0,5.6,GZ);
 FEST.colsF.push([X0-.6,GZ-5.4,X0+.6,GZ-4.4],[X0-.6,GZ+4.4,X0+.6,GZ+5.4]);
 const gt=fSignTex('PARK FIELDS FESTIVAL','4 stages · food · bar · every '+FEST_EVERY+' days','#2b1240','#ffe066',768,160);fPlane(gt,9.6,2,X0-.42,5.6,GZ,-Math.PI/2,grp);fPlane(gt,9.6,2,X0+.42,5.6,GZ,Math.PI/2,grp);
 /* info board just inside the gate */
 fBox(G,4.2,2.6,.2,'#2b2b33',220.5,2.1,GZ-6.2);fBox(G,.15,1.2,.15,'#2b2b33',219,.6,GZ-6.2);fBox(G,.15,1.2,.15,'#2b2b33',222,.6,GZ-6.2);FEST.colsF.push([218.3,GZ-6.5,222.7,GZ-5.9]);
 FEST.board=fTex(512,320,()=>{});festBoardDraw();fPlane(FEST.board,4,2.5,220.5,2.1,GZ-6.08,0,grp);
 /* stages */
 FSTG.forEach(s=>{const Gs=fAll(),Gsl=fAll(),U=festFadeU('fest',festStageBoxes(s)),fp=(...a)=>festFadePlane(U,fPlane(...a));festStageGeo(Gs,Gsl,grp,s,'fest');
  const bd=fTex(512,256,(x,W,H)=>{const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,dk(s.col,.35));g.addColorStop(1,'#0b0b12');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle=s.col;x.globalAlpha=.25;for(let i=0;i<9;i++){x.beginPath();x.arc(W/2,H*1.1,40+i*34,Math.PI,0);x.lineWidth=8;x.strokeStyle=s.col;x.stroke()}x.globalAlpha=1;
   x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';fFit(x,s.name.toUpperCase(),0,64,W-50);x.fillText(s.name.toUpperCase(),W/2,H*.42);x.font='bold 30px '+FFONT;x.fillStyle=s.col;x.fillText('STAGE '+s.n,W/2,H*.7)});
  if(!s.tent)fp(bd,s.w-1,(s.H-s.h)*.75,s.cx,s.h+(s.H-s.h)*.48,s.zb+.42,0,grp);else fp(bd,s.w-.4,s.H*.6,s.cx,s.h+s.H*.38,s.zb+.02,0,grp);
  const ban=fSignTex('STAGE '+s.n+' · '+s.name.toUpperCase(),null,'#0e0e14',s.col,768,96);if(!s.tent)fp(ban,s.w*.8,s.w*.8/8,s.cx,s.H-.25,s.zf+.86,0,grp);
  else fp(ban,s.w*.9,s.w*.9/8,s.cx,s.H+.55,s.zf+.7,0,grp);
  s.scr=fTex(256,148,()=>{});
  if(!s.tent){const sw=Math.min(7,s.w*.3),sh=sw*.58;[s.x0-2.6-sw/2,s.x1+2.6+sw/2].forEach(x=>fp(s.scr,sw,sh,x,s.H*.55,s.zf+.42,0,grp))}
  else{/* the tent has a small name board on legs at its front left corner */const bx=s.x0-2.4;fBox(Gs,3.4,2,.12,'#1a1a20',bx,2.6,s.zf+.78);fBox(Gs,.14,1.6,.14,'#555a60',bx-1.4,.8,s.zf+.78);fBox(Gs,.14,1.6,.14,'#555a60',bx+1.4,.8,s.zf+.78);fp(s.scr,3.2,1.85,bx,2.6,s.zf+.85,0,grp)}
  festFadeMerge(U,Gs,Gsl,grp);
  /* colliders: deck and stairs, barrier, screen legs */
  s.cols=[[s.x0-.7,s.zb-.3,s.x1+.7,s.zf+.75],[s.x1,s.zb+1.1,s.ix-1,s.zb+3.3],[s.x0-4,s.zf+1.55,s.x1+4,s.zf+2.05]];if(s.tent)s.cols.push([s.x0-4,s.zf+.6,s.x0-.8,s.zf+.95]);
  if(s.tw){[[s.cx-s.tw,s.zf+s.tz],[s.cx+s.tw,s.zf+s.tz]].forEach(([x,z])=>{/* delay tower with speakers and lights */const Gt=fAll(),Ut=festFadeU('fest',[[x-1.1,z-1.1,x+1.1,z+1.9,10.6]]);
    for(let y=0;y<10;y+=2.5){fBox(Gt,.15,2.5,.15,'#c8ccd2',x-.9,y+1.25,z-.9);fBox(Gt,.15,2.5,.15,'#c8ccd2',x+.9,y+1.25,z-.9);fBox(Gt,.15,2.5,.15,'#c8ccd2',x-.9,y+1.25,z+.9);fBox(Gt,.15,2.5,.15,'#c8ccd2',x+.9,y+1.25,z+.9);fBox(Gt,1.95,.1,1.95,'#aeb4ba',x,y+2.5,z)}
    fBox(Gt,1.4,2.2,1.2,'#141418',x,7.5,z+1.2);fBox(Gt,2.6,.2,2.6,'#2b2b33',x,10.1,z);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>fBox(Gt,.35,.35,.35,'#fff6d0',x+q[0]*1,10.4,z+q[1]*1));festFadeMerge(Ut,Gt,null,grp);s.cols.push([x-1.1,z-1.1,x+1.1,z+1.1])});
   /* front-of-house mix tent */
   const fz=s.zf+s.tz-4,Gf=fAll(),Uf=festFadeU('fest',[[s.cx-3.7,fz-2.4,s.cx+3.7,fz+2.4,3.5]]);fBox(Gf,7,.4,4.4,'#2b2b33',s.cx,3.2,fz);[[-3.3,-2],[3.3,-2],[-3.3,2],[3.3,2]].forEach(q=>fBox(Gf,.12,3,.12,'#cccccc',s.cx+q[0],1.5,fz+q[1]));fBox(Gf,4,1,1.2,'#1c1c22',s.cx,.5,fz,0,'#3a3a44');fBox(Gf,7.2,1,4.6,'#2b2b33',s.cx,.5,fz);
   festFadeMerge(Uf,Gf,null,grp);s.cols.push([s.cx-3.6,fz-2.3,s.cx+3.6,fz+2.3])}
  /* the stairs label */
  const L=lbl('Stage '+s.n+' · '+s.name+' · Fame Lv '+s.req,6);L.position.set(s.ix,3.2,s.iz);FEST.lg.add(L);FEST.colsF.push(...s.cols)});
 /* food, bar, portaloos, bins, picnic tables, flags along the concourse, mobile light towers */
 FFOOD.forEach(f=>{festVan(G,Gl,grp,f);const[k,,x,z,fc,,kind]=f;if(kind=='van')FEST.colsF.push([x-1.1,z-2.3,x+1.1,z+3.4]);else if(kind=='cart')FEST.colsF.push([x-.7,z-1.2,x+.7,z+1.2]);else FEST.colsF.push([x-.55,z-4.6,x+.55,z+4.6],[x-4.1,z-4.6,x-3.1,z+4])});
 for(let i=0;i<6;i++){const z=-28+i*2.6,x=240.2;fObj(G,x,z,0,[[1.4,2.4,1.3,'#2f6fd0',0,1.2,0,'#e8e8e8'],[.04,1.9,.9,'#5a8ae0',-.72,1,0],[.04,.08,.3,'#e8e8e8',-.74,1.2,.3]]);FEST.colsF.push([x-.7,z-.65,x+.7,z+.65])}
 for(let i=0;i<10;i++){const x=i<5?224.4:236.6,z=-112+(i%5)*24+R(-2,2);xgPrism(G,.32,.3,.9,8,pick(['#2f6b3a','#2f55a0','#8a8a8a']),x,0,z,{top:'#1f1f1f'})}
 for(let i=0;i<3;i++){const z=-115+i*3.2;fBox(G,2.2,.08,.8,'#8a6a48',230.5,.75,z);fBox(G,2.2,.06,.35,'#7a5a38',230.5,.45,z-.6);fBox(G,2.2,.06,.35,'#7a5a38',230.5,.45,z+.6);FEST.colsF.push([229.3,z-.9,231.7,z+.9])}
 const FC=['#ff4a6a','#ffe066','#6ad5ff','#b07aff','#2fe68a','#ff8a30','#ffffff'];
 for(let x=228;x<318;x+=9){[GZ-3.9,GZ+3.9].forEach((z,j)=>{fBox(G,.08,6,.08,'#cfd3d8',x,3,z);fBox(G,.03,1.6,.9,FC[(x/9+j*3|0)%FC.length],x,5,z+.5)})}
 [[244.5,-71],[244.5,-12],[403.5,-60],[250,-118.5],[314,-118.5]].forEach(([x,z])=>{fObj(G,x,z,0,[[1.4,.9,2.4,'#f5c400',0,.75,0,'#d9ad00'],[.12,8,.12,'#9aa0a8',0,4.6,0]]);fBox(G,1.6,.25,.3,'#2b2b33',x,8.6,z);
  [-.6,-.2,.2,.6].forEach(o=>fBox(Gl,.3,.3,.32,'#fff6d0',x+o,8.85,z));FEST.colsF.push([x-.75,z-1.25,x+.75,z+1.25])});
 fMerge(G,grp);fMerge(Gl,grp,new THREE.MeshBasicMaterial({vertexColors:true}));
 /* crowds, people walking about */
 FSTG.forEach(s=>festCrowdBuild(s));festWalkers()}
