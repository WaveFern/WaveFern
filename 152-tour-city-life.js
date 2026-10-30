/* ---------- v43.8.0: tour cities, part 3: landmarks, a hotel room, shop interiors ----------
   Adds to the destination cities (150-tour-cities.js, DCITY):
   - every city's best-known landmark, built from simple original shapes on the block nearest the middle of town,
     with a selfie spot (once a day per city: a few followers and an Instagrime post)
   - the hotel: a lobby with a reception desk (check in for the night), a lift and your own room with a bed to sleep in,
     a window over the city, a TV, a minibar and a shower; you wake up there in the morning
   - interiors behind the shopfronts: restaurants, cafés, convenience stores, souvenir shops, record shops and office
     lobbies; walk in through the door, buy at the counter, walk out where you came in */
(function(){
const D=window.DCITY;if(!D)return;
const OX=4000,OZ=-4000;
const B=(G,w,h,d,c,x,y,z,ry)=>xgBox(G,w,h,d,c,x,y,z,ry);
const PR=(G,r0,r1,h,n,c,x,y,z,o)=>xgPrism(G,r0,r1,h,n,c,x,y,z,o);
const P4={ph:Math.PI/4};

/* ---------- landmarks ---------- */
/* a lattice tower on four legs (Paris, Tokyo) */
function lattice(G,Gw,x,z,b,H,c,c2,lit){const H1=H*.42,r1=b*.2,rr=t=>r1+(b-r1)*Math.pow(1-t,1.8),N=16;
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{for(let i=0;i<N;i++){const t0=i/N,t1=(i+1)/N,r=(rr(t0)+rr(t1))/2,y0=t0*H1,y1=t1*H1,th=Math.max(.5,b*.13*(1-t0*.6));B(G,th,y1-y0+.15,th,c2&&i%3==2?c2:c,x+sx*r*.7,(y0+y1)/2,z+sz*r*.7)}});
 const pl=(t,y)=>{const r=rr(t)*.7+1;B(G,r*2,.8,r*2,c,x,y,z);B(Gw,r*2+.1,.25,r*2+.1,lit,x,y+.55,z)};
 [[.24,H1*.24],[.55,H1*.55]].forEach(([t,y])=>pl(t,y));
 for(const sx of [-1,1]){const r=rr(.18)*.7;for(let k=0;k<=8;k++){const a=k/8*Math.PI,ax=Math.cos(a)*r*.82,ay=H1*.08+Math.sin(a)*H1*.1;B(G,.6,.6,.6,c,x+ax,ay,z+sx*r);B(G,.6,.6,.6,c,x+sx*r,ay,z+ax)}}
 const seg=8,h2=H*.93-H1;for(let i=0;i<seg;i++){const t0=i/seg,t1=(i+1)/seg,ra=r1*1.4*(1-t0*.8)+.3,rb=r1*1.4*(1-t1*.8)+.3;PR(G,ra,rb,h2/seg,4,c2&&i%2?c2:c,x,H1+t0*h2,z,P4);PR(Gw,ra+.08,ra+.06,.25,4,lit,x,H1+t0*h2+.2,z,P4)}
 B(G,r1*2.4+1,.8,r1*2.4+1,c,x,H1,z);B(Gw,r1*2.4+1.1,.25,r1*2.4+1.1,lit,x,H1+.55,z);
 B(G,1.8,2.2,1.8,c2||c,x,H*.93+1.1,z);PR(G,.35,.08,H*.08,6,'#c8ccd2',x,H*.93+2.2,z);B(Gw,.5,.5,.5,'#ff3030',x,H*1.01+2.2,z)}
/* a tall concrete tower with a pod (Toronto, Seoul, Johannesburg, Auckland) */
function needle(G,Gw,x,z,H,y0,o){o=o||{};const c=o.c||'#d8d4cc',hp=H*(o.pod||.72);PR(G,6,6,4,12,'#b8b4ac',x,y0,z);PR(G,o.w||3,1.4,hp,6,c,x,y0,z);
 PR(G,4.6,4.8,1,16,c,x,y0+hp-1,z);PR(Gw,4.7,4.7,1.6,16,'#bfe0ff',x,y0+hp,z);PR(G,4.8,4.4,1.4,16,c,x,y0+hp+1.6,z);PR(G,2.6,2.4,1.6,12,c,x,y0+hp+3,z);PR(Gw,2.5,2.5,.7,12,'#ffd890',x,y0+hp+3.4,z);
 PR(G,1.2,.18,H-hp-4,6,o.ant||'#c8c8cc',x,y0+hp+4.6,z);B(Gw,.5,.5,.5,'#ff3030',x,y0+H+.6,z)}
function hill(G,x,z,r,h,c){PR(G,r,r*.35,h,12,c||'#5e8a52',x,0,z);PR(G,r*.35,0,h*.08,12,c||'#5e8a52',x,h,z)}
function clockFaces(G,Gw,x,z,half,y,r){D.quadZ(Gw,x-r,x+r,y-r,y+r,z+half+.06,'#fff2c0');D.quadX(Gw,z-r,z+r,y-r,y+r,x+half+.06,'#fff2c0');
 B(G,.12,r*1.4,.08,'#1a1a1a',x,y+r*.25,z+half+.12);B(G,r*.9,.12,.08,'#1a1a1a',x+r*.3,y,z+half+.12);B(G,.08,r*1.4,.12,'#1a1a1a',x+half+.12,y+r*.25,z);B(G,.08,.12,r*.9,'#1a1a1a',x+half+.12,y,z+r*.3)}
function spire(G,x,z,y,r,h,c,tip){PR(G,r,0,h,4,c,x,y,z,P4);if(tip)PR(G,.18,0,1.6,6,tip,x,y+h,z)}
/* each builder gets (G,Gw,b) with the block b and returns [name, height] */
const LM={
 par:(G,Gw,b)=>{lattice(G,Gw,b.mx,b.mz,Math.min(b.w,b.dz)*.42,88,'#7a6248',null,'#ffd27a');gardens(G,b);return['Eiffel Tower',92]},
 tyo:(G,Gw,b)=>{lattice(G,Gw,b.mx,b.mz,Math.min(b.w,b.dz)*.42,96,'#e8452c','#f4f2ee','#ffb070');return['Tokyo Tower',100]},
 lon:(G,Gw,b)=>{const x=b.x1-5,z=b.mz;B(G,5.6,30,5.6,'#d8c08a',x,15,z);for(let y=4;y<29;y+=3.2){D.quadZ(Gw,x-2,x+2,y,y+1.6,z+2.86,'#ffe2a8');D.quadX(Gw,z-2,z+2,y,y+1.6,x+2.86,'#ffe2a8')}
  B(G,6.4,6.4,6.4,'#cdb47e',x,33.2,z);clockFaces(G,Gw,x,z,3.2,33.2,2.3);B(G,5.4,3,5.4,'#c8ae78',x,37.9,z);[-1.6,0,1.6].forEach(o=>{D.quadZ(G,x+o-.4,x+o+.4,37,38.8,z+2.76,'#3a2a1a');D.quadX(G,z+o-.4,z+o+.4,37,38.8,x+2.76,'#3a2a1a')});
  spire(G,x,z,39.4,3.9,10,'#5a6a5a','#d8b860');[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>PR(G,.4,0,3,4,'#d8b860',x+a*2.6,39.4,z+c*2.6,P4));
  const hx0=b.x0+1,hx1=x-3.4;B(G,hx1-hx0,11,b.dz*.5,'#d4bc86',(hx0+hx1)/2,5.5,z);for(let a=hx0+1.5;a<hx1-1;a+=2.6){PR(G,.35,0,4,4,'#c8ae78',a,11,z+b.dz*.25-.3,P4);D.quadZ(Gw,a-.5,a+.5,2,9,z+b.dz*.25+.04,'#ffd890')}
  return['Big Ben',50]},
 nyc:(G,Gw,b)=>{const x=b.mx,z=b.mz,g='#5fa89a';PR(G,9,9,3,10,'#9a948a',x,0,z);B(G,8,11,8,'#b8b0a0',x,8.5,z);B(G,9,1,9,'#a8a090',x,14.5,z);
  PR(G,2.6,1.6,11,10,g,x,15,z);B(G,3.6,1.4,2.2,g,x,26,z);PR(G,1,.9,1.8,8,g,x,26.7,z);for(let i=0;i<7;i++){const a=-Math.PI*.1-i/6*Math.PI*.8;B(G,.2,1.4,.2,g,x+Math.cos(a)*1.1,28.6,z+Math.sin(a)*-1.1)}
  B(G,.8,6,.8,g,x+1.6,30,z);PR(G,.5,.9,1.1,8,'#d8b860',x+1.6,33,z);B(Gw,.9,1.1,.9,'#ffb030',x+1.6,34.6,z);B(G,1.6,2.2,.5,g,x-1.9,22,z+.6);B(G,.7,4,.7,g,x-1.6,22.5,z);
  return['Statue of Liberty',36]},
 rio:(G,Gw,b)=>{const x=b.mx,z=b.mz,r=Math.min(b.w,b.dz)/2-.5;hill(G,x,z,r,12,'#4a7a42');D.tree(G,x-r*.6,z+r*.4,'#3a6a32');D.tree(G,x+r*.5,z+r*.5,'#3a6a32');const y=12.9,c='#ece8de';
  B(G,3,4,3,'#d8d4c8',x,y+2,z);PR(G,1.7,1.1,10,8,c,x,y+4,z);B(G,15,1.3,1.5,c,x,y+12.6,z);PR(G,.85,.75,1.5,8,c,x,y+14,z);D.quadZ(Gw,x-7,x+7,y+12.2,y+13.3,z+.8,'#fff8e0');return['Christ the Redeemer',y+16]},
 tor:(G,Gw,b)=>{needle(G,Gw,b.mx,b.mz,150,0,{w:4,pod:.62});return['CN Tower',150]},
 jnb:(G,Gw,b)=>{needle(G,Gw,b.mx,b.mz,96,0,{pod:.82,c:'#c8c4bc'});return['Hillbrow Tower',96]},
 nzl:(G,Gw,b)=>{needle(G,Gw,b.mx,b.mz,92,0,{pod:.7,c:'#e8e8e4',ant:'#d8d8d8'});return['Sky Tower',92]},
 sel:(G,Gw,b)=>{const r=Math.min(b.w,b.dz)/2-.5;hill(G,b.mx,b.mz,r,10,'#4e7a46');needle(G,Gw,b.mx,b.mz,60,10,{pod:.66,c:'#f0f0ee'});return['N Seoul Tower',70]},
 mex:(G,Gw,b)=>{const x=b.mx,z=b.mz;[7,5.6,4.4].forEach((r,i)=>PR(G,r,r,1.2,8,'#c8c0b0',x,i*1.2,z));B(G,4,4,4,'#d8d0c0',x,5.6,z);PR(G,1.3,1.05,28,12,'#ece4d4',x,7.6,z);B(G,2.8,1.4,2.8,'#d8d0c0',x,36.3,z);
  const gd='#e8c040';PR(G,.8,.45,3.4,8,gd,x,37,z);B(G,3.6,1.8,.3,gd,x,39.4,z-.3);B(G,.3,2.6,.3,gd,x+.6,41.2,z);B(Gw,1.2,.4,.4,'#ffe080',x+.6,42.6,z);return['Angel of Independence',43]},
 bue:(G,Gw,b)=>{const x=b.mx,z=b.mz;B(G,8,1,8,'#c8c4bc',x,.5,z);PR(G,2.4,1.5,56,4,'#f0ece4',x,1,z,P4);PR(G,1.5,0,3,4,'#e8e4dc',x,57,z,P4);D.quadZ(Gw,x-.6,x+.6,44,45.4,z+1.15,'#ffe8b0');return['Obelisco',60]},
 col:(G,Gw,b)=>church(G,Gw,b,'#f2ead2','#c8382a','the old town church'),
 chl:(G,Gw,b)=>church(G,Gw,b,'#f4e2b0','#8a5a3a','the hillside church'),
 man:(G,Gw,b)=>townhall(G,Gw,b,'#b8a888','#5a6a5a',0,'Manchester Town Hall'),
 swe:(G,Gw,b)=>townhall(G,Gw,b,'#a8482e','#5a8a6a',1,'the City Hall tower'),
 ber:(G,Gw,b)=>{const x=b.mx,z=b.mz,c='#e0d4b4';B(G,24,1,7,'#c8bc9c',x,.5,z);for(let i=0;i<6;i++)PR(G,.75,.7,11,10,c,x-10+i*4,1,z+1.6);for(let i=0;i<6;i++)PR(G,.75,.7,11,10,c,x-10+i*4,1,z-1.6);
  [-12,12].forEach(o=>B(G,3,11,7,c,x+o,6.5,z));B(G,26,2.8,7.4,c,x,13.4,z);B(G,11,2,4,c,x,15.8,z);const g='#3a6a5a';B(G,3,1.4,1.6,g,x,17.5,z);for(let i=0;i<4;i++)B(G,.7,1.8,2.2,g,x-2.4+i*1.6,17.7,z+.6);B(G,.4,2.6,.4,g,x,19.3,z);
  D.quadZ(Gw,x-12,x+12,13,13.4,z+3.75,'#ffe2a8');return['Brandenburg Gate',20]},
 mad:(G,Gw,b)=>{const x=b.mx,z=b.mz,c='#e4d8bc';[-9,-3,3,9].forEach(o=>B(G,3,9,4,c,x+o,4.5,z));[-6,6].forEach(o=>{B(G,3,1.2,4.2,c,x+o,8.4,z)});B(G,22,1.2,4.4,c,x,9.6,z);B(G,9,4,3.8,c,x,12.2,z);B(G,4,1.6,2,'#c8b890',x,15,z);
  [[-6,6],[0,8],[6,6]].forEach(([o,h])=>{D.quadZ(G,x+o-1.5,x+o+1.5,0,h,z+2.04,'#2a241c');for(let k=0;k<6;k++){const a=k/5*Math.PI;B(G,.5,.5,.3,c,x+o+Math.cos(a)*1.5,h+Math.sin(a)*1.1,z+2.1)}});
  for(let i=0;i<4;i++)D.quadZ(Gw,x-10+i*6.6,x-9+i*6.6,10.4,11,z+2.25,'#ffe2a8');return['Puerta de Alcalá',17]},
 bcn:(G,Gw,b)=>{const x=b.mx,z=b.mz,c='#c8b48a';B(G,b.w*.62,12,b.dz*.5,c,x,6,z);PR(G,3,0,10,8,'#b8a47a',x,12,z);
  [[-7,-3,30],[-3.5,-3.4,36],[3.5,-3.4,36],[7,-3,30],[-6,3,26],[6,3,26],[0,0,48]].forEach(([dx,dz2,h])=>{const r=h>40?2.4:1.5;PR(G,r,.25,h,8,c,x+dx,0,z+dz2);for(let y=6;y<h-4;y+=3)PR(G,r*(1-y/h)+.12,r*(1-(y+.4)/h)+.12,.4,8,'#a8946a',x+dx,y,z+dz2);B(G,.7,.7,.7,['#e84a3a','#e8b830','#4a9a5a'][Math.abs(dx|0)%3],x+dx,h+.2,z+dz2);
   D.quadZ(Gw,x+dx-.3,x+dx+.3,h*.4,h*.55,z+dz2+r*.8,'#ffd890')});B(Gw,1,1,1,'#fff2c0',x,49,z);return['Sagrada Família',50]},
 rom:(G,Gw,b)=>{const k=.8,x=b.mx,z=b.mz,a=Math.min(b.w/2-1,(b.dz/2-4)/k,15),c='#d8b88a',n=32;PR(G,a,a,15,n,c,x,0,z,{sz:k,cap:false});PR(G,a-2.6,a-2.6,15,n,dk(c,.85),x,0,z,{sz:k,inv:1,cap:false});xgRing(G,a-2.6,a,15,n,dk(c,1.05),x,z,{sz:k});
  const fl=[];for(let i=0;i<n;i++){const t=i/n*Math.PI*2;fl.push([x+Math.cos(t)*(a-2.6),z+Math.sin(t)*(a-2.6)*k])}xgPoly(G,fl,.4,'#d8c08a',x,z);
  for(let i=0;i<n;i++){const t=(i+.5)/n*Math.PI*2,px=x+Math.cos(t)*(a+.05),pz=z+Math.sin(t)*(a+.05)*k,ry=-Math.atan2(Math.sin(t)*k,Math.cos(t))+Math.PI/2;for(let tier=0;tier<3;tier++)B(G,1.3,2.6,.25,'#4a3424',px,1.6+tier*4.4,pz,ry)}
  for(let i=0;i<n;i+=2){const t=(i+.5)/n*Math.PI*2;B(Gw,.6,.6,.6,'#ffcf80',x+Math.cos(t)*(a+.4),.4,z+Math.sin(t)*(a+.4)*k)}return['Colosseum',15]},
 ams:(G,Gw,b,C)=>{const x=b.mx,z=b.mz;PR(G,4.5,4.5,3,8,'#8a3a2a',x,0,z);PR(G,3.4,2.2,11,8,'#3a3e3a',x,3,z);B(G,7.4,.4,7.4,'#5a4a3a',x,6,z);PR(G,2.4,1.2,2.2,8,'#2a2a2a',x,14,z);D.quadZ(Gw,x-.6,x+.6,8,9.4,z+2.75,'#ffd890');
  const g=new THREE.Group(),m1=new THREE.MeshLambertMaterial({color:'#f2ede0'}),m2=new THREE.MeshLambertMaterial({color:'#8a2a2a'});for(let i=0;i<4;i++){const arm=new THREE.Group();const s1=new THREE.Mesh(new THREE.BoxGeometry(.4,9,.2),m2);s1.position.y=4.5;arm.add(s1);const s2=new THREE.Mesh(new THREE.BoxGeometry(1.8,7,.1),m1);s2.position.set(1,5.3,0);arm.add(s2);arm.rotation.z=i*Math.PI/2;g.add(arm)}
  g.position.set(OX+x,14.4,OZ+z+2.9);scene.add(g);C.extra.push(g);(C.spin=C.spin||[]).push(g);return['the canal windmill',24]},
 irl:(G,Gw,b)=>{const x=b.mx,z=b.mz;PR(G,2.8,2.3,24,12,'#9a948a',x,0,z);PR(G,2.5,0,5,12,'#5a5650',x,24,z);D.quadZ(G,x-.4,x+.4,5,6.6,z+2.7,'#2a241c');D.quadZ(Gw,x-.3,x+.3,20,21,z+2.4,'#ffd890');
  B(G,8,3.4,.8,'#8a8478',x-6,1.7,z+4);B(G,.8,3.4,6,'#8a8478',x-9.6,1.7,z+1.4);B(G,.4,3.2,.4,'#9a948a',x+5,1.6,z+4);B(G,1.6,.4,.4,'#9a948a',x+5,2.6,z+4);xgRing(G,.4,.6,2.6,10,'#9a948a',x+5,z+4.2);return['the round tower',29]},
 lag:(G,Gw,b)=>{const x=b.mx,z=b.mz;PR(G,11,12,6,20,'#8a8e94',x,0,z);for(let i=0;i<20;i++){const t=i/20*Math.PI*2;B(G,1.6,1.4,3.6,'#5a5e64',x+Math.cos(t)*12.4,6.6,z+Math.sin(t)*12.4,-t)}PR(G,10,7,2.4,20,'#6a6e74',x,6,z);PR(Gw,11.1,11.1,.6,20,'#ffd890',x,3,z);return['National Theatre',9]},
 cpt:(G,Gw,b)=>{const x=b.mx,z=b.mz;B(G,3.2,12,3.2,'#c8382a',x+4,6,z);B(G,3.8,3.8,3.8,'#e8e0d0',x+4,13.9,z);clockFaces(G,Gw,x+4,z,1.9,13.9,1.3);spire(G,x+4,z,15.8,2.4,3,'#3a3a3a');
  [-5,-2].forEach(o=>{B(G,.2,1.2,.2,'#333',x+o,.6,z+4);B(G,.4,.4,.9,'#556',x+o,1.3,z+4)});return['Table Mountain view',19]},
 cai:(G,Gw,b,C)=>{const x=b.mx,z=b.mz,c='#d8b878';B(G,4.4,3.6,11,c,x,1.8,z-1);B(G,1.3,1.1,4,c,x-1.4,.55,z+6);B(G,1.3,1.1,4,c,x+1.4,.55,z+6);B(G,3,3.4,3,c,x,5.3,z+3.4);B(G,.6,3,2.6,'#c8a868',x-1.6,4.8,z+3.2);B(G,.6,3,2.6,'#c8a868',x+1.6,4.8,z+3.2);
  B(G,3.2,.5,3,'#c8a868',x,7.2,z+3.2);PR(G,7,0,7,4,c,x+b.w*.3,0,z-b.dz*.2,P4);const P2=D.mkG();[[C.cx-70,-120,46,42],[C.cx+20,-150,56,52],[C.cx+100,-110,30,27]].forEach(([px,pz,r,h])=>PR(P2,r,0,h,4,'#d8b878',px,0,pz,P4));D.flushTo(P2,C.g);return['Pyramids and Sphinx',9]},
 ken:(G,Gw,b)=>{const x=b.mx+2,z=b.mz;PR(G,4.6,4.6,28,16,'#c8784a',x,0,z);for(let y=3;y<27;y+=2.4)PR(Gw,4.66,4.66,.9,16,'#ffd890',x,y,z);PR(G,8.6,8.6,1.2,22,'#b86a3a',x,28,z);PR(G,4,2,2,16,'#a85a2a',x,29.2,z);PR(G,8,5.5,5,16,'#b86a3a',x-9,0,z+2);return['KICC tower',32]},
 mar:(G,Gw,b)=>{const x=b.mx+3,z=b.mz-1,c='#c8865a';B(G,6.4,34,6.4,c,x,17,z);for(let y=6;y<32;y+=7){D.quadZ(G,x-1,x+1,y,y+3,z+3.24,'#5a3a2a');D.quadX(G,z-1,z+1,y,y+3,x+3.24,'#5a3a2a')}D.quadZ(Gw,x-3.2,x+3.2,31,32,z+3.25,'#3a9a8a');
  for(let i=-1;i<=1;i++){B(G,.8,1,.4,c,x+i*2.4,34.5,z+3);B(G,.4,1,.8,c,x+3,34.5,z+i*2.4)}B(G,3.6,5,3.6,c,x,36.5,z);D.dome(G,1.5,x,39,z,'#c8865a');[0,1,2].forEach(i=>PR(G,.5-i*.08,.5-i*.08,.6,8,'#e8c040',x,40.6+i*.8,z));
  D.fountain(G,b.x0+5,b.z1-5,2,{stone:'#3a8a8a'});return['the Koutoubia minaret',42]},
 osa:(G,Gw,b)=>{const x=b.mx,z=b.mz;PR(G,10.5,8.5,7,4,'#8a8478',x,0,z,P4);const ws=[10,8.6,7.2,5.8,4.4];ws.forEach((w,i)=>{const y=7+i*4.6;B(G,w,3.6,w*.82,'#f4f2ec',x,y+1.8,z);D.quadZ(Gw,x-w/2+.6,x+w/2-.6,y+1.4,y+2.4,z+w*.41+.04,'#ffe2a8');PR(G,w*.8,w*.55,1.2,4,'#3a8a7a',x,y+3.6,z,{ph:Math.PI/4,sz:.82})});
  PR(G,2.4,0,1.6,4,'#3a8a7a',x,7+5*4.6,z,P4);[-1.2,1.2].forEach(o=>B(G,.4,.8,.3,'#e8c040',x+o,7+5*4.6+.8,z));return['Osaka Castle',33]},
 sha:(G,Gw,b)=>{const x=b.mx,z=b.mz;[0,2.1,4.2].forEach(a=>PR(G,.9,.8,22,8,'#c8c8d0',x+Math.cos(a)*5,0,z+Math.sin(a)*5));const ball=(y,R,c)=>{for(let k=-3;k<3;k++){const r0=R*Math.cos(Math.asin(k/3)),r1=R*Math.cos(Math.asin((k+1)/3));PR(G,r0,r1,R/3,16,c,x,y+R*k/3,z)}PR(Gw,R*1.01,R*1.01,.5,16,'#ff8ad0',x,y-.25,z)};
  ball(20,7,'#c84a9a');PR(G,1.8,1.2,40,8,'#d8d8de',x,20,z);ball(56,4.6,'#c84a9a');PR(G,1.1,.6,10,8,'#d8d8de',x,60,z);ball(71,1.8,'#d85aa8');PR(G,.5,.1,14,6,'#c8c8cc',x,72,z);B(Gw,.5,.5,.5,'#ff3030',x,86.4,z);return['Oriental Pearl Tower',87]},
 mum:(G,Gw,b)=>{const x=b.mx,z=b.mz,c='#d8b878';B(G,18,14,7,c,x,7,z);D.quadZ(G,x-2.6,x+2.6,0,9,z+3.55,'#2a2014');for(let k=0;k<7;k++){const a=k/6*Math.PI;B(G,.6,.6,.3,dk(c,.9),x+Math.cos(a)*2.6,9+Math.sin(a)*1.8,z+3.6)}
  [-7,7].forEach(o=>{D.quadZ(G,x+o-1,x+o+1,1,5,z+3.55,'#3a2a1a');D.quadZ(Gw,x+o-.8,x+o+.8,8,10,z+3.56,'#ffe2a8')});[[-8.4,-3],[8.4,-3],[-8.4,3],[8.4,3]].forEach(([a,c2])=>{PR(G,1.1,1.1,3,8,c,x+a,14,z+c2);D.dome(G,1.2,x+a,17,z+c2,'#c8a868')});D.dome(G,3,x,14,z,'#c8a868','#d8b860');return['Gateway of India',20]},
 dxb:(G,Gw,b)=>{const x=b.mx,z=b.mz,c='#a8c0d4';let y=0;const T=[[16,22],[13,20],[11,20],[9,18],[7.4,16],[6,16],[4.6,14],[3.4,12],[2.4,10]];T.forEach(([L,h],i)=>{for(let k=0;k<3;k++){const a=k*Math.PI*2/3+i*.35;B(G,L,h,L*.42,i%2?c:'#b8ccdc',x+Math.cos(a)*L*.3,y+h/2,z+Math.sin(a)*L*.3,-a)}
   for(let yy=y+1;yy<y+h;yy+=3)PR(Gw,L*.62,L*.62,.35,6,'#dff0ff',x,yy,z);y+=h});PR(G,1.2,0,26,6,'#d8e0e8',x,y,z);B(Gw,.6,.6,.6,'#ff3030',x,y+26,z);return['Burj Khalifa',y+26]},
 syd:(G,Gw,b)=>{const x=b.mx,z=b.mz,S=G;B(G,b.w*.86,2.6,b.dz*.66,'#d8c4a0',x,1.3,z);D.quadZ(Gw,x-b.w*.4,x+b.w*.4,.6,1.8,z+b.dz*.33+.04,'#ffd890');
  const shell=(cx,cz,w,h,dir)=>{const n=8,pts=[];for(let i=0;i<=n;i++){const t=i/n,a=(t-.5)*Math.PI*.9;pts.push([cx+Math.sin(a)*w/2,2.6,cz+Math.cos(a)*w*.25*dir])}const ap=[cx,2.6+h,cz-dir*w*.42],B2=xgCell(S,cx,cz);for(let i=0;i<n;i++){xgTri(B2,pts[i],pts[i+1],ap,'#f6f4ec');xgTri(B2,pts[i+1],pts[i],ap,'#e8e6de')}};
  [[-8,0,7,13,1],[-8,-5,6,10,1],[-8,-9,5,7,1],[4,1,8,15,1],[4,-4.5,7,12,1],[4,-9,5.4,8,1]].forEach(([dx,dz2,w,h,d])=>shell(x+dx,z+dz2+3,w,h,d));return['Opera House',18]},
 mia:(G,Gw,b)=>{const x=b.mx+3,z=b.mz;PR(G,2.2,1.5,22,12,'#f4f2ec',x,0,z);B(G,3.8,.4,3.8,'#2a2a2a',x,22,z);PR(Gw,1.2,1.2,1.8,10,'#fff2a0',x,22.4,z);PR(G,1.4,0,1.6,10,'#c8382a',x,24.2,z);B(G,4,3,3,'#f4f2ec',x-4,1.5,z+2);D.palm(G,x-8,z-2,7);D.palm(G,x+6,z+3,6);return['Cape Florida Lighthouse',26]},
 la:(G,Gw,b)=>{const x=b.mx,z=b.mz,r=Math.min(b.w,b.dz)/2-.5;hill(G,x,z,r,6,'#7a8a52');const y=6.4;B(G,16,5,6,'#f2eee4',x,y+2.5,z);D.quadZ(Gw,x-7,x+7,y+1,y+3.2,z+3.04,'#ffe2a8');PR(G,3,3,1.4,14,'#e8e4da',x,y+5,z);D.dome(G,3,x,y+6.4,z,'#4a6a6a');
  [-7,7].forEach(o=>{PR(G,1.6,1.6,1,12,'#e8e4da',x+o,y+5,z);D.dome(G,1.6,x+o,y+6,z,'#4a6a6a')});return['Griffith Observatory',y+10]},
 sao:(G,Gw,b)=>{const x=b.mx,z=b.mz;[-2.4,2.4].forEach(o=>{[-11,11].forEach(p=>B(G,1.2,11,1.2,'#d02a2a',x+p,5.5,z+o));B(G,23.4,1.4,1.2,'#d02a2a',x,11.4,z+o)});B(G,21,4.4,6,'#2a3440',x,7,z);D.quadZ(Gw,x-10,x+10,6,8,z+3.04,'#bfe0ff');return['MASP',12]},
 mel:(G,Gw,b)=>{const x=b.mx,z=b.mz,c='#e8b84a';B(G,b.w*.84,8,6,c,x,4,z);for(let a=x-b.w*.38;a<x+b.w*.38;a+=2.4)D.quadZ(Gw,a-.5,a+.5,3,6,z+3.04,'#ffe2a8');PR(G,3.4,3.4,2,14,c,x,8,z);D.dome(G,3.4,x,10,z,'#4a8a6a','#d8b860');
  B(G,3,14,3,c,x+b.w*.42-1.5,7,z);clockFaces(G,Gw,x+b.w*.42-1.5,z,1.5,12,1.1);for(let i=0;i<4;i++)D.quadZ(Gw,x-b.w*.3+i*1.4-.5,x-b.w*.3+i*1.4+.5,8.4,9.2,z+3.04,'#fff2c0');return['Flinders Street Station',15]}};
function church(G,Gw,b,c,roof,name){const x=b.mx,z=b.mz;B(G,8,9,14,c,x,4.5,z-2);D.gable(G,x-4.3,z-9.3,x+4.3,z+5.3,9,3.4,roof,c,0);[-3.4,3.4].forEach(o=>{B(G,3.2,16,3.2,c,x+o,8,z+5.6);D.quadZ(G,x+o-.6,x+o+.6,11,13,z+7.22,'#3a2a1a');spire(G,x+o,z+5.6,16,2.2,5,roof,'#d8b860')});
 D.quadZ(G,x-1.2,x+1.2,0,3.6,z+5.04,'#4a2a1a');D.quadZ(Gw,x-1,x+1,6,8,z+5.04,'#ffcf80');return[name,22]}
function townhall(G,Gw,b,c,cap,gold,name){const tx=b.x1-4,tz=b.mz;B(G,b.w*.62,10,b.dz*.55,c,b.x0+b.w*.31+.5,5,tz);for(let a=b.x0+2;a<b.x0+b.w*.6;a+=2.4)D.quadZ(Gw,a-.5,a+.5,2,8,tz+b.dz*.275+.04,'#ffe2a8');
 B(G,5.4,32,5.4,c,tx,16,tz);clockFaces(G,Gw,tx,tz,2.7,26,1.5);B(G,4.2,4,4.2,dk(c,1.08),tx,34,tz);if(gold){PR(G,1.2,.6,3,8,cap,tx,36,tz);[0,1,2].forEach(i=>B(G,.8,.8,.8,'#e8c040',tx+(i-1)*.9,39.6,tz))}else spire(G,tx,tz,36,3,10,cap,'#d8b860');return[name,gold?41:46]}
function gardens(G,b){D.quadY(G,b.x0+1,b.z1-6,b.x1-1,b.z1-1,.05,'#5a9a4a');for(let x=b.x0+3;x<b.x1-2;x+=4){D.tree(G,x,b.z1-1.6,'#4a8a3a',.7)}}

D.landmark=function(C,bk){const f=LM[C.id];if(!f)return false;const G=D.mkG(),Gw=D.mkG(),b={x0:bk.x0,x1:bk.x1,z0:bk.z0,z1:bk.z1,w:bk.x1-bk.x0,dz:bk.z1-bk.z0,mx:(bk.x0+bk.x1)/2,mz:(bk.z0+bk.z1)/2};
 D.quadY(G,bk.x0,bk.z0,bk.x1,bk.z1,.03,dk(C.s.walk,1.12));const prev=D.building;D.building=C;try{const [name,h]=f(G,Gw,b,C);
 /* solid core: the middle of the block, leaving a path round the front for the selfie spot */
 D.col(bk.x0+2,bk.z0+1.5,bk.x1-2,bk.z1-4.2);D.unit(C,G,Gw,null,[bk.x0,bk.z0,bk.x1,bk.z1,h]);
 C.spots.land={x:b.mx,z:bk.z1-2.4,n:name};
 D.addInt(b.mx,bk.z1-2.4,2.4,'Take a selfie at the '+name.replace(/^the /,''),()=>selfie(C,name));return true}finally{D.building=prev}};
function selfie(C,name){S.dcity=S.dcity||{};const k=C.id+'|'+S.day,done=(S.dcity.selfie||[]).includes(k);snd('pop');try{chime()}catch(e){}
 if(done)return say('Another photo at the '+name.replace(/^the /,'')+'. Your fans already saw today\'s.');
 S.dcity.selfie=(S.dcity.selfie||[]).filter(x=>(x.split('|')[1]|0)>=S.day-30).concat(k);const f=Math.round(30+Math.sqrt(S.listeners||0)*.25);S.followers=(S.followers||0)+f;
 say('📸 Selfie at the '+name.replace(/^the /,'')+' · +'+f.toLocaleString()+' followers')}

/* ---------- rooms ---------- */
const RM=D.RM={lobby:[1240,0,22,14],room:[1290,0,16,12],food:[1320,0,14,10],cafe:[1350,0,12,9],conv:[1380,0,12,10],souv:[1410,0,12,9],records:[1440,0,12,10],office:[1470,0,16,12],books:[1300,-30,14,11],cloth:[1330,-30,14,11],pharm:[1360,-30,12,10]};
function staff(rm,x,z,ry){let o;try{o=buildChar(fCfg())}catch(e){return}o.g.position.set(OX+x,0,OZ+z);o.g.rotation.y=ry||0;scene.add(o.g);rm.extra.push(o.g)}
function chair(rm,x,z,c){rm.box(.7,.08,.7,c,x,.5,z);rm.box(.7,.7,.08,c,x,.85,z-.32);[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([a,b])=>rm.box(.06,.5,.06,'#333',x+a,.25,z+b))}
function table(rm,x,z,w,d,c){rm.box(w,.08,d,c,x,.78,z,1);rm.box(.12,.74,.12,'#333',x,.37,z)}
function plant(rm,x,z){rm.box(.6,.6,.6,'#8a5a3a',x,.3,z,1);rm.box(.9,1,.9,'#3a8a4a',x,1.1,z);rm.box(.5,.6,.5,'#4a9a5a',x,1.8,z)}
/* exit at the front (south) wall back to where you came in */
function exitTo(C,rm,x,z,label){rm.box(2,.05,1,'#7a3a2a',x,.03,z-.6);rm.int(x,z-.6,1.4,label||'Go back outside',()=>{const d=D.door||C.spots.hotel;D.goOut(d?d.x+(d.face=='x'?.6:0):C.spots.hotel.x,d?d.z+(d.face=='x'?0:.6):C.spots.hotel.z+1,d&&d.face=='x'?Math.PI/2:0)})}
/* ---------- interior dressing: trim, lights, windows, art, and the extra furniture of each kind of room ---------- */
const WCOL=['#e8b84a','#3a8ae8','#e84a6a','#4ab87a','#a86ae8','#e8803a'];
function winArt(c,W,H){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#8ec8ee');g.addColorStop(1,'#e4f2fb');c.fillStyle=g;c.fillRect(0,0,W,H);
 for(let i=0;i<12;i++){const w=10+Math.random()*18,h=20+Math.random()*60,x=Math.random()*W;c.fillStyle=i%2?'#8a9aaa':'#6a7a8c';c.fillRect(x,H-h,w,h)}
 c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.ellipse(W*.7,H*.25,22,8,0,0,7);c.fill();c.strokeStyle='#f4efe6';c.lineWidth=7;c.strokeRect(0,0,W,H);c.beginPath();c.moveTo(W/2,0);c.lineTo(W/2,H);c.moveTo(0,H*.55);c.lineTo(W,H*.55);c.stroke()}
function spineArt(c,W,H){c.fillStyle='#2a1c10';c.fillRect(0,0,W,H);const rows=3,rh=H/rows;for(let r=0;r<rows;r++){let x=2;while(x<W-4){const w=4+Math.random()*7,h=rh*(.6+Math.random()*.34);c.fillStyle=pick(['#a83a3a','#3a5a8a','#3a7a4a','#c8a040','#6a3a7a','#d8d0c0','#8a5a3a','#2a6a6a','#c86a3a']);c.fillRect(x,(r+1)*rh-h-2,w,h);x+=w+1}c.fillStyle='#5a3a20';c.fillRect(0,(r+1)*rh-3,W,3)}}
function dress(C,rm,key,x0,z0,w,d,wc){const s=C.s,back=z0+.2,L=x0+.2,wh=rm.o.h||4,cx=x0+w/2,tr=dk(wc,.78);
 rm.box(w,.2,.1,tr,cx,.1,back);rm.box(.1,.2,d,tr,L,.1,z0+d/2);rm.box(w,.14,.16,dk(wc,.92),cx,wh-.07,back);rm.box(.16,.14,d,dk(wc,.92),L,wh-.07,z0+d/2);
 for(let x=x0+2;x<x0+w-1;x+=3.6)rm.glow(.22,.4,.12,'#ffd890',x,2.8,back+.1);for(let z=z0+3;z<z0+d-1;z+=4.2)rm.glow(.12,.4,.22,'#ffd890',L+.1,2.8,z);
 if(key!='records'&&key!='office'){[.3,.72].forEach((f,i)=>{const zc=z0+d*f;rm.sign('x',x0+.08,zc-1.1,zc+1.1,1.1,3,160,128,winArt,'rw');rm.box(.1,.1,2.4,'#f4efe6',x0+.12,3.05,zc);rm.box(.1,2.4,.3,dk(s.acc||'#a83a3a',.8),x0+.14,1.85,zc-1.3);rm.box(.1,2.4,.3,dk(s.acc||'#a83a3a',.8),x0+.14,1.85,zc+1.3);rm.box(.3,.1,2.5,'#e8e0d0',x0+.25,1.05,zc)})}
 const ax=[x0+w*.3,x0+w*.72];if(key!='food'&&key!='cafe'&&key!='office'){ax.forEach((x,i)=>{const c1=pick(WCOL);rm.box(1.1,.8,.06,'#3a2a1a',x,2.6,back+.1);rm.box(.9,.62,.04,c1,x,2.6,back+.14);rm.box(.4,.3,.04,pick(WCOL),x+(i?.1:-.1),2.6,back+.17)})}
 rm.box(.55,.55,.06,'#3a2a1a',cx,3.3,back+.1);rm.box(.46,.46,.04,'#f8f6f0',cx,3.3,back+.13);rm.box(.04,.18,.03,'#111',cx,3.35,back+.16);rm.box(.14,.04,.03,'#111',cx+.05,3.3,back+.16)}
/* a customer or two standing about so the shops are not empty */
function guests(rm,key,x0,z0,w,d){const cx=x0+w/2,P=Math.PI,G={food:[[x0+12.2,z0+4.6,P]],cafe:[[x0+3.5,z0+4,P],[x0+10.3,z0+6,-P/2]],conv:[[cx-2,z0+5.5,P/2]],souv:[[x0+6.2,z0+3.4,P]],records:[[x0+4,z0+5.1,P/2]],books:[[x0+4,z0+8.2,P]],cloth:[[cx+1,z0+7.2,P]],pharm:[[x0+w-2.4,z0+8.6,-P/2]]}[key];
 if(G)G.forEach(([x,z,r])=>{staff(rm,x,z,r);rm.cols.push([x-.35,z-.35,x+.35,z+.35])})}
function extras(C,rm,key,x0,z0,w,d,sign){const s=C.s,back=z0+.2,front=z0+d,cx=x0+w/2,wd='#6a4a2a',dkw='#4a3226',gl='#bfe0ff';
 dress(C,rm,key,x0,z0,w,d,rm.o.wall||'#e8e4dc');
 if(key=='food'){const f2=rm.o.floor;for(let ix=0;ix<w;ix++)for(let iz=0;iz<d;iz++)if((ix+iz)%2==0)D.quadY(rm.G,x0+ix,z0+iz,x0+ix+1,z0+iz+1,.012,dk(f2,.84));
  rm.box(w-3,.12,.4,wd,cx,2.3,back+.3);for(let i=0;i<9;i++)rm.box(.26,.36,.26,pick(['#c8442a','#e8c040','#3a8a4a','#d8d0c0','#8a5a3a']),x0+2.2+i*(w-5)/8,2.54,back+.3);for(let i=0;i<4;i++){rm.box(.5,.05,.5,'#555',x0+3+i*2.4,2.9,back+.2);rm.box(.06,.4,.06,'#555',x0+3+i*2.4,2.7,back+.2)}
  rm.sign('z',back+.12,x0+w-5,x0+w-1.5,2.4,3.7,256,144,(c,W,H)=>{c.fillStyle='#1e2a24';c.fillRect(0,0,W,H);c.strokeStyle='#8a6a40';c.lineWidth=8;c.strokeRect(0,0,W,H);c.fillStyle='#f4ecd8';c.font='bold 22px sans-serif';c.textAlign='center';c.fillText('MENU',W/2,30);c.font='16px sans-serif';c.textAlign='left';(D.food(C.id)||[]).slice(0,4).forEach((m,i)=>{c.fillText(String(m[0]).slice(0,16),16,62+i*22);c.textAlign='right';c.fillText('$'+m[1],W-16,62+i*22);c.textAlign='left'})},'menu'+C.id);
  [z0+4.9,z0+8.5].forEach(z=>{rm.box(.7,.5,1.8,'#a03a2a',x0+.9,.3,z,1);rm.box(.2,.6,1.8,'#a03a2a',x0+.55,.8,z)});table(rm,x0+1.9,z0+4.9,.9,1.6,'#8a5a32');table(rm,x0+1.9,z0+8.5,.9,1.6,'#8a5a32');
  plant(rm,x0+w-1,z0+d-2);rm.glow(1,.3,.06,'#ff4a4a',x0+2.2,3.5,back+.1)}
 if(key=='cafe'){rm.box(2.2,.5,.5,gl,x0+4.9,1.4,z0+2.1);for(let i=0;i<5;i++)rm.box(.3,.2,.3,pick(['#e8b878','#c8803a','#f4e0b8','#a83a4a']),x0+4.1+i*.42,1.75,z0+2.1);rm.box(2.2,1.4,.08,'#2a3a30',x0+9,2.3,back+.12);for(let i=0;i<5;i++)rm.box(1.5-i%2*.4,.06,.02,'#e8e8d8',x0+8.7,2.8-i*.22,back+.17);
  rm.box(3,.1,.3,wd,x0+3.5,2.3,back+.2);for(let i=0;i<8;i++)rm.box(.2,.2,.2,pick(['#f4f4f4','#d8c8a8','#8ab8d8']),x0+2.3+i*.32,2.45,back+.2);
  rm.box(.9,.5,2.2,'#7a4a3a',x0+1,.3,z0+4.8,1);rm.box(.2,.55,2.2,'#7a4a3a',x0+.6,.75,z0+4.8);rm.box(.9,.06,.9,'#3a2a20',x0+2.2,.4,z0+4.8);rm.box(.08,.4,.08,'#333',x0+2.2,.2,z0+4.8);rm.box(.3,.04,.3,'#f4f4f4',x0+2.2,.46,z0+4.8);
  for(let i=0;i<3;i++)rm.box(.4,.55,.4,'#3a3a3a',x0+6+i*.8,.28,z0+3.1)}
 if(key=='conv'){rm.box(.45,1.6,1.8,'#5a4a3a',x0+.7,.8,z0+7,1);for(let j=0;j<5;j++)for(let k=0;k<4;k++)rm.box(.04,.28,.26,pick(WCOL),x0+.95,.4+k*.34,z0+6.2+j*.38);
  rm.box(1.1,.4,.6,'#c8a040',x0+w-2,1.3,front-2.6);rm.box(.5,.5,.5,'#d83a2a',x0+w-1,.25,front-1.2);rm.box(.5,.5,.5,'#d83a2a',x0+w-1,.75,front-1.2);for(let i=0;i<4;i++)rm.box(.06,.06,.3,pick(['#e8c040','#e84a3a']),x0+3+i*2.4,3.4,z0+5.2)}
 if(key=='souv'){rm.sign('z',back+.12,x0+w*.22,x0+w*.78,2,3.6,256,128,(c,W,H)=>{c.fillStyle='#4a8ac8';c.fillRect(0,0,W,H);c.fillStyle='#e8dcb4';[[.2,.3,40,28],[.28,.55,18,26],[.5,.32,34,22],[.55,.6,26,26],[.75,.35,36,26],[.85,.7,22,12]].forEach(([a,b,rx,ry])=>{c.beginPath();c.ellipse(W*a,H*b,rx,ry,0,0,7);c.fill()});c.strokeStyle='#5a3a20';c.lineWidth=8;c.strokeRect(0,0,W,H)},'wmap');
  rm.box(2,.8,1.4,wd,x0+8,.4,z0+7,1);for(let i=0;i<7;i++)rm.box(.4,.4,.4,pick(['#e87aa8','#e8c040','#7ac8e8','#a8d86a','#f4f4f4']),x0+7.3+(i%4)*.45,1,z0+6.6+Math.floor(i/4)*.5);
  rm.box(.08,1.6,1.8,'#c8b890',x0+.18,1.8,z0+4.5);for(let i=0;i<14;i++)rm.box(.04,.2,.2,pick(WCOL),x0+.24,1.2+(i%4)*.35,z0+3.9+Math.floor(i/4)*.4);
  for(let x=x0+1;x<x0+w-1;x+=.7)rm.box(.3,.3,.04,pick(WCOL),x,3.4+Math.sin(x)*.1,back+.1)}
 if(key=='records'){rm.box(.7,.9,.6,'#2a2a2a',x0+.9,.45,z0+6,1);rm.box(.5,.1,.5,'#c8c8cc',x0+.9,.95,z0+6);rm.box(.4,.1,.1,'#111',x0+.9,1.1,z0+5.8);rm.box(2.4,.5,.9,'#a83a4a',x0+4,.28,front-1.2,1);rm.box(2.4,.6,.2,'#a83a4a',x0+4,.7,front-.7);
  [0,1,2].forEach(i=>{rm.box(.05,.8,.8,'#e8c040',x0+.18,2.8,z0+2.2+i*1.1);rm.box(.04,.6,.6,'#1a1a1a',x0+.22,2.8,z0+2.2+i*1.1)});rm.box(.5,1.4,.1,'#a8683a',x0+w*.8,2.4,back+.12);rm.box(.12,1,.06,'#3a2a1a',x0+w*.8,3.4,back+.12)}
 if(key=='office'){D.quadY(rm.G,cx-1,z0+1,cx+1,z0+d-1,.015,'#7a2a3a');rm.sign('x',x0+.1,z0+3,z0+6,1.3,3,128,160,(c,W,H)=>{c.fillStyle='#1e2430';c.fillRect(0,0,W,H);c.fillStyle='#e8e0c8';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText('DIRECTORY',W/2,24);c.font='13px sans-serif';c.textAlign='left';['5  Records Co.','4  Studio','3  Legal','2  Travel','1  Lobby'].forEach((t,i)=>c.fillText(t,14,52+i*22))},'dir');
  rm.box(1.8,.4,.9,'#4a5a6a',x0+3,.2,front-1.4,1);rm.glow(.6,.4,.06,'#bfe0ff',x0+w-2,2.4,z0+d-3)}
 if(key=='books'){rm.sign('z',back+.6,x0+1,x0+w-1,.3,2.9,512,128,spineArt,'bk');rm.box(w-1,3,.5,wd,cx,1.5,back+.34);rm.box(w-1,.1,.62,dkw,cx,3.05,back+.34);rm.box(w-1.2,.08,.6,dkw,cx,1.6,back+.34);
  for(let i=0;i<3;i++){const x=x0+3+i*4,z=z0+5.2;rm.box(3.6,2,.5,wd,x,1,z,1);rm.sign('z',z+.26,x-1.7,x+1.7,.2,1.9,256,96,spineArt,'bk2');rm.sign('z',z-.26,x-1.7,x+1.7,.2,1.9,256,96,spineArt,'bk2')}
  [z0+8.2,z0+9.4].forEach((z,i)=>{rm.box(.9,.5,.9,['#7a3a3a','#3a5a7a'][i],x0+1.2,.3,z,1);rm.box(.2,.6,.9,['#7a3a3a','#3a5a7a'][i],x0+.8,.75,z)});rm.box(.5,.5,.5,wd,x0+1.2,.3,z0+7,1);rm.glow(.3,.3,.3,'#ffe0a0',x0+1.2,.7,z0+7);rm.box(.1,3,.05,'#8a6a40',x0+w*.55,1.5,back+.9);rm.box(.1,3,.05,'#8a6a40',x0+w*.55+.6,1.5,back+.9);
  rm.box(2.6,1.1,.8,wd,x0+w-2.2,.55,front-2.6,1);staff(rm,x0+w-2.2,front-3.4,0);plant(rm,x0+w-1,z0+1.5);rm.int(x0+w-2.2,front-1.6,1.6,'Browse the books',()=>D.shop(C,Object.assign({},D.door||{n:'Bookshop'},{k:'books'})))}
 if(key=='cloth'){for(let i=0;i<3;i++){const x=x0+3+i*3.2,z=z0+4.8;rm.box(.06,1.5,.06,'#aaa',x-1,.75,z);rm.box(.06,1.5,.06,'#aaa',x+1,.75,z);rm.box(2.1,.06,.06,'#aaa',x,1.5,z);for(let k=0;k<7;k++)rm.box(.1,.9,.45,pick(['#e84a6a','#3a6ab8','#f4f4f4','#2a2a2a','#e8c040','#4ab87a','#a86ae8']),x-.9+k*.3,1,z)}
  rm.box(2.4,.8,1.2,'#e8e0d0',x0+w-3,.4,z0+8,1);for(let i=0;i<5;i++)rm.box(.9,.1,.7,pick(['#e84a6a','#3a6ab8','#f4f4f4','#e8c040']),x0+w-3.4+(i%2)*.8,.85+Math.floor(i/2)*.12,z0+8);
  [[x0+3,z0+8.4],[x0+4.4,z0+8.8]].forEach(([x,z],i)=>{rm.box(.14,.14,.14,'#555',x,.07,z);rm.box(.3,.9,.2,'#e8d8c8',x,.75,z,1);rm.box(.4,.2,.25,pick(['#e84a6a','#3a6ab8']),x,1.2,z);rm.box(.22,.26,.22,'#e8d8c8',x,1.5,z)});
  rm.box(1.1,2.3,.08,'#cfe0f0',x0+w-1.3,1.2,back+.14);rm.box(1.3,2.5,.04,'#3a2a1a',x0+w-1.3,1.2,back+.1);rm.box(2.4,2.4,.08,'#a83a6a',x0+w-2.8,1.2,z0+3.2,1);
  rm.box(3,.1,.4,wd,x0+3,2.2,back+.3);for(let i=0;i<6;i++)rm.box(.4,.2,.28,pick(['#e8e8ec','#2a2a2a','#c8402a','#3a6ab8']),x0+1.8+i*.45,2.35,back+.3);
  rm.box(2.4,1,.8,wd,x0+w-3.2,.5,front-2.6,1);staff(rm,x0+w-3.2,front-3.4,0);rm.int(x0+w-3.2,front-1.6,1.6,'Browse the boutique',()=>D.shop(C,Object.assign({},D.door||{n:'Boutique'},{k:'cloth'})))}
 if(key=='pharm'){for(let r=0;r<2;r++)for(let i=0;i<3;i++){const x=x0+2.4+i*2.6,z=z0+3.8+r*2.6;rm.box(2,1.7,.5,'#7ab8b0',x,.85,z,1);rm.box(2.06,.08,.54,'#4a8a82',x,1.74,z);for(let y=0;y<4;y++)for(let k=0;k<6;k++)rm.box(.22,.28,.2,pick(['#3a9a5a','#e8f0f4','#3a6ab8','#e8a03a']),x-.85+k*.34,.3+y*.4,z+.28)}
  rm.sign('z',back+.12,cx-1.6,cx+1.6,2.2,3.8,160,160,(c,W,H)=>{c.fillStyle='#f4f8f8';c.fillRect(0,0,W,H);c.fillStyle='#2aa85a';const t=W*.2,a=W*.5;c.fillRect(a-t,H*.5-t*2.4,t*2,t*4.8);c.fillRect(a-t*2.4,H*.5-t,t*4.8,t*2);c.strokeStyle='#2aa85a';c.lineWidth=6;c.strokeRect(3,3,W-6,H-6)},'cross');
  rm.box(4,1.1,.9,'#e8eef0',cx+2,.55,z0+2.2,1);rm.glow(3.6,.06,.7,'#bfe0ff',cx+2,1.14,z0+2.2);staff(rm,cx+2,z0+1.2,0);for(let i=0;i<3;i++){rm.box(1.6,.5,.5,'#c8d0d4',x0+1+i*1.8,.25,front-1.4,1);rm.box(1.6,.5,.12,'#c8d0d4',x0+1+i*1.8,.75,front-1.7)}
  rm.box(.8,1.6,.7,'#e8eef0',x0+w-1,.8,z0+5,1);rm.glow(.5,.4,.05,'#ff6a6a',x0+w-1.1,1.4,z0+5.37);rm.int(cx+2,z0+3.4,1.8,'Buy something at the pharmacy',()=>D.shop(C,Object.assign({},D.door||{n:'Pharmacy'},{k:'pharm'})))}}

function shopRoom(C,key){const s=C.s,[x0,z0,w,d]=RM[key],words=D.words(s.lang);const o={food:{floor:'#a07a52',wall:'#e8d8bc',name:'Restaurant'},cafe:{floor:'#8a6a4a',wall:'#f0e6d6',name:'Café'},conv:{floor:'#d8dce0',wall:'#f4f6f8',name:'Store',tiles:1},souv:{floor:'#b89a72',wall:'#f2e6cc',name:'Souvenirs'},records:{floor:'#3a3440',wall:'#2a2632',name:'Records'},office:{floor:'#c8c4bc',wall:'#e8e8ec',name:'Lobby',tiles:1},books:{floor:'#7a5a3a',wall:'#e4d8c0',name:'Bookshop'},cloth:{floor:'#c8b8a0',wall:'#f2eee8',name:'Boutique'},pharm:{floor:'#e8ecee',wall:'#f4f8f8',name:'Pharmacy',tiles:1}}[key];
 const rm=D.mkRoom(key,x0,z0,w,d,Object.assign({h:4},o));if(!rm)return;const cx=x0+w/2,back=z0+.2,front=z0+d;
 const sign=(t,a,b2,y0,y1,opt)=>rm.sign('z',back+.08,a,b2,y0,y1,256,64,(c,W,H)=>D.signArt(c,W,H,t,opt||{bg:'#1a1426',fg:s.neon,neon:1}));
 if(key=='food'){rm.box(w-4,1.1,.9,'#7a4a2a',cx,.55,z0+2.2,1);rm.glow(w-4,.6,.1,'#ffcf80',cx,2.9,back+.1);for(let i=0;i<4;i++)chair(rm,x0+3+i*2.4,z0+3.4,'#6a3a1a');staff(rm,cx,z0+1.2,0);
  [[x0+3,z0+6.5],[x0+7,z0+6.5],[x0+11,z0+6.5]].forEach(([x,z])=>{table(rm,x,z,1.6,1.2,'#8a5a32');chair(rm,x-1.1,z,'#6a3a1a');chair(rm,x+1.1,z,'#6a3a1a')});
  for(let i=0;i<4;i++)rm.glow(.5,.6,.5,i%2?'#ff5a3a':'#ffb03a',x0+3+i*3,3.3,z0+5);if(D.CJK(s.lang))for(let i=0;i<5;i++)rm.box(.9,1,.05,i%2?'#1a2a4a':'#2a3a6a',cx-2+i,3.3,z0+1.4);
  sign((D.food(C.id)[0]||['Menu'])[0].toUpperCase(),cx-3,cx+3,3.3,3.9);rm.int(cx,z0+3.2,1.8,'Order at the counter',()=>D.shop(C,Object.assign({},D.door||{n:'Restaurant'},{k:'food'})))}
 if(key=='cafe'){rm.box(5,1.1,.9,'#5a3a2a',x0+3.5,.55,z0+2,1);rm.box(1,.7,.6,'#c8c8cc',x0+2.4,1.45,z0+1.9);rm.glow(1.8,.6,.7,'#ffe8c8',x0+5,1.4,z0+2);staff(rm,x0+3.5,z0+1,0);
  [[x0+8,z0+3],[x0+9,z0+6.5],[x0+4,z0+6.5]].forEach(([x,z])=>{table(rm,x,z,1,1,'#e8e0d0');chair(rm,x-.9,z,'#3a3a3a');chair(rm,x+.9,z,'#3a3a3a')});plant(rm,x0+w-1,z0+1);plant(rm,x0+1,z0+d-2);
  rm.glow(.4,.4,.4,'#ffd890',x0+4,3.4,z0+5);rm.glow(.4,.4,.4,'#ffd890',x0+8,3.4,z0+5);sign(words.shop[1]||'CAFÉ',x0+1.5,x0+5.5,2.6,3.4);rm.int(x0+3.5,z0+3.1,1.8,'Order a drink',()=>D.shop(C,Object.assign({},D.door||{n:'Café'},{k:'cafe'})))}
 if(key=='conv'){for(let r=0;r<2;r++){const z=z0+4+r*3;rm.box(w-5,1.7,.9,'#8a96a4',cx+.5,.85,z,1);rm.box(w-4.9,.08,.95,'#5a6470',cx+.5,1.74,z);for(let i=0;i<10;i++)for(let y=0;y<3;y++)rm.box(.5,.35,.3,pick(['#e84a3a','#3a8ae8','#e8c83a','#3ab86a','#f4f4f4','#e87aa8']),cx+.5-(w-5)/2+.4+i*(w-5.8)/9,.4+y*.5,z+.32)}
  for(let i=0;i<5;i++){rm.box(1.4,2.4,.6,'#b8c0c8',x0+1.2+i*1.6,1.2,back+.4,1);rm.glow(1.2,2,.05,'#e8f6ff',x0+1.2+i*1.6,1.2,back+.72)}rm.box(2.6,1.1,.8,'#c8ccd0',x0+w-2,.55,front-2.6,1);rm.box(.5,.4,.4,'#2a2a2a',x0+w-2,1.3,front-2.6);staff(rm,x0+w-2,front-3.4,0);
  rm.int(x0+w-2,front-1.6,1.6,'Pay at the till',()=>D.shop(C,Object.assign({},D.door||{n:'Store'},{k:'conv'})))}
 if(key=='souv'){for(let i=0;i<3;i++){rm.box(2.6,2,.6,'#8a6a4a',x0+2+i*3.4,1,back+.4,1);for(let y=0;y<3;y++)for(let k=0;k<4;k++)rm.box(.4,.35,.3,pick([s.acc,s.neon,'#e8c040','#e84a3a','#4ab8e8','#f4f4f4']),x0+1+i*3.4+k*.6,.5+y*.6,back+.75)}
  rm.box(.8,1.8,.8,'#c8c8cc',x0+3,.9,z0+5);for(let k=0;k<6;k++)rm.box(.05,.4,.3,pick(['#e84a3a','#4ab8e8','#e8c040']),x0+3.42,.8+k*.18,z0+5);rm.box(1.6,1.5,.1,'#f4f4f4',x0+7,1.4,z0+5);rm.box(1.2,.8,.12,s.acc,x0+7,1.5,z0+5.06);
  rm.box(2.4,1,.8,'#7a5a3a',x0+w-2.2,.5,front-2.6,1);staff(rm,x0+w-2.2,front-3.4,0);rm.int(x0+w-2.2,front-1.6,1.6,'Browse souvenirs',()=>D.shop(C,Object.assign({},D.door||{n:'Souvenirs'},{k:'souv'})))}
 if(key=='records'){for(let r=0;r<2;r++)for(let i=0;i<4;i++){const x=x0+2+i*2.2,z=z0+3.6+r*2.8;rm.box(1.6,.8,.9,'#6a4a2a',x,.4,z,1);for(let k=0;k<9;k++)rm.box(.04,.5,.6,pick(['#e84a3a','#e8c040','#3a8ae8','#f4f4f4','#1a1a1a','#a84ae8']),x-.7+k*.17,1.05,z)}
  for(let i=0;i<4;i++)rm.sign('z',back+.08,x0+1+i*2.6,x0+3+i*2.6,1.6,3.4,128,160,(c,W,H)=>{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,pick([s.acc,'#e84a3a','#3a8ae8']));g.addColorStop(1,pick([s.neon,'#1a1a2a','#e8c040']));c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#fff';c.font='bold 18px monospace';c.textAlign='center';c.fillText(i==0&&S.artist?S.artist.slice(0,12).toUpperCase():pick(['LIVE','NEW','VINYL','TOUR']),W/2,H-16)});
  rm.box(2.4,1,.8,'#2a2a2a',x0+w-2.2,.5,front-2.6,1);rm.box(.8,.12,.8,'#1a1a1a',x0+w-2.2,1.06,front-2.6);staff(rm,x0+w-2.2,front-3.4,0);rm.glow(.3,.3,.3,s.neon,x0+3,3.6,z0+5);rm.glow(.3,.3,.3,s.acc,x0+8,3.6,z0+5);
  rm.int(x0+w-2.2,front-1.6,1.6,'Talk to the shop owner',()=>D.shop(C,Object.assign({},D.door||{n:'Records'},{k:'records'})))}
 if(key=='office'){rm.box(5,1.1,1,'#3a3a40',cx,.55,z0+3,1);rm.glow(5,.1,1.02,'#bfe0ff',cx,1.12,z0+3);staff(rm,cx,z0+2,0);for(let i=0;i<3;i++){rm.box(1.8,2.8,.1,'#8a8e94',x0+2+i*2.4,1.4,back+.1);rm.glow(.1,.1,.05,'#ffd23d',x0+2+i*2.4+1,1.4,back+.18)}
  [[x0+2.5,z0+8],[x0+w-3,z0+8]].forEach(([x,z])=>{rm.box(2.6,.5,1,'#4a5a6a',x,.25,z,1);rm.box(2.6,.6,.3,'#4a5a6a',x,.7,z-.4)});plant(rm,x0+1,z0+1);plant(rm,x0+w-1,z0+1);plant(rm,x0+w-1,z0+d-2);sign('LOBBY',cx-2,cx+2,3,3.6,{bg:'#e8e8ec',fg:'#2a2a3a'});
  rm.int(cx,z0+4.4,1.8,'Coffee from the lobby kiosk',()=>D.shop(C,Object.assign({},D.door||{n:'Lobby'},{k:'cafe'})))}
 extras(C,rm,key,x0,z0,w,d,sign);guests(rm,key,x0,z0,w,d);exitTo(C,rm,cx,front);rm.done()}

/* hotel lobby and room */
function hotelRooms(C){const s=C.s,hn=(C.spots.hotel&&C.spots.hotel.n)||'Hotel',[lx,lz,lw,ld]=RM.lobby,[rx,rz,rw,rd]=RM.room;
 const L=D.mkRoom('lobby',lx,lz,lw,ld,{floor:'#c8b89a',wall:'#e8dcc4',h:5,name:hn});if(!L)return;
 L.box(16,.02,6,'#7a2a3a',lx+11,.02,lz+8);L.box(7,1.2,1.2,'#5a3a2a',lx+6,.6,lz+3,1);L.box(7.2,.1,1.3,'#e8d8b0',lx+6,1.25,lz+3);L.box(4,2.2,.3,'#4a2a1a',lx+6,2.2,lz+.4);for(let i=0;i<8;i++)L.box(.2,.2,.1,'#e8c040',lx+4.4+i*.45,2.4,lz+.6);staff(L,lx+5,lz+2,0);staff(L,lx+7.4,lz+2,0);
 L.sign('z',lz+.3,lx+2.5,lx+9.5,3.6,4.6,512,64,(c,W,H)=>D.signArt(c,W,H,hn.toUpperCase(),{bg:'#2a1a26',fg:'#ffd890',neon:1}));
 for(let i=0;i<2;i++){L.box(2,3.2,.2,'#a8a4a0',lx+14+i*3,1.6,lz+.2);L.glow(.25,.25,.05,'#ffd23d',lx+15.2+i*3,1.6,lz+.36)}L.glow(1.6,.4,1.6,'#fff2c0',lx+11,4.4,lz+7);L.glow(.8,.6,.8,'#ffe0a0',lx+11,4,lz+7);
 [[lx+4,lz+10],[lx+18,lz+10]].forEach(([x,z])=>{L.box(3,.5,1.2,'#3a5a6a',x,.25,z,1);L.box(3,.7,.3,'#3a5a6a',x,.75,z-.5);table(L,x,z+1.6,1.2,.8,'#5a3a2a')});plant(L,lx+1,lz+1);plant(L,lx+lw-1,lz+1);plant(L,lx+1,lz+ld-2);
 L.box(1,1.6,.6,'#c8a040',lx+lw-3,.8,lz+6,1);L.box(.8,.6,.5,'#8a4a2a',lx+lw-3,1.9,lz+6);
 dress(C,L,'lobby',lx,lz,lw,ld,'#e8dcc4');L.int(lx+6,lz+4.4,2,'Reception: check in for the night',()=>checkIn(C));L.int(lx+15.5,lz+1.6,2,'Take the lift to your room',()=>lift(C));L.int(lx+4,lz+11.4,1.6,'Sit and rest for an hour',()=>D.hotelRest());
 L.box(3,.05,1,'#7a3a2a',lx+11,.03,lz+ld-.6);L.int(lx+11,lz+ld-.8,1.6,'Leave the hotel',()=>{const h=C.spots.hotel;D.goOut(h.x,h.z+1,0)});L.done();
 /* the room: a suite with a bathroom, bed by the big window, desk, sofa and TV */
 const R=D.mkRoom('room',rx,rz,rw,rd,{floor:'#9a7452',wall:'#efe6d6',h:4,name:'Your room'}),wd='#6a4a3a',dkw='#4a3226',fab=s.acc||'#3a5a8a';
 for(let x=rx+.6;x<rx+rw;x+=1.2)R.box(.04,.005,rd-.1,dk('#9a7452',.86),x,.006,rz+rd/2);
 R.box(rw-.4,.3,.06,'#f8f4ec',rx+rw/2,3.85,rz+.04);R.box(.06,.3,rd-.4,'#f8f4ec',rx+.04,3.85,rz+rd/2);R.box(rw-.4,.14,.05,dk('#efe6d6',.8),rx+rw/2,.07,rz+.05);
 /* bathroom, back left, half walls so you can see in */
 R.box(4.5,.02,4.5,'#dfe6ea',rx+2.25,.012,rz+2.25);for(let i=1;i<5;i++){R.box(.03,.004,4.5,'#b8c4ca',rx+i*.9,.025,rz+2.25);R.box(4.5,.004,.03,'#b8c4ca',rx+2.25,.025,rz+i*.9)}
 R.box(.2,1.1,3,'#f4f0e8',rx+4.5,.55,rz+1.5,1);R.box(4.6,1.1,.2,'#f4f0e8',rx+2.3,.55,rz+4.5,1);R.box(.24,.06,3,'#c8b89a',rx+4.5,1.12,rz+1.5);R.box(4.64,.06,.24,'#c8b89a',rx+2.3,1.12,rz+4.5);
 R.box(2.8,.6,1.1,'#f8f8f8',rx+1.7,.3,rz+.75,1);R.box(2.5,.04,.8,'#8ac8e8',rx+1.7,.58,rz+.75);R.box(.1,.4,.1,'#c8ccd0',rx+.5,.85,rz+.3);R.box(.3,.06,.06,'#c8ccd0',rx+.6,1.05,rz+.3);
 R.box(4.4,1.6,.04,'#dfe6ea',rx+2.25,.8,rz+.04);
 R.box(.6,.8,1.4,'#e8e4dc',rx+.4,.4,rz+2.9,1);R.box(.5,.08,.5,'#f8f8f8',rx+.45,.84,rz+2.9);R.box(.04,1,1.2,'#bfe0ff',rx+.05,1.7,rz+2.9);R.glow(.06,.12,1.2,'#fff2d0',rx+.06,2.3,rz+2.9);
 R.box(.5,.45,.6,'#f8f8f8',rx+3.7,.22,rz+3.8,1);R.box(.5,.5,.18,'#f8f8f8',rx+3.7,.6,rz+4.15);R.box(.06,.06,1,'#c8ccd0',rx+4.36,.95,rz+1.6);[0,1].forEach(i=>R.box(.05,.5,.4,i?'#f4f4f4':fab,rx+4.33,.7,rz+1.3+i*.5));
 /* bed against the back wall, headboard, art, nightstands and lamps */
 const bx0=rx+7.6;R.box(3.4,.4,4.4,dkw,bx0,.2,rz+2.5,1);R.box(3.2,.3,4.2,'#f8f6f2',bx0,.55,rz+2.5);R.box(3.24,.06,2.2,fab,bx0,.72,rz+3.5);R.box(3.24,.25,.4,dk(fab,.8),bx0,.6,rz+4.5);
 [-.75,.75].forEach(o=>{R.box(1.3,.28,.6,'#ffffff',bx0+o,.82,rz+.75);R.box(1,.22,.4,fab,bx0+o,.86,rz+1.15)});R.box(4,1.8,.2,'#7a5a46',bx0,1.3,rz+.15);R.box(3.6,1.4,.06,dk(fab,.75),bx0,1.4,rz+.27);
 R.sign('z',rz+.08,bx0-1.4,bx0+1.4,2.6,3.5,256,96,(c,W,H)=>{const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,s.acc||'#e86a3a');g.addColorStop(1,s.neon||'#3ad0ff');c.fillStyle='#f4ecdc';c.fillRect(0,0,W,H);c.fillStyle=g;c.beginPath();c.arc(W*.3,H*.6,H*.32,0,7);c.fill();c.fillRect(W*.55,H*.25,W*.3,H*.5);c.strokeStyle='#3a2a1a';c.lineWidth=8;c.strokeRect(0,0,W,H)});
 [bx0-2.3,bx0+2.3].forEach(x=>{R.box(.9,.6,.7,wd,x,.3,rz+.6,1);R.box(.8,.04,.04,'#d8b860',x,.45,rz+.96);R.box(.16,.5,.16,'#d8c8a0',x,.85,rz+.6);R.glow(.42,.36,.42,'#ffe0a0',x,1.25,rz+.6);R.box(.3,.08,.2,'#2a2a2a',x+.2,.64,rz+.5)});
 /* big window with the city at night, curtains and a desk under it */
 const wx0=rx+10.6,wx1=rx+rw-.4;R.sign('z',rz+.1,wx0,wx1,1,3.5,384,160,(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c1028');g.addColorStop(1,dk(s.sky,.5));c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#fff8';for(let i=0;i<30;i++)c.fillRect(Math.random()*W,Math.random()*H*.4,1,1);for(let i=0;i<30;i++){const w=8+Math.random()*18,h=24+Math.random()*100,x=Math.random()*W;c.fillStyle='#141824';c.fillRect(x,H-h,w,h);c.fillStyle=pick(['#ffd890','#fff2c0',s.neon]);for(let y=H-h+4;y<H-4;y+=7)for(let xx=x+2;xx<x+w-2;xx+=4)if(Math.random()<.4)c.fillRect(xx,y,2,3)}c.strokeStyle='#e8e4dc';c.lineWidth=8;c.strokeRect(0,0,W,H);c.beginPath();c.moveTo(W/2,0);c.lineTo(W/2,H);c.moveTo(0,H*.62);c.lineTo(W,H*.62);c.stroke()});
 R.box(wx1-wx0+.4,.08,.3,'#f4f0e8',(wx0+wx1)/2,.95,rz+.18);R.box(wx1-wx0+1.2,.12,.12,'#c8b89a',(wx0+wx1)/2,3.65,rz+.22);[wx0-.25,wx1+.15].forEach(x=>{R.box(.5,2.9,.18,dk(fab,.7),x,2.15,rz+.28);for(let k=0;k<3;k++)R.box(.06,2.9,.2,dk(fab,.55),x-.15+k*.15,2.15,rz+.3)});
 R.box(2.6,.08,1,'#8a6a4a',rx+13.2,.78,rz+.9,1);[[-1.2,-.4],[1.2,-.4],[-1.2,.4],[1.2,.4]].forEach(([a,b2])=>R.box(.08,.74,.08,dkw,rx+13.2+a,.37,rz+.9+b2));R.box(.9,.04,.6,'#2a2c30',rx+13.4,.84,rz+.9);R.box(.9,.5,.04,'#2a2c30',rx+13.4,1.1,rz+.62);R.glow(.8,.4,.02,'#6aa8e8',rx+13.4,1.1,rz+.65);R.box(.12,.4,.12,'#2a2a2a',rx+12.3,1,rz+.7);R.glow(.3,.18,.3,'#fff2c0',rx+12.3,1.25,rz+.7);
 chair(R,rx+13.2,rz+2,'#3a3a40');R.box(.9,.9,.8,'#e8e8ec',rx+11.2,.45,rz+.5,1);R.glow(.7,.3,.05,'#e8f6ff',rx+11.2,.6,rz+.92);R.box(.7,.04,.5,'#2a2a2a',rx+11.2,.92,rz+.5);R.box(.18,.22,.18,'#c8ccd0',rx+11,1.05,rz+.5);[0,1].forEach(i=>R.box(.1,.12,.1,'#f4f4f4',rx+11.3+i*.16,1,rz+.5));
 /* lounge: rug, TV on the left wall, sofa, coffee table, armchair, floor lamp */
 R.box(6,.02,4,dk(fab,1.25),rx+4.6,.016,rz+8.2);R.box(5.6,.022,3.6,dk(fab,.9),rx+4.6,.018,rz+8.2);
 R.box(.6,.6,3.2,dkw,rx+.4,.3,rz+8.2,1);R.box(.1,1.4,2.6,'#1a1a1e',rx+.08,1.8,rz+8.2);R.glow(.04,1.24,2.44,'#4a8ad8',rx+.15,1.8,rz+8.2);R.box(.4,.2,.8,'#2a2a2a',rx+.4,.7,rz+7.2);plant(R,rx+.6,rz+10.4);
 R.box(1,.45,3,fab,rx+5.2,.22,rz+8.2,1);R.box(.3,.6,3,fab,rx+5.6,.7,rz+8.2);[-1.55,1.55].forEach(o=>R.box(1,.5,.25,dk(fab,.85),rx+5.2,.5,rz+8.2+o));[-.7,.7].forEach(o=>R.box(.3,.4,.6,s.neon||'#e8c040',rx+5.35,.65,rz+8.2+o));
 R.box(1.2,.06,1.8,'#3a2a20',rx+3.2,.45,rz+8.2,1);R.box(1,.4,.1,dkw,rx+3.2,.22,rz+7.5);R.box(1,.4,.1,dkw,rx+3.2,.22,rz+8.9);R.box(.5,.04,.35,'#e84a3a',rx+3.1,.5,rz+8);R.box(.18,.2,.18,'#f4f4f4',rx+3.3,.58,rz+8.6);
 R.box(.9,.4,.9,dk(fab,.85),rx+3.2,.2,rz+10.6,1);R.box(.9,.5,.2,dk(fab,.85),rx+3.2,.55,rz+11);R.box(.06,1.8,.06,'#2a2a2a',rx+6.4,.9,rz+10.4);R.glow(.4,.35,.4,'#ffe0a0',rx+6.4,1.9,rz+10.4);
 /* suitcase, luggage rack, plant, ceiling lights */
 R.box(1.2,.5,.6,dkw,rx+rw-1.2,.25,rz+rd-2.4,1);R.box(.9,.6,.4,'#c8402a',rx+rw-1.2,.8,rz+rd-2.4);R.box(.3,.06,.06,'#2a2a2a',rx+rw-1.2,1.13,rz+rd-2.4);plant(R,rx+rw-.8,rz+4.4);
 [[bx0,rz+3],[rx+4,rz+8.2],[rx+2.25,rz+2.25],[rx+13,rz+6]].forEach(([x,z])=>{R.box(.7,.06,.7,'#f4f0e8',x,3.97,z);R.glow(.5,.04,.5,'#fff2d0',x,3.93,z)});
 R.int(bx0,rz+5.4,1.8,'Sleep until morning',()=>bed(C));R.int(rx+3.2,rz+9.6,1.4,'Watch TV',()=>tv(C));R.int(rx+11.2,rz+1.6,1.3,'Minibar',()=>D.shop(C,{n:'Minibar',k:'conv'}));R.int(rx+13.2,rz+3,1.3,'Look out of the window',()=>{snd('pop');say('The lights of '+(C.d.city||C.d.country)+' at night. '+(S.artist||'You')+' could get used to this.')});
 R.int(rx+2.4,rz+2.2,1.4,'Take a bath (+5 energy)',()=>{if(S.dcity._sh===S.day+':'+(S.t|0))return;S.dcity._sh=S.day+':'+(S.t|0);S.energy=Math.min(100,S.energy+5);S.t=Math.min(599,S.t+4);snd('pop');say('Fresh! +5 energy · '+clk())});
 R.box(2,.05,1,'#7a3a2a',rx+10,.03,rz+rd-.6);R.int(rx+10,rz+rd-.8,1.4,'Lift back down to the lobby',()=>D.goRoom('lobby',lx+15.5,lz+2.6,0));R.done()}
function price(C){return Math.round(60+(C.d.venue?C.d.venue.tix:60)*1.2)}
function hasKey(C){const k=S.dcity&&S.dcity.key;return !!k&&k.id===C.id&&k.day===S.day}
function checkIn(C){if(hasKey(C)){snd('pop');return say('Reception: "You are already checked in. The lift is to your right."')}const p=price(C);mode='menu';
 $('ui').innerHTML=`<div class="box modal"><h2>🏨 ${esc((C.spots.hotel&&C.spots.hotel.n)||'Hotel')}</h2><p class=m>${clk()} · You have ${$$(S.money)}.</p><p>${esc(D.words(C.s.lang).hi)}! A room for tonight is ${$$(p)}. Sleep in your room and you wake up there in the morning.</p><div class=row2><button class=go onclick="DCITY.hotelKey(${p})">Check in · ${$$(p)}</button><button onclick="closeUI()">Not now</button></div></div>`}
D.hotelKey=p=>{const C=D.C;if(!C)return closeUI();if(S.money<p){snd('err');return say('Not enough money for a room.')}S.money=+(S.money-p).toFixed(2);S.dcity.key={id:C.id,day:S.day};closeUI();snd('cash');say('Checked in! Take the lift to your room.')};
function lift(C){if(!hasKey(C)){snd('err');return say('Reception first: check in to get your room key.')}D.fade(()=>{D.goRoom('room',RM.room[0]+10,RM.room[1]+10.6,Math.PI)},()=>say('Your room. The bed is by the window.'))}
function bed(C){if(!hasKey(C)){snd('err');return say('Check in at reception to sleep here tonight.')}if(S.t<240){snd('err');return say('It is too early to sleep. Come back in the evening.')}D.hotelWakeRoom=1;sleepNow(0)}
function tv(C){const n=['Tonight on the news: '+(S.artist||'a rising star')+' is in '+(C.d.city||C.d.country)+'!','A cooking show about '+(D.food(C.id)[0]||['local food'])[0]+'.','The weather: '+(C.s.snow?'cold':'warm')+' and clear tomorrow.','A music chart show. One of your songs flashes past!'];snd('pop');say('📺 '+pick(n))}
/* waking up abroad: in your room if you slept there, otherwise in the lobby */
D.hotelWake=function(auto){const C=D.C;if(!C||!C.rooms.room)return false;const inRoom=D.hotelWakeRoom&&!auto;D.hotelWakeRoom=0;
 if(inRoom){D.goRoom('room',RM.room[0]+7.6,RM.room[1]+5.6,0);say('Good morning, '+(C.d.city||C.d.country)+'!')}else{D.goRoom('lobby',RM.lobby[0]+4,RM.lobby[1]+11.6,0);if(auto)say('You fell asleep on a sofa in the hotel lobby.')}return true};

/* doors on the street: every shopfront opens into the matching interior */
const KIND=[[/record|disc|vinyl|レコード|음반|唱片|music/i,'records'],[/caf|coffee|kaffee|koffie|カフェ|喫茶|커피|카페|咖啡|tea|茶/i,'cafe'],[/souvenir|gift|土産|みやげ|기념품|纪念|craft|bazaar|souk/i,'souv'],[/pharm|farm|apothe|drug|chemist|薬|약|药|apotek/i,'pharm'],[/book|libr|livre|buch|libro|書|책|书/i,'books'],[/cloth|fashion|boutique|moda|ropa|vêt|服|ブティック|패션|apparel|tailor|sneak|shoe|zapat|denim|vintage|thrift/i,'cloth'],[/book|libr|flor|flower|barb|laund|sneak|vintage|thrift|zapat|mart|market|store|shop|pharm|farm|apothe|kiosk|コンビニ|薬|편의점|超市|便利|tienda|mercado|super/i,'conv']];
const KN=D.KN={books:'the bookshop',cloth:'the boutique',pharm:'the pharmacy',food:'the restaurant',cafe:'the café',conv:'the shop',souv:'the souvenir shop',records:'the record shop'};
D.doorInt=function(C,dr){if(D.kindOf)dr.k=D.kindOf(C,dr);else{const m=KIND.find(([r])=>r.test(dr.n));dr.k=m?m[1]:pick(['food','food','food','food','cafe','souv','souv','books','cloth','pharm']);if(dr.tall&&C.r()<.35)dr.k='office'}const lab=dr.k=='office'?'Go into the office lobby':'Go into '+KN[dr.k]+': '+dr.n;D.addInt(dr.x,dr.z,1.3,lab,()=>{const[x0,z0,w,d]=RM[dr.k]||RM.food;D.door=dr;D.fade(()=>D.goRoom(dr.k,x0+w/2,z0+d-1.4,Math.PI),()=>say(dr.k=='office'?'An office lobby.':dr.n+': "'+D.words(C.s.lang).hi+'!"'),150)})};
D.hotelInt=function(C){const h=C.spots.hotel;D.addInt(h.x,h.z,2,'Go into '+h.n,()=>{D.door=null;D.fade(()=>D.goRoom('lobby',RM.lobby[0]+11,RM.lobby[1]+RM.lobby[3]-1.6,Math.PI),()=>say('Reception is on the left, the lifts on the right.'),150)})};

D.cityHooks=D.cityHooks||[];D.cityHooks.push(C=>{['food','cafe','conv','souv','records','office','books','cloth','pharm'].forEach(k=>{try{shopRoom(C,k)}catch(e){console.error('dcity room '+k,e)}});try{hotelRooms(C)}catch(e){console.error('dcity hotel',e)}});
/* the windmill turns */
{const u0=update;update=function(dt){u0(dt);try{const C=D.C;if(C&&C.spin)C.spin.forEach(g=>{g.rotation.z+=dt*.5})}catch(e){}}}

/* test mode: a Teleport app on the phone jumps straight to any tour city (or home) */
try{IC.tp=mkIc(['..........','...PPPP...','..PWWWWP..','.PWPPPPWP.','.PWPWWPWP.','.PWPWWPWP.','.PWPPPPWP.','..PWWWWP..','...PPPP...','..........'].map(r=>r.replace(/\./g,'K')),{K:'#2a1050',P:'#b05aff',W:'#e8d0ff'})}catch(e){IC.tp=IC.store}
if(typeof GP_TITLE!='undefined')GP_TITLE.tp='Teleport';
D.tp=function(id){if(!S.cheat)return;const T=window.TRAVEL;if(!T)return;if(typeof window.apWhere=='function'&&window.apWhere()=='cabin'){snd('err');return say('Land first, then teleport.')}
 try{closePhone()}catch(e){}if(id==T.loc()&&(id=='home'||D.on)){return say('You are already here.')}IN=null;D.room=null;
 D.fade(()=>{if(D.on)D.leave(id=='home');T.arrive(id);if(id=='home'){P.x=8;P.z=14;P.rot=0;camT.x=P.x;camT.z=P.z;mode='play'}},()=>{if(id=='home')say('Teleported home.')},150)};
{const b0=phBody;phBody=function(){if(PH.app!='tp')return b0.apply(this,arguments);if(!S.cheat){PH.app='home';return b0.apply(this,arguments)}
 const here=window.TRAVEL?TRAVEL.loc():'home',by={};WT_DEST.forEach(d=>{(by[d.cont]=by[d.cont]||[]).push(d)});
 const btn=(id,t)=>`<button style="display:block;width:100%;text-align:left;margin:3px 0;${id==here?'opacity:.5':''}" onclick="DCITY.tp('${id}')">${esc(t)}${id==here?' · you are here':''}</button>`;
 return`<div style="padding:10px"><p class=m style="margin:0 0 6px">Test mode: tap a city to jump there.</p>${btn('home','🏠 Home')}${Object.keys(by).map(k=>`<h3 style="margin:10px 0 2px">${esc((typeof WT_CONT!='undefined'&&WT_CONT[k]&&WT_CONT[k].n)||k)}</h3>`+by[k].map(d=>btn(d.id,wtPlace(d))).join('')).join('')}</div>`}}
{const r0=phR;phR=function(){try{const i=GP_APPS.findIndex(a=>a[0]=='tp');if(S.cheat&&i<0)GP_APPS.push(['tp','Teleport',()=>IC.tp,'#7a2ad0']);if(!S.cheat&&i>=0)GP_APPS.splice(i,1)}catch(e){}return r0.apply(this,arguments)}}
})();
