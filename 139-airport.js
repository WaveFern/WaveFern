/* ===== v43.5.0: Fernfield International Airport, the terminal, the gates and the plane =====
   OUTSIDE (home only, built once after the city is merged): Fern Road carries on west past the West suburb to a big terminal on
   the far left of the map (x -400..-330), with a covered drop-off, car parks, a taxi rank and shuttle stop, signs from the
   city, and behind a fence the apron with parked Swiftwing jets, a control tower, a baggage train going round and a runway
   where planes take off and land. The map, minimap marker and a "Taxi to Airport" button point to it. The world's west edge
   moves out to x -345 so the forecourt is walkable; the airfield past the fence is scenery.
   TERMINAL (an interior at x 4000, z 320; 72 x 56; built the first time you go in): the same terminal is used at every airport,
   signed with that airport's name. Front to back:
     entrance hall: doors, 4 Swiftwing check-in desks, the ticket desk (buy/change flights), information, departures boards,
                    a coffee kiosk, seats
     security: 3 lanes with scanners and officers; you need a boarding pass (check in) to go through, leaving is always open
     airside: big departures board, gate signs, Sky Shop, Cloud Nine Coffee, Runway Burgers, a newsstand, seats
     gates 1-6 along the window wall: gate number, a screen with the next flight, a desk with an agent, seats, the boarding door,
                    and through the glass a parked jet at the jet bridge
   BOARDING: at your gate, from 2 h before departure until the gate closes 10 min before, press E at the door. A fade, then you
   are in the cabin (interior at x 4200; 20 rows, 3+3 seats, windows, bins, galley, crew and passengers). Sit in your seat
   (marked with an arrow) and the plane leaves: a short flight scene with the route on a world map and the clock running.
   The clock moves on by the flight time; a flight that runs past 06:00 counts as your night's sleep (the new-day card shows).
   After landing you walk to the front door and get off: TRAVEL.arrive() lets the destination city take over, otherwise you
   are in that city's terminal. Leaving the terminal through the front doors at home puts you on the forecourt; abroad it
   fires TRAVEL 'exitAirport'. */
(function(){
const T=TRAVEL,RU=T.RULES;
const AX=4000,AZ=320,AW=72,AD=56,CX=4200,CW=34,CD=6;
const GU=i=>6+12*(i-1),LANES=[30.7,36,41.3],SECV=34.2;
const OUT={x0:-400,x1:-330,z0:-40,z1:80,fx:-322,fz:20};
const AP={fadeI:[],idx:-1,cidx:-1,grp:null,cgrp:null,og:null,cnpc:[],cols:[],ccols:[],tk:null,ph:null,t:0,msgT:0,signs:[],boards:[],gates:[],dirty:1,loc:null,fadeM:[],pend:null,seatM:null,doorM:[],light:null,clight:null,sec:0,anim:[],lastV:null};
window.APT=AP;
const nf=()=>{const t=+S.t||0;return t<240?0:t<300?(t-240)/60*.5:t<330?.5+(t-300)/30*.4:.9};
function rr(n){return Math.floor(Math.random()*n)}
const fl=(G,grp,mat)=>{(xgFlush(G,mat||SBM)||[]).forEach(m=>{scene.remove(m);grp.add(m)})};
function can(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f&&f(x,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return{c,x,t}}
function pl(grp,tex,w,h,x,y,z,ry,o){o=o||{};const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex||null,color:o.c||'#fff',transparent:!!o.tr,opacity:o.op==null?1:o.op,depthWrite:!o.tr,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry||0;if(o.rx)m.rotation.x=o.rx;grp.add(m);return m}
const FONT='"Trebuchet MS","Segoe UI",Arial,sans-serif';
function sign(grp,w,h,text,x,y,z,ry,o){o=o||{};const px=128,cv=can(Math.round(w*px),Math.round(h*px),(c,W,H)=>{c.fillStyle=o.bg||'#0b2a5b';c.fillRect(0,0,W,H);if(o.bar){c.fillStyle=o.bar;c.fillRect(0,H-H*.08,W,H*.08)}
 c.fillStyle=o.fg||'#ffd84a';c.textAlign=o.al||'center';c.textBaseline='middle';const lines=String(text).split('\n');let fs=o.fs||H*.62/lines.length;
 c.font=`bold ${fs}px ${o.font||FONT}`;while(lines.some(l=>c.measureText(l).width>W*.92)&&fs>8){fs-=2;c.font=`bold ${fs}px ${o.font||FONT}`}
 lines.forEach((l,i)=>c.fillText(l,o.al=='left'?W*.05:W/2,H*(i+.5)/lines.length+(o.dy||0)))});return pl(grp,cv.t,w,h,x,y,z,ry)}
const GREET={en:'Welcome',es:'Bienvenidos',pt:'Bem-vindo',fr:'Bienvenue',de:'Willkommen',it:'Benvenuti',nl:'Welkom',sv:'Välkommen',ja:'ようこそ',ko:'환영합니다',zh:'欢迎',hi:'स्वागत है',ar:'أهلاً وسهلاً',th:'ยินดีต้อนรับ',id:'Selamat datang',sw:'Karibu'};
const here=()=>T.loc(),inT=()=>!!(typeof IN!='undefined'&&IN&&IN.i===AP.idx&&AP.idx>=0),inC=()=>!!(typeof IN!='undefined'&&IN&&IN.i===AP.cidx&&AP.cidx>=0);
/* where the player is, for the HUD strip: '' (not in an airport) | land | air | gate | cabin */
window.apWhere=()=>{if(inC())return'cabin';if(!inT())return'';const v=P.z-AZ;return v>=SECV?'land':v<14?'gate':'air'};
window.apCabinHint=tk=>AP.ph=='landed'?'Landed in '+T.city(tk.to)+' · exit at the front door':AP.ph=='fly'?'In the air':inC()?'On board · find seat '+tk.seat+' and sit down':'Boarded';
function mkChar(o){o=o||{};const c={skin:rr(6),eyes:rr(5),mouth:rr(4),hair:rr(12),hc:rr(12),top:rr(5),tc:rr(10),pc:rr(8),body:Math.random()};if(o.tc)c.tc_custom=o.tc;if(o.pc)c.pc_custom=o.pc;if(o.top!=null)c.top=o.top;return buildChar(c)}
function fade(cb,txt,sub){let d=document.getElementById('apfade');if(d)d.remove();d=document.createElement('div');d.id='apfade';
 d.style.cssText='position:fixed;inset:0;z-index:70;background:#05101f;opacity:0;transition:opacity .45s;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#fff;font:700 26px '+FONT+';text-align:center;pointer-events:none';
 d.innerHTML=(txt?esc(txt):'')+(sub?`<small style="font-size:14px;font-weight:400;color:#cfe6ff;margin-top:8px">${esc(sub)}</small>`:'');document.body.appendChild(d);
 requestAnimationFrame(()=>d.style.opacity='1');setTimeout(()=>{try{cb()}catch(e){console.error('airport',e)}setTimeout(()=>{d.style.opacity='0';setTimeout(()=>d.remove(),500)},txt?900:150)},500)}

/* ================= plane model ================= */
const PM={};const pm=c=>PM[c]||(PM[c]=new THREE.MeshLambertMaterial({color:c}));
function mkPlane(o){o=o||{};const g=new THREE.Group(),body=pm('#f3f5f9'),nv=pm('#0b2a5b'),co=pm(o.tail||'#ff6b4a'),gr=pm('#a7b0bb'),dk=pm('#1b2533');
 const m=(geo,mat,x,y,z,rx,ry,rz)=>{const q=new THREE.Mesh(geo,mat);q.position.set(x,y,z);q.rotation.set(rx||0,ry||0,rz||0);g.add(q);return q};
 m(new THREE.CylinderGeometry(1.9,1.9,26,14),body,0,2.6,0,Math.PI/2);
 const n=m(new THREE.SphereGeometry(1.9,14,10),body,0,2.6,13);n.scale.set(1,1,1.7);
 m(new THREE.ConeGeometry(1.9,7,14),body,0,2.9,-16.4,-Math.PI/2).scale.set(1,1,.7);
 m(new THREE.BoxGeometry(.06,.34,25),nv,1.9,2.05,0);m(new THREE.BoxGeometry(.06,.34,25),nv,-1.9,2.05,0);
 m(new THREE.BoxGeometry(.06,.5,1.2),dk,1.55,3.55,15.2,0,.5);m(new THREE.BoxGeometry(.06,.5,1.2),dk,-1.55,3.55,15.2,0,-.5);
 const W=new THREE.InstancedMesh(new THREE.BoxGeometry(.08,.34,.36),dk,56),M4=new THREE.Matrix4();let k=0;for(let i=0;i<28;i++)[-1.93,1.93].forEach(x=>{M4.makeTranslation(x,3.05,-10.6+i*.82);W.setMatrixAt(k++,M4)});g.add(W);
 m(new THREE.BoxGeometry(.06,1.5,.8),gr,-1.93,2.5,10.5);
 [-1,1].forEach(s=>{m(new THREE.BoxGeometry(13.5,.32,4.2),body,s*8.2,1.65,-1.2,0,s*.38);m(new THREE.BoxGeometry(1.2,.33,1.6),co,s*14.2,1.7,-4.3,0,s*.38);
  m(new THREE.CylinderGeometry(.9,.8,3.2,12),gr,s*5.3,.95,1.3,Math.PI/2);m(new THREE.CylinderGeometry(.62,.62,.1,12),dk,s*5.3,.95,2.9,Math.PI/2);
  m(new THREE.BoxGeometry(5.2,.22,2.4),body,s*3.2,3.2,-17.2,0,s*.3)});
 m(new THREE.BoxGeometry(.32,6,4.4),co,0,6.4,-16.2,-.42);
 const lg=can(128,128,(c,w,h)=>{c.fillStyle='#fff';c.beginPath();c.moveTo(20,84);c.quadraticCurveTo(64,30,112,30);c.quadraticCurveTo(70,52,60,96);c.quadraticCurveTo(50,70,20,84);c.fill()});
 [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshBasicMaterial({map:lg.t,transparent:true,depthWrite:false}));p.position.set(s*.18,6.4,-16.4);p.rotation.y=s*Math.PI/2;g.add(p)});
 [[0,.45,11],[-1.6,.45,-1.5],[1.6,.45,-1.5]].forEach(q=>m(new THREE.CylinderGeometry(.35,.35,.3,8),dk,q[0],q[1],q[2],0,0,Math.PI/2));
 g.userData.len=34;return g}

/* ================= outside, at home ================= */
function buildOut(){if(AP.og)return;const G=xgNew(),og=AP.og=new THREE.Group();scene.add(og);
 const bx=(w,h,d,c,x,y,z,ry,tc)=>xgBox(G,w,h,d,c,x,y,z,ry,tc);
 /* grass west of the old ground, a field under the airfield */
 let gm=null;scene.traverse(q=>{if(!gm&&q.isMesh&&q.geometry&&q.geometry.type=='PlaneGeometry'&&q.geometry.parameters&&q.geometry.parameters.width>1000)gm=q});
 {const gp=new THREE.Mesh(new THREE.PlaneGeometry(300,340),gm?gm.material:pm('#5a9a52'));gp.rotation.x=-Math.PI/2;gp.position.set(-480,gm?gm.position.y:-.05,5);og.add(gp)}
 /* road: Fern Road carries on west from the West suburb to the forecourt */
 const R0=-300,R1=-137.4,RZ=19.9;bx(R1-R0+.5,.04,10,'#3a3d44',(R0+R1)/2,-.03,RZ);bx(R1-R0+.5,.06,2.4,'#b9b5ab',(R0+R1)/2,-.02,RZ-6.2);bx(R1-R0+.5,.06,2.4,'#b9b5ab',(R0+R1)/2,-.02,RZ+6.2);
 for(let x=R0+4;x<R1;x+=10)bx(4,.02,.32,'#e8d9a0',x,.005,RZ);
 for(let x=R0+20;x<R1-6;x+=24)[RZ-7,RZ+7].forEach(z=>{bx(.18,4.2,.18,'#4a4f57',x,2.1,z);bx(1.2,.16,.24,'#4a4f57',x,4.2,z+(z<RZ?.5:-.5));bx(.5,.12,.3,'*fff5c8',x,4.1,z+(z<RZ?1:-1))});
 /* forecourt, kerb, canopy */
 bx(30,.08,62,'#cfc9bc',-315,-.01,20);bx(30,.12,.4,'#8e8a82',-315,.02,-11);bx(30,.12,.4,'#8e8a82',-315,.02,51);
 for(let z=-8;z<50;z+=3)bx(.6,.02,1.6,'#e9e4d8',-317,.04,z);
 {const G3=xgNew();xgBox(G3,24,.5,60,'#e9ecf1',-318,7.3,20,0,'#c7ccd4');xgBox(G3,24.4,.3,.4,'#0b2a5b',-318,7,-10.2);xgBox(G3,.4,.3,60.4,'#0b2a5b',-306,7,20);
 for(let z=-6;z<=46;z+=8){xgBox(G3,.5,7,.5,'#d7dbe2',-307,3.5,z);cols.push([-307.4,z-.4,-306.6,z+.4])}
 const cm=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true});fl(G3,og,cm);AP.fadeM.push({m:cm,b:[-330,-10.4,-305.6,50.4,7.6]})}
 /* terminal building */
 const {x0,x1,z0,z1}=OUT;bx(x1-x0,14,z1-z0,'#dfe4ea',(x0+x1)/2,7,(z0+z1)/2,0,'#b9c0c9');
 bx(.3,10,z1-z0-8,'#7fb2dd',x1+.05,6,(z0+z1)/2);for(let z=z0+6;z<z1-4;z+=4)bx(.4,10.4,.25,'#4c5f73',x1+.15,6,z);
 for(let y=2;y<11;y+=3)bx(.4,.2,z1-z0-8,'#4c5f73',x1+.15,y,(z0+z1)/2);
 bx(.6,4.4,8,'#2b3a4c',x1+.2,2.2,20);bx(.5,3.6,3.4,'#9fd4ff',x1+.4,1.8,18.2);bx(.5,3.6,3.4,'#9fd4ff',x1+.4,1.8,21.8);bx(.6,.4,8.4,'#0b2a5b',x1+.25,4.5,20);
 bx(x1-x0+2,.6,z1-z0+2,'#a8b0ba',(x0+x1)/2,14.2,(z0+z1)/2);
 for(let z=z0+10;z<z1;z+=22)bx(6,1.6,6,'#9aa2ac',(x0+x1)/2,15.1,z);
 cols.push([x0,z0,x1+.6,z1]);
 sign(og,30,3,'FERNFIELD INTERNATIONAL AIRPORT',x1+.45,11.8,20,Math.PI/2,{bg:'#0b2a5b',fg:'#fff',bar:'#ff6b4a'});
 sign(og,7,1.1,'✈ DEPARTURES · ARRIVALS',x1+.7,5.4,20,Math.PI/2,{bg:'#0b2a5b',fg:'#ffd84a'});
 sign(og,8,1.3,'SWIFTWING',x1+.45,8.6,-4,Math.PI/2,{bg:'#ffffff',fg:'#1565d8',bar:'#ff6b4a'});
 /* car parks, taxi rank, shuttle stop */
 [[-282,46],[-282,-6]].forEach(([cx,cz])=>{bx(34,.06,26,'#4a4d54',cx,-.015,cz);for(let x=cx-15;x<=cx+15;x+=3.4)[cz-6.5,cz+6.5].forEach(z=>bx(.12,.02,4.6,'#e8e8e8',x,.03,z));
  for(let i=0;i<14;i++){if(Math.random()<.35)continue;const x=cx-13.3+(i%9)*3.4,z=cz+(i<9?-6.5:6.5),col=['#c0392b','#2d5a8d','#e8e8ec','#2f8f5a','#1d1d22','#e6b422'][rr(6)];
   bx(1.8,.7,3.9,col,x,.55,z);bx(1.6,.55,2,dk(col,.8),x,1.15,z-.2);bx(1.62,.4,1.95,'#1b2533',x,1.1,z-.2);cols.push([x-.9,z-1.95,x+.9,z+1.95])}});
 bx(.3,2.6,.3,'#444',-300,1.3,10);sign(og,2.6,1.1,'TAXI',-300,2.8,10.2,0,{bg:'#ffd84a',fg:'#111'});
 bx(4,.15,1.6,'#0b2a5b',-300,2.6,30);bx(.15,2.6,.15,'#556',-301.9,1.3,29.3);bx(.15,2.6,.15,'#556',-298.1,1.3,29.3);bx(3.6,.5,.3,'#7aa7d8',-300,.6,29.1);
 sign(og,2.4,.7,'AIRPORT SHUTTLE',-300,3.1,30.82,0,{bg:'#0b2a5b',fg:'#fff'});
 /* signs from the city */
 [[-142,11.5],[-210,11.5]].forEach(([x,z],i)=>{bx(.3,4,.3,'#555',x,2,z);bx(.3,4,.3,'#555',x+4.2,2,z);sign(og,5,1.8,i?'✈ AIRPORT  ⟵\nTerminal ahead':'✈ AIRPORT  ⟵\nFernfield International',x+2.1,4.4,z+.2,0,{bg:'#0b4fa8',fg:'#fff'})});
 /* fence and airfield */
 for(let x=-345;x<=-250;x+=3){bx(.12,2.4,.12,'#6b7078',x,1.2,92)}bx(95,.08,.06,'#8a9098',-297.5,2.3,92);bx(95,.08,.06,'#8a9098',-297.5,1.2,92);
 for(let z=92;z<=167;z+=3){bx(.12,2.4,.12,'#6b7078',-250,1.2,z)}bx(.06,.08,75,'#8a9098',-250,2.3,129.5);bx(.06,.08,75,'#8a9098',-250,1.2,129.5);
 const fence=new THREE.Mesh(new THREE.PlaneGeometry(95,2.3),new THREE.MeshBasicMaterial({color:'#9aa4ad',transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}));fence.position.set(-297.5,1.15,92);og.add(fence);
 cols.push([-346,91.6,-249.6,92.4],[-250.4,91.6,-249.6,168]);
 bx(260,.05,40,'#9a9c9e',-380,-.02,112);bx(420,.05,24,'#2e3136',-400,-.01,146);for(let x=-600;x<-200;x+=12)bx(6,.02,.5,'#f2f2f2',x,.03,146);
 for(let z=136;z<=156;z+=2.5){bx(.5,.02,1.4,'#f2f2f2',-590,.03,z);bx(.5,.02,1.4,'#f2f2f2',-212,.03,z)}
 for(let x=-605;x<-195;x+=10)[133.8,158.2].forEach(z=>bx(.3,.3,.3,'*ffd27a',x,.15,z));
 bx(6,.04,20,'#9a9c9e',-260,-.015,124);bx(6,.04,20,'#9a9c9e',-560,-.015,124);
 for(let x=-470;x<-260;x+=40)bx(.3,.02,30,'#f5c542',x,.04,110);
 /* jet bridges and parked jets on the south side of the terminal */
 [-385,-350].forEach((x,i)=>{bx(2.6,2.8,16,'#cfd5dc',x,3.4,88);bx(.6,3.4,.6,'#7a828c',x,1.7,95);const p=mkPlane({tail:i?'#1565d8':'#ff6b4a'});p.position.set(x+3.2,0,113);og.add(p)});
 /* control tower */
 bx(4,26,4,'#e4e8ee',-282,13,108);bx(9,3.2,9,'#2b3a4c',-282,27.6,108);bx(9.6,.4,9.6,'#d7dbe2',-282,29.4,108);bx(1,4,1,'#c33',-282,31.5,108);cols.push([-284,106,-280,110]);
 fl(G,og);
 /* moving: a plane taking off and landing, a baggage train going round */
 const run=mkPlane({tail:'#ff6b4a'});run.rotation.y=-Math.PI/2;run.position.set(-220,0,146);run.visible=false;og.add(run);AP.anim.push({k:'rw',m:run,t:0});
 const tug=new THREE.Group();{const t=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.1,2.4),pm('#f5c542'));t.position.y=.6;tug.add(t);for(let i=1;i<=3;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.2,2.2),pm(i%2?'#4a5868':'#5b6b7c'));c.position.set(0,.7,-i*2.8);tug.add(c)}}
 tug.position.set(-460,0,104);og.add(tug);AP.anim.push({k:'tug',m:tug,t:0});
 POIS.push([-322,20,'Airport','#7fd4ff']);
 WB[0]=Math.min(WB[0],-345)}
