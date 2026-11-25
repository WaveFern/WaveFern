/* WaveFern dev: a smoother car engine. Only loaded on /dev/ (see dev/index.html). Add ?nosfx to skip it.
   Engine: the old sound was a short buzzy saw beep every 0.1 s. Now one continuous voice (two detuned saws + a sub sine + a little road noise
   through a low-pass) whose pitch follows speed through 5 gears (it rises, dips at each shift) and whose brightness and volume follow the throttle.  Footsteps: see dev-footsteps-v1.js. */
(function(){
 if(!window.FW_FEAT||/[?&]nosfx/.test(location.search))return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev sfx '+t,e)}}};
 const R=(a,b)=>a+Math.random()*(b-a);

 /* ---------- engine ---------- */
 /* the old per-tick beep is dropped (the only saw sfx of this length and level) */
 safe(()=>{if(typeof sfx!='function')return;const s0=sfx;sfx=function(f,d,ty,v){if(typeof mode!='undefined'&&mode=='drive'&&ty=='sawtooth'&&d==.09&&v==.04)return;return s0.apply(this,arguments)}},'sfx');
 let E=null,gear=0,dip=0;
 function build(){
  if(E||typeof AC=='undefined'||!AC||typeof MG=='undefined'||!MG)return;
  const c=AC,out=c.createGain(),lp=c.createBiquadFilter(),o1=c.createOscillator(),o2=c.createOscillator(),sub=c.createOscillator(),
   g1=c.createGain(),g2=c.createGain(),gs=c.createGain(),nz=c.createBufferSource(),nf=c.createBiquadFilter(),ng=c.createGain();
  out.gain.value=0;lp.type='lowpass';lp.Q.value=1.2;lp.frequency.value=400;
  o1.type='sawtooth';o2.type='sawtooth';sub.type='sine';g1.gain.value=.5;g2.gain.value=.4;gs.gain.value=.9;
  o1.connect(g1);o2.connect(g2);sub.connect(gs);g1.connect(lp);g2.connect(lp);gs.connect(out);lp.connect(out);
  const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  nz.buffer=b;nz.loop=true;nf.type='lowpass';nf.frequency.value=700;ng.gain.value=0;nz.connect(nf);nf.connect(ng);ng.connect(out);
  out.connect(MG);[o1,o2,sub,nz].forEach(n=>n.start());
  E={out,lp,o1,o2,sub,ng,nf};
 }
 function engineTick(){
  const on=typeof mode!='undefined'&&mode=='drive'&&typeof dr!='undefined'&&dr&&!PAUSED&&FX&&!document.hidden;
  if(!on){if(E)E.out.gain.setTargetAtTime(0,AC.currentTime,.08);gear=0;return}
  try{ac();build();if(!E)return;
   const t=AC.currentTime,C=CARS[dr.i]||{top:15},top=Math.max(8,C.top),v=Math.abs(dr.v),th=(keys.w||keys.arrowup)?1:0;
   /* gear from speed: 5 gears over the top speed; shifts down only once clearly below the boundary so it does not hunt */
   const f=Math.min(1.1,v/top)*5,g=Math.min(4,Math.floor(f));
   if(g>gear){gear=g;dip=.22}else if(g<gear&&f<gear-.2)gear=g;
   dip=Math.max(0,dip-.012);
   const within=Math.max(0,Math.min(1,f-gear)),rpm=Math.max(.05,.16+.7*within+(th?.06:0)-dip);/* 0..1 */
   const base=26+rpm*70;/* firing fundamental in Hz: about 30 at idle, up to about 95 flat out */
   const idle=v<.4&&!th;
   E.o1.frequency.setTargetAtTime(base,t,.06);E.o2.frequency.setTargetAtTime(base*1.008+.35,t,.06);E.sub.frequency.setTargetAtTime(base*.5,t,.06);
   E.lp.frequency.setTargetAtTime(260+rpm*820+(th?260:0),t,.08);
   E.out.gain.setTargetAtTime(idle?.045:.07+rpm*.05+(th?.03:0),t,.1);
   E.ng.gain.setTargetAtTime(Math.min(.05,v/top*.05),t,.12);E.nf.frequency.setTargetAtTime(400+v*50,t,.12);
  }catch(e){}
 }
 setInterval(engineTick,50);
 /* footsteps by surface now live in dev-footsteps-v1.js (real recordings); the duplicate synthesised set that was here is gone */
})();
