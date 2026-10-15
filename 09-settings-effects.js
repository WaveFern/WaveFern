/* ---------- settings & effects ---------- */
const sv=()=>{try{localStorage.setItem('fw_set',JSON.stringify({VOL,FX}))}catch(e){}};
const cr=()=>mode=='creator'||(mode=='menu'&&SP=='creator');
let MG,RV,NB;
function ac(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();const m=AC.createDynamicsCompressor();m.connect(AC.destination);MG=AC.createGain();MG.connect(m);const rv=AC.createConvolver(),L=AC.sampleRate*1.6|0,b=AC.createBuffer(2,L,AC.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,3)}rv.buffer=b;RV=AC.createGain();RV.gain.value=.3;RV.connect(rv);rv.connect(m);NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}if(AC.state=='suspended')AC.resume();MG.gain.value=FX;return AC}
function sfx(f,d=.1,ty='square',v=.15,f2,del=0,rev=.3){if(!FX)return;try{ac();const t=AC.currentTime+del,g=AC.createGain(),fl=AC.createBiquadFilter(),r=AC.createGain(),pk=v*({square:.65,sawtooth:.6,triangle:.9}[ty]||1),at=Math.min(.012,d*.2);fl.type='lowpass';fl.Q.value=.7;fl.frequency.setValueAtTime(Math.min(9000,f*7+900),t);fl.frequency.exponentialRampToValueAtTime(Math.max(300,Math.min(5000,f*2.5+400)),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk,t+at);g.gain.setTargetAtTime(.0001,t+at,d/4.5);const L=[[ty,0,1]];if(ty=='sine')L.push(['sine',0,.0],['sine',1200,.12]);else L.push([ty,9,.55]);L.forEach(([T,dt,m])=>{if(!m)return;const o=AC.createOscillator(),og=AC.createGain();o.type=T;o.detune.value=dt==1200?1200:dt;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);og.gain.value=m;o.connect(og);og.connect(fl);o.start(t);o.stop(t+d+.08)});fl.connect(g);g.connect(MG);r.gain.value=rev;g.connect(r);r.connect(RV)}catch(e){}}
function nz(d,fc,v,q=1,ty='lowpass',del=0,f2){if(!FX)return;try{ac();const t=AC.currentTime+del,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;s.loop=true;f.type=ty;f.Q.value=q;f.frequency.setValueAtTime(fc,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.004,d*.2));g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(MG);s.start(t,Math.random()*.8);s.stop(t+d+.05)}catch(e){}}
const SND={step:()=>{if(!OPT.steps)return;nz(.07,300+R(0,200),.5,1);sfx(70+R(0,20),.08,'sine',.25,45,0,0)},
click:()=>{sfx(1800+R(0,80),.05,'triangle',.07,1100,0,.05);sfx(420,.03,'sine',.06,0,0,0);nz(.015,6000,.04,1,'highpass')},
ping:()=>{sfx(880,.25,'sine',.12,0,0,.45);sfx(1320,.3,'sine',.08,0,.07,.45);sfx(1760,.2,'sine',.03,0,.07,.5)},
chime:()=>{[523,659,784,1047].forEach((f,i)=>{sfx(f,.7,'triangle',.12,0,i*.09,.55);sfx(f*2,.5,'sine',.04,0,i*.09,.6)});sfx(262,.9,'sine',.07,0,0,.5)},
cash:()=>{nz(.04,7000,.08,1,'highpass');sfx(1568,.35,'sine',.12,0,0.01,.4);sfx(3136,.2,'sine',.03,0,0.01,.4);sfx(2093,.6,'sine',.1,0,.09,.55);sfx(4186,.3,'sine',.025,0,.09,.5)},
whoosh:()=>{nz(1,300,.3,2,'bandpass',0,3000);nz(.8,1500,.06,1,'highpass',.1,6000);sfx(330,.9,'triangle',.1,110,0,.5)},
err:()=>{sfx(180,.2,'sawtooth',.11,120,0,.12);sfx(170,.22,'square',.07,105,.09,.12)},
thunk:()=>{sfx(120,.18,'sine',.4,45,0,.1);nz(.07,450,.3);nz(.02,2500,.08,1,'highpass')},
eat:()=>[0,.1,.2].forEach(d=>nz(.05,2200+R(0,600),.25,2,'bandpass',d)),
rec:()=>{sfx(880,.15,'sine',.15,0,0,.4);sfx(1175,.3,'sine',.15,0,.14,.5);sfx(1760,.2,'sine',.04,0,.14,.5)},
pop:()=>{sfx(500,.12,'sine',.2,1100,0,.25);nz(.015,4000,.04,1,'highpass')}};
const snd=n=>SND[n]&&SND[n](),chime=()=>snd('chime');
setInterval(()=>{if(!MU.on||!FX||mode=='load'||PAUSED)return;if(S.t>=300)[0,.13,.26].forEach(d=>sfx(4200+R(0,300),.05,'sine',.03,0,d,.1));else if(Math.random()<.3)nz(1.4,900+R(0,500),.04,1,'lowpass',0,300)},1400);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button'))snd('click')});
/* v26.97: Settings has tabs (Sound, Music, Game, Save) and more options; everything except the volumes lives in OPT (08-music.js) */
let STAB='sound';const TRN=['Track 1','Track 2','Track 3','Box','Catch'];
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