function fadeAll(dt,L){const px=P.x,pz=P.z;(L||AP.fadeM).forEach(f=>{const [x0,z0,x1,z1,h]=f.b;let lo=0,hi=(h-1)/13;const r=(p,a,c)=>{const t1=(a-p)/16,t2=(c-p)/16;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2))};r(px,x0,x1);r(pz,z0,z1);
 const tg=lo<hi?.15:1,m=f.m;m.opacity+=(tg-m.opacity)*Math.min(1,dt*6);m.depthWrite=m.opacity>.95})}
/* a hanging sign or board that fades out while it hides you (box in world x/z, top height h) */
function fd(mesh,x0,z0,x1,z1,h){mesh.material.transparent=true;AP.fadeI.push({m:mesh.material,b:[x0,z0,x1,z1,h]});return mesh}
function outTick(dt){if(!AP.og)return;fadeAll(dt);const far=(typeof IN!='undefined'&&IN)||P.x>-120;if(far)return;
 AP.anim.forEach(a=>{a.t+=dt;if(a.k=='rw'){const c=a.t%70,m=a.m;let x,y=0,ry=-Math.PI/2,v=1;
  if(c<30){const u=c/30;x=-220-380*u*u;y=u>.55?(u-.55)*60:0}else if(c<35){v=0;x=-620}else if(c<62){const u=(c-35)/27;x=-620+400*(1-(1-u)*(1-u));y=Math.max(0,(1-u/.35))*22;ry=Math.PI/2}else{v=0;x=-220}
  m.visible=!!v;m.position.set(x,y,146);m.rotation.set(y>0&&c<30?-.18:y>0?.08:0,ry,0)}
 else{const L=[[-460,104],[-260,104],[-260,120],[-460,120]],per=L.reduce((s,p,i)=>s+Math.hypot(L[(i+1)%4][0]-p[0],L[(i+1)%4][1]-p[1]),0);let d=(a.t*6)%per,i=0;
  for(;i<4;i++){const q=L[(i+1)%4],p=L[i],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<=l){const u=d/l;a.m.position.set(p[0]+(q[0]-p[0])*u,0,p[1]+(q[1]-p[1])*u);a.m.rotation.y=Math.atan2(q[0]-p[0],q[1]-p[1]);break}d-=l}}});
 /* the canopy fades when it hides you */
 }
function outInts(){const a=[];if(typeof IN!='undefined'&&IN)return a;if(Math.abs(P.x-(OUT.x1+2))<6&&Math.abs(P.z-20)<6)a.push({x:OUT.x1+1.6,z:20,r:3.2,l:'Enter '+T.apName('home'),a:()=>{if(T.abroad())T.st().loc='home';apEnter('front')}});return a}

/* ================= terminal interior =================
   v55.25.0 rebuild, in the same voxel style but finer: round columns, rounded desks and counters with countertops, toe kicks
   and trim, linked beam seating, shop fronts with canopies, awnings and lit fascias, glass partitions, a curtain wall with
   slim mullions and sliding gate doors, X-ray lanes with rollers and trays, a baggage reclaim carousel, check-in belts
   with moving bags, gate pylons in place of the big hanging cubes, wall clocks. Soft contact shadows, warm light pools
   (stronger at night) and sun stripes from the window wall (by day only) are three flat decal meshes. Glowing parts
   (screens, lamps, fridges) are one unlit batch. NPC lanes keep clear of every solid; people sit properly on free seats.
   Interaction spots, collision rules, departure boards, gate screens and saves are as before. */
const TX={};
function softTex(k){if(TX[k])return TX[k];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
 if(k=='sh'){for(let i=0;i<14;i++){x.fillStyle='rgba(0,0,0,.075)';x.beginPath();const a=i*1.7,s=64-i*3.4,r=Math.max(2,16-i);if(x.roundRect)x.roundRect(a,a,s,s,r);else x.rect(a,a,s,s);x.fill()}}
 else if(k=='sun'){const gr=x.createLinearGradient(0,64,0,0);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(4,0,56,64);x.globalAlpha=.5;x.fillRect(1,0,3,64);x.fillRect(60,0,3,64)}
 else{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)}
 return TX[k]=new THREE.CanvasTexture(c)}
/* flat quads on the floor (world x/z), sk shears the far edge along x */
function decal(){const P=[],UV=[],I=[];return{q(x0,z0,x1,z1,y,sk){const k=P.length/3,s=sk||0;P.push(x0,y,z0,x1,y,z0,x1+s,y,z1,x0+s,y,z1);UV.push(0,0,1,0,1,1,0,1);I.push(k,k+2,k+1,k,k+3,k+2)},
 mesh(grp,mat,ro){if(!P.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mat);m.renderOrder=ro||0;grp.add(m);return m}}}
/* a voxel tree (trunk plus three stacked frusta) and a palm (trunk and a star of six fronds); y0 = ground height */
function tree(G,x,z,s,y0,c1){const cs=c1||['#2f8a4f','#3aa062','#52b873'];xgPrism(G,.2*s,.16*s,1.5*s,6,'#7a5232',x,y0,z);
 xgPrism(G,1.7*s,1.25*s,1.2*s,8,cs[0],x,y0+1.2*s,z,{ph:.2});xgPrism(G,1.35*s,.85*s,1.1*s,8,cs[1],x,y0+2.2*s,z,{ph:.4});xgPrism(G,.9*s,.3*s,1*s,8,cs[2],x,y0+3.1*s,z,{ph:.1})}
function palm(G,x,z,s,y0){xgPrism(G,.14*s,.1*s,2.1*s,6,'#8a6a4a',x,y0,z);for(let k=0;k<6;k++){const a=k*Math.PI/3+.3,r=.7*s;xgBox(G,1.5*s,.1*s,.42*s,k%2?'#2f8a4f':'#3aa062',x+Math.cos(a)*r,y0+2.15*s-(k%2)*.12*s,z+Math.sin(a)*r,-a)}
 xgBox(G,.4*s,.3*s,.4*s,'#6b4a32',x,y0+2.05*s,z)}
