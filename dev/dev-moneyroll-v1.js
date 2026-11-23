/* ===== dev only: money roll (v55.51.0) =====
   Casino style roll on the money readout in the top-left HUD, only when the amount goes UP (any source: pay, sales, gifts, rewards).
   One central hook: a wrapper on hud() compares S.money each time the HUD is drawn, so no money source is patched.
   v55.47.0 payoff: the bigger the gain the longer and bigger the show (tier 0-3 by amount). Digits spin with a vertical motion blur and
   land with a small overshoot bounce, the right-most digit last; a gold "+$X" pops up and floats away; a gold flash and a ring of sparkles
   fire at the landing; ticks slow down with the roll and finish on a rising chime (the game's own sfx(), so the Effects volume and mute apply).
   Cost: CSS only (transforms/opacity on a few elements, one vertical SVG blur while it moves) and sounds are scheduled once on the audio clock;
   the only JS is one number compare per hud() call. hud() rebuilds the HUD whenever its text changes, so the roll is re-applied to the new
   element with a negative animation-delay and keeps playing from where it was. prefers-reduced-motion: nothing animates, no sound. ?nomoneyroll skips it.
   Also plays for the nightly pay (gain made in mode 'sleep', rolled once the new day screen is up) and the while-you-were-away pay (earn() in play mode).
   Nothing is saved. The DEV panel section 'Money roll preview' calls FW_MONEYROLL.preview(amount): a fake gain, S.money is untouched.
   v55.52.2: LIVE (the FW_DEV gate is gone). Any gain made while the readout is hidden (sleep fade, phone, PC, menus) waits in 'pend' and rolls when it shows again.
   Loads after dev-skate-v1.js. */
