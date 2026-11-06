/* WaveFern dev: the laptop on the desk in every hotel room works. Walk up to it (Use laptop, E) and the same computer as at home opens
   (same desktop, apps, pause and Shut down). Esc / Shut down close it and you are back in the room. Only loaded on /dev/. */
(function(){
 if(!window.FW_DEV)return;
 const D=window.DCITY;if(!D||!D.cityHooks)return;
 D.cityHooks.push(C=>{
  try{
   const R=D.RM&&D.RM.room;if(!R||!C.rooms||!C.rooms.room)return;
   const rx=R[0],rz=R[1];
   /* the desk (with the laptop) is at rx+13.2, against the back wall; the chair is just in front of it */
   D.addInt(rx+13.3,rz+1.8,1.15,'Use laptop',()=>{
    if(typeof openPC!='function')return;
    if(typeof mode!='undefined'&&mode!='play')return;
    openPC();
   });
  }catch(e){console.warn('dev hotel laptop',e)}
 });
})();
