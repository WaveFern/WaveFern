/* WaveFern dev: listener pacing (v2). Target in active play (~30 min per day): 1B ~ 17 hours of real play (~day 200), 4B endgame ~ 20 hours (~day 245), with a day about 5 minutes.
   Max daily growth is exp(r(L)*CAP) (fast, fades as the numbers grow); a player who releases music gets pulled up to exp(r(L)*PACE);
   one who does not only gets 30% of that. Money follows: over-cap streams are clawed back, lifted growth pays a stream credit.
   ?noeco skips this file (and the patches). */
(()=>{
if(/[?&]noeco/.test(location.search))return;
const CAP=.95,PACE=.78,IDLE=.3,ADD=250,PAY=.04;
/* a game day is only ~5 real minutes (12 days per hour of play), so growth per day is scaled by K (~1/7) with an early boost that fades over the first hour */
const K=.14,BOOST=3,TAU=6,tm=d=>K*(1+BOOST*Math.exp(-d/TAU));
const r=L=>{const x=Math.log10(Math.max(L,1));return x<=4?.75:x<=8?.75-(x-4)/4*.25:x<=9.2?.5-(x-8)/1.2*.22:.28};
const w0=wakeUp;wakeUp=function(){let L0=0;try{L0=+S.listeners||0}catch(e){}
 const r0=w0.apply(this,arguments);
 try{if(S.cheat)return r0;
  const Ln=+S.listeners||0,g=r(L0)*tm(S.day-1),cap=Math.floor(L0*Math.exp(g*CAP)+ADD),rel=(S.songs||[]).some(s=>s.day==S.day-1);
  const tgt=Math.floor(L0*Math.exp(g*(rel?PACE:PACE*IDLE))+ADD*(rel?.8:.2));
  const Lf=Math.min(cap,Math.max(Ln,tgt)),h=S.hist&&S.hist[S.hist.length-1],md=S.mlDiv||3;
  if(h&&h.d===S.day-1&&!h.cp){h.cp=1;let d=0;
   if(Ln>cap){const k=cap/Ln,e=+h.e||0;d=-e*(1-k);h.e=+(e*k).toFixed(2);h.st=Math.round((h.st||0)*k)}
   else if(Lf>Ln){const st=Math.round((Lf-Ln)*md/30*.5);d=st*PAY;h.st=(h.st||0)+st;h.e=+((+h.e||0)+d).toFixed(2);S.streams=(S.streams||0)+st}
   if(d){S.money=+Math.max(0,S.money+d).toFixed(2);S.earn=+((S.earn||0)+d).toFixed(2)}}
  S.listeners=Lf;S.monthStreams=Math.max(0,Math.min(S.monthStreams||0,cap*md),Lf*md*.999);
  if(Array.isArray(S.mlHist)){const m=S.mlHist[S.mlHist.length-1];if(m)m.ml=Lf}
 }catch(e){console.error('economy pacing',e)}
 return r0};
})();
