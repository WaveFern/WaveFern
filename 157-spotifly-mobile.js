/* ===== v44.5.0: Spotifly on a phone held upright, a now-playing mini bar, no Phone button without a phone, no accidental zoom =====
   - On a phone or tablet held upright, the computer's Spotifly app looks like the Gphone one: dark, a smaller artist header, and
     the pages as a row of tabs along the top instead of a side menu.
   - A mini bar at the bottom shows the song that is playing with a pause / play button (tap the song to see more). It shows
     on the computer (upright phone screens) and on the Gphone, like the desktop Spotifly player.
   - The touch Phone button hides while you do not own a phone (S.noPhone).
   Nothing is saved. Wrapped in an IIFE. */
(function(){
const up=()=>{try{return matchMedia('(orientation:portrait) and (max-width:760px)').matches}catch(_){return innerWidth<=760&&innerHeight>innerWidth}};
const st=document.createElement('style');st.textContent=`
.sfmini{display:flex;align-items:center;gap:10px;flex:none;box-sizing:border-box;height:56px;padding:6px 10px;background:#181d1a;color:#fff;border-top:2px solid #000;font-family:inherit;touch-action:manipulation}
.sfmini img{width:42px;height:42px;flex:none;border:2px solid #000;image-rendering:pixelated;box-sizing:border-box}
.sfmini .smt{flex:1;min-width:0;display:flex;flex-direction:column}
.sfmini .smt b,.sfmini .smt span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sfmini .smt b{font-size:13px}.sfmini .smt span{font-size:11px;color:#8aa094}
.sfmini button{flex:none;width:44px;height:44px;padding:0;border-radius:50%;background:#2fe68a;color:#04120a;border:2px solid #000;box-shadow:2px 2px 0 #0008;display:flex;align-items:center;justify-content:center;cursor:pointer}
.sfmini button svg,.sfmini button .sfi{height:18px;width:auto}
.sfmini .smp{position:absolute;left:0;right:0;bottom:0;height:3px;background:#0008}.sfmini .smp i{display:block;height:100%;background:#2fe68a}
.sfmini{position:relative}
#pc>.sfmini{position:absolute;left:0;right:0;bottom:52px;z-index:5}
@media (orientation:portrait) and (max-width:760px){
body.pcsmall.sfmn .win{bottom:108px}
body.pcsmall .win.sfw .sfpb,body.pcsmall .win.sfw .sfnp{display:none}
body.pcsmall .win.sfw .wb{flex-direction:column}
body.pcsmall .win.sfw .sb{width:auto;flex:none;flex-direction:row;align-items:center;gap:6px;overflow-x:auto!important;overflow-y:hidden;white-space:nowrap;padding:6px 10px;background:#0c0f0d;border:0;border-bottom:2px solid #000;-webkit-overflow-scrolling:touch}
body.pcsmall .win.sfw .sb .pf,body.pcsmall .win.sfw .sb h3{display:none}
body.pcsmall .win.sfw .sb button{flex:none;width:auto;min-height:36px;margin:0;padding:6px 14px;background:transparent;color:#8aa094;border:0;border-bottom:3px solid transparent;border-radius:0;box-shadow:none;font:700 12px Silkscreen,ui-monospace,monospace}
body.pcsmall .win.sfw .sb button.on{color:#e8f3ec;border-bottom-color:#2fe68a;background:transparent}
body.pcsmall .win.sfw .mn{background:#0c0f0d}
body.pcsmall .sfhd{height:210px;padding:0 14px 10px}
body.pcsmall .sfnm{font-size:28px!important;margin-bottom:6px;text-shadow:3px 3px 0 #000}
body.pcsmall .sfart{right:0;height:100%;top:0}
body.pcsmall .sfbd{padding:12px 14px 20px;background:linear-gradient(color-mix(in srgb,var(--acc) 70%,#000),#0c0f0d 200px)}
body.pcsmall .sfact{gap:10px;margin-bottom:12px;flex-wrap:wrap}
body.pcsmall .sfgo{width:52px;height:52px}
}
`;document.head.appendChild(st);
const num=c=>{try{const d=sfLenB()*60/(c.bpm||90);return Math.min(100,sfEl(c)/d*100).toFixed(1)}catch(_){return 0}};
function mini(c,pl){return`<img src="${sfCover(c.src)}" alt=""><div class=smt><b>${esc(c.src.title)}</b><span>${esc(S.artist||'')}</span></div><button aria-label="${pl?'Pause':'Play'}" title="${pl?'Pause':'Play'}" onclick="sfToggle();event.stopPropagation()">${sfIco(pl?'pause':'play')}</button><div class=smp><i style="width:${num(c)}%"></i></div>`}
function put(host,want){let el=host&&host.querySelector(':scope>.sfmini');
 if(!want||!host){if(el)el.remove();return false}
 const key=want.src.id+'|'+(want.held?1:0);
 if(!el){el=document.createElement('div');el.className='sfmini';host.appendChild(el)}
 if(el.dataset.k!=key){el.dataset.k=key;el.innerHTML=mini(want,!want.held)}
 else{const i=el.querySelector('.smp i');if(i)i.style.width=num(want)+'%'}
 return true}
function sync(){try{if(typeof S=='undefined'||!S||typeof sfCur!='function')return;const c=sfCur(),ok=!!(c&&sfIsSong(c)),pc=document.getElementById('pc'),ph=document.getElementById('ph');
 const onPc=!!pc&&mode=='pc'&&document.body.classList.contains('pcsmall')&&up();
 const r=put(pc,onPc&&ok?c:null);document.body.classList.toggle('sfmn',r);
 put(ph&&ph.querySelector('.phw'),ph&&ok?c:null)}catch(e){}}
setInterval(sync,250);
/* no accidental zoom: touch-action, plus iOS ignores user-scalable so block pinch gestures and double-tap zoom */
st.textContent+='html,body{touch-action:manipulation}';
for(const t of ['gesturestart','gesturechange','gestureend'])document.addEventListener(t,e=>e.preventDefault(),{passive:false});
let lt=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lt<300&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName||'')))e.preventDefault();lt=n},{passive:false});
})();
