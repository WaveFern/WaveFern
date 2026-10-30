/* ===== v49.36.0: Upgrades on the Make a song screen =====
   The song screens no longer spell out what your gear does (you bought it, so you know). The Upgrades button under the
   genres opens one list of what you own and what each piece adds: song quality, extra streams and what you feel in the
   studio (GFEEL, 176-game-feel.js). Quality and stream numbers come from the same tables the bonus uses (GQ and GSB in
   52-gear-shop-plus.js; homes, pets and mentors as in mgFinish). Back returns to the genres. */
(()=>{
const lv=k=>(S.gear&&+S.gear[k])||0,pct=v=>Math.round(v*100)+'%';
function rows(){const out=[],Q=typeof GQ!='undefined'?GQ:{},SB=typeof GSB!='undefined'?GSB:{},F=window.GFEEL||{};let q=0,s=0;
 Object.keys(GEAR).forEach(k=>{const l=lv(k);if(!l)return;const G=GEAR[k],fx=[];
  if(Q[k]){fx.push('+'+Q[k]*l+' quality');q+=Q[k]*l}
  if(SB[k]){fx.push('+'+pct(SB[k]*l)+' streams');s+=SB[k]*l}
  if(F[k])fx.push(k=='drums'?'Beat: +'+l+' go'+(l>1?'es':''):k=='chair'?'songs cost '+Math.min(l,3)+' less energy':F[k].replace(/,? (sooner )?each level$/,''));
  out.push([G.lv[l],G.n,l,fx])});
 const h=+S.home||0,p=(S.pets||[]).length,m=typeof mentors=='function'?mentors():0;
 if(h){out.push([h+' home'+(h>1?'s':''),'Property',0,['+'+3*h+' quality','+'+10*h+'% streams']]);q+=3*h;s+=.1*h}
 if(p){out.push([p+' pet'+(p>1?'s':''),'Pets',0,['+'+p+' quality']]);q+=p}
 if(m){out.push([m+' mentor'+(m>1?'s':''),'Mentors',0,['+'+2*m+' quality']]);q+=2*m}
 return{out,q,s}}
window.upgradesView=function(){const{out,q,s}=rows();mode='menu';
 $('ui').innerHTML=`<div class="box modal recm upgv"><h2>Upgrades</h2><div class=recl>${out.length?'+'+q+' quality'+(s?' · +'+pct(s)+' streams':''):'None yet'}</div>
 ${out.length?`<div class=upgl>${out.map(([n,t,l,fx])=>`<div class=upgr><div><b>${esc(n)}</b>${l?`<span class=gpip>${[1,2,3].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</span>`:''}<small>${esc(t)}</small></div><p>${fx.map(esc).join(' · ')}</p></div>`).join('')}</div>`:'<p class=m style="text-align:center">Buy gear in the Gearshop on your laptop.</p>'}
 <button class=recc onclick="recMenu()">Back</button></div>`};
/* the button, between the extras and Cancel */
{const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{const box=document.querySelector('#ui .box.modal.recm'),c=box&&box.querySelector('.recc');
 if(c&&!box.querySelector('.recu')){const{out,q}=rows();c.insertAdjacentHTML('beforebegin',`<button class=recu onclick="upgradesView()">Upgrades<small>${out.length?'+'+q+' quality · '+out.length+' owned':'none yet'}</small></button>`)}}catch(e){console.error('upgrades',e)}return r}}
{const st=document.createElement('style');st.textContent=`.recm .recu{width:100%;display:flex;align-items:baseline;gap:10px;margin:0 0 12px;padding:10px 12px;font:14px 'Silkscreen',ui-monospace,monospace;letter-spacing:1px;text-align:left;border:3px solid #000;background:#0a0d0b}
.recm .recu::before{content:'▲';font-size:10px;color:var(--g)}.recm .recu small{font:12px ui-monospace,Menlo,Consolas,monospace;color:var(--m);letter-spacing:0;margin-left:auto}
.upgv .upgl{display:flex;flex-direction:column;gap:6px;margin:0 0 12px}
.upgv .upgr{padding:8px 10px;background:#0a0d0b;border:2px solid #000;box-shadow:inset 0 0 0 2px #2a352e}
.upgv .upgr>div{display:flex;align-items:center;gap:6px}.upgv .upgr small{margin-left:auto;font-size:11px;color:var(--m)}
.upgv .upgr p{margin:4px 0 0;font-size:12px;color:var(--g)}`;document.head.appendChild(st)}
})();
