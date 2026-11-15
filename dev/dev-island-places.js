/* ===== dev only: two places on the island, the Sunset Beach Club and the Lighthouse (v54.2.0) =====
   Loaded after dev-island-v1.js (it needs the coast, window.FW_ISLAND). Add ?noisland to skip both.
   - Sunset Beach Club: a fenced tiki bar, deck, sunbeds, a 16 m stage, fire pit and volleyball court on the south-east beach, all at real size (1 unit = 1 m) and all blocky. Gigs use a camera behind you on stage. Now and then (about every 2-4 days,
     once you have a released song) the club EMAILS you (Messages) a sunset gig: day, 18:00-21:00, a fee. Accept or Decline in the
     message. On the day, walk to the stage during the slot and press the prompt: pick up to 3 of your songs and play. The crowd
     reacts to the song quality: fee (70% to 130% of the offer), followers, streams for the songs you played. It costs 20 energy and
     about 2 hours of game time. Miss the slot and the offer lapses (nothing lost). The bar also sells a cheap smoothie.
   - Lighthouse: a striped tower on the north-east headland with a light that turns at night. Press E to climb it: a plain dialog, then first person on the gallery (WASD, mouse or arrow keys, labels for places on the map). The first climb each day gives
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
const CLUB_Z=edge(CLUB_X,120,3)-16;/* the club is built in real metres (1 unit = 1 m, people are 1.8 m). Local z 0 is the middle; the back fence is at z -22, the grass edge about z +16 and the sea is further south */
let LH_X=690,tip=1e9;for(let x=560;x<=780;x+=10){const z=edge(x,-60,-3);if(z<tip){tip=z;LH_X=x}}
const LH_Z=tip-100,ISLET=13,PIER_Z0=tip-8;/* the lighthouse stands on a rock islet 100 m out to sea, joined to the north shore by a pier */
const NAV=[[CLUB_X,CLUB_Z,'Beach Club','#ff7ab8'],[LH_X,LH_Z,'Lighthouse','#ffe27a']];
NAV.forEach(p=>{try{if(!POIS.some(q=>q[2]==p[2]))POIS.push(p)}catch(e){}});

/* ---------- 3D ---------- */
const root=new THREE.Group();root.name='islandPlaces';WORLD.add(root);
function label(g,text,w,h,x,y,z,bg,fg,ry){const cv=document.createElement('canvas');cv.width=w*128;cv.height=h*128;const c=cv.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,cv.width,cv.height);
 c.strokeStyle=fg;c.lineWidth=6;c.strokeRect(6,6,cv.width-12,cv.height-12);c.fillStyle=fg;c.font='bold '+Math.round(cv.height*.46)+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(text,cv.width/2,cv.height/2+3);
 const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m}
const solids=[];
function solid(x0,z0,x1,z1){const q=[x0,z0,x1,z1];solids.push(q);cols.push(q)}
const PAL={sand:'#f1dfb0',teak:'#9a6a3c',plank:'#c99a5c',dark:'#5a3a22',bamboo:'#d1b062',thatch:'#bf9548',thatch2:'#a47c3a',teal:'#2aa7a1',coral:'#ff6f61',cream:'#fff3d9',ink:'#17171c'};
/* a thatched roof: stepped layers, a ragged fringe round the eaves and a ridge */
const RM=[PAL.thatch,PAL.thatch2].map(c=>new THREE.MeshLambertMaterial({color:c,transparent:true}));
let ROOFG=null;
function RB(g,w,h,d,c,x,y,z){const m=new THREE.Mesh(geo(w,h,d),RM[c==PAL.thatch2?1:0]);m.position.set(x,y,z);g.add(m);return m}
function thatch(g0,cx,cy,cz,w,d){const g=new THREE.Group();g0.add(g);ROOFG.push(g);const B=RB;for(let i=0;i<5;i++){const s=1-i*.19;B(g,w*s,.42,d*s,i%2?PAL.thatch2:PAL.thatch,cx,cy+i*.36,cz)}
 B(g,w*.2,.5,d*.9,PAL.thatch2,cx,cy+5*.36+.1,cz);
 for(let i=0;i<Math.round(w/.7);i++){const x=cx-w/2+.35+i*.7,l=.5+((i*7)%3)*.18;B(g,.5,l,.14,i%2?PAL.thatch:PAL.thatch2,x,cy-l/2+.1,cz+d/2);B(g,.5,l,.14,i%2?PAL.thatch2:PAL.thatch,x,cy-l/2+.1,cz-d/2)}
 for(let i=0;i<Math.round(d/.7);i++){const z=cz-d/2+.35+i*.7,l=.5+((i*5)%3)*.18;B(g,.14,l,.5,i%2?PAL.thatch:PAL.thatch2,cx-w/2,cy-l/2+.1,z);B(g,.14,l,.5,i%2?PAL.thatch2:PAL.thatch,cx+w/2,cy-l/2+.1,z)}}
/* everything here is made of boxes, like the rest of the game (no cylinders or cones) */
const bam=(g,x,z,h,w,y0)=>{w=w||.22;y0=y0||0;B(g,w,h,w,PAL.bamboo,x,y0+h/2,z);[.3,.62].forEach(f=>B(g,w+.05,.06,w+.05,'#a8863a',x,y0+h*f,z))};
/* lamps and flames: they glow at night and during a show, dim in the day */
const GL=[];let glowOn=null;
const GMC={},WM=new THREE.MeshLambertMaterial({color:'#2a2a2e'});
function glow(g,w,h,d,c,x,y,z,grp){const k=c+'|'+(grp||1),m=new THREE.Mesh(geo(w,h,d),GMC[k]||(GMC[k]=new THREE.MeshBasicMaterial({color:c})));m.position.set(x,y,z);g.add(m);GL.push({m,c:new THREE.Color(c),d:new THREE.Color(c).multiplyScalar(.3),g:grp||1});return m}
/* a string of lights: a thin wire that sags between two points with a bulb every so often (all the lights here hang on wires like this) */
function strand(g,x0,y0,z0,x1,y1,z1,n,sag,grp,C){const Q=[];for(let i=0;i<=n;i++){const t=i/n;Q.push([x0+(x1-x0)*t,y0+(y1-y0)*t-Math.sin(t*Math.PI)*(sag||0),z0+(z1-z0)*t])}
 for(let i=0;i<n;i++){const a=Q[i],b=Q[i+1],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),m=new THREE.Mesh(geo(.03,.03,L),WM);m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);m.rotation.order='YXZ';m.rotation.set(-Math.asin(dy/L),Math.atan2(dx,dz),0);g.add(m)}
 C=C||['#ffd27a','#ff9ac0','#8ad8ff','#8affb0'];for(let i=1;i<n;i++)glow(g,.15,.2,.15,C[i%C.length],Q[i][0],Q[i][1]-.12,Q[i][2],grp||1)}
