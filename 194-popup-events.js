/* ---------- v49.46.0: pop-up events around the city ----------
   Every day a few things happen around town for a few hours: a block party, a record store signing, a radio
   roadshow, an open mic, a food truck rally or a street photo shoot. Each one is at a real place, from a set time
   to an end time, and you can do it once. They show on the world map (N) with the time, as a stall with a spinning
   marker in the street, and in the morning paper. When one opens you get a note.
   Every event has its own look (a party flyer, a kraft-paper record shop, an on-air studio, a stage with marquee
   bulbs, a food truck menu board, a camera contact sheet) and a small thing to do:
   - Block party: play one of your songs on the sound system. The crowd reacts to its quality; followers, streams
     for that song and hype for its genre.
   - Signing: fans queue up; stop the pen in the sweet spot for each signature. Sales money and followers.
   - Radio roadshow: three live questions from Sam, three answers each. Good answers mean streams and followers.
   - Open mic: hit the beats as they cross the line. Tips and followers.
   - Food trucks: cheap food that gives energy, up to two buys.
   - Photo shoot: pick a pose; the best one goes up on Instagrime with likes and new followers.
   State: S.pop={d:day,ev:[{k,p,s,e,done,an}]}; rolled once a day and saved, so reloads never change it.
   Times are minutes after midnight (08:00 = 480). The game clock: S.t 0-300 is 06:00-20:00, 300-600 is 20:00-06:00. */
(function(){
if(typeof S=='undefined'||typeof WORLD=='undefined')return;

/* ---------- places: a spot on the pavement next to each one (x, z) ---------- */
const PLACES={
 fern:{n:'Fern Road',x:49,z:14.6},
 radio:{n:'the Radio Station',x:70,z:13.8},
 park:{n:'Central Park',x:104,z:-90},
 lake:{n:'the Lake',x:128,z:-91},
 music:{n:'the Music Store',x:517,z:3.2},
 records:{n:'Records on 4th',x:586,z:127.6},
 mall:{n:'Nova Mall',x:658,z:3.6},
 plaza:{n:'City Plaza',x:587,z:39},
 cafe:{n:'City Cafe',x:539,z:70.8},
 tower:{n:'Skyline Tower',x:627,z:72.8},
 awards:{n:'the Gramophone Awards',x:709,z:12}
};

/* ---------- the six kinds ---------- */
const KINDS={
 party:{n:'Block party',v:'Join the block party',c:'#ffcf3a',c2:'#ff4f8b',icon:'speaker',at:['fern','park','plaza'],
  blurb:'The street is closed, there is a sound system and the DJ owes you a favour: one song of yours on the speakers.'},
 signing:{n:'Record store signing',v:'Sign at the record store',c:'#c8955a',c2:'#2a1d14',icon:'disc',at:['music','records','mall'],need:1,
  blurb:'A table, a pen and a queue of fans with copies of your music.'},
 radio:{n:'Radio roadshow',v:'Go on air',c:'#ff3b3b',c2:'#1b1e24',icon:'radio',at:['radio','plaza','mall'],
  blurb:'Sam from the radio station is broadcasting live from the street and wants three minutes with you.'},
 openmic:{n:'Open mic',v:'Take the open mic',c:'#ffd23d',c2:'#7a1f3a',icon:'mic',at:['cafe','park','plaza'],
  blurb:'A little stage, a mic and whoever walks past. Keep the beat and the hat fills up.'},
 food:{n:'Food truck rally',v:'Visit the food trucks',c:'#e8343c',c2:'#fff4e0',icon:'plate',at:['fern','lake','park','plaza'],
  blurb:'Three trucks parked nose to tail. Cheap, fast and very filling.'},
 shoot:{n:'Street photo shoot',v:'Do the photo shoot',c:'#f2f2f2',c2:'#111111',icon:'spark',at:['tower','lake','awards','park'],
  blurb:'Nadia, a street photographer, has a free half hour and thinks you have a look.'}
};
const SLOTS=[[480,720],[720,1020],[1020,1320],[600,900],[840,1140]];/* 08-12, 12-17, 17-22, 10-15, 14-19 */

/* ---------- clock ---------- */
const nowMin=()=>{const t=S.t||0;return t<300?360+t/300*840:1200+(t-300)/300*600};
const hm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const FL=()=>{try{return fameLevel()||0}catch(e){return 0}};
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pk=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=n=>Math.round(n).toLocaleString();
const money=n=>{try{return $$(n)}catch(e){return '$'+(+n).toFixed(2)}};
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const ico=n=>{try{return pxIcon(n)}catch(e){return''}};
const save=()=>{try{updateVersion()}catch(e){}};
const sn=k=>{try{snd(k)}catch(e){}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};

/* ---------- today's events ---------- */
function roll(){const d=S.day|0,n=d<=1?1:FL()>=3?3:2,out=[],usedP=new Set(),usedS=new Set();
 let kinds=shuf(Object.keys(KINDS));
 if(d<=1)kinds=['party'];
 else if(!(S.songs||[]).length)kinds=kinds.filter(k=>!KINDS[k].need);
 for(const k of kinds){if(out.length>=n)break;const p=shuf(KINDS[k].at).find(p=>!usedP.has(p));if(!p)continue;
  let si=shuf(SLOTS.map((_,i)=>i)).find(i=>!usedS.has(i));if(si===undefined)si=0;usedP.add(p);usedS.add(si);
  const sl=d<=1?[480,1200]:SLOTS[si];out.push({k,p:d<=1?'fern':p,s:sl[0],e:sl[1],done:0,an:0})}
 out.sort((a,b)=>a.s-b.s);return out}
function today(){if(!S.pop||S.pop.d!==S.day)S.pop={d:S.day,ev:roll()};return S.pop.ev}
const isOpen=v=>{const m=nowMin();return !v.done&&m>=v.s&&m<v.e};
const state=v=>v.done?'done':nowMin()<v.s?'soon':nowMin()>=v.e?'over':'open';
window.popToday=()=>today().map(v=>Object.assign({},v,{name:KINDS[v.k].n,place:PLACES[v.p].n,x:PLACES[v.p].x,z:PLACES[v.p].z,st:state(v)}));

/* ---------- the stall in the street ---------- */
let G=null,BUILT='';
function stall(v){const K=KINDS[v.k],pl=PLACES[v.p],g=new THREE.Group();g.position.set(pl.x,0,pl.z-1.6);
 /* counter, legs, canopy with stripes, a sign and a spinning marker */
 B(g,2.6,1,1,K.c2=='#fff4e0'?'#d8d0c0':K.c2,0,.5,0);B(g,2.7,.12,1.1,K.c,0,1.02,0);
 [-1.2,1.2].forEach(x=>{B(g,.12,2.2,.12,'#3a3a3a',x,1.1+1,-.4);B(g,.12,2.2,.12,'#3a3a3a',x,1.1+1,.4)});
 for(let i=0;i<5;i++)B(g,.56,.14,1.4,i%2?K.c:'#ffffff',-1.12+i*.56,3.25,0);
 B(g,1.6,.5,.08,K.c2=='#fff4e0'?'#7a2a1a':K.c2,0,2.7,.56);B(g,1.3,.28,.06,'*'+K.c,0,2.7,.61);
 if(v.k=='party'){[-1,1].forEach(x=>{B(g,.6,1.1,.6,'#1a1a1a',x*1.9,.55,.2);B(g,.36,.36,.05,'*'+K.c2,x*1.9,.75,.52)})}
 if(v.k=='openmic'){B(g,.06,1.5,.06,'#222',1.9,.75,.6);B(g,.18,.22,.18,'#444',1.9,1.55,.6)}
 if(v.k=='food'){B(g,1.6,1.4,2.8,'#f4f4f4',-2.4,.9,0);B(g,1.65,.3,2.85,K.c,-2.4,1.2,0);B(g,1.62,.5,1.4,'*#9ad0ff',-2.4,1.6,0)}
 if(v.k=='shoot'){B(g,.06,1.4,.06,'#222',1.9,.7,.6);B(g,.4,.3,.25,'#111',1.9,1.5,.6);B(g,.14,.14,.1,'*#7ad0ff',1.9,1.5,.75)}
 if(v.k=='radio'){B(g,.08,2.6,.08,'#ccc',-1.6,2.3,-.3);B(g,.3,.3,.3,'*#ff3b3b',-1.6,3.7,-.3)}
 if(v.k=='signing'){for(let i=0;i<4;i++)B(g,.5,.5,.04,'#111',-.9+i*.6,1.35,-.3);for(let i=0;i<4;i++)B(g,.14,.14,.05,'*'+K.c,-.9+i*.6,1.35,-.27)}
 const mk=new THREE.Group();B(mk,.5,.5,.5,'*'+K.c,0,0,0);B(mk,.3,.3,.3,'*#ffffff',0,0,0).position.y=.01;mk.rotation.set(Math.PI/4,0,Math.PI/4);mk.position.set(0,4.6,0);g.add(mk);g.userData.mk=mk;
 return g}
const INTS=[];
function build(){const ev=today(),key=S.day+'|'+ev.map(v=>v.k+v.p+v.done).join(',');if(key===BUILT&&G)return;BUILT=key;
 if(G){WORLD.remove(G);G.traverse(o=>{if(o.geometry&&o.geometry.dispose&&!o.geometry.userData?.shared)try{o.geometry.dispose()}catch(e){}})}
 G=new THREE.Group();G.name='popEvents';WORLD.add(G);
 INTS.splice(0).forEach(o=>{const i=INT.indexOf(o);if(i>=0)INT.splice(i,1)});
 ev.forEach((v,i)=>{if(v.done)return;const pl=PLACES[v.p],K=KINDS[v.k],s=stall(v);s.userData.v=v;G.add(s);
  const o={x:pl.x,z:pl.z,r:2.4,l:K.v,a:()=>openEvent(i),pop:v};INT.push(o);INTS.push(o)})}
/* labels follow the time: "opens 17:00" before, the action while open, gone after */
function tickInts(){INTS.forEach(o=>{const v=o.pop,K=KINDS[v.k],st=state(v);o.l=st=='open'?K.v:st=='soon'?K.n+' (opens '+hm(v.s)+')':K.n+' (over)'})}
let spin=0,lastM=-1;
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='title'||away())return r;build();tickInts();spin+=dt||0;
 if(G)G.children.forEach(s=>{const v=s.userData.v,m=s.userData.mk;if(!m)return;const st=state(v);m.visible=st!='over';m.rotation.y=spin*1.6;m.position.y=4.6+Math.sin(spin*2.2)*.25;
  m.scale.setScalar(st=='open'?1:.6)});
 /* a note when one opens */
 const m=Math.floor(nowMin());if(m!==lastM){lastM=m;today().forEach(v=>{if(!v.an&&!v.done&&m>=v.s&&m<v.e){v.an=1;const K=KINDS[v.k];
  say('Pop-up now: '+K.n+' at '+PLACES[v.p].n+' until '+hm(v.e)+'. Press N to see it.');save()}})}
 }catch(e){console.error('pop events',e)}return r}}

