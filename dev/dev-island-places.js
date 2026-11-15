/* ===== dev only: two places on the island, the Sunset Beach Club and the Lighthouse (v53.9.0) =====
   Loaded after dev-island-v1.js (it needs the coast, window.FW_ISLAND). Add ?noisland to skip both.
   - Sunset Beach Club: a bar hut, deck, parasols and a small stage on the south-east beach. Now and then (about every 2-4 days,
     once you have a released song) the club EMAILS you (Messages) a sunset gig: day, 18:00-21:00, a fee. Accept or Decline in the
     message. On the day, walk to the stage during the slot and press the prompt: pick up to 3 of your songs and play. The crowd
     reacts to the song quality: fee (70% to 130% of the offer), followers, streams for the songs you played. It costs 20 energy and
     about 2 hours of game time. Miss the slot and the offer lapses (nothing lost). The bar also sells a cheap smoothie.
   - Lighthouse: a striped tower on the north-east headland with a light that turns at night. Climb it once a day for the view:
     +20 energy. It is also a map place, so you can set a guide marker on it.
   State (saved, old saves start empty): S.bcg={last,list:[{id,pay,exp,day,st}]} (st 0 offer, 1 booked, 2 declined, 3 played, 4 expired, 5 missed),
   S.lhDay (the day you last climbed the lighthouse), S.bcBar (the day of your last smoothie). */
(function(){
if(!window.FW_ISLAND||/[?&]noisland/.test(location.search))return;
if(typeof THREE=='undefined'||typeof WORLD=='undefined'||typeof S=='undefined')return;
const FI=window.FW_ISLAND,G=FI.grass;
const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1));
const fm=n=>'$'+Math.round(n).toLocaleString('en-US'),fmt=n=>Math.round(n).toLocaleString('en-US');
const E=s=>{try{return esc(s)}catch(e){return String(s)}};
const sv=()=>{try{autoSave()}catch(e){}};
const sn=k=>{try{snd(k)}catch(e){}};
const FL=()=>{try{return fameLevel()||0}catch(e){return 0}};
const away=()=>{try{if(window.TRAVEL&&TRAVEL.abroad())return true}catch(e){}try{return !!(window.DCITY&&DCITY.on)}catch(e){return false}};
const hm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0');
const SLOT=[1080,1260];/* 18:00-21:00, minutes since midnight */
const mins=()=>{try{return festMins()}catch(e){const t=S.t||0;return t<300?360+t*2.8:1200+(t-300)*2}};

/* ---------- where they go: scan to the grass edge, then stand back from the beach ---------- */
function edge(x,z0,dz){let z=z0;while(inPoly(G,x,z+dz)&&Math.abs(z-z0)<900)z+=dz;return z}
const CLUB_X=600,CLUB_Z=edge(CLUB_X,120,3)-36;/* land to the north, sea to the south */
const LH_X=690,LH_Z=edge(LH_X,-60,-3)+26;
const NAV=[[CLUB_X,CLUB_Z,'Beach Club','#ff7ab8'],[LH_X,LH_Z,'Lighthouse','#ffe27a']];
NAV.forEach(p=>{try{if(!POIS.some(q=>q[2]==p[2]))POIS.push(p)}catch(e){}});

/* ---------- 3D ---------- */
const root=new THREE.Group();root.name='islandPlaces';WORLD.add(root);
const cyl=(g,rt,rb,h,c,x,y,z,seg,basic)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),basic?new THREE.MeshBasicMaterial({color:c}):M(c));m.position.set(x,y,z);g.add(m);return m};
function label(g,text,w,h,x,y,z,bg,fg,ry){const cv=document.createElement('canvas');cv.width=w*128;cv.height=h*128;const c=cv.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,cv.width,cv.height);
 c.strokeStyle=fg;c.lineWidth=6;c.strokeRect(6,6,cv.width-12,cv.height-12);c.fillStyle=fg;c.font='bold '+Math.round(cv.height*.46)+'px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(text,cv.width/2,cv.height/2+3);
 const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m}
