/* ===== v52.3.0 parking lots, v52.4.0 big lots + decoration cars =====
   Flat painted car parks (asphalt, white bay lines, a blue P strip) beside the main roads near the home area, shops,
   labels, venues and landmarks, plus two BIG lots: the City Car Park (aisles and three rows of bays) and the two festival
   car parks on both sides of Park Avenue. Each row of bays is ONE flat plane with a shared canvas texture (one draw call)
   and nothing tall is added, so nothing can fade or poke through the see-through buildings.
   Decoration: a few cars (about a third of the bays, never the whole lot) stand in the bays: real car models in traffic
   colours, one mesh each, with a solid footprint so you cannot drive or walk through them.
   Parking: when you get out of the car inside a lot, it glides into the nearest free bay (nose in, straight) and you step
   out in front of it. 218-parked-cars.js saves the spot, so the car stays there and shows on the map.
   Lots are placed on the live road list at start-up and checked against walls and buildings, so a lot that does not fit
   is skipped. Lots on the home street are placed where no house stands directly behind them (a house there would hide
   the parked cars). The world map shows a blue P for every lot (a larger one for the big lots). Loaded after 218 (wraps its exitDrive). */
(function(){
const BAY=2.8,STRIP=.55,CAR_Z=2.3,AIS=6;
const LT=window.PARKLOTS={lots:[],map:true};
const TEX={};
function tex(back,n,DEP){const k=back+'_'+n+'_'+DEP;if(TEX[k])return TEX[k];
 const pw=n*32,ph=Math.round(DEP*32),c=document.createElement('canvas');c.width=pw;c.height=ph;const g=c.getContext('2d');
 g.fillStyle='#34373d';g.fillRect(0,0,pw,ph);
 let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<n*52;i++){g.fillStyle=r()<.5?'#3b3e45':'#2e3036';g.fillRect(r()*pw|0,r()*ph|0,2,2)}
 const sh=Math.round(STRIP*32),y0=ph-sh;/* the blue strip is at the back (canvas bottom) */
 g.fillStyle='#2a63c4';g.fillRect(0,y0,pw,sh);g.fillStyle='#fff';const bw=pw/n;
 for(let i=0;i<n;i++){const cx=bw*(i+.5);[[-3,-5,2,10],[-1,-5,5,2],[2,-3,2,4],[-1,-1,5,2]].forEach(a=>g.fillRect(cx+a[0],y0+sh/2+a[1]*.8,a[2],a[3]*.8))}
 for(let i=0;i<=n;i++){const x=Math.round(bw*i);g.fillRect(Math.max(0,Math.min(pw-3,x-1)),0,3,ph-sh)}
 g.fillStyle='#8d9096';g.fillRect(0,y0-2,pw,2);
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;t.anisotropy=4;return TEX[k]=t}
const mat=m=>{m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;return m};
/* local frame of a row: u along the row, v towards the back (blue strip); world = centre + u*(cos,-sin) + v*(sin,cos) of the turn th */
const wp=(o,u,v)=>[o.cx+u*Math.cos(o.th)+v*Math.sin(o.th),o.cz-u*Math.sin(o.th)+v*Math.cos(o.th)];
const aabb=(cx,cz,w,d,th)=>{const q=Math.abs(Math.round(th/(Math.PI/2)))%2==1,hw=(q?d:w)/2,hd=(q?w:d)/2;return[cx-hw,cz-hd,cx+hw,cz+hd]};
const free=(a)=>{for(let x=a[0];x<=a[2];x+=.7)for(let z=a[1];z<=a[3];z+=.7)if(hit(x,z,.2))return false;
 return !ROADS.some(r=>a[0]<r[2]&&a[2]>r[0]&&a[1]<r[3]&&a[3]>r[1])};
const rngOf=name=>{let s=0;for(const ch of name)s=(s*31+ch.charCodeAt(0))%2147483647;s=s||7;return()=>(s=(s*16807)%2147483647)/2147483647};
const CARCOL=['#e6b422','#3b82f6','#2f8f5a','#c0392b','#e8e8ec','#ff8a30','#8e44ad','#2b2e36','#9aa0a6','#2fb5b0'];
/* one row of n bays; returns false when the ground is not free */
function row(G,cx,cz,th,n,DEP){const W=n*BAY,o={cx,cz,th};
 if(!free(aabb(cx,cz,W,DEP,th)))return false;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(W,DEP),mat(new THREE.MeshLambertMaterial({map:tex(1,n,DEP)})));
 m.rotation.order='YXZ';m.rotation.x=-Math.PI/2;m.rotation.y=th;m.position.set(cx,.04,cz);m.matrixAutoUpdate=false;m.updateMatrix();WORLD.add(m);
 for(let i=0;i<n;i++){const u=-W/2+BAY*(i+.5),[x,z]=wp(o,u,-DEP/2+CAR_Z),[ex,ez]=wp(o,u,-DEP/2-.6);
  G.bays.push({x,z,h:th,ex,ez,taken:0,th})}
 return true}
