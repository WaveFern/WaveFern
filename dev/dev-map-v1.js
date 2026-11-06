/* ===== dev only: map tidy-up ("map v1") =====
   - The farm (fields, barn, silo) is no longer drawn on the world map or the minimap. (The 3D farm itself is left out in dev-christmas-v1.js.)
   - The airport is drawn properly on the map: a runway with edge lines, dashes, threshold stripes and numbers, a yellow taxi line,
     an apron with panel joints and parked jets, the terminal with its glazed roof, fins, coral edge and gate piers, the forecourt,
     taxi rank and bus stop, striped car parks with cars, the hangar, the tower and the planting, with a "Fernfield International" tag.
   Only drawn on the maps (mapPaint). Nothing in the world, the saves or the collisions changes. Only loaded on /dev/. Add ?nomapfix to skip it. */
(function(){
 if(!window.FW_DEV||/[?&]nomapfix/.test(location.search))return;
 if(typeof mapPaint!='function')return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev map '+t,e)}}};
 let farmGone=0;
 /* the farm's rectangles in the map's area list (stripes of field, the barn and the silo), found by where they sit */
 function dropFarm(){
  if(farmGone||typeof CTD=='undefined'||!CTD.areas||!CTD.areas.length||typeof WX!='function')return;
  const x0=WX(-236),x1=WX(-134),z0=WZ(-128),z1=WZ(-42);
  CTD.areas=CTD.areas.filter(a=>!(a[0]>=x0&&a[2]<=x1&&a[1]>=z0&&a[3]<=z1));
  farmGone=1}

 /* ---------- the airport ---------- */
 const OUT={x0:-400,x1:-330,z0:-40,z1:80};
 const NAVY='#0b2a5b',CORAL='#ff6b4a',GLASS='#8cc4ef',CONC='#a9adb3',JOINT='#8f949b';
 function airport(x,sx,sz,kx,kz,mini){
  const Z=Math.round;
  if(sx(-200)<-20||sx(-620)>x.canvas.width+20)return;
  const R=(a,b,c,d,col)=>{const X=Z(sx(a)),Y=Z(sz(b)),X2=Z(sx(c)),Y2=Z(sz(d));x.fillStyle=col;x.fillRect(X,Y,Math.max(1,X2-X),Math.max(1,Y2-Y))};
  const fine=kx>=.7&&!mini,mid=kx>=.4;
  /* apron: concrete with panel joints, a yellow taxi line along the runway side, stand lines from each jet */
  R(-470,92,-250,132,CONC);
  if(mid){for(let a=-470;a<=-250;a+=20)R(a,92,a+.5,132,JOINT);for(let b=92;b<=132;b+=20)R(-470,b,-250,b+.5,JOINT)}
  R(-470,132.2,-250,133,'#f2c94c');
  /* runway: asphalt, white edges, centre dashes, piano-key thresholds at both ends, numbers */
  R(-600,134,-200,158,'#2b2e33');R(-600,134.5,-200,135.3,'#e9e9e9');R(-600,156.7,-200,157.5,'#e9e9e9');
  for(let a=-570;a<-224;a+=16)R(a,145.7,a+9,146.4,'#f2f2f2');
  if(mid)[[-598,1],[-212,-1]].forEach(([a,s])=>{for(let b=137;b<=155;b+=2.6)R(s>0?a:a-1.2,b,s>0?a+10:a+9,b+1.3,'#f2f2f2')});
  /* connectors from the runway to the apron and the hangar road */
  [[-420],[-385],[-350],[-315]].forEach(([a])=>R(a-.3,118,a+.3,134,'#f2c94c'));
  if(!fine){/* the terminal and the rest are simple on the minimap and when zoomed far out */
   R(OUT.x0,OUT.z0,OUT.x1,OUT.z1,'#e9edf2');R(-392,-30,-338,70,GLASS);R(-332,OUT.z0,OUT.x1,OUT.z1,CORAL);
   x.strokeStyle=NAVY;x.lineWidth=1;x.strokeRect(sx(OUT.x0),sz(OUT.z0),(OUT.x1-OUT.x0)*kx,(OUT.z1-OUT.z0)*kz);return}
  /* hangar: steel roof with ridges, navy front */
  R(-476,94,-434,132,'#00000030');
  R(-478,92,-436,130,'#8d98a6');for(let a=-477;a<-437;a+=2.5)R(a,92,a+1.25,130,((a+477)/2.5|0)%2?'#c7ced8':'#b6bfcb');
  R(-478,128.4,-436,130,NAVY);R(-478,92,-436,92.8,'#556070');
  /* car parks: bays, painted lines, parked cars */
  [[46,33,59],[-6,-19,7]].forEach(([cz,z0,z1],r)=>{
   R(-299,z0,-265,z1,'#4a4d54');
   for(let a=-297;a<=-267;a+=3.4){R(a,cz-9,a+.35,cz-4,'#e8e8e8');R(a,cz+4,a+.35,cz+9,'#e8e8e8')}
   R(-299,cz-.3,-265,cz+.3,'#6a6d74');
   const cc=['#c0392b','#2d5a8d','#e8e8ec','#2f8f5a','#1d1d22','#e6b422'];
   for(let i=0;i<14;i++){const h=(i*7+r*5)%11;if(h<4)continue;const a=-296+(i%9)*3.4,b=i<9?cz-8.6:cz+4.4;R(a,b,a+1.8,b+3.9,cc[(i+r*2)%6]);R(a+.25,b+.8,a+1.55,b+2.2,'#1b2533')}
  });
  /* forecourt: drop-off lane, taxi rank, bus stop, planting beds */
  R(-330,-11,-300,51,'#cfc9bc');R(-316,-8,-315.5,48,'#ffffff');
  R(-308,5,-301,14,'#f2c94c');R(-304,28,-297,36,'#2d5a8d');R(-303,29,-298,35,'#4f86c6');
  [[-328,-8],[-328,44],[-312,-8],[-312,44]].forEach(([a,b])=>{R(a,b,a+4,b+5,'#3f7a45');R(a+.8,b+.8,a+3.2,b+4.2,'#58b05a')});
  /* road in from the city gets a centre line */
  for(let a=-298;a<-140;a+=7)R(a,19.6,a+3.5,20.2,'#e8d9a0');
  /* terminal: drop shadow, roof, glazed barrel-vault atrium with white fins, solar panels, stepped canopy, coral edge, gate piers */
  R(OUT.x0+2,OUT.z0+2,OUT.x1+3,OUT.z1+3,'#00000038');
  R(OUT.x0,OUT.z0,OUT.x1,OUT.z1,'#e9edf2');
  R(-394,-32,-336,72,'#c9d3de');R(-390,-28,-340,68,GLASS);R(-367,-28,-363,68,'#5fa3d9');
  for(let b=-24;b<=64;b+=6)R(-390,b,-340,b+.9,'#ffffff');
  [[-398,-34],[-398,-22],[-398,56],[-398,66]].forEach(([a,b])=>R(a,b,a+5,b+7,'#2a4a78'));
  R(-332,OUT.z0,OUT.x1,OUT.z1,CORAL);
  R(-336,4,-330,38,'#f4f6f9');R(-336,4,-335,38,CORAL);
  [-380,-360,-340].forEach(a=>{R(a-2,80,a+2,92,'#c7ccd3');R(a-2,80,a-1.4,92,'#9aa1aa')});
  x.strokeStyle=NAVY;x.lineWidth=1.5;x.strokeRect(sx(OUT.x0),sz(OUT.z0),(OUT.x1-OUT.x0)*kx,(OUT.z1-OUT.z0)*kz);
  /* jets on the stands, nose to the east: shadow, fuselage, wings, tail */
  [-420,-385,-350,-315].forEach((a,i)=>{const b=110;
   R(a-8,b-.2,a+10,b+2.4,'#00000028');R(a-1,b-7,a+4,b+9.7,'#00000028');
   R(a-9,b-1.1,a+9,b+1.1,'#ffffff');R(a+9,b-.7,a+10.5,b+.7,'#ffffff');
   R(a-2,b-8.5,a+3,b-1.1,'#dfe4ea');R(a-2,b+1.1,a+3,b+8.5,'#dfe4ea');
   R(a-9,b-3.2,a-6,b-1.1,'#dfe4ea');R(a-9,b+1.1,a-6,b+3.2,'#dfe4ea');
   R(a-9,b-1.1,a-6.5,b+1.1,i%2?'#ffd84a':CORAL);
   R(a+5,b-.5,a+8,b+.5,'#2a3a52')});
  /* control tower: footing, shaft, glass cab */
  R(-286,104,-278,112,'#4a5868');R(-284.5,105.5,-279.5,110.5,'#e4e8ee');R(-283.5,106.5,-280.5,109.5,'#7fd4ff');
  /* fence along the airfield */
  R(-346,91.6,-250,92.4,'#6b7078');R(-250.4,92,-249.6,168,'#6b7078');
  /* tag */
  x.save();x.font='bold '+Math.max(10,Math.min(13,kx*10))+'px monospace';x.textAlign='center';x.textBaseline='middle';
  const t='FERNFIELD INTL',w=x.measureText(t).width+34,cx=sx((OUT.x0+OUT.x1)/2),cy=sz(-14),h=22;
  x.fillStyle='#000a';x.fillRect(Z(cx-w/2)+2,Z(cy-h/2)+2,Z(w),h);
  x.fillStyle=NAVY;x.fillRect(Z(cx-w/2),Z(cy-h/2),Z(w),h);x.fillStyle=CORAL;x.fillRect(Z(cx-w/2),Z(cy+h/2)-3,Z(w),3);
  x.fillStyle='#ffd84a';x.fillText(t,cx+8,cy-1);
  /* a tiny jet icon in the tag */
  const jx=Z(cx-w/2+11),jy=Z(cy-2);x.fillStyle='#fff';x.fillRect(jx-6,jy-1,12,2);x.fillRect(jx-1,jy-5,2,10);x.fillRect(jx-6,jy-3,2,2);x.fillRect(jx-6,jy+1,2,2);
  x.font='bold 10px monospace';x.lineWidth=3;x.strokeStyle='#2b2e33';x.strokeText('RUNWAY 09 / 27',sx(-400),sz(146));x.fillStyle='#fff';x.fillText('RUNWAY 09 / 27',sx(-400),sz(146));
  x.restore();
 }

 const m0=mapPaint;
 mapPaint=function(x,sx,sz,kx,kz,mini){
  safe(dropFarm,'farm');
  m0(x,sx,sz,kx,kz,mini);
  safe(()=>airport(x,sx,sz,kx,kz,mini),'airport')};
})();
