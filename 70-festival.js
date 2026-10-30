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
const festPhase=()=>festPhaseOf(S.day);
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

/* ---- 4. the information board: today's line-up and what you can play ---- */
function festBoardDraw(){const t=FEST.board;if(!t)return;const x=t.userData.x,W=512,H=320,lv=festLv(),F=festS();x.fillStyle='#14121c';x.fillRect(0,0,W,H);x.fillStyle='#ffe066';x.textAlign='left';x.textBaseline='alphabetic';
 x.font='bold 30px '+FFONT;x.fillText('LINE-UP · DAY '+S.day,18,40);x.font='bold 19px '+FFONT;
 const k=festSlotAt(),m=festMins();
 FSTG.slice().reverse().forEach((s,i)=>{const y=86+i*56,p=F.p[s.n],bk=festBkOn(S.day,s.n),a=festAct(s),nk=k<0?(m<FSLOT[0][0]?0:-1):k+1<FSLOT.length?k+1:-1,na=nk>=0?festSlotAct(S.day,s.n,nk):null;
  x.fillStyle=s.col;x.fillRect(18,y-22,10,40);x.fillStyle='#fff';x.fillText('Stage '+s.n+' · '+s.name,38,y-4);x.font='15px '+FFONT;x.fillStyle='#c8c8d8';
  const t2=p?'You played '+(p.n||1)+' song'+((p.n||1)==1?'':'s')+' to '+p.c.toLocaleString()+' people, $'+p.pay.toFixed(2):bk&&!bk.st?'YOU play at '+fHM(FSLOT[bk.slot][0])+(a?' · now: '+a:''):
   (a?'Now: '+a:'Quiet')+(na?' · '+fHM(FSLOT[nk][0])+' '+(na.you?'YOU':na.name):'');
  fFit(x,t2,0,15,W-56);x.fillText(t2,38,y+16);x.font='bold 19px '+FFONT});
 x.font='13px '+FFONT;x.fillStyle='#ff9ad8';x.fillText('Want a slot? Book on FestivalApp, 2+ days ahead.',18,H-12);
 t.needsUpdate=true}
/* who is on each stage right now: your set, or the act booked for the current slot (null outside the slots) */
function festAct(s){if(FEST.set&&FEST.set.st===s)return S.artist||'You';const k=festSlotAt();if(k<0)return null;const a=festSlotAct(S.day,s.n,k);return a.you?S.artist||'You':a.name}
function festScreens(){FSTG.forEach(s=>{if(!s.scr)return;const a=festAct(s),me=FEST.set&&FEST.set.st===s,k=a+'|'+(me?FEST.set.song.title:'');if(s.scrK===k)return;s.scrK=k;const x=s.scr.userData.x,W=256,H=148;
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,dk(s.col,.5));g.addColorStop(1,'#08080c');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle=a?'#ff3b5c':'#555';x.fillRect(10,10,52,22);x.fillStyle='#fff';x.font='bold 15px '+FFONT;x.textAlign='left';x.fillText(a?'LIVE':'NEXT',18,27);
  const nk=festSlotAt()<0&&festMins()<FSLOT[0][0]?0:-1,n0=nk>=0?festSlotAct(S.day,s.n,0):null,big=a||(n0?(n0.you?S.artist||'You':n0.name):s.name);
  x.textAlign='center';x.textBaseline='middle';fFit(x,big,0,34,W-24);x.fillText(big,W/2,H*.52);const sub=me?'"'+FEST.set.song.title+'"':a?s.name:n0?'on at '+fHM(FSLOT[0][0]):'see you next festival';fFit(x,sub,0,16,W-24);x.fillStyle='#ffe066';x.fillText(sub,W/2,H*.8);x.textBaseline='alphabetic';s.scr.needsUpdate=true})}

/* ---- 5. crowds: instanced figures fanned out from the barrier, a carpet of heads behind them, flags ---- */
const FCR={};
function festCrowdGeo(){if(FCR.top)return;const mk=(fn)=>{const D=xgNew();D.all=1;const B=xgCell(D,30,30);fn((w,h,d,c,x,y,z)=>xgBox(D,w,h,d,c,x+30,y,z+30));return xgGeo(B).translate(-30,0,-30)};
 /* figures face -z (towards their stage) */
 FCR.top=mk(b=>b(.6,.6,.4,'#ffffff',0,.82,0));
 FCR.skin=mk(b=>{b(.52,.53,.3,'#3c4766',0,.26,0);b(.52,.52,.5,'#ffffff',0,1.38,0);b(.56,.34,.36,'#4a3020',0,1.56,.1)});
 FCR.arms=mk(b=>{b(.16,.5,.2,'#ffffff',-.39,-.25,0);b(.16,.5,.2,'#ffffff',.39,-.25,0)});
 FCR.flag=mk(b=>{b(.06,4.6,.06,'#9a9a9a',0,2.3,0);b(1.3,.85,.03,'#ffffff',.68,4.1,0)});
 FCR.mat=new THREE.MeshLambertMaterial({vertexColors:true});
 /* the packed crowd further back: a texture of heads and shoulders */
 FCR.ctex=fTex(64,64,(x)=>{x.fillStyle='#2a2430';x.fillRect(0,0,64,64);const C=['#f2c09a','#e0a878','#c68642','#8d5524','#5a3a24','#ffdbac'],T=['#ffffff','#e03a3a','#2f6fd0','#ffe066','#1d1d22','#2fae5a','#ff7ac8','#888888','#ff8a30'];
  for(let i=0;i<150;i++){const a=RI(0,62),b=RI(0,62);x.fillStyle=pick(T);x.fillRect(a,b+1,3,2);x.fillStyle=pick(C);x.fillRect(a+.5|0,b,2,2)}});
 FCR.ctex.magFilter=FCR.ctex.minFilter=THREE.NearestFilter;FCR.ctex.wrapS=FCR.ctex.wrapT=THREE.RepeatWrapping;FCR.cmat=new THREE.MeshLambertMaterial({map:FCR.ctex})}
const FSHIRT=['#ffffff','#ffffff','#1d1d22','#e03a3a','#2f6fd0','#ffe066','#2fae5a','#ff7ac8','#888888','#ff8a30','#6ad5ff','#b07aff','#f4e1c1','#5a3a24'],FSKIN=['#ffdbac','#f2c09a','#e0a878','#c68642','#8d5524','#5a3a24'];
function festCrowdBuild(s){festCrowdGeo();const rnd=fRng(fHash('crowd'+s.n)),J=(a)=>(rnd()-.5)*a,[ax0,az0,ax1,az1]=s.area,ox=s.cx,oz=s.oz,f=[],inEx=(x,z,m)=>s.ex.some(e=>x>e[0]-m&&x<e[2]+m&&z>e[1]-m&&z<e[3]+m);
 for(let r=1.2;f.length<s.figs&&r<180;r+=.74*(1+r/45)){const n=Math.max(3,Math.floor(Math.PI*r/(.74*(1+r/45))));for(let k=0;k<n&&f.length<s.figs;k++){const a=(k+.5+J(.5))/n*Math.PI,rr=r+J(.3),x=ox+Math.cos(a)*rr,z=oz+Math.sin(a)*rr;
  if(x<ax0+.4||x>ax1-.4||z<az0||z>az1-.4||inEx(x,z,.5))continue;f.push({x,z,r:rr,ry:Math.atan2(-(ox-x),-(oz-z))+J(.5),s:.88+rnd()*.2,ph:rnd()*6.28,arm:rnd()<.45?2.6+J(.6):J(.3),up:rnd(),dn:(rnd()*4)|0})}}
 f.sort((a,b)=>a.r-b.r);
 /* figures are split into 20 m tiles, each with its own instanced meshes and bounding sphere, so the normal camera
    only draws (and the tick only animates) the tiles in view; inside a tile figures keep the crowd order (nearest first) */
 const cr={s,f,tiles:[],grp:new THREE.Group(),C:0,shown:-1,hype:.4,ft:0},TS=20,tm={},col=new THREE.Color();
 f.forEach((p,i)=>{const k=Math.floor((p.x-ax0)/TS)+','+Math.floor((p.z-az0)/TS);(tm[k]=tm[k]||[]).push(i)});
 Object.keys(tm).forEach(k=>{const ids=tm[k];let cx=0,cz=0,rr=0;ids.forEach(i=>{cx+=f[i].x;cz+=f[i].z});cx/=ids.length;cz/=ids.length;ids.forEach(i=>{rr=Math.max(rr,Math.hypot(f[i].x-cx,f[i].z-cz))});
  const bs=new THREE.Sphere(new THREE.Vector3(cx,1,cz),rr+2.5),gq=g=>{const q=g.clone();q.boundingSphere=bs.clone();return q},
   T={ids,bs,k:-1,top:new THREE.InstancedMesh(gq(FCR.top),FCR.mat,ids.length),skin:new THREE.InstancedMesh(gq(FCR.skin),FCR.mat,ids.length),arms:new THREE.InstancedMesh(gq(FCR.arms),FCR.mat,ids.length)};
  ids.forEach((i,j)=>{col.set(FSHIRT[(rnd()*FSHIRT.length)|0]);T.top.setColorAt(j,col);T.arms.setColorAt(j,col);col.set(FSKIN[(rnd()*FSKIN.length)|0]);T.skin.setColorAt(j,col)});
  [T.top,T.skin,T.arms].forEach(m=>{m.frustumCulled=true;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.count=0;cr.grp.add(m)});cr.tiles.push(T)});
 /* carpet cells (2 x 2 m) beyond the last figure, nearest first; the draw range shows as many as the crowd needs */
 const rMax=f.length?f[f.length-1].r:0,cells=[];for(let x=ax0+1;x<ax1;x+=2)for(let z=az0+1;z<az1;z+=2){const r=Math.hypot(x-ox,z-oz);if(r>rMax-.5&&!inEx(x,z,1))cells.push([x,z,r])}cells.sort((a,b)=>a[2]-b[2]);
 const Pp=[],U=[],N=[],I=[];cells.forEach((c,i)=>{const y=1.45,u=(rnd()*4|0)*.25,v=(rnd()*4|0)*.25;Pp.push(c[0]-1,y,c[1]-1,c[0]+1,y,c[1]-1,c[0]+1,y,c[1]+1,c[0]-1,y,c[1]+1);U.push(u,v+.5,u+.5,v+.5,u+.5,v,u,v);N.push(0,1,0,0,1,0,0,1,0,0,1,0);const k=i*4;I.push(k,k+2,k+1,k,k+3,k+2)});
 if(cells.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setIndex(I);g.computeBoundingSphere();
  cr.carpet=new THREE.Mesh(g,FCR.cmat);cr.carpet.frustumCulled=false;cr.grp.add(cr.carpet);cr.cells=cells.length}
 /* a few flags held up in the crowd (not too many) */
 const nf=s.n==1?11:s.n==2?8:s.n==3?5:3;cr.flag=new THREE.InstancedMesh(FCR.flag,FCR.mat,nf);cr.flag.frustumCulled=false;cr.fl=[];
 for(let k=0;k<nf;k++){const idx=Math.min(f.length-1,Math.floor(f.length*(.12+.8*(k+.5)/nf))),p=f[idx];cr.fl.push({i:idx,x:p.x+.3,z:p.z,ph:rnd()*6,ry:rnd()*6});col.set(['#ff4a6a','#ffe066','#6ad5ff','#b07aff','#2fe68a','#ff8a30','#ffffff','#2f6fd0'][k%8]);cr.flag.setColorAt(k,col)}
 cr.grp.add(cr.flag);cr.carpetY=0;fGroup('fest').add(cr.grp);FEST.crowd.push(cr);s.cr=cr;cr.C=festAmbient(s);festCrowdPose(cr,0,1)}
