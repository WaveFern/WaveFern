/* ===== dev only: Surf Break, a surfing minigame on the east coast of the island (v55.14.0) =====
   Loaded after dev-mastery-v1.js. Add ?nosurf to skip it. Nothing runs unless the island is on.
   PLACE   A surf spot on the east coast: beach shack with a board rental stand (rent a board $10; after 3 rentals the shack gives you
           your own board), board rack, lifeguard tower, surf report signpost (today's swell and wind), palms, three people on the sand.
           Blocky, real metres, merged box batches (a handful of draw calls). Props are solid (cols); you stand on the sand.
   WAVES   A separate overlay mesh (the "surf mesh") lies on the sea in front of the spot and is displaced on the CPU every frame while you
           are near. Overlay alpha is 0 wherever there is no wave, so it blends into the island sea with no seam. Each wave is a moving crest line
           (u = distance out from the waterline, s = along the shore, sea on the left of +s) with a face height, a peel point that runs along it,
           a hollowness and a tube: the green face is a Lagrangian profile that morphs into a barrel curve (lip, tube, foot) near the peel point,
           and behind the peel point it turns into whitewater. The rider is placed ON that same curve, so what you see is what you ride.
   RIDE    A/D (or arrows) carve up/down the face, W pumps, S stalls (sit in the barrel), Space pops up (timed) and launches off the lip;
           in the air hold nothing = grab, A/D = 360 spin, W = backflip, S = superman, then Space just before landing sticks it.
           Esc pauses. Sessions are about 2 minutes: wave sets of 3 to 5 with lulls. Three judges score every ride 0 to 10.
   LEVELS  Beginner swell, Reef, Point break, Big wave. A ride score at your top break unlocks the next one (thresholds in LV below).
   STATE   S.surf={best,rides,tubes,tricks,sessions,lvl,rent,own,tok} (lazy, old saves start empty, saved with the rest of S).
   HOOKS   FW_MASTERY.add('surf',..) after every ride and at session end (guarded). Test hook: window.FW_SURF (see the bottom).
   LOOK    (v55.24) smooth pose blending (exponential follow of a target pose: sitting wait, crawl stroke, keyframed pop-up, side-on stance with carve lean and pump,
           air tuck/grab, landing spring, kick-out claim, floppy wipeout, climb back on), a lofted surfboard mesh with rocker, stringer and fins, sphere spray with lip spray, camera shake.
   Mode is 'surf' while a session runs (own key handling in the capture phase, own camera through a renderer.render wrapper, HUD is #surfhud). */
(function(){
if(!window.FW_ISLAND||/[?&]nosurf/.test(location.search))return;
if(typeof THREE=='undefined'||typeof WORLD=='undefined'||typeof S=='undefined'||typeof renderer=='undefined'||typeof cam=='undefined'||typeof P=='undefined')return;
const FI=window.FW_ISLAND,CO=FI.coast;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rr=(a,b)=>a+Math.random()*(b-a);
const sn=k=>{try{snd(k)}catch(e){}},say2=t=>{try{say(t)}catch(e){}},sv=()=>{try{autoSave()}catch(e){}};
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};
const inPoly=(Q,x,z)=>{let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const st=()=>{let o=S.surf;if(!o||typeof o!='object')o=S.surf={};const d={best:0,rides:0,tubes:0,tricks:0,sessions:0,lvl:0,rent:0,own:0,tok:-1};for(const k in d)if(typeof o[k]!='number')o[k]=d[k];return o};

/* ---------- the spot: the straightest stretch of the east coast, and a frame that follows the real shoreline ----------
   s runs along the shore (south on the east coast), u is the distance out to sea from the waterline, so the sea is on the LEFT of +s. */
const DS=3,S0=-93,NC=98;/* column spacing, first column, number of columns: s from -93 to 198 */
let I0=0;{let best=1e9;const N=CO.length;
 for(let i=0;i<N;i++){const p=CO[i];if(p[0]<760||p[1]<-70||p[1]>40)continue;
  let acc=0,len=0,j=i;while(len<-S0+8&&j>i-60){const a=CO[(j+N)%N],b=CO[(j-1+N)%N];len+=Math.hypot(a[0]-b[0],a[1]-b[1]);j--}
  let a0=0,l2=0;j=i;let prev=null;for(let k=0;k<110&&l2<S0*-1+198;k++){const a=CO[(j+N)%N],b=CO[(j+1+N)%N],ang=Math.atan2(b[1]-a[1],b[0]-a[0]);if(prev!=null){let d=ang-prev;d=Math.atan2(Math.sin(d),Math.cos(d));acc+=Math.abs(d)}prev=ang;l2+=Math.hypot(b[0]-a[0],b[1]-a[1]);j++}
  const v=acc+Math.abs(p[1]-10)*.0006;if(v<best){best=v;I0=i}}}
/* resample the coast into evenly spaced columns around I0 */
const CX=new Float32Array(NC),CZ=new Float32Array(NC),NX=new Float32Array(NC),NZ=new Float32Array(NC),TX=new Float32Array(NC),TZ=new Float32Array(NC);
{const N=CO.length,pts=[];let cum=0;pts.push([CO[I0][0],CO[I0][1],0]);
 for(let k=1;k<=120;k++){const a=CO[(I0+k-1)%N],b=CO[(I0+k)%N];cum+=Math.hypot(b[0]-a[0],b[1]-a[1]);pts.push([b[0],b[1],cum])}
 cum=0;const back=[];for(let k=1;k<=60;k++){const a=CO[(I0-k+1+N)%N],b=CO[(I0-k+N)%N];cum+=Math.hypot(b[0]-a[0],b[1]-a[1]);back.push([b[0],b[1],-cum])}
 const all=back.reverse().concat(pts);
 const at=s=>{let i=0;while(i<all.length-2&&all[i+1][2]<s)i++;const a=all[i],b=all[i+1],t=clamp((s-a[2])/((b[2]-a[2])||1),0,1);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]};
 for(let i=0;i<NC;i++){const s=S0+i*DS,p=at(s),p1=at(s+4),p0=at(s-4),tx=p1[0]-p0[0],tz=p1[1]-p0[1],l=Math.hypot(tx,tz)||1;CX[i]=p[0];CZ[i]=p[1];TX[i]=tx/l;TZ[i]=tz/l;NX[i]=TZ[i];NZ[i]=-TX[i]}
 /* smooth the normals a little so the grid has no kinks */
 for(let k=0;k<3;k++)for(let i=1;i<NC-1;i++){const x=(NX[i-1]+2*NX[i]+NX[i+1])/4,z=(NZ[i-1]+2*NZ[i]+NZ[i+1])/4,l=Math.hypot(x,z)||1;NX[i]=x/l;NZ[i]=z/l}}
/* the sea must be on the left of +s: check one point and flip the whole frame if the coast ran the other way */
{const m=NC>>1,x=CX[m]+NX[m]*6,z=CZ[m]+NZ[m]*6;if(inPoly(CO,x,z)){for(let i=0;i<NC;i++){NX[i]=-NX[i];NZ[i]=-NZ[i]}}}
const colAt=s=>clamp((s-S0)/DS,0,NC-1.001);
function toWorld(s,u){const f=colAt(s),i=f|0,t=f-i,x=CX[i]+(CX[i+1]-CX[i])*t+(NX[i]+(NX[i+1]-NX[i])*t)*u,z=CZ[i]+(CZ[i+1]-CZ[i])*t+(NZ[i]+(NZ[i+1]-NZ[i])*t)*u;return[x,z]}
function tanAt(s){const f=colAt(s),i=f|0,t=f-i,x=TX[i]+(TX[i+1]-TX[i])*t,z=TZ[i]+(TZ[i+1]-TZ[i])*t,l=Math.hypot(x,z)||1;return[x/l,z/l]}
function nrmAt(s){const f=colAt(s),i=f|0,t=f-i,x=NX[i]+(NX[i+1]-NX[i])*t,z=NZ[i]+(NZ[i+1]-NZ[i])*t,l=Math.hypot(x,z)||1;return[x/l,z/l]}
function toLocal(x,z){let bi=0,bd=1e9;for(let i=0;i<NC;i++){const d=(CX[i]-x)*(CX[i]-x)+(CZ[i]-z)*(CZ[i]-z);if(d<bd){bd=d;bi=i}}
 let s=S0+bi*DS;for(let k=0;k<3;k++){const w=toWorld(s,0),t=tanAt(s);s+=(x-w[0])*t[0]+(z-w[1])*t[1]}const w=toWorld(s,0),n=nrmAt(s);return[s,(x-w[0])*n[0]+(z-w[1])*n[1]]}
/* the water surface height of the existing island sea at u (strips at -.41 / -.43 / -.46, deep plane -.5); the overlay sits 1 cm above it */
const baseY=u=>(u<=0?-.41:u<13?lerp(-.41,-.43,u/13):u<38?lerp(-.43,-.46,(u-13)/25):u<60?lerp(-.46,-.5,(u-38)/22):-.5)+.012;
/* sand height at z metres inland of the waterline: the beach strips run -.36 at the water to -.27 at the grass edge, 15 m in */
const sandY=z=>z<=0?-.36:z<5?lerp(-.36,-.33,z/5):z<10?lerp(-.33,-.30,(z-5)/5):z<15?lerp(-.30,-.27,(z-10)/5):-.25;

/* ---------- the wave model ----------
   v55.23: waves face the beach. A wave is a straight swell line parallel to the shore that rolls in at c m/s until it reaches its break line ub
   at time tb, then slows to a crawl (C2) while the peel point runs along it: sb(t) = sP + vp*(t-tb) (+ a slow wobble for "sections").
   d = s - sb is the distance AHEAD of the peel point: ahead of it the green face stands up square to the beach, behind it the whitewater
   rolls on to the sand at about 0.8*c (so only the broken part fans in). Face height T (m); ahead of the peel a green face that curls
   into a barrel just in front of the peel. */
const SG1=.36,SG2=.43,SG3=.45,SG4=.80,TIPA=.95;/* curve parameter breakpoints: back slope | outer lip | tip | inner wall | foot */
const waves=[];let TT=0,wid=0;
function mkWave(o){const H=o.H,c=o.c||3.6+.75*H,vp=o.vp||(6.5+1.5*H)*rr(.88,1.15),w={id:++wid,H,c,vp,tb:o.tb,sP:o.sP,ub:o.ub||12+17*H,hol:o.hol==null?rr(.25,.8):o.hol,Lw:o.Lw||rr(95,150),set:o.set||0,k:o.k||0,n:o.n||1,close:!!o.close,sec:rr(0,6.28),caught:0};
 if(w.close){w.vp=w.c/.07;w.hol=.1}return w}
const envAt=(w,s)=>{const a=12,r=sm(w.sP-a,w.sP+5,s),t=1-sm(w.sP+w.Lw-38,w.sP+w.Lw,s);return r*t*(1+.16*Math.exp(-Math.pow((s-w.sP-10)/22,2)))};
const sbAt=(w,t)=>w.sP+w.vp*(t-w.tb)+(w.close?0:3.4*Math.sin((t-w.tb)*.5+w.sec));
const C2=.7,TAU0=1.3;/* crawl speed after the break, and how fast the swell slows down to it */
const travel=(w,tau)=>tau<0?w.c*tau:C2*tau+(w.c-C2)*TAU0*(1-Math.exp(-tau/TAU0));
const kwOf=w=>Math.max(0,(.8*w.c-C2)/w.vp);
/* the crest line: straight along the shore ahead of the peel point (a faint bend so it is not a ruler line), fanning shoreward only behind it */
const ucAt=(w,s,t)=>{const d=s-sbAt(w,t),bh=-d;return w.ub-travel(w,t-w.tb)-kwOf(w)*.5*(bh+Math.sqrt(bh*bh+4)-2)+.9*Math.sin(s*.045+w.sec)};
const waveDead=(w,t)=>t>w.tb+(w.Lw+16)/w.vp+(w.ub+8)/(kwOf(w)*w.vp+C2)+4;
/* the two curves a green wave can have, both indexed by one parameter sg in 0..1 that runs from the back of the wave over the crest down the face to the foot:
   sCurve = a plain swell/shoulder (E shoreward distance from the crest, Y height), bCurve = the barrel (lip, tube, wall). A wave is the blend of the two by kappa. */
const OB=[0,0];
function sCurve(T,d,sg,Wb,Wf){if(sg<SG1){const x=1-sg/SG1;OB[0]=-Wb*x;OB[1]=T*(1-3*x*x+2*x*x*x)}else{const q=(sg-SG1)/(1-SG1);OB[0]=Wf*q;OB[1]=T*Math.pow(1-q,1.2+.9*sm(18,2,d))}}
function bCurve(T,sg,Wb,Wf){const R=.455*T,Ro=R+.09*T,pa=Math.PI+TIPA;
 if(sg<SG1){const x=1-sg/SG1;OB[0]=-Wb*x;OB[1]=T*(1-3*x*x+2*x*x*x)}
 else if(sg<SG2){const f=Math.PI+TIPA*(sg-SG1)/(SG2-SG1);OB[0]=-Ro*Math.sin(f);OB[1]=R-Ro*Math.cos(f)}
 else if(sg<SG3){const t=(sg-SG2)/(SG3-SG2),e1=-Ro*Math.sin(pa),y1=R-Ro*Math.cos(pa),e2=-R*Math.sin(pa),y2=R-R*Math.cos(pa);OB[0]=e1+(e2-e1)*t;OB[1]=y1+(y2-y1)*t}
 else if(sg<SG4){const f=pa*(SG4-sg)/(SG4-SG3);OB[0]=-R*Math.sin(f);OB[1]=R-R*Math.cos(f)}
 else{OB[0]=Wf*(sg-SG4)/(1-SG4);OB[1]=0}}
/* curl amount ahead of the peel point and whitewater weight behind it */
const kapOf=(hol,d)=>hol*sm(-1,3,d)*(1-sm(8,26,d))*(1-sm(2.2,-4,d));
/* a point on the green wave: where the rider is. zeta 0 = foot of the face, 1 = top (the roof of the tube when it is hollow). Writes [E (shoreward of the crest), Y, kappa, sigma] */
function ridePt(T,d,hol,zeta,out){const Wb=2.6*T+2,Wf=1.6*T+1.2,k=kapOf(hol,d),s0=lerp(.92,.775,k),s1=lerp(SG1+.03,.595,k),sg=s0+(s1-s0)*zeta;
 sCurve(T,d,sg,Wb,Wf);let E=OB[0],Y=OB[1];if(k>.001){const E0=E,Y0=Y;bCurve(T,sg,Wb,Wf);E=E0+(OB[0]-E0)*k;Y=Y0+(OB[1]-Y0)*k}
 out[0]=E;out[1]=Y;out[2]=k;out[3]=sg}
/* the profile of one wave at one column. T face height, d distance ahead of the peel point, xi = u - uc (seaward positive). Writes [du, y, foam, wwWeight, kappa] into out */
function prof(T,d,hol,xi,uc,out){const Wb=2.6*T+2,Wf=1.6*T+1.2,w=sm(2.2,-4,d),kap=kapOf(hol,d);
 out[0]=out[1]=out[2]=0;out[3]=w;out[4]=kap;
 const wide=Math.max(Wb,1.7*T+2.4);if(xi>wide||xi<-Wf-1.5)return false;
 let y=0,du=0,fo=0;
 if(w<1){const sg=xi>=0?SG1*(1-Math.min(1,xi/Wb)):SG1+(1-SG1)*Math.min(1,-xi/Wf);
  sCurve(T,d,sg,Wb,Wf);y=OB[1];
  if(kap>.01){bCurve(T,sg,Wb,Wf);du=-kap*(OB[0]+xi);y=y+(OB[1]-y)*kap;fo=Math.max(fo,kap*(sg>SG1-.04&&sg<SG3+.03?.9:.12))}
  fo=Math.max(fo,.4*sm(11,0,d)*(xi>-1.5&&xi<2.5?1:0));y*=1-w;du*=1-w}
 if(w>0){const A=T*.5*Math.exp(Math.min(0,d)/15)*sm(1.5,9,uc),a=xi>=0?Math.exp(-Math.pow(xi/(1.1*T+1.6),2)):Math.exp(-Math.pow(xi/(.75*T+1),2));y+=w*A*a;fo=Math.max(fo,w*Math.min(1,a*1.4+.2))}
 out[0]=du;out[1]=y;out[2]=fo;return true}
const SCR=[0,0,0,0,0];
/* the height of the water surface at (s,u): used for floating, splashes and the camera (the barrel overhang is ignored) */
function hAt(s,u,t){t=t==null?TT:t;let y=0;for(let i=0;i<waves.length;i++){const w=waves[i];if(t<w.tb-(220-w.ub)/w.c||waveDead(w,t))continue;const e=envAt(w,s);if(e<.02)continue;const uc=ucAt(w,s,t),d=s-sbAt(w,t),T=w.H*e*sm(192,166,uc)*(1-.005*clamp(d,0,60));if(T<.05)continue;
  const sk=SCR;const xi=u-uc;if(prof(T,d,0,xi,uc,sk))y+=sk[1]}return y}

/* ---------- the surf mesh ---------- */
const U=[];for(let u=-6;u<0;u+=2)U.push(u);for(let u=0;u<=132;u++)U.push(u);for(let u=134;u<=192;u+=2)U.push(u);
const NR=U.length,NV=NC*NR;
const rowOf=u=>u<0?(u+6)/2:u<=132?3+u:136+(u-134)/2;
const surf={mesh:null,pos:null,nor:null,fo:null,ht:null,al:null,dY:null,dU:null,fN:null,fR:null,wwN:null,mat:null,ready:false};
function buildSurf(){const g=new THREE.BufferGeometry();
 surf.pos=new Float32Array(NV*3);surf.nor=new Float32Array(NV*3);surf.fo=new Float32Array(NV);surf.ht=new Float32Array(NV);surf.al=new Float32Array(NV);surf.rt=new Float32Array(NV);surf.rN=new Float32Array(NV);
 surf.dY=new Float32Array(NV);surf.dU=new Float32Array(NV);surf.fN=new Float32Array(NV);surf.fR=new Float32Array(NV);surf.wwN=new Float32Array(NV);
 const au=new Float32Array(NV),as=new Float32Array(NV),idx=new Uint16Array((NC-1)*(NR-1)*6);let k=0;
 for(let i=0;i<NC;i++)for(let j=0;j<NR;j++){const v=i*NR+j;au[v]=U[j];as[v]=S0+i*DS;surf.nor[v*3+1]=1;
  if(i<NC-1&&j<NR-1){const a=v,b=v+NR,c=v+1,d=v+NR+1;idx[k++]=a;idx[k++]=b;idx[k++]=c;idx[k++]=b;idx[k++]=d;idx[k++]=c}}
 const dyn=THREE.DynamicDrawUsage;
 g.setAttribute('position',new THREE.BufferAttribute(surf.pos,3).setUsage(dyn));g.setAttribute('normal',new THREE.BufferAttribute(surf.nor,3).setUsage(dyn));
 g.setAttribute('aFoam',new THREE.BufferAttribute(surf.fo,1).setUsage(dyn));g.setAttribute('aHt',new THREE.BufferAttribute(surf.ht,1).setUsage(dyn));g.setAttribute('aAlpha',new THREE.BufferAttribute(surf.al,1).setUsage(dyn));
 g.setAttribute('aU',new THREE.BufferAttribute(au,1));g.setAttribute('aS',new THREE.BufferAttribute(as,1));g.setAttribute('aR',new THREE.BufferAttribute(surf.rt,1).setUsage(dyn));g.setIndex(new THREE.BufferAttribute(idx,1));
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,
  uniforms:{uSun:{value:new THREE.Vector3(.4,.8,.45)},uSunCol:{value:new THREE.Color(1,1,1)},uAmb:{value:new THREE.Color(.7,.7,.7)},uSky:{value:new THREE.Color(.6,.8,1)},uFog:{value:new THREE.Color(.6,.8,1)},uFogR:{value:new THREE.Vector2(1e5,2e5)},uTime:{value:0}},
  vertexShader:`attribute float aFoam;attribute float aHt;attribute float aAlpha;attribute float aU;attribute float aS;attribute float aR;varying vec3 vN;varying vec3 vW;varying float vF;varying float vH;varying float vA;varying float vU;varying float vS;varying float vR;
   void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normal;vF=aFoam;vH=aHt;vA=aAlpha;vU=aU;vS=aS;vR=aR;gl_Position=projectionMatrix*viewMatrix*w;}`,
  /* v55.23 water: the flat sea matches the island strips; a wave face darkens to deep teal at its foot and glows translucent green
     up near the lip (brighter with the sun behind it), with streaks running down the face, a white lip line, sun glints, sky
     reflection at grazing angles and bubbly foam laid out along the shore so it moves with the waves. Far slivers fade out. */
  fragmentShader:`uniform vec3 uSun;uniform vec3 uSunCol;uniform vec3 uAmb;uniform vec3 uSky;uniform vec3 uFog;uniform vec2 uFogR;uniform float uTime;
   varying vec3 vN;varying vec3 vW;varying float vF;varying float vH;varying float vA;varying float vU;varying float vS;varying float vR;
   float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y);}
   vec3 wc(float u){vec3 a=vec3(.608,.910,.871),b=vec3(.310,.749,.831),c=vec3(.169,.498,.753);return u<13.?mix(a,b,clamp(u/13.,0.,1.)):mix(b,c,clamp((u-13.)/25.,0.,1.));}
   void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(cameraPosition-vW);float dist=length(cameraPosition-vW);
    float wv=smoothstep(.04,.5,vH);/* how much of a wave is here at all */
    vec3 Nl=normalize(mix(vec3(0.,1.,0.),N,wv));/* flat water is lit like the island sea under it */
    float st=clamp(1.-Nl.y,0.,1.);float face=smoothstep(.04,.45,st)*wv;
    float r=clamp(vR,0.,1.);
    vec3 base=wc(vU);
    vec3 deep=vec3(.05,.36,.46),glass=vec3(.30,.92,.80);
    vec3 fc=mix(deep,mix(base,glass,.7),smoothstep(.25,.95,r));
    base=mix(base,fc,face);
    /* streaks running down the face, moving up as the wave stands up */
    float sk=vn(vec2(vS*.55,vH*2.2-uTime*.7))*.6+vn(vec2(vS*1.9,vH*5.-uTime*1.3))*.4;base*=1.+face*(sk-.5)*.32;
    float dif=max(dot(Nl,uSun),0.);
    vec3 col=base*(uAmb+uSunCol*dif);
    /* light shining through the thin top of the wave */
    float thin=smoothstep(.5,.97,r)*wv;float bl=pow(max(dot(-V,uSun),0.),2.)*.7+.3;col+=vec3(.10,.42,.32)*thin*bl*(uSunCol*.6+uAmb*.4)*(.55+face*.6);
    float fr=pow(1.-max(dot(Nl,V),0.),4.);col=mix(col,uSky*(uAmb+uSunCol*.5),fr*.35*wv);
    vec3 R=reflect(-uSun,Nl);col+=uSunCol*pow(max(dot(R,V),0.),60.)*.7*wv;
    /* the lip line */
    float lip=smoothstep(.9,.99,r)*face;col=mix(col,vec3(.92,.99,1.)*(uAmb*.8+uSunCol*.45),lip*.75);
    /* foam, laid out in the coast frame (s along the shore, u out to sea) so it travels with the water */
    vec2 fp=vec2(vS*.42,vU*.9);float n=vn(fp*1.6+vec2(uTime*.25,-uTime*.4))*.55+vn(fp*4.3-vec2(uTime*.5,uTime*.2))*.3+vn(fp*11.+vec2(0.,uTime))*.15;
    float fm=smoothstep(.42,.66,n+vF*.66-.38)*clamp(vF*1.9,0.,1.);
    float bub=smoothstep(.55,.7,vn(fp*9.-vec2(uTime*.3,0.)));fm*=.86+.14*bub;
    vec3 fcol=vec3(.95,.99,1.)*(uAmb*.85+uSunCol*(.35+.65*max(dot(N,uSun),0.)));
    col=mix(col,fcol,fm);
    float a=clamp(max(vA,fm),0.,1.);
    a*=mix(1.,smoothstep(.05,.6,vH)+fm,smoothstep(70.,190.,dist));/* far away, thin swell slivers fade into the sea */
    float ff=smoothstep(uFogR.x,uFogR.y,dist);col=mix(col,uFog,ff);
    gl_FragColor=vec4(col,clamp(a,0.,1.));}`});
 surf.mat=mat;const m=new THREE.Mesh(g,mat);m.frustumCulled=false;m.renderOrder=3;m.visible=false;m.name='surfmesh';WORLD.add(m);surf.mesh=m;surf.ready=true;
 for(let i=0;i<NC;i++)for(let j=0;j<NR;j++){const v=i*NR+j,p=toWorldFast(i,U[j]);surf.pos[v*3]=p[0];surf.pos[v*3+1]=baseY(U[j]);surf.pos[v*3+2]=p[1]}}
