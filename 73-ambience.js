/* ===== v26.45.0: outdoor ambience and passing cars with music =====
   1. Outdoor ambience (all synthesised with Web Audio, no files). It only plays while you are outside (walking or driving) and
      fades out indoors, in the pause menu, in the PC and sleep screens and when the tab is hidden. How busy it is depends on
      where you stand: every place is a "zone" (city centre, plaza, main roads, home street, Central Park, the playground, the
      festival grounds, the suburbs, school, sports field, and quiet fields as the fallback). Each zone has a busyness (0..1) and
      a mix of layers (cars, horns, chatter, footsteps, birds, wind, children, crowd, traffic hum). Zones blend smoothly with
      distance. Night is quieter and brings crickets. Volume follows the Effects slider and the M mute.
      The car whooshes are real: the three nearest visible traffic cars each get an engine voice with a Doppler-ish pitch and a
      left/right pan, and horns come from real cars near you.
   2. Passing cars with music. The traffic stands for a city of about 1,000,000 cars: every traffic car that comes past you is a
      draw, and it blasts music with probability monthlyListeners / 1,000,000 (S.listeners). It plays one of your own released
      songs (S.songs) through Beats.play (owner 'car') with a muffling low-pass, a bass boost, distance volume and a pan that
      follow the real car. One at a time; never while the beat engine is in use (recording, Spotifly, festival sets). The main
      soundtrack dips by 30% while it is audible and comes back (MU_DIP, read by 08-music.js). If audio/cars/manifest.json lists
      clips, a passing car may play one of those instead, with a fixed 0.5% chance.
   3. Ambience.state() reports the zone, busyness, layers and the active car, for testing. */
window.MU_DIP=1;
var Ambience=(function(){
'use strict';
const clamp=(x,a,b)=>x<a?a:x>b?b:x,ss=(x,a,b)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)},rnd=(a,b)=>a+Math.random()*(b-a);
const LIM=46,RANGE_IN=30,MAXAGE=42,COOL=5,CLIP_P=.005;

