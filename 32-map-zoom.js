/* ===== v26.12: zoomable big map =====
   Same picture as the old bigMap (16-big-world...js), drawn through a view transform: zoom (0.5x-4x) and pan offset in
   canvas pixels. Mouse wheel / pinch zoom toward the cursor or the pinch centre, +/- buttons (and +/- keys) zoom toward
   the middle, drag pans. Roads, lake and buildings scale with the zoom; markers, labels and the player square stay the
   same size and sit at their transformed spots. The zoom level is remembered between openings; the view recentres on
   the player each time the map opens. The minimap is untouched. */
const MAPZ={z:1,ox:0,oy:0,min:.5,max:4,W:760,H:380};
const mapSX=v=>(v+138)*.86,mapSZ=v=>(v+158)*1.15;
function mapClamp(){const M=MAPZ,w=M.W*M.z,h=M.H*M.z;M.ox=w<=M.W?(M.W-w)/2:Math.min(0,Math.max(M.W-w,M.ox));M.oy=h<=M.H?(M.H-h)/2:Math.min(0,Math.max(M.H-h,M.oy))}
function mapZoomAt(f,cx,cy){const M=MAPZ,z=Math.min(M.max,Math.max(M.min,M.z*f));if(z==M.z)return;M.ox=cx-(cx-M.ox)*z/M.z;M.oy=cy-(cy-M.oy)*z/M.z;M.z=z;mapClamp();mapDraw()}
function mapCentre(x,z){const M=MAPZ;M.ox=M.W/2-mapSX(x)*M.z;M.oy=M.H/2-mapSZ(z)*M.z;mapClamp()}
function mapDraw(){const c=$('bm');if(!c)return;const x=c.getContext('2d'),M=MAPZ,k=M.z,sx=v=>mapSX(v)*k+M.ox,sz=v=>mapSZ(v)*k+M.oy,kx=.86*k,kz=1.15*k;
 x.setTransform(1,0,0,1,0,0);x.fillStyle='#1d3a21';x.fillRect(0,0,M.W,M.H);x.fillStyle='#3f7a45';x.fillRect(M.ox,M.oy,M.W*k,M.H*k);
 x.fillStyle='#4aa3df';x.fillRect(sx(LK[0]),sz(LK[1]),(LK[2]-LK[0])*kx,(LK[3]-LK[1])*kz);
 x.fillStyle='#3a3d44';ROADS.forEach(r=>x.fillRect(sx(r[0]),sz(r[1]),Math.max(2,(r[2]-r[0])*kx),Math.max(2,(r[3]-r[1])*kz)));
 x.fillStyle='#d9b88f';const hs=Math.min(4,2*Math.max(1,k));HP.forEach(h=>x.fillRect(sx(h[0])-hs/2,sz(h[1])-hs/2,hs,hs));
 x.fillStyle='#8fa6b8';BLD.forEach(b=>x.fillRect(sx(b[0]),sz(b[1]),(b[2]-b[0])*kx,(b[3]-b[1])*kz));
 x.font='10px monospace';POIS.forEach(p=>{const X=sx(p[0]),Z=sz(p[1]);if(X<-80||X>M.W+10||Z<-10||Z>M.H+10)return;x.fillStyle=p[3];x.fillRect(X-3,Z-3,6,6);x.fillStyle='#fff';x.fillText(p[2],X+5,Z+3)});
 const PX=sx(P.x),PZ=sz(P.z);x.fillStyle='#fff';x.fillRect(PX-4,PZ-4,8,8);x.strokeStyle='#000';x.strokeRect(PX-4,PZ-4,8,8);
 const zl=$('bmz');if(zl)zl.textContent=(Math.round(k*10)/10)+'x';c.style.cursor=k>1?'grab':'default'}
function bigMap(){if(mode!='play')return;mode='menu';const d=Math.round(cityX()-P.x),B='width:34px;height:34px;padding:0;font-weight:700';
 $('ui').innerHTML=`<div class="box modal" style="width:min(780px,96vw)"><h2>World map</h2><div style="position:relative"><canvas id=bm width=760 height=380 style="width:100%;display:block;image-rendering:pixelated;border:2px solid #000;touch-action:none"></canvas><div style="position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:4px;align-items:center"><button style="${B}" title="Zoom in (+)" onclick="mapZoomAt(1.5,MAPZ.W/2,MAPZ.H/2)">+</button><button style="${B}" title="Zoom out (-)" onclick="mapZoomAt(1/1.5,MAPZ.W/2,MAPZ.H/2)">−</button><button style="${B};font-size:11px" title="Reset zoom" onclick="MAPZ.z=1;mapClamp();mapDraw()">1x</button><span id=bmz class=m style="font-size:11px;background:#0b0f0dd9;padding:0 3px"></span></div></div><p class=m>You are the white square. City centre is about ${Math.abs(d)} m ${d>0?'east':'west'}. Scroll, pinch or +/- to zoom, drag to move. Walk 3 m/s (Shift to run), drive 13-48 m/s, or take a taxi.</p><div class=row2><button onclick="taxi(8,14)">Taxi home</button><button onclick="taxi(95,-44)">Taxi to Park</button><button onclick="taxi(560,20)">Taxi to City</button><button onclick="closeUI()">Close</button></div></div>`;
 const c=$('bm'),pt=new Map();let drag=null,pinch=0;const loc=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*MAPZ.W/r.width,(e.clientY-r.top)*MAPZ.H/r.height]};
 c.addEventListener('wheel',e=>{e.preventDefault();const[a,b]=loc(e);mapZoomAt(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.004),a,b)},{passive:false});
 c.addEventListener('pointerdown',e=>{pt.set(e.pointerId,loc(e));try{c.setPointerCapture(e.pointerId)}catch(_){}if(pt.size==1)drag=loc(e);else{drag=null;const[p,q]=[...pt.values()];pinch=Math.hypot(p[0]-q[0],p[1]-q[1])}});
 c.addEventListener('pointermove',e=>{if(!pt.has(e.pointerId))return;const l=loc(e);pt.set(e.pointerId,l);
  if(pt.size>=2){const[p,q]=[...pt.values()],D=Math.hypot(p[0]-q[0],p[1]-q[1]);if(pinch>0&&D>0)mapZoomAt(D/pinch,(p[0]+q[0])/2,(p[1]+q[1])/2);pinch=D}
  else if(drag){MAPZ.ox+=l[0]-drag[0];MAPZ.oy+=l[1]-drag[1];drag=l;mapClamp();mapDraw();if(MAPZ.z>1)c.style.cursor='grabbing'}});
 const up=e=>{pt.delete(e.pointerId);pinch=0;drag=pt.size==1?[...pt.values()][0]:null;if(MAPZ.z>1)c.style.cursor='grab'};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
 mapCentre(P.x,P.z);mapDraw()}
addEventListener('keydown',e=>{if(!$('bm')||/INPUT|TEXTAREA/.test(e.target.tagName))return;const k=e.key;if(k=='+'||k=='=')mapZoomAt(1.5,MAPZ.W/2,MAPZ.H/2);else if(k=='-'||k=='_')mapZoomAt(1/1.5,MAPZ.W/2,MAPZ.H/2)});