function buildTerm(){if(AP.grp)return;const G=xgNew(),GL=xgNew(),g=AP.grp=new THREE.Group();scene.add(g);g.visible=false;
 if(AP.idx<0){SHOPS.push({name:'Airport terminal',cx:OUT.x1+2,ez:20,ox:AX});AP.idx=SHOPS.length-1}
 const u=v=>AX+v,w=v=>AZ+v,R=(a,b)=>a+Math.random()*(b-a),
  bx=(W,H,D,c,x,y,z,tc,ry)=>xgBox(G,W,H,D,c,u(x),y,w(z),ry||0,tc),
  br=(W,H,D,c,x,y,z,rx,ry)=>xgBoxR(G,W,H,D,c,u(x),y,w(z),rx||0,ry||0,0),
  lit=(W,H,D,c,x,y,z,ry)=>xgBox(GL,W,H,D,c,u(x),y,w(z),ry||0),
  cy=(r0,r1,h,n,c,x,y0,z,o)=>xgPrism(G,r0,r1,h,n,c,u(x),y0,w(z),o),
  col=(a,b,c,d)=>AP.cols.push([u(a),w(b),u(c),w(d)]),
  SH=decal(),PO=decal(),SU=decal(),
  sh=(x,z,W,D,p)=>{p=p==null?.3:p;SH.q(u(x-W/2-p),w(z-D/2-p),u(x+W/2+p),w(z+D/2+p),.016)},
  pool=(x,z,r)=>PO.q(u(x-r),w(z-r*.75),u(x+r),w(z+r*.75),.022),
  GLS=new THREE.MeshLambertMaterial({color:'#dff1ff',transparent:true,opacity:.26,depthWrite:false}),
  glass=(W,H,D,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(W,H,D),GLS);m.position.set(u(x),y,w(z));g.add(m);return m},
  fdBox=(W,H,D,c,x,y,z,b)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(W,H,D),new THREE.MeshLambertMaterial({color:c}));m.position.set(u(x),y,w(z));g.add(m);fd(m,u(b[0]),w(b[1]),u(b[2]),w(b[3]),b[4]);return m},
  tpl=(tex,W,H,x,y,z,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshLambertMaterial({map:tex}));m.position.set(u(x),y,w(z));m.rotation.y=ry||0;g.add(m);return m},
  cvs=(W,H,f)=>can(W,H,f).t,
  txt=(t,bg,fg,o)=>(c,W,H)=>{o=o||{};c.fillStyle=bg;c.fillRect(0,0,W,H);if(o.bar){c.fillStyle=o.bar;c.fillRect(0,H*.86,W,H*.14)}c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';let fs=H*(o.s||.62);c.font='bold '+fs+'px '+FONT;while(c.measureText(t).width>W*.9&&fs>8){fs-=2;c.font='bold '+fs+'px '+FONT}c.fillText(t,W/2,H*(o.bar?.46:.5))},
  lsign=(W,H,draw,x,y,z,ry)=>pl(g,cvs(Math.round(W*128),Math.round(H*128),draw),W,H,u(x),y,w(z),ry||0),
  /* a stanchion post and a belt between two posts (along x or z) */
  post=(x,z)=>{cy(.15,.15,.04,10,'#7d8691',x,0,z);cy(.035,.035,.95,6,'#cfd5dc',x,.04,z);cy(.055,.055,.05,8,'#e6eaef',x,.99,z)},
  belt=(x0,z0,x1,z1,c)=>{const L=Math.hypot(x1-x0,z1-z0),X=Math.abs(x1-x0)>Math.abs(z1-z0);for(let i=0,n=Math.max(1,Math.round(L/2.4));i<=n;i++)post(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n);
   bx(X?L:.025,.07,X?.025:L,c||'#0b2a5b',(x0+x1)/2,.88,(z0+z1)/2);col(Math.min(x0,x1)-.06,Math.min(z0,z1)-.06,Math.max(x0,x1)+.06,Math.max(z0,z1)+.06)},
  /* a beam of n linked seats centred on x, facing +z, pitch p: cushions, backs, chrome armrests and leg frames */
  seats=(x,z,n,p,c,c2)=>{const L=n*p;bx(L-.1,.06,.1,'#8a939e',x,.3,z-.05);[-1,1].forEach(s=>{const lx=x+s*(L/2-.25);bx(.07,.3,.07,'#7d8691',lx,.15,z-.05);bx(.09,.03,.62,'#7d8691',lx,.015,z-.05)});
   for(let i=0;i<n;i++){const sx=x-L/2+p/2+i*p;bx(p-.12,.1,.6,c,sx,.4,z,c2&&'#ffffff'==c2?c:undefined);bx(p-.12,.56,.08,c2||c,sx,.76,z-.33);bx(p-.16,.04,.04,'#cfd5dc',sx,1.05,z-.33)}
   for(let i=0;i<=n;i++){const ax=x-L/2+i*p;bx(.05,.04,.46,'#cfd5dc',ax,.62,z-.02);bx(.04,.2,.04,'#b8c0ca',ax,.5,z+.17)}sh(x,z-.05,L,.7,.25)},
  /* a canopy over a shop counter: two posts, a fascia, a striped awning and a lit name sign */
  canopy=(x0,x1,z,c,stripe,name,bg,fg)=>{const W=x1-x0,mx=(x0+x1)/2;bx(.1,3.05,.1,c,x0+.05,1.52,z);bx(.1,3.05,.1,c,x1-.05,1.52,z);bx(W,.5,.24,c,mx,3.1,z,'#2b2f36');
   const n=Math.max(4,Math.round(W/.62));for(let k=0;k<n;k++)br(W/n+.005,.04,.9,k%2?stripe:'#f4efe6',x0+W/n*(k+.5),2.66,z+.4,.42,0);bx(W,.06,.06,c,mx,2.48,z+.8);
   lsign(W*.78,.4,txt(name,bg,fg,{s:.72}),mx,3.1,z+.125);pool(mx,z+1.6,W*.45)},
  /* a counter with toe kick, slatted or banded front and a stone top; ends rounded when round=1 */
  counter=(x,z,W,c,top,front,slat,round)=>{bx(W,.8,.8,c,x,.52,z);bx(W-.2,.12,.66,'#2b2f36',x,.06,z-.04);
   if(slat)for(let k=0,n=Math.round(W/.34);k<n;k++)bx(.07,.7,.025,slat,x-W/2+.17+k*W/n,.52,z+.41);if(front)bx(W-.1,.07,.03,front,x,.85,z+.415);
   bx(W+.2,.07,1,top,x,.955,z+.05);if(round)[-1,1].forEach(s=>{cy(.4,.4,.8,12,c,x+s*W/2,.12,z);cy(.5,.5,.07,12,top,x+s*W/2,.92,z+.05)});sh(x,z,W+(round?.8:0),.8,.3)};
 /* ---------- floors (one canvas each, laid edge to edge so nothing overlaps) ---------- */
 const floor=(x0,z0,x1,z1,ppm,draw)=>{const W=Math.round((x1-x0)*ppm),H=Math.round((z1-z0)*ppm),t=cvs(W,H,c=>draw(c,W,H,ppm,v=>(v-x0)*ppm,v=>(v-z0)*ppm));t.magFilter=THREE.NearestFilter;t.anisotropy=8;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),new THREE.MeshLambertMaterial({map:t}));m.rotation.x=-Math.PI/2;m.position.set(u((x0+x1)/2),0,w((z0+z1)/2));g.add(m)};
 const speck=(c,W,H,n,cols)=>{for(let i=0;i<n;i++){c.fillStyle=cols[i%cols.length];c.fillRect(Math.random()*W,Math.random()*H,1.5,1.5)}};
 floor(0,34.3,AW,AD,14,(c,W,H,p,X,Z)=>{c.fillStyle='#bdb5a7';c.fillRect(0,0,W,H);for(let i=0;i<24;i++)for(let j=0;j<8;j++)if((i+j)%2){c.fillStyle='#b0a89a';c.fillRect(X(i*3),Z(34.3+j*3),3*p,3*p)}
  speck(c,W,H,5000,['#a59d8f','#cbc4b7','#9d968a','#c2c6c9']);c.strokeStyle='rgba(120,112,100,.55)';c.lineWidth=1;for(let i=0;i<=24;i++){c.beginPath();c.moveTo(X(i*3)+.5,0);c.lineTo(X(i*3)+.5,H);c.stroke()}for(let j=0;j<=8;j++){c.beginPath();c.moveTo(0,Z(34.3+j*3)+.5);c.lineTo(W,Z(34.3+j*3)+.5);c.stroke()}
  const cx=X(36),cz=Z(46),r=5.2*p;c.fillStyle='#0b2a5b';c.beginPath();c.arc(cx,cz,r,0,7);c.fill();c.fillStyle='#16408a';c.beginPath();c.arc(cx,cz,r*.86,0,7);c.fill();c.strokeStyle='#ffd84a';c.lineWidth=3;[.86,.5].forEach(k=>{c.beginPath();c.arc(cx,cz,r*k,0,7);c.stroke()});
  for(let i=0;i<16;i++){const a=i*Math.PI/8,L=i%2?r*.55:r*.8,k=i%4==0?.1:.06;c.fillStyle=i%4==0?'#ffd84a':i%2?'#7fb2dd':'#ffffff';c.beginPath();c.moveTo(cx+Math.cos(a-k)*r*.1,cz+Math.sin(a-k)*r*.1);c.lineTo(cx+Math.cos(a)*L,cz+Math.sin(a)*L);c.lineTo(cx+Math.cos(a+k)*r*.1,cz+Math.sin(a+k)*r*.1);c.fill()}
  c.fillStyle='#ff6b4a';c.beginPath();c.arc(cx,cz,r*.1,0,7);c.fill();c.fillStyle='#fff';c.font='bold '+p*.9+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('N',cx,cz-r*.93);
  c.fillStyle='#2b3440';c.fillRect(X(31.5),Z(54.1),9*p,1.6*p);c.strokeStyle='#ffd84a';c.lineWidth=2;c.strokeRect(X(31.5)+1,Z(54.1)+1,9*p-2,1.6*p-2);c.fillStyle='#3d4654';for(let i=0;i<36;i++)c.fillRect(X(31.7+i*.24),Z(54.3),2,1.2*p);
  c.fillStyle='rgba(11,42,91,.12)';c.fillRect(X(62.6),Z(50.2),6.8*p,3.6*p)});
 floor(0,15,AW,34.3,14,(c,W,H,p,X,Z)=>{c.fillStyle='#b9b2a4';c.fillRect(0,0,W,H);c.save();c.translate(W/2,H/2);c.rotate(Math.PI/4);const s=3.4*p;for(let i=-30;i<30;i++)for(let j=-30;j<30;j++){c.fillStyle=(i+j)%2?'#aca596':'#bcb5a7';c.fillRect(i*s,j*s,s,s)}c.restore();
  speck(c,W,H,4000,['#a29b8d','#c9c2b5','#9b9488']);
  /* Sky Shop: warm wood; Cloud Nine: small hex-ish tiles; play corner: soft green mat */
  c.fillStyle='#b98a5a';c.fillRect(0,Z(15),X(9.2),Z(26.8));for(let i=0;i<40;i++){c.fillStyle=i%2?'#a97c4f':'#c4966a';c.fillRect(0,Z(15+i*.3),X(9.2),.3*p-1)}
  c.fillStyle='#e4ddd0';c.fillRect(X(17.6),Z(19.8),8.4*p,6.6*p);for(let i=0;i<28;i++)for(let j=0;j<22;j++)if((i+j)%3==0){c.fillStyle='#cfc4b2';c.fillRect(X(17.6+i*.3),Z(19.8+j*.3),.3*p-1,.3*p-1)}
  c.fillStyle='#2fae5a';c.fillRect(X(62.4),Z(21.3),7.2*p,4.7*p);c.fillStyle='#38c46a';for(let i=0;i<7;i++)for(let j=0;j<5;j++)if((i+j)%2)c.fillRect(X(62.4+i*1.03),Z(21.3+j*.94),1.03*p,.94*p);
  c.fillStyle='#16408a';c.fillRect(0,0,W,.3*p);c.fillStyle='#ffd84a';for(let z=33.8;z>28.6;z-=1.1)c.fillRect(X(35.9),Z(z),.2*p,.65*p);
  const arrow=(x,dir,t)=>{const y=Z(30.6),a=2.4*p;c.fillStyle='#0b2a5b';c.beginPath();c.moveTo(X(x)+dir*a,y);c.lineTo(X(x)+dir*a*.3,y-a*.5);c.lineTo(X(x)+dir*a*.3,y-a*.2);c.lineTo(X(x)-dir*a,y-a*.2);c.lineTo(X(x)-dir*a,y+a*.2);c.lineTo(X(x)+dir*a*.3,y+a*.2);c.lineTo(X(x)+dir*a*.3,y+a*.5);c.closePath();c.fill();
   c.strokeStyle='#ffd84a';c.lineWidth=2;c.stroke();c.fillStyle='#fff';c.font='bold '+p*.55+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(t,X(x)-dir*a*.3,y)};arrow(22,-1,'GATES 1-3');arrow(50,1,'GATES 4-6')});
 floor(0,11.6,AW,15,14,(c,W,H,p,X,Z)=>{c.fillStyle='#b3ac9e';c.fillRect(0,0,W,H);speck(c,W,H,1200,['#a29b8d','#c6bfb2']);c.strokeStyle='rgba(120,112,100,.6)';for(let i=0;i<=36;i++){c.beginPath();c.moveTo(X(i*2)+.5,0);c.lineTo(X(i*2)+.5,H);c.stroke()}
  c.fillStyle='#ffd84a';c.fillRect(0,0,W,.2*p);c.fillRect(0,H-.16*p,W,.16*p);c.fillStyle='rgba(11,42,91,.5)';c.fillRect(0,Z(13.25),W,.1*p)});
 floor(0,0,AW,11.6,14,(c,W,H,p,X,Z)=>{c.fillStyle='#193f74';c.fillRect(0,0,W,H);c.fillStyle='#1f4a85';for(let i=0;i<AW*2;i+=2)c.fillRect(X(i*.5),0,.5*p,H);speck(c,W,H,3000,['#2a5a9a','#14355f']);
  for(let i=1;i<=6;i++){const a=GU(i);c.fillStyle='#2b64a8';c.fillRect(X(a-4.6),Z(6.2),8.6*p,5*p);c.strokeStyle='#ffffff';c.lineWidth=2;c.strokeRect(X(a-4.6)+3,Z(6.2)+3,8.6*p-6,5*p-6);
   c.fillStyle='rgba(255,216,74,.9)';c.font='bold '+p*1.8+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(String(i),X(a-1.8),Z(4.2));c.fillStyle='#0f2c55';c.fillRect(X(a-1.25),Z(.3),2.5*p,3.3*p)}});
 /* ---------- walls ---------- */
 /* west wall: wainscot, pilasters, coral line, sconces, light-box adverts */
 bx(.4,5.6,AD,'#d9d2c3',-.2,2.8,AD/2);bx(.12,1.1,AD-.2,'#16408a',.06,.55,AD/2);bx(.16,.08,AD-.2,'#ffffff',.08,1.14,AD/2);bx(.1,.16,AD,'#ff6b4a',.05,5.25,AD/2);
 [2,10,13.6,27.6,34.3,42,55.2].forEach(z=>{bx(.3,5.6,.6,'#ece6da',.15,2.8,z);bx(.36,.2,.7,'#c8c1b2',.18,.1,z)});
 [6,30.9,38.4].forEach(z=>{lit(.12,.36,.26,'#ffe9b0',.12,4.2,z-1.6);lit(.12,.36,.26,'#ffe9b0',.12,4.2,z+1.6);bx(.16,.06,.4,'#566270',.08,3.98,z-1.6);bx(.16,.06,.4,'#566270',.08,3.98,z+1.6)});
 [[30.9,'FLY SWIFTWING','#ff6b4a','#ffd9a8'],[38.4,'FERNFIELD · AIR','#2a6cc0','#bfe3ff']].forEach(([z,t,a,b])=>{bx(.2,3,5.4,'#0b2a5b',.1,2.6,z);
  lsign(4.8,2.6,(c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,a);gr.addColorStop(1,b);c.fillStyle=gr;c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(W*.72,H*.32,H*.15,0,7);c.fill();
   c.fillStyle='#fff';c.beginPath();c.moveTo(W*.08,H*.66);c.quadraticCurveTo(W*.4,H*.38,W*.86,H*.44);c.lineTo(W*.86,H*.5);c.quadraticCurveTo(W*.4,H*.48,W*.12,H*.72);c.fill();c.fillStyle='#0b2a5b';c.font='bold '+H*.13+'px '+FONT;c.textAlign='left';c.fillText(t,W*.06,H*.88)},.22,2.6,z,Math.PI/2)});
 /* window wall: dark sill, slim mullions and a transom, tinted glass, the head beam with a coral line; gate portals */
 bx(AW,.45,.36,'#3d4654',AW/2,.225,-.06);bx(AW,.04,.44,'#cfd5dc',AW/2,.47,-.06);bx(AW,1,.5,'#e8e2d6',AW/2,5.1,-.15);bx(AW,.12,.05,'#ff6b4a',AW/2,4.66,.11);bx(AW,.05,.05,'#0b2a5b',AW/2,4.54,.11);
 const gp=a=>Math.abs(a)<1.45;
 for(let x=0;x<=AW;x+=2){if([1,2,3,4,5,6].some(i=>gp(x-GU(i))))continue;bx(.1,4.15,.16,'#4b5563',x,2.55,-.04)}
 for(let i=1;i<=6;i++){const a=GU(i);[[0,a-1.45],[a+1.45,i<6?GU(i+1)-1.45:AW]].forEach(([x0,x1])=>{if(i>1&&x0==0)return;bx(x1-x0,.07,.14,'#4b5563',(x0+x1)/2,2.95,-.04)})}
 bx(GU(1)-1.45,.07,.14,'#4b5563',(GU(1)-1.45)/2,2.95,-.04);
 {const gw=new THREE.Mesh(new THREE.PlaneGeometry(AW,4.2),new THREE.MeshBasicMaterial({color:'#bfe3ff',transparent:true,opacity:.14,depthWrite:false}));gw.position.set(u(AW/2),2.55,w(-.1));g.add(gw)}
 /* front (camera side) and east walls stay low: a stone parapet, a glass panel and a steel rail; entrance doors slide open */
 [[0,33],[39,AW]].forEach(([x0,x1])=>{const W=x1-x0,m=(x0+x1)/2;bx(W,.36,.3,'#cfc9bc',m,.18,AD-.15,'#e2ddd2');bx(W,.05,.08,'#9aa3ad',m,1.16,AD-.15);glass(W,.78,.04,m,.75,AD-.15)});
 bx(.3,.36,AD,'#cfc9bc',AW-.15,.18,AD/2,'#e2ddd2');bx(.08,.05,AD,'#9aa3ad',AW-.15,1.16,AD/2);glass(.04,.78,AD,AW-.15,.75,AD/2);
 bx(.26,2.5,.34,'#566270',33,1.25,AD-.15);bx(.26,2.5,.34,'#566270',39,1.25,AD-.15);bx(6.26,.2,.34,'#566270',36,2.4,AD-.15);lit(5.6,.05,.05,'#7fd4ff',36,2.28,AD+.03);
 AP.fdoor={o:0,L:glass(2.95,2.2,.06,34.5,1.12,AD-.15),R:glass(2.95,2.2,.06,37.5,1.12,AD-.15)};
 /* ---------- round columns; two airside ones carry flight screens ---------- */
 [[12,46],[24,46],[48,52],[60,52],[12,24],[60,24],[24,24],[48,24]].forEach(([a,b])=>{cy(.46,.46,5.6,16,'#f2efe8',a,0,b);cy(.58,.56,.24,16,'#9aa3ad',a,0,b,{top:'#b8c0ca'});cy(.54,.54,.22,16,'#e2dccf',a,4.9,b);cy(.5,.5,.08,16,'#ff6b4a',a,2.2,b);col(a-.46,b-.46,a+.46,b+.46);sh(a,b,1,1,.25)});
 [[24,24],[48,24]].forEach(([a,b])=>{bx(1.6,1,.16,'#1b2533',a,3.1,b+.5);AP.boards.push({m:pl(g,null,1.44,.86,u(a),3.1,w(b+.59)),n:5,title:'DEPARTURES',cv:null})});
 /* ---------- entrance hall: check-in island ---------- */
 bx(22.4,1.5,.5,'#16408a',16,.75,42.35,'#e9eef5');bx(22.6,.07,.62,'#f4f6f9',16,1.535,42.35);bx(22.4,.1,.03,'#ff6b4a',16,1.2,42.615);
 bx(21.4,.4,.8,'#3a4250',16.5,.2,43.1);bx(21.4,.03,.68,'#20252d',16.5,.415,43.1);[42.68,43.52].forEach(z=>bx(21.4,.06,.05,'#b8c0ca',16.5,.45,z));
 bx(1.3,1.35,1.1,'#566270',5.65,.675,43.1,'#3d4654');bx(.04,.6,.8,'#1b1f26',6.31,.55,43.1);for(let k=0;k<6;k++)bx(.02,.55,.12,'#2b2f36',6.34,.56,42.78+k*.13);
 [6,16,26].forEach(x=>bx(.1,1.15,.1,'#9aa3ad',x,2.1,42.35));
 AP.signs.push({k:'ck',m:fd(lsign(21,1.05,(c,W,H)=>{c.fillStyle='#0b2a5b';c.fillRect(0,0,W,H);c.fillStyle='#ff6b4a';c.fillRect(0,H*.88,W,H*.12);c.fillStyle='#fff';c.textBaseline='middle';c.textAlign='left';c.font='bold '+H*.42+'px '+FONT;c.fillText('SWIFTWING  CHECK-IN',W*.015,H*.44);
  [8,13,18,23].forEach((a,i)=>{const x=(a-5.5)/21*W;c.fillStyle='#ffd84a';c.fillRect(x-H*.3,H*.12,H*.6,H*.62);c.fillStyle='#0b2a5b';c.textAlign='center';c.font='bold '+H*.5+'px '+FONT;c.fillText(String(i+1),x,H*.44)})},16,3.05,42.36),u(5),w(42.2),u(27),w(42.6),3.6)});
 [8,13,18,23].forEach((a,i)=>{bx(3,.8,.8,'#f4f6f9',a,.52,44.75);bx(2.8,.12,.66,'#2b3440',a,.06,44.71);bx(2.8,.46,.03,'#0b2a5b',a,.56,45.165);bx(2.8,.06,.035,'#ff6b4a',a,.84,45.17);
  bx(3.2,.06,1,'#cfd5dc',a,.95,44.8);bx(3,.16,.26,'#f4f6f9',a,1.06,45.08,'#dfe5ec');bx(.06,.28,.06,'#2b2f36',a-.7,1.12,44.55);bx(.62,.4,.05,'#1b2533',a-.7,1.42,44.58);lit(.54,.32,.01,'#4f8fe0',a-.7,1.42,44.55);bx(.32,.16,.26,'#566270',a+.75,1.06,44.6);
  sign(g,.42,.22,String(i+1),u(a+1.1),1.06,w(45.215),0,{bg:'#ff6b4a',fg:'#fff'});
  const sx=a+2.5;bx(1.3,.26,.85,'#3a4250',sx,.13,44.75,'#20252d');for(let k=0;k<5;k++)bx(.05,.02,.78,'#7d8691',sx-.5+k*.25,.27,44.75);bx(.08,.62,.08,'#9aa3ad',sx+.58,.31,45.12);lit(.26,.12,.02,'#56f08a',sx+.58,.62,45.17);sh(a+.6,44.75,4.4,.9,.25)});
 col(5,42,27,45.2);sh(16,42.7,22.4,1.2,.25);
 belt(6,47.5,15.2,47.5);belt(16.8,47.5,26,47.5);belt(6,46.4,6,47.5);belt(26,46.4,26,47.5);
 /* moving bags on the check-in belt, into the tunnel at the west end */
 AP.bags=[];for(let k=0;k<4;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(.5,.32,.32),pm(['#c0392b','#2d5a8d','#1b1b1b','#e6b422'][k]));m.position.set(u(26-k*5.2),.6,w(43.1));g.add(m);AP.bags.push({m,k:'ck',p:26-k*5.2})}
 /* ticket desk: rounded coral-banded counter, back wall with a lit line, the sign above */
 bx(8,2.2,.4,'#0b2a5b',50,1.1,42.6,'#16408a');lit(7.6,.08,.02,'#ff8a6a',50,1.95,42.81);lit(7.6,.08,.02,'#ff8a6a',50,.3,42.81);
 counter(50,44.75,7,'#f4f6f9','#cfd5dc','#ff6b4a',0,1);bx(7,.32,.03,'#ff6b4a',50,.6,45.165);
 [48,52].forEach(x=>{bx(.06,.28,.06,'#2b2f36',x,1.12,44.55);bx(.62,.4,.05,'#1b2533',x,1.42,44.58);lit(.54,.32,.01,'#4f8fe0',x,1.42,44.55)});bx(.32,.16,.26,'#566270',50,1.06,44.6);
 fd(lsign(8,1,txt('TICKETS · CHANGES','#ff6b4a','#fff',{bar:'#0b2a5b'}),50,2.85,42.85),u(46),w(42.3),u(54),w(42.9),3.4);col(46,42.4,54,45.2);
 /* information: a C-shaped round desk and an "i" totem */
 for(let k=0;k<9;k++){const t=-.38+k*(Math.PI+.76)/8,x=62+Math.cos(t)*1.2,z=46.9+Math.sin(t)*1.2,ry=-t-Math.PI/2;bx(.62,.8,.32,'#f4f6f9',x,.52,z,undefined,ry);bx(.6,.12,.34,'#2b3440',x,.06,z,undefined,ry);bx(.64,.1,.34,'#1565d8',x,.62,z,undefined,ry);bx(.68,.06,.42,'#cfd5dc',x,.95,z,undefined,ry)}
 bx(.7,3.4,.4,'#1565d8',62,1.7,45.4,'#0b2a5b');sign(g,.56,.56,'i',u(62),2.9,w(45.61),0,{bg:'#ffffff',fg:'#1565d8',font:'Georgia,serif'});sign(g,.6,.2,'INFORMATION',u(62),2.4,w(45.61),0,{bg:'#1565d8',fg:'#fff'});
 col(60.6,45.2,63.4,48.2);sh(62,47,2.8,2.6,.2);pool(62,47,2.4);
 /* landside board on the west wall, framed */
 bx(.14,5.8,11.4,'#1b2533',.07,2.9,48);AP.boards.push({m:pl(g,null,11,5.4,u(.16),2.9,w(48),Math.PI/2),n:9,title:'DEPARTURES',cv:null});
 /* Bean There: a café kiosk with menu boards, slatted counter, pastry case and espresso machine */
 bx(6.2,2.6,.3,'#4a3324',67,1.3,37.35,'#3a2618');lsign(4.8,.8,(c,W,H)=>{c.fillStyle='#2a1d14';c.fillRect(0,0,W,H);c.fillStyle='#ffe0b0';c.font='bold '+H*.32+'px '+FONT;c.textBaseline='middle';['FLAT WHITE 6','ICED LATTE 7','MUFFIN 5'].forEach((t,i)=>{c.textAlign='center';c.fillText(t,W*(i+.5)/3,H*.5)})},67,2.05,37.52);
 bx(5,.05,.22,'#6b4a32',67,1.35,37.62);for(let k=0;k<8;k++)bx(.14,.16,.14,k%3?'#ffffff':'#ff6b4a',64.9+k*.6,1.46,37.62);
 counter(67,38.95,5.6,'#6b4a32','#e9dcc6',0,'#8a6243');bx(1.4,.05,.6,'#cfd5dc',65.1,1.01,39.05);[[64.7,'#e0a060'],[65.1,'#c06090'],[65.5,'#f4d36a']].forEach(([x,c])=>{bx(.26,.12,.2,c,x,1.1,38.95);bx(.26,.12,.2,c,x,1.1,39.25)});glass(1.4,.4,.62,65.1,1.23,39.05);
 bx(.9,.55,.5,'#c5ccd4',68.4,1.27,38.75,'#9aa3ad');bx(.7,.08,.08,'#2b2f36',68.4,1.15,39.02);[68.15,68.65].forEach(x=>bx(.12,.1,.12,'#ffffff',x,1.04,39.05));
 canopy(64,70,39.45,'#4a3324','#6b4a32','BEAN THERE','#2a1d14','#ffe0b0');col(64,37.2,70,39.7);
 [65.2,68.8].forEach(x=>{cy(.2,.2,.05,10,'#2b2f36',x,0,40.75);cy(.04,.04,.66,6,'#9aa3ad',x,.05,40.75);cy(.24,.24,.08,12,'#6b4a32',x,.66,40.75);col(x-.24,40.5,x+.24,41);sh(x,40.75,.4,.4,.15)});
 /* ---------- security: glass partitions, X-ray lanes, arches ---------- */
 [[14,28],[58,28]].forEach(([m,W])=>{bx(W,.36,.3,'#16408a',m,.18,SECV,'#0b2a5b');bx(W,.06,.14,'#9aa3ad',m,2.62,SECV);for(let x=m-W/2;x<=m+W/2+.01;x+=3.5)bx(.08,2.3,.12,'#9aa3ad',x,1.5,SECV);
  const q=new THREE.Mesh(new THREE.PlaneGeometry(W,2.24),new THREE.MeshBasicMaterial({color:'#cfe8ff',transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide}));q.position.set(u(m),1.48,w(SECV));g.add(q)});
 col(0,SECV-.2,28,SECV+.2);col(44,SECV-.2,AW,SECV+.2);
 LANES.forEach((a,i)=>{const xa=a-1.7;
  bx(1.25,1.25,1.7,'#dde1e7',xa,.78,SECV+.4,'#c5cbd2');bx(1.05,.16,1.6,'#c5cbd2',xa,1.48,SECV+.4,'#d7dbe2');bx(1.15,.15,1.6,'#3d4654',xa,.075,SECV+.4);bx(.02,.12,1.5,'#1565d8',xa+.63,1.15,SECV+.4);
  [SECV+1.26,SECV-.46].forEach((z,j)=>{bx(.82,.52,.03,'#1b1f26',xa,1.18,z);for(let k=0;k<6;k++)bx(.12,.48,.02,'#2b2f36',xa-.33+k*.13,1.18,z+(j?-.025:.025))});
  [[SECV+1.25,SECV+3],[SECV-2.2,SECV-.45]].forEach(([z0,z1])=>{const m=(z0+z1)/2,L=z1-z0;bx(.08,.12,L,'#b8c0ca',xa-.44,.9,m);bx(.08,.12,L,'#b8c0ca',xa+.44,.9,m);for(let z=z0+.1;z<z1;z+=.2)bx(.8,.05,.07,'#6b7480',xa,.92,z);
   [z0+.15,z1-.15].forEach(z=>{bx(.06,.86,.06,'#7d8691',xa-.42,.43,z);bx(.06,.86,.06,'#7d8691',xa+.42,.43,z)})});
  bx(.6,.1,.45,'#5f6873',xa,1,SECV+2.2);bx(.24,.06,.2,'#2d5a8d',xa-.1,1.07,SECV+2.2);bx(.6,.1,.45,'#5f6873',xa,1,SECV-1.4);bx(.3,.08,.16,'#1b1b1b',xa+.05,1.07,SECV-1.4);
  for(let k=0;k<5;k++)bx(.6,.06,.45,'#5f6873',xa,.98+k*.07,SECV+2.75);
  bx(.06,.34,.5,'#1b2533',xa+.62,1.75,SECV-.1);lit(.01,.28,.44,'#5aa0ff',xa+.656,1.75,SECV-.1);
  col(a-2.3,SECV-2.2,a-1.1,SECV+3);sh(xa,SECV+.4,1.3,5.2,.2);
  [-1,1].forEach(s=>{bx(.24,2.3,.42,'#c5cbd2',a+s*.95,1.15,SECV,'#dfe3e8');lit(.02,1.8,.1,'#7fd4ff',a+s*.82,1.1,SECV);bx(.4,.04,.6,'#566270',a+s*.95,.02,SECV)});
  bx(2.14,.34,.46,'#c5cbd2',a,2.47,SECV,'#e8ebef');col(a-1.1,SECV-.2,a-.8,SECV+.2);col(a+.8,SECV-.2,a+1.1,SECV+.2);
  const lm=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.42),new THREE.MeshBasicMaterial({color:'#2fe68a'}));lm.position.set(u(a),2.7,w(SECV));g.add(lm);AP.doorM.push({k:'sec',m:lm,t:0});
  sign(g,1.1,.26,'LANE '+(i+1),u(a),2.47,w(SECV+.235),0,{bg:'#0b2a5b',fg:'#fff'});pool(a,SECV+.8,1.6)});
 belt(32.1,SECV,33.6,SECV);belt(37.1,SECV,39,SECV);belt(42.4,SECV,44,SECV);
 AP.signs.push({k:'sec',m:fd(sign(g,16,1.1,'SECURITY · BOARDING PASS NEEDED',u(36),3.7,w(SECV+.3),0,{bg:'#0b2a5b',fg:'#ffd84a'}),u(28),w(SECV+.2),u(44),w(SECV+.4),4.3)});
 /* vending machines and an ATM against the landside face of the security wall; lockers; a trolley bay */
 [[52.1,'#ff6b4a'],[53.8,'#2d5a8d']].forEach(([x,c])=>{bx(1.5,2,.8,c,x,1,34.95,'#ffffff');lit(1.05,1.4,.02,'#bfe9ff',x-.15,1.2,35.36);for(let r=0;r<4;r++)for(let k=0;k<4;k++)bx(.16,.22,.02,['#c0392b','#2fae5a','#e6b422','#7a5ad8'][(r+k)%4],x-.5+k*.24,.68+r*.32,35.38);bx(.22,.5,.03,'#2b2f36',x+.55,1.2,35.37)});
 bx(.9,1.8,.6,'#0b2a5b',55.5,.9,34.85,'#16408a');lit(.5,.36,.02,'#56f08a',55.5,1.35,35.16);bx(.6,.06,.2,'#566270',55.5,1,35.2);col(51.2,34.4,56,35.4);sh(53.6,34.9,4.8,.9,.2);
 for(let i=0;i<6;i++){bx(.9,2,.9,i%2?'#ff6b4a':'#7fb2dd',3.6+i*.95,1,35.6,'#ffffff');bx(.6,.04,.02,'#1b2533',3.6+i*.95,1.5,36.06);bx(.6,.04,.02,'#1b2533',3.6+i*.95,.7,36.06)}col(3,35,9.4,36.2);sh(6,35.6,5.8,1,.2);
 for(let k=0;k<4;k++){const x=3.2+k*.3;bx(1.1,.06,.66,'#9aa3ad',x,.24,41.3);bx(.05,.85,.66,'#9aa3ad',x-.52,.65,41.3);bx(.9,.04,.6,'#cfd5dc',x,.62,41.3);bx(.06,.06,.7,'#ff6b4a',x-.55,1.08,41.3)}col(2.4,40.9,5.2,41.7);sh(3.8,41.3,2.4,.7,.2);
 /* gardens either side of the compass rose, landside planters, a baggage reclaim carousel, seats, bins */
 [28,44].forEach(x=>{bx(2.2,.7,6.6,'#e6e0d2',x,.35,46,'#f4efe3');bx(1.8,.05,6.2,'#4a3324',x,.72,46);bx(1.4,.7,2.4,'#37a062',x,1.1,43.6);bx(1.4,.7,2.4,'#2e8b57',x,1.1,48.4);for(let k=0;k<6;k++)bx(.3,.3,.3,['#ff6b4a','#ffd84a','#ff8fb0'][k%3],x+(k%2?.4:-.4),1.55,43+k*1.1);
  tree(G,u(x),w(46),.7,.7);col(x-1.1,42.7,x+1.1,49.3);sh(x,46,2.2,6.6,.25)});
 const planter=(x,z,s,r)=>{cy(r,r*.86,.7,14,'#e6e0d2',x,0,z,{top:'#4a3324'});cy(r+.03,r+.03,.06,14,'#cfc9bc',x,.66,z,{cap:false});palm(G,u(x),w(z),s,.7);col(x-r,z-r,x+r,z+r);sh(x,z,r*2,r*2,.2)};
 [[3,54],[70,54],[3,38],[30,52],[42,52]].forEach(([x,z])=>planter(x,z,1.1,.6));
 {const cx=66,cz=52,o={sx:2.7,sz:1.35};cy(1,1,.4,32,'#9aa3ad',cx,0,cz,Object.assign({top:'#b8c0ca'},o));xgRing(G,.64,.98,.42,32,'#2b2f36',u(cx),w(cz),o);cy(1.03,1.03,.08,32,'#cfd5dc',cx,.4,cz,Object.assign({cap:false},o));
  cy(.62,.55,.7,32,'#c5ccd4',cx,0,cz,Object.assign({top:'#dfe3e8'},o));for(let k=0;k<32;k++){const t=k/32*Math.PI*2;bx(.02,.012,.34,'#4b5563',cx+Math.cos(t)*.81*2.7,.43,cz+Math.sin(t)*.81*1.35,undefined,-t+Math.PI/2)}
  col(cx-2.7,cz-1.35,cx+2.7,cz+1.35);sh(cx,cz,5.4,2.7,.3);bx(.14,2.4,.14,'#566270',63.2,1.2,50.2);bx(1.5,.9,.1,'#1b2533',63.2,2.6,50.2);lsign(1.36,.76,(c,W,H)=>{c.fillStyle='#0d1522';c.fillRect(0,0,W,H);c.fillStyle='#ffd84a';c.fillRect(0,0,W,H*.3);c.fillStyle='#0b2a5b';c.font='bold '+H*.2+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('BAGGAGE RECLAIM',W/2,H*.15);
   c.fillStyle='#fff';c.font='bold '+H*.42+'px '+FONT;c.fillText('BELT 1',W/2,H*.62);c.fillStyle='#56f08a';c.font='bold '+H*.14+'px '+FONT;c.fillText('ARRIVALS · ON BELT',W/2,H*.88)},63.2,2.6,50.26);col(63.05,50.05,63.35,50.35);
  for(let k=0;k<7;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(.52,.3,.34),pm(['#c0392b','#2d5a8d','#1b1b1b','#e6b422','#7a5ad8','#2fae5a','#9aa3ad'][k]));g.add(m);AP.bags.push({m,k:'car',p:k/7*Math.PI*2+R(0,.4),cx,cz})}pool(cx,cz,3.4)}
 seats(56,50.5,4,1,'#1565d8','#0b2a5b');seats(56,53.5,4,1,'#1565d8','#0b2a5b');col(54,50,58,50.95);col(54,53,58,53.95);
 const bin=(x,z)=>{cy(.26,.24,.85,12,'#566270',x,0,z,{top:'#2b3440'});cy(.27,.27,.1,12,'#ff6b4a',x,.7,z,{cap:false});col(x-.26,z-.26,x+.26,z+.26);sh(x,z,.5,.5,.15)};
 [[28.6,41.1],[44,41.1],[27.4,19.3],[46.4,19.2],[2.2,28.6],[69.6,28.6]].forEach(([x,z])=>bin(x,z));
 AP.signs.push({k:'wel',m:fd(sign(g,16,1.5,'WELCOME',u(36),4.4,w(50.4),0,{bg:'#ffffff',fg:'#0b2a5b',bar:'#ff6b4a'}),u(28),w(50.3),u(44),w(50.5),5.2)});
 pool(36,46,5);pool(16,46.4,6);pool(50,46,3.6);pool(36,53,3.4);
 /* ---------- airside ---------- */
 AP.boards.push({m:fd(pl(g,null,14,4.6,u(36),3.9,w(29.6)),u(29),w(29.5),u(43),w(29.7),6.2),n:8,title:'DEPARTURES',cv:null});
 fdBox(14.5,5.1,.24,'#1b2533',36,3.9,29.45,[29,29.3,43,29.6,6.4]);[30,42].forEach(x=>{bx(.3,1.4,.3,'#566270',x,.7,29.45,'#3d4654');bx(.6,.06,.6,'#3d4654',x,.03,29.45);col(x-.2,29.3,x+.2,29.6)});
 fd(sign(g,9,1.2,'⟵  GATES 1 · 2 · 3',u(16),4.4,w(27.4),0,{bg:'#0b2a5b',fg:'#ffd84a',al:'left'}),u(11.5),w(27.3),u(20.5),w(27.5),5);fd(sign(g,9,1.2,'GATES 4 · 5 · 6  ⟶',u(56),4.4,w(27.4),0,{bg:'#0b2a5b',fg:'#ffd84a'}),u(51.5),w(27.3),u(60.5),w(27.5),5);
 /* Sky Shop: wall shelving, two gondolas, a counter, a fascia with a lit sign on the open side */
 const prod=(x,y,z,n,L,ax)=>{for(let k=0;k<n;k++){const p=-L/2+L*(k+.5)/n,c=['#c06090','#5aa0d8','#e6b422','#7a5ad8','#2fae5a','#ff6b4a','#f4f6f9'][(k*3+Math.round(y*7))%7],X=ax=='z'?x:x+p,Z=ax=='z'?z+p:z;
  if(k%3==0)cy(.06,.05,.26,6,c,X,y,Z,{top:'#2b2f36'});else bx(.2,.22+(k%2)*.08,.2,c,X,y+.12+(k%2)*.04,Z)}};
 [17,20.4,23.8].forEach(z=>{bx(.1,2.6,3.2,'#f6e3ec',.15,1.3,z);[-1,1].forEach(s=>bx(1,2.6,.08,'#c06090',.6,1.3,z+s*1.6));[.35,.9,1.45,2].forEach(y=>{bx(.9,.04,3.1,'#ffffff',.65,y,z);prod(.65,y+.02,z,9,2.9,'z')});bx(1,.3,3.2,'#c06090',.6,2.75,z);lit(.02,.08,3,'#ffd6ea',1.11,2.62,z)});
 [17.2,25].forEach(z=>{bx(2.8,.15,1,'#c06090',4.6,.075,z);bx(2.8,1.5,.08,'#f6e3ec',4.6,.9,z);bx(2.9,.06,1.04,'#c06090',4.6,1.68,z);[.45,.85,1.25].forEach(y=>[-1,1].forEach(s=>{bx(2.7,.03,.4,'#ffffff',4.6,y,z+s*.24);prod(4.6,y+.015,z+s*.26,8,2.5,'x')}));col(3.2,z-.6,6,z+.6);sh(4.6,z,2.8,1,.2)});
 counter(5,21,3,'#f4f6f9','#cfd5dc','#c06090');bx(2.8,.4,.03,'#c06090',5,.55,21.415);bx(.4,.25,.35,'#2b2f36',5.9,1.11,20.95);lit(.3,.16,.01,'#56f08a',5.9,1.18,21.13);for(let k=0;k<5;k++)cy(.05,.045,.18,6,['#ff8fb0','#e6b422','#7fd4ff','#c06090','#ffffff'][k],4.1+k*.25,.99,21.2,{top:'#ffd84a'});
 col(0,15.2,1.2,26.4);col(3.5,20.4,6.5,21.6);bx(.2,3.4,.2,'#c06090',9.2,1.7,15.4);bx(.2,3.4,.2,'#c06090',9.2,1.7,26.4);col(9.1,15.3,9.3,15.5);col(9.1,26.3,9.3,26.5);
 fdBox(.3,.6,11.2,'#c06090',9.2,3.4,20.9,[9,15.3,9.4,26.5,3.8]);fd(lsign(9.2,.5,txt('SKY SHOP · DUTY FREE','#c06090','#fff'),9.36,3.4,20.9,Math.PI/2),u(9),w(15.3),u(9.5),w(26.5),3.8);pool(4.6,21,3.6);
 /* Cloud Nine Coffee */
 bx(8,2.6,.3,'#4a3324',23,1.3,15.6,'#3a2618');lsign(5.2,.8,(c,W,H)=>{c.fillStyle='#2a1d14';c.fillRect(0,0,W,H);c.fillStyle='#ffe0b0';c.textBaseline='middle';c.textAlign='center';c.font='bold '+H*.3+'px '+FONT;['CAPPUCCINO 7','MOCHA 8','CROISSANT 6','BAGEL 7'].forEach((t,i)=>c.fillText(t,W*(i+.5)/4,H*.5))},23,2.05,15.77);
 bx(6,.05,.22,'#6b4a32',23,1.35,15.87);for(let k=0;k<10;k++)bx(.14,.18,.14,k%2?'#ffffff':'#7fd4ff',20.3+k*.6,1.47,15.87);
 counter(23,17.45,7.6,'#6b4a32','#ece6dc',0,'#8a6243');bx(1.4,.05,.6,'#cfd5dc',25.6,1.01,17.55);[[25.2,'#e0a060'],[25.6,'#c8925a'],[26,'#f4d36a']].forEach(([x,c])=>{bx(.26,.12,.2,c,x,1.1,17.45);bx(.26,.12,.2,c,x,1.1,17.75)});glass(1.4,.4,.62,25.6,1.23,17.55);
 bx(1.1,.6,.55,'#c5ccd4',21,1.29,17.2,'#9aa3ad');bx(.9,.08,.08,'#2b2f36',21,1.16,17.49);bx(.3,.5,.3,'#2b2f36',22.2,1.24,17.2);cy(.12,.1,.18,8,'#c5ccd4',22.2,1.5,17.2);
 canopy(19,27,17.95,'#4a3324','#6b4a32','CLOUD NINE COFFEE','#2a1d14','#ffe0b0');col(19,15.4,27,18);
 const chair=(x,z,ry)=>{const f=ry?-1:1;bx(.42,.05,.42,'#6b4a32',x,.45,z);[[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]].forEach(([a,b])=>bx(.04,.45,.04,'#2b2f36',x+a,.22,z+b));bx(.42,.4,.05,'#6b4a32',x,.7,z-f*.2)};
 [[19.4,21.6],[22.4,21.6],[19.4,24.9],[22.4,24.9]].forEach(([x,z])=>{cy(.25,.25,.04,10,'#2b2f36',x,0,z);cy(.05,.05,.7,6,'#2b2f36',x,.04,z);cy(.5,.5,.05,14,'#f4efe6',x,.72,z,{top:'#fbf8f2'});cy(.06,.05,.1,6,'#ffffff',x+.15,.77,z);chair(x,z-.72,0);chair(x,z+.72,1);col(x-.5,z-.95,x+.5,z+.95);sh(x,z,1,1.8,.15)});
 /* Pages newsstand: tilted magazine racks, a lit drinks fridge, a small counter */
 bx(6,2.4,.3,'#2b3440',50,1.2,15.6,'#1b2533');for(let r=0;r<4;r++){bx(4.2,.04,.26,'#3a4552',49,.45+r*.45,15.88);for(let k=0;k<10;k++)br(.34,.44,.03,['#c0392b','#2d5a8d','#e6b422','#2fae5a','#7a5ad8','#ff8fb0','#f4f6f9'][(k+r*3)%7],47.2+k*.4,.68+r*.45,15.9,-.28,0)}
 bx(1.2,2.1,.8,'#d7dbe2',52.3,1.05,16.05,'#ffffff');lit(1,1.8,.02,'#d9f2ff',52.3,1.1,16.46);for(let r=0;r<4;r++)for(let k=0;k<5;k++)bx(.12,.3,.02,['#ff6b4a','#2fae5a','#5aa0d8','#e6b422'][(r+k)%4],51.9+k*.2,.5+r*.42,16.48);
 counter(48.6,17.1,2.6,'#3a4552','#ffd84a','#ffd84a');bx(.4,.25,.35,'#2b2f36',49.4,1.11,17.05);for(let k=0;k<6;k++)bx(.14,.08,.08,['#ff6b4a','#2fae5a','#5aa0d8'][k%3],47.8+k*.18,1.03,17.45);
 canopy(47,53,17.45,'#2b3440','#ffd84a','PAGES · NEWS','#ffd84a','#111111');col(47,15.4,53,17.5);
 /* Runway Burgers: tiled back wall, lit menus, grill with hood, fryer, red counter with chrome trim */
 bx(10,2.6,.3,'#7a241a',64,1.3,15.6,'#5a1a12');tpl(cvs(640,64,(c,W,H)=>{c.fillStyle='#f4efe6';c.fillRect(0,0,W,H);c.strokeStyle='#d6cfc2';c.lineWidth=2;for(let y=0;y<=H;y+=16){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}for(let r=0;r<4;r++)for(let x=(r%2)*16;x<W;x+=32){c.beginPath();c.moveTo(x,r*16);c.lineTo(x,r*16+16);c.stroke()}}),9.6,.9,64,1.1,15.76);
 [[61.4,'BURGER 14'],[64,'WRAP 12 · FRIES 6'],[66.6,'SHAKE 8']].forEach(([x,t])=>lsign(2.4,.8,(c,W,H)=>{c.fillStyle='#1b1b1b';c.fillRect(0,0,W,H);c.fillStyle='#e6b422';c.beginPath();c.ellipse(W*.18,H*.42,H*.26,H*.16,0,0,7);c.fill();c.fillStyle='#7a3a1a';c.fillRect(W*.06,H*.48,H*.52,H*.1);c.fillStyle='#e6b422';c.fillRect(W*.06,H*.58,H*.52,H*.1);
  c.fillStyle='#fff';c.font='bold '+H*.24+'px '+FONT;c.textAlign='left';c.textBaseline='middle';c.fillText(t,W*.36,H*.5)},x,2.1,15.77));
 bx(2,.9,.7,'#5b636d',60.6,.45,16.15,'#2b2f36');lit(1.8,.01,.5,'#ff7a3a',60.6,.91,16.15);for(let k=0;k<4;k++)bx(.3,.06,.3,'#7a3a1a',60.0+k*.4,.94,16.15);bx(2.2,.5,.9,'#c5ccd4',60.6,2.3,16.15,'#9aa3ad');
 bx(6.2,.9,.7,'#b8c0ca',65.5,.45,16.15,'#cfd5dc');bx(1,.12,.6,'#2b2f36',63.2,.96,16.15);[62.95,63.45].forEach(x=>bx(.36,.14,.4,'#9aa3ad',x,1.05,16.15));bx(1,1.1,.6,'#d7dbe2',67.6,1.45,16.0,'#9aa3ad');[67.3,67.6,67.9].forEach((x,i)=>lit(.2,.4,.02,['#c0392b','#e6b422','#2fae5a'][i],x,1.6,16.31));
 counter(64,17.45,9.6,'#c0392b','#f4f6f9','#dfe5ec');bx(9.6,.05,.03,'#dfe5ec',64,.18,17.86);[61.2,66.8].forEach(x=>{bx(.4,.25,.35,'#2b2f36',x,1.11,17.35);lit(.3,.16,.01,'#56f08a',x,1.18,17.53)});[[62.5,'#e6b422'],[64,'#e6b422'],[65.4,'#c0392b']].forEach(([x,c])=>{bx(.6,.04,.42,c,x,1.01,17.6);bx(.22,.14,.22,'#c8925a',x-.1,1.1,17.6)});
 canopy(59,69,17.95,'#7a241a','#c0392b','RUNWAY BURGERS','#b33a2a','#ffffff');col(59,15.4,69,18);
 /* kiosks: Fern & Bloom and Tech Hub (rounded counters, back displays, lit signs) */
 [[12,'FERN & BLOOM','#c2457c','#ffe3ee','#8a6243'],[55,'TECH HUB','#16408a','#cfe6ff','#2b3440']].forEach(([x,t,a,b,body],j)=>{
  counter(x,22.1,4.6,body,'#f4efe6',a,0,1);bx(4.4,.36,.03,a,x,.56,22.515);bx(5.2,2.2,.2,'#3a4552',x,1.1,20.15,'#2b3440');bx(5.4,.5,.3,a,x,2.45,20.15);lsign(4.2,.38,txt(t,a,'#fff',{s:.72}),x,2.45,20.31);
  if(!j){for(let k=0;k<8;k++){const bx0=x-2+k*.57;cy(.13,.11,.22,8,'#9aa3ad',bx0,.99,22.15);bx(.16,.2,.16,'#2f8a4f',bx0,1.27,22.15);bx(.2,.16,.2,['#ff6b4a','#ffd84a','#ff8fb0','#ffffff','#c2457c'][k%5],bx0+.04,1.42,22.12)}
   [.6,1.2,1.8].forEach((y,r)=>{bx(4.6,.04,.3,'#8a6243',x,y,20.4);for(let k=0;k<7;k++){cy(.1,.08,.16,8,'#e6e0d2',x-1.9+k*.63,y+.02,20.4);bx(.18,.18,.18,['#3aa062','#ff8fb0','#ffd84a','#c2457c'][(k+r)%4],x-1.9+k*.63,y+.27,20.4)}})}
  else{lit(4,.06,.66,'#cfe6ff',x,.99,22.1);glass(4.2,.3,.8,x,1.14,22.15);for(let k=0;k<7;k++){bx(.18,.02,.34,'#1b2533',x-1.8+k*.6,1.04,22.15);if(k%2)xgRing(G,.1,.14,1.06,10,'#e6eaef',u(x-1.8+k*.6+.24),w(22.1))}
   [-1.6,0,1.6].forEach((d,i)=>{bx(1.3,.8,.05,'#1b2533',x+d,1.35,20.27);lsign(1.2,.7,(c,W,H)=>{const gr=c.createLinearGradient(0,0,W,H);gr.addColorStop(0,['#16408a','#7a5ad8','#1565d8'][i]);gr.addColorStop(1,'#7fd4ff');c.fillStyle=gr;c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.85)';c.fillRect(W*.38,H*.2,W*.24,H*.6)},x+d,1.35,20.3)})}
  col(x-2.9,20,x+2.9,22.8);sh(x,21.3,5.4,2.6,.2);pool(x,22.6,3)});
 /* airside seating, palms, planters, the play corner */
 [[33,21],[33,24.5],[39,21],[39,24.5]].forEach(([a,b])=>{seats(a,b,5,1,'#566270','#2b3440');col(a-2.5,b-.5,a+2.5,b+.45)});
 [12.5,24.5,36.5,48.5,60.5].forEach(x=>planter(x,8.8,.95,.9));
 cy(1.7,1.6,.6,16,'#e6e0d2',36,0,18.5,{sx:1,sz:.5,top:'#4a3324'});palm(G,u(35.2),w(18.5),.8,.6);palm(G,u(36.8),w(18.5),.8,.6);col(34.3,17.65,37.7,19.35);sh(36,18.5,3.4,1.7,.2);
 {const x=66,z=23.6;[[64,22.7,'#ff6b4a'],[66.2,24.6,'#ffd84a'],[68.2,22.6,'#2a6cc0'],[64.8,24.9,'#7a5ad8']].forEach(([a,b,c],i)=>{cy(.55,.55,.5,12,c,a,0,b,{top:'#ffffff'});cy(.3,.3,.4,10,['#ffffff','#2fae5a'][i%2],a,.5,b)});
  bx(.9,.06,2.2,'#ff6b4a',67.6,.7,24.6);br(.9,.06,1.6,'#ffd84a',67.6,.4,25.9,.5,0);[-1,1].forEach(s=>bx(.06,.9,.06,'#9aa3ad',67.6+s*.42,.35,23.6));
  bx(2.4,.4,.7,'#f4f6f9',64.6,.55,23.8);bx(.3,.5,1.2,'#f4f6f9',64.6,.6,23.8);bx(.4,.6,.08,'#ff6b4a',63.5,.85,23.8);col(62.4,21.3,69.6,26);sh(x,23.6,7.2,4.7,.1)}
 /* ---------- gates ---------- */
 AP.gdoor=[];
 for(let i=1;i<=6;i++){const a=GU(i);
  [-1,1].forEach(s=>bx(.3,3.2,.5,'#0b2a5b',a+s*1.3,1.6,.05));bx(2.9,.6,.5,'#0b2a5b',a,3.45,.05);lit(2.2,.06,.04,'#ff8a6a',a,3.2,.32);
  const mk=(dx)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1.1,2.6,.08),pm('#c5cbd2'));m.position.set(u(a+dx),1.3,w(.34));const p=new THREE.Mesh(new THREE.BoxGeometry(.6,1.3,.02),new THREE.MeshBasicMaterial({color:'#2a3a52'}));p.position.set(0,.3,.05);m.add(p);g.add(m);return m};
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(.4,.12,.06),new THREE.MeshBasicMaterial({color:'#c0392b'}));lamp.position.set(u(a),2.95,w(.34));g.add(lamp);
  AP.doorM.push({k:'door',i,L:mk(-.55),R:mk(.55),lamp,o:0,x:u(a)});
  sign(g,2.6,1.1,'GATE '+i,u(a),4.15,w(.12),0,{bg:'#ffd84a',fg:'#0b2a5b'});
  const sc=pl(g,null,2.6,1.5,u(a-3.4),2.3,w(.17));AP.gates.push({i,m:sc,cv:null,key:''});bx(2.86,1.76,.12,'#1b2533',a-3.4,2.3,.07);
  bx(2.2,.85,.8,'#f4f6f9',a+3.4,.545,4.65);bx(2.1,.12,.66,'#2b3440',a+3.4,.06,4.62);[-1,1].forEach(s=>{cy(.4,.4,.85,12,'#f4f6f9',a+3.4+s*1.1,.12,4.65);cy(.48,.48,.06,12,'#cfd5dc',a+3.4+s*1.1,.94,4.68)});
  bx(2.2,.42,.03,'#0b2a5b',a+3.4,.58,5.065);bx(2.4,.06,.96,'#cfd5dc',a+3.4,.97,4.68);bx(.06,.28,.06,'#2b2f36',a+3.1,1.12,4.45);bx(.62,.4,.05,'#1b2533',a+3.1,1.42,4.48);lit(.54,.32,.01,'#4f8fe0',a+3.1,1.42,4.45);
  sign(g,.9,.28,'GATE '+i,u(a+3.4),.58,w(5.09),0,{bg:'#ffd84a',fg:'#0b2a5b'});col(a+1.9,4.2,a+4.9,5.1);sh(a+3.4,4.65,3,.9,.25);
  [7.6,10].forEach(b=>{seats(a-.5,b,6,1,'#1565d8','#0b2a5b');col(a-3.5,b-.5,a+2.5,b+.45)});
  bx(.32,.95,.32,'#2b3440',a+3.1,.475,8.8,'#3d4654');lit(.04,.5,.12,'#56f08a',a+3.27,.6,8.8);col(a+2.94,8.64,a+3.26,8.96);sh(a+3.1,8.8,.3,.3,.15);
  belt(a-1.2,1.15,a-1.2,3.3,'#ff6b4a');belt(a+1.2,1.15,a+1.2,3.3,'#ff6b4a');
  /* a slim pylon with the lit gate number, in place of the old hanging cube */
  const px=a-4.1;bx(.42,3.3,.42,'#0b2a5b',px,1.65,11,'#16408a');bx(.6,.12,.6,'#3d4654',px,.06,11);sign(g,.42,.9,String(i),u(px),2.75,w(11.215),0,{bg:'#ffd84a',fg:'#0b2a5b'});col(px-.21,10.79,px+.21,11.21);sh(px,11,.4,.4,.15);
  pool(a-.5,8.8,4.4);
  /* sun through each window bay, left out where the portal or the gate screen stands */
  for(let x=a-6;x<a+6;x+=2){if(Math.abs(x+1-a)<2.2||Math.abs(x+1-(a-3.4))<1.6)continue;SU.q(u(x+.1),w(.2),u(x+1.9),w(5.6),.02,1.8)}}
 /* wall clocks: one on the west wall by gate 1, one on the window head beam */
 AP.clocks=[];const clock=(x,y,z,ry,s)=>{const cv=can(128,128),m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:cv.t,transparent:true}));m.position.set(u(x),y,w(z));m.rotation.y=ry;g.add(m);AP.clocks.push({cv,k:''})};
 clock(.16,3.5,6,Math.PI/2,1.3);clock(36,5.06,.13,0,.9);
 /* concourse light pools */
 for(let x=6;x<AW;x+=8)pool(x,13.3,2.6);for(let x=10;x<AW;x+=12)pool(x,28,3);
 fl(G,g);(xgFlush(GL,new THREE.MeshBasicMaterial({vertexColors:true}))||[]).forEach(m=>{scene.remove(m);g.add(m)});
 SH.mesh(g,new THREE.MeshBasicMaterial({map:softTex('sh'),transparent:true,depthWrite:false,opacity:.85}),1);
 AP.fx={pool:PO.mesh(g,new THREE.MeshBasicMaterial({map:softTex('pool'),color:'#ffe0a6',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.12}),2),
  sun:SU.mesh(g,new THREE.MeshBasicMaterial({map:softTex('sun'),color:'#fff1c8',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.2,side:THREE.DoubleSide}),2)};
 /* outside the window wall: apron with markings, jet bridges with rotundas, parked jets, ground equipment, a baggage tug */
 {const ap=new THREE.Mesh(new THREE.PlaneGeometry(110,70),pm('#6f757d'));ap.rotation.x=-Math.PI/2;ap.position.set(u(AW/2),-.04,w(-35));g.add(ap);
  const G2=xgNew(),B=(W,H,D,c,x,y,z,ry)=>xgBox(G2,W,H,D,c,u(x),y,w(z),ry||0),BL=(W,H,D,c,x,y,z)=>xgBox(GL,W,H,D,c,u(x),y,w(z));
  B(AW+30,.03,.4,'#f2f2f2',AW/2,.01,-46);B(AW+30,.03,.2,'#c0392b',AW/2,.01,-1.2);for(let x=-14;x<AW+14;x+=4)BL(.2,.12,.2,'#4a8cff',x,.08,-45.2);
  for(let i=1;i<=6;i++){const a=GU(i),jx=a+3.6;
   B(2.4,2.5,5,'#cfd5dc',a,1.55,-2.8);B(.03,.5,4.6,'#2a3a52',a+1.21,2.1,-2.8);B(2.5,.2,5.1,'#9aa3ad',a,2.85,-2.8);
   xgPrism(G2,1.5,1.5,2.7,12,'#b8c0ca',u(a),.25,w(-6.2),{top:'#9aa3ad'});B(.4,.3,.4,'#3d4654',a,.15,-6.2);
   const ex=jx-1.9-1.3,ez=-12.6,dx=ex-a,dz=ez+6.2,L=Math.hypot(dx,dz)-1.5,ry=Math.atan2(dx,dz),mx=a+dx/2,mz=-6.2+dz/2;
   B(2.3,2.4,L,'#cfd5dc',mx,1.6,mz,ry);B(2.4,.18,L,'#9aa3ad',mx,2.88,mz,ry);B(.3,1.2,.3,'#566270',mx,.6,mz);B(1.4,.4,.6,'#3d4654',mx,.2,mz);B(2.6,2.6,1.4,'#9aa3ad',ex-.4,1.6,ez+.4,ry);
   B(.25,.03,26,'#f5c542',jx,.01,-20);B(3.4,.03,.25,'#f5c542',jx,.01,-6.6);B(.18,.03,22,'#c0392b',jx-6,.01,-22);B(.18,.03,22,'#c0392b',jx+6,.01,-22);
   [[jx-1.6,-6.4],[jx+1.6,-6.4],[jx+16,-21],[jx-16,-21]].forEach(([x,z])=>{B(.5,.1,.5,'#ff7a1a',x,.05,z);xgPrism(G2,.18,.04,.6,6,'#ff7a1a',u(x),.1,w(z));B(.26,.1,.26,'#ffffff',x,.42,z)});
   if(i%2){[0,1,2].forEach(k=>{const z=-9-k*2.4;B(1.4,.7,2,'#5b6b7c',jx+7,.65,z);B(1.5,.06,2.1,'#3d4654',jx+7,1.02,z);B(1.2,.5,1.4,['#c0392b','#2d5a8d','#e6b422'][k],jx+7,1.3,z);[-1,1].forEach(s=>B(.2,.36,.36,'#15171c',jx+7+s*.7,.18,z))})}
   else{B(1.6,1.3,3.2,'#f4f6f9',jx+5.6,.95,-16);B(1.6,.8,1.4,'#ff6b4a',jx+5.6,1.1,-13.8);B(.6,.06,4,'#2b2f36',jx+4.6,1.6,-16,.0)}}
  [10,36,62].forEach(x=>{xgPrism(G2,.18,.12,13,6,'#9aa3ad',u(x),0,w(-50));B(2.2,.4,.6,'#566270',x,13,-50);BL(2,.12,.5,'#fff5c8',x,12.78,-50)});
  fl(G2,g);
  AP.jets=[];AP.beac=[];for(let i=1;i<=6;i++){const p=mkPlane({tail:i%3==0?'#1565d8':'#ff6b4a'});p.position.set(u(GU(i)+3.6),0,w(-23.5));g.add(p);AP.jets.push(p);
   const bc=new THREE.Mesh(new THREE.BoxGeometry(.3,.2,.3),new THREE.MeshBasicMaterial({color:'#ff2a2a'}));bc.position.set(0,4.6,2);p.add(bc);AP.beac.push(bc)}
  const tug=new THREE.Group();[[0,'#f5c542'],[1,'#4a5868'],[2,'#5b6b7c']].forEach(([k,c])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.1,1.5),pm(c));m.position.set(-k*2.8,.6,0);tug.add(m);if(k){const b=new THREE.Mesh(new THREE.BoxGeometry(1.6,.5,1.1),pm(['#c0392b','#2d5a8d'][k-1]));b.position.set(-k*2.8,1.4,0);tug.add(b)}});
  tug.position.set(u(0),0,w(-15.5));g.add(tug);AP.tug=tug}
 /* light that follows the time of day, only while you are inside */
 AP.light=new THREE.HemisphereLight('#ffffff','#8a8a8a',0);g.add(AP.light);
 buildNpc();AP.dirty=1}
