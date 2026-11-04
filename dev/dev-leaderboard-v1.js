/* WaveFern dev leaderboard (dummy data). Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Adds a Leaderboard button to the main menu (and the pause menu). The screen has a tab per category: Time played, Listeners,
   Streams, Money, Fame level, Songs released, Followers. The rows are made-up artists; the player is ranked among them using their real stats.
   All data comes from LB.board(cat), which is the one function to swap for the real cloud list later. Add ?nolb to the address to skip it. */
(function(){
 if(!window.FW_DEV||/[?&]nolb/.test(location.search))return;
 if(typeof titleUI!='function'||typeof pauseUI!='function')return;
 const LB=window.LB={};
 const f=n=>Math.round(n||0).toLocaleString();
 const CATS=[
  {k:'day',t:'Time played',u:'days',me:()=>S.day||1,fmt:v=>f(v)+' d',max:900,pw:1.4},
  {k:'lis',t:'Listeners',u:'monthly',me:()=>S.listeners||0,fmt:f,max:80e6,pw:3.2},
  {k:'str',t:'Streams',u:'total',me:()=>S.streams||0,fmt:f,max:3e9,pw:3.4},
  {k:'mon',t:'Money',u:'now',me:()=>S.money||0,fmt:v=>'$'+f(v),max:50e6,pw:3.2},
  {k:'fame',t:'Fame level',u:'level',me:()=>{try{return fameLevel()}catch(e){return 0}},fmt:v=>'Lv '+f(v),max:60,pw:1.6},
  {k:'sg',t:'Songs released',u:'songs',me:()=>(S.songs||[]).length,fmt:f,max:400,pw:1.8},
  {k:'fol',t:'Followers',u:'total',me:()=>S.followers||0,fmt:f,max:60e6,pw:3.2}
 ];
 const A=['Neon','Velvet','Lil','Young','Big','DJ','MC','Saint','Mona','Kid','Ghost','Pixel','Sunny','Dark','Cosmo','Nova','Rusty','Lucky','Wild','Chrome'];
 const B=['Fern','Wave','Mango','Static','Comet','Echo','Drift','Pepper','Bloom','Cipher','Harbor','Jett','Orbit','Tango','Willow','Zephyr','Moss','Flare','Quill','Riot'];
 function rng(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 /* fixed fake players, the same every time the screen opens */
 const NAMES=(()=>{const r=rng(7),seen={},o=[];while(o.length<40){const n=A[(r()*A.length)|0]+' '+B[(r()*B.length)|0];if(!seen[n]){seen[n]=1;o.push(n)}}return o})();
 const meName=()=>S.artist||'You';
 /* the one function to replace with the real cloud list: returns [{name,v,me}] sorted high to low */
 LB.board=function(k){
  const c=CATS.find(x=>x.k==k),r=rng(k.split('').reduce((a,ch)=>a*31+ch.charCodeAt(0),11)),rows=NAMES.map((n,i)=>{
   const p=Math.pow((i+1)/NAMES.length,c.pw);return{name:n,v:Math.max(1,Math.round(c.max*(1-p*.985)*(.9+r()*.2))),me:0}});
  rows.push({name:meName(),v:c.me(),me:1});
  rows.sort((a,b)=>b.v-a.v||b.me-a.me);return rows};
 let cur=0,back='title';
 const css='<style>#lbd .tabs{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}#lbd .tabs button{padding:6px 8px;font-size:.8em;border:3px solid #000;box-shadow:3px 3px 0 #000}#lbd .tabs button.on{background:#ffd23f;color:#000}'+
  '#lbd .list{max-height:48vh;overflow:auto;border:3px solid #000;background:rgba(0,0,0,.35)}#lbd .row{display:flex;gap:10px;padding:6px 8px;border-bottom:2px solid rgba(0,0,0,.5)}#lbd .row b.r{width:2.4em;text-align:right}#lbd .row span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '#lbd .row.me{background:#ffd23f;color:#000;font-weight:bold;position:sticky;top:0;bottom:0}#lbd .row.top1 b.r{color:#ffd23f}</style>';
 function draw(){
  const c=CATS[cur],rows=LB.board(c.k),mi=rows.findIndex(x=>x.me);
  $('ui').innerHTML=css+`<div id=lbd class="box modal" style="width:min(460px,94vw);border:4px solid #000;box-shadow:6px 6px 0 #000"><h2>Leaderboard</h2>
   <div class=tabs role=tablist>${CATS.map((x,i)=>`<button role=tab class="${i==cur?'on':''}" onclick="LB.tab(${i})">${x.t}</button>`).join('')}</div>
   <p class=m style="margin:2px 0 6px">${c.t} (${c.u}) · you are <b>#${mi+1}</b> of ${rows.length}. Sample list, not real players yet.</p>
   <div class=list>${rows.slice(0,25).map((x,i)=>row(x,i)).join('')}${mi>=25?row(rows[mi],mi):''}</div>
   <p class=m><small>Arrow keys change tab. Esc goes back.</small></p><div class=row2><button class=go onclick="LB.close()">Back</button></div></div>`;
  function row(x,i){return`<div class="row${x.me?' me':''}${i==0?' top1':''}"><b class=r>${i+1}</b><span>${esc(x.name)}${x.me?' (you)':''}</span><b>${esc(c.fmt(x.v))}</b></div>`}
  const me=document.querySelector('#lbd .row.me');if(me&&mi>=25)me.style.position='static'}
 LB.tab=i=>{cur=(i+CATS.length)%CATS.length;draw()};
 LB.open=function(from){back=from||(typeof TT!='undefined'&&TT.on?'title':'pause');cur=0;draw();addEventListener('keydown',key,true)};
 LB.close=function(){removeEventListener('keydown',key,true);if(back=='title')titleUI();else pauseUI()};
 function key(e){if(!document.getElementById('lbd')){removeEventListener('keydown',key,true);return}
  if(e.key=='ArrowRight'||e.key=='ArrowLeft'){LB.tab(cur+(e.key=='ArrowRight'?1:-1))}
  else if(e.key=='Escape'||e.key=='Backspace'){LB.close()}else return;
  e.preventDefault();e.stopPropagation()}
 const BTN='<button onclick="LB.open()">Leaderboard</button>';
 {const t0=titleUI;titleUI=function(){t0.apply(this,arguments);try{const b=document.querySelector('#ttl .ttm button[onclick="ttSet()"]');if(b&&!document.querySelector('#ttl .ttm button[onclick="LB.open()"]'))b.insertAdjacentHTML('beforebegin',BTN)}catch(e){console.error('lb',e)}}}
 {const p0=pauseUI;pauseUI=function(){p0.apply(this,arguments);try{const b=document.querySelector('#pzm button[onclick="settings()"]');if(b)b.insertAdjacentHTML('beforebegin',BTN)}catch(e){console.error('lb',e)}}}
})();
