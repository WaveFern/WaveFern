/* ===== v26.43: guided tutorial for new games =====
   Offered after character creation on a brand-new game (Start / Skip), replayable from the pause menu.
   Progress lives in S.tut (travels with the save code). Old saves have no S.tut, so they never see it.
   Steps advance when the player really does the thing (polled from game state + a few function wrappers);
   things a new player can't do yet are info cards. Non-modal: never pauses the clock or blocks input.
   One-time tutorial gift: TUT_GIFT dollars (cheapest gear is $120 headphones, cheapest clothes ~$12). */
const TUT_GIFT=150;
const TUT_LAP=/laptop/i,TUT_BED=/^Sleep/,TUT_PC=k=>`[ondblclick^="app='${k}'"],[onclick^="app='${k}'"]`;
const gearSum=()=>Object.values(S.gear||{}).reduce((a,v)=>a+(+v||0),0);
const TUT=[
 {n:'Move around',t:'Walk with <b>WASD</b> or the arrow keys. Hold <b>Shift</b> to sprint (it uses stamina). The camera follows you.',
  ok:b=>Math.hypot(P.x-b.x,P.z-b.z)>3&&S.tut.f.run},
 {n:'Days, energy & sleep',info:1,w:TUT_BED,t:'A day lasts <b>12 minutes</b>: 6 of day, 6 of night (top-left shows the day and time). Recording costs <b>energy</b>. At night, sleep in your <b>bed</b> to end the day. Your streams are <b>paid out when you wake up</b>. Stay up past 02:00 and you pass out and wake with less energy.'},
 {n:'Use the laptop',w:TUT_LAP,hl:()=>!S.artist&&app!=1?TUT_PC(1):null,t:'Walk to the <b>laptop</b> and press <b>E</b>. Double-click <b>Spotifly</b> and pick your artist name.',ok:()=>!!S.artist},
 {n:'Record a song',w:/^Record a song/,t:'Go to the <b>mic</b> in the studio, press <b>E</b> and pick a genre (▲ means trending). A session is four quick games: <b>Beat</b> (hit on the beat), <b>Melody</b> (repeat the pads, keys 1-4), <b>Lyrics</b> (pick the rhyme, keys 1-3) and <b>Mix</b> (hold Space to keep the level in the green). It costs 15 energy.',
  sub:()=>mode=='rec'&&rec&&rec.st!=null?'Now playing: <b>'+(MG_N[rec.st]||'')+'</b>':'',ok:b=>S.drafts.length>b.d||S.songs.length>b.s},
 {n:'Release it on Spotifly',w:TUT_LAP,hl:()=>app!=1?TUT_PC(1):`button[onclick*="pg='upload'"]`,t:'On the laptop open <b>Spotifly → Upload</b> and release your song. Each night it gets <b>streams</b>; you earn <b>$'+PAY_RATE.toFixed(2)+' per stream</b>. <b>Monthly listeners</b> are based on your last 30 days of streams, and they push your fame up. New songs stream best in their first days, so keep releasing.',ok:b=>S.songs.length>b.s},
 {n:'Messages & collabs',w:TUT_LAP,hl:()=>app!='msg'?TUT_PC('msg'):null,t:'Open <b>Messages</b> on the laptop. Artists DM you about <b>collabs</b> (they boost a song). When a price is offered you can <b>haggle</b> in plain words, like "how about 150". If <b>they</b> asked you, they pay you. If <b>you</b> asked them, you pay their fee.',ok:()=>S.tut.f.msg},
 {n:'Buy a gear upgrade',w:TUT_LAP,hl:()=>app!='gear'?TUT_PC('gear'):`button[onclick="buy('phones')"]`,t:'Open the <b>Gearshop</b> on the laptop and buy something cheap, like <b>Headphones ($120)</b>. Better gear means better mix quality and more streams.',ok:b=>gearSum()>b.g},
 {n:'Buy some clothes',w:TUT_LAP,hl:()=>app!='web'?TUT_PC('web'):typeof bw=='undefined'||bw!='clothes'?`[onclick^="bw='clothes'"]`:null,t:'Open the <b>Browser</b> and click <b>Clothes</b> to go to <b>Threadz</b>. Buy any piece of clothing (some cost just $12). Every piece comes in lots of colours.',ok:()=>S.tut.f.buy},
 {n:'Wear it',w:/wardrobe/i,t:'Walk to the <b>wardrobe</b> in your bedroom, press <b>E</b> and wear what you bought.',ok:()=>S.tut.f.wear||S.tut.wore},
 {n:'Step outside',w:/^Leave home/,t:'Walk out of the <b>front door</b> to the street. Shops, Motors and the Pet Shop are along this road.',ok:()=>!IN&&P.z>12.4},
 {n:'Open the map',t:'Press <b>N</b> for the world map. <b>Scroll</b> or <b>+/-</b> to zoom and drag to move around. The <b>city</b> is far to the east: walk, drive, or take a <b>Taxi</b> from the map for a small fare.',ok:()=>S.tut.f.map},
 {n:'Sleep to end the day',w:TUT_BED,t:'When the top-left says <b>Night</b>, go to bed and press <b>E</b> to sleep. You wake up to your stream payout and full energy.',ok:b=>S.day>b.day},
 {n:'Cars',info:1,t:'Buy a car at <b>Motors</b> down the street (or the Cars app). Press <b>E</b> next to it to drive. While driving, the <b>speed box</b> at the bottom right sets your speed: type a number or use −/+, hold <b>W</b> to reach it, <b>S</b> brakes. Faster cars cost more.'},
 {n:'Fame levels',info:1,t:'Your <b>Fame Level</b> rises with your monthly listeners. Higher levels unlock better gear, clothes, homes, meetings and festival stages. Shops show the level an item needs.'},
 {n:'Festivals',w:TUT_LAP,hl:()=>app!='fest'?TUT_PC('fest'):null,t:'<b>Park Fields Festival</b> is on every 7th day. Book a slot in <b>FestivalApp</b> on your laptop at least 2 days ahead, build a setlist, then turn up at your stage on time. The smallest stage needs <b>Fame Level 10</b>. Open FestivalApp to have a look.',ok:()=>S.tut.f.fest},
 {n:'Save your game',hl:()=>$('stg')?'#stg button[onclick*=saveCode]':$('pzm')?'#pzm button[onclick="settings()"]':null,t:'The game autosaves in this browser. To keep a backup, press <b>Esc → Settings → Get save code</b> and keep the code somewhere safe. Paste it there and press Load to continue on any device.',ok:()=>S.tut.f.code}
];
let TUTM=null,TUTK='',TUTW=null,TUTMIN=0;
function tutCSS(){if($('tutcss'))return;const s=document.createElement('style');s.id='tutcss';s.textContent=`#tut{position:fixed;right:12px;bottom:56px;width:min(310px,calc(100vw - 32px));max-height:50vh;overflow:auto;z-index:60;background:#0d1612ee;border:2px solid #000;box-shadow:0 0 0 2px #2fe68a55,4px 4px 0 #000;color:#e8f5ee;font:13px/1.4 system-ui,sans-serif;padding:10px 12px;border-radius:6px}
#tut h4{margin:0 0 6px;display:flex;align-items:center;gap:6px;font-size:13px;color:#2fe68a}#tut h4 span{flex:1}#tut h4 button{padding:1px 7px;font-size:12px;min-width:0}
#tut ol{margin:0;padding:0;list-style:none}#tut li{padding:2px 0;color:#7f948a}#tut li.d{color:#5a8a6e;text-decoration:line-through}#tut li.c{color:#fff;font-weight:700}#tut.drv{bottom:170px}#tut .pb{height:4px;background:#ffffff22;margin:0 0 6px}#tut .pb i{display:block;height:100%;background:#2fe68a}
#tut .tc{background:#ffffff10;border-left:3px solid #ffd27a;padding:6px 8px;margin:4px 0 6px;font-weight:400;color:#e8f5ee}#tut .tc small{display:block;color:#ffd27a;margin-top:4px}
#tut .tbn{display:flex;gap:6px;margin-top:6px}#tut .tbn button{flex:1;padding:4px 6px;font-size:12px}
.tutHL{outline:3px solid #ffd27a!important;outline-offset:2px;animation:tutP 1s infinite alternate;position:relative;z-index:5}@keyframes tutP{from{box-shadow:0 0 0 0 #ffd27a99}to{box-shadow:0 0 0 7px #ffd27a00}}`;document.head.appendChild(s)}
function tutOffer(){mode='menu';$('ui').innerHTML=`<div class="box modal"><h2>Welcome home</h2><p>A modest place, <b>$100</b>, and an empty music career.</p><p class=m>New here? A short tutorial walks you through the game while you play: recording, releasing, collabs, shopping, the city, festivals and saving. It never stops the clock, and you can skip any step.</p><p class=m>🎁 Start it and you get a one-time <b>$${TUT_GIFT} tutorial gift</b> to buy the gear and clothes it asks for.</p><div class=row2><button class=go onclick="closeUI();tutStart()">Start tutorial</button><button onclick="tutSkipAll()">Skip</button></div></div>`}
function tutSkipAll(){S.tut={on:0,i:0,f:{},skip:1};closeUI();say('No problem. You can start the tutorial any time from the pause menu (Esc).')}
function tutStart(){const g=S.tut&&S.tut.g;S.tut={on:1,i:0,f:{},b:{},g:g||0};TUTMIN=0;
 if(!g){S.tut.g=1;S.money=+(S.money+TUT_GIFT).toFixed(2);say('🎁 Tutorial gift: +$'+TUT_GIFT+' to spend on your first gear and clothes')}tutEnter()}
