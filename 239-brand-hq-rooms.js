/* ===== v53.5.0: brand HQ interiors, six rooms each =====
   Replaces the single studio room of 225-brand-hq.js. Every brand HQ is now a set of six rooms joined by doors:
   Lobby (reception, giant logo wall, logo sculpture, product plinths, lounge), Open office (desk pods, glass meeting box,
   window wall), Showroom (a different signature hall for every brand: skate park, bottling line, gaming arena, runway ...),
   Cafe, Boardroom and the photo Studio ('brand' room, where the camera starts the 3D shoot in 238-brand-shoot3d.js).
   Room keys: hq_lobby hq_office hq_show hq_cafe hq_board and 'brand' (BRD.inStudio looks for that one). They sit far east of
   the city in a row at z=-120 (RD). BRD.hqBuild(C,o) is called by the city hook in 225-brand-hq.js, BRD.hqEnter() by the front door.
   Each brand has its own palette, floor, wall style, lamps and cafe (HD) plus its own showroom function (SHOW).
   Also BRD.hqExterior(c,roofH): the logo monument, banners and rooftop billboard added to the outside building. */
(function(){
const BRD=window.BRD,D=window.DCITY;if(!BRD||!D||!BRD.item3d)return;
const OX=D.OX,OZ=D.OZ,RZ=-190,H7=7.2;
const pc=id=>{const b=BRD.by(id);return b.c==b.bg||/^#f/i.test(b.c)?'#3a3a48':b.c};
const RD={lobby:[1300,40,28],office:[1370,44,30],show:[1450,50,34],cafe:[1540,34,24],board:[1600,28,20],brand:[1660,38,26]};
const KEY=k=>k=='brand'?'brand':'hq_'+k,NM={lobby:'Lobby',office:'Open office',show:'Showroom',cafe:'Cafe',board:'Boardroom',brand:'Photo studio'};
BRD.hqKey=KEY;
const mix=(a,b,t)=>igxMix(a,b,t);
const rnd=a=>{let s=a|0||7;return()=>{s=(s*1103515245+12345)>>>0;return s/4294967296}};
const hsh=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};

/* ---------- per-brand style: fl floor colour, ff floor kind, wl wall colour, ac/ac2 accents, ch chair, of office wall, cf cafe, lamp ---------- */
const HD={
 converse:{fl:'#cdb48e',ff:'wood',wl:'#efe6d2',ac:'#d4202c',ac2:'#1c3f94',ch:'#d4202c',of:'brick',cf:'coffee',lamp:'globe',yr:'1908'},
 monster:{fl:'#26292e',ff:'concrete',wl:'#15171a',ac:'#95d600',ac2:'#0b0b0b',ch:'#95d600',of:'panels',cf:'bar',lamp:'tube',yr:'2002'},
 rayban:{fl:'#6a3a2a',ff:'wood',wl:'#3a1218',ac:'#ff4a4f',ac2:'#ff9a3c',ch:'#ff7a3a',of:'slats',cf:'lounge',lamp:'cone',yr:'1937'},
 supreme:{fl:'#8a8d92',ff:'concrete',wl:'#d4202c',ac:'#f1ece0',ac2:'#16161a',ch:'#16161a',of:'brick',cf:'diner',lamp:'tube',yr:'1994'},
 levis:{fl:'#8a6844',ff:'wood',wl:'#2f5a9a',ac:'#f2b705',ac2:'#1e3f8a',ch:'#f2b705',of:'brick',cf:'coffee',lamp:'cone',yr:'1853'},
 beats:{fl:'#1c1434',ff:'carpet',wl:'#2a1a50',ac:'#a070ff',ac2:'#ff4fd8',ch:'#a070ff',of:'panels',cf:'lounge',lamp:'tube',yr:'2006'},
 pepsi:{fl:'#e8ecf4',ff:'checker',wl:'#f6f8fb',ac:'#e32934',ac2:'#0a4a96',ch:'#0a4a96',of:'panels',cf:'diner',lamp:'globe',yr:'1893'},
 adidas:{fl:'#2a2a2e',ff:'rubber',wl:'#f4f4f4',ac:'#16161a',ac2:'#e8c040',ch:'#16161a',of:'panels',cf:'juice',lamp:'tube',yr:'1949'},
 cocacola:{fl:'#f4f0e8',ff:'checker',wl:'#e41e2b',ac:'#ffffff',ac2:'#e41e2b',ch:'#e41e2b',of:'panels',cf:'diner',lamp:'globe',yr:'1886'},
 samsung:{fl:'#eef1f8',ff:'tile',wl:'#f4f6fb',ac:'#1428a0',ac2:'#6aa0ff',ch:'#1428a0',of:'glass',cf:'coffee',lamp:'tube',yr:'1969'},
 nike:{fl:'#d8541a',ff:'rubber',wl:'#f4f4f1',ac:'#ff6a00',ac2:'#16161a',ch:'#ff6a00',of:'slats',cf:'juice',lamp:'tube',yr:'1964'},
 gucci:{fl:'#e8e0cf',ff:'marble',wl:'#0f3d2e',ac:'#e2c06a',ac2:'#c8202c',ch:'#14683f',of:'marble',cf:'lounge',lamp:'chand',yr:'1921'},
 apple:{fl:'#f0f0f2',ff:'tile',wl:'#fafafa',ac:'#9ab8d8',ac2:'#2e9a58',ch:'#e8e8ec',of:'glass',cf:'coffee',lamp:'tube',yr:'1976'},
 lv:{fl:'#6a4a2c',ff:'marble',wl:'#3a2210',ac:'#e2c06a',ac2:'#c9a24b',ch:'#6a4a2a',of:'marble',cf:'lounge',lamp:'chand',yr:'1854'}};

/* ---------- canvas drawings ---------- */
const FT={
 wood:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);const r=rnd(3);for(let j=0;j<H/32;j++){x.fillStyle='rgba('+(r()<.5?'0,0,0':'255,255,255')+','+(.04+r()*.07)+')';x.fillRect(0,j*32,W,32);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,j*32,W,1);const o=r()*W;x.fillRect(o,j*32,1,32);x.fillRect((o+W/2)%W,j*32+0,1,32)}},
 concrete:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);const r=rnd(5);for(let i=0;i<2200;i++){x.fillStyle='rgba('+(r()<.5?'0,0,0':'255,255,255')+','+(r()*.08)+')';x.fillRect(r()*W,r()*H,2+r()*6,2+r()*6)}x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,0,W,2);x.fillRect(0,0,2,H);x.fillRect(W/2,0,1,H);x.fillRect(0,H/2,W,1)},
 marble:(x,W,H,c,c2)=>{const q=W/4;for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?(c2||'#2a2a2e'):c;x.fillRect(i*q,j*q,q,q)}const r=rnd(9);x.strokeStyle='rgba(120,120,130,.35)';for(let i=0;i<22;i++){x.beginPath();let px=r()*W,py=r()*H;x.moveTo(px,py);for(let k=0;k<4;k++){px+=r()*60-30;py+=r()*60-30;x.lineTo(px,py)}x.stroke()}x.strokeStyle='rgba(0,0,0,.3)';x.strokeRect(0,0,W,H)},
 carpet:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);const r=rnd(4);for(let i=0;i<4000;i++){x.fillStyle='rgba('+(r()<.5?'0,0,0':'255,255,255')+','+(r()*.06)+')';x.fillRect(r()*W,r()*H,2,2)}x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,0,W,1);x.fillRect(0,0,1,H)},
 checker:(x,W,H,c,c2)=>{const q=W/8;for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=(i+j)%2?(c2||'#d0202c'):c;x.fillRect(i*q,j*q,q,q)}},
 rubber:(x,W,H,c,c2)=>{x.fillStyle=c;x.fillRect(0,0,W,H);const r=rnd(8);for(let i=0;i<2500;i++){x.fillStyle='rgba(255,255,255,'+(r()*.05)+')';x.fillRect(r()*W,r()*H,2,2)}x.fillStyle=c2||'#fff';x.fillRect(0,H*.48,W,H*.04)},
 tile:(x,W,H,c)=>{x.fillStyle=c;x.fillRect(0,0,W,H);x.strokeStyle='rgba(0,0,0,.14)';x.lineWidth=2;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*W/4,0);x.lineTo(i*W/4,H);x.moveTo(0,i*H/4);x.lineTo(W,i*H/4);x.stroke()}const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(0,0,0,.06)');x.fillStyle=g;x.fillRect(0,0,W,H)}};
