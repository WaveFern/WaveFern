/* ---------- v49.60.0: people who message you are mostly your size; big collabs pay more ----------
   1. Six more fictional artists between 19M and 56M monthly listeners, appended to the end of ART (saves refer to artists by index),
      so a player at 30M has several artists of their own size to hear from.
   2. dmWeight (75-collab-fees-dms.js) gets a size curve on top of its old one. Compared with your monthly listeners:
      0.8x to 1.4x is the most common, 0.6x to 2x is common, 3x or more bigger is rare (a star 10x your size almost never writes,
      and a bit less rarely once you are famous yourself), and tiny artists next to you are less common than before.
      Nobody is locked out: Drake can still message a 30M player, just very rarely. Saves keep working (nothing is saved for this).
   3. Being featured with a real artist pays more: their fans stream your song about 3x as much as before (it was scaled back 10x
      when real artists became 10x bigger, now it is scaled back about 3x). */
[
 ['Nico Valdez','Latin',19e6,'skin=3 hair=1 hc=#1b1b1f eyes=0 mouth=3 top=1 tc=#e67e22 pc=#111114 body=30 hgt=60','hype'],
 ['Juno Park','Pop',26e6,'skin=1 hair=15 hc=#2b2b30 eyes=4 mouth=3 top=1 tc=#c39bd3 pc=#2c3e50 body=15 hgt=50','goofy'],
 ['Cal Whitfield','Country',33e6,'skin=0 hair=2 hc=#7a5a3a eyes=0 mouth=0 top=0 tc=#a04030 pc=#2c3e50 body=55 hgt=72','chill'],
 ['Sable Rhodes','R&B',38e6,'skin=5 hair=19 hc=#151517 eyes=8 mouth=0 top=2 tc=#6c3483 pc=#1e1e24 body=20 hgt=58','formal'],
 ['Dex Monarch','Hip-Hop',45e6,'skin=4 hair=1 hc=#0f0f10 eyes=0 mouth=0 top=0 tc=#1e8449 pc=#111114 body=50 hgt=70','hype'],
 ['Faye Lindqvist','Indie',56e6,'skin=0 hair=13 hc=#d9b36c eyes=5 mouth=0 top=2 tc=#2e4a6a pc=#3a3a40 body=20 hgt=55','shy']
].forEach(r=>{if(ART.some(a=>a[0]==r[0]))return;const L=r[2],fee=Math.round(100000*Math.sqrt(L/15e6)/500)*500;
 ART.push([r[0],r[1],L,fee,lookFromCode(r[3]),r[4],'',0,0,1])});
if(typeof MKT!='undefined')MKT=null;if(typeof MKT_R!='undefined')MKT_R=null;

{const w0=dmWeight;dmWeight=function(i){const w=w0.apply(this,arguments);if(!(w>0))return w;const a=ART[i];if(!a)return w;
  const L=Math.max(S.listeners||0,5),r=a[2]/L;let m;
  if(r>=.8&&r<=1.4)m=5;else if(r>=.6&&r<=2)m=2.5;else if(r>=.35&&r<=3)m=.8;
  else if(r<.35)m=.4;
  else m=.4*(1+Math.min(4,L/5e7));/* 3x or more bigger: rare, a little less rare for a famous player */
  return w*m}}

{const p1=planOf;planOf=function(s){if(!s||!s.ft||!REAL_SET.has(s.ft)||s.pd===S.day)return p1.apply(this,arguments);const k=PERF.featLis;PERF.featLis=k*3;try{return p1.apply(this,arguments)}finally{PERF.featLis=k}}}

/* ---------- v49.60.1: the featured-artist streams follow a real song's curve (featCurve in 29-v26.js), and old collab songs are caught up once ----------
   A song already out gets, one time, the streams its featured artist's fans would have given it so far under the new curve, minus what it already had.
   Only the song's lifetime total moves (not this month's streams), so monthly listeners do not jump. s.fv marks a song as done. */
{const p2=planOf;planOf=function(s){
  if(s&&s.ft&&s.fv!==1&&s.pd!==S.day){try{s.fv=1;const AL=artLis(s);if(AL>0){const age=Math.max(0,S.day-s.day),k=REAL_SET.has(s.ft)?PERF.featLis*3/REAL_X:PERF.featLis;let sum=0;for(let a=0;a<age;a++)sum+=featCurve(a);
    const want=Math.round(AL*k*sum*qualF(s)*(1+(s.op||0)*.12)*(s.lk=='h'?s.hm||1:1)),add=Math.max(0,want-(s.fs||0));
    if(add>0){s.fs=(s.fs||0)+add;s.streams=(s.streams||0)+add;S.streams=(S.streams||0)+add}}}catch(e){}}
  return p2.apply(this,arguments)}}

/* ---------- v49.60.2: old songs can catch fire again ----------
   Every day each song that is a week or more old and has had no luck so far has a very small chance to turn into a hit or to go viral,
   much smaller than the one-off roll on release day (hit: 1/500 of it per day, viral: 1/30 of it per day; about 0.02% and 0.001% a day
   for a good song, so with a big catalogue it is a rare surprise, not a routine). Same rewards as a release-day hit or viral song.
   A song's daily streams fade with its age, so a revived song also restarts that fade from today (s.rv) and gets its used-up
   stream room back (s.rc). It can only happen once per song (it is a hit or viral from then on). */
{const p3=planOf;planOf=function(s){
  if(s&&s.lk===0&&s.pd!==S.day&&S.day-s.day>=7){try{
    if(Math.random()<viralChance(s.q)/30){s.lk='v';s.vr=Math.round(PERF.viralMin+(S.listeners||0)*R(PERF.viralLisMin,PERF.viralLisMax));s.vt=s.vr;s.rv=S.day;s.rc=Math.max(0,(s.streams||0)-(s.fs||0));luckNote(s)}
    else if(Math.random()<hitChance(s.q)/500){s.lk='h';s.hm=+R(PERF.hitMin,PERF.hitMax).toFixed(2);s.rv=S.day;s.rc=Math.max(0,(s.streams||0)-(s.fs||0));luckNote(s)}}catch(e){}}
  return p3.apply(this,arguments)}}
