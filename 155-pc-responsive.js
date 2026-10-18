/* ===== v44.3.0: the computer screen fits phones and tablets =====
   On touch devices and narrow windows (PCSMALL) the computer opens full screen instead of as a scaled-down monitor, so
   everything is full size: big touch-friendly desktop icons on a grid that fills the screen, app windows that fill the
   screen, and taller taskbar and title bar buttons. Desktop icons now open their app with a single click or tap
   everywhere (no double click). The desktop look on big screens is unchanged. No saved state. Wrapped in an IIFE. */
(function(){
const small=()=>{try{return matchMedia('(pointer:coarse)').matches||document.body.classList.contains('tch')||innerWidth<=760}catch(_){return innerWidth<=760}};
Object.defineProperty(window,'PCSMALL',{get:small,configurable:true});
const st=document.createElement('style');st.textContent=`
body.pcsmall .win{left:0;right:0;top:0;bottom:52px;border-width:2px}
body.pcsmall .mn{padding:14px 12px!important}body.pcsmall .sb{width:120px}
body.pcsmall .cards{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important}
body.pcsmall .wt button{min-width:44px;min-height:36px;font-size:16px}
body.pcsmall .tb{height:52px;overflow-x:auto;white-space:nowrap}body.pcsmall .tb button{min-height:40px;font-size:14px;flex:none}
body.pcsmall .sm button{min-height:48px;font-size:16px}
body.pcsmall .ico{cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
body.pcsmall .ico:active{filter:brightness(1.3)}
`;document.head.appendChild(st);
function fix(){const pc=document.getElementById('pc'),on=!!pc&&small();document.body.classList.toggle('pcsmall',on);
 if(!pc)return;
 /* single click opens an app everywhere */
 pc.querySelectorAll('.ico[ondblclick]').forEach(e=>{e.setAttribute('onclick',e.getAttribute('ondblclick'));e.removeAttribute('ondblclick')});
 if(!on)return;
 const ic=[...pc.querySelectorAll('.ico')],n=ic.length,pad=10,tb=pc.querySelector('.tb'),W=pc.clientWidth,H=pc.clientHeight-(tb?tb.offsetHeight:52)-pad*2;
 if(!n||W<=0||H<=0)return;
 let cols=3,cw=0,ch=0;
 for(cols=3;cols<=12;cols++){cw=Math.floor((W-pad*2)/cols);ch=Math.min(Math.round(cw*1.1),120);if(Math.ceil(n/cols)*ch<=H)break}
 cols=Math.min(cols,12);cw=Math.floor((W-pad*2)/cols);ch=Math.min(Math.round(cw*1.1),120);
 const isz=Math.max(40,Math.min(76,Math.round(cw*.62)));
 ic.forEach((e,i)=>{const c=i%cols,r=Math.floor(i/cols);Object.assign(e.style,{left:(pad+c*cw)+'px',top:(pad+r*ch)+'px',width:(cw-4)+'px',transform:'',fontSize:(isz>56?14:12)+'px'});
  const im=e.querySelector('img');if(im){im.style.width=im.style.height=isz+'px'}})}
{const l0=pcLayout;pcLayout=function(){const r=l0.apply(this,arguments);try{fix()}catch(e){console.error('pcResp',e)}return r}}
addEventListener('resize',()=>{try{if(document.getElementById('pc'))pcLayout()}catch(_){}});
addEventListener('orientationchange',()=>setTimeout(()=>{try{if(document.getElementById('pc'))pcLayout()}catch(_){}},200));
})();
