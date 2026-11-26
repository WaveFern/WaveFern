/* WaveFern dev: SANTA'S PRESENT PRIZES. Only runs on /dev/ (window.FW_DEV), loads right before dev-lodge-v1.js. Add ?nolodge to skip it.

   The items that only come out of Santa's presents in Santa's Lodge (dev-lodge-v1.js). Nothing here is sold anywhere:
   the cars and the pet are flagged xm like the advent ones, so the shops, the pet menu and the garage paint shop leave them out.
   LEGENDARY  Sprocket Rocket (the elves' own race car), Gingerbread Cruiser (a car baked from gingerbread), Pip the Elf (a pet),
              The North Pole, Santa's Golden Throne
   EPIC       Reindeer Rocking Horse, Christmas Carousel, Elf Toy Workbench, Toy Soldier Drummer
   RARE       Gumdrop Lamp, Peppermint Stool, Cookie Jar, Jingle Bell Wreath, Candy Cane Fence
   Cars are one merged mesh each on the shared car materials (same trick as 39-car-models.js carList). The elf is a rigged pet on the
   58-pets.js rig (ptGeo parts, petAnim) with his own walk, arm swing, hat sway, wave and twirl. Furniture is box lists in F (hidden from
   Amazoom like the advent furniture); the carousel and rocking horse move through fxAdd.
   Saves: cars and the pet are indices in CARS / PETS (appended after the advent ones), furniture keys lx_* in S.inv. Never reorder.
   HOOK window.FW_LODGE_ITEMS = {list, byTier(t), CAR1, CAR2, ELF}. */
(function(){
if(!window.FW_DEV||/[?&]nolodge/.test(location.search))return;
if(typeof THREE=='undefined'||typeof F=='undefined'||typeof CARS=='undefined'||typeof PETS=='undefined'||typeof ptGeo!='function'||typeof carList!='function')return;
const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('lodge items '+t,e)}}};
const RED='#d23a3a',WHT='#f6f6f6',GRN='#2f9e4f',DKG='#1f6e36',GOLD='#e8b923',BRN='#8d5a2b',INK='#1a1a1a';

/* ============================================================ CARS ============================================================ */
/* build one merged geometry on the car materials: group 0 glossy paint, 1 matte, 2 unlit lights */
const EU=new THREE.Euler(),MX=new THREE.Matrix4();
function geoBuild(fn){const G=[[],[],[]],add=(g,c,grp)=>G[grp||0].push([g,c]);
 const rot=(g,rx,ry,rz)=>{if(rx||ry||rz)g.applyMatrix4(MX.makeRotationFromEuler(EU.set(rx||0,ry||0,rz||0)))};
 const box=(w,h,d,x,y,z,c,grp,rx,ry,rz)=>{const g=new THREE.BoxGeometry(w,h,d);rot(g,rx,ry,rz);g.translate(x,y,z);add(g,c,grp)};
 /* a side profile [[z,y],...] extruded across from x0 to x1 */
 const ext=(pts,x0,x1,c,grp)=>{const g=new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(p=>new THREE.Vector2(-p[0],p[1]))),{depth:x1-x0,bevelEnabled:false,curveSegments:5});g.rotateY(Math.PI/2);g.translate(x0,0,0);add(g,c,grp)};
 const cyl=(r0,r1,h,x,y,z,c,grp,seg,rx,ry,rz)=>{const g=new THREE.CylinderGeometry(r0,r1,h,seg||12);rot(g,rx,ry,rz);g.translate(x,y,z);add(g,c,grp)};
 const wheel=(r,w,x,y,z,c,grp,seg)=>cyl(r,r,w,x,y,z,c,grp,seg||14,0,0,Math.PI/2);
 const sph=(r,x,y,z,c,grp,ws,hs)=>{const g=new THREE.SphereGeometry(r,ws||10,hs||7);g.translate(x,y,z);add(g,c,grp)};
 const cone=(r,h,x,y,z,c,grp,rx,ry,rz,seg)=>{const g=new THREE.ConeGeometry(r,h,seg||10);rot(g,rx,ry,rz);g.translate(x,y,z);add(g,c,grp)};
 fn({box,ext,cyl,wheel,sph,cone});
 const parts=[],groups=[];let n=0;G.forEach((Lp,gi)=>{const s0=n;Lp.forEach(([g,c])=>{const q=g.index?g.toNonIndexed():g,cnt=q.attributes.position.count;parts.push([q,new THREE.Color(c),cnt]);if(q!==g)g.dispose();n+=cnt});groups.push([s0,n-s0,gi])});
 const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
 parts.forEach(([q,cc,cnt])=>{P.set(q.attributes.position.array,o*3);N.set(q.attributes.normal.array,o*3);for(let i=0;i<cnt;i++){const j=(o+i)*3;C[j]=cc.r;C[j+1]=cc.g;C[j+2]=cc.b}o+=cnt;q.dispose()});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('color',new THREE.BufferAttribute(C,3));
 groups.forEach(([s0,c,gi])=>{if(c)geo.addGroup(s0,c,gi)});geo.computeBoundingBox();geo.computeBoundingSphere();return geo}

/* SPROCKET ROCKET: the elves' race car. A low emerald wedge whose nose curls up like an elf's shoe with a bell on the toe, candy-stripe
   racing stripes, pointy elf-ear mirrors, a bubble canopy, an elf-hat rear wing with a pompom, jingle-bell exhausts, gold wheels and a
   green underglow. Same size as the other cars (about 2.5 long, 1.1 wide; the game scales cars by 1.5). */
