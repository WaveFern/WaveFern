/* ===== v26.44: guided tutorial, "Big Vee's Bootcamp" =====
   Starts straight after character creation on a brand-new game (no accept pop-up; Skip tutorial sits on Big Vee's
   dialogue box and the tracker's x), replayable from the pause menu. A loaded save never starts it; one left halfway resumes.
   Big Vee (washed-up one-hit wonder turned manager) guides you through 3 chapters of mini quests: pixel-portrait
   dialogue with typewriter text, DMs in Messages, a compact quest tracker, rewards (small cash + XP), confetti,
   camera pans and a bobbing arrow. Progress lives in S.tut (travels with the save code). Old saves have no S.tut.
   Steps advance when the player really does the thing (polled from game state + a few function wrappers).
   Non-modal: never pauses the clock or blocks input; dialogue auto-advances and click / Enter / Space speeds it up.
   One-time tutorial gift: TUT_GIFT dollars (cheapest gear is $120 headphones, cheapest clothes ~$12). */
const TUT_GIFT=150,TUT_XP=10,TUT_CASH=3,TUT_CH_CASH=10,TUT_END_CASH=20,VEE='Big Vee';
const TUT_LAP=/laptop/i,TUT_BED=/sleep/i,TUT_PC=k=>`[ondblclick^="app='${k}'"],[onclick^="app='${k}'"]`;
const gearSum=()=>Object.values(S.gear||{}).reduce((a,v)=>a+(+v||0),0);
const TCH=[{n:'Make your first track',s:'Studio time'},{n:'Get heard',s:'Gear, drip and DMs'},{n:'Level up',s:'The big leagues'}];
const MG_TIP=['hit on the beat','repeat the pads, keys 1-4','pick the rhyme, keys 1-3','hold Space to stay in the green'];
const TUT=[
 {c:0,n:'Find your feet',o:'Walk around. Hold Shift to sprint.',l:['Yo, new blood! Big Vee. Your manager, hype man and landlord\'s worst nightmare.','Warm up first. WASD to walk, Shift to sprint.'],
  ok:b=>Math.hypot(P.x-b.x,P.z-b.z)>3&&S.tut.f.run},
 {c:0,n:'Pick a stage name',w:TUT_LAP,hl:()=>!S.artist&&app!=1?TUT_PC(1):null,o:'Laptop (E) > Spotifly: choose your artist name.',l:['Every legend needs a name. Mine was DJ Gravy. Do not ask.','Laptop, then Spotifly. Make it catchy.'],ok:()=>!!S.artist},
 {c:0,n:'Cut a track',w:/^Record a song/,o:'Mic in the studio (E): pick a genre, beat four mini games.',l:['Studio is through there. Mic, genre, then four quick games.','Arrows mean trending. It costs 15 energy, so do not be precious.'],
  sub:()=>mode=='rec'&&rec&&rec.st!=null?'Now: '+(MG_N[rec.st]||'')+' ('+(MG_TIP[rec.st]||'')+')':'',ok:b=>S.drafts.length>b.d||S.songs.length>b.s},
 {c:0,n:'Drop it',w:TUT_LAP,hl:()=>app!=1?TUT_PC(1):`button[onclick*="pg='upload'"]`,o:'Laptop > Spotifly > Upload: release your song.',l:['Do not sit on heat. Spotifly, Upload, done.','Every night it earns $'+PAY_RATE.toFixed(2)+' a stream. Listeners lift your fame, so keep dropping.'],ok:b=>S.songs.length>b.s},
 {c:1,n:'Check your DMs',w:TUT_LAP,hl:()=>app!='msg'?TUT_PC('msg'):null,o:'Open Messages on the laptop.',dm:['Collabs 101: artists DM you once you are hot. If THEY ask, they pay YOU. If YOU ask, you pay their fee.','Haggle in plain words, like "how about 150". Works more than it should.'],
  l:['I slid into your DMs. Open Messages on the laptop.'],ok:()=>S.tut.f.msg},
 {c:1,n:'Upgrade the rig',w:TUT_LAP,hl:()=>app!='gear'?TUT_PC('gear'):`button[onclick="buy('phones')"]`,o:'Gearshop on the laptop: buy something cheap, like Headphones ($120).',l:['Better gear means better mixes and more streams.','That gift cash is burning a hole in your pocket.'],ok:b=>gearSum()>b.g},
 {c:1,n:'Fresh drip',w:TUT_LAP,hl:()=>app!='web'?TUT_PC('web'):typeof bw=='undefined'||bw!='clothes'?`[onclick^="bw='clothes'"]`:null,o:'Browser > Clothes (Threadz): buy any piece, from $12.',l:['Image is everything. Threadz has a billion colours.'],ok:()=>S.tut.f.buy},
 {c:1,n:'Put it on',w:/wardrobe/i,o:'Wardrobe in your bedroom (E): wear it.',l:['Do not leave it in the bag, king. Wardrobe, bedroom.'],ok:()=>S.tut.f.wear||S.tut.wore},
 {c:1,n:'Touch grass',w:/^Leave home/,o:'Walk out the front door.',l:['Time to see the street. Shops, Motors and the Pet Shop are all out there.'],ok:()=>!IN&&P.z>12.4},
 {c:1,n:'Sleep it off',w:TUT_BED,o:'Go to bed (E) when it is night or you are out of energy.',l:['A day is 12 minutes: 6 light, 6 dark. Recording eats energy.','Sleep and your streams pay out when you wake. Stay up past 02:00 and you pass out.'],ok:b=>S.day>b.day},
 {c:2,n:'Know your world',o:'Press N for the map. Scroll or +/- to zoom.',l:['Press N for the map. The city is way east: walk, drive, or grab a Taxi from the map.'],ok:()=>S.tut.f.map},
 {c:2,n:'Wheels and fame',info:1,o:'Listen to Big Vee.',l:['Motors sells cars. Press E by one to drive, set your pace in the speed box, W goes, S brakes.','Fame Level climbs with monthly listeners and unlocks gear, homes and festival stages.']},
 {c:2,n:'Book a gig',w:TUT_LAP,hl:()=>app!='fest'?TUT_PC('fest'):null,o:'Open FestivalApp on the laptop.',l:['Park Fields Festival runs every 7th day. Book 2+ days ahead; the smallest stage wants Fame Level 10.','Go have a nose in FestivalApp.'],ok:()=>S.tut.f.fest},
 {c:2,n:'Back it up',hl:()=>$('stg')?($('sc')?'#stg button[onclick*=saveCode]':'#stt button[data-t=save]'):$('pzm')?'#pzm button[onclick="settings()"]':null,o:'Esc > Settings > Get save code. Keep it safe.',l:['The game autosaves here, but a save code is your backup.','Paste it in any browser to carry on.'],ok:()=>S.tut.f.code}
];
const TUT_CHEER=['Sick!','Now we cooking.','That is the stuff.','Look at you go.','Legend behaviour.','Easy money. Well, $3.'];
let TUTM=null,TUTK='',TUTMIN=0,TD=null,TUTPEND=null,TUTPAN=null,TUTEND=0,TUTLI=-1,TUTBUB=null;
/* ----- Big Vee: a 16x16 pixel portrait (same palette family as the game's pfp portraits) ----- */
let TUTPICD=null;
function tutPic(){if(TUTPICD)return TUTPICD;const k=document.createElement('canvas');k.width=k.height=16;const x=k.getContext('2d'),f=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 f('#2a4a38',0,0,16,16);f('#1c6b46',1,13,14,3);f('#e8f3ec',7,13,1,3);f('#ffd27a',5,13,6,1);f('#ffd27a',7,14,2,1);f('#b87444',6,11,4,3);
 f('#2fe68a',3,0,10,2);f('#2fe68a',2,2,12,3);f('#1fb86c',2,2,1,1);f('#1fb86c',13,3,1,1);f('#1fb86c',4,0,1,1);f('#1fb86c',11,1,1,1);
 f('#b87444',4,4,8,8);f('#9a5f34',4,11,8,1);
 f('#0a0d0b',3,6,10,2);f('#0a0d0b',7,5,2,1);f('#5aa8ff',4,6,2,1);f('#5aa8ff',9,6,2,1);
 f('#7a2b2b',5,9,6,2);f('#fff',6,9,4,1);f('#ffd27a',3,9,1,2);
 return TUTPICD=k.toDataURL()}
