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
const G9=9.81,RHO=1.225,BRAD=.02135,AREA=Math.PI*BRAD*BRAD,MASS=.04593,KA=.5*RHO*AREA/MASS;/* a real golf ball: 45.9 g, 42.7 mm, drag + Magnus lift from spin */
/* surface classes: 0 rough, 1 fairway, 2 fringe, 3 green, 4 tee, 5 sand, 6 water, 7 out of bounds */
const SFN=['Rough','Fairway','Fringe','Green','Tee box','Bunker','Water','Out of bounds'];
/* bounce (restitution, tangential keep), roll friction (m/s2), shot power and spread for the lie */
/* the ground: normal restitution, friction while sliding, rolling deceleration (m/s2, a green is about Stimp 10), power and spread of the lie */
const REST=[.15,.38,.36,.35,.38,0],FRIC=[.55,.32,.34,.28,.32,.9],MU=[4.5,1.3,1,.55,1.3,9,99,99],LIE=[[.8,.05],[1,0],[1,0],[1,0],[1,0],[.6,.07]];
/* ball speed (m/s), launch angle, backspin (rpm): worked out so a full swing on flat ground without wind carries 200 / 135 / 70 m */
const CL=[{n:'Driver',v:59,loft:11.5,sb:2600,sp:.02,r:200},{n:'Iron',v:43.5,loft:17,sb:6500,sp:.012,r:135},{n:'Wedge',v:29.7,loft:28,sb:8500,sp:.01,r:70},{n:'Putter',v:7,loft:0,sb:0,sp:.004,r:40,putt:1}];
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
/* the whole flight, bounce and roll in one go: [t,x,y,z] every 1/60 s. spin = [backspin rpm, sidespin rpm] (sidespin + curves left). stopLand ends it at the first touchdown (aim preview) */
function sim(ci,x,y,z,vx,vy,vz,putt,hole,wind,spin,stopLand){
 const pts=[[0,x,y,z]];let t=0,roll=!!putt,land=null,end='rest',still=0,ac=0,wb=(spin?spin[0]:0)*Math.PI/30,ws=(spin?spin[1]:0)*Math.PI/30;
 y=Math.max(y,H(ci,x,z));if(putt)vy=0;
 for(let i=0;i<16000;i++){
  if(!roll){const dt=1/240;t+=dt;ac+=1;
   const hy=Math.pow(clamp(y,1,60)/10,.2),rx=vx-wind[0]*hy,rz=vz-wind[1]*hy,s=Math.hypot(rx,vy,rz)||1e-6,cd=s>35?.24:s<20?.4:.4-(s-20)/15*.16,
    hh=Math.hypot(vx,vz)||1,ox=-vz/hh*wb,oz=vx/hh*wb,oy=ws,om=Math.hypot(ox,oy,oz);
   let ax=-KA*cd*s*rx,ay=-G9-KA*cd*s*vy,az=-KA*cd*s*rz;
   if(om>1){const cl=Math.min(.36,om*BRAD/s*1.9),lx=oy*vz-oz*vy,ly=oz*vx-ox*vz,lz=ox*vy-oy*vx,lm=Math.hypot(lx,ly,lz)||1,al=KA*cl*s*s;ax+=al*lx/lm;ay+=al*ly/lm;az+=al*lz/lm}
   vx+=ax*dt;vy+=ay*dt;vz+=az*dt;x+=vx*dt;y+=vy*dt;z+=vz*dt;const dc=Math.exp(-dt/28);wb*=dc;ws*=dc;
   if(y<11){const tr=treeAt(ci,x,z,1.25);if(tr&&y<tr[2]+4.5+tr[3]*3){vx*=.1;vz*=.1;vy=Math.min(vy,0)*.2}}
   const gy=H(ci,x,z);
   if(y<=gy&&vy<0){y=gy;const sf=surf(ci,x,z);if(!land)land=[x,z,sf,t];
    if(stopLand){end='land';pts.push([t,x,y,z]);break}
    if(sf==6||sf==7){end=sf==6?'water':'ob';pts.push([t,x,y,z]);break}
    if(hole&&Math.hypot(x-hole[0],z-hole[1])<.09&&Math.hypot(vx,vz)<9){x=hole[0];z=hole[1];end='holed';pts.push([t,x,gy-.1,z]);break}
    /* touchdown: split the speed along and across the ground; friction on the contact point can take backspin out or spin the ball back */
    const g=grad(ci,x,z),nl=Math.hypot(g[0],1,g[1]),nx=-g[0]/nl,ny=1/nl,nz=-g[1]/nl,vn=vx*nx+vy*ny+vz*nz;
    let tx=vx-vn*nx,ty=vy-vn*ny,tz=vz-vn*nz;const tm=Math.hypot(tx,ty,tz),e=REST[sf],J=FRIC[sf]*(1+e)*(-vn);let nt=tm;
    if(sf==5){nt=tm*.12}
    else if(tm>1e-4){const wR=wb*BRAD,u=tm+wR,Jx=Math.min(J,Math.max(0,u)/3.5);nt=tm-Jx;wb=Math.max(0,(wR-2.5*Jx)/BRAD)}
    const k=tm>1e-4?nt/tm:0,vn2=-e*vn;tx*=k;ty*=k;tz*=k;vx=tx+vn2*nx;vy=ty+vn2*ny;vz=tz+vn2*nz;
    if(vn2<.9){vy=0;roll=true}}
  }else{const dt=1/120;t+=dt;ac+=2;
   const sf=surf(ci,x,z);if(sf==6||sf==7){end=sf==6?'water':'ob';pts.push([t,x,y,z]);break}
   const g=grad(ci,x,z),ax=-G9*g[0]*5/7,az=-G9*g[1]*5/7;vx+=ax*dt;vz+=az*dt;
   let sp=Math.hypot(vx,vz);const dec=MU[sf]*dt;
   if(sp<=dec){if(Math.hypot(ax,az)<MU[sf]*.9){vx=vz=0;still++}}else{vx-=vx/sp*dec;vz-=vz/sp*dec;still=0}
   x+=vx*dt;z+=vz*dt;y=H(ci,x,z);sp=Math.hypot(vx,vz);
   if(hole){const d=Math.hypot(x-hole[0],z-hole[1]);if(d<.06&&sp<1.7*(1-d/.06*.55)){x=hole[0];z=hole[1];end='holed';pts.push([t,x,y-.1,z]);break}}
   if(!land&&putt)land=[x,z,sf,t];
   if(still>20)break}
  if(ac>=4){ac-=4;pts.push([t,x,y,z])}}
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
 const nrm={},nm=(i,j)=>{const k=i+'_'+j;if(nrm[k])return nrm[k];const gx=(hh[j][Math.min(nx,i+1)]-hh[j][Math.max(0,i-1)])/(cs*(Math.min(nx,i+1)-Math.max(0,i-1))),gz=(hh[Math.min(nz,j+1)][i]-hh[Math.max(0,j-1)][i])/(cs*(Math.min(nz,j+1)-Math.max(0,j-1))),l=Math.hypot(gx,1,gz);return nrm[k]=[-gx/l,1/l,-gz/l]},nor=[];
 const cc=C.col,cl=[cc.rough,cc.fw,cc.fr,cc.gr,cc.tee,cc.sand,'#3b94dc'].map(h=>colr(h)),pos=[],col=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*cs,z=z0+j*cs,sf=surf(ci,x+1,z+1);if(sf==7)continue;
  const k=(Math.floor((x+1)/8)&1)?1.03:.985,nz2=1+(((i*7+j*13)%5)-2)*.004,c=cl[sf],cr=c.r*k*nz2,cg=c.g*k*nz2,cb=c.b*k*nz2;
  const a=hh[j][i],b=hh[j][i+1],cx=hh[j+1][i],d=hh[j+1][i+1];
  pos.push(x,a,z,x,cx,z+cs,x+cs,b,z,x+cs,b,z,x,cx,z+cs,x+cs,d,z+cs);for(let q=0;q<6;q++)col.push(cr,cg,cb);
  [[i,j],[i,j+1],[i+1,j],[i+1,j],[i,j+1],[i+1,j+1]].forEach(v=>{const n=nm(v[0],v[1]);nor.push(n[0],n[1],n[2])})}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
 const terr=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));terr.frustumCulled=false;g.add(terr);
 const b=Batch();
 C.trees.forEach(t=>{const gy=t[2],s=1+t[3]*.5,lf=cc.leaf[Math.floor(t[3]*9)%3];b.box(t[0],gy+1.3,t[1],.55,2.6,.55,'#6b4a2b');b.box(t[0],gy+3.7*s,t[1],3.4*s,2.4*s,3.4*s,lf,t[3]*3);b.box(t[0],gy+5.6*s,t[1],2.3*s,2*s,2.3*s,lf,t[3]*3+.8)});
 C.holes.forEach((o,j)=>{const[px,pz]=o.pin,py=H(ci,px,pz);
  b.box(px,py+.01,pz,.24,.02,.24,'#101010');b.box(px,py+1.3,pz,.05,2.6,.05,'#f2f2f2');b.box(px+.35,py+2.3,pz,.7,.42,.04,cc.flag);
  const tx=o.tee[0],tz=o.tee[1],ty=H(ci,tx,tz);b.box(tx+o.d*1.2,ty+.1,tz-2.3,.18,.18,.18,'#f2f2f2');b.box(tx+o.d*1.2,ty+.1,tz+2.3,.18,.18,.18,'#f2f2f2');
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

/* Golf Drive: a road north from Fern Road (the stretch that runs on to the airport) to a car park in front of the clubhouse */
let roadBuilt=0;
function buildRoad(){if(roadBuilt)return;roadBuilt=1;const b=Batch(),X=CLUB.x,Z0=-38,Z1=19.9,M=(Z0+Z1)/2,L=Z1-Z0,CZ=-45;
 b.box(X,-.03,M,8,.04,L,'#3a3d44');[-1,1].forEach(a=>b.box(X+a*4.6,-.02,M,1.2,.06,L,'#b9b5ab'));
 for(let z=Z0+4;z<Z1-8;z+=8)b.box(X,-.005,z,.3,.02,3.4,'#e8d9a0');
 b.box(X,-.03,CZ,40,.04,15,'#3a3d44');b.box(X,-.02,CZ-8.1,41,.06,1.2,'#b9b5ab');[-1,1].forEach(a=>b.box(X+a*20.6,-.02,CZ,1.2,.06,16.2,'#b9b5ab'));
 for(let k=-8;k<=8;k++){b.box(X+k*2.3,-.005,CZ-4.2,.12,.02,5,'#e9e4d8')}/* bays along the back */
 b.box(X,-.005,CZ+1.5,.3,.02,10,'#e8d9a0');
 for(let z=Z0+14;z<Z1-10;z+=26)[-5.6,5.6].forEach(a=>{b.box(X+a,2.1,z,.18,4.2,.18,'#4a4f57');b.box(X+a*.8,4.2,z,1.2,.16,.24,'#4a4f57');b.box(X+a*.8,4.1,z,.5,.12,.3,'#fff5c8')});
 root.add(b.mesh());
 label(root,'GOLF CLUB',3.6,.9,X+6.8,2.6,12,'#1d4f2a','#ffffff',-Math.PI/2);b2(root,X+6.9,1.3,12);
 try{ROADS.push([X-4,Z0,X+4,Z1],[X-20,CZ-7.5,X+20,CZ+7.5]);RNAME.v.push([X,'Golf Drive'])}catch(e){console.warn('golf road',e)}}
function b2(g,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(.14,2.6,.14),new THREE.MeshLambertMaterial({color:0x4a4f57}));m.position.set(x,y,z);g.add(m)}
/* ---------- the pieces that move: ball, aim line, target, beacon, club, cart ---------- */
const BR=.11;
const ballTex=(()=>{const c=document.createElement('canvas');c.width=64;c.height=32;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,64,32);x.fillStyle='#c4c8cf';for(let i=0;i<46;i++)x.fillRect((i*29)%64,(i*13)%30+1,3,3);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;return t})();
const ball=new THREE.Mesh(new THREE.SphereGeometry(BR,14,10),new THREE.MeshLambertMaterial({map:ballTex,emissive:0x444444}));ball.visible=false;root.add(ball);
const shadow=new THREE.Mesh(new THREE.BoxGeometry(.3,.01,.3),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false}));shadow.visible=false;root.add(shadow);
const peg=new THREE.Mesh(new THREE.BoxGeometry(.04,.1,.04),new THREE.MeshBasicMaterial({color:0xffffff}));peg.visible=false;root.add(peg);
const dots=[];for(let i=0;i<26;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.2,.04,.8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false}));m.visible=false;root.add(m);dots.push(m)}
const target=new THREE.Group();[[-1,0,3.2,.35],[1,0,3.2,.35],[0,-1,.35,3.2],[0,1,.35,3.2]].forEach(a=>{const m=new THREE.Mesh(new THREE.BoxGeometry(a[2],.05,a[3]),new THREE.MeshBasicMaterial({color:0xffe85a,transparent:true,opacity:.85,depthWrite:false}));m.position.set(a[0]*1.6,0,a[1]*1.6);target.add(m)});target.visible=false;root.add(target);
const beMat=new THREE.MeshBasicMaterial({color:0xff9a2a,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending});
const beacon=new THREE.Group();{const p=new THREE.Mesh(new THREE.BoxGeometry(.8,90,.8),beMat);p.position.y=45;beacon.add(p);const r=new THREE.Mesh(new THREE.BoxGeometry(4,.12,4),beMat);r.position.y=.1;beacon.add(r);beacon.userData.ring=r}beacon.visible=false;root.add(beacon);
const clubG=new THREE.Group(),clubS=new THREE.Group();clubG.add(clubS);{const sh=new THREE.Mesh(new THREE.BoxGeometry(.035,1.1,.035),new THREE.MeshLambertMaterial({color:0x2b2b2e}));sh.position.y=-.55;clubS.add(sh);
 const hd=new THREE.Mesh(new THREE.BoxGeometry(.1,.07,.22),new THREE.MeshLambertMaterial({color:0xc9ccd2}));hd.position.set(0,-1.1,.06);clubS.add(hd);clubG.userData.head=hd}clubG.visible=false;root.add(clubG);
