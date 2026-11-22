/* ===== v53.2.2: no more invisible player after sleeping or passing out in a car =====
   Driving hides your character (P.mesh.visible=false, dr = the car). sleepNow() (bed, hotel, or passing out when the day ends or
   energy runs out) switched mode to 'sleep' and then back to 'play' without ever calling exitDrive(), so you woke up standing
   in the world, invisible, with the game still thinking you drive. Now:
   - sleepNow first gets you out of the car (exitDrive, which also parks it where it stands, 218/230);
   - as a safety net, the first time the game is back in 'play' after 'drive' without a car and the character is hidden, it is shown
     again (the phone selfie camera is the one case where it stays hidden on purpose). No saved state. */
(function(){
{const s0=sleepNow;sleepNow=function(){try{if(mode=='drive'&&dr&&typeof exitDrive=='function')exitDrive()}catch(e){console.error('sleep exit car',e)}return s0.apply(this,arguments)}}
let drove=0;
{const u0=update;update=function(){const r=u0.apply(this,arguments);try{
 if(mode=='drive')drove=1;
 else if(drove&&mode=='play'){drove=0;if(!dr&&P.mesh&&!P.mesh.visible&&!(typeof PH!='undefined'&&PH.camOn))P.mesh.visible=true}
}catch(e){}return r}}
})();