function skyline(x,W,H,mull,night){const q=x.createLinearGradient(0,0,0,H);if(night){q.addColorStop(0,'#0a1030');q.addColorStop(1,'#6a3f88')}else{q.addColorStop(0,'#6aa8ee');q.addColorStop(1,'#eaf4ff')}x.fillStyle=q;x.fillRect(0,0,W,H);const r=rnd(11);
 if(!night)for(let i=0;i<6;i++){x.fillStyle='rgba(255,255,255,.8)';x.fillRect(r()*W,r()*H*.4,60+r()*80,10+r()*10)}
 for(let p=0;p<2;p++){let cx=0;while(cx<W){const w=40+r()*70,h=H*(.18+r()*(p?.28:.4));x.fillStyle=night?(p?'#171b36':'#10132a'):(p?'#aab6cc':'#8f9bb4');x.fillRect(cx,H-h,w,h);for(let yy=H-h+10;yy<H-8;yy+=14)for(let xx=cx+6;xx<cx+w-8;xx+=12)if(r()<(night?.5:.3)){x.fillStyle=night?(r()<.8?'#ffd98a':'#9ad0ff'):'#dff1ff';x.fillRect(xx,yy,6,8)}cx+=w+r()*6}}
 x.fillStyle='#14161c';for(let i=0;i<=mull;i++)x.fillRect(i*(W-8)/mull,0,8,H);x.fillRect(0,0,W,8);x.fillRect(0,H*.62,W,6);x.fillRect(0,H-8,W,8)}
function brickTex(x,W,H,c){x.fillStyle=mix(c,'#000',.45);x.fillRect(0,0,W,H);const r=rnd(6);for(let j=0;j<H/20;j++)for(let i=-1;i<W/48+1;i++){x.fillStyle=mix(c,r()<.5?'#000':'#fff',r()*.18);x.fillRect(i*48+(j%2)*24+2,j*20+2,44,16)}}
function panelTex(x,W,H,c,c2){x.fillStyle=mix(c,'#000',.5);x.fillRect(0,0,W,H);const r=rnd(2);for(let i=0;i<W/64;i++)for(let j=0;j<H/64;j++){x.fillStyle=r()<.3?c2:mix(c,'#000',.15+r()*.2);x.fillRect(i*64+3,j*64+3,58,58)}}
function wallMarble(x,W,H,c,gold){x.fillStyle=c;x.fillRect(0,0,W,H);const r=rnd(8);x.strokeStyle='rgba(255,255,255,.12)';for(let i=0;i<30;i++){x.beginPath();let px=r()*W,py=r()*H;x.moveTo(px,py);for(let k=0;k<5;k++){px+=r()*80-40;py+=r()*80-40;x.lineTo(px,py)}x.stroke()}x.fillStyle=gold;for(let i=1;i<W/128;i++)x.fillRect(i*128,0,3,H);x.fillRect(0,H*.55,W,4);x.fillRect(0,H-8,W,8)}
function logoCanvas(id,b,kind){return(x,W,H)=>{let c=pc(id);const q=new THREE.Color(c);if(q.r+q.g+q.b<.55)c=HD[id].ac;x.fillStyle=kind=='dark'?'#111':c;x.fillRect(0,0,W,H);x.fillStyle='#ffffff14';for(let i=0;i<W;i+=40)x.fillRect(i,0,18,H);const s=Math.min(H*.7,W*.4);x.fillStyle='#fffffff0';x.beginPath();x.arc(W/2,H*.44,s*.62,0,7);x.fill();BRD.paint(x,id,W/2-s/2,H*.44-s/2,s);
 x.fillStyle='#fff';let f=H*.12;x.font='bold '+f+'px Arial';while(x.measureText(b.n.toUpperCase()).width>W-40&&f>10){f-=3;x.font='bold '+f+'px Arial'}x.textAlign='center';x.textBaseline='middle';x.fillText(b.n.toUpperCase(),W/2,H*.88)}}
function txtCanvas(t,fg,bg,font){return(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle=fg;let f=H*.5;x.font=(font||'bold')+' '+f+'px Arial';while(x.measureText(t).width>W-24&&f>8){f-=2;x.font=(font||'bold')+' '+f+'px Arial'}x.textAlign='center';x.textBaseline='middle';x.fillText(t,W/2,H/2+f*.04)}}