const cartG=cartMesh('#e8e8e8');cartG.visible=false;root.add(cartG);
const cam3=new THREE.PerspectiveCamera(62,1,.1,1800);

/* ---------- the round ---------- */
let G=null;/* the round in progress */
const st=()=>{if(!S.golf||typeof S.golf!='object')S.golf={best:[null,null,null],rounds:0,aces:0};if(!Array.isArray(S.golf.best))S.golf.best=[null,null,null];return S.golf};
const GK={};/* keys held while golfing (the game's own key handler is bypassed) */
const css=document.createElement('style');css.textContent=`
#golfhud{position:fixed;inset:0;z-index:7;pointer-events:none;display:none;font-family:Silkscreen,'Courier New',monospace;color:#fff;--g:#5fe06a;--gd:#2f9a3a;--bg:rgba(7,15,11,.82);--ln:rgba(255,255,255,.2)}
#golfhud *{box-sizing:border-box}
#golfhud .gfp{position:absolute;background:var(--bg);border:2px solid var(--ln);box-shadow:0 4px 0 rgba(0,0,0,.35)}
#golfhud small{font-size:10px;opacity:.7;letter-spacing:.06em}
#golfhud kbd{display:inline-block;min-width:22px;padding:2px 6px;margin:0 3px;background:#e8efe9;color:#10201a;border-bottom:3px solid #8aa392;font:inherit;font-size:10px;text-align:center}
#gf_hole{left:14px;top:12px;display:flex;gap:12px;padding:8px 14px 8px 8px;align-items:center}
.gfnum{width:54px;height:54px;background:var(--g);color:#0b1d10;font-size:30px;display:flex;align-items:center;justify-content:center;border-bottom:4px solid var(--gd)}
.gfbig{font-size:20px;letter-spacing:.04em;margin:2px 0 5px}.gfbig small{font-size:12px;margin-left:4px}
.gfdots{display:flex;gap:4px}.gfdots i{width:16px;height:8px;background:#34423a;display:block}.gfdots i.cur{outline:2px solid var(--g);outline-offset:1px;background:#34423a}
#gf_dist{left:50%;top:12px;transform:translateX(-50%);padding:6px 20px 6px;text-align:center;min-width:170px}
#gf_dist b{font-size:34px;font-weight:normal;letter-spacing:.02em}#gf_dist div{margin-top:2px}
#gf_wind{right:14px;top:12px;padding:8px 14px;text-align:center;min-width:104px}
#gf_arr{width:40px;height:40px;margin:0 auto 4px;position:relative;transition:transform .25s}
#gf_arr{background:#fff;clip-path:polygon(50% 0,100% 48%,72% 48%,72% 100%,28% 100%,28% 48%,0 48%)}
#gf_bar{left:22px;top:50%;margin-top:-170px;width:74px;height:340px;padding:30px 0 44px;display:none}
#gf_bar .t{position:absolute;left:0;right:0;top:8px;text-align:center;font-size:11px;letter-spacing:.1em}
#gf_bar .tr{position:relative;margin:0 auto;width:30px;height:100%;border:3px solid #fff;background:#0a0f0c}
#gf_fill{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(0deg,#ffd23f,#ff8a3b 55%,#ff3b3b)}
#gf_bar .tr i{position:absolute;left:-8px;right:-8px;border-top:2px solid rgba(255,255,255,.7)}
#gf_bar .pc{position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:13px}
#gf_clubs{left:14px;bottom:14px;padding:8px;display:flex;gap:6px;align-items:stretch}
.gfc{padding:6px 8px;border:2px solid var(--ln);min-width:76px;opacity:.6}.gfc.on{opacity:1;border-color:var(--g);background:rgba(95,224,106,.16)}
.gfc b{display:block;font-size:12px;font-weight:normal}.gfc small{display:block;margin-top:2px}
.gflie{padding:6px 10px;border:2px solid var(--ln);min-width:116px}.gflie b{display:block;font-size:13px;font-weight:normal}.gflie i{display:inline-block;width:10px;height:10px;margin-right:6px;vertical-align:-1px}
#gf_hint{left:50%;bottom:14px;transform:translateX(-50%);padding:7px 14px;font-size:11px;white-space:nowrap}
#gf_tip{left:50%;bottom:62px;transform:translateX(-50%);padding:10px 16px;text-align:center;font-size:12px;line-height:1.7;display:none}
#gf_tip b{color:var(--g);font-weight:normal}
#gf_msg{left:50%;top:92px;transform:translateX(-50%);padding:7px 18px;font-size:14px;opacity:0;transition:opacity .25s;white-space:nowrap}
#gf_banner{position:absolute;left:50%;top:26%;transform:translate(-50%,-50%);text-align:center;opacity:0;pointer-events:none}
#gf_banner.show{animation:gfban var(--d,2.2s) ease both}
#gf_banner b{display:block;font-weight:normal;font-size:56px;letter-spacing:.06em;text-shadow:0 5px 0 #000b}#gf_banner span{display:block;margin-top:6px;font-size:18px;text-shadow:0 3px 0 #000b}
@keyframes gfban{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}12%{opacity:1;transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-62%) scale(1)}}
#gf_card{left:50%;top:50%;transform:translate(-50%,-50%);padding:20px 24px;background:rgba(7,15,11,.95);min-width:min(560px,94vw);pointer-events:auto;display:none;font-size:13px}
#gf_card h2{margin:0 0 4px;font-weight:normal;font-size:26px;letter-spacing:.05em}#gf_card p{margin:0 0 14px;font-size:12px;opacity:.85;line-height:1.6}
.gfsc{border-collapse:collapse;width:100%;text-align:center;font-size:13px}.gfsc th{font-weight:normal;opacity:.6;text-align:left;padding:5px 8px;font-size:10px;letter-spacing:.08em}
.gfsc td{padding:5px 4px;border-top:1px solid rgba(255,255,255,.12)}.gfsc tr:first-child td,.gfsc tr:first-child th{border-top:0}.gfsc .tot{background:rgba(255,255,255,.07)}
.gfsc td i{display:inline-block;min-width:26px;padding:3px 0;font-style:normal}
.gfbtn{font:inherit;font-size:14px;padding:9px 22px;background:#e8efe9;color:#10201a;border:0;border-bottom:4px solid #8aa392;cursor:pointer;margin-left:8px}.gfbtn.go{background:var(--g);border-bottom-color:var(--gd)}.gfbtn:hover{filter:brightness(1.08)}.gfbtn:active{transform:translateY(2px);border-bottom-width:2px}
#gf_card .row{margin-top:16px;text-align:right}
.gfkeys{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;align-items:center;margin:6px 0 4px;font-size:12px}
#gf_fade{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .35s}`;document.head.appendChild(css);
const hud=document.createElement('div');hud.id='golfhud';
hud.innerHTML=`<div id=gf_hole class=gfp><div id=gf_num class=gfnum>1</div><div><small id=gf_course></small><div id=gf_par class=gfbig></div><div id=gf_dots class=gfdots></div></div></div>
<div id=gf_dist class=gfp></div>
<div id=gf_wind class=gfp><div id=gf_arr></div><div id=gf_wt></div></div>
<div id=gf_bar class=gfp><div class=t>POWER</div><div class=tr><div id=gf_fill></div><i style="top:33%"></i><i style="top:66%"></i></div><div class=pc id=gf_pc>0%</div></div>
<div id=gf_clubs class=gfp></div>
<div id=gf_tip class=gfp></div>
<div id=gf_hint class=gfp></div>
<div id=gf_msg class=gfp></div>
<div id=gf_banner></div>
<div id=gf_card class=gfp></div>
<div id=gf_fade></div>`;
document.body.appendChild(hud);
const $g=id=>document.getElementById(id);
const setT=(id,h)=>{const e=$g(id);if(e&&e._h!==h){e._h=h;e.innerHTML=h}};
function toast(t,ms){const e=$g('gf_msg');e.textContent=t;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,ms||1800)}
function banner(t,sub,col,ms){const e=$g('gf_banner');e.className='';void e.offsetWidth;e.style.setProperty('--d',(ms||2200)/1000+'s');e.innerHTML='<b style="color:'+(col||'#fff')+'">'+t+'</b>'+(sub?'<span>'+sub+'</span>':'');e.className='show'}
const scCol=(s,p)=>s==null?'#6b7a70':s==1?'#ffd23f':s-p<=-2?'#ffd23f':s-p==-1?'#5fe06a':s==p?'#ffffff':s-p==1?'#ffa14a':'#ff6b5a';
const toPar=d=>d==0?'E':d>0?'+'+d:''+d;
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
  banner('HOLE '+(hi+1),'PAR '+o.par+' · '+o.len+' M',null,2400);try{sn('pop')}catch(e){}};
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
 const ang=Math.atan2(SW.ax,Math.max(1,SW.ay));shoot(p,G.aim-clamp(ang,-.6,.6)*.55,clamp(ang,-.6,.6));SW.live=p}
