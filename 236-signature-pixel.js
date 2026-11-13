/* ===== v53.1.0: the signature game in the game's pixel theme =====
   232-signature-game.js drew smooth vector items and a plain overlay. This file (loaded after 232 and 235) restyles it without changing
   how the game plays or what it returns:
   - every item (paper, poster, ticket, cap, album, shirt, vinyl, CD) is redrawn as flat-colour pixel art on a 180 x 110 canvas and
     scaled x4 with no smoothing (no gradients, black and WaveFern green like 198-game-ui.js). It is added as the item's `draw`
     when the caller gave none, so custom items still win; the vinyl has a big paper label for the signature;
   - while signing, a dashed green outline of your saved signature (S.sig) is drawn in the box to copy (item.noGhost turns it off);
   - the overlay uses the game's fonts (Silkscreen headings, system monospace text), square pixel borders and buttons;
   - the pen layer is a 180 x 110 canvas (4x blocks) with hard-edged pixels, so the ink looks like pixels too (the signature itself is still
     recorded at full precision);
   - the Label HQ "Choose your signature" page (235-my-signature.js) uses the game's own app look instead of the website look. */
(function(){
const W=720,H=440,BW=180,BH=110,FONT='Silkscreen,ui-monospace,monospace';
const ZONE={paper:{x:.14,y:.62,w:.74,h:.26},poster:{x:.2,y:.8,w:.6,h:.15},ticket:{x:.1,y:.58,w:.8,h:.3},cap:{x:.3,y:.3,w:.4,h:.28},album:{x:.1,y:.74,w:.8,h:.17},shirt:{x:.3,y:.34,w:.4,h:.22},vinyl:{x:.34,y:.34,w:.32,h:.32},cd:{x:.3,y:.3,w:.4,h:.4}};
/* ---- pixel helpers (base units are 1 pixel of a 180 x 110 picture) ---- */
const R=(x,c,u,v,w,h)=>{x.fillStyle=c;x.fillRect(Math.round(u),Math.round(v),Math.round(w),Math.round(h))};
const disc=(x,c,cx,cy,r)=>{x.fillStyle=c;for(let y=-r;y<=r;y++){const w=Math.floor(Math.sqrt(r*r-y*y)+.5);x.fillRect(cx-w,cy+y,w*2+1,1)}};
const ring=(x,c,cx,cy,r)=>{x.fillStyle=c;const n=Math.ceil(r*7);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;x.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),1,1)}};
const T=(x,t,u,v,c,al,px)=>{x.font=(px||8)+'px '+FONT;x.textBaseline='top';x.textAlign=al||'left';x.fillStyle=c;t=String(t||'');const mx=BW-14;while(x.measureText(t).width>mx&&t.length>3)t=t.slice(0,-2);x.fillText(t,Math.round(u),Math.round(v))};
const box=(x,c,u,v,w,h,line)=>{R(x,line||'#000',u-1,v-1,w+2,h+2);R(x,c,u,v,w,h)};
const shadow=(x,u,v,w,h)=>R(x,'#0000008c',u+3,v+3,w,h);
/* a small seeded noise so surfaces are not flat */
const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(7);
function table(x){R(x,'#2c2218',0,0,BW,BH);for(let y=0;y<BH;y+=14){R(x,'#241b13',0,y+13,BW,1)}for(let i=0;i<90;i++)R(x,'#352a1e',rnd()*BW,rnd()*BH,2+rnd()*5,1)}
const zoneB=k=>{const z=ZONE[k];return[z.x*BW,z.y*BH,z.w*BW,z.h*BH]};
/* ---- the items ---- */
const ART={
 paper(x){table(x);shadow(x,13,8,152,96);box(x,'#f4efd8',13,6,152,96);
  for(let y=20;y<100;y+=9)R(x,'#9cc0e8',14,y,150,1);R(x,'#e0707a',30,6,1,96);
  [22,52,82].forEach(y=>{disc(x,'#2c2218',20,y,2)});
  R(x,'#c9c2a8',36,13,52,2);R(x,'#c9c2a8',36,24,70,2);R(x,'#c9c2a8',36,33,40,2);T(x,'BEST NIGHT EVER!',36,40,'#7b7b8c');T(x,'AUTOGRAPH FROM',36,50,'#7b7b8c')},
 poster(x,o){const col=(o.art&&o.art.col)||'#7a2ae0',dk='#120824';R(x,dk,0,0,BW,BH);for(let i=0;i<6;i++)R(x,i%2?'#1a0c33':'#17092d',0,i*18,BW,18);
  R(x,col,0,0,BW,5);R(x,col,0,BH-5,BW,5);R(x,col,0,0,5,BH);R(x,col,BW-5,0,5,BH);
  for(let i=0;i<30;i++)R(x,i%3?'#ffffff':'#ffe066',8+rnd()*(BW-16),8+rnd()*50,1,1);
  for(let i=0;i<7;i++){const u=20+i*23;R(x,'#ffffff12',u,6,6,50)}
  T(x,String((o.art&&o.art.artist)||'').toUpperCase(),BW/2,16,'#ffffff','center',16);T(x,'LIVE '+String((o.art&&o.art.title)||'ON TOUR').toUpperCase(),BW/2,44,'#ffe066','center');
  const z=zoneB('poster');box(x,'#f1ecff',z[0]-3,z[1]-3,z[2]+6,z[3]+6,'#000')},
 ticket(x,o){table(x);shadow(x,10,10,162,92);box(x,'#ff8a5c',10,8,162,92);R(x,'#ffb347',10,8,162,12);R(x,'#d9633a',10,92,162,8);
  for(let i=0;i<8;i++){disc(x,'#2c2218',10,16+i*11,2);disc(x,'#2c2218',172,16+i*11,2)}
  for(let y=22;y<98;y+=4)R(x,'#00000040',44,y,1,2);
  T(x,'ADMIT ONE',BW/2+14,11,'#2a0f05','center');T(x,String((o.art&&o.art.artist)||'').toUpperCase(),BW/2+14,24,'#fff','center');T(x,'PARK FIELDS FESTIVAL',BW/2+14,36,'#fff3e0','center');
  const z=zoneB('ticket');box(x,'#fff1de',z[0]+2,z[1]-2,z[2]-4,z[3]+4,'#7a2a10')},
 cap(x){table(x);shadow(x,34,24,112,74);
  for(let y=0;y<46;y++){const w=Math.round(52*Math.sqrt(Math.max(0,1-Math.pow((y-46)/46,2))));R(x,'#000',90-w-1,16+y,w*2+2,1);R(x,'#eee9de',90-w,16+y,w*2,1)}
  R(x,'#d5cfc0',38,62,104,5);R(x,'#000',36,66,108,10);R(x,'#2a2a34',38,67,104,8);R(x,'#b7b1a2',90,19,1,44);disc(x,'#000',90,15,4);disc(x,'#2a2a34',90,15,3);
  R(x,'#d8d2c4',44,76,92,4)},
 album(x,o){const col=(o.art&&o.art.col)||'#2fae8a';table(x);shadow(x,14,4,152,102);box(x,col,14,3,152,102);R(x,'#0000002e',14,60,152,45);
  disc(x,'#ffffff40',90,28,22);disc(x,'#f4f4ec',90,28,13);disc(x,'#00000050',90,28,3);
  T(x,String((o.art&&o.art.title)||'').toUpperCase(),90,54,'#fff','center');T(x,String((o.art&&o.art.artist)||'').toUpperCase(),90,65,'#ffe066','center');
  const z=zoneB('album');box(x,'#f6f6ee',z[0]-2,z[1]-2,z[2]+4,z[3]+4,'#000')},
 shirt(x,o){table(x);const body=(c,dx,dy)=>{R(x,c,50+dx,18+dy,80,86);R(x,c,16+dx,22+dy,148,26);R(x,c,18+dx,48+dy,26,6);R(x,c,136+dx,48+dy,26,6)};
  body('#0000008c',3,3);body('#000',0,0);R(x,'#000',49,17,82,88);
  R(x,'#ecece6',51,19,78,84);R(x,'#ecece6',17,23,146,24);R(x,'#ecece6',19,47,24,6);R(x,'#ecece6',137,47,24,6);
  R(x,'#cfcfc8',51,19,78,3);disc(x,'#2c2218',90,19,10);disc(x,'#cfcfc8',90,19,8);R(x,'#2c2218',82,10,16,9);
  T(x,String((o.art&&o.art.artist)||'').toUpperCase(),90,86,(o.art&&o.art.col)||'#7a2ae0','center')},
 vinyl(x,o){table(x);disc(x,'#0000008c',93,58,52);disc(x,'#000',90,55,52);disc(x,'#16161c',90,55,51);
  for(let r=36;r<50;r+=3)ring(x,'#2a2a34',90,55,r);for(let i=0;i<14;i++)R(x,'#ffffff1c',56+i*4,24+i,2,1);
  disc(x,(o.art&&o.art.col)||'#ffe066',90,55,35);disc(x,'#f6f2e0',90,55,32);disc(x,'#16161c',90,55,2);
  R(x,'#c9c2a8',74,27,32,2);R(x,'#c9c2a8',78,31,24,2);R(x,'#c9c2a8',76,80,28,2);R(x,'#c9c2a8',80,84,20,2)},
 cd(x,o){table(x);disc(x,'#0000008c',93,58,49);disc(x,'#000',90,55,49);disc(x,'#d9dce6',90,55,48);
  const bands=['#ff6ad5','#ffe066','#7dffb0','#7ad7ff'];for(let i=0;i<4;i++)ring(x,bands[i],90,55,40-i*3);
  disc(x,'#f6f6fa',90,55,16);disc(x,'#9aa0b2',90,55,5);disc(x,'#16161c',90,55,3);
  T(x,(String((o.art&&o.art.artist)||'')+' ').toUpperCase(),90,16,'#2b3140','center',8)}};