/* people at a stage when you are not playing there */
function festAmbient(s){const k=festSlotAt(),r=fRng(fHash('amb'+S.day+':'+s.n+':'+k))();return Math.round(s.base*(.5+r*.35)*(k<0?.2:1))}
const FQ=new THREE.Quaternion(),FQ2=new THREE.Quaternion(),FV=new THREE.Vector3(),FSV=new THREE.Vector3(),FMX=new THREE.Matrix4(),FAX=new THREE.Vector3(1,0,0),FAY=new THREE.Vector3(0,1,0),FQ3=new THREE.Quaternion(),FAZ=new THREE.Vector3(0,0,1);
const FFR=new THREE.Frustum(),FPM=new THREE.Matrix4();
function festCrowdPose(cr,t,force,camr){const f=cr.f,n=Math.min(f.length,Math.max(0,Math.round(cr.C))),hy=cr.hype,live=FEST.set&&FEST.set.st===cr.s,bpm=live?2.1:1.6;
 if(n!==cr.shown){cr.shown=n;force=1;cr.tiles.forEach(T=>{let k=0;while(k<T.ids.length&&T.ids[k]<n)k++;T.k=k;T.top.count=T.skin.count=T.arms.count=k;T.top.visible=T.skin.visible=T.arms.visible=k>0});
  let k=0;cr.fl.forEach((q,j)=>{if(q.i<n){FV.set(q.x,0,q.z);FQ.setFromAxisAngle(FAY,q.ry);FSV.set(1,1,1);FMX.compose(FV,FQ,FSV);cr.flag.setMatrixAt(k,FMX);k++}});cr.flag.count=k;cr.flag.instanceMatrix.needsUpdate=true}
 if(cr.carpet){const need=Math.min(cr.cells,Math.max(0,Math.ceil((cr.C-f.length)/7.4)));if(need!==cr.need){cr.need=need;cr.carpet.geometry.setDrawRange(0,need*6)}cr.carpet.visible=need>0&&!!FEST.view}
 if(cr.carpet&&cr.carpet.visible){const y=Math.max(0,Math.sin(t*bpm*Math.PI))*.05*hy;if(Math.abs(y-cr.carpetY)>.004){cr.carpet.position.y=y;cr.carpetY=y}}
 if(camr){camr.updateMatrixWorld();FPM.multiplyMatrices(camr.projectionMatrix,camr.matrixWorldInverse);FFR.setFromProjectionMatrix(FPM)}
 cr.tiles.forEach(T=>{if(!T.k||!force&&camr&&!FFR.intersectsSphere(T.bs))return;
  /* v26.39.0: four dance styles (jumpers, swayers, arm-wavers, head-boppers), all livelier as the hype goes up; the
     whole crowd jumps together on the beat when it is really going off */
  for(let j=0;j<T.k;j++){const p=f[T.ids[j]],e=hy*(p.up<hy?1:.35),bt=t*bpm*Math.PI+p.ph*(live?.25:1),bo=Math.sin(bt),dn=p.dn;let jump,ry=p.ry,x=p.x,az=0,
    arm=p.up<hy*.9?2.75+Math.sin(t*3+p.ph)*.25:p.arm*(hy>.3?1:.4);
   if(dn==1){const sw=Math.sin(bt*.5);jump=Math.abs(bo)*.05*(.3+e);ry+=sw*.4*(.3+e);x+=sw*.1*e}
   else if(dn==2){jump=Math.max(0,bo)*(.03+.12*e);if(hy>.3){arm=2.85;az=Math.sin(t*2.2+p.ph)*.55*(.4+e)}}
   else if(dn==3){jump=Math.max(0,bo)*.05+(hy>.7&&bo>.85?.12:0)}
   else jump=Math.max(0,bo)*(.04+.26*e);
   if(hy>.8&&live)jump=Math.max(jump,Math.max(0,Math.sin(t*bpm*Math.PI))*.3);
   FQ.setFromAxisAngle(FAY,ry);FSV.set(p.s,p.s,p.s);FV.set(x,jump,p.z);FMX.compose(FV,FQ,FSV);T.top.setMatrixAt(j,FMX);T.skin.setMatrixAt(j,FMX);
   FQ2.setFromAxisAngle(FAX,arm);if(az){FQ3.setFromAxisAngle(FAZ,az);FQ2.premultiply(FQ3)}FQ2.premultiply(FQ);FV.y=jump+1.04*p.s;FMX.compose(FV,FQ2,FSV);T.arms.setMatrixAt(j,FMX)}
  T.top.instanceMatrix.needsUpdate=T.skin.instanceMatrix.needsUpdate=T.arms.instanceMatrix.needsUpdate=true;
  if(force&&T.top.instanceColor)T.top.instanceColor.needsUpdate=T.skin.instanceColor.needsUpdate=T.arms.instanceColor.needsUpdate=true});
 if(cr.flag.count){let k=0;cr.fl.forEach(q=>{if(q.i<n){FQ.setFromAxisAngle(FAY,q.ry+Math.sin(t*1.3+q.ph)*.5);FSV.set(1,1,1);FV.set(q.x,Math.max(0,Math.sin(t*bpm*Math.PI+q.ph))*.15*hy,q.z);FMX.compose(FV,FQ,FSV);cr.flag.setMatrixAt(k++,FMX)}});cr.flag.instanceMatrix.needsUpdate=true}}

/* ---- 6. festival-goers walking about, and the crew on build / take-down days ---- */
const fCfg=()=>({skin:RI(0,5),eyes:RI(0,4),mouth:RI(0,3),hair:RI(0,11),hc:RI(0,11),top:RI(0,4),tc:RI(0,9),pc:RI(0,7),body:Math.random()});
function festWalkers(){const grp=fGroup('fest'),L=[[1,FEST.GZ-1.5,220,316],[1,FEST.GZ+1.5,220,316],[1,FEST.GZ,230,316],[0,229,-116,-10],[0,232,-116,-10],[0,230.5,-70,-12],[0,320,-110,-10],[0,319,-108,-12],[1,FEST.GZ-2.5,236,316],[0,233,-112,-70]];
 L.forEach(([ax,c,a,b])=>{const o=buildChar(fCfg());grp.add(o.g);FEST.walk.push({o,ax,c,a,b,p:R(a,b),dir:Math.random()<.5?1:-1,sp:R(.9,1.4),t:R(0,6)})})}
function festWorker(grp,x,z,ry,job){const o=buildChar(Object.assign(fCfg(),{body:.5}));o.g.position.set(x,0,z);o.g.rotation.y=ry;
 B(o.g,.66,.46,.45,'#ff8c1a',0,.86,0);B(o.g,.67,.06,.46,'#e8e8e8',0,.78,0);B(o.g,.67,.06,.46,'#e8e8e8',0,.98,0);B(o.g,.62,.15,.62,job=='lift'?'#ffffff':'#ffd21a',0,1.77,0);B(o.g,.72,.04,.72,job=='lift'?'#ffffff':'#ffd21a',0,1.7,.04);
 if(job=='hammer')B(o.arms[1],.08,.08,.5,'#6b4a2e',0,-.55,.22);grp.add(o.g);FEST.work.push({o,job,ph:R(0,6)})}
