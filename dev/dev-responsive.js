/* WaveFern dev responsive pass (v1). Only loaded on /dev/ (see dev/index.html); the live game is untouched.
   Makes the menus fit and stay usable on phones, foldables and tablets in portrait and landscape:
   - every pop-up (.modal / pause / shop / settings) is capped to the visible screen and scrolls inside itself
   - the world map shrinks to fit short (landscape) screens instead of running off the top and bottom
   - bigger tap targets on touch screens (sliders, small buttons, colour swatches), no double-tap zoom delay
   - safe-area padding for notches / home bar / rounded corners, on every side
   - uses dvh so the iPhone Safari toolbar does not cut off the bottom of full-screen panels
   - dual-screen (Surface Duo style) fold: pop-ups stay on one screen instead of crossing the hinge
   No game state is touched. Add ?noresp to the address to turn it off. */
(function(){
 if(/[?&]noresp\b/.test(location.search))return;
 const css=`
:root{--sat:env(safe-area-inset-top,0px);--sar:env(safe-area-inset-right,0px);--sab:env(safe-area-inset-bottom,0px);--sal:env(safe-area-inset-left,0px)}
html,body{-webkit-text-size-adjust:100%;text-size-adjust:100%;overscroll-behavior:none}
button,select,summary,[onclick],input[type=range]{touch-action:manipulation}
/* 1. pop-ups never taller than the screen; they scroll inside */
#ui>.box.modal,#ui .modal,#pzm{max-height:calc(100vh - 16px - var(--sat) - var(--sab))!important;max-height:calc(100dvh - 16px - var(--sat) - var(--sab))!important;max-width:calc(100vw - 16px - var(--sal) - var(--sar))!important;overflow-y:auto!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;box-sizing:border-box}
/* 2. world map keeps its 2:1 shape but fits the height */
#ui .modal.gu:has(#bm){width:min(780px,calc(100vw - 16px - var(--sal) - var(--sar)),calc((100vh - 96px - var(--sat) - var(--sab)) * 2))!important;width:min(780px,calc(100vw - 16px - var(--sal) - var(--sar)),calc((100dvh - 96px - var(--sat) - var(--sab)) * 2))!important}
/* 3. safe areas for the HUD corners (landscape notch / rounded corners) */
#hud .hb.tl{left:max(10px,calc(var(--sal) + 6px))}#hud .hb.tr{right:max(10px,calc(var(--sar) + 6px))}
#hud .hb.hint{right:max(10px,calc(var(--sar) + 6px))}
/* 4. full-screen phone panel uses the dynamic viewport */
@media(max-width:640px){#ph.ph,#ph{height:100vh!important;height:100dvh!important;box-sizing:border-box;padding-top:max(8px,var(--sat))!important;padding-bottom:max(8px,var(--sab))!important}}
/* 5. touch screens: real tap targets */
@media(pointer:coarse){
 #ui input[type=range]{height:30px;margin:4px 0}
 #ui input[type=range]::-webkit-slider-runnable-track{height:10px}
 #ui input[type=range]::-webkit-slider-thumb{width:22px;height:28px;margin-top:-10px}
 #ui input[type=range]::-moz-range-thumb{width:18px;height:26px}
 #ui .modal button,#pzm button{min-height:40px}
 #ui .modal button.sm,#ui .modal button[style*="font-size:11px"]{min-height:34px}
 #ui .sw i,#ui .thsw i{min-width:28px;min-height:28px;box-sizing:border-box}
 #ui .sw,#ui .thsw{gap:6px}
 .wrd i{display:inline-block;padding:10px 6px;margin:-8px -2px}
}
/* 6. short landscape phones: tighter spacing so more fits before scrolling */
@media(max-height:480px){#ui .modal h2,#pzm h2{margin:0 0 6px;font-size:20px}#ui .modal{padding:8px 12px}.pzm button{margin-top:5px!important;padding:6px!important}}
/* 7. dual-screen fold: keep pop-ups inside the first screen instead of crossing the hinge */
@media(horizontal-viewport-segments:2){#ui>.box.modal,#ui .modal:not(.gu:has(#bm)){left:calc(env(viewport-segment-width 0 0) / 2)!important;max-width:calc(env(viewport-segment-width 0 0) - 24px)!important}}
`;
 const st=document.createElement('style');st.id='devresp';st.textContent=css;document.head.appendChild(st);
 /* iOS: stop pinch / double-tap page zoom from nudging the layout (the game has its own map pinch) */
 document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
})();
