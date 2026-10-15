/* ===== v26.120: the Gramophone Awards =====
   A glitzy awards hall in the city (a grand low building at the end of your street with a gold marquee, red carpet and a giant gold gramophone on the roof). You can only go in at
   Fame Level 120. Inside is the reception: red carpet, step-and-repeat banner, champagne, a trophy case and a host with the
   guest list. Check in (once every 30 days) and pick the song you submit, then the ceremony plays as a TV broadcast cutscene:
   host, two other categories, then your category (Song of the Year) with nominees, a drumroll and the envelope. The winner
   walks up through the applause and holds the trophy up with everybody clapping, then you leave.
   Hard to win: you are up against four of 16 big real-world artists, each with a score that moves a little each year, and your
   score is your submitted song's mix quality plus a bonus for its streams. Only the single highest score wins.
   A win gives you a Gramophone Trophy in Storage (furniture, not sold anywhere) that you can place in your house. S.awd saves it all. */
const AW={need:120,cool:30,ox:-2400,i:null,
 pool:[['Beyoncé',142,'Silver Cathedral'],['Kendrick Lamar',140,'Compton Sonata'],['Drake',138,'Midnight Penthouse'],['Taylor Swift',136,'Glass Autumn'],['Adele',134,'Ten Winters'],['The Weeknd',132,'Neon Confession'],
  ['Bad Bunny',130,'Calor de Medianoche'],['Billie Eilish',128,'Hollow Lullaby'],['Bruno Mars',128,'Velvet Saturday'],['SZA',126,'Good Gravity'],['Travis Scott',124,'Astro Parade'],['Olivia Rodrigo',120,'Locker Room Heart'],
  ['Harry Styles',119,'Sunday Carousel'],['Dua Lipa',118,'Chrome Disco'],['Post Malone',116,'Whiskey Tattoo'],['Ed Sheeran',114,'Small Town Loop']],
 cats:['Best New Artist','Best Pop Vocal Album','Best Rap Performance','Best Dance Recording','Album of the Year','Best Rock Song','Record of the Year'],
 host:['Marcus Hale','June Calloway','Dex Okonkwo','Priya Vance'],nth:()=>40+Math.floor(((typeof S!='undefined'&&S.day)||0)/30)};
const awS=()=>(S.awd=S.awd||{last:-999,wins:0,tries:0,hist:[]});
const awSongScore=s=>Math.round((s.q||0)+Math.min(25,5*Math.log10(1+(s.streams||0)/1000)));
const awWait=()=>Math.max(0,AW.cool-(S.day-awS().last));

/* ---- the trophy: furniture that is not sold, only won ---- */
Object.defineProperty(F,'trophy',{value:{n:'Gramophone Trophy',p:0,w:.6,d:.6,b:[[.46,.1,.46,'#2a1f14',0,.05,0],[.38,.06,.38,'#c9a227',0,.13,0],[.1,.34,.1,'#e6c34a',0,.33,0],[.26,.04,.26,'#c9a227',0,.52,0],[.34,.02,.34,'#1a1a1a',0,.55,0],[.04,.06,.04,'#e6c34a',0,.59,0],
 [.1,.1,.1,'#e6c34a',.04,.62,0],[.18,.1,.18,'#f2d466',.1,.7,0],[.28,.1,.28,'#e6c34a',.17,.8,0],[.38,.08,.38,'#f2d466',.24,.9,0],[.26,.04,.26,'#3a2a10',.26,.9,0],[.05,.4,.05,'#c9a227',-.1,.3,.1]]},enumerable:false,writable:true,configurable:true});

/* ---- the field: you plus four big artists, scores decided up front ---- */
function awField(song){const me=awSongScore(song),pool=AW.pool.slice().sort(()=>Math.random()-.5),rv=pool.slice(0,4).map(p=>({n:p[0],t:p[2],sc:Math.round(p[1]+R(-9,9)),you:0}));
 const f=rv.concat([{n:S.artist,t:song.title,sc:me,you:1}]).sort((a,b)=>b.sc-a.sc);const others=pool.slice(4,10);
 return{field:f,win:f[0],won:!!f[0].you,me,cats:[[pick(['Best New Artist','Best Pop Vocal Album','Best Dance Recording']),others[0][0],others[0][2]],[pick(['Best Rap Performance','Best Rock Song','Album of the Year']),others[1][0],others[1][2]]],
  h:[pick(AW.host),pick(AW.host)]}}

/* ---- the building out front, and the reception room ---- */
const AWD={door:0};
{const bv=buildVenues;buildVenues=function(){bv();try{SHOPS.push({name:'Gramophone Awards',cx:74,ox:AW.ox,ez:12.9});AW.i=SHOPS.length-1;
 interior(AW.i,['#7a1010','#5a0a0a'],'#1a1020',[],[],{hair:5,hc:0,eyes:0,mouth:3,top:2,tc:1,pc:1,skin:2,body:.4,hgt:.6,ac:-1},'Vivian (guest list)',awTalk);
 ixRoom(AW.i,AW_ROOM);
 const g=new THREE.Mesh(geo(40,.1,30),new THREE.MeshLambertMaterial({color:'#120a14'}));g.position.set(AW.ox+5,-.25,324);WORLD.add(g)}catch(e){console.error('awards room',e)}}}
