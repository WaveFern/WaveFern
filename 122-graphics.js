/* ===== Graphics settings, for slow computers =====
   Settings > Graphics: a preset (Auto, Low, Medium, High) or your own mix of
   - Pixel size: how many screen pixels make one game pixel (3 is the normal look; bigger = faster)
   - Frame rate cap: none, 60 or 30
   - Crowds: how many people walk the pavements (all, half, a quarter)
   - Weather effects: full, light (half the rain) or off
   - Draw distance: people and cars are only drawn near the camera's view (normal or near)
   Auto starts on High and steps down while the game runs slowly, remembering the level it settled on.
   Stored per device in localStorage 'fw_gfx' (missing = Auto), so saves are untouched. ===== */
const GFX_PRE={high:{px:3,fps:0,crowd:4,wx:2,far:1},med:{px:3,fps:60,crowd:2,wx:1,far:1},low:{px:4,fps:30,crowd:1,wx:0,far:0}};
const GFX_LV=['high','med','low'];
let GFX={p:'auto',al:'high',px:3,fps:0,crowd:4,wx:2,far:1};
try{const g=JSON.parse(localStorage.getItem('fw_gfx')||'null');if(g&&typeof g=='object')Object.assign(GFX,g)}catch(e){}
if(!GFX_PRE[GFX.al])GFX.al='high';
const gfxSv=()=>{try{localStorage.setItem('fw_gfx',JSON.stringify(GFX))}catch(e){}};
/* the values in force: a preset's, or the custom ones */
function gfxCur(){return GFX.p=='custom'?GFX:GFX_PRE[GFX.p=='auto'?GFX.al:GFX.p]||GFX_PRE.high}

/* pixel size */
let gfxPX=0;
function gfxSize(){const px=Math.max(2,Math.min(5,+gfxCur().px||3));gfxPX=px;renderer.setSize(Math.ceil(innerWidth/px),Math.ceil(innerHeight/px),false)}
addEventListener('resize',gfxSize);gfxSize();

/* frame rate cap, and frame timing for Auto */
const GFA={n:0,sum:0,t0:0,lastDraw:0};
{const l0=loop;loop=function(n){const c=gfxCur(),cap=+c.fps||0;
  if(cap&&GFA.lastDraw&&n-GFA.lastDraw<1000/cap-3){requestAnimationFrame(loop);return}
  const gap=GFA.lastDraw?n-GFA.lastDraw:0;GFA.lastDraw=n;gfxAuto(gap,cap);fpsTick(n);return l0(n)}}
function gfxAuto(gap,cap){if(GFX.p!='auto'||document.hidden||PAUSED||(mode!='play'&&mode!='drive')){GFA.n=GFA.sum=0;return}
 if(!(gap>0)||gap>250)return;GFA.n++;GFA.sum+=gap;if(GFA.n<240)return;
 const avg=GFA.sum/GFA.n,want=cap?1000/cap:1000/60;GFA.n=GFA.sum=0;
 /* slower than 40 fps, or well under its cap: step down one level */
 if(avg>Math.max(25,want*1.3)){const i=GFX_LV.indexOf(GFX.al);if(i<GFX_LV.length-1){GFX.al=GFX_LV[i+1];gfxSv();gfxApply()}}}

/* crowds and draw distance: hide people and cars that are off screen or thinned out (cars still drive, so traffic is unchanged) */
function gfxCull(){const c=gfxCur(),a=Math.max(1.8,innerWidth/Math.max(1,innerHeight)),R=c.far?Math.max(30,viewH*a*1.3+8):Math.max(18,viewH*a*.8+5),keep=c.crowd||4;
 const far=(m,x,z)=>Math.abs(x-camT.x)>R||Math.abs(z-camT.z)>R;
 NPC.forEach((n,i)=>{if(!n.m.visible)return;const busy=n.fan||n.st||n.g||n.rob;if(far(n.m,n.x,n.z)||(!busy&&i%4>=keep)){n.m.visible=false;if(n.pet)n.pet.visible=false}});
 if(typeof VPED!='undefined')VPED.forEach((n,i)=>{if(n.m.visible&&(far(n.m,n.x,n.z)||i%4>=keep))n.m.visible=false});
 TRAF.forEach(t=>{if(t.m&&t.m.visible&&far(t.m,t.x,t.z))t.m.visible=false})}
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{gfxCull()}catch(e){}return r}}