function palm(g,x,z,s){s=s||1;cyl(g,.18*s,.28*s,5*s,'#8a6a40',x,2.5*s,z,6);for(let i=0;i<6;i++){const a=i/6*6.283,l=new THREE.Mesh(geo(2.6*s,.08,.7*s),M(i%2?'#2f8f4a':'#3aa056'));l.position.set(x+Math.cos(a)*1.1*s,5.1*s-.25*s,z+Math.sin(a)*1.1*s);l.rotation.y=-a;l.rotation.z=.35;g.add(l)}}
function parasol(g,x,z,c){cyl(g,.05,.05,2.4,'#ddd',x,1.2,z,5);const k=new THREE.Mesh(new THREE.ConeGeometry(1.6,.7,10),M(c));k.position.set(x,2.55,z);g.add(k);B(g,.9,.4,.9,'#f3e7c2',x+1.5,.2,z+.2).rotation.y=.4}
const solids=[];
function solid(x0,z0,x1,z1){const q=[x0,z0,x1,z1];solids.push(q);cols.push(q)}

function buildClub(){const g=new THREE.Group();g.position.set(CLUB_X,0,CLUB_Z);root.add(g);
 B(g,26,.3,17,'#c9a46a',0,.15,0);/* deck */
 for(let i=-12;i<=12;i+=2)B(g,.05,.02,17,'#a98450',i,.31,0);
 /* bar hut at the back */
 B(g,11,3.2,4.2,'#e9d9b4',-4.5,1.9,-5.6);B(g,11.6,.25,4.8,'#7a5a2a',-4.5,3.6,-5.6);
 const th=new THREE.Mesh(new THREE.BoxGeometry(12.6,.5,5.8),M('#b8924a'));th.position.set(-4.5,3.95,-5.6);th.rotation.x=-.0;g.add(th);
 [-1,1].forEach(a=>{const r=new THREE.Mesh(new THREE.BoxGeometry(12.6,.4,3.2),M('#a8823c'));r.position.set(-4.5,4.5,-5.6+a*1.2);r.rotation.x=a*.45;g.add(r)});
 B(g,10,1.1,1.1,'#5a3a22',-4.5,.9,-3.1);B(g,10.2,.12,1.3,'#8a5a32',-4.5,1.5,-3.1);
 [-8,-6,-4,-2].forEach((x,i)=>{cyl(g,.35,.3,.9,'#8a5a32',x-1,.75,-1.7,8);B(g,.5,.1,.5,['#ff7ab8','#ffd23d','#3ad0ff','#6be08c'][i],x-1,1.25,-1.7)});
 label(g,'SUNSET BEACH CLUB',9,1.3,-4.5,5.3,-2.9,'#ff5e9c','#fff3d6');
 /* stage on the east side, facing the crowd (north) */
 B(g,11,.9,6,'#3a2a22',7,.75,2.4);B(g,11,.12,6,'#e8c27a',7,1.26,2.4);
 B(g,11,5.4,.5,'#1c1620',7,3.9,-.2);B(g,10,.6,.3,'*#ff7ab8',7,6.3,.1);label(g,'LIVE AT SUNSET',8,1.1,7,5.3,.1,'#1c1620','#ffd27a');
 [-1,1].forEach(a=>{B(g,1.4,2.4,1.1,'#111',7+a*4.4,2.7,.9);B(g,.8,.8,.1,'*#2a2a2a',7+a*4.4,3.2,1.5);B(g,.4,.4,.1,'*#2a2a2a',7+a*4.4,2.1,1.5);B(g,.25,5.4,.25,'#555',7+a*5.2,3.6,4.9)});
 B(g,11,.2,.2,'#555',7,6.4,4.9);for(let i=0;i<7;i++)B(g,.3,.3,.3,'*'+['#ff7ab8','#ffd23d','#3ad0ff'][i%3],7-5+i*1.66,6.2,4.9);
 B(g,.06,1.5,.06,'#222',7,1.9,2.2);B(g,.2,.25,.2,'#555',7,2.7,2.2);/* mic stand */
 /* string lights over the deck */
 for(let i=0;i<=12;i++){const t=i/12;B(g,.16,.16,.16,'*'+['#ffd27a','#ff8ad0','#8ad8ff'][i%3],-12+t*24,4.2-Math.sin(t*Math.PI)*.6,-1)}
 [-12,12].forEach(x=>B(g,.12,4.3,.12,'#333',x,2.15,-1));
 /* sand furniture and palms */
 parasol(g,-9,4.5,'#ff7ab8');parasol(g,-4,7,'#ffd23d');parasol(g,1,5.5,'#3ad0ff');parasol(g,-12.5,9,'#6be08c');
 palm(g,-14.5,-2,1.1);palm(g,15.5,-4,1);palm(g,-15,6.5,.9);palm(g,16,8,1.2);
 /* solid: the bar and the stage; the deck and front stay open */
 solid(CLUB_X-10,CLUB_Z-7.8,CLUB_X+1.2,CLUB_Z-2.4);solid(CLUB_X+1.4,CLUB_Z-.6,CLUB_X+12.6,CLUB_Z+5.4);
 const mk=new THREE.Group();B(mk,.6,.6,.6,'*#ff7ab8',0,0,0);mk.rotation.set(Math.PI/4,0,Math.PI/4);mk.position.set(7,8.4,2.4);g.add(mk);g.userData.mk=mk;
 return g}

