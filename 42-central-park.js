/* ===== v26.34.0: a much more detailed Central Park =====
   The old park (16-big-world...js buildBigWorld: a flat lawn, four straight paths, a rectangular lake with benches and a
   path running through it, a box fountain, a swing, a gazebo and 110 identical trees) is cleared and rebuilt once, after
   the road warp, in final world coordinates. All static parts are merged per 60 m cell with the xg* helpers
   (40-city-fixes.js), so the whole park is a handful of draw calls.
   - mown lawn stripes, a perimeter hedge with stone gate pillars at every way in
   - gravel paths with a darker edging: the main avenue (south gate - fountain - north gate) lined with cherry trees and
     limes, a west walk, a south walk from the playground to Park Avenue, a loop round the pond and short links
   - a round fountain plaza with a paved ring, four raised flower beds and benches, and the animated fountain (41)
   - a duck pond with a stone rim, a sandy shore, reeds, rocks, lily pads, an island with a willow and a duck house,
     a wooden pier with a rowing boat, a water jet and ducks (with ducklings) swimming round the island
   - a bandstand, a gazebo by the pond, a formal flower garden with box hedges and an urn, a playground (swings, slide,
     climbing frame, see-saw, roundabout, spring riders, sandpit) behind a low fence, and a picnic lawn with tables
     and barbecues
   - oaks, limes, maples in autumn colours, cherry blossom, birches, pines, poplars and willows, bushes and flowering
     shrubs, benches, bins and park lanterns along the paths
   - a few people walk the paths (some with dogs)
   - the park lanterns glow at night (unlit material)
   - colliders for the hedge, the pond, the fountain, the bandstand, the playground equipment and the picnic tables
   - the maps draw the park from the same data (mapPaint is wrapped) */
const CPARK={paths:[],trees:[],bush:[],beds:[],zones:[],ob:[],pond:null,loop:null,ducks:null,water:null,on:false};
const pkLt=(c,f)=>{const k=new THREE.Color(c);k.r=Math.min(1,k.r*f);k.g=Math.min(1,k.g*f);k.b=Math.min(1,k.b*f);return'#'+k.getHexString()};
const CPKC=['#2e7d32','#388e3c','#2d6a30','#43a047','#3f8f3a'];
/* boxes with full rotation (for tilted parts: A-frames, the slide, the see-saw) */
const CPKM=new THREE.Matrix4(),CPKE=new THREE.Euler(),CPKV=new THREE.Vector3(),XBF6=XBF.concat([[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]]);
function xgBoxR(G,w,h,d,col,x,y,z,rx,ry,rz){CPKM.makeRotationFromEuler(CPKE.set(rx||0,ry||0,rz||0));const B=xgCell(G,x,z),a=w/2,b=h/2,e=d/2;
 XBF6.forEach(f=>xgQuad(B,f.map(q=>{CPKV.set(q[0]*a,q[1]*b,q[2]*e).applyMatrix4(CPKM);return[x+CPKV.x,y+CPKV.y,z+CPKV.z]}),col))}
/* an object made of boxes in its own frame, turned ry: parts [w,h,d,col,lx,ly,lz,topCol] */
function pkObj(G,x,z,ry,parts){const c=Math.cos(ry),s=Math.sin(ry);parts.forEach(p=>xgBox(G,p[0],p[1],p[2],p[3],x+p[4]*c+p[6]*s,p[5],z-p[4]*s+p[6]*c,ry,p[7]))}
/* geometry of one cell, not added to the scene (ducks) */
function xgGeo(B){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(B.C,3));g.setIndex(B.I);g.computeBoundingSphere();return g}
/* strip between two closed curves (same point count, increasing angle), e.g. the loop path */
function xgStrip(G,A,Bo,y,col,cx,cz){const B=xgCell(G,cx,cz),n=A.length;for(let i=0;i<n;i++){const j=(i+1)%n;xgQuad(B,[[Bo[j][0],y,Bo[j][1]],[Bo[i][0],y,Bo[i][1]],[A[i][0],y,A[i][1]],[A[j][0],y,A[j][1]]],col)}}
const segD=(x,z,s)=>{const dx=s[2]-s[0],dz=s[3]-s[1],L=dx*dx+dz*dz,t=L?Math.max(0,Math.min(1,((x-s[0])*dx+(z-s[1])*dz)/L)):0;return Math.hypot(x-s[0]-t*dx,z-s[1]-t*dz)};
const inPoly=(x,z,p)=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>z)!=(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;return c};
/* where a closed polyline crosses the line z = v (or x = v): pick the crossing closest to 'near' */
function polyCross(p,v,axis,near){let best=null;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],ka=axis?a[0]:a[1],kb=axis?b[0]:b[1];if((ka-v)*(kb-v)>0||ka==kb)continue;const t=(v-ka)/(kb-ka),o=axis?a[1]+(b[1]-a[1])*t:a[0]+(b[0]-a[0])*t;if(best==null||Math.abs(o-near)<Math.abs(best-near))best=o}return best}

/* ---- trees and bushes ---- */
function pkTree(G,x,z,k,s){s=s||1;const tr=(h,r,c)=>xgPrism(G,r*s,r*.8*s,h*s,6,c||'#6b4a2e',x,0,z),P=(r0,r1,h,y,c,n,o)=>xgPrism(G,r0*s,r1*s,h*s,n||8,c,x,y*s,z,o);CPARK.trees.push([x,z,k,s]);
 if(k=='pine'){tr(.9,.18);const c=pick(['#2f5d3a','#2b5634','#356b40']);P(1.7,0,1.9,.6,c,7);P(1.3,0,1.6,1.6,pkLt(c,1.1),7,{ph:.4});P(.9,0,1.3,2.6,pkLt(c,1.2),7,{ph:.8})}
 else if(k=='poplar'){tr(1,.16);const c=pick(['#3d7d3a','#4a8a3c']);P(.55,.75,1.6,.9,c);P(.75,.3,2.6,2.5,pkLt(c,1.08));}
 else if(k=='birch'){xgPrism(G,.13*s,.1*s,2*s,6,'#eeeae0',x,0,z);[.5,1.1,1.6].forEach(y=>xgBox(G,.27*s,.05,.27*s,'#3a3a3a',x,y*s,z));const c=pick(['#8cc65a','#9ccf62','#7fbf52']);P(.5,1.05,.8,1.6,c,7);P(1.05,.45,1,2.4,pkLt(c,1.08),7)}
 else if(k=='willow'){tr(1.7,.28,'#5e4630');const c='#7fa94a';P(1.1,2.2,.7,1.9,pkLt(c,1.1),9);P(2.2,1,.65,2.6,pkLt(c,1.18),9);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2+R(-.1,.1),r=R(1.75,2.15)*s,h=R(1.1,1.8)*s;xgBox(G,.32*s,h,.32*s,pick([c,dk(c,.9),pkLt(c,1.08),'#8cb55a']),x+Math.cos(a)*r,2.05*s-h/2,z+Math.sin(a)*r,-a)}}
 else{tr(1.4,.22);const c=k=='cherry'?pick(['#e58aae','#ec9cbd','#de7fa6']):k=='maple'?pick(['#d9772b','#c95a2a','#e39a2f','#b8442a']):pick(CPKC);
  P(1,1.65,.7,1.2,dk(c,.9),8);P(1.65,1.65,.75,1.9,c,8,{ph:.2});P(1.65,.75,.8,2.65,pkLt(c,1.1),8);
  if(k=='cherry')xgPrism(G,1.35*s,1.35*s,.004,10,'#e3a6bd',x,.004,z)}}