/* ---------- the map: pins, labels and a list ---------- */
const PCOL={open:1,soon:.75,over:.35,done:.35};
function drawPins(){const c=$('bm');if(!c||away())return;const x=c.getContext('2d'),M=MAPZ,k=M.z,sx=v=>mapSX(v)*k+M.ox,sz=v=>mapSZ(v)*k+M.oy;
 x.setTransform(M.R,0,0,M.R,0,0);x.font='bold 11px monospace';x.textBaseline='middle';
 today().forEach(v=>{const pl=PLACES[v.p],K=KINDS[v.k],X=sx(pl.x),Z=sz(pl.z),st=state(v);if(X<-30||X>M.W+30||Z<-30||Z>M.H+30)return;
  x.globalAlpha=PCOL[st];
  /* a burst: eight points round a circle */
  x.fillStyle='#000a';x.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?6:11;x.lineTo(X+1+Math.cos(a)*r,Z+1.5+Math.sin(a)*r)}x.fill();
  x.fillStyle=K.c;x.strokeStyle='#111';x.lineWidth=1.5;x.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?6:11;x.lineTo(X+Math.cos(a)*r,Z+Math.sin(a)*r)}x.closePath();x.fill();x.stroke();
  x.fillStyle='#111';x.beginPath();x.arc(X,Z,2.4,0,7);x.fill();
  const t=K.n+' · '+(st=='open'?'now':st=='soon'?hm(v.s):st=='done'?'done':'over'),w=x.measureText(t).width+14,lx=Math.min(M.W-w-50,Math.max(4,X-w/2)),ly=Z-30;
  x.fillStyle=K.c;mapPill(x,lx,ly,w,17,4);x.fill();x.strokeStyle='#111';x.lineWidth=1.5;x.stroke();x.fillStyle=K.c=='#f2f2f2'||K.c=='#ffd23d'||K.c=='#ffcf3a'||K.c=='#c8955a'?'#111':'#fff';x.fillText(t,lx+7,ly+9);
  x.globalAlpha=1});
 x.textBaseline='alphabetic'}
{const d0=mapDraw;mapDraw=function(){d0.apply(this,arguments);try{drawPins()}catch(e){console.error('pop pins',e)}}}
window.popGo=function(i){const v=today()[i];if(!v)return;const pl=PLACES[v.p];taxi(pl.x,pl.z+2)};
{const b0=bigMap;bigMap=function(){b0.apply(this,arguments);try{if(!$('bm')||away())return;const r=document.querySelector('#ui .row2');if(!r)return;
 const T=S.taxi||{},canTaxi=!(T.d===S.day&&T.go),box=document.createElement('div');box.className='popl';
 box.innerHTML=`<div class=poplh>${ico('mega')} Pop-ups today</div>`+today().map((v,i)=>{const K=KINDS[v.k],st=state(v),pl=PLACES[v.p];
  return `<div class="popr ${st}"><i style="background:${K.c}">${ico(K.icon)}</i><span><b>${E(K.n)}</b><small>${E(pl.n)} · ${hm(v.s)}-${hm(v.e)}</small></span><em>${st=='open'?'On now':st=='soon'?'Later':st=='done'?'Done':'Over'}</em>${canTaxi&&(st=='open'||st=='soon')?`<button onclick="popGo(${i})">Taxi</button>`:''}</div>`}).join('');
 r.before(box)}catch(e){console.error('pop list',e)}}}