function aisle(cx,cz,w,d){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat(new THREE.MeshLambertMaterial({color:'#34373d'})));
 m.rotation.x=-Math.PI/2;m.position.set(cx,.038,cz);m.matrixAutoUpdate=false;m.updateMatrix();WORLD.add(m);
 const l=new THREE.Mesh(new THREE.PlaneGeometry(w-1,.12),mat(new THREE.MeshLambertMaterial({color:'#8d9096'})));l.rotation.x=-Math.PI/2;l.position.set(cx,.039,cz);l.matrixAutoUpdate=false;l.updateMatrix();WORLD.add(l)}
function newLot(name,zone,mark,big){const G={name,zone,mark,big:!!big,bays:[]};return G}
function decorate(G,share){const rnd=rngOf(G.name);let n=0;const max=Math.max(1,Math.floor(G.bays.length*share));
 G.bays.forEach(b=>{if(n>=max||rnd()>share)return;n++;b.taken=1;
  const m=mkS(carb(Math.floor(rnd()*4),CARCOL[Math.floor(rnd()*CARCOL.length)])),j=(rnd()-.5)*.12,sl=(rnd()-.5)*.3,
   ux=Math.cos(b.th)*sl,uz=-Math.sin(b.th)*sl,x=b.x+ux,z=b.z+uz;
  m.scale.setScalar(1.5);m.position.set(x,0,z);m.rotation.y=b.h+j;WORLD.add(m);
  const q=Math.abs(Math.round(b.th/(Math.PI/2)))%2==1,hx=q?1.85:.8,hz=q?.8:1.85;col(x-hx,z-hz,x+hx,z+hz)})}
function build(){
 /* small lots beside a main road: [name, centre x, a z inside the road, side: 1 south of the road, -1 north] */
 [['Home & Garage',-9,20,1],['Corner Shop & Radio',86,20,1],['Motors & Pet Shop',-30,20,1],['Security Agency',-56,20,-1],
  ['Music Store & Threadz',532,20,-1],['Pulse Records HQ',578,20,-1],['Aurora Residences',627,20,-1],['Nova Mall',666,20,-1],
  ['Gramophone Awards',717,20,-1],['City Plaza',586,20,1],['Skyline Tower',619,78,-1],['Barbershop & City Cafe',569,78,-1]
 ].forEach(([name,cx0,zh,side])=>{try{
  const N=5,W=N*BAY,R=ROADS.find(r=>r[2]-r[0]>r[3]-r[1]&&zh>=r[1]&&zh<=r[3]&&cx0>=r[0]&&cx0<=r[2]);if(!R)return;
  for(const DEP of [5,4.7]){const z0=side>0?R[3]:R[1]-DEP,cz=z0+DEP/2,G=newLot(name,null,null);
   for(const d of [0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6]){const x=cx0+d;if(x-W/2<R[0]||x+W/2>R[2])continue;
    if(row(G,x,cz,side>0?0:Math.PI,N,DEP)){G.zone=aabb(x,cz,W,DEP,0);G.mark={x,z:cz};decorate(G,.3);LT.lots.push(G);return}}}}catch(e){console.error('parking lot',e)}});
 /* City Car Park: two aisles, three rows of 12 bays, on the open block east of City Plaza */
 try{const N=12,W=N*BAY,x0=609,cx=x0+W/2,z0=25,G=newLot('City Car Park',[x0,z0,x0+W,z0+27],{x:cx,z:z0+13},1);
  if(free(G.zone)){aisle(cx,z0+3,W,AIS);aisle(cx,z0+19,W,AIS);
   row(G,cx,z0+8.5,0,N,5);row(G,cx,z0+13.5,Math.PI,N,5);row(G,cx,z0+24.5,0,N,5);
   G.zone=[x0,z0,x0+W,z0+27];decorate(G,.3);LT.lots.push(G)}else console.warn('City Car Park does not fit')}catch(e){console.error('city car park',e)}
 /* Festival car parks along Park Avenue, either side of the road, opening onto it (the gate is at z -64, so they stop short of it) */
 const RV=ROADS.find(r=>r[3]-r[1]>r[2]-r[0]&&-40>=r[1]&&-40<=r[3]&&204>=r[0]&&204<=r[2]);
 if(RV)[['Festival Car Park East',RV[2]+2.55,-32.6,Math.PI/2,17],['Festival Car Park West',RV[0]-2.55,-43,-Math.PI/2,16]].forEach(([name,cx,cz,th,n])=>{try{
  const G=newLot(name,aabb(cx,cz,n*BAY,5,th),{x:cx,z:cz},1);
  if(row(G,cx,cz,th,n,5)){decorate(G,.3);LT.lots.push(G)}else console.warn(name+' does not fit')}catch(e){console.error(name,e)}})}
