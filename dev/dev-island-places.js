/* ===== dev only: two places on the island, the Sunset Beach Club and the Lighthouse (v53.9.0) =====
   Loaded after dev-island-v1.js (it needs the coast, window.FW_ISLAND). Add ?noisland to skip both.
   - Sunset Beach Club: a bar hut, deck, parasols and a small stage on the south-east beach. Now and then (about every 2-4 days,
     once you have a released song) the club EMAILS you (Messages) a sunset gig: day, 18:00-21:00, a fee. Accept or Decline in the
     message. On the day, walk to the stage during the slot and press the prompt: pick up to 3 of your songs and play. The crowd
     reacts to the song quality: fee (70% to 130% of the offer), followers, streams for the songs you played. It costs 20 energy and
     about 2 hours of game time. Miss the slot and the offer lapses (nothing lost). The bar also sells a cheap smoothie.
   - Lighthouse: a striped tower on the north-east headland with a light that turns at night. Climb it once a day for the view:
     +20 energy. It is also a map place, so you can set a guide marker on it.
   State (saved, old saves start empty): S.bcg={last,list:[{id,pay,exp,day,st}]} (st 0 offer, 1 booked, 2 declined, 3 played, 4 expired, 5 missed),
   S.lhDay (the day you last climbed the lighthouse), S.bcBar (the day of your last smoothie). */
(function(){
if(!window.FW_ISLAND||/[?&]noisland/.test(location.search))return;
if(typeof THREE=='undefined'||typeof WORLD=='undefined'||typeof S=='undefined')return;
const FI=window.FW_ISLAND,G=FI.grass;
const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1));
const fm=n=>'$'+Math.round(n).toLocaleString('en-US'),fmt=n=>Math.round(n).toLocaleString('en-US');
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const sv=()=>{try{autoSave()}catch(e){}};
const sn=k=>{try{snd(k)}catch(e){}};
const FL=()=>{try{return fameLevel()||0}catch(e){return 0}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};
const hm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const SLOT=[1080,1260];/* 18:00-21:00, minutes since midnight */
const mins=()=>{try{return festMins()}catch(e){const t=S.t||0;return t<300?360+t*2.8:1200+(t-300)*2}};

/* ---------- where they go: scan to the grass edge, then stand back from the beach ---------- */
function edge(x,z0,dz){let z=z0;while(inPoly(G,x,z+dz)&&Math.abs(z-z0)<900)z+=dz;return z}
/* the club goes where the south shore is flattest between the city and the east end, the lighthouse on the northernmost tip of the north-east coast */
let CLUB_X=600,flat=1e9;for(let x=470;x<=690;x+=10){const a=edge(x-45,120,3),b=edge(x+45,120,3),c=edge(x,120,3);const v=Math.abs(a-c)+Math.abs(b-c);if(v<flat){flat=v;CLUB_X=x}}
const KC=3.0;/* the club is built in ordinary metres and then scaled up so it reads as a proper venue */
const CLUB_Z=edge(CLUB_X,120,3)-9*KC;/* local z 0 is the front of the deck, the sand starts a little south of it */
let LH_X=690,tip=1e9;for(let x=560;x<=780;x+=10){const z=edge(x,-60,-3);if(z<tip){tip=z;LH_X=x}}
const KL=1.9,LH_Z=tip-100,ISLET=17,PIER_Z0=tip-8;/* the lighthouse stands on a rock islet 100 m out to sea, joined to the north shore by a pier */
const NAV=[[CLUB_X,CLUB_Z,'Beach Club','#ff7ab8'],[LH_X,LH_Z,'Lighthouse','#ffe27a']];
NAV.forEach(p=>{try{if(!POIS.some(q=>q[2]==p[2]))POIS.push(p)}catch(e){}});

/* ---------- 3D ---------- */
const root=new THREE.Group();root.name='islandPlaces';WORLD.add(root);
const cyl=(g,rt,rb,h,c,x,y,z,seg,basic)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),basic?new THREE.MeshBasicMaterial({color:c}):M(c));m.position.set(x,y,z);g.add(m);return m};
function label(g,text,w,h,x,y,z,bg,fg,ry){const cv=document.createElement('canvas');cv.width=w*128;cv.height=h*128;const c=cv.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,cv.width,cv.height);
 c.strokeStyle=fg;c.lineWidth=6;c.strokeRect(6,6,cv.width-12,cv.height-12);c.fillStyle=fg;c.font='bold '+Math.round(cv.height*.46)+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(text,cv.width/2,cv.height/2+3);
 const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m}
function palm(g,x,z,s){s=s||1;cyl(g,.18*s,.28*s,5*s,'#8a6a40',x,2.5*s,z,6);for(let i=0;i<6;i++){const a=i/6*6.283,l=new THREE.Mesh(geo(2.6*s,.08,.7*s),M(i%2?'#2f8f4a':'#3aa056'));l.position.set(x+Math.cos(a)*1.1*s,5.1*s-.25*s,z+Math.sin(a)*1.1*s);l.rotation.y=-a;l.rotation.z=.35;g.add(l)}}
function parasol(g,x,z,c){cyl(g,.05,.05,2.4,'#ddd',x,1.2,z,5);const k=new THREE.Mesh(new THREE.ConeGeometry(1.6,.7,10),M(c));k.position.set(x,2.55,z);g.add(k);B(g,.9,.4,.9,'#f3e7c2',x+1.5,.2,z+.2).rotation.y=.4}
const solids=[];
function solid(x0,z0,x1,z1){const q=[x0,z0,x1,z1];solids.push(q);cols.push(q)}

const PAL={sand:'#f1dfb0',teak:'#9a6a3c',plank:'#c99a5c',dark:'#5a3a22',bamboo:'#d1b062',thatch:'#bf9548',thatch2:'#a47c3a',teal:'#2aa7a1',coral:'#ff6f61',cream:'#fff3d9',ink:'#17171c'};
function stripedCone(g,r,h,x,y,z,c1,c2){const geo2=new THREE.ConeGeometry(r,h,10,1,true).toNonIndexed(),n=geo2.attributes.position.count,col2=new Float32Array(n*3),a=new THREE.Color(c1),b=new THREE.Color(c2);
 for(let i=0;i<n;i++){const c=(Math.floor(i/3)%2)?a:b;col2[i*3]=c.r;col2[i*3+1]=c.g;col2[i*3+2]=c.b}
 geo2.setAttribute('color',new THREE.BufferAttribute(col2,3));const m=new THREE.Mesh(geo2,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));m.position.set(x,y,z);g.add(m);return m}
