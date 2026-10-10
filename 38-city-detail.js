/* ===== v26.17: a more detailed town and city =====
   Everything here is built right after the v26.11 road warp (31-wide-roads.js), in final world coordinates, as static
   boxes that join the merged SB city meshes (no extra draw calls per object). Text (shop signs, street names) goes into
   one shared texture atlas and one mesh. Nothing here adds a collider, moves a building or touches car paths.
   - roads: kerbs, paving joints, edge lines, centre dashes redrawn at their real size (the warp used to stretch the ones
     near junctions), zebra crossings and stop lines at every junction arm
   - pavements: street lamps, bins, hydrants, benches, trees, planters, bike racks, bus stops, street-name signs
   - houses: the front fence, gate path, mailbox and flowers are rebuilt on the property line (the warp had pushed them
     onto the pavement and stretched the path), plus window frames, shutters, door step, porch light, gutters
   - city towers: shop windows, awnings, signs, ledges, roof caps, parapets, AC units, water tanks, stair huts
   - maps: mapPaint() draws parks, water, fields, pavements, centre lines, building footprints, trees and road names */
const CTD={hse:[],shop:[],tree:[],hfp:[],areas:[],trees:[],done:0};
const RW2=ROAD_W/2,PO=RW2+PAVE_W,JE=BAND*ROAD_K+.2;
/* street names, keyed by each road's layout centre line */
const RNAME={h:[[16.2,'Fern Road'],[34.5,'Maple Lane'],[72,'Oak Street'],[-40,'North Street'],[60,'Market Street'],[100,'Harbour Road']],v:[[-64,'West Lane'],[200,'Park Avenue'],[400,'Mill Road'],[490,'1st Avenue'],[530,'2nd Avenue'],[570,'3rd Avenue'],[610,'4th Avenue']]};
function roadName(v,c){const f=v?WX:WZ;let b='',bd=3;(v?RNAME.v:RNAME.h).forEach(q=>{const d=Math.abs(f(q[0])-c);if(d<bd){bd=d;b=q[1]}});return b}

/* record houses, shops and trees while the layout is built; drop the old house front-yard boxes (rebuilt later) */
{const h0=house;house=function(cx,zf,w,d,h,wl,rf){const L0={};for(const k in SBC)L0[k]=SBC[k].length;h0(cx,zf,w,d,h,wl,rf);
 for(const k in SBC){const L=SBC[k];for(let j=L.length-1;j>=(L0[k]||0);j--){const e=L[j];if(e[6]-zf>.3&&e[5]<1.2&&(e[3]=='#eee'||e[3]=='#b9b5ab'||e[0]<.5))L.splice(j,1)}}
 CTD.hse.push({cx,zf,w,d,h,wl,rf})}}
{const t0=tree;tree=function(x,z,s){CTD.tree.push([x,z]);t0(x,z,s)}}
{const m0=mkShop;mkShop=function(cx,k,...a){CTD.shop.push({cx,k});return m0(cx,k,...a)}}

/* ---- text atlas: one canvas, one mesh ---- */
const SGN={rows:[],idx:{},q:[],RH:48};
function sgnRow(t){if(SGN.idx[t]==null){SGN.idx[t]=SGN.rows.length;SGN.rows.push(t)}return SGN.idx[t]}
const sgnCv=document.createElement('canvas').getContext('2d');
/* width of a text quad of height h */
function sgnW(t,h){sgnCv.font='bold 32px monospace';return h*Math.min(512,sgnCv.measureText(t).width+20)/SGN.RH}
/* f: 'z' faces +z, 'x' faces +x; centre x,y,z; height h */
function sgnQuad(t,f,x,y,z,h){SGN.q.push([sgnRow(t),f,x,y,z,sgnW(t,h),h])}
function sgnFlush(){if(!SGN.q.length)return;const H=Math.pow(2,Math.ceil(Math.log2(SGN.rows.length*SGN.RH))),cv=document.createElement('canvas');cv.width=512;cv.height=H;const g=cv.getContext('2d');
 g.font='bold 32px monospace';g.textBaseline='middle';g.lineJoin='round';const U=[];
 SGN.rows.forEach((t,i)=>{const w=Math.min(512,g.measureText(t).width+20),y=i*SGN.RH+SGN.RH/2;g.lineWidth=6;g.strokeStyle='#111';g.strokeText(t,10,y,492);g.fillStyle='#fff';g.fillText(t,10,y,492);U[i]=w/512});
 const n=SGN.q.length,P=new Float32Array(n*12),UV=new Float32Array(n*8),I=[];
 SGN.q.forEach(([r,f,x,y,z,w,h],j)=>{const v1=1-r*SGN.RH/H,v0=1-(r+1)*SGN.RH/H,a=w/2,b=h/2,p=f=='z'?[x-a,y-b,z,x+a,y-b,z,x+a,y+b,z,x-a,y+b,z]:[x,y-b,z+a,x,y-b,z-a,x,y+b,z-a,x,y+b,z+a];
  P.set(p,j*12);UV.set([0,v0,U[r],v0,U[r],v1,0,v1],j*8);const k=j*4;I.push(k,k+1,k+2,k,k+2,k+3)});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('uv',new THREE.BufferAttribute(UV,2));geo.setIndex(I);geo.computeBoundingSphere();
 const t=new THREE.CanvasTexture(cv);t.anisotropy=4;scene.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:t,alphaTest:.5,side:THREE.DoubleSide})))}

