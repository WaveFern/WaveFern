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
/* followers: walk around walls with their own pathfinding, catch up, teleport when lost, and animate bodyguards (v42.8.0) */
const FLW129={px:null,pz:null};
const fpBlk=(x,z)=>typeof hit=='function'&&!!hit(x,z,.22);
function fpClear(x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/.3);for(let i=1;i<=n;i++){const t=i/n;if(fpBlk(x0+(x1-x0)*t,z0+(z1-z0)*t))return 0}return 1}
/* A* on a 0.5 m grid around the follower and its spot; returns smoothed waypoints [[x,z],...] or null when there is no way through */
function fpPath(x0,z0,x1,z1){const C=.5,M=6,mx=Math.min(x0,x1)-M,mz=Math.min(z0,z1)-M,W=Math.min(100,Math.ceil((Math.abs(x1-x0)+2*M)/C)+1),H=Math.min(100,Math.ceil((Math.abs(z1-z0)+2*M)/C)+1),N=W*H;
 const cx=x=>Math.round((x-mx)/C),cz=z=>Math.round((z-mz)/C),sx=cx(x0),sz=cz(z0),gx=cx(x1),gz=cz(z1);if(sx<0||sz<0||gx<0||gz<0||sx>=W||sz>=H||gx>=W||gz>=H)return null;
 const st=new Int8Array(N),gs=new Float32Array(N).fill(1e9),fr=new Int32Array(N).fill(-1),cl=new Uint8Array(N),hp=[],S0=sz*W+sx,G=gz*W+gx;
 const bl=k=>{if(!st[k])st[k]=fpBlk(mx+(k%W)*C,mz+((k/W)|0)*C)?2:1;return st[k]==2},hu=k=>{const dx=Math.abs(k%W-gx),dz=Math.abs(((k/W)|0)-gz);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
 const push=(k,f)=>{hp.push([f,k]);let i=hp.length-1;while(i){const p=(i-1)>>1;if(hp[p][0]<=hp[i][0])break;[hp[p],hp[i]]=[hp[i],hp[p]];i=p}};
 const pop=()=>{const t=hp[0],l=hp.pop();if(hp.length){hp[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<hp.length&&hp[a][0]<hp[m][0])m=a;if(b<hp.length&&hp[b][0]<hp[m][0])m=b;if(m==i)break;[hp[m],hp[i]]=[hp[i],hp[m]];i=m}}return t};
 if(bl(G))return null;gs[S0]=0;push(S0,hu(S0));let n=0,ok=0;
 while(hp.length&&n++<2500){const k=pop()[1];if(cl[k])continue;cl[k]=1;if(k==G){ok=1;break}const x=k%W,z=(k/W)|0;
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=W||nz>=H)continue;const q=nz*W+nx;if(cl[q]||bl(q))continue;
   if(dx&&dz&&(bl(z*W+nx)||bl(nz*W+x)))continue;/* no cutting corners */const g2=gs[k]+(dx&&dz?1.414:1);if(g2<gs[q]){gs[q]=g2;fr[q]=k;push(q,g2+hu(q))}}}
 if(!ok)return null;const pts=[];for(let k=G;k!=-1&&k!=S0;k=fr[k])pts.push([mx+(k%W)*C,mz+((k/W)|0)*C]);pts.reverse();pts[pts.length-1]=[x1,z1];
 /* string-pull: keep only the corners you can't see past */
 const out=[];let ax=x0,az=z0,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!fpClear(ax,az,pts[j][0],pts[j][1]))j--;out.push(pts[j]);ax=pts[j][0];az=pts[j][1];i=j+1}return out}
function flwSpot(f){const tx=P.x+f.ox,tz=P.z+f.oz;if(!fpBlk(tx,tz)&&fpClear(P.x,P.z,tx,tz))return[tx,tz];
 for(const o of[[f.ox*.5,f.oz*.5],[0,.8],[.8,0],[-.8,0],[0,-.8],[.6,.6],[-.6,.6]])if(!fpBlk(P.x+o[0],P.z+o[1]))return[P.x+o[0],P.z+o[1]];return[P.x,P.z]}
