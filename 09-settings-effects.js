/* ---------- settings & effects ---------- */
const sv=()=>{try{localStorage.setItem('fw_set',JSON.stringify({VOL,FX}))}catch(e){}};
const cr=()=>mode=='creator'||(mode=='menu'&&SP=='creator');
let MG,RV,NB;
function ac(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();const m=AC.createDynamicsCompressor();m.connect(AC.destination);MG=AC.createGain();MG.connect(m);const rv=AC.createConvolver(),L=AC.sampleRate*1.6|0,b=AC.createBuffer(2,L,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,3)}rv.buffer=b;RV=AC.createGain();RV.gain.value=.3;RV.connect(rv);rv.connect(m);NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}if(AC.state=='suspended')AC.resume();MG.gain.value=FX;return AC}
function sfx(f,d=.1,ty='square',v=.15,f2,del=0,rev=.3){if(!FX)return;try{ac();const t=AC.currentTime+del,g=AC.createGain(),fl=AC.createBiquadFilter(),r=AC.createGain(),pk=v*({square:.65,sawtooth:.6,triangle:.9}[ty]||1),at=Math.min(.012,d*.2);fl.type='lowpass';fl.Q.value=.7;fl.frequency.setValueAtTime(Math.min(6500,f*5+700),t);fl.frequency.exponentialRampToValueAtTime(Math.max(300,Math.min(3800,f*2+350)),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk,t+at);g.gain.setTargetAtTime(.0001,t+at,d/4.5);const L=[[ty,0,1]];if(ty=='sine')L.push(['sine',0,.0],['sine',1200,.12]);else L.push([ty,9,.55]);L.forEach(([T,dt,m])=>{if(!m)return;const o=AC.createOscillator(),og=AC.createGain();o.type=T;o.detune.value=dt==1200?1200:dt;o.detune.value+=R(-12,12);o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);og.gain.value=m;o.connect(og);og.connect(fl);o.start(t);o.stop(t+d+.08)});fl.connect(g);g.connect(MG);r.gain.value=rev;g.connect(r);r.connect(RV)}catch(e){}}
function nz(d,fc,v,q=1,ty='lowpass',del=0,f2){if(!FX)return;try{ac();const t=AC.currentTime+del,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;s.loop=true;f.type=ty;f.Q.value=q;f.frequency.setValueAtTime(fc,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.004,d*.2));g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(MG);s.start(t,Math.random()*.8);s.stop(t+d+.05)}catch(e){}}
/* v48.6.0: effects are layered from a noise transient, a short body made of a few (often inharmonic) partials and a little room,
   with small random changes in pitch, timing, level and stereo position each time, so a sound heard twice is never quite the same */
const sdJ=p=>1+R(-p,p);
function sdOut(t,pan,rev,pan2,d){const g=AC.createGain();let n=g;if(pan!=null&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.setValueAtTime(Math.max(-1,Math.min(1,pan)),t);if(pan2!=null)p.pan.linearRampToValueAtTime(Math.max(-1,Math.min(1,pan2)),t+d);g.connect(p);n=p}
 n.connect(MG);if(rev){const r=AC.createGain();r.gain.value=rev;n.connect(r);r.connect(RV)}return g}