function rocketGeo(){return geoBuild(({box,ext,cyl,wheel,sph,cone})=>{
 const G='#1c9a4c',GD='#127a3a',GL='#3fcf74',W=1.08,yb=.15,r=.2,fo=.8,ro=-.8,ra=r+.04;
 const arch=zc=>{const a=[];for(let i=0;i<=8;i++){const t=i/8*Math.PI;a.push([zc+Math.cos(t)*ra,yb+Math.sin(t)*ra])}return a};
 /* body: tall at the back, sweeping down to a low nose */
 ext([[-1.25,yb+.05],[-1.25,.56],[-1.18,.6],[-.55,.6],[.2,.5],[.95,.36],[1.2,.3],[1.26,.24],[1.26,yb+.06],[1.2,yb],...arch(fo),...arch(ro),[-1.19,yb]],-W/2,W/2,G);
 /* side pods with a gold trim line and darker lower skirt */
 [-1,1].forEach(s=>{box(.06,.03,2.1,s*(W/2+.005),.42,0,GOLD,0);box(.04,.08,1.0,s*(W/2+.01),yb+.08,0,GD,1)});
 /* the curled elf-shoe toe on the nose, with a bell */
 box(.5,.09,.26,0,.3,1.33,G,0,-.25);box(.4,.09,.18,0,.38,1.45,G,0,-.75);box(.3,.09,.14,0,.5,1.5,G,0,-1.25);box(.22,.08,.12,0,.6,1.47,G,0,-1.9);
 sph(.075,0,.66,1.4,GOLD,0);box(.09,.015,.02,0,.61,1.45,'#7a5a10',1);
 /* candy-cane racing stripes from nose to tail */
 for(let i=0;i<12;i++){const z=-1.1+i*.19,y=z<-.55?.605:z<.2?.6-(z+.55)*.135:.5-(z-.2)*.187;box(.16,.012,.17,0,y+.004,z,i%2?WHT:RED,0,-(z<-.55?0:z<.2?.13:.18))}
 /* the cockpit rim (the glass bubble is added in carList) */
 cyl(.4,.4,.05,0,.57,-.25,GOLD,0,16);
 /* elf-ear mirrors */
 [-1,1].forEach(s=>{cone(.05,.3,s*(W/2+.12),.66,.12,GL,0,0,0,-s*1.15,6);box(.03,.03,.06,s*(W/2+.02),.6,.12,GD,1)});
 /* rear wing: an elf hat lying back on two struts, with a white fur band and a pompom */
 [-1,1].forEach(s=>box(.05,.22,.06,s*.32,.7,-1.05,INK,1));
 box(.9,.08,.22,0,.83,-1.08,WHT,0);cone(.26,.6,0,.9,-1.3,RED,0,-1.25,0,0,12);cone(.13,.26,0,.97,-1.6,RED,0,-1.75,0,0,10);sph(.08,0,.9,-1.72,WHT,0);
 /* jingle-bell exhausts */
 [-1,1].forEach(s=>{sph(.09,s*.3,.25,-1.3,GOLD,0);box(.12,.018,.02,s*.3,.22,-1.385,'#5a4008',1);box(.025,.025,.025,s*.3,.18,-1.37,INK,1)});
 /* wheels: black tyres, gold rims, red hubs; a fat rear pair */
 [[fo,.17],[ro,.22]].forEach(([z,w])=>[-1,1].forEach(s=>{const x=s*(W/2-.06);wheel(r,w,x,r,z,'#141416',1,16);wheel(r*.66,w+.01,x,r,z,GOLD,0,10);wheel(r*.26,w+.02,x,r,z,RED,0,8);
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2;box(w+.015,.03,r*.9,x,r,z,'#b8901c',0,a)}}));
 /* lights: gold headlamps, green running strip, candy tail lights, underglow */
 [-1,1].forEach(s=>{box(.2,.06,.03,s*.32,.27,1.265,'#fff3c0',2);box(.12,.05,.03,s*.3,.55,-1.255,'#ff3b3b',2);box(.06,.05,.03,s*.42,.55,-1.255,WHT,2)});
 box(.5,.025,.02,0,.21,1.265,'#7dffb0',2);
 box(W*.7,.015,2.0,0,.06,0,'#4dff9a',2);
 /* little number plate and a wreath on the bonnet */
 box(.3,.08,.012,0,.2,1.27,WHT,1);box(.3,.08,.012,0,.4,-1.255,WHT,1);
 cyl(.11,.11,.03,0,.47,.7,DKG,1,12,-.5);sph(.035,.06,.5,.75,RED,0);sph(.035,-.05,.5,.76,RED,0);
 /* the seat inside the canopy */
 box(.4,.14,.36,0,.62,-.3,'#7a1a2a',1);box(.4,.26,.08,0,.72,-.5,'#7a1a2a',1);
})}
/* the canopy is a see-through glass dome added on top of the car mesh (carList below) */

/* GINGERBREAD CRUISER: a big round retro cruiser baked from gingerbread. Icing drips along the roof and white squiggles on the body,
   gumdrop headlights, candy-cane bumpers, peppermint wheels, sprinkles on the roof, a gingerbread-man badge and a cherry on top. */
