/* ---------- v49.51.0: the recorded instrument samples in the band minigames ----------
   44 recorded one-shots (Bass, Key, Lead, Pad, Pluck in audio/oneshots, listed in manifest.json) are part of the beat engine
   (67-beats.js): each song picks one per instrument, or you pick them under Extras when you make a song (132-808-hats.js).
   The band minigames play single notes too (09-settings-effects.js: mgKey, mgBass, mgPluck, mgPad). Those now play a recorded
   sample of the matching family once it has loaded (the guitar riff uses Pluck, the bass Bass, the keys Key, the festival call-and-answer Pad)
   and the code-made voice until then. The sample is the one you picked for that family in Extras, or a random one for the session.
   Only the sample that is used is ever downloaded. */
(function(){
const tap=(fam,hz,dur,vol)=>{try{return typeof Beats!='undefined'&&Beats.instruments&&Beats.instruments.tap(fam,hz,dur,vol)}catch(e){return false}};
const wrap=(name,fam,dur,vol)=>{const o=window[name];if(typeof o!='function')return;
 window[name]=function(f){if(typeof FX!='undefined'&&!FX)return;if(tap(fam,f,dur,vol))return;return o.apply(this,arguments)}};
wrap('mgKey','key',.7,.16);wrap('mgBass','bass',.35,.22);wrap('mgPluck','pluck',.6,.2);wrap('mgPad','pad',.8,.14);
})();