/* ----- styles ----- */
function tutCSS(){if($('tutcss'))return;const s=document.createElement('style');s.id='tutcss';s.textContent=`
#tqt{position:fixed;right:10px;top:100px;width:min(256px,62vw);z-index:60;background:#0b0f0dd9;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008;padding:8px 10px;color:var(--t);font-size:12px;line-height:1.35;animation:tqIn .45s cubic-bezier(.2,1.3,.4,1)}
#tqt.pcm{top:auto;bottom:10px;right:auto;left:10px}#tqt.fh{top:170px}@keyframes tqIn{from{transform:translateX(120%);opacity:0}to{transform:none;opacity:1}}
#tqt .tq1{display:flex;align-items:center;gap:5px;font-family:Silkscreen,ui-monospace,monospace;font-size:10px;color:#ffd27a;letter-spacing:.5px}#tqt .tq1 b{flex:1;font-weight:400}#tqt .tq1 em{font-style:normal;color:var(--g)}
#tqt .tq1 button,#tqt .tq5 button{padding:1px 6px;font-size:11px;min-width:0;box-shadow:inset 0 -2px #0007}#tqt .tq2{font:700 14px Silkscreen,ui-monospace,monospace;margin:6px 0 2px;color:#fff}#tqt .tq3{color:#cfe0d6}#tqt small{display:block;color:#ffd27a;margin-top:3px}
#tqt .tq4{display:flex;gap:2px;margin:7px 0 2px;align-items:center}#tqt .tq4 i{flex:1;height:6px;background:#000;border:1px solid #2a352e}#tqt .tq4 i.d{background:var(--g);border-color:#000}#tqt .tq4 i.c{background:#ffd27a;animation:tutP2 .9s infinite alternate}#tqt .tq4 s{width:4px}@keyframes tutP2{to{opacity:.35}}
#tqt .tq5{display:flex;gap:6px;margin-top:6px;justify-content:flex-end}
#tdlg{position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(580px,calc(100vw - 24px));box-sizing:border-box;z-index:61;display:flex;gap:10px;background:#0b0f0df0;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008;padding:10px;cursor:pointer;animation:tdIn .25s ease-out}
@keyframes tdIn{from{transform:translate(-50%,20px);opacity:0}to{transform:translateX(-50%);opacity:1}}
#tdlg img{width:64px;height:64px;image-rendering:pixelated;border:3px solid #000;box-shadow:0 0 0 2px #2fe68a66;flex:none;background:#2a4a38}
#tdlg .td1{font-family:Silkscreen,ui-monospace,monospace;color:var(--g);font-size:12px;margin-bottom:3px}#tdlg .td2{font-size:14px;line-height:1.4;min-height:2.8em}#tdlg .td3{position:absolute;right:10px;bottom:5px;color:#ffd27a;font-size:11px;animation:tutP2 .6s infinite alternate}
#tdlg .tdsk{position:absolute;right:8px;top:6px;padding:1px 6px;font-size:11px;min-width:0;box-shadow:inset 0 -2px #0007}
#tdlg.drv{left:12px;right:236px;width:auto;transform:none;animation:none}
@media (max-width:700px){#tqt{top:132px;width:calc(100vw - 132px)}#tqt.pcm{width:min(256px,62vw)}#tdlg.drv{right:12px;left:12px;bottom:200px}#tdlg img{width:48px;height:48px}#tdlg{bottom:104px}#tdlg .td2{font-size:13px}}
#tcard{position:fixed;left:50%;top:26%;transform:translate(-50%,0);z-index:62;text-align:center;pointer-events:none;background:#0b0f0def;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 3px #2fe68a55,6px 6px 0 #0008;padding:16px 30px;min-width:min(340px,86vw);box-sizing:border-box;animation:tcIn 3s both}
@keyframes tcIn{0%{transform:translate(-50%,-30px) scale(.9);opacity:0}12%{transform:translate(-50%,0) scale(1);opacity:1}82%{opacity:1}100%{opacity:0;transform:translate(-50%,-10px)}}
#tcard small{font:12px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:2px}#tcard h2{font-size:22px;margin:6px 0 2px;color:#fff;text-shadow:3px 3px 0 #000}#tcard p{margin:0;color:var(--g)}
#trw{position:fixed;z-index:63;pointer-events:none;font:700 15px Silkscreen,ui-monospace,monospace;color:var(--g);text-shadow:2px 2px 0 #000;animation:trwUp 2s ease-out forwards;white-space:nowrap}#trw b{display:block;color:#ffd27a;font-size:11px}
@keyframes trwUp{0%{transform:translateY(8px) scale(.7);opacity:0}15%{transform:none;opacity:1}100%{transform:translateY(-46px);opacity:0}}
.tcf{position:fixed;z-index:63;width:7px;height:7px;pointer-events:none;border:1px solid #000;animation:tcf 1.1s ease-out forwards}@keyframes tcf{to{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
#tbub{position:fixed;left:50%;bottom:196px;z-index:59;pointer-events:none;background:#fff;color:#0a0d0b;border:3px solid #000;padding:3px 8px;font:700 12px ui-monospace,monospace;transform:translateX(-50%);white-space:nowrap}
.tutHL{outline:3px solid #ffd27a!important;outline-offset:2px;animation:tutP 1s infinite alternate;position:relative;z-index:5}@keyframes tutP{from{box-shadow:0 0 0 0 #ffd27a99}to{box-shadow:0 0 0 7px #ffd27a00}}`;document.head.appendChild(s)}
/* ----- effects ----- */
function tutBurst(x,y,n=26){const C=['#2fe68a','#ffd27a','#5aa8ff','#ff6ad5','#fff'];for(let i=0;i<n;i++){const e=document.createElement('i');e.className='tcf';const a=Math.random()*6.28,d=40+Math.random()*90;e.style.cssText=`left:${x}px;top:${y}px;background:${C[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-30}px;--r:${Math.random()*540}deg`;document.body.appendChild(e);setTimeout(()=>e.remove(),1200)}}
function tutPop(t,sub,x,y){const e=document.createElement('div');e.id='trw';e.style.left=x+'px';e.style.top=y+'px';e.innerHTML=t+(sub?`<b>${sub}</b>`:'');document.body.appendChild(e);setTimeout(()=>e.remove(),2000)}
function tutTick(){sfx(900+R(0,300),.025,'square',.03,0,0,0)}
function tutCard(k,t,s){tutCSS();const o=$('tcard');if(o)o.remove();const e=document.createElement('div');e.id='tcard';e.innerHTML=`<small>${k}</small><h2>${t}</h2><p>${s||''}</p>`;document.body.appendChild(e);setTimeout(()=>{if(e.parentNode)e.remove()},3000)}
function tutOK(){return !PAUSED&&(mode=='play'||mode=='drive')}
function tutBub(t,ms=2200){tutCSS();if(TUTBUB)TUTBUB.e.remove();const e=document.createElement('div');e.id='tbub';e.textContent=VEE+': '+t;document.body.appendChild(e);TUTBUB={e,end:Date.now()+ms}}
/* ----- dialogue box (typewriter; click / Enter / Space advance; auto-advances so it never blocks) ----- */
function tutSay(lines,cb){tutCSS();tutSayEnd(1);TD={q:lines.slice(),i:-1,pos:0,full:'',cb,done:0,wait:0};tutLine()}
function tutSayEnd(quiet){const o=$('tdlg');if(o)o.remove();const d=TD;TD=null;if(!quiet&&d&&d.cb)d.cb()}
function tutLine(){const d=TD;if(!d)return;d.i++;if(d.i>=d.q.length)return tutSayEnd();d.full=d.q[d.i];d.pos=0;d.done=0;
 let el=$('tdlg');if(!el){el=document.createElement('div');el.id='tdlg';el.onclick=tutAdv;el.innerHTML=`<img src="${tutPic()}"><div style="flex:1"><div class=td1>${VEE.toUpperCase()}</div><div class=td2></div></div><span class=td3>click &#9660;</span>${S.tut&&S.tut.on?'<button class=tdsk onclick="event.stopPropagation();tutEnd()">Skip tutorial</button>':''}`;document.body.appendChild(el)}
 el.querySelector(".td2").textContent='';el.querySelector(".td3").style.visibility='hidden'}