/* hard-edged pixels: every semi-transparent (anti-aliased) pixel becomes fully on or fully off */
function crisp(ctx,cv){const im=ctx.getImageData(0,0,cv.width,cv.height),d=im.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>=100?255:0;ctx.putImageData(im,0,0)}
/* the outline of your saved signature, fitted into the item's signing box, for you to copy (not shown while setting the signature) */
function ghost(c,o){try{const me=S.sig;if(!me||!me.s||o.noGhost)return;const z=o.zone||ZONE[o.kind]||ZONE.paper,zx=z.x*W,zy=z.y*H,zw=z.w*W,zh=z.h*H,sw=me.a[0],sh=me.a[1];
 let x0=9,x1=-9,y0=9,y1=-9;me.s.forEach(st=>st.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}));if(x1<x0)return;
 const bw=Math.max((x1-x0)*sw,1),bh=Math.max((y1-y0)*sh,1),k=Math.min(zw*.9/bw,zh*.8/bh),ox=zx+zw/2-bw*k/2-x0*sw*k,oy=zy+zh/2-bh*k/2-y0*sh*k;
 const lo=document.createElement('canvas');lo.width=BW;lo.height=BH;const g=lo.getContext('2d');g.scale(BW/W,BH/H);g.lineCap='butt';g.lineJoin='miter';g.setLineDash([14,12]);
 for(let pass=0;pass<2;pass++){g.strokeStyle=pass?'#2fe68a':'#000000';g.lineWidth=pass?7:14;
  me.s.forEach(st=>{if(!st.length)return;g.beginPath();st.forEach((p,i)=>{const u=ox+p[0]*sw*k,v=oy+p[1]*sh*k;i?g.lineTo(u,v):g.moveTo(u,v)});if(st.length==1)g.lineTo(ox+st[0][0]*sw*k+.1,oy+st[0][1]*sh*k);g.stroke()})}
 crisp(g,lo);c.save();c.imageSmoothingEnabled=false;c.drawImage(lo,0,0,W,H);c.restore()}catch(e){console.error('signature outline',e)}}
