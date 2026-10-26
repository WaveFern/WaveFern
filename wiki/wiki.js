/* WaveFern Wiki (v47.7.0): a small hash-routed wiki. Pages live in pages.js; their tables are built from
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
const IB=(title,icon,rows)=>`<aside class=ib><div class=ibt>${title}</div><table>${rows.filter(Boolean).map(r=>typeof r=='string'?`<tr class=ibh><td colspan=2>${r}</td></tr>`:`<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table></aside>`;
/* sortable table. cols: [label, 'n' for numbers]. rows: arrays of cells; a cell may be [html, sortValue] */
let TID=0;
const T=(cols,rows,o={})=>{const id='t'+(++TID);
 const head=cols.map((c,i)=>{const [l,k]=Array.isArray(c)?c:[c];return `<th class="${k=='n'?'n':''}" data-i=${i}>${l}</th>`}).join('');
 const body=rows.map(r=>'<tr>'+r.map((c,i)=>{const k=Array.isArray(cols[i])?cols[i][1]:'',[h,v]=Array.isArray(c)?c:[c,c];return `<td class="${k=='n'?'n':''}" data-v="${esc(typeof v=='number'?v:String(v).replace(/<[^>]+>/g,''))}">${h}</td>`}).join('')+'</tr>').join('');
 return (o.filter?`<div class=tf><input data-f="${id}" placeholder="Filter ${rows.length} rows..." aria-label="Filter table"><span class=m></span></div>`:'')+
  `<div class="tw${o.tall?' tall':''}"><table class=t id=${id}><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`};
const src=f=>`<a href="https://github.com/WaveFern/WaveFern/blob/main/${f}" target=_blank rel=noopener><code>${f}</code></a>`;

/* game helpers */
const fameAt=lv=>(D.fame&&D.fame.starts[lv-1])||0;
const fameOf=L=>{const s=(D.fame&&D.fame.starts)||[];let n=0;while(n<s.length&&s[n]<=L)n++;return n};

/* ---------- rendering ---------- */
const $=id=>document.getElementById(id);
function sideHTML(cur){return `<h3>Navigation</h3><a href="#/home" class="${cur=='home'?'on':''}">Main page</a><a href="#" onclick="return rndPage()">Random page</a><a href="#/versions" class="${cur=='versions'?'on':''}">Recent changes</a><a href="../">Play the game</a>`+
 CATS.map(c=>`<h3><a href="#/cat-${c.id}">${c.t}</a></h3>`+PAGES.filter(p=>p.cat===c.id&&!p.hide).map(p=>`<a href="#/${p.id}" class="${p.id===cur?'on':''}">${p.t}</a>`).join('')).join('')}
const acc=()=>'';
/* Wikipedia-style "Contents" box: numbered, can be hidden, after the lead paragraph on pages with three or more sections */
let TOCH=0;try{TOCH=+localStorage.getItem('wk_toch')||0}catch(e){}
function withToc(body,pid){const hs=[];body.replace(/<h2 id="([^"]+)">(.*?)<\/h2>/g,(m,i,t)=>hs.push([i,t]));if(hs.length<3)return body;
 const toc=`<nav class="toc${TOCH?' shut':''}"><div class=toch><b>Contents</b><button class=tg onclick="tocToggle(this)">${TOCH?'show':'hide'}</button></div><ol>${hs.map(([i,t])=>`<li><a href="#/${pid}/${i}">${t}</a></li>`).join('')}</ol></nav>`;
 const k=body.indexOf('class=lead'),e=k<0?-1:body.indexOf('</p>',k);return e<0?toc+body:body.slice(0,e+4)+toc+body.slice(e+4)}
window.tocToggle=b=>{const n=b.closest('.toc');TOCH=n.classList.toggle('shut')?1:0;b.textContent=TOCH?'show':'hide';try{localStorage.setItem('wk_toch',TOCH)}catch(e){}};
/* a superscript reference after the lead paragraph, pointing at the References list */
function withRef(body,p){if(!p.src)return body;const k=body.indexOf('class=lead'),e=k<0?-1:body.indexOf('</p>',k);if(e<0)return body;
 return body.slice(0,e)+`<sup class=ref><a href="#/${p.id}/references">[1]</a></sup>`+body.slice(e)}