/* ---------------- zones ---------------- */
const dRect=(x,z,x0,z0,x1,z1)=>Math.hypot(Math.max(x0-x,0,x-x1),Math.max(z0-z,0,z-z1));
const dSeg=(x,z,x0,z0,x1,z1)=>{const dx=x1-x0,dz=z1-z0,t=clamp(((x-x0)*dx+(z-z0)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-x0-dx*t,z-z0-dz*t)};
const gw=(d,r)=>Math.exp(-1.2*(d/r)*(d/r));
const T=(busy,car,horn,chat,step,bird,wind,kids,crowd,bed)=>({busy,car,horn,chat,step,bird,wind,kids,crowd,bed});
const LK=['car','horn','chat','step','bird','wind','kids','crowd','bed'];
function festOn(){try{return festPhase()=='fest'}catch(e){return false}}
function parkRect(){let z0=-139.5,z1=-44.5;try{z0=WZ(z0);z1=WZ(z1)}catch(e){}return[0,z0,190,z1]}
function playRect(){try{const q=CPARK.zones.find(z=>z[0]=='play');if(q)return[q[1],q[2],q[3],q[4]]}catch(e){}const p=parkRect();return[30,p[3]-28,58,p[3]-8.4]}
/* every zone: name, distance function, softness, traits */
const ZONES=[
 {n:'City plaza',d:(x,z)=>Math.hypot(x-565,z-33),r:85,t:T(1,1,1,1.1,1,.05,.15,0,0,1)},
 {n:'City centre',d:(x,z)=>Math.hypot(x-570,z-5),r:200,t:T(.95,1,1,1,1,.05,.15,0,0,1)},
 {n:'Main road',d:(x,z)=>Math.min(dSeg(x,z,200,-145,200,105),dSeg(x,z,400,-140,400,110),dSeg(x,z,-60,100,600,100),dSeg(x,z,-60,60,600,60)),r:13,t:T(.6,.9,.7,.25,.3,.15,.2,0,0,.7)},
 {n:'Home street',d:(x,z)=>dRect(x,z,-25,-12,75,50),r:45,t:T(.45,.55,.15,.3,.25,.8,.35,.1,0,.35)},
 {n:'Central Park',d:(x,z)=>{const p=parkRect();return dRect(x,z,p[0],p[1],p[2],p[3])},r:30,t:T(.35,.2,0,.25,.2,1,.85,0,0,.3)},
 {n:'Playground',d:(x,z)=>{const p=playRect();return dRect(x,z,p[0],p[1],p[2],p[3])},r:22,t:T(.5,.1,0,.4,.2,.8,.6,1,0,.2)},
 {n:'Festival grounds',d:(x,z)=>dRect(x,z,FEST.X0,FEST.Z0,FEST.X1,FEST.Z1),r:30,on:festOn,t:T(.8,.1,0,.5,.3,.3,.4,0,1,.3)},
 {n:'West suburb',d:(x,z)=>Math.hypot(x+120,z-12),r:90,t:T(.3,.35,.1,.2,.15,.8,.4,.1,0,.25)},
 {n:'South suburb',d:(x,z)=>Math.hypot(x-60,z-110),r:90,t:T(.3,.4,.1,.2,.15,.8,.4,.1,0,.25)},
 {n:'School',d:(x,z)=>Math.hypot(x+100,z-185),r:55,t:T(.35,.15,0,.4,.2,.6,.5,.8,0,.15)},
 {n:'Sports field',d:(x,z)=>Math.hypot(x-300,z-210),r:65,t:T(.3,.1,0,.3,.1,.5,.8,0,.25,.1)},
 {n:'Quiet fields',last:1,d:()=>0,r:1,t:T(.04,0,0,0,0,1,1,0,0,0)}];
function night(){try{return ss(S.t,285,330)}catch(e){return 0}}
function zoneAt(x,z){const nt=night(),tk=.3+.7*(1-nt),L={};LK.forEach(k=>L[k]=0);let best=null,bb=-1,raw=0,mw=0;
 for(const Z of ZONES){if(Z.on&&!Z.on())continue;let w;try{w=Z.last?clamp(1-mw,0,1):gw(Z.d(x,z),Z.r)}catch(e){continue}if(w<.003)continue;if(!Z.last&&w>mw)mw=w;const b=Z.t.busy*w;
  if(b>bb){bb=b;best=Z}if(b>raw)raw=b;LK.forEach(k=>{const v=w*Z.t[k];if(v>L[k])L[k]=v})}
 /* time of day: people and cars thin out at night; birds sleep, crickets chirp where it is quiet */
 const quiet=clamp(1-raw*1.6,0,1);
 L.car*=tk;L.horn*=tk*tk;L.chat*=tk;L.step*=tk;L.crowd*=clamp(1-nt*.35,0,1);L.kids*=1-nt;L.bird*=1-nt;L.bed*=.45+.55*(1-nt);L.wind*=1+nt*.2;L.cricket=nt*clamp(.25+.75*quiet,0,1)*clamp(L.wind,0,1);
 return{name:best?best.n:'Quiet fields',busy:raw*tk,raw,night:nt,L}}

/* ---------------- audio graph ---------------- */
let A=null,CH=null,live=0,okErr=0,tickN=0,MC=null,cool=0,man=null,manBusy=0,clipBuf={};
function userOn(){try{return !!(MU&&MU.on)&&!(navigator.userActivation&&!navigator.userActivation.hasBeenActive)}catch(e){return false}}
function noiseBuf(c){const n=c.sampleRate*3|0,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let b0=0,b1=0,b2=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;b0=.99765*b0+w*.099;b1=.963*b1+w*.2965;b2=.57*b2+w*1.05;d[i]=(b0+b1+b2+w*.18)*.3}return b}
function build(){const c=ac(),mg=c.createGain();mg.gain.value=0;const an=c.createAnalyser();an.fftSize=512;mg.connect(an);
 const nb=noiseBuf(c);A={c,mg,an,nb,on:false,lv:{},cars:[],tm:0,fest:.5,chat:.5};
 const src=()=>{const s=c.createBufferSource();s.buffer=nb;s.loop=true;s.playbackRate.value=rnd(.9,1.1);s.start(0,rnd(0,2.5));return s};
 const lay=(name,flt,base)=>{const s=src(),g=c.createGain();g.gain.value=0;let n=s;flt.forEach(f=>{const b=c.createBiquadFilter();b.type=f[0];b.frequency.value=f[1];b.Q.value=f[2]||.7;n.connect(b);n=b;(A.lv[name]=A.lv[name]||{f:[]}).f.push(b)});n.connect(g);g.connect(mg);A.lv[name].g=g;A.lv[name].base=base};
 lay('wind',[['bandpass',380,.5]],.16);
 lay('bed',[['lowpass',260,.7],['lowpass',700,.5]],.34);
 lay('chat',[['bandpass',620,1.1],['bandpass',1500,.8]],.09);
 lay('crowd',[['lowpass',950,.6],['bandpass',420,.45]],.34);
 /* crickets: two tones pulsed fast, gated slowly */
 A.cr=[4350,4780].map((f,i)=>{const o=c.createOscillator(),am=c.createGain(),gt=c.createGain(),lf=c.createOscillator(),lg=c.createGain(),l2=c.createOscillator(),l2g=c.createGain(),lv=c.createGain();
  o.frequency.value=f;am.gain.value=.5;lf.frequency.value=30+i*3.5;lg.gain.value=.5;lf.connect(lg);lg.connect(am.gain);
  gt.gain.value=.5;l2.frequency.value=1.7+i*.45;l2g.gain.value=.5;l2.connect(l2g);l2g.connect(gt.gain);
  o.connect(am);am.connect(gt);gt.connect(lv);lv.gain.value=0;lv.connect(mg);o.start();lf.start();l2.start();return lv});
 /* three engine voices for the nearest real traffic cars */
 for(let i=0;i<3;i++){const o=c.createOscillator(),o2=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain(),n=src(),bp=c.createBiquadFilter(),ng=c.createGain(),pn=c.createStereoPanner(),vg=c.createGain();
  o.type='sawtooth';o2.type='square';lp.type='lowpass';lp.frequency.value=420;lp.Q.value=1.2;o.frequency.value=o2.frequency.value=60;g.gain.value=.5;
  o.connect(lp);o2.connect(g);g.connect(lp);lp.connect(vg);bp.type='bandpass';bp.frequency.value=900;bp.Q.value=.8;n.connect(bp);bp.connect(ng);ng.gain.value=.5;ng.connect(vg);
  vg.gain.value=0;vg.connect(pn);pn.connect(mg);o.start();o2.start();A.cars.push({o,o2,lp,bp,vg,ng,pn,car:null,f:60})}
 return A}
