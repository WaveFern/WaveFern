/* ===== v26.107.0: the furniture that comes with the house can be moved and stored too =====
   The bed, bedside table, desk + laptop and bedroom rug used to be built into the house. They are now ordinary placed
   furniture (same hover outline, E to store, click to move). They are not sold on Amazoom: the F entries are
   non-enumerable, so the shop lists and "give every item" loops skip them.
   S.sp marks a save that already manages them. A save without it (an older one) gets the four pieces at their old spots
   once; after that a stored piece lives in S.inv and a placed one in PL like everything else, so storing sticks.
   Sleeping and the laptop follow the bed and desk; with the bed stored there is nowhere to sleep (the day still
   ends at midnight), with the desk stored there is no laptop until it is placed again. */
const STRD={srug:[4.5,4,0],bed:[1.4,1.85,0],nstand:[3,.6,0],desk:[6,.7,0]};
[['bed','Bed',2.2,3.1,[[2,.4,3.1,'#6b4a2e',0,.2,0],[1.8,.25,2.8,'#e8e4da',0,.52,0],[1.8,.28,1.7,'#3b6fb5',0,.58,.55],[1.2,.15,.5,'#fff',0,.75,-1.1]]],
 ['nstand','Bedside table',.6,.6,[[.6,.6,.6,'#6b4a2e',0,.3,0],[.2,.3,.2,'*ffd27a',0,.75,0]]],
 ['desk','Desk + laptop',2.8,1,[[2.8,.1,1,'#8a5a36',0,.85,0],[.1,.85,.9,'#6b4a2e',-1.3,.42,0],[.1,.85,.9,'#6b4a2e',1.3,.42,0],[.9,.6,.08,'#111',0,1.3,-.25],[.8,.5,.02,'*2fe68a',0,1.3,-.2],[.6,.04,.25,'#ccc',0,.92,.25],[.3,.7,.5,'#222',1,1.2,-.1],[.5,.1,.5,'#333',0,.5,1],[.5,.4,.08,'#333',0,.8,1.25]]],
 ['srug','Bedroom rug',2.6,1.8,[[2.6,.03,1.8,'#7c3f58',0,.02,0]],1]
].forEach(([k,n,w,d,b,f])=>Object.defineProperty(F,k,{value:{n,p:0,w,d,b,f},enumerable:false,writable:true,configurable:true}));
function spRot(ox,oz,r){const a=r*Math.PI/2,c=Math.round(Math.cos(a)),s=Math.round(Math.sin(a));return[ox*c+oz*s,-ox*s+oz*c]}
function spFollow(o,k,ox,oz){Object.defineProperty(o,'x',{get(){const q=PL.find(q=>q.t==k);return q?q.x+spRot(ox,oz,q.r)[0]:-9999},set(){},configurable:true});Object.defineProperty(o,'z',{get(){const q=PL.find(q=>q.t==k);return q?q.z+spRot(ox,oz,q.r)[1]:-9999},set(){},configurable:true})}
spFollow(INT[0],'bed',1.5,.55);spFollow(INT[1],'desk',0,1.2);
function ensureStarters(){if(S.sp||typeof PL=='undefined'||!scene)return;S.sp=1;if(!S.inv)S.inv={};Object.keys(STRD).forEach(k=>{if(PL.some(q=>q.t==k)||S.inv[k]>0)return;const[x,z,r]=STRD[k],m=mkF(k);m.position.set(x,0,z);m.rotation.y=r*Math.PI/2;scene.add(m);PL.push({t:k,x,z,r,m})})}
{const b0=buildTick;buildTick=function(){if(!S.sp)ensureStarters();return b0.apply(this,arguments)}}
