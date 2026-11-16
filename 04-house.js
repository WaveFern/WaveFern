/* ---------- house ---------- */
const cols=[];let dyn=[],studio=null,lamps=[];
const col=(a,b,c,d)=>cols.push([a,b,c,d]);
const ROOMS=[['Bedroom',0,0,8,6,'#9a6b45','#7d5334','#7a6a8a'],['Recording studio',8,0,16,6,'#59616b','#454c54','#5a4a6a'],['Living room (empty)',0,6,8,12,'#b59b78','#9a8260','#8a7f6a'],['Kitchen (empty)',8,6,16,12,'#c9c3b2','#aaa492','#8a9a8a']];
const NWM=[];
function buildHouse(){
 const g=new THREE.Group();scene.add(g);B(g,16.8,.3,12.8,'#1a1d22',8,-.35,6);
 ROOMS.forEach(r=>{const[,x0,z0,x1,z1,a,b,wc]=r,w=x1-x0,d=z1-z0,f=new THREE.Mesh(geo(w,.2,d),tex(a,b,w,d));f.position.set((x0+x1)/2,-.1,(z0+z1)/2);g.add(f);
  if(z0==0){const mw=B(g,w,3,.3,wc,(x0+x1)/2,1.5,-.15);NWM.push([mw,x0,wc])}if(x0==0)B(g,.3,3,d,wc,-.15,1.5,(z0+z1)/2)});
 [[0,2],[4,8],[10,12]].forEach(s=>{B(g,.24,1,s[1]-s[0],'#6b6f73',8,.5,(s[0]+s[1])/2);col(7.88,s[0],8.12,s[1])});
 [[0,3],[5,11],[13,16]].forEach(s=>{B(g,s[1]-s[0],1,.24,'#6b6f73',(s[0]+s[1])/2,.5,6);col(s[0],5.88,s[1],6.12)});
 // bedroom
 
 const l1=new THREE.PointLight(0xffc080,.5,9);l1.position.set(3,1.5,1);g.add(l1);lamps.push(l1);
 
 B(g,.9,1.2,.05,'#c8506a',3.8,1.9,.04);B(g,.7,.2,.06,'#ffd27a',3.8,2.2,.05);
 /* v55.8.0: detailed bedroom dressing (window, curtains, pictures, fairy lights, shelf, wardrobe, plants) */
 {const P=(w,h,d,c,x,y,z)=>B(g,w,h,d,c,x,y,z),Wt='#e8e4da',pl=(x,z,s)=>{P(.3*s,.28*s,.3*s,'#b5482a',x,.14*s,z);P(.34*s,.05*s,.34*s,'#8a3a22',x,.29*s,z);P(.26*s,.03*s,.26*s,'#4a3320',x,.3*s,z);
   [[0,.55,0,.07],[-.1,.45,.04,.06],[.1,.5,-.05,.06],[.04,.7,.08,.05]].forEach(a=>P(a[3]*s*1.4,(.3+a[1]*.5)*s,a[3]*s*1.4,'#3a6b3a',x+a[0]*s,(.3+a[1]*.25)*s+.15*s,z+a[2]*s));
   [[-.18,.62,.02],[.18,.58,-.04],[0,.82,.0],[-.08,.7,.14],[.1,.72,.12]].forEach(a=>P(.2*s,.1*s,.2*s,'#4f9a4f',x+a[0]*s,a[1]*s+.2*s,z+a[2]*s))};
  /* window over the desk */
  P(1.8,1.3,.06,Wt,6,1.95,.03);P(1.55,1.05,.04,'*a9d8f2',6,1.95,.06);P(1.55,.3,.045,'*dff1fb',6,2.28,.065);P(.05,1.05,.06,Wt,6,1.95,.08);P(1.55,.05,.06,Wt,6,1.95,.08);
  P(2,.05,.18,Wt,6,1.27,.1);P(2.5,.04,.04,'#333',6,2.7,.08);P(.34,1.45,.08,'#c8506a',5.1,1.95,.07);P(.34,1.45,.08,'#c8506a',6.9,1.95,.07);P(.12,1.45,.09,'#a63e56',5.25,1.95,.075);P(.12,1.45,.09,'#a63e56',6.75,1.95,.075);
  /* pictures over the bed, wall clock */
  P(.7,.52,.04,'#2b2b2b',.9,2.05,.03);P(.6,.42,.03,'#4aa3df',.9,2.05,.05);P(.3,.18,.03,'#e6b422',.9,2.02,.065);P(.46,.6,.04,'#2b2b2b',1.8,1.95,.03);P(.38,.52,.03,'#e8a0b4',1.8,1.95,.05);P(.14,.14,.03,'#fff',1.8,2.02,.065);
  P(.38,.38,.05,'#2b2b2b',2.7,2.3,.03);P(.3,.3,.04,'#f4f1ea',2.7,2.3,.055);P(.02,.12,.02,'#222',2.7,2.34,.08);P(.1,.02,.02,'#222',2.74,2.3,.08);
  /* fairy lights */
  for(let i=0;i<10;i++){const x=.35+i*.3;P(.3,.015,.015,'#444',x+.15,2.62-.06*Math.sin(i/9*Math.PI)*0-.05*Math.sin((i+.5)/10*Math.PI*2)*.5,.03);P(.06,.08,.06,'*'+['ffd27a','ff9ab8','9ad8ff','b8ff9a'][i%4],x,2.56-.05*Math.sin(i/9*Math.PI),.05)}
  /* wall shelf with books and a plant (west wall) */
  P(.24,.05,1.3,'#6b4a2e',.12,1.75,2.2);P(.04,.2,.06,'#4d3320',.04,1.65,1.7);P(.04,.2,.06,'#4d3320',.04,1.65,2.7);
  [['#c8506a',.9],['#4aa3df',.8],['#e6b422',.95],['#3a6b3a',.85],['#8a5a9a',.9]].forEach((a,i)=>P(.16,a[1]*.3,.07,a[0],.13,1.78+a[1]*.15,1.65+i*.09));P(.16,.2,.1,'#ddd',.13,1.88,2.3);P(.18,.06,.12,'#e6b422',.13,1.8,2.55);pl(.14,2.8,.45);
  /* wardrobe (west wall) */
  P(.62,2.1,1.4,'#8a5a36',.31,1.05,5);P(.68,.08,1.48,'#5a3d25',.31,2.14,5);P(.66,.1,1.44,'#4d3320',.31,.05,5);
  P(.03,1.9,.66,'#a0693f',.63,1.05,4.66);P(.03,1.9,.66,'#a0693f',.63,1.05,5.34);P(.04,1.6,.46,'#8a5a36',.645,1.05,4.66);P(.04,1.6,.46,'#8a5a36',.645,1.05,5.34);P(.05,.2,.04,'#e6b422',.66,1.05,4.96);P(.05,.2,.04,'#e6b422',.66,1.05,5.04);
  col(0,4.3,.64,5.7);
  /* plants */
  pl(7.6,.5,1);pl(.4,3.9,.9);
 }
 buildStudio();return g}
