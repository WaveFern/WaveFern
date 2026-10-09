/* ---------- v24 upstairs redesign ---------- */
/* the new floor, unlocked with the third home. Plain empty rooms (no furniture) so the player can place their own. */
function buildAnnex(){const L=(S.home||0)>=3?1:0;if(ANX.lv==L)return;ANX.lv=L;if(ANX.idx==null){SHOPS.push({name:'Upstairs',cx:3,ox:900,ez:10});ANX.idx=SHOPS.length-1}
 ANX.ints.forEach(o=>{const i=INT.indexOf(o);if(i>=0)INT.splice(i,1)});ANX.ints=[];ANX.pets=[];ANX.tvs=[];
 (ANX.cw||[]).forEach(e=>{const i=wc.indexOf(e);if(i>=0)wc.splice(i,1)});ANX.cw=[];
 let G=IG[ANX.idx];if(!G){G=IG[ANX.idx]=new THREE.Group();WORLD.add(G)}G.clear();
 if(!L)return;
 const W=ANX.W=16,D=ANX.D=18,o=900,g=G,b=(w,h,d,c,x,y,z)=>B(g,w,h,d,c,o+x,y,320+z),cl=(a,c,e,f)=>{const q=[o+a,320+c,o+e,320+f];wc.push(q);ANX.cw.push(q)},add=a=>{INT.push(a);ANX.ints.push(a)};
 const WC='#d6cbb5',PC='#cbbf9f',fl=(x,z,w,d,c1,c2)=>{const m=new THREE.Mesh(geo(w,.2,d),tex(c1,c2,w,d));m.position.set(o+x+w/2,-.1,320+z+d/2);g.add(m)};
 const pw=(x0,z0,x1,z1)=>{if(z0==z1){b(x1-x0,1.1,.24,PC,(x0+x1)/2,.55,z0);b(x1-x0,.06,.3,'#8a7a62',(x0+x1)/2,1.13,z0);cl(x0,z0-.12,x1,z0+.12)}else{b(.24,1.1,z1-z0,PC,x0,.55,(z0+z1)/2);b(.3,.06,z1-z0,'#8a7a62',x0,1.13,(z0+z1)/2);cl(x0-.12,z0,x0+.12,z1)}};
 /* outer walls: full north/west, low front walls so you can see in */
 b(W,3.4,.3,WC,W/2,1.7,-.15);b(.3,3.4,D,WC,-.15,1.7,D/2);b(W,1.1,.2,WC,W/2,.55,D+.1);b(.2,1.1,D,WC,W+.1,.55,D/2);b(W,.06,.3,'#8a7a62',W/2,1.13,D+.1);b(.3,.06,D,'#8a7a62',W+.1,1.13,D/2);cl(-.3,0,0,D);cl(0,-.3,W,0);
 /* the floor, split into two plain rooms by a partition with a doorway */
 fl(0,0,W,D,'#c2ab88','#ad9672');
 pw(8,0,8,8);pw(8,10,8,D);
 /* stairs down: the high end is by the landing and the steps get lower going away from it, towards the living room */
 for(let i=0;i<5;i++)b(.6,.22*(5-i),2.2,i%2?'#9a8a74':'#a89882',W-3.6+i*.6,.11*(5-i),D-2.2);b(.1,1.4,2.3,'#6b4a2e',W-4.3,.9,D-2.2);add({x:o+W-5.2,z:320+D-2.2,r:1.7,l:'Go downstairs',a:goDown});cl(W-4.2,D-3.4,W-.2,D-1);
}
