/* ===== v26.11: much wider roads and pavements =====
   The world is still built in its original "layout" coordinates (roads 5 wide, pavements 1.2 wide).
   Right before the city geometry is flushed, one pass spreads the whole outdoor world apart around every road:
   each road band (asphalt + both pavements, ROAD_HALF+PAVE wide either side of the centre line) is stretched by ROAD_K,
   everything beyond a band slides outward by the extra width. The home block around the origin does not move.
   Because every box, collider, interaction point, shop door, NPC lane, map rect and road is mapped through the same
   warp, nothing that sat beside a road can end up on it. Interiors (z > INTERIOR_Z) are never touched. */
const ROAD_HALF=2.5,PAVE=1.2,ROAD_K=2,BAND=ROAD_HALF+PAVE,INTERIOR_Z=260;
const ROAD_W=ROAD_HALF*2*ROAD_K,PAVE_W=PAVE*ROAD_K,LANE_OFF=ROAD_W/4,PAVE_MID=(ROAD_HALF+PAVE/2)*ROAD_K;
/* centre lines of every horizontal (z) and vertical (x) road, the central layout constants of the street grid */
const ROAD_Z=[16.2,34.5,60,72,100,-40],ROAD_X=[-64,200,400,490,530,570,610];
function warp1(v,L){let o=0;const S2=2*BAND,ex=S2*(ROAD_K-1);for(const c of L){if(c>0)o+=Math.min(1,Math.max(0,(v-(c-BAND))/S2))*ex;else o-=Math.min(1,Math.max(0,((c+BAND)-v)/S2))*ex}return v+o}
const WX=x=>warp1(x,ROAD_X),WZ=z=>warp1(z,ROAD_Z),outdoor=z=>z<INTERIOR_Z;
/* world bounds used by hit() (07-input-loop.js) */
const WB=[WX(-130),WX(690),WZ(-150),WZ(130)];
let WARPED=false;

/* roads/pavements/junctions in layout coordinates (the warp widens them) */
function roadH(zr,x0,x1){const L=x1-x0,cx=(x0+x1)/2,pz=ROAD_HALF+PAVE/2;SB(L,.04,ROAD_HALF*2,'#3a3d44',cx,-.03,zr);SB(L,.06,PAVE,'#b9b5ab',cx,-.02,zr-pz);SB(L,.06,PAVE,'#b9b5ab',cx,-.02,zr+pz);for(let x=x0;x<x1;x+=5)SB(2,.02,.16,'#e8d9a0',x,0,zr);ROADS.push([x0,zr-ROAD_HALF,x1,zr+ROAD_HALF]);RH.push([zr,x0,x1])}
function roadV(xr,z0,z1){const L=z1-z0,cz=(z0+z1)/2,px=ROAD_HALF+PAVE/2;SB(ROAD_HALF*2,.04,L,'#3a3d44',xr,-.03,cz);SB(PAVE,.06,L,'#b9b5ab',xr-px,-.02,cz);SB(PAVE,.06,L,'#b9b5ab',xr+px,-.02,cz);for(let z=z0;z<z1;z+=5)SB(.16,.02,2,'#e8d9a0',xr,0,z);ROADS.push([xr-ROAD_HALF,z0,xr+ROAD_HALF,z1]);RVV.push([xr,z0,z1])}
function finishRoads(){for(let x=-120;x<485;x+=24)if(x<-10||x>70)lamp(x,13.1);const C='#3a3d44',D=ROAD_HALF*2,q=PAVE+.2,o=ROAD_HALF+q/2;
 RH.forEach(h=>RVV.forEach(v=>{if(!onX(h,v))return;const X=v[0],Z=h[0];SB(D,.04,D,C,X,.015,Z);if(v[1]<Z-.1)SB(D,.04,q,C,X,.015,Z-o);if(v[2]>Z+.1)SB(D,.04,q,C,X,.015,Z+o);if(h[1]<X-.1)SB(q,.04,D,C,X-o,.015,Z);if(h[2]>X+.1)SB(q,.04,D,C,X+o,.015,Z)}))}
