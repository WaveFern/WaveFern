/* ---------- popups: one stack, no overlaps, repeats grouped (v48.7.0) ----------
   Every short pop-up goes through Pops: toasts from say(), the big centre cards (glCard: releases, goals,
   quests, flights; tutCard: tutorial) and the little floating reward pops (tutPop).
   - Toasts and cards share one column at the top centre (#toast), spaced by its gap, so they never sit on
     top of each other. The column starts below any top-centre bar that is showing (update notice, flight,
     festival or tour bars) and keeps at most PMAX pop-ups; the oldest goes early to make room.
   - The same pop-up again while it is still showing does not add a second one: it gets a counter (x2, x3...),
     a little bump and a fresh timer.
   - Reward pops near each other are nudged upwards instead of drawn over each other; the same one again
     counts up the same way.
   - Paused means quiet (v49.38.0): while the game is paused nothing pops up and no pop-up sound plays. The ones
     on screen hide with their timers frozen and come back with the time they had left. New ones made while paused
     wait (repeats merged, only the latest few kept) and come in one at a time after you resume. A pop-up from
     something you click or press in the pause menu still shows, since that is you asking for it. */
/* the game is paused (not the title screen, which also sets PAUSED) */
const popQuiet=()=>{try{return !!PAUSED&&mode!='title'&&!(typeof TT!='undefined'&&TT.on)}catch(e){return false}};
const Pops=(()=>{
 const PMAX=5,QMAX=4,TOPS=['upd','swhud','fbk','dshud','dsst','fst'],live=new Map(),wait=new Map();
 let quiet=0,relT=0,pzAt=0,pzSum=0;
 let css=0;
 function addCSS(){if(css)return;css=1;const s=document.createElement('style');s.id='popcss';s.textContent=`
#toast{z-index:62;max-width:calc(100vw - 24px);transition:top .2s}
#toast>div{display:flex;align-items:center;gap:8px;max-width:100%;box-sizing:border-box;animation:popIn .22s ease-out;transition:opacity .35s,transform .35s}
#toast>div.out{opacity:0;transform:translateY(-8px)}
#toast>div.pzh,.trw.pzh{display:none!important}
#toast>div.bump{animation:popBump .3s ease-out}
#toast .pcn{flex:none;font:700 11px Silkscreen,ui-monospace,monospace;color:#0a0d0b;background:#ffd27a;border:2px solid #000;padding:0 5px;line-height:15px}
#toast .pcn:empty{display:none}
#toast>div.pcard{display:block;position:relative;text-align:center;background:#0b0f0def;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 3px #2fe68a55,6px 6px 0 #0008;padding:12px 26px;min-width:min(320px,86vw)}
#toast>div.pcard.gl{box-shadow:inset 0 0 0 2px #2a352e,0 0 0 3px #ffd27a66,6px 6px 0 #0008}
#toast>div.pcard small{font:11px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:2px}
#toast>div.pcard h2{font-size:20px;margin:5px 0 2px;color:#fff;text-shadow:3px 3px 0 #000}
#toast>div.pcard p{margin:0;color:var(--g)}
#toast>div.pcard .pcn{position:absolute;right:-10px;top:-10px}
@keyframes popIn{from{opacity:0;transform:translateY(-10px) scale(.95)}to{opacity:1;transform:none}}
@keyframes popBump{0%{transform:scale(1)}40%{transform:scale(1.07)}100%{transform:scale(1)}}`;document.head.appendChild(s)}
 const box=()=>document.getElementById('toast');
 function drop(e){const o=live.get(e._pk);if(o&&o.e===e)live.delete(e._pk);clearTimeout(e._pt);e.classList.add('out');setTimeout(()=>e.remove(),360)}
 /* every pop-up timer goes through here so a pause can freeze it */
 function arm(e,ms){clearTimeout(e._pt);e._end=Date.now()+ms;e._pt=setTimeout(()=>drop(e),ms)}
 /* made by a click or key press (the pause menu), not by a timer or the network */
 const asked=()=>{try{const v=window.event;return !!v&&/^(click|keydown|keyup|pointerup|pointerdown|mouseup|touchend|change|input|submit)$/.test(v.type)}catch(e){return false}};
 /* the column starts under whatever top-centre bar is on screen */
 function place(){const b=box();if(!b)return;let y=70;
  for(const id of TOPS){const e=document.getElementById(id);if(!e||!e.isConnected)continue;const r=e.getBoundingClientRect();
   if(r.height&&r.top<120&&r.left<innerWidth/2+40&&r.right>innerWidth/2-40&&getComputedStyle(e).display!='none')y=Math.max(y,Math.ceil(r.bottom)+8)}
  b.style.top=y+'px'}
 /* show(key, build, ms): build(div) fills a new pop-up; the same key while it shows only counts up */
 /* sfx: a sound to play when it actually shows */
 function show(k,build,ms,sfx){addCSS();const b=box();if(!b)return null;
  if(popQuiet()&&!asked()){wait.delete(k);wait.set(k,{k,build,ms,sfx});while(wait.size>QMAX)wait.delete(wait.keys().next().value);return null}
  if(sfx)try{snd(sfx)}catch(e){}
  place();const o=live.get(k);
  if(o&&o.e.isConnected&&!o.e.classList.contains('out')){o.n++;o.e.querySelector('.pcn').textContent='x'+o.n;o.e.classList.remove('pzh');
   o.e.classList.remove('bump');void o.e.offsetWidth;o.e.classList.add('bump');arm(o.e,ms);return o.e}
  const e=document.createElement('div');e._pk=k;build(e);const c=document.createElement('b');c.className='pcn';e.appendChild(c);b.appendChild(e);
  live.set(k,{e,n:1});arm(e,ms);
  const all=[...b.children].filter(x=>!x.classList.contains('out'));for(let i=0;i<all.length-PMAX;i++)drop(all[i]);
  return e}
 function toast(t){t=String(t);return show('t|'+t,e=>{const s=document.createElement('span');s.textContent=t;e.appendChild(s)},3200,'ping')}
 function card(kind,k,t,s){return show('c|'+k+'|'+t+'|'+(s||''),e=>{e.className='pcard '+kind;e.innerHTML=`<small>${k}</small><h2>${t}</h2><p>${s||''}</p>`},3000)}
 /* floating reward pops: lift a new one above any still showing near the same spot, count up repeats */
 const fl=[];
 function float(t,sub,x,y){if(popQuiet()&&!asked())return null;const now=Date.now();for(let i=fl.length-1;i>=0;i--)if(!fl[i].e.isConnected)fl.splice(i,1);
  const k=t+'|'+(sub||''),same=fl.find(f=>f.k==k&&Math.abs(f.x-x)<80&&Math.abs(f.y0-y)<80);
  if(same){same.n++;same.e.innerHTML=t+' x'+same.n+(sub?`<b>${sub}</b>`:'');same.e.style.animation='none';void same.e.offsetWidth;same.e.style.animation='';clearTimeout(same.t);same.t=setTimeout(()=>same.e.remove(),2000);return same.e}
  let yy=y;for(let g=0;g<8&&fl.some(f=>Math.abs(f.x-x)<90&&Math.abs(f.y-yy)<26);g++)yy-=28;
  const e=document.createElement('div');e.className='trw';e.style.left=x+'px';e.style.top=yy+'px';e.innerHTML=t+(sub?`<b>${sub}</b>`:'');document.body.appendChild(e);
  const f={e,k,x,y0:y,y:yy,n:1,at:now};f.t=setTimeout(()=>e.remove(),2000);fl.push(f);return e}
 /* pause: hide what is showing and stop its clock; resume: give it back its time, then let the waiting ones in one by one */
 function hush(on){const b=box(),now=Date.now();clearTimeout(relT);
  if(b)for(const e of b.children){if(e.classList.contains('out'))continue;
   if(on){if(e._end){clearTimeout(e._pt);e._left=Math.max(600,e._end-now)}e.classList.add('pzh')}
   else if(e.classList.contains('pzh')){e.classList.remove('pzh');if(e._left){arm(e,e._left);e._left=0}}}
  document.querySelectorAll('.trw').forEach(e=>e.classList.toggle('pzh',on));
  if(!on&&wait.size)relT=setTimeout(release,700)}
 function release(){if(popQuiet()||!wait.size)return;const w=wait.values().next().value;wait.delete(w.k);show(w.k,w.build,w.ms,w.sfx);if(wait.size)relT=setTimeout(release,900)}
 setInterval(()=>{const q=popQuiet();if(q!=quiet){quiet=q;if(q)pzAt=performance.now();else pzSum+=performance.now()-pzAt;hush(q)}},100);
 /* how long the game has spent paused, for gaps between pop-ups that should not run down during a pause */
 const pzMs=()=>pzSum+(quiet?performance.now()-pzAt:0);
 setInterval(()=>{const b=box();if(b&&b.children.length)place()},500);
 return {show,toast,card,float,place,arm,pzMs,quiet:popQuiet}})();
say=function(t){Pops.toast(t)};
glCard=function(k,t,s){Pops.card('gl',k,t,s)};
tutCard=function(k,t,s){Pops.card('tc',k,t,s)};
/* #trw was an id, so two reward pops shared it; the class keeps the tutorial's look for each one */
tutPop=function(t,sub,x,y){try{tutCSS()}catch(e){}const s=document.getElementById('tutcss');if(s&&!s._pop){s._pop=1;s.textContent+='.trw{position:fixed;z-index:63;pointer-events:none;font:700 15px Silkscreen,ui-monospace,monospace;color:var(--g);text-shadow:2px 2px 0 #000;animation:trwUp 2s ease-out forwards;white-space:nowrap}.trw b{display:block;color:#ffd27a;font-size:11px}'}Pops.float(t,sub,x,y)};
/* the update notice waits for you to resume (the next check after that shows it) */
{const u0=updShow;updShow=function(){if(popQuiet())return;return u0.apply(this,arguments)}}
