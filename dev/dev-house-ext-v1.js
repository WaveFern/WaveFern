/* ===== dev only: the outside of the house, upper levels and back wing match the ground floor =====
   The ground floor already has siding lines, shutters, drainpipes and a front door (dev-models-v2.js). This adds the same
   to the second storey (once the upstairs is unlocked) and to the east wall of the back wing:
   - siding lines on the upper front and east walls, and on the east wall of the expanded wing
   - shutters on every upper window, and on the wing windows
   - the drainpipes run up the full height, with a bracket at the storey band
   - a small iron balcony rail in front of the upper middle window, to echo the door canopy below
   Plain boxes only, added under HX so they hide with the front and east walls. Nothing here changes collisions or saves. */
(function(){
 if(typeof homeExt!='function'||typeof HX=='undefined'||typeof B!='function')return;
 let HE=null;
 const tr='#f4efe6',sid='#c9b790',pipe='#9aa0a6';
 function dress(){
  if(HE)HX.remove(HE);
  const n=(S.home||0)>=3?2:1,zN=-(WGX||0),D=12-zN,cz=(zN+12)/2;
  const g=HE=new THREE.Group();g.name='devHouseExt';g.userData.k=n+'|'+zN;HX.add(g);
  const shut=(x,y,z,f)=>{const sx=f?.07:.44,sz=f?.44:.07;B(g,sx,1.25,sz,'#3e6b57',x,y,z);for(let i=0;i<4;i++)B(g,f?.09:.36,.03,f?.36:.09,'#2f5545',x,y-.35+i*.25,z)};
  /* the wing's east wall (z<0) gets the same siding and shutters as the main house */
  if(zN<0){for(let k=0;k<8;k++)B(g,.02,.04,-zN,sid,16.311,.5+k*.3,zN/2);
   [-2,-4].forEach(z=>[-1,1].forEach(s=>shut(16.42,1.7,z+s*1.5,1)))}
  if(n<2)return;
  /* second storey */
  for(let k=0;k<8;k++){const y=3.5+k*.3;B(g,16.2,.04,.02,sid,8,y,12.311);B(g,.02,.04,D,sid,16.311,y,cz)}
  [2.5,6,10.5,13.5].forEach(x=>[-1,1].forEach(s=>shut(x+s*1.25,4.6,12.42,0)));
  for(let z=zN+2.5;z<11.5;z+=3.5)[-1,1].forEach(s=>shut(16.42,4.6,z+s*1.25,1));
  [.45,15.55].forEach(x=>{B(g,.1,3.2,.1,pipe,x,4.6,12.5);B(g,.16,.08,.16,pipe,x,3.05,12.5)});
  /* balcony rail in front of the middle window */
  B(g,2.2,.06,.06,'#2a2a2e',6,4.15,12.85);B(g,2.2,.04,.04,'#2a2a2e',6,3.75,12.85);
  for(let i=0;i<=8;i++)B(g,.03,.4,.03,'#2a2a2e',5+i*.25,3.95,12.85);
  [-1,1].forEach(s=>B(g,.04,.4,.5,'#2a2a2e',6+s*1.1,3.95,12.6));
  B(g,2.4,.08,.9,'#8a8f94',6,3.7,12.6)}
 const he=homeExt;
 homeExt=function(force){const r=he.apply(this,arguments);
  try{const n=(S.home||0)>=3?2:1,key=n+'|'+(-(WGX||0));if(!HE||HE.userData.k!==key||!HE.parent||(HXP&&HXP.userData.k===key&&HE.userData.p!==HXP)){dress();HE.userData.p=HXP}}catch(e){console.error('dev house outside',e)}
  return r};
 try{homeExt(1)}catch(e){console.error('dev house outside',e)}
})();
