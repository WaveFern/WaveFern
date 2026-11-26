/* ===== dev only: two places on the island, the Sunset Beach Club and the Lighthouse (v54.5.0) =====
   Loaded after dev-island-v1.js (it needs the coast, window.FW_ISLAND). Add ?noisland to skip both.
   - Sunset Beach Club: a fenced tiki bar, deck, sunbeds, a 16 m stage, fire pit and volleyball court on the south-east beach, all at real size (1 unit = 1 m) and all blocky. The gig is the festival set itself (70c-festival-set.js): same stage view, crowd, crowd minigames, walking round the stage and autographs. Now and then (about every 2-4 days,
     once you have a released song) the club EMAILS you (Messages) a sunset gig: day, 18:00-21:00, a fee. Accept or Decline in the
     message. On the day, walk to the stage during the slot and press the prompt: pick up to 3 of your songs and play. The crowd
     pays per song like the festival (stage multiplier 2) and the club adds its fee (70% to 130% of the offer, by your crowd score). It costs 15 energy. Miss the slot and the offer lapses (nothing lost). The bar also sells a cheap smoothie.
   - Lighthouse: a striped tower on the north-east headland with a light that turns at night. Press E to climb it: a plain dialog, then first person on the gallery (WASD, mouse or arrow keys, labels for places on the map). The first climb each day gives
     +20 energy. It is also a map place, so you can set a guide marker on it.
   State (saved, old saves start empty): S.bcg={last,list:[{id,pay,exp,day,st}]} (st 0 offer, 1 booked, 2 declined, 3 played, 4 expired, 5 missed),
   S.lhDay (the day you last climbed the lighthouse), S.bcBar (the day of your last smoothie). */
(function(){
if(!window.FW_ISLAND||/[?&]noisland/.test(location.search))return;
if(typeof THREE=='undefined'||typeof WORLD=='undefined'||typeof S=='undefined')return;
const FI=window.FW_ISLAND,G=FI.grass;
const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1));
const fm=n=>'$'+Math.round(n).toLocaleString('en-US'),fmt=n=>Math.round(n).toLocaleString('en-US');
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const sv=()=>{try{autoSave()}catch(e){}};
const sn=k=>{try{snd(k)}catch(e){}};
const FL=()=>{try{return fameLevel()||0}catch(e){return 0}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};
const hm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const SLOT=[1080,1260];/* 18:00-21:00, minutes since midnight */
const mins=()=>{try{return festMins()}catch(e){const t=S.t||0;return t<300?360+t*2.8:1200+(t-300)*2}};

/* ---------- where they go: scan to the grass edge, then stand back from the beach ---------- */
function edge(x,z0,dz){let z=z0;while(inPoly(G,x,z+dz)&&Math.abs(z-z0)<900)z+=dz;return z}
/* the club goes where the south shore is flattest between the city and the east end, the lighthouse on the northernmost tip of the north-east coast */
let CLUB_X=600,flat=1e9;for(let x=470;x<=690;x+=10){const a=edge(x-45,120,3),b=edge(x+45,120,3),c=edge(x,120,3);const v=Math.abs(a-c)+Math.abs(b-c);if(v<flat){flat=v;CLUB_X=x}}
const CLUB_Z=edge(CLUB_X,120,3)-16;/* the club is built in real metres (1 unit = 1 m, people are 1.8 m). Local z 0 is the middle; the back fence is at z -22, the grass edge about z +16 and the sea is further south */
let LH_X=690,tip=1e9;for(let x=560;x<=780;x+=10){const z=edge(x,-60,-3);if(z<tip){tip=z;LH_X=x}}
const LH_Z=tip-100,ISLET=13,PIER_Z0=tip-8;/* the lighthouse stands on a rock islet 100 m out to sea, joined to the north shore by a pier */
const NAV=[[CLUB_X,CLUB_Z,'Beach Club','#ff7ab8'],[LH_X,LH_Z,'Lighthouse','#ffe27a']];
NAV.forEach(p=>{try{if(!POIS.some(q=>q[2]==p[2]))POIS.push(p)}catch(e){}});

/* ---------- 3D ---------- */
const root=new THREE.Group();root.name='islandPlaces';WORLD.add(root);
/* soft sand apron: the grass wedge between the club's sand and the beach is sand now, and the sand fades out into the grass at the sides and the back instead of ending in a hard edge */
function buildApron(){const cx=CLUB_X,x0=cx-80,x1=cx+80,z0=CLUB_Z-12,z1=CLUB_Z+60,N=2,nx=(x1-x0)/N,nz=Math.ceil((z1-z0)/N);
 const fade=(x,z)=>{const dx=Math.abs(x-cx),a=Math.min(1,Math.max(0,(80-dx)/42)),b=Math.min(1,Math.max(0,(z-z0)/24));const f=Math.min(a,b);return f*f*(3-2*f)};
 const pos=[],uv=[],idx=[],ok=[],cv=document.createElement('canvas');cv.width=160;cv.height=nz;const c2=cv.getContext('2d'),im=c2.createImageData(160,nz);
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){pos.push(x0+i*N,0,z0+j*N);uv.push(i/nx,1-j/nz)}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+(i+.5)*N,z=z0+(j+.5)*N;if(![[0,0],[-1,-1],[1,-1],[-1,1],[1,1]].some(([u,v])=>inPoly(G,x+u*N/2,z+v*N/2)))continue;const a=i+j*(nx+1),b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d)}
 for(let j=0;j<nz;j++)for(let i=0;i<160;i++){const x=x0+(i+.5)*(x1-x0)/160,z=z0+(j+.5)*N,k=(j*160+i)*4,r=Math.sin(i*12.9898+j*78.233)*43758.5453,n=r-Math.floor(r),f=fade(x,z);const t=n<.12?-9:n>.9?7:0;im.data[k]=231+t;im.data[k+1]=217+t;im.data[k+2]=168+t;im.data[k+3]=Math.round(255*f)}
 c2.putImageData(im,0,0);const tx=new THREE.CanvasTexture(cv);tx.minFilter=tx.magFilter=THREE.LinearFilter;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const nm=g.attributes.normal;for(let i=0;i<nm.count;i++)nm.setXYZ(i,0,1,0);
 const m=new THREE.MeshLambertMaterial({map:tx,transparent:true,depthWrite:false});m.userData.xms=1;
 const ap=new THREE.Mesh(g,m);ap.position.y=-.2;ap.renderOrder=-1;root.add(ap);
 /* the maps get the same patch, with the same soft edges */
 FI.mapExtra.push((x,sx,sz)=>{const gr=x.createRadialGradient(sx(cx),sz(CLUB_Z+20),0,sx(cx),sz(CLUB_Z+20),Math.abs(sx(cx+70)-sx(cx)));gr.addColorStop(0,'#e7d9a8ff');gr.addColorStop(.55,'#e7d9a8ee');gr.addColorStop(1,'#e7d9a800');x.save();x.beginPath();FI.grass.forEach((p,i)=>i?x.lineTo(sx(p[0]),sz(p[1])):x.moveTo(sx(p[0]),sz(p[1])));x.closePath();x.clip();x.fillStyle=gr;x.fillRect(sx(x0),sz(z0),sx(x1)-sx(x0),sz(z1)-sz(z0));x.restore()})}
try{buildApron()}catch(e){console.warn('sand apron',e)}
function label(g,text,w,h,x,y,z,bg,fg,ry){const cv=document.createElement('canvas');cv.width=w*128;cv.height=h*128;const c=cv.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,cv.width,cv.height);
 c.strokeStyle=fg;c.lineWidth=6;c.strokeRect(6,6,cv.width-12,cv.height-12);c.fillStyle=fg;c.font='bold '+Math.round(cv.height*.46)+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(text,cv.width/2,cv.height/2+3);
 const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m}
const solids=[];
function solid(x0,z0,x1,z1){const q=[x0,z0,x1,z1];solids.push(q);cols.push(q)}
const PAL={sand:'#f1dfb0',teak:'#9a6a3c',plank:'#c99a5c',dark:'#5a3a22',bamboo:'#d1b062',thatch:'#bf9548',thatch2:'#a47c3a',teal:'#2aa7a1',coral:'#ff6f61',cream:'#fff3d9',ink:'#17171c'};
/* a thatched roof: stepped layers, a ragged fringe round the eaves and a ridge */
const RM=[PAL.thatch,PAL.thatch2].map(c=>new THREE.MeshLambertMaterial({color:c,transparent:true}));
let ROOFG=null;
function RB(g,w,h,d,c,x,y,z){const m=new THREE.Mesh(geo(w,h,d),RM[c==PAL.thatch2?1:0]);m.position.set(x,y,z);g.add(m);return m}
function thatch(g0,cx,cy,cz,w,d){const g=new THREE.Group();g0.add(g);ROOFG.push(g);const B=RB;for(let i=0;i<5;i++){const s=1-i*.19;B(g,w*s,.42,d*s,i%2?PAL.thatch2:PAL.thatch,cx,cy+i*.36,cz)}
 B(g,w*.2,.5,d*.9,PAL.thatch2,cx,cy+5*.36+.1,cz);
 for(let i=0;i<Math.round(w/.7);i++){const x=cx-w/2+.35+i*.7,l=.5+((i*7)%3)*.18;B(g,.5,l,.14,i%2?PAL.thatch:PAL.thatch2,x,cy-l/2+.1,cz+d/2);B(g,.5,l,.14,i%2?PAL.thatch2:PAL.thatch,x,cy-l/2+.1,cz-d/2)}
 for(let i=0;i<Math.round(d/.7);i++){const z=cz-d/2+.35+i*.7,l=.5+((i*5)%3)*.18;B(g,.14,l,.5,i%2?PAL.thatch:PAL.thatch2,cx-w/2,cy-l/2+.1,z);B(g,.14,l,.5,i%2?PAL.thatch2:PAL.thatch,cx+w/2,cy-l/2+.1,z)}}
/* everything here is made of boxes, like the rest of the game (no cylinders or cones) */
const bam=(g,x,z,h,w,y0)=>{w=w||.22;y0=y0||0;B(g,w,h,w,PAL.bamboo,x,y0+h/2,z);[.3,.62].forEach(f=>B(g,w+.05,.06,w+.05,'#a8863a',x,y0+h*f,z))};
/* lamps and flames: they glow at night and during a show, dim in the day */
const GL=[];let glowOn=null;
const GMC={},WM=new THREE.MeshLambertMaterial({color:'#2a2a2e'});
function glow(g,w,h,d,c,x,y,z,grp){const k=c+'|'+(grp||1),m=new THREE.Mesh(geo(w,h,d),GMC[k]||(GMC[k]=new THREE.MeshBasicMaterial({color:c})));m.position.set(x,y,z);g.add(m);GL.push({m,c:new THREE.Color(c),d:new THREE.Color(c).multiplyScalar(.3),g:grp||1});return m}
/* a string of lights: a thin wire that sags between two points with a bulb every so often (all the lights here hang on wires like this) */
function strand(g,x0,y0,z0,x1,y1,z1,n,sag,grp,C){const Q=[];for(let i=0;i<=n;i++){const t=i/n;Q.push([x0+(x1-x0)*t,y0+(y1-y0)*t-Math.sin(t*Math.PI)*(sag||0),z0+(z1-z0)*t])}
 for(let i=0;i<n;i++){const a=Q[i],b=Q[i+1],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),m=new THREE.Mesh(geo(.03,.03,L),WM);m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);m.rotation.order='YXZ';m.rotation.set(-Math.asin(dy/L),Math.atan2(dx,dz),0);g.add(m)}
 C=C||['#ffd27a','#ff9ac0','#8ad8ff','#8affb0'];for(let i=1;i<n;i++)glow(g,.15,.2,.15,C[i%C.length],Q[i][0],Q[i][1]-.12,Q[i][2],grp||1)}