/* a thatched roof: stepped layers, a ragged fringe round the eaves and a ridge */
const RM=[PAL.thatch,PAL.thatch2].map(c=>new THREE.MeshLambertMaterial({color:c,transparent:true}));
let ROOFG=null;
function RB(g,w,h,d,c,x,y,z){const m=new THREE.Mesh(geo(w,h,d),RM[c==PAL.thatch2?1:0]);m.position.set(x,y,z);g.add(m);return m}
function thatch(g0,cx,cy,cz,w,d){const g=new THREE.Group();g0.add(g);ROOFG.push(g);const B=RB;for(let i=0;i<5;i++){const s=1-i*.19;B(g,w*s,.42,d*s,i%2?PAL.thatch2:PAL.thatch,cx,cy+i*.36,cz)}
 B(g,w*.2,.5,d*.9,PAL.thatch2,cx,cy+5*.36+.1,cz);
 for(let i=0;i<Math.round(w/.7);i++){const x=cx-w/2+.35+i*.7,l=.5+((i*7)%3)*.18;B(g,.5,l,.14,i%2?PAL.thatch:PAL.thatch2,x,cy-l/2+.1,cz+d/2);B(g,.5,l,.14,i%2?PAL.thatch2:PAL.thatch,x,cy-l/2+.1,cz-d/2)}
 for(let i=0;i<Math.round(d/.7);i++){const z=cz-d/2+.35+i*.7,l=.5+((i*5)%3)*.18;B(g,.14,l,.5,i%2?PAL.thatch:PAL.thatch2,cx-w/2,cy-l/2+.1,z);B(g,.14,l,.5,i%2?PAL.thatch2:PAL.thatch,cx+w/2,cy-l/2+.1,z)}}
const bam=(g,x,z,h,r)=>{cyl(g,r||.13,r||.13,h,PAL.bamboo,x,h/2,z,6);[.3,.62].forEach(f=>cyl(g,(r||.13)+.025,(r||.13)+.025,.06,'#a8863a',x,h*f,z,6))};
function palmC(g,x,z,s,lean){s=s||1;lean=lean||.18;let px=x,py=0;for(let i=0;i<5;i++){const h=1.1*s;cyl(g,.2*s-i*.016*s,.24*s-i*.016*s,h,i%2?'#8a6a40':'#7d5f38',px,py+h/2,z,7);px+=lean*s;py+=h*.97}
 for(let i=0;i<9;i++){const a=i/9*6.283,l=new THREE.Mesh(geo(3.4*s,.07,.8*s),M(i%2?'#2f8f4a':'#3da35a'));l.position.set(px+Math.cos(a)*1.45*s,py-.05*s,z+Math.sin(a)*1.45*s);l.rotation.y=-a;l.rotation.z=.42;g.add(l)}
 [[.3,0],[-.3,.2],[0,-.3]].forEach(([dx,dz])=>{const c=new THREE.Mesh(new THREE.SphereGeometry(.22*s,6,5),M('#6b4a28'));c.position.set(px+dx*s,py-.45*s,z+dz*s);g.add(c)})}
function person(g,x,z,shirt,pants,ry,seated){const h=new THREE.Group();h.position.set(x,seated?-.32:0,z);h.rotation.y=ry||0;
 B(h,.22,.7,.22,pants,-.13,.4,0);B(h,.22,.7,.22,pants,.13,.4,0);B(h,.52,.62,.3,shirt,0,1.04,0);B(h,.16,.6,.18,shirt,-.36,1.02,0);B(h,.16,.6,.18,shirt,.36,1.02,0);B(h,.32,.32,.32,['#f1c9a0','#d9a577','#a8743f','#7a4e2b'][Math.floor(Math.abs(x*7+z*3))%4],0,1.52,0);B(h,.34,.14,.34,['#2b1d12','#6b4a28','#d9b36a','#1a1a1a'][Math.floor(Math.abs(x*3+z*5))%4],0,1.7,0);g.add(h)}
