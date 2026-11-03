/* WaveFern dev: Gramophone Awards, part 2 (the 3D hall and the ceremony). Only loaded on /dev/. Needs dev-awards-v1.js.
   Replaces the old single-category cutscene with a full broadcast:
   red carpet arrival with press -> opening live performance -> presenters and winners in other categories ->
   your categories one by one (Best New Artist, Album of the Year, Record of the Year, Song of the Year) with nominees,
   envelope and a walk up to the stage when you win -> a second performance -> results and rewards.
   The hall is a warm dusk theatre: panelled walls, balconies, a proscenium with a sunset LED backdrop, chandeliers,
   a lathe-turned gold gramophone trophy, a live band. Static geometry is merged into a few meshes. No glow, no additive
   light cones, no colour cycling. Add ?noawards to skip. */
(function(){
 if(!window.FW_DEV)return;
 if(/[?&]noawards/.test(location.search))return;
 const X=window.AWX;if(!X||typeof AWC==='undefined')return;

 const C={gold:'#b8923a',gold2:'#d6b25a',cream:'#e6d3ae',plum:'#3b2236',plum2:'#2a1727',wine:'#6a1c2c',wine2:'#4e1220',dark:'#150c1a',wood:'#3a2218',amb:'#e08a3c'};
 const PZ=110; /* the red carpet plaza sits this far along z from the hall, in the same group */

 /* ---------- helpers ---------- */
 function mkBatch(grp){const st={};
  return{sb:(w,h,d,c,x,y,z,ry)=>{(st[c]=st[c]||[]).push([w,h,d,x,y,z,ry||0])},
   flush:()=>{const base=new THREE.BoxGeometry(1,1,1).toNonIndexed(),bp=base.attributes.position.array,bn=base.attributes.normal.array;
    Object.keys(st).forEach(c=>{const P=[],N=[];st[c].forEach(q=>{const cs=Math.cos(q[6]),sn=Math.sin(q[6]);for(let i=0;i<bp.length;i+=3){const x=bp[i]*q[0],y=bp[i+1]*q[1],z=bp[i+2]*q[2];P.push(x*cs+z*sn+q[3],y+q[4],-x*sn+z*cs+q[5]);P.length;N.push(bn[i]*cs+bn[i+2]*sn,bn[i+1],-bn[i]*sn+bn[i+2]*cs)}});
     const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(P,3));ge.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
     grp.add(new THREE.Mesh(ge,c[0]=='*'?MB(c.slice(1)):M(c)))})}}}
 const cvs=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c};
 const ctex=(c,pix)=>{const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;if(pix)t.magFilter=THREE.NearestFilter;return t};
 const lat=(pts,mat,seg)=>new THREE.Mesh(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg||18),mat);
 const MD=c=>{const k='d'+c;return MC[k]||(MC[k]=new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}))};

 /* ---------- the trophy: a turned gold gramophone on a marble plinth (about 1 unit tall at scale 1) ---------- */
 function gramo(sc){
  const t=new THREE.Group(),gm=(c,e)=>{const m=new THREE.MeshLambertMaterial({color:c,emissive:e,side:THREE.DoubleSide});return m},gold=gm('#c4a043','#4a3a10'),gold2=gm('#dcbb5a','#54430f'),hornM=gm('#d2ae4c','#4a3a10'),mar=M('#2a2428'),blk=M('#121014');
  t.add(lat([[0,0],[.3,0],[.3,.05],[.26,.05],[.26,.1],[.22,.1],[.22,.13],[0,.13]],mar));
  t.add(lat([[0,.13],[.2,.13],[.2,.17],[.12,.2],[.07,.26],[.05,.36],[.05,.5],[.09,.54],[0,.54]],gold));
  const rec=lat([[0,.54],[.27,.54],[.28,.56],[.27,.575],[0,.575]],blk);t.add(rec);
  const lab=lat([[0,.575],[.07,.575],[.07,.58],[0,.58]],M('#a01c28'));t.add(lab);
  const arm=new THREE.Group();B(arm,.016,.016,.26,'#cfc7b4',0,0,0);B(arm,.03,.03,.04,'#cfc7b4',0,-.01,.14);arm.position.set(-.12,.64,.12);arm.rotation.y=.9;t.add(arm);
  B(t,.06,.06,.06,'#b8923a',-.2,.6,.2);
  const pts=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([.03+.3*Math.pow(u,2.3),u*.72])}
  const horn=lat(pts,hornM,20);const hg=new THREE.Group();hg.add(horn);hg.position.set(.08,.62,-.02);hg.rotation.z=-.78;t.add(hg);
  const neck=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),gold2);neck.position.set(.08,.62,-.02);t.add(neck);
  t.add(lat([[.0,.54],[.08,.54],[.07,.62],[0,.62]],gold));
  t.scale.setScalar(sc||1);return t}
 X.gramo=gramo;
 function safe(f,t){try{return f()}catch(e){console.error('awards show '+(t||''),e)}}

 /* ---------- the sunset art for the big screens (drawn small, scaled up with hard pixels like the rest of the game) ---------- */
 function sunsetArt(){
  return cvs(256,108,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#241540');g.addColorStop(.35,'#6a2a66');g.addColorStop(.6,'#c4505a');g.addColorStop(.8,'#ec9455');g.addColorStop(1,'#f5c27a');x.fillStyle=g;x.fillRect(0,0,w,h);
   const r=awRng(77);for(let i=0;i<38;i++){x.fillStyle='rgba(255,235,210,'+(.25+r()*.5)+')';x.fillRect(Math.floor(r()*w),Math.floor(r()*h*.4),1,1)}
   x.fillStyle='#f6d28c';x.beginPath();x.arc(w*.5,h*.74,17,0,7);x.fill();
   for(let i=0;i<7;i++){x.fillStyle='rgba(222,112,124,'+(.35+r()*.25)+')';x.fillRect(Math.floor(r()*w*.8),Math.floor(h*.3+r()*h*.3),30+Math.floor(r()*50),2+Math.floor(r()*2))}
   const sky=(c,min,max,seed,win)=>{const q=awRng(seed);x.fillStyle=c;let px=0;while(px<w){const bw=6+Math.floor(q()*12),bh=min+Math.floor(q()*(max-min));x.fillRect(px,h-bh,bw,bh);if(win)for(let k=0;k<3;k++)if(q()<.4){x.fillStyle='#f3c06a';x.fillRect(px+1+Math.floor(q()*(bw-2)),h-bh+3+Math.floor(q()*(bh-6)),1,1);x.fillStyle=c}px+=bw}};
   sky('#6a2a5a',14,34,3,0);sky('#2a1232',8,24,9,1)})}
 const SUNSET=sunsetArt();

 /* ---------- the ceremony ---------- */
 window.awPlay=function(n){const O=AWC;O.bg=scene.background;O.fog=scene.fog;scene.background=new THREE.Color(0x1a0e1e);scene.fog=null;O.hud=$('hud').style.display;$('hud').style.display='none';mode='cutawd';O.on=1;AWP=1;
  /* the outside world stays hidden while the broadcast plays, so the open-air plaza shows only its own sky */
  O.hid=scene.children.filter(o=>o.visible&&!o.isLight);O.hid.forEach(o=>o.visible=false);
  O.lt=[];scene.traverse(o=>{if(o.isLight&&o.visible){O.lt.push(o);o.visible=false}});
  const go=show(n);O.go=go;go(0)};

 function show(N){
  const O=AWC,g=new THREE.Group();g.position.set(O.ox,0,O.oz);scene.add(g);O.g=g;
  const b=(w,h,d,c,x,y,z,p)=>B(p||g,w,h,d,c,x,y,z),{sb,flush}=mkBatch(g),rng=awRng(N.no*131+5),pk=a=>a[Math.floor(rng()*a.length)];
  const aspect=()=>innerWidth/innerHeight;O.cam=new THREE.PerspectiveCamera(46,aspect(),.1,420);
  const YOU_NAME=S.artist;

  /* ===== the hall shell: floor, panelled walls, pilasters, ceiling ===== */
  const carpet=ctex(cvs(64,64,(x,w,h)=>{x.fillStyle='#3f1424';x.fillRect(0,0,w,h);x.fillStyle='#4a1a2c';for(let i=0;i<8;i++)for(let j=0;j<8;j++)if((i+j)%2)x.fillRect(i*8,j*8,8,8);x.fillStyle='#5a2236';for(let i=0;i<8;i++)for(let j=0;j<8;j++)if((i+j)%2==0)x.fillRect(i*8+3,j*8+3,2,2)}),1);carpet.wrapS=carpet.wrapT=THREE.RepeatWrapping;carpet.repeat.set(26,22);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(76,64),new THREE.MeshLambertMaterial({map:carpet}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0,6);g.add(fl);
  const wallT=ctex(cvs(64,64,(x,w,h)=>{x.fillStyle='#46283e';x.fillRect(0,0,w,h);x.fillStyle='#3e2336';for(let i=0;i<64;i+=16)x.fillRect(i,0,1,64);x.fillStyle='#4e2e46';x.fillRect(0,0,64,2)}),1);wallT.wrapS=wallT.wrapT=THREE.RepeatWrapping;
  const wall=(w,h,x,y,z,ry)=>{const t=wallT.clone();t.needsUpdate=true;t.repeat.set(w/4,h/4);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m)};
  wall(76,26,0,13,38,Math.PI);wall(64,26,-38,13,6,Math.PI/2);wall(64,26,38,13,6,-Math.PI/2);wall(76,26,0,13,-16,0);
  sb(76,.4,64,'#1b0f1f',0,26.2,6);
  /* ceiling coffers */
  for(let x=-34;x<=34;x+=8)sb(.5,.5,64,C.wood,x,25.8,6);for(let z=-12;z<=36;z+=8)sb(76,.5,.5,C.wood,0,25.8,z);
  /* wainscot, dado rail, cornice, skirting on all four walls */
  [[0,38,76,0,1],[0,-15.8,76,0,-1],[-37.8,6,64,1,0],[37.8,6,64,1,0]].forEach(q=>{const alongX=!q[3];const w=q[2];
   if(alongX){sb(w,3,.5,C.wood,q[0],1.5,q[1]+(q[1]>0?-.2:.2));sb(w,.25,.7,C.gold,q[0],3.1,q[1]+(q[1]>0?-.2:.2));sb(w,.9,1,C.cream,q[0],24.6,q[1]+(q[1]>0?-.5:.5));sb(w,.3,1.3,C.gold,q[0],23.9,q[1]+(q[1]>0?-.65:.65))}
   else{sb(.5,3,w,C.wood,q[0]+(q[0]>0?-.05:.05),1.5,q[1]);sb(.7,.25,w,C.gold,q[0]+(q[0]>0?-.05:.05),3.1,q[1]);sb(1,.9,w,C.cream,q[0]>0?36.5:-36.5,24.6,q[1]);sb(1.3,.3,w,C.gold,q[0]>0?36.4:-36.4,23.9,q[1])}});
  /* pilasters */
  for(let z=-8;z<=36;z+=6.2)[-1,1].forEach(s=>{sb(1.4,22,1.4,C.cream,s*37.2,12,z);sb(1.8,.6,1.8,C.gold,s*37.1,1.2,z);sb(1.8,.6,1.8,C.gold,s*37.1,22.8,z)});
  for(let x=-30;x<=30;x+=7.5){sb(1.4,22,1.2,C.cream,x,12,37.3);sb(1.8,.6,1.6,C.gold,x,1.2,37.2);sb(1.8,.6,1.6,C.gold,x,22.8,37.2)}
  /* wall sconces: brass arm and a small shade */
  for(let z=-4;z<=36;z+=6.2)[-1,1].forEach(s=>{sb(.3,.8,.3,C.gold,s*36.8,9,z+3.1);b(.35,.5,.35,'*e8c88a',s*36.6,9.7,z+3.1)});

  /* ===== the stage: platform, inlay, revolve, proscenium, backdrop, towers, drapes ===== */
  sb(30,.8,10,'#2c1a22',0,.4,-9.2);sb(30.4,.16,10.4,C.gold,0,.78,-9.2);sb(26,.04,8,'#4a2c24',0,.82,-9.4);sb(30.4,.3,.3,C.gold2,0,.7,-4.1);
  for(let x=-12;x<=12;x+=2)sb(.04,.03,8,'#3e251e',x,.845,-9.4);
  sb(4.4,.27,.7,C.gold,0,.135,-3.25);sb(4.4,.53,.7,'#c99a42',0,.265,-3.8);
  [-1,1].forEach(s=>{sb(.4,.9,.4,C.gold2,s*2.4,.45,-3.5);sb(.3,.1,.3,C.cream,s*2.4,.95,-3.5)});
  for(let k=0;k<30;k++)sb(.9,.05,.18,k%2?'*d98a46':'*b8643c',-14.2+k*.98,.64,-4.05);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.4,.05,40),M('#1d1218'));disc.position.set(0,.85,-9.6);g.add(disc);
  const dr=new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.6,.05,40),M(C.gold));dr.position.set(0,.83,-9.6);g.add(dr);
  const dr2=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,.04,32),M('#3a2230'));dr2.position.set(0,.88,-9.6);g.add(dr2);
  /* proscenium: wall with an opening, two gilded columns, lintel, valance */
  [-1,1].forEach(s=>{sb(22,26,1,C.plum2,s*27,13,-4.6);sb(2,21,1.6,C.cream,s*16,10.5,-4.4);sb(2.4,.8,2,C.gold,s*16,.6,-4.4);sb(2.4,.8,2,C.gold,s*16,20.6,-4.4);sb(.4,20,.4,C.gold,s*15.2,10.5,-3.5);sb(.4,20,.4,C.gold,s*16.8,10.5,-3.5)});
  sb(34,5,1,C.plum2,0,23.5,-4.6);sb(34,1,1.6,C.cream,0,20.8,-4.4);sb(34.4,.5,2,C.gold,0,20.2,-4.4);sb(34,.4,.4,C.gold2,0,19.6,-3.6);
  for(let k=-15;k<=15;k+=1.5)sb(1.5,1.4,.6,k%3?C.wine:C.wine2,k,19,-3.8);
  /* heavy drapes at the sides of the opening */
  [-1,1].forEach(s=>{for(let k=0;k<6;k++)sb(1.2,19.4,.7,k%2?C.wine:C.wine2,s*(12.4+k*.9),9.8,-4.1-(k%2)*.15)});
  /* backdrop: sunset LED screen in a gold frame, with side towers */
  const sc=document.createElement('canvas');sc.width=1024;sc.height=430;const tex=ctex(sc,0);
  sb(20,8.8,.4,C.gold,0,8.2,-15.5);sb(19.4,8.2,.3,'#0e0710',0,8.2,-15.35);
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(19,7.9),new THREE.MeshBasicMaterial({map:tex}));scr.position.set(0,8.2,-15.18);g.add(scr);
  const towT=ctex(cvs(32,128,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#241540');gr.addColorStop(.5,'#8a3a62');gr.addColorStop(1,'#eba05a');x.fillStyle=gr;x.fillRect(0,0,w,h)}),1);
  [-14.5,14.5].forEach(x=>{sb(2,14.6,1.2,C.gold,x,8.2,-15);const p=new THREE.Mesh(new THREE.PlaneGeometry(1.5,14),new THREE.MeshBasicMaterial({map:towT}));p.position.set(x,8.2,-14.38);g.add(p)});
  /* flanking trophies and a podium */
  [-9.5,9.5].forEach(x=>{sb(2.4,1.4,2.4,C.plum2,x,1.5,-11.3);sb(2.6,.2,2.6,C.gold,x,2.3,-11.3);const t=gramo(4.2);t.position.set(x,2.4,-11.3);t.rotation.y=x<0?Math.PI:0;g.add(t)});
  const pod=new THREE.Group();g.add(pod);b(2.6,1.5,1.1,'#2c1a26',0,1.55,-8,pod);b(2.8,.12,1.3,C.gold,0,2.35,-8,pod);
  const podT=gramo(.6);podT.position.set(0,2.41,-8.1);pod.add(podT);b(.05,.7,.05,'#999',.3,2.7,-8.2,pod);b(.2,.08,.12,'#222',.3,3.05,-8.1,pod);
  /* stage truss with spot fixtures; all dark steel and brass, no light cones */
  [[-6,16],[-10,17],[-1,17.4]].forEach(q=>{sb(36,.4,.4,'#2a2428',0,q[1],q[0]);for(let x=-16;x<=16;x+=4){sb(.7,.7,.7,'#18141a',x,q[1]-.5,q[0]);b(.45,.45,.1,'*efd9a8',x,q[1]-.55,q[0]+.4)}});
  sb(.4,.4,16,'#2a2428',-17,16.4,-8);sb(.4,.4,16,'#2a2428',17,16.4,-8);

  /* ===== seating: 6 rows of upholstered seats, aisle, rail ===== */
  const seat=(x,z)=>{sb(1.05,.45,.9,'#6a1c2c',x,.3,z);sb(1.05,1,.18,'#6a1c2c',x,.95,z+.5);sb(1.1,.08,.95,C.gold,x,.56,z);sb(.1,.55,.9,'#2a1727',x-.55,.62,z);sb(.1,.55,.9,'#2a1727',x+.55,.62,z);sb(1.05,.12,.2,'#e8d6b0',x,1.5,z+.5)};
  const NS={you:[-4.1,3.2],rv:[[-6.3,3.2],[4.1,3.2],[6.3,3.2],[1.9,3.2]]},sk0=q=>q[0].toFixed(1)+','+q[1].toFixed(1),taken=new Set([NS.you].concat(NS.rv).map(sk0));
  const aud=[],seatsAt=[];
  /* centre aisle runner with gold edges and floor lights */
  sb(2.6,.04,26,'#a01c2e',0,.02,7.5);sb(2.8,.03,26.2,C.gold,0,.015,7.5);for(let k=0;k<12;k++)[-1,1].forEach(s=>sb(.14,.06,.5,'*c98a46',s*1.5,.05,3+k*1.9));
  const zs=[3.2,5.6,8,10.4,12.8,15.2];zs.forEach((z,ri)=>{for(let k=0;k<6;k++)[-1,1].forEach(s=>{const x=s*(1.9+k*2.2);seat(x,z);seatsAt.push([x,z])})});
  /* balconies down both sides: tier, front rail, gold cornice and standing guests behind the rail */
  [-1,1].forEach(s=>{sb(9,.6,40,'#2a1727',s*33.5,6.2,16);sb(.5,1.3,40,C.wine,s*29,7.1,16);sb(.7,.2,40,C.gold,s*29,7.85,16);for(let z=-2;z<=34;z+=4.5){sb(.9,6,.9,C.cream,s*29,3.1,z);sb(1.2,.4,1.2,C.gold,s*29,6.1,z)}
   sb(9,.4,40,'#1f1222',s*33.5,11,16);sb(.5,1.3,40,C.wine2,s*29,12,16);sb(.7,.2,40,C.gold,s*29,12.7,16);for(let z=-2;z<=34;z+=4.5)sb(.7,4.4,.7,C.cream,s*29,8.6,z)});
  /* chandeliers: turned brass stem, three rings and cream bulbs */
  [[0,6],[0,18],[0,30]].forEach(q=>{const ch=new THREE.Group();ch.position.set(q[0],19.4,q[1]);g.add(ch);
   const brass=M('#b8923a');ch.add(lat([[0,6],[.12,6],[.12,3.2],[.26,3],[.14,2.7],[.4,2.4],[.12,2],[0,2]],brass));
   [[2.8,3.6],[2,2.9],[1.1,2.4]].forEach(r=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r[0],.08,6,28),brass);t.rotation.x=Math.PI/2;t.position.y=r[1]-1.4;ch.add(t);for(let i=0;i<14;i++){const a=i/14*6.283;B(ch,.18,.3,.18,'*f0dcae',Math.cos(a)*r[0],r[1]-1.1,Math.sin(a)*r[0])}});
   const tw=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,6,4),M('#222'));tw.position.y=3.3;ch.add(tw)});

  /* ===== press platform with TV cameras at the back, exit doors ===== */
  sb(26,1,5,'#2a1727',0,.5,26);sb(26.4,.15,5.4,C.gold,0,1.05,26);
  [[-12,24.4],[12,24.4],[0,24.4]].forEach(q=>{sb(.1,1.5,.1,'#222',q[0],1.9,q[1]);sb(.9,.7,1.3,'#1c1c24',q[0],2.9,q[1]);sb(.4,.3,.5,'#0a0a10',q[0],2.9,q[1]-.9);sb(.5,.4,.05,'#d8d0c0',q[0],3.4,q[1]-.4)});
  [-1,1].forEach(s=>{sb(2.4,5.6,.4,'#3a2220',s*36.5,2.8,22);sb(2.6,.3,.6,C.gold,s*36.5,5.7,22);sb(1.8,.5,.1,'*37b36a',s*36.4,6.2,22)});
  /* camera operators' cameras on stands: tally lights blink in tick */
  const tally=[];[[-12,10],[12,10],[0,18]].forEach(q=>{sb(.1,1.6,.1,'#222',q[0],.8,q[1]);sb(.8,.6,1.2,'#1c1c24',q[0],1.9,q[1]);sb(.4,.3,.5,'#0a0a10',q[0],1.9,q[1]-.8);const t=b(.12,.12,.12,'*ff3030',q[0]+.3,2.25,q[1]-.5);tally.push(t)});
  /* flower urns */
  [-1,1].forEach(s=>{sb(1.6,1.4,1.6,C.plum2,s*13.6,.7,-1.6);sb(1.8,.12,1.8,C.gold,s*13.6,1.45,-1.6);for(let k=0;k<9;k++)b(.34,.34,.34,['#e88aa0','#f4ead8','#e8935a','#f0d078'][k%4],s*13.6+R(-.55,.55),R(1.6,2.5),-1.6+R(-.55,.55))});
  /* ON AIR */
  sb(3.6,.8,.3,'#701018',0,22.2,-14.9);b(3.2,.5,.1,'*e03030',0,22.2,-14.7);

  flush();

  /* ===== lights (the count never changes, so the shaders are never rebuilt) ===== */
  const L={amb:new THREE.AmbientLight(0xcfb6c4,.8),key:new THREE.PointLight(0xffc890,.55,80,1),rose:new THREE.PointLight(0xd8607c,.14,70,1),vio:new THREE.PointLight(0x8a7ae0,.12,70,1),rear:new THREE.PointLight(0xffe2c8,.14,80,1),sun:new THREE.DirectionalLight(0xff9a60,0)};
  L.key.position.set(0,12,-4);L.rose.position.set(-12,9,-6);L.vio.position.set(12,9,-6);L.rear.position.set(0,12,12);L.sun.position.set(-40,26,PZ-80);L.sun.target.position.set(0,0,PZ);g.add(L.sun.target);Object.values(L).forEach(l=>g.add(l));
  const spot=new THREE.SpotLight(0xffd8a8,.7,60,.5,.6,1);spot.position.set(0,18,6);const spT=new THREE.Object3D();spT.position.set(0,1,-8);g.add(spT);spot.target=spT;g.add(spot);
  const phase=(p)=>{const plaza=p=='plaza';L.amb.intensity=plaza?.45:.8;L.amb.color.setHex(plaza?0xc4a0b0:0xcfb6c4);L.key.intensity=plaza?0:.55;L.rose.intensity=plaza?0:.14;L.vio.intensity=plaza?0:.12;L.rear.intensity=plaza?0:.14;L.sun.intensity=plaza?.5:0;spot.intensity=plaza?0:.7;scene.background=new THREE.Color(plaza?0xe7936a:0x1a0e1e);A.plaza=plaza;sky.visible=plaza};

  /* ===== the red carpet plaza ===== */
  const pz=new THREE.Group();pz.position.set(0,0,PZ);g.add(pz);const pb=mkBatch(pz),psb=pb.sb,pbx=(w,h,d,c,x,y,z)=>B(pz,w,h,d,c,x,y,z);
  psb(120,.2,90,'#524652',0,-.1,22);psb(44,.2,20,'#443a46',0,-.09,36);
  for(let x=-40;x<40;x+=4)psb(.06,.02,90,'#463c48',x,.02,22);
  /* the hall facade seen from the carpet */
  psb(46,18,2,'#b6a684',0,9,-1);psb(48,1,3,C.gold,0,18.5,-.6);psb(46,.8,2.4,'#b6a584',0,.4,-.2);
  [-18,-12,-6,6,12,18].forEach(x=>{psb(1.4,14,1.4,'#cfc2a2',x,8,1.2);psb(2,.8,2,C.gold,x,1.2,1.2);psb(2,.8,2,C.gold,x,15.2,1.2)});
  psb(30,2.4,2.4,'#cfc2a2',0,16.4,1.2);psb(12,5.4,.4,'#2a0e16',0,3.4,.1);[-1,1].forEach(s=>{psb(5,4.6,.2,'#701a2a',s*3,3.2,.35);psb(4,3.4,.1,'#cbb8d0',s*3,3.8,.45)});
  for(let k=0;k<4;k++)psb(14-k*.8,.3,3.2-k*.5,'#d6c6a4',0,.15+k*.3,3.4+k*.7);
  psb(3.6,.06,26,'#a8182c',0,.06,16);psb(3.9,.04,26.2,C.gold,0,.04,16);
  [-1,1].forEach(s=>{for(let z=6;z<=28;z+=2.2){psb(.1,1,.1,C.gold2,s*2.4,.5,z);psb(.24,.07,.24,C.gold,s*2.4,.03,z);psb(.18,.14,.18,C.gold2,s*2.4,1.04,z);if(z<27)psb(.04,.05,2,'#8a1428',s*2.4,.88,z+1.1)}});
  /* step-and-repeat wall on the left: a field of logo tiles */
  const sr=ctex(cvs(256,128,(x,w,h)=>{x.fillStyle='#3a1420';x.fillRect(0,0,w,h);x.fillStyle='#4a1c2a';for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2==0)x.fillRect(c*32,r*16,32,16);
   for(let r=0;r<4;r++)for(let c=0;c<4;c++){const ox=c*64+(r%2?32:0)+16,oy=r*32+16;x.fillStyle='#b8923a';x.fillRect(ox+10,oy+13,12,2);x.fillRect(ox+14,oy+7,4,6);x.fillRect(ox+11,oy+3,10,4);x.fillRect(ox+9,oy+1,14,2)}
   x.strokeStyle='#b8923a';x.lineWidth=4;x.strokeRect(2,2,w-4,h-4)}),1);
  const srp=new THREE.Mesh(new THREE.PlaneGeometry(9,4.2),new THREE.MeshLambertMaterial({map:sr}));srp.position.set(-6.4,2.5,11);srp.rotation.y=Math.PI/2;pz.add(srp);psb(.3,.3,9.4,'#4a2c20',-6.55,.2,11);psb(.2,4.6,.2,'#2a2428',-6.4,2.5,6.2);psb(.2,4.6,.2,'#2a2428',-6.4,2.5,15.8);
  /* press riser on the right */
  psb(4,.5,12,'#2a2428',5.8,.25,11);psb(3,.5,12,'#2a2428',7.4,.75,11);psb(2,.5,12,'#2a2428',8.6,1.25,11);
  /* limo at the kerb and a street lamp each side */
  psb(2.4,.9,6.4,'#14121a',0,.9,34);psb(2.2,.6,3.4,'#14121a',0,1.6,34.4);psb(2.0,.5,3,'#8a8a96',0,1.62,34.4);psb(2.5,.2,6.5,'#0a0a0e',0,.4,34);[-1,1].forEach(s=>[-1,1].forEach(t=>psb(.3,.7,.7,'#0a0a0e',s*1.25,.35,34+t*2.1)));
  [-14,14].forEach(x=>{psb(.25,6,.25,'#2a2428',x,3,22);psb(1.2,.14,.14,'#2a2428',x-.5*(x>0?1:-1),6,22);psb(.5,.4,.5,'*e8c88a',x-1.1*(x>0?1:-1),5.8,22)});
  /* a distant skyline of dark blocks against the sky */
  const q2=awRng(901);for(let k=0;k<26;k++){const x=-120+k*9.5+q2()*3,h=10+q2()*26;psb(7+q2()*4,h,5,k%3?'#3a1d3c':'#2a1530',x,h/2,-50-q2()*8)}
  pb.flush();
  /* sky: gradient plane far behind the facade with the sun low behind the skyline */
  const skyT=ctex(sunsetArt(),1);const sky=new THREE.Mesh(new THREE.PlaneGeometry(420,170),new THREE.MeshBasicMaterial({map:skyT,fog:false}));sky.position.set(0,64,-66);pz.add(sky);
  /* press and fans */
  const flashes=[];
  const FTOP=[0,2,2,3,5,6,7,9],FBT=[0,0,0,3,2];
  const mkAudCfg=()=>{const cf={skin:Math.floor(rng()*SKIN.length),eyes:Math.floor(rng()*5),mouth:Math.floor(rng()*4),hair:Math.floor(rng()*12),hc:Math.floor(rng()*HAIRC.length),top:pk(FTOP),tc:Math.floor(rng()*TOPC.length),pc:Math.floor(rng()*PANTC.length),bt:pk(FBT),body:rng(),ac:-1};
   if(rng()<.4){cf.jk=Math.floor(rng()*JKC.length);if(rng()<.3)cf.jks=1+Math.floor(rng()*3)}if(rng()<.8&&typeof SHC!='undefined')cf.sh=Math.floor(rng()*SHC.length);return cf};
  const crowdP=[];
  for(let k=0;k<12;k++){const row=k%3,z=6+Math.floor(k/3)*3.2,x=5.8+row*1.6,y=row*.5+.5,c=buildChar(mkAudCfg());c.g.position.set(x,y,z+rng()*.6);c.g.rotation.y=-Math.PI/2+(rng()-.5)*.3;pz.add(c.g);c.arms[1].rotation.x=-2.5;c.ph=rng()*6;const cam=new THREE.Group();cam.position.set(0,0,0);B(c.arms[1],.14,.2,.1,'#111',0,-.55,.12);const fq=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),new THREE.MeshBasicMaterial({color:0xfff6e0,transparent:true,opacity:.9,depthWrite:false}));fq.position.set(x-.6,y+1.8,z);fq.rotation.y=-Math.PI/2;fq.visible=false;pz.add(fq);flashes.push(fq);crowdP.push(c)}
  for(let k=0;k<20;k++){const s=k%2?1:-1,z=18+Math.floor(k/2)*1.3,c=buildChar(mkAudCfg());c.g.position.set(s*(3.4+rng()*1.6),0,z);c.g.rotation.y=s>0?-Math.PI/2:Math.PI/2;pz.add(c.g);c.ph=rng()*6;c.arms[0].rotation.x=-2.7;crowdP.push(c)}
  /* ===== named people ===== */
  const mkP=(cfg,x,y,z,ry)=>{const c=buildChar(cfg);c.cfg=cfg;c.g.position.set(x,y,z);c.g.rotation.y=ry||0;g.add(c.g);return c};
  const setSeat=(c,on)=>{if(!c.sl){const cf=c.cfg||{},w=.42+(cf.body||0)*.5,pc=cf.pc_custom||PANTC[cf.pc]||'#2c3e50',sc2=cf.sh>=0&&typeof SHC!='undefined'&&SHC[cf.sh]?SHC[cf.sh][0]:'#1d1d22',sg=new THREE.Group();c.g.add(sg);c.sl=sg;
    [-1,1].forEach(s=>{const x=s*w*.26;B(sg,w*.44,.22,.72,pc,x,.51,.26);B(sg,w*.4,.5,.2,cf.bt==1||cf.bt==2?SKIN[cf.skin]||'#d99a6c':pc,x,.15,.52);B(sg,w*.44,.12,.34,sc2,x,-.04,.6)})}
   c.sl.visible=!!on;c.legs.forEach(l=>l.visible=!on);c.sat=on?1:0;c.g.position.y=on?.1:0;if(c.seat)c.g.position.z=c.seat[1]+(on?.15:0)},
   sit=c=>setSeat(c,1),stand=c=>setSeat(c,0);
  const mkAud=(x,z)=>{const cf=mkAudCfg(),c=buildChar(cf);c.g.position.set(x,0,z);c.g.rotation.y=Math.PI;g.add(c.g);c.cfg=cf;c.ph=rng()*6;c.so=rng();c.seat=[x,z];c.up=0;aud.push(c);setSeat(c,1)};
  seatsAt.forEach(q=>{if(!taken.has(sk0(q))&&rng()<.92)mkAud(q[0],q[1])});
  /* balcony guests: head and shoulders over the rail */
  [-1,1].forEach(s=>{for(let k=0;k<7;k++){const z=1+k*4.7+rng();const c=buildChar(mkAudCfg());c.g.position.set(s*30.6,6.5,z);c.g.rotation.y=Math.atan2(-s*30,-9-z);g.add(c.g);c.ph=rng()*6;c.so=rng();c.seat=[s*30.6,z];c.up=1;c.bal=1;aud.push(c)}});
  const you=mkP(ch,NS.you[0],0,NS.you[1],Math.PI);you.seat=NS.you;sit(you);you.name=YOU_NAME;
  const hc=AWHOST.map(cf=>buildChar(cf));const host=hc[0];let presA=hc[1],presB=hc[2];
  [[host,0,-8.9],[presA,-2.2,-8.6],[presB,2.2,-8.6]].forEach(q=>{q[0].g.position.set(q[1],.8,q[2]);g.add(q[0].g)});presA.g.visible=presB.g.visible=false;
  const reporter=buildChar({hair:5,hc:3,top:4,tc_custom:'#8a1f3d',pc_custom:'#1c1a22',skin:3,body:.3,hgt:.5,ac:-1,eyes:1,mouth:0});reporter.g.position.set(-3.2,0,10.2);reporter.g.rotation.y=Math.PI/2;pz.add(reporter.g);B(reporter.arms[1],.06,.2,.06,'#222',0,-.55,.2);B(reporter.arms[1],.1,.1,.1,'#cfd3d8',0,-.68,.2);reporter.arms[1].rotation.x=-1.2;
  const youP=buildChar(ch);youP.g.position.set(-3.2,0,11.6);youP.g.rotation.y=Math.PI/2;pz.add(youP.g);youP.arms[0].rotation.z=.1;
  /* performance rigs: one performer, band, dancers, drum kit and keyboard */
  const rig=new THREE.Group();g.add(rig);rig.visible=false;
  const kit=new THREE.Group();kit.position.set(-8.5,.8,-12.3);rig.add(kit);
  B(kit,3.4,.25,2.4,'#2a1727',0,.12,0);const bd=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.5,18),M('#a01c2e'));bd.rotation.x=Math.PI/2;bd.position.set(0,.62,.6);kit.add(bd);
  [[-.7,.95,.2],[.7,.95,.2]].forEach(q=>{const t=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.3,16),M('#a01c2e'));t.position.set(q[0],q[1],q[2]);kit.add(t)});const sn=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.2,16),M('#cfd3d8'));sn.position.set(-.3,.85,.6);kit.add(sn);
  [[-1.2,1.6,0],[1.2,1.5,.2]].forEach(q=>{const cy=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.03,16),M(C.gold2));cy.position.set(q[0],q[1],q[2]);kit.add(cy);B(kit,.04,q[1],.04,'#555',q[0],q[1]/2,q[2])});
  const keys2=new THREE.Group();keys2.position.set(8.5,.8,-12);rig.add(keys2);B(keys2,3,.14,.9,'#16121a',0,1.1,0);B(keys2,2.8,.06,.5,'#f0e8d8',0,1.2,.1);B(keys2,.1,1.1,.1,'#222',-1.2,.55,0);B(keys2,.1,1.1,.1,'#222',1.2,.55,0);
  const band={perf:null,drum:null,key:null,gtr:null,bass:null,d1:null,d2:null};
  const bandSet=(cfgs)=>{ /* rebuild the band with new look for each performance */
   ['perf','drum','key','gtr','bass','d1','d2'].forEach(k=>{if(band[k])rig.remove(band[k].g)});
   const mk=(cf,x,z,ry,y)=>{const c=buildChar(cf);c.g.position.set(x,y==null?.8:y,z);c.g.rotation.y=ry||0;rig.add(c.g);return c};
   band.perf=mk(cfgs.p,0,-9.4,0);band.drum=mk(pk(BANDCF),-8.5,-12.4,0);setSeat(band.drum,1);band.key=mk(pk(BANDCF),8.5,-12.8,0);
   band.gtr=mk(pk(BANDCF),-6.2,-8.2,.3);band.bass=mk(pk(BANDCF),6.2,-8.2,-.3);band.d1=mk(pk(BANDCF),-3.4,-6.6,0);band.d2=mk(pk(BANDCF),3.4,-6.6,0);
   B(band.gtr.g,.22,.9,.14,'#8a3a22',.15,.8,.35).rotation.z=.8;B(band.bass.g,.2,1.1,.12,'#2a2428',-.15,.8,.35).rotation.z=-.7;
   B(band.perf.g,.04,1.7,.04,'#9a9aa0',.55,.85,.4);B(band.perf.g,.14,.14,.14,'#222',.55,1.75,.4);};
  const BANDCF=[{hair:3,hc:1,top:2,tc:6,pc:4,skin:2,body:.4,hgt:.5,ac:-1,eyes:0,mouth:0},{hair:5,hc:0,top:4,tc:3,pc:4,skin:4,body:.3,hgt:.5,ac:-1,eyes:1,mouth:0},{hair:2,hc:2,top:2,tc:9,pc:5,skin:1,body:.5,hgt:.55,ac:-1,eyes:0,mouth:3},{hair:11,hc:3,top:4,tc:5,pc:4,skin:3,body:.35,hgt:.5,ac:-1,eyes:1,mouth:0},{hair:1,hc:10,top:2,tc:6,pc:4,skin:0,body:.45,hgt:.55,ac:-1,eyes:2,mouth:1}];
  /* shared trophy and the 'other category' winner */
  const wt=gramo(1.5),ocs=N.others.map(o=>{const c=buildChar(awCfg(o.n));c.g.visible=false;g.add(c.g);const ar=c.arms[1],tr=gramo(1.5);tr.position.set(ar.position.x,ar.position.y+.45,.05);c.g.add(tr);ar.rotation.x=-3.1;return c});let oc=ocs[0];
  const ptr=gramo(1.5);ptr.visible=false;
  /* confetti: flat paper in the dusk palette, falling */
  const NC=420,cp=new Float32Array(NC*3),cc=new Float32Array(NC*3),cv=new Float32Array(NC*3),cg=new THREE.BufferGeometry();let cn=0;
  cg.setAttribute('position',new THREE.BufferAttribute(cp,3));cg.setAttribute('color',new THREE.BufferAttribute(cc,3));const pts=new THREE.Points(cg,new THREE.PointsMaterial({size:.3,vertexColors:true,depthWrite:false}));pts.frustumCulled=false;g.add(pts);for(let i=0;i<NC;i++)cp[i*3+1]=-50;
  const confetti=k=>{for(let i2=0;i2<k;i2++){const i=cn++%NC,c=new THREE.Color(pk(['#d6b25a','#c4505a','#e8d6b0','#e08a3c','#8a6ac4','#f0e0c0']));cp[i*3]=R(-14,14);cp[i*3+1]=R(11,15);cp[i*3+2]=R(-12,10);cv[i*3]=R(-1,1);cv[i*3+1]=R(-3,-1.3);cv[i*3+2]=R(-1,1);cc[i*3]=c.r;cc[i*3+1]=c.g;cc[i*3+2]=c.b}};

  /* ===== wrapper UI ===== */
  const A={clap:0,cl:0,cheer:0,look:null,t:0,lt:0,si:0,li:0,typed:0,hold:0,stand:0,st:0,end:false,walk:null,free:null,lastClap:0,fade:1,plaza:false,perf:0,beat:0,bt:0};O.A=A;
  const wrap=document.createElement('div');wrap.id='awd';wrap.style.cssText='position:fixed;inset:0;z-index:50;pointer-events:none;font-family:"Silkscreen",ui-monospace,monospace';
  wrap.innerHTML=`<div id=awfade style="position:absolute;inset:0;background:#000;opacity:1;transition:opacity .8s"></div><div style="position:absolute;left:0;right:0;top:0;height:7%;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:7%;background:#000"></div>
  <div style="position:absolute;left:3%;top:9%;display:flex;gap:10px;align-items:center;font-size:clamp(11px,1.6vw,16px)"><span style="background:#a01c28;color:#fff;padding:3px 8px">LIVE</span><span id=awbug style="color:#e6c473;text-shadow:0 1px 3px #000">THE ${N.no}TH GRAMOPHONE AWARDS</span></div>
  <div id=awlow style="position:absolute;left:3%;bottom:19%;display:none;background:#1a0f1e;border-left:5px solid #c79a3e;padding:6px 14px 6px 12px;box-shadow:3px 3px 0 #0008"><div id=awlow1 style="color:#e6c473;font-size:clamp(12px,1.8vw,18px)"></div><div id=awlow2 style="color:#cbb99a;font:13px ui-monospace,monospace;margin-top:2px"></div></div>
  <div id=awcap style="position:absolute;left:50%;bottom:10%;transform:translateX(-50%);width:min(860px,92vw);box-sizing:border-box;background:rgba(21,12,26,.92);border:3px solid #b8923a;border-radius:3px;padding:10px 16px;pointer-events:auto;cursor:pointer;display:none"><div id=awwho style="color:#e6c473;font-size:clamp(11px,1.5vw,15px);margin-bottom:4px"></div><div id=awtxt style="color:#f4ead8;font:600 clamp(14px,2.1vw,22px)/1.35 ui-monospace,Menlo,Consolas,monospace;min-height:1.35em"></div><div style="text-align:right;color:#8a7a50;font-size:11px">click or space ▸</div></div>
  <button id=awskip style="position:absolute;right:3%;top:9%;pointer-events:auto;opacity:.85">Skip</button><div id=awres style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,4,14,.82);pointer-events:auto;overflow:auto"></div>`;
  document.body.appendChild(wrap);O.wrap=wrap;const $c=id=>wrap.querySelector('#'+id);
  const hint=document.createElement('div');hint.style.cssText='position:absolute;left:50%;bottom:11%;transform:translateX(-50%);max-width:92vw;background:rgba(21,12,26,.94);border:3px solid #b8923a;border-radius:3px;padding:10px 18px;color:#e6c473;font-size:clamp(12px,1.7vw,17px);text-align:center;display:none';wrap.appendChild(hint);
  const lower=(a,b2)=>{const l=$c('awlow');if(!a){l.style.display='none';return}l.style.display='block';$c('awlow1').textContent=a;$c('awlow2').textContent=b2||''};

  /* the big screen: sunset art with a dark plate for the text */
  const screen=(lines,tint)=>{const x=sc.getContext('2d'),W=1024,H=430;x.imageSmoothingEnabled=false;x.drawImage(SUNSET,0,0,W,H);x.fillStyle=tint||'rgba(18,8,26,.7)';x.fillRect(0,0,W,H);
   x.strokeStyle=C.gold2;x.lineWidth=5;x.strokeRect(16,16,W-32,H-32);x.strokeStyle='rgba(214,178,90,.5)';x.lineWidth=2;x.strokeRect(28,28,W-56,H-56);
   x.textAlign='center';lines.forEach(l=>{let fs=l[1];const f=()=>x.font=(l[3]||'bold ')+fs+'px Silkscreen,ui-monospace,monospace';f();while(x.measureText(l[0]).width>W-120&&fs>14){fs-=2;f()}x.fillStyle=l[2]||C.gold2;x.fillText(l[0],W/2,l[4])});tex.needsUpdate=true};
  const EQ=()=>{const x=sc.getContext('2d'),W=1024,H=430;x.imageSmoothingEnabled=false;x.drawImage(SUNSET,0,0,W,H);x.fillStyle='rgba(18,8,26,.35)';x.fillRect(0,0,W,H);
   for(let i=0;i<46;i++){const hh=30+Math.abs(Math.sin(A.t*3.1+i*.55)*Math.cos(A.t*1.7+i*.21))*190*(.6+.4*Math.sin(A.t*.8+i)),c=i%3?'#e08a3c':'#c4505a';x.fillStyle=c;x.fillRect(40+i*21,H-30-hh,15,hh)}
   x.fillStyle='rgba(18,8,26,.7)';x.fillRect(190,40,644,120);x.textAlign='center';x.fillStyle=C.gold2;x.font='bold 26px Silkscreen,monospace';x.fillText('LIVE PERFORMANCE',W/2,80);x.fillStyle='#f4ead8';let fs=50;x.font='bold '+fs+'px Silkscreen,monospace';const tt=(A.perf&&A.perf.n||'').toUpperCase();while(x.measureText(tt).width>600&&fs>20){fs-=2;x.font='bold '+fs+'px Silkscreen,monospace'}x.fillText(tt,W/2,138);tex.needsUpdate=true};

  /* ===== camera shots ===== */
  const seatCam=(q,u)=>({p:[q[0]+.5+Math.sin(u*.5)*.2,1.55,q[1]-3.1+u*.08],l:[q[0],1.2,q[1]]});
  const sh={
   wide:u=>({p:[0,5.6-u*.4,21-u*1.5],l:[0,5,-9]}),
   crane:u=>({p:[-10+u*20,12-u*5,24],l:[0,3,-8]}),
   podium:u=>({p:[.4+u*.3,2.7,-1.2-u*.3],l:[0,2.7,-8.2]}),
   stage:u=>({p:[-3+u*3,3.2,1.5],l:[0,2.6,-8.2]}),
   push:u=>({p:[0,2.6,1-u*2.4],l:[0,2.8,-8.2]}),
   crowd:u=>({p:[-4+u*8,2.4,-3.2],l:[0,1.7,10]}),
   hero:u=>({p:[4.2-u*2.4,2.6,-.2-u*.6],l:[1.8,2.6,-6.4]}),
   perf:u=>({p:[Math.sin(A.t*.35)*8,2.6+u*.6,1.2],l:[0,2.4,-9]}),
   perfLow:u=>({p:[-5+u*10,1.4,-2.4],l:[0,2.2,-9.5]}),
   balc:u=>({p:[-24,9.6-u*1.4,14-u*6],l:[0,4,-9]}),
   plazaW:u=>({p:[2.6+u*1.6,3+u*.4,PZ+25-u*3],l:[0,2.6,PZ+2]}),
   plazaY:u=>({p:[2.6,1.65,PZ+12.6-u*.3],l:[-4.2,1.5,PZ+10.8]}),
   plazaP:u=>({p:[-3.6,1.7,PZ+19],l:[6.6,1.7+u*.15,PZ+10]})};
  const fadeCut=()=>{const f=$c('awfade');f.style.transition='none';f.style.opacity=1;requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition='opacity .8s';f.style.opacity=0}))};

  /* ===== the script ===== */
  const S_=[],ST=s=>(S_.push(s),s),hn=()=>[host,presA,presB];
  const setPres=(n1,n2)=>{[presA,presB].forEach(p=>{if(p.cust)g.remove(p.g)});presA=buildChar(awCfg(n1));presB=buildChar(awCfg(n2));presA.cust=presB.cust=1;presA.g.position.set(-2.2,.8,-8.6);presB.g.position.set(2.2,.8,-8.6);g.add(presA.g);g.add(presB.g);host.g.visible=false;
   const ar=presB.arms[1];ptr.position.set(ar.position.x,ar.position.y+.45,.05);ptr.visible=false;presB.g.add(ptr)};
  const resetPres=()=>{presA.g.position.set(-2.2,.8,-8.6);presB.g.position.set(2.2,.8,-8.6);presB.g.rotation.y=0;ptr.visible=false;presB.arms[1].rotation.x=0};
  let nomChars=[];
  ST({min:16,lines:[['NINA OKAFOR · RED CARPET','We are live outside the Golden Hall on the biggest night in music, and the sun is setting on the red carpet.'],['NINA OKAFOR · RED CARPET','And look who is arriving: '+YOU_NAME+'! You are nominated in '+N.list.length+' categor'+(N.list.length==1?'y':'ies')+' tonight.'],[YOU_NAME,pk(['Honestly, I am just happy to be in the building.','I have been practising my smile in the mirror for a week.','Whatever happens, tonight I get to say I was here.'])],['NINA OKAFOR · RED CARPET','Best of luck. Go and find your seat!']],
   on:()=>{phase('plaza');screen([['',1,'#fff','',0]]);lower('Red carpet',X.ord(N.no)+' Gramophone Awards');you.g.visible=false;A.flash=1},
   line:i=>{},cam:u=>A.li>=2?sh.plazaY(u):A.li>=1?sh.plazaP(u):sh.plazaW(u),off:()=>{A.flash=0;lower(null);fadeCut()}});
  ST({min:6,lines:[[N.hosts[0]+' (host)','Good evening, and welcome to the '+X.ord(N.no)+' Gramophone Awards!']],on:()=>{phase('hall');you.g.visible=true;A.clap=1;confetti(140);screen([['THE '+N.no+'TH ANNUAL',60,C.gold2,'bold ',110],['GRAMOPHONE',112,'#f4ead8','bold ',230],['AWARDS',86,C.gold2,'bold ',328],['Live from the Golden Hall',28,'#cbb99a','',386]]);snd('chime');lower(null)},cam:u=>sh.crane(u)});
  ST({min:6,lines:[[N.hosts[0]+' (host)','Tonight, a song becomes a legend. Five nominees in every category and one trophy each. No pressure.'],[N.hosts[0]+' (host)','Please welcome tonight\'s opening performance: '+N.perf[0].n+'!']],on:()=>{A.clap=0;host.g.visible=true;screen([['TONIGHT\'S HOST',44,C.gold2,'bold ',140],[N.hosts[0].toUpperCase(),80,'#f4ead8','bold ',250]])},cam:u=>sh.podium(u)});

  const perfStep=(pi,dur)=>({min:dur,lines:[],
   on:()=>{const pr=N.perf[pi];A.perf=pr;pod.visible=false;A.clap=.15;host.g.visible=false;presA.g.visible=presB.g.visible=false;rig.visible=true;bandSet({p:awCfg(pr.n)});A.bt=0;A.beat=0;confetti(0)},
   tick:dt=>{const P=band;A.bt+=dt;const bt=60/104;
    while(A.bt>=bt){A.bt-=bt;A.beat++;const k=A.beat%8;
     if(k==0||k==3||k==4)sfx(110,.22,'sine',.2,42);if(k==2||k==6){nz(.14,2200,.22,1,'bandpass');}nz(.04,8000,.07,1,'highpass');if(A.beat%2)nz(.04,7000,.05,1,'highpass');
     sfx([55,55,73.4,82.4][Math.floor(A.beat/8)%4],.4,'triangle',.18);if(k==0)[220,277.2,329.6].forEach((f,i)=>sfx(f*[1,1,1.12,1.24][Math.floor(A.beat/8)%4],1.5,'triangle',.05))}
    const ph=A.t*6.8,bp=A.t*(104/60)*Math.PI*2;
    P.perf.g.position.y=.8+Math.abs(Math.sin(bp))*.07;P.perf.arms[0].rotation.x=Math.sin(bp)*.7-.3;P.perf.arms[1].rotation.x=-1.3+Math.sin(bp*.5)*.2;P.perf.arms[0].rotation.z=.2;P.perf.g.rotation.y=Math.sin(A.t*.7)*.25;
    P.drum.arms[0].rotation.x=-1.1+Math.sin(bp*2)*.5;P.drum.arms[1].rotation.x=-1.1-Math.sin(bp*2)*.5;P.drum.arms[0].rotation.z=.3;P.drum.arms[1].rotation.z=-.3;P.drum.g.position.y=.95;
    P.key.arms[0].rotation.x=P.key.arms[1].rotation.x=-1.2+Math.sin(bp*2+1)*.12;P.key.g.position.y=1.1;
    P.gtr.arms[1].rotation.x=-.9+Math.sin(bp*2)*.25;P.gtr.arms[0].rotation.x=-.6;P.gtr.g.rotation.y=.3+Math.sin(A.t*.8)*.2;P.gtr.g.position.y=.8+Math.abs(Math.sin(bp))*.05;
    P.bass.arms[1].rotation.x=-.8+Math.sin(bp)*.2;P.bass.arms[0].rotation.x=-.6;P.bass.g.rotation.y=-.3+Math.sin(A.t*.8+1)*.2;P.bass.g.position.y=.8+Math.abs(Math.sin(bp+1))*.05;
    [P.d1,P.d2].forEach((d,i)=>{const s2=i?-1:1;d.arms[0].rotation.x=-2.3+Math.sin(bp+i*1.5)*.5;d.arms[1].rotation.x=-2.3-Math.sin(bp+i*1.5)*.5;d.arms[0].rotation.z=.4;d.arms[1].rotation.z=-.4;d.legs[0].rotation.x=Math.sin(bp)*.4*s2;d.legs[1].rotation.x=-Math.sin(bp)*.4*s2;d.g.position.y=.8+Math.abs(Math.sin(bp+i))*.12;d.g.rotation.y=Math.sin(A.t*1.3+i*3)*.4});
    dr2.rotation.y=A.t*.25;if(Math.floor(A.t*8)!=A.eqf){A.eqf=Math.floor(A.t*8);EQ()}A.clap=.2+Math.min(.5,A.t/12);
    L.key.color.setHex([0xffc890,0xff9a6a,0xffd8a0][Math.floor(A.t/4)%3]);L.rose.intensity=.14+Math.sin(A.t*2)*.08;L.vio.intensity=.12+Math.cos(A.t*2)*.08;
    spT.position.set(Math.sin(A.t*.9)*5,1,-9+Math.cos(A.t*.6)*1.5)},
   off:()=>{rig.visible=false;pod.visible=true;A.perf=0;A.clap=1;confetti(120);L.key.color.setHex(0xffc890);host.g.visible=false;snd('chime')},
   cam:u=>[sh.perf,sh.perfLow,sh.balc,sh.perf][Math.floor(A.t/(dur/3.2))%4](u*3.2%1)});
  ST(perfStep(0,26));

  /* an award for someone else: presenters, envelope, winner walks up with the trophy, a short speech */
  const other=(o)=>{const k=N.others.indexOf(o);
   ST({min:7,lines:[[N.pres[k*2]+' & '+N.pres[k*2+1],'Presenting '+o.name+'. Every nominee was incredible.'],['','And the winner is...'],['',o.n+' takes it home for "'+o.t+'"!']],
    on:()=>{A.clap=0;host.g.visible=false;oc=ocs[k];ocs.forEach(c=>c.g.visible=false);setPres(N.pres[k*2],N.pres[k*2+1]);presA.g.visible=presB.g.visible=true;screen([['NOW PRESENTING',40,C.gold2,'bold ',120],[o.name.toUpperCase(),68,'#f4ead8','bold ',230]]);snd('ping');lower(o.name,'Presented by '+N.pres[k*2]+' and '+N.pres[k*2+1])},
    line:i=>{if(i==2){oc.g.visible=true;oc.g.position.set(1.8,.8,-6.2);screen([['AND THE WINNER IS',38,C.gold2,'bold ',100],[o.n.toUpperCase(),80,'#f4ead8','bold ',230],['"'+o.t+'"',38,C.gold2,'bold ',310]]);A.clap=1;confetti(70);snd('chime')}},
    off:()=>{oc.g.visible=false;A.clap=0;lower(null)},cam:u=>A.li>=2?sh.hero(u):sh.stage(u)})};

  /* a category you are nominated in */
  const catList=[];
  const cat=(c,last)=>{
   const win=c.win,youWin=!!win.you,k0=catList.length;catList.push(c);let cs=[],wc=null;const pa=N.pres[(k0*2+2)%N.pres.length],pb=N.pres[(k0*2+3)%N.pres.length]===pa?N.pres[(k0*2+4)%N.pres.length]:N.pres[(k0*2+3)%N.pres.length];
   const place=()=>{cs.forEach(q=>g.remove(q.g));cs=[];let ri=0;c.field.forEach(x=>{if(x.you){x.c=you;you.g.visible=true}else{const q=NS.rv[ri++];const ch2=buildChar(awCfg(x.n));ch2.cfg=awCfg(x.n);ch2.g.position.set(q[0],0,q[1]);ch2.g.rotation.y=Math.PI;ch2.seat=q;g.add(ch2.g);sit(ch2);ch2.ph=ri;x.c=ch2;cs.push(ch2)}});nomChars=[you].concat(cs)};
   const order=c.field.filter(x=>!x.you).concat(c.field.filter(x=>x.you));
   ST({min:4,lines:[[pa+' & '+pb,c.name+'. '+(last?'The one everybody argues about.':'Here are the nominees.')],...order.map(x=>['',(x.you?'Nominated: you, '+x.n+', for "'+x.t+'".':'Nominated: '+x.n+', "'+x.t+'".')])],
    on:()=>{A.clap=0;you.g.visible=true;host.g.visible=false;setPres(pa,pb);presA.g.visible=presB.g.visible=true;oc.g.visible=false;place();screen([[c.name.toUpperCase(),c.name.length>16?52:64,C.gold2,'bold ',150],['THE NOMINEES',44,'#f4ead8','bold ',240]]);lower(c.name,'Presented by '+pa+' and '+pb)},
    line:i=>{if(i>=1){const x=order[i-1];screen([[c.name.toUpperCase(),32,C.gold2,'bold ',70],[x.n.toUpperCase(),68,x.you?'#9ad8e8':'#f4ead8','bold ',185],['"'+x.t+'"',40,C.gold2,'bold ',255],['NOMINEE '+i+' OF '+order.length,24,'#cbb99a','',328]]);A.clap=.5;snd('pop')}},
    cam:u=>{const i=A.li;if(i<1)return sh.stage(u);return seatCam(order[i-1].c.seat,A.lt||0)}});
   ST({min:5,lines:[[pb,'The envelope, please...'],[pa,'And the winner is...']],on:()=>{A.clap=0;screen([['AND THE WINNER IS...',60,C.gold2,'bold ',230]],'rgba(30,6,14,.7)');for(let i=0;i<22;i++)nz(.09,200+i*10,.3,1,'lowpass',i*.14)},cam:u=>sh.push(u)});
   ST({min:4,lines:[['',(youWin?YOU_NAME:win.n)+'! "'+win.t+'"']],on:()=>{A.clap=1;A.stand=1;snd('chime');confetti(220);wc=win.c;screen([[c.name.toUpperCase(),32,C.gold2,'bold ',70],[win.n.toUpperCase(),78,'#f4ead8','bold ',185],['"'+win.t+'"',42,C.gold2,'bold ',270]],'rgba(60,14,40,.55)')},cam:u=>(u<.5?sh.crowd(u*2):seatCam(win.c.seat,u))});
   /* the walk up */
   const CS=[1.8,-6.2],stY=(x,z)=>z<-4.2?.8:Math.abs(x)<2.3?.8*Math.max(0,Math.min(1,(-2.9-z)/1.3)):0;
   const mk=new THREE.Group();mk.visible=false;g.add(mk);const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1.25,28),new THREE.MeshBasicMaterial({color:0xd6b25a,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;mk.add(ring);const arrow=b(.4,.4,.4,'#d6b25a',0,2.8,0,mk);arrow.rotation.z=Math.PI/4;
   const collect=()=>{A.free=null;mk.visible=false;hint.style.display='none';ptr.visible=false;presB.arms[1].rotation.x=0;presB.g.position.set(2.2,.8,-8.6);presB.g.rotation.y=0;wc.g.position.set(CS[0],.8,CS[1]);wc.g.rotation.y=0;grab();A.cheer=3.5;A.look=null;confetti(200);snd('chime');next()};
   const grab=()=>{const ar=wc.arms[1];wt.position.set(ar.position.x,ar.position.y+.45,.05);wc.g.add(wt);wt.visible=true;ar.rotation.x=-3.1;wc.arms[0].rotation.x=0;wc.legs.forEach(l=>l.rotation.x=0)};
   ST({min:7.5,lines:youWin?[]:[['',win.n+' makes the long walk up to the stage.']],
    on:()=>{A.clap=1;A.stand=1;stand(wc);wc.g.rotation.y=Math.PI;A.cheer=2;const q=wc.seat;presA.g.visible=presB.g.visible=true;
     if(youWin){A.free={x:q[0],z:q[1],ek:1};wc.g.position.set(q[0],0,q[1]);presA.g.position.set(-1.4,.8,-8.6);presB.g.position.set(3.4,.8,-6.2);presB.g.rotation.y=-Math.PI/2;presB.arms[1].rotation.x=-3.1;ptr.visible=true;mk.position.set(CS[0],.8,CS[1]);mk.visible=true;hint.style.display='block'}
     else{A.walk={P:[[q[0],1.3],[0,1.3],[0,-3.0],[0,-4.9],[1.8,-6.2]],k:0,d:0,pos:[q[0],q[1]]}}},
    tick:dt=>{mk.children[1].position.y=2.8+Math.sin(A.t*4)*.25;mk.children[1].rotation.y+=dt*2;mk.children[0].scale.setScalar(1+Math.sin(A.t*5)*.06);
     const f=A.free;if(f){const kd=k=>keys[k]?1:0;let dx=kd('d')+kd('arrowright')-kd('a')-kd('arrowleft'),dz=kd('s')+kd('arrowdown')-kd('w')-kd('arrowup');const mv=Math.hypot(dx,dz),oz=f.z,sp=(kd('shift')?5.2:3.4)*dt;
      const bad=(x,z)=>Math.abs(x)>33||z>30||z<-13.4||(z<-4.2&&Math.abs(x)>14)||(z<-4.2&&oz>=-4.2&&Math.abs(x)>2.3)||(z>=-4.2&&oz<-4.2&&Math.abs(x)>2.3)||(z<-7&&z>-9.4&&Math.abs(x)<1.7)||(Math.abs(Math.abs(x)-9.5)<1.4&&z<-9.9&&z>-12.7);
      if(mv){dx/=mv;dz/=mv;const nx=f.x+dx*sp,nz2=f.z+dz*sp;if(!bad(nx,f.z))f.x=nx;if(!bad(f.x,nz2))f.z=nz2;wc.g.rotation.y=Math.atan2(dx,dz)}
      const y=stY(f.x,f.z),ph=A.t*10;wc.g.position.set(f.x,y,f.z);wc.legs[0].rotation.x=mv?Math.sin(ph)*.7:0;wc.legs[1].rotation.x=mv?-Math.sin(ph)*.7:0;wc.arms[0].rotation.x=mv?-Math.sin(ph)*.6:-.4;wc.arms[1].rotation.x=mv?Math.sin(ph)*.6:.4;wc.arms[0].rotation.z=.12;wc.arms[1].rotation.z=-.12;
      A.look=[f.x,f.z];const d=Math.hypot(f.x-CS[0],f.z-CS[1]),near=d<1.8&&y>.7;hint.innerHTML=near?'Press <b>E</b> to collect your trophy':(f.z<-4.2?'Walk to the ring on the stage (WASD / arrows)':'Walk up to the stage: <b>WASD</b> or arrows (hold Shift to hurry), then take the steps in the middle');
      const ek=keys.e||keys[' ']||keys.enter;if(ek&&!f.ek&&near){collect();return}f.ek=ek?1:0;return}
     const w=A.walk;if(!w||w.done)return;let mv=2.7*dt;while(mv>0&&w.k<w.P.length){const t=w.P[w.k],dx=t[0]-w.pos[0],dz=t[1]-w.pos[1],dd=Math.hypot(dx,dz);if(dd<mv){w.pos=[t[0],t[1]];mv-=dd;w.k++}else{w.pos[0]+=dx/dd*mv;w.pos[1]+=dz/dd*mv;wc.g.rotation.y=Math.atan2(dx,dz);mv=0}}
     if(w.k>=w.P.length){w.done=1;wc.g.rotation.y=0;grab()}const z=w.pos[1];wc.g.position.set(w.pos[0],.8*Math.max(0,Math.min(1,(-2.9-z)/1.1)),z);const ph=A.t*9;if(!w.done){wc.legs[0].rotation.x=Math.sin(ph)*.6;wc.legs[1].rotation.x=-Math.sin(ph)*.6;wc.arms[0].rotation.x=-Math.sin(ph)*.5;wc.arms[1].rotation.x=Math.sin(ph)*.5}A.look=[w.pos[0],w.pos[1]]},
    done:()=>A.walk&&A.walk.done,off:()=>{mk.visible=false;hint.style.display='none';A.look=null},
    cam:u=>{const f=A.free;if(f){const y=stY(f.x,f.z);return{p:[f.x*.7,2.9+y*.8,f.z+5.2],l:[f.x*.9,1.5+y,f.z-3.4]}}const w=A.walk,p=w?w.pos:[0,0];return{p:[p[0]+3.6,2.8,p[1]-4.6],l:[p[0],1.2,p[1]]}}});
   /* the speech */
   const sp=youWin?(last?[[YOU_NAME,'Thank you. I... wow. I really did not write a speech.'],[YOU_NAME,'To everyone who streamed, shared and sang along: this one is yours too.'],[pa,c.name+'. Congratulations!']]:[[YOU_NAME,pk(['Thank you so much. I did not expect this one.','This is unreal. Thank you to everyone who listened.'])],[pa,c.name+'. Congratulations!']])
     :[[win.n,pk(['I am honestly speechless. Thank you to my team, my family and the fans.','Wow. Thank you, Gramophone Academy. This means everything.'])],[pa,c.name+'. Congratulations!']];
   ST({min:last?12:7,lines:sp,on:()=>{A.clap=1;A.stand=1;presA.g.visible=presB.g.visible=true;presA.g.position.set(-1.4,.8,-8.6);presB.g.position.set(2.2,.8,-8.6);presB.g.rotation.y=0;ptr.visible=false;A.look=null;wc.g.position.set(1.8,.8,-6.2);wc.g.rotation.y=0;if(!wt.parent||wt.parent!==wc.g)grab();wt.visible=true;confetti(200);snd('chime');screen([['CONGRATULATIONS',66,C.gold2,'bold ',160],[win.n.toUpperCase(),66,'#f4ead8','bold ',270]],'rgba(60,14,40,.55)');lower(win.n+(youWin?' (you)':''),c.name)},
    line:i=>{if(i>=1)confetti(90)},
    off:()=>{if(!last){wt.visible=false;wc.g.remove(wt);wc.arms[1].rotation.x=0;wc.arms[0].rotation.x=0;wc.g.rotation.y=Math.PI;wc.seat&&wc.g.position.set(wc.seat[0],0,wc.seat[1]);sit(wc);A.clap=.4;A.stand=0}lower(null);if(!last)cs.forEach(q=>{if(q!==you)q.g.visible=false})},cam:u=>sh.hero(u)});
  };
  /* ===== order of the night ===== */
  const bna=N.list.find(c=>c.id=='bna'),alb=N.list.find(c=>c.id=='alb'),roty=N.list.find(c=>c.id=='roty'),soty=N.list.find(c=>c.id=='soty');
  other(N.others[0]);
  [bna,alb].forEach(c=>c&&cat(c,0));
  other(N.others[1]);
  if(roty)cat(roty,0);
  other(N.others[2]);
  ST(perfStep(1,24));
  ST({min:5,lines:[[N.hosts[0]+' (host)','And now, the moment the whole night has been building to.'],[N.hosts[0]+' (host)','Song of the Year.']],on:()=>{A.clap=.6;host.g.visible=true;presA.g.visible=presB.g.visible=false;oc.g.visible=false;screen([['SONG OF THE YEAR',72,C.gold2,'bold ',180]],'rgba(30,6,14,.7)');lower(null)},cam:u=>sh.podium(u)});
  cat(soty,1);
  ST({min:3.4,lines:[['',(soty.win.you?'You slip out through the side door, trophies in hand...':'You slip out through the side door...')]],on:()=>{A.clap=.5;A.out=1},cam:u=>sh.wide(1-u)});

  /* ===== engine ===== */
  const go=i=>{if(S_[A.si]&&S_[A.si].off)S_[A.si].off();A.si=i;A.t=0;A.li=0;A.typed=0;A.hold=-1;A.lt=0;A.eqf=-1;const s=S_[i];s.on&&s.on();if(s.line)s.line(0);if(s.lines.length){$c('awcap').style.display='block';awLine()}else $c('awcap').style.display='none'};
  const awLine=()=>{const s=S_[A.si],l=s.lines[A.li];if(!l)return;$c('awwho').textContent=l[0]||'';A.typed=0;A.hold=-1};
  const next=()=>{if(A.si>=S_.length-1)return finish();go(A.si+1)};
  const adv=()=>{if(A.end)return;const s=S_[A.si],l=s.lines[A.li];if(l&&A.typed<l[1].length){A.typed=l[1].length;return}if(A.li<s.lines.length-1){A.li++;if(s.line)s.line(A.li);awLine()}else if(!(s.done&&!s.done())&&A.t>1)next()};
  const finish=()=>{if(A.end)return;A.end=true;A.clap=0;A.free=null;hint.style.display='none';rig.visible=false;lower(null);const A2=awS();
   const tot={money:0,fol:0,str:0},wins=[];
   N.list.forEach(c=>{if(c.won){const r=X.reward(c);tot.money+=r.money;tot.fol+=r.fol;tot.str+=r.str;wins.push(c.name)}});
   A2.hist.push({day:S.day,no:N.no,won:wins.length>0,w:soty.win.n,sc:soty.me,top:soty.win.sc,wins});
   try{autoSave()}catch(e){}
   const sec=N.list.map(c=>{const rows=c.field.map((x,i)=>`<tr style="${x.you?'color:#9ad8e8;font-weight:bold':''}"><td>${i+1}</td><td>${esc(x.n)}</td><td style="opacity:.8">${esc(x.t)}</td><td align=right>${x.sc}</td></tr>`).join('');
    return`<div style="margin:10px 0 0;text-align:left"><div style="color:${c.won?'#e6c473':'#cbb99a'};font:bold 14px Silkscreen,monospace;margin-bottom:3px">${c.won?'WON · ':''}${c.name.toUpperCase()}</div><table style="width:100%;border-collapse:collapse;font:13px ui-monospace,monospace"><tr style="opacity:.55"><td></td><td>Artist</td><td>Entry</td><td align=right>Score</td></tr>${rows}</table></div>`}).join('');
   const prize=wins.length?`<p style="margin:10px 0 0;font:14px/1.5 ui-monospace,monospace;color:#efe2c8">${wins.length} Gramophone Trophy${wins.length==1?'':' trophies'} added to Storage.<br>Prize money <b>${$$(tot.money)}</b> · <b>+${tot.fol.toLocaleString()}</b> followers · <b>+${tot.str.toLocaleString()}</b> streams on your winning entries.</p>`:`<p style="margin:10px 0 0;font:14px/1.5 ui-monospace,monospace;color:#cbb99a">Not this year. A better mixed song with more streams gives you a shot. The next ceremony is in 30 days.</p>`;
   const r=$c('awres');r.style.display='flex';$c('awcap').style.display='none';
   r.innerHTML=`<div style="background:#150c1a;border:3px solid #b8923a;border-radius:4px;padding:20px 26px;max-width:min(640px,94vw);max-height:92vh;overflow:auto;color:#f4ead8;text-align:center;margin:auto"><h2 style="color:#e6c473;margin:0 0 4px">${soty.won?'SONG OF THE YEAR IS YOURS!':wins.length?'YOU TOOK HOME '+wins.length+' AWARD'+(wins.length==1?'':'S'):'The '+X.ord(N.no)+' Gramophone Awards'}</h2>${soty.won?'':'<div style="opacity:.85;margin-bottom:2px">Song of the Year: '+esc(soty.win.n)+'</div>'}${prize}${sec}<button id=awlv class=go style="margin-top:16px;padding:10px 22px;font-size:15px">Leave</button></div>`;
   $c('awlv').onclick=()=>window.awEnd(wins.length>0)};
  O.S_=S_;O.kd=e=>{if(A.end)return;if(A.free)return;if([' ','Enter','ArrowRight'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();adv()}else if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();finish()}};
  addEventListener('keydown',O.kd,true);$c('awcap').onclick=adv;$c('awskip').onclick=()=>finish();
  /* clapping */
  const clapArms=(p,k,cheer)=>{const ph=A.t*17+(p.ph||0)*3,m=(Math.sin(ph)+1)/2;
   if(cheer){const w=Math.sin(A.t*8+p.ph)*.25;p.arms[0].rotation.x=p.arms[1].rotation.x=-2.75+w;p.arms[0].rotation.z=.25+w*.5;p.arms[1].rotation.z=-.25-w*.5;return}
   const pit=-.35+(-1.05)*Math.min(1,k*1.6),zz=.12+m*.62*Math.min(1,k*1.6);p.arms[0].rotation.x=p.arms[1].rotation.x=pit-m*.12*k;p.arms[0].rotation.z=zz;p.arms[1].rotation.z=-zz};
  O.tick=dt=>{A.t+=dt;A.lt+=dt;const s=S_[A.si];if(!s)return;
   const l=s.lines[A.li];if(l&&!A.end){if(A.typed<l[1].length){A.typed=Math.min(l[1].length,A.typed+dt*46);$c('awtxt').textContent=l[1].slice(0,Math.floor(A.typed))}else{$c('awtxt').textContent=l[1];if(A.hold<0)A.hold=.9+l[1].length*.03;A.hold-=dt;if(A.hold<=0){if(A.li<s.lines.length-1){A.li++;if(s.line)s.line(A.li);awLine()}else A.hold=0}}}
   if(!A.end&&(s.lines.length?(A.li>=s.lines.length-1&&l&&A.typed>=l[1].length&&A.hold<=0):true)&&A.t>=s.min&&!(s.done&&!s.done()))next();
   if(s.tick)s.tick(dt);
   const u=Math.min(1,A.t/(s.min||5)),shot=s.cam(u,s);const C2=O.cam;C2.aspect=aspect();C2.updateProjectionMatrix();C2.position.set(O.ox+shot.p[0],shot.p[1],O.oz+shot.p[2]);C2.lookAt(O.ox+shot.l[0],shot.l[1],O.oz+shot.l[2]);
   /* crowd */
   const tc=A.clap,ts=A.stand;A.cl+=(tc-A.cl)*Math.min(1,dt*4);A.st+=(ts-A.st)*Math.min(1,dt*3);
   aud.forEach(p=>{const cl=A.cl;if(p.bal){clapArms(p,cl,A.cheer>0||(A.perf&&cl>.3));return}
    const up=A.st>.25+p.so*.6;if(up!=!!p.up){p.up=up?1:0;setSeat(p,!up)}
    const cheer=A.cheer>0?1:0,hop=up?Math.abs(Math.sin(A.t*(cheer?9:5)+p.ph))*(cheer?.16:.05)*Math.max(.3,cl):0;p.g.position.y=(up?0:.1)+hop;
    clapArms(p,cl,cheer);
    if(A.look){const dx=A.look[0]-p.seat[0],dz=A.look[1]-p.seat[1],ty=Math.atan2(dx,dz),d=ty-p.g.rotation.y;p.g.rotation.y+=Math.atan2(Math.sin(d),Math.cos(d))*Math.min(1,dt*3)*(up?1:.5)}else{const d=Math.PI-p.g.rotation.y;p.g.rotation.y+=Math.atan2(Math.sin(d),Math.cos(d))*Math.min(1,dt*3)}});
   A.cheer=Math.max(0,(A.cheer||0)-dt);
   nomChars.forEach(c=>{if(c.sat)clapArms(c,A.cl,A.cheer>0)});
   hn().forEach(h=>{if(h.g.visible&&!(h===presB&&ptr.visible)&&!rig.visible){const k=A.cl;if(k>.4)clapArms(h,k,0);else{h.arms[0].rotation.x=h.arms[1].rotation.x=0;h.arms[0].rotation.z=h.arms[1].rotation.z=0}}});
   /* plaza: reporter, you, photographers */
   if(A.plaza){crowdP.forEach(c=>{c.arms[0].rotation.z=.15+Math.sin(A.t*3+c.ph)*.08;if(c.arms[0].rotation.x<-2)c.arms[0].rotation.x=-2.7+Math.sin(A.t*4+c.ph)*.25;c.g.position.y+=0});
    flashes.forEach((f,i)=>{f.visible=A.flash&&((Math.sin(A.t*13+i*7.3)>.985)||(Math.random()<.004))});reporter.arms[1].rotation.x=-1.25+Math.sin(A.t*2)*.05;youP.arms[1].rotation.x=Math.sin(A.t*1.4)*.06}
   tally.forEach((t,i)=>{t.visible=((A.t*1.2+i*.3)%1)<.8});
   /* lights */
   if(!A.perf){L.key.intensity=A.plaza?0:.55+Math.sin(A.t*2)*.05;spT.position.x+=((A.free?A.free.x:A.walk&&!A.walk.done?A.walk.pos[0]:0)-spT.position.x)*Math.min(1,dt*4);spT.position.z+=((A.free?A.free.z:A.walk&&!A.walk.done?A.walk.pos[1]:-8.5)-spT.position.z)*Math.min(1,dt*4)}
   for(let i=0;i<NC;i++){const j=i*3;if(cp[j+1]>-40){cp[j]+=cv[j]*dt;cp[j+1]+=cv[j+1]*dt;cp[j+2]+=cv[j+2]*dt;cv[j]+=Math.sin(A.t*3+i)*dt;if(cp[j+1]<0)cp[j+1]=-50}}cg.attributes.position.needsUpdate=true;cg.attributes.color.needsUpdate=true;
   /* applause */
   const ca=O.clapA;if(ca&&!O.clapFail){const v=(typeof FX!='undefined'&&!FX)?0:Math.min(1,A.cl*.85+(A.cheer>0?.15:0));ca.volume=Math.max(0,Math.min(1,v*(A.perf?.5:1)));if(v>.04&&ca.paused)ca.play().catch(()=>{});else if(v<=.03&&!ca.paused)ca.pause()}
   else{A.lastClap-=dt;if(A.cl>.2&&A.lastClap<=0){A.lastClap=.07;nz(.06,1800+R(0,2400),.2*A.cl,1,'bandpass')}}
   const f=$c('awfade');if(A.si==0&&A.t<.8)f.style.opacity=1-A.t/.8;else if(A.out)f.style.opacity=Math.min(1,A.t/2.8)};
  try{O.clapA=new Audio('audio/applause.mp3');O.clapA.loop=true;O.clapA.volume=0;O.clapA.onerror=()=>{O.clapFail=1}}catch(e){O.clapFail=1}
  return go}

 /* leave: tidy up, back into the lobby */
 window.awEnd=function(won){const O=AWC;try{if(O.clapA){O.clapA.pause();O.clapA=null}}catch(e){}removeEventListener('keydown',O.kd,true);if(O.wrap)O.wrap.remove();if(O.g){O.g.traverse(o=>{if(o.geometry&&o.geometry.type!=='BoxGeometry')o.geometry.dispose();const m=o.material;if(m&&m.map&&!m.map.__keep)m.map.dispose()});scene.remove(O.g)}if(O.hid){O.hid.forEach(o=>o.visible=true);O.hid=null}if(O.lt){O.lt.forEach(o=>o.visible=true);O.lt=null}O.on=0;scene.background=O.bg;if(O.fog!==undefined)scene.fog=O.fog;$('hud').style.display=O.hud;AWP=null;mode='play';
  try{if(IN)leaveShop()}catch(e){}if(won)say('Your Gramophone Trophies are in Storage.');try{autoSave()}catch(e){}};
})();