/* ---------- the kit ---------- */
function Kit(C,k,o){const[x0,w,d]=RD[k],z0=RZ,h=H7;
 const rm=D.mkRoom(KEY(k),x0,z0,w,d,{floor:o.fl,wall:o.wl,h,name:o.name||NM[k]});if(!rm)return null;
 const R={rm,C,k,x0,z0,w,d,h,cx:x0+w/2,cz:z0+d/2,x1:x0+w,z1:z0+d,o,id:o.id,b:BRD.by(o.id),hd:HD[o.id]};
 const bx=(a,b,c,col,x,y,z,cl)=>rm.box(a,b,c,col,x,y,z,cl),gl=(a,b,c,col,x,y,z)=>rm.glow(a,b,c,col,x,y,z);R.bx=bx;R.gl=gl;R.pcol=pc(o.id);
 R.pl=(face,c,a,b,y0,y1,pw,ph,fn,rep)=>{const cv=document.createElement('canvas');cv.width=pw;cv.height=ph;fn(cv.getContext('2d'),pw,ph);const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;
  const g=new THREE.PlaneGeometry(Math.abs(b-a),y1-y0),m=new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide}),me=new THREE.Mesh(g,m);g.userData.dsOwn=1;m.userData.dsOwn=1;me.userData.dsOwn=1;(C.hqTex=C.hqTex||[]).push(tx);
  if(face=='z')me.position.set((a+b)/2,(y0+y1)/2,c);else{me.rotation.y=Math.PI/2;me.position.set(c,(y0+y1)/2,(a+b)/2)}rm.g.add(me);return me};
 R.fl=(x,z,w2,d2,fn,pw,rx,rz,y)=>{const cv=document.createElement('canvas');cv.width=cv.height=pw||256;fn(cv.getContext('2d'),cv.width,cv.height);const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(rx||1,rz||1);tx.anisotropy=4;
  const g=new THREE.PlaneGeometry(w2,d2),m=new THREE.MeshBasicMaterial({map:tx}),me=new THREE.Mesh(g,m);g.userData.dsOwn=1;m.userData.dsOwn=1;me.userData.dsOwn=1;(C.hqTex=C.hqTex||[]).push(tx);me.rotation.x=-Math.PI/2;
  /* v53.6.2: layered floor. The base floor sits at .03; every rug/mat/track gets its own height step, draw order and depth bias so overlapping ones never z-fight */
  if(y===.03){m.polygonOffset=true;m.polygonOffsetFactor=2;m.polygonOffsetUnits=2;me.renderOrder=0;y=.03}
  else{const n=R.dn=(R.dn||0)+1;y=.05+.015*n;m.depthWrite=false;m.polygonOffset=true;m.polygonOffsetFactor=-n;m.polygonOffsetUnits=-n;me.renderOrder=n}
  me.position.set(x+w2/2,y,z+d2/2);rm.g.add(me);return me};
 R.floor=(kind,col,col2)=>{const f=FT[kind]||FT.concrete,tw=kind=='checker'?6:kind=='marble'?8:5;R.fl(x0,z0,w,d,(x,W,H)=>f(x,W,H,col,col2),256,w/tw,d/tw,.03)};
 R.txt=(face,c,a,b,y0,y1,t,fg,bg)=>R.pl(face,c,a,b,y0,y1,512,Math.round(512*(y1-y0)/Math.abs(b-a))||64,txtCanvas(t,fg||'#fff',bg||'#111'));
 R.logoPanel=(face,c,a,b,y0,y1,kind)=>{const asp=Math.abs(b-a)/(y1-y0),pw=768;R.pl(face,c,a,b,y0,y1,pw,Math.round(pw/asp),logoCanvas(R.id,R.b,kind))};
 R.rug=(x,z,w2,d2,c1,c2)=>R.fl(x,z,w2,d2,(g,W,H)=>{g.fillStyle=c1;g.fillRect(0,0,W,H);g.strokeStyle=c2;g.lineWidth=10;g.strokeRect(14,14,W-28,H-28);g.lineWidth=3;g.strokeRect(34,34,W-68,H-68)},128,1,1,.05);
 R.win=(face,c,a,b,y0,y1,night)=>{const asp=Math.abs(b-a)/(y1-y0),mull=Math.max(3,Math.round(Math.abs(b-a)/2.4));R.pl(face,c,a,b,y0,y1,1024,Math.round(1024/asp),(x,W,H)=>skyline(x,W,H,mull,night));
  if(face=='z'){bx(Math.abs(b-a)+.4,.3,.5,'#30343c',(a+b)/2,y0-.12,c+.1);bx(Math.abs(b-a)+.4,.3,.4,'#30343c',(a+b)/2,y1+.1,c+.05)}else{bx(.5,.3,Math.abs(b-a)+.4,'#30343c',c+.1,y0-.12,(a+b)/2);bx(.4,.3,Math.abs(b-a)+.4,'#30343c',c+.05,y1+.1,(a+b)/2)}};
 R.slats=(face,c,a,b,y0,y1,col)=>{const n=Math.floor(Math.abs(b-a)/.2);bx(face=='z'?Math.abs(b-a):.1,y1-y0,face=='z'?.1:Math.abs(b-a),mix(col,'#000',.5),face=='z'?(a+b)/2:c+.02,(y0+y1)/2,face=='z'?c+.02:(a+b)/2);
  for(let i=0;i<n;i++){const t=a+(i+.5)*(b-a)/n,off=.18+.16*Math.sin(i*.28),sh=mix(col,i%3?'#000':'#fff',.06*(i%3));if(face=='z')bx(.13,y1-y0,.12+off,sh,t,(y0+y1)/2,c+.06+off/2);else bx(.12+off,y1-y0,.13,sh,c+.06+off/2,(y0+y1)/2,t)}
  if(face=='z')gl(Math.abs(b-a),.08,.2,'#ffe2a8',(a+b)/2,y1-.06,c+.3);else gl(.2,.08,Math.abs(b-a),'#ffe2a8',c+.3,y1-.06,(a+b)/2)};
 R.wallT=(kind,face,c,a,b,y0,y1)=>{const hd=R.hd,L=Math.abs(b-a),hh=y1-y0,pw=Math.min(1024,Math.round(L*80)),ph=Math.round(pw*hh/L);
  if(kind=='slats')R.slats(face,c,a,b,y0,y1,'#b98a56');
  else R.pl(face,c,a,b,y0,y1,pw,ph,(x,W,H)=>{if(kind=='brick')brickTex(x,W,H,mix(hd.wl,'#a05a3a',.5));else if(kind=='panels')panelTex(x,W,H,hd.wl,hd.ac);else if(kind=='marble')wallMarble(x,W,H,mix(hd.wl,'#000',.1),hd.ac);else{x.fillStyle=mix(hd.wl,'#fff',.35);x.fillRect(0,0,W,H);x.fillStyle=hd.ac+'30';for(let i=0;i<W;i+=W/6)x.fillRect(i,0,6,H)}})};
 R.ducts=(xa,xb,z,y)=>{bx(xb-xa,.5,.5,'#9aa0a8',(xa+xb)/2,y,z);bx(xb-xa,.36,.36,'#7a8088',(xa+xb)/2,y-.45,z+.12);for(let x=xa+2;x<xb;x+=5)bx(.06,.9,.06,'#555',x,y+.2,z)};
 R.ductsX=(za,zb,x,y)=>{bx(.5,.5,zb-za,'#9aa0a8',x,y,(za+zb)/2);bx(.36,.36,zb-za,'#7a8088',x+.12,y-.45,(za+zb)/2)};
 R.beam=()=>{};
 R.pend=(x,z,y,kind,col)=>{const lc=col||'#ffe9b0';bx(.03,.9,.03,'#222',x,y+.45,z);
  if(kind=='globe'){gl(.5,.5,.5,lc,x,y-.2,z);bx(.58,.58,.58,'#fff6dd',x,y-.2,z)}else if(kind=='cone'){bx(.7,.4,.7,'#2a2a2e',x,y,z);gl(.5,.1,.5,lc,x,y-.22,z)}else if(kind=='chand'){bx(.1,.5,.1,'#c9a24b',x,y+.2,z);gl(1.6,.12,1.6,lc,x,y-.3,z);gl(.9,.5,.9,'#fff2c0',x,y-.1,z);[[-.9,0],[.9,0],[0,-.9],[0,.9]].forEach(q=>gl(.14,.3,.14,lc,x+q[0],y-.4,z+q[1]))}else{gl(2.4,.1,.16,lc,x,y-.1,z);bx(2.5,.06,.2,'#222',x,y+.02,z)}};
 R.tree=(x,z,s)=>{s=s||1;bx(.7*s,.55*s,.7*s,'#8a5a3a',x,.28*s,z,1);bx(.12*s,1.4*s,.12*s,'#6a4a2a',x,1.2*s,z);const cl=['#2f7a4a','#3fa66a','#4a9a5a','#2a6a3e'];for(let i=0;i<6;i++){const a=i*2.1;bx((1.1-i*.07)*s,.5*s,(1.1-i*.07)*s,cl[i%4],x+Math.sin(a)*.25*s,(1.6+i*.38)*s,z+Math.cos(a)*.25*s)}};
 R.bush=(x,z,s)=>{s=s||1;bx(.9*s,.4*s,.9*s,'#8a5a3a',x,.2*s,z,1);bx(.9*s,.6*s,.9*s,'#3a8a4a',x,.7*s,z);bx(.6*s,.5*s,.6*s,'#4a9a5a',x,1.15*s,z)};
 R.chair=(x,z,col,f)=>{const sx=[0,0,1,-1][f],sz=[1,-1,0,0][f];bx(.5,.07,.5,col,x,.46,z);bx(sz?.5:.07,.5,sz?.07:.5,col,x-sx*.22,.75,z-sz*.22);bx(.05,.4,.05,'#444',x,.22,z);bx(.5,.04,.08,'#444',x,.03,z);bx(.08,.04,.5,'#444',x,.03,z)};
 R.desk=(x,z,w2,d2,top,leg)=>{bx(w2,.06,d2,top,x,.75,z,1);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>bx(.06,.72,.06,leg||'#333',x+q[0]*(w2/2-.06),.36,z+q[1]*(d2/2-.06)))};
 R.mon=(x,z,f,col)=>{bx(.62,.38,.04,'#16161a',x,1.12,z-f*.02);gl(.56,.32,.03,col||'#bfe0ff',x,1.12,z+f*.01);bx(.06,.18,.06,'#444',x,.9,z-f*.02)};
 R.pod=(x,z,top,chair,col)=>{[-1,1].forEach(s=>{R.desk(x,z+s*1.1,4.4,1.1,top);R.mon(x-1.1,z+s*1.1+s*.2,-s,col);R.mon(x+1.1,z+s*1.1+s*.2,-s,col);R.chair(x-1.1,z+s*1.95,chair,s>0?1:0);R.chair(x+1.1,z+s*1.95,chair,s>0?1:0);bx(.2,.2,.2,'#fff',x+.1,.88,z+s*1.1)});bx(4.4,.04,.06,'#555',x,.78,z)};
 R.sofa=(x,z,w2,col,f)=>{const al=f<2;const L=al?w2:1.1,Dp=al?1.1:w2,sx=[0,0,1,-1][f],sz=[1,-1,0,0][f];bx(L,.5,Dp,col,x,.3,z,1);bx(al?w2:.28,.7,al?.28:w2,col,x-sx*.5,.75,z-sz*.5);bx(al?.3:1.1,.6,al?1.1:.3,col,x-(al?w2/2-.15:0),.6,z-(al?0:w2/2-.15));bx(al?.3:1.1,.6,al?1.1:.3,col,x+(al?w2/2-.15:0),.6,z+(al?0:w2/2-.15))};
 R.table=(x,z,w2,d2,col,y,cl)=>{y=y||.75;bx(w2,.07,d2,col,x,y,z,cl!==0);bx(.14,y-.04,.14,'#2a2a30',x,(y-.04)/2,z)};
 R.ped=(x,z,id,sc,col)=>{bx(.9,1,.9,col||'#e8e8ec',x,.5,z,1);bx(.96,.06,.96,R.pcol,x,1.03,z);gl(.6,.03,.6,'#ffffff',x,.02,z);R.item(id,x,1.25,z,sc||1.6,.5);const g=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),new THREE.MeshBasicMaterial({color:'#bfe6ff',transparent:true,opacity:.18}));g.position.set(x,1.46,z);rm.g.add(g)};
 R.glass=(w2,h2,d2,x,y,z)=>{const g=new THREE.BoxGeometry(w2,h2,d2),m=new THREE.MeshBasicMaterial({color:'#bfe6ff',transparent:true,opacity:.22,depthWrite:false}),me=new THREE.Mesh(g,m);g.userData.dsOwn=1;m.userData.dsOwn=1;me.userData.dsOwn=1;me.position.set(x,y,z);rm.g.add(me);return me};
 R.item=(id,x,y,z,s,ry)=>{try{const g=BRD.item3d(id);g.position.set(x,y,z);g.scale.setScalar(s||1);g.rotation.y=ry||0;rm.g.add(g);return g}catch(e){}};
 R.npc=(x,z,ry,seat,pose)=>{try{const q=buildChar(fCfg());q.g.position.set(OX+x,seat?-.03:0,OZ+z);q.g.rotation.y=ry||0;if(seat){q.legs.forEach(l=>l.rotation.x=-1.5);q.arms.forEach(a=>a.rotation.x=-1.1)}else if(pose=='talk'){q.arms[1].rotation.x=-.9}scene.add(q.g);rm.extra.push(q.g)}catch(e){}};
 R.shoe=(x,y,z,col,sole)=>{bx(.5,.1,.9,sole||'#f4f1ea',x,y,z);bx(.46,.22,.6,col,x,y+.14,z-.1);bx(.4,.2,.28,col,x,y+.2,z+.28)};
 R.rack=(x,z,cols,face)=>{const al=face!='x';bx(.08,1.8,.08,'#888',x-(al?1.3:0),.9,z-(al?0:1.3));bx(.08,1.8,.08,'#888',x+(al?1.3:0),.9,z+(al?0:1.3));bx(al?2.7:.08,.08,al?.08:2.7,'#bbb',x,1.75,z);cols.forEach((c,i)=>{const t=-1.1+i*2.2/Math.max(1,cols.length-1);if(al)bx(.12,1,.5,c,x+t,1.15,z);else bx(.5,1,.12,c,x,1.15,z+t)})};
 /* real doors: dark architrave, two glass leaves with push bars, lit sign, sconces and a mat */
 R.door=(face,pos,label,tk)=>{const T=tk,fz=face=='z',hd=R.hd,ac=hd.ac,ink='#15171c',steel='#d4d8de',gcol='#9cc6dc';
  const B=(u,y,v,su,sh,sv,col,g)=>{const a=fz?[su,sh,sv,u,v]:[sv,sh,su,v,u];(g?gl:bx)(a[0],a[1],a[2],col,fz?u:x0+v,y,fz?z0+v:u)};
  const W=fz?z0:x0;
  B(pos,1.6,.12,2.5,3.3,.2,'#07080b');                                         /* dark recess */
  B(pos,1.7,.2,2.5,3.2,.04,mix(ac,'#fff',.55),1);                              /* light spilling from the next room */
  [-.57,.57].forEach(s=>{const u=pos+s;
   B(u,1.62,.34,1.1,3.2,.12,ink);                                              /* leaf frame */
   B(u,2.08,.42,.86,2.3,.06,gcol,1);                                           /* glass */
   B(u,.5,.4,.86,.78,.06,mix(R.pcol,'#000',.3));                               /* lower panel */
   B(u,.1,.42,.9,.12,.1,steel);                                                /* kick plate */
   B(u,1.62,.43,1,.05,.07,ink);                                                /* mid rail */
   B(pos+s*.22,1.5,.5,.06,.9,.08,steel);                                        /* push bar */
  });
  B(pos,1.62,.44,.05,3.1,.08,ink);                                             /* meeting stile */
  [-1,1].forEach(s=>{B(pos+s*1.3,1.75,.3,.4,3.5,.45,ink);B(pos+s*1.1,1.75,.54,.05,3.4,.06,ac,1);B(pos+s*2.1,2.7,.2,.18,.42,.22,'#222');B(pos+s*2.1,2.7,.32,.1,.3,.06,'#ffe9b0',1)});  /* posts, accent line, sconces */
  B(pos,3.5,.3,3,.4,.45,ink);B(pos,4.16,.3,2.9,.66,.3,'#0c0d10');B(pos,3.78,.46,2.6,.05,.08,ac,1);   /* lintel + lit sign box */
  R.txt(face,W+.47,pos-1.3,pos+1.3,3.86,4.46,label,'#fff',mix(R.pcol,'#000',.3));
  B(pos,.05,1.2,2.8,.07,1.6,mix(R.pcol,'#000',.35));B(pos,.09,1.2,2.4,.02,1.2,ac,1);  /* mat */
  rm.int(fz?pos:x0+2,fz?z0+2:pos,2.2,'Go to '+label,()=>go(T))};
 /* trim on the two tall walls: skirting, chair rail, crown */
 R.trim=()=>{const lo=mix(R.o.wl,'#000',.55),mid=mix(R.o.wl,'#fff',.22),hi=mix(R.o.wl,'#fff',.4);
  bx(w-.2,.32,.1,lo,R.cx,.16,z0+.05);bx(w-.2,.07,.07,mid,R.cx,1.12,z0+.04);bx(w-.2,.24,.16,hi,R.cx,h-.12,z0+.08);bx(w-.2,.05,.1,mix(R.hd.ac,'#000',.2),R.cx,h-.3,z0+.05);
  bx(.1,.32,d-.2,lo,x0+.05,.16,R.cz);bx(.07,.07,d-.2,mid,x0+.04,1.12,R.cz);bx(.16,.24,d-.2,hi,x0+.08,h-.12,R.cz);bx(.1,.05,d-.2,mix(R.hd.ac,'#000',.2),x0+.05,h-.3,R.cz)};
 R.trim();
 R.finish=()=>{const ac=R.hd.ac,warm='#ffe2a8',x1=R.x1,z1=R.z1;gl(w-.6,.05,.1,warm,R.cx,h-.34,z0+.14);gl(.1,.05,d-.6,warm,x0+.14,h-.34,R.cz);
  {const iy=.05+.015*((R.dn||0)+1)+.02;gl(w-2.4,.02,.12,ac,R.cx,iy,z0+1.1);gl(.12,.02,d-2.4,ac,x0+1.1,iy,R.cz);gl(w-2.4,.02,.12,ac,R.cx,iy,z1-1.1);gl(.12,.02,d-2.4,ac,x1-1.1,iy,R.cz)}
  const n=Math.max(2,Math.floor((w-6)/8));for(let i=0;i<n;i++){const x=x0+4+(w-8)*(i+.5)/n;bx(1.1,.55,.9,'#2a2c32',x,.28,z1-.65);R.bush(x,z1-.65,1)}
  for(const [px,pz] of [[x1-.7,z0+.8],[x1-.7,z1-.7]]){bx(.35,.1,.35,'#2a2c32',px,.05,pz);bx(.06,1.7,.06,'#333',px,.9,pz);bx(.5,.38,.5,warm,px,1.9,pz)}};
 return R}
