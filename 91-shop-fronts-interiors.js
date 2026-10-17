/* ===== v26.92: themed shop fronts, and every shop has a room you can walk into =====
   1. The seven shops on your street (Jewellery, Property, Corner shop, Radio, Motors, Pet Shop, Security) were plain
      boxes. Each one now gets a facade in its own theme: cladding, pilasters, cornices, a roof feature (a gem, a house,
      an antenna mast, a bone...), window displays and things out front (fruit crates, a show car, cameras and bollards).
   2. Motors, Pet Shop and Security had no inside. Each now has its own room (a car showroom, a pet shop with tanks and
      cages, a security office with a CCTV wall). Talk to the keeper there to pick up a booked appointment, as before.
   3. The shop fronts on the ground floor of the city towers (CAFE, BAKERY, BOOKS, GYM, BANK and so on, picked when the
      city is built) now have props out front in their theme and open into their own detailed room: food places sell
      you something to eat or drink, the others have a keeper to chat to. The random BARBER front is now a BOUTIQUE so
      it is not mixed up with Sal's Barbershop.
   Rooms use ixRoom (55-interiors.js). Street rooms are added in buildVenues; tower rooms when cdTower builds each front. */

/* ---------- small helpers ---------- */
const SF=(...a)=>SB(...a);
const sfPick=(L,i)=>L[((i%L.length)+L.length)%L.length];

/* ---------- 1. street shop fronts ---------- (shop body: x cx-4..cx+4, z 5..11, 3.4 tall; front face z 11, door at cx) */
const SFRONT={
 '-20':(X,z)=>{/* Motors: a glass showroom front with chrome fins, flags, a tyre stack and a show car on a turntable */
  SF(7.6,2.4,.06,'#9ad0f0',X,1.4,z+.06);for(let x=-3.6;x<=3.7;x+=1.2)SF(.1,2.4,.12,'#cfd3d8',X+x,1.4,z+.1);SF(8.2,.25,.25,'#cfd3d8',X,2.75,z+.12);SF(8.4,.4,.3,'#1d4f9a',X,3.2,z+.14);SF(1.4,1.9,.08,'#2a2d33',X,.95,z+.1);
  for(let k=0;k<9;k++)SF(.4,.4,.04,sfPick(['#e03a3a','#ffe066','#3b82f6','#2ecc71'],k),X-3.6+k*.9,3.6,z+.4);SF(8,.03,.03,'#555',X,3.75,z+.4);
  [-3.9,3.9].forEach(x=>{SF(.08,3,.08,'#cfd3d8',X+x,1.5,z+.9);SF(.6,.9,.03,'#3b82f6',X+x+(x<0?.34:-.34),2.5,z+.9)});
  for(let j=0;j<4;j++)SF(.7,.22,.7,'#1a1a1a',X+3.1,.11+j*.23,z+.6);SF(.36,.92,.36,'#555',X+3.1,.46,z+.6);
  SF(2.6,.12,2.6,'#cfd3d8',X+5.8,.06,8.6)}};
{const c0=cdShop;cdShop=function(s){c0(s);try{const f=SFRONT[String(s.cx)];if(f)f(WX(s.cx),11.03)}catch(e){console.error('shop front',s.cx,e)}}}
/* the show car outside Motors (a real car model, on the turntable) */
{const f0=flushSB;flushSB=function(){f0();try{if(SFCAR)return;const X=WX(-20)+5.8,m=mkS(carb(3,'#e03a3a'));m.scale.setScalar(1.3);m.position.set(X,.12,8.6);m.rotation.y=-.6;scene.add(m);SFCAR=m;col(X-1.4,7.2,X+1.4,10)}catch(e){console.error('show car',e)}}}
let SFCAR=null;

/* ---------- interior props shared by the new rooms ---------- */
const SFI={
 shelfL(b,cl,z0,z1,cols,kind,wood='#7a5a3a'){const L=z1-z0,zc=(z0+z1)/2;if(kind=='cloth')return SFI.rail(b,cl,z0,z1,cols,1);b(.06,2.2,L,wood,.05,1.1,zc);b(.5,2.2,.06,ixShade(wood,.85),.3,1.1,z0);b(.5,2.2,.06,ixShade(wood,.85),.3,1.1,z1);b(.5,.06,L,wood,.3,2.2,zc);for(let k=0;k<4;k++){const y=.25+k*.55;b(.5,.04,L,ixShade(wood,1.2),.3,y,zc);SFI.items(b,.32,y+.02,z0+.12,z1-.12,cols,kind,1,k)}cl(0,z0,.56,z1)},
 shelfB(b,cl,x0,x1,cols,kind,wood='#7a5a3a'){const L=x1-x0,xc=(x0+x1)/2;if(kind=='cloth')return SFI.rail(b,cl,x0,x1,cols,0);b(L,2.2,.06,wood,xc,1.1,.05);b(.06,2.2,.5,ixShade(wood,.85),x0,1.1,.3);b(.06,2.2,.5,ixShade(wood,.85),x1,1.1,.3);b(L,.06,.5,wood,xc,2.2,.3);for(let k=0;k<4;k++){const y=.25+k*.55;b(L,.04,.5,ixShade(wood,1.2),xc,y,.3);SFI.items(b,.32,y+.02,x0+.12,x1-.12,cols,kind,0,k)}cl(x0,0,x1,.56)},
 /* clothes rails: two rails of hanging garments against a wall (side=1 the left wall) */
 rail(b,cl,a0,a1,cols,side){const L=a1-a0,m=(a0+a1)/2,P=(u,y,w,h,d,c,o=0)=>side?b(d,h,w,c,.3+o,y,u):b(w,h,d,c,u,y,.3+o);P(m,1.1,L,2.2,.06,'#e8e2d8',-.25);
  [1.95,1.05].forEach((y,r)=>{P(m,y,L,.04,.04,'#9aa0a6');P(a0,y-.4,.04,.8,.04,'#9aa0a6');P(a1,y-.4,.04,.8,.04,'#9aa0a6');let i=r*2;for(let u=a0+.3;u<a1-.2;u+=.42){const c=sfPick(cols,i++),o=((i%3)-1)*.03;P(u,y-.05,.02,.1,.02,'#555');P(u,y-.13,.3,.04,.04,'#8a5a36',.02);P(u,y-.47,.36,.62,.06,c,.06+o);P(u,y-.2,.24,.08,.07,ixShade(c,.8),.07+o);P(u+.13,y-.42,.08,.5,.07,ixShade(c,.9),.065+o);P(u-.13,y-.42,.08,.5,.07,ixShade(c,.9),.065+o)}});side?cl(0,a0,.56,a1):cl(a0,0,a1,.56)},
 /* a row of items along a shelf: side=1 runs along z (left wall), 0 along x */
 items(b,c,y,a0,a1,cols,kind,side,row){let i=row*3;for(let u=a0;u<a1;){const col=sfPick(cols,i++),K=SFI.kind[kind]||SFI.kind.box,[w,h,s]=K(i);const p=u+w/2;if(p+w/2>a1)break;
  side?b(s,h,w,col,c,y+h/2,p):b(w,h,s,col,p,y+h/2,c);if(kind=='pot'){side?b(s*.9,.18,w*.9,'#3fa66a',c,y+h+.09,p):b(w*.9,.18,s*.9,'#3fa66a',p,y+h+.09,c)}u+=w+.04}},
 kind:{book:i=>[.07+(i%3)*.02,.3+(i*7%4)*.04,.26],rec:i=>[.04,.32,.32],box:i=>[.24,.16+(i%3)*.06,.24],jar:i=>[.12,.16,.12],pot:i=>[.18,.16,.18],shoe:i=>[.3,.12,.14],bottle:i=>[.08,.24,.08],tool:i=>[.1,.3+(i%3)*.06,.08],cloth:i=>[.08,.5,.34],glasses:i=>[.22,.06,.1],bread:i=>[.26,.12,.14]},
 table2(b,cl,x,z,top='#6b4a2e',chair='#7a4a2e'){b(.9,.06,.9,top,x,.76,z);b(.1,.72,.1,'#222',x,.37,z);b(.5,.04,.5,'#222',x,.02,z);ixChair(b,x-.75,z,chair,0);ixChair(b,x+.75,z,chair,1);cl(x-1.05,z-.45,x+1.05,z+.45)},
 display(b,cl,x,z,w,d,c,cols,kind){b(w,.8,d,c,x,.4,z);b(w+.06,.05,d+.06,ixShade(c,1.25),x,.82,z);SFI.items(b,z,.85,x-w/2+.1,x+w/2-.1,cols,kind,0,0);cl(x-w/2,z-d/2,x+w/2,z+d/2)},
 board(b,add,x,t,bg='#20302a'){b(1.6,.9,.05,'#6b4a2e',x,2.15,.04);b(1.48,.78,.02,bg,x,2.15,.07);add(ixSign(t,'#f4e8c8',bg,1.36,.24,{ff:'Georgia,serif',k:.5}),x,2.36,.085);for(let j=0;j<3;j++)b(1-j*.15,.03,.01,'#e8e8e0',x-.1,2.12-j*.15,.085)}};

