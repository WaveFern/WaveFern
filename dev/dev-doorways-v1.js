/* ===== dev only: wider doorways on the upstairs floor =====
   The old openings between the four upstairs rooms were 2 m wide, and one of them only 1 m, so the player and followers
   caught on the edges. Every opening is now 3 m wide (the downstairs front door is 2.4 m). The half-height partitions and
   their caps are rebuilt with the new gaps and the matching collision boxes replace the old ones. Nothing else changes. */
(function(){
 if(!window.FW_FEAT||typeof THREE=='undefined'||typeof B!='function'||typeof buildAnnex!='function'||typeof ANX=='undefined')return;
 const o=900,zb=320;
 /* partitions as [x0,z0,x1,z1]: wall at x=8 and at z=9, with 3 m gaps centred on the old doorways */
 const SEG=[[8,0,8,3.5],[8,6.5,8,13],[8,16,8,18],[0,9,2.5,9],[5.5,9,8,9],[8,9,11,9],[14,9,16,9]];
 const near=(a,b)=>Math.abs(a-b)<.06;
 function isPart(m,D){const p=m.isMesh&&m.geometry&&m.geometry.parameters;if(!p)return false;
  const wallH=near(p.height,1.1),capH=near(p.height,.06);
  if(wallH&&near(p.depth,.24)&&p.width>.5&&near(m.position.z,zb+9))return true;      /* z=9 wall */
  if(wallH&&near(p.width,.24)&&near(m.position.x,o+8))return true;                    /* x=8 wall */
  if(capH&&near(p.depth,.3)&&p.width>.5&&near(m.position.z,zb+9))return true;
  if(capH&&near(p.width,.3)&&near(m.position.x,o+8))return true;
  return false}
 function widen(){
  if(ANX.lv<1||!IG[ANX.idx])return;const G=IG[ANX.idx];if(G.userData.wide)return;G.userData.wide=1;
  G.children.slice().forEach(m=>{if(isPart(m)){G.remove(m)}});
  /* drop the old interior colliders (the outer walls and the stairwell stay) */
  const old=[[o+8-.12,zb,o+8+.12,zb+4],[o+8-.12,zb+6,o+8+.12,zb+13.5],[o+8-.12,zb+15.5,o+8+.12,zb+ANX.D],
   [o,zb+9-.12,o+3,zb+9+.12],[o+5,zb+9-.12,o+8,zb+9+.12],[o+8,zb+9-.12,o+12,zb+9+.12],[o+13,zb+9-.12,o+16,zb+9+.12]];
  old.forEach(q=>{const i=ANX.cw.findIndex(e=>e.every((v,k)=>near(v,q[k])));if(i>=0){const e=ANX.cw[i];ANX.cw.splice(i,1);const j=wc.indexOf(e);if(j>=0)wc.splice(j,1)}});
  const b=(w,h,d,c,x,y,z)=>B(G,w,h,d,c,o+x,y,zb+z),cl=(a,c,e,f)=>{const q=[o+a,zb+c,o+e,zb+f];wc.push(q);ANX.cw.push(q)};
  SEG.forEach(([x0,z0,x1,z1])=>{
   if(z0==z1){b(x1-x0,1.1,.24,'#cbbf9f',(x0+x1)/2,.55,z0);b(x1-x0,.06,.3,'#8a7a62',(x0+x1)/2,1.13,z0);cl(x0,z0-.12,x1,z0+.12)}
   else{b(.24,1.1,z1-z0,'#cbbf9f',x0,.55,(z0+z1)/2);b(.3,.06,z1-z0,'#8a7a62',x0,1.13,(z0+z1)/2);cl(x0-.12,z0,x0+.12,z1)}})}
 const ba=buildAnnex;buildAnnex=function(){const lv=ANX.lv,r=ba.apply(this,arguments);try{if(ANX.lv!==lv&&IG[ANX.idx])IG[ANX.idx].userData.wide=0;widen()}catch(e){console.error('wider doorways',e)}return r};
 const wt=typeof worldTick=='function'?worldTick:null;if(wt)worldTick=function(){wt.apply(this,arguments);try{widen()}catch(e){}};
})();
