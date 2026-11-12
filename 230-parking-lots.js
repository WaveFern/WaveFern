/* ===== v52.3.0: parking lots at the key places in the home city =====
   Flat painted car parks (asphalt, white bay lines, a blue P strip) beside the main roads near the home area, shops,
   labels, venues and landmarks. Each lot is ONE flat plane with a shared canvas texture, so it costs one draw call and
   nothing tall is added (nothing can fade or poke through the see-through buildings).
   Parking: when you get out of the car inside a lot, it glides into the nearest free bay (nose in, straight) and you step
   out beside it, on the road side. 218-parked-cars.js saves the spot, so the car stays there and shows on the map.
   Lots on the home street are placed where no house stands directly behind them (a house there would hide the parked cars).
   Lots are found on the live road list at start-up and checked against walls and buildings, so a lot that does not fit
   is simply skipped. The world map shows a blue P for every lot. Loaded after 218 (wraps its exitDrive). */
(function(){
const BAY=2.8,N=5,STRIP=.55,CAR_Z=2.3;
/* [name, centre x, a z inside the road it sits on, side: 1 = south of the road, -1 = north] */
const SPEC=[
 ['Home & Garage',-9,20,1],['Corner Shop & Radio',86,20,1],['Motors & Pet Shop',-30,20,1],['Security Agency',-56,20,-1],
 ['Music Store & Threadz',532,20,-1],['Pulse Records HQ',578,20,-1],['Aurora Residences',627,20,-1],['Nova Mall',666,20,-1],
 ['Gramophone Awards',717,20,-1],['City Plaza',586,20,1],['Skyline Tower',619,78,-1],['Barbershop & City Cafe',569,78,-1]];
const LT=window.PARKLOTS={lots:[],map:true};
const TEX={};
function tex(side,DEP){const k=side+'_'+DEP;if(TEX[k])return TEX[k];
 const pw=N*32,ph=Math.round(DEP*32),c=document.createElement('canvas');c.width=pw;c.height=ph;const g=c.getContext('2d');
 g.fillStyle='#34373d';g.fillRect(0,0,pw,ph);
 let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<260;i++){g.fillStyle=r()<.5?'#3b3e45':'#2e3036';g.fillRect(r()*pw|0,r()*ph|0,2,2)}
 const sh=Math.round(STRIP*32),y0=side>0?ph-sh:0;
 g.fillStyle='#2a63c4';g.fillRect(0,y0,pw,sh);
 g.fillStyle='#fff';
 const bw=pw/N;
 for(let i=0;i<N;i++){const cx=bw*(i+.5);/* a tiny pixel P */
  [[-3,-5,2,10],[-1,-5,5,2],[2,-3,2,4],[-1,-1,5,2]].forEach(a=>g.fillRect(cx+a[0],y0+sh/2+a[1]*.8,a[2],a[3]*.8))}
 for(let i=0;i<=N;i++){const x=Math.round(bw*i);g.fillRect(Math.max(0,Math.min(pw-3,x-1)),side>0?0:sh,3,ph-sh)}
 g.fillStyle='#8d9096';g.fillRect(0,side>0?ph-sh-2:sh,pw,2);
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;t.anisotropy=4;return TEX[k]=t}
const free=(x0,z0,x1,z1)=>{for(let x=x0;x<=x1;x+=.7)for(let z=z0;z<=z1;z+=.7)if(hit(x,z,.2))return false;
 return !ROADS.some(r=>x0<r[2]&&x1>r[0]&&z0<r[3]&&z1>r[1])};
function build(){
 const W=N*BAY;
 SPEC.forEach(([name,cx0,zh,side])=>{try{
  const R=ROADS.find(r=>r[2]-r[0]>r[3]-r[1]&&zh>=r[1]&&zh<=r[3]&&cx0>=r[0]&&cx0<=r[2]);if(!R)return;
  let cx=null,DEP=5,z0=0,z1=0;/* a lot squeezed in front of a house is a little shallower */
  for(const dp of [5,4.7]){DEP=dp;z0=side>0?R[3]:R[1]-DEP;z1=z0+DEP;
   for(const d of [0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6]){const x=cx0+d;if(x-W/2<R[0]||x+W/2>R[2])continue;if(free(x-W/2,z0,x+W/2,z1)){cx=x;break}}
   if(cx!=null)break}
  if(cx==null)return;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(W,DEP),new THREE.MeshLambertMaterial({map:tex(side,DEP),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  m.rotation.x=-Math.PI/2;m.position.set(cx,.04,(z0+z1)/2);m.matrixAutoUpdate=false;m.updateMatrix();WORLD.add(m);
  const L={name,side,x0:cx-W/2,x1:cx+W/2,z0,z1,cx,cz:(z0+z1)/2,bays:[]};
  for(let i=0;i<N;i++)L.bays.push({x:L.x0+BAY*(i+.5),z:side>0?z0+CAR_Z:z1-CAR_Z,h:side>0?0:Math.PI});
  LT.lots.push(L)}catch(e){console.error('parking lot',e)}})}
function inLot(x,z){return LT.lots.find(L=>x>L.x0-.8&&x<L.x1+.8&&z>L.z0-.8&&z<L.z1+.8)}
/* the nearest empty bay to the car, or null when every bay has a car in it */
function bayFor(L,c){let best=null,bd=1e9;
 L.bays.forEach(b=>{if(PK.some(q=>q!==c&&!q.fxk&&Math.hypot(q.x-b.x,q.z-b.z)<1.6))return;const d=Math.hypot(c.x-b.x,c.z-b.z);if(d<bd){bd=d;best=b}});
 return best}
const ex0=exitDrive;
exitDrive=function(){const c=dr;let L=null,b=null;
 try{if(c&&!c.fxk&&mode=='drive'&&LT.lots.length&&!(window.DCITY&&window.DCITY.on)){L=inLot(c.x,c.z);b=L&&bayFor(L,c);
  if(b){c.x=b.x;c.z=b.z;c.h=b.h;c.v=0;c.m.position.set(b.x,0,b.z);c.m.rotation.y=b.h}}}catch(e){console.error('park snap',e);b=null}
 ex0.apply(this,arguments);
 try{if(b){const px=b.x,pz=L.side>0?L.z0-.6:L.z1+.6;if(!hit(px,pz,.28)){P.x=px;P.z=pz}
  try{say('Parked in the '+L.name+' lot.')}catch(e){}}}catch(e){console.error('park exit',e)}};
/* blue P squares on the world map */
{const d0=mapDraw;mapDraw=function(){d0.apply(this,arguments);try{
 const c=$('bm');if(!c||!LT.lots.length)return;if(window.DCITY&&window.DCITY.on&&window.DCITY.inCity&&window.DCITY.inCity())return;
 const x=c.getContext('2d'),M=MAPZ;x.setTransform(M.R,0,0,M.R,0,0);x.imageSmoothingEnabled=false;x.font='bold 9px monospace';x.textBaseline='middle';x.textAlign='center';
 LT.lots.forEach(L=>{const X=Math.round(mapSX(L.cx)*M.z+M.ox),Z=Math.round(mapSZ(L.cz)*M.z+M.oy);
  if(X<-10||X>M.W+10||Z<-10||Z>M.H+10)return;
  x.fillStyle='#fff';x.fillRect(X-6,Z-6,12,12);x.fillStyle='#2a63c4';x.fillRect(X-5,Z-5,10,10);x.fillStyle='#fff';x.fillText('P',X,Z+1)});
 x.textAlign='start';x.textBaseline='alphabetic'}catch(e){console.error('map lots',e)}}}
try{build()}catch(e){console.error('parking lots',e)}
})();