/* ---- builders (final world coordinates) ---- */
const FLW=['#ff6ad5','#ffe066','#fff','#ff8a30','#e03a3a','#b07aff'],GRN=['#2e7d32','#388e3c','#2d6a30','#43a047'];
function cdHouse(o){const{w,d,h,rf}=o,X=WX(o.cx),Zf=WZ(o.zf);CTD.hfp.push([X-w/2,Zf-d,X+w/2,Zf,rf]);
 const rd=RH.find(r=>r[0]>Zf&&r[0]-Zf<14&&X>r[1]&&X<r[2]),PE=rd?rd[0]-PO:Zf+.5,gd=w>=7?X+w*.28:null,f=Zf+.05;
 /* facade: window frames, shutters, sills */
 const sh=pick(['#2f4f3a','#24384f','#2a2a2e',dk(rf,.8),'#f2efe8']),wx=w>=4?[-w*.3,w*.3]:[],wy=h>3?[1.3,h-1]:[1.3];
 wy.forEach(y=>wx.forEach(x=>{if(gd!=null&&x>0&&y<2)return;const c=X+x,yy=y+.1;SB(.06,.8,.03,'#fff',c,yy,f+.04);SB(.8,.06,.03,'#fff',c,yy,f+.04);SB(.96,.1,.12,'#e8e4dc',c,yy+.45,f+.02);
  if(sh!='#f2efe8'){SB(.22,.84,.05,sh,c-.53,yy,f+.01);SB(.22,.84,.05,sh,c+.53,yy,f+.01)}}));
 /* side windows on the east wall (the camera side) */
 if(d>=4)[1.4].concat(h>3?[h-.9]:[]).forEach(y=>{SB(.1,.75,.8,'#bfe3ff',X+w/2+.04,y,Zf-d/2);SB(.18,.08,.95,'#fff',X+w/2+.06,y-.42,Zf-d/2)});
 /* door frame, knob, step, porch light, house number, gutter and downpipe */
 SB(1.12,1.74,.06,'#f0ece4',X,.87,Zf+.02);SB(.08,.08,.08,'#e6b422',X+.3,.8,Zf+.12);SB(1.5,.1,.42,'#bdb6aa',X,.05,Zf+.21);
 SB(.12,.2,.12,'#ffe9a8',X+.72,1.55,f+.04);SB(.04,.04,.1,'#333',X+.72,1.45,f+.02);SB(.26,.18,.03,'#2a2a2e',X-.75,1.55,f+.01);
 SB(w+.5,.1,.12,'#7d8288',X,o.h+.02,Zf+.31);SB(.08,o.h,.08,'#7d8288',X+w/2-.12,o.h/2,f+.03);
 if(Math.random()<.25)SB(.06,1.2,.06,'#555',X-w*.25,o.h+1.3,Zf-d/2);
 /* garage door panels and driveway */
 if(gd!=null){[.45,.85,1.25].forEach(y=>SB(2.1,.04,.03,'#80868e',gd,y,f+.06));SB(2.4,.03,PE-Zf,'#9a9a96',gd,0,(Zf+PE)/2)}
 /* gate path, fence/hedge/wall on the property line, mailbox, flowers */
 SB(1,.03,PE-Zf,'#cfc8bb',X,0,(Zf+PE)/2);const gaps=[[X-.6,X+.6]];if(gd!=null)gaps.push([gd-1.25,gd+1.25]);
 const x0=X-w/2-.4,x1=X+w/2+.4,runs=[];let a=x0;gaps.sort((p,q)=>p[0]-q[0]).forEach(g=>{if(g[0]>a)runs.push([a,g[0]]);a=Math.max(a,g[1])});if(a<x1)runs.push([a,x1]);
 const ft=Math.random(),fz=PE-.1;runs.forEach(([p,q])=>{const L=q-p,m=(p+q)/2;if(L<.15)return;
  if(ft<.45){SB(L,.06,.04,'#f4f1ea',m,.2,fz);SB(L,.06,.04,'#f4f1ea',m,.42,fz);for(let x=p+.04;x<=q;x+=.42)SB(.07,.55,.07,'#f4f1ea',x,.27,fz)}
  else if(ft<.75)SB(L,.55,.32,pick(['#2d6a30','#2e7d32','#356b2c']),m,.28,PE-.2);
  else{SB(L,.36,.18,'#b5a99a',m,.18,fz);SB(L,.06,.24,'#d0c8bc',m,.39,fz)}});
 gaps.forEach(g=>[g[0],g[1]].forEach(x=>{if(x>x0&&x<x1)SB(.14,.7,.14,ft<.45?'#f4f1ea':'#9c9183',x,.35,fz)}));
 SB(.07,.7,.07,'#3a3a3a',X+.95,.35,PE-.28);SB(.28,.24,.4,pick(['#c0392b','#2d5a8d','#2a2a2e','#2f8f5a']),X+.95,.78,PE-.28);
 for(let x=x0+.3;x<x1-.2;x+=.45){if(Math.abs(x-X)<.75||(gd!=null&&Math.abs(x-gd)<1.3)||Math.random()<.35)continue;SB(.2,.2,.2,Math.random()<.4?pick(GRN):pick(FLW),x,.1,Zf+.27)}}