const AW_ROOM={fl:['tile','#7a1010','#6a0c0c'],wl:['stripe','#1e1428','#2c1c3c'],tr:'#c9a227',wa:'#2a1a38',fw:'#2a1a38',mat:'#c9a227',sign:['GRAMOPHONE AWARDS','#f6d86a','#1a1020',4.4,.55,2.6,5,{border:'#c9a227'}],lights:[[2.2,3.2],[7.8,3.2],[5,6,.6]],lc:0xffe0a0,
 build(b,cl,add){
  /* red carpet runner from the door to the guest list desk, with gold stanchions and velvet ropes */
  b(2.4,.03,6.6,'#b01020',5,.02,4.6);b(2.5,.02,6.7,'#d4a52a',5,.012,4.6);[-1.35,1.35].forEach(s=>{for(let z=2.6;z<=7.4;z+=1.6){b(.08,.9,.08,'#e6c34a',5+s,.45,z);b(.2,.05,.2,'#c9a227',5+s,.03,z);b(.14,.1,.14,'#f6d86a',5+s,.93,z);if(z<7)b(.03,.05,1.5,'#8a0f1e',5+s,.8,z+.8)}});
  /* front desk: the guest list, a lamp and a gold gramophone paperweight */
  ixCounter(b,cl,5,3.2,2.8,.9,'#2a1a38','#c9a227');b(.5,.04,.36,'#f4f4f4',4.3,1.08,3.15);b(.34,.08,.34,'#e6c34a',5.7,1.1,3.2);b(.1,.18,.1,'#e6c34a',5.7,1.23,3.2);b(.22,.1,.22,'#f2d466',5.74,1.36,3.2);
  /* step-and-repeat banner behind the desk wall */
  [1.3,3.1,6.9,8.7].forEach(x=>{add(ixSign('AWARDS','#d9b13a','#1a1020',1.5,.9,{border:'#8a6a1a',k:.4,stroke:'rgba(0,0,0,.2)'}),x,1.5,.03)});
  /* trophy case with a spotlight on the left wall */
  b(.5,1.1,1.4,'#2a1a38',.3,.55,6);b(.3,.9,1.2,'*cfe3ee',.34,1.55,6);b(.06,1.1,1.4,'#c9a227',.52,1.5,6);b(.2,.5,.2,'#e6c34a',.34,1.5,6);b(.3,.1,.3,'#f6d86a',.34,1.82,6);b(.1,.08,.1,'#f6d86a',.34,1.2,5.6);b(.1,.08,.1,'#f6d86a',.34,1.2,6.4);cl(0,5.2,.8,6.8);ixLampW(b,.1,2.5,6,'*ffe9a8',1);
  /* champagne table on the right: bottle in a bucket, flutes and a tower */
  b(1.8,.9,.9,'#2a1a38',9.1,.45,6);b(2,.06,1.1,'#c9a227',9.1,.93,6);b(.4,.3,.4,'#cfd3d8',8.6,1.1,6);b(.1,.3,.1,'#2e5a2e',8.6,1.4,6);for(let k=0;k<5;k++)b(.07,.16,.07,'*f4e7a6',9+k*.17,1.04,6.1);for(let r=0;r<3;r++)for(let k=0;k<3-r;k++)b(.09,.14,.09,'*f4e7a6',9.4+k*.12+r*.06,1.5-r*.0+r*.15,5.8);cl(8.1,5.5,10,6.5);
  /* guests in gowns and tuxes mingling */
  [[3,5.3,'#8a1d4a','#c98b6a'],[3.6,5.6,'#1a1a22','#8a5a3a'],[7.2,4.6,'#1c4a7a','#e0b090'],[7.9,4.4,'#111','#6a4a30'],[2.5,7.4,'#b8860b','#d9a47a']].forEach(q=>{b(.4,.9,.3,q[2],q[0],.45,q[1]);b(.34,.4,.26,q[2],q[0],1.1,q[1]);b(.22,.22,.22,q[3],q[0],1.45,q[1]);b(.24,.08,.24,q[2]=='#111'||q[2]=='#1a1a22'?'#222':'#2a1a1a',q[0],1.58,q[1]);cl(q[0]-.25,q[1]-.25,q[0]+.25,q[1]+.25)});
  ixFrame(b,3.6,1.95,.03,.7,.9,'#c9a227',['#7a1010','#e6c34a','#1a1020']);ixFrame(b,6.4,1.95,.03,.7,.9,'#c9a227',['#1a1020','#e6c34a','#7a1010']);
  ixPlant(b,cl,.8,3.4,.9,'#2a1a38');ixPlant(b,cl,9.3,3.2,.9,'#2a1a38');ixPend(b,3,3.4,'*ffe9b8','#c9a227',2.5);ixPend(b,7,3.4,'*ffe9b8','#c9a227',2.5);ixPend(b,5,6,'*ffe9b8','#c9a227',2.4)}};
