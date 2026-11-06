/* WaveFern dev: pause menu music starts off. Applied once per browser, so turning it back on in Settings sticks. */
(function(){
 try{
  if(typeof OPT=='undefined'||localStorage.getItem('fw_pausemus_off1'))return;
  localStorage.setItem('fw_pausemus_off1','1');
  OPT.pauseMus=0;
  if(typeof svOpt=='function')svOpt();
  if(typeof menuSync=='function')menuSync();
 }catch(e){}
})();