/* ---------- the morning paper gets an "around town" column ---------- */
window.popMorningHTML=function(){const ev=today();if(!ev.length)return'';return `<div class=popam><b>Around town today</b>${ev.map(v=>`<div><i style="background:${KINDS[v.k].c}"></i>${E(KINDS[v.k].n)} <span>${E(PLACES[v.p].n)}, ${hm(v.s)}-${hm(v.e)}</span></div>`).join('')}</div>`};

/* ---------- the events ---------- */
let CUR=null,RAF=0,KEY=null;
function stopLoops(){if(RAF)cancelAnimationFrame(RAF);RAF=0;if(KEY){removeEventListener('keydown',KEY,true);KEY=null}}
{const c0=closeUI;closeUI=function(){stopLoops();CUR=null;return c0.apply(this,arguments)}}
function frame(v,inner,cls){const K=KINDS[v.k],pl=PLACES[v.p];
 return `<div class="box modal pe pe-${v.k} ${cls||''}"><div class=pehd><span class=pek>${ico(K.icon)} ${E(pl.n)} · ${hm(v.s)}-${hm(v.e)}</span><h2>${E(K.n)}</h2></div><div class=pebd>${inner}</div></div>`}
function show(html){$('ui').innerHTML=html}
function finish(v,res){v.done=1;save();BUILT='';CUR=null;stopLoops();sn('chime');
 show(frame(v,`<div class=peres>${res}</div><div class=row2><button class=go onclick="closeUI()">Nice</button></div>`,'fin'))}
function gain(fol,st,song,g){fol=Math.max(0,Math.round(fol));S.followers=(S.followers||0)+fol;if(song&&st>0){try{addSt(song,Math.round(st))}catch(e){song.streams+=Math.round(st);S.streams=(S.streams||0)+Math.round(st)}}
 if(g&&S.hype&&S.hype[g]!=null)S.hype[g]=+Math.min(2,(S.hype[g]||1)+.12).toFixed(2);return fol}
const best=()=>(S.songs||[]).slice().sort((a,b)=>(b.q||0)-(a.q||0));
const latest=()=>(S.songs||[]).slice().sort((a,b)=>(b.day||0)-(a.day||0)||(b.id||0)-(a.id||0))[0];
const scale=()=>1+FL()*.6+Math.sqrt(S.listeners||0)*.004;
function openEvent(i){const v=today()[i];if(!v||mode!='play')return;const st=state(v),K=KINDS[v.k];
 if(st=='soon'){sn('err');return say(K.n+' at '+PLACES[v.p].n+' opens at '+hm(v.s)+'.')}
 if(st!='open'){sn('err');return say('The '+K.n.toLowerCase()+' is over for today.')}
 if(K.need&&!(S.songs||[]).length){sn('err');return say('You need a released song first. Upload one on Spotifly.')}
 mode='menu';CUR={v,i};sn('pop');({party:party,signing:signing,radio:radio,openmic:openmic,food:food,shoot:shoot})[v.k](v)}

/* block party: play a song */
function party(v){const L=best().slice(0,5);
 const rows=L.length?L.map(s=>`<button class=pesong onclick="popParty(${s.id})"><b>${E(s.title)}</b><small>${E(s.g)} · quality ${Math.round(s.q||0)} · ${fmt(s.streams||0)} streams</small></button>`).join('')
  :`<p>You have no released songs yet, so you just dance with everyone. Still counts.</p><button class=pesong onclick="popParty(-1)"><b>Dance with the crowd</b><small>5 energy</small></button>`;
 show(frame(v,`<div class=pebunt></div><p class=pebl>${E(KINDS.party.blurb)}</p><div class=pelbl>Pick the song</div><div class=pelist>${rows}</div><div class=row2><button onclick="closeUI()">Not now</button></div>`))}
