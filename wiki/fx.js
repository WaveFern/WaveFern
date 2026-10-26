/* WaveFern Wiki (v47.6.0): the fun layer. Runs after every page render ('wiki:render' from wiki.js):
   - explorer: pages you have read are ticked in the sidebar, with a progress bar, a rank and a toast for each new page;
     milestones throw pixel confetti. Kept per browser in localStorage 'wk_seen' (nothing else is stored).
   - reveal on scroll, a reading progress bar, counting-up numbers, pixel sparkles on clicks,
     link previews on hover (like an encyclopedia's page previews) and a copy-link button on every section heading.
   Everything is skipped or instant when the reader prefers reduced motion. */
(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,HOVER=matchMedia('(hover: hover)').matches;
const pages=()=>PAGES.filter(p=>!p.hide);
let SEEN=new Set;try{SEEN=new Set(JSON.parse(localStorage.getItem('wk_seen')||'[]'))}catch(e){}
const save=()=>{try{localStorage.setItem('wk_seen',JSON.stringify([...SEEN]))}catch(e){}};
const RANKS=[[0,'Fresh listener'],[5,'Bedroom producer'],[12,'Session player'],[25,'Headliner'],[40,'Legend'],[1e9,'Know-it-all']];
const rank=n=>{const t=pages().length;if(n>=t)return RANKS[RANKS.length-1][1];let r=RANKS[0][1];RANKS.slice(0,-1).forEach(([k,s])=>{if(n>=k)r=s});return r};

/* ---------- toasts ---------- */
function toast(html,cls=''){const box=document.getElementById('toasts');if(!box)return;const t=document.createElement('div');t.className='toast '+cls;t.innerHTML=html;box.appendChild(t);while(box.children.length>3)box.firstChild.remove();
 setTimeout(()=>t.classList.add('out'),2600);setTimeout(()=>t.remove(),3100)}

/* ---------- confetti and sparkles: little square pixels ---------- */
const COLS=['#2fe68a','#ffcc33','#ff7ac8','#5aa8ff','#40e0d0','#b48cff','#ffffff'];
function burst(x,y,n,cols,spread=1){if(RM)return;for(let i=0;i<n;i++){const s=document.createElement('i');s.className='px-bit';const c=cols[i%cols.length],sz=4+(Math.random()*4|0);
 s.style.cssText=`left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${c}`;document.body.appendChild(s);
 const a=Math.random()*Math.PI*2,v=(40+Math.random()*90)*spread,dx=Math.cos(a)*v,dy=Math.sin(a)*v-30*spread;
 s.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx}px,${dy+60*spread}px)`,opacity:0}],{duration:600+Math.random()*500,easing:'cubic-bezier(.2,.7,.4,1)'}).onfinish=()=>s.remove()}}
function confetti(){if(RM)return;const w=innerWidth;for(let k=0;k<5;k++)setTimeout(()=>burst(w*(.15+.7*Math.random()),innerHeight*.25,26,COLS,2.2),k*140)}
document.addEventListener('click',e=>{const t=e.target.closest('.btn,button,.card,.chip,.pager a,.tabs a,.file,.dyk-more');if(!t)return;
 const a=getComputedStyle(t).getPropertyValue('--a').trim()||'#2fe68a';burst(e.clientX,e.clientY,10,[a,'#ffffff',a])});

/* ---------- explorer ---------- */
function xpBox(){const t=pages().length,n=pages().filter(p=>SEEN.has(p.id)).length;
 return `<div class=xp title="Pages you have read on this device"><div class=xpt><b>${rank(n)}</b><span>${n} / ${t}</span></div><div class=xpb><i style="width:${(n/t*100).toFixed(1)}%"></i></div><button class=rnd onclick="rndPage()">🎲 Random page</button></div>`}
function sideMarks(){const s=document.getElementById('side');if(!s)return;const pn=s.querySelector('.panel');if(pn&&!pn.querySelector('.xp'))pn.insertAdjacentHTML('afterbegin',xpBox());
 s.querySelectorAll('.panel>a[href^="#/"]').forEach(a=>{const id=a.getAttribute('href').slice(2);if(SEEN.has(id))a.classList.add('seen')})}
function visit(p){if(!p||SEEN.has(p.id))return;SEEN.add(p.id);save();const t=pages().length,n=pages().filter(q=>SEEN.has(q.id)).length,r0=rank(n-1),r1=rank(n);
 setTimeout(()=>{toast(`<span class=te>${p.e||'📖'}</span><span><b>New page discovered!</b><small>${n} of ${t} pages explored</small></span>`);
  if(r1!==r0){toast(`<span class=te>🏅</span><span><b>Rank up: ${r1}</b><small>Keep exploring</small></span>`,'gold');confetti()}
  else if(n==t){confetti()}},350)}

/* ---------- reveal on scroll ---------- */
let IO=null;
function reveal(){const els=document.querySelectorAll('#main article h2,#main .tw,#main .fx,#main .note,#main .card,#main .toc,#main .ib,#main .box2,#main .pager,#main .bars,#main .files,#main .res');
 if(RM||!('IntersectionObserver' in window))return;if(IO)IO.disconnect();
 IO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');IO.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px'});
 els.forEach((el,i)=>{el.classList.add('rv');el.style.setProperty('--d',(i%6)*50+'ms');IO.observe(el)})}

/* ---------- reading progress ---------- */
function prog(){const b=document.getElementById('rbar');if(!b)return;const h=document.documentElement,m=h.scrollHeight-innerHeight;b.style.transform=`scaleX(${m>0?Math.min(1,scrollY/m):0})`}
addEventListener('scroll',prog,{passive:true});addEventListener('resize',prog);

/* ---------- counting numbers ---------- */
function countUp(){document.querySelectorAll('#main .stats b').forEach(b=>{const v=parseInt(b.textContent,10);if(!(v>0)||RM)return;const t0=performance.now(),d=900;
 const f=t=>{const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);b.textContent=Math.round(v*e);if(k<1)requestAnimationFrame(f)};b.textContent='0';requestAnimationFrame(f)})}

/* ---------- section links ---------- */
function anchors(){document.querySelectorAll('#main article h2[id]').forEach(h=>{if(h.querySelector('.hl'))return;const b=document.createElement('button');b.className='hl';b.title='Copy a link to this section';b.textContent='🔗';
 b.onclick=e=>{e.stopPropagation();const pid=(location.hash.replace(/^#\/?/,'').split('/')[0])||'home',u=location.href.split('#')[0]+'#/'+pid+'/'+h.id;
  (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast('<span class=te>🔗</span><span><b>Link copied</b><small>'+h.textContent.replace('🔗','').trim()+'</small></span>')).catch(()=>{location.hash='#/'+pid+'/'+h.id})};h.appendChild(b)})}

/* ---------- link previews ---------- */
let PV=null,PT=0;
function pvShow(a){const id=a.getAttribute('href').slice(2).split('/')[0],p=byId(id);if(!p||p.id==='home')return;const c=CATS.find(c=>c.id===p.cat);
 if(!PV){PV=document.createElement('div');PV.id='pv';document.body.appendChild(PV)}
 PV.style.setProperty('--a',acc(p.cat));PV.innerHTML=`<div class=pvh><span class=ae>${p.e||(c&&c.e)||'📄'}</span><div><small>${c?c.t:''}</small><b>${p.t}</b></div></div><p>${p.sum||''}</p><small class=pvf>${SEEN.has(p.id)?'✓ Read':'Not read yet'} · click to open</small>`;
 const r=a.getBoundingClientRect(),w=300;let x=Math.min(innerWidth-w-12,Math.max(12,r.left));PV.style.left=x+'px';PV.style.top=(r.bottom+8)+'px';PV.style.width=w+'px';
 PV.classList.remove('up');PV.classList.add('on');const ph=PV.offsetHeight;if(r.bottom+8+ph>innerHeight-8){PV.style.top=(r.top-8-ph)+'px';PV.classList.add('up')}}
function pvHide(){clearTimeout(PT);if(PV)PV.classList.remove('on')}
if(HOVER){document.addEventListener('mouseover',e=>{const a=e.target.closest('#main article a[href^="#/"]:not(.btn):not(.card):not(.chip):not(.tabs a):not(.toc a):not(.pager a)');if(!a)return;clearTimeout(PT);PT=setTimeout(()=>pvShow(a),380)});
 document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('#main article a[href^="#/"]'))pvHide()});addEventListener('scroll',pvHide,{passive:true})}

document.addEventListener('wiki:render',e=>{pvHide();visit(e.detail.page);sideMarks();reveal();countUp();anchors();prog()});
})();
