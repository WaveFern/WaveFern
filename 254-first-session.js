/* ===== v55.37.0: first session and come-back loop (loads last, wraps only; `?nofirst` skips it) =====
   Why: most ranked players are on day 1-15. The first listener used to arrive only after the first night's sleep, and the bed
   stayed locked until 06:00 game time (about 5 minutes of nothing after the first release). This file:
   1 Next Goal chip (#fsgoal, bottom left): the one step to do now, in plain words, from the first minute until song #2.
   2 First-night shortcut: after the first release on day 1 the bed works straight away, and the release gives the first
     few listeners at once (the real jump to ~60 listeners still happens on waking, 210-economy-rebalance.js).
   3 Early milestones with a small cash reward and a pop-up (S.fs.m flags, paid once; progress an old save already has is marked silently).
   4 Return summary: closing the game and coming back 15+ min later (or hiding the tab) shows what the career earned meanwhile.
   5 Day-1 funnel: step reached and play seconds, and the last step when the page is left (anLog events fs_step / fs_exit,
     only if the player allowed analytics, plus a local copy in localStorage fw_funnel; console: FW_FUNNEL.get()).
   State S.fs={m:{milestones},st:{step:play seconds},sec:play seconds,last:real ms,x:last step}. Test hook: window.FW_FIRST. */
