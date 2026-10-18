/* ===== v44.1.0: touch controls for phones and tablets =====
   Only switches on for touch devices (a coarse main pointer, or the first finger touch), so desktop play is unchanged.
   - Virtual joystick bottom-left: drag the knob to walk (analog direction through window.TCHJ, read in 07-input-loop.js)
     or to drive (it holds W/A/S/D, so every WASD check in the game works as on a keyboard).
   - Buttons bottom-right stand in for keys: Use (E), Run (Shift, toggles), Map (N), Phone (G), Storage (F), Pause (Esc).
     They send the same key events as a keyboard, so each mode keeps its own rules.
   Nothing is saved: no state fields added. Wrapped in an IIFE so no top-level names are shared. */
(function(){
const J=window.TCHJ={on:0,x:0,y:0};
let act=0,ui=null,base=null,knob=null,jid=null,jc=[0,0],jk={},runOn=0,held={};
const coarse=()=>{try{return matchMedia('(pointer:coarse)').matches}catch(_){return 0}};
const M=()=>typeof mode!='undefined'?mode:'';
const kd=(k,t)=>{try{document.body.dispatchEvent(new KeyboardEvent(t||'keydown',{key:k,bubbles:true,cancelable:true}))}catch(_){}};
const setK=(k,v)=>{if(typeof keys=='undefined')return;if(v){keys[k]=1;jk[k]=1}else if(jk[k]){delete keys[k];delete jk[k]}};

function css(){if(document.getElementById('tchcss'))return;const s=document.createElement('style');s.id='tchcss';s.textContent=`
body.tch{--tjs:clamp(104px,30vmin,150px);--tbb:clamp(56px,16vmin,76px);--tbs:clamp(38px,10.5vmin,48px);--tsl:max(16px,env(safe-area-inset-left,0px));--tsr:max(16px,env(safe-area-inset-right,0px));--tsb:max(16px,env(safe-area-inset-bottom,0px));touch-action:manipulation;overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
body.tch #c{touch-action:none}
#tch{display:none}body.tch #tch{display:block}#tch.off{display:none!important}
#tch *{box-sizing:border-box;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:none}
#tchj{position:fixed;z-index:50;left:calc(var(--tsl) - 12px);bottom:calc(var(--tsb) - 12px);width:calc(var(--tjs) + 24px);height:calc(var(--tjs) + 24px);padding:12px}
#tchj .tjb{position:relative;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#16201bcc 0,#0b0f0dcc 70%);border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008;opacity:.82;transition:opacity .15s}
#tchj .tjb:before{content:'';position:absolute;inset:22%;border-radius:50%;border:2px dashed #2a352e}
#tchj.on .tjb{opacity:1;box-shadow:inset 0 0 0 2px var(--g),4px 4px 0 #0008}
#tchj .tjk{position:absolute;left:50%;top:50%;width:44%;height:44%;margin:-22% 0 0 -22%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#7dffbf,#35f09a 35%,#12a35d);border:3px solid #000;box-shadow:inset 0 -4px 0 #0005,2px 2px 0 #0008;will-change:transform}
#tchb{position:fixed;z-index:50;right:var(--tsr);bottom:var(--tsb);width:calc(var(--tbb) + var(--tbs) + 14px);pointer-events:none}
body.tch.tdrv #tchb{bottom:calc(var(--tsb) + 176px)}
#tchb button{position:absolute;pointer-events:auto;margin:0;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;color:var(--t);background:#0b0f0dd9;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,3px 3px 0 #0008;font:9px Silkscreen,ui-monospace,monospace;line-height:1;letter-spacing:.3px}
#tchb button i{font-style:normal;font-size:calc(var(--tbs) * .42);line-height:1}
#tchb button:active,#tchb button.dn{transform:scale(.94);background:#1c221e}
#tchb .tu{right:0;bottom:0;width:var(--tbb);height:var(--tbb);border-radius:50%;font-size:10px}
#tchb .tu i{font:700 calc(var(--tbb) * .36) Silkscreen,ui-monospace,monospace;color:var(--g)}
#tchb .tu.hot{background:var(--g);color:#04120a;box-shadow:inset 0 -4px 0 #0004,3px 3px 0 #0008}#tchb .tu.hot i{color:#04120a}
#tchb .tr2{right:calc(var(--tbb) + 12px);bottom:calc(var(--tbb) * .18);width:var(--tbs);height:var(--tbs);border-radius:50%}
#tchb .tfs{right:calc(var(--tbb) + var(--tbs) + 20px);bottom:calc(var(--tbb) * .18);width:var(--tbs);height:var(--tbs);border-radius:50%}
#tchb .tr2.on{background:#f5c542;color:#1a1300;box-shadow:inset 0 -3px 0 #0004,3px 3px 0 #0008}
#tchb .tcol{position:absolute;right:calc((var(--tbb) - var(--tbs)) / 2);bottom:calc(var(--tbb) + 12px);display:flex;flex-direction:column-reverse;gap:7px;pointer-events:none}
#tchb .tcol button{position:static;width:var(--tbs);height:var(--tbs);border-radius:8px}
#tchb .hid{display:none!important}
body.tch #hud .hb.hint,body.tch #hud button.gear[onclick^="buildMode"]{display:none!important}
body.tch{--tcol:calc(var(--tbb) + var(--tbs) * 4 + 33px)}
body.tch #hud .hb.pr{bottom:calc(var(--tsb) + var(--tjs) + 26px);max-width:calc(100vw - (var(--tsr) + var(--tbs) + 16px) * 2);text-align:center}
body.tch #glc{bottom:calc(var(--tsb) + var(--tjs) + 26px)!important}
body.tch #tdlg{bottom:calc(var(--tsb) + var(--tcol) + 14px)}
@media(orientation:landscape) and (max-height:560px){
body.tch{--tjs:clamp(80px,30vmin,128px);--tbb:clamp(50px,17vmin,66px);--tbs:clamp(34px,11vmin,42px)}
body.tch canvas[style*="left: 10px"],body.tch div[style*="top: 228px"]{display:none!important}
body.tch #hud .hb.pr{bottom:calc(var(--tsb) + 6px);max-width:calc(100vw - 410px);font-size:11px}
body.tch #glc{display:none!important}
body.tch #tdlg{bottom:calc(var(--tsb) + 6px);width:min(540px,calc(100vw - 410px));padding:6px 8px;gap:8px;font-size:12px}
body.tch #tdlg canvas,body.tch #tdlg img{width:44px;height:44px}
body.tch #tqt{top:8px!important;left:282px!important;right:auto!important;width:min(300px,calc(100vw - 282px - 214px))!important;padding:5px 8px;font-size:11px}
#tchb .tcol{flex-direction:row-reverse;right:0;bottom:calc(var(--tbb) + 8px)}
#tchb{width:calc(var(--tbb) + 4 * var(--tbs) + 40px)}
#tchb .tr2{right:calc(var(--tbb) + 8px)}
#tchb .tfs{right:calc(var(--tbb) + var(--tbs) + 16px)}
}
`;document.head.appendChild(s)}

function build(){if(ui)return;css();ui=document.createElement('div');ui.id='tch';ui.className='off';
 ui.innerHTML=`<div id=tchj><div class=tjb><div class=tjk></div></div></div><div id=tchb>
<button class=tu data-k=e aria-label="Use (E)"><i>E</i>Use</button>
<button class=tr2 data-run=1 aria-label="Run (Shift)"><i>»</i>Run</button>
<button class=tfs data-fs=1 aria-label="Full screen"><i>⛶</i>Full</button>
<div class=tcol><button data-k=n data-w=map aria-label="Map (N)"><i>🗺</i>Map</button><button data-k=g data-w=ph aria-label="Phone (G)"><i>📱</i>Phone</button><button data-k=f data-w=st aria-label="Storage (F)"><i>📦</i>Store</button><button data-k=Escape data-w=pz aria-label="Pause (Esc)"><i>⏸</i>Pause</button></div></div>`;
 document.body.appendChild(ui);base=ui.querySelector('#tchj');knob=ui.querySelector('.tjk');
 ui.addEventListener('contextmenu',e=>e.preventDefault());
 /* joystick: the finger that lands on it owns it until it lifts; the knob is clamped to the ring */
 base.addEventListener('pointerdown',e=>{if(jid!=null)return;e.preventDefault();jid=e.pointerId;try{base.setPointerCapture(jid)}catch(_){}
  const r=base.querySelector('.tjb').getBoundingClientRect();jc=[r.left+r.width/2,r.top+r.height/2];base.classList.add('on');jMove(e)});
 base.addEventListener('pointermove',e=>{if(e.pointerId===jid){e.preventDefault();jMove(e)}});
 const jUp=e=>{if(e.pointerId===jid)jRel()};base.addEventListener('pointerup',jUp);base.addEventListener('pointercancel',jUp);base.addEventListener('lostpointercapture',jUp);
 /* buttons: key buttons press on finger down and release on lift, like holding a key; Run toggles */
 ui.querySelectorAll('#tchb button').forEach(b=>{
  if(b.dataset.fs){b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleFs()});return}
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(b.dataset.run){runOn=!runOn;b.classList.toggle('on',!!runOn);if(!runOn&&typeof keys!='undefined')delete keys.shift;return}
   const k=b.dataset.k;if(held[e.pointerId])return;held[e.pointerId]=k;b.classList.add('dn');try{b.setPointerCapture(e.pointerId)}catch(_){}kd(k)});
  const up=e=>{const k=held[e.pointerId];if(k==null)return;delete held[e.pointerId];b.classList.remove('dn');kd(k,'keyup')};
  b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up)})}

