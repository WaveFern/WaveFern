/* ===== v55.39.0: gentle key hints + the H controls card (loads last, `?nofirst` skips it) =====
   Why: the game is a lot at the start, and keys like N (map) and Tab (Music Mastery) were never shown early. This file:
   1 Key hint chip (#khint, top right): ONE short tip at a time, each shown once, in this order when it becomes useful:
     Shift run, N map (first time outside or after the first release), G Gphone and Tab Music Mastery (after the first release
     and the first night), F furniture (some cash or day 3). Paced: none before 40 s of play, 75 s between hints, never over a
     Big Vee box, card or pop-up. Fades after 14 s, has a close button, and pressing the key itself counts as learned.
   2 H opens the Controls card (every key, one list) any time in play; the pause menu has a Controls button; every chip says "H: all controls".
   3 Careers that are already past day 2 or have 3+ songs get no chips (the Controls card still works).
   Touch devices see button names (Map, Phone, Run, Storage) instead of keys. State S.kh={s:{id:1 once shown or learned},sec:play s,last:sec at last hint,off:1 hints turned off}.
   Test hook: window.FW_KEYS. */
(function(){
if(/[?&]nofirst/.test(location.search))return;
const safe=(f,d)=>{try{return f()}catch(e){return d}};
const K=()=>S.kh||(S.kh={s:{},sec:0,last:-999,off:0});
const touch=()=>safe(()=>!!window.WF_TOUCH&&WF_TOUCH(),false);
const nSong=()=>(S.songs||[]).length;
const ready=()=>typeof S!='undefined'&&S&&S.day>0&&typeof mode!='undefined'&&mode=='play'&&!(typeof PAUSED!='undefined'&&PAUSED)&&!$('load')&&!safe(()=>cr(),false);
const outside=()=>typeof P!='undefined'&&!IN&&(P.x<0||P.x>16||P.z>12||P.z<0);
/* id, key label, learned-by key, keyboard text, touch text, when it is useful */
const H=[
 ['run','Shift','shift','Hold Shift to run. The thin bar under your energy is stamina.','Tap Run (bottom right) to sprint.',()=>K().sec>=40&&!!(S.fs&&S.fs.mv)],
 ['map','N','n','Press N to open the map: every shop, venue and the city.','Tap Map (bottom right) for the map: shops, venues and the city.',()=>(outside()&&P.z>16&&!!(S.fs&&S.fs.mv))||nSong()>=1],
 ['phone','G','g','Press G for your Gphone: messages, Instagrime and food.','Tap Phone (bottom right) for messages, Instagrime and food.',()=>nSong()>=1&&S.day>=2],
 ['mast','Tab','tab','Press Tab to open Music Mastery: your long-term score, with rewards to unlock.','Tap the Tab · Mastery pill (bottom left): your long-term score and rewards.',()=>nSong()>=1&&S.day>=2],
 ['build','F','f','Press F to move or place furniture in your house.','Tap Storage (bottom right) to place furniture.',()=>nSong()>=1&&((+S.money||0)>=400||S.day>=3)]];
const LEARN={};H.forEach(h=>LEARN[h[2]]=h[0]);
let el=null,tm=0,cur='';
function css(){if($('khcss'))return;const s=document.createElement('style');s.id='khcss';s.textContent=`
#khint{position:fixed;right:10px;top:100px;z-index:57;width:min(270px,66vw);box-sizing:border-box;display:flex;gap:8px;align-items:flex-start;background:#0b0f0def;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 2px #2fe68a66,4px 4px 0 #0008;padding:8px 8px 7px 9px;font:12px/1.35 system-ui,sans-serif;color:#c9d8cf;animation:khin .25s ease-out}
#khint .kk{flex:none;min-width:22px;text-align:center;font:700 12px Silkscreen,ui-monospace,monospace;color:#0a0d0b;background:#ffd27a;border:2px solid #000;padding:3px 6px;box-shadow:0 3px 0 #0008}
#khint .kt{flex:1}#khint .kt small{display:block;margin-top:3px;color:#6f8578;font:10px Silkscreen,ui-monospace,monospace}
#khint .kx{flex:none;background:none;border:0;color:#8aa094;font:700 14px/1 system-ui;cursor:pointer;padding:0 2px;margin:0;box-shadow:none}
@keyframes khin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
#khcard .kr{display:flex;align-items:center;gap:10px;border-top:1px solid #2a352e;padding:5px 0;text-align:left}#khcard .kr b{flex:none;min-width:84px;color:#ffd27a;font:11px Silkscreen,ui-monospace,monospace}
@media (max-width:700px){#khint{top:96px;width:min(250px,62vw)}}`;document.head.appendChild(s)}
function hide(){clearTimeout(tm);tm=0;cur='';if(el){el.remove();el=null}}
function show(h){css();hide();const t=touch();cur=h[0];K().s[h[0]]=1;K().last=K().sec;
 el=document.createElement('div');el.id='khint';el.innerHTML='<span class=kk></span><span class=kt><span class=tx></span><small></small></span><button class=kx title="Close" aria-label="Close hint">✕</button>';
 el.querySelector('.kk').textContent=t?'TIP':h[1];el.querySelector('.tx').textContent=t?h[4]:h[3];
 el.querySelector('small').textContent=t?'Pause menu: Controls':'H: all controls';
 el.querySelector('.kx').onclick=()=>{safe(()=>snd('click'));hide()};document.body.appendChild(el);safe(()=>snd('ping'));
 tm=setTimeout(hide,14000)}
/* what blocks a hint: another box on screen */
const busy=()=>{const d=$('tdlg');return !!((d&&d.offsetParent)||$('fsr')||$('glr')||document.querySelector('#toast .pcard,#toast .tipT'))};
function tick(){if(!safe(()=>typeof S!='undefined'&&S&&S.day>0,0)||document.hidden)return;
 if(!ready()){if(el&&mode!='play')hide();return}
 const k=K();k.sec++;
 if(k.v==null){k.v=1;if(S.day>2||nSong()>=3){k.off=1;return}}/* an established career: no chips */
 if(k.off||el||busy()||k.sec<40||k.sec-k.last<75)return;
 const h=H.find(x=>!k.s[x[0]]&&safe(x[5],false));if(h)show(h)}
setInterval(tick,1000);
/* pressing the key itself means it is learned */
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||!safe(()=>typeof S!='undefined'&&S,0))return;
 const t=e.target&&e.target.tagName;if(/INPUT|TEXTAREA|SELECT/.test(t||''))return;const k=(e.key||'').toLowerCase();
 if(k=='h'&&safe(()=>mode=='play'&&!$('load')&&!cr(),false)){card(0);return}
 const id=LEARN[k];if(id&&safe(()=>mode=='play',false)){K().s[id]=1;if(cur==id)hide()}},true);
