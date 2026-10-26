/* WaveFern Wiki (v47.7.0): small reading aids, run after every page render ('wiki:render' from wiki.js).
   - Read pages: links to pages you have already opened turn a darker green, like visited links in an encyclopedia.
     Hash links never count as visited in the browser, so the list is kept in localStorage 'wk_seen'.
   - Page previews: pointing at a link to another article shows its title and short description. */
(()=>{
let SEEN=new Set;try{SEEN=new Set(JSON.parse(localStorage.getItem('wk_seen')||'[]'))}catch(e){}
function mark(){document.querySelectorAll('#side a[href^="#/"],#main a[href^="#/"]').forEach(a=>{const id=a.getAttribute('href').slice(2).split('/')[0];if(SEEN.has(id))a.classList.add('seen')})}
function visit(p){if(!p||SEEN.has(p.id))return;SEEN.add(p.id);try{localStorage.setItem('wk_seen',JSON.stringify([...SEEN]))}catch(e){}}

let PV=null,PT=0;
function show(a){const id=a.getAttribute('href').slice(2).split('/')[0],p=byId(id);if(!p||p.hide)return;const c=CATS.find(c=>c.id===p.cat);
 if(!PV){PV=document.createElement('div');PV.id='pv';document.body.appendChild(PV)}
 PV.innerHTML=`<b>${p.t}</b><p>${p.sum||''}</p><small>${c?c.t:''}</small>`;
 const r=a.getBoundingClientRect(),w=300;PV.style.width=w+'px';PV.style.left=Math.min(innerWidth-w-12,Math.max(12,r.left))+'px';PV.style.top=(r.bottom+6)+'px';PV.classList.add('on');
 if(r.bottom+6+PV.offsetHeight>innerHeight-8)PV.style.top=(r.top-6-PV.offsetHeight)+'px'}
function hide(){clearTimeout(PT);if(PV)PV.classList.remove('on')}
if(matchMedia('(hover: hover)').matches){
 document.addEventListener('mouseover',e=>{const a=e.target.closest('#main article a[href^="#/"]:not(.tabs a):not(.toc a)');if(!a)return;clearTimeout(PT);PT=setTimeout(()=>show(a),450)});
 document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('#main article a[href^="#/"]'))hide()});
 addEventListener('scroll',hide,{passive:true})}

document.addEventListener('wiki:render',e=>{hide();visit(e.detail.page);mark()});
})();
