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
const AP={fadeI:[],idx:-1,cidx:-1,grp:null,cgrp:null,og:null,npc:[],cnpc:[],cols:[],ccols:[],tk:null,ph:null,t:0,msgT:0,signs:[],boards:[],gates:[],dirty:1,loc:null,fadeM:[],pend:null,seatM:null,doorM:[],light:null,clight:null,sec:0,anim:[],lastV:null};
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
 POIS.push([-322,20,'Airport ✈','#7fd4ff']);
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

/* ================= terminal interior ================= */
function buildTerm(){if(AP.grp)return;const G=xgNew(),g=AP.grp=new THREE.Group();scene.add(g);g.visible=false;
 if(AP.idx<0){SHOPS.push({name:'Airport terminal',cx:OUT.x1+2,ez:20,ox:AX});AP.idx=SHOPS.length-1}
 const u=v=>AX+v,w=v=>AZ+v,bx=(W,H,D,c,x,y,z,tc)=>xgBox(G,W,H,D,c,u(x),y,w(z),0,tc),col=(a,b,c,d)=>AP.cols.push([u(a),w(b),u(c),w(d)]);
 /* floor: terrazzo landside, light stone airside, blue carpet at the gates */
 const ft=can(256,256,(c,W,H)=>{c.fillStyle='#b9b3a8';c.fillRect(0,0,W,H);for(let i=0;i<900;i++){c.fillStyle=['#a9a397','#c8c2b6','#99938a','#afb3b6'][i%4];c.fillRect(Math.random()*W,Math.random()*H,2,2)}c.strokeStyle='#8f897f';c.lineWidth=2;c.strokeRect(0,0,W,H)});
 ft.t.wrapS=ft.t.wrapT=THREE.RepeatWrapping;ft.t.repeat.set(AW/4,AD/4);const f=new THREE.Mesh(new THREE.PlaneGeometry(AW,AD),new THREE.MeshLambertMaterial({map:ft.t}));f.rotation.x=-Math.PI/2;f.position.set(u(AW/2),0,w(AD/2));g.add(f);
 bx(AW,.03,13,'#2f5d9e',AW/2,.015,6.8);for(let i=1;i<=6;i++)bx(10,.035,6,'#3a6fb4',GU(i),.02,8.6);
 bx(AW,.03,3.4,'#ffd84a33'.slice(0,7),AW/2,.012,13.3);bx(AW,.035,.12,'#ffd84a',AW/2,.025,14.9);
 /* walls */
 bx(.4,5.6,AD,'#cfc7b6',-.2,2.8,AD/2);bx(AW,.6,.4,'#566270',AW/2,.3,-.2);bx(AW,1,.4,'#cfc7b6',AW/2,5.1,-.2);
 for(let x=0;x<=AW;x+=4)bx(.25,4.2,.3,'#566270',x,2.7,-.15);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(AW,4),new THREE.MeshBasicMaterial({color:'#bfe3ff',transparent:true,opacity:.16,depthWrite:false}));glass.position.set(u(AW/2),2.6,w(-.1));g.add(glass);
 bx(AW,.7,.3,'#cfc9bc',AW/2,.35,AD-.1);bx(.3,.7,AD,'#cfc9bc',AW-.1,.35,AD/2);
 bx(.4,1.2,.4,'#566270',33,.6,AD-.1);bx(.4,1.2,.4,'#566270',39,.6,AD-.1);
 bx(.2,.06,3,'#888',35.7,.02,AD-.6);bx(2.6,.03,2.6,'#3d4350',36,.02,AD-1.6);
 /* columns */
 [[12,46],[24,46],[48,52],[60,52],[12,24],[60,24],[24,24],[48,24]].forEach(([a,b])=>{bx(.9,5.6,.9,'#f2efe8',a,2.8,b);col(a-.45,b-.45,a+.45,b+.45)});
 /* --- entrance hall --- */
 bx(22,1.3,.6,'#566270',16,.65,42.4);bx(22,.25,.9,'#2b3440',16,.55,43.1);col(5,42,27,43.5);
 [8,13,18,23].forEach((a,i)=>{bx(3.4,1.05,1,'#f4f6f9',a,.52,44.7,'#0b2a5b');bx(3.4,.15,.08,'#ff6b4a',a,.95,45.22);bx(.5,.35,.3,'#1b2533',a+.9,1.25,44.5);col(a-1.7,44.2,a+1.7,45.2);
  sign(g,1.2,1.2,String(i+1),u(a),2.9,w(44.25),0,{bg:'#0b2a5b',fg:'#fff'})});
 for(let i=0;i<5;i++){bx(.12,.9,.12,'#888',6+i*5,.45,48.4);}bx(20,.06,.04,'#c0392b',16,.85,48.4);
 AP.signs.push({k:'ck',m:fd(sign(g,22,1.6,'SWIFTWING  CHECK-IN  1 – 4',u(16),3.2,w(42.1),0,{bg:'#0b2a5b',fg:'#fff',bar:'#ff6b4a'}),u(5),w(42),u(27),w(42.3),4)});
 bx(8,1.05,1,'#f4f6f9',50,.52,44.7,'#ff6b4a');bx(8,1.6,.4,'#0b2a5b',50,.8,42.6);col(46,42.4,54,45.2);
 fd(sign(g,8,1.3,'TICKETS · CHANGES',u(50),2.5,w(42.38),0,{bg:'#ff6b4a',fg:'#fff'}),u(46),w(42.3),u(54),w(42.5),3.2);
 bx(5,1.05,2.4,'#f4f6f9',62,.52,47,'#1565d8');col(59.5,45.8,64.5,48.2);
 fd(sign(g,3,1.4,'i  INFORMATION',u(62),3.6,w(45.8),Math.PI/4,{bg:'#1565d8',fg:'#fff'}),u(61),w(44.8),u(63),w(46.8),4.3);
 /* landside departures board on the left wall, seats, kiosk, plants */
 AP.boards.push({m:pl(g,null,11,5.4,u(.06),2.9,w(48),Math.PI/2),n:9,title:'DEPARTURES',cv:null});
 [[56,50.5],[56,53.5],[66,50.5],[66,53.5]].forEach(([a,b])=>{for(let i=0;i<4;i++){bx(.8,.45,.8,'#1565d8',a-1.5+i,.23,b);bx(.8,.6,.15,'#0b2a5b',a-1.5+i,.65,b-.35)}col(a-2,b-.5,a+2,b+.45)});
 bx(6,1.1,2,'#6b4a32',67,.55,38.6,'#e9dcc6');bx(6,1.6,.3,'#4a3324',67,.8,37.4);col(64,37.2,70,39.7);fd(sign(g,5,1,'BEAN THERE ☕',u(67),2.3,w(37.2),0,{bg:'#4a3324',fg:'#ffe0b0'}),u(64.5),w(37.1),u(69.5),w(37.3),2.8);
 [[3,54],[70,54],[3,38],[30,52],[42,52]].forEach(([a,b])=>{bx(1,.8,1,'#8a6a4a',a,.4,b);bx(1.3,1.2,1.3,'#2e8b57',a,1.4,b);col(a-.5,b-.5,a+.5,b+.5)});
 AP.signs.push({k:'wel',m:fd(sign(g,16,1.5,'WELCOME',u(36),4.6,w(55.8),0,{bg:'#ffffff',fg:'#0b2a5b',bar:'#ff6b4a'}),u(28),w(55.7),u(44),w(55.9),5.4)});
 /* --- security --- */
 bx(28,1,.3,'#566270',14,.5,SECV);bx(28,.4,.5,'#0b2a5b',14,4.8,SECV);bx(28,.4,.5,'#0b2a5b',58,4.8,SECV);bx(28,1,.3,'#566270',58,.5,SECV);
 const gp=new THREE.MeshBasicMaterial({color:'#cfe8ff',transparent:true,opacity:.2,depthWrite:false});[[14],[58]].forEach(([a])=>{const q=new THREE.Mesh(new THREE.PlaneGeometry(28,3.6),gp);q.position.set(u(a),2.8,w(SECV));g.add(q)});
 col(0,SECV-.2,28,SECV+.2);col(44,SECV-.2,AW,SECV+.2);
 LANES.forEach((a,i)=>{bx(1,.9,5.2,'#9aa3ad',a-1.7,.45,SECV+.4);bx(1.2,1.6,1.8,'#d7dbe2',a-1.7,.8,SECV+.4);bx(1,.05,5.2,'#2b2f36',a-1.7,.92,SECV+.4);col(a-2.3,SECV-2.2,a-1.1,SECV+3);
  bx(.3,2.4,.4,'#c5cbd2',a-.95,1.2,SECV);bx(.3,2.4,.4,'#c5cbd2',a+.95,1.2,SECV);bx(2.2,.35,.4,'#c5cbd2',a,2.45,SECV);col(a-1.1,SECV-.2,a-.8,SECV+.2);col(a+.8,SECV-.2,a+1.1,SECV+.2);
  const lm=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.42),new THREE.MeshBasicMaterial({color:'#2fe68a'}));lm.position.set(u(a),2.7,w(SECV));g.add(lm);AP.doorM.push({k:'sec',m:lm,t:0});
  bx(.8,.06,.06,'#c0392b',a,.9,SECV+3);sign(g,1.6,.5,'LANE '+(i+1),u(a),3.05,w(SECV+.25),0,{bg:'#0b2a5b',fg:'#fff'})});
 bx(.3,1,.3,'#566270',44.2,.5,SECV);col(43.6,SECV-.2,44,SECV+.2);
 AP.signs.push({k:'sec',m:fd(sign(g,16,1.1,'SECURITY · BOARDING PASS NEEDED',u(36),3.7,w(SECV+.3),0,{bg:'#0b2a5b',fg:'#ffd84a'}),u(28),w(SECV+.2),u(44),w(SECV+.4),4.3)});
 /* --- airside --- */
 AP.boards.push({m:fd(pl(g,null,14,4.6,u(36),3.9,w(29.6)),u(29),w(29.5),u(43),w(29.7),6.2),n:8,title:'DEPARTURES',cv:null});bx(.15,1.4,.15,'#566270',30,5.2,29.6);bx(.15,1.4,.15,'#566270',42,5.2,29.6);
 fd(sign(g,9,1.2,'⟵  GATES 1 · 2 · 3',u(16),4.4,w(27.4),0,{bg:'#0b2a5b',fg:'#ffd84a',al:'left'}),u(11.5),w(27.3),u(20.5),w(27.5),5);fd(sign(g,9,1.2,'GATES 4 · 5 · 6  ⟶',u(56),4.4,w(27.4),0,{bg:'#0b2a5b',fg:'#ffd84a'}),u(51.5),w(27.3),u(60.5),w(27.5),5);
 /* Sky Shop on the left wall */
 for(let i=0;i<3;i++){bx(.8,2.2,3,'#e8e2d6',.6,1.1,17+i*3.4);[.5,1.1,1.7].forEach(y=>bx(.6,.25,2.6,['#c06090','#5aa0d8','#e6b422','#7a5ad8'][(i+y*3|0)%4],.9,y,17+i*3.4))}
 col(0,15.2,1.2,26.4);bx(3,1,1.2,'#f4f6f9',5,.5,21,'#c06090');col(3.5,20.4,6.5,21.6);sign(g,6,1.1,'SKY SHOP · DUTY FREE',u(.25),3.2,w(21),Math.PI/2,{bg:'#c06090',fg:'#fff'});
 /* Cloud Nine Coffee */
 bx(8,1.1,1.2,'#6b4a32',23,.55,17.4,'#e9dcc6');bx(8,2.6,.3,'#4a3324',23,1.3,15.6);col(19,15.4,27,18);sign(g,7,1.1,'CLOUD NINE COFFEE',u(23),3.1,w(15.4),0,{bg:'#4a3324',fg:'#ffe0b0'});
 [[20,21.5],[24,21.5],[20,24.5],[24,24.5]].forEach(([a,b])=>{bx(1.1,.75,1.1,'#d9cbb2',a,.38,b);bx(.5,.45,.5,'#6b4a32',a-1,.23,b);bx(.5,.45,.5,'#6b4a32',a+1,.23,b);col(a-.55,b-.55,a+.55,b+.55)});
 /* newsstand, Runway Burgers */
 bx(6,1,1,'#2b3440',50,.5,17,'#ffd84a');bx(6,2.2,.3,'#3a4552',50,1.1,15.6);col(47,15.4,53,17.5);sign(g,5,.9,'PAGES · NEWS',u(50),2.8,w(15.4),0,{bg:'#ffd84a',fg:'#111'});
 bx(10,1.1,1.2,'#b33a2a',64,.55,17.4,'#f0e2c8');bx(10,2.6,.3,'#7a241a',64,1.3,15.6);col(59,15.4,69,18);sign(g,8,1.1,'RUNWAY BURGERS',u(64),3.1,w(15.4),0,{bg:'#b33a2a',fg:'#fff'});
 /* seat rows airside */
 [[33,21],[33,24.5],[39,21],[39,24.5]].forEach(([a,b])=>{for(let i=0;i<5;i++){bx(.8,.45,.8,'#566270',a-2+i,.23,b);bx(.8,.6,.15,'#2b3440',a-2+i,.65,b-.35)}col(a-2.5,b-.5,a+2.5,b+.45)});
 /* --- gates --- */
 for(let i=1;i<=6;i++){const a=GU(i);
  bx(2.6,3.4,.5,'#0b2a5b',a,1.7,.05);const dm=new THREE.Mesh(new THREE.BoxGeometry(2,2.6,.12),pm('#c5cbd2'));dm.position.set(u(a),1.3,w(.32));g.add(dm);AP.doorM.push({k:'door',i,m:dm,o:0});
  sign(g,2.6,1.2,'GATE '+i,u(a),4.1,w(.12),0,{bg:'#ffd84a',fg:'#0b2a5b'});
  fd(sign(g,2.4,2.4,String(i),u(a),4.2,w(13.1),Math.PI/4,{bg:'#0b2a5b',fg:'#ffd84a'}),u(a-.9),w(12.2),u(a+.9),w(14),5.4);
  const sc=pl(g,null,2.6,1.5,u(a-3.4),2.3,w(.15));AP.gates.push({i,m:sc,cv:null,key:''});bx(2.8,1.7,.12,'#1b2533',a-3.4,2.3,.06);
  bx(2.6,1.05,.9,'#f4f6f9',a+3.4,.52,4.6,'#0b2a5b');col(a+2.1,4.1,a+4.7,5.1);
  [7.6,10].forEach(b=>{for(let k=0;k<6;k++){bx(.8,.45,.8,'#1565d8',a-3+k,.23,b);bx(.8,.6,.15,'#0b2a5b',a-3+k,.65,b-.35)}col(a-3.5,b-.5,a+2.5,b+.45)});
  bx(.12,.9,.12,'#888',a-1.6,.45,2.6);bx(.12,.9,.12,'#888',a+1.6,.45,2.6);bx(3.2,.06,.04,'#c0392b',a,.85,2.6)}
 fl(G,g);
 /* outside the window wall: apron, jet bridges, parked jets, a baggage tug */
 {const ap=new THREE.Mesh(new THREE.PlaneGeometry(110,70),pm('#8d9196'));ap.rotation.x=-Math.PI/2;ap.position.set(u(AW/2),-.04,w(-35));g.add(ap);
  const G2=xgNew();for(let i=1;i<=6;i++){const a=GU(i);xgBox(G2,2.4,2.6,7,'#cfd5dc',u(a),1.5,w(-3.6));xgBox(G2,.5,1.4,.5,'#7a828c',u(a),.7,w(-6.5));xgBox(G2,.3,.03,30,'#f5c542',u(a+3.4),.01,w(-20))}
  xgBox(G2,AW+30,.03,.4,'#f2f2f2',u(AW/2),.01,w(-46));fl(G2,g);
  AP.jets=[];for(let i=1;i<=6;i++){const p=mkPlane({tail:i%3==0?'#1565d8':'#ff6b4a'});p.position.set(u(GU(i)+3.6),0,w(-23.5));g.add(p);AP.jets.push(p)}
  const tug=new THREE.Group();[[0,'#f5c542'],[1,'#4a5868'],[2,'#5b6b7c']].forEach(([k,c])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.1,1.5),pm(c));m.position.set(-k*2.8,.6,0);tug.add(m)});tug.position.set(u(0),0,w(-15.5));g.add(tug);AP.tug=tug}
 /* light that follows the time of day, only while you are inside */
 AP.light=new THREE.HemisphereLight('#ffffff','#8a8a8a',0);g.add(AP.light);
 buildNpc();AP.dirty=1}