const inLot=(x,z)=>LT.lots.find(L=>x>L.zone[0]-.8&&x<L.zone[2]+.8&&z>L.zone[1]-.8&&z<L.zone[3]+.8);
/* the nearest empty bay to the car, or null when every bay has a car in it */
function bayFor(L,c){let best=null,bd=1e9;
 L.bays.forEach(b=>{if(b.taken||PK.some(q=>q!==c&&!q.fxk&&Math.hypot(q.x-b.x,q.z-b.z)<1.6))return;const d=Math.hypot(c.x-b.x,c.z-b.z);if(d<bd){bd=d;best=b}});
 return best}
const ex0=exitDrive;
exitDrive=function(){const c=dr;let L=null,b=null;
 try{if(c&&!c.fxk&&mode=='drive'&&LT.lots.length&&!(window.DCITY&&window.DCITY.on)){L=inLot(c.x,c.z);b=L&&bayFor(L,c);
  if(b){c.x=b.x;c.z=b.z;c.h=b.h;c.v=0;c.m.position.set(b.x,0,b.z);c.m.rotation.y=b.h}}}catch(e){console.error('park snap',e);b=null}
 ex0.apply(this,arguments);
 try{if(b){if(!hit(b.ex,b.ez,.28)){P.x=b.ex;P.z=b.ez}
  try{say('Parked in the '+L.name+' lot.')}catch(e){}}}catch(e){console.error('park exit',e)}};
/* blue P squares on the world map */
{const d0=mapDraw;mapDraw=function(){d0.apply(this,arguments);try{
 const c=$('bm');if(!c||!LT.lots.length)return;if(window.DCITY&&window.DCITY.on&&window.DCITY.inCity&&window.DCITY.inCity())return;
 const x=c.getContext('2d'),M=MAPZ;x.setTransform(M.R,0,0,M.R,0,0);x.imageSmoothingEnabled=false;x.textBaseline='middle';x.textAlign='center';
 LT.lots.forEach(L=>{if(!L.mark)return;const X=Math.round(mapSX(L.mark.x)*M.z+M.ox),Z=Math.round(mapSZ(L.mark.z)*M.z+M.oy),h=L.big?9:6;
  if(X<-10||X>M.W+10||Z<-10||Z>M.H+10)return;x.font=(L.big?'bold 14px':'bold 9px')+' monospace';
  x.fillStyle='#fff';x.fillRect(X-h,Z-h,h*2,h*2);x.fillStyle='#2a63c4';x.fillRect(X-h+1,Z-h+1,h*2-2,h*2-2);x.fillStyle='#fff';x.fillText('P',X,Z+1)});
 x.textAlign='start';x.textBaseline='alphabetic'}catch(e){console.error('map lots',e)}}}
try{build()}catch(e){console.error('parking lots',e)}
})();
