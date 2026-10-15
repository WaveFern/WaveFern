/* v26.116: catalogue halo. When your monthly listeners balloon (a hit or viral song), a share of those listeners
   dig into your older songs, so the least-streamed song is no longer stuck at a few hundred streams.
   Proportional to monthly listeners (zero effect in the early game), scaled by song quality and age,
   and split across the catalogue so the total stays stable however many songs you have. */
const HALO={rate:.035,minSongs:20,ageKeep:.4,ageDecay:.985};
function haloOf(s){const L=S.listeners||0;if(!(L>0)||s.lk=='v'||s.lk=='h')return 0;const age=S.day-s.day;if(age<1)return 0;
 const n=Math.max(HALO.minSongs,S.songs.length-1),q=qualF(s),a=HALO.ageKeep+(1-HALO.ageKeep)*Math.pow(HALO.ageDecay,age);
 return Math.max(0,Math.round(L*HALO.rate/n*q*a*(S.interest!=null?.5+.5*S.interest:1)*R(.75,1.25)))}
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh)return v;
 try{const h=haloOf(s);if(h>0){s.hl=h;s.pv=(isFinite(v)?v:0)+h;return s.pv}}catch(e){console.error('catalogue halo failed',e)}return v}}
