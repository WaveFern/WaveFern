/* ===== v46.4.0: keep the minimap clear =====
   The minimap (16-big-world...js) sat at a fixed top:124px, so a tall top-left HUD box or the band room panel
   (161-multiplayer.js) could cover it. Every frame the minimap and its label now sit just under the top-left HUD box,
   and the band panel sits under the minimap's label (or under the HUD box when the minimap is hidden). */
(()=>{
const GAP=8;let K='',Q='',F=0;
/* v49.1.0: the layout is only measured when the HUD, minimap, band panel or window size changed, not every frame */
function place(){const tl=document.querySelector('#hud .hb.tl'),mp=document.getElementById('mpb');
 const q=(typeof hc=='string'?hc.length+hc.slice(0,60):'')+'|'+mm.style.display+'|'+ml.textContent+'|'+(mp?mp.style.display+mp.childElementCount:'')+'|'+innerWidth+'x'+innerHeight;if(q===Q&&++F%30)return;Q=q;
 const top=Math.round((tl&&tl.offsetParent?tl.getBoundingClientRect().bottom:110)+GAP),map=mm.style.display!='none';
 let below=top;if(map){const lh=ml.textContent?ml.offsetHeight||14:0;below=top+mm.offsetHeight+4+lh+GAP}
 const k=top+'|'+below+'|'+(mp?'1'+mp.style.display:'0');if(k===K)return;K=k;
 mm.style.top=top+'px';ml.style.top=(top+mm.offsetHeight+4)+'px';if(mp)mp.style.top=below+'px'}
{const u0=update;update=function(){const r=u0.apply(this,arguments);try{place()}catch(e){}return r}}
})();