function festBuildWorks(kind){const grp=fGroup(kind),G=fAll(),Gl=fAll(),{X0,X1,Z0,Z1,GZ}=FEST,rnd=fRng(fHash('works'+kind)),RR=(a,b)=>a+rnd()*(b-a),cols=[];
 FSTG.forEach(s=>{const Gs=fAll(),U=festFadeU(kind,festStageBoxes(s).slice(0,1));festStageGeo(Gs,Gl,grp,s,kind);if(kind=='build'&&s.n==1)U.boxes.push([s.cx-10,s.zf+5,s.cx+12,s.zf+9,4]);festFadeMerge(U,Gs,null,grp)});
 FSTG.forEach(s=>cols.push([s.x0-.7,s.zb-.3,s.x1+.7,s.zf+.75]));
 if(kind=='down')FSTG.forEach(s=>{const[a,b,c,d]=s.area;fBox(G,c-a+4,.01,d-b+3,'#8a8a50',(a+c)/2,.006,(b+d)/2-1);for(let i=0;i<14;i++)xgPrism(G,RR(1.5,4),RR(1.5,4),.012,9,'#7a6038',RR(a,c),.008,RR(b,d))});
 /* fence: on build day it is going up from the gate, on take-down day most panels are stacked */
 const pan=(x,z,ax)=>{if(ax=='x'){fBox(G,3.3,1.7,.02,'#aeb4ba',x,1.1,z);fBox(G,3.4,.08,.08,'#c8ccd2',x,1.95,z);fBox(G,.5,.18,.3,'#7d7d7d',x-1.7,.09,z)}else{fBox(G,.02,1.7,3.3,'#aeb4ba',x,1.1,z);fBox(G,.08,.08,3.4,'#c8ccd2',x,1.95,z);fBox(G,.3,.18,.5,'#7d7d7d',x,.09,z-1.7)}};
 const frac=kind=='build'?.55:.25;for(let x=X0+1.7;x<X0+(X1-X0)*frac;x+=3.4)pan(x,Z1,'x');for(let z=Z1-1.7;z>Z1-(Z1-Z0)*frac;z-=3.4)if(z<GZ-5||z>GZ+5)pan(X0,z,'z');
 const stack=(x,z)=>{for(let i=0;i<8;i++)fBox(G,3.4,.06,2,i%2?'#aeb4ba':'#c8ccd2',x,.15+i*.07,z);fBox(G,3.5,.12,1.2,'#a07a48',x,.06,z)};
 [[240,GZ-8],[300,-118],[330,-8],[380,-60],[260,-8]].forEach(p=>{stack(p[0],p[1]);cols.push([p[0]-1.8,p[1]-1.1,p[0]+1.8,p[1]+1.1])});
 /* trucks (articulated lorries), a forklift, a cherry picker or skips, cones, cable drums, pallets, portaloos for the crew */
 const truck=(x,z,ry,col,load)=>{fObj(G,x,z,ry,[[2.5,2.8,2.4,col,0,1.9,5.6,dk(col,.85)],[2.3,1,.05,'#bfe3f5',0,2.6,6.81],[2.6,3.2,11,'#e8e8ec',0,2.3,-1.2,'#d8d8de'],[2.62,.5,11,dk(col,.9),0,.6,-1.2],
   [.9,.9,.4,'#151515',1.2,.45,5.4],[.9,.9,.4,'#151515',-1.2,.45,5.4],[.9,.9,.4,'#151515',1.2,.45,-5],[.9,.9,.4,'#151515',-1.2,.45,-5],[.9,.9,.4,'#151515',1.2,.45,-3.8],[.9,.9,.4,'#151515',-1.2,.45,-3.8]]);
  const c=Math.cos(ry),s=Math.sin(ry);cols.push([x-Math.abs(c)*1.4-Math.abs(s)*6.8,z-Math.abs(s)*1.4-Math.abs(c)*6.8,x+Math.abs(c)*1.4+Math.abs(s)*6.8,z+Math.abs(s)*1.4+Math.abs(c)*6.8])};
 truck(300,GZ,Math.PI/2,'#d8462b');truck(352,-92,0,'#2f6fd0');truck(258,-92,0,'#2fae5a');truck(290,-30,Math.PI,'#f5b915');
 /* tail-lift text on each trailer */
 [[300,GZ,Math.PI/2],[352,-92,0],[258,-92,0],[290,-30,Math.PI]].forEach(([x,z,ry])=>{const t=fSignTex('STAGECRAFT',kind=='build'?'festival build crew':'load-out crew','#e8e8ec','#c0392b',512,128);const c=Math.cos(ry),s=Math.sin(ry);fPlane(t,7,1.7,x+c*1.32,2.4,z-s*1.32,ry+Math.PI/2,grp)});
 fObj(G,330,-70,.4,[[1.4,1.2,2.2,'#f5c400',0,.9,0,'#d9ad00'],[.1,3,.1,'#333',.5,1.5,1.1],[.1,3,.1,'#333',-.5,1.5,1.1],[1.2,.08,1,'#a07a48',0,.9,1.8],[.6,.6,.25,'#151515',.6,.3,-.6],[.6,.6,.25,'#151515',-.6,.3,-.6]]);cols.push([328.8,-71.6,331.2,-68.4]);
 if(kind=='build'){/* a mobile crane lifting the main stage truss */
  fObj(G,386,-100,0,[[3,1.6,7,'#f5c400',0,1.4,0,'#d9ad00'],[2.4,1.6,2,'#f5c400',0,2.8,-1.5]]);xgBoxR(G,.6,20,.6,'#f5c400',383,10,-102,.45,0,.35);fBox(G,.05,9,.05,'#222',378,10.5,-106);cols.push([384.4,-103.6,387.6,-96.4])}
 else for(let i=0;i<3;i++){const x=250+i*50,z=-12;fObj(G,x,z,0,[[4,1.4,2,'#e0a020',0,.9,0],[4.2,.1,2.2,'#c08010',0,1.62,0]]);for(let k=0;k<9;k++)xgPrism(G,.35,.2,.55,6,pick(['#1d1d22','#2a2a2a','#3a5a3a']),x+RR(-1.6,1.6),1.5,z+RR(-.7,.7));cols.push([x-2.1,z-1.1,x+2.1,z+1.1])}
 for(let i=0;i<46;i++){const x=i<20?222+i*4.8:RR(250,400),z=i<20?GZ+(i%2?3.8:-3.8):RR(-110,-10);if(festInStage(x,z,2))continue;xgPrism(G,.24,.03,.6,8,'#ff6a1a',x,0,z);fBox(G,.42,.04,.42,'#222',x,.02,z);xgPrism(G,.16,.12,.1,8,'#f0f0f0',x,.28,z)}
 for(let i=0;i<6;i++){const x=RR(250,390),z=RR(-100,-20);if(festInStage(x,z,2))continue;fObj(G,x,z,RR(0,3),[[.2,1.3,1.3,'#7a5a38',-.5,.65,0],[.2,1.3,1.3,'#7a5a38',.5,.65,0],[.85,.95,.95,'#1d1d22',0,.65,0]])}
 for(let i=0;i<10;i++){const x=RR(235,400),z=RR(-112,-12);if(festInStage(x,z,2))continue;fBox(G,1.2,.15,1,'#b08a58',x,.08,z);if(rnd()<.6)fBox(G,1.1,RR(.3,.9),.9,pick(['#2b2b33','#555','#c0392b','#e8e8e8']),x,.5,z)}
 for(let i=0;i<3;i++){const z=-24+i*2.2,x=240;fObj(G,x,z,0,[[1.4,2.4,1.3,'#2f6fd0',0,1.2,0,'#e8e8e8']]);cols.push([x-.7,z-.65,x+.7,z+.65])}
 /* site office cabin with a sign */
 fObj(G,232,GZ-12,0,[[6,2.6,2.6,'#e8e8ec',0,1.4,0,'#c8c8d0'],[1,1.9,.05,'#2a6fd0',1.5,1.1,1.31],[1.6,.9,.05,'#bfe3f5',-1.3,1.6,1.31],[6.2,.2,2.8,'#9a9aa2',0,.1,0]]);cols.push([228.9,GZ-13.4,235.1,GZ-10.6]);
 const so=fSignTex(kind=='build'?'SITE OFFICE':'SITE OFFICE',kind=='build'?'festival opens tomorrow':'load-out in progress','#ffe066','#14121a',512,128);fPlane(so,3,.75,232,2.4,GZ-10.66,0,grp);
 const gs=fSignTex(kind=='build'?'PARK FIELDS FESTIVAL':'THANKS FOR COMING!',kind=='build'?'opens tomorrow · Day '+festNext(S.day):'next festival · Day '+festNext(S.day),'#2b1240','#ffe066',768,160);FEST.workSign=FEST.workSign||{};
 fBox(G,.3,3,.3,'#555',X0-1,1.5,GZ-3);fBox(G,.3,3,.3,'#555',X0-1,1.5,GZ+3);FEST.workSign[kind]=fPlane(gs,6,1.25,X0-1.2,2.6,GZ,-Math.PI/2,grp);fPlane(gs,6,1.25,X0-.8,2.6,GZ,Math.PI/2,grp);
 fMerge(G,grp);fMerge(Gl,grp,new THREE.MeshBasicMaterial({vertexColors:true}));
 /* the crew */
 const W=kind=='build'?[[350,-104,0,'hammer'],[372,-104,0,'hammer'],[363,-98,Math.PI,'lift'],[274,-106,0,'hammer'],[286,-106,.3,'carry'],[296,-48,Math.PI,'hammer'],[258,-48,Math.PI,'carry'],[300,GZ+3,Math.PI,'lift'],[226,GZ+2,1.5,'hammer'],[235,GZ-9,0,'lift'],[352,-82,Math.PI,'carry'],[330,-67,Math.PI,'carry']]
  :[[352,-104,0,'carry'],[376,-104,0,'hammer'],[363,-98,Math.PI,'lift'],[278,-106,0,'carry'],[296,-48,Math.PI,'hammer'],[262,-46,Math.PI,'carry'],[300,GZ+3,Math.PI,'lift'],[235,GZ-9,0,'lift'],[252,-14,Math.PI,'carry'],[300,-14,Math.PI,'carry']];
 FEST['work_'+kind]=[];const w0=FEST.work.length;W.forEach(w=>festWorker(grp,w[0],w[1],w[2],w[3]));FEST['work_'+kind]=FEST.work.slice(w0);
 FEST['cols_'+kind]=cols}
