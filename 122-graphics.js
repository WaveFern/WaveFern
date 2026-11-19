/* ===== Graphics settings, for slow computers =====
   Settings > Graphics: a preset (Auto, Low, Medium, High) or your own mix of
   - Pixel size: how many screen pixels make one game pixel (3 is the normal look; bigger = faster)
   - Frame rate cap: none, 60 or 30
   - Crowds: how many people walk the pavements (all, half, a quarter)
   - Weather effects: full, light (half the rain) or off
   - Draw distance: people and cars are only drawn near the camera's view (normal or near)
   Auto starts on High and steps down while the game runs slowly, remembering the level it settled on.
   Stored per device in localStorage 'fw_gfx' (missing = Auto), so saves are untouched. ===== */
/* bg: when the tab/window is in the background: 0 full, 1 reduced (10 fps), 2 rendering paused. blur: blurred backdrop behind the pause menu.
   bat (Battery Saver) is the lightest: Low's look plus a 30 fps cap and reduced drawing in the background. */
/* det = small props hidden: any solid prop whose longest side is under that many world units is not drawn (0 = all drawn). v55.11: every step is cheaper than the one above it. shi = shadow redraw gap in ms (shadows are redrawn at most that often). Battery is the lightest and also draws at 30 fps. */
const GFX_PRE={best:{px:2,fps:0,crowd:4,wx:2,far:1,bg:0,blur:1,sh:4,shd:1,shi:14,cg:1,det:0},high:{px:3,fps:0,crowd:4,wx:2,far:1,bg:0,blur:1,sh:3,shd:1,shi:33,cg:1,det:0},med:{px:3,fps:60,crowd:2,wx:1,far:1,bg:0,blur:1,sh:1,shd:0,shi:100,cg:1,det:0.15},low:{px:5,fps:0,crowd:1,wx:0,far:0,bg:0,blur:0,sh:0,shd:0,shi:100,cg:0,det:0.6},bat:{px:5,fps:30,crowd:1,wx:0,far:0,bg:1,blur:0,sh:0,shd:0,shi:100,cg:0,det:0.6}};
const GFX_LV=['high','med','low'];
const GFX_DEF={p:'auto',al:'high',px:3,fps:0,crowd:4,wx:2,far:1,bg:0,blur:1,sh:3,shd:1,shi:33,det:0,cg:1,pp:0};let GFX=Object.assign({},GFX_DEF);
try{const g=JSON.parse(localStorage.getItem('fw_gfx')||'null');if(g&&typeof g=='object')Object.assign(GFX,g)}catch(e){}
if(!GFX_PRE[GFX.al])GFX.al='high';
if(GFX.p!='auto'&&GFX.p!='custom'&&!GFX_PRE[GFX.p])GFX.p='auto';
/* shadows: sh 0 off, 1-4 = 512/1024/2048/4096 map (3 = the long-standing look); shd 0 near, 1 normal, 2 far; cg: colour grade and vignette */
for(const k in GFX_DEF)if(k!='p'&&k!='al'&&typeof GFX[k]!='number')GFX[k]=GFX_DEF[k];
const gfxSv=()=>{try{localStorage.setItem('fw_gfx',JSON.stringify(GFX))}catch(e){}};
/* the values in force: a preset's, or the custom ones */
function gfxCur(){return GFX.p=='custom'?GFX:GFX_PRE[GFX.p=='auto'?GFX.al:GFX.p]||GFX_PRE.high}
let gfxFocus=true;addEventListener('blur',()=>{gfxFocus=false});addEventListener('focus',()=>{gfxFocus=true});

/* screen refresh rate: measured once from a short run of animation frames, so 90/120/Uncapped only show on screens that can use them */
let gfxHz=0;setTimeout(()=>{const g=[];let l=0;const f=t=>{if(l)g.push(t-l);l=t;if(g.length<90&&!document.hidden)requestAnimationFrame(f);else if(g.length>=60){g.sort((a,b)=>a-b);gfxHz=Math.round(1000/Math.max(4,g[Math.floor(g.length*.2)]))}};requestAnimationFrame(f)},6000);