function buildNpc(){const g=AP.grp,u=v=>AX+v,w=v=>AZ+v,SW_T='#1d3d7a',SW_P='#1a1f2e';
 const stand=(a,b,o,ry)=>{const c=mkChar(o);c.g.position.set(u(a),0,w(b));c.g.rotation.y=ry||0;g.add(c.g);AP.npc.push({c,k:'idle',ph:Math.random()*6});return c};
 [8,13,18,23].forEach(a=>stand(a,43.7,{tc:SW_T,pc:SW_P,top:0}));stand(50,43.7,{tc:'#ff6b4a',pc:SW_P,top:0});stand(62,47,{tc:'#1565d8',pc:SW_P,top:0});
 LANES.forEach(a=>stand(a+1.6,SECV-1.4,{tc:'#2b2b2b',pc:'#1b1b1b',top:0}));
 for(let i=1;i<=6;i++)stand(GU(i)+3.4,3.8,{tc:SW_T,pc:SW_P,top:0});
 stand(67,37.9,{tc:'#6b4a32'});stand(23,16.6,{tc:'#6b4a32'});stand(64,16.6,{tc:'#b33a2a'});stand(5,20.4,{tc:'#c06090'});stand(50,16.4,{tc:'#3a4552'});
 /* walkers with suitcases: landside and airside lanes */
 [[39.5,1],[49.8,1],[52,0],[39.5,0],[12.5,1],[27,0],[12.5,0],[27,1],[14,1],[50.5,0]].forEach(([b,d],i)=>{const c=mkChar();const s=new THREE.Mesh(new THREE.BoxGeometry(.4,.55,.25),pm(['#c0392b','#2d5a8d','#1b1b1b','#e6b422','#7a5ad8'][i%5]));s.position.set(.42,.3,-.25);c.g.add(s);
  g.add(c.g);AP.npc.push({c,k:'walk',v:b,x:4+Math.random()*64,d:d?1:-1,sp:.9+Math.random()*.6,ph:Math.random()*6})});
 /* people waiting at the gates */
 for(let i=0;i<10;i++){const gi=1+rr(6),c=mkChar();c.g.position.set(u(GU(gi)-3+rr(6)),-.3,w(rr(2)?7.6:10));c.legs[0].rotation.x=c.legs[1].rotation.x=-1.5;c.arms[0].rotation.x=c.arms[1].rotation.x=-.6;g.add(c.g)}}