/* ---------- the Controls card ---------- */
const ROWS=[['W A S D','Walk (arrow keys too)'],['Shift','Hold to run'],['E or Space','Use what you stand at: laptop, mic, bed, doors'],['N','Map and taxi'],['G','Gphone: messages, Instagrime, food'],['Tab','Music Mastery'],['F','Furniture: move and place (R turns it)'],['M','Mute and unmute'],['Esc','Pause and Settings'],['H','This list']];
const TROWS=[['Joystick','Walk (bottom left)'],['Use','Use what you stand at'],['Run','Sprint (tap to toggle)'],['Map','Map and taxi'],['Phone','Gphone: messages, Instagrime, food'],['Storage','Move and place furniture'],['Tab · Mastery','Music Mastery pill (bottom left)'],['Pause','Pause and Settings']];
function card(fromPause){const t=touch(),rows=(t?TROWS:ROWS).map(r=>'<div class=kr><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join(''),k=safe(K,{off:0});
 css();if(!fromPause){mode='menu'}
 $('ui').innerHTML='<div id=khcard class="box modal"><h2>Controls</h2><p class=m><small>'+(t?'On a touch screen the buttons are at the bottom right.':'Press H any time to open this.')+'</small></p>'+rows
  +'<button id=khoff style="margin-top:8px">Key hints: '+(k.off?'off':'on')+'</button><button class=go onclick="'+(fromPause?'pauseUI()':'closeUI()')+'">'+(fromPause?'Back':'Got it')+'</button></div>';
 $('khoff').onclick=()=>{const q=K();q.off=q.off?0:1;if(q.off)hide();$('khoff').textContent='Key hints: '+(q.off?'off':'on');safe(()=>snd('click'))}}
if(typeof pauseUI=='function'){const p0=pauseUI;pauseUI=function(){p0.apply(this,arguments);const m=$('pzm');if(m){const b=document.createElement('button');b.textContent='Controls';b.onclick=()=>card(1);m.appendChild(b)}}}
window.FW_KEYS={hints:H.map(h=>h[0]),state:()=>K(),card,hide,tick,show:id=>{const h=H.find(x=>x[0]==id);if(h)show(h)}};
})();
