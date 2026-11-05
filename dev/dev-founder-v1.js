/* WaveFern dev: nicer Founder look. Only loaded on /dev/. Visual only: no reward, item or save values change.
   Restyles the Founder chip (artist page, pause menu) and the pixel mark from 206-founder.js: a foil panel with a pixel
   border, a rarity tag, a soft glow and a slow shine sweep. Same markup, so everything that shows the chip gets it. */
(function(){
 if(!window.FW_DEV||document.getElementById('fw-founder-css'))return;
 const s=document.createElement('style');s.id='fw-founder-css';s.textContent=`
.fdc{position:relative;overflow:hidden;gap:8px;margin:8px 0 4px;padding:6px 12px 6px 8px;border:3px solid #2fe68a;border-radius:0;
 background:linear-gradient(135deg,#0b0f0d 0%,#12301f 48%,#0b0f0d 100%);
 box-shadow:inset 0 0 0 2px #0b0f0d,inset 0 0 0 3px #1d6b43,3px 3px 0 #04100a,0 0 14px #2fe68a55;animation:fdglow 3.4s ease-in-out infinite}
.fdc::before{content:"LEGENDARY";position:absolute;top:0;right:0;font:7px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#0b0f0d;background:#7dffb8;padding:1px 4px}
.fdc::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 42%,rgba(255,255,255,.35) 50%,transparent 58%);transform:translateX(-130%);animation:fdsweep 5s ease-in-out infinite}
.fdc .fdm{width:20px!important;height:20px!important;filter:drop-shadow(0 0 3px #2fe68a)}
.fdc .fdm svg{width:20px;height:20px}
.fdc b{font-size:12px;letter-spacing:3px;background:linear-gradient(180deg,#d6ffe9,#2fe68a 60%,#14a85e);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none}
.fdc small{font:8px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#8fd8b0;text-transform:uppercase;padding-top:9px}
.fdm{filter:drop-shadow(0 0 2px #2fe68a99)}
@keyframes fdglow{0%,100%{box-shadow:inset 0 0 0 2px #0b0f0d,inset 0 0 0 3px #1d6b43,3px 3px 0 #04100a,0 0 8px #2fe68a44}50%{box-shadow:inset 0 0 0 2px #0b0f0d,inset 0 0 0 3px #2fe68a,3px 3px 0 #04100a,0 0 18px #2fe68a99}}
@keyframes fdsweep{0%,60%{transform:translateX(-130%)}100%{transform:translateX(130%)}}
@media (prefers-reduced-motion:reduce){.fdc,.fdc::after{animation:none}}`;
 document.head.appendChild(s);

 /* ---- clothes: extra detail on the Founder Bomber (id 1000) and Cap (id 1001). Only adds pieces on top of the originals. ---- */
 function dress(){
  if(typeof XNEW!='object'||typeof xb!='function'||!XNEW.jk||!XNEW.jk[1000]||!XNEW.ht||!XNEW.ht[1001]||XNEW.jk[1000].fwd)return;
  const FO='~#2fe68a',HI='*#9dffcf',DK='#0e2417',INK='#0b0f0d',jk0=XNEW.jk[1000],ht0=XNEW.ht[1001];
  XNEW.jk[1000]=function(x,c){
   jk0.apply(this,arguments);
   const{g,w,d,arms}=x,zb=-(d/2+.052)-.012,zf=d/2+.06;
   /* back crest: a framed panel around the foil fern, with corner studs and a bright star above */
   const cw=.6,ch=.7,cy=.86;
   [[0,cy+ch/2,cw,.016],[0,cy-ch/2,cw,.016]].forEach(a=>xb(g,a[2],a[3],.012,FO,a[0],a[1],zb));
   [-1,1].forEach(s=>xb(g,.016,ch,.012,FO,s*cw/2,cy,zb));
   [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(a=>xb(g,.045,.045,.016,HI,a[0]*cw/2,cy+a[1]*ch/2,zb-.004));
   xb(g,.05,.05,.016,HI,0,cy+ch/2+.07,zb-.004);xb(g,.02,.11,.014,HI,0,cy+ch/2+.07,zb-.004);xb(g,.11,.02,.014,HI,0,cy+ch/2+.07,zb-.004);
   /* a foil yoke line across the shoulders and a second tone stripe down the back */
   xb(g,w*.96,.014,.012,FO,0,1.02,zb);xb(g,w*.96,.01,.012,HI,0,1.0,zb);
   /* sleeves: two foil bands and a bright shoulder patch */
   arms.forEach(a=>{xb(a,.206,.014,.256,FO,0,-.16,0);xb(a,.206,.014,.256,FO,0,-.215,0);xb(a,.206,.008,.256,HI,0,-.188,0);xb(a,.215,.09,.265,DK,0,.02,0);xb(a,.218,.012,.268,FO,0,.07,0)});
   /* chest: foil trim down both sides of the zip and a name-tab */
   [-1,1].forEach(s=>xb(g,.012,.52,.01,FO,s*.075,.83,zf));
   xb(g,.16,.05,.012,INK,-w*.24,.88,zf);xb(g,.12,.01,.014,HI,-w*.24,.88,zf+.002);
  };
  XNEW.jk[1000].fwd=1;
  XNEW.ht[1001]=function(x,c){
   ht0.apply(this,arguments);
   const{h}=x;
   /* cap: foil seam lines up the crown, a bright button, a back strap with foil */
   [-.2,0,.2].forEach(o=>xb(h,.012,.1,.62,FO,o,.45,-.01));
   xb(h,.07,.04,.07,HI,0,.5,-.01);
   xb(h,.62,.03,.03,DK,0,.34,-.34);xb(h,.4,.01,.034,FO,0,.34,-.34);
   xb(h,.56,.012,.012,HI,0,.28,.62,.16,0,0);
  };
  XNEW.ht[1001].fwd=1;
 }
 dress();document.addEventListener('DOMContentLoaded',dress);window.addEventListener('load',dress);setTimeout(dress,500);setTimeout(dress,2500);
})();