function attach(on){if(!A)return;if(on&&!A.on){try{A.mg.connect(MG);A.on=true}catch(e){}}else if(!on&&A.on){try{A.mg.disconnect(MG)}catch(e){}A.on=false}}

/* the beat engine's output chain ends in a waveshaper wired to the speakers. We slip a filter, bass shelf and panner in between
   (flat unless a music car is playing), so Beats.play can sound like a car stereo outside. Installed before the engine builds it. */
{const oc=AudioNode.prototype.connect;AudioNode.prototype.connect=function(d){
  try{if(!CH&&typeof WaveShaperNode!='undefined'&&this instanceof WaveShaperNode&&typeof AC!='undefined'&&AC&&this.context===AC&&d===AC.destination){
    const c=AC,inp=c.createGain(),lp=c.createBiquadFilter(),sh=c.createBiquadFilter(),pn=c.createStereoPanner();lp.type='lowpass';lp.frequency.value=20000;lp.Q.value=.8;sh.type='lowshelf';sh.frequency.value=150;sh.gain.value=0;
    oc.call(inp,lp);oc.call(lp,sh);oc.call(sh,pn);oc.call(pn,c.destination);CH={inp,lp,sh,pn};return oc.call(this,inp)}}catch(e){}
  return oc.apply(this,arguments)}}