function npcTick(dt){AP.npc.forEach(n=>{n.ph+=dt*8;const c=n.c;if(n.k=='idle'){c.arms[0].rotation.x=Math.sin(n.ph*.15)*.08;c.arms[1].rotation.x=-Math.sin(n.ph*.13)*.08;return}
 n.x+=n.d*n.sp*dt;if(n.x>69){n.d=-1}if(n.x<3){n.d=1}c.g.position.set(AX+n.x,Math.abs(Math.sin(n.ph))*.04,AZ+n.v);c.g.rotation.y=n.d>0?Math.PI/2:-Math.PI/2;
 const s=Math.sin(n.ph)*.6;c.legs[0].rotation.x=s;c.legs[1].rotation.x=-s;c.arms[0].rotation.x=-s*.6;c.arms[1].rotation.x=0})}

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
  if(where=='arr'){const d=T.here();say(d?'🛬 Welcome to '+T.place(here())+'! Local time '+T.local(T.now(),here())+'.':'🛬 Welcome home to '+T.apName('home')+'.')}
  else if(!S.travel.seen.ap){S.travel.seen.ap=1;say('✈ Check in at a Swiftwing desk, go through security, then find your gate. Book flights at the ticket desk.')}},
  where=='arr'?'':T.apName(here()),where=='arr'?'':'Departures · check-in · gates 1-6')}
