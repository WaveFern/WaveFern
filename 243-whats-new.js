/* WaveFern WHAT'S NEW pop-up (v55.8.0). Data lives in news-data.js (WF_NEWS, newest first). Every entry the player has not closed yet
   is shown once as a pixel style card (newest first, max 3 at a time). "Got it" remembers the newest id on this device (and per Google
   account). Brand new careers (day 1-2) skip old news. Never shows over the title screen, while paused, or on top of the must-read
   notice (205-announcement.js). Reopen any time: FW_NEWS.open(). ?nonews turns it off. */
(function(){
 if(/[?&]nonews/.test(location.search)||typeof WF_NEWS=='undefined'||!WF_NEWS.length)return;
 const KEY='fw_news_seen';
 const rd=k=>{try{return +localStorage.getItem(k)||0}catch(e){return 0}};
 const wr=(k,v)=>{try{localStorage.setItem(k,String(v))}catch(e){}};
 const uk=()=>{try{return typeof FBU!='undefined'&&FBU&&FBU.uid?KEY+'_'+FBU.uid:''}catch(e){return''}};
 const seen=()=>Math.max(rd(KEY),uk()?rd(uk()):0);
 const top=Math.max.apply(null,WF_NEWS.map(n=>n.id));
 const mark=()=>{wr(KEY,top);if(uk())wr(uk(),top)};
 const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
 function build(list){
  if(document.getElementById('wfnews'))return;
  const css=document.createElement('style');css.id='wfnewscss';
  css.textContent=`#wfnews{position:fixed;inset:0;z-index:99000;background:#000b;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}
#wfnews .nb{width:min(500px,100%);max-height:100%;display:flex;flex-direction:column;background:#0b0f0d;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 3px #2fe68a55,6px 6px 0 #0008;padding:16px}
#wfnews small.k{font:11px Silkscreen,ui-monospace,monospace;color:#2fe68a;letter-spacing:2px}
#wfnews .ns{overflow:auto;flex:1;min-height:60px;line-height:1.5;margin-top:6px}
#wfnews h2{font-size:18px;margin:2px 0 2px;color:#fff;text-shadow:3px 3px 0 #000}
#wfnews .nt{font:10px Silkscreen,ui-monospace,monospace;color:#7ad7ff;margin-bottom:4px}
#wfnews ul{margin:4px 0 12px;padding-left:18px}#wfnews li{margin:3px 0}
#wfnews button{font-family:Silkscreen,ui-monospace,monospace;padding:10px 16px;margin-top:10px;align-self:flex-end}`;
  document.head.appendChild(css);
  const o=document.createElement('div');o.id='wfnews';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  o.innerHTML='<div class=nb><small class=k>WHAT\'S NEW</small><div class=ns>'+list.map(n=>'<h2>'+esc(n.t)+'</h2><div class=nt>'+esc(n.tag||'UPDATE')+' · '+esc(n.v)+' · '+esc(n.d)+'</div><ul>'+n.items.map(i=>'<li>'+i+'</li>').join('')+'</ul>').join('')+'</div><button class=go id=wfnok>Got it</button></div>';
  document.body.appendChild(o);
  const close=()=>{mark();try{snd('click')}catch(e){}o.remove();css.remove();document.removeEventListener('keydown',kd,true)};
  const kd=e=>{if(e.key=='Escape'||e.key=='Enter'){e.stopPropagation();e.preventDefault();close()}else if(o.contains(e.target)||e.target===document.body)e.stopPropagation()};
  document.addEventListener('keydown',kd,true);
  o.querySelector('#wfnok').onclick=close;
 }
 const fresh=()=>{try{return (+S.day||1)<=2&&!(S.songs||[]).length}catch(e){return false}};
 let first=true;
 const tick=()=>{try{
  if(document.getElementById('wfnews')||document.getElementById('annov'))return;
  const l=document.getElementById('load');if(l&&getComputedStyle(l).display!='none')return;
  if(typeof mode=='undefined'||(mode!='play'&&mode!='drive'))return;
  if(typeof PAUSED!='undefined'&&PAUSED)return;
  if(!(S&&S.artist))return;
  const s=seen();
  if(s>=top){return}
  if(first&&!s&&fresh()){mark();return}
  first=false;
  build(WF_NEWS.filter(n=>n.id>s).sort((a,b)=>b.id-a.id).slice(0,3));
 }catch(e){}};
 setInterval(tick,3000);
 window.FW_NEWS={open:()=>build(WF_NEWS.slice(0,3)),seen};
})();