const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
const fsOk=()=>{const d=document,r=d.documentElement;return !!((d.fullscreenEnabled||d.webkitFullscreenEnabled)&&(r.requestFullscreen||r.webkitRequestFullscreen))};
function toggleFs(){const d=document,r=d.documentElement;try{if(fsEl()){(d.exitFullscreen||d.webkitExitFullscreen).call(d)}else{const q=(r.requestFullscreen||r.webkitRequestFullscreen).call(r,{navigationUI:'hide'});if(q&&q.catch)q.catch(()=>{});try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}}catch(_){}}
function fsMark(){if(!ui)return;const b=ui.querySelector('.tfs');if(b)b.innerHTML=fsEl()?'<i>✕</i>Exit':'<i>⛶</i>Full'}
['fullscreenchange','webkitfullscreenchange'].forEach(e=>document.addEventListener(e,fsMark));
function jMove(e){const R=base.querySelector('.tjb').getBoundingClientRect().width*.5*.72;let dx=e.clientX-jc[0],dy=e.clientY-jc[1];const d=Math.hypot(dx,dy)||1,c=Math.min(d,R);
 knob.style.transform=`translate(${dx/d*c}px,${dy/d*c}px)`;const m=c/R,x=dx/d*m,y=dy/d*m;
 if(m<.16){J.on=0;J.x=J.y=0}else{J.on=1;J.x=x;J.y=y}
 const t=.38;setK('d',J.on&&x>t);setK('a',J.on&&x<-t);setK('s',J.on&&y>t);setK('w',J.on&&y<-t)}
