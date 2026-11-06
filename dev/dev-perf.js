/* WaveFern dev performance helpers. Only loaded on /dev/.
   1. Loading watchdog: if the loading screen is still up after 15 s (a stuck script, a failed library, a blocked tab), it says so
      and offers a reload instead of sitting at 92% forever.
   2. Auto quality (OFF unless the address has ?auto): steps the graphics level down when fps stays under ~40. Never runs by default. */
(function(){
 if(!window.FW_FEAT)return;
 const errs=[];addEventListener('error',e=>{errs.push((e.message||'error')+' '+(e.filename||'').split('/').pop()+':'+(e.lineno||''))});
 const t0=performance.now();let wd=setInterval(()=>{
  const ld=document.getElementById('load');
  if(!ld){clearInterval(wd);return}
  if(document.hidden||performance.now()-t0<15000)return;
  clearInterval(wd);
  const lt=document.getElementById('lt');
  if(lt){lt.textContent='Loading is taking too long'+(typeof THREE=='undefined'?' (3D library did not load)':'')+'. ';
   const a=document.createElement('a');a.href='#';a.textContent='Reload';a.style.color='inherit';a.onclick=e=>{e.preventDefault();location.reload()};lt.appendChild(a)}
  console.warn('dev: loading stuck >15s',errs.slice(0,5));
 },1000);
 if(!/[?&]auto/.test(location.search))return; /* opt-in only: visuals are never lowered unless asked for */
 const ORDER=['max','balanced','off'];
 let n=0,t=0,last=0,low=0,cool=0;
 function tick(x){
  requestAnimationFrame(tick);
  const d=x-last;last=x;
  if(document.hidden||document.getElementById('load')||!window.FW_DGFX||d>250){n=0;t=0;low=0;return}
  /* warm-up: ignore the first 3 s after the game appears */
  if(!cool)cool=x+3000;if(x<cool)return;
  n++;t+=d;
  if(t>=3000){
   const fps=n*1000/t;n=0;t=0;
   low=fps<40?low+1:0;
   if(low>=2){low=0;const i=ORDER.indexOf(FW_DGFX.get());
    if(i>=0&&i<ORDER.length-1){const nx=ORDER[i+1];FW_DGFX.set(nx);cool=x+3000;
     try{toast('Graphics set to '+(nx=='off'?'Off':nx=='balanced'?'Balanced':'Max')+' for smoother play. Change it in the DEV panel.')}catch(e){}}}
  }
 }
 requestAnimationFrame(tick);
})();