/* the building itself: a grand low hall at the end of your street (slot 74, built by the street shop builder in 93-street-shops.js) */
SHOPX[74]={n:'GRAMOPHONE AWARDS',h:5.2,wall:'#efe6d2',band:'#e4d9bf',trim:'#c9a227',fas:'#2a0a12',txt:'#f6d86a',door:'#5a0f1a',glass:'#b9a0c8',sill:'#c9a227',up:1,
 win:(X,z,x0,x1,w)=>{/* framed gold records and a poster of the trophy */w.forEach((u,k)=>{SB(.42,.5,.03,'#c9a227',u,1.4,z+.1);SB(.32,.4,.02,k%2?'#1a1020':'#7a1010',u,1.4,z+.12);SB(.1,.1,.02,'#f6d86a',u,1.42,z+.13)})},
 extra:(X,z,H)=>{/* red carpet, gold stanchions and ropes, marquee canopy with bulbs, fluted columns, banners, a giant gold gramophone on the roof, roof lamps */
  SB(2.2,.03,5,'#b01020',X,.02,z+3.1);SB(2.3,.02,5.1,'#d4a52a',X,.012,z+3.1);[-1.3,1.3].forEach(s=>{for(let q=z+1.4;q<z+5;q+=1.2){SB(.08,.9,.08,'#e6c34a',X+s,.45,q);SB(.14,.1,.14,'#f6d86a',X+s,.93,q);if(q<z+4)SB(.03,.05,1.2,'#8a0f1e',X+s,.8,q+.6)}});
  SB(3.6,.18,1.4,'#c9a227',X,2.6,z+.7);SB(3.4,.08,1.3,'#7a1010',X,2.7,z+.7);for(let k=-6;k<=6;k++)SB(.1,.1,.1,k%2?'#fff3b0':'#ffd24a',X+k*.28,2.5,z+1.4);
  [-1.7,1.7].forEach(s=>{SB(.4,2.5,.4,'#f4ecd8',X+s,1.25,z+1.3);SB(.5,.15,.5,'#c9a227',X+s,.08,z+1.3);SB(.5,.15,.5,'#c9a227',X+s,2.45,z+1.3)});
  [-3.2,3.2].forEach(s=>{SB(.9,2.4,.05,'#2a0a12',X+s,3.8,z+.28);SB(.7,.5,.03,'#c9a227',X+s,4.3,z+.31);SB(.3,1,.03,'#f6d86a',X+s,3.6,z+.31)});
  const y=H+.7;SB(1.6,.5,1,'#c9a227',X,y-.2,6.8);SB(.2,1.2,.2,'#e6c34a',X,y+.7,6.8);SB(1.4,.12,1.4,'#f6d86a',X,y+1.35,6.8);SB(.3,.3,.3,'#c9a227',X+.3,y+1.6,6.8);SB(.7,.35,.7,'#e6c34a',X+.6,y+1.9,6.8);SB(1.2,.35,1.2,'#f6d86a',X+1,y+2.2,6.8);SB(1.8,.3,1.8,'#fff3b0',X+1.5,y+2.55,6.8);
  [-3.4,3.4].forEach(s=>{SB(.3,.3,.3,'#2a2a2a',X+s,H+.4,z+.5);SB(.2,.2,.2,'#fff3b0',X+s,H+.65,z+.5)})}};
{const bv=buildVenues;buildVenues=function(){bv();try{mkShop(74,'#c9a227','AWARDS',()=>{if(fameLevel()<AW.need){snd('err');say('Invite only: the Gramophone Awards need Fame Level '+AW.need+'. You are Level '+fameLevel()+'.')}else enterShop(AW.i)},'Enter Gramophone Awards');POIS.push([74,8,'Gramophone Awards','#ffd24a'])}catch(e){console.error('awards door',e)}}}
{const pv=buildVenues;buildVenues=function(){pv();try{SHOPS[AW.i].cx=74;SHOPS[AW.i].ez=12.9}catch(e){}}}

/* ---- the guest list desk ---- */
function awTalk(){if(mode!='play')return;const A=awS(),sg=(S.songs||[]).slice().sort((a,b)=>awSongScore(b)-awSongScore(a)),w=awWait();
 let body;
 if(!sg.length)body='<p>"You need a released song to be on the list. Come back with something we can nominate."</p>';
 else if(w>0)body=`<p>"Welcome back, ${esc(S.artist)}! The next ceremony is in <b>${w}</b> day${w==1?'':'s'}. Do enjoy the champagne."</p>`;
 else body=`<p>"${esc(S.artist)}! You're on the list. Which of your songs are we submitting for <b>Song of the Year</b>?"</p>
  <select id=awsel style="width:100%;margin:6px 0;padding:8px;font-size:15px">${sg.slice(0,12).map((s,k)=>`<option value="${s.id}">${esc(s.title)} · score ${awSongScore(s)}${k?'':' (your strongest)'}</option>`).join('')}</select>
  <p class=m>Your score is the song's mix quality plus a bonus for its streams. The big names are all in the room. Only one song wins, and they don't give it to you for turning up.</p>`;
 mode='menu';$('ui').innerHTML=`<div class="box modal" style="width:min(520px,94vw);border:3px solid #c9a227;background:#14091c"><h2 style="color:#f6d86a">🏆 Gramophone Awards · Guest list</h2><p class=m>${A.tries?`Ceremonies attended: ${A.tries} · Trophies won: ${A.wins}`:'The biggest night in music.'}</p>${body}
  <div class=row2>${sg.length&&!w?'<button class=go onclick="awGo()">Take your seat · Start the ceremony</button>':''}<button onclick="closeUI()">Not now</button></div></div>`}
