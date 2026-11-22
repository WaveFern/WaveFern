/* ---------- v49.47.1: never stuck ----------
   If you end up standing inside something solid (a taxi drop next to a wall, waking up on the hotel lobby's coffee
   table at 6am abroad, a pop-up tent appearing where you stand), every step was blocked and you could not move at all.
   Now, when the spot you are on has been solid for a moment while you are walking about, you are moved to the
   nearest clear spot. The hotel lobby wake-up spot is also moved to the open floor by the entrance. */
(function(){
if(typeof hit!='function'||typeof P=='undefined')return;
const R=.3,RS=.26;let t=0,ok=null;/* RS is below the .28 walking radius, so hugging a wall or corner never counts as stuck */
function unstick(){if(ok&&Math.hypot(ok[0]-P.x,ok[1]-P.z)<6&&!hit(ok[0],ok[1],R+.05)){P.x=ok[0];P.z=ok[1];try{camT.x=P.x;camT.z=P.z}catch(e){}return true}
 for(let d=.4;d<16;d+=.4)for(let i=0;i<16;i++){const a=i/16*Math.PI*2,x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;
 if(!hit(x,z,R+.05)&&!hit(x+.3,z,R)&&!hit(x-.3,z,R)&&!hit(x,z+.3,R)&&!hit(x,z-.3,R)){P.x=x;P.z=z;try{camT.x=x;camT.z=z}catch(e){}return true}}return false}
window.unstickPlayer=unstick;
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='play'&&!PAUSED&&P&&hit(P.x,P.z,RS)){t+=dt||0;if(t>.35){t=0;unstick()}}else{t=0;if(mode=='play'&&P&&!hit(P.x,P.z,R+.05))ok=[P.x,P.z]}}catch(e){}return r}}
/* abroad: wake up on the open lobby floor near the entrance, not on the sofa and coffee table */
try{const D=window.DCITY;if(D&&D.hotelWake&&D.RM){const h0=D.hotelWake;D.hotelWake=function(auto){const inRoom=D.hotelWakeRoom&&!auto,out=h0.apply(this,arguments);
 try{if(out&&!inRoom&&D.room){const L=D.RM.lobby;const ox=P.x-(L[0]+4),oz=P.z-(L[1]+11.6);P.x=ox+L[0]+11;P.z=oz+L[1]+L[3]-2.4;try{camT.x=P.x;camT.z=P.z}catch(e){}}
  if(out&&hit(P.x,P.z,R))unstick()}catch(e){}return out}}}catch(e){}
})();
/* v49.93.15: it returns you to the last clear spot you stood on first (the old nearest-spot search could pick a spot on the far side of a thin wall, so sprinting into a house corner threw you outside) and only treats real overlap, not wall-hugging, as stuck. */