/* "See also": every other page this one links to */
function seeAlso(body,p){const ids=[];body.replace(/href="#\/([a-z0-9-]+)/g,(m,i)=>{if(i!==p.id&&i!=='home'&&!/^cat-/.test(i)&&byId(i)&&!ids.includes(i))ids.push(i)});
 return ids.length?H2('See also','see-also')+`<ul class=also>${ids.slice(0,10).map(i=>{const q=byId(i);return `<li><a href="#/${i}">${q.t}</a></li>`}).join('')}</ul>`:''}
function refs(p){return p.src?H2('References','references')+`<ol class=refs>${p.src.map(f=>`<li><b>^</b> ${src(f)}. <i>WaveFern Records</i> source code, game ${esc(D.version||'')}.</li>`).join('')}</ol>`:''}
/* the Source and History tabs */
function srcTab(p){return `<p>This article was written from the following files of the game's code. Each link opens the file on GitHub.</p>`+
 (p.src?`<ul>${p.src.map(f=>`<li>${src(f)}</li>`).join('')}</ul>`:'<p>This article is not tied to particular files.</p>')+
 `<p class=m>Tables in the article are read from <code>wiki/data.js</code>. The script <code>tools/wiki-data.js</code> rebuilds that file from the running game each time the site is published.</p>`}
function histTab(p){if(typeof VERSION_HISTORY=='undefined')return N('The version list could not be loaded.','warn');
 const stop=new Set(['and','the','your','with','what','how','from','into','that','this','song','songs','game']);
 const ws=[...new Set((p.t+' '+(p.kw||'')).toLowerCase().replace(/[^a-z0-9& ]+/g,' ').split(/\s+/).filter(w=>w.length>2&&!stop.has(w)))];
 const re=new RegExp('\\b('+ws.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(e?s)?\\b','i');
 const vs=ws.length?VERSION_HISTORY.filter(v=>re.test(v.n)):[];
 return `<p>Game updates whose notes mention this topic, newest first (${vs.length} of ${VERSION_HISTORY.length}).</p>`+
  (vs.length?`<ol class=hist>${vs.slice(0,60).map(v=>`<li><span class="tag${/\.0$/.test(v.v)?' g':''}">${v.v}</span> ${esc(v.n).replace(re,m=>'<mark>'+m+'</mark>')}</li>`).join('')}</ol>`:N('No updates mention this page by name.'))+
  `<p>${L('versions','See every version')}</p>`}
function render(){const h=decodeURIComponent(location.hash.replace(/^#\/?/,'')),[id,sec]=h.split('/'),q=/^search=/.test(h)?h.slice(7):null;
 TID=0;let html,cur=null;
 if(q!=null)html=searchPage(q);
 else{const p=byId(id||'home');cur=p;
  if(!p)html=`<article class=panel><h1>Page not found</h1><p>There is no page called <code>${esc(id)}</code>. Try the search box, the ${L('home','Main page')}, or a <a href="#" onclick="return rndPage()">random page</a>.</p></article>`;
  else{const c=CATS.find(c=>c.id===p.cat);let body='';try{body=p.body()}catch(e){console.error(e);body=N('This page could not be built: '+esc(e.message),'warn')}
   const isCat=/^cat-/.test(p.id),tab=sec=='~src'?'src':sec=='~hist'?'hist':'read';
   const tabs=isCat||p.id=='home'?'':`<nav class=tabs><a href="#/${p.id}" class="${tab=='read'?'on':''}">Article</a><a href="#/${p.id}/~src" class="${tab=='src'?'on':''}">Source</a><a href="#/${p.id}/~hist" class="${tab=='hist'?'on':''}">History</a></nav>`;
   const main=isCat||p.id=='home'?body:tab=='src'?srcTab(p):tab=='hist'?histTab(p):withToc(withRef(body,p),p.id)+seeAlso(body,p)+refs(p);
   html=`<article class="panel${p.id=='home'?' home':''}">${tabs}<h1>${isCat?'Category: ':''}${p.t}</h1>
    <div class=from>From the WaveFern Wiki</div>
    ${main}
    ${p.id=='home'?'':`<div class=cats>${isCat?`<a href="#/home">Main page</a>`:`Category: ${c?`<a href="#/cat-${c.id}">${c.t}</a>`:''}`}</div>`}</article>`}
  document.title=(p&&p.id!='home'?p.t+' - ':'')+'WaveFern Wiki'}
 $('main').innerHTML=html;$('side').innerHTML='<div class=panel>'+sideHTML(id||'home')+'</div>';$('side').classList.remove('on');
 const a=$('side').querySelector('a.on'),sd=$('side');sd.scrollTop=a?Math.max(0,a.offsetTop-sd.clientHeight/2):0;
 document.dispatchEvent(new CustomEvent('wiki:render',{detail:{page:cur&&!cur.hide?cur:null,id:id||'home'}}));
 if(sec&&sec[0]!='~'){const t=$(sec);if(t){t.scrollIntoView();return}}window.scrollTo(0,0)}
window.rndPage=()=>{const l=PAGES.filter(p=>!p.hide&&!location.hash.endsWith('/'+p.id));location.hash='#/'+l[Math.random()*l.length|0].id;return false};

/* category index pages */
function catPages(){CATS.forEach(c=>page('cat-'+c.id,c.t,c.id,{hide:1,sum:c.d,body:()=>{const ps=PAGES.filter(p=>p.cat===c.id&&!p.hide).sort((a,b)=>a.t.localeCompare(b.t));
 return `<p>${c.d}</p><p class=m>This category has ${ps.length} page${ps.length==1?'':'s'}.</p><ul class=catl>${ps.map(p=>`<li><a href="#/${p.id}">${p.t}</a></li>`).join('')}</ul>`}}))}

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
function snip(t,q){const w=q.trim().toLowerCase().split(/\s+/)[0],i=t.toLowerCase().indexOf(w);if(i<0)return esc(t.slice(0,160))+'...';
 const a=Math.max(0,i-70),s=t.slice(a,i+110);return(a?'...':'')+esc(s).replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),m=>'<mark>'+m+'</mark>')+'...'}
function searchPage(q){const r=hits(q);document.title='Search: '+q+' - WaveFern Wiki';
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
 $('ver').textContent=typeof GAME_VERSION!='undefined'?GAME_VERSION:(D.version||'');
 addEventListener('hashchange',render);render()});