function chainFx(fc,db,pan,fast){if(!CH)return;const t=CH.lp.context.currentTime,k=fast?.01:.08;CH.lp.frequency.setTargetAtTime(fc,t,k);CH.sh.gain.setTargetAtTime(db,t,k);CH.pn.pan.setTargetAtTime(pan,t,k)}

/* ---------------- helpers ---------------- */
function outdoors(){try{return(mode=='play'||mode=='drive')&&!PAUSED&&!IN&&!HIN&&!GR&&P.z<INTERIOR_Z&&!(FEST&&FEST.view)&&!document.hidden}catch(e){return false}}
const panOf=(x,z)=>clamp(((x-P.x)-(z-P.z))*.7071/32,-1,1)*.9;
function nearPeds(){let n=0;try{for(const a of[VPED,NPC])for(const p of a)if(p.m&&p.m.visible&&Math.abs(p.x-P.x)<30&&Math.abs(p.z-P.z)<30)n++}catch(e){}return n}
function mkPan(p){const n=A.c.createStereoPanner();n.pan.value=p;n.connect(A.mg);return n}
function done(o,pn){live++;o.onended=()=>{live--;try{pn.disconnect()}catch(e){}}}
function env(g,t,a,pk,d){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d)}
function osc(type,f,t,d){const o=A.c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.start(t);o.stop(t+d+.05);return o}

function birds(v,pan){if(live>14)return;const c=A.c,t=c.currentTime+.02,pn=mkPan(pan),n=2+(Math.random()*4|0),sp=rnd(.08,.16),f0=rnd(2300,5200),ty=Math.random()<.5?'sine':'triangle';let last=null;
 for(let i=0;i<n;i++){const s=t+i*sp,d=rnd(.04,.1),o=osc(ty,f0*rnd(.85,1.2),s,d),g=c.createGain();o.frequency.exponentialRampToValueAtTime(clamp(f0*rnd(.6,1.6),1500,7000),s+d);env(g,s,.008,v,s+d-s);o.connect(g);g.connect(pn);last=o}
 done(last,pn)}
function horn(v,pan){if(live>14)return;const c=A.c,t=c.currentTime+.02,pn=mkPan(pan),lp=c.createBiquadFilter(),f=rnd(340,440),n=Math.random()<.35?2:1;lp.type='lowpass';lp.frequency.value=1500;lp.connect(pn);let last=null;
 for(let k=0;k<n;k++){const s=t+k*.42,d=rnd(.22,.55);[1,1.26,2.02].forEach((m,j)=>{const o=osc(j<2?'square':'sine',f*m,s,d),g=c.createGain();env(g,s,.015,v*(j<2?.5:.15),d);o.connect(g);g.connect(lp);last=o})}
 done(last,pn)}
function step(v,pan){if(live>14)return;const c=A.c,t=c.currentTime+.02,pn=mkPan(pan),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=A.nb;f.type='bandpass';f.frequency.value=rnd(250,700);f.Q.value=.9;s.connect(f);f.connect(g);g.connect(pn);env(g,t,.004,v,.07);s.start(t,rnd(0,2.5));s.stop(t+.1);done(s,pn)}
/* a mumble of speech: a buzzing source through two vowel formants in short syllables. kid = higher and brighter, far = muffled */
function voice(v,pan,kid,far){if(live>14)return;const c=A.c,t=c.currentTime+.02,pn=mkPan(pan),o=osc('sawtooth',1,t,2),b1=c.createBiquadFilter(),b2=c.createBiquadFilter(),g=c.createGain(),lp=c.createBiquadFilter(),n=kid?2+(Math.random()*2|0):3+(Math.random()*4|0),f0=kid?rnd(420,620):rnd(95,230);
 b1.type=b2.type='bandpass';b1.Q.value=b2.Q.value=kid?5:4;b1.frequency.value=kid?rnd(750,1050):rnd(450,800);b2.frequency.value=kid?rnd(2200,3200):rnd(1100,2300);lp.type='lowpass';lp.frequency.value=far?1500:3600;
 o.connect(b1);o.connect(b2);b1.connect(g);b2.connect(g);g.connect(lp);lp.connect(pn);g.gain.value=0;let s=t;
 for(let i=0;i<n;i++){const d=kid?rnd(.16,.3):rnd(.09,.2);o.frequency.setValueAtTime(f0*rnd(.85,1.25),s);if(kid)o.frequency.linearRampToValueAtTime(f0*rnd(1.1,1.5),s+d);b1.frequency.setValueAtTime(b1.frequency.value*rnd(.8,1.25),s);g.gain.setValueAtTime(.0001,s);g.gain.linearRampToValueAtTime(v,s+.025);g.gain.linearRampToValueAtTime(.0001,s+d);s+=d+rnd(.02,.1)}
 o.stop(s+.05);done(o,pn)}