const festInStage=(x,z,m)=>FSTG.some(s=>x>s.x0-3-m&&x<s.x1+3+m&&z>s.zb-1-m&&z<s.zf+3+m);

/* ---- 7. which phase is showing: groups, colliders, interactions, map marker ---- */
function festApply(ph){FEST.ph=ph;FEST.day=S.day;
 if(ph=='fest'&&!FEST.grp.fest)festBuildFest();if((ph=='build'||ph=='down')&&!FEST['cols_'+ph])festBuildWorks(ph);
 ['fest','build','down'].forEach(k=>{if(FEST.grp[k])FEST.grp[k].visible=k==ph});FEST.lg.visible=ph=='fest';
 FEST.cols.forEach(c=>{const i=cols.indexOf(c);if(i>=0)cols.splice(i,1)});FEST.cols=ph=='fest'?FEST.colsF.slice():ph?FEST['cols_'+ph].slice():[];FEST.cols.forEach(c=>cols.push(c));
 if(ph=='fest'){FSTG.forEach(s=>{if(s.cr){s.cr.C=festAmbient(s);s.cr.shown=-1}});festBoardDraw()}
 if(ph&&FEST.workSign&&FEST.workSign[ph]){/* the gate sign names the right day */const m=FEST.workSign[ph];const t=fSignTex(ph=='build'?'PARK FIELDS FESTIVAL':'THANKS FOR COMING!',ph=='build'?'opens tomorrow · Day '+festNext(S.day):'next festival · Day '+festNext(S.day),'#2b1240','#ffe066',768,160);m.material.map.dispose();m.material.map=t;m.material.needsUpdate=true}
 festPoi()}
function festPoi(){let p=POIS.find(q=>q.fest);if(!p){p=[FEST.X0+14,FEST.GZ-2,'',"#ff6ad5"];p.fest=1;POIS.push(p)}const ph=FEST.ph;
 p[2]=ph=='fest'?'Festival · ON TODAY':ph=='build'?'Festival · opens tomorrow':ph=='down'?'Festival ground':'Festival ground · Day '+festNext(S.day)}
/* one check per frame: did the day change? */
function festSync(){if(!FEST.lg){FEST.lg=new THREE.Group();scene.add(FEST.lg)}const ph=festPhase();if(ph!==FEST.ph||S.day!==FEST.day){festApply(ph);festNotice()}}
function festNotice(){if(FEST.seen[S.day]||mode=='load'||mode=='creator'||!S.artist)return;FEST.seen[S.day]=1;const ph=FEST.ph;
 if(ph=='fest'){const b=fBk().find(q=>q.day==S.day&&!q.st);setTimeout(()=>say('Park Fields Festival is on today, east of Park Avenue!'+(b?' You play Stage '+b.n+' at '+fHM(FSLOT[b.slot][0])+'.':' 4 stages, food and a bar.')),1200)}
 else if(ph=='build')setTimeout(()=>say('A crew is building Park Fields Festival east of Park Avenue. It opens tomorrow (Day '+festNext(S.day)+').'),1200)}

/* ---- 8. interactions ---- */
function festInts(){const a=[],ph=FEST.ph;if(!ph||IN||HIN)return a;if(P.x<FEST.X0-12||P.x>FEST.X1+6||P.z<FEST.Z0-6||P.z>FEST.Z1+6)return a;
 if(ph=='fest'){FSTG.forEach(s=>{a.push({x:s.ix,z:s.iz,r:2.2,l:festStageLabel(s),a:()=>festStageUse(s.n)})});
  FFOOD.forEach(f=>{const[k,name,x,z,fc,,kind]=f;a.push({x:kind=='bar'?x+2.4:x+fc*(kind=='van'?2.4:1.6),z:kind=='van'?z-.3:z,r:kind=='bar'?3:2,l:(kind=='bar'?'Order at ':'Buy at ')+name,a:()=>festShop(k)})});
  a.push({x:220.5,z:FEST.GZ-4.6,r:2,l:'Read the line-up board',a:festInfo})}
 else a.push({x:232,z:FEST.GZ-9.4,r:2.4,l:'Talk to the site manager',a:()=>{snd('pop');say(ph=='build'?'Site manager: "Stages go up today. Gates open tomorrow, Day '+festNext(S.day)+'. Bring your best songs!"':'Site manager: "That\'s a wrap! Taking it all down. Next festival is Day '+festNext(S.day)+'."')}});
 return a}
{const d0=dynInt;dynInt=function(){const a=d0();try{return a.concat(festInts())}catch(e){return a}}}
function festShop(k){const f=FFOOD.find(q=>q[0]==k);if(!f)return;GR=f[1]+': '+FGREET[k];
 shopModal(f[1]+' <small class=m>· festival prices</small>',()=>f[7].map(m=>[m[0],m[1],'+'+m[2]+' energy'+(m[3]?' · refills stamina':'')+' <span style="opacity:.6">· about $'+Math.round(m[1]/1.4)+' in town</span>']),i=>{const m=f[7][i];
  if(S.money<m[1]){snd('err');return say('Not enough money for that.')}if(!m[3]&&S.energy>=100){snd('err');return say('You are already full of energy.')}
  S.money=+(S.money-m[1]).toFixed(2);S.energy=Math.min(100,S.energy+m[2]);if(m[3]){S.stam=100;S.exh=0}updateVersion();snd('eat');say((m[3]?'Refreshing! ':'Yum! ')+m[0]+' · +'+m[2]+' energy')})}
function festInfo(){snd('pop');mode='menu';const lv=festLv(),F=festS(),k=festSlotAt();
 $('ui').innerHTML=`<div class="box modal"><h2>Park Fields Festival · Day ${S.day}</h2><p class=m>You are Fame Level ${lv}. ${clk()} now. To play, book a slot on <b>FestivalApp</b> (free, on your computer) at least 2 days before a festival.</p>
  <div style="max-height:52vh;overflow:auto">${FSTG.slice().reverse().map(s=>{const p=F.p[s.n];
  return`<div class=ng style="display:block"><b style="color:${s.col}">Stage ${s.n}</b> · ${s.name} <small class=m>· Fame Level ${s.req} · pay x${s.mult}${p?' · you played to '+p.c.toLocaleString()+' people for '+$$(p.pay):''}</small><br>
   <small>${FSLOT.map((sl,i)=>{const a=festSlotAct(S.day,s.n,i),now=i==k;return`<span style="display:inline-block;margin:2px 10px 0 0;${now?'color:#ffe066;font-weight:bold':a.you?'color:#2fe68a;font-weight:bold':'opacity:.8'}">${fHM(sl[0])} ${esc(a.you?'YOU':a.name)}${now?' (now)':''}</span>`}).join('')}</small></div>`}).join('')}</div>
  <p class=m><small>Food and drinks are about 1.4x the usual price. Performing takes 15 energy.</small></p><button onclick="closeUI()">Close</button></div>`}

/* ---- 9. performing a booked set (v26.39.0) ----
   Walk to the steps of your booked stage during your slot. The set plays the setlist song by song; each song lasts
   festDur(song) in-game minutes (30-55) and the game clock keeps running at its normal speed, so a full 4-hour slot is
   about 1.7 real minutes by day and 2.4 after 20:00. After each song you are paid FSONG_PAY x stage multiplier x the
   people in the crowd, and the crowd streams that song. The set ends when the last song ends, when the slot is over
   (the last song is paid for the part you played), or when you leave the stage. */
const FSONG_PAY=.08;
function festStageUse(n){const s=fStage(n),bk=festBkOn(S.day,n);
 if(bk&&bk.st==1){snd('pop');return say('You already played '+s.name+' today. Book your next slot on FestivalApp.')}
 if(!bk||bk.st){snd('pop');const a=festAct(s);return say((a?'On stage now: '+a+'. ':'')+'Want to play '+s.name+'? Book a slot on FestivalApp on your computer, at least 2 days before a festival.')}
 const m=festMins(),sl=FSLOT[bk.slot];
 if(m<sl[0]){snd('err');return say('Stage manager: "You\'re on at '+fHM(sl[0])+'. That\'s '+fDurS(sl[0]-m)+' from now. Grab a drink!"')}
 festStartBooked(bk)}
function festStartBooked(bk){const s=fStage(bk.n),list=bk.songs.map(id=>S.songs.find(x=>x.id==id)).filter(Boolean);
 if(!list.length){snd('err');return say('Your setlist is empty (those songs are gone). Edit it on FestivalApp.')}
 if(S.energy<15){snd('err');return say('Too tired to perform. Grab some food first (15 energy needed).')}
 S.energy-=15;$('ui').innerHTML='';const C0=festC0(s,list[0]);
 FEST.set={st:s,bk,list,i:0,song:list[0],sm:0,dur:festDur(list[0]),C0,C:C0*.45,T:C0*.6,start:Math.round(C0*.45),t:0,mg:null,next:R(4,6.5),sc:[],ss:[],last:'',beat:0,bt:0,songT:0,hype:.45,end:0,peak:0,
  pay:0,str:0,fol:0,done:[],fin:0,m0:festMins()};
 mode='fest';P.rot=0;festViewOn(s);festSongStart();snd('whoosh');setTimeout(()=>nz(2.2,900,.16,.6,'bandpass'),200)}
/* the next song in the setlist: the featured artist of a collab comes on for that song only */
function festSongStart(){const set=FEST.set,s=set.st,song=set.list[set.i];set.song=song;set.sm=0;set.ms0=festMins();set.ss=[];set.songT=0;set.dur=festDur(song);
 const c=festC0(s,song);set.T=Math.max(c*.15,set.T+(c-set.C0)*.6);set.C0=c;festStagePeople();s.scrK='';festScreens();
 if(set.i>0){nz(1.8,1000,.14,.5,'bandpass');if(typeof festShout=='function')festShout(pick(['ONE MORE SONG!','TUUUNE!','I LOVE THIS ONE!',(S.artist||'YOU').toUpperCase()+'!']),1)}}