function tutEnter(){const T=S.tut;T.f={};T.b={x:P.x,z:P.z,d:S.drafts.length,s:S.songs.length,g:gearSum(),day:S.day};TUTK=''}
function tutNext(skip){const T=S.tut;if(!T||!T.on)return;if(!skip&&!TUT[T.i].info)snd('chime');T.i++;if(T.i>=TUT.length){T.i=TUT.length;T.done=1;tutRender();return}tutEnter();tutRender()}
function tutEnd(){if(!S.tut)return;S.tut.on=0;S.tut.done=1;tutClr();tutRender()}
function tutClr(){document.querySelectorAll('.tutHL').forEach(e=>e.classList.remove('tutHL'))}
function tutRender(){let el=$('tut');const T=S.tut,show=T&&T.on&&!PAUSED&&!/creator|load|sleep|cut|fest/.test(mode);
 if(!show){if(el)el.remove();TUTK='';return}tutCSS();
 if(!el){el=document.createElement('div');el.id='tut';document.body.appendChild(el)}
 if(T.i>=TUT.length){const k='end';if(TUTK==k)return;TUTK=k;el.innerHTML=`<h4><span>🎓 You're ready!</span></h4><div class=tc>That's the basics: record, release, sleep for payouts, upgrade gear, collab, and grow your fame until you headline the festival. Good luck!</div><div class=tbn><button class=go onclick="tutEnd()">Finish</button></div>`;return}
 const s=TUT[T.i],sub=s.sub?s.sub():'',k=T.i+'|'+TUTMIN+'|'+sub+'|'+(mode=='drive');if(TUTK==k)return;TUTK=k;
 const hd=`<h4><span>🎓 Tutorial · ${T.i+1}/${TUT.length}</span><button title="${TUTMIN?'Expand':'Minimise'}" onclick="TUTMIN^=1;tutRender()">${TUTMIN?'▴':'▾'}</button><button title="End tutorial" onclick="tutEnd()">✕</button></h4>`;
 const card=`<div class=tc>${s.t}${sub?`<small>${sub}</small>`:''}</div><div class=tbn>${s.info?`<button class=go onclick="tutNext(1)">Got it</button>`:`<button onclick="tutNext(1)">Skip step</button>`}</div>`;
 el.classList.toggle('drv',mode=='drive');const pb=`<div class=pb><i style="width:${T.i/TUT.length*100}%"></i></div>`,lo=Math.max(0,T.i-1);
 el.innerHTML=hd+pb+(TUTMIN?`<b>${s.n}</b>`:`<ol>${TUT.slice(lo,T.i+3).map((x,j)=>{const i=lo+j;return`<li class="${i<T.i?'d':i==T.i?'c':''}">${i<T.i?'✓':i==T.i?'▶':'·'} ${x.n}${i==T.i?card:''}</li>`}).join('')}</ol>`)}