function buildStudio(){
 if(studio)scene.remove(studio);const g=studio=new THREE.Group();scene.add(g);dyn=[];const G=S.gear;
 B(g,3.2,.03,3,'#3a2f4a',12.6,.02,2.6);
 const l=G.chair,cc=['#8b6b47','#333a44','#2f6fb5','#a8242c'][l];
 B(g,.5+.05*l,.4+.05*l,.5+.05*l,cc,13.6,.2+.03*l,2.8);if(l){B(g,.5+.05*l,.3+.25*l,.08,cc,13.6,.7+.1*l,2.55);B(g,.08,.4,.08,'#222',13.6,.1,2.8)}if(l==3)B(g,.7,.1,.1,'#e6b422',13.6,1.4,2.55);
 B(g,.45,.04,.45,'#222',12.2,.02,1.5);B(g,.06,1.2,.06,'#222',12.2,.6,1.5);const mc=['#555','#2a2a2e','#aab3bd','#c9a227'][G.mic];B(g,.14+.03*G.mic,.25,.14+.03*G.mic,mc,12.2,1.3,1.5);if(G.mic>=2)B(g,.4,.4,.03,'#111',12.2,1.35,1.75);
 const gc=['#8a6a3a','#c68a3c','#b5482a','#2a2a8a'][G.guitar];B(g,.06,.9,.06,'#222',14.7,.45,1.1);const gt=new THREE.Group();gt.position.set(14.7,.7,1.2);gt.rotation.z=.2;g.add(gt);B(gt,.5,.6,.14,gc,0,-.2,0);B(gt,.12,.8,.08,'#3a2a1a',0,.45,0);B(gt,.2,.15,.1,'#222',0,.9,0);
 dyn.push([11.9,1.2,12.5,1.8],[13.3,2.5,13.9,3.1],[14.4,.8,15.1,1.5]);
 if(G.guitar>=1){B(g,.7,.8,.4,'#222',15.4,.4,2.6);B(g,.5,.5,.02,'#444',15.4,.45,2.82);dyn.push([15,2.4,15.8,2.8])}
 if(G.mic>=2){[10.3,14.2].forEach(x=>{B(g,.4,.6,.35,'#1d1d22',x,.9,.55);B(g,.6,.6,.5,'#333',x,.3,.55)})}
 for(let i=0;i<G.promo;i++)B(g,.8,1.1,.05,['#c8506a','#e6b422','#4aa3df'][i],10.6+i*1.5,1.8,.04);
 if(G.promo>=3)B(g,3,.5,.05,'#2fe68a',13.8,1.2,.04);const K=G.keys,D=G.drums,Bo=G.booth,Dk=G.decks;if(K){B(g,1.1+.15*K,.08,.5,'#222',10.2,.8,4.8);B(g,1+.15*K,.04,.38,'#eee',10.2,.86,4.84);B(g,.08,.8,.08,'#333',9.6,.4,4.8);B(g,.08,.8,.08,'#333',10.8,.4,4.8);if(K>=2)B(g,1.2,.3,.3,'#111',10.2,1.05,4.6);dyn.push([9.6,4.55,10.9,5.05])}if(D){B(g,.6,.5,.4,['#555','#a02020','#2a4a8a','#222'][D],10.8,.35,2.3);B(g,.45,.15,.45,'#ddd',10.2,.75,2);if(D>=2)B(g,.5,.03,.5,'#e6b422',11.5,1.2,2.1);if(D>=3)B(g,.4,.2,.4,'#ddd',11.3,.7,1.8);dyn.push([10.1,1.9,11.5,2.7])}if(Dk){B(g,1.4,.15,.7,'#222',13.8,.75,4.9);B(g,.4,.05,.4,'#ccc',13.4,.84,4.9);B(g,.4,.05,.4,'#ccc',14.2,.84,4.9);B(g,.7,.75,.5,'#333',13.8,.37,4.9);dyn.push([13.1,4.5,14.5,5.3])}for(let i=0;i<Bo;i++)B(g,.9,1.4,.08,['#3a4a5a','#5a3a6a','#2a6a5a'][i],15.2-i*1.1,1.3,.06)}
/* out of energy (less than one recording) lets you sleep before night */
function bedTired(){return S.energy<(typeof REC_E!='undefined'?REC_E:15)}
const INT=[{x:2.9,z:2.4,r:1.4,get l(){return S.t>=300?'Sleep':bedTired()?'Out of energy, sleep now':'Sleep (night only)'},a:()=>S.t<300&&!bedTired()?say('You can only sleep at night, or early once you are out of energy. Wait for dusk.'):sleepQ()},{x:6,z:1.9,r:1.3,l:'Use laptop',a:()=>openPC()},
{x:12.2,z:2.2,r:1.2,l:'Record a song',a:()=>recMenu()},{x:14.2,z:1.9,r:1.2,l:'Play guitar',a:()=>say(['You strum a few chords. Not bad.','A string buzzes. Time for an upgrade?','You noodle a riff and hum along.'][RI(0,2)])},
{x:13.6,z:3.4,r:1,l:'Sit and think',a:()=>say(['You sit and brainstorm lyrics…','"Everyone starts with nothing." A good line to remember.'][RI(0,1)])}];

