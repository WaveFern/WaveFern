/* WaveFern dev: traffic cars slow down and stop for people in front of them. Only loaded on /dev/.
   "People" = every visible street NPC and pedestrian (including crowds following you and fans walking up), artists,
   your bodyguards and your pets when they are out with you on foot. A person in the car's lane up to 10 m ahead makes it
   ease off, and it holds still about 3.5 m short of them until they move. Add ?nocarstop to the address to skip it. */
(function(){
 if(!window.FW_FEAT)return;
 if(/[?&]nocarstop/.test(location.search))return;
 if(typeof trafTick!='function'||typeof TRAF=='undefined')return;
 const AHEAD=10,STOP=3.5,HALF=1.5;
 function people(){
  const a=[];
  const add=L=>{if(L)for(const n of L){if(n&&n.m&&n.m.visible&&isFinite(n.x)&&isFinite(n.z))a.push(n)}};
  try{add(NPC);add(typeof VPED!='undefined'?VPED:null);add(typeof ART_M!='undefined'?ART_M:null);add(typeof FOL!='undefined'?FOL:null)}catch(e){}
  return a;
 }
 const t0=trafTick;
 trafTick=function(dt){
  let saved=null;
  try{
   if(mode=='play'||mode=='drive'){
    const pp=people();
    if(pp.length){
     saved=[];
     for(const c of TRAF){
      if(!c.e||!c.m||!c.m.visible)continue;
      const hx=Math.sin(c.h),hz=Math.cos(c.h);let lim=1e9;
      for(const n of pp){
       const dx=n.x-c.x,dz=n.z-c.z;
       if(dx>AHEAD+2||dx<-AHEAD-2||dz>AHEAD+2||dz<-AHEAD-2)continue;
       const al=dx*hx+dz*hz,lat=dx*hz-dz*hx;
       if(al<-.5||al>AHEAD||Math.abs(lat)>HALF)continue;
       lim=Math.min(lim,Math.max(0,(al-STOP)*.8));
      }
      if(lim<c.cr){saved.push([c,c.cr]);c.cr=lim}
     }
    }
   }
  }catch(e){console.error('carstop',e)}
  try{return t0.apply(this,arguments)}
  finally{if(saved)for(const [c,v] of saved)c.cr=v}
 };
})();