function pkBush(G,x,z,s,c,fl){s=s||1;c=c||pick(CPKC);xgPrism(G,.75*s,.8*s,.45*s,7,dk(c,.9),x,0,z,{ph:Math.random()});xgPrism(G,.8*s,.35*s,.4*s,7,c,x,.45*s,z,{ph:Math.random()});CPARK.bush.push([x,z,s]);
 if(fl)for(let i=0;i<5;i++){const a=R(0,6.28),r=R(.2,.55)*s;xgBox(G,.14,.12,.14,fl,x+Math.cos(a)*r,(.6+R(0,.2))*s,z+Math.sin(a)*r)}}
/* ---- furniture ---- */
const pkBench=(G,x,z,ry)=>pkObj(G,x,z,ry,[[1.7,.07,.5,'#a06a3c',0,.47,0,'#b57a48'],[1.7,.42,.07,'#a06a3c',0,.82,-.24],[.08,.47,.46,'#2b2f33',-.72,.23,0],[.08,.47,.46,'#2b2f33',.72,.23,0],[.08,.5,.08,'#2b2f33',-.72,.75,-.25],[.08,.5,.08,'#2b2f33',.72,.75,-.25],[.08,.06,.5,'#2b2f33',-.72,.62,0],[.08,.06,.5,'#2b2f33',.72,.62,0]]);
function pkLamp(G,x,z){xgPrism(G,.22,.16,.35,6,'#24382c',x,0,z);xgPrism(G,.07,.06,2.6,6,'#2b4535',x,.35,z);xgBox(G,.34,.06,.34,'#24382c',x,2.95,z);xgBox(CPARK.gl||G,.26,.36,.26,'#fff2b0',x,3.16,z);xgPrism(G,.24,0,.3,4,'#24382c',x,3.34,z,{ph:Math.PI/4});CPARK.ob.push([x,z,.4])}
const pkBin=(G,x,z)=>{xgPrism(G,.26,.28,.75,8,'#2f5d3a',x,0,z,{top:'#1f3a26'});xgPrism(G,.3,.3,.05,8,'#24382c',x,.75,z)};

