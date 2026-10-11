/* ===== v26.27.2: city glitch fixes =====
   Runs once, after the road warp (31-wide-roads.js), the street detail (38-city-detail.js) and the parked cars
   (39-car-models.js), right before the static boxes are merged. Found by flying a camera through the whole outdoor map:
   - junction asphalt: the raised junction slabs showed their thin side faces as dotted light lines across every
     junction; they are now drawn as flat tops only
   - city towers whose front was trimmed back by the warp left their front door standing out on the pavement (or the
     kerb); the door now sits on the tower front again and fades with the tower
   - two parked city cars were stretched across a pedestrian crossing by the warp; they are gone
   - street lamps and trees that the warp had left standing on asphalt are removed
   - tree pits on city pavements flickered with the paving joints drawn over them; they now sit just above them
   - the City Plaza fountain was a stretched water square hanging off a base that never moved, touching the kerb: it is
     rebuilt as a round fountain in the middle of the square, with a collider
   - the grass ended at the farm fields, the school and the sports field, which floated over the sky colour: the ground
     now carries on under them
   Also: a small helper (xg*) that merges rotated boxes, prisms and flat polygons into one mesh per 60 m cell, used by
   this file, the fountains (41-fountains.js) and the park (42-central-park.js). */

/* ---- merged static geometry ---- */
const XV=[.62,.47,.62];/* unit vector towards the camera: faces turned away from it are never seen, so they are dropped */
const XC=new THREE.Color();
function xgNew(){return{c:{}}}
function xgCell(G,x,z){const k=Math.floor(x/60)+','+Math.floor(z/60);return G.c[k]||(G.c[k]={P:[],N:[],C:[],I:[]})}
function xgPush(B,pts,col,nx,ny,nz){XC.set(col);const k=B.P.length/3;pts.forEach(q=>{B.P.push(q[0],q[1],q[2]);B.N.push(nx,ny,nz);B.C.push(XC.r,XC.g,XC.b)});return k}
function xgNrm(a,b,d){let nx=(b[1]-a[1])*(d[2]-a[2])-(b[2]-a[2])*(d[1]-a[1]),ny=(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2]),nz=(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]);const l=Math.hypot(nx,ny,nz);return l<1e-9?null:[nx/l,ny/l,nz/l]}
const xgSeen=n=>n[0]*XV[0]+n[1]*XV[1]+n[2]*XV[2]>-.02;
/* quad a,b,c,d counter-clockwise seen from its front */
function xgQuad(B,p,col){const n=xgNrm(p[0],p[1],p[3])||xgNrm(p[1],p[2],p[0]);if(!n||!xgSeen(n))return;const k=xgPush(B,p,col,...n);B.I.push(k,k+1,k+2,k,k+2,k+3)}
function xgTri(B,a,b,c,col){const n=xgNrm(a,b,c);if(!n||!xgSeen(n))return;const k=xgPush(B,[a,b,c],col,...n);B.I.push(k,k+1,k+2)}
const XBF=[[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]];
/* box of size w,h,d centred on x,y,z, turned ry around y; tc = optional top colour */
function xgBox(G,w,h,d,col,x,y,z,ry,tc){const B=xgCell(G,x,z),c=Math.cos(ry||0),s=Math.sin(ry||0),a=w/2,b=h/2,e=d/2;
 XBF.forEach((f,i)=>xgQuad(B,f.map(q=>{const u=q[0]*a,t=q[2]*e;return[x+u*c+t*s,y+q[1]*b,z-u*s+t*c]}),i==0&&tc?tc:col))}
/* n-sided frustum standing on y0: radius r0 at the bottom, r1 at the top (0 = cone); o: ph (turn), top (cap colour),
   sx/sz (stretch), inv (faces point inwards, for the inside of a basin), cap:false */
