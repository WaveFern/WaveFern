/* ===== v26.26.2: Skyline Tower's door stood on the pavement, away from the building =====
   Skyline Tower is built in layout coordinates (21-v7...js buildTower). The road warp (31-wide-roads.js) first trims its front
   back to the pavement edge (the lot poked into the pavement of the road in front) and then widens the roads. The door, the
   SKYLINE TOWER sign and the way in are thin pieces that only slide with the warp, so after v26.11.0 they ended up about 2 m in
   front of the facade, with the entrance out on the road. Once the warp has run, they are put back on the real facade. */
const skyTower=()=>{const X=WX(597);return CT.find(c=>c.h==40&&c.x0<X&&c.x1>X)};
function skyDoorFix(){const c=skyTower();if(!c||c.door)return;const cx=(c.x0+c.x1)/2,fz=c.z1;c.door=1;
 /* the old door box (2.4 x 2.6) out on the pavement */
 for(const k in SBC){const L=SBC[k];for(let j=L.length-1;j>=0;j--){const e=L[j];if(e[3]=='#2a1f1a'&&Math.abs(e[0]-2.4)<.01&&Math.abs(e[1]-2.6)<.01&&Math.abs(e[4]-cx)<1.5)L.splice(j,1)}}
 /* a door on the facade, under the shop-front canopy; 38-city-detail.js cdTower picks it up so it fades with the tower */
 SB(2.2,1.9,.1,'#2a1f1a',cx,.95,fz+.05);c.sign='ENTRANCE';
 WORLD.children.forEach(o=>{if(o.isSprite&&Math.abs(o.position.x-cx)<1.5&&Math.abs(o.position.y-4)<.01&&o.position.z>fz-1&&o.position.z<fz+6)o.position.z=fz+.3});
 INT.forEach(q=>{if(q.l=='Enter Skyline Tower'){q.x=cx;q.z=fz+1.4}});
 const s=SHOPS[7];if(s&&s.name=='Skyline Tower'){s.cx=cx;s.ez=fz+1.6}
 POIS.forEach(p=>{if(p[2]=='Skyline Tower'){p[0]=cx;p[1]=fz+4}})}
/* a tower can carry its own shop-front sign (c.sign) instead of a random one */
if(typeof cdTower=='function'){const c0=cdTower;cdTower=function(c){const n=SGN.q.length;c0(c);if(c.sign&&SGN.q.length>n){const q=SGN.q[SGN.q.length-1];q[0]=sgnRow(c.sign);q[5]=sgnW(c.sign,q[6])}}}
{const f=flushSB;flushSB=function(){warpWorld();try{skyDoorFix()}catch(e){console.error('skyDoorFix',e)}f()}}
