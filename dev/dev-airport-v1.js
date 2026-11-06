/* ===== dev only: Fernfield International Airport, redone ("airport v2") =====
   Adds to the game's own airport (139-airport.js), in the same voxel style, without changing doors, gates, desks or saves.
   OUTSIDE (the home airport): a glazed barrel-vault atrium on the roof with a lit logo, white fins and a coral roof line,
     solar arrays, a stepped canopy with skylights and coral edge, column plinths, a framed entrance with a glowing sign,
     paved forecourt, raised planting beds with proper trees, benches, lamps, bins, a taxi rank, a shuttle bus, a fuel truck,
     cones and a hangar.
   INSIDE (the terminal, the same one at every airport): inlaid stone floors (checker hall with a compass rose, diamond
     concourse with guide line and arrows, patterned gate carpets), navy wainscot with wall lights and light-box adverts,
     check-in belts, scales and queue posts, shop details (espresso machine, menu boards, grills, magazines), two new kiosks
     with staff, palms and planters, a play corner, trolleys, vending machines, an ATM, lockers and bins.
   NPC walking lanes and all existing interaction spots are kept clear. Only loaded on /dev/. Add ?noairport to skip it. */
(function(){
 if(!window.FW_FEAT||/[?&]noairport/.test(location.search)||typeof THREE=='undefined')return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev airport '+t,e)}}};
 const AX=4000,AZ=320,AW=72,AD=56,FONT='"Trebuchet MS","Segoe UI",Arial,sans-serif',GU=i=>6+12*(i-1);
 let outDone=0,inDone=0;const CL=(()=>{try{return cols}catch(e){return null}})();
 const flush=(G,grp,mat)=>(xgFlush(G,mat||SBM)||[]).forEach(m=>{scene.remove(m);grp.add(m)});
 const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t};
 const sign=(grp,w,h,x,y,z,ry,draw,bright)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:cv(Math.round(w*128),Math.round(h*128),draw),side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry||0;grp.add(m);return m};
 const txt=(t,bg,fg,bar)=>(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);if(bar){c.fillStyle=bar;c.fillRect(0,H*.9,W,H*.1)}c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';let fs=H*.6;c.font='bold '+fs+'px '+FONT;while(c.measureText(t).width>W*.92&&fs>8){fs-=2;c.font='bold '+fs+'px '+FONT}c.fillText(t,W/2,H/2)};
 /* a voxel tree: trunk plus three stacked frusta; s = scale, y0 = ground height */
 function tree(G,x,z,s,y0,c1){y0=y0||0;const cs=c1||['#2f8a4f','#3aa062','#52b873'];xgPrism(G,.2*s,.16*s,1.5*s,6,'#7a5232',x,y0,z);
  xgPrism(G,1.7*s,1.25*s,1.2*s,8,cs[0],x,y0+1.2*s,z,{ph:.2});xgPrism(G,1.35*s,.85*s,1.1*s,8,cs[1],x,y0+2.2*s,z,{ph:.4});xgPrism(G,.9*s,.3*s,1*s,8,cs[2],x,y0+3.1*s,z,{ph:.1})}
 /* a potted palm: trunk and a star of six fronds */
 function palm(G,x,z,s,y0){y0=y0||0;xgPrism(G,.14*s,.1*s,2.1*s,6,'#8a6a4a',x,y0,z);for(let k=0;k<6;k++){const a=k*Math.PI/3+.3,r=.7*s;xgBox(G,1.5*s,.1*s,.42*s,k%2?'#2f8a4f':'#3aa062',x+Math.cos(a)*r,y0+2.15*s-(k%2)*.12*s,z+Math.sin(a)*r,-a)}
  xgBox(G,.4*s,.3*s,.4*s,'#6b4a32',x,y0+2.05*s,z)}
 /* a small car, long axis along z ('z') or x ('x') */
 function car(G,x,z,ax,col,taxi){const L=ax=='z',B=(w,h,d,c,dx,y,dz)=>xgBox(G,L?w:d,h,L?d:w,c,x+(L?dx:dz),y,z+(L?dz:dx));
  B(1.9,.7,4.3,col,0,.62,0);B(1.7,.62,2.2,col,0,1.28,-.2);B(1.74,.4,2,'#1b2533',0,1.3,-.2);B(1.9,.16,4.3,'#ffffff',0,.3,0);
  [[-.95,1.4],[.95,1.4],[-.95,-1.4],[.95,-1.4]].forEach(q=>B(.3,.5,.7,'#15171c',q[0],.28,q[1]));B(1.3,.14,.1,'*fff5c8',0,.75,2.16);B(1.3,.14,.1,'#d33',0,.75,-2.16);
  if(taxi){B(.9,.28,.4,'*ffe14a',0,1.74,-.2)}}

 /* ================= outside ================= */
 function decorOut(og){
  const X1=-330,Z0=-40,Z1=80,MZ=20,G=xgNew(),bx=(w,h,d,c,x,y,z,ry,tc)=>xgBox(G,w,h,d,c,x,y,z,ry,tc),col=(a,b,c,d)=>CL&&CL.push([a,b,c,d]);
  /* --- roof: glazed barrel vault over the entrance hall, white cap and ribs, coral roof line --- */
  for(let z=5;z<36;z+=2){const u=(z-20)/16,h=2.5+Math.sqrt(Math.max(0,1-u*u))*7,top=14.5+h;
   bx(24.8,h,2,z%4==1?'#8cc4ea':'#a3d2f0',-343.6,14.5+h/2,z);bx(24.8,.26,2.02,'#ffffff',-343.6,top+.1,z);bx(.5,h,.34,'#f4f6fa',-331.15,14.5+h/2,z)}
  bx(.5,.5,32,'#ff6b4a',-331.1,15,20);
  bx(.14,.32,Z1-Z0+2,'#ff6b4a',-328.93,14.2,(Z0+Z1)/2);
  /* --- white fins above the glazing, each side of the sign --- */
  for(let z=Z0+3;z<Z1;z+=2.5){if(z>3&&z<37)continue;bx(.34,2.6,.5,'#ffffff',X1+.35,12.5,z);bx(.5,.18,.5,'#ff6b4a',X1+.35,13.9,z)}
  /* --- solar arrays on the roof and a mast --- */
  [[-36,-8],[42,76]].forEach(([a,b])=>{for(let z=a;z<=b;z+=3.4)for(let x=-397;x<=-379;x+=6.2){bx(5.8,.14,2.6,'#8f98a3',x,14.62,z);bx(5.5,.1,2.3,'#1d3560',x,14.72,z,0,'#2a4c86');bx(.1,.12,2.3,'#9fb4d8',x,14.78,z)}});
  bx(.45,9,.45,'#cfd5dc',-392,19,0);bx(1.8,.18,.18,'#cfd5dc',-392,22,0);bx(.5,.5,.5,'*ff3b3b',-392,23.7,0);
  /* --- canopy trim: skylights and a coral edge on a material that fades with the canopy, plinths on the columns --- */
  const G3=xgNew(),cm=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true}),c3=(w,h,d,c,x,y,z)=>xgBox(G3,w,h,d,c,x,y,z);
  for(let z=-7;z<=47;z+=6)for(let x=-326;x<=-312;x+=7)c3(5.2,.1,5,'#c4e6fa',x,7.58,z);
  c3(.5,.2,60.5,'#ff6b4a',-306.05,7.5,20);c3(24.4,.2,.5,'#ff6b4a',-318,7.5,-10.15);c3(24.4,.2,.5,'#ff6b4a',-318,7.5,50.15);
    for(let z=-6;z<=46;z+=8){c3(.9,.5,.9,'#0b2a5b',-307,.25,z);c3(.7,.2,.7,'#ff6b4a',-307,.6,z);c3(.8,.4,.8,'#0b2a5b',-307,6.7,z)}flush(G3,og,cm);if(window.APT)APT.fadeM.push({m:cm,b:[-330,-10.4,-305.6,50.4,7.6]});
  /* --- entrance: framed portal and a lit sign over the doors --- */
  [13.6,26.4].forEach(z=>{bx(.9,6.6,.8,'#0b2a5b',X1+.5,3.3,z);bx(1.1,.3,1,'#ff6b4a',X1+.5,6.75,z)});bx(1.1,.8,13.2,'#0b2a5b',X1+.5,6.4,20);bx(.12,.3,12.6,'*7fd4ff',X1+1.1,5.95,20);
  bx(3,.04,8.4,'#2b3a4c',-328,.06,20);
  sign(og,18,2.4,-330.85,18.4,20,Math.PI/2,(c,W,H)=>{c.fillStyle='#0b2a5b';c.fillRect(0,0,W,H);c.fillStyle='#ff6b4a';c.fillRect(0,H*.88,W,H*.12);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.font='bold '+H*.5+'px '+FONT;c.fillText('FERNFIELD',W/2,H*.42);c.fillStyle='#ffd84a';c.font='bold '+H*.17+'px '+FONT;c.fillText('INTERNATIONAL AIRPORT  ·  SWIFTWING',W/2,H*.76)});
  /* --- forecourt paving lines, drop-off kerb stripe --- */
  for(let x=-327;x<=-303;x+=3)bx(.14,.02,62,'#c3bdae',x,.035,20);for(let z=-8;z<=50;z+=3)bx(30,.02,.14,'#c3bdae',-315,.036,z);
  for(let z=-10;z<50;z+=4)bx(.3,.03,2,z%8?'#ffd84a':'#1b2533',-300.4,.045,z);
  /* --- planting beds: stone ledge, soil, hedge blocks, flowers, two trees each --- */
  [[-3,12],[43,12]].forEach(([zc,len])=>{const x=-326.2;bx(1.9,.7,len,'#e6e0d2',x,.35,zc,0,'#f4efe3');bx(1.5,.05,len-.4,'#4a3324',x,.72,zc);
   for(let k=0;k<3;k++){bx(1.3,.8,3.4,k%2?'#2e8b57':'#37a062',x,1.1,zc-3.9+k*3.9)}
   for(let k=0;k<9;k++)bx(.34,.34,.34,['#ff6b4a','#ffd84a','#ff8fb0','#ffffff'][k%4],x+(k%2?.35:-.35),1.62,zc-5+k*1.25);
   tree(G,x,zc-5,.85,.7);tree(G,x,zc+5,.85,.7,['#3a9a5c','#45b06c','#66c685']);col(x-1,zc-len/2,x+1,zc+len/2)});
  /* --- benches, lamps, bins --- */
  [[-312.4,-4],[-312.4,8],[-312.4,32],[-312.4,44]].forEach(([x,z])=>{bx(.8,.12,2.6,'#8a5f3a',x,.5,z);bx(.12,.8,2.6,'#6b4a32',x+.4,.95,z);[-1,1].forEach(s=>bx(.7,.5,.14,'#3d4350',x,.25,z+s*1.1));col(x-.5,z-1.4,x+.5,z+1.4)});
  [-8,14,26,48].forEach(z=>{bx(.2,5.2,.2,'#3d4350',-314.5,2.6,z);bx(1.4,.16,.2,'#3d4350',-314.5,5.2,z+.6);bx(.6,.2,.6,'*fff5c8',-314.5,5.05,z+1.2)});
  [[-312.4,12],[-312.4,28]].forEach(([x,z])=>{bx(.8,1.1,.8,'#3d4350',x,.55,z);bx(.84,.2,.84,'#ff6b4a',x,.9,z);col(x-.4,z-.4,x+.4,z+.4)});
  /* --- taxi rank and shuttle bus --- */
  [[-304,-8],[-304,-2.5],[-304,3]].forEach(([x,z],i)=>{car(G,x,z,'z','#ffc41a',1);col(x-1,z-2.2,x+1,z+2.2)});
  bx(3,3.1,10.6,'#ffffff',-304.2,1.9,39,0,'#e8ecf2');bx(3.06,.7,10.7,'#ff6b4a',-304.2,.8,39);bx(3.1,1,9.8,'#1b2533',-304.2,2.5,39);bx(3.1,.2,10.7,'#0b2a5b',-304.2,3.4,39);
  [-1,1].forEach(s=>{bx(.5,.9,1.3,'#15171c',-304.2+s*1.35,.45,36);bx(.5,.9,1.3,'#15171c',-304.2+s*1.35,.45,42);bx(.1,2,1.4,'#2a3a52',-302.65,2,37.5)});bx(2.4,.14,.1,'*fff5c8',-304.2,1,44.35);bx(1.6,.5,.1,'*7fd4ff',-304.2,3.1,44.35);col(-305.8,33.5,-302.6,44.5);
  /* --- apron: fuel truck, cones --- */
  bx(2.4,2,3,'#ff6b4a',-366,1.2,97.5);bx(2.6,1.8,5.2,'#f4f6f9',-366,1.5,101.6,0,'#ffffff');bx(2.7,.3,5.2,'#0b2a5b',-366,.75,101.6);bx(2.7,.2,5.2,'#ff6b4a',-366,1.5,101.6);
  [[-390,104],[-360,106],[-380,98],[-345,98],[-352,104]].forEach(([x,z])=>{bx(.5,.12,.5,'#ff7a1a',x,.06,z);bx(.3,.6,.3,'#ff7a1a',x,.4,z);bx(.34,.14,.34,'#ffffff',x,.45,z)});
  /* --- hangar west of the gates: steel walls, barrel roof, open front, glowing sign --- */
  {const hx0=-478,hx1=-436,hz0=92,hz1=130;bx(1,11,hz1-hz0,'#8d98a6',hx0,5.5,(hz0+hz1)/2);bx(1,11,hz1-hz0,'#8d98a6',hx1,5.5,(hz0+hz1)/2);bx(hx1-hx0,11,1,'#8d98a6',(hx0+hx1)/2,5.5,hz0);bx(hx1-hx0-1,.04,hz1-hz0,'#6d7580',(hx0+hx1)/2,.02,(hz0+hz1)/2);
   for(let x=hx0+1;x<hx1;x+=2.5){const u=((x-(hx0+hx1)/2)/((hx1-hx0)/2)),h=1+Math.sqrt(Math.max(0,1-u*u))*4.5;bx(2.5,h,hz1-hz0+1,x%5<2.6?'#c7ced8':'#b6bfcb',x+1.25,11+h/2,(hz0+hz1)/2)}
   for(let z=hz0+3;z<hz1;z+=6){bx(1.3,11,.5,'#556070',hx0+.2,5.5,z);bx(1.3,11,.5,'#556070',hx1-.2,5.5,z)}
   bx(hx1-hx0,2.8,1.2,'#0b2a5b',(hx0+hx1)/2,9.6,hz1);bx(1.4,11,1.4,'#0b2a5b',hx0,5.5,hz1);bx(1.4,11,1.4,'#0b2a5b',hx1,5.5,hz1);bx(hx1-hx0,.3,1.3,'#ff6b4a',(hx0+hx1)/2,8.1,hz1);col(hx0-.8,hz0,hx0+.8,hz1);col(hx1-.8,hz0,hx1+.8,hz1);col(hx0,hz0,hx1,hz0+1);
   sign(og,28,2.2,(hx0+hx1)/2,9.7,hz1+.65,0,txt('FERNFIELD AERO · HANGAR 1','#0b2a5b','#ffd84a','#ff6b4a'))}
  flush(G,og)}

 /* ================= inside ================= */
 function floor(grp,x0,z0,x1,z1,ppm,draw){const W=Math.round((x1-x0)*ppm),H=Math.round((z1-z0)*ppm),t=cv(W,H,(c)=>draw(c,W,H,ppm,v=>v*ppm,v=>(v-z0)*ppm));t.magFilter=THREE.NearestFilter;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(AX+(x0+x1)/2,.045,AZ+(z0+z1)/2);grp.add(m)}
 function decorIn(g){
  const G=xgNew(),u=v=>AX+v,w=v=>AZ+v,bx=(W,H,D,c,x,y,z,tc)=>xgBox(G,W,H,D,c,u(x),y,w(z),0,tc),col=(a,b,c,d)=>APT.cols.push([u(a),w(b),u(c),w(d)]),tr=(x,z,sc,y,c)=>tree(G,u(x),w(z),sc,y,c),pm=(x,z,sc,y)=>palm(G,u(x),w(z),sc,y);
  /* the game's own plain green cubes are removed (their vertices sink under the floor) and replaced by palms below */
  [[3,54],[70,54],[3,38],[30,52],[42,52]].forEach(([a,b])=>g.children.forEach(m=>{const pa=m.geometry&&m.geometry.attributes&&m.geometry.attributes.position;if(!pa||!m.isMesh)return;let ch=0;for(let i=0;i<pa.count;i++){const px=pa.getX(i)-AX,pz=pa.getZ(i)-AZ,py=pa.getY(i);if(Math.abs(px-a)<.75&&Math.abs(pz-b)<.75&&py>.01&&py<2.1){pa.setY(i,-9);ch=1}}if(ch)pa.needsUpdate=true}));
  /* floors */
  floor(g,0,34.3,AW,55.9,14,(c,W,H,p,X,Z)=>{c.fillStyle='#b4ac9e';c.fillRect(0,0,W,H);for(let i=0;i<24;i++)for(let j=0;j<8;j++){if((i+j)%2){c.fillStyle='#a69e90';c.fillRect(X(i*3),Z(34.3+j*3),3*p,3*p)}}
   c.strokeStyle='#8d8678';c.lineWidth=1;for(let i=0;i<=24;i++){c.beginPath();c.moveTo(X(i*3),0);c.lineTo(X(i*3),H);c.stroke()}for(let j=0;j<=8;j++){c.beginPath();c.moveTo(0,Z(34.3+j*3));c.lineTo(W,Z(34.3+j*3));c.stroke()}
   const cx=X(36),cy=Z(46),R=5.2*p;c.fillStyle='#0b2a5b';c.beginPath();c.arc(cx,cy,R,0,7);c.fill();c.fillStyle='#16408a';c.beginPath();c.arc(cx,cy,R*.86,0,7);c.fill();c.strokeStyle='#ffd84a';c.lineWidth=3;c.beginPath();c.arc(cx,cy,R*.86,0,7);c.stroke();c.beginPath();c.arc(cx,cy,R*.5,0,7);c.stroke();
   for(let i=0;i<16;i++){const a=i*Math.PI/8,L=i%2?R*.55:R*.8,k=i%4==0?.1:.06;c.fillStyle=i%4==0?'#ffd84a':i%2?'#7fb2dd':'#ffffff';c.beginPath();c.moveTo(cx+Math.cos(a-k)*R*.1,cy+Math.sin(a-k)*R*.1);c.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L);c.lineTo(cx+Math.cos(a+k)*R*.1,cy+Math.sin(a+k)*R*.1);c.fill()}
   c.fillStyle='#ff6b4a';c.beginPath();c.arc(cx,cy,R*.1,0,7);c.fill();c.fillStyle='#fff';c.font='bold '+p*.9+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('N',cx,cy-R*.93-p*.1);
   c.fillStyle='#16408a';c.fillRect(X(31.5),Z(54.2),9*p,1.5*p);c.strokeStyle='#ffd84a';c.lineWidth=2;c.strokeRect(X(31.5),Z(54.2),9*p,1.5*p)});
  floor(g,0,15,AW,34.1,14,(c,W,H,p,X,Z)=>{c.fillStyle='#b6afa1';c.fillRect(0,0,W,H);c.save();c.translate(W/2,H/2);c.rotate(Math.PI/4);const s=3.4*p;for(let i=-30;i<30;i++)for(let j=-30;j<30;j++){c.fillStyle=(i+j)%2?'#a8a193':'#b8b1a3';c.fillRect(i*s,j*s,s,s)}c.restore();
   c.fillStyle='#16408a';c.fillRect(0,0,W,.35*p);c.fillStyle='#ffd84a';for(let z=33.6;z>29;z-=1.2)c.fillRect(X(35.9),Z(z),.2*p,.7*p);
   const arrow=(x,dir,t)=>{const y=Z(30.2),a=2.6*p;c.fillStyle='#0b2a5b';c.beginPath();c.moveTo(X(x)+dir*a,y);c.lineTo(X(x)+dir*a*.35,y-a*.55);c.lineTo(X(x)+dir*a*.35,y-a*.22);c.lineTo(X(x)-dir*a,y-a*.22);c.lineTo(X(x)-dir*a,y+a*.22);c.lineTo(X(x)+dir*a*.35,y+a*.22);c.lineTo(X(x)+dir*a*.35,y+a*.55);c.closePath();c.fill();c.strokeStyle='#ffd84a';c.lineWidth=2;c.stroke();c.fillStyle='#fff';c.font='bold '+p*.8+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(t,X(x)-dir*a*.3,y)};arrow(18,-1,'GATES 1-3');arrow(54,1,'GATES 4-6')});
  floor(g,0,11.6,AW,15,14,(c,W,H,p,X,Z)=>{c.fillStyle='#b0a99b';c.fillRect(0,0,W,H);c.strokeStyle='#958e80';for(let i=0;i<=36;i++){c.beginPath();c.moveTo(X(i*2),0);c.lineTo(X(i*2),H);c.stroke()}c.fillStyle='#ffd84a';c.fillRect(0,0,W,.25*p);c.fillRect(0,H-.18*p,W,.18*p)});
  floor(g,0,.3,AW,11.6,14,(c,W,H,p,X,Z)=>{c.fillStyle='#193f74';c.fillRect(0,0,W,H);c.fillStyle='#20508f';for(let i=0;i<AW*2;i+=2)c.fillRect(X(i*.5),0,.5*p,H);
   for(let i=1;i<=6;i++){const a=GU(i);c.fillStyle='#2f68ad';c.fillRect(X(a-5),Z(5.6),10*p,6*p);c.strokeStyle='#ffffff';c.lineWidth=2;c.strokeRect(X(a-5)+3,Z(5.6)+3,10*p-6,6*p-6);c.fillStyle='#ffd84a';c.font='bold '+p*2.2+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(String(i),X(a-1.2),Z(3.3))}});
  /* walls: navy wainscot, wall lights, light-box adverts */
  bx(.22,1.1,AD-.4,'#16408a',.11,.55,AD/2);bx(.26,.1,AD-.4,'#ffffff',.13,1.15,AD/2);
  [5,12,29,33,38].forEach(z=>{bx(.26,.5,.3,'*ffe9b0',.16,4,z);bx(.2,.1,.5,'#566270',.1,3.7,z)});
  [[39.1,'FLY SWIFTWING','#ff6b4a','#ffd9a8'],[30.4,'FERNFIELD · AIR','#2a6cc0','#bfe3ff']].forEach(([z,t,a,b])=>{bx(.2,3,5.4,'#0b2a5b',.1,2.6,z);sign(g,4.8,2.6,u(.22),2.6,w(z),Math.PI/2,(c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,a);gr.addColorStop(1,b);c.fillStyle=gr;c.fillRect(0,0,W,H);c.fillStyle='#fff';c.beginPath();c.arc(W*.7,H*.34,H*.16,0,7);c.fill();c.fillStyle='#0b2a5b';c.font='bold '+H*.16+'px '+FONT;c.textAlign='center';c.fillText(t,W/2,H*.86)})});
  /* check-in: belts, scales, monitors, queue posts */
  [8,13,18,23].forEach(a=>{bx(1.8,.12,.76,'#2b2f36',a-.35,1.11,44.7);for(let k=0;k<5;k++)bx(.06,.14,.76,'#555c66',a-1+k*.4,1.12,44.7);bx(1.9,.18,.08,'#9aa3ad',a-.35,1.2,44.28);bx(.5,.06,.4,'#cfd5dc',a+.62,1.1,44.7);bx(.4,.3,.06,'#0e1626',a+.62,1.32,44.28,'#2a6cc0');bx(.9,.08,.12,'#ff6b4a',a,.62,45.2)});
  [10.5,15.5,20.5].forEach(x=>{bx(.12,.9,.12,'#cfd5dc',x,.45,46.4);bx(.24,.1,.24,'#d9dde3',x,.95,46.4)});[6,11,16,21,26].forEach(x=>bx(.24,.1,.24,'#d9dde3',x,.95,48.4));
  [5,9,13].forEach(x=>{bx(.9,.55,.5,'#2d5a8d',x,.28,47.1);bx(.8,.4,.45,'#c0392b',x+.1,.75,47.1)});
  /* central garden beds either side of the rose */
  [28,44].forEach(x=>{bx(2.2,.7,6.6,'#e6e0d2',x,.35,46,'#f4efe3');bx(1.8,.05,6.2,'#4a3324',x,.72,46);bx(1.4,.7,2.4,'#37a062',x,1.1,43.6);bx(1.4,.7,2.4,'#2e8b57',x,1.1,48.4);for(let k=0;k<6;k++)bx(.3,.3,.3,['#ff6b4a','#ffd84a','#ff8fb0'][k%3],x+(k%2?.4:-.4),1.55,43+k*1.1);tr(x,46,.7,.7);col(x-1.1,42.7,x+1.1,49.3)});
  /* airside: palms and planters */
  [12.5,24.5,36.5,48.5,60.5].forEach(x=>{bx(1.8,.6,1.8,'#e6e0d2',x,.3,8.8,'#f4efe3');pm(x,8.8,.9,.6);col(x-.9,7.9,x+.9,9.7)});
  [[36,18.5]].forEach(([x,z])=>{bx(3.2,.6,1.6,'#e6e0d2',x,.3,z,'#f4efe3');pm(x-.8,z,.8,.6);pm(x+.8,z,.8,.6);col(x-1.6,z-.8,x+1.6,z+.8)});
  [[3,54],[70,54],[3,38],[30,52],[42,52]].forEach(([x,z])=>{bx(1.3,.7,1.3,'#8a6a4a',x,.35,z,'#4a3324');pm(x,z,1.15,.7)});
  /* shops */
  bx(.9,.7,.5,'#9aa3ad',21,1.45,17.4);bx(.7,.2,.4,'#2b2f36',21,1.9,17.4);bx(1.8,.7,.6,'#d9ecfa',25,1.45,17.1,'#bfe3ff');[0,1,2].forEach(k=>bx(.3,.3,.3,'#ffe0b0',24.3+k*.7,1.95,17.1));[0,1,2].forEach(k=>bx(.28,.35,.28,'#ffffff',22.6+k*.5,1.28,17.5));
  sign(g,3.2,.9,u(23),1.95,w(15.8),0,txt('ESPRESSO 3 · LATTE 4','#2a1d14','#ffe0b0'));sign(g,3.2,.9,u(64),1.95,w(15.8),0,txt('BURGER 14 · FRIES 6','#7a241a','#fff'));
  [60.5,63,65.5,68].forEach((x,i)=>bx(1.4,.5,.8,i%2?'#9aa3ad':'#2b2f36',x,1.35,17.4));bx(.8,.8,.8,'#9aa3ad',66,1.5,16.6);
  [0,1,2,3,4].forEach(k=>bx(.5,.85,.12,['#c0392b','#2d5a8d','#e6b422','#2fae5a','#7a5ad8'][k],47.8+k*.9,1.5,16.4));
  /* two new kiosks */
  [[12,22,'FERN & BLOOM','#c2457c','#ffe3ee'],[55,22,'TECH HUB','#16408a','#cfe6ff']].forEach(([x,z,t,a,b])=>{bx(5.4,1,1.2,'#f4f6f9',x,.5,z,a);bx(5.6,.14,1.4,a,x,1.06,z);bx(5.4,2.5,.25,'#3a4552',x,1.25,z-1.2);for(let k=0;k<4;k++)bx(1,.14,.5,[a,b][k%2],x-2+k*1.3,1.3+k%2*.6,z-.95);bx(5.8,.22,.3,a,x,2.62,z-1.1);col(x-2.9,z-1.4,x+2.9,z+.8);
   sign(g,5.4,.9,u(x),3.1,w(z-1.2),0,txt(t,a,'#fff'))});
  /* play corner, trolleys, vending, ATM, lockers, bins */
  bx(6.6,.05,4,'#2fae5a',66,.06,23.6);[[64,22.7,'#ff6b4a'],[66,24.3,'#ffd84a'],[68,22.7,'#2a6cc0'],[65,24.6,'#7a5ad8'],[67.6,24.8,'#ff8fb0']].forEach(([x,z,c])=>{bx(1.1,1.1,1.1,c,x,.58,z);bx(.5,.5,.5,'#ffffff',x,1.4,z)});col(62.6,21.5,69.4,25.8);
  [[3.5,40.6],[3.5,43.6],[31.5,41],[44,41]].forEach(([x,z])=>{bx(1.2,.1,.8,'#9aa3ad',x,.55,z);bx(.08,.9,.8,'#9aa3ad',x-.55,1,z);bx(1.1,.04,.7,'#cfd5dc',x,.92,z)});
  [[70.4,44,'#ff6b4a'],[70.4,46.3,'#2d5a8d']].forEach(([x,z,c])=>{bx(1,2,1.6,c,x,1,z,'#fff');bx(.1,1.2,1.1,'*aee4ff',x-.52,1.2,z);col(x-.5,z-.8,x+.5,z+.8)});bx(.9,1.9,1.1,'#0b2a5b',70.4,.95,48.6,'#16408a');bx(.1,.4,.8,'*2fe68a',69.94,1.5,48.6);col(69.9,48,70.9,49.2);
  for(let i=0;i<6;i++)bx(.9,2,.9,i%2?'#ff6b4a':'#7fb2dd',3.6+i*.95,1,35.6,'#fff');col(3,35,9.4,36.2);
  [[28.5,40.4],[44,40.4],[28,16.2],[46,16.2],[2,17]].forEach(([x,z])=>{bx(.55,.9,.55,'#566270',x,.45,z);bx(.65,.12,.65,'#2b3440',x,.95,z)});
  flush(G,g);
  /* staff at the new kiosks */
  [[12,20.9,'#c2457c'],[55,20.9,'#16408a']].forEach(([x,z,tc])=>{const c=buildChar({skin:Math.floor(Math.random()*6),eyes:1,mouth:1,hair:Math.floor(Math.random()*12),hc:Math.floor(Math.random()*12),top:0,tc_custom:tc,tc:0,pc:3,body:.5});c.g.position.set(u(x),0,w(z));g.add(c.g);APT.npc.push({c,k:'idle',ph:Math.random()*6})})}

 setInterval(()=>safe(()=>{
  if(typeof APT!='object'||!APT)return;
  if(!outDone&&APT.og){outDone=1;decorOut(APT.og)}
  if(!inDone&&APT.grp){inDone=1;decorIn(APT.grp)}
 },'build'),600);
})();
