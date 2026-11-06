/* WaveFern dev: sitting keeps the camera still (it jittered as the player was pushed off the seat and snapped back each frame),
   and hotels only let you sleep from 20:00. Only loaded on /dev/. */
(function(){
 if(!window.FW_FEAT)return;
 const late=()=>S.t>=300;/* the clock reads 20:00 at S.t 300 */
 const no=()=>{snd('err');say('You can only sleep at the hotel from 20:00. It is '+clk()+' now.')};
 try{const D=window.DCITY;if(D&&D.hotelSleep){const h0=D.hotelSleep;D.hotelSleep=function(){if(!late())return no();return h0.apply(this,arguments)}}}catch(e){console.warn('dev hotel',e)}
 if(typeof sleepNow=='function'){const s0=sleepNow;sleepNow=function(auto){const D=window.DCITY;
  if(!auto&&D&&D.hotelWakeRoom&&!late()){D.hotelWakeRoom=0;return no()}return s0.apply(this,arguments)}}
 let sc=null;
 if(typeof update=='function'){const u0=update;update=function(dt){u0(dt);
  try{if(P.sit&&mode=='play'){P.x=P.sit.x;P.z=P.sit.z;if(!sc)sc=[camT.x,camT.z];const k=Math.min(1,dt*6);sc[0]+=(P.x-sc[0])*k;sc[1]+=(P.z-sc[1])*k;
   camT.x=sc[0];camT.z=sc[1];cam.position.set(camT.x+16,13,camT.z+16);cam.lookAt(camT.x,.8,camT.z);if(P.mesh)P.mesh.position.set(P.x,-.2,P.z)}else sc=null}catch(e){}}}
})();
