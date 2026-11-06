/* ===== dev only: the home map is an island ("island v1") =====
   The city used to stop at an invisible wall (the rectangle in WB) with grass and then sky behind it. Now the whole home map
   (city, park, airport and its runway) sits on one island with a real coast: grass, then a sand beach, wet sand, foam, shallow
   turquoise water, deeper blue water and a few rocks. The sea is a big water plane under everything.
   - Walking and driving stop at the shoreline (hit() checks the coast polygon instead of the old rectangle), so what you see is where you can go.
   - The big map and the minimap draw the sea, the beach and the grass in the same shape (and the big map can pan out to the coast).
   - Snow: the beach, foam and water are plain materials that the snow shader never touches, so the shore and the sea never snow
     (the old "water freezes" rule only hits the city's blue boxes). The grass between the city and the beach gets the same light dusting as the lawn.
   - Stray leftovers that fall outside the coast (bits of the removed south suburb) are hidden.
   - World Tour: home is no longer St. Louis on the US mainland. On the flight and booking maps it is a small fake island in the Atlantic,
     and the flight animation starts and ends there. Flight times and fares are unchanged (they were worked out at load time).
   Only loaded on /dev/. Add ?noisland to skip it. */
(function(){
 if(!window.FW_FEAT||/[?&]noisland/.test(location.search))return;
 if(typeof THREE=='undefined'||typeof scene=='undefined'||typeof WB=='undefined')return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev island '+t,e)}}};

 /* ---------- the coast: a smooth closed curve through hand placed points (x, z in world metres, z grows south) ---------- */
 const ANCH=[[-690,-120],[-672,-182],[-620,-214],[-540,-206],[-470,-222],[-390,-210],[-310,-226],[-220,-216],[-130,-232],[-40,-224],[60,-236],[160,-222],[260,-238],[360,-226],[460,-240],[560,-224],[660,-232],[742,-208],[796,-160],
  [812,-80],[818,0],[812,80],[800,150],
  [770,205],[700,224],[610,214],[520,232],[430,220],[340,236],[250,224],[160,238],[70,226],[-20,240],[-110,228],[-200,238],[-290,222],[-380,236],[-470,220],[-560,232],[-640,216],[-686,170],
  [-696,100],[-700,20],[-698,-50]];
 const NP=760;
 const smooth=P=>P.map((p,i)=>{const a=P[(i+P.length-1)%P.length],b=P[(i+1)%P.length];return[(a[0]+2*p[0]+b[0])/4,(a[1]+2*p[1]+b[1])/4]});
 let L=(()=>{const c=new THREE.CatmullRomCurve3(ANCH.map(a=>new THREE.Vector3(a[0],0,a[1])),true,'centripetal');return c.getSpacedPoints(NP).slice(0,NP).map(v=>[v.x,v.z])})();
 /* a little wobble so the shore is not a perfect curve */
 L=L.map((p,i)=>{const w=Math.sin(i*.37)*1.6+Math.sin(i*.113+1)*3.2+Math.sin(i*.9)*.6,a=L[(i+1)%NP],b=L[(i+NP-1)%NP],tx=a[0]-b[0],tz=a[1]-b[1],n=Math.hypot(tx,tz)||1;return[p[0]+tz/n*w,p[1]-tx/n*w]});
 L=smooth(smooth(L));
 const area=P=>{let s=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];s+=a[0]*b[1]-b[0]*a[1]}return s/2};
 const ccw=area(L)>0;
 /* move every point d metres outward (negative: inward) */
 const off=(P,d)=>P.map((p,i)=>{const a=P[(i+1)%P.length],b=P[(i+P.length-1)%P.length],tx=a[0]-b[0],tz=a[1]-b[1],n=Math.hypot(tx,tz)||1,nx=ccw?tz/n:-tz/n,nz=ccw?-tx/n:tx/n;return[p[0]+nx*d,p[1]+nz*d]});
 const BW=15;/* beach width: grass edge to waterline */
 const G=off(L,-BW),WK=off(L,-2.6);/* G: where the grass ends, WK: the furthest you can walk or drive */
 const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
 let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;WK.forEach(p=>{bx0=Math.min(bx0,p[0]);bx1=Math.max(bx1,p[0]);bz0=Math.min(bz0,p[1]);bz1=Math.max(bz1,p[1])});
 window.FW_ISLAND={coast:L,grass:G,walk:WK,inside:(x,z)=>inPoly(WK,x,z)};

 /* ---------- walking and driving stop at the shore ---------- */
 const homeMap=(x,z)=>x>-900&&x<1000&&z>-420&&z<258;
 {const h1=hit;hit=function(x,z,r){
   try{if(!IN&&!(typeof D!='undefined'&&D&&D.on)&&homeMap(x,z)){
     WB[0]=Math.min(WB[0],bx0);WB[1]=Math.max(WB[1],bx1);WB[2]=Math.min(WB[2],bz0);WB[3]=Math.max(WB[3],bz1);/* the old rectangle no longer cuts the island */
     if(!inPoly(WK,x,z))return 1}}catch(e){}
   return h1.apply(this,arguments)}}

 /* ---------- the maps ---------- */
 const strided=(P,k)=>P.filter((p,i)=>i%k==0);
 const LM=strided(L,3),GM=strided(G,3),SM=strided(off(L,13),3);
 const ring=(x,P,sx,sz)=>{x.beginPath();P.forEach((p,i)=>i?x.lineTo(sx(p[0]),sz(p[1])):x.moveTo(sx(p[0]),sz(p[1])));x.closePath()};
 let areasDone=0;
 /* map patches that sit out in the sea (leftover fields and lots of the removed south suburb) are dropped once the map data exists */
 const dropSea=()=>{if(areasDone||typeof CTD=='undefined'||!CTD.areas||!CTD.areas.length)return;areasDone=1;
  CTD.areas=CTD.areas.filter(a=>inPoly(L,(a[0]+a[2])/2,(a[1]+a[3])/2)||!homeMap((a[0]+a[2])/2,(a[1]+a[3])/2));
  if(CTD.hfp)CTD.hfp=CTD.hfp.filter(a=>inPoly(L,(a[0]+a[2])/2,(a[1]+a[3])/2)||!homeMap((a[0]+a[2])/2,(a[1]+a[3])/2))};
 {const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){
   safe(dropSea,'dropsea');
   safe(()=>{x.save();x.fillStyle='#2b7fc0';x.fillRect(-9999,-9999,19999,19999);
    ring(x,SM,sx,sz);x.fillStyle='#58c0d6';x.fill();
    ring(x,LM,sx,sz);x.fillStyle='#e3d3a0';x.fill();x.strokeStyle='#ffffffb0';x.lineWidth=Math.max(1,kx*.8);x.stroke();
    ring(x,GM,sx,sz);let gp=null;if(!mini){try{gp=mapGrass(x)}catch(e){}}x.fillStyle=gp||'#3f7a45';x.fill();x.restore()},'mapsea');
   return m0.apply(this,arguments)}}
 /* the big map can pan out to the coast on every side, and zoom out far enough to show the whole island */
 const EN=106,ES=90,EE=72,WEST=577;
 mapClamp=function(){const M=MAPZ,w=(M.W+M.L*.86+EE)*M.z,h=(M.H+EN+ES)*M.z;
  M.ox=w<=M.W?(M.W-w)/2:Math.min(0,Math.max(M.W-w,M.ox));
  M.oy=h<=M.H?(M.H-h)/2+EN*M.z:Math.min(EN*M.z,Math.max(M.H-(M.H+ES)*M.z,M.oy))};
 {const b0=bigMap;bigMap=function(){try{MAPZ.L=Math.max(MAPZ.L,WEST);MAPZ.min=.55}catch(e){}return b0.apply(this,arguments)}}

 /* ---------- World Tour: home is a small fake island in the Atlantic ---------- */
 safe(()=>{
  const M=WT_MAP,mlat=l=>1.25*Math.log(Math.tan(Math.PI/4+.4*l*Math.PI/180)),Y0=mlat(M.lat0),Y1=mlat(M.lat1);
  const proj=(lat,lon)=>[(lon+180)/360*M.W,(Y0-mlat(Math.max(M.lat1-10,Math.min(M.lat0,lat))))/(Y0-Y1)*M.H];
  const LAT=29.5,LON=-52,c=proj(LAT,LON),sc=12/1500,cx0=60,cz0=0;
  const base=strided(L,9).map(p=>[c[0]+(p[0]-cx0)*sc,c[1]+(p[1]-cz0)*sc*1.25]);
  /* at world map size the coast needs bigger bays and bumps than the real one to read as an island */
  const pts=base.map((p,i)=>{const a=base[(i+1)%base.length],b=base[(i+base.length-1)%base.length],tx=a[0]-b[0],tz=a[1]-b[1],n=Math.hypot(tx,tz)||1,w=(Math.sin(i*1.3)*.3+Math.sin(i*.47+1)*.45+Math.sin(i*3.1)*.12)*(ccw?1:-1);return[p[0]+tz/n*w,p[1]-tx/n*w]});
  /* and a small islet off the north east coast */
  const ix=c[0]+5.2,iy=c[1]-2.6,islet=[0,1,2,3,4,5,6,7].map(k=>[ix+Math.cos(k*.785)*(.55+.12*Math.sin(k*2.3)),iy+Math.sin(k*.785)*(.38+.08*Math.cos(k*1.7))]);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;pts.concat(islet).forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
  const sub=P=>'M'+P.map(p=>p[0].toFixed(2)+' '+p[1].toFixed(2)).join('L')+'Z';const d=sub(pts)+sub(islet);
  /* a continent key the tour map does not know, so only the flight and booking maps draw it (the tour map lists continents by key) */
  if(!M.c.some(r=>r[0]===9001))M.c.push([9001,'Fernfield Island','zz',d,c[0],c[1],5,Math.floor(x0),Math.floor(y0),Math.ceil(x1),Math.ceil(y1)]);
  /* flight times and fares were worked out when the game loaded; only where home is drawn changes */
  WT_HOME.lat=LAT;WT_HOME.lon=LON;
 },'tour');

 /* ---------- the 3D island ---------- */
 const rnd=(()=>{let s=20261106;return()=>(s=(s*16807)%2147483647)/2147483647})();
 const ISL=new THREE.Group();ISL.name='island';ISL.userData.isl=1;
 let built=false,sea=null,foam=null,snowTop=null,snowK=0,stX=0;
 const col=h=>new THREE.Color(h);
 /* a ribbon between two rings of equal length, with a colour and a height at each edge */
 function strip(P,Q,yP,yQ,cP,cQ,jit){const n=P.length,pos=new Float32Array(n*18),cl=new Float32Array(n*18),nr=new Float32Array(n*18);let o=0;
  const put=(p,y,c,j)=>{pos[o]=p[0];pos[o+1]=y;pos[o+2]=p[1];const k=1+(j||0);cl[o]=Math.min(1,c.r*k);cl[o+1]=Math.min(1,c.g*k);cl[o+2]=Math.min(1,c.b*k);nr[o+1]=1;o+=3};
  /* wind the triangles so they face up whichever way the ring runs (a face that points down is lit as if it were in shadow) */
  let up=1;for(let i=0;i<n;i++){const k=(i+1)%n,ax=Q[i][0]-P[i][0],az=Q[i][1]-P[i][1],bx=Q[k][0]-P[i][0],bz=Q[k][1]-P[i][1],c=az*bx-ax*bz;if(Math.abs(c)>1e-6){up=c>0?1:-1;break}}
  for(let i=0;i<n;i++){const k=(i+1)%n,j0=jit?(Math.sin(i*1.7)+Math.sin(i*.41))*jit:0,j1=jit?(Math.sin(k*1.7)+Math.sin(k*.41))*jit:0;
   if(up>0){put(P[i],yP,cP,j0);put(Q[i],yQ,cQ,j0*.6);put(Q[k],yQ,cQ,j1*.6);put(P[i],yP,cP,j0);put(Q[k],yQ,cQ,j1*.6);put(P[k],yP,cP,j1)}
   else{put(P[i],yP,cP,j0);put(Q[k],yQ,cQ,j1*.6);put(Q[i],yQ,cQ,j0*.6);put(P[i],yP,cP,j0);put(P[k],yP,cP,j1);put(Q[k],yQ,cQ,j1*.6)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));g.setAttribute('normal',new THREE.BufferAttribute(nr,3));return g}
 function vmat(){const m=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});m.userData.xms=1;/* the snow shader skips it: no snow, no ice on the shore or in the sea */return m}
 function seaTex(){const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.fillStyle='#2b7fc0';g.fillRect(0,0,32,32);
  g.fillStyle='#2672b0';for(let i=0;i<26;i++)g.fillRect((rnd()*32)|0,(rnd()*32)|0,2+(rnd()*3|0),1);
  g.fillStyle='#4a9bd6';for(let i=0;i<22;i++)g.fillRect((rnd()*32)|0,(rnd()*32)|0,2+(rnd()*4|0),1);
  g.fillStyle='#8cc8ee';for(let i=0;i<7;i++)g.fillRect((rnd()*32)|0,(rnd()*32)|0,2,1);
  const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6000/5,6000/5);return t}

 function build(){
  if(built)return;
  const old=scene.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===1160&&o.geometry.parameters.height===555);
  if(!old||!scene.children.some(o=>o===WORLD))return;
  built=true;old.visible=false;/* the old rectangle of grass */
  /* deep sea */
  sea=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),new THREE.MeshLambertMaterial({map:seaTex()}));sea.rotation.x=-Math.PI/2;sea.position.set(60,-.5,0);ISL.add(sea);
  /* shallows and deeper water, light to dark, going out from the waterline */
  const S1=off(L,13),S2=off(L,38);
  ISL.add(new THREE.Mesh(strip(L,S1,-.41,-.43,col('#9be8de'),col('#4fbfd4')),vmat()));
  ISL.add(new THREE.Mesh(strip(S1,S2,-.43,-.46,col('#4fbfd4'),col('#2b7fc0')),vmat()));
  /* beach: dry sand against the grass, wetter and darker towards the water */
  const R=[0,1,2,3].map(k=>off(L,-BW*(1-k/3)));
  const sand=['#e7d9a8','#e0d09a','#d3c08a','#b9a678'];
  for(let k=0;k<3;k++)ISL.add(new THREE.Mesh(strip(R[k],R[k+1],-.27-.03*k,-.27-.03*(k+1),col(sand[k]),col(sand[k+1]),.035),vmat()));
  /* a thin line of foam that breathes in and out */
  foam=new THREE.Mesh(strip(off(L,-.5),off(L,1.7),-.38,-.38,col('#ffffff'),col('#ffffff')),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide}));foam.material.userData.xms=1;ISL.add(foam);
  /* grass out to the beach, with the same pixel texture as before, and a dusting of snow on top when it snows */
  const sh=new THREE.Shape(G.map(p=>new THREE.Vector2(p[0],-p[1])));
  const gg=new THREE.ShapeGeometry(sh);const pa=gg.attributes.position,uv=gg.attributes.uv;for(let i=0;i<pa.count;i++)uv.setXY(i,pa.getX(i)/1.5,pa.getY(i)/1.5);
  const gm=tex('#559a4e','#4a8844',1,1);gm.map.repeat.set(1,1);gm.userData.xms=1;
  const grass=new THREE.Mesh(gg,gm);grass.rotation.x=-Math.PI/2;grass.position.y=-.25;ISL.add(grass);
  snowTop=new THREE.Mesh(gg,new THREE.MeshLambertMaterial({color:'#f1f5fa',transparent:true,opacity:0,depthWrite:false}));snowTop.rotation.x=-Math.PI/2;snowTop.position.y=-.24;snowTop.visible=false;ISL.add(snowTop);
  /* rocks on the wet sand and in the shallows (outside the walkable edge) and a few small rock stacks out in the water */
  const rk=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:'#ffffff'}),260),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),ps=new THREE.Vector3(),cc=new THREE.Color();
  const greys=['#8d9096','#7c8087','#6f7378','#9a9a94','#5f6a63','#a39e92'];let n=0;
  const place=(i,t,w,h,d,col2)=>{if(n>=260)return;const a=L[i%NP],b=L[(i+1)%NP],tx=b[0]-a[0],tz=b[1]-a[1],l=Math.hypot(tx,tz)||1,nx=ccw?tz/l:-tz/l,nz=ccw?-tx/l:tx/l;
   const x=a[0]+nx*t,z=a[1]+nz*t,y=t<0?-.33:t<13?-.42:-.46;e.set(0,rnd()*6.28,0);q.setFromEuler(e);sc.set(w,h,d);ps.set(x,y+h*.35,z);m4.compose(ps,q,sc);rk.setMatrixAt(n,m4);rk.setColorAt(n,cc.set(col2));n++};
  for(let c=0;c<60;c++){const i=(rnd()*NP)|0,t=-.4+rnd()*11,k=2+((rnd()*4)|0);for(let j=0;j<k;j++)place(i+((rnd()*10)|0)-5,t+rnd()*2.5,.7+rnd()*1.9,.35+rnd()*1.1,.7+rnd()*1.9,greys[(rnd()*6)|0])}
  for(let c=0;c<9;c++){const i=(rnd()*NP)|0,t=22+rnd()*26,cx=0;for(let j=0;j<5;j++){const w=3.2-j*.5+rnd()*.8;place(i+((rnd()*3)|0),t+(rnd()*2-1)*(j?1:0),w*(1+rnd()*.5),1.3+rnd()*.5,w,j%2?'#9a9a94':'#7c8087')}}
  rk.count=n;rk.instanceMatrix.needsUpdate=true;if(rk.instanceColor)rk.instanceColor.needsUpdate=true;rk.material.userData.xms=1;ISL.add(rk);
  scene.add(ISL);
  /* leftovers of the removed south suburb and anything else that sits out in the water */
  let hid=0;const out=(o)=>{if(!o.isMesh||o.isInstancedMesh||o.userData.isl||!o.visible||o===old)return;const g=o.geometry;if(!g)return;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;
   if(b.max.x-b.min.x>150||b.max.z-b.min.z>150)return;const c=new THREE.Vector3((b.min.x+b.max.x)/2,0,(b.min.z+b.max.z)/2).applyMatrix4(o.matrixWorld);
   if(homeMap(c.x,c.z)&&c.z>150&&!inPoly(WK,c.x,c.z)||c.x<-300&&!inPoly(WK,c.x,c.z)&&homeMap(c.x,c.z)){o.visible=false;hid++}};
  scene.updateMatrixWorld(true);scene.children.forEach(o=>{out(o)});WORLD.children.forEach(o=>out(o));
  /* the airport ground and the main lawns keep their own stripes; nothing else to change there */
  window.FW_ISLAND.hidden=hid}

 /* ---------- every frame: show it only on the home map, ripple the water, breathe the foam, ease in the snow dusting ---------- */
 let last=performance.now(),tt=0;
 function tick(now){requestAnimationFrame(tick);const dt=Math.min(.1,(now-last)/1000);last=now;
  safe(()=>{if(!built){build();return}
   tt+=dt;const away=(typeof IN!='undefined'&&IN)||(typeof D!='undefined'&&D&&D.on);ISL.visible=!away;if(away)return;
   sea.material.map.offset.set((tt*.012)%1,(tt*.007)%1);
   foam.material.opacity=.45+.3*Math.sin(tt*1.3);
   const want=(typeof S!='undefined'&&S&&S.wx&&S.wx.k=='snow'&&S.wx.d===S.day)?1:0;snowK+=(want-snowK)*Math.min(1,dt*1.2);if(Math.abs(want-snowK)<.01)snowK=want;
   snowTop.visible=snowK>.02;snowTop.material.opacity=.78*snowK},'tick')}
 requestAnimationFrame(tick);
})();