function xgPrism(G,r0,r1,h,n,col,x,y0,z,o){o=o||{};const B=xgCell(G,x,z),ph=o.ph||0,y1=y0+h,sx=o.sx||1,sz=o.sz||1,pt=(r,i,y)=>{const t=ph+i/n*Math.PI*2;return[x+Math.cos(t)*r*sx,y,z+Math.sin(t)*r*sz]};
 for(let i=0;i<n;i++){const a=pt(r0,i,y0),b=pt(r0,i+1,y0),c=pt(r1,i+1,y1),d=pt(r1,i,y1);if(r1<1e-4){o.inv?xgTri(B,a,b,d,col):xgTri(B,b,a,d,col)}else xgQuad(B,o.inv?[a,b,c,d]:[b,a,d,c],col)}
 if(r1>1e-4&&o.cap!==false&&!o.inv){const ctr=[x,y1,z];for(let i=0;i<n;i++)xgTri(B,ctr,pt(r1,i+1,y1),pt(r1,i,y1),o.top||col)}}
/* flat ring (annulus) at height y */
function xgRing(G,r0,r1,y,n,col,x,z,o){o=o||{};const B=xgCell(G,x,z),ph=o.ph||0,sx=o.sx||1,sz=o.sz||1,pt=(r,i)=>{const t=ph+i/n*Math.PI*2;return[x+Math.cos(t)*r*sx,y,z+Math.sin(t)*r*sz]};
 for(let i=0;i<n;i++)xgQuad(B,[pt(r1,i+1),pt(r1,i),pt(r0,i),pt(r0,i+1)],col)}
/* flat star-shaped polygon (points [x,z] in order of increasing angle around cx,cz) at height y */
function xgPoly(G,pts,y,col,cx,cz){const B=xgCell(G,cx,cz),c=[cx,y,cz];for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];xgTri(B,c,[q[0],y,q[1]],[p[0],y,p[1]],col)}}
/* vertical skirt along a closed polygon (outward faces), e.g. a pond rim */
function xgWall(G,pts,y0,y1,col,cx,cz){const B=xgCell(G,cx,cz);for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];xgQuad(B,[[q[0],y0,q[1]],[p[0],y0,p[1]],[p[0],y1,p[1]],[q[0],y1,q[1]]],col)}}
function xgFlush(G,mat){const out=[];for(const k in G.c){const B=G.c[k];if(!B.I.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(B.C,3));
  g.setIndex(B.P.length/3>65535?new THREE.Uint32BufferAttribute(B.I,1):new THREE.Uint16BufferAttribute(B.I,1));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat||SBM);scene.add(m);out.push(m)}G.c={};return out}

/* ---- fountains: stone basin, pedestal and two bowls; the water is added by ftnWater (static here, animated in 41) ---- */
const FTN=[];
function ftnWater(f){[[f.R-.35,f.wy],...f.bowls.map(b=>[b.r-.12,b.y])].forEach(([r,y])=>{const m=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshLambertMaterial({color:'#4aa3df'}));m.rotation.x=-Math.PI/2;m.position.set(f.x,y,f.z);scene.add(m)})}
function ftnBuild(G,x,z,R,o){o=o||{};const st=o.stone||'#c9c1b0',sd=dk(st,.82),n=20,f={x,z,R,wy:.54,bowls:[]};
 xgPrism(G,R+.75,R+.75,.1,n,dk(st,.9),x,0,z,{top:dk(st,.95)});/* plinth */
 xgPrism(G,R,R,.55,n,st,x,.1,z,{cap:false});xgRing(G,R-.35,R,.65,n,dk(st,1.08),x,z);xgPrism(G,R-.35,R-.35,.5,n,sd,x,.15,z,{inv:1});xgPrism(G,R-.35,R-.35,.02,n,'#2f6f8f',x,.13,z);
 /* pedestal, lower bowl, upper column, upper bowl, finial */
 const b1=R>2.6?1.7:1.25;xgPrism(G,.5,.38,1.05,10,st,x,.15,z);xgPrism(G,.45,b1,.4,14,st,x,1.15,z,{cap:false});xgRing(G,b1-.12,b1,1.55,14,dk(st,1.08),x,z);xgPrism(G,b1-.12,b1-.12,.25,14,sd,x,1.3,z,{inv:1});
 f.bowls.push({y:1.5,r:b1});
 xgPrism(G,.2,.16,.7,8,st,x,1.5,z);xgPrism(G,.2,.75,.24,12,st,x,2.15,z,{cap:false});xgRing(G,.65,.75,2.39,12,dk(st,1.08),x,z);xgPrism(G,.65,.65,.15,12,sd,x,2.24,z,{inv:1});
 f.bowls.push({y:2.35,r:.75});xgPrism(G,.14,.06,.32,6,st,x,2.3,z);f.top=2.62;
 col(x-R*.82,z-R*.82,x+R*.82,z+R*.82);FTN.push(f);return f}

