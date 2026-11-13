/* ===== v51.1.0: brand HQs, the real buildings and studios =====
   Part 3 of brand sponsorships (223-brand-deals.js, 224-brand-studio.js).
   Every brand deal is a trip to that brand's own HQ (BRD.hq has the city). When a world-tour city is built while a deal for it is
   active, the city's landmark block (C.landB) holds the brand's HQ instead of the usual landmark (D.landmark is wrapped):
   14 different buildings, each with its own shape, colours and sign (HQB). Walk to the front door and press the prompt to go
   inside: a real walkable studio room (D.mkRoom 'brand', built in a city hook) with its own floor, walls, backdrop art and props
   per brand (STU). The camera by the photographer starts the photoshoot (BRD.begin). A company car waits outside the airport
   (a prompt when you walk out) and there is a free company car from the studio back to the airport. */
(function(){
const BRD=window.BRD,D=window.DCITY;if(!BRD||!D)return;
const T=()=>window.TRAVEL,OX=D.OX,OZ=D.OZ;
const B=(G,w,h,d,c,x,y,z)=>xgBox(G,w,h,d,c,x,y,z);
const PR=(G,r0,r1,h,n,c,x,y,z,o)=>xgPrism(G,r0,r1,h,n,c,x,y,z,o);
const LIT=['#ffd890','#ffe7b0','#ffcf80','#bfe0ff','#fff2d0'];
BRD.inStudio=()=>!!(D.room&&D.room.key=='brand');
const RMX=1300,RMZ=-120,RMW=26,RMD=18;

/* ---------- sign pictures ---------- */
function signFn(b,bg,fg,txt,logo){return(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=fg;c.lineWidth=Math.max(2,H*.05);c.strokeRect(H*.05,H*.05,W-H*.1,H-H*.1);let x0=H*.14;
 if(logo){BRD.paint(c,b.id,H*.14,H*.14,H*.72);x0=H*1.0}
 c.fillStyle=fg;c.textBaseline='middle';let f=H*.42;c.font='bold '+f+'px Arial,sans-serif';const av=W-x0-H*.2;while(c.measureText(txt).width>av&&f>8){f-=2;c.font='bold '+f+'px Arial,sans-serif'}c.textAlign='center';c.fillText(txt,x0+av/2,H*.54)}}

/* ---------- the 14 HQ buildings. Each gets c = {G,Gw,x0,x1,zb,zf,mx,w,d,b} and returns its roof height ---------- */
const kk=(c,xa,xb,ya,yb,za,zb2,col)=>B(c.G,xb-xa,yb-ya,zb2-za,col,(xa+xb)/2,(ya+yb)/2,(za+zb2)/2);
const kg=(c,xa,xb,ya,yb,za,zb2,col)=>B(c.Gw,xb-xa,yb-ya,zb2-za,col,(xa+xb)/2,(ya+yb)/2,(za+zb2)/2);
function ws(c,xa,xb,ya,yb,nx,ny,col,z,fx){const pw=(xb-xa)/nx,ph=(yb-ya)/ny;for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const cl=Array.isArray(col)?col[(i*7+j*3)%col.length]:col;D.quadZ(c.Gw,xa+i*pw+pw*(fx||.18),xa+(i+1)*pw-pw*(fx||.18),ya+j*ph+ph*.2,ya+(j+1)*ph-ph*.2,(z==null?c.zf:z)+.04,cl)}}
function we(c,za,zb2,ya,yb,nz,ny,col,x){const pw=(zb2-za)/nz,ph=(yb-ya)/ny;for(let i=0;i<nz;i++)for(let j=0;j<ny;j++){const cl=Array.isArray(col)?col[(i*5+j*3)%col.length]:col;D.quadX(c.Gw,za+i*pw+pw*.18,za+(i+1)*pw-pw*.18,ya+j*ph+ph*.2,ya+(j+1)*ph-ph*.2,(x==null?c.x1:x)+.04,cl)}}
/* a hall at the front of a round building: the door and the sign sit on its south face */
function portico(c,col,hh,w2){const x0=c.mx-w2/2,x1=c.mx+w2/2;kk(c,x0,x1,0,hh,c.zf-3.4,c.zf,col)}
const HQB={
 converse:{w:26,d:20,f(c){const{x0,x1,zb,zf,mx,w}=c,H=9;kk(c,x0,x1,0,H,zb,zf,'#9a4d3a');for(let y=1.6;y<H;y+=2.2)D.quadZ(c.G,x0,x1,y,y+.14,zf+.03,'#7a3a2c');kk(c,x0-.2,x1+.2,H,H+.35,zb-.2,zf+.2,'#f1ece0');
  const n=4,bw=w/n;for(let i=0;i<n;i++)D.gable(c.G,x0+i*bw,zb,x0+(i+1)*bw,zf,H+.35,2.7,'#5a5f68','#9a4d3a',0);
  ws(c,x0+1,mx-4.2,3.8,7.6,3,1,LIT,zf);ws(c,mx+4.2,x1-1,3.8,7.6,3,1,LIT,zf);we(c,zb+1.5,zf-1.5,3.6,7.6,5,1,LIT);PR(c.G,.9,.75,H+3,8,'#7a3a2c',x1-2.2,0,zb+3);PR(c.G,1.05,1.05,.4,8,'#2a2a2e',x1-2.2,H+3,zb+3);
  c.sign(mx-4.2,mx+4.2,4.6,7.2,'#1c3f94','#f4f1ea');c.door(mx,2.8,3.6);return H+2.7}},
 monster:{w:14,d:14,f(c){const{x0,x1,zb,zf,mx}=c,H=36;kk(c,x0-2.2,x1+2.2,0,4.5,zb+2,zf,'#1b1d22');kk(c,x0,x1,0,H,zb,zf-1.2,'#101114');
  [[-4.2,.9],[-1.6,1.3],[1.2,.8],[3.6,1.1]].forEach(([o,wd],i)=>{for(let y=6;y<H-2;y+=11)D.quadZ(c.G,mx+o,mx+o+wd,y,y+8.6-i,zf-1.2+.05,'#95d600')});
  for(let y=6;y<H-2;y+=11)D.quadX(c.G,zb+3,zb+4.2,y,y+8,x1+.04,'#95d600');ws(c,x0+.8,x1-.8,6,H-2,4,6,['#3a5a8a','#1a1e26','#2a3a5a'],zf-1.2,.3);kg(c,x0-.3,x1+.3,H,H+.7,zb-.3,zf-.9,'#95d600');
  c.sign(mx-4.5,mx+4.5,4.7,7,'#0b0b0b','#95d600');c.door(mx,2.8,3.6);c.ex=[x0-2.2,x1+2.2];return H+.7}},
 rayban:{w:26,d:16,f(c){const{x0,x1,zb,zf,mx,w}=c,H=12,r=Math.min(6,w*.22),xl=x0+r+.6,xr=x1-r-.6,cz=zf-r-.4;
  [xl,xr].forEach(x=>{PR(c.G,r,r,H,16,'#1a1a1f',x,0,cz);PR(c.G,r+.45,r+.45,.8,16,'#d71920',x,H,cz);PR(c.G,r*.9,r*.9,.12,16,'#5a7090',x,H+.8,cz);PR(c.Gw,r+.05,r+.05,1.1,16,'#ffd890',x,5.4,cz);PR(c.Gw,r+.05,r+.05,1.1,16,'#ffd890',x,8,cz);kk(c,x-.4,x+.4,9.2,10.2,zb,cz,'#d71920')});
  kk(c,xl,xr,0,5,cz-1,zf,'#d71920');kk(c,xl,xr,5,5.5,cz-1.2,zf+.2,'#16161a');kk(c,mx-4.4,mx+4.4,5.5,8.8,zf-.7,zf,'#16161a');kg(c,mx-3.2,mx+3.2,10.6,10.9,cz-4,cz-3.7,'#ffd890');
  c.sign(mx-4,mx+4,5.8,8.4,'#16161a','#ff4a4f',zf+.02);c.door(mx,2.6,3.4);return H+1}},
 supreme:{w:18,d:16,f(c){const{x0,x1,zb,zf,mx}=c,H=13;kk(c,x0,x1,0,H-3.4,zb,zf,'#d4202c');kk(c,x0-.2,x1+.2,H-3.4,H,zb-.2,zf+.2,'#f1ece0');kk(c,x0-.3,x1+.3,H,H+.4,zb-.3,zf+.3,'#8a1020');
  ws(c,x0+1,mx-3,1.4,4.4,2,1,'#1a1a1f',zf,.1);ws(c,mx+3,x1-1,1.4,4.4,2,1,'#1a1a1f',zf,.1);ws(c,x0+1,x1-1,5.4,H-4.4,5,2,['#2a2a30','#3a3a44'],zf,.2);we(c,zb+1.5,zf-1.5,1.4,H-4.4,5,3,['#2a2a30','#3a3a44']);
  for(let y=1.2;y<H-4;y+=3.1)kk(c,x1,x1+1.2,y,y+.12,zb+2,zf-2,'#1a1a1e');kk(c,x1,x1+.12,1.2,H-4,zb+2,zf-2,'#1a1a1e');
  c.sign(x0+1,x1-1,H-3.1,H-.4,'#d4202c','#f1ece0',zf+.25);for(let x=mx-1.4;x<mx+1.5;x+=.4)D.quadZ(c.G,x,x+.2,0,3.3,zf+.07,'#2a2a30');c.door(mx,2.8,3.4,1);return H+.4}},
 levis:{w:26,d:18,f(c){const{x0,x1,zb,zf,mx}=c,H=9.5;kk(c,x0,x1,0,H,zb,zf,'#2f5a9a');kk(c,x0-.3,x1+.3,H,H+.4,zb-.3,zf+.3,'#1d3c6a');D.gable(c.G,x0,zb,x1,zf,H+.4,2.4,'#264a80','#2f5a9a',1);
  [2.4,7.7].forEach(y=>D.quadZ(c.G,x0,x1,y,y+.16,zf+.03,'#e0a82a'));ws(c,x0+1,mx-4.2,3.2,7,3,1,LIT,zf,.14);ws(c,mx+4.2,x1-1,3.2,7,3,1,LIT,zf,.14);we(c,zb+1.5,zf-1.5,3.2,7,5,1,LIT);
  const tx=x1-3.6,tz=zb+3.4;[-1.1,1.1].forEach(o=>B(c.G,.18,2.4,.18,'#6a4a2a',tx+o,H+1.6,tz+o));PR(c.G,1.5,1.5,2,10,'#6a4a2a',tx,H+2.8,tz);PR(c.G,1.7,0,1,10,'#4a3220',tx,H+4.8,tz);
  c.sign(mx-5,mx+5,4.6,7.2,'#f2b705','#1e3f8a');kk(c,x1-3,x1-.8,5.6,8.2,zf,zf+.18,'#c8202c');c.door(mx,2.8,3.4);return H+4.5}},
 beats:{w:15,d:15,f(c){const{zf,mx,w}=c,r=Math.min(7.2,w/2-.4),cz=zf-r-.5,H=17;PR(c.G,r,r,H,20,'#6a2bd9',mx,0,cz);[4,8,12].forEach(y=>PR(c.G,r+.35,r+.35,.55,20,'#f2f2f2',mx,y,cz));PR(c.Gw,r+.05,r+.05,.8,20,'#c8a8ff',mx,6,cz);PR(c.Gw,r+.05,r+.05,.8,20,'#c8a8ff',mx,10,cz);PR(c.Gw,r+.05,r+.05,.8,20,'#c8a8ff',mx,14,cz);
  D.dome(c.G,r*.9,mx,H,cz,'#f2f2f2','#6a2bd9');[-1,1].forEach(s=>PR(c.G,2.1,2.1,3.2,12,'#1a1a1f',mx+s*(r+.9),H-4,cz));kk(c,mx-r-1.6,mx+r+1.6,H+.2,H+.7,cz-.4,cz+.4,'#1a1a1f');
  portico(c,'#f2f2f2',5.6,8);c.sign(mx-3.6,mx+3.6,3.7,5.3,'#6a2bd9','#f2f2f2',zf+.05);c.door(mx,2.4,3.2);c.ex=[mx-r,mx+r];c.zb2=cz-r;return H+r*.9+1}},
 pepsi:{w:16,d:16,f(c){const{zf,mx,w}=c,r=Math.min(7.6,w/2-.4),cz=zf-r-.5;PR(c.G,r,r,5,20,'#e32934',mx,0,cz);PR(c.G,r-.8,r-.8,4.2,20,'#f6f8fb',mx,5,cz);PR(c.G,r-1.6,r-1.6,4.2,20,'#0a4a96',mx,9.2,cz);
  [2.6,7,11.2].forEach(y=>PR(c.Gw,r+.04,r+.04,.9,20,'#ffe7b0',mx,y,cz));PR(c.Gw,r-.76,r-.76,.9,20,'#bfe0ff',mx,6.8,cz);D.dome(c.G,r-2.2,mx,13.4,cz,'#2a6ac0','#e32934');
  portico(c,'#f6f8fb',5.6,8.4);kk(c,mx-4.2,mx+4.2,5.6,5.9,zf-3.4,zf+.4,'#e32934');c.sign(mx-3.8,mx+3.8,3.7,5.3,'#0a4a96','#fff',zf+.05);c.door(mx,2.4,3.2);c.ex=[mx-r,mx+r];c.zb2=cz-r;return 20}},
 adidas:{w:24,d:20,f(c){const{x0,x1,zb,zf,mx,w}=c;kk(c,x0,x1,0,6,zb,zf,'#f4f4f4');kk(c,x0+w*.11,x1-w*.11,6,12,zb,zf-3,'#16161a');kk(c,x0+w*.22,x1-w*.22,12,18,zb,zf-6,'#f4f4f4');
  [[x0,x1,6,zf],[x0+w*.11,x1-w*.11,12,zf-3],[x0+w*.22,x1-w*.22,18,zf-6]].forEach(([a,b2,y,z])=>kk(c,a-.15,b2+.15,y,y+.3,zb-.15,z+.15,'#16161a'));
  [-1,0,1].forEach(i=>{for(let k=0;k<3;k++){const xa=x0+1+i*0+k*2+(i+1)*(w-6)/3;D.quadZ(c.G,xa,xa+.7,.2,5.6,zf+.04,'#16161a')}});
  ws(c,x0+w*.15,x1-w*.15,7,11.4,6,1,['#9ad0ff','#bfe0ff'],zf-3,.1);ws(c,x0+w*.27,x1-w*.27,13,17.4,4,1,['#16161a','#2a2a30'],zf-6,.1);we(c,zb+1,zf-1,1.4,5,5,1,['#9ad0ff','#bfe0ff']);
  c.sign(mx-4.6,mx+4.6,3.7,5.5,'#16161a','#fff');c.door(mx,2.6,3.2);return 18.3}},
 cocacola:{w:22,d:18,f(c){const{x0,x1,zb,zf,mx}=c,H=11;kk(c,x0,x1,0,H,zb,zf,'#e41e2b');kk(c,x0-.2,x1+.2,H,H+.4,zb-.2,zf+.2,'#f4f4f4');for(let x=x0;x<x1;x+=1.6)D.quadZ(c.G,x,x+.8,6.6+Math.sin(x)*.3,7.6+Math.sin(x)*.3,zf+.03,'#fff');
  ws(c,x0+1,mx-4.2,2.4,6,3,1,LIT,zf);ws(c,mx+4.2,x1-1,2.4,6,3,1,LIT,zf);ws(c,x0+1,x1-1,8.2,10.4,6,1,LIT,zf);we(c,zb+1.5,zf-1.5,2.4,9.6,5,2,LIT);
  const bx=x1-4,bz=zb+5;PR(c.G,1.7,1.7,5.4,14,'#2a1410',bx,H+.4,bz);PR(c.G,1.76,1.76,2,14,'#e41e2b',bx,H+2.2,bz);PR(c.G,1.7,.7,1.8,14,'#2a1410',bx,H+5.8,bz);PR(c.G,.7,.7,2.4,10,'#2a1410',bx,H+7.6,bz);PR(c.G,.95,.95,.5,10,'#e41e2b',bx,H+10,bz);
  c.sign(mx-4.5,mx+4.5,4.7,7.2,'#e41e2b','#fff',zf+.04);kk(c,mx-2.2,mx+2.2,3.5,3.8,zf,zf+1.6,'#f4f4f4');c.door(mx,2.6,3.4);return H+10.5}},
 samsung:{w:12,d:12,f(c){const{x0,x1,zb,zf,mx,w}=c,H=32;kk(c,x0-4,x1+4,0,6,zb+1.5,zf,'#e8ecf4');kk(c,x0,x1,6,H,zb,zf-1,'#1c3a8a');
  D.quadZ(c.Gw,x0+.3,x1-.3,6.4,H-.6,zf-1+.04,'#6aa0ff');D.quadX(c.Gw,zb+.3,zf-1.3,6.4,H-.6,x1+.04,'#5a90ef');for(let y=9.4;y<H;y+=3.2){D.quadZ(c.G,x0,x1,y,y+.16,zf-1+.07,'#101830');D.quadX(c.G,zb,zf-1,y,y+.16,x1+.07,'#101830')}for(let x=x0+2;x<x1;x+=2.4)D.quadZ(c.G,x,x+.12,6.4,H-.6,zf-1+.07,'#101830');
  PR(c.G,w*.5,w*.5,.8,24,'#1428a0',mx,H,(zb+zf)/2-.5,{sz:.62});PR(c.G,w*.42,w*.42,.84,24,'#f4f6fb',mx,H,(zb+zf)/2-.5,{sz:.62});PR(c.G,w*.3,w*.3,.9,24,'#1428a0',mx,H,(zb+zf)/2-.5,{sz:.5});
  ws(c,x0-3,mx-3.4,1.4,4.8,3,1,['#9ad0ff','#bfe0ff'],zf,.1);ws(c,mx+3.4,x1+3,1.4,4.8,3,1,['#9ad0ff','#bfe0ff'],zf,.1);c.sign(mx-4,mx+4,4.2,5.9,'#1428a0','#f4f6fb',zf+.04);c.door(mx,2.6,3.2);c.ex=[x0-4,x1+4];return H+.9}},
 nike:{w:24,d:20,f(c){const{x0,x1,zb,zf,mx,w}=c;kk(c,x0,x1,0,4,zb,zf,'#f4f4f1');kk(c,x0+w*.1,x1-w*.1,4,8,zb,zf-3,'#d8d8d2');kk(c,x0+w*.2,x1-w*.2,8,12,zb,zf-6,'#f4f4f1');
  [[x0,x1,4,zf],[x0+w*.1,x1-w*.1,8,zf-3],[x0+w*.2,x1-w*.2,12,zf-6]].forEach(([a,b2,y,z])=>{kk(c,a-.15,b2+.15,y,y+.35,z-.2,z+.2,'#ff6a00');kk(c,b2-.2,b2+.15,y,y+.35,zb-.15,z+.2,'#ff6a00')});
  D.quadZ(c.Gw,x0+.8,mx-2.4,.8,3.2,zf+.04,'#bfe0ff');D.quadZ(c.Gw,mx+2.4,x1-.8,.8,3.2,zf+.04,'#bfe0ff');ws(c,x0+w*.14,x1-w*.14,4.6,7.6,5,1,['#bfe0ff','#9ad0ff'],zf-3,.05);ws(c,x0+w*.24,x1-w*.24,8.6,11.6,4,1,['#bfe0ff','#9ad0ff'],zf-6,.05);we(c,zb+1,zf-1,.8,3.2,5,1,['#bfe0ff']);
  c.sign(mx-4.2,mx+4.2,5,7.3,'#f4f4f1','#16161a',zf-3+.02);kk(c,mx-2.4,mx+2.4,3.5,3.8,zf,zf+1.5,'#ff6a00');c.door(mx,2.6,3.2);return 12.4}},
 gucci:{w:24,d:16,f(c){const{x0,x1,zb,zf,mx,w}=c,H=9.4;kk(c,x0,x1,0,H,zb,zf,'#e0cfa8');for(let y=2.2;y<H;y+=2.4)D.quadZ(c.G,x0,x1,y,y+.1,zf+.03,'#c8b78e');
  ws(c,x0+1,x1-1,4.2,7.6,7,1,LIT,zf,.2);we(c,zb+1.5,zf-1.5,2.2,7.6,4,2,LIT);kk(c,x0-.5,x1+.5,H,H+1,zb-.5,zf+1.8,'#c9a24b');D.gable(c.G,x0-.5,zb-.5,x1+.5,zf+1.8,H+1,3,'#b8892e','#e0cfa8',1);
  for(let i=0;i<6;i++){const x=x0+2+i*(w-4)/5;PR(c.G,.55,.5,H,10,'#f1ead4',x,0,zf+.9);kk(c,x-.7,x+.7,0,.4,zf+.2,zf+1.6,'#c8b78e');kk(c,x-.7,x+.7,H-.4,H,zf+.2,zf+1.6,'#c8b78e')}
  kk(c,mx-1.5,mx+1.5,0,.25,zf+1.6,zf+3.6,'#c8b78e');c.sign(mx-1.8,mx+1.8,5.4,7.2,'#0f3d2e','#e2c06a',zf+.12);c.door(mx,2,3.6);return H+4}},
 apple:{w:24,d:20,f(c){const{x0,x1,zb,zf,mx,w}=c,H=8,t=4.2;[[x0,x1,zb,zb+t],[x0,x0+t,zb,zf],[x1-t,x1,zb,zf]].forEach(([a,b2,z0,z1])=>kk(c,a,b2,0,H,z0,z1,'#f2f2f4'));kk(c,x0,x1,0,H,zf-t,zf,'#f2f2f4');
  D.quadY(c.G,x0+t,zb+t,x1-t,zf-t,.06,'#6aaa5a');PR(c.G,.25,.2,3,6,'#6a4a2a',mx,0,(zb+zf)/2);D.dome(c.G,1.9,mx,3,(zb+zf)/2,'#3a8a4a');
  [[x0-.2,x1+.2,zb-.2,zb+t+.2],[x0-.2,x0+t+.2,zb-.2,zf+.2],[x1-t-.2,x1+.2,zb-.2,zf+.2],[x0-.2,x1+.2,zf-t-.2,zf+.2]].forEach(([a,b2,z0,z1])=>kk(c,a,b2,H,H+.4,z0,z1,'#2a2a2e'));
  D.quadZ(c.Gw,x0+.4,x1-.4,.5,H-.5,zf+.04,'#bfe0ff');for(let x=x0+2;x<x1-1;x+=2)D.quadZ(c.G,x,x+.12,.5,H-.5,zf+.07,'#f2f2f4');we(c,zb+1,zf-1,.8,H-.8,5,2,['#bfe0ff','#9ad0ff']);
  c.sign(mx-3.4,mx+3.4,H+.6,H+2.6,'#f2f2f4','#16161a',zf);c.door(mx,3,3.6,1);return H+2.6}},
 lv:{w:22,d:18,f(c){const{x0,x1,zb,zf,mx,w}=c,H=15;kk(c,x0,x1,0,H,zb,zf,'#4a2e18');kk(c,x0-.3,x1+.3,H,H+.5,zb-.3,zf+.3,'#c9a24b');
  for(let j=0,y=1.2;y<H-.8;y+=1.8,j++)for(let x=x0+1.2+(j%2)*.9;x<x1-.8;x+=1.8)D.quadZ(c.Gw,x,x+.8,y,y+.8,zf+.04,'#d8b45e');
  we(c,zb+1.5,zf-1.5,3.2,H-2,4,3,['#d8b45e','#e2c06a']);[[mx-9,mx-5.2],[mx+5.2,mx+9]].forEach(([a,b2])=>{if(a<x0-1||b2>x1+1)return;kk(c,a,b2,0,3,zf,zf+2.2,'#6a4a2a');kk(c,a-.1,b2+.1,1.3,1.6,zf-.1,zf+2.3,'#c9a24b');kk(c,(a+b2)/2-.9,(a+b2)/2+.9,3,3.5,zf+.6,zf+1.6,'#c9a24b')});
  c.sign(mx-5,mx+5,7.6,10.4,'#3a2210','#e2c06a',zf+.1);kk(c,mx-1.9,mx+1.9,0,4.4,zf,zf+.2,'#c9a24b');c.door(mx,3,4,1);return H+.5}}
};
BRD.hqPlan=HQB;

/* ---------- build the HQ in the landmark block ---------- */
const prevLM=D.landmark;
D.landmark=function(C,bk){const o=BRD.active();if(!(o&&o.k=='trip'&&o.d==C.id&&HQB[o.b]))return prevLM.apply(this,arguments);
 try{return build(C,bk,o)}catch(e){console.error('brand hq',e);C.hq=null;return prevLM.apply(this,arguments)}};
function build(C,bk,o){const b=BRD.by(o.b),sp=HQB[o.b],G=D.mkG(),Gw=D.mkG(),q=D.QB(),prev=D.building;D.building=C;
 try{const bw=bk.x1-bk.x0,bd=bk.z1-bk.z0,mx=(bk.x0+bk.x1)/2,w=Math.min(sp.w,bw-5),d=Math.min(sp.d,bd-8),fz=bk.z1-4.6;
  D.quadY(G,bk.x0,bk.z0,bk.x1,bk.z1,.03,dk(C.s.walk,1.18));D.quadY(G,bk.x0+.6,fz+.4,bk.x1-.6,bk.z1-.6,.04,dk(C.s.walk,1.3));
  const c={G,Gw,q,C,b,x0:mx-w/2,x1:mx+w/2,zb:fz-d,zf:fz,mx,w,d,ex:null,zb2:null,n:0};
  c.sign=(xa,xb,ya,yb,bg,fg,z)=>{const r=(xb-xa)/(yb-ya),lw=Math.round(r*96),fn=signFn(b,bg,fg,b.n.toUpperCase()+' HQ',r>3),uv=C.A.add(288,96,(cx2,W,H)=>{cx2.save();cx2.scale(W/lw,1);fn(cx2,lw,H);cx2.restore()},'hq|'+o.b+'|'+(c.n++));if(!uv||uv===C.A.blank)return;D.qFace(q,'z',z==null?fz+.08:z,xa,xb,ya,yb,uv.uv)};
  c.door=(x,wd,hd,gold)=>{D.quadZ(G,x-wd/2-.18,x+wd/2+.18,0,hd+.18,fz+.1,gold?'#c9a24b':'#202228');D.quadZ(Gw,x-wd/2,x+wd/2,.05,hd,fz+.13,'#ffe9a8');D.quadZ(G,x-.06,x+.06,.05,hd,fz+.16,'#202228');kk(c,x-wd/2-.6,x+wd/2+.6,hd+.2,hd+.5,fz,fz+1.2,b.c==b.bg||/^#f/i.test(b.c)?'#3a3a48':b.c)};
  const H=sp.f(c),ex=c.ex||[c.x0,c.x1];
  /* forecourt: carpet, bollards, two flags in the brand's colour */
  D.quadY(G,mx-1.6,fz+.2,mx+1.6,bk.z1-.4,.06,'#b5172a');[-2,2].forEach(s=>{B(G,.18,.7,.18,'#e9c24a',mx+s*1.9,.35,fz+1.2);B(G,.18,.7,.18,'#e9c24a',mx+s*1.9,.35,fz+3)});
  const fc=b.c==b.bg||/^#f/i.test(b.c)?'#3a3a48':b.c;[ex[0]-1.4,ex[1]+1.4].forEach(x=>{B(G,.14,7.4,.14,'#cfd2d8',x,3.7,fz+1.2);B(G,1.7,1.1,.06,fc,x+(x<mx?.85:-.85),6.7,fz+1.2);B(Gw,.5,.5,.07,'#fff',x+(x<mx?.85:-.85),6.7,fz+1.26)});
  try{if(BRD.hqExterior)BRD.hqExterior(c,H,ex,fz,mx,b)}catch(e){console.error('hq exterior',e)}D.col(ex[0]-.3,(c.zb2==null?c.zb:c.zb2)-.3,ex[1]+.3,fz-.1);D.unit(C,G,Gw,q,[bk.x0,bk.z0,bk.x1,bk.z1,H]);
  C.spots.land={x:mx,z:fz+1.2,n:b.n+' HQ'};C.hq={bid:o.b,x:mx,z:fz,out:{x:mx,z:fz+2.2},n:b.n};
  D.addInt(mx,fz+1.7,2.4,'Enter '+b.n+' HQ',()=>{const j=BRD.active();if(!j||j.b!=o.b)return say('Reception: "We have no shoot booked with you today."');D.fade(()=>{if(BRD.hqEnter&&C.rooms.hq_lobby)BRD.hqEnter();else D.goRoom('brand',RMX+RMW/2,RMZ+RMD-1.8,Math.PI)},()=>say('Welcome to '+b.n+'. Reception is ahead; the photo studio is the door on the left.'))});
  return true}finally{D.building=prev}}

/* ---------- the studios: backdrop art, floors, props. One per brand ---------- */
const TX=(c,t,x,y,f,col,al)=>{c.font=f;c.fillStyle=col;c.textAlign=al||'center';c.textBaseline='middle';c.fillText(t,x,y)};
const pal=id=>{const b=BRD.by(id);return b.c==b.bg||/^#f/i.test(b.c)?'#3a3a48':b.c};
const STU={
 converse:{fl:'#b89a72',wl:'#efe6d2',nc:'#d4202c',bk:(c,W,H)=>{c.fillStyle='#f4f1ea';c.fillRect(0,0,W,H);for(let i=0;i<4;i++){c.fillStyle=i%2?'#d4202c':'#1c3f94';c.fillRect(0,H-70+i*14,W,10)}c.fillStyle='#1c3f94';c.beginPath();c.arc(W/2,H*.44,66,0,7);c.fill();c.fillStyle='#f4f1ea';c.beginPath();c.arc(W/2,H*.44,56,0,7);c.fill();c.fillStyle='#d4202c';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?22:50;c[i?'lineTo':'moveTo'](W/2+Math.cos(a)*r,H*.45+Math.sin(a)*r)}c.fill()},
  props(R){R.shoe(R.x0+3,R.z0+4,'#d4202c');R.shoe(R.x0+5.2,R.z0+4,'#1c3f94');R.shoe(R.x0+7.4,R.z0+4,'#f4f1ea');R.rack(R.x0+21,R.z0+4.5,['#d4202c','#1c3f94','#f4f1ea','#e8c040']);R.rack(R.x0+21,R.z0+7,['#f4f1ea','#d4202c','#1c3f94','#2a2a2a']);R.crate(R.x0+3.4,R.z0+8.6,'#8a6a42');R.crate(R.x0+4.6,R.z0+8.6,'#8a6a42')}},
 monster:{fl:'#2a2c30',wl:'#15171a',nc:'#95d600',bk:(c,W,H)=>{c.fillStyle='#0b0b0b';c.fillRect(0,0,W,H);c.fillStyle='#95d600';[[.30,.02],[.46,.1],[.62,.0]].forEach(([a,s],i)=>{c.beginPath();c.moveTo(W*a,0);c.lineTo(W*a+34,0);c.lineTo(W*a+10-s*80+24,H);c.lineTo(W*a-24-s*80,H);c.fill()});c.fillStyle='#0b0b0b';for(let i=0;i<4;i++)c.fillRect(0,40+i*50,W,4);BRD.paint(c,'monster',W-150,H/2-50,100);BRD.paint(c,'monster',50,H/2-50,100)},
  props(R){R.fridge(R.x0+3,R.z0+3.6,'#95d600');R.fridge(R.x0+5.2,R.z0+3.6,'#95d600');R.cans(R.x0+21,R.z0+4,'#95d600','#101114');R.cans(R.x0+23,R.z0+4,'#95d600','#101114');R.sofa(R.x0+4,R.z0+8.6,'#1a1a1e');R.neon(R.x0+21,R.z0+8,'#95d600',5)}},
 rayban:{fl:'#4a2a22',wl:'#2a0e12',nc:'#ff4a4f',bk:(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a0a1a');g.addColorStop(1,'#ff7a3a');c.fillStyle=g;c.fillRect(0,0,W,H);[W*.33,W*.67].forEach(x=>{c.fillStyle='#16161a';c.beginPath();c.ellipse(x,H*.5,92,64,0,0,7);c.fill();const l=c.createLinearGradient(0,H*.2,0,H*.8);l.addColorStop(0,'#ffb060');l.addColorStop(.5,'#c04a7a');l.addColorStop(1,'#2a2a6a');c.fillStyle=l;c.beginPath();c.ellipse(x,H*.5,82,54,0,0,7);c.fill()});c.fillStyle='#16161a';c.fillRect(W*.33+80,H*.45,W*.34-160,12);c.fillStyle='#d71920';c.fillRect(0,H-16,W,16)},
  props(R){R.glasses(R.x0+3.4,R.z0+4);R.glasses(R.x0+6,R.z0+4);R.glasses(R.x0+21,R.z0+4);R.mirror(R.x0+22,R.z0+8);R.neon(R.x0+4,R.z0+8.4,'#ff4a4f',4);R.sofa(R.x0+21,R.z0+9.6,'#d71920')}},
 supreme:{fl:'#8a8d92',wl:'#d4202c',nc:'#f1ece0',bk:(c,W,H)=>{c.fillStyle='#d4202c';c.fillRect(0,0,W,H);c.fillStyle='#ffffff18';for(let r=0;r<5;r++)TX(c,'SUPREMO   SUPREMO   SUPREMO   SUPREMO',W/2+(r%2)*30,24+r*44,'italic bold 30px Arial','#ffffff30');c.fillStyle='#d4202c';c.fillRect(W/2-150,H/2-44,300,88);c.fillStyle='#fff';c.fillRect(W/2-148,H/2-42,296,84);c.fillStyle='#d4202c';c.fillRect(W/2-142,H/2-36,284,72);TX(c,'Supremo',W/2,H/2+2,'italic bold 52px Arial','#fff')},
  props(R){for(let i=0;i<4;i++)R.deck(R.x0+2.5+i*1.3,R.z0+1.1,['#f1ece0','#1a1a1e','#2a6ae0','#e8c040'][i]);R.rack(R.x0+21,R.z0+4.5,['#f1ece0','#d4202c','#1a1a1e','#f1ece0']);R.crate(R.x0+4,R.z0+4,'#1a1a1e');R.crate(R.x0+4.1,R.z0+5.1,'#1a1a1e');R.sofa(R.x0+22,R.z0+9.4,'#1a1a1e');R.deck(R.x0+23.4,R.z0+1.1,'#d4202c')}},
 levis:{fl:'#7a5a3a',wl:'#2f5a9a',nc:'#f2b705',bk:(c,W,H)=>{c.fillStyle='#2f5a9a';c.fillRect(0,0,W,H);c.strokeStyle='#ffffff14';c.lineWidth=2;for(let i=-H;i<W;i+=7){c.beginPath();c.moveTo(i,0);c.lineTo(i+H,H);c.stroke()}c.strokeStyle='#f2b705';c.lineWidth=3;c.setLineDash([12,8]);c.strokeRect(14,14,W-28,H-28);c.setLineDash([]);c.fillStyle='#b8863a';c.fillRect(W/2-110,H/2-44,220,88);c.strokeStyle='#5a3a1a';c.lineWidth=3;c.strokeRect(W/2-104,H/2-38,208,76);TX(c,"LEEVI'S",W/2,H/2-6,'bold 40px Georgia','#3a1f0a');TX(c,'DENIM CO.',W/2,H/2+26,'bold 18px Georgia','#3a1f0a')},
  props(R){R.rack(R.x0+3.6,R.z0+4,['#2f5a9a','#1e3f8a','#4a7ac0','#1d2a4a','#2f5a9a']);R.rack(R.x0+3.6,R.z0+6.4,['#1e3f8a','#2f5a9a','#6a8ac0','#2f5a9a']);R.crate(R.x0+21,R.z0+4,'#8a6a42');R.crate(R.x0+22.2,R.z0+4,'#8a6a42');R.crate(R.x0+21.6,R.z0+4,'#6a4a2a',1.2);R.table(R.x0+22,R.z0+8,'#6a4a2a');R.screen(R.x0+22,R.z0+8,'#e8c040')}},
 beats:{fl:'#1a1230',wl:'#2a1a50',nc:'#a070ff',bk:(c,W,H)=>{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#2a0f5a');g.addColorStop(1,'#7a3be9');c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle='#ffffff30';c.lineWidth=3;for(let r=30;r<200;r+=28){c.beginPath();c.arc(W/2,H*.5,r,0,7);c.stroke()}c.fillStyle='#f2f2f2';for(let i=0;i<30;i++){const h=20+Math.abs(Math.sin(i*1.7))*70;c.fillRect(20+i*20,H-h-10,12,h)}BRD.paint(c,'beats',W/2-45,H*.5-60,90)},
  props(R){R.spk(R.x0+3,R.z0+3.4);R.spk(R.x0+5.2,R.z0+3.4);R.spk(R.x0+21,R.z0+3.4);R.spk(R.x0+23.2,R.z0+3.4);R.table(R.x0+4,R.z0+8.6,'#1a1a1e');R.screen(R.x0+4,R.z0+8.6,'#a070ff');R.neon(R.x0+22,R.z0+8,'#a070ff',5)}},
 pepsi:{fl:'#e8ecf4',wl:'#f6f8fb',nc:'#e32934',bk:(c,W,H)=>{c.fillStyle='#f6f8fb';c.fillRect(0,0,W,H);c.fillStyle='#e32934';c.fillRect(0,0,W*.34,H);c.fillStyle='#0a4a96';c.fillRect(W*.66,0,W*.34,H);c.strokeStyle='#fff';c.lineWidth=18;c.beginPath();c.moveTo(0,H*.55);c.bezierCurveTo(W*.25,H*.2,W*.5,H*.9,W,H*.45);c.stroke();BRD.paint(c,'pepsi',W/2-52,H/2-52,104)},
  props(R){R.cans(R.x0+3,R.z0+4,'#0a4a96','#e32934');R.cans(R.x0+5,R.z0+4,'#e32934','#0a4a96');R.cans(R.x0+7,R.z0+4,'#f6f8fb','#0a4a96');R.diner(R.x0+22,R.z0+4.6);R.fridge(R.x0+22.6,R.z0+9,'#e32934');R.neon(R.x0+4,R.z0+8.6,'#0a4a96',4)}},
 adidas:{fl:'#1a1a1e',wl:'#f4f4f4',nc:'#ffffff',bk:(c,W,H)=>{c.fillStyle='#f4f4f4';c.fillRect(0,0,W,H);c.fillStyle='#16161a';[[.18,0],[.38,0],[.58,0]].forEach(([a])=>{c.beginPath();c.moveTo(W*a+80,0);c.lineTo(W*a+135,0);c.lineTo(W*a+35,H);c.lineTo(W*a-20,H);c.fill()});BRD.paint(c,'adidas',W-140,18,100)},
  props(R){R.shoe(R.x0+3,R.z0+4,'#f4f4f4','#16161a');R.shoe(R.x0+5.2,R.z0+4,'#16161a','#f4f4f4');R.shoe(R.x0+7.4,R.z0+4,'#f4f4f4','#2a6ae0');R.hurdle(R.x0+21,R.z0+4);R.hurdle(R.x0+21,R.z0+6);R.hurdle(R.x0+21,R.z0+8);R.rack(R.x0+3.6,R.z0+8.6,['#16161a','#f4f4f4','#16161a','#e8c040']);R.stripes(R.x0+8,R.z0+13,'#f4f4f4')}},
 cocacola:{fl:'#f4f0e8',wl:'#e41e2b',nc:'#fff',bk:(c,W,H)=>{c.fillStyle='#e41e2b';c.fillRect(0,0,W,H);c.fillStyle='#ffffff22';for(let i=0;i<40;i++){c.beginPath();c.arc((i*97)%W,(i*53)%H,4+i%5*3,0,7);c.fill()}c.strokeStyle='#fff';c.lineWidth=26;c.lineCap='round';c.beginPath();c.moveTo(-10,H*.62);c.bezierCurveTo(W*.25,H*.2,W*.5,H*1.1,W+10,H*.4);c.stroke();TX(c,'Koka-Cola',W/2,H*.3,'italic bold 56px Georgia','#fff')},
  props(R){R.fridge(R.x0+3,R.z0+3.6,'#e41e2b');R.fridge(R.x0+4.8,R.z0+3.6,'#e41e2b');R.fridge(R.x0+6.6,R.z0+3.6,'#e41e2b');R.sofa(R.x0+22,R.z0+4,'#e41e2b');R.cans(R.x0+22,R.z0+8,'#e41e2b','#fff');R.lights(R.x0+2,R.z0+1.2,22)}},
 samsung:{fl:'#eef1f8',wl:'#f4f6fb',nc:'#6aa0ff',bk:(c,W,H)=>{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0a1a6a');g.addColorStop(1,'#2a58e0');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#ffffff18';for(let i=0;i<7;i++){c.beginPath();c.moveTo(W/2,H*.55);c.lineTo(i*W/6,0);c.lineTo((i+.5)*W/6,0);c.fill()}c.fillStyle='#f4f6fb';c.beginPath();c.ellipse(W/2,H*.52,150,52,-.12,0,7);c.fill();c.fillStyle='#1428a0';c.beginPath();c.ellipse(W/2,H*.52,138,42,-.12,0,7);c.fill();TX(c,'SAMSONG',W/2,H*.52,'bold 44px Arial','#f4f6fb')},
  props(R){R.table(R.x0+3.4,R.z0+4,'#f4f6fb',2.4);R.screen(R.x0+3.4,R.z0+4,'#6aa0ff');R.table(R.x0+6.4,R.z0+4,'#f4f6fb',2.4);R.screen(R.x0+6.4,R.z0+4,'#ff9ad0');R.wall(R.x0+21,R.z0+1.1,4,'#6aa0ff');R.table(R.x0+22,R.z0+8,'#f4f6fb',2.4);R.screen(R.x0+22,R.z0+8,'#9aff9a');R.plant(R.x0+1.4,R.z0+9)}},
 nike:{fl:'#d8541a',wl:'#f4f4f1',nc:'#ff6a00',bk:(c,W,H)=>{c.fillStyle='#f4f4f1';c.fillRect(0,0,W,H);c.fillStyle='#ff6a00';c.fillRect(0,H-46,W,46);c.strokeStyle='#16161a';c.lineCap='round';c.lineWidth=40;c.beginPath();c.moveTo(W*.26,H*.5);c.quadraticCurveTo(W*.42,H*.98,W*.8,H*.1);c.stroke();TX(c,'NYKE',W/2,H-24,'italic bold 36px Arial','#fff')},
  props(R){R.shelf(R.x0+2.2,R.z0+4.5,['#ff6a00','#f4f4f1','#16161a']);R.shelf(R.x0+2.2,R.z0+7,['#f4f4f1','#ff6a00','#2a6ae0']);R.shoe(R.x0+21,R.z0+4,'#ff6a00','#16161a');R.shoe(R.x0+23,R.z0+4,'#f4f4f1','#ff6a00');R.stripes(R.x0+13,R.z0+15,'#f4f4f1');R.stripes(R.x0+13,R.z0+16.2,'#f4f4f1');R.trophy(R.x0+22,R.z0+8.4)}},
 gucci:{fl:'#e8e0cf',wl:'#0f3d2e',nc:'#e2c06a',tiles:1,bk:(c,W,H)=>{c.fillStyle='#0f3d2e';c.fillRect(0,0,W,H);c.fillStyle='#c8202c';c.fillRect(W/2-34,0,20,H);c.fillRect(W/2+14,0,20,H);c.fillStyle='#14683f';c.fillRect(W/2-14,0,28,H);c.strokeStyle='#e2c06a66';c.lineWidth=3;for(let x=24;x<W;x+=44)for(let y=24;y<H;y+=44){c.beginPath();c.arc(x,y,14,0,7);c.stroke();c.beginPath();c.arc(x+14,y,14,0,7);c.stroke()}c.fillStyle='#0f3d2e';c.fillRect(W/2-110,H/2-40,220,80);c.strokeStyle='#e2c06a';c.lineWidth=4;c.strokeRect(W/2-106,H/2-36,212,72);TX(c,'GUCHI',W/2,H/2+4,'bold 52px Georgia','#e2c06a')},
  props(R){R.frame(R.x0+3,R.z0+1.1);R.frame(R.x0+7,R.z0+1.1);R.frame(R.x0+19,R.z0+1.1);R.frame(R.x0+23,R.z0+1.1);R.bag(R.x0+3,R.z0+4.4,'#c8202c');R.bag(R.x0+5.4,R.z0+4.4,'#14683f');R.bag(R.x0+22,R.z0+4.4,'#e2c06a');R.sofa(R.x0+4,R.z0+9,'#14683f');R.chandelier(R.cx,R.z0+9)}},
 apple:{fl:'#f2f2f4',wl:'#fafafa',nc:'#bfe0ff',bk:(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#d8dae0');c.fillStyle=g;c.fillRect(0,0,W,H);const r=c.createRadialGradient(W/2,H*.5,10,W/2,H*.5,160);r.addColorStop(0,'#ffffff');r.addColorStop(1,'#ffffff00');c.fillStyle=r;c.fillRect(0,0,W,H);BRD.paint(c,'apple',W/2-40,H/2-60,80);TX(c,'Appel',W/2,H/2+50,'300 30px Arial','#444')},
  props(R){R.table(R.x0+3.4,R.z0+4,'#c8a078',2.6);R.laptop(R.x0+3,R.z0+4);R.laptop(R.x0+4,R.z0+4);R.table(R.x0+6.8,R.z0+4,'#c8a078',2.6);R.laptop(R.x0+6.4,R.z0+4);R.laptop(R.x0+7.4,R.z0+4);R.table(R.x0+22,R.z0+4.4,'#c8a078',2.6);R.laptop(R.x0+21.6,R.z0+4.4);R.plant(R.x0+23.6,R.z0+9);R.plant(R.x0+1.4,R.z0+9)}},
 lv:{fl:'#5a3a22',wl:'#3a2210',nc:'#e2c06a',tiles:1,bk:(c,W,H)=>{c.fillStyle='#4a2e18';c.fillRect(0,0,W,H);c.strokeStyle='#d8b45e44';c.lineWidth=2;for(let i=-H;i<W;i+=34){c.beginPath();c.moveTo(i,0);c.lineTo(i+H,H);c.stroke();c.beginPath();c.moveTo(i+H,0);c.lineTo(i,H);c.stroke()}for(let x=20;x<W;x+=68)for(let y=20;y<H;y+=68)TX(c,'LW',x+(y/68%2)*34,y,'bold 26px Georgia','#e2c06a88');c.fillStyle='#4a2e18';c.beginPath();c.arc(W/2,H/2,62,0,7);c.fill();c.strokeStyle='#e2c06a';c.lineWidth=4;c.stroke();TX(c,'LW',W/2,H/2+2,'bold 64px Georgia','#e2c06a')},
  props(R){R.trunk(R.x0+3,R.z0+4.2);R.trunk(R.x0+5.4,R.z0+4.2,1);R.trunk(R.x0+4.2,R.z0+4.2,2);R.bag(R.x0+21,R.z0+4.4,'#6a4a2a');R.bag(R.x0+23.2,R.z0+4.4,'#6a4a2a');R.rack(R.x0+22,R.z0+8,['#4a2e18','#c9a24b','#4a2e18']);R.sofa(R.x0+4,R.z0+9,'#6a4a2a')}}
};
BRD.studios=STU;

/* a toolbox of props: every box is a plain cube so the whole studio is a few draw calls */
function toolbox(rm,x0,z0,w,d,pc){
 const bx=(a,b2,c2,col,x,y,z,cl)=>rm.box(a,b2,c2,col,x,y,z,cl),gl=(a,b2,c2,col,x,y,z)=>rm.glow(a,b2,c2,col,x,y,z);
 return{x0,z0,w,d,cx:x0+w/2,
  shoe(x,z,col,acc){bx(.9,.9,.9,'#e8e8ec',x,.45,z,1);bx(.95,.06,.95,pc,x,.93,z);bx(.6,.2,.26,col,x,1.06,z);bx(.22,.14,.26,acc||'#f4f4f4',x+.3,1.0,z);bx(.2,.28,.24,col,x-.22,1.22,z);gl(.5,.04,.04,acc||pc,x,.9,z+.48)},
  rack(x,z,cols){bx(.08,1.8,.08,'#888',x,.9,z-1.2);bx(.08,1.8,.08,'#888',x,.9,z+1.2);bx(.08,.08,2.5,'#bbb',x,1.7,z);cols.forEach((c2,i)=>{bx(.5,.95,.1,c2,x,1.15,z-.95+i*(1.9/Math.max(1,cols.length-1)));bx(.26,.34,.1,c2,x,1.76,z-.95+i*(1.9/Math.max(1,cols.length-1)))})},
  crate(x,z,col,y){bx(1,.7,1,col,x,(y||0)+.35,z,!y);bx(1.04,.08,1.04,'#00000030',x,(y||0)+.74,z)},
  fridge(x,z,g){bx(1.5,2.4,1.1,'#d8dadf',x,1.2,z,1);gl(1.2,1.9,.06,g,x,1.3,z+.56);bx(1.3,.2,.1,g,x,2.5,z+.5)},
  cans(x,z,col,acc){for(let r=0;r<4;r++)for(let i=0;i<4-r;i++){bx(.34,.55,.34,(i+r)%2?col:acc,x-.7+i*.4+r*.2,.28+r*.56,z,r==0)}},
  sofa(x,z,col){bx(2.8,.5,1.1,col,x,.3,z,1);bx(2.8,.7,.28,col,x,.75,z-.5);bx(.3,.6,1.1,col,x-1.3,.6,z);bx(.3,.6,1.1,col,x+1.3,.6,z)},
  neon(x,z,col,n){for(let i=0;i<n;i++)gl(.2,.08,.9,col,x-n*.25+i*.5,.04,z+(i%2)*.4);},
  glasses(x,z){bx(2,.9,.9,'#1a1a1e',x,.45,z,1);gl(1.7,.04,.6,'#ffd890',x,.92,z);for(let i=0;i<3;i++){bx(.5,.07,.18,'#16161a',x-.6+i*.6,1.0,z);bx(.14,.06,.18,pc,x-.6+i*.6,1.0,z-.2)}},
  mirror(x,z){bx(.12,2.2,1.8,'#3a3a40',x+.7,1.3,z);bx(.04,1.9,1.5,'#cfe6f4',x+.62,1.3,z);for(let i=0;i<4;i++)gl(.08,.1,.1,'#fff2c0',x+.58,.4+i*.55,z-.95)},
  deck(x,z,col){bx(.9,.1,.1,col,x,2.2,z);bx(.1,.9,.06,col,x,2.4,z-.02)},
  table(x,z,col,w2){bx(w2||1.6,.08,.9,col,x,.8,z,1);bx(.12,.76,.12,'#333',x,.38,z)},
  screen(x,z,col){gl(.8,.5,.06,col,x,1.2,z-.2);bx(.9,.6,.08,'#222',x,1.2,z-.26)},
  spk(x,z){bx(1.3,2.2,1,'#1a1a1e',x,1.1,z,1);gl(.8,.8,.06,pc,x,1.55,z+.52);gl(.5,.5,.06,pc,x,.62,z+.52)},
  diner(x,z){bx(3,1,.8,'#e32934',x,.5,z,1);bx(3.1,.08,.9,'#f6f8fb',x,1.04,z);for(let i=0;i<4;i++){bx(.5,.1,.5,'#0a4a96',x-1.1+i*.75,.6,z+1.1);bx(.1,.55,.1,'#aaa',x-1.1+i*.75,.28,z+1.1)}},
  hurdle(x,z){bx(.08,.8,1.4,'#f4f4f4',x,.4,z);bx(.5,.08,.08,'#16161a',x,.82,z-.7);bx(.5,.08,.08,'#16161a',x,.82,z+.7)},
  stripes(x,z,col){for(let i=0;i<3;i++)bx(14,.03,.3,col,x,.05,z+i*.5)},
  wall(x,z,wd,col){gl(wd,1.8,.08,col,x+wd/2,2.2,z);bx(wd+.2,2,.06,'#15171a',x+wd/2,2.2,z-.05)},
  plant(x,z){bx(.6,.6,.6,'#8a5a3a',x,.3,z,1);bx(.9,1,.9,'#3a8a4a',x,1.1,z);bx(.5,.6,.5,'#4a9a5a',x,1.8,z)},
  shelf(x,z,cols){bx(1.2,2.2,2.6,'#e8e8ec',x,1.1,z,1);for(let y=0;y<4;y++)for(let i=0;i<4;i++)bx(.4,.26,.5,cols[(y+i)%cols.length],x+.5,.35+y*.5,z-1+i*.62)},
  trophy(x,z){bx(1.2,.9,1.2,'#e8e8ec',x,.45,z,1);bx(.4,.7,.4,'#e2b422',x,1.25,z);bx(.7,.4,.7,'#e2b422',x,1.8,z)},
  frame(x,z){bx(1.6,2,.08,'#c9a24b',x,2.5,z);bx(1.3,1.7,.04,'#2a3a30',x,2.5,z+.04);gl(.7,.9,.02,'#c9a24b66',x,2.5,z+.07)},
  bag(x,z,col){bx(1,1,1,'#e8e0cf',x,.5,z,1);bx(.8,.5,.4,col,x,1.25,z);bx(.5,.3,.06,'#c9a24b',x,1.55,z)},
  chandelier(x,z){bx(.06,1.6,.06,'#c9a24b',x,4.6,z);gl(2.4,.2,2.4,'#ffe9a8',x,3.7,z);gl(1.4,.5,1.4,'#fff2c0',x,3.4,z)},
  lights(x,z,n){for(let i=0;i<n;i++)gl(.16,.16,.16,['#e8c040','#e41e2b','#2ac07a','#4ab8e8'][i%4],x+i*1.0,4.5+Math.sin(i)*.15,z)},
  laptop(x,z){bx(.7,.04,.5,'#cfd2d8',x,.84,z);bx(.7,.5,.03,'#cfd2d8',x,1.08,z-.25);gl(.6,.4,.02,'#bfe0ff',x,1.08,z-.23)},
  trunk(x,z,k){const h=[1.1,.9,.7][k||0],y=[0,1.1,2.0][k||0];bx(2.2,h,1.3,'#6a4a2a',x+(k==2?.8:0),y+h/2,z,!y);bx(2.24,.1,1.34,'#c9a24b',x+(k==2?.8:0),y+h*.3,z);bx(.3,.2,.1,'#e2c06a',x+(k==2?.8:0),y+h*.6,z+.68)}}}

/* signs inside the studio are their own textured planes: the city's shared sign atlas can be full */
function plane(C,rm,face,c,a,b,y0,y1,pw,ph,fn){const cv=document.createElement('canvas');cv.width=pw;cv.height=ph;fn(cv.getContext('2d'),pw,ph);const tx=new THREE.CanvasTexture(cv),g=new THREE.PlaneGeometry(Math.abs(b-a),y1-y0),m=new THREE.MeshBasicMaterial({map:tx}),mesh=new THREE.Mesh(g,m);
 g.userData.dsOwn=1;m.userData.dsOwn=1;mesh.userData.dsOwn=1;(C.hqTex=C.hqTex||[]).push(tx);
 if(face=='z')mesh.position.set((a+b)/2,(y0+y1)/2,c);else{mesh.rotation.y=Math.PI/2;mesh.position.set(c,(y0+y1)/2,(a+b)/2)}rm.g.add(mesh)}
D.hooks.push((ev,C)=>{if(ev=='leave'&&C&&C.hqTex){C.hqTex.forEach(t=>t.dispose());C.hqTex=null}});
/* the room itself: 26 x 18, far east of the city next to the other interiors */
function studio(C,o){const b=BRD.by(o.b),sp=STU[o.b],pc=sp.nc,x0=RMX,z0=RMZ,w=RMW,d=RMD,cx=x0+w/2;
 const rm=D.mkRoom('brand',x0,z0,w,d,{floor:sp.fl,wall:sp.wl,h:5.4,tiles:sp.tiles,name:b.n+' HQ studio'});if(!rm)return;
 const bx=(a,b2,c2,col,x,y,z,cl)=>rm.box(a,b2,c2,col,x,y,z,cl),gl=(a,b2,c2,col,x,y,z)=>rm.glow(a,b2,c2,col,x,y,z);
 const R=toolbox(rm,x0,z0,w,d,pc);R.rm=rm;
 /* the room's own floor quad shows up dark here, so lay a real slab on it */
 bx(w,.06,d,sp.fl,cx,.03,z0+d/2);
 /* back wall: the brand's backdrop painted large, with a frame and a light bar */
 plane(C,rm,'z',z0+.08,x0+3.5,x0+w-3.5,.5,4.9,1024,352,(c,W,H)=>{c.save();c.scale(W/640,H/224);sp.bk(c,640,224);c.restore()});
 bx(w-6.6,.12,.12,'#111',cx,5,z0+.3);for(let i=0;i<7;i++)gl(.5,.14,.4,'#fff6d8',x0+4.4+i*(w-8.8)/6,4.92,z0+.34);
 /* the left wall: the logo and the brand's name */
 plane(C,rm,'x',x0+.08,z0+7,z0+13,1.2,4.2,384,192,(c,W,H)=>{c.save();c.scale(2,2);W=192;H=96;c.fillStyle=sp.wl;c.fillRect(0,0,W,H);c.fillStyle=pc;c.fillRect(6,6,W-12,H-12);c.fillStyle=sp.wl;c.fillRect(10,10,W-20,H-20);BRD.paint(c,o.b,W/2-26,8,52);c.font='bold 17px Arial';c.fillStyle='#222';c.textAlign='center';c.fillText(b.n.toUpperCase(),W/2,H-12);c.restore()});
 /* the set: a low platform with a sweep of colour, two softboxes and a light stand */
 bx(13,.1,7,dk(sp.fl,.8),cx,.07,z0+5.4);bx(11,.12,5,sp.wl==sp.fl?'#cccccc':sp.wl,cx,.09,z0+5.4);gl(11.4,.04,.1,pc,cx,.16,z0+8.1);
 [[-7.4,6.4,.7],[7.4,6.4,.7],[-5.2,9.2,.4]].forEach(([dx,dz,s])=>{bx(.14,2.4,.14,'#222',cx+dx,1.2,z0+dz,1);bx(1.6*(s+.3),1.5*(s+.3),.3,'#2c2f38',cx+dx,2.9,z0+dz+.1);gl(1.3*(s+.3),1.2*(s+.3),.1,'#fffbe8',cx+dx,2.9,z0+dz+.3)});
 bx(w-6,.08,.08,'#222',cx,4.3,z0+7);for(let i=0;i<4;i++){bx(.4,.3,.4,'#222',cx-5+i*3.3,4.1,z0+7);gl(.3,.1,.3,'#fff6d8',cx-5+i*3.3,3.92,z0+7)}
 /* camera on a tripod and the photographer behind it */
 [[-.5,-.4],[.5,-.4],[0,.5]].forEach(([a,c2])=>bx(.07,1.5,.07,'#222',cx+a,.75,z0+11.2+c2));bx(.5,.36,.5,'#1a1a1e',cx,1.62,z0+11.2);bx(.26,.26,.5,'#333',cx,1.62,z0+10.8);gl(.18,.18,.05,'#7ab8ff',cx,1.62,z0+10.5);
 try{[[cx+1.1,z0+12,Math.PI],[x0+2.4,z0+15,Math.PI/2]].forEach(([x,z,ry])=>{const ch=buildChar(fCfg());ch.g.position.set(OX+x,0,OZ+z);ch.g.rotation.y=ry;scene.add(ch.g);rm.extra.push(ch.g)})}catch(e){}
 /* the front desk with a sign, and a make-up station */
 bx(1,1.1,4,dk(sp.wl,.85),x0+1.6,.55,z0+15,1);bx(1.06,.08,4.1,pc,x0+1.6,1.12,z0+15);gl(.8,.3,2.6,'#ffffff',x0+1.1,.6,z0+15);
 bx(1.2,.5,.5,'#2a2a30',x0+w-1.4,.5,z0+15.5,1);bx(.12,2,1.6,'#3a3a40',x0+w-.6,1.3,z0+15.5);bx(.04,1.7,1.4,'#cfe6f4',x0+w-.67,1.3,z0+15.5);for(let i=0;i<4;i++)gl(.08,.1,.1,'#fff2c0',x0+w-.7,.5+i*.5,z0+14.7);
 R.plant(x0+1.4,z0+3);R.plant(x0+w-1.4,z0+3);
 try{sp.props(R)}catch(e){console.error('studio props',e)}
 /* floor tile in the brand colour by the door */
 bx(4,.05,1.6,pc,cx,.04,z0+d-.9);
 rm.int(cx,z0+9.6,2.8,'Start the photoshoot',()=>{const j=BRD.active();if(!j||j.d!=C.id){snd('err');return say('There is no shoot booked here today.')}BRD.begin(j)});
 rm.int(cx,z0+d-1.2,1.8,'Go back outside',()=>{const h=C.hq;D.fade(()=>D.goOut(h?h.out.x:C.air.x1+10,h?h.out.z:C.mid+1.5,0))});
 rm.int(x0+w-3.4,z0+d-1.4,1.8,'Company car to the airport',()=>D.fade(()=>D.goOut(C.air.x1+10,C.mid+1.5,Math.PI/2),()=>say(b.n+' sends a car: it drops you at the airport.')));
 rm.int(x0+4.6,z0+13.2,2,'Ask the front desk',()=>{const j=BRD.active();say(j&&j.d==C.id?'Front desk: "The studio is through here. Meet the photographer by the lights, and the car back to the airport is on '+b.n+'."':'Front desk: "Thanks for visiting."')});
 rm.done()}
D.cityHooks.push(C=>{const o=BRD.active();if(!(o&&o.k=='trip'&&o.d==C.id&&C.hq&&STU[o.b]))return;try{if(BRD.hqBuild)try{BRD.hqBuild(C,o);return}catch(e){console.error('brand rooms',e)}studio(C,o)}catch(e){console.error('brand studio',e);C.hq=null}});

/* ---------- a company car waits when you walk out of the airport ---------- */
const modal=h=>{mode='menu';$('ui').innerHTML=h};
window.bdCar=function(){const C=D.C,o=BRD.active();closeUI();if(!C||!C.hq||!o)return;D.fade(()=>D.goOut(C.hq.out.x,C.hq.out.z,0),()=>say('The car drops you at the '+BRD.by(o.b).n+' HQ. Walk up to the front door.'))};
window.bdWalk=function(){const o=BRD.active();if(o)o.nx=Date.now()+120000;closeUI()};
setInterval(()=>{try{const o=BRD.active();if(!o||o.k!='trip'||BRD.shootOn)return;
 if(!(D.on&&D.id==o.d&&D.C&&D.C.hq&&T()&&T().loc()==o.d)||typeof mode=='undefined'||mode!='play'||D.view||D.room)return;
 if(typeof window.apWhere=='function'&&window.apWhere())return;if(o.nx&&Date.now()<o.nx)return;
 if(typeof P!='undefined'&&Math.hypot(P.x-OX-D.C.hq.x,P.z-OZ-D.C.hq.z)<14)return;
 const b=BRD.by(o.b);o.nx=Date.now()+180000;snd('ping');
 modal(`<div class="box modal bsx"><h2><img src="${BRD.logo(o.b,64)}">${esc(b.n)} car <small>${esc(BRD.place(o))}</small></h2><img class=bsfac src="${BRD.facade(o.b,BRD.place(o))}">
 <p class=m>Welcome to ${esc(BRD.place(o))}. A company car from ${esc(b.n)} is waiting outside the airport and will take you to their HQ. It is all on the brand.</p>
 <div class=row2><button class=go onclick="bdCar()">Take the company car</button><button onclick="bdWalk()">I will walk</button></div></div>`)}catch(e){console.error('brand car',e)}},1500);
})();