const _tw=[0,0];function toWorldFast(i,u){_tw[0]=CX[i]+NX[i]*u;_tw[1]=CZ[i]+NZ[i]*u;return _tw}
let simDt=.016;
function surfUpdate(dt,pk){const dY=surf.dY,dU=surf.dU,fN=surf.fN,wwN=surf.wwN,fR=surf.fR,rN=surf.rN;dY.fill(0);rN.fill(0);dU.fill(0);fN.fill(0);wwN.fill(0);
 const o=SCR;
 for(let q=0;q<waves.length;q++){const w=waves[q];if(TT<w.tb-(215-w.ub)/w.c||waveDead(w,TT))continue;
  for(let i=0;i<NC;i++){const s=S0+i*DS,e=envAt(w,s);if(e<.015)continue;const uc=ucAt(w,s,TT);if(uc>192+50)continue;
   const d=s-sbAt(w,TT),T=w.H*e*sm(192,166,uc)*(1-.005*clamp(d,0,60));if(T<.06)continue;
   const Wb=2.6*T+2,Wf=1.6*T+1.2,wide=Math.max(Wb,1.7*T+2.4),jl=Math.max(0,Math.floor(rowOf(Math.max(-6,uc-Wf-1.8)))),jh=Math.min(NR-1,Math.ceil(rowOf(Math.min(192,uc+wide))));
   for(let j=jl;j<=jh;j++){const xi=U[j]-uc;if(!prof(T,d,w.hol,xi,uc,o))continue;const v=i*NR+j;dY[v]+=o[1];dU[v]+=o[0];const rr0=o[1]/T;if(rr0>rN[v])rN[v]=rr0;if(o[2]>fN[v])fN[v]=o[2];if(o[3]*o[2]>wwN[v])wwN[v]=o[3]*o[2]}}}
 const dec=Math.exp(-dt/3.4),pos=surf.pos,al=surf.al,ht=surf.ht,fo=surf.fo;
 for(let i=0;i<NC;i++)for(let j=0;j<NR;j++){const v=i*NR+j,u=U[j],y=dY[v],du=dU[v];
  const r=wwN[v]*.9,f0=fR[v]*dec;fR[v]=r>f0?r:f0;
  const uu=u+du;pos[v*3]=CX[i]+NX[i]*uu;pos[v*3+1]=baseY(u)+y;pos[v*3+2]=CZ[i]+NZ[i]*uu;
  const F=Math.max(fN[v],fR[v]);fo[v]=F;ht[v]=y;surf.rt[v]=rN[v];
  al[v]=Math.min(1,Math.max(sm(.03,.32,y),Math.abs(du)>.05?1:0,F*.9))}
 /* normals from central differences of the displaced grid */
 const nor=surf.nor;
 for(let i=0;i<NC;i++){const i0=i>0?i-1:i,i1=i<NC-1?i+1:i;for(let j=0;j<NR;j++){const j0=j>0?j-1:j,j1=j<NR-1?j+1:j,v=i*NR+j,a=(i1*NR+j)*3,b=(i0*NR+j)*3,c=(i*NR+j1)*3,e=(i*NR+j0)*3;
   const sx=pos[a]-pos[b],sy=pos[a+1]-pos[b+1],sz=pos[a+2]-pos[b+2],ux=pos[c]-pos[e],uy=pos[c+1]-pos[e+1],uz=pos[c+2]-pos[e+2];
   let nx=sy*uz-sz*uy,ny=sz*ux-sx*uz,nz=sx*uy-sy*ux;const l=Math.hypot(nx,ny,nz)||1;nor[v*3]=nx/l;nor[v*3+1]=ny/l;nor[v*3+2]=nz/l}}
 const g=surf.mesh.geometry.attributes;g.position.needsUpdate=g.normal.needsUpdate=g.aFoam.needsUpdate=g.aHt.needsUpdate=g.aAlpha.needsUpdate=g.aR.needsUpdate=true}
/* foam left on the water by something small (the surfer's wake) */
function foamAt(s,u,r,k){const f=colAt(s),i0=Math.max(0,Math.round(f-r/DS)),i1=Math.min(NC-1,Math.round(f+r/DS)),jr=Math.max(1,Math.round(r)),jc=Math.round(rowOf(clamp(u,-6,192)));
 for(let i=i0;i<=i1;i++)for(let j=Math.max(0,jc-jr);j<=Math.min(NR-1,jc+jr);j++){const v=i*NR+j;if(surf.fR[v]<k)surf.fR[v]=k}}

/* ---------- levels, daily report and the wave scheduler ---------- */
const LV=[
 {n:'Beginner swell',sub:'Soft rolling waves close to the beach',h:[.95,1.55],hol:[.12,.5],gap:[8.5,11],vpk:.92,thr:5,clo:.08,k:70},
 {n:'Reef',sub:'Bigger, steeper, with a real barrel',h:[1.7,2.5],hol:[.35,.78],gap:[8,10.5],vpk:1,thr:6,clo:.1,k:105},
 {n:'Point break',sub:'Long fast walls that peel and peel',h:[2.6,3.6],hol:[.4,.85],gap:[7.5,10],vpk:1.1,thr:7,clo:.1,k:150},
 {n:'Big wave',sub:'Huge hollow monsters out the back',h:[3.9,5.4],hol:[.5,.95],gap:[8,11],vpk:1.18,thr:9,clo:.12,k:215}];
const dayNo=()=>Math.max(1,S.day||1);
const hash=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function report(day){day=day||dayNo();const m=.82+hash(day*3.1)*.4,wd=Math.round(4+hash(day*7.7)*24),dir=hash(day*5.3),on=dir<.28,cr=dir>.8;
 return{m,wind:wd,kind:on?'onshore':cr?'cross-shore':'offshore',hol:on?-.14:cr?-.04:.1,txt:on?'bumpy, a little mushy':cr?'a bit lumpy':'clean and glassy'}}
const sizeRange=(l,rp)=>[LV[l].h[0]*rp.m,LV[l].h[1]*rp.m];
const SESSION=120;
/* ---- scheduler: sets of 3 to 5 waves with lulls between them ---- */
const SCH={mode:'idle',lv:0,next:0,setN:0,t0:0};
function spawnSet(lv,tbStart,rp,opt){opt=opt||{};const L=LV[lv],n=3+Math.floor(Math.random()*3),prof=[.82,1,1.12,1,.88],out=[];let tb=tbStart;
 const sP0=rr(-14,22);
 for(let k=0;k<n;k++){const f=prof[Math.round(k/(Math.max(1,n-1))*4)]*rr(.93,1.07),H=lerp(L.h[0],L.h[1],clamp((f-.8)/.4,0,1)*.8+rr(0,.2))*rp.m;
  const clo=!opt.noClose&&Math.random()<L.clo&&k>0,hol=clamp(rr(L.hol[0],L.hol[1])+rp.hol,.05,1);
  const w=mkWave({H,tb,sP:sP0+rr(-9,9),hol,close:clo,set:SCH.setN,k:k+1,n});w.vp*=L.vpk;if(clo){w.vp=w.c/.07}
  waves.push(w);out.push(w);tb+=rr(L.gap[0],L.gap[1])}
 SCH.setN++;return{n,end:tb,waves:out}}
function resetWaves(){waves.length=0;wid=0}
function schedTick(){ /* keeps the sea alive: idle waves near the beach, or the session plan */
 if(SCH.mode=='idle'){const alive=waves.filter(w=>!waveDead(w,TT)).length;
  if(alive<3&&TT>=SCH.next){const rp=report(),set=spawnSet(0,TT+rr(-6,10),{m:rp.m*.78,hol:rp.hol});SCH.next=set.end+rr(8,16)}}
 for(let i=waves.length-1;i>=0;i--)if(waveDead(waves[i],TT)&&(SCH.mode=='idle'||TT>waves[i].tb+60))waves.splice(i,1)}
function planSession(lv,t0){resetWaves();SCH.mode='session';SCH.lv=lv;SCH.setN=0;const rp=report();let t=t0+9;const sets=[];
 while(t<t0+SESSION+55){const set=spawnSet(lv,t,rp);sets.push(set);t=set.end+rr(14,19)}return sets}

/* ---------- the camera wrapper (ours replaces the isometric one while a session runs or a test view is on) ---------- */
const cam3=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.2,2600);
const VIEW={on:false};
let G=null;
const softSeen={};function soft(e,t){if(!softSeen[t]){softSeen[t]=1;console.error('surf '+t,e)}}
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(c===cam&&(VIEW.on||(G&&G.on))){cam3.aspect=innerWidth/innerHeight;cam3.updateProjectionMatrix();try{if(G&&G.on)poseFrame()}catch(e){soft(e,'pose')}const sc0=sun.castShadow;sun.castShadow=false;try{return r0(sc,cam3)}finally{sun.castShadow=sc0}}return r0(sc,c)}}
/* shader lighting follows the day */
function lightUniforms(){const u=surf.mat.uniforms;try{u.uAmb.value.copy(amb.color).multiplyScalar(amb.intensity);u.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity);u.uSun.value.copy(sun.position).sub(sun.target.position).normalize();
  const bg=scene.background&&scene.background.isColor?scene.background:null;if(bg){u.uSky.value.copy(bg);u.uFog.value.copy(bg)}
  if(scene.fog&&scene.fog.near!=null&&scene.fog.far<5e5){u.uFogR.value.set(scene.fog.near,scene.fog.far)}else u.uFogR.value.set(1e6,2e6)}catch(e){}
 u.uTime.value=TT}
/* ---------- per frame ---------- */
let near=false,built=false;
function distToSpot(){const m=NC>>1,dx=P.x-CX[m],dz=P.z-CZ[m];return Math.hypot(dx,dz)}
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='title')return r;const off=away();dt=dt||.016;
 if(off){if(surf.mesh)surf.mesh.visible=false;return r}
 if(!surf.ready){buildSurf()}
 const dd=distToSpot();near=dd<330||(G&&G.on)||VIEW.on;
 if(G&&G.on){if(!G.paused)TT+=dt*G.ts}else if(near)TT+=dt;
 /* v55.30.0: the wave mesh is never frustum-culled, so it is only drawn and reshaped while its stretch of coast is on screen; the wave sets still run */
 const seen=near&&(G&&G.on||VIEW.on||!window.FW_ZONE||FW_ZONE.seenBox(surf.box||(surf.box=new THREE.Box3().setFromBufferAttribute(surf.mesh.geometry.attributes.position).applyMatrix4(surf.mesh.matrixWorld)),12));
 surf.mesh.visible=seen;
 if(near){schedTick();lightUniforms();if(seen)surfUpdate(dt)}
 else if(SCH.mode=='idle'&&waves.length){waves.length=0;SCH.next=0}
 sbTick(dt);
 }catch(e){soft(e,'tick')}return r}}

/* ---------- the beach: shack, board rack, lifeguard tower, signpost, palms, people ----------
   Local frame of the props: x along the shore (+s), z inland from the waterline (sea at -z), y up, 1 unit = 1 m. Built from merged boxes. */
const PS=-38;/* where the props stand along the shore (s) */
const PO=toWorld(PS,0),PT=tanAt(PS),PTH=Math.atan2(-PT[1],PT[0]);
const lw=(x,z)=>{const c=Math.cos(PTH),s=Math.sin(PTH);return[PO[0]+x*c+z*s,PO[1]-x*s+z*c]};/* local to world */
const PROP=new THREE.Group();PROP.name='surfBreakBeach';PROP.position.set(PO[0],0,PO[1]);PROP.rotation.y=PTH;WORLD.add(PROP);
const bxs=[];let bn=0;
const shade=(c,k)=>{const o=new THREE.Color(c);o.r=Math.min(1,o.r*k);o.g=Math.min(1,o.g*k);o.b=Math.min(1,o.b*k);return o};
/* a box: size w,h,d, colour, centre x,y,z, then rotations (ry about up, rx and rz), tiny size jitter against z-fighting */
function bx(w,h,d,c,x,y,z,ry,rx,rz){bn++;const j=(a)=>1+(bn*a%8)*.0004+.0002;bxs.push([w*j(7919),h*j(104729),d*j(1299709),c,x,y,z,ry||0,rx||0,rz||0])}
const COL={teal:'#2aa7a1',tealD:'#1f857f',cream:'#fff3d9',coral:'#ff6f61',wood:'#9a6a3c',woodL:'#c99a5c',woodD:'#5a3a22',sand:'#e0d09a',red:'#e8452c',yel:'#ffd23d',navy:'#2b3a55',steel:'#cfd3d8',ink:'#17171c',palm:'#2f8f4a',palm2:'#3da35a'};
const BCOL=['#ff6f61','#ffd23d','#2aa7a1','#3a7bd5','#8d5fd3','#6be08c','#ff7ab8','#fff3d9'];
/* a surfboard as a blocky outline: slices that narrow to the nose and tail, laid along z, with a stripe and fins. length L along local z */
function board(g,L,W,c,stripe,x,y,z,ry,rx,rz){/* adds boxes through the matrix below, so a board can be placed anywhere */
 const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(1,1,1)),v=new THREE.Vector3();
 const add=(w,h,d,col,bx0,by0,bz0)=>{v.set(bx0,by0,bz0).applyMatrix4(m);const e=new THREE.Euler().setFromRotationMatrix(m,'YXZ');bx(w,h,d,col,v.x,v.y,v.z,e.y,e.x,e.z)};
 const n=9;for(let i=0;i<n;i++){const t=(i+.5)/n,zz=(t-.5)*L,wv=W*Math.sin(Math.PI*(.2+.8*Math.pow(t,.85)))*(.55+.45*Math.sin(Math.PI*Math.min(1,t*1.15)));
  add(Math.max(.1,wv),.07,L/n*1.02,i==4?stripe:c,0,0,zz)}
 add(.07,.075,L*.85,stripe,0,.004,0);add(.05,.12,.12,'#222',0,-.08,-L*.36);add(.04,.09,.1,'#222',-.1,-.07,-L*.38);add(.04,.09,.1,'#222',.1,-.07,-L*.38)}
function palm(x,z,s,lean,rot){s=s||1;lean=lean||.14;rot=rot||0;let px=x,py=sandY(z)-.1,pz=z;
 for(let i=0;i<7;i++){const w=.46*s-i*.03*s,h=1.05*s;bx(w,h*1.04,w,i%2?'#8a6a40':'#7d5f38',px,py+h/2,pz);px+=lean*s*Math.cos(rot);pz+=lean*s*Math.sin(rot);py+=h}
 bx(.6*s,.4*s,.6*s,'#5f4a2a',px,py+.05*s,pz);
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2+rot,c1=i%2?COL.palm:COL.palm2,c2=i%2?COL.palm2:COL.palm,ca=Math.cos(a),sa=Math.sin(a);
  /* a frond: two boxes that droop, built in the plane of its direction */
  const l1=1.5*s,l2=1.35*s;let x1=px+ca*l1*.5*Math.cos(.22),y1=py+.2*s-Math.sin(.22)*l1*.5,z1=pz+sa*l1*.5*Math.cos(.22);
  bx(l1,.09*s,.55*s,c1,x1,y1,z1,-a,0,-.22);
  const ex=px+ca*l1*Math.cos(.22),ey=py+.2*s-Math.sin(.22)*l1,ez=pz+sa*l1*Math.cos(.22),x2=ex+ca*l2*.5*Math.cos(.62),y2=ey-Math.sin(.62)*l2*.5,z2=ez+sa*l2*.5*Math.cos(.62);
  bx(l2,.09*s,.45*s,c2,x2,y2,z2,-a,0,-.62)}
 [[.3,0],[-.3,.2],[0,-.3]].forEach(([dx,dz])=>bx(.3*s,.3*s,.3*s,'#6b4a28',px+dx*s,py-.25*s,pz+dz*s));
 solidL(x,z,.32)}
const SOL=[];
/* solid footprints go into the game's collision list (axis aligned in the world), long ones are cut into small cells so a turned shack is not a fat box */
function solidL(x,z,r,hx,hz){hx=hx||r;hz=hz||r;const n=Math.max(1,Math.ceil(Math.max(hx,hz)*2/1.1)),ax=hx>=hz;
 for(let i=0;i<n;i++){const t=n==1?0:(i/(n-1)-.5)*2,cx=x+(ax?t*(hx-hz):0),cz=z+(ax?0:t*(hz-hx)),rad=n==1?Math.max(hx,hz):Math.min(hx,hz)+((ax?hx:hz)-Math.min(hx,hz))/Math.max(1,n-1)*.5;
  const w=lw(cx,cz),q=[w[0]-rad,w[1]-rad,w[0]+rad,w[1]+rad];SOL.push(q);try{cols.push(q)}catch(e){}}}
