/* ---------- v26.64: first-person car view, pixelated and built in 3D ----------
   While driving, the car's interior is real 3D geometry in the car's own frame: dashboard, pillars, door trims,
   a three-spoke steering wheel with a bright 12 o'clock marker, instrument cluster with needles, centre console, mirrors,
   and two arms that reach the wheel. The wheel is tilted towards the driver and rolls about its own axis with A / D,
   so the marker and spokes visibly turn; it springs back to centre when you let go. The hands are anchored on the rim.
   The whole view is drawn to a small render target and scaled up with nearest-neighbour filtering, so it reads as pixel art.
   The car's own body is hidden from inside. Nothing here is saved. */
const POV={ang:0,t:0,G:null,wheel:null,needle:null,arms:null,anchors:null};
const POVC=new THREE.PerspectiveCamera(72,1,.05,600);
const POV_LIM=1.0,POV_R=.19,POV_W=[0,1.0,-.55],POV_TILT=-.5,POV_PX=3;
const POV_SKIN='#c08a68',POV_SLEEVE='#2b3138';
/* the pixel pass: the view is rendered at 1/POV_PX of the screen, then drawn back up with nearest-neighbour filtering */
const POV_FS=new THREE.Scene(),POV_FSC=new THREE.OrthographicCamera(-1,1,1,-1,.1,10),POV_FSQ=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial());
POV_FSQ.position.z=-1;POV_FS.add(POV_FSQ);
let POV_RT=null;
/* small canvases drawn at low resolution and shown with nearest-neighbour filtering */
function povPix(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t}
function povMat(tex){return new THREE.MeshLambertMaterial({map:tex})}
/* a box child of p, centred on x,y,z */
function povBox(p,w,h,d,col,x,y,z){const m=new THREE.Mesh(geo(w,h,d),M(col));m.position.set(x,y,z);p.add(m);return m}
/* a thin bar: unit-length box, stretched and turned by povBarSet every time its ends move */
function povBar(p,t,col){const m=new THREE.Mesh(new THREE.BoxGeometry(t,t,1),M(col));p.add(m);return m}
const POV_UP=new THREE.Vector3(0,0,1),POV_D=new THREE.Vector3();
function povBarSet(m,a,b){POV_D.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=POV_D.length()||1e-4;m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);m.quaternion.setFromUnitVectors(POV_UP,POV_D.normalize());m.scale.set(1,1,L)}

function povBuild3D(){
 const G=new THREE.Group();scene.add(G);POV.G=G;
 /* textures */
 const dashTex=povPix(64,32,(x)=>{x.fillStyle='#1f252b';x.fillRect(0,0,64,32);
  for(let i=0;i<7;i++){x.fillStyle=i%3?'#3a434c':'#56616c';x.fillRect(5+i*8,6,5,5)}
  x.fillStyle='#0b0e11';x.fillRect(10,15,44,9);x.fillStyle='#2fe68a';for(let i=0;i<9;i++)x.fillRect(12+i*4,17+(i*5)%6,2,4);
  x.fillStyle='#2fe68a';x.fillRect(3,27,2,2);x.fillStyle='#ff5a5a';x.fillRect(59,27,2,2)});
 const screenTex=povPix(32,24,(x)=>{x.fillStyle='#050a08';x.fillRect(0,0,32,24);
  [[4,12],[10,7],[16,15],[22,9],[28,11]].forEach(([px,hh])=>{x.fillStyle='#2fe68a';x.fillRect(px,24-hh,3,hh)});
  x.fillStyle='#8aa094';x.fillRect(3,3,12,2)});
 const dialTex=povPix(32,32,(x)=>{x.fillStyle='#07090b';x.beginPath();x.arc(16,16,16,0,Math.PI*2);x.fill();
  x.fillStyle='#8aa094';for(let i=0;i<=8;i++){const a=(135+i*33.75)*Math.PI/180;x.fillRect(16+Math.cos(a)*12-1,16+Math.sin(a)*12-1,2,2)}});
 /* dashboard and centre console */
 povBox(G,1.8,.32,.66,'#262c33',0,.86,-.95);
 const dashFace=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.32),povMat(dashTex));dashFace.position.set(0,.86,-.615);G.add(dashFace);
 povBox(G,.5,.5,.6,'#1a1e23',.55,.8,-1.0);
 const scr=new THREE.Mesh(new THREE.PlaneGeometry(.32,.22),povMat(screenTex));scr.position.set(.55,.92,-.694);G.add(scr);
 for(let i=0;i<4;i++)povBox(G,.05,.03,.02,'#3a434c',.36+i*.12,.7,-.69);
 povBox(G,.4,.02,.02,'#0a0c0e',.55,.62,-.69);
 /* instrument cluster: hood, two dials with needles */
 povBox(G,.74,.22,.14,'#0c0f12',0,1.12,-.7);
 [-.17,.17].forEach((x,i)=>{const d=new THREE.Mesh(new THREE.PlaneGeometry(.16,.16),povMat(dialTex));d.position.set(x,1.12,-.625);G.add(d);
  const pv=new THREE.Group();pv.position.set(x,1.12,-.62);G.add(pv);
  povBox(pv,.014,.07,.004,i?'#f5c542':'#ff5a5a',0,.035,0);
  if(!i)POV.needle=pv});
 /* pillars, roof, door trims, rear-view and wing mirrors */
 povBox(G,1.9,.06,1.9,'#1d2126',0,1.88,-.9);
 [-1,1].forEach(s=>{const b=povBar(G,.1,'#20252b');povBarSet(b,[s*.9,1.04,-.66],[s*.8,1.86,-1.0]);
  povBox(G,.1,.6,1.7,'#2b3138',s*.92,.95,-.9);
  povBox(G,.12,.1,.14,'#15181c',s*1.02,1.1,-.6);povBox(G,.02,.06,.09,'#9fb0bc',s*1.08,1.1,-.6)});
 povBox(G,.36,.1,.03,'#15181c',0,1.68,-.82);povBox(G,.32,.07,.01,'#8fa0ab',0,1.68,-.81);
 /* steering wheel: a tilted rim, three spokes, a bright 12 o'clock marker and a hub. WS rolls about the column axis. */
 const WH=new THREE.Group();WH.position.set(POV_W[0],POV_W[1],POV_W[2]);WH.rotation.x=POV_TILT;G.add(WH);
 const WS=new THREE.Group();WH.add(WS);POV.wheel=WS;
 WS.add(new THREE.Mesh(new THREE.TorusGeometry(POV_R,.028,8,28),M('#17191d')));
 [90,210,330].forEach(a=>{const r=a*Math.PI/180;povBarSet(povBar(WS,.045,'#3a424b'),[0,0,0],[Math.cos(r)*POV_R,Math.sin(r)*POV_R,0])});
 const mark=povBox(WS,.05,.05,.03,'#f5c542',0,POV_R,.02);
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.04,10),M('#2a3038'));hub.rotation.x=Math.PI/2;WS.add(hub);
 /* the hands grip the rim at 9 and 3 o'clock: anchors that ride the wheel */
 POV.anchors=[-1,1].map(s=>{const o=new THREE.Object3D();o.position.set(s*POV_R,0,.03);WS.add(o);return o});
 /* arms: upper arm (sleeve), forearm (skin), and a hand block, each rebuilt from its end points every frame */
 const arm=()=>({up:povBar(G,.11,POV_SLEEVE),fore:povBar(G,.075,POV_SKIN),hand:povBox(G,.085,.07,.09,POV_SKIN,0,0,0)});
 POV.arms=[arm(),arm()];
}

