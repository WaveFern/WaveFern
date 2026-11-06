/* WaveFern dev: abroad, the stadium door only opens for a show you have on your tour. Only loaded on /dev/ (see dev/index.html);
   the live game is untouched. Add ?nostadiumgate to skip it.
   - Tour data: S.wtour.stops is an ordered list of cities ({d:cityId,songs,alb}). Stops have NO date, so "booked today" means:
     this city is a stop on your tour plan AND wtCanPlay says the show can be played now (not already played today, not on cooldown,
     fame high enough). If the city is not a stop, the door says there is no show scheduled today.
   - Only the stadium gate ("Enter <venue>") is gated. The club door and the backstage door keep their own checks. */
(function(){
 if(!window.FW_DEV||/[?&]nostadiumgate/.test(location.search))return;
 const D=window.DCITY;if(!D||!D.addInt)return;
 const a0=D.addInt;
 D.addInt=function(x,z,r,l,act){
  try{
   const C=D.C;
   if(C&&!D.building&&typeof l=='string'&&typeof act=='function'&&C.d&&C.d.venue&&l==='Enter '+C.d.venue.n){
    const go=act,id=C.id,v=C.d.venue.n;
    act=function(){
     let ok=1,msg='';
     try{
      if(!(typeof S=='object'&&S&&S.cheat)){
       const stop=(typeof wtPlan=='function'?wtPlan():[]).some(s=>s&&s.d===id);
       if(!stop){ok=0;msg=v+': no show scheduled today. The stadium only opens on a day you are booked to play.'}
       else if(typeof wtCanPlay=='function'){const c=wtCanPlay(id,'venue');if(!c.ok){ok=0;msg=v+': no show for you today. '+c.why}}
      }
     }catch(e){ok=1}
     if(!ok){try{snd('err')}catch(e){}return say(msg)}
     return go.apply(this,arguments)};
   }
  }catch(e){console.warn('dev stadium gate',e)}
  return a0.call(this,x,z,r,l,act)};
})();