function buildNpc(){const g=AP.grp,u=v=>AX+v,w=v=>AZ+v,SW_T='#1d3d7a',SW_P='#1a1f2e';
 const stand=(a,b,o,ry)=>{const c=mkChar(o);g.add(c.g);c.g.position.set(u(a),0,w(b));c.g.rotation.y=ry||0;return c};
 [8,13,18,23].forEach(a=>stand(a,43.75,{tc:SW_T,pc:SW_P,top:0}));stand(50,43.75,{tc:'#ff6b4a',pc:SW_P,top:0});stand(62,46.8,{tc:'#1565d8',pc:SW_P,top:0});
 LANES.forEach(a=>stand(a+1.6,SECV-1.4,{tc:'#2b2b2b',pc:'#1b1b1b',top:0}));
 for(let i=1;i<=6;i++)stand(GU(i)+3.4,3.75,{tc:SW_T,pc:SW_P,top:0});
 stand(67,37.95,{tc:'#6b4a32'});stand(23,16.55,{tc:'#6b4a32'});stand(64,16.65,{tc:'#b33a2a'});stand(5,20.35,{tc:'#c06090'});stand(48.6,16.3,{tc:'#3a4552'});
 stand(12,21.05,{tc:'#c2457c',top:0});stand(55,21.05,{tc:'#16408a',top:0});
 /* people browsing, waiting and reading the board (out of every lane and interaction spot) */
 stand(2.3,19,{},-Math.PI/2);stand(55.8,23.5,{},Math.PI);stand(34.2,31.3,{},Math.PI);stand(38.7,31.5,{},Math.PI);stand(61.6,23.4,{},Math.PI/2);stand(20.5,40.8,{},Math.PI/2);stand(21.6,40.8,{},-Math.PI/2);stand(62.4,19.2,{},Math.PI);
 /* walkers with rolling cases on lanes that keep clear of every desk, column and planter: [lane, from, to, axis] */
 const bag=(c,i)=>{const s=new THREE.Mesh(new THREE.BoxGeometry(.38,.55,.24),pm(['#c0392b','#2d5a8d','#1b1b1b','#e6b422','#7a5ad8'][i%5]));s.position.set(.42,.32,-.34);c.g.add(s);const h=new THREE.Mesh(new THREE.BoxGeometry(.04,.36,.04),pm('#2b2f36'));h.position.set(.42,.76,-.24);c.g.add(h)};
 [[38.4,8,62],[39.8,8,62],[49.9,4,52],[50.9,4,53],[27,3,69],[28.2,3,69],[12.6,3,69],[14,3,69],[37.4,36.4,53.6,'z'],[27,3,69],[12.6,3,69]].forEach(([b,x0,x1,ax],i)=>{const c=mkChar();if(i%3!=2)bag(c,i);g.add(c.g);
  if(ax=='z')npcAdd(c,'z',u(b),w(x0),w(x1),w(x0+Math.random()*(x1-x0)),i%2?1:-1,.9+Math.random()*.6,inT);else npcAdd(c,'x',w(b),u(x0),u(x1),u(x0+Math.random()*(x1-x0)),i%2?1:-1,.9+Math.random()*.6,inT)});
 /* a crew of three pulling cases, and a cleaner with a scrubber */
 {const p0=10+Math.random()*40;[[SW_T,'#ffd84a'],[SW_T,'#ffffff'],['#ff6b4a','#ffffff']].forEach(([tc],k)=>{const c=mkChar({tc,pc:SW_P,top:0});bag(c,1);const cap=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.5),pm(SW_T));cap.position.set(0,1.62,0);if(k<2)c.g.add(cap);g.add(c.g);
  npcAdd(c,'x',w(13.3),u(4+k*.9),u(66+k*.9),u(p0+k*.9),1,1.05,inT)});
  const c=mkChar({tc:'#2fae5a',pc:'#1b1f26',top:0});const cart=new THREE.Mesh(new THREE.BoxGeometry(.6,.5,.7),pm('#ffd84a'));cart.position.set(0,.3,.75);c.g.add(cart);g.add(c.g);npcAdd(c,'x',w(26.1),u(3),u(60),u(30),1,.5,inT)}
 /* people sitting on free seats (never one of the seats you can sit on) */
 const sit=(x,z,ry)=>{const c=mkChar();c.g.position.set(u(x),-.3,w(z));c.g.rotation.y=ry||0;c.legs[0].rotation.x=c.legs[1].rotation.x=-1.5;c.arms[0].rotation.x=c.arms[1].rotation.x=-.6;g.add(c.g)};
 const free=[];for(let i=1;i<=6;i++){[-2,0,2].forEach(k=>free.push([GU(i)+k,7.6]));for(let k=-3;k<=2;k++)free.push([GU(i)+k,10])}
 for(let n=0;n<12&&free.length;n++){const [x,z]=free.splice(rr(free.length),1)[0];sit(x,z)}
 [[31,21],[37,24.5],[41,21],[33,24.5],[55.5,50.5],[56.5,53.5]].forEach(([x,z])=>sit(x,z));sit(19.4,22.32,Math.PI);sit(22.4,24.18,0)}