function go(k){const C=D.C,rm=C&&C.rooms[KEY(k)];if(!rm){snd('err');return say('That part of the building is closed today.')}
 const[x0,w,d]=RD[k];let x=x0+2.8,z=RZ+d-6,r=Math.PI/2;if(k=='lobby'){x=x0+w/2;z=RZ+d-3;r=Math.PI}
 D.fade(()=>D.goRoom(KEY(k),x,z,r),()=>{})}
BRD.hqEnter=()=>go('lobby');
BRD.hqGo=go;
const door=(R,face,pos,k)=>R.door(face,pos,NM[k],k);

/* ---------- lobby ---------- */
function lobby(R){const{x0,z0,w,d,cx,x1,z1,hd,b,id,pcol}=R,bx=R.bx,gl=R.gl,ac=hd.ac;
 R.floor(hd.ff,hd.fl,mix(hd.fl,'#000',.35));
 /* back wall: windows at the sides, giant logo wall in the middle, doors */
 R.wallT(hd.of,'z',z0+.05,x0+1,x0+10.5,.1,H7);R.wallT(hd.of,'z',z0+.05,x1-10.5,x1-1,.1,H7);
 R.logoPanel('z',z0+.1,cx-9,cx+9,1.2,6.6);bx(18.6,.25,.3,'#1a1a1e',cx,6.75,z0+.2);bx(18.6,.25,.3,'#1a1a1e',cx,1.08,z0+.2);bx(.25,5.7,.3,'#1a1a1e',cx-9.2,3.9,z0+.2);bx(.25,5.7,.3,'#1a1a1e',cx+9.2,3.9,z0+.2);
 for(let i=0;i<7;i++){gl(.5,.14,.5,'#fff6d8',cx-8+i*2.67,7,z0+.9);}
 door(R,'z',x0+5.3,'office');door(R,'z',x1-5.3,'cafe');
 R.wallT(hd.of,'x',x0+.05,z0+1,z0+d-1,.1,H7);
 door(R,'x',z0+8,'show');door(R,'x',z0+14,'board');door(R,'x',z0+20.5,'brand');
 R.ducts(x0+1,x1-1,z0+.6,H7-.7);R.ductsX(z0+1,z0+d-1,x0+.6,H7-.7);
 /* reception desk (curved) with the logo on the front */
 const rz=z0+8.5;bx(8,1.15,1.3,mix(hd.wl,'#000',.25),cx,.58,rz,1);bx(8.2,.08,1.5,hd.ac2,cx,1.18,rz);gl(7.8,.05,.1,ac,cx,1.24,rz+.5);
 [-1,1].forEach(s=>{bx(1.3,1.15,2.6,mix(hd.wl,'#000',.25),cx+s*4.6,.58,rz+1.3,1);bx(1.5,.08,2.8,hd.ac2,cx+s*4.6,1.18,rz+1.3);gl(.1,.05,2.4,ac,cx+s*4.2,1.24,rz+1.3)});
 R.pl('z',rz+.67,cx-1.3,cx+1.3,.2,1.1,256,100,logoCanvas(id,b));R.mon(cx-2.2,rz-.2,-1);R.mon(cx+2.2,rz-.2,-1);R.npc(cx-1.2,rz-1.2,0);R.npc(cx+1.5,rz-1.2,0);bx(.5,.5,.5,'#222',cx,.25,rz-1.1);
 /* the logo sculpture on a lit plinth */
 const sx=cx,sz=z0+16;R.rug(sx-5,sz-5,10,10,mix(hd.wl,hd.ac,.2),ac);bx(5,.4,5,'#d8dadf',sx,.2,sz,1);bx(4.2,.3,4.2,'#f2f2f4',sx,.55,sz);gl(4.6,.05,4.6,ac,sx,.42,sz);bx(2.4,2.4,2.4,pcol,sx,2.0,sz,1);
 [[0,1.22],[0,-1.22]].forEach(q=>R.pl('z',sz+q[1],sx-1,sx+1,1,3,128,128,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,128,128);BRD.paint(x,id,8,8,112)}));[[1.22,1],[-1.22,1]].forEach(q=>R.pl('x',sx+q[0],sz-1,sz+1,1,3,128,128,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,128,128);BRD.paint(x,id,8,8,112)}));
 gl(2.2,.15,2.2,'#fff',sx,3.3,sz);
 /* product plinths along the right side */
 for(let i=0;i<4;i++)R.ped(x1-3.2,z0+7+i*4.2,id,1.7,'#eceef2');
 /* lounge front-left */
 R.rug(x0+7,z0+21.5,10,5.5,mix(hd.wl,hd.ac2,.35),hd.ac);R.sofa(x0+12,z0+25,5,hd.ch,1);R.sofa(x0+8,z0+22,3.2,mix(hd.ch,'#000',.2),2);R.sofa(x0+16.2,z0+22,3.2,mix(hd.ch,'#000',.2),3);R.table(x0+12,z0+22,2.4,1.4,'#dcdcdc',.45);R.tree(x0+6,z0+26,1.3);R.tree(x0+18,z0+26,1.3);
 R.npc(x0+10.5,z0+24.2,Math.PI,1);R.npc(x0+13.5,z0+24.2,Math.PI,1);
 /* right waiting area */
 R.sofa(x1-3.4,z0+21,4,mix(hd.ch,hd.ac2,.4),3);R.sofa(x1-3.4,z0+25,3,mix(hd.ch,hd.ac2,.4),3);R.table(x1-6,z0+23,1.2,2,'#d6d6da',.45);
 [x0+3,x1-3].forEach(x=>R.tree(x,z0+3,1.6));
 R.tree(cx-11,z0+3.5,1.5);R.tree(cx+11,z0+3.5,1.5);
 for(let i=0;i<5;i++)R.pend(cx-8+i*4,z0+12+(i%2)*3,H7-1.4,hd.lamp,'#ffe9b0');
 R.beam(cx-9,z0,z0+14,H7-.4);R.beam(cx+9,z0,z0+14,H7-.4);
 R.npc(x0+3.5,z0+d-3.5,Math.PI/2);R.npc(cx+6,z0+14,Math.PI,0,'talk');R.npc(cx+7.2,z0+14.6,-Math.PI/2);
 R.rm.int(cx,z0+d-1.2,2.2,'Go back outside',()=>{const h=R.C.hq;D.fade(()=>D.goOut(h?h.out.x:R.C.air.x1+10,h?h.out.z:R.C.mid+1.5,0))});
 R.rm.int(x1-3.4,z0+d-2,2,'Company car to the airport',()=>D.fade(()=>D.goOut(R.C.air.x1+10,R.C.mid+1.5,Math.PI/2),()=>say(b.n+' sends a car: it drops you at the airport.')));
 R.rm.int(cx,rz+2.1,2.2,'Ask reception',()=>{const j=BRD.active();say(j&&j.d==R.C.id?'Reception: "Welcome to '+b.n+'. Doors: the Open office and Cafe at the back, Showroom, Boardroom and the photo Studio on the left. Your shoot is in the Studio."':'Reception: "Thanks for visiting."')});
 R.rm.int(sx,sz+3.4,2.4,'Read the plaque',()=>say(b.n+': founded '+hd.yr+'. "Wear it, hold it, show it." (The brand loves it when you use the product in the shoot.)'))}