/* ---- the build ---- */
function parkBuild(){if(CPARK.done)return;CPARK.done=1;CPARK.gl=xgNew();const G=xgNew(),X0=0,X1=190,Z0=WZ(-139.5),Z1=WZ(-44.5),CX=95,CZ=(Z0+Z1)/2,PATH='#dccfae',EDGE='#a89c84';
 /* 1. clear the old park */
 const inPk=(x,z,m)=>x>X0-m&&x<X1+m&&z>Z0-m&&z<Z1+m;
 for(const k in SBC)SBC[k]=SBC[k].filter(e=>!(inPk(e[4],e[6],.3)&&e[4]-e[0]/2>X0-1&&e[4]+e[0]/2<X1+1&&e[6]-e[2]/2>Z0-1&&e[6]+e[2]/2<Z1+1));
 for(let i=cols.length-1;i>=0;i--){const c=cols[i];if(c[0]>X0-1&&c[2]<X1+1&&c[1]>Z0-1&&c[3]<Z1+1)cols.splice(i,1)}
 CTD.trees=CTD.trees.filter(t=>!inPk(t[0],t[1],.5));CTD.areas=CTD.areas.filter(a=>!(a[0]>X0-1&&a[2]<X1+1&&a[1]>Z0-1&&a[3]<Z1+1));
 /* 2. lawn: mown stripes */
 for(let x=X0,i=0;x<X1;x+=5,i++)[[Z0,CZ],[CZ,Z1]].forEach(([a,b])=>xgQuad(xgCell(G,x+2.5,(a+b)/2),[[x,.004,b],[x+5,.004,b],[x+5,.004,a],[x,.004,a]],i%2?'#6bb063':'#64a85c'));
 /* 3. paths: [x0,z0,x1,z1,width]; a darker edging slab sits just under each path */
 const path=(x0,z0,x1,z1,w)=>{CPARK.paths.push([x0,z0,x1,z1,w]);const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(-(z1-z0),x1-x0),mx=(x0+x1)/2,mz=(z0+z1)/2;xgBox(G,L,.03,w+.4,EDGE,mx,.013,mz,ry);xgBox(G,L+.02,.03,w,PATH,mx,.019,mz,ry)};
 const disc=(x,z,r,w)=>{xgPrism(G,r+.2,r+.2,.028,14,EDGE,x,0,z,{ph:.1});xgPrism(G,r,r,.034,14,PATH,x,0,z,{ph:.1});CPARK.paths.push([x,z,x,z,r*2])};
 const PW=3.6,PL=CZ+9.2,PN=CZ-9.2;
 path(CX,Z1+.4,CX,PL,PW);path(CX,PN,CX,Z0-.4,PW);path(CX-9.2,CZ,X0-.4,CZ,2.6);
 const SW=Z1-14.1;path(58,SW,X1+7,SW,2.6);/* south walk: playground - avenue - Park Avenue's pavement */
 path(40,Z1+.4,40,Z1-8.4,2.2);path(150,Z1+.4,150,SW,2.2);path(52,CZ,52,CZ-19,2.2);
 /* pond and its loop */
 const PCX=146,PCZ=CZ-8.6,PA=22,PB=14,prR=t=>1+.09*Math.sin(2*t+.5)+.07*Math.sin(3*t+1.2)+.04*Math.sin(5*t+2),N=56,
  ring=o=>{const p=[];for(let i=0;i<N;i++){const t=i/N*Math.PI*2,r=prR(t);p.push([PCX+Math.cos(t)*(PA*r+o),PCZ+Math.sin(t)*(PB*r+o)])}return p};
 const shore=ring(0),rim=ring(.45),beach=ring(1.8),lpI=ring(3.6),lpO=ring(5.8),lpM=ring(4.7),lpE0=ring(3.4),lpE1=ring(6);
 CPARK.pond={c:[PCX,PCZ],shore,beach,loop:lpM};
 xgStrip(G,lpE0,lpE1,.028,EDGE,PCX,PCZ);xgStrip(G,lpI,lpO,.034,PATH,PCX,PCZ);
 const ewx=polyCross(lpM,CZ,0,PCX-30);path(CX+9.2,CZ,ewx+.6,CZ,2.6);
 const cnz=polyCross(lpM,165,1,PCZ+20);path(165,cnz-.6,165,SW,2.2);
 const gzz=polyCross(lpM,PCX,1,PCZ-20);path(PCX,gzz+.6,PCX,gzz-4.5,2);
 disc(CX,CZ,9.2);
 /* 4. fountain plaza: paved ring pattern, four raised beds, benches, the fountain */
 xgRing(G,6,6.5,.04,36,'#c9bb9f',CX,CZ);xgRing(G,8.6,9.2,.04,36,'#cdbfa5',CX,CZ);xgPrism(G,6,6,.037,36,'#e6dcc8',CX,0,CZ,{cap:true});
 for(let q=0;q<4;q++){const a0=q*Math.PI/2+.42,a1=a0+Math.PI/2-.84,n=8,B=xgCell(G,CX,CZ),pt=(r,a,y)=>[CX+Math.cos(a)*r,y,CZ+Math.sin(a)*r];
  for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n,b=a0+(a1-a0)*(i+1)/n;
   xgQuad(B,[pt(8.2,b,.32),pt(8.2,a,.32),pt(6.8,a,.32),pt(6.8,b,.32)],'#5a3d22');xgQuad(B,[pt(8.4,b,0),pt(8.4,a,0),pt(8.4,a,.36),pt(8.4,b,.36)],'#b8ab92');xgQuad(B,[pt(8.4,b,.36),pt(8.4,a,.36),pt(8.2,a,.36),pt(8.2,b,.36)],'#cdbfa5');
   xgQuad(B,[pt(6.6,a,0),pt(6.6,b,0),pt(6.6,b,.36),pt(6.6,a,.36)],'#b8ab92');xgQuad(B,[pt(6.8,b,.36),pt(6.8,a,.36),pt(6.6,a,.36),pt(6.6,b,.36)],'#cdbfa5')}
  const fc=[['#e03a3a','#ffe066'],['#ff6ad5','#fff'],['#b07aff','#ffe066'],['#ff8a30','#e03a3a']][q];
  for(let i=0;i<26;i++){const a=R(a0+.05,a1-.05),r=R(6.95,8.05);xgBox(G,.17,.16,.17,i%3==2?pick(CPKC):fc[i%2],CX+Math.cos(a)*r,.4,CZ+Math.sin(a)*r)}
  const am=(a0+a1)/2;[-.21,.21].forEach(d=>{const a=am+d,x=CX+Math.cos(a)*5.75,z=CZ+Math.sin(a)*5.75;pkBench(G,x,z,Math.atan2(-Math.cos(a),-Math.sin(a)));CTD.trees.push([x,z])});for(let i=0;i<4;i++){const a=a0+(a1-a0)*(i+.5)/4,x=CX+Math.cos(a)*7.5,z=CZ+Math.sin(a)*7.5;col(x-.65,z-.65,x+.65,z+.65)}}
 ftnBuild(G,CX,CZ,3.4,{stone:'#d4cbb8'});
 CPARK.zones.push(['plaza',CX-10,CZ-10,CX+10,CZ+10]);
 /* 5. pond: beach, stone rim, water, island, reeds, rocks, lily pads, pier, boat, jet */
 const WY=.045;xgStrip(G,rim,beach,.02,'#d9c9a0',PCX,PCZ);xgStrip(G,shore,rim,.075,'#9b9486',PCX,PCZ);xgWall(G,rim,0,.075,'#857e70',PCX,PCZ);xgWall(G,shore.slice().reverse(),WY,.075,'#7d776a',PCX,PCZ);
 {const P=[PCX,WY,PCZ],V=[0,0],I=[];shore.forEach(p=>{P.push(p[0],WY,p[1])});for(let i=0;i<N;i++)I.push(0,1+(i+1)%N,1+i);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  const U=[];for(let i=0;i<P.length;i+=3)U.push(P[i]/7,P[i+2]/7);g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(P.map((_,k)=>k%3==1?1:0),3));g.setIndex(I);g.computeBoundingSphere();
  const cv=document.createElement('canvas');cv.width=cv.height=32;const x=cv.getContext('2d');x.fillStyle='#3a93cf';x.fillRect(0,0,32,32);x.fillStyle='#4aa3df';for(let i=0;i<9;i++)x.fillRect(RI(0,28),RI(0,31),RI(3,7),1);x.fillStyle='#8fd0f5';for(let i=0;i<5;i++)x.fillRect(RI(0,29),RI(0,31),RI(2,4),1);
  const t=new THREE.CanvasTexture(cv);t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:t}));scene.add(m);CPARK.water=t}
 const IS=[];for(let i=0;i<14;i++){const t=i/14*Math.PI*2,r=3.2*(1+.12*Math.sin(3*t+1));IS.push([PCX+Math.cos(t)*r,PCZ+Math.sin(t)*r*.8])}const ISr=IS.map(p=>[PCX+(p[0]-PCX)*1.2,PCZ+(p[1]-PCZ)*1.2]);
 xgStrip(G,IS,ISr,.07,'#d9c9a0',PCX,PCZ);xgWall(G,ISr,WY,.07,'#b8a985',PCX,PCZ);xgPoly(G,IS,.1,'#6aa85e',PCX,PCZ);xgWall(G,IS,.07,.1,'#5a9450',PCX,PCZ);
 pkTree(G,PCX-.6,PCZ-.3,'willow',.9);pkObj(G,PCX+1.6,PCZ+.8,-.4,[[.08,.6,.08,'#5e4630',-.3,.4,-.25],[.08,.6,.08,'#5e4630',.3,.4,-.25],[.08,.6,.08,'#5e4630',-.3,.4,.25],[.08,.6,.08,'#5e4630',.3,.4,.25],[.8,.55,.65,'#c9a46a',0,.95,0],[.24,.24,.05,'#2a1f1a',0,.88,.33],[.8,.06,.8,'#a0522d',0,1.25,0]]);
 xgPrism(G,.62,0,.4,4,'#a0522d',PCX+1.6,1.26,PCZ+.8,{ph:Math.PI/4-.4});
 for(let i=0;i<N;i+=RI(3,6)){const p=shore[i],q=rim[i],a=Math.atan2(p[1]-PCZ,p[0]-PCX);if(Math.random()<.45){for(let k=0;k<RI(2,4);k++){const r=R(.25,.55);xgPrism(G,r,r*.7,R(.2,.45),5,pick(['#8f8a80','#a19b90','#7d786f']),q[0]+R(-.5,.5),.04,q[1]+R(-.5,.5),{ph:R(0,6)})}}
  else{const rx=p[0]-Math.cos(a)*.7,rz=p[1]-Math.sin(a)*.7;for(let k=0;k<8;k++){const h=R(.6,1.2),x=rx+R(-.5,.5),z=rz+R(-.5,.5);xgBox(G,.05,h,.05,pick(['#5c8a3a','#7a9a45','#6b8f3c']),x,WY+h/2,z);if(k%3==0)xgBox(G,.09,.22,.09,'#6b4a2e',x,WY+h+.08,z)}}}
 for(let c=0;c<4;c++){const a=R(0,6.28),r=R(.45,.75),cx=PCX+Math.cos(a)*PA*r,cz=PCZ+Math.sin(a)*PB*r;if(Math.hypot(cx-PCX,cz-PCZ)<5)continue;for(let k=0;k<4;k++){const x=cx+R(-1.2,1.2),z=cz+R(-1,1);xgPrism(G,.35,.35,.012,7,'#3f8f3a',x,WY,z,{ph:R(0,6)});if(Math.random()<.4)xgBox(G,.14,.1,.14,pick(['#ff9ac8','#fff']),x+.1,WY+.06,z)}}
 const pz0=polyCross(lpM,140,1,PCZ+20)-.4,pz1=polyCross(shore,140,1,PCZ+20)-4.5;
 for(let z=pz0;z>pz1;z-=.42)xgBox(G,1.9,.06,.36,'#a67c52',140,.13,z-.18);[-.85,.85].forEach(o=>{for(let z=pz0-1.5;z>pz1;z-=2.2)xgBox(G,.14,.5,.14,'#6b4a2e',140+o,.2,z)});xgBox(G,.12,.12,pz0-pz1,'#7a5a3a',140.95,.22,(pz0+pz1)/2);
 xgPrism(G,.62,.8,.32,8,'#a0522d',142.6,-.02,pz1+1.8,{sx:2.2,top:'#7a3d22'});xgBox(G,.25,.05,1.3,'#c9a46a',142.6,.27,pz1+1.8);xgBox(G,.1,.05,1.6,'#c9a46a',142.9,.33,pz1+1.8,.3);
 ftnJet(PCX-11,PCZ+1.5,WY+.01,2.4,2.2);
 /* pond collider: 1.5 m slices of the water (the pier strip stays free) */
 {let zt=Math.min(...shore.map(p=>p[1])),zb=Math.max(...shore.map(p=>p[1]));for(let z=zt+.4;z<zb-.4;z+=1.5){const z2=Math.min(z+1.5,zb-.4),zm=(z+z2)/2;let xs=[];for(let i=0;i<N;i++){const a=shore[i],b=shore[(i+1)%N];if((a[1]-zm)*(b[1]-zm)<=0&&a[1]!=b[1])xs.push(a[0]+(b[0]-a[0])*(zm-a[1])/(b[1]-a[1]))}xs.sort((p,q)=>p-q);if(xs.length<2)continue;
   const xa=xs[0]+.4,xb=xs[xs.length-1]-.4;if(z2>pz1&&z<pz0){col(xa,z,139,z2);col(141,z,xb,z2)}else col(xa,z,xb,z2)}
  col(139,pz1-.6,141,pz1)}
 LK.splice(0,4,Math.min(...shore.map(p=>p[0])),Math.min(...shore.map(p=>p[1])),Math.max(...shore.map(p=>p[0])),Math.max(...shore.map(p=>p[1])));
 CPARK.zones.push(['pond',PCX-PA*1.25-6,PCZ-PB*1.25-6,PCX+PA*1.25+6,PCZ+PB*1.25+6]);
 /* 6. bandstand */
 {const bx=52,bz=CZ-25,r=5;xgPrism(G,r+.5,r+.5,.15,8,'#bfb6a6',bx,0,bz,{ph:Math.PI/8});xgPrism(G,r,r,.6,8,'#e8e1d2',bx,.15,bz,{ph:Math.PI/8,top:'#a67c52'});
  for(let i=0;i<3;i++)xgBox(G,2.4,.25*(i+1),.4,'#d4cbb8',bx,.125*(i+1),bz+r*Math.cos(Math.PI/8)+.2+(2-i)*.4);
  for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4,x=bx+Math.cos(a)*(r-.35),z=bz+Math.sin(a)*(r-.35);xgPrism(G,.13,.11,2.9,6,'#f4f1ea',x,.75,z);
   const b=a+Math.PI/4,x2=bx+Math.cos(b)*(r-.35),z2=bz+Math.sin(b)*(r-.35);if(i!=1){const L=Math.hypot(x2-x,z2-z),ry=Math.atan2(-(z2-z),x2-x);xgBox(G,L,.08,.08,'#f4f1ea',(x+x2)/2,1.65,(z+z2)/2,ry);for(let k=1;k<6;k++)xgBox(G,.05,.85,.05,'#f4f1ea',x+(x2-x)*k/6,1.2,z+(z2-z)*k/6)}}
  xgPrism(G,r+.6,r+.6,.22,8,'#f4f1ea',bx,3.6,bz,{ph:Math.PI/8,cap:false});xgPrism(G,r+.6,.35,1.7,8,'#2f6b5a',bx,3.82,bz,{ph:Math.PI/8});xgPrism(G,.35,.12,.5,8,'#d4af37',bx,5.5,bz);
  pkObj(G,bx-1.2,bz-1.6,0,[[.6,.05,.4,'#333',0,1.35,0],[.04,.6,.04,'#333',0,1.05,0]]);pkObj(G,bx+1.4,bz-1,0,[[.6,.05,.4,'#333',0,1.35,0],[.04,.6,.04,'#333',0,1.05,0]]);
  col(bx-r*.86,bz-r*.86,bx+r*.86,bz+r*.86);CPARK.zones.push(['bandstand',bx-7,bz-7,bx+7,bz+13,bx,bz]);
  for(let i=-2;i<=2;i++)if(i)pkBench(G,bx+i*2.6,bz+9.5,0);for(let i=-2;i<=2;i++)if(i)pkBench(G,bx+i*2.6,bz+11.8,0)}
 /* 7. gazebo north of the pond */
 {const gx=PCX,gz=gzz-7.2,r=2.9;xgPrism(G,r,r,.12,6,'#a67c52',gx,0,gz,{top:'#b8895c'});for(let i=0;i<6;i++){const a=i*Math.PI/3,x=gx+Math.cos(a)*(r-.25),z=gz+Math.sin(a)*(r-.25);xgPrism(G,.11,.1,2.5,6,'#f4f1ea',x,.12,z);
   const b=a+Math.PI/3,x2=gx+Math.cos(b)*(r-.25),z2=gz+Math.sin(b)*(r-.25);if(i!=1){const L=Math.hypot(x2-x,z2-z),ry=Math.atan2(-(z2-z),x2-x);xgBox(G,L,.07,.07,'#f4f1ea',(x+x2)/2,.95,(z+z2)/2,ry);xgBox(G,L-.3,.3,.04,'#f4f1ea',(x+x2)/2,.55,(z+z2)/2,ry)}}
  xgPrism(G,r+.4,0,1.5,6,'#8a3b2a',gx,2.6,gz);xgPrism(G,r+.4,r+.4,.12,6,'#f4f1ea',gx,2.5,gz,{cap:false});xgPrism(G,.12,.05,.4,6,'#d4af37',gx,4.05,gz);
  [-1,1].forEach(s=>pkBench(G,gx+s*1.3,gz-.8,0));CPARK.zones.push(['gazebo',gx-4,gz-4,gx+4,gz+4,gx,gz]);for(let i=0;i<6;i++){const a=i*Math.PI/3,x=gx+Math.cos(a)*(r-.25),z=gz+Math.sin(a)*(r-.25);col(x-.15,z-.15,x+.15,z+.15)}}
 /* 8. formal flower garden between the north avenue and the pond */
 {const g0=101,g1=119,gz0=Z0+4,gz1=Z0+20;xgBox(G,g1-g0,.03,gz1-gz0,'#e2d6b8',(g0+g1)/2,.017,(gz0+gz1)/2);path(CX+1.8,(gz0+gz1)/2,g0,(gz0+gz1)/2,2);
  const FL=[['#e03a3a','#ff8a30'],['#ff6ad5','#fff'],['#b07aff','#7ab0ff'],['#ffe066','#ff8a30'],['#ff6ad5','#e03a3a'],['#fff','#b07aff']];
  for(let i=0;i<3;i++)for(let j=0;j<2;j++){const bx=g0+3.6+i*5.4,bz=gz0+4+j*8,w=4,d=2.6;xgBox(G,w+.4,.45,d+.4,'#3f7a3a',bx,.225,bz,0,'#4a8a40');xgBox(G,w,.3,d,'#5a3d22',bx,.16,bz);
   const f=FL[i*2+j];for(let a=-w/2+.3;a<w/2-.2;a+=.42)for(let b=-d/2+.3;b<d/2-.2;b+=.42)xgBox(G,.2,.18,.2,(Math.round((a+b)*2.4)%2)?f[0]:f[1],bx+a,.42,bz+b);CPARK.beds.push([bx-w/2-.2,bz-d/2-.2,bx+w/2+.2,bz+d/2+.2,f[0]]);col(bx-w/2-.2,bz-d/2-.2,bx+w/2+.2,bz+d/2+.2)}
  const ux=g0+9,uz=(gz0+gz1)/2;xgPrism(G,.5,.4,.6,8,'#bfb6a6',ux,0,uz);xgPrism(G,.3,.55,.5,8,'#d4cbb8',ux,.6,uz,{top:'#5a3d22'});pkBush(G,ux,uz,.6,'#3f8f3a','#ff6ad5');col(ux-.5,uz-.5,ux+.5,uz+.5);
  for(let x=g0+1;x<g1;x+=4.5){pkBench(G,x+1,gz0-.6,0)}CPARK.zones.push(['garden',g0-1,gz0-1.2,g1+1,gz1+1])}
 /* 9. playground: rubber floor, low fence, swings, slide, climbing frame, see-saw, roundabout, spring riders, sandpit */
 {const p0=30,p1=58,q0=SW-14,q1=Z1-8.4;xgBox(G,p1-p0,.03,q1-q0,'#c96b4b',(p0+p1)/2,.017,(q0+q1)/2);CPARK.zones.push(['play',p0-1,q0-1,p1+1,q1+1]);
  const fence=(x0,z0,x1,z1,gap)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.round(L/1.5);for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;if(gap&&Math.hypot(x-gap[0],z-gap[1])<1.4)continue;xgBox(G,.1,.9,.1,'#2b4535',x,.45,z)}
   const runs=gap?[[0,(Math.hypot(gap[0]-x0,gap[1]-z0)-1.3)/L],[(Math.hypot(gap[0]-x0,gap[1]-z0)+1.3)/L,1]]:[[0,1]];runs.forEach(([a,b])=>{if(b<=a)return;const xa=x0+(x1-x0)*a,za=z0+(z1-z0)*a,xb=x0+(x1-x0)*b,zb=z0+(z1-z0)*b,ry=Math.atan2(-(zb-za),xb-xa),l=Math.hypot(xb-xa,zb-za);[.4,.8].forEach(y=>xgBox(G,l,.06,.05,'#2b4535',(xa+xb)/2,y,(za+zb)/2,ry));
    const nx=Math.abs(xb-xa)>Math.abs(zb-za);col(nx?Math.min(xa,xb):xa-.1,nx?za-.1:Math.min(za,zb),nx?Math.max(xa,xb):xa+.1,nx?za+.1:Math.max(za,zb))})};
  fence(p0,q0,p1,q0);fence(p0,q1,p1,q1,[40,q1]);fence(p0,q0,p0,q1);fence(p1,q0,p1,q1,[p1,SW]);
  /* swings */
  {const sx=p0+6,sz=q0+4;[-2.4,2.4].forEach(o=>{xgBoxR(G,.12,2.6,.12,'#c0392b',sx+o,1.25,sz-.55,.4,0,0);xgBoxR(G,.12,2.6,.12,'#c0392b',sx+o,1.25,sz+.55,-.4,0,0);col(sx+o-.15,sz-1.2,sx+o+.15,sz+1.2)});xgBox(G,5,.14,.14,'#c0392b',sx,2.45,sz);
   [-1.1,1.1].forEach(o=>{xgBox(G,.03,1.8,.03,'#999',sx+o-.25,1.5,sz);xgBox(G,.03,1.8,.03,'#999',sx+o+.25,1.5,sz);xgBox(G,.6,.05,.25,'#2a2a2e',sx+o,.6,sz)})}
  /* slide */
  {const sx=p0+15,sz=q0+4.5;[[-.55,-.55],[.55,-.55],[-.55,.55],[.55,.55]].forEach(q=>xgBox(G,.12,1.5,.12,'#2d5a8d',sx+q[0],.75,sz+q[1]));xgBox(G,1.25,.1,1.25,'#e6b422',sx,1.5,sz);[-.6,.6].forEach(o=>xgBox(G,.06,.5,1.25,'#2d5a8d',sx+o,1.8,sz));
   [-.3,.3].forEach(o=>xgBoxR(G,.07,1.8,.07,'#2d5a8d',sx+o,.8,sz-1.05,.35,0,0));for(let k=1;k<5;k++)xgBox(G,.6,.05,.05,'#2d5a8d',sx,k*.32,sz-.65-(1.5-k*.32)*.36);
   const L=3.1,an=Math.atan2(1.4,2.7);xgBoxR(G,.7,.06,L,'#e6b422',sx,.78,sz+.62+1.35,an,0,0);[-.37,.37].forEach(o=>xgBoxR(G,.06,.22,L,'#d35400',sx+o,.88,sz+.62+1.35,an,0,0));col(sx-.7,sz-1.5,sx+.7,sz+3.4)}
  /* climbing frame */
  {const cx=p0+23,cz=q0+5,s=2.6,h=2.2,C=['#2f8f5a','#e6b422','#c0392b'];for(let i=0;i<=2;i++)for(let j=0;j<=2;j++)xgBox(G,.08,h,.08,C[(i+j)%3],cx-s/2+i*s/2,h/2,cz-s/2+j*s/2);
   [.75,1.5,2.2].forEach((y,k)=>{for(let i=0;i<=2;i++){xgBox(G,s,.07,.07,C[k],cx,y,cz-s/2+i*s/2);xgBox(G,.07,.07,s,C[(k+1)%3],cx-s/2+i*s/2,y,cz)}});col(cx-s/2-.1,cz-s/2-.1,cx+s/2+.1,cz+s/2+.1)}
  /* see-saw, roundabout, spring riders, sandpit */
  {const x=p0+6,z=q1-5;xgBox(G,.3,.5,.3,'#555',x,.25,z);xgBoxR(G,3.6,.1,.32,'#2d5a8d',x,.55,z,0,0,.16);[-1.5,1.5].forEach(o=>xgBox(G,.06,.3,.3,'#333',x+o,.55+o*.16+.18,z));col(x-1.8,z-.3,x+1.8,z+.3)}
  {const x=p0+14,z=q1-5;xgPrism(G,1.3,1.3,.14,12,'#c0392b',x,.12,z,{top:'#e6b422'});xgPrism(G,.12,.12,.9,6,'#555',x,.26,z);for(let i=0;i<4;i++){const a=i*Math.PI/2;xgBox(G,.05,.5,.05,'#555',x+Math.cos(a)*1.05,.5,z+Math.sin(a)*1.05);xgBox(G,1.1,.05,.05,'#555',x+Math.cos(a)*.55,.78,z+Math.sin(a)*.55,-a)}col(x-.95,z-.95,x+.95,z+.95)}
  [[p0+20,q1-4,'#e6b422'],[p0+22,q1-6,'#2f8f5a']].forEach(([x,z,c])=>{xgPrism(G,.12,.12,.4,6,'#555',x,0,z);xgBox(G,.7,.35,.28,c,x,.6,z);xgBox(G,.25,.3,.26,c,x+.3,.85,z);xgBox(G,.04,.04,.4,'#333',x+.15,.95,z);col(x-.4,z-.2,x+.4,z+.2)});
  {const x=p1-4,z=q1-5;xgBox(G,4.4,.25,.2,'#a0522d',x,.12,z-2.1);xgBox(G,4.4,.25,.2,'#a0522d',x,.12,z+2.1);xgBox(G,.2,.25,4.4,'#a0522d',x-2.1,.12,z);xgBox(G,.2,.25,4.4,'#a0522d',x+2.1,.12,z);xgBox(G,4,.05,4,'#e8d39a',x,.07,z);xgBox(G,.5,.25,.5,'#e8d39a',x+.6,.15,z-.4);xgBox(G,.3,.2,.2,'#d35400',x-.8,.15,z+.6)}
  pkBench(G,p1-6,q0+1.2,0);pkBench(G,p1-3.5,q0+1.2,0);pkBin(G,p1-1.6,q0+1.1)}
 /* 10. picnic lawn: tables and barbecues */
 {const tz=SW-9;for(let i=0;i<6;i++){const x=115+i*7.5+R(-1,1),z=tz+R(-2,2),ry=Math.random()<.5?0:Math.PI/2;if(Math.abs(x-140)<2.5||Math.abs(x-150)<2.2)continue;
   pkObj(G,x,z,ry,[[1.9,.08,.85,'#a06a3c',0,.76,0,'#b57a48'],[1.9,.06,.3,'#a06a3c',0,.45,.65],[1.9,.06,.3,'#a06a3c',0,.45,-.65],[.1,.74,.1,'#7a5236',-.75,.37,.3],[.1,.74,.1,'#7a5236',.75,.37,.3],[.1,.74,.1,'#7a5236',-.75,.37,-.3],[.1,.74,.1,'#7a5236',.75,.37,-.3],[.1,.06,1.6,'#7a5236',-.75,.4,0],[.1,.06,1.6,'#7a5236',.75,.4,0]]);
   ry?col(x-1,z-1.05,x+1,z+1.05):col(x-1.05,z-1,x+1.05,z+1)}
  [[121,tz-4],[146,tz-4.5]].forEach(([x,z])=>{[-.25,.25].forEach(o=>xgBox(G,.06,.7,.06,'#333',x+o,.35,z));xgBox(G,.7,.25,.45,'#2a2a2e',x,.8,z,0,'#555');col(x-.4,z-.3,x+.4,z+.3)});pkBin(G,131,tz-3);pkBin(G,156,tz+2);CPARK.zones.push(['picnic',112,tz-6,160,tz+4])}
 /* 11. hedge round the park with gate pillars */
 {const H='#2f6b33',HT='#3a7d3c',gaps={s:[40,CX,150],n:[CX],w:[CZ],e:[SW]},run=(a,b,fix,horiz,gl)=>{let s=a;gl.slice().sort((p,q)=>p-q).concat([b+99]).forEach(g=>{const e=Math.min(b,g-2.2);if(e-s>.3){const m=(s+e)/2,L=e-s;horiz?xgBox(G,L,.9,.8,H,m,.45,fix,0,HT):xgBox(G,.8,.9,L,H,fix,.45,m,0,HT);horiz?col(s,fix-.4,e,fix+.4):col(fix-.4,s,fix+.4,e)}
   if(g<b+50){[g-2.2,g+2.2].forEach(p=>{horiz?(xgBox(G,.8,1.5,.8,'#bfb6a6',p,.75,fix),xgBox(G,1,.15,1,'#d4cbb8',p,1.57,fix),xgPrism(G,.25,.1,.25,6,'#d4cbb8',p,1.65,fix)):(xgBox(G,.8,1.5,.8,'#bfb6a6',fix,.75,p),xgBox(G,1,.15,1,'#d4cbb8',fix,1.57,p),xgPrism(G,.25,.1,.25,6,'#d4cbb8',fix,1.65,p))});s=g+2.2}})};
  run(X0,X1,Z1-.4,1,gaps.s);run(X0,X1,Z0+.4,1,gaps.n);run(Z0+.8,Z1-.8,X0+.4,0,gaps.w);run(Z0+.8,Z1-.8,X1-.4,0,gaps.e)}
 /* 12. flower beds along the south avenue, between the gate and the south walk */
 [-1,1].forEach(s=>{const bx=CX+s*4.1,z0=Z1-2.2,z1=SW+2.2,L=z0-z1,bz=(z0+z1)/2;xgBox(G,1.6,.3,L,'#b8ab92',bx,.15,bz,0,'#cdbfa5');xgBox(G,1.3,.32,L-.3,'#5a3d22',bx,.16,bz);
  const C=s<0?['#e03a3a','#ffe066','#ff8a30']:['#ff6ad5','#fff','#b07aff'];C.forEach((c,i)=>{xgBox(G,.34,.14,L-.5,c,bx-.4+i*.4,.38,bz);for(let z=z1+.4;z<z0-.3;z+=.55)xgBox(G,.2,.12,.2,pkLt(c,1.1),bx-.4+i*.4,.48,z+R(-.1,.1))});CPARK.beds.push([bx-.8,z1,bx+.8,z0,C[0]]);col(bx-.8,z1,bx+.8,z0)});
 /* 13. trees, bushes, benches, lamps, bins */
 const T=[],near=(x,z,r)=>T.some(t=>Math.hypot(t[0]-x,t[1]-z)<r),onPath=(x,z,r)=>CPARK.paths.some(p=>segD(x,z,p)<p[4]/2+r),inZone=(x,z,r)=>CPARK.zones.some(q=>x>q[1]-r&&x<q[3]+r&&z>q[2]-r&&z<q[4]+r),
  inLoop=(x,z,r)=>inPoly(x,z,lpO)||segDLoop(x,z)<r,segDLoop=(x,z)=>{let b=99;for(let i=0;i<N;i+=2)b=Math.min(b,Math.hypot(lpM[i][0]-x,lpM[i][1]-z));return b-1.1},
  free=(x,z,r)=>x>X0+1.6&&x<X1-1.6&&z>Z0+1.6&&z<Z1-1.6&&!onPath(x,z,r)&&!inZone(x,z,r)&&!inLoop(x,z,r)&&!CPARK.beds.some(b=>x>b[0]-r&&x<b[2]+r&&z>b[1]-r&&z<b[3]+r);
 const plant=(x,z,k,s)=>{pkTree(G,x,z,k,s);T.push([x,z])};
 /* avenue: cherry blossom south of the fountain, limes (oak model) to the north */
 for(let z=Z1-4;z>PL+2;z-=6.5)[-1,1].forEach(s=>{if(Math.abs(z-SW)<3)return;plant(CX+s*(PW/2+3.4),z,'cherry',R(.85,1))});
 for(let z=PN-3;z>Z0+3;z-=7)[-1,1].forEach(s=>{const x=CX+s*(PW/2+2.6);if(s>0&&z<Z0+21.5&&z>Z0+2.6)return;plant(x,z,'oak',R(.9,1.05))});
 /* willows round the pond (on the strip between the shore and the loop) */
 for(let i=3;i<N;i+=11){const p=ring(1.3)[i];if(Math.abs(p[0]-140)<4&&p[1]>PCZ)continue;plant(p[0],p[1],'willow',R(.75,.85))}
 /* woods: pines and birches in the north-west, poplars along the west walk, pines in the north-east corner */
 for(let i=0;i<70;i++){const x=R(X0+2,40),z=R(Z0+2,CZ-3);if(free(x,z,1.4)&&!near(x,z,3))plant(x,z,Math.random()<.65?'pine':'birch',R(.85,1.25))}
 for(let x=8;x<CX-12;x+=8){[-1,1].forEach(s=>{const z=CZ+s*3.6;if(free(x,z,.6)&&!near(x,z,2.5))plant(x,z,'poplar',R(.9,1.1))})}
 for(let i=0;i<40;i++){const x=R(172,X1-2),z=R(Z0+2,Z0+30);if(free(x,z,1.4)&&!near(x,z,3))plant(x,z,'pine',R(.85,1.2))}
 /* everywhere else: a mix of oaks, maples, cherries and birches */
 const MIX=['oak','oak','oak','maple','maple','cherry','birch'];for(let i=0;i<900&&T.length<215;i++){const x=R(X0+2,X1-2),z=R(Z0+2,Z1-2);if(free(x,z,1.6)&&!near(x,z,4.2))plant(x,z,pick(MIX),R(.8,1.25))}
 /* bushes: along the hedge, near paths and the plaza, some flowering */
 for(let i=0;i<1500&&CPARK.bush.length<190;i++){const x=R(X0+1.5,X1-1.5),z=R(Z0+1.5,Z1-1.5),edge=Math.min(x-X0,X1-x,z-Z0,Z1-z)<3.5,byPath=CPARK.paths.some(p=>{const d=segD(x,z,p);return d>p[4]/2+.9&&d<p[4]/2+2.2});
  if(!(edge||byPath&&Math.random()<.5)||!free(x,z,.9)||near(x,z,1.8)||CPARK.bush.some(b=>Math.hypot(b[0]-x,b[1]-z)<1.6))continue;pkBush(G,x,z,R(.7,1.25),pick(CPKC),Math.random()<.3?pick(['#ff6ad5','#fff','#7ab0ff','#ffe066','#e03a3a']):null)}
 /* lamps every ~15 m and benches every ~17 m along each straight path (both sides, staggered), a bin by some benches */
 const LMP=[];CPARK.paths.forEach(p=>{const L=Math.hypot(p[2]-p[0],p[3]-p[1]);if(L<8)return;const ux=(p[2]-p[0])/L,uz=(p[3]-p[1])/L,nx=-uz,nz=ux;
  for(let u=5;u<L-3;u+=15){const s=(u/15|0)%2?1:-1,o=p[4]/2+.55,x=p[0]+ux*u+nx*o*s,z=p[1]+uz*u+nz*o*s;if(!onPath(x,z,.25)&&!inZone(x,z,.3)&&!LMP.some(l=>Math.hypot(l[0]-x,l[1]-z)<9)&&!inLoop(x,z,.2)){pkLamp(G,x,z);LMP.push([x,z])}}
  for(let u=11;u<L-4;u+=17){const s=(u/17|0)%2?-1:1,o=p[4]/2+.75,x=p[0]+ux*u+nx*o*s,z=p[1]+uz*u+nz*o*s;if(onPath(x,z,.3)||inZone(x,z,.5)||inLoop(x,z,.3)||near(x,z,1.4)||LMP.some(l=>Math.hypot(l[0]-x,l[1]-z)<1.5))continue;
   pkBench(G,x,z,Math.atan2(-s*nx,-s*nz));if(Math.random()<.4)pkBin(G,x+ux*1.25,z+uz*1.25)}});
 /* lamps and benches round the pond loop */
 for(let i=0;i<N;i+=7){const p=lpO[i],q=ring(6.6)[i];if(!LMP.some(l=>Math.hypot(l[0]-q[0],l[1]-q[1])<6)&&!onPath(q[0],q[1],.2)){pkLamp(G,q[0],q[1]);LMP.push(q)}}
 for(let i=3;i<N;i+=7){const q=ring(7)[i],a=Math.atan2(q[1]-PCZ,q[0]-PCX);if(onPath(q[0],q[1],.4)||near(q[0],q[1],1.4))continue;pkBench(G,q[0],q[1],Math.atan2(-Math.cos(a),-Math.sin(a)))}
 LMP.forEach(l=>CTD.trees.push(l));T.forEach(t=>CTD.trees.push(t));CPARK.bush.forEach(b=>CTD.trees.push([b[0],b[1]]));
 xgFlush(G);xgFlush(CPARK.gl,new THREE.MeshBasicMaterial({vertexColors:true}));CPARK.gl=null;FTN.forEach(f=>{if(!f.wm)ftnWater(f)});
 /* 14. ducks (mallards, white ducks and ducklings) swimming round the island */
 {const D=xgNew();D.all=1;const B=xgCell(D,30,30);const db=(w,h,d,c,x,y,z)=>xgBox(D,w,h,d,c,x+30,y,z+30);
  db(.42,.18,.24,'#8a6a48',0,.09,0);db(.14,.12,.2,'#f2f2f2',-.24,.13,0);db(.16,.14,.2,'#6b4a2e',.17,.13,0);db(.08,.16,.1,'#f4f1ea',.24,.25,0);db(.15,.14,.13,'#1f6b3a',.27,.36,0);db(.1,.04,.07,'#e6a21a',.38,.34,0);
  const geo=xgGeo(B).translate(-30,0,-30),M=new THREE.MeshLambertMaterial({vertexColors:true}),n=11,im=new THREE.InstancedMesh(geo,M,n);im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(im);
  const W=xgNew();W.all=1;const BW=xgCell(W,30,30);[[.42,.18,.24,'#f4f4f0',0,.09,0],[.14,.12,.2,'#e8e8e4',-.24,.13,0],[.15,.22,.13,'#f4f4f0',.24,.3,0],[.12,.05,.08,'#e6a21a',.36,.32,0]].forEach(a=>xgBox(W,a[0],a[1],a[2],a[3],a[4]+30,a[5],a[6]+30));
  const iw=new THREE.InstancedMesh(xgGeo(BW).translate(-30,0,-30),M,3);iw.frustumCulled=false;iw.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(iw);
  const L=[];for(let i=0;i<4;i++){const ra=R(7.5,15),rb=ra*R(.5,.62),ph=R(0,6.28),sp=R(.25,.45)*(Math.random()<.5?-1:1);L.push({m:im,i:L.filter(q=>q.m===im).length,ra,rb,ph,sp,s:1,o:0});if(i<2)for(let k=1;k<=2;k++)L.push({m:im,i:L.filter(q=>q.m===im).length,ra,rb,ph,sp,s:.5,o:-k*.11*Math.sign(sp)})}
  for(let i=0;i<3;i++)L.push({m:iw,i,ra:R(8,15),rb:R(5,8.5),ph:R(0,6.28),sp:R(.2,.35)*(i%2?1:-1),s:1.05,o:0});
  CPARK.ducks={L,im,iw,O:new THREE.Object3D(),c:[PCX,PCZ],wy:WY};CPARK.on=true;parkTick(0,1)}
 /* 15. people out for a walk */
 {const cfg=()=>({skin:RI(0,5),eyes:RI(0,4),mouth:RI(0,3),hair:RI(0,11),hc:RI(0,11),top:RI(0,4),tc:RI(0,9),pc:RI(0,7),body:Math.random()});
  [[CZ-.6,X0+3,CX-10],[SW+.5,60,93],[SW-.5,97,185]].forEach(([z,a,b])=>{for(let i=0;i<2;i++)addNPC(z,R(a,b),a,b,R(.7,1.3),Math.random()<.4)});
  [[CX-.8,Z1+1,PL-1],[CX+.8,Z1+1,PL-1],[CX+.7,PN+1,Z0+1]].forEach(([x,a,b])=>{const o=buildChar(cfg());o.g.visible=false;scene.add(o.g);VPED.push({m:o.g,legs:o.legs,arms:o.arms,x,x0:x,z:R(b,a),mn:Math.min(a,b),mx:Math.max(a,b),dir:Math.random()<.5?1:-1,sp:R(.7,1.3),t:R(0,6)})})}
 const lk=POIS.find(p=>p[2]=='Lake');if(lk){lk[0]=PCX;lk[1]=PCZ+PB+3}CPARK.on=true}