window.popParty=function(id){const C=CUR;if(!C)return;const v=C.v,s=(S.songs||[]).find(x=>x.id==id);
 if(!s){S.energy=Math.max(0,(S.energy||0)-5);const f=gain(ri(6,14)*scale());return finish(v,`<h3>You danced all afternoon</h3><p>People saw you having a good time. <b>+${fmt(f)} followers</b>.</p>`)}
 const q=s.q||0,r=Math.min(1,Math.max(.1,q/100+rnd(-.12,.12))),crowd=Math.round((40+r*220)*scale()),f=gain(crowd*r*.45,crowd*(4+r*10),s,s.g);
 const line=r>.8?'The whole street sang the hook back.':r>.6?'Hands up from the front to the back.':r>.4?'People nodded along and a few filmed it.':'A slow start, but some stayed to the end.';
 finish(v,`<h3>${E(s.title)} on the big speakers</h3><div class=pemeter><i style="width:${Math.round(r*100)}%"></i></div><p>${line} About ${fmt(crowd)} people were there.</p>
  <div class=pegrid><div>Followers<b>+${fmt(f)}</b></div><div>Streams for this song<b>+${fmt(crowd*(4+r*10))}</b></div><div>${E(s.g)} hype<b>up</b></div></div>`)};

/* signing: stop the pen in the sweet spot */
function signing(v){const n=Math.min(8,4+FL()),Q={n,k:0,ok:0,perf:0,cash:0,pos:0,dir:1,zone:rnd(.25,.65),w:.16,t0:0,log:[]};CUR.Q=Q;signR(v)}
function signR(v){const Q=CUR.Q,fans=['Ana','Ben','Chloe','Dev','Ezra','Femi','Gia','Hugo','Iris','Jonah'];
 show(frame(v,`<div class=pevinyl></div><p class=pebl>${E(KINDS.signing.blurb)}</p>
  <div class=peq>${Array.from({length:Q.n},(_,i)=>`<i class="${i<Q.k?'d':i==Q.k?'c':''}"></i>`).join('')}</div>
  <p class=pefan>${Q.k<Q.n?`Next: <b>${fans[(Q.k+S.day)%fans.length]}</b> wants a copy signed.`:''}</p>
  <div class=pebar><i class=z style="left:${Q.zone*100}%;width:${Q.w*100}%"></i><i class=pn id=pepen></i></div>
  <div class=row2><button class=go id=pesign onclick="popSign()">Sign (Space)</button></div><p class=pesm>${Q.log.slice(-3).join(' · ')||'Stop the pen inside the gold band.'}</p>`));
 const loop=t=>{if(!CUR||!CUR.Q)return;const sp=.9+Q.k*.12;Q.pos+=Q.dir*sp*(1/60);if(Q.pos>1){Q.pos=1;Q.dir=-1}if(Q.pos<0){Q.pos=0;Q.dir=1}const p=$('pepen');if(p)p.style.left=(Q.pos*100)+'%';RAF=requestAnimationFrame(loop)};
 stopLoops();RAF=requestAnimationFrame(loop);KEY=e=>{if(e.code=='Space'){e.preventDefault();e.stopPropagation();popSign()}};addEventListener('keydown',KEY,true)}
window.popSign=function(){const C=CUR;if(!C||!C.Q)return;const Q=C.Q,v=C.v,c=Q.zone+Q.w/2,d=Math.abs(Q.pos-c);
 let g;if(d<Q.w*.18){g='Perfect';Q.perf++;Q.ok++}else if(d<Q.w/2){g='Clean';Q.ok++}else g='Smudged';
 const price=g=='Smudged'?ri(4,7):ri(9,15)+(g=='Perfect'?5:0);Q.cash+=price;Q.log.push(g+' +'+money(price));Q.k++;sn(g=='Smudged'?'err':'cash');
 Q.zone=rnd(.12,.72);Q.w=Math.max(.08,.16-Q.k*.01);
 if(Q.k<Q.n)return signR(v);
 const f=gain((Q.ok*8+Q.perf*6)*scale(),0,null,(latest()||{}).g);S.money=+((S.money||0)+Q.cash).toFixed(2);
 finish(v,`<h3>${Q.n} copies signed</h3><p>${Q.perf} perfect, ${Q.ok-Q.perf} clean, ${Q.n-Q.ok} smudged. The shop put a signed copy in the window.</p>
  <div class=pegrid><div>Sales to you<b>${money(Q.cash)}</b></div><div>Followers<b>+${fmt(f)}</b></div></div>`)};

/* radio roadshow: three questions */
const QS=[
 {q:'So who are you, for anyone tuning in right now?',a:[['Just someone from this city making the music I wanted to hear.',2],['I am the next big thing. Remember the name.',1],['Uh, I make songs. That is it really.',0]]},
 {q:'Where do your ideas come from?',a:[['Late buses, overheard chats, this city at night.',2],['Mostly from other songs, honestly.',0],['I just sit down and something comes.',1]]},
 {q:'What is the worst gig you have ever played?',a:[['A café where the coffee machine was louder than me. Still finished the set.',2],['I do not have bad gigs.',0],['A birthday party. Long story.',1]]},
 {q:'What should people play first?',a:[['Start with my newest one, it sounds like now.',2],['Whatever, it is all good.',0],['The one with the most streams, people seem to like it.',1]]},
 {q:'Any message for the people outside the van?',a:[['Thanks for stopping. Come say hi after this.',2],['Stream my stuff.',1],['Can someone grab me a drink?',0]]},
 {q:'Who would you most like to work with?',a:[['Anyone hungry. The best collabs come from people still climbing.',2],['Only the biggest names, obviously.',0],['Not sure yet, open to anything.',1]]},
 {q:'How do you deal with bad comments?',a:[['Read one, learn one thing, close the app.',2],['I reply to every single one.',0],['I try not to look.',1]]},
 {q:'Big plans for this year?',a:[['More songs, more shows and a tour if they will have me.',2],['Get rich.',0],['See what happens.',1]]}
];
function radio(v){CUR.R={qs:shuf(QS).slice(0,3),k:0,sc:0,said:[]};radioR(v)}
function radioR(v){const R=CUR.R,q=R.qs[R.k];
 show(frame(v,`<div class=peair><span class=lamp>On air</span><span class=freq>98.6 FM · live from ${E(PLACES[v.p].n)}</span><span class=vu>${'<i></i>'.repeat(12)}</span></div>
  ${R.said.map(s=>`<p class=pehost><b>Sam</b> ${E(s[0])}</p><p class=peme><b>You</b> ${E(s[1])}</p>`).join('')}
  <p class=pehost><b>Sam</b> ${E(q.q)}</p><div class=pelist>${shuf(q.a.map((a,i)=>[a,i])).map(([a,i])=>`<button class=peans onclick="popAns(${i})">${E(a[0])}</button>`).join('')}</div>
  <p class=pesm>Question ${R.k+1} of 3</p>`))}