const draw=kind=>function(c,o){const cv=document.createElement('canvas');cv.width=BW;cv.height=BH;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;
(ART[kind]||ART.paper)(x,o||{});c.imageSmoothingEnabled=false;c.drawImage(cv,0,0,W,H);ghost(c,o||{})};
/* ---- hook the items and the pen into every signing session ---- */
const PEN={paper:'#1b2a6b'};
function prep(o){o=o||{};if(S.sig&&o.items&&!o.items.some(i=>i.noGhost))o.intro='Copy your own signature: follow the green dashed outline in the red box. The closer it matches, the more you are paid. Enter = next, Backspace = clear, Esc = skip.';if(o.items&&o.items.length)o.items=o.items.map(it=>{const a=Object.assign({},it);if(!a.draw&&ART[a.kind]){a.draw=draw(a.kind);if(!a.zone)a.zone=ZONE[a.kind]}else if(a.draw&&!a.ghosted){const d0=a.draw;a.draw=function(c,it){d0.apply(this,arguments);ghost(c,it||a)};a.ghosted=1}if(!a.ink&&PEN[a.kind])a.ink=PEN[a.kind];return a});return o}
{const g0=window.signGame;window.signGame=function(o){o=prep(o);if(!o.items||!o.items.length){o.items=SIGN.random(3);o=prep(o)}
 const p=g0.call(this,o);try{const cv=document.getElementById('sgin');if(cv){const PX=4;cv.width=W/PX;cv.height=H/PX;const ink=cv.getContext('2d');ink.scale(1/PX,1/PX);
  /* the pen is a thick hard-edged brush on a 180 x 110 grid */
  const d=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'lineWidth');Object.defineProperty(ink,'lineWidth',{get(){return d.get.call(ink)},set(v){d.set.call(ink,Math.max(5,v*1.7))},configurable:true});
  let q=0;const fix=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;try{crisp(ink,cv)}catch(e){}})};['pointermove','pointerup','pointerdown'].forEach(ev=>cv.addEventListener(ev,fix));
  const bg=document.getElementById('sgbg');if(bg)bg.style.imageRendering='pixelated';cv.style.imageRendering='pixelated'}}catch(e){console.error('signature pixel pen',e)}return p}}