function tutAdv(){if(!TD)return;if(!TD.done){TD.pos=TD.full.length;return}tutLine()}
addEventListener('keydown',e=>{if(TD&&tutOK()&&(e.key=='Enter'||e.key==' ')&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))tutAdv()});
setInterval(()=>{try{const el=$('tdlg');
 if(TUTBUB){if(Date.now()>TUTBUB.end||mode!='play'){TUTBUB.e.remove();TUTBUB=null}}
 if(!TD||!el)return;const ok=tutOK();el.style.display=ok?'flex':'none';el.classList.toggle('drv',mode=='drive');if(!ok)return;
 if(!TD.done){TD.pos=Math.min(TD.full.length,TD.pos+1);if(TD.pos%3==1)tutTick();el.querySelector(".td2").textContent=TD.full.slice(0,TD.pos);if(TD.pos>=TD.full.length){TD.done=1;TD.wait=Date.now()+2600+TD.full.length*50;el.querySelector(".td3").style.visibility='visible'}}
 else if(Date.now()>TD.wait)tutLine()}catch(e){}},32);
/* ----- DMs from the guide in Messages ----- */
function tutDM(t){let m=S.msgs.find(x=>x.g);if(!m){m={id:S.nid++,from:VEE,body:t,state:9,g:1,log:[],unread:0};S.msgs.push(m)}
 if(m.log.some(x=>x.t==t))return;m.log.push({f:'a',t,d:S.day});m.body=t;m.unread=1;say('💬 '+VEE+' sent you a DM')}
