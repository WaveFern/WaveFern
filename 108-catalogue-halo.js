/* v26.116: catalogue halo. When your monthly listeners balloon (a hit or viral song), a share of those listeners
   dig into your older songs, so the least-streamed song is no longer stuck at a few hundred streams.
   Proportional to monthly listeners (zero effect in the early game), scaled by song quality and age,
   and split across the catalogue so the total stays stable however many songs you have. */
const HALO={rate:.08,minSongs:10,ageKeep:.4,ageDecay:.985};
function haloOf(s){const L=S.listeners||0;if(!(L>0)||s.lk=='v'||s.lk=='h')return 0;const age=Math.max(0,S.day-s.day);
 const n=Math.max(HALO.minSongs,S.songs.length-1),q=qualF(s),a=HALO.ageKeep+(1-HALO.ageKeep)*Math.pow(HALO.ageDecay,age);
 return Math.max(0,Math.round(L*HALO.rate/n*q*a*(S.interest!=null?.5+.5*S.interest:1)*R(.75,1.25)))}
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh)return v;
 try{const h=haloOf(s);if(h>0){s.hl=h;s.pv=(isFinite(v)?v:0)+h;return s.pv}}catch(e){console.error('catalogue halo failed',e)}return v}}

/* one-time catch-up for existing saves: if monthly listeners are exactly 767, +2000 monthly listeners and +6000 streams shared equally across released songs */
function haloCatchUp(){if(S.cu1!==undefined||!S.songs)return;if(!S.songs.length&&(S.day||1)<=1){S.cu1=1;return}if(!S.songs.length)return;S.cu1=1;
 if(Math.round(S.listeners||0)!==767)return;const n=S.songs.length,each=Math.floor(6000/n);let rest=6000-each*n;
 S.songs.forEach(s=>{const k=each+(rest-->0?1:0);s.streams=(s.streams||0)+k;s.fs=s.fs||0});
 S.streams=(S.streams||0)+6000;S.listeners=(S.listeners||0)+2000;
 try{mlInit();S.monthStreams=(S.monthStreams||0)+2000*(S.mlDiv||3);if(Array.isArray(S.mlHist)){S.mlHist=S.mlHist.filter(h=>h.day!==S.day);S.mlHist.push({day:S.day,ml:S.listeners})}}catch(e){}
 try{say('📈 Update bonus: +2,000 monthly listeners and +6,000 streams shared across your songs.')}catch(e){}}
{const u0=update;update=function(dt){try{if(typeof S!='undefined'&&S&&S.songs&&mode=='play')haloCatchUp()}catch(e){console.error('catch-up failed',e)}return u0.apply(this,arguments)}}
