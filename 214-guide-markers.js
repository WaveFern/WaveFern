/* ===== v49.82.0: guide line for the festival and map markers =====
   Reuses the tutorial's guide line (72-tutorial.js), drawn in blue:
   - on the day of your booked set, once you are at Park Fields, the line leads you to the steps of your stage
   - tap / click the world map to drop a marker (tap it again to remove it); a line leads you there until you arrive.
   The marker is saved in S.gmark. Tutorial goals still win while the tips are pointing somewhere. */
function gdFest(){try{if(!S||!S.artist||typeof festBkOn!='function')return null;const b=fBk().find(x=>x.day==S.day&&!x.st);if(!b)return null;
 if(!(P.x>FEST.X0-70&&P.x<FEST.X1+40&&P.z>FEST.Z0-30&&P.z<FEST.Z1+30))return null;
 const s=fStage(b.n);if(!s||Math.hypot(P.x-s.ix,P.z-s.iz)<2.5)return null;return{x:s.ix,z:s.iz}}catch(e){return null}}
function gdMark(){const m=S&&S.gmark;if(!m)return null;if(Math.hypot(P.x-m.x,P.z-m.z)<3){S.gmark=null;try{say('You reached your marker.')}catch(e){}return null}return{x:m.x,z:m.z}}
let GDON=0;
{const t0=tutTgt;tutTgt=function(){GDON=0;if(IN||(mode!='play'&&mode!='drive'))return t0.apply(this,arguments);
 const o=t0.apply(this,arguments);if(o)return o;const g=gdFest()||gdMark();if(g)GDON=1;return g}}
{const u0=update;update=function(dt){u0(dt);try{const c=GDON?0x5aa8ff:0xffffff;if(TUTG)TUTG.userData.m.material.color.setHex(c);if(TUTM)TUTM.material.color.setHex(GDON?0x5aa8ff:0xffc400)}catch(e){}}}
/* map: tap to place / remove a marker, drawn as a blue pin */
{const d0=mapDraw;mapDraw=function(){d0.apply(this,arguments);try{const c=$('bm'),m=S.gmark;if(!c||!m)return;const x=c.getContext('2d'),M=MAPZ,X=mapSX(m.x)*M.z+M.ox,Z=mapSZ(m.z)*M.z+M.oy;
 x.setTransform(M.R,0,0,M.R,0,0);x.fillStyle='#5aa8ff';x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(X,Z-9,6,0,7);x.fill();x.stroke();x.beginPath();x.moveTo(X-4,Z-5);x.lineTo(X+4,Z-5);x.lineTo(X,Z);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(X,Z-9,2,0,7);x.fill()}catch(e){}}}
{const b0=bigMap;bigMap=function(){b0.apply(this,arguments);try{const c=$('bm');if(!c)return;let dn=null;
 c.addEventListener('pointerdown',e=>{dn=e.isPrimary?[e.clientX,e.clientY]:null});
 c.addEventListener('pointerup',e=>{if(!dn||Math.hypot(e.clientX-dn[0],e.clientY-dn[1])>6)return;dn=null;const r=c.getBoundingClientRect(),M=MAPZ,sx=(e.clientX-r.left)*M.W/r.width,sy=(e.clientY-r.top)*M.H/r.height;
  const wx=((sx-M.ox)/M.z)/.86-138-M.L,wz=((sy-M.oy)/M.z)/1.15-158,m=S.gmark;
  if(m&&Math.hypot(mapSX(m.x)*M.z+M.ox-sx,mapSZ(m.z)*M.z+M.oy-sy)<14)S.gmark=null;else S.gmark={x:Math.round(wx),z:Math.round(wz)};
  try{snd('pop')}catch(_){}mapDraw();const h=$('gdhint');if(h)h.textContent=S.gmark?'Marker set. A blue line will lead you there.':'Marker removed.'});
 const p=c.parentNode.nextElementSibling;if(p){const s=document.createElement('span');s.id='gdhint';s.className='m';s.textContent=S.gmark?' Marker set (tap it to remove).':' Tap the map to place a marker.';p.appendChild(s)}}catch(e){}}}
