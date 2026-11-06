/* WaveFern dev: footsteps change with the surface. Only loaded on /dev/ (see dev/index.html); the live game is untouched.
   Add ?nofootsteps to the address to skip it.
   - snow: a soft crunch with a squeak (outdoors while it is snowing, not in hot-climate cities)
   - floorboards: a hollow wooden knock with a rare creak (your house and every other interior)
   - concrete: a tight hard tick (roads and pavements, city streets abroad)
   - grass: a muffled soft swish (everywhere else outdoors)
   All sounds are synthesised live, quiet, and still follow the Footsteps and sound-effect settings (OPT.steps, FX, volume). */
(function(){
 if(!window.FW_DEV||/[?&]nofootsteps/.test(location.search))return;
 if(typeof stepSnd!='function'||typeof sdNz!='function'||typeof sdHit!='function'||typeof STP!='object')return;
 const warn=(t,e)=>{if(!warn[t]){warn[t]=1;console.warn('dev footsteps '+t,e)}};
 const D=window.DCITY;
 const hot=()=>{try{const C=D&&D.C;return !!(D&&D.on&&C&&(['la','mia','mex','rio','sao','bue','col','bcn','rom','lag','jnb','cpt','cai','ken','mar','mum','dxb','bkk','idn','syd','mel','nzl'].includes(D.id)||C.s.palm||C.s.desert))}catch(e){return false}};
 const indoors=()=>{try{
  if(typeof IN!='undefined'&&IN)return true;
  if(typeof INTERIOR_Z=='number'&&P.z>=INTERIOR_Z)return true;
  if(typeof wxHouse=='function'){const h=wxHouse();if(P.x>h[0]&&P.x<h[2]&&P.z>h[1]&&P.z<h[3])return true}
 }catch(e){}return false};
 const onRoad=()=>{try{
  const m=(typeof PAVE=='number'?PAVE:1.2)+.3;
  if(typeof ROADS!='undefined'&&ROADS.some(r=>P.x>r[0]-m&&P.x<r[2]+m&&P.z>r[1]-m&&P.z<r[3]+m))return true;
  if(D&&D.on&&D.inCity&&D.inCity())return true;
 }catch(e){}return false};
 const snowy=()=>{try{return !!(S&&S.wx&&S.wx.k=='snow'&&S.wx.d===S.day&&!hot())}catch(e){return false}};
 function surface(){
  if(indoors())return 'wood';
  if(snowy())return 'snow';
  if(onRoad())return 'concrete';
  return 'grass'}
 window.FW_SURFACE=surface;
 const SND_={
  /* hard, tight: a short click on the heel with a thin scuff */
  concrete:(v,pn,run)=>{
   sdNz(.04,2300+R(0,500),.15*v,{q:1.1,ty:'bandpass',pan:pn});
   sdHit(110,.045,.05*v,[[1,1,1]],{jit:.06,lp:350});
   sdNz(.02,5200+R(0,700),.02*v,{ty:'highpass',del:.03+R(0,.015),pan:pn})},
  /* soft, muffled: a low swish of blades with almost no click */
  grass:(v,pn,run)=>{
   sdNz(.11,900+R(0,300),.12*v,{q:.5,ty:'lowpass',pan:pn,sw:.3});
   sdNz(.07,3400+R(0,800),.035*v,{q:.5,ty:'bandpass',del:.015,pan:pn,sw:.35});
   sdHit(80,.05,.04*v,[[1,1,1]],{jit:.08,lp:300})},
  /* crunch: several tiny grains of high noise, then a faint low squeak */
  snow:(v,pn,run)=>{
   const n=3+(Math.random()*3|0);let d=0;
   for(let i=0;i<n;i++){sdNz(.025+R(0,.02),3200+R(0,2600),.085*v,{q:2.2+R(0,1.5),ty:'bandpass',del:d,pan:pn+R(-.05,.05)});d+=.012+R(0,.02)}
   sdNz(.09,500,.07*v,{ty:'lowpass',pan:pn,q:.6});
   if(Math.random()<.35)sdHit(1500+R(0,500),.05,.012*v,[[1,1,1]],{del:.02,bend:-.15,jit:.03,pan:pn})},
  /* hollow wood: a knock with a woody body, and a rare small creak */
  wood:(v,pn,run)=>{
   sdHit(170+R(0,30),.09,.11*v,[[1,1,1],[2.3,.35,.6],[3.8,.12,.35]],{jit:.04,bend:.12,lp:1400,pan:pn});
   sdNz(.03,900+R(0,200),.1*v,{q:1.2,ty:'bandpass',pan:pn});
   sdNz(.02,2600+R(0,500),.02*v,{q:1.3,del:.03,pan:pn});
   if(Math.random()<.12)sdHit(310+R(0,90),.14,.012*v,[[1,1,1],[1.5,.3,.5]],{del:.04,bend:.25,jit:0,lp:900,pan:pn})}};
 stepSnd=function(run){
  if(!FX||!OPT.steps)return;
  try{ac();const t=AC.currentTime;if(t-STP.last<.18)return;STP.last=t;STP.ft=-(STP.ft||1);
   const v=(run?1.2:1)*R(.85,1.1),pn=STP.ft*.1;
   SND_[surface()](v,pn,run)}catch(e){warn('step',e)}};
})();