/* solid box in club-local metres */
const sl=(x,z,hx,hz)=>solid(CLUB_X+x-hx,CLUB_Z+z-hz,CLUB_X+x+hx,CLUB_Z+z+hz);
function setGlow(on1,on2){const k=(on1?1:0)+(on2?2:0);if(glowOn===k)return;glowOn=k;GL.forEach(q=>q.m.material.color.copy(((q.g==1&&on1)||(q.g==2&&on2)||(q.g==3&&(on1||on2)))?q.c:q.d))}
/* a palm: a blocky trunk that leans, a crown block, and fronds that hinge from the crown so they are joined to it */
function palmB(g,x,z,s,lean,rot){s=s||1;lean=lean||.14;rot=rot||0;let px=x,py=0;
 for(let i=0;i<6;i++){const w=.44*s-i*.035*s,h=1*s;B(g,w,h*1.03,w,i%2?'#8a6a40':'#7d5f38',px,py+h/2,z);px+=lean*s*Math.cos(rot);py+=h}
 B(g,.55*s,.4*s,.55*s,'#5f4a2a',px,py+.05*s,z);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+rot,f=new THREE.Group();f.position.set(px,py+.2*s,z);f.rotation.y=a;g.add(f);
  const c1=i%2?'#2f8f4a':'#3da35a',c2=i%2?'#3da35a':'#2f8f4a';
  const s1=new THREE.Group();s1.rotation.z=-.22;f.add(s1);B(s1,1.5*s,.09*s,.55*s,c1,.75*s,0,0);
  const s2=new THREE.Group();s2.position.set(1.5*s,0,0);s2.rotation.z=-.6;s1.add(s2);B(s2,1.3*s,.09*s,.45*s,c2,.65*s,0,0)}
 [[.3,0],[-.3,.2],[0,-.3]].forEach(([dx,dz])=>B(g,.3*s,.3*s,.3*s,'#6b4a28',px+dx*s,py-.25*s,z+dz*s))}
/* a beach umbrella: 2.5 m pole, a stepped square canopy 2.5 m across */
function umbrella(g,x,z,c,y0){y0=y0||0;B(g,.07,2.5,.07,'#e8e8e8',x,y0+1.25,z);[[2.5,2.05],[1.8,2.3],[1.1,2.5]].forEach(([w,y],i)=>B(g,w,.13,w,i%2?PAL.cream:c,x,y0+y,z));B(g,.15,.15,.15,'#e8e8e8',x,y0+2.66,z)}
/* a sunbed: 1.9 m long, 0.7 m wide, the back end propped up */
function sunbed(g,x,z,c,y0){y0=y0||0;const s=new THREE.Group();s.position.set(x,y0,z);g.add(s);
 [[-.3,-.8],[.3,-.8],[-.3,.8],[.3,.8]].forEach(([a,b])=>B(s,.06,.28,.06,'#d8d0c0',a,.14,b));
 B(s,.7,.08,1.1,PAL.cream,0,.3,.35);const b=B(s,.7,.08,.85,PAL.cream,0,.5,-.5);b.rotation.x=.55;B(s,.5,.03,1.5,c,0,.36,.2);return s}
function stool(g,x,z,top){B(g,.4,.07,.4,PAL.plank,x,top,z);B(g,.08,top-.25,.08,PAL.dark,x,.25+(top-.25)/2,z)}
function table(g,x,z){B(g,1.1,.06,1.1,PAL.plank,x,.95,z);B(g,.12,.7,.12,PAL.dark,x,.6,z);B(g,.55,.05,.55,PAL.dark,x,.28,z)}
function fence(g,x0,z0,x1,z1){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/2.5)),h=Math.abs(x1-x0)>Math.abs(z1-z0);
 for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;B(g,.2,1.7,.2,PAL.dark,x,.85,z);if(i<n)strand(g,x,1.72,z,x0+(x1-x0)*(i+1)/n,1.72,z0+(z1-z0)*(i+1)/n,3,.2,1)}
 const cx=(x0+x1)/2,cz=(z0+z1)/2;[.45,.95,1.4].forEach((y,i)=>B(g,h?L:.07,.2,h?.07:L,i==1?PAL.plank:PAL.teak,cx,y,cz));
 const q=h?[Math.min(x0,x1),z0-.3,Math.max(x0,x1),z0+.3]:[x0-.3,Math.min(z0,z1),x0+.3,Math.max(z0,z1)];solid(CLUB_X+q[0],CLUB_Z+q[1],CLUB_X+q[2],CLUB_Z+q[3])}
const SK=()=>{try{return SKIN.length}catch(e){return 6}},HK=()=>{try{return HAIRC.length}catch(e){return 12}};
let sd=11;const r1=()=>(sd=(sd*16807)%2147483647)/2147483647;
const TOPS=['#e8452c','#2aa7a1','#ffd23d','#8d5fd3','#fff3d9','#ff7ab8','#3a7bd5','#6be08c'],BOTS=['#2b3a55','#6b4a28','#e8e1d0','#1a1a1a','#2aa7a1','#c0392b'];
const PPL=[];let ppG=null;
function figure(g,x,z,ry,o){o=o||{};const i=PPL.length,c={skin:Math.floor(r1()*SK()),eyes:Math.floor(r1()*5),mouth:Math.floor(r1()*4),hair:Math.floor(r1()*12),hc:Math.floor(r1()*HK()),top:[0,4,3][i%3],tc:0,pc:0,tc_custom:o.top||TOPS[i%TOPS.length],pc_custom:o.pants||BOTS[(i*3)%BOTS.length],body:r1(),bt:i%3==0?3:2};
 const f=buildChar(c);f.g.position.set(x,(o.y||0),z);f.g.rotation.y=ry||0;g.add(f.g);
 if(o.seat){f.legs.forEach(l=>l.rotation.x=-1.5);f.arms.forEach(a=>a.rotation.x=-.5)}
 if(o.talk)f.arms[1].rotation.x=-.9;if(o.up)f.arms.forEach(a=>a.rotation.x=-2.7);
 PPL.push({o:f,k:o.k||'idle',y:o.y||0,ph:r1()*6.3,x,z});return f}
function buildPeople(g){if(ppG)return;ppG=new THREE.Group();g.add(ppG);const P0=(x,z,ry,o)=>figure(ppG,x,z,ry,o);
 P0(-18,-16.6,0,{y:.25,k:'bar',top:'#fff3d9',pants:'#2b3a55'});/* the bartender, behind the counter */
 [-21,-17,-15].forEach(x=>P0(x,-13.4,Math.PI,{y:.43,seat:1}));/* on the bar stools */
 [[-23.9,-9,1],[-22.1,-9,-1],[-11.9,-9,1],[-10.1,-9,-1]].forEach(([x,z,d])=>P0(x,z,d*Math.PI/2,{y:.2,seat:1}));/* at the tables */
 [[-17.95,3.05],[-10.05,3.05],[-5.95,9.05]].forEach(([x,z])=>P0(x,z,0,{y:-.07,seat:1}));/* on sunbeds */
 [[-26.4,8,1],[-22.6,8,-1]].forEach(([x,z,d])=>P0(x,z,d*Math.PI/2,{y:-.02,seat:1}));/* round the fire */
 P0(14,7.7,0,{k:'vb',talk:0});P0(18,13.3,Math.PI,{k:'vb'});/* volleyball */
 P0(24,16,0,{talk:1,top:'#e8452c',pants:'#e8452c'});/* lifeguard */
 /* the crowd that gathers in front of the stage while a gig is on */
 for(let i=0;i<22;i++){const t=r1(),x=4.5+t*20+(r1()-.5)*1.5,z=-9.5+r1()*14;P0(x,z,Math.PI+(r1()-.5)*.5,{y:z<-6.2?.25:.05,k:'crowd'})}}
/* ---- stage gear, fire and volleyball net, each built at two levels: q1 is house-level detail, q2 is maximum detail (max is the default; type "ultra" in the game or add ?lite to the address for the lighter one) ---- */
const sub=g=>{const h=new THREE.Group();g.add(h);return h};
let QMAX=true;try{if(/[?&]lite/.test(location.search)||localStorage.getItem('fwBcQ')=='0')QMAX=false}catch(e){}
function guitarM(h,x,y,z,c,ry,q){const s=sub(h);s.position.set(x,y,z);s.rotation.y=ry||0;B(s,.06,.9,.06,'#222',0,.45,0);
 if(q>1)[0,1.05,2.1].forEach(a=>{B(s,.46,.04,.05,'#333',0,.03,0).rotation.y=a});
 const gt=sub(s);gt.position.set(0,.7,.1);gt.rotation.z=.2;
 if(q<2){B(gt,.5,.6,.14,c,0,-.2,0);B(gt,.12,.8,.08,'#3a2a1a',0,.45,0);B(gt,.2,.15,.1,'#222',0,.9,0)}
 else{B(gt,.52,.34,.14,c,0,-.1,0);B(gt,.62,.36,.14,c,0,-.42,0);B(gt,.2,.22,.14,c,-.17,.1,0);B(gt,.3,.34,.15,'#f4f4f4',.05,-.3,0);
  B(gt,.22,.05,.16,'#222',0,-.14,0);B(gt,.22,.05,.16,'#222',0,-.3,0);B(gt,.22,.04,.16,'#cfd3d8',0,-.5,0);[-.18,.18].forEach(a=>B(gt,.06,.06,.16,'#111',a,-.52,0));
  B(gt,.12,.8,.08,'#3a2a1a',0,.45,0);B(gt,.1,.8,.09,'#2a1a10',0,.45,0);for(let i=0;i<7;i++)B(gt,.1,.01,.1,'#cfd3d8',0,.1+i*.11,0);
  B(gt,.2,.17,.1,'#222',0,.92,0);[0,1,2].forEach(i=>{B(gt,.05,.04,.05,'#cfd3d8',-.12,.88+i*.05,0);B(gt,.05,.04,.05,'#cfd3d8',.12,.88+i*.05,0)});[-.03,0,.03].forEach(a=>B(gt,.012,.95,.012,'#ddd',a,.42,.05))}}
function ampM(h,x,y,z,ry,q){const s=sub(h);s.position.set(x,y,z);s.rotation.y=ry||0;
 if(q<2){B(s,.7,.8,.4,'#222',0,.4,0);B(s,.5,.5,.02,'#444',0,.45,.22);return}
 B(s,.9,.75,.45,'#1c1c20',0,.4,0);B(s,.78,.6,.02,'#3a3a3e',0,.4,.235);[-.2,.2].forEach(a=>[.28,.54].forEach(b=>B(s,.32,.22,.02,'#25252a',a,b,.245)));
 [[-.46,.03],[.46,.03],[-.46,.77],[.46,.77]].forEach(([a,b])=>B(s,.07,.07,.48,'#cfd3d8',a,b,0));B(s,.25,.04,.04,'#cfd3d8',0,.8,0);[-.38,.38].forEach(a=>B(s,.06,.06,.06,'#111',a,-.01,.18));
 B(s,.86,.26,.4,'#141418',0,.93+.13,0);B(s,.8,.2,.02,'#cfd3d8',0,1.06,.21);for(let i=0;i<6;i++)B(s,.05,.05,.04,'#111',-.3+i*.12,1.07,.22);B(s,.2,.05,.02,'#e6b422',.27,1.1,.215);B(s,.04,.04,.03,'*#ff3030',.34,1.02,.22)}
