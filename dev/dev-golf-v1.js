/* ===== dev only: Wavefern Golf Club (v54.5.0) =====
   Loaded after dev-island-places.js. Add ?nogolf to skip it. Nothing here runs at all unless the island is on.
   Three 6 hole courses sit on the free land west of Central Park, with a clubhouse (the door is a map place and an INT prompt):
     Meadow Links (easy, wide, gentle hills), Dune Run (wind, lots of sand), Highland Fling (big hills, narrow, ponds).
   Everything is blocky and in real metres. The ground is a low poly height field with five kinds of grass/ground (tee, fairway,
   rough, fringe, green) plus sand and water; trees, the clubhouse and the carts are merged boxes.
   Swing (Wii Golf like): aim with A/D, pick a club with the mouse wheel or 1-4, HOLD the left mouse button and PUSH the mouse forward.
   How fast you push is the power (the red bar on the left), the direction you push in is the direction of the shot. Space is a keyboard
   fallback (hold to charge, let go to hit). The ball flight is worked out when you hit and then played back, so the cutscene camera
   follows it, and a beacon shows where it lands. Putting uses the same swing with a soft push. V switches first / third person.
   Golf carts: $25 a round, WASD to drive between shots, E to get out at your ball; no carts on greens or in water, sand slows them.
   State (saved, old saves start empty): S.golf={best:[strokes,strokes,strokes],rounds,aces}. Nothing else is saved; a round is not saved. */