window.popAns=function(i){const C=CUR;if(!C||!C.R)return;const R=C.R,q=R.qs[R.k],a=q.a[i];R.sc+=a[1];R.said.push([q.q,a[0]]);R.said=R.said.slice(-1);R.k++;sn(a[1]==2?'ping':a[1]==1?'pop':'err');
 if(R.k<3)return radioR(C.v);const r=R.sc/6,s=latest(),f=gain((20+r*80)*scale()),st=s?Math.round((300+r*2600)*scale()):0;if(s&&st)gain(0,st,s,s.g);
 finish(C.v,`<h3>${r>.8?'Sam loved you':r>.5?'A good chat':'A bit awkward'}</h3><p>${r>.8?'The phone lines lit up and Sam played your newest song straight after.':r>.5?'Sam thanked you on air and played a bit of your song.':'Sam moved on to the weather pretty quickly.'}</p>
  <div class=pegrid><div>Score<b>${R.sc} / 6</b></div><div>Followers<b>+${fmt(f)}</b></div>${s?`<div>Streams for ${E(s.title)}<b>+${fmt(st)}</b></div>`:''}</div>`)};

/* open mic: hit the beats */
function openmic(v){if((S.energy||0)<8){sn('err');mode='play';CUR=null;return say('Too tired for the open mic. You need 8 energy.')}
 show(frame(v,`<div class=pebulbs></div><p class=pebl>${E(KINDS.openmic.blurb)}</p><p>Hit <b>Space</b> or the button as each beat crosses the line. Costs 8 energy.</p><div class=row2><button class=go onclick="popMicGo()">Step up</button><button onclick="closeUI()">Not now</button></div>`))}
window.popMicGo=function(){const C=CUR;if(!C)return;const v=C.v;S.energy=Math.max(0,(S.energy||0)-8);save();
 const N=10,M={t:0,notes:Array.from({length:N},(_,i)=>({t:1.2+i*.62+(i%3==2?.31:0),h:0})),hits:[],last:performance.now(),sc:0};C.M=M;
 show(frame(v,`<div class=pebulbs></div><div class=pelane id=pelane><i class=ln></i></div><p class=pejudge id=pejd>Get ready</p><div class=row2><button class=go onpointerdown="popHit();event.preventDefault()">Hit (Space)</button></div>`));
 const lane=$('pelane');M.el=M.notes.map(()=>{const e=document.createElement('b');lane.appendChild(e);return e});
 const step=now=>{if(!CUR||CUR.M!==M)return;M.t+=(now-M.last)/1000;M.last=now;M.notes.forEach((n,i)=>{const p=.82-(n.t-M.t)*.38;M.el[i].style.left=(p*100)+'%';M.el[i].style.opacity=n.h?0:p<-0.02||p>1.02?0:1;if(!n.h&&M.t-n.t>.22){n.h=-1;judge('Miss')}});
  if(M.t>M.notes[N-1].t+.8)return micEnd();RAF=requestAnimationFrame(step)};
 stopLoops();RAF=requestAnimationFrame(step);KEY=e=>{if(e.code=='Space'){e.preventDefault();e.stopPropagation();if(!e.repeat)popHit()}};addEventListener('keydown',KEY,true)};
function judge(t){const j=$('pejd');if(j){j.textContent=t;j.className='pejudge '+t.toLowerCase()}}
window.popHit=function(){const M=CUR&&CUR.M;if(!M)return;let bi=-1,bd=9;M.notes.forEach((n,i)=>{if(n.h)return;const d=Math.abs(n.t-M.t);if(d<bd){bd=d;bi=i}});
 if(bi<0||bd>.3){judge('Early');return}const n=M.notes[bi];if(bd<.08){n.h=2;M.sc+=2;judge('Perfect');sn('click')}else if(bd<.18){n.h=1;M.sc+=1;judge('Good');sn('click')}else{n.h=-1;judge('Miss')}};
function micEnd(){const C=CUR,M=C.M,v=C.v;stopLoops();const r=M.sc/(M.notes.length*2),tips=+((3+r*30)*scale()).toFixed(2),f=gain((10+r*60)*scale());S.money=+((S.money||0)+tips).toFixed(2);sn('cash');
 C.M=null;finish(v,`<h3>${r>.85?'Standing ovation':r>.6?'Big cheer':r>.35?'Polite applause':'Someone coughed'}</h3><div class=pemeter><i style="width:${Math.round(r*100)}%"></i></div>
  <p>${M.notes.filter(n=>n.h==2).length} perfect, ${M.notes.filter(n=>n.h==1).length} good, ${M.notes.filter(n=>n.h<=0).length} missed.</p>
  <div class=pegrid><div>Tips in the hat<b>${money(tips)}</b></div><div>Followers<b>+${fmt(f)}</b></div></div>`)}

/* food trucks: up to two buys */
const TRUCKS=[['Taco Torpedo','Two fish tacos and lime',6,22],['Noodle Nomad','Chilli noodle box',8,30],['Big Squeeze','Mango smoothie',5,14],['Bao Down','Pork belly bao',7,26],['The Crêpe Escape','Sugar and lemon crêpe',5,16],['Smoky Joe\'s','Brisket bun',9,34]];
function food(v){if(!CUR.F)CUR.F={list:shuf(TRUCKS).slice(0,3),n:0};const F=CUR.F;
 show(frame(v,`<div class=pechk></div><p class=pebl>${E(KINDS.food.blurb)}</p><div class=pemenu>${F.list.map((t,i)=>`<button class=pedish onclick="popEat(${i})"><span><b>${E(t[0])}</b><small>${E(t[1])}</small></span><em>+${t[3]} energy</em><strong>${money(t[2])}</strong></button>`).join('')}</div>
  <p class=pesm>Energy ${Math.round(S.energy||0)} / 100 · You have ${money(S.money||0)} · ${2-F.n} buy${2-F.n==1?'':'s'} left</p><div class=row2><button onclick="${F.n?'popFoodDone()':'closeUI()'}">${F.n?'Done':'Not hungry'}</button></div>`))}