function keysM(h,x,y,z,ry,q){const s=sub(h);s.position.set(x,y,z);s.rotation.y=ry||0;
 if(q<2){B(s,1.55,.08,.5,'#222',0,.8,0);B(s,1.45,.04,.38,'#eee',0,.86,.04);B(s,.08,.8,.08,'#333',-.6,.4,0);B(s,.08,.8,.08,'#333',.6,.4,0);B(s,1.2,.3,.3,'#111',0,1.05,-.2);return}
 B(s,1.9,.1,.52,'#222',0,.86,0);[-.97,.97].forEach(a=>B(s,.05,.16,.52,'#8b6b47',a,.9,0));
 for(let i=0;i<17;i++)B(s,.1,.04,.4,'#f4f4f4',-.86+i*.108,.93,.05);[0,1,3,4,5,7,8,10,11,12,14,15].forEach(i=>B(s,.06,.05,.24,'#111',-.81+i*.108,.97,-.03));
 B(s,1.9,.2,.2,'#1a1a1e',0,1.0,-.2);B(s,.3,.05,.1,'*#2fe68a',.55,1.1,-.1);for(let i=0;i<8;i++)B(s,.05,.05,.05,'#cfd3d8',-.8+i*.12,1.09,-.12);[-.15,-.1].forEach(a=>B(s,.1,.05,.14,'#444',-1.05,.95,a));
 [-.8,.8].forEach(a=>{[-1,1].forEach(b=>{const l=B(s,.04,.95,.04,'#2a2a30',a,.42,0);l.rotation.z=b*.12;l.position.x=a+b*.05})});B(s,1.6,.04,.04,'#2a2a30',0,.45,0);
 B(s,.7,.3,.03,'#222',0,1.28,-.34);B(s,.04,.35,.04,'#222',0,1.12,-.3)}
function drumsM(h,x,y,z,q){const s=sub(h);s.position.set(x,y,z);
 if(q<2){B(s,3.2,.2,2.8,'#2a2a30',0,.1,0);B(s,.9,.8,.6,'#222',0,.6,0);B(s,.45,.3,.45,'#ddd',-.55,1.15,-.2);B(s,.45,.3,.45,'#ddd',.55,1.15,-.2);B(s,.5,.2,.5,'#ddd',-.9,.9,.5);B(s,.6,.5,.6,'#222',1,.65,.4);B(s,.7,.03,.7,'#e6b422',-1,1.5,-.2);B(s,.7,.03,.7,'#e6b422',1.1,1.35,-.3);B(s,.4,.03,.4,'#e6b422',-1.4,1.05,.4);B(s,.4,.1,.4,'#222',0,.6,1.4);return}
 B(s,3.4,.2,3,'#2a2a30',0,.1,0);B(s,2.8,.03,2.4,'#6a2020',0,.215,0);
 const R='#a02020',CH='#cfd3d8',GD='#d8b84a',hd=(w,d,yy,xx,zz)=>{B(s,w,.02,d,'#eee',xx,yy,zz)};
 B(s,1,.9,.7,R,0,.65,0);B(s,.92,.8,.03,'#eee',0,.65,.36);B(s,.36,.36,.04,'#222',0,.65,.37);B(s,1.06,.06,.76,CH,0,1.1,0);B(s,1.06,.06,.76,CH,0,.2,0);[-.45,.45].forEach(a=>B(s,.05,.05,.3,CH,a,.3,.5));B(s,.04,.4,.04,CH,0,1.3,-.2);
 [-.3,.3].forEach(a=>{B(s,.5,.36,.5,R,a,1.5,-.2);hd(.46,.46,1.69,a,-.2);B(s,.54,.04,.54,CH,a,1.69,-.2);B(s,.04,.3,.04,CH,a,1.25,-.2)});
 B(s,.62,.52,.62,R,1.05,.55,.45);hd(.58,.58,.82,1.05,.45);B(s,.66,.04,.66,CH,1.05,.82,.45);[[.25,.25],[-.25,.25],[0,-.28]].forEach(([a,b])=>B(s,.05,.3,.05,CH,1.05+a,.3,.45+b));
 B(s,.5,.2,.5,CH,-1.0,.82,.5);hd(.46,.46,.93,-1.0,.5);B(s,.04,.55,.04,CH,-1.0,.5,.5);[0,1.05,2.1].forEach(a=>B(s,.5,.03,.04,CH,-1.0,.25,.5).rotation.y=a);
 B(s,.04,1,.04,CH,-1.5,.7,.1);const h1=B(s,.4,.03,.4,GD,-1.5,1.2,.1),h2=B(s,.4,.03,.4,GD,-1.5,1.25,.1);B(s,.2,.04,.1,'#222',-1.5,.25,.5);
 B(s,.04,1.5,.04,CH,-.8,1.1,-.9);const c1=B(s,.7,.03,.7,GD,-.8,1.8,-.9);c1.rotation.z=.15;B(s,.04,1.35,.04,CH,1.3,1.0,-.9);const c2=B(s,.8,.03,.8,GD,1.3,1.7,-.9);c2.rotation.z=-.12;B(s,.1,.06,.1,'#b8942a',1.3,1.72,-.9);
 B(s,.44,.1,.44,'#222',0,.82,1.3);B(s,.05,.5,.05,CH,0,.55,1.3);[0,1.05,2.1].forEach(a=>B(s,.5,.03,.04,CH,0,.25,1.3).rotation.y=a)}
function micM(h,x,y,z,q){const s=sub(h);s.position.set(x,y,z);
 if(q<2){B(s,.45,.04,.45,'#222',0,.02,0);B(s,.06,1.2,.06,'#222',0,.6,0);B(s,.17,.25,.17,'#c9a227',0,1.3,0);B(s,.4,.4,.03,'#111',0,1.35,.25);return}
 [0,1.05,2.1].forEach(a=>B(s,.5,.04,.05,'#1a1a1a',0,.03,0).rotation.y=a);B(s,.05,1.25,.05,'#b8bcc2',0,.65,0);B(s,.08,.14,.08,'#222',0,.5,0);
 B(s,.05,.05,.4,'#b8bcc2',0,1.3,-.18).rotation.x=.12;B(s,.08,.2,.08,'#222',0,1.34,-.4);B(s,.14,.14,.14,'#9a9a9a',0,1.5,-.4);B(s,.16,.02,.16,'#c9a227',0,1.43,-.4);B(s,.02,.02,1.1,'#111',0,.015,-.6)}
function cabM(h,x,y,z,q){const s=sub(h);s.position.set(x,y,z);
 if(q<2){[1.75,2.65,3.55].forEach(yy=>{B(s,1.2,.9,1,'#1d1d22',0,yy-1.3,0);B(s,.5,.5,.1,'#2a2a30',0,yy-1.3,.55)});return}
 for(let i=0;i<3;i++){const yy=.5+i*.92;B(s,1.3,.9,.8,'#1c1c20',0,yy,0);B(s,1.2,.8,.02,'#2a2a30',0,yy,.41);[-.3,.3].forEach(a=>{B(s,.44,.44,.03,'#34343a',a,yy-.05,.43);B(s,.2,.2,.04,'#111',a,yy-.05,.45)});B(s,.5,.1,.04,'#444',0,yy+.3,.43);
  [-.68,.68].forEach(a=>B(s,.06,.9,.82,'#cfd3d8',a,yy,0));B(s,.3,.04,.04,'#cfd3d8',0,yy+.2,-.42)}
 B(s,1.4,.08,.9,'#222',0,.02,0)}
function monM(h,x,y,z,q){const s=sub(h);s.position.set(x,y,z);const w=B(s,.9,.45,.5,'#1d1d22',0,.3,0);w.rotation.x=-.3;if(q>1){const g=B(s,.8,.3,.02,'#3a3a3e',0,.32,.3);g.rotation.x=-.3;B(s,.3,.04,.04,'#cfd3d8',0,.5,-.1)}}
function buildGear(g,q){const h=sub(g);
 micM(h,14,1.3,-14.7,q);micM(h,11.4,1.3,-14.9,q);guitarM(h,9.3,1.3,-16.6,'#b5482a',.3,q);guitarM(h,10.5,1.3,-16.6,'#2a2a8a',.3,q);
 ampM(h,8.3,1.3,-20.3,.25,q);ampM(h,19.7,1.3,-20.3,-.25,q);keysM(h,19.4,1.3,-16.7,-.4,q);drumsM(h,14,1.4,-19.4,q);
 monM(h,12.2,1.3,-13.3,q);monM(h,15.8,1.3,-13.3,q);cabM(h,7,1.3,-13.3,q);cabM(h,21,1.3,-13.3,q);return h}
function buildFire(g,q){const h=sub(g),fx=-24.5,fz=8,fl=[],sp=[],gr=['#8d9096','#7c8087','#9a9a94','#6f7378'],R=q>1?18:12;
 B(h,1.9,.04,1.9,'#2a2622',fx,.04,fz);
 for(let i=0;i<R;i++){const a=i/R*Math.PI*2,r=1.05+(i%2)*.06,w=.3+(i%3)*.08;B(h,w,.24+(i%3)*.06,w,gr[i%4],fx+Math.cos(a)*r,.16,fz+Math.sin(a)*r).rotation.y=i}
 B(h,1.3,.05,1.3,'*#c4380f',fx,.08,fz);
 if(q<2){B(h,1.1,.2,.2,PAL.dark,fx,.3,fz).rotation.y=.6;B(h,1.1,.2,.2,PAL.dark,fx,.3,fz).rotation.y=-.6;
  fl.push({m:B(h,.45,.7,.45,'*#ff9a2e',fx,.7,fz),y0:.7,hh:.7,ph:0});fl.push({m:B(h,.25,.5,.25,'*#ffd23d',fx,.62,fz),y0:.62,hh:.5,ph:1.5})}
 else{[-.28,.28].forEach(o=>{B(h,1.5,.2,.2,'#5a3a22',fx,.2,fz+o);B(h,.03,.16,.16,'#a07a4a',fx+.75,.2,fz+o);B(h,.03,.16,.16,'#a07a4a',fx-.75,.2,fz+o)});
  [-.28,.28].forEach(o=>{B(h,.2,.2,1.4,'#6a4428',fx+o,.4,fz);B(h,.16,.16,.03,'#a07a4a',fx+o,.4,fz+.7)});
  [[.5,.3],[-.5,.3],[0,-.55]].forEach(([a,b],i)=>{const l=B(h,.16,1,.16,'#4a3018',fx+a*.5,.72,fz+b*.5);l.rotation.z=-a*.5;l.rotation.x=b*.5});
  for(let i=0;i<9;i++)B(h,.14,.05,.14,'*#ff7a2a',fx+Math.sin(i*2.1)*.5,.5+(i%3)*.04,fz+Math.cos(i*2.1)*.5);
  [[0,0,.9,.5,'*#ffd23d',0],[0,0,.7,.7,'*#ff9a2e',1],[.22,.12,.6,.18,'*#ff7a2a',2],[-.2,.15,.7,.18,'*#ff9a2e',3],[.1,-.22,.8,.18,'*#ffb02e',4],[-.15,-.18,.5,.16,'*#ff6a1a',5]].forEach(([a,b,hh,w,c,k])=>{const m=B(h,w,hh,w,c,fx+a,.55+hh/2,fz+b);fl.push({m,y0:.55+hh/2,hh,ph:k*1.3,b:.55})});
  B(h,.9,.6,.9,'*#ff5a1a',fx,.6,fz);
  for(let i=0;i<8;i++)sp.push({m:B(h,.06,.06,.06,'*#ffd27a',fx,1,fz),ph:i/8,ox:Math.sin(i*2.3)*.4,oz:Math.cos(i*1.7)*.4})}
 h.userData={fl,sp,fx,fz};return h}
