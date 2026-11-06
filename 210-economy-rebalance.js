/* WaveFern listener pacing (v3): a game day is ~5 real minutes (12 days per hour of play).
   Target path (hours of play): 1K 0.5h, 2K 1h, 10K 3h, 100K 7.5h, 1M 12h, 10M 17h, 100M 22.5h, 1B 28h, 4B 35h, 8B 40h.
   Daily growth follows the rate of that path at the player's current listeners, so a player who skips releases falls behind.
   Each night is noisy, and sometimes (about 6%) a slow patch of 2 to 5 days at a fifth of speed starts, followed by a small catch-up.
   Money follows listeners: over-cap streams are clawed back, lifted growth pays a stream credit. ?noeco skips this file. */
(()=>{
if(/[?&]noeco/.test(location.search))return;
const PAY=.04,ADD=40,IDLE=.3,CAPX=1.15,FIX=1.065;
const P=[[100,1],[1e3,6],[2e3,12],[1e4,36],[1e5,90],[1e6,144],[1e7,204],[1e8,270],[1e9,336],[4e9,420],[8e9,480]];
const RT=P.slice(1).map((p,i)=>[P[i][0],p[0],Math.log(p[0]/P[i][0])/(p[1]-P[i][1])]);
const rate=L=>{for(const s of RT)if(L<s[1])return s[2];return RT[RT.length-1][2]*.5};
const gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=Math.random();return (u-3)/Math.sqrt(.5)};
function step(L0,rel,st){let m;if(st.slow>0){st.slow--;m=.2;if(!st.slow)st.catch=2}else if(Math.random()<.06){st.slow=1+Math.floor(Math.random()*4);m=.2}else{m=Math.max(.5,Math.min(1.6,Math.exp(gauss()*.2)));if(st.catch>0){st.catch--;m*=1.4}}
 const g=rate(L0)*m,tgt=Math.floor(L0*Math.exp(g*FIX*(rel?1:IDLE))+ADD*(rel?1:.2)),cap=Math.floor(L0*Math.exp(g*FIX*CAPX)+ADD*1.5);return{tgt,cap}}
window.__ecoStep=step;
/* the official listener count only changes at night: catalogue boosts, gifts and stream bursts during the day cannot inflate it */
setInterval(()=>{try{if(typeof S=='object'&&S&&S.eco&&S.eco.L!=null&&!S.cheat){const m=Math.floor(S.eco.L*1.02+30);if(S.listeners>m)S.listeners=m}}catch(e){}},1000);
const w0=wakeUp;wakeUp=function(){let L0=0;try{L0=+S.listeners||0;if(S.eco&&S.eco.L!=null)L0=S.eco.L;else if((S.day||1)<=1)L0=0}catch(e){}
 const r0=w0.apply(this,arguments);
 try{if(S.cheat)return r0;
  S.eco=S.eco||{slow:0,catch:0};
  let Ln=+S.listeners||0;const rel=(S.songs||[]).some(s=>s.day==S.day-1),T=step(L0,rel,S.eco);let tgt=T.tgt,cap=T.cap;if(L0<1){tgt=100;cap=Math.max(cap,100)}
  const Lf=Math.min(cap,Math.max(Ln,tgt)),h=S.hist&&S.hist[S.hist.length-1],md=S.mlDiv||3;
  if(h&&h.d===S.day-1&&!h.cp){h.cp=1;let d=0;
   if(Ln>cap){const k=cap/Ln,e=+h.e||0;d=-e*(1-k);h.e=+(e*k).toFixed(2);h.st=Math.round((h.st||0)*k)}
   else if(Lf>Ln){const st=Math.round((Lf-Ln)*md/30*.5);d=st*PAY;h.st=(h.st||0)+st;h.e=+((+h.e||0)+d).toFixed(2);S.streams=(S.streams||0)+st}
   if(d){S.money=+Math.max(0,S.money+d).toFixed(2);S.earn=+((S.earn||0)+d).toFixed(2)}}
  S.listeners=Lf;S.eco.L=Lf;S.monthStreams=Math.max(0,Math.min(S.monthStreams||0,cap*md),Lf*md*.999);
  if(Array.isArray(S.mlHist)){const m=S.mlHist[S.mlHist.length-1];if(m)m.ml=Lf}
  /* the morning summary was drawn before the pacing adjustment: redraw its three numbers with the final figures */
  try{const cs=document.querySelectorAll('#ui .box .cards .card');if(cs.length>=3&&h&&h.d===S.day-1&&/Streams/.test(cs[0].textContent)&&/Monthly listeners/.test(cs[2].textContent)){
   const b0=cs[0].querySelector('b'),b1=cs[1].querySelector('b'),b2=cs[2].querySelector('b'),sm=cs[2].querySelector('small');
   if(b0)b0.textContent='+'+(h.st||0).toLocaleString();if(b1)b1.textContent=$$(h.e||0);
   const ov=Math.min(L0,Lf>L0?Lf:L0);
   if(b2)b2.textContent=ov.toLocaleString()+' → '+Lf.toLocaleString();
   if(sm)sm.textContent=Lf>ov?'+'+(Lf-ov).toLocaleString():Lf<ov?'-'+(ov-Lf).toLocaleString():'no change'}}catch(e){}
 }catch(e){console.error('economy pacing',e)}
 return r0};
})();