(function(){
if(!window.FW_ISLAND||/[?&]nogolf/.test(location.search))return;
if(typeof THREE=='undefined'||typeof WORLD=='undefined'||typeof S=='undefined'||typeof renderer=='undefined'||typeof cam=='undefined')return;
const FI=window.FW_ISLAND;
const sn=k=>{try{snd(k)}catch(e){}},say2=t=>{try{say(t)}catch(e){}},sv=()=>{try{autoSave()}catch(e){}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
let sd0=1;const seed=n=>{sd0=(n*2654435761)%2147483647||1},R=()=>{sd0=(sd0*16807)%2147483647;return sd0/2147483647};
const GR=9.8,KD=.0035,KL=.0042;
/* surface classes: 0 rough, 1 fairway, 2 fringe, 3 green, 4 tee, 5 sand, 6 water, 7 out of bounds */
const SFN=['Rough','Fairway','Fringe','Green','Tee box','Bunker','Water','Out of bounds'];
/* bounce (restitution, tangential keep), roll friction (m/s2), shot power and spread for the lie */
const BOUNCE=[[.18,.3],[.3,.5],[.3,.5],[.32,.6],[.3,.5],[0,.08],[0,0],[0,0]],MU=[6,1.7,2.1,.8,1.7,14,99,99],LIE=[[.78,.06],[1,0],[1,0],[1,0],[1,0],[.6,.08]];
const CL=[{n:'Driver',v:52.3,loft:12,sp:.02,r:200},{n:'Iron',v:39.15,loft:24,sp:.012,r:135},{n:'Wedge',v:26.9,loft:46,sp:.01,r:70},{n:'Putter',v:8,loft:0,sp:.004,r:40,putt:1}];
const LANE=19,PH=3;

/* ---------- the three courses: [par, metres] per hole; lanes run east-west and alternate direction ---------- */
const CRS=[
 {n:'Meadow Links',sub:'Easy. Wide fairways, gentle hills, one pond.',x0:-210,x1:-40,z0:-178,amp:1,fq:1,hw:11,wind:2.5,nb:1,ngb:1,wt:[1],carry:[],
  col:{rough:'#3d8a36',fw:'#6dc24b',fr:'#58b84c',gr:'#4fdc5c',tee:'#7ad257',sand:'#efe0a8',leaf:['#2f7a34','#3a8c3c','#47a047'],flag:'#ff4d4d'},
  H:[[3,95],[4,135],[3,105],[4,145],[3,110],[4,150]]},
 {n:'Dune Run',sub:'Windy. Sand everywhere, rolling dunes.',x0:-405,x1:-225,z0:-178,amp:1.5,fq:1.35,hw:9,wind:5.5,nb:3,ngb:2,wt:[3],carry:[],
  col:{rough:'#9b9658',fw:'#8fbf4a',fr:'#7db548',gr:'#4fd35a',tee:'#8fc850',sand:'#f3e4ac',leaf:['#6d8f3a','#7b9c44','#58803a'],flag:'#ffd23f'},
  H:[[3,115],[4,150],[3,100],[4,155],[3,125],[4,150]]},
 {n:'Highland Fling',sub:'Hard. Big hills, narrow fairways, ponds.',x0:-625,x1:-415,z0:-158,amp:2,fq:.9,hw:8,wind:3.5,nb:2,ngb:1,wt:[2,4],carry:[0,3],
  col:{rough:'#3b6a3a',fw:'#5aa944',fr:'#4a9c44',gr:'#46cf58',tee:'#6bbd4c',sand:'#e8d9a0',leaf:['#27573a','#2f6a40','#3b7a46'],flag:'#b06bff'},
  H:[[3,120],[4,160],[4,185],[3,100],[4,175],[3,130]]}];
const pa=(o,u)=>u<.5?[lerp(o.path[0][0],o.path[1][0],u*2),lerp(o.path[0][1],o.path[1][1],u*2)]:[lerp(o.path[1][0],o.path[2][0],u*2-1),lerp(o.path[1][1],o.path[2][1],u*2-1)];
function sd(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz,t=l?clamp(((px-ax)*dx+(pz-az)*dz)/l,0,1):0;return Math.hypot(px-ax-dx*t,pz-az-dz*t)}
const pdist=(o,x,z)=>Math.min(sd(x,z,o.path[0][0],o.path[0][1],o.path[1][0],o.path[1][1]),sd(x,z,o.path[1][0],o.path[1][1],o.path[2][0],o.path[2][1]));
function hill(C,x,z){return C.amp*(Math.sin(x*.037*C.fq+C.p1)*Math.cos(z*.051*C.fq+C.p2)+.55*Math.sin((x+z)*.083*C.fq+C.p3)+1.55)}
const edgeW=(C,x,z)=>sm(Math.min(x-C.x0+10,C.x1+10-x,z-C.bz0,C.bz1-z)/16);
CRS.forEach((C,ci)=>{seed(ci*131+7);C.p1=R()*6.28;C.p2=R()*6.28;C.p3=R()*6.28;C.bz0=C.z0-16;C.bz1=C.z0+LANE*5+16;C.trees=[];
 C.holes=C.H.map(([par,len],j)=>{const zc=C.z0+j*LANE,d=j%2?-1:1,tx=d>0?C.x0+10:C.x1-10,px=tx+d*len,pz=zc+(R()-.5)*4,bend=(R()-.5)*(j%2?12:14);
  const o={par,len,d,zc,tee:[tx,zc],pin:[px,pz],hw:C.hw-(par==3?1.5:0),gr:par==3?9:10,bk:[],wt:[],sx:(R()-.5)*.05,sz:(R()-.5)*.05,i:j};
  o.path=[[tx,zc],[tx+d*len*.5,zc+bend],[px,pz]];o.ty=hill(C,tx,zc)*edgeW(C,tx,zc);o.gy=hill(C,px,pz)*edgeW(C,px,pz);
  const nb=par==4?C.nb:Math.max(0,C.nb-2);
  for(let k=0;k<nb;k++){const u=.5+.32*R(),p=pa(o,u),s=R()<.5?-1:1,r=3+R()*2.4;o.bk.push([p[0],p[1]+s*(o.hw*.5+r*.55),r])}
  for(let k=0;k<C.ngb;k++){const a=R()*6.28,r=3.4+R()*2;o.bk.push([px+Math.cos(a)*(o.gr+r*.5+1.5),pz+Math.sin(a)*(o.gr+r*.5+1.5),r])}
  if(C.wt.includes(j)){const p=pa(o,.56),s=R()<.5?-1:1;o.wt.push([p[0],p[1]+s*(o.hw+5),9,6])}
  if(C.carry.includes(j)){const p=pa(o,.42);o.wt.push([p[0],p[1],6,o.hw+4])}
  o.wt.forEach(w=>{w.push(hill(C,w[0],w[1])*.45)});
  return o});
});
/* surface under (x,z): the highest ranked of every hole's features */
const PR=[0,2,1,5,3,6,7];/* rank by class: rough, fairway, fringe, green, tee, sand, water */
function surf(ci,x,z){const C=CRS[ci];if(x<C.x0-4||x>C.x1+4||z<C.bz0||z>C.bz1)return 7;let best=0,bp=0;
 for(const o of C.holes){if(Math.abs(z-o.zc)>42)continue;
  for(const w of o.wt)if(((x-w[0])/w[2])**2+((z-w[1])/w[3])**2<1)return 6;
  let c=0;
  for(const b of o.bk)if(((x-b[0])/b[2])**2+((z-b[1])/b[2])**2<1){c=5;break}
  if(!c){const dx=Math.abs(x-o.pin[0]),dz=Math.abs(z-o.pin[1]);
   if((dx/o.gr)**2.6+(dz/(o.gr*.85))**2.6<1)c=3;else if((dx/(o.gr+2.2))**2.6+(dz/(o.gr*.85+2.2))**2.6<1)c=2;
   else if(Math.abs(x-o.tee[0])<5&&Math.abs(z-o.tee[1])<3.2)c=4;else if(pdist(o,x,z)<o.hw)c=1}
  if(PR[c]>bp){bp=PR[c];best=c}}
 return best}
function H(ci,x,z){const C=CRS[ci];let h=hill(C,x,z)*edgeW(C,x,z);
 for(const o of C.holes){if(Math.abs(z-o.zc)>46)continue;
  const d=pdist(o,x,z);if(d<o.hw+8)h*=1-.5*sm(1-d/(o.hw+8));
  const dt=Math.max(Math.abs(x-o.tee[0]),Math.abs(z-o.tee[1])*1.4);if(dt<15)h=lerp(h,o.ty,sm((15-dt)/9));
  const dg=Math.hypot(x-o.pin[0],z-o.pin[1]);if(dg<o.gr+13)h=lerp(h,o.gy+(x-o.pin[0])*o.sx+(z-o.pin[1])*o.sz,sm((o.gr+13-dg)/10));
  for(const w of o.wt){const r=Math.sqrt(((x-w[0])/w[2])**2+((z-w[1])/w[3])**2);if(r<1.5)h=lerp(h,w[4],sm((1.5-r)/.45))}}
 return Math.max(h,0)+.05}
const grad=(ci,x,z)=>[(H(ci,x+.5,z)-H(ci,x-.5,z)),(H(ci,x,z+.5)-H(ci,x,z-.5))];/* slope per metre */

/* trees go in the rough, away from every fairway, green and pond */
CRS.forEach((C,ci)=>{seed(ci*57+3);let n=0;
 for(let a=0;a<1400&&n<150;a++){const x=lerp(C.x0+2,C.x1-2,R()),z=lerp(C.bz0+2,C.bz1-2,R());
  if(C.holes.some(o=>pdist(o,x,z)<o.hw+5||Math.hypot(x-o.pin[0],z-o.pin[1])<o.gr+9||Math.hypot(x-o.tee[0],z-o.tee[1])<12))continue;
  if(surf(ci,x,z)!=0||C.trees.some(t=>Math.hypot(t[0]-x,t[1]-z)<6.5))continue;
  C.trees.push([x,z,H(ci,x,z),R()]);n++}});
const treeAt=(ci,x,z,r)=>CRS[ci].trees.find(t=>Math.abs(t[0]-x)<r&&Math.abs(t[1]-z)<r);

/* ---------- the ball flight, worked out in one go ---------- */
function sim(ci,x,y,z,vx,vy,vz,putt,hole,wind){
 const dt=1/120,pts=[[0,x,y,z]],C=CRS[ci];let t=0,roll=!!putt,land=null,end='rest',st=0,first=1;
 y=Math.max(y,H(ci,x,z));if(putt)vy=0;
 for(let i=0;i<4800;i++){t+=dt;
  if(!roll){
   const rx=vx-wind[0],rz=vz-wind[1],s=Math.hypot(rx,vy,rz);
   vx-=KD*s*rx*dt;vz-=KD*s*rz*dt;vy-=(GR+KD*s*vy-KL*s*Math.hypot(rx,rz))*dt;x+=vx*dt;y+=vy*dt;z+=vz*dt;
   if(y<11){const tr=treeAt(ci,x,z,1.25);if(tr&&y<tr[2]+4.5+tr[3]*3){vx*=.1;vz*=.1;vy=Math.min(vy,0)*.2}}
   const gy=H(ci,x,z);
   if(y<=gy&&vy<0){y=gy;const sf=surf(ci,x,z);if(!land)land=[x,z,sf,t];
    if(sf==6||sf==7){end=sf==6?'water':'ob';pts.push([t,x,y,z]);break}
    if(hole&&Math.hypot(x-hole[0],z-hole[1])<.2&&Math.hypot(vx,vz)<9){x=hole[0];z=hole[1];end='holed';pts.push([t,x,gy-.1,z]);break}
    const g=grad(ci,x,z),nl=Math.hypot(g[0],1,g[1]),n=[-g[0]/nl,1/nl,-g[1]/nl],b=BOUNCE[sf],vn=vx*n[0]+vy*n[1]+vz*n[2];
    let tx=vx-vn*n[0],ty=vy-vn*n[1],tz=vz-vn*n[2];vx=tx*b[1]-b[0]*vn*n[0];vy=ty*b[1]-b[0]*vn*n[1];vz=tz*b[1]-b[0]*vn*n[2];
    if(sf==5){vy=0;vx*=.3;vz*=.3}
    if(vy<1.5){vy=0;roll=true}}
  }else{
   const sf=surf(ci,x,z);if(sf==6||sf==7){end=sf==6?'water':'ob';pts.push([t,x,y,z]);break}
   const g=grad(ci,x,z),ax=-GR*g[0]*.62,az=-GR*g[1]*.62;vx+=ax*dt;vz+=az*dt;
   let sp=Math.hypot(vx,vz);const dec=MU[sf]*dt;
   if(sp<=dec){if(Math.hypot(ax,az)<MU[sf]*.9){vx=vz=0;st++}}else{vx-=vx/sp*dec;vz-=vz/sp*dec}
   if(sp>.05)st=0;
   x+=vx*dt;z+=vz*dt;y=H(ci,x,z);sp=Math.hypot(vx,vz);
   if(hole){const d=Math.hypot(x-hole[0],z-hole[1]);if(d<.13&&sp<2.8){x=hole[0];z=hole[1];end='holed';pts.push([t,x,y-.1,z]);break}}
   if(first&&!land)land=[x,z,sf,t];
   if(st>30){break}}
  if(i%2==1)pts.push([t,x,y,z]);
  if(roll)first=0}
 const lp=pts[pts.length-1];
 return{pts,end,land:land||[lp[1],lp[3],0,0],rest:[lp[1],lp[3]],T:lp[0],ci}}
const wnd=(w)=>[w.s*Math.sin(w.a),w.s*Math.cos(w.a)];

/* ---------- 3D: batched boxes, the ground, trees ---------- */
const FACE=[[[1,0,0],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]],[[-1,0,0],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]],[[0,1,0],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]],[[0,-1,0],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]],[[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],[[0,0,-1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]]];
const TRI=[0,1,2,0,2,3],CC={};
const colr=h=>CC[h]||(CC[h]=new THREE.Color(h));
function Batch(){const P=[],N=[],Cl=[];
 return{box(x,y,z,w,h,d,c,ry){const co=colr(c),cs=Math.cos(ry||0),sn2=Math.sin(ry||0);
   for(const[n,q]of FACE){for(const k of TRI){const v=q[k];const lx=v[0]*w/2,lz=v[2]*d/2;P.push(x+lx*cs+lz*sn2,y+v[1]*h/2,z-lx*sn2+lz*cs);
     N.push(n[0]*cs+n[2]*sn2,n[1],-n[0]*sn2+n[2]*cs);Cl.push(co.r,co.g,co.b)}}},
  mesh(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cl,3));
   const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.frustumCulled=false;return m}}}
function label(g,text,w,h,x,y,z,bg,fg,ry){const cv=document.createElement('canvas');cv.width=w*96;cv.height=h*96;const c=cv.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,cv.width,cv.height);
 c.strokeStyle=fg;c.lineWidth=5;c.strokeRect(5,5,cv.width-10,cv.height-10);c.fillStyle=fg;c.font='bold '+Math.round(cv.height*.42)+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(text,cv.width/2,cv.height/2+2);
 const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m}