/* ---------- 2. Motors, Pet Shop and Security rooms ---------- */
const SFSTREET=[
 {cx:-20,lab:'Visit Motors',name:'Motors',t:'car',kn:'Rex (car dealer)',kc:{hair:28,hc:0,eyes:0,mouth:3,top:2,tc:6,pc:4,skin:2,body:.5},no:'Rex: "Book a test drive on the Motors website first, then I\'ll have the keys ready."',
  room:{fl:['marble','#e8e8ec','#d0d4da'],wl:['panel','#e4e9ef','#c9d2dc'],tr:'#1d4f9a',wa:'#1d4f9a',fw:'#1d4f9a',mat:'#1d4f9a',sign:['MOTORS','#ffffff','#1d4f9a',2.6,.5,2.7,5,{border:'#e03a3a'}],lights:[[2.5,4],[7.5,4],[5,6,.5]],lc:0xf4f8ff,
   build(b,cl,add,ox){ixCounter(b,cl,5,3.2,3,.9,'#1d4f9a','#e8e8ec');b(.6,.4,.05,'#111',5.6,1.32,2.9);b(.54,.34,.02,'*7fd0ff',5.6,1.32,2.93);b(.5,.04,.36,'#f8f8f8',4.4,1.06,3.3);
    b(3,.08,3,'#cfd3d8',7.4,.04,5.6);b(2.8,.02,2.8,'#1d4f9a',7.4,.09,5.6);cl(6,4.2,8.8,7);
    [[1,'#e03a3a'],[2.4,'#ffe066'],[3.8,'#3b82f6']].forEach(q=>{ixFrame(b,q[0],1.9,.03,1.2,.8,'#1a1a1a',[q[1],'#2a2d33',q[1]])});
    for(let j=0;j<3;j++)for(let k=0;k<3;k++){b(.5,.5,.18,'#1a1a1a',.2,.4+k*.55,4.6+j*.6);b(.26,.26,.2,'#777',.21,.4+k*.55,4.6+j*.6)}cl(0,4.2,.4,6.3);
    b(.9,1.1,.5,'#e8e8ec',1.6,.55,6.8);b(.8,.06,.4,'#1d4f9a',1.6,1.12,6.8);for(let k=0;k<4;k++)b(.18,.24,.02,sfPick(['#e03a3a','#3b82f6','#ffe066','#2ecc71'],k),1.3+k*.2,.8,7.06);cl(1.1,6.5,2.1,7.1);
    ixPlant(b,cl,9.3,.7,1,'#1d4f9a');ixPlant(b,cl,.7,.7,1,'#1d4f9a');
    const m=mkS(carb(1,'#3b82f6'));m.scale.setScalar(1.15);add(m,7.4,.1,5.6,.8)}}},
 {cx:-32,lab:'Visit Pet Shop',name:'Pet Shop',t:'pet',kn:'Poppy (pet keeper)',kc:{hair:7,hc:3,eyes:6,mouth:0,top:1,tc:2,pc:3,skin:1,body:.35},no:'Poppy: "Book a visit on the Pet Shop website and your new friend will be waiting!"',
  room:{fl:['tile','#f2ead8','#e2d6b8'],wl:['plank','#e8c88a','#c9a46a'],tr:'#6b4a2e',wa:'#2f8f5a',fw:'#6b4a2e',mat:'#2f8f5a',sign:['PET SHOP','#ffffff','#2f8f5a',2.6,.5,2.72,5,{border:'#e6b422'}],lights:[[2.5,4],[7.5,4],[5,6.2,.5]],lc:0xfff4dc,
   build(b,cl,add){ixCounter(b,cl,5,3.2,3,.9,'#6b4a2e','#e8d9a0');b(.4,.26,.36,'#333',5.8,1.19,3.2);[[4.2,'#e84a4a'],[4.5,'#3b82f6']].forEach(q=>b(.24,.06,.24,q[1],q[0],1.07,3.35));
    /* fish tanks on the back wall */
    [1.6,3.3,6.7,8.4].forEach((x,k)=>{b(1.5,.7,.5,'#2a2a30',x,.35,.3);b(1.5,.9,.5,'#1d3a4a',x,1.15,.3);b(1.4,.8,.02,'*5ac8ff',x,1.15,.56);b(1.4,.08,.02,'#e8d9a0',x,.76,.57);for(let j=0;j<3;j++)b(.14,.07,.02,sfPick(['#ff8a30','#ffe066','#e84a8a','#7fe3ff'],j+k),x-.4+j*.38,.95+((j+k)%3)*.2,.58);b(.06,.4,.02,'#2e8b57',x+.55,.9,.58);b(1.56,.08,.56,'#2a2a30',x,1.64,.3)});cl(.8,0,9.2,.6);
    /* cages with pets */
    [[.5,4.6],[.5,6.2]].forEach((q,k)=>{b(.9,.8,1.3,'#8a5a36',q[0],.4,q[1]);b(.86,.04,1.26,'#e8d9a0',q[0],.82,q[1]);[-1,1].forEach(e=>{b(.04,.8,.04,'#9aa0a6',q[0]+.43,1.22,q[1]+e*.62);b(.04,.8,.04,'#9aa0a6',q[0]-.43,1.22,q[1]+e*.62)});
     for(let j=1;j<8;j++)b(.02,.78,.02,'#cfd3d8',q[0]+.43,1.22,q[1]-.62+j*.155);b(.9,.04,1.3,'#9aa0a6',q[0],1.62,q[1]);for(let j=0;j<5;j++)b(.88,.02,.02,'#cfd3d8',q[0],1.63,q[1]-.5+j*.25);b(.2,.08,.2,'#3b82f6',q[0]-.2,.88,q[1]+.35);const p=mkS(petb(k));p.scale.setScalar(.55);add(p,q[0],.84,q[1],Math.PI/2)});cl(0,3.95,.95,6.85);
    /* bird cage and a cat tree */
    b(.06,1.6,.06,'#555',8.6,.8,5.6);b(.66,.05,.66,'#e6b422',8.6,1.6,5.6);b(.66,.05,.66,'#e6b422',8.6,2.3,5.6);b(.3,.12,.3,'#e6b422',8.6,2.38,5.6);for(let j=0;j<4;j++){b(.02,.7,.02,'#e6b422',8.29+j*.2,1.95,5.91);b(.02,.7,.02,'#e6b422',8.91,1.95,5.29+j*.2)}b(.4,.03,.03,'#8a5a36',8.6,1.85,5.6);const pr=mkS(petb(2));pr.scale.setScalar(.4);add(pr,8.6,1.6,5.6);cl(8.3,5.3,8.9,5.9);
    b(.16,1.4,.16,'#c9a46a',8.4,.7,7.2);b(.8,.08,.8,'#a0522d',8.4,.5,7.2);b(.7,.08,.7,'#a0522d',8.4,1.1,7.2);b(.5,.4,.5,'#a0522d',8.4,1.4,7.2);cl(8,6.8,8.8,7.6);
    /* food sacks and a toy display */
    for(let k=0;k<4;k++)b(.5,.7,.3,sfPick(['#c0392b','#2f8f5a','#3b82f6','#e6b422'],k),2.4+k*.6,.35,7.4);cl(2.1,7.2,4.6,7.6);SFI.display(b,cl,7,4.6,1.6,.7,'#2f8f5a',['#e84a4a','#ffe066','#3b82f6','#ff6ad5'],'jar')}}},
 {cx:-44,lab:'Visit Security Agency',name:'Security',t:'guard',kn:'Viktor (security chief)',kc:{hair:1,hc:0,eyes:4,mouth:1,top:2,tc:6,pc:4,skin:3,body:.75,hgt:.8},no:'Viktor: "Book a consultation on the Security website. Then we talk."',
  room:{fl:['carpet','#2a2a32','#24242b'],wl:['block','#4a4f56','#3d4248'],tr:'#e6b422',wa:'#1a1a20',fw:'#1a1a20',mat:'#1d4f9a',sign:['SECURITY','#e6b422','#1a1a20',2.6,.48,2.72,5,{border:'#e6b422'}],lights:[[2.5,4],[7.5,4]],lc:0xe8f0ff,
   build(b,cl,add){ixCounter(b,cl,5,3.2,3.4,.9,'#1a1a20','#4a4f56');[4.2,5.8].forEach(x=>{b(.6,.4,.05,'#111',x,1.32,2.9);b(.54,.34,.02,'*6aff8a',x,1.32,2.93)});
    /* CCTV wall */
    for(let j=0;j<3;j++)for(let k=0;k<4;k++){b(.7,.5,.08,'#111',1.4+k*.8,1.3+j*.55,.08);b(.62,.42,.02,sfPick(['*5a7a6a','*6a8a7a','*4a6a8a'],j+k),1.4+k*.8,1.3+j*.55,.13)}b(3.4,.7,.6,'#2a2a32',2.6,.35,.6);b(3.4,.06,.6,'#4a4f56',2.6,.72,.6);cl(.9,0,4.3,.9);
    /* lockers, a map board, a water cooler */
    for(let k=0;k<5;k++){b(.56,1.9,.5,'#5a6470',6.5+k*.6,.95,.3);b(.04,.2,.02,'#cfd3d8',6.7+k*.6,1.1,.56);for(let j=0;j<3;j++)b(.3,.02,.01,'#333',6.5+k*.6,1.7+j*.06,.56)}cl(6.2,0,9.3,.6);
    ixFrame(b,.03,1.8,3.2,2,1.2,'#e6b422',['#2f5a3a','#3a6a8a','#4a4f56','#2f5a3a'],1);b(.03,.08,.08,'#e03a3a',.06,1.9,3);b(.03,.08,.08,'#e03a3a',.06,1.6,3.6);
    b(.4,1,.4,'#e8e8ec',.4,.5,6.6);b(.3,.4,.3,'*9ad0f0',.4,1.2,6.6);cl(.2,6.4,.6,6.8);
    /* training corner: mats and a punch bag */
    b(2.4,.04,1.8,'#1d4f9a',8,.02,6);b(.06,.6,.06,'#555',8.4,2.7,5.6);b(.5,1,.5,'#c0392b',8.4,1.9,5.6);cl(8.15,5.35,8.65,5.85);
    [[2,6.4],[3.2,6.4]].forEach(q=>ixChair(b,q[0],q[1],'#4a4f56',0));
    const gd=buildChar({skin:4,eyes:4,mouth:1,hair:1,hc:0,top:2,tc:6,pc:4,body:.8,hgt:.75});add(gd.g,7.2,0,3.2,-.4)}}}];
{const bv=buildVenues;buildVenues=function(){bv();SFSTREET.forEach(D=>{try{SHOPS.push({name:D.name,cx:D.cx,ox:-1500-SHOPS.length*16,ez:12.9});const i=D.i=SHOPS.length-1;
  interior(i,['#888','#777'],'#666',[],[],D.kc,D.kn,()=>{if(S.appt.some(a=>a.t==D.t))attend(D.t);else{snd('pop');say(D.no)}});ixRoom(i,D.room);sfFloor(SHOPS[i].ox);
  const it=INT.find(q=>q.l==D.lab);if(it){it.l='Enter '+D.name;it.a=()=>enterShop(i)}}catch(e){console.error('shop room',D.name,e)}})}}