/* moving bits inside: bags on the check-in belt and the carousel, sliding entrance doors, light pools, sun stripes, clocks, jet beacons */
function fxTick(dt){const f=nf();if(AP.fx){if(AP.fx.pool)AP.fx.pool.material.opacity=.1+.32*f/.9;if(AP.fx.sun){AP.fx.sun.material.opacity=.22*Math.max(0,1-f/.5);AP.fx.sun.visible=f<.5}}
 (AP.bags||[]).forEach(b=>{if(b.k=='ck'){b.p-=dt*.9;if(b.p<6.4)b.p=26.4;b.m.position.x=AX+b.p;b.m.visible=b.p<26.2}else{b.p+=dt*.22;const t=b.p;b.m.position.set(AX+b.cx+Math.cos(t)*2.2,.6,AZ+b.cz+Math.sin(t)*1.1);b.m.rotation.y=-t}});
 const d=AP.fdoor;if(d){const near=Math.abs(P.x-AX-36)<3.4&&P.z-AZ>51.5;d.o+=((near?1:0)-d.o)*Math.min(1,dt*5);d.L.position.x=AX+34.5-d.o*2.6;d.R.position.x=AX+37.5+d.o*2.6}
 if(AP.beac){const on=(AP.t%1.4)<.18;AP.beac.forEach((b,i)=>b.visible=on&&(i%2==0))}
 const k=clk();(AP.clocks||[]).forEach(c=>{if(c.k==k)return;c.k=k;const x=c.cv.x,h=+k.slice(0,2)%12,m=+k.slice(3,5)||0;x.clearRect(0,0,128,128);x.fillStyle='#0b2a5b';x.beginPath();x.arc(64,64,62,0,7);x.fill();x.fillStyle='#ffffff';x.beginPath();x.arc(64,64,54,0,7);x.fill();
  x.fillStyle='#0b2a5b';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.fillRect(64+Math.sin(a)*46-2,64-Math.cos(a)*46-2,4,4)}
  const hand=(a,L,W,c)=>{x.strokeStyle=c;x.lineWidth=W;x.lineCap='round';x.beginPath();x.moveTo(64,64);x.lineTo(64+Math.sin(a)*L,64-Math.cos(a)*L);x.stroke()};hand((h+m/60)/12*Math.PI*2,30,7,'#0b2a5b');hand(m/60*Math.PI*2,44,4,'#0b2a5b');x.fillStyle='#ff6b4a';x.beginPath();x.arc(64,64,5,0,7);x.fill();c.cv.t.needsUpdate=true})}