/* ---------- open office ---------- */
function office(R){const{x0,z0,w,d,cx,x1,z1,hd,b,id,pcol}=R,bx=R.bx,gl=R.gl;
 {const nt=hd.ff!='wood'&&hd.ff!='tile';R.floor(nt?'concrete':hd.ff,nt?'#b4b4b8':hd.fl,mix(hd.fl,'#000',.3))}
 R.win('z',z0+.08,x0+2,x1-2,1,6.6,false);R.ducts(x0+1,x1-1,z0+.7,H7-.4);
 R.wallT(hd.of=='glass'?'slats':hd.of,'x',x0+.05,z0+1,z0+d-1,.1,H7);R.logoPanel('x',x0+.12,z0+9,z0+21,1.8,5.6,'dark');
 door(R,'x',z0+d-6,'lobby');
 const top='#e8e2d6';for(let c=0;c<4;c++)for(let r=0;r<2;r++){const px=x0+9+c*9.4,pz=z0+8.5+r*9;R.pod(px,pz,top,hd.ch,r?'#bfe0ff':'#ffd98a');if((c+r)%2==0){R.npc(px-1.1,pz-1.9,0,1);R.npc(px+1.1,pz+1.9,Math.PI,1)}else R.npc(px-1.1,pz+1.9,Math.PI,1)}
 for(let c=0;c<4;c++)R.pend(x0+9+c*9.4,z0+13,H7-1.6,hd.lamp,'#ffe9b0');
 [0,1,2,3].forEach(i=>R.beam(x0+4.5+i*9.4,z0,z0+26,H7-.3));
 for(let c=0;c<5;c++)R.bush(x0+4+c*9.4,z0+4.2,1.3);R.tree(x0+3,z1-3,1.5);R.tree(x1-3,z0+4,1.5);
 /* glass meeting box (back right) */
 const mx=x1-8,mz=z0+4.5;[[0,-3.6,8,.1],[0,3.6,8,.1]].forEach(q=>R.glass(q[2],2.6,q[3],mx+q[0],1.4,mz+q[1]));R.glass(.1,2.6,7.2,mx-4,1.4,mz);R.glass(.1,2.6,7.2,mx+4,1.4,mz);[-4,4].forEach(xx=>[-3.6,3.6].forEach(zz=>bx(.14,2.7,.14,'#30343c',mx+xx,1.4,mz+zz)));
 [-3.6,3.6].forEach(zz=>bx(8.2,.1,.14,'#30343c',mx,2.75,mz+zz));R.table(mx,mz,4,1.6,'#5a4630',.75);for(let i=0;i<3;i++){R.chair(mx-1.4+i*1.4,mz-1.3,hd.ch,0);R.chair(mx-1.4+i*1.4,mz+1.3,hd.ch,1)}
 gl(3,1.4,.08,mix(pcol,'#fff',.4),mx,2,mz-3.35);R.npc(mx-1.4,mz+1.5,Math.PI,1);R.npc(mx+1.4,mz-1.5,0,1);
 /* lounge corner, kitchenette, whiteboards and phone booths */
 R.rug(x1-12,z1-9,9,7,mix(hd.wl,hd.ac,.25),hd.ac);R.sofa(x1-8,z1-4.5,5,hd.ch,1);R.sofa(x1-11.5,z1-7,3,mix(hd.ch,'#000',.25),2);R.table(x1-8,z1-7,2.2,1.2,'#ddd',.45);
 bx(6,1,1,'#d8dadf',x1-5,.5,z0+16,1);bx(6,.1,1.1,'#444',x1-5,1.02,z0+16);bx(1,2.2,1,'#e8e8ec',x1-1.6,1.1,z0+16,1);gl(.5,.3,.05,hd.ac,x1-1.6,1.6,z0+16.55);
 [0,1,2].forEach(i=>{bx(1.6,2.4,1.6,[hd.ac,hd.ac2,'#e8e8ec'][i],x0+3.5+i*2.4,1.2,z0+2.6,1);gl(1.1,1.6,.05,'#bfe0ff',x0+3.5+i*2.4,1.3,z0+3.43)});
 [[x0+4,z0+24],[x0+4,z0+27]].forEach(q=>{bx(.08,2.2,.08,'#999',q[0]-1,1.1,q[1]);bx(.08,2.2,.08,'#999',q[0]+1,1.1,q[1]);bx(2.1,1.3,.05,'#f4f4f4',q[0],1.5,q[1]);gl(.8,.05,.06,hd.ac,q[0],1.4,q[1]+.04)});
 R.npc(x0+5,z0+21.5,0,0,'talk');R.npc(x0+5.8,z0+22.2,-Math.PI/2);R.npc(x1-6,z0+17.5,Math.PI);}