/* merge boxes [w,h,d,colour,x,y,z] into one geometry (camera-facing faces only, like flushSB) */
function boxGeo(L){const cc=new THREE.Color(),N=L.length,Pp=new Float32Array(N*36),Nr=new Float32Array(N*36),Cl=new Float32Array(N*36),I=new Uint32Array(N*18);let v=0,ii=0;
 L.forEach((b,n)=>{const j=1+(n*7919%8)*.0004+.0002;cc.set(b[3]);FDV.forEach(f=>{const b0=v/3;f[1].forEach(q=>{Pp[v]=b[4]+q[0]*b[0]*j/2;Pp[v+1]=b[5]+q[1]*b[1]*j/2;Pp[v+2]=b[6]+q[2]*b[2]*j/2;Nr[v]=f[0][0];Nr[v+1]=f[0][1];Nr[v+2]=f[0][2];Cl[v]=cc.r;Cl[v+1]=cc.g;Cl[v+2]=cc.b;v+=3});I.set([b0,b0+1,b0+2,b0,b0+2,b0+3],ii);ii+=6})});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(Pp,3));g.setAttribute('normal',new THREE.BufferAttribute(Nr,3));g.setAttribute('color',new THREE.BufferAttribute(Cl,3));g.setIndex(new THREE.BufferAttribute(I,1));g.computeBoundingSphere();return g}
/* tall towers between the camera and you were sliced diagonally by the camera's near plane (-20): push it back */
cam.near=-80;cam.updateProjectionMatrix();
{const f0=fadeT;fadeT=function(dt){f0(dt);CT.forEach(c=>{if(c.dm){c.dm.opacity=c.mat.opacity;c.dm.depthWrite=c.mat.depthWrite}})}}
/* tower details are one mesh per tower whose material follows the tower's see-through fade (19-v6...js fadeT),
   so a faded tower does not leave its ledges, roof and shop front hanging in front of you */
