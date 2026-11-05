/* WaveFern dev: CHRISTMAS EVENT (limited time). Only loaded on /dev/, and it runs BEFORE the boot script so the world is
   built already dressed. It is one self-contained module and changes none of the original files.

   TO REVERT TO THE ORIGINAL MAP, NPCs AND WEATHER: set XMAS=false on the next line (or remove this file's script tag from
   dev/index.html). Add ?noxmas to the address to see the original for one visit without changing anything.

   What it does when on:
   - Weather: only Fog and a new Snow. Rain and thunderstorms never happen (an old rain/storm day turns into snow).
     Snow is falling flakes, soft haze, a cool white light and a pale winter sky. Sunny days still happen, they are just not weather.
   - Snow lies on every upward-facing surface outdoors: roads, pavements, grass, roofs, tree tops, cars, benches.
     The big ground is white and the lake is frozen. Houses and the player's own home interior are left alone.
   - Trees (street, hedges, park) wear twinkling Christmas lights in four colours that chase each other. Houses get roof-edge
     lights, a door wreath, and some have a snowman out front. A big decorated Christmas tree stands in the City Plaza.
   - NPCs wear winter jackets, beanies or Santa hats and scarves. The player's own look is never touched.
   Everything is added on top (recoloured vertex colours, extra meshes, wrapped functions); no save data is changed. */
