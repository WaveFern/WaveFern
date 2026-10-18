/* ===== v26.110: fixed desktop grid, first-person monitor view, pause menu on the computer =====
   - Desktop icons cannot be dragged. They sit on a grid that fills left to right and starts a new row when full; if there are
     still too many for the screen the grid tightens so every icon stays visible.
   - The computer is drawn as a physical monitor seen from your chair: a bit of wall, the bezel, a stand and keyboard; the
     desktop inside it is the same, fully clickable desktop.
   - The pause menu works on the computer too: Esc opens it over the screen and switching tab or window pauses. A power button on the bottom of the monitor frame leaves the PC at once. */
const PCU={cellW:96,cellH:92,pad:14,taskbar:44};
ds=function(){};
function pcLayout(){const pc=document.getElementById('pc');if(!pc)return;const ic=[...pc.querySelectorAll('.ico')];
 ic.forEach(e=>{e.removeAttribute('onpointerdown');e.style.touchAction='auto';e.style.transform=''});
 const W=pc.clientWidth,H=pc.clientHeight-PCU.taskbar-PCU.pad,n=ic.length;if(!n||W<=0)return;
 let cw=PCU.cellW,ch=PCU.cellH;const colsOf=w=>Math.max(1,Math.floor((W-PCU.pad*2)/w));let cols=colsOf(cw),rows=Math.ceil(n/cols),sc=1;
 if(rows*ch>H-PCU.pad){sc=Math.max(.5,(H-PCU.pad)/(rows*ch));if(sc<1){cw=Math.round(cw*sc);ch=Math.round(ch*sc);cols=colsOf(cw);rows=Math.ceil(n/cols);if(rows*ch>H-PCU.pad)sc=Math.max(.45,(H-PCU.pad)/(rows*ch))}}
 ic.forEach((e,i)=>{const c=i%cols,r=Math.floor(i/cols);e.style.left=(PCU.pad+c*cw)+'px';e.style.top=(PCU.pad+r*ch)+'px';e.style.width=Math.max(60,cw-6)+'px';e.style.transformOrigin='0 0';if(sc<1)e.style.transform='scale('+Math.max(.5,Math.min(1,cw/PCU.cellW,ch/PCU.cellH))+')'});
 pcPower()}
const pcView1=()=>OPT.pcView!==0&&!window.PCSMALL;
function pcPower(){const pc=document.getElementById('pc');if(!pc)return;const ui=document.getElementById('ui');let b=document.getElementById('pcpower');
 if(!b){b=document.createElement('button');b.id='pcpower';b.title='Power off (leave the computer)';b.setAttribute('aria-label','Power off');b.onclick=()=>closePC()}
 const tb=pc.querySelector('.tb');
 if(pcView1()){if(b.parentNode!==ui)ui.appendChild(b);b.className='bez'}
 else if(b.parentNode)b.remove()}
{const p0=pcR;pcR=function(){if(PAUSED)return;const r=p0.apply(this,arguments);try{pcLayout()}catch(e){console.error('layout',e)}return r}}
{const u0=update;update=function(dt){u0(dt);const on=!!document.getElementById('pc');if(document.body.classList.contains('pcmode')!==(on||(PAUSED&&PS=='pc'))&&pcView1())document.body.classList.toggle('pcmode',on||!!(PAUSED&&PS=='pc'));if(!pcView1()&&document.body.classList.contains('pcmode'))document.body.classList.remove('pcmode')}}
addEventListener('resize',()=>{try{if(mode=='pc')pcLayout()}catch(e){}});
/* pause on the computer: keep the PC on screen and put the pause menu over it */
let PCKEEP=null;
{const pu0=pauseUI;pauseUI=function(){const ui=$('ui');document.body.classList.toggle('pcpaused',PS=='pc');if(PS=='pc'){const pc=document.getElementById('pc')||PCKEEP;if(pc)PCKEEP=pc;pu0.apply(this,arguments);if(PCKEEP&&ui&&!PCKEEP.parentNode)ui.insertBefore(PCKEEP,ui.firstChild)}else pu0.apply(this,arguments)}
 /* Settings, Stats and the rest wipe the UI; put the computer screen back underneath whenever that happens while paused on the PC */
 const ui=document.getElementById('ui');if(ui)new MutationObserver(()=>{if(PAUSED&&PS=='pc'&&PCKEEP&&!PCKEEP.parentNode)ui.insertBefore(PCKEEP,ui.firstChild)}).observe(ui,{childList:true})}

