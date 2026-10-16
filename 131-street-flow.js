/* ===== v42.9.0: street flow =====
   1. Pedestrians see you ahead on the pavement, slow down and step to one side to pass you, then drift back to
      their line. The old shove (pushPeople) stays as a last resort.
   2. Traffic cars turn at junctions along a real curve: they pick their next road early, brake into the turn,
      follow a quarter-circle arc (tight on the near-side turn, wide on the far-side turn, a half circle for a
      U-turn at a dead end) facing along the curve, and speed back up after it.
   Traffic hitboxes against the player now follow each car's real heading, so they stay right mid-turn. */
(function(){
/* ---------- 1. pedestrians step around you ---------- */
const SIDE=1.0;/* how far either side of their line people may step (pavement is about 2.4 wide) */
function avoidPrep(L,vert){L.forEach(n=>{if(n._ao){if(vert)n.x-=n._ao;else n.z-=n._ao}if(n._sp0!==undefined)n.sp=n._sp0})}
function avoidApply(L,vert,dt){const out=HIN||IN,r=mode=='drive'?1.9:1.05;L.forEach(n=>{
  if(n._sp0===undefined)n._sp0=n.sp;
  let tgt=0,slow=1;const o=n._ao||0;
  if(!out&&n.m.visible&&n.st!=1){
   const lane=vert?n.x0:n.z0,al=(vert?P.z-n.z:P.x-n.x)*n.dir,pl=(vert?P.x:P.z)-lane;
   if(al>-1.2&&al<4.5&&Math.abs(pl-o)<r+.6){
    /* step to the side away from you, or the other side if you are near that edge */
    let sd=o>=pl?1:-1;if(Math.abs(pl+sd*r)>SIDE)sd=-sd;
    tgt=Math.max(-SIDE,Math.min(SIDE,pl+sd*r));
    if(al>0&&Math.abs(pl-o)<r)slow=al<1.4?.25:.55}}
  const no=o+(tgt-o)*Math.min(1,dt*(tgt?4:1.5));n._ao=Math.abs(no)<.005&&!tgt?0:no;n.sp=n._sp0*slow;
  if(vert)n.x+=n._ao;else n.z+=n._ao;
  if(!n.m.visible)return;
  n.m.position.x=n.x;n.m.position.z=n.z;if(n.pet&&!vert)n.pet.position.z+=n._ao;
  if(n.st!=1&&dt>0){const lv=(n._ao-o)/dt,f=n.dir*Math.max(.3,n.sp);n.m.rotation.y=vert?Math.atan2(lv,f):Math.atan2(f,lv)}})}
/* the old shove runs after the sidestep, on people's real positions */
const push0=pushPeople;pushPeople=function(){};
{const w0=worldTick;worldTick=function(dt){let ok=1;try{avoidPrep(NPC,0);avoidPrep(VPED,1)}catch(e){ok=0}w0(dt);if(ok)try{avoidApply(NPC,0,dt);avoidApply(VPED,1,dt)}catch(e){console.error('street avoid',e)}push0()}}

/* ---------- 2. traffic turns along curves ---------- */
const RT_IN=3,RT_OUT=5.5,V_IN=3.6,V_OUT=5,V_U=2.6;
function bez(c,f){const u=1-f,a=u*u*u,b=3*u*u*f,d=3*u*f*f,e=f*f*f,p=c.p;
 return[a*p[0]+b*p[2]+d*p[4]+e*p[6],a*p[1]+b*p[3]+d*p[5]+e*p[7],
  3*(u*u*(p[2]-p[0])+2*u*f*(p[4]-p[2])+f*f*(p[6]-p[4])),3*(u*u*(p[3]-p[1])+2*u*f*(p[5]-p[3])+f*f*(p[7]-p[5]))]}
/* the curve from edge e1 into e2 around node B, or null for straight on (or a turn too big for the roads) */
function mkTurn(e1,e2,B){const L=LANE_OFF,u1x=e1.ux,u1z=e1.uz,u2x=e2.ux,u2z=e2.uz,n1x=u1z,n1z=-u1x,n2x=u2z,n2z=-u2x,dp=u1x*u2x+u1z*u2z;
 let p,din,dout,arc,v;
 if(dp>.95)return null;
 if(dp<-.95){/* U-turn: half circle of radius L just before the dead end */
  const qx=B.x-u1x*L,qz=B.z-u1z*L,k=L*4/3;din=L;dout=L;arc=Math.PI*L;v=V_U;
  p=[qx+n1x*L,qz+n1z*L,qx+n1x*L+u1x*k,qz+n1z*L+u1z*k,qx-n1x*L+u1x*k,qz-n1z*L+u1z*k,qx-n1x*L,qz-n1z*L]}
 else if(Math.abs(dp)<.1){const cx=B.x+(n1x+n2x)*L,cz=B.z+(n1z+n2z)*L,s=(n2x*u1x+n2z*u1z)*L,rt=s<0?RT_IN:RT_OUT,k=rt*.5523;
  din=rt-s;dout=(n1x*u2x+n1z*u2z)*L+rt;arc=Math.PI/2*rt;v=s<0?V_IN:V_OUT;
  const x0=cx-u1x*rt,z0=cz-u1z*rt,x3=cx+u2x*rt,z3=cz+u2z*rt;p=[x0,z0,x0+u1x*k,z0+u1z*k,x3-u2x*k,z3-u2z*k,x3,z3]}
 else return null;
 if(din<.5||dout<.5||din>e1.len*.45||dout>e2.len*.45)return null;
 return{p,din,dout,arc,v,e1,e2,span:din+dout}}
function nextEdge(c){const b=c.e.to,ops=b.e.filter(e=>e.to!==c.a);c.ne=ops.length?pick(ops):b.e[0];c.cv=mkTurn(c.e,c.ne,b)}
/* where along the curve the car is (0..span), or -1 when it is on a straight bit */
function curS(c){const x=c.cx,v=c.cv;if(x&&c.e===x.e2&&c.t<x.dout)return[x.din+c.t,x];if(v&&c.e===v.e1&&c.t>v.e1.len-v.din)return[c.t-(v.e1.len-v.din),v];return null}
trafTick=function(dt){const pl=mode=='play'||mode=='drive';TRAF.forEach(c=>{if(!c.e)return;let tg=c.cr;
  if(!c.ne)nextEdge(c);
  const hx=Math.sin(c.h),hz=Math.cos(c.h),toEnd=c.e.len-c.t,q0=curS(c);
  /* the car ahead: same road, or just round the corner on the road we are turning into */
  TRAF.forEach(o=>{if(o===c||!o.e)return;let g=-1;if(o.a===c.a&&o.e===c.e)g=o.t-c.t;else if(o.e===c.ne&&o.a===c.e.to)g=toEnd+o.t;if(g>0&&g<9)tg=Math.min(tg,g<4.8?0:o.s)});
  if(pl&&!IN){const dx=P.x-c.x,dz=P.z-c.z,al=dx*hx+dz*hz,pp=dx*hz-dz*hx;if(al>0&&al<9&&Math.abs(pp)<1.6)tg=al<5?0:Math.min(tg,2.5)}
  /* brake into a turn, hold the turn speed through it */
  if(q0)tg=Math.min(tg,q0[1].v);else if(c.cv){const v=c.cv;if(c.e===v.e1){const d=toEnd-v.din;tg=Math.min(tg,v.v+Math.max(0,d)*.55)}}
  /* give way: wait before the junction while another car is moving through it */
  const wz=c.cv&&c.e===c.cv.e1?c.cv.din+.8:4;
  if(toEnd<wz&&!q0&&c.w<5){const to=c.e.to;if(TRAF.some(o=>o!==c&&o.e&&o.s>.5&&Math.hypot(o.x-to.x,o.z-to.z)<4.5&&!(o.a===c.a&&o.e===c.e)))tg=0}
  c.w=tg<.1&&c.s<.5?c.w+dt:0;c.s+=(tg-c.s)*Math.min(1,dt*(tg<c.s?3:1.1));
  /* on the curve the road distance is not the driven distance: scale so the car really moves at c.s */
  c.t+=c.s*dt*(q0?q0[1].span/q0[1].arc:1);
  while(c.t>=c.e.len){c.t-=c.e.len;const b=c.e.to;if(!c.ne)nextEdge(c);c.a=b;c.e=c.ne;c.cx=c.cv;c.ne=null;c.cv=null;c.w=0}
  if(c.cx&&(c.e!==c.cx.e2||c.t>=c.cx.dout))c.cx=null;
  const q1=curS(c);let th;
  if(q1){const q=bez(q1[1],Math.max(0,Math.min(1,q1[0]/q1[1].span)));c.x=q[0];c.z=q[1];th=Math.atan2(q[2],q[3]);c.h=th}
  else{carPos(c);th=Math.atan2(c.e.ux,c.e.uz);let d=th-c.h;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;c.h+=d*Math.min(1,dt*6)}
  const m=c.m;if(c.f||!m.visible){c.rx=c.x;c.rz=c.z;c.h=th;c.f=0}else if(q1){c.rx=c.x;c.rz=c.z}else{c.rx+=(c.x-c.rx)*Math.min(1,dt*8);c.rz+=(c.z-c.rz)*Math.min(1,dt*8)}
  m.position.set(c.rx,0,c.rz);m.rotation.y=c.h;m.visible=Math.abs(c.x-P.x)<50&&Math.abs(c.z-P.z)<50&&!HIN&&!IN})};
/* on foot, a traffic car is a box along its real heading (also mid-turn) */
dynB=function(x0,z0,x,z){if(IN||HIN)return false;const R0=.62,ppl=o=>{const a=Math.hypot(o.x-x,o.z-z);return a<R0&&a<Math.hypot(o.x-x0,o.z-z0)};
 if(NPC.some(n=>n.m.visible&&ppl(n))||VPED.some(n=>n.m.visible&&ppl(n))||ART_M.some(o=>ppl(o)))return true;
 return TRAF.some(c=>{if(!c.e||!c.m.visible||Math.abs(c.x-x)>4||Math.abs(c.z-z)>4)return false;const hx=Math.sin(c.h),hz=Math.cos(c.h),cx=c.rx??c.x,cz=c.rz??c.z,dep=(px,pz)=>{const dx=px-cx,dz=pz-cz,al=Math.abs(dx*hx+dz*hz),pp=Math.abs(dx*hz-dz*hx);return Math.min(2.2-al,1.15-pp)};const n=dep(x,z);return n>0&&n>dep(x0,z0)})};
})();
