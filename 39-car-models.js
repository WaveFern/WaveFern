/* ===== v26.23: detailed cars =====
   Every car (traffic, your own cars, the garage, shop previews, cars parked by houses) is now one mesh made from a
   shared, merged geometry: a shaped body with wheel arches, cabin and glass, wheels with tyres, rims and hubs, head-,
   tail- and indicator lights, bumpers, grille, number plates, mirrors, door seams and handles, plus per-style parts.
   Geometries are cached per style + colour and all cars share three materials (glossy paint/glass, matte plastic and
   rubber, unlit lights), so ~120 traffic cars cost 3 draw calls each instead of ~25.
   carb() (16-big-world...js) keeps its old contract: a list that mkS()/pvModel() feed through B(g,...box). The list's
   own forEach hands out one placeholder box and swaps in the car geometry, so every existing caller gets the new model.
   Sizes match the old models (callers still scale by 1.5), so collisions and traffic spacing are unchanged.
   Styles 0-4 are the five cars you can buy; traffic also gets vans (5), SUVs (6) and taxis (7). */
const CARM={geo:{},mats:null,pk:0};
/* L,W: length and width; r: wheel radius; yb: body bottom; yh: beltline; yhf: nose height; ytr: tail height;
   fo/ro: front/rear axle z; cab: [rear base z, rear roof z, front roof z, windscreen base z, roof y]; cw: cabin width */
const CSPEC=[
 {L:1.9,W:.9,r:.16,yb:.17,yh:.52,yhf:.46,ytr:.52,fo:.58,ro:-.6,cab:[-.86,-.8,.12,.5,.86],cw:.9},
 {L:2.3,W:.95,r:.17,yb:.17,yh:.55,yhf:.5,ytr:.56,fo:.72,ro:-.72,cab:[-.72,-.42,.22,.62,.9],cw:.9},
 {L:2.5,W:1.05,r:.2,yb:.25,yh:.7,yhf:.66,ytr:.7,fo:.82,ro:-.78,cab:[-.2,-.17,.38,.72,1.1],cw:.92},
 {L:2.4,W:1.05,r:.17,yb:.13,yh:.42,yhf:.34,ytr:.46,fo:.75,ro:-.75,cab:[-.78,-.32,.12,.58,.72],cw:.86},
 {L:2.5,W:1.15,r:.18,yb:.13,yh:.44,yhf:.36,ytr:.46,fo:.8,ro:-.8,cab:[-.7,-.28,.16,.62,.74],cw:.86},
 {L:2.5,W:1.05,r:.18,yb:.2,yh:.66,yhf:.62,ytr:.66,fo:.85,ro:-.8,cab:[-1.18,-1.18,.62,.95,1.28],cw:.98},
 {L:2.35,W:1.05,r:.2,yb:.22,yh:.66,yhf:.62,ytr:.68,fo:.75,ro:-.72,cab:[-1.05,-1,.3,.66,1.1],cw:.94},
 {L:2.3,W:.95,r:.17,yb:.17,yh:.55,yhf:.5,ytr:.56,fo:.72,ro:-.72,cab:[-.72,-.42,.22,.62,.9],cw:.9}];