const root=new THREE.Group();root.name='golf';WORLD.add(root);
const CLUB={x:-218,z:-61};/* clubhouse centre */
const built=[],groups=[];
function cartMesh(color){const b=Batch();
 b.box(0,.5,0,1.25,.4,2.5,color);b.box(0,.85,-.2,1.2,.3,1.8,'#f4f4f0');b.box(0,.85,.95,1.2,.5,.5,color);/* body, floor, nose */
 b.box(0,1.15,-.55,1.05,.5,.35,'#2b3a4a');b.box(0,.82,.2,1.05,.1,.8,'#2b3a4a');/* seat back, seat */
 [[-.58,-.85],[.58,-.85],[-.58,.9],[.58,.9]].forEach(p=>{b.box(p[0]*1.0,.3,p[1],.2,.6,.6,'#1b1b1e')});
 [[-.55,-.95],[.55,-.95],[-.55,.55],[.55,.55]].forEach(p=>b.box(p[0],1.45,p[1],.07,1.1,.07,'#e8e8e8'));
 b.box(0,2.02,-.2,1.45,.07,2.0,'#f4f4f0');b.box(0,.95,-1.35,.5,.9,.3,'#3a3a40');b.box(0,1.45,-1.35,.4,.18,.22,'#ff6f61');/* roof, clubs on the back */
 return b.mesh()}
/* ground and trees of one course */
function buildCourse(ci){if(built[ci])return;built[ci]=1;const C=CRS[ci],g=new THREE.Group();g.name='golf'+ci;root.add(g);groups[ci]=g;
 const cs=2,x0=C.x0-4,z0=C.bz0,nx=Math.ceil((C.x1+4-x0)/cs),nz=Math.ceil((C.bz1-z0)/cs),hh=[];
 for(let j=0;j<=nz;j++){const row=new Float32Array(nx+1);for(let i=0;i<=nx;i++)row[i]=H(ci,x0+i*cs,z0+j*cs);hh.push(row)}
 const cc=C.col,cl=[cc.rough,cc.fw,cc.fr,cc.gr,cc.tee,cc.sand,'#3b94dc'].map(h=>colr(h)),pos=[],col=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*cs,z=z0+j*cs,sf=surf(ci,x+1,z+1);if(sf==7)continue;
  const k=((Math.floor((x+1)/4)+Math.floor((z+1)/4))&1)?1.035:.97,nz2=1+(((i*7+j*13)%5)-2)*.012,c=cl[sf],cr=c.r*k*nz2,cg=c.g*k*nz2,cb=c.b*k*nz2;
  const a=hh[j][i],b=hh[j][i+1],cx=hh[j+1][i],d=hh[j+1][i+1];
  pos.push(x,a,z,x,cx,z+cs,x+cs,b,z,x+cs,b,z,x,cx,z+cs,x+cs,d,z+cs);for(let q=0;q<6;q++)col.push(cr,cg,cb)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
 const terr=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));terr.frustumCulled=false;g.add(terr);
 const b=Batch();
 C.trees.forEach(t=>{const gy=t[2],s=1+t[3]*.5,lf=cc.leaf[Math.floor(t[3]*9)%3];b.box(t[0],gy+1.3,t[1],.55,2.6,.55,'#6b4a2b');b.box(t[0],gy+3.7*s,t[1],3.4*s,2.4*s,3.4*s,lf,t[3]*3);b.box(t[0],gy+5.6*s,t[1],2.3*s,2*s,2.3*s,lf,t[3]*3+.8)});
 C.holes.forEach((o,j)=>{const[px,pz]=o.pin,py=H(ci,px,pz);
  b.box(px,py+.01,pz,.24,.02,.24,'#101010');b.box(px,py+1.3,pz,.05,2.6,.05,'#f2f2f2');b.box(px+.35,py+2.3,pz,.7,.42,.04,cc.flag);
  const tx=o.tee[0],tz=o.tee[1],ty=H(ci,tx,tz);b.box(tx+o.d*1.2,ty+.18,tz-2.3,.3,.3,.3,'#f2f2f2');b.box(tx+o.d*1.2,ty+.18,tz+2.3,.3,.3,.3,'#f2f2f2');
  label(g,(j+1)+' · PAR '+o.par+' · '+o.len+' m',3.2,.8,tx-o.d*3.5,ty+1.7,tz+3.2,'#1d4f2a','#ffffff',0);
  b.box(tx-o.d*3.5,ty+.85,tz+3.2,.12,1.7,.12,'#5a3a22')});
 g.add(b.mesh())}
let clubBuilt=0;
function buildClubhouse(){if(clubBuilt)return;clubBuilt=1;const b=Batch(),X=CLUB.x,Z=CLUB.z;
 b.box(X,.1,Z,24,.2,15,'#d8d2c0');b.box(X,2.2,Z-1,20,4.2,10,'#f3efe3');b.box(X,4.5,Z-1,21.6,.5,11.6,'#2f6a3a');b.box(X,5.1,Z-1,16,.7,8,'#2f6a3a');b.box(X,5.7,Z-1,10,.7,5,'#3a7d46');
 b.box(X,3.9,Z+4.2,22,.4,3,'#2f6a3a');[-9,-3,3,9].forEach(x=>b.box(X+x,1.9,Z+5.4,.3,3.4,.3,'#c9b790'));b.box(X,.4,Z+5.2,21,.3,2.8,'#c9b790');
 b.box(X,1.5,Z+4.05,2.2,2.6,.2,'#5a3a22');[-7,-4,4,7].forEach(x=>b.box(X+x,2.3,Z+4.05,2,1.5,.2,'#79b6e0'));[-7.5,7.5].forEach(x=>b.box(X+x,1.4,Z+2.5,1.2,2.4,.2,'#79b6e0'));
 b.box(X+12.5,4,Z-5,.12,8,.12,'#e8e8e8');b.box(X+13.1,7.3,Z-5,1.2,.7,.05,'#ff4d4d');
 for(let i=0;i<6;i++)b.box(X-3+i*1.2,.22,Z+8.2+(i%2)*.15,.9,.06,.7,'#b9a77a');/* the path to the door */
 for(let k=0;k<4;k++)b.box(X+16+k*2.5,.12,Z+6,2.2,.1,3.6,'#a9a392');/* cart bay floor */
 const m=b.mesh();root.add(m);label(root,'WAVEFERN GOLF CLUB',9,1.2,X,6.9,Z+.2,'#1d4f2a','#fff3c0',0);
 for(let k=0;k<4;k++){const c=cartMesh(['#e8e8e8','#ffd23f','#58b8f0','#ff6f61'][k]);c.position.set(X+16+k*2.5,.2,Z+6);c.rotation.y=Math.PI;root.add(c)}
 cols.push([X-10.2,Z-6.8,X+10.2,Z+3.4])}

/* ---------- the pieces that move: ball, aim line, target, beacon, club, cart ---------- */
const ball=new THREE.Mesh(new THREE.BoxGeometry(.17,.17,.17),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x555555}));ball.visible=false;root.add(ball);
const shadow=new THREE.Mesh(new THREE.BoxGeometry(.3,.01,.3),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false}));shadow.visible=false;root.add(shadow);
const peg=new THREE.Mesh(new THREE.BoxGeometry(.04,.1,.04),new THREE.MeshBasicMaterial({color:0xffffff}));peg.visible=false;root.add(peg);
const dots=[];for(let i=0;i<26;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.2,.04,.8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false}));m.visible=false;root.add(m);dots.push(m)}
const target=new THREE.Group();[[-1,0,3.2,.35],[1,0,3.2,.35],[0,-1,.35,3.2],[0,1,.35,3.2]].forEach(a=>{const m=new THREE.Mesh(new THREE.BoxGeometry(a[2],.05,a[3]),new THREE.MeshBasicMaterial({color:0xffe85a,transparent:true,opacity:.85,depthWrite:false}));m.position.set(a[0]*1.6,0,a[1]*1.6);target.add(m)});target.visible=false;root.add(target);
const beMat=new THREE.MeshBasicMaterial({color:0xff9a2a,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending});
const beacon=new THREE.Group();{const p=new THREE.Mesh(new THREE.BoxGeometry(.8,90,.8),beMat);p.position.y=45;beacon.add(p);const r=new THREE.Mesh(new THREE.BoxGeometry(4,.12,4),beMat);r.position.y=.1;beacon.add(r);beacon.userData.ring=r}beacon.visible=false;root.add(beacon);
const clubG=new THREE.Group();{const sh=new THREE.Mesh(new THREE.BoxGeometry(.035,1.1,.035),new THREE.MeshLambertMaterial({color:0x2b2b2e}));sh.position.y=-.55;clubG.add(sh);
 const hd=new THREE.Mesh(new THREE.BoxGeometry(.1,.07,.22),new THREE.MeshLambertMaterial({color:0xc9ccd2}));hd.position.set(0,-1.1,.06);clubG.add(hd);clubG.userData.head=hd}clubG.visible=false;root.add(clubG);
