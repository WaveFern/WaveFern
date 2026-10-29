/* ===== v46.9.0: Make a song screen =====
   Wraps recMenu (05-game-flow.js, with the diss track row from 21-v7..., the 808/hi hat pickers from 132-808-hats.js
   and the band song name from 161-multiplayer.js) and lays it out in the game's menu style: a title, the genres as a
   grid of big buttons with HOT / COLD tags, and everything else (sub-genre, diss track, rival, 808, hi hat) folded into an Extras
   dropdown. The dropdown remembers if it was open, because picking a diss track redraws the screen. */
(()=>{
let XO=0;
const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{lay()}catch(e){console.error('song menu',e)}return r};
function lay(){const box=document.querySelector('#ui .box.modal'),gen=box&&box.querySelector('.gen');if(!gen||box.classList.contains('recm'))return;
 box.classList.add('recm');gen.classList.add('recg');
 const h=box.querySelector('h2');if(h){h.textContent='Make a song';const last=S.songs&&S.songs[S.songs.length-1];
  h.insertAdjacentHTML('afterend',`<div class=recl>Pick a genre</div>${last&&window.GFOCUS?`<div class=recy>Your sound: <b>${esc(GFOCUS.famName(last.g))}</b>. Fans reward a steady sound, so staying in it earns more streams.</div>`:''}`)}
 gen.querySelectorAll('button').forEach(b=>{const t=b.textContent,up=/ ▲$/.test(t),dn=/ ▼$/.test(t),nm=up||dn?t.slice(0,-2):t;
  /* the pixel font draws & like $, so R&B keeps a plain ampersand */
  /* v47.0.0: how this genre fits your recent releases (166-genre-focus.js) */
  let fc='';try{const m=/startRec\((\d+)\)/.exec(b.getAttribute('onclick')||''),f=m&&window.GFOCUS?GFOCUS.next(GEN[+m[1]]):1,pc=Math.round((f-1)*100);if(pc>=5)fc=`<i class="recf up">+${pc}% focus</i>`;else if(pc<=-5)fc=`<i class="recf dn">${pc}% focus</i>`}catch(e){}
  /* v49.25.0: the sub-genre picked in Extras shows on its genre */
  let sg='';try{const m=/startRec\((\d+)\)/.exec(b.getAttribute('onclick')||''),p=m&&window.subPick?subPick():null;if(p&&GEN[+m[1]]==p.g){sg=`<i class="recs">${esc(p.n)}</i>`;b.classList.add('recsg')}}catch(e){}
  b.innerHTML='<span>'+esc(nm).replace(/&amp;/g,'<span class=amp>&amp;</span>')+'</span>'+(up?'<i class="rect up">▲ Hot</i>':dn?'<i class="rect dn">▼ Cold</i>':'')+fc+sg});
 /* everything between the genre grid and the help text is an extra */
 const hint=[...box.children].find(e=>e.tagName=='P'&&e.classList.contains('m')),xs=[];for(let n=gen.nextElementSibling;n&&n!==hint;n=n.nextElementSibling)xs.push(n);
 if(xs.length){const d=document.createElement('details');d.className='recx';d.open=!!XO;
  const sel=box.querySelector('select.dsel:not([data-k])'),diss=sel&&sel.value=='1',on=[];if(diss)on.push('diss track on');
  xs.forEach(n=>n.querySelectorAll&&n.querySelectorAll('select[data-k]').forEach(s=>{if(s.value!='auto')on.push(s.dataset.k=='sg'?s.options[s.selectedIndex].text:(s.dataset.k=='s8'?'808':'hi hat')+': '+(s.value?s.options[s.selectedIndex].text:'built-in'))}));
  d.innerHTML=`<summary>Extras<small>${on.length?on.join(' · '):'sub-genre, 808, hi hat, diss track'}</small></summary><div class=recxb></div>`;
  const body=d.querySelector('.recxb');xs.forEach(n=>body.appendChild(n));gen.after(d);d.addEventListener('toggle',()=>{XO=d.open?1:0})}
 if(hint){hint.classList.add('rech');hint.innerHTML=hint.innerHTML.replace(/▲[^<]*?cold\s*(<br\s*\/?>)?/,'').trim();if(!hint.textContent.trim())hint.style.display='none'}
 const cancel=[...box.children].reverse().find(e=>e.tagName=='BUTTON');if(cancel)cancel.classList.add('recc')}
})();
