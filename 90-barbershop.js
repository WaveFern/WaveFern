/* ===== v26.91: the Barbershop =====
   A barbershop on the ground floor of the city tower next to the City Cafe (door on the plaza side, a striped barber pole,
   BARBERSHOP on the shop front). Inside: black and white tiles, two barber chairs at mirror stations, a wash basin,
   a waiting bench, a product shelf and Sal the barber at the front desk. Talk to Sal to change your hairstyle and colour.
   You can pick any of the 20 classic styles, or one of 12 detailed barbershop styles (index 20 and up, below) that only
   the barbershop cuts. Every pick is shown on your character straight away; you pay when you press Get this cut, and
   walking off without paying puts your old hair back.
   Hair styles 20+ are drawn here, for the 3D character (buildChar), the pixel portraits (fig0) and the small avatars
   (pfp/drawFace use the closest classic style). The style lives in ch.hair like every other style, so saves keep it. */
const BARB_HAIR=[
 /* [name, price, classic style the small avatars fall back to] */
 ['Curtains',45,2],['Wolf cut',60,6],['Mullet',50,2],['Pompadour',70,11],['Man bun',55,8],['Box braids',120,19],
 ['Bantu knots',90,13],['Faux hawk',55,4],['Slick back',50,16],['High top fade',80,15],['Pixie cut',45,2],['Long waves',75,5]];
const BARB0=20,BARB_CLASSIC=20,BARB_DYE=15;
const barbName=h=>h>=BARB0?(BARB_HAIR[h-BARB0]||['Haircut'])[0]:NM.hair[h]||'Haircut';