const cartG=cartMesh('#e8e8e8');cartG.visible=false;root.add(cartG);
const cam3=new THREE.PerspectiveCamera(62,1,.1,1800);

/* ---------- the round ---------- */
let G=null;/* the round in progress */
const st=()=>{if(!S.golf||typeof S.golf!='object')S.golf={best:[null,null,null],rounds:0,aces:0};if(!Array.isArray(S.golf.best))S.golf.best=[null,null,null];return S.golf};
const GK={};/* keys held while golfing (the game's own key handler is bypassed) */
const hud=document.createElement('div');hud.id='golfhud';hud.style.cssText='position:fixed;inset:0;z-index:7;pointer-events:none;display:none;font-family:Silkscreen,monospace;color:#fff;text-shadow:0 2px 0 #000a,0 0 6px #000a';
hud.innerHTML=`<div id=gf_top style="position:absolute;left:14px;top:12px;background:#000a;padding:8px 12px;border:2px solid #fff3;font-size:14px;line-height:1.5"></div>
<div id=gf_wind style="position:absolute;right:14px;top:12px;background:#000a;padding:8px 12px;border:2px solid #fff3;text-align:center;font-size:12px"><div id=gf_arr style="font-size:30px;line-height:1;transition:transform .2s">&#8593;</div><div id=gf_wt>Wind</div></div>
<div id=gf_bar style="position:absolute;left:26px;top:50%;margin-top:-140px;width:30px;height:280px;border:3px solid #fff;background:#000a;display:none"><div id=gf_fill style="position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(#ff3b3b,#ff8a3b)"></div><i style="position:absolute;left:0;right:0;top:33%;border-top:2px solid #fff8"></i><i style="position:absolute;left:0;right:0;top:66%;border-top:2px solid #fff8"></i></div>
<div id=gf_club style="position:absolute;left:20px;bottom:18px;background:#000a;padding:8px 12px;border:2px solid #fff3;font-size:15px"></div>
<div id=gf_hint style="position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:#000a;padding:7px 12px;font-size:12px;text-align:center;max-width:70vw"></div>
<div id=gf_msg style="position:absolute;left:50%;top:22%;transform:translateX(-50%);font-size:34px;text-align:center;opacity:0;transition:opacity .3s;white-space:nowrap"></div>
<div id=gf_card style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#101a14f0;border:3px solid #fff;padding:16px 20px;min-width:min(520px,92vw);pointer-events:auto;display:none;font-size:13px"></div>
<div id=gf_fade style="position:absolute;inset:0;background:#000;opacity:0;transition:opacity .35s"></div>`;
document.body.appendChild(hud);
const $g=id=>document.getElementById(id);
const setT=(id,h)=>{const e=$g(id);if(e&&e._h!==h){e._h=h;e.innerHTML=h}};
function toast(t,ms){const e=$g('gf_msg');e.textContent=t;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,ms||1800)}
function fade(cb){G.busy=1;$g('gf_fade').style.opacity=1;setTimeout(()=>{try{cb()}catch(e){console.error('golf fade',e)}G&&(G.busy=0);setTimeout(()=>{$g('gf_fade').style.opacity=0},80)},380)}
const dirOf=a=>[Math.sin(a),Math.cos(a)];
const pinD=()=>{const o=G.hole;return Math.hypot(o.pin[0]-G.ball.x,o.pin[1]-G.ball.z)};
const parName=d=>d==-4?'CONDOR':d==-3?'ALBATROSS':d==-2?'EAGLE':d==-1?'BIRDIE':d==0?'PAR':d==1?'BOGEY':d==2?'DOUBLE BOGEY':d==3?'TRIPLE BOGEY':'+'+d;

function startRound(ci,cart){if(away())return;const fee=cart?25:0;if((S.money||0)<fee){sn('err');return say2('A golf cart is $25.')}
 S.money=+((S.money||0)-fee).toFixed(2);
 G={on:1,ci,C:CRS[ci],hi:0,sc:[],cart,cx:0,cz:0,ch:0,cv:0,cy:0,view:'3p',st:'ready',aim:0,club:0,ball:{x:0,y:0,z:0},last:{x:0,z:0},paused:0,card:0,tab:0,back:0,swT:0,gz:0,fdir:[0,1],shown:0,keyHold:0,keyP:0,pb:null,beat:0};
 closeUIsafe();mode='golf';try{$('hud').style.display='none'}catch(e){}hud.style.display='block';document.body.classList.add('fston');
 try{P.mesh.visible=true}catch(e){}buildCourse(ci);sn('chime');beginHole(0,true)}
function closeUIsafe(){try{$('ui').innerHTML=''}catch(e){}}
function beginHole(hi,first){const C=G.C,o=C.holes[hi];G.hi=hi;G.hole=o;G.strokes=0;G.wind={s:Math.max(0,C.wind*(.2+R2()*1.4)),a:R2()*6.283};
 const go=()=>{const tx=o.tee[0],tz=o.tee[1];G.ball={x:tx,y:H(G.ci,tx,tz),z:tz};G.last={x:tx,z:tz};G.aim=Math.atan2(o.pin[0]-tx,o.pin[1]-tz);G.card=0;$g('gf_card').style.display='none';
  G.club=o.len>165?0:o.len>115?1:2;if(o.len>165)G.club=0;
  if(G.cart){G.cx=tx-o.d*4;G.cz=tz+7;G.ch=G.aim;G.cy=H(G.ci,G.cx,G.cz)}
  cartG.visible=!!G.cart;clearBeacon();G.st='ready';G.pb=null;G.dirty=1;
  toast('HOLE '+(hi+1)+' · PAR '+o.par,2000);try{sn('pop')}catch(e){}};
 if(first)go();else fade(go)}
let R2seed=99;function R2(){R2seed=(R2seed*16807)%2147483647;return R2seed/2147483647}
R2seed=(Date.now()%100000)+7;
function clearBeacon(){beacon.visible=false}
function setBeacon(x,z,c){const y=H(G.ci,x,z);beacon.position.set(x,y,z);beMat.color.set(c);beacon.visible=true}

/* swing */
const SW={on:0};
const swing={full:2.4,fullPutt:1.1};
function swDown(e){if(!G||G.st!='ready'||G.paused||G.busy||G.card)return;if(e&&e.clientY<innerHeight*.33){return toast('Start lower down the screen so you have room to push',1400)}
 SW.on=1;SW.s=[];SW.t0=performance.now();SW.tS=0;SW.pk=0;SW.ax=0;SW.ay=0;SW.pull=0;SW.live=0;G.st='hold'}
function swMove(mx,my){if(!G||!SW.on||(G.st!='hold'&&G.st!='swing'))return;const n=performance.now();SW.s.push({t:n,x:mx,y:my});
 if(G.st=='hold'&&my>0)SW.pull=clamp(SW.pull+my/(innerHeight*.25),0,1);
 if(G.st=='swing'){SW.ax+=mx;SW.ay+=-my}
 swEval(n)}
function swEval(n){if(!G||!SW.on)return;while(SW.s.length&&n-SW.s[0].t>110)SW.s.shift();
 let dx=0,dy=0;SW.s.forEach(s=>{dx+=s.x;dy+=s.y});const span=SW.s.length?n-SW.s[0].t+16:16,vf=Math.max(0,-dy/span*1000/innerHeight),va=Math.abs(dx/span*1000/innerHeight);
 const full=CL[G.club].putt?swing.fullPutt:swing.full;SW.live=clamp(vf/full,0,1);
 if(G.st=='hold'){if(vf>.3&&va<vf*2){G.st='swing';SW.tS=n;SW.pk=vf;SW.ax=dx;SW.ay=-dy;SW.live=clamp(vf/full,0,1)}}
 else if(G.st=='swing'){SW.pk=Math.max(SW.pk,vf);const el=n-SW.tS;if(el>=140&&(vf<SW.pk*.55||el>420))impact()}}
