/* WaveFern Wiki (v47.3.0): a small hash-routed wiki. Pages live in pages.js; their tables are built from
   window.WIKI_DATA (data.js, copied out of the game by tools/wiki-data.js) and the changelog from ../version.js,
   so the numbers here are the game's own. Links: #/page-id or #/page-id/section. */
const D=window.WIKI_DATA||{},PAGES=[],CATS=[];
const page=(id,t,cat,o)=>PAGES.push(Object.assign({id,t,cat},o));
const cat=(id,t,e,d)=>CATS.push({id,t,e,d});
const byId=id=>PAGES.find(p=>p.id===id);

/* ---------- helpers used by pages.js ---------- */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const L=(id,txt)=>{const [pid]=id.split('/'),p=byId(pid);return `<a href="#/${id}"${p?'':' class=new'}>${txt||(p?p.t:id)}</a>`};
const fmt=n=>n==null||n===''?'':typeof n!='number'?n:Math.abs(n)>=1e9?+(n/1e9).toFixed(2)+'B':Math.abs(n)>=1e6?+(n/1e6).toFixed(2)+'M':Math.abs(n)>=1e4?+(n/1e3).toFixed(1)+'k':(+n.toFixed(3)).toLocaleString('en-US');
const big=n=>Math.round(n).toLocaleString('en-US');
const $$=n=>n==null?'':'$'+big(n);
const pct=(x,d=0)=>(x*100).toFixed(d).replace(/\.0+$/,'')+'%';
const mul=x=>'×'+(+x.toFixed(3));
const FX=s=>`<div class=fx>${s}</div>`;
const N=(s,k='',h)=>`<div class="note ${k}"><b>${h||(k=='tip'?'Tip':k=='warn'?'Careful':'Note')}</b>${s}</div>`;
const tag=(s,k='')=>`<span class="tag ${k}">${s}</span>`;
const K=s=>`<kbd>${s}</kbd>`;
const ul=a=>'<ul>'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
const H2=(t,id)=>`<h2 id="${id||slug(t)}">${t}</h2>`;
const slug=s=>String(s).toLowerCase().replace(/<[^>]+>/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
/* infobox: rows are [label, value] or a string for a heading row */
const IB=(title,icon,rows)=>`<aside class=ib><div class=ibt>${title}</div>${icon?`<div class=ibi>${icon}</div>`:''}<table>${rows.filter(Boolean).map(r=>typeof r=='string'?`<tr class=ibh><td colspan=2>${r}</td></tr>`:`<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table></aside>`;
/* sortable table. cols: [label, 'n' for numbers]. rows: arrays of cells; a cell may be [html, sortValue] */
let TID=0;
const T=(cols,rows,o={})=>{const id='t'+(++TID);
 const head=cols.map((c,i)=>{const [l,k]=Array.isArray(c)?c:[c];return `<th class="${k=='n'?'n':''}" data-i=${i}>${l}</th>`}).join('');
 const body=rows.map(r=>'<tr>'+r.map((c,i)=>{const k=Array.isArray(cols[i])?cols[i][1]:'',[h,v]=Array.isArray(c)?c:[c,c];return `<td class="${k=='n'?'n':''}" data-v="${esc(typeof v=='number'?v:String(v).replace(/<[^>]+>/g,''))}">${h}</td>`}).join('')+'</tr>').join('');
 return (o.filter?`<div class=tf><input data-f="${id}" placeholder="Filter ${rows.length} rows…" aria-label="Filter table"><span class=m></span></div>`:'')+
  `<div class="tw${o.tall?' tall':''}"><table class=t id=${id}><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`};
const src=f=>`<a href="https://github.com/WaveFern/WaveFern/blob/main/${f}" target=_blank rel=noopener><code>${f}</code></a>`;

/* game helpers */
const fameAt=lv=>(D.fame&&D.fame.starts[lv-1])||0;
const fameOf=L=>{const s=(D.fame&&D.fame.starts)||[];let n=0;while(n<s.length&&s[n]<=L)n++;return n};

/* ---------- rendering ---------- */
const $=id=>document.getElementById(id);
function sideHTML(cur){return CATS.map(c=>`<h3>${c.e} ${c.t}</h3>`+PAGES.filter(p=>p.cat===c.id&&!p.hide).map(p=>`<a href="#/${p.id}" class="${p.id===cur?'on':''}">${p.t}</a>`).join('')).join('')}
function render(){const h=decodeURIComponent(location.hash.replace(/^#\/?/,'')),[id,sec]=h.split('/'),q=/^search=/.test(h)?h.slice(7):null;
 TID=0;let html;
 if(q!=null)html=searchPage(q);
 else{const p=byId(id||'home');
  if(!p)html=`<article class=panel><h1>Page not found</h1><p>There is no page called <code>${esc(id)}</code> yet. Try the search box, or go back to the ${L('home','Main Page')}.</p></article>`;
  else{const c=CATS.find(c=>c.id===p.cat);let body='';try{body=p.body()}catch(e){console.error(e);body=N('This page could not be built: '+esc(e.message),'warn')}
   html=`<article class=panel>${p.id=='home'?'':`<div class=crumb>${L('home','Wiki')} › ${c?`<a href="#/cat-${c.id}">${c.t}</a> › `:''}${p.t}</div><h1>${p.t}</h1>`}${body}
   ${p.id=='home'?'':`<div class=cats><b>Category:</b>${c?`<a href="#/cat-${c.id}">${c.t}</a>`:''}${p.src?` · <b>Code:</b> ${p.src.map(src).join(' ')}`:''}</div>`}</article>`}
  document.title=(p&&p.id!='home'?p.t+' – ':'')+'WaveFern Wiki'}
 $('main').innerHTML=html;$('side').innerHTML='<div class=panel>'+sideHTML(id||'home')+'</div>';$('side').classList.remove('on');
 const a=$('side').querySelector('a.on'),sd=$('side');sd.scrollTop=a?Math.max(0,a.offsetTop-sd.clientHeight/2):0;
 if(sec){const t=$(sec);if(t){t.scrollIntoView();return}}window.scrollTo(0,0)}

/* category index pages */
function catPages(){CATS.forEach(c=>page('cat-'+c.id,c.t,c.id,{hide:1,body:()=>`<p class=lead>${c.d}</p>`+`<div class=grid>${PAGES.filter(p=>p.cat===c.id&&!p.hide).map(p=>`<a class=card href="#/${p.id}"><span class=e>${p.e||''}</span><h3>${p.t}</h3><p class=m style="margin:0;font-size:12.5px">${p.sum||''}</p></a>`).join('')}</div>`}))}

/* ---------- search ---------- */
let IDX=null;
function index(){if(IDX)return IDX;IDX=PAGES.filter(p=>!p.hide).map(p=>{let t='';try{t=p.body().replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ')}catch(e){}
 const hs=[];try{p.body().replace(/<h2 id="([^"]+)">(.*?)<\/h2>/g,(m,i,x)=>hs.push([i,x.replace(/<[^>]+>/g,'')]))}catch(e){}
 return{p,t,lt:t.toLowerCase(),hs}});TID=0;return IDX}
function hits(q){q=q.trim().toLowerCase();if(!q)return[];const ws=q.split(/\s+/);
 return index().map(x=>{const tl=x.p.t.toLowerCase();let s=0;
  for(const w of ws){if(tl.includes(w))s+=tl.startsWith(w)?60:35;const k=x.lt.split(w).length-1;if(!k&&!tl.includes(w))return null;s+=Math.min(k,12);
   if((x.p.kw||'').toLowerCase().includes(w))s+=25;x.hs.forEach(h=>{if(h[1].toLowerCase().includes(w))s+=8})}
  const sec=x.hs.find(h=>h[1].toLowerCase().includes(ws[0]));return{x,s,sec}}).filter(Boolean).sort((a,b)=>b.s-a.s)}
function snip(t,q){const w=q.trim().toLowerCase().split(/\s+/)[0],i=t.toLowerCase().indexOf(w);if(i<0)return esc(t.slice(0,160))+'…';
 const a=Math.max(0,i-70),s=t.slice(a,i+110);return(a?'…':'')+esc(s).replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),m=>'<mark>'+m+'</mark>')+'…'}
function searchPage(q){const r=hits(q);document.title='Search: '+q+' – WaveFern Wiki';
 return `<article class=panel><div class=crumb>${L('home','Wiki')} › Search</div><h1>Search</h1><p class=m>${r.length} page${r.length==1?'':'s'} mention <b class=g>${esc(q)}</b>.</p>`+
  (r.length?r.map(({x,sec})=>`<div class=res><a href="#/${x.p.id}${sec?'/'+sec[0]:''}">${x.p.t}${sec?' <small class=m>› '+esc(sec[1])+'</small>':''}</a><p>${snip(x.t,q)}</p></div>`).join(''):N('Nothing found. Try a shorter word, like <i>fee</i>, <i>808</i> or <i>tour</i>.'))+'</article>'}
let SI=-1;
function suggest(){const q=$('q').value,s=$('sug');SI=-1;if(!q.trim()){s.classList.remove('on');return}
 const r=hits(q).slice(0,8);s.innerHTML=r.map(({x,sec})=>`<a href="#/${x.p.id}${sec?'/'+sec[0]:''}">${x.p.t}<small>${sec?'› '+esc(sec[1]):esc((x.p.sum||'').slice(0,70))}</small></a>`).join('')+`<a href="#/search=${encodeURIComponent(q)}"><small>Search every page for “${esc(q)}” ↵</small></a>`;s.classList.add('on')}

/* ---------- tables: sort by a header click, filter with the box above ---------- */
document.addEventListener('click',e=>{const th=e.target.closest('table.t th');if(!th)return;const tb=th.closest('table'),i=+th.dataset.i,dir=th.classList.contains('asc')?-1:1;
 tb.querySelectorAll('th').forEach(x=>x.classList.remove('asc','desc'));th.classList.add(dir>0?'asc':'desc');
 const rows=[...tb.tBodies[0].rows],num=th.classList.contains('n');
 rows.sort((a,b)=>{const x=a.cells[i].dataset.v,y=b.cells[i].dataset.v;return dir*(num?(parseFloat(x)||0)-(parseFloat(y)||0):x.localeCompare(y))}).forEach(r=>tb.tBodies[0].appendChild(r))});
document.addEventListener('input',e=>{const f=e.target.dataset&&e.target.dataset.f;if(!f)return;const v=e.target.value.toLowerCase(),tb=$(f);let n=0;
 [...tb.tBodies[0].rows].forEach(r=>{const ok=!v||r.textContent.toLowerCase().includes(v);r.style.display=ok?'':'none';n+=ok});e.target.nextElementSibling.textContent=v?n+' shown':''});

addEventListener('DOMContentLoaded',()=>{catPages();
 $('q').addEventListener('input',suggest);
 $('q').addEventListener('keydown',e=>{const a=[...$('sug').querySelectorAll('a')];
  if(e.key=='ArrowDown'||e.key=='ArrowUp'){e.preventDefault();SI=(SI+(e.key=='ArrowDown'?1:-1)+a.length)%a.length;a.forEach((x,i)=>x.classList.toggle('on',i==SI))}
  else if(e.key=='Enter'){const t=a[SI];location.hash=t?t.getAttribute('href'):'#/search='+encodeURIComponent($('q').value);$('sug').classList.remove('on');$('q').blur()}
  else if(e.key=='Escape'){$('sug').classList.remove('on');$('q').blur()}});
 document.addEventListener('click',e=>{if(!e.target.closest('#srch'))$('sug').classList.remove('on');if(e.target.closest('#sug a'))$('q').value=''});
 document.addEventListener('keydown',e=>{if(e.key=='/'&&document.activeElement!==$('q')&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$('q').focus()}});
 $('menu').onclick=()=>$('side').classList.toggle('on');
 addEventListener('scroll',()=>$('tot').classList.toggle('on',scrollY>600),{passive:true});
 $('tot').onclick=()=>scrollTo({top:0,behavior:'smooth'});
 $('ver').textContent=typeof GAME_VERSION!='undefined'?GAME_VERSION:(D.version||'');
 addEventListener('hashchange',render);render()});
