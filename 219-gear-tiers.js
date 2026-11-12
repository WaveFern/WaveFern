/* ---------- v49.97.0: six gear categories and six studio levels ----------
   The gear shop is now six categories: Bass, Keys, Microphone, Room, Drums and Getting Heard. Every existing gear line (GEAR in 02, 52 and 197)
   is filed under one of them and keeps its own price, models and level in S.gear, so nothing is removed or renamed and saves are not rewritten.
   A category's level (0 to 5) and the overall Studio Level (1 to 6) are worked out from S.gear every time they are asked for, which is also
   how existing saves are moved over: whatever a player already bought sets their level. Nothing is stored except S.gtLv (the last level shown).
   Studio Level decides how many minigames are unlocked (GT.mgTotal) and how many a song needs (GT.need), and the quality ceiling bonus (GT.qMax).
   Used by 220-minigames.js. Replaces PG.shop from 52-gear-shop-plus.js (the Gearhouse screen in 22a still wraps PG.shop). */
(()=>{
const CATS=[
 {id:'bass',n:'Bass',d:'Strings and low end',lines:['bass','guitar','pedals','tape']},
 {id:'keys',n:'Keys',d:'Keys, synths and samples',lines:['keys','synth','sampler','plugins']},
 {id:'mic',n:'Microphone',d:'Vocals and the recording chain',lines:['mic','vocal','iface','phones']},
 {id:'room',n:'Room',d:'Space, mixing and comfort',lines:['chair','booth','treat','monitors','desk','stamina']},
 {id:'drums',n:'Drums',d:'Drums, decks and the finish',lines:['drums','decks','mastering']},
 {id:'heard',n:'Getting Heard',d:'How far released music travels',lines:['promo','content','merch','press','live'],reach:1}];
const NAMES=['Bedroom Setup','Home Studio','Project Studio','Pro Studio','Commercial Studio','Legendary Studio'];
const MG_TOTAL=[1,2,3,4,5,6],NEED=[1,2,2,3,4,4],QMAX=[0,4,9,15,22,30],TH=[0,3,8,14,21,28];
const lv=k=>Math.max(0,Math.min(5,+(S.gear&&S.gear[k])||0));
/* any line a later file adds that is not listed above goes to Room, so nothing is ever left out of the shop */
const lines=c=>{const l=c.lines.filter(k=>GEAR[k]);if(c.id=='room')Object.keys(GEAR).forEach(k=>{if(!CATS.some(x=>x.lines.includes(k)))l.push(k)});return l};
/* category level: 0 to 5, from the best three lines in it (so one big purchase or three small ones both count). Level 5 needs three lines at about level 3
   (the old top level); levels 4 and 5 of a line are a bonus on top. */
const CT=[1,3,5,7,9];
const catLv=c=>{const s=lines(c).map(lv).sort((a,b)=>b-a).slice(0,3).reduce((a,b)=>a+b,0);return CT.filter(t=>s>=t).length};
/* studio level: total of the six category levels must reach TH, and the weakest category must keep up (level 4 needs all six at 1, 5 at 2, 6 at 3) */
function level(){let pts=0,min=5;CATS.forEach(c=>{const l=catLv(c);pts+=l;min=Math.min(min,l)});for(let L=6;L>=2;L--)if(pts>=TH[L-1]&&min>=L-3)return L;return 1}
const GT={cats:CATS,names:NAMES,level,catLv,lines,
 catOf:k=>CATS.find(c=>lines(c).includes(k)),
 mgTotal:L=>MG_TOTAL[(L||level())-1],need:L=>NEED[(L||level())-1],qMax:L=>QMAX[(L||level())-1],
 /* what a category is worth to a song: Getting Heard is reach (streams), the other five are the sound */
 pts(){return CATS.reduce((a,c)=>a+catLv(c),0)}};
window.GT=GT;
/* ---- one-time notice: moved-over saves are told their level, and a level up is announced ---- */
let chk=0;
{const u0=update;update=function(dt){u0(dt);chk-=dt;if(chk>0||mode!='play'||!S||!S.gear)return;chk=2;try{const L=level();
 if(S.gtLv===undefined){S.gtLv=L;if(L>1)say('Your gear counts as Studio Level '+L+': '+NAMES[L-1]+'. '+GT.mgTotal(L)+' minigames unlocked.')}
 else if(L>S.gtLv){S.gtLv=L;try{chime()}catch(e){}say('Studio Level '+L+': '+NAMES[L-1]+'. '+GT.mgTotal(L)+' minigames unlocked, songs now use '+GT.need(L)+'.')}
 else if(L<S.gtLv)S.gtLv=L}catch(e){}}}
/* ---- the shop ---- */
const gl=k=>lv(k);
function nextUp(ks){let b=null;ks.forEach(k=>{const G=GEAR[k],l=gl(k);if(l>=GMAX)return;const c=G.c[l],lk=gearLock(k);if(!b||(!!lk<!!b.lk)||((!!lk==!!b.lk)&&c<b.c))b={k,c,lk}});return b}
const card=k=>{const G=GEAR[k],l=gl(k),mx=l>=GMAX,lk=gearLock(k);
 return`<div class="card gsc${mx?' gsc-max':''}" data-pv="g:${k}:${Math.min(3,l+(mx?0:1))}"><small class=m>${G.n} · ${G.d}</small><p style="margin:4px 0"><b style="font-size:15px">${G.lv[l]}</b> <span class=gpip>${[1,2,3,4,5].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</span> <small class=m>Level ${l}/${GMAX}</small></p><small style="color:var(--g)">${gEff(k)}</small>${typeof gFeel=='function'?gFeel(k):''}${mx?'<p class=m>Maxed out</p>':`<p class=m>Next: ${G.lv[l+1]}${l+1>3?' · bonus x1.5':''}</p>${lk?`<button disabled>Fame Level ${lk} · ${$$(G.c[l])}</button>`:`<button class=go ${S.money<G.c[l]?'disabled':''} onclick="buy('${k}')">Buy ${$$(G.c[l])}</button>`}`}</div>`};
const lvl=(l,n)=>`<span class=gpip>${Array.from({length:n||5},(_,i)=>`<i class="${i<l?'on':''}"></i>`).join('')}</span>`;
PG.shop=()=>{gfill();const L=level(),pts=GT.pts(),q=Math.round(Object.keys(GQ).reduce((a,k)=>a+gearX(k)*GQ[k],0)),s=gearSx();
 const nx=L<6?(()=>{const need=[];if(pts<TH[L])need.push((TH[L]-pts)+' more category level'+(TH[L]-pts>1?'s':''));const w=CATS.filter(c=>catLv(c)<L-2).map(c=>c.n);if(w.length)need.push('every category at '+(L-2)+'+ ('+w.join(', ')+')');return need.join(' and ')})():'';
 const head=`<div class=gtl><div class=gtl-top><b>Studio Level ${L}</b> <span>${NAMES[L-1]}</span>${lvl(L,6)}</div>
  <p>${GT.mgTotal(L)} of 6 minigames unlocked · each song uses ${GT.need(L)} · up to +${GT.qMax(L)} quality for a great performance${q?` · gear adds +${q} quality`:''}${s?` and +${Math.round(s*100)}% streams`:''}</p>
  ${L<6?`<p class=m>Level ${L+1} unlocks ${GT.mgTotal(L+1)-GT.mgTotal(L)} more minigame${GT.mgTotal(L+1)-GT.mgTotal(L)>1?'s':''} and ${GT.need(L+1)} per song. Needs ${nx||'a few more upgrades'}.</p>`:'<p class=m>Top level reached.</p>'}</div>`;
 const sec=c=>{const ks=lines(c),l=catLv(c),n=nextUp(ks),eff=c.reach?'Raises how many listeners released music reaches. It does not change how the song sounds.':'Raises song quality and counts toward your Studio Level.';
  return`<h3 class=gsh>${c.n} <span class=gtc>Level ${l}/5 ${lvl(l)}</span></h3><p class=m style="margin:0 14px 6px">${c.d}. ${eff}${n?` Next: <b>${GEAR[n.k].lv[gl(n.k)+1]}</b> (${GEAR[n.k].n}) ${n.lk?'at Fame Level '+n.lk:$$(n.c)}.`:' Everything here is maxed.'}</p><div class=cards>${ks.map(card).join('')}</div>`};
 return`<h1>Gear shop</h1><p class=m>Balance: <b style="color:var(--g)">${$$(S.money)}</b> · Fame Level ${fameLevel()}</p>${head}${CATS.map(sec).join('')}`};
{const st=document.createElement('style');st.textContent='.gtl{margin:8px 14px 4px;padding:8px 10px;border:1px solid #3b4048;border-left:4px solid #ffb000;background:#0b0c0e80}.gtl p{margin:4px 0!important}.gtl-top b{font-size:15px;color:#f1f3f6}.gtl-top span{margin:0 8px;color:#ffb000;font-size:11px;letter-spacing:1px;text-transform:uppercase}.gtc{float:right;font-size:10px;color:#8d949e;letter-spacing:1px}';document.head.appendChild(st)}
})();
