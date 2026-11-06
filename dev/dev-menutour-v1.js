/* WaveFern dev: the MAIN MENU (not the pause menu) shows a still picture of the starting house as its background (dev-menustage-v1.js fades a live stadium scene in over it when it is ready; this picture is the fallback and the ?nomenuscene look).
   The 3D scene is hidden behind it while the menu is up, so no cars or house interior can show through. Pause menu is unchanged.
   Also keeps "Save and quit" as the bottom button of the pause menu. Only loaded on /dev/. */
(function(){
 if(!window.FW_FEAT)return;
 const on=()=>{try{return typeof TT=='object'&&TT.on&&typeof mode!='undefined'&&mode!='load'&&mode!='play'&&mode!='creator'}catch(e){return false}};
 const st=document.createElement('style');
 st.textContent='#fwmbg{position:fixed;inset:0;z-index:0;background:#7fc4e8 url(/dev/menu-house.webp) center/cover no-repeat;display:none}body.fwmenubg #fwmbg{display:block}body.fwmenubg canvas{visibility:hidden}body.fwmenubg #pzo{background:rgba(5,8,6,.35)!important;backdrop-filter:none!important}';
 document.head.appendChild(st);
 const bg=document.createElement('div');bg.id='fwmbg';
 function put(){if(!bg.isConnected&&document.body)document.body.insertBefore(bg,document.body.firstChild)}
 let was=false;
 function tick(){
  requestAnimationFrame(tick);
  try{
   put();const a=on();
   if(a!==was){was=a;document.body.classList.toggle('fwmenubg',a)}
   /* pause menu: Save and quit is always the bottom button */
   const m=document.getElementById('pzm');
   if(m){const q=[...m.children].find(b=>b.tagName=='BUTTON'&&/^Save and quit$/i.test(b.textContent.trim()));if(q&&m.lastElementChild!==q)m.appendChild(q)}
  }catch(e){}
 }
 requestAnimationFrame(tick);
})();