function sfFloor(ox){const g=new THREE.Mesh(geo(40,.1,30),new THREE.MeshLambertMaterial({color:'#1c2026'}));g.position.set(ox+5,-.25,324);WORLD.add(g)}

/* ---------- 3. city tower shop fronts: themed props outside and a room inside ---------- */
const SFTY={/* kind: f = food (sells something), r = shop, s = special room; it = what you buy [name, price, energy] */
 CAFE:{k:'f',c:'#6b4a2e',a:'#2f6b4f',it:['Flat white',5,15],kn:'Ivy (barista)'},BAKERY:{k:'f',c:'#c98a5a',a:'#f4d0a0',it:['Warm croissant',4,12],kn:'Bram (baker)'},
 PIZZA:{k:'f',c:'#c0392b',a:'#2f8f5a',it:['Pizza slice',6,22],kn:'Gino (pizzaiolo)'},NOODLES:{k:'f',c:'#a02a20',a:'#e6b422',it:['Bowl of ramen',9,30],kn:'Mei (noodle chef)'},
 DELI:{k:'f',c:'#2f5a3a',a:'#e8e0c8',it:['Deli sandwich',7,24],kn:'Sol (deli counter)'},DINER:{k:'f',c:'#2d8a9a',a:'#e03a3a',it:['Burger and shake',11,34],kn:'Dot (waitress)'},
 TACOS:{k:'f',c:'#e67e22',a:'#2ecc71',it:['Three tacos',8,26],kn:'Lupe (taquera)'},SUSHI:{k:'f',c:'#1a1a22',a:'#e84a4a',it:['Sushi set',14,30],kn:'Kenji (sushi chef)'},
 'JUICE BAR':{k:'f',c:'#2ecc71',a:'#ffe066',it:['Mango smoothie',6,18],kn:'Jade (juice bar)'},
 BOOKS:{k:'r',c:'#5a3a22',a:'#2f5a3a',kind:'book',cols:['#c0392b','#2d5a8d','#2f8f5a','#e6b422','#8e44ad','#f4f1ea','#1a1a1a'],kn:'Wren (bookseller)',say:['Every song starts as a story. Try the poetry shelf.','The music biographies are on the left. Very inspiring.']},
 VINYL:{k:'r',c:'#1a1a22',a:'#e84393',kind:'rec',cols:['#1a1a1a','#e84393','#1a1a1a','#3498db','#1a1a1a','#f1c40f'],kn:'Rudy (crate digger)',say:['Dig through the crates, there are rare pressings in there.','If you ever press your album on vinyl, I will stock it.']},
 RECORDS:{k:'r',c:'#2a2030',a:'#7fe3ff',kind:'rec',cols:['#1a1a1a','#7fe3ff','#1a1a1a','#e6b422','#1a1a1a','#e74c3c'],kn:'Nina (record shop)',say:['Your streams are up! People keep asking for your music in here.','New releases on the front wall, classics at the back.']},
 GUITARS:{k:'r',c:'#3a2a1a',a:'#c68a3c',kind:'tool',cols:['#c0392b','#e6b422','#2a6ab5','#f4f4f4','#1a1a1a','#2fe68a'],kn:'Slim (guitar tech)',say:['Need new strings? Fresh strings make a cheap guitar sound twice the price.','Try the red one, it plays itself.']},
 SHOES:{k:'r',c:'#f4f4f4',a:'#1a1a1a',kind:'shoe',cols:['#f4f4f4','#1a1a1a','#e03a3a','#3b82f6','#e6b422','#2ecc71'],kn:'Kai (sneakerhead)',say:['Those are the limited ones. Only three pairs in the city.','Clean kicks, clean fit. Check Threadz on your computer for the full range.']},
 TAILOR:{k:'r',c:'#3a2f45',a:'#c9a227',kind:'cloth',cols:['#2c3e50','#7a1f3a','#3a3a3a','#c9a227','#f4f1ea','#5a3a6a'],kn:'Mr. Finch (tailor)',say:['A good suit fits like a good mix: nothing too loud.','Stand still, I just want to check your shoulders.']},
 BOUTIQUE:{k:'r',c:'#f4d0e0',a:'#e84393',kind:'cloth',cols:['#e84393','#f4f1ea','#7fe3ff','#ffe066','#1a1a1a','#b07aff'],kn:'Coco (boutique)',say:['Fresh drop this week, darling. You would look amazing in pink.','Everything here is one of a kind.']},
 FLORIST:{k:'r',c:'#e8f4e8',a:'#ff6ad5',kind:'pot',cols:['#ff6ad5','#ffe066','#e03a3a','#b07aff','#ff8a30','#ffffff'],kn:'Rosa (florist)',say:['Flowers for your next show? Fans love throwing roses.','The sunflowers came in this morning.']},
 PHARMACY:{k:'r',c:'#ffffff',a:'#2ecc71',kind:'bottle',cols:['#ffffff','#e8f4ff','#2ecc71','#e03a3a','#3b82f6','#f1c40f'],kn:'Dr. Amara (pharmacist)',say:['Throat sweets are on the left. Singers swear by them.','Remember to sleep. Energy matters more than coffee.']},
 HARDWARE:{k:'r',c:'#8a6a4a',a:'#e67e22',kind:'tool',cols:['#e67e22','#9aa0a6','#c0392b','#3a3a3a','#e6b422','#2d5a8d'],kn:'Hank (hardware)',say:['Building a studio booth? Foam is aisle two.','Measure twice, cut once.']},
 OPTICIAN:{k:'r',c:'#e8eef4',a:'#2d5a8d',kind:'glasses',cols:['#1a1a1a','#c0392b','#2d5a8d','#c9a227','#8e44ad','#e8e8ec'],kn:'Iris (optician)',say:['Read the bottom line for me. Perfect!','Shades for the stage are on the right.']},
 GYM:{k:'s',c:'#2a2a32',a:'#e03a3a',kn:'Tank (trainer)',say:['Stamina keeps you going on long days. Stay hydrated!','Leg day is every day.']},
 BANK:{k:'s',c:'#e8e2d0',a:'#2f4a6e',kn:'Mr. Grant (bank teller)',say:[]},LAUNDRY:{k:'s',c:'#e8f4ff',a:'#3b82f6',kn:'Suds (laundromat)',say:['Machine 4 eats socks. Avoid machine 4.','A fresh hoodie for every show, that is the secret.']},
 GALLERY:{k:'s',c:'#f4f4f4',a:'#1a1a1a',kn:'Sushil (gallery)',say:['This piece is called "Sound of Rain". It is just blue.','Art and music are cousins, you know.']}};