/* pixel size */
let gfxPX=0;
function gfxSize(){const px=Math.max(2,Math.min(5,+gfxCur().px||3));gfxPX=px;renderer.setSize(Math.ceil(innerWidth/px),Math.ceil(innerHeight/px),false)}
addEventListener('resize',gfxSize);gfxSize();

/* frame rate cap, and frame timing for Auto */
const GFA={n:0,sum:0,t0:0,lastDraw:0,due:0};
/* v55.x: Draw distance Near also pulls the camera far plane in (cam.far 90 -> 46); "Pause actually pauses" (GFX.pp) stops drawing and ticking once the pause menu has had 3 frames */
GFA.pz=0;
{const l0=loop;loop=function(n){const c=gfxCur(),idle=document.hidden||!gfxFocus;let cap=+c.fps||0;
  {const fr=c.far?90:46;if(cam.far!=fr){cam.far=fr;cam.updateProjectionMatrix()}}
  if(window.FW_MENUIDLE&&FW_MENUIDLE.sleeping){requestAnimationFrame(loop);return}
  if(GFX.pp&&PAUSED&&mode=='pause'&&!(window.FWP&&!FWP.frozen())){if(++GFA.pz>3){requestAnimationFrame(loop);return}}else GFA.pz=0;
  /* background: pause drawing entirely, or drop to 10 fps; the pause menu (static scene) needs only 20 fps */
  if(idle&&c.bg==2){requestAnimationFrame(loop);return}
  if(idle&&c.bg==1)cap=cap?Math.min(cap,10):10;else if(PAUSED&&mode=='pause')cap=cap?Math.min(cap,20):20;
  /* v55.19.0 battery: the full-screen Mastery panel hides the world (10 fps), and the computer view is a still desk scene (30 fps; dt stays under the 0.05 s clamp so game time runs at the same speed) */
  else if(window.FW_MASTERY&&FW_MASTERY.isOpen&&FW_MASTERY.isOpen())cap=cap?Math.min(cap,10):10;else if(mode=='pc')cap=cap?Math.min(cap,30):30;
  /* scheduled cap: keeps the average on target even when it is not a divisor of the screen's refresh rate (45 on 60 Hz) */
  const iv=cap?1000/cap:0;
  if(iv){if(GFA.due-n>iv)GFA.due=n;if(n<GFA.due-1){requestAnimationFrame(loop);return}GFA.due=n-GFA.due>iv*2?n+iv:GFA.due+iv}else GFA.due=0;
  const gap=GFA.lastDraw?n-GFA.lastDraw:0;GFA.lastDraw=n;gfxAuto(gap,cap);fpsTick(n);return l0(n)}}
function gfxAuto(gap,cap){if(GFX.p!='auto'||document.hidden||PAUSED||(mode!='play'&&mode!='drive')){GFA.n=GFA.sum=0;return}
 if(!(gap>0)||gap>250)return;GFA.n++;GFA.sum+=gap;if(GFA.n<240)return;
 const avg=GFA.sum/GFA.n,want=cap?1000/cap:1000/60;GFA.n=GFA.sum=0;
 /* slower than 40 fps, or well under its cap: step down one level */
 if(avg>Math.max(25,want*1.3)){const i=GFX_LV.indexOf(GFX.al);if(i<GFX_LV.length-1){GFX.al=GFX_LV[i+1];gfxSv();gfxApply()}}}

/* crowds and draw distance: hide people and cars that are off screen or thinned out (cars still drive, so traffic is unchanged) */
/* v55.30.0: tested against the real camera view (zoom included). Normal keeps people and cars a little past the screen edge; Near hides the ones in the outer part of the screen
   (the old test used a box well outside the screen for both, so Near changed nothing you could see) */