function buildLight(){const g=new THREE.Group();g.position.set(LH_X,0,LH_Z);root.add(g);
 cyl(g,4.6,5.2,1.2,'#8d9096',0,.6,0,16);/* rock base */
 const bands=[['#f4f1ea',3.3,2.8],['#d6402f',2.9,2.55],['#f4f1ea',2.55,2.3],['#d6402f',2.3,2.05],['#f4f1ea',2.05,1.85]];let y=1.2;
 bands.forEach(([c,rb,rt],i)=>{const h=4.2;cyl(g,rt,rb,h,c,0,y+h/2,0,16);y+=h});
 cyl(g,2.5,2.5,.35,'#2a2a2e',0,y+.17,0,16);/* gallery floor */
 cyl(g,2.4,2.4,.12,'#2a2a2e',0,y+1.1,0,16);
 for(let i=0;i<16;i++){const a=i/16*6.283;B(g,.1,.9,.1,'#2a2a2e',Math.cos(a)*2.4,y+.7,Math.sin(a)*2.4)}
 const lant=cyl(g,1.1,1.1,1.8,'#ffe9a8',0,y+1.4,0,12,true);lant.material.transparent=true;lant.material.opacity=.85;g.userData.lant=lant;
 const roof=new THREE.Mesh(new THREE.ConeGeometry(1.7,1.4,12),M('#d6402f'));roof.position.set(0,y+3,0);g.add(roof);cyl(g,.12,.12,.9,'#2a2a2e',0,y+4.1,0,6);
 B(g,1,1.8,.3,'#3a2a22',0,2.1,3.05);/* door */
 /* the beam: two flat wedges that turn, only visible after dark */
 const beam=new THREE.Group();beam.position.y=y+1.4;g.add(beam);
 const bm=new THREE.MeshBasicMaterial({color:0xfff2b0,transparent:true,opacity:.32,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 [1,-1].forEach(a=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(60,5),bm);w.position.set(a*30,0,0);w.rotation.x=-Math.PI/2;beam.add(w)});
 g.userData.beam=beam;g.userData.beamMat=bm;g.userData.top=y+1.4;
 solid(LH_X-3.6,LH_Z-3.6,LH_X+3.6,LH_Z+3.6);
 return g}
let club=null,light=null,built=false;
function build(){if(built)return;built=true;try{club=buildClub()}catch(e){console.error('beach club',e)}try{light=buildLight()}catch(e){console.error('lighthouse',e)}
 /* prompts */
 INT.push({x:CLUB_X+7,z:CLUB_Z+8.5,r:4.2,l:'Sunset Beach Club stage',a:()=>stageUse(),bc:'stage'});
 INT.push({x:CLUB_X-4.5,z:CLUB_Z-.2,r:2.6,l:'Beach bar: smoothie $8',a:()=>bar(),bc:'bar'});
 INT.push({x:LH_X,z:LH_Z+4.4,r:3,l:'Climb the Lighthouse',a:()=>climb(),lh:1})}

