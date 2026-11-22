/* WaveFern dev: the "Song recorded!" summary says "Perfect" instead of "100%" (or "Clean") on each section.
   Sections are Beat, Lyrics and Mix. Only loaded on /dev/. Add ?noperfect to skip it. */
(function(){
 if(!window.FW_FEAT||/[?&]noperfect/.test(location.search))return;
 function fix(){
  try{
   document.querySelectorAll('#ui .cards .card').forEach(c=>{
    const b=c.querySelector('b');if(!b)return;
    const t=b.textContent.trim();
    if(/^Interest/.test(c.textContent))return;if(t==='100%'||(t==='Clean'&&/^Beat/.test(c.textContent)))b.textContent='Perfect';
   });
  }catch(e){}
 }
 const start=()=>{const ui=document.getElementById('ui');if(!ui)return setTimeout(start,300);new MutationObserver(fix).observe(ui,{childList:true,subtree:true});fix()};
 start();
})();
