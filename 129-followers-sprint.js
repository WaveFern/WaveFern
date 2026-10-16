/* ===== v42.6.0: sprint animation, bodyguards animate like you, followers keep up =====
   - buildChar keeps each character's leg and arm pivots on g.userData.lim, so bodyguards can swing them.
   - The player gets a sprint pose while running: faster, longer strides, bigger arm swing, a forward lean and more bounce.
   - Bodyguards walk, run and stand like the player (same stride, sprint pose when fast).
   - Pets and bodyguards catch up at up to 8 m/s (you sprint at 6.5), and teleport next to you when more than
     14 m away, when you jump somewhere (doors, taxis, leaving the car), or after 2.5 s stuck over 3 m behind. */
{const b0=buildChar;buildChar=function(c){const r=b0.apply(this,arguments);try{if(r&&r.g&&r.legs&&r.arms)r.g.userData.lim={legs:r.legs,arms:r.arms}}catch(e){}return r}}
/* sprint factor 0..1 from a speed (walk 3.3, sprint 6.5) */
const sprK=v=>Math.max(0,Math.min(1,(v-3.6)/2.6));
/* swing a character's limbs: ph = stride phase, m = how much it is moving (0..1), k = sprint factor */
function limSwing(L,ph,m,k){const s=Math.sin(ph),a=.05+(.65+.45*k)*m,b=.05+(.65+.75*k)*m;
 L.legs[0].rotation.x=s*a;L.legs[1].rotation.x=-s*a;L.arms[0].rotation.x=-s*b-.35*k*m;L.arms[1].rotation.x=s*b-.35*k*m}
/* the player's sprint pose, on top of the normal walk */
const SPR129={lx:null,lz:null,v:0,k:0};
{const u0=update;update=function(dt){u0(dt);try{
 if(!P.mesh||!P.legs||!P.arms||dt<=0)return;const ok=mode=='play'&&!P.sit&&P.mesh.visible;
 let inst=SPR129.lx==null?0:Math.hypot(P.x-SPR129.lx,P.z-SPR129.lz)/dt;if(inst>12)inst=0;/* doors and taxis */SPR129.lx=P.x;SPR129.lz=P.z;SPR129.v+=(Math.min(inst,9)-SPR129.v)*Math.min(1,dt*10);
 const tk=ok&&inst>.5?sprK(SPR129.v):0;SPR129.k+=(tk-SPR129.k)*Math.min(1,dt*8);const k=SPR129.k;
 P.mesh.rotation.order='YXZ';
 if(k<.01){if(P.mesh.rotation.x)P.mesh.rotation.x=0;return}
 P.t+=dt*7*k;/* quicker steps */limSwing(P,P.t,1,k);
 P.mesh.rotation.x=.2*k;P.mesh.position.y+=Math.abs(Math.sin(P.t))*.07*k}catch(e){}}}
/* followers: catch up, teleport when lost, and animate bodyguards */
const FLW129={px:null,pz:null};
function flwSpot(f){const tx=P.x+f.ox,tz=P.z+f.oz;if(typeof hit!='function'||!hit(tx,tz,.25))return[tx,tz];
 for(const o of[[f.ox*.5,f.oz*.5],[0,.8],[.8,0],[-.8,0],[0,-.8]])if(!hit(P.x+o[0],P.z+o[1],.25))return[P.x+o[0],P.z+o[1]];return[P.x,P.z]}
{const w0=worldTick;worldTick=function(dt){w0(dt);try{
 if(typeof FOL=='undefined'||!FOL.length||dt<=0){FLW129.px=P.x;FLW129.pz=P.z;return}
 const jump=FLW129.px!=null&&Math.hypot(P.x-FLW129.px,P.z-FLW129.pz)>4;FLW129.px=P.x;FLW129.pz=P.z;
 FOL.forEach((f,i)=>{if(f.home||!f.m)return;const g=f.m,L=g.userData.lim,ret=L&&S.gs=='returning';
  const ox=f.x,oz=f.z,tx=P.x+f.ox,tz=P.z+f.oz;let d=Math.hypot(tx-f.x,tz-f.z);
  f.far=d>3?(f.far||0)+dt:0;
  if(!ret&&(jump||d>14||f.far>2.5||mode=='drive')){const p=flwSpot(f);f.x=p[0];f.z=p[1];f.far=0;f.tp=1}
  else if(d>1){/* the base step tops out at 5 m/s: add up to 3 m/s more so they keep up with a sprint */
   const ex=Math.min(d-1,3*dt*Math.min(1,(d-1)/1.5)),a=Math.atan2(tx-f.x,tz-f.z);f.x+=Math.sin(a)*ex;f.z+=Math.cos(a)*ex}
  g.position.x+=f.x-ox;g.position.z+=f.z-oz;
  if(!L)return;/* bodyguards: walk / run like the player */
  const inst=f.tp?0:Math.hypot(f.x-(f.lx??f.x),f.z-(f.lz??f.z))/dt;f.tp=0;f.lx=f.x;f.lz=f.z;
  f.v=(f.v||0)+(Math.min(inst,9)-(f.v||0))*Math.min(1,dt*8);const m=Math.max(0,Math.min(1,(f.v-.2)/1)),k=sprK(f.v)*m;
  f.ph=(f.ph||Math.random()*6)+dt*(2+m*(f.v/3.3)*10);limSwing(L,f.ph,m,k);
  g.rotation.order='YXZ';g.rotation.x=.2*k;g.position.y=Math.abs(Math.sin(f.ph))*(.06+.07*k)*m;
  if(m<.1){/* idle: face the way you face */const dr=((P.rot||0)-g.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI;g.rotation.y+=dr*Math.min(1,dt*3)}})}catch(e){}}}
