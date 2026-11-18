/* ===== v55.21.0: zone culling (draw only what is near you) =====
   The world is one big scene of about 32,000 objects. Three.js already skips drawing a single mesh that is off screen, but it
   still walks every visible group each frame, recomputes its matrices and tests each mesh against the view, and the sun's
   shadow pass draws anything inside its own (larger) box. So from home the skate park, the island, the golf club, the beach
   club and the city towers were all still walked, matrix-updated and partly shadow-drawn every frame.

   This file splits the scene into "zones": groups of static things that fit in a box at most ZMAX units across (a city block
   tile, a building, a shop interior, a park, the skate park ramps). Each frame, just before the main camera draws, every zone
   whose box (plus the ground its shadow can fall on, plus a small margin) is outside the camera's view is switched off for that
   one draw and switched straight back on afterwards, so game code never sees the change. A hidden zone costs nothing to draw,
   nothing in the shadow pass, and 116-perf.js skips its matrices.

   Never culled: anything that moves on its own (people, cars, pets, the player: a zone whose position changes is dropped for good),
   lights and anything holding a light (hiding a light changes the lighting of what you can see and makes three rebuild shaders),
   meshes three cannot bound (frustumCulled=false, instanced, skinned, custom shaders), and anything while another camera is in
   use (golf, surf, skate, fishing, lighthouse, gigs and shows have their own cameras; culling waits for the main camera again).

   Zones are found again every REBUILD ms (and soon after anything is added to the scene), so newly built places join in.
   Settings > Graphics > Draw distance sets how far past the screen edge zones are kept (Normal) or only what is on screen (Near).
   Other files ask FW_ZONE.seen(obj) / FW_ZONE.seenBox(box) to pause animations of places you cannot see (skate park, fishing pier,
   surf break, beach club). Add ?nocull to the address to switch all of this off; FW_ZONE.off=true does the same at runtime.
   Test hook: FW_ZONE.stats() gives zone counts and how many were hidden in the last frame. ===== */