{const r0=resumeGame;resumeGame=function(){const was=PS=='pc';PCKEEP=null;document.body.classList.remove('pcpaused');const r=r0.apply(this,arguments);if(was&&mode=='pc')pcR();return r}}
{const ap=()=>{if(!PAUSED&&mode=='pc')pauseGame()};document.addEventListener('visibilitychange',()=>{if(document.hidden)ap()});addEventListener('blur',ap)}
{const st=document.createElement('style');st.textContent=`
body.pcmode #ui{background:
 linear-gradient(#0003 0 0) 0 0/100% 100% no-repeat,
 linear-gradient(#d9ccb2 0,#cdbea3 82%,#7b5231 82%,#5e3d22 100%);image-rendering:pixelated}
body.pcmode #ui::before{content:'';position:absolute;left:50%;bottom:0;width:clamp(90px,15vw,200px);height:5.5%;transform:translateX(-50%);background:#33363c}
body.pcmode #ui::after{display:none}
body.pcmode #pc{inset:1.2% 2% 5.5% 2%;border:clamp(6px,.9vw,12px) solid #1d1f24;border-bottom-width:clamp(16px,2.4vw,30px);border-radius:0;overflow:hidden;
 box-shadow:inset 0 0 0 4px #000;clip-path:polygon(0 8px,8px 8px,8px 0,calc(100% - 8px) 0,calc(100% - 8px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 8px) calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 8px),0 calc(100% - 8px))}
body.pcmode #pc::after{content:'';position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.06) 0,rgba(255,255,255,0) 35%)}
body.pcmode .ico{min-height:80px}
#pcpower{width:22px;height:22px;padding:0;border:2px solid #000;border-radius:0;background:#7a1f1f;color:#fff;cursor:pointer;font-size:0;line-height:0;image-rendering:pixelated}
#pcpower::before{content:'';display:block;margin:auto;width:8px;height:8px;border:2px solid #ffd0d0;border-top-color:transparent;border-radius:50%}
body.pcpaused #pc,body.pcpaused #pcpower{filter:blur(6px) saturate(.7) brightness(.45);pointer-events:none}
#pcpower:hover{background:#b02a2a}
#pcpower.bez{position:absolute;right:calc(2% + clamp(10px,1.6vw,22px));bottom:5.5%;width:clamp(14px,2.2vw,26px);height:clamp(14px,2.2vw,26px);z-index:3}
#pcpower.tbp{margin-left:6px;width:26px;height:24px}
`;document.head.appendChild(st)}
/* setting: monitor view */
{const b0=stBody;stBody=function(){const h=b0.apply(this,arguments);if(STAB!='game')return h;const t=stTog('First-person monitor',pcView1(),"stOpt('pcView',pcView1()?0:1)",'Off shows the computer full screen, as before');const i=h.indexOf('<p class=m>');return i<0?h+t:h.slice(0,i)+t+h.slice(i)}}

/* cosmetic drag-select rectangle on the desktop */
{let sx,sy,box=null;const ok=e=>{const p=document.getElementById('pc');return p&&e.target===p&&e.button===0};
document.addEventListener('pointerdown',e=>{if(!ok(e))return;sx=e.clientX;sy=e.clientY;box=document.createElement('div');box.id='pcsel';box.style.cssText='position:fixed;pointer-events:none;z-index:50;display:none';document.body.appendChild(box)});
document.addEventListener('pointermove',e=>{if(!box)return;const x=Math.min(sx,e.clientX),y=Math.min(sy,e.clientY),w=Math.abs(e.clientX-sx),h=Math.abs(e.clientY-sy);if(w+h<4)return;Object.assign(box.style,{display:'block',left:x+'px',top:y+'px',width:w+'px',height:h+'px'})});
const end=()=>{if(box){box.remove();box=null}};document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);addEventListener('blur',end)}
{const st=document.createElement('style');st.textContent='#pcsel{background:rgba(110,170,255,.25);border:1px solid #8cc0ff;box-sizing:border-box}';document.head.appendChild(st)}
