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
 B(g,2,.4,3.1,'#6b4a2e',1.4,.2,1.85);B(g,1.8,.25,2.8,'#e8e4da',1.4,.52,1.85);B(g,1.8,.28,1.7,'#3b6fb5',1.4,.58,2.4);B(g,1.2,.15,.5,'#fff',1.4,.75,.75);col(.3,.3,2.5,3.4);
 B(g,.6,.6,.6,'#6b4a2e',3,.3,.6);B(g,.2,.3,.2,'*ffd27a',3,.75,.6);const l1=new THREE.PointLight(0xffc080,.5,9);l1.position.set(3,1.5,1);g.add(l1);lamps.push(l1);col(2.7,.3,3.3,.9);
 B(g,2.8,.1,1,'#8a5a36',6,.85,.7);B(g,.1,.85,.9,'#6b4a2e',4.7,.42,.7);B(g,.1,.85,.9,'#6b4a2e',7.3,.42,.7);B(g,.9,.6,.08,'#111',6,1.3,.45);B(g,.8,.5,.02,'*2fe68a',6,1.3,.5);B(g,.6,.04,.25,'#ccc',6,.92,.95);B(g,.3,.7,.5,'#222',7,1.2,.6);B(g,.5,.1,.5,'#333',6,.5,1.7);B(g,.5,.4,.08,'#333',6,.8,1.95);col(4.6,.2,7.4,1.2);
 B(g,2.6,.03,1.8,'#7c3f58',4.5,.02,4);B(g,.9,1.2,.05,'#c8506a',3.8,1.9,.04);B(g,.7,.2,.06,'#ffd27a',3.8,2.2,.05);B(g,1.6,1.2,.05,'*8fd0ff',1.2,1.8,.02);
 buildStudio();return g}
function buildStudio(){
 if(studio)scene.remove(studio);const g=studio=new THREE.Group();scene.add(g);dyn=[];const G=S.gear;
 B(g,3.2,.03,3,'#3a2f4a',12.6,.02,2.6);B(g,1.6,1.2,.05,'*8fd0ff',9.4,1.8,.02);
 const l=G.chair,cc=['#8b6b47','#333a44','#2f6fb5','#a8242c'][l];
 B(g,.5+.05*l,.4+.05*l,.5+.05*l,cc,13.6,.2+.03*l,2.8);if(l){B(g,.5+.05*l,.3+.25*l,.08,cc,13.6,.7+.1*l,2.55);B(g,.08,.4,.08,'#222',13.6,.1,2.8)}if(l==3)B(g,.7,.1,.1,'#e6b422',13.6,1.4,2.55);
 B(g,.45,.04,.45,'#222',12.2,.02,1.5);B(g,.06,1.2,.06,'#222',12.2,.6,1.5);const mc=['#555','#2a2a2e','#aab3bd','#c9a227'][G.mic];B(g,.14+.03*G.mic,.25,.14+.03*G.mic,mc,12.2,1.3,1.5);if(G.mic>=2)B(g,.4,.4,.03,'#111',12.2,1.35,1.75);
 const gc=['#8a6a3a','#c68a3c','#b5482a','#2a2a8a'][G.guitar];B(g,.06,.9,.06,'#222',14.7,.45,1.1);const gt=new THREE.Group();gt.position.set(14.7,.7,1.2);gt.rotation.z=.2;g.add(gt);B(gt,.5,.6,.14,gc,0,-.2,0);B(gt,.12,.8,.08,'#3a2a1a',0,.45,0);B(gt,.2,.15,.1,'#222',0,.9,0);
 dyn.push([11.9,1.2,12.5,1.8],[13.3,2.5,13.9,3.1],[14.4,.8,15.1,1.5]);
 if(G.guitar>=1){B(g,.7,.8,.4,'#222',15.4,.4,2.6);B(g,.5,.5,.02,'#444',15.4,.45,2.82);dyn.push([15,2.4,15.8,2.8])}
 if(G.mic>=2){[10.3,14.2].forEach(x=>{B(g,.4,.6,.35,'#1d1d22',x,.9,.55);B(g,.6,.6,.5,'#333',x,.3,.55)})}
 for(let i=0;i<G.promo;i++)B(g,.8,1.1,.05,['#c8506a','#e6b422','#4aa3df'][i],10.6+i*1.5,1.8,.04);
 if(G.promo>=3)B(g,3,.5,.05,'#2fe68a',13.8,1.2,.04);const K=G.keys,D=G.drums,Bo=G.booth,Dk=G.decks;if(K){B(g,1.1+.15*K,.08,.5,'#222',10.2,.8,4.8);B(g,1+.15*K,.04,.38,'#eee',10.2,.86,4.84);B(g,.08,.8,.08,'#333',9.6,.4,4.8);B(g,.08,.8,.08,'#333',10.8,.4,4.8);if(K>=2)B(g,1.2,.3,.3,'#111',10.2,1.05,4.6);dyn.push([9.6,4.55,10.9,5.05])}if(D){B(g,.6,.5,.4,['#555','#a02020','#2a4a8a','#222'][D],10.8,.35,2.3);B(g,.45,.15,.45,'#ddd',10.2,.75,2);if(D>=2)B(g,.5,.03,.5,'#e6b422',11.5,1.2,2.1);if(D>=3)B(g,.4,.2,.4,'#ddd',11.3,.7,1.8);dyn.push([10.1,1.9,11.5,2.7])}if(Dk){B(g,1.4,.15,.7,'#222',13.8,.75,4.9);B(g,.4,.05,.4,'#ccc',13.4,.84,4.9);B(g,.4,.05,.4,'#ccc',14.2,.84,4.9);B(g,.7,.75,.5,'#333',13.8,.37,4.9);dyn.push([13.1,4.5,14.5,5.3])}for(let i=0;i<Bo;i++)B(g,.9,1.4,.08,['#3a4a5a','#5a3a6a','#2a6a5a'][i],15.2-i*1.1,1.3,.06)}
const INT=[{x:2.9,z:2.4,r:1.4,l:'Sleep (night only)',a:()=>S.t<300?say('You can only sleep at night. Wait for dusk.'):sleepQ()},{x:6,z:1.9,r:1.3,l:'Use laptop',a:()=>openPC()},
{x:12.2,z:2.2,r:1.2,l:'Record a song',a:()=>recMenu()},{x:14.2,z:1.9,r:1.2,l:'Play guitar',a:()=>say(['You strum a few chords. Not bad.','A string buzzes. Time for an upgrade?','You noodle a riff and hum along.'][RI(0,2)])},
{x:13.6,z:3.4,r:1,l:'Sit and think',a:()=>say(['You sit and brainstorm lyrics…','"Everyone starts with nothing." A good mentor-line to remember.'][RI(0,1)])}];

