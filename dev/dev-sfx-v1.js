/* WaveFern dev: a smoother car engine, and footsteps that change with the ground. Only loaded on /dev/ (see dev/index.html). Add ?nosfx to skip it.
   Engine: the old sound was a short buzzy saw beep every 0.1 s. Now one continuous voice (two detuned saws + a sub sine + a little road noise
   through a low-pass) whose pitch follows speed through 5 gears (it rises, dips at each shift) and whose brightness and volume follow the throttle.
   Footsteps: snow = soft crunch, floorboards = wooden knock, concrete (road and pavement) = sharp click, grass = soft swish. */
(function(){
 if(!window.FW_DEV||/[?&]nosfx/.test(location.search))return;
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

 /* ---------- footsteps by surface ---------- */
 function surface(){
  if(typeof IN!='undefined'&&IN||typeof HIN!='undefined'&&HIN||P.z>=260)return 'wood';
  const S=window.FW_SNOWU;if(S&&S.value>.4)return 'snow';
  const B=(typeof PAVE=='number'?PAVE:1.2)+.2;
  if(typeof ROADS!='undefined'&&ROADS.some(r=>P.x>r[0]-B&&P.x<r[2]+B&&P.z>r[1]-B&&P.z<r[3]+B))return 'concrete';
  return 'grass';
 }
 const STEP={
  snow(v,pn){/* a squeaky crunch: a high crackle with a few grains after it, over a muffled press */
   sdNz(.11,3400+R(0,900),.1*v,{ty:'bandpass',q:.9,pan:pn});
   sdNz(.05,5200,.045*v,{ty:'highpass',q:.6,del:.03+R(0,.02),pan:pn});
   sdNz(.035,4200,.035*v,{ty:'highpass',q:.6,del:.075+R(0,.03),pan:pn});
   sdNz(.14,520,.1*v,{ty:'lowpass',q:.7,pan:pn})},
  wood(v,pn){/* a hollow board knock and a little tick; now and then a creak */
   sdHit(150+R(0,40),.13,.2*v,[[1,1,1],[2.6,.3,.5],[4.1,.1,.3]],{jit:.04,pan:pn,rev:.1,lp:1800});
   sdNz(.02,2400,.05*v,{q:1.2,pan:pn});
   if(Math.random()<.12)sdHit(310+R(0,90),.22,.025*v,[[1,1,1],[1.5,.4,.6]],{bend:-.12,pan:pn,del:.04})},
  concrete(v,pn){/* hard sole: a sharp click and a short scuff, little body */
   sdNz(.03,2700+R(0,500),.15*v,{ty:'highpass',q:.8,pan:pn});
   sdHit(105,.05,.07*v,[[1,1,1]],{jit:.06,lp:500,pan:pn});
   sdNz(.05,1500,.045*v,{q:1.1,del:.02,pan:pn})},
  grass(v,pn){/* soft: a low press and a gentle leafy swish */
   sdNz(.09,420,.13*v,{ty:'lowpass',q:.7,pan:pn});
   sdNz(.13,2300+R(0,500),.045*v,{ty:'bandpass',q:.5,del:.02,pan:pn});
   sdHit(80,.05,.035*v,[[1,1,1]],{jit:.08,lp:300,pan:pn})}
 };
 safe(()=>{
  if(typeof stepSnd!='function'||typeof STP=='undefined')return;
  const s0=stepSnd;
  stepSnd=function(run){
   if(typeof sdNz!='function'||typeof sdHit!='function')return s0.apply(this,arguments);
   if(!FX||!OPT.steps)return;
   try{ac();const t=AC.currentTime;if(t-STP.last<.18)return;STP.last=t;STP.ft=-(STP.ft||1);
    STEP[surface()]((run?1.2:1)*R(.85,1.1),STP.ft*.1)}catch(e){}};
 },'steps');
})();