/* a struck body: f pitch, d decay (s), v level, p partials [ratio, level, decay scale]; o: del, pan, rev, jit (pitch spread), bend (start this much sharp), lp */
function sdHit(f,d,v,p,o){if(!FX)return;o=o||{};try{ac();const t=AC.currentTime+(o.del||0),j=sdJ(o.jit==null?.02:o.jit),out=sdOut(t,o.pan,o.rev),vv=v*sdJ(.12);let dst=out;
 if(o.lp){const l=AC.createBiquadFilter();l.type='lowpass';l.frequency.value=o.lp;l.Q.value=.5;l.connect(out);dst=l}
 p.forEach(([r,m,k])=>{const fr=f*j*r;if(fr>AC.sampleRate*.45)return;const s=AC.createOscillator(),g=AC.createGain(),e=t+.002+d*(k||1);s.type='sine';s.frequency.setValueAtTime(fr*(1+(o.bend||0)),t);if(o.bend)s.frequency.exponentialRampToValueAtTime(fr,t+Math.min(.05,d*.5));
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vv*m,t+.002);g.gain.exponentialRampToValueAtTime(.0001,e);s.connect(g);g.connect(dst);s.start(t);s.stop(e+.02)})}catch(e){}}
/* filtered noise: d length, fc centre, v level; o: ty, q, f2 (sweep to), sw (rise for this share of d, for swells), del, pan, pan2, rev */
function sdNz(d,fc,v,o){if(!FX)return;o=o||{};try{ac();const t=AC.currentTime+(o.del||0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),out=sdOut(t,o.pan,o.rev,o.pan2,d),vv=v*sdJ(.12);
 s.buffer=NB;s.loop=true;f.type=o.ty||'bandpass';f.Q.value=o.q||1;f.frequency.setValueAtTime(fc*sdJ(.06),t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);
 g.gain.setValueAtTime(0,t);if(o.sw){g.gain.linearRampToValueAtTime(vv,t+d*o.sw);g.gain.linearRampToValueAtTime(0,t+d)}else{g.gain.linearRampToValueAtTime(vv,t+.0015);g.gain.exponentialRampToValueAtTime(.0001,t+d)}
 s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*.9);s.stop(t+d+.03)}catch(e){}}
/* instrument voices for the music minigames */
const TINE=[[1,1,1],[2,.16,.45],[5.4,.05,.18]],WOOD=[[1,1,1],[2.6,.3,.5]];
function mgPad(f,v){sdHit(f,.5,v||.15,TINE,{jit:.003,bend:.01,rev:.18,pan:R(-.15,.15)});sdNz(.012,f*4,.05,{q:1.5})}
function mgKey(f){sdHit(f,.6,.12,[[1,1,1],[2,.3,.4],[3,.08,.25],[4,.04,.15]],{jit:.003,rev:.15,pan:(f-380)/600})}
function mgPluck(f){if(!FX)return;try{ac();const t=AC.currentTime,l=AC.createBiquadFilter(),g=AC.createGain(),out=sdOut(t,R(-.2,.2),.08);l.type='lowpass';l.Q.value=2;l.frequency.setValueAtTime(3200,t);l.frequency.exponentialRampToValueAtTime(420,t+.25);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.5);[-6,6].forEach(c=>{const s=AC.createOscillator();s.type='sawtooth';s.frequency.value=f;s.detune.value=c+R(-3,3);s.connect(l);s.start(t);s.stop(t+.52)});l.connect(g);g.connect(out)}catch(e){}sdNz(.01,2400,.04,{q:1})}
function mgBass(f){sdHit(f,.28,.2,[[1,1,1],[2,.35,.5],[3,.12,.3]],{jit:.003,bend:.06,lp:700})}
function mgDrum(k){if(k==0){sdHit(55,.24,.22,[[1,1,1]],{bend:1.6,jit:.03});sdNz(.008,3000,.05,{q:.8})}
 else if(k==1){sdNz(.16,1900,.17,{q:.6,rev:.12});sdHit(190,.07,.12,[[1,1,1],[1.6,.4,.6]],{bend:.3})}
 else if(k==2)sdNz(.06,8200,.2,{ty:'highpass',q:.7,pan:.2});else sdNz(.7,6500,.12,{ty:'highpass',q:.5,pan:-.2,rev:.2})}
