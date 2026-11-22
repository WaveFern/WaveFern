/* ===== v55.33.0: one shared interaction system for placed furniture (global FI) =====
   Before this, only the bed, desk, TV and seats had a prompt (22f, 99, 246). Now every furniture type that has a row in the table J
   below shows a prompt when you stand next to a placed one, through ONE dynInt wrapper. A row is  key: [label, action]  (label is a text
   or q => text; the key is the item type without its colour suffix, so sofa_3 uses 'sofa'). Actions use the same small helpers:
     FI.fx(q, kind)    one pooled particle burst on the item: notes, drops, steam, pop, heart, spark, food
     FI.bounce(q)      a short squash and stretch of the placed model
     FI.lights(q)      toggles every glowing part of the model (lamps, neon, fireplace, lava lamp, jukebox)
     FI.riff(type, n)  a few notes of a scale through sfx()
   Nothing is saved (PL keeps t,x,z,r only), so toggles reset when the house is rebuilt. Seats and the TV keep their own prompts (22f).
   The arcade cabinet and the gaming PC open ARC (252-arcade.js). Add a row to J (or FI.add) to make another item interactive. */
(function(){
const BASE=t=>String(t).replace(/_\d+$/,'');
const PENT=[262,294,330,392,440,523,587,659,784];
const GEO=typeof THREE!='undefined'?new THREE.BoxGeometry(1,1,1):null,MATS={};
const mat=c=>MATS[c]||(MATS[c]=new THREE.MeshBasicMaterial({color:c}));
const KD={notes:{c:['#ff5fb0','#3ad0ff','#ffd23d'],n:6,vy:.8,vx:.3,g:-.1,life:1.3,s:.07},drops:{c:['#6ac8ff'],n:8,vy:-.2,vx:.18,g:2.4,life:.8,s:.05,up:.25},
 steam:{c:['#ffffff'],n:5,vy:.5,vx:.06,g:0,life:1.3,s:.1},pop:{c:['#fffbe8','#ffe8a0'],n:9,vy:2.2,vx:.6,g:5,life:1,s:.06},heart:{c:['#ff5fb0','#ff8ac8'],n:5,vy:.7,vx:.15,g:-.1,life:1.3,s:.08},
 spark:{c:['#ffd23d','#fff8e8'],n:8,vy:1.3,vx:.8,g:2.2,life:.8,s:.05},food:{c:['#ffb06a','#ffd23d'],n:6,vy:0,vx:.1,g:1,life:1,s:.04,up:.1}};
const TOP={};const topOf=t=>TOP[t]!=null?TOP[t]:(TOP[t]=(F[t]&&F[t].b||[]).reduce((m,a)=>Math.max(m,a[5]+a[1]/2),.6));
const FI={rows:{},
 fx(q,kind){if(!q||!q.m||!GEO)return;const k=KD[kind];if(!k)return;const g=new THREE.Group();g.position.y=topOf(q.t)+(k.up||.1);q.m.add(g);
  const ps=[];for(let i=0;i<k.n;i++){const m=new THREE.Mesh(GEO,mat(k.c[i%k.c.length]));m.scale.setScalar(k.s);g.add(m);ps.push({m,x:(Math.random()-.5)*.35,y:0,z:(Math.random()-.5)*.25,vx:(Math.random()-.5)*k.vx*2,vy:k.vy*(.6+Math.random()*.6),vz:(Math.random()-.5)*k.vx,t:-i*.07})}
  let t0=null,done=0;fxAdd(g,n=>{if(done)return;if(t0==null)t0=n;const e=n-t0;let alive=0;ps.forEach(p=>{const t=e+p.t;if(t<0){p.m.visible=false;return}const f=t/k.life;if(f>=1){p.m.visible=false;return}alive=1;p.m.visible=true;
   p.m.position.set(p.x+p.vx*t+Math.sin(t*6+p.vz*9)*.03,p.vy*t-.5*k.g*t*t,p.z+p.vz*t);p.m.scale.setScalar(k.s*(1-f*.7))});
   if(!alive&&e>.3){done=1;if(g.parent)g.parent.remove(g)}})},
 bounce(q){if(!q||!q.m||q.bn)return;q.bn=1;let t0=null;const g=new THREE.Group();q.m.add(g);fxAdd(g,n=>{if(!q.bn)return;if(t0==null)t0=n;const e=(n-t0)/.4;if(e>=1){q.m.scale.y=1;q.m.scale.x=q.m.scale.z=1;q.bn=0;if(g.parent)g.parent.remove(g);return}const s=Math.sin(e*Math.PI*2)*(1-e)*.09;q.m.scale.y=1+s;q.m.scale.x=q.m.scale.z=1-s*.5})},
 lights(q){if(!q||!q.m)return 0;q.off=!q.off;let n=0;q.m.traverse(o=>{const m=o.material;if(m&&m.isMeshBasicMaterial&&!m.transparent){if(!o.userData.c0)o.userData.c0=m.color.clone();if(!o.userData.own){o.material=m.clone();o.userData.own=1}o.material.color.copy(q.off?o.userData.c0.clone().multiplyScalar(.12):o.userData.c0);n++}});return n},
 riff(type,n,gap){n=n||4;let i=ri0(0,PENT.length-1);for(let k=0;k<n;k++){i=Math.max(0,Math.min(PENT.length-1,i+ri0(-2,2)));try{sfx(PENT[i],.28,type||'triangle',.1,null,k*(gap||.13))}catch(e){}}},
 add(keys,row){[].concat(keys).forEach(k=>FI.rows[k]=row)}};
function ri0(a,b){return a+Math.floor(Math.random()*(b-a+1))}
const say2=a=>{try{say(pick(a))}catch(e){}};
const note=(q,type,n,gap)=>{FI.riff(type,n,gap);FI.fx(q,'notes')};
const J={
 arcadecab:['Play arcade',()=>{if(window.ARC)ARC.open()}],
 gamingpc:['Play games',()=>{if(window.ARC)ARC.open()}],
 piano:['Play the piano',q=>{note(q,'triangle',6);FI.bounce(q)}],
 synth:['Jam on the synth',q=>{note(q,'sawtooth',6,.1)}],
 gstand:['Strum the guitar',q=>{note(q,'sawtooth',5,.07);FI.bounce(q)}],
 drums:['Hit the drums',q=>{[0,.14,.28,.42].forEach((d,i)=>{try{sfx(i%2?210:90,.1,'square',.14,i%2?120:45,d)}catch(e){}});FI.fx(q,'spark');FI.bounce(q)}],
 turntable:['Spin a record',q=>{note(q,'sine',5,.18);say2(['The record crackles, then the groove kicks in.','Warm vinyl sound fills the room.'])}],
 vinylshelf:['Browse the records',q=>{FI.fx(q,'notes');snd('pop');say2(['You flip through the records. Great taste in here.','A dusty gem: you put it back for later.'])}],
 jukebox:['Play the jukebox',q=>{note(q,'square',5,.16);FI.bounce(q);say2(S.songs&&S.songs.length?['The jukebox picks one of your songs!','You find your own song in the track list.']:['The jukebox hums into life.','Neon flickers and a classic starts.'])}],
 studiomic:['Sing a line',q=>{note(q,'sine',3,.2);say2(['Check, one two. You sound great.','You hum a hook into the mic.'])}],
 spk1:['Crank it up',q=>{try{sfx(70,.25,'square',.16,40)}catch(e){}FI.bounce(q);FI.fx(q,'notes')}],
 spk2:['Crank it up',q=>{try{sfx(60,.3,'square',.18,35)}catch(e){}FI.bounce(q);FI.fx(q,'notes')}],
 lavalamp:[q=>q.off?'Turn lava lamp on':'Turn lava lamp off',q=>{FI.lights(q);snd('pop')}],
 lamp:[q=>q.off?'Turn lamp on':'Turn lamp off',q=>{FI.lights(q);snd('pop')}],
 tlamp:[q=>q.off?'Turn lamp on':'Turn lamp off',q=>{FI.lights(q);snd('pop')}],
 neonnote:[q=>q.off?'Turn sign on':'Turn sign off',q=>{FI.lights(q);snd('pop')}],
 fireplace:[q=>q.off?'Light the fire':'Put the fire out',q=>{FI.lights(q);snd('pop');if(!q.off)FI.fx(q,'spark')}],
 tank:['Feed the fish',q=>{FI.fx(q,'food');snd('pop');say2(['The fish swarm the flakes.','Blub. They look very pleased.'])}],
 popcorn:['Grab popcorn',q=>{FI.fx(q,'pop');FI.bounce(q);snd('pop');say2(['Fresh, warm, buttery. Yes.','You eat half of it on the way back.'])}],
 espresso:['Make a coffee',q=>{FI.fx(q,'steam');snd('pop');say2(['A perfect shot. Back to work.','Smells amazing. Instant motivation.'])}],
 fridge:['Open the fridge',q=>{FI.bounce(q);snd('pop');say2(['Leftover pizza. Cold, but a classic.','Mostly condiments and one lonely lemon.','A single yoghurt, past its date. You leave it.'])}],
 clock:['Check the time',()=>{snd('pop');say('It is '+(typeof clk=='function'?clk():'time to make music')+'.')}],
 mirror:['Check your look',q=>{FI.fx(q,'spark');snd('pop');say2(['Looking like a future headliner.','Hair: fine. Attitude: great.'])}],
 bin:['Chuck something',q=>{FI.bounce(q);snd('pop');say2(['Two points!','You miss, then pick it up and try again.'])}],
 bench:['Sit down',q=>sitOn(q.x,q.z,q.r)],
 bed1:['Bounce on the bed',q=>{FI.bounce(q);FI.fx(q,'spark');snd('pop')}],bed3:['Bounce on the bed',q=>{FI.bounce(q);FI.fx(q,'spark');snd('pop')}],
 bed:['Bounce on the bed',q=>{FI.bounce(q);FI.fx(q,'spark');snd('pop')}],
 cab1:['Rummage through it',q=>{FI.bounce(q);snd('pop');say2(['Old cables, a harmonica, a tour pass from 2009.','Nothing but spare picks and takeaway menus.'])}],
 cab2:['Rummage through it',q=>{FI.bounce(q);snd('pop');say2(['Plates, a tin of biscuits and a spare mic cable.','Mostly glasses. One has a signature on it.'])}],
 shelf:['Pick out a book',q=>{FI.bounce(q);snd('pop');say2(['"Chord Theory for Humans". You skim a page.','A lyric notebook falls out. Good ideas in here.'])}],
 ward2:['Open the wardrobe',q=>{FI.bounce(q);snd('pop');say2(['A lot of black hoodies. Consistent.','You try a jacket on, then take it off again.'])}],
 'wall print':['Admire the print',q=>{FI.fx(q,'spark');snd('pop')}],
 petbed:['Fluff the pet bed',q=>{FI.fx(q,'heart');FI.bounce(q);snd('pop')}],dogh:['Check the dog house',q=>{FI.fx(q,'heart');snd('pop')}],
 cattree:['Tap the cat tree',q=>{FI.fx(q,'heart');FI.bounce(q);snd('pop')}],perch:['Whistle to the perch',q=>{FI.fx(q,'notes');snd('pop')}],
 pbowl:['Top up the bowls',q=>{FI.fx(q,'food');snd('pop')}],ptoy:['Toss a toy',q=>{FI.fx(q,'heart');FI.bounce(q);snd('pop')}],
 plant:['Water the plant',q=>{FI.fx(q,'drops');FI.bounce(q);snd('pop')}],rubber:['Water the plant',q=>{FI.fx(q,'drops');FI.bounce(q);snd('pop')}],
 monst:['Water the plant',q=>{FI.fx(q,'drops');FI.bounce(q);snd('pop')}],fig:['Water the plant',q=>{FI.fx(q,'drops');FI.bounce(q);snd('pop')}],
 bonsai:['Water the bonsai',q=>{FI.fx(q,'drops');FI.bounce(q);snd('pop')}],
 cactus:['Water the cactus',q=>{FI.fx(q,'drops');snd('pop');say('It did not need that. It is a cactus.')}]};
Object.keys(J).forEach(k=>FI.add(k,J[k]));
window.FI=FI;
/* the one prompt builder: sofas, armchairs, beanbags and the TV already have theirs in 22f */
const SEATR=/sofa|armchair|beanbag|couch|chair/i;
{const di0=dynInt;dynInt=function(){const a=di0.apply(this,arguments);try{if(HIN&&!IN&&mode=='play')for(let i=0;i<PL.length;i++){const q=PL[i];if(Math.abs(P.x-q.x)>2.6||Math.abs(P.z-q.z)>2.6||q.t=='tv')continue;const w=F[q.t];if(w&&SEATR.test(w.n))continue;const row=FI.rows[BASE(q.t)];if(!row||Math.hypot(P.x-q.x,P.z-q.z)>2.6)continue;a.push({x:q.x,z:q.z,r:2.4,l:typeof row[0]=='function'?row[0](q):row[0],a:()=>{const n=performance.now();if(q.fc&&n-q.fc<350)return;q.fc=n;row[1](q)}})}}catch(e){}return a}}
})();