const SFROOMS=[];
/* a shop room for one tower front: walls and floor match the kind, then the props for that kind */
function sfRoom(nm){const T=SFTY[nm],c=T.c,a=T.a,food=T.k=='f';
 const base={fl:food?['plank','#a9794a','#6b4a2e']:nm=='BANK'?['marble','#e8e2d0','#cfc6b0']:nm=='GYM'?['concrete','#4a4f56','#3d4248']:nm=='GALLERY'?['plank','#e8dcc8','#cfc0a8']:['tile','#f0ece4','#ddd6c8'],
  wl:nm=='SUSHI'||nm=='NOODLES'?['panel','#efe4c8','#c9a46a']:food?['brick','#b5654a','#d9c2a8']:nm=='GYM'?['block','#5a5f66','#4a4f56']:nm=='BANK'?['panel','#f4efe0','#d9cfb8']:['plaster','#f4f1ea','#e2dccf'],
  tr:ixShade(a,.8),wa:food||nm=='GALLERY'?null:a,fw:ixShade(c,.8),mat:a,sign:[nm,'#ffffff',ixShade(a,.7),Math.min(3.4,1.2+nm.length*.28),.5,2.72,5,{border:'#ffffff'}],lights:[[2.5,4],[7.5,4],[5,6,.5]],lc:0xfff0d8};
 base.build=(b,cl,add)=>{
  if(food){const st=T.it[0];ixCounter(b,cl,5,3.2,3.6,.9,c,'#e8e0d0');b(1.4,.42,.6,'#cfd3d8',6,1.27,3.2);b(1.3,.34,.02,'*fff6e0',6,1.29,3.51);
   for(let j=0;j<4;j++)b(.2,.1,.2,sfPick([a,'#e8b04a','#f4f4f4','#c0392b'],j),5.55+j*.3,1.14,3.3);b(.4,.3,.36,'#333',3.9,1.2,3.2);
   SFI.board(b,add,2.6,st.toUpperCase().slice(0,16)+'  $'+T.it[1]);SFI.board(b,add,7.4,nm+' · OPEN');
   /* the kitchen kit behind the counter, by kind */
   if(nm=='PIZZA'){b(1.6,1.2,.9,'#b5654a',8.6,.6,1.2);b(1.4,1,.8,'#8a3a24',8.6,1.4,1.2);b(.7,.4,.05,'*ff8a30',8.6,.9,1.66);b(.3,.6,.3,'#6a6a6a',8.6,2.2,1.1);cl(7.8,.7,9.4,1.7)}
   else if(nm=='NOODLES'||nm=='SUSHI'){b(3,.98,.6,'#9aa0a6',2.25,.49,1.2);b(3.06,.05,.66,'#cfd3d8',2.25,1,1.2);cl(.7,.85,3.8,1.55);[1.5,3].forEach(x=>{b(.5,.4,.5,'#c0c4c8',x,1.2,1.2);b(.44,.04,.44,'#f4f4f4',x,1.41,1.2)});for(let k=0;k<5;k++){b(.5,.6,.04,'#e84a4a',1.2+k*.6,2.6,.06);b(.04,.5,.03,'#1a1a1a',1.2+k*.6,2.55,.09)}
    if(nm=='SUSHI'){b(.3,.3,5.6,'#9aa0a6',9.5,.75,3.6);for(let k=0;k<9;k++)b(.22,.06,.22,sfPick(['#f4f4f4','#ff8a60','#e84a4a','#2f8f5a'],k),9.5,.93,1.2+k*.6);cl(9.3,.8,9.7,6.4)}}
   else if(nm=='BAKERY'){SFI.shelfB(b,cl,6.6,9.6,['#d9a441','#c98a5a','#e8c88a','#8b5a2b'],'bread','#8a5a36')}
   else if(nm=='JUICE BAR'){b(2.4,.98,.6,'#2f8f5a',2.15,.49,1.2);b(2.46,.05,.66,'#e8e0d0',2.15,1,1.2);cl(.9,.85,3.4,1.55);for(let k=0;k<4;k++){b(.2,.4,.2,'#cfe9ff',1.4+k*.5,1.2,1.2);b(.16,.2,.16,sfPick(['#ffe066','#ff8a30','#2ecc71','#e84a8a'],k),1.4+k*.5,1.15,1.2)}SFI.shelfB(b,cl,6.6,9.6,['#ffe066','#ff8a30','#2ecc71','#e74c3c'],'jar','#2f8f5a')}
   else SFI.shelfB(b,cl,6.6,9.6,['#e8b04a','#7a4a2e','#f4f4f4','#c0392b'],'jar','#6b4a2e');
   if(nm=='DINER'){b(.7,.45,2.4,'#e03a3a',.4,.23,5.6);b(.12,.6,2.4,'#e03a3a',.1,.75,5.6);b(.6,.06,1.2,'#f4f4f4',1.2,.76,5.6);b(.1,.72,.1,'#cfd3d8',1.2,.37,5.6);cl(0,4.4,1.6,6.8);[6.6,7.6,8.6].forEach(x=>{b(.4,.08,.4,'#e03a3a',x,.7,4.3);b(.08,.66,.08,'#cfd3d8',x,.33,4.3)})}
   else{SFI.table2(b,cl,2.2,5.6);SFI.table2(b,cl,2.2,7.2)}
   if(nm!='DINER')SFI.table2(b,cl,7.8,6.4);ixPend(b,2.2,5.6,'*ffd98a',a,2.4);ixPend(b,7.8,6.4,'*ffd98a',a,2.4);ixPlant(b,cl,9.3,7.4,.9,c);ixWin(b,0,3.4,1.4)}
  else if(T.k=='r'){ixCounter(b,cl,5,3.2,2.6,.9,c,'#e8e2d8');b(.4,.26,.36,'#333',5.6,1.19,3.2);b(.32,.14,.02,'*7fd0ff',5.6,1.29,3.01);
   SFI.shelfB(b,cl,.6,3.6,T.cols,T.kind);SFI.shelfB(b,cl,6.4,9.4,T.cols,T.kind);SFI.shelfL(b,cl,4,7.4,T.cols,T.kind);
   SFI.display(b,cl,7.6,5.2,1.6,.8,ixShade(c,.85),T.cols,T.kind);SFI.display(b,cl,7.6,6.8,1.6,.8,ixShade(c,.85),T.cols,T.kind);
   if(nm=='TAILOR'||nm=='BOUTIQUE')[2.4,3.4].forEach((x,k)=>{b(.06,.8,.06,'#555',x,.4,6);b(.4,.6,.24,sfPick(T.cols,k),x,1.1,6);b(.16,.2,.16,'#e8d9c0',x,1.5,6);cl(x-.2,5.8,x+.2,6.2)});
   if(nm=='GUITARS')[1.2,2.1].forEach((x,k)=>{b(.46,.6,.08,sfPick(T.cols,k),x,1.1,7.5);b(.07,.7,.06,'#3a2a1a',x,1.75,7.5);cl(x-.25,7.3,x+.25,7.7)});
   if(nm=='OPTICIAN'){b(.04,.8,.6,'#e8e8ec',.05,1.8,2.4);b(.02,.7,.5,'*eaf6fb',.08,1.8,2.4);ixChair(b,1.2,2.4,'#2d5a8d',0)}
   if(nm=='FLORIST')for(let k=0;k<5;k++){b(.4,.4,.4,'#8a8f96',2.2+k*.5,.2,7.5);b(.5,.3,.5,sfPick(T.cols,k),2.2+k*.5,.6,7.5)}
   ixPend(b,5,5.6,'*ffe9b8',a,2.4);ixPlant(b,cl,9.4,7.4,.8,a)}
  else if(nm=='GYM'){b(10,.03,3,'#1d1d22',5,.02,6.2);[1.4,3].forEach(x=>{b(.7,.5,1.6,'#2a2a32',x,.25,1.2);b(.6,.06,1.4,'#111',x,.52,1.2);b(.1,1.1,.1,'#555',x-.3,.8,.5);b(.1,1.1,.1,'#555',x+.3,.8,.5);b(.7,.2,.12,'#333',x,1.35,.5);cl(x-.4,.3,x+.4,2)});
   b(.12,1.4,1.6,'#9aa0a6',9.7,.7,1.6);for(let k=0;k<5;k++){b(.3,.12,.12,'#333',9.4,.4+k*.22,1+k*.3)}cl(9.3,.8,10,2.4);b(10,1.8,.03,'*dfe8f0',5,1.5,.02);
   [[2,5.6],[2,7],[7.6,5.8]].forEach(q=>{b(1.2,.06,.06,'#9aa0a6',q[0],.42,q[1]);b(.12,.4,.4,'#222',q[0]-.55,.42,q[1]);b(.12,.4,.4,'#222',q[0]+.55,.42,q[1]);b(.6,.3,1.4,'#2a2a32',q[0],.15,q[1]);cl(q[0]-.65,q[1]-.7,q[0]+.65,q[1]+.7)});
   b(.06,.6,.06,'#555',8.6,2.7,7);b(.5,1,.5,'#e03a3a',8.6,1.9,7);cl(8.35,6.75,8.85,7.25);ixCounter(b,cl,5,3.4,2,.8,'#2a2a32','#e03a3a')}
  else if(nm=='BANK'){ixCounter(b,cl,5,3.2,6,.9,'#cfc6b0','#2f4a6e');[3,5,7].forEach(x=>{b(1.6,.9,.04,'*dff0ff',x,1.7,3.05);b(.06,.9,.08,'#c9a227',x-.8,1.7,3.05)});
   b(1.8,1.8,.15,'#8a8f96',8.4,1.1,.1);b(1.2,1.2,.05,'#6a7078',8.4,1.1,.2);b(.4,.4,.06,'#c9a227',8.4,1.1,.24);[[-.4,0],[.4,0],[0,.4],[0,-.4]].forEach(q=>b(.1,.1,.04,'#c9a227',8.4+q[0],1.1+q[1],.26));
   [.8,9.2].forEach(x=>{b(.4,2.9,.4,'#f4efe0',x,1.45,3.2);b(.5,.15,.5,'#c9a227',x,2.9,3.2)});b(3,.02,1.6,'#2f4a6e',5,.01,6);[[3.4,6.6],[6.6,6.6]].forEach(q=>{b(1.4,.4,.5,'#5a3a22',q[0],.22,q[1]);b(1.4,.5,.12,'#5a3a22',q[0],.55,q[1]+.25)});cl(2.6,6.3,7.4,6.95);
   b(.6,1.6,.5,'#2f4a6e',.4,.8,6.6);b(.4,.3,.02,'*7fd0ff',.66,1.2,6.6);cl(.1,6.3,.7,6.9);ixPlant(b,cl,9.3,7.3,1,'#2f4a6e')}
  else if(nm=='LAUNDRY'){for(let k=0;k<5;k++){const x=1+k*1.05;b(.9,1,.7,'#c8d0d8',x,.5,.4);b(.9,.12,.72,'#9aa5b1',x,.94,.4);b(.56,.56,.02,'#6a7580',x,.5,.76);b(.42,.42,.02,'*9ad0f0',x,.5,.78);b(.24,.05,.02,'#3b82f6',x,.88,.77);b(.06,.06,.02,'#2ecc71',x+.34,.88,.77)}for(let k=0;k<5;k++){const x=1+k*1.05;b(.9,.9,.7,'#b0bac4',x,1.45,.4);b(.48,.48,.02,'#3a3f47',x,1.42,.76);b(.36,.36,.02,'#1a1d22',x,1.42,.77);b(.9,.06,.72,'#8a94a0',x,1.9,.4)}cl(.5,0,6.3,.8);
   ixCounter(b,cl,8,3.2,2.6,.8,'#3b82f6','#f4f4f4');for(let k=0;k<3;k++)b(.5,.12,.4,sfPick(['#e84a4a','#f4f4f4','#ffe066'],k),7.2+k*.6,1.08,3.2);[[2,6],[4,6]].forEach(q=>{b(1.4,.4,.5,'#3b82f6',q[0],.22,q[1]);b(.5,.4,.5,'#e8e0c8',q[0]+1,.2,q[1]+1)});cl(1.2,5.7,4.8,6.3)}
  else if(nm=='GALLERY'){[[1.6,['#e03a3a','#ffe066','#3b82f6']],[5,['#1a1a1a','#f4f4f4']],[8.4,['#2ecc71','#8e44ad','#ff8a30']]].forEach(q=>{ixFrame(b,q[0],1.8,.03,2,1.3,'#1a1a1a',q[1]);ixLampW(b,q[0],2.65,0,'*fff2c0')});
   [2.4,5.4].forEach((z,k)=>ixFrame(b,.03,1.8,z,1.6,1.1,'#c9a227',k?['#3b82f6','#7fe3ff','#3b82f6']:['#ffe066','#ff8a30'],1));
   [[3,4.6],[7,4.6]].forEach((q,k)=>{b(.6,1,.6,'#cfc6b8',q[0],.5,q[1]);b(.3,.6-k*.2,.3,k?'#c9a227':'#e84a8a',q[0],1.3,q[1]);cl(q[0]-.3,q[1]-.3,q[0]+.3,q[1]+.3)});b(2,.42,.6,'#1a1a1a',5,.21,6.4);cl(4,6.1,6,6.7);ixCounter(b,cl,8.6,6.8,1.2,.6,'#f4f4f4','#1a1a1a')}};
 return base}