/* ---- 3D: styles 20+ ---- (the head is a .55 box centred on 0: top .275, face .275 forward, eyes at y .04) */
const BH3={
 20:(H,c)=>{/* curtains: middle part, two curtain bangs, tucked sides, soft back */
  H(.6,.12,.6,0,.31,0);H(.6,.36,.12,0,.1,-.27);[-1,1].forEach(s=>{H(.07,.32,.42,s*.3,.11,-.04);const m=H(.27,.17,.06,s*.15,.22,.29);m.rotation.z=s*.32;H(.08,.14,.06,s*.26,.1,.28);H(.12,.02,.34,s*.15,.375,.02,c.hl);H(.02,.2,.36,s*.31,.14,-.05,c.hd)});
  H(.03,.02,.34,0,.372,.12,c.dd);[-.18,0,.18].forEach(x=>H(.04,.3,.02,x,.08,-.335,c.hd))},
 21:(H,c)=>{/* wolf cut: shaggy crown, choppy fringe, flared layers that get shorter towards the front */
  H(.62,.14,.62,0,.31,0);H(.62,.56,.12,0,-.02,-.28);[-.2,-.07,.07,.2].forEach((x,i)=>{const m=H(.12,.16,.12,x,.42+i%2*.03,-.05+i%2*.06);m.rotation.z=-x*1.6;m.rotation.x=-.2});
  [-.21,-.105,0,.105,.21].forEach((x,i)=>H(.1,.13+(i*3%4)*.03,.06,x,.22-(i*3%4)*.015,.29));
  [-1,1].forEach(s=>{H(.08,.42,.46,s*.31,.02,-.03);const a=H(.06,.24,.3,s*.345,-.12,-.1);a.rotation.z=s*.18;const b=H(.06,.2,.2,s*.33,-.26,-.2);b.rotation.z=s*.28;H(.02,.36,.02,s*.355,0,.12,c.hd)});
  [-.2,0,.2].forEach((x,i)=>{H(.14,.14,.08,x,-.34-i%2*.04,-.3);H(.04,.4,.02,x+.06,-.08,-.345,c.hd)});H(.3,.02,.3,-.05,.385,0,c.hl)},
 22:(H,c)=>{/* mullet: business in front (short top and fringe, faded sides), party at the back */
  H(.6,.12,.6,0,.3,0);H(.5,.07,.05,0,.24,.29);[-1,1].forEach(s=>{H(.065,.16,.4,s*.295,.18,-.03,c.hd);H(.04,.1,.06,s*.29,.04,.12,c.dd)});
  H(.58,.82,.13,0,-.13,-.3);H(.62,.12,.17,0,-.5,-.32);[-.18,-.06,.06,.18].forEach((x,i)=>{H(.05,.62,.02,x,-.15,-.37,i%2?c.hl:c.hd);H(.1,.1,.08,x,-.6,-.3-i%2*.04)});H(.36,.02,.36,0,.365,0,c.hl)},
 23:(H,c)=>{/* pompadour: tall swept-up front roll, tight faded sides, slick top */
  H(.58,.1,.58,0,.3,-.02);H(.5,.22,.36,0,.42,.1);const r=H(.5,.18,.16,0,.46,.28);r.rotation.x=-.35;H(.4,.04,.36,0,.54,.1,c.hl);H(.3,.04,.1,.04,.56,.3,c.hl);
  [-1,1].forEach(s=>{H(.06,.24,.46,s*.29,.13,-.03,c.dd);H(.07,.06,.48,s*.295,.27,-.03,c.hd)});H(.58,.3,.1,0,.1,-.28,c.hd);[-.15,0,.15].forEach(x=>H(.03,.02,.36,x,.535,.08,c.hd))},
 24:(H,c)=>{/* man bun: hair pulled back into a top knot with a tie, faded sides */
  H(.6,.1,.6,0,.31,0);[-.16,-.05,.06,.17].forEach(x=>H(.03,.02,.58,x,.365,0,c.hd));H(.58,.24,.1,0,.18,-.28);
  [-1,1].forEach(s=>H(.06,.22,.44,s*.29,.13,-.03,c.dd));H(.26,.05,.26,0,.4,-.1,'#2a2a2a');H(.28,.22,.28,0,.53,-.12);H(.2,.08,.2,0,.67,-.12);H(.1,.03,.1,-.05,.64,-.04,c.hl);
  const w=H(.12,.1,.1,.1,.6,-.22);w.rotation.z=.4},
 25:(H,c)=>{/* box braids: parted scalp, long braids all round, gold cuffs and beads */
  H(.6,.12,.6,0,.31,0);[-.15,0,.15].forEach(x=>H(.02,.02,.6,x,.372,0,c.dd));[-.15,.05].forEach(z=>H(.6,.02,.02,0,.372,z,c.dd));H(.5,.07,.05,0,.25,.29);
  for(let i=0;i<13;i++){const a=Math.PI*(.05+i*.9/12),x=-Math.cos(a)*.31,z=-Math.sin(a)*.3+.02,L=.82+(i*5%3)*.06;H(.065,L,.065,x,.2-L/2,z);for(let k=1;k<4;k++)H(.075,.025,.075,x,.2-k*L/4,z,c.hd);H(.08,.06,.08,x,.2-L-.02,z,i%3?'#e6b422':'#f4f4f4')}
  [-1,1].forEach(s=>{H(.06,.58,.06,s*.3,-.08,.2);H(.07,.05,.07,s*.3,-.36,.2,'#e6b422')})},
 26:(H,c)=>{/* bantu knots: low scalp with parts, six coiled knots */
  H(.58,.07,.58,0,.3,0);H(.58,.2,.1,0,.18,-.27);[-1,1].forEach(s=>H(.06,.2,.42,s*.29,.17,-.03));
  [[-.16,-.14],[.16,-.14],[-.17,.12],[.17,.12],[0,-.02],[0,.2]].forEach((q,i)=>{const[x,z]=q;H(.17,.12,.17,x,.39,z);H(.12,.08,.12,x,.48,z);const t=H(.07,.06,.07,x,.54,z);t.rotation.y=.6;H(.08,.02,.03,x-.02,.44,z+.09,c.hl);H(.03,.02,.08,x+.08,.44,z,c.hd)});
  H(.02,.02,.58,-.08,.338,0,c.dd);H(.02,.02,.58,.08,.338,0,c.dd)},
 27:(H,c)=>{/* faux hawk: a textured ridge that rises to the front, very short sides */
  H(.58,.06,.58,0,.3,0,c.hd);[-1,1].forEach(s=>H(.06,.2,.44,s*.29,.15,-.03,c.dd));H(.58,.2,.08,0,.18,-.28,c.hd);
  for(let k=0;k<5;k++){const z=-.22+k*.12,h=.1+k*.035,m=H(.22-k*.01,h,.13,0,.33+h/2,z);m.rotation.x=-.25;H(.06,.04,.06,(k%2?.05:-.05),.35+h,z+.02,c.hl)}
  const t=H(.16,.1,.1,0,.52,.3);t.rotation.x=-.6},
 28:(H,c)=>{/* slick back: glossy hair combed straight back, comb lines, faded sides */
  H(.6,.13,.62,0,.32,-.01);H(.56,.1,.08,0,.34,.27);H(.58,.34,.14,0,.12,-.29);H(.5,.1,.1,0,-.06,-.3,c.hd);
  [-.18,-.06,.06,.18].forEach(x=>H(.03,.02,.6,x,.39,0,c.hd));H(.12,.02,.4,-.1,.392,.04,c.hl);[-1,1].forEach(s=>H(.06,.22,.42,s*.29,.13,-.04,c.dd))},
 29:(H,c)=>{/* high top fade: a tall flat-topped box of hair over a fade */
  H(.52,.44,.5,0,.5,0);H(.5,.03,.48,0,.735,0,c.hl);H(.58,.08,.58,0,.27,0,c.hd);[-1,1].forEach(s=>{H(.06,.14,.44,s*.29,.13,-.03,c.dd);H(.02,.42,.46,s*.262,.5,0,c.hd)});H(.48,.42,.02,0,.5,.251,c.hd);
  for(let i=0;i<6;i++)H(.04,.04,.02,-.18+i*.07,.45+(i%2)*.12,.262,c.hl);H(.58,.16,.1,0,.14,-.28,c.dd)},
 30:(H,c)=>{/* pixie cut: short tousled layers and a side-swept fringe */
  H(.6,.13,.6,0,.31,0);H(.6,.26,.12,0,.15,-.27);[-1,1].forEach(s=>{H(.07,.2,.36,s*.3,.15,-.04);H(.07,.12,.1,s*.3,.06,.16)});
  const f=H(.42,.1,.07,-.05,.22,.29);f.rotation.z=.22;H(.16,.12,.07,-.2,.16,.29);[-.15,0,.15].forEach((x,i)=>{const m=H(.12,.08,.12,x,.4,-.1+i*.08);m.rotation.z=x*2;m.rotation.y=.4});H(.24,.02,.24,.06,.38,0,c.hl)},
 31:(H,c)=>{/* long waves: centre-part fringe, wavy lengths past the shoulders front and back */
  H(.6,.14,.6,0,.3,0);H(.5,.07,.05,0,.25,.29);H(.12,.05,.05,-.2,.19,.29);H(.1,.05,.05,.22,.2,.29);
  for(let i=0;i<7;i++){const y=.18-i*.15,o=i%2?.025:-.015;H(.62+o,.16,.13,0,y,-.28-o);if(i>1)H(.05,.12,.02,-.18+(i%3)*.18,y,-.355,c.hl)}
  [-1,1].forEach(s=>{for(let i=0;i<6;i++){const o=i%2?.025:0;H(.08,.16,.38,s*(.3+o),.15-i*.15,-.05)}H(.02,.8,.02,s*.345,-.2,.1,c.hd)})}};
{const bc=buildChar;buildChar=function(c){const hs=c&&c.hair;if(!(hs>=BARB0&&BH3[hs]))return bc(c);let r;c.hair=0;try{r=bc(c)}finally{c.hair=hs}
 try{const h=xHead(r.g);if(h){const hc=c.hc_custom||HAIRC[c.hc%HAIRC.length],col={hl:dk(hc,1.45),hd:dk(hc,.65),dd:dk(hc,.5)},n0=h.children.length;
  BH3[hs]((w,y,d,x,yy,z,k)=>B(h,w,y,d,k||hc,x,yy,z),col);for(let i=n0;i<h.children.length;i++)h.children[i].userData.hair=1;
  const b=typeof hatBrim=='function'?hatBrim(c):null;if(b!=null)tuckHair(h,b)}}catch(e){console.warn('barber hair',e)}return r}}