const fpStage=()=>typeof FEST!='undefined'&&FEST&&!!FEST.set;
{const w0=worldTick;worldTick=function(dt){if(typeof FOL!='undefined')FOL.forEach(f=>{f.bx=f.x;f.bz=f.z});w0(dt);try{
 if(typeof FOL=='undefined'||!FOL.length||dt<=0){FLW129.px=P.x;FLW129.pz=P.z;return}
 const jump=FLW129.px!=null&&Math.hypot(P.x-FLW129.px,P.z-FLW129.pz)>4;FLW129.px=P.x;FLW129.pz=P.z;const stage=fpStage();
 FOL.forEach((f,i)=>{if(f.home||!f.m)return;const g=f.m,L=g.userData.lim,ret=L&&S.gs=='returning';
  if(stage){g.visible=false;return}/* nobody joins you on stage at a festival */
  const qx=f.x,qz=f.z;/* where the old straight-line step put it; undo that and walk properly */
  if(f.bx!=null){f.x=f.bx;f.z=f.bz}const ox=f.x,oz=f.z;
  const sp0=flwSpot(f),tx=sp0[0],tz=sp0[1],d=Math.hypot(tx-f.x,tz-f.z);
  if(!ret&&(jump||d>14||(f.stk||0)>1.5||(f.np||0)>1||mode=='drive')){f.x=tx;f.z=tz;f.stk=0;f.np=0;f.path=null;f.tp=1}
  else if(d>.05){f.lt=(f.lt||0)-dt;if(f.lt<=0){f.lt=.2;f.los=fpClear(f.x,f.z,tx,tz)}
   let wx=tx,wz=tz;
   if(!f.los){f.pt=(f.pt||0)-dt;const pe=f.path&&f.path[f.path.length-1];
    if(!f.path||f.pt<=0||!pe||Math.hypot(pe[0]-tx,pe[1]-tz)>1.5){f.pt=.6+i*.05;f.path=fpPath(f.x,f.z,tx,tz);f.np=f.path?0:(f.np||0)+.6}
    while(f.path&&f.path.length>1&&Math.hypot(f.path[0][0]-f.x,f.path[0][1]-f.z)<.25)f.path.shift();
    if(f.path&&f.path.length){wx=f.path[0][0];wz=f.path[0][1]}}else{f.path=null;f.np=0}
   const wd=Math.hypot(wx-f.x,wz-f.z);if(wd>1e-3){const sp=Math.min((f.los?d:Math.max(d,1.5))*3,8)*dt,st=Math.min(sp,wd),dx=(wx-f.x)/wd*st,dz=(wz-f.z)/wd*st;
    if(fpBlk(f.x,f.z)){f.x+=dx;f.z+=dz}/* already inside something: walk out */else{if(!fpBlk(f.x+dx,f.z))f.x+=dx;if(!fpBlk(f.x,f.z+dz))f.z+=dz}}}
  const mvd=Math.hypot(f.x-ox,f.z-oz);f.stk=d>3&&mvd<.5*dt?(f.stk||0)+dt:Math.max(0,(f.stk||0)-dt);
  if(mvd>1e-4&&!f.tp)g.rotation.y=Math.atan2(f.x-ox,f.z-oz);
  g.position.x+=f.x-qx;g.position.z+=f.z-qz;
  if(!L)return;/* bodyguards: walk / run like the player */
  const inst=f.tp?0:Math.hypot(f.x-(f.lx??f.x),f.z-(f.lz??f.z))/dt;f.tp=0;f.lx=f.x;f.lz=f.z;
  f.v=(f.v||0)+(Math.min(inst,9)-(f.v||0))*Math.min(1,dt*8);const m=Math.max(0,Math.min(1,(f.v-.2)/1)),k=sprK(f.v)*m;
  f.ph=(f.ph||Math.random()*6)+dt*(2+m*(f.v/3.3)*10);limSwing(L,f.ph,m,k);
  g.rotation.order='YXZ';g.rotation.x=.2*k;g.position.y=Math.abs(Math.sin(f.ph))*(.06+.07*k)*m;
  if(m<.1){/* idle: face the way you face */const dr=((P.rot||0)-g.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI;g.rotation.y+=dr*Math.min(1,dt*3)}})}catch(e){}}}