function cdTower(c){const T=[],tb=(...a)=>T.push(a),w=c.x1-c.x0,d=c.z1-c.z0,h=c.h,cx=(c.x0+c.x1)/2,fz=c.z1,col='#'+c.mat.color.getHexString(),dc=dk(col,.72);
 /* roof: cap, parapet, AC units, stair hut, water tank, antenna */
 tb(w-.04,.12,d-.04,'#5f646b',cx,h+.06,(c.z0+c.z1)/2);[[w,.5,.22,cx,c.z0+.11],[w,.5,.22,cx,c.z1-.11],[.22,.5,d,c.x0+.11,(c.z0+c.z1)/2],[.22,.5,d,c.x1-.11,(c.z0+c.z1)/2]].forEach(a=>tb(a[0],a[1],a[2],dc,a[3],h+.25,a[4]));
 const rx=()=>R(c.x0+1.4,c.x1-1.4),rz=()=>R(c.z0+1.4,c.z1-1.4);if(w>3.4&&d>3.4){for(let i=RI(1,3);i>0;i--){const x=rx(),z=rz();tb(1.2,.7,.9,'#c3c7cc',x,h+.47,z);tb(.7,.06,.6,'#4a4f55',x,h+.85,z)}
  const hx=rx(),hz=rz();tb(1.8,1.6,1.6,'#9aa0a8',hx,h+.92,hz);tb(.7,1.2,.05,'#4a4f55',hx,h+.72,hz+.81);
  if(h>20&&Math.random()<.5){const x=rx(),z=rz();[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]].forEach(q=>tb(.1,.9,.1,'#4a3a2a',x+q[0],h+.57,z+q[1]));tb(1.4,1.5,1.4,'#8a6a4a',x,h+1.77,z);tb(1.5,.15,1.5,'#5a4632',x,h+2.6,z)}
  if(h>25)tb(.08,3,.08,'#555',rx(),h+1.62,rz())}
 /* floor ledges and corner pilasters on the street front */
 const n=Math.max(1,Math.round(h/3)),fh=h/n;for(let k=1;k<n;k++)tb(w+.08,.12,.18,dk(col,.85),cx,k*fh,fz+.05);
 tb(.3,h,.3,dk(col,.85),c.x0+.1,h/2,fz+.02);tb(.3,h,.3,dk(col,.85),c.x1-.1,h/2,fz+.02);
 /* ground floor: shop windows, kickplates, fascia with a sign, awnings, door canopy */
 const fc=pick(['#2a2d33','#7a2a22','#1f4f6b','#2f5a3a','#5a3a6a','#8a6a2a']),aw=pick(['#c0392b','#2d5a8d','#2f8f5a','#e6b422','#8e44ad','#d35400']),st=Math.random()<.7;
 tb(w-.5,.62,.12,fc,cx,2.3,fz+.06);[[c.x0+.5,cx-1.4],[cx+1.4,c.x1-.5]].forEach(([p,q])=>{const L=q-p,m=(p+q)/2;if(L<1.2)return;
  tb(L,1.45,.06,'#2f4b5c',m,1.05,fz+.03);tb(L,.32,.1,'#2a2a30',m,.16,fz+.05);tb(L,.1,.1,'#2a2a30',m,1.82,fz+.05);for(let x=p+1.5;x<q-.3;x+=1.5)tb(.08,1.45,.08,'#2a2a30',x,1.05,fz+.05);
  if(st){tb(L,.06,1,aw,m,1.98,fz+.5);for(let x=p,i=0;x<q-.05;x+=.5,i++)tb(Math.min(.5,q-x),.22,.04,i%2?'#f4f1ea':aw,x+Math.min(.5,q-x)/2,1.86,fz+1)}});
 tb(2.6,.08,.9,'#2a2d33',cx,1.98,fz+.45);const nm=pick(['CAFE','BAKERY','BOOKS','VINYL','PIZZA','NOODLES','DELI','FLORIST','PHARMACY','SHOES','TAILOR','BARBER','GYM','BANK','DINER','TACOS','SUSHI','RECORDS','GUITARS','LAUNDRY','OPTICIAN','GALLERY','JUICE BAR','HARDWARE']);
 sgnQuad(nm,'z',cx,2.3,fz+.125,.42);
 /* the tower's own front door box fades with it too */
 for(const k in SBC){const L=SBC[k];for(let j=L.length-1;j>=0;j--){const e=L[j];if(e[3]=='#2a1f1a'&&Math.abs(e[4]-cx)<.15&&Math.abs(e[6]-fz-.05)<.2){T.push(e.slice(0,7));L.splice(j,1)}}}
 c.dm=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true});scene.add(new THREE.Mesh(boxGeo(T),c.dm))}

function cdShop(s){const X=WX(s.cx),z=11.03,aw=dk(s.k,.55);[-2.6,2.6].forEach(x=>{SB(2.2,.06,.9,aw,X+x,2.35,z+.45);for(let i=0;i<4;i++)SB(.55,.2,.04,i%2?'#f4f1ea':aw,X+x-.825+i*.55,2.24,z+.9);SB(2,.1,.12,'#fff',X+x,.85,z+.03)});
 SB(1.5,1.9,.05,'#f0ece4',X,.95,z-.01);[-3.6,3.6].forEach(x=>{SB(.55,.45,.55,'#8a8f96',X+x,.22,z+.4);SB(.45,.35,.45,pick(GRN),X+x,.6,z+.4);SB(.15,.15,.15,pick(FLW),X+x+.1,.8,z+.45)});
 SB(1.1,.5,.8,'#c3c7cc',X+2,3.95,8);SB(.6,.05,.5,'#4a4f55',X+2,4.22,8)}

