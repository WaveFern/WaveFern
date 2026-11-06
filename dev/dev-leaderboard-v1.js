/* WaveFern dev leaderboard (dummy data). Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   No fake data: shows an empty state until real rows exist. Adds a Leaderboard button to the main menu (and the pause menu). The screen has a tab per category: Time played, Listeners,
   Streams, Money, Fame level, Songs released, Followers. 
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
 const meName=()=>S.artist||'You';
 /* the one function to replace with the real cloud list: returns [{name,v,me}] sorted high to low */
 LB.board=function(k){return[]};/* no real rows yet: swap for the real cloud list */
 let cur=0,back='title',anim=1;
 const fm=()=>{try{return typeof fdMark=='function'?fdMark(13):''}catch(e){return''}};
 const css='<style>@keyframes lbIn{from{transform:translateX(-12px);opacity:0}to{transform:none;opacity:1}}@keyframes lbPop{0%{transform:scale(.7)}60%{transform:scale(1.08)}100%{transform:scale(1)}}'+
  '@keyframes lbShine{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes lbBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes lbFall{0%{transform:translateY(-10px);opacity:1}100%{transform:translateY(300px);opacity:0}}'+
  '@keyframes lbGlow{0%,100%{box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008,0 0 0 var(--g)}50%{box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008,0 0 16px var(--g)}}'+
  '#lbd{position:relative;overflow:hidden;font-family:Silkscreen,ui-monospace,monospace}#lbd.top1{border-color:var(--g);animation:lbGlow 1.6s steps(6) infinite}#lbd h2{letter-spacing:2px;text-transform:uppercase}'+
  '#lbd .tabs{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}#lbd .tabs button{padding:5px 8px;font-size:.75em}#lbd .tabs button.on{background:var(--g);color:#04120a;font-weight:700}'+
  '#lbd .ban{margin:6px 0;padding:8px;border:3px solid #000;text-align:center;font-weight:700;letter-spacing:1px;background:linear-gradient(100deg,#1a8a52 20%,#2fe68a 45%,#b8ffd9 50%,#2fe68a 55%,#1a8a52 80%) 0 0/200% 100%;color:#04120a;animation:lbShine 2.4s linear infinite,lbPop .5s steps(5)}'+
  '#lbd .ban.n{background:#161b18;color:var(--t);border-color:#000;box-shadow:inset 0 0 0 2px #2a352e;animation:none;font-weight:400;letter-spacing:0}'+
  '#lbd .pod{display:flex;align-items:flex-end;justify-content:center;gap:6px;margin:10px 0 6px}#lbd .pod div{flex:1;max-width:130px;text-align:center;border:3px solid #000;padding:6px 4px;box-shadow:inset 0 -3px #0007,3px 3px 0 #0008;animation:lbPop .45s steps(5) both}'+
  '#lbd .pod .nm{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-size:.8em}#lbd .pod .v{display:block;font-size:.7em;opacity:.85}#lbd .pod .k{font-size:1.6em;display:block;font-weight:700}'+
  '#lbd .pod .c1{background:var(--g);color:#04120a;animation:lbPop .45s steps(5) both,lbBob 1.2s steps(2) infinite}#lbd .pod .c2{background:#1a8a52;color:#04120a}#lbd .pod .c3{background:#26302a;color:var(--t)}#lbd .pod .me{outline:3px solid #fff}'+
  '#lbd .list{max-height:34vh;overflow:auto;border:3px solid #000;background:#0b0f0d;box-shadow:inset 0 0 0 2px #2a352e}#lbd .row{display:flex;align-items:center;gap:10px;padding:6px 8px;border-bottom:2px solid #000;font-size:.85em}#lbd .row.a{animation:lbIn .25s steps(4) both}#lbd .row b.r{width:2.4em;text-align:right;color:var(--m)}#lbd .row span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '#lbd .row.me{background:var(--g);color:#04120a;font-weight:700}#lbd .row.me b.r{color:#04120a}#lbd .fdm{vertical-align:middle;margin-left:4px}'+
  '#lbd .cf{position:absolute;top:0;width:6px;height:6px;pointer-events:none;animation:lbFall 2.2s steps(14) infinite}</style>';
 function podCell(x,i,c){const h=[0,18,30][i];return`<div class="c${i+1}${x.me?' me':''}" style="order:${[1,0,2][i]};padding:${i==0?16:6}px 4px ${h+6}px"><span class=k>#${i+1}</span><span class=nm>${esc(x.name)}${x.fdr?fm():''}</span><span class=v>${esc(c.fmt(x.v))}</span></div>`}
 function confetti(){const col=['#2fe68a','#1a8a52','#b8ffd9','#e8f3ec','#26302a'];let o='';for(let i=0;i<22;i++)o+=`<i class=cf style="left:${(i*4.7+((i*37)%9))%100}%;background:${col[i%5]};animation-delay:${(i%8)*.27}s"></i>`;return o}
 function draw(){
  const c=CATS[cur],rows=LB.board(c.k);
  if(!rows.length){$('ui').innerHTML=css+`<div id=lbd class="box modal" style="width:min(460px,94vw)"><h2>Leaderboard</h2><div class=tabs role=tablist>${CATS.map((x,i)=>`<button role=tab class="${i==cur?'on':''}" onclick="LB.tab(${i})">${x.t}</button>`).join('')}</div><div class="ban n">No ranked players yet.</div><p class=m><small>${c.u} · arrows change tab, Esc goes back</small></p><div class=row2><button class=go onclick="LB.close()">Back</button></div></div>`;return}
  const mi=rows.findIndex(x=>x.me),rk=mi+1,n=rows.length;
  
  const ban=rk==1?`<div class=ban>YOU ARE #1 IN ${c.t.toUpperCase()}</div>`:rk<=3?`<div class=ban>TOP 3 IN ${c.t.toUpperCase()}: #${rk}</div>`:`<div class="ban n">You are #${rk} of ${n}${rk<=10?'. Top 10!':'.'} ${rows[mi-1]?'Next: '+esc(rows[mi-1].name)+' ('+esc(c.fmt(rows[mi-1].v))+')':''}</div>`;
  const rest=rows.slice(3,25),lastRow=mi>=25?[rows[mi]]:[];
  $('ui').innerHTML=css+`<div id=lbd class="box modal${rk==1?' top1':''}" style="width:min(460px,94vw)">${rk<=3?confetti():''}<h2>Leaderboard</h2>
   <div class=tabs role=tablist>${CATS.map((x,i)=>`<button role=tab class="${i==cur?'on':''}" onclick="LB.tab(${i})">${x.t}</button>`).join('')}</div>${ban}
   <div class=pod>${[0,1,2].map(i=>podCell(rows[i],i,c)).join('')}</div>
   <div class=list>${rest.concat(lastRow).map((x,j)=>{const i=x.me&&mi>=25?mi:j+3;return`<div class="row${x.me?' me':''}${anim?' a':''}" style="animation-delay:${Math.min(j,12)*.03}s"><b class=r>${i+1}</b><span>${esc(x.name)}${x.fdr?fm():''}${x.me?' (you)':''}</span><b>${esc(c.fmt(x.v))}</b></div>`}).join('')}</div>
   <p class=m><small>${c.u} · sample list, not real players yet · arrows change tab, Esc goes back</small></p><div class=row2><button class=go onclick="LB.close()">Back</button></div></div>`;
  const me=document.querySelector('#lbd .row.me');if(me&&mi>=3&&mi<25)me.scrollIntoView({block:'nearest'})}
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