/* keyboard fallback: hold Space to charge the bar, let go to hit straight */
function keyCharge(dt){if(G.st=='ready'&&GK[' ']&&!G.busy&&!G.card&&!G.paused){G.keyHold=Math.min(1.2,G.keyHold+dt);SW.live=G.keyHold/1.2}else if(G.keyHold>0&&!GK[' ']){const p=G.keyHold/1.2;G.keyHold=0;if(p>.04&&G.st=='ready')shoot(p,G.aim);SW.live=p}}
const LIEPW=sf=>(LIE[sf]||LIE[0]);
function shoot(p,psi,sideAng){const ci=G.ci,b=G.ball,cl=CL[G.club],sf=surf(ci,b.x,b.z),lie=LIEPW(sf);sideAng=sideAng||0;
 psi+=(R2()-.5)*2*(cl.sp+lie[1]+(p>.96?.025:0));let r;const w=wnd(G.wind),pw=p*(cl.putt?(sf==5?.7:1):lie[0]);
 if(cl.putt){const v=pw*cl.v;r=sim(ci,b.x,b.y,b.z,Math.sin(psi)*v,0,Math.cos(psi)*v,true,G.hole.pin,w)}
 else{const v=pw*cl.v,lf=(cl.loft+(sf==5?6:0)-(sf==0?2:0))*Math.PI/180,h=Math.cos(lf)*v,back=cl.sb*(.55+.45*p)*(sf==0?.5:sf==5?.6:1),side=(R2()-.5)*500+(p>.96?(R2()-.5)*2200:0)+sideAng*1500;
  r=sim(ci,b.x,b.y+.04,b.z,Math.sin(psi)*h,Math.sin(lf)*v,Math.cos(psi)*h,false,G.hole.pin,w,[back,side])}
 G.strokes++;G.shot=r;G.pb={t:0,i:0,r,done:0,hold:0};G.bx=b.x;G.bz=b.z;G.st='fly';G.fdir=dirOf(psi);G.lastHit={x:b.x,z:b.z};G.sw2=0;
 if(!cl.putt)setBeacon(r.land[0],r.land[1],'#ff9a2a');G.after=0;sn('pop');peg.visible=false}
