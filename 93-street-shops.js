/* ===== v26.93: the shops on your street, rebuilt =====
   The street shops were coloured boxes (mkShop, 14-world...js) with a door, two windows and a floating name tag, and
   v26.92 stacked a facade on top of that, which overlapped the old door and windows and looked glitchy. Now each street
   shop except Motors (which keeps its v26.92 showroom) is built from scratch here as one clean building, in
   realistic colours: stone, brick, render and timber. Every side the camera sees is detailed: a plinth, corner
   pilasters, a cornice and parapet, a proper shopfront (stall risers, framed display windows with things in them,
   a recessed door with a step, a painted fascia with the shop name, wall lamps), side windows, a drainpipe, a roof
   with a hatch and vents, and some fittings that suit the shop. Collision, the way in and the room inside are the same
   as before. Everything is batched (SB), so it costs about one mesh per shop. */
const SHOPX={
 34:{n:'JEWELLERY',h:4.6,wall:'#e6dfd0',band:'#d9d1c0',trim:'#bfae86',fas:'#1f2a24',txt:'#e6c46a',door:'#1f2a24',glass:'#a9c4cc',sill:'#bfae86',up:1,
  win:(X,z,x0,x1,w)=>{/* velvet stands with rings, necklaces and watches */w.forEach((u,k)=>{SB(.3,.36,.18,'#4a1f2e',u,.95,z+.12);SB(.2,.1,.14,['#e6c46a','#e8e8f0','#e84a8a','#7fd0ff'][k%4],u,1.18,z+.13);SB(.06,.06,.06,'#ffffff',u+.06,1.26,z+.16)});SB(x1-x0-.1,.05,.24,'#4a1f2e',(x0+x1)/2,.78,z+.12)},
  extra:(X,z,H)=>{/* gold lettering lamps, a hanging diamond sign, potted bay trees, a gold-trimmed door canopy */
   SB(2,.08,.7,'#1f2a24',X,2.42,z+.35);SB(2.04,.04,.74,'#bfae86',X,2.38,z+.35);
   SB(.05,.05,.8,'#2a2a2a',X+3.3,3.4,z+.4);SB(.06,.5,.5,'#1f2a24',X+3.3,3.05,z+.75);SB(.07,.3,.3,'#7fd0ff',X+3.3,3.05,z+.75);SB(.08,.12,.12,'#ffffff',X+3.3,3.1,z+.75);
   [-3.5,3.5].forEach(x=>{SB(.5,.5,.5,'#2a2a2a',X+x,.25,z+.45);SB(.06,.5,.06,'#6b4a2e',X+x,.75,z+.45);SB(.6,.6,.6,'#2e6b3a',X+x,1.25,z+.45);SB(.4,.3,.4,'#3a7d46',X+x,1.65,z+.45)})}},
 44:{n:'PROPERTY',h:4.6,wall:'#9c4a35',band:'#8e4330',trim:'#efebe2',fas:'#22324a',txt:'#ffffff',door:'#22324a',glass:'#a9c4cc',sill:'#efebe2',up:1,brick:1,
  win:(X,z,x0,x1,w)=>{/* house listings on display boards */w.forEach((u,k)=>{SB(.42,.56,.03,'#f8f8f6',u,1.4,z+.1);SB(.32,.2,.02,['#d9b88f','#cfd8dc','#e8c4c4','#f2e6d0'][k%4],u,1.45,z+.12);SB(.36,.12,.02,['#6b4a2e','#455a64','#8d2d2d','#5a3a22'][k%4],u,1.6,z+.12);SB(.36,.06,.02,'#22324a',u,1.2,z+.12)})},
  extra:(X,z,H)=>{/* a for sale sign by the door and a brass plaque */
   SB(.08,1.3,.08,'#efebe2',X+3.6,.65,z+.95);SB(.9,.08,.08,'#efebe2',X+3.2,1.3,z+.95);SB(.7,.5,.04,'#22324a',X+3.2,1,z+.97);SB(.56,.14,.03,'#ffffff',X+3.2,1.06,z+1);SB(.56,.06,.03,'#e6b422',X+3.2,.86,z+1);
   SB(.14,.24,.02,'#c9a227',X+1.01,1.6,z+.19)}},
 54:{n:'CORNER SHOP',h:3.9,wall:'#c7ad84',band:'#b99e75',trim:'#efe9dc',fas:'#2f5a3a',txt:'#f4e8c8',door:'#2f5a3a',glass:'#a9c4cc',sill:'#efe9dc',brick:1,awn:['#2f5a3a','#efe9dc'],
  win:(X,z,x0,x1,w)=>{/* stacked tins, cereal boxes and bottles */for(let r=0;r<2;r++)w.forEach((u,k)=>{SB(.16,.22,.12,['#c0392b','#e6b422','#2d6a9a','#2e8b57','#e67e22'][(k+r*2)%5],u-.1,.9+r*.4,z+.12);SB(.1,.26,.1,['#2e8b57','#c0392b','#e6b422'][(k+r)%3],u+.12,.92+r*.4,z+.12)});SB(x1-x0-.1,.04,.22,'#d8cfb8',(x0+x1)/2,.78,z+.12);SB(x1-x0-.1,.04,.22,'#d8cfb8',(x0+x1)/2,1.18,z+.12)},
  extra:(X,z,H)=>{/* fruit and veg stand, ice cream freezer, newspapers, a chalk board, a post box */
   SB(2,.1,.8,'#8a5a36',X-2.4,.75,z+.6);[[-.7,'#c0392b'],[-.23,'#2e8b57'],[.23,'#e6b422'],[.7,'#e67e22']].forEach(q=>{SB(.42,.22,.7,'#6b4a2e',X-2.4+q[0],.91,z+.6);for(let j=0;j<4;j++)SB(.12,.12,.12,q[1],X-2.4+q[0]+(j%2?.08:-.08),1.08,z+.4+j*.13)});[-1,1].forEach(s=>{SB(.08,.7,.08,'#6b4a2e',X-2.4+s*.9,.35,z+.3);SB(.08,.7,.08,'#6b4a2e',X-2.4+s*.9,.35,z+.9)});
   SB(.9,.85,.6,'#f4f4f4',X+2.5,.43,z+.45);SB(.92,.1,.62,'#2d6a9a',X+2.5,.9,z+.45);SB(.6,.28,.02,'#f0b8c8',X+2.5,.55,z+.76);
   SB(.55,.9,.4,'#2f5a3a',X+3.5,.45,z+.35);for(let j=0;j<3;j++)SB(.48,.05,.32,['#f4f4f4','#e8e0c8','#f4f4f4'][j],X+3.5,.94+j*.06,z+.35);
   SB(.6,.8,.06,'#3a2a1a',X-.95,.4,z+1.05);SB(.5,.6,.02,'#20302a',X-.95,.45,z+1.09);for(let j=0;j<3;j++)SB(.32,.03,.01,'#e8e8e0',X-.95,.6-j*.12,z+1.1)}},
 64:{n:'RADIO 88.1',h:4.2,wall:'#8f9398',band:'#868a8f',trim:'#5a5e64',fas:'#2a2d33',txt:'#ffffff',door:'#3a3d42',glass:'#9fb4c2',sill:'#5a5e64',
  win:(X,z,x0,x1,w)=>{/* posters of the station's shows and a gold record */w.forEach((u,k)=>{if(k%2){SB(.4,.4,.03,'#c9a227',u,1.4,z+.1);SB(.3,.3,.02,'#1a1a1a',u,1.4,z+.12);SB(.1,.1,.02,'#c9a227',u,1.4,z+.13)}else{SB(.42,.6,.03,['#c0392b','#2d6a9a','#e6b422'][k%3],u,1.4,z+.1);SB(.32,.14,.02,'#ffffff',u,1.55,z+.12)}})},
  extra:(X,z,H)=>{/* ON AIR light box, a lattice mast with a red light and a satellite dish */
   SB(1.2,.34,.12,'#2a2d33',X+2.4,H-.55,z+.07);SB(1,.22,.04,'#e03a3a',X+2.4,H-.55,z+.14);
   const mx=X-2,mz=7;for(let k=0;k<6;k++){const y=H+.2+k*.7,w=.6-k*.07;[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>SB(.06,.7,.06,'#b8bcc2',mx+q[0]*w/2,y+.35,mz+q[1]*w/2));SB(w,.05,.05,'#9aa0a6',mx,y,mz-w/2);SB(.05,.05,w,'#9aa0a6',mx+w/2,y,mz)}
   SB(.18,.18,.18,'#ff3030',mx,H+4.5,mz);SB(.06,.5,.06,'#9aa0a6',mx,H+4.15,mz);SB(1,1,.12,'#e8e8ec',X+2.2,H+.9,7.4);SB(.14,.14,.4,'#9aa0a6',X+2.2,H+.9,7.65);SB(.3,.6,.3,'#8a8f96',X+2.2,H+.3,7.2)}},
 '-32':{n:'PET SHOP',h:3.9,wall:'#83987a',band:'#7a8f71',trim:'#efe9dc',fas:'#5a4632',txt:'#f4e8c8',door:'#5a4632',glass:'#a9c4cc',sill:'#efe9dc',timber:'#8a6a4a',awn:['#5a4632','#e8d9b8'],
  win:(X,z,x0,x1,w)=>{if(x0<X){/* a fish tank */const m=(x0+x1)/2;SB(1.6,.7,.3,'#2a2a30',m,.95,z+.2);SB(1.5,.6,.04,'#4a9ab9',m,1,z+.36);[[-.4,'#ff8a30'],[0,'#ffe066'],[.4,'#e84a8a']].forEach((q,j)=>SB(.14,.08,.02,q[1],m+q[0],.9+j*.13,z+.39));SB(1.5,.06,.04,'#e8d9a0',m,.74,z+.38)}
   else w.forEach((u,k)=>{SB(.4,.12,.3,['#c0392b','#2d6a9a','#e6b422'][k%3],u,.86,z+.15);SB(.3,.2,.02,['#e8d9b8','#ffffff'][k%2],u,1.4,z+.1)})},
  extra:(X,z,H)=>{/* a kennel, food bowls, a hanging paw print sign and a dog water tap */
   SB(1.1,.75,.9,'#a0522d',X+2.7,.38,z+.75);SB(1.2,.18,1,'#6b3a1e',X+2.7,.84,z+.75);SB(.9,.18,.8,'#7a4424',X+2.7,1,z+.75);SB(.45,.5,.04,'#2a1f1a',X+2.7,.3,z+1.21);
   SB(.3,.08,.3,'#2d6a9a',X+1.6,.04,z+1.1);SB(.3,.08,.3,'#c0392b',X+1.25,.04,z+1.1);
   SB(.05,.05,.8,'#2a2a2a',X-3.3,3.1,z+.4);SB(.06,.56,.56,'#5a4632',X-3.3,2.75,z+.75);SB(.07,.2,.2,'#f4e8c8',X-3.3,2.7,z+.75);[[-.15,.18],[-.05,.24],[.07,.24],[.17,.18]].forEach(q=>SB(.07,.07,.07,'#f4e8c8',X-3.3,2.7+q[1],z+.75+q[0]))}},
 '-44':{n:'SECURITY',h:4.2,wall:'#4a4d53',band:'#43464c',trim:'#2c2e33',fas:'#1c1e22',txt:'#e6b422',door:'#5a5f66',glass:'#3c4d5c',sill:'#2c2e33',bars:1,
  win:(X,z,x0,x1,w)=>{},
  extra:(X,z,H)=>{/* shield emblem, cameras, floodlights, bollards and a barrier arm over the driveway beside it */
   SB(.7,.8,.08,'#e6b422',X,H-.55,z+.06);SB(.52,.6,.04,'#1d3a5a',X,H-.53,z+.11);SB(.24,.24,.03,'#e6b422',X,H-.5,z+.14);
   [-3.9,3.9].forEach(x=>{SB(.1,.1,.4,'#555',X+x,H-.3,z+.25);SB(.22,.18,.34,'#e8e8ec',X+x,H-.35,z+.5);SB(.1,.08,.04,'#111',X+x,H-.37,z+.68);SB(.05,.05,.05,'#ff3030',X+x+.07,H-.28,z+.67)});
   [-1.8,1.8].forEach(x=>{SB(.4,.12,.2,'#555',X+x,2.95,z+.12);SB(.5,.24,.26,'#f2e6b0',X+x,2.82,z+.3)});
   [-3.3,-2.2,2.2,3.3].forEach(x=>{SB(.24,.8,.24,'#2c2e33',X+x,.4,z+1.1);SB(.26,.1,.26,'#e6b422',X+x,.6,z+1.1)});
   SB(.4,1,.4,'#e6b422',X+4.4,.5,z+.6);SB(.3,.3,.3,'#1c1e22',X+4.4,1.1,z+.6);SB(3.2,.12,.12,'#f4f4f4',X+6,.95,z+.6);for(let k=0;k<5;k++)SB(.3,.13,.13,'#c0392b',X+4.9+k*.6,.95,z+.6);SB(.1,.6,.1,'#555',X+7.5,.3,z+.6)}}};