function jRel(){if(jid==null&&!J.on)return;try{if(jid!=null)base.releasePointerCapture(jid)}catch(_){}jid=null;J.on=0;J.x=J.y=0;['w','a','s','d'].forEach(k=>setK(k,0));if(base){base.classList.remove('on');knob.style.transform=''}}
function relAll(){jRel();for(const id in held){kd(held[id],'keyup');delete held[id]}if(ui)ui.querySelectorAll('#tchb .dn').forEach(b=>b.classList.remove('dn'))}

function enable(){if(act)return;act=1;build();document.body.classList.add('tch')}
if(coarse())(document.body?enable():addEventListener('DOMContentLoaded',enable));
addEventListener('pointerdown',e=>{if(e.pointerType=='touch')enable()},true);

/* show the controls only while walking, driving or walking at the awards; keep Run held while it is on */
const W={map:m=>m=='play',ph:m=>m=='play'&&typeof openPhone=='function'&&!(typeof S!='undefined'&&S&&S.noPhone),st:m=>m=='play'&&typeof canFurn=='function'&&canFurn(),pz:m=>m=='play'||m=='drive'};
let lastSig='';
setInterval(()=>{if(!act||!ui)return;const m=M(),ok=(m=='play'||m=='drive'||m=='cutawd')&&typeof S!='undefined'&&S&&!document.getElementById('load');
 if(!ok){if(!ui.classList.contains('off')){ui.classList.add('off');relAll()}if(typeof keys!='undefined'&&runOn&&keys.shift&&m!='pause')delete keys.shift;return}
 ui.classList.remove('off');document.body.classList.toggle('tdrv',m=='drive');
 if(typeof keys!='undefined'){if(runOn&&m=='play')keys.shift=1;else if(runOn)delete keys.shift}
 const nr=typeof near!='undefined'&&near,sig=m+'|'+(nr?1:0)+'|'+W.st(m)+'|'+W.ph(m);if(sig==lastSig)return;lastSig=sig;
 const u=ui.querySelector('.tu');u.classList.toggle('hot',!!(nr||m=='drive'));
 ui.querySelector('.tr2').classList.toggle('hid',m!='play');ui.querySelector('.tfs').classList.toggle('hid',!fsOk());
 ui.querySelectorAll('.tcol button').forEach(b=>b.classList.toggle('hid',!W[b.dataset.w](m)))},120);
addEventListener('blur',relAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden)relAll()});
})();
