/* ---------- must-read announcements (v49.70.0) ----------
   One full-screen notice that every player sees once and has to actually read: the Close button stays off until the
   text has been scrolled to the bottom AND a short timer has run out. After that it is remembered, per announcement id,
   on this device (and per Google account when signed in), so it never comes back.
   To send a NEW announcement later: change ANN.id (and the text), and everyone sees it once more.
   ANN.enabled=false switches the whole thing off.

   OPEN QUESTIONS FOR JAMES (nothing below is decided; the fields marked TODO show "to be announced" to players until filled in):
   - TODO reset scope: exactly what is wiped and what is kept (ANN.scope).
   - TODO reset date (ANN.date).
   - TODO Founder reward: badge or cosmetic for early players (ANN.founder).
   This file only SHOWS a notice. It does not wipe, reset or change any save. */
(function(){
 const ANN={
  id:'fresh-start-1',
  enabled:true,
  minSeconds:8,                /* the Close button cannot work before this many seconds have passed */
  date:null,                   /* TODO: e.g. 'Saturday 14 November'. null shows "Date to be announced". */
  scope:null,                  /* TODO: plain-words list of what is wiped / kept. null shows "To be announced". */
  founder:null,                /* TODO: what early players get, e.g. 'a Founder badge'. null shows "To be announced". */
  keepBackup:true              /* the Export save backup exists today (Settings > Save), so it can be mentioned as fact */
 };
 if(!ANN.enabled)return;
 const KEY='fw_ann_seen';
 const rd=k=>{try{const v=JSON.parse(localStorage.getItem(k));return Array.isArray(v)?v:[]}catch(e){return[]}};
 const uk=()=>{try{return typeof FBU!='undefined'&&FBU&&FBU.uid?KEY+'_'+FBU.uid:''}catch(e){return''}};
 const seen=()=>rd(KEY).includes(ANN.id)||(uk()&&rd(uk()).includes(ANN.id));
 const mark=()=>{for(const k of [KEY,uk()]){if(!k)continue;try{const a=rd(k);if(!a.includes(ANN.id)){a.push(ANN.id);localStorage.setItem(k,JSON.stringify(a))}}catch(e){}}};
 if(/[?&]trailer\b/.test(location.search)||window.FW_TRAILER)return;
 const tba=(v,t)=>v?String(v).replace(/[<>&]/g,''):'<i>'+t+'</i>';
 function build(){
  const css=document.createElement('style');
  css.textContent=`#annov{position:fixed;inset:0;z-index:100000;background:#000d;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;user-select:text}
#annov .annb{width:min(560px,100%);max-height:100%;display:flex;flex-direction:column;background:#0b0f0d;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 3px #2fe68a55,6px 6px 0 #0008;padding:16px}
#annov small.k{font:11px Silkscreen,ui-monospace,monospace;color:var(--g);letter-spacing:2px}
#annov h2{font-size:20px;margin:4px 0 10px;color:#fff;text-shadow:3px 3px 0 #000}
#annov .anns{overflow:auto;flex:1;min-height:80px;padding-right:8px;line-height:1.5;border-top:2px solid #1c2620;border-bottom:2px solid #1c2620;padding-top:8px;padding-bottom:8px;-webkit-overflow-scrolling:touch}
#annov h3{font-size:13px;color:var(--g);margin:14px 0 4px}#annov h3:first-child{margin-top:2px}
#annov p{margin:0 0 8px}#annov ul{margin:0 0 8px;padding-left:18px}#annov li{margin:3px 0}
#annov a{color:var(--g);text-decoration:underline}
#annov .annf{display:flex;align-items:center;gap:10px;margin-top:12px}
#annov .annf span{flex:1;font-size:12px;color:var(--m)}
#annov .annf button{font-family:Silkscreen,ui-monospace,monospace;padding:10px 16px}`;
  document.head.appendChild(css);
  const o=document.createElement('div');o.id='annov';o.tabIndex=-1;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  o.innerHTML=`<div class=annb><small class=k>READ THIS FIRST</small><h2>A fresh start is coming</h2><div class=anns>
<h3>What is happening</h3>
<p>Early players could earn huge amounts of money very quickly because of bugs. That is not fair to anyone, and it makes the game worse for everyone who plays it properly. So WaveFern is going to give every player a clean start.</p>
<p>This is a reset of everyone's progress. It is not a new release of the game.</p>
<h3>When</h3><p>${tba(ANN.date,'Date to be announced')}</p>
<h3>What gets reset and what you keep</h3><p>${tba(ANN.scope,'To be announced')}</p>
<h3>Thank you, early players</h3><p>${tba(ANN.founder,'To be announced')}</p>
<h3>Back up your career first</h3><p>${ANN.keepBackup?'You can keep a copy of your current career any time: open Settings, go to Save and press Export save. It downloads a file with every career on this device. See <a href="/wiki/saves/" target="_blank" rel="noopener">Saves and careers</a>.':''}</p>
<h3>What you can play with</h3>
<ul><li><b>Friends</b>: pick a username, send and accept friend requests, see who is online, and invite a friend into your band room.</li>
<li><b>Band rooms</b>: play as a band of up to four, with band chat. Keep a band streak going and finish three daily band goals for rewards. <a href="/wiki/band-rooms/" target="_blank" rel="noopener">Read about band rooms</a>.</li></ul>
<h3>Still to come</h3>
<ul><li><b>Public profiles</b>: a page for your artist that other players can look at. This is not in the game yet.</li></ul>
<p>The <a href="/wiki/" target="_blank" rel="noopener">WaveFern wiki</a> has a guide to every part of the game.</p>
</div><div class=annf><span id=annst></span><button id=anncl class=go disabled>Close</button></div></div>`;
  document.body.appendChild(o);
  const s=o.querySelector('.anns'),b=o.querySelector('#anncl'),st=o.querySelector('#annst');
  let left=ANN.minSeconds,bottom=false,done=false;
  const bot=()=>s.scrollTop+s.clientHeight>=s.scrollHeight-6;
  const upd=()=>{if(bot())bottom=true;const ok=bottom&&left<=0;b.disabled=!ok;
   st.textContent=ok?'':(!bottom?'Scroll to the bottom to continue':'Please keep reading ('+left+')')};
  s.addEventListener('scroll',upd);
  const t=setInterval(()=>{if(left>0)left--;upd();if(left<=0&&bottom)clearInterval(t)},1000);
  b.onclick=()=>{if(b.disabled||done)return;done=true;clearInterval(t);mark();try{snd('click')}catch(e){}o.remove();css.remove();document.removeEventListener('keydown',kd,true)};
  /* keep the game from reacting to keys behind the notice */
  const kd=e=>{if(!o.contains(e.target)&&e.target!==document.body)return;if(e.key=='Escape'||e.key==' '||e.key=='Enter'){}
   e.stopPropagation()};
  document.addEventListener('keydown',kd,true);
  upd();setTimeout(upd,300);
 }
 let waited=0;
 const go=()=>{if(seen())return;
  const l=document.getElementById('load');if(l&&getComputedStyle(l).display!='none')return setTimeout(go,500);
  waited+=1;
  /* show on the title screen; a player who lands straight in the game still gets it after 20 seconds */
  const title=typeof mode!='undefined'&&mode=='title'&&document.getElementById('ttl');
  if(!title&&waited<20)return setTimeout(go,1000);
  if(!document.getElementById('annov'))build()};
 go();
})();