window.popEat=function(i){const C=CUR;if(!C||!C.F)return;const F=C.F,t=F.list[i];if((S.energy||0)>=100){sn('err');return say('You are already full of energy.')}if((S.money||0)<t[2]){sn('err');return say('Not enough cash.')}
 S.money=+((S.money||0)-t[2]).toFixed(2);S.energy=Math.min(100,(S.energy||0)+t[3]);F.n++;sn('eat');save();if(F.n>=2)return popFoodDone();food(C.v)};
window.popFoodDone=function(){const C=CUR;if(!C)return;finish(C.v,`<h3>Full and happy</h3><p>Energy is now <b>${Math.round(S.energy||0)}</b>. The trucks pack up at ${hm(C.v.e)}.</p>`)};

/* photo shoot: pick a pose */
const POSES=[['Lean on the wall, look away','wall'],['Jump shot, mid-air','jump'],['Close-up, dead serious','close'],['Laughing mid-walk','walk'],['Sitting on the kerb','kerb'],['Hands in pockets, wide shot','wide']];
function shoot(v){const L=shuf(POSES).slice(0,3).map(p=>[p[0],p[1],rnd(.35,1)]);CUR.P=L;
 show(frame(v,`<div class=pefilm></div><p class=pebl>${E(KINDS.shoot.blurb)}</p><div class=pelbl>Pick a pose for frame 1</div>
  <div class=peframes>${L.map((p,i)=>`<button class="peshot ps-${p[1]}" onclick="popPose(${i})"><span class=vf></span><b>${E(p[0])}</b><small>Frame ${String(i+1).padStart(2,'0')}A</small></button>`).join('')}</div><div class=row2><button onclick="closeUI()">Not now</button></div>`))}
window.popPose=function(i){const C=CUR;if(!C||!C.P)return;const p=C.P[i],r=Math.min(1,p[2]+(PLACES[C.v.p].n.includes('Tower')||C.v.p=='awards'?.1:0)),f=gain((15+r*90)*scale());
 const fol=(S.followers||0)+(S.igF||0),likes=Math.round(fol*(.12+r*.3))+ri(10,40),cap=pk(['shot by nadia on the street','no filter, just '+PLACES[C.v.p].n.replace(/^the /,''),'new look, same city','out here today','caught mid-thought']);
 try{S.igPosts=S.igPosts||[];S.igPosts.push({id:S.nid++,mine:1,u:S.artist,cfg:Object.assign({},ch),cap,day:S.day,l:likes})}catch(e){}
 finish(C.v,`<h3>${r>.8?'That is the cover shot':r>.55?'A keeper':'Not your best angle'}</h3><p>Nadia sent you the photo. <i>${E(p[0])}</i> is now on your Instagrime with the caption "${E(cap)}".</p>
  <div class=pegrid><div>Likes<b>${fmt(likes)}</b></div><div>Followers<b>+${fmt(f)}</b></div></div>`)};

