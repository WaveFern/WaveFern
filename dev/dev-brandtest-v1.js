/* WaveFern dev: in test mode (S.cheat, e.g. after typing "test" as the save code) brands write to you on their own, so the brand deals
   and photoshoot features are easy to test. Only does anything when window.FW_DEV is set (the /dev/ page); on the real game and for normal
   careers nothing changes. Offers still use BRD.mk from 223-brand-deals.js. Test careers stay tainted, so they never reach the leaderboard. */
(function(){
if(!window.FW_DEV||!window.BRD||typeof BRD.mk!='function')return;
const on=()=>{try{return !!(S&&S.cheat&&S.artist)}catch(e){return false}};
/* a new offer when none is open or booked; the real 8-day cooldown and 12% chance are skipped */
function offer(){if(!on())return;try{const s=BRD.st();if(s.list.some(o=>o.st==0||o.st==1))return;BRD.mk()}catch(e){console.warn('brand test offer',e)}}
/* every morning, and a few seconds after waking up so the offer is there straight away */
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{offer()}catch(e){}return r}}
/* and every 30 seconds of play, so you never wait for a new day (a new offer only when the last one is answered) */
setInterval(()=>{try{if(typeof mode!='undefined'&&mode=='title')return;offer()}catch(e){}},30000);
/* the first one arrives right after test mode is switched on */
setTimeout(()=>{try{offer()}catch(e){}},4000);
})();