function mgTick(acc){sdHit(acc?1450:1080,.05,.12,WOOD,{jit:.01})}
/* the everyday palette: soft wooden taps for UI, a glassy tone for notices, a strummed chord for wins, coins for money, a muted double knock for "no" */
const SND={step:()=>stepSnd(0),
click:()=>{sdNz(.012,3400,.15,{q:1.3,pan:R(-.1,.1)});sdHit(1750,.03,.07,WOOD,{jit:.05})},
pop:()=>{sdHit(640,.11,.32,[[1,1,1],[3.93,.22,.35],[9.2,.05,.15]],{bend:.05,jit:.05,rev:.05,pan:R(-.08,.08)});sdNz(.008,2600,.12,{q:.9})},
ping:()=>{const f=1180*sdJ(.015);sdHit(f,.42,.09,[[1,1,1],[2.76,.16,.4],[5.4,.04,.2]],{jit:0,rev:.22});sdHit(f*1.5,.3,.032,[[1,1,1]],{del:.04+R(0,.015),jit:0,rev:.28});sdNz(.008,5200,.025,{ty:'highpass'})},
chime:()=>{const V=pick([[1,1.5,2.25],[1,1.335,2],[1,1.5,1.888,3]]),f=392*sdJ(.02);V.forEach((r,i)=>sdHit(f*r,.9-i*.1,.09,TINE,{del:i*(.022+R(0,.012)),jit:.002,rev:.3,pan:(i-1)*.18}));sdHit(f/2,1,.06,[[1,1,1],[2,.1,.4]],{jit:0,rev:.2});sdNz(.5,2400,.025,{q:.6,sw:.3,rev:.3})},
cash:()=>{const c=(d,f,v)=>sdHit(f,.18,v,[[1,1,1],[1.47,.55,.8],[2.09,.35,.6],[2.76,.2,.5]],{del:d,rev:.12,pan:R(-.2,.2),jit:.04,lp:7000});c(0,2300,.17);c(.05+R(0,.025),2750,.12);if(Math.random()<.6)c(.11+R(0,.03),2500,.06);sdNz(.04,4200,.1,{q:.8});sdHit(160,.06,.18,[[1,1,1]],{bend:.2})},
whoosh:()=>{const up=Math.random()<.5,a=up?450:1900,b=up?2100:420,d=.5+R(0,.12),pn=R(.15,.35)*(Math.random()<.5?-1:1);sdNz(d,a,.19,{q:1.1,f2:b,sw:.45,pan:pn,pan2:-pn,rev:.15});sdNz(d*.9,a*2.3,.05,{q:.8,f2:b*2.3,sw:.5,del:.03,pan:-pn,pan2:pn});sdNz(d,150,.08,{ty:'lowpass',sw:.4})},
err:()=>{const f=230*sdJ(.03);sdHit(f,.08,.12,[[1,1,1],[2.3,.2,.4]],{bend:.04,jit:0,lp:1400});sdHit(f*.84,.11,.105,[[1,1,1],[2.3,.15,.4]],{del:.08+R(0,.015),jit:0,lp:1100});sdNz(.03,520,.065,{ty:'lowpass'})},
thunk:()=>{sdHit(100,.17,.44,[[1,1,1],[1.6,.3,.5]],{bend:.5,jit:.05,lp:600});sdNz(.07,440,.26,{ty:'lowpass'});sdHit(420,.04,.08,WOOD,{del:.004,jit:.06})},
eat:()=>{let d=0;for(let i=0,n=3+(Math.random()*2|0);i<n;i++){sdNz(.03+R(0,.03),1400+R(0,1600),.2+R(0,.12),{q:2+R(0,2),del:d,pan:R(-.1,.1)});sdNz(.012,4500,.06,{ty:'highpass',del:d});d+=.07+R(0,.07)}},
rec:()=>{sdNz(.012,1800,.16,{q:1.5});sdHit(300,.08,.2,WOOD,{bend:.1});sdHit(880,.5,.08,[[1,1,1],[2,.12,.5]],{del:.09,jit:0,rev:.3})}};
/* the button click is skipped when a button already made its own sound (the click listener runs after the button's onclick); the same sound twice in 30 ms plays once */
let SDT=0;const SDL={};
const snd=n=>{const f=SND[n],t=performance.now();if(!f||t-(SDL[n]||0)<30||(n=='click'&&t-SDT<40))return;SDL[n]=t;if(n!='click')SDT=t;f()},chime=()=>snd('chime');
setInterval(()=>{if(!MU.on||!FX||mode=='load'||PAUSED)return;if(S.t>=300){const f=4300+R(0,400),pn=R(-.6,.6),n=2+(Math.random()*3|0);for(let i=0;i<n;i++)sdHit(f,.035,.02,[[1,1,1]],{del:i*.065,jit:.005,pan:pn,rev:.1})}else if(Math.random()<.3)nz(1.4,900+R(0,500),.04,1,'lowpass',0,300)},1400);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button'))snd('click')});
/* v26.97: Settings has tabs (Sound, Music, Game, Save) and more options; everything except the volumes lives in OPT (08-music.js) */
let STAB='sound';const TRN=['Track 1','Track 2','Track 3','Box','Catch','Rocket'];
const stTog=(l,on,f,n)=>`<div class=so><span>${l}${n?`<small class=m>${n}</small>`:''}</span><button class="${on?'go':''}" onclick="${f};stDraw()">${on?'On':'Off'}</button></div>`;
const stSl=(l,v,f,c='')=>`<div class=so><span>${l}</span><input type=range min=0 max=100 value=${Math.round(v*100)} oninput="${f}" ${c} style="padding:0"></div>`;
function stOpt(k,v){OPT[k]=v==null?OPT[k]?0:1:v;svOpt();if(k=='menuMus'||k=='pauseMus')menuSync();if(k=='tags')document.body.classList.toggle('notags',!OPT.tags)}
function stTrack(i){OPT.tracks[i]=OPT.tracks[i]?0:1;svOpt();if(!OPT.tracks[i]&&MU.cur==i&&MU.pl)musSkip()}
/* fade the soundtrack track out over a moment and let the next one (if any is on) start */
function musSkip(){const a=MU.a[MU.cur];if(!MU.pl||!a||MU.hold)return;MU.pl=0;MU.gap=.6;let v=a.volume;const f=setInterval(()=>{v-=.08;if(v<=0||a.paused){clearInterval(f);a.pause();return}a.volume=Math.max(0,v)},40)}
function stReset(){OPT=JSON.parse(JSON.stringify(OPT_DEF));svOpt();VOL=.5;FX=.6;LAST=.5;sv();menuSync();document.body.classList.remove('notags');say('Settings reset')}
/* v26.99.0: Preview plays 5 seconds from the middle of a soundtrack track; the soundtrack or menu music pauses meanwhile and comes back after */
let PRV=null;
function stPrevStop(){const q=PRV;if(!q)return;PRV=null;clearInterval(q.iv);try{q.a.pause()}catch(e){}
 if(q.bg){MU.hold=q.hold;if(!MU.hold)q.bg.play().catch(()=>{})}if(q.menu&&PAUSED&&menuOK())MENUA.play().catch(()=>{});stDraw()}