/* ---------- looks: each event dressed as itself ---------- */
(function css(){if(document.getElementById('pecss'))return;
 const f=document.createElement('link');f.rel='stylesheet';f.href='https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Bungee&family=Special+Elite&family=Playfair+Display:wght@700;900&display=swap';document.head.appendChild(f);
 const s=document.createElement('style');s.id='pecss';s.textContent=`
#ui .box.modal.pe{width:min(520px,94vw);max-height:92vh;overflow:auto;padding:0;border:3px solid #111;box-shadow:6px 6px 0 #0009;font-family:ui-monospace,Menlo,Consolas,monospace}
.pe .pehd{padding:14px 18px 10px;position:relative}.pe .pehd h2{margin:2px 0 0;font-size:26px;line-height:1.1}
.pe .pek{display:inline-flex;align-items:center;gap:6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.85}
.pe .pebd{padding:4px 18px 16px}.pe .pebl{margin:6px 0 10px;line-height:1.45}.pe .pesm{font-size:12px;opacity:.75;margin:8px 0 0}
.pe .pelbl{font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.8;margin:10px 0 6px}
.pe .pelist{display:flex;flex-direction:column;gap:6px}.pe .row2{margin-top:12px}
.pe button{font:inherit;border:2px solid #111;cursor:pointer}
.pe .pesong,.pe .peans,.pe .pedish,.pe .peshot{text-align:left;padding:9px 12px;display:flex;flex-direction:column;gap:2px}
.pe .pesong small{opacity:.75}.pe h3{margin:0 0 6px;font-size:20px}
.pe .pegrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:10px}.pe .pegrid div{padding:8px 10px;border:2px solid currentColor;font-size:12px}.pe .pegrid b{display:block;font-size:18px;margin-top:2px}
.pe .pemeter{height:14px;border:2px solid #111;background:#0002;margin:8px 0}.pe .pemeter i{display:block;height:100%}
/* party: a photocopied flyer, yellow paper, tape and bunting */
.pe-party{background:#ffe45c!important;color:#1a1208;background-image:radial-gradient(#0000000d 1px,transparent 1.4px)!important;background-size:6px 6px!important}
.pe-party .pehd{background:#ff4f8b;color:#fff;transform:rotate(-1.2deg);margin:14px 14px 4px;border:2px solid #111;box-shadow:3px 3px 0 #111}
.pe-party .pehd h2{font-family:'Permanent Marker','Silkscreen',cursive;font-size:34px;letter-spacing:.02em}
.pe-party::before,.pe-party::after{content:'';position:absolute;top:-6px;width:70px;height:20px;background:#ffffffb0;border:1px solid #0002}.pe-party::before{left:20px;transform:rotate(-8deg)}.pe-party::after{right:20px;transform:rotate(7deg)}
.pe-party .pebunt{height:16px;background:conic-gradient(from 135deg at 50% 0,#ff4f8b 0 90deg,transparent 0) 0 0/24px 16px,conic-gradient(from 135deg at 50% 0,#3ad0ff 0 90deg,transparent 0) 12px 0/24px 16px;margin:0 -18px 6px}
.pe-party .pesong{background:#fff;color:#1a1208;box-shadow:3px 3px 0 #111}.pe-party .pesong:hover{background:#fff5c0;transform:rotate(-.5deg)}
.pe-party button{background:#fff;color:#1a1208}.pe-party button.go{background:#111;color:#ffe45c}.pe-party .pemeter i{background:repeating-linear-gradient(90deg,#ff4f8b 0 10px,#ff7aa8 10px 20px)}
/* signing: kraft paper, a record and a queue */
.pe-signing{background:#c8a57a!important;color:#2a1a0c;background-image:repeating-linear-gradient(0deg,#0000 0 3px,#00000008 3px 4px)!important}
.pe-signing .pehd{background:#2a1d14;color:#f4e2c4;border-bottom:4px double #f4e2c4}.pe-signing .pehd h2{font-family:'Playfair Display',Georgia,serif;font-weight:900;font-size:28px}
.pe-signing .pevinyl{float:right;width:84px;height:84px;margin:6px 0 6px 12px;border-radius:50%;background:radial-gradient(circle,#e8452c 0 16%,#111 17% 20%,#1c1c1c 21% 30%,#111 31% 40%,#1c1c1c 41% 50%,#111 51% 70%,#222 71%);box-shadow:3px 3px 0 #0006}
.pe-signing .peq{display:flex;gap:5px;margin:8px 0 4px;clear:both}.pe-signing .peq i{width:18px;height:26px;background:#f4e2c4;border:2px solid #2a1d14;border-radius:8px 8px 2px 2px}.pe-signing .peq i.d{background:#2a1d14}.pe-signing .peq i.c{background:#e8b04a;transform:translateY(-3px)}
.pe-signing .pebar{position:relative;height:30px;background:#f8efdf;border:2px solid #2a1d14;margin:10px 0}.pe-signing .pebar .z{position:absolute;top:0;bottom:0;background:#e8b04a;border-left:2px solid #a06a1a;border-right:2px solid #a06a1a}
.pe-signing .pebar .pn{position:absolute;top:-6px;bottom:-6px;width:4px;margin-left:-2px;background:#2a1d14}
.pe-signing button{background:#f4e2c4;color:#2a1a0c}.pe-signing button.go{background:#2a1d14;color:#f4e2c4}.pe-signing .pegrid div{background:#f4e2c4}
/* radio: an on-air studio */
.pe-radio{background:#1b1e24!important;color:#e8ecf2}.pe-radio .pehd{background:linear-gradient(#2a2f38,#1b1e24);border-bottom:3px solid #000}.pe-radio .pehd h2{font-family:'Bungee','Silkscreen',sans-serif;font-size:26px;color:#fff}
.pe-radio .peair{display:flex;align-items:center;gap:10px;background:#0d0f13;border:2px solid #000;padding:8px 10px;margin:4px 0 10px;flex-wrap:wrap}
.pe-radio .lamp{background:#ff3b3b;color:#fff;font-family:'Bungee',sans-serif;font-size:12px;padding:3px 8px;border-radius:4px;box-shadow:0 0 12px #ff3b3b,0 0 2px #fff inset;animation:pelamp 1.4s infinite}
@keyframes pelamp{50%{box-shadow:0 0 4px #ff3b3b;opacity:.85}}
.pe-radio .freq{font-size:12px;color:#9aa6b8;flex:1}.pe-radio .vu{display:flex;gap:2px;align-items:flex-end;height:18px}.pe-radio .vu i{width:4px;background:#3ad07a;animation:pevu .6s infinite alternate}
.pe-radio .vu i:nth-child(3n){animation-delay:-.2s}.pe-radio .vu i:nth-child(4n+1){animation-delay:-.45s;background:#e8d03a}.pe-radio .vu i:nth-child(n+10){background:#ff3b3b}
@keyframes pevu{from{height:3px}to{height:18px}}
.pe-radio .pehost,.pe-radio .peme{padding:8px 10px;margin:6px 0;border-left:4px solid #ff3b3b;background:#262b34;line-height:1.4}.pe-radio .peme{border-color:#3ad0ff;background:#1f2a33}.pe-radio .pehost b,.pe-radio .peme b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9aa6b8}
.pe-radio button{background:#2a2f38;color:#e8ecf2;border-color:#000}.pe-radio button:hover{background:#363d49}.pe-radio button.go{background:#ff3b3b;color:#fff}.pe-radio .pegrid div{border-color:#3a414d}
/* open mic: a stage with marquee bulbs and a spotlight */
.pe-openmic{background:radial-gradient(ellipse at 50% -10%,#ffe9a8 0,#7a1f3a 38%,#2a0a16 75%)!important;color:#fff4e0}
.pe-openmic .pehd{text-align:center}.pe-openmic .pehd h2{font-family:'Bungee','Silkscreen',sans-serif;font-size:32px;color:#ffd23d;text-shadow:0 0 10px #ffb000,2px 2px 0 #000}
.pe-openmic .pebulbs{height:12px;margin:0 -18px 8px;background:radial-gradient(circle,#fff6c8 0 3px,#ffb000 4px,transparent 5px) 0 0/18px 12px;filter:drop-shadow(0 0 4px #ffb000)}
.pe-openmic .pelane{position:relative;height:46px;background:#1a0610;border:2px solid #000;border-radius:4px;margin:10px 0;overflow:hidden}
.pe-openmic .pelane .ln{position:absolute;left:82%;top:0;bottom:0;width:4px;background:#ffd23d;box-shadow:0 0 8px #ffd23d}
.pe-openmic .pelane b{position:absolute;top:11px;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:#ff6ad5;box-shadow:0 0 8px #ff6ad5}
.pe-openmic .pejudge{text-align:center;font-family:'Bungee',sans-serif;font-size:18px;margin:4px 0}.pe-openmic .pejudge.perfect{color:#ffd23d}.pe-openmic .pejudge.good{color:#9ad0ff}.pe-openmic .pejudge.miss,.pe-openmic .pejudge.early{color:#ff7a7a}
.pe-openmic button{background:#3a0f20;color:#fff4e0;border-color:#000}.pe-openmic button.go{background:#ffd23d;color:#2a0a16}.pe-openmic .pemeter i{background:#ffd23d}.pe-openmic .pegrid div{border-color:#ffd23d80}
/* food trucks: an awning and a menu board */
.pe-food{background:#fff4e0!important;color:#2a1a12}
.pe-food .pehd{background:#e8343c;color:#fff;padding-bottom:14px}.pe-food .pehd h2{font-family:'Bungee','Silkscreen',sans-serif;font-size:26px}
.pe-food .pechk{height:18px;margin:-4px -18px 8px;background:repeating-linear-gradient(90deg,#e8343c 0 18px,#fff 18px 36px);clip-path:polygon(0 0,100% 0,100% 50%,97.5% 100%,95% 50%,92.5% 100%,90% 50%,87.5% 100%,85% 50%,82.5% 100%,80% 50%,77.5% 100%,75% 50%,72.5% 100%,70% 50%,67.5% 100%,65% 50%,62.5% 100%,60% 50%,57.5% 100%,55% 50%,52.5% 100%,50% 50%,47.5% 100%,45% 50%,42.5% 100%,40% 50%,37.5% 100%,35% 50%,32.5% 100%,30% 50%,27.5% 100%,25% 50%,22.5% 100%,20% 50%,17.5% 100%,15% 50%,12.5% 100%,10% 50%,7.5% 100%,5% 50%,2.5% 100%,0 50%)}
.pe-food .pemenu{background:#26302a;padding:10px;border:4px solid #6a4a2a;box-shadow:inset 0 0 0 2px #000;display:flex;flex-direction:column;gap:6px}
.pe-food .pedish{flex-direction:row;align-items:center;gap:10px;background:#2f3a33;color:#f2efe4;border-color:#000}.pe-food .pedish:hover{background:#3a4a40}.pe-food .pedish span{flex:1;display:flex;flex-direction:column}
.pe-food .pedish small{opacity:.7}.pe-food .pedish em{font-style:normal;color:#9ad0b8;font-size:12px}.pe-food .pedish strong{background:#ffd27a;color:#2a1a12;padding:3px 8px;font-family:'Bungee',sans-serif;font-size:13px}
.pe-food button{background:#fff;color:#2a1a12}.pe-food button.go{background:#e8343c;color:#fff}.pe-food .pegrid div{background:#fff}
/* photo shoot: film strip and viewfinders */
.pe-shoot{background:#141414!important;color:#f2f2f2}.pe-shoot .pehd h2{font-family:'Special Elite',ui-monospace,monospace;font-size:28px;letter-spacing:.04em}
.pe-shoot .pehd::after{content:'REC';position:absolute;right:18px;top:16px;font-size:11px;color:#ff4040;padding-left:14px;background:radial-gradient(circle at 5px 50%,#ff4040 4px,transparent 5px)}
.pe-shoot .pefilm{height:14px;margin:0 -18px 8px;background:#000 radial-gradient(circle,#141414 0 0) ;background:repeating-linear-gradient(90deg,#000 0 6px,#e8e0c8 6px 14px,#000 14px 22px) 0 3px/100% 8px no-repeat,#000}
.pe-shoot .peframes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pe-shoot .peshot{background:#000;color:#f2f2f2;border:2px solid #333;padding:6px;align-items:stretch}.pe-shoot .peshot:hover{border-color:#ffd23d}
.pe-shoot .peshot .vf{display:block;aspect-ratio:4/3;margin-bottom:6px;background:linear-gradient(#0000,#0000),var(--ps);position:relative;
 box-shadow:inset 0 0 0 2px #000;border:1px solid #444}
.pe-shoot .peshot .vf::before{content:'';position:absolute;inset:6px;border:2px solid #fff8;clip-path:polygon(0 0,25% 0,25% 2px,2px 2px,2px 25%,0 25%,0 75%,2px 75%,2px calc(100% - 2px),25% calc(100% - 2px),25% 100%,75% 100%,75% calc(100% - 2px),calc(100% - 2px) calc(100% - 2px),calc(100% - 2px) 75%,100% 75%,100% 25%,calc(100% - 2px) 25%,calc(100% - 2px) 2px,75% 2px,75% 0,100% 0,100% 100%,0 100%)}
.pe-shoot .peshot b{font-size:12px;line-height:1.25}.pe-shoot .peshot small{color:#ffb000;font-size:10px;margin-top:3px;font-family:'Special Elite',monospace}
.pe-shoot .ps-wall{--ps:linear-gradient(90deg,#8a5a44 0 60%,#d8c8a8 60%)}.pe-shoot .ps-jump{--ps:linear-gradient(#7ac8ff 0 70%,#5a8a4a 70%)}.pe-shoot .ps-close{--ps:radial-gradient(circle at 50% 60%,#e8b890 0 28%,#2a2a2a 29%)}
.pe-shoot .ps-walk{--ps:linear-gradient(#bcd 0 55%,#777 55%)}.pe-shoot .ps-kerb{--ps:linear-gradient(#a8b0b8 0 45%,#444 45% 60%,#ccc 60%)}.pe-shoot .ps-wide{--ps:linear-gradient(#ffcf9a 0 40%,#4a5a7a 40% 80%,#333 80%)}
.pe-shoot button{background:#222;color:#f2f2f2;border-color:#000}.pe-shoot button.go{background:#f2f2f2;color:#111}.pe-shoot .pegrid div{border-color:#444}
@media(max-width:520px){.pe-shoot .peframes{grid-template-columns:1fr}.pe .pehd h2{font-size:22px}}
/* the map list and the morning paper column */
#ui .popl{margin:8px 0 0;border:2px solid #000;background:#0b0f0d}
#ui .popl .poplh{display:flex;align-items:center;gap:6px;padding:5px 8px;background:#ffcf3a;color:#111;font-family:'Silkscreen',monospace;font-size:12px}
#ui .popl{display:grid;grid-template-columns:1fr 1fr}#ui .popl .poplh{grid-column:1/-1}@media(max-width:600px){#ui .popl{grid-template-columns:1fr}}
#ui .popr{display:flex;align-items:center;gap:8px;padding:4px 8px;border-top:1px solid #222;font-size:12px}#ui .popr i{width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:#111;border:2px solid #000;flex-shrink:0}
#ui .popr span{flex:1;display:flex;flex-direction:column;min-width:0}#ui .popr small{color:#8aa094}#ui .popr em{font-style:normal;font-size:11px;color:#ffcf3a}#ui .popr.over,#ui .popr.done{opacity:.45}#ui .popr.done em,#ui .popr.over em{color:#8aa094}
#ui .popr button{padding:3px 8px}
.popam{margin:10px 0 0;padding:8px 10px;border:2px dashed currentColor}.popam b{display:block;margin-bottom:4px}.popam div{display:flex;align-items:center;gap:6px;font-size:13px;margin:2px 0}.popam i{width:10px;height:10px;border:1px solid #000;flex-shrink:0}.popam span{opacity:.75}
`;document.head.appendChild(s)})();
try{build()}catch(e){}
})();
