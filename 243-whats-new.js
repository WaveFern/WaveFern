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
 const txt=n=>'<h2>'+esc(n.t)+'</h2><div class=nt>'+esc(n.tag||'UPDATE')+' · '+esc(fwShowVer(n.v))+' · '+esc(n.d)+'</div><ul>'+n.items.map(i=>'<li>'+i+'</li>').join('')+'</ul>';
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
#wfnews .sl{display:none}#wfnews .sl.on{display:block}#wfnews .sl img{width:100%;display:block;border:2px solid #000}#wfnews .sl p{margin:8px 0 0}
#wfnews .dots{display:flex;gap:6px;justify-content:center;margin-top:8px}#wfnews .dots i{width:8px;height:8px;background:#2a352e}#wfnews .dots i.on{background:#2fe68a}
#wfnews .nav{display:flex;gap:8px;justify-content:flex-end}#wfnews .nav button{margin-top:10px}
#wfnews button{font-family:Silkscreen,ui-monospace,monospace;padding:10px 16px;margin-top:10px;align-self:flex-end}`;
  document.head.appendChild(css);
  const o=document.createElement('div');o.id='wfnews';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  const sl=list[0]&&list[0].slides&&list[0].slides.length?list[0]:null;
  let slides=null,at=0;
  if(sl){slides=sl.slides.map(x=>'<div class=sl><img src="'+esc(x.img)+'" alt=""><p>'+x.c+'</p></div>').concat(['<div class=sl>'+txt(sl)+(sl.link&&typeof WF_LINKS!='undefined'?'<button class=go id=wfnlink style="width:100%;margin:0 0 12px">Read the full newsletter</button>':'')+list.slice(1).map(txt).join('')+'</div>'])}
  o.innerHTML='<div class=nb><small class=k>WHAT\'S NEW</small><div class=ns>'+(slides?slides.join('')+'</div><div class=dots>'+slides.map(()=>'<i></i>').join('')+'</div><div class=nav><button id=wfnprev>Back</button><button id=wfnnext>Next</button><button class=go id=wfnok>Got it</button></div></div>':list.map(txt).join('')+'</div><button class=go id=wfnok>Got it</button></div>');
  document.body.appendChild(o);
  const close=()=>{mark();try{snd('click')}catch(e){}o.remove();css.remove();document.removeEventListener('keydown',kd,true)};
  const go=d=>{if(!slides)return;at=Math.max(0,Math.min(slides.length-1,at+d));o.querySelectorAll('.sl').forEach((e,i)=>e.classList.toggle('on',i==at));o.querySelectorAll('.dots i').forEach((e,i)=>e.classList.toggle('on',i==at));const L=at==slides.length-1;o.querySelector('#wfnprev').style.visibility=at?'visible':'hidden';o.querySelector('#wfnnext').style.display=L?'none':'';o.querySelector('#wfnok').style.display=L?'':'none'};
  if(slides){go(0);o.querySelector('#wfnprev').onclick=()=>{try{snd('click')}catch(e){}go(-1)};o.querySelector('#wfnnext').onclick=()=>{try{snd('click')}catch(e){}go(1)};
   const nl=o.querySelector('#wfnlink');if(nl)nl.onclick=()=>ttLink(sl.link);
   let x0=null;o.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});o.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)go(dx<0?1:-1)},{passive:true})}
  const kd=e=>{if(slides&&(e.key=='ArrowRight'||e.key=='ArrowLeft'||(e.key=='Enter'&&at<slides.length-1))){e.stopPropagation();e.preventDefault();go(e.key=='ArrowLeft'?-1:1);return}
   if(e.key=='Escape'||e.key=='Enter'){e.stopPropagation();e.preventDefault();close()}else if(o.contains(e.target)||e.target===document.body)e.stopPropagation()};
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