/* ---------------- ambience update (every 100 ms) ---------------- */
function ambTick(out){
 const want=out&&userOn()&&typeof FX=='number'&&FX>0&&VOL>0;
 if(!A){if(!want)return;try{build()}catch(e){A=null;return}}
 const c=A.c,t=c.currentTime,Z=zoneAt(P.x,P.z),L=Z.L,dt=.1;
 const lvl=want?(mode=='drive'?.6:1)*.6:0;A.tm+=dt;
 A.mg.gain.setTargetAtTime(lvl,t,lvl?.6:.25);
 if(lvl>0){attach(true);MG.gain.value=FX;A.quietT=0}else if(A.on){A.quietT=(A.quietT||0)+dt;if(A.quietT>2.5)attach(false);}
 if(!A.on||lvl==0&&A.quietT>0.5)return;
 const gust=.5+.5*Math.sin(A.tm*.37+Math.sin(A.tm*.13)*2.2),V=A.lv;
 A.chat=clamp(A.chat+rnd(-.35,.35),.15,1);A.fest=clamp(A.fest+rnd(-.12,.12),.2,1);
 const set=(k,v,fq)=>{V[k].g.gain.setTargetAtTime(v*V[k].base,t,.5);if(fq)V[k].f[0].frequency.setTargetAtTime(fq,t,.6)};
 set('wind',clamp(L.wind,0,1)*(.45+.55*gust)*(1-.5*clamp(Z.raw*1.4,0,1)),260+260*gust);
 set('bed',clamp(L.bed,0,1)*(.55+.45*Z.raw));
 const pk=clamp(nearPeds()/8,0,1);
 V.chat.g.gain.setTargetAtTime(clamp(L.chat,0,1.2)*V.chat.base*(.5+.5*pk)*A.chat*2.0,t,.12);
 V.crowd.g.gain.setTargetAtTime(clamp(L.crowd,0,1)*V.crowd.base*A.fest,t,.25);
 A.cr.forEach((g,i)=>g.gain.setTargetAtTime(L.cricket*.05,t,.8));
 /* engine voices on the nearest real traffic cars */
 let nearC=[];try{for(const q of TRAF){if(!q.m.visible||!q.e)continue;const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<46)nearC.push([d,q])}}catch(e){}
 nearC.sort((a,b)=>a[0]-b[0]);A.nc=nearC.length;
 const top=nearC.slice(0,3),used=new Set();
 A.cars.forEach(v=>{const k=top.find(x=>x[1]===v.car);if(k)used.add(k[1]);else if(v.car){v.car=null;v.vg.gain.setTargetAtTime(0,t,.12)}});
 top.forEach(x=>{if(used.has(x[1]))return;const v=A.cars.find(q=>!q.car);if(!v)return;v.car=x[1];v.vg.gain.cancelScheduledValues(t);v.vg.gain.setValueAtTime(0,t);v.f=0;used.add(x[1])});
 A.cars.forEach(v=>{const q=v.car;if(!q)return;const dx=q.x-P.x,dz=q.z-P.z,d=Math.max(.5,Math.hypot(dx,dz)),sp=q.s||0,vx=sp*q.e.ux,vz=sp*q.e.uz,app=-(vx*dx+vz*dz)/d;
  const base=48+sp*7,dop=1+clamp(app*5/343,-.2,.2)*(d/(d+3)),f=base*dop,gain=(0.03+0.12*clamp(sp/10,0,1))*clamp(L.car*1.15+.35,.35,1.1)/(1+Math.pow(d/8,1.7));
  v.o.frequency.setTargetAtTime(f,t,.1);v.o2.frequency.setTargetAtTime(f*.5,t,.1);v.lp.frequency.setTargetAtTime(280+sp*35,t,.2);v.bp.frequency.setTargetAtTime(500+sp*70,t,.2);v.ng.gain.setTargetAtTime(clamp(sp/9,0,1)*1.2,t,.2);
  v.vg.gain.setTargetAtTime(gain,t,.1);v.pn.pan.setTargetAtTime(panOf(q.x,q.z),t,.08)});
 /* one-shots: random events whose rate follows the zone's mix */
 const ev=(k,rate)=>{if(Math.random()<rate*dt)return true;return false};
 if(ev('b',.7*L.bird))birds(.05*rnd(.5,1)*(.5+.5*L.bird),rnd(-.9,.9));
 if(ev('s',3.2*L.step*(.25+.75*pk)))step(.1*rnd(.4,1),rnd(-.8,.8));
 if(ev('c',.45*L.chat*(.4+.6*pk)))voice(.06*rnd(.5,1),rnd(-.9,.9),0,L.chat<.6);
 if(ev('k',.5*L.kids))voice(.06*rnd(.6,1),rnd(-.9,.9),1,true);
 if(L.horn>.02){const q=nearC.find(x=>x[0]<38);
  if(q){if(ev('h',.1*L.horn))horn(.05*(1-q[0]/46),panOf(q[1].x,q[1].z))}
  else if(ev('h',.03*L.horn))horn(.012,rnd(-.9,.9))}
 /* distant cars when the traffic around is thin but the zone is a road: a faint whoosh */
 if(!nearC.length&&L.car>.2&&ev('w',.12*L.car)){const p=mkPan(rnd(-.8,.8)),s=A.c.createBufferSource(),f=A.c.createBiquadFilter(),g=A.c.createGain(),tt=A.c.currentTime+.02,d=rnd(2,3.5);s.buffer=A.nb;f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(300,tt);f.frequency.linearRampToValueAtTime(900,tt+d/2);f.frequency.linearRampToValueAtTime(350,tt+d);
  g.gain.setValueAtTime(.0001,tt);g.gain.linearRampToValueAtTime(.05*L.car,tt+d/2);g.gain.linearRampToValueAtTime(.0001,tt+d);s.connect(f);f.connect(g);g.connect(p);s.start(tt,rnd(0,2));s.stop(tt+d+.05);done(s,p)}
}