/* departure boards and gate screens */
function drawBoard(b){const from=here(),L=T.upcoming(from,b.n),n=T.now(),mine=new Set(T.active().map(k=>k.fl+'#'+k.dep));
 const key=from+'|'+L.map(f=>f.fl+f.dep+T.fStatus(f,n).c).join(',')+'|'+[...mine].join()+'|'+T.hm(n);if(b.key==key)return;b.key=key;
 if(!b.cv){b.cv=can(1100,540);b.m.material.map=b.cv.t;b.m.material.needsUpdate=true}const c=b.cv.x,W=1100,H=540;
 c.fillStyle='#0d1522';c.fillRect(0,0,W,H);c.fillStyle='#0b2a5b';c.fillRect(0,0,W,70);c.fillStyle='#ffd84a';c.font='bold 40px '+FONT;c.textBaseline='middle';c.textAlign='left';c.fillText('✈ '+b.title,24,36);
 c.textAlign='right';c.fillStyle='#fff';c.fillText(T.hm(n),W-24,36);c.textAlign='left';
 const cols=[24,170,360,820,930];c.font='22px ui-monospace,Menlo,monospace';c.fillStyle='#8fb4e8';['TIME','FLIGHT','DESTINATION','GATE','STATUS'].forEach((t,i)=>c.fillText(t,cols[i],96));
 const rh=(H-120)/Math.max(1,b.n);L.forEach((f,i)=>{const y=120+i*rh+rh/2,st=T.fStatus(f,n),me=mine.has(f.fl+'#'+f.dep);if(me){c.fillStyle='#1d2c45';c.fillRect(8,y-rh/2+3,W-16,rh-6)}
  c.font='bold 30px ui-monospace,Menlo,monospace';c.fillStyle='#ffd84a';c.fillText(T.hm(f.dep),cols[0],y);c.fillText(f.fl,cols[1],y);c.fillText((T.city(f.to)+(me?'  ★':'')).toUpperCase().slice(0,22),cols[2],y);c.fillText(String(f.gate),cols[3]+20,y);
  c.fillStyle=st.c=='board'?'#56f08a':st.c=='final'?'#ffb347':st.c=='closed'||st.c=='gone'?'#ff6a5a':'#ffd84a';c.fillText(st.t.toUpperCase(),cols[4],y)});b.cv.t.needsUpdate=true}
function drawGate(gs){const from=here(),n=T.now(),mine=T.active().find(k=>k.from==from&&k.gate==gs.i&&k.dep-n<1440),f=mine||T.upcoming(from,40).find(q=>q.gate==gs.i);
 const st=f?T.fStatus(f,n):null,key=(f?f.fl+f.dep+st.c:'-')+(mine?'m':'')+T.hm(n).slice(0,4);if(gs.key==key)return;gs.key=key;
 if(!gs.cv){gs.cv=can(520,300);gs.m.material.map=gs.cv.t;gs.m.material.needsUpdate=true}const c=gs.cv.x;c.fillStyle='#0d1522';c.fillRect(0,0,520,300);
 c.fillStyle='#ffd84a';c.fillRect(0,0,520,64);c.fillStyle='#0b2a5b';c.font='bold 40px '+FONT;c.textBaseline='middle';c.textAlign='left';c.fillText('GATE '+gs.i,18,34);
 c.textAlign='right';c.font='bold 26px '+FONT;c.fillText(T.hm(n),502,34);c.textAlign='left';
 if(!f){c.fillStyle='#8fb4e8';c.font='28px '+FONT;c.fillText('No departures',18,150)}else{c.fillStyle='#fff';c.font='bold 34px '+FONT;c.fillText(f.fl+'  '+T.city(f.to).toUpperCase().slice(0,16),18,112);
  c.font='28px '+FONT;c.fillStyle='#cfe6ff';c.fillText('Departs '+T.hm(f.dep)+' · closes '+T.hm(f.dep-RU.CLOSE),18,160);
  c.fillStyle=st.c=='board'?'#56f08a':st.c=='final'?'#ffb347':st.c=='ok'?'#ffd84a':'#ff6a5a';c.font='bold 34px '+FONT;c.fillText(st.t.toUpperCase(),18,212);
  if(mine){c.fillStyle='#ff6b4a';c.fillRect(0,246,520,54);c.fillStyle='#fff';c.font='bold 28px '+FONT;c.fillText('YOUR FLIGHT · SEAT '+mine.seat,18,274)}}gs.cv.t.needsUpdate=true}
function relabel(){const id=here(),d=T.dest(id),lg=d&&d.lang||'en',nm=T.apName(id);AP.signs.forEach(s=>{if(s.k!='wel')return;const c=can(2048,192,(x,W,H)=>{x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#ff6b4a';x.fillRect(0,H-14,W,14);
 x.fillStyle='#0b2a5b';x.textAlign='center';x.textBaseline='middle';let fs=86;x.font=`bold ${fs}px ${FONT}`;const t=(lg!='en'&&GREET[lg]?GREET[lg]+' · ':'')+'Welcome to '+nm;while(x.measureText(t).width>W*.94&&fs>20){fs-=4;x.font=`bold ${fs}px ${FONT}`}x.fillText(t,W/2,H/2)});
 s.m.material.map=c.t;s.m.material.needsUpdate=true});AP.boards.forEach(b=>b.key='');AP.gates.forEach(g=>g.key='');AP.loc=id}

/* ================= entering and leaving ================= */
function apEnter(where){buildTerm();try{if(typeof closePhone=='function')closePhone()}catch(e){}
 fade(()=>{IN={i:AP.idx,x:AX,w:AW,d:AD};P.sit=null;if(AP.loc!==here())relabel();
  P.x=AX+36;P.z=AZ+(where=='arr'?50:52.6);P.rot=Math.PI;camT.x=P.x;camT.z=P.z;AP.lastV=P.z-AZ;
  if(where=='arr'){const d=T.here();say(d?'Welcome to '+T.place(here())+'! Local time '+T.local(T.now(),here())+'.':'Welcome home to '+T.apName('home')+'.')}
  else if(!S.travel.seen.ap){S.travel.seen.ap=1;say('Check in at a Swiftwing desk, go through security, then find your gate. Book flights at the ticket desk.')}},
  where=='arr'?'':T.apName(here()),where=='arr'?'':'Departures · check-in · gates 1-6')}
window.apEnter=apEnter;
function apLeave(){if(T.abroad()){IN=null;if(T.emit('exitAirport',here()))return;apEnter('front');setTimeout(()=>say('The streets of '+T.city(here())+' are not open yet. Book a flight at the ticket desk.'),1100);return}
 fade(()=>{IN=null;P.sit=null;P.x=OUT.fx;P.z=OUT.fz;P.rot=Math.PI/2;camT.x=P.x;camT.z=P.z},'')}

/* ================= security ================= */
const secOK=()=>!!T.pass();
let secSay=0;function secMsg(){const n=performance.now();if(n-secSay<2500)return;secSay=n;const tk=T.active().find(k=>k.from==here());try{snd('err')}catch(e){}
 say(!tk?'Security: you need a boarding pass. Book a flight at the ticket desk first.':!tk.ck?(T.ckWin(tk)?'Security: check in first (Swiftwing desks 1-4, by the entrance), then come back.':tk.dep-T.now()>RU.CK_OPEN?'Too early: check-in for '+tk.fl+' opens '+T.hm(tk.dep-RU.CK_OPEN)+'.':'Check-in for '+tk.fl+' has closed.'):'Your flight has closed.')}