/* ---- pixel portraits: styles 20+ ---- (fig0 units: the face is x 5-19, the top of the head is y 1) */
const BH2={
 20:(R,c)=>{R(c.hc,5,0,14,4);R(c.hd,11,0,2,3);R(c.hc,5,3,5,2);R(c.hc,5,5,3,2);R(c.hc,5,7,2,2);R(c.hc,14,3,5,2);R(c.hc,16,5,3,2);R(c.hc,17,7,2,2);R(c.hc,4,2,2,10);R(c.hc,18,2,2,10);R(c.hl,7,1,3,1);R(c.hl,14,1,3,1);R(c.hd,6,4,1,3);R(c.hd,17,4,1,3)},
 21:(R,c)=>{R(c.hc,4,-2,16,6);[7,10,13,16].forEach((x,i)=>R(c.hc,x,-3-i%2,2,2));[6,8,10,12,14,16].forEach((x,i)=>R(i%2?c.hd:c.hc,x,4,2,2+(i*3%4)));R(c.hc,3,2,3,11);R(c.hc,18,2,3,11);R(c.hc,2,9,3,7);R(c.hc,19,9,3,7);R(c.hd,3,8,1,8);R(c.hd,20,8,1,8);R(c.hl,8,-2,5,1);R(c.hl,4,4,1,4)},
 22:(R,c)=>{R(c.hc,5,0,14,4);R(c.hl,8,0,6,1);R(c.hc,6,4,12,1);R(c.hd,5,3,2,4);R(c.hd,17,3,2,4);R(c.hc,3,6,3,14);R(c.hc,18,6,3,14);R(c.hd,3,19,4,2);R(c.hd,17,19,4,2);R(c.hl,4,9,1,8);R(c.hl,19,9,1,8)},
 23:(R,c)=>{R(c.hc,5,-3,14,6);R(c.hc,6,-6,12,4);R(c.hc,9,-7,9,2);R(c.hl,8,-6,7,1);R(c.hl,12,-7,4,1);R(c.hd,7,-4,9,1);R(c.dd,5,2,1,6);R(c.dd,18,2,1,6);R(c.hd,6,2,1,3);R(c.hd,17,2,1,3)},
 24:(R,c)=>{R(c.hc,5,0,14,3);[7,10,13,16].forEach(x=>R(c.hd,x,0,1,3));R(c.dd,5,3,1,5);R(c.dd,18,3,1,5);R(c.hc,9,-6,6,5);R(c.hc,10,-7,4,1);R(c.hl,10,-6,3,1);R('#2a2a2a',9,-1,6,1);R(c.hd,13,-4,1,2)},
 25:(R,c)=>{R(c.hc,5,0,14,4);[9,13].forEach(x=>R(c.dd,x,0,1,4));R(c.hc,6,4,12,1);[2,4,18,20].forEach((x,i)=>{const L=27-(i%2)*4;R(c.hc,x,2,2,L);for(let y=5;y<L;y+=4)R(c.hd,x,y,2,1);R(i%3?'#e6b422':'#f4f4f4',x,L+1,2,2)});R(c.hc,6,5,1,10);R(c.hc,17,5,1,10);R('#e6b422',6,15,1,1);R('#e6b422',17,15,1,1)},
 26:(R,c)=>{R(c.hc,5,0,14,3);R(c.dd,9,0,1,3);R(c.dd,14,0,1,3);[[5,-4],[10,-5],[15,-4]].forEach(q=>{R(c.hc,q[0],q[1],4,4);R(c.hd,q[0],q[1]+3,4,1);R(c.hl,q[0]+1,q[1],2,1);R(c.hd,q[0]+2,q[1]+1,1,1)});R(c.hc,4,2,2,5);R(c.hc,18,2,2,5)},
 27:(R,c)=>{R(c.hd,5,0,14,2);R(c.dd,5,2,1,5);R(c.dd,18,2,1,5);R(c.hc,9,-4,6,5);R(c.hc,10,-6,4,2);R(c.hc,12,-8,2,2);R(c.hc,14,-6,2,2);R(c.hl,10,-5,2,1);R(c.hl,12,-8,1,1);R(c.hd,13,-3,1,3)},
 28:(R,c)=>{R(c.hc,5,-1,14,4);R(c.hc,6,-2,12,1);[7,10,13,16].forEach(x=>R(c.hd,x,-1,1,4));R(c.hl,8,-2,4,1);R(c.dd,5,3,1,4);R(c.dd,18,3,1,4);R(c.hd,5,2,14,1)},
 29:(R,c)=>{R(c.hc,5,-9,14,10);R(c.hl,5,-9,14,1);R(c.hd,5,0,14,1);R(c.dd,5,1,1,5);R(c.dd,18,1,1,5);R(c.hd,17,-8,2,8);for(let i=0;i<6;i++)R(c.hl,7+i*2,-6+(i%2)*3,1,1)},
 30:(R,c)=>{R(c.hc,5,0,14,4);[7,11,15].forEach((x,i)=>R(c.hc,x,-1-i%2,2,1));R(c.hc,6,4,9,1);R(c.hc,6,5,6,1);R(c.hc,6,6,3,1);R(c.hc,4,2,2,6);R(c.hc,18,2,2,5);R(c.hl,8,0,4,1);R(c.hd,10,4,1,1)},
 31:(R,c)=>{R(c.hc,5,0,14,5);R(c.hl,7,0,4,1);R(c.hl,13,1,3,1);R(c.hd,11,0,2,3);R(c.hc,6,4,12,1);R(c.hc,6,5,3,1);R(c.hc,15,5,3,1);for(let y=2;y<28;y+=3){const o=(y/3|0)%2;R(c.hc,3+o,y,3,3);R(c.hc,18-o,y,3,3)}R(c.hl,4,8,1,6);R(c.hl,19,14,1,6);R(c.hd,4,20,1,6);R(c.hd,19,6,1,6)}};
{const f0=fig0;fig0=function(x,c,ox,oy){const h=c&&c.hair;if(!(h>=BARB0&&BH2[h]))return f0(x,c,ox,oy);f0(x,Object.assign({},c,{hair:0,ht:-1,ac:-1}),ox,oy);
 try{const R_=(col,a,b,w,hh)=>rc(x,col,ox+a/2,oy+b/2,w/2,hh/2),hc=c.hc_custom||HAIRC[c.hc%HAIRC.length],col={hc,hl:dk(hc,1.45),hd:dk(hc,.7),dd:dk(hc,.5)};
  const HCY=typeof hatClip2D=='function'?hatClip2D(c):null;if(HCY!=null){x.save();x.beginPath();x.rect(ox-64,oy+HCY/2,192,192);x.clip()}
  BH2[h](R_,col);if(HCY!=null)x.restore();
  /* accessories and hats go over the hair, as in fig0 */
  if(c.ac>=0){const ak=c.acc||'#222222',ac=c.ac;if(ac==0){R_(ak,5,-1,14,1);R_(ak,3,6,3,5);R_(ak,18,6,3,5)}else if(ac==1){SHD(R_,'#141c33')}else if(ac==2){R_(ak,8,17,8,1);R_(ak,9,18,6,1);R_(ak,11,19,2,2)}else R_(ak,6,14,12,3)}
  if(c.ht>=0){const hc2=HTC[c.ht][0],sy=c.hts!==undefined?c.hts:[0,1,2,0,3,1,2][c.ht]??0;if(sy==0){R_(hc2,5,-2,14,6);R_(dk(hc2,.75),12,3,9,2)}else if(sy==1){R_(hc2,5,-3,14,7);R_(dk(hc2,.8),5,2,14,2)}else if(sy==2){R_(hc2,5,-2,14,6);R_(dk(hc2,.85),3,2,18,2)}else if(sy==3){R_(hc2,5,-2,14,5);R_(dk(hc2,.7),11,3,10,1)}else if(sy==4)R_(hc2,5,0,14,2);else{R_(hc2,4,-3,15,4);R_(dk(hc2,.8),9,-4,3,1)}}}catch(e){console.warn('barber pixel hair',e)}}}