function gingerGeo(){return geoBuild(({box,ext,cyl,wheel,sph,cone})=>{
 const C='#b86b30',CD='#8f4f1f',IC='#fbf7f0',W=1.12,yb=.18,r=.21,fo=.82,ro=-.82,ra=r+.05;
 const arch=zc=>{const a=[];for(let i=0;i<=8;i++){const t=i/8*Math.PI;a.push([zc+Math.cos(t)*ra,yb+Math.sin(t)*ra])}return a};
 /* rounded body with a long bonnet and a round boot */
 ext([[-1.28,yb+.08],[-1.3,.5],[-1.24,.6],[-1.1,.66],[-.7,.68],[.55,.68],[1.05,.6],[1.24,.52],[1.3,.4],[1.28,yb+.08],[1.2,yb],...arch(fo),...arch(ro),[-1.2,yb]],-W/2,W/2,C);
 /* cabin: a rounded roof */
 ext([[-.72,.67],[-.62,.98],[-.5,1.06],[.25,1.06],[.38,.98],[.52,.67]],-W*.42,W*.42,C);
 /* sugar-glass windows */
 ext([[-.66,.72],[-.58,.96],[-.48,1.02],[.22,1.02],[.33,.96],[.46,.72]],-W*.42-.012,W*.42+.012,'#bfe6f2');
 box(W*.84+.03,.32,.06,0,.86,-.14,C,0);
 /* icing: a thick frosting cap on the roof with drips, and squiggle lines along the body */
 box(W*.86,.05,.84,0,1.08,-.12,IC,1);
 for(let i=0;i<9;i++){const z=-.5+i*.095,h=.05+((i*37)%5)*.02;[-1,1].forEach(s=>box(.03,h,.05,s*(W*.43),1.06-h/2,z,IC,1))}
 [.08,-.32].forEach(dz=>[-1,1].forEach(s=>box(.05,.04+.03*Math.abs(dz),.06,s*(W*.43),1.03,dz,IC,1)));
 [-1,1].forEach(s=>{for(let i=0;i<14;i++){const z=-1.15+i*.18;box(.02,.035,.1,s*(W/2+.006),.5+(i%2?.03:-.01),z,IC,1,i%2?.5:-.5)}});
 for(let i=0;i<7;i++)box(.1,.035,.02,-W/2+.15+i*.13,.54,1.25+(i%2?.02:0),IC,1,0,0,i%2?.5:-.5);
 /* sprinkles on the roof and a cherry on top */
 const SP=['#ff4b6e','#46e083','#3fa9ff','#ffd23d','#b57cff'];for(let i=0;i<22;i++){const x=((i*53)%17/17-.5)*W*.72,z=((i*29)%19/19-.5)*.74-.12;box(.06,.02,.02,x,1.115,z,SP[i%5],0,0,(i*1.3)%3)}
 sph(.07,0,1.18,-.12,'#d0142c',0);box(.012,.1,.012,.02,1.27,-.13,'#3d6b2a',1,0,0,.3);
 /* gumdrop headlights and tail lights */
 [-1,1].forEach(s=>{
  box(.16,.12,.05,s*.34,.42,1.29,s<0?'#ffe066':'#ff8fb1',2);box(.12,.06,.05,s*.34,.5,1.29,'#fff6c8',2);
  box(.12,.1,.04,s*.38,.46,-1.3,'#ff3b3b',2)});
 /* candy-cane bumpers front and back, with hooks curling up at the corners */
 [1.33,-1.33].forEach(z=>{for(let i=0;i<8;i++)box(.13,.07,.07,-W/2+.07+i*.138,.26,z,i%2?RED:WHT,0);
  [-1,1].forEach(s=>{box(.07,.18,.07,s*(W/2+.02),.36,z,RED,0);box(.07,.07,.12,s*(W/2+.02),.48,z-Math.sign(z)*.04,WHT,0)})});
 /* peppermint wheels: white tyres with red swirl wedges and a gumdrop hub */
 [fo,ro].forEach(z=>[-1,1].forEach(s=>{const x=s*(W/2-.07);wheel(r,.16,x,r,z,'#efe9e2',1,16);wheel(r*.78,.17,x,r,z,WHT,0,16);
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.2;box(.175,.05,r*.7,x,r,z,RED,0,a)}wheel(r*.24,.18,x,r,z,'#46e083',0,8)}));
 /* gingerbread-man badge on the bonnet: head, body, arms, legs, two buttons */
 const gx=0,gy=.705,gz=.85;box(.1,.02,.1,gx,gy,gz+.12,CD,1);box(.1,.02,.13,gx,gy,gz,CD,1);box(.22,.02,.05,gx,gy,gz+.03,CD,1);box(.05,.02,.1,gx-.035,gy,gz-.1,CD,1);box(.05,.02,.1,gx+.035,gy,gz-.1,CD,1);
 sph(.014,gx,gy+.015,gz+.02,RED,0,6,4);sph(.014,gx,gy+.015,gz-.03,'#46e083',0,6,4);
 /* a dark chocolate grille and plates */
 box(.46,.14,.02,0,.34,1.305,'#3a1e0c',1);for(let i=0;i<4;i++)box(.44,.012,.025,0,.29+i*.035,1.31,'#5a3014',1);
 box(.3,.08,.012,0,.22,1.335,WHT,1);box(.3,.08,.012,0,.3,-1.335,WHT,1);
 /* door seams in darker baked edges */
 [-1,1].forEach(s=>{box(.012,.3,.012,s*(W/2+.004),.5,.32,CD,1);box(.012,.3,.012,s*(W/2+.004),.5,-.5,CD,1)});
})}

