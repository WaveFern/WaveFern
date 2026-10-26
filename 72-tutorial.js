/* ===== v48.2.0: Big Vee's tips (contextual tutorial; replaces the v26.44 chapter bootcamp) =====
   A brand-new career starts with the bare basics only: walk, pick a stage name, record a song, release it. After that you
   are free, and Big Vee pops up the first time you reach something new (your first DM, the street, a car, a shop, the
   airport, a festival, a tour city, being tired, ...). Tips stay on for the whole first career; the dialogue box has a
   "Tips off" button and the pause menu turns them on or off. There is no progress panel.
   When a tip is about a place, a glowing guide line runs along the ground from you to it (like a Roblox tutorial beam)
   with a bobbing arrow over it. Inside a building the line points to the way out first. On the laptop, the button to
   press is outlined.
   State in S.tut (travels with the save code): {v:2, on, seen:{tip key:1}, f:{flags}, g:gift given, goal, gb}.
   Old saves: a v26.44 tutorial left halfway carries on as tips (basics you already did are skipped); a finished or
   skipped one stays off. One-time gift: TUT_GIFT dollars (cheapest gear is $120 headphones, cheapest clothes ~$12). */
const TUT_GIFT=150,VEE='Big Vee';
const TUT_LAP=/laptop/i,TUT_BED=/sleep/i,TUT_PC=k=>`[ondblclick^="app='${k}'"],[onclick^="app='${k}'"]`;
const gearSum=()=>Object.values(S.gear||{}).reduce((a,v)=>a+(+v||0),0);
let TUTM=null,TUTG=null,TD=null,TUTPAN=null,TUTBUB=null,TUTLAST=0,TUTPOS=null;
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
#tdlg{position:fixed;left:50%;bottom:112px;transform:translateX(-50%);width:min(580px,calc(100vw - 24px));box-sizing:border-box;z-index:61;display:flex;gap:10px;background:#0b0f0df0;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008;padding:10px;cursor:pointer;animation:tdIn .25s ease-out}
@keyframes tdIn{from{transform:translate(-50%,20px);opacity:0}to{transform:translateX(-50%);opacity:1}}
#tdlg img{width:64px;height:64px;image-rendering:pixelated;border:3px solid #000;box-shadow:0 0 0 2px #2fe68a66;flex:none;background:#2a4a38}
#tdlg .td1{font-family:Silkscreen,ui-monospace,monospace;color:var(--g);font-size:12px;margin-bottom:3px}#tdlg .td2{font-size:14px;line-height:1.4;min-height:2.8em}#tdlg .td3{position:absolute;right:10px;bottom:5px;color:#ffd27a;font-size:11px;animation:tutP2 .6s infinite alternate}
#tdlg .tdsk{position:absolute;right:8px;top:6px;padding:1px 6px;font-size:11px;min-width:0;box-shadow:inset 0 -2px #0007}
#tdlg.drv{left:12px;right:236px;width:auto;transform:none;animation:none}
@media (max-width:700px){#tdlg.drv{right:12px;left:12px;bottom:200px}#tdlg img{width:48px;height:48px}#tdlg{bottom:104px}#tdlg .td2{font-size:13px}}
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
 let el=$('tdlg');if(!el){el=document.createElement('div');el.id='tdlg';el.onclick=tutAdv;el.innerHTML=`<img src="${tutPic()}"><div style="flex:1"><div class=td1>${VEE.toUpperCase()}</div><div class=td2></div></div><span class=td3>click &#9660;</span>${tutOn()?'<button class=tdsk onclick="event.stopPropagation();tutEnd()">Tips off</button>':''}`;document.body.appendChild(el)}
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
/* ----- tips -----
   b: one of the basics (shown in order, each waits for the last one's goal). when: the moment it is useful.
   go: an optional goal: w = an interaction label to point at, at() = a spot, hl() = a laptop / menu element to outline,
   done(base) = finished, t = seconds before an unfinished goal is dropped (basics never drop). */
const famL=()=>{try{return typeof fameLv=='function'?fameLv():0}catch(e){return 0}};
const inAp=()=>!!IN&&typeof AX!='undefined'&&IN.x>=AX-10&&IN.x<AX+200;
const tkt=()=>{try{return((S.travel||{}).tickets||[]).some(t=>t.st=='booked')}catch(e){return false}};
const AP_DOOR={x:-328.4,z:20};
const TIPS=[
 {k:'move',b:1,l:['Yo, new blood! Big Vee. Your manager, hype man and landlord\'s worst nightmare.','WASD to walk, hold Shift to sprint. E uses whatever you are standing next to.'],
  go:{done:b=>Math.hypot(P.x-b.x,P.z-b.z)>4}},
 {k:'name',b:1,skip:()=>!!S.artist,l:['Every legend needs a name. Mine was DJ Gravy. Do not ask.','Use the laptop (E), open Spotifly and pick your artist name. Follow the line.'],
  go:{w:TUT_LAP,hl:()=>!S.artist&&mode=='pc'&&app!=1?TUT_PC(1):null,done:()=>!!S.artist}},
 {k:'record',b:1,skip:()=>S.songs.length+S.drafts.length>0,l:['Now we cook. The mic is in your studio: pick a genre, then three quick games.','Beat, Lyrics, Mix. It costs 15 energy, so do not be precious.'],
  go:{w:/^Record a song/,done:b=>S.drafts.length>b.d||S.songs.length>b.s}},
 {k:'release',b:1,skip:()=>S.songs.length>0,l:['Do not sit on heat. Laptop, Spotifly, Upload.','Every night your streams pay out, and listeners grow your fame.'],
  go:{w:TUT_LAP,hl:()=>mode=='pc'?(app!=1?TUT_PC(1):`button[onclick*="pg='upload'"]`):null,done:b=>S.songs.length>b.s}},
 {k:'free',b:1,l:['That is the basics: record, release, sleep, spend, grow.','The rest is up to you. I will pop up when you run into something new.'],dm:['Yo, it is Big Vee. Tips will keep coming while you find your feet. Turn them off from the pause menu if you want.']},
 /* contextual */
 {k:'tired',when:()=>mode=='play'&&(S.energy<25||S.t>=300),l:['You are running on fumes. Your bed (E) ends the day, and your streams pay out when you wake.','A day is 12 minutes: 6 light, 6 dark. Stay up past 06:00 and you pass out.'],
  go:{w:TUT_BED,done:b=>S.day>b.day,t:240}},
 {k:'dm',when:()=>(S.msgs||[]).some(m=>!m.g&&m.unread),l:['Someone slid into your DMs. Check Messages on the laptop.','If THEY ask for a collab, they pay you. If YOU ask, you pay their fee. Haggle in plain words, like "how about 150".'],
  go:{w:TUT_LAP,hl:()=>mode=='pc'&&app!='msg'?TUT_PC('msg'):null,done:()=>S.tut.f.msg,t:180}},
 {k:'gear',when:()=>S.songs.length>0&&gearSum()==0&&S.money>=120,l:['Better gear makes better mixes and more streams.','The Gearshop on the laptop has headphones for $120. Treat yourself.'],
  go:{w:TUT_LAP,hl:()=>mode=='pc'?(app!='gear'?TUT_PC('gear'):`button[onclick="buy('phones')"]`):null,done:b=>gearSum()>b.g,t:180}},
 {k:'wear',when:()=>S.tut.f.buy&&!S.tut.f.wear,l:['New drip? Do not leave it in the bag. The wardrobe is in your bedroom.'],go:{w:/wardrobe/i,done:()=>S.tut.f.wear,t:180}},
 {k:'street',when:()=>mode=='play'&&!IN&&!HIN&&P.z>13,l:['The street! Shops, Motors and the Pet Shop are all around here.','Press N for the map. The city is way east: walk, drive, or grab a taxi from the map.']},
 {k:'shop',when:()=>mode=='play'&&!!IN&&!inAp()&&!(typeof ANX!='undefined'&&IN.i==ANX.idx),l:['Inside a building, walk up to things and press E. The door gets you back out.']},
 {k:'drive',when:()=>mode=='drive',l:['W goes, S brakes, A and D steer. Set your pace in the speed box. E gets you out.']},
 {k:'phone',when:()=>mode=='play'&&S.day>=2&&!S.noPhone,l:['Press G for your phone: Messages, Instagrime and a camera on the go.']},
 {k:'fame',when:()=>famL()>=1,l:['Fame Level up! It climbs with monthly listeners and unlocks gear, homes and festival stages.']},
 {k:'save',when:()=>S.day>=3,l:['The game autosaves, but keep a save code as a backup: Esc, Settings, Get save code.','Paste it into any browser to carry on.'],
  go:{hl:()=>$('stg')?($('sc')?'#stg button[onclick*=saveCode]':'#stt button[data-t=save]'):$('pzm')?'#pzm button[onclick="settings()"]':null,done:()=>S.tut.f.code,t:300}},
 {k:'fest',when:()=>famL()>=10,l:['Fame Level 10 gets you on the Park Fields Festival line-up. It runs every 7th day.','Book a slot in FestivalApp on the laptop, two or more days ahead.'],
  go:{w:TUT_LAP,hl:()=>mode=='pc'&&app!='fest'?TUT_PC('fest'):null,done:()=>S.tut.f.fest,t:180}},
 {k:'field',when:()=>mode=='play'&&!IN&&typeof FEST!='undefined'&&FEST.ph&&P.x>FEST.X0&&P.x<FEST.X1&&P.z>FEST.Z0&&P.z<FEST.Z1,
  l:['Welcome to Park Fields. The site manager knows the line-up and the slots.','On your day, walk up to your stage and play your set.'],go:{at:()=>({x:232,z:FEST.GZ-9.4}),done:b=>Math.hypot(P.x-232,P.z-(FEST.GZ-9.4))<3,t:120}},
 {k:'flight',when:()=>mode=='play'&&tkt()&&!IN,l:['Flight booked! Planes leave from Fernfield International, far west of town.','Taxi there from the map (N) or drive. Follow the line and be there before boarding opens.'],
  go:{at:()=>AP_DOOR,done:()=>inAp(),t:600}},
 {k:'airport',when:()=>mode=='play'&&!IN&&P.x<-300,l:['This is Fernfield International. In through the front doors.','Inside: the Swiftwing desk for tickets and check-in, then security, then your gate.'],go:{at:()=>AP_DOOR,done:()=>inAp(),t:120}},
 {k:'terminal',when:()=>mode=='play'&&inAp(),l:['Check in at the Swiftwing desk (or in the app), go through security, then wait at your gate.','Boarding opens 2 hours before take-off. Miss it and the seat is gone.'],go:{w:/Swiftwing desk/,done:b=>!inAp(),t:90}},
 {k:'abroad',when:()=>mode=='play'&&!!(window.DCITY&&DCITY.on),l:['New city, new crowd! Walk around, find your venue and play your show.','When you are done, fly home from this city\'s airport.']},
 {k:'upstairs',when:()=>mode=='play'&&!!IN&&typeof ANX!='undefined'&&IN.i==ANX.idx,l:['Your new floor! Press F up here to place furniture, and paint the rooms with tins from Amazoom.']}
];
function tutOn(){const T=S.tut;return!!(T&&T.on&&T.v==2)}
function tutBase(){return{x:P.x,z:P.z,d:S.drafts.length,s:S.songs.length,g:gearSum(),day:S.day}}
function tutShow(t){const T=S.tut;T.seen[t.k]=1;TUTLAST=Date.now();(t.dm||[]).forEach(tutDM);
 if(t.go){T.goal=t.k;T.gb=tutBase();T.gt=Date.now()}
 const o=tutTgt();if(o){const d=Math.hypot(o.x-P.x,o.z-P.z);if(d>5&&d<90)TUTPAN={x:o.x,z:o.z,t:performance.now()}}
 tutSay(t.l)}
function tutDone(t){const T=S.tut;T.goal=null;T.gb=null;tutClr();snd('chime');tutBub(['Sick!','Now we cooking.','That is the stuff.','Look at you go.','Legend behaviour.'][Math.random()*5|0]);
 if(t.b)tutBurst(innerWidth/2,innerHeight-150,30)}
function tutStart(){const o=S.tut||{};S.tut={v:2,on:1,seen:{},f:{},g:o.g||0,goal:null};
 if(!S.tut.g){S.tut.g=1;S.money=+(S.money+TUT_GIFT).toFixed(2);say('🎁 Big Vee gave you $'+TUT_GIFT+' for gear and clothes')}TUTLAST=0}
function tutEnd(){if(!S.tut)return;S.tut.on=0;S.tut.goal=null;tutClr();tutSayEnd(1);say('Tips off. Turn them back on from the pause menu.')}
function tutClr(){document.querySelectorAll('.tutHL').forEach(e=>e.classList.remove('tutHL'))}
const tutTip=k=>TIPS.find(t=>t.k==k);
function tutPoll(){if(!tutOn()){tutClr();return}const T=S.tut;T.seen=T.seen||{};T.f=T.f||{};
 if(mode=='pc'){if(app=='msg')T.f.msg=1;if(app=='fest')T.f.fest=1}
 const sc=$('sc');if(sc&&/^FW\d-/.test(sc.value))T.f.code=1;
 /* the goal in progress */
 const g=T.goal&&tutTip(T.goal);
 if(g){const b=T.gb||tutBase();if(g.go.done(b)){tutDone(g);return}if(g.go.t&&Date.now()-(T.gt||0)>g.go.t*1000){T.goal=null;tutClr()}}
 const sel=g&&g.go.hl?g.go.hl():null;document.querySelectorAll('.tutHL').forEach(e=>{if(!sel||!e.matches(sel))e.classList.remove('tutHL')});if(sel)document.querySelectorAll(sel).forEach(e=>e.classList.add('tutHL'));
 /* the next tip: the next basic first (once the last basic's goal is done), then anything new you have just run into */
 if(TD||!tutOK()||Date.now()-TUTLAST<(T.goal?20000:6000))return;
 const nb=TIPS.find(t=>t.b&&!T.seen[t.k]);
 if(nb){if(T.goal&&tutTip(T.goal).b)return;if(nb.skip&&nb.skip()){T.seen[nb.k]=1;return}return tutShow(nb)}
 const c=TIPS.find(t=>!t.b&&!T.seen[t.k]&&(!t.go||!T.goal)&&t.when());if(c)tutShow(c)}
setInterval(()=>{try{tutPoll()}catch(e){}},250);
/* where the goal is: an interaction (by label) or a spot. Inside a building, a spot outside it points to the way out. */
function tutTgt(){if(!tutOn())return null;const T=S.tut,g=T.goal&&tutTip(T.goal);if(!g||!g.go||(mode!='play'&&mode!='drive'))return null;
 let o=null;if(g.go.at)o=g.go.at();else if(g.go.w){o=INT.find(q=>g.go.w.test(q.l||''));if(!o)try{o=dynInt().find(q=>g.go.w.test(q.l||''))}catch(e){}}
 if(!o)return null;
 const inBox=(x,z)=>IN&&x>=IN.x-1&&x<=IN.x+(IN.w||10)+1&&z>=319&&z<=320+(IN.d||8)+1;
 if(IN&&!inBox(o.x,o.z)){let ex=null,bd=1e9;INT.concat((()=>{try{return dynInt()}catch(e){return[]}})()).forEach(q=>{if(/^(Leave|Go downstairs|Exit)/.test(q.l||'')&&inBox(q.x,q.z)){const d=Math.hypot(q.x-P.x,q.z-P.z);if(d<bd){bd=d;ex=q}}});o=ex}
 else if(!IN&&o.z>300&&o.x>700)o=null;
 return o?{x:o.x,z:o.z}:null}
/* the guide line: a flat glowing ribbon of chevrons on the ground from you to the goal, scrolling towards it */
function tutBeam(){if(TUTG)return TUTG;const c=document.createElement('canvas');c.width=64;c.height=32;const x=c.getContext('2d');
 x.fillStyle='rgba(47,230,138,.45)';x.fillRect(0,7,64,18);x.strokeStyle='#ffd27a';x.lineWidth=6;x.lineCap='square';x.beginPath();x.moveTo(18,5);x.lineTo(34,16);x.lineTo(18,27);x.stroke();
 x.strokeStyle='#2fe68a';x.lineWidth=3;x.beginPath();x.moveTo(18,5);x.lineTo(34,16);x.lineTo(18,27);x.stroke();
 const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false,depthWrite:false}));m.rotation.x=-Math.PI/2;m.renderOrder=998;
 const g=new THREE.Group();g.add(m);g.userData={m,t};scene.add(g);return TUTG=g}
{const u0=update;update=function(dt){u0(dt);try{const o=tutTgt();
 if(!TUTM&&o){TUTM=new THREE.Mesh(new THREE.ConeGeometry(.4,.8,4),new THREE.MeshBasicMaterial({color:0xffc400,depthTest:false,transparent:true}));TUTM.rotation.x=Math.PI;TUTM.renderOrder=999;scene.add(TUTM)}
 if(TUTM){TUTM.visible=!!o;if(o){TUTM.position.set(o.x,2.1+Math.sin(tt*4)*.18,o.z);TUTM.rotation.y+=dt*2}}
 const px=mode=='drive'&&typeof dr!='undefined'&&dr?dr.x:P.x,pz=mode=='drive'&&typeof dr!='undefined'&&dr?dr.z:P.z;
 const dx=o?o.x-px:0,dz=o?o.z-pz:0,L=Math.hypot(dx,dz);
 if(o&&L>2.2){const g=tutBeam(),s=.7,e=1.1,len=L-s-e,ux=dx/L,uz=dz/L;g.visible=true;g.position.set(px+ux*(s+len/2),.07,pz+uz*(s+len/2));g.rotation.y=Math.atan2(-dz,dx);
  g.userData.m.scale.set(len,.7,1);g.userData.t.repeat.set(len/.9,1);g.userData.t.offset.x-=dt*1.6}
 else if(TUTG)TUTG.visible=false;
 const p=TUTPAN;if(p){const e=(performance.now()-p.t)/1000,L2=2.6;if(e>=L2||mode!='play'||IN)TUTPAN=null;else{const w=.85*Math.min(1,e/.5,(L2-e)/.9),x=camT.x+(p.x-camT.x)*w,z=camT.z+(p.z-camT.z)*w;cam.position.set(x+16,13,z+16);cam.lookAt(x,.8,z)}}}catch(e){}}}