/* props out front of a tower shop: beside the door (door is cx-1..cx+1), within ~1 m of the facade */
function sfOutside(nm,cx,fz,c){const T=SFTY[nm],a=T.a,L=cx-2.4,Rr=cx+2.4,z=fz;
 const aboard=(x,t)=>{SF(.6,.8,.08,'#3a2a1a',x,.4,z+.9);SF(.5,.6,.02,'#20302a',x,.45,z+.95);for(let j=0;j<3;j++)SF(.34,.03,.01,'#e8e8e0',x,.62-j*.12,z+.96)};
 const blade=(col,col2)=>{SF(.06,.06,.9,'#2a2a30',Rr-1.2,2.9,z+.45);SF(.06,.6,.6,col,Rr-1.2,2.55,z+.6);SF(.07,.36,.36,col2,Rr-1.2,2.55,z+.6)};
 const table=x=>{SF(.6,.05,.6,'#f4f4f4',x,.72,z+.75);SF(.06,.7,.06,'#555',x,.36,z+.75);SF(.06,1.6,.06,'#555',x,1.4,z+.75);SF(1.4,.1,1.4,a,x,2.1,z+.75);[-.45,.45].forEach(o=>{SF(.36,.06,.36,'#2a2a30',x+o,.44,z+.75);SF(.36,.4,.05,'#2a2a30',x+o,.64,z+.75+(o<0?-.17:.17))})};
 const crate=(x,cols)=>{SF(.7,.36,.5,'#8a5a36',x,.48,z+.5);SF(.06,.3,.06,'#6b4a2e',x-.3,.15,z+.7);SF(.06,.3,.06,'#6b4a2e',x+.3,.15,z+.7);cols.forEach((col,j)=>SF(.16,.14,.16,col,x-.2+j*.2,.72,z+.5))};
 const lanterns=col=>[cx-1.6,cx+1.6].forEach(x=>{SF(.03,.3,.03,'#222',x,2.7,z+.9);SF(.32,.42,.32,col,x,2.35,z+.9);SF(.34,.06,.34,'#1a1a1a',x,2.58,z+.9);SF(.34,.06,.34,'#1a1a1a',x,2.12,z+.9)});
 switch(nm){
  case'CAFE':table(L);table(Rr);aboard(cx-1.3,'');break;
  case'BAKERY':SF(.9,1.1,.4,'#8a5a36',L,.55,z+.3);for(let j=0;j<3;j++)for(let k=0;k<3;k++)SF(.24,.12,.16,sfPick(['#d9a441','#c98a5a','#e8c88a'],j+k),L-.28+k*.28,.35+j*.33,z+.5);aboard(Rr,'');blade('#f4d0a0','#c98a5a');break;
  case'PIZZA':SF(.06,.06,.9,'#2a2a30',cx,3.05,z+.45);SF(1,1,.08,'#e6b422',cx,2.6,z+.9);SF(.8,.8,.09,'#e74c3c',cx,2.6,z+.9);[[-.2,.15],[.2,-.1],[0,-.25],[.15,.25]].forEach(q=>SF(.14,.14,.1,'#7a1f1a',cx+q[0],2.6+q[1],z+.91));table(Rr);break;
  case'NOODLES':case'SUSHI':lanterns('#e84a4a');for(let k=0;k<4;k++)SF(.44,.6,.03,k%2?ixShade(a,.85):a,cx-.66+k*.44,1.6,z+.2);aboard(Rr,'');break;
  case'DELI':crate(L,['#e74c3c','#f1c40f','#2ecc71']);aboard(Rr,'');blade('#2f5a3a','#e8e0c8');break;
  case'DINER':SF(6,.12,.06,'#e03a3a',cx,2.65,z+.15);SF(6,.06,.07,'#7fe3ff',cx,2.75,z+.16);[L,Rr].forEach(x=>{SF(.4,.08,.4,'#e03a3a',x,.7,z+.7);SF(.08,.66,.08,'#cfd3d8',x,.33,z+.7)});break;
  case'TACOS':[L,Rr].forEach(x=>{SF(.5,.4,.5,'#c0392b',x,.2,z+.6);SF(.24,.8,.24,'#2e7d32',x,.8,z+.6);SF(.16,.3,.16,'#2e7d32',x+.2,.9,z+.6);SF(.08,.08,.08,'#ff6ad5',x,1.24,z+.6)});for(let k=0;k<8;k++)SF(.3,.26,.02,sfPick(['#e84a4a','#ffe066','#2ecc71','#3b82f6','#ff6ad5'],k),cx-2.1+k*.6,2.55,z+.95);break;
  case'JUICE BAR':crate(L,['#ff8a30','#ffe066','#e74c3c']);crate(Rr,['#2ecc71','#ffe066','#ff6ad5']);break;
  case'BOOKS':SF(1,.7,.5,'#5a3a22',L,.55,z+.5);for(let k=0;k<9;k++)SF(.08,.28,.22,sfPick(T.cols,k),L-.4+k*.1,1.04,z+.5);[-1,1].forEach(o=>SF(.18,.18,.06,'#1a1a1a',L+o*.4,.12,z+.5));blade('#2f5a3a','#f4f1ea');break;
  case'VINYL':case'RECORDS':SF(.8,.5,.5,'#6b4a2e',L,.25,z+.5);for(let k=0;k<6;k++)SF(.7,.36,.03,sfPick(T.cols,k),L,.62,z+.32+k*.07);SF(.06,.06,.9,'#2a2a30',Rr-1.2,2.9,z+.45);SF(.06,.7,.7,'#1a1a1a',Rr-1.2,2.5,z+.6);SF(.07,.22,.22,a,Rr-1.2,2.5,z+.6);break;
  case'GUITARS':SF(.06,.06,.9,'#2a2a30',Rr-1.2,3.05,z+.45);SF(.06,.5,.6,a,Rr-1.2,2.3,z+.6);SF(.06,.36,.44,ixShade(a,1.15),Rr-1.2,2.7,z+.6);SF(.06,.5,.1,'#3a2a1a',Rr-1.2,3.05,z+.6);break;
  case'SHOES':SF(.06,.06,.9,'#2a2a30',Rr-1.2,2.9,z+.45);SF(.06,.3,.8,'#f4f4f4',Rr-1.2,2.45,z+.6);SF(.07,.1,.8,'#e03a3a',Rr-1.2,2.32,z+.6);SF(.06,.24,.3,'#f4f4f4',Rr-1.2,2.66,z+.35);SF(.9,.5,.4,'#1a1a1a',L,.25,z+.4);[-.25,.15].forEach((o,k)=>SF(.3,.12,.14,sfPick(T.cols,k+2),L+o,.56,z+.4));break;
  case'TAILOR':case'BOUTIQUE':[L].forEach(x=>{SF(.06,.9,.06,'#555',x,.45,z+.3);SF(.44,.66,.26,a,x,1.22,z+.3);SF(.16,.22,.16,'#e8d9c0',x,1.66,z+.3)});blade(a,'#ffffff');break;
  case'FLORIST':for(let k=0;k<3;k++)for(let j=0;j<2;j++){const x=(j?Rr:L)-.4+k*.4;SF(.32,.34-k*.04,.32,'#8a8f96',x,.17+k*.12,z+.6-k*.15);SF(.36,.24,.36,sfPick(T.cols,k+j*3),x,.46+k*.2,z+.6-k*.15)}break;
  case'PHARMACY':SF(.06,.06,.9,'#2a2a30',Rr-1.2,3,z+.45);SF(.07,.7,.24,'#2ecc71',Rr-1.2,2.5,z+.6);SF(.07,.24,.7,'#2ecc71',Rr-1.2,2.5,z+.6);SF(.08,.12,.4,'#ffffff',Rr-1.2,2.5,z+.6);break;
  case'HARDWARE':[[-.3],[.3]].forEach(q=>SF(.06,2,.06,'#e6b422',L+q[0],1,z+.4));for(let k=0;k<6;k++)SF(.6,.05,.05,'#e6b422',L,.3+k*.32,z+.4);SF(.8,.4,.5,'#e67e22',Rr,.4,z+.6);SF(.1,.1,.6,'#333',Rr,.12,z+.6);SF(.6,.04,.04,'#555',Rr+.4,.6,z+.6);break;
  case'OPTICIAN':SF(.06,.06,.9,'#2a2a30',cx,3.05,z+.45);[-.35,.35].forEach(o=>{SF(.5,.4,.08,'#1a1a1a',cx+o,2.6,z+.9);SF(.38,.28,.09,'#bfe3ff',cx+o,2.6,z+.9)});SF(.2,.06,.08,'#1a1a1a',cx,2.66,z+.9);break;
  case'GYM':SF(.06,.06,.9,'#2a2a30',cx,3.05,z+.45);SF(1.2,.1,.1,'#9aa0a6',cx,2.6,z+.9);[-.6,.6].forEach(o=>SF(.16,.5,.5,'#1a1a1a',cx+o,2.6,z+.9));[L,Rr].forEach(x=>{SF(.3,.3,.3,'#1a1a1a',x,.15,z+.6);SF(.14,.12,.06,'#1a1a1a',x,.36,z+.6)});break;
  case'BANK':[cx-1.3,cx+1.3].forEach(x=>{SF(.4,2.6,.4,'#f4efe0',x,1.3,z+.3);SF(.5,.14,.5,'#d9cfb8',x,2.65,z+.3);SF(.5,.14,.5,'#d9cfb8',x,.07,z+.3)});SF(3,.2,.6,'#f4efe0',cx,2.82,z+.3);SF(.7,1.4,.4,'#2f4a6e',Rr+.6,.7,z+.25);SF(.4,.3,.02,'#7fd0ff',Rr+.6,1.1,z+.46);SF(.3,.04,.1,'#111',Rr+.6,.85,z+.48);break;
  case'LAUNDRY':SF(.06,.06,.9,'#2a2a30',Rr-1.2,2.9,z+.45);SF(.06,.7,.7,'#f4f4f4',Rr-1.2,2.5,z+.6);SF(.07,.44,.44,'#3b82f6',Rr-1.2,2.5,z+.6);SF(.08,.28,.28,'#9ad0f0',Rr-1.2,2.5,z+.6);SF(.6,.4,.4,'#e8e0c8',L,.2,z+.5);SF(.5,.14,.3,'#e84a4a',L,.46,z+.5);break;
  case'GALLERY':SF(.06,1.2,.06,'#6b4a2e',L,.6,z+.8);SF(.06,1.2,.06,'#6b4a2e',L-.3,.6,z+.5);SF(.06,1.2,.06,'#6b4a2e',L+.3,.6,z+.5);SF(.8,.6,.06,'#f4f4f4',L,1.2,z+.5);[['#e03a3a',-.2],['#3b82f6',.1],['#ffe066',.25]].forEach(q=>SF(.2,.2,.02,q[0],L+q[1],1.2,z+.54));break}}