function tutPoll(){const T=S.tut;if(!T||!T.on||T.i>=TUT.length){tutClr();return tutRender()}
 if(mode=='play'&&keys.shift&&(keys.w||keys.a||keys.s||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright))T.f.run=1;
 if(mode=='pc'){if(app=='msg')T.f.msg=1;if(app=='fest')T.f.fest=1}
 if($('bm'))T.f.map=1;const sc=$('sc');if(sc&&/^FW1-/.test(sc.value))T.f.code=1;
 const s=TUT[T.i];if(!s.info&&s.ok&&s.ok(T.b||{})){say('✓ '+s.n);tutNext()}
 tutRender();
 const sel=TUT[T.i]&&TUT[T.i].hl?TUT[T.i].hl():null;document.querySelectorAll('.tutHL').forEach(e=>{if(!sel||!e.matches(sel))e.classList.remove('tutHL')});if(sel)document.querySelectorAll(sel).forEach(e=>e.classList.add('tutHL'))}
setInterval(()=>{try{tutPoll()}catch(e){}},250);
/* world marker: a bobbing arrow over the interactable for the current step */
function tutTgt(){const T=S.tut,s=T&&T.on&&TUT[T.i];if(!s||!s.w||mode!='play'||IN)return null;return INT.find(o=>s.w.test(o.l))||null}
{const u0=update;update=function(dt){u0(dt);try{const o=tutTgt();if(!TUTM&&o){TUTM=new THREE.Mesh(new THREE.ConeGeometry(.4,.8,4),new THREE.MeshBasicMaterial({color:0xffc400,depthTest:false,transparent:true}));TUTM.rotation.x=Math.PI;TUTM.renderOrder=999;scene.add(TUTM)}
 if(TUTM){TUTM.visible=!!o;if(o){TUTM.position.set(o.x,2.1+Math.sin(tt*4)*.18,o.z);TUTM.rotation.y+=dt*2}}}catch(e){}}}
/* detection wrappers */
{const b0=buyG;buyG=function(id){const n=S.wr.length;const r=b0.apply(this,arguments);if(S.tut&&S.tut.f&&S.wr.length>n)S.tut.f.buy=1;return r}}
{const w0=wearG;wearG=function(){const r=w0.apply(this,arguments);if(S.tut&&S.tut.f){S.tut.f.wear=1;S.tut.wore=1}return r}}
/* new game: offer the tutorial instead of the old welcome card */
{const c0=confirmChar;confirmChar=function(){c0.apply(this,arguments);S.tut={on:0,i:0,f:{}};tutOffer()}}
/* pause menu: replay button */
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(m){const b=document.createElement('button');b.textContent='🎓 '+(S.tut&&S.tut.on?'Restart tutorial':'Tutorial');b.onclick=()=>{resumeGame();tutStart()};m.appendChild(b)}}}