function stPrev(i){const was=PRV&&PRV.i==i;stPrevStop();if(was)return;if(!VOL){say('Music volume is at 0');return}
 const a=new Audio(TR[i].src),q={i,a,t:0,hold:MU.hold};const bg=MU.a[MU.cur];if(MU.pl&&bg&&!bg.paused){q.bg=bg;bg.pause();MU.hold=1}if(MENUA&&!MENUA.paused){q.menu=1;MENUA.pause()}
 PRV=q;a.volume=0;a.preload='auto';a.addEventListener('loadedmetadata',()=>{if(PRV!==q)return;try{a.currentTime=(a.duration||0)/2}catch(e){}a.play().then(()=>{q.on=1}).catch(()=>stPrevStop())},{once:true});
 /* fade in over 0.4 s, out over the last 0.6 s of the 5 */
 q.iv=setInterval(()=>{if(!q.on)return;q.t+=.05;const v=Math.min(1,q.t/.4,Math.max(0,(5-q.t)/.6));a.volume=Math.max(0,Math.min(1,v*VOL));if(q.t>=5)stPrevStop()},50);stDraw()}
function stBody(){const T=STAB;
 if(T=='sound')return stSl('Music',VOL,"VOL=this.value/100;if(VOL)LAST=VOL;sv()")+stSl('Effects',FX,"FX=this.value/100;sv()","onchange=\"snd('ping')\"")+stSl('Ambience',OPT.amb,"OPT.amb=this.value/100;svOpt()")
  +`<p class=m><small>Music is the soundtrack and menu music. Effects covers clicks and chimes. Ambience is the city outside: traffic, birds and people. Press M to mute music.</small></p>`
  +stTog('Footsteps',OPT.steps,"stOpt('steps')")+stTog('Car radios',OPT.cars,"stOpt('cars')",'Cars passing by play music');
 if(T=='music'){const a=MU.a[MU.cur],now=MU.pl&&a&&!a.paused&&!MU.hold?TRN[MU.cur]:'Nothing';
  return stTog('Main menu music',OPT.menuMus,"stOpt('menuMus')")+stTog('Pause menu music',OPT.pauseMus,"stOpt('pauseMus')")
  +`<h3 style="margin-top:12px">Soundtrack</h3><p class=m><small>Turn off any track you do not want to hear while you play. With every track off the game is quiet between your own songs.</small></p>`
  +TRN.map((n,i)=>`<div class=so><span>${n}</span><button onclick="stPrev(${i})">${PRV&&PRV.i==i?'Stop':'Preview'}</button><button class="${OPT.tracks[i]?'go':''}" onclick="stTrack(${i});stDraw()">${OPT.tracks[i]?'On':'Off'}</button></div>`).join('')
  +`<div class=so><span>Order</span><button onclick="stOpt('order',OPT.order=='order'?'shuffle':'order');stDraw()">${OPT.order=='order'?'In order':'Shuffle'}</button></div>`
  +`<div class=so><span>Now playing<small class=m>${now}</small></span><button onclick="musSkip();setTimeout(stDraw,700)" ${now=='Nothing'?'disabled':''}>Skip</button></div>`}
 if(T=='game')return stTog('Name tags',OPT.tags,"stOpt('tags')",'Names above people')+`<p class=m><small>Esc pauses and closes menus. Version ${GAME_VERSION} · <a href="versions.html" target="_blank" style="color:var(--g)">Version history</a></small></p><div class=row2><button onclick="stReset();stDraw()">Reset settings</button></div>`;
 return `<p class=m><small>The game autosaves on this device. A save code is a backup you can paste into any browser.</small></p><textarea id=sc rows=3 placeholder="Paste a save code here to load"></textarea><div class=row2><button onclick="$('sc').value=saveCode();$('sc').select();try{navigator.clipboard.writeText($('sc').value);say('Code copied')}catch(e){}">Get save code</button><button class=go onclick="loadCode($('sc').value)">Load</button></div><div class=row2 style="margin-top:10px"><button onclick="wipeSave()" style="color:#ff8a8a">Wipe save</button></div>`}
function stDraw(){const b=$('stb'),t=$('stt');if(!b)return;const y=b.scrollTop;b.innerHTML=stBody();b.scrollTop=y;t.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.t==STAB))}
function settings(){if(mode!='play'&&mode!='creator'&&mode!='pause')return;SP=mode;mode='menu';$('ui').innerHTML=`<div id=stg class="box modal" style="width:min(440px,92vw)"><h2>Settings</h2><div id=stt>${[['sound','Sound'],['music','Music'],['game','Game'],['save','Save']].map(([k,l])=>`<button data-t=${k} onclick="STAB='${k}';stDraw()">${l}</button>`).join('')}</div><div id=stb></div><div class=row2><button class=go onclick="closeSet()">Back</button></div></div>`;stDraw()}
try{document.body.classList.toggle('notags',!OPT.tags)}catch(e){}
function closeSet(){stPrevStop();mode=SP;SP='';if(mode=='creator')creatorUI();else if(mode=='pause')pauseUI();else $('ui').innerHTML=''}