/* ---------- cafe ---------- */
function cafe(R){const{x0,z0,w,d,cx,x1,z1,hd,b,id,pcol}=R,bx=R.bx,gl=R.gl,k=hd.cf,ac=hd.ac;
 R.floor(k=='diner'?'checker':hd.ff=='rubber'||hd.ff=='carpet'?'wood':hd.ff=='tile'?'tile':hd.ff,k=='diner'?'#f4f0e8':hd.fl,k=='diner'?hd.ac:mix(hd.fl,'#000',.3));
 R.win('z',z0+.08,x0+2,x1-2,1.2,6.2,k=='lounge'||k=='bar');R.ducts(x0+1,x1-1,z0+.7,H7-.4);R.wallT(hd.of=='glass'?'brick':hd.of,'x',x0+.05,z0+1,z0+d-1,.1,H7);
 door(R,'x',z0+d-6,'lobby');
 R.pl('x',x0+.12,z0+4,z0+11,2,5.6,512,350,(x,W,H)=>{x.fillStyle='#16181c';x.fillRect(0,0,W,H);x.fillStyle=pcol;x.fillRect(10,10,W-20,50);x.fillStyle='#fff';x.font='bold 30px Arial';x.textAlign='center';x.fillText(b.n.toUpperCase()+' '+(k=='diner'?'DINER':k=='bar'?'ENERGY BAR':k=='juice'?'JUICE BAR':k=='lounge'?'LOUNGE':'COFFEE'),W/2,45);x.font='24px Arial';x.textAlign='left';['Signature drink  3.50','Team sandwich  6.00','House special  5.50','Cookie of the day  2.00','Fresh fruit  3.00'].forEach((t,i)=>x.fillText(t,28,110+i*46))});
 /* counter along the back wall */
 const cz=z0+3.2;bx(16,1.1,1.2,mix(hd.wl,'#000',.3),cx,.55,cz,1);bx(16.2,.08,1.4,hd.ac2,cx,1.14,cz);gl(15.8,.05,.1,ac,cx,1.2,cz+.55);for(let i=0;i<6;i++)R.chair(cx-6+i*2.4,cz+1.6,ac,1),bx(.05,.4,.05,'#999',cx-6+i*2.4,.2,cz+1.6);
 bx(1.4,.6,.8,'#c8ccd2',cx-6,1.5,cz-.1);bx(1.8,.4,.8,'#16161a',cx-3.6,1.4,cz-.1);gl(.4,.3,.06,'#9aff9a',cx-3.6,1.5,cz+.3);
 R.npc(cx-1,cz-1.1,0);R.npc(cx+4,cz-1.1,0);
 if(k=='diner'){R.item(id=='cocacola'?'cocacola':id,cx+3,1.2,cz,3,0);for(let i=0;i<3;i++){bx(.4,1.1,3.2,hd.ac2,x1-1.1,.75,z0+9+i*4.2,1);bx(1.2,.5,1.2,hd.ac,x1-2.3,.3,z0+8.2+i*4.2);bx(1.2,.5,1.2,hd.ac,x1-2.3,.3,z0+9.8+i*4.2);R.table(x1-3.3,z0+9+i*4.2,1,2.2,'#f1f1f1',.78,0)}bx(1.2,2.2,1,'#2a2a30',x0+4,1.1,z1-4,1);gl(.9,1.2,.06,ac,x0+4,1.5,z1-3.5);gl(.7,.3,.06,'#ffd84a',x0+4,2.4,z1-3.5)}
 else if(k=='bar'){for(let i=0;i<5;i++){bx(1.4,2.2,1.1,'#d8dadf',x0+8+i*2.2,1.1,z0+1.3,1);gl(1.1,1.8,.06,ac,x0+8+i*2.2,1.2,z0+1.88)}for(let i=0;i<8;i++)gl(.08,.08,3,ac,x0+3+i*3.6,.05,z0+14);for(let i=0;i<3;i++)R.table(cx-5+i*5,z0+13,1,1,'#222',1.2),bx(.04,1.1,.04,'#888',cx-5+i*5,.6,z0+13+0)}
 else if(k=='juice'){for(let i=0;i<5;i++)bx(.9,.5,.9,['#f2a02a','#e0402a','#7ac43a','#e8c040','#c04a8a'][i],cx-5+i*2.2,.3,cz+.4);for(let i=0;i<3;i++){R.table(cx-6+i*6,z0+11,1.2,1.2,'#f2f2f2',1.05);bx(.05,1.05,.05,'#999',cx-6+i*6,.5,z0+11);R.chair(cx-6.8+i*6,z0+11,ac,0);R.chair(cx-5.2+i*6,z0+11,ac,0)}}
 else if(k=='lounge'){R.rug(cx-8,z0+8,16,10,mix(hd.wl,hd.ac,.2),ac);R.sofa(cx-4,z0+16,6,hd.ch,1);R.sofa(cx+4,z0+16,6,hd.ch,1);R.sofa(cx-8.5,z0+12,4,mix(hd.ch,'#000',.2),2);R.sofa(cx+8.5,z0+12,4,mix(hd.ch,'#000',.2),3);R.table(cx,z0+12,3.2,2,'#ddd',.45);R.pend(cx,z0+12,H7-1.8,'chand','#ffe9b0')}
 else{for(let r=0;r<2;r++)for(let c=0;c<3;c++){const tx=cx-7+c*7,tz=z0+9+r*5;R.table(tx,tz,1.4,1.4,'#e8e2d6',.75);R.chair(tx-1,tz,hd.ch,2);R.chair(tx+1,tz,hd.ch,3);R.chair(tx,tz-1,hd.ch,0)}bx(2,.9,.7,'#d8dadf',x1-3,.45,z0+7,1);for(let i=0;i<4;i++)bx(.3,.18,.3,['#e8a050','#a06a3a','#f2d48a','#7a4a2a'][i],x1-3.5+i*.45,1,z0+7)}
 for(let i=0;i<4;i++)R.pend(cx-7.5+i*5,z0+9,H7-1.6,hd.lamp=='tube'?'tube':'globe','#ffe9b0');R.beam(cx-7.5,z0,z0+14,H7-.4);R.beam(cx+7.5,z0,z0+14,H7-.4);
 R.tree(x1-2.5,z0+3,1.5);R.tree(x0+3,z0+3,1.4);R.bush(x1-2.5,z1-2.5,1.4);
 [[cx-9,z1-5],[cx+1,z1-5],[cx+9,z1-5]].forEach(q=>{R.table(q[0],q[1],1.4,1.4,'#e8e2d6',.75);R.chair(q[0]-1,q[1],hd.ch,2);R.chair(q[0]+1,q[1],hd.ch,3);R.npc(q[0]-1,q[1],Math.PI/2,1)})}

