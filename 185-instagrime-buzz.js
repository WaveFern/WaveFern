/* ===== v49.34.0: Instagrime only posts when you post, and posting pays =====
   Songs, albums, tour shows, festival sets and selfies no longer add a post for you (that code is gone from those files).
   A post lifts every song's streams: +15% for the rest of today and +8% tomorrow.
   Going quiet costs a little once you have Instagrime: from the 4th day without a post, -1% a day, never more than -5%.
   The account page shows the current effect next to the post buttons. */
const IGB={now:.15,next:.08,grace:3,step:.01,max:.05};
const igbOn=()=>!!(S.apps&&S.apps.ig)&&!(typeof TRL!='undefined'&&(TRL.on||TRL.run));
/* days since the last post (or since this save first had Instagrime, so older saves start fresh) */
function igbIdle(){if(S.igSince==null)S.igSince=S.day;return S.day-Math.max(S.lastPost||0,S.igSince)}
function igbM(){if(!igbOn())return 1;const lp=S.lastPost||0;if(lp>0&&lp==S.day)return 1+IGB.now;if(lp>0&&lp==S.day-1)return 1+IGB.next;
 const d=igbIdle()-IGB.grace;return d>0?1-Math.min(IGB.max,IGB.step*d):1}
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!(v>0))return v;
 try{const m=igbM();if(m==1)return v;const x=(s.vx||0)+(s.fx||0),n=v-x,nv=Math.round(n*m);s.pv=x+Math.max(0,m>1?Math.min(nv,Math.max(n,Math.round(songCap(s)-x))):nv);return s.pv}catch(e){return v}}}
/* posting lifts the rest of today's streams straight away */
function igbNow(){(S.songs||[]).forEach(s=>{if(s.pd!==S.day)return;const n=Math.max(0,(s.pv||0)-(s.vx||0)-(s.fx||0)),room=Math.max(0,songCap(s)-((s.pv||0)-(s.acc||0)));
 const add=Math.min(room,Math.round(n*IGB.now));if(add>0)s.pv+=add})}
{const mk0=mkPost;mkPost=function(){const was=S.lastPost;const r=mk0.apply(this,arguments);
 try{if(S.lastPost==S.day&&was!=S.day&&igbOn()){igbNow();setTimeout(()=>{try{say('Posted · streams +'+Math.round(IGB.now*100)+'% today, +'+Math.round(IGB.next*100)+'% tomorrow')}catch(e){}},0)}}catch(e){console.error('instagrime buzz',e)}return r}}
/* a nudge on the first morning the account goes stale */
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{if(igbOn()&&(S.songs||[]).length&&igbIdle()==IGB.grace+1)setTimeout(()=>{try{say('Your Instagrime has gone quiet. Post to get your streams moving again.')}catch(e){}},2500)}catch(e){}return r}}
function igbTag(){if(!igbOn())return'';const m=igbM();if(m==1)return'';const p=Math.round((m-1)*100);
 return ` <span style="font-size:12px;padding:3px 8px;border-radius:10px;background:${p>0?'#1e3a26':'#3a2a1e'};color:${p>0?'#7dffa0':'#ffb27d'}">${p>0?'🔥 +'+p+'% streams':'💤 '+p+'% streams'}</span>`}
{const ig0=PA.ig;PA.ig=function(){let h=ig0.apply(this,arguments);try{if(igv=='acct'){const t=igbTag();if(t){const k=h.indexOf('Photo post</button>')>=0?'Photo post</button>':'>New post</button>';h=h.replace(k,k+t)}}}catch(e){}return h}}
