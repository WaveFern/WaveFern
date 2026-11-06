/* ---------- v49.74.0: big update countdown ----------
   A small always-visible box in gameplay (top right, under the HUD) counting down to the big update: the fresh start at
   RS.CUT (12-reset.js), Friday 6 November 2026 13:30 UTC. Shows the countdown only; it hides itself once that moment passes.
   Display only: it never touches saves or game state. */
(function(){
 const CUT=(typeof RS!=='undefined'&&RS.CUT)||Date.UTC(2026,10,6,13,30,0);
 const css=document.createElement('style');
 css.textContent='#bucd{position:fixed;right:10px;top:96px;z-index:60;display:none;flex-direction:column;align-items:flex-end;gap:2px;padding:6px 10px;background:#000;color:#e8f3ec;border:2px solid #000;box-shadow:inset 0 -3px #0007,0 0 0 2px #2e8b57;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none}#bucd.on{display:flex}#bucd b{font:700 14px ui-monospace,Menlo,Consolas,monospace;color:#7fe0a4;letter-spacing:0}';
 document.head.appendChild(css);
 const el=document.createElement('div');el.id='bucd';el.setAttribute('aria-label','Countdown to the big update');
 el.innerHTML='<span>BIG UPDATE IN</span><b></b>';document.body.appendChild(el);
 const b=el.querySelector('b'),p2=n=>String(n).padStart(2,'0');
 function tick(){try{
  const ms=CUT-Date.now(),m=typeof mode!=='undefined'?mode:'',paused=typeof PAUSED!=='undefined'&&PAUSED;
  const on=ms>0&&m==='play'&&!paused&&!document.getElementById('advw');
  el.classList.toggle('on',on);if(!on)return;
  const tr=document.querySelector('#hud .hb.tr');if(tr){const r=tr.getBoundingClientRect();if(r.height)el.style.top=Math.round(r.bottom+8)+'px'}
  const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),mi=Math.floor(s%3600/60),se=s%60;
  const t=(d?d+'d ':'')+p2(h)+':'+p2(mi)+':'+p2(se);if(b.textContent!==t)b.textContent=t;
 }catch(e){}}
 setInterval(tick,500);
})();
