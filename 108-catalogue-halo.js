/* v26.116: catalogue halo. When your monthly listeners balloon (a hit or viral song), a share of those listeners
   dig into your older songs, so the least-streamed song is no longer stuck at a few hundred streams.
   Proportional to monthly listeners (zero effect in the early game), scaled by song quality and age,
   and split across the catalogue so the total stays stable however many songs you have. */
const HALO={rate:.08,minSongs:10,ageKeep:.4,ageDecay:.985};
function haloOf(s,all){const L=S.listeners||0;if(!(L>0)||(!all&&(s.lk=='v'||s.lk=='h')))return 0;const age=Math.max(0,S.day-s.day);
 const n=Math.max(HALO.minSongs,S.songs.length-1),q=qualF(s),a=HALO.ageKeep+(1-HALO.ageKeep)*Math.pow(HALO.ageDecay,age);
 return Math.max(0,Math.round(L*HALO.rate/n*q*a*(S.interest!=null?.5+.5*S.interest:1)*R(.75,1.25)))}
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh)return v;
 try{const h=haloOf(s);if(h>0){s.hl=h;s.pv=(isFinite(v)?v:0)+h;return s.pv}}catch(e){console.error('catalogue halo failed',e)}return v}}


/* v26.118: one-time catch-up for every existing song (flag per save, adds only, never takes anything away).
   Each song gets 7 days of halo streams at once and today's plan is topped up, with the payout credited immediately. */
function haloCatchUp(){if(S.cu2!==undefined||!S.songs)return;if(!S.songs.length){if((S.day||1)<=1)S.cu2=1;return}S.cu2=1;
 let tot=0;S.songs.forEach(s=>{let x=haloOf(s,1)*7;if(s.pd===S.day&&!s.hl){const h=haloOf(s,1);if(h>0){s.hl=h;s.pv=(s.pv||0)+h}}
  if(x>0){s.streams=(s.streams||0)+x;tot+=x}});
 if(!(tot>0))return;const e=+(tot*PAY_RATE).toFixed(2);S.streams=(S.streams||0)+tot;S.money=+((S.money||0)+e).toFixed(2);S.earn=(S.earn||0)+e;
 try{mlInit();S.monthStreams=(S.monthStreams||0)+tot;S.listeners=Math.max(S.listeners||0,Math.floor(S.monthStreams/(S.mlDiv||3)))}catch(x){}
 try{say('📈 Catalogue boost: +'+tot.toLocaleString()+' streams across your songs, paid out now: '+$$(e))}catch(x){}
 try{snd('chime')}catch(x){}
 if(Array.isArray(S.msgs))S.msgs.push({id:S.nid++,from:'Spotifly Team',body:'Your whole catalogue got a boost: +'+tot.toLocaleString()+' extra streams across your songs, worth '+$$(e)+', paid out now.',state:9,unread:1,day:S.day})}
{const u0=update;update=function(dt){try{if(typeof S!='undefined'&&S&&S.songs&&mode=='play')haloCatchUp()}catch(e){console.error('catch-up failed',e)}return u0.apply(this,arguments)}}