function afterShot(){const r=G.shot,o=G.hole;
 if(r.end=='holed'){G.ball={x:o.pin[0],y:H(G.ci,o.pin[0],o.pin[1])-.1,z:o.pin[1]};holeOut();return}
 if(r.end=='water'||r.end=='ob'){G.strokes++;toast(r.end=='water'?'SPLASH! +1 stroke':'OUT OF BOUNDS! +1 stroke',1800);sn('err');
  if(G.strokes>=o.par+6){clearBeacon();toast('PICK UP: max strokes',1600);return holeOut(true)}
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
 G.holeName=name;G.holePay=pay;sn(pick?'pop':d<0?'cash':'chime');banner(name,G.strokes+' stroke'+(G.strokes==1?'':'s')+' · par '+G.hole.par+(pay?' · +$'+pay:''),scCol(G.strokes,G.hole.par),2600);setTimeout(()=>{if(G&&G.st=='holeend')showHoleCard()},1700)}
function sumHtml(){const C=G.C;let tot=0,par=0,done=0;
 const cell=(s,p)=>{if(s==null)return'<td>-</td>';const d=s-p,sh=s==1||d<=-1?'border:2px solid;border-radius:50%':d>=1?'border:2px solid;border-radius:0':'';return'<td><i style="color:'+scCol(s,p)+';'+sh+'">'+s+'</i></td>'};
 C.holes.forEach((o,i)=>{const s=G.sc[i];if(s!=null){tot+=s;par+=o.par;done++}});
 const h='<table class=gfsc><tr><th></th>'+C.holes.map((o,i)=>'<td'+(i==G.hi&&G.st!='done'?' style="color:#5fe06a"':'')+'>'+(i+1)+'</td>').join('')+'<th class=tot style="text-align:center">TOT</th></tr>'
  +'<tr><th>M</th>'+C.holes.map(o=>'<td style="opacity:.7">'+o.len+'</td>').join('')+'<td class=tot style="opacity:.7">'+C.holes.reduce((a,o)=>a+o.len,0)+'</td></tr>'
  +'<tr><th>PAR</th>'+C.holes.map(o=>'<td>'+o.par+'</td>').join('')+'<td class=tot>'+C.holes.reduce((a,o)=>a+o.par,0)+'</td></tr>'
  +'<tr><th>YOU</th>'+C.holes.map((o,i)=>cell(G.sc[i],o.par)).join('')+'<td class=tot><b>'+(done?tot+' <small>('+toPar(tot-par)+')</small>':'-')+'</b></td></tr></table>';
 return{h,tot,par,done}}
function showHoleCard(){const last=G.hi>=5,s=sumHtml(),c=$g('gf_card'),d=G.strokes-G.hole.par;G.card=1;
 c.innerHTML='<h2 style="color:'+scCol(G.strokes,G.hole.par)+'">'+G.holeName+(G.holePay?' <span style="color:#5fe06a;font-size:16px">+$'+G.holePay+'</span>':'')+'</h2><p>Hole '+(G.hi+1)+' · '+G.strokes+' stroke'+(G.strokes==1?'':'s')+' on a par '+G.hole.par+(G.hole.len?' ('+G.hole.len+' m)':'')+'. Round so far: '+toPar(s.tot-s.par)+'.</p>'+s.h+'<div class=row><button class="gfbtn go" onclick="golfNext()">'+(last?'FINISH ROUND':'NEXT HOLE')+' <small style="opacity:.6">SPACE</small></button></div>';c.style.display='block'}
window.golfNext=function(){if(!G||!G.card)return;sn('pop');if(G.hi>=5)endRound();else{G.card=0;$g('gf_card').style.display='none';beginHole(G.hi+1)}};
function endRound(){const s=sumHtml(),g=st(),ci=G.ci,tot=s.tot,d=tot-s.par;g.rounds++;let best='';if(g.best[ci]==null||tot<g.best[ci]){best=g.best[ci]==null?'First round on this course!':'New best score!';g.best[ci]=tot}
 const pay=20;S.money=+((S.money||0)+pay).toFixed(2);S.earn=(S.earn||0)+pay;sv();G.st='done';G.card=2;sn('cash');
 const c=$g('gf_card');c.innerHTML='<small>ROUND COMPLETE</small><h2>'+E(G.C.n)+'</h2><div style="display:flex;align-items:baseline;gap:14px;margin:6px 0 12px"><span style="font-size:54px;color:'+(d<0?'#5fe06a':d>0?'#ffa14a':'#fff')+'">'+tot+'</span><span style="font-size:22px">'+toPar(d)+'</span><span style="font-size:12px;opacity:.8;margin-left:auto;text-align:right;line-height:1.7">+$'+pay+' prize<br>Best here: '+g.best[ci]+'<br>Rounds played: '+g.rounds+'</span></div>'+(best?'<p style="color:#ffd23f;margin-bottom:10px">'+best+'</p>':'')+s.h+'<div class=row><button class="gfbtn go" onclick="golfLeave()">BACK TO THE CLUBHOUSE</button></div>';c.style.display='block'}
window.golfLeave=function(){if(!G)return;sn('pop');fade(()=>exitGolf())};
function exitGolf(){const was=G;G=null;SW.on=0;mode='play';try{$('hud').style.display=''}catch(e){}hud.style.display='none';document.body.classList.remove('fston');
 ball.visible=shadow.visible=peg.visible=clubG.visible=target.visible=cartG.visible=false;dots.forEach(d=>d.visible=false);clearBeacon();
 P.x=CLUB.x;P.z=CLUB.z+8.5;P.rot=Math.PI;try{P.mesh.visible=true;P.mesh.rotation.x=0}catch(e){}SY=0;GY=0;$g('gf_card').style.display='none';$g('gf_fade').style.opacity=0;sv()}
function pauseCard(){if(!G||G.card==1||G.card==2)return;G.paused=!G.paused;const c=$g('gf_card');
 if(G.paused){c.innerHTML='<h2>Paused</h2><p>'+E(G.C.n)+' · hole '+(G.hi+1)+' of 6 · '+(G.cart?'cart rented':'on foot')+'</p><div class=gfkeys><span><kbd>HOLD LMB</kbd></span><span>then <b style="color:#5fe06a;font-weight:normal">push the mouse forward</b>: speed = power, direction = shot</span><span><kbd>A</kbd><kbd>D</kbd></span><span>Aim (hold <kbd>SHIFT</kbd> for fine aim)</span><span><kbd>WHEEL</kbd><kbd>1-4</kbd></span><span>Pick a club</span><span><kbd>V</kbd></span><span>First / third person</span><span><kbd>TAB</kbd></span><span>Scorecard</span><span><kbd>SPACE</kbd></span><span>Keyboard swing: hold, then let go</span><span><kbd>E</kbd></span><span>Get out of the cart at your ball</span></div><div class=row><button class=gfbtn onclick="golfQuit()">QUIT ROUND</button><button class="gfbtn go" onclick="golfResume()">RESUME</button></div>';c.style.display='block'}else c.style.display='none'}
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
  const x=lerp(a[1],c[1],f),y=lerp(a[2],c[2],f),z=lerp(a[3],c[3],f);ball.position.set(x,y+BR,z);shadow.position.set(x,gyOf(x,z)+.06,z);{const dx=x-(q.bx||x),dz=z-(q.bz||z),d=Math.hypot(dx,dz);if(d>1e-4&&d<5){const ax=new THREE.Vector3(dz,0,-dx).normalize();ball.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,d/BR))}q.bx=x;q.bz=z}ball.visible=shadow.visible=true;
  if(pb.t>=T){if(!pb.done){pb.done=1;pb.hold=0}pb.hold+=dt;const fast=pb.skip?.05:r.end=='holed'?1.1:.9;if(pb.hold>fast){q.pb=null;afterShot()}}}
 else if(b&&(q.st=='ready'||q.st=='hold'||q.st=='swing'||q.st=='drive'||q.st=='holeend'||q.st=='fade')){ball.position.set(b.x,b.y+BR,b.z);ball.visible=q.st!='holeend'&&!q.card;shadow.position.set(b.x,b.y+.06,b.z);shadow.visible=ball.visible}
 /* the player, the club, the cart */
 clubG.visible=false;peg.visible=false;
 if(q.st!='drive'){placeGolfer();SY=gyOf(P.x,P.z)}
 if(q.st=='ready'||q.st=='hold'||q.st=='swing'||(q.st=='fly'&&q.pb&&q.pb.t<1.2)){const g=placeGolfer(),dir=dirOf(q.aim),gy=b.y,putt=CL[q.club].putt;
  SY=gyOf(P.x,P.z);const sf=surf(q.ci,b.x,b.z);if(sf==4&&!putt&&q.st!='fly'){peg.visible=true;peg.position.set(b.x,gy+.03,b.z);ball.position.y=gy+.15}
  clubG.visible=true;clubG.position.set(g.px,gy+1.05,g.pz);clubG.rotation.y=q.aim;clubG.userData.head.scale.set(CL[q.club].n=='Driver'?1.6:1,CL[q.club].n=='Driver'?1.5:1,CL[q.club].n=='Driver'?1.8:1);
  let ph=18.4;if(q.st=='ready')ph=18.4-(q.back||0);
  if(q.st=='hold'){SW.pull=Math.max(0,SW.pull-dt*.3);q.back=lerp(q.back||0,SW.pull*(putt?30:125),Math.min(1,dt*14));ph=18.4-q.back}
  if(q.st=='swing'){q.sw2=(performance.now()-SW.tS)/140;ph=lerp(18.4-(q.back||0),18.4,sm(q.sw2))}
  if(q.st=='fly'){q.sw2+=dt/.4;ph=18.4+sm(q.sw2)*(putt?25:115);q.back=0}
  if(q.st=='ready'&&q.sw2>0){q.sw2=0}
  q.ph=ph;clubS.rotation.x=-ph*Math.PI/180;P.mesh.visible=q.view!='1p'}
 else if(q.st=='drive'||q.st=='fade'){P.mesh.visible=true}
 if(q.cart&&(q.st=='drive'||q.st=='ready'||q.st=='hold'||q.st=='swing'||q.st=='fly'||q.st=='fade')){if(q.st=='drive')driveTick(dt);cartG.visible=true;cartG.position.set(q.cx,q.cy,q.cz);cartG.rotation.set(q.cp||0,q.ch,0,'YXZ')
  if(q.st=='drive'){SY=q.cy+.55;P.mesh.visible=true}}
 /* aim line and target */
 const show=q.st=='ready'&&!q.card&&!q.paused;
 if(show){if(q.dirty&&performance.now()-(q.pvT||0)>90){q.dirty=0;q.pvT=performance.now();const cl=CL[q.club],w=wnd(q.wind);let d;
   if(cl.putt){d=Math.min(12,pinD());q.tgt=null}
   else{const sf=surf(q.ci,b.x,b.z),lie=LIEPW(sf),lf=(cl.loft+(sf==5?6:0)-(sf==0?2:0))*Math.PI/180,v=cl.v*lie[0],h=Math.cos(lf)*v,r=sim(q.ci,b.x,b.y+.04,b.z,Math.sin(q.aim)*h,Math.sin(lf)*v,Math.cos(q.aim)*h,false,null,w,[cl.sb*(sf==0?.5:sf==5?.6:1),0],true);q.tgt=r.land;d=Math.hypot(r.land[0]-b.x,r.land[1]-b.z)}
   q.ad=d}
  const dir=dirOf(q.aim),n=dots.length;dots.forEach((m,i)=>{const t=(i+1)/n*q.ad,x=b.x+dir[0]*t,z=b.z+dir[1]*t;m.visible=i<n&&(i%2==0);m.position.set(x,gyOf(x,z)+.12,z);m.rotation.y=q.aim});
  if(q.tgt){target.visible=true;target.position.set(q.tgt[0],gyOf(q.tgt[0],q.tgt[1])+.15,q.tgt[1]);target.rotation.y=q.aim}else target.visible=false}
 else{dots.forEach(m=>m.visible=false);target.visible=false}
 /* beacon pulse */
 if(beacon.visible){const s=1+Math.sin(performance.now()/260)*.12;beacon.userData.ring.scale.set(s,1,s);beMat.opacity=.42+Math.sin(performance.now()/300)*.1}
 camTick(dt);hudTick()}