(function(){
 const XMAS=true;
 if(!window.FW_DEV||!XMAS)return;
 if(/[?&]noxmas/.test(location.search))return;
 window.FW_XMAS=1;
 const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),pk=a=>a[Math.floor(Math.random()*a.length)];
 const SNOW=new THREE.Color('#f1f5fa'),ROADSNOW=new THREE.Color('#cdd5de'),ICE=new THREE.Color('#bfe0f0'),tmp=new THREE.Color();
 const outdoorXZ=(x,z)=>z<260&&x<880;
 /* the player's own home (and its extension) is left as it was */
 const inHome=(x,z)=>x>-.7&&x<16.7&&z>-30&&z<12.8;

 /* ---------- snow on top faces of vertex-coloured geometry ---------- */
 const lightList={r:[],a:[],b:[],g:[]},LC={r:'#ff3b30',a:'#ffc233',b:'#3b8bff',g:'#38e07a'},LK=Object.keys(LC);
 function snowGeo(geo,mesh){
  if(!geo||geo.userData.xm)return;geo.userData.xm=1;
  const pos=geo.attributes.position,nor=geo.attributes.normal,col=geo.attributes.color;if(!pos||!nor||!col||col.itemSize<3)return;
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i)+mesh.position.x,z=pos.getZ(i)+mesh.position.z;if(!outdoorXZ(x,z)||inHome(x,z))continue;
   if(nor.getY(i)<.5)continue;
   const r=col.getX(i),g=col.getY(i),b=col.getZ(i);
   if(b-r>.4){tmp.copy(ICE);col.setXYZ(i,r+(tmp.r-r)*.55,g+(tmp.g-g)*.55,b+(tmp.b-b)*.55);continue}/* water freezes */
   const dark=Math.max(r,g,b)<.34&&Math.max(r,g,b)-Math.min(r,g,b)<.1,T=dark?ROADSNOW:SNOW,k=dark?.88:.9;
   col.setXYZ(i,r+(T.r-r)*k,g+(T.g-g)*k,b+(T.b-b)*k)}
  col.needsUpdate=true}
 /* the merged SB boxes are 12 vertices each (+x, +y, +z faces): read each box back to put lights on the trees */
 function treeLights(geo){
  const pos=geo.attributes.position,col=geo.attributes.color;if(!pos||!col||pos.count%12)return;
  for(let v=0;v<pos.count;v+=12){
   let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
   for(let k=0;k<12;k++){const x=pos.getX(v+k),y=pos.getY(v+k),z=pos.getZ(v+k);if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z}
   const w=x1-x0,h=y1-y0,d=z1-z0,cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2;
   if(!outdoorXZ(cx,cz)||inHome(cx,cz)||w<.6||w>5||d<.6||d>5||h<.45||h>2.6||cy<.9)continue;
   /* colour was already snowed on top faces only; the +x face (vertices 0-3) still shows the original foliage green */
   const r=col.getX(v),g=col.getY(v),b=col.getZ(v);if(!(g>r*1.12&&g>b*1.3))continue;
   const n=Math.min(8,Math.max(3,Math.round(w*h*3)));
   for(let i=0;i<n;i++){const f=RI(0,3),t=R(-.45,.45),u=R(-.4,.4);
    const x=f<2?cx+(f?1:-1)*(w/2+.04):cx+t*w,z=f<2?cz+t*d:cz+(f&1?1:-1)*(d/2+.04);
    lightList[pk(LK)].push(x,cy+u*h,z)}}}
 /* instanced bulbs, one mesh per colour so each colour can twinkle on its own */
 const bulbs=[],bulbGeo=new THREE.BoxGeometry(.17,.17,.17);
 function flushLights(){
  LK.forEach(k=>{const L=lightList[k];if(!L.length)return;const n=L.length/3,m=new THREE.MeshBasicMaterial({color:LC[k]}),im=new THREE.InstancedMesh(bulbGeo,m,n),M=new THREE.Matrix4();
   for(let i=0;i<n;i++){M.makeTranslation(L[i*3],L[i*3+1],L[i*3+2]);im.setMatrixAt(i,M)}
   im.frustumCulled=false;im.userData.xm=1;scene.add(im);bulbs.push({m,base:new THREE.Color(LC[k]),ph:LK.indexOf(k)*1.57});lightList[k]=[]})}

 /* ---------- hook the world flush: snow + tree lights on every new merged mesh ---------- */
 if(typeof flushSB=='function'){const f0=flushSB;flushSB=function(){
  const before=new Set(scene.children);f0();
  try{scene.children.forEach(o=>{if(before.has(o)||!o.isMesh||o.isInstancedMesh||!o.geometry)return;
    if(o.material===SBM)treeLights(o.geometry);snowGeo(o.geometry,o)});flushLights()}catch(e){console.warn('xmas flush',e)}}}

 /* ---------- houses: roof-edge lights, door wreath, snowmen ---------- */
 if(typeof house=='function'){const h0=house;house=function(cx,zf,w,d,h,wl,rf){
  h0.apply(this,arguments);
  try{const y=h+.08,z=zf+.3;let i=0;for(let x=cx-w/2-.15;x<=cx+w/2+.2;x+=.55,i++)lightList[LK[i%4]].push(x,y,z);
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
 let sMesh=null,sT=0;const SZ=60,SH=22;
 function snowMesh(){const N=2600,p=new Float32Array(N*3),s=new Float32Array(N);
  for(let i=0;i<N;i++){p.set([Math.random()*SZ,Math.random(),Math.random()*SZ],i*3);s[i]=Math.random()*6.28}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('s',new THREE.BufferAttribute(s,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
   uniforms:{c:{value:new THREE.Vector3()},t:{value:0},hr:{value:new THREE.Vector4()},hin:{value:0},op:{value:.95},sz:{value:3}},
   vertexShader:`uniform vec3 c;uniform float t,sz;attribute float s;varying vec3 wp;varying float fl;
    void main(){vec3 p=position;float S=${SZ.toFixed(1)},H=${SH.toFixed(1)};
     float x=p.x+floor((c.x-p.x)/S+.5)*S+sin(t*.7+s)*.7,z=p.z+floor((c.z-p.z)/S+.5)*S+cos(t*.55+s*1.3)*.7;
     float y=mod(p.y*H-t*(1.1+fract(s)*.9),H)-.6;wp=vec3(x,y,z);fl=fract(s*3.1);
     gl_PointSize=sz*(.7+fl*.7);gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,
   fragmentShader:`uniform vec4 hr;uniform float hin,op;varying vec3 wp;varying float fl;
    bool inH(vec2 q){return q.x>hr.x&&q.x<hr.z&&q.y>hr.y&&q.y<hr.w;}
    void main(){if(wp.y<0.)discard;if(inH(wp.xz)&&(hin>.5||wp.y<3.7))discard;if(hin>.5&&inH(wp.xz-vec2(wp.y*${(16/13).toFixed(4)})))discard;gl_FragColor=vec4(.96,.98,1.,op);}`});
  const L=new THREE.Points(g,m);L.frustumCulled=false;L.renderOrder=6;L.visible=false;scene.add(L);return L}

 /* ---------- per-frame: snowfall, light twinkle, winter light, late sweeps ---------- */
 const WSKY=new THREE.Color(0xc9d8e6),WAMB=new THREE.Color(0xe4ecff);
 let sweepT=0,first=true;
 function sweepWorld(){
  const g=typeof WORLD!='undefined'?WORLD:null;
  const snowM=sweepWorld.m||(sweepWorld.m=new THREE.MeshLambertMaterial({color:'#eef3f8'}));
  scene.children.forEach(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.color&&o.geometry.attributes.normal)snowGeo(o.geometry,o)});
  if(!g)return;
  g.traverse(o=>{
   if(!o.isMesh||o.userData.xm||o.isInstancedMesh)return;o.userData.xm=1;
   const gm=o.geometry,m=o.material;
   if(gm&&gm.attributes&&gm.attributes.color&&gm.attributes.normal){snowGeo(gm,o);return}
   if(!gm||gm.type!=='BoxGeometry'||Array.isArray(m)||!m||m.type!=='MeshLambertMaterial'||m.transparent||m.opacity<1)return;
   const p=gm.parameters,x=o.position.x,z=o.position.z;if(!outdoorXZ(x,z)||inHome(x,z))return;
   const c=m.color;
   if(p.width>=200&&p.depth>=200&&m.map){/* the big lawn */
    const cv=m.map.image;try{const k=cv.getContext('2d');k.fillStyle='#f1f5fa';k.fillRect(0,0,16,16);k.fillStyle='#dfe8f1';for(let i=0;i<16;i+=4)k.fillRect(0,i,16,1);for(let i=0;i<12;i++)k.fillRect(RI(0,15),RI(0,15),2,1);m.map.needsUpdate=true}catch(e){}return}
   if(c.b-c.r>.4){c.lerp(ICE,.55);return}
   {const w=p.width*o.scale.x,h=p.height*o.scale.y,d=p.depth*o.scale.z,cy=o.position.y;/* foliage built from plain boxes: lights too */
    if(c.g>c.r*1.12&&c.g>c.b*1.3&&w>=.6&&w<=5&&d>=.6&&d<=5&&h>=.45&&h<=2.6&&cy>=.9){const n=Math.min(8,Math.max(3,Math.round(w*h*3)));
     for(let i=0;i<n;i++){const f=RI(0,3),t=R(-.45,.45),u=R(-.4,.4);lightList[pk(LK)].push(f<2?x+(f?1:-1)*(w/2+.04):x+t*w,cy+u*h,f<2?z+t*d:z+(f&1?1:-1)*(d/2+.04))}}}
   if(p.height<=.3&&c.g>c.r*1.05&&c.g>c.b*1.1){c.copy(SNOW);return}/* thin grass-coloured patches */
   if(o.position.y-p.height/2>.01||p.height>=.3){o.material=[m,m,snowM,m,m,m]}});flushLights()}
 let lastSweep=0;
 function xmasTick(dt){
  sweepT+=dt;if(first||sweepT>2){if(first)try{plazaTree()}catch(e){console.warn('xmas tree',e)}first=false;sweepT=0;try{sweepWorld()}catch(e){console.warn('xmas sweep',e)}}
  const live=mode=='play'||mode=='drive'||mode=='rec'||mode=='pc'||mode=='build'||mode=='cut',inner=(typeof wxInterior=='function')&&wxInterior();
  /* bulbs chase and twinkle */
  sT+=dt;bulbs.forEach(b=>{const k=.75+.55*(.5+.5*Math.sin(sT*2.4+b.ph*2));b.m.color.copy(b.base).multiplyScalar(k)});
  if(!live||inner)return;
  /* winter light outdoors */
  const outdoors=!(typeof HIN!='undefined'&&HIN),dayk=1-(S.t<240?0:S.t<300?(S.t-240)/60*.5:S.t<330?.5+(S.t-300)/30*.4:.9);
  if(outdoors){amb.color.lerp(WAMB,.18);scene.background.lerp(WSKY,.55*dayk)}
  /* snowfall */
  const snow=S.wx&&S.wx.k=='snow'&&W;
  if(snow&&!sMesh)sMesh=snowMesh();
  if(sMesh){sMesh.visible=!!snow;if(snow){const u=sMesh.material.uniforms,hr=wxHouse();u.c.value.set(camT.x,0,camT.z);u.t.value=(u.t.value+dt)%5000;u.hr.value.set(hr[0],hr[1],hr[2],hr[3]);u.hin.value=(typeof HIN!='undefined'&&HIN||mode=='build')?1:0;u.sz.value=2}}
 }
 {const u0=update;update=function(dt){u0(dt);try{xmasTick(dt)}catch(e){if(!xmasTick.err){xmasTick.err=1;console.warn('xmas tick',e)}}}}

 /* ---------- a big decorated tree in the City Plaza (built once, after the world exists) ---------- */
 function plazaTree(){
  const pp=POIS.find(q=>q[2]=='City Plaza');if(!pp||!window.WORLD&&typeof WORLD=='undefined')return;
  const x=pp[0]+(window.XTREE_DX!=null?window.XTREE_DX:-8),z=pp[1]+(window.XTREE_DZ!=null?window.XTREE_DZ:-6),G=WORLD,s=1.35,L=[];
  B(G,.9*s,1.2*s,.9*s,'#6b4a2e',x,.6*s,z);
  [[4.4,1.5],[3.6,2.5],[2.8,3.5],[2,4.5],[1.2,5.5]].forEach((l,i)=>B(G,l[0]*s,1.1*s,l[0]*s,i%2?'#1f6b34':'#2a7d3e',x,l[1]*s+.3,z));
  B(G,.55,.55,.55,'#ffd23f',x,6.55*s+.3,z);B(G,.3,.3,.3,'#fff6b0',x,6.55*s+.8,z);
  for(let i=0;i<80;i++){const y=R(1.5,5.8)*s,r=Math.max(.25,(6.4*s-y)*.24),a=R(0,6.28);lightList[LK[i%4]].push(x+Math.cos(a)*r,y+.3,z+Math.sin(a)*r)}
  for(let i=0;i<16;i++){const y=R(1.7,5.2)*s,r=Math.max(.3,(6.4*s-y)*.24)+.12,a=R(0,6.28);B(G,.32,.32,.32,pk(['#e8e8ec','#e6b422','#c0392b']),x+Math.cos(a)*r,y+.3,z+Math.sin(a)*r)}
  [[1.8,.2,'#c0392b'],[-1.7,1,'#2f6fb5'],[.5,-1.9,'#e6b422'],[-.5,2,'#3f8f5a'],[1.9,-1.2,'#8e44ad']].forEach(q=>{B(G,.7,.6,.7,q[2],x+q[0]*s,.3,z+q[1]*s);B(G,.72,.1,.18,'#f6f6f6',x+q[0]*s,.62,z+q[1]*s)});
  try{col(x-1.4,z-1.4,x+1.4,z+1.4)}catch(e){}
  flushLights()}
})();
