/* ===== v47.3.0: controller support (Gamepad API, standard mapping: Xbox / PlayStation / Switch Pro pads) =====
   The pad stands in for the keyboard and mouse, so every mode keeps its own rules:
   - Walking: left stick (analog direction through window.TCHJ, like the touch joystick) or the D-pad. LT or L3 held: run.
     A: interact (Space). X: storage (F). Y: phone (G). View/Back: map (N). Start: pause (Esc).
   - Driving: left stick steers, RT gas, LT brake (W / S / A / D held), A gets out (E).
   - Recording, festival sets and tour shows: A is the hit / go button (Space), X Y B RB are buttons 1 2 3 4, D-pad sends the arrows.
   - Placing furniture: the left stick moves an on-screen cursor, A places or picks up what is under it, LB / RB turn,
     X stores, D-pad moves through the Storage panel, B is Done.
   - Menus, the computer, the phone and every other screen: D-pad or left stick moves a green focus ring between buttons,
     A presses, B goes back, right stick scrolls.
   While the pad is in use the HUD prompts show pad buttons instead of keys (body.gpad); touching the mouse or keyboard switches back.
   Nothing is saved. Wrapped in an IIFE so no names leak. */
(()=>{
if(!navigator.getGamepads)return;
const WORLD=new Set(['play','drive','build','rec','fest','dshow','cut','dcut','sleep','load']),MG=new Set(['rec','fest','dshow']);
const DZ=.28,NAV_SEL='button,a[href],input:not([type=hidden]),select,textarea,summary,[onclick],[ondblclick],[onpointerdown],[tabindex]:not([tabindex="-1"])';
let prev=[],held={},own=0,act=0,foc=null,fLast=null,rep={d:'',t:0},cur=null,cx=innerWidth/2,cy=innerHeight/2,lastMode='',leg=null,legT='';
const M=()=>typeof mode!='undefined'?mode:'';
const kd=(k,t)=>{try{(document.activeElement&&document.activeElement!==document.body&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)?document.activeElement:document.body).dispatchEvent(new KeyboardEvent(t||'keydown',{key:k,bubbles:true,cancelable:true}))}catch(_){}};
const hold=(k,v)=>{if(typeof keys=='undefined')return;if(v){if(!held[k]){held[k]=1;keys[k]=1;kd(k)}}else if(held[k]){delete held[k];delete keys[k];kd(k,'keyup')}};
const freeAll=()=>{Object.keys(held).forEach(k=>hold(k,0));if(own&&window.TCHJ){TCHJ.on=0;TCHJ.x=TCHJ.y=0}own=0};

/* ---- look ---- */
const st=document.createElement('style');st.textContent=`
.gpf{outline:3px solid #2fe68a!important;outline-offset:2px!important;box-shadow:0 0 0 6px #2fe68a44!important;position:relative;z-index:1}
#gpc{position:fixed;z-index:60;width:22px;height:22px;margin:-11px 0 0 -11px;border:3px solid #000;border-radius:50%;background:#2fe68a;box-shadow:0 0 0 2px #fff8,2px 2px 0 #0008;pointer-events:none;display:none}
#gpl{position:fixed;z-index:55;left:10px;bottom:10px;max-width:calc(100vw - 20px);padding:6px 9px;background:#0b0f0de6;border:2px solid #000;box-shadow:inset 0 0 0 2px #2a352e,3px 3px 0 #0008;color:#cfe;font:11px/1.4 ui-monospace,Menlo,monospace;pointer-events:none;display:none}
body.gpad #gpl.on{display:block}
#gpl b{color:#2fe68a;font-weight:bold}
body.gpad,body.gpad *{cursor:none}
`;document.head.appendChild(st);
const legend=()=>{if(!leg){leg=document.createElement('div');leg.id='gpl';document.body.appendChild(leg);cur=document.createElement('div');cur.id='gpc';document.body.appendChild(cur)}};
const setLeg=t=>{legend();if(t!==legT){legT=t;leg.innerHTML=t}leg.classList.toggle('on',!!t)};
const on=()=>{if(!act){act=1;document.body.classList.add('gpad')}};
const offPad=()=>{if(act){act=0;document.body.classList.remove('gpad');setFoc(null);if(cur)cur.style.display='none'}};
addEventListener('mousemove',e=>{if(e.isTrusted&&(Math.abs(e.movementX)+Math.abs(e.movementY)>3))offPad()},true);
addEventListener('keydown',e=>{if(e.isTrusted)offPad()},true);
addEventListener('touchstart',()=>offPad(),true);
addEventListener('gamepadconnected',e=>{try{say('🎮 Controller connected: left stick to move, A to interact, Start to pause.')}catch(_){}});
addEventListener('gamepaddisconnected',()=>{freeAll();offPad()});

/* ---- focus ring for menus ---- */
const vis=el=>{if(el.disabled||el.closest('#tch,#gpl'))return 0;const r=el.getBoundingClientRect();if(r.width<4||r.height<4||r.bottom<0||r.right<0||r.top>innerHeight||r.left>innerWidth)return 0;
 const x=Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),y=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2)),t=document.elementFromPoint(x,y);return!!t&&(t===el||el.contains(t)||t.contains(el))};
