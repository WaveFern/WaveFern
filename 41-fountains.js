/* ===== v26.30.0: animated fountains =====
   Every fountain built with ftnBuild (40-city-fixes.js: the City Plaza; 42-central-park.js: the park) gets moving water:
   - the basin and both bowls are rippling water surfaces (a small radial grid whose heights are moved each frame, drawn
     flat-shaded with a highlight so the ripples catch the light)
   - a jet from the top spout, water spilling over the rim of both bowls, and on big fountains a ring of arching jets
     in the basin: one THREE.Points cloud per fountain (about 150 droplets), simple gravity
   - droplets that land bounce up as short white splashes, and a ring of foam pulses where the curtain hits the basin
   ftnJet adds a single upward jet (the pond in the park). Everything only animates (and the droplets only show) while
   you are within 45 m, so it costs nothing elsewhere. */
const FTX={t:0,L:[]};
/* radial grid: centre + rings, faces up; keeps each vertex's radius and angle for the ripple function */
function rippleGeo(r,rings,segs){const P=[0,0,0],RA=[0],AN=[0],I=[];for(let i=1;i<=rings;i++)for(let j=0;j<segs;j++){const a=j/segs*Math.PI*2,rr=r*i/rings;P.push(Math.cos(a)*rr,0,Math.sin(a)*rr);RA.push(rr);AN.push(a)}
 const v=(i,j)=>i==0?0:1+(i-1)*segs+(j%segs);for(let j=0;j<segs;j++)I.push(0,v(1,j+1),v(1,j));
 for(let i=1;i<rings;i++)for(let j=0;j<segs;j++){I.push(v(i+1,j+1),v(i+1,j),v(i,j),v(i+1,j+1),v(i,j),v(i,j+1))}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(P.map((_,k)=>k%3==1?1:0),3));g.setIndex(I);g.computeBoundingSphere();g.boundingSphere.radius+=.2;g.userData={RA,AN,r};return g}
const FTWM=new THREE.MeshPhongMaterial({color:'#3f9ad6',specular:'#d8f2ff',shininess:60,flatShading:true,transparent:true,opacity:.9});
function ftnSurf(F,x,y,z,r,rings,segs,wave){const g=rippleGeo(r,rings,segs),m=new THREE.Mesh(g,FTWM);m.position.set(x,y,z);scene.add(m);F.surf.push({g,wave});return m}
/* the droplet cloud: src = [{n, emit(p) -> sets p.x..p.vz}], land(x,z) = height the water stops at */
function ftnPts(F,src,land){const n=src.reduce((a,s)=>a+s.n,0),pos=new Float32Array(n*3),colA=new Float32Array(n*3),D=[];
 src.forEach(s=>{for(let i=0;i<s.n;i++)D.push({s,x:0,y:0,z:0,vx:0,vy:0,vz:0,sp:0,l:0})});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(colA,3));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(F.x,1.5,F.z),F.R+3);
 const pts=new THREE.Points(g,new THREE.PointsMaterial({size:2,sizeAttenuation:false,vertexColors:true}));pts.frustumCulled=true;scene.add(pts);
 const S={D,g,pts,land,pos,colA};D.forEach(p=>{p.s.emit(p);p.sp=0});
 /* start mid-flight, not all at the spout */
 for(let k=0;k<70;k++)ftnStep(S,.025);F.ps.push(S);return S}
function ftnStep(S,dt){const{D,pos,colA}=S;for(let i=0;i<D.length;i++){const p=D[i];p.vy-=9.8*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
  if(p.sp){p.l-=dt;if(p.l<=0){p.sp=0;p.s.emit(p)}}
  else if(p.vy<0){const h=S.land(p.x,p.z);if(p.y<=h){p.y=h;p.sp=1;p.l=R(.18,.38);p.vy=R(.5,1.2);p.vx=R(-.45,.45);p.vz=R(-.45,.45)}}
  pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;const c=p.sp?1:.82;colA[i*3]=c;colA[i*3+1]=p.sp?1:.94;colA[i*3+2]=1}
 S.g.attributes.position.needsUpdate=true;S.g.attributes.color.needsUpdate=true}
