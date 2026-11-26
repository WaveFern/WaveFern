/* ===== dev only: the house front looks the same from inside and outside =====
   - The red canopy over the front door is gone.
   - Inside, the low front (south) wall and its short door are replaced by a full 3 m wall with the same 2.4 m door, lintel and
     panels as the outside, so nothing jumps when you walk in or out. The wall turns see-through while you stand near the
     front of the house so you are never hidden behind it. Its outside face carries a copy of the outside detail (windows, shutters, flower boxes, pipes, siding). Only what is drawn changes: collisions and saves are untouched. */
(function(){
 if(!window.FW_FEAT||typeof THREE=='undefined'||typeof B!='function'||typeof HX=='undefined')return;
 let canopy=false,FW=null,door=false;const DP=[];
 function build(){
  if(!canopy&&typeof HX!='undefined')HX.children.forEach(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;
   if(p&&Math.abs(p.width-2.8)<.01&&Math.abs(p.height-.15)<.01&&Math.abs(p.depth-1)<.01&&Math.abs(m.position.x-6)<.05&&Math.abs(m.position.y-2.9)<.05){m.visible=false;canopy=true}});
  if(!door&&typeof HX!='undefined'){/* the outside door slab from 17-fixes.js moves onto a hinge so it swings with the inside door */
   const m=HX.children.find(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;return p&&Math.abs(p.width-2)<.01&&Math.abs(p.height-2.4)<.01&&Math.abs(p.depth-.15)<.01&&Math.abs(m.position.x-6)<.05&&Math.abs(m.position.z-12.15)<.05});
   if(m){const dp=new THREE.Group();dp.position.set(5,0,12.15);HX.add(dp);dp.add(m);m.position.set(1,1.2,0);(window.FW_DOORP=window.FW_DOORP||[]).push(dp);door=true}}
  if(!FW&&typeof FRW!='undefined'&&FRW.visible&&typeof HXP!='undefined'&&HXP){FRW.children.forEach(c=>c.visible=false);const g=FW=new THREE.Group();FRW.add(g);const w='#d8c7a6',L=[];
   const b=(...a)=>{const m=B(g,...a);m.material=m.material.clone();m.material.transparent=true;L.push(m);return m};
   b(5,3,.3,w,2.5,1.5,12.15);b(9,3,.3,w,11.5,1.5,12.15);b(2,.6,.3,w,6,2.7,12.15);
   /* the door itself hangs on a hinge at x 5 (pivot dp) so it can swing; the frame pieces stay put */
   const dp=new THREE.Group();dp.position.set(5,0,12.15);g.add(dp);DP.push(dp);const bd=(w,h,d,c,x,y,z)=>{const m=B(dp,w,h,d,c,x-5,y,z-12.15);m.material=m.material.clone();m.material.transparent=true;L.push(m);return m};
   bd(2,2.4,.15,'#5a3a22',6,1.2,12.15);b(.2,2.4,.2,'#3a2412',4.9,1.2,12.05);b(.2,2.4,.2,'#3a2412',7.1,1.2,12.05);b(2.4,.12,.2,'#3a2412',6,2.45,12.05);
   [[5.58,1.78,.75],[6.42,1.78,.75],[5.58,.7,.8],[6.42,.7,.8]].forEach(q=>bd(.75,q[2],.03,'#6b4a2e',q[0],q[1],12.06));bd(.1,.1,.08,'#d9b44a',6.8,1.15,12.03);
   g.userData.nb=L.length;
   /* copy the outside detail on the front face (windows, frames, shutters, flower boxes, pipes, siding, door panels) */
   const v=new THREE.Vector3(),sk=new Set(L);HX.updateMatrixWorld(true);
   HX.traverse(m=>{if(!m.isMesh||!m.visible||!m.geometry||!m.geometry.parameters)return;let o=m;while(o&&o!==HX){if(!o.visible||(window.FW_DOORP||[]).includes(o))return;o=o.parent}
    m.getWorldPosition(v);const p=m.geometry.parameters;if(v.z<12.2||v.z>13.2||v.y>3.1||v.x<-.6||v.x>16.6||p.width>=17)return;
    const c=m.clone();c.material=m.material.clone();c.material.transparent=true;m.matrixWorld.decompose(c.position,c.quaternion,c.scale);g.add(c);L.push(c)});
   g.userData.L=L}}
 /* v55.20.1: one shared opacity for every part (they all change together and come back together, never part by part), fixed draw order
    (wall boxes first, copied details right after) so nothing re-sorts as the camera moves, and depth is only written when fully back */
 function fade(dt){if(!FW||!FRW.visible)return;const u=FW.userData,near=P.z>8.2&&P.x>-.5&&P.x<16.5,t=near?.22:1,k=Math.min(1,(dt||.016)*6);
  if(u.o==null)u.o=1;u.o+=(t-u.o)*k;if(Math.abs(u.o-t)<.004)u.o=t;
  u.L.forEach((m,i)=>{const mt=m.material;if(mt.opacity!==u.o)mt.opacity=u.o;const dw=u.o>=.999;if(mt.depthWrite!==dw)mt.depthWrite=dw;if(!m.userData.ro){m.userData.ro=1;m.renderOrder=i<u.nb?-9:-8;mt.polygonOffset=true;mt.polygonOffsetFactor=i<u.nb?1:0;mt.polygonOffsetUnits=1}})}
 /* v56: the front door swings open (into the hall, 100 degrees) when you walk up to it from either side and shuts again behind you.
    One angle drives the inside door (DP) and the outside panels (FW_DOORP, built in dev-models-v2.js). Looks only, collisions are untouched. */
 let da=0,dc=0;
 function swing(dt){const near=typeof P!='undefined'&&Math.abs(P.x-6)<2.2&&P.z>10&&P.z<14.8;if(near)dc=0;else dc+=dt;
  const t=near?1.75:0,k=1-Math.exp(-(dt||.016)*(near?9:6));if(!near&&dc<.5)return;da+=(t-da)*k;if(Math.abs(da-t)<.003)da=t;
  const ps=DP.concat(window.FW_DOORP||[]);ps.forEach(p=>{if(p.rotation.y!==da)p.rotation.y=da});window.FW_DOORANG=da}
 let t0=0;(function loop(t){requestAnimationFrame(loop);const dt=t0?Math.min(.1,(t-t0)/1000):.016;t0=t;try{if(!canopy||!FW)build();fade(dt);swing(dt)}catch(e){}})(0);
})();