/* weather: light = half the rain, off = no rain or fog drawn (the weather itself still happens) */
if(typeof wxTick=='function'){const x0=wxTick;wxTick=function(dt){const r=x0.apply(this,arguments);try{const w=gfxCur().wx;
  if(w<2&&WTHR.mesh&&WTHR.mesh.visible){if(!w)WTHR.mesh.visible=false;else{const g=WTHR.mesh.geometry,d=g.drawRange;g.setDrawRange(0,Math.floor((d.count||0)/2))}}
  if(!w)WTHR.fogs.forEach(m=>m.visible=false)}catch(e){}return r}}

function gfxApply(){gfxSize();GFA.n=GFA.sum=0}

/* Settings > Graphics */
{const s0=settings;settings=function(){const r=s0.apply(this,arguments);const t=$('stt');
  if(t&&!t.querySelector('[data-t=gfx]')){const b=document.createElement('button');b.dataset.t='gfx';b.textContent='Graphics';b.onclick=()=>{STAB='gfx';stDraw()};const g=t.querySelector('[data-t=game]');g?g.after(b):t.appendChild(b);if(STAB=='gfx')stDraw()}return r}}
function gfxSet(k,v){if(k=='p'){GFX.p=v;if(v=='auto')GFX.al='high'}else{if(GFX.p!='custom')Object.assign(GFX,gfxCur());GFX.p='custom';GFX[k]=v}gfxSv();gfxApply();stDraw()}
const gfxRow=(l,k,opts,n)=>{const c=k=='p'?GFX.p:gfxCur()[k];return`<div class=so><span>${l}${n?`<small class=m>${n}</small>`:''}</span><span style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">${opts.map(([v,t])=>`<button class="${c==v?'go':''}" onclick="gfxSet('${k}',${typeof v=='string'?`'${v}'`:v})">${t}</button>`).join('')}</span></div>`};
{const b0=stBody;stBody=function(){if(STAB!='gfx')return b0.apply(this,arguments);
  return gfxRow('Preset','p',[['auto','Auto'],['low','Low'],['med','Medium'],['high','High']],GFX.p=='auto'?'Now on '+{high:'High',med:'Medium',low:'Low'}[GFX.al]:GFX.p=='custom'?'Custom':'')
  +gfxRow('Pixel size','px',[[2,'Sharp'],[3,'Normal'],[4,'Chunky'],[5,'Chunkier']],'Bigger pixels run faster')
  +gfxRow('Frame rate cap','fps',[[0,'None'],[60,'60'],[30,'30']])
  +gfxRow('Crowds','crowd',[[4,'All'],[2,'Half'],[1,'Few']])
  +gfxRow('Weather effects','wx',[[2,'Full'],[1,'Light'],[0,'Off']])
  +stTog('FPS counter',GFX.fpsOn,"GFX.fpsOn=GFX.fpsOn?0:1;gfxSv();fpsShow()",'Frames per second, top of the screen')
  +gfxRow('Draw distance','far',[[1,'Normal'],[0,'Near']],'People and cars near the edge of the screen')}}

/* FPS counter (Settings > Graphics, off by default, saved in fw_gfx as fpsOn) */
const FPSC={n:0,t:0,el:null};
function fpsShow(){if(!FPSC.el){FPSC.el=document.createElement('div');FPSC.el.style.cssText='position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:50;pointer-events:none;font:bold 12px monospace;color:#9fe39f;background:rgba(0,0,0,.55);padding:2px 6px;border-radius:4px';document.body.appendChild(FPSC.el)}
 FPSC.el.style.display=GFX.fpsOn?'block':'none';FPSC.n=0;FPSC.t=0}
function fpsTick(n){if(!GFX.fpsOn)return;if(!FPSC.el)fpsShow();FPSC.n++;if(!FPSC.t)FPSC.t=n;if(n-FPSC.t>=500){FPSC.el.textContent=Math.round(FPSC.n*1000/(n-FPSC.t))+' FPS';FPSC.n=0;FPSC.t=n}}
if(GFX.fpsOn)fpsShow();
