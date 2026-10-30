/* ===== v49.37.0: walk around the stage =====
   During a festival set (70-festival.js) and a stadium or club show abroad (151-tour-shows.js) you can walk around the stage:
   WASD / arrows, the touch joystick or the gamepad stick, as seen from behind you (up = towards the crowd).
   - an invisible barrier keeps you on the deck (plus the catwalk and the B-stage in a stadium); the drum riser, amps,
     monitor wedges, the mic stands and the people on stage block you too.
   - the mic stand stays where it is: step away from it and you take the mic off the stand and hold it up to your mouth,
     walking with it; walk back to your spot and it goes back on the stand. Tour shows now have a mic stand too.
   - supporting acts (the guitarist and bassist on tour, the featured artist on a collab song) wander a few steps now and
     then and come back, much less often than you would.
   - the festival camera slides sideways with you; tour show cameras favour the shots from behind while you walk.
   Hooks: 151-tour-shows.js calls STW.show(H,dt,px,pz) inside its effects and STW.walking() for the camera; the
   festival is patched from here. Nothing is saved: no state fields added. */
(function(){
const SW={key:null,x:0,z:0,hx:0,hz:0,man:0,away:0,mv:0,lastMv:-9,t:0,rot:0,px:0,pz:0,hm:null,acts:new Map(),stands:[]};
window.STW=SW;
const PR=.28;/* your radius */
function inp(){if(typeof keys=='undefined')return[0,0];let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),iy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(window.TCHJ&&TCHJ.on){ix=TCHJ.x;iy=TCHJ.y}const L=Math.hypot(ix,iy);if(L<.15)return[0,0];if(L>1){ix/=L;iy/=L}
 /* the cameras look from behind you towards the crowd (+z), so screen right is -x and up is +z */
 return[-ix,-iy]}
/* a handheld mic: handle and grille, held in the hand of an arm pivot and pointing back at the mouth */
function handMic(){const g=new THREE.Group();B(g,.06,.06,.2,'#141414',0,0,.04);B(g,.11,.11,.11,'#a4a4a8',0,.02,.17);g.position.set(0,-.5,0);g.rotation.x=.25;g.visible=false;return g}
function micOn(arm,on){if(!arm)return;let m=arm.userData.stwMic;if(!m){if(!on)return;m=arm.userData.stwMic=handMic();arm.add(m)}m.visible=!!on}
/* the stand's own mic (the last two parts of festMic) goes when it is in your hand */
function standMic(g,on){if(!g||!g.children)return;const c=g.children,n=c.length;if(n>=6){c[n-1].visible=c[n-2].visible=!!on}}
const ok=(c,x,z,r,self)=>c.inside(x,z,r)&&!c.obst.some(o=>o!==self&&o.skip!==self&&(o.r!=null?Math.hypot(x-o.x(),z-o.z())<o.r+r:x+r>o.b[0]&&x-r<o.b[2]&&z+r>o.b[1]&&z-r<o.b[3]));
/* walk a figure (local stage coords) one step, sliding along whatever blocks it; returns how far it went */
function step(c,p,dx,dz,r,self){const x0=p.x,z0=p.z,free=!ok(c,p.x,p.z,r,self)&&c.inside(p.x,p.z,r);/* already overlapping someone: let it walk out */
 const go=(x,z)=>free?c.inside(x,z,r):ok(c,x,z,r,self);if(dx&&go(p.x+dx,p.z))p.x+=dx;if(dz&&go(p.x,p.z+dz))p.z+=dz;return Math.hypot(p.x-x0,p.z-z0)}
/* how: 'mic' holds the mic arm up to the mouth and swings the other, 'arms' swings both, 'legs' leaves the arms to the show (instruments) */
function walkPose(o,t,how,micArm){const s=Math.sin(t)*.6;o.legs[0].rotation.x=s;o.legs[1].rotation.x=-s;
 if(how=='mic'){o.arms[micArm].rotation.x=-2.2+Math.sin(t*2)*.05;o.arms[1-micArm].rotation.x=-s*.8-.1}else if(how=='arms'){o.arms[0].rotation.x=-s;o.arms[1].rotation.x=s}}
function turn(cur,to,k){let d=to-cur;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return cur+d*k}

/* ---- supporting acts: idle a long while, wander a few steps, idle, come back ---- */
function actTick(c,a,dt){a.wait-=dt;const p=a.p;
 if(!a.tg){if(a.wait>0)return 0;const home=Math.hypot(p.x-a.hx,p.z-a.hz)>.3&&Math.random()<.6;
  if(home)a.tg={x:a.hx,z:a.hz};else{for(let i=0;i<8;i++){const x=a.hx+R(-a.rx,a.rx),z=a.hz+R(-a.rz,a.rz*.6);if(Math.hypot(x-p.x,z-p.z)>.8&&ok(c,x,z,.35,a.ob)){a.tg={x,z};break}}}
  a.wait=R(9,22);if(!a.tg)return 0;a.stuck=0}
 const dx=a.tg.x-p.x,dz=a.tg.z-p.z,d=Math.hypot(dx,dz);if(d<.08){a.tg=null;a.wait=R(10,24);return 0}
 const sp=Math.min(d,1.3*dt),moved=step(c,p,dx/d*sp,dz/d*sp,.35,a.ob);a.ry=Math.atan2(dx,dz);
 if(moved<sp*.3){if((a.stuck+=dt)>1.2){a.tg=null;a.wait=R(4,9)}}else a.stuck=0;return moved>1e-4?1:0}
/* place and pose one act after its own show code has posed it; ry0 is the facing the show code gave it */
function actApply(c,a,dt,how,micArm){const w=actTick(c,a,dt),o=a.o,away=Math.hypot(a.p.x-a.hx,a.p.z-a.hz)>.3;
 o.g.position.x=c.ox+a.p.x;o.g.position.z=c.oz+a.p.z;a.wt+=dt*(w?8:0);
 if(w){a.r=turn(a.r,a.ry,Math.min(1,dt*8));o.g.rotation.y=a.r;walkPose(o,a.wt,how,micArm);o.g.position.y=c.y+Math.abs(Math.sin(a.wt))*.05}
 else{a.r=turn(a.r,o.g.rotation.y,Math.min(1,dt*4));o.g.rotation.y=a.r;if(a.wasW){o.legs[0].rotation.x=o.legs[1].rotation.x=0;if(how=='legs')o.g.position.y=c.y}}
 a.wasW=w;return away}
function actFor(o,hx,hz,rx,rz,ob){let a=SW.acts.get(o);if(!a){a={o,hx,hz,rx,rz,ob,p:{x:hx,z:hz},tg:null,wait:R(6,20),wt:0,r:o.g.rotation.y,ry:0,stuck:0,wasW:0};SW.acts.set(o,a)}return a}
const circ=(fx,fz,r,skip)=>({x:fx,z:fz,r,skip});
const box=(x0,z0,x1,z1)=>({b:[x0,z0,x1,z1]});

/* ---- you ---- */
function reset(key,hx,hz){SW.key=key;SW.hx=hx;SW.hz=hz;SW.x=hx;SW.z=hz;SW.man=0;SW.away=0;SW.mv=0;SW.lastMv=-9;SW.t=0;SW.rot=0;SW.acts=new Map();SW.hm=null;SW.hintT=0}
/* move you from the input; c.inside/c.obst are in local stage coordinates. Returns 1 while walking */
function youTick(c,dt){const[dx,dz]=inp();let w=0;
 if(dx||dz){SW.man=1;const sp=2.6*(keys.shift?1.5:1)*dt,p={x:SW.x,z:SW.z};w=step(c,p,dx*sp,dz*sp,PR)>1e-4;SW.x=p.x;SW.z=p.z;if(w){SW.rot=turn(SW.rot,Math.atan2(dx,dz),Math.min(1,dt*10));SW.lastMv=SW.tt}}
 else if(SW.man&&Math.hypot(SW.x-SW.hx,SW.z-SW.hz)<.3){/* close to your spot: step back onto it */const k=Math.min(1,dt*6);SW.x+=(SW.hx-SW.x)*k;SW.z+=(SW.hz-SW.z)*k}
 return w}
function youPose(dt,y,how){const o={legs:P.legs,arms:P.arms};SW.wt=(SW.wt||0)+dt*9;walkPose(o,SW.wt,how,1);P.mesh.rotation.y=SW.rot;P.mesh.position.y=y+Math.abs(Math.sin(SW.wt))*.06}
SW.walking=()=>SW.tt-SW.lastMv<1.5;SW.tt=0;

/* ---- festival ---- */
const fest=()=>typeof FEST!='undefined'&&mode=='fest'&&FEST.view&&FEST.set&&!FEST.set.end;
const myInst=()=>{try{return window.MPI?MPI():''}catch(e){return''}};
if(typeof festStagePeople=='function'){
 const m0=festMic;festMic=function(){const g=m0.apply(this,arguments);SW.stands.push(g);return g};
 const p0=festStagePeople;festStagePeople=function(){const set=FEST.set,keep=SW.key===set&&SW.man;SW.stands=[];const r=p0.apply(this,arguments);
  if(SW.key!==set)reset(set,P.x,P.z);else{SW.hx=P.x;SW.hz=P.z;if(keep){P.x=SW.x;P.z=SW.z}else{SW.x=P.x;SW.z=P.z}}
  SW.myStand=SW.stands[0];SW.ftStand=SW.stands[1];SW.ftA=null;return r}}
function festCtx(s){const set=FEST.set,h=s.h,cx=s.cx,zb=s.zb,zf=s.zf,w=s.w,camZ=zf-Math.min(7.4,s.d-1),rw=Math.min(5,w*.3);
 const ob=[box(cx-rw/2,zb+.9,cx+rw/2,zb+3.9),box(cx-w*.33-.55,zb+2.65,cx-w*.33+.55,zb+3.35),box(cx+w*.33-.55,zb+2.65,cx+w*.33+.55,zb+3.35),
  box(cx-2.8,zf-.65,cx-2,zf-.15),box(cx+2,zf-.65,cx+2.8,zf-.15)];if(s.n<=2)ob.push(circ(()=>s.x1-1.6,()=>s.zf-1.2,.55));
 const st=g=>{if(!g)return;const p=g.position;ob.push(circ(()=>p.x,()=>p.z,.22))};st(SW.myStand);st(SW.ftStand);
 if(set.ft){const o=set.ft;if(SW.ftO!==o){SW.ftO=o;SW.ftOb=circ(()=>o.g.position.x,()=>o.g.position.z,.35)}ob.push(SW.ftOb)}
 /* you stay in front of the camera that stands on the deck behind you */
 return{ox:0,oz:0,y:h,obst:ob,inside:(x,z,r)=>x-r>s.x0+.35&&x+r<s.x1-.35&&z+r<zf-.25&&z-r>Math.max(zb+.5,camZ+2.3)}}
function festWalk(dt){const set=FEST.set,s=set.st;if(SW.key!==set)reset(set,P.x,P.z);SW.tt+=dt;
 const c=festCtx(s);
 const w=youTick(c,dt);P.x=SW.x;P.z=SW.z;const away=Math.hypot(SW.x-SW.hx,SW.z-SW.hz)>.3,mic=myInst()==''||myInst()=='vo';SW.away=away;
 if(P.mesh){P.mesh.position.x=P.x;P.mesh.position.z=P.z;if(w)youPose(dt,s.h,mic?'mic':'arms');else if(away){SW.rot=turn(SW.rot,Math.sin(SW.tt*.9)*.15,Math.min(1,dt*3));P.mesh.rotation.y=SW.rot}else SW.rot=P.mesh.rotation.y}
 micOn(P.arms[1],away&&mic);standMic(SW.myStand,!(away&&mic));
 /* the featured artist on a collab song */
 if(set.ft){const o=set.ft;c.obst.push(circ(()=>SW.x,()=>SW.z,PR));const a=actFor(o,o.g.position.x,o.g.position.z,Math.min(3,s.w*.15),1.6,SW.ftOb);
  const aw=actApply(c,a,dt,'mic',0);micOn(o.arms[0],aw);standMic(SW.ftStand,!aw)}
 /* the camera slides with you, and keeps looking out past you */
 const v=FEST.view3,cm=v&&v.cam;if(cm){const k=Math.min(1,dt*3);SW.cdx=(SW.cdx||0)+((SW.x-SW.hx)*.8-(SW.cdx||0))*k;cm.position.x+=SW.cdx;const L=new THREE.Vector3(0,0,-1).applyQuaternion(cm.quaternion);cm.lookAt(cm.position.x+L.x*30,cm.position.y+L.y*30,cm.position.z+L.z*30)}
 hint()}

/* ---- tour shows (called from 151-tour-shows.js showFx; px/pz are the stage-local spot the show put you on) ---- */
SW.show=function(H,dt,px,pz){const A=H.A,T=A.stage;if(!A||!T||!P.mesh)return null;if(SW.key!==H){reset(H,T.x,T.zf-2.2);SW.x=px;SW.z=pz}SW.tt+=dt;
 const ox=A.g.position.x,oz=A.g.position.z,venue=H.k=='venue',cat=A.cat,y0=T.h;
 if(!A.stwStand&&typeof festMic=='function'){const g=festMic(T.x+.45,T.h,T.zf-1.48,Math.atan2(.45,.72));A.g.add(g);A.stwStand=g}
 const rw=venue?6:3,rd=venue?4:2,rz=T.zb+(venue?2.6:1.3),ob=[box(T.x-rw/2,rz-rd/2,T.x+rw/2,rz+rd/2)];
 const sp=A.stwStand.position;ob.push(circ(()=>sp.x,()=>sp.z,.22));
 A.band.forEach(b=>{const o=b.o;b.ob=b.ob||circ(()=>o.g.position.x-ox,()=>o.g.position.z-oz,b.role=='keys'?.8:.42);ob.push(b.ob)});
 if(A.ft){const o=A.ft;if(SW.ftO!==o){SW.ftO=o;SW.ftOb2=circ(()=>o.g.position.x-ox,()=>o.g.position.z-oz,.35)}ob.push(SW.ftOb2)}
 const inside=(x,z,r)=>{if(x-r>T.x-T.w/2+.35&&x+r<T.x+T.w/2-.35&&z-r>T.zb+.5&&z+r<T.zf-.25)return true;
  if(venue&&cat){if(Math.abs(x)+r<1.15&&z>T.zf-1&&z<cat.z1+1)return true;if(Math.hypot(x,z-cat.bz)+r<cat.br-.45)return true}return false};
 const c={ox,oz,y:y0,obst:ob,inside};
 let w=0;const[dx,dz]=inp();
 if(SW.man||dx||dz){w=youTick(c,dt)}else{/* the show still walks you down the catwalk on its own until you take over */const m=Math.hypot(px-SW.x,pz-SW.z);w=m>dt*.5;if(w)SW.rot=turn(SW.rot,Math.atan2(px-SW.x,pz-SW.z),Math.min(1,dt*8));SW.x=px;SW.z=pz;if(w)SW.lastMv=SW.tt}
 /* the catwalk is lower than the stage: walk down the first metre or so of it */
 const y=venue&&SW.z>T.zf?y0+(1.42-y0)*Math.min(1,(SW.z-T.zf)/1.4):y0;
 P.x=ox+SW.x;P.z=oz+SW.z;const away=Math.hypot(SW.x-SW.hx,SW.z-SW.hz)>.3;SW.away=away;
 if(H.state!='inter'){P.mesh.position.x=P.x;P.mesh.position.z=P.z;P.mesh.position.y=y+(P.mesh.position.y-(H.cat&&pz>T.zf?1.42:T.h));
  if(w)youPose(dt,y,'mic');else if(away){SW.rot=turn(SW.rot,Math.sin(SW.tt*.9)*.25,Math.min(1,dt*3));P.mesh.rotation.y=SW.rot}else SW.rot=P.mesh.rotation.y}
 micOn(P.arms[1],away);standMic(A.stwStand,!away);
 /* the guitarist and the bassist roam a little; the drummer and the keys player stay put */
 const you=circ(()=>SW.x,()=>SW.z,PR);ob.push(you);
 A.band.forEach(b=>{if(b.role!='gtr'&&b.role!='bass')return;const o=b.o,a=actFor(o,o.g.position.x-ox,o.g.position.z-oz,venue?3.2:1.4,venue?1.6:.8,b.ob);actApply(c,a,dt,'legs',0)});
 if(A.ft){const o=A.ft,a=actFor(o,o.g.position.x-ox,o.g.position.z-oz,venue?3:1.2,venue?1.6:.8,SW.ftOb2);actApply(c,a,dt,'mic',0);micOn(o.arms[0],1)}
 hint();return{x:SW.x,z:SW.z}};

/* a short note the first time each show starts, on top of the stage view */
function hint(){if((SW.hintT=(SW.hintT||0)+1)>1)return;let e=$('stwh');if(!e){e=document.createElement('div');e.id='stwh';document.body.appendChild(e)}
 const tch=document.body.classList.contains('tch');e.textContent=tch?'Use the joystick to walk around the stage':'WASD or arrows: walk around the stage';e.style.opacity=1;clearTimeout(e._t);e._t=setTimeout(()=>{e.style.opacity=0},6000)}
{const st=document.createElement('style');st.textContent=`#stwh{position:fixed;left:50%;bottom:120px;transform:translateX(-50%);z-index:5;pointer-events:none;font:12px Silkscreen,ui-monospace,monospace;color:#fff;background:#0b0f0dcc;border:2px solid #000;padding:6px 10px;opacity:0;transition:opacity .6s;white-space:nowrap}
body.tch #fend,body.tch #dsend{bottom:calc(var(--tsb,16px) + var(--tjs,120px) + 34px)}`;document.head.appendChild(st)}

{const u0=update;update=function(dt){u0(dt);if(fest()){try{festWalk(dt)}catch(e){if(!SW.err){SW.err=1;console.error('stage walk',e)}}}
 if(!(fest()||mode=='dshow')){const e=$('stwh');if(e&&e.style.opacity=='1')e.style.opacity=0;/* off the stage the mic goes back */const m=P.arms[1]&&P.arms[1].userData.stwMic;if(m&&m.visible)m.visible=false}}}
})();