/* the tiny 16 px avatars use the closest classic style */
const barbBase=c=>c&&c.hair>=BARB0?Object.assign({},c,{hair:(BARB_HAIR[c.hair-BARB0]||[0,0,2])[2]}):c;
{const p0=pfp;pfp=function(c=ch){return p0(barbBase(c))}}
{const d0=drawFace;drawFace=function(x,c,ox,oy){return d0(x,barbBase(c),ox,oy)}}

/* ---- the shop: ground floor of the tower east of the City Cafe ---- */
const BARB={i:null,ox:-1100,orig:null,pick:null};
{const bv=buildVenues;buildVenues=function(){bv();try{SHOPS.push({name:'Barbershop',cx:541,ox:BARB.ox,ez:72});BARB.i=SHOPS.length-1;
 interior(BARB.i,['#f0f0f0','#1a1a1a'],'#2a6ab5',[],[],{hair:28,hc:0,eyes:0,mouth:3,top:0,tc:6,pc:4,skin:3,body:.45,hgt:.6,ac:-1},'Sal (barber)',barbOpen);
 ixRoom(BARB.i,BARB_ROOM);
 /* dark floor under the room so it does not float in the sky */
 const g=new THREE.Mesh(geo(40,.1,30),new THREE.MeshLambertMaterial({color:'#1c2026'}));g.position.set(BARB.ox+5,-.25,324);WORLD.add(g)}catch(e){console.error('barbershop room',e)}}}
