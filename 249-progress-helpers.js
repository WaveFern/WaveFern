/* ===== v55.21.0: gentler progression so new players do not think they are broke =====
   - Gear prices: every gear line used to jump x6, x36, x144... from its first price (UPX.gearK in 101). The ladder is now x1, x4, x16, x64, x288,
     so there is an affordable next step at every amount of money. Set once, safe to run again (it works from each line's first price).
   - Gear shop: a "Within reach" banner at the top names the cheapest upgrade you can buy now, or how much more the cheapest one costs.
   No saved state; gear levels in S.gear are untouched. */
(()=>{
const RATIO=[1,4,16,64,288];
function smooth(){try{const seen=new Set;Object.values(GEAR).forEach(g=>{if(seen.has(g)||!Array.isArray(g.c)||!g.c.length)return;seen.add(g);const b=g.c[0];g.c=g.c.map((_,i)=>Math.round(b*(RATIO[i]||RATIO[RATIO.length-1]*Math.pow(4,i-RATIO.length+1))))})}catch(e){console.error('gear prices',e)}}
smooth();
function steps(){const o=[];try{Object.keys(GEAR).forEach(k=>{const G=GEAR[k],l=+(S.gear&&S.gear[k])||0;if(!G||l>=G.c.length||(typeof gearLock=='function'&&gearLock(k)))return;o.push({k,n:G.lv[l+1]||G.n,g:G.n,c:G.c[l]})})}catch(e){}return o.sort((a,b)=>a.c-b.c)}
{const p0=PG.shop;PG.shop=function(){smooth();let h=p0.apply(this,arguments);try{const m=+S.money||0,s=steps(),a=s.filter(x=>x.c<=m).pop(),n=s[0];
  const t=!n?'':a?`You can afford <b>${esc(a.n)}</b> (${esc(a.g)}) for ${$$(a.c)}. Cheaper steps are in every category below.`:`Your next goal: <b>${esc(n.n)}</b> (${esc(n.g)}) for ${$$(n.c)}, only ${$$(n.c-m)} more. Release songs and play gigs to get there.`;
  if(t)h=h.replace('</p>','</p><div class=gtl style="border-left-color:#2fe68a"><b>Within reach</b><p>'+t+'</p></div>');}catch(e){console.error('within reach',e)}return h}}
})();