xgCell=(f=>function(G,x,z){const B=f(G,x,z);if(G.all)B.all=1;return B})(xgCell);
{const q0=xgQuad;xgQuad=function(B,p,col){if(!B.all)return q0(B,p,col);const n=xgNrm(p[0],p[1],p[3])||xgNrm(p[1],p[2],p[0]);if(!n)return;const k=xgPush(B,p,col,...n);B.I.push(k,k+1,k+2,k,k+2,k+3)}}
{const t0=xgTri;xgTri=function(B,a,b,c,col){if(!B.all)return t0(B,a,b,c,col);const n=xgNrm(a,b,c);if(!n)return;const k=xgPush(B,[a,b,c],col,...n);B.I.push(k,k+1,k+2)}}

/* ---- every frame near the park: ducks paddle, the pond ripples drift ---- */
function parkTick(dt,force){if(!CPARK.on)return;const near=force||!IN&&P.x>-40&&P.x<230&&P.z>WZ(-139.5)-40&&P.z<WZ(-44.5)+40;CPARK.ducks.im.visible=CPARK.ducks.iw.visible=near;if(!near)return;
 const t=FTX.t,w=CPARK.water;w.offset.x=(w.offset.x+dt*.03)%1;w.offset.y=(w.offset.y+dt*.017)%1;const D=CPARK.ducks,O=D.O;
 D.L.forEach((d,j)=>{d.ph+=d.sp*dt/Math.max(d.ra,1)*1.6;const a=d.ph+d.o,x=D.c[0]+Math.cos(a)*d.ra,z=D.c[1]+Math.sin(a)*d.rb,vx=-Math.sin(a)*d.ra*Math.sign(d.sp),vz=Math.cos(a)*d.rb*Math.sign(d.sp);
  O.position.set(x,D.wy+.005+Math.sin(t*3+j)*.012,z);O.rotation.set(0,Math.atan2(-vz,vx),Math.sin(t*2+j)*.06);O.scale.setScalar(d.s);O.updateMatrix();d.m.setMatrixAt(d.i,O.matrix)});
 D.im.instanceMatrix.needsUpdate=true;D.iw.instanceMatrix.needsUpdate=true}
{const w1=worldTick;worldTick=function(dt){w1(dt);try{parkTick(dt)}catch(e){}}}
{const f4=flushSB;flushSB=function(){warpWorld();try{cityDetail()}catch(e){console.error('cityDetail',e)}try{parkedCars()}catch(e){console.error('parkedCars',e)}try{cityFix()}catch(e){console.error('cityFix',e)}try{parkBuild()}catch(e){console.error('parkBuild',e)}f4()}}