const CAR1=CARS.length;CARS.push({n:'Sprocket Rocket',p:250000,c:'#1c9a4c',top:40,mph:120,xm:1,lodge:1});
const CAR2=CARS.length;CARS.push({n:'Gingerbread Cruiser',p:120000,c:'#b86b30',top:34,mph:95,xm:1,lodge:1});
const CG={},glassM=new THREE.MeshPhongMaterial({color:0xa8e6ff,transparent:true,opacity:.45,shininess:120,specular:0xffffff});
const canopy=(()=>{const g=new THREE.SphereGeometry(.38,16,8,0,Math.PI*2,0,Math.PI/2);g.scale(1,.6,1.25);g.translate(0,.585,-.25);return g})();
const MYC={[CAR1]:rocketGeo,[CAR2]:gingerGeo};
{const c0=carList;carList=function(i,cc,fixed){if(MYC[i]&&cc===undefined){const S={W:1.1,L:2.5,h:.5},a=[[S.W,S.h,S.L,CARS[i].c,0,.4,0]];
  a.forEach=function(cb){const m=cb([1,1,1,'#fff',0,0,0]);if(m&&m.isMesh){m.geometry=CG[i]||(CG[i]=MYC[i]());m.material=carMats();m.scale.set(.9,1,1);
   if(i===CAR1){const gl=new THREE.Mesh(canopy,glassM);gl.userData.noCol=1;m.add(gl)}}};return a}
 return c0.apply(this,arguments)}}

