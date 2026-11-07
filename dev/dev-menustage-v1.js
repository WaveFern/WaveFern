/* WaveFern dev: the MAIN MENU background is a set of cinematic scenes of a packed stadium show, not a still picture. Only loaded on /dev/.
   A small night stadium (bowl, stage with a lit screen, band, beams, lasers, pyro, confetti, fireworks) is built in its OWN three.js scene, so it
   never touches the game world, and the crowd in it is made of real NPC characters (dev-npccrowd-v1.js). A handful of camera shots (crane over the
   bowl, behind the singer, at the barrier, from the stands, side on) cut into each other every few seconds while the menu is up.
   The pause menu is unchanged (it never shows this).
   Load time: nothing is built until the menu is on screen. The still house picture shows first, the stadium is built in small steps over the next
   second or so (so the menu stays clickable), and then fades in over the picture. If the device is slow (the first frames take too long), has
   reduced motion on, or the stadium fails for any reason, the still picture simply stays.
   Off switch: add ?nomenuscene (or ?notour) to the address. ?menuscene=force skips the slow-device check. */
(function(){
 if(!window.FW_FEAT)return;
 const Q=location.search;
 const off=/[?&](nomenuscene|notour)\b/.test(Q)||/[?&]noxcrowd\b/.test(Q),force=/[?&]menuscene=force/.test(Q);
 const M=window.FW_MENUSTAGE={state:off?'off':'idle',shot:0,fps:0,build_ms:0,fans:0};
 if(off)return;
 /* v49.93.3: the OS reduced-motion setting no longer switches the stadium off (it left many players on the still picture); add ?nomenuscene to turn it off */
 const lowEnd=(()=>{try{return(navigator.deviceMemory&&navigator.deviceMemory<=2)||(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)&&(navigator.hardwareConcurrency||4)<=4)}catch(e){return false}})();
 const DENS=lowEnd?.55:1;

 const st=document.createElement('style');
 st.textContent='body.fwmenubg.fwmenustage canvas#c{visibility:visible;animation:fwmsin 1.4s ease-out}@keyframes fwmsin{from{opacity:0}to{opacity:1}}#fwmfade{position:fixed;inset:0;z-index:0;background:#000;opacity:0;pointer-events:none;transition:opacity .55s ease}body.fwmenustage #fwmfade{display:block}body:not(.fwmenustage) #fwmfade{display:none}';
 document.head.appendChild(st);
 const fade=document.createElement('div');fade.id='fwmfade';

 let SC=null,CAM=null,ready=false,failed=false,building=false,wantBuild=0;
 const T={t:0,last:0,shot:-1,shotT:0};
 const U=()=>window.FW_NPCX&&FW_NPCX.uniforms?FW_NPCX.uniforms():null;
 let CU=null,beams=[],lasers=[],pyro=[],stars=null,conf=null,fw=null,scrTex=null,scrCtx=null,scrT=0,band=[],lights={},cones=null;
 const a=58,b=46,SZ=-30;/* stadium half width / half depth, stage centre z */
 const PI2=Math.PI*2,pick=(l,r)=>l[Math.floor(r()*l.length)];
 let seed=1234567;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296},R=(x,y)=>x+rnd()*(y-x);

 /* ---- a tiny mesh builder: coloured triangles with flat normals ---- */
 const col=new THREE.Color();
 function MB(){return{P:[],N:[],C:[]}}
 function tri(m,p,q,r,c,wn){const ux=q[0]-p[0],uy=q[1]-p[1],uz=q[2]-p[2],vx=r[0]-p[0],vy=r[1]-p[1],vz=r[2]-p[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  if(wn&&nx*wn[0]+ny*wn[1]+nz*wn[2]<0){const t=q;q=r;r=t;nx=-nx;ny=-ny;nz=-nz}
  const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;col.set(c);
  [p,q,r].forEach(v=>{m.P.push(v[0],v[1],v[2]);m.N.push(nx,ny,nz);m.C.push(col.r,col.g,col.b)})}
 function quad(m,p,q,r,s,c,wn){tri(m,p,q,r,c,wn);tri(m,p,r,s,c,wn)}
 function box(m,x,y,z,w,h,d,c,ry){const cs=Math.cos(ry||0),sn=Math.sin(ry||0),hx=w/2,hz=d/2;
  const V=(dx,dy,dz)=>[x+dx*cs+dz*sn,y+dy,z-dx*sn+dz*cs],y0=-h/2,y1=h/2;
  const A=V(-hx,y0,-hz),B_=V(hx,y0,-hz),C_=V(hx,y0,hz),D_=V(-hx,y0,hz),E=V(-hx,y1,-hz),F=V(hx,y1,-hz),G=V(hx,y1,hz),H=V(-hx,y1,hz);
  const c2=c;quad(m,E,F,G,H,c2,[0,1,0]);quad(m,A,B_,F,E,c2,[0,0,-1]);quad(m,D_,C_,G,H,c2,[0,0,1]);quad(m,A,D_,H,E,c2,[-1,0,0]);quad(m,B_,C_,G,F,c2,[1,0,0])}
 function geo(m){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(m.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(m.N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(m.C,3));g.computeBoundingSphere();return g}

 const ell=(t,k,y)=>[Math.cos(t)*a*k,y,Math.sin(t)*b*k];

 /* ---- step 1: the stadium shell, pitch and stage ---- */
 function buildShell(){
  const m=MB(),NS=64;
  /* pitch and the strip round it */
  for(let i=0;i<NS;i++){const t0=i/NS*PI2,t1=(i+1)/NS*PI2,g=i%2?'#3f8a3f':'#4a9a48';tri(m,[0,.02,0],ell(t0,1.02,.02),ell(t1,1.02,.02),g,[0,1,0])}
  /* the seating bowl: rows climb away from the pitch, blue lower tier then red upper tier, with a dark riser under each */
  let y=1,k=1.02;const ROWS=16;
  for(let r=0;r<ROWS;r++){const k0=k,k1=k+.048,y0=y,y1=y+.8,lower=r<8;
   for(let i=0;i<NS;i++){const t0=i/NS*PI2,t1=(i+1)/NS*PI2,sec=Math.floor(i/2)%2,tc=lower?(sec?'#3a62a8':'#3058a0'):(sec?'#a83a4a':'#983444'),rc=lower?'#4a5260':'#454b58';
    quad(m,ell(t0,k0,y0),ell(t1,k0,y0),ell(t1,k0,y1),ell(t0,k0,y1),rc,[-Math.cos((t0+t1)/2),0,-Math.sin((t0+t1)/2)]);
    quad(m,ell(t0,k0,y1),ell(t1,k0,y1),ell(t1,k1,y1),ell(t0,k1,y1),tc,[0,1,0])}
   y=y1;k=k1;
   if(r==7){/* walkway between the tiers: a tall riser up to the upper tier */
    for(let i=0;i<NS;i++){const t0=i/NS*PI2,t1=(i+1)/NS*PI2;quad(m,ell(t0,k,y),ell(t1,k,y),ell(t1,k,y+2.2),ell(t0,k,y+2.2),'#3c424e',[-Math.cos((t0+t1)/2),0,-Math.sin((t0+t1)/2)])}
    y+=2.2}}
  const top=y,kt=k;
  /* back wall, outside */
  for(let i=0;i<NS;i++){const t0=i/NS*PI2,t1=(i+1)/NS*PI2,c=i%2?'#c8ccd2':'#d0d4da',tm=(t0+t1)/2;
   quad(m,ell(t0,kt,0),ell(t1,kt,0),ell(t1,kt,top+8),ell(t0,kt,top+8),c,[Math.cos(tm),0,Math.sin(tm)]);
   quad(m,ell(t0,kt,top+8),ell(t1,kt,top+8),ell(t1,kt-.4,top+8),ell(t0,kt-.4,top+8),'#e8ecf0',[0,1,0])}
  /* floodlight masts round the top */
  for(let i=0;i<16;i++){const t=i/16*PI2,p=ell(t,kt+.02,0);box(m,p[0],(top+8+10)/2,p[2],.8,top+18,.8,'#aab0b8',0)}
  /* stage */
  const sw=34,sd=12,sh=2.4,zf=SZ+sd/2,zb=SZ-sd/2,H=20;
  box(m,0,sh/2,SZ,sw,sh,sd,'#15151a',0);box(m,0,sh+.02,SZ,sw,.06,sd,'#24242c',0);
  for(const o of[-1,1]){box(m,o*sw/2,H/2,zb+.3,.5,H,.5,'#3a3a40',0);box(m,o*sw/2,H/2,zf-.3,.5,H,.5,'#3a3a40',0);box(m,o*(sw/2+2.4),H*.62,zf-1,3,6,2,'#1a1a1e',0)}
  box(m,0,H,zb+.3,sw+1,.5,.5,'#3a3a40',0);box(m,0,H,zf-.3,sw+1,.5,.5,'#3a3a40',0);box(m,-sw/2,H,SZ,.5,.5,sd,'#3a3a40',0);box(m,sw/2,H,SZ,.5,.5,sd,'#3a3a40',0);
  box(m,0,(H+6)/2,zb-1,sw+16,H+6,1.5,'#101014',0);
  box(m,0,sh+.4,zb+2.6,6,.8,4,'#2a2a30',0);/* drum riser */
  box(m,0,.7,SZ+sd/2+1.6,3,1.4,2.2,'#1a1a1e',0);/* sound desk */
  /* catwalk into the crowd */
  box(m,0,1.4,SZ+sd/2+8,3,.3,16,'#1a1a22',0);
  /* a mixing tower out in the crowd */
  box(m,0,4,30,6,8,6,'#2a2a30',0);box(m,0,8.2,30,7,.4,7,'#3a3a40',0);
  SC.add(new THREE.Mesh(geo(m),new THREE.MeshLambertMaterial({vertexColors:true})));
  /* glowing parts: the lit band round the bowl, roof lamps, stage edge, mast lamps */
  const g=MB();
  for(let i=0;i<NS;i++){const t0=i/NS*PI2,t1=(i+1)/NS*PI2,tm=(t0+t1)/2,c=(i%8<4)?'#ff4a9a':'#6ad5ff';
   quad(g,ell(t0,kt+.003,top+4),ell(t1,kt+.003,top+4),ell(t1,kt+.003,top+4.7),ell(t0,kt+.003,top+4.7),c,[Math.cos(tm),0,Math.sin(tm)])}
  for(let i=0;i<16;i++){const t=i/16*PI2,p=ell(t,kt+.02,0);box(g,p[0]-Math.cos(t)*1.3,top+18.5,p[2]-Math.sin(t)*1.3,3.4,1.6,.5,'#fff6dc',-t)}
  box(g,0,sh-.05,zf+.02,sw,.08,.1,'#ff4a9a',0);
  for(let i=0;i<24;i++){const t=i/24*PI2,p=ell(t,kt-.42,top+8.6);box(g,p[0],p[1],p[2],2.2,.6,.6,'#fff8e0',-t)}
  SC.add(new THREE.Mesh(geo(g),new THREE.MeshBasicMaterial({vertexColors:true,fog:false})));
  /* the screen: a canvas that is redrawn a few times a second */
  scrTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=96;scrCtx=c.getContext('2d');const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t})();
  const sw2=sw*.92,sh2=sw2*.375,scr=new THREE.Mesh(new THREE.PlaneGeometry(sw2,sh2),new THREE.MeshBasicMaterial({map:scrTex,fog:false}));scr.position.set(0,sh+1+sh2/2,zb+.1);SC.add(scr);
  [-1,1].forEach(o=>{const s=new THREE.Mesh(new THREE.PlaneGeometry(11,6.2),new THREE.MeshBasicMaterial({map:scrTex,fog:false}));s.position.set(o*(sw/2+9),H-1,zb+.2);s.rotation.y=-o*.25;SC.add(s)});
  drawScreen(0);
  M.stageZ=zf;M.top=top}

 function drawScreen(t){
  const c=scrCtx,w=256,h=96,hue=(t*18)%360;
  const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'hsl('+hue+',85%,35%)');g.addColorStop(1,'hsl('+((hue+80)%360)+',90%,28%)');c.fillStyle=g;c.fillRect(0,0,w,h);
  for(let i=0;i<24;i++){const v=.25+.75*Math.abs(Math.sin(t*3.1+i*.9)*Math.sin(t*1.3+i*.37));c.fillStyle='hsla('+((hue+i*9)%360)+',100%,70%,.85)';const bh=v*h*.8;c.fillRect(i*10.7+2,h-bh,8,bh)}
  c.fillStyle='rgba(255,255,255,.92)';c.font='bold 30px ui-monospace,Menlo,Consolas,monospace';c.textAlign='center';c.fillText('WAVEFERN',w/2,40);
  c.fillStyle='rgba(255,255,255,.55)';c.font='bold 11px ui-monospace,Menlo,Consolas,monospace';c.fillText('LIVE  ·  SOLD OUT',w/2,58);
  scrTex.needsUpdate=true}

 /* ---- step 2: lights, sky, beams, lasers, pyro, confetti, fireworks ---- */
 function buildFx(){
  SC.background=new THREE.Color(0x070a1c);SC.fog=new THREE.FogExp2(0x0d0b26,.0055);
  SC.add(new THREE.AmbientLight(0x6a78b4,1.25));SC.add(new THREE.HemisphereLight(0xa8bcff,0x2c2044,.75));
  const dl=new THREE.DirectionalLight(0xd0dcff,.8);dl.position.set(-30,60,50);SC.add(dl);
  lights.p1=new THREE.PointLight(0xff3d9a,1.5,110);lights.p1.position.set(-20,18,-18);SC.add(lights.p1);
  lights.p2=new THREE.PointLight(0x35c8ff,1.5,110);lights.p2.position.set(20,18,-18);SC.add(lights.p2);
  lights.p3=new THREE.PointLight(0xffe2a0,.9,90);lights.p3.position.set(0,14,-8);SC.add(lights.p3);
  /* sky dome with a purple haze at the horizon, and stars */
  {const g=new THREE.SphereGeometry(520,24,12),p=g.attributes.position,c=[];for(let i=0;i<p.count;i++){const h=Math.max(0,Math.min(1,p.getY(i)/320));col.setRGB(.02+.2*(1-h)*(1-h),.025+.07*(1-h)*(1-h),.08+.3*(1-h)*(1-h));c.push(col.r,col.g,col.b)}
   g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));SC.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false})))}
  {const P=[];for(let i=0;i<420;i++){const u=R(0,PI2),v=R(.12,1.2),r=480;P.push(Math.cos(u)*Math.cos(v)*r,Math.sin(v)*r,Math.sin(u)*Math.cos(v)*r)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));stars=new THREE.Points(g,new THREE.PointsMaterial({color:'#dfe8ff',size:2,sizeAttenuation:false,fog:false,transparent:true,opacity:.8,depthWrite:false}));SC.add(stars)}
  const sw=34,H=20,zf=SZ+6,sh=2.4;
  /* light beams from the rig, sweeping over the crowd */
  const cols=['#ff4a9a','#6ad5ff','#ffe066','#b07aff','#2fe68a'];
  for(let i=0;i<10;i++){const g=new THREE.CylinderGeometry(.12,3.6,60,10,1,true);g.translate(0,-30,0);
   const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:cols[i%5],transparent:true,opacity:.11,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
   m.position.set(-sw/2+(i+.5)*sw/10,H-.4,SZ);m.userData.ph=i*1.3;SC.add(m);beams.push(m)}
  for(let i=0;i<14;i++){const L=90,g=new THREE.BoxGeometry(.06,.06,L);g.translate(0,0,L/2);
   const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i%2?'#3dff7a':'#ff4a9a',transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
   m.position.set((i-6.5)*2,sh+.5,zf);m.userData.ph=i;SC.add(m);lasers.push(m)}
  for(let i=0;i<8;i++){const g=new THREE.ConeGeometry(.6,1,10,1,true);g.translate(0,.5,0);
   const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i%2?'#ffb02a':'#ff5a1a',transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
   m.position.set(-sw/2+.8+i*(sw-1.6)/7,sh,zf-.4);m.scale.set(1,.01,1);m.visible=false;SC.add(m);pyro.push({m,t:-1,at:i<4?0:.35})}
  /* confetti (bursts from the stage) and fireworks (over the roof) */
  {const N=700,p=new Float32Array(N*3),c=new Float32Array(N*3),ph=['#ff4a9a','#ffe066','#6ad5ff','#2fe68a','#ffffff','#b07aff'];for(let i=0;i<N;i++){p[i*3+1]=-999;col.set(ph[i%6]);c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
   conf={N,p,v:new Float32Array(N*3),life:new Float32Array(N),pts:new THREE.Points(g,new THREE.PointsMaterial({size:3,sizeAttenuation:false,vertexColors:true,transparent:true,depthWrite:false,fog:false})),next:0};conf.pts.frustumCulled=false;SC.add(conf.pts)}
  {const N=520,p=new Float32Array(N*3),c=new Float32Array(N*3);for(let i=0;i<N;i++)p[i*3+1]=-999;
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
   fw={N,p,c,v:new Float32Array(N*3),life:new Float32Array(N),base:new Float32Array(N*3),pts:new THREE.Points(g,new THREE.PointsMaterial({size:4,sizeAttenuation:false,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})),next:0};fw.pts.frustumCulled=false;SC.add(fw.pts)}
 }

 /* ---- step 3: the crowd (real NPC look, see dev-npccrowd-v1.js) ---- */
 function buildCrowd(){
  const spots=[];
  /* stands: lower tier packed, upper tiers thinner (and cheaper to draw) */
  let y=1,k=1.02;
  for(let r=0;r<16;r++){const k0=k,k1=k+.048;y+=.8;k=k1;const km=(k0+k1)/2,lower=r<8,sp=lower?1.05:1.3,n=Math.floor(PI2*a*km/sp),dens=(lower?.7:r<12?.45:.35)*DENS;
   for(let i=0;i<n;i++){if(rnd()>dens)continue;const t=(i+rnd()*.6)/n*PI2,px=Math.cos(t)*a*km,pz=Math.sin(t)*b*km;if(pz<-b*.45&&Math.abs(px)<a*.75)continue;
    spots.push({x:px,y,z:pz,r:Math.atan2(-px,-pz),lite:!lower})}
   if(r==7)y+=2.2}
  /* the floor in front of the stage */
  for(let z=SZ+8.4;z<b*.82;z+=1.05)for(let x=-a*.82;x<a*.82;x+=1){if(rnd()>(.8-(z-SZ)/150)*DENS)continue;const jx=x+R(-.25,.25),jz=z+R(-.25,.25);if((jx/a)**2+(jz/b)**2>.9)continue;if(Math.abs(jx)<2.4&&jz<SZ+46)continue;if(Math.abs(jx)<3.6&&Math.abs(jz-30)<4.6)continue;
   spots.push({x:jx,y:0,z:jz,r:Math.PI+R(-.3,.3),lite:z>SZ+26})}
  M.fans=spots.length;
  CU=U();const crowd=FW_NPCX.build(spots,{uniforms:CU,seed:99});SC.add(crowd);
  /* phone lights over some of the crowd */
  const P=[];spots.forEach((p,i)=>{if(i%7==0)P.push(p.x+(i%2?.3:-.3),p.y+2.05,p.z)});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  SC.add(new THREE.Points(g,new THREE.PointsMaterial({color:'#fff6d8',size:2,sizeAttenuation:false,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})))}

 /* ---- step 4: the band ---- */
 function buildBand(){
  const sh=2.4,zb=SZ-6,looks=[{skin:2,eyes:1,mouth:2,hair:4,hc:6,top:2,tc:6,pc:4,body:.3,hgt:.55},{skin:1,eyes:4,mouth:0,hair:5,hc:3,top:1,tc:0,pc:5,body:.4,hgt:.5},{skin:4,eyes:0,mouth:3,hair:11,hc:0,top:4,tc:8,pc:2,body:.35,hgt:.6},{skin:3,eyes:2,mouth:1,hair:9,hc:1,top:0,tc:2,pc:7,body:.45,hgt:.5},{skin:0,eyes:3,mouth:0,hair:3,hc:7,top:3,tc:9,pc:0,body:.3,hgt:.5}];
  const spec=[['sing',0,sh,SZ+3.6],['drum',0,sh+.8,zb+3.2],['gtr',-10,sh,zb+3.4],['bass',10,sh,zb+3.4],['keys',-14,sh,zb+1.6]];
  spec.forEach(([role,x,y,z],i)=>{let o;try{o=buildChar(looks[i])}catch(e){return}o.g.position.set(x,y,z);SC.add(o.g);
   if(role=='gtr'||role=='bass'){const g=new THREE.Group();[[.12,.9,.35,role=='gtr'?'#d8462b':'#2a2a2a',0,0,0],[.08,.08,.9,'#6a4a2a',0,.1,.55]].forEach(q=>{const m=new THREE.Mesh(new THREE.BoxGeometry(q[0],q[1],q[2]),new THREE.MeshLambertMaterial({color:q[3]}));m.position.set(q[4],q[5],q[6]);g.add(m)});g.position.set(0,.85,.32);g.rotation.x=.3;o.g.add(g)}
   if(role=='drum'){const g=new THREE.Group();[[.9,.6,.9,'#c0392b',0,.3,0],[.5,.35,.5,'#e8e8ec',-.7,.6,.3],[.5,.35,.5,'#e8e8ec',.7,.6,.3],[.7,.04,.7,'#e6b422',-1,1.2,-.2],[.7,.04,.7,'#e6b422',1,1.2,-.2]].forEach(q=>{const m=new THREE.Mesh(new THREE.BoxGeometry(q[0],q[1],q[2]),new THREE.MeshLambertMaterial({color:q[3]}));m.position.set(q[4],q[5],q[6]);g.add(m)});g.position.set(0,0,.9);o.g.add(g)}
   if(role=='keys'){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.BoxGeometry(1.4,.1,.5),new THREE.MeshLambertMaterial({color:'#1a1a1a'}));m.position.set(0,1,.5);g.add(m);o.g.add(g)}
   band.push({o,role,x,y,z,ph:i*1.7})})}

 /* ---- the camera shots ---- */
 const lerp=(p,q,u)=>p+(q-p)*u,ease=u=>u*u*(3-2*u);
 const SHOTS=[
  {n:'crane',d:10,f:(u,c)=>{const th=lerp(-.75,.12,u),R0=66;c.set(Math.sin(th)*R0,lerp(33,23,u),Math.cos(th)*R0,0,6,SZ+8,52)}},
  {n:'singer',d:9,f:(u,c)=>c.set(lerp(-5.5,-3,u),4.3,lerp(SZ-1.5,SZ+3,u),1,3.4,20,60)},
  {n:'catwalk',d:9,f:(u,c)=>c.set(0,3.6,lerp(12,-6,u),lerp(-3,3,u),7,SZ,60)},
  {n:'barrier',d:9,f:(u,c)=>{const x=lerp(-18,16,u);c.set(x,4.6,SZ+5.4,x+9,2.4,SZ+28,62)}},
  {n:'stands',d:10,f:(u,c)=>c.set(lerp(18,6,u),8.5,34,lerp(2,-2,u),7,SZ+2,52)},
  {n:'side',d:9,f:(u,c)=>c.set(-52,lerp(7,12,u),lerp(6,-6,u),lerp(-8,6,u),4,lerp(-8,-16,u),58)},
  {n:'wide',d:10,f:(u,c)=>c.set(lerp(-40,-30,u),lerp(18,14,u),lerp(-24,-14,u),8,5,12,56)}
 ];
 const cs={x:0,y:0,z:0};
 function setCam(px,py,pz,lx,ly,lz,fov){const t=T.t;CAM.position.set(px+Math.sin(t*.9)*.05,py+Math.sin(t*1.3)*.04,pz);CAM.lookAt(lx,ly,lz);if(Math.abs(CAM.fov-fov)>.01){CAM.fov=fov;CAM.updateProjectionMatrix()}}
 const camApi={set:setCam};
 function camera(dt){
  T.shotT+=dt;
  if(T.shot<0||T.shotT>SHOTS[T.shot].d){T.shot=(T.shot+1)%SHOTS.length;T.shotT=0;M.shot=T.shot;if(T.shot==1||T.shot==6)burst();if(CU)CU.uWave.value=T.shot==6?1:0;
   fade.style.opacity=0}
  const s=SHOTS[T.shot],u=ease(Math.min(1,T.shotT/s.d));
  /* a quick dip to black between shots */
  if(T.shotT>s.d-.55)fade.style.opacity=1;
  s.f(u,camApi)}

 /* ---- effects ---- */
 const pickc=['#ff4a9a','#ffe066','#6ad5ff','#2fe68a','#b07aff','#ffffff','#ff8a30'];
 function burst(){
  if(!conf)return;pyro.forEach(p=>{p.t=-p.at});
  for(let j=0;j<300;j++){const i=conf.next=(conf.next+1)%conf.N;conf.p[i*3]=R(-14,14);conf.p[i*3+1]=sh0();conf.p[i*3+2]=SZ+6;conf.v[i*3]=R(-5,5);conf.v[i*3+1]=R(8,20);conf.v[i*3+2]=R(2,15);conf.life[i]=R(4,7)}}
 const sh0=()=>2.6;
 function firework(){
  if(!fw)return;const cx=R(-60,60),cy=R(48,80),cz=R(-70,10),c1=new THREE.Color(pick(pickc,rnd)),c2=new THREE.Color(pick(pickc,rnd)),n=110;
  for(let j=0;j<n;j++){const i=fw.next=(fw.next+1)%fw.N,u=R(0,PI2),v=Math.acos(R(-1,1)),sp=R(9,17);fw.p[i*3]=cx;fw.p[i*3+1]=cy;fw.p[i*3+2]=cz;
   fw.v[i*3]=Math.sin(v)*Math.cos(u)*sp;fw.v[i*3+1]=Math.cos(v)*sp;fw.v[i*3+2]=Math.sin(v)*Math.sin(u)*sp;fw.life[i]=R(1.4,2.2);const cc=j%2?c1:c2;fw.base[i*3]=cc.r;fw.base[i*3+1]=cc.g;fw.base[i*3+2]=cc.b}}
 let nextFw=2,nextBurst=0;
 function fx(dt,t){
  const beat=Math.max(0,Math.sin(t*6.6));
  beams.forEach(m=>{const p=m.userData.ph;m.rotation.z=Math.sin(t*.7+p)*.55;m.rotation.x=-.55+Math.cos(t*.5+p*1.7)*.3;m.material.opacity=.07+.06*(.5+.5*Math.sin(t*2+p))})
  lasers.forEach(m=>{const p=m.userData.ph;m.rotation.y=Math.sin(t*.8+p*.6)*.9;m.rotation.x=-.12-.28*(.5+.5*Math.sin(t*.9+p));m.material.opacity=.25+.35*(.5+.5*Math.sin(t*3+p))})
  pyro.forEach(p=>{if(p.t>=-1){p.t+=dt;if(p.t<0)return;const u=p.t/1.6;if(u>=1){p.t=-9;p.m.visible=false;return}p.m.visible=true;p.m.scale.set(1+u,(1-Math.abs(u*2-.5))*9+.01,1+u);p.m.material.opacity=.85*(1-u)}})
  if(conf){for(let i=0;i<conf.N;i++){if(conf.life[i]<=0){conf.p[i*3+1]=-999;continue}conf.life[i]-=dt;conf.v[i*3+1]-=9*dt;conf.v[i*3]*=.985;conf.v[i*3+2]*=.985;conf.p[i*3]+=conf.v[i*3]*dt+Math.sin(t*3+i)*.02;conf.p[i*3+1]+=conf.v[i*3+1]*dt;conf.p[i*3+2]+=conf.v[i*3+2]*dt;if(conf.p[i*3+1]<.2){conf.life[i]=0;conf.p[i*3+1]=-999}}conf.pts.geometry.attributes.position.needsUpdate=true}
  if(fw){let any=0;const c=fw.pts.geometry.attributes.color.array;for(let i=0;i<fw.N;i++){if(fw.life[i]<=0){fw.p[i*3+1]=-999;continue}any=1;fw.life[i]-=dt;fw.v[i*3+1]-=7*dt;fw.v[i*3]*=.97;fw.v[i*3+1]*=.97;fw.v[i*3+2]*=.97;fw.p[i*3]+=fw.v[i*3]*dt;fw.p[i*3+1]+=fw.v[i*3+1]*dt;fw.p[i*3+2]+=fw.v[i*3+2]*dt;const f=Math.max(0,Math.min(1,fw.life[i]));c[i*3]=fw.base[i*3]*f;c[i*3+1]=fw.base[i*3+1]*f;c[i*3+2]=fw.base[i*3+2]*f}
   if(any||true){fw.pts.geometry.attributes.position.needsUpdate=true;fw.pts.geometry.attributes.color.needsUpdate=true}}
  if(t>nextFw){nextFw=t+R(2.2,4.5);firework()}
  if(t>nextBurst){nextBurst=t+R(7,10);burst()}
  /* crowd energy swells and settles */
  if(CU){CU.uT.value=t;CU.uHype.value=.62+.3*Math.sin(t*.35)+.05*beat;CU.uAmp.value=.16+.1*CU.uHype.value}
  lights.p1.intensity=1.1+.7*beat;lights.p2.intensity=1.1+.7*(1-beat);lights.p3.intensity=.7+.4*Math.sin(t*.8);
  if(stars)stars.material.opacity=.65+.2*Math.sin(t*.5);
  band.forEach(q=>{const g=q.o.g,s=Math.sin(t*6.6+q.ph);
   if(q.role=='sing'){g.position.y=q.y+Math.max(0,s)*.08;g.rotation.y=Math.sin(t*.5)*.35;q.o.arms[1].rotation.x=-2.7+Math.sin(t*3.3)*.35;q.o.arms[0].rotation.x=-1.25;q.o.legs[0].rotation.x=s*.15;q.o.legs[1].rotation.x=-s*.15}
   else if(q.role=='drum'){q.o.arms[0].rotation.x=-1.1+Math.max(0,s)*.7;q.o.arms[1].rotation.x=-1.1+Math.max(0,-s)*.7}
   else{g.position.y=q.y+Math.max(0,s)*.05;g.rotation.y=Math.sin(t*.6+q.ph)*.3;q.o.arms[0].rotation.x=-.9+Math.sin(t*13+q.ph)*.2;q.o.arms[1].rotation.x=-.5;q.o.legs[0].rotation.x=s*.12;q.o.legs[1].rotation.x=-s*.12}});
  scrT+=dt;if(scrT>.09){scrT=0;drawScreen(t)}}

 /* ---- building in small steps ---- */
 function build(){
  if(building||ready||failed)return;building=true;M.state='building';const t0=performance.now();
  const steps=[()=>{SC=new THREE.Scene();CAM=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.3,1200);buildFx()},buildShell,()=>{FW_NPCX.variantGeos(false)},()=>{FW_NPCX.variantGeos(true)},buildCrowd,buildBand];
  let i=0;
  const next=()=>{
   if(failed)return;
   if(!document.body.classList.contains('fwmenubg')){/* left the menu mid-build: start again next time it shows */building=false;return}
   try{steps[i++]()}catch(e){console.warn('menu stadium step failed',i,e);fail('error');return}
   M.build_ms=Math.round(performance.now()-t0);
   if(i<steps.length)setTimeout(next,16);
   else{ready=true;building=false;M.state='ready';M.ready_ms=Math.round(performance.now()-t0);T.last=performance.now()}};
  setTimeout(next,0)}
 function fail(why){failed=true;ready=false;building=false;M.state='failed:'+why;try{document.body.classList.remove('fwmenustage')}catch(e){}
  try{SC&&SC.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(o.material.map)&&o.material.map.dispose();o.material.dispose()}})}catch(e){}SC=null}

 /* ---- draw it instead of the game world while the menu is up ---- */
 let frames=0,acc=0,slow=0,warm=0;
 const r0=renderer.render.bind(renderer);
 renderer.render=function(sc,c){
  if(ready&&!failed&&sc===scene&&c===cam&&document.body.classList.contains('fwmenubg')){
   const n=performance.now(),raw=(n-T.last)/1000;let dt=Math.min(.1,raw);T.last=n;T.t+=dt;
   try{
    const asp=innerWidth/innerHeight;if(Math.abs(CAM.aspect-asp)>.001){CAM.aspect=asp;CAM.updateProjectionMatrix()}
    camera(dt);fx(dt,T.t);
    r0(SC,CAM);
   }catch(e){console.warn('menu stadium',e);fail('render');return r0(sc,c)}
   /* too slow for this device: go back to the picture for good */
   if(++warm<=45)return;/* v49.93.3: ignore the first frames (build and fade-in hitches) so a good device is not thrown back to the picture */
   frames++;acc+=Math.min(.5,raw);if(frames>=20){M.fps=Math.round(frames/acc);if(!force&&acc/frames>.125){if(++slow>=5)fail('slow')}else slow=0;frames=0;acc=0}
   return}
  return r0(sc,c)};

 let was=false;
 function tick(){
  requestAnimationFrame(tick);
  if(failed)return;
  try{
   if(!fade.isConnected&&document.body)document.body.appendChild(fade);
   const on=document.body.classList.contains('fwmenubg');
   if(on&&!ready&&!building&&!wantBuild&&window.FW_NPCX&&FW_NPCX.ready)wantBuild=setTimeout(()=>{wantBuild=0;if(document.body.classList.contains('fwmenubg'))build()},900);
   if(!on&&wantBuild){clearTimeout(wantBuild);wantBuild=0}
   const show=on&&ready;if(show!==was){was=show;document.body.classList.toggle('fwmenustage',show);if(show){T.last=performance.now();T.shot=-1;fade.style.opacity=0}}
  }catch(e){}
 }
 requestAnimationFrame(tick);
 M.build=build;M.cam=camApi;M.SHOTS=SHOTS;M.jump=i=>{T.shot=(i-1+SHOTS.length)%SHOTS.length;T.shotT=999};
})();
