/* ===== dev only: money roll (v55.46.0) =====
   Casino style roll on the money readout in the top-left HUD, only when the amount goes UP (any source: pay, sales, gifts, rewards).
   One central hook: a wrapper on hud() compares S.money each time the HUD is drawn, so no money source is patched.
   Cost: the roll is pure CSS (a transform on one strip per digit, plus a vertical-only SVG blur while it moves); the only JS is
   one number compare per hud() call. hud() rebuilds the HUD whenever its text changes, so the roll is re-applied to the new element
   with a negative animation-delay and keeps playing from where it was. prefers-reduced-motion: nothing animates. ?nomoneyroll skips it.
   Nothing is saved. The DEV panel section 'Money roll preview' calls FW_MONEYROLL.preview(amount): a fake gain, S.money is untouched. Loads after dev-skate-v1.js, /dev/ only (needs window.FW_DEV). */
(function(){
 if(!window.FW_DEV||/[?&]nomoneyroll/.test(location.search)||typeof hud!='function')return;
 const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
 const DUR=700,STEP=110,END=DUR+STEP*12+300; /* ms: left-most digit, extra per digit to the right (right-most lands last), hard stop */
 let lastS=null,last=null,roll=null;
 function css(){
  if(document.getElementById('fwmr_css'))return;
  const st=document.createElement('style');st.id='fwmr_css';
  st.textContent='.fwmr{display:inline-block;height:1.2em;line-height:1.2em;overflow:hidden;vertical-align:bottom;text-align:center}'+
   '.fwmr>i{display:block;font-style:normal;will-change:transform;animation:fwmr var(--t) cubic-bezier(.15,.75,.2,1) both,fwmb var(--t) linear both;animation-delay:var(--dl)}'+
   '.fwmr>i>s{display:block;text-decoration:none;height:1.2em;line-height:1.2em}'+
   '@keyframes fwmr{from{transform:translateY(0)}to{transform:translateY(calc(var(--d)*-1.2em))}}'+
   '@keyframes fwmb{0%,60%{filter:url(#fwmr_f)}60.1%,100%{filter:none}}'+
   '.fwmg{animation:fwmg 1.1s ease-out both;animation-delay:var(--dl)}'+
   '@keyframes fwmg{0%{text-shadow:0 0 10px var(--g)}100%{text-shadow:0 0 0 transparent}}'+
   '@media (prefers-reduced-motion:reduce){.fwmr>i,.fwmg{animation:none!important}}';
  document.head.appendChild(st);
  const d=document.createElement('div');d.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML='<svg width="0" height="0"><filter id="fwmr_f" x="0" y="-60%" width="100%" height="220%"><feGaussianBlur stdDeviation="0 2.2"/></filter></svg>';
  document.body.appendChild(d);
 }
 function decorate(){
  const el=document.querySelector('#hud .tl>b[style*="var(--g)"]');
  if(!el||el.dataset.fwmr)return;
  const to=roll.fake||el.textContent,n=to.length,el0=performance.now()-roll.t0;
  const A=roll.from.padStart(n,' ').slice(-n); /* old text aligned to the new one from the right */
  let first=-1,k=0,h='';
  for(let i=0;i<n;i++)if(first<0&&/\d/.test(to[i]))first=i;
  for(let i=0;i<n;i++){
   const c=to[i];
   if(!/\d/.test(c)){h+=c.replace(/&/g,'&amp;').replace(/</g,'&lt;');continue}
   const a=/\d/.test(A[i])?+A[i]:0,b=+c;
   /* each digit scrolls up through the numbers before landing; the right-most three spin an extra turn */
   let d=((b-a)+10)%10;if(i>=n-3)d+=10;if(d<3)d+=10;
   let cells='';for(let j=0;j<=d;j++)cells+='<s>'+((a+j)%10)+'</s>';
   h+='<span class="fwmr"><i style="--d:'+d+';--t:'+(DUR+k*STEP)+'ms;--dl:'+(-el0)+'ms">'+cells+'</i></span>';k++;
  }
  el.dataset.fwmr=1;el.innerHTML=h;el.classList.add('fwmg');el.style.setProperty('--dl',(-el0)+'ms');
 }
 /* preview from the DEV panel: plays a roll up by amt without touching S.money; the real amount is put back when it ends */
 window.FW_MONEYROLL={preview(amt){
  if(typeof S=='undefined'||!S||(RM&&RM.matches)||(mode!='play'&&mode!='drive'))return false;
  const m=+S.money||0;css();roll={from:$$(m),fake:$$(m+amt),t0:performance.now()};return true}};
 const o=hud;
 hud=function(){
  const r=o.apply(this,arguments);
  try{
   if(typeof S!='undefined'&&S&&typeof mode!='undefined'&&mode!='load'&&mode!='pc'){
    const m=+S.money||0;
    if(S!==lastS||last===null){lastS=S;last=m;roll=null}
    else if(m!==last){
     if(m>last&&!(RM&&RM.matches)&&!roll){const pre=$$(last);if(pre!==$$(m)){css();roll={from:pre,t0:performance.now()}}}
     last=m;
    }
    if(roll){
     if(performance.now()-roll.t0>END){
      if(roll.fake){const e=document.querySelector('#hud .tl>b[style*="var(--g)"]');if(e){e.textContent=$$(+S.money||0);delete e.dataset.fwmr}}
      roll=null;
     }else decorate();
    }
   }
  }catch(e){}
  return r;
 };
})();
