/* ===== v49.29.0: the band trailer (wavefern.com/?trailer=band) =====
   A second trailer, 64 seconds, made for YouTube: multiplayer band rooms. It runs on the trailer mode in 175-trailer.js
   (same pointer, cards, captions, cameras and end card) with its own track (assets/trailer-band.mp3, 120 BPM): the drop at 0:16, black as it stops at 0:48 and the end card on its last bit at 0:56.
   The band room is played with no network: 161-multiplayer.js sets up a room (FERN5, The Ferns) with no sign-in, and three
   made-up bandmates (Kai on guitar, Mila on drums, Theo on bass) stand, walk and play next to you through the real band code:
   their name tags, the band panel, the four instrument minigames, emotes, the bunk beds, the band's Spotifly account and a band set
   at the festival. In the minigame shots the camera follows whoever is playing, so each one is a bandmate's
   own screen. wavefern.com/mtrailer (or ?trailer=band) plays it; add ?menu for the scene menu. Nothing is saved, as in the main trailer. */
if(TRL.on&&window.MPT){
const BM=MPT,BEAT=TRL.BEAT,BAR=TRL.BAR;
/* v49.31.0: the band trailer has its own song, made for it: 120 BPM, the drop at 0:16 and the stop at 0:48 */
Object.assign(TRL,{band:1,MO:0,DROP:16,song:'Neon Rain',SRC:'assets/trailer-band.mp3'});
/* the band: you sing, and the camera can follow any of them */
const BAND=[{id:'me',nm:'Sky',inst:'vo',look:{skin:5,eyes:0,mouth:0,hair:1,hc:0,top:1,tc:0,pc:6,body:.4,hgt:.5}},
 {id:'b1',nm:'Kai',inst:'gt',look:{skin:1,eyes:4,mouth:3,hair:3,hc:7,top:2,tc:6,pc:4,body:.5,hgt:.7}},
 {id:'b2',nm:'Mila',inst:'dr',look:{skin:3,eyes:1,mouth:2,hair:7,hc:5,top:0,tc:9,pc:0,body:.3,hgt:.4}},
 {id:'b3',nm:'Theo',inst:'bs',look:{skin:4,eyes:0,mouth:1,hair:9,hc:0,top:3,tc:3,pc:5,body:.7,hgt:.6}}];
const BB={pov:'vo',place:'studio',em:{}};
/* the camera follows the band member who plays k: they become the player, and you become a bandmate */
function bPov(k){BB.pov=k;const me=BAND.find(b=>b.inst==k);ch=JSON.parse(JSON.stringify(me.look));try{refresh()}catch(e){}
 BM.inst(k);for(const id in BM.MB)if(id!='me')delete BM.MB[id];
 /* the bandmates' figures are rebuilt where they stand, so nobody slides across the room between shots */
 for(const id in BM.AV){scene.remove(BM.AV[id].g);delete BM.AV[id]}
 BAND.filter(b=>b!==me).forEach((b,i)=>{BM.MB['b'+(i+1)]={id:'b'+(i+1),nm:b.nm,inst:b.inst,look:b.look,x:P.x,z:P.z,r:0,zone:'none',where:'Studio',studio:1,stg:0,rd:null}})}
/* stage spots: the band's own, with the drummer a step to the side so the festival's camera behind you sees you past them */
const OFF=Object.assign({},BM.STOFF,{dr:[1,-1.4]});
/* studio spots: the band's own, with bass a step back so guitar and bass never overlap from the game's camera */
const STUD=Object.assign({},BM.SPOT,{gt:[14,2.2,Math.PI],bs:[15.2,4.4,Math.PI/2]});
const mates=()=>Object.values(BM.MB).filter(m=>m.id!='me');
/* where the bandmates stand: at their instruments, walking behind you, by the bunks, or on stage around you */
function bPlace(){const pl=BB.place,L=mates(),z=BM.ME.zone||'o';
 L.forEach((m,i)=>{m.zone=pl=='off'?'none':z;
  if(pl=='studio'){const s=STUD[m.inst];m.x=s[0];m.z=s[1];m.r=s[2]}
  /* the drop shot: in a row by their instruments, facing the camera */
  else if(pl=='front'){const s={dr:[10.9,3.2],gt:[13.6,2.6],bs:[14.9,3.3],vo:[12.2,2.3]}[m.inst];m.x=s[0];m.z=s[1];m.r=Math.PI}
  else if(pl=='follow'){const o=[[-1.3,-.9],[-1.4,.9],[-2.6,0]][i],r=P.rot;m.x=P.x+Math.sin(r)*o[0]+Math.cos(r)*o[1];m.z=P.z+Math.cos(r)*o[0]-Math.sin(r)*o[1];m.r=r}
  else if(pl=='bunks'){const o=[[3,1.3,1.4],[3,4.7,1.75],[3.4,3.6,1.6]][i];m.x=o[0];m.z=o[1];m.r=o[2]}
  else if(pl=='stage'){const a=OFF[m.inst],b=OFF[BB.pov],ox=a[0]-b[0],oz=a[1]-b[1],r=P.rot||0;m.x=P.x+ox*Math.cos(r)+oz*Math.sin(r);m.z=P.z-ox*Math.sin(r)+oz*Math.cos(r);m.r=r}
  else if(pl=='street'){const o=[[1.2,-.4,-Math.PI/2],[-1.2,-.3,Math.PI/2],[0,-1.2,0]][i];m.x=P.x+o[0];m.z=P.z+o[1];m.r=o[2]}});
 /* a name is enough over a head in a trailer: the instrument shows in the shot (the game's tags read Name · Instrument) */
 if(typeof NTAG!='undefined')NTAG.list.forEach(t=>{const x=t.el.textContent;if(x.includes(' · '))t.el.textContent=x.split(' · ')[0]});
 /* on a shot's first frames they are already in place (the game's figures glide to where a player is, which would slide them through each other) */
 if(BB.si!==TRL.i){BB.si=TRL.i;BB.sn=0}if(BB.sn++<3)L.forEach(m=>{const a=BM.AV[m.id];if(a)a.g.position.set(m.x,0,m.z)});
 /* on a stage they stand on its floor, as you do (an emote's hop is on top of that) */
 const y=pl=='stage'&&P.mesh?P.mesh.position.y:0;for(const id in BM.AV){const g=BM.AV[id].g;g.position.y=(BM.AV[id].em?g.position.y:0)+y}
 /* a bandmate's emote, on cue */
 const a=BM.AV;for(const id in BB.em){const e=BB.em[id];if(e.done||TRL.T<e.at||!a[id]||!a[id].g.visible)continue;e.done=1;a[id].em={k:e.k,t:0};BM.emFloat(a[id].g,e.k)}}
function bEm(L){BB.em={};L.forEach(([id,k,at])=>{BB.em[id]={k,at:TRL.T+at}})}
/* the band's own Spotifly account: the drawn picture shows all four */
function bAccount(){S.artist='The Ferns';S.mp=Object.assign(S.mp||{},{code:'FERN5',inst:BB.pov,band:'The Ferns',host:1,seen:['vo','gt','dr','bs'],mem:{}});BAND.forEach(b=>S.mp.mem[b.inst]={nm:b.nm,look:b.look})}
function bSetup(){bPov('vo');bAccount();try{buildStudio()}catch(e){}}
/* a band take on the minigame of instrument k, started at its first beat */
function bRec(k){trlClear();bPov(k);bAccount();S.t=200;S.energy=100;const s=STUD[k];trlPut(s[0],s[1],s[2]);BB.place='studio';
 BM.rec(k,0);trlPut(s[0],s[1],s[2]);if(P.mesh)P.mesh.position.set(P.x,0,P.z);if(!rec)return;try{mgStage(1)}catch(e){}rec.wait=0;rec.cdn=0;rec.cgo=0;const g=rec.ig;BB.lt=0;
 if(g){if(g.k=='dr')g.t=1.05;if(g.k=='gt'){g.R[0]=[0,2,1];g.lt=1.25}if(g.k=='bs')g.t=1.7;if(g.k=='ky')g.lt=0}}
/* a good player on each instrument */
function bPlay(){if(mode!='rec'||!rec)return;const g=rec.ig;if(!g)return;
 if(g.k=='dr')g.N.forEach(n=>{if(!n.h&&g.t>=n.at-.012)mpIg(n.l)});
 else if(g.k=='gt'){if(g.ph=='play'&&TRL.T-BB.lt>.2){BB.lt=TRL.T;mpIg(g.R[g.r][g.i])}}
 else if(g.k=='bs'){for(let j=g.lead;j<g.lead+g.n;j++)if(g.res[j-g.lead]==null&&g.t>=g.t0+j*g.bp-.01){mpIg(0);break}}
 else if(g.k=='ky'){if(g.lt>.28)mpIg(g.cur)}}
function bStage(n){trlClear();trlFestDay();bPov('vo');S.t=392;S.energy=100;const s=FSTG.find(q=>q.n==n);if(s)trlPut(s.ix,s.iz,0);BB.place='stage';
 try{BM.fest({n,slot:3,songs:S.songs.slice(-4).map(x=>x.id)})}catch(e){console.error(e)}}

/* the camera shots inside the house get a real room: the game's walls are cut down so you can see in from above, so the
   room is closed with full walls and a ceiling (the room's own colours), with a few things on the walls. They go with the shot (TRL.wall) */
function bSign(t,w,h,bg,fg){const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);
 x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';let f=c.height*.5;x.font='bold '+f+'px Silkscreen,monospace';while(x.measureText(t).width>c.width*.86&&f>10){f--;x.font='bold '+f+'px Silkscreen,monospace'}
 x.fillText(t,c.width/2,c.height/2);const tx=new THREE.CanvasTexture(c);return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx}))}