/* ---------- v54.2.0: the detailed extras: DJ lounge, dance floor, cabanas, grill hut, bar and stage dressing, beach life ---------- */
function clubExtras(g){
 const bd=(x,y,z,w,h,d,c)=>B(g,w,h,d,c,x,y,z);
 /* DJ lounge: raised platform west of the bar, pergola over it, booth, sofas, rail, steps */
 bd(-21,.55,-1,10,.9,8.4,PAL.teak);bd(-21,1.03,-1,10,.1,8.4,'#d9b070');for(let i=0;i<9;i++)bd(-25.2+i*1.05,1.09,-1,.05,.02,8.4,PAL.dark);
 bd(-21,.18,3.7,3.2,.36,.9,PAL.plank);bd(-21,.5,3.1,3.2,.5,.8,PAL.plank);
 [[-26,-5.1],[-16,-5.1],[-26,3.1],[-16,3.1]].forEach(([x,z])=>bam(g,x,z,4.6,.17));
 bd(-21,4.6,-5.1,10.4,.18,.18,PAL.dark);bd(-21,4.6,3.1,10.4,.18,.18,PAL.dark);thatch(g,-21,4.7,-1,11.4,9.6);
 [-1,1].forEach(a=>{bd(-21+a*4.9,1.6,3.1,.1,.1,1,PAL.dark)});for(let i=0;i<10;i++)bam(g,-25.8+i*1.15,3.1,1.0,.05);bd(-21,1.62,3.1,9.8,.08,.08,PAL.dark);bd(-26,1.62,-1,.08,.08,8.2,PAL.dark);
 bd(-21,1.75,-4.2,3.8,1.2,1.3,PAL.ink);bd(-21,2.4,-4.2,3.6,.1,1.1,'#2a2a30');[-.9,.9].forEach(a=>{cyl(g,.4,.4,.06,'#111',-21+a,2.5,-4.2,14);cyl(g,.09,.09,.08,'*#ff7ab8',-21+a,2.55,-4.2,8)});bd(-21,2.55,-4.2,.7,.12,.6,'#444');
 bd(-21,1.9,-3.54,3.6,.12,.05,'*#2aa7a1');[-1,1].forEach(a=>{bd(-21+a*3.6,2.55,-4.2,1.3,3.1,1.1,PAL.ink);cyl(g,.45,.45,.1,'#2a2a30',-21+a*3.6,3.0,-3.62,12).rotation.x=Math.PI/2;cyl(g,.3,.3,.1,'#2a2a30',-21+a*3.6,1.9,-3.62,12).rotation.x=Math.PI/2});
 [[-23.4,.4],[-18.6,.4]].forEach(([x,z],i)=>{bd(x,1.35,z,2.8,.45,1.2,[PAL.teal,PAL.coral][i]);bd(x,1.75,z+.5,2.8,.7,.3,[PAL.teal,PAL.coral][i]);bd(x-1.2,1.55,z,.3,.5,1.2,[PAL.teal,PAL.coral][i]);bd(x+1.2,1.55,z,.3,.5,1.2,[PAL.teal,PAL.coral][i]);bd(x-.6,1.7,z-.1,.5,.5,.12,PAL.cream);bd(x+.6,1.7,z-.1,.5,.5,.12,'#ffd23d')});
 cyl(g,.6,.6,.5,PAL.dark,-21,1.35,1.2,10);bd(-21,1.62,1.2,.3,.2,.3,'*#ffd27a');
 /* dance floor: lit tiles in front of the stage */
 for(let i=0;i<8;i++)for(let j=0;j<3;j++)bd(5.8+i*1.65,.08,6.5+j*1.65,1.6,.1,1.6,['#2f8f8a','#d9ceb4','#c4695e','#c9a64a'][(i+j*3)%4]);
 /* crowd barrier and banners at the stage */
 bd(11.5,1.15,5.7,13.2,.1,.1,'#aab');bd(11.5,.65,5.7,13.2,.1,.1,'#aab');for(let i=0;i<9;i++)bd(5+i*1.55,.7,5.7,.1,1,.1,'#889');
 [4,19].forEach((x,i)=>{bam(g,x,0,6.4,.12);bd(x+(i?-.5:.5),4.4,0,.9,3,.06,i?'#2aa7a1':'#e8452c')});
 [[5.9,'#ff7ab8'],[17.1,'#2aa7a1']].forEach(([x,c])=>{for(let k=0;k<4;k++)bd(x,1.6+k*.8,-3.1,.5,.18,.05,'*'+c)});
 /* bar dressing: buoys, bunting, chalkboard, neon, taps, surfboards */
 for(let i=0;i<5;i++){cyl(g,.32,.32,.2,i%2?'#e8452c':'#ffffff',-12+i*2.5,4.0,2.45,10).rotation.x=Math.PI/2;bd(-12+i*2.5,4.35,2.45,.05,.4,.05,'#aaa')}
 for(let i=0;i<22;i++){const x=-14.2+i*.62;bd(x,4.02-Math.sin(i/21*Math.PI)*.3,2.5,.34,.42,.04,['#e8452c','#ffd23d','#2aa7a1','#ff7ab8','#fff3d9'][i%5]).rotation.z=.05}
 bd(-7,2.45,2.15,2.2,1.4,.1,'#1c1c1c');bd(-7,2.45,2.2,2,1.2,.04,'#2f3a33');label(g,'SMOOTHIES $8',1.8,.5,-7,2.9,2.26,'#2f3a33','#fff3d9');label(g,'OPEN',1.6,.7,-1.6,3.3,2.4,'#12333a','#ff6f61');
 for(let i=0;i<4;i++){cyl(g,.07,.07,.5,'#c8c8d0',-10.8+i*.8,2.1,.1,6);bd(-10.8+i*.8,2.4,.0,.1,.1,.3,'#c8c8d0')}
 bd(-4.4,2.05,.1,.8,.6,.8,'#e9eef2');cyl(g,.3,.4,.8,'#cfe8f0',-4.4,2.7,.1,8);
 [[-14.3,'#ff6f61'],[-0,'#8ad8ff']].forEach(([x,c])=>{const b=bd(x,2.0,2.6,.6,3.8,.12,c);b.rotation.z=x<-7?.08:-.08;bd(x,2.0,2.66,.12,3.7,.14,'#fff')});
 /* cabanas behind the bar */
 [-10.5,-5,.5].forEach((cx,i)=>{const cz=-8.8,c=[PAL.teal,PAL.coral,'#8d5fd3'][i];[[-1.9,-1.9],[1.9,-1.9],[-1.9,1.9],[1.9,1.9]].forEach(([dx,dz])=>bam(g,cx+dx,cz+dz,3.4,.1));thatch(g,cx,3.5,cz,5,5);
  bd(cx,.12,cz,3.8,.18,3.8,PAL.teak);bd(cx,.5,cz,3,.4,3,'#fff3d9');bd(cx,.8,cz,2.8,.2,2.8,c);[-.8,.8].forEach(a=>bd(cx+a,1.05,cz-1.1,.9,.45,.4,i%2?PAL.cream:'#ffd23d'));
  [[-1.95,-.9],[-1.95,.9],[1.95,-.9],[1.95,.9]].forEach(([dx,dz])=>bd(cx+dx,1.7,cz+dz,.08,2.7,1.0,'#fff3d9'));bd(cx,.82,cz+1.7,.8,.5,.8,PAL.dark);bd(cx,1.12,cz+1.7,.2,.2,.2,'*#ffd27a')});
 /* grill hut east of the stage with picnic tables */
 [[21.5,-9],[27.5,-9],[21.5,-4.6],[27.5,-4.6]].forEach(([x,z])=>bam(g,x,z,3.4,.13));thatch(g,24.5,3.5,-6.8,7.8,6);
 bd(24.5,.8,-8.4,6.2,1.1,1.4,PAL.dark);bd(24.5,1.4,-8.4,6.6,.14,1.8,PAL.plank);cyl(g,.7,.6,.9,'#333',22.6,1.85,-8.4,12);bd(22.6,2.4,-8.4,.6,.3,.6,'*#ff9a2e');cyl(g,.7,.6,.9,'#333',26.4,1.85,-8.4,12);bd(26.4,2.4,-8.4,.6,.3,.6,'*#ff9a2e');
 bd(24.5,2.6,-9.3,.1,.1,.1,'#000');label(g,'BEACH GRILL',4.6,.9,24.5,3.3,-4.55,'#e8452c','#fff3d9');
 [[22,-3.2],[27,-3.2]].forEach(([x,z])=>{bd(x,.85,z,2.8,.12,1.1,PAL.plank);bd(x,.45,z-.9,2.8,.1,.5,PAL.plank);bd(x,.45,z+.9,2.8,.1,.5,PAL.plank);[-1.2,1.2].forEach(a=>bd(x+a,.4,z,.12,.8,1.1,PAL.dark))});
 /* benches, bins and lamps along the boardwalk */
 [-14,-2.5,3.5,14.5].forEach(x=>{bd(x,.55,-5,2.2,.1,.6,PAL.plank);bd(x,.9,-5.35,2.2,.5,.1,PAL.plank);[-.9,.9].forEach(a=>bd(x+a,.28,-5,.1,.55,.5,PAL.dark))});
 [-15.5,20].forEach(x=>{cyl(g,.35,.3,.9,'#2f6b4a',x,.55,5.0,8);cyl(g,.38,.38,.08,'#1c3a2a',x,1.04,5.0,8)});
 /* tiki statues at the west entrance */
 [-1,1].forEach(a=>{const x=-17.6,z=5+a*.001+(a>0?1.6:-.1);for(let k=0;k<4;k++)bd(x,.7+k*.8,z,.9,.8,.9,k%2?'#6b4a28':'#7d5a32');bd(x,3.2,z,1.2,.2,1.2,'#5a3a22');[-.22,.22].forEach(e=>bd(x+e,2.65,z+.47,.2,.2,.05,'*#fff3d9'));bd(x,2.3,z+.47,.5,.14,.05,'#2a1a10');bd(x,3.55,z,.7,.6,.15,'#e8452c');bd(x-.3,3.55,z,.2,.9,.12,'#ffd23d');bd(x+.3,3.55,z,.2,.9,.12,'#2aa7a1')});
 /* beach life: lifeguard tower, canoes, hammock, sandcastle, balls, buckets */
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>bd(-24+a*1,1.3,10.5+b*1,.14,2.6,.14,'#e9eef2'));bd(-24,2.7,10.5,2.8,.14,2.8,'#e9eef2');bd(-24,3.1,9.5,2.8,.8,.1,'#e8452c');bd(-24,1.6,10.5+1.2,.15,3,.04,'#999');bd(-24,3.6,10.5,3.1,.14,3.1,'#e8452c');bd(-24,3.7,10.5,2.2,.12,2.2,'#fff3d9');bd(-24,1.4,12,.06,.06,1.8,'#e9eef2');bd(-24.5,4.4,10.5,.04,1,.04,'#333');bd(-24.1,4.7,10.5,.6,.4,.04,'#e8452c');
 [[30,10.5,.25],[29.4,8.4,-.4]].forEach(([x,z,r],i)=>{const b=bd(x,.38,z,1.1,.45,4.4,['#e8452c','#2aa7a1'][i]);b.rotation.y=r;const b2=bd(x,.55,z,.8,.3,3.6,'#c9a46a');b2.rotation.y=r;const p=bd(x+.8,.7,z+1,.1,.1,2.6,'#8a6a40');p.rotation.y=r+.4});
 for(let i=0;i<6;i++){const t=i/5;bd(25+t*4.2,1.6-Math.sin(t*Math.PI)*.5,6.2,.9,.12,.5+(.2*Math.sin(t*3)),i%2?PAL.coral:PAL.teal)}bam(g,24.4,6.2,2.2,.1);bam(g,29.6,6.2,2.2,.1);
 bd(-7.5,.2,11.6,3.2,.4,2.6,'#e5cf98');bd(-7.5,.7,11.6,2.2,.6,1.8,'#e5cf98');bd(-7.5,1.2,11.6,1.2,.5,1,'#e5cf98');bd(-8.5,1.6,11.6,.4,.5,.4,'#e5cf98');bd(-6.5,1.6,11.6,.4,.5,.4,'#e5cf98');bd(-7.5,1.9,11.6,.06,.7,.06,'#c0392b');bd(-7.2,2.1,11.6,.5,.3,.04,'#ffd23d');
 [[0,12,'#ff6f61'],[-12,12.4,'#ffd23d'],[16,11.6,'#2aa7a1'],[9,12.2,'#8ad8ff']].forEach(([x,z,c])=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),M(c));s.position.set(x,.5,z);g.add(s)});
 [[-1.6,11.5],[-9.5,12.5],[13,12.3]].forEach(([x,z],i)=>{cyl(g,.25,.2,.35,['#e8452c','#2aa7a1','#ffd23d'][i],x,.3,z,8)});
 /* more palms and a flag line over the entrance */
 [[-29,1,1.2,.2],[-28,-6,1.05,.18],[31.5,-3,1.15,-.2],[32,5,1.1,-.16]].forEach(([x,z,s,l])=>palmC(g,x,z,s,l));
 for(let i=0;i<30;i++){const t=i/29;bd(-16+t*34,5.7-Math.sin(t*Math.PI)*1.2,7.2,.34,.46,.04,['#e8452c','#ffd23d','#2aa7a1','#ff7ab8','#fff3d9','#8d5fd3'][i%6])}
}
function buildClub(){ROOFG=[];const g=new THREE.Group();g.position.set(CLUB_X,0,CLUB_Z);g.scale.setScalar(KC);root.add(g);
 /* boardwalk deck with planks, steps down to the sand */
 B(g,34,.28,11,PAL.teak,1,.14,0);for(let i=-16;i<=17;i+=1.4)B(g,.05,.03,11,PAL.dark,i,.29,0);B(g,34.4,.14,.2,PAL.dark,1,.3,5.55);B(g,34.4,.14,.2,PAL.dark,1,.3,-5.55);
 [-8,2,12].forEach(x=>{B(g,4,.14,1.2,PAL.plank,x,.07,6.2);B(g,4,.14,1.2,PAL.plank,x,.03,7.4)});
 /* tiki bar */
 [[-13.4,-4.6],[-.6,-4.6],[-13.4,2],[-.6,2]].forEach(([x,z])=>bam(g,x,z,4.4,.16));
 B(g,12,.2,.2,PAL.dark,-7,4.45,-4.6);B(g,12,.2,.2,PAL.dark,-7,4.45,2);
 thatch(g,-7,4.5,-1.3,15.4,9.6);
 B(g,11.4,1.2,1.5,PAL.dark,-7,.9,.5);B(g,12,.16,2.1,PAL.plank,-7,1.58,.5);[-12,-10,-8,-6,-4,-2].forEach((x,i)=>B(g,.12,.5,.12,'*#ffd27a',x,1.8,.9));
 B(g,11.4,.12,.55,PAL.teak,-7,1.9,-4.2);B(g,11.4,.12,.55,PAL.teak,-7,2.9,-4.2);
 for(let i=0;i<14;i++){const c=['#e8452c','#2aa7a1','#ffd23d','#6be08c','#ff7ab8','#8ad8ff'][i%6];B(g,.22,.62,.22,c,-12.4+i*.8,2.25,-4.2);B(g,.22,.62,.22,c,-12.4+i*.8+.3,3.25,-4.2)}
 B(g,2.2,2.4,1.4,'#e9eef2',-1.9,1.3,-3.6);B(g,2,.1,.1,'#999',-1.9,2.1,-2.88);
 for(let i=0;i<6;i++){const x=-12+i*2,c=[PAL.coral,PAL.teal][i%2];cyl(g,.1,.1,1.5,'#333',x,.75,2.9,5);cyl(g,.44,.44,.22,c,x,1.6,2.9,10)}
 for(let i=0;i<4;i++)B(g,.28,.28,.28,'*#ffd27a',-11+i*3.6,3.9,2.3).scale.set(1,1.4,1);
 /* the sign, on its own two posts so it reads from far away */
 bam(g,-12.4,-4.7,9.2,.2);bam(g,-1.6,-4.7,9.2,.2);B(g,12.4,3.2,.35,'#12333a',-7,8.9,-4.5);label(g,'SUNSET BEACH CLUB',11.6,2.6,-7,8.9,-4.3,'#e8452c','#fff3d9');B(g,12.6,.25,.6,PAL.thatch2,-7,10.6,-4.5);
 /* stage */
 B(g,13,1.1,8,PAL.teak,11.5,.8,.3);B(g,13,.12,8,'#d9b070',11.5,1.4,.3);for(let i=0;i<8;i++)B(g,.05,.02,8,PAL.dark,6.6+i*1.5,1.47,.3);
 B(g,5,.28,.9,PAL.plank,11.5,.14,4.9);B(g,5,.28,.9,PAL.plank,11.5,.42,4.55);
 [[5.5,-3.3],[17.5,-3.3],[5.5,3.5],[17.5,3.5]].forEach(([x,z])=>bam(g,x,z,6.2,.2));
 B(g,13.2,.25,.25,PAL.dark,11.5,6.2,3.5);B(g,13.2,.25,.25,PAL.dark,11.5,6.2,-3.3);
 thatch(g,11.5,6.3,.1,16,10.2);
 B(g,12.6,3,.3,'#e0c06c',11.5,3.1,-3.3);for(let i=0;i<12;i++)B(g,.08,3,.34,'#b58f3e',5.6+i*1.08,3.1,-3.3);B(g,12.6,.18,.34,'*#ff6f61',11.5,4.7,-3.1);
 label(g,'LIVE AT SUNSET',7.4,1.1,11.5,3.2,-3.1,'#12333a','#ffd27a');
 B(g,12.8,.16,.16,'#222',11.5,5.5,3.3);[0,1,2,3,4,5,6].forEach(i=>{B(g,.34,.34,.34,'*'+['#ffd27a','#ff6f61','#2aa7a1','#ffd27a','#ff7ab8','#8ad8ff','#ffd27a'][i],6.1+i*1.8,5.3,3.3)});
 [[6.2,3.6],[16.8,3.6]].forEach(([x,z])=>{B(g,1.5,2.6,1.2,PAL.ink,x,2.7,z);cyl(g,.45,.45,.1,'#2a2a30',x,3.4,z+.62,10).rotation.x=Math.PI/2;cyl(g,.3,.3,.1,'#2a2a30',x,2.1,z+.62,10).rotation.x=Math.PI/2});
 cyl(g,.7,.7,.9,'#c0392b',12.6,2.0,-1.4,12);cyl(g,.32,.32,.28,'#2c5f7a',11.6,2.1,-1.5,10);cyl(g,.32,.32,.28,'#2c5f7a',13.6,2.1,-1.5,10);cyl(g,.55,.55,.04,'#d8b84a',10.7,3.0,-1.7,12);cyl(g,.6,.6,.04,'#d8b84a',14.6,3.0,-1.9,12);B(g,.8,.5,.8,'#222',12.6,1.9,-.7);
 B(g,.06,1.5,.06,'#222',9.5,2.2,2.2);B(g,.2,.28,.2,'#555',9.5,3.0,2.2);B(g,1.1,1,.6,PAL.ink,8.4,1.9,-1.2);
 /* beach: striped umbrellas and loungers on the sand, volleyball, fire pit, surfboards */
 const um=[[-12,9.5,PAL.coral],[-4,10.5,PAL.teal],[2,9.2,'#ffd23d'],[-17,10.2,PAL.teal]];
 um.forEach(([x,z,c])=>{cyl(g,.07,.07,3.2,'#ddd',x,1.6,z,5);stripedCone(g,2.5,1,x,3.4,z,c,PAL.cream)});
 um.forEach(([x,z,c],i)=>{[-.8,.8].forEach(o=>{B(g,.9,.14,2,PAL.cream,x+o*1.1,.35,z+1.2);const b=B(g,.9,.14,.9,PAL.cream,x+o*1.1,.62,z+2.3);b.rotation.x=-.5;B(g,.92,.06,1.1,i%2?PAL.teal:PAL.coral,x+o*1.1,.45,z+1.1)})});
 [-24,-17].forEach(x=>bam(g,x,8,3.4,.1));B(g,7,1.1,.04,'#ffffff',-20.5,2.9,8).material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.45,wireframe:true});
 for(let i=0;i<8;i++){const a=i/8*6.283;B(g,.45,.35,.45,'#8d9096',20+Math.cos(a)*.9,.18,10+Math.sin(a)*.9)}B(g,.9,.3,.14,'#5a3a22',20,.4,10).rotation.y=.6;B(g,.9,.3,.14,'#5a3a22',20,.4,10).rotation.y=-.6;const fl=B(g,.5,.6,.5,'*#ff9a2e',20,.65,10);g.userData.fire=fl;
 [[-2.4,0],[2.4,0],[0,-2.4],[0,2.4]].forEach(([dx,dz],i)=>cyl(g,.28,.28,1.8,'#7a5230',20+dx*1.05,.35,10+dz*1.05,7).rotation.z=Math.PI/2*(i<2?0:1)+0);
 B(g,6.4,.14,.14,PAL.dark,24.5,2.1,0);bam(g,21.6,0,2.6,.12);bam(g,27.4,0,2.6,.12);['#ff6f61','#2aa7a1','#ffd23d','#8ad8ff','#e8e1d0'].forEach((c,i)=>{const b=B(g,.6,3.4,.12,c,22.4+i*1.2,1.9,.1);b.rotation.z=(i-2)*.03;B(g,.12,3.3,.14,'#fff',22.4+i*1.2,1.9,.12)});
 /* palms, torches, string lights */
 [[-17,-1,1.15,.2],[-16,6,1,.22],[18.5,-5.5,1.2,-.16],[-7,-8,1.1,.18],[19,6,1.05,.2],[26,3,1.1,-.2]].forEach(([x,z,s,l])=>palmC(g,x,z,s,l));
 for(let x=-14;x<=17;x+=5.5){cyl(g,.06,.06,2.4,PAL.dark,x,1.2,5.4,5);B(g,.2,.34,.2,'*#ff9a2e',x,2.55,5.4)}
 const pole=[[-15.5,4.2],[-.2,5.4],[19.6,4.2]];pole.forEach(([x,h])=>cyl(g,.08,.08,h,'#333',x,h/2,6.2,5));
 for(let s=0;s<2;s++){const a=pole[s],b=pole[s+1];for(let i=0;i<=14;i++){const t=i/14,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*.8;B(g,.16,.16,.16,'*'+['#ffd27a','#ff9ac0','#8ad8ff'][i%3],x,y,6.2)}}
 /* solid: the bar counter and the stage; the deck, steps and sand stay open */
 clubExtras(g);
 const W=(x,z)=>[CLUB_X+x*KC,CLUB_Z+z*KC];let a=W(-13,-4.8),b=W(-.8,1.6);solid(a[0],a[1],b[0],b[1]);a=W(5,-3.8);b=W(18,4.2);solid(a[0],a[1],b[0],b[1]);a=W(-23,-5);b=W(-19,-3.2);solid(a[0],a[1],b[0],b[1]);a=W(21,-9.4);b=W(28,-7.6);solid(a[0],a[1],b[0],b[1]);
 const mk=new THREE.Group();B(mk,.9,.9,.9,'*#ff7ab8',0,0,0);mk.rotation.set(Math.PI/4,0,Math.PI/4);mk.position.set(11.5,11,.3);g.add(mk);g.userData.mk=mk;g.userData.mky=11;g.userData.roofs=ROOFG;
 /* people: a few at the bar, a crowd on the sand, a few round the fire (full size, so outside the scaled group) */
 const pp=new THREE.Group();root.add(pp);const tops=['#e8452c','#2aa7a1','#ffd23d','#8d5fd3','#fff3d9','#ff7ab8','#3a7bd5'],bots=['#2b3a55','#6b4a28','#e8e1d0','#1a1a1a'];let n=0;
 const add=(lx,lz,ry,seat)=>{const q=W(lx,lz);person(pp,q[0],q[1],tops[n%7],bots[n%4],ry,seat);n++};
 [-11,-8.5,-5,-2.5].forEach(x=>add(x,3.6,Math.PI,0));[7,9,11,13,15,8,12,14].forEach((x,i)=>add(x,7.6+(i%3)*1.3,Math.PI,0));
 add(22,-2,0,0);add(27,-2,Math.PI,0);add(-23,6.4,0,0);add(-19,6,Math.PI/2,0);add(20-1.7,10,Math.PI/2,1);add(20+1.7,10,-Math.PI/2,1);add(-9,11,Math.PI,0);add(-3.6,12.2,0,0);
 return g}

