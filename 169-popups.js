/* ---------- popups: one stack, no overlaps, repeats grouped (v48.7.0) ----------
   Every short pop-up goes through Pops: toasts from say(), the big centre cards (glCard: releases, goals,
   quests, flights; tutCard: tutorial) and the little floating reward pops (tutPop).
   - Toasts and cards share one column at the top centre (#toast), spaced by its gap, so they never sit on
     top of each other. The column starts below any top-centre bar that is showing (update notice, flight,
     festival or tour bars) and keeps at most PMAX pop-ups; the oldest goes early to make room.
   - The same pop-up again while it is still showing does not add a second one: it gets a counter (x2, x3...),
     a little bump and a fresh timer.
   - Reward pops near each other are nudged upwards instead of drawn over each other; the same one again
     counts up the same way. */
const Pops=(()=>{
 const PMAX=5,TOPS=['upd','swhud','fbk','dshud','dsst','fst'],live=new Map();
 let css=0;
 function addCSS(){if(css)return;css=1;const s=document.createElement('style');s.id='popcss';s.textContent=`
#toast{z-index:62;max-width:calc(100vw - 24px);transition:top .2s}
#toast>div{display:flex;align-items:center;gap:8px;max-width:100%;box-sizing:border-box;animation:popIn .22s ease-out;transition:opacity .35s,transform .35s}
#toast>div.out{opacity:0;transform:translateY(-8px)}
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
 /* the column starts under whatever top-centre bar is on screen */
 function place(){const b=box();if(!b)return;let y=70;
  for(const id of TOPS){const e=document.getElementById(id);if(!e||!e.isConnected)continue;const r=e.getBoundingClientRect();
   if(r.height&&r.top<120&&r.left<innerWidth/2+40&&r.right>innerWidth/2-40&&getComputedStyle(e).display!='none')y=Math.max(y,Math.ceil(r.bottom)+8)}
  b.style.top=y+'px'}
 /* show(key, build, ms): build(div) fills a new pop-up; the same key while it shows only counts up */
 function show(k,build,ms){addCSS();const b=box();if(!b)return null;place();const o=live.get(k);
  if(o&&o.e.isConnected&&!o.e.classList.contains('out')){o.n++;o.e.querySelector('.pcn').textContent='x'+o.n;
   o.e.classList.remove('bump');void o.e.offsetWidth;o.e.classList.add('bump');clearTimeout(o.e._pt);o.e._pt=setTimeout(()=>drop(o.e),ms);return o.e}
  const e=document.createElement('div');e._pk=k;build(e);const c=document.createElement('b');c.className='pcn';e.appendChild(c);b.appendChild(e);
  live.set(k,{e,n:1});e._pt=setTimeout(()=>drop(e),ms);
  const all=[...b.children].filter(x=>!x.classList.contains('out'));for(let i=0;i<all.length-PMAX;i++)drop(all[i]);
  return e}
 function toast(t){t=String(t);return show('t|'+t,e=>{const s=document.createElement('span');s.textContent=t;e.appendChild(s)},3200)}
 function card(kind,k,t,s){return show('c|'+k+'|'+t+'|'+(s||''),e=>{e.className='pcard '+kind;e.innerHTML=`<small>${k}</small><h2>${t}</h2><p>${s||''}</p>`},3000)}
 /* floating reward pops: lift a new one above any still showing near the same spot, count up repeats */
 const fl=[];
 function float(t,sub,x,y){const now=Date.now();for(let i=fl.length-1;i>=0;i--)if(!fl[i].e.isConnected)fl.splice(i,1);
  const k=t+'|'+(sub||''),same=fl.find(f=>f.k==k&&Math.abs(f.x-x)<80&&Math.abs(f.y0-y)<80);
  if(same){same.n++;same.e.innerHTML=t+' x'+same.n+(sub?`<b>${sub}</b>`:'');same.e.style.animation='none';void same.e.offsetWidth;same.e.style.animation='';clearTimeout(same.t);same.t=setTimeout(()=>same.e.remove(),2000);return same.e}
  let yy=y;for(let g=0;g<8&&fl.some(f=>Math.abs(f.x-x)<90&&Math.abs(f.y-yy)<26);g++)yy-=28;
  const e=document.createElement('div');e.className='trw';e.style.left=x+'px';e.style.top=yy+'px';e.innerHTML=t+(sub?`<b>${sub}</b>`:'');document.body.appendChild(e);
  const f={e,k,x,y0:y,y:yy,n:1,at:now};f.t=setTimeout(()=>e.remove(),2000);fl.push(f);return e}
 setInterval(()=>{const b=box();if(b&&b.children.length)place()},500);
 return {show,toast,card,float,place}})();
say=function(t){snd('ping');Pops.toast(t)};
glCard=function(k,t,s){Pops.card('gl',k,t,s)};
tutCard=function(k,t,s){Pops.card('tc',k,t,s)};
/* #trw was an id, so two reward pops shared it; the class keeps the tutorial's look for each one */
tutPop=function(t,sub,x,y){try{tutCSS()}catch(e){}const s=document.getElementById('tutcss');if(s&&!s._pop){s._pop=1;s.textContent+='.trw{position:fixed;z-index:63;pointer-events:none;font:700 15px Silkscreen,ui-monospace,monospace;color:var(--g);text-shadow:2px 2px 0 #000;animation:trwUp 2s ease-out forwards;white-space:nowrap}.trw b{display:block;color:#ffd27a;font-size:11px}'}Pops.float(t,sub,x,y)};