/* ================= gates and boarding ================= */
function gateTk(i){const n=T.now();return T.active().find(k=>k.from==here()&&k.gate==i&&k.dep-n<1440)}
function gateLbl(i){const tk=gateTk(i),n=T.now();if(tk){if(!tk.ck)return'Gate '+i+' · '+tk.fl+' · check in first';if(n<tk.dep-RU.BOARD)return'Gate '+i+' · your flight '+tk.fl+' boards at '+T.hm(tk.dep-RU.BOARD);return'Board '+tk.fl+' to '+T.city(tk.to)+' · seat '+tk.seat}
 const f=T.upcoming(here(),40).find(q=>q.gate==i);return'Gate '+i+(f?' · '+f.fl+' to '+T.city(f.to)+' '+T.hm(f.dep)+' (not your flight)':'')}
function gateUse(i){const tk=gateTk(i),n=T.now();if(!tk){const o=T.active().find(k=>k.from==here());try{snd('err')}catch(e){}return say(o?'This is not your gate. '+o.fl+' leaves from Gate '+o.gate+'.':'You have no flight from this gate.')}
 if(!tk.ck){try{snd('err')}catch(e){}return say('Check in first at a Swiftwing desk.')}
 if(n<tk.dep-RU.BOARD){try{snd('err')}catch(e){}return say('Boarding opens at '+T.hm(tk.dep-RU.BOARD)+' ('+T.left(tk.dep-RU.BOARD)+'). Take a seat, the gate closes at '+T.hm(tk.dep-RU.CLOSE)+'.')}
 board(tk)}
function board(tk){if(AP.busy)return;AP.busy=1;try{snd('chime')}catch(e){}
 fade(()=>{AP.busy=0;tk.bt=1;AP.tk=tk;AP.ph='board';buildCabin();IN={i:AP.cidx,x:CX,w:CW,d:CD};P.sit=null;P.x=CX+2.4;P.z=AZ+3;P.rot=Math.PI/2;camT.x=P.x;camT.z=P.z;placeSeatMarker(tk);
  say('Welcome aboard '+tk.fl+' to '+T.city(tk.to)+'. Your seat is '+tk.seat+' (follow the arrow). The plane leaves when you sit down.')},'Boarding '+tk.fl,'Gate '+tk.gate+' → '+T.place(tk.to))}

/* ================= cabin ================= */
const ROWU=r=>4.6+(r-1)*1.4,SEATV={A:.7,B:1.3,C:1.9,D:4.1,E:4.7,F:5.3};
function buildCabin(){if(AP.cgrp)return;const G=xgNew(),g=AP.cgrp=new THREE.Group();scene.add(g);g.visible=false;
 if(AP.cidx<0){SHOPS.push({name:'Swiftwing cabin',ox:CX});AP.cidx=SHOPS.length-1}
 const u=v=>CX+v,w=v=>AZ+v,bx=(W,H,D,c,x,y,z,tc)=>xgBox(G,W,H,D,c,u(x),y,w(z),0,tc),col=(a,b,c,d)=>AP.ccols.push([u(a),w(b),u(c),w(d)]);
 bx(CW,.06,CD,'#46526a',CW/2,0,CD/2);bx(CW-4,.07,1.2,'#2a3550',CW/2+2,.01,3);for(let x=4;x<CW;x+=1.4)bx(.06,.075,1.2,'#ff6b4a',x,.012,3);
 bx(CW,2.9,.3,'#e8ebf0',CW/2,1.45,-.15);bx(CW,.6,.62,'#d7dce4',CW/2,2.5,.3);bx(CW,.05,.62,'#c5cbd5',CW/2,2.2,.3);
 bx(.3,2.9,CD,'#d7dce4',-.15,1.45,CD/2);bx(.6,2.2,1,'#9aa3ad',.4,1.1,1.6);bx(1,.12,1,'#5b6878',.6,2.25,1.6);
 bx(CW,.55,.25,'#d7dce4',CW/2,.27,CD+.05);bx(.25,.55,CD,'#d7dce4',CW+.05,.27,CD/2);
 bx(1.6,1,1.2,'#c5cbd5',1.2,.5,.6);bx(1.6,1,1.4,'#c5cbd5',1.2,.5,5.3);col(0,0,2,1.2);col(0,4.6,2,CD);
 const wt=can(64,96,(c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#5aa9ff');gr.addColorStop(1,'#d8efff');c.fillStyle='#e8ebf0';c.fillRect(0,0,W,H);c.fillStyle=gr;c.beginPath();c.ellipse(W/2,H/2,W*.36,H*.4,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.ellipse(W*.45,H*.62,W*.2,H*.06,0,0,7);c.fill()});
 AP.cwin=[];for(let r=1;r<=20;r++){const m=pl(g,wt.t,.42,.62,u(ROWU(r)+.2),1.45,w(.02),0,{tr:true});AP.cwin.push(m)}
 for(let r=1;r<=20;r++){const x=ROWU(r);Object.keys(SEATV).forEach(L=>{const v=SEATV[L];bx(.6,.45,.56,'#24365e',x,.23,v);bx(.18,.85,.56,'#24365e',x+.36,.7,v);bx(.2,.18,.5,'#ff6b4a',x+.38,1.14,v)});
  bx(.3,.05,.3,'#fff',x,2.22,.62);}
 col(3.9,0,CW,2.25);col(3.9,3.75,CW,CD);
 for(let r=1;r<=20;r+=3)sign(g,.5,.3,String(r),u(ROWU(r)),2.36,w(.62),0,{bg:'#0b2a5b',fg:'#fff'});
 sign(g,1.6,.5,'EXIT',u(2.4),2.4,w(CD+.2),0,{bg:'#2fae5a',fg:'#fff'});
 fl(G,g);
 const arr=new THREE.Mesh(new THREE.ConeGeometry(.22,.5,4),new THREE.MeshBasicMaterial({color:'#ffd84a'}));arr.rotation.x=Math.PI;g.add(arr);AP.seatM=arr;
 /* passengers and crew */
 const taken=new Set();for(let i=0;i<34;i++){const r=1+rr(20),L='ABCDEF'[rr(6)],k=r+L;if(taken.has(k))continue;taken.add(k);const c=mkChar();c.g.position.set(u(ROWU(r)),-.3,w(SEATV[L]));c.g.rotation.y=-Math.PI/2;
  c.legs[0].rotation.x=c.legs[1].rotation.x=-1.5;c.arms[0].rotation.x=c.arms[1].rotation.x=-.6;g.add(c.g);AP.cnpc.push({c,seat:k})}
 const fa=mkChar({tc:'#1d3d7a',pc:'#1a1f2e',top:0});fa.g.position.set(u(1.2),0,w(3));g.add(fa.g);AP.fa={c:fa,x:1.2,d:1,ph:0};
 AP.clight=new THREE.HemisphereLight('#fff6e8','#9a9aa8',.2);g.add(AP.clight)}
function placeSeatMarker(tk){const r=parseInt(tk.seat),L=tk.seat.slice(-1);AP.cnpc.forEach(n=>n.c.g.visible=n.seat!=tk.seat);if(AP.seatM){AP.seatM.visible=true;AP.seatM.position.set(CX+ROWU(r),1.9,AZ+SEATV[L]);AP.seatM.userData={r,L}}}
function seatXZ(tk){const r=parseInt(tk.seat),L=tk.seat.slice(-1);return{x:CX+ROWU(r),z:AZ+SEATV[L],ax:CX+ROWU(r),az:AZ+3}}
function sitDown(){const tk=AP.tk;if(!tk||AP.ph!='board')return;const s=seatXZ(tk);P.sit={x:s.x,z:s.z};P.rot=-Math.PI/2;if(AP.seatM)AP.seatM.visible=false;try{snd('pop')}catch(e){}
 AP.ph='sit';say('Seatbelt on. The doors close and '+tk.fl+' pushes back...');setTimeout(()=>{if(AP.ph=='sit')takeOff()},1800)}
function cabinInts(){const a=[],tk=AP.tk;if(!tk)return a;const s=seatXZ(tk);
 if(AP.ph=='board')a.push({x:s.ax,z:s.az,r:1.3,l:'Sit in '+tk.seat+' (your seat)',a:sitDown});
 a.push({x:CX+2.4,z:AZ+4.8,r:1.5,l:AP.ph=='landed'?'Exit the plane':'Front door · the plane leaves when you sit in '+tk.seat,a:()=>{if(AP.ph=='landed')exitPlane();else say('Find seat '+tk.seat+' (the yellow arrow) and sit down to take off.')}});
 if(AP.fa)a.push({x:CX+AP.fa.x,z:AZ+3,r:1.3,l:'Talk to the flight attendant',a:()=>say(AP.ph=='landed'?'"Thanks for flying Swiftwing! Mind your step on the way out."':'"Welcome aboard! '+tk.seat+' is '+(tk.seat.slice(-1)<'D'?'on the window side':'on the right')+', row '+parseInt(tk.seat)+'."')});
 return a}

/* ================= the flight ================= */
function takeOff(){const tk=AP.tk;if(!tk)return;AP.ph='fly';T.emit('depart',tk);try{snd('whoosh')}catch(e){}
 const dep=Math.max(T.now(),tk.dep),arr=dep+tk.hrs*60;AP.arrT=arr;mode='menu';
 let d=document.getElementById('apfly');if(d)d.remove();d=document.createElement('div');d.id='apfly';
 const night=k=>{const m=((k%1440)+1440)%1440;return m<360||m>=1200};
 d.style.cssText=`position:fixed;inset:0;z-index:65;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#fff;font:15px ${FONT};background:linear-gradient(180deg,${night(dep)?'#0a1430,#1b2c5a':'#2f7fe0,#9fd2ff'});overflow:hidden`;
 d.innerHTML=`<style>#apsky{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}</style><canvas id=apsky></canvas>
 <div style="position:relative;font:700 28px ${FONT};text-shadow:0 3px 0 #0b2a5b">${esc(tk.fl)} · ${esc(T.city(tk.from))} → ${esc(T.city(tk.to))}</div>
 <canvas id=apflc width=720 height=300 style="position:relative;width:min(720px,94vw);aspect-ratio:720/300;border-radius:4px;border:4px solid #0b2a5b;box-shadow:4px 4px 0 #0b2a5b99;background:#7cc2ff"></canvas>
 <div id=apflt style="position:relative;font:700 18px ${FONT};text-shadow:0 2px 0 #0b2a5b"></div>`;
 document.body.appendChild(d);const t0=(window.FWP?FWP.now():performance.now()),DUR=8500,A=T.dest(tk.from)||WT_HOME,B=T.dest(tk.to)||WT_HOME;AP.flv=null;
 const step=()=>{if(!document.getElementById('apfly')||AP.ph!='fly')return;try{apSky(document.getElementById('apsky'),dep+(arr-dep)*Math.min(1,((window.FWP?FWP.now():performance.now())-t0)/DUR),(window.FWP?FWP.now():performance.now())-t0)}catch(e){}const k=Math.min(1,((window.FWP?FWP.now():performance.now())-t0)/DUR),c=document.getElementById('apflc');if(c&&T.paintWorld){const r=c.getBoundingClientRect(),W0=r.width||720,H0=r.height||300,dpr=Math.min(3,window.devicePixelRatio||1),W=Math.round(W0*dpr),H=Math.round(H0*dpr);
  if(c.width!=W||c.height!=H){c.width=W;c.height=H}const x=c.getContext('2d'),pa=T.proj(A.lat,A.lon),pb=T.proj(B.lat,B.lon);
  /* sharp vector map (138-flights.js), framed on the route */
  if(!AP.flv)AP.flv=T.fitView([pa,pb],W0,H0,1.7);const v=AP.flv,s=T.clampView(v,W0,H0),ox=W0/2-v.cx*s,oy=H0/2-v.cy*s;T.paintWorld(x,s*dpr,ox*dpr,oy*dpr,W,H,dpr);x.setTransform(dpr,0,0,dpr,0,0);
  const ax=ox+pa[0]*s,ay=oy+pa[1]*s,bx2=ox+pb[0]*s,by=oy+pb[1]*s,mx=(ax+bx2)/2,my=Math.min(ay,by)-Math.min(80,Math.hypot(bx2-ax,by-ay)*.22);
  const Q=t=>[(1-t)*(1-t)*ax+2*(1-t)*t*mx+t*t*bx2,(1-t)*(1-t)*ay+2*(1-t)*t*my+t*t*by];x.lineCap='round';
  x.strokeStyle='#0b2a5b55';x.lineWidth=2;x.setLineDash([6,5]);x.beginPath();x.moveTo(ax,ay);x.quadraticCurveTo(mx,my,bx2,by);x.stroke();x.setLineDash([]);
  x.strokeStyle='#ff6b4a';x.lineWidth=3;x.beginPath();x.moveTo(ax,ay);for(let i=1;i<=40;i++){const p=Q(k*i/40);x.lineTo(p[0],p[1])}x.stroke();
  [[ax,ay],[bx2,by]].forEach(p=>{x.fillStyle='#0b2a5b';x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(p[0],p[1],5.5,0,7);x.fill();x.stroke()});
  const p=Q(k),p2=Q(Math.min(1,k+.01));x.save();x.translate(p[0],p[1]);x.rotate(Math.atan2(p2[1]-p[1],p2[0]-p[0]));x.font='26px serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#0b2a5b';x.fillText('✈',0,0);x.restore();
  x.font='bold 13px '+FONT;x.lineJoin='round';[[T.city(tk.from),ax,ay],[T.city(tk.to),bx2,by]].forEach(q=>{x.strokeStyle='#ffffffd0';x.lineWidth=3;x.strokeText(q[0],q[1]+8,q[2]-8);x.fillStyle='#0b2a5b';x.fillText(q[0],q[1]+8,q[2]-8)})}
  const now=dep+(arr-dep)*k,e=document.getElementById('apflt');if(e)e.textContent=`${T.hm(now)} · ${Math.round((1-k)*tk.hrs*60)} min to go${tk.to!='home'?' · local time there '+T.local(now,tk.to):''}`;
  if(k>=1)apLand();else requestAnimationFrame(step)};requestAnimationFrame(step)}
/* v55.21.0: pixel-art flight sky. Low-res canvas scaled up: sky colour follows the game clock (night, dawn, day, dusk), stars and a moon at night, a sun by day, blocky clouds drifting past in three layers, a pixel plane. */
const SKYK=[[0,0],[5,0],[6.5,1],[8,2],[17,2],[18.5,1],[20,0],[24,0]],
 SKYC=[['#0a1430','#1b2c5a'],['#2b4a8a','#f0905a'],['#2f7fe0','#9fd2ff']];
const hx=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16)),mix=(a,b,t)=>{const A=hx(a),B=hx(b);return'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join()+')'};
function skyAt(h){let i=0;while(i<SKYK.length-2&&h>=SKYK[i+1][0])i++;const k0=SKYK[i],k1=SKYK[i+1],t=Math.max(0,Math.min(1,(h-k0[0])/(k1[0]-k0[0]))),a=SKYC[k0[1]],b=SKYC[k1[1]];return{top:mix(a[0],b[0],t),bot:mix(a[1],b[1],t),night:k0[1]==0&&k1[1]==0?1:k0[1]==0?1-t:k1[1]==0?t:0}}
const CLP=[[0,1,4],[1,0,6],[2,1,5]];
function apSky(c,now,ms){if(!c||!c.clientWidth)return;const W=192,H=Math.max(60,Math.round(W*c.clientHeight/c.clientWidth));if(c.width!=W||c.height!=H){c.width=W;c.height=H}
 const x=c.getContext('2d'),h=(((now%1440)+1440)%1440)/60,sk=skyAt(h),N=sk.night;
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,sk.top);g.addColorStop(1,sk.bot);x.fillStyle=g;x.fillRect(0,0,W,H);
 /* banded sky: snap to 6 colour steps so it reads as pixel art */
 x.fillStyle=sk.bot;for(let y=0;y<H;y+=6){x.globalAlpha=.10;x.fillRect(0,y,W,3)}x.globalAlpha=1;
 if(N>.35){for(let i=0;i<46;i++){const sx=(i*53)%W,sy=(i*37)%Math.floor(H*.7),tw=((i+Math.floor(ms/400))%5)==0;x.fillStyle=tw?'#8aa4d8':'#fff';x.globalAlpha=Math.min(1,N*1.2);x.fillRect(sx,sy,1,1)}x.globalAlpha=1;
  x.fillStyle='#f4efe2';x.fillRect(150,12,6,6);x.fillRect(149,13,8,4);x.fillStyle=sk.top;x.fillRect(153,12,4,4)}
 else{x.fillStyle='#ffd84a';x.fillRect(28,14,8,8);x.fillRect(27,15,10,6);x.fillRect(29,13,6,10)}
 /* clouds: three layers, farther = smaller, slower, paler */
 const tint=N>.5?['#34457a','#46598f','#566aa3']:h<7.5||h>17.5?['#f2c9b0','#ffe3cf','#fff2e6']:['#cfe6ff','#e8f3ff','#ffffff'];
 for(let L=0;L<3;L++){const sp=[.006,.012,.022][L],sz=[1,1.4,2][L];x.fillStyle=tint[L];
  for(let i=0;i<5;i++){const w=Math.round(26*sz),px=Math.floor(((i*(W+60)/5+(L*37))-ms*sp*(W/190)*3)%(W+60)+(W+60))%(W+60)-40,py=Math.floor(H*(.12+.13*((i*7+L*3)%6)));
   CLP.forEach(r=>x.fillRect(px+Math.round(r[0]*5*sz),py+Math.round(r[1]*3*sz),Math.round(r[2]*5*sz),Math.round(3*sz)));
   x.fillRect(px+Math.round(5*sz),py+Math.round(3*sz),Math.round(w*.6),Math.round(2*sz))}}
 /* plane (pixel sprite) bobbing in the middle, with a little wake of cloud puffs */
 const bob=Math.round(Math.sin(ms/500)*2),px=Math.floor(W/2)-12,py=Math.floor(H*.5)+bob;
 x.fillStyle='#0b2a5b';x.fillRect(px-1,py+4,26,7);x.fillStyle='#fff';x.fillRect(px,py+3,24,7);x.fillStyle='#ff6b4a';x.fillRect(px+19,py-3,4,7);x.fillStyle='#cfe6ff';x.fillRect(px+4,py+10,14,3);x.fillRect(px+7,py-1,9,4);
 x.fillStyle='#0b2a5b';x.fillRect(px+20,py+4,3,2);x.fillStyle='#fff';x.globalAlpha=.7;for(let i=0;i<4;i++)x.fillRect(px-6-i*7-((Math.floor(ms/120)+i)%3),py+6+(i%2),4,2);x.globalAlpha=1}
