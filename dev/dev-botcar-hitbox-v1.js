/* WaveFern dev: accurate hitboxes for bot (traffic) cars. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Every traffic car gets an oriented box taken from its real model (length x width x scale) along its real heading.
   Your car (a row of circles, like drvFree) and you on foot can't enter it. A move is refused only if it goes further
   into a car than you already are, so you can always back away. Add ?nobothitbox to the address to skip it. */
(function(){
 if(!window.FW_DEV)return;
 if(/[?&]nobothitbox/.test(location.search))return;
 if(typeof TRAF=='undefined'||typeof tcB!='function')return;
 function box(c){
  if(c.hb)return c.hb;
  let g=null;c.m.traverse(o=>{if(!g&&o.isMesh&&o.geometry)g=o.geometry});
  if(g&&!g.boundingBox)g.computeBoundingBox();
  const b=g&&g.boundingBox,k=(c.m.scale&&c.m.scale.x)||1.5;
  return c.hb=b?{hl:(b.max.z-b.min.z)*k/2,hw:(b.max.x-b.min.x)*k/2,ox:(b.max.x+b.min.x)*k/2,oz:(b.max.z+b.min.z)*k/2}:{hl:1.8,hw:.8,ox:0,oz:0};
 }
 /* how far a circle at (px,pz) with radius r sits inside the car's box (<=0 means clear) */
 function pen(c,px,pz,r){
  const b=box(c),h=c.h,sx=Math.sin(h),cz=Math.cos(h),dx=px-(c.rx??c.x),dz=pz-(c.rz??c.z),
   lx=dx*cz-dz*sx-b.ox,lz=dx*sx+dz*cz-b.oz,ax=Math.abs(lx)-b.hw,az=Math.abs(lz)-b.hl;
  if(ax>0||az>0)return r-Math.hypot(Math.max(ax,0),Math.max(az,0));
  return r-Math.max(ax,az);
 }
 /* same test, but also says which way to push the circle out (world direction) */
 function sep(c,px,pz,r){
  const b=box(c),h=c.h,sx=Math.sin(h),cz=Math.cos(h),dx=px-(c.rx??c.x),dz=pz-(c.rz??c.z),
   lx=dx*cz-dz*sx-b.ox,lz=dx*sx+dz*cz-b.oz,ax=Math.abs(lx)-b.hw,az=Math.abs(lz)-b.hl;
  let nlx,nlz,p;
  if(ax>0||az>0){const qx=Math.max(ax,0),qz=Math.max(az,0),d=Math.hypot(qx,qz)||1e-6;p=r-d;nlx=Math.sign(lx||1)*qx/d;nlz=Math.sign(lz||1)*qz/d}
  else if(ax>az){p=r-ax;nlx=Math.sign(lx||1);nlz=0}else{p=r-az;nlx=0;nlz=Math.sign(lz||1)}
  return{p,x:nlx*cz+nlz*sx,z:-nlx*sx+nlz*cz};
 }
 function carCircles(x,z){
  const S=(typeof CSPEC!='undefined'&&CSPEC[dr.i])||{L:2.4,W:1},k=(dr.m&&dr.m.scale&&dr.m.scale.x)||1.5,hl=S.L*k/2,hw=S.W*k/2*.88,
   sx=Math.sin(dr.h),cz=Math.cos(dr.h),e=hl-hw,n=Math.max(1,Math.ceil(e/(hw*.9))),out=[];
  for(let i=-n;i<=n;i++){const o=e*i/n;out.push([x+sx*o,z+cz*o,hw])}
  return out;
 }
 const near=(c,x,z)=>c.e&&c.m.visible&&Math.abs((c.rx??c.x)-x)<7&&Math.abs((c.rz??c.z)-z)<7;
 const worst=(c,cs)=>{let w=-1e9;for(const q of cs){const p=pen(c,q[0],q[1],q[2]);if(p>w)w=p}return w};
 tcB=function(x0,z0,x,z){
  if(typeof dr=='undefined'||!dr)return false;
  const a=carCircles(x,z),b=carCircles(x0,z0);
  return TRAF.some(c=>{if(!near(c,x,z))return false;const n=worst(c,a);return n>.01&&n>worst(c,b)+.004});
 };
 const R0=.62;
 dynB=function(x0,z0,x,z){
  if(IN||HIN)return false;
  const ppl=o=>{const a=Math.hypot(o.x-x,o.z-z);return a<R0&&a<Math.hypot(o.x-x0,o.z-z0)};
  if(NPC.some(n=>n.m.visible&&ppl(n))||VPED.some(n=>n.m.visible&&ppl(n))||ART_M.some(o=>ppl(o)))return true;
  return TRAF.some(c=>{if(!near(c,x,z))return false;const n=pen(c,x,z,.35);return n>.01&&n>pen(c,x0,z0,.35)+.004});
 };
 /* depenetration: a bot car that turns or creeps into your car pushes you out smoothly (no stick-slip "humping"),
    and you lose the speed you had into it */
 function unstick(dt){
  if(typeof dr=='undefined'||!dr||mode!='drive'||IN||HIN)return;
  for(let it=0;it<3;it++){
   let best=null;
   for(const c of TRAF){if(!near(c,dr.x,dr.z))continue;for(const q of carCircles(dr.x,dr.z)){const s=sep(c,q[0],q[1],q[2]);if(s.p>.02&&(!best||s.p>best.p))best=s}}
   if(!best)return;
   const k=Math.min(best.p,.25);let nx=dr.x+best.x*k,nz=dr.z+best.z*k;
   if(typeof drvFree=='function'&&!drvFree(nx,nz))return;
   dr.x=nx;dr.z=nz;
   const into=-(Math.sin(dr.h)*best.x+Math.cos(dr.h)*best.z)*dr.v;
   if(into>0)dr.v*=1-Math.min(.5,6*dt);
  }
 }
 const wt=worldTick;worldTick=function(dt){wt(dt);try{unstick(dt)}catch(e){}};
})();