const GCV=new THREE.Vector3();
function gfxCull(){const c=gfxCur(),keep=c.crowd||4,lim=c.far?1.15:.72;cam.updateMatrixWorld();
 const far=(m,x,z)=>{GCV.set(x,1,z).project(cam);return Math.abs(GCV.x)>lim||Math.abs(GCV.y)>lim};
 NPC.forEach((n,i)=>{if(!n.m.visible)return;const busy=n.fan||n.st||n.g||n.rob;if(far(n.m,n.x,n.z)||(!busy&&i%4>=keep)){n.m.visible=false;if(n.pet)n.pet.visible=false}});
 if(typeof VPED!='undefined')VPED.forEach((n,i)=>{if(n.m.visible&&(far(n.m,n.x,n.z)||i%4>=keep))n.m.visible=false});
 TRAF.forEach(t=>{if(t.m&&t.m.visible&&far(t.m,t.x,t.z))t.m.visible=false})}
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{gfxCull()}catch(e){}return r}}

/* small props (v55.11): the game has hundreds of tiny separate meshes (bins, pots, lamp bits), each one a draw call. When det > 0 the small solid ones are moved to camera layer 1, which the camera does not draw
   (shadows skip them too), and moved back to layer 0 when det drops. Moving things (people, cars, the player) and anything that is not a plain opaque lit mesh are never touched; a mesh seen moving is put back for good. */
const GFD={t:0,n:0};
function gfxDetail(force){const thr=+gfxCur().det||0;if(!thr&&!GFD.on)return;
 const dyn=new Set(),tag=g=>{if(g)dyn.add(g)};NPC.forEach(n=>{tag(n.m);tag(n.pet)});TRAF.forEach(t=>tag(t.m));if(typeof VPED!='undefined')VPED.forEach(n=>tag(n.m));tag(P.mesh);
 const bx=new THREE.Box3(),sz=new THREE.Vector3(),ps=new THREE.Vector3();let on=0;
 const walk=(o,skip)=>{if(o.visible===false&&thr)return;if(dyn.has(o))skip=true;
  if(o.isMesh){const m=o.material;
   if(!skip&&o.frustumCulled!==false&&m&&!Array.isArray(m)&&m.isMeshLambertMaterial&&!m.transparent&&!m.vertexColors&&!o.isInstancedMesh&&!o.isSkinnedMesh){
    if(o._gsz==null){const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();bx.copy(g.boundingBox).applyMatrix4(o.matrixWorld);bx.getSize(sz);o._gsz=Math.max(sz.x,sz.y,sz.z);o._gp=ps.setFromMatrixPosition(o.matrixWorld).toArray()}
    else if(!o._gdyn){ps.setFromMatrixPosition(o.matrixWorld);const q=o._gp;if(Math.abs(ps.x-q[0])+Math.abs(ps.y-q[1])+Math.abs(ps.z-q[2])>.02)o._gdyn=1}
    const hide=thr&&!o._gdyn&&o._gsz<thr;if(hide){o.layers.set(1);o._ghid=1;on=1}else if(o._ghid){o.layers.set(0);o._ghid=0}}
   else if(o._ghid){o.layers.set(0);o._ghid=0}}
  const c=o.children;for(let i=0;i<c.length;i++)walk(c[i],skip)};
 if(thr||GFD.on){const ch=scene.children;for(let i=0;i<ch.length;i++)walk(ch[i],false)}GFD.on=on&&thr?1:0;
 if(!thr&&GFD.on===0)scene.traverse(o=>{if(o._ghid){o.layers.set(0);o._ghid=0}})}
{const w1=worldTick;worldTick=function(dt){const r=w1.apply(this,arguments);if(++GFD.n>=45){GFD.n=0;try{gfxDetail()}catch(e){}}return r}}