function buildNet(g,q){const h=sub(g),x0=11.5,x1=20.5,nz=10.5,cx=(x0+x1)/2;
 if(q<2){B(h,.12,2.4,.12,PAL.bamboo,x0,1.2,nz);B(h,.12,2.4,.12,PAL.bamboo,x1,1.2,nz);
  B(h,9,.9,.03,'#fff',cx,1.95,nz).material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,wireframe:true});B(h,9,.07,.06,'#fff',cx,2.4,nz);
  h.userData.ball=B(h,.3,.3,.3,'#fff',16,2.7,8.5);return h}
 [x0,x1].forEach(x=>{B(h,.5,.05,.5,'#777',x,.03,nz);B(h,.12,2.6,.12,'#e8e8e8',x,1.3,nz);B(h,.2,1.4,.2,'#2a7fd0',x,1.15,nz);B(h,.2,.08,.2,'#777',x,2.62,nz);B(h,.3,.04,.04,'#aaa',x+(x<cx?-.1:.1),1.9,nz)});
 B(h,9.04,.1,.06,'#fff',cx,2.43,nz);B(h,9.04,.05,.05,'#fff',cx,1.46,nz);[x0+.02,x1-.02].forEach(x=>B(h,.05,1,.05,'#fff',x,1.95,nz));
 for(let i=0;i<5;i++)B(h,9,.015,.015,'#222',cx,1.55+i*.2,nz);for(let i=1;i<36;i++)B(h,.015,.95,.015,'#222',x0+i*.25,1.95,nz);
 [x0+.3,x1-.3].forEach(x=>{B(h,.04,1.8,.04,'#fff',x,2.3,nz);for(let k=0;k<4;k++)B(h,.045,.2,.045,'#e8452c',x,1.55+k*.4,nz)});
 /* referee stand */
 {const rx=x1+1.6;[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]].forEach(([a,b])=>B(h,.08,1.6,.08,'#e8e8e8',rx+a,.8,nz+b));B(h,1,.08,1,PAL.plank,rx,1.6,nz);B(h,.9,.5,.06,PAL.plank,rx,1.9,nz-.42);B(h,.8,.06,.5,'#e8e8e8',rx,1.7,nz);for(let i=0;i<4;i++)B(h,.7,.04,.06,'#e8e8e8',rx,.3+i*.35,nz+.5);solid(CLUB_X+rx-.5,CLUB_Z+nz-.5,CLUB_X+rx+.5,CLUB_Z+nz+.5)}
 const bl=sub(h);bl.position.set(16,2.7,8.5);B(bl,.3,.3,.3,'#fff',0,0,0);[-.16,.16].forEach(a=>{B(bl,.32,.08,.32,'#2a7fd0',0,a,0)});B(bl,.08,.32,.32,'#f2c230',0,0,0);h.userData.ball=bl;return h}
function buildClub(){ROOFG=[];const g=new THREE.Group();g.position.set(CLUB_X,0,CLUB_Z);root.add(g);
 const W=(x,z)=>[CLUB_X+x,CLUB_Z+z];
 g.userData.q1=[];g.userData.q2=[];const two=fn=>{const a=fn(g,1),b=fn(g,2);g.userData.q1.push(a);g.userData.q2.push(b);if(fn===buildFire)(g.userData.fires=g.userData.fires||[]).push(a,b);return[a,b]};
 /* ground: a boardwalk deck across the back, sand in front of it */
 B(g,54,.25,16,PAL.teak,0,.125,-14);for(let x=-26;x<=26;x+=1.5)B(g,.04,.02,16,PAL.dark,x,.26,-14);B(g,54.4,.14,.2,PAL.dark,0,.3,-6);
 B(g,6,.17,.6,PAL.plank,0,.085,-5.7);B(g,6,.08,.6,PAL.plank,0,.04,-5.1);/* the steps down to the sand */
 B(g,54,.05,22,PAL.sand,0,.03,5);
 /* the way in: a boardwalk from the grass to the gate in the back fence */
 B(g,3.6,.12,13,PAL.teak,0,.06,-28.5);for(let z=-34;z<=-22;z+=1.3)B(g,3.6,.02,.05,PAL.dark,0,.13,z);
 [-34,-29,-24].forEach(z=>[-2.4,2.4].forEach(x=>{B(g,.12,3.2,.12,PAL.dark,x,1.6,z);sl(x,z,.1,.1)}));
 [-2.4,2.4].forEach(x=>{strand(g,x,3.1,-34,x,3.1,-29,6,.3,1);strand(g,x,3.1,-29,x,3.1,-24,6,.3,1)});[-34,-29,-24].forEach(z=>strand(g,-2.4,3.1,z,2.4,3.1,z,8,.4,1));
 /* fence round the back and the two sides, one gate in the middle */
 fence(g,-27,-22,-2.9,-22);fence(g,2.9,-22,27,-22);fence(g,-27,-22,-27,-2);fence(g,27,-22,27,-2);
 B(g,.4,4.3,.4,PAL.dark,-3,2.15,-22);B(g,.4,4.3,.4,PAL.dark,3,2.15,-22);sl(-3,-22,.25,.25);sl(3,-22,.25,.25);B(g,6.8,.35,.4,PAL.dark,0,4.2,-22);
 B(g,5.8,1.3,.16,'#12333a',0,3.35,-22);label(g,'SUNSET BEACH CLUB',5.6,1.1,0,3.35,-21.9,'#e8452c','#fff3d9');label(g,'SUNSET BEACH CLUB',5.6,1.1,0,3.35,-22.1,'#e8452c','#fff3d9',Math.PI);
 B(g,6.4,.2,.5,PAL.thatch2,0,4.45,-22);
 /* tiki bar: bamboo posts, thatched roof, counter, shelves, stools */
 [[-24,-21],[-12,-21],[-24,-14.4],[-12,-14.4]].forEach(([x,z])=>bam(g,x,z,3.2,.24,.25));
 B(g,12.4,.2,.2,PAL.dark,-18,3.55,-14.4);B(g,12.4,.2,.2,PAL.dark,-18,3.55,-21);
 thatch(g,-18,3.5,-17.7,14.4,8.2);
 strand(g,-24,3.05,-14.3,-12,3.05,-14.3,12,.3,1);strand(g,-24,3.05,-14.3,-24,3.05,-21,7,.25,1);strand(g,-12,3.05,-14.3,-12,3.05,-21,7,.25,1);
 B(g,10.5,1.05,.7,PAL.dark,-18,.78,-14.6);B(g,11,.1,1.1,PAL.plank,-18,1.35,-14.6);
 B(g,11,.1,.5,PAL.teak,-18,1.8,-20.7);B(g,11,.1,.5,PAL.teak,-18,2.5,-20.7);
 for(let i=0;i<12;i++){const c=['#e8452c','#2aa7a1','#ffd23d','#6be08c','#ff7ab8','#8ad8ff'][i%6];B(g,.2,.45,.2,c,-23+i*.9,2.07,-20.7);B(g,.2,.45,.2,c,-22.5+i*.9,2.77,-20.7)}
 B(g,1.1,1.9,.8,'#e9eef2',-22.7,1.2,-19.6);B(g,.9,.5,.6,'#2a7fd0',-13.2,.5,-19.8);
 label(g,'TIKI BAR',3.2,.7,-18,2.7,-14.2,'#12333a','#ffd27a');
 [-22,-20,-18,-16,-14].forEach(x=>stool(g,x,-13.4,.95));sl(-18,-13.4,4.3,.3);
 [-23,-17,-11].forEach((x,i)=>{table(g,x,-9);sl(x,-9,1.3,.6);if(i!=1)umbrella(g,x,-9,i?PAL.teal:PAL.coral,.25);stool(g,x-.95,-9,.7);stool(g,x+.95,-9,.7)});
 B(g,.6,.9,.6,'#3a5a4a',-5.6,.7,-7.2);B(g,.6,.9,.6,'#3a5a4a',5.6,.7,-7.2);sl(-5.6,-7.2,.3,.3);sl(5.6,-7.2,.3,.3);
 /* stage, about the size of The Pit at the festival: 16 m wide, 9 m deep, 1.3 m high, roof at 8.5 m */
 B(g,16,1.05,9,PAL.teak,14,.775,-16.5);B(g,16,.04,9,'#d9b070',14,1.32,-16.5);for(let x=6.8;x<22;x+=1.6)B(g,.04,.02,9,PAL.dark,x,1.35,-16.5);B(g,16.1,.2,.2,PAL.dark,14,1.2,-12);
 B(g,.6,.35,2.4,PAL.plank,4.8,.425,-14.5);B(g,.6,.7,2.4,PAL.plank,5.4,.6,-14.5);
 [[6.3,-12.4],[21.7,-12.4],[6.3,-20.6],[21.7,-20.6]].forEach(([x,z])=>bam(g,x,z,5.6,.32,1.3));
 B(g,15.8,.3,.3,PAL.dark,14,6.8,-12.4);B(g,15.8,.3,.3,PAL.dark,14,6.8,-20.6);
 thatch(g,14,6.9,-16.5,18,10.8);
 B(g,15.6,4.6,.2,'#e0c06c',14,3.6,-20.8);for(let i=0;i<12;i++)B(g,.1,4.6,.24,'#b58f3e',6.6+i*1.3,3.6,-20.8);
 label(g,'LIVE AT SUNSET',8,1.2,14,4.6,-20.65,'#12333a','#ffd27a');
 B(g,15.6,.2,.2,'#222',14,6.2,-13.2);B(g,15.6,.2,.2,'#222',14,6.2,-17.4);
 [-13.2,-17.4].forEach(z=>strand(g,6.2,6.1,z,21.8,6.1,z,12,.35,2,['#ffd27a','#ff6f61','#2aa7a1','#ff7ab8','#8ad8ff']));
 two(buildGear);sl(14,-14.7,.25,.25);sl(11.4,-14.9,.25,.25);sl(7,-13.3,.8,.7);sl(21,-13.3,.8,.7);sl(14,-19.4,1.7,1.5);sl(8.3,-20.3,.6,.4);sl(19.7,-20.3,.6,.4);sl(19.4,-16.7,.9,.4);sl(9.9,-16.6,.9,.3);sl(14,-20.9,8,.2);sl(14,-11.4,8,.15);sl(22.1,-16.5,.3,4.5);sl(6,-18.4,.2,2.6);sl(6,-12.6,.2,.6);[[6.3,-12.4],[21.7,-12.4],[6.3,-20.6],[21.7,-20.6]].forEach(([x,z])=>sl(x,z,.2,.2));
 B(g,16,.08,.06,'#333',14,1.1,-11.4);for(let x=6;x<=22;x+=2)B(g,.1,.9,.1,'#333',x,.7,-11.4);
 const mk=new THREE.Group();B(mk,.9,.9,.9,'*#ff7ab8',0,0,0);mk.rotation.set(Math.PI/4,0,Math.PI/4);mk.position.set(14,11.5,-16.5);g.add(mk);g.userData.mk=mk;g.userData.mky=11.5;g.userData.roofs=ROOFG;
 /* beach: umbrellas with two sunbeds each on the sand */
 [[-17,2.5,PAL.coral],[-11,2.5,PAL.teal],[-5,2.5,'#ffd23d'],[-17,8.5,PAL.teal],[-11,8.5,'#ffd23d'],[-5,8.5,PAL.coral]].forEach(([x,z,c],i)=>{umbrella(g,x,z,c,.05);sl(x,z,.12,.12);[-.95,.95].forEach((o,j)=>{sunbed(g,x+o,z+.2,j?PAL.coral:PAL.teal,.05);sl(x+o,z+.4,.38,.95)})});
 [[-3,5.5,PAL.coral],[-19.5,5.8,PAL.teal],[-8,11.4,'#ffd23d'],[-14,11.4,PAL.coral]].forEach(([x,z,c])=>{B(g,.6,.03,1.2,c,x,.08,z)});
 /* fire pit: a square ring of stones, crossed logs, log benches */
 {const fx=-24.5,fz=8;two(buildFire);[[-1.9,0,1],[1.9,0,1],[0,-1.9,0]].forEach(([dx,dz,r])=>{B(g,r?.45:1.8,.45,r?1.8:.45,'#7a5230',fx+dx,.28,fz+dz);sl(fx+dx,fz+dz,r?.25:.95,r?.95:.25)});
   solid(CLUB_X+fx-.9,CLUB_Z+fz-.9,CLUB_X+fx+.9,CLUB_Z+fz+.9)}
 /* volleyball court: a net 9 m wide, lines on the sand, a ball */
 {const x0=11.5,x1=20.5,z0=5,z1=16,nz=10.5;sl(x0,nz,.12,.12);sl(x1,nz,.12,.12);two(buildNet);
  [[(x0+x1)/2,z0,9,.08],[(x0+x1)/2,z1,9,.08],[x0,(z0+z1)/2,.08,z1-z0],[x1,(z0+z1)/2,.08,z1-z0]].forEach(([x,z,w,d])=>B(g,w,.02,d,'#fff',x,.07,z))}
 /* lifeguard tower: platform on four legs, a small hut, a ladder, a flag */
 {const x=24,z=14;[[-.9,-.9],[.9,-.9],[-.9,.9],[.9,.9]].forEach(([a,b])=>B(g,.16,2.2,.16,'#e8e8e8',x+a,1.1,z+b));B(g,2.4,.15,2.4,PAL.plank,x,2.2,z);
  B(g,2.2,1.6,.1,'#e8452c',x,3.1,z-1);B(g,.1,1.6,2.2,'#e8452c',x-1.05,3.1,z);B(g,.1,1.6,2.2,'#e8452c',x+1.05,3.1,z);B(g,2.7,.15,2.7,'#fff3d9',x,3.95,z);
  for(let i=0;i<5;i++)B(g,.8,.05,.08,PAL.dark,x,.4+i*.4,z+1.25);B(g,.06,1.6,.06,'#ddd',x+1.15,4.7,z-1.1);B(g,.8,.5,.04,'#e8452c',x+1.55,5.2,z-1.1);
  solid(CLUB_X+x-1,CLUB_Z+z-1,CLUB_X+x+1,CLUB_Z+z+1)}
 /* surfboard rack */
 sl(3.5,13,1.4,.25);B(g,2.8,.08,.08,PAL.dark,3.5,.7,13);B(g,2.8,.08,.08,PAL.dark,3.5,1.5,13);[2.2,4.8].forEach(x=>B(g,.1,1.8,.1,PAL.dark,x,.9,13));
 ['#ff6f61','#2aa7a1','#ffd23d','#8ad8ff','#e8e1d0'].forEach((c,i)=>{const b=B(g,.5,2.3,.07,c,2.4+i*.5,1.2,13);b.rotation.z=(i-2)*.03;B(g,.08,2.2,.08,'#fff',2.4+i*.5,1.2,13.05)});
 /* palms, torches, string lights */
 [[-26,-19,1.1,.12,0],[26,-19,1.2,-.12,3.14],[-26,-4,1,.14,0],[26,-4,1.1,-.14,3.14],[-7,-24.5,1.1,.12,1],[7,-24.5,1.2,-.12,2],[-26,14,1.05,.14,0],[26,10,1.1,-.14,3.14],[-4,-38,1,.1,1],[4,-38,1.1,-.1,2]].forEach(([x,z,s,l,r])=>{palmB(g,x,z,s,l,r);sl(x,z,.4,.4)});
 const px=[-26,-15,-5,5,15,26];px.forEach(x=>{B(g,.12,3.7,.12,'#333',x,1.85,-6.3);sl(x,-6.3,.1,.1)});
 for(let s=0;s<px.length-1;s++)strand(g,px[s],3.6,-6.3,px[s+1],3.6,-6.3,8,.5,1)
 /* solids: the bar counter and the stage block, the rest is open */
 sl(-18,-17.6,6.3,3.4);
 g.userData.glow=1;return g}

