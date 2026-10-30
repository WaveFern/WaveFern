/* ===== v49.29.0: the band trailer (wavefern.com/?trailer=band) =====
   A second trailer, 68 seconds, made for YouTube: multiplayer band rooms. It runs on the trailer mode in 175-trailer.js
   (same pointer, cards, captions, cameras and end card) and the same track, started 24 seconds in so the drop lands at 0:16, skipping its breakdown at 0:48.
   The band room is played with no network: 161-multiplayer.js sets up a room (FERN5, The Ferns) with no sign-in, and three
   made-up bandmates (Kai on guitar, Mila on drums, Theo on bass) stand, walk and play next to you through the real band code:
   their name tags, the band panel, the four instrument minigames, emotes, the bunk beds, the band's Spotifly account and a band set
   at the festival. In the minigame shots the camera follows whoever is playing, so each one is a bandmate's
   own screen. wavefern.com/?trailer=band&menu opens the scene menu. Nothing is saved, as in the main trailer. */
if(TRL.on&&window.MPT){
const BM=MPT,BEAT=TRL.BEAT,BAR=TRL.BAR;
/* v49.29.2: the band trailer and the vertical trailer use the trailer2 mix of the track (same timing) */
Object.assign(TRL,{band:1,MO:24,DROP:16,song:'Neon Rain',SRC:'assets/trailer2.mp3'});
/* the track plays from 0:24 to 1:12, then skips its breakdown and plays on from 1:24 (at 0:48 in this trailer) */
const JUMP=48,MO2=36;
{const p0=trlPre;trlPre=function(dt){const T=TRL.fz!=null?TRL.fz:(performance.now()-TRL.t0)/1000,mo=T<JUMP?24:MO2,a=TRL.aud;
 if(TRL.MO!==mo){TRL.MO=mo;if(a&&TRL.opt.music&&!a.paused)try{a.currentTime=T+mo}catch(e){}}return p0.apply(this,arguments)}}
/* the band: you sing, and the camera can follow any of them */
const BAND=[{id:'me',nm:'Sky',inst:'vo',look:{skin:5,eyes:0,mouth:0,hair:1,hc:0,top:1,tc:0,pc:6,body:.4,hgt:.5}},
 {id:'b1',nm:'Kai',inst:'gt',look:{skin:1,eyes:4,mouth:3,hair:3,hc:7,top:2,tc:6,pc:4,body:.5,hgt:.7}},
 {id:'b2',nm:'Mila',inst:'dr',look:{skin:3,eyes:1,mouth:2,hair:7,hc:5,top:0,tc:9,pc:0,body:.3,hgt:.4}},
 {id:'b3',nm:'Theo',inst:'bs',look:{skin:4,eyes:0,mouth:1,hair:9,hc:0,top:3,tc:3,pc:5,body:.7,hgt:.6}}];
const BB={pov:'vo',place:'studio',em:{}};
/* the camera follows the band member who plays k: they become the player, and you become a bandmate */
function bPov(k){BB.pov=k;const me=BAND.find(b=>b.inst==k);ch=JSON.parse(JSON.stringify(me.look));try{refresh()}catch(e){}
 BM.inst(k);for(const id in BM.MB)if(id!='me')delete BM.MB[id];
 BAND.filter(b=>b!==me).forEach((b,i)=>{BM.MB['b'+(i+1)]={id:'b'+(i+1),nm:b.nm,inst:b.inst,look:b.look,x:P.x,z:P.z,r:0,zone:'none',where:'Studio',studio:1,stg:0,rd:null}})}
/* stage spots: the band's own, with the drummer a step to the side so the festival's camera behind you sees you past them */
const OFF=Object.assign({},BM.STOFF,{dr:[1,-1.4]});
const mates=()=>Object.values(BM.MB).filter(m=>m.id!='me');
/* where the bandmates stand: at their instruments, walking behind you, by the bunks, or on stage around you */
function bPlace(){const pl=BB.place,L=mates(),z=BM.ME.zone||'o';
 L.forEach((m,i)=>{m.zone=pl=='off'?'none':z;
  if(pl=='studio'){const s=BM.SPOT[m.inst];m.x=s[0];m.z=s[1];m.r=s[2]}
  /* the drop shot: in a row by their instruments, facing the camera */
  else if(pl=='front'){const s={dr:[10.9,3.2],gt:[13.6,2.6],bs:[14.9,3.3],vo:[12.2,2.3]}[m.inst];m.x=s[0];m.z=s[1];m.r=Math.PI}
  else if(pl=='follow'){const o=[[-1.3,-.9],[-1.4,.9],[-2.6,0]][i],r=P.rot;m.x=P.x+Math.sin(r)*o[0]+Math.cos(r)*o[1];m.z=P.z+Math.cos(r)*o[0]-Math.sin(r)*o[1];m.r=r}
  else if(pl=='bunks'){const o=[[2.3,1.6,.8],[2.5,3.3,.9],[3.6,2.2,.7]][i];m.x=o[0];m.z=o[1];m.r=o[2]}
  else if(pl=='stage'){const a=OFF[m.inst],b=OFF[BB.pov],ox=a[0]-b[0],oz=a[1]-b[1],r=P.rot||0;m.x=P.x+ox*Math.cos(r)+oz*Math.sin(r);m.z=P.z-ox*Math.sin(r)+oz*Math.cos(r);m.r=r}
  else if(pl=='street'){const o=[[1.2,-.4,-Math.PI/2],[-1.2,-.3,Math.PI/2],[0,-1.2,0]][i];m.x=P.x+o[0];m.z=P.z+o[1];m.r=o[2]}});
 /* on a stage they stand on its floor, as you do (an emote's hop is on top of that) */
 const y=pl=='stage'&&P.mesh?P.mesh.position.y:0;for(const id in BM.AV){const g=BM.AV[id].g;g.position.y=(BM.AV[id].em?g.position.y:0)+y}
 /* a bandmate's emote, on cue */
 const a=BM.AV;for(const id in BB.em){const e=BB.em[id];if(e.done||TRL.T<e.at||!a[id]||!a[id].g.visible)continue;e.done=1;a[id].em={k:e.k,t:0};BM.emFloat(a[id].g,e.k)}}
function bEm(L){BB.em={};L.forEach(([id,k,at])=>{BB.em[id]={k,at:TRL.T+at}})}
/* the band's own Spotifly account: the drawn picture shows all four */
function bAccount(){S.artist='The Ferns';S.mp=Object.assign(S.mp||{},{code:'FERN5',inst:BB.pov,band:'The Ferns',host:1,seen:['vo','gt','dr','bs'],mem:{}});BAND.forEach(b=>S.mp.mem[b.inst]={nm:b.nm,look:b.look})}
function bSetup(){bPov('vo');bAccount();try{buildStudio()}catch(e){}}
/* a band take on the minigame of instrument k, started at its first beat */
function bRec(k){trlClear();bPov(k);bAccount();S.t=200;S.energy=100;const s=BM.SPOT[k];trlPut(s[0],s[1],s[2]);BB.place='studio';
 BM.rec(k,0);if(!rec)return;try{mgStage(1)}catch(e){}rec.wait=0;rec.cdn=0;rec.cgo=0;const g=rec.ig;BB.lt=0;
 if(g){if(g.k=='dr')g.t=1.05;if(g.k=='gt'){g.R[0]=[0,2,1];g.lt=1.25}if(g.k=='bs')g.t=1.7;if(g.k=='ky')g.lt=0}}
/* a good player on each instrument */
function bPlay(){if(mode!='rec'||!rec)return;const g=rec.ig;if(!g)return;
 if(g.k=='dr')g.N.forEach(n=>{if(!n.h&&g.t>=n.at-.012)mpIg(n.l)});
 else if(g.k=='gt'){if(g.ph=='play'&&TRL.T-BB.lt>.2){BB.lt=TRL.T;mpIg(g.R[g.r][g.i])}}
 else if(g.k=='bs'){for(let j=g.lead;j<g.lead+g.n;j++)if(g.res[j-g.lead]==null&&g.t>=g.t0+j*g.bp-.01){mpIg(0);break}}
 else if(g.k=='ky'){if(g.lt>.28)mpIg(g.cur)}}
function bStage(n){trlClear();trlFestDay();bPov('vo');S.t=392;S.energy=100;const s=FSTG.find(q=>q.n==n);if(s)trlPut(s.ix,s.iz,0);BB.place='stage';
 try{BM.fest({n,slot:3,songs:S.songs.slice(-4).map(x=>x.id)})}catch(e){console.error(e)}}

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
 {sc:'Band studio',d:2*B,drop:1,show:[],place:'front',set(){trlClear();bPov('vo');bAccount();S.t=200;const s=BM.SPOT.vo;trlPut(s[0],s[1],s[2]);
   bEm([['b1','guitar',.4],['b2','cheer',1.6],['b3','dance',.9]])},
  cam:trlCam([[12.4,3.3,.3],[12.8,.8,4],70],[[12.8,2.5,.4],[12.9,1,3.7],62],trlE.o)},
 /* the band panel: three of four ready, then you */
 {sc:'Band ready',d:B,show:['mpb'],place:'studio',zoom:6,set(){trlClear();bPov('vo');S.t=200;trlPut(12.6,3.4,0);
   mates().forEach((m,i)=>m.rd={k:'rec',g:0,title:TRL.song,ts:i+1})},
  acts:[[.45,()=>trlClick(()=>trlQ('#mpb button',/Ready to record/),.85)]]},
 /* everyone plays their part: each bandmate's own minigame */
 {sc:'Drums',d:B,cap:'MILA|DRUMS',show:['ui','hud','mg'],place:'studio',zoom:5,set(){bRec('dr')},tick:bPlay},
 {sc:'Guitar',d:B,cap:'KAI|GUITAR',show:['ui','hud','mg'],place:'studio',zoom:5,set(){bRec('gt')},tick:bPlay},
 {sc:'Bass',d:B,cap:'THEO|BASS',show:['ui','hud','mg'],place:'studio',zoom:5,set(){bRec('bs')},tick:bPlay},
 {sc:'Vocals',d:B,cap:'SKY|VOCALS',show:['ui','hud','mg'],place:'studio',zoom:5,set(){bRec('vo')},acts:[[.15,trlLyr],[1.05,trlLyr]]},
 /* out in town together */
 {sc:'Band walk',d:B,walk:1,show:[],place:'follow',set(){trlClear();bPov('vo');S.t=272;trlPut(44,14.2,Math.PI/2);trlPath(30);trlKeys('ds')},cam:u=>{const x=P.x;return{p:[x+4.6,1.5,18.8],l:[x-1.3,1.1,14.3],f:44}}},
 {sc:'Emotes',d:B,show:[],place:'street',zoom:5,set(){trlClear();bPov('vo');S.t=276;trlPut(56,14.2,0);trlPath(12);
   bEm([['b1','cheer',.05],['b2','dance',.3],['b3','heart',.55]])},tick(){trlPath(10)},acts:[[.15,()=>{try{emPick('dance')}catch(e){}}]]},
 /* one house: bunk beds for the band */
 {sc:'Bunk beds',d:B,show:[],place:'bunks',set(){trlClear();bPov('vo');S.t=200;trlPut(3.6,4.1,.8);bEm([['b3','wave',.2]])},
  cam:trlCam([[6.4,3.2,6.4],[1.6,.9,2.8],48],[[5.8,2.6,5.6],[1.6,1,3],46],trlE.s)},
 /* one Spotifly account for the band, its picture drawn with all four of you */
 {sc:'Band Spotifly',d:B,show:['ui'],place:'off',set(){trlClear();bAccount();openPC();app=1;smo=0;pg='home';pcR()},pz:['pc',1.12,1.22,trlNums],tick(u){trlCount(Math.min(1,u/.95),{'monthly listeners':[4800,182000],followers:[60,24000],fame:[4,58]})}},
 /* a band set: the smaller stage, then the Main Stage, the band around you */
 {sc:'Festival: The Pit',d:2*b,show:[],place:'stage',set(){bStage(3)},tick(){trlCrowd(600)}},
 {sc:'Festival: Main Stage',d:2*b,show:[],place:'stage',set(){bStage(1)},tick(){trlCrowd(60000)}},
 Object.assign({},M['Festival crowd'],{place:'stage',set(){trlClear();bPov('vo');S.t=396;trlPut(364,-112.5,0);P.mesh.visible=true}}),
 Object.assign({},M['Spotifly: millions'],{place:'off',set(){trlClear();bAccount();openPC();app=1;smo=0;pg='home';pcR()},tick(u){trlCount(Math.min(1,u/.95),{'monthly listeners':[182000,3800000],followers:[24000,1200000],fame:[58,209]})}}),
 Object.assign({},M['Recording'],{place:'off'}),
 /* the music skips its breakdown into the last section: the band on the Main Stage, then out over the crowd from behind them */
 {sc:'Band on stage',d:2*B,show:[],place:'stage',set(){bStage(1);bEm([['b1','guitar',.6],['b3','dance',1.8],['b2','cheer',2.6]])},tick(){trlCrowd(60000)},
  cam:u=>{const k=trlE.s(u),Y=P.mesh?P.mesh.position.y:0;return{p:[P.x+2.6-k*1.6,Y+2.1-k*.3,P.z+7.5-k*2.6],l:[P.x+.5,Y+1.1,P.z-.4],f:52}}},
 {sc:'Band and crowd',d:2*B,show:[],place:'stage',set(){if(mode!='fest')bStage(1);bEm([['b1','cheer',.2],['b2','cheer',.3],['b3','cheer',.4]])},tick(){trlCrowd(60000)},
  acts:[[.25,()=>{try{emPick('cheer')}catch(e){}}]],cam:u=>{const k=trlE.s(u),Y=P.mesh?P.mesh.position.y:0;return{p:[P.x-.9+k*.4,Y+3.1+k*1,P.z-4.4-k*.6],l:[P.x+.3,Y+.4,P.z+14],f:60}}},
 Object.assign({},M['Black'],{place:'off'}),
 Object.assign({},M['End card'],{place:'off'})];
 let t=0;L.forEach((s,i)=>{s.k=i;s.t=t;t+=s.d;s.done=null});TRL.len=t;return L};
/* the end card says what this trailer is about */
{const e0=trlEnter;trlEnter=function(k){e0.apply(this,arguments);const s=TRL.shots[k];BB.place=s&&s.place||'off';const q=$('trle4');if(q)q.textContent='PLAY AS A BAND WITH FRIENDS'}}
{const u0=update;update=function(dt){u0.apply(this,arguments);if(TRL.run)try{bPlace()}catch(e){console.error('band trailer',e)}}}
/* emotes and name tags float over heads, so they show through the trailer's hiding of the page */
{const st=document.createElement('style');st.textContent='body.trlon>.emf:not(#c):not(#trl):not(#x),body.trlon>#ntags:not(#c):not(#trl){visibility:visible!important}';document.head.appendChild(st)}
/* scenes after the cards start from the band's career */
{const p0=trlPlay;trlPlay=function(k){const r=p0.apply(this,arguments);try{if((k||0)>2){bSetup()}}catch(e){}return r}}
}
