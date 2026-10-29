/* Soundtrack player (v48.4.0): the game's own soundtrack, played from the Credits page through a now-playing bar fixed
   to the bottom of the wiki. The bar sits outside #main, so the music keeps going while you move between pages. */
const OST=[['Track 1','../assets/track1.mp3',108],['Track 2','../assets/track2.mp3',104],['Track 3','../assets/track3.mp3',72],['Box','../audio/box.mp3',107],['Catch','../audio/catch.mp3',83],['Rocket','../audio/rocket.mp3',99],['Main menu','../menu.mp3',60]];
const PL={a:new Audio(),i:-1,drag:0};PL.a.preload='none';
try{const v=+localStorage.getItem('wk_vol');PL.a.volume=isNaN(v)||localStorage.getItem('wk_vol')==null?.7:v}catch(e){PL.a.volume=.7}
const mmss=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const PI={prev:'<svg viewBox="0 0 16 16"><rect x="3" y="3" width="2" height="10"/><path d="M13 3v10L6 8z"/></svg>',next:'<svg viewBox="0 0 16 16"><rect x="11" y="3" width="2" height="10"/><path d="M3 3v10l7-5z"/></svg>',
 play:'<svg viewBox="0 0 16 16"><path d="M4 2v12l10-6z"/></svg>',pause:'<svg viewBox="0 0 16 16"><rect x="3" y="2" width="4" height="12"/><rect x="9" y="2" width="4" height="12"/></svg>'};
function plBar(){let b=document.getElementById('pbar');if(b)return b;b=document.createElement('div');b.id='pbar';b.setAttribute('role','region');b.setAttribute('aria-label','Soundtrack player');
 b.innerHTML=`<div class=pnow><b id=pt></b><small class=m>Rowan Burton</small></div>
<div class=pmid><div class=pbtns><button id=pprev aria-label="Previous track">${PI.prev}</button><button id=pback aria-label="Back 10 seconds">-10</button><button id=pplay class=go aria-label="Play">${PI.play}</button><button id=pfwd aria-label="Forward 10 seconds">+10</button><button id=pnext aria-label="Next track">${PI.next}</button></div>
<div class=pseek><span id=pcur>0:00</span><input id=ppos type=range min=0 max=1000 value=0 aria-label="Seek"><span id=pdur>0:00</span></div></div>
<div class=pvol><label for=pvl class=m>Vol</label><input id=pvl type=range min=0 max=100 aria-label="Volume"><button id=px aria-label="Close player">x</button></div>`;
 document.body.appendChild(b);const $=id=>document.getElementById(id),a=PL.a;
 $('pvl').value=Math.round(a.volume*100);
 $('pplay').onclick=plToggle;$('pprev').onclick=()=>a.currentTime>3?a.currentTime=0:plPlay((PL.i+OST.length-1)%OST.length);$('pnext').onclick=()=>plPlay((PL.i+1)%OST.length);
 $('pback').onclick=()=>a.currentTime=Math.max(0,a.currentTime-10);$('pfwd').onclick=()=>a.currentTime=Math.min(a.duration||0,a.currentTime+10);
 $('ppos').oninput=e=>{PL.drag=1;$('pcur').textContent=mmss(e.target.value/1000*(a.duration||0))};
 $('ppos').onchange=e=>{PL.drag=0;if(a.duration)a.currentTime=e.target.value/1000*a.duration};
 $('pvl').oninput=e=>{a.volume=e.target.value/100;try{localStorage.setItem('wk_vol',a.volume)}catch(x){}};
 $('px').onclick=()=>{a.pause();b.remove();document.body.classList.remove('hasbar')};
 return b}
function plSync(){const b=document.getElementById('pbar'),a=PL.a,on=!a.paused;
 if(b){const $=id=>document.getElementById(id);$('pt').textContent=OST[PL.i]?OST[PL.i][0]:'';$('pplay').innerHTML=on?PI.pause:PI.play;$('pplay').setAttribute('aria-label',on?'Pause':'Play');
  const d=a.duration||(OST[PL.i]||[])[2]||0;$('pdur').textContent=mmss(d);if(!PL.drag){$('pcur').textContent=mmss(a.currentTime);$('ppos').value=d?Math.round(a.currentTime/d*1000):0}}
 document.querySelectorAll('.ost tr[data-i]').forEach(r=>{const me=+r.dataset.i==PL.i;r.classList.toggle('on',me);const k=r.querySelector('button');if(k)k.textContent=me&&on?'Pause':'Play'})}
function plPlay(i){const a=PL.a;if(i!==PL.i){PL.i=i;a.src=OST[i][1];a.currentTime=0}
 plBar();document.body.classList.add('hasbar');a.play().catch(()=>{});
 if('mediaSession' in navigator)try{navigator.mediaSession.metadata=new MediaMetadata({title:OST[i][0],artist:'Rowan Burton',album:'WaveFern Studios soundtrack'})}catch(e){}
 plSync()}
function plToggle(){if(PL.i<0)return plPlay(0);PL.a.paused?plPlay(PL.i):PL.a.pause()}
window.plRow=i=>{i==PL.i&&!PL.a.paused?PL.a.pause():plPlay(i)};
['play','pause','timeupdate','loadedmetadata'].forEach(e=>PL.a.addEventListener(e,plSync));
PL.a.addEventListener('ended',()=>plPlay((PL.i+1)%OST.length));
if('mediaSession' in navigator)try{const m=navigator.mediaSession;m.setActionHandler('play',()=>plPlay(Math.max(0,PL.i)));m.setActionHandler('pause',()=>PL.a.pause());
 m.setActionHandler('previoustrack',()=>plPlay((PL.i+OST.length-1)%OST.length));m.setActionHandler('nexttrack',()=>plPlay((PL.i+1)%OST.length))}catch(e){}
/* the track list on the Credits page */
window.ostTable=()=>`<div class=tw><table class="t ost"><thead><tr><th>#</th><th>Title</th><th>Length</th><th></th></tr></thead><tbody>${OST.map((t,i)=>`<tr data-i=${i}><td>${i+1}</td><td>${t[0]}</td><td>${mmss(t[2])}</td><td><button onclick="plRow(${i})">Play</button></td></tr>`).join('')}</tbody></table></div>`;
document.addEventListener('wiki:render',plSync);