/* ----- flow ----- */
function tutStart(){const o=S.tut||{},g=o.g;S.tut={on:1,i:0,f:{},b:{},g:g||0,p:o.p||{},xp:o.xp||0};TUTMIN=0;
 if(!g){S.tut.g=1;S.money=+(S.money+TUT_GIFT).toFixed(2);say('🎁 Big Vee gave you $'+TUT_GIFT+' for gear and clothes')}
 tutDM('Yo, it is Big Vee. Welcome to WaveFern! I will pop up with tips and slide the boring bits in here.');tutEnter()}
function tutEnter(){const T=S.tut,s=TUT[T.i];T.f={};T.b={x:P.x,z:P.z,d:S.drafts.length,s:S.songs.length,g:gearSum(),day:S.day};TUTK='';tutSayEnd(1);TUTEND=0;TUTPEND=null;
 if(s){(s.dm||[]).forEach(tutDM);const first=T.i==0||TUT[T.i-1].c!=s.c;let card=0;
  if(first){if(tutOK())tutCard('CHAPTER '+(s.c+1),TCH[s.c].n,TCH[s.c].s);else card=1}
  TUTPEND={i:T.i,card,at:card?0:Date.now()+(first?2700:700)}}}
function tutIntro(){const T=S.tut,s=TUT[T.i];if(!s)return;const i=T.i,o=tutTgt();
 if(o){const d=Math.hypot(o.x-P.x,o.z-P.z);if(d>5&&d<90)TUTPAN={x:o.x,z:o.z,t:performance.now()}}
 tutSay(s.l,()=>{if(S.tut&&S.tut.i==i)S.tut.f.said=1})}
