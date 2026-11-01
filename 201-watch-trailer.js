/* ===== v49.45.0: Watch trailer from inside the game =====
   Opt-in "Watch trailer" buttons on the title screen, the pause menu and Settings > Game. Each opens the official trailer
   (the same YouTube video as wavefern.com/trailer) in a black and green overlay. Nothing autoplays on its own: the video
   only loads when the player chooses it. Close, Esc or a click outside goes back to exactly where they were. */
let WTR=null,WTRM=0;
function wtrOpen(){if(WTR)return;snd('click');
 try{if(MENUA&&!MENUA.paused){MENUA.pause();WTRM=1}}catch(e){}
 const o=document.createElement('div');o.id='wtr';
 o.innerHTML='<div class=wtb><div class=wth><b>WAVEFERN TRAILER</b><button class=go onclick="wtrClose()">Close</button></div><div class=wtv><iframe src="https://www.youtube.com/embed/VylJTzJzko4?rel=0&playsinline=1&origin='+encodeURIComponent(location.origin)+'" title="WaveFern Official Game Trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><a class=wtyt href="https://www.youtube.com/watch?v=VylJTzJzko4" target="_blank" rel="noopener">Video not showing? Open on YouTube</a><small>Esc or Close goes back to the game</small></div>';
 o.addEventListener('mousedown',e=>{if(e.target===o)wtrClose()});document.body.appendChild(o);WTR=o}
function wtrClose(){if(!WTR)return;WTR.remove();WTR=null;try{if(WTRM&&PAUSED&&menuOK())MENUA.play().catch(()=>{})}catch(e){}WTRM=0}
addEventListener('keydown',e=>{if(WTR&&e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();wtrClose()}},true);
{const st=document.createElement('style');st.textContent=`#wtr{position:fixed;inset:0;z-index:99999;background:#000d;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;pointer-events:auto}
#wtr .wtb{width:min(960px,100%);background:#0b0f0d;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,8px 8px 0 #000;padding:12px;display:flex;flex-direction:column;gap:10px;box-sizing:border-box}
#wtr .wth{display:flex;align-items:center;justify-content:space-between;gap:10px}#wtr .wth b{font-family:'Silkscreen',ui-monospace,monospace;color:#2fe68a;font-size:clamp(14px,3vw,20px);letter-spacing:1px}
#wtr .wth button{font-family:'Silkscreen',ui-monospace,monospace;padding:8px 14px}
#wtr .wtv{position:relative;width:100%;aspect-ratio:16/9;background:#000;border:3px solid #000}#wtr iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
#wtr .wtyt{font-family:'Silkscreen',ui-monospace,monospace;color:#06210f;background:#2fe68a;border:3px solid #000;box-shadow:4px 4px 0 #000;padding:10px 14px;text-align:center;text-decoration:none}#wtr .wtv{background:#000 url(https://i.ytimg.com/vi/VylJTzJzko4/maxresdefault.jpg) center/cover}#wtr small{color:#8aa094;text-align:center}
.wtbtn{font-family:'Silkscreen',ui-monospace,monospace}`;document.head.appendChild(st)}
/* the title screen and the pause menu get a button after they draw */
const wtrBtn='<button class=wtbtn onclick="wtrOpen()">Watch trailer</button>';
{const t0=titleUI;titleUI=function(){const r=t0.apply(this,arguments);try{const b=document.querySelector('#ttl .ttbx'),w=b&&[...b.children].find(x=>/ttWiki/.test(x.getAttribute('onclick')||''));if(w&&!b.querySelector('.wtbtn'))w.insertAdjacentHTML('afterend',wtrBtn)}catch(e){}return r}}
{const p0=pauseUI;pauseUI=function(){const r=p0.apply(this,arguments);try{const m=document.getElementById('pzm');if(m&&!m.querySelector('.wtbtn'))m.insertAdjacentHTML('beforeend',wtrBtn)}catch(e){}return r}}
{const b0=stBody;stBody=function(){const h=b0.apply(this,arguments);if(STAB!='game')return h;return h+'<div class=so><span>Official trailer<small class=m>Watch it here, then come back</small></span><button class=wtbtn onclick="wtrOpen()">Watch</button></div>'}}
