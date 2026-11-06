/* ===== v49.84.0: Threadz and the Gphone store get their own buildings in the main city =====
   Threadz used to be a boutique inside Nova Mall and there was no Gphone store at all. Both are now stand-alone shops on
   the City Cafe's street row (same method as the Barbershop, 90-barbershop.js): each takes a free tower on that row,
   gets a proper door and fascia sign, a room of its own, and a pin on the world map. The mall boutique is renamed. */
const CBS=[
 {k:'threadz',nm:'Threadz',sg:'THREADZ',col:'#e84a8a',ox:-1200,poi:'Threadz',pc:'#ff6ab0',
  keep:{hair:13,hc:5,eyes:6,mouth:4,top:5,tc:4,pc:6,skin:1,body:.4},kn:'Sasha (stylist)',
  say:'Sasha: "Welcome to Threadz. Buy a piece once on the Threadz site on your laptop and wear it in 24 colours from the wardrobe at home."',
  room:{fl:['tile','#f4eef2','#e6dce4'],wl:['plaster','#f6eef2','#e8dbe3'],tr:'#7a2447',wa:'#7a2447',fw:'#7a2447',mat:'#e84a8a',sign:['THREADZ','#ffffff','#e84a8a',3.2,.5,2.72,5,{border:'#ffffff'}],lights:[[2.2,3.2],[7.8,3.2],[5,6,.5]],lc:0xfff0f6,
   build(b,cl){
    ixCounter(b,cl,5,3.2,2.6,.9,'#7a2447','#f4f4f4');b(.4,.26,.36,'#333',5.7,1.19,3.2);b(.32,.14,.02,'*7fd0ff',5.7,1.29,3.01);
    [2,8].forEach((x,k)=>{b(1.8,.04,.04,'#888',x,1.7,.5);[-.9,.9].forEach(s=>b(.04,1.7,.04,'#888',x+s,.85,.5));for(let j=0;j<7;j++)b(.18,.8,.36,['#e84a8a','#2a2a2a','#4a90d9','#f4f4f4','#ffe066','#9b59b6','#2fe68a'][(j+k*3)%7],x-.75+j*.25,1.25,.5);cl(x-1,.2,x+1,.8)});
    [[.7,5.2],[9.3,5.2]].forEach((q,k)=>{b(.7,.12,.7,'#2a2a2a',q[0],.06,q[1]);b(.06,.5,.06,'#888',q[0],.37,q[1]);b(.44,.5,.26,['#e84a8a','#2a2a2a'][k],q[0],.9,q[1]);b(.4,.6,.24,['#2a2a2a','#c9a227'][k],q[0],1.45,q[1]);b(.24,.26,.24,'#e8d8c8',q[0],1.98,q[1]);cl(q[0]-.4,q[1]-.4,q[0]+.4,q[1]+.4)});
    b(3,.9,1,'#ffffff',2.4,.45,6.8);b(3.1,.05,1.1,'#c9a227',2.4,.92,6.8);for(let i=0;i<6;i++){b(.3,.12,.16,['#f4f4f4','#2a2a2a','#e84a8a','#c9a227','#4a90d9','#8a5a36'][i],1.3+i*.42,1.01,6.7)}cl(.85,6.3,3.95,7.3);
    b(1.4,.04,1.4,'#888',8,1.4,6.8);b(.06,1.4,.06,'#888',8,.7,6.8);for(let a=0;a<10;a++){const an=a*Math.PI/5;b(.2,.62,.2,['#e84a8a','#4a90d9','#ffe066','#2fe68a','#9b59b6','#e74c3c','#f4f4f4','#2a2a2a','#ff7a3a','#4ad9c0'][a],8+Math.cos(an)*.62,1.08,6.8+Math.sin(an)*.62)}cl(7.25,6.05,8.75,7.55);
    ixPlant(b,cl,9.3,2.2,.9,'#7a2447');ixPend(b,5,5.6,'*ffe9f2','#7a2447',2.4)}}},
 {k:'gphone',nm:'Gphone Store',sg:'GPHONE',col:'#4a90d9',ox:-1300,poi:'Gphone Store',pc:'#6ab0ff',
  keep:{hair:16,hc:0,eyes:5,mouth:3,top:2,tc:0,pc:4,skin:3,body:.5},kn:'Ben (phone seller)',
  say:'Ben: "Gphone 9 to 18 are sold on the Gphone site on your laptop. A newer phone takes sharper photos. Press G to use yours."',
  room:{fl:['tile','#eef2f6','#dfe6ee'],wl:['plaster','#f2f5f8','#e3eaf1'],tr:'#1f3a6a',wa:'#1f3a6a',fw:'#1f3a6a',mat:'#4a90d9',sign:['GPHONE','#ffffff','#4a90d9',3.2,.5,2.72,5,{border:'#ffffff'}],lights:[[2.2,3.2],[7.8,3.2],[5,6,.5]],lc:0xf0f6ff,
   build(b,cl){
    ixCounter(b,cl,5,3.2,2.6,.9,'#1f3a6a','#f4f4f4');b(.4,.26,.36,'#333',5.7,1.19,3.2);b(.32,.14,.02,'*7fd0ff',5.7,1.29,3.01);
    b(8,1.6,.05,'#111',5,1.8,.04);for(let i=0;i<8;i++){b(.7,1.1,.03,'*'+['3a6a9a','6a3a9a','2fa86a','c05a2a','e84a8a','4a90d9','ffe066','4ad9c0'][i],1+i*.9,1.8,.08)}
    [[2,5.8],[5,6.6],[8,5.8]].forEach((q,i)=>{b(2,.86,1,'#d9d9de',q[0],.43,q[1]);b(2.1,.06,1.1,'#f4f4f4',q[0],.89,q[1]);for(let j=0;j<4;j++){b(.34,.04,.2,'#222',q[0]-.72+j*.48,.94,q[1]);b(.3,.02,.16,'*'+['7fc8ff','ffd27a','c8b0ff','9fe0b0'][(i+j)%4],q[0]-.72+j*.48,.96,q[1])}cl(q[0]-1.1,q[1]-.55,q[0]+1.1,q[1]+.55)});
    b(.3,.3,.3,'#4a90d9',9.3,.15,2.4);b(.3,.3,.3,'#e84a8a',9.3,.45,2.4);cl(9,2.1,9.6,2.7);
    ixPlant(b,cl,.7,2.2,.9,'#1f3a6a');ixPend(b,5,5.6,'*e8f2ff','#1f3a6a',2.4)}}}
];
{const bv=buildVenues;buildVenues=function(){bv();CBS.forEach(c=>{try{SHOPS.push({name:c.nm,cx:541,ox:c.ox,ez:72});c.i=SHOPS.length-1;
 interior(c.i,['#f0f0f0','#1a1a1a'],'#2a6ab5',[],[],c.keep,c.kn,()=>say(c.say));ixRoom(c.i,c.room);
 const g=new THREE.Mesh(geo(40,.1,30),new THREE.MeshLambertMaterial({color:'#1c2026'}));g.position.set(c.ox+5,-.25,324);WORLD.add(g)}catch(e){console.error('city brand store',e)}})}}