(function(){
if(/[?&]nofirst/.test(location.search))return;
const safe=(f,d)=>{try{return f()}catch(e){return d}};
const now=()=>window.FW_CLOCK?FW_CLOCK.now():Date.now();
const F=()=>S.fs||(S.fs={m:{},st:{},sec:0,last:0,x:''});
const gearN=()=>Object.values(S.gear||{}).reduce((a,v)=>a+(+v||0),0);
const nSong=()=>(S.songs||[]).length,nDraft=()=>(S.drafts||[]).length;
const inGame=()=>typeof mode!='undefined'&&(mode=='play'||mode=='drive'||mode=='pc'||mode=='rec')&&!(typeof PAUSED!='undefined'&&PAUSED);
const firstNight=()=>S.day<=1&&nSong()>0;
const fm=n=>n>=1e4?+(n/1e3).toFixed(1)+'K':Math.round(n).toLocaleString();
const earn=n=>{S.money=+((+S.money||0)+n).toFixed(0)};

/* ---------- 2: first-night shortcut ---------- */
if(typeof bedTired=='function'){const b0=bedTired;bedTired=function(){return b0.apply(this,arguments)||firstNight()}}
safe(()=>{const q=INT.find(x=>/^(Sleep|Out of energy)/.test(x.l||''));const d=q&&Object.getOwnPropertyDescriptor(q,'l');
 if(d&&d.get)Object.defineProperty(q,'l',{get(){return S.t<300&&firstNight()?'Sleep (your first night, go early)':d.get.call(this)},configurable:true})});
if(typeof sleepQ=='function'){const q0=sleepQ;sleepQ=function(){const r=q0.apply(this,arguments);safe(()=>{if(S.t<300&&firstNight()){const p=document.querySelector('#ui .box p');
 if(p)p.innerHTML=p.innerHTML.replace('You are out of energy, so you can turn in early. ','Your first song is out, so you can turn in early. Your first listeners and money arrive in the morning. ')}});return r}}
/* first release: the first few listeners straight away (the economy's real first-night jump to ~60 still happens on waking) */
if(typeof upl=='function'){const u0=upl;upl=function(){const n0=nSong(),r=u0.apply(this,arguments);safe(()=>{
 if(n0==0&&nSong()==1&&!F().m.lis1&&(+S.listeners||0)<1){const n=3+Math.floor(Math.random()*6);S.listeners=n;S.followers=(S.followers||0)+FOLN(n*3);F().m.lis1=1;
  const t=(S.songs[0]||{}).title||'your song';q('FIRST LISTENERS',n+' people are playing it.',t+' is live. Sleep tonight and tomorrow you wake up to far more.',0)}});return r}}

/* ---------- 3: early milestones: small cash, a card and confetti ---------- */
const MS=[
 ['rec1','FIRST SONG RECORDED','You made music. Now put it out.',20,()=>nDraft()+nSong()>=1],
 ['rel1','FIRST SONG RELEASED','You are on WaveFern now.',30,()=>nSong()>=1],
 ['night1','FIRST NIGHT DONE','Come back tomorrow: a daily streak bonus waits, and it grows every day up to day 7.',25,()=>S.day>=2],
 ['gear1','FIRST UPGRADE','Better gear means better songs and more streams.',15,()=>gearN()>0],
 ['song2','SONG #2','Two songs: you have a catalogue.',25,()=>nSong()>=2],
 ['song3','SONG #3','A habit is forming. Keep releasing.',40,()=>nSong()>=3]];
const CQ=[];let cqT=0;
function q(k,t,s,amt){CQ.push([k,t,s,amt]);if(!cqT)cqT=setTimeout(pump,0)}
function pump(){cqT=0;const c=CQ.shift();if(!c)return;
 safe(()=>{if(c[3])earn(c[3]);glCard(c[0],c[1],(c[2]||'')+(c[3]?' +$'+c[3]:''));glBurst(22);snd('chime');if(c[3])setTimeout(()=>snd('cash'),150)});
 if(CQ.length)cqT=setTimeout(pump,2600)}
function milestones(silent){const m=F().m;MS.forEach(x=>{if(m[x[0]])return;if(x[4]()){m[x[0]]=1;if(!silent)q('MILESTONE',x[1],x[2],x[3])}})}

/* ---------- 1: the Next Goal chip ---------- */
function goal(){const n=nSong(),d=nDraft(),pc=typeof mode!='undefined'&&mode=='pc';
 if(!S.artist)return{i:1,v:"Pick your artist name. Follow the green line to the laptop on your desk, press E, open WaveFern.",t:'Pick your artist name',d:pc?'Click the WaveFern icon, type a name, press Create profile.':'Walk to the laptop on your desk (green line), press E, then open WaveFern.'};
 if(!n&&!d)return{i:2,v:"Record your first song. E at the mic stand in your studio, pick a genre, play the 3 mini-games. Costs 15 energy.",t:'Record your first song',d:'Press E at the mic stand in your studio, pick a genre, then play the 3 mini-games. Costs 15 energy.'};
 if(!n)return{i:3,v:"Release it. Laptop (E), WaveFern, Upload tab, Upload. You get your first listeners at once.",t:'Release your song',d:pc?'WaveFern, Upload tab, then Upload on your song.':'Laptop (E), WaveFern, Upload tab, Upload. You get your first listeners at once.'};
 if(S.day<=1)return{i:4,v:"Go to bed. E at your bed. Overnight your streams pay out and your listeners jump. You can sleep early tonight.",t:'Go to bed',d:'Press E at your bed. Overnight your streams pay out and your listeners jump. You can sleep early tonight.'};
 if(n<2)return{i:5,v:"Record song #2. Songs are your income. Make another at the mic, then release it on the laptop.",t:'Record song #2',d:'Songs are your income. Make another at the mic, then release it on the laptop.',x:gearN()?'':'Tip: headphones from the Gearshop ($96) make better songs.'};
 return null}
let gel=null,gk='';
function chip(){const g=inGame()?goal():null;
 if(!g){if(gel)gel.style.display='none';return}
 if(!gel){const s=document.createElement('style');s.textContent=`#fsgoal{position:fixed;left:10px;bottom:44px;z-index:58;width:min(290px,64vw);box-sizing:border-box;background:#0b0f0dec;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 2px #ffd27a55,4px 4px 0 #0008;padding:7px 10px 8px;color:#e8f3ec;font-size:12px;line-height:1.35;pointer-events:none}
#fsgoal{display:flex;gap:8px}#fsgoal .w{flex:1;min-width:0}#fsgoal .v{flex:none;width:40px;height:40px;image-rendering:pixelated;border:2px solid #000;box-shadow:0 0 0 2px #2fe68a66;background:#2a4a38}#fsgoal .k{font:10px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:.5px}#fsgoal .t{font-size:15px;font-weight:700;color:#fff;margin:2px 0 3px}#fsgoal .d{color:#c9d8cf}#fsgoal .x{color:#2fe68a;margin-top:3px}
#fsgoal .b{height:6px;margin-top:6px;background:#000;border:1px solid #2a352e}#fsgoal .b i{display:block;height:100%;background:#2fe68a;transition:width .5s}
@media (max-width:700px){#fsgoal{bottom:150px;width:min(260px,70vw)}}`;document.head.appendChild(s);gel=document.createElement('div');gel.id='fsgoal';document.body.appendChild(gel)}
 const key=g.i+g.t+g.d+(g.x||'')+(typeof mode!='undefined'&&mode=='pc'?'p':'');gel.style.display='flex';
 if(key!==gk){gk=key;gel.innerHTML='<img class=v alt="Big Vee"><div class=w><div class=k>BIG VEE · NEXT GOAL '+g.i+'/5</div><div class=t></div><div class=d></div>'+(g.x?'<div class=x></div>':'')+'<div class=b><i></i></div></div>';
  gel.querySelector('.v').src=safe(tutPic,'');gel.querySelector('.t').textContent=g.t;gel.querySelector('.d').textContent=g.v&&!(typeof mode!='undefined'&&mode=='pc')?g.v:g.d;if(g.x)gel.querySelector('.x').textContent=g.x;gel.querySelector('i').style.width=((g.i-1)/5*100+8)+'%'}}

/* ---------- 5: funnel ---------- */
const STEPS=[['career',()=>true],['moved',()=>!!F().mv],['named',()=>!!S.artist],['recorded',()=>nDraft()+nSong()>0],['released',()=>nSong()>0],['listeners',()=>(+S.listeners||0)>0],['slept',()=>S.day>=2],['song2',()=>nSong()>=2],['gear',()=>gearN()>0],['day3',()=>S.day>=3]];
function lsGet(){return safe(()=>JSON.parse(localStorage.getItem('fw_funnel'))||{},{})}
function lsSet(o){safe(()=>localStorage.setItem('fw_funnel',JSON.stringify(o)))}
function funnel(){const f=F();if(!f.p0&&typeof P!='undefined'){f.p0=[P.x,P.z]}
 if(!f.mv&&f.p0&&Math.hypot(P.x-f.p0[0],P.z-f.p0[1])>4)f.mv=1;
 STEPS.forEach(s=>{if(f.st[s[0]]!=null||!s[1]())return;f.st[s[0]]=f.sec;f.x=s[0];
  if(S.day<=3){safe(()=>anLog('fs_step',{step:s[0],sec:f.sec}));const o=lsGet();o.steps=o.steps||{};o.steps[s[0]]=f.sec;o.exit=null;lsSet(o)}})}
function leave(){const f=S.fs;if(!f||!S.artist&&!f.x||S.day>2)return;safe(()=>anLog('fs_exit',{step:f.x,sec:f.sec,steps:Object.keys(f.st).length}));const o=lsGet();o.exit={step:f.x,sec:f.sec,at:new Date().toISOString()};lsSet(o)}
window.FW_FUNNEL={get:()=>({steps:Object.assign({},(S.fs||{}).st),sec:(S.fs||{}).sec||0,local:lsGet()}),steps:STEPS.map(s=>s[0])};

/* ---------- 4: return summary ---------- */
let rel=null;
function back(goneMin){if(!S.artist||!nSong()||goneMin<15||!inGame())return false;
 const hrs=Math.min(8,goneMin/60),L=+S.listeners||0,cash=Math.round(hrs*(3+Math.sqrt(L)*.6)),fol=Math.max(1,FOLN(Math.round(hrs*(6+Math.sqrt(L)/2)*3)));
 earn(cash);S.followers=(S.followers||0)+fol;F().last=now();
 const hk=S.hk||{},mins=Math.round(goneMin),away=mins>=120?Math.floor(mins/60)+' h '+(mins%60)+' min':mins+' min',g=goal();
 if(rel)rel.remove();rel=document.createElement('div');rel.id='fsr';
 if(!$('fsrcss')){const s=document.createElement('style');s.id='fsrcss';s.textContent=`#fsr{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:9100;width:min(340px,88vw);box-sizing:border-box;background:#0b0f0df4;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 3px #2fe68a66,6px 6px 0 #0008;padding:14px 18px;color:#e8f3ec;text-align:center;font-size:13px;line-height:1.5;animation:tcIn2 .3s both}@keyframes tcIn2{from{opacity:0;transform:translate(-50%,-16px)}}
#fsr small{font:11px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:2px}#fsr h2{margin:4px 0 8px;font-size:20px;color:#fff;text-shadow:3px 3px 0 #000}#fsr .r{display:flex;justify-content:space-between;border-top:1px solid #2a352e;padding:4px 0}#fsr .r b{color:#2fe68a}#fsr button{margin-top:10px;min-width:120px}`;document.head.appendChild(s)}
 rel.innerHTML='<small>WELCOME BACK</small><h2>You were away '+away+'</h2><div class=r><span>Royalties and tips</span><b>+$'+fm(cash)+'</b></div><div class=r><span>New followers</span><b>+'+fm(fol)+'</b></div>'
  +(hk.str?'<div class=r><span>Daily streak</span><b>day '+hk.str+(hk.last===Math.floor(now()/864e5)?' (claimed)':' (claim it now)')+'</b></div>':'<div class=r><span>Daily streak</span><b>starts today</b></div>')
  +'<div class=r><span>Next goal</span><b>'+(g?g.t:'a new song')+'</b></div><button class=go id=fsrok>Let\'s go</button>';
 document.body.appendChild(rel);$('fsrok').onclick=()=>{rel&&rel.remove();rel=null;snd('click')};setTimeout(()=>{if(rel){rel.remove();rel=null}},20000);
 snd('cash');glBurst(18);safe(()=>anLog('return_summary',{away_min:mins}));return true}

/* ---------- tick ---------- */
let loadDone=0,tk=0;
setInterval(()=>safe(()=>{if(typeof S=='undefined'||!inGame())return;
 const f=F();
 if(!loadDone){loadDone=1;
  if(!f.v){f.v=1;milestones(1);if(S.day>1||nSong())STEPS.forEach(s=>{if(f.st[s[0]]==null&&s[1]())f.st[s[0]]=0})}/* an older save: what it already did is marked silently */
  else if(f.last&&S.artist)back((now()-f.last)/6e4)}
 f.sec++;tk++;if(tk%20==0)f.last=now();
 milestones(0);funnel();chip()},1000),1000);
addEventListener('pagehide',()=>safe(()=>{if(S.fs)S.fs.last=now();leave()}));
document.addEventListener('visibilitychange',()=>safe(()=>{if(document.hidden){if(S.fs)S.fs.last=now();leave()}}));
window.FW_RETURN={back};window.FW_FIRST={goal,back,milestones:()=>Object.assign({},F().m),firstNight,state:()=>F()};
})();