/* ---------- boardroom ---------- */
function board(R){const{x0,z0,w,d,cx,x1,z1,hd,b,id,pcol}=R,bx=R.bx,gl=R.gl;
 R.floor('carpet',mix(hd.wl,'#000',.35),0);R.win('z',z0+.08,x0+2,x1-2,1.2,6.2,true);R.ducts(x0+1,x1-1,z0+.7,H7-.4);
 R.slats('x',x0+.05,z0+1,z1-1,.1,H7,'#7a5636');R.logoPanel('x',x0+.35,z0+5,z0+13,2.2,5.4,'dark');door(R,'x',z0+d-5,'lobby');
 const tz=z0+10;R.rug(cx-8,tz-4,16,8,mix(hd.wl,'#000',.4),hd.ac);bx(11,.12,3,'#1a1410',cx,.78,tz,1);bx(11.2,.05,3.2,hd.ac,cx,.72,tz);for(let i=-2;i<=2;i++){bx(.5,.7,.5,'#111',cx+i*2,.35,tz);gl(.5,.04,.3,'#cfe8ff',cx+i*2,.83,tz)}
 for(let i=0;i<5;i++){R.chair(cx-4.4+i*2.2,tz-2.1,'#1a1a1e',0);R.chair(cx-4.4+i*2.2,tz+2.1,'#1a1a1e',1)}R.chair(cx-6,tz,'#1a1a1e',2);R.chair(cx+6,tz,'#1a1a1e',3);
 [[cx-3,tz+2.1,Math.PI],[cx+1,tz-2.1,0],[cx-5.8,tz,-Math.PI/2],[cx+2.2,tz+2.1,Math.PI]].forEach(q=>R.npc(q[0],q[1],q[2],1));
 /* presentation screen on the back wall */
 R.pl('z',z0+.25,cx-4,cx+4,1.6,4.6,512,288,(x,W,H)=>{x.fillStyle='#0c0f14';x.fillRect(0,0,W,H);x.fillStyle=pcol;x.fillRect(0,0,W,40);x.fillStyle='#fff';x.font='bold 24px Arial';x.textAlign='left';x.fillText(b.n+' · Quarterly results',14,28);const r=rnd(hsh(id));for(let i=0;i<8;i++){const hh=40+r()*150;x.fillStyle=i%2?'#ffffff':hd.ac;x.fillRect(30+i*52,H-20-hh,34,hh)}BRD.paint(x,id,W-90,50,70)});
 bx(8.4,.2,.3,'#222',cx,4.8,z0+.35);bx(8.4,.2,.3,'#222',cx,1.5,z0+.35);
 /* trophy shelves and a sofa corner */
 bx(.6,2.8,6,'#2a1c12',x1-1.5,1.4,z0+6,1);for(let i=0;i<4;i++)for(let j=0;j<4;j++){bx(.4,.4,.4,[hd.ac,'#e2b422','#e8e8ec'][(i+j)%3],x1-1.5,.4+i*.65,z0+3.6+j*1.5)}
 R.sofa(x1-3,z1-3.5,4.5,mix(hd.ch,'#000',.2),1);R.table(x1-8,z1-3.5,1.4,1.4,'#222',.45);R.tree(x0+3,z0+3,1.4);R.tree(x1-3,z1-8,1.5);
 for(let i=0;i<3;i++)R.pend(cx-4+i*4,tz,H7-1.7,'chand'==hd.lamp?'chand':'cone','#ffe9b0');R.beam(cx-6,z0,z0+14,H7-.4);R.beam(cx+6,z0,z0+14,H7-.4);
 bx(3,.9,1.4,'#1a1410',x0+5,.45,z1-3,1);R.chair(x0+5,z1-4.5,'#1a1a1e',1);R.item(id,x0+5,1,z1-3,1.4,0)}