window.apSky=apSky;
window.apLand=function(){const tk=AP.tk;if(!tk||AP.ph!='fly')return;const d=document.getElementById('apfly');if(d)d.remove();
 tk.st='flown';tk.bt=0;AP.ph='landed';T.st().loc=tk.to||'home';const arr=AP.arrT||T.now(),end=(S.day+1)*1440+360;
 const s=seatXZ(tk);P.sit=null;P.x=s.ax;P.z=s.az;P.rot=Math.PI;camT.x=P.x;camT.z=P.z;AP.cnpc.forEach(n=>n.c.g.visible=true);if(AP.seatM)AP.seatM.visible=false;
 const msg='Landed in '+T.place(tk.to)+(tk.to!='home'?' · local time '+T.local(arr,tk.to):'')+'. Exit at the front door.';
 if(arr>=end){AP.pend=arr;S.t=599.9;try{sleepNow(0)}catch(e){console.error(e)}setTimeout(()=>say(msg),1600)}
 else{S.t=Math.max(+S.t||0,Math.min(599.5,T.tOf(arr-S.day*1440)));try{closeUI()}catch(e){mode='play'}say(msg)}};
{const w0=wakeUp;wakeUp=function(){w0.apply(this,arguments);try{if(AP.pend){const a=AP.pend;AP.pend=null;S.t=Math.max(0,Math.min(599.5,T.tOf(a-S.day*1440)));
 const bx=document.querySelector('#ui .box');if(bx){const p=document.createElement('p');p.style.cssText='background:#0b2a5b;border:2px solid #ff6b4a;padding:6px 8px;margin:6px 0';p.innerHTML='You slept on the plane. It is now <b>'+clk()+'</b>.';const h=bx.querySelector('h2');h?h.after(p):bx.prepend(p)}}}catch(e){}}}
function exitPlane(){const tk=AP.tk;fade(()=>{AP.ph=null;AP.tk=null;IN=null;P.sit=null;if(!T.arrive(tk.to,tk))apEnter('arr')},'',)}

/* ================= hooks ================= */
{const h0=hit;hit=function(x,z,r){if(h0(x,z,r))return 1;if(typeof IN=='undefined'||!IN)return 0;const L=IN.i===AP.idx?AP.cols:IN.i===AP.cidx?AP.ccols:null;if(!L)return 0;
 if(L.some(c=>x+r>c[0]&&x-r<c[2]&&z+r>c[1]&&z-r<c[3]))return 1;
 if(IN.i===AP.idx&&z<P.z&&P.z-AZ>=SECV&&z-AZ<SECV+.3&&!secOK()){secMsg();return 1}return 0}}
{const d0=dynInt;dynInt=function(){const a=d0();try{if(inT())return a.concat(termInts());if(inC())return a.concat(cabinInts());return a.concat(outInts())}catch(e){return a}}}
function termInts(){const a=[],u=v=>AX+v,w=v=>AZ+v,tk=T.active().find(k=>k.from==here()),abroad=T.abroad();
 a.push({x:u(36),z:w(55),r:2.4,l:abroad?'Go out into '+T.city(here()):'Leave the airport',a:apLeave});
 [8,13,18,23].forEach((x,i)=>a.push({x:u(x),z:w(45.9),r:1.6,l:tk&&!tk.ck?'Check in for '+tk.fl+' (desk '+(i+1)+')':tk?'Desk '+(i+1)+' · checked in, seat '+tk.seat:'Swiftwing check-in · desk '+(i+1),a:()=>{if(!tk)return say('"Hi! You have no flight from here. Tickets are at the orange desk."');if(tk.ck)return say('"You are all set: Gate '+tk.gate+', boarding '+T.hm(tk.dep-RU.BOARD)+'. Security is straight ahead."');T.checkIn(tk.id)}}));
 a.push({x:u(50),z:w(45.9),r:1.8,l:'Buy or change tickets (Swiftwing desk)',a:()=>{SWAPP.tab=tk?'trips':'book';swDesk()}});
 a.push({x:u(62),z:w(48.8),r:1.8,l:'Ask at Information',a:info});
 a.push({x:u(1.4),z:w(48),r:2.6,l:'Read the departures board',a:()=>{SWAPP.tab='dep';swDesk()}});
 a.push({x:u(36),z:w(31),r:2.4,l:'Read the departures board',a:()=>{SWAPP.tab='dep';swDesk()}});
 LANES.forEach((x,i)=>a.push({x:u(x),z:w(SECV+1.6),r:1.3,l:secOK()?'Security lane '+(i+1)+' · walk through':'Security · boarding pass needed',a:()=>secOK()?say('Walk through the arch. Have a good flight!'):(secSay=0,secMsg())}));
 a.push({x:u(67),z:w(40.2),r:1.6,l:'Buy at Bean There',a:()=>shop('bean')},{x:u(23),z:w(18.6),r:1.8,l:'Buy at Cloud Nine Coffee',a:()=>shop('c9')},{x:u(64),z:w(18.6),r:2,l:'Buy at Runway Burgers',a:()=>shop('rb')},{x:u(5),z:w(22.2),r:1.6,l:'Browse the Sky Shop',a:()=>shop('sky')},{x:u(50),z:w(18.1),r:1.6,l:'Buy at Pages',a:()=>shop('pg')});
 for(let i=1;i<=6;i++){a.push({x:u(GU(i)),z:w(1.5),r:1.7,l:gateLbl(i),a:()=>gateUse(i)});a.push({x:u(GU(i)+3.4),z:w(5.7),r:1.3,l:'Talk to the Gate '+i+' agent',a:()=>{const t=gateTk(i);say(t?'"'+t.fl+' to '+T.city(t.to)+': boarding '+T.hm(t.dep-RU.BOARD)+', the gate closes '+T.hm(t.dep-RU.CLOSE)+'. Seat '+t.seat+'."':'"This gate is not for your flight'+(tk?'. Yours is Gate '+tk.gate:'')+'."')}});
  [-3,-1,1].forEach(k=>a.push({x:u(GU(i)+k),z:w(7.9),r:.6,l:'Sit down',a:()=>sitOn(u(GU(i)+k),w(7.6),0)}))}
 return a}
function info(){mode='menu';const tk=T.active().find(k=>k.from==here()),n=T.now();
 $('ui').innerHTML=`<div class="box modal" style="max-width:560px"><h2>i  ${esc(T.apName(here()))}</h2><p class=m>Time now ${clk()}${T.abroad()?' (local '+T.local(n,here())+')':''}.</p>
 ${tk?`<p><b>Your flight ${esc(tk.fl)} to ${esc(T.place(tk.to))}</b>, Gate <b>${tk.gate}</b>, seat ${esc(tk.seat)}.<br>Boarding ${T.hm(tk.dep-RU.BOARD)} · gate closes <b>${T.hm(tk.dep-RU.CLOSE)}</b> (${T.left(tk.dep-RU.CLOSE)}).</p>
 <ol><li>${tk.ck?'✓ Checked in':'Check in at a Swiftwing desk (left of the entrance) or in the app'}</li><li>Security, straight ahead (boarding pass needed)</li><li>Gate ${tk.gate}: past security, along the window wall (gates 1-3 on the left, 4-6 on the right)</li><li>At the gate door press E to board, then sit in seat ${esc(tk.seat)}</li></ol>`:'<p>You have no flight from here. Buy one at the orange Tickets desk or in the Swiftwing app.</p>'}
 <p class=m>Miss the gate closing time and the ticket is lost. Cancelling more than 2 hours before departure refunds 70%.</p><div class=row2><button class=go onclick="closeUI()">Thanks</button></div></div>`}
const SHOPI={bean:['Bean There',[['Flat White',6,8],['Iced Latte',7,8],['Blueberry Muffin',5,7]]],c9:['Cloud Nine Coffee',[['Cappuccino',7,9],['Mocha',8,10],['Croissant',6,8],['Bagel',7,10]]],
 rb:['Runway Burgers',[['Runway Burger',14,22],['Chicken Wrap',12,18],['Fries',6,8],['Milkshake',8,9]]],sky:['Sky Shop',[['Neck Pillow',25,0,'Comfy. You feel ready for a long flight.'],['Sunglasses',60,0,'Very jet-set.'],['Fancy Perfume',120,0,'You smell like a world tour.'],['Chocolate Bar',4,5]]],
 pg:['Pages',[['Music Magazine',6,0,'You read about yourself. Probably.'],['Water',3,3],['Gum',2,1]]]};
function shop(k){const s=SHOPI[k];if(!s)return;mode='menu';$('ui').innerHTML=`<div class="box modal" style="max-width:460px"><h2>${esc(s[0])}</h2><p class=m>Airport prices. Balance ${$$(S.money)}.</p>${s[1].map((it,i)=>`<div class=ng style="justify-content:space-between;align-items:center;margin:6px 0"><span>${esc(it[0])}${it[2]?` <small class=m>+${it[2]} energy</small>`:''}</span><button class=go ${S.money<it[1]?'disabled':''} onclick="apBuy('${k}',${i})">${$$(it[1])}</button></div>`).join('')}<div class=row2><button onclick="closeUI()">Done</button></div></div>`}
window.apBuy=(k,i)=>{const it=SHOPI[k]&&SHOPI[k][1][i];if(!it||S.money<it[1])return;S.money=+(S.money-it[1]).toFixed(2);if(it[2])S.energy=Math.min(100,(+S.energy||0)+it[2]);try{snd('cash')}catch(e){}say(it[3]||('Bought '+it[0]+(it[2]?' (+'+it[2]+' energy)':'')));shop(k)};
/* the outside is built once the city is merged (after the road warp), before the new-game defaults are snapshotted */
{const c0=cityTraffic;cityTraffic=function(){c0.apply(this,arguments);try{buildOut()}catch(e){console.error('airport outside',e)}}}
{const u0=update;update=function(dt){u0(dt);try{tick(dt)}catch(e){if(!AP.err){AP.err=1;console.error('airport',e)}}}}
/* a career loaded while abroad: the destination city may place you ('restore'), otherwise you wait in that city's terminal */
{const r0=resetState;resetState=function(){r0.apply(this,arguments);AP.needR=1;AP.tk=null;AP.ph=null}}
function tick(dt){AP.t+=dt;outTick(dt);
 if(AP.needR&&mode=='play'&&S.artist){AP.needR=0;if(T.abroad()&&!IN&&!T.emit('restore',T.loc()))apEnter('arr')}const t=inT(),c=inC();if(AP.grp)AP.grp.visible=t;if(AP.cgrp)AP.cgrp.visible=c;
 /* a boarded ticket only lives in the cabin: after a reload or anything else that took you out, you are back off the plane */
 if(AP.tk&&!c&&(AP.ph=='board'||AP.ph=='sit'||AP.ph=='landed')&&mode=='play'){if(AP.ph!='landed')AP.tk.bt=0;AP.tk=null;AP.ph=null}
 T.active().forEach(k=>{if(k.bt&&(!AP.tk||AP.tk.id!=k.id))k.bt=0});
 if(t){if(AP.loc!==here())relabel();const f=nf();if(AP.light)AP.light.intensity=.95*f;fadeAll(dt,AP.fadeI);fxTick(dt);
  if(AP.t-(AP.bt||0)>1){AP.bt=AP.t;AP.boards.forEach(drawBoard);AP.gates.forEach(drawGate)}
  const v=P.z-AZ;if(AP.lastV!=null&&AP.lastV>=SECV&&v<SECV){const lane=LANES.find(x=>Math.abs(P.x-AX-x)<1.2);if(lane!=null){const m=AP.doorM.find(q=>q.k=='sec'&&Math.abs(q.m.position.x-AX-lane)<.1);if(m)m.t=1.2;try{snd('chime')}catch(e){}const tk=T.pass();say('Security ✓'+(tk?' Now go to Gate '+tk.gate+'.':''))}}AP.lastV=v;
  AP.doorM.forEach(q=>{if(q.k=='sec'){q.t=Math.max(0,q.t-dt);q.m.material.color.set(q.t>0?'#56f08a':secOK()?'#2fae5a':'#c0392b')}else{const tk=gateTk(q.i),open=tk&&T.now()>=tk.dep-RU.BOARD&&T.now()<tk.dep-RU.CLOSE;q.o+=((open?1:0)-q.o)*Math.min(1,dt*3);q.L.position.x=q.x-.55-q.o*.9;q.R.position.x=q.x+.55+q.o*.9;q.lamp.material.color.set(open?'#2fe68a':'#c0392b')}});
  if(AP.tug){AP.tug.position.x=AX-10+((AP.t*5)%(AW+20))}
  if(AP.jets)AP.jets.forEach((j,i)=>{const tk=gateTk(i+1);j.visible=!!tk||(hsh2(here()+i+S.day)%3!=0)})}
 if(c){const f=nf();if(AP.clight)AP.clight.intensity=.15+.8*f;if(AP.seatM&&AP.seatM.visible)AP.seatM.position.y=1.9+Math.sin(AP.t*4)*.15;
  const fa=AP.fa;if(fa){fa.ph+=dt*8;fa.x+=fa.d*.6*dt;if(fa.x>CW-2)fa.d=-1;if(fa.x<1.2)fa.d=1;fa.c.g.position.set(CX+fa.x,0,AZ+3);fa.c.g.rotation.y=fa.d>0?Math.PI/2:-Math.PI/2;const s=Math.sin(fa.ph)*.5;fa.c.legs[0].rotation.x=s;fa.c.legs[1].rotation.x=-s}
  const tk=AP.tk;if(tk&&AP.ph=='board'&&T.now()>=tk.dep&&mode=='play'){say('"Please take your seat, we are leaving."');const s=seatXZ(tk);P.x=s.ax;P.z=s.az;sitDown()}
  /* standing up from a seat in the cabin always puts you in the aisle */
  if(P.sit&&AP.ph=='landed'){P.sit=null}}}
const hsh2=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
/* stand up into the aisle, not into the seat row */
{const w0=worldTick;worldTick=function(dt){if(inC()&&P.sit&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(k=>keys[k])){if(AP.ph=='sit'){keys.w=keys.a=keys.s=keys.d=0}else{P.sit=null;P.z=AZ+3}}w0(dt)}}
/* camera: a wider view in the terminal so gates and signs are easy to read */
window.VIEWX=()=>typeof mode!='undefined'&&mode=='play'?(inT()?12:inC()?8:0):0;
/* map: the airport on the big map, the minimap and a taxi button */
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){m0(x,sx,sz,kx,kz,mini);try{const W=x.canvas.width,H=x.canvas.height;if(sx(-130)<-10)/* airport may be on screen */{}
 const rect=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(sx(a),sz(b),(c-a)*kx,(d-b)*kz)};if(sx(-140)<0&&sx(-620)>W)return;
 rect(-620,-160,-345,168,'#4f8a49');rect(-470,92,-250,132,'#9a9c9e');rect(-600,134,-200,158,'#2e3136');rect(-300,14.9,-137.4,24.9,'#3a3d44');rect(-330,-11,-300,51,'#cfc9bc');
 rect(OUT.x0,OUT.z0,OUT.x1,OUT.z1,'#dfe4ea');rect(-299,33,-265,59,'#5a5d64');rect(-299,-19,-265,7,'#5a5d64');rect(-284,106,-280,110,'#e4e8ee');
 if(!mini||kx>.5){x.strokeStyle='#0b2a5b';x.lineWidth=1;x.strokeRect(sx(OUT.x0),sz(OUT.z0),(OUT.x1-OUT.x0)*kx,(OUT.z1-OUT.z0)*kz)}
 if(!mini){x.save();x.fillStyle='#0b2a5b';x.font='bold '+Math.max(10,Math.min(18,kx*14))+'px monospace';x.textAlign='center';x.fillText('✈ AIRPORT',sx((OUT.x0+OUT.x1)/2),sz(20));x.font=Math.max(9,Math.min(12,kx*9))+'px monospace';x.fillStyle='#eee';x.fillText('Runway',sx(-400),sz(147));x.restore()}}catch(e){}}}
{const b0=bigMap;bigMap=function(){b0();try{if(!$('bm')||T.abroad())return;const r=document.querySelector('#ui .row2');if(!r)return;const bt=document.createElement('button');bt.textContent='Taxi to Airport';bt.onclick=()=>taxi(OUT.fx+6,OUT.fz);r.insertBefore(bt,r.lastElementChild)}catch(e){}}}
/* bridge to the destination cities (DCITY, 137-tour-cities.js) when it is loaded: it builds each city and its airport */
{const DC=()=>window.DCITY&&typeof window.DCITY=='object'?window.DCITY:null,
 put=(f,id)=>{const d=DC();if(!d)return false;try{const fn=d[f]||d.arrive;return typeof fn=='function'&&fn.call(d,id)!==false}catch(e){console.error('DCITY '+f,e);return false}};
 /* on landing (the player is off the plane, no interior): tear down the city flown from, then let the new city place them */
 T.on('arrive',(id,tk)=>{const d=DC();if(d&&tk&&tk.from!='home'&&typeof d.leave=='function')try{d.leave()}catch(e){console.error('DCITY leave',e)}
  return id!='home'&&put('arrive',id)});
 T.on('exitAirport',id=>put('outside',id));
 T.on('restore',id=>put('restore',id));
 /* a city's airport doors or gate: walk into the shared terminal, where tickets, security and gates work as at home */
 T.boardAt=()=>{if(typeof window.apEnter!='function')return false;window.apEnter('front');return true}}
try{if(typeof MAPZ!='undefined')MAPZ.L=Math.max(MAPZ.L||0,480)}catch(e){}
/* v49.1.0: shared for 72-tutorial.js (inAp: the airport tutorial step never finished) and 167-resume-spot.js (no resume spot in a plane cabin), which look for them with typeof */
window.AX=AX;window.inC=inC;
})();