/* window displays behind the glass of a tower shop front, and a frame round its sign in the shop's colour */
function sfWindow(nm,c){const T=SFTY[nm],cx=(c.x0+c.x1)/2,z=c.z1,food=T.k=='f',cols=T.cols||[T.a,'#e8b04a','#f4f4f4',T.c,'#c0392b'],w=c.x1-c.x0;
 SF(w-.4,.06,.06,T.a,cx,2.64,z+.15);SF(w-.4,.06,.06,T.a,cx,1.96,z+.15);
 [[c.x0+.5,cx-1.4],[cx+1.4,c.x1-.5]].forEach(([p,q],si)=>{const L=q-p;if(L<1.2)return;const m=(p+q)/2;SF(L-.1,.08,.26,ixShade(T.c,.9),m,.36,z+.15);
  SF(.6,.8,.03,T.a,p+.5,1.3,z+.08);SF(.4,.24,.03,'#ffffff',p+.5,1.42,z+.1);SF(.4,.06,.03,'#ffffff',p+.5,1.12,z+.1);
  let i=si*3;for(let u=p+1.1;u<q-.25;u+=.5){const col=sfPick(cols,i++);
   if(food){SF(.3,.04,.3,'#f4f4f4',u,.42,z+.15);SF(.22,.14,.22,col,u,.51,z+.15);if(i%2)SF(.16,.1,.16,ixShade(col,1.2),u,.63,z+.15)}
   else switch(T.kind||nm){
    case'book':SF(.28,.38,.06,col,u,.6,z+.16);SF(.2,.06,.07,'#f4f4f4',u,.66,z+.16);break;
    case'rec':SF(.34,.34,.03,col,u,.6,z+.15);SF(.14,.14,.04,'#1a1a1a',u,.6,z+.16);break;
    case'tool':SF(.24,.36,.05,col,u,.6,z+.15);SF(.06,.4,.05,'#3a2a1a',u,.95,z+.15);break;
    case'shoe':SF(.3,.12,.16,col,u,.46,z+.16);SF(.12,.12,.16,col,u-.09,.56,z+.16);SF(.3,.04,.17,'#f4f4f4',u,.41,z+.16);break;
    case'cloth':if(i%2){SF(.06,.5,.06,'#555',u,.65,z+.2);SF(.36,.46,.2,col,u,1.12,z+.2);SF(.16,.2,.16,'#e8d9c0',u,1.48,z+.2)}break;
    case'pot':SF(.2,.2,.2,'#8a8f96',u,.5,z+.16);SF(.26,.22,.26,col,u,.71,z+.16);SF(.12,.12,.12,'#2e7d32',u+.08,.62,z+.17);break;
    case'bottle':[-.12,0,.12].forEach((o,k)=>SF(.08,.24,.08,sfPick(cols,i+k),u+o,.52,z+.16));break;
    case'glasses':SF(.04,.3,.04,'#9aa0a6',u,.55,z+.16);SF(.32,.1,.04,col,u,.74,z+.17);break;
    case'GYM':SF(.36,.04,.04,'#9aa0a6',u,.5,z+.16);SF(.08,.16,.16,'#1a1a1a',u-.16,.5,z+.16);SF(.08,.16,.16,'#1a1a1a',u+.16,.5,z+.16);break;
    case'BANK':SF(.3,.1,.14,'#e6b422',u,.45,z+.16);SF(.22,.08,.12,'#f1c40f',u,.54,z+.16);break;
    case'LAUNDRY':SF(.4,.5,.06,'#e8e8ec',u,.65,z+.12);SF(.26,.26,.03,'#3b82f6',u,.65,z+.16);break;
    case'GALLERY':if(i%2){SF(.5,.4,.04,'#1a1a1a',u,1,z+.12);SF(.4,.3,.03,col,u,1,z+.15)}break}}})}
