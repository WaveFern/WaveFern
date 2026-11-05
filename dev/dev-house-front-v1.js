/* ===== dev only: the house front looks the same from inside and outside =====
   - The red canopy over the front door is gone.
   - Inside, the low front (south) wall and its short door are replaced by a full 3 m wall with the same 2.4 m door, lintel and
     panels as the outside, so nothing jumps when you walk in or out. The wall turns see-through while you stand near the
     front of the house so you are never hidden behind it. Its outside face carries a copy of the outside detail (windows, shutters, flower boxes, pipes, siding). Only what is drawn changes: collisions and saves are untouched. */
(function(){
 if(!window.FW_DEV||typeof THREE=='undefined'||typeof B!='function'||typeof HX=='undefined')return;
 let canopy=false,FW=null;
 function build(){
  if(!canopy&&typeof HX!='undefined')HX.children.forEach(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;
   if(p&&Math.abs(p.width-2.8)<.01&&Math.abs(p.height-.15)<.01&&Math.abs(p.depth-1)<.01&&Math.abs(m.position.x-6)<.05&&Math.abs(m.position.y-2.9)<.05){m.visible=false;canopy=true}});
  if(!FW&&typeof FRW!='undefined'&&FRW.visible&&typeof HXP!='undefined'&&HXP){FRW.children.forEach(c=>c.visible=false);const g=FW=new THREE.Group();FRW.add(g);const w='#d8c7a6',L=[];
   const b=(...a)=>{const m=B(g,...a);m.material=m.material.clone();m.material.transparent=true;L.push(m);return m};
   b(5,3,.3,w,2.5,1.5,12.15);b(9,3,.3,w,11.5,1.5,12.15);b(2,.6,.3,w,6,2.7,12.15);
   b(2,2.4,.15,'#5a3a22',6,1.2,12.15);/* inside face of the door */b(.2,2.4,.2,'#3a2412',4.9,1.2,12.05);b(.2,2.4,.2,'#3a2412',7.1,1.2,12.05);b(2.4,.12,.2,'#3a2412',6,2.45,12.05);
   [[5.58,1.78,.75],[6.42,1.78,.75],[5.58,.7,.8],[6.42,.7,.8]].forEach(q=>b(.75,q[2],.03,'#6b4a2e',q[0],q[1],12.06));b(.1,.1,.08,'#d9b44a',5.2,1.15,12.03);
   /* copy the outside detail on the front face (windows, frames, shutters, flower boxes, pipes, siding, door panels) */
   const v=new THREE.Vector3(),sk=new Set(L);HX.updateMatrixWorld(true);
   HX.traverse(m=>{if(!m.isMesh||!m.visible||!m.geometry||!m.geometry.parameters)return;let o=m;while(o&&o!==HX){if(!o.visible)return;o=o.parent}
    m.getWorldPosition(v);const p=m.geometry.parameters;if(v.z<12.2||v.z>13.2||v.y>3.1||v.x<-.6||v.x>16.6||p.width>=17)return;
    const c=m.clone();c.material=m.material.clone();c.material.transparent=true;m.matrixWorld.decompose(c.position,c.quaternion,c.scale);g.add(c);L.push(c)});
   g.userData.L=L}}
 function fade(dt){if(!FW||!FRW.visible)return;const near=P.z>8.2&&P.x>-.5&&P.x<16.5,t=near?.22:1,k=Math.min(1,(dt||.016)*6);
  FW.userData.L.forEach(m=>{const o=m.material.opacity+(t-m.material.opacity)*k;m.material.opacity=o;m.material.depthWrite=o>.95})}
 let t0=0;(function loop(t){requestAnimationFrame(loop);const dt=t0?Math.min(.1,(t-t0)/1000):.016;t0=t;try{if(!canopy||!FW)build();fade(dt)}catch(e){}})(0);
})();