const BARB_ROOM={fl:['tile','#f0f0f0','#1f1f22'],wl:['stripe','#e9eef4','#c8d6e6'],tr:'#1f3a6a',wa:'#1f3a6a',fw:'#1f3a6a',mat:'#c0392b',sign:['BARBERSHOP','#ffffff','#1f3a6a',3.2,.5,2.72,5,{border:'#c0392b'}],lights:[[2.2,3.2],[7.8,3.2],[5,6,.5]],lc:0xfff4e4,
 build(b,cl,add){
  /* front desk with till, card reader and a jar of combs */
  ixCounter(b,cl,5,3.2,2.6,.9,'#1f3a6a','#e8e2d8');b(.4,.26,.36,'#333',5.7,1.19,3.2);b(.32,.14,.02,'*7fd0ff',5.7,1.29,3.01);b(.14,.2,.14,'*cfe9ff',4.3,1.16,3.3);[-.03,0,.03].forEach((o,k)=>b(.02,.16,.02,['#111','#c0392b','#2a6ab5'][k],4.3+o,1.3,3.3));b(.2,.04,.3,'#f4f4f4',4.8,1.08,3.35);
  /* two mirror stations with barber chairs */
  [2,8].forEach((x,k)=>{b(1.5,1.3,.05,'#c9a227',x,1.85,.04);b(1.36,1.16,.03,'*cfe3ee',x,1.85,.07);b(.4,1,.02,'*eaf6fb',x-.35,1.9,.09);b(1.6,.06,.4,'#1f1f22',x,1.08,.22);b(1.5,.98,.36,'#2a2a30',x,.52,.22);
   [[-.5,'#2a6ab5'],[-.3,'#c0392b'],[.35,'#f4f4f4'],[.55,'#1f1f22']].forEach(q=>b(.1,.2,.1,q[1],x+q[0],1.21,.2));b(.3,.04,.12,'#9aa0a6',x+.1,1.13,.2);b(.1,.06,.3,'#555',x-.05,1.14,.25);cl(x-.8,0,x+.8,.42);
   /* the chair: chrome base, red leather seat, back, arms, head rest, foot rest */
   const z=1.25;b(.5,.06,.5,'#cfd3d8',x,.03,z);b(.12,.34,.12,'#cfd3d8',x,.22,z);b(.62,.14,.6,'#a8242c',x,.46,z);b(.62,.62,.12,'#a8242c',x,.84,z+.27);b(.3,.18,.08,'#8a1c22',x,1.24,z+.28);b(.08,.06,.5,'#cfd3d8',x-.33,.66,z);b(.08,.06,.5,'#cfd3d8',x+.33,.66,z);b(.1,.14,.1,'#cfd3d8',x-.33,.58,z-.2);b(.1,.14,.1,'#cfd3d8',x+.33,.58,z-.2);b(.5,.04,.24,'#cfd3d8',x,.16,z-.42);b(.04,.2,.04,'#cfd3d8',x,.26,z-.32);cl(x-.4,z-.55,x+.4,z+.4);
   ixLampW(b,x-.95,2.6,0,'*fff2c0');ixLampW(b,x+.95,2.6,0,'*fff2c0')});
  /* wash basin and a hood dryer on the left wall */
  b(.6,.86,1,'#2a2a30',.3,.43,4.4);b(.62,.08,1.02,'#e8e8ec',.31,.9,4.4);b(.4,.06,.6,'*cfe9ff',.36,.92,4.4);b(.04,.2,.04,'#cfd3d8',.12,1.04,4.4);b(.16,.04,.04,'#cfd3d8',.2,1.14,4.4);cl(0,3.85,.65,4.95);
  b(.06,1.3,.06,'#cfd3d8',.5,.65,6);b(.4,.04,.4,'#cfd3d8',.5,.02,6);b(.5,.4,.5,'#d8dde2',.6,1.45,6);b(.4,.06,.4,'#9aa0a6',.6,1.24,6);cl(.25,5.75,.85,6.25);
  /* waiting bench, magazine table and a window */
  b(2.2,.45,.6,'#1f3a6a',2.6,.23,7.2);b(2.2,.12,.6,'#2a4a8a',2.6,.5,7.2);[-1,1].forEach(s=>b(.08,.4,.08,'#cfd3d8',2.6+s*1,.2,7.2));cl(1.45,6.85,3.75,7.55);
  b(.6,.4,.5,'#6b4a2e',4.2,.2,7.2);b(.3,.03,.2,'#e84a8a',4.15,.42,7.15);b(.3,.03,.2,'#e6b422',4.25,.44,7.25);cl(3.9,6.95,4.5,7.45);ixWin(b,0,2.4,1.4);
  /* product shelf on the right of the back wall, framed style chart, barber pole by the door */
  b(1.6,.04,.3,'#6b4a2e',5.05,1.75,.15);b(1.6,.04,.3,'#6b4a2e',5.05,2.2,.15);for(let k=0;k<6;k++){b(.14,.16,.14,['#c0392b','#1f3a6a','#e6b422','#2fe68a','#f4f4f4','#8e44ad'][k],4.45+k*.24,1.85,.15);b(.12,.12,.12,['#f4f4f4','#1a1a1a','#e8d9a0','#e84a8a','#2a6ab5','#c9a227'][k],4.45+k*.24,2.29,.15)}
  ixFrame(b,3.4,1.95,.03,.6,.8,'#1f1f22',['#1a1a1a','#8b5a2b','#d9a441']);ixFrame(b,6.6,1.95,.03,.6,.8,'#1f1f22',['#c0392b','#e9eef4','#2a6ab5']);
  b(.2,1.6,.2,'#f4f4f4',9.6,1.1,7.4);for(let k=0;k<6;k++){b(.21,.08,.21,'#c0392b',9.6,.45+k*.25,7.4);b(.21,.08,.21,'#2a6ab5',9.6,.57+k*.25,7.4)}b(.26,.1,.26,'#c9a227',9.6,1.95,7.4);b(.26,.1,.26,'#c9a227',9.6,.27,7.4);cl(9.4,7.2,9.8,7.6);
  ixPlant(b,cl,9.3,4.4,.9,'#1f3a6a');ixPend(b,5,5.6,'*ffe9b8','#1f3a6a',2.4)}};