/* doors: nearest free towers on the City Cafe's row (the Barbershop picks first) */
{const sd0=shopDoors;shopDoors=function(){sd0();const cf=SHOPT.cafe;if(!cf)return;
 CBS.forEach(S=>{if(S.door||S.i==null)return;const ccx=(cf.x0+cf.x1)/2,
  L=BARBT.filter(q=>q.z0==22&&q.c!==cf&&!q.c.door&&!q.c.sign&&!(q.z0==-37&&[534,574,614].includes(q.x0))).sort((a,b)=>Math.abs((a.c.x0+a.c.x1)/2-ccx)-Math.abs((b.c.x0+b.c.x1)/2-ccx));
  const c=L.length?L[0].c:null;if(!c)return;S.door=1;c.door=1;const cx=(c.x0+c.x1)/2,fz=c.z1;
  for(const q in SBC){const A=SBC[q];for(let j=A.length-1;j>=0;j--){const e=A[j];if(e[3]=='#2a1f1a'&&Math.abs(e[0]-2)<.01&&Math.abs(e[1]-1.8)<.01&&Math.abs(e[4]-cx)<1.5)A.splice(j,1)}}
  SB(2,1.8,.1,'#2a1f1a',cx,.9,fz+.05);SB(.9,1.5,.02,'#9ad0f0',cx-.45,.95,fz+.11);c.sign=S.sg;
  const s=SHOPS[S.i];s.cx=cx;s.ez=fz+1.6;INT.push({x:cx,z:fz+1.4,r:1.6,l:'Enter '+S.nm,a:()=>enterShop(S.i)});POIS.push([cx,fz+5,S.poi,S.pc])})}}
