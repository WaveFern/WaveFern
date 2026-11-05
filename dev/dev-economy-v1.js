/* v49.74.0 economy rebalance: caps daily listener growth (about 1M listeners after 25 to 30 days of ~30 min play)
   and ties that night's streams and pay to the capped growth, so big collabs and viral songs cannot skip the grind. */
(()=>{
const GROW=1.36,ADD=250;
const w0=wakeUp;wakeUp=function(){let L0=0;try{L0=+S.listeners||0}catch(e){}
 const r=w0.apply(this,arguments);
 try{if(S.cheat)return r;const cap=Math.floor(L0*GROW+ADD),L1=+S.listeners||0;
  if(L1>cap){const k=cap/L1,h=S.hist&&S.hist[S.hist.length-1];S.listeners=cap;
   if(h&&h.d===S.day-1&&!h.cp){h.cp=1;const e=+h.e||0,lost=e*(1-k);h.e=+(e*k).toFixed(2);h.st=Math.round((h.st||0)*k);S.money=+Math.max(0,S.money-lost).toFixed(2);S.earn=+((S.earn||0)-lost).toFixed(2)}
   if(S.monthStreams>cap*(S.mlDiv||3))S.monthStreams=cap*(S.mlDiv||3);
   if(Array.isArray(S.mlHist)){const m=S.mlHist[S.mlHist.length-1];if(m)m.ml=cap}}}catch(e){console.error('economy cap',e)}
 return r}
})();
