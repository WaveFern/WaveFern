/* WaveFern dev garage customisation. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Talk to Tom in the garage: a paint-shop screen lists every car; press one to change its colour and pattern.
   Saved in S.carCust = { carIndex: {c: body colour, p: pattern number, c2: pattern colour} } (same save as everything else).
   Pattern numbers never change once added (old saves keep their look). Owned cars use the look everywhere: parked by the house,
   in the garage room and when you drive. Add ?nogarage to the address to skip it. */
(function(){
 if(!window.FW_DEV)return;
 if(/[?&]nogarage/.test(location.search))return;

 const COLS=[['Sunshine','#e6b422'],['Ocean','#3b82f6'],['Forest','#2f8f5a'],['Racing red','#c0392b'],['Midnight','#22252b'],['Pearl','#e8e8ec'],
  ['Orange','#ff8a30'],['Purple','#8e44ad'],['Hot pink','#ff4fa3'],['Teal','#16b8b0'],['Lime','#9be02a'],['Silver','#9aa0a8'],
  ['Burgundy','#7b1e3a'],['Navy','#1f3a8a'],['Mint','#7fe3b3'],['Sand','#d8c08a'],['Gold','#c9a227'],['Graphite','#4a4f56']];
 const PCOLS=COLS.concat([['White','#f2f2f2'],['Black','#1c1d20']]);
 /* pattern number = position here. Only ever add to the end. */
 const PATS=['Plain','Racing stripes','Side stripe','Two-tone roof','Hood and boot','Checker band','Centre stripe','Double side stripe','Pinstripe',
  'Rocker stripe','Two-tone lower','Chequered roof','Hazard band','Flames','Lightning','Polka dots','Camo','Race roundels','Fade','Chevrons','Zebra','Half and half','Sparkle'];
 const SHOW=[0,1,6,2,7,8,9,10,3,4,11,5,12,13,14,19,20,21,18,15,16,22,17];
 const TOM_HIT='Talk to Tom (mechanic)';
 let dMat=null,pvR=null,pvS=null,pvC=null,pvM=null,pvRaf=0;
 const PW=360,PH=200;

 const cust=i=>{try{const c=S.carCust&&S.carCust[i];return c&&typeof c=='object'?c:null}catch(e){return null}};
 const okHex=h=>typeof h=='string'&&/^#[0-9a-f]{6}$/i.test(h);
 const patOk=p=>Number.isInteger(p)&&p>=0&&p<PATS.length;

 /* ---------- pattern decals: thin shapes laid just over the paint, merged into one mesh ---------- */
 const decalCache={};
 function decalGeo(st,pat,c2){const key=st+'|'+pat+'|'+c2;if(decalCache[key])return decalCache[key];
  const S0=CSPEC[st],{L,W,r,yb,yh,yhf,ytr,fo,ro}=S0,[zr0,zr1,zf1,zf0,yt]=S0.cab,Wc=W*S0.cw,ra=r+.035,parts=[];
  const col2=new THREE.Color(c2),dark=col2.clone().multiplyScalar(.5),mid=col2.clone().multiplyScalar(.75),black=new THREE.Color('#1c1d20'),white=new THREE.Color('#f4f4f4');
  const add=(g,c)=>parts.push([g,c instanceof THREE.Color?c:new THREE.Color(c)]);
  const box=(w,h,d,x,y,z,c,rx)=>{const g=new THREE.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);g.translate(x,y,z);add(g,c||col2)};
  const disc=(rad,x,y,z,c,axis)=>{const g=new THREE.CylinderGeometry(rad,rad,.012,16);if(axis=='x')g.rotateZ(Math.PI/2);g.translate(x,y,z);add(g,c||col2)};
  const edge=c=>(c||col2).clone().multiplyScalar(.45);
  const SX=W/2;                       /* the side of the body */
  /* a bar on both sides from (z0,y0) to (z1,y1), with a dark edge line around it so it reads as a proper livery */
  const bar=(z0,y0,z1,y1,t,c,noEdge)=>{const dz=z1-z0,dy=y1-y0,len=Math.hypot(dz,dy),a=-Math.atan2(dy,dz);
   [-1,1].forEach(s=>{if(!noEdge)box(.012,t+.016,len+.016,s*(SX+.002),(y0+y1)/2,(z0+z1)/2,edge(c),a);box(.012,t,len,s*(SX+.006),(y0+y1)/2,(z0+z1)/2,c,a)})};
  const e=.008,hz0=zf0+.02,hz1=L/2-.1,ha=Math.atan2(yh-yhf,hz1-hz0),hl=Math.hypot(hz1-hz0,yh-yhf);
  /* top panels, each drawn as a dark edge then the colour on top */
  const hood=(w,x,c,noEdge)=>{if(!noEdge)box(w+.016,.012,hl+.016,x,(yh+yhf)/2+e-.004,(hz0+hz1)/2,edge(c),ha);box(w,.012,hl,x,(yh+yhf)/2+e,(hz0+hz1)/2,c,ha)};
  const roof=(w,x,c,noEdge)=>{if(!noEdge)box(w+.016,.012,zf1-zr1+.016,x,yt+e-.004,(zr1+zf1)/2,edge(c));box(w,.012,zf1-zr1,x,yt+e,(zr1+zf1)/2,c)};
  const boot=(w,x,c,noEdge)=>{const l=zr0+L/2-.06,m=(zr0-L/2+.06)/2;if(!noEdge)box(w+.016,.012,l+.016,x,ytr+e-.004,m,edge(c));box(w,.012,l,x,ytr+e,m,c)};
  const skip=(z,y,m)=>Math.hypot(z-fo,y-yb)<ra+m||Math.hypot(z-ro,y-yb)<ra+m;
  /* the belt-line band runs the full length of the car: as far back and as far forward as the body is tall enough */
  const bh=.07,by=Math.max(yh-.06,yb+ra+.014+bh/2),need=by+bh/2+.012;
  const zFront=yhf>=need?L/2-.05:yh>need?zf0+(yh-need)/(yh-yhf)*(hz1-zf0):zf0,zBack=ytr>=need?-L/2+.05:zr0;
  const sz0=ro+ra+.03,sz1=fo-ra-.03;
  let seed=st*97+pat*13+7;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const flat=(w,d,x,z,y,c)=>box(w,.012,d,x,y,z,c);
  /* the lower body in three pieces (rear, between the wheels, front), never over a wheel arch */
  const lowTop=by-bh/2-.012,lowPieces=[[-L/2+.04,ro-ra-.012,Math.min(lowTop,ytr-.05)],[sz0-.015,sz1+.015,lowTop],[fo+ra+.012,L/2-.04,Math.min(lowTop,yhf-.06)]];
  const mix=(a,b,t)=>a.clone().lerp(b,t);

  if(pat==1){[-1,1].forEach(s=>{const x=s*.115;hood(.1,x);roof(.1,x);boot(.1,x)});bar(zBack,by,zFront,by,.03,col2,1)}
  else if(pat==2){bar(zBack,by,zFront,by,bh);bar(zBack,by+bh/2+.02,zFront,by+bh/2+.02,.014,white,1)}
  else if(pat==3){roof(Wc*1.0,0);[-1,1].forEach(s=>{box(.012,Math.max(.04,yt-yh-.05),zf1-zr1+.06,s*(Wc/2+.004),(yh+yt)/2+.01,(zr1+zf1)/2,col2)});box(Wc,.012,.07,0,yt-.04,zr1-.005,col2,.5)}
  else if(pat==4){hood(W*.66,0);boot(W*.66,0);hood(.03,0,white,1);boot(.03,0,white,1)}
  else if(pat==5){const z0=zBack,z1=zFront,n=Math.max(8,Math.round((z1-z0)/.08)),sz=(z1-z0)/n;
   [-1,1].forEach(s=>{for(let k=0;k<n;k++)for(let row=0;row<3;row++)if((k+row)%2==0)box(.012,bh/3,sz,s*(SX+.004),by+(row-1)*bh/3,z0+sz*(k+.5),k%2?black:col2);box(.012,bh+.016,z1-z0+.016,s*(SX+.002),by,(z0+z1)/2,edge(col2))})}
  else if(pat==6){hood(.24,0);roof(.24,0);boot(.24,0);hood(.03,-.07,white,1);hood(.03,.07,white,1);roof(.03,-.07,white,1);roof(.03,.07,white,1);boot(.03,-.07,white,1);boot(.03,.07,white,1)}
  else if(pat==7){bar(zBack,by+.045,zFront,by+.045,.04);bar(zBack,by-.045,zFront,by-.045,.04);bar(zBack,by,zFront,by,.016,white,1)}
  else if(pat==8){[.045,.012,-.025].forEach((o,k)=>bar(zBack,by+o+.02,zFront,by+o+.02,k==1?.022:.012,k==1?white:col2,1));hood(.016,-.14,col2,1);hood(.016,.14,col2,1);boot(.016,-.14,col2,1);boot(.016,.14,col2,1);roof(.016,-.14,col2,1);roof(.016,.14,col2,1)}
  else if(pat==9){bar(sz0-.1,yb+.105,sz1+.1,yb+.105,.07);bar(sz0-.1,yb+.165,sz1+.1,yb+.165,.012,white,1)}
  else if(pat==10){lowPieces.forEach(([a,b,t])=>{if(b-a>.1&&t>yb+.06)bar(a,(t+yb+.02)/2,b,(t+yb+.02)/2,t-yb-.02)})}
  else if(pat==11){const w=.1,nx=Math.max(2,Math.floor(Wc/w)),nz=Math.max(3,Math.floor((zf1-zr1)/w)),sx=Wc/nx,sz=(zf1-zr1)/nz;
   for(let i=0;i<nx;i++)for(let k=0;k<nz;k++)flat(sx,sz,-Wc/2+sx*(i+.5),zr1+sz*(k+.5),yt+e,(i+k)%2?black:white);
   const bl=zr0+L/2-.06,nb=Math.max(2,Math.floor(bl/w)),sb=bl/nb,wb=W*.7/4;
   for(let i=0;i<4;i++)for(let k=0;k<nb;k++)flat(wb,sb,-W*.35+wb*(i+.5),-L/2+.06+sb*(k+.5),ytr+e,(i+k)%2?black:white);
   const hn=Math.max(2,Math.floor(hl/w)),hs=hl/hn,hw=W*.6/4;for(let i=0;i<4;i++)for(let k=0;k<hn;k++)if((i+k)%2==0)box(hw,.012,hs,-W*.3+hw*(i+.5),(yh+yhf)/2+e-(k-hn/2+.5)*0,hz0+hs*(k+.5)+0,col2,0)}
  else if(pat==12){const a=sz0-.1,b=sz1+.1,n=Math.max(6,Math.round((b-a)/.075)),sz=(b-a)/n;[-1,1].forEach(s=>{box(.012,.09,b-a+.016,s*(SX+.002),yb+.115,(a+b)/2,black);for(let k=0;k<n;k++)box(.012,.075,sz*.55,s*(SX+.006),yb+.115,a+sz*(k+.5),k%2?col2:col2,.55)})}
  else if(pat==13){const base=yb+.03,top=yh-.03,H=top-base;
   /* three layers of flame (outer colour, orange, yellow) licking back from the front wheel and up from the sill */
   const L3=[[col2,1,1],[new THREE.Color('#ff8a1c'),.74,.8],[new THREE.Color('#ffe066'),.46,.55]];
   const tongues=[[.0,.72,.14],[.2,1,.17],[.42,.82,.15],[.62,1,.17],[.82,.66,.14]];
   [-1,1].forEach(s=>{const x=s*(SX+.004);
    L3.forEach(([c,hs,ws],li)=>tongues.forEach(([u,hh,w0])=>{const zc=sz1-(sz1-sz0)*u,hgt=H*hh*hs,steps=6;
     for(let q=0;q<steps;q++){const f=q/steps,w=w0*ws*(1-f*.9)*(sz1-sz0)*1.6,h=hgt/steps,off=f*f*.07;box(.012+li*.002,h+.003,w,x,base+h*(q+.5),zc-off-.02,c)}}))})}
  else if(pat==14){const z0=zBack+.06,z1=zFront-.06,n=6,dz=(z1-z0)/n,ya=by+.075,yb2=by-.075;for(let k=0;k<n;k++){const a=z0+dz*k,b=z0+dz*(k+1),y0=k%2?yb2:ya,y1=k%2?ya:yb2;bar(a,y0,b,y1,.06,'#ffd23f'==='x'?col2:col2);bar(a,y0,b,y1,.022,white,1)}}
  else if(pat==15){const dots=(x,y,z,rr,c)=>disc(rr,x,y,z,c,'x');
   for(let z=zBack;z<zFront;z+=.2)for(let y=yb+.1,row=0;y<yh-.02;y+=.12,row++){const zz=z+(row%2?.1:0);if(skip(zz,y,.07)||zz>zFront)continue;[-1,1].forEach(s=>dots(s*(SX+.004),y,zz,.05,(row%2)?white:col2))}
   const pr=[[-.2,0],[0,0],[.2,0],[-.1,1],[.1,1],[-.2,2],[0,2],[.2,2]];pr.forEach(([x,k])=>disc(.055,x*Wc/.8*.8,yt+e,zr1+(zf1-zr1)*(k+.5)/3,col2));
   for(let z=zr0-.0,k=0;k<4;k++)[-.28,-.09,.09,.28].forEach((x,j)=>{if((k+j)%2==0)disc(.055,x*W/.9,ytr+e,-L/2+.14+k*((zr0+L/2-.28)/3),col2)});
   for(let k=0;k<3;k++)[-.24,0,.24].forEach((x,j)=>{if((k+j)%2==0)box(.07,.012,.07,x*W/.9,(yh+yhf)/2+e,hz0+.1+k*.17,col2,ha)})}
  else if(pat==16){const sh=[col2,dark,mid];
   for(let k=0;k<64;k++){const z=zBack+rnd()*(zFront-zBack),y=yb+.04+rnd()*(yh-yb-.04),w=.09+rnd()*.22,h=.05+rnd()*.09;if(skip(z,y,.04))continue;const c=sh[k%3];[-1,1].forEach(s=>box(.012,h,w,s*(SX+.004),y,z,c))}
   for(let k=0;k<26;k++){const c=sh[k%3];box(.1+rnd()*.18,.012,.09+rnd()*.14,(rnd()-.5)*(Wc-.16),yt+e,zr1+rnd()*(zf1-zr1),c);box(.12+rnd()*.2,.012,.08+rnd()*.12,(rnd()-.5)*(W-.2),ytr+e+.001,-L/2+.1+rnd()*(zr0+L/2-.2),c);box(.12+rnd()*.2,.012,.08+rnd()*.12,(rnd()-.5)*(W-.2),(yh+yhf)/2+e+.006,zf0+.1+rnd()*(L/2-.22-zf0),sh[(k+1)%3],ha)}}
  else if(pat==17){const z=(zr1+zf1)/2-.06,y=(yb+yh)/2+.03,rr=Math.min(.17,(yh-yb)/2-.035);
   [-1,1].forEach(s=>{const x=s*(SX+.004);disc(rr,x,y,z,col2,'x');disc(rr*.8,x+s*.003,y,z,black,'x');disc(rr*.62,x+s*.006,y,z,white,'x');box(.012,rr*1.1,.03,x+s*.01,y,z,black);box(.012,.03,rr*.5,x+s*.01,y+rr*.4,z-rr*.12,black,.0)});
   disc(.16,0,yt+e,(zr1+zf1)/2,col2);disc(.13,0,yt+e+.003,(zr1+zf1)/2,black);disc(.1,0,yt+e+.006,(zr1+zf1)/2,white);box(.03,.012,.12,0,yt+e+.01,(zr1+zf1)/2,black);
   hood(.22,0,col2,1);disc(.1,0,(yh+yhf)/2+e+.003,(hz0+hz1)/2,white);bar(zBack,by-.03,zFront,by-.03,.018,col2,1)}
  else if(pat==18){/* fade: the pattern colour is strongest at the sill and fades to dark towards the belt line */
   const steps=7,H=(lowTop+.02)-(yb+.03),h=H/steps;
   [-1,1].forEach(s=>{for(let q=0;q<steps;q++)lowPieces.forEach(([a,b])=>{if(b-a>.1)box(.012,h*1.03,b-a,s*(SX+.004),yb+.03+h*(q+.5),(a+b)/2,col2.clone().multiplyScalar(1-.8*q/steps))})});
   boot(W*.8,0,col2.clone().multiplyScalar(.75),1);hood(W*.8,0,col2.clone().multiplyScalar(.75),1)}
  else if(pat==19){/* chevrons down the sides, pointing at the front */
   const n=6,z0=zBack+.1,z1=zFront-.1,dz=(z1-z0)/n;for(let k=0;k<n;k++){const zc=z0+dz*(k+.5);bar(zc-dz*.35,by-.06,zc+dz*.15,by,.05,col2,1);bar(zc-dz*.35,by+.06,zc+dz*.15,by,.05,col2,1)}
   hood(.03,0,col2,1)}
  else if(pat==20){/* zebra: slanted bars over the sides, roof and boot */
   const n=Math.max(8,Math.round((zFront-zBack)/.11)),dz=(zFront-zBack)/n;for(let k=0;k<n;k++){const zc=zBack+dz*(k+.5);if(k%2)continue;[-1,1].forEach(s=>{if(!skip(zc,yb+.1,.0)||true){const y0=yb+.06,y1=yh-.02;box(.012,y1-y0,dz*.7,s*(SX+.004),(y0+y1)/2,zc,col2,0)}})}
   for(let k=0;k<5;k++)flat(Wc*.98,.06,0,zr1+(zf1-zr1)*(k+.5)/5,yt+e,k%2?col2:col2);for(let k=0;k<5;k++)if(k%2==0)flat(W*.9,.06,0,-L/2+.1+k*((zr0+L/2-.2)/4),ytr+e,col2)}
  else if(pat==21){/* half and half: the whole right side, half the bonnet, roof and boot */
   box(.012,yh-yb-.03,zFront-zBack,SX+.004,(yb+yh)/2,(zFront+zBack)/2,col2);
   hood(W*.5,W*.25,col2,1);roof(Wc*.5,Wc*.25,col2,1);boot(W*.5,W*.25,col2,1);box(.012,yt-yh-.03,zf1-zr1+.05,Wc/2+.004,(yh+yt)/2,(zr1+zf1)/2,col2);
   bar(zBack,by,zFront,by,.016,white,1)}
  else if(pat==22){/* stars and sparkles scattered over the whole car */
   const spark=(x,y,z,s,f)=>{if(f=='side')[-1,1].forEach(q=>{box(.012,s*2.2,s*.7,q*(SX+.004),y,z,col2);box(.012,s*.7,s*2.2,q*(SX+.004),y,z,col2);box(.013,s*.9,s*.9,q*(SX+.005),y,z,white)});else{box(s*.7,.012,s*2.2,x,y,z,col2);box(s*2.2,.012,s*.7,x,y,z,col2);box(s*.9,.013,s*.9,x,y+.001,z,white)}};
   for(let k=0;k<26;k++){const z=zBack+rnd()*(zFront-zBack),y=yb+.08+rnd()*(yh-yb-.1);if(skip(z,y,.06))continue;spark(0,y,z,.022+rnd()*.022,'side')}
   for(let k=0;k<7;k++)spark((rnd()-.5)*(Wc-.2),yt+e,zr1+rnd()*(zf1-zr1),.022+rnd()*.02);for(let k=0;k<7;k++)spark((rnd()-.5)*(W-.25),ytr+e,-L/2+.1+rnd()*(zr0+L/2-.2),.022+rnd()*.02)}

  let n=0;parts.forEach(p=>{p[0]=p[0].toNonIndexed();n+=p[0].attributes.position.count});
  const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
  parts.forEach(([g,c])=>{const cnt=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);for(let q=0;q<cnt;q++){const j=(o+q)*3;C[j]=c.r;C[j+1]=c.g;C[j+2]=c.b}o+=cnt;g.dispose()});
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('color',new THREE.BufferAttribute(C,3));
  geo.computeBoundingBox();geo.computeBoundingSphere();return decalCache[key]=geo}
 function decalMat(){return dMat||(dMat=new THREE.MeshPhongMaterial({vertexColors:true,shininess:70,specular:0x5a5a5a,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))}

 /* a car model list for car i with a given look (the same contract as carList in 39-car-models.js, plus one pattern mesh) */
 const carList0=carList;
 /* the Phantom GT has gold stripes built into its model: recolour them to the body so a chosen look replaces them */
 const cleanCache={};
 function cleanGeo(st,col){if(st!=4)return carGeo(st,col);const k=st+col;if(cleanCache[k])return cleanCache[k];const g=carGeo(st,col).clone(),c=g.attributes.color,ca=c.array.slice(),b=new THREE.Color(col),gold=new THREE.Color('#e6b422');
  for(let q=0;q<ca.length;q+=3)if(Math.abs(ca[q]-gold.r)<.01&&Math.abs(ca[q+1]-gold.g)<.01&&Math.abs(ca[q+2]-gold.b)<.01){ca[q]=b.r;ca[q+1]=b.g;ca[q+2]=b.b}
  g.setAttribute('color',new THREE.BufferAttribute(ca,3));return cleanCache[k]=g}
 function looked(i,cu){const col=cu&&okHex(cu.c)?cu.c:CARS[i].c,a=carList0(i,col,1),pat=cu&&patOk(cu.p)&&cu.p>0?cu.p:0;
  const c2=okHex(cu&&cu.c2)?cu.c2:'#f2f2f2';
  a.forEach=function(cb){const m0=cb([1,1,1,'#fff',0,0,0]);if(m0&&m0.isMesh){m0.geometry=cleanGeo(i,col);m0.material=carMats();m0.scale.set(1,1,1)}
   if(pat){const m=cb([1,1,1,'#fff',0,0,0]);if(m&&m.isMesh){m.geometry=decalGeo(i,pat,c2);m.material=decalMat();m.scale.set(1,1,1)}}};return a}
 /* your own cars (no traffic colour given) wear their saved look everywhere; traffic and shop cars are untouched */
 carList=function(i,cc,fixed){if(cc===undefined&&CARS[i]&&cust(i))return looked(i,cust(i));return carList0(i,cc,fixed)};

 function refreshCars(i){try{delete PVM['c:'+i]}catch(e){}try{parkCars()}catch(e){}}
 function setLook(i,k,v){S.carCust=S.carCust&&typeof S.carCust=='object'?S.carCust:{};const c=Object.assign({c:CARS[i].c,p:0,c2:'#f2f2f2'},S.carCust[i]||{});c[k]=v;S.carCust[i]=c;try{updateVersion()}catch(e){}refreshCars(i)}
 function resetLook(i){if(S.carCust)delete S.carCust[i];try{updateVersion()}catch(e){}refreshCars(i)}

 /* ---------- 3D paint booth preview (its own small renderer, so the game scene is never touched) ---------- */
 function pvInit(){if(pvR)return true;try{
  pvR=new THREE.WebGLRenderer({antialias:true,alpha:true});pvR.setPixelRatio(Math.min(2,window.devicePixelRatio||1));pvR.setSize(PW,PH);
  pvR.domElement.id='gcv';pvS=new THREE.Scene();
  pvS.add(new THREE.AmbientLight(0xfff4e0,.8));const d=new THREE.DirectionalLight(0xffffff,.85);d.position.set(3,5,4);pvS.add(d);
  const plate=new THREE.Mesh(new THREE.CylinderGeometry(1.95,2.05,.06,28),new THREE.MeshLambertMaterial({color:0x4a4f58}));plate.position.y=-.03;pvS.add(plate);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.03,6,40),new THREE.MeshBasicMaterial({color:0xf2b705}));ring.rotation.x=Math.PI/2;ring.position.y=.01;pvS.add(ring);
  pvC=new THREE.PerspectiveCamera(33,PW/PH,.1,50);pvC.position.set(0,2.1,4.6);pvC.lookAt(0,.55,0);return true}catch(e){pvR=null;return false}}
 function pvShow(i,cu){if(!pvInit())return;if(pvM)pvS.remove(pvM);pvM=mkS(looked(i,cu));pvM.scale.setScalar(1.6);pvM.rotation.y=pvM._ry=.6;pvS.add(pvM);
  const slot=document.getElementById('gcvs');if(slot&&pvR.domElement.parentNode!==slot)slot.appendChild(pvR.domElement);
  cancelAnimationFrame(pvRaf);const tick=()=>{if(!document.getElementById('gcv')||!pvM)return;if(!pvM._hold)pvM.rotation.y+=.01;pvR.render(pvS,pvC);pvRaf=requestAnimationFrame(tick)};tick()}
 function pvStop(){cancelAnimationFrame(pvRaf);if(pvM&&pvS)pvS.remove(pvM);pvM=null;try{if(pvR&&pvR.domElement.parentNode)pvR.domElement.parentNode.removeChild(pvR.domElement)}catch(e){}}
 /* a still picture of a car in its current paint for the list (cached) */
 const thumbs={};
 function thumb(i){const cu=cust(i),k=i+JSON.stringify(cu||0);if(thumbs[k])return thumbs[k];if(!pvInit())return'';
  try{const hold=pvM;if(hold)pvS.remove(hold);const m=mkS(looked(i,cu));m.scale.setScalar(1.5);m.rotation.y=.7;pvS.add(m);pvR.render(pvS,pvC);const u=pvR.domElement.toDataURL('image/png');pvS.remove(m);if(hold)pvS.add(hold);return thumbs[k]=u}catch(e){return''}}

 /* ---------- look: a paint shop on a garage floor (only inside #gar) ---------- */
 function css(){if(document.getElementById('gcss'))return;const s=document.createElement('style');s.id='gcss';s.textContent=`
#ui .gar{--ink:#1a1b1e;--steel:#3b4048;--steel2:#2c3036;--hz:#f2b705;--or:#ff7a1a;--tx:#e9e6df;--mu:#a7a39a;
 background:#2c3036;color:var(--tx);border:4px solid var(--ink);border-radius:4px;box-shadow:0 0 0 3px var(--hz),0 10px 30px #000a;padding:0 0 16px;width:min(720px,94vw);max-height:94vh;overflow:auto;font-family:ui-monospace,Menlo,Consolas,monospace}
#ui .gar .gh{background:repeating-linear-gradient(-45deg,var(--hz) 0 14px,var(--ink) 14px 28px);height:14px}
#ui .gar .gs{margin:-1px 14px 0;background:var(--hz);color:var(--ink);padding:8px 14px 7px;text-align:center;border:3px solid var(--ink);border-top:0;font:700 20px Silkscreen,ui-monospace,monospace;letter-spacing:1px;position:relative;text-transform:uppercase}
#ui .gar .gs small{display:block;font:700 10px ui-monospace,monospace;letter-spacing:2px;margin-top:2px}
#ui .gar .gs:before,#ui .gar .gs:after{content:"";position:absolute;top:7px;width:7px;height:7px;border-radius:50%;background:#7a5d00;box-shadow:inset 1px 1px #ffe27a}
#ui .gar .gs:before{left:6px}#ui .gar .gs:after{right:6px}
#ui .gar .gm{margin:10px 16px 0;color:var(--mu);font-size:13px;font-style:italic}
#ui .gar .gm b{color:var(--hz);font-style:normal}
#ui .gar .gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:12px 16px 0}
#ui .gar .gc{background:var(--steel);border:3px solid var(--ink);border-radius:3px;padding:8px;box-shadow:3px 3px 0 #0008;position:relative}
#ui .gar .gc.lk{opacity:.55;filter:grayscale(.8)}
#ui .gar .gc img,#ui .gar .gc .gi{display:block;width:100%;aspect-ratio:${PW}/${PH};background:#23262b;border:2px solid var(--ink);border-radius:2px;object-fit:cover}
#ui .gar .gc .gi{display:flex;align-items:center;justify-content:center;color:var(--mu);font-size:12px}
#ui .gar .gc h3{margin:8px 0 2px;font:700 14px Silkscreen,ui-monospace,monospace;color:var(--tx);letter-spacing:.5px}
#ui .gar .gc p{margin:0 0 8px;color:var(--mu);font-size:12px;display:flex;align-items:center;gap:6px}
#ui .gar .gc .dot{width:12px;height:12px;border-radius:50%;border:2px solid var(--ink);flex:none}
#ui .gar .gc .tag{position:absolute;top:12px;left:12px;background:var(--ink);color:var(--hz);font:700 10px Silkscreen,monospace;padding:2px 6px;letter-spacing:1px}
#ui .gar button{font-family:Silkscreen,ui-monospace,monospace;text-transform:uppercase;letter-spacing:.5px;font-size:12px;background:#555b64;color:var(--tx);border:3px solid var(--ink);border-radius:3px;padding:8px 12px;cursor:pointer;box-shadow:inset 0 -3px #0006,2px 2px 0 #0008}
#ui .gar button:hover:not(:disabled){background:#6a7079}
#ui .gar button.go{background:var(--or);color:var(--ink)}#ui .gar button.go:hover:not(:disabled){background:#ff9640}
#ui .gar button:disabled{opacity:.5;cursor:default}
#ui .gar .gc button{width:100%}
#ui .gar .gf{display:flex;gap:10px;justify-content:space-between;margin:14px 0 0;padding:10px 16px 0;position:sticky;bottom:-16px;background:#2c3036;border-top:3px solid var(--ink)}
#ui .gar .gp{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:14px;margin:12px 16px 0}
@media(max-width:620px){#ui .gar .gp{grid-template-columns:1fr}}
#ui .gar #gcvs{background:#23262b;border:3px solid var(--ink);border-radius:3px;padding:4px;box-shadow:inset 0 0 0 2px #4b515a;align-self:start;position:sticky;top:0}
#ui .gar #gcv{display:block;width:100%;height:auto}
#ui .gar .gcar{margin:6px 2px 2px;display:flex;justify-content:space-between;color:var(--mu);font-size:11px;text-transform:uppercase;letter-spacing:1px}
#ui .gar .gcar b{color:var(--hz)}
#ui .gar .gk{background:var(--steel);border:3px solid var(--ink);border-radius:3px;padding:8px 10px 10px;margin-bottom:10px;box-shadow:3px 3px 0 #0008}
#ui .gar .gk h4{margin:0 0 6px;font:700 11px Silkscreen,monospace;color:var(--hz);letter-spacing:1.5px;text-transform:uppercase;display:flex;justify-content:space-between}
#ui .gar .gk h4 span{color:var(--tx);letter-spacing:.5px;text-transform:none;font:700 11px ui-monospace,monospace}
#ui .gar .gw{display:grid;grid-template-columns:repeat(auto-fill,minmax(34px,1fr));gap:6px}
#ui .gar .gw button{width:100%;aspect-ratio:1;padding:0;border-radius:50%;border:3px solid var(--ink);box-shadow:inset 0 3px 0 #fff5,inset 0 -4px 0 #0005,2px 2px 0 #0008}
#ui .gar .gw button.on{outline:3px solid var(--hz);outline-offset:1px}
#ui .gar .gt{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
#ui .gar .gt button{padding:4px 2px 3px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:9px;letter-spacing:0;line-height:1.1;text-align:center;min-height:0}
#ui .gar .gt button svg{display:block;width:100%;height:auto;background:#23262b;border-radius:2px}
#ui .gar .gt button.on{background:var(--hz);color:var(--ink);outline:0}
`;document.head.appendChild(s)}

 /* ---------- small side-view icons for the patterns ---------- */
 function icon(k,body,c){const q=`fill="${c}"`,d=`fill="#1c1d20"`,G=(x,y,w,h,f)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" ${f||q}/>`;let p='';
  if(k==1)p=G(30,8,4,5)+G(24,6,16,3,'fill="none"')+G(9,13,40,3)+G(9,16,0,0);
  if(k==1)p=G(26,6,10,3)+G(8,11,44,3)+'';
  if(k==2)p=G(6,19,48,4);
  if(k==3)p=`<path d="M22 8h18l4 6H18z" ${q}/>`;
  if(k==4)p=G(8,12,12,3)+G(44,12,10,3)+G(8,19,0,0);
  if(k==5)for(let i=0;i<12;i++)p+=G(7+i*4,18+((i%2)*3),4,3);
  if(k==6)p=G(8,11,44,3)+G(26,7,12,3);
  if(k==7)p=G(6,17,48,2)+G(6,21,48,2);
  if(k==8)p=G(6,17,48,1)+G(6,20,48,1);
  if(k==9)p=G(18,26,28,3);
  if(k==10)p=G(18,17,28,12);
  if(k==11)for(let i=0;i<6;i++)p+=G(22+i*3.2,9+((i%2)*3),3.2,3)+G(22+i*3.2,12-((i%2)*3),0,0);
  if(k==12)for(let i=0;i<7;i++)p+=G(18+i*4,26,4,3,i%2?d:q);
  if(k==13)p=`<path d="M20 29l3-10 3 4 3-9 3 8 3-4 3 11z" ${q}/>`;
  if(k==14)p=`<path d="M8 22l8-5 6 6 8-6 6 6 8-5 6 4" fill="none" stroke="${c}" stroke-width="2.5"/>`;
  if(k==15)for(let i=0;i<8;i++)p+=`<circle cx="${10+i*6}" cy="${19+((i%2)*5)}" r="1.8" ${q}/>`;
  if(k==16)p=G(10,17,8,4)+G(22,21,9,3)+G(36,16,8,5)+G(46,22,7,3)+G(26,10,8,3)+G(14,23,5,3);
  if(k==17)p=`<circle cx="32" cy="22" r="6" ${q}/><circle cx="32" cy="22" r="3.6" ${d}/><circle cx="32" cy="22" r="1.6" ${q}/>`;
  if(k==18)for(let i=0;i<5;i++)p+=`<rect x="14" y="${29-i*2.4}" width="36" height="2.4" fill="${c}" opacity="${1-i*.18}"/>`;
  if(k==19)for(let i=0;i<5;i++)p+=`<path d="M${14+i*8} 17l5 4-5 4" fill="none" stroke="${c}" stroke-width="2"/>`;
  if(k==20)for(let i=0;i<7;i++)p+=`<path d="M${12+i*6} 26l3-9" stroke="${c}" stroke-width="2.4"/>`;
  if(k==21)p=`<path d="M5 27V21l8-3 6-9h11v18z" fill="${c}"/>`;
  if(k==22)for(let i=0;i<6;i++)p+=`<path d="M${12+i*8} ${18+(i%2)*5}l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="${c}"/>`;
  return`<svg viewBox="0 0 64 36" aria-hidden="true"><path d="M5 27V21l8-3 6-9h22l8 9 10 3v6z" fill="${body}" stroke="#0008" stroke-width="1"/><path d="M21 11h20l5 7H17z" fill="#8fb8cf"/>${p}<circle cx="17" cy="28" r="5" fill="#1b1b1d"/><circle cx="47" cy="28" r="5" fill="#1b1b1d"/><circle cx="17" cy="28" r="2" fill="#c9ced6"/><circle cx="47" cy="28" r="2" fill="#c9ced6"/></svg>`}

 /* ---------- screens ---------- */
 const head=`<div class=gh></div><div class=gs>Tom's Garage<small>Custom paint shop</small></div>`;
 const chip=(c,on,fn,t)=>`<button type=button class="${on?'on':''}" title="${t}" aria-label="${t}" aria-pressed="${on?'true':'false'}" onclick="${fn}" style="background:${c}"></button>`;
 function listUI(){css();pvStop();const own=(S.cars||[]);
  $('ui').innerHTML=`<div class="box modal gar" id="gar">${head}
   <p class=gm><b>Tom:</b> "Pick a car and I will give it a fresh coat."</p>
   ${own.length?'':'<p class=gm>You do not own a car yet. Book one on the Cars website on your PC.</p>'}
   <div class=gl>${CARS.map((c,i)=>{const o=own.includes(i),cu=cust(i),img=o?thumb(i):'';return`<div class="gc ${o?'':'lk'}">${o?`<span class=tag>BAY ${i+1}</span>`:''}
     ${img?`<img src="${img}" alt="${c.n}">`:`<div class=gi>${o?'':'NOT OWNED'}</div>`}
     <h3>${c.n}</h3><p><span class=dot style="background:${o&&cu&&okHex(cu.c)?cu.c:c.c}"></span>${o?(cu&&patOk(cu.p)&&cu.p?PATS[cu.p]:cu?'Custom paint':'Stock paint'):'Not owned'}</p>
     <button class=go ${o?'':'disabled'} onclick="gcOpen(${i})">${o?'Customise':'Locked'}</button></div>`}).join('')}</div>
   <div class=gf><button onclick="closeUI()">Leave garage</button></div></div>`}
 function carUI(i){css();const cu=Object.assign({c:CARS[i].c,p:0,c2:'#f2f2f2'},cust(i)||{}),cn=n=>(COLS.concat(PCOLS).find(x=>x[1]==n)||[n,n])[0],pn=patOk(cu.p)?cu.p:0;
  $('ui').innerHTML=`<div class="box modal gar" id="gar">${head}
   <div class=gp><div><div id=gcvs></div><div class=gcar><span>${CARS[i].n}</span><b>Bay ${i+1}</b></div></div>
   <div>
    <div class=gk><h4>Paint colour <span>${cn(cu.c)}</span></h4><div class=gw>${COLS.map(x=>chip(x[1],x[1]==cu.c,`gcSet(${i},'c','${x[1]}')`,x[0])).join('')}</div></div>
    <div class=gk><h4>Pattern <span>${PATS[pn]}</span></h4><div class=gt>${SHOW.map(k=>`<button type=button class="${k==pn?'on':''}" aria-pressed="${k==pn?'true':'false'}" onclick="gcSet(${i},'p',${k})">${icon(k,cu.c,k==pn?'#1a1b1e':cu.c2)}${PATS[k]}</button>`).join('')}</div></div>
    ${pn>0?`<div class=gk><h4>Pattern colour <span>${cn(cu.c2)}</span></h4><div class=gw>${PCOLS.map(x=>chip(x[1],x[1]==cu.c2,`gcSet(${i},'c2','${x[1]}')`,x[0])).join('')}</div></div>`:''}
   </div></div>
   <div class=gf><button onclick="gcReset(${i})">Stock paint</button><button class=go onclick="gcList()">Done</button></div></div>`;
  pvShow(i,cu)}
 window.gcOpen=i=>{if(!(S.cars||[]).includes(i))return snd('err');snd('ping');carUI(i)};
 window.gcList=()=>{snd('ping');listUI()};
 window.gcSet=(i,k,v)=>{if(!(S.cars||[]).includes(i))return;if((k=='c'||k=='c2')&&!okHex(v))return;if(k=='p'&&!patOk(v))return;setLook(i,k,v);snd('ping');carUI(i)};
 window.gcReset=i=>{resetLook(i);snd('ping');carUI(i)};
 window.openCarGarage=()=>{mode='menu';listUI()};

 /* leaving by any route (Leave, Escape, walking off) always clears the preview */
 {const c0=closeUI;closeUI=function(){pvStop();return c0.apply(this,arguments)}}

 /* ---------- Tom opens it ---------- */
 function hook(){try{const t=INT.find(o=>o.l==TOM_HIT);if(!t)return false;if(t.gc)return true;t.gc=1;t.a=()=>{snd('ping');window.openCarGarage()};return true}catch(e){return false}}
 let n=0;const iv=setInterval(()=>{hook();if(++n>600)clearInterval(iv)},500);
})();
