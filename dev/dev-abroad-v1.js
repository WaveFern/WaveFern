/* WaveFern dev: abroad polish. Only loaded on /dev/ (see dev/index.html); the live game is untouched. Add ?noabroad to skip it.
   1. Destination cities: the open land around the town is filled with suburbs (streets, blocks of houses or mid-rise, parks, pitches)
      dressed for each country (palms, pagodas, minarets, ruins, gates, lanterns, bunting, water tanks, helipads...).
   2. Trees abroad are all normal green (the old tree colour was read as a string, which made them brown).
   3. Hotel lobbies: no hanging chandelier. Every country has its own furniture colours in the lobby and the room.
   4. Snow also settles on destination cities (roads, roofs, pavements), but never in hot climates: there the day counts as dry. */
(function(){
 if(!window.FW_FEAT||/[?&]noabroad/.test(location.search))return;
 const D=window.DCITY;if(!D||!D.cityHooks)return;
 const warn=(t,e)=>{if(!warn[t]){warn[t]=1;console.warn('dev abroad '+t,e)}};
 /* ---------- 2. green trees ---------- */
 if(typeof blkTree=='function'){const b0=blkTree;blkTree=function(box,x,z,s,seed,col){return b0(box,x,z,s,seed,typeof col=='string'?undefined:col)}}

 /* ---------- 4. snow only where it can snow ---------- */
 const HOT=['la','mia','mex','rio','sao','bue','col','bcn','rom','lag','jnb','cpt','cai','ken','mar','mum','dxb','bkk','idn','syd','mel','nzl'];
 const hot=()=>{const C=D.C;return !!(D.on&&C&&(HOT.includes(D.id)||C.s.palm||C.s.desert))};
 try{const u0=update;update=function(dt){
  const w=typeof S=='object'&&S?S.wx:null,fake=!!(w&&w.k=='snow'&&hot());
  if(fake)w.k='sun';
  try{return u0(dt)}finally{if(fake)w.k='snow'}}}catch(e){warn('update',e)}
 D.hooks.push((ev,C)=>{if(ev!='arrive'||!C||!window.FW_XMAS_PATCH)return;
  try{C.g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.normal&&o.material&&o.material.isMeshLambertMaterial)window.FW_XMAS_PATCH(o.material);/* the big flat ground plane under the city and its suburbs */if(o.isMesh&&o.geometry&&o.material&&o.geometry.type=='PlaneGeometry'&&o.geometry.parameters.width>=1000&&!o.material.vertexColors&&!o.material.map&&window.FW_XMAS_GROUND){const c=o.material.color;if(c.g>c.r*1.05&&c.g>c.b*1.2)window.FW_XMAS_GROUND(o.material)}})}catch(e){warn('patch',e)}});

 /* ---------- 3. hotel colours, no chandelier ---------- */
 const mk0=D.mkRoom;
 D.mkRoom=function(key){
  const rm=mk0.apply(this,arguments),C=D.building||D.C;
  if(rm&&C&&(key=='lobby'||key=='room'))try{hotel(rm,key,C)}catch(e){warn('hotel',e)}
  return rm};
 const WOODS=[['#5a3a2a','#6a4a3a','#4a3226'],['#7a5a3a','#8a6a46','#5a4028'],['#3a2a22','#4a3a30','#2a1c16'],['#8a6a4a','#a08058','#6a4e34'],['#2f2f36','#3a3a44','#202026'],['#6a3a2a','#7a4634','#4a261c'],['#9a8a6a','#aa9a78','#7a6a4e'],['#4a4a3a','#5a5a48','#34342a']];
 function hotel(rm,key,C){
  const idx=Math.max(0,WT_DEST.findIndex(d=>d.id==C.id)),h=(idx*.381966)%1,hc=(o,s,l)=>'#'+new THREE.Color().setHSL(((h+o)%1+1)%1,s,l).getHexString();
  const wd=WOODS[idx%WOODS.length],fab=hc(0,.5,.4),M={};
  if(key=='lobby'){M['#7a2a3a']=hc(.5,.5,.3);M['#3a5a6a']=hc(.08,.4,.38);M['#5a3a2a']=wd[0]}
  else{const old=C.s.acc||'#3a5a8a';[1,1.25,.9,.85,.8,.75,.7,.55].forEach(f=>{M[f==1?old.toLowerCase():dk(old,f)]=f==1?fab:dk(fab,f)});M['#6a4a3a']=wd[1];M['#4a3226']=wd[2];M['#8a6a4a']=wd[1]}
  const b0=rm.box,g0=rm.glow;
  rm.box=function(w,hh,d,c,x,y,z,cl){return b0.call(rm,w,hh,d,(typeof c=='string'&&M[c.toLowerCase()])||c,x,y,z,cl)};
  if(key=='lobby')rm.glow=function(w,hh,d,c,x,y,z){if(y>=3.9)return;return g0.apply(rm,arguments)}}

 /* ---------- 1. suburbs ---------- */
 const mkR=sd=>{let a=sd>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
 D.cityHooks.push(C=>{try{suburbs(C)}catch(e){console.error('dev abroad suburbs',e)}});
 function suburbs(C){
  const s=C.s,r=mkR(typeof fHash=='function'?fHash('abroad'+C.id):C.id.length*7919),RR=(a,b)=>a+r()*(b-a),pk=a=>a[Math.floor(r()*a.length)];
  const G=D.mkG(),bx=D.bx,qY=D.quadY,qZ=D.quadZ,qX=D.quadX,W=C.W,zM=C.zMax,a=C.air,CW=44,CD=36,M=150;
  const roofs=s.terra?['#b8583a','#c8683a','#a84a2e','#d07a48']:s.hanok?['#3a3e46','#464a52']:s.wood?['#6a3a2a','#8a3a2a','#4a4e56']:['#6a4a3a','#4a4e56','#8a3a2a','#5a5a60','#7a4a3a'];
  const pitched=!(s.big||s.desert),lamps=s.lantern||s.temple||['ja','zh','ko'].includes(s.lang);
  const hit=(x0,z0,x1,z1,A,B,Cc,Dd)=>x0<Cc&&x1>A&&z0<Dd&&z1>B;
  const x0s=C.rx[0]+CW/2,z0s=C.rz[0]+CD/2,kx0=Math.ceil((-M-x0s)/CW),kx1=Math.floor((W+M-x0s)/CW),kz0=Math.ceil((-M-z0s)/CD),kz1=Math.floor((zM+M-z0s)/CD);
  for(let kx=kx0;kx<=kx1;kx++)for(let kz=kz0;kz<=kz1;kz++){
   const cx=x0s+kx*CW,cz=z0s+kz*CD,X0=cx-CW/2,X1=cx+CW/2,Z0=cz-CD/2,Z1=cz+CD/2;
   if(hit(X0,Z0,X1,Z1,-8,-8,W+8,zM+8))continue;/* the town itself */
   if(hit(X0,Z0,X1,Z1,-160,a.z0-170,45,a.z1+170))continue;/* runway and apron */
   if(s.water&&Z1>C.wz-20)continue;
   const bx0=cx-18,bx1=cx+18,bz0=cz-14,bz1=cz+14,dist=Math.hypot(Math.max(0,-cx,cx-W),Math.max(0,-cz,cz-zM));
   qY(G,X0,Z0,X1,Z1,.02,s.asph);for(let x=X0+3;x<X1-3;x+=6)qY(G,x,Z1-4.05,x+2.6,Z1-3.95,.035,'#e8e4d8');
   qY(G,bx0-1,bz0-1,bx1+1,bz1+1,.04,s.walk);
   const k=r();
   if(k<.1){/* park */
    qY(G,bx0,bz0,bx1,bz1,.05,s.desert?'#c8b080':'#5a9a4a');qY(G,cx-1,bz0,cx+1,bz1,.06,'#d8cba8');qY(G,bx0,cz-1,bx1,cz+1,.06,'#d8cba8');
    for(let i=0;i<14;i++){const x=RR(bx0+2,bx1-2),z=RR(bz0+2,bz1-2);if(Math.abs(x-cx)<2.5||Math.abs(z-cz)<2.5)continue;if(s.palm)D.palm(G,x,z,RR(5,8));else D.tree(G,x,z,undefined,RR(.9,1.3))}
    bx(G,6,.12,6,'#3a7ab0',cx+9,.1,cz+7)}
   else if(k<.16){/* sports pitch */
    qY(G,bx0+2,bz0+2,bx1-2,bz1-2,.05,'#3f8f45');const m='#f4f4f0';qY(G,bx0+2,bz0+2,bx1-2,bz0+2.25,.06,m);qY(G,bx0+2,bz1-2.25,bx1-2,bz1-2,.06,m);qY(G,bx0+2,bz0+2,bx0+2.25,bz1-2,.06,m);qY(G,bx1-2.25,bz0+2,bx1-2,bz1-2,.06,m);qY(G,cx-.12,bz0+2,cx+.12,bz1-2,.06,m);
    [bx0+2,bx1-2].forEach(x=>bx(G,.2,2.4,3,'#e8e8e8',x,1.2,cz))}
   else{
    [[bz0,cz-1.5],[cz+1.5,bz1]].forEach(([z0,z1])=>{let x=bx0;while(x<bx1-4){let w=Math.min(bx1-x,pitched||s.gable?RR(6,10):s.big?RR(9,15):RR(8,13));if(bx1-x-w<5)w=bx1-x;
     const lx0=x+.5,lx1=x+w-.5,lz0=z0+.4,lz1=z1-.4,mx=(lx0+lx1)/2,mz=(lz0+lz1)/2,ww=lx1-lx0,dd=lz1-lz0;x+=w;if(ww<3||dd<3)continue;
     const wall=pk(s.big&&r()<.45?s.glassC:s.walls);let h;
     if(s.big){h=RR(9,26)*(.8+s.tall*.5);if(r()<.1*s.tall+.03)h=RR(34,80)*(.7+s.tall*.4)}else h=RR(4.5,9.5);
     h=Math.max(4.2,h);if(dist<70&&s.big)h*=.85;
     bx(G,ww,h,dd,wall,mx,h/2,mz,0,dk(wall,.8));
     const wc=dk(wall,.5),lit='#ffd890';
     for(let y=2.4;y<h-1.2;y+=3){qZ(G,lx0+.7,lx1-.7,y,y+1.4,lz1+.03,r()<.3?lit:wc);qX(G,lz0+.7,lz1-.7,y,y+1.4,lx1+.03,r()<.3?lit:wc)}
     if(s.mural&&r()<.25)qZ(G,lx0+.5,lx1-.5,.4,Math.min(h-.5,3.4),lz1+.05,pk([s.acc,s.neon,'#ff8a3a','#3ad0ff','#ffd23d']));
     else if(s.neonK>.5&&r()<.35)qZ(G,lx0+1,lx1-1,3.6,4.8,lz1+.06,pk([s.neon,s.acc]));
     if(s.big||s.desert){bx(G,ww+.3,.5,dd+.3,dk(wall,.7),mx,h+.25,mz);if(r()<.5)bx(G,2.2,1.6,2.2,'#8a8e94',lx0+2,h+1.3,lz0+2);
      if(s.fire&&r()<.45){bx(G,2.2,2.4,2.2,'#6b4a2e',mx,h+1.7,mz);bx(G,2.5,.4,2.5,'#4a3320',mx,h+3.1,mz);[-.9,.9].forEach(o=>bx(G,.15,1,.15,'#4a3320',mx+o,h+.5,mz+o))}
      if(s.heli&&h>40&&r()<.4){bx(G,Math.min(ww,dd)-1.5,.3,Math.min(ww,dd)-1.5,'#3a3a40',mx,h+.5,mz);qY(G,mx-1.5,mz-1.5,mx+1.5,mz+1.5,h+.66,'#f4f4f0')}
      if(s.fire&&h<30)for(let y=4;y<h-2;y+=3)bx(G,Math.min(4,ww-2),.1,1,'#3a3a3a',mx,y,lz1+.5)}
     else{D.gable(G,lx0-.3,lz0-.3,lx1+.3,lz1+.3,h,Math.min(2.8,dd*.3),pk(roofs),wall,ww>=dd)}
     if(s.gold&&r()<.5)bx(G,ww+.1,.3,dd+.1,'#d4af37',mx,h+.1,mz);
     if(r()<.07){/* a landmark now and then */
      if(s.minaret){bx(G,1.4,h+9,1.4,'#e8dcc4',lx1-1,(h+9)/2,lz1-1);D.dome(G,1.3,lx1-1,h+9,lz1-1,'#3a9a8a','#d4af37')}
      else if(s.temple){for(let t=0;t<3;t++)bx(G,5-t*1.2,.5,5-t*1.2,t%2?'#d4af37':'#b8322a',mx,h+.5+t*1.6,mz);bx(G,.3,2.4,.3,'#d4af37',mx,h+6,mz)}
      else if(s.ruins){for(let i=0;i<4;i++)bx(G,.9,RR(2,5),.9,'#d8ccb4',lx0+1+i*2.4,2,lz1+1.5)}
      else if(s.gate){[-1,1].forEach(o=>{for(let t=0;t<4;t++)bx(G,2.2-t*.4,1.4,2.2-t*.4,t%2?'#6a6258':'#7a7064',mx+o*2.2,.7+t*1.4,lz1+2)})}}
    }});
    /* street dressing around the block */
    for(let x=bx0+4;x<bx1-2;x+=RR(7,10)){const z=bz1+2.3;if(s.palm)D.palm(G,x,z,RR(5,7));else D.tree(G,x,z,undefined,.8)}
    for(let z=bz0+4;z<bz1;z+=RR(9,13))bx(G,.16,4.4,.16,'#2a2a30',bx1+1.2,2.2,z);
    if(lamps||s.picado){for(let i=0;i<7;i++)bx(G,.5,.7,.5,lamps?'#d7262f':pk(['#ff4a6a','#ffd23d','#3ad0ff','#7aff6a']),X1-4+RR(-.4,.4),5.4,Z0+3+i*4.6)}
    if(s.vend&&r()<.5)bx(G,.9,1.8,.7,pk(['#d7262f','#2a6ad7','#e8e8ec']),bx0+RR(3,30),.9,bz1+1.6)}
   D.col(bx0,bz0,bx1,bz1)}/* one solid block per suburb cell, the streets between stay open */
  D.flushTo(G,C.g)}
})();