function awGo(){const sel=$('awsel'),song=(S.songs||[]).find(s=>s.id==(sel&&sel.value));if(!song||awWait()>0)return;const A=awS();A.last=S.day;A.tries++;closeUI();mode='menu';awPlay(awField(song),song)}

/* ---- the broadcast ---- */
let AWP=null;
function awRng(s){return()=>(s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,((s^s>>>7)>>>0)/4294967296)}
function awPlay(F0,song){const w=document.createElement('div');w.id='awd';w.style.cssText='position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif';
 w.innerHTML='<canvas width=960 height=540 style="max-width:100vw;max-height:100vh;width:100%;height:100%;object-fit:contain;background:#000"></canvas><button id=awskip style="position:absolute;right:14px;top:12px;padding:8px 14px;opacity:.8">Skip ⏭</button><div id=awres style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72)"></div>';
 document.body.appendChild(w);const cv=w.querySelector('canvas'),c=cv.getContext('2d');
 const face=new Image();try{face.src=pfp()}catch(e){}
 const A={F:F0,song,c,t:0,si:0,face,conf:[],cl:0,lastClap:0,end:false,seed:awRng(7)};AWP=A;
 const YOU=F0.field.find(x=>x.you),WIN=F0.win,rnd=awRng(99),aud=[];
 for(let r=0;r<3;r++)for(let x=18+r*14;x<950;x+=46-r*4)aud.push({x:x+rnd()*6,r,h:rnd(),s:rnd()});
 const GOLD='#e6c34a',TXT=(s,x,y,sz,col,al,f)=>{c.font=(f||'bold ')+sz+'px Georgia,serif';c.textAlign=al||'center';c.fillStyle=col;c.fillText(s,x,y)};
 const grammo=(x,y,s,glow)=>{c.save();c.translate(x,y);c.scale(s,s);if(glow){const g=c.createRadialGradient(10,-48,4,10,-48,70);g.addColorStop(0,'rgba(255,230,120,.7)');g.addColorStop(1,'rgba(255,230,120,0)');c.fillStyle=g;c.fillRect(-70,-120,160,150)}
  c.fillStyle='#4a3414';c.fillRect(-14,-8,28,8);c.fillStyle='#c9a227';c.fillRect(-11,-12,22,5);c.fillStyle='#e6c34a';c.fillRect(-3,-36,6,26);
  c.fillStyle='#c9a227';c.fillRect(-12,-40,24,5);c.fillStyle='#1a1a1a';c.beginPath();c.ellipse(0,-41,11,3,0,0,7);c.fill();
  c.fillStyle='#f2d466';c.beginPath();c.moveTo(-3,-42);c.lineTo(4,-44);c.lineTo(28,-76);c.lineTo(10,-84);c.closePath();c.fill();
  c.fillStyle='#fff0a0';c.beginPath();c.ellipse(19,-80,13,8,-.55,0,7);c.fill();c.fillStyle='#8a6a1a';c.beginPath();c.ellipse(20,-80,9,5,-.55,0,7);c.fill();c.restore()};
 const person=(x,y,s,o)=>{o=o||{};const ph=o.walk||0,sw=Math.sin(ph)*5*s,suit=o.suit||'#16161c',skin=o.skin||'#d9a47a';c.save();
  c.fillStyle=suit;if(o.dress){c.fillStyle=o.dress;c.beginPath();c.moveTo(x-9*s,y-62*s);c.lineTo(x+9*s,y-62*s);c.lineTo(x+17*s,y);c.lineTo(x-17*s,y);c.fill()}
  else{c.fillRect(x-7*s+sw*.6,y-30*s,6*s,30*s);c.fillRect(x+1*s-sw*.6,y-30*s,6*s,30*s);c.fillRect(x-11*s,y-64*s,22*s,36*s);c.fillStyle='#f4f4f4';c.beginPath();c.moveTo(x-4*s,y-64*s);c.lineTo(x+4*s,y-64*s);c.lineTo(x,y-46*s);c.fill();c.fillStyle='#b01020';c.fillRect(x-3*s,y-62*s,6*s,3*s)}
  c.strokeStyle=o.dress||suit;c.lineWidth=5*s;c.lineCap='round';c.beginPath();c.moveTo(x-10*s,y-60*s);c.lineTo(x-13*s,y-36*s+sw*.4);c.stroke();
  c.beginPath();c.moveTo(x+10*s,y-60*s);if(o.up){c.lineTo(x+19*s,y-86*s)}else c.lineTo(x+13*s,y-36*s-sw*.4);c.stroke();c.fillStyle=skin;c.beginPath();if(o.up)c.arc(x+19*s,y-88*s,3.2*s,0,7);else c.arc(x+13*s,y-34*s-sw*.4,3*s,0,7);c.fill();
  if(o.up)grammo(x+19*s,y-86*s+2*s,s*.55,o.glow);
  c.fillStyle=skin;c.beginPath();c.arc(x,y-76*s,11*s,0,7);c.fill();
  if(o.you&&face.complete&&face.naturalWidth){c.imageSmoothingEnabled=false;c.save();c.beginPath();c.arc(x,y-76*s,12*s,0,7);c.clip();c.drawImage(face,x-14*s,y-92*s,28*s,28*s);c.restore()}
  else{c.fillStyle=o.hair||'#2a1a10';c.beginPath();c.arc(x,y-79*s,11.5*s,Math.PI,0);c.fill();if(o.long){c.fillRect(x-11*s,y-80*s,4*s,20*s);c.fillRect(x+7*s,y-80*s,4*s,20*s)}c.fillStyle='#111';c.fillRect(x-5*s,y-77*s,2*s,2*s);c.fillRect(x+3*s,y-77*s,2*s,2*s)}
  c.restore()};
 const confetti=n=>{for(let i=0;i<n;i++)A.conf.push({x:R(100,860),y:R(-40,-5),vx:R(-30,30),vy:R(60,160),r:R(0,6),c:pick(['#ffd24a','#ff5a7a','#7fe3ff','#fff','#b58cff','#6dffb0'])})};
 const stage=(o)=>{o=o||{};const T=A.t+A.si*3.7,cl=o.clap||0,st=o.stand||0;
  const bg=c.createLinearGradient(0,0,0,540);bg.addColorStop(0,'#07040d');bg.addColorStop(.6,'#1d1030');bg.addColorStop(1,'#0a0612');c.fillStyle=bg;c.fillRect(0,0,960,540);
  /* gold truss arches and LED pillars */
  c.strokeStyle='#8a6a1a';c.lineWidth=5;for(let k=0;k<3;k++){c.beginPath();c.ellipse(480,330,440+k*18,300+k*14,0,Math.PI*1.05,Math.PI*1.95);c.stroke()}
  [60,900].forEach((x,k)=>{const g=c.createLinearGradient(0,0,0,330);g.addColorStop(0,`hsl(${(T*60+k*140)%360},90%,60%)`);g.addColorStop(1,`hsl(${(T*60+k*140+120)%360},90%,35%)`);c.fillStyle=g;c.fillRect(x-14,60,28,270);c.fillStyle='#c9a227';c.fillRect(x-18,56,36,6)});
  /* big screen */
  c.fillStyle='#c9a227';c.fillRect(214,30,532,206);c.fillStyle='#0b0612';c.fillRect(222,38,516,190);if(o.screen)o.screen(222,38,516,190);
  /* spotlight beams */
  for(let k=0;k<6;k++){const x0=110+k*148,a=Math.sin(T*.9+k*1.3)*.5,x1=x0+Math.tan(a)*330;c.fillStyle=`rgba(255,${230-k*14},${170+k*12},.085)`;c.beginPath();c.moveTo(x0-6,0);c.lineTo(x0+6,0);c.lineTo(x1+60,335);c.lineTo(x1-60,335);c.fill()}
  /* stage */
  c.fillStyle='#1a1226';c.beginPath();c.moveTo(120,320);c.lineTo(840,320);c.lineTo(940,404);c.lineTo(20,404);c.fill();c.fillStyle='#c9a227';c.fillRect(20,402,920,5);c.fillStyle='rgba(255,220,130,.08)';c.fillRect(120,322,720,8);
  [200,330,480,630,760].forEach(x=>{c.fillStyle='#ffd24a';c.fillRect(x-3,398,6,3)});
  if(!o.nopod){c.fillStyle='#2a1a38';c.fillRect(436,282,88,52);c.fillStyle='#c9a227';c.fillRect(432,278,96,6);grammo(480,314,.5);c.fillStyle='#999';c.fillRect(493,246,2,34);c.fillRect(488,244,12,4)}
  if(o.stageDraw)o.stageDraw();
  /* audience: dark silhouettes, hands up when clapping, standing on ovation */
  aud.forEach((a,i)=>{const y=438+a.r*40-st*(10+a.r*5),sz=1+a.r*.28,bob=cl?Math.abs(Math.sin(T*9+a.s*6))*3:0,col=`rgb(${14+a.r*5},${9+a.r*4},${22+a.r*6})`;
   c.fillStyle=col;c.fillRect(a.x-10*sz,y-bob,20*sz,80);c.beginPath();c.arc(a.x,y-9*sz-bob,8*sz,0,7);c.fill();c.fillStyle=`rgba(255,220,170,${.06+a.r*.02})`;c.beginPath();c.arc(a.x-2*sz,y-11*sz-bob,6*sz,0,7);c.fill();
   if(cl&&a.h<.82){c.fillStyle='#caa27c';const hy=y+6*sz-bob-(st?12:0)+Math.sin(T*10+a.s*7)*4;c.beginPath();c.arc(a.x-4*sz,hy,3*sz,0,7);c.arc(a.x+4*sz,hy,3*sz,0,7);c.fill()}});
  if(o.you!==false&&o.seatYou){const a=aud.find(q=>q.r==1&&q.x>290)||aud[0];const y=438+40-st*15;c.save();person(a.x,y+34,.8,{you:1,suit:'#16161c'});c.restore()}
  /* flashbulbs */
  const fr=awRng(Math.floor(T*10)+A.si*13);for(let k=0;k<(o.flash||5);k++){if(fr()<.5){const fx=fr()*960,fy=380+fr()*140,r=4+fr()*10;const g=c.createRadialGradient(fx,fy,0,fx,fy,r*3);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(fx-r*3,fy-r*3,r*6,r*6)}}};
 const lower=(l1,l2,tt)=>{const n=Math.floor((tt||0)*34);c.fillStyle='rgba(8,4,16,.86)';c.fillRect(40,462,880,66);c.fillStyle='#c9a227';c.fillRect(40,462,8,66);TXT(l1.slice(0,n),66,490,24,'#fff','left');if(l2)TXT(l2.slice(0,Math.max(0,n-l1.length)),66,517,17,'#f0d27a','left','')};
 const bug=()=>{c.fillStyle='#c0141c';c.fillRect(24,22,64,24);TXT('LIVE',56,40,16,'#fff');TXT('THE '+AW.nth()+'TH GRAMOPHONE AWARDS',104,40,15,'#f6d86a','left')};
 const scr=(lines,sub)=>(x,y,w,h)=>{const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#2a0f3f');g.addColorStop(1,'#0e1b3a');c.fillStyle=g;c.fillRect(x,y,w,h);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();for(let k=0;k<14;k++){c.fillStyle=`rgba(255,220,120,${.04+k%3*.02})`;c.beginPath();c.arc(x+(k*83+A.t*20)%w,y+(k*47)%h,20+k*3,0,7);c.fill()}c.restore();
  lines.forEach((l,k)=>TXT(l[0],x+w/2,y+l[1],l[2],l[3]||'#f6d86a'));if(sub)TXT(sub,x+w/2,y+h-12,14,'#cbb','center','')};
 const tickClap=dt=>{A.lastClap-=dt;if(A.cl>0&&A.lastClap<=0){A.lastClap=.07;nz(.06,1800+R(0,2400),.22*A.cl,1,'bandpass')}};
 const S_=[];
 /* 1: opening */
 S_.push({d:6,on:()=>{snd('chime');A.cl=1},draw:t=>{stage({clap:1,flash:9,nopod:1,screen:scr([['THE '+AW.nth()+'TH ANNUAL',60,22],['GRAMOPHONE',110,44,'#fff'],['AWARDS',150,34]],'Live from the Golden Hall')});if(t<2)confetti(1);
   lower('Good evening, and welcome to the biggest night in music!','Live from the Golden Hall',Math.max(0,(t-.5)/2.6))}});
 /* 2: host */
 S_.push({d:7,on:()=>{A.cl=0},draw:t=>{stage({flash:3,screen:scr([['TONIGHT\'S HOST',70,20],[F0.h[0].toUpperCase(),120,40,'#fff']],'')});person(480,334,1.1,{suit:'#1a1a2c',hair:'#111'});
   lower(F0.h[0]+': "Tonight, one song becomes a legend."','"Five nominees. One trophy. Absolutely no pressure."',t/4)}});
 /* 3,4: other categories */
 F0.cats.forEach((ct,k)=>S_.push({d:8,on:()=>{A.cl=0;snd('ping')},draw:t=>{const ph=t<3;stage({clap:t>4.2?1:0,flash:t>4.2?9:3,screen:ph?scr([['NOW PRESENTING',60,18],[ct[0].toUpperCase(),115,34,'#fff']],''):scr([['AND THE WINNER IS',60,18],[ct[1].toUpperCase(),115,36,'#fff'],['"'+ct[2]+'"',160,20]],''),stageDraw:()=>{person(450,334,1,{suit:'#222',hair:'#442'});person(520,334,1,{dress:'#7a1d5a',long:1,hair:'#a24'});if(t>4.2)person(480,396+0,1.35,{suit:'#10303a',up:1,glow:1,hair:'#221'})}});if(t>4.2&&A.conf.length<30)confetti(1);
   lower(ph?'Presenting '+ct[0]+'...':ct[1]+' takes home '+ct[0]+'!',ph?'The envelope, please.':'"Thank you, thank you, you are all too kind."',(ph?t:t-4.2)/3)}}));
 /* 5: your category intro */
 S_.push({d:9+F0.field.length*2.2,on:()=>{A.cl=0;snd('whoosh')},draw:t=>{const k=Math.min(F0.field.length-1,Math.max(-1,Math.floor((t-3)/2.2))),n=k>=0?F0.field[(k+F0.field.length-1)%F0.field.length]:null;
   const order=F0.field.slice().sort((a,b)=>a.you?1:b.you?-1:a.n<b.n?-1:1),nm=k>=0?order[Math.min(k,order.length-1)]:null;
   stage({flash:2,seatYou:1,screen:nm?scr([['SONG OF THE YEAR',50,18],[nm.n.toUpperCase(),105,32,nm.you?'#7fe3ff':'#fff'],['"'+nm.t+'"',148,20],['NOMINEE '+(k+1)+' OF '+order.length,185,13,'#a99']],''):scr([['SONG OF THE YEAR',80,34],['THE NOMINEES',130,22,'#fff']],''),stageDraw:()=>{person(450,334,1,{suit:'#222',hair:'#442'});person(520,334,1,{dress:'#1d4a7a',long:1,hair:'#432'})}});
   lower(nm?(nm.you?'Nominated: '+nm.n+' — "'+nm.t+'"':'Nominated: '+nm.n+' — "'+nm.t+'"'):F0.h[1]+': "Song of the Year. The one everybody argues about."',nm&&nm.you?'That is YOU. The room applauds.':'The nominees are...',(t-(k>=0?3+k*2.2:0))/2.4)}});
 /* 6: reaction shot */
 S_.push({d:5,on:()=>{A.cl=0;snd('thunk')},draw:t=>{stage({flash:0,seatYou:0});c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,0,960,540);const g=c.createRadialGradient(480,300,20,480,300,360);g.addColorStop(0,'rgba(255,230,160,.22)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,960,540);
   person(480,560+Math.sin(t*3)*3,5.2,{you:1});lower('You grip the armrest. Camera 3 is on you.','Four of the biggest names on Earth are sitting within ten metres.',t/3)}});
 /* 7: envelope + drumroll */
 S_.push({d:5,on:()=>{for(let i=0;i<22;i++)nz(.09,200+i*10,.35,1,'lowpass',i*.15)},draw:t=>{stage({flash:1,screen:scr([['AND THE WINNER IS...',100,30]],''),stageDraw:()=>{person(480,334,1.1,{suit:'#222',hair:'#442'});const ep=Math.min(1,t/1.5);c.fillStyle='#f4f0e0';c.fillRect(498,250-ep*10,26,18);c.fillStyle='#b01020';c.fillRect(498,250-ep*10,26,4)}});
   const cc=c.createRadialGradient(480,300,50,480,300,480);cc.addColorStop(0,'rgba(0,0,0,0)');cc.addColorStop(1,`rgba(0,0,0,${.2+t*.1})`);c.fillStyle=cc;c.fillRect(0,0,960,540);
   lower(F0.h[1]+' tears open the envelope...','',t/2)}});
 /* 8: reveal */
 S_.push({d:4,on:()=>{snd('chime');A.cl=1;confetti(120);},draw:t=>{stage({clap:1,flash:9,screen:scr([['SONG OF THE YEAR',45,18],[WIN.n.toUpperCase(),105,36,'#fff'],['"'+WIN.t+'"',150,24]],''),stageDraw:()=>person(480,334,1.1,{suit:'#222',hair:'#442'})});
   lower(WIN.you?'"...'+S.artist+'! "'+WIN.t+'"!"':'"...'+WIN.n+'! "'+WIN.t+'"!"',WIN.you?'It\'s you. You actually won.':'The hall erupts. You applaud politely.',t/2)}});
 /* 9: the walk up */
 const way=WIN.you?[[260,478],[200,440],[190,398],[420,396],[480,396]]:[[690,478],[760,440],[770,398],[540,396],[480,396]],pp=(u)=>{u=Math.min(1,Math.max(0,u))*(way.length-1);const i=Math.min(way.length-2,Math.floor(u)),f=u-i;return[way[i][0]+(way[i+1][0]-way[i][0])*f,way[i][1]+(way[i+1][1]-way[i][1])*f]};
 S_.push({d:6,on:()=>{A.cl=1},draw:t=>{const p=pp(t/5.2);stage({clap:1,stand:Math.min(1,t/1.2),flash:10,screen:scr([['SONG OF THE YEAR',70,18],[WIN.n.toUpperCase(),125,36,'#fff']],''),stageDraw:()=>{person(450,334,1,{suit:'#222',hair:'#442'});person(520,334,1,{dress:'#1d4a7a',long:1,hair:'#432'})}});
   if(t<5.4)person(p[0],p[1]+(t<2.2?0:0),1.35,{walk:t*9,you:WIN.you,suit:WIN.you?'#16161c':pick2(WIN.n),hair:'#221'});if(Math.random()<.3)confetti(2);
   lower(WIN.you?'Standing ovation as you make your way to the stage.':WIN.n+' makes the long walk up to the stage.',F0.h[1]+': "Come on up!"',t/3)}});
 /* 10: trophy up */
 const spk=WIN.you?['Thank you. I... wow. I really did not write a speech.','To everyone who streamed, shared and sang along: this is yours too.']:pick([['I\'m honestly speechless. Thank you to my team, my family and the fans.','This one is for everybody who never stopped believing.'],['Wow. Thank you, Gramophone Academy. This means everything.','Go home and make something that scares you.']]);
 S_.push({d:11,on:()=>{A.cl=1;snd('chime');confetti(80)},draw:t=>{const s=Math.min(2.1,1.35+t*.4);stage({clap:1,stand:1,flash:10,nopod:0,screen:scr([['CONGRATULATIONS',70,28],[WIN.n.toUpperCase(),125,34,'#fff'],['SONG OF THE YEAR',170,16]],''),stageDraw:()=>{c.fillStyle='rgba(255,230,140,.12)';c.beginPath();c.moveTo(480,0);c.lineTo(380,404);c.lineTo(580,404);c.fill();person(480,404,s,{up:1,glow:1,you:WIN.you,suit:WIN.you?'#16161c':pick2(WIN.n),hair:'#221'})}});if(Math.random()<.35)confetti(2);
   lower(WIN.n+': "'+spk[0]+'"',t>5?'"'+spk[1]+'"':'',t<5?t/4:Math.max(0,(t-5)/4))}});
 /* 11: outro */
 S_.push({d:3.2,on:()=>{A.cl=.6},draw:t=>{stage({clap:1,flash:6,screen:scr([['THANK YOU & GOODNIGHT',100,26]],'')});c.fillStyle=`rgba(0,0,0,${Math.min(1,t/2.6)})`;c.fillRect(0,0,960,540);TXT('You slip out through the side door...',480,280,26,`rgba(246,216,106,${Math.min(1,t/1.6)})`)}});
 function pick2(n){let h=0;for(const ch2 of n)h=(h*31+ch2.charCodeAt(0))%360;return`hsl(${h},35%,16%)`}
 const finish=()=>{if(A.end)return;A.end=true;cancelAnimationFrame(A.raf);const R2=awS();  const rows=F0.field.map((x,i)=>`<tr style="${x.you?'color:#7fe3ff;font-weight:bold':''}"><td>${i+1}</td><td>${esc(x.n)}</td><td style="opacity:.8">${esc(x.t)}</td><td align=right>${x.sc}</td></tr>`).join('');
  let won=WIN.you;if(won){S.inv=S.inv||{};S.inv.trophy=(S.inv.trophy||0)+1;R2.wins++}R2.hist.push({day:S.day,won:!!won,w:WIN.n,sc:F0.me,top:WIN.sc});
  const r=document.getElementById('awres');r.style.display='flex';r.innerHTML=`<div style="background:#14091c;border:3px solid #c9a227;border-radius:10px;padding:20px 26px;max-width:min(560px,94vw);color:#fff;font-family:Georgia,serif;text-align:center"><h2 style="color:#f6d86a;margin:0 0 6px">${won?'🏆 YOU WON SONG OF THE YEAR!':'Song of the Year: '+esc(WIN.n)}</h2>
   <p style="margin:4px 0 10px;opacity:.9">${won?'A Gramophone Trophy has been added to your Storage. Place it in your house from the Storage menu.':'You were beaten out. Better songs (higher mix quality and more streams) will give you a chance next time.'}</p>
   <table style="width:100%;border-collapse:collapse;font-size:14px;text-align:left"><tr style="opacity:.6"><td></td><td>Artist</td><td>Song</td><td align=right>Score</td></tr>${rows}</table>
   <button id=awlv style="margin-top:14px;padding:10px 20px;font-size:16px" class=go>Leave</button></div>`;
  document.getElementById('awlv').onclick=()=>{removeEventListener('keydown',kd,true);w.remove();AWP=null;mode='play';try{if(IN)leaveShop()}catch(e){}if(won)say('You won a Gramophone Trophy! It is in Storage.');try{autoSave()}catch(e){}}};
 const go=i=>{A.si=i;A.t=0;A.conf.length=0;if(S_[i])S_[i].on()};
 const next=()=>{if(A.si>=S_.length-1)finish();else go(A.si+1)};
 const kd=e=>{if(A.end)return;if([' ','Enter','ArrowRight','Escape'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();e.key=='Escape'?finish():next()}};
 addEventListener('keydown',kd,true);cv.onclick=()=>{if(!A.end)next()};w.querySelector('#awskip').onclick=e=>{e.stopPropagation();finish()};
 let last=performance.now();go(0);
 const loop=n=>{if(A.end)return;const dt=Math.min(.1,(n-last)/1000);last=n;A.t+=dt;const sc=S_[A.si];if(A.t>=sc.d)return next(),A.raf=requestAnimationFrame(loop);
  tickClap(dt);c.clearRect(0,0,960,540);sc.draw(A.t);
  A.conf.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx+=Math.sin(p.y*.05)*.8;p.r+=dt*6;c.fillStyle=p.c;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.fillRect(-3,-2,6,4);c.restore()});A.conf=A.conf.filter(p=>p.y<560);
  bug();const f=Math.min(A.t/.5,1);if(f<1&&A.si==0){c.fillStyle=`rgba(0,0,0,${1-f})`;c.fillRect(0,0,960,540)}A.raf=requestAnimationFrame(loop)};
 A.raf=requestAnimationFrame(loop)}