/* solid box in club-local metres */
const sl=(x,z,hx,hz)=>solid(CLUB_X+x-hx,CLUB_Z+z-hz,CLUB_X+x+hx,CLUB_Z+z+hz);
function setGlow(on1,on2){const k=(on1?1:0)+(on2?2:0);if(glowOn===k)return;glowOn=k;GL.forEach(q=>q.m.material.color.copy(((q.g==1&&on1)||(q.g==2&&on2)||(q.g==3&&(on1||on2)))?q.c:q.d))}
/* a palm: a blocky trunk that leans, a crown block, and fronds that hinge from the crown so they are joined to it */
function palmB(g,x,z,s,lean,rot){s=s||1;lean=lean||.14;rot=rot||0;let px=x,py=0;
 for(let i=0;i<6;i++){const w=.44*s-i*.035*s,h=1*s;B(g,w,h*1.03,w,i%2?'#8a6a40':'#7d5f38',px,py+h/2,z);px+=lean*s*Math.cos(rot);py+=h}
 B(g,.55*s,.4*s,.55*s,'#5f4a2a',px,py+.05*s,z);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+rot,f=new THREE.Group();f.position.set(px,py+.2*s,z);f.rotation.y=a;g.add(f);
  const c1=i%2?'#2f8f4a':'#3da35a',c2=i%2?'#3da35a':'#2f8f4a';
  const s1=new THREE.Group();s1.rotation.z=-.22;f.add(s1);B(s1,1.5*s,.09*s,.55*s,c1,.75*s,0,0);
  const s2=new THREE.Group();s2.position.set(1.5*s,0,0);s2.rotation.z=-.6;s1.add(s2);B(s2,1.3*s,.09*s,.45*s,c2,.65*s,0,0)}
 [[.3,0],[-.3,.2],[0,-.3]].forEach(([dx,dz])=>B(g,.3*s,.3*s,.3*s,'#6b4a28',px+dx*s,py-.25*s,z+dz*s))}
/* a beach umbrella: 2.5 m pole, a stepped square canopy 2.5 m across */
function umbrella(g,x,z,c,y0){y0=y0||0;B(g,.07,2.5,.07,'#e8e8e8',x,y0+1.25,z);[[2.5,2.05],[1.8,2.3],[1.1,2.5]].forEach(([w,y],i)=>B(g,w,.13,w,i%2?PAL.cream:c,x,y0+y,z));B(g,.15,.15,.15,'#e8e8e8',x,y0+2.66,z)}
/* a sunbed: 1.9 m long, 0.7 m wide, the back end propped up */
function sunbed(g,x,z,c,y0){y0=y0||0;const s=new THREE.Group();s.position.set(x,y0,z);g.add(s);
 [[-.3,-.8],[.3,-.8],[-.3,.8],[.3,.8]].forEach(([a,b])=>B(s,.06,.28,.06,'#d8d0c0',a,.14,b));
 B(s,.7,.08,1.1,PAL.cream,0,.3,.35);const b=B(s,.7,.08,.85,PAL.cream,0,.5,-.5);b.rotation.x=.55;B(s,.5,.03,1.5,c,0,.36,.2);return s}
function stool(g,x,z,top){B(g,.4,.07,.4,PAL.plank,x,top,z);B(g,.08,top-.25,.08,PAL.dark,x,.25+(top-.25)/2,z)}
function table(g,x,z){B(g,1.1,.06,1.1,PAL.plank,x,.95,z);B(g,.12,.7,.12,PAL.dark,x,.6,z);B(g,.55,.05,.55,PAL.dark,x,.28,z)}
function mic(g,x,y,z){B(g,.5,.04,.5,'#1a1a1a',x,y+.02,z);B(g,.05,1.4,.05,'#b8bcc2',x,y+.72,z);B(g,.05,.05,.4,'#b8bcc2',x,y+1.42,z-.18);B(g,.1,.16,.1,'#111',x,y+1.45,z-.4)}
function fence(g,x0,z0,x1,z1){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/2.5)),h=Math.abs(x1-x0)>Math.abs(z1-z0);
 for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;B(g,.2,1.7,.2,PAL.dark,x,.85,z);if(i<n)strand(g,x,1.72,z,x0+(x1-x0)*(i+1)/n,1.72,z0+(z1-z0)*(i+1)/n,3,.2,1)}
 const cx=(x0+x1)/2,cz=(z0+z1)/2;[.45,.95,1.4].forEach((y,i)=>B(g,h?L:.07,.2,h?.07:L,i==1?PAL.plank:PAL.teak,cx,y,cz));
 const q=h?[Math.min(x0,x1),z0-.3,Math.max(x0,x1),z0+.3]:[x0-.3,Math.min(z0,z1),x0+.3,Math.max(z0,z1)];solid(CLUB_X+q[0],CLUB_Z+q[1],CLUB_X+q[2],CLUB_Z+q[3])}
const SK=()=>{try{return SKIN.length}catch(e){return 6}},HK=()=>{try{return HAIRC.length}catch(e){return 12}};
let sd=11;const r1=()=>(sd=(sd*16807)%2147483647)/2147483647;
const TOPS=['#e8452c','#2aa7a1','#ffd23d','#8d5fd3','#fff3d9','#ff7ab8','#3a7bd5','#6be08c'],BOTS=['#2b3a55','#6b4a28','#e8e1d0','#1a1a1a','#2aa7a1','#c0392b'];
const PPL=[];let ppG=null;
function figure(g,x,z,ry,o){o=o||{};const i=PPL.length,c={skin:Math.floor(r1()*SK()),eyes:Math.floor(r1()*5),mouth:Math.floor(r1()*4),hair:Math.floor(r1()*12),hc:Math.floor(r1()*HK()),top:[0,4,3][i%3],tc:0,pc:0,tc_custom:o.top||TOPS[i%TOPS.length],pc_custom:o.pants||BOTS[(i*3)%BOTS.length],body:r1(),bt:i%3==0?3:2};
 const f=buildChar(c);f.g.position.set(x,(o.y||0),z);f.g.rotation.y=ry||0;g.add(f.g);
 if(o.seat){f.legs.forEach(l=>l.rotation.x=-1.5);f.arms.forEach(a=>a.rotation.x=-.5)}
 if(o.talk)f.arms[1].rotation.x=-.9;if(o.up)f.arms.forEach(a=>a.rotation.x=-2.7);
 PPL.push({o:f,k:o.k||'idle',y:o.y||0,ph:r1()*6.3,x,z});return f}