/* sand level at a local z, so posts and feet start in the sand and nothing floats */
const gy=z=>sandY(z);
/* ---- the shack (centre x 0, z 9.4, 8 wide, 4.4 deep, facing the sea) ---- */
function buildShack(){const hz=9.8,x0=-4,x1=4,z0=7.6,z1=12;
 /* deck on piles */
 bx(10,.22,7,COL.woodL,0,-.11,hz+.3);for(let i=-4;i<=4;i++)bx(.04,.02,7,COL.woodD,i*1.1,.005,hz+.3);
 [[-4.8,6.9],[4.8,6.9],[-4.8,13.4],[4.8,13.4],[0,6.9],[0,13.4]].forEach(([x,z])=>bx(.3,gy(z)*-1+.02-.2+.5,.3,COL.woodD,x,(gy(z)-.22)/2-.2,z));
 /* steps down on the sea side */
 bx(4,.12,.6,COL.woodL,1.8,-.06,6.45);bx(4,.1,.6,COL.wood,1.8,-.2,5.9);
 /* walls: back, sides, front with a wide opening (the rental window) */
 bx(8,3.1,.25,COL.teal,0,1.55,z1);for(let i=0;i<8;i++)bx(.05,3.1,.28,COL.tealD,-3.5+i,1.55,z1);
 [-1,1].forEach(a=>{bx(.25,3.1,z1-z0,COL.teal,a*x1,1.55,(z0+z1)/2);for(let i=0;i<4;i++)bx(.28,.06,z1-z0,COL.cream,a*x1,.7+i*.7,(z0+z1)/2)});
 bx(1.6,2.1,.25,COL.teal,-3.2,1.05,z0);bx(1.6,2.1,.25,COL.teal,3.2,1.05,z0);/* front pieces either side of the window */
 bx(8,.9,.25,COL.teal,0,2.65,z0);/* above the window */
 bx(4.9,.12,.9,COL.woodL,0,1.1,z0-.35);bx(4.9,.9,.12,COL.wood,0,.62,z0-.7);for(let i=-2;i<=2;i++)bx(.05,.8,.14,COL.woodD,i*1.2,.62,z0-.72);/* the counter */
 /* flat inner shelf and floor details */
 bx(7.4,.04,4,COL.sand,0,.06,hz+.2);
 /* roof: two slopes, a ridge, gable fills, stripes */
 const rise=1.9,run=(z1-z0)/2+1.3,len=Math.hypot(rise,run),ang=Math.atan2(rise,run);
 [[-1,'-'],[1,'+']].forEach(([a])=>{const zc=(z0+z1)/2+a*run/2-a*.0,y=3.1+rise/2;bx(10,.16,len,COL.cream,0,y,(z0+z1)/2-a*run/2,0,a*ang,0);
  for(let i=-4;i<=4;i+=2)bx(1,.18,len*.98,COL.teal,i*1.1,y+.005,(z0+z1)/2-a*run/2,0,a*ang,0)});
 bx(10.1,.22,.3,COL.coral,0,3.1+rise+.02,(z0+z1)/2);
 for(let i=0;i<5;i++){const w=(z1-z0)*(1-i*.19);bx(.22,.4,w,COL.cream,-4.9,3.35+i*.38,(z0+z1)/2);bx(.22,.4,w,COL.cream,4.9,3.35+i*.38,(z0+z1)/2)}
 /* awning over the window: striped, leaning out */
 for(let i=0;i<7;i++)bx(.7,.1,1.7,i%2?COL.coral:COL.cream,-2.1+i*.7,2.95,z0-.85,0,-.26,0);
 [[-2.2,6.4],[2.2,6.4]].forEach(([x,z])=>bx(.12,2.2,.12,COL.woodD,x,1.1,z));
 /* things on the counter and the back shelf */
 bx(.55,.38,.4,'#3a3a40',-1.3,1.37,z0-.2);bx(.45,.05,.3,'#8affb0',-1.3,1.58,z0-.2);/* the till */
 bx(.2,.2,.2,COL.steel,.6,1.28,z0-.3);bx(.04,.1,.04,COL.red,.6,1.43,z0-.3);/* bell */
 [[1.3,COL.yel],[1.55,COL.coral],[1.8,COL.teal]].forEach(([x,c])=>{bx(.22,.2,.22,c,x,1.26,z0-.45);bx(.24,.05,.24,COL.cream,x,1.4,z0-.45)});/* wax jars */
 bx(.7,.3,.5,COL.cream,-.4,1.25,z0-.5);bx(.7,.08,.5,COL.coral,-.4,1.44,z0-.5);/* towels */
 bx(7.2,.1,.6,COL.woodD,0,1.6,z1-.5);bx(7.2,.1,.6,COL.woodD,0,2.3,z1-.5);/* back shelves */
 for(let i=0;i<8;i++){const c=BCOL[i%8];bx(.5,.55,.35,c,-3.2+i*.9,1.9,z1-.5);}for(let i=0;i<5;i++)bx(.14,.5,.12,i%2?COL.tealD:'#222',-2.9+i*1.4,2.6,z1-.5);/* wetsuits and fins */
 bx(1.1,.7,.1,COL.cream,-3.2,1.7,z1-.7);/* the fire sign */
 /* a board hung on each side wall, outside */
 board(null,2.1,.55,'#3a7bd5','#ffd23d',-x1-.25,2.0,hz,-Math.PI/2,Math.PI/2,0);
 board(null,2.0,.52,'#ff7ab8','#fff3d9',x1+.25,1.9,hz-.2,Math.PI/2,Math.PI/2,0);
 /* the lean-to bench and a cooler */
 bx(2,.1,.5,COL.woodL,-6.7,.4,13.2);bx(.1,.4,.5,COL.woodD,-7.6,.2,13.2);bx(.1,.4,.5,COL.woodD,-5.8,.2,13.2);
 bx(.8,.5,.5,'#2b6fd0',6.6,.25,11.6);bx(.82,.06,.52,COL.cream,6.6,.52,11.6);
 /* collision: the walls and the counter */
 solidL(0,z1,0,4.2,.35);solidL(-x1,(z0+z1)/2,0,.3,2.4);solidL(x1,(z0+z1)/2,0,.3,2.4);solidL(-3.2,z0,0,.9,.3);solidL(3.2,z0,0,.9,.3);solidL(0,z0-.4,0,2.5,.5)}
/* ---- board rack: 8 boards stand against a frame ---- */
function buildRack(){const x=-10.5,z=7.6;
 bx(5.2,.14,.14,COL.woodD,x,.55,z);bx(5.2,.14,.14,COL.woodD,x,1.5,z);[-2.5,-.8,.8,2.5].forEach(a=>bx(.16,1.9,.16,COL.woodD,x+a,.85,z));
 bx(5.4,.12,.9,COL.woodL,x,.04,z);
 for(let i=0;i<8;i++){const bz=z+.22,bxx=x-2.2+i*.63,c=BCOL[(i*3)%8],st=BCOL[(i*3+4)%8];board(null,2.05,.5,c,st,bxx,1.1,bz,0,-(Math.PI/2-.1),0);bx(.5,.07,.05,'#e8e8e8',bxx,.17,z-.2);}
 bx(2.2,1.1,.07,COL.cream,x+.5,2.5,z+.05);bx(2.3,1.2,.05,COL.woodD,x+.5,2.5,z+.08);
 solidL(x,z,0,2.8,.6)}
function buildTower(){const x=15,z=7.5,h=2.7;
 [[-1.1,-1.1],[1.1,-1.1],[-1.1,1.1],[1.1,1.1]].forEach(([a,b])=>bx(.22,h+.5,.22,COL.woodD,x+a,h/2-.1,z+b));
 [[0,-1.1,2.4,.12],[0,1.1,2.4,.12],[-1.1,0,.12,2.4],[1.1,0,.12,2.4]].forEach(([a,b,w,d])=>[.45,1.5].forEach(y=>bx(w,.1,d,COL.wood,x+a,y,z+b)));
 bx(3,.22,3,COL.woodL,x,h+.1,z);for(let i=-3;i<=3;i++)bx(.04,.02,3,COL.woodD,x+i*.4,h+.22,z);
 /* cabin walls and rails */
 bx(2.4,1.35,.12,COL.cream,x,h+.9,z+1.1);bx(.12,1.35,2.2,COL.cream,x-1.14,h+.9,z);bx(.12,1.35,2.2,COL.cream,x+1.14,h+.9,z);
 bx(2.4,.5,.12,COL.cream,x,h+.52,z-1.1);for(let i=0;i<3;i++)bx(.12,.5,.12,COL.red,x-.9+i*.9,h+.52,z-1.12);
 bx(2.4,.12,.12,COL.red,x,h+1.55,z-1.1);[-1.14,1.14].forEach(a=>bx(.1,.1,2.4,COL.woodD,x+a,h+1.6,z+.05));
 bx(3.1,.14,3.1,COL.red,x,h+1.95,z);bx(2.7,.14,2.7,COL.cream,x,h+2.07,z);bx(.35,.4,.35,COL.red,x,h+2.3,z);
 bx(.12,2.2,.12,COL.woodD,x+1.7,h+1.2,z-1.5);bx(.9,.5,.04,COL.red,x+2.15,h+2.15,z-1.5);bx(.9,.04,.04,COL.cream,x+2.15,h+2.15,z-1.5);/* flag */
 bx(.5,.5,.1,COL.red,x-.9,h+.95,z-1.15);bx(.34,.1,.12,COL.cream,x-.9,h+.95,z-1.2);bx(.1,.34,.12,COL.cream,x-.9,h+.95,z-1.2);/* cross sign */
 /* ladder on the beach side */
 bx(.1,h+.2,.1,COL.woodD,x-.4,h/2,z-1.5);bx(.1,h+.2,.1,COL.woodD,x+.4,h/2,z-1.5);for(let i=0;i<6;i++)bx(.8,.07,.1,COL.woodL,x,.4+i*.43,z-1.5);
 bx(.5,.5,.2,COL.red,x+2.5,.85,z-2.6);bx(.5,.12,.22,COL.cream,x+2.5,.85,z-2.6);/* rescue can on the sand */
 [[-1.1,-1.1],[1.1,-1.1],[-1.1,1.1],[1.1,1.1]].forEach(([a,b])=>solidL(x+a,z+b,.22));solidL(x,z-1.5,0,.5,.2)}
function buildGate(){/* the arch at the head of the boardwalk and the plank path to the water */
 const gx=1.5;for(let i=0;i<10;i++){const z=2.3+i*.38;bx(2.6,.07,.32,i%2?COL.woodL:COL.wood,gx,sandY(z)+.1,z)}
 [-1,1].forEach(a=>bx(.2,3.4,.2,COL.woodD,gx+a*1.5,1.6,2.1));bx(3.6,.18,.2,COL.woodD,gx,3.3,2.1);
 [-1,1].forEach(a=>bx(.12,.9,.12,COL.woodD,gx+a*1.3,2.9,2.1,0,0,a*.6));
 solidL(gx-1.5,2.1,.18);solidL(gx+1.5,2.1,.18);return gx}
function buildMisc(){
 /* umbrellas, towels, a bin, a shower, driftwood, a cart with a lifebuoy */
 const umb=(x,z,c)=>{bx(.07,2.5,.07,'#e8e8e8',x,gy(z)+1.15,z);[[2.5,2.05],[1.8,2.3],[1.1,2.5]].forEach(([w,y],i)=>bx(w,.13,w,i%2?COL.cream:c,x,gy(z)+y-.1,z));bx(.15,.15,.15,'#e8e8e8',x,gy(z)+2.56,z);solidL(x,z,.15)};
 umb(11,4.6,COL.coral);umb(-4.2,3.7,COL.yel);
 const towel=(x,z,c,ry)=>{bx(1.7,.03,.8,c,x,gy(z)+.035,z,ry);bx(1.7,.035,.18,COL.cream,x,gy(z)+.04,z+.22,ry)};
 towel(11,6.4,COL.teal,.1);towel(12.7,3.8,COL.coral,-.2);towel(-3.6,5.2,COL.yel,.3);
 bx(.7,.9,.7,'#4a5560',-14,.35,6);bx(.8,.08,.8,'#3a4450',-14,.82,6);solidL(-14,6,.4);/* bin */
 bx(.12,2.4,.12,COL.steel,6.4,1.15,4.1);bx(.5,.1,.1,COL.steel,6.6,2.3,4.1);bx(.3,.06,.3,COL.steel,6.9,2.28,4.1);bx(.7,.06,.7,COL.woodL,6.4,gy(4.1)+.06,4.1);solidL(6.4,4.1,.15);/* beach shower */
 bx(2.4,.28,.3,'#8a7a5a',-8.2,gy(4.8)+.1,4.8,.25);bx(1.5,.24,.3,'#7a6a4a',-7.4,gy(5.4)+.1,5.4,-.4);/* driftwood */
 /* a surf lesson chalkboard on an A frame */
 bx(.9,1.2,.06,'#2a3a30',3.7,.75,5.1,.3,-.12);bx(.9,.06,.1,COL.woodD,3.7,.12,5.1,.3);bx(.06,1.3,.06,COL.woodD,3.25,.65,5.3,.3,.2);solidL(3.7,5.1,.5);
 /* feather flags */
 [[-8.2,3.1,COL.coral],[8.6,2.7,COL.teal]].forEach(([x,z,c])=>{bx(.06,3.4,.06,'#e8e8e8',x,gy(z)+1.6,z);bx(.07,1.5,.7,c,x,gy(z)+2.6,z+.36,0,0,.04);bx(.07,.9,.45,COL.cream,x,gy(z)+2.4,z+.28,0,0,.08);solidL(x,z,.1)});
 /* shells and a starfish for the small details */
 [[-1.4,4.2],[2.9,3.2],[7.8,6],[-6.1,2.7],[13.6,5.7]].forEach(([x,z],i)=>{bx(.22,.05,.18,i%2?COL.cream:COL.coral,x,gy(z)+.03,z,i);});
 /* leashes and a couple of boards on the sand */
 board(null,1.9,.5,'#6be08c','#fff3d9',9.4,gy(5.4)+.06,5.4,.5,0,0);board(null,2.7,.56,'#fff3d9','#3a7bd5',-1.8,gy(4.4)+.06,4.4,-.12,0,0)}
function buildPalms(){[[-17,12.5,1.15,.12,.9],[-13,15.5,1.0,.1,2.2],[-1.5,15.8,1.2,.15,.4],[9,14.5,1,.12,1.5],[19.5,12,1.1,.14,2.7],[24,9.5,.95,.1,.7],[-20,8.5,.9,.1,1.2],[4.5,17,.85,.1,3]].forEach(a=>palm(a[0],a[1],a[2],a[3],a[4]))}
/* signs as canvases */
function canvasSign(w,h,draw,px){const cv=document.createElement('canvas');cv.width=w*(px||96);cv.height=h*(px||96);const c=cv.getContext('2d');draw(c,cv.width,cv.height);const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;t.anisotropy=2;return{cv,c,t,w,h}}
const signMats=[];
function planeSign(g,sg,x,y,z,ry,rx){const m=new THREE.Mesh(new THREE.PlaneGeometry(sg.w,sg.h),new THREE.MeshBasicMaterial({map:sg.t}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);g.add(m);signMats.push(m);return m}
const frame=(c,w,h,bg,fg,lw)=>{c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle=fg;c.lineWidth=lw||6;c.strokeRect(lw||6,lw||6,w-2*(lw||6),h-2*(lw||6))};
const FONT="'Silkscreen','Courier New',monospace";
let repSign=null,repDay=-1;
function drawReport(){const rp=report(),o=st();repDay=dayNo();const c=repSign.c,W=repSign.cv.width,H=repSign.cv.height;
 frame(c,W,H,'#f4ead0','#5a3a22',8);c.fillStyle='#17323a';c.font='bold '+Math.round(H*.1)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('SURF REPORT',W/2,H*.11);
 c.fillStyle='#d94a33';c.fillRect(W*.07,H*.2,W*.86,H*.015);
 c.textAlign='left';c.font='bold '+Math.round(H*.062)+'px '+FONT;c.fillStyle='#17323a';
 c.fillText('DAY '+dayNo()+'   WIND '+rp.wind+' KM/H '+rp.kind.toUpperCase(),W*.07,H*.285);c.fillStyle='#2a7a74';c.font=Math.round(H*.052)+'px '+FONT;c.fillText('Conditions: '+rp.txt,W*.07,H*.35);
 LV.forEach((l,i)=>{const y=H*(.46+i*.115),r=sizeRange(i,rp),open=i<=o.lvl;c.fillStyle=open?'#17323a':'#8a8a80';c.font='bold '+Math.round(H*.055)+'px '+FONT;c.fillText(l.n.toUpperCase(),W*.07,y);
  c.textAlign='right';c.fillText(r[0].toFixed(1)+' - '+r[1].toFixed(1)+' M',W*.93,y);c.textAlign='left';c.fillStyle=open?'#2a7a74':'#a07070';c.font=Math.round(H*.04)+'px '+FONT;c.fillText(open?'open':'locked: score '+LV[i-1].thr+'+ at '+LV[i-1].n,W*.07,y+H*.047)});
 c.fillStyle='#17323a';c.font=Math.round(H*.045)+'px '+FONT;c.textAlign='center';c.fillText(o.own?'Your own board: surf free':'Board rental $10 a session',W/2,H*.93);repSign.t.needsUpdate=true}
function buildSigns(){
 const hut=canvasSign(5.4,1.1,(c,w,h)=>{frame(c,w,h,'#17323a','#ffd23d',8);c.fillStyle='#ffd23d';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(h*.52)+'px '+FONT;c.fillText('SURF BREAK',w/2,h*.45);c.fillStyle='#8ae0da';c.font=Math.round(h*.2)+'px '+FONT;c.fillText('BOARDS  *  WAX  *  LESSONS',w/2,h*.82)});
 planeSign(PROP,hut,0,3.62,7.4,Math.PI,0);
 /* a thin backing so the sign has a frame and a back */
 bx(5.6,1.3,.12,COL.woodD,0,3.62,7.55);
 const price=canvasSign(1.8,1.1,(c,w,h)=>{frame(c,w,h,'#fff3d9','#9a6a3c',8);c.fillStyle='#17323a';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(h*.24)+'px '+FONT;c.fillText('RENT A BOARD',w/2,h*.2);c.fillStyle='#d94a33';c.font='bold '+Math.round(h*.4)+'px '+FONT;c.fillText('$10',w/2,h*.56);c.fillStyle='#17323a';c.font=Math.round(h*.15)+'px '+FONT;c.fillText('3 rentals = own board',w/2,h*.86)},120);
 planeSign(PROP,price,-3.2,1.65,7.46,Math.PI,0);bx(1.95,1.25,.08,COL.woodD,-3.2,1.65,7.5);
 const arch=canvasSign(3.2,.7,(c,w,h)=>{frame(c,w,h,'#2aa7a1','#fff3d9',8);c.fillStyle='#fff3d9';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(h*.44)+'px '+FONT;c.fillText('PADDLE OUT',w/2,h*.52)});
 planeSign(PROP,arch,1.5,3.02,1.98,Math.PI,0);bx(3.4,.9,.08,COL.woodD,1.5,3.02,2.1);
 repSign=canvasSign(2.7,2.1,()=>{},150);planeSign(PROP,repSign,5.0,2.0,4.0,Math.PI,0);
 bx(2.9,2.3,.1,COL.woodD,5.0,2.0,4.06);bx(.2,2.6,.2,COL.woodD,3.8,1.1,4.1);bx(.2,2.6,.2,COL.woodD,6.2,1.1,4.1);bx(2.9,.1,.34,COL.woodL,5.0,3.2,4.0);solidL(5,4.1,0,1.5,.25);
 drawReport();
 /* the lifeguard tower sign */
 const lg=canvasSign(1.9,.55,(c,w,h)=>{frame(c,w,h,'#e8452c','#fff3d9',6);c.fillStyle='#fff3d9';c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(h*.55)+'px '+FONT;c.fillText('LIFEGUARD',w/2,h*.52)});
 planeSign(PROP,lg,15,3.9,5.88,Math.PI,0)}
/* ---- flush: merge all boxes into one mesh with vertex colours ---- */
function flushBoxes(){/* returns a merged mesh; the caller parents it */const tpl=new THREE.BoxGeometry(1,1,1),tp=tpl.attributes.position.array,tn=tpl.attributes.normal.array,ti=tpl.index.array,N=bxs.length,pos=new Float32Array(N*24*3),nor=new Float32Array(N*24*3),col=new Float32Array(N*24*3),idx=new Uint32Array(N*36);
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),ps=new THREE.Vector3(),v=new THREE.Vector3(),nm=new THREE.Matrix3(),cc=new THREE.Color();
 for(let b=0;b<N;b++){const o=bxs[b];e.set(o[8],o[7],o[9],'YXZ');q.setFromEuler(e);sc.set(o[0],o[1],o[2]);ps.set(o[4],o[5],o[6]);m.compose(ps,q,sc);nm.getNormalMatrix(m);cc.set(o[3]);
  for(let i=0;i<24;i++){v.set(tp[i*3],tp[i*3+1],tp[i*3+2]).applyMatrix4(m);const k=(b*24+i)*3;pos[k]=v.x;pos[k+1]=v.y;pos[k+2]=v.z;v.set(tn[i*3],tn[i*3+1],tn[i*3+2]).applyMatrix3(nm).normalize();nor[k]=v.x;nor[k+1]=v.y;nor[k+2]=v.z;col[k]=cc.r;col[k+1]=cc.g;col[k+2]=cc.b}
  for(let i=0;i<36;i++)idx[b*36+i]=ti[i]+b*24}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.xms=1;const mesh=new THREE.Mesh(g,mat);tpl.dispose();bxs.length=0;return mesh}