/* ---- the overlay in the game's pixel theme ---- */
{const s=document.createElement('style');s.textContent=`#sgov{background:#050806f2;image-rendering:pixelated}
#sgov .sgb{background:var(--p,#161b18);border:4px solid #000;box-shadow:0 0 0 4px var(--g,#2fe68a),10px 10px 0 4px #000a;padding:12px;gap:10px;font:14px ui-monospace,Menlo,Consolas,monospace;color:var(--t,#e8f3ec)}
#sgov .sgh b{font:16px Silkscreen,ui-monospace,monospace;text-transform:uppercase;letter-spacing:1px;color:var(--g,#2fe68a)}
#sgov #sgp{font:12px Silkscreen,ui-monospace,monospace;color:var(--m,#8aa094)}
#sgov #sgq{background:#000;border:3px solid var(--g,#2fe68a);padding:8px 10px;color:#ffe9a8;font-size:14px;min-height:36px;box-sizing:border-box}
#sgov .sgc{border:4px solid #000;box-shadow:0 0 0 4px #fff3;background:#000}
#sgov canvas{image-rendering:pixelated}
#sgov #sgr{font:14px Silkscreen,ui-monospace,monospace;text-shadow:3px 3px 0 #000}#sgov #sgr.sgg{color:#7dffb0}
#sgov button{font:12px Silkscreen,ui-monospace,monospace;text-transform:uppercase;padding:9px 14px;background:#25302a;color:var(--t,#e8f3ec);border:3px solid #000;border-radius:0;box-shadow:inset 3px 3px 0 #ffffff26,inset -3px -3px 0 #00000059;cursor:pointer}
#sgov button:hover{background:#364439}#sgov button:active{box-shadow:inset 3px 3px 0 #00000059,inset -3px -3px 0 #ffffff1a}
#sgov button.go{background:var(--g,#2fe68a);color:#04120a}#sgov button.go:hover{background:#5df0a6}
#sgov #sgm{font:12px ui-monospace,Menlo,Consolas,monospace;color:var(--m,#8aa094);min-height:16px}#sgov #sgm.sgw{color:#ff9a8a}`;document.head.appendChild(s)}
/* ---- the "Choose your signature" page: the game's own app look ---- */
{const h0=PA.hq;PA.hq=function(){if(S.sig)return h0.apply(this,arguments);
 return`<div class=hqx><h1>Label HQ</h1><div class=card style="max-width:460px"><b class=px style="font-size:16px;color:var(--g)">Choose your signature</b><p class=m style="margin:10px 0">Before you use Label HQ, draw the signature you will sign everything with. Whenever you sign something later, from a fan on the street to a pressed vinyl, you are paid by how closely it matches this one.</p><button class=go onclick="SIGNME.setup()">Draw my signature</button></div></div>`}}
})();