function swUp(){if(!G||!SW.on)return;if(G.st=='swing'){if(performance.now()-SW.tS<140)SW.rel=1;else impact()}else if(G.st=='hold'){G.st='ready';SW.on=0}}
function impact(){if(!SW.on)return;SW.on=0;
 const full=CL[G.club].putt?swing.fullPutt:swing.full;let p=Math.pow(clamp(SW.pk/full,0,1),.9);if(p<.04){G.st='ready';return toast('Push the mouse forward faster',900)}
 const ang=Math.atan2(SW.ax,Math.max(1,SW.ay));shoot(p,G.aim-clamp(ang,-.6,.6)*.55);SW.live=p}
/* keyboard fallback: hold Space to charge the bar, let go to hit straight */
function keyCharge(dt){if(G.st=='ready'&&GK[' ']&&!G.busy&&!G.card&&!G.paused){G.keyHold=Math.min(1.2,G.keyHold+dt);SW.live=G.keyHold/1.2}else if(G.keyHold>0&&!GK[' ']){const p=G.keyHold/1.2;G.keyHold=0;if(p>.04&&G.st=='ready')shoot(p,G.aim);SW.live=p}}
function shoot(p,psi){const ci=G.ci,b=G.ball,cl=CL[G.club],sf=surf(ci,b.x,b.z),lie=LIE[sf]||LIE[0];
 psi+=(R2()-.5)*2*(cl.sp+lie[1]+(p>.96?.025:0));let r;const w=wnd(G.wind),pw=p*(cl.putt?(sf==5?.7:1):lie[0]);
 if(cl.putt){const v=pw*cl.v;r=sim(ci,b.x,b.y,b.z,Math.sin(psi)*v,0,Math.cos(psi)*v,true,G.hole.pin,w)}
 else{const v=pw*cl.v,lf=(cl.loft+(sf==5?8:0))*Math.PI/180,h=Math.cos(lf)*v;r=sim(ci,b.x,b.y+.04,b.z,Math.sin(psi)*h,Math.sin(lf)*v,Math.cos(psi)*h,false,G.hole.pin,w)}
 G.strokes++;G.shot=r;G.pb={t:0,i:0,r,done:0,hold:0};G.st='fly';G.fdir=dirOf(psi);G.lastHit={x:b.x,z:b.z};G.sw2=0;
 if(!cl.putt)setBeacon(r.land[0],r.land[1],'#ff9a2a');G.after=0;sn('pop');peg.visible=false}
function afterShot(){const r=G.shot,o=G.hole;
 if(r.end=='holed'){G.ball={x:o.pin[0],y:H(G.ci,o.pin[0],o.pin[1])-.1,z:o.pin[1]};holeOut();return}
 if(r.end=='water'||r.end=='ob'){G.strokes++;toast(r.end=='water'?'SPLASH! +1 stroke':'OUT OF BOUNDS! +1 stroke',1800);sn('err');
  clearBeacon();fade(()=>{G.ball={x:G.lastHit.x,y:H(G.ci,G.lastHit.x,G.lastHit.z),z:G.lastHit.z};G.st='ready';G.dirty=1;pickClub(true)});G.st='fade';return}
 G.ball={x:r.rest[0],y:H(G.ci,r.rest[0],r.rest[1]),z:r.rest[1]};G.last={x:G.ball.x,z:G.ball.z};setBeacon(G.ball.x,G.ball.z,'#43e6ff');
 if(G.strokes>=o.par+6){toast('PICK UP: max strokes',1600);return holeOut(true)}
 pickClub(true);G.aim=Math.atan2(o.pin[0]-G.ball.x,o.pin[1]-G.ball.z);G.dirty=1;
 if(G.cart){G.st='drive';G.dv=0;seatDriver();toast('Drive to your ball',1500)}
 else fade(()=>{G.st='ready'})}
function pickClub(){const d=pinD(),sf=surf(G.ci,G.ball.x,G.ball.z);G.club=sf==3||(sf==2&&d<18)?3:d>165?0:d>95?1:2;if(sf==4&&G.hole.len>135)G.club=0;if(sf==5&&G.club==0)G.club=1}
function holeOut(pick){G.st='holeend';G.sc[G.hi]=G.strokes;const d=G.strokes-G.hole.par;let name=G.strokes==1?'HOLE IN ONE!':parName(d),pay=0;
 if(!pick){if(G.strokes==1){pay=250;st().aces++}else if(d<=-2)pay=40;else if(d==-1)pay=10}else name='PICKED UP';
 if(pay){S.money=+((S.money||0)+pay).toFixed(2);S.earn=(S.earn||0)+pay}
 try{S.t=Math.min(596,(S.t||0)+4)}catch(e){}
 G.holeName=name;G.holePay=pay;sn(pick?'pop':d<0?'cash':'chime');toast(name,2500);setTimeout(()=>{if(G&&G.st=='holeend')showHoleCard()},1700)}
function sumHtml(){const C=G.C;let tot=0,par=0,h='<table style="border-collapse:collapse;width:100%;text-align:center;font-size:12px"><tr><td></td>'+C.holes.map((o,i)=>'<td style="padding:2px 6px">'+(i+1)+'</td>').join('')+'<td>TOT</td></tr><tr><td style="text-align:left">PAR</td>'+C.holes.map(o=>'<td>'+o.par+'</td>').join('')+'<td>'+C.holes.reduce((a,o)=>a+o.par,0)+'</td></tr><tr><td style="text-align:left">YOU</td>';
 C.holes.forEach((o,i)=>{const s=G.sc[i];if(s!=null){tot+=s;par+=o.par}h+='<td style="color:'+(s==null?'#888':s<o.par?'#6fff8a':s>o.par?'#ff8a6f':'#fff')+'">'+(s==null?'-':s)+'</td>'});
 return{h:h+'<td><b>'+(tot||'-')+'</b></td></tr></table>',tot,par}}
function showHoleCard(){const last=G.hi>=5,s=sumHtml(),c=$g('gf_card');G.card=1;
 c.innerHTML='<div style="font-size:22px;margin-bottom:6px">'+G.holeName+(G.holePay?' <span style="color:#6fff8a">+$'+G.holePay+'</span>':'')+'</div><div style="margin-bottom:10px;font-size:12px;opacity:.85">Hole '+(G.hi+1)+': '+G.strokes+' stroke'+(G.strokes==1?'':'s')+' on a par '+G.hole.par+'</div>'+s.h+'<div style="margin-top:12px;text-align:right"><button class=go style="font-size:14px;padding:6px 16px" onclick="golfNext()">'+(last?'Finish round':'Next hole')+'</button></div>';c.style.display='block'}
window.golfNext=function(){if(!G||!G.card)return;sn('pop');if(G.hi>=5)endRound();else{G.card=0;$g('gf_card').style.display='none';beginHole(G.hi+1)}};
function endRound(){const s=sumHtml(),g=st(),ci=G.ci,tot=s.tot,d=tot-s.par;g.rounds++;let best='';if(g.best[ci]==null||tot<g.best[ci]){best=g.best[ci]==null?'First round on this course!':'New best score!';g.best[ci]=tot}
 const pay=20;S.money=+((S.money||0)+pay).toFixed(2);S.earn=(S.earn||0)+pay;sv();G.st='done';G.card=2;sn('cash');
 const c=$g('gf_card');c.innerHTML='<div style="font-size:22px;margin-bottom:6px">'+E(G.C.n)+': '+tot+' ('+(d==0?'E':d>0?'+'+d:d)+')</div><div style="margin-bottom:10px;font-size:12px;opacity:.85">Round finished, +$'+pay+' prize. '+best+' Best here: '+g.best[ci]+'. Rounds played: '+g.rounds+'.</div>'+s.h+'<div style="margin-top:12px;text-align:right"><button class=go style="font-size:14px;padding:6px 16px" onclick="golfLeave()">Back to the clubhouse</button></div>';c.style.display='block'}
window.golfLeave=function(){if(!G)return;sn('pop');fade(()=>exitGolf())};
function exitGolf(){const was=G;G=null;SW.on=0;mode='play';try{$('hud').style.display=''}catch(e){}hud.style.display='none';document.body.classList.remove('fston');
 ball.visible=shadow.visible=peg.visible=clubG.visible=target.visible=cartG.visible=false;dots.forEach(d=>d.visible=false);clearBeacon();
 P.x=CLUB.x;P.z=CLUB.z+8.5;P.rot=Math.PI;try{P.mesh.visible=true;P.mesh.rotation.x=0}catch(e){}SY=0;GY=0;$g('gf_card').style.display='none';$g('gf_fade').style.opacity=0;sv()}
