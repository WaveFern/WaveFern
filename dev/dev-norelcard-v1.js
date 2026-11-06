/* WaveFern dev: no big NEW RELEASE / FIRST RELEASE card (and its confetti) when you post a song.
   A small toast says it is out instead. Goals, rewards, streams and the other cards are untouched. Only loaded on /dev/. */
(function(){if(!window.FW_FEAT)return;
 if(typeof glCard=='function'){const c0=glCard;glCard=function(k,t,s){if(k==='NEW RELEASE'||k==='FIRST RELEASE'){try{say('Released "'+t+'" - '+(s||'')) }catch(e){}return}return c0.apply(this,arguments)}}
})();