function buildPeople(g){if(ppG)return;ppG=new THREE.Group();g.add(ppG);const P0=(x,z,ry,o)=>figure(ppG,x,z,ry,o);
 P0(-18,-16.6,0,{y:.25,k:'bar',top:'#fff3d9',pants:'#2b3a55'});/* the bartender, behind the counter */
 [-21,-17,-15].forEach(x=>P0(x,-13.4,Math.PI,{y:.43,seat:1}));/* on the bar stools */
 [[-23.9,-9,1],[-22.1,-9,-1],[-11.9,-9,1],[-10.1,-9,-1]].forEach(([x,z,d])=>P0(x,z,d*Math.PI/2,{y:.2,seat:1}));/* at the tables */
 [[-17.95,3.05],[-10.05,3.05],[-5.95,9.05]].forEach(([x,z])=>P0(x,z,0,{y:-.07,seat:1}));/* on sunbeds */
 [[-26.4,8,1],[-22.6,8,-1]].forEach(([x,z,d])=>P0(x,z,d*Math.PI/2,{y:-.02,seat:1}));/* round the fire */
 P0(14,7.7,0,{k:'vb',talk:0});P0(18,13.3,Math.PI,{k:'vb'});/* volleyball */
 P0(24,16,0,{talk:1,top:'#e8452c',pants:'#e8452c'});/* lifeguard */
 /* the crowd that gathers in front of the stage while a gig is on */
 for(let i=0;i<22;i++){const t=r1(),x=4.5+t*20+(r1()-.5)*1.5,z=-9.5+r1()*14;P0(x,z,Math.PI+(r1()-.5)*.5,{y:z<-6.2?.25:.05,k:'crowd'})}}
