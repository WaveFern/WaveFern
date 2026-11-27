/* WaveFern dev: SANTA'S LODGE SOUND. Only runs on /dev/ (window.FW_DEV), loads right before dev-lodge-v1.js. Add ?nolodge to skip it.

   The burp cutscene and Santa's present used to be all oscillators and they sounded like a synth. Now:
   RECORDED  Kenney CC0 foley (audio/sfx/lodge-*.mp3, see audio/sfx/LICENSE.txt): the present's thuds and bounces, the boom when it
             shoots out, the cookie crunch, the heartbeat (a floor thump pitched down) and a coin shimmer like sleigh bells;
             recorded instrument notes already in the repo (audio/inst/glock, celesta, choir; docs/MUSIC-CREDITS.md) for the chimes,
             the reveal run and the choir swell while Santa holds his breath.
   VOICE     Santa's voice, his laugh, the gulp and the BURP are built like a real throat, sample by sample: an irregular train of
             pulses (pitch and loudness wobble on every pulse, the burp breaks into a creaky rattle at the end) through three mouth
             resonances (formants) that move as the mouth shapes the vowel, plus breath noise. Each is rendered once into a buffer.
   Everything plays through the game's master gain MG (so the effects volume applies) and its room reverb RV, and does nothing
   while effects are muted. HOOK window.FW_LSFX = {cue(name,...), preload(), vox(spec)} */
(function(){
if(!window.FW_DEV||/[?&]nolodge/.test(location.search))return;
const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('lodge sfx '+t,e)}}};
const on=()=>{try{return typeof FX!='undefined'&&FX>0&&ac()&&AC.state!='closed'}catch(e){return false}};
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- recorded samples: fetched once, decoded on first use; a cue whose file is not in yet plays its fallback ---------- */
const BUF={};
const VQ=()=>'?v='+(typeof GAME_VERSION=='string'?GAME_VERSION:'');
function load(p){if(BUF[p]!==undefined)return;BUF[p]=null;try{ac();fetch(p+VQ()).then(r=>r.ok?r.arrayBuffer():Promise.reject(r.status)).then(b=>new Promise((ok,no)=>AC.decodeAudioData(b,ok,no))).then(d=>{BUF[p]=d}).catch(e=>{BUF[p]=false})}catch(e){BUF[p]=false}}
const S={thud:'audio/sfx/lodge-impact.mp3',land:'audio/sfx/lodge-land.mp3',hit:'audio/sfx/lodge-hit.mp3',crunch:'audio/sfx/lodge-kill.mp3',boom:'audio/sfx/lodge-big_kill.mp3',coin:'audio/sfx/lodge-coin.mp3',step:'audio/sfx/lodge-step.mp3',
 g72:'audio/inst/glock/72.mp3',g79:'audio/inst/glock/79.mp3',g84:'audio/inst/glock/84.mp3',g91:'audio/inst/glock/91.mp3',g96:'audio/inst/glock/96.mp3',
 c80:'audio/inst/celesta/80.mp3',c90:'audio/inst/celesta/90.mp3',ch48:'audio/inst/choir/48.mp3',ch56:'audio/inst/choir/56.mp3',ch60:'audio/inst/choir/60.mp3',ch64:'audio/inst/choir/64.mp3',ch68:'audio/inst/choir/68.mp3'};
function preload(){if(!on())return;Object.values(S).forEach(load);VOX.length||safe(buildVox,'vox')}
/* play a buffer: o = {v level, rate, del, lp, hp, pan, rev, att, dur (cut off with a fade), fadeIn} */
function out(t,o){const g=AC.createGain();let n=g;if(o.pan&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,o.pan));g.connect(p);n=p}
 n.connect(MG);if(o.rev&&typeof RV!='undefined'&&RV){const r=AC.createGain();r.gain.value=o.rev;n.connect(r);r.connect(RV)}return g}
