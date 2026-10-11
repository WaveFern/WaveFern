/* ===== v26.30.0: better building interiors =====
   The shop rooms (jewellery, property office, corner shop, City Cafe, Music Store, Radio Station, garage) are rebuilt
   with proper floors (planks, tiles, marble, carpet, concrete), textured walls (wallpaper, brick, panels, foam, blocks)
   with skirting, dado rails and cornices, lamps that light the room, furniture and props that fit each place, and a
   sign on the wall. Every room keeps its size, its keeper, its "Talk to" and "Leave" spots and its door, and the boxes
   are merged into a couple of meshes per room so the game stays fast. The tower floors (Skyline Tower, Pulse Records
   HQ, Aurora Residences, Nova Mall) get cornices, floor plaques next to the elevator and warmer light. */

/* ---- merged boxes: [w,h,d,colour,x,y,z]; only the faces the camera can see (+x, +y, +z) ---- */
const IXF=[[[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],[[0,1,0],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]],[[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]]];
function ixGeo(L){const N=L.length,P=new Float32Array(N*36),Nr=new Float32Array(N*36),C=new Float32Array(N*36),I=new Uint32Array(N*18),cc=new THREE.Color();let v=0,ii=0;
 L.forEach(b=>{cc.set(b[3]);IXF.forEach(f=>{const b0=v/3;f[1].forEach(q=>{P[v]=b[4]+q[0]*b[0]/2;P[v+1]=b[5]+q[1]*b[1]/2;P[v+2]=b[6]+q[2]*b[2]/2;Nr[v]=f[0][0];Nr[v+1]=f[0][1];Nr[v+2]=f[0][2];C[v]=cc.r;C[v+1]=cc.g;C[v+2]=cc.b;v+=3});I.set([b0,b0+1,b0+2,b0,b0+2,b0+3],ii);ii+=6})});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(Nr,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.setIndex(new THREE.BufferAttribute(I,1));g.computeBoundingSphere();return g}
const IXM={l:null,b:null};
const ixMat=e=>e?(IXM.b||(IXM.b=new THREE.MeshBasicMaterial({vertexColors:true}))):(IXM.l||(IXM.l=new THREE.MeshLambertMaterial({vertexColors:true})));

/* ---- pixel textures: one 64 px tile = 2 m of floor or 1 m of wall ---- */
function ixShade(c,f){const k=new THREE.Color(c).multiplyScalar(f);return'#'+k.getHexString()}
function ixTex(kind,a,b,rx,ry){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),r=mb(hs(kind+a+b)),F=(c,X,Y,W,H)=>{x.fillStyle=c;x.fillRect(X,Y,W,H)};F(a,0,0,64,64);
 if(kind=='plank'){for(let row=0;row<4;row++){const y=row*16;let s=-(row*23%40);while(s<64){const L=24+Math.floor(r()*24),c=r()<.5?a:ixShade(a,.9+r()*.16);F(c,s,y,L,16);for(let k=0;k<3;k++)F(ixShade(c,.86),s+2+Math.floor(r()*(L-6)),y+3+Math.floor(r()*10),4+Math.floor(r()*6),1);F(b,s,y,1,16);s+=L}F(b,0,y+15,64,1)}}
 else if(kind=='tile'){for(let i=0;i<2;i++)for(let j=0;j<2;j++)F((i+j)%2?a:b,i*32,j*32,32,32);x.globalAlpha=.25;for(let k=0;k<20;k++)F('#fff',Math.floor(r()*64),Math.floor(r()*64),1,1);x.globalAlpha=1;F(ixShade(b,.8),0,0,64,1);F(ixShade(b,.8),0,32,64,1);F(ixShade(b,.8),0,0,1,64);F(ixShade(b,.8),32,0,1,64)}
 else if(kind=='marble'){for(let i=0;i<2;i++)for(let j=0;j<2;j++)F((i+j)%2?a:b,i*32,j*32,32,32);x.globalAlpha=.35;for(let k=0;k<6;k++){let X=Math.floor(r()*64),Y=Math.floor(r()*64);for(let s=0;s<14;s++){F('#ffffff',X&63,Y&63,1,1);X+=r()<.5?1:0;Y+=1}}x.globalAlpha=1;F('#c9a227',0,0,64,1);F('#c9a227',0,0,1,64);F(ixShade(b,.7),0,32,64,1);F(ixShade(b,.7),32,0,1,64)}
 else if(kind=='carpet'){for(let k=0;k<260;k++)F(r()<.5?b:ixShade(a,1.12),Math.floor(r()*64),Math.floor(r()*64),1,1)}
 else if(kind=='concrete'){for(let k=0;k<200;k++)F(r()<.5?b:ixShade(a,1.1),Math.floor(r()*64),Math.floor(r()*64),1+Math.floor(r()*2),1);F(ixShade(b,.8),0,0,64,1);F(ixShade(b,.8),0,0,1,64)}
 else if(kind=='brick'){for(let row=0;row<8;row++){const o=row%2?8:0;for(let s=-o;s<64;s+=16){F(r()<.3?ixShade(a,.88+r()*.2):a,s+1,row*8+1,15,7)}}x.globalAlpha=1;for(let row=0;row<=8;row++)F(b,0,row*8,64,1);for(let row=0;row<8;row++)for(let s=(row%2?8:0);s<64;s+=16)F(b,s,row*8,1,8)}
 else if(kind=='stripe'){for(let s=0;s<64;s+=16){F(b,s,0,6,64);F(ixShade(b,1.15),s+7,0,1,64)}}
 else if(kind=='panel'){for(let s=0;s<64;s+=32){F(b,s,0,2,64);F(ixShade(a,1.08),s+2,0,1,64)}F(b,0,0,64,2)}
 else if(kind=='foam'){for(let i=0;i<4;i++)for(let j=0;j<4;j++){const X=i*16,Y=j*16;F(ixShade(a,1.18),X,Y,16,8);F(b,X,Y+8,16,8);F(ixShade(a,.8),X,Y+15,16,1);F(ixShade(a,.8),X+15,Y,1,16)}}
 else if(kind=='block'){for(let row=0;row<4;row++){const o=row%2?16:0;for(let s=-o;s<64;s+=32)F(r()<.3?ixShade(a,.94):a,s+1,row*16+1,31,15)}for(let row=0;row<=4;row++)F(b,0,row*16,64,1);for(let row=0;row<4;row++)for(let s=(row%2?16:0);s<64;s+=32)F(b,s,row*16,1,16)}
 else if(kind=='plaster'){for(let k=0;k<120;k++)F(r()<.5?b:ixShade(a,1.05),Math.floor(r()*64),Math.floor(r()*64),2,1)}
 const t=new THREE.CanvasTexture(cv);t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return new THREE.MeshLambertMaterial({map:t})}