/* the car frame: local origin is the driver's seat on the ground, local -z is the bonnet, eye at height 1.2.
   The view follows the car through a short ease (position and heading), so frame-to-frame jitter in the car's motion does not reach the picture. */
function povPose(dt){const h=dr.h,fx=Math.sin(h),fz=Math.cos(h),tx=dr.x+fx*.25,tz=dr.z+fz*.25;
 if(POV.cx===undefined){POV.cx=tx;POV.cz=tz;POV.ch=h}
 const k=1-Math.exp(-dt*16);POV.cx+=(tx-POV.cx)*k;POV.cz+=(tz-POV.cz)*k;
 let dh=h-POV.ch;dh=Math.atan2(Math.sin(dh),Math.cos(dh));POV.ch+=dh*k;
 const ch=POV.ch,cfx=Math.sin(ch),cfz=Math.cos(ch),ex=POV.cx,ez=POV.cz;
 POV.G.position.set(ex,0,ez);POV.G.rotation.y=ch+Math.PI;
 POVC.position.set(ex,1.2,ez);POVC.lookAt(ex+cfx*40,1.2,ez+cfz*40)}
/* steering: proportional to how far A or D is held, smooth, and back to centre when released */
function povSteer(dt){const st=(keys.a||keys.arrowleft?1:0)-(keys.d||keys.arrowright?1:0),tg=st*POV_LIM;
 POV.ang+=(tg-POV.ang)*(1-Math.exp(-dt*(st?8:5)));POV.wheel.rotation.z=POV.ang}
/* the hands are read from their anchors on the rim, so they follow the tilt and the roll; elbows stay low, shoulders fixed */
const POV_HV=new THREE.Vector3();
function povArms(){POV.G.updateMatrixWorld(true);
 const hands=POV.anchors.map(o=>{o.getWorldPosition(POV_HV);POV.G.worldToLocal(POV_HV);return[POV_HV.x,POV_HV.y,POV_HV.z]});
 [-1,1].forEach((s,i)=>{const A=POV.arms[i],h=hands[i],sh=[s*.22,1.0,.06],el=[s*.3,.76,-.3];
  povBarSet(A.up,sh,el);povBarSet(A.fore,el,h);A.hand.position.set(h[0],h[1],h[2]);A.hand.rotation.z=POV.ang})}
/* instrument needle: 135 degrees left at zero, 135 right at the car's top speed */
function povGauge(){if(!POV.needle)return;const mx=carMax(dr.i)||20,f=Math.min(1,wMph(Math.abs(dr.v))/mx);POV.needle.rotation.z=(135-f*270)*Math.PI/180}

/* the renderer hook: while driving, draw from the driver's seat into a small target and scale it up; otherwise the usual camera */
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){
 const on=mode=='drive'&&!!dr&&dr.m&&!PAUSED;
 if(on&&!POV.G)povBuild3D();
 if(POV.G)POV.G.visible=on;
 if(!on)return r0(sc,c);
 const now=performance.now(),dt=Math.min(.1,(now-(POV.t||now))/1000);POV.t=now;
 povPose(dt);povSteer(dt);povArms();povGauge();
 const W=Math.max(2,Math.round(innerWidth/POV_PX)),H=Math.max(2,Math.round(innerHeight/POV_PX));
 if(!POV_RT)POV_RT=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});
 else if(POV_RT.width!==W||POV_RT.height!==H)POV_RT.setSize(W,H);
 POVC.aspect=W/H;POVC.updateProjectionMatrix();
 const vis=dr.m.visible;dr.m.visible=false;
 renderer.setRenderTarget(POV_RT);r0(sc,POVC);
 dr.m.visible=vis;renderer.setRenderTarget(null);
 POV_FSQ.material.map=POV_RT.texture;r0(POV_FS,POV_FSC)}}
