/* WaveFern dev: airport car park cars look like the real in-game cars. Only loaded on /dev/. Add ?noparkedcars to skip it.
   The car parks used two plain boxes plus a window box per car. While the airport outside is being built, those boxes are
   dropped and the same bays get real cars (the same models and paint as traffic: hatch, sedan, pickup, sports, van, SUV...),
   in the traffic colours, nose toward the aisle, each slightly turned by a hair so rows do not look cloned. Collisions are untouched. */
(function(){
 if(!window.FW_DEV||/[?&]noparkedcars/.test(location.search)||typeof xgBox!='function'||typeof AP=='undefined'||typeof carb=='undefined')return;
 const COLS=['#e6b422','#3b82f6','#2f8f5a','#c0392b','#e8e8ec','#ff8a30','#8e44ad','#1a1a1a','#9aa0a6'],CZ=[46,-6];
 const near=(a,b)=>Math.abs(a-b)<.03;
 const x0=xgBox;
 xgBox=function(G,w,h,d,col,x,y,z,ry,tc){
  try{
   if(AP.og&&!AP.og.userData.pcDone&&x<-250&&x>-320){
    if(near(w,1.8)&&near(h,.7)&&near(d,3.9)&&near(y,.55)){
     const cz=Math.abs(z-CZ[0])<Math.abs(z-CZ[1])?CZ[0]:CZ[1],
      m=mkS(carb(RI(0,4),COLS[Math.floor(Math.random()*COLS.length)]));
     m.scale.setScalar(1.35);m.position.set(x,0,z);m.rotation.y=(z<cz?0:Math.PI)+(Math.random()-.5)*.06;AP.og.add(m);
     return;
    }
    if((near(w,1.6)&&near(h,.55)&&near(d,2)&&near(y,1.15))||(near(w,1.62)&&near(h,.4)&&near(d,1.95)&&near(y,1.1)))return;
   }
  }catch(e){console.warn('dev parked cars',e)}
  return x0.call(this,G,w,h,d,col,x,y,z,ry,tc)};
})();