/* the door, sign and barber pole: the city is laid out a little differently each load, so the shop takes the free tower
   on the cafe's row nearest the City Cafe (not a tower that already has a door, a shop or a tower lobby) */
const BARBT=[];
{const h0=twHook;twHook=function(x0,z0,cx,fz,w,h){h0(x0,z0,cx,fz,w,h);const c=CT[CT.length-1];if(c)BARBT.push({x0,z0,c})}}
{const sd0=shopDoors;shopDoors=function(){sd0();const cf=SHOPT.cafe;if(BARB.door||!cf||BARB.i==null)return;
 const ccx=(cf.x0+cf.x1)/2,L=BARBT.filter(q=>q.z0==22&&q.c!==cf&&!q.c.door&&!q.c.sign&&!(q.z0==-37&&[534,574,614].includes(q.x0))).sort((a,b)=>Math.abs((a.c.x0+a.c.x1)/2-ccx)-Math.abs((b.c.x0+b.c.x1)/2-ccx));
 const c=L.length?L[0].c:null;if(!c)return;BARB.door=1;c.door=1;const cx=(c.x0+c.x1)/2,fz=c.z1;
 for(const q in SBC){const L=SBC[q];for(let j=L.length-1;j>=0;j--){const e=L[j];if(e[3]=='#2a1f1a'&&Math.abs(e[0]-2)<.01&&Math.abs(e[1]-1.8)<.01&&Math.abs(e[4]-cx)<1.5)L.splice(j,1)}}
 SB(2,1.8,.1,'#2a1f1a',cx,.9,fz+.05);SB(.9,1.5,.02,'#9ad0f0',cx-.45,.95,fz+.11);c.sign='BARBERSHOP';
 /* barber pole */
 const px=cx+1.6;SB(.16,.1,.16,'#c9a227',px,2.25,fz+.2);SB(.16,.1,.16,'#c9a227',px,1.05,fz+.2);SB(.18,1.1,.18,'#f4f4f4',px,1.65,fz+.2);for(let k=0;k<5;k++){SB(.19,.07,.19,'#c0392b',px,1.2+k*.22,fz+.2);SB(.19,.07,.19,'#2a6ab5',px,1.31+k*.22,fz+.2)}SB(.06,.06,.25,'#555',px,1.65,fz+.08);
 const s=SHOPS[BARB.i];s.cx=cx;s.ez=fz+1.6;INT.push({x:cx,z:fz+1.4,r:1.6,l:'Enter Barbershop',a:()=>enterShop(BARB.i)});POIS.push([cx,fz+5,'Barbershop','#5ad1ff'])}}

