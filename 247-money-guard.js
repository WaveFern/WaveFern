/* Money guard (v55.18.1): waking up must never lower your cash. Last night's pay is added, never taken away.
   If anything in the morning chain leaves you with less than you went to bed with, cash is put back to
   (cash before sleeping) + (the "Earned" figure the summary showed). Loads after every other wakeUp wrapper. */
(function(){
if(typeof wakeUp!='function')return;
const w0=wakeUp;
wakeUp=function(){
 let m0=null;try{m0=+S.money}catch(e){}
 const r=w0.apply(this,arguments);
 try{if(m0!==null&&isFinite(m0)&&!S.cheat){const h=(S.hist||[])[S.hist.length-1],e=h&&h.d===S.day-1?Math.max(0,+h.e||0):0,ok=+S.money;
  if(!isFinite(ok)||ok<m0-.005){const fix=+(m0+(isFinite(e)?e:0)).toFixed(2);console.warn('money guard: cash fell on wake',m0,'->',S.money,'restored to',fix);S.money=fix}}}catch(x){console.error('money guard',x)}
 return r};
})();
