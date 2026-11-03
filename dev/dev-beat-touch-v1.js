/* WaveFern dev: the Beat bar (first step of making a song) now answers touch.
   The live game only listens for mousedown, which iPad Safari fires late or not at all for a tap, so hits
   felt missed or ignored. Here a touch/pen pointerdown hits the bar straight away, and the mouse event that
   iOS sends afterwards for the same tap is ignored so one tap can never count twice. Mouse play is unchanged.
   Only loaded on /dev/ (see dev/index.html). */
(function(){
 if(!window.FW_DEV)return;
 let last=0;
 addEventListener('pointerdown',function(e){
  if(e.pointerType==='mouse')return;
  if(typeof mode==='undefined'||mode!=='rec'||typeof rec==='undefined'||!rec||rec.st||rec.wait)return;
  if(e.target&&e.target.closest&&e.target.closest('button,input,a'))return;
  last=performance.now();
  if(e.cancelable)e.preventDefault();
  recHit();
 },true);
 /* the emulated mouse event that follows a touch tap: swallow it so the tap is not counted twice */
 addEventListener('mousedown',function(e){
  if(performance.now()-last<900){e.stopImmediatePropagation();e.preventDefault()}
 },true);
})();