/* ---- wall signs (canvas text, smooth so they stay readable at the game's low resolution) ---- */
function ixSign(t,fg,bg,w,h,o){o=o||{};const cv=document.createElement('canvas');cv.width=512;cv.height=Math.max(32,Math.pow(2,Math.round(Math.log2(512*h/w))));const x=cv.getContext('2d'),H=cv.height;
 x.fillStyle=bg;x.fillRect(0,0,512,H);if(o.border){x.strokeStyle=o.border;x.lineWidth=Math.max(4,H*.08);x.strokeRect(x.lineWidth/2,x.lineWidth/2,512-x.lineWidth,H-x.lineWidth)}
 let fs=Math.floor(H*(o.k||.62));x.font=(o.f||'bold ')+fs+'px '+(o.ff||'"Trebuchet MS",Verdana,sans-serif');while(x.measureText(t).width>470&&fs>8){fs--;x.font=(o.f||'bold ')+fs+'px '+(o.ff||'"Trebuchet MS",Verdana,sans-serif')}
 x.textAlign='center';x.textBaseline='middle';if(o.glow){x.shadowColor=o.glow;x.shadowBlur=H*.2}x.lineWidth=Math.max(3,fs*.12);x.strokeStyle=o.stroke||'rgba(0,0,0,.55)';x.strokeText(t,256,H/2+fs*.04);x.fillStyle=fg;x.fillText(t,256,H/2+fs*.04);
 const tx=new THREE.CanvasTexture(cv);tx.minFilter=THREE.LinearMipmapLinearFilter;tx.magFilter=THREE.LinearFilter;tx.anisotropy=4;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx}))}

/* ---- one shop room: 10 x 8 at (ox, 320), back wall at z=320, left wall at x=ox, door in the front middle ---- */
const IXL=[];/* [group of lights, shop index] */
function ixRoom(i,o){const s=SHOPS[i],g=IG[i];if(!s||!g)return;const ox=s.ox;
 const keep=new Set(i==6&&typeof GCM!='undefined'?GCM:[]);g.children.slice().forEach(c=>{if(!keep.has(c))g.remove(c)});
 for(let j=wc.length-1;j>=0;j--){const c=wc[j];if(c[0]>=ox-.6&&c[2]<=ox+10.6&&c[1]>=319.4&&c[3]<=328.6)wc.splice(j,1)}
 const L=[],E=[],b=(w,h,d,c,x,y,z)=>(c[0]=='*'?E:L).push([w,h,d,c[0]=='*'?'#'+c.slice(1):c,ox+x,y,320+z]),cl=(x0,z0,x1,z1)=>wc.push([ox+x0,320+z0,ox+x1,320+z1]);
 const add=(m,x,y,z,ry)=>{m.position.set(ox+x,y,320+z);if(ry)m.rotation.y=ry;g.add(m);return m};
 /* floor, walls (textured), skirting, dado rail, cornice, low front walls with caps, door mat and frame */
 add(new THREE.Mesh(geo(10,.2,8),ixTex(o.fl[0],o.fl[1],o.fl[2],5,4)),5,-.1,4);
 const wm=ixTex(o.wl[0],o.wl[1],o.wl[2],10,3),wm2=ixTex(o.wl[0],o.wl[1],o.wl[2],8,3);add(new THREE.Mesh(geo(10,3,.3),wm),5,1.5,-.15);add(new THREE.Mesh(geo(.3,3,8),wm2),-.15,1.5,4);
 const tr=o.tr,wa=o.wa;
 if(wa){b(10,1,.04,wa,5,.5,.02);b(.04,1,8,wa,.02,.5,4)}
 b(10,.16,.07,tr,5,.08,.035);b(.07,.16,8,tr,.035,.08,4);b(10,.06,.08,tr,5,wa?1.02:1,.04);b(.08,.06,8,tr,.04,wa?1.02:1,4);b(10.3,.14,.4,tr,4.85,3.04,-.1);b(.4,.14,8.3,tr,-.1,3.04,3.85);
 const fw=o.fw||'#555b63';[[2,4],[8,4]].forEach(q=>{b(q[1],.45,.2,fw,q[0],.225,8);b(q[1]+.04,.06,.26,tr,q[0],.48,8)});b(.2,.45,8,fw,10,.225,4);b(.26,.06,8.04,tr,10,.48,4);
 b(2,.03,.8,o.mat||'#7a3a2a',5,.015,7.6);b(1.6,.012,.5,ixShade(o.mat||'#7a3a2a',1.3),5,.03,7.6);[4,6].forEach(x=>{b(.14,.6,.26,tr,x,.3,8);b(.18,.08,.3,ixShade(tr,1.2),x,.62,8)});
 /* sign */
 if(o.sign){const[t,fg,bg,w,h,y,x,op]=o.sign;add(ixSign(t,fg,bg,w,h,op),x||5,y||2.55,.025);b(w+.12,h+.12,.03,ixShade(bg,.6),x||5,y||2.55,.005)}
 /* lights: warm point lights that only shine while you are in this room, plus a fill light */
 const lg=new THREE.Group();(o.lights||[[2.5,4.5],[7.5,4.5]]).forEach(p=>{const pl=new THREE.PointLight(o.lc||0xffe2b8,(p[2]||.75)*1.35,14,1);pl.position.set(ox+p[0],2.7,320+p[1]);lg.add(pl)});lg.visible=false;g.add(lg);IXL.push([lg,i]);
 o.build(b,cl,add,ox);
 g.add(new THREE.Mesh(ixGeo(L),ixMat(0)));if(E.length)g.add(new THREE.Mesh(ixGeo(E),ixMat(1)))}