(function(){
 if(/[?&]nomoneyroll/.test(location.search)||typeof hud!='function')return;
 const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
 const DUR=700,STEP=110,SC=[1,1.15,1.4,1.8]; /* ms: left-most digit, extra per digit to the right; SC = length scale per tier */
 const SEL='#hud .tl>b[style*="var(--g)"]';
 let lastS=null,last=null,roll=null,pend=null,pm=null; /* pend: gains made while the readout is hidden, rolled when it shows again */
 /* is the HUD money readout really on screen (not covered by the phone, the PC, a menu or the sleep fade)? */
 function vis(){const e=document.querySelector(SEL);if(!e)return false;const b=e.getBoundingClientRect();if(!b.width)return false;const t=document.elementFromPoint(b.left+3,b.top+b.height/2);/* #hud has pointer-events:none, so the hit test skips it: the readout is visible when the hit is the bare canvas, not a panel, the phone or the fade */return !!t&&(t.id=='c'||t===document.body||t===document.documentElement||t.id=='hud'||t.id=='ui')}
 const tier=g=>g<20?0:g<500?1:g<20000?2:3;
 const total=r=>(DUR+STEP*12)*SC[r.tier];
 function css(){
  if(document.getElementById('fwmr_css'))return;
  const st=document.createElement('style');st.id='fwmr_css';
  st.textContent='.fwmr{display:inline-block;height:1.2em;line-height:1.2em;overflow:hidden;vertical-align:bottom;text-align:center}'+
   '.fwmr>i{display:block;font-style:normal;will-change:transform;animation:fwmr var(--t) cubic-bezier(.2,.8,.3,1.22) both,fwmb var(--t) linear both;animation-delay:var(--dl)}'+
   '.fwmr>i>s{display:block;text-decoration:none;height:1.2em;line-height:1.2em}'+
   '@keyframes fwmr{from{transform:translateY(0)}to{transform:translateY(calc(var(--d)*-1.2em))}}'+
   '@keyframes fwmb{0%,55%{filter:url(#fwmr_f)}55.1%,100%{filter:none}}'+
   /* the whole readout flashes gold and pulses once when the last digit lands (--ld = landing time) */
   '.fwmg{display:inline-block;transform-origin:0 60%;animation:fwmg 1.2s ease-out forwards;animation-delay:calc(var(--ld) + var(--dl))}'+
   '@keyframes fwmg{0%{color:#ffd24a;text-shadow:0 0 14px #ffc400,0 0 3px #fff;transform:scale(1.28)}35%{transform:scale(.97)}60%{transform:scale(1.04)}100%{color:var(--g);text-shadow:0 0 0 transparent;transform:scale(1)}}'+
   '.fwpop{position:fixed;z-index:99999;pointer-events:none;font:800 20px/1 system-ui,sans-serif;color:#ffd24a;text-shadow:0 0 8px #ffc400,0 2px 0 #7a4b00;opacity:0;white-space:nowrap;animation:fwpop var(--p) cubic-bezier(.2,.9,.3,1) both;animation-delay:var(--pd)}'+
   '@keyframes fwpop{0%{opacity:0;transform:translateY(8px) scale(.5)}15%{opacity:1;transform:translateY(-6px) scale(1.35)}35%{transform:translateY(-14px) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-52px) scale(1)}}'+
   '.fwsp{position:fixed;z-index:99999;pointer-events:none;width:6px;height:6px;margin:-3px;background:#ffe27a;border-radius:50%;box-shadow:0 0 6px #ffc400;opacity:0;animation:fwsp .7s cubic-bezier(.1,.7,.3,1) both;animation-delay:var(--sd)}'+
   '@keyframes fwsp{0%{opacity:1;transform:translate(0,0) scale(1.3)}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(.2)}}'+
   '@media (prefers-reduced-motion:reduce){.fwmr>i,.fwmg,.fwpop,.fwsp{animation:none!important}}';
  document.head.appendChild(st);
  const d=document.createElement('div');d.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML='<svg width="0" height="0"><filter id="fwmr_f" x="0" y="-60%" width="100%" height="220%"><feGaussianBlur stdDeviation="0 2.4"/></filter></svg>';
  document.body.appendChild(d);
 }
 /* start a roll: from/to are the display texts, gain the amount. Sounds, pop and sparkles are set up once here. */
 function start(from,to,gain){
  css();
  const r={from,fake:null,t0:performance.now(),tier:tier(gain),gain};
  roll=r;
  const T=total(r)-300,tk=[];
  try{
   const N=14+r.tier*6,vol=.05+r.tier*.012;
   /* ticks follow the ease-out: fast at the start, slowing as the digits settle */
   for(let i=1;i<=N;i++){const p=i/N,tt=1-Math.pow(1-p,1/2.2);sfx(900+p*500,.03,"square",vol,undefined,tt*T/1000*.92,0)}
   /* landing chime: a rising arpeggio, longer for bigger gains */
   const notes=[523,659,784,1047,1319].slice(0,2+r.tier+(r.tier>2?1:0)),at=T/1000*.95;
   notes.forEach((f,i)=>sfx(f,.34,"triangle",.16,undefined,at+i*.07,.5));
  }catch(e){}
  /* popup and sparkles, placed next to the readout (fixed position, pure CSS animation) */
  const el=document.querySelector(SEL);
  if(el){
   const b=el.getBoundingClientRect(),x=b.left+b.width/2,y=b.top;
   const pop=document.createElement('div');pop.className='fwpop';pop.textContent='+'+$$(gain);
   pop.style.cssText='left:'+Math.max(8,b.left)+'px;top:'+(y-6)+'px;--p:'+(1.3+r.tier*.2)+'s;--pd:'+(T-250)+'ms;font-size:'+(18+r.tier*4)+'px';
   document.body.appendChild(pop);setTimeout(()=>pop.remove(),T+2500);
   const n=6+r.tier*5;
   for(let i=0;i<n;i++){
    const a=i/n*6.283+Math.random()*.5,d=22+Math.random()*(22+r.tier*14),s=document.createElement('div');
    s.className='fwsp';s.style.cssText='left:'+(b.left+b.width*.5)+'px;top:'+(y+b.height*.5)+'px;--x:'+(Math.cos(a)*d*1.6).toFixed(0)+'px;--y:'+(Math.sin(a)*d).toFixed(0)+'px;--sd:'+(T-120+Math.random()*80)+'ms';
    document.body.appendChild(s);setTimeout(()=>s.remove(),T+1200);
   }
  }
 }
 function decorate(){
  const el=document.querySelector(SEL);
  if(!el||el.dataset.fwmr)return;
  const to=roll.fake||el.textContent,n=to.length,el0=performance.now()-roll.t0,sc=SC[roll.tier];
  const A=roll.from.padStart(n,' ').slice(-n); /* old text aligned to the new one from the right */
  let first=-1,k=0,h='';
  for(let i=0;i<n;i++)if(first<0&&/\d/.test(to[i]))first=i;
  for(let i=0;i<n;i++){
   const c=to[i];
   if(!/\d/.test(c)){h+=c.replace(/&/g,'&amp;').replace(/</g,'&lt;');continue}
   const a=/\d/.test(A[i])?+A[i]:0,b=+c;
   /* each digit scrolls up through the numbers before landing; the right-most three spin an extra turn (more for big gains) */
   let d=((b-a)+10)%10;if(i>=n-3)d+=10;if(roll.tier>2&&i>=n-5)d+=10;if(d<3)d+=10;
   let cells='';for(let j=0;j<=d+1;j++)cells+='<s>'+((a+j)%10)+'</s>'; /* one spare cell under the target for the overshoot */
   h+='<span class="fwmr"><i style="--d:'+d+';--t:'+Math.round((DUR+k*STEP)*sc)+'ms;--dl:'+(-el0)+'ms">'+cells+'</i></span>';k++;
  }
  el.dataset.fwmr=1;el.innerHTML=h;el.classList.add('fwmg');
  el.style.setProperty('--dl',(-el0)+'ms');el.style.setProperty('--ld',Math.round((DUR+(k-1)*STEP)*sc*.78)+'ms');
 }
 /* preview from the DEV panel: plays a roll up by amt without touching S.money; the real amount is put back when it ends */
 window.FW_MONEYROLL={preview(amt){
  if(typeof S=='undefined'||!S||(RM&&RM.matches)||(mode!='play'&&mode!='drive'))return false;
  const m=+S.money||0;start($$(m),$$(m+amt),amt);roll.fake=$$(m+amt);return true}};
 const o=hud;
 hud=function(){
  const r=o.apply(this,arguments);
  try{
   if(typeof S!='undefined'&&S&&typeof mode!='undefined'&&mode!='load'){
    const m=+S.money||0;
    if(S!==lastS||last===null||pm=='load'){lastS=S;last=m;roll=null;pend=null} /* a load is not a gain */
    else if(m!==last){
     if(m>last&&!(RM&&RM.matches)){
      /* night pay lands in mode 'sleep' (black screen), Label HQ signing pay in 'pc': remember them and roll when the new day screen shows */
      if(pend||!vis()){pend=pend||{from:$$(last),gain:0,w:0,t:performance.now()};pend.gain+=m-last}
      else if(!roll){const pre=$$(last);if(pre!==$$(m))start(pre,$$(m),m-last)}
     }
     last=m;
    }
    if(pend){
     const nw=performance.now();
     if(nw-pend.t>180000)pend=null; /* too old to be worth a roll */
     else if(!vis())pend.w=0;
     else if(!pend.w)pend.w=nw; /* wait a moment: later wake wrappers still add to the night's pay */
     else if(nw-pend.w>300&&!roll){if(pend.from!==$$(m))start(pend.from,$$(m),pend.gain);pend=null}
    }
    pm=mode;
    if(roll){
     if(performance.now()-roll.t0>total(roll)+500){
      if(roll.fake){const e=document.querySelector(SEL);if(e){e.textContent=$$(+S.money||0);delete e.dataset.fwmr;e.classList.remove('fwmg')}}
      roll=null;
     }else decorate();
    }
   }
  }catch(e){}
  return r;
 };
})();