function playBuf(b,o){o=o||{};if(!b||!on())return false;try{const t=AC.currentTime+(o.del||0),s=AC.createBufferSource(),g=out(t,o);s.buffer=b;s.playbackRate.value=o.rate||1;
 let d=g;if(o.lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;f.Q.value=.6;f.connect(d);d=f}if(o.hp){const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=o.hp;f.Q.value=.6;f.connect(d);d=f}
 const v=(o.v==null?1:o.v);g.gain.setValueAtTime(o.fadeIn?0:v,t);if(o.fadeIn)g.gain.linearRampToValueAtTime(v,t+o.fadeIn);
 if(o.dur){g.gain.setValueAtTime(v,t+Math.max(o.fadeIn||0,o.dur*.6));g.gain.linearRampToValueAtTime(0,t+o.dur);s.stop(t+o.dur+.05)}
 s.connect(d);s.start(t,o.off||0);return true}catch(e){return false}}
const smp=(k,o)=>{const p=S[k];if(!p)return false;const b=BUF[p];if(!b){load(p);return false}return playBuf(b,o)};

/* ---------- the throat: glottal pulses through moving formants ---------- */
/* spec: d seconds; f0(k) pitch in Hz over k=0..1; amp(k) loudness; F(k) -> [[freq,bandwidth,gain],...] formants; jit pitch wobble per pulse;
   shim loudness wobble per pulse; br breath noise share; creak(k) 0..1 chance a pulse is skipped or doubled (the rattle); seed */
function vox(sp){const sr=AC.sampleRate,N=Math.max(1,Math.floor(sp.d*sr)),b=AC.createBuffer(1,N,sr),y=b.getChannelData(0),x=new Float32Array(N);
 let ph=0,next=0,lastA=1;
 for(let i=0;i<N;i++){const k=i/N;
  if(i>=next){/* a new pulse: its length and strength wobble, and in a creak it may come late or come double */
   let f=sp.f0(k)*(1+(Math.random()*2-1)*(sp.jit||.03));const cr=sp.creak?sp.creak(k):0;
   if(cr&&Math.random()<cr)f*=Math.random()<.5?.5:.7;
   const per=sr/Math.max(18,f);next=i+per;lastA=(sp.amp(k))*(1+(Math.random()*2-1)*(sp.shim||.15));
   /* a glottal pulse: a quick rise and a sharper close, a few samples long */
   const L=Math.min(per*.6,sr*.006)|0;for(let j=0;j<L&&i+j<N;j++){const u=j/L;x[i+j]+=lastA*(u<.7?Math.sin(u/.7*Math.PI/2):Math.cos((u-.7)/.3*Math.PI/2))}}
  /* breath: noise, stronger while the pulses are strong */
  x[i]+=(Math.random()*2-1)*(sp.br||.05)*sp.amp(k)*(sp.brA?sp.brA(k):1)}
 /* three formant resonators in parallel, re-tuned every 64 samples as the mouth moves */
 const fs=sp.F(0).length;for(let q=0;q<fs;q++){let y1=0,y2=0,b1=0,b2=0,g0=0;
  for(let i=0;i<N;i++){if(!(i&63)){const fm=sp.F(i/N)[q],r=Math.exp(-Math.PI*fm[1]/sr);b1=2*r*Math.cos(2*Math.PI*fm[0]/sr);b2=-r*r;g0=(1-r)*fm[2]}
   const v=g0*x[i]+b1*y1+b2*y2;y2=y1;y1=v;y[i]+=v}}
 /* a gentle DC block and a soft clip, then normalise */
 let m=0,p=0,pp=0;for(let i=0;i<N;i++){const v=y[i]-p+.995*pp;p=y[i];pp=v;y[i]=Math.tanh(v*1.4);m=Math.max(m,Math.abs(y[i]))}
 const nf=m?(sp.peak||.9)/m:1,fade=Math.min(N,sr*.012|0);for(let i=0;i<N;i++){y[i]*=nf;if(i<fade)y[i]*=i/fade;if(i>N-fade)y[i]*=(N-i)/fade}
 return b}