/* ---- the people (built when you come near) ---- */
const PPL=[];let ppBuilt=false;
function person(x,z,ry,o){o=o||{};const i=PPL.length,SK=(()=>{try{return SKIN.length}catch(e){return 6}})(),HK=(()=>{try{return HAIRC.length}catch(e){return 12}})();
 const r=n=>{let h=Math.sin((i+1)*91.7+n*17.3)*43758.5;return h-Math.floor(h)};
 const c={skin:Math.floor(r(1)*SK),eyes:Math.floor(r(2)*5),mouth:Math.floor(r(3)*4),hair:o.hair!=null?o.hair:Math.floor(r(4)*12),hc:Math.floor(r(5)*HK),top:o.topT!=null?o.topT:0,tc:0,pc:0,tc_custom:o.top||'#ffd23d',pc_custom:o.pants||'#2b3a55',body:r(6),bt:o.bt!=null?o.bt:2,hgt:.4+r(7)*.4};
 const f=buildChar(c);f.g.position.set(x,(o.y!=null?o.y:gy(z)+.1),z);f.g.rotation.y=ry||0;PROP.add(f.g);
 if(o.seat){f.legs.forEach(l=>l.rotation.x=-1.5);f.arms.forEach(a=>a.rotation.x=-.5)}
 const p={f,k:o.k||'idle',ph:i*1.7,y:f.g.position.y,x,z};PPL.push(p);return p}
function buildPeople(){if(ppBuilt)return;ppBuilt=true;
 person(0,10.0,Math.PI,{k:'clerk',top:'#2aa7a1',pants:'#e8e1d0',y:.06,hair:4,bt:3});/* Kai behind the counter, facing the sea */
 const tw=person(15,7.5,Math.PI,{k:'guard',top:'#e8452c',pants:'#e8452c',y:2.82,seat:1,hair:1,bt:3});tw.f.arms.forEach(a=>a.rotation.x=-.9);
 person(-6.3,4.4,.5,{k:'surfer',top:'#fff3d9',pants:'#3a7bd5',hair:5,bt:3});/* a surfer with a board, talking */
 person(11.8,5.2,-.4,{k:'sun',top:'#ff7ab8',pants:'#ff7ab8',y:gy(5.2)+.17,seat:1,hair:6,bt:1})}
let boardBuilt=false;
function peopleTick(dt){if(!ppBuilt)return;const t=TT;PPL.forEach(p=>{const g=p.f.g;
 if(p.k=='clerk'){p.f.arms[1].rotation.x=-.5+Math.sin(t*1.6+p.ph)*.12;p.f.arms[0].rotation.x=-.2;g.position.y=p.y+Math.abs(Math.sin(t*1.3))*.01}
 else if(p.k=='surfer'){p.f.arms[1].rotation.x=-.5+Math.sin(t*2.3)*.35;g.rotation.y=.5+Math.sin(t*.4)*.18}
 else if(p.k=='guard'){g.rotation.y=Math.PI+Math.sin(t*.35)*.5}
 else if(p.k=='sun'){g.position.y=p.y+Math.sin(t*.9)*.01}})}

/* ---------- the session ---------- */
const GK={};let GKd={};/* keys held / pressed this frame */
const SND_ADD=()=>{try{if(typeof SND!='object'||SND.sb_splash)return;
 SND.sb_splash=()=>{sdNz(.5,950,.34,{q:.7,f2:240,sw:.6,rev:.22,pan:rr(-.15,.15)});sdNz(.22,3000,.1,{ty:'highpass',del:.02});sdHit(120,.14,.26,[[1,1,1]],{bend:.4,lp:520})};
 SND.sb_carve=()=>{sdNz(.3,1700,.075,{q:.9,f2:620,sw:.55,pan:rr(-.25,.25),rev:.1})};
 SND.sb_land=()=>{sdNz(.18,1100,.16,{q:.8,f2:420,sw:.4});sdHit(140,.1,.2,[[1,1,1]],{bend:.3,lp:600})};
 SND.sb_ding=()=>{const f=1318;sdHit(f,.5,.11,[[1,1,1],[2.76,.16,.4],[5.4,.04,.2]],{jit:0,rev:.25});sdHit(f*1.5,.4,.07,[[1,1,1]],{del:.09,jit:0,rev:.3})}}catch(e){}};
const spl=k=>{try{SND_ADD();snd(k)}catch(e){}};

/* particles: one InstancedMesh of low-poly spheres for spray, bubbles and splashes */
const PN=360;let PART=null;
function partsOn(){const geo=new THREE.IcosahedronGeometry(1,0),mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.92}),im=new THREE.InstancedMesh(geo,mat,PN);im.frustumCulled=false;im.renderOrder=5;
 const pt=[];for(let i=0;i<PN;i++)pt.push({l:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,s:.1,m:1,g:9,c:new THREE.Color(1,1,1)});
 for(let i=0;i<PN;i++){im.setColorAt(i,pt[i].c)}scene.add(im);PART={im,pt,n:0,m4:new THREE.Matrix4(),q:new THREE.Quaternion(),v:new THREE.Vector3(),sc:new THREE.Vector3()}}
function partsOff(){if(!PART)return;scene.remove(PART.im);PART.im.geometry.dispose();PART.im.material.dispose();PART.im.dispose();PART=null}
/* spawn n particles at a point (local frame s,u,y), velocities in the local frame too */
function fx(s,u,y,n,o){if(!PART)return;o=o||{};const t=tanAt(s),nn=nrmAt(s),w=toWorld(s,u),col=o.c||'#ffffff';
 for(let k=0;k<n;k++){const p=PART.pt[PART.n=(PART.n+1)%PN],a=rr(0,6.283),sp=rr(.3,1)*(o.sp||2),vs=(o.vs||0)+Math.cos(a)*sp,vu=(o.vu||0)+Math.sin(a)*sp,vy=(o.vy||2)*rr(.5,1.2);
  p.x=w[0]+rr(-1,1)*(o.r||.2);p.z=w[1]+rr(-1,1)*(o.r||.2);p.y=y+rr(0,.2);p.vx=t[0]*vs+nn[0]*vu;p.vz=t[1]*vs+nn[1]*vu;p.vy=vy;p.s=(o.size||.16)*rr(.7,1.3);p.l=p.m=(o.life||.9)*rr(.7,1.2);p.g=o.g==null?9:o.g;p.c.set(col)}}
function partsTick(dt){if(!PART)return;const im=PART.im,{m4,q,v,sc}=PART;let any=false;
 for(let i=0;i<PN;i++){const p=PART.pt[i];if(p.l>0){p.l-=dt;p.vy-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<-.35&&p.g>0){p.y=-.35;p.vy=0;p.vx*=.4;p.vz*=.4;p.l=Math.min(p.l,.15)}}
  const k=p.l>0?Math.min(1,p.l/p.m*2.2)*p.s:0;v.set(p.x,p.y,p.z);sc.set(k,k,k);m4.compose(v,q,sc);im.setMatrixAt(i,m4);im.setColorAt(i,p.c);if(p.l>0)any=true}
 im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}

/* ---------- the sweet spot marker (v55.23) ----------
   A glowing ring on the water with a soft inner disk, a breathing inner ring and a pulse that rolls outward, a light beam you can see
   from anywhere in the line-up, a floating arrow, a soft band showing the whole catchable stretch of the wave and a dotted trail from
   you to the spot. Gold = paddle there, green = in position, white flash = pop up now. A label in the HUD follows it on screen. */