window.apEnter=apEnter;
function apLeave(){if(T.abroad()){IN=null;if(T.emit('exitAirport',here()))return;apEnter('front');setTimeout(()=>say('The streets of '+T.city(here())+' are not open yet. Book a flight at the ticket desk.'),1100);return}
 fade(()=>{IN=null;P.sit=null;P.x=OUT.fx;P.z=OUT.fz;P.rot=Math.PI/2;camT.x=P.x;camT.z=P.z},'')}

/* ================= security ================= */
const secOK=()=>!!T.pass();
let secSay=0;function secMsg(){const n=performance.now();if(n-secSay<2500)return;secSay=n;const tk=T.active().find(k=>k.from==here());try{snd('err')}catch(e){}
 say(!tk?'🛂 Security: you need a boarding pass. Book a flight at the ticket desk first.':!tk.ck?(T.ckWin(tk)?'🛂 Security: check in first (Swiftwing desks 1-4, by the entrance), then come back.':tk.dep-T.now()>RU.CK_OPEN?'🛂 Too early: check-in for '+tk.fl+' opens '+T.hm(tk.dep-RU.CK_OPEN)+'.':'🛂 Check-in for '+tk.fl+' has closed.'):'🛂 Your flight has closed.')}

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
  say('🎫 Welcome aboard '+tk.fl+' to '+T.city(tk.to)+'. Your seat is '+tk.seat+' (follow the arrow). The plane leaves when you sit down.')},'Boarding '+tk.fl,'Gate '+tk.gate+' → '+T.place(tk.to))}

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
 AP.ph='sit';say('🔒 Seatbelt on. The doors close and '+tk.fl+' pushes back...');setTimeout(()=>{if(AP.ph=='sit')takeOff()},1800)}
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
 d.innerHTML=`<style>#apfly .cl{position:absolute;background:#fff;border-radius:999px;opacity:.75;filter:blur(1px);animation:apcl linear infinite}@keyframes apcl{from{transform:translateX(110vw)}to{transform:translateX(-40vw)}}#apfly button{all:unset;cursor:pointer;background:#ff6b4a;color:#fff;font-weight:700;padding:8px 18px;border-radius:10px;box-shadow:0 3px 0 #c84528}</style>
 ${[0,1,2,3,4,5].map(i=>`<div class=cl style="top:${10+i*14}%;width:${120+i*40}px;height:${30+i*6}px;animation-duration:${6+i*1.6}s;animation-delay:-${i*1.3}s"></div>`).join('')}
 <div style="position:relative;font:700 28px ${FONT}">${esc(tk.fl)} · ${esc(T.city(tk.from))} → ${esc(T.city(tk.to))}</div>
 <canvas id=apflc width=720 height=300 style="position:relative;width:min(720px,94vw);aspect-ratio:720/300;border-radius:14px;border:3px solid #0b2a5b;background:#7cc2ff"></canvas>
 <div id=apflt style="position:relative;font:700 18px ${FONT}"></div><div style="position:relative;display:flex;gap:10px"><button onclick="apLand()">Skip ⏭</button></div>`;
 document.body.appendChild(d);const t0=performance.now(),DUR=8500,A=T.dest(tk.from)||WT_HOME,B=T.dest(tk.to)||WT_HOME;AP.flv=null;
 const step=()=>{if(!document.getElementById('apfly')||AP.ph!='fly')return;const k=Math.min(1,(performance.now()-t0)/DUR),c=document.getElementById('apflc');if(c&&T.paintWorld){const r=c.getBoundingClientRect(),W0=r.width||720,H0=r.height||300,dpr=Math.min(3,window.devicePixelRatio||1),W=Math.round(W0*dpr),H=Math.round(H0*dpr);
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
window.apLand=function(){const tk=AP.tk;if(!tk||AP.ph!='fly')return;const d=document.getElementById('apfly');if(d)d.remove();
 tk.st='flown';tk.bt=0;AP.ph='landed';T.st().loc=tk.to||'home';const arr=AP.arrT||T.now(),end=(S.day+1)*1440+360;
 const s=seatXZ(tk);P.sit=null;P.x=s.ax;P.z=s.az;P.rot=Math.PI;camT.x=P.x;camT.z=P.z;AP.cnpc.forEach(n=>n.c.g.visible=true);if(AP.seatM)AP.seatM.visible=false;
 const msg='🛬 Landed in '+T.place(tk.to)+(tk.to!='home'?' · local time '+T.local(arr,tk.to):'')+'. Exit at the front door.';
 if(arr>=end){AP.pend=arr;S.t=599.9;try{sleepNow(0)}catch(e){console.error(e)}setTimeout(()=>say(msg),1600)}
 else{S.t=Math.max(+S.t||0,Math.min(599.5,T.tOf(arr-S.day*1440)));try{closeUI()}catch(e){mode='play'}say(msg)}};
{const w0=wakeUp;wakeUp=function(){w0.apply(this,arguments);try{if(AP.pend){const a=AP.pend;AP.pend=null;S.t=Math.max(0,Math.min(599.5,T.tOf(a-S.day*1440)));
 const bx=document.querySelector('#ui .box');if(bx){const p=document.createElement('p');p.style.cssText='background:#0b2a5b;border:2px solid #ff6b4a;padding:6px 8px;margin:6px 0';p.innerHTML='✈ You slept on the plane. It is now <b>'+clk()+'</b>.';const h=bx.querySelector('h2');h?h.after(p):bx.prepend(p)}}}catch(e){}}}
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
 LANES.forEach((x,i)=>a.push({x:u(x),z:w(SECV+1.6),r:1.3,l:secOK()?'Security lane '+(i+1)+' · walk through':'Security · boarding pass needed',a:()=>secOK()?say('🛂 Walk through the arch. Have a good flight!'):(secSay=0,secMsg())}));
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
 if(t){if(AP.loc!==here())relabel();const f=nf();if(AP.light)AP.light.intensity=.95*f;fadeAll(dt,AP.fadeI);npcTick(dt);
  if(AP.t-(AP.bt||0)>1){AP.bt=AP.t;AP.boards.forEach(drawBoard);AP.gates.forEach(drawGate)}
  const v=P.z-AZ;if(AP.lastV!=null&&AP.lastV>=SECV&&v<SECV){const lane=LANES.find(x=>Math.abs(P.x-AX-x)<1.2);if(lane!=null){const m=AP.doorM.find(q=>q.k=='sec'&&Math.abs(q.m.position.x-AX-lane)<.1);if(m)m.t=1.2;try{snd('chime')}catch(e){}const tk=T.pass();say('🛂 Security ✓'+(tk?' Now go to Gate '+tk.gate+'.':''))}}AP.lastV=v;
  AP.doorM.forEach(q=>{if(q.k=='sec'){q.t=Math.max(0,q.t-dt);q.m.material.color.set(q.t>0?'#56f08a':secOK()?'#2fae5a':'#c0392b')}else{const tk=gateTk(q.i),open=tk&&T.now()>=tk.dep-RU.BOARD&&T.now()<tk.dep-RU.CLOSE;q.m.position.y=1.3+(open?2.5:0)*0+0;q.m.scale.x=open?.15:1}});
  if(AP.tug){AP.tug.position.x=AX-10+((AP.t*5)%(AW+20))}
  if(AP.jets)AP.jets.forEach((j,i)=>{const tk=gateTk(i+1);j.visible=!!tk||(hsh2(here()+i+S.day)%3!=0)})}
 if(c){const f=nf();if(AP.clight)AP.clight.intensity=.15+.8*f;if(AP.seatM&&AP.seatM.visible)AP.seatM.position.y=1.9+Math.sin(AP.t*4)*.15;
  const fa=AP.fa;if(fa){fa.ph+=dt*8;fa.x+=fa.d*.6*dt;if(fa.x>CW-2)fa.d=-1;if(fa.x<1.2)fa.d=1;fa.c.g.position.set(CX+fa.x,0,AZ+3);fa.c.g.rotation.y=fa.d>0?Math.PI/2:-Math.PI/2;const s=Math.sin(fa.ph)*.5;fa.c.legs[0].rotation.x=s;fa.c.legs[1].rotation.x=-s}
  const tk=AP.tk;if(tk&&AP.ph=='board'&&T.now()>=tk.dep&&mode=='play'){say('👩‍✈️ "Please take your seat, we are leaving."');const s=seatXZ(tk);P.x=s.ax;P.z=s.az;sitDown()}
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
{const b0=bigMap;bigMap=function(){b0();try{if(!$('bm')||T.abroad())return;const r=document.querySelector('#ui .row2');if(!r)return;const bt=document.createElement('button');bt.textContent='Taxi to Airport ✈';bt.onclick=()=>taxi(OUT.fx+6,OUT.fz);r.insertBefore(bt,r.lastElementChild)}catch(e){}}}
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