function festSongDone(fr){const set=FEST.set,s=set.st,song=set.song,c=Math.round(set.C),mean=a=>a.reduce((x,y)=>x+y,0)/a.length,avg=set.ss.length?mean(set.ss):set.sc.length?mean(set.sc):.5,f=fr==null?1:fr;
 const pay=+(FSONG_PAY*s.mult*c*f).toFixed(2),st=Math.round(c*.1*(.5+avg)*f),fol=Math.round(c*.015*(.5+avg)*f);
 S.money=+(S.money+pay).toFixed(2);S.earn=(S.earn||0)+pay;S.followers=(S.followers||0)+fol;S.interest=Math.min(1,(S.interest||0)+.004*s.mult*avg*f);
 /* the crowd streams the song afterwards: counted in today's streams (paid tomorrow morning) and this month's listeners */
 try{if(typeof planOf=='function')planOf(song);if(typeof mlInit=='function')mlInit();song.streams=(song.streams||0)+st;song.today=(song.today||0)+st;S.streams+=st;S.monthStreams=(S.monthStreams||0)+st}catch(e){console.error('fest streams',e)}
 set.pay=+(set.pay+pay).toFixed(2);set.str+=st;set.fol+=fol;set.done.push({t:song.title,c,pay,f,sc:Math.round(avg*100)});
 if(f>=1){snd('cash');nz(1.8,1100,.16,.5,'bandpass');setTimeout(()=>nz(1.4,1600,.1,.6,'bandpass'),300)}}
/* in-game minutes and real seconds left in the set (setlist or slot, whichever ends first) */
function festSetLeft(set){let m=set.dur-set.sm;for(let i=set.i+1;i<set.list.length;i++)m+=festDur(set.list[i]);m=Math.min(m,FSLOT[set.bk.slot][1]-festMins());
 return{m,s:m/((S.t<300?2.8:2)*(typeof DAYK!='undefined'?DAYK:1))}}
/* the performer, mic stands and the featured artist */
function festMic(x,y,z,ry){const g=new THREE.Group();B(g,.6,.05,.07,'#1a1a1a',0,.03,0);B(g,.07,.05,.6,'#1a1a1a',0,.03,0);B(g,.06,1.5,.06,'#b8bcc2',0,.76,0);B(g,.05,.05,.46,'#b8bcc2',0,1.5,-.2);B(g,.1,.22,.1,'#111',0,1.52,-.44);B(g,.13,.13,.13,'#9a9a9a',0,1.67,-.44);g.position.set(x,y,z);g.rotation.y=ry||0;return g}
function festStagePeople(){const v=festView3(),set=FEST.set,s=set.st,ft=set.song.ft;v.stageG.clear();set.ft=null;P.x=s.cx-(ft?.85:0);P.z=s.zf-1.9;
 const camX=s.cx-(ft?0:1.6),mic=x=>{const o=x<camX-.01?.45:-.45;v.stageG.add(festMic(x+o,s.h,s.zf-1.18,Math.atan2(o,.72)))};mic(P.x);
 if(ft){const a=ART.find(q=>q[0]==ft),o=buildChar(Object.assign({},a?a[4]:fCfg()));o.g.position.set(s.cx+.85,s.h,s.zf-1.9);v.stageG.add(o.g);mic(s.cx+.85);set.ft=o}}
function festViewOn(s){const v=festView3(),set=FEST.set;FEST.view=s;document.body.classList.add('fston');v.camX=null;
 v.sky.visible=v.back.visible=v.fx.visible=true;FEST.lg.visible=false;
 /* bubbles in front of the stage, light beams on the truss, the fans' banner */
 const b=v.bub.geometry.attributes.position;for(let i=0;i<b.count;i++)b.setXYZ(i,s.cx+R(-s.w*.9,s.w*.9),R(1.5,s.H+6),s.zf+R(1,s.n<3?60:30));b.needsUpdate=true;
 v.beams.forEach((m,i)=>{m.position.set(s.x0+(i+.5)*s.w/v.beams.length,s.H-1,s.zf+.6)});
 const cr=s.cr,k=Math.min(cr.f.length-1,Math.floor(Math.min(cr.f.length,set.C0)*.3)),p=cr.f[k];v.banner.position.set(p.x,2.4,p.z+.6);v.banner.rotation.y=Math.PI+Math.atan2(s.cx-p.x,s.oz-p.z)*.4;
 const tx=v.banner.userData.tex,x=tx.userData.x;x.fillStyle='#fff8e8';x.fillRect(0,0,512,128);x.fillStyle=s.col;x.textAlign='center';x.textBaseline='middle';fFit(x,'WE ♥ '+(S.artist||'YOU').toUpperCase(),0,70,480);x.fillText('WE ♥ '+(S.artist||'YOU').toUpperCase(),256,66);tx.needsUpdate=true;
 scene.fog.color.copy(v.hz);scene.fog.near=60;scene.fog.far=230;cr.C=set.C;cr.shown=-1;festScreens()}
function festViewOff(){const v=FEST.view3;FEST.view=null;document.body.classList.remove('fston');if(!v)return;v.sky.visible=v.back.visible=v.fx.visible=false;v.stageG.clear();FEST.lg.visible=FEST.ph=='fest';scene.fog.near=1e6;scene.fog.far=2e6}
/* stage-view only: perspective camera, sky dome, hazy tree line and hills that hide the town behind, bubbles, beams, banner */
function festView3(){if(FEST.view3)return FEST.view3;const v=FEST.view3={cam:new THREE.PerspectiveCamera(55,1,.1,330),stageG:new THREE.Group(),hz:new THREE.Color('#f1dfc0')};scene.add(v.stageG);
 const sg=new THREE.SphereGeometry(300,24,14),cA=[],P0=sg.attributes.position;for(let i=0;i<P0.count;i++)cA.push(1,1,1);sg.setAttribute('color',new THREE.Float32BufferAttribute(cA,3));
 v.sky=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));v.sky.renderOrder=-10;v.sky.frustumCulled=false;v.sky.visible=false;scene.add(v.sky);
 const G=fAll(),rnd=fRng(77),RR=(a,b)=>a+rnd()*(b-a),tree=(x,z,h)=>blkTree((w,hh,d,c,cx,cy,cz)=>xgBox(G,w,hh,d,c,cx,cy,cz),x,z,h/3.4,1);
 for(let x=140;x<470;x+=RR(2.5,4.5))tree(x,RR(-2,1),RR(8,13));for(let x=150;x<470;x+=RR(5,9))tree(x,RR(10,30),RR(12,18));
 for(let z=-150;z<0;z+=RR(3,5)){tree(RR(410,416),z,RR(8,13));tree(RR(208,212),z,RR(7,11))}for(let x=200;x<420;x+=RR(3,5))tree(x,RR(-132,-128),RR(8,13));
 for(let i=0;i<9;i++)xgPrism(G,RR(40,70),RR(10,25),RR(14,24),10,'#5e8a52',150+i*42,0,RR(60,110));
 v.back=new THREE.Group();fMerge(G,v.back);v.back.visible=false;scene.add(v.back);
 v.fx=new THREE.Group();v.fx.visible=false;scene.add(v.fx);
 const bt=fTex(32,32,(x)=>{const g=x.createRadialGradient(16,16,2,16,16,15);g.addColorStop(0,'rgba(255,255,255,.15)');g.addColorStop(.75,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32)});
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(260*3),3));v.bub=new THREE.Points(bg,new THREE.PointsMaterial({size:.45,map:bt,transparent:true,depthWrite:false,color:'#ffffff'}));v.bub.frustumCulled=false;v.fx.add(v.bub);v.bubV=[];for(let i=0;i<260;i++)v.bubV.push([R(-.3,.3),R(.15,.5),R(-.3,.3),R(0,6)]);
 v.beams=[];for(let i=0;i<6;i++){const g=new THREE.CylinderGeometry(.15,3.2,48,10,1,true);g.translate(0,-24,0);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:['#ff4a9a','#6ad5ff','#ffe066','#b07aff','#6ad5ff','#ff4a9a'][i],transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));m.userData.ph=i*1.1;v.beams.push(m);v.fx.add(m)}
 const tx=fTex(512,128,()=>{}),ban=new THREE.Group();const cl=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.9),new THREE.MeshLambertMaterial({map:tx,side:THREE.DoubleSide}));cl.position.y=.6;ban.add(cl);B(ban,.06,2.6,.06,'#888',-1.85,-.3,0);B(ban,.06,2.6,.06,'#888',1.85,-.3,0);ban.userData.tex=tx;v.banner=ban;v.fx.add(ban);
 return v}
function festSkyColours(v){const f=S.t<240?0:S.t<300?(S.t-240)/60*.5:S.t<330?.5+(S.t-300)/30*.4:.9,top=new THREE.Color('#79b6e6').lerp(new THREE.Color('#0a0f22'),f),hz=new THREE.Color('#f3dfbd').lerp(new THREE.Color('#3a2a5a'),f);
 if(v.f===Math.round(f*50))return;v.f=Math.round(f*50);v.hz.copy(hz);const g=v.sky.geometry,P0=g.attributes.position,C=g.attributes.color,c=new THREE.Color();
 for(let i=0;i<P0.count;i++){const y=P0.getY(i)/300,k=Math.min(1,Math.max(0,y*2.2));c.copy(hz).lerp(top,Math.pow(k,.7));C.setXYZ(i,c.r,c.g,c.b)}C.needsUpdate=true;scene.fog.color.copy(hz)}