const SFC=['#3d8a36','#6dc24b','#58b84c','#4fdc5c','#7ad257','#efe0a8','#3b94dc','#888'];
function hudTick(){const q=G,o=q.hole,cl=CL[q.club],b=q.ball,sf=surf(q.ci,b.x,b.z),showing=!q.card&&!q.paused;
 setT('gf_num',q.hi+1);setT('gf_course',E(q.C.n).toUpperCase()+' · HOLE '+(q.hi+1)+' OF 6');setT('gf_par','PAR '+o.par+'<small>'+o.len+' M</small>');
 setT('gf_dots',q.C.holes.map((h,i)=>'<i'+(i==q.hi?' class=cur':'')+(q.sc[i]!=null?' style="background:'+scCol(q.sc[i],h.par)+'"':'')+'></i>').join(''));
 const sk=q.strokes+(q.st=='fly'||q.st=='holeend'||q.st=='done'?0:1);
 setT('gf_dist','<b>'+Math.round(pinD())+'</b><small> M TO PIN</small><div><small>STROKE '+sk+' · TOTAL '+toPar(q.sc.reduce((a,v,i)=>a+(v!=null?v-q.C.holes[i].par:0),0))+'</small></div><div style="margin-top:5px"><small><i style="display:inline-block;width:9px;height:9px;margin-right:6px;background:'+SFC[sf]+'"></i>LIE: '+SFN[sf].toUpperCase()+'</small></div>');
 const w=wnd(q.wind),a=dirOf(q.aim),al=w[0]*a[0]+w[1]*a[1],sd2=w[0]*a[1]-w[1]*a[0],ws=q.wind.s,lab=ws<.6?'CALM':Math.abs(al)>Math.abs(sd2)*1.4?(al>0?'TAILWIND':'HEADWIND'):'CROSSWIND';
 $g('gf_arr').style.transform='rotate('+Math.round(Math.atan2(-sd2,al)*180/Math.PI)+'deg)';setT('gf_wt',ws.toFixed(1)+' <small>M/S</small><div><small>'+lab+'</small></div>');
 const live=q.st=='fly'||q.st=='hold'||q.st=='swing'||q.keyHold>0||(SW.live||0)>.02,bar=$g('gf_bar');bar.style.display=(q.st=='ready'||live)&&showing?'block':'none';
 const pv=Math.round(clamp(SW.live||0,0,1)*100);$g('gf_fill').style.height=pv+'%';setT('gf_pc',pv+'%');
 setT('gf_clubs',CL.map((c,i)=>'<div class="gfc'+(i==q.club?' on':'')+'"><small><kbd>'+(i+1)+'</kbd></small><b>'+c.n.toUpperCase()+'</b><small>'+(c.putt?'ON THE GREEN':c.r+' M')+'</small></div>').join(''));
 $g('gf_clubs').style.display=(q.st=='ready'||q.st=='hold'||q.st=='swing'||q.st=='drive')&&showing?'flex':'none';
 let h='',tip='';
 if(!showing)h='';else if(q.st=='ready')h='<kbd>A</kbd><kbd>D</kbd> AIM <kbd>WHEEL</kbd> CLUB <kbd>V</kbd> CAMERA <kbd>TAB</kbd> CARD <kbd>ESC</kbd> MENU';
 else if(q.st=='drive')h='<kbd>W</kbd><kbd>S</kbd> DRIVE <kbd>A</kbd><kbd>D</kbd> STEER <kbd>E</kbd> GET OUT'+(q.near?' (BALL IS NEAR)':'')+' <kbd>ENTER</kbd> SKIP TO BALL';
 else if(q.st=='fly')h='<kbd>SPACE</kbd> SKIP';
 if(showing&&q.st=='ready'&&q.hi==0&&q.strokes==0)tip='<b>1</b> HOLD THE LEFT MOUSE BUTTON &nbsp; <b>2</b> PUSH THE MOUSE FORWARD<br><small>FASTER PUSH = MORE POWER · PUSH LEFT OR RIGHT TO CURVE THE AIM</small>';
 if(showing&&q.st=='hold')tip='<b style="font-size:20px">PUSH FORWARD NOW</b>';
 setT('gf_hint',h);$g('gf_hint').style.display=h?'block':'none';setT('gf_tip',tip);$g('gf_tip').style.display=tip?'block':'none';
 if(q.tab&&!q.card&&!q.paused){const c=$g('gf_card');c.innerHTML='<small>SCORECARD</small><h2>'+E(q.C.n)+'</h2>'+sumHtml().h;c.style.display='block';q.tabOn=1}else if(q.tabOn){q.tabOn=0;if(!q.card&&!q.paused)$g('gf_card').style.display='none'}}