function buildClub(){ROOFG=[];const g=new THREE.Group();g.position.set(CLUB_X,0,CLUB_Z);root.add(g);
 const W=(x,z)=>[CLUB_X+x,CLUB_Z+z];
 /* ground: a boardwalk deck across the back, sand in front of it */
 B(g,54,.25,16,PAL.teak,0,.125,-14);for(let x=-26;x<=26;x+=1.5)B(g,.04,.02,16,PAL.dark,x,.26,-14);B(g,54.4,.14,.2,PAL.dark,0,.3,-6);
 B(g,6,.17,.6,PAL.plank,0,.085,-5.7);B(g,6,.08,.6,PAL.plank,0,.04,-5.1);/* the steps down to the sand */
 B(g,54,.05,22,PAL.sand,0,.03,5);
 /* the way in: a boardwalk from the grass to the gate in the back fence */
 B(g,3.6,.12,13,PAL.teak,0,.06,-28.5);for(let z=-34;z<=-22;z+=1.3)B(g,3.6,.02,.05,PAL.dark,0,.13,z);
 [-34,-29,-24].forEach(z=>[-2.4,2.4].forEach(x=>{B(g,.12,3.2,.12,PAL.dark,x,1.6,z);sl(x,z,.1,.1)}));
 [-2.4,2.4].forEach(x=>{strand(g,x,3.1,-34,x,3.1,-29,6,.3,1);strand(g,x,3.1,-29,x,3.1,-24,6,.3,1)});[-34,-29,-24].forEach(z=>strand(g,-2.4,3.1,z,2.4,3.1,z,8,.4,1));
 /* fence round the back and the two sides, one gate in the middle */
 fence(g,-27,-22,-2.9,-22);fence(g,2.9,-22,27,-22);fence(g,-27,-22,-27,-2);fence(g,27,-22,27,-2);
 B(g,.4,4.3,.4,PAL.dark,-3,2.15,-22);B(g,.4,4.3,.4,PAL.dark,3,2.15,-22);sl(-3,-22,.25,.25);sl(3,-22,.25,.25);B(g,6.8,.35,.4,PAL.dark,0,4.2,-22);
 B(g,5.8,1.3,.16,'#12333a',0,3.35,-22);label(g,'SUNSET BEACH CLUB',5.6,1.1,0,3.35,-21.9,'#e8452c','#fff3d9');label(g,'SUNSET BEACH CLUB',5.6,1.1,0,3.35,-22.1,'#e8452c','#fff3d9',Math.PI);
 B(g,6.4,.2,.5,PAL.thatch2,0,4.45,-22);
 /* tiki bar: bamboo posts, thatched roof, counter, shelves, stools */
 [[-24,-21],[-12,-21],[-24,-14.4],[-12,-14.4]].forEach(([x,z])=>bam(g,x,z,3.2,.24,.25));
 B(g,12.4,.2,.2,PAL.dark,-18,3.55,-14.4);B(g,12.4,.2,.2,PAL.dark,-18,3.55,-21);
 thatch(g,-18,3.5,-17.7,14.4,8.2);
 strand(g,-24,3.05,-14.3,-12,3.05,-14.3,12,.3,1);strand(g,-24,3.05,-14.3,-24,3.05,-21,7,.25,1);strand(g,-12,3.05,-14.3,-12,3.05,-21,7,.25,1);
 B(g,10.5,1.05,.7,PAL.dark,-18,.78,-14.6);B(g,11,.1,1.1,PAL.plank,-18,1.35,-14.6);
 B(g,11,.1,.5,PAL.teak,-18,1.8,-20.7);B(g,11,.1,.5,PAL.teak,-18,2.5,-20.7);
 for(let i=0;i<12;i++){const c=['#e8452c','#2aa7a1','#ffd23d','#6be08c','#ff7ab8','#8ad8ff'][i%6];B(g,.2,.45,.2,c,-23+i*.9,2.07,-20.7);B(g,.2,.45,.2,c,-22.5+i*.9,2.77,-20.7)}
 B(g,1.1,1.9,.8,'#e9eef2',-22.7,1.2,-19.6);B(g,.9,.5,.6,'#2a7fd0',-13.2,.5,-19.8);
 label(g,'TIKI BAR',3.2,.7,-18,2.7,-14.2,'#12333a','#ffd27a');
 [-22,-20,-18,-16,-14].forEach(x=>stool(g,x,-13.4,.95));sl(-18,-13.4,4.3,.3);
 [-23,-17,-11].forEach((x,i)=>{table(g,x,-9);sl(x,-9,1.3,.6);if(i!=1)umbrella(g,x,-9,i?PAL.teal:PAL.coral,.25);stool(g,x-.95,-9,.7);stool(g,x+.95,-9,.7)});
 B(g,.6,.9,.6,'#3a5a4a',-5.6,.7,-7.2);B(g,.6,.9,.6,'#3a5a4a',5.6,.7,-7.2);sl(-5.6,-7.2,.3,.3);sl(5.6,-7.2,.3,.3);
 /* stage, about the size of The Pit at the festival: 16 m wide, 9 m deep, 1.3 m high, roof at 8.5 m */
 B(g,16,1.05,9,PAL.teak,14,.775,-16.5);B(g,16,.04,9,'#d9b070',14,1.32,-16.5);for(let x=6.8;x<22;x+=1.6)B(g,.04,.02,9,PAL.dark,x,1.35,-16.5);B(g,16.1,.2,.2,PAL.dark,14,1.2,-12);
 B(g,.6,.35,2.4,PAL.plank,4.8,.425,-14.5);B(g,.6,.7,2.4,PAL.plank,5.4,.6,-14.5);
 [[6.3,-12.4],[21.7,-12.4],[6.3,-20.6],[21.7,-20.6]].forEach(([x,z])=>bam(g,x,z,5.6,.32,1.3));
 B(g,15.8,.3,.3,PAL.dark,14,6.8,-12.4);B(g,15.8,.3,.3,PAL.dark,14,6.8,-20.6);
 thatch(g,14,6.9,-16.5,18,10.8);
 B(g,15.6,4.6,.2,'#e0c06c',14,3.6,-20.8);for(let i=0;i<12;i++)B(g,.1,4.6,.24,'#b58f3e',6.6+i*1.3,3.6,-20.8);
 label(g,'LIVE AT SUNSET',8,1.2,14,4.6,-20.65,'#12333a','#ffd27a');
 B(g,15.6,.2,.2,'#222',14,6.2,-13.2);B(g,15.6,.2,.2,'#222',14,6.2,-17.4);
 [-13.2,-17.4].forEach(z=>strand(g,6.2,6.1,z,21.8,6.1,z,12,.35,2,['#ffd27a','#ff6f61','#2aa7a1','#ff7ab8','#8ad8ff']));
 [7,21].forEach(x=>[1.75,2.65,3.55].forEach((y,i)=>{B(g,1.2,.9,1,PAL.ink,x,y,-13.3);B(g,.5,.5,.1,'#2a2a30',x,y,-12.78)}));
 B(g,3.2,.2,2.8,'#2a2a30',14,1.4,-19.2);B(g,.8,.8,.5,'#c0392b',14,1.9,-19.6);B(g,.45,.3,.45,'#e8e1d0',13.2,2.2,-19.1);B(g,.45,.3,.45,'#e8e1d0',14.8,2.2,-19.1);B(g,.45,.2,.45,'#ddd',13.2,1.95,-18.2);
 B(g,.05,.8,.05,'#999',12.5,2.1,-19.2);B(g,.7,.03,.7,'#d8b84a',12.5,2.5,-19.2);B(g,.05,.8,.05,'#999',15.6,2.2,-19.4);B(g,.75,.03,.75,'#d8b84a',15.6,2.6,-19.4);B(g,.4,.35,.4,'#555',14,1.75,-18);
 B(g,1,.8,.5,PAL.ink,10.5,1.7,-20.1);B(g,1,.8,.5,PAL.ink,17.5,1.7,-20.1);B(g,1.4,.1,.5,'#222',18.5,2.0,-17);
 [11,17].forEach(x=>{const w=B(g,.9,.45,.5,PAL.ink,x,1.55,-13.4);w.rotation.x=-.3});
 mic(g,14,1.3,-14.7);sl(14,-14.7,.25,.25);sl(7,-13.3,.7,.6);sl(21,-13.3,.7,.6);sl(14,-19.2,1.6,1.4);sl(10.5,-20.1,.6,.35);sl(17.5,-20.1,.6,.35);sl(14,-20.9,8,.2);sl(14,-11.4,8,.15);sl(22.1,-16.5,.3,4.5);sl(6,-18.4,.2,2.6);sl(6,-12.6,.2,.6);[[6.3,-12.4],[21.7,-12.4],[6.3,-20.6],[21.7,-20.6]].forEach(([x,z])=>sl(x,z,.2,.2));
 B(g,16,.08,.06,'#333',14,1.1,-11.4);for(let x=6;x<=22;x+=2)B(g,.1,.9,.1,'#333',x,.7,-11.4);
 const mk=new THREE.Group();B(mk,.9,.9,.9,'*#ff7ab8',0,0,0);mk.rotation.set(Math.PI/4,0,Math.PI/4);mk.position.set(14,11.5,-16.5);g.add(mk);g.userData.mk=mk;g.userData.mky=11.5;g.userData.roofs=ROOFG;
 /* beach: umbrellas with two sunbeds each on the sand */
 [[-17,2.5,PAL.coral],[-11,2.5,PAL.teal],[-5,2.5,'#ffd23d'],[-17,8.5,PAL.teal],[-11,8.5,'#ffd23d'],[-5,8.5,PAL.coral]].forEach(([x,z,c],i)=>{umbrella(g,x,z,c,.05);sl(x,z,.12,.12);[-.95,.95].forEach((o,j)=>{sunbed(g,x+o,z+.2,j?PAL.coral:PAL.teal,.05);sl(x+o,z+.4,.38,.95)})});
 [[-3,5.5,PAL.coral],[-19.5,5.8,PAL.teal],[-8,11.4,'#ffd23d'],[-14,11.4,PAL.coral]].forEach(([x,z,c])=>{B(g,.6,.03,1.2,c,x,.08,z)});
 /* fire pit: a square ring of stones, crossed logs, log benches */
 {const fx=-24.5,fz=8;[-1,0,1].forEach(a=>[-1,1].forEach(b=>{B(g,.4,.3,.4,'#8d9096',fx+a*.8,.2,fz+b*.9);B(g,.4,.3,.4,'#7c8087',fx+b*.9,.2,fz+a*.8)}));
  B(g,1.1,.2,.2,PAL.dark,fx,.3,fz).rotation.y=.6;B(g,1.1,.2,.2,PAL.dark,fx,.3,fz).rotation.y=-.6;
  const fl=glow(g,.45,.7,.45,'#ff9a2e',fx,.7,fz,3);g.userData.fire=fl;[[-1.9,0,1],[1.9,0,1],[0,-1.9,0]].forEach(([dx,dz,r])=>{B(g,r?.45:1.8,.45,r?1.8:.45,'#7a5230',fx+dx,.28,fz+dz);sl(fx+dx,fz+dz,r?.25:.95,r?.95:.25)});
  solid(CLUB_X+fx-.9,CLUB_Z+fz-.9,CLUB_X+fx+.9,CLUB_Z+fz+.9)}
 /* volleyball court: a net 9 m wide, lines on the sand, a ball */
 {const x0=11.5,x1=20.5,z0=5,z1=16,nz=10.5;B(g,.12,2.4,.12,PAL.bamboo,x0,1.2,nz);B(g,.12,2.4,.12,PAL.bamboo,x1,1.2,nz);sl(x0,nz,.12,.12);sl(x1,nz,.12,.12);
  B(g,9,.9,.03,'#fff',(x0+x1)/2,1.95,nz).material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,wireframe:true});B(g,9,.07,.06,'#fff',(x0+x1)/2,2.4,nz);
  [[(x0+x1)/2,z0,9,.08],[(x0+x1)/2,z1,9,.08],[x0,(z0+z1)/2,.08,z1-z0],[x1,(z0+z1)/2,.08,z1-z0]].forEach(([x,z,w,d])=>B(g,w,.02,d,'#fff',x,.07,z));
  const bl=B(g,.3,.3,.3,'#fff',16,2.7,8.5);g.userData.ball=bl}
 /* lifeguard tower: platform on four legs, a small hut, a ladder, a flag */
 {const x=24,z=14;[[-.9,-.9],[.9,-.9],[-.9,.9],[.9,.9]].forEach(([a,b])=>B(g,.16,2.2,.16,'#e8e8e8',x+a,1.1,z+b));B(g,2.4,.15,2.4,PAL.plank,x,2.2,z);
  B(g,2.2,1.6,.1,'#e8452c',x,3.1,z-1);B(g,.1,1.6,2.2,'#e8452c',x-1.05,3.1,z);B(g,.1,1.6,2.2,'#e8452c',x+1.05,3.1,z);B(g,2.7,.15,2.7,'#fff3d9',x,3.95,z);
  for(let i=0;i<5;i++)B(g,.8,.05,.08,PAL.dark,x,.4+i*.4,z+1.25);B(g,.06,1.6,.06,'#ddd',x+1.15,4.7,z-1.1);B(g,.8,.5,.04,'#e8452c',x+1.55,5.2,z-1.1);
  solid(CLUB_X+x-1,CLUB_Z+z-1,CLUB_X+x+1,CLUB_Z+z+1)}
 /* surfboard rack */
 sl(3.5,13,1.4,.25);B(g,2.8,.08,.08,PAL.dark,3.5,.7,13);B(g,2.8,.08,.08,PAL.dark,3.5,1.5,13);[2.2,4.8].forEach(x=>B(g,.1,1.8,.1,PAL.dark,x,.9,13));
 ['#ff6f61','#2aa7a1','#ffd23d','#8ad8ff','#e8e1d0'].forEach((c,i)=>{const b=B(g,.5,2.3,.07,c,2.4+i*.5,1.2,13);b.rotation.z=(i-2)*.03;B(g,.08,2.2,.08,'#fff',2.4+i*.5,1.2,13.05)});
 /* palms, torches, string lights */
 [[-26,-19,1.1,.12,0],[26,-19,1.2,-.12,3.14],[-26,-4,1,.14,0],[26,-4,1.1,-.14,3.14],[-7,-24.5,1.1,.12,1],[7,-24.5,1.2,-.12,2],[-26,14,1.05,.14,0],[26,10,1.1,-.14,3.14],[-4,-38,1,.1,1],[4,-38,1.1,-.1,2]].forEach(([x,z,s,l,r])=>{palmB(g,x,z,s,l,r);sl(x,z,.4,.4)});
 const px=[-26,-15,-5,5,15,26];px.forEach(x=>{B(g,.12,3.7,.12,'#333',x,1.85,-6.3);sl(x,-6.3,.1,.1)});
 for(let s=0;s<px.length-1;s++)strand(g,px[s],3.6,-6.3,px[s+1],3.6,-6.3,8,.5,1)
 /* solids: the bar counter and the stage block, the rest is open */
 sl(-18,-17.6,6.3,3.4);
 g.userData.glow=1;return g}