const cands=()=>{let all=[...document.querySelectorAll(NAV_SEL)].filter(vis);const u=document.getElementById('ui'),inU=all.filter(e=>u&&u.contains(e));if(inU.length)all=inU;/* an open screen keeps the ring off the HUD behind it *//* skip a wrapper whose clickable child is also listed */
 return all.filter(el=>!all.some(o=>o!==el&&el.contains(o)&&o.matches('button,a[href],input,select,textarea')))};
const ctr=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,r}};
function setFoc(el){if(foc&&foc!==el)foc.classList.remove('gpf');foc=el;if(el){el.classList.add('gpf');const c=ctr(el);fLast={x:c.x,y:c.y,t:(el.textContent||'').trim().slice(0,40)};try{el.scrollIntoView({block:'nearest',inline:'nearest'})}catch(_){}}}
function first(){const c=cands();if(!c.length)return null;const m=document.querySelector('#ui .modal,#ui .box');const inM=m?c.filter(e=>m.contains(e)):[];const L=inM.length?inM:c;
 return L.find(e=>e.classList.contains('go'))||L.sort((a,b)=>{const A=ctr(a),B=ctr(b);return Math.abs(A.y-B.y)>8?A.y-B.y:A.x-B.x})[0]}
/* after a click the screen is often redrawn: find the same button again (same text, else nearest to where it was) */
function refind(){if(foc&&document.contains(foc)&&vis(foc))return foc;if(foc)foc.classList.remove('gpf');foc=null;if(!fLast)return null;const c=cands();if(!c.length)return null;
 const same=c.filter(e=>(e.textContent||'').trim().slice(0,40)==fLast.t);const L=same.length?same:c;let b=null,bd=1e9;L.forEach(e=>{const p=ctr(e),d=Math.hypot(p.x-fLast.x,p.y-fLast.y);if(d<bd){bd=d;b=e}});
 if(b&&(same.length||bd<120)){setFoc(b);return b}return null}
function move(dx,dy){let f=refind();if(!f){setFoc(first());return}const a=ctr(f);let best=null,bs=1e9;
 cands().forEach(el=>{if(el===f)return;const b=ctr(el),vx=b.x-a.x,vy=b.y-a.y,along=vx*dx+vy*dy;if(along<6)return;
  const ov=dx?Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top):Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left),orth=ov>0?0:Math.abs(vx*dy-vy*dx);
  const s=along+orth*2.5;if(s<bs){bs=s;best=el}});
 if(best){setFoc(best);try{snd('click')}catch(_){}}}
function press(el){if(!el)return;const t=el.tagName;
 if(t=='INPUT'&&/^(text|search|number|email|password|)$/.test(el.type||'')||t=='TEXTAREA'){el.focus();return}
 if(t=='SELECT'){const n=el.options.length;if(n){el.selectedIndex=(el.selectedIndex+1)%n;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}return}
 if(t=='INPUT'&&el.type=='range'){return}
 if(el.hasAttribute('ondblclick')&&!el.hasAttribute('onclick')){el.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true}));return}
 if(el.hasAttribute('onpointerdown')&&!el.hasAttribute('onclick')&&t!='BUTTON'){const c=ctr(el),o={bubbles:true,cancelable:true,clientX:c.x,clientY:c.y,pointerId:7,pointerType:'mouse',button:0,buttons:1};
  el.dispatchEvent(new PointerEvent('pointerdown',o));setTimeout(()=>el.dispatchEvent(new PointerEvent('pointerup',{...o,buttons:0})),60);return}
 if(el.hasAttribute('onpointerdown')){const c=ctr(el);el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,clientX:c.x,clientY:c.y,pointerId:7,pointerType:'mouse',button:0,buttons:1}))}
 el.click()}