/* ---------------- passing cars with music ---------------- */
function loadManifest(){if(man||manBusy)return;manBusy=1;try{fetch('audio/cars/manifest.json',{cache:'no-cache'}).then(r=>r&&r.ok?r.json():[]).then(j=>{man=(Array.isArray(j)?j:[]).map(x=>typeof x=='string'?x:x&&(x.file||x.src||x.name||x.url)).filter(x=>typeof x=='string'&&/\.(ogg|mp3|m4a|wav|opus)$/i.test(x));manBusy=0}).catch(()=>{man=[];manBusy=0})}catch(e){man=[];manBusy=0}}
function loadClip(f,cb){if(clipBuf[f]){cb(clipBuf[f]);return}if(clipBuf[f+'?'])return;clipBuf[f+'?']=1;try{fetch('audio/cars/'+encodeURIComponent(f).replace(/%2F/g,'/')).then(r=>r.ok?r.arrayBuffer():null).then(b=>b&&AC?AC.decodeAudioData(b):null).then(d=>{if(d)clipBuf[f]=d}).catch(()=>{})}catch(e){}}
function eligible(){try{return MU.on&&userOn()&&(mode=='play'||mode=='drive')&&!PAUSED&&!document.hidden&&!(FEST&&(FEST.view||FEST.set))&&!Beats.playing()&&!(typeof VOL=='number'&&VOL<=0)}catch(e){return false}}
function takeBg(){try{const a=MU.a[MU.cur];if(MU.pl&&a){MC.pl=1;MU.pl=0;a.play().catch(()=>{})}}catch(e){}}
function giveBg(m){try{if(m&&m.pl){m.pl=0;const a=MU.a[MU.cur];if(a&&!a.ended&&!a.paused)MU.pl=1}}catch(e){}}
function startSong(c){const songs=S.songs||[];if(!songs.length)return false;const sg=songs[Math.random()*songs.length|0];
 Beats.setVolume(.0001);const info=Beats.play(sg,{owner:'car',form:'song',intensity:.9,fadeIn:.4,alive:()=>!!MC&&MC.kind=='song'&&MC.ph!='end'});if(!info){Beats.setVolume(1);return false}
 MC={kind:'song',car:c,t0:performance.now()/1000,ph:'on',vol:0,pan:0,fc:900,title:sg.title||sg.name||'',style:info.style,env:1,lt:0};takeBg();return true}
