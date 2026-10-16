/* ===== v41.0.0: the monitor screen keeps a desktop-size layout =====
   In the first-person monitor view the computer screen is laid out at a design size of at least PCFIT.w x PCFIT.h
   and scaled as a whole to fit inside the monitor, so Spotifly and the other apps never get squished by a small,
   short or narrow window. It re-fits every time the screen is drawn, when the window or zoom changes, when the
   pause menu or settings redraw the screen, and a moment after the computer opens. The narrow-window CSS rules in
   style.css skip body.pcmode, because the monitor screen is always desktop size. */
const PCFIT={w:1024,h:680,s:1};
const PCFIT_KEYS=['left','top','right','bottom','width','height','boxSizing','borderWidth','borderBottomWidth','transform','transformOrigin'];
function pcFit(){const pc=document.getElementById('pc'),on=!!pc&&pcView1();
 document.body.classList.toggle('pcmode',on);
 if(!pc){PCFIT.s=1;return}
 if(!on){if(pc.dataset.fit){PCFIT_KEYS.forEach(k=>pc.style[k]='');delete pc.dataset.fit}PCFIT.s=1;return}
 const de=document.documentElement,vw=de.clientWidth||innerWidth||1280,vh=de.clientHeight||innerHeight||800;
 const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
 /* same frame as the monitor CSS in 105-desktop-pc-pause.js: inset 1.2% 2% 5.5% 2%, side bezel clamp(6px,.9vw,12px), bottom clamp(16px,2.4vw,30px) */
 const L=vw*.02,T=vh*.012,Wo=Math.max(80,vw*.96),Ho=Math.max(60,vh*(1-.012-.055)),bd=cl(vw*.009,6,12),bb=cl(vw*.024,16,30);
 const s=cl(Math.min(1,(Wo-2*bd)/PCFIT.w,(Ho-bd-bb)/PCFIT.h),.2,1);
 Object.assign(pc.style,{left:L+'px',top:T+'px',right:'auto',bottom:'auto',width:(Wo/s)+'px',height:(Ho/s)+'px',boxSizing:'border-box',
  borderWidth:(bd/s)+'px',borderBottomWidth:(bb/s)+'px',transform:s<1?'scale('+s+')':'',transformOrigin:'0 0'});
 pc.dataset.fit=1;PCFIT.s=s}
/* turn a mouse position into a position inside the (maybe scaled) screen */
function pcLocal(x,y){const pc=document.getElementById('pc');if(!pc)return[x,y];const r=pc.getBoundingClientRect(),s=PCFIT.s||1;return[(x-r.left)/s-pc.clientLeft,(y-r.top)/s-pc.clientTop]}
/* every draw of the screen runs pcLayout (icon grid), so fit first: the grid then uses the real design size */
{const l0=pcLayout;pcLayout=function(){try{pcFit()}catch(e){console.error('pcFit',e)}const r=l0.apply(this,arguments);
 /* the wallpaper menu is clamped to the window size by 11-os-v2.js; on a scaled screen use the screen's own size */
 const m=PCFIT.s<1&&Array.isArray(wpo)&&document.querySelector('#pc .wpp');if(m){m.style.left=wpo[0]+'px';m.style.top=wpo[1]+'px'}return r}}
{const f=()=>{try{if(document.getElementById('pc'))pcLayout();else pcFit()}catch(e){}};
 addEventListener('resize',f);if(window.visualViewport)visualViewport.addEventListener('resize',f);
 /* screens drawn outside pcR (pause menu, settings, safe mode) */
 const ui=document.getElementById('ui');if(ui)new MutationObserver(()=>{const pc=document.getElementById('pc');if(pc?!pc.dataset.fit||!pcView1():document.body.classList.contains('pcmode'))f()}).observe(ui,{childList:true});
 const o0=openPC;openPC=function(){const r=o0.apply(this,arguments);requestAnimationFrame(f);setTimeout(f,250);return r}
 const s0=stOpt;stOpt=function(){const r=s0.apply(this,arguments);f();return r}}
/* right-click wallpaper menu: place it where you clicked inside the scaled screen */
addEventListener('contextmenu',e=>{if(mode!='pc'||!wpo||PCFIT.s==1||e.target.id!='pc')return;const pc=document.getElementById('pc');if(!pc)return;const q=pcLocal(e.clientX,e.clientY);wpo=[Math.max(0,Math.min(q[0],pc.clientWidth-360)),Math.max(0,Math.min(q[1],pc.clientHeight-300))];pcR()});