function tutNext(skip){const T=S.tut;if(!T||!T.on)return;const i=T.i,s=TUT[i],last=!TUT[i+1]||TUT[i+1].c!=s.c;
 if(!skip){snd('chime');setTimeout(()=>snd('cash'),180);const first=!T.p[i];T.p[i]=1;let cash=0,xp=0;
  if(first){cash=TUT_CASH;xp=TUT_XP;if(last){cash+=TUT_CH_CASH;xp+=TUT_XP*3}if(i==TUT.length-1){cash+=TUT_END_CASH;xp+=TUT_XP*5}S.money=+(S.money+cash).toFixed(2);T.xp=(T.xp||0)+xp}
  const el=$('tqt'),r=el?el.getBoundingClientRect():{left:innerWidth-260,top:102,width:250,height:110};
  tutBurst(r.left+r.width/2,r.top+r.height/2,last?44:26);
  tutPop('✓ '+s.n,first?'+$'+cash+'  +'+xp+' XP':'',r.left+12,r.top+r.height);
  if(last)setTimeout(()=>{tutCard('CHAPTER '+(s.c+1)+' COMPLETE',TCH[s.c].n,first?'+$'+(TUT_CH_CASH+(i==TUT.length-1?TUT_END_CASH:0))+' bonus':'');snd('chime')},900);
  tutBub(TUT_CHEER[i%TUT_CHEER.length])}
 T.i++;if(T.i>=TUT.length){T.i=TUT.length;T.done=1;T.on=0;tutClr();tutRender();tutFinish();return}tutEnter();tutRender()}
