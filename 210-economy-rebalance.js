/* WaveFern listener pacing (v4): a game day is ~5 real minutes (12 days per hour of play).
   Target path (hours of play): 1K 0.5h, 2K 1h, 10K 3h, 100K 7.5h, 1M 12h, 10M 17h, 100M 22.5h, 1B 28h, 4B 35h, 8B 40h.
   Daily growth follows the rate of that path at the player's current listeners, so a player who skips releases falls behind.
   Every player gets their own pace (+-10%), a different day-1 number (54 to 67) and noisy nights; sometimes (about 6%) a slow patch
   of 2 to 5 days starts. Monthly listeners = streams of the last 31 days / a random divisor (4 to 9), so each night's streams are set
   to match the listeners: songs, summary, earnings and the stats all agree. Money follows the streams.
   Energy: walking drains energy, slowly less with each level of the Energy pack in the gear shop. ?noeco skips this file. */
(()=>{
if(/[?&]noeco/.test(location.search))return;
/* income per stream is scaled by how many listeners you have, so cash in hand follows: ~$300 at 1K, $3K at 10K, $200K at 1M, $25M at 1B, $100M at 8B */
const MFP=[[1e3,.12],[1e4,.46],[1e5,.42],[1e6,.4],[1e7,.17],[1e8,.08],[1e9,.024],[4e9,.011],[8e9,.0095]];
const MF=L=>{if(L<=MFP[0][0])return MFP[0][1]*Math.max(.5,Math.min(1,L/1e3+.3));for(let i=1;i<MFP.length;i++)if(L<MFP[i][0]){const a=MFP[i-1],b=MFP[i],t=Math.log(L/a[0])/Math.log(b[0]/a[0]);return Math.exp(Math.log(a[1])+t*(Math.log(b[1])-Math.log(a[1])))}return MFP[MFP.length-1][1]};
window.__ecoMF=MF;
const PAY=.04,ADD=40,IDLE=.3,CAPX=1.15,FIX=1.065;
const PATH=[[100,1],[1e3,6],[2e3,12],[1e4,36],[1e5,90],[1e6,144],[1e7,204],[1e8,270],[1e9,336],[4e9,420],[8e9,480]];
const RT=PATH.slice(1).map((p,i)=>[PATH[i][0],p[0],Math.log(p[0]/PATH[i][0])/(p[1]-PATH[i][1])]);
const rate=L=>{for(const s of RT)if(L<s[1])return s[2];return RT[RT.length-1][2]*.5};
const gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=Math.random();return (u-3)/Math.sqrt(.5)};
function step(L0,rel,st){let m;if(st.slow>0){st.slow--;m=.2;if(!st.slow)st.catch=2}else if(Math.random()<.06){st.slow=1+Math.floor(Math.random()*4);m=.2}else{m=Math.max(.5,Math.min(1.6,Math.exp(gauss()*.2)));if(st.catch>0){st.catch--;m*=1.4}}
 const g=rate(L0)*m*(st.p||1),tgt=Math.floor(L0*Math.exp(g*FIX*(rel?1:IDLE))+ADD*(rel?1:.2)),cap=Math.floor(L0*Math.exp(g*FIX*CAPX)+ADD*1.5);return{tgt,cap}}
window.__ecoStep=step;
/* the official listener count only changes at night: catalogue boosts, gifts and stream bursts during the day cannot inflate it */
setInterval(()=>{try{if(typeof S=='object'&&S&&S.eco&&S.eco.L!=null&&!S.cheat){const m=Math.floor(S.eco.L*1.02+30);if(S.listeners>m)S.listeners=m}}catch(e){}},1000);
const w0=wakeUp;wakeUp=function(){let L0=0;try{L0=+S.listeners||0;if(S.eco&&S.eco.L!=null)L0=S.eco.L;else if((S.day||1)<=1)L0=0}catch(e){}
 const r0=w0.apply(this,arguments);
 try{if(S.cheat)return r0;
  S.eco=S.eco||{slow:0,catch:0};if(!S.eco.p)S.eco.p=.9+Math.random()*.2;
  if(!(S.mlDiv>=4)){S.mlDiv=4+Math.floor(Math.random()*6)}
  const rel=(S.songs||[]).some(s=>s.day==S.day-1),T=step(L0,rel,S.eco);let tgt=T.tgt,cap=T.cap;
  if(L0<1){tgt=cap=54+Math.floor(Math.random()*14)}
  const Ln=+S.listeners||0,Lf=Math.min(cap,Math.max(Ln,tgt)),h=S.hist&&S.hist[S.hist.length-1],md=S.mlDiv;
  /* streams of the last 31 days must add up to listeners x divisor: set last night's streams to fill the gap */
  if(h&&h.d===S.day-1&&!h.cp){h.cp=1;
   const prev=S.hist.slice(-31,-1).reduce((a,x)=>a+(x.st||0),0),want=Math.max(Lf*md-prev,Lf*md/62),tot=Math.round(want);
   const songs=(S.songs||[]).filter(s=>s.pd===S.day-1&&s.today>0),nat=songs.reduce((a,s)=>a+s.today,0);
   if(nat>0){const k=tot/nat;songs.forEach(s=>{const dl=Math.round(s.today*(k-1));s.today+=dl;s.streams=(s.streams||0)+dl;const e=(s.dh||[]).find(x=>x[0]===S.day-1);if(e)e[1]=Math.round(s.today)})}
   const dS=tot-(h.st||0),e1=+(tot*PAY*MF(Lf)).toFixed(2),dE=e1-(+h.e||0);
   S.streams=(S.streams||0)+dS;h.st=tot;h.e=e1;
   S.money=+Math.max(0,S.money+dE).toFixed(2);S.earn=+((S.earn||0)+dE).toFixed(2)}
  S.listeners=Lf;S.eco.L=Lf;S.monthStreams=Lf*md;
  if(Array.isArray(S.mlHist)){const m=S.mlHist[S.mlHist.length-1];if(m)m.ml=Lf}
  /* the morning summary was drawn before this adjustment: redraw its three numbers with the final figures */
  try{const cs=document.querySelectorAll('#ui .box .cards .card');if(cs.length>=3&&h&&h.d===S.day-1&&/Streams/.test(cs[0].textContent)&&/Monthly listeners/.test(cs[2].textContent)){
   const b0=cs[0].querySelector('b'),b1=cs[1].querySelector('b'),b2=cs[2].querySelector('b'),sm=cs[2].querySelector('small'),ov=Math.min(L0,Lf>L0?Lf:L0);
   if(b0)b0.textContent='+'+(h.st||0).toLocaleString();if(b1)b1.textContent=$$(h.e||0);
   if(b2)b2.textContent=ov.toLocaleString()+' → '+Lf.toLocaleString();
   if(sm)sm.textContent=Lf>ov?'+'+(Lf-ov).toLocaleString():Lf<ov?'-'+(ov-Lf).toLocaleString():'no change'}}catch(e){}
 }catch(e){console.error('economy pacing',e)}
 return r0};

/* ---- big purchases need listeners as well as cash ---- */
const GATE={car:[1e3,1e4,6e4,4e5,2e6],home:[3e4,4e5,5e6],guard:[1e5,1e6,1e7],garage:[5e3]};
const fm=n=>n>=1e9?n/1e9+'B':n>=1e6?n/1e6+'M':n>=1e3?n/1e3+'K':n;
const gateNeed=(t,i)=>{const g=GATE[t];return g&&g[t=='guard'?(S.guards||0):t=='garage'?0:i]||0};
if(typeof buyX=='function'){const b0=buyX;buyX=function(t,i){try{const need=gateNeed(t,i);if(need&&(+S.listeners||0)<need&&!S.cheat){snd('err');return say('Unlocks at '+fm(need)+' monthly listeners.')}}catch(e){}return b0.apply(this,arguments)}}
/* the same listener requirement is shown next to every Book button that buys a gated item, and the button stays off until it is met */
for(const k of ['cars','prop','guard']){const p0=PA[k];if(typeof p0!='function')continue;PA[k]=function(){const h=p0.apply(this,arguments);if(typeof h!='string')return h;
 try{return h.replace(/<button class=go([^>]*?)onclick="book\('(car|home|garage|guard)',(\d+)\)">([^<]*)<\/button>/g,(m,a,t,i,txt)=>{const need=gateNeed(t,+i);if(!need)return m;const ok=S.cheat||(+S.listeners||0)>=need,a2=ok||/disabled/.test(a)?a:' disabled'+a;
  return'<button class=go'+a2+'onclick="book(\''+t+'\','+i+')">'+txt+'</button><small class=m style="display:block;margin-top:4px;'+(ok?'':'color:#e07a7a')+'">Needs '+fm(need)+' monthly listeners</small>'})}catch(e){return h}}}
/* ---- clothes and furniture follow the money curve: clothes x3, furniture x2.5 (each item scaled once) ---- */
const seen=new WeakSet();
const scalePrices=()=>{try{[[typeof GM!='undefined'&&GM,3],[typeof CLM!='undefined'&&CLM,3],[typeof F!='undefined'&&F,2.5]].forEach(([m,k])=>{if(!m)return;Object.values(m).forEach(x=>{if(x&&typeof x=='object'&&typeof x.p=='number'&&x.p>0&&!seen.has(x)){seen.add(x);x.p=Math.round(x.p*k)}})})}catch(e){console.error('price scale',e)}};
scalePrices();setTimeout(scalePrices,3000);
/* ---- energy: walking drains it; the Energy pack in the gear shop slows the drain (capacity x1 to x4) ---- */
let said=-1;
setInterval(()=>{try{
 if(typeof S!='object'||!S||!S.artist||S.cheat||typeof P=='undefined'||mode!='play'||PAUSED)return;
 if(typeof TT!='undefined'&&TT&&TT.on)return;
 if(!P.moving)return;
 const lv=Math.min(5,(S.gear&&S.gear.stamina)||0),cap=1+.6*lv;
 S.energy=Math.max(0,(+S.energy||0)-.24/cap);
 if(S.energy<=0&&said!==S.day){said=S.day;say('Out of energy! Eat something, or sleep, and look at the Energy pack in the gear shop.')}
}catch(e){}},200);
})();