/* a streetlight is one rigid object: place it at its warped spot and mark its boxes so the warp pass leaves them alone */
function lamp(x,z){const X=WARPED?x:WX(x),Z=WARPED?z:WZ(z),P5=[[.45,.3,.45,'#2a2d33',X,.15,Z],[.14,2.8,.14,'#3a3f47',X,1.6,Z],[.9,.12,.12,'#3a3f47',X,3,Z+.4],[.7,.12,.5,'#2a2d33',X,3.1,Z+.7],[.55,.12,.38,'#ffe9a8',X,3,Z+.7]];
 P5.forEach(a=>{SB(...a);const k=(a[4]/120|0)+','+(a[6]/120|0),L=SBC[k];L[L.length-1].nw=1})}
/* city towers: keep the original lot ids for entrances (twHook) */
function tower(x0,z0,x1,z1){const w=x1-x0-R(0,5),d=z1-z0-R(0,5),cx=(x0+x1)/2,cz=(z0+z1)/2,h=R(8,36),t=winTex().clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(w/3)),Math.max(1,Math.round(h/3)));const mat=new THREE.MeshLambertMaterial({color:pick(['#8fa6b8','#a9b7c4','#7b8da0','#b8a99a','#9db4a0','#c4a08a']),map:t,transparent:true}),m=new THREE.Mesh(geo(w,h,d),mat);m.position.set(cx,h/2,cz);WORLD.add(m);SB(2,1.8,.1,'#2a1f1a',cx,.9,cz+d/2+.05);col(cx-w/2,cz-d/2,cx+w/2,cz+d/2);BLD.push([cx-w/2,cz-d/2,cx+w/2,cz+d/2]);CT.push({mat,x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2,h});if(typeof twHook=='function')twHook(x0,z0,cx,cz+d/2,w,h)}

/* ---- the warp pass ---- */
const wBox=b=>{if(!outdoor((b[1]+b[3])/2))return b;return[WX(b[0]),WZ(b[1]),WX(b[2]),WZ(b[3])]};
const sameB=(a,b)=>Math.abs(a[0]-b[0])<.02&&Math.abs(a[1]-b[1])<.02&&Math.abs(a[2]-b[2])<.02&&Math.abs(a[3]-b[3])<.02;
/* buildings that poke into a road's pavement (layout coords) get trimmed back to the pavement edge first */
function trimBox(b){const R0=ROADS.map(r=>[r[0]-PAVE-.3,r[1]-PAVE-.3,r[2]+PAVE+.3,r[3]+PAVE+.3]);let n=b.slice();
 for(let it=0;it<4;it++){const r=R0.find(r=>n[0]<r[2]&&n[2]>r[0]&&n[1]<r[3]&&n[3]>r[1]);if(!r)break;
  const cut=[[r[2]-n[0],0,r[2]],[n[2]-r[0],2,r[0]],[r[3]-n[1],1,r[3]],[n[3]-r[1],3,r[1]]].sort((a,b)=>a[0]-b[0])[0];n[cut[1]]=cut[2];if(n[2]-n[0]<1||n[3]-n[1]<1)return b}
 return n}