/* ============================================================ PIP THE ELF (pet) ============================================================ */
const ELF=PETS.length;PETS.push(['Pip the Elf',0]);PETC.push('#2f9e4f');
if(window.PET_PERK)window.PET_PERK.push(['Workshop magic','One of Santa’s own elves. Adds +1 song quality like every pet.']);
function elfSpec(){const S={},part=(n,par,p,f,eye)=>{const L=[];f(L);S[n]={n,par,p,L,eye}};
 const SK='#f4c8a6',SK2='#e9ad88',CH='#f29a9a',HR='#9a5528',TU=GRN,TD=DKG,SH='#2c8a46';
 [-1,1].forEach((s,i)=>part('leg'+i,'R',[s*.075,.36,0],L=>{const x=s*.075;
  for(let j=0;j<6;j++)pbx(L,j%2?WHT:RED,.086,.052,.086,x,.085+j*.05,0);
  /* curly-toed elf shoe with a bell */
  pbx(L,SH,.1,.075,.17,x,.04,.025);pbx(L,SH,.075,.06,.07,x,.075,.125,-.55);pbx(L,SH,.055,.05,.05,x,.115,.16,-1.1);pbx(L,SH,.04,.04,.04,x,.155,.15,-1.7);
  pbx(L,GOLD,.036,.036,.036,x,.185,.13);pbx(L,'#1d5a2e',.105,.02,.175,x,.005,.025)}));
 part('body','R',[0,.36,0],L=>{
  ptp(L,TU,.3,.27,.22,0,.53,0,.25,.19);ptp(L,TU,.36,.07,.27,0,.385,0,.3,.23);
  /* zig-zag gold hem, front and back */
  for(let j=-3;j<=3;j++){pbx(L,GOLD,.05,.05,.015,j*.05,.36,.13,0,0,.785);pbx(L,GOLD,.05,.05,.015,j*.05,.36,-.13,0,0,.785)}
  [-1,1].forEach(s=>{for(let j=-2;j<=2;j++)pbx(L,GOLD,.015,.05,.05,s*.175,.36,j*.05,.785,0,0)});
  pbx(L,'#2a1a10',.31,.05,.23,0,.45,0);pbx(L,GOLD,.075,.06,.02,0,.45,.118);pbx(L,'#2a1a10',.04,.03,.022,0,.45,.122);
  [.53,.6].forEach(y=>pbx(L,GOLD,.026,.026,.02,0,y,.104));
  /* pointed red collar */
  [-1,0,1].forEach(j=>pbx(L,RED,.075,.075,.02,j*.075,.655,.095,0,0,.785));pbx(L,RED,.27,.04,.2,0,.665,0)});
 [-1,1].forEach((s,i)=>part('arm'+i,'body',[s*.155,.63,0],L=>{
  pseg(L,TU,[s*.155,.64,0],[s*.2,.47,.015],.08,.07);pbx(L,WHT,.085,.04,.085,s*.2,.465,.015);
  pbx(L,SK,.065,.065,.065,s*.205,.42,.02);pbx(L,SK2,.025,.035,.03,s*.175,.43,.045)}));
 part('head','R',[0,.67,0],L=>{
  pbx(L,SK,.08,.05,.08,0,.69,0);
  pbx(L,SK,.26,.23,.22,0,.83,0);pbx(L,SK,.22,.05,.19,0,.705,.005);
  pbx(L,SK2,.05,.05,.05,0,.81,.125);
  [-1,1].forEach(s=>{pbx(L,CH,.05,.032,.01,s*.085,.78,.112);pbx(L,'#c98a62',.012,.012,.008,s*.07,.795,.116);pbx(L,'#c98a62',.012,.012,.008,s*.095,.79,.116)});
  pbx(L,'#7a2e2e',.08,.014,.01,0,.75,.112);[-1,1].forEach(s=>pbx(L,'#7a2e2e',.018,.014,.01,s*.046,.757,.112));pbx(L,'#ffffff',.04,.01,.008,0,.744,.113);
  pbx(L,HR,.27,.05,.05,0,.935,.09);[-1,1].forEach(s=>{pbx(L,HR,.03,.13,.19,s*.136,.87,-.01);pbx(L,HR,.06,.016,.01,s*.068,.885,.112,0,0,-s*.18)});pbx(L,HR,.27,.17,.04,0,.86,-.11)});
 part('eyes','head',[0,.84,.112],L=>[-1,1].forEach(s=>{pbx(L,'#ffffff',.062,.068,.008,s*.068,.838,.112);pbx(L,'#2a1a14',.042,.052,.01,s*.07,.834,.116);pbx(L,'#5a3a1a',.024,.03,.011,s*.07,.832,.118);pbx(L,'#ffffff',.015,.015,.012,s*.07+s*.012,.848,.122)}),1);
 [-1,1].forEach((s,i)=>part('ear'+i,'head',[s*.13,.83,0],L=>{pseg(L,SK,[s*.125,.82,0],[s*.27,.92,-.03],.075,.012,.08,.015);pseg(L,CH,[s*.135,.825,.03],[s*.245,.9,.0],.035,.006,.012,.004)}));
 part('hat0','head',[0,.94,-.01],L=>{pbx(L,WHT,.29,.06,.25,0,.955,-.005);ptp(L,RED,.26,.15,.22,0,1.06,-.02,.17,.14,0,-.04)});
 part('hat1','hat0',[0,1.13,-.04],L=>{ptp(L,RED,.17,.13,.14,0,1.19,-.05,.09,.08,0,-.06);pseg(L,RED,[0,1.25,-.08],[0,1.29,-.2],.09,.05,.08,.045)});
 part('hat2','hat1',[0,1.29,-.2],L=>{pseg(L,RED,[0,1.29,-.2],[0,1.25,-.28],.05,.035);pbx(L,WHT,.095,.095,.095,0,1.24,-.31);pbx(L,GOLD,.045,.045,.045,0,1.19,-.31)});
 /* a bit smaller than full size so he stands about knee high to you, like the other pets */
 const K=.88;for(const n in S){const q=S[n];q.p=q.p.map(v=>v*K);q.L.forEach(r=>{for(let j=1;j<=10;j++)r[j]*=K})}
 return S}
{const g0=ptSpecGet;ptSpecGet=function(k){if(k!==ELF)return g0(k);if(PTSP[k])return PTSP[k];const S=elfSpec();for(const n in S){const s=S[n];s.L=s.L.filter(r=>r[4]>0);s.geo=ptGeo(s.L,s.p)}return PTSP[k]=S}}
/* his animation on top of the shared one: a skipping walk with arm swing, a hat that trails and flops, and when he stands still he
   looks around, waves at you now and then, and sometimes does a happy little jump and twirl */
{const a0=petAnim;petAnim=function(g,dt){a0.apply(this,arguments);const r=g.userData.pr;if(!r||r.k!==ELF)return;
 const P=r.P,t=r.t,m=r.mv,s=Math.sin(r.ph),c=Math.cos(r.ph),q=1-m;
 if(r.wv==null){r.wv=0;r.wt=3+Math.random()*4;r.tw=0;r.tt=9+Math.random()*6}
 /* idle moves: a wave or a twirl, only when standing */
 if(m<.15){r.wt-=dt;r.tt-=dt;if(r.wt<0&&r.wv<=0&&r.tw<=0){r.wv=1.8;r.wt=5+Math.random()*6}if(r.tt<0&&r.wv<=0&&r.tw<=0){r.tw=.9;r.tt=10+Math.random()*8}}else{r.wv=Math.max(0,r.wv-dt*3);r.tw=0}
 if(r.wv>0)r.wv-=dt;if(r.tw>0)r.tw-=dt;
 const wv=r.wv>0?Math.min(1,Math.min(r.wv,1.8-r.wv)*4):0,tw=r.tw>0?1-r.tw/.9:0;
 /* legs: a light skipping stride */
 if(P.leg0)P.leg0.rotation.x=s*.75*m;if(P.leg1)P.leg1.rotation.x=-s*.75*m;
 /* arms swing against the legs; at rest they hang a little out, breathing */
 const br=Math.sin(t*2.6+r.sd);
 if(P.arm0){P.arm0.rotation.x=-s*.7*m+br*.03*q;P.arm0.rotation.z=-.12-br*.02*q}
 if(P.arm1){P.arm1.rotation.x=s*.7*m+br*.03*q-wv*.3;P.arm1.rotation.z=.12+br*.02*q+wv*(2.5+Math.sin(t*16)*.35)}
 /* body: a bouncy skip, a little lean into the walk; the twirl is a hop with a full spin */
 const hop=tw>0?Math.sin(tw*Math.PI)*.14:0;
 r.R.position.y=Math.abs(c)*.05*m+hop;r.R.rotation.x=.07*m;r.R.rotation.z=s*.05*m+wv*.04*Math.sin(t*8);r.R.rotation.y=tw>0?(1-Math.cos(tw*Math.PI))*Math.PI:0;
 if(P.head&&wv>0){P.head.rotation.z=.15*wv;P.head.rotation.y=P.head.rotation.y*(1-wv)}
 /* hat: trails behind when he runs, swings with each skip and wobbles at the tip */
 if(P.hat0){P.hat0.rotation.x=-.18*m+Math.sin(t*1.9+r.sd)*.04;P.hat0.rotation.z=s*.06*m}
 if(P.hat1){P.hat1.rotation.x=-.35*m+Math.sin(t*1.9+r.sd-.7)*.1-c*.12*m+hop*1.5;P.hat1.rotation.z=Math.sin(t*1.3+r.sd)*.12+s*.1*m}
 if(P.hat2){P.hat2.rotation.x=Math.sin(t*2.4+r.sd-1.3)*.2-c*.25*m+hop*2;P.hat2.rotation.z=Math.sin(t*1.7)*.15}}}