/* tiered fountain from ftnBuild: f = {x,z,R,wy,bowls:[{y,r}],top} */
function ftnWater(f){if(f.wm)return;f.wm=1;const F={x:f.x,z:f.z,R:f.R,surf:[],ps:[],foam:null},wr=f.R-.35,b1=f.bowls[0],b2=f.bowls[1],big=f.R>3;
 ftnSurf(F,f.x,f.wy,f.z,wr,10,32,(r,a,t)=>(.045*Math.sin(6.5*(r-b1.r)-5.5*t)*Math.exp(-.7*Math.abs(r-b1.r))+.018*Math.sin(5*a+3*t+2*r)+(big?.03*Math.sin(7*r-6*t)*Math.max(0,r-wr+1.4):0))*(r>wr-.05?.3:1));
 ftnSurf(F,f.x,b1.y,f.z,b1.r-.12,4,20,(r,a,t)=>.025*Math.sin(8*r-7*t)+.01*Math.sin(4*a+5*t));
 ftnSurf(F,f.x,b2.y,f.z,b2.r-.1,3,14,(r,a,t)=>.02*Math.sin(10*r-9*t));
 const fm=new THREE.Mesh(new THREE.RingGeometry(b1.r-.05,b1.r+.32,28),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.45,depthWrite:false}));fm.rotation.x=-Math.PI/2;fm.position.set(f.x,f.wy+.03,f.z);scene.add(fm);F.foam=fm;
 const X=f.x,Z=f.z,rad=(p,r,a,y)=>{p.x=X+Math.cos(a)*r;p.z=Z+Math.sin(a)*r;p.y=y},vel=(p,a,vr,vy)=>{p.vx=Math.cos(a)*vr;p.vz=Math.sin(a)*vr;p.vy=vy};
 const src=[{n:big?56:40,emit:p=>{const a=R(0,6.283);rad(p,.03,a,f.top);vel(p,a,R(.25,.6),big?R(3.2,3.9):R(2.6,3.2))}},
  {n:big?54:40,emit:p=>{const a=R(0,6.283);rad(p,b1.r+.03,a,b1.y+.04);vel(p,a,R(.12,.32),R(-.1,.12))}},
  {n:20,emit:p=>{const a=R(0,6.283);rad(p,b2.r+.03,a,b2.y+.03);vel(p,a,R(.1,.25),R(-.05,.1))}}];
 if(big)src.push({n:80,emit:p=>{const k=RI(0,7),a=k*Math.PI/4+R(-.03,.03);rad(p,wr-.45,a,f.wy);vel(p,a,-R(1.35,1.6),R(2.3,2.6))}});
 ftnPts(F,src,(x,z)=>{const r=Math.hypot(x-X,z-Z);return r<b2.r?b2.y:r<b1.r?b1.y:r<wr?f.wy:0});FTX.L.push(F)}
/* a single jet straight up out of a pond (water level wy), h metres high */
function ftnJet(x,z,wy,h,surfR){const F={x,z,R:2,surf:[],ps:[],foam:null},v=Math.sqrt(2*9.8*h);
 if(surfR)ftnSurf(F,x,wy,z,surfR,5,24,(r,a,t)=>.03*Math.sin(7*r-6*t)*Math.max(0,1-r/surfR)+.01*Math.sin(3*a+2*t));
 ftnPts(F,[{n:60,emit:p=>{const a=R(0,6.283);p.x=x;p.z=z;p.y=wy+.05;p.vx=Math.cos(a)*R(.1,.45);p.vz=Math.sin(a)*R(.1,.45);p.vy=v*R(.8,1)}}],()=>wy);FTX.L.push(F);return F}
function ftnTick(dt){FTX.t+=dt;const t=FTX.t;FTX.L.forEach(F=>{const on=!IN&&Math.abs(P.x-F.x)<45&&Math.abs(P.z-F.z)<45;F.ps.forEach(S=>S.pts.visible=on);if(!on)return;
  F.ps.forEach(S=>ftnStep(S,Math.min(dt,.04)));
  F.surf.forEach(s=>{const p=s.g.attributes.position,RA=s.g.userData.RA,AN=s.g.userData.AN;for(let i=0;i<RA.length;i++)p.setY(i,s.wave(RA[i],AN[i],t));p.needsUpdate=true});
  if(F.foam){F.foam.material.opacity=.32+.14*Math.sin(t*7);const s=1+.04*Math.sin(t*5);F.foam.scale.set(s,s,1)}})}
{const w0=worldTick;worldTick=function(dt){w0(dt);try{ftnTick(dt)}catch(e){}}}