(function(){
if(typeof THREE=='undefined'||typeof scene=='undefined'||typeof renderer=='undefined'||typeof cam=='undefined')return;
const NOCULL=/[?&]nocull/.test(location.search);
const ZMAX=90,REBUILD=2500,MIN_OBJ=2;
const Z=window.FW_ZONE={off:NOCULL,zones:[],hidden:0,tested:0,built:0,buildMs:0,frame:0,realCam:null,
 /* is this object (its world box, worked out once and refreshed with the zones) within margin of the main camera's view? */
 seen(o,m){if(Z.off||!o)return true;let b=BX.get(o);if(!b||Z.frame-b.f>150){b=boxOf(o);BX.set(o,b)}return b.e?Z.seenBox(b.b,m):true},
 seenBox(b,m){if(Z.off||!b||!viewOk())return true;fr();m=m==null?8:m;TB.min.set(b.min.x-m,b.min.y-m,b.min.z-m);TB.max.set(b.max.x+m,b.max.y+m,b.max.z+m);return FR.intersectsBox(TB)},
 stats(){return{on:!Z.off,zones:Z.zones.length,hidden:Z.hidden,built:Z.built,buildMs:+Z.buildMs.toFixed(1),realCamIsMain:Z.realCam===cam}},
 rebuild(){dirty=1;lastBuild=0}};
const FR=new THREE.Frustum(),PM=new THREE.Matrix4(),TB=new THREE.Box3(),BX=new WeakMap();
let frF=-1;
/* the culling view is the main camera, only while it is the camera actually drawing the world */
const viewOk=()=>Z.realCam===cam;
function fr(){const f=renderer.info.render.frame;if(f===frF)return;frF=f;cam.updateMatrixWorld();PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);FR.setFromProjectionMatrix(PM)}
/* world box of a subtree from each mesh's geometry box (cheap: no vertex walk). e=0 when nothing in it could be bounded */
const _b=new THREE.Box3();
function boxOf(o){const b=new THREE.Box3();let e=0;o.traverse(x=>{if(x.visible===false)return;const g=x.geometry;if(!g||!(x.isMesh||x.isPoints||x.isLine||x.isSprite))return;
  if(x.isSprite){b.expandByPoint(x.getWorldPosition(new THREE.Vector3()));e=1;return}
  if(!g.boundingBox)g.computeBoundingBox();if(!g.boundingBox||g.boundingBox.isEmpty())return;_b.copy(g.boundingBox).applyMatrix4(x.matrixWorld);b.union(_b);e=1});
 return{b,e,f:Z.frame}}

/* ---------- finding the zones ---------- */
let dirty=1,lastBuild=0;
{const a0=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(){dirty=1;return a0.apply(this,arguments)}}
const DYN=new WeakSet();/* zones seen moving: never zones again */
function dynSet(){const s=new Set(),t=o=>{if(o)s.add(o)};
 try{NPC.forEach(n=>{t(n.m);t(n.pet)})}catch(e){}try{TRAF.forEach(c=>t(c.m))}catch(e){}try{if(typeof VPED!='undefined')VPED.forEach(n=>t(n.m))}catch(e){}
 try{t(P.mesh)}catch(e){}try{if(typeof WTHR!='undefined'){t(WTHR.mesh);(WTHR.fogs||[]).forEach(t)}}catch(e){}return s}
/* post-order walk: info for every group = merged box of what is under it and flags that stop it being a zone */
function build(){const t0=performance.now(),dyn=dynSet(),out=[];
 try{scene.updateMatrixWorld()}catch(e){}
 const walk=o=>{/* returns {b,n,bad}; bad: holds a light, an unboundable mesh or something moving */
  if(o.visible===false)return null;/* hidden by the game: not a zone now (it is looked at again next rebuild) */
  if(dyn.has(o)||DYN.has(o))return{b:null,n:1,bad:1};
  if(o.isLight)return{b:null,n:1,bad:1};
  let bad=0,n=1,b=null;
  if(o.isMesh||o.isPoints||o.isLine||o.isSprite){const m=o.material,sh=m&&(Array.isArray(m)?m.some(x=>x&&(x.isShaderMaterial||x.isRawShaderMaterial)):(m.isShaderMaterial||m.isRawShaderMaterial));
   if(o.frustumCulled===false||o.isInstancedMesh||o.isSkinnedMesh||sh)bad=1;
   else if(o.isSprite){b=new THREE.Box3().setFromCenterAndSize(o.getWorldPosition(new THREE.Vector3()),o.scale.clone())}
   else{const g=o.geometry;if(g){if(!g.boundingBox)g.computeBoundingBox();if(g.boundingBox&&!g.boundingBox.isEmpty())b=g.boundingBox.clone().applyMatrix4(o.matrixWorld)}}}
  const kids=[];const c=o.children;
  for(let i=0;i<c.length;i++){const r=walk(c[i]);if(!r)continue;kids.push([c[i],r]);n+=r.n;if(r.bad)bad=1;if(r.b){if(b)b.union(r.b);else b=r.b.clone()}}
  const sz=b?Math.max(b.max.x-b.min.x,b.max.z-b.min.z):1e9;
  /* a good zone: small enough, nothing in it that must stay, worth the test */
  if(!bad&&b&&sz<=ZMAX&&n>MIN_OBJ&&o!==scene&&c.length){out.push(mk(o,b));return{b,n,bad:0,z:1}}
  /* otherwise its children that are good zones on their own are already in the list (they were pushed by their own walk) */
  return{b,n,bad}};
 /* children of a group that became a zone are not zones themselves: walk returns as soon as a group qualifies, and its
    children's zones (pushed earlier in the post-order walk) are removed here */
 walk(scene);
 const zs=new Set(out.map(z=>z.o)),fin=out.filter(z=>{let p=z.o.parent;while(p&&p!==scene){if(zs.has(p))return false;p=p.parent}return true});
 /* keep each old zone's last position so movement is still caught */
 Z.zones=fin;Z.built++;Z.buildMs=performance.now()-t0;dirty=0;lastBuild=performance.now();sunKey='';}
function mk(o,b){return{o,b,sb:b.clone(),x:o.position.x,y:o.position.y,z:o.position.z}}

/* the ground a zone's shadow can fall on: the box pushed away from the sun by its height (sun direction is fixed, see dev-graphics-v12) */
let sunKey='';const LD=new THREE.Vector3();
function shadowBoxes(){let k='0';const on=renderer.shadowMap.enabled&&typeof sun!='undefined'&&sun.castShadow;
 if(on){LD.subVectors(sun.position,sun.target.position);if(LD.y<.05)LD.y=.05;LD.normalize();k=LD.x.toFixed(2)+','+LD.y.toFixed(2)+','+LD.z.toFixed(2)}
 if(k===sunKey)return;sunKey=k;
 Z.zones.forEach(z=>{z.sb.copy(z.b);if(!on)return;const h=Math.max(0,z.b.max.y),dx=-LD.x/LD.y*h,dz=-LD.z/LD.y*h;
  z.sb.min.x=Math.min(z.b.min.x,z.b.min.x+dx);z.sb.max.x=Math.max(z.b.max.x,z.b.max.x+dx);z.sb.min.z=Math.min(z.b.min.z,z.b.min.z+dz);z.sb.max.z=Math.max(z.b.max.z,z.b.max.z+dz);z.sb.min.y=Math.min(0,z.b.min.y)})}

/* ---------- each frame: hide zones outside the view for the main camera's draw ---------- */
const HID=[];
function margin(){try{return gfxCur().far?10:3}catch(e){return 10}}
function cullNow(){
 const now=performance.now();if((dirty&&now-lastBuild>700)||now-lastBuild>REBUILD)build();
 shadowBoxes();fr();const m=margin(),zs=Z.zones;let moved=0;
 for(let i=0;i<zs.length;i++){const z=zs[i],o=z.o;
  if(o.visible!==true)continue;
  const p=o.position;if(p.x!==z.x||p.y!==z.y||p.z!==z.z){DYN.add(o);moved=1;continue}/* it moves: drop it for good */
  const b=z.sb;TB.min.set(b.min.x-m,b.min.y-m,b.min.z-m);TB.max.set(b.max.x+m,b.max.y+m,b.max.z+m);
  if(!FR.intersectsBox(TB)){o.visible=false;HID.push(o)}}
 if(moved){Z.zones=zs.filter(z=>!DYN.has(z.o));dirty=1}
 Z.hidden=HID.length}
function restore(){for(let i=0;i<HID.length;i++)if(HID[i].visible===false)HID[i].visible=true;HID.length=0}

/* the scene tells us which camera is really drawing (wrappers in golf, surf, skate, fishing and the island swap in their own) */
const ob0=scene.onBeforeRender;
scene.onBeforeRender=function(r,s,c){Z.realCam=c;if(HID.length&&c!==cam)restore();/* a different camera this frame: put everything back before it draws */
 if(ob0)try{ob0.apply(this,arguments)}catch(e){}};

function install(){const r0=renderer.render;
 renderer.render=function(s,c){Z.frame++;
  let did=0;if(!Z.off&&s===scene&&c===cam&&Z.realCam===cam){try{cullNow();did=1}catch(e){restore();try{fwSoftErr(e,'zone cull')}catch(_){}}}
  try{return r0.apply(this,arguments)}finally{if(did||HID.length)restore()}}}
/* install after the dev graphics pack has wrapped renderer.render (it waits for the loading screen), so this wrapper is the outermost one
   and hides zones before the scene's matrices are updated; the first frames run without culling until the main camera is confirmed */
let tries=0;const iv=setInterval(()=>{tries++;if((window.FW_DGFX||tries>40)&&!document.getElementById('load')||tries>400){clearInterval(iv);install()}},250);
})();
