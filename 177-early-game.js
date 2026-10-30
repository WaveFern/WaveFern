/* ===== v49.25.0: a livelier start =====
   A brand-new artist used to get 1 or 2 streams a song, so the first days showed almost nothing for the work.
   Fresh Finds: while you have under 3,000 monthly listeners, Spotifly's playlist for new artists plays your songs too.
   Each song gets extra daily streams on top of its own (about 30 on release day for an average first song, more for
   better songs), fading as the song ages like any stream does, and fading out as your listeners grow, so it hands over
   to your own fans by about Fame tier 3. The song's stream cap still applies. Your first release gets a Spotifly Team
   message saying so, and the morning results say how many of the night's streams came from the playlist.
   State: s.ffx (the song's Fresh Finds streams in today's plan), S.ff (the welcome message was sent). Off in the trailer. */
(()=>{
const TR=()=>typeof TRL!='undefined'&&TRL.on;
const FF=28,FF_END=3000;
const fade=()=>Math.max(0,1-(+S.listeners||0)/FF_END);
const qm=s=>Math.max(.6,Math.min(2.2,(+s.q||0)/10));

{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!s)return v;s.ffx=0;
 try{const f=fade(),age=S.day-(s.day||0);if(TR()||!(f>0)||age<0||age>30)return v;
  const x=Math.round(FF*f*(Math.pow(.86,age)+.015)*(age==0?1.5:1)*qm(s)*R(.8,1.2)),cap=Math.max(0,Math.round(songCap(s)-(+v||0)));
  const add=Math.min(x,cap);if(!(add>0))return v;s.ffx=add;s.pv=(+v||0)+add;return s.pv}catch(e){return v}}}

/* the first release: a welcome from Spotifly */
{const u0=upl;upl=function(id){const n0=S.songs.length,r=u0.apply(this,arguments);
 try{if(!TR()&&S.songs.length>n0&&!S.ff&&fade()>0){S.ff=1;const s=S.songs[S.songs.length-1];
  if(Array.isArray(S.msgs))S.msgs.push({id:S.nid++,from:'Spotifly Team',body:'Welcome to Spotifly! "'+s.title+'" has been added to Fresh Finds, our playlist for new artists. It brings your songs extra plays while you build your first fans. Release more and every song gets its turn.',state:9,unread:1,day:S.day});
  setTimeout(()=>{try{say('"'+s.title+'" was added to Fresh Finds: extra plays while you are new')}catch(e){}},1200)}}catch(e){}return r}}

/* the morning results: how much of last night came from the playlist */
{const w0=wakeUp;wakeUp=function(){let ff=0;try{const d=S.day;(S.songs||[]).forEach(s=>{if(s.pd===d)ff+=+s.ffx||0})}catch(e){}
 const r=w0.apply(this,arguments);
 try{if(ff>0&&!TR()){const box=document.querySelector('#ui .box.modal'),cards=box&&box.querySelector('.cards');
  if(cards){const p=document.createElement('p');p.className='m';p.style.margin='6px 0';p.innerHTML='Fresh Finds playlist: <b style="color:var(--g)">'+ff.toLocaleString()+'</b> of these streams. It fades out as your own fans grow.';cards.after(p)}}}catch(e){}
 return r}}
})();