function buildLight(){const g=new THREE.Group();g.position.set(LH_X,0,LH_Z);root.add(g);
 B(g,10,1.3,10,'#7c8087',0,.65,0);B(g,8.4,.3,8.4,'#6a6e74',0,1.45,0);
 let y=1.3;const win=[];
 for(let i=0;i<5;i++){const w=6.2-i*.55,h=4;B(g,w,h,w,i%2?'#d6402f':'#f4f1ea',0,y+h/2,0);B(g,w+.35,.22,w+.35,'#3a3a40',0,y+h,0);if(i)B(g,.5,.8,.1,'#1b2a3a',0,y+2.2,w/2+.03);y+=h}
 B(g,1.2,2.2,.15,'#3a2a22',0,2.4,3.15);
 B(g,8,.3,8,'#2a2a2e',0,y+.15,0);g.userData.floor=y+.3;
 [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dz])=>{const L=8;B(g,dx?.08:L,.08,dx?L:.08,'#2a2a2e',dx*3.9,y+1.1,dz*3.9);for(let k=-2;k<=2;k++)B(g,.1,.9,.1,'#2a2a2e',dx?dx*3.9:k*1.95,y+.7,dx?k*1.95:dz*3.9)});
 const lant=new THREE.Mesh(geo(2.6,2,2.6),new THREE.MeshBasicMaterial({color:'#ffe9a8',transparent:true,opacity:.85}));lant.position.set(0,y+1.3,0);g.add(lant);g.userData.lant=lant;
 [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]].forEach(([a,b])=>B(g,.18,2.2,.18,'#2a2a2e',a,y+1.4,b));
 [[3.4,.4],[2.6,.4],[1.8,.4]].forEach(([w,h],i)=>B(g,w,h,w,'#d6402f',0,y+2.6+i*.4,0));B(g,.9,.6,.9,'#d6402f',0,y+3.9,0);B(g,.12,.9,.12,'#2a2a2e',0,y+4.6,0);
 /* the beam: two flat wedges that turn, only visible after dark */
 const beam=new THREE.Group();beam.position.y=y+1.3;g.add(beam);
 const bm=new THREE.MeshBasicMaterial({color:0xffd870,transparent:true,opacity:.26,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 [1,-1].forEach(a=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(60,5),bm);w.position.set(a*30,0,0);w.rotation.x=-Math.PI/2;beam.add(w)});
 g.userData.beam=beam;g.userData.beamMat=bm;g.userData.top=y+1.3;
 solid(LH_X-3.4,LH_Z-3.4,LH_X+3.4,LH_Z+3.4);
 /* the islet: blocky grey rock (two squares, one turned) with a grassy top, a pale shallow square and foam, rocks round the edge */
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(ISLET*2+26,ISLET*2+26),new THREE.MeshBasicMaterial({color:0x8ee6e0,transparent:true,opacity:.55,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.set(LH_X,-.41,LH_Z);root.add(sh);
 B(root,ISLET*2,2.4,ISLET*2,'#7c8087',LH_X,-.1,LH_Z);B(root,ISLET*1.7,2.4,ISLET*1.7,'#72767c',LH_X,-.1,LH_Z).rotation.y=Math.PI/4;
 B(root,ISLET*1.6,.5,ISLET*1.6,'#6a9a52',LH_X,1.1,LH_Z);B(root,ISLET*1.35,.5,ISLET*1.35,'#6a9a52',LH_X,1.1,LH_Z).rotation.y=Math.PI/4;
 const fo=new THREE.Group();fo.position.set(LH_X,-.36,LH_Z);root.add(fo);const fm2=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false}),FR=ISLET+3.4;
 [[0,-FR,FR*2,1.2],[0,FR,FR*2,1.2],[-FR,0,1.2,FR*2],[FR,0,1.2,FR*2]].forEach(([x,z,w,d])=>{const m=new THREE.Mesh(geo(w,.04,d),fm2);m.position.set(x,0,z);fo.add(m)});g.userData.foam=fo;
 for(let i=0;i<14;i++){const a=i/14*6.283+Math.sin(i*3.1)*.2,r=ISLET*1.2+(i%3)*1.4,w=1.6+(i%4)*.7;B(root,w,1+(i%3)*.5,w*.9,['#8d9096','#7c8087','#6f7378','#9a9a94'][i%4],LH_X+Math.cos(a)*r,.2,LH_Z+Math.sin(a)*r).rotation.y=i}
 /* the pier: planks, posts both sides, a rail and warm lamps */
 const pz0=LH_Z+ISLET-2,pz1=PIER_Z0,len=pz1-pz0,pm=(pz0+pz1)/2;
 B(root,5.2,.34,len,'#9a6a3c',LH_X,.22,pm);for(let z=pz0+1;z<pz1;z+=1.3)B(root,5.3,.03,.08,'#5a3a22',LH_X,.4,z);
 for(let z=pz0+2;z<pz1;z+=6){[-1,1].forEach(a=>{B(root,.3,2.2,.3,'#5a3a22',LH_X+a*2.7,.7,z);B(root,.36,2.4,.36,'#5a3a22',LH_X+a*2.7,-.9,z)});if(z+6<pz1)[-1,1].forEach(a=>strand(root,LH_X+a*2.7,1.8,z,LH_X+a*2.7,1.8,z+6,6,.35,1))}
 [-1,1].forEach(a=>{B(root,.1,.1,len,'#5a3a22',LH_X+a*2.7,1.45,pm)});
 PIER={x0:LH_X-2.5,x1:LH_X+2.5,z0:LH_Z+ISLET-8,z1:pz1+4};
 return g}