/* render through the stage camera while you play */
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(FEST.view&&c===cam&&FEST.view3){const v=FEST.view3;v.cam.aspect=innerWidth/innerHeight;v.cam.updateProjectionMatrix();return r0(sc,v.cam)}return r0(sc,c)}}
scene.fog=new THREE.Fog(0xf1dfc0,1e6,2e6);
{const st=document.createElement('style');st.textContent=`body.fston #hud,body.fston #ntags{display:none}
#fst{position:fixed;left:50%;top:12px;transform:translateX(-50%);width:min(560px,94vw);z-index:4;text-align:center;pointer-events:none}#fst .bar{width:100%;height:8px;margin-top:6px}
#fcr{position:fixed;right:14px;top:12px;z-index:4;text-align:right;pointer-events:none;min-width:150px}#fcr b{font-size:28px;display:block;color:#fff}#fcr .d{font-size:14px;font-weight:700}
#fsg{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);width:min(460px,92vw);z-index:5;text-align:center}
#fsg .hm{height:22px;background:#000;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e;position:relative;margin:10px 0}#fsg .hm i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ff4a9a,#ffe066)}
#fsg .big{font-size:26px;margin:4px 0}#fsg .ok{color:#2fe68a}#fsg .no{color:#ff6a6a}#fend{position:fixed;left:14px;bottom:14px;z-index:4}
@media (max-width:600px){#fcr b{font-size:20px}#fst{top:58px}}`;document.head.appendChild(st)}
/* ---- the set: crowd, beat, minigames that pop up at random gaps ---- */
const FMG={hype:'Hype the crowd!',drop:'Hit the drop!',call:'Call and response!',lyric:'Finish the line!',hold:'Hold the note!'};
const FMG_HOW={hype:'Mash SPACE (or tap) to fill the meter before time runs out',drop:'Press SPACE (or tap) when the marker is in the green. 3 tries',call:'Watch the pads, then play them back with keys 1-4 or tap',lyric:'Pick the word that rhymes, keys 1-3 or tap',hold:'Hold SPACE (or hold click) to keep the level in the green band'};
function festMgStart(){const set=FEST.set,ks=Object.keys(FMG).filter(k=>k!=set.last),k=pick(ks);set.last=k;const m={k,t:-1.1,sc:null,fb:0};
 if(k=='hype')Object.assign(m,{lv:0,best:0,lim:4.5});
 else if(k=='drop')Object.assign(m,{pos:0,dir:1,sp:1.1,z0:R(.25,.6),zw:.16,hits:0,tries:0,lim:9,fl:0});
 else if(k=='call')Object.assign(m,{seq:Array.from({length:4},()=>Math.random()*4|0),ph:'show',i:0,ok:0,lit:-1,lt:0,lim:7,st:-1});
 else if(k=='lyric'){const g=mgShuf(MG_RH.slice()).slice(0,2);Object.assign(m,{i:0,ok:0,lim:5.5,pk:-1,lt:0,items:g.map(w=>{const ok=w.filter(x=>!MG_NEAR[x]),base=ok[0],right=pick(ok.slice(1)),pool=MG_RH.filter(o=>o!==w).flat().filter(x=>!MG_NEAR[x]);return{base,right,opts:mgShuf([right,...mgShuf(pool).slice(0,2)])}})})}
 else Object.assign(m,{dur:4.5,lv:.2,c:.5,in:0});
 set.mg=m;snd('pop');FEST.mgK=''}
function festMgPress(p){const set=FEST.set;if(!set||!set.mg||set.mg.sc!=null||set.mg.t<0)return;const m=set.mg;
 if(m.k=='hype'&&p==-1){m.lv=Math.min(1.05,m.lv+.075);sdNz(.09,500+m.lv*1400,.05,{q:1.4,pan:R(-.3,.3)})}
 else if(m.k=='drop'&&p==-1){m.tries++;const ok=m.pos>m.z0&&m.pos<m.z0+m.zw;if(ok){m.hits++;snd('cash');sfx(60,.25,'sine',.35,35,0,0)}else snd('err');m.fl=ok?.35:-.35;m.z0=R(.15,.7);if(m.tries>=3)festMgDone(m.hits/3)}
 else if(m.k=='call'&&p>=0&&m.ph=='input'){m.lit=p;m.lt=.25;mgPad(MG_NOTE[p]);if(p==m.seq[m.i]){m.i++;m.ok++;if(m.i>=m.seq.length)festMgDone(1)}else{snd('err');festMgDone(m.ok/m.seq.length)}}
 else if(m.k=='lyric'&&p>=0&&!(m.lt>0)){const it=m.items[m.i];m.pk=p;m.lt=.6;if(it.opts[p]==it.right){m.ok++;snd('cash')}else snd('err')}}
function festMgDone(sc){const set=FEST.set,m=set.mg;if(!m||m.sc!=null)return;m.sc=Math.max(0,Math.min(1,sc));m.fb=1.5;set.sc.push(m.sc);if(set.ss)set.ss.push(m.sc);const C0=set.C0;let d;
 if(m.sc>=.75)d=C0*(.1+.12*(m.sc-.75)/.25);else if(m.sc>=.5)d=C0*.04*(m.sc-.5)/.25;else d=-C0*(.05+.12*(.5-m.sc)/.5);
 set.T=Math.max(C0*.15,Math.min(Math.max(C0*1.6,40),set.T+d));m.d=Math.round(d);set.hype=Math.max(.1,Math.min(1,set.hype+(m.sc-.5)*.6));
 if(m.sc>=.5){nz(1.6,1100,.14+.1*m.sc,.5,'bandpass');setTimeout(()=>nz(1.2,1600,.1,.6,'bandpass'),250)}else nz(.8,400,.08,.5,'lowpass')}
function festMgTick(dt){const set=FEST.set,m=set.mg;m.t+=dt;if(m.sc!=null){m.fb-=dt;if(m.fb<=0){set.mg=null;set.next=set.t+R(3.5,9)}return}if(m.t<0)return;
 if(m.k=='hype'){m.lv=Math.max(0,m.lv-.32*dt);m.best=Math.max(m.best,m.lv);if(m.lv>=1)festMgDone(1);else if(m.t>=m.lim)festMgDone(m.best)}
 else if(m.k=='drop'){m.pos+=m.dir*m.sp*dt;if(m.pos>1){m.pos=1;m.dir=-1}if(m.pos<0){m.pos=0;m.dir=1}m.fl*=.9;if(m.t>=m.lim)festMgDone(m.hits/3)}
 else if(m.k=='call'){m.lt=Math.max(0,m.lt-dt);if(m.lt<=0)m.lit=-1;if(m.ph=='show'){const k=Math.floor(m.t/.6);if(k!=m.st&&k<m.seq.length){m.st=k;m.lit=m.seq[k];m.lt=.3;mgPad(MG_NOTE[m.lit])}if(m.t>m.seq.length*.6+.2){m.ph='input';m.t=0}}else if(m.t>=m.lim)festMgDone(m.ok/m.seq.length)}
 else if(m.k=='lyric'){if(m.lt>0){m.lt-=dt;if(m.lt<=0){m.pk=-1;m.t=0;if(++m.i>=m.items.length)festMgDone(m.ok/m.items.length)}}else if(m.t>=m.lim){m.pk=-1;m.lt=.6}}
 else{const hold=keys[' ']||keys.e||keys.enter||MGH;m.lv=Math.max(0,Math.min(1,m.lv+(hold?1.1:-.9)*dt));m.c=Math.max(.15,Math.min(.85,.5+.28*Math.sin(m.t*1.1)+.1*Math.sin(m.t*2.4+1)));if(Math.abs(m.lv-m.c)<.11)m.in+=dt;if(m.t>=m.dur)festMgDone(m.in/m.dur*1.15)}}