function buildLight(){const g=new THREE.Group();g.position.set(LH_X,0,LH_Z);root.add(g);
 B(g,10,1.3,10,'#7c8087',0,.65,0);B(g,8.4,.3,8.4,'#6a6e74',0,1.45,0);
 let y=1.3;const win=[];
 for(let i=0;i<5;i++){const w=6.2-i*.55,h=4;B(g,w,h,w,i%2?'#d6402f':'#f4f1ea',0,y+h/2,0);B(g,w+.35,.22,w+.35,'#3a3a40',0,y+h,0);if(i)B(g,.5,.8,.1,'#1b2a3a',0,y+2.2,w/2+.03);y+=h}
 B(g,1.2,2.2,.15,'#3a2a22',0,2.4,3.15);
 B(g,8,.3,8,'#2a2a2e',0,y+.15,0);g.userData.floor=y+.3;
 [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dz])=>{const L=8;B(g,dx?.08:L,.08,dx?L:.08,'#2a2a2e',dx*3.9,y+1.1,dz*3.9);for(let k=-2;k<=2;k++)B(g,.1,.9,.1,'#2a2a2e',dx?dx*3.9:k*1.95,y+.7,dx?k*1.95:dz*3.9)});
 const lant=new THREE.Mesh(geo(2.6,2,2.6),new THREE.MeshBasicMaterial({color:'#ffe9a8',transparent:true,opacity:.85}));lant.position.set(0,y+1.3,0);g.add(lant);g.userData.lant=lant;
 [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]].forEach(([a,b])=>B(g,.18,2.2,.18,'#2a2a2e',a,y+1.4,b));
 [[3.4,.4],[2.6,.4],[1.8,.4]].forEach(([w,h],i)=>B(g,w,h,w,'#d6402f',0,y+2.6+i*.4,0));B(g,.9,.6,.9,'#d6402f',0,y+3.9,0);B(g,.12,.9,.12,'#2a2a2e',0,y+4.6,0);
 /* the beam: two flat wedges that turn, only visible after dark */
 const beam=new THREE.Group();beam.position.y=y+1.3;g.add(beam);
 const bm=new THREE.MeshBasicMaterial({color:0xffd870,transparent:true,opacity:.26,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 [1,-1].forEach(a=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(60,5),bm);w.position.set(a*30,0,0);w.rotation.x=-Math.PI/2;beam.add(w)});
 g.userData.beam=beam;g.userData.beamMat=bm;g.userData.top=y+1.3;
 solid(LH_X-3.4,LH_Z-3.4,LH_X+3.4,LH_Z+3.4);
 /* the islet: blocky grey rock (two squares, one turned) with a grassy top, a pale shallow square and foam, rocks round the edge */
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(ISLET*2+26,ISLET*2+26),new THREE.MeshBasicMaterial({color:0x8ee6e0,transparent:true,opacity:.55,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.set(LH_X,-.41,LH_Z);root.add(sh);
 B(root,ISLET*2,2.4,ISLET*2,'#7c8087',LH_X,-.1,LH_Z);B(root,ISLET*1.7,2.4,ISLET*1.7,'#72767c',LH_X,-.1,LH_Z).rotation.y=Math.PI/4;
 B(root,ISLET*1.6,.5,ISLET*1.6,'#6a9a52',LH_X,1.1,LH_Z);B(root,ISLET*1.35,.5,ISLET*1.35,'#6a9a52',LH_X,1.1,LH_Z).rotation.y=Math.PI/4;
 const fo=new THREE.Group();fo.position.set(LH_X,-.36,LH_Z);root.add(fo);const fm2=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false}),FR=ISLET+3.4;
 [[0,-FR,FR*2,1.2],[0,FR,FR*2,1.2],[-FR,0,1.2,FR*2],[FR,0,1.2,FR*2]].forEach(([x,z,w,d])=>{const m=new THREE.Mesh(geo(w,.04,d),fm2);m.position.set(x,0,z);fo.add(m)});g.userData.foam=fo;
 for(let i=0;i<14;i++){const a=i/14*6.283+Math.sin(i*3.1)*.2,r=ISLET*1.2+(i%3)*1.4,w=1.6+(i%4)*.7;B(root,w,1+(i%3)*.5,w*.9,['#8d9096','#7c8087','#6f7378','#9a9a94'][i%4],LH_X+Math.cos(a)*r,.2,LH_Z+Math.sin(a)*r).rotation.y=i}
 /* the pier: planks, posts both sides, a rail and warm lamps */
 const pz0=LH_Z+ISLET-2,pz1=PIER_Z0,len=pz1-pz0,pm=(pz0+pz1)/2;
 B(root,5.2,.34,len,'#9a6a3c',LH_X,.22,pm);for(let z=pz0+1;z<pz1;z+=1.3)B(root,5.3,.03,.08,'#5a3a22',LH_X,.4,z);
 for(let z=pz0+2;z<pz1;z+=6){[-1,1].forEach(a=>{B(root,.3,2.2,.3,'#5a3a22',LH_X+a*2.7,.7,z);B(root,.36,2.4,.36,'#5a3a22',LH_X+a*2.7,-.9,z)});if(z+6<pz1)[-1,1].forEach(a=>strand(root,LH_X+a*2.7,1.8,z,LH_X+a*2.7,1.8,z+6,6,.35,1))}
 [-1,1].forEach(a=>{B(root,.1,.1,len,'#5a3a22',LH_X+a*2.7,1.45,pm)});
 PIER={x0:LH_X-2.5,x1:LH_X+2.5,z0:LH_Z+ISLET-8,z1:pz1+4};
 return g}