let PIER=null;
/* the pier and the islet are walkable out in the sea: the island's shore check is skipped there and only solid things (the tower) stop you */
{const h0=hit;hit=function(x,z,r){try{if(PIER&&!IN&&mode!='drive'&&((x>PIER.x0&&x<PIER.x1&&z>PIER.z0&&z<PIER.z1)||Math.max(Math.abs(x-LH_X),Math.abs(z-LH_Z))<ISLET-1.5)){r=r||.4;return cols.some(c=>x+r>c[0]&&x-r<c[2]&&z+r>c[1]&&z-r<c[3])?1:0}}catch(e){}return h0.apply(this,arguments)}}
let club=null,light=null,built=false;
function build(){if(built)return;built=true;try{club=buildClub()}catch(e){console.error('beach club',e)}try{light=buildLight()}catch(e){console.error('lighthouse',e)}
 /* prompts */
 INT.push({x:CLUB_X+14,z:CLUB_Z-12,r:8,l:'Sunset Beach Club stage',a:()=>stageUse(),bc:'stage'});
 INT.push({x:CLUB_X-18,z:CLUB_Z-12.4,r:4.5,l:'Beach bar: smoothie $8',a:()=>bar(),bc:'bar'});
 INT.push({x:LH_X,z:LH_Z+5.6,r:4.5,l:'Climb the Lighthouse',a:()=>climb(),lh:1})}

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
 const fin=()=>{$('ui').innerHTML=`<div class="box modal pe" style="width:min(520px,94vw)"><div class=pehd><span class=pek>Sunset Beach Club</span><h2>What a sunset</h2></div><div class=pebd><div class=peres><h3>${line}</h3><p>About <b>${fmt(crowd)}</b> people came. You played ${L.map(s=>'<b>'+E(s.title)+'</b>').join(', ')}.</p><p>Fee <b>${fm(pay)}</b> · <b>+${fmt(fol)} followers</b> · more streams on the songs you played.</p></div><div class=row2><button class=go onclick="closeUI()">Nice</button></div></div></div>`;};
 note('Sunset Beach Club Bookings','Thank you for tonight, '+(S.artist||'')+'! '+fmt(crowd)+' people on the sand and a '+fm(pay)+' fee on its way to you. Come back anytime.');showGig(L,fin)};

/* ---------- the gig: the camera goes behind you on stage and looks out over the crowd ---------- */
let BCV=null,bcCam=null;
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(BCV&&bcCam&&c===cam){bcCam.aspect=innerWidth/innerHeight;bcCam.updateProjectionMatrix();return r0(sc,bcCam)}if(LHV&&lhCam&&c===cam)return r0(sc,lhCam);return r0(sc,c)}}
function showGig(L,fin){if(!club||away()||mode=='title'){fin();return}
 try{if(!bcCam)bcCam=new THREE.PerspectiveCamera(60,1,.1,600);
  const perf=buildChar(ch);perf.g.position.set(CLUB_X+14,1.3,CLUB_Z-15.6);root.add(perf.g);
  try{P.mesh.visible=false}catch(e){}document.body.classList.add('fston');
  BCV={t:0,L,fin,perf,dur:L.length*7,k:-1};
  $('ui').innerHTML='<div class="box pe" style="position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:5;text-align:center;padding:6px 10px"><div id=bcnow style="padding:4px 14px;font-size:16px"></div><button onclick="bcSkip()">Skip</button></div>'}
 catch(e){console.error('beach club gig',e);if(BCV)endGig();else fin()}}
function endGig(){const v=BCV;if(!v)return;BCV=null;try{root.remove(v.perf.g)}catch(e){}try{P.mesh.visible=true}catch(e){}document.body.classList.remove('fston');v.fin()}
window.bcSkip=()=>{if(BCV)endGig()};

/* ---------- the bar ---------- */
function bar(){if(mode!='play'||away())return;if(S.bcBar===S.day){sn('err');return say('Mara says: one smoothie a day, you will float away!')}
 if((S.money||0)<8){sn('err');return say('A smoothie is $8.')}if((S.energy||0)>=100){sn('err');return say('You are already full of energy.')}
 S.money=+(S.money-8).toFixed(2);S.energy=Math.min(100,(S.energy||0)+12);S.bcBar=S.day;sv();sn('eat');say('Mango smoothie. +12 energy.')}

/* ---------- the lighthouse: climb to the gallery and walk round the top in first person ---------- */
let LHV=null,lhCam=null;
const LHBOX='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;background:rgba(18,22,30,.94);color:#fff;font:15px/1.45 system-ui,sans-serif;border-radius:14px;padding:20px 22px;width:min(360px,92vw);box-shadow:0 12px 40px rgba(0,0,0,.45)';
const LHBTN='padding:10px 16px;border:0;border-radius:8px;font:600 15px system-ui,sans-serif;cursor:pointer;color:#fff;';
function climb(){if(mode!='play'||away())return;mode='menu';const fresh=S.lhDay!==S.day;
 $('ui').innerHTML=`<div style="${LHBOX}"><div style="font-size:18px;font-weight:600;margin-bottom:6px">Lighthouse</div><div style="opacity:.8;margin-bottom:16px">Climb to the lookout and look out over the whole island.${fresh?' The sea air gives you +20 energy (once a day).':''}</div><div style="display:flex;gap:8px"><button onclick="lhGo()" style="${LHBTN}flex:1;background:#2f7bf5">Climb up</button><button onclick="closeUI()" style="${LHBTN}background:rgba(255,255,255,.14)">Not now</button></div></div>`}