function pauseCard(){if(!G||G.card==1||G.card==2)return;G.paused=!G.paused;const c=$g('gf_card');
 if(G.paused){c.innerHTML='<div style="font-size:20px;margin-bottom:10px">Paused</div><div style="line-height:1.9">Left mouse: hold, then push the mouse forward to swing<br>A / D: aim · Mouse wheel or 1-4: club · V: camera<br>Tab: scorecard · Space: keyboard swing (hold, release) · E: out of the cart</div><div style="margin-top:12px;text-align:right"><button style="font-size:13px;padding:6px 14px" onclick="golfQuit()">Quit round</button> <button class=go style="font-size:14px;padding:6px 16px" onclick="golfResume()">Resume</button></div>';c.style.display='block'}else c.style.display='none'}
window.golfResume=function(){if(G&&G.paused)pauseCard()};
window.golfQuit=function(){if(!G)return;fade(()=>exitGolf())};
function seatDriver(){const q=G;q.cx=q.ball.x-Math.sin(q.aim)*3.2+Math.cos(q.aim)*2.4;q.cz=q.ball.z-Math.cos(q.aim)*3.2-Math.sin(q.aim)*2.4;if(G.cartKeep){q.cx=G.cartKeep[0];q.cz=G.cartKeep[1]}q.ch=q.aim;q.cv=0}

