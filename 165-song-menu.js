/* ===== v46.9.0: Make a song screen =====
   Wraps recMenu (05-game-flow.js, with the diss track row from 21-v7..., the 808/hi hat pickers from 132-808-hats.js
   and the band song name from 161-multiplayer.js) and lays it out in the game's menu style: a title, the genres as a
   grid of big buttons with HOT / COLD tags, and everything else (diss track, rival, 808, hi hat) folded into an Extras
   dropdown. The dropdown remembers if it was open, because picking a diss track redraws the screen. */
(()=>{
let XO=0;
const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{lay()}catch(e){console.error('song menu',e)}return r};
function lay(){const box=document.querySelector('#ui .box.modal'),gen=box&&box.querySelector('.gen');if(!gen||box.classList.contains('recm'))return;
 box.classList.add('recm');gen.classList.add('recg');
 const h=box.querySelector('h2');if(h){h.textContent='Make a song';h.insertAdjacentHTML('afterend',`<div class=recl>Pick a genre</div>`)}
 gen.querySelectorAll('button').forEach(b=>{const t=b.textContent,up=/ ▲$/.test(t),dn=/ ▼$/.test(t),nm=up||dn?t.slice(0,-2):t;
  /* the pixel font draws & like $, so R&B keeps a plain ampersand */
  b.innerHTML='<span>'+esc(nm).replace(/&amp;/g,'<span class=amp>&amp;</span>')+'</span>'+(up?'<i class="rect up">▲ Hot</i>':dn?'<i class="rect dn">▼ Cold</i>':'')});
 /* everything between the genre grid and the help text is an extra */
 const hint=[...box.children].find(e=>e.tagName=='P'&&e.classList.contains('m')),xs=[];for(let n=gen.nextElementSibling;n&&n!==hint;n=n.nextElementSibling)xs.push(n);
 if(xs.length){const d=document.createElement('details');d.className='recx';d.open=!!XO;
  const sel=box.querySelector('select.dsel:not([data-k])'),diss=sel&&sel.value=='1',on=[];if(diss)on.push('diss track on');
  xs.forEach(n=>n.querySelectorAll&&n.querySelectorAll('select[data-k]').forEach(s=>{if(s.value!='auto')on.push((s.dataset.k=='s8'?'808':'hi hat')+': '+(s.value?s.options[s.selectedIndex].text:'built-in'))}));
  d.innerHTML=`<summary>Extras<small>${on.length?on.join(' · '):'808, hi hat, diss track'}</small></summary><div class=recxb></div>`;
  const body=d.querySelector('.recxb');xs.forEach(n=>body.appendChild(n));gen.after(d);d.addEventListener('toggle',()=>{XO=d.open?1:0})}
 if(hint){hint.classList.add('rech');hint.innerHTML=hint.innerHTML.replace(/^\s*▲ trending · ▼ cold<br>/,'')}
 const cancel=[...box.children].reverse().find(e=>e.tagName=='BUTTON');if(cancel)cancel.classList.add('recc')}
})();
