/* ===== v49.93.34: a booked collab lapses if you keep the artist waiting more than one in-game day =====
   state 1 = booked, the artist waits at the meeting place. m.bookT stamps when the wait began (day*600+time of day, so it is exact).
   Past one full day the booking is cancelled: the money moves back (refundM refunds the fee you paid, or hands back what they paid you),
   the artist sends a passive aggressive text, the waiting figure is removed and the chat goes back to open terms.
   Saves made mid-wait have no stamp, so the clock starts the first time the game sees them. */
const LAPSE_DAY=600;
const LAPSE_TXT=['oh hey. so I waited for you all day. no worries though, it is not like I had anything else going on.',
 'just wondering where you were? I stood there for a whole day. it is fine, really.',
 'so you were just not going to show up? cool cool. I kept my day free for nothing.',
 'hope whatever you were doing was really important, because I waited around for you all day.',
 'wow. a whole day waiting and not even a text. I cancelled it and sent your money back.',
 'no, no, do not worry about me, I only waited all day. where were you?',
 'I am not mad, just curious what was more important than the session we booked. I waited a full day.'];
const lapseNow=()=>S.day*600+(S.t||0);
function lapseCheck(){
 if(typeof S=='undefined'||!S||!S.msgs)return;
 S.msgs.forEach(m=>{
  if(m.a===undefined)return;
  if(m.state!=1){if(m.bookT!==undefined)delete m.bookT;return}
  if(m.bookT===undefined){m.bookT=lapseNow();return}
  if(lapseNow()-m.bookT<=LAPSE_DAY)return;
  const a=ART[m.a];if(!a)return;
  const had=m.recv?'recv':m.paid?'paid':'';
  try{refundM(m)}catch(e){console.error(e)}
  m.state=0;m.stage=2;m.ready=1;m.paid=0;m.recv=0;delete m.bookT;
  m.rel=(m.rel||0)-1;m.unread=1;
  m.log.push({f:'a',t:deco(a,pick(LAPSE_TXT)),d:S.day});
  try{syncArt()}catch(e){}
  try{updateVersion()}catch(e){}
  try{snd('ping')}catch(e){}
  say(a[0]+' waited a whole day for you and cancelled the collab.'+(had?(had=='paid'?' Your fee was refunded.':' You gave their payment back.'):''));
  if(mode=='pc'&&typeof pcR=='function')try{pcR()}catch(e){}
 })}
{const s0=syncArt;syncArt=function(){const r=s0.apply(this,arguments);try{S.msgs.forEach(m=>{if(m.a!==undefined&&m.state==1&&m.bookT===undefined)m.bookT=lapseNow()})}catch(e){}return r}}
let _lapseK=0;
{const u0=update;update=function(dt){u0(dt);if(mode=='cut'||PAUSED)return;_lapseK+=dt;if(_lapseK<1)return;_lapseK=0;try{lapseCheck()}catch(e){console.error('collab lapse',e)}}}
{const lc=loadCode;loadCode=function(c){const r=lc(c);try{S.msgs.forEach(m=>{if(m.a!==undefined&&m.state==1&&m.bookT===undefined)m.bookT=lapseNow()})}catch(e){}return r}}