function bRoom(k){if(TRL.wall){scene.remove(TRL.wall)}const g=TRL.wall=new THREE.Group(),H=3.6;scene.add(g);
 if(k=='studio'){const wc='#5a4a6a';
  B(g,8.3,H,.2,wc,12,H/2,6.05);B(g,.2,H,6.2,wc,7.95,H/2,3);B(g,.2,H,6.2,wc,16.05,H/2,3);B(g,8.4,.2,6.4,'#2a2530',12,H+.1,3);
  B(g,8.2,.18,.06,'#3a3044',12,.09,5.93);
  /* acoustic foam on the back wall, a band poster, an ON AIR light and a warm lamp */
  for(let i=0;i<5;i++)for(let j=0;j<3;j++)B(g,.55,.55,.1,(i+j)%2?'#2b2b33':'#34343e',9.2+i*.62+(i>2?3.2:0),1.25+j*.62,5.9);
  const pst=bSign('THE FERNS',1.5,.9,'#2fe68a','#06210f');pst.position.set(12.7,2,5.93);pst.rotation.y=Math.PI;g.add(pst);
  const oa=bSign('ON AIR',.9,.32,'#2a0b0e','#ff4455');oa.position.set(12.7,3.05,5.93);oa.rotation.y=Math.PI;g.add(oa);
  const L=new THREE.PointLight(0xffc89a,.6,10);L.position.set(12.4,3,2.6);g.add(L)}
 else if(k=='bedroom'){const wc='#7a6a8a';
  B(g,.2,H,6.2,wc,-.05,H/2,3);B(g,8.3,H,.2,wc,4,H/2,-.05);B(g,8.3,H,.2,wc,4,H/2,6.05);B(g,.2,H,6.2,wc,8.05,H/2,3);B(g,8.4,.2,6.4,'#3a3346',4,H+.1,3);
  const pst=bSign('THE FERNS',1.3,.8,'#2fe68a','#06210f');pst.position.set(.08,2.1,3);pst.rotation.y=Math.PI/2;g.add(pst);
  const L=new THREE.PointLight(0xffc080,.5,9);L.position.set(4,3,3);g.add(L)}}