let PIER=null;
/* the pier and the islet are walkable out in the sea: the island's shore check is skipped there and only solid things (the tower) stop you */
{const h0=hit;hit=function(x,z,r){try{if(PIER&&!IN&&mode!='drive'&&((x>PIER.x0&&x<PIER.x1&&z>PIER.z0&&z<PIER.z1)||Math.max(Math.abs(x-LH_X),Math.abs(z-LH_Z))<ISLET-1.5)){r=r||.4;return cols.some(c=>x+r>c[0]&&x-r<c[2]&&z+r>c[1]&&z-r<c[3])?1:0}}catch(e){}return h0.apply(this,arguments)}}
let club=null,light=null,built=false;
function applyQ(){if(!club)return;const u=club.userData;u.q1.forEach(v=>v.visible=!QMAX);u.q2.forEach(v=>v.visible=QMAX)}
/* max detail is the default. Type "ultra" while walking about (or open the game with ?lite) to switch the club's fire, net and stage gear to the lighter house-level version, and again to come back */
function setQ(v){QMAX=!!v;applyQ();try{localStorage.setItem('fwBcQ',QMAX?'1':'0')}catch(e){}try{say('Beach Club props: '+(QMAX?'max detail on.':'lighter detail.'));sn('chime')}catch(e){}}
{let buf='';window.addEventListener('keydown',e=>{if(mode!='play'||!e.key||e.key.length!=1)return;const t=e.target&&e.target.tagName;if(t=='INPUT'||t=='TEXTAREA')return;buf=(buf+e.key.toLowerCase()).slice(-5);if(buf=='ultra'){buf='';setQ(!QMAX)}})}
function build(){if(built)return;built=true;try{club=buildClub();applyQ()}catch(e){console.error('beach club',e)}try{light=buildLight()}catch(e){console.error('lighthouse',e)}
 /* prompts */
 INT.push({x:CLUB_X+14,z:CLUB_Z-12,r:8,l:'Sunset Beach Club stage',a:()=>stageUse(),bc:'stage'});
 INT.push({x:CLUB_X-18,z:CLUB_Z-12.4,r:4.5,l:'Beach bar: smoothie $8',a:()=>bar(),bc:'bar'});
 INT.push({x:LH_X,z:LH_Z+5.6,r:4.5,l:'Climb the Lighthouse',a:()=>climb(),lh:1})}

/* ---------- maps: the Beach Club and the Lighthouse drawn from above, same shapes and colours as the 3D builds (v55.5.0) ---------- */
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){const r=m0.apply(this,arguments);try{x.save();x.lineJoin='round';x.lineCap='round';
  const R=(cx,cz,w,d,col,ox,oz)=>{x.fillStyle=col;x.fillRect(sx(cx-w/2+(ox||0)),sz(cz-d/2+(oz||0)),w*kx,d*kx)};
  const Q=(cx,cz,w,d,col)=>{R(cx,cz,w,d,'rgba(0,0,0,.22)',.8,.8);R(cx,cz,w,d,col)};
  const C=(cx,cz,rad,col)=>{x.fillStyle=col;x.beginPath();x.arc(sx(cx),sz(cz),Math.max(.8,rad*kx),0,6.283);x.fill()};
  const D=(cx,cz,h,col)=>{x.fillStyle=col;x.beginPath();x.moveTo(sx(cx),sz(cz-h));x.lineTo(sx(cx+h),sz(cz));x.lineTo(sx(cx),sz(cz+h));x.lineTo(sx(cx-h),sz(cz));x.closePath();x.fill()};
  const L=(a,b,c,d,col,w)=>{x.strokeStyle=col;x.lineWidth=Math.max(.7,w*kx);x.beginPath();x.moveTo(sx(a),sz(b));x.lineTo(sx(c),sz(d));x.stroke()};
  const fine=kx>.3;
  /* ---- Sunset Beach Club ---- */
  {const X=CLUB_X,Z=CLUB_Z;
   R(X,Z-28.5,3.6,13,PAL.teak);/* the boardwalk in from the grass */
   R(X,Z+5,54,22,PAL.sand);/* the sand */
   Q(X,Z-14,54,16,PAL.teak);if(fine)for(let a=-26;a<=26;a+=1.5)L(X+a,Z-22,X+a,Z-6,PAL.dark,.05);/* the deck with its planks */
   R(X,Z-5.7,6,.6,PAL.plank);R(X,Z-5.1,6,.6,PAL.plank);/* steps to the sand */
   L(X-27,Z-22,X-2.9,Z-22,PAL.dark,.5);L(X+2.9,Z-22,X+27,Z-22,PAL.dark,.5);L(X-27,Z-22,X-27,Z-2,PAL.dark,.5);L(X+27,Z-22,X+27,Z-2,PAL.dark,.5);/* the fence and the gate */
   R(X,Z-22,6.8,.6,'#e8452c');
   Q(X-18,Z-17.7,14.4,8.2,PAL.thatch);if(fine){R(X-18,Z-17.7,12,6,PAL.thatch2);L(X-18,Z-21.8,X-18,Z-13.6,PAL.thatch,.35)}/* the tiki bar roof */
   Q(X+14,Z-16.5,18,10.8,PAL.thatch);R(X+14,Z-16.5,15.6,8.4,PAL.thatch2);if(fine)L(X+14,Z-21.9,X+14,Z-11.1,PAL.thatch,.5);/* the stage roof */
   D(X+14,Z-16.5,1.4,'#ff7ab8');/* the pink marker over the stage */
   [-23,-17,-11].forEach((a,i)=>{C(X+a,Z-9,1.7,i?PAL.teal:PAL.coral);C(X+a,Z-9,.35,PAL.dark)});/* deck umbrellas */
   [[-17,2.5,PAL.coral],[-11,2.5,PAL.teal],[-5,2.5,'#ffd23d'],[-17,8.5,PAL.teal],[-11,8.5,'#ffd23d'],[-5,8.5,PAL.coral]].forEach(([a,b,c])=>{C(X+a,Z+b,2,c);C(X+a,Z+b,.3,PAL.dark);if(fine)[-.95,.95].forEach((o,j)=>R(X+a+o,Z+b+1.9,.7,1.8,j?PAL.coral:PAL.teal))});/* beach umbrellas and sunbeds */
   Q(X-24.5,Z+8,5.2,5.2,'#7a5230');R(X-24.5,Z+8,1.8,1.8,'#ff9a2e');C(X-24.5,Z+8,.7,'#ffd23d');/* the fire pit */
   R(X+16,Z+10.5,9,11,'#f6ecc8');R(X+16,Z+10.5,8.6,10.6,PAL.sand);L(X+11.5,Z+10.5,X+20.5,Z+10.5,'#fff',.35);R(X+16,Z+5,9,.2,'#fff');R(X+16,Z+16,9,.2,'#fff');/* the volleyball court and net */
   Q(X+24,Z+14,2.7,2.7,'#fff3d9');R(X+24,Z+14,2.2,2.2,'#e8452c');/* the lifeguard tower */
   if(fine)['#ff6f61','#2aa7a1','#ffd23d','#8ad8ff','#e8e1d0'].forEach((c,i)=>R(X+2.4+i*.5,Z+13,.45,.1,c));/* surfboard rack */
   [[-26,-19],[26,-19],[-26,-4],[26,-4],[-26,14],[26,10]].forEach(([a,b])=>{C(X+a,Z+b,2.4,'#2f8a3a');C(X+a,Z+b,1,'#5cc05a')});/* palms */
  }
  /* ---- the Lighthouse: islet, pier, tower ---- */
  {const X=LH_X,Z=LH_Z,I=ISLET,h=.7071;
   R(X,Z,I*2+26,I*2+26,'rgba(142,230,224,.55)');/* the pale shallows */
   const pz0=Z+I-2,pz1=PIER_Z0,len=pz1-pz0;
   R(X,Z,I*2+6.8,I*2+6.8,'rgba(255,255,255,.45)');/* foam */
   R(X,Z,I*2,I*2,'#7c8087');D(X,Z,I*1.7*h,'#72767c');/* rock: a square and a turned square */
   R(X,Z,I*1.6,I*1.6,'#6a9a52');D(X,Z,I*1.35*h,'#6a9a52');/* grassy top */
   for(let i=0;i<14;i++){const a=i/14*6.283+Math.sin(i*3.1)*.2,rr=I*1.2+(i%3)*1.4,w=1.6+(i%4)*.7;R(X+Math.cos(a)*rr,Z+Math.sin(a)*rr,w,w*.9,['#8d9096','#7c8087','#6f7378','#9a9a94'][i%4])}/* rocks round the edge */
   Q(X,pz0+len/2,5.2,len,'#9a6a3c');if(fine)for(let z=pz0+1;z<pz1;z+=1.3)L(X-2.6,z,X+2.6,z,'#5a3a22',.08);/* the pier */
   [-1,1].forEach(a=>{L(X+a*2.7,pz0,X+a*2.7,pz1,'#5a3a22',.2);for(let z=pz0+2;z<pz1;z+=6)C(X+a*2.7,z,.25,'#ffd27a')});
   Q(X,Z,10,10,'#7c8087');/* the base */
   R(X,Z,8.4,8.4,'#6a6e74');R(X,Z,8,8,'#2a2a2e');/* the gallery floor */
   L(X-3.9,Z-3.9,X+3.9,Z-3.9,'#e8e8e8',.2);L(X-3.9,Z+3.9,X+3.9,Z+3.9,'#e8e8e8',.2);L(X-3.9,Z-3.9,X-3.9,Z+3.9,'#e8e8e8',.2);L(X+3.9,Z-3.9,X+3.9,Z+3.9,'#e8e8e8',.2);/* the rail */
   R(X,Z,5.6,5.6,'#f4f1ea');if(fine){R(X,Z,4.4,4.4,'#d6402f');R(X,Z,3.2,3.2,'#f4f1ea')}/* the striped tower seen from above */
   R(X,Z,3.4,3.4,'#d6402f');R(X,Z,2.6,2.6,'#e5503d');R(X,Z,1.8,1.8,'#ffe9a8');R(X,Z,.9,.9,'#ffffff');/* the red cap and the lamp */
  }
  x.restore()}catch(e){try{x.restore()}catch(e2){}if(!window.__ipMapErr){window.__ipMapErr=1;console.error('island map',e)}}return r}}

/* ---------- state ---------- */
function st(){if(!S.bcg||typeof S.bcg!='object')S.bcg={last:-999,list:[]};if(!Array.isArray(S.bcg.list))S.bcg.list=[];return S.bcg}
const find=id=>st().list.find(o=>o.id===id);
const booked=()=>st().list.find(o=>o.st==1);
const best=()=>(S.songs||[]).slice().sort((a,b)=>(b.q||0)-(a.q||0));
const scale=()=>.35+FL()*.08+Math.sqrt(S.listeners||0)*.0004;
function baseFee(){return Math.max(100,Math.round((120+FL()*30+Math.sqrt(S.listeners||0)*.35)*(.85+Math.random()*.3)/10)*10)}
const note=(from,body)=>{S.msgs.push({id:S.nid++,from:from||'Sunset Beach Club',state:9,unread:1,day:S.day,body})};