/* ---- props used by several rooms ---- */
const ixPlant=(b,cl,x,z,s=1,pot='#8a5a36')=>{b(.5*s,.45*s,.5*s,pot,x,.225*s,z);b(.54*s,.06*s,.54*s,ixShade(pot,.8),x,.45*s,z);b(.7*s,.5*s,.7*s,'#2e8b57',x,.75*s,z);b(.5*s,.45*s,.5*s,'#3fa66a',x+.06*s,1.15*s,z-.04*s);b(.3*s,.3*s,.3*s,'#56c07e',x-.05*s,1.45*s,z+.05*s);cl(x-.3*s,z-.3*s,x+.3*s,z+.3*s)};
const ixChair=(b,x,z,c,f)=>{b(.46,.08,.46,c,x,.46,z);b(.46,.5,.07,ixShade(c,.85),x,.76,z+(f?.2:-.2));[[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]].forEach(q=>b(.05,.42,.05,'#2a2a2a',x+q[0],.21,z+q[1]))};
/* a framed picture: on the left wall (side, facing +x) or the back wall; cols = vertical colour bands of the picture */
const ixFrame=(b,x,y,z,w,h,fc,cols,side)=>{const n=cols.length,cw=(w-.16)/n;if(side){b(.05,h,w,fc,x,y,z);cols.forEach((c,k)=>b(.02,h-.16,cw,c,x+.035,y,z-w/2+.08+cw*(k+.5)))}
 else{b(w,h,.05,fc,x,y,z);cols.forEach((c,k)=>b(cw,h-.16,.02,c,x-w/2+.08+cw*(k+.5),y,z+.035))}};
const ixLampW=(b,x,y,z,c='*ffe2a8',side)=>{if(side){b(.06,.16,.16,'#2a2a2a',x+.03,y,z);b(.14,.2,.24,c,x+.1,y+.12,z)}else{b(.16,.16,.06,'#2a2a2a',x,y,z+.03);b(.24,.2,.14,c,x,y+.12,z+.1)}};
const ixPend=(b,x,z,c='*ffd98a',sh='#2a2a2a',y=2.35)=>{b(.03,3.1-y,.03,'#222',x,(3.1+y)/2,z);b(.16,.1,.16,'#c9a227',x,y+.2,z);b(.5,.16,.5,sh,x,y+.07,z);b(.54,.04,.54,'#c9a227',x,y,z);b(.36,.05,.36,c,x,y-.03,z)};
const ixCounter=(b,cl,x,z,w,d,c,top)=>{b(w,.98,d,c,x,.49,z);b(w-.1,.1,.04,ixShade(c,.75),x,.12,z+d/2+.01);b(w+.12,.08,d+.12,top,x,1.02,z);cl(x-w/2-.06,z-d/2-.06,x+w/2+.06,z+d/2+.06)};
const ixWin=(b,x,z,w,sky='*bfe3ff',side=1)=>{/* a window on the left wall (side) or the back wall */if(side){b(.03,1.3,w,sky,.01,1.75,z);b(.08,.08,w+.16,'#f4f1ea',.04,2.44,z);b(.12,.08,w+.2,'#f4f1ea',.06,1.06,z);b(.08,1.3,.08,'#f4f1ea',.04,1.75,z-w/2);b(.08,1.3,.08,'#f4f1ea',.04,1.75,z+w/2);b(.06,1.3,.05,'#f4f1ea',.04,1.75,z)}
 else{b(w,1.3,.03,sky,x,1.75,.01);b(w+.16,.08,.08,'#f4f1ea',x,2.44,.04);b(w+.2,.08,.12,'#f4f1ea',x,1.06,.06);b(.08,1.3,.08,'#f4f1ea',x-w/2,1.75,.04);b(.08,1.3,.08,'#f4f1ea',x+w/2,1.75,.04);b(.05,1.3,.06,'#f4f1ea',x,1.75,.04)}};