function carMats(){return CARM.mats||(CARM.mats=[new THREE.MeshPhongMaterial({vertexColors:true,shininess:70,specular:0x5a5a5a}),new THREE.MeshLambertMaterial({vertexColors:true}),new THREE.MeshBasicMaterial({vertexColors:true})])}
function carGeo(st,col){const key=st+col;if(CARM.geo[key])return CARM.geo[key];
 const S=CSPEC[st],{L,W,r,yb,yh,yhf,ytr,fo,ro,cw}=S,[zr0,zr1,zf1,zf0,yt]=S.cab,Wc=W*cw,G=[[],[],[]],dkc=dk(col,.55),add=(g,c,grp)=>G[grp].push([g,c]);
 const box=(w,h,d,x,y,z,c,grp=0,rx=0)=>{const g=new THREE.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);g.translate(x,y,z);add(g,c,grp)};
 /* a side profile [[z,y],...] extruded across the car from x0 to x1 */
 const ext=(pts,x0,x1,c,grp=0)=>{const g=new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(p=>new THREE.Vector2(-p[0],p[1]))),{depth:x1-x0,bevelEnabled:false,curveSegments:4});g.rotateY(Math.PI/2);g.translate(x0,0,0);add(g,c,grp)};
 const cyl=(rad,w,x,y,z,seg,c,grp)=>{const g=new THREE.CylinderGeometry(rad,rad,w,seg);g.rotateZ(Math.PI/2);g.translate(x,y,z);add(g,c,grp)};
 /* body with wheel arches */
 const ra=r+.035,arch=zc=>{const a=[];for(let i=0;i<=6;i++){const t=i/6*Math.PI;a.push([zc+Math.cos(t)*ra,yb+Math.sin(t)*ra])}return a};
 ext([[-L/2,yb+.05],[-L/2,ytr-.04],[-L/2+.06,ytr],[zr0,yh],[zf0,yh],[L/2-.1,yhf],[L/2,yhf-.05],[L/2,yb+.07],[L/2-.06,yb],...arch(fo),...arch(ro),[-L/2+.06,yb]],-W/2,W/2,col);
 /* cabin, glass (a little proud of the cabin so it shows as windscreen, side and rear windows) and B-pillar */
 ext([[zr0,yh-.01],[zr1,yt],[zf1,yt],[zf0,yh-.01]],-Wc/2,Wc/2,col);
 const gz0=st==5?.3:zr0-.02,gz1=st==5?.3:zr1-.012;ext([[gz0,yh+.03],[gz1,yt-.05],[zf1+.012,yt-.05],[zf0+.02,yh+.03]],-Wc/2-.012,Wc/2+.012,'#5d8fa8');
 const bz=st==5?.42:(zr1+zf1)/2-.04;box(Wc+.03,yt-yh-.09,.06,0,(yh+yt)/2-.02,bz,col);
 /* wheels: tyre, rim, hub */
 [fo,ro].forEach(z=>[-1,1].forEach(s=>{const x=s*(W/2-.075);cyl(r,.15,x,r,z,12,'#1b1b1d',1);cyl(r*.62,.16,x,r,z,10,'#c9ced6',0);cyl(r*.22,.17,x,r,z,6,'#55595f',1)}));
 /* bumpers, grille, lights, plates, exhaust */
 box(W+.02,.09,.1,0,yb+.07,L/2-.03,'#2b2c30',1);box(W+.02,.09,.1,0,yb+.07,-L/2+.03,'#2b2c30',1);
 box(W*.46,Math.max(.05,yhf-yb-.2),.02,0,(yhf+yb+.07)/2,L/2+.005,'#1c1d20',1);
 [-1,1].forEach(s=>{box(W*.2,.07,.03,s*W*.32,yhf-.1,L/2+.006,'#fff6c8',2);box(.06,.05,.03,s*W*.45,yhf-.1,L/2+.006,'#ffab2e',2);
  box(st==5?.07:W*.2,st==5?.2:.07,.03,s*W*.36,ytr-(st==5?.14:.1),-L/2-.006,'#e02828',2);box(.07,.05,.03,s*W*.2,ytr-.1,-L/2-.006,'#fff6c8',2)});
 box(W*.28,.07,.012,0,yb+.08,L/2+.027,'#f2f2f2',1);box(W*.28,.07,.012,0,yb+.08,-L/2-.027,'#f2f2f2',1);box(.06,.05,.08,W*.28,yb+.04,-L/2-.02,'#8a8f96',0);
 /* mirrors, door seams, handles, side skirts */
 [-1,1].forEach(s=>{box(.1,.06,.08,s*(Wc/2+.07),yh+.07,zf0-.06,col);box(.05,.02,.03,s*(Wc/2+.02),yh+.05,zf0-.06,'#2b2c30',1)});
 const sh=yh-yb-.1;[bz,zf0-.04].forEach(z=>{if(z<fo-ra&&z>ro+ra)box(W+.008,sh,.014,0,yb+.04+sh/2,z,dkc,1)});if(st!=5)box(W+.012,.025,.07,0,yh-.07,bz-.12,'#c9ced6',0);box(W+.012,.025,.07,0,yh-.07,zf0-.2,'#c9ced6',0);
 box(W+.006,.04,fo-ro-2*ra-.04,0,yb+.03,(fo+ro)/2,dk(col,.45),1);
 /* per-style parts */
 if(st==0)box(Wc*.9,.04,.12,0,yt+.01,zr1+.06,dkc,1);
 if(st==2){const z0=-L/2+.03,z1=zr0-.05,m=(z0+z1)/2,ln=z1-z0;[-1,1].forEach(s=>box(.06,.17,ln,s*(W/2-.03),yh+.085,m,col));box(W,.17,.06,0,yh+.085,z0,col);box(W-.12,.02,ln-.06,0,yh+.005,m,'#2b2c30',1);box(W*.6,.12,.03,0,yhf-.18,L/2+.008,'#c9ced6',0)}
 if(st==3){box(W*.95,.03,.18,0,ytr+.17,-L/2+.14,dkc,1);[-1,1].forEach(s=>box(.04,.14,.06,s*W*.3,ytr+.08,-L/2+.14,dkc,1))}
 if(st==4){const hz0=zf0+.02,hz1=L/2-.1,a=Math.atan2(yh-yhf,hz1-hz0);[-1,1].forEach(s=>{const x=s*.09;box(.08,.01,zf1-zr1,x,yt+.005,(zr1+zf1)/2,'#e6b422',0);box(.08,.01,zr0+L/2-.06,x,ytr+.005,(zr0-L/2+.06)/2,'#e6b422',0);
  box(.08,.01,Math.hypot(hz1-hz0,yh-yhf),x,(yh+yhf)/2+.005,(hz0+hz1)/2,'#e6b422',0,a);box(.06,.05,.08,s*W*.36,yb+.04,-L/2-.02,'#8a8f96',0)})}
 if(st==5){box(W+.008,.5,.014,0,(yh+yt)/2-.05,-.3,dkc,1);box(.014,yt-yb-.15,.012,0,(yt+yb)/2,-L/2-.007,dkc,1)}
 if(st==6){[-1,1].forEach(s=>box(.04,.04,zf1-zr1,s*Wc*.4,yt+.03,(zr1+zf1)/2,'#2b2c30',1));const g=new THREE.CylinderGeometry(r*.95,r*.95,.12,12);g.rotateX(Math.PI/2);g.translate(0,ytr-.12,-L/2-.06);add(g,'#1b1b1d',1)}
 if(st==7){box(.34,.11,.16,0,yt+.065,-.1,'#fff6c8',2);box(.38,.03,.2,0,yt+.01,-.1,'#2b2c30',1);for(let z=-.72,i=0;z<.66;z+=.1,i++)box(W+.01,.05,.1,0,yh-.14,z+.05,i%2?'#f2f2f2':'#1c1d20',1)}
 /* merge: one non-indexed buffer, groups in material order */
 const parts=[],groups=[];let n=0;G.forEach((Lp,gi)=>{const s0=n;Lp.forEach(([g,c])=>{const q=g.index?g.toNonIndexed():g,cnt=q.attributes.position.count;parts.push([q,new THREE.Color(c),cnt]);if(q!==g)g.dispose();n+=cnt});groups.push([s0,n-s0,gi])});
 const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
 parts.forEach(([q,cc,cnt])=>{P.set(q.attributes.position.array,o*3);N.set(q.attributes.normal.array,o*3);for(let i=0;i<cnt;i++){const j=(o+i)*3;C[j]=cc.r;C[j+1]=cc.g;C[j+2]=cc.b}o+=cnt;q.dispose()});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('color',new THREE.BufferAttribute(C,3));
 groups.forEach(([s0,c,gi])=>{if(c)geo.addGroup(s0,c,gi)});geo.computeBoundingBox();geo.computeBoundingSphere();return CARM.geo[key]=geo}
