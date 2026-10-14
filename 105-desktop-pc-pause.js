/* ===== v26.110: fixed desktop grid, first-person monitor view, pause menu on the computer =====
   - Desktop icons cannot be dragged. They sit on a grid that fills left to right and starts a new row when full; if there are
     still too many for the screen the grid tightens so every icon stays visible.
   - The computer is drawn as a physical monitor seen from your chair: a bit of wall, the bezel, a stand and keyboard; the
     desktop inside it is the same, fully clickable desktop.
   - The pause menu works on the computer too: a Pause button in the taskbar, the P key, and switching tab or window pauses. */
const PCU={cellW:96,cellH:92,pad:14,taskbar:44};
ds=function(){};
function pcLayout(){const pc=document.getElementById('pc');if(!pc)return;const ic=[...pc.querySelectorAll('.ico')];
 ic.forEach(e=>{e.removeAttribute('onpointerdown');e.style.touchAction='auto';e.style.transform=''});
 const W=pc.clientWidth,H=pc.clientHeight-PCU.taskbar-PCU.pad,n=ic.length;if(!n||W<=0)return;
 let cw=PCU.cellW,ch=PCU.cellH;const colsOf=w=>Math.max(1,Math.floor((W-PCU.pad*2)/w));let cols=colsOf(cw),rows=Math.ceil(n/cols),sc=1;
 if(rows*ch>H-PCU.pad){sc=Math.max(.5,(H-PCU.pad)/(rows*ch));if(sc<1){cw=Math.round(cw*sc);ch=Math.round(ch*sc);cols=colsOf(cw);rows=Math.ceil(n/cols);if(rows*ch>H-PCU.pad)sc=Math.max(.45,(H-PCU.pad)/(rows*ch))}}
 ic.forEach((e,i)=>{const c=i%cols,r=Math.floor(i/cols);e.style.left=(PCU.pad+c*cw)+'px';e.style.top=(PCU.pad+r*ch)+'px';e.style.width=Math.max(60,cw-6)+'px';e.style.transformOrigin='0 0';if(sc<1)e.style.transform='scale('+Math.max(.5,Math.min(1,cw/PCU.cellW,ch/PCU.cellH))+')'});
 const tb=pc.querySelector('.tb');if(tb&&!tb.querySelector('#pcpause')){const b=document.createElement('button');b.id='pcpause';b.textContent='⏸ Pause';b.title='Pause (P)';b.onclick=()=>pauseGame();const sp=[...tb.children].find(x=>x.tagName=='SPAN'&&x.style.flex);tb.insertBefore(b,sp||null)}}
{const p0=pcR;pcR=function(){if(PAUSED)return;const r=p0.apply(this,arguments);try{pcLayout()}catch(e){console.error('layout',e)}return r}}
{const u0=update;update=function(dt){u0(dt);const on=!!document.getElementById('pc');if(document.body.classList.contains('pcmode')!==on)document.body.classList.toggle('pcmode',on)}}
addEventListener('resize',()=>{try{if(mode=='pc')pcLayout()}catch(e){}});
/* pause on the computer */
{const r0=resumeGame;resumeGame=function(){const was=PS=='pc';const r=r0.apply(this,arguments);if(was&&mode=='pc')pcR();return r}}
addEventListener('keydown',e=>{if(e.key.toLowerCase()=='p'&&!e.repeat&&mode=='pc'&&!PAUSED&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();pauseGame()}});
{const ap=()=>{if(!PAUSED&&mode=='pc')pauseGame()};document.addEventListener('visibilitychange',()=>{if(document.hidden)ap()});addEventListener('blur',ap)}
{const st=document.createElement('style');st.textContent=`
body.pcmode #ui{background:linear-gradient(#d9ccb2 0,#cdbea3 80%,#7b5231 80%,#5e3d22 100%)}
body.pcmode #ui::before{content:'';position:absolute;left:50%;bottom:1.2%;width:min(54%,640px);height:5.5%;transform:translateX(-50%);background:repeating-linear-gradient(90deg,#34373d 0 9px,#2a2c31 9px 11px);border-radius:6px;box-shadow:0 4px 0 #17181b,0 10px 18px #0006;opacity:.96}
body.pcmode #ui::after{content:'';position:absolute;left:50%;bottom:7%;width:9%;height:11%;transform:translateX(-50%);background:linear-gradient(90deg,#17181b,#2b2d33,#17181b);border-radius:4px 4px 0 0;box-shadow:0 8px 0 -2px #202226,0 0 0 0 #000}
body.pcmode #pc{inset:4.5% 6.5% 15% 6.5%;border:clamp(8px,1.3vw,18px) solid #1d1f24;border-bottom-width:clamp(18px,2.6vw,34px);border-radius:12px;overflow:hidden;box-shadow:0 0 0 3px #0b0c0e,0 14px 34px #0008,inset 0 0 50px #0006,inset 0 0 0 2px #000}
body.pcmode #pc::after{content:'';position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.07) 0,rgba(255,255,255,0) 35%);}
body.pcmode .ico{min-height:80px}
#pcpause{margin-left:6px}
`;document.head.appendChild(st)}