/* ============================================================ FURNITURE ============================================================ */
const defF=(k,n,w,d,b,fx)=>{Object.defineProperty(F,k,{value:{n,p:0,w,d,b,fx,xm:1,lodge:1},enumerable:false,writable:true,configurable:true})};
/* move the item's meshes that pass test(mesh) into a pivot at (x,y,z), so fx can turn them */
const pivot=(g,x,y,z,test)=>{const pv=new THREE.Group();pv.position.set(x,y,z);g.children.slice().forEach(c=>{if(c.isMesh&&test(c)){g.remove(c);c.position.x-=x;c.position.y-=y;c.position.z-=z;pv.add(c)}});g.add(pv);return pv};
const fxA=(g,f)=>{if(typeof fxAdd=='function')fxAdd(g,f)};
/* ---- RARE ---- */
/* Gumdrop Lamp: a candy-striped post with a glowing gumdrop shade */
{const b=[[.44,.06,.44,'#f4f4f4',0,.03,0],[.34,.06,.34,RED,0,.09,0]];for(let i=0;i<10;i++)b.push([.08,.12,.08,i%2?WHT:RED,0,.18+i*.12,0]);
 b.push([.5,.06,.5,'#2ecc71',0,1.4,0],[.46,.16,.46,'*7dffb0',0,1.5,0],[.36,.12,.36,'*a8ffcb',0,1.64,0],[.24,.08,.24,'*d8ffe6',0,1.74,0],[.1,.06,.1,'#f4f4f4',0,1.8,0]);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;b.push([.05,.05,.05,'#fff7c8',Math.cos(a)*.24,1.42,Math.sin(a)*.24])}
 defF('lx_gumlamp','Gumdrop Lamp',.6,.6,b)}
/* Peppermint Stool: a round red-and-white swirl seat on short candy legs */
{const b=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;b.push([.18,.1,.18,i%2?WHT:RED,Math.cos(a)*.17,.48,Math.sin(a)*.17])}b.push([.24,.11,.24,WHT,0,.48,0],[.12,.12,.12,RED,0,.5,0]);
 [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([x,z])=>{for(let j=0;j<4;j++)b.push([.06,.1,.06,j%2?WHT:RED,x*.15,.05+j*.1,z*.15])});
 defF('lx_pepstool','Peppermint Stool',.6,.6,b)}
/* Cookie Jar: a glass jar of cookies with a red lid and a bow */
{const GL='#cfe6ef',b=[[.5,.04,.5,GL,0,.02,0],[.5,.05,.5,GL,0,.5,0],[.44,.04,.44,'#2a3440',0,.5,0]];[[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([x,z])=>b.push([.05,.5,.05,GL,x*.225,.27,z*.225]));
 [-1,1].forEach(s=>{b.push([.5,.06,.02,GL,0,.14,s*.235],[.02,.06,.5,GL,s*.235,.14,0])});
 [[0,.1,0],[-.08,.18,.06],[.09,.2,-.05],[0,.28,.05],[-.06,.36,-.06],[.07,.4,.06]].forEach(([x,y,z],i)=>{b.push([.22,.06,.22,i%2?'#c58a4a':'#a8652f',x,y,z],[.04,.012,.04,'#3a1e0c',x+.04,y+.035,z],[.04,.012,.04,'#3a1e0c',x-.05,y+.035,z+.03])});
 b.push([.54,.08,.54,RED,0,.56,0],[.2,.08,.2,RED,0,.63,0],[.12,.08,.12,GOLD,0,.7,0],[.2,.06,.08,WHT,-.09,.67,0],[.2,.06,.08,WHT,.09,.67,0]);
 defF('lx_cookiejar','Cookie Jar',.6,.6,b)}
/* Jingle Bell Wreath on a stand */
{const b=[[.5,.06,.4,'#5a3a22',0,.03,0],[.08,1.2,.08,'#5a3a22',0,.62,0]];
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;b.push([.16,.16,.12,i%2?'#1f7a3a':'#2a9448',Math.cos(a)*.36,1.4+Math.sin(a)*.36,.06])}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2;b.push([.07,.07,.07,GOLD,Math.cos(a)*.36,1.4+Math.sin(a)*.36,.14])}
 b.push([.26,.12,.06,RED,-.12,1.08,.14],[.26,.12,.06,RED,.12,1.08,.14],[.1,.1,.08,RED,0,1.08,.15],[.06,.24,.04,RED,-.06,.92,.14],[.06,.24,.04,RED,.06,.92,.14],[.12,.12,.12,GOLD,0,.98,.16]);
 defF('lx_bellwreath','Jingle Bell Wreath',.6,.5,b)}
/* Candy Cane Fence: a short white picket fence of candy canes */
{const b=[[2,.06,.12,WHT,0,.25,0],[2,.06,.12,WHT,0,.6,0]];for(let i=0;i<6;i++){const x=-.85+i*.34;for(let j=0;j<5;j++)b.push([.08,.16,.08,j%2?WHT:RED,x,.08+j*.16,0]);b.push([.08,.08,.2,RED,x,.84,.06],[.08,.14,.08,WHT,x,.76,.14])}
 defF('lx_fence','Candy Cane Fence',2.1,.4,b)}
/* ---- EPIC ---- */
/* Reindeer Rocking Horse: it rocks by itself */
{const D='#a0673a',L='#ecdcc0',b=[];
 for(let i=0;i<9;i++){const a=(i-4)/4*.6,x=0,z=Math.sin(a)*.8,y=.1+(1-Math.cos(a))*.8;b.push([.06,.06,.22,'#c0392b',-.24,y,z],[.06,.06,.22,'#c0392b',.24,y,z])}
 b.push([.06,.3,.06,GOLD,-.24,.3,-.3],[.06,.3,.06,GOLD,.24,.3,-.3],[.06,.3,.06,GOLD,-.24,.3,.3],[.06,.3,.06,GOLD,.24,.3,.3],[.54,.06,.7,'#c0392b',0,.46,0]);
 b.push([.36,.3,.74,D,0,.68,0],[.26,.06,.6,L,0,.52,0],[.4,.1,.3,'#c0392b',0,.86,-.05],[.42,.03,.32,GOLD,0,.92,-.05]);
 b.push([.2,.36,.2,D,0,.98,.3],[.22,.2,.32,D,0,1.18,.42],[.16,.12,.14,L,0,1.14,.6],[.08,.08,.06,'#ff2a2a',0,1.16,.67],[.04,.04,.02,INK,-.07,1.24,.52],[.04,.04,.02,INK,.07,1.24,.52]);
 [-1,1].forEach(s=>{b.push([.04,.22,.04,GOLD,s*.08,1.4,.38],[.04,.16,.04,GOLD,s*.16,1.5,.36],[.12,.04,.04,GOLD,s*.12,1.44,.42],[.06,.04,.12,D,s*.13,1.28,.38])});
 b.push([.1,.1,.08,L,0,.72,-.4],[.5,.04,.04,GOLD,0,1.0,.22]);
 defF('lx_rockdeer','Reindeer Rocking Horse',.7,1.4,b,g=>{const pv=pivot(g,0,.1,0,()=>true);fxA(g,t=>{const a=Math.sin(t*1.8)*.18;pv.rotation.x=a;pv.position.y=.1+(1-Math.cos(a))*.8})})}