function festMgDraw(){const set=FEST.set;let el=$('fsg');const m=set&&set.mg;if(!m){if(el)el.remove();FEST.mgK='';return}
 if(!el){el=document.createElement('div');el.id='fsg';el.className='box';document.body.appendChild(el);el.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-p]');festMgPress(b?+b.dataset.p:-1)})}
 const key=m.k+(m.sc!=null?'done':m.t<0?'intro':'')+(m.k=='lyric'?m.i:'')+(m.k=='call'?m.ph:'');
 if(key!=FEST.mgK){FEST.mgK=key;const t=`<b class=px>${FMG[m.k]}</b><div class=m style="font-size:12px;margin-top:3px">${FMG_HOW[m.k]}</div>`;
  if(m.sc!=null){const good=m.sc>=.5;el.innerHTML=`<div class="big ${good?'ok':'no'}">${m.sc>=.9?'Perfect!':m.sc>=.75?'Great!':m.sc>=.5?'Nice':m.sc>=.25?'Shaky…':'Ouch!'}</div><div class="${m.d>=0?'ok':'no'}"><b>${m.d>=0?'+':''}${m.d.toLocaleString()} fans</b> ${m.d>=0?'joined the crowd':'walked off'}</div>`}
  else if(m.t<0)el.innerHTML=t+'<div class=big>Get ready…</div>';
  else if(m.k=='hype')el.innerHTML=t+'<div class=hm><i id=fmv></i></div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>';
  else if(m.k=='drop')el.innerHTML=t+'<div class=tbar><div class=tg id=fmz></div><div class=ti id=fmk></div></div><small class=m id=fmh></small><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>';
  else if(m.k=='call')el.innerHTML=t+`<div class=mgpads>${MG_PADC.map((c,i)=>`<button class=mgp data-p=${i} style="--c:${c}">${i+1}</button>`).join('')}</div><small class=m id=fmh></small>`;
  else if(m.k=='lyric'){const it=m.items[m.i];el.innerHTML=t+`<div class=m style="margin-top:6px">Line ${m.i+1}/${m.items.length}: rhymes with</div><div class="mgw px">"${esc(it.base)}"</div><div class=mgo>${it.opts.map((o,i)=>`<button data-p=${i}>${i+1}. ${esc(o)}</button>`).join('')}</div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>`}
  else el.innerHTML=t+'<div class=tbar><div class=tg id=fmz style="width:22%"></div><div class=ti id=fmk></div></div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>'}
 if(m.sc!=null||m.t<0)return;const tm=$('fmt');
 if(m.k=='hype'){const v=$('fmv');if(v)v.style.width=Math.min(100,m.lv*100)+'%';if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%'}
 else if(m.k=='drop'){const z=$('fmz'),k=$('fmk'),h=$('fmh');if(z){z.style.left=m.z0*100+'%';z.style.width=m.zw*100+'%'}if(k){k.style.left=m.pos*100+'%';k.style.background=m.fl>.05?'#2fe68a':m.fl<-.05?'#ff4455':'#fff'}if(h)h.textContent=m.hits+' hit · '+(3-m.tries)+' tries left';if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%'}
 else if(m.k=='call'){el.querySelectorAll('.mgp').forEach((b,i)=>b.classList.toggle('on',m.lit==i));const h=$('fmh');if(h)h.textContent=m.ph=='show'?'Watch and listen…':'Your turn: '+m.i+'/'+m.seq.length}
 else if(m.k=='lyric'){const it=m.items[m.i];if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%';el.querySelectorAll('.mgo button').forEach((b,i)=>{b.classList.toggle('ok',m.lt>0&&it.opts[i]==it.right);b.classList.toggle('no',m.lt>0&&i==m.pk&&it.opts[i]!=it.right)})}
 else{const z=$('fmz'),k=$('fmk');if(z)z.style.left=(m.c-.11)*100+'%';if(k){k.style.left=m.lv*100+'%';k.style.background=Math.abs(m.lv-m.c)<.11?'#2fe68a':'#fff'}if(tm)tm.style.width=Math.max(0,100-m.t/m.dur*100)+'%'}}
addEventListener('keydown',e=>{if(FEST.set&&FEST.set.end&&e.key=='Escape'){e.stopImmediatePropagation();return festLeave()}if(mode!='fest'||!FEST.set||/INPUT|TEXTAREA/.test(e.target.tagName))return;const k=e.key;
 if(k=='Escape'){e.stopImmediatePropagation();return festEnd(1)}if(e.repeat)return;if(k==' '||k=='Enter'||k.toLowerCase()=='e'){e.preventDefault();festMgPress(-1)}else{const n=parseInt(k);if(n>=1&&n<=4)festMgPress(n-1)}},true);
function festHud(){const set=FEST.set;let a=$('fst'),b=$('fcr');if(!set||set.end){if(a)a.remove();if(b)b.remove();const e=$('fend');if(e)e.remove();return}
 if(!a){a=document.createElement('div');a.id='fst';a.className='hb';document.body.appendChild(a);b=document.createElement('div');b.id='fcr';b.className='hb';document.body.appendChild(b);
  const e=document.createElement('button');e.id='fend';e.className='hb';e.textContent='Leave stage (Esc)';e.onclick=()=>festEnd(1);document.body.appendChild(e)}
 const s=set.st,nx=set.list[set.i+1],end=FSLOT[set.bk.slot][1],h=`<b class=px style="color:${s.col}">STAGE ${s.n} · ${esc(s.name.toUpperCase())}</b><br><small>Now playing ${set.i+1}/${set.list.length}: <b>"${esc(set.song.title)}"</b>${set.song.ft?' feat. '+esc(set.song.ft):''}</small><div class=bar><i style="width:${Math.min(100,Math.round(set.sm/set.dur*100))}%"></i></div>
  <small class=m>${fDurS(Math.max(0,set.dur-set.sm))} left · ${nx?'next: "'+esc(nx.title)+'"':'last song!'} · ${clk()} · slot ends ${fHM(end)}</small>`;if(a.dataset.h!=h){a.dataset.h=h;a.innerHTML=h}
 const c=Math.round(set.C),dd=c-set.start,g=`<small class=m>CROWD</small><b>${c.toLocaleString()}</b><span class=d style="color:${dd>=0?'#2fe68a':'#ff6a6a'}">${dd>=0?'▲ +':'▼ '}${dd.toLocaleString()}</span><br><small class=m>Earned ${$$(set.pay)} · next song pays ${$$(FSONG_PAY*s.mult*c)}</small>`;if(b.dataset.h!=g){b.dataset.h=g;b.innerHTML=g}}
/* the music under the set: one call per frame, so the audio code can swap it for genre beats. set.song is the song
   playing, set.songT the seconds since it started, set.hype the crowd's hype (0-1) */
function festMusic(set,dt){set.songT+=dt;
 /* the beat: kick, snare and hats at about 126 bpm, a chord stab every bar */
 set.bt+=dt;if(set.bt>=.476){set.bt-=.476;set.beat++;const b=set.beat%4;sfx(110,.16,'sine',.32,42,0,0);if(b==1||b==3)nz(.12,1900,.12,1,'bandpass');nz(.03,8000,.05,1,'highpass',.238);
  if(b==0){const r=[[262,330,392],[220,262,330],[175,220,262],[196,247,294]][(set.beat>>2)%4];r.forEach(f=>sfx(f,.4,'sawtooth',.025,0,0,.4))}}}
function festSetTick(dt){const set=FEST.set,s=set.st;if(set.end)return;set.t+=dt;if(S.t<599)S.t=Math.min(599,S.t+dt*(typeof DAYK!="undefined"?DAYK:1));if(!set.fin)set.sm=Math.max(0,festMins()-set.ms0);
 if(set.t<16)set.T=Math.min(set.C0*1.6,set.T+set.C0*.012*dt);
 set.C+=(set.T-set.C)*Math.min(1,dt*1.3);set.peak=Math.max(set.peak,set.C);s.cr.C=set.C;s.cr.hype+=(set.hype-s.cr.hype)*Math.min(1,dt*2);
 if(set.mg)festMgTick(dt);else if(!set.fin&&set.t>=set.next&&festSetLeft(set).s>9)festMgStart();
 const slotEnd=FSLOT[set.bk.slot][1];
 if(!set.fin&&set.sm>=set.dur){festSongDone();if(set.i+1<set.list.length&&festMins()<slotEnd-1){set.i++;festSongStart()}else set.fin=1}
 if(!set.fin&&festMins()>=slotEnd){set.fin=2;festSongDone(Math.min(1,set.sm/set.dur))}
 if(set.fin&&!set.mg)festEnd(0);
 festMusic(set,dt)}
function festEnd(quit){const set=FEST.set;if(!set||set.end)return;set.end=1;const s=set.st,m=$('fsg');if(m)m.remove();
 if(quit&&!set.fin){const fr=Math.min(1,set.sm/set.dur);if(fr>.05)festSongDone(fr)}
 const c=Math.round(set.C),avg=set.sc.length?set.sc.reduce((a,b)=>a+b,0)/set.sc.length:.5,gain=c-set.start,full=set.done.filter(d=>d.f>=1).length,F=festS();
 set.bk.st=1;set.bk.res={c,pay:set.pay,n:full,str:set.str};
 F.p[s.n]={c,pay:set.pay,sc:Math.round(avg*100),song:set.list[0].title,n:full,d:S.day};
 
 updateVersion();festBoardDraw();chime();
 const lis=Math.round(set.str/(S.mlDiv||3.5)),grade=avg>=.85?'Legendary set':avg>=.65?'Great show':avg>=.45?'Decent set':'Tough crowd',ttl=quit?'You left the stage early':set.fin==2&&full<set.list.length?'Time\'s up! '+grade:grade;mode='menu';
 $('ui').innerHTML=`<div class="box modal"><h2>${ttl}</h2><p class=m>Stage ${s.n} · ${s.name} · ${full} of ${set.list.length} songs played${set.sc.length?' · '+set.sc.length+' crowd moments, '+Math.round(avg*100)+'% average':''}</p>
  <div class=cards><div class=card>Crowd<b>${c.toLocaleString()}</b><small>${gain>=0?'+':''}${gain.toLocaleString()} during your set</small></div><div class=card>Paid<b>${$$(set.pay)}</b><small>$${FSONG_PAY.toFixed(2)} x ${s.mult} x crowd, per song</small></div><div class=card>Streams<b>+${set.str.toLocaleString()}</b><small>about +${lis.toLocaleString()} monthly listeners tomorrow</small></div><div class=card>Followers<b>+${set.fol.toLocaleString()}</b></div></div>
  <div style="max-height:22vh;overflow:auto;margin:6px 0">${set.done.map((d,i)=>`<div class=ng><span style="flex:1">${i+1}. "${esc(d.t)}"${d.f<1?' <small class=m>(cut short, '+Math.round(d.f*100)+'%)</small>':''}</span><small class=m>${d.c.toLocaleString()} people · ${$$(d.pay)}</small></div>`).join('')}</div>
  <div class=row2><button class=go onclick="festLeave()">Leave the stage</button></div></div>`}
function festLeave(){const set=FEST.set;FEST.set=null;festViewOff();festHud();const s=set&&set.st;if(s){P.x=s.ix;P.z=s.iz+1.2;P.rot=0;camT.x=P.x;camT.z=P.z;s.cr.hype=.4;s.cr.C=festAmbient(s);s.cr.shown=-1}closeUI();festScreens()}

/* ---- 10. every frame ---- */
function festTick(dt){festSync();if(FEST.set&&FEST.set.end&&mode=='play')festLeave();const ph=FEST.ph;FEST.t+=dt;const t=FEST.t;
 const near=!IN&&!HIN&&P.x>FEST.X0-90&&P.x<FEST.X1+90&&P.z>FEST.Z0-90&&P.z<FEST.Z1+70;
 if(ph=='fest'&&FEST.grp.fest){FEST.grp.fest.visible=near||!!FEST.view;
  if(FEST.set){festSetTick(dt);const s=FEST.set&&FEST.set.st;if(s&&P.mesh&&FEST.view){const b=Math.max(0,Math.sin(t*2.1*Math.PI))*.05;P.mesh.position.set(P.x,s.h+b,P.z);P.mesh.rotation.y=Math.sin(t*.9)*.15;
    P.arms[1].rotation.x=-2.2+Math.sin(t*4)*.12;P.arms[0].rotation.x=(FEST.set.hype>.7&&Math.sin(t*.7)>.2)?-2.9:-.3+Math.sin(t*2.1*Math.PI)*.3;P.legs[0].rotation.x=Math.sin(t*2.1*Math.PI)*.12;P.legs[1].rotation.x=-P.legs[0].rotation.x;
    if(FEST.set.ft){const o=FEST.set.ft;o.g.rotation.y=Math.sin(t*.8+1)*.2;o.g.position.y=s.h+Math.max(0,Math.sin(t*2.1*Math.PI+.5))*.05;o.arms[0].rotation.x=-2.2+Math.sin(t*4+1)*.12;o.arms[1].rotation.x=(FEST.set.hype>.6&&Math.sin(t*.6+2)>.3)?-2.9:-.4}}}
  if(FEST.grp.fest.visible){/* crowds: the one you play to every frame, the others nearby at a lower rate */
   FEST.crowd.forEach(cr=>{const live=FEST.view===cr.s,s=cr.s,d=Math.hypot(P.x-s.cx,P.z-(s.area[1]+s.area[3])/2);cr.grp.visible=live||!FEST.view&&d<110||!!FEST.view;
    if(!cr.grp.visible)return;cr.ft+=dt;if(live||cr.ft>(d<45?.033:.1)||cr.shown<0){festCrowdPose(cr,t,cr.shown<0,FEST.view?FEST.view3.cam:cam);cr.ft=0}});
   FEST.walk.forEach(w=>{w.o.g.visible=!FEST.view;if(FEST.view)return;w.p+=w.dir*w.sp*dt;if(w.p>w.b){w.p=w.b;w.dir=-1}if(w.p<w.a){w.p=w.a;w.dir=1}w.t+=dt*7;
    if(w.ax){w.o.g.position.set(w.p,0,w.c);w.o.g.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2}else{w.o.g.position.set(w.c,0,w.p);w.o.g.rotation.y=w.dir>0?0:Math.PI}
    const s=Math.sin(w.t)*.6;w.o.legs[0].rotation.x=s;w.o.legs[1].rotation.x=-s;w.o.arms[0].rotation.x=-s;w.o.arms[1].rotation.x=s});
   if((FEST.scrT=(FEST.scrT||0)+dt)>1){FEST.scrT=0;festScreens()}}}
 else if((ph=='build'||ph=='down')&&FEST.grp[ph]){FEST.grp[ph].visible=near;if(near)(FEST['work_'+ph]||[]).forEach(w=>{const a=w.o.arms,k=t*(w.job=='hammer'?7:3)+w.ph;
   if(w.job=='hammer'){a[1].rotation.x=-1.6+Math.sin(k)*.9;a[0].rotation.x=-.5}else if(w.job=='lift'){a[0].rotation.x=a[1].rotation.x=-2.9+Math.sin(k)*.1}else{a[0].rotation.x=a[1].rotation.x=-1.3;w.o.legs[0].rotation.x=Math.sin(k*2)*.5;w.o.legs[1].rotation.x=-Math.sin(k*2)*.5}})}
 if(FEST.view&&FEST.view3){const v=FEST.view3,s=FEST.view,c=v.cam;festSkyColours(v);v.sky.position.copy(c.position);
  /* the camera glides sideways when a featured artist comes on or goes off for a collab song */
  const ft=FEST.set&&FEST.set.song.ft?1:0;v.camX=v.camX==null?ft:v.camX+(ft-v.camX)*Math.min(1,dt*1.5);const sw=Math.sin(t*.37)*.3,px=s.cx-1.6*(1-v.camX);
  c.position.set(px+sw,s.h+2.75+Math.sin(t*.5)*.05,s.zf-Math.min(7.4,s.d-1));c.lookAt(s.cx-.6*(1-v.camX)+sw*.4,s.h+.1,s.zf+30);
  if(amb.intensity<.6){amb.intensity=.6;amb.color.set('#c8b0ff')}
  const b=v.bub.geometry.attributes.position;for(let i=0;i<b.count;i++){const q=v.bubV[i];let y=b.getY(i)+q[1]*dt,x=b.getX(i)+Math.sin(t*.8+q[3])*.25*dt+q[0]*dt;if(y>s.H+8){y=1.6;x=s.cx+R(-s.w*.9,s.w*.9)}b.setXY(i,x,y)}b.needsUpdate=true;
  v.beams.forEach((m,i)=>{const p=m.userData.ph;m.rotation.set(-1.25+Math.sin(t*.7+p)*.35,0,Math.sin(t*.9+p)*.6);m.material.opacity=(FEST.set?.05+.09*FEST.set.hype:.06)*(.6+.4*Math.sin(t*2+p))})}
 festFade(dt);festHud();if(FEST.set&&!FEST.set.end)festMgDraw()}
{const u0=update;update=function(dt){u0(dt);try{festTick(dt)}catch(e){if(!FEST.err){FEST.err=1;console.error('festival',e)}}}}

/* ---- 11. maps, taxi, morning card ---- */
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){m0(x,sx,sz,kx,kz,mini);const{X0,X1,Z0,Z1,GZ}=FEST,W=x.canvas.width,H=x.canvas.height;if(sx(X1)<-10||sx(X0)>W+10||sz(Z1)<-10||sz(Z0)>H+10)return;
 const rect=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(sx(a),sz(b),(c-a)*kx,(d-b)*kz)},ph=FEST.ph,k=(kx+kz)/2;
 rect(X0,Z0,X1,Z1,ph=='fest'?'#6f9a4c':ph?'#7e9a58':'#5a9a52');x.strokeStyle=ph=='fest'?'#c8ccd2':ph?'#e0a020':'#3f7a45';x.lineWidth=Math.max(1,.6*k);x.setLineDash(ph?[]:[4,3]);x.strokeRect(sx(X0),sz(Z0),(X1-X0)*kx,(Z1-Z0)*kz);x.setLineDash([]);
 if(ph=='fest'){FSTG.forEach(s=>{const[a,b,c,d]=s.area;rect(a,b,c,d,'#a08a5a');const n=Math.min(1,(s.cr?s.cr.C:s.base)/(s.figs+(s.cr?s.cr.cells||0:0)*7.4));rect(a,b,c,b+(d-b)*Math.max(.15,n),'#c49a6a')});
  rect(X0,GZ-3.5,322,GZ+3.5,'#9aa098');rect(225,-118,236,-8,'#9aa098');rect(317.5,-112,322,-8,'#9aa098');
  FSTG.forEach(s=>{rect(s.x0,s.zb,s.x1,s.zf,'#1d1d22');rect(s.x0,s.zf-.6,s.x1,s.zf,s.col)});FFOOD.forEach(f=>{const[,,fx,fz,,col,kind]=f;const r=kind=='bar'?[fx-4,fz-5,fx+1,fz+5]:kind=='van'?[fx-1,fz-2.2,fx+1,fz+3.4]:[fx-.7,fz-1.1,fx+.7,fz+1.1];rect(r[0],r[1],r[2],r[3],col)});
  if(!mini&&k>.9){x.font='bold 9px monospace';x.fillStyle='#fff';FSTG.forEach(s=>x.fillText(String(s.n),sx(s.cx)-3,sz(s.zf)+(s.d*kz>14?-3:9)))}}
 else if(ph){FSTG.forEach(s=>{x.strokeStyle='#d0d0d0';x.lineWidth=1;x.strokeRect(sx(s.x0),sz(s.zb),s.w*kx,s.d*kz)});rect(229,GZ-13.4,235,GZ-10.6,'#e8e8ec')}}}
{const b0=bigMap;bigMap=function(){b0();if(!FEST.ph||!$('bm'))return;const r=document.querySelector('#ui .row2');if(!r)return;const bt=document.createElement('button');bt.textContent=FEST.ph=='fest'?'Taxi to Festival':'Taxi to Festival';bt.onclick=()=>taxi(FEST.X0-3.5,FEST.GZ);r.insertBefore(bt,r.lastElementChild)}}
{const w0=wakeUp;wakeUp=function(auto){w0(auto);try{const ph=festPhaseOf(S.day),bx=document.querySelector('#ui .box');if(!ph||!bx)return;const h=bx.querySelector('h2');
 const bk=fBk().filter(b=>b.day==S.day&&!b.st),mine=bk.map(b=>'Stage '+b.n+' at '+fHM(FSLOT[b.slot][0])).join(' and ');
 const t=ph=='fest'?'<b>Park Fields Festival is on today</b>, east of Park Avenue. '+(mine?'<b>You play '+mine+'.</b> Be at the steps of the stage in time!':'Book a slot on FestivalApp (on your computer) at least 2 days before a festival to play. Grab some food.'):ph=='build'?'A crew is building <b>Park Fields Festival</b> east of Park Avenue. It opens tomorrow.':'The festival crew is taking Park Fields down today. Next festival: Day '+festNext(S.day)+'.';
 const p=document.createElement('p');p.style.cssText='background:#2b1240;border:2px solid #ff6ad5;padding:6px 8px;margin:6px 0';p.innerHTML=t;h?h.after(p):bx.prepend(p);FEST.seen[S.day]=1}catch(e){}}}
