/* WaveFern dev graphics pack. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Levels: Off (original look) / Balanced / Max. Saved per device. Dev panel (DEV button or the ` key) > Graphics.
   - Shadows: the sun casts hard, pixel-sharp shadows that follow the camera (Balanced 1024 map, Max 2048)
   - Sky light: a soft blue-sky / warm-ground light on top of the normal ambient light, so tops and sides read differently
   - Colour grade: a little more contrast and colour (CSS filter on the canvas, no cost to the 3D)
   - Vignette: darker, warmer screen edges (CSS)
   - Glow (Max only): bright things (lamps, neon, stage lights, windows at night) bloom softly */
(function(){
 if(!window.FW_DEV)return;
 /* fail safe: never runs during loading, never throws; add ?nogfx to the address to skip it entirely */
 if(/[?&]nogfx/.test(location.search))return;
 function boot(){try{
 const GLOW=false,KEY='fw_dgfx',LV=['off','balanced','max'];
 let lv='max';try{const s=localStorage.getItem(KEY);if(LV.indexOf(s)>=0)lv=s}catch(e){}
 const ok=()=>{try{return typeof renderer!='undefined'&&typeof scene!='undefined'&&typeof sun!='undefined'&&typeof cam!='undefined'}catch(e){return false}};
 if(!ok()){console.warn('dev graphics: game not ready');return}
 const cv=renderer.domElement,st=document.createElement('style');
 st.textContent='#fwdg-v{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 58%,rgba(18,10,24,.45) 100%)}'+
  '#fwdg-b{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;opacity:.3;filter:brightness(.8) contrast(1.9) blur(7px) saturate(1.3)}';
 document.head.appendChild(st);
 const vg=document.createElement('div');vg.id='fwdg-v';
 const bc=document.createElement('canvas');bc.id='fwdg-b';bc.width=192;bc.height=108;const bx=bc.getContext('2d');
 cv.after(bc);cv.after(vg);
 /* sky light */
 const hemi=new THREE.HemisphereLight(0xbcd6ff,0x6e5a46,0);scene.add(hemi);
 scene.add(sun.target);
 const sunOff=sun.position.clone();
 sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;
 let applied='',frame=0,shRange=0;
 function apply(){
  const on=lv!='off',mx=lv=='max';
  renderer.shadowMap.enabled=on;renderer.shadowMap.type=THREE.BasicShadowMap;
  sun.castShadow=on;
  const sz=mx?2048:1024;
  if(sun.shadow.mapSize.x!=sz){sun.shadow.mapSize.set(sz,sz);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
  cv.style.filter=on?'contrast(1.12) saturate(1.14) brightness(.96)':'';
  vg.style.display=on?'block':'none';
  bc.style.display='none';
  if(!on){hemi.intensity=0;sun.position.copy(sunOff);sun.target.position.set(0,0,0)}
  /* materials need to rebuild when shadows switch on or off */
  scene.traverse(o=>{if(o.isMesh){if(o.material&&!Array.isArray(o.material))o.material.needsUpdate=true}});
  applied=lv;mark(true);
  try{localStorage.setItem(KEY,lv)}catch(e){}
  refresh();
 }
 /* flag meshes that should cast / receive shadows: solid lit (Lambert) meshes only; glass, sky, beams and glow stay out */
 const done=new WeakSet();
 function mark(all){
  const on=lv!='off';
  scene.traverse(o=>{
   if(!o.isMesh)return;
   if(!all&&done.has(o))return;done.add(o);
   const m=o.material;
   const solid=m&&!Array.isArray(m)&&m.isMeshLambertMaterial&&!m.transparent&&m.opacity>=1;
   o.castShadow=on&&!!solid;o.receiveShadow=on&&!!solid;
  });
 }
 function frameFx(){
  if(lv=='off')return;
  const a=Math.max(1.4,innerWidth/innerHeight),r=Math.max(10,Math.min(60,viewH*a*.62+6));
  /* shadow box follows the camera, snapped to a grid so shadows do not shimmer when it moves */
  const q=lv=='max'?.25:.5,tx=Math.round(camT.x/q)*q,tz=Math.round(camT.z/q)*q;
  sun.position.set(tx+sunOff.x*1.3,sunOff.y*1.3,tz+sunOff.z*1.3);sun.target.position.set(tx,0,tz);
  const c=sun.shadow.camera;
  if(Math.abs(shRange-r)>.5){shRange=r;c.left=c.bottom=-r;c.right=c.top=r;c.near=1;c.far=70;c.updateProjectionMatrix()}
  /* sky light follows the day and night level of the ambient light */
  hemi.intensity=.1*Math.min(1.3,amb.intensity/.75);
  if(!(frame%20))mark(false);
 }
 const r0=renderer.render.bind(renderer);
 renderer.render=function(s,c){
  let a0=0,s0=0,dp=0;
  if(c===cam&&s===scene){frame++;try{frameFx()}catch(e){}if(lv!='off'){a0=amb.intensity;s0=sun.intensity;dp=1;amb.intensity=a0*.82;sun.intensity=s0*1.32}}
  let o;try{o=r0(s,c)}finally{if(dp){amb.intensity=a0;sun.intensity=s0}}
  /* glow: copy a tiny version of the frame right after drawing (the canvas is cleared later) */
  if(GLOW&&lv=='max'&&c===cam&&!(frame&1))try{bx.drawImage(cv,0,0,bc.width,bc.height)}catch(e){}
  return o};
 /* dev panel section */
 const names={off:'Off (original look)',balanced:'Balanced',max:'Max'};
 let btns=[];
 function refresh(){btns.forEach(([k,b])=>{b.textContent=(lv==k?'> ':'')+names[k]})}
 const box=document.getElementById('fwdvb');
 if(box){
  const h=document.createElement('h5');h.textContent='Graphics (dev)';box.prepend(h);
  const tip=document.createElement('small');tip.textContent='Shadows, sky light, colour grade, vignette. Off puts the normal look back.';h.after(tip);
  let last=tip;
  LV.forEach(k=>{const b=document.createElement('button');b.onclick=()=>{lv=k;apply()};last.after(b);last=b;btns.push([k,b])});
 }
 apply();
 window.FW_DGFX={set(k){if(LV.indexOf(k)>=0){lv=k;apply()}},get:()=>lv};
 }catch(e){console.warn('dev graphics failed',e)}}
 let tries=0;const iv=setInterval(()=>{tries++;if(!document.getElementById('load')&&document.getElementById('fwdvb')){clearInterval(iv);boot()}else if(tries>240)clearInterval(iv)},250);
})();
