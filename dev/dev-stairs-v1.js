/* ===== dev only: you now walk UP the living room stairs instead of through them =====
   The player's height on the staircase was a smooth ramp that sat below the real treads (up to 18 cm under the front of a step),
   so your legs went through every step, and the game switched to the upstairs floor while you were still on the 4th step.
   Now your feet follow the real tread heights (22 cm per step, 60 cm deep, easing between steps), and you only go upstairs
   once you reach the top step. The stairs only exist from the Penthouse tier (home 3) up; below that there is nothing to climb. */
(function(){
 if(typeof worldTick!='function'||typeof goUp!='function'||typeof P=='undefined')return;
 const RISE=.22,RUN=.6,X0=3.4,Z=10.6,HW=1.1;
 const onStairs=()=>typeof HIN!='undefined'&&HIN&&!IN&&(S.home||0)>=3&&P.x>.4&&P.x<X0&&Math.abs(P.z-Z)<HW;
 const tread=x=>RISE*(Math.min(4,Math.floor((X0-x)/RUN))+1);
 let sy=0;const g0=goUp;
 goUp=function(){if(onStairs()&&P.x>.75)return;return g0.apply(this,arguments)};/* climbing: only from the top step; the "Go upstairs" key works from the foot of the stairs */
 const w0=worldTick;
 worldTick=function(dt){
  const r=w0.apply(this,arguments);
  try{if(mode=='play'&&!P.sit&&onStairs()){sy+=(tread(P.x)-sy)*Math.min(1,(dt||.016)*20);SY=sy;
    if(P.x<.75&&sy>.95){sy=SY=0;goUp()}}else sy=SY}catch(e){}
  return r}
})();
