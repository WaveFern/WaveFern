/* ---------- startup guard (v26.142.0) ----------
   Loads first. Never lets the loading screen hang silently: a failed script, a startup error,
   missing WebGL or a stuck load shows a clear message with a Reload button. */
(function(){
 const bad=[],errs=[],broke=[],seen={};let shown=0,booted=0;
 function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
 function panel(title,msg,hint,cont){
  if(shown)return;shown=1;
  const ld=document.getElementById('load');if(ld)ld.style.display='none';
  const d=document.createElement('div');d.id='fatal';
  d.style.cssText='position:fixed;inset:0;z-index:99999;background:#0c0f0d;color:#e8f3ec;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:20px;font:14px ui-monospace,Menlo,Consolas,monospace';
  const bs='background:#26302a;color:#e8f3ec;border:2px solid #000;box-shadow:inset 0 -3px 0 #0006;padding:10px 18px;font:inherit;font-weight:bold;cursor:pointer;margin:4px';
  d.innerHTML='<h1 style="font:700 28px Silkscreen,ui-monospace,monospace;color:#2fe68a;margin:0">'+esc(title)+'</h1>'
   +'<div style="max-width:460px;line-height:1.5">'+msg+'</div>'
   +(hint?'<div style="max-width:460px;color:#8aa094;font-size:12px;line-height:1.5">'+hint+'</div>':'')
   +'<div><button id="fatalReload" style="'+bs.replace('#26302a','#2fe68a').replace('color:#e8f3ec','color:#04120a')+'">Reload</button>'
   +(cont?'<button id="fatalKeep" style="'+bs+'">Keep waiting</button>':'')+'</div>'
   +'<div style="max-width:460px;color:#8aa094;font-size:11px">Your save is kept in this browser and is not touched by this screen.</div>';
  (document.body||document.documentElement).appendChild(d);
  document.getElementById('fatalReload').onclick=()=>location.reload();
  const k=document.getElementById('fatalKeep');if(k)k.onclick=()=>{d.remove();if(ld)ld.style.display='';shown=0};
 }
 function details(){return (bad.length?'Could not load: '+bad.map(esc).join(', ')+'.<br>':'')+(errs.length?'Error: '+esc(errs[0])+'<br>':'')}
 function webglOK(){try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')))}catch(e){return false}}
 const GL='Turn on hardware acceleration in your browser settings, update your browser or graphics drivers, then reload. Try Chrome, Edge or Firefox if it still fails.';
 addEventListener('error',e=>{
  const t=e.target;
  if(t&&t!==window&&t.tagName==='SCRIPT'){bad.push((t.getAttribute('src')||'script').replace(/^https?:\/\/[^/]+\//,''));return}
  if(e.message&&e.message!=='Script error.')errs.push(e.message+(e.filename?' ('+e.filename.split('/').pop()+':'+e.lineno+')':''));
  /* v41.1.0: remember which game file threw while loading, so the warning bar can name it */
  if(!booted&&e.filename&&!/^https?:\/\/(cdn|www\.|apis\.|fonts\.)/.test(e.filename)){const f=e.filename.split('/').pop().split('?')[0];if(f&&broke.indexOf(f)<0)broke.push(f)}
  if(!booted&&/27-boot/.test(e.filename||''))fail();
 },true);
 function fail(){
  if(booted)return;
  if(!webglOK())return panel('Graphics not available','WaveFern needs WebGL to draw the 3D world, and your browser could not start it.',GL);
  if(typeof THREE==='undefined')return panel('Could not load the game','The 3D library did not download. Check your internet connection and try again.',details());
  panel('Something went wrong while starting','The game hit a problem while loading.',details());
 }
 window.fwBooted=function(){booted=1;const parts=bad.concat(broke.filter(f=>bad.indexOf(f)<0));if(parts.length){const b=document.createElement('div');b.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:99998;background:#000d;border-top:2px solid #2fe68a;color:#e8f3ec;padding:6px 10px;font:12px ui-monospace,monospace;text-align:center';b.innerHTML='Some game files failed to load ('+parts.map(esc).join(', ')+'), so parts of the game may not work. <button onclick="location.reload()" style="font:inherit;margin-left:6px">Reload</button> <button onclick="this.parentNode.remove()" style="font:inherit">Dismiss</button>';document.body.appendChild(b)}};
 /* v41.1.0: an error in one part of the game (a frame update, a boot step) is logged once and the rest carries on,
    instead of freezing the whole game. where = a short label, e.g. 'update' or 'buildCity'. */
 window.fwSoftErr=function(e,where){const m=(where?where+': ':'')+(e&&e.message||e);if(seen[m])return;seen[m]=1;
  try{console.error('[WaveFern] '+m,e)}catch(x){}
  if(!booted&&where&&where!='update'&&where!='render'&&broke.indexOf(where)<0)broke.push(where)};
 if(!webglOK())addEventListener('DOMContentLoaded',fail);
 addEventListener('load',()=>setTimeout(()=>{if(!booted&&document.getElementById('load')&&(bad.length||errs.length||typeof THREE==='undefined'||!webglOK()))fail()},4000));
 setTimeout(()=>{if(!booted&&document.getElementById('load'))panel('Still loading…','The game is taking much longer than usual to start. This is often a slow connection or a blocked file.',details()+GL,1)},25000);
})();
