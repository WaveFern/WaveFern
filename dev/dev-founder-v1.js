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
})();
