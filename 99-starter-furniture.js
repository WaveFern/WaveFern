/* ===== v26.107.0: the furniture that comes with the house can be moved and stored too =====
   The bed, bedside table, desk + laptop and bedroom rug used to be built into the house. They are now ordinary placed
   furniture (same hover outline, E to store, click to move). They are not sold on Amazoom: the F entries are
   non-enumerable, so the shop lists and "give every item" loops skip them.
   S.sp marks a save that already manages them. A save without it (an older one) gets the four pieces at their old spots
   once; after that a stored piece lives in S.inv and a placed one in PL like everything else, so storing sticks.
   Sleeping and the laptop follow the bed and desk; with the bed stored there is nowhere to sleep (the day still
   ends at midnight), with the desk stored there is no laptop until it is placed again. */
const STRD={srug:[4.5,4,0],bed:[1.4,1.85,0],nstand:[3,.6,0],desk:[6,.7,0]};
/* v55.8.0: detailed models. Same footprints (w x d) as before, built from many small boxes in the game's blocky style. */
const BEDB=(()=>{const W='#6b4a2e',D='#4d3320',L='#7d5a38',bl='#3b6fb5',bd='#2d5894',a=[];
 [[-1,-1.45],[1,-1.45],[-1,1.45],[1,1.45]].forEach(p=>a.push([.14,.22,.14,D,p[0],.11,p[1]]));
 a.push([2.1,.3,3,W,0,.37,0],[2.14,.05,3.04,D,0,.54,0],
  [2.2,1.05,.12,W,0,.82,-1.5],[1.9,.55,.04,L,0,.88,-1.43],[2.3,.1,.2,D,0,1.38,-1.5],[.12,.2,.2,D,-1.1,1.25,-1.5],[.12,.2,.2,D,1.1,1.25,-1.5],
  [2.2,.5,.1,W,0,.62,1.5],[2.3,.08,.16,D,0,.9,1.5],
  [1.95,.22,2.8,'#f1ede4',0,.67,-.02],
  [1.9,.1,1.85,bl,0,.78,.45],[.07,.26,1.85,bd,-.96,.66,.45],[.07,.26,1.85,bd,.96,.66,.45],[1.9,.26,.07,bd,0,.66,1.4],
  [1.9,.12,.3,bd,0,.84,-.47],[1.9,.02,.07,'#e8d27a',0,.84,.35],[1.9,.02,.07,'#e8d27a',0,.84,.75],[1.9,.02,.07,'#e8d27a',0,.84,1.15],
  [.8,.16,.5,'#fff',-.5,.84,-1.15],[.8,.16,.5,'#fff',.5,.84,-1.15],[.62,.04,.34,'#e3ebf7',-.5,.93,-1.15],[.62,.04,.34,'#e3ebf7',.5,.93,-1.15],
  [.42,.14,.2,'#e6b422',0,.84,-.82],[.3,.12,.2,'#c8506a',.7,.82,-.8],
  [.34,.16,.3,'#a07850',-.7,.9,-.6],[.12,.12,.12,'#a07850',-.7,1.06,-.6],[.04,.04,.04,'#111',-.72,1.08,-.54],[.04,.04,.04,'#111',-.68,1.08,-.54]);
 return a})();
const NSB=(()=>{const W='#6b4a2e',a=[];
 [[-.24,-.24],[.24,-.24],[-.24,.24],[.24,.24]].forEach(p=>a.push([.06,.14,.06,'#4d3320',p[0],.07,p[1]]));
 a.push([.58,.5,.54,W,0,.39,0],[.66,.05,.62,'#4d3320',0,.66,0],
  [.5,.19,.03,'#7d5a38',0,.5,.28],[.5,.19,.03,'#7d5a38',0,.27,.28],[.1,.04,.04,'#e6b422',0,.5,.31],[.1,.04,.04,'#e6b422',0,.27,.31],
  [.16,.03,.16,'#333',-.17,.71,-.08],[.04,.24,.04,'#333',-.17,.84,-.08],[.26,.2,.26,'*ffd27a',-.17,1.06,-.08],[.3,.04,.3,'#e6b422',-.17,1.18,-.08],
  [.16,.08,.07,'#222',.17,.73,.12],[.09,.04,.02,'*ff4040',.17,.74,.155],
  [.2,.04,.15,'#c8506a',.17,.71,-.14],[.18,.04,.13,'#4aa3df',.17,.75,-.14],[.07,.1,.07,'#bfe3f2',.02,.76,.2]);
 return a})();
