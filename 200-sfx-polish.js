/* v49.53.0: sound-effect polish. Every effect is still synthesised live (no sample files, so nothing to license and no extra download),
   but now each one is built from layers (a transient, a tuned body, a shimmer tail and a touch of sub) on the palette in 09-settings-effects.js.
   New names: buy, levelup, perfect, great, good, miss, notify, toggle, tab, swoosh, coins. See docs/SFX-CREDITS.md. */
(()=>{
const BELL=[[1,1,1],[2.76,.32,.55],[5.4,.12,.3],[8.9,.04,.18]],GLASS=[[1,1,1],[2.4,.22,.5],[4.1,.1,.3]],MARIMBA=[[1,1,1],[3.9,.35,.18],[9.2,.05,.1]],SUB=[[1,1,1]];
const pan=()=>R(-.15,.15);
Object.assign(SND,{
 /* click: a crisp little tick with a body, like pressing a good mechanical key */
 click:()=>{sdNz(.01,4200,.14,{q:1.4,ty:'highpass',pan:pan()});sdHit(2100,.035,.07,MARIMBA,{jit:.04,bend:.04});sdHit(260,.03,.06,SUB,{bend:.3,lp:900})},
 /* pop: a bubble that blooms upward */
 pop:()=>{sdHit(520,.14,.3,[[1,1,1],[3.93,.2,.3]],{bend:-.55,jit:.05,rev:.06,pan:pan()});sdHit(1560,.07,.08,GLASS,{del:.015,jit:.03});sdNz(.008,3000,.1,{q:.9})},
 /* ping: a bell with a shimmer */
 ping:()=>{const f=1318*sdJ(.01);sdHit(f,.5,.09,BELL,{jit:0,rev:.28});sdHit(f*2,.3,.03,SUB,{del:.02,jit:0,rev:.3,pan:.3});sdHit(f*1.5,.35,.035,GLASS,{del:.07,jit:0,rev:.32,pan:-.3});sdNz(.008,6000,.03,{ty:'highpass'})},
 /* chime: a soft rising major arpeggio */
 chime:()=>{const f=523*sdJ(.015);[1,1.25,1.5,2].forEach((r,i)=>sdHit(f*r,.85-i*.1,.075,BELL,{del:i*.055,jit:.001,rev:.34,pan:(i-1.5)*.22}));sdHit(f/2,1,.05,[[1,1,1],[2,.15,.4]],{jit:0,rev:.2});sdNz(.5,5200,.02,{ty:'highpass',sw:.35,rev:.3})},
 /* cash: a till ka-ching, drawer thunk then a shower of bright coins */
 cash:()=>{sdHit(130,.09,.26,SUB,{bend:.5,lp:600});sdNz(.03,2000,.12,{q:.8});const c=(d,f,v)=>sdHit(f,.28,v,[[1,1,1],[1.47,.5,.8],[2.09,.4,.6],[2.76,.25,.5],[3.9,.1,.3]],{del:d,rev:.14,pan:R(-.3,.3),jit:.025,lp:9000});c(.05,2093,.15);c(.1,2637,.14);c(.17,3136,.13);if(Math.random()<.7)c(.24+R(0,.04),3520,.07);sdHit(4186,.5,.04,BELL,{del:.12,jit:0,rev:.3})},
 coins:()=>{for(let i=0;i<5;i++)sdHit(2200+R(0,1400),.2,.07,BELL,{del:i*.045+R(0,.02),pan:R(-.5,.5),rev:.14,jit:.03,lp:9000})},
 /* buy: a satisfying two-stage purchase: stamp, then the ka-ching rising */
 buy:()=>{sdHit(90,.14,.35,SUB,{bend:.7,lp:500});sdNz(.05,900,.14,{ty:'lowpass'});[1568,2093,2637].forEach((f,i)=>sdHit(f,.3,.1,BELL,{del:.07+i*.06,rev:.2,jit:0,pan:(i-1)*.2,lp:9000}));sdNz(.18,6500,.04,{ty:'highpass',del:.15,rev:.2})},
 /* err: a low double thud, soft and unmistakable but never harsh */
 err:()=>{const f=196*sdJ(.02);sdHit(f,.1,.16,[[1,1,1],[1.5,.3,.5],[2.3,.15,.4]],{bend:.1,jit:0,lp:1300});sdHit(f*.75,.14,.15,[[1,1,1],[1.5,.25,.5]],{del:.09,jit:0,lp:1000});sdHit(70,.12,.2,SUB,{bend:.5,lp:300});sdNz(.025,700,.07,{ty:'lowpass'})},
 whoosh:()=>{const up=Math.random()<.5,a=up?350:2400,b=up?2600:380,d=.45+R(0,.1),pn=R(.2,.4)*(Math.random()<.5?-1:1);sdNz(d,a,.2,{q:1.3,f2:b,sw:.5,pan:pn,pan2:-pn,rev:.18});sdNz(d*.9,a*2,.06,{q:.9,f2:b*2,sw:.55,del:.025,pan:-pn,pan2:pn});sdHit(up?180:420,d*.8,.05,SUB,{bend:up?-.8:.8,lp:900})},
 swoosh:()=>SND.whoosh(),
 thunk:()=>{sdHit(88,.2,.5,[[1,1,1],[1.7,.25,.5]],{bend:.6,jit:.04,lp:520});sdNz(.06,380,.28,{ty:'lowpass'});sdHit(480,.04,.1,MARIMBA,{del:.003,jit:.05})},
 /* eat: crunches with a tiny wet pop */
 eat:()=>{let d=0;for(let i=0,n=3+(Math.random()*2|0);i<n;i++){sdNz(.035+R(0,.03),1300+R(0,1800),.22+R(0,.1),{q:2+R(0,2.5),del:d,pan:R(-.12,.12)});sdNz(.012,5000,.07,{ty:'highpass',del:d});sdHit(300+R(0,200),.03,.05,SUB,{del:d,lp:700});d+=.07+R(0,.07)}},
 rec:()=>{sdNz(.012,2000,.15,{q:1.5});sdHit(330,.09,.2,MARIMBA,{bend:.12});sdHit(988,.55,.08,BELL,{del:.09,jit:0,rev:.34});sdHit(1480,.45,.05,BELL,{del:.16,jit:0,rev:.34,pan:.25})},
 toggle:()=>{sdHit(1400,.04,.1,MARIMBA,{jit:.02});sdHit(2100,.06,.08,GLASS,{del:.035,jit:.02});sdNz(.008,4500,.07,{ty:'highpass'})},
 tab:()=>{sdHit(1000,.05,.09,MARIMBA,{jit:.03,bend:.1});sdNz(.012,2500,.07,{q:1})},
 notify:()=>{sdHit(1175,.4,.09,BELL,{jit:0,rev:.26,pan:-.1});sdHit(1568,.55,.09,BELL,{del:.11,jit:0,rev:.3,pan:.1});sdNz(.01,6000,.03,{ty:'highpass'})},
 /* level up: a rising fanfare of bells over a swelling sparkle */
 levelup:()=>{const n=[523,659,784,1047,1319];n.forEach((f,i)=>{sdHit(f,.7+i*.1,.1,BELL,{del:i*.075,jit:0,rev:.3,pan:(i-2)*.2,lp:10000});sdHit(f/2,.5,.04,[[1,1,1],[2,.2,.4]],{del:i*.075,jit:0,lp:1500})});
  sdHit(1568,1.2,.09,BELL,{del:.42,jit:0,rev:.4});sdHit(2093,1.3,.07,BELL,{del:.42,jit:0,rev:.4,pan:.3});sdHit(65,.6,.25,SUB,{del:.4,bend:.3,lp:260});sdNz(.9,6000,.05,{ty:'highpass',sw:.3,rev:.35,del:.1,q:.6})},
 /* beat judgements */
 perfect:()=>{sdHit(1760,.45,.1,BELL,{jit:0,rev:.26});sdHit(2637,.5,.07,BELL,{del:.045,jit:0,rev:.3,pan:.2});sdHit(3520,.5,.04,BELL,{del:.09,jit:0,rev:.32,pan:-.2});sdHit(110,.12,.25,SUB,{bend:.8,lp:400});sdNz(.012,5500,.1,{ty:'highpass'})},
 great:()=>{sdHit(1568,.35,.09,BELL,{jit:0,rev:.22});sdHit(2349,.4,.05,BELL,{del:.05,jit:0,rev:.25,pan:.15});sdHit(120,.1,.18,SUB,{bend:.7,lp:350})},
 good:()=>{sdHit(1175,.25,.08,GLASS,{jit:0,rev:.15});sdHit(100,.08,.14,SUB,{bend:.6,lp:300})},
 miss:()=>{sdHit(150,.18,.18,[[1,1,1],[1.5,.2,.4]],{bend:-.5,jit:.02,lp:600});sdNz(.08,400,.08,{ty:'lowpass'})}});
/* Beat hits get a ringing judgement on top of the climbing note */
{const h0=recHit;recHit=function(){const r0=rec;if(!r0||r0.st||r0.cd>0||r0.cdn>0)return h0.apply(this,arguments);const pos=r0.pos,hits=r0.hits,miss=r0.miss;
 const r=h0.apply(this,arguments);try{if(r0.hits>hits){const d=Math.abs(pos-.5),zw=r0.zw||.08;snd(d<zw*.35?'perfect':d<zw*.7?'great':'good')}else if(r0.miss>miss)snd('miss')}catch(e){}return r}}
/* Fame level up fanfare */
let lv=null;setInterval(()=>{try{if(!S||!S.artist||typeof fameLevel!='function')return;const l=fameLevel();if(lv!=null&&l>lv)snd('levelup');lv=l}catch(e){}},1000);
/* tabs and toggles get their own tiny sounds instead of the generic click when the markup says so */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;if(b.dataset&&b.dataset.t)snd('tab')},true);
})();
