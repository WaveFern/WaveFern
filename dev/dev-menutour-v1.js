/* WaveFern dev: the MAIN MENU (not the pause menu) shows a Wii Sports Resort style tour of the map behind it:
   slow camera moves over the city, airport, festival grounds, park and streets, each fading into the next.
   This replaces the bedroom view, so nothing of the house or cars shows on the menu. Pause menu is unchanged.
   Also keeps "Save and quit" as the bottom button of the pause menu. Only loaded on /dev/. Add ?notour to skip the tour. */
(function(){
 if(!window.FW_DEV)return;
 const tourOn=!/[?&]notour/.test(location.search);
 const on=()=>{try{return tourOn&&typeof TT=='object'&&TT.on&&typeof mode!='undefined'&&mode!='load'&&mode!='play'&&mode!='creator'}catch(e){return false}};
 const st=document.createElement('style');
 st.textContent='body.fwtour #pzo{background:rgba(5,8,6,.22)!important;backdrop-filter:none!important}body.fwtour canvas{transition:opacity .6s}';
 document.head.appendChild(st);
 const SH=[
  {d:11,p:[[470,74,170],[520,52,124]],l:[[606,0,40],[612,0,34]],f:44},
  {d:10,p:[[-240,46,130],[-280,30,104]],l:[[-362,4,20],[-362,4,20]],f:48},
  {d:10,p:[[190,30,26],[228,24,6]],l:[[310,3,-64],[310,3,-64]],f:46},
  {d:10,p:()=>{const c=park();return[[c[0]+44,28,c[1]+44],[c[0]+30,19,c[1]+38]]},l:()=>{const c=park();return[[c[0],1,c[1]],[c[0],1,c[1]]]},f:46},
  {d:9,p:[[28,2.2,17.5],[74,2.2,17.5]],l:[[44,2,14],[90,2,14]],f:62},
  {d:10,p:[[560,7,96],[604,9,80]],l:[[612,24,30],[612,24,30]],f:50},
  {d:10,p:[[44,22,40],[26,15,30]],l:[[8,4,6],[8,4,6]],f:46}
 ];
 const park=()=>{try{const c=CPARK.pond.c;if(c&&isFinite(c[0]))return c}catch(e){}return[640,-40]};
 const ease=t=>t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t;
 let tc=null,i=-1,t0=0,hidP=false,was=false,hold=0;
 const val=(v,k)=>typeof v=='function'?v():v;
 function solid(){try{CT.forEach(b=>{b.mat.opacity=1;b.mat.depthWrite=true;if(b.dm){b.dm.opacity=1;b.dm.depthWrite=true}})}catch(e){}try{Object.values(FEST.fadeU).forEach(L=>L.forEach(U=>{U.o=1;U.mats.forEach(m=>{m.opacity=1;m.depthWrite=true})}))}catch(e){}}
 function next(now){i=(i+1)%SH.length;t0=now;solid()}
 function pose(now){
  const s=SH[i],u=Math.max(0,Math.min(1,(now-t0)/(s.d*1000))),e=ease(u);
  const p=val(s.p),l=val(s.l);
  tc.position.set(lerp(p[0][0],p[1][0],e),lerp(p[0][1],p[1][1],e),lerp(p[0][2],p[1][2],e));
  tc.lookAt(lerp(l[0][0],l[1][0],e),lerp(l[0][1],l[1][1],e),lerp(l[0][2],l[1][2],e));
  tc.fov=s.f;tc.aspect=innerWidth/innerHeight;tc.updateProjectionMatrix();
  /* fade through black at the ends of each shot */
  const el=(now-t0)/1000,o=Math.min(1,el/.6,(s.d-el)/.6);
  try{renderer.domElement.style.opacity=String(Math.max(0,Math.min(1,o)))}catch(e){}
 }
 function tick(now){
  requestAnimationFrame(tick);
  try{
   const a=on();
   if(a&&!was){was=true;document.body.classList.add('fwtour');tc=tc||new THREE.PerspectiveCamera(46,1,.1,2600);i=-1;next(now);
    try{if(P.mesh&&P.mesh.visible){P.mesh.visible=false;hidP=true}}catch(e){}}
   if(!a&&was){was=false;document.body.classList.remove('fwtour');try{renderer.domElement.style.opacity=''}catch(e){}
    try{if(hidP&&P.mesh)P.mesh.visible=true}catch(e){}hidP=false}
   if(a){if(now-t0>SH[i].d*1000)next(now);pose(now)}
   /* pause menu: Save and quit is always the bottom button */
   const m=document.getElementById('pzm');
   if(m){const q=[...m.children].find(b=>b.tagName=='BUTTON'&&/^Save and quit$/i.test(b.textContent.trim()));if(q&&m.lastElementChild!==q)m.appendChild(q)}
  }catch(e){if(!hold++)console.warn('menu tour',e)}
 }
 const r0=renderer.render.bind(renderer);
 renderer.render=function(sc,c){if(was&&tc&&sc===scene&&c===cam){return r0(sc,tc)}return r0(sc,c)};
 requestAnimationFrame(tick);
})();