const DESKB=(()=>{const W='#6b4a2e',T='#8a5a36',a=[];
 [[-1.32,-.42],[-1.32,.42],[1.38,-.42],[1.38,.42]].forEach(p=>a.push([.08,.82,.08,W,p[0],.41,p[1]]));
 a.push([2.8,.08,1,T,0,.86,0],[2.84,.03,1.04,'#5a3d25',0,.8,0],[2.6,.04,.04,W,0,.72,.44],[.05,.5,.9,W,-1.3,.5,0],
  [.8,.64,.88,W,.95,.45,0],[.7,.26,.02,'#7d5a38',.95,.62,.45],[.7,.26,.02,'#7d5a38',.95,.3,.45],[.14,.04,.04,'#e6b422',.95,.62,.48],[.14,.04,.04,'#e6b422',.95,.3,.48],
  [.32,.03,.22,'#222',-.1,.91,-.25],[.06,.22,.06,'#222',-.1,1.02,-.28],[1.05,.64,.06,'#111',-.1,1.45,-.3],
  [.97,.56,.02,'*2fe68a',-.1,1.45,-.27],[.5,.04,.01,'*1a8a56',-.25,1.58,-.255],[.7,.03,.01,'*1a8a56',-.1,1.5,-.255],[.6,.03,.01,'*1a8a56',-.15,1.42,-.255],[.4,.03,.01,'*1a8a56',-.2,1.34,-.255],
  [.7,.03,.24,'#cfd4da',-.1,.92,.15],[.62,.01,.16,'#8a919a',-.1,.945,.15],[.1,.03,.16,'#222',.42,.92,.15],
  [.12,.03,.12,'#333',-1.15,.92,-.25],[.03,.4,.03,'#333',-1.15,1.12,-.25],[.28,.06,.14,'*ffd27a',-1.15,1.34,-.2],
  [.1,.1,.1,'#e8e4da',-.6,.95,-.3],[.04,.04,.04,'#7a4a2a',-.6,1.01,-.3],[.3,.03,.22,'#c8506a',-.85,.9,.2],[.04,.18,.04,'#4aa3df',-.5,.99,-.34],[.04,.14,.04,'#e6b422',-.45,.97,-.34],
  [.24,.44,.24,'#222',1.2,1.1,-.25],[.14,.14,.02,'#666',1.2,1.18,-.12],[.08,.08,.02,'#666',1.2,.98,-.12]);
 a.push([.56,.1,.56,'#2f3a4a',0,.5,1.05],[.56,.52,.08,'#2f3a4a',0,.86,1.34],[.08,.34,.08,'#222',0,.28,1.05],[.5,.04,.08,'#222',0,.1,1.05],[.08,.04,.5,'#222',0,.1,1.05],
  [.06,.06,.06,'#111',-.24,.05,1.05],[.06,.06,.06,'#111',.24,.05,1.05],[.06,.06,.06,'#111',0,.05,.82],[.06,.06,.06,'#111',0,.05,1.28],
  [.06,.22,.34,'#222',-.32,.64,1.12],[.06,.22,.34,'#222',.32,.64,1.12]);
 return a})();
const RUGB=[[2.6,.03,1.8,'#7c3f58',0,.015,0],[2.3,.015,1.5,'#a3567a',0,.0375,0],[2.1,.015,1.3,'#7c3f58',0,.0525,0],
 [.9,.015,.9,'#e6b422',0,.0675,0],[.5,.015,.5,'#a3567a',0,.0825,0],
 [2.6,.025,.1,'#e8dcc0',0,.012,.95],[2.6,.025,.1,'#e8dcc0',0,.012,-.95],
 [1.7,.015,.06,'#e6b422',0,.0675,.55],[1.7,.015,.06,'#e6b422',0,.0675,-.55]];
[['bed','Bed',2.2,3.1,BEDB],
 ['nstand','Bedside table',.6,.6,NSB],
 ['desk','Desk + laptop',2.8,1,DESKB],
 ['srug','Bedroom rug',2.6,1.8,RUGB,1]
].forEach(([k,n,w,d,b,f])=>Object.defineProperty(F,k,{value:{n,p:0,w,d,b,f},enumerable:false,writable:true,configurable:true}));
function spRot(ox,oz,r){const a=r*Math.PI/2,c=Math.round(Math.cos(a)),s=Math.round(Math.sin(a));return[ox*c+oz*s,-ox*s+oz*c]}
function spFollow(o,k,ox,oz){Object.defineProperty(o,'x',{get(){const q=PL.find(q=>q.t==k);return q?q.x+spRot(ox,oz,q.r)[0]:-9999},set(){},configurable:true});Object.defineProperty(o,'z',{get(){const q=PL.find(q=>q.t==k);return q?q.z+spRot(ox,oz,q.r)[1]:-9999},set(){},configurable:true})}
spFollow(INT[0],'bed',1.5,.55);spFollow(INT[1],'desk',0,1.2);
function ensureStarters(){if(S.sp||typeof PL=='undefined'||!scene)return;S.sp=1;if(!S.inv)S.inv={};Object.keys(STRD).forEach(k=>{if(PL.some(q=>q.t==k)||S.inv[k]>0)return;const[x,z,r]=STRD[k],m=mkF(k);m.position.set(x,0,z);m.rotation.y=r*Math.PI/2;scene.add(m);PL.push({t:k,x,z,r,m})})}
{const b0=buildTick;buildTick=function(){if(!S.sp)ensureStarters();return b0.apply(this,arguments)}}