let lhH=null;
window.lhGo=function(){if(!light||LHV||mode!='menu')return;$('ui').innerHTML='';
 if(S.lhDay!==S.day){S.lhDay=S.day;S.energy=Math.min(100,(S.energy||0)+20);sv();sn('chime');say('Fresh sea air at the top. +20 energy.')}
 if(!lhCam){lhCam=new THREE.PerspectiveCamera(72,1,.1,4000);lhCam.rotation.order='YXZ'}
 LHV={x:0,z:2.8,yaw:Math.PI,pit:-.08,f:light.userData.floor,fog:scene.fog&&scene.fog.near!=null?[scene.fog.near,scene.fog.far]:null,drag:0,lab:[]};
 if(LHV.fog){scene.fog.near=500;scene.fog.far=3200}
 try{P.mesh.visible=false}catch(e){}document.body.classList.add('fston');
 const d=document.createElement('div');d.id='lhv';d.style.cssText='position:fixed;inset:0;z-index:55;pointer-events:none;font:12px system-ui,sans-serif;color:#fff;overflow:hidden';
 d.innerHTML='<div id=lhl></div><div style="position:absolute;left:50%;bottom:18px;transform:translateX(-50%);background:rgba(18,22,30,.82);padding:8px 14px;border-radius:10px;display:flex;gap:14px;align-items:center;pointer-events:auto;font:14px system-ui,sans-serif"><span style="opacity:.85">WASD walk · mouse or arrows look · Shift run</span><button onclick="lhDown()" style="'+LHBTN+'background:#2f7bf5;padding:7px 14px">Climb down</button></div>';
 document.body.appendChild(d);const box=d.firstChild;
 /* a small label for each place on the map: name and distance */
 POIS.forEach(q=>{if(q[2]=='Lighthouse')return;const e=document.createElement('div');e.style.cssText='position:absolute;left:0;top:0;white-space:nowrap;background:rgba(18,22,30,.72);padding:2px 7px;border-radius:9px;border-left:3px solid '+(q[3]||'#fff')+';display:none';box.appendChild(e);LHV.lab.push({q,e})});
 const cv=renderer.domElement,mm=e=>{if(!LHV)return;if(document.pointerLockElement===cv||LHV.drag){LHV.yaw-=(e.movementX||0)*.0025;LHV.pit=Math.max(-1.2,Math.min(1.2,LHV.pit-(e.movementY||0)*.0025))}},
  md=e=>{if(!LHV||e.target!==cv)return;LHV.drag=1;try{cv.requestPointerLock&&cv.requestPointerLock()}catch(x){}},mu=()=>{if(LHV)LHV.drag=0},
  kd=e=>{if(!LHV)return;const k=(e.key||'').toLowerCase();if(k=='e'||k=='escape'){e.preventDefault();e.stopPropagation();lhDown()}else if(k.startsWith('arrow')||k==' ')e.preventDefault()},
  ts=e=>{if(!LHV||e.target!==cv)return;LHV.tx=e.touches[0].clientX;LHV.ty=e.touches[0].clientY},
  tm=e=>{if(!LHV||LHV.tx==null||e.target!==cv)return;const t=e.touches[0];LHV.yaw-=(t.clientX-LHV.tx)*.005;LHV.pit=Math.max(-1.2,Math.min(1.2,LHV.pit-(t.clientY-LHV.ty)*.005));LHV.tx=t.clientX;LHV.ty=t.clientY};
 window.addEventListener('mousemove',mm);window.addEventListener('mousedown',md);window.addEventListener('mouseup',mu);window.addEventListener('keydown',kd,true);window.addEventListener('touchstart',ts,{passive:true});window.addEventListener('touchmove',tm,{passive:true});
 lhH=()=>{window.removeEventListener('mousemove',mm);window.removeEventListener('mousedown',md);window.removeEventListener('mouseup',mu);window.removeEventListener('keydown',kd,true);window.removeEventListener('touchstart',ts);window.removeEventListener('touchmove',tm)}};
window.lhDown=function(){const v=LHV;if(!v)return;LHV=null;if(lhH){lhH();lhH=null}try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}
 if(v.fog){scene.fog.near=v.fog[0];scene.fog.far=v.fog[1]}const d=document.getElementById('lhv');if(d)d.remove();try{P.mesh.visible=true}catch(e){}document.body.classList.remove('fston');mode='play';sn('pop')};
const lhV3=new THREE.Vector3();
function lhFrame(dt){const v=LHV,d=Math.min(dt||.016,.1);
 v.yaw+=((keys.arrowleft?1:0)-(keys.arrowright?1:0))*1.8*d;v.pit=Math.max(-1.2,Math.min(1.2,v.pit+((keys.arrowup?1:0)-(keys.arrowdown?1:0))*1.2*d));
 let fx=(keys.w?1:0)-(keys.s?1:0),sx=(keys.d?1:0)-(keys.a?1:0);if(window.TCHJ&&TCHJ.on){fx=-TCHJ.y;sx=TCHJ.x}
 const sp=(keys.shift?4:2.2)*d,sn_=Math.sin(v.yaw),cs=Math.cos(v.yaw);v.x+=(-sn_*fx+cs*sx)*sp;v.z+=(-cs*fx-sn_*sx)*sp;
 const O=3.55,I=1.75;v.x=Math.max(-O,Math.min(O,v.x));v.z=Math.max(-O,Math.min(O,v.z));
 if(Math.abs(v.x)<I&&Math.abs(v.z)<I){if(I-Math.abs(v.x)<I-Math.abs(v.z))v.x=(v.x<0?-1:1)*I;else v.z=(v.z<0?-1:1)*I}
 lhCam.position.set(LH_X+v.x,v.f+1.65,LH_Z+v.z);lhCam.rotation.set(v.pit,v.yaw,0);lhCam.aspect=innerWidth/innerHeight;lhCam.updateProjectionMatrix();lhCam.updateMatrixWorld(true);
 /* labels: the nearest places in view, skipping any that would sit on top of one already shown */
 const W=innerWidth,H=innerHeight,c=[];v.lab.forEach(l=>{l.e.style.display='none';const dx=l.q[0]-lhCam.position.x,dz=l.q[1]-lhCam.position.z,dist=Math.hypot(dx,dz);lhV3.set(l.q[0],2,l.q[1]).project(lhCam);
  if(lhV3.z>1||lhV3.z<0||Math.abs(lhV3.x)>.98||Math.abs(lhV3.y)>.95||dist>1700)return;c.push({l,dist,x:(lhV3.x+1)/2*W,y:(1-lhV3.y)/2*H})});
 c.sort((a,b)=>a.dist-b.dist);const shown=[];
 c.forEach(o=>{if(shown.length>=9||shown.some(p=>Math.abs(p.x-o.x)<150&&Math.abs(p.y-o.y)<26))return;shown.push(o);const e=o.l.e;e.style.display='block';e.style.transform='translate('+Math.round(o.x)+'px,'+Math.round(o.y)+'px) translate(-50%,-120%)';const t=o.l.q[2]+' \u00b7 '+Math.round(o.dist/10)*10+' m';if(e.textContent!==t)e.textContent=t})}