function tutFinish(){tutDM('You finished the bootcamp. Proud of you. Do not let it go to your head. (Let it go to your head a little.)');
 setTimeout(()=>{if(tutOK()){tutSay(['That is the basics. Record, release, sleep, spend, grow.','Now go make me famous. I mean, YOU famous. Totally different.'],()=>{tutBurst(innerWidth/2,innerHeight/2,50)})}},3200)}
function tutEnd(){if(!S.tut)return;S.tut.on=0;S.tut.done=1;tutClr();tutSayEnd(1);TUTPEND=null;tutRender();say('Tutorial skipped. Replay it from the pause menu.')}
function tutClr(){document.querySelectorAll('.tutHL').forEach(e=>e.classList.remove('tutHL'))}
function tutRender(){let el=$('tqt');const T=S.tut,show=T&&T.on&&!PAUSED&&!/creator|load|sleep|cut|fest/.test(mode);
 if(!show){if(el)el.remove();TUTK='';TUTLI=-1;return}tutCSS();
 if(T.i>=TUT.length)return;
 const s=TUT[T.i],sub=s.sub?s.sub():'',pc=mode=='pc',k=T.i+'|'+TUTMIN+'|'+sub+'|'+pc+'|'+TUTEND;if(TUTK==k&&el)return;TUTK=k;
 const fresh=!el||TUTLI!=T.i;TUTLI=T.i;if(el&&fresh){el.remove();el=null}
 if(!el){el=document.createElement('div');el.id='tqt';document.body.appendChild(el)}
 el.classList.toggle("pcm",pc);el.classList.toggle("fh",!!$("fcr"));
 const pips=TUT.map((x,i)=>(i&&TUT[i-1].c!=x.c?'<s></s>':'')+`<i class="${i<T.i?'d':i==T.i?'c':''}"></i>`).join('');
 el.innerHTML=`<div class=tq1><b>CH ${s.c+1} · ${TCH[s.c].n.toUpperCase()}</b><em>${T.xp||0} XP</em><button title="${TUTMIN?'Expand':'Minimise'}" onclick="TUTMIN^=1;TUTK='';tutRender()">${TUTMIN?'+':'-'}</button><button title="End tutorial" onclick="tutEndAsk()">${TUTEND?'End?':'x'}</button></div><div class=tq2>${s.n}</div>`+
 (TUTMIN?'':`<div class=tq3>${s.o}</div>${sub?`<small>${sub}</small>`:''}<div class=tq4 title="${T.i+1}/${TUT.length}">${pips}</div><div class=tq5><button onclick="tutHint()">💬 Hint</button>${s.info?`<button class=go onclick="tutNext(0)">Got it</button>`:`<button onclick="tutNext(1)">Skip step</button>`}</div>`)}