function startClip(c,f){const b=clipBuf[f];if(!b||!AC)return false;try{const a=AC,s=a.createBufferSource(),lp=a.createBiquadFilter(),sh=a.createBiquadFilter(),pn=a.createStereoPanner(),g=a.createGain();s.buffer=b;lp.type='lowpass';lp.frequency.value=900;sh.type='lowshelf';sh.frequency.value=150;sh.gain.value=8;g.gain.value=0;
 s.connect(lp);lp.connect(sh);sh.connect(pn);pn.connect(g);g.connect(a.destination);s.start(0,rnd(0,Math.max(0,b.duration-5)));
 MC={kind:'clip',car:c,t0:performance.now()/1000,ph:'on',vol:0,pan:0,fc:900,title:f,style:'clip',env:1,lt:0,n:{s,lp,sh,pn,g}};return true}catch(e){return false}}
function draw(c){
 loadManifest();const p=clamp((+S.listeners||0)/1e6,0,1);
 if(p>0&&S.songs&&S.songs.length&&Math.random()<p&&startSong(c))return;
 if(man&&man.length&&Math.random()<CLIP_P){const f=man[Math.random()*man.length|0];if(clipBuf[f])startClip(c,f);else loadClip(f,()=>{})}}
function endMC(fast){const m=MC;if(!m)return;MC=null;
 if(m.kind=='song'){giveBg(m);try{const cu=Beats.current();if(cu&&cu.owner=='car')Beats.stop(fast?.03:.1)}catch(e){}try{Beats.setVolume(1)}catch(e){}chainFx(20000,0,0,true)}
 else if(m.n){try{const t=m.n.g.context.currentTime;m.n.g.gain.setTargetAtTime(0,t,.02);m.n.s.stop(t+.15);setTimeout(()=>{try{m.n.g.disconnect()}catch(e){}},400)}catch(e){}}
 if(fast)window.MU_DIP=1;cool=COOL}
