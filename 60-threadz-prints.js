/* ---------- Threadz prints: logos and graphics painted on canvas textures ----------
   Chest prints, back prints, sleeve hits, brand marks and all-over patterns are drawn on small canvases and put on the
   clothes as thin decals, so they stay sharp on the character and in the shop / wardrobe previews.
   Every brand name here is made up for the game.
   - XPR[name] = {s:[W,H], f(ctx,W,H,colour,variant)}  the artwork
   - XPD[item name] = what an item wears: f / b / s (front, back, sleeve prints placed on the torso), on (custom), pv (preview) */
const XPR={},XPT={},XPMC={},XPGC={},XPD={};
const XF={blk:'900 %px "Arial Black","Segoe UI Black",Impact,"Helvetica Neue",Arial,sans-serif',ser:'700 %px Georgia,"Times New Roman",serif',pix:'700 %px Silkscreen,monospace',
 scr:'italic 700 %px "Brush Script MT","Segoe Script","URW Chancery L",cursive',con:'700 %px Impact,"Arial Narrow","Liberation Sans Narrow","Helvetica Neue",Arial,sans-serif',sans:'700 %px "Helvetica Neue",Arial,sans-serif'};
const xfont=(k,px)=>XF[k].replace('%',Math.round(px));
/* ---- canvas drawing helpers ---- */
function xpRR(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
/* text, centred on X,Y. o: {al, mw (squeeze to max width), st (outline colour), lw, sh (drop shadow colour), so (shadow offset)} */
function xpT(x,s,X,Y,px,fk,fill,o){o=o||{};x.save();x.font=xfont(fk,px);x.textAlign=o.al||'center';x.textBaseline='middle';x.translate(X,Y);
 if(o.mw){const m=x.measureText(s).width;if(m>o.mw)x.scale(o.mw/m,1)}x.lineJoin='round';
 if(o.sh){const so=o.so||px*.08;if(o.st){x.lineWidth=o.lw||px*.2;x.strokeStyle=o.sh;x.strokeText(s,so,so)}x.fillStyle=o.sh;x.fillText(s,so,so)}
 if(o.st){x.lineWidth=o.lw||px*.2;x.strokeStyle=o.st;x.strokeText(s,0,0)}x.fillStyle=fill;x.fillText(s,0,0);x.restore()}
/* text on an arc round cx,cy (top arc, or bottom arc reading left to right with o.down) */
function xpArc(x,s,cx,cy,r,px,fk,fill,o){o=o||{};x.save();x.font=xfont(fk,px);x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
 const sp=o.sp||0,ws=[...s].map(q=>x.measureText(q).width),tot=ws.reduce((a,b)=>a+b,0)+sp*(ws.length-1),dn=o.down?-1:1;let a=(o.down?Math.PI/2:-Math.PI/2)-dn*tot/r/2;
 [...s].forEach((q,i)=>{a+=dn*ws[i]/2/r;x.save();x.translate(cx+r*Math.cos(a),cy+r*Math.sin(a));x.rotate(a+dn*Math.PI/2);if(o.st){x.lineWidth=o.lw||px*.2;x.strokeStyle=o.st;x.strokeText(q,0,0)}x.fillStyle=fill;x.fillText(q,0,0);x.restore();a+=dn*(ws[i]/2+sp)/r});x.restore()}
function xpStar(x,cx,cy,R,r,n,fill,rot){x.beginPath();for(let i=0;i<n*2;i++){const a=(rot||-Math.PI/2)+i*Math.PI/n,q=i%2?r:R;x.lineTo(cx+q*Math.cos(a),cy+q*Math.sin(a))}x.closePath();if(fill){x.fillStyle=fill;x.fill()}}
/* dashed stitching round a rounded rect */
function xpStitch(x,X,Y,W,H,r,col,lw){x.save();x.setLineDash([lw*1.6,lw*1.4]);x.lineWidth=lw;x.strokeStyle=col;xpRR(x,X,Y,W,H,r);x.stroke();x.restore()}
/* chenille / embroidery grain on whatever was just drawn */
function xpGrain(x,W,H,a,seed){let h=seed||7;const r=()=>(h=(h*1103515245+12345)>>>0)/4294967296;x.save();x.globalCompositeOperation='source-atop';for(let i=0;i<W*H/40;i++){x.fillStyle=r()<.5?`rgba(0,0,0,${a})`:`rgba(255,255,255,${a})`;x.fillRect(r()*W,r()*H,2,2)}x.restore()}
const xpInk=c=>xlum(c)>.55?'#1d1d22':'#f4f1e8';

/* ---- textures and materials (cached; redrawn once the pixel font has loaded) ---- */
function xpKey(n,c,v){return n+'|'+c+'|'+(v==null?'':v)}
function xpDraw(t){const cv=t.image,x=cv.getContext('2d'),[n,c,v]=t.xp;x.clearRect(0,0,cv.width,cv.height);try{XPR[n].f(x,cv.width,cv.height,c,v)}catch(e){console.warn('print',n,e)}t.needsUpdate=true}
function xpTex(n,c,v){const k=xpKey(n,c,v);let t=XPT[k];if(t)return t;const P=XPR[n],cv=document.createElement('canvas');cv.width=P.s[0];cv.height=P.s[1];
 t=new THREE.CanvasTexture(cv);t.anisotropy=4;t.xp=[n,c,v];xpDraw(t);return XPT[k]=t}
const xpAsp=n=>XPR[n].s[1]/XPR[n].s[0];
function xpMat(n,c,v){const k=xpKey(n,c,v);return XPMC[k]||(XPMC[k]=new THREE.MeshLambertMaterial({map:xpTex(n,c,v),transparent:true,alphaTest:.03,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))}
/* an all-over pattern (the artwork includes the cloth colour), for swapping onto whole pieces */
function xpSkinMat(n,c,v,shine){const k='skin|'+xpKey(n,c,v)+(shine?'!':'');return XPMC[k]||(XPMC[k]=shine?new THREE.MeshPhongMaterial({map:xpTex(n,c,v),shininess:shine,specular:0x606060}):new THREE.MeshLambertMaterial({map:xpTex(n,c,v)}))}
/* a decal: a plane of size w x h facing +z (turned by ry, tipped by rx) */
function xprint(g,n,c,w,h,x,y,z,ry,v,rx){const k=w.toFixed(3)+','+h.toFixed(3),m=new THREE.Mesh(XPGC[k]||(XPGC[k]=new THREE.PlaneGeometry(w,h)),xpMat(n,c,v));m.position.set(x,y,z);if(ry||rx)m.rotation.set(rx||0,ry||0,0);g.add(m);return m}
/* swap a colour's plain material for a pattern on the given groups (direct children only, so other clothes keep theirs) */
function xpSkin(gs,c,n,v,shine){const pm=M(c),gm=XMC['!'+c],sm=xpSkinMat(n,c,v,shine);gs.forEach(o=>o&&o.children.forEach(m=>{if(m.isMesh&&(m.material===pm||(gm&&m.material===gm)))m.material=sm}))}
{const rd=()=>{Object.values(XPT).forEach(xpDraw);for(const k in ISOC)if(k.startsWith('k:'))delete ISOC[k]};
 try{if(document.fonts){document.fonts.load(xfont('pix',20)).then(rd,()=>{});document.fonts.ready.then(rd)}}catch(e){}}

/* ---- placing prints on a torso: u is across (-.5 to .5), v up the body (0 hem, 1 shoulder), pw the width as a share of the torso ---- */
/* frame of a top or a jacket on the character: width, height, bottom, front z, sleeve face */
const xpFrame=(x,k)=>k=='jk'?{W:x.w+.08,H:.62,y0:.49,z:x.d/2+.049,sx:.097}:{W:x.w,H:.6,y0:.5,z:x.d/2+.0095,sx:.0905};
function xpPlace(x,k,sp,c,v){const F=xpFrame(x,k);
 (sp.f||[]).forEach(([n,u,vv,pw])=>{const w=pw*F.W;xprint(x.g,n,c,w,w*xpAsp(n),u*F.W,F.y0+vv*F.H,F.z,0,v)});
 (sp.b||[]).forEach(([n,u,vv,pw])=>{const w=pw*F.W;xprint(x.g,n,c,w,w*xpAsp(n),-u*F.W,F.y0+vv*F.H,-F.z,Math.PI,v)});
 (sp.s||[]).forEach(([n,y,pw,both])=>(both?[0,1]:[1]).forEach(i=>{const a=x.arms[i],s=i?1:-1;if(a)xprint(a,n,c,pw,pw*xpAsp(n),s*F.sx,-y,0,s*Math.PI/2,v)}))}
/* the same prints on a shop / wardrobe preview (box lists: top torso .9 x .7 at y .5, jacket .95 x .75) */
function xpPrev(L,k,sp,c){const P=k=='jk'?{W:.95,H:.75,y0:.125,z:.282,sx:.75,sy:.85}:{W:.9,H:.7,y0:.15,z:.257,sx:.692,sy:.8};
 (sp.f||[]).forEach(([n,u,vv,pw])=>{const w=pw*P.W;L.push([w,w*xpAsp(n),.01,'none',u*P.W,P.y0+vv*P.H,P.z,{p:n,col:c}])});
 (sp.s||[]).forEach(([n,y,pw])=>{const w=pw*1.3;L.push([.01,w*xpAsp(n),w,'none',P.sx,P.sy-y*1.3,0,{p:n,col:c,f:'x'}])});return L}

/* ---- the artwork ---- */
/* Graphic Tee: a sunset over the sea with palms */
XPR.sunset={s:[256,256],f:(x,W,H,c)=>{const ink=xpInk(c);x.save();xpRR(x,14,8,228,190,30);x.clip();
 const g=x.createLinearGradient(0,8,0,150);g.addColorStop(0,'#ff3d81');g.addColorStop(.5,'#ff8a3c');g.addColorStop(1,'#ffd27a');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.beginPath();x.arc(128,134,64,Math.PI,0);x.closePath();x.clip();const sg=x.createLinearGradient(0,70,0,134);sg.addColorStop(0,'#fff6b8');sg.addColorStop(1,'#ffb347');x.fillStyle=sg;x.fillRect(60,60,140,80);
 x.fillStyle='#ff7a4a';[[96,5],[110,7],[124,9]].forEach(([y,h])=>x.fillRect(60,y,140,h));x.restore();
 const sea=x.createLinearGradient(0,134,0,200);sea.addColorStop(0,'#14a3a8');sea.addColorStop(1,'#0b4f6c');x.fillStyle=sea;x.fillRect(0,134,W,70);
 x.strokeStyle='#8ff3ee';x.lineWidth=3;[[146,70],[158,100],[171,60],[184,90]].forEach(([y,l],i)=>{x.beginPath();x.moveTo(128-l+(i%2)*14,y);x.lineTo(128+l-(i%2)*10,y);x.stroke()});
 x.fillStyle='#ffe9a8';x.fillRect(0,192,W,10);
 /* palms */
 const palm=(bx,by,h,lean,s)=>{x.strokeStyle='#2a1033';x.lineCap='round';x.lineWidth=7;x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx+lean*.3,by-h*.6,bx+lean,by-h);x.stroke();
  const tx=bx+lean,ty=by-h;x.fillStyle='#2a1033';for(let i=0;i<6;i++){const a=-Math.PI+i*Math.PI/5+(i>2?.2:-.2);x.save();x.translate(tx,ty);x.rotate(a);x.beginPath();x.ellipse(24*s,0,26*s,6*s,.25,0,7);x.fill();x.restore()}};
 palm(44,200,120,16,1);palm(214,200,96,-12,.85);x.restore();
 x.lineWidth=7;x.strokeStyle=ink;xpRR(x,14,8,228,190,30);x.stroke();
 xpT(x,'SUNSET CLUB',128,226,34,'blk',ink,{mw:232});xpT(x,'· WAVEFERN COAST · EST. 1999 ·',128,250,13,'sans',ink,{mw:220})}};
XPR.sunsetneck={s:[128,64],f:(x,W,H,c)=>{const ink=xpInk(c);xpT(x,'SUNSET',64,22,26,'blk',ink,{mw:112});xpT(x,'CLUB',64,48,20,'blk','#ff8a3c',{mw:80})}};
/* Classic Tee: the little WaveFern leaf on the chest */
XPR.fern={s:[128,128],f:(x,W,H,c)=>{const ink=xlum(c)>.55?'#1f7a4a':'#9cf5c0';x.strokeStyle=ink;x.fillStyle=ink;x.lineCap='round';x.lineWidth=6;
 x.beginPath();x.moveTo(60,122);x.quadraticCurveTo(70,70,58,8);x.stroke();for(let i=0;i<7;i++){const t=i/7,y=110-t*96,l=34*(1-t*.75);[-1,1].forEach(s=>{x.save();x.translate(64-t*6+s*2,y);x.rotate(s*(1.05-t*.3));x.beginPath();x.ellipse(0,-l/2,l*.22,l/2,0,0,7);x.fill();x.restore()})}}};
/* Sports Jersey: FERNS across the front, the artist's name and 23 on the back */
const xpTeam=c=>({ink:xpInk(c),out:xlum(c)>.55?'#c0392b':'#e6b422'});
XPR.jerseyf={s:[256,192],f:(x,W,H,c)=>{const{ink,out}=xpTeam(c);xpArc(x,'FERNS',128,250,170,58,'blk',ink,{st:out,lw:10,sp:2});xpT(x,'23',128,150,64,'blk',ink,{st:out,lw:10})}};
XPR.jerseyb={s:[256,256],f:(x,W,H,c,v)=>{const{ink,out}=xpTeam(c);xpArc(x,String(v||'WAVEFERN').toUpperCase().slice(0,12),128,300,250,40,'blk',ink,{sp:3});xpT(x,'23',128,160,150,'blk',ink,{st:out,lw:14,mw:230})}};
XPR.jerseys={s:[96,96],f:(x,W,H,c)=>{const{ink,out}=xpTeam(c);xpStar(x,48,48,40,17,5,out);xpStar(x,48,48,28,12,5,ink)}};
/* Polo Shirt: an embroidered sailboat */
XPR.polo={s:[96,96],f:(x,W,H,c)=>{const a=xlum(c)>.55,ink=a?'#1f3a6e':'#f4f1e8',ac=a?'#c0392b':'#e6b422';x.fillStyle=ink;x.beginPath();x.moveTo(50,10);x.lineTo(50,64);x.lineTo(20,64);x.closePath();x.fill();
 x.fillStyle=ac;x.beginPath();x.moveTo(55,20);x.lineTo(55,64);x.lineTo(78,64);x.closePath();x.fill();x.fillStyle=ink;x.beginPath();x.moveTo(12,70);x.lineTo(84,70);x.lineTo(72,84);x.lineTo(24,84);x.closePath();x.fill();xpGrain(x,W,H,.18,3)}};
/* Varsity Jacket: chenille W on the chest, arched back lettering and a sleeve number */
const xpChen=(x,s,X,Y,px,c,o)=>{const cr='#efe6d0',dd=xtone(c,.55);xpT(x,s,X,Y,px,'blk',cr,Object.assign({st:cr,lw:px*.34},o));xpT(x,s,X,Y,px,'blk',cr,Object.assign({st:dd,lw:px*.14},o))};
XPR.varsity={s:[128,128],f:(x,W,H,c)=>{xpChen(x,'W',64,68,80,c,{mw:96});xpGrain(x,W,H,.12,5)}};
XPR.varsityb={s:[256,192],f:(x,W,H,c)=>{const cr='#efe6d0',dd=xtone(c,.55);xpArc(x,'WAVEFERN',128,250,190,40,'blk',cr,{st:dd,lw:7,sp:1});xpT(x,'Records',128,128,46,'scr',cr,{st:dd,lw:5});xpT(x,'EST · 26',128,172,22,'blk',cr)}};
XPR.varsitys={s:[128,128],f:(x,W,H,c)=>{xpChen(x,'26',64,66,76,c,{mw:118});xpGrain(x,W,H,.12,9)}};
/* caps and beanies */
XPR.capwf={s:[128,96],f:(x,W,H,c)=>{const ink=xpInk(c),ac=xlum(c)>.55?'#c0392b':'#e6b422';xpT(x,'W',50,52,78,'ser',ink,{st:ac,lw:5});xpT(x,'F',80,48,64,'ser',ink,{st:ac,lw:5});xpGrain(x,W,H,.15,4)}};
XPR.fresh={s:[192,96],f:(x,W,H,c)=>{const ink=xpInk(c),ac=xlum(c)>.55?'#e84393':'#40e0d0';xpT(x,'FRESH',96,46,58,'blk',ink,{sh:ac,so:5,st:ink,lw:2,mw:180});x.fillStyle=ac;x.fillRect(30,80,132,6)}};
XPR.sticker={s:[64,64],f:(x,W,H)=>{const g=x.createRadialGradient(26,24,4,32,32,30);g.addColorStop(0,'#fff6c8');g.addColorStop(.6,'#e6b422');g.addColorStop(1,'#9a7414');x.fillStyle=g;x.beginPath();x.arc(32,32,30,0,7);x.fill();
 x.strokeStyle='#7a5a10';x.lineWidth=2;x.beginPath();x.arc(32,32,24,0,7);x.stroke();xpT(x,'THRDZ',32,27,13,'blk','#5a420c',{mw:40});xpT(x,'100% REAL',32,41,8,'sans','#5a420c',{mw:40})}};
XPR.label={s:[128,64],f:(x,W,H,c)=>{x.fillStyle='#f4f1e8';xpRR(x,4,6,120,52,6);x.fill();xpStitch(x,10,12,108,40,4,'#9a8f7a',2);xpT(x,'THREADZ',64,33,26,'blk','#1d1d22',{mw:96})}};
XPR.bigrig={s:[160,128],f:(x,W,H,c)=>{const ink=xlum(c)>.7?'#1d1d22':dk(c,.75);x.fillStyle=ink;x.beginPath();x.moveTo(26,92);x.lineTo(62,40);x.lineTo(84,68);x.lineTo(100,50);x.lineTo(134,92);x.closePath();x.fill();
 x.fillStyle='#f4f4f4';x.beginPath();x.moveTo(62,40);x.lineTo(54,52);x.lineTo(70,52);x.closePath();x.fill();xpT(x,'BIG RIG CO.',80,112,26,'blk',ink,{mw:150});xpT(x,'HAUL IT HOME',80,18,13,'sans',ink,{mw:130})}};

/* ---- which items wear which prints ---- */
XPD['Classic Tee']={k:'top',f:[['fern',.26,.68,.17]]};
XPD['Graphic Tee']={k:'top',f:[['sunset',0,.5,.66]],b:[['sunsetneck',0,.86,.3]]};
XPD['Sports Jersey']={k:'top',f:[['jerseyf',0,.58,.72]],b:[['jerseyb',0,.5,.74]],s:[['jerseys',.13,.11]],v:()=>S.artist,drop:a=>a[3]=='#f4f4f4'&&a[6]==.26,
 on:x=>{const wm=M('#f4f4f4'),m=x.g.children.find(m=>m.isMesh&&m.material===wm&&Math.abs(m.position.y-.85)<1e-6&&Math.abs(m.position.z-(x.d/2+.01))<1e-6);if(m)x.g.remove(m)}};
XPD['Polo Shirt']={k:'top',f:[['polo',.26,.74,.14]]};
XPD['Varsity Jacket']={k:'jk',f:[['varsity',-.31,.68,.26]],b:[['varsityb',0,.55,.8]],s:[['varsitys',.13,.15]]};
XPD['Cap']={k:'ht',on:(x,c)=>xprint(x.h,'capwf',c,.2,.15,0,.37,.3215),pv:c=>[[.36,.27,.01,'none',0,.32,.456,{p:'capwf',col:c}]]};
XPD['Snapback']={k:'ht',on:(x,c)=>{xprint(x.h,'fresh',c,.34,.17,0,.37,.3115);xprint(x.h,'sticker',c,.08,.08,.12,.3165,.48,0,null,-Math.PI/2)},pv:c=>[[.6,.3,.01,'none',0,.3,.456,{p:'fresh',col:c}]]};
XPD['Beanie']={k:'ht',on:(x,c)=>xprint(x.h,'label',c,.14,.07,0,.27,.3345),pv:c=>[[.22,.11,.01,'none',0,.1,.481,{p:'label',col:c}]]};
XPD['Pom Beanie']={k:'ht',on:(x,c)=>xprint(x.h,'label',c,.14,.07,0,.27,.3345),pv:c=>[[.22,.11,.01,'none',0,.1,.481,{p:'label',col:c}]]};
XPD['Trucker Cap']={k:'ht',on:(x,c)=>xprint(x.h,'bigrig',c,.2,.16,0,.375,.3315),pv:c=>[[.34,.272,.01,'none',0,.3,.486,{p:'bigrig',col:c}]]};

/* the item a character is wearing in a slot, if its style still matches what is on the body (only your own character) */
const XPSL={top:c=>c.top,jk:c=>c.jk>=0?c.jks||0:null,bt:c=>c.bt||0,sh:c=>c.sh>=0?(c.shs!==undefined?c.shs:(SHC[c.sh]||[0,0])[1]):null,ht:c=>c.ht>=0?(c.hts!==undefined?c.hts:[0,1,2,0,3,1,2][c.ht]??0):null,ac:c=>c.ac>=0?c.ac:null};
function xWorn(c,sl){if(c!==ch)return null;const id=(S.wn||{})[sl],g=id&&GM[id];if(!g||g.slot!=sl)return null;const st=XPSL[sl](c);return st===g.st?g:null}
const xSlotCol=(c,sl)=>sl=='top'?c.tc_custom||TOPC[c.tc]||'#888888':sl=='jk'?JKC[c.jk]||'#888888':sl=='bt'?c.pc_custom||PANTC[c.pc]||'#888888':sl=='sh'?(SHC[c.sh]||['#222222'])[0]:sl=='ht'?(HTC[c.ht]||['#888888'])[0]:c.acc||'#222222';
{const bc2=buildChar;buildChar=function(c){const r=bc2(c);if(c!==ch)return r;
 try{const x={g:r.g,legs:r.legs,arms:r.arms,h:xHead(r.g),w:.42+c.body*.5,d:.3+c.body*.28,sk:SKIN[c.skin],c,jk:c.jk>=0,o:c.jk>=0?.045:0};
  ['top','jk','bt','sh','ht','ac'].forEach(sl=>{if(sl=='top'&&x.jk)return;const g=xWorn(c,sl),sp=g&&XPD[g.n];if(!sp)return;const col=xSlotCol(c,sl),v=sp.v?sp.v():null;
   if(sp.k=='top'||sp.k=='jk')xpPlace(x,sp.k,sp,col,v);if(sp.on&&(sl!='ht'||x.h))sp.on(x,col,v)})}catch(e){console.warn('prints',e)}return r}}

/* ---- previews: the shop's flat drawing and the wardrobe's 3D model learn to show prints ---- */
{const clb2=clb;clb=function(k){const L=clb2(k),[id,col]=String(k).split('|'),g=GM[id],sp=g&&XPD[g.n];if(!sp||!Array.isArray(L))return L;const c=col||g.dc;
 let o=sp.drop?L.filter(a=>!sp.drop(a,c)):L.slice();if(sp.k=='top'||sp.k=='jk')xpPrev(o,sp.k,sp,c);if(sp.pv)o=o.concat(sp.pv(c));return o}}
/* the flat iso drawing with textured faces (a box's 8th entry: {p: print, col, v, f: 'z' front | 'x' side | 'all'}; colour 'none' draws only the print) */
function xIso(L,sz){const P=(X,Y,Z)=>[(X-Z)*.866,(X+Z)*.5-Y],polys=[];
 L.forEach(a=>{let[w,h,d,c,x,y,z,T]=a;const none=c=='none';c=String(c||'#888').replace(/^[*!~^]/,'');if(c[0]!='#')c='#888888';const x0=x-w/2,x1=x+w/2,y0=y-h/2,y1=y+h/2,z0=z-d/2,z1=z+d/2,k=(x+z)*.5+y*.7+(w+d)*.02,f=T&&(T.f||'z');
  const tex=T&&xpTex(T.p,T.col,T.v).image;
  if(!none)polys.push({k,c:xlt(c,.14),tx:f=='all'&&tex,sh:1,p:[P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z1),P(x0,y1,z1)],q:[P(x0,y1,z0),P(x1,y1,z0),P(x0,y1,z1)]});
  if(!none||f=='x')polys.push({k:k+.001,c:none?null:dk(c,.82),tx:(f=='x'||f=='all')&&tex,sh:.9,p:[P(x1,y1,z1),P(x1,y1,z0),P(x1,y0,z0),P(x1,y0,z1)],q:[P(x1,y1,z1),P(x1,y1,z0),P(x1,y0,z1)]});
  if(!none||f=='z')polys.push({k:k+.002,c:none?null:dk(c,.64),tx:(f=='z'||f=='all')&&tex,sh:f=='all'?.68:.8,p:[P(x0,y1,z1),P(x1,y1,z1),P(x1,y0,z1),P(x0,y0,z1)],q:[P(x0,y1,z1),P(x1,y1,z1),P(x0,y0,z1)]})});
 let mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;polys.forEach(o=>o.p.forEach(v=>{mnx=Math.min(mnx,v[0]);mxx=Math.max(mxx,v[0]);mny=Math.min(mny,v[1]);mxy=Math.max(mxy,v[1])}));
 const sc=(sz-24)/Math.max(mxx-mnx,mxy-mny,.01),cv=document.createElement('canvas');cv.width=cv.height=sz;const g=cv.getContext('2d'),ox=(sz-(mxx-mnx)*sc)/2-mnx*sc,oy=(sz-(mxy-mny)*sc)/2-mny*sc,S_=v=>[v[0]*sc+ox,v[1]*sc+oy];
 g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(sz/2,sz-10,sz*.3,6,0,0,7);g.fill();
 polys.sort((a,b)=>a.k-b.k).forEach(o=>{const path=()=>{g.beginPath();o.p.forEach((v,i)=>{const s=S_(v);i?g.lineTo(s[0],s[1]):g.moveTo(s[0],s[1])});g.closePath()};
  if(o.c){path();g.fillStyle=o.c;g.fill()}
  if(o.tx){const[a,b,c2]=o.q.map(S_),W=o.tx.width,H=o.tx.height;g.save();path();g.clip();g.setTransform((b[0]-a[0])/W,(b[1]-a[1])/W,(c2[0]-a[0])/H,(c2[1]-a[1])/H,a[0],a[1]);g.drawImage(o.tx,0,0);
   if(o.sh<1){g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(0,0,0,${1-o.sh})`;g.fillRect(0,0,W,H)}g.restore()}
  if(o.c){path();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=.7;g.stroke()}});return cv.toDataURL()}
{const iso0=isoP;isoP=function(t,key,sz=190){if(t!='k')return iso0(t,key,sz);const ck=t+':'+key;if(ISOC[ck])return ISOC[ck];let L;try{L=clb(String(key))}catch(e){L=null}
 if(!L||!L.some(a=>a[7]))return iso0(t,key,sz);let url='';try{url=xIso(L,sz)}catch(e){console.warn('preview',e);return iso0(t,key,sz)}return ISOC[ck]=`<img src="${url}" style="width:${sz}px;height:${sz}px;display:block;margin:0 auto">`}}
{const pm1=pvModel;pvModel=function(k){if(PVM[k])return PVM[k];const p=String(k).split(':');if(p[0]!='k')return pm1(k);let L;try{L=clb(p.slice(1).join(':'))}catch(e){L=null}if(!L||!L.some(a=>a[7]))return pm1(k);
 const w=new THREE.Group(),g=new THREE.Group();L.forEach(a=>{const[bw,bh,bd,c,x,y,z,T]=a;let m=null;if(c!='none')m=B(g,bw,bh,bd,c,x,y,z);if(!T)return;const f=T.f||'z';
  if(f=='all'){if(m)m.material=xpSkinMat(T.p,T.col,T.v)}else if(f=='x')xprint(g,T.p,T.col,bd,bh,x+bw/2+.004,y,z,Math.PI/2,T.v);else xprint(g,T.p,T.col,bw,bh,x,y,z+bd/2+.004,0,T.v)});
 const bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3()),z=bb.getSize(new THREE.Vector3());g.position.sub(c);w.add(g);w.scale.setScalar(1.6/Math.max(z.x,z.y,z.z));return PVM[k]=w}}
