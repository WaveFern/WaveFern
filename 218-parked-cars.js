/* ===== v49.94.0: cars stay where you park them, map markers, and the mechanic =====
   1. A car you leave stays exactly where you left it. It no longer jumps back to the garage when you get out or when the game
      rebuilds the parked cars (loading, buying a car, flying, admin refresh). Where each car stands is saved in S.cpk
      ({carIndex:[x,z,heading]}); a car with no entry is in the garage (it only shows in the garage room, and you take it out
      with Drive at Tom's garage). Old saves have no S.cpk, so all their cars start in the garage.
   2. While you are on foot, every car that is out shows on the minimap and the world map as a gold car marker.
   3. The mechanic puts all your cars back in the garage for $60 to $100 (by how far the furthest car is from the garage).
      Offered on the Cars page of the computer and on the world map. */
(function(){
const GX=18.6,GZ=10,MINF=60,MAXF=100,FAR=500;
const num=v=>typeof v=='number'&&isFinite(v);
function cpk(){if(!S.cpk||typeof S.cpk!='object'||Array.isArray(S.cpk))S.cpk={};return S.cpk}
function slot(j){return{x:GX+j*2.1,z:GZ}}
/* drop saved spots that are damaged, belong to a car you do not own, or are inside a wall */
function cleanSpots(){const k=cpk();Object.keys(k).forEach(key=>{const j=+key,p=k[key];
 if(!Number.isInteger(j)||j<0||j>=(S.cars||[]).length||!Array.isArray(p)||!num(p[0])||!num(p[1])||Math.abs(p[0])>5000||Math.abs(p[1])>5000)delete k[key];
 else if(!num(p[2]))p[2]=0})}
/* the sleigh (xm) is the one car that stands by the house when it has not been moved */
const isXm=ci=>!!(CARS[ci]&&CARS[ci].xm);
function isOut(c){return c.j!=null&&!c.fxk&&!!cpk()[c.j]}
/* the car you are driving right now: record where it is (called before saving and before the cars are rebuilt) */
function syncSpots(){try{const c=dr;if(mode!='drive'||!c||c.fxk||c.j==null||c.j>=(S.cars||[]).length||!num(c.x)||!num(c.z))return;const k=cpk();k[c.j]=[+c.x.toFixed(2),+c.z.toFixed(2),+(c.h||0).toFixed(3)]}catch(e){console.error('syncSpots',e)}}
{const s0=saveCode;saveCode=function(){syncSpots();return s0.apply(this,arguments)}}

const fg0=fillGarage;
/* the garage room keeps one slot per owned car (other scripts index GCM by car number); a car that is out gets an empty placeholder */
fillGarage=function(){try{
 if(!IG[6])return;GCM.forEach(m=>IG[6].remove(m));const k=cpk();
 GCM=S.garage?S.cars.map((ci,j)=>{if(k[j])return new THREE.Group();const m=mkS(carb(ci));m.scale.setScalar(1.1);m.position.set(86+j*1.8,0,325.2);m.rotation.y=Math.PI;IG[6].add(m);return m}):[]
}catch(e){console.error('fillGarage',e);try{fg0()}catch(_){}}};

parkCars=function(){
 syncSpots();cleanSpots();fillGarage();
 const drv=(mode=='drive'&&dr&&!dr.fxk)?dr.j:null;
 PK.forEach(c=>{if(!c.fxk)scene.remove(c.m)});
 const k=cpk(),keep=PK.filter(c=>c.fxk);
 PK=[];
 (S.cars||[]).forEach((ci,j)=>{
  if(!CARS[ci])return;
  const sp=k[j];if(!sp&&!(S.garage&&isXm(ci)))return;
  const s=slot(j),x=sp?sp[0]:s.x,z=sp?sp[1]:s.z,h=sp?sp[2]:0;
  const m=mkS(carb(ci));m.scale.setScalar(1.5);m.position.set(x,0,z);m.rotation.y=h;scene.add(m);
  PK.push({i:ci,j,m,x,z,h,v:0})});
 keep.forEach(c=>PK.push(c));
 if(drv!=null){const c=PK.find(q=>q.j===drv);if(c)dr=c;else{dr=null;mode='play';try{P.mesh.visible=true}catch(e){}}}
};
/* take car number j out of the garage: it stands at the garage door, ready to drive (Tom's garage, Drive) */
window.pcSpawn=function(j){const ci=(S.cars||[])[j];if(!CARS[ci]||!S.garage)return null;
 let c=PK.find(q=>q.j===j&&!q.fxk);
 if(!c){const s=slot(j),m=mkS(carb(ci));m.scale.setScalar(1.5);m.position.set(s.x,0,s.z);scene.add(m);c={i:ci,j,m,x:s.x,z:s.z,h:0,v:0};PK.push(c)}
 return c};
window.pcIsOut=j=>!!cpk()[j];

/* leaving a car saves where it stands */
const ex0=exitDrive;
exitDrive=function(){const c=dr;ex0.apply(this,arguments);try{if(c&&!c.fxk&&c.j!=null){cpk()[c.j]=[+c.x.toFixed(2),+c.z.toFixed(2),+(c.h||0).toFixed(3)];c.m.rotation.y=c.h||0}}catch(e){console.error('exitDrive',e)}};

/* ---------- the mechanic ---------- */
function outCars(){return PK.filter(isOut)}
function mechFee(list){let d=0;list.forEach(c=>{const s=slot(c.j);d=Math.max(d,Math.hypot(c.x-s.x,c.z-s.z))});
 const f=MINF+(MAXF-MINF)*Math.min(1,d/FAR);return Math.max(MINF,Math.min(MAXF,Math.round(f)))}
window.mechanicInfo=function(){const l=outCars();return{n:l.length,fee:l.length?mechFee(l):0}};
window.mechanicPay=function(){
 try{
  if(mode=='drive'){snd('err');return say('Park and get out of your car first.')}
  const l=outCars();
  if(!l.length){snd('err');return say('All your cars are already in the garage.')}
  const f=mechFee(l);
  if(!(S.money>=f)){snd('err');return say('The mechanic charges $'+f+' to bring your cars home. You need $'+(f-Math.max(0,S.money)).toFixed(0)+' more.')}
  S.money=+(S.money-f).toFixed(2);
  l.forEach(c=>{delete cpk()[c.j]});
  parkCars();try{updateVersion()}catch(e){}
  snd('cash');say('The mechanic returned '+l.length+' car'+(l.length>1?'s':'')+' to your garage for $'+f+'.');
  if(typeof app!='undefined'&&mode=='pc'&&typeof pcR=='function')pcR();
  else if($('gar')&&typeof gcList=='function')gcList();
  else if($('bm')){const b=$('mechbtn');if(b){b.disabled=true;b.textContent='Cars returned'}}
 }catch(e){console.error('mechanic',e);try{snd('err')}catch(_){}}};
function mechCard(){const i=window.mechanicInfo();
 return`<div class=cards><div class=card><b style="font-size:15px;color:var(--t)">Mechanic</b><p class=m>${S.cars&&S.cars.length?(i.n?`${i.n} of your cars ${i.n>1?'are':'is'} parked out in the world (gold markers on the map). The mechanic brings ${i.n>1?'them':'it'} back to your garage. Price depends on the distance.`:'All your cars are in the garage. Cars you leave outside stay where you parked them.'):'Buy a car first.'}</p>${i.n?`<button class=go ${S.money<i.fee?'disabled':''} onclick="mechanicPay()">Return all cars · ${$$(i.fee)}</button>`:''}</div></div>`}
{const p0=PA.cars;PA.cars=function(){return p0.apply(this,arguments)+mechCard()}}

{const b0=bigMap;bigMap=function(){b0.apply(this,arguments);try{
 if(!$('bm')||(typeof D!='undefined'&&D.on&&D.inCity&&D.inCity()))return;const r=document.querySelector('#ui .row2');if(!r||$('mechbtn'))return;
 const i=window.mechanicInfo();if(!i.n)return;const b=document.createElement('button');b.id='mechbtn';b.textContent='Mechanic: cars home $'+i.fee;
 b.onclick=()=>{window.mechanicPay()};r.insertBefore(b,r.lastElementChild)}catch(e){console.error('mech btn',e)}}}

/* ---------- map markers (only while you are on foot) ---------- */
const away=()=>{try{return typeof D!='undefined'&&D.on&&D.inCity&&D.inCity()}catch(e){return false}};
function markers(){if(mode=='drive'||away())return[];return outCars()}
function carIcon(x,px,pz,sc,col){x.fillStyle='#000';x.fillRect(px-5*sc,pz-3*sc,10*sc,6*sc);x.fillStyle=col;x.fillRect(px-4*sc,pz-2*sc,8*sc,4*sc);x.fillStyle='#fff';x.fillRect(px-2*sc,pz-2*sc,4*sc,1*sc)}
{const m0=mmDraw;mmDraw=function(){m0.apply(this,arguments);try{
 if(mT!==0||mm.style.display=='none'||away())return;const l=markers();if(!l.length)return;
 const x=mm.getContext('2d'),Sc=.9;let near=1e9;
 l.forEach(c=>{let X=75+(c.x-P.x)*Sc,Z=75+(c.z-P.z)*Sc;near=Math.min(near,Math.hypot(c.x-P.x,c.z-P.z));
  const out=X<8||X>142||Z<8||Z>142;X=Math.max(8,Math.min(142,X));Z=Math.max(8,Math.min(142,Z));carIcon(x,Math.round(X),Math.round(Z),out?.8:1,'#ffc400')});
 if(typeof ml!='undefined'&&ml.innerHTML.indexOf('Car:')<0)ml.innerHTML+='<br>Car: '+Math.round(near)+' m (gold marker)'}catch(e){console.error('mm cars',e)}}}
{const d0=mapDraw;mapDraw=function(){d0.apply(this,arguments);try{
 const c=$('bm');if(!c)return;const l=markers();if(!l.length)return;
 const x=c.getContext('2d'),M=MAPZ;x.setTransform(M.R,0,0,M.R,0,0);x.imageSmoothingEnabled=false;x.font='10px monospace';
 l.forEach(q=>{const X=Math.round(mapSX(q.x)*M.z+M.ox),Z=Math.round(mapSZ(q.z)*M.z+M.oy);carIcon(x,X,Z,1.4,'#ffc400');
  x.fillStyle='#000';x.fillText(CARS[q.i].n,X+9,Z+4);x.fillStyle='#ffe066';x.fillText(CARS[q.i].n,X+8,Z+3)})}catch(e){console.error('map cars',e)}}}
})();