/* ---------- the clubhouse menu ---------- */
let pickCart=0;
function openMenu(){if(mode!='play'||away())return;mode='menu';const g=st();
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(580px,94vw)"><div class=pehd><span class=pek>Wavefern Golf Club</span><h2>Pick a course</h2></div><div class=pebd>
 <p class=pebl>Six holes each. Hold the left mouse button and push the mouse forward: the speed is the power, the direction is where the ball goes. Free to play. A cart is $25.</p>
 <div class=pelist>${CRS.map((c,i)=>`<button class=pesong onclick="golfPlay(${i})"><b>${E(c.n)}</b><small>${E(c.sub)} · Par ${c.H.reduce((a,h)=>a+h[0],0)}${g.best[i]!=null?' · Your best: '+g.best[i]:''}</small></button>`).join('')}</div>
 <div class=row2><button id=gfcart onclick="golfCart()">Golf cart: ${pickCart?'YES ($25)':'no'}</button><button onclick="closeUI()">Not now</button></div></div></div>`}
window.golfCart=function(){pickCart=pickCart?0:1;const b=document.getElementById('gfcart');if(b)b.textContent='Golf cart: '+(pickCart?'YES ($25)':'no');sn('pop')};
window.golfPlay=function(i){if(mode!='menu')return;startRound(i,pickCart)};

/* ---------- input ---------- */
const guard=e=>G&&G.on;
addEventListener('mousedown',e=>{if(!guard()||e.button!=0)return;if(e.target.closest&&e.target.closest('#gf_card'))return;e.stopImmediatePropagation();swDown(e)},true);
addEventListener('mousemove',e=>{if(!guard())return;swMove(e.movementX||0,e.movementY||0)},true);
addEventListener('mouseup',e=>{if(!guard()||e.button!=0)return;swUp()},true);
addEventListener('wheel',e=>{if(!guard()||G.st!='ready'||G.card||G.paused)return;G.club=(G.club+(e.deltaY>0?1:3))%4;G.dirty=1;sn('pop');e.preventDefault()},{capture:true,passive:false});
addEventListener('contextmenu',e=>{if(guard())e.preventDefault()},true);
addEventListener('keydown',e=>{if(!guard())return;const k=e.key.toLowerCase();e.stopImmediatePropagation();
 if(k=='escape'){e.preventDefault();return pauseCard()}
 if(G.paused)return;
 if(k=='tab'){e.preventDefault();G.tab=1;return}
 if(!e.repeat){
  if(k=='v'){G.view=G.view=='3p'?'1p':'3p';sn('pop')}
  if(G.st=='ready'&&!G.card){if('1234'.includes(k)&&k.length==1){G.club=+k-1;G.dirty=1;sn('pop')}if(k=='q'){G.club=(G.club+3)%4;G.dirty=1}if(k=='e'&&false)G.club=(G.club+1)%4}
  if(G.st=='fly'&&(k==' '||k=='enter')&&G.pb)G.pb.skip=1;
  if(G.st=='drive'&&k=='e')getOut();
  if(G.st=='drive'&&k=='enter'){fade(()=>{seatReset();G.st='ready'})}
  if(G.card==1&&(k==' '||k=='enter'))window.golfNext();else if(G.card==2&&(k==' '||k=='enter'))window.golfLeave()}
 GK[k]=1;if(k==' '||k.startsWith('arrow'))e.preventDefault()},true);
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k=='tab'&&G)G.tab=0;if(!guard()&&!GK[k])return;delete GK[k];if(guard())e.stopImmediatePropagation()},true);
addEventListener('blur',()=>{for(const k in GK)delete GK[k]});
function seatReset(){G.cx=G.ball.x-Math.sin(G.aim)*3+Math.cos(G.aim)*2.4;G.cz=G.ball.z-Math.cos(G.aim)*3-Math.sin(G.aim)*2.4;G.ch=G.aim;G.cv=0}
function getOut(){const d=Math.hypot(G.cx-G.ball.x,G.cz-G.ball.z);if(d>14){sn('err');return toast('Drive closer to your ball',1200)}G.cartKeep=null;G.st='ready';G.dirty=1;sn('pop')}

/* ---------- every frame ---------- */
const cartBlocked=(ci,x,z)=>{const sf=surf(ci,x,z);if(sf==6||sf==7||sf==3)return sf;if(treeAt(ci,x,z,1.6))return 9;return 0};
function driveTick(dt){const q=G,ci=q.ci,f=(GK.w||GK.arrowup?1:0)-(GK.s||GK.arrowdown?1:0),sT=(GK.a||GK.arrowleft?1:0)-(GK.d||GK.arrowright?1:0);
 const sf=surf(ci,q.cx,q.cz),vmax=7*(sf==5?.35:sf==0?.75:1);
 if(f>0)q.cv=Math.min(vmax,q.cv+3.6*dt);else if(f<0)q.cv=q.cv>0?Math.max(0,q.cv-7*dt):Math.max(-vmax*.4,q.cv-2.5*dt);else q.cv-=Math.sign(q.cv)*Math.min(Math.abs(q.cv),2*dt);
 if(Math.abs(q.cv)>vmax)q.cv-=Math.sign(q.cv)*Math.min(Math.abs(q.cv)-vmax,12*dt);
 q.ch+=sT*1.5*dt*clamp(q.cv/2.5,-1,1);
 const nx=q.cx+Math.sin(q.ch)*q.cv*dt,nz=q.cz+Math.cos(q.ch)*q.cv*dt,fx=nx+Math.sin(q.ch)*1.4*Math.sign(q.cv||1),fz=nz+Math.cos(q.ch)*1.4*Math.sign(q.cv||1);
 const bl=Math.max(cartBlocked(ci,nx,nz),cartBlocked(ci,fx,fz));
 if(bl){if(Math.abs(q.cv)>1.5){if(bl==3)toast('No carts on the green',900);else if(bl==6)toast('No swimming!',900)}q.cv*=-.15}else{q.cx=nx;q.cz=nz}
 const gy=H(ci,q.cx,q.cz),g=grad(ci,q.cx,q.cz),pitch=Math.atan(-(g[0]*Math.sin(q.ch)+g[1]*Math.cos(q.ch))*1);q.cy=gy;q.cp=lerp(q.cp||0,pitch,Math.min(1,dt*8));
 P.x=q.cx;P.z=q.cz;P.rot=q.ch;
 const d=Math.hypot(q.cx-q.ball.x,q.cz-q.ball.z);G.near=d<14}
function placeGolfer(){const b=G.ball,dir=dirOf(G.aim),pvx=b.x-dir[0]*.35,pvz=b.z-dir[1]*.35,rg=[Math.cos(G.aim),-Math.sin(G.aim)];
 P.x=pvx+rg[0]*.75;P.z=pvz+rg[1]*.75;P.rot=Math.atan2(-rg[0],-rg[1]);return{px:pvx,pz:pvz}}
const gyOf=(x,z)=>H(G.ci,x,z);
function camTick(dt){const q=G,b=q.ball,k=Math.min(1,dt*7);let tx,ty,tz,lx,ly,lz,fov=62;
 if(q.st=='fly'&&q.pb){const pb=q.pb,bp=[ball.position.x,ball.position.y,ball.position.z],pu=pb.r.pts[Math.max(0,Math.min(pb.r.pts.length-1,Math.floor(pb.t*60)))],pn=pb.r.pts[Math.min(pb.r.pts.length-1,Math.floor(pb.t*60)+6)];
  let dx=pn[1]-pu[1],dz=pn[3]-pu[3];const l=Math.hypot(dx,dz);if(l>.4){q.fdir[0]=lerp(q.fdir[0],dx/l,Math.min(1,dt*3));q.fdir[1]=lerp(q.fdir[1],dz/l,Math.min(1,dt*3))}
  const fl=Math.hypot(q.fdir[0],q.fdir[1])||1,fx=q.fdir[0]/fl,fz=q.fdir[1]/fl,air=bp[1]-gyOf(bp[0],bp[2])>1.2,pu2=CL[q.club].putt,dist=pu2?4.5:air?12:8,hgt=pu2?1.5:air?4.2+Math.min(6,(bp[1]-gyOf(bp[0],bp[2]))*.35):2.6;
  tx=bp[0]-fx*dist;tz=bp[2]-fz*dist;ty=Math.max(bp[1]+hgt,gyOf(tx,tz)+1.5);lx=bp[0]+fx*(pu2?3:6);ly=bp[1];lz=bp[2]+fz*(pu2?3:6);const kk=Math.min(1,dt*(pb.t<.4?3:4.5));cam3.position.x+=(tx-cam3.position.x)*kk;cam3.position.y+=(ty-cam3.position.y)*kk;cam3.position.z+=(tz-cam3.position.z)*kk;
  cam3.lookAt(lx,ly,lz);fov=lerp(cam3.fov,air?58:66,.05)}
 else if(q.st=='drive'||q.st=='fade'&&q.cart&&false){const fx=Math.sin(q.ch),fz=Math.cos(q.ch);tx=q.cx-fx*8.5;tz=q.cz-fz*8.5;ty=q.cy+3.8;cam3.position.x+=(tx-cam3.position.x)*k;cam3.position.y+=(ty-cam3.position.y)*k;cam3.position.z+=(tz-cam3.position.z)*k;cam3.lookAt(q.cx+fx*6,q.cy+.8,q.cz+fz*6)}
 else{const dir=dirOf(q.aim),gy=b.y;
  if(q.view=='1p'){const eye=[b.x-dir[0]*1.35,gy+1.62,b.z-dir[1]*1.35];tx=eye[0];ty=eye[1];tz=eye[2];lx=eye[0]+dir[0]*30;lz=eye[2]+dir[1]*30;ly=eye[1]-7;fov=84}
  else{tx=b.x-dir[0]*5.4+dir[1]*.7;tz=b.z-dir[1]*5.4-dir[0]*.7;ty=Math.max(gy+2.1,gyOf(tx,tz)+1.6);lx=b.x+dir[0]*22;lz=b.z+dir[1]*22;ly=gy+.5}
  const kk=q.snap?1:Math.min(1,dt*9);q.snap=0;cam3.position.x+=(tx-cam3.position.x)*kk;cam3.position.y+=(ty-cam3.position.y)*kk;cam3.position.z+=(tz-cam3.position.z)*kk;cam3.lookAt(lx,ly,lz)}
 if(Math.abs(cam3.fov-fov)>.01){cam3.fov=lerp(cam3.fov,fov,Math.min(1,dt*5))}}
let GY=0;
function gTick(dt){const q=G,b=q.ball;
 /* aim */
 if(q.st=='ready'&&!q.busy&&!q.card&&!q.paused){const rate=(GK.shift?.35:1.1)*dt,a=(GK.a||GK.arrowleft?1:0)-(GK.d||GK.arrowright?1:0);if(a){q.aim+=a*rate;q.dirty=1}}
 if(q.st=='swing'||q.st=='hold')swEval(performance.now());
 if(SW.rel&&q.st=='swing'&&performance.now()-SW.tS>=140){SW.rel=0;impact()}
 keyCharge(dt);if(q.st=='ready'&&!GK[' ']&&q.keyHold==0&&!SW.on)SW.live=lerp(SW.live||0,0,Math.min(1,dt*3));
 /* ball in flight */
 if(q.st=='fly'&&q.pb){const pb=q.pb,r=pb.r;pb.t+=dt*(pb.skip?8:1);const T=r.T,i=Math.min(r.pts.length-1,Math.floor(pb.t*60)),a=r.pts[i],c=r.pts[Math.min(r.pts.length-1,i+1)],f=pb.t*60-Math.floor(pb.t*60);
  const x=lerp(a[1],c[1],f),y=lerp(a[2],c[2],f),z=lerp(a[3],c[3],f);ball.position.set(x,y+.085,z);shadow.position.set(x,gyOf(x,z)+.06,z);ball.visible=shadow.visible=true;
  if(pb.t>=T){if(!pb.done){pb.done=1;pb.hold=0}pb.hold+=dt;const fast=pb.skip?.05:r.end=='holed'?1.1:.9;if(pb.hold>fast){q.pb=null;afterShot()}}}
 else if(b&&(q.st=='ready'||q.st=='hold'||q.st=='swing'||q.st=='drive'||q.st=='holeend'||q.st=='fade')){ball.position.set(b.x,b.y+.085,b.z);ball.visible=q.st!='holeend'&&!q.card;shadow.position.set(b.x,b.y+.06,b.z);shadow.visible=ball.visible}
 /* the player, the club, the cart */
 clubG.visible=false;peg.visible=false;
 if(q.st=='ready'||q.st=='hold'||q.st=='swing'||(q.st=='fly'&&q.pb&&q.pb.t<1.2)){const g=placeGolfer(),dir=dirOf(q.aim),gy=b.y,putt=CL[q.club].putt;
  SY=gyOf(P.x,P.z);const sf=surf(q.ci,b.x,b.z);if(sf==4&&!putt&&q.st!='fly'){peg.visible=true;peg.position.set(b.x,gy+.03,b.z);ball.position.y=gy+.13}
  clubG.visible=true;clubG.position.set(g.px,gy+1.05,g.pz);clubG.rotation.y=q.aim;clubG.userData.head.scale.set(CL[q.club].n=='Driver'?1.6:1,CL[q.club].n=='Driver'?1.5:1,CL[q.club].n=='Driver'?1.8:1);
  let ph=18.4;if(q.st=='ready')ph=18.4-(q.back||0);
  if(q.st=='hold'){SW.pull=Math.max(0,SW.pull-dt*.3);q.back=lerp(q.back||0,SW.pull*(putt?30:125),Math.min(1,dt*14));ph=18.4-q.back}
  if(q.st=='swing'){q.sw2=(performance.now()-SW.tS)/140;ph=lerp(18.4-(q.back||0),18.4,sm(q.sw2))}
  if(q.st=='fly'){q.sw2+=dt/.4;ph=18.4+sm(q.sw2)*(putt?25:115);q.back=0}
  if(q.st=='ready'&&q.sw2>0){q.sw2=0}
  q.ph=ph;clubG.rotation.x=-ph*Math.PI/180;P.mesh.visible=q.view!='1p'}
 else if(q.st=='drive'||q.st=='fade'){P.mesh.visible=true}
 if(q.cart&&(q.st=='drive'||q.st=='ready'||q.st=='hold'||q.st=='swing'||q.st=='fly'||q.st=='fade')){if(q.st=='drive')driveTick(dt);cartG.visible=true;cartG.position.set(q.cx,q.cy,q.cz);cartG.rotation.set(q.cp||0,q.ch,0,'YXZ')
  if(q.st=='drive'){SY=q.cy+.55;P.mesh.visible=true}}
 /* aim line and target */
 const show=q.st=='ready'&&!q.card&&!q.paused;
 if(show){if(q.dirty){q.dirty=0;const cl=CL[q.club],w=wnd(q.wind);let d;
   if(cl.putt){d=Math.min(12,pinD());q.tgt=null}
   else{const sf=surf(q.ci,b.x,b.z),lie=LIE[sf]||LIE[0],lf=(cl.loft+(sf==5?8:0))*Math.PI/180,v=cl.v*lie[0],h=Math.cos(lf)*v,r=sim(q.ci,b.x,b.y+.04,b.z,Math.sin(q.aim)*h,Math.sin(lf)*v,Math.cos(q.aim)*h,false,null,w);q.tgt=r.land;d=Math.hypot(r.land[0]-b.x,r.land[1]-b.z)}
   q.ad=d}
  const dir=dirOf(q.aim),n=dots.length;dots.forEach((m,i)=>{const t=(i+1)/n*q.ad,x=b.x+dir[0]*t,z=b.z+dir[1]*t;m.visible=i<n&&(i%2==0);m.position.set(x,gyOf(x,z)+.12,z);m.rotation.y=q.aim});
  if(q.tgt){target.visible=true;target.position.set(q.tgt[0],gyOf(q.tgt[0],q.tgt[1])+.15,q.tgt[1]);target.rotation.y=q.aim}else target.visible=false}
 else{dots.forEach(m=>m.visible=false);target.visible=false}
 /* beacon pulse */
 if(beacon.visible){const s=1+Math.sin(performance.now()/260)*.12;beacon.userData.ring.scale.set(s,1,s);beMat.opacity=.42+Math.sin(performance.now()/300)*.1}
 camTick(dt);hudTick()}
function hudTick(){const q=G,o=q.hole,cl=CL[q.club],b=q.ball,sf=surf(q.ci,b.x,b.z);
 setT('gf_top','<b>'+E(q.C.n)+'</b><br>Hole '+(q.hi+1)+'/6 · Par '+o.par+'<br>Stroke '+(q.strokes+(q.st=='fly'||q.st=='holeend'?0:1))+' · '+Math.round(pinD())+' m to the pin');
 const w=wnd(q.wind),a=dirOf(q.aim),al=w[0]*a[0]+w[1]*a[1],sd2=w[0]*a[1]-w[1]*a[0];
 $g('gf_arr').style.transform='rotate('+Math.round(Math.atan2(-sd2,al)*180/Math.PI)+'deg)';setT('gf_wt','Wind '+q.wind.s.toFixed(1)+' m/s');
 const bar=$g('gf_bar'),live=q.st=='fly'||q.st=='hold'||q.st=='swing'||q.keyHold>0||(SW.live||0)>.02;bar.style.display=(q.st=='ready'||live)&&!q.card?'block':'none';$g('gf_fill').style.height=Math.round(clamp(SW.live||0,0,1)*100)+'%';
 setT('gf_club','<b>'+cl.n+'</b>'+(cl.putt?'':' · '+cl.r+' m')+'<br><small>Lie: '+SFN[sf]+'</small>');
 let h='';if(q.card||q.paused)h='';else if(q.st=='ready')h=q.hi==0&&q.strokes==0?'HOLD the left mouse button, then PUSH the mouse forward. Speed = power, direction = shot. A/D aim · wheel or 1-4 club · V camera':'A/D aim · wheel club · hold mouse + push forward · V camera · Tab scorecard';
 else if(q.st=='hold')h='Now push the mouse forward!';else if(q.st=='drive')h='W/S drive · A/D steer · E get out'+(q.near?' (ball is near)':'')+' · Enter: skip to the ball';else if(q.st=='fly')h='Space or Enter: skip';
 setT('gf_hint',h);$g('gf_hint').style.display=h?'block':'none';
 if(q.tab&&!q.card&&!q.paused){const c=$g('gf_card');c.innerHTML='<div style="font-size:16px;margin-bottom:8px">Scorecard</div>'+sumHtml().h;c.style.display='block';q.tabOn=1}else if(q.tabOn){q.tabOn=0;if(!q.card&&!q.paused)$g('gf_card').style.display='none'}}

/* the walker stands on the hills when you stroll over the course */
let near=null;
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='title')return r;const off=away();root.visible=!off;if(off)return r;dt=dt||.016;
 if(!clubBuilt)buildClubhouse();
 CRS.forEach((C,ci)=>{const d=Math.max(0,Math.max(C.x0-P.x,P.x-C.x1,C.bz0-P.z,P.z-C.bz1)),vis=d<460||(G&&G.on&&G.ci==ci);if(vis&&!built[ci])buildCourse(ci);if(groups[ci])groups[ci].visible=vis});
 if(G&&G.on){gTick(dt)}
 else{INT.forEach(i=>{if(i.gf)i.l='Wavefern Golf Club: play a round / rent a cart'});
  if(mode=='play'&&!IN&&P.mesh){let ci=-1;CRS.forEach((C,i)=>{if(P.x>C.x0-6&&P.x<C.x1+6&&P.z>C.bz0&&P.z<C.bz1)ci=i});
   if(ci>=0){GY+=(H(ci,P.x,P.z)-GY)*Math.min(1,dt*10);SY=GY;P.mesh.position.y=GY}else if(GY!=0){GY=Math.abs(GY)<.02?0:GY*(1-Math.min(1,dt*10));SY=GY}}}
 }catch(e){if(!window.__gfErr){window.__gfErr=1;console.error('golf',e)}}return r}}
INT.push({x:CLUB.x,z:CLUB.z+6.6,r:6,l:'Wavefern Golf Club: play a round / rent a cart',a:()=>openMenu(),gf:1});
/* map place */
try{if(!POIS.some(q=>q[2]=='Golf Club'))POIS.push([CLUB.x,CLUB.z,'Golf Club','#7bd85a'])}catch(e){}
/* the golfer lifts his club in the render hook (the game poses the arms before the frame is drawn) and the third person camera takes over */
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(G&&G.on&&c===cam){cam3.aspect=innerWidth/innerHeight;cam3.updateProjectionMatrix();
  try{const q=G;if(P.arms&&P.legs){if(q.st=='drive'){P.legs[0].rotation.x=P.legs[1].rotation.x=-1.5;P.arms[0].rotation.x=P.arms[1].rotation.x=-1.1}
   else if(clubG.visible){const ph=q.ph||18;const a=-1.15+Math.max(0,(18.4-ph))/130*-1.4+Math.max(0,ph-18.4)/115*-.4;P.arms[0].rotation.x=P.arms[1].rotation.x=a;P.legs[0].rotation.x=P.legs[1].rotation.x=0}}}catch(e){}
  return r0(sc,cam3)}return r0(sc,c)}}
/* the maps: courses, ponds, sand, greens and the clubhouse */
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){const r=m0.apply(this,arguments);try{x.save();
  CRS.forEach(C=>{x.fillStyle='#4aa048';x.fillRect(sx(C.x0),sz(C.bz0+8),(C.x1-C.x0)*kx,(C.bz1-C.bz0-16)*kx);
   C.holes.forEach(o=>{x.strokeStyle='#86d85f';x.lineCap='round';x.lineJoin='round';x.lineWidth=Math.max(1,o.hw*2*kx);x.beginPath();o.path.forEach((p,i)=>i?x.lineTo(sx(p[0]),sz(p[1])):x.moveTo(sx(p[0]),sz(p[1])));x.stroke();
    if(!mini){x.fillStyle='#f3e4ac';o.bk.forEach(b=>{x.beginPath();x.arc(sx(b[0]),sz(b[1]),Math.max(1,b[2]*kx),0,6.283);x.fill()});x.fillStyle='#3b94dc';o.wt.forEach(w=>{x.beginPath();x.ellipse(sx(w[0]),sz(w[1]),Math.max(1,w[2]*kx),Math.max(1,w[3]*kx),0,0,6.283);x.fill()})}
    x.fillStyle='#4fdc5c';x.beginPath();x.arc(sx(o.pin[0]),sz(o.pin[1]),Math.max(1.5,o.gr*kx),0,6.283);x.fill()})});
  x.fillStyle='#fff';x.fillRect(sx(CLUB.x-10),sz(CLUB.z-6.5),20*kx,10*kx);x.strokeStyle='#1d4f2a';x.lineWidth=1;x.strokeRect(sx(CLUB.x-10),sz(CLUB.z-6.5),20*kx,10*kx);x.restore()}catch(e){try{x.restore()}catch(e2){}}return r}}
window.GOLF={CRS,H,surf,sim,shoot:(p,a)=>G&&shoot(p,a==null?G.aim:a),start:startRound,state:()=>G,club:CLUB};
})();