const lerp=(a,b,k)=>a+(b-a)*k,sm=k=>k*k*(3-2*k);
/* vowels as formant sets [F, bandwidth, gain] (male voice) */
const VW={o:[[450,90,1],[800,110,.7],[2830,160,.18]],u:[[325,80,1],[700,100,.45],[2530,160,.1]],a:[[700,110,1],[1150,120,.6],[2700,170,.2]],e:[[530,90,1],[1840,140,.45],[2480,170,.25]],i:[[300,70,1],[2200,160,.35],[2900,190,.2]],aw:[[570,100,1],[860,110,.7],[2600,160,.16]],m:[[260,60,1],[1100,200,.08],[2300,200,.04]]};
const mixV=(a,b,k)=>a.map((f,i)=>[lerp(f[0],b[i][0],k),lerp(f[1],b[i][1],k),lerp(f[2],b[i][2],k)]);
const VOX=[];let BURP=null,BURPS=null,HO=null,GULP=null,MMM=null;
function buildVox(){
 /* the BURP: a low, throaty "oarrrp" that starts with a pop, swells, wobbles, breaks into a creaky rattle and trails off */
 const burpSpec=(d,base,seed)=>({d,peak:.95,jit:.09,shim:.35,br:.12,
  f0:k=>base*(k<.08?lerp(1.15,1,k/.08):lerp(1,.62,sm(Math.min(1,(k-.08)/.92))))*(1+.06*Math.sin(k*d*17+seed)),
  amp:k=>(k<.04?k/.04:1)*(k>.55?1-sm((k-.55)/.45)*.85:1)*(1+.18*Math.sin(k*d*23+seed*2)),
  creak:k=>k>.45?.12+.5*sm((k-.45)/.55):.04,
  F:k=>mixV(mixV(VW.aw,VW.o,sm(Math.min(1,k*2))),VW.u,sm(Math.max(0,(k-.5)*2))).map((f,i)=>i==0?[f[0]*.92,f[1]*1.3,f[2]]:f)});
 BURP=vox(burpSpec(1.55,92,1.3));BURPS=vox(burpSpec(.55,118,.4));
 /* "HO": breath (h) into a round, warm o, the pitch falling a little like a real chuckle */
 HO=[0,1,2].map(n=>vox({d:.3,peak:.8,jit:.025,shim:.1,br:.06,f0:k=>(122-n*9)*lerp(1.08,.9,k),amp:k=>k<.18?.15+k/.18*.85:1-sm((k-.18)/.82)*.95,
  brA:k=>k<.18?9:1,F:k=>VW.o}));
 /* talk syllables: short, different vowels and pitches, said fast like a mumble */
 const vs=['a','o','e','u','aw','i','o','a'];for(let n=0;n<8;n++){const v=VW[vs[n]],f=rnd(100,138);VOX.push(vox({d:rnd(.09,.13),peak:.6,jit:.02,shim:.08,br:.03,f0:k=>f*lerp(1.06,.94,k),amp:k=>Math.sin(Math.min(1,k)*Math.PI)**.6,F:k=>mixV(VW.m,v,Math.min(1,k*4))}))}
 /* the gulp: a closed-mouth swallow, a low "glk" */
 GULP=vox({d:.18,peak:.7,jit:.05,shim:.2,br:.02,f0:k=>lerp(150,70,k),amp:k=>Math.sin(k*Math.PI),F:k=>mixV(VW.u,VW.m,k)});
 /* mmm: a happy hum */
 MMM=vox({d:.5,peak:.6,jit:.015,shim:.06,br:.01,f0:k=>130*(1+.1*Math.sin(k*Math.PI))*(1+.012*Math.sin(k*40)),amp:k=>Math.sin(k*Math.PI)**.5,F:k=>VW.m})}
const vb=(b,o)=>{if(!b){safe(buildVox,'vox')}return playBuf(b,o)};

/* ---------- synth helpers kept for things that are noise in real life too (air, whooshes, a stomach's gurgle) ---------- */
function noise(d,o){if(!on())return;o=o||{};try{const t=AC.currentTime+(o.del||0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=out(t,o);s.buffer=NB;s.loop=true;f.type=o.ty||'bandpass';f.Q.value=o.q||1;f.frequency.setValueAtTime(o.f||800,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);
 const v=o.v||.2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*(o.up==null?.5:o.up));g.gain.linearRampToValueAtTime(o.hold?v*.8:0,t+d);if(o.hold)g.gain.linearRampToValueAtTime(0,t+d+.06);
 s.connect(f);f.connect(g);s.start(t,Math.random()*.8);s.stop(t+d+.1)}catch(e){}}