/* pavement furniture: u = along the road, wo = distance out from the road centre, s = side */
function cdFurniture(RD,OB,LMP){const ok=(x,z,r)=>!OB.some(o=>Math.abs(o[0]-x)<o[2]+r&&Math.abs(o[1]-z)<o[2]+r&&Math.hypot(o[0]-x,o[1]-z)<o[2]+r);
 RD.forEach(r=>[-1,1].forEach(s=>{const lb=(u,wo,L,A,y,hh,c)=>r.v?SB(A,hh,L,c,r.c+s*wo,y,u):SB(L,hh,A,c,u,y,r.c+s*wo),P=(u,wo)=>r.v?[r.c+s*wo,u]:[u,r.c+s*wo],city=P(r.a,0)[0]>WX(480);
  const put=(u,wo,rad,f)=>{const[x,z]=P(u,wo);if(!ok(x,z,rad))return false;OB.push([x,z,rad]);f();return true};
  r.free(JE+1,s).forEach(([a,b])=>{
   /* street lamps every ~32 m, staggered between the two sides */
   for(let u=a+(s>0?18:4);u<b-2;u+=32){const[lx,lz]=P(u,5.6);if(LMP.some(l=>Math.hypot(l[0]-lx,l[1]-lz)<12))continue;LMP.push([lx,lz]);put(u,5.6,1.2,()=>{lb(u,5.6,.45,.45,.15,.3,'#2a2d33');lb(u,5.6,.14,.14,1.75,3.2,'#3a3f47');lb(u,5.15,.12,1,3.3,.12,'#3a3f47');lb(u,4.75,.5,.7,3.4,.14,'#2a2d33');lb(u,4.75,.38,.55,3.32,.1,'#ffe9a8')})}
   /* a bus stop on the long main roads */
   if(b-a>60&&(r.v?false:Math.abs(r.c-WZ(16.2))<1)){const u=a+(b-a)*(s>0?.35:.65);put(u,6.8,2.2,()=>{lb(u,7.28,3,.06,1.2,1.8,'#9fd3e8');lb(u,6.8,3.2,1.1,2.35,.1,'#3a3f47');[-1.5,1.5].forEach(q=>{lb(u+q,7.25,.1,.1,1.15,2.3,'#3a3f47');lb(u+q,6.35,.1,.1,1.15,2.3,'#3a3f47')});lb(u,7,2,.35,.45,.08,'#8a5a36');lb(u-.8,7,.08,.3,.22,.45,'#333');lb(u+.8,7,.08,.3,.22,.45,'#333');lb(u+2.3,5.5,.1,.1,1.3,2.6,'#3a3f47');lb(u+2.3,5.5,.55,.08,2.5,.55,'#2d5a8d')})}
   for(let u=a+R(3,7);u<b-2;u+=R(7,12)){const k=Math.random();
    if(city){if(k<.28)put(u,5.8,1,()=>{lb(u,5.8,1,1,0,.03,'#55595f');lb(u,5.8,.22,.22,.7,1.4,'#6b4a2e');lb(u,5.8,1.3,1.3,1.85,1.1,pick(GRN));lb(u,5.8,.9,.9,2.6,.8,pick(GRN))});
     else if(k<.42)put(u,5.5,.5,()=>{lb(u,5.5,.45,.45,.35,.7,'#2f5d3a');lb(u,5.5,.5,.5,.74,.08,'#24452c')});
     else if(k<.56)put(u,7,1,()=>{lb(u,7,1.6,.45,.45,.08,'#8a5a36');lb(u,7.22,1.6,.08,.75,.45,'#8a5a36');lb(u-.7,7,.08,.4,.22,.45,'#333');lb(u+.7,7,.08,.4,.22,.45,'#333')});
     else if(k<.7)put(u,7,.8,()=>{lb(u,7,1.2,.6,.25,.5,'#8a8f96');lb(u,7,1.1,.5,.5,.05,'#5a3d22');[-.35,0,.35].forEach(q=>lb(u+q,7,.3,.3,.65,.3,Math.random()<.5?pick(GRN):pick(FLW)))});
     else if(k<.8)put(u,6.9,.9,()=>[-.5,0,.5].forEach(q=>{lb(u+q,6.9,.06,.06,.28,.55,'#555');lb(u+q,6.9,.06,.5,.55,.06,'#555');lb(u+q,7.15,.06,.06,.28,.55,'#555')}));
     else if(k<.88)put(u,5.45,.4,()=>{lb(u,5.45,.08,.08,.5,1,'#555');lb(u,5.45,.2,.15,1.1,.3,'#8a8f96')});
     else if(k<.94)put(u,7.1,.5,()=>{lb(u,7.1,.45,.4,.4,.8,'#2d5a8d');lb(u,6.89,.3,.02,.6,.2,'#bfe3ff')});
     else put(u,5.4,.4,()=>{lb(u,5.4,.32,.32,.25,.5,'#c0392b');lb(u,5.4,.22,.22,.57,.15,'#c0392b');lb(u,5.4,.5,.12,.35,.12,'#a33025')})}
    else{if(k<.25)put(u,5.5,.5,()=>{lb(u,5.5,.45,.45,.35,.7,'#2f5d3a');lb(u,5.5,.5,.5,.74,.08,'#24452c')});
     else if(k<.38)put(u,5.4,.4,()=>{lb(u,5.4,.32,.32,.25,.5,'#c0392b');lb(u,5.4,.22,.22,.57,.15,'#c0392b');lb(u,5.4,.5,.12,.35,.12,'#a33025')});
     else if(k<.55)put(u,7,1,()=>{lb(u,7,1.6,.45,.45,.08,'#8a5a36');lb(u,7.22,1.6,.08,.75,.45,'#8a5a36');lb(u-.7,7,.08,.4,.22,.45,'#333');lb(u+.7,7,.08,.4,.22,.45,'#333')});
     else if(k<.78)put(u,5.9,1,()=>{lb(u,5.9,1,1,0,.03,'#6b5a45');lb(u,5.9,.25,.25,.6,1.2,'#6b4a2e');lb(u,5.9,1.3,1.3,1.75,1.1,pick(GRN));lb(u,5.9,.9,.9,2.5,.8,pick(GRN))});
     else if(k<.85)put(u,7,.8,()=>{lb(u,7,1.2,.6,.25,.5,'#8a8f96');lb(u,7,1.1,.5,.5,.05,'#5a3d22');[-.35,0,.35].forEach(q=>lb(u+q,7,.3,.3,.65,.3,Math.random()<.5?pick(GRN):pick(FLW)))})}}})}))}