const range=(el,d)=>{if(el&&el.tagName=='INPUT'&&el.type=='range'){const s=+el.step||1;el.value=+el.value+d*s*(((+el.max||100)-(+el.min||0))/s>40?5:1);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return 1}return 0};
function scroll(dy,dt){let el=foc||document.querySelector('#ui .modal,#ui .box,#pc .win .wb,#pc');while(el&&el!==document.body){const s=getComputedStyle(el);if(/(auto|scroll)/.test(s.overflowY)&&el.scrollHeight>el.clientHeight+2)break;el=el.parentElement}
 (el&&el!==document.body?el:document.scrollingElement).scrollBy(0,dy*900*dt)}

/* ---- the build cursor (placing furniture) ---- */
const cvs=()=>document.getElementById('c');
const ptr=(type,b)=>{const c=cvs();if(c)c.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:cx,clientY:cy,pointerId:7,pointerType:'mouse',button:0,buttons:b?1:0,isPrimary:true}))};

/* ---- prompts ---- */
const P_=s=>'<b>'+s+'</b>';
function prompts(m){const hud=document.getElementById('hud');if(hud){
  const pr=hud.querySelector('.hb.pr');if(pr&&!pr.dataset.gp){const t=pr.textContent;if(/^\[E\] Exit car/.test(t))pr.innerHTML=`${P_('A')} Exit car · ${P_('RT')} drive · ${P_('LT')} brake · stick steer`;else if(/^\[E\]/.test(t))pr.innerHTML=P_('A')+' '+esc0(t.slice(4));pr.dataset.gp=1}
  const hi=hud.querySelector('.hb.hint');if(hi&&!hi.dataset.gp){hi.innerHTML=`Stick move (${P_('LT')} run) · ${P_('A')} interact · ${P_('X')} storage · ${P_('Y')} phone · ${P_('View')} map · ${P_('Start')} pause`;hi.dataset.gp=1}
  hud.querySelectorAll('button').forEach(b=>{if(!b.dataset.gp&&/\[F\]/.test(b.textContent)){b.innerHTML=b.innerHTML.replace('[F]','[X]');b.dataset.gp=1}})}
 let t='';
 if(MG.has(m))t=`${P_('A')} hit / go · ${P_('X')} 1 · ${P_('Y')} 2 · ${P_('B')} 3 · ${P_('RB')} 4 · ${P_('Start')} quit`;
 else if(m=='build')t=`Stick: cursor · ${P_('A')} place / pick up · ${P_('LB')}/${P_('RB')} turn · ${P_('X')} store · D-pad: panel · ${P_('B')} done`;
 else if(m=='drive'||m=='play'||m=='load'||m=='sleep')t='';
 else if(m=='cut'||m=='dcut')t=`${P_('A')} continue`;
 else t=`D-pad: move · ${P_('A')} select · ${P_('B')} back · right stick: scroll`;
 setLeg(t)}