/* Christmas Carousel: a little merry-go-round with reindeer, a striped canopy and lights that turns */
{const b=[[1.3,.12,1.3,'#7a1a2a',0,.06,0],[1.34,.04,1.34,GOLD,0,.13,0],[1.1,.06,1.1,WHT,0,.18,0],[.1,1.3,.1,GOLD,0,.85,0]];
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2,x=Math.cos(a)*.38,z=Math.sin(a)*.38,c=['#a0673a','#f4f4f4','#a0673a','#f4f4f4'][i];
  b.push([.04,1,.04,GOLD,x,.75,z],[.16,.16,.3,c,x,.6,z],[.1,.16,.12,c,x,.74,z+.12],[.06,.06,.04,'#ff2a2a',x,.74,z+.19],[.04,.12,.04,GOLD,x-.04,.86,z+.1],[.04,.12,.04,GOLD,x+.04,.86,z+.1],[.18,.05,.14,RED,x,.7,z-.04])}
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;b.push([.32,.08,.32,i%2?WHT:RED,Math.cos(a)*.48,1.42,Math.sin(a)*.48],[.24,.1,.24,i%2?WHT:RED,Math.cos(a)*.3,1.5,Math.sin(a)*.3],[.06,.06,.06,'*ffe066',Math.cos(a)*.62,1.36,Math.sin(a)*.62])}
 b.push([.2,.16,.2,RED,0,1.6,0],[.12,.12,.12,'*ffd23d',0,1.72,0]);
 defF('lx_carousel','Christmas Carousel',1.4,1.4,b,g=>{const pv=pivot(g,0,0,0,m=>m.position.y>.3);fxA(g,t=>{pv.rotation.y=t*.7})})}
/* Elf Toy Workbench: tools, half-made toys and a little lamp */
{const W='#9c6a40',b=[[1.6,.08,.7,W,0,.8,0],[1.5,.05,.6,'#7a4d2a',0,.3,0]];[[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([x,z])=>b.push([.08,.8,.08,'#7a4d2a',x*.72,.4,z*.28]));
 b.push([1.6,.6,.06,W,0,1.12,-.33],[1.6,.05,.14,'#7a4d2a',0,1.4,-.28]);
 [-.6,-.4,-.2].forEach((x,i)=>b.push([.03,.18,.02,'#5a5f66',x,1.18,-.29],[.08,.04,.03,['#c0392b','#2f6fb5','#e6b422'][i],x,1.06,-.29]));
 b.push([.04,.22,.04,'#8a5a36',.4,1.15,-.28],[.14,.06,.06,'#5a5f66',.4,1.27,-.28],[.1,.1,.1,'*ffe9a8',.65,1.25,-.25]);
 b.push([.3,.2,.2,'#2f6fb5',-.45,.94,.05],[.32,.04,.04,GOLD,-.45,1.05,.05],[.1,.1,.1,'#c0392b',.05,.9,.1],[.12,.04,.12,'#46e083',.05,.86,.1],[.22,.1,.14,RED,.42,.89,.08],[.06,.06,.06,INK,.35,.84,.16],[.06,.06,.06,INK,.5,.84,.16],[.08,.06,.08,'#7dc7ff',.42,.96,.08]);
 b.push([.3,.2,.22,'#e84393',-.3,.4,0],[.32,.04,.24,WHT,-.3,.51,0],[.24,.18,.2,'#2ecc71',.3,.39,0]);
 defF('lx_elfbench','Elf Toy Workbench',1.7,.8,b)}
/* Toy Soldier Drummer: a tall toy soldier with a drum; the sticks tap */
{const b=[[.5,.08,.5,'#1f7a3a',0,.04,0],[.1,.5,.12,'#1a2a6c',-.08,.33,0],[.1,.5,.12,'#1a2a6c',.08,.33,0],[.12,.08,.18,INK,-.08,.1,.03],[.12,.08,.18,INK,.08,.1,.03],
  [.34,.46,.24,RED,0,.82,0],[.36,.06,.26,GOLD,0,.62,0],[.36,.04,.26,WHT,0,.74,.0],[.06,.4,.02,WHT,-.08,.84,.125],[.06,.4,.02,WHT,.08,.84,.125],
  [.22,.22,.2,'#f4c8a6',0,1.18,0],[.04,.04,.02,INK,-.05,1.21,.105],[.04,.04,.02,INK,.05,1.21,.105],[.05,.03,.02,'#e88a8a',-.08,1.14,.105],[.05,.03,.02,'#e88a8a',.08,1.14,.105],
  [.24,.34,.22,INK,0,1.45,0],[.26,.04,.24,GOLD,0,1.3,0],[.06,.1,.04,GOLD,0,1.4,.115],[.06,.16,.06,RED,0,1.68,0],
  [.08,.4,.1,RED,-.21,.86,0],[.08,.4,.1,RED,.21,.86,0],[.08,.08,.08,'#f4c8a6',-.21,.64,.05],[.08,.08,.08,'#f4c8a6',.21,.64,.05],
  [.36,.22,.36,WHT,0,.56,.26],[.38,.04,.38,RED,0,.68,.26],[.38,.04,.38,RED,0,.44,.26]];
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;b.push([.03,.2,.03,GOLD,Math.cos(a)*.18,.56,.26+Math.sin(a)*.18])}
 defF('lx_soldier','Toy Soldier Drummer',.6,.7,b,g=>{const S=[-1,1].map(s=>{const pv=new THREE.Group();pv.position.set(s*.12,.68,.18);g.add(pv);B(pv,.025,.025,.28,'#d9b27a',0,0,.12);B(pv,.05,.05,.05,'#f4f4f4',0,0,.26);return pv});
  fxA(g,t=>S.forEach((pv,i)=>{pv.rotation.x=-.5+Math.max(0,Math.sin(t*7+i*Math.PI))*.7}))})}