let MK=null;
const MKC={far:new THREE.Color('#ffc83a'),in:new THREE.Color('#4dffa0'),now:new THREE.Color('#ffffff')};
function markerOn(){const grp=new THREE.Group();grp.name='surfSpot';grp.visible=false;
 const add=(geo,mat,ro)=>{const m=new THREE.Mesh(geo,mat);m.renderOrder=ro||7;m.frustumCulled=false;grp.add(m);return m};
 const bm=o=>new THREE.MeshBasicMaterial(Object.assign({transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4},o));
 const flat=g=>{g.rotateX(-Math.PI/2);return g};
 const disk=add(flat(new THREE.CircleGeometry(1.62,48)),bm({color:0xffc83a,opacity:.2}));
 const ring=add(flat(new THREE.RingGeometry(1.6,2.02,64)),bm({color:0xffc83a,opacity:.95}));
 const rim=add(flat(new THREE.RingGeometry(2.02,2.14,64)),bm({color:0x0a2a33,opacity:.35}));
 const inner=add(flat(new THREE.RingGeometry(.86,1.0,48)),bm({color:0xffffff,opacity:.75}));
 const pulse=add(flat(new THREE.RingGeometry(1.94,2.08,64)),bm({color:0xffffff,opacity:.6}));
 /* four notches on the ring, like a sight */
 const notchG=new THREE.BufferGeometry();{const v=[];for(let k=0;k<4;k++){const a=k*Math.PI/2,ca=Math.cos(a),sa=Math.sin(a),px=-sa*.12,pz=ca*.12,r0=2.18,r1=2.62;
   v.push(ca*r0+px,0,sa*r0+pz, ca*r1,0,sa*r1, ca*r0-px,0,sa*r0-pz)}notchG.setAttribute('position',new THREE.Float32BufferAttribute(v,3))}
 const notch=add(notchG,bm({color:0xffc83a,opacity:.95}));
 /* the light beam: brightest at the water, fading up, soft at its edges, with slow rising bands */
 const beamMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
  uniforms:{uC:{value:new THREE.Color(0xffc83a)},uA:{value:.55},uT:{value:0}},
  vertexShader:`varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform vec3 uC;uniform float uA;uniform float uT;varying vec2 vUv;varying vec3 vN;varying vec3 vV;
   void main(){float rim=pow(abs(dot(vN,vV)),1.4);float h=vUv.y;float a=pow(1.-h,1.8)*uA*rim;a*=.8+.2*sin(h*22.-uT*5.);a+=pow(1.-h,10.)*.35*uA;gl_FragColor=vec4(uC*a,a);}`});
 const beamG=new THREE.CylinderGeometry(.55,1.15,12,24,1,true);beamG.translate(0,6,0);const beam=add(beamG,beamMat,8);
 /* the floating arrow: a four sided gem pointing down with a white cap */
 const arw=new THREE.Group();grp.add(arw);
 const gemM=new THREE.MeshLambertMaterial({color:0xffc83a,emissive:0x5a3d00});
 const gem=new THREE.Mesh(new THREE.ConeGeometry(.5,.95,4),gemM);gem.rotation.x=Math.PI;arw.add(gem);
 const cap=new THREE.Mesh(new THREE.ConeGeometry(.5,.28,4),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x555555}));cap.position.y=.61;arw.add(cap);
 arw.children.forEach(m=>{m.renderOrder=8;m.frustumCulled=false});
 /* the catchable stretch: a soft band along the break line */
 const bandMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,
  uniforms:{uC:{value:new THREE.Color(0xffffff)},uA:{value:.0},uT:{value:0}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 uC;uniform float uA;uniform float uT;varying vec2 vUv;void main(){float ex=smoothstep(0.,.18,vUv.x)*smoothstep(1.,.82,vUv.x),ey=smoothstep(0.,.35,vUv.y)*smoothstep(1.,.65,vUv.y);
   float st=.65+.35*step(.5,fract(vUv.x*9.-uT*.8));gl_FragColor=vec4(uC,uA*ex*ey*st);}`});
 const band=new THREE.Mesh(flat(new THREE.PlaneGeometry(1,1)),bandMat);band.renderOrder=6;band.frustumCulled=false;scene.add(band);
 /* the trail of dots from you to the spot */
 const TN=12,dotM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 const dots=new THREE.InstancedMesh(flat(new THREE.CircleGeometry(.2,14)),dotM,TN);dots.renderOrder=7;dots.frustumCulled=false;scene.add(dots);
 scene.add(grp);
 MK={grp,disk,ring,rim,inner,pulse,notch,beam,beamMat,arw,gemM,band,bandMat,dots,TN,k:0,col:MKC.far.clone(),flash:0,lx:null,ly:null,m4:new THREE.Matrix4(),v:new THREE.Vector3(),q:new THREE.Quaternion(),sc:new THREE.Vector3()}}
function markerOff(){if(!MK)return;const dis=o=>{o.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose()})};
 scene.remove(MK.grp);scene.remove(MK.band);scene.remove(MK.dots);dis(MK.grp);dis(MK.band);MK.dots.geometry.dispose();MK.dots.material.dispose();MK.dots.dispose();MK=null;
 const l=$s('sb_spot');if(l)l.style.display='none'}
function markerFlash(){if(MK)MK.flash=1}
function markerTick(dt){if(!MK)return;const g=G,M=MK,sp=g.spot,show=g.st=='paddle'&&!!sp&&!g.paused;
 M.k+=((show?1:0)-M.k)*Math.min(1,dt*(show?4:7));if(!show)spotLabel(null);M.flash=Math.max(0,M.flash-dt*2.2);
 const vis=M.k>.01;M.grp.visible=M.band.visible=M.dots.visible=vis;
 if(!vis||!sp){spotLabel(null);return}
 const p=sp.p,w=toWorld(p.s,p.u),y=water(p.s,p.u)+.07,t=tanAt(p.s),ang=Math.atan2(-t[1],t[0]);
 M.grp.position.set(w[0],y,w[1]);M.grp.rotation.y=ang;
 const inPos=g.spotDist!=null&&g.spotDist<2.4,now=!!(g.ring&&Math.abs(g.ring.xi-1.8)<.6),coming=!!g.meter;
 const tc=now?MKC.now:inPos?MKC.in:MKC.far;M.col.lerp(tc,Math.min(1,dt*8));
 const fl=M.flash,c=M.col,A=M.k;
 [M.ring.material,M.disk.material,M.notch.material].forEach(m=>m.color.copy(c));M.gemM.color.copy(c);M.gemM.emissive.copy(c).multiplyScalar(.35);M.beamMat.uniforms.uC.value.copy(c);
 const T=TT,br=.5+.5*Math.sin(T*(now?14:coming?7:3.2));
 M.ring.material.opacity=A*(.82+.18*br);M.disk.material.opacity=A*(.14+.12*br+(now?.2:0)+fl*.5);M.rim.material.opacity=A*.3;M.notch.material.opacity=A*.9;
 M.ring.scale.setScalar(1+fl*.35+(now?.06*br:0));M.notch.rotation.y=T*(inPos?.9:.35);M.notch.scale.setScalar(1+.06*br);
 M.inner.scale.setScalar(.85+.3*br);M.inner.material.opacity=A*(.45+.4*(1-br));
 const pp=(T*(coming?1.6:.8))%1;M.pulse.scale.setScalar(1+pp*1.4);M.pulse.material.opacity=A*.65*(1-pp)*(1-pp);
 /* the beam fades as you get close (it would only be in the way) */
 const dist=g.spotDist||0,bA=(inPos?.22:clamp(.25+dist/30,.3,.7))*A*(1+fl);M.beamMat.uniforms.uA.value=bA;M.beamMat.uniforms.uT.value=T;M.beam.scale.set(1,inPos?.55:1,1);
 /* arrow: bobs and turns slowly, drops lower once you are in position */
 const ay=(inPos?2.6:4.2)+Math.sin(T*2.6)*.22;M.arw.position.y+=(ay-M.arw.position.y)*Math.min(1,dt*4);M.arw.rotation.y=T*1.4;M.arw.scale.setScalar(A*(inPos?.75:1.05)*(1+fl*.4));
 /* band along the break line (d 3.5 to 16 at the spot time), in the coast frame */
 {const s0=p.s-4,s1=p.s+8.5,sc=(s0+s1)/2,u0=sp.w.ub-.8,u1=sp.w.ub+3.6,uc=(u0+u1)/2,bw=toWorld(sc,uc),bt=tanAt(sc);M.band.position.set(bw[0],water(sc,uc)+.05,bw[1]);M.band.rotation.y=Math.atan2(-bt[1],bt[0]);M.band.scale.set(s1-s0,1,u1-u0);
  M.bandMat.uniforms.uA.value=A*(inPos?.1:.17)*(coming?1.4:1);M.bandMat.uniforms.uC.value.copy(c);M.bandMat.uniforms.uT.value=T}
 /* trail: marching dots from the board to the ring when you are more than a few metres away */
 const im=M.dots,show2=dist>3.6;let n=0;if(show2){const ds=p.s-g.s,du=p.u-g.u,L=Math.hypot(ds,du),ns=ds/L,nu=du/L,from=1.4,to=L-2.3,step=1.6,off=(T*2.4)%step;
  for(let x=from+off;x<to&&n<M.TN;x+=step){const s=g.s+ns*x,u=g.u+nu*x,pw=toWorld(s,u),f=Math.min(1,(x-from)/2,(to-x)/2)*A;M.v.set(pw[0],water(s,u)+.06,pw[1]);M.sc.set(f,1,f);M.m4.compose(M.v,M.q,M.sc);im.setMatrixAt(n++,M.m4)}}
 im.count=n;im.instanceMatrix.needsUpdate=true;im.material.color.copy(c).lerp(MKC.now,.55);
 if(show)spotLabel({x:w[0],y:y+M.arw.position.y+.9,z:w[1],inPos,now,coming,dist})}
/* the HUD label that rides above the arrow (clamped to the screen edge with a pointer when the spot is off screen) */
function spotLabel(o){const e=$s('sb_spot');if(!e)return;if(!o||!MK||MK.k<.05){e.style.display='none';return}
 const g=G,v=MK.v.set(o.x,o.y,o.z).project(cam3),W=innerWidth,H=innerHeight;let x=(v.x+1)/2*W,y=(1-v.y)/2*H;const behind=v.z>1;
 if(behind){x=W-x;y=H-60}const m=70,off=behind||x<m||x>W-m||y<m||y>H-m;const cx=clamp(x,m,W-m),cy=clamp(y,m+40,H-m-90);
 if(MK.lx==null){MK.lx=cx;MK.ly=cy}MK.lx+=(cx-MK.lx)*.35;MK.ly+=(cy-MK.ly)*.35;
 const paddling=g.sIn<.6;let t,sub,cls;
 if(o.now){t='POP UP!';sub='SPACE';cls='now'}
 else if(g.ring){t=paddling?'GET READY':'PADDLE IN';sub=paddling?'pop up in the green':'hold S';cls='go'}
 else if(o.coming&&o.inPos){t=paddling?'HERE IT COMES':'TURN AND PADDLE IN';sub=paddling?'keep paddling':'hold S';cls='go'}
 else if(o.inPos){t='IN POSITION';sub='wait for the wave';cls='in'}
 else{t='SWEET SPOT';sub=Math.round(o.dist)+' m';cls='far'}
 setH('sb_spot_t',t);setT('sb_spot_s',sub);e.className=cls+(off?' off':'');e.style.display='block';
 e.style.transform=`translate(${MK.lx.toFixed(1)}px,${MK.ly.toFixed(1)}px) translate(-50%,-100%)`;
 const a=$s('sb_spot_a');if(a){if(off){const ang=Math.atan2(y-cy,x-cx);a.style.transform=`rotate(${(ang*180/Math.PI).toFixed(0)}deg) translateX(70px)`;a.style.display='block'}else a.style.display='none'}}

/* ---------- the rider and the board ---------- */
function boardMesh(own){const c1=new THREE.Color(own?'#3a7bd5':'#ffd23d'),c2=new THREE.Color(own?'#fff3d9':'#ff6f61'),N=26,L=2.0,pts=[],W=.28;
 const wd=t=>W*Math.max(Math.pow(Math.sin(Math.PI*Math.pow(t,.72)),.45),t<.1?.38*(1-t*10):0);
 for(let i=0;i<=N;i++){const t=i/N;pts.push(new THREE.Vector2(-wd(t),(t-.5)*L))}for(let i=N;i>=0;i--){const t=i/N;pts.push(new THREE.Vector2(wd(t),(t-.5)*L))}
 const rock=g=>{g.rotateX(Math.PI/2);g.computeBoundingBox();g.translate(0,.035-g.boundingBox.max.y,0);const p=g.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i);if(z>.25)p.setY(i,p.getY(i)+Math.pow((z-.25)/.75,2)*.17);else if(z<-.6)p.setY(i,p.getY(i)+Math.pow((-.6-z)/.4,2)*.05)}return g};
 const paint=(g,col)=>{g=g.toNonIndexed();g.computeVertexNormals();const n=g.attributes.position.count,ca=new Float32Array(n*3);for(let i=0;i<n;i++){ca[i*3]=col.r;ca[i*3+1]=col.g;ca[i*3+2]=col.b}g.setAttribute('color',new THREE.BufferAttribute(ca,3));return g};
 const mk=(sh,d,col,dy)=>{const g=rock(new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.018,bevelSize:.016,bevelSegments:2,curveSegments:4}));g.translate(0,dy||0,0);return paint(g,col)};
 const sh=new THREE.Shape(pts),st2=new THREE.Shape([new THREE.Vector2(-.022,-.82),new THREE.Vector2(.022,-.82),new THREE.Vector2(.022,.8),new THREE.Vector2(-.022,.8)]);
 const fin=(x,z,h,l,col)=>{const f=new THREE.Shape();f.moveTo(0,0);f.lineTo(l,0);f.lineTo(l*.35,-h);f.lineTo(0,0);const g=new THREE.ExtrudeGeometry(f,{depth:.018,bevelEnabled:false});g.rotateY(-Math.PI/2);g.translate(x+.009,-.03,z+l/2);return paint(g,col)};
 const dk=new THREE.Color('#222');const parts=[mk(sh,.04,c1,0),mk(st2,.05,c2,.004),fin(0,-.9,.13,.2,dk),fin(-.11,-.72,.1,.16,dk),fin(.11,-.72,.1,.16,dk)];
 let n=0;parts.forEach(g=>n+=g.attributes.position.count);const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
 parts.forEach(g=>{pos.set(g.attributes.position.array,o);nor.set(g.attributes.normal.array,o);col.set(g.attributes.color.array,o);o+=g.attributes.position.array.length;g.dispose()});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.xms=1;return new THREE.Mesh(geo,mat)}
const UP=new THREE.Vector3(0,1,0);
const _m1=new THREE.Matrix4(),_m2=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(0,0,0,'YXZ'),_v=new THREE.Vector3(),_s1=new THREE.Vector3(1,1,1);
function setBoard(x,y,z,yaw,pitch,roll){const b=G.board;b.position.set(x,y,z);b.rotation.set(pitch,yaw,roll,'YXZ');b.updateMatrix()}
/* the rider sits in the board frame: offset (ox,oy,oz), own yaw, pitch (x), roll (z) in that frame */
function setRider(ox,oy,oz,ry,rx,rz){const m=P.mesh;G.board.updateMatrixWorld(true);_e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);_m1.compose(_v.set(ox,oy,oz),_q,_s1);_m2.multiplyMatrices(G.board.matrixWorld,_m1);m.position.setFromMatrixPosition(_m2);m.quaternion.setFromRotationMatrix(_m2)}

/* ---------- start / stop ---------- */
let sbCSS=null,hud=null;
function startSession(lv,own,fee){if(G||away()||mode=='surf')return;const o=st();
 if(!own&&fee){if((S.money||0)<fee){sn('err');return say2('A board rental is $'+fee+'.')}S.money=+((S.money||0)-fee).toFixed(2);o.rent++;S.spent=(S.spent||0)+fee}
 if(!o.own&&o.rent>=3){o.own=1;try{say2('Kai hands you your own board. Surf free from now on!')}catch(e){}}
 o.sessions++;o.tok=-1;lv=clamp(lv,0,Math.min(3,o.lvl));
 try{closeUI()}catch(e){}
 G={on:1,paused:0,lv,L:LV[lv],rp:report(),own:!!o.own,t0:TT,left:SESSION,st:'paddle',stT:0,ts:1,tsT:1,s:PS+14,u:3.2,vs:0,vu:0,hs:0,hu:1,idle:0,sIn:9,rides:[],top:[],combo:1,comboT:0,msg:null,msgT:0,
  rideN:0,tubes:0,tricks:0,sets:null,fade:0,fadeT:0,end:0,cam:{s:0,u:0,y:3,ls:0,lu:0,ly:1,fov:60,tube:0,init:0},lastSpace:-9,coolPop:0,cx:0,cy:0,cz:0,mastery:0,sumShown:0,hint:'',flash:0,wasHidden:[]};
 G.sets=planSession(lv,TT);
 mode='surf';try{$('hud').style.display='none'}catch(e){}document.body.classList.add('fston');
 G.hidden=[];try{FOL.forEach(f=>{G.hidden.push([f,f.m.visible]);f.m.visible=false})}catch(e){}
 try{if(P.mesh){P.mesh.visible=true;G.sh=P.mesh.children[0]&&P.mesh.children[0].visible;if(P.mesh.children[0])P.mesh.children[0].visible=false}}catch(e){}
 const bm=boardMesh(G.own);G.board=new THREE.Group();G.board.add(bm);G.boardMesh=bm;scene.add(G.board);
 partsOn();
 markerOn();
 G.stars=new THREE.Group();const sg=new THREE.BoxGeometry(.14,.14,.14),sm2=new THREE.MeshBasicMaterial({color:0xffe45a});for(let i=0;i<4;i++){const m=new THREE.Mesh(sg,sm2);G.stars.add(m)}G.stars.visible=false;scene.add(G.stars);
 hudOn();fadeIn(.7);
 const sf=scene.fog;G.fog=sf&&sf.near!=null?[sf.near,sf.far,sf.color.clone()]:null;if(sf&&sf.near!=null){sf.near=380;sf.far=1500;const bg=scene.background;if(bg&&bg.isColor)sf.color.copy(bg)}
 VIEW.on=false;
 const w=toWorld(G.s,G.u);P.x=w[0];P.z=w[1];
 camSnap();msg('Paddle out to the line-up',2.4);spl('whoosh');
 try{document.getElementById('c').focus()}catch(e){}}
function endSession(quit){if(!G)return;const g=G,o=st();
 try{const top2=g.top.slice().sort((a,b)=>b-a).slice(0,2).reduce((a,b)=>a+b,0);
  if(!quit||g.rides.length){const pts=clamp(1.2+top2*.28+g.tubes*.5,0,8);mast(pts,'Surf session')}
  g.top2=top2}catch(e){soft(e,'end')}
 sv()}
function exitSession(){const g=G;if(!g)return;G=null;
 mode='play';try{$('hud').style.display=''}catch(e){}document.body.classList.remove('fston');
 try{g.hidden.forEach(a=>{a[0].m.visible=a[1]})}catch(e){}
 try{if(P.mesh){if(P.mesh.children[0])P.mesh.children[0].visible=g.sh!==false;P.mesh.rotation.set(0,0,0);P.mesh.quaternion.identity();P.arms[0].rotation.set(0,0,0);P.arms[1].rotation.set(0,0,0);P.legs[0].rotation.set(0,0,0);P.legs[1].rotation.set(0,0,0);if(g.head)g.head.rotation.set(0,0,0)}}catch(e){}
 try{scene.remove(g.board);g.boardMesh.geometry.dispose();g.boardMesh.material.dispose();scene.remove(g.stars);g.stars.children[0].geometry.dispose();g.stars.children[0].material.dispose()}catch(e){soft(e,'dispose')}
 partsOff();markerOff();hudOff();
 try{const sf=scene.fog;if(g.fog&&sf){sf.near=g.fog[0];sf.far=g.fog[1];sf.color.copy(g.fog[2])}}catch(e){}
 const gw=lw(1.5,4.4);P.x=gw[0];P.z=gw[1];P.rot=Math.atan2(-(nrmAt(PS)[0]),-(nrmAt(PS)[1]));SY=0;HY=0;
 SCH.mode='idle';SCH.next=0;resetWaves();gateCool=TT+3;
 sv()}
let HY=0,gateCool=0;
const mast=(pts,why)=>{try{if(typeof FW_MASTERY!='undefined'&&FW_MASTERY.add){const r=FW_MASTERY.add('surf',clamp(pts,0,60),why);G&&(G.mastery+=+r||0)}}catch(e){soft(e,'mast')}};
function msg(t,sec,cls){if(!G)return;G.msg=t;G.msgT=sec||1.6;G.msgC=cls||'';const e=$s('sb_msg');if(e){e.textContent=t;e.className=cls||'';e.style.opacity=1;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}}

/* ---------- input ---------- */
const keyName=e=>{const k=(e.key||'').toLowerCase();return k==' '||k=='spacebar'?' ':k};
const guard=()=>G&&G.on;
addEventListener('keydown',e=>{if(!guard())return;if(e.ctrlKey||e.metaKey||/^f\d+$/i.test(e.key||''))return;const k=keyName(e);e.stopImmediatePropagation();
 if(k=='escape'){e.preventDefault();if(!e.repeat)pauseCard();return}
 if(G.paused){if(k=='enter'&&!e.repeat)resumeCard();return}
 if(G.st=='done'){if(!e.repeat&&(k=='enter'||k==' '))sumAgain();if(k==' '||k.startsWith('arrow'))e.preventDefault();return}
 if(!e.repeat)GKd[k]=1;GK[k]=1;if(k==' '||k.startsWith('arrow')||k=='tab')e.preventDefault()},true);
addEventListener('keyup',e=>{const k=keyName(e);if(!guard()&&!GK[k])return;delete GK[k];if(guard())e.stopImmediatePropagation()},true);
addEventListener('blur',()=>{for(const k in GK)delete GK[k];if(G&&G.on&&!G.paused&&G.st!='done')pauseCard()});
addEventListener('contextmenu',e=>{if(guard())e.preventDefault()},true);
const KL=()=>!!(GK.a||GK.arrowleft),KR=()=>!!(GK.d||GK.arrowright),KU=()=>!!(GK.w||GK.arrowup),KD=()=>!!(GK.s||GK.arrowdown);
const PRS=k=>!!GKd[k];
function steerIn(){let x=(KR()?1:0)-(KL()?1:0),y=(KU()?1:0)-(KD()?1:0);try{if(window.TCHJ&&TCHJ.on&&(TCHJ.x||TCHJ.y)){x=TCHJ.x;y=-TCHJ.y}}catch(e){}return[x,y]}

/* ---------- the surface under the rider: a bore pushes a paddler shoreward ---------- */
function bore(s,u){let p=0;for(let i=0;i<waves.length;i++){const w=waves[i];if(TT<w.tb-(215-w.ub)/w.c||waveDead(w,TT))continue;const e=envAt(w,s);if(e<.05)continue;const uc=ucAt(w,s,TT),d=s-sbAt(w,TT),T=w.H*e*sm(192,166,uc);if(T<.1||d>2)continue;
  if(prof(T,d,0,u-uc,uc,SCR)&&SCR[3]>.3&&SCR[1]>.12)p=Math.max(p,SCR[1]*SCR[3])}return p}
const water=(s,u)=>hAt(s,u)+baseY(u);

/* ---------- paddling and catching ----------
   v55.23: every wave has one sweet spot: 1.2 m outside its break line and 7.5 m ahead of where the peel will be when the swell gets there.
   A marker on the water (ring, light beam, floating arrow, a dotted trail from you and a label that follows it) shows it, and a timing
   meter shows the swell coming up behind you: pop up when the needle is in the green. */
const SPOT_D=7.5,SPOT_U=1.2;
function spotOf(w){const t=w.tb-SPOT_U/w.c,s=sbAt(w,t)+SPOT_D;return{s,u:w.ub+SPOT_U,t}}
/* when does the crest of w reach the line u at s (bisection, the crest only ever moves in) */
function arrival(w,s,u){let a=TT,b=TT+24;if(ucAt(w,s,a)<=u)return TT;if(ucAt(w,s,b)>u)return null;for(let i=0;i<20;i++){const m=(a+b)/2;if(ucAt(w,s,m)>u)a=m;else b=m}return b}
const catchable=w=>!w.close&&!waveDead(w,TT)&&TT>w.tb-(200-w.ub)/w.c;
function ringCandidate(){const s=G.s,u=G.u;let best=null,bd=1e9;
 for(let i=0;i<waves.length;i++){const w=waves[i];if(!catchable(w))continue;const e=envAt(w,s);if(e<.5)continue;
  const uc=ucAt(w,s,TT),xi=u-uc;if(xi<-.8||xi>14)continue;
  const ta=arrival(w,s,u),dArr=ta==null?99:s-sbAt(w,ta),far=u-w.ub>6.5,ok=!far&&dArr>3.2&&dArr<22&&sbAt(w,TT)<s-1;
  const dd=Math.abs(xi-1.8);if(dd<bd){bd=dd;best={w,xi,dArr,ok,far}}}return best}
/* the wave the marker shows: the next catchable one whose sweet spot has not been passed yet */
function nextSpotWave(){let nx=null,sp=null;for(const w of waves){if(!catchable(w)||TT<w.tb-40)continue;const p=spotOf(w);if(p.t<TT-.5)continue;if(!nx||p.t<sp.t){nx=w;sp=p}}return nx?{w:nx,p:sp}:null}
function paddleTick(dt){const g=G,[ix,iy]=steerIn();
 const inward=iy<0;if(inward)g.sIn=0;else g.sIn+=dt;
 const bw=bore(g.s,g.u),slow=1-clamp(bw*.45,0,.55);
 const tvs=ix*2.9*slow,tvu=iy>0?iy*3.1*slow:iy*3.5;
 g.vs+=(tvs-g.vs)*Math.min(1,dt*3.4);g.vu+=(tvu-g.vu)*Math.min(1,dt*(iy?3.2:2.2));
 if(bw>0)g.vu-=clamp(bw,0,2.2)*3.2*dt;
 g.s=clamp(g.s+g.vs*dt,-72,172);g.u=clamp(g.u+g.vu*dt,2.4,172);
 const sp=Math.hypot(g.vs,g.vu);if(sp>.45){const hs=g.vs/sp,hu=g.vu/sp;g.hs+=(hs-g.hs)*Math.min(1,dt*7);g.hu+=(hu-g.hu)*Math.min(1,dt*7);const l=Math.hypot(g.hs,g.hu)||1;g.hs/=l;g.hu/=l;g.idle=0}else g.idle+=dt;
 g.pdl=(g.pdl||0)+dt*(2.2+sp*2.2);
 if(sp>1&&Math.random()<dt*14)fx(g.s-g.hs*.8,g.u-g.hu*.8,water(g.s,g.u)+.05,1,{sp:.8,vy:1.2,size:.12,life:.5,r:.3});
 if(sp>.8)foamAt(g.s,g.u,1.4,.35);
 /* the sweet spot of the next wave, and how close you are to it */
 const ns=nextSpotWave();g.spot=ns;if(ns){const p=ns.p;g.spotDs=p.s-g.s;g.spotDu=p.u-g.u;g.spotDist=Math.hypot(g.spotDs,g.spotDu)}else g.spotDist=null;
 /* the wave that is about to lift you: the meter runs while it is behind you and it will break around you */
 const c=ringCandidate();g.ring=null;g.meter=null;g.tsT=1;g.hint='';
 if(c&&c.ok&&g.coolPop<=0){const paddling=g.sIn<.6;g.meter=c;
  if(c.xi<7.2&&c.xi>-.2){g.ring=c;g.tsT=paddling?.5:.7}
  else if(c.xi>0&&c.xi<24&&!paddling)g.hint='Wave coming! Turn for the beach and paddle in: hold S'}
 else if(c&&!c.ok&&c.xi>0&&c.xi<22&&g.coolPop<=0){g.hint=c.far?'Too far out: it will not break here. Paddle to the marker':c.dArr<=3.2?'Too close to the breaking part: paddle to the marker':'Not this one: paddle to the marker'}
 g.coolPop-=dt;
 if(PRS(' ')){if(g.ring)tryPop(g.ring);else if(g.coolPop<=0&&c&&c.ok&&c.xi>7.2&&c.xi<24){g.coolPop=.7;msg('Too early!',.8,'bad')}}
 if(g.ring&&g.ring.xi<-.3&&!g.popped){g.coolPop=1.4;g.ring=null;msg('Missed it',1,'bad')}}
function tryPop(c){const g=G,dxi=Math.abs(c.xi-1.8);
 if(c.xi>5){g.coolPop=.8;g.ring=null;msg('Too early!',.9,'bad');return}
 if(c.xi<-.2){g.coolPop=1.2;g.ring=null;msg('Too late!',.9,'bad');return}
 const paddling=g.sIn<.6,sp=spotOf(c.w),pe=Math.hypot((c.dArr-SPOT_D)/6,(g.u-sp.u)/3.5),qT=clamp(1-dxi/2.6,0,1),qP=clamp(1-pe,0,1);
 let q=qT*.62+qP*.38;if(!paddling)q*=.72;
 const perfect=dxi<.6&&pe<.55&&paddling;
 const lab=perfect?'PERFECT POP UP':dxi<1.4&&q>.5?'Nice pop up':'Pop up';
 g.popQ=q;g.popLab=lab;g.popPerfect=perfect;startRide(c.w,q)}

/* ---------- riding ---------- */
function newRide(w,q){return{w,q,t:0,dropT:.62,v:w.vp*(.86+.16*q),z:1,zv:-1.2,s0:G.s,len:0,style:0,pocket:0,tube:0,tubeCur:0,tubeN:0,carves:0,tops:0,dir:0,lastExt:1,tricks:[],kinds:{},air:null,pump:0,pumpCd:0,vmax:0,warn:0,Tmax:0,Tsum:0,kap:0,pts:{len:0,style:0,tube:0,trick:0},stuck:0}}
function startRide(w,q){const g=G;g.R=newRide(w,q);g.st='ride';g.stT=0;g.ring=null;g.tsT=1;g.popped=true;
 const d=g.s-sbAt(w,TT);w.caught++;g.rideN++;
 if(d<2.4){return wipeout('foam',true)}
 msg(g.popLab+'!',1.1,q>.75?'good':'');spl('whoosh');markerFlash();fx(g.s,g.u,water(g.s,g.u)+.2,18,{sp:3,vy:3,size:.2,life:.9});
 if(g.popPerfect){addStyle(10);chainAdd(1);spl('sb_ding');fx(g.s,g.u,water(g.s,g.u)+.6,16,{sp:2.6,vy:3.2,size:.14,life:1,g:3,c:'#ffd23d'})}}
const curP=[0,0,0,0];
function rideTick(dt){const g=G,R=g.R,w=R.w;R.t+=dt;g.popped=false;
 const s=g.s,e=envAt(w,s),uc=ucAt(w,s,TT),d=s-sbAt(w,TT);g.d=d;
 const T=w.H*e*sm(192,166,uc)*(1-.005*clamp(d,0,60));R.T=T;R.Tmax=Math.max(R.Tmax,T);
 if(T<.5||e<.26||uc>186){return endRide('out')}
 const k=kapOf(w.hol,d);R.kap=k;const zmax=lerp(1,.66,k);
 let [ix,iy]=steerIn();const str=clamp((KL()?1:0)-(KR()?1:0)-(window.TCHJ&&TCHJ.on?ix:0),-1,1)*(R.t<R.dropT?.3:1);
 const air=R.air;
 /* pump and stall */
 if(R.pumpCd>0)R.pumpCd-=dt;if(R.pump>0)R.pump=Math.max(0,R.pump-dt/.55);
 if(!air&&(PRS('w')||PRS('arrowup')||(iy>.6&&!R.tpH))&&R.pumpCd<=0){R.pump=1;R.pumpCd=.42;fx(s-.5,g.u,water(s,g.u)+.3,8,{sp:2.2,vy:2,size:.16,life:.6});spl('sb_carve')}
 R.tpH=iy>.6;
 const stall=KD()||iy<-.6;
 if(!air){
  const tz=str*1.75*(.6+.4*clamp(R.v/w.vp,0,1.3))-.09*(1-Math.abs(str))-(R.t<R.dropT?1.1:0);
  R.zv+=(tz-R.zv)*Math.min(1,dt*7.5);let z=R.z+R.zv*dt;if(z>zmax){z=zmax;if(R.zv>0)R.zv=0}if(z<0){z=0;if(R.zv<0)R.zv=0}R.z=z;
  let vt=w.vp*(.78+.62*Math.pow(1-z,.8));if(z<.12)vt*=.55+3.75*z;vt*=1-.5*sm(14,36,d);vt+=R.pump*.22*w.vp;if(stall)vt-=.34*w.vp;
  R.v+=(vt-R.v)*Math.min(1,dt*2.4);R.v=clamp(R.v,2,w.vp*1.65);
  g.s+=R.v*dt;R.len=g.s-R.s0;R.vmax=Math.max(R.vmax,R.v);
  /* carving: a turn is counted when the face direction changes after a real swing */
  const dn=R.zv>.4?1:R.zv<-.4?-1:0;
  if(dn&&dn!==R.dir){if(R.dir!==0){const amp=Math.abs(R.z-R.lastExt);if(amp>.2&&R.t>R.dropT){carve(amp,R.z)}}R.lastExt=R.z;R.dir=dn}
  /* pocket, tube */
  const inP=R.z>.38&&R.z<.82&&d>2.4&&d<15;if(inP){R.pocket+=dt;addStyle(3.6*dt)}
  const inT=k>.5&&R.z>.12&&R.z<zmax-.06&&d>1.4;
  if(inT){R.tube+=dt;R.tubeCur+=dt;addStyle(15*dt);if(R.tubeCur>.55&&!R.tubeSeen){R.tubeSeen=1;msg('TUBE!',1.2,'tube');spl('whoosh')}if(R.tubeCur>1.4&&R.tubeCur-dt<=1.4)chainAdd(1)}
  else if(R.tubeCur>0){if(R.tubeCur>=1){R.tubeN++;R.style+=10;msg(d>2.2&&R.tubeCur>1.8?'Made it out of the tube!':'Tube exit',1.3,'tube');chainAdd(2);spl('sb_ding')}R.tubeCur=0;R.tubeSeen=0}
  R.inTube=inT;
  /* hit by the lip: too high in a hollow wave */
  if(k>.5&&R.z>=zmax-.004&&R.zv>.2&&R.t>R.dropT+.3){return wipeout('lip')}
  /* whitewater */
  R.warn=d<4.2?1:0;if(d<.8){return wipeout('foam')}
  /* off the lip */
  if(PRS(' ')&&R.t>R.dropT){if(R.z>.58&&R.v>.8*w.vp)launch();else if(R.z>.35&&R.v>.7*w.vp)launch(.6);else msg('Go up the face first',.7,'bad')}
 }else{airTick(dt)}
 /* position on the curve */
 if(!R.air){ridePt(T,d,w.hol,R.z,curP);const Ee=curP[0],Y=curP[1];const uu=ucAt(w,g.s,TT)-Ee;g.u=uu;g.wy=baseY(uu)+Y;R.E=Ee;R.Y=Y;R.sg=curP[3]}
 const fa=R.air?R.air.h:0;
 if(!R.air&&Math.random()<dt*(18+R.v)){const sp=clamp(R.v/10,.4,1.6);fx(g.s-.9,g.u-.1,g.wy+.1,1,{sp:1.2*sp,vs:-R.v*.35,vu:-1.6,vy:2.2*sp,size:.15,life:.6,r:.25})}
 if(!R.air)foamAt(g.s-1.5,g.u,1.5,.6)}
function addStyle(p){G.R.style+=p*(1+.18*(G.combo-1))}
function chainAdd(n){G.chain=(G.chain||0)+n;G.combo=clamp(1+Math.floor(G.chain/2),1,8);G.comboT=7}
function carve(amp,z){const R=G.R;R.carves++;const top=z>.74;if(top)R.tops++;addStyle((5+17*clamp(amp,0,1))*(top||z<.22?1.35:1));chainAdd(1);
 fx(G.s,G.u,G.wy+.3,top?42:26,{sp:top?4.6:3.4,vs:-R.v*.2,vu:top?3.4:-2.2,vy:top?4.6:3.4,size:top?.24:.2,life:.9,r:.5});fx(G.s-.6,G.u,G.wy+.3,top?16:10,{sp:2,vs:-R.v*.35,vu:top?1.6:-1,vy:top?6:4.4,size:.15,life:1.1,g:7,r:.3});spl('sb_carve');if(top)msg('Top turn!',.7,'good')}
/* ---- off the lip ---- */
function launch(f){const g=G,R=g.R;f=f||1;const a={t:0,h:.12,vy:(3.5+5.4*R.z+.14*R.v)*f,cur:null,done:0,list:[],stk:0,spinA:0,flipA:0,start:g.R.z,sup:0,grabT:0,nTr:0};R.air=a;R.vAir=R.v;spl('whoosh');msg('AIR!',.7,'good');fx(g.s,g.u,g.wy+.2,14,{sp:3,vy:3,size:.2,life:.8})}
const TR={grab:{n:'GRAB',pts:16,dur:.5},spin:{n:'360 SPIN',pts:30,dur:.64},flip:{n:'BACKFLIP',pts:44,dur:.8},sup:{n:'SUPERMAN',pts:28,dur:.7}};
function airTick(dt){const g=G,R=g.R,a=R.air,w=R.w;a.t+=dt;a.h+=a.vy*dt;a.vy-=11*dt;
 R.v+=(-.05*R.v)*dt;g.s+=R.v*dt;R.len=g.s-R.s0;const d=g.s-sbAt(w,TT);g.d=d;
 const T=w.H*envAt(w,g.s)*sm(192,166,ucAt(w,g.s,TT));
 /* ride the same curve under the board while airborne */
 const z=clamp(a.start,0,.95);ridePt(Math.max(.3,T),d,w.hol,z,curP);const uu=ucAt(w,g.s,TT)-curP[0];g.u=uu;g.wy=baseY(uu)+curP[1];R.kap=curP[2];
 /* tricks */
 if(!a.cur&&a.nTr<2&&a.t>.12){let k=null;if(KL()||KR())k='spin';else if(KU())k='flip';else if(KD())k='sup';
  if(!k&&a.vy<.5&&a.nTr==0&&a.t>.35)k='grab';if(k){a.cur={k,t:0,dir:KR()&&!KL()?-1:1};a.nTr++;if(k!='grab')spl('whoosh')}}
 if(a.cur){const c=a.cur,tr=TR[c.k];c.t+=dt;c.p=clamp(c.t/tr.dur,0,1);if(c.p>=1&&!c.done){c.done=1;a.list.push({k:c.k,full:true});a.cur=null;if(c.k=='spin')a.spinA=0;msg(tr.n+'!',.7,'good');fx(g.s,g.u,g.wy+a.h,8,{sp:2.4,vy:1,size:.14,life:.7,g:2})}}
 /* landing: Space right at the touchdown sticks it */
 const tg=(a.vy+Math.sqrt(a.vy*a.vy+22*Math.max(0,a.h)))/11;a.tg=tg;
 if(PRS(' ')&&tg<.4)a.stk=TT;
 if(a.h<=0&&a.vy<0&&a.t>.15){land()}}
function land(){const g=G,R=g.R,a=R.air,w=R.w;R.air=null;g.spr=1;g.shk=Math.max(g.shk||0,clamp(-a.vy/16,0,.5));
 const stuck=a.stk&&Math.abs(TT-a.stk)<.3,partial=a.cur&&a.cur.p<.9?a.cur:null;
 if(partial&&partial.k!='grab'&&partial.p<.3){fx(g.s,g.u,g.wy,22,{sp:4,vy:4,size:.22,life:1});return wipeout('landing')}
 let n=0;const kinds={};a.list.forEach(t=>{kinds[t.k]=1});
 if(partial){if(partial.k=='grab'){a.list.push({k:'grab',full:true})}else a.list.push({k:partial.k,full:false})}
 if(!a.list.length&&a.t>.5)a.list.push({k:'grab',full:true});
 let total=0;a.list.forEach(t=>{const tr=TR[t.k];let p=tr.pts*(t.full?1:.35);p*=1+.15*clamp(a.h0||0,0,3);const newK=!R.kinds[t.k];R.kinds[t.k]=1;if(!newK)p*=.7;else if(Object.keys(R.kinds).length>1)p*=1+.18*(Object.keys(R.kinds).length-1);
  if(stuck)p*=1.5;total+=p;R.tricks.push({k:t.k,p:Math.round(p),full:t.full,stuck:!!stuck});n++});
 R.pts.trick+=total;R.style+=0;g.tricks+=0;
 if(n){chainAdd(stuck?3:2);if(stuck){R.v=Math.min(R.w.vp*1.5,R.v+R.w.vp*.12);msg('STUCK IT!',1,'good');spl('sb_ding')}else msg(a.list.map(t=>TR[t.k].n).join(' + ')+(a.list.some(t=>!t.full)?' (sketchy)':''),1.1,'good')}
 spl('sb_land');fx(g.s,g.u,g.wy+.15,18,{sp:3.4,vy:3,size:.2,life:.8});if(!a.list.every(t=>t.full))R.v*=.85}

/* ---------- judges ---------- */
const r1=x=>Math.round(x*10)/10;
function judge(R,kind){const L=G.L,len=R.len,sizeF=.85+.13*R.Tmax,c={len:len/11,style:R.style,tube:R.tube*13+R.tubeN*9,trick:R.pts.trick};
 R.pts={len:c.len,style:c.style,tube:c.tube,trick:c.trick};
 const J=[[1,1.35,.8,.85],[.9,.85,1.4,.85],[1.1,.85,.8,1.4]],nm=['Style','Power','Flair'];
 const sc=J.map((j,i)=>{const raw=(c.len*j[0]+c.style*j[1]+c.tube*j[2]+c.trick*j[3])*sizeF/1.0;let v=10*(1-Math.exp(-raw/L.k));v+=rr(-.25,.25)*(v>.5&&v<9.7?1:.2);return clamp(r1(v),0,10)});
 const tot=r1(sc.reduce((a,b)=>a+b,0)/3);return{judges:sc.map((v,i)=>({n:nm[i],v})),score:tot,pts:{len:Math.round(c.len),style:Math.round(c.style),tube:Math.round(c.tube),trick:Math.round(c.trick)}}}
const WORD=v=>v>=9.3?'PERFECT':v>=8?'EXCELLENT':v>=6.5?'GOOD':v>=5?'AVERAGE':v>=3?'FAIR':'POOR';
function finishRide(kind){const g=G,R=g.R;if(!R)return null;if(R.air){R.air=null}
 const o=st(),j=judge(R,kind),tubes=R.tubeN+(R.tubeCur>=1?1:0),trN=R.tricks.length,kinds=Object.keys(R.kinds).length;
 const res={score:j.score,judges:j.judges,pts:j.pts,len:Math.round(R.len),tube:r1(R.tube),tubes,tricks:trN,kinds,carves:R.carves,vmax:Math.round(R.vmax*3.6),H:r1(R.Tmax),kind,lv:g.lv,word:WORD(j.score),tricksL:R.tricks.map(t=>t.k)};
 if(R.len>6||R.tube>0||trN){o.rides++;if(j.score>o.best)o.best=j.score;o.tubes+=tubes;o.tricks+=trN;g.rides.push(res);g.top.push(j.score);g.tubes+=tubes;g.tricks+=trN}
 if(g.lv==o.lvl&&o.lvl<3&&j.score>=LV[g.lv].thr){o.lvl++;res.unlock=LV[o.lvl].n;repDay=-1}
 mast(res.score>=1.5?clamp(.5+Math.pow(j.score/10,2)*3.4+R.tube*.5+kinds*.35+tubes*.4,0,6):0,'Ride on '+LV[g.lv].n);
 g.last=res;g.card=res;g.cardT=kind=='wipe'?1.2:.25;g.cardL=5.2;g.R=null;sv();return res}
function endRide(kind){const g=G;if(!g.R)return;finishRide('kick');g.st='kick';g.stT=0;g.K={s:g.s,u:g.u,v:Math.max(2,g.R?g.R.v:6),y:g.wy};g.kv=g.last?g.last.vmax/3.6:8;spl('sb_land');fx(g.s,g.u,(g.wy||0)+.3,14,{sp:3,vy:3,size:.2,life:.8});
 if(kind=='out')msg('Kicked out. Nice ride',1.3,'good')}
const FUNNY=['Wipeout!','Washing machine!','Salty!','Nice splash!','Seaweed hat!','Glug glug!','Surf is up! So are you not.','Board says hi'];
function wipeout(cause,quiet){const g=G;if(g.st=='wipe')return;const R=g.R;const v=R?R.v:4,zv=R?R.zv:0,wy=g.wy||water(g.s,g.u),air=R&&R.air?R.air.h:0;
 if(R)finishRide('wipe');
 g.st='wipe';g.stT=0;g.chain=0;g.combo=1;g.tsT=1;g.ring=null;
 g.W={t:0,s:g.s,u:g.u,y:wy+.9+air,vs:v*.8,vu:clamp(zv*2.4,-3,3)+rr(-.6,1.6),vy:rr(3.6,6.2)+(cause=='lip'?-2:0),rx:0,ry:g.R?0:0,rz:0,rvx:rr(-7,7),rvy:rr(-8,8),rvz:rr(-6,6),wet:0,bs:g.s+.8,bu:g.u,by:wy+1,bvs:v*.6,bvu:rr(-1,2),bvy:rr(3,5),brx:0,bry:0,brz:0,bw:0,fl:rr(0,6)};
 const t=cause=='foam'?'Caught by the whitewater!':cause=='lip'?'Hit by the lip!':cause=='landing'?'Bad landing!':FUNNY[Math.floor(Math.random()*FUNNY.length)];
 msg(quiet?'Too late, it broke on you!':t,1.4,'bad');spl('sb_splash')}
function waveBack(){const g=G;let nx=null;for(const w of waves)if(w.tb>TT+3&&!w.close&&(!nx||w.tb<nx.tb))nx=w;
 const L=g.L,ub=nx?nx.ub:(L.h[0]+L.h[1])/2*17+12;g.s=nx?clamp(spotOf(nx).s+rr(-12,12),-60,150):rr(0,25);g.u=ub+rr(4,8);g.vs=g.vu=0;g.hs=0;g.hu=1;g.idle=0;g.sIn=9;g.coolPop=1.2;g.W=null;g.K=null}

/* ---------- the sim, once per frame ---------- */
function simTick(dt){const g=G;
 g.fade+=(g.fadeT-g.fade)*Math.min(1,dt*8);
 if(g.paused){hudTick(dt,true);return}
 const ts=g.ts,sdt=dt*ts;g.stT+=sdt;
 if(g.st!='done')g.left=Math.max(0,g.left-dt);
 if(g.msgT>0){g.msgT-=dt;if(g.msgT<=0){const e=$s('sb_msg');if(e)e.style.opacity=0}}
 if(g.comboT>0){g.comboT-=dt;if(g.comboT<=0&&g.combo>1){g.chain=Math.max(0,(g.chain||0)-2);g.combo=clamp(1+Math.floor(g.chain/2),1,8);g.comboT=5}}
 if(g.cardT>0){g.cardT-=dt;if(g.cardT<=0)cardShow()}else if(g.cardL>0){g.cardL-=dt;if(g.cardL<=0)cardHide()}
 const timeUp=g.left<=0;
 switch(g.st){
  case'paddle':paddleTick(sdt);if(timeUp&&!g.ring&&g.stT>1.5)sessionDone();break;
  case'ride':rideTick(sdt);break;
  case'kick':{const K=g.K;K.v*=Math.exp(-sdt*1.4);g.s+=K.v*sdt;g.u+=Math.max(0,K.v)*.12*sdt+1.4*sdt;g.hs=1;g.hu=.2;const w=water(g.s,g.u);g.wy=w;if(g.stT>1.1){g.st='back';g.stT=0;g.fadeT=1}break}
  case'wipe':wipeTick(sdt);break;
  case'recover':if(g.stT>1.4){g.st='back';g.stT=0;g.fadeT=1;if(g.stars)g.stars.visible=false}break;
  case'back':if(g.stT>.5&&!g.moved){g.moved=1;waveBack();msg(timeUp?'Time!':'Paddling back to the line-up',1.4);camSnap()}if(g.stT>.5)g.fadeT=0;if(g.stT>.95){g.moved=0;g.st='paddle';g.stT=0;g.R=null;if(timeUp)sessionDone()}break;
  case'done':break}
 let nw=null;if(g.st=='paddle'||g.st=='wipe'||g.st=='back'){for(const w of waves)if(!w.close&&w.tb>TT-1.5&&TT>w.tb-22&&(!nw||w.tb<nw.tb))nw=w}
 g.nw=nw;
 g.ts+=(g.tsT-g.ts)*Math.min(1,dt*9);
 camUpdate(dt);lipSpray(sdt);partsTick(dt);markerTick(dt);hudTick(dt);
 const wy=g.st=='ride'&&g.wy!=null?g.wy:0;void wy;
 GKd={}}
/* spray off the lip of the breaking section near the peel point, thrown shoreward-down, plus a little mist going up and seaward */
function lipSpray(dt){const g=G;if(!PART||g.paused)return;for(const w of waves){if(w.close)continue;const sb=sbAt(w,TT);if(Math.abs(sb-g.s)>45||Math.abs(sb-w.sP)>w.Lw)continue;const T=w.H*envAt(w,sb+2)*sm(192,166,ucAt(w,sb+2,TT));if(T<.6)continue;
  const n=dt*60*(.4+.2*T);let k=Math.floor(n)+(Math.random()<n%1?1:0);while(k-->0){const s=sb+rr(1,4),u=ucAt(w,s,TT),y=baseY(u)+.9*T;fx(s,u,y,1,{sp:.8,vs:w.vp*.4,vu:-rr(1.4,3.2),vy:rr(-.5,.8),size:.2,life:.7,g:8,r:.5});if(Math.random()<.5)fx(s,u+.3,y,1,{sp:.7,vs:w.vp*.3,vu:rr(.8,2),vy:rr(1.5,3),size:.12,life:1,g:2.5,r:.6})}}}
function wipeTick(dt){const g=G,W=g.W;W.t+=dt;const wl=water(W.s,W.u);
 if(W.t<.1&&g.R)g.R=null;
 if(!W.wet){W.vy-=10*dt;W.s+=W.vs*dt;W.u+=W.vu*dt;W.y+=W.vy*dt;W.rx+=W.rvx*dt;W.ry+=W.rvy*dt;W.rz+=W.rvz*dt;
  if(W.y<wl+.05&&W.vy<0){W.wet=1;g.shk=.75;W.vs*=.3;W.vu*=.3;W.vy*=.25;g.splashY=wl;fx(W.s,W.u,wl+.1,34,{sp:4.2,vy:5.5,size:.26,life:1.1});spl('sb_splash');foamAt(W.s,W.u,3.5,.95)}}
 else{const tgt=W.t<1.6?wl-.95:wl-.15;W.vy+=((tgt-W.y)*7-W.vy*3.2)*dt;W.y+=W.vy*dt;W.vs*=Math.exp(-dt*1.4);W.vu=W.vu*Math.exp(-dt*1.4)-.9*dt;W.s+=W.vs*dt;W.u+=W.vu*dt;const k=Math.exp(-dt*1.2);W.rvx*=k;W.rvy*=k;W.rvz*=k;W.rx+=W.rvx*dt;W.ry+=W.rvy*dt;W.rz+=W.rvz*dt;
  if(W.t<1.7&&Math.random()<dt*22)fx(W.s,W.u,W.y+.2,1,{sp:.6,vy:1.5,size:.1,life:.9,g:-1.2,c:'#bff3ff',r:.4})}
 /* the board tumbles on its own, then floats */
 const bl=water(W.bs,W.bu);if(!W.bw){W.bvy-=10*dt;W.bs+=W.bvs*dt;W.bu+=W.bvu*dt;W.by+=W.bvy*dt;W.brx+=5*dt;W.bry+=3*dt;W.brz+=2*dt;if(W.by<bl+.05&&W.bvy<0){W.bw=1;W.bvy=0;fx(W.bs,W.bu,bl+.1,14,{sp:3,vy:3,size:.2,life:.9})}}
 else{W.by+=((bl+.05-W.by)*8)*dt;W.bs+=W.bvs*dt;W.bu+=W.bvu*dt;W.bvs*=Math.exp(-dt*1.6);W.bvu*=Math.exp(-dt*1.6);W.brx*=Math.exp(-dt*2);W.brz*=Math.exp(-dt*2)}
 g.s=W.s;g.u=W.u;g.wy=W.y;
 if(W.t>2.4){g.st='recover';g.stT=0;g.rec={s:W.s,u:W.u,bs:W.bs,bu:W.bu};g.sIn=9;msg('Back on the board',1,'')}}

/* ---------- camera ---------- */
const L2W=(s,u,y)=>{const p=toWorld(s,u);return[p[0],y,p[1]]};
function camTarget(){const g=G,c=g.cam,R=g.R;let cs,cu,cy,ls,lu,ly,fov=58,k=4.5;
 switch(g.st){
  case'ride':case'kick':{const v=R?R.v:g.kv||8,cT=c.tube,T=R?R.T||2:2,wy=g.wy||0;cs=g.s-(5.2-2.6*cT)-.1*v;cu=g.u-(6.2-3.2*cT);cy=wy+(3.1+.34*T)*(1-.55*cT)+(R&&R.air?R.air.h*.5:0);ls=g.s+5.5+.3*v;lu=g.u+3.2-1.2*cT;ly=wy+1.1;fov=58+14*sm(4,16,v)+8*cT+(R&&R.air?4:0);k=5.2;break}
  case'wipe':{const W=g.W;cs=W.s-6;cu=W.u-9.5;cy=water(W.s,W.u)+4.4;ls=W.s+.5;lu=W.u+.5;ly=Math.max(water(W.s,W.u)-.2,W.y);fov=58;k=3.2;break}
  default:{const wy=water(g.s,g.u),sp=Math.hypot(g.vs||0,g.vu||0);cs=g.s-1.6-g.vs*.18;cu=g.u-9.8;cy=wy+3.9;ls=g.s+1.2+g.vs*.4;lu=g.u+12;ly=wy+.9;fov=57+sp*.8;k=3.4}}
 return{cs,cu,cy,ls,lu,ly,fov,k}}
function camUpdate(dt){const g=G,c=g.cam,R=g.R;
 const tT=g.st=='ride'&&R?(R.inTube?1:R.kap>.45?.45:0):0;c.tube+=(tT-c.tube)*Math.min(1,dt*3);
 const t=camTarget(),a=1-Math.exp(-dt*t.k);
 if(!c.init){c.init=1;Object.assign(c,{s:t.cs,u:t.cu,y:t.cy,ls:t.ls,lu:t.lu,ly:t.ly,fov:t.fov})}
 c.s+=(t.cs-c.s)*a;c.u+=(t.cu-c.u)*a;c.y+=(t.cy-c.y)*a;c.ls+=(t.ls-c.ls)*a*1.2;c.lu+=(t.lu-c.lu)*a*1.2;c.ly+=(t.ly-c.ly)*a;c.fov+=(t.fov-c.fov)*Math.min(1,dt*3.5);
 const wl=water(c.s,c.u)+.9,y=Math.max(c.y,wl),p=toWorld(c.s,c.u),l=toWorld(c.ls,c.lu);
 const sk=g.shk||0;g.shk=sk>.01?sk*Math.exp(-dt*5):0;const sx=sk*(Math.random()-.5)*.5,sy=sk*(Math.random()-.5)*.45;
 cam3.position.set(p[0]+sx,y+sy,p[1]+sx);cam3.fov=c.fov;cam3.lookAt(l[0],Math.max(c.ly,water(c.ls,c.lu)+.3),l[1]);cam3.updateProjectionMatrix();
 P.x=toWorld(g.s,g.u)[0];P.z=toWorld(g.s,g.u)[1]}
function camSnap(){if(G){G.cam.init=0;camUpdate(.016)}}
/* ---------- posing the surfer, the board and the camera right before each frame is drawn ---------- */
function dirYaw(hs,hu,s){const t=tanAt(s),n=nrmAt(s),dx=t[0]*hs+n[0]*hu,dz=t[1]*hs+n[1]*hu;return Math.atan2(dx,dz)}
function tilt(s,u,hs,hu){const f=water(s+hs*1.3,u+hu*1.3),b=water(s-hs*1.3,u-hu*1.3),l=water(s-hu*.9,u+hs*.9),r=water(s+hu*.9,u-hs*.9);return[-Math.atan2(f-b,2.6),Math.atan2(l-r,1.8)]}
/* pose blending: poses are plain objects (rider offset ox,oy,oz in the board frame, body ry,rx,rz, arm x/z, leg x/z, head x/y, board yaw/pitch/roll, stroke weight sw); the live pose chases the target with exponential smoothing */
const PK0={ox:0,oy:0,oz:0,ry:0,rx:0,rz:0,a0x:0,a0z:-.2,a1x:0,a1z:.2,l0x:0,l0z:0,l1x:0,l1z:0,hx:0,hy:0,by:0,bp:0,br:0,sw:0};
const mkP=o=>Object.assign({},PK0,o),mixP=(A,B,t)=>{const o={};for(const k in PK0)o[k]=A[k]+(B[k]-A[k])*t;return o};
const kfP=(ks,t)=>{if(t<=ks[0][0])return Object.assign({},ks[0][1]);for(let i=1;i<ks.length;i++)if(t<ks[i][0])return mixP(ks[i-1][1],ks[i][1],sm(ks[i-1][0],ks[i][0],t));return Object.assign({},ks[ks.length-1][1])};
const wrapA=a=>a-6.2832*Math.round(a/6.2832),blA=(a,b,w)=>Math.atan2((1-w)*Math.sin(a)+w*Math.sin(b),(1-w)*Math.cos(a)+w*Math.cos(b)),strokeTh=f=>f-Math.PI-.3*Math.sin(f);
/* side-on riding stance facing the beach: c = crouch 0..1.3 (wider feet, lower hips), lead = turn direction -1..1 */
function stanceP(c,lead,wob,lean){const a=.3+.34*c,rx=.1+.3*c+lean;return mkP({oy:.04-(.5*Math.cos(rx)-.5*Math.cos(a)*.993),oz:-.12,ry:1.27,rx,rz:wob*.04,a0x:-.3,a0z:-(1+.32*lead)+wob*.08,a1x:-.3,a1z:.9-.32*lead-wob*.08,l0x:-.12,l0z:-a,l1x:-.12,l1z:a,hx:-.1,hy:-1.1})}
const P_PRONE=mkP({oy:.12,oz:-.82,rx:Math.PI/2,a0x:-1.35,a0z:-.45,a1x:-1.35,a1z:.45,hx:-.85}),P_PUSH=mkP({oy:-.05,oz:-.7,rx:1.05,a0x:-1.05,a0z:-.3,a1x:-1.05,a1z:.3,hx:-.5}),P_TUCK=mkP({oy:.02,oz:-.4,rx:.75,ry:.75,a0x:-.75,a0z:-.5,a1x:-.75,a1z:.5,l0x:-1.3,l1x:-1.3,l0z:-.35,l1z:.35,hx:-.2,hy:-.5});
const P_REC0=mkP({oy:-.3,oz:-.85,rx:Math.PI/2,a0x:-1.2,a0z:-.5,a1x:-1.2,a1z:.5,l0x:.15,l1x:.15,hx:-.2}),P_REC1=mkP({oy:-.1,oz:-.6,rx:.85,a0x:-.85,a0z:-.4,a1x:-.85,a1z:.4,hx:-.5});
function sitP(){return mkP({oy:-.4,oz:-.05,rx:.06+Math.sin(TT*1.1)*.025,rz:Math.sin(TT*.9)*.03,l0z:-.45,l1z:.45,l0x:-.3,l1x:-.3,a0x:-.65,a0z:-.2,a1x:-.65,a1z:.2,hx:Math.sin(TT*.6)*.06,hy:Math.sin(TT*.37)*.7})}
function poseFrame(){const g=G;if(!g||!P.mesh)return;const R=g.R,m=P.mesh;m.visible=true;
 const now=performance.now(),dt=clamp((now-(g.pT||now))/1000,0,.05)||.016;g.pT=now;g.spr=(g.spr||0)*Math.exp(-dt*7);
 const A=P.arms,Lg=P.legs;if(g.head===undefined){g.head=m.children.find(o=>o.isGroup&&Math.abs(o.position.y-1.4)<.01)||null}
 const sp=Math.hypot(g.vs||0,g.vu||0),st0=g.st;let tgt,rate=10,bx=0,by=0,bz=0,spin=0,flip=0,wipe=0;
 if(st0=='ride'||st0=='kick'){
  const s=g.s,u=g.u,wy=g.wy||0;let off=0,sup=0,grab=0,air=0;
  if(R){const a=R.air;if(a){air=1;off=a.h;if(a.cur){const c=a.cur,p=c.p||0;if(c.k=='spin')spin=c.dir*p*Math.PI*2;else if(c.k=='flip')flip=-p*Math.PI*2;else if(c.k=='sup')sup=Math.sin(p*Math.PI);else grab=1}}}
  let psi=0;if(R&&R.T){const w=R.w,z=R.z;ridePt(R.T,g.d,w.hol,Math.max(0,z-.04),curP);const e0=curP[0],y0=curP[1];ridePt(R.T,g.d,w.hol,Math.min(1,z+.04),curP);const dE=curP[0]-e0,dY=curP[1]-y0;psi=Math.atan2(-dE,dY)}
  const wp=toWorld(s,u),up=[Math.sin(psi),Math.cos(psi)],nw=nrmAt(s),shx=-nw[0],shz=-nw[1];
  bx=wp[0]+shx*up[0]*off;bz=wp[1]+shz*up[0]*off;by=wy+up[1]*off+.07;
  const zv=R?R.zv:0,L=clamp(zv/1.4,-1,1),v=R?R.v:g.kv||8,wob=Math.sin(TT*2.3)+.6*Math.sin(TT*3.7);
  let c=.3+.3*sm(3,16,v)+(R&&R.inTube?.35:0)+(R&&!air&&KD()?.2:0)+.8*g.spr;
  if(R&&R.pump>0)c+=.35*Math.sin((1-R.pump)*6.283);
  if(air)c=.8+.1*Math.sin(TT*9);if(st0=='kick')c=.1;
  tgt=stanceP(clamp(c,0,1.3),L,wob*(1-.5*air),-L*.28);
  tgt.by=dirYaw(1,R?clamp(zv*.45,-.8,.8):.15,s);tgt.br=clamp(psi*.42+L*.2,-.55,.55);
  if(R&&R.t<.55&&!air){tgt=kfP([[0,P_PRONE],[.16,P_PUSH],[.34,P_TUCK],[.55,tgt]],R.t)}
  if(R&&R.t<.75)rate=22;else if(g.spr>.05)rate=16;
  if(grab){tgt.a0x=-1.4;tgt.a0z=-.15;tgt.a1z=1.1}
  if(sup>0){tgt=mixP(tgt,mkP({oy:.08,ry:1.1,rx:.5,a0x:-2.6,a0z:-.3,a1x:-2.6,a1z:.3,l0x:.6,l1x:.6,hx:-.1,hy:-.6}),sup);tgt.bp=sup*-.5}
  if(st0=='kick'){const claim=g.last&&g.last.score>=6.5;tgt.a0x=tgt.a1x=claim?-2.7:-.25;tgt.a0z=claim?-.35:-.6;tgt.a1z=claim?.35:.6;tgt.rx=.04}
 }else if(st0=='wipe'){const W=g.W;wipe=1;
  const bp=toWorld(W.bs,W.bu);G.board.position.set(bp[0],W.by,bp[1]);G.board.rotation.set(W.brx,W.bry,W.brz,'XYZ');G.board.updateMatrix();
  const p=toWorld(W.s,W.u);m.position.set(p[0],W.y-.7,p[1]);m.rotation.set(W.rx,W.ry,W.rz,'XYZ');m.quaternion.setFromEuler(m.rotation);
  const fl=W.t*6.5,k=Math.exp(-W.t*.8);rate=8;
  tgt=mkP({a0x:Math.sin(fl)*2.2*k,a0z:-(.5+.7*Math.cos(fl*1.3))*k-.2,a1x:Math.sin(fl+2)*2.2*k,a1z:(.5+.7*Math.cos(fl*1.3+1))*k+.2,l0x:Math.sin(fl+1)*1*k,l1x:-Math.sin(fl+1)*1*k,l0z:-.2*k,l1z:.2*k,hx:Math.sin(fl*.8)*.4*k,hy:Math.sin(fl*.6)*.5*k});
  g.stars.visible=false;
 }else{/* paddle, recover, back */
  const rec=st0=='recover',s=rec?g.rec.s:g.s,u=rec?g.rec.u:g.u,wy=water(s,u),[pt,rl]=tilt(s,u,g.hs,g.hu);
  const wp=toWorld(s,u);bx=wp[0];by=wy+.03+Math.sin(TT*1.7)*.035;bz=wp[1];
  if(sp>.8)g.mv=1;else if(g.idle>.7||st0=='back')g.mv=0;
  if(rec){tgt=kfP([[0,P_REC0],[.4,P_REC1],[1,sitP()]],clamp(g.stT/1.4,0,1))}
  else if(g.mv){const hard=st0=='paddle'&&g.sIn<.6;g.sph=(g.sph||0)+dt*(3.8+sp*1.9)*(hard?1.35:1);g.hard=hard;tgt=mixP(P_PRONE,P_PRONE,0);tgt.hx=-.85+Math.sin(g.sph*.5)*.06;tgt.sw=1;tgt.rx=Math.PI/2-(hard?.06:0)}
  else tgt=sitP();
  tgt.by=dirYaw(g.hs,g.hu,s);tgt.bp=pt;tgt.br=rl;
  if(rec){g.stars.visible=true;g.stars.children.forEach((c,i)=>{const a=TT*4+i*1.57;c.position.set(wp[0]+Math.cos(a)*.5,wy+1.35+Math.sin(TT*3+i)*.06,wp[1]+Math.sin(a)*.5);c.rotation.y=a})}
  else g.stars.visible=false}
 /* follow the target */
 let C=g.pc;const snap=!C||(st0=='recover'&&g.pst=='wipe');if(!C)C=g.pc=mkP({});g.pst=st0;
 const a=snap?1:1-Math.exp(-dt*rate);for(const k in PK0){if(k=='by')C.by+=(snap?wrapA(tgt.by-C.by):wrapA(tgt.by-C.by))*a;else C[k]+=(tgt[k]-C[k])*a}
 /* output */
 let a0x=C.a0x,a0z=C.a0z,a1x=C.a1x,a1z=C.a1z,l0x=C.l0x,l1x=C.l1x,rz=C.rz;const sw=C.sw;
 if(sw>.002){const ph=g.sph||0,t0=strokeTh(ph),t1=strokeTh(ph+Math.PI),k=g.hard?1.25:1;
  a0x=blA(a0x,t0,sw);a1x=blA(a1x,t1,sw);a0z+=(-(.12+.6*Math.max(0,Math.sin(t0)))-a0z)*sw;a1z+=((.12+.6*Math.max(0,Math.sin(t1)))-a1z)*sw;
  l0x+=sw*.2*k*Math.sin(ph*2);l1x-=sw*.2*k*Math.sin(ph*2);rz+=sw*.05*Math.sin(ph)}
 if(!wipe){setBoard(bx,by+(st0=='ride'||st0=='kick'?.22*Math.abs(Math.sin(C.br)):0),bz,C.by+spin,C.bp+flip,C.br);setRider(C.ox,C.oy,C.oz,C.ry,C.rx,rz)}
 A[0].rotation.set(a0x,0,a0z);A[1].rotation.set(a1x,0,a1z);Lg[0].rotation.set(l0x,0,C.l0z);Lg[1].rotation.set(l1x,0,C.l1z);if(g.head)g.head.rotation.set(C.hx,C.hy,0);
 m.scale.x=m.scale.z=1;
 /* the board is drawn in the same frame, the character shadow disc is hidden */
 G.board.visible=true}

/* ---------- HUD ---------- */
const $s=id=>document.getElementById(id);
const CSS=`#surfhud{position:fixed;inset:0;z-index:7;pointer-events:none;display:none;font-family:Silkscreen,'Courier New',monospace;color:#fff;--c:#7ff3ff;--cd:#1b8fa0;--bg:rgba(6,20,28,.8);--ln:rgba(255,255,255,.22)}
#surfhud *{box-sizing:border-box}
#surfhud .sbp{position:absolute;background:var(--bg);border:2px solid var(--ln);box-shadow:0 4px 0 rgba(0,0,0,.35);padding:8px 12px}
#surfhud small{display:block;font-size:10px;letter-spacing:.08em;opacity:.7}
#surfhud b{font-weight:normal}
#sb_time{left:14px;top:14px;min-width:150px}#sb_time b{font-size:34px;line-height:1.1;letter-spacing:.04em}
#sb_time i{display:block;height:6px;background:rgba(255,255,255,.15);margin-top:6px}#sb_time u{display:block;height:100%;background:var(--c);text-decoration:none}
#sb_rep{left:14px;top:108px;max-width:260px;font-size:11px;line-height:1.5}#sb_rep b{display:block;font-size:14px;color:var(--c)}
#sb_sc{right:14px;top:14px;text-align:right;min-width:170px;font-size:11px;line-height:1.7}#sb_sc b{font-size:20px;color:#ffe45a}
#sb_live{left:50%;top:14px;transform:translateX(-50%);display:none;text-align:center;min-width:300px}
#sb_live .row{display:flex;gap:18px;justify-content:center;font-size:12px}#sb_live .row span b{display:block;font-size:20px;color:#fff}
#sb_combo{display:inline-block;margin-top:5px;padding:1px 9px;background:#ffb02e;color:#241400;font-size:12px}
#sb_msg{position:absolute;left:50%;top:27%;transform:translateX(-50%);font-size:34px;letter-spacing:.06em;text-shadow:0 3px 0 rgba(0,0,0,.5);opacity:0;white-space:nowrap}
#sb_msg.good{color:#8dffb0}#sb_msg.bad{color:#ff9a8a}#sb_msg.tube{color:#7ff3ff;font-size:42px}
#sb_msg.pop{animation:sbpop .35s ease-out}@keyframes sbpop{0%{transform:translateX(-50%) scale(1.5)}100%{transform:translateX(-50%) scale(1)}}
#sb_ring{position:absolute;left:50%;top:56%;width:0;height:0;display:none}
#sb_ring .tg{position:absolute;left:-60px;top:-60px;width:120px;height:120px;border:4px solid rgba(141,255,176,.85);border-radius:50%}
#sb_ring .in{position:absolute;left:-60px;top:-60px;width:120px;height:120px;border:6px solid #fff;border-radius:50%}
#sb_ring .tx{position:absolute;left:-120px;top:78px;width:240px;text-align:center;font-size:18px;text-shadow:0 2px 0 rgba(0,0,0,.6)}
#sb_spot{position:absolute;left:0;top:0;display:none;pointer-events:none;will-change:transform}
#sb_spot .pl{background:#ffc83a;color:#241805;padding:5px 13px 6px;text-align:center;border:2px solid #fff6d8;box-shadow:0 3px 0 rgba(0,0,0,.35),0 0 22px rgba(255,200,58,.6);white-space:nowrap;transition:background .2s,box-shadow .2s}
#sb_spot .pl b{display:block;font-size:15px;letter-spacing:.08em}#sb_spot .pl small{display:block;font-size:10px;opacity:.8;letter-spacing:.06em;margin-top:1px}
#sb_spot>i{display:block;width:0;height:0;margin:0 auto;border:9px solid transparent;border-top-color:#fff6d8;border-bottom:0}
#sb_spot.in .pl{background:#4dffa0;box-shadow:0 3px 0 rgba(0,0,0,.35),0 0 22px rgba(77,255,160,.65)}
#sb_spot.go .pl{background:#8af6ff;box-shadow:0 3px 0 rgba(0,0,0,.35),0 0 22px rgba(138,246,255,.7)}
#sb_spot.now .pl{background:#fff;box-shadow:0 3px 0 rgba(0,0,0,.35),0 0 30px #fff;animation:sbnow .18s infinite alternate}
@keyframes sbnow{0%{transform:scale(1)}100%{transform:scale(1.12)}}
#sb_spot.off>i{display:none}
#sb_spot_a{position:absolute;left:50%;top:50%;margin:-10px 0 0 -8px;width:0;height:0;border-top:10px solid transparent;border-bottom:10px solid transparent;border-left:16px solid #fff6d8;transform-origin:8px 10px;display:none;filter:drop-shadow(0 2px 0 rgba(0,0,0,.4))}
#sb_meter{position:absolute;left:50%;bottom:128px;transform:translateX(-50%);width:min(440px,86vw);display:none}
#sb_meter .hd{display:flex;justify-content:space-between;align-items:flex-end;font-size:10px;letter-spacing:.1em;margin-bottom:4px;text-shadow:0 2px 0 rgba(0,0,0,.6)}#sb_meter .hd span{opacity:.7}
#sb_meter .hd b{font-size:15px;letter-spacing:.08em;color:#fff}#sb_meter.pf .hd b{color:#4dffa0}#sb_meter.wait .hd b{color:#8af6ff}
#sb_meter .tr{position:relative;height:18px;background:rgba(6,20,28,.82);border:2px solid rgba(255,255,255,.35);box-shadow:0 3px 0 rgba(0,0,0,.35)}
#sb_meter .tr i{position:absolute;top:0;bottom:0}#sb_meter .ok{background:rgba(255,200,58,.22)}#sb_meter .ni{background:rgba(255,214,80,.55)}#sb_meter .pf{background:#4dffa0;box-shadow:0 0 14px rgba(77,255,160,.8)}
#sb_mn{position:absolute;top:-7px;bottom:-7px;width:5px;margin-left:-2px;background:#fff;box-shadow:0 0 10px #fff;text-decoration:none;left:0}
#sb_hint{position:absolute;left:50%;bottom:92px;transform:translateX(-50%);font-size:14px;background:var(--bg);padding:6px 14px;border:2px solid var(--ln);display:none;white-space:nowrap}
#sb_keys{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);font-size:11px;white-space:nowrap;background:var(--bg);padding:6px 12px;border:2px solid var(--ln)}
#sb_keys kbd{display:inline-block;min-width:22px;padding:2px 6px;margin:0 3px;background:#e8f4f6;color:#10242a;border-bottom:3px solid #8aa8ad;font:inherit;font-size:10px;text-align:center}
#sb_wave{position:absolute;left:50%;bottom:58px;transform:translateX(-50%);font-size:11px;opacity:.9;white-space:nowrap;text-shadow:0 2px 0 rgba(0,0,0,.6)}
#sb_card{right:14px;top:150px;width:260px;display:none;pointer-events:none}
#sb_card h3{font-weight:normal;font-size:44px;line-height:1;color:#ffe45a;margin:2px 0 2px}#sb_card h4{font-weight:normal;font-size:12px;letter-spacing:.12em;margin:0 0 8px}
#sb_card .j{display:flex;justify-content:space-between;font-size:12px;padding:2px 0;border-top:1px solid var(--ln)}#sb_card .j b{color:#fff}
#sb_card .bk{font-size:10px;opacity:.85;line-height:1.6;margin-top:6px}#sb_card .un{margin-top:8px;color:#8dffb0;font-size:12px}
#sb_modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(500px,92vw);display:none;pointer-events:auto;text-align:left}
#sb_modal h2{font-weight:normal;font-size:26px;margin:0 0 8px;color:var(--c)}#sb_modal p{font-size:12px;line-height:1.7;margin:4px 0}
#sb_modal .big{font-size:48px;color:#ffe45a;line-height:1}#sb_modal .gr{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;font-size:12px;margin:10px 0}#sb_modal .gr b{color:#fff;float:right}
#sb_modal .row{display:flex;gap:10px;margin-top:12px}#sb_modal button{flex:1;font:inherit;font-size:13px;padding:9px 6px;background:#16424c;color:#fff;border:2px solid var(--c);cursor:pointer}#sb_modal button.go{background:var(--c);color:#06202a}
#sb_fade{position:absolute;inset:0;background:#06202a;opacity:0}`;
function hudOn(){if(!sbCSS){sbCSS=document.createElement('style');sbCSS.id='surfcss';sbCSS.textContent=CSS;document.head.appendChild(sbCSS)}
 hud=document.createElement('div');hud.id='surfhud';
 hud.innerHTML=`<div id=sb_time class=sbp><small>SESSION</small><b id=sb_t>2:00</b><i><u id=sb_tb></u></i></div>
<div id=sb_rep class=sbp><small>SURF REPORT</small><b id=sb_lv></b><span id=sb_rp></span></div>
<div id=sb_sc class=sbp><small>BEST RIDE</small><b id=sb_best>0.0</b><br><span id=sb_s2></span></div>
<div id=sb_live class=sbp><div class=row><span><small>STYLE</small><b id=sl_st>0</b></span><span><small>TUBE</small><b id=sl_tb>0.0s</b></span><span><small>TRICKS</small><b id=sl_tr>0</b></span><span><small>LENGTH</small><b id=sl_ln>0m</b></span><span><small>SPEED</small><b id=sl_sp>0</b></span></div><div id=sb_combo>COMBO x1</div></div>
<div id=sb_msg></div><div id=sb_ring><div class=tg></div><div class=in id=sb_ri></div><div class=tx id=sb_rt></div></div>
<div id=sb_spot><div class=pl><b id=sb_spot_t></b><small id=sb_spot_s></small></div><i></i><span id=sb_spot_a></span></div>
<div id=sb_meter><div class=hd><span>EARLY</span><b id=sb_mt></b><span>LATE</span></div><div class=tr><i class=ok style="left:41.7%;right:4.2%"></i><i class=ni style="left:60.4%;right:10.4%"></i><i class=pf style="left:68.75%;right:18.75%"></i><u id=sb_mn></u></div></div>
<div id=sb_hint></div><div id=sb_wave></div><div id=sb_keys></div>
<div id=sb_card class=sbp></div><div id=sb_modal class=sbp></div><div id=sb_fade></div>`;
 document.body.appendChild(hud);hud.style.display='block';HC={};
 const o=st(),rp=G.rp,r=sizeRange(G.lv,rp);$s('sb_lv').textContent=G.L.n;$s('sb_rp').innerHTML=`Waves ${r[0].toFixed(1)} to ${r[1].toFixed(1)} m<br>Wind ${rp.wind} km/h ${rp.kind}<br>${rp.txt}`}
function hudOff(){if(hud){hud.remove();hud=null}HC={}}
let HC={};
const setT=(id,t)=>{if(HC[id]!==t){HC[id]=t;const e=$s(id);if(e)e.textContent=t}};
const setH=(id,t)=>{if(HC[id]!==t){HC[id]=t;const e=$s(id);if(e)e.innerHTML=t}};
const mmss=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function hudTick(dt,paused){const g=G;if(!hud)return;const o=st();
 setT('sb_t',mmss(Math.ceil(g.left)));const tb=$s('sb_tb');if(tb)tb.style.width=(100*g.left/SESSION).toFixed(1)+'%';
 setT('sb_best',(Math.max(o.best,...g.top,0)).toFixed(1));
 const t2=g.top.slice().sort((a,b)=>b-a).slice(0,2);setH('sb_s2','TOP 2 TOTAL <b style="font-size:13px;color:#fff">'+t2.reduce((a,b)=>a+b,0).toFixed(1)+'</b><br>RIDES '+g.rides.length+' / TUBES '+g.tubes);
 const R=g.R,live=$s('sb_live');if(live)live.style.display=(g.st=='ride'||g.st=='kick')&&R?'block':'none';
 if(R&&(g.st=='ride')){setT('sl_st',Math.round(R.style+R.pts.trick+R.tube*13));setT('sl_tb',R.tube.toFixed(1)+'s');setT('sl_tr',String(R.tricks.length));setT('sl_ln',Math.round(R.len)+'m');setT('sl_sp',Math.round(R.v*3.6)+'');setT('sb_combo',g.combo>1?'COMBO x'+g.combo:'COMBO x1')}
 /* the pop-up meter: the swell behind you runs from EARLY to LATE, pop up in the green */
 const mt=$s('sb_meter');if(mt){const c=g.st=='paddle'?g.meter:null;if(c&&c.xi<12){mt.style.display='block';const f=clamp((9-c.xi)/9.6,0,1);$s('sb_mn').style.left=(f*100).toFixed(1)+'%';
   const paddling=g.sIn<.6,pf=Math.abs(c.xi-1.8)<.6&&g.ring;setT('sb_mt',pf?'NOW!  SPACE':g.ring?(paddling?'POP UP  [SPACE]':'HOLD S TO PADDLE IN'):(paddling?'SWELL COMING':'HOLD S TO PADDLE IN'));mt.className=pf?'pf':paddling?'':'wait'}else mt.style.display='none'}
 const ring=$s('sb_ring');if(ring)ring.style.display='none';
 const hint=$s('sb_hint');if(hint){const h=g.st=='paddle'&&!g.meter?g.hint:'';if(h){hint.style.display='block';setT('sb_hint',h)}else hint.style.display='none'}
 /* wave info */
 let wi='';if(g.nw&&(g.st=='paddle'||g.st=='back')){const w=g.nw,secs=Math.max(0,w.tb-TT);wi='SET '+(w.set+1)+' · WAVE '+w.k+' OF '+w.n+' · '+(w.H).toFixed(1)+' m · '+(w.hol>.6?'hollow':w.hol>.35?'steep':'mellow')+' · breaks in '+Math.ceil(secs)+' s'}
 else if(g.st=='paddle'&&!g.nw)wi='Lull. Next set coming';
 setT('sb_wave',wi);
 /* keys */
 let kh='';if(g.st=='paddle'||g.st=='back'||g.st=='recover')kh='<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> paddle (S = paddle in for a wave) <kbd>SPACE</kbd> pop up <kbd>ESC</kbd> pause';
 else if(g.st=='ride'){kh=g.R&&g.R.air?'<kbd>A</kbd><kbd>D</kbd> spin <kbd>W</kbd> flip <kbd>S</kbd> superman <kbd>SPACE</kbd> land it':'<kbd>A</kbd><kbd>D</kbd> carve <kbd>W</kbd> pump <kbd>S</kbd> stall in the barrel <kbd>SPACE</kbd> launch off the lip'}
 setH('sb_keys',kh);
 const f=$s('sb_fade');if(f)f.style.opacity=g.fade.toFixed(2);
 /* landing ring in the air */
 if(R&&R.air&&R.air.tg<.4&&!R.air.stk&&ring){ring.style.display='block';$s('sb_ri').style.transform='scale('+(1+R.air.tg*3).toFixed(2)+')';$s('sb_ri').style.borderColor=R.air.tg<.2?'#8dffb0':'#fff';setT('sb_rt','LAND  [SPACE]')}}
function cardShow(){const g=G,c=g.card;if(!c||!hud)return;const e=$s('sb_card');
 e.innerHTML=`<small>RIDE ${g.rides.length}</small><h3>${c.score.toFixed(1)}</h3><h4>${c.word}${c.kind=='wipe'?' · wipeout':''}</h4>`+c.judges.map(j=>`<div class=j><span>${j.n}</span><b>${j.v.toFixed(1)}</b></div>`).join('')+`<div class=bk>Length ${c.len} m · Style ${c.pts.style}<br>Tube ${c.tube} s · Tricks ${c.tricks}${c.tricksL.length?' ('+[...new Set(c.tricksL)].map(k=>TR[k].n).join(', ')+')':''}<br>Wave ${c.H} m · Top speed ${c.vmax} km/h</div>`+(c.unlock?`<div class=un>New break unlocked: ${E(c.unlock)}!</div>`:'');
 e.style.display='block';spl(c.score>=6.5?'sb_ding':'ping')}
function cardHide(){const e=$s('sb_card');if(e)e.style.display='none';if(G)G.card=null}
/* ---------- pause card and the end of a session ---------- */
function modal(h){const m=$s('sb_modal');if(!m)return;if(h){m.innerHTML=h;m.style.display='block'}else m.style.display='none'}
function pauseCard(){const g=G;if(!g||g.st=='done')return;g.paused=!g.paused;
 if(g.paused){modal(`<h2>Paused</h2><p>${E(g.L.n)} · ${mmss(Math.ceil(g.left))} left · ${g.rides.length} rides</p><p style="opacity:.8">A / D carve up and down the face. W pump. S stall in the tube. SPACE pops up, launches off the lip and sticks the landing. In the air: A/D spin, W backflip, S superman.</p><div class=row><button onclick="sbQuit()">END SESSION</button><button class=go onclick="sbResume()">RESUME</button></div>`)}
 else modal(null)}
function resumeCard(){if(G&&G.paused)pauseCard()}
window.sbResume=resumeCard;
window.sbQuit=function(){if(!G)return;G.paused=0;modal(null);G.R&&finishRide('quit');sessionDone(true)};
function sessionDone(quit){const g=G;if(!g||g.st=='done')return;g.st='done';g.stT=0;g.ring=null;g.tsT=1;g.paused=0;
 const o=st();if(g.R)finishRide('time');endSession(quit);
 const top=g.top.slice().sort((a,b)=>b-a),t2=top.slice(0,2).reduce((a,b)=>a+b,0);
 let prize=0;if(t2>=8&&!quit){prize=Math.round(t2*1.5);S.money=+((S.money||0)+prize).toFixed(2);S.earn=(S.earn||0)+prize;spl('cash')}
 const nxt=o.lvl<3?'Score '+LV[o.lvl].thr+' or more at '+LV[o.lvl].n+' to unlock '+LV[o.lvl+1].n:'Score 9.0 on a Big wave to become a Wave Master';
 const best=top[0]||0;
 modal(`<small>${quit?'SESSION ENDED':'TIME'} · ${E(g.L.n).toUpperCase()}</small><h2>${t2>=14?'Contest winning surf':t2>=9?'Solid session':g.rides.length?'Nice session':'Back in the lineup soon'}</h2><div class=big>${t2.toFixed(1)}</div><p>Top 2 rides, out of 20</p>
 <div class=gr><span>Rides<b>${g.rides.length}</b></span><span>Best ride<b>${best.toFixed(1)}</b></span><span>Tube rides<b>${g.tubes}</b></span><span>Tricks landed<b>${g.tricks}</b></span><span>Your best ever<b>${o.best.toFixed(1)}</b></span><span>Mastery gained<b>+${g.mastery.toFixed(1)}</b></span></div>
 ${prize?`<p style="color:#8dffb0">Contest prize: +$${prize}</p>`:''}<p style="opacity:.85">Next goal: ${E(nxt)}</p>
 <div class=row><button onclick="sbBeach()">BACK TO THE BEACH</button><button class=go onclick="sbAgain()">SURF AGAIN</button></div>`);
 if(!quit)spl('chime')}
function sumAgain(){if(G&&G.st=='done')window.sbAgain()}
window.sbBeach=function(){if(!G)return;fadeOut(()=>exitSession())};
window.sbAgain=function(){if(!G)return;const g=G,o=st(),own=!!o.own,fee=own?0:10;if(!own&&(S.money||0)<fee){spl('err');return msg('A board rental is $10',1.5,'bad')}const lv=g.lv;fadeOut(()=>{exitSession();startSession(lv,own,fee)})};
function fadeOut(cb){const g=G;if(!g)return cb();g.fadeT=1;setTimeout(()=>{try{cb()}catch(e){soft(e,'fade')}},420)}
function fadeIn(sec){const g=G;if(!g)return;g.fade=1;g.fadeT=0}

/* ---------- the shack menu, the boardwalk gate, the signpost ---------- */
let lastLv=-1;
function openMenu(){if(mode!='play'||away()||G)return;const o=st(),rp=report();mode='menu';if(lastLv<0||lastLv>o.lvl)lastLv=o.lvl;
 const own=!!o.own;
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(600px,94vw)"><div class=pehd><span class=pek>Surf Break</span><h2>Kai's board hire</h2></div><div class=pebd>
 <p class=pebl>Paddle out, pick a wave from the set, pop up with a timed SPACE, carve with A and D, pump with W, stall in the barrel with S and launch off the lip. Three judges score every ride out of 10. Sessions last two minutes. ${own?'You own your board: surfing is free.':'A board is $10 a session. After 3 rentals Kai gives you your own board.'}</p>
 <p class=pebl style="opacity:.8">Today: wind ${rp.wind} km/h ${rp.kind}, ${E(rp.txt)}. Your best ride ${o.best?o.best.toFixed(1):'none yet'} · rides ${o.rides} · tubes ${o.tubes} · tricks ${o.tricks} · sessions ${o.sessions}${own?'':' · rentals '+o.rent+' of 3'}</p>
 <div class=pelist>${LV.map((l,i)=>{const r=sizeRange(i,rp),open=i<=o.lvl;return `<button class=pesong ${open?'':'disabled style="opacity:.45;cursor:default"'} onclick="${open?'sbGo('+i+')':''}"><b>${E(l.n)}${open?'':' (locked)'}</b><small>${E(l.sub)} · ${r[0].toFixed(1)} to ${r[1].toFixed(1)} m today${open?'':' · score '+LV[i-1].thr+'+ at '+E(LV[i-1].n)+' to unlock'}</small></button>`}).join('')}</div>
 <div class=row2>${own?'':'<button onclick="sbRent()">Rent a board only ($10)</button>'}<button onclick="closeUI()">Not now</button></div></div></div>`}
window.sbGo=function(i){if(mode!='menu')return;const o=st();lastLv=i;startSession(i,!!o.own,o.own?0:10)};
window.sbRent=function(){if(mode!='menu')return;const o=st();if((S.money||0)<10){spl('err');return say2('A board rental is $10.')}S.money=+((S.money||0)-10).toFixed(2);o.rent++;o.tok=dayNo();if(!o.own&&o.rent>=3){o.own=1;o.tok=-1;say2('Kai hands you your own board. Surf free from now on!')}else say2('Board rented. Walk into the water to paddle out.');spl('cash');sv();closeUI()};
function readReport(){const rp=report(),o=st();say2('Surf report: wind '+rp.wind+' km/h '+rp.kind+', '+rp.txt+'.');setTimeout(()=>say2('Beginner swell '+sizeRange(0,rp).map(v=>v.toFixed(1)).join(' to ')+' m'+(o.lvl>=1?', Reef '+sizeRange(1,rp).map(v=>v.toFixed(1)).join(' to ')+' m':'')+(o.lvl>=2?', Point break '+sizeRange(2,rp).map(v=>v.toFixed(1)).join(' to ')+' m':'')+(o.lvl>=3?', Big wave '+sizeRange(3,rp).map(v=>v.toFixed(1)).join(' to ')+' m':'')),900)}
function gateTick(dt){if(mode!='play'||G||IN||TT<gateCool||away())return;const o=st();const c=Math.cos(PTH),s=Math.sin(PTH),dx=P.x-PO[0],dz=P.z-PO[1],lx=dx*c-dz*s,lz=dx*s+dz*c;
 if(Math.abs(lx-1.5)<2.4&&lz<3.7&&lz>-4){if(o.own||o.tok===dayNo()){gateCool=TT+999;mode='menu';const lv=lastLv<0?o.lvl:Math.min(lastLv,o.lvl);try{$('ui').innerHTML=''}catch(e){}mode='play';startSession(lv,true,0)}
  else{gateCool=TT+4;toast0('Rent a board at the Surf Break shack first ($10)')}}}
const toast0=t=>say2(t);
/* ---------- build the beach, the people and the prompts once the island exists ---------- */
function mergeBoxes(){const m=flushBoxes();return m}
let propsBuilt=false,intDone=false;
function buildProps(){if(propsBuilt)return;propsBuilt=true;bxs.length=0;
 try{buildShack();buildRack();buildTower();buildGate();buildMisc();buildPalms();buildSigns()}catch(e){console.error('surf props',e)}
 const m=flushBoxes();PROP.add(m);PROP.userData.mesh=m}
{const w1=worldTick;worldTick=function(dt){const r=w1.apply(this,arguments);try{
 if(mode=='title'||away())return r;
 if(!propsBuilt&&typeof buildChar=='function')buildProps();
 const dd=distToSpot();PROP.visible=dd<520||!!G;
 if(!intDone&&propsBuilt){intDone=true;const c=Math.cos(PTH),s=Math.sin(PTH),sx=lw(0,5.6),sg=lw(5,5.6);
  INT.push({x:sx[0],z:sx[1],r:5.6,l:'Surf Break shack: rent a board / paddle out',a:()=>openMenu(),sb:1});
  INT.push({x:sg[0],z:sg[1],r:3.4,l:'Read the surf report',a:()=>readReport(),sb:2});
  try{POIS.push([lw(0,9)[0],lw(0,9)[1],'Surf Break','#2fd0e8'])}catch(e){}}
 if(propsBuilt&&PROP.visible&&mode=='play'){if(!ppBuilt&&dd<200)buildPeople();peopleTick(dt);if(repDay!==dayNo()||repDay===-1)drawReport();
  gateTick(dt);
  /* stand on the sand: the walker is lowered to the beach level on the way in */
  if(!IN&&P.mesh&&dd<80){const c=Math.cos(PTH),s=Math.sin(PTH),dx=P.x-PO[0],dz=P.z-PO[1],lx=dx*c-dz*s,lz=dx*s+dz*c;
   if(Math.abs(lx)<40&&lz>-3&&lz<16){let h=sandY(lz)+.22;if(Math.abs(lx)<5.2&&lz>6.6&&lz<13.2)h=.05;HY+=(h-HY)*Math.min(1,(dt||.016)*10);SY=HY;P.mesh.position.y=HY}else if(Math.abs(HY)>.01){HY*=1-Math.min(1,(dt||.016)*10);SY=HY}}}
 }catch(e){soft(e,'glue')}return r}}
function sbTick(dt){if(G&&G.on)simTick(dt)}
/* ---------- the maps: the shack, rack, tower and palms from above, plus white wave lines out at sea ---------- */
{const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){const r=m0.apply(this,arguments);try{x.save();x.lineJoin='round';
  /* the surf zone: pale wave lines over the water, the same place the waves break */
  x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=Math.max(.8,kx*1.1);const fine=kx>.25;
  [30,46,64].forEach((u,i)=>{x.beginPath();for(let s=-60;s<=170;s+=12){const p=toWorld(s,u+i*0+Math.sin(s*.05+i)*2.4);s==-60?x.moveTo(sx(p[0]),sz(p[1])):x.lineTo(sx(p[0]),sz(p[1]))}x.stroke()});
  /* local drawing in the props frame */
  const c=Math.cos(PTH),s=Math.sin(PTH);x.translate(sx(PO[0]),sz(PO[1]));x.transform(kx*c,-kz*s,kx*s,kz*c,0,0);
  const R=(cx,cz,w,d,col)=>{x.fillStyle=col;x.fillRect(cx-w/2,cz-d/2,w,d)},Q=(cx,cz,w,d,col)=>{R(cx+.5,cz+.5,w,d,'rgba(0,0,0,.22)');R(cx,cz,w,d,col)};
  R(1.5,5.4,2.6,6.4,COL.wood);/* boardwalk */
  Q(0,9.8,10,7,COL.woodL);Q(0,9.8,10.1,4.4,COL.teal);R(0,9.4,10.2,.5,COL.coral);if(fine){for(let i=-4;i<=4;i+=2)R(i*1.1,9.8,1,4.4,COL.cream)}/* deck and roof */
  Q(-10.5,7.6,5.4,.9,COL.woodL);if(fine)for(let i=0;i<8;i++)R(-12.7+i*.63,7.6,.45,.7,BCOL[(i*3)%8]);/* rack */
  Q(15,7.5,3.1,3.1,COL.red);R(15,7.5,2.6,2.6,COL.cream);if(fine)R(15,7.5,.4,.4,COL.red);/* lifeguard tower */
  Q(5,4.1,2.9,.3,COL.woodD);[[11,4.6,COL.coral],[-4.2,3.7,COL.yel]].forEach(([a,b,cc])=>{x.fillStyle=cc;x.beginPath();x.arc(a,b,1.3,0,6.283);x.fill()});
  [[-17,12.5],[-13,15.5],[-1.5,15.8],[9,14.5],[19.5,12],[24,9.5],[-20,8.5],[4.5,17]].forEach(([a,b])=>{x.fillStyle='#2f8a3a';x.beginPath();x.arc(a,b,2.4,0,6.283);x.fill();x.fillStyle='#5cc05a';x.beginPath();x.arc(a,b,1,0,6.283);x.fill()});/* palms */
  x.restore()}catch(e){try{x.restore()}catch(e2){}}return r}}

window.FW_SURF={waves,hAt,toWorld,toLocal,tanAt,nrmAt,VIEW,cam3,SCH,LV,report,planSession,resetWaves,spawnSet,get T(){return TT},set T(v){TT=v},surf,foamAt,CX,CZ,I0,NC,
 get G(){return G},start:(lv,own)=>startSession(lv==null?0:lv,own!=null?!!own:true,0),exit:()=>{if(G)exitSession()},key:(k,d)=>{if(d){GK[k]=1;GKd[k]=1}else delete GK[k]},tick:simTick,st,openMenu,mast,judge,GK,sessionDone,water,PROP,PO,PTH,lw,ridePt,kapOf,sizeRange,mmss,PS,ringCandidate,ucAt,sbAt,waveDead};
})();