const IXROOMS={
/* 0 jewellery: dark marble, plum wallpaper, gold trim, glass counters, mirrors, chandelier */
0:{fl:['marble','#3a2f45','#2b2233'],wl:['stripe','#4a3a6a','#3f3160'],tr:'#c9a227',wa:'#2e2440',fw:'#2e2440',mat:'#5a1f3a',sign:['JEWELLERY','#f6d77a','#2a1f36',3.2,.55,2.55,5,{border:'#c9a227',glow:'#f6d77a'}],lights:[[2.5,4],[7.5,4],[5,2.2,.5]],lc:0xfff0d8,
 build(b,cl){ixCounter(b,cl,5,3.2,6,1,'#2a2030','#c9a227');b(5.8,.04,.85,'#6a1f3a',5,1.07,3.2);b(6,.22,.03,'#a9cfe0',5,1.17,2.71);b(.03,.22,1,'#a9cfe0',2.01,1.17,3.2);b(.03,.22,1,'#a9cfe0',7.99,1.17,3.2);
  [[2.6,'#e6b422'],[3.3,'#e8e8f0'],[4.1,'#e84a8a'],[5.9,'#4ad9c0'],[6.7,'#e6b422'],[7.4,'#7a4ad9']].forEach(q=>{b(.16,.08,.16,q[1],q[0],1.13,3.1);b(.08,.08,.08,'*ffffff',q[0]+.04,1.19,3.06)});for(let k=0;k<8;k++)b(.06,.04,.06,'#e6b422',4.3+k*.18,1.11,3.4+Math.sin(k)*.08);
  [[2,5.8],[8,5.8]].forEach((q,k)=>{b(1.3,.9,1,'#2a2030',q[0],.45,q[1]);b(1.36,.06,1.06,'#c9a227',q[0],.92,q[1]);b(1.2,.04,.9,'#6a1f3a',q[0],.96,q[1]);b(.3,.55,.22,'#f0e6d8',q[0],1.25,q[1]);b(.44,.12,.26,'#f0e6d8',q[0],1.55,q[1]);for(let j=0;j<5;j++)b(.06,.06,.04,k?'#4ad9c0':'#e6b422',q[0]-.16+j*.08,1.4-Math.abs(j-2)*.05,q[1]+.12);b(1.2,.18,.02,'#a9cfe0',q[0],1.06,q[1]+.5);cl(q[0]-.7,q[1]-.55,q[0]+.7,q[1]+.55)});
  [[1.6,'#bcd7e6'],[8.4,'#bcd7e6']].forEach(q=>{b(1.6,1.9,.05,'#c9a227',q[0],1.75,.04);b(1.4,1.7,.03,q[1],q[0],1.75,.07);b(.5,1.5,.02,'#e4f2fa',q[0]-.3,1.8,.09)});
  [3.2,6.8].forEach(x=>{b(1,.06,.3,'#c9a227',x,1.9,.15);b(1,.06,.3,'#c9a227',x,2.4,.15);[[-.3,'#e84a8a'],[0,'#e6b422'],[.3,'#4ad9c0']].forEach(q=>{b(.14,.16,.14,q[1],x+q[0],2.01,.15);b(.12,.14,.12,'#e8e8f0',x-q[0],2.5,.15)});ixLampW(b,x,2.75,0,'*fff2c0')});
  ixFrame(b,.03,1.8,2.6,1.4,1,'#c9a227',['#7a1f3a','#e6b422','#2a1f36'],1);ixFrame(b,.03,1.8,5.6,1.4,1,'#c9a227',['#2a5a8a','#e8e8f0','#4ad9c0'],1);ixLampW(b,0,2.6,4.1,'*fff2c0',1);
  b(.03,.7,.03,'#c9a227',5,2.75,4.9);b(.9,.1,.9,'#c9a227',5,2.4,4.9);for(let k=0;k<8;k++){const a=k*Math.PI/4;b(.08,.22,.08,'*fff6d0',5+Math.cos(a)*.38,2.25,4.9+Math.sin(a)*.38)}b(.2,.2,.2,'*fff6d0',5,2.25,4.9);
  b(3.6,.02,2.2,'#c9a227',5,.012,5.6);b(3.4,.022,2,'#5a1f3a',5,.016,5.6);ixPlant(b,cl,.7,.7,1,'#2a2030');ixPlant(b,cl,9.3,.7,1,'#2a2030');ixPlant(b,cl,.7,7.2,.9,'#2a2030')}},
/* 1 property office: carpet, light panelled walls with navy dado, listings wall, desk, filing cabinets, waiting area, house model */
1:{fl:['carpet','#5a6878','#4f5c6b'],wl:['panel','#e4e9ef','#c9d2dc'],tr:'#f4f6f8',wa:'#2f4a6e',fw:'#2f4a6e',mat:'#2f4a6e',sign:['PROPERTY','#ffffff','#2f4a6e',2.8,.5,2.65,5,{border:'#e6b422'}],lights:[[2.5,4],[7.5,4]],lc:0xfff4e0,
 build(b,cl){ixCounter(b,cl,5,3.1,4,1.1,'#2f4a6e','#e8e2d8');b(.75,.48,.05,'#111',5.9,1.36,2.85);b(.66,.4,.02,'*7fd0ff',5.9,1.36,2.88);b(.1,.2,.1,'#333',5.9,1.16,2.85);b(.5,.03,.18,'#ddd',5.9,1.07,3.25);b(.3,.12,.2,'#222',3.6,1.12,3.0);b(.5,.04,.36,'#f8f8f8',4.4,1.07,3.3);b(.6,.14,.04,'#e6b422',5,1.13,3.6);
  [1.1,2.3,3.5,6.5,7.7,8.9].forEach((x,k)=>{b(1,.8,.04,'#f8f8f8',x,1.95,.04);b(.86,.4,.02,'*bfe3ff',x,2.05,.07);const hc=['#e8d9a0','#d9b88f','#cfd8dc','#f2e6d0','#b8d4e8','#e8c4c4'][k];b(.4,.22,.02,hc,x,1.82,.08);b(.5,.1,.02,['#c0392b','#6b4a2e','#455a64','#8d2d2d','#2d5a8d','#5a3a6a'][k],x,1.98,.085);b(.1,.14,.02,'#5a3a22',x,1.78,.09);b(.86,.12,.02,'#2f4a6e',x,1.62,.08)});
  [8.6,9.5].forEach(x=>{b(.8,1.3,.6,'#9aa5b1',x,.65,1.6);for(let k=0;k<3;k++){b(.7,.02,.02,'#6a7580',x,.35+k*.4,1.91);b(.2,.04,.03,'#d0d6dc',x,.5+k*.4,1.92)}});cl(8.15,1.25,9.95,1.95);
  b(1.4,.04,2,'#c9d2dc',1.9,.02,6);ixChair(b,1.2,5.5,'#2f4a6e',0);ixChair(b,2.6,5.5,'#2f4a6e',0);b(1.2,.4,.6,'#6b4a2e',1.9,.2,6.4);b(.4,.05,.3,'#e84a8a',1.7,.42,6.4);b(.4,.05,.3,'#4a90d9',2.1,.43,6.35);cl(.9,5.2,2.9,6.75);
  b(1,.8,1,'#e8e2d8',8,.4,6);b(1.04,.05,1.04,'#2f4a6e',8,.82,6);b(.6,.36,.5,'#f2e6d0',8,1.03,6);b(.7,.12,.6,'#c0392b',8,1.27,6);b(.5,.1,.4,'#a02a20',8,1.38,6);b(.14,.2,.02,'#5a3a22',8,.95,6.26);b(.16,.14,.02,'*ffe9a8',7.8,1.08,6.26);cl(7.45,5.45,8.55,6.55);
  ixFrame(b,.03,1.8,3,2.2,1.4,'#2f4a6e',['#6fb36a','#9aa5b1','#4a90d9','#cfc6b4'],1);b(.04,.5,.5,'#f4f4f4',.03,2.2,6.2);b(.02,.04,.2,'#222',.06,2.22,6.25);
  b(.5,1.1,.5,'#d0d6dc',.5,.55,.6);b(.36,.4,.36,'*bfe9ff',.5,1.3,.6);cl(.2,.3,.8,.9);ixPlant(b,cl,9.3,7.2,.9,'#e8e2d8');ixPlant(b,cl,.7,4.4,.8,'#e8e2d8');ixLampW(b,0,2.5,1.6,'*fff2c0',1);ixLampW(b,0,2.5,4.6,'*fff2c0',1)}},
/* 2 corner shop: tiled floor, shelves full of products, drinks fridges, freezer, till */
2:{fl:['tile','#e8e8e2','#cfd2cc'],wl:['plaster','#efe4c8','#e2d6b8'],tr:'#3f8f5a',wa:'#7aa86a',fw:'#3f8f5a',mat:'#3f8f5a',sign:['CORNER SHOP','#ffffff','#c0392b',3.4,.55,2.65,5,{border:'#ffffff'}],lights:[[2.5,3.5],[7.5,3.5],[5,6,.5]],lc:0xf4f8ff,
 build(b,cl){const PC=['#e74c3c','#f1c40f','#3498db','#2ecc71','#e67e22','#9b59b6','#f4f4f4','#c0392b'];let pk=0;const prod=(x,y,z,w,d,side)=>{for(let u=-w/2+.12;u<w/2-.05;u+=.2){const c=PC[(pk++*7)%PC.length],h=.18+((pk*13)%5)*.03;side?b(d,h,.16,c,x,y+h/2,z+u):b(.16,h,d,c,x+u,y+h/2,z)}};
  ixCounter(b,cl,5,3.2,4,1,'#3f8f5a','#e8e8e2');b(.5,.32,.44,'#333',4,1.22,3.2);b(.4,.18,.02,'*2fe68a',4,1.36,2.97);b(.24,.06,.3,'#222',6.2,1.09,3.2);b(.6,.36,.3,'#c0392b',6.9,1.24,3.4);for(let k=0;k<4;k++)b(.12,.08,.06,PC[k],6.7+k*.13,1.3,3.56);
  [[1.9,2.2],[8.1,2.2]].forEach(q=>{b(q[1],2,.05,'#8a6a4a',q[0],1,.04);[-1,1].forEach(sd=>b(.05,2,.5,'#7a5a3a',q[0]+sd*q[1]/2,1,.27));b(q[1],.06,.5,'#7a5a3a',q[0],2.01,.27);for(let y of[.12,.6,1.08,1.56]){b(q[1],.04,.5,'#c9b090',q[0],y,.27);prod(q[0],y+.02,.3,q[1]-.1,.3,0)}cl(q[0]-q[1]/2,0,q[0]+q[1]/2,.55)});
  [2.6,7.4].forEach(x=>{b(.12,1.5,2.6,'#e8e8e8',x,.75,6);b(.92,.14,2.6,'#cfcfcf',x,.07,6);for(let y of[.14,.6,1.06]){b(.92,.03,2.6,'#d8d8d8',x,y+.02,6);prod(x-.27,y+.04,6,2.5,.25,1);prod(x+.27,y+.04,6,2.5,.25,1)}b(.92,.3,.05,'#c0392b',x,1.62,7.33);b(.92,.3,.05,'#c0392b',x,1.62,4.67);cl(x-.48,4.65,x+.48,7.35)});
  b(.2,2,2.4,'#d8dde2',.1,1,2.6);b(.02,1.7,2.2,'*e8f6ff',.21,1.05,2.6);[1.4,3.8].forEach(z=>b(.66,2,.06,'#cfd6dc',.35,1,z));b(.66,.12,2.4,'#cfd6dc',.35,.06,2.6);for(let k=0;k<4;k++){b(.45,.03,2.3,'#b8c2cc',.44,.2+k*.45,2.6);for(let j=0;j<8;j++)b(.12,.26,.12,['#e74c3c','#3498db','#2ecc71','#f1c40f','#e67e22'][(j+k)%5],.4,.35+k*.45,1.65+j*.27)}b(.66,.2,2.42,'#2ecc71',.35,2.1,2.6);[1.65,2.45,3.25].forEach(z=>b(.03,1.7,.04,'#cfd6dc',.68,1.05,z));cl(0,1.35,.7,3.85);
  b(.9,.8,1.6,'#f4f4f4',9.4,.4,4.6);b(.8,.04,1.5,'*cfefff',9.4,.81,4.6);b(.92,.12,1.62,'#3498db',9.4,.72,4.6);cl(8.9,3.75,9.95,5.45);
  b(.5,1.1,.4,'#555',9.6,.55,7.1);for(let k=0;k<3;k++)b(.44,.04,.3,['#f4f4f4','#e8e0c8','#f4f4f4'][k],9.6,.5+k*.3,7.1);cl(9.3,6.85,9.9,7.35)}},
/* 3 City Cafe: wooden floor, brick wall, espresso machine, pastry case, chalk menus, pendant lamps, tables, window bench */
3:{fl:['plank','#a9794a','#6b4a2e'],wl:['brick','#b5654a','#d9c2a8'],tr:'#4a2f1c',wa:null,fw:'#6b4a2e',mat:'#4a2f1c',sign:['CITY CAFE','#f4e8c8','#20302a',2.6,.5,2.72,5,{border:'#c9a27a',ff:'Georgia,serif'}],lights:[[2.2,4.5],[7.8,4.5],[5,2.6,.5]],lc:0xffd8a0,
 build(b,cl,add){ixCounter(b,cl,5,3.2,5,1,'#5a3a22','#e8e0d0');for(let k=0;k<5;k++)b(.9,.8,.02,ixShade('#5a3a22',k%2?.9:1.08),3+k*1,.5,3.71);
  b(.9,.6,.55,'#c0c4c8',3.2,1.36,3.1);b(.9,.1,.55,'#c0392b',3.2,1.71,3.1);[2.95,3.45].forEach(x=>{b(.08,.14,.08,'#333',x,1.04,3.38);b(.14,.1,.14,'#f4f4f4',x,1.11,3.5)});b(.3,.45,.3,'#2a2a2a',2.3,1.3,3.1);b(.22,.18,.22,'#7a4a2e',2.3,1.6,3.1);
  b(1.4,.5,.8,'#6b4a2e',6.8,1.31,3.2);b(1.36,.42,.02,'*fff6e0',6.8,1.33,3.6);[['#e8b04a',6.3],['#7a4a2e',6.6],['#f4d0e0',6.9],['#e8b04a',7.2]].forEach(q=>{b(.18,.1,.18,q[0],q[1],1.18,3.3);b(.18,.08,.18,q[0],q[1]+.06,1.39,3.1)});b(.2,.24,.2,'#cfe9ff',4.5,1.18,3.4);b(.3,.2,.25,'#333',5.6,1.16,3.1);
  [[2.6,'CAKE  3'],[7.4,'COFFEE  4']].forEach((q,k)=>{b(1.5,.9,.05,'#6b4a2e',q[0],2.15,.04);b(1.38,.78,.02,'#20302a',q[0],2.15,.07);add(ixSign(k?'LATTE · FLAT WHITE':'CAKE · COOKIES','#f4e8c8','#20302a',1.3,.22,{ff:'Georgia,serif',k:.5}),q[0],2.38,.085);for(let j=0;j<3;j++)b(.9-j*.15,.03,.01,'#e8e8e0',q[0]-.1,2.12-j*.15,.085)});
  [3.6,6.4].forEach(x=>{b(1.1,.05,.25,'#6b4a2e',x,1.75,.13);for(let k=0;k<4;k++)b(.16,.2,.16,['#f4f4f4','#c9a27a','#e8b04a','#7a4a2e'][k],x-.4+k*.27,1.88,.13)});
  [2.6,7.4].forEach(x=>ixPend(b,x,3.3,'*ffd98a','#2f6b4f',2.5));[2,8].forEach(x=>ixPend(b,x,6,'*ffd98a','#2f6b4f',2.3));
  [[2,6],[8,6]].forEach(q=>{b(1,.06,1,'#3a2614',q[0],.76,q[1]);b(.1,.72,.1,'#222',q[0],.37,q[1]);b(.5,.04,.5,'#222',q[0],.02,q[1]);ixChair(b,q[0],q[1]-.78,'#7a4a2e',0);ixChair(b,q[0],q[1]+.78,'#7a4a2e',1);b(.14,.12,.14,'#f4f4f4',q[0]-.2,.85,q[1]);b(.14,.12,.14,'#f4f4f4',q[0]+.22,.85,q[1]+.1);b(.2,.03,.14,'#e8b04a',q[0]+.1,.8,q[1]-.25);cl(q[0]-.55,q[1]-.55,q[0]+.55,q[1]+.55)});
  b(.7,.45,2.6,'#6b4a2e',.4,.23,4.6);b(.6,.12,2.5,'#2f6b4f',.42,.51,4.6);b(.12,.5,2.5,'#2f6b4f',.12,.8,4.6);cl(0,3.3,.8,5.9);ixWin(b,0,3.8,1.4);ixWin(b,0,5.5,1.4);
  ixPlant(b,cl,.7,7.2,1,'#c0392b');ixPlant(b,cl,9.3,.7,1.1,'#c0392b');ixPlant(b,cl,9.3,7.2,.9,'#c0392b');ixLampW(b,0,2.6,1.6,'*ffd98a',1)}},
/* 4 Music Store: dark wood floor, purple panels, guitar wall, amps, drum kit, keyboard, vinyl crates, neon */
4:{fl:['plank','#4a3a3a','#2e2424'],wl:['panel','#5a3a6a','#4a2f58'],tr:'#1f1a24',wa:'#2a2030',fw:'#2a2030',mat:'#2a2030',sign:['MUSIC STORE','#ffffff','#1a1420',3,.5,2.7,5,{glow:'#ff4da6',border:'#ff4da6'}],lights:[[2.5,4.2],[7.5,4.2],[5,6.5,.5]],lc:0xffe0f0,
 build(b,cl){ixCounter(b,cl,5,3.2,4,1,'#2a2a30','#c68a3c');b(.5,.3,.4,'#333',6.2,1.21,3.2);b(.36,.16,.02,'*7fd0ff',6.2,1.32,2.99);for(let k=0;k<4;k++){b(.22,.06,.3,['#e6b422','#2a8a4a','#c0392b','#2a6ab5'][k],3.7+k*.32,1.1,3.3);b(.04,.03,.04,'*ff3a3a',3.7+k*.32,1.15,3.2)}
  const gtr=(x,c,bass)=>{b(.5,.62,.08,c,x,1.3,.14);b(.36,.24,.09,ixShade(c,1.15),x,1.72,.14);b(.14,.14,.02,'#111',x,1.32,.19);b(.08,bass?.86:.74,.06,'#3a2a1a',x,bass?2.1:2.02,.14);b(.14,.18,.06,'#1a1a1a',x,bass?2.6:2.47,.14);b(.3,.04,.12,'#222',x,1.8,.1)};
  [[.8,'#c0392b'],[1.6,'#e6b422'],[2.4,'#2a6ab5',1],[7.6,'#f4f4f4'],[8.4,'#1a1a1a',1],[9.2,'#2fe68a']].forEach(q=>gtr(...q));b(.04,2,.04,'#111',4.95,1,.1);
  b(1.1,1.5,.7,'#1a1a1a',9.3,.75,5.4);b(.96,.6,.02,'#3a3a3a',9.3,.5,5.76);b(.96,.5,.02,'#3a3a3a',9.3,1.12,5.76);b(.9,.12,.04,'#c68a3c',9.3,1.42,5.77);for(let k=0;k<5;k++)b(.05,.05,.03,'#e6b422',8.95+k*.17,1.42,5.8);cl(8.7,5,9.9,5.8);
  b(1.6,.08,.5,'#1a1a1a',1.8,.9,5.6);for(let k=0;k<14;k++)b(.1,.03,.4,'#f4f4f4',1.15+k*.105,.95,5.62);for(let k=0;k<10;k++)if(k%7!=2&&k%7!=6)b(.06,.04,.24,'#111',1.2+k*.14,.98,5.5);[[1.25],[2.35]].forEach(q=>{b(.06,.86,.06,'#333',q[0],.45,5.45);b(.06,.86,.06,'#333',q[0],.45,5.75)});cl(1,5.3,2.6,5.9);
  b(.7,.42,.7,'#c0392b',1.3,.32,1.4);b(.62,.04,.62,'#e8e8e8',1.3,.55,1.4);b(.4,.25,.4,'#c0392b',2.1,.55,1.2);b(.36,.03,.36,'#e8e8e8',2.1,.69,1.2);b(.36,.2,.36,'#c0392b',.6,.52,1.9);b(.5,.03,.5,'*f6d77a',.7,1.15,1);b(.5,.03,.5,'*f6d77a',2.3,1.25,1.9);b(.03,1.1,.03,'#888',.7,.6,1);b(.03,1.2,.03,'#888',2.3,.62,1.9);cl(.3,.8,2.6,2.3);
  [[7.2,2,'#8a5a36'],[8.4,2,'#6b4a2e']].forEach(q=>{b(1,.5,.6,q[2],q[0],.25,q[1]);for(let k=0;k<7;k++)b(.9,.42,.03,['#111','#e84a8a','#111','#2fe68a','#111','#e6b422','#111'][k],q[0],.68,q[1]-.24+k*.08)});cl(6.65,1.65,8.95,2.35);
  ixFrame(b,.03,1.9,2.4,1.1,1.5,'#111',['#e84a8a','#2a2030'],1);ixFrame(b,.03,1.9,4.2,1.1,1.5,'#111',['#2fe68a','#1a1420'],1);ixFrame(b,.03,1.9,6,1.1,1.5,'#111',['#e6b422','#2a2030'],1);b(.03,.06,5.6,'*ff4da6',.03,2.75,4.2);b(10,.05,.03,'*7a4ad9',5,2.9,.03);ixPlant(b,cl,.7,7.2,.9,'#2a2030')}},
/* 5 Radio Station: carpet, acoustic foam, broadcast desk with mixer and mic arms, ON AIR light, booth window, guest sofa */
5:{fl:['carpet','#2a2a32','#24242b'],wl:['foam','#3a3046','#2e2638'],tr:'#6a2a3a',wa:null,fw:'#2a2a32',mat:'#6a2a3a',sign:['RADIO 88.1 FM','#ffffff','#6a2a3a',3,.48,2.72,3.2,{border:'#ff3a3a'}],lights:[[2.5,4.5],[7.5,4.5]],lc:0xffd8d8,
 build(b,cl,add){b(5,.9,1.2,'#2a2a30',5,.45,3);b(5.1,.07,1.3,'#4a4a56',5,.94,3);cl(2.45,2.35,7.55,3.65);b(2.2,.08,.8,'#1a1a20',5,1.02,3);for(let k=0;k<12;k++){b(.06,.02,.4,'#888',4.1+k*.16,1.07,3.05);b(.1,.03,.06,['*ff4a4a','*4aff6a','*ffe04a','*4ab0ff'][k%4],4.1+k*.16,1.08,2.88+((k*5)%4)*.08)}
  [3.5,6.5].forEach((x,k)=>{b(.8,.5,.05,'#111',x,1.35,2.6);b(.72,.42,.02,k?'*7fd0ff':'*b07aff',x,1.35,2.63);b(.08,.2,.08,'#222',x,1.07,2.6);b(.04,.6,.04,'#333',x+(k?-.8:.8),1.3,3.3);b(.5,.04,.04,'#333',x+(k?-.6:.6),1.6,3.3);b(.12,.22,.12,'#555',x+(k?-.35:.35),1.5,3.3);b(.14,.14,.14,'#222',x+(k?-.35:.35),1.66,3.3);b(.3,.12,.24,'#111',x,1.04,3.35)});
  b(.9,.36,.06,'#111',7.7,2.6,.05);add(ixSign('ON AIR','#ffffff','#d0202a',.8,.28,{glow:'#ff6060'}),7.7,2.6,.085);
  b(2.6,1.5,.06,'#1a1a20',8.5,1.6,.05);b(2.4,1.3,.02,'*6a8aaa',8.5,1.6,.09);b(.4,.7,.02,'#2a2a3a',8.2,1.45,.1);b(.3,.3,.02,'#2a2a3a',8.2,1.95,.1);
  b(2.2,.45,.9,'#4a6fa5',2,.25,5.8);b(2.2,.5,.22,'#3d5e8f',2,.65,6.25);b(.22,.6,.9,'#3d5e8f',.95,.35,5.8);b(.22,.6,.9,'#3d5e8f',3.05,.35,5.8);b(.9,.12,.6,'#5a7fb5',1.5,.52,5.7);b(.9,.12,.6,'#5a7fb5',2.5,.52,5.7);cl(.85,5.3,3.15,6.4);b(1,.35,.6,'#2a2a30',2,.18,4.8);b(.2,.12,.2,'#f4f4f4',2.2,.42,4.8);cl(1.45,4.45,2.55,5.15);
  b(.06,2,2.4,'#2a2030',.05,1,1.6);[.4,2.8].forEach(z=>b(.5,2,.06,'#2a2030',.3,1,z));for(let k=0;k<4;k++){b(.48,.03,2.4,'#3a3046',.3,.3+k*.5,1.6);for(let j=0;j<14;j++)b(.36,.4,.04,['#111','#e84a8a','#e6b422','#4a90d9','#2fe68a'][(j+k)%5],.35,.52+k*.5,.55+j*.15)}cl(0,.4,.6,2.8);
  ixFrame(b,.03,1.9,4.5,.9,.9,'#e6b422',['#e6b422'],1);b(.03,.5,.5,'#c9a227',.05,1.9,4.5);ixFrame(b,.03,1.9,6.1,.9,.9,'#e6b422',['#c0c4c8'],1);ixPlant(b,cl,9.3,7.2,.9,'#2a2a30');ixPlant(b,cl,.7,7.2,.9,'#2a2a30')}},
/* 6 garage: concrete with oil stains and bay lines, block walls, pegboard and workbench, roller door, tool chest, tyres */
6:{fl:['concrete','#7a8087','#6a7077'],wl:['block','#9aa0a8','#7d838b'],tr:'#e6b422',wa:null,fw:'#5a5f66',mat:'#3a3d44',sign:['GARAGE','#1a1a1a','#e6b422',2,.42,2.72,7.6,{border:'#1a1a1a'}],lights:[[2.5,4],[7.5,4]],lc:0xeef6ff,
 build(b,cl){b(3.5,.1,.9,'#8a5a36',2,.95,.6);b(3.4,.9,.8,'#5a5f66',2,.45,.6);b(.3,.25,.25,'#2a2a30',.7,1.12,.5);b(.5,.06,.2,'#c0392b',2.6,1.03,.7);b(.12,.1,.4,'#555',3.2,1.05,.6);cl(.2,.1,3.8,1.1);
  b(3.4,1.3,.04,'#c9a77a',2,1.85,.04);for(let u=0;u<16;u++)for(let v=0;v<6;v++)b(.03,.03,.01,'#8a6a4a',.45+u*.2,1.3+v*.2,.07);[[.8,'#c0392b',.6],[1.3,'#555',.5],[1.8,'#2a6ab5',.4],[2.4,'#555',.7],[3,'#e6b422',.5]].forEach(q=>{b(.08,q[2],.03,q[1],q[0],1.95,.08);b(.2,.1,.03,'#666',q[0],1.95+q[2]/2,.08)});
  b(4,2.6,.05,'#a7adb5',6,1.3,.03);for(let k=0;k<12;k++)b(4,.03,.03,'#7d838b',6,.15+k*.21,.07);b(.5,.06,.04,'#555',6,.55,.09);
  b(.9,1.2,.6,'#c0392b',9.2,.6,.9);for(let k=0;k<5;k++){b(.8,.02,.02,'#8a2a20',9.2,.25+k*.22,1.21);b(.3,.03,.03,'#d0d0d0',9.2,.33+k*.22,1.22)}cl(8.75,.6,9.65,1.2);
  [[9.4,2.4],[9.4,3.3]].forEach(q=>{for(let k=0;k<3;k++){b(.8,.25,.8,'#1a1a1a',q[0],.13+k*.26,q[1]);b(.4,.26,.4,'#555',q[0],.13+k*.26,q[1])}cl(q[0]-.4,q[1]-.4,q[0]+.4,q[1]+.4)});
  for(let k=0;k<5;k++)b(.08,.01,2.8,'#e6b422',1.1+k*1.8,.006,5.4);[[3,5],[6.6,5.6],[4.5,4.4]].forEach(q=>b(.9,.008,.6,'#4a4f56',q[0],.005,q[1]));
  [2.5,7.5].forEach(x=>{b(1.4,.08,.14,'#ddd',x,2.95,.12);b(1.3,.05,.08,'*eef8ff',x,2.9,.18)});b(.06,.1,1.4,'#ddd',.08,2.95,4);b(.04,.06,1.3,'*eef8ff',.12,2.9,4);
  b(.5,.8,.5,'#2a6ab5',.5,.4,7.3);b(.4,.06,.4,'#1a1a1a',.5,.82,7.3);cl(.2,7,.8,7.6);b(.6,.9,.4,'#c0392b',.4,.45,3.2);b(.3,.25,.02,'#fff',.4,.6,3.41);cl(.1,3,.7,3.4)}}};