/* ---- the barber's chair menu ---- */
function barbPrice(h,hc){const o=BARB.orig;return(h!==o.hair?(h>=BARB0?BARB_HAIR[h-BARB0][1]:BARB_CLASSIC):0)+(hc!==o.hc?BARB_DYE:0)}
function barbThumb(cfg,w,h,s,ox,oy){const k=document.createElement('canvas');k.width=w;k.height=h;const x=k.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#e9eef4';x.fillRect(0,0,w,h);x.save();x.scale(s,s);try{fig0(x,cfg,ox,oy)}catch(e){}x.restore();return k.toDataURL()}
function barbOpen(){if(mode!='play')return;BARB.orig={hair:ch.hair,hc:ch.hc,hc_custom:ch.hc_custom};BARB.pick={hair:ch.hair,hc:ch.hc};mode='menu';barbR()}
function barbR(){const p=BARB.pick,o=BARB.orig,cfg=Object.assign({},ch,{hair:p.hair,hc:p.hc,ht:-1}),price=barbPrice(p.hair,p.hc);if(p.hc!==o.hc)delete cfg.hc_custom;
 const tile=h=>{const c=Object.assign({},cfg,{hair:h}),pr=h===o.hair?'Yours':'$'+(h>=BARB0?BARB_HAIR[h-BARB0][1]:BARB_CLASSIC);return`<button class="bbt${h===p.hair?' on':''}" onclick="barbSet('hair',${h})"><img src="${barbThumb(c,56,56,3.5,2,5)}" alt=""><b>${esc(barbName(h))}</b><small>${pr}</small></button>`};
 const det=BARB_HAIR.map((_,i)=>tile(BARB0+i)).join(''),cls=NM.hair.map((_,i)=>tile(i)).join('');
 const sw=HAIRC.map((col,i)=>`<button class="bbs${i===p.hc?' on':''}" style="background:${col}" title="Colour ${i+1}" onclick="barbSet('hc',${i})"></button>`).join('');
 $('ui').innerHTML=`<div id=barb class="box modal"><div class=bbh><img class=bbp src="${barbThumb(cfg,96,96,5.5,2.7,5)}" alt=""><div><h2>Sal's Barbershop</h2><p class=m>Sal: "Take a seat. What are we doing today?" You see each cut on yourself before you pay.</p><p><b>${esc(barbName(p.hair))}</b>${p.hc!==o.hc?' · new colour':''} · <b>${price?'$'+price:'no change'}</b> <small class=m>(you have $${Math.floor(S.money).toLocaleString()})</small></p></div></div>
 <h3>Barbershop styles <small class=m>detailed cuts only Sal does</small></h3><div class=bbg>${det}</div><h3>Classic cuts <small class=m>$${BARB_CLASSIC}</small></h3><div class=bbg>${cls}</div>
 <h3>Colour <small class=m>$${BARB_DYE} to dye</small></h3><div class=bbc>${sw}</div>
 <div class=row2><button class=go ${price&&S.money>=price?'':'disabled'} onclick="barbBuy()">${price?'Get this cut · $'+price:'Pick a new style'}</button><button onclick="barbClose()">Leave</button></div></div>`;
 /* try it on: your character shows the pick while the menu is open */
 ch.hair=p.hair;ch.hc=p.hc;if(p.hc!==o.hc)delete ch.hc_custom;else if(o.hc_custom)ch.hc_custom=o.hc_custom;refresh()}
function barbSet(k,v){if(!BARB.pick)return;BARB.pick[k]=v;snd('pop');const sc=$('barb')&&$('barb').scrollTop;barbR();if($('barb'))$('barb').scrollTop=sc}
function barbBuy(){const p=BARB.pick,price=barbPrice(p.hair,p.hc);if(!price)return;if(S.money<price){snd('err');return say('That cut costs $'+price)}
 S.money=+(S.money-price).toFixed(2);ch.hair=p.hair;ch.hc=p.hc;if(p.hc!==BARB.orig.hc)delete ch.hc_custom;BARB.orig=null;BARB.pick=null;refresh();closeUI();snd('cash');say('Fresh '+barbName(ch.hair).toLowerCase()+'! Sal: "Looking sharp."');try{autoSave()}catch(e){}}
function barbClose(){const o=BARB.orig;if(o){ch.hair=o.hair;ch.hc=o.hc;if(o.hc_custom)ch.hc_custom=o.hc_custom;else delete ch.hc_custom;refresh()}BARB.orig=null;BARB.pick=null;closeUI()}
/* Esc or anything else closing the menu without paying puts the old hair back */
{const u0=update;update=function(dt){u0(dt);if(BARB.orig&&!$('barb')){const o=BARB.orig;ch.hair=o.hair;ch.hc=o.hc;if(o.hc_custom)ch.hc_custom=o.hc_custom;else delete ch.hc_custom;BARB.orig=null;BARB.pick=null;refresh()}}}
{const st=document.createElement('style');st.textContent=`#barb{width:min(760px,96vw);max-height:88vh;overflow:auto}#barb h3{margin:12px 0 6px}.bbh{display:flex;gap:14px;align-items:center}.bbp{width:120px;height:120px;image-rendering:pixelated;border:3px solid #1f3a6a;border-radius:8px;flex:none}
.bbg{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px}.bbt{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;font-size:12px;line-height:1.15}.bbt img{width:64px;height:64px;image-rendering:pixelated;border-radius:6px}.bbt.on{outline:3px solid #5ad1ff}
.bbc{display:flex;flex-wrap:wrap;gap:6px}.bbs{width:30px;height:30px;padding:0;border-radius:50%;border:2px solid #0006}.bbs.on{outline:3px solid #5ad1ff;outline-offset:2px}`;document.head.appendChild(st)}