/* ---- maps: draw the park over the old lawn, lake and trees ---- */
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){m0(x,sx,sz,kx,kz,mini);if(!CPARK.on)return;const X0=0,X1=190,Z0=WZ(-139.5),Z1=WZ(-44.5),W=x.canvas.width,H=x.canvas.height;
 if(sx(X1)<-10||sx(X0)>W+10||sz(Z1)<-10||sz(Z0)>H+10)return;const k=(kx+kz)/2,poly=(p,c)=>{x.fillStyle=c;x.beginPath();p.forEach((q,i)=>i?x.lineTo(sx(q[0]),sz(q[1])):x.moveTo(sx(q[0]),sz(q[1])));x.closePath();x.fill()},
  rect=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(sx(a),sz(b),(c-a)*kx,(d-b)*kz)},ell=(cx,cz,r,col)=>{x.fillStyle=col;x.beginPath();x.ellipse(sx(cx),sz(cz),Math.max(.8,r*kx),Math.max(.8,r*kz),0,0,Math.PI*2);x.fill()};
 rect(X0,Z0,X1,Z1,'#5fae5f');if(k>1.2){x.strokeStyle='#2f6b33';x.lineWidth=Math.max(1,.8*k);x.strokeRect(sx(X0),sz(Z0),(X1-X0)*kx,(Z1-Z0)*kz)}
 const pd=CPARK.pond;poly(pd.beach,'#d8c9a0');x.strokeStyle='#e3d6b4';x.lineWidth=Math.max(1,2.2*k);x.beginPath();pd.loop.forEach((q,i)=>i?x.lineTo(sx(q[0]),sz(q[1])):x.moveTo(sx(q[0]),sz(q[1])));x.closePath();x.stroke();
 poly(pd.shore,'#4aa3df');ell(pd.c[0],pd.c[1],3.4,'#6aa85e');
 x.lineCap='round';CPARK.paths.forEach(p=>{if(p[0]==p[2]&&p[1]==p[3])return;x.lineWidth=Math.max(1,p[4]*k);x.beginPath();x.moveTo(sx(p[0]),sz(p[1]));x.lineTo(sx(p[2]),sz(p[3]));x.stroke()});x.lineCap='butt';
 ell(95,(Z0+Z1)/2,9.2,'#e3d6b4');ell(95,(Z0+Z1)/2,4,'#cfc6b4');ell(95,(Z0+Z1)/2,2.9,'#4aa3df');
 CPARK.zones.forEach(z=>{if(z[0]=='play')rect(z[1]+1,z[2]+1,z[3]-1,z[4]-1,'#c96b4b');else if(z[0]=='bandstand')ell(z[5],z[6],5,'#2f6b5a');else if(z[0]=='gazebo')ell(z[5],z[6],3,'#8a3b2a');else if(z[0]=='garden')rect(z[1]+1,z[2]+1.2,z[3]-1,z[4]-1,'#e2d6b8')});
 CPARK.beds.forEach(b=>rect(b[0],b[1],b[2],b[3],b[4]));
 const TC={pine:'#1f4f2a',poplar:'#3d7d3a',birch:'#8cc65a',willow:'#7fa94a',cherry:'#f4a6c6',maple:'#d9772b',oak:'#2e6b35'},ts=Math.max(1.5,1.5*kx);
 if(k>.7)CPARK.bush.forEach(b=>{const X=sx(b[0]),Z=sz(b[1]);if(X>-4&&Z>-4&&X<W+4&&Z<H+4){x.fillStyle='#3f8f3a';x.fillRect(X-ts*.35,Z-ts*.35,ts*.7,ts*.7)}});
 CPARK.trees.forEach(t=>{const X=sx(t[0]),Z=sz(t[1]);if(X>-4&&Z>-4&&X<W+4&&Z<H+4){x.fillStyle=TC[t[2]]||'#2e6b35';const s=ts*(t[2]=='willow'?1.6:1);x.fillRect(X-s/2,Z-s/2,s,s)}})}}