/* every tower front: read its sign, make the room, add the outside props and a way in */
{const c0=cdTower;cdTower=function(c){const n=SGN.q.length;c0(c);try{if(c.sign||c.door||SGN.q.length<=n)return;const q=SGN.q[SGN.q.length-1];let nm=SGN.rows[q[0]];
 if(nm=='BARBER'){nm='BOUTIQUE';q[0]=sgnRow(nm);q[5]=sgnW(nm,q[6])}if(!SFTY[nm])return;const cx=(c.x0+c.x1)/2,fz=c.z1;
 if(INT.some(t=>Math.abs(t.x-cx)<2.5&&Math.abs(t.z-(fz+1.4))<2.5))return;/* a tower lobby already uses this door */
 SHOPS.push({name:nm.charAt(0)+nm.slice(1).toLowerCase(),cx,ox:-2000-SFROOMS.length*16,ez:fz+1.6});const i=SHOPS.length-1,T=SFTY[nm];
 const kc={skin:(i*3)%6,eyes:i%5,mouth:i%4,hair:(i*7)%20,hc:(i*5)%12,top:i%5,tc:(i*3)%10,pc:i%8,body:.35+(i%4)*.08};
 const act=T.k=='f'?()=>twBuy(T.it[0],T.it[1],T.it[2]):nm=='BANK'?()=>{snd('pop');say('Mr. Grant: "You have '+$$(S.money)+' on you. Your streams pay straight into it, no paperwork needed."')}:()=>{snd('pop');say(T.kn.split(' (')[0]+': "'+pick(T.say)+'"')};
 interior(i,['#888','#777'],'#666',[],[],kc,T.kn,act);ixRoom(i,sfRoom(nm));sfFloor(SHOPS[i].ox);SFROOMS.push(i);
 INT.push({x:cx,z:fz+1.4,r:1.5,l:'Enter '+SHOPS[i].name,a:()=>enterShop(i)});sfOutside(nm,cx,fz,c);sfWindow(nm,c)}catch(e){console.error('tower shop',e)}}}
