/* WaveFern dev: see-through buildings fade as ONE object. Only loaded on /dev/ (see dev/index.html). Add ?nofade2 to skip it.
   Replaces the dev fade of dev-fade-v1: a building between the camera and you drops to about 4% visible, but
   1. all its parts (walls, windows, door) fade together, so you never see the parts overlapping inside it;
   2. they all come back together, with one opacity, no parts popping in later than others;
   3. a depth-only pre-pass is drawn first, so only the nearest surface of each building is tinted: where two see-through
      buildings overlap on screen, the overlap looks the same as one building, not cloudier. */
(function(){
 if(!window.FW_DEV||/[?&]nofade2/.test(location.search))return;
 window.FW_FADE2=1;
 let DM=null,MAP=null;
 function meshesOf(b){
  if(!MAP||MAP.stale){MAP=new Map();scene.traverse(o=>{if(o.isMesh&&!o.userData.fwPre&&o.material&&!Array.isArray(o.material)){let a=MAP.get(o.material);if(!a)MAP.set(o.material,a=[]);a.push(o)}})}
  const r=[];[b.mat,b.dm].forEach(m=>{if(m)(MAP.get(m)||[]).forEach(o=>r.push(o))});return r}
 function pre(b){
  if(b._pp)return b._pp;
  if(!DM)DM=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true,transparent:true});
  const L=meshesOf(b);if(!L.length){MAP=null;return[]}
  b._pp=L.map(o=>{const p=new THREE.Mesh(o.geometry,DM);p.userData.fwPre=1;p.renderOrder=-1;p.visible=false;p.matrixAutoUpdate=false;p.raycast=()=>{};o.add(p);return p});
  return b._pp}
 const show=(b,v)=>{if(b._pp||v)pre(b).forEach(p=>{p.visible=v})};
 function boot(){try{
  if(typeof fadeT!=='function'||typeof CT==='undefined'||typeof P==='undefined'||typeof scene==='undefined')return false;
  const f0=fadeT,LOW=.04,MARGIN=1.4;
  fadeT=function(dt){
   f0.apply(this,arguments);
   try{
    if((typeof TRL!=='undefined'&&TRL.run&&TRL.shots&&TRL.shots[TRL.i]&&TRL.shots[TRL.i].cam)||(typeof PH!=='undefined'&&PH.camOn&&typeof phGV==='function'&&!phGV())){CT.forEach(b=>{b._f2=1;show(b,false)});return}
    const px=P.x,pz=P.z,k=Math.min(1,dt*7);
    CT.forEach(b=>{
     if(Math.abs(b.x0-px)>70){if(b._f2!==undefined&&b._f2<1){b._f2=1;b.mat.opacity=1;b.mat.depthWrite=true;if(b.dm){b.dm.opacity=1;b.dm.depthWrite=true}show(b,false)}return}
     const m=b.mat;
     let lo=0,hi=1e9;const f=(p,a,c)=>{const t1=(a-p)/16,t2=(c-p)/16;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2))};
     f(px,b.x0-MARGIN,b.x1+MARGIN);f(pz,b.z0-MARGIN,b.z1+MARGIN);hi=Math.min(hi,(b.h-1)/13);
     const tg=lo<hi?LOW:1;
     if(b._f2===undefined)b._f2=1;
     if(b._f2===1&&tg===1){return}
     b._f2+=(tg-b._f2)*k;if(b._f2>.985&&tg===1)b._f2=1;
     const o=b._f2,solid=o>=1;
     m.opacity=o;m.depthWrite=solid;
     if(b.dm){b.dm.opacity=o;b.dm.depthWrite=solid}
     show(b,!solid);
    });
   }catch(e){}
  };
  return true;
 }catch(e){return true}}
 let n=0;const t=setInterval(()=>{if(boot()||++n>200)clearInterval(t)},100);
})();