const trlShots0=trlShots;
trlShots=function(){const M={};trlShots0().forEach(s=>M[s.sc]=s);const b=BEAT,B=BAR;
 const L=[
 {sc:'Card: friends',d:4,pre:1,card:'MUSIC HITS DIFFERENT<br>WITH FRIENDS.'},
 /* the real Multiplayer menu: Your rooms, then Create a room, typed in by the pointer */
 {sc:'Create a room',d:4,pre:1,cap:'1|START A BAND',show:['ui'],set(){mpRooms()},
  acts:[[.15,()=>trlClick(()=>trlQ('#ui button',/^Create a room$/),.55)],[1.05,()=>{const y=$('mpyn');if(y)y.value='Sky';trlClick(()=>$('mpbn'),.4,e=>e.focus())}],[1.55,()=>trlType(()=>$('mpbn'),'The Ferns')],
   [2.7,()=>trlClick(()=>trlQ('#ui .mpins button',/Vocals/),.4)],[3.3,()=>trlClick(()=>trlQ('#ui button',/^Create room$/),.4,()=>{})]]},
 /* your friend's screen: the room code, then an instrument nobody has yet */
 {sc:'Join a room',d:4,pre:1,cap:'2|FRIENDS JOIN WITH A CODE',show:['ui'],set(){mode='title';mpJoinUI()},
  acts:[[.2,()=>trlClick(()=>$('mpcd'),.4,e=>e.focus())],[.7,()=>trlType(()=>$('mpcd'),'FERN5')],[1.45,()=>trlClick(()=>trlQ('#ui button',/^Find room$/),.35,()=>BM.join('FERN5',{band:'The Ferns',n:2,taken:['vo']}))],
   [2.35,()=>trlClick(()=>trlQ('#ui .mpins button',/Guitar/),.4)],[2.85,()=>{const y=$('mpyn');if(y)y.value='';trlClick(()=>$('mpyn'),.25,e=>{e.focus();trlType(()=>$('mpyn'),'Kai')})}],
   [3.45,()=>trlClick(()=>trlQ('#ui button',/^Join the band$/),.35,()=>{})]]},
 /* a word every two beats into the drop; the band's career is set up behind the card */
 {sc:'Card: four',d:4,card:'<span>UP TO</span><br><span>4 PLAYERS.</span><br><span>ONE</span> <span>BAND.</span>',
  tick(){const k=Math.floor((TRL.T-this.t)/(2*BEAT)+1e-3);document.querySelectorAll('#trlblk .qcard span').forEach((e,i)=>e.style.visibility=i<=k?'visible':'hidden')},
  acts:[[.1,()=>{try{trlFresh();trlName()}catch(e){}}],[3.55,()=>{try{trlStar();bSetup();trlStage(4);trlClear()}catch(e){console.error(e)}}]]},
 /* the drop: the whole band in the studio, each at their instrument with their name over their head */
 {sc:'Band studio',d:2*B,drop:1,show:[],place:'front',set(){trlClear();bRoom('studio');bPov('vo');bAccount();S.t=200;const s=BM.SPOT.vo;trlPut(s[0],s[1],s[2]);
   bEm([['b1','guitar',.4],['b2','cheer',1.6],['b3','dance',.9]])},
  cam:trlCam([[12.4,3.3,.3],[12.8,.8,4],70],[[12.8,2.5,.4],[12.9,1,3.7],62],trlE.o)},
 /* the band panel: three of four ready, then you */
 {sc:'Band ready',d:B,show:['mpb'],place:'studio',zoom:6,pz:['mpb',1.55,1.7,'0% 100%'],set(){trlClear();bPov('vo');S.t=200;trlPut(12.6,3.4,0);
   mates().forEach((m,i)=>m.rd={k:'rec',g:0,title:TRL.song,ts:i+1})},
  acts:[[.45,()=>trlClick(()=>trlQ('#mpb button',/Ready to record/),.85)]]},
 /* everyone plays their part: each bandmate's own minigame */
 {sc:'Drums',d:B,cap:'DRUMS',show:['ui','hud','mg'],place:'studio',zoom:5,set(){bRec('dr')},tick:bPlay},
 {sc:'Guitar',d:B,cap:'GUITAR',show:['ui','hud','mg'],place:'studio',zoom:5,set(){bRec('gt')},tick:bPlay},
 {sc:'Bass',d:B,cap:'BASS',show:['ui','hud','mg'],place:'studio',zoom:5,set(){bRec('bs')},tick:bPlay},
 {sc:'Vocals',d:B,cap:'VOCALS',show:['ui','hud','mg'],place:'studio',zoom:5,set(){bRec('vo')},acts:[[.15,trlLyr],[1.05,trlLyr]]},
 /* out in town together */
 {sc:'Band walk',d:B,walk:1,show:[],place:'follow',set(){trlClear();bPov('vo');S.t=272;trlPut(44,14.2,Math.PI/2);trlPath(30);trlKeys('ds')},cam:u=>{const x=P.x;return{p:[x+4.6,1.5,18.8],l:[x-1.3,1.1,14.3],f:44}}},
 {sc:'Emotes',d:B,show:[],place:'street',zoom:5,set(){trlClear();bPov('vo');S.t=276;trlPut(56,14.2,0);trlPath(12);
   bEm([['b1','cheer',.05],['b2','dance',.3],['b3','heart',.55]])},tick(){trlPath(10)},acts:[[.15,()=>{try{emPick('dance')}catch(e){}}]]},
 /* one house: bunk beds for the band */
 {sc:'Bunk beds',d:B,show:[],place:'bunks',set(){trlClear();bRoom('bedroom');bPov('vo');S.t=200;trlPut(3.4,2.4,1.55);bEm([['b3','wave',.2]])},
  cam:trlCam([[7.6,2.5,3.2],[1,1.1,3],58],[[7.1,2.2,3],[1,1.1,3],54],trlE.s)},
 /* one Spotifly account for the band, its picture drawn with all four of you */
 {sc:'Band Spotifly',d:B,show:['ui'],place:'off',set(){trlClear();bAccount();openPC();app=1;smo=0;pg='home';pcR()},pz:['pc',1.12,1.22,trlNums],tick(u){trlCount(Math.min(1,u/.95),{'monthly listeners':[4800,1200000],followers:[60,310000],fame:[4,120]})}},
 /* a band set: the smaller stage, then the Main Stage, the band around you */
 {sc:'Festival: The Pit',d:2*b,show:[],place:'stage',set(){bStage(3)},tick(){trlCrowd(600)}},
 {sc:'Festival: Main Stage',d:2*b,show:[],place:'stage',set(){bStage(1)},tick(){trlCrowd(60000)}},
 /* the last section: the band on the Main Stage, then out over the crowd from behind them; the end card comes in as the song stops */
 {sc:'Band on stage',d:2*B,show:[],place:'stage',set(){bStage(1);bEm([['b1','guitar',.6],['b3','dance',1.8],['b2','cheer',2.6]])},tick(){trlCrowd(60000)},
  cam:u=>{const k=trlE.s(u),Y=P.mesh?P.mesh.position.y:0;return{p:[P.x+2.6-k*1.6,Y+2.1-k*.3,P.z+7.5-k*2.6],l:[P.x+.5,Y+1.1,P.z-.4],f:52}}},
 {sc:'Band and crowd',d:2*B,show:[],place:'stage',set(){if(mode!='fest')bStage(1);bEm([['b1','cheer',.2],['b2','cheer',.3],['b3','cheer',.4]])},tick(){trlCrowd(60000)},
  acts:[[.25,()=>{try{emPick('cheer')}catch(e){}}]],cam:u=>{const k=trlE.s(u),Y=P.mesh?P.mesh.position.y:0;return{p:[P.x-.9+k*.4,Y+3.1+k*1,P.z-4.4-k*.6],l:[P.x+.3,Y+.4,P.z+14],f:60}}},
 /* the song stops at 0:48 and rings out: black, then the end card on its last bit at 0:56 */
 Object.assign({},M['Black'],{d:8,place:'off'}),
 Object.assign({},M['End card'],{d:8,place:'off'})];
 let t=0;L.forEach((s,i)=>{s.k=i;s.t=t;t+=s.d;s.done=null});TRL.len=t;return L};
/* the end card says what this trailer is about */
{const e0=trlEnter;trlEnter=function(k){e0.apply(this,arguments);const s=TRL.shots[k];BB.place=s&&s.place||'off';const q=$('trle4');if(q)q.textContent='PLAY AS A BAND WITH FRIENDS'}}
{const u0=update;update=function(dt){u0.apply(this,arguments);if(TRL.run)try{bPlace()}catch(e){console.error('band trailer',e)}}}
/* emotes and name tags float over heads, so they show through the trailer's hiding of the page */
{const st=document.createElement('style');st.textContent='body.trlon>.emf:not(#c):not(#trl):not(#x),body.trlon>#ntags:not(#c):not(#trl){visibility:visible!important}';document.head.appendChild(st)}
/* scenes after the cards start from the band's career */
{const p0=trlPlay;trlPlay=function(k){const r=p0.apply(this,arguments);try{if((k||0)>2){bSetup()}}catch(e){}return r}}
}