function mcTick(out){
 const now=performance.now()/1000;
 if(MC){const m=MC,c=m.car,d=Math.hypot(c.x-P.x,c.z-P.z);
  if(m.kind=='song'){const cu=Beats.current();if(!cu||cu.owner!='car'){/* someone else took the engine */MC=null;giveBg(m);try{Beats.setVolume(1)}catch(e){}chainFx(20000,0,0,true);cool=COOL;return}}
  if(!out||!userOn()||PAUSED||document.hidden||(typeof VOL=='number'&&VOL<=0)){endMC(true);return}
  if(m.ph=='on'&&(d>LIM||now-m.t0>MAXAGE)){m.ph='leave';m.lt=now}
  if(m.ph=='leave'){m.env=clamp(1-(now-m.lt)/.9,0,1);if(m.env<=0){endMC(false);return}}
  const q=clamp(1-d/LIM,0,1);m.vol=Math.pow(q,1.8)*.95*m.env;m.pan=panOf(c.x,c.z);m.fc=500+3600*q*q;
  if(m.kind=='song'){try{Beats.setVolume(Math.max(.0001,m.vol))}catch(e){}chainFx(m.fc,9,m.pan);
   /* the soundtrack keeps playing under the car, so we drive its volume (the beat engine pauses it otherwise) */
   if(m.pl){const a=MU.a[MU.cur];if(a&&a.ended){m.pl=0}else if(a&&!a.paused){const T=TR[MU.cur],t=a.currentTime,du=a.duration||0;let v=1;if(T.fin&&t<T.fin)v=Math.min(v,t/T.fin);if(T.fout&&du&&t>du-T.fout)v=Math.min(v,(du-t)/T.fout);a.volume=clamp(v,0,1)*VOL*window.MU_DIP}}}
  else{const n=m.n,t=n.g.context.currentTime;n.g.gain.setTargetAtTime(m.vol*(VOL||0)*.8,t,.06);n.lp.frequency.setTargetAtTime(m.fc,t,.08);n.pn.pan.setTargetAtTime(m.pan,t,.08)}
 }
 /* soundtrack dip: 30% while a car with music is audible, back up over about 1.5 s */
 const tgt=MC&&MC.ph=='on'&&MC.vol>.03?.7:(MC&&MC.ph=='leave'&&MC.vol>.03?.7:1),cur=window.MU_DIP;
 window.MU_DIP=tgt<cur?Math.max(tgt,cur-.3/.5*.05):Math.min(tgt,cur+.3/1.5*.05);
 if(MC||!out||cool>0){cool=Math.max(0,cool-.05);}
 if(MC||!out||cool>0||!eligible())return;
 /* each traffic car that comes past is one draw */
 try{for(const c of TRAF){if(!c.e)continue;const d=Math.hypot(c.x-P.x,c.z-P.z);if(d>LIM+3){c._ap=0;continue}if(!c._ap&&d<RANGE_IN&&(c.s||0)>.8){c._ap=1;draw(c);if(MC)return}}}catch(e){}}

function tick(){try{const out=outdoors();mcTick(out);if((tickN++&1)==0)ambTick(out)}catch(e){if(!okErr){okErr=1;console.warn('ambience',e&&e.message)}}}
setInterval(tick,50);
document.addEventListener('visibilitychange',()=>{if(document.hidden){try{endMC(true)}catch(e){}if(A){try{A.mg.gain.cancelScheduledValues(A.c.currentTime);A.mg.gain.setValueAtTime(0,A.c.currentTime);attach(false)}catch(e){}}}});

return{
 state(){const Z=zoneAt(P.x,P.z),out=outdoors();let rms=0;if(A&&A.on){try{const b=new Float32Array(512);A.an.getFloatTimeDomainData(b);let s=0;for(let i=0;i<512;i++)s+=b[i]*b[i];rms=Math.sqrt(s/512)}catch(e){}}
  const L={};LK.concat('cricket').forEach(k=>L[k]=+(Z.L[k]||0).toFixed(3));
  return{zone:Z.name,busy:+Z.busy.toFixed(3),zoneBusy:+Z.raw.toFixed(3),night:+Z.night.toFixed(2),outdoors:out,running:!!(A&&A.on),level:A?+A.mg.gain.value.toFixed(3):0,rms:+rms.toFixed(5),layers:L,nearCars:A?A.nc||0:0,
   carVoices:A?A.cars.filter(v=>v.car).length:0,dip:+window.MU_DIP.toFixed(3),manifest:man?man.length:null,
   car:MC?{kind:MC.kind,song:MC.title,style:MC.style,phase:MC.ph,dist:+Math.hypot(MC.car.x-P.x,MC.car.z-P.z).toFixed(1),vol:+MC.vol.toFixed(3),pan:+MC.pan.toFixed(2),lowpass:Math.round(MC.fc)}:null}},
 zoneAt:(x,z)=>{const Z=zoneAt(x,z);return{zone:Z.name,busy:+Z.busy.toFixed(3),layers:Z.L}},
 stopCar:()=>endMC(true)}
})();
/* the pause menu takes the soundtrack over: hand it back first so it is paused properly */
if(typeof pauseGame=='function'){const pg0=pauseGame;pauseGame=function(){try{Ambience.stopCar()}catch(e){}return pg0.apply(this,arguments)}}