function warpWorld(){if(WARPED)return;WARPED=true;const T=new THREE.Box3(),skip=new Set([P.mesh]);NPC.forEach(n=>{skip.add(n.m);if(n.pet)skip.add(n.pet)});
 scene.updateMatrixWorld(true);const trims=[];
 const doObj=o=>{if(skip.has(o)||o.isLight||o.isCamera)return;const p=o.position;
  if(!o.isMesh&&!o.isSprite){if(p.x==0&&p.z==0){o.children.slice().forEach(doObj);return}if(outdoor(p.z)){p.x=WX(p.x);p.z=WZ(p.z)}return}
  if(o.isSprite||o.rotation.x||o.rotation.z||Math.abs(Math.sin(o.rotation.y))>1e-6){if(outdoor(p.z)){p.x=WX(p.x);p.z=WZ(p.z)}return}
  T.setFromObject(o);if(T.isEmpty())return;const b0=[T.min.x,T.min.z,T.max.x,T.max.z],ex=b0[2]-b0[0],ez=b0[3]-b0[1];if(ex>1500||!outdoor((b0[1]+b0[3])/2))return;
  let b=b0;if(ex>=3&&ez>=3&&T.max.y-T.min.y>=2.5){b=trimBox(b0);if(b!==b0)trims.push([b0,b])}
  const w=wBox(b);[[0,2,'x'],[1,3,'z']].forEach(([i,j,a])=>{const s=b0[j]-b0[i];if(s>=1){o.scale[a]*=(w[j]-w[i])/s;p[a]+=(w[i]+w[j])/2-(b0[i]+b0[j])/2}else{const c=(b0[i]+b0[j])/2;p[a]+=(a=='x'?WX(c):WZ(c))-c}})};
 WORLD.children.slice().forEach(doObj);scene.children.slice().forEach(o=>{if(o!==WORLD)doObj(o)});
 const fix=b=>{const t=trims.find(q=>sameB(q[0],b));return wBox(t?t[1]:b)};
 cols.forEach((c,i)=>cols[i]=fix(c));BLD.forEach((c,i)=>BLD[i]=fix(c));
 CT.forEach(c=>{const n=fix([c.x0,c.z0,c.x1,c.z1]);c.x0=n[0];c.z0=n[1];c.x1=n[2];c.z1=n[3]});
 ROADS.forEach((r,i)=>ROADS[i]=wBox(r));
 {const w=wBox(LK);LK.splice(0,4,...w)}
 RH.forEach(h=>{h[0]=WZ(h[0]);h[1]=WX(h[1]);h[2]=WX(h[2])});RVV.forEach(v=>{v[0]=WX(v[0]);v[1]=WZ(v[1]);v[2]=WZ(v[2])});
 HP.forEach(h=>{if(outdoor(h[1])){h[0]=WX(h[0]);h[1]=WZ(h[1])}});POIS.forEach(p=>{if(outdoor(p[1])){p[0]=WX(p[0]);p[1]=WZ(p[1])}});
 INT.forEach(q=>{if(outdoor(q.z)){q.x=WX(q.x);q.z=WZ(q.z)}});
 SHOPS.forEach(s=>{if(s.cx===undefined)return;const ez=s.ez||12.9;s.cx=WX(s.cx);s.ez=WZ(ez)});
 NPC.forEach(n=>{if(!outdoor(n.z0))return;n.mn=WX(n.mn??-12);n.mx=WX(n.mx??70);n.x=WX(n.x);n.z0=WZ(n.z0);n.z=n.z0});
 for(const k in SBC)SBC[k].forEach(e=>{if(e.nw||!outdoor(e[6]))return;[[0,4,WX],[2,6,WZ]].forEach(([s,p,f])=>{if(e[s]<1)e[p]=f(e[p]);else{const a=f(e[p]-e[s]/2),b=f(e[p]+e[s]/2);e[p]=(a+b)/2;e[s]=b-a}})})}
{const f0=flushSB;flushSB=function(){warpWorld();f0()}}