/* ---------- the email ---------- */
function offer(){const s=st(),o={id:S.nid++,pay:baseFee(),exp:S.day+2,day:S.day+ri(1,3),st:0};s.list.push(o);s.last=S.day;if(s.list.length>12)s.list=s.list.slice(-12);
 S.msgs.push({id:S.nid++,from:'Sunset Beach Club Bookings',state:9,unread:1,day:S.day,bcg:o.id,
  body:'Hi '+(S.artist||'there')+'! Mara here, I book the stage at the Sunset Beach Club on the south-east beach. We would love you to play our golden hour set on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+'. Pick up to three songs. Fee: '+fm(o.pay)+' (a good crowd means a bit more, a quiet one a bit less), paid when you come off stage. Just be at the stage in that window. This offer stands until Day '+o.exp+'.'});
 try{snd('ping');say('Sunset Beach Club emailed you a gig offer. Check Messages.')}catch(e){}try{updateVersion()}catch(e){}}
window.bcgAccept=function(mid){const m=S.msgs.find(x=>x.id==mid),o=m&&find(m.bcg);if(!o||o.st!=0)return;if(S.day>o.exp){o.st=4;return pcR()}
 if(booked()){sn('err');return say('You already have a Beach Club gig booked.')}
 try{const fk=(S.festBk||[]).find(b=>b.st!=2&&b.st!=1&&b.day==o.day&&[[600,840],[840,1080],[1080,1320],[1320,1560]][b.slot]&&[[600,840],[840,1080],[1080,1320],[1320,1560]][b.slot][0]<SLOT[1]&&[[600,840],[840,1080],[1080,1320],[1320,1560]][b.slot][1]>SLOT[0]);if(fk){sn('err');return say('You already have a festival set on Day '+o.day+' at that time. Cancel it first.')}}catch(e){}
 o.st=1;note(m.from,'Booked! See you on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+', at the stage on the beach. Sound check is on us.');
 sn('chime');say('Beach Club gig booked for Day '+o.day+'.');try{updateVersion()}catch(e){}pcR()};
window.bcgDecline=function(mid){const m=S.msgs.find(x=>x.id==mid),o=m&&find(m.bcg);if(!o||o.st!=0)return;o.st=2;sn('pop');pcR()};
{const pm=PA.msg;PA.msg=function(){let h=pm.apply(this,arguments);const m=S.msgs.find(x=>x.id==S.chat);
 if(m&&m.bcg!=null){const o=find(m.bcg);
  if(o&&o.st==0&&S.day<=o.exp)h=h.replace(/<div class=cin><small[^>]*>Official account\. No replies\.<\/small><\/div>/,`<div class=cin style="gap:8px;padding:8px"><button class=go onclick="bcgAccept(${m.id})">Accept ${fm(o.pay)} gig</button><button onclick="bcgDecline(${m.id})">Decline</button></div>`);
  else if(o)h=h.replace(/Official account\. No replies\./,o.st==2?'You declined this offer.':o.st==1||o.st==3||o.st==5?'You accepted this offer.':'This offer has expired.')}
 return h}}
/* every morning: lapse old offers, remind on gig day, miss a gig that was not played, maybe a new offer */
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{const s=st();
 s.list.forEach(o=>{if(o.st==0&&S.day>o.exp)o.st=4;
  if(o.st==1&&S.day>o.day){o.st=5;note('Sunset Beach Club Bookings','We missed you on Day '+o.day+'. No hard feelings, but we gave the slot away. Maybe next time.')}
  if(o.st==1&&S.day==o.day){note('Sunset Beach Club Bookings','Today is the day! Be at the stage on the beach between '+hm(SLOT[0])+' and '+hm(SLOT[1])+'.');try{say('Beach Club gig tonight, 18:00 to 21:00.')}catch(e){}}});
 if(S.artist&&(S.songs||[]).length&&!s.list.some(o=>o.st==0||o.st==1)&&S.day-s.last>=2&&Math.random()<.5)offer()}catch(e){console.error('beach club offers',e)}return r}}

/* ---------- the stage ---------- */
function stageUse(){if(mode!='play'||away())return;const o=booked();
 if(!o){sn('err');return say('Nobody is booked on this stage. Watch Messages for a Beach Club gig offer.')}
 if(S.day<o.day){sn('err');return say('Your Beach Club gig is on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+'.')}
 const m=mins();if(m<SLOT[0]){sn('err');return say('Doors open at '+hm(SLOT[0])+'. Come back for your slot.')}
 if(m>=SLOT[1]){sn('err');return say('Your slot is over.')}
 if((S.energy||0)<15){sn('err');return say('You are too tired to play. Rest or eat first.')}
 mode='menu';PICK=[];setUI(o)}
let PICK=[];
function setUI(o){const L=best().slice(0,8);
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(520px,94vw)"><div class=pehd><span class=pek>Sunset Beach Club · ${hm(SLOT[0])}-${hm(SLOT[1])}</span><h2>Golden hour set</h2></div><div class=pebd>
 <p class=pebl>Pick up to three songs. Higher quality songs make the crowd go wild. Fee ${fm(o.pay)}, more or less depending on the crowd.</p>
 <div class=pelist>${L.map(s=>`<button class=pesong style="${PICK.includes(s.id)?'outline:2px solid #ff7ab8':''}" onclick="bcPick(${s.id})"><b>${PICK.includes(s.id)?'✓ ':''}${E(s.title)}</b><small>${E(s.g)} · quality ${Math.round(s.q||0)} · ${fmt(s.streams||0)} streams</small></button>`).join('')}</div>
 <div class=row2><button class=go ${PICK.length?'':'disabled'} onclick="bcPlay()">Play ${PICK.length||''} song${PICK.length==1?'':'s'}</button><button onclick="closeUI()">Not now</button></div></div></div>`}
window.bcPick=function(id){const o=booked();if(!o||mode!='menu')return;const i=PICK.indexOf(id);if(i>=0)PICK.splice(i,1);else if(PICK.length<3)PICK.push(id);else{sn('err');return}sn('pop');setUI(o)};
window.bcPlay=function(){const o=booked();if(!o||!PICK.length||mode!='menu')return;const L=PICK.map(id=>(S.songs||[]).find(x=>x.id==id)).filter(Boolean);if(!L.length)return;PICK=[];startSet(o,L)};

/* ---------- the gig: the festival set itself (70c-festival-set.js: songs, crowd minigames, walking round the stage in 188, autographs in 233),
   run on the club's stage, which is the size of The Pit. BCS is shaped like an FSTG entry but is not in FSTG, so the festival ground, board and map ignore it ---------- */
const BCS={n:5,name:'Sunset Beach Club',req:0,mult:2,cx:CLUB_X+14,zb:CLUB_Z-21,w:16,d:9,h:1.3,H:8,base:140,cap:450,figs:260,col:'#ff7ab8',bc:1};
BCS.zf=BCS.zb+BCS.d;BCS.x0=BCS.cx-BCS.w/2;BCS.x1=BCS.cx+BCS.w/2;BCS.oz=BCS.zf+2.4;BCS.ex=[];BCS.ix=CLUB_X+3.8;BCS.iz=CLUB_Z-15.7;BCS.area=[CLUB_X-3,BCS.zf,CLUB_X+36,CLUB_Z+4.5];
FSLOT.bc=SLOT.slice();/* a named entry, so the festival's four slots and FSLOT.length stay as they are */
const gig=()=>FEST.view===BCS;
/* the festival crowd for this stage, parked in the club's group (festCrowdBuild adds to the festival group: a stand-in takes it, the real one is never created here) */
function bcCrowd(){if(BCS.cr)return;const o=FEST.grp.fest,h=BCS.hold=new THREE.Group();root.add(h);FEST.grp.fest=h;
 try{festCrowdBuild(BCS)}finally{if(o)FEST.grp.fest=o;else delete FEST.grp.fest}
 const i=FEST.crowd.indexOf(BCS.cr);if(i>=0)FEST.crowd.splice(i,1);h.visible=false}
function startSet(o,L){if(!club||away())return;bcCrowd();BCS.cr.C=festAmbient(BCS);
 const bk={id:-5,day:S.day,n:5,slot:'bc',songs:L.map(s=>s.id),st:0,bc:o.id};
 FSTG.push(BCS);try{festStartBooked(bk)}finally{FSTG.splice(FSTG.indexOf(BCS),1)}}
/* festTick only runs a set on festival days: run it here for the beach, and pose this crowd (the festival loop does not know it) */
{const f0=festTick;festTick=function(dt){const set=FEST.set,v=FEST.view3,mine=gig()&&set&&set.st===BCS;
  if(BCS.hold)BCS.hold.visible=!!mine;
  if(mine&&v){v.back.visible=false;/* the park tree line stands at the festival */
   if(!(FEST.ph=='fest'&&FEST.grp.fest))festOnStage(dt,FEST.t);
   const cr=BCS.cr;if(cr&&FEST.set===set)festCrowdPose(cr,FEST.t,cr.shown<0,v.cam)}
  return f0.apply(this,arguments)}}
/* the set is over: the club's fee, by the crowd's score and by how much of the set you played */
{const e0=festEnd;festEnd=function(){const set=FEST.set,live=!!set&&set.st===BCS&&!set.end,r=e0.apply(this,arguments);if(live&&set.end)try{bcDone(set)}catch(e){console.error('beach club fee',e)}return r}}
function bcDone(set){const o=find(set.bk.bc);if(!o)return;o.st=3;
 const part=Math.min(1,set.done.reduce((a,d)=>a+d.f,0)/set.list.length),fee=Math.round(o.pay*(.7+.6*Math.min(1,set.avg||.5))*part);
 S.money=+((S.money||0)+fee).toFixed(2);S.earn=(S.earn||0)+fee;set.pay=+(set.pay+fee).toFixed(2);sv();
 note('Sunset Beach Club Bookings','Thank you for tonight, '+(S.artist||'')+'! About '+fmt(set.peak)+' people on the sand'+(fee?' and a '+fm(fee)+' fee on its way to you':'')+'. Come back anytime.');
 festSumUI(set)}
/* the lighthouse's first person camera (the gig renders through the festival's stage camera, see 70c) */
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(LHV&&lhCam&&c===cam)return r0(sc,lhCam);return r0(sc,c)}}

/* ---------- the bar ---------- */
function bar(){if(mode!='play'||away())return;if(S.bcBar===S.day){sn('err');return say('Mara says: one smoothie a day, you will float away!')}
 if((S.money||0)<8){sn('err');return say('A smoothie is $8.')}if((S.energy||0)>=100){sn('err');return say('You are already full of energy.')}
 S.money=+(S.money-8).toFixed(2);S.energy=Math.min(100,(S.energy||0)+12);S.bcBar=S.day;sv();sn('eat');say('Mango smoothie. +12 energy.')}

/* ---------- the lighthouse: climb to the gallery and walk round the top in first person ---------- */
let LHV=null,lhCam=null;
function climb(){if(mode!='play'||away())return;mode='menu';const fresh=S.lhDay!==S.day;
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(420px,94vw)"><div class=pehd><span class=pek>North Point Islet</span><h2>Lighthouse</h2></div><div class=pebd><p class=pebl>Spiral stairs up to the gallery. You can see the whole island from there.</p>${fresh?'<p class=pesm>First climb of the day: +20 energy.</p>':'<p class=pesm>You already got today\'s sea air.</p>'}<div class=row2><button class=go onclick="lhGo()">Climb up</button><button onclick="closeUI()">Not now</button></div></div></div>`}
let lhH=null;
window.lhGo=function(){if(!light||LHV||mode!='menu')return;$('ui').innerHTML='';
 if(S.lhDay!==S.day){S.lhDay=S.day;S.energy=Math.min(100,(S.energy||0)+20);sv();sn('chime');say('Fresh sea air at the top. +20 energy.')}
 if(!lhCam){lhCam=new THREE.PerspectiveCamera(72,1,.1,4000);lhCam.rotation.order='YXZ'}
 LHV={x:0,z:2.8,yaw:Math.PI,pit:-.08,f:light.userData.floor,fog:scene.fog&&scene.fog.near!=null?[scene.fog.near,scene.fog.far]:null,drag:0,lab:[]};
 if(LHV.fog){scene.fog.near=500;scene.fog.far=3200}
 try{P.mesh.visible=false}catch(e){}document.body.classList.add('fston');
 const d=document.createElement('div');d.id='lhv';d.style.cssText='position:fixed;inset:0;z-index:55;pointer-events:none;font-size:12px;color:var(--t);overflow:hidden';
 d.innerHTML='<div id=lhl></div><div class=box style="position:absolute;left:50%;bottom:18px;transform:translateX(-50%);display:flex;gap:12px;align-items:center;pointer-events:auto;padding:8px 12px;font-size:12px;color:var(--m)"><span>WASD walk \u00b7 mouse or arrows look \u00b7 Shift run</span><button onclick="lhDown()">Climb down</button></div>';
 document.body.appendChild(d);const box=d.firstChild;
 /* a small label for each place on the map: name and distance */
 POIS.forEach(q=>{if(q[2]=='Lighthouse')return;const e=document.createElement('div');e.style.cssText='position:absolute;left:0;top:0;white-space:nowrap;background:#0b0f0dd9;border:2px solid #000;box-shadow:2px 2px 0 #0008;padding:2px 6px;border-left:4px solid '+(q[3]||'#fff')+';display:none';box.appendChild(e);LHV.lab.push({q,e})});
 const cv=renderer.domElement,mm=e=>{if(!LHV)return;if(document.pointerLockElement===cv||LHV.drag){LHV.yaw-=(e.movementX||0)*.0025;LHV.pit=Math.max(-1.2,Math.min(1.2,LHV.pit-(e.movementY||0)*.0025))}},
  md=e=>{if(!LHV||e.target!==cv)return;LHV.drag=1;try{cv.requestPointerLock&&cv.requestPointerLock()}catch(x){}},mu=()=>{if(LHV)LHV.drag=0},
  kd=e=>{if(!LHV)return;const k=(e.key||'').toLowerCase();if(k=='e'||k=='escape'){e.preventDefault();e.stopPropagation();lhDown()}else if(k.startsWith('arrow')||k==' ')e.preventDefault()},
  ts=e=>{if(!LHV||e.target!==cv)return;LHV.tx=e.touches[0].clientX;LHV.ty=e.touches[0].clientY},
  tm=e=>{if(!LHV||LHV.tx==null||e.target!==cv)return;const t=e.touches[0];LHV.yaw-=(t.clientX-LHV.tx)*.005;LHV.pit=Math.max(-1.2,Math.min(1.2,LHV.pit-(t.clientY-LHV.ty)*.005));LHV.tx=t.clientX;LHV.ty=t.clientY};
 window.addEventListener('mousemove',mm);window.addEventListener('mousedown',md);window.addEventListener('mouseup',mu);window.addEventListener('keydown',kd,true);window.addEventListener('touchstart',ts,{passive:true});window.addEventListener('touchmove',tm,{passive:true});
 lhH=()=>{window.removeEventListener('mousemove',mm);window.removeEventListener('mousedown',md);window.removeEventListener('mouseup',mu);window.removeEventListener('keydown',kd,true);window.removeEventListener('touchstart',ts);window.removeEventListener('touchmove',tm)}};
window.lhDown=function(){const v=LHV;if(!v)return;LHV=null;if(lhH){lhH();lhH=null}try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}
 if(v.fog){scene.fog.near=v.fog[0];scene.fog.far=v.fog[1]}const d=document.getElementById('lhv');if(d)d.remove();try{P.mesh.visible=true}catch(e){}document.body.classList.remove('fston');mode='play';sn('pop')};
const lhV3=new THREE.Vector3();
function lhFrame(dt){const v=LHV,d=Math.min(dt||.016,.1);
 v.yaw+=((keys.arrowleft?1:0)-(keys.arrowright?1:0))*1.8*d;v.pit=Math.max(-1.2,Math.min(1.2,v.pit+((keys.arrowup?1:0)-(keys.arrowdown?1:0))*1.2*d));
 let fx=(keys.w?1:0)-(keys.s?1:0),sx=(keys.d?1:0)-(keys.a?1:0);if(window.TCHJ&&TCHJ.on){fx=-TCHJ.y;sx=TCHJ.x}
 const sp=(keys.shift?4:2.2)*d,sn_=Math.sin(v.yaw),cs=Math.cos(v.yaw);v.x+=(-sn_*fx+cs*sx)*sp;v.z+=(-cs*fx-sn_*sx)*sp;
 const O=3.55,I=1.75;v.x=Math.max(-O,Math.min(O,v.x));v.z=Math.max(-O,Math.min(O,v.z));
 if(Math.abs(v.x)<I&&Math.abs(v.z)<I){if(I-Math.abs(v.x)<I-Math.abs(v.z))v.x=(v.x<0?-1:1)*I;else v.z=(v.z<0?-1:1)*I}
 lhCam.position.set(LH_X+v.x,v.f+1.65,LH_Z+v.z);lhCam.rotation.set(v.pit,v.yaw,0);lhCam.aspect=innerWidth/innerHeight;lhCam.updateProjectionMatrix();lhCam.updateMatrixWorld(true);
 /* labels: the nearest places in view, skipping any that would sit on top of one already shown */
 const W=innerWidth,H=innerHeight,c=[];v.lab.forEach(l=>{l.e.style.display='none';const dx=l.q[0]-lhCam.position.x,dz=l.q[1]-lhCam.position.z,dist=Math.hypot(dx,dz);lhV3.set(l.q[0],2,l.q[1]).project(lhCam);
  if(lhV3.z>1||lhV3.z<0||Math.abs(lhV3.x)>.98||Math.abs(lhV3.y)>.95||dist>1700)return;c.push({l,dist,x:(lhV3.x+1)/2*W,y:(1-lhV3.y)/2*H})});
 c.sort((a,b)=>a.dist-b.dist);const shown=[];
 c.forEach(o=>{if(shown.length>=9||shown.some(p=>Math.abs(p.x-o.x)<150&&Math.abs(p.y-o.y)<26))return;shown.push(o);const e=o.l.e;e.style.display='block';e.style.transform='translate('+Math.round(o.x)+'px,'+Math.round(o.y)+'px) translate(-50%,-120%)';const t=o.l.q[2]+' \u00b7 '+Math.round(o.dist/10)*10+' m';if(e.textContent!==t)e.textContent=t})}

/* ---------- every frame ---------- */
let spin=0,HY=0;/* the height the walker is lifted to (other files reset SY every frame, so it is smoothed here and then written to SY) */
function hy(h,dt){HY+=(h-HY)*Math.min(1,(dt||.016)*14);if(Math.abs(HY-h)<.01)HY=h;SY=HY;P.mesh.position.y=HY}
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='title')return r;if(!built)build();const off=away();root.visible=!off;if(off)return r;spin+=dt||0;
 const night=(S.t||0)>=290,o=booked(),m=mins();
 const open=o&&S.day==o.day&&m>=SLOT[0]&&m<SLOT[1];
 INT.forEach(i=>{if(i.bc=='stage')i.l=open?'Play your Beach Club set':o?(S.day<o.day?'Beach Club gig on Day '+o.day:m<SLOT[0]?'Beach Club gig at '+hm(SLOT[0]):'Beach Club gig (over)'):'Sunset Beach Club stage';
  if(i.bc=='bar')i.l=S.bcBar===S.day?'Beach bar (smoothie taken today)':'Beach bar: smoothie $8';
  if(i.lh)i.l=S.lhDay===S.day?'Lighthouse (visited today)':'Climb the Lighthouse'});
 if(LHV)lhFrame(dt);
 if(club){const dd=Math.hypot(P.x-CLUB_X,P.z-CLUB_Z);club.visible=dd<450||gig();if(club.visible){if(dd<260&&!ppG)buildPeople(club);
  const lx=P.x-CLUB_X,lz=P.z-CLUB_Z,inside=gig()||(lx>-25&&lx<-11&&lz<-13&&lz>-22)||(lx>5&&lx<23&&lz<-11&&lz>-22),show=gig()||!!open;
  RM.forEach(m=>{m.opacity+=((inside?.1:1)-m.opacity)*.18;m.depthWrite=m.opacity>.6});setGlow(night||show,show);
  if(ppG)PPL.forEach(p=>{const g=p.o.g;if(p.k=='crowd'){g.visible=show&&!gig();if(show){const up=false;g.position.y=p.y+Math.abs(Math.sin(spin*3+p.ph))*(up?.14:.03);p.o.arms.forEach((a,i)=>a.rotation.x=up?-2.7+Math.sin(spin*5+p.ph+i)*.4:-.1)}}
   else if(p.k=='vb'){g.position.y=Math.abs(Math.sin(spin*2.2+p.ph))*.3;p.o.arms.forEach(a=>a.rotation.x=-1.8)}else if(p.k=='bar')p.o.arms[1].rotation.x=-.8+Math.sin(spin*3)*.25});
  club.userData.q1.concat(club.userData.q2).forEach(v=>{const bl=v.userData&&v.userData.ball;if(bl)bl.position.y=2.3+Math.abs(Math.sin(spin*2.2))*1.2})}}
 /* stand ON the deck, the stage and the steps (the ground is flat, so the walker is lifted to the height of what is under them) */
 if(club&&club.visible&&mode=='play'&&!IN&&!HIN&&P.mesh){const lx=P.x-CLUB_X,lz=P.z-CLUB_Z;
  if(lx>-30&&lx<30&&lz>-40&&lz<20){let h=0;
   if(lx>-27.2&&lx<27.2&&lz>-22.2&&lz<-6){h=.25;if(lx>6&&lx<22.4&&lz>-21&&lz<-12)h=1.3;else if(lz>-15.8&&lz<-13.2){if(lx>5.1&&lx<=6)h=.95;else if(lx>4.4&&lx<=5.1)h=.6}}
   else if(Math.abs(lx)<3&&lz>=-6&&lz<-5.4)h=.17;else if(Math.abs(lx)<3&&lz>=-5.4&&lz<-4.8)h=.08;
   if(h>0||HY>0){hy(h,dt)}}else HY=0}
 /* the pier and the rock islet are raised too: stand on them, not in them */
 if(light&&PIER&&mode=='play'&&!IN&&P.mesh&&Math.abs(P.x-LH_X)<40&&Math.abs(P.z-LH_Z)<(PIER_Z0-LH_Z)+10){let h=0;const d=Math.max(Math.abs(P.x-LH_X),Math.abs(P.z-LH_Z));
  if(d<10.2)h=1.35;else if(d<ISLET-1.5)h=1.1;else if(P.x>PIER.x0&&P.x<PIER.x1&&P.z>PIER.z0&&P.z<PIER.z1)h=.4;
  hy(h,dt)}
 if(club&&club.userData.mk){const k=club.userData.mk;k.visible=!!open;k.rotation.y=spin*1.6;k.position.y=club.userData.mky+Math.sin(spin*2.2)*.3}
 if(club&&club.userData.fires)club.userData.fires.forEach(f=>{if(!f.visible)return;const u=f.userData;u.fl.forEach(o=>{const k=.8+Math.sin(spin*9+o.ph)*.25+Math.sin(spin*13+o.ph*2)*.15;o.m.scale.y=k;o.m.position.y=(o.b!=null?o.b:o.y0-o.hh/2)+o.hh*k/2});u.sp.forEach(o=>{const t=(spin*.7+o.ph)%1;o.m.position.set(u.fx+o.ox*(.5+t)+Math.sin(spin*3+o.ph*9)*.1,.9+t*2.2,u.fz+o.oz*(.5+t));o.m.scale.setScalar(Math.max(.01,1-t))})});
 if(light){const u=light.userData;u.beam.rotation.y=spin*.9;u.beam.visible=night;u.lant.material.color.set(night?0xfff2b0:0xcfd8c0)}
 }catch(e){if(!window.__ipErr){window.__ipErr=1;console.error('island places',e)}}return r}}
})();