/* ---- LEGENDARY ---- */
/* The North Pole: the real one. A tall candy-striped pole, a sign, twinkling lights and a gold star globe that turns on top */
{const b=[[.9,.12,.9,'#eef4f8',0,.06,0],[.6,.12,.6,'#dfe6ea',0,.16,0]];for(let i=0;i<14;i++)b.push([.22,.18,.22,i%2?WHT:RED,0,.31+i*.18,0]);
 b.push([.34,.08,.34,GOLD,0,2.86,0],[.3,.3,.3,GOLD,0,3.1,0],[.36,.2,.2,GOLD,0,3.1,0],[.2,.2,.36,GOLD,0,3.1,0],[.1,.5,.1,'*ffe066',0,3.1,0],[.5,.1,.1,'*ffe066',0,3.1,0],[.1,.1,.5,'*ffe066',0,3.1,0]);
 b.push([.9,.3,.05,'#7a4d2a',.5,1.9,.14],[.82,.22,.06,'#f4f4f4',.5,1.9,.15],[.04,.4,.04,'#7a4d2a',.14,1.75,.14]);
 for(let i=0;i<7;i++)b.push([.08,.06,.02,RED,.24+i*.09,1.9,.19]);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;b.push([.06,.06,.06,['*ff4b4b','*ffd23d','*46e083','*3fa9ff'][i%4],Math.cos(a)*.18,.6+i*.2,Math.sin(a)*.18])}
 defF('lx_northpole','The North Pole',1,1,b,g=>{const pv=pivot(g,0,3.1,0,m=>m.position.y>2.95);fxA(g,t=>{pv.rotation.y=t*1.2;pv.position.y=3.1+Math.sin(t*2)*.04})})}
/* Santa's Golden Throne: a huge red velvet armchair with gold carving, a holly crest and a cushion */
{const V='#a3202f',VD='#7a1a2a',b=[[1.6,.12,1.2,GOLD,0,.06,0],[1.4,.4,1.0,VD,0,.32,0],[1.3,.16,.9,V,0,.6,.05],[1.36,.04,.96,GOLD,0,.69,.05],
  [1.4,1.5,.2,V,0,1.35,-.42],[1.5,.1,.26,GOLD,0,2.12,-.42],[.3,.3,.14,GOLD,0,2.3,-.42],[.16,.16,.1,RED,0,2.32,-.35],[.4,.12,.06,'#1f7a3a',0,2.2,-.34],
  [.24,.6,.9,V,-.72,.9,0],[.24,.6,.9,V,.72,.9,0],[.3,.08,.98,GOLD,-.72,1.22,0],[.3,.08,.98,GOLD,.72,1.22,0],[.3,.2,.2,GOLD,-.72,1.3,.42],[.3,.2,.2,GOLD,.72,1.3,.42],
  [1.0,1.1,.06,WHT,0,1.4,-.31],[.9,1.0,.04,V,0,1.4,-.28],[.5,.18,.4,'#f4f4f4',0,.76,.12]];
 [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([x,z])=>b.push([.16,.2,.16,GOLD,x*.7,.1,z*.48]));
 for(let i=0;i<9;i++)b.push([.08,.08,.03,GOLD,-.6+i*.15,.52,.51]);
 defF('lx_throne','Santa’s Golden Throne',1.7,1.3,b)}

/* ============================================================ THE PRIZE LIST ============================================================ */
/* tier 2 = Rare, 3 = Epic, 4 = Legendary (the advent calendar's tier numbers and colours) */
const list=[
 ...['lx_gumlamp','lx_pepstool','lx_cookiejar','lx_bellwreath','lx_fence'].map(key=>({t:'f',key,k:'f:'+key,n:F[key].n,tier:2})),
 ...['lx_rockdeer','lx_carousel','lx_elfbench','lx_soldier'].map(key=>({t:'f',key,k:'f:'+key,n:F[key].n,tier:3})),
 {t:'c',i:CAR1,k:'c:'+CAR1,n:CARS[CAR1].n,tier:4},{t:'c',i:CAR2,k:'c:'+CAR2,n:CARS[CAR2].n,tier:4},{t:'p',i:ELF,k:'p:'+ELF,n:PETS[ELF][0],tier:4},
 ...['lx_northpole','lx_throne'].map(key=>({t:'f',key,k:'f:'+key,n:F[key].n,tier:4}))];
const byTier=t=>list.filter(o=>o.tier==t);
window.FW_LODGE_ITEMS={list,byTier,CAR1,CAR2,ELF};
})();