/* detection wrappers */
{const b0=buyG;buyG=function(id){const n=S.wr.length;const r=b0.apply(this,arguments);if(S.tut&&S.tut.f&&S.wr.length>n)S.tut.f.buy=1;return r}}
{const w0=wearG;wearG=function(){const r=w0.apply(this,arguments);if(S.tut&&S.tut.f){S.tut.f.wear=1;S.tut.wore=1}return r}}
/* new game: the basics start straight away (no accept pop-up) */
{const c0=confirmChar;confirmChar=function(){c0.apply(this,arguments);closeUI();tutStart()}}
/* loading a save: clear what was on screen. A v26.44 tutorial left halfway becomes tips (basics already done are skipped);
   a finished or skipped one, or none, stays off. */
{const lc=loadCode;loadCode=function(){const r=lc.apply(this,arguments);try{tutSayEnd(1);TUTPAN=null;tutClr();TUTLAST=Date.now();
 const T=S.tut;if(T&&T.v!=2){const on=!!(T.on&&!T.done);S.tut={v:2,on:on?1:0,seen:{},f:{},g:T.g||0,goal:null};
  if(on){const s=S.tut.seen;s.move=1;if(S.artist)s.name=1;if(S.songs.length+S.drafts.length)s.record=1;if(S.songs.length){s.release=1;s.free=1}}}
 else if(T&&T.goal&&!tutTip(T.goal))T.goal=null}catch(e){}return r}}
/* pause menu: tips on / off */
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(m){const b=document.createElement('button');b.textContent=tutOn()?'Tips: on':'Tips: off';
 b.onclick=()=>{if(tutOn())tutEnd();else{if(!S.tut||S.tut.v!=2)tutStart();else S.tut.on=1;say('Tips on. Big Vee will pop up when you find something new.')}b.textContent=tutOn()?'Tips: on':'Tips: off'};m.appendChild(b)}}}
