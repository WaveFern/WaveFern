/* ===== v26.18: Polly Parrot flies instead of walking ===== */
/* The parrot hovers at about head height, bobs up and down, flaps its wings and follows you through the air.
   At home it flies between spots and only folds its wings when it settles on a perch, cat tree, bed or bowl.
   Parrots out with people in the city fly next to them too. */
const isParrot=g=>{if(!g||!g.children||g.children.length<10)return false;const c=(i,h)=>{const m=g.children[i]&&g.children[i].material;return!!(m&&m.color&&m.color.getHexString()==h)};return c(0,'2ecc71')&&c(3,'e74c3c')};
/* put each wing on a pivot at its shoulder so it can swing out and flap */
function parrotRig(g){if(g.userData.pw)return g.userData.pw;const w=[g.children[1],g.children[2]],pv=w.map(m=>{const p=new THREE.Group();p.position.set(m.position.x,m.position.y+.17,m.position.z);g.add(p);m.position.set(0,-.17,0);p.add(m);return p});
 g.rotation.order='YXZ';g.userData.pw={pv,ph:Math.random()*6,ph0:Math.random()*6,lx:null,lz:null,h:0};return g.userData.pw}
/* fly 1 = flying, 0 = landed with wings folded. baseY is the landed height, hy the flying height. Eases between the two. */
function parrotPose(g,dt,fly,baseY,hy){const r=parrotRig(g),p=g.position,sp=r.lx==null?0:Math.hypot(p.x-r.lx,p.z-r.lz)/Math.max(dt,1e-3);r.lx=p.x;r.lz=p.z;
 r.h+=((fly?1:0)-r.h)*Math.min(1,dt*4);
 r.ph+=dt*(fly?(sp>.4?17:12):3);const flap=r.h*(1.15+Math.sin(r.ph)*.75);r.pv[0].rotation.z=-flap;r.pv[1].rotation.z=flap;
 const H=hy+Math.sin(r.ph*.17+r.ph0)*.12+Math.sin(r.ph*.07)*.05;p.y=baseY+r.h*(H-baseY);g.rotation.x=r.h*Math.min(.35,sp*.06)}
/* rig the parrot every time the companions are rebuilt */
{const s0=syncF;syncF=function(){s0.apply(this,arguments);FOL.forEach(f=>{if(isParrot(f.m)){f.fly=1;parrotRig(f.m)}})}}
let PARROT_T=0;
{const w0=worldTick;worldTick=function(dt){w0(dt);PARROT_T+=dt;
 FOL.forEach((f,j)=>{if(!f.fly||!f.m.visible)return;const g=f.m,r=parrotRig(g);
  if(f.home){/* petUse has placed it; it lands only while it sits still on a pet item */
   const items=typeof PL!='undefined'&&typeof PETF!='undefined'&&PL.some(q=>PETF[q.t]),still=r.lx!=null&&Math.hypot(g.position.x-r.lx,g.position.z-r.lz)<.002;
   parrotPose(g,dt,!(items&&still),g.position.y,1.25)}
  else{/* following you: drift gently around its spot beside your head */
   g.position.x+=Math.sin(PARROT_T*.8+j)*.25;g.position.z+=Math.cos(PARROT_T*.6+j)*.15;parrotPose(g,dt,1,0,1.5)}});
 if(typeof NPC!='undefined')NPC.forEach(n=>{const g=n.pet;if(!g||!g.visible)return;if(g.userData.np==null)g.userData.np=isParrot(g)?1:0;if(g.userData.np)parrotPose(g,dt,1,0,1.6)})}}