/* ---------- every frame ---------- */
let spin=0,HY=0;/* the height the walker is lifted to (other files reset SY every frame, so it is smoothed here and then written to SY) */
function hy(h,dt){HY+=(h-HY)*Math.min(1,(dt||.016)*14);if(Math.abs(HY-h)<.01)HY=h;SY=HY;P.mesh.position.y=HY}
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='title')return r;if(!built)build();const off=away();root.visible=!off;if(off)return r;spin+=dt||0;
 const night=(S.t||0)>=290,o=booked(),m=mins();
 const open=o&&S.day==o.day&&m>=SLOT[0]&&m<SLOT[1];
 INT.forEach(i=>{if(i.bc=='stage')i.l=open?'Play your Beach Club set':o?(S.day<o.day?'Beach Club gig on Day '+o.day:m<SLOT[0]?'Beach Club gig at '+hm(SLOT[0]):'Beach Club gig (over)'):'Sunset Beach Club stage';
  if(i.bc=='bar')i.l=S.bcBar===S.day?'Beach bar (smoothie taken today)':'Beach bar: smoothie $8';
  if(i.lh)i.l=S.lhDay===S.day?'Lighthouse (visited today)':'Climb the Lighthouse'});
 if(LHV)lhFrame(dt);
 if(BCV){const v=BCV,t=v.t+=dt||0,k=Math.min(v.L.length-1,Math.floor(t/7)),e=$('bcnow');if(e&&v.k!==k){v.k=k;e.textContent='\u266a '+v.L[k].title}
  bcCam.position.set(CLUB_X+12.4+Math.sin(t*.37)*.35,4.7,CLUB_Z-19.6+Math.min(t,10)*.04);bcCam.lookAt(CLUB_X+14.6+Math.sin(t*.37)*.2,1.7,CLUB_Z+12);
  v.perf.g.position.y=1.3+Math.abs(Math.sin(t*4))*.05;v.perf.arms[0].rotation.x=-.3+Math.sin(t*3)*.25;v.perf.arms[1].rotation.x=-1.1;
  if(t>=v.dur)endGig()}
 if(club){const dd=Math.hypot(P.x-CLUB_X,P.z-CLUB_Z);club.visible=dd<450||!!BCV;if(club.visible){if(dd<260&&!ppG)buildPeople(club);
  const lx=P.x-CLUB_X,lz=P.z-CLUB_Z,inside=!!BCV||(lx>-25&&lx<-11&&lz<-13&&lz>-22)||(lx>5&&lx<23&&lz<-11&&lz>-22),show=!!BCV||!!open;
  RM.forEach(m=>{m.opacity+=((inside?.1:1)-m.opacity)*.18;m.depthWrite=m.opacity>.6});setGlow(night||show,show);
  if(ppG)PPL.forEach(p=>{const g=p.o.g;if(p.k=='crowd'){g.visible=show;if(show){const up=!!BCV;g.position.y=p.y+Math.abs(Math.sin(spin*3+p.ph))*(up?.14:.03);p.o.arms.forEach((a,i)=>a.rotation.x=up?-2.7+Math.sin(spin*5+p.ph+i)*.4:-.1)}}
   else if(p.k=='vb'){g.position.y=Math.abs(Math.sin(spin*2.2+p.ph))*.3;p.o.arms.forEach(a=>a.rotation.x=-1.8)}else if(p.k=='bar')p.o.arms[1].rotation.x=-.8+Math.sin(spin*3)*.25});
  const bl=club.userData.ball;if(bl)bl.position.y=2.3+Math.abs(Math.sin(spin*2.2))*1.2}}
 /* stand ON the deck, the stage and the steps (the ground is flat, so the walker is lifted to the height of what is under them) */
 if(club&&club.visible&&mode=='play'&&!IN&&!HIN&&P.mesh){const lx=P.x-CLUB_X,lz=P.z-CLUB_Z;
  if(lx>-30&&lx<30&&lz>-40&&lz<20){let h=0;
   if(lx>-27.2&&lx<27.2&&lz>-22.2&&lz<-6){h=.25;if(lx>6&&lx<22.4&&lz>-21&&lz<-12)h=1.3;else if(lz>-15.8&&lz<-13.2){if(lx>5.1&&lx<=6)h=.95;else if(lx>4.4&&lx<=5.1)h=.6}}
   else if(Math.abs(lx)<3&&lz>=-6&&lz<-5.4)h=.17;else if(Math.abs(lx)<3&&lz>=-5.4&&lz<-4.8)h=.08;
   if(h>0||HY>0){hy(h,dt)}}else HY=0}
 /* the pier and the rock islet are raised too: stand on them, not in them */
 if(light&&PIER&&mode=='play'&&!IN&&P.mesh&&Math.abs(P.x-LH_X)<40&&Math.abs(P.z-LH_Z)<(PIER_Z0-LH_Z)+10){let h=0;const d=Math.max(Math.abs(P.x-LH_X),Math.abs(P.z-LH_Z));
  if(d<10.2)h=1.35;else if(d<ISLET-1.5)h=1.1;else if(P.x>PIER.x0&&P.x<PIER.x1&&P.z>PIER.z0&&P.z<PIER.z1)h=.4;
  hy(h,dt)}
 if(club&&club.userData.mk){const k=club.userData.mk;k.visible=!!open;k.rotation.y=spin*1.6;k.position.y=club.userData.mky+Math.sin(spin*2.2)*.3}
 if(club&&club.userData.fire){const f=club.userData.fire;f.scale.set(1,.8+Math.sin(spin*9)*.25+Math.sin(spin*13)*.15,1)}
 if(light){const u=light.userData;u.beam.rotation.y=spin*.9;u.beam.visible=night;u.lant.material.color.set(night?0xfff2b0:0xcfd8c0)}
 }catch(e){if(!window.__ipErr){window.__ipErr=1;console.error('island places',e)}}return r}}
})();