function cityDetail(){if(CTD.done)return;CTD.done=1;
 /* the old centre dashes were stretched by the warp near junctions: drop them, they are redrawn below */
 for(const k in SBC)SBC[k]=SBC[k].filter(e=>!(e[3]=='#e8d9a0'&&e[1]<.05));
 /* both road directions as one shape: c = centre line, [a,b] = extent, X = crossing roads (p = where, n/s = they go to the low/high side) */
 /* the city plaza used to be paved right over 3rd Avenue, so traffic drove across it: cut the road and its pavements out of it */
 {const X=WX(570);for(const k in SBC){const L=SBC[k];for(let j=L.length-1;j>=0;j--){const e=L[j];if(e[3]!='#cfc6b4'||e[1]>.06||e[0]<30)continue;const x0=e[4]-e[0]/2,x1=e[4]+e[0]/2;L.splice(j,1);
  [[x0,X-PO],[X+PO,x1]].forEach(([p,q])=>{if(q-p>.5)L.push([q-p,e[1],e[2],e[3],(p+q)/2,e[5],e[6]])})}}
  /* the fountain was stretched by the warp and reached onto the pavement: square it up just west of the road */
  const fz=WZ(33);for(const k in SBC)SBC[k].forEach(e=>{if(Math.abs(e[6]-fz)<.1&&Math.abs(e[4]-WX(565))<6&&['#aaa','#4aa3df','#ccc'].includes(e[3])){e[0]=e[2];e[4]=X-PO-3.2}});CTD.fx=X-PO-3.2}
 const NOGO=[],inNo=(x,z)=>NOGO.some(n=>x>n[0]&&x<n[2]&&z>n[1]&&z<n[3]);
 const mk=(v,c,a,b,X)=>{const cut=NOGO.filter(n=>v?c+PO>n[0]&&c-PO<n[2]:c+PO>n[1]&&c-PO<n[3]).map(n=>v?[n[1],n[3]]:[n[0],n[2]]);
  return{v,c,a,b,X,cut,free(e,s){let I=[[a,b]];const sub=(lo,hi)=>{I=I.flatMap(([p,q])=>hi<=p||lo>=q?[[p,q]]:[[p,lo],[hi,q]].filter(([u,w])=>w-u>.3))};
   X.forEach(x=>{if(!s||(s<0?x.n:x.s))sub(x.p-e,x.p+e)});cut.forEach(([lo,hi])=>sub(lo-1,hi+1));return I}}};
 const RD=[...RH.map(h=>mk(0,h[0],h[1],h[2],RVV.filter(v=>onX(h,v)).map(v=>({p:v[0],n:v[1]<h[0]-.1,s:v[2]>h[0]+.1})))),...RVV.map(v=>mk(1,v[0],v[1],v[2],RH.filter(h=>onX(h,v)).map(h=>({p:h[0],n:h[1]<v[0]-.1,s:h[2]>v[0]+.1}))))];
 RD.forEach(r=>{const bx=(a0,a1,o,ow,y,hh,c)=>{if(a1-a0<.05)return;const m=(a0+a1)/2,L=a1-a0;r.v?SB(ow,hh,L,c,r.c+o,y,m):SB(L,hh,ow,c,m,y,r.c+o)};
  [-1,1].forEach(s=>{
   r.free(RW2,s).forEach(([p,q])=>bx(p,q,s*(RW2+.11),.22,.03,.14,'#a29e95'));
   for(let u=r.a+1.5;u<r.b;u+=3)if(!r.cut.some(([p,q])=>u>p&&u<q))bx(u-.04,u+.04,s*(RW2+PAVE_W/2+.1),PAVE_W-.3,.012,.012,'#a7a397');
   r.free(RW2,0).forEach(([p,q])=>bx(p+.2,q-.2,s*(RW2-.35),.12,-.005,.02,'#ecebe4'))});
  r.free(JE+4.5,0).forEach(([p,q])=>{if(q-p<3)return;for(let u=p+1;u+2.4<=q-1;u+=5)bx(u,u+2.4,0,.16,-.005,.02,'#e8d9a0')});
  r.X.forEach(x=>[-1,1].forEach(d=>{if(d<0?r.a>x.p-JE-3:r.b<x.p+JE+3)return;const zc=x.p+d*(JE+1.5),sp=x.p+d*(JE+3.3),side=r.v?-d:d;const lo=Math.min(zc,sp)-1.5,hi=Math.max(zc,sp)+1.5;if(r.cut.some(([p,q])=>hi>p&&lo<q))return;
   for(let o=-4.2;o<=4.21;o+=1.2)bx(zc-1.2,zc+1.2,o,.6,-.005,.02,'#ecebe4');bx(sp-.2,sp+.2,side*RW2/2,RW2-.4,-.005,.02,'#ecebe4')}))});
 /* street-name signs at one corner of every junction */
 RH.forEach(h=>RVV.forEach(v=>{if(!onX(h,v))return;const X=v[0],Z=h[0],ex=h[2]>X+.1?1:-1,ez=v[2]>Z+.1?1:-1,x=X+ex*(RW2+.5),z=Z+ez*(RW2+.5),nh=roadName(0,Z),nv=roadName(1,X);if(!nh&&!nv||inNo(x,z))return;
  SB(.09,2.7,.09,'#2f4f3a',x,1.35,z);if(nh){const w=sgnW(nh,.3)+.2;SB(w,.4,.05,'#1f6b3a',x,2.55,z);sgnQuad(nh,'z',x,2.55,z+.03,.3)}if(nv){const w=sgnW(nv,.3)+.2;SB(.05,.4,w,'#1f6b3a',x,2.15,z);sgnQuad(nv,'x',x+.03,2.15,z,.3)}}));
 /* buildings */
 CTD.hse.forEach(cdHouse);CT.forEach(cdTower);CTD.shop.forEach(cdShop);
 /* furniture keeps clear of lamps, doors, gates, parked cars and existing trees */
 const OB=[];for(const k in SBC)SBC[k].forEach(e=>{if(e.nw&&e[3]=='#3a3f47'&&e[1]>2)OB.push([e[4],e[6],1.5]);else if(e[1]>.43&&e[1]<.47&&e[0]>1.69&&e[0]<1.71)OB.push([e[4],e[6],1.6])});
 INT.forEach(q=>{if(outdoor(q.z))OB.push([q.x,q.z,2.4])});CTD.hfp.forEach(f=>OB.push([(f[0]+f[2])/2,f[3]+.6,1.4]));CT.forEach(c=>OB.push([(c.x0+c.x1)/2,c.z1+.5,2]));
 (CTD.ob||[]).forEach(o=>OB.push(o));CTD.trees=CTD.tree.map(t=>[WX(t[0]),WZ(t[1])]);CTD.trees.forEach(t=>OB.push([t[0],t[1],1]));
 cdFurniture(RD,OB,OB.filter(o=>o[2]==1.5).map(o=>[o[0],o[1]]));sgnFlush();
 /* map areas (layout rectangles, warped) */
 const A=(x0,z0,x1,z1,c)=>CTD.areas.push([WX(x0),WZ(z0),WX(x1),WZ(z1),c]);
 A(0,-139.5,190,-44.5,'#5fae5f');A(5,-92.9,185,-91.1,'#d8c9a0');[30,95,160].forEach(x=>A(x-.9,-139.5,x+.9,-44.5,'#d8c9a0'));A(92,-95,98,-89,'#aaa');
 for(let z=-125;z<-45;z+=6)A(-235,z-1.7,-135,z+1.7,['#c9b458','#8fbf4a','#7aa843'][(Math.abs(z/6|0))%3]);A(-156,-85,-144,-75,'#b03a2e');A(-139.5,-71.5,-136.5,-68.5,'#bbb');
 A(-115,195,-85,215,'#d86a5a');A(-115,180,-85,190,'#c9a77a');A(275,195,325,225,'#58b05a');A(545,22,585,44,'#cfc6b4');CTD.areas.push([CTD.fx-2.5,WZ(30.5),CTD.fx+2.5,WZ(35.5),'#4aa3df']);
 A(47,-63,53,-57,'#e8c88a');A(57.5,-127.5,62.5,-122.5,'#a0522d');A(0,0,16,12,'#c98a5a');CTD.shop.forEach(s=>A(s.cx-4,5,s.cx+4,11,s.k))}
{const f1=flushSB;flushSB=function(){warpWorld();try{cityDetail()}catch(e){console.error('cityDetail',e)}f1()}}