/* a stomach growl: a run of little wet bloops sweeping in the low mids, over a low rumble */
let GURG=null;
function gurgle(d){if(!on())return;if(!GURG){const sr=AC.sampleRate,N=Math.floor(2.4*sr);GURG=AC.createBuffer(1,N,sr);const y=GURG.getChannelData(0);let t=0;
  while(t<N){const L=Math.floor(sr*rnd(.03,.09)),f0=rnd(110,320),f1=f0*rnd(.5,1.6),a=rnd(.3,1);let ph=0;for(let j=0;j<L&&t+j<N;j++){const k=j/L;ph+=2*Math.PI*lerp(f0,f1,k)/sr;y[t+j]+=Math.sin(ph)*Math.sin(k*Math.PI)*a*(.7+.3*Math.sin(ph*2.01))}t+=Math.floor(L*rnd(.4,1.3))}
  let m=0;for(let i=0;i<N;i++)m=Math.max(m,Math.abs(y[i]));for(let i=0;i<N;i++)y[i]=y[i]/m*.8}
 playBuf(GURG,{v:.32,rate:rnd(.8,1.1),lp:700,dur:Math.min(2.3,d),fadeIn:.15,rev:.15,off:Math.random()*.2})}

/* ---------- the cues ---------- */
const C={
 /* Santa's talking mumble, one syllable */
 syl:()=>{if(!VOX.length)safe(buildVox,'vox');const b=VOX[Math.floor(Math.random()*VOX.length)];return playBuf(b,{v:.42,rate:rnd(.96,1.06),lp:3200,rev:.06})},
 /* "ho ho ho" */
 ho:(n)=>{if(!HO)safe(buildVox,'vox');for(let i=0;i<(n||3);i++)playBuf(HO[Math.min(2,i)],{v:.55,del:i*.3,rate:rnd(.98,1.03),rev:.12})},
 ho1:(i)=>{if(!HO)safe(buildVox,'vox');return playBuf(HO[Math.min(2,i||0)],{v:.55,rate:rnd(.98,1.03),rev:.12})},
 mmm:()=>{if(!MMM)safe(buildVox,'vox');playBuf(MMM,{v:.4,rev:.08})},
 gulp:()=>{if(!GULP)safe(buildVox,'vox');playBuf(GULP,{v:.5,lp:1800});smp('land',{v:.25,rate:1.3,lp:500,del:.05})},
 /* a cookie bite: a real crunch, pitched a little each time */
 crunch:()=>{if(!smp('crunch',{v:.5,rate:rnd(1.25,1.5),hp:500}))return false;smp('hit',{v:.15,rate:rnd(1.6,1.9),hp:900,del:.02});return true},
 /* his belly growls */
 rumble:(d,v)=>{gurgle(d||1.2);smp('boom',{v:(v||.3)*.9,rate:.42,lp:260,dur:d||1.2,fadeIn:.25})},
 /* a long breath in through the nose and mouth, rising, and cut off at the top */
 inhale:(d)=>{d=d||1.2;noise(d,{f:600,f2:1300,q:1.6,v:.22,up:.92,hold:1,rev:.1});noise(d,{f:2400,f2:4200,q:.9,v:.08,up:.92,hold:1})},
 /* one heartbeat: lub-dub, a real floor thump pitched far down */
 beat:(v)=>{v=v||1;smp('land',{v:.9*v,rate:.42,lp:180});smp('land',{v:.55*v,rate:.38,lp:150,del:.17});smp('boom',{v:.18*v,rate:.6,lp:120,dur:.3})},
 /* the choir holds a low chord while he holds his breath */
 choir:(d)=>{smp('ch48',{v:.22,fadeIn:.35,dur:d||1,rev:.4});smp('ch56',{v:.14,fadeIn:.4,dur:d||1,rev:.4,rate:Math.pow(2,-1/12)});smp('ch60',{v:.12,fadeIn:.45,dur:d||1,rev:.4})},
 burp:(big)=>{if(!BURP)safe(buildVox,'vox');playBuf(big?BURP:BURPS,{v:big?1:.7,rate:big?1:rnd(.95,1.05),rev:big?.35:.15,lp:big?2600:3000});
  if(big){smp('boom',{v:.55,rate:.7,lp:900});noise(.6,{f:400,f2:120,q:.8,v:.18,up:.05})}},
 /* the present shoots out of his mouth: a whoosh past the lens */
 whoosh:(d)=>{noise(d||.55,{f:500,f2:2600,q:1.1,v:.26,up:.55,rev:.1,pan:-.4});noise(d||.55,{f:5000,f2:1400,q:.6,v:.06,up:.6,pan:.4})},
 /* the present hits the rug: a real thud, softer with every bounce */
 bounce:(n)=>{const k=Math.pow(.55,n||0);smp(n?'land':'thud',{v:.85*k,rate:rnd(.85,1)+(n||0)*.08,lp:2400});if(!n)smp('hit',{v:.25,rate:.7,lp:900})},
 /* it settles and glows: a recorded glockenspiel run and a shimmer of bells */
 present:()=>{['g72','g79','g84','g91'].forEach((k,i)=>smp(k,{v:.32-i*.03,del:i*.085,rev:.35}));smp('coin',{v:.28,rate:1.35,hp:2500,del:.25,rev:.3});smp('c90',{v:.2,del:.4,rev:.4})},
 /* his air goes out: a long squeaky sigh */
 sigh:()=>{noise(1.1,{f:1800,f2:500,q:3,v:.14,up:.15,rev:.15});vb(HO&&HO[2],{v:.25,rate:.8,del:.05})},
 /* the present card */
 sparkle:(n)=>{const g=['g84','g91','g96'];for(let i=0;i<(n||3);i++)smp(g[i%3],{v:.13,del:i*.06,rate:rnd(.99,1.01),rev:.3})},
 tick:(tier,slow)=>{const v=.08+.14*(slow||0);if(!smp('step',{v:v*.6,rate:2.6+Math.random()*.2,hp:1500,dur:.06}))return false;if(tier>=2)smp(['','','g84','g91','g96'][tier],{v:.05+.07*(slow||0),rev:.15,dur:.4});return true},
 hb:(v)=>{C.beat(v||.7);return true},
 charge:(i)=>{smp(['c80','c90','g96'][i]||'c90',{v:.2+i*.05,rev:.3});noise(.25,{f:900+i*500,f2:2400+i*900,q:4,v:.05,up:.9});return true},
 land:(t)=>{const run=[['g72'],['g72','g79'],['g72','g79','g84'],['g72','g79','g84','g91'],['g72','g79','g84','g91','g96']][t]||['g72'];
  run.forEach((k,i)=>smp(k,{v:.3,del:i*.08,rev:.35}));smp('thud',{v:.35,rate:.8,lp:800});if(t>=2)smp('coin',{v:.25,rate:1.3,hp:2500,del:.1,rev:.3});
  if(t>=3)smp('ch60',{v:.2,fadeIn:.1,dur:1.6,rev:.5,del:.1});if(t>=4){smp('ch64',{v:.16,fadeIn:.1,dur:1.6,rev:.5,del:.1});smp('ch68',{v:.12,fadeIn:.1,dur:1.6,rev:.5,del:.1})}return true},
 rarity:(t)=>{smp('boom',{v:.3,rate:1.1,lp:1500});['g79','g84','g91'].forEach((k,i)=>smp(k,{v:.22,del:i*.07,rev:.35}));if(t>=3)smp('ch60',{v:.18,fadeIn:.1,dur:1.2,rev:.5});return true},
 claim:()=>{smp('coin',{v:.4,rate:1.15,rev:.25});['g84','g91','g96'].forEach((k,i)=>smp(k,{v:.22,del:.06+i*.07,rev:.35}));return true}
};
function cue(n,...a){if(!on())return false;const f=C[n];if(!f)return false;return safe(()=>f(...a),'cue '+n)}
window.FW_LSFX={cue,preload,vox,has:k=>!!BUF[S[k]],S,BUF};
})();