/* weather: light = half the rain and snow, one fog layer instead of three; off = no rain, snow or fog drawn (the weather itself still happens) */
if(typeof wxTick=='function'){const x0=wxTick;wxTick=function(dt){const r=x0.apply(this,arguments);try{const w=gfxCur().wx;
  if(w<2&&WTHR.mesh&&WTHR.mesh.visible){if(!w)WTHR.mesh.visible=false;else{const g=WTHR.mesh.geometry,d=g.drawRange;g.setDrawRange(0,Math.floor((d.count||0)/2))}}
  if(!w)WTHR.fogs.forEach(m=>m.visible=false);else if(w==1)WTHR.fogs.forEach((m,i)=>{if(i)m.visible=false})}catch(e){}return r}}

function gfxApply(){gfxSize();GFD.n=0;try{GFD.on=1;gfxDetail()}catch(e){}GFA.n=GFA.sum=0;GFA.due=0;document.body.classList.toggle('gfx-noblur',!gfxCur().blur)}
gfxApply();

/* Settings > Graphics */
{const s0=settings;settings=function(){const r=s0.apply(this,arguments);const t=$('stt');
  if(t&&!t.querySelector('[data-t=gfx]')){const b=document.createElement('button');b.dataset.t='gfx';b.textContent='Graphics';b.onclick=()=>{STAB='gfx';stDraw()};const g=t.querySelector('[data-t=game]');g?g.after(b):t.appendChild(b);if(STAB=='gfx')stDraw()}return r}}
function gfxReset(){const f=GFX.fpsOn;GFX=Object.assign({},GFX_DEF);if(f)GFX.fpsOn=f;gfxSv();gfxApply();stDraw();say('Graphics reset')}
function gfxSet(k,v){if(k=='p'){GFX.p=v;if(v=='auto')GFX.al='high'}else{if(GFX.p!='custom')Object.assign(GFX,gfxCur());GFX.p='custom';GFX[k]=v}gfxSv();gfxApply();stDraw()}
const gfxH=t=>`<div class=so style="border:0;padding-bottom:0"><b style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.7">${t}</b></div>`;
const gfxRow=(l,k,opts,n)=>{const c=k=='p'?GFX.p:gfxCur()[k];if(k=='fps'&&gfxHz)opts=opts.filter(o=>o[0]==c||(o[0]?o[0]<=gfxHz+6:gfxHz>66));return`<div class=so><span>${l}${n?`<small class=m>${n}</small>`:''}</span><span style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">${opts.map(([v,t])=>`<button class="${c==v?'go':''}" onclick="gfxSet('${k}',${typeof v=='string'?`'${v}'`:v})">${t}</button>`).join('')}</span></div>`};
{const b0=stBody;stBody=function(){if(STAB!='gfx')return b0.apply(this,arguments);
  return gfxSlider()
  +gfxH('Look')
  +gfxRow('Pixel size','px',[[2,'Sharp'],[3,'Normal'],[4,'Chunky'],[5,'Chunkier']],'Bigger pixels run faster')
  +gfxRow('Shadows','sh',[[0,'Off'],[1,'Low'],[2,'Medium'],[3,'High'],[4,'Ultra']],'Quality is the shadow map size (512 / 1024 / 2048 / 4096). High is the normal look')
  +gfxRow('Shadow distance','shd',[[0,'Near'],[1,'Normal'],[2,'Far']],'How far from the camera shadows are drawn')
  +stTog('Colour grade and vignette',gfxCur().cg,"gfxSet('cg',gfxCur().cg?0:1)",'The warm contrast and darker screen edges')
  +gfxH('Performance')
  +gfxRow('Frame rate cap','fps',[[30,'30'],[45,'45'],[60,'60'],[90,'90'],[120,'120'],[0,'Uncapped']],'Limited by your screen\'s refresh rate'+(gfxHz?' (about '+gfxHz+' Hz here)':''))
  +gfxH('World')
  +gfxRow('Crowds','crowd',[[4,'All'],[2,'Half'],[1,'Few']])
  +gfxRow('Weather effects','wx',[[2,'Full'],[1,'Light'],[0,'Off']],'Rain, snow and fog. Light draws half the rain and snow and one fog layer')
  +stTog('FPS counter',GFX.fpsOn,"GFX.fpsOn=GFX.fpsOn?0:1;gfxSv();fpsShow()",'Frames per second, top of the screen')
  +gfxRow('Small props','det',[[0,'All'],[.15,'Fewer'],[.6,'Few']],'Hides tiny bins, pots and bits, so fewer things are drawn')
  +gfxRow('Draw distance','far',[[1,'Normal'],[0,'Near']],'Near also pulls the camera far plane in. Normal: people, cars and places just past the screen edge are kept. Near: people and cars near the screen edge are hidden, and only places on screen are drawn')
  +stTog('Pause actually pauses',GFX.pp,"GFX.pp=GFX.pp?0:1;gfxSv();stDraw()",'Pausing stops drawing the world and all game ticks, so the GPU and CPU go idle')
  +gfxH('Battery')
  +gfxRow('When in the background','bg',[[0,'Full'],[1,'Reduced'],[2,'Pause']],'Tab hidden or window not focused: Reduced draws 10 fps, Pause stops drawing')
  +gfxRow('Pause menu blur','blur',[[1,'On'],[0,'Off']],'Off saves battery behind the pause menu')
  +`<div class=so><span>Reset graphics<small class=m>Back to Auto, the default look</small></span><button onclick="gfxReset()">Reset</button></div>`}}

