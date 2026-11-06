/* WaveFern dev: busier streets, fan crowds and smooth pedestrian avoidance. Only loaded on /dev/.
   1. Pedestrians step around you with a spring: they pick a side once, ease sideways, slow down while they squeeze past,
      turn gradually and ease back into their lane. Nothing is ever snapped or shoved (the old sidestep and shove in
      131-street-flow.js are neutralised from here, the live game files are untouched).
   2. More people on the pavements.
   3. Fan crowds: the more famous you are, the more pedestrians notice you, walk over and gather round (up to 10-15 at
      once at high fame). Each bodyguard with you cuts the crowd (1 guard ~40%, 2 guards ~12%, 3 guards none).
      People in the crowd lose interest after a while and walk back to the pavement; a new person takes their place.
   Signing an autograph for a crowd member works like the normal fans. */
(function(){
 if(!window.FW_FEAT)return;
 const C=window.FW_CROWD={force:false,off:false,extra:1,n:0,want:0};
 const now=()=>performance.now()/1000,R=(a,b)=>a+Math.random()*(b-a);
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const G=[1,.4,.12,0],TIER=[0,0,0,3,5,7,9,11,12,13,14,14,15];
 const SIDE=1.0,SPACE=1.3;
 /* heading change is rate-limited (rad/s) so nobody can ever spin round in a frame or two, whatever made the target flip */
 const TURN=4.2;
 function turn(n,tgt,dt,k){let d=tgt-n._hd;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const m=(n._turn||TURN)*dt;n._hd+=clamp(d*Math.min(1,dt*k),-m,m)}
 let CW=[],nextRec=0,nextRel=0,rollT=0,roll=0,extraDone=0;

 function prep(n){
  if(n._fx)return;n._fx=1;const base=n.sp;
  /* the live street-flow code writes sp and _ao every frame; both are taken over here so it can no longer move anyone */
  Object.defineProperty(n,'sp',{get(){return base*n._sf},set(){},configurable:true});
  Object.defineProperty(n,'_ao',{get(){return 0},set(){},configurable:true});
  n._sp0=base;n._sf=1;n._lo=0;n._lv=0;n._sd=0;n._hd=n.m.rotation.y}
 const play=()=>mode=='play'&&!IN&&!HIN&&(P.x<-1||P.x>17||P.z>13);
 const guards=()=>S.gs=='follow'?Math.min(3,S.guards|0):0;
 function want(t){
  if(C.off||!play())return 0;
  if(t>rollT){rollT=t+45;roll=Math.round(R(-1,1))}
  const tier=C.force?8:fameTier();
  const b=TIER[Math.min(12,tier)]||0;if(!b)return 0;
  return clamp(Math.round((b+roll)*G[guards()]),0,15)}
 function lists(){return[[NPC,0],[VPED,1]]}

 /* more people on the pavements, once */
 function addExtras(){
  extraDone=1;if(!(C.extra>0))return;
  const cfg=()=>({skin:RI(0,5),eyes:RI(0,4),mouth:RI(0,3),hair:RI(0,11),hc:RI(0,11),top:RI(0,4),tc:RI(0,9),pc:RI(0,7),body:Math.random()});
  RH.forEach(h=>[h[0]-3.1,h[0]+4.8].forEach(z=>{const n=Math.round((h[2]-h[1])/42*C.extra);for(let i=0;i<n;i++)addNPC(z,R(h[1]+2,h[2]-2),h[1]+1,h[2]-1,R(.8,1.7),Math.random()<.06)}));
  RVV.forEach(v=>[v[0]-3.1,v[0]+4.8].forEach(x=>{const n=Math.round((v[2]-v[1])/42*C.extra);for(let i=0;i<n;i++){const o=buildChar(cfg());o.g.visible=false;scene.add(o.g);VPED.push({m:o.g,legs:o.legs,arms:o.arms,x,x0:x,z:R(v[1]+2,v[2]-2),mn:v[1]+1,mx:v[2]-1,dir:Math.random()<.5?1:-1,sp:R(.8,1.7),t:R(0,6)})}}))}

 function release(n,vert,cd,t){
  if(n._cw){
   /* back onto the pavement: the lane position is rebuilt from where they stand, then the sideways offset eases to zero */
   const lat=vert?'x':'z',lon=vert?'z':'x',lane=vert?n.x0:n.z0;
   const cx=n._cx,cz=n._cz;
   n[lon]=vert?cz:cx;n._lo=(vert?cx:cz)-lane;n[lat]=lane;n._lv=0;
   const v=vert?n._vz:n._vx;if(Math.abs(v)>.3)n.dir=v>0?1:-1;
   n._sf=0;n._cw=0}
  n._pend=0;n._cd=t+cd;
  const i=CW.indexOf(n);if(i>=0)CW.splice(i,1)}

 function crowd(dt,t,w){
  const ok=play();
  /* members that stopped being valid */
  for(let i=CW.length-1;i>=0;i--){const n=CW[i],vert=n._vt;
   if(!n.m.visible||!ok||(n.st|0)==2){release(n,vert,!ok?5:60,t)}}
  if(CW.length<w&&t>nextRec){
   nextRec=t+R(.35,.8);
   const c=[];
   lists().forEach(([L,v])=>L.forEach(n=>{if(!n.m.visible||n._cw||n._pend||(n.st|0)!=0||n.pet||(n._cd||0)>t)return;const d=Math.hypot(n.x-P.x,n.z-P.z);if(d>4&&d<30)c.push([d,n,v])}));
   c.sort((a,b)=>a[0]-b[0]);
   if(c.length){const k=c[Math.floor(Math.random()*Math.min(6,c.length))],n=k[1];n._vt=k[2];n._pend=t+R(.4,1.3);CW.push(n)}}
  else if(CW.length>w&&t>nextRel){
   nextRel=t+.8;let b=null,bd=-1;CW.forEach(n=>{const d=Math.hypot(n.x-P.x,n.z-P.z);if(d>bd){bd=d;b=n}});if(b)release(b,b._vt,25,t)}
  CW.slice().forEach(n=>{
   if(n._pend&&t>=n._pend){
    /* the moment they notice you: take over from the ambient walk */
    n._pend=0;n._cw=1;n._cx=n.x;n._cz=n.z;n._vx=0;n._vz=0;n._v=0;n._ph=n._ph||0;
    n._so=R(-.35,.35);n._sr0=R(2.7,4.6);n._sa=Math.atan2(n.x-P.x,n.z-P.z);n._sr=n._sr0;n._bt=t+R(35,80);n._stk=0;n._lo=0;n._lv=0;n._sd=0;n._mx=R(1.2,2.3);
    /* they notice you, pause a moment, then turn to face their spot before walking */
    n._ms='turn';n._mt=t+R(.15,.8);n._ib=t+R(2,5);n._lk=0;n._ap=0;n._apT=0}});
  /* spread out: everyone gets their own slot on a ring round you (kept in their current order round you, so nobody swaps
     places), and the ring is wide enough that neighbouring slots are never closer than the body spacing */
  {const A=CW.filter(n=>n._cw);if(A.length){
   A.forEach(n=>n._ca=Math.atan2(n._cx-P.x,n._cz-P.z));A.sort((x,y)=>x._ca-y._ca);
   const m=A.length,rMin=m*SPACE/(2*Math.PI);
   /* each person keeps (roughly) the angle they arrive from; neighbours are only pushed apart where they would be too close */
   const rr=Math.max(rMin,2.4),gap=Math.min(SPACE/rr,2*Math.PI/m),a=A.map(n=>n._ca);
   for(let it=0;it<12&&m>1;it++)for(let i=0;i<m;i++){const j=(i+1)%m;let g=a[j]-a[i];if(j==0)g+=2*Math.PI;if(g<gap){const h=(gap-g)/2;a[i]-=h;a[j]+=h}}
   A.forEach((n,i)=>{n._sa=a[i];n._sr=Math.max(n._sr0,rMin)})}}
  CW.slice().forEach(n=>{
   if(!n._cw)return;
   const vert=n._vt;let cx=n._cx,cz=n._cz;
   const tx=P.x+Math.sin(n._sa)*n._sr,tz=P.z+Math.cos(n._sa)*n._sr,dx=tx-cx,dz=tz-cz,dist=Math.hypot(dx,dz);
   const want=Math.atan2(dx,dz);let err=want-n._hd;while(err>Math.PI)err-=2*Math.PI;while(err<-Math.PI)err+=2*Math.PI;
   const pl=Math.atan2(P.x-cx,P.z-cz);
   let target=pl,v=0;
   /* followers only ever walk towards you (facing you), never away from you or round you with their back turned:
      if getting to their spot would mean turning away, they stand where they are and face you instead */
   let pa=want-pl;while(pa>Math.PI)pa-=2*Math.PI;while(pa<-Math.PI)pa+=2*Math.PI;
   const pd0=Math.hypot(P.x-cx,P.z-cz),away=Math.abs(pa)>.9&&pd0<12;
   /* the way they actually walk: towards their spot, but with the body kept turned mostly towards you */
   const tw=pl+Math.max(-.6,Math.min(.6,pa*.7));let ew=tw-n._hd;while(ew>Math.PI)ew-=2*Math.PI;while(ew<-Math.PI)ew+=2*Math.PI;
   if(away&&n._ms!='idle'){n._ms='idle';n._ib=t+R(1.5,4)}
   /* three calm states: turn on the spot to face where they are going, walk straight the way they face, then stand and idle */
   if(n._ms=='turn'){
    n._turn=3.6;if(t>=n._mt){target=tw;if(Math.abs(ew)<.3)n._ms='walk'}
    if(dist<.45&&n._ms=='turn')n._ms='idle'}
   else if(n._ms=='walk'){
    /* walk towards the spot but keep the body turned mostly towards you */
    target=tw;n._turn=3.6;
    if(Math.abs(ew)>.8){n._ms='turn';n._mt=t}
    else if(dist<.45){n._ms='idle';n._ib=t+R(1.5,4)}
    else{v=Math.max(.5,Math.min(n._mx,dist*1.1))*Math.max(0,Math.cos(ew));
     /* wait for anyone standing in the way instead of walking into them */
     const fx0=Math.sin(n._hd),fz0=Math.cos(n._hd);
     bodies().forEach(o=>{if(o===n)return;const ox=o.x-cx,oz=o.z-cz,od=Math.hypot(ox,oz);if(od<1.5&&od>1e-3&&(ox*fx0+oz*fz0)/od>.5)v=0})}}
   else{
    /* standing around: face you, and now and then look away, shift about or fiddle with a phone */
    if(t>n._lk)n._lkv=0;
    target=pl+(n._lkv||0);n._turn=3.6;
    if(t>n._ib){n._ib=t+R(2.5,6);const r=Math.random();
     if(r<.4){n._lkv=R(-1.1,1.1);n._lk=t+R(1,2.2)}
     else if(r<.7){n._apT=1;n._ap_t=t+R(2,4)}
     else{n._ms='turn';n._mt=t;n._sr=n._sr+R(-.4,.4);n._sr0=clamp(n._sr0+R(-.4,.4),2.4,5)}}
    if(n._apT&&t>n._ap_t)n._apT=0;
    /* you moved away or the ring shifted: wait a beat, then turn and follow */
    if(dist>1.1&&!away){n._ms='turn';n._mt=t+R(.25,.9)}}
   turn(n,target,dt,8);n._turn=0;
   /* velocity is always along the facing direction, so there is no sideways or diagonal sliding */
   n._v+=(v-n._v)*Math.min(1,dt*(v>n._v?2.2:5));
   const fx=Math.sin(n._hd),fz=Math.cos(n._hd);n._vx=fx*n._v;n._vz=fz*n._v;
   const nx=cx+n._vx*dt,nz=cz+n._vz*dt;
   if(!hit(nx,cz,.28))cx=nx;else n._vx=0;
   if(!hit(cx,nz,.28))cz=nz;else n._vz=0;
   /* hard stop: never let two followers overlap (a tiny nudge only if they actually touch) */
   CW.forEach(o=>{if(o===n||!o._cw)return;const ax=cx-o._cx,az=cz-o._cz,d=Math.hypot(ax,az),mn=.8;if(d<mn){const u=d>1e-3?1:0,ex=u?ax/d:Math.cos(n._sa),ez=u?az/d:Math.sin(n._sa),h=(mn-d)/2;
    if(!hit(cx+ex*h,cz,.28))cx+=ex*h;if(!hit(cx,cz+ez*h,.28))cz+=ez*h}});
   /* never closer than a comfortable distance */
   {const px=cx-P.x,pz=cz-P.z,pd=Math.hypot(px,pz);if(pd<2&&pd>1e-3){const k=(2-pd)*Math.min(1,dt*3)/pd;if(!hit(cx+px*k,cz,.28))cx+=px*k;if(!hit(cx,cz+pz*k,.28))cz+=pz*k}}
   n._cx=cx;n._cz=cz;
   const spd=Math.hypot(n._vx,n._vz);
   n._stk=(n._ms=='walk'&&spd<.25)?n._stk+dt:0;
   if(n._stk>2.5||t>n._bt){release(n,vert,t>n._bt?30:12,t);return}
   n.x=cx;n.z=cz;n.m.position.set(cx,0,cz);n.m.rotation.y=n._hd;
   /* stride follows the real ground speed (about 0.41 m per radian, like the normal walk), so feet never skate */
   n._ph=(n._ph||0)+spd/.41*dt;n._am=(n._am||0)+(clamp(spd/2.4,0,1)*.65-(n._am||0))*Math.min(1,dt*10);
   const s=Math.sin(n._ph)*n._am;
   n._ap+=((n._apT?1:0)-n._ap)*Math.min(1,dt*4);
   const sw=n._ms=='idle'?Math.sin(t*1.3+n._sa*3)*.04:0;
   n.legs[0].rotation.x=s+sw;n.legs[1].rotation.x=-s-sw;
   n.arms[0].rotation.x=-s*(1-n._ap)-1.25*n._ap;n.arms[1].rotation.x=s*(1-n._ap)-1.0*n._ap})}

 /* spring-based sidestep for everyone on the pavement */
 function ambient(n,vert,dt,ok){
  const lat=vert?'x':'z',lon=vert?'z':'x',lane=vert?n.x0:n.z0;
  if(!n.m.visible){n._lo=0;n._lv=0;n._sf=1;n._sd=0;return}
  let thr=false,tgt=0,ov=0,prox=0;
  const R0=mode=='drive'?2.0:1.15;
  if(ok&&!n._cw&&(n.st|0)!=1){
   const PL=P[lat],al=(P[lon]-n[lon])*n.dir;
   if(al>-1&&al<6&&Math.abs(PL-lane)<SIDE+R0){
    thr=true;
    const a=lane+n._lo,rel=PL-a;
    if(!n._sd)n._sd=Math.abs(rel)>.15?(rel>0?-1:1):(Math.random()<.5?-1:1);
    let tt=clamp(PL+n._sd*R0,lane-SIDE,lane+SIDE);
    /* if this side is cramped and there is still time, go the other way once */
    if(Math.abs(tt-PL)<.8&&al>2.5&&!n._fl){const t2=clamp(PL-n._sd*R0,lane-SIDE,lane+SIDE);if(Math.abs(t2-PL)>Math.abs(tt-PL)+.25){n._sd=-n._sd;n._fl=1;tt=t2}}
    tgt=tt-lane;
    const gap=Math.abs(lane+n._lo-PL);
    ov=clamp((R0+.2-gap)/(R0+.2),0,1);prox=clamp((6.5-Math.max(al,0))/5.5,0,1)}}
  if(!thr){n._sd=0;n._fl=0}
  const K=thr?10:3.2,Cd=2*Math.sqrt(K)*.95;
  n._lv+=((tgt-n._lo)*K-n._lv*Cd)*dt;
  const lm=Math.abs(n._lo)>1.2?1.7:1.25;n._lv=clamp(n._lv,-lm,lm);
  n._lo+=n._lv*dt;
  if(!thr&&Math.abs(n._lo)<.004&&Math.abs(n._lv)<.01){n._lo=0;n._lv=0}
  const sfT=1-.8*ov*prox;n._sf+=(sfT-n._sf)*Math.min(1,dt*(sfT<n._sf?5:1.8));
  n[lat]+=n._lo;
  n.m.position.x=n.x;n.m.position.z=n.z;
  if(n.pet&&!vert)n.pet.position.z+=n._lo;
  /* heading follows the real motion, eased, so turns are never a snap */
  const lg=n.dir*n._sp0*n._sf,vx=vert?n._lv:lg,vz=vert?lg:n._lv;
  /* base-game fans walking up to you (st==1) already face you: leave their rotation alone, or they keep their pavement heading */
  if(n.st==1)n._hd=n.m.rotation.y;
  else{if(Math.hypot(vx,vz)>.05)turn(n,Math.atan2(vx,vz),dt,9);
  n.m.rotation.y=n._hd}
  if(n.st!=1&&n._sf<.98)n.t-=dt*8*(1-n._sf);/* the live walk cycle runs at full rate; hold it back to match the slowed pace */
  if(n.st!=1&&n._sf<.98){const k=Math.max(.25,n._sf);n.legs[0].rotation.x*=k;n.legs[1].rotation.x*=k;n.arms[0].rotation.x*=k;n.arms[1].rotation.x*=k}}

 /* everyone who is close to you and acting as a follower (crowd members and the base-game fans walking up to you) has a body */
 function bodies(){const a=[];lists().forEach(([L])=>L.forEach(n=>{if(n.m.visible&&Math.abs(n.x-P.x)<30&&Math.abs(n.z-P.z)<30)a.push(n)}));return a}
 const BR=1.0;
 function separate(){
  const A=bodies();if(A.length<2)return;
  for(let it=0;it<3;it++)for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){
   const a=A[i],b=A[j];let dx=a.x-b.x,dz=a.z-b.z,d=Math.hypot(dx,dz);if(d>=BR)continue;
   if(d<1e-3){dx=Math.cos(i*2.4);dz=Math.sin(i*2.4);d=1}else{dx/=d;dz/=d}
   const h=(BR-(d<1e-3?0:d))/2;
   [[a,1],[b,-1]].forEach(([n,sg])=>{const nx=n.x+dx*h*sg,nz=n.z+dz*h*sg;
    if(!hit(nx,n.z,.28))n.x=nx;if(!hit(n.x,nz,.28))n.z=nz;
    if(n._cw){n._cx=n.x;n._cz=n.z}n.m.position.x=n.x;n.m.position.z=n.z})}}

 const wt=worldTick;
 worldTick=function(dt){
  dt=Math.min(dt,.1);
  try{lists().forEach(([L,v])=>L.forEach(n=>{prep(n);if(n._lo)n[v?'x':'z']-=n._lo}))}catch(e){console.error('crowd pre',e)}
  wt.apply(this,arguments);
  try{
   if(!extraDone&&typeof RH!='undefined'&&NPC.length>10&&VPED.length>0)addExtras();
   const t=now(),w=want(t);C.want=w;
   crowd(dt,t,w);C.n=CW.filter(n=>n._cw).length;
   const ok=(mode=='play'||mode=='drive')&&!IN&&!HIN;
   lists().forEach(([L,v])=>L.forEach(n=>{if(!n._fx)return;if(n._cw)return;ambient(n,v,dt,ok)}));
   separate();
  }catch(e){console.error('crowd',e)}
 };

 /* crowd members can be asked for an autograph like the normal fans */
 const di=dynInt;
 dynInt=function(){const a=di.apply(this,arguments);try{CW.forEach(n=>{if(n._cw&&!(n.fan&&n.st==1)&&Math.hypot(P.x-n.x,P.z-n.z)<1.9)a.push({x:n.x,z:n.z,r:2,l:'Sign autograph',a:()=>{n.fan=true;sign(n)}})})}catch(e){}return a};
})();
