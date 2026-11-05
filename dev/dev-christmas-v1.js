/* WaveFern dev: CHRISTMAS EVENT (limited time). Only loaded on /dev/, and it runs BEFORE the boot script so the world is
   built already dressed. It is one self-contained module and changes none of the original files.

   TO REVERT TO THE ORIGINAL MAP, NPCs AND WEATHER: set XMAS=false on the next line (or remove this file's script tag from
   dev/index.html). Add ?noxmas to the address to see the original for one visit without changing anything.

   What it does when on:
   - Weather: only Fog and a new Snow. Rain and thunderstorms never happen (an old rain/storm day turns into snow).
   - ONLY while it is snowing (the shader fades it in and out): snow lies on every upward-facing surface outdoors (roads turn
     icy grey, pavements, grass, roofs, tree tops, cars), tree sides are frosted, and you and the NPCs leave footprints.
   - Always (the winter map): the park pond is frozen over and you glide on it, trees and houses wear chasing Christmas lights,
     houses get wreaths and snowmen, cars leave tyre tracks (footprints and tracks fade in 10 s), a big decorated tree stands in the City Plaza, and NPCs wear winter jackets and hats.
   Everything is added on top (a shader patch, extra meshes, wrapped functions); no save data is changed. */
(function(){
 const XMAS=true;
 if(!window.FW_DEV||!XMAS)return;
 if(/[?&]noxmas/.test(location.search))return;
 window.FW_XMAS=1;
 const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),pk=a=>a[Math.floor(Math.random()*a.length)];
 const SNOW=new THREE.Color('#f1f5fa'),ICE=new THREE.Color('#bfe0f0');
 const outdoorXZ=(x,z)=>z<260&&x<880;
 /* the player's own home (and its extension) is left as it was */
 const inHome=(x,z)=>x>-.7&&x<16.7&&z>-30&&z<12.8;
 const SNOWU={value:0};/* 0 = bare winter map, 1 = fully snowed (eases with the weather) */
 let snowTarget=0;

 /* ---------- snow cover: one shader patch on every vertex-coloured material, driven by SNOWU ---------- */
 function patchMat(m){
  if(Array.isArray(m)){m.forEach(patchMat);return}
  if(!m||!m.userData||m.userData.xms||!m.vertexColors)return;m.userData.xms=1;
  m.onBeforeCompile=function(sh){
   sh.uniforms.uSnow=SNOWU;
   sh.vertexShader='uniform float uSnow;\n'+sh.vertexShader.replace('#include <color_vertex>',`#include <color_vertex>
#ifdef USE_COLOR
   {vec3 wq=(modelMatrix*vec4(position,1.)).xyz;
    float ok=step(wq.z,260.)*step(wq.x,880.)*(1.-step(-.7,wq.x)*step(wq.x,16.7)*step(-30.,wq.z)*step(wq.z,12.8));
    float okF=step(3500.,wq.x)*step(wq.x,4800.)*step(wq.z,-3000.);/* destination cities (outdoors only): snow, but no frozen water */
    vec3 c0=vColor;float mx=max(c0.r,max(c0.g,c0.b)),mn=min(c0.r,min(c0.g,c0.b));
    float water=step(.4,c0.b-c0.r),dark=step(mx,.34)*step(mx-mn,.1)*(1.-water);
    float green=step(c0.r*1.12,c0.g)*step(c0.b*1.3,c0.g);
    float top=step(.5,normal.y);
    vec3 ice=mix(c0,vec3(.75,.88,.94),top*water*.55*ok);/* water is frozen all winter */
    vec3 tgt=mix(vec3(.945,.96,.98),vec3(.78,.82,.87),dark);
    vec3 sn=ice;
    sn=mix(sn,tgt,top*(1.-water)*mix(.9,.88,dark)*(1.-green*(.42+.12*sin(wq.x*1.7)*sin(wq.z*1.3))));/* grass stays a little green */
    sn=mix(sn,vec3(.945,.96,.98),(1.-top)*green*step(.9,wq.y)*.42);
    vColor=mix(ice,sn,min(1.,ok+okF)*uSnow);}
#endif`);
   m.userData.xmsh=sh};
  m.customProgramCacheKey=()=>'xmas';
  m.needsUpdate=true}
 patchMat(SBM);
 window.FW_XMAS_PATCH=patchMat;

/* ---------- Christmas lights: a wire that spirals round the tree, with real bulbs sitting on it ---------- */
 const LC=[[1,.23,.19],[1,.76,.2],[.23,.55,1],[.22,.88,.48]];
 const lt={bp:[],bph:[],bci:[],bsh:[],wp:[]};
 const BU={t:{value:0}};
 const BS=.065,FACE=[[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],.72],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],.86]];
 /* one bulb: a small cube (three visible faces) */
 function bulb(x,y,z,ph,ci){
  FACE.forEach(f=>{[0,1,2,0,2,3].forEach(k=>{const q=f[k];lt.bp.push(x+q[0]*BS,y+q[1]*BS,z+q[2]*BS);lt.bph.push(ph);lt.bci.push(ci);lt.bsh.push(f[4])})})}
 const wire=(x0,y0,z0,x1,y1,z1)=>lt.wp.push(x0,y0,z0,x1,y1,z1);
 /* a wire spiralling round a foliage box, hugging its surface, with a bulb every ~.42 */
 function addString(cx,cy,cz,w,h,d){
  const OFF=.03,turns=h>.6?1.6:1,pw=w+OFF*2,pd=d+OFF*2,per=2*(pw+pd),Ls=turns*per,o=R(0,per),y0=cy-h*.42,y1=cy+h*.36;
  const at=s=>{const u=((s+o)%per+per)%per;let x,z;
   if(u<pw){x=-pw/2+u;z=pd/2}else if(u<pw+pd){x=pw/2;z=pd/2-(u-pw)}else if(u<2*pw+pd){x=pw/2-(u-pw-pd);z=-pd/2}else{x=-pw/2;z=-pd/2+(u-2*pw-pd)}
   return[cx+x,y0+(y1-y0)*s/Ls,cz+z]};
  /* sample points: every .14 along the string, plus every corner, so the wire turns exactly at the corners */
  const S=[];for(let s=0;s<=Ls;s+=.14)S.push(s);S.push(Ls);
  for(let t=-1;t<=turns+1;t++)[0,pw,pw+pd,2*pw+pd].forEach(c=>{const s=c-o+t*per;if(s>0&&s<Ls)S.push(s)});
  S.sort((a,b)=>a-b);
  let prev=null;S.forEach(s=>{const q=at(s);if(prev)wire(prev[0],prev[1],prev[2],q[0],q[1],q[2]);prev=q});
  const n=Math.max(3,Math.round(Ls/.42));
  for(let i=0;i<n;i++){const s=(i+.5)/n*Ls,q=at(s);bulb(q[0],q[1]-.05,q[2],s*1.3,i&3)}}/* hang just under the wire, still touching the foliage */
 const bulbMeshes=[];
 function flushLights(){
  if(!lt.bp.length&&!lt.wp.length)return;
  if(lt.bp.length){
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(lt.bp,3));g.setAttribute('ph',new THREE.Float32BufferAttribute(lt.bph,1));g.setAttribute('ci',new THREE.Float32BufferAttribute(lt.bci,1));g.setAttribute('sh',new THREE.Float32BufferAttribute(lt.bsh,1));
   const m=new THREE.ShaderMaterial({uniforms:{t:BU.t,pal:{value:LC.map(c=>new THREE.Vector3(c[0],c[1],c[2]))}},
    vertexShader:`attribute float ph,ci,sh;uniform float t;varying float vb,vc,vs;
     void main(){float w=.5+.5*sin(t*3.4-ph*1.9);vb=.45+.55*w*w;vc=ci;vs=sh;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform vec3 pal[4];varying float vb,vc,vs;
     void main(){int k=int(vc+.5);vec3 c=k==0?pal[0]:k==1?pal[1]:k==2?pal[2]:pal[3];gl_FragColor=vec4(c*vs*(.6+.8*vb)+vec3(.25)*vb*vs*vs,1.);}`});
   const M=new THREE.Mesh(g,m);M.frustumCulled=false;M.userData.xm=1;scene.add(M);bulbMeshes.push(M)}
  if(lt.wp.length){
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(lt.wp,3));
   const W2=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x10281a}));W2.frustumCulled=false;W2.userData.xm=1;scene.add(W2);bulbMeshes.push(W2)}
  lt.bp=[];lt.bph=[];lt.bci=[];lt.bsh=[];lt.wp=[]}

 /* the merged SB boxes are 12 vertices each (+x, +y, +z faces): read each box back to put lights on the trees.
    Anything that is not really a plain box (other merged meshes can share the material) is skipped. */
 function isBox(pos,nor,v){
  for(let k=0;k<12;k++){const f=(k/4)|0,nx=nor.getX(v+k),ny=nor.getY(v+k),nz=nor.getZ(v+k);
   if(f==0?!(nx>.9):f==1?!(ny>.9):!(nz>.9))return false}
  const x=pos.getX(v);for(let k=1;k<4;k++)if(Math.abs(pos.getX(v+k)-x)>1e-4)return false;
  const y=pos.getY(v+4);for(let k=5;k<8;k++)if(Math.abs(pos.getY(v+k)-y)>1e-4)return false;
  const z=pos.getZ(v+8);for(let k=9;k<12;k++)if(Math.abs(pos.getZ(v+k)-z)>1e-4)return false;
  return true}
 function treeLights(geo){
  const pos=geo.attributes.position,col=geo.attributes.color,nor=geo.attributes.normal;if(!pos||!col||!nor||pos.count%12)return;
  for(let v=0;v<pos.count;v+=12){
   if(!isBox(pos,nor,v))continue;
   let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
   for(let k=0;k<12;k++){const x=pos.getX(v+k),y=pos.getY(v+k),z=pos.getZ(v+k);if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z}
   const w=x1-x0,h=y1-y0,d=z1-z0,cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2;
   if(!outdoorXZ(cx,cz)||inHome(cx,cz)||w<.6||w>5||d<.6||d>5||h<.45||h>2.6||cy<.9)continue;
   const r=col.getX(v),g=col.getY(v),b=col.getZ(v);if(!(g>r*1.12&&g>b*1.3))continue;
   addString(cx,cy,cz,w,h,d)}}

 /* ---------- hook the world flush: patch the shader + tree lights on every new merged mesh ---------- */
 if(typeof flushSB=='function'){const f0=flushSB;flushSB=function(){
  const before=new Set(scene.children);f0();
  try{scene.children.forEach(o=>{if(before.has(o)||!o.isMesh||o.isInstancedMesh||!o.geometry)return;
    if(o.material===SBM)treeLights(o.geometry);else if(o.geometry.attributes&&o.geometry.attributes.normal)patchMat(o.material)});flushLights()}catch(e){console.warn('xmas flush',e)}}}

 /* ---------- houses: roof-edge lights, door wreath, snowmen ---------- */
 if(typeof house=='function'){const h0=house;house=function(cx,zf,w,d,h,wl,rf){
  h0.apply(this,arguments);
  try{const y=h+.1,z=zf+.28,xa=cx-w/2-.2,xb=cx+w/2+.2;wire(xa,y+.07,z,xb,y+.07,z);let i=0;for(let x=xa+.15;x<=xb;x+=.45,i++)bulb(x,y,z,i*.9,i&3);
   SB(.7,.7,.1,'#2a7a36',cx,1.3,zf+.12);SB(.22,.2,.12,'#c0392b',cx,1.02,zf+.17);
   if(Math.random()<.4){const sx=cx+w/2+1.3,sz=zf+1.1;
    SB(.9,.8,.9,'#f6f9fc',sx,.4,sz);SB(.7,.65,.7,'#f6f9fc',sx,1.1,sz);SB(.5,.5,.5,'#f6f9fc',sx,1.65,sz);
    SB(.14,.1,.3,'#ff8a30',sx,1.65,sz+.35);SB(.1,.1,.06,'#222',sx-.12,1.75,sz+.26);SB(.1,.1,.06,'#222',sx+.12,1.75,sz+.26);
    SB(.6,.05,.6,'#222',sx,1.93,sz);SB(.4,.3,.4,'#222',sx,2.1,sz);SB(.52,.06,.52,'#c0392b',sx,1.97,sz)}
  }catch(e){}}}

 /* ---------- NPCs in winter clothes (the player's own look, ch, is never touched) ---------- */
 if(typeof buildChar=='function'){const b0=buildChar;buildChar=function(c){
  if(!c||(typeof ch!='undefined'&&c===ch))return b0.apply(this,arguments);
  const cc=(c.jk>=0)?c:Object.assign({},c,{jk:RI(0,7),jks:RI(0,3)}),o=b0.call(this,cc);
  try{const g=o.g,hd=g.children.find(q=>q.isGroup&&Math.abs(q.position.y-1.4)<.02);
   if(hd&&!c.xmx){const r=Math.random(),red=pk(['#c0392b','#2f6fb5','#3f8f5a','#e6b422','#8e44ad','#e8e8ec']);
    if(r<.18){B(hd,.64,.2,.64,'#c0392b',0,.36,0);B(hd,.66,.1,.66,'#f6f6f6',0,.28,0);B(hd,.4,.2,.4,'#c0392b',.05,.52,-.05);B(hd,.14,.14,.14,'#f6f6f6',.12,.64,-.1)}
    else if(r<.8){B(hd,.64,.16,.64,red,0,.36,0);B(hd,.66,.09,.66,'#f6f6f6',0,.29,0);B(hd,.16,.16,.16,'#f6f6f6',0,.5,0)}
    if(Math.random()<.55){const sc=pk(['#c0392b','#f6f6f6','#2f6fb5','#3f8f5a']);B(g,.62,.14,.5,sc,0,1.15,0);B(g,.14,.4,.1,sc,.18,.95,.27)}}
  }catch(e){}
  return o}}

 /* ---------- weather: fog and snow only ---------- */
 const W=typeof WTHR=='object'?WTHR:null;
 if(W){
  W.kinds.snow={n:'Snow',dim:.8,amb:.96,grey:.2,rain:0,fog:.16};
  wxRoll=function(){const r=Math.random();return r<.25?'sun':r<.85?'snow':'fog'};
  wxToday=function(){
   if(!S.wx||S.wx.d!==S.day)S.wx={d:S.day,k:S.day<=1?'sun':wxRoll()};
   if(S.wx.k=='rain'||S.wx.k=='storm')S.wx.k='snow';
   const k=S.wx.k;
   if(!S.wx.said&&k!='sun'&&mode=='play'){S.wx.said=1;setTimeout(()=>{try{say(k=='snow'?'It is snowing today.':'A thick fog has rolled in today.')}catch(e){}},1500)}
   return W.kinds[k]||W.kinds.sun}
 }
 /* falling snow: points animated on the GPU, with the same "none inside the house" cut-out as the rain */
 let sMesh=null;const SZ=60,SH=22;
 function snowMesh(){const N=2600,p=new Float32Array(N*3),s=new Float32Array(N);
  for(let i=0;i<N;i++){p.set([Math.random()*SZ,Math.random(),Math.random()*SZ],i*3);s[i]=Math.random()*6.28}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('s',new THREE.BufferAttribute(s,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
   uniforms:{c:{value:new THREE.Vector3()},t:{value:0},hr:{value:new THREE.Vector4()},hin:{value:0},op:{value:.95},sz:{value:2}},
   vertexShader:`uniform vec3 c;uniform float t,sz;attribute float s;varying vec3 wp;varying float fl;
    void main(){vec3 p=position;float S=${SZ.toFixed(1)},H=${SH.toFixed(1)};
     float x=p.x+floor((c.x-p.x)/S+.5)*S+sin(t*.7+s)*.7,z=p.z+floor((c.z-p.z)/S+.5)*S+cos(t*.55+s*1.3)*.7;
     float y=mod(p.y*H-t*(1.1+fract(s)*.9),H)-.6;wp=vec3(x,y,z);fl=fract(s*3.1);
     gl_PointSize=sz*(.7+fl*.7);gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,
   fragmentShader:`uniform vec4 hr;uniform float hin,op;varying vec3 wp;varying float fl;
    bool inH(vec2 q){return q.x>hr.x&&q.x<hr.z&&q.y>hr.y&&q.y<hr.w;}
    void main(){if(wp.y<0.)discard;if(inH(wp.xz)&&(hin>.5||wp.y<3.7))discard;if(hin>.5&&inH(wp.xz-vec2(wp.y*${(16/13).toFixed(4)})))discard;gl_FragColor=vec4(.96,.98,1.,op);}`});
  const L=new THREE.Points(g,m);L.frustumCulled=false;L.renderOrder=6;L.visible=false;scene.add(L);return L}

 /* ---------- footprints and tyre tracks in the snow: each print slowly fades back into the snow over 10 s ---------- */
 const FADE=10,FPC=new THREE.Color(),FP_DARK=new THREE.Color('#7f8da0'),TR_DARK=new THREE.Color('#6a7789'),FPD=new THREE.Object3D();
 function mkPrints(N,w,l,dark){return{N,w,l,dark,mesh:null,i:0,age:null}}
 const FP=mkPrints(700,.13,.26,FP_DARK),TR=mkPrints(1400,.24,.95,TR_DARK);
 let fpMesh=null;/* kept for the visibility switch below */
 function prInit(K){
  const g=new THREE.BoxGeometry(K.w,.02,K.l),m=new THREE.MeshLambertMaterial({color:0xffffff});
  K.mesh=new THREE.InstancedMesh(g,m,K.N);K.age=new Float32Array(K.N).fill(-1);K.mesh.frustumCulled=false;K.mesh.userData.xm=1;
  FPD.position.set(0,-50,0);FPD.rotation.set(0,0,0);FPD.updateMatrix();
  for(let i=0;i<K.N;i++){K.mesh.setMatrixAt(i,FPD.matrix);K.mesh.setColorAt(i,SNOW)}
  scene.add(K.mesh);if(K===FP)fpMesh=K.mesh}
 function prStamp(K,x,z,rot,y){
  if(!K.mesh)prInit(K);
  FPD.position.set(x,y||.05,z);FPD.rotation.set(0,rot,0);FPD.updateMatrix();K.mesh.setMatrixAt(K.i,FPD.matrix);K.age[K.i]=0;K.mesh.setColorAt(K.i,K.dark);
  K.i=(K.i+1)%K.N;K.mesh.instanceMatrix.needsUpdate=true;K.mesh.instanceColor.needsUpdate=true}
 function prFade(K,dt){if(!K.mesh)return;let c=0,mv=0;
  for(let i=0;i<K.N;i++){if(K.age[i]<0)continue;K.age[i]+=dt;let a=Math.min(1,K.age[i]/FADE);a=a*a*(3-2*a);/* slow at the start and the end */
   FPC.copy(K.dark).lerp(SNOW,a);K.mesh.setColorAt(i,FPC);c=1;
   if(K.age[i]>=FADE){K.age[i]=-1;FPD.position.set(0,-50,0);FPD.updateMatrix();K.mesh.setMatrixAt(i,FPD.matrix);mv=1}}
  if(c)K.mesh.instanceColor.needsUpdate=true;if(mv)K.mesh.instanceMatrix.needsUpdate=true}
 function prClear(K){if(!K.mesh)return;K.i=0;K.age.fill(-1);FPD.position.set(0,-50,0);FPD.updateMatrix();for(let i=0;i<K.N;i++)K.mesh.setMatrixAt(i,FPD.matrix);K.mesh.instanceMatrix.needsUpdate=true}
 function stamp(x,z,rot,side){prStamp(FP,x+Math.cos(rot)*.1*side,z-Math.sin(rot)*.1*side,rot)}
 function walker(o,x,z){/* o keeps its last print; a print is laid every .55 m of walking */
  const l=o._xp;if(!l){o._xp=[x,z,1];return}
  const dx=x-l[0],dz=z-l[1],d=Math.hypot(dx,dz);if(d>3){o._xp=[x,z,l[2]];return}
  if(d>.55){l[2]=-l[2];stamp(x,z,Math.atan2(dx,dz),l[2]);l[0]=x;l[1]=z}}
 function roller(o,x,z){/* a car: two tyre tracks (left and right wheels), one pair every .8 m */
  const l=o._xt;if(!l){o._xt=[x,z];return}
  const dx=x-l[0],dz=z-l[1],d=Math.hypot(dx,dz);if(d>6){o._xt=[x,z];return}
  if(d>.8){const r=Math.atan2(dx,dz),cx=Math.cos(r)*.78,cz=-Math.sin(r)*.78,mx=(x+l[0])/2,mz=(z+l[1])/2;
   prStamp(TR,mx+cx,mz+cz,r,.045);prStamp(TR,mx-cx,mz-cz,r,.045);l[0]=x;l[1]=z}}
 let fpT=0;
 function fpTick(dt,live,inner){
  const vis=SNOWU.value>.4;[FP,TR].forEach(K=>{if(K.mesh)K.mesh.visible=vis});
  fpT+=dt;if(fpT>.1){[FP,TR].forEach(K=>prFade(K,fpT));fpT=0}
  if(!(vis&&live&&!inner))return;
  if(mode=='play'&&!IN&&!(typeof HIN!='undefined'&&HIN)&&!P.sit&&!inHome(P.x,P.z))walker(P,P.x,P.z);
  [NPC,typeof VPED!='undefined'?VPED:[]].forEach(L=>L.forEach(n=>{const m=n.m;if(!m||!m.visible)return;
   const x=m.position.x,z=m.position.z;if(Math.abs(x-P.x)>24||Math.abs(z-P.z)>24||inHome(x,z))return;walker(n,x,z)}));
  /* your car, and traffic near you */
  if(mode=='drive'&&dr&&isFinite(dr.x)&&outdoorXZ(dr.x,dr.z))roller(dr,dr.x,dr.z);
  if(typeof TRAF!='undefined')TRAF.forEach(c=>{const m=c.m;if(!m||!m.visible||m.position.y>.6)return;const x=m.position.x,z=m.position.z;
   if(Math.abs(x-P.x)>40||Math.abs(z-P.z)>40||!outdoorXZ(x,z))return;roller(c,x,z)})}

 /* ---------- B-built boxes (ground, trees, fences ...) can't use the vertex shader: swap their materials ---------- */
 const bset=[];let bOn=false;
 function bApply(on){bOn=on;bset.forEach(e=>{e.o.material=on?e.sn:e.orig});
  if(lawn){try{const k=lawn.cv.getContext('2d');if(on){/* a dusting over the grass: blades still show through */const W2=lawn.cv.width,H2=lawn.cv.height;k.putImageData(lawn.orig,0,0);k.globalAlpha=.55;k.fillStyle='#f1f5fa';k.fillRect(0,0,W2,H2);k.globalAlpha=1;for(let i=0;i<W2*H2/6;i++)k.fillRect(RI(0,W2-1),RI(0,H2-1),RI(1,3),1)}else k.putImageData(lawn.orig,0,0);lawn.map.needsUpdate=true}catch(e){}}}
 let lawn=null;const topM=new THREE.MeshLambertMaterial({color:'#eef3f8'}),sideCache={};
 function sweepWorld(){
  scene.children.forEach(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.normal&&o.material&&!Array.isArray(o.material))patchMat(o.material)});
  const g=typeof WORLD!='undefined'?WORLD:null;if(!g)return;let added=0;
  g.traverse(o=>{
   if(!o.isMesh||o.userData.xm||o.isInstancedMesh)return;o.userData.xm=1;
   const gm=o.geometry,m=o.material;
   if(gm&&gm.attributes&&gm.attributes.color&&gm.attributes.normal){patchMat(m);return}
   if(!gm||gm.type!=='BoxGeometry'||Array.isArray(m)||!m||m.type!=='MeshLambertMaterial'||m.transparent||m.opacity<1)return;
   const p=gm.parameters,x=o.position.x,z=o.position.z;if(!outdoorXZ(x,z)||inHome(x,z))return;
   const c=m.color;
   if(p.width>=200&&p.depth>=200&&m.map){try{const cv=m.map.image;lawn={cv,map:m.map,orig:cv.getContext('2d').getImageData(0,0,cv.width,cv.height)}}catch(e){}return}
   if(c.b-c.r>.4){const ic=m.clone();ic.color.lerp(ICE,.55);o.material=ic;return}/* frozen all winter */
   const w=p.width*o.scale.x,h=p.height*o.scale.y,d=p.depth*o.scale.z,cy=o.position.y,foliage=c.g>c.r*1.12&&c.g>c.b*1.3;
   if(foliage&&w>=.6&&w<=5&&d>=.6&&d<=5&&h>=.45&&h<=2.6&&cy>=.9){addString(x,cy,z,w,h,d);added++}
   if(p.height<=.3&&foliage){const sm=m.clone();sm.color.lerp(SNOW,.6);bset.push({o,orig:m,sn:sm});if(bOn)o.material=sm;return}/* thin grass-coloured patches */
   if(o.position.y-p.height/2>.01||p.height>=.3){let sm=m;if(foliage&&cy>.9){const k=c.getHexString();sm=sideCache[k]||(sideCache[k]=(()=>{const q=m.clone();q.color.lerp(SNOW,.42);return q})())}
    const arr=[sm,sm,topM,sm,sm,sm];bset.push({o,orig:m,sn:arr});if(bOn)o.material=arr}});
  if(added||lt.bp.length)flushLights();if(bOn&&lawn)bApply(true)}

 /* ---------- the park pond: frozen all winter, and you can glide on it ---------- */
 let iceDone=false,gv=[0,0],onIce=false;
 function freezePond(){
  if(iceDone||typeof CPARK=='undefined'||!CPARK.on||!CPARK.water)return;iceDone=true;
  try{const cv=CPARK.water.image,k=cv.getContext('2d');k.fillStyle='#b9dff0';k.fillRect(0,0,32,32);k.fillStyle='#d8eff8';for(let i=0;i<10;i++)k.fillRect(RI(0,28),RI(0,31),RI(3,8),1);
   k.fillStyle='#eef9fd';for(let i=0;i<6;i++)k.fillRect(RI(0,29),RI(0,31),RI(2,4),1);k.fillStyle='#93bfd6';for(let i=0;i<5;i++){const x=RI(0,28),y=RI(0,30);k.fillRect(x,y,RI(2,5),1);k.fillRect(x+2,y+1,1,RI(1,3))}
   CPARK.water.needsUpdate=true}catch(e){}
  /* take out the pond's collider slices (the wide, thin ones) so it can be walked on */
  try{const b=LK,xa=b[0]-1,za=b[1]-1,xb=b[2]+1,zb=b[3]+1;
   for(let i=cols.length-1;i>=0;i--){const c=cols[i];if(c[0]>=xa&&c[2]<=xb&&c[1]>=za&&c[3]<=zb&&c[3]-c[1]<=1.55&&c[2]-c[0]>=2.5)cols.splice(i,1)}}catch(e){}}
 const iceAt=(x,z)=>{const b=LK,cx=(b[0]+b[2])/2,cz=(b[1]+b[3])/2,a=(b[2]-b[0])/2,c=(b[3]-b[1])/2;return a>1&&c>1&&((x-cx)/a)**2+((z-cz)/c)**2<.72};
 function glide(px,pz,dt){
  if(mode!='play'||IN||P.sit){onIce=false;return}
  const was=onIce;onIce=iceAt(P.x,P.z);if(!onIce)return;
  const dx=P.x-px,dz=P.z-pz,inp=Math.hypot(dx,dz)>1e-5;
  if(!was){gv=[dx/dt,dz/dt]}
  else if(inp){const k=Math.min(1,dt*1.3);gv[0]+=(dx/dt-gv[0])*k;gv[1]+=(dz/dt-gv[1])*k}
  else{const f=Math.exp(-.55*dt);gv[0]*=f;gv[1]*=f}
  const sp=Math.hypot(gv[0],gv[1]),mx=7;if(sp>mx){gv[0]*=mx/sp;gv[1]*=mx/sp}
  let nx=px+gv[0]*dt,nz=pz+gv[1]*dt;
  if(hit(nx,pz,.28)){gv[0]*=-.2;nx=px}if(hit(nx,nz,.28)){gv[1]*=-.2;nz=pz}
  P.x=nx;P.z=nz;if(sp>.4)P.rot=Math.atan2(gv[0],gv[1]);
  if(P.mesh){P.mesh.position.x=P.x;P.mesh.position.z=P.z;P.mesh.rotation.y=P.rot}}

 /* ---------- per-frame ---------- */
 const WSKY=new THREE.Color(0xc9d8e6),WAMB=new THREE.Color(0xe4ecff);
 let sweepT=0,first=true,sT=0;
 function xmasTick(dt,px,pz){
  sweepT+=dt;if(first||sweepT>2){if(first)try{plazaTree()}catch(e){console.warn('xmas tree',e)}first=false;sweepT=0;try{sweepWorld()}catch(e){console.warn('xmas sweep',e)}try{freezePond()}catch(e){}}
  const live=mode=='play'||mode=='drive'||mode=='rec'||mode=='pc'||mode=='build'||mode=='cut',inner=(typeof wxInterior=='function')&&wxInterior();
  /* snow cover follows today's weather */
  const want=!!(S.wx&&S.wx.k=='snow'&&S.wx.d===S.day&&live)?1:0;
  if(want!==snowTarget){snowTarget=want;if(want&&!bOn||!want&&bOn){bApply(!!want);if(!want){prClear(FP);prClear(TR)}}}
  SNOWU.value+=(snowTarget-SNOWU.value)*Math.min(1,dt*1.2);if(Math.abs(snowTarget-SNOWU.value)<.01)SNOWU.value=snowTarget;
  sT+=dt;BU.t.value=sT;
  /* the pond's water jet is switched off while the pond is frozen */
  try{if(typeof FTX!='undefined'){const b=LK,near=(x,z)=>x>b[0]-16&&x<b[2]+16&&z>b[1]-16&&z<b[3]+16;
   FTX.L.forEach(F=>{if(!near(F.x,F.z))return;F.ps.forEach(q=>{q.pts.visible=false});if(F.foam)F.foam.visible=false});
   if(first||sweepT===0)scene.children.forEach(o=>{if(o.isMesh&&o.material===FTWM&&near(o.position.x,o.position.z))o.visible=false})}}catch(e){}
  if(CPARK&&CPARK.ducks){CPARK.ducks.im.visible=CPARK.ducks.iw.visible=false}/* the ducks are away for the winter */
  glide(px,pz,dt);
  fpTick(dt,live,inner);
  if(!live||inner)return;
  /* winter light outdoors */
  const outdoors=!(typeof HIN!='undefined'&&HIN),dayk=1-(S.t<240?0:S.t<300?(S.t-240)/60*.5:S.t<330?.5+(S.t-300)/30*.4:.9);
  if(outdoors){amb.color.lerp(WAMB,.1+.1*SNOWU.value);scene.background.lerp(WSKY,(.2+.35*SNOWU.value)*dayk)}
  /* snowfall */
  const snow=S.wx&&S.wx.k=='snow'&&W;
  if(snow&&!sMesh)sMesh=snowMesh();
  if(sMesh){sMesh.visible=!!snow;if(snow){const u=sMesh.material.uniforms,hr=wxHouse();u.c.value.set(camT.x,0,camT.z);u.t.value=(u.t.value+dt)%5000;u.hr.value.set(hr[0],hr[1],hr[2],hr[3]);u.hin.value=(typeof HIN!='undefined'&&HIN||mode=='build')?1:0}}
 }
 {const u0=update;update=function(dt){const px=P.x,pz=P.z;u0(dt);try{xmasTick(dt,px,pz)}catch(e){if(!xmasTick.err){xmasTick.err=1;console.warn('xmas tick',e)}}}}

 /* ---------- a big decorated tree in the City Plaza (built once, after the world exists) ---------- */
 function plazaTree(){
  const pp=POIS.find(q=>q[2]=='City Plaza');if(!pp||typeof WORLD=='undefined')return;
  const x=pp[0]-8,z=pp[1]-6,G=WORLD,s=1.35,mk=(w,h,d,c,px,py,pz)=>{const m=B(G,w,h,d,c,px,py,pz);m.userData.xm=1;return m};
  mk(.9*s,1.2*s,.9*s,'#6b4a2e',x,.6*s,z);
  [[4.4,1.5],[3.6,2.5],[2.8,3.5],[2,4.5],[1.2,5.5]].forEach((l,i)=>{mk(l[0]*s,1.1*s,l[0]*s,i%2?'#1f6b34':'#2a7d3e',x,l[1]*s+.3,z);addString(x,l[1]*s+.3,z,l[0]*s,1.1*s,l[0]*s)});
  mk(.55,.55,.55,'#ffd23f',x,6.55*s+.3,z);mk(.3,.3,.3,'#fff6b0',x,6.55*s+.8,z);
  for(let i=0;i<16;i++){const y=R(1.7,5.2)*s,r=Math.max(.3,(6.4*s-y)*.24)+.12,a=R(0,6.28);mk(.32,.32,.32,pk(['#e8e8ec','#e6b422','#c0392b']),x+Math.cos(a)*r,y+.3,z+Math.sin(a)*r)}
  [[1.8,.2,'#c0392b'],[-1.7,1,'#2f6fb5'],[.5,-1.9,'#e6b422'],[-.5,2,'#3f8f5a'],[1.9,-1.2,'#8e44ad']].forEach(q=>{mk(.7,.6,.7,q[2],x+q[0]*s,.3,z+q[1]*s);mk(.72,.1,.18,'#f6f6f6',x+q[0]*s,.62,z+q[1]*s)});
  try{col(x-1.4,z-1.4,x+1.4,z+1.4)}catch(e){}
  flushLights()}
})();
