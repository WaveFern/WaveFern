/* v49.94.0: ALL audio fades out when the player leaves the tab (switch tab, minimise, lock screen, switch app on a phone) and fades back in on return.
   One central place so every sound follows the same rule:
   - HF.f is the fade (1 = full, 0 = silent). Sounds played through the Web Audio API (effects, ambience, car radios, Beats songs) are routed through
     one master gain per output, so they fade without anything else touching them. HTML audio (soundtrack, applause, preview) multiplies its volume by HF.f.
   - Nothing is muted, unmuted, paused or resumed here: volumes and mute states are never changed, the fade is a separate multiplier, so coming back restores exactly what was playing.
   - HF.silent() turns true once the fade-out is done; Beats uses it to pause the song cleanly (the Beat clock keeps running while it fades, and pauses after).
   Leaving = tab hidden, pagehide, or (touch devices only) the window losing focus. Returning = visible again, pageshow, focus, or any tap or key. */
(()=>{
 if(window.HF)return;
 const OUT=600,IN=800;let away=false,t0=0,from=1,to=1,dur=1,iv=0,blurT=0;const subs=[],masters=[];
 const H=window.HF={f:1,away:()=>away,silent:()=>away&&H.f<=.002,fading:()=>away&&H.f>.002,sub:fn=>{subs.push(fn)},
  /* pause a media element, fading it out first when the player has just left the tab (otherwise pause at once) */
  pauseEl(a){if(!a||a.paused)return;if(!away||H.f<=.002){a.pause();return}
   const v0=a.volume,f0=H.f;if(a._hfp)clearInterval(a._hfp);a._hfp=setInterval(()=>{if(!away||H.f<=.002||a.paused){clearInterval(a._hfp);a._hfp=0;a.pause();return}a.volume=Math.max(0,Math.min(1,v0*H.f/f0))},30)},
  cancelEl(a){if(a&&a._hfp){clearInterval(a._hfp);a._hfp=0}}};
 const emit=()=>{subs.forEach(fn=>{try{fn(away)}catch(e){}})};
 function step(){const k=Math.min(1,(performance.now()-t0)/dur);H.f=from+(to-from)*k;if(k>=1){H.f=to;clearInterval(iv);iv=0;emit()}}
 function go(target,ms){from=H.f;to=target;t0=performance.now();dur=Math.max(1,ms*(Math.abs(target-from)||1));if(!iv)iv=setInterval(step,30);
  for(let i=masters.length-1;i>=0;i--){const g=masters[i];try{if(g.context.state=='closed'){masters.splice(i,1);continue}const t=g.context.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(target,t+dur/1000)}catch(e){}}}
 function leave(){if(away)return;away=true;go(0,OUT);emit();/* a hidden tab can run timers late: check again once the fade is over */setTimeout(emit,OUT+80);
  try{if(typeof mFade=='function'&&typeof MENUA!='undefined'&&MENUA&&!MENUA.paused)mFade(0,OUT)}catch(e){}}
 function back(){if(!away)return;if(document.hidden)return;away=false;go(1,IN);emit();
  try{if(typeof mFade=='function'&&typeof MENUA!='undefined'&&MENUA&&!MENUA.paused)mFade(1,IN)}catch(e){}}
 const touch=()=>{try{return matchMedia('(pointer:coarse)').matches||(typeof WF_TOUCH=='function'&&WF_TOUCH())}catch(e){return false}};
 document.addEventListener('visibilitychange',()=>{clearTimeout(blurT);if(document.hidden)leave();else back()});
 addEventListener('pagehide',()=>{clearTimeout(blurT);leave()});addEventListener('pageshow',()=>back());
 /* phones sometimes only fire blur (app switcher, a call, a notification shade): fade then too, but not on desktop where blur just means another window was clicked */
 addEventListener('blur',()=>{if(!touch())return;clearTimeout(blurT);blurT=setTimeout(()=>{if(!document.hasFocus||!document.hasFocus())leave()},250)});
 addEventListener('focus',()=>{clearTimeout(blurT);back()});
 ['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,()=>{if(away&&!document.hidden)back()},true));
 /* every connection to a speaker output goes through one master gain per output, which is what fades */
 if(typeof AudioNode!='undefined'&&typeof AudioDestinationNode!='undefined'){
  const oc=AudioNode.prototype.connect,od=AudioNode.prototype.disconnect,M=new WeakMap();
  const master=d=>{let g=M.get(d);if(!g){g=d.context.createGain();g.gain.value=H.f;oc.call(g,d);M.set(d,g);masters.push(g)}return g};
  AudioNode.prototype.connect=function(d){let a=arguments;try{if(d instanceof AudioDestinationNode){a=Array.prototype.slice.call(arguments);a[0]=master(d);oc.apply(this,a);return d}}catch(e){a=arguments}return oc.apply(this,a)};
  AudioNode.prototype.disconnect=function(d){let a=arguments;try{if(d instanceof AudioDestinationNode&&M.has(d)){a=Array.prototype.slice.call(arguments);a[0]=M.get(d)}}catch(e){a=arguments}return od.apply(this,a)}}
})();