function cityFix(){if(CTD.fix)return;CTD.fix=1;const G=xgNew(),inRoad=(x,z,m)=>ROADS.find(r=>x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m);
 /* junction slabs: flat tops only */
 for(const k in SBC)SBC[k]=SBC[k].filter(e=>{if(e[3]!='#3a3d44'||Math.abs(e[5]-.015)>.003||e[1]>.05)return true;const y=e[5]+.02,a=e[0]/2,d=e[2]/2;
  xgQuad(xgCell(G,e[4],e[6]),[[e[4]-a,y,e[6]+d],[e[4]+a,y,e[6]+d],[e[4]+a,y,e[6]-d],[e[4]-a,y,e[6]-d]],e[3]);return false});
 /* pavements ran on under the junction slabs and showed their front edge as a light line: cut them where they cross a road */
 for(const k in SBC){const L=SBC[k],add=[],ext=[];SBC[k]=L.filter(e=>{if(e[3]!='#b9b5ab'||Math.abs(e[5]+.02)>.005||Math.abs(e[1]-.06)>.01)return true;const h=e[0]>e[2],a0=(h?e[4]-e[0]/2:e[6]-e[2]/2),a1=(h?e[4]+e[0]/2:e[6]+e[2]/2),c0=h?e[6]-e[2]/2:e[4]-e[0]/2,c1=h?e[6]+e[2]/2:e[4]+e[0]/2;
  const cut=ROADS.map(r=>h?[r[0],r[1],r[2],r[3]]:[r[1],r[0],r[3],r[2]]).filter(r=>r[1]<c1-.05&&r[3]>c0+.05&&r[0]<a1&&r[2]>a0&&r[2]-r[0]<30).map(r=>[r[0],r[2]]).sort((p,q)=>p[0]-q[0]);if(!cut.length)return true;
  let a=a0;cut.forEach(([p,q])=>{if(p-a>.05)add.push([a,p]);a=Math.max(a,q)});if(a1-a>.05)add.push([a,a1]);
  add.splice(0).forEach(([p,q])=>ext.push(h?[q-p,e[1],e[2],e[3],(p+q)/2,e[5],e[6]]:[e[0],e[1],q-p,e[3],e[4],e[5],(p+q)/2]));return false}).concat(ext)}
 /* tower doors left out in front of a tower front the warp trimmed back */
 CT.forEach(c=>{const cx=(c.x0+c.x1)/2,T=[];for(const k in SBC){const L=SBC[k];for(let j=L.length-1;j>=0;j--){const e=L[j];if(e[3]=='#2a1f1a'&&Math.abs(e[4]-cx)<.2&&Math.abs(e[1]-1.8)<.02&&e[6]>c.z1+.25&&e[6]<c.z1+12){T.push([e[0],e[1],e[2],e[3],cx,e[5],c.z1+.05]);L.splice(j,1)}}}
  if(T.length)scene.add(new THREE.Mesh(boxGeo(T),c.dm||SBM))});
 /* stretched parked cars, lamps and trees on asphalt */
 const CARC=['#e6b422','#3b82f6','#c0392b','#e8e8ec'],bad=[],badT=[];
 for(const k in SBC)SBC[k].forEach(e=>{if(e.nw&&e[3]=='#2a2d33'&&Math.abs(e[1]-.3)<.01&&inRoad(e[4],e[6],-.1))bad.push([e[4],e[6]]);if(e[3]=='#6b4a2e'&&e[1]>=.85&&e[0]<.5&&inRoad(e[4],e[6],.2))badT.push([e[4],e[6]])});
 const TGC=TG.concat(['#6b4a2e']);
 for(const k in SBC)SBC[k]=SBC[k].filter(e=>{if(CARC.includes(e[3])&&Math.abs(e[1]-.45)<.01&&Math.abs(e[2]-.9)<.02&&e[0]>1.75&&e[0]<5&&inRoad(e[4],e[6],.5))return false;
  if(e.nw&&bad.some(b=>Math.abs(b[0]-e[4])<.7&&e[6]-b[1]>-.3&&e[6]-b[1]<1))return false;if(TGC.includes(e[3])&&badT.some(b=>Math.abs(b[0]-e[4])<.01&&Math.abs(b[1]-e[6])<.01))return false;return true});
 CTD.trees=CTD.trees.filter(t=>!badT.some(b=>Math.abs(b[0]-t[0])<.05&&Math.abs(b[1]-t[1])<.05));
 /* small coplanar faces: kerb fronts vs pavement edges, awning stripe ends, window sills */
 for(const k in SBC)SBC[k].forEach(e=>{if(e[3]=='#a29e95'&&Math.abs(e[1]-.14)<.01){if(e[0]<.3)e[0]+=.012;else if(e[2]<.3)e[2]+=.012}else if(e[3]=='#f4f1ea'&&Math.abs(e[1]-.2)<.01&&e[2]<.05)e[0]*=.97;else if(e[3]=='#e8e4dc'&&Math.abs(e[1]-.1)<.01)e[5]+=.012});
 /* tree pits above the paving joints */
 for(const k in SBC)SBC[k].forEach(e=>{if((e[3]=='#6b5a45'||e[3]=='#55595f')&&e[1]<.04&&e[5]<.01&&e[0]>.9&&e[0]<1.1)e[1]=.05});
 /* City Plaza fountain: drop the stretched pieces, build a round one in the middle of the square */
 const px=WX(565),pz=WZ(33);for(const k in SBC)SBC[k]=SBC[k].filter(e=>!(Math.abs(e[4]-px)<10&&Math.abs(e[6]-pz)<6&&(e[3]=='#aaa'&&Math.abs(e[1]-.4)<.02||e[3]=='#4aa3df'&&Math.abs(e[1]-.15)<.02||e[3]=='#ccc'&&Math.abs(e[1]-1.6)<.03)));
 const fx=(WX(545)+WX(570)-PO)/2+2,fz=(WZ(22)+WZ(44))/2;CTD.areas=CTD.areas.filter(a=>!(a[4]=='#4aa3df'&&Math.abs(a[0]-px)<12&&Math.abs(a[1]-pz)<8));CTD.areas.push([fx-3.4,fz-3.4,fx+3.4,fz+3.4,'#4aa3df']);
 ftnBuild(G,fx,fz,3.4);const pp=POIS.find(p=>p[2]=='City Plaza');if(pp){pp[0]=fx;pp[1]=fz+4}
 xgFlush(G);FTN.forEach(f=>{if(!f.wm)ftnWater(f)});
 /* ground under the edges of the map */
 const gm=tex('#559a4e','#4a8844',1160,555),gp=new THREE.Mesh(new THREE.PlaneGeometry(1160,555),gm);gp.rotation.x=-Math.PI/2;gp.position.set(250,-.075,-22.5);scene.add(gp)}
/* tree heights vary a little, so neighbouring crowns no longer share a top face */
{const t1=tree;tree=function(x,z,s){t1(x,z,(s||1)*R(.9,1.1))}}
{const f3=flushSB;flushSB=function(){warpWorld();try{cityDetail()}catch(e){console.error('cityDetail',e)}try{parkedCars()}catch(e){console.error('parkedCars',e)}try{cityFix()}catch(e){console.error('cityFix',e)}f3()}}
