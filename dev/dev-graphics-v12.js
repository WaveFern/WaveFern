/* WaveFern dev graphics pack. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Levels: Off (original look) / Balanced / Max. Saved per device. Dev panel (DEV button or the ` key) > Graphics.
   - Shadows: the sun casts hard, pixel-sharp shadows that follow the camera (Balanced 1024 map, Max 2048)
   - Sky light: a soft blue-sky / warm-ground light on top of the normal ambient light, so tops and sides read differently
   - Colour grade: a little more contrast and colour (CSS filter on the canvas, no cost to the 3D)
   - Vignette: darker, warmer screen edges (CSS)
   - Glow (Max only): bright things (lamps, neon, stage lights, windows at night) bloom softly */
(function(){
 if(!window.FW_FEAT)return;
 /* fail safe: never runs during loading, never throws; add ?nogfx to the address to skip it entirely */
 if(/[?&]nogfx/.test(location.search))return;
 function boot(){try{
 const TONES={neutral:{n:'Neutral',aw:0xdfe9ff,sw:0xf4f6ff,a:.4,s:.45,sat:1.05},mid:{n:'Soft gold (balanced)',aw:0xf2eef4,sw:0xffd9a0,a:.3,s:.4,sat:1.09},golden:{n:'Golden (strong)',aw:0xffd2a6,sw:0xffa860,a:.4,s:.45,sat:1.14}},TK='fw_dtone2';
 let tone='neutral';try{const t=localStorage.getItem(TK);if(TONES[t])tone=t}catch(e){}
 const BR={low:.88,mid:1,high:1.12},BK='fw_dbri2';let bri='high';try{const b=localStorage.getItem(BK);if(BR[b])bri=b}catch(e){}
 const GLOW=false,KEY='fw_dgfx2',LV=['off','balanced','max'];
 /* LIVE SITE: the shadow / sky-light / colour-grade pack is ON at Max for everyone and ignores any level saved on this device. Set LIVE_ON=false to switch it off. */
 const LIVE_ON=true;
 let lv=LIVE_ON?'max':'off';
 const ok=()=>{try{return typeof renderer!='undefined'&&typeof scene!='undefined'&&typeof sun!='undefined'&&typeof cam!='undefined'}catch(e){return false}};
 if(!ok()){console.warn('dev graphics: game not ready');return}
 const cv=renderer.domElement,st=document.createElement('style');
 st.textContent='#fwdg-v{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 58%,rgba(18,10,24,.26) 100%)}'+
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
 let applied='',frame=0,shRange=0,shOn=false,cgOn=true,shK='',shForce=true,lastSh=0,maxTex=2048;try{maxTex=renderer.capabilities.maxTextureSize||2048}catch(e){}
 /* Settings > Graphics (122-graphics.js) sets shadow quality, distance and the colour grade: sh 0 off, 1-4 = 512/1024/2048/4096; shd 0/1/2 = near/normal/far; cg 1/0 */
 const gcfg=()=>{try{const c=gfxCur();return{sh:c.sh==null?3:+c.sh,shd:c.shd==null?1:+c.shd,cg:c.cg==null?1:+c.cg}}catch(e){return{sh:3,shd:1,cg:1}}};
 function apply(){
  const g=gcfg(),on=lv!='off',mx=lv=='max',wasSh=shOn;
  shOn=on&&g.sh>0;cgOn=!!g.cg;shK=g.sh+'|'+g.cg;shForce=true;
  renderer.shadowMap.enabled=shOn;renderer.shadowMap.type=THREE.BasicShadowMap;renderer.shadowMap.autoUpdate=false;
  sun.castShadow=shOn;
  const sz=Math.min(maxTex,mx?[0,512,1024,2048,4096][g.sh]||2048:1024);
  if(shOn&&sun.shadow.mapSize.x!=sz){sun.shadow.mapSize.set(sz,sz);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
  cv.style.filter=on&&cgOn?'contrast(1.08) saturate('+TONES[tone].sat+') brightness(.98)':'';
  vg.style.display=on&&cgOn?'block':'none';
  bc.style.display='none';
  if(!on){hemi.intensity=0;sun.position.copy(sunOff);sun.target.position.set(0,0,0)}
  /* materials need to rebuild when shadows switch on or off */
  if(wasSh!=shOn)scene.traverse(o=>{if(o.isMesh){if(o.material&&!Array.isArray(o.material))o.material.needsUpdate=true}});
  applied=lv;mark(true);
  try{localStorage.setItem(KEY,lv)}catch(e){}
  refresh();
 }
 /* flag meshes that should cast / receive shadows: solid lit (Lambert) meshes only; glass, sky, beams and glow stay out */
 const done=new WeakSet();
 function mark(all){
  const on=shOn;
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
  const g=gcfg();if(shK!=g.sh+'|'+g.cg)apply();
  const a=Math.max(1.4,innerWidth/innerHeight),r=Math.max(10,Math.min(80,(viewH*a*.62+6)*[.6,1,1.4][g.shd==null?1:g.shd]));
  /* shadow box follows the camera, snapped to a grid so shadows do not shimmer when it moves */
  const q=lv=='max'?.25:.5,tx=Math.round(camT.x/q)*q,tz=Math.round(camT.z/q)*q;
  sun.position.set(tx+sunOff.x*1.3,sunOff.y*1.3,tz+sunOff.z*1.3);sun.target.position.set(tx,0,tz);
  const c=sun.shadow.camera;
  if(Math.abs(shRange-r)>.5){shRange=r;c.left=c.bottom=-r;c.right=c.top=r;c.near=1;c.far=70;c.updateProjectionMatrix()}
  /* sky light follows the day and night level of the ambient light */
  hemi.intensity=.13*Math.min(1.3,amb.intensity/.75);
  if(!(frame%20))mark(false);
 }
 const ac0=new THREE.Color(),sc0=new THREE.Color(),AW=new THREE.Color(),SW=new THREE.Color();
 const r0=renderer.render.bind(renderer);
 renderer.render=function(s,c){
  let a0=0,s0=0,dp=0;
  if(c===cam&&s===scene){frame++;try{frameFx()}catch(e){}if(lv!='off'){a0=amb.intensity;s0=sun.intensity;dp=1;
   /* d is 1 in full daylight and fades to 0 by dusk: daytime gets a golden-hour look (lower, warmer light), sunset stays as it is */
   const d=Math.max(0,Math.min(1,(a0-.55)/.2));ac0.copy(amb.color);sc0.copy(sun.color);
   amb.intensity=a0*(.84-.09*d)*BR[bri];sun.intensity=s0*(1.32-.42*d)*BR[bri];
   const T=TONES[tone];AW.setHex(T.aw);SW.setHex(T.sw);amb.color.lerp(AW,T.a*d);sun.color.lerp(SW,T.s*d)}}
  /* the shadow map is redrawn at most about 60 times a second (fast screens do not need more) and not at all while the game is paused */
  if(dp&&shOn){const n=performance.now();if(shForce||(n-lastSh>=14&&!(typeof PAUSED!='undefined'&&PAUSED))){renderer.shadowMap.needsUpdate=true;lastSh=n;shForce=false}}
  let o;try{o=r0(s,c)}finally{if(dp){amb.intensity=a0;sun.intensity=s0;amb.color.copy(ac0);sun.color.copy(sc0)}}
  /* glow: copy a tiny version of the frame right after drawing (the canvas is cleared later) */
  if(GLOW&&lv=='max'&&c===cam&&!(frame&1))try{bx.drawImage(cv,0,0,bc.width,bc.height)}catch(e){}
  return o};
 /* dev panel section */
 const names={off:'Off (original look)',balanced:'Balanced',max:'Max'};
 let btns=[],tbtns=[],bbtns=[];
 function refresh(){btns.forEach(([k,b])=>{b.textContent=(lv==k?'> ':'')+names[k]});tbtns.forEach(([k,b])=>{b.textContent=(tone==k?'> ':'')+TONES[k].n});bbtns.forEach(([k,b])=>{b.textContent=(bri==k?'> ':'')+({low:'Dimmer',mid:'Normal',high:'Brighter'})[k]})}
 const box=document.getElementById('fwdvb');
 if(box){
  const h=document.createElement('h5');h.textContent='Graphics (dev)';box.prepend(h);
  const tip=document.createElement('small');tip.textContent='Graphics build v12. Shadows, sky light, colour grade, vignette. Off puts the normal look back.';h.after(tip);
  let last=tip;
  LV.forEach(k=>{const b=document.createElement('button');b.onclick=()=>{lv=k;apply()};last.after(b);last=b;btns.push([k,b])});
  const h2=document.createElement('h5');h2.textContent='Light colour (dev)';last.after(h2);last=h2;
  const h3=document.createElement('h5');h3.textContent='Brightness (dev)';last.after(h3);last=h3;
  Object.keys(BR).forEach(k=>{const b=document.createElement('button');b.onclick=()=>{bri=k;try{localStorage.setItem(BK,k)}catch(e){}refresh()};last.after(b);last=b;bbtns.push([k,b])});
  Object.keys(TONES).forEach(k=>{const b=document.createElement('button');b.onclick=()=>{tone=k;try{localStorage.setItem(TK,k)}catch(e){}apply()};last.after(b);last=b;tbtns.push([k,b])});
 }
 apply();
 window.FW_DGFX={set(k){if(LV.indexOf(k)>=0){lv=k;apply()}},get:()=>lv};
 }catch(e){console.warn('dev graphics failed',e)}}
 let tries=0;const iv=setInterval(()=>{tries++;if(!document.getElementById('load')){clearInterval(iv);boot()}else if(tries>1200)clearInterval(iv)},250);
})();