/* the old shop rooms are rebuilt right after they exist (the garage is added in buildVenues, 19-v6...js) */
{const bv=buildVenues;buildVenues=function(){bv();for(const k in IXROOMS)try{ixRoom(+k,IXROOMS[k])}catch(e){console.error('interior '+k,e)}
 /* the grass under the shop rooms made them look like they float on a lawn: make it a dark backdrop */
 WORLD.children.forEach(o=>{const p=o.geometry&&o.geometry.parameters;if(o.isMesh&&p&&p.width==260&&p.depth==90&&Math.abs(o.position.z-322)<.5)o.material=new THREE.MeshLambertMaterial({color:'#1c2026'})})}}
/* only the room you are in is lit by its lamps (fewer lights everywhere else) */
{const u0=update;update=function(dt){u0(dt);const k=IN?IN.i:-1;IXL.forEach(q=>{const v=q[1]===k;if(q[0].visible!==v)q[0].visible=v})}}

/* ---- tower floors: cornices, floor plaques by the elevator, picture lights ---- */
{const tb0=twBase;twBase=function(g,o,n,T){tb0(g,o,n,T);try{const wl=T.wl[n],wh=n==T.roof?.9:3.4,L=[],E=[],b=(w,h,d,c,x,y,z)=>(c[0]=='*'?E:L).push([w,h,d,c[0]=='*'?'#'+c.slice(1):c,o+x,y,320+z]);
 if(wh>3){b(22.3,.16,.36,dk(wl,.78),11,wh+.02,-.12);b(.36,.16,16.3,dk(wl,.78),-.12,wh+.02,8);b(22,.05,.06,dk(wl,1.15),11,wh-.12,.03);b(.06,.05,16,dk(wl,1.15),.03,wh-.12,8)}
 b(22,.04,.05,dk(wl,.45),11,.19,.07);b(.05,.04,16,dk(wl,.45),.07,.19,8);
 const lamp=(x,z,c)=>{b(.36,.05,.36,'#2a2a2a',x,.03,z);b(.05,1.5,.05,'#2a2a2a',x,.78,z);b(.42,.32,.42,c||'#f0e6d0',x,1.62,z);b(.3,.04,.3,'*fff2c8',x,1.8,z);twc(o,x-.2,z-.2,x+.2,z+.2)};
 if(T.nm=='Skyline Tower'&&n==1){[[8.3,15.1],[13.7,15.1]].forEach(q=>{b(.8,.7,.8,'#5a5f66',q[0],.35,q[1]);b(.84,.06,.84,'#c9a227',q[0],.72,q[1]);b(.9,.9,.9,'#2e7d32',q[0],1.2,q[1]);b(.6,.6,.6,'#43a047',q[0],1.75,q[1]);twc(o,q[0]-.42,q[1]-.42,q[0]+.42,q[1]+.42)});b(2.6,.02,1,'#3a2a1a',11,.012,15.5);b(2.4,.022,.8,'#7a1f3a',11,.016,15.5)}
 /* floor 5: the lounge where artists wait for you, with a rug and two lamps */
 if(T.nm=='Skyline Tower'&&n==5){b(10,.02,3.4,'#2a2538',11,.012,13.9);b(9.6,.022,3,'#5a3a7a',11,.016,13.9);lamp(5.8,15.4,'#e8d8f0');lamp(16.2,15.4,'#e8d8f0')}
 if(T.nm=='Pulse Records HQ'&&n==3){b(10,.02,3.4,'#1a1a22',11,.012,11.8);b(9.6,.022,3,'#7a1f3a',11,.016,11.8)}
 if(n!=T.roof){const nm=T.names[n-1];b(1,1.2,.05,'#1a1a20',8.69,1.85,.22);b(1.06,.04,.07,'#c9a227',8.69,2.46,.23);const s=ixSign(String(n),'#ffffff','#1a1a20',.9,.62,{k:.9});s.position.set(o+8.69,2.08,320.26);g.add(s);const s2=ixSign(nm.toUpperCase(),'#f6d77a','#1a1a20',.94,.34,{k:.62});s2.position.set(o+8.69,1.5,320.26);g.add(s2)}
 g.add(new THREE.Mesh(ixGeo(L),ixMat(0)));if(E.length)g.add(new THREE.Mesh(ixGeo(E),ixMat(1)))}catch(e){console.error('twBase+',e)}}}
/* the glass walls of studios and meeting rooms were solid pale-blue slabs that hid the room behind them: make them glass */
const IXGL=new THREE.MeshLambertMaterial({color:'#cfeeff',transparent:true,opacity:.28,depthWrite:false});
{const bt0=buildTF;buildTF=function(T){bt0(T);try{(T.groups||[]).forEach(G=>G.traverse(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;if(!p||!m.material||!m.material.color||m.material.transparent)return;const h=m.material.color.getHex();
 if((h==0x9ad0f0||h==0xbfe3ff)&&p.height>=2&&Math.max(p.width,p.depth)>=1.8&&m.position.y<2)m.material=IXGL}))}catch(e){console.error('tower glass',e)}}}
