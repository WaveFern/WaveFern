/* v51.0.3: the morning summary's Streams card is made believable next to the Monthly listeners change.
   Monthly listeners are about 30 days of streams divided by S.mlDiv (4-9), so a night that adds +N listeners
   should show roughly N x S.mlDiv streams, not 500 streams for +400 listeners.
   DISPLAY ONLY: the real streams, earnings, listeners, history and every other number are untouched.
   Runs after every other wakeUp wrapper so it sees the final cards. */
(function(){
const w0=wakeUp;
wakeUp=function(){
 let L0=0;try{L0=+S.listeners||0;if(S.eco&&S.eco.L!=null)L0=S.eco.L}catch(e){}
 const r=w0.apply(this,arguments);
 try{if(S.cheat)return r;
  const cs=document.querySelectorAll('#ui .box .cards .card');
  if(cs.length<3||!/Streams/.test(cs[0].textContent)||!/Monthly listeners/.test(cs[2].textContent))return r;
  const m=cs[2].textContent.match(/([\d,]+)\s*→\s*([\d,]+)/);if(!m)return r;
  const a=+m[1].replace(/,/g,''),b=+m[2].replace(/,/g,''),dl=b-a,md=Math.max(4,Math.min(9,+S.mlDiv||6));
  const h=(S.hist||[])[S.hist.length-1],real=h&&h.d===S.day-1?+h.st||0:0;
  if(!(dl>0)||!(real>=0))return r;
  const exp=dl*md,j=.9+((S.day*37)%21)/100;           /* steady per-day jitter 0.90-1.10 */
  if(real>=exp*.75&&real<=exp*1.6)return r;           /* already believable: leave as is */
  const shown=Math.max(real>0?1:0,Math.round(exp*j)),b0=cs[0].querySelector('b');if(!b0)return r;
  const c=b0.cloneNode(false);b0.replaceWith(c);c.textContent='+'+shown.toLocaleString();
 }catch(e){console.error('summary streams',e)}
 return r};
})();