function tutEndAsk(){if(TUTEND&&Date.now()<TUTEND){tutEnd();return}TUTEND=Date.now()+3000;TUTK='';tutRender();setTimeout(()=>{TUTEND=0;TUTK='';tutRender()},3100)}
function tutHint(){const s=TUT[S.tut.i];if(!s)return;const o=tutTgt();if(o)TUTPAN={x:o.x,z:o.z,t:performance.now()};tutSay(s.l)}
function tutPoll(){const T=S.tut;if(!T||!T.on||T.i>=TUT.length){tutClr();return tutRender()}
 if(mode=='play'&&keys.shift&&(keys.w||keys.a||keys.s||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright))T.f.run=1;
 if(mode=='pc'){if(app=='msg')T.f.msg=1;if(app=='fest')T.f.fest=1}
 if($('bm'))T.f.map=1;const sc=$('sc');if(sc&&/^FW[12]-/.test(sc.value))T.f.code=1;
 const s=TUT[T.i];if(s.info?T.f.said:s.ok&&s.ok(T.b||{})){tutNext();return}
 const p=TUTPEND;if(p&&p.i==T.i&&Date.now()>=p.at&&tutOK()){TUTPEND=null;if(p.card&&!$('tcard')){tutCard('CHAPTER '+(s.c+1),TCH[s.c].n,TCH[s.c].s);TUTPEND={i:T.i,at:Date.now()+2700}}else tutIntro()}
 tutRender();
 const sel=s.hl?s.hl():null;document.querySelectorAll('.tutHL').forEach(e=>{if(!sel||!e.matches(sel))e.classList.remove('tutHL')});if(sel)document.querySelectorAll(sel).forEach(e=>e.classList.add('tutHL'))}
setInterval(()=>{try{tutPoll()}catch(e){}},250);
/* world marker (bobbing arrow), guide idle/facing, bubble, camera pan */
function tutTgt(){const T=S.tut,s=T&&T.on&&TUT[T.i];if(!s||!s.w||mode!='play'||IN)return null;return INT.find(o=>s.w.test(o.l))||null}
{const u0=update;update=function(dt){u0(dt);try{const o=tutTgt();if(!TUTM&&o){TUTM=new THREE.Mesh(new THREE.ConeGeometry(.4,.8,4),new THREE.MeshBasicMaterial({color:0xffc400,depthTest:false,transparent:true}));TUTM.rotation.x=Math.PI;TUTM.renderOrder=999;scene.add(TUTM)}
 if(TUTM){TUTM.visible=!!o;if(o){TUTM.position.set(o.x,2.1+Math.sin(tt*4)*.18,o.z);TUTM.rotation.y+=dt*2}}
 const p=TUTPAN;if(p){const e=(performance.now()-p.t)/1000,L=2.6;if(e>=L||mode!='play'||IN)TUTPAN=null;else{const w=.85*Math.min(1,e/.5,(L-e)/.9),x=camT.x+(p.x-camT.x)*w,z=camT.z+(p.z-camT.z)*w;cam.position.set(x+16,13,z+16);cam.lookAt(x,.8,z)}}}catch(e){}}}
/* detection wrappers */
{const b0=buyG;buyG=function(id){const n=S.wr.length;const r=b0.apply(this,arguments);if(S.tut&&S.tut.f&&S.wr.length>n)S.tut.f.buy=1;return r}}
{const w0=wearG;wearG=function(){const r=w0.apply(this,arguments);if(S.tut&&S.tut.f){S.tut.f.wear=1;S.tut.wore=1}return r}}
/* new game: the tutorial just starts (no accept pop-up, no welcome card) */
{const c0=confirmChar;confirmChar=function(){c0.apply(this,arguments);closeUI();S.tut={on:0,i:0,f:{}};tutStart()}}
/* loading a save: clear any tutorial left on screen from before; a tutorial left halfway picks up where it was, otherwise none */
{const lc=loadCode;loadCode=function(){const r=lc.apply(this,arguments);try{tutSayEnd(1);TUTPEND=null;TUTPAN=null;tutClr();TUTK='';
 const T=S.tut;if(T&&T.on&&T.i<TUT.length){T.p=T.p||{};T.f={};T.b={x:P.x,z:P.z,d:S.drafts.length,s:S.songs.length,g:gearSum(),day:S.day};TUTPEND={i:T.i,card:1,at:0}}else if(T&&T.on){T.on=0;T.done=1}tutRender()}catch(e){}return r}}
/* pause menu: replay button */
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(m){const b=document.createElement('button');b.textContent=(S.tut&&S.tut.on?'Restart tutorial':'Tutorial');b.onclick=()=>{resumeGame();tutStart()};m.appendChild(b)}}}
