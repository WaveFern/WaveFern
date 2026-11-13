/* WaveFern dev: concert crowds are made of real NPC characters, not plain blocks. Only loaded on /dev/.
   Builds a handful of NPC variants with the game's own buildChar (same heads, hair styles, tops, trousers and skin tones the street NPCs use),
   merges each one into a single vertex-coloured mesh, and draws whole crowds of them with instancing. The arms are tagged so a small vertex
   shader can wave them, and the same shader makes people jump on the beat. Costs: 8 variants are built once (a few milliseconds each) and a
   crowd is one instanced mesh per variant per 52 m tile, so the camera only draws the tiles it can see.
   window.FW_NPCX.build(parent, spots, opts) is used by the stadium show (below) and by the main menu stadium scenes (dev-menustage-v1.js).
   Turn it off with ?noxcrowd (concerts go back to the old block fans). */
(function(){
 if(!window.FW_FEAT)return;
 const X=window.FW_NPCX={ready:false,variants:0,tris:0};
 if(/[?&]noxcrowd/.test(location.search))return;
 const NV=8,cache={full:null,lite:null};
 /* flatten a buildChar() figure into one geometry: position, normal, colour, plus aArm (0 body, 1/2 arms) and aPiv (shoulder) for the shader */
 function flat(c,lite){
  const o=buildChar(c),g=o.g;g.scale.set(1,1,1);g.updateMatrixWorld(true);
  const P=[],N=[],C=[],A=[],V=[],bb=new THREE.Box3(),sz=new THREE.Vector3();
  const armOf=m=>{for(let p=m;p&&p!==g;p=p.parent){if(p===o.arms[0])return 1;if(p===o.arms[1])return 2}return 0};
  g.traverse(m=>{
   if(!m.isMesh||!m.geometry||m.geometry.type==='CircleGeometry'||!m.material||!m.material.color)return;
   if(lite){m.geometry.computeBoundingBox();bb.copy(m.geometry.boundingBox);bb.getSize(sz);if(sz.x*sz.y*sz.z*m.scale.x*m.scale.y*m.scale.z<.004)return}
   const gg=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();gg.applyMatrix4(m.matrixWorld);
   const p=gg.attributes.position.array,n=gg.attributes.normal.array,k=m.material.color,arm=armOf(m),pv=arm?o.arms[arm-1].position:null;
   for(let i=0;i<p.length;i+=9){
    /* faces that point straight down are never seen */
    if(n[i+1]<-.99&&n[i+4]<-.99&&n[i+7]<-.99)continue;
    for(let j=0;j<9;j+=3){P.push(p[i+j],p[i+j+1],p[i+j+2]);N.push(n[i+j],n[i+j+1],n[i+j+2]);C.push(k.r,k.g,k.b);A.push(arm);V.push(pv?pv.x:0,pv?pv.y:0,pv?pv.z:0)}}
   gg.dispose()});
  /* v53.4.1: index the figure. Corners that share the same position, normal, colour and arm data are stored once (a box went from 36 corners to 24),
     so the GPU shades about a third fewer vertices per person. The triangles, their order and every attribute value are unchanged. */
  const nv=P.length/3,map=new Map(),ix=[],oP=[],oN=[],oC=[],oA=[],oV=[];
  for(let i=0;i<nv;i++){const j=i*3,key=P[j]+','+P[j+1]+','+P[j+2]+'|'+N[j]+','+N[j+1]+','+N[j+2]+'|'+C[j]+','+C[j+1]+','+C[j+2]+'|'+A[i]+'|'+V[j]+','+V[j+1]+','+V[j+2];
   let k=map.get(key);if(k===undefined){k=oA.length;map.set(key,k);oP.push(P[j],P[j+1],P[j+2]);oN.push(N[j],N[j+1],N[j+2]);oC.push(C[j],C[j+1],C[j+2]);oA.push(A[i]);oV.push(V[j],V[j+1],V[j+2])}ix.push(k)}
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(oP,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(oN,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(oC,3));
  geo.setAttribute('aArm',new THREE.Float32BufferAttribute(oA,1));geo.setAttribute('aPiv',new THREE.Float32BufferAttribute(oV,3));
  geo.setIndex(oA.length<65536?new THREE.Uint16BufferAttribute(ix,1):new THREE.Uint32BufferAttribute(ix,1));
  geo.computeBoundingSphere();return geo}

 function variants(lite){
  const k=lite?'lite':'full';if(cache[k])return cache[k];
  /* the looks are the same for the full and the lite set, so a person keeps their look at any distance */
  let seed=20261106;const rr=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296},ri=(a,b)=>a+Math.floor(rr()*(b-a+1));
  const L=[];for(let i=0;i<NV;i++){
   const c={skin:ri(0,5),eyes:ri(0,4),mouth:ri(0,3),hair:ri(0,11),hc:ri(0,11),top:ri(0,4),tc:ri(0,9),pc:ri(0,7),body:rr()*.6,hgt:.5};
   try{L.push(flat(c,lite))}catch(e){console.warn('npc crowd variant',e)}}
  cache[k]=L;if(!lite){X.variants=L.length;X.tris=L.length?Math.round(L.reduce((a,g)=>a+(g.index?g.index.count:g.attributes.position.count)/3,0)/L.length):0}
  return L}
 X.variantGeos=variants;

 /* material: vertex colours + instancing, arms wave and bodies jump. u = {uT,uAmp,uRate,uHype,uWave} (each {value}) */
 X.uniforms=()=>({uT:{value:0},uAmp:{value:.28},uRate:{value:6.6},uHype:{value:.8},uWave:{value:0}});
 X.material=function(u){
  const m=new THREE.MeshLambertMaterial({vertexColors:true});
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);
   sh.vertexShader=sh.vertexShader.replace('void main() {','attribute float aArm;attribute vec3 aPiv;attribute vec2 aPA;uniform float uT,uAmp,uRate,uHype,uWave;\nvoid main() {')
    .replace('#include <begin_vertex>',`#include <begin_vertex>
#ifdef USE_INSTANCING
 float ph=aPA.x;float wv=0.;
 if(uWave>0.)wv=uWave*max(0.,1.-abs(mod(aPA.y-uT*1.4+3.1416,6.2832)-3.1416)*2.2);
 if(aArm>.5){float up=step(ph*1.15,uHype*.95+.12);float sd=aArm>1.5?1.:-1.;float w=sin(uT*uRate*.5+ph*40.+sd*1.3)*.4+sin(uT*uRate*.25+ph*9.)*.15;
  float a=-(mix(.12,2.65,up)+w*up+wv*.6);vec3 d=transformed-aPiv;float cs=cos(a),sn=sin(a);transformed=aPiv+vec3(d.x,d.y*cs-d.z*sn,d.y*sn+d.z*cs);}
 float jp=0.;if(ph<=uHype*1.2+.08)jp=uAmp*max(0.,sin(uT*uRate+ph*6.2832));transformed.y+=jp+wv*.7;
#endif`)};
  m.customProgramCacheKey=()=>'npcx';m.userData={npcx:1};return m};

 /* build a crowd. spots: [{x,y,z,r,lite?}] (r = the way they face, y = where they stand). Returns a Group of tiled instanced meshes. */
 X.build=function(spots,o){
  o=o||{};const mat=o.material||X.material(o.uniforms||X.uniforms()),F=variants(false),Lt=variants(true),grp=new THREE.Group(),TS=o.tile||52;
  if(!F.length)return grp;
  const tiles={};let seed=(o.seed||7)>>>0;const rr=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  spots.forEach(p=>{const k=Math.floor(p.x/TS)+','+Math.floor(p.z/TS)+','+Math.floor(p.y/12)+(p.lite?'l':'f');(tiles[k]=tiles[k]||[]).push(p)});
  const M=new THREE.Matrix4(),q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),v=new THREE.Vector3(),s=new THREE.Vector3(),col=new THREE.Color();
  Object.keys(tiles).forEach(k=>{
   const T=tiles[k],lite=T[0].lite,set=lite?Lt:F,by=set.map(()=>[]);
   T.forEach(p=>by[Math.floor(rr()*set.length)].push(p));
   let cx=0,cy=0,cz=0;T.forEach(p=>{cx+=p.x;cy+=p.y;cz+=p.z});cx/=T.length;cy/=T.length;cz/=T.length;let rad=0;T.forEach(p=>{rad=Math.max(rad,Math.hypot(p.x-cx,p.y-cy,p.z-cz))});
   const bs=new THREE.Sphere(new THREE.Vector3(cx,cy+1,cz),rad+3.2);
   by.forEach((L,vi)=>{if(!L.length)return;
    /* the geometry shares its buffers with the variant; only the bounding sphere differs, so the tile can be culled on its own */
    const g=new THREE.BufferGeometry(),src=set[vi];for(const a in src.attributes)g.setAttribute(a,src.attributes[a]);g.boundingSphere=bs.clone();
    const im=new THREE.InstancedMesh(g,mat,L.length);im.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    L.forEach((p,i)=>{q.setFromAxisAngle(Y,p.r||0);const h=.9+rr()*.2;v.set(p.x,p.y||0,p.z);s.set(1,h,1);M.compose(v,q,s);im.setMatrixAt(i,M);
     const b=.82+rr()*.28;col.setRGB(b,b*(.95+rr()*.1),b*(.95+rr()*.1));im.setColorAt(i,col)});
    /* v53.4.1: each person's jump phase (a hash of where they stand) and their angle round the stage are worked out once here, not for every vertex on every frame */
    const pa=new Float32Array(L.length*2);L.forEach((p,i)=>{const d=Math.sin(p.x*12.9898+p.z*78.233)*43758.5453;pa[i*2]=d-Math.floor(d);pa[i*2+1]=Math.atan2(p.z,p.x)});
    g.setAttribute('aPA',new THREE.InstancedBufferAttribute(pa,2));
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=true;im.userData.npcx=1;grp.add(im)})});
  grp.userData.npcx=1;return grp};

 /* ---- the stadium show: swap its block fans for NPCs (the show is built inside 151-tour-shows.js, so it is done right after it builds) ---- */
 function swapShow(){
  let done=0;
  scene.children.slice().forEach(g=>{
   if(!g.isGroup&&g.type!=='Group')return;
   let body=null,hand=null,head=null;
   g.children.forEach(m=>{if(!m.isInstancedMesh||!m.material||!m.material.customProgramCacheKey)return;let key='';try{key=m.material.customProgramCacheKey()}catch(e){}
    if(key==='dscrowdH')hand=m;else if(key==='dscrowd'){const h=m.geometry&&m.geometry.parameters&&m.geometry.parameters.height;if(h>1)body=m;else head=m}});
   if(!body||!hand||!head||g.userData.npcxDone)return;
   g.userData.npcxDone=1;
   /* the show drives the old material with shared uniforms (time, jump height, rate, hype, wave): take the very same ones */
   const fake={uniforms:{},vertexShader:'void main() {\n#include <begin_vertex>'};try{body.material.onBeforeCompile(fake)}catch(e){}
   const U=fake.uniforms;if(!U.uT){return}
   const spots=[],M=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),e=new THREE.Euler();
   for(let i=0;i<body.count;i++){body.getMatrixAt(i,M);M.decompose(pos,q,sc);e.setFromQuaternion(q,'YXZ');spots.push({x:pos.x,y:pos.y,z:pos.z,r:e.y,lite:pos.y>8||Math.abs(pos.x)>46})}
   const crowd=X.build(spots,{uniforms:U,seed:spots.length});
   crowd.traverse(m=>{if(m.geometry)m.geometry.userData.dsOwn=1;if(m.material)m.material.userData.dsOwn=1});/* taken down with the arena */
   [body,head,hand].forEach(m=>{g.remove(m);if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose()});
   g.add(crowd);done++});
  return done}
 X.swapShow=swapShow;

 function hook(){
  const D=window.DCITY;if(!D||typeof D.fade!=='function'||D.fade.__npcx)return false;
  const f0=D.fade;
  D.fade=function(a,b,c){
   const wrapped=typeof a==='function'?function(){const r=a.apply(this,arguments);try{swapShow()}catch(e){console.warn('npc crowd swap',e)}return r}:a;
   return f0.call(this,wrapped,b,c)};
  D.fade.__npcx=1;return true}
 if(!hook()){let n=0;const iv=setInterval(()=>{if(hook()||++n>40)clearInterval(iv)},500)}
 X.ready=true;
})();