/* traffic graph on the warped centre lines; cars keep to the middle of their (now wide) lane */
function trafGraph(){const N=new Map(),node=(x,z)=>{const k=x.toFixed(1)+','+z.toFixed(1);if(!N.has(k))N.set(k,{x,z,e:[]});return N.get(k)},link=(a,b)=>{if(a===b)return;const L=Math.hypot(b.x-a.x,b.z-a.z);a.e.push({to:b,ux:(b.x-a.x)/L,uz:(b.z-a.z)/L,len:L});b.e.push({to:a,ux:(a.x-b.x)/L,uz:(a.z-b.z)/L,len:L})};
 RH.forEach(h=>{const P0=RVV.filter(v=>onX(h,v)).map(v=>v[0]).concat([h[1],h[2]]),u=[...new Set(P0.map(x=>+x.toFixed(1)))].sort((a,b)=>a-b);for(let i=0;i<u.length-1;i++)link(node(u[i],h[0]),node(u[i+1],h[0]))});
 RVV.forEach(v=>{const P0=RH.filter(h=>onX(h,v)).map(h=>h[0]).concat([v[1],v[2]]),u=[...new Set(P0.map(z=>+z.toFixed(1)))].sort((a,b)=>a-b);for(let i=0;i<u.length-1;i++)link(node(v[0],u[i]),node(v[0],u[i+1]))});
 TG2.N=[...N.values()];TG2.E=[];TG2.N.forEach(n=>n.e.forEach(e=>TG2.E.push([n,e])))}
function carPos(c){c.x=c.a.x+c.e.ux*c.t+c.e.uz*LANE_OFF;c.z=c.a.z+c.e.uz*c.t-c.e.ux*LANE_OFF}
/* pedestrians walk down the middle of both (wider) pavements */
function morePeople(){const cfg=()=>({skin:RI(0,5),eyes:RI(0,4),mouth:RI(0,3),hair:RI(0,11),hc:RI(0,11),top:RI(0,4),tc:RI(0,9),pc:RI(0,7),body:Math.random()});
 RH.forEach(h=>[h[0]-PAVE_MID,h[0]+PAVE_MID].forEach(z=>{const n=Math.round((h[2]-h[1])/26);for(let i=0;i<n;i++)addNPC(z,R(h[1]+2,h[2]-2),h[1]+1,h[2]-1,R(.8,1.7),Math.random()<.1)}));
 RVV.forEach(v=>[v[0]-PAVE_MID,v[0]+PAVE_MID].forEach(x=>{const n=Math.round((v[2]-v[1])/26);for(let i=0;i<n;i++){const o=buildChar(cfg());o.g.visible=false;scene.add(o.g);VPED.push({m:o.g,legs:o.legs,arms:o.arms,x,x0:x,z:R(v[1]+2,v[2]-2),mn:v[1]+1,mx:v[2]-1,dir:Math.random()<.5?1:-1,sp:R(.8,1.7),t:R(0,6)})}}))}

/* things placed after the world is built use layout coords too */
{const s0=syncArt;syncArt=function(){s0();ART_M.forEach(o=>{if(o.wp)return;o.wp=1;o.x=WX(o.x);o.z=WZ(o.z);o.m.position.set(o.x,0,o.z)})}}
{const b0=buildLots;buildLots=function(){b0();LOTS.forEach(m=>{m.position.x=WX(m.position.x);m.position.z=WZ(m.position.z)})}}
{const t0=taxi;taxi=function(x,z){t0(WX(x),WZ(z))}}
/* if the player ever stands inside something (old saves, changed layout), step to the nearest free spot, else go home */
function unstick(){const inH=P.x>.2&&P.x<15.8&&P.z>-.3-(typeof WGX!="undefined"?WGX:0)&&P.z<12.1;if(IN||inH||mode=='drive'||!hit(P.x,P.z,.28))return;for(let r=.5;r<30;r+=.5)for(let a=0;a<16;a++){const x=P.x+Math.cos(a*Math.PI/8)*r,z=P.z+Math.sin(a*Math.PI/8)*r;if(!hit(x,z,.28)){P.x=x;P.z=z;camT.x=x;camT.z=z;return}}P.x=6;P.z=13.1;camT.x=6;camT.z=13.1}
{const l0=loadCode;loadCode=function(c){l0(c);try{unstick()}catch(e){}}}