/* carb(i, colour): a car model "list" (see the note at the top). A colour means a traffic car, which can also be a van, SUV or taxi */
function carList(i,cc,fixed){let st=i,col=cc||CARS[i].c;if(cc&&!fixed&&Math.random()<.35){st=pick([5,5,6,6,7]);if(st==7)col='#f2c418'}
 const S=CSPEC[st],a=[[S.W,S.yh-S.yb,S.L,col,0,(S.yh+S.yb)/2,0]];
 a.forEach=function(cb){const m=cb([1,1,1,'#fff',0,0,0]);if(m&&m.isMesh){m.geometry=carGeo(st,col);m.material=carMats();m.scale.set(1,1,1)}};return a}

/* cars parked by houses (and the few on city pavements) were two plain boxes: swap them for real cars.
   House cars move off the pavement onto a driveway in the gap beside their house (skipped where a tree or a tight gap is in the way). */
function parkedCars(){if(CARM.pk)return;CARM.pk=1;const found=[];
 for(const k in SBC)SBC[k]=SBC[k].filter(e=>{const car=e[0]>1.69&&e[0]<1.71&&e[1]>.449&&e[1]<.452&&e[2]>.899&&e[2]<.905,gl=e[3]=='#9ad0f5'&&e[0]>.899&&e[0]<.905&&e[1]>.299&&e[1]<.302;if(car)found.push(e);return!(car||gl)});
 const H=CTD.hse.map(h=>({X:WX(h.cx),Zf:WZ(h.zf),w:h.w,h})),TR=CTD.tree.map(t=>[WX(t[0]),WZ(t[1])]);CTD.ob=CTD.ob||[];
 const place=(st,col,x,z,ry,s)=>{const m=mkS(carList(st,col,1));m.scale.setScalar(s);m.position.set(x,0,z);m.rotation.y=ry;scene.add(m)};
 found.forEach(e=>{const col=e[3],hs=H.find(q=>Math.abs(WX(q.h.cx-q.w/2-1.4)-e[4])<.06&&Math.abs(WZ(q.h.zf+.6)-e[6])<.06);
  if(!hs){if(e[5]<.32){place(RI(0,4),col,e[4],e[6],Math.random()<.5?Math.PI/2:-Math.PI/2,1.35);CTD.ob.push([e[4],e[6],1.8])}return}
  const left=hs.X-hs.w/2,prev=H.filter(q=>Math.abs(q.Zf-hs.Zf)<.01&&q.X+q.w/2<=left+.01).reduce((b,q)=>Math.max(b,q.X+q.w/2),left-3.5),gap=left-prev,s=1.35;
  const fits=[0,1,3,6].filter(st=>CSPEC[st].W*s+.85<=gap);if(!fits.length)return;const st=pick(fits),S=CSPEC[st],x=(prev+left)/2,Lc=S.L*s,z=hs.Zf+.3-Lc/2,hw=S.W*s/2+.5;
  if(TR.some(t=>Math.abs(t[0]-x)<hw+.4&&t[1]>z-Lc/2-1&&t[1]<z+Lc/2+1))return;
  const rd=RH.find(q=>q[0]>hs.Zf&&q[0]-hs.Zf<14&&x>q[1]&&x<q[2]),PE=rd?rd[0]-ROAD_W/2-PAVE_W:hs.Zf+.5,z0=z-Lc/2-.25;
  SB(S.W*s+.35,.03,PE-z0,'#9a9a96',x,0,(z0+PE)/2);place(st,col,x,z,0,s)})}
{const f2=flushSB;flushSB=function(){warpWorld();try{parkedCars()}catch(e){console.error('parkedCars',e)}f2()}}
