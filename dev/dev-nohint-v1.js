/* WaveFern dev: removes the controls hint box at the bottom of the screen. Only loaded on /dev/. */
(function(){if(!window.FW_FEAT)return;const s=document.createElement('style');s.textContent='#hud .hb.hint{display:none!important}';document.head.appendChild(s)})();