/* ---------- photo studio ('brand') ---------- */
function studio(R,sp){const{x0,z0,w,d,cx,x1,z1,hd,b,id,pcol}=R,bx=R.bx,gl=R.gl,pc2=sp.nc;
 R.floor('concrete','#a4a6ac',0);bx(w,.06,d,'#a4a6ac',cx,.03,z0+d/2);
 /* the painted backdrop, large */
 R.pl('z',z0+.1,x0+6,x1-6,.4,6.4,1024,360,(c,W,H)=>{c.save();c.scale(W/640,H/224);sp.bk(c,640,224);c.restore()});bx(w-12,.14,.14,'#111',cx,6.6,z0+.3);for(let i=0;i<9;i++)gl(.5,.14,.4,'#fff6d8',x0+7+i*(w-14)/8,6.5,z0+.34);
 R.wallT(hd.of=='glass'?'panels':hd.of,'z',z0+.05,x0+1,x0+6,.1,H7);R.wallT(hd.of=='glass'?'panels':hd.of,'z',z0+.05,x1-6,x1-1,.1,H7);
 R.wallT('panels','x',x0+.05,z0+1,z1-1,.1,H7);door(R,'x',z0+d-6,'lobby');R.logoPanel('x',x0+.12,z0+4,z0+12,2.2,5.8,'dark');R.ducts(x0+1,x1-1,z0+.8,H7-.5);
 /* set: platform, sweep of colour, big umbrellas and stands */
 bx(15,.12,8,mix(sp.fl,'#000',.3),cx,.08,z0+7.4);bx(13,.14,6,sp.wl==sp.fl?'#cccccc':sp.wl,cx,.1,z0+7.4);gl(13.4,.04,.12,pc2,cx,.18,z0+10.3);
 [[-8.6,8],[8.6,8],[-6,11.4],[6,11.4]].forEach(([dx,dz],i)=>{bx(.14,2.8,.14,'#222',cx+dx,1.4,z0+dz,1);bx(1.5,1.4,.3,'#2c2f38',cx+dx,3.3,z0+dz+.1);gl(1.2,1.1,.1,i<2?'#fffbe8':mix(pc2,'#fff',.5),cx+dx,3.3,z0+dz+.3);[-1,1].forEach(s=>bx(.04,.04,1,'#222',cx+dx+s*.4,.03,z0+dz))});
 bx(w-12,.08,.08,'#222',cx,5.3,z0+8);for(let i=0;i<7;i++){bx(.4,.3,.4,'#222',cx-6+i*2,5.1,z0+8);gl(.3,.1,.3,'#fff6d8',cx-6+i*2,4.92,z0+8)}
 /* camera, photographer, monitors, make-up and wardrobe */
 [[-.5,-.4],[.5,-.4],[0,.5]].forEach(([a,c2])=>bx(.07,1.5,.07,'#222',cx+a,.75,z0+15.6+c2));bx(.5,.36,.5,'#1a1a1e',cx,1.62,z0+15.6);bx(.26,.26,.5,'#333',cx,1.62,z0+15.2);gl(.18,.18,.05,'#7ab8ff',cx,1.62,z0+14.9);
 R.npc(cx+1.2,z0+16.4,Math.PI);R.npc(x0+10,z0+15,Math.PI/2);R.npc(x1-9,z0+14,-Math.PI/2);
 R.desk(cx+8,z0+16,3,1,'#222');R.mon(cx+7.2,z0+16.3,-1,'#7ab8ff');R.mon(cx+8.8,z0+16.3,-1,'#ffd98a');R.chair(cx+8,z0+17.2,'#222',1);
 bx(1.2,.5,.5,'#2a2a30',x1-3,.5,z1-3,1);bx(.12,2.2,2.4,'#3a3a40',x1-1.6,1.3,z1-4);bx(.04,1.9,2.1,'#cfe6f4',x1-1.7,1.3,z1-4);for(let i=0;i<6;i++)gl(.08,.1,.1,'#fff2c0',x1-1.8,.4+i*.35,z1-5);R.chair(x1-3,z1-4,'#222',3);
 R.rack(x0+4,z0+19,[pc2,'#f4f4f4',pcol,'#222',pc2],'x');R.rack(x0+4,z0+22.5,['#f4f4f4',pcol,'#222'],'x');R.table(x0+9,z1-3.5,3,1.2,'#ddd',.8);R.item(id,x0+8.2,.95,z1-3.5,1.6,.3);R.item(id,x0+9.8,.95,z1-3.5,1.6,-.3);
 R.sofa(x1-8,z1-3,5,hd.ch,1);R.tree(x1-3,z0+3,1.5);R.tree(x0+3,z0+3,1.4);R.bush(cx+11,z0+14,1.2);
 /* light floor tile in the brand colour by the door and the interactions */
 bx(4,.05,1.6,pc2,cx,.05,z1-.9);
 R.rm.int(cx,z0+13.3,3,'Start the photoshoot',()=>{const j=BRD.active();if(!j||j.d!=R.C.id){snd('err');return say('There is no shoot booked here today.')}BRD.begin(j)});
 R.rm.int(cx,z1-1.2,2,'Back to the lobby',()=>go('lobby'));R.rm.int(x1-4,z1-5,2,'Make-up chair',()=>say('Make-up: "You look great. The camera is by the lights; pose, light and wear the '+b.n+' product."'));
 R.rm.int(x0+4,z0+17,2.2,'Wardrobe rack',()=>say('Wardrobe: "You will wear or hold the '+b.n+' product in the shoot. Pick in the Pose tab."'))}

BRD.hqBuild=function(C,o){const id=o.b,sp=BRD.studios&&BRD.studios[id];if(!HD[id])throw new Error('no HD for '+id);let n=0;
 /* dark plinth under and around all six rooms, so no grass or void shows past the low front and right walls */
 try{const g=new THREE.BoxGeometry(470,.3,260),m=new THREE.MeshBasicMaterial({color:'#1b1d23'}),me=new THREE.Mesh(g,m);g.userData.dsOwn=1;m.userData.dsOwn=1;me.userData.dsOwn=1;me.position.set(OX+1500,-.14,OZ+RZ+10);scene.add(me);(C.extra=C.extra||[]).push(me)}catch(e){console.error('hq plinth',e)}
 const mk=(k,fn,ex)=>{try{const R=Kit(C,k,Object.assign({id,fl:HD[id].fl,wl:HD[id].wl,name:BRD.by(id).n+' '+NM[k].toLowerCase()},ex||{}));if(!R)return;if(k!='lobby')R.floor0=1;fn(R);try{R.finish()}catch(e){console.error('finish',k,e)}R.rm.done();n++}catch(e){console.error('hq room '+k,e)}};
 mk('office',office);mk('cafe',cafe);mk('board',board);mk('show',R=>(SHOW[id]||SHOW.generic)(R));mk('brand',R=>studio(R,sp),{name:BRD.by(id).n+' HQ studio'});mk('lobby',lobby);
 if(!n)throw new Error('no rooms built')};

/* ---------- outside: logo monument, banners and a rooftop billboard (called from build() in 225-brand-hq.js) ---------- */
BRD.hqExterior=function(c,H,ex,fz,mx,b){const C=c.C,G=c.G,Gw=c.Gw,id=b.id,col=pc(id),hd=HD[id];if(!hd)return;
 const plane=(wid,hei,x,y,z,pw,ph,fn)=>{const cv=document.createElement('canvas');cv.width=pw;cv.height=ph;fn(cv.getContext('2d'),pw,ph);const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;(C.hqTex=C.hqTex||[]).push(tx);
  const g=new THREE.PlaneGeometry(wid,hei),m=new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide}),me=new THREE.Mesh(g,m);g.userData.dsOwn=1;m.userData.dsOwn=1;me.userData.dsOwn=1;me.position.set(x,y,z);C.g.add(me);return me};
 const box=(w2,h2,d2,cc,x,y,z)=>xgBox(G,w2,h2,d2,cc,x,y,z),glow=(w2,h2,d2,cc,x,y,z)=>xgBox(Gw,w2,h2,d2,cc,x,y,z);
 /* monument on the forecourt, left of the red carpet */
 const mxl=Math.max(ex[0]+3.4,mx-7),mz=fz+2.7;box(3.6,.3,2.4,'#d0d3d8',mxl,.15,mz);box(3.2,.22,2,'#eceef2',mxl,.4,mz);box(2.6,3,.4,col==='#3a3a48'?hd.ac:col,mxl,2.0,mz);glow(3.8,.05,2.6,hd.ac,mxl,.06,mz);
 [1,-1].forEach(s=>plane(2.3,2.5,mxl,2.0,mz+s*.22,256,256,logoCanvas(id,b)).rotation.y=s>0?0:Math.PI);glow(2.8,.1,.4,'#fff6d8',mxl,3.55,mz);
 /* banners on the front wall */
 [ex[0]+2.4,ex[1]-2.4].forEach(x=>{box(1.9,.12,.14,'#222',x,6.9,fz+.35);plane(1.7,4.6,x,4.5,fz+.3,256,680,logoCanvas(id,b));box(1.9,.12,.14,'#222',x,2.15,fz+.35)});
 /* billboard on the roof */
 const bz=(c.zb+c.zf)/2,by=H+.3;box(.3,2.6,.3,'#2a2c32',mx-3.2,by+1.3,bz);box(.3,2.6,.3,'#2a2c32',mx+3.2,by+1.3,bz);box(8.2,4.2,.35,'#14161c',mx,by+4.4,bz);
 [1,-1].forEach(s=>plane(7.8,3.8,mx,by+4.4,bz+s*.2,768,375,logoCanvas(id,b)).rotation.y=s>0?0:Math.PI);
 for(let i=0;i<4;i++)glow(.5,.18,.5,'#fff6d8',mx-3+i*2,by+6.7,bz+.4);
 /* planters with trees and a bench on the right */
 [mx+3.6,mx-3.6].forEach(x=>{box(1.3,.6,1.3,'#6a4a2a',x,.3,fz+3.6);box(.9,1.1,.9,'#3a8a4a',x,1.15,fz+3.6);box(.55,.7,.55,'#4a9a5a',x,1.9,fz+3.6)});
 const bxx=Math.min(ex[1]-3.4,mx+7);box(2.6,.12,.7,'#8a6a42',bxx,.55,fz+2.6);box(.1,.5,.6,'#444',bxx-1.1,.28,fz+2.6);box(.1,.5,.6,'#444',bxx+1.1,.28,fz+2.6)};
const SHOW={};
BRD.hqShow=SHOW;
BRD.hqKit={FT,mix,rnd,hsh,logoCanvas,txtCanvas,skyline,brickTex,panelTex,wallMarble,H7,pc,go,door,HD,RD,KEY};
})();