/* FPS counter (Settings > Graphics, off by default, saved in fw_gfx as fpsOn) */
const FPSC={n:0,t:0,el:null};
function fpsShow(){if(!FPSC.el){FPSC.el=document.createElement('div');FPSC.el.style.cssText='position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:50;pointer-events:none;font:bold 12px monospace;color:var(--ga,#2fe68a);background:#000;border:2px solid #2e2e2e;padding:1px 8px;border-radius:0';document.body.appendChild(FPSC.el)}
 FPSC.el.style.display=GFX.fpsOn?'block':'none';FPSC.n=0;FPSC.t=0}
function fpsTick(n){if(!GFX.fpsOn)return;if(!FPSC.el)fpsShow();FPSC.n++;if(!FPSC.t)FPSC.t=n;if(n-FPSC.t>=500){FPSC.el.textContent=Math.round(FPSC.n*1000/(n-FPSC.t))+' FPS';FPSC.n=0;FPSC.t=n}}
if(GFX.fpsOn)fpsShow();

/* preset slider: Auto, Low, Medium, High, Best (the game's own range slider) */
const GFX_STEPS=[['auto','Auto'],['bat','Battery'],['low','Low'],['med','Medium'],['high','High'],['best','Best']];
const GFX_NAME={bat:'Battery Saver',best:'Best',high:'High',med:'Medium',low:'Low'};
function gfxSlider(){const i=GFX_STEPS.findIndex(x=>x[0]==GFX.p),v=i<0?3:i,note=GFX.p=='auto'?'Auto, now on '+GFX_NAME[GFX.al]:GFX.p=='custom'?'Custom (move the slider to pick a preset)':GFX_NAME[GFX.p];
 return`<div class=so style="flex-wrap:wrap"><span>Preset<small class=m id=gfxpn>${note}</small></span><input type=range min=0 max=5 step=1 value=${v} style="padding:0" oninput="$('gfxpn').textContent=GFX_STEPS[this.value][1]" onchange="gfxSet('p',GFX_STEPS[this.value][0])">
 <div style="display:flex;justify-content:space-between;width:100%;font-size:11px;opacity:.75">${GFX_STEPS.map(x=>`<span>${x[1]}</span>`).join('')}</div></div>`}
