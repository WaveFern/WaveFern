/* WaveFern dev: "Save and quit" is always the bottom button of the pause menu, whatever other scripts add after it. */
(function(){
 if(typeof pauseUI!='function')return;
 const p0=pauseUI;
 pauseUI=function(){
  const r=p0.apply(this,arguments);
  try{
   const m=document.getElementById('pzm');
   if(m)[...m.querySelectorAll('button')].filter(b=>/^save (and|&) quit$/i.test((b.textContent||'').trim())).forEach(b=>m.appendChild(b));
  }catch(e){console.error('savequit',e)}
  return r;
 };
})();