/* ---------- state ---------- */
function st(){if(!S.bcg||typeof S.bcg!='object')S.bcg={last:-999,list:[]};if(!Array.isArray(S.bcg.list))S.bcg.list=[];return S.bcg}
const find=id=>st().list.find(o=>o.id===id);
const booked=()=>st().list.find(o=>o.st==1);
const best=()=>(S.songs||[]).slice().sort((a,b)=>(b.q||0)-(a.q||0));
const scale=()=>.35+FL()*.08+Math.sqrt(S.listeners||0)*.0004;
function baseFee(){return Math.max(100,Math.round((120+FL()*30+Math.sqrt(S.listeners||0)*.35)*(.85+Math.random()*.3)/10)*10)}
const note=(from,body)=>{S.msgs.push({id:S.nid++,from:from||'Sunset Beach Club',state:9,unread:1,day:S.day,body})};

/* ---------- the email ---------- */
function offer(){const s=st(),o={id:S.nid++,pay:baseFee(),exp:S.day+2,day:S.day+ri(1,3),st:0};s.list.push(o);s.last=S.day;if(s.list.length>12)s.list=s.list.slice(-12);
 S.msgs.push({id:S.nid++,from:'Sunset Beach Club Bookings',state:9,unread:1,day:S.day,bcg:o.id,
  body:'Hi '+(S.artist||'there')+'! Mara here, I book the stage at the Sunset Beach Club on the south-east beach. We would love you to play our golden hour set on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+'. Pick up to three songs. Fee: '+fm(o.pay)+' (a good crowd means a bit more, a quiet one a bit less), paid when you come off stage. Just be at the stage in that window. This offer stands until Day '+o.exp+'.'});
 try{snd('ping');say('Sunset Beach Club emailed you a gig offer. Check Messages.')}catch(e){}try{updateVersion()}catch(e){}}
window.bcgAccept=function(mid){const m=S.msgs.find(x=>x.id==mid),o=m&&find(m.bcg);if(!o||o.st!=0)return;if(S.day>o.exp){o.st=4;return pcR()}
 if(booked()){sn('err');return say('You already have a Beach Club gig booked.')}
 o.st=1;note(m.from,'Booked! See you on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+', at the stage on the beach. Sound check is on us.');
 sn('chime');say('Beach Club gig booked for Day '+o.day+'.');try{updateVersion()}catch(e){}pcR()};
window.bcgDecline=function(mid){const m=S.msgs.find(x=>x.id==mid),o=m&&find(m.bcg);if(!o||o.st!=0)return;o.st=2;sn('pop');pcR()};
{const pm=PA.msg;PA.msg=function(){let h=pm.apply(this,arguments);const m=S.msgs.find(x=>x.id==S.chat);
 if(m&&m.bcg!=null){const o=find(m.bcg);
  if(o&&o.st==0&&S.day<=o.exp)h=h.replace(/<div class=cin><small[^>]*>Official account\. No replies\.<\/small><\/div>/,`<div class=cin style="gap:8px;padding:8px"><button class=go onclick="bcgAccept(${m.id})">Accept ${fm(o.pay)} gig</button><button onclick="bcgDecline(${m.id})">Decline</button></div>`);
  else if(o)h=h.replace(/Official account\. No replies\./,o.st==2?'You declined this offer.':o.st==1||o.st==3||o.st==5?'You accepted this offer.':'This offer has expired.')}
 return h}}
/* every morning: lapse old offers, remind on gig day, miss a gig that was not played, maybe a new offer */
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{const s=st();
 s.list.forEach(o=>{if(o.st==0&&S.day>o.exp)o.st=4;
  if(o.st==1&&S.day>o.day){o.st=5;note('Sunset Beach Club Bookings','We missed you on Day '+o.day+'. No hard feelings, but we gave the slot away. Maybe next time.')}
  if(o.st==1&&S.day==o.day){note('Sunset Beach Club Bookings','Today is the day! Be at the stage on the beach between '+hm(SLOT[0])+' and '+hm(SLOT[1])+'.');try{say('Beach Club gig tonight, 18:00 to 21:00.')}catch(e){}}});
 if(S.artist&&(S.songs||[]).length&&!s.list.some(o=>o.st==0||o.st==1)&&S.day-s.last>=2&&Math.random()<.5)offer()}catch(e){console.error('beach club offers',e)}return r}}

/* ---------- the stage ---------- */
function stageUse(){if(mode!='play'||away())return;const o=booked();
 if(!o){sn('err');return say('Nobody is booked on this stage. Watch Messages for a Beach Club gig offer.')}
 if(S.day<o.day){sn('err');return say('Your Beach Club gig is on Day '+o.day+', '+hm(SLOT[0])+' to '+hm(SLOT[1])+'.')}
 const m=mins();if(m<SLOT[0]){sn('err');return say('Doors open at '+hm(SLOT[0])+'. Come back for your slot.')}
 if(m>=SLOT[1]){sn('err');return say('Your slot is over.')}
 if((S.energy||0)<15){sn('err');return say('You are too tired to play. Rest or eat first.')}
 mode='menu';PICK=[];setUI(o)}
let PICK=[];
function setUI(o){const L=best().slice(0,8);
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(520px,94vw)"><div class=pehd><span class=pek>Sunset Beach Club · ${hm(SLOT[0])}-${hm(SLOT[1])}</span><h2>Golden hour set</h2></div><div class=pebd>
 <p class=pebl>Pick up to three songs. Higher quality songs make the crowd go wild. Fee ${fm(o.pay)}, more or less depending on the crowd.</p>
 <div class=pelist>${L.map(s=>`<button class=pesong style="${PICK.includes(s.id)?'outline:2px solid #ff7ab8':''}" onclick="bcPick(${s.id})"><b>${PICK.includes(s.id)?'✓ ':''}${E(s.title)}</b><small>${E(s.g)} · quality ${Math.round(s.q||0)} · ${fmt(s.streams||0)} streams</small></button>`).join('')}</div>
 <div class=row2><button class=go ${PICK.length?'':'disabled'} onclick="bcPlay()">Play ${PICK.length||''} song${PICK.length==1?'':'s'}</button><button onclick="closeUI()">Not now</button></div></div></div>`}
window.bcPick=function(id){const o=booked();if(!o||mode!='menu')return;const i=PICK.indexOf(id);if(i>=0)PICK.splice(i,1);else if(PICK.length<3)PICK.push(id);else{sn('err');return}sn('pop');setUI(o)};
window.bcPlay=function(){const o=booked();if(!o||!PICK.length)return;const L=PICK.map(id=>(S.songs||[]).find(x=>x.id==id)).filter(Boolean);if(!L.length)return;
 const q=L.reduce((a,s)=>a+(s.q||0),0)/L.length,r=Math.min(1,Math.max(.1,q/100+rnd(-.12,.12)+(L.length-1)*.03)),crowd=Math.round((60+r*240)*scale());
 const pay=Math.round(o.pay*(.7+.6*r)),fol=Math.max(0,Math.round(crowd*r*.5));
 S.money=+((S.money||0)+pay).toFixed(2);S.earn=(S.earn||0)+pay;S.followers=(S.followers||0)+FOLN(fol);
 L.forEach(s=>{const st2=Math.round(crowd*(1+r*3)/L.length);try{addSt(s,st2)}catch(e){s.streams=(s.streams||0)+st2;S.streams=(S.streams||0)+st2}if(S.hype&&S.hype[s.g]!=null)S.hype[s.g]=+Math.min(2,(S.hype[s.g]||1)+.1).toFixed(2)});
 S.energy=Math.max(0,(S.energy||0)-20);try{S.t=Math.min(599,(S.t||0)+43)}catch(e){}
 o.st=3;PICK=[];sv();sn('cash');try{updateVersion()}catch(e){}
 const line=r>.8?'The whole beach sang along as the sun went down.':r>.6?'Hands up all the way back to the bar.':r>.4?'A warm crowd, lots of phones out.':'A slow start, but people drifted over and stayed.';
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(520px,94vw)"><div class=pehd><span class=pek>Sunset Beach Club</span><h2>What a sunset</h2></div><div class=pebd><div class=peres><h3>${line}</h3><p>About <b>${fmt(crowd)}</b> people came. You played ${L.map(s=>'<b>'+E(s.title)+'</b>').join(', ')}.</p><p>Fee <b>${fm(pay)}</b> · <b>+${fmt(fol)} followers</b> · more streams on the songs you played.</p></div><div class=row2><button class=go onclick="closeUI()">Nice</button></div></div></div>`;
 note('Sunset Beach Club Bookings','Thank you for tonight, '+(S.artist||'')+'! '+fmt(crowd)+' people on the sand and a '+fm(pay)+' fee on its way to you. Come back anytime.')};

/* ---------- the bar ---------- */
function bar(){if(mode!='play'||away())return;if(S.bcBar===S.day){sn('err');return say('Mara says: one smoothie a day, you will float away!')}
 if((S.money||0)<8){sn('err');return say('A smoothie is $8.')}if((S.energy||0)>=100){sn('err');return say('You are already full of energy.')}
 S.money=+(S.money-8).toFixed(2);S.energy=Math.min(100,(S.energy||0)+12);S.bcBar=S.day;sv();sn('eat');say('Mango smoothie. +12 energy.')}

/* ---------- the lighthouse ---------- */
function climb(){if(mode!='play'||away())return;
 if(S.lhDay===S.day){sn('err');return say('You already took in the view today. Come back tomorrow.')}
 mode='menu';const night=(S.t||0)>=300;
 $('ui').innerHTML=`<div class="box modal pe" style="width:min(520px,94vw)"><div class=pehd><span class=pek>Island Lighthouse</span><h2>The lookout</h2></div><div class=pebd>
 <div style="height:130px;border:2px solid #000;margin-bottom:10px;background:linear-gradient(${night?'#0b1230 0%,#1d2f6b 55%,#0e3a66 55%,#0a2347 100%':'#7cc4ee 0%,#cfeaf8 52%,#2b87c8 52%,#1d5f9c 100%'})"></div>
 <p class=pebl>${night?'The beam sweeps over black water and the city lights glow behind you.':'Gulls wheel below. You can see the whole island from up here: the park, the runway, the beach club.'}</p>
 <div class=row2><button class=go onclick="lhBreathe()">Breathe in the sea air (+20 energy)</button><button onclick="closeUI()">Back down</button></div></div></div>`}
window.lhBreathe=function(){if(S.lhDay===S.day)return closeUI();S.lhDay=S.day;S.energy=Math.min(100,(S.energy||0)+20);sv();sn('chime');closeUI();say('Fresh sea air. +20 energy.')};

/* ---------- every frame ---------- */
let spin=0;
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{
 if(mode=='title')return r;if(!built)build();const off=away();root.visible=!off;if(off)return r;spin+=dt||0;
 const night=(S.t||0)>=290,o=booked(),m=mins();
 const open=o&&S.day==o.day&&m>=SLOT[0]&&m<SLOT[1];
 INT.forEach(i=>{if(i.bc=='stage')i.l=open?'Play your Beach Club set':o?(S.day<o.day?'Beach Club gig on Day '+o.day:m<SLOT[0]?'Beach Club gig at '+hm(SLOT[0]):'Beach Club gig (over)'):'Sunset Beach Club stage';
  if(i.bc=='bar')i.l=S.bcBar===S.day?'Beach bar (smoothie taken today)':'Beach bar: smoothie $8';
  if(i.lh)i.l=S.lhDay===S.day?'Lighthouse (visited today)':'Climb the Lighthouse'});
 if(club&&club.userData.mk){const k=club.userData.mk;k.visible=!!open;k.rotation.y=spin*1.6;k.position.y=8.4+Math.sin(spin*2.2)*.25}
 if(light){const u=light.userData;u.beam.rotation.y=spin*.9;u.beam.visible=night;u.lant.material.color.set(night?0xfff2b0:0xcfd8c0)}
 }catch(e){if(!window.__ipErr){window.__ipErr=1;console.error('island places',e)}}return r}}
})();