const esc0=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---- the poll ---- */
let lt=performance.now();
function tick(now){requestAnimationFrame(tick);const dt=Math.min(.1,(now-lt)/1000);lt=now;
 let g=null;try{const ps=[...navigator.getGamepads()].filter(p=>p&&p.connected);g=ps.find(p=>p.mapping=='standard')||ps[0]||null}catch(_){}
 if(!g){if(Object.keys(held).length||own)freeAll();prev=[];return}
 const B=i=>{const b=g.buttons[i];return!!b&&(b.pressed||b.value>.5)},V=i=>{const b=g.buttons[i];return b?b.value:0},dn=i=>B(i)&&!prev[i];
 const ax=g.axes[0]||0,ay=g.axes[1]||0,rx=g.axes[2]||0,ry=g.axes[3]||0,mag=Math.hypot(ax,ay),stick=mag>DZ;
 const any=g.buttons.some((b,i)=>b&&b.pressed)||stick||Math.abs(ry)>DZ||Math.abs(rx)>DZ;if(any)on();
 if(!act){prev=g.buttons.map((_,i)=>B(i));return}
 const m=M(),phCam=typeof PH!='undefined'&&PH&&PH.camOn,world=WORLD.has(m)||phCam;
 const modal=!!document.querySelector('#ui .modal');
 if(m!==lastMode){lastMode=m;if(m!='build'&&cur)cur.style.display='none';if(world&&m!='build')setFoc(null)}
 const du=B(12),dd=B(13),dl=B(14),dr=B(15);

 /* navigation (menus, and the Storage panel / end-of-set screens in the world) */
 const navOK=!world||modal||m=='build';
 if(navOK){let d='';const useStick=!world&&stick;
  if(du||useStick&&ay<-.5&&Math.abs(ay)>Math.abs(ax))d='u';else if(dd||useStick&&ay>.5&&Math.abs(ay)>Math.abs(ax))d='d';else if(dl||useStick&&ax<-.5)d='l';else if(dr||useStick&&ax>.5)d='r';
  if(d){if(d!=rep.d){rep.d=d;rep.t=now+380;step(d)}else if(now>=rep.t){rep.t=now+110;step(d)}}else rep.d='';
  if(Math.abs(ry)>DZ)scroll(ry,dt)}
 function step(d){const f=refind();if((d=='l'||d=='r')&&f&&range(f,d=='r'?1:-1))return;move(d=='l'?-1:d=='r'?1:0,d=='u'?-1:d=='d'?1:0)}

 if(!world){freeAll();
  if(dn(0)){const f=refind()||null;if(f)press(f);else setFoc(first())}
  if(dn(1)){if(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))document.activeElement.blur();else if(m=='pc'&&typeof closePC=='function'&&!document.querySelector('#ui .modal')){/* B closes the open window first, then the computer */const x=typeof app!='undefined'&&app?[...document.querySelectorAll('#ui .win .wt button')].pop():null;if(x)x.click();else closePC()}else if(m=='phone')kd('g');else kd('Escape')}
  if(dn(9))kd('Escape');
 }else if(m=='build'){
  if(stick){cx=Math.max(0,Math.min(innerWidth,cx+ax*Math.min(1,mag)*900*dt));cy=Math.max(0,Math.min(innerHeight,cy+ay*Math.min(1,mag)*900*dt));if(foc){foc.classList.remove('gpf');foc=null;fLast=null}ptr('pointermove',0)}
  legend();cur.style.display='block';cur.style.left=cx+'px';cur.style.top=cy+'px';
  if(dn(0)){const f=foc&&document.contains(foc)?foc:null;if(f)press(f);else{ptr('pointerdown',1);setTimeout(()=>ptr('pointerup',0),40)}}
  if(dn(4)&&typeof PBdo=='function')PBdo('rl');if(dn(5)&&typeof PBdo=='function')PBdo('rr');
  if(dn(2))kd('e');if(dn(1)||dn(9))kd('Escape');
 }else{
  /* walking, driving, minigames, cutscenes */
  if(m=='play'&&!phCam&&window.TCHJ){if(stick){TCHJ.on=1;TCHJ.x=ax;TCHJ.y=ay;own=1}else if(own){TCHJ.on=0;TCHJ.x=TCHJ.y=0;own=0}}
  else{hold('a',stick&&ax<-.45);hold('d',stick&&ax>.45);
   hold('w',m=='drive'?V(7)>.2||stick&&ay<-.6:stick&&ay<-.45);hold('s',m=='drive'?V(6)>.2||stick&&ay>.6:stick&&ay>.45)}
  hold('shift',m=='play'&&(V(6)>.3||B(10)));
  if(!modal){hold('arrowup',du);hold('arrowdown',dd);hold('arrowleft',dl);hold('arrowright',dr)}
  if(modal&&dn(0)&&foc&&document.contains(foc))press(foc);
  else if(dn(0)){if(m=='drive')kd('e');else{kd(' ');held[' ']=1;if(typeof keys!='undefined')keys[' ']=1}}
  if(!B(0)&&held[' ']){delete held[' '];if(typeof keys!='undefined')delete keys[' '];kd(' ','keyup')}
  if(MG.has(m)){if(dn(2))kd('1');if(dn(3))kd('2');if(dn(1))kd('3');if(dn(5))kd('4')}
  else if(m=='play'||phCam){if(dn(2))kd('f');if(dn(3))kd('g');if(dn(8))kd('n');if(dn(1)&&phCam)kd('g')}
  if(dn(9))kd('Escape');
 }
 prompts(phCam?'play':m);
 prev=g.buttons.map((_,i)=>B(i))}
requestAnimationFrame(tick);
})();