function buildLight(){const g=new THREE.Group();g.position.set(LH_X,0,LH_Z);g.scale.setScalar(KL);root.add(g);
 cyl(g,4.6,5.2,1.4,'#7c8087',0,.7,0,16);/* foundation */
 const bands=[['#f4f1ea',3.3,2.8],['#d6402f',2.9,2.55],['#f4f1ea',2.55,2.3],['#d6402f',2.3,2.05],['#f4f1ea',2.05,1.85]];let y=1.2;
 bands.forEach(([c,rb,rt],i)=>{const h=4.2;cyl(g,rt,rb,h,c,0,y+h/2,0,16);y+=h});
 cyl(g,2.5,2.5,.35,'#2a2a2e',0,y+.17,0,16);/* gallery floor */
 cyl(g,2.4,2.4,.12,'#2a2a2e',0,y+1.1,0,16);
 for(let i=0;i<16;i++){const a=i/16*6.283;B(g,.1,.9,.1,'#2a2a2e',Math.cos(a)*2.4,y+.7,Math.sin(a)*2.4)}
 const lant=cyl(g,1.1,1.1,1.8,'#ffe9a8',0,y+1.4,0,12,true);lant.material.transparent=true;lant.material.opacity=.85;g.userData.lant=lant;
 const roof=new THREE.Mesh(new THREE.ConeGeometry(1.7,1.4,12),M('#d6402f'));roof.position.set(0,y+3,0);g.add(roof);cyl(g,.12,.12,.9,'#2a2a2e',0,y+4.1,0,6);
 B(g,1,1.8,.3,'#3a2a22',0,2.1,3.05);/* door */
 /* the beam: two flat wedges that turn, only visible after dark */
 const beam=new THREE.Group();beam.position.y=y+1.4;g.add(beam);
 const bm=new THREE.MeshBasicMaterial({color:0xffd870,transparent:true,opacity:.26,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 [1,-1].forEach(a=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(60,5),bm);w.position.set(a*30,0,0);w.rotation.x=-Math.PI/2;beam.add(w)});
 g.userData.beam=beam;g.userData.beamMat=bm;g.userData.top=y+1.4;
 solid(LH_X-3.6*KL,LH_Z-3.6*KL,LH_X+3.6*KL,LH_Z+3.6*KL);
 /* the islet: grey rock with a pale shallow ring and a thin line of foam, rocks round the edge */
 const sh=new THREE.Mesh(new THREE.CircleGeometry(ISLET+15,40),new THREE.MeshBasicMaterial({color:0x8ee6e0,transparent:true,opacity:.55,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.set(LH_X,-.41,LH_Z);root.add(sh);
 cyl(root,ISLET,ISLET+3,2.4,'#7c8087',LH_X,-.1,LH_Z,28);cyl(root,ISLET-2.5,ISLET-1,.5,'#6a9a52',LH_X,1.1,LH_Z,28);cyl(root,ISLET-6,ISLET-5,.3,'#e3d3a0',LH_X,.98,LH_Z,28).visible=false;
 const fo=new THREE.Mesh(new THREE.RingGeometry(ISLET+2.6,ISLET+4.4,40),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));fo.rotation.x=-Math.PI/2;fo.position.set(LH_X,-.36,LH_Z);root.add(fo);g.userData.foam=fo;
 for(let i=0;i<14;i++){const a=i/14*6.283+Math.sin(i*3.1)*.2,r=ISLET+1+(i%3)*1.4,w=1.6+(i%4)*.7;B(root,w,1+(i%3)*.5,w*.9,['#8d9096','#7c8087','#6f7378','#9a9a94'][i%4],LH_X+Math.cos(a)*r,.2,LH_Z+Math.sin(a)*r).rotation.y=i}
 /* the pier: planks, posts both sides, a rail and warm lamps */
 const pz0=LH_Z+ISLET-2,pz1=PIER_Z0,len=pz1-pz0,pm=(pz0+pz1)/2;
 B(root,5.2,.34,len,'#9a6a3c',LH_X,.22,pm);for(let z=pz0+1;z<pz1;z+=1.3)B(root,5.3,.03,.08,'#5a3a22',LH_X,.4,z);
 for(let z=pz0+2;z<pz1;z+=6){[-1,1].forEach(a=>{cyl(root,.16,.16,2.2,'#5a3a22',LH_X+a*2.7,.7,z,6);cyl(root,.2,.2,2.4,'#5a3a22',LH_X+a*2.7,-.9,z,6)});if(((z-pz0)/6|0)%2==0)[-1,1].forEach(a=>B(root,.34,.4,.34,'*#ffd27a',LH_X+a*2.7,1.95,z))}
 [-1,1].forEach(a=>{B(root,.1,.1,len,'#5a3a22',LH_X+a*2.7,1.45,pm)});
 PIER={x0:LH_X-2.5,x1:LH_X+2.5,z0:LH_Z+ISLET-8,z1:pz1+4};
 return g}
let PIER=null;
/* the pier and the islet are walkable out in the sea: the island's shore check is skipped there and only solid things (the tower) stop you */
{const h0=hit;hit=function(x,z,r){try{if(PIER&&!IN&&mode!='drive'&&((x>PIER.x0&&x<PIER.x1&&z>PIER.z0&&z<PIER.z1)||Math.hypot(x-LH_X,z-LH_Z)<ISLET-1.5)){r=r||.4;return cols.some(c=>x+r>c[0]&&x-r<c[2]&&z+r>c[1]&&z-r<c[3])?1:0}}catch(e){}return h0.apply(this,arguments)}}
let club=null,light=null,built=false;
function build(){if(built)return;built=true;try{club=buildClub()}catch(e){console.error('beach club',e)}try{light=buildLight()}catch(e){console.error('lighthouse',e)}
 /* prompts */
 INT.push({x:CLUB_X+11.5*KC,z:CLUB_Z+8*KC,r:6,l:'Sunset Beach Club stage',a:()=>stageUse(),bc:'stage'});
 INT.push({x:CLUB_X-7*KC,z:CLUB_Z+3.4*KC,r:4,l:'Beach bar: smoothie $8',a:()=>bar(),bc:'bar'});
 INT.push({x:LH_X,z:LH_Z+5.2*KL,r:4.5,l:'Climb the Lighthouse',a:()=>climb(),lh:1})}

/* ---------- state ---------- */
function st(){if(!S.bcg||typeof S.bcg!='object')S.bcg={last:-999,list:[]};if(!Array.isArray(S.bcg.list))S.bcg.list=[];return S.bcg}
const find=id=>st().list.find(o=>o.id===id);
const booked=()=>st().list.find(o=>o.st==1);
const best=()=>(S.songs||[]).slice().sort((a,b)=>(b.q||0)-(a.q||0));
const scale=()=>.35+FL()*.08+Math.sqrt(S.listeners||0)*.0004;
function baseFee(){return Math.max(100,Math.round((120+FL()*30+Math.sqrt(S.listeners||0)*.35)*(.85+Math.random()*.3)/10)*10)}
const note=(from,body)=>{S.msgs.push({id:S.nid++,from:from||'Sunset Beach Club',state:9,unread:1,day:S.day,body})};

/* ---------- the email ---------- */
function offer(){const s=st(),o={id:S.nid++,pay:baseFee(),exp:S.day+2,day:S.day+ri(1,3),st:0};s.list.push(o);s.last=S.day;if(s.list.length>12)s.list=s.list.slice(-12);
 S.msgs.push({id:S.nid++,from:'Sunset Beach Club Bookings',state:9,unread:1,day:S.day,bcg:o.id,
  body:'Hi '+(S.artist||'there')+'! Mara here, I book the stage at the Sunset Beach Club on the south-east beach. We would love you to play our golden hour set on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+'. Pick up to three songs. Fee: '+fm(o.pay)+' (a good crowd means a bit more, a quiet one a bit less), paid when you come off stage. Just be at the stage in that window. This offer stands until Day '+o.exp+'.'});
 try{snd('ping');say('Sunset Beach Club emailed you a gig offer. Check Messages.')}catch(e){}try{updateVersion()}catch(e){}}
window.bcgAccept=function(mid){const m=S.msgs.find(x=>x.id==mid),o=m&&find(m.bcg);if(!o||o.st!=0)return;if(S.day>o.exp){o.st=4;return pcR()}
 if(booked()){sn('err');return say('You already have a Beach Club gig booked.')}
 o.st=1;note(m.from,'Booked! See you on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+', at the stage on the beach. Sound check is on us.');
 sn('chime');say('Beach Club gig booked for Day '+o.day+'.');try{updateVersion()}catch(e){}pcR()};
window.bcgDecline=function(mid){const m=S.msgs.find(x=>x.id==mid),o=m&&find(m.bcg);if(!o||o.st!=0)return;o.st=2;sn('pop');pcR()};
{const pm=PA.msg;PA.msg=function(){let h=pm.apply(this,arguments);const m=S.msgs.find(x=>x.id==S.chat);
 if(m&&m.bcg!=null){const o=find(m.bcg);
  if(o&&o.st==0&&S.day<=o.exp)h=h.replace(/<div class=cin><small[^>]*>Official account\. No replies\.<\/small><\/div>/,`<div class=cin style="gap:8px;padding:8px"><button class=go onclick="bcgAccept(${m.id})">Accept ${fm(o.pay)} gig</button><button onclick="bcgDecline(${m.id})">Decline</button></div>`);
  else if(o)h=h.replace(/Official account\. No replies\./,o.st==2?'You declined this offer.':o.st==1||o.st==3||o.st==5?'You accepted this offer.':'This offer has expired.')}
 return h}}
/* every morning: lapse old offers, remind on gig day, miss a gig that was not played, maybe a new offer */
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{const s=st();
 s.list.forEach(o=>{if(o.st==0&&S.day>o.exp)o.st=4;
  if(o.st==1&&S.day>o.day){o.st=5;note('Sunset Beach Club Bookings','We missed you on Day '+o.day+'. No hard feelings, but we gave the slot away. Maybe next time.')}
  if(o.st==1&&S.day==o.day){note('Sunset Beach Club Bookings','Today is the day! Be at the stage on the beach between '+hm(SLOT[0])+' and '+hm(SLOT[1])+'.');try{say('Beach Club gig tonight, 18:00 to 21:00.')}catch(e){}}});
 if(S.artist&&(S.songs||[]).length&&!s.list.some(o=>o.st==0||o.st==1)&&S.day-s.last>=2&&Math.random()<.5)offer()}catch(e){console.error('beach club offers',e)}return r}}

/* ---------- the stage ---------- */
function stageUse(){if(mode!='play'||away())return;const o=booked();
 if(!o){sn('err');return say('Nobody is booked on this stage. Watch Messages for a Beach Club gig offer.')}
 if(S.day<o.day){sn('err');return say('Your Beach Club gig is on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+'.')}
 const m=mins();if(m<SLOT[0]){sn('err');return say('Doors open at '+hm(SLOT[0])+'. Come back for your slot.')}
 if(m>=SLOT[1]){sn('err');return say('Your slot is over.')}
 if((S.energy||0)<15){sn('err');return say('You are too tired to play. Rest or eat first.')}
 mode='menu';PICK=[];setUI(o)}
let PICK=[];
function setUI(o){const L=best().slice(0,8);
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(520px,94vw)"><div class=pehd><span class=pek>Sunset Beach Club · ${hm(SLOT[0])}-${hm(SLOT[1])}</span><h2>Golden hour set</h2></div><div class=pebd>
 <p class=pebl>Pick up to three songs. Higher quality songs make the crowd go wild. Fee ${fm(o.pay)}, more or less depending on the crowd.</p>
 <div class=pelist>${L.map(s=>`<button class=pesong style="${PICK.includes(s.id)?'outline:2px solid #ff7ab8':''}" onclick="bcPick(${s.id})"><b>${PICK.includes(s.id)?'✓ ':''}${E(s.title)}</b><small>${E(s.g)} · quality ${Math.round(s.q||0)} · ${fmt(s.streams||0)} streams</small></button>`).join('')}</div>
 <div class=row2><button class=go ${PICK.length?'':'disabled'} onclick="bcPlay()">Play ${PICK.length||''} song${PICK.length==1?'':'s'}</button><button onclick="closeUI()">Not now</button></div></div></div>`}
window.bcPick=function(id){const o=booked();if(!o||mode!='menu')return;const i=PICK.indexOf(id);if(i>=0)PICK.splice(i,1);else if(PICK.length<3)PICK.push(id);else{sn('err');return}sn('pop');setUI(o)};
window.bcPlay=function(){const o=booked();if(!o||!PICK.length)return;const L=PICK.map(id=>(S.songs||[]).find(x=>x.id==id)).filter(Boolean);if(!L.length)return;
 const q=L.reduce((a,s)=>a+(s.q||0),0)/L.length,r=Math.min(1,Math.max(.1,q/100+rnd(-.12,.12)+(L.length-1)*.03)),crowd=Math.round((60+r*240)*scale());
 const pay=Math.round(o.pay*(.7+.6*r)),fol=Math.max(0,Math.round(crowd*r*.5));
 S.money=+((S.money||0)+pay).toFixed(2);S.earn=(S.earn||0)+pay;S.followers=(S.followers||0)+FOLN(fol);
 L.forEach(s=>{const st2=Math.round(crowd*(1+r*3)/L.length);try{addSt(s,st2)}catch(e){s.streams=(s.streams||0)+st2;S.streams=(S.streams||0)+st2}if(S.hype&&S.hype[s.g]!=null)S.hype[s.g]=+Math.min(2,(S.hype[s.g]||1)+.1).toFixed(2)});
 S.energy=Math.max(0,(S.energy||0)-20);try{S.t=Math.min(599,(S.t||0)+43)}catch(e){}
 o.st=3;PICK=[];sv();sn('cash');try{updateVersion()}catch(e){}
 const line=r>.8?'The whole beach sang along as the sun went down.':r>.6?'Hands up all the way back to the bar.':r>.4?'A warm crowd, lots of phones out.':'A slow start, but people drifted over and stayed.';
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(520px,94vw)"><div class=pehd><span class=pek>Sunset Beach Club</span><h2>What a sunset</h2></div><div class=pebd><div class=peres><h3>${line}</h3><p>About <b>${fmt(crowd)}</b> people came. You played ${L.map(s=>'<b>'+E(s.title)+'</b>').join(', ')}.</p><p>Fee <b>${fm(pay)}</b> · <b>+${fmt(fol)} followers</b> · more streams on the songs you played.</p></div><div class=row2><button class=go onclick="closeUI()">Nice</button></div></div></div>`;
 note('Sunset Beach Club Bookings','Thank you for tonight, '+(S.artist||'')+'! '+fmt(crowd)+' people on the sand and a '+fm(pay)+' fee on its way to you. Come back anytime.')};

/* ---------- the bar ---------- */
function bar(){if(mode!='play'||away())return;if(S.bcBar===S.day){sn('err');return say('Mara says: one smoothie a day, you will float away!')}
 if((S.money||0)<8){sn('err');return say('A smoothie is $8.')}if((S.energy||0)>=100){sn('err');return say('You are already full of energy.')}
 S.money=+(S.money-8).toFixed(2);S.energy=Math.min(100,(S.energy||0)+12);S.bcBar=S.day;sv();sn('eat');say('Mango smoothie. +12 energy.')}

/* ---------- the lighthouse ---------- */
function climb(){if(mode!='play'||away())return;
 if(S.lhDay===S.day){sn('err');return say('You already took in the view today. Come back tomorrow.')}
 mode='menu';const night=(S.t||0)>=300;
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(520px,94vw)"><div class=pehd><span class=pek>Island Lighthouse</span><h2>The lookout</h2></div><div class=pebd>
 <div style="height:130px;border:2px solid #000;margin-bottom:10px;background:linear-gradient(${night?'#0b1230 0%,#1d2f6b 55%,#0e3a66 55%,#0a2347 100%':'#7cc4ee 0%,#cfeaf8 52%,#2b87c8 52%,#1d5f9c 100%'})"></div>
 <p class=pebl>${night?'The beam sweeps over black water and the city lights glow behind you.':'Gulls wheel below. You can see the whole island from up here: the park, the runway, the beach club.'}</p>
 <div class=row2><button class=go onclick="lhBreathe()">Breathe in the sea air (+20 energy)</button><button onclick="closeUI()">Back down</button></div></div></div>`}
window.lhBreathe=function(){if(S.lhDay===S.day)return closeUI();S.lhDay=S.day;S.energy=Math.min(100,(S.energy||0)+20);sv();sn('chime');closeUI();say('Fresh sea air. +20 energy.')};

/* ---------- every frame ---------- */
let spin=0;
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='title')return r;if(!built)build();const off=away();root.visible=!off;if(off)return r;spin+=dt||0;
 const night=(S.t||0)>=290,o=booked(),m=mins();
 const open=o&&S.day==o.day&&m>=SLOT[0]&&m<SLOT[1];
 INT.forEach(i=>{if(i.bc=='stage')i.l=open?'Play your Beach Club set':o?(S.day<o.day?'Beach Club gig on Day '+o.day:m<SLOT[0]?'Beach Club gig at '+hm(SLOT[0]):'Beach Club gig (over)'):'Sunset Beach Club stage';
  if(i.bc=='bar')i.l=S.bcBar===S.day?'Beach bar (smoothie taken today)':'Beach bar: smoothie $8';
  if(i.lh)i.l=S.lhDay===S.day?'Lighthouse (visited today)':'Climb the Lighthouse'});
 if(club){const inside=Math.abs(P.x-(CLUB_X+3*KC))<34*KC&&P.z>CLUB_Z-13*KC&&P.z<CLUB_Z+7*KC;RM.forEach(m=>{m.opacity+=((inside?.1:1)-m.opacity)*.18;m.depthWrite=m.opacity>.6});}
 if(club&&club.userData.mk){const k=club.userData.mk;k.visible=!!open;k.rotation.y=spin*1.6;k.position.y=club.userData.mky+Math.sin(spin*2.2)*.3}
 if(club&&club.userData.fire){const f=club.userData.fire;f.visible=true;f.scale.set(1,.8+Math.sin(spin*9)*.25+Math.sin(spin*13)*.15,1)}
 if(light){const u=light.userData;u.beam.rotation.y=spin*.9;u.beam.visible=night;u.lant.material.color.set(night?0xfff2b0:0xcfd8c0)}
 }catch(e){if(!window.__ipErr){window.__ipErr=1;console.error('island places',e)}}return r}}
})();