/* the walker stands on the hills when you stroll over the course */
let near=null;
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='title')return r;const off=away();root.visible=!off;if(off)return r;dt=dt||.016;
 if(!clubBuilt)buildClubhouse();if(!roadBuilt)buildRoad();
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
/* the maps: every course is drawn as crisp vector shapes straight from the course data (the same fairway lines, greens, bunkers and ponds the game uses),
   with outlines, fringes and tee boxes, so it reads like a course map at any zoom. Hole numbers, flags and the clubhouse go on top. */
const shade=(h,k)=>{const c=colr(h);return'rgb('+Math.round(clamp(c.r*255*k,0,255))+','+Math.round(clamp(c.g*255*k,0,255))+','+Math.round(clamp(c.b*255*k,0,255))+')'};
const sup=(cx,cz,a,b,n)=>{const p=[];for(let k=0;k<n;k++){const t=k/n*6.283,c=Math.cos(t),s2=Math.sin(t);p.push([cx+a*Math.sign(c)*Math.pow(Math.abs(c),.77),cz+b*Math.sign(s2)*Math.pow(Math.abs(s2),.77)])}return p};
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){const r=m0.apply(this,arguments);try{x.save();x.lineJoin='round';x.lineCap='round';
  const poly=(P,fill,stroke,lw)=>{x.beginPath();P.forEach((p,i)=>i?x.lineTo(sx(p[0]),sz(p[1])):x.moveTo(sx(p[0]),sz(p[1])));x.closePath();if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=lw;x.stroke()}};
  const lw=Math.max(.8,kx*.5);
  CRS.forEach((C,ci)=>{const cc=C.col,bx0=C.x0-2,bx1=C.x1+2,bz0=C.bz0+6,bz1=C.bz1-6;
   /* the course: a rounded plot in the rough colour with a darker edge */
   x.beginPath();x.roundRect?x.roundRect(sx(bx0),sz(bz0),(bx1-bx0)*kx,(bz1-bz0)*kx,10*kx):x.rect(sx(bx0),sz(bz0),(bx1-bx0)*kx,(bz1-bz0)*kx);x.fillStyle=shade(cc.rough,1.12);x.fill();x.strokeStyle=shade(cc.rough,.7);x.lineWidth=Math.max(1,kx*.8);x.stroke();
   C.holes.forEach(o=>{
    x.beginPath();o.path.forEach((p,i)=>i?x.lineTo(sx(p[0]),sz(p[1])):x.moveTo(sx(p[0]),sz(p[1])));x.strokeStyle=shade(cc.fw,.78);x.lineWidth=Math.max(1.6,(o.hw*2+1.6)*kx);x.stroke();
    x.strokeStyle=shade(cc.fw,1.04);x.lineWidth=Math.max(1,o.hw*2*kx);x.stroke();
    x.strokeStyle=shade(cc.fw,1.14);x.lineWidth=Math.max(.6,o.hw*kx);x.setLineDash([5*kx,5*kx]);x.stroke();x.setLineDash([])});
   C.holes.forEach(o=>{poly(sup(o.pin[0],o.pin[1],o.gr+2.2,o.gr*.85+2.2,36),shade(cc.fr,1.05),shade(cc.fr,.75),lw*.7);poly(sup(o.pin[0],o.pin[1],o.gr,o.gr*.85,36),shade(cc.gr,1.04),shade(cc.gr,.72),lw);
    const tx=o.tee[0],tz=o.tee[1];poly([[tx-5,tz-3.2],[tx+5,tz-3.2],[tx+5,tz+3.2],[tx-5,tz+3.2]],shade(cc.tee,1.05),shade(cc.tee,.72),lw*.7);
    o.bk.forEach(b=>{poly(sup(b[0],b[1],b[2],b[2],20),shade(cc.sand,1.04),shade(cc.sand,.72),lw*.8)});
    o.wt.forEach(w=>{poly(sup(w[0],w[1],w[2],w[3],28).map(p=>p),'#3b94dc','#8fd0ff',lw)})});
   if(!mini||kx>.35)C.trees.forEach(t=>{const px=sx(t[0]),pz=sz(t[1]),rr=Math.max(.8,(1.9+t[3]*.8)*kx);x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.arc(px+rr*.3,pz+rr*.35,rr,0,6.283);x.fill();x.fillStyle=shade(cc.leaf[Math.floor(t[3]*9)%3],1);x.beginPath();x.arc(px,pz,rr,0,6.283);x.fill()});
   if(!mini&&kx>.45)C.holes.forEach((o,j)=>{const px=sx(o.pin[0]),pz=sz(o.pin[1]),fh=Math.max(6,kx*5);x.strokeStyle='#fff';x.lineWidth=Math.max(1,kx*.14);x.beginPath();x.moveTo(px,pz);x.lineTo(px,pz-fh);x.stroke();x.fillStyle=cc.flag;x.fillRect(px,pz-fh,Math.max(3.5,kx*2.8),Math.max(2.4,kx*1.8));
     const tx=sx(o.tee[0]-o.d*7),tz=sz(o.tee[1]),rr=Math.max(5.5,kx*3.8);x.fillStyle='rgba(8,18,12,.88)';x.beginPath();x.arc(tx,tz,rr,0,6.283);x.fill();x.strokeStyle='#fff';x.lineWidth=1;x.stroke();x.fillStyle='#fff';x.font='bold '+Math.round(rr*1.2)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(j+1,tx,tz+.5)})});
  /* the clubhouse: roof, cart bay and path */
  const cx0=CLUB.x,cz0=CLUB.z;x.fillStyle='#a9a392';x.fillRect(sx(cx0+14.8),sz(cz0+4.2),10.4*kx,3.6*kx);x.fillStyle='#d8d2c0';x.fillRect(sx(cx0-12),sz(cz0-7.5),24*kx,15*kx);x.fillStyle='#2f6a3a';x.fillRect(sx(cx0-10.8),sz(cz0-6.8),21.6*kx,11.6*kx);x.fillStyle='#3a7d46';x.fillRect(sx(cx0-8),sz(cz0-5),16*kx,8*kx);
  x.strokeStyle='#1d4f2a';x.lineWidth=1;x.strokeRect(sx(cx0-12),sz(cz0-7.5),24*kx,15*kx);x.restore()}catch(e){try{x.restore()}catch(e2){}if(!window.__gfMapErr){window.__gfMapErr=1;console.error('golf map',e)}}return r}}
window.GOLF={ui:{hole:()=>G&&holeOut(),end:()=>G&&endRound(),G:()=>G},CRS,H,surf,sim,shoot:(p,a)=>G&&shoot(p,a==null?G.aim:a),start:startRound,state:()=>G,club:CLUB};
})();