/* ---- 2D maps: the big map (32-map-zoom.js) and the minimap (16-big-world...js) draw their ground through this ----
   x: 2D context, sx/sz: world to canvas, kx/kz: pixels per metre, mini: true for the minimap */
function mapPaint(x,sx,sz,kx,kz,mini){const W=x.canvas.width,H=x.canvas.height,vis=(a,b,c,d)=>c>=-20&&a<=W+20&&d>=-20&&b<=H+20;
 const rect=(a,c)=>{const X=sx(a[0]),Z=sz(a[1]),w=(a[2]-a[0])*kx,h=(a[3]-a[1])*kz;if(!vis(X,Z,X+w,Z+h))return;x.fillStyle=c;x.fillRect(X,Z,w,h)};
 CTD.areas.forEach(a=>rect(a,a[4]));
 /* lake: rounded */
 {const X=sx(LK[0]),Z=sz(LK[1]),w=(LK[2]-LK[0])*kx,h=(LK[3]-LK[1])*kz,r=Math.min(w,h)*.35;x.fillStyle='#4aa3df';x.beginPath();x.moveTo(X+r,Z);x.arcTo(X+w,Z,X+w,Z+h,r);x.arcTo(X+w,Z+h,X,Z+h,r);x.arcTo(X,Z+h,X,Z,r);x.arcTo(X,Z,X+w,Z,r);x.fill();x.fillStyle='#8fd0f5';x.fillRect(X+w*.2,Z+h*.3,w*.25,Math.max(1,kz*.6))}
 /* trees */
 x.fillStyle='#2e6b35';const ts=Math.max(1.5,1.5*kx);CTD.trees.forEach(t=>{const X=sx(t[0]),Z=sz(t[1]);if(X>-4&&Z>-4&&X<W+4&&Z<H+4)x.fillRect(X-ts/2,Z-ts/2,ts,ts)});
 /* pavements, then asphalt, then centre lines */
 x.fillStyle='#a8a59c';RH.forEach(h=>rect([h[1],h[0]-PO,h[2],h[0]+PO],'#a8a59c'));RVV.forEach(v=>rect([v[0]-PO,v[1],v[0]+PO,v[2]],'#a8a59c'));
 ROADS.forEach(r=>rect([r[0],r[1],Math.max(r[2],r[0]+2/kx),Math.max(r[3],r[1]+2/kz)],'#3a3d44'));
 if(ROAD_W*kx>=7){x.strokeStyle='#e8d9a0';x.lineWidth=Math.max(1,.18*kx);x.setLineDash([Math.max(2,2.4*kx),Math.max(2,2.6*kx)]);x.beginPath();
  RH.forEach(h=>{x.moveTo(sx(h[1]),sz(h[0]));x.lineTo(sx(h[2]),sz(h[0]))});RVV.forEach(v=>{x.moveTo(sx(v[0]),sz(v[1]));x.lineTo(sx(v[0]),sz(v[2]))});x.stroke();x.setLineDash([])}
 /* building footprints */
 const ol=kx>=1.4;CTD.hfp.forEach(f=>{rect(f,f[4]);if(ol){x.strokeStyle='#0005';x.lineWidth=1;x.strokeRect(sx(f[0]),sz(f[1]),(f[2]-f[0])*kx,(f[3]-f[1])*kz)}});
 BLD.forEach(b=>{rect(b,'#8fa6b8');if(ol){x.strokeStyle='#4d6070';x.lineWidth=1;x.strokeRect(sx(b[0]),sz(b[1]),(b[2]-b[0])*kx,(b[3]-b[1])*kz)}});
 /* road names */
 if(ROAD_W*kx<7)return;const fs=mini?8:Math.min(13,Math.max(9,Math.round(ROAD_W*kx*.75)));x.font='bold '+fs+'px monospace';x.textAlign='center';x.textBaseline='middle';x.lineWidth=3;x.strokeStyle='#000b';x.fillStyle='#fff';
 const say=(t,X,Z,rot)=>{x.save();x.translate(X,Z);if(rot)x.rotate(-Math.PI/2);x.strokeText(t,0,0);x.fillText(t,0,0);x.restore()};
 const along=(t,p0,p1,q,v)=>{const tw=x.measureText(t).width+30;if(Math.abs(p1-p0)<tw)return;const lo=Math.max(p0+tw/2,-tw),hi=Math.min(p1-tw/2,(v?H:W)+tw);if(lo>hi)return;
  if(mini){const m=Math.min(hi,Math.max(lo,(v?H:W)/2+(v?-30:30)));say(t,v?q:m,v?m:q,v);return}
  /* labels sit at fixed spots along the road (from its start), so they do not slide while the map is dragged */
  const step=Math.max(tw*2,320);let m=p0+tw/2;if(m<lo)m+=Math.ceil((lo-m)/step)*step;for(;m<=hi;m+=step)say(t,v?q:m,v?m:q,v)};
 RH.forEach(h=>{const t=roadName(0,h[0]),q=sz(h[0]);if(t&&q>-10&&q<H+10)along(t,sx(h[1]),sx(h[2]),q,0)});RVV.forEach(v=>{const t=roadName(1,v[0]),q=sx(v[0]);if(t&&q>-10&&q<W+10)along(t,sz(v[1]),sz(v[2]),q,1)});x.textAlign='start';x.textBaseline='alphabetic'}