/* the street shops in SHOPX skip the old box (Motors still uses it): same collision and way in, no floating name tag */
{const m0=mkShop;mkShop=function(cx,k,name,act,lab){if(!SHOPX[cx])return m0(cx,k,name,act,lab);col(cx-4,5,cx+4,11.1);INT.push({x:cx,z:12.6,r:1.6,l:lab,a:act});SHOPX[cx].on=1}}
function stShop(cx,D){const X=WX(cx),z=11,H=D.h,w=D.wall,tr=D.trim;
 /* body, plinth, string courses (brick/render bands), corner pilasters, cornice and parapet */
 SB(8,H,6,w,X,H/2,8);/* plinth: around the sides and back, and across the front either side of the doorway only */SB(8.12,.3,6,dk(w,.72),X,.15,7.94);[-1,1].forEach(s=>SB(2.9,.3,.12,dk(w,.72),X+s*2.61,.15,z));
 for(let y=.45,i=0;y<H-.3;y+=D.brick?.3:.6,i++)if(i%2)SB(8.02,D.brick?.3:.6,.02,D.band,X,y+(D.brick?.15:.3),z+.005);
 if(D.brick)for(let y=.45,i=0;y<H-.3;y+=.3,i++)SB(.02,.3,6.02,i%2?D.band:dk(w,.94),X+4.005,y+.15,8);
 [-3.92,3.92].forEach(x=>SB(.26,H,.18,tr,X+x,H/2,z+.07));SB(.26,H,.26,tr,X+3.92,H/2,5.1);
 SB(8.36,.18,6.36,tr,X,H+.09,8);SB(8.2,.45,.2,dk(w,.88),X,H+.4,z-.1);SB(8.2,.45,.2,dk(w,.88),X,H+.4,5.1);SB(.2,.45,6,dk(w,.88),X+4,H+.4,8);SB(.2,.45,6,dk(w,.88),X-4,H+.4,8);
 SB(8.3,.06,.3,tr,X,H+.65,z-.1);SB(.3,.06,6.2,tr,X+4,H+.65,8);SB(7.6,.04,5.6,dk(w,.6),X,H+.2,8);
 /* roof: hatch, vents, an AC unit */
 SB(.9,.4,.9,'#8a8f96',X-2.6,H+.38,6.4);SB(1,.06,1,'#5a5f66',X-2.6,H+.6,6.4);SB(1.1,.6,.8,'#c3c7cc',X+2.4,H+.48,6.2);SB(.6,.05,.5,'#4a4f55',X+2.4,H+.8,6.2);SB(.14,.5,.14,'#5a5f66',X+.5,H+.43,6);
 /* shopfront: stall risers, framed display windows, recessed door with a step, fascia, wall lamps */
 const W=[[X-3.65,X-1.15],[X+1.15,X+3.65]];
 W.forEach(([a,b])=>{const m=(a+b)/2,L=b-a;SB(L,.55,.1,tr,m,.28,z+.05);SB(L+.1,.06,.2,D.sill,m,.58,z+.1);SB(L,1.65,.02,D.glass,m,1.43,z+.02);
  SB(L+.08,.08,.1,tr,m,2.28,z+.06);SB(.08,1.7,.1,tr,a,1.43,z+.06);SB(.08,1.7,.1,tr,b,1.43,z+.06);SB(.05,1.65,.08,tr,m,1.43,z+.05);SB(L,.05,.08,tr,m,1.95,z+.05);
  if(D.bars)for(let x=a+.2;x<b;x+=.25)SB(.03,1.6,.03,'#2a2a2a',x,1.43,z+.08);
  const pts=[];for(let u=a+.3;u<b-.2;u+=.45)pts.push(u);D.win(X,z,a,b,pts)});
 /* doorway: each layer sits clearly in front of the one behind it (no shared faces), so nothing flickers through the wall:
    dark reveal 11.02-11.05, door 11.06-11.11, door glass and kick plate 11.11-11.14, handle to 11.17, jambs and lintel out to 11.18 */
 SB(1.84,2.32,.03,'#222226',X,1.26,z+.035);SB(1.2,2.15,.05,D.door,X,1.175,z+.085);SB(.72,.9,.03,D.glass,X,1.5,z+.125);SB(.86,1.02,.02,dk(D.door,.8),X,1.5,z+.12);
 SB(1,.1,.03,dk(D.door,.7),X,.36,z+.125);SB(.06,.26,.06,'#c9a227',X+.42,1.05,z+.14);
 [-1,1].forEach(s=>SB(.2,2.42,.18,tr,X+s*1.01,1.31,z+.09));SB(2.22,.18,.18,tr,X,2.43,z+.09);
 SB(2.2,.1,.6,'#9a9a98',X,.05,z+.3);
 SB(8,.66,.14,D.fas,X,2.72,z+.07);SB(8.04,.05,.18,tr,X,3.06,z+.09);SB(8.04,.05,.18,tr,X,2.38,z+.09);
 [-2.3,2.3].forEach(x=>{SB(.05,.05,.35,'#2a2a2a',X+x,3.3,z+.17);SB(.24,.1,.2,'#2a2a2a',X+x,3.25,z+.34);SB(.16,.04,.14,'#ffe9a8',X+x,3.19,z+.34)});
 /* the door number and a timber skirt where the shop has one */
 SB(.2,.12,.02,'#e6e1d6',X,2.43,z+.19);if(D.timber)for(let x=-3.6;x<=3.6;x+=.3)if(Math.abs(x)>1.2)SB(.26,.55,.03,D.timber,X+x,.28,z+.115);
 /* awnings over the windows */
 if(D.awn)W.forEach(([a,b])=>{const m=(a+b)/2,L=b-a+.2;SB(L,.06,.9,D.awn[0],m,2.36,z+.5);for(let x=a-.1,i=0;x<b+.05;x+=.5,i++)SB(Math.min(.5,b+.1-x),.24,.04,D.awn[i%2],x+Math.min(.5,b+.1-x)/2,2.22,z+.95);SB(.04,.5,.04,'#555',a,2.15,z+.5);SB(.04,.5,.04,'#555',b,2.15,z+.5)});
 /* upper floor: sash windows with sills and lintels on the front, flower boxes */
 if(D.up)[-2.4,0,2.4].forEach(x=>{SB(1,1,.02,D.glass,X+x,3.8,z+.02);SB(1.12,.1,.12,tr,X+x,4.34,z+.06);SB(1.2,.08,.2,tr,X+x,3.27,z+.1);SB(.06,1,.08,tr,X+x-.53,3.8,z+.05);SB(.06,1,.08,tr,X+x+.53,3.8,z+.05);SB(1,.05,.06,tr,X+x,3.8,z+.05);SB(.04,1,.06,tr,X+x,3.8,z+.05);
  if(x)SB(1,.18,.2,'#6b4a2e',X+x,3.38,z+.2),SB(.9,.12,.14,'#3a7d46',X+x,3.52,z+.2)});
 /* the side the camera sees (+x): two windows, a drainpipe, a gas meter box */
 [6.6,9].forEach(zz=>{const wy=D.up?2.6:1.9;SB(.02,1,1,D.glass,X+4.02,wy,zz);SB(.08,.1,1.1,tr,X+4.05,wy+.55,zz);SB(.12,.08,1.2,D.sill,X+4.07,wy-.54,zz);SB(.06,1,.06,tr,X+4.04,wy,zz-.5);SB(.06,1,.06,tr,X+4.04,wy,zz+.5);if(D.bars)for(let k=-2;k<=2;k++)SB(.03,.96,.03,'#2a2a2a',X+4.06,wy,zz+k*.2)});
 SB(.1,H+.4,.1,'#3a3d42',X+4.08,(H+.4)/2,5.25);SB(.16,.1,.16,'#3a3d42',X+4.08,.05,5.25);SB(.26,.2,.12,'#3a3d42',X+4.08,H+.35,5.2);SB(.08,.5,.4,'#d8d4c8',X+4.04,.7,7.8);
 D.extra(X,z,H);
 /* painted fascia lettering (smooth canvas text, like the shop room signs) */
 const sg=ixSign(D.n,D.txt,D.fas,4.6,.5,{border:null,ff:'Georgia,serif'});sg.position.set(X,2.72,z+.145);scene.add(sg)}
{const f=flushSB;flushSB=function(){warpWorld();try{for(const k in SHOPX)if(SHOPX[k].on&&!SHOPX[k].built){SHOPX[k].built=1;stShop(+k,SHOPX[k])}}catch(e){console.error('street shops',e)}f()}}
