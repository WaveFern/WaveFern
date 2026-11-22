/* ===== dev only: Fernfield International Airport, redone ("airport v2") =====
   Adds to the game's own airport (139-airport.js), in the same voxel style, without changing doors, gates, desks or saves.
   OUTSIDE (the home airport): a glazed barrel-vault atrium on the roof with a lit logo, white fins and a coral roof line,
     solar arrays, a stepped canopy with skylights and coral edge, column plinths, a framed entrance with a glowing sign,
     paved forecourt, raised planting beds with proper trees, benches, lamps, bins, a taxi rank, a shuttle bus, a fuel truck,
     cones and a hangar.
   INSIDE (the terminal): now built by 139-airport.js (v55.25.0 rebuild), not here.
   NPC walking lanes and all existing interaction spots are kept clear. Only loaded on /dev/. Add ?noairport to skip it. */
(function(){
 if(!window.FW_FEAT||/[?&]noairport/.test(location.search)||typeof THREE=='undefined')return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev airport '+t,e)}}};
 const AX=4000,AZ=320,AW=72,AD=56,FONT='"Trebuchet MS","Segoe UI",Arial,sans-serif',GU=i=>6+12*(i-1);
 let outDone=0;const CL=(()=>{try{return cols}catch(e){return null}})();
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

 setInterval(()=>safe(()=>{
  if(typeof APT!='object'||!APT)return;
  if(!outDone&&APT.og){outDone=1;decorOut(APT.og)}
 },'build'),600);
})();
