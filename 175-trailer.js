/* ===== v49.4.0: the game trailer (wavefern.com/trailer) =====
   wavefern.com/trailer opens the game in trailer mode (trailer/index.html loads the game with FW_TRAILER set). A menu lets you
   play a scripted trailer, about 75 seconds, made to be screen recorded. It is real gameplay in the game's own camera:
   the title screen, making a character, picking an artist name, messaging an artist, the collab meeting and session, the
   recording minigame, Spotifly, walking the city, driving, the wardrobe, the Gphone, the map, a Main Stage festival set,
   the World Tour app, Tokyo and a stadium show, with a few plain title cards and the end card. Track 1 of the soundtrack
   plays over it, cut so the beat drops on the collab session; every other game sound and all game music are muted.
   A pointer moves and clicks through the menus like a player would. Each scene can be played on its own (it plays on to
   the end). Esc stops it and reloads the page.
   Nothing is saved in trailer mode: it runs on a fresh career, and your own careers and cloud save are never touched. */
const TRL={on:!!(window.FW_TRAILER||/[?&]trailer\b/.test(location.search)),run:0,T:0,t0:0,i:-1,shots:[],len:0,
 opt:{music:1,cap:1},name:'',song:'Night Bus',aud:null,zoom:0,cur:null,typ:null,scr:null,art:-1,
 SRC:'assets/track1.mp3',MO:0,DROP:24.45,BAR:2.043,BEAT:.5108,HIT:24.42,custom:0};
/* track 1: a quiet build to 24.45 s, then the beat (bars of 2.043 s). The music clock starts at MO. */

/* ---------- all game audio is muted on the trailer page: only the trailer track plays ---------- */
if(TRL.on){
 const A0=window.AudioContext||window.webkitAudioContext;
 if(A0){const M=function(...a){const c=new A0(...a);try{const g=c.createGain();g.gain.value=0;g.connect(c.destination);Object.defineProperty(c,'destination',{get:()=>g})}catch(e){}return c};
  M.prototype=A0.prototype;window.AudioContext=M;if(window.webkitAudioContext)window.webkitAudioContext=M}
 const p0=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this!==TRL.aud)this.muted=true;return p0.apply(this,arguments)};
 try{if(typeof AC!='undefined'&&AC&&typeof MG!='undefined'&&MG)MG.gain.value=0}catch(e){}}

const trlE={io:u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,s:u=>u*u*(3-2*u)};
const trlEsc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
function trlPut(x,z,rot){P.x=x;P.z=z;P.rot=rot||0;camT.x=x;camT.z=z;if(P.mesh)P.mesh.visible=true}
function trlKeys(k){for(const q in keys)delete keys[q];(k||'').split('').forEach(c=>keys[c]=1)}
function trlQ(sel,re){const L=[...document.querySelectorAll(sel)];return re?L.find(e=>re.test(e.textContent.trim())):L[0]}
function trlClear(){trlKeys('');try{if(mode=='drive')exitDrive()}catch(e){}try{closePhone()}catch(e){}try{if(FEST.view)festViewOff()}catch(e){}
 try{const m=$('fsg');if(m)m.remove()}catch(e){}if(FEST.set)FEST.set=null;try{if(IN)leaveShop()}catch(e){}
 rec=null;MEET=null;$('ui').innerHTML='';if(mode!='dshow')mode='play';PAUSED=0;if(P.mesh)P.mesh.visible=true}
function trlHome(){try{if(DCITY.on)DCITY.leave(1)}catch(e){}}
/* a fictional artist to message and collab with (never one of the real artists) */
function trlArtist(){if(TRL.art>=0)return TRL.art;let b=-1;ART.forEach((a,i)=>{if(!a[8]&&a[4]&&a[2]>=1e4&&a[2]<=5e6&&(b<0||a[2]>ART[b][2]))b=i});if(b<0)b=ART.findIndex(a=>!a[8]&&a[4]);TRL.art=b;return b}
function trlConv(){const i=trlArtist();let m=S.msgs.find(x=>x.a===i);if(!m){newConv(i,1);m=S.msgs.find(x=>x.a===i)}return m}
function trlName(){if(!S.artist)S.artist=TRL.name||'Fern Wave'}
/* the career after the drop: the money, fame and toys of a rising star, still your character */
function trlStar(){if(TRL.star)return;TRL.star=1;trlName();
 Object.assign(S,{money:Math.max(S.money||0,2.4e6),energy:100,stam:100,listeners:Math.max(S.listeners||0,3.8e6),followers:Math.max(S.followers||0,1.2e6),
  bling:2,garage:1,guards:0,gs:'follow',pets:[0],petsOut:1,cars:CARS.map((c,i)=>i),cheat:1});
 S.apps=S.apps||{};Object.keys(APPD).forEach(k=>S.apps[k]=1);S.phone=Math.max(S.phone||0,12);delete S.noPhone;
 const T=[TRL.song||'Night Bus','Gold Rush','Neon Rain','Fernfield','Midnight Drive','Paper Planes'];
 T.forEach((t,i)=>{if(!S.songs.some(s=>s.title==t))S.songs.push({id:9e5+i,title:t,g:GEN[i%4],q:88-i*3,day:Math.max(1,S.day-i*3),streams:Math.round(2.6e7/(i+1)),today:Math.round(9e5/(i+1))})});
 [()=>parkCars(),()=>syncF(),()=>buildStudio(),()=>refresh(),()=>syncArt()].forEach(f=>{try{f()}catch(e){}})}
function trlFestDay(){if(S.day%7)S.day=Math.ceil(S.day/7)*7;S.wx={d:S.day,k:'sun'};try{festSync()}catch(e){}}
function trlShow(){if(TRL.showOn)return;TRL.showOn=1;try{trlStar();if(!DCITY.on||DCITY.id!='tyo')DCITY.arrive('tyo',{quiet:1});const id=DCITY.id;
 S.dcity=S.dcity||{};S.dcity.prep=S.dcity.prep||{};S.dcity.prep[id+'|venue']={songs:S.songs.slice(-6).map(s=>s.id),prod:{pyro:1,lasers:1,confetti:1,dancers:1},reh:2,rd:S.day};
 S.money=Math.max(S.money,1e7);S.energy=100;S.t=Math.max(S.t,380);const cu=$('dscut');if(cu)cu.remove();document.body.classList.remove('dscut');DCITY.view=null;trlClear();DCITY.startShow('venue')}catch(e){console.error('trailer show',e)}}

/* ---------- the shots ----------
   d: length in seconds. set(): run on the first frame. acts: [time in shot, fn]. zoom: the game camera's view height
   (smaller is closer; 0 leaves the game's own). show: page parts that stay visible (everything else, like the HUD and
   pop-ups, is hidden). card: a plain black title card. */
function trlShots(){const B=TRL.BAR,b=TRL.BEAT;
 const L=[
 {sc:'Title screen',d:3.2,show:['ui'],set(){trlHome();try{titleOpen()}catch(e){}PAUSED=0},acts:[[.5,()=>trlMove(()=>trlQ('#ttl button',/Single player|^Play$/),1.6)]]},
 {sc:'Make a character',d:7.6,show:['ui'],set(){trlFresh(1);TT.on=0;try{pauseOverlay(0)}catch(e){}PAUSED=0;mode='creator';creatorUI()},
  acts:[[.15,()=>trlClick(()=>trlCre('hair',1),.7)],[1.15,()=>trlClick(()=>trlCre('hair',1),.35)],[1.85,()=>trlClick(()=>trlSw(1,5),.7)],
   [2.95,()=>trlClick(()=>trlCre('top',1),.75)],[3.95,()=>trlClick(()=>trlSw(3,6),.65)],[4.9,()=>trlClick(()=>trlSw(4,1),.6)],[5.9,()=>trlClick(()=>trlQ('#cre button',/Confirm/),.85,()=>{})]]},
 {sc:'Card: start',d:1.6,card:'YOU START WITH $100<br>AND A LAPTOP.'},
 {sc:'Artist name',d:4.6,show:['ui'],set(){trlClear();trlHome();S.t=40;trlPut(6,2.9,Math.PI);S.artist='';openPC();app=1;smo=0;pcR()},
  acts:[[.25,()=>trlClick(()=>$('an'),.7,()=>{const i=$('an');if(i)i.focus()})],[1.1,()=>trlType(()=>$('an'),TRL.name||'Fern Wave')],[3.1,()=>trlClick(()=>trlQ('#pc button',/Create profile/),.6)]]},
 {sc:'Message an artist',d:4.6,show:['ui'],set(){trlClear();trlName();S.t=60;trlPut(6,2.9,Math.PI);const m=trlConv();m.unread=0;openPC();app='msg';S.chat=m.id;smo=0;pcR()},
  acts:[[.25,()=>trlClick(()=>$('cin'),.7,()=>{const i=$('cin');if(i)i.focus()})],[1.05,()=>trlType(()=>$('cin'),'love your stuff. collab?')],[3.1,()=>trlClick(()=>trlQ('#pc button',/^Send$/),.5)]]},
 {sc:'Collab meeting',d:2.4,show:['ui'],set(){trlClear();trlName();S.t=150;const m=trlConv();m.state=1;try{syncArt()}catch(e){}const o=ART_M.find(q=>q.i===trlArtist());
   /* meet on the street outside your house rather than inside a venue */if(o){o.x=40;o.z=13.4;o.m.position.set(o.x,0,o.z);trlPut(o.x-2.6,o.z+.5,Math.PI/2);try{collab(o)}catch(e){}}},zoom:6,
  acts:[[.35,()=>trlClick(()=>trlQ('#ui .mto'),.65)]]},
 /* the drop: the city from above, the one shot not tied to the player */
 {sc:'City reveal',d:2*B,drop:1,show:[],set(){trlClear();trlStar();S.t=262;trlPut(590,40,0)},cam:trlCam([[470,74,170],[606,0,40],44],[[520,52,124],[612,0,34],40],trlE.o)},
 {sc:'Collab session',d:B,show:[],set(){trlClear();const o=ART_M.find(q=>q.i===trlArtist())||ART_M[0];if(o){o.x=13.6;o.z=2.6;o.m.position.set(o.x,0,o.z);o.m.rotation.y=-Math.PI/2;mode='cut';cs2={o,t:0,op:1};trlPut(o.x-1.4,o.z,Math.PI/2)}}},
 {sc:'Recording',d:2*B,show:['ui','hud','mg'],set(){trlClear();S.t=200;S.energy=100;trlPut(12.2,2.3,Math.PI);try{startRec(0)}catch(e){}},rec:1},
 {sc:'Spotifly',d:B,show:['ui'],set(){trlClear();openPC();app=1;smo=0;pg='home';pcR()},acts:[[.2,()=>trlScroll('#pc .mn',150,1.3)]]},
 {sc:'City',d:2*B,show:[],set(){trlClear();S.t=262;trlPut(566,26.2,Math.PI/2);trlKeys('ds')},zoom:7.5},
 {sc:'Fern Road',d:B,show:[],set(){trlClear();S.t=272;trlPut(44,14.2,Math.PI/2);trlKeys('ds')},cam:u=>{const x=P.x;return{p:[x+7.5,1.25,20.5],l:[x,1.2,14.2],f:42}}},
 {sc:'Drive',d:2*B,show:[],set(){trlClear();S.t=278;trlPut(60,14,0);const c=PK[PK.length-1];if(c){dr=c;c.x=60;c.z=17.4;c.h=Math.PI/2;c.v=14;c.m.position.set(c.x,0,c.z);c.m.rotation.y=c.h;P.mesh.visible=false;mode='drive';trlKeys('w')}}},
 {sc:'Wardrobe',d:2*b,show:['ui'],set(){trlClear();S.t=120;trlPut(2.6,4.4,-Math.PI/2);try{wardrobe()}catch(e){}}},
 {sc:'Gphone',d:2*b,show:['ph'],set(){trlClear();S.t=268;trlPut(40,14.2,Math.PI/2);try{openPhone()}catch(e){}}},
 {sc:'Map',d:2*b,show:['ui'],set(){trlClear();S.t=268;trlPut(560,20,0);try{bigMap()}catch(e){}}},
 {sc:'Crew',d:2*b,crew:1,show:[],set(){trlClear();S.t=300;trlPut(30,14.2,Math.PI/2);FOL.forEach(f=>{if(!f.home){f.x=P.x+f.ox-1.5;f.z=P.z+f.oz}});trlKeys('ds')},zoom:5.5},
 {sc:'Festival',d:2*B,show:[],set(){trlClear();trlFestDay();S.t=392;trlPut(364,-100,0);try{festStartBooked({n:1,slot:3,songs:S.songs.slice(-4).map(s=>s.id)})}catch(e){console.error(e)}}},
 {sc:'Festival crowd',d:B,show:[],set(){trlClear();S.t=396;trlPut(364,-112.5,0);P.mesh.visible=true},cam:trlCam([[364,22,-30],[364,2,-104],46],[[364,13,-58],[364,3,-110],48],trlE.s)},
 {sc:'World Tour app',d:B,show:['ui'],set(){trlClear();trlHome();openPC();app='wtour';smo=0;pcR()},acts:[[.2,()=>trlMove(()=>trlQ('#pc .win svg')||trlQ('#pc .mn'),1.1)]]},
 {sc:'Card: tour',d:B,card:'THEN TAKE IT<br>ON TOUR.',acts:[[.05,()=>{trlClear();trlStar();S.t=392;try{if(DCITY.on)DCITY.leave(1);DCITY.arrive('tyo')}catch(e){console.error(e)}}]]},
 /* the game's own arrival flyover, with its city title */
 {sc:'Tokyo',d:2*B,show:['dscut'],set(){if(!DCITY.on)try{DCITY.arrive('tyo')}catch(e){}},acts:[[2*B-.35,()=>trlShow()]]},
 {sc:'Stadium',d:2*B,show:[],set(){trlShow()},cam:u=>{const k=trlE.s(u);/* from the crowd, pushing in on you on stage */return{p:[P.x+3.2-k*2.2,2.1-k*.3,P.z+16-k*9],l:[P.x,2.3,P.z],f:44}}},
 {sc:'Stadium wide',d:2*B,show:[],set(){trlShow()},cam:u=>{const k=trlE.s(u);/* rising back over the whole crowd */return{p:[P.x-6+k*12,4+k*20,P.z+24+k*34],l:[P.x,3,P.z+6],f:52}}},
 {sc:'End card',d:9,end:1}];
 /* the build before the drop stretches to wherever the drop is in the track */
 const k=TRL.DROP/24;L.forEach(s=>{if(s.dropped)return});let pre=1;L.forEach(s=>{if(s.drop)pre=0;if(pre){s.d*=k;(s.acts||[]).forEach(a=>a[0]*=k)}});
 let t=0;L.forEach((s,i)=>{s.k=i;s.t=t;t+=s.d});TRL.len=t;return L}
function trlCam(A,B2,e){return u=>{const k=(e||trlE.s)(u),m=(a,b)=>a.map((v,i)=>v+(b[i]-v)*k);return{p:m(A[0],B2[0]),l:m(A[1],B2[1]),f:A[2]+(B2[2]-A[2])*k}}}

/* ---------- a fresh career for the trailer, so no real save is ever used ---------- */
function trlFresh(plain){try{resetState()}catch(e){}TRL.star=0;TRL.showOn=0;TRL.art=-1;trlHome();
 /* the creator starts plain; any later scene starts with the look the creator ends on */
 ch=plain?{skin:2,eyes:0,mouth:0,hair:0,hc:0,top:0,tc:0,pc:0,body:.4,hgt:.5}:{skin:2,eyes:0,mouth:0,hair:2,hc:5,top:1,tc:6,pc:1,body:.4,hgt:.5};S.tut={v:2,on:0,seen:{},f:{},g:1};S.wx={d:S.day,k:'sun'};
 [()=>refresh(),()=>parkCars(),()=>syncF(),()=>buildStudio(),()=>buildLots(),()=>syncArt()].forEach(f=>{try{f()}catch(e){}});trlPut(4.5,3.8,0);S.t=20}
function trlCre(k,d){const R=[...document.querySelectorAll('#cre .r')].find(r=>r.querySelector('span')&&r.querySelector('span').textContent==({hair:'Hairstyle',top:'Clothes',eyes:'Eyes',mouth:'Mouth'})[k]);return R?R.querySelectorAll('button')[d>0?1:0]:null}
function trlSw(row,i){const R=[...document.querySelectorAll('#cre .sw')][row];return R?R.querySelectorAll('i')[i]:null}

/* ---------- the pointer: moves like a hand on a mouse and clicks the real buttons ---------- */
function trlMove(get,dur,cb){const c=TRL.cur;if(!c)return;const e=get();if(!e){if(cb)cb(null);return}const r=e.getBoundingClientRect();
 c.f=[c.x,c.y];c.to=[r.left+r.width*(.42+Math.random()*.16),r.top+r.height*(.45+Math.random()*.15)];c.bend=(Math.random()-.5)*.35;c.t0=TRL.T;c.d=dur;c.cb=cb;c.el.style.opacity=1}
function trlClick(get,dur,after){trlMove(get,dur,()=>{const c=TRL.cur;c.el.classList.add('pr');setTimeout(()=>c.el.classList.remove('pr'),110);const e=get();if(e){if(after)after(e);else e.click()}})}
function trlType(get,txt){TRL.typ={get,txt,i:0,next:TRL.T+.15}}
function trlScroll(sel,px,dur){TRL.scr={sel,px,t0:TRL.T,d:dur,y0:null}}
function trlPointer(){const c=TRL.cur;if(!c)return;if(c.t0!=null){const u=Math.min(1,(TRL.T-c.t0)/c.d),k=trlE.io(u),dx=c.to[0]-c.f[0],dy=c.to[1]-c.f[1];
  c.x=c.f[0]+dx*k-dy*c.bend*Math.sin(Math.PI*k);c.y=c.f[1]+dy*k+dx*c.bend*Math.sin(Math.PI*k);if(u>=1){c.t0=null;const f=c.cb;c.cb=null;if(f)setTimeout(f,60)}}
 c.el.style.transform=`translate(${c.x}px,${c.y}px)`;
 const t=TRL.typ;if(t&&TRL.T>=t.next){const e=t.get();if(e){t.i++;e.value=t.txt.slice(0,t.i);e.dispatchEvent(new Event('input',{bubbles:true}));t.next=TRL.T+.06+Math.random()*.11+(t.txt[t.i-1]==' '?.08:0)}if(!e||t.i>=t.txt.length)TRL.typ=null}
 const s=TRL.scr;if(s){const e=document.querySelector(s.sel);if(e){if(s.y0==null)s.y0=e.scrollTop;const u=Math.min(1,(TRL.T-s.t0)/s.d);e.scrollTop=s.y0+s.px*trlE.s(u);if(u>=1)TRL.scr=null}else TRL.scr=null}}

/* ---------- overlay ---------- */
function trlCSS(){if($('trlcss'))return;const st=document.createElement('style');st.id='trlcss';st.textContent=`
body.trlon>*:not(#c):not(#trl):not(.trlv){visibility:hidden!important}body.trlon #hud:not(.trlv){visibility:hidden!important}body.trlon #dscut .skip{display:none!important}body.trlon #hud.trlv>*:not(.modal){visibility:hidden!important}body.trlon,body.trlon *{cursor:none!important}
#trl{position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;color:#fff}
#trl .qblk{position:absolute;inset:0;background:#000;display:none;align-items:center;justify-content:center;text-align:center}
#trl .qcard{font-family:'Silkscreen',ui-monospace,monospace;font-size:clamp(26px,4.4vw,72px);line-height:1.25;letter-spacing:.02em}
#trl .qend h1{font-family:'Silkscreen',ui-monospace,monospace;font-size:clamp(42px,8.5vw,140px);line-height:1.05;color:#2fe68a;margin:0;text-shadow:4px 4px 0 #0b3a22,8px 8px 0 #000;letter-spacing:2px;visibility:hidden}
#trl .qend p{font-family:'Silkscreen',ui-monospace,monospace;margin:.9em 0 0;font-size:clamp(14px,1.7vw,28px);color:#e8f3ec;visibility:hidden}#trl .qend .on{visibility:visible}
#trl .qcur{position:absolute;left:0;top:0;width:22px;height:30px;opacity:0;z-index:3}#trl .qcur svg{display:block;transform-origin:2px 2px;transition:transform .08s}#trl .qcur.pr svg{transform:scale(.86)}
#trl .qhint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:4;text-align:center;line-height:1.6}
#trlm{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}#trlm .box{width:min(720px,94vw);max-height:92vh;overflow:auto}
#trlm .trlsc{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:12px 0}#trlm .trlsc button{text-align:left;padding:8px 10px;font-size:13px}#trlm .trlsc small{display:block;opacity:.65}
#trlm label{display:block;margin:6px 0}#trlm input[type=text]{width:100%;margin-top:4px}#trlm .row2{margin-top:12px}`;document.head.appendChild(st)}
function trlOverlay(){let o=$('trl');if(o)o.remove();o=document.createElement('div');o.id='trl';
 o.innerHTML=`<div class="qblk" id="trlblk"></div><div class="qcur" id="trlcur"><svg width="22" height="30" viewBox="0 0 22 30"><path d="M2 2 L2 24 L7.5 18.5 L11.5 27.5 L15 26 L11 17.2 L18.5 17.2 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg></div>`;
 document.body.appendChild(o);TRL.cur={el:$('trlcur'),x:innerWidth*.62,y:innerHeight*.7,t0:null};return o}
function trlShowOnly(ids){document.querySelectorAll('.trlv').forEach(e=>{if(!(ids||[]).includes(e.id))e.classList.remove('trlv')});(ids||[]).forEach(id=>{const e=$(id);if(e)e.classList.add('trlv')})}

/* ---------- running ---------- */
function trlEnter(k){const s=TRL.shots[k];TRL.i=k;TRL.typ=null;TRL.scr=null;TRL.zoom=s.zoom||0;
 const blk=$('trlblk');TRL.cur.t0=null;TRL.cur.cb=null;TRL.cur.el.style.opacity=0;
 if(s.card||s.end){blk.style.display='flex';blk.innerHTML=s.card?(TRL.opt.cap?`<div class="qcard">${s.card}</div>`:''):`<div class="qend"><h1 id="trle1">WAVEFERN<br>RECORDS</h1><p id="trle2">FREE IN YOUR BROWSER</p><p id="trle3">WAVEFERN.COM</p></div>`}
 else{blk.style.display='none';blk.innerHTML='';try{s.set&&s.set()}catch(e){console.error('trailer shot '+s.sc,e)}}
 s.done=(s.acts||[]).map(()=>0);trlShowOnly(s.show);
 /* bodyguards only walk with you in the crew shot, so they never crowd the others */
 if(TRL.star&&!s.card&&!s.end){const g=s.crew?2:0;if(S.guards!==g){S.guards=g;try{syncF()}catch(e){}if(s.crew)FOL.forEach(f=>{if(!f.home){f.x=P.x+f.ox-1.5;f.z=P.z+f.oz}})}}}
function trlPre(dt){TRL.T=TRL.fz!=null?TRL.fz:(performance.now()-TRL.t0)/1000;const T=TRL.T;
 let k=TRL.shots.findIndex(s=>T>=s.t&&T<s.t+s.d);if(k<0)k=T<0?-1:TRL.shots.length-1;if(k>=0&&k!==TRL.i)trlEnter(k);
 const s=TRL.shots[TRL.i];if(!s)return;const lt=T-s.t;
 (s.acts||[]).forEach((a,j)=>{if(!s.done[j]&&lt>=a[0]){s.done[j]=1;try{a[1]()}catch(e){console.error('trailer act',s.sc,e)}}});
 if(s.end){const h=TRL.custom?TRL.BAR/2:1.05,on=(id,at)=>{const e=$(id);if(e&&lt>=at)e.classList.add('on')};on('trle1',h);on('trle2',h+1.15);on('trle3',h+1.85)}
 /* keep the clock on the music, then cut it at the end card and play one last hit on the logo */
 const a=TRL.aud;if(a&&TRL.opt.music){const E=TRL.shots[TRL.shots.length-1];
  if(!TRL.cut&&TRL.fz==null&&a.readyState>=2&&!a.paused){const d=a.currentTime-TRL.MO-T;if(Math.abs(d)>.3){if(!a.seeking&&performance.now()-(TRL.seekT||0)>2500){TRL.seekT=performance.now();try{a.currentTime=TRL.MO+T}catch(e){}}}else TRL.t0-=d*1000*.08}
  /* your own track carries its own stop and last hit; track 1 is cut here and its drop replayed on the logo */
  if(T>=E.t&&!TRL.cut&&!TRL.custom){TRL.cut=1;a.pause()}
  if(T>=E.t+1.05&&TRL.cut==1){TRL.cut=2;try{a.currentTime=TRL.HIT;a.volume=1;a.play().catch(()=>{})}catch(e){}}
  if(TRL.cut==2)a.volume=Math.max(0,Math.min(1,1-(T-E.t-3.6)/4))}
 /* the beat minigame: hit in the middle, like a good player */
 if(s.rec&&mode=='rec'&&rec&&!rec.st&&Math.abs(rec.pos-.5)<.035&&!rec.cd)try{recHit()}catch(e){}}
function trlPost(dt){trlPointer();const s=TRL.shots[TRL.i];if(!s)return;trlShowOnly(s.show);
 if(s.cam){const c=s.cam(Math.max(0,Math.min(1,(TRL.T-s.t)/s.d)));const C=TRL.cam=TRL.cam||new THREE.PerspectiveCamera(45,1,.1,2600);C.position.set(...c.p);C.lookAt(...c.l);C.fov=c.f;C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()}if(s.tick)s.tick(Math.max(0,Math.min(1,(TRL.T-s.t)/s.d)))}
{const u0=update;update=function(dt){if(TRL.run){try{trlPre(dt)}catch(e){console.error('trailer',e)}}u0(dt);if(TRL.run){try{trlPost(dt)}catch(e){console.error('trailer',e)}}}}
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){const s=TRL.run&&TRL.shots[TRL.i];if(s&&s.cam&&TRL.cam&&sc===scene&&c===cam)return r0(sc,TRL.cam);return r0(sc,c)}}
/* in the few cinematic shots every building stays solid (the game fades the ones in front of the player) */
{const f0=fadeT;fadeT=function(dt){const s=TRL.run&&TRL.shots[TRL.i];if(s&&s.cam){try{CT.forEach(b=>{b.mat.opacity=1;b.mat.depthWrite=true;if(b.dm){b.dm.opacity=1;b.dm.depthWrite=true}})}catch(e){}return}return f0.apply(this,arguments)}}
{const v0=window.VIEWX;window.VIEWX=function(){if(TRL.run&&TRL.zoom&&['play','cut'].includes(mode))return TRL.zoom;return typeof v0=='function'?v0():0}}
/* nothing is saved in trailer mode, and nothing is loaded over the trailer's career */
{const a0=autoSave;autoSave=function(){if(TRL.on)return;return a0.apply(this,arguments)}}
if(typeof csPush=='function'){const c0=csPush;csPush=function(){if(TRL.on)return Promise.resolve();return c0.apply(this,arguments)}}
{const l0=loadCode;loadCode=function(){if(TRL.on&&TRL.started)return;return l0.apply(this,arguments)}}
{const b0=bbAds;bbAds=function(){const r=b0.apply(this,arguments);if(TRL.on)return r.filter(a=>!ART.some(q=>q[8]&&q[0]==a.n&&q[0]!='Panic Man Dan'));return r}}
addEventListener('keydown',e=>{if(!TRL.run)return;e.stopImmediatePropagation();e.preventDefault();if(e.key=='Escape')trlStop()},true);
['pointerdown','pointerup','click','wheel'].forEach(t=>addEventListener(t,e=>{if(TRL.run&&e.isTrusted){e.stopImmediatePropagation();e.preventDefault()}},true));

/* ---------- the menu ---------- */
function trlMenu(){trlCSS();let m=$('trlm');if(m)m.remove();TRL.shots=trlShots();m=document.createElement('div');m.id='trlm';
 if(!TRL.aud)fetch(TRL.SRC).then(r=>r.blob()).then(b=>{if(!TRL.aud){TRL.aud=new Audio(URL.createObjectURL(b));TRL.aud.preload='auto'}}).catch(()=>{});
 const o=TRL.opt,ck=(k,l)=>`<label style="display:inline-flex;gap:6px;margin-right:16px"><input type=checkbox ${o[k]?'checked':''} onchange="TRL.opt.${k}=this.checked?1:0"> ${l}</label>`;
 m.innerHTML=`<div class="box modal"><h2>Trailer</h2><p class=m><small>A ${Math.round(TRL.len)} second trailer of real gameplay for screen recording. Press Play, start recording, then press Space to roll. Esc stops it. It runs on a fresh career and saves nothing, so your own careers are safe.</small></p>
 <label>Artist name<input type=text id=trln maxlength=24 value="${trlEsc(TRL.name||'Fern Wave')}"></label><label>Song title<input type=text id=trls maxlength=28 value="${trlEsc(TRL.song)}"></label>
 <div>${ck('music','Music')}${ck('cap','Title cards')}</div>
 <p class=m style="margin:10px 0 4px"><small>Your own music (optional): pick an MP3 made at 120 BPM with the drop at 0:24. It stays on this computer. Another tempo or drop time works too: type them in.</small></p>
 <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input type=file id=trlf accept="audio/*" onchange="trlFile(this)"><label style="display:inline-flex;gap:6px;align-items:center;margin:0">BPM <input type=number id=trlbpm value="${TRL.custom?Math.round(240/TRL.BAR*10)/10:120}" min=60 max=200 step=.1 style="width:80px"></label><label style="display:inline-flex;gap:6px;align-items:center;margin:0">Drop at (s) <input type=number id=trldrop value="${TRL.custom?TRL.DROP:24}" min=4 max=90 step=.01 style="width:80px"></label></div><p class=m id=trlfm><small>${TRL.custom?'Using your track.':'Using track 1 of the soundtrack.'}</small></p>
 <div class=row2><button class=go onclick="trlPlay(0)">▶ Play the trailer</button></div>
 <p class=m style="margin-top:14px"><small>Or start from a scene:</small></p><div class=trlsc>${TRL.shots.map(s=>`<button onclick="trlPlay(${s.k})">${trlEsc(s.sc)}<small>${s.t.toFixed(1)}s</small></button>`).join('')}</div>
 <div class=row2><button onclick="location.href=new URL('../',location.href).href">Leave and play the game</button></div></div>`;document.body.appendChild(m)}
function trlFile(inp){const f=inp.files&&inp.files[0];if(!f)return;try{if(TRL.aud)TRL.aud.pause()}catch(e){}TRL.SRC=URL.createObjectURL(f);TRL.aud=new Audio(TRL.SRC);TRL.aud.preload='auto';TRL.custom=1;TRL.HIT=0;const m=$('trlfm');if(m)m.innerHTML='<small>Using your track: '+trlEsc(f.name)+'</small>'}
function trlPlay(k){const n=$('trln'),s=$('trls');
 if(TRL.custom){const bp=+(($('trlbpm')||{}).value)||120,dp=+(($('trldrop')||{}).value)||24;TRL.BAR=240/bp;TRL.BEAT=60/bp;TRL.DROP=dp}if(n)TRL.name=n.value.trim()||'Fern Wave';if(s)TRL.song=s.value.trim()||'Night Bus';const m=$('trlm');if(m)m.remove();
 TRL.started=1;TRL.shots=trlShots();TRL.k0=k||0;TRL.cut=0;TRL.i=-1;
 try{TT.on=0;pauseOverlay(0)}catch(e){}PAUSED=0;
 /* scenes after the creator need a career: make the fresh one now, and the star one for scenes after the drop */
 if(TRL.k0>1){trlFresh();trlName()}if(TRL.shots[TRL.k0].t>=TRL.DROP)trlStar();
 document.body.classList.add('trlon');const o=trlOverlay();const blk=$('trlblk');blk.style.display='flex';blk.innerHTML='';
 const h=document.createElement('div');h.className='qhint box';h.id='trlh';h.innerHTML='<b>Ready.</b> Start your screen recording, then press <b>Space</b>.<br><small class=m>Esc stops the trailer.</small>';o.appendChild(h);
 const go=e=>{if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();removeEventListener('keydown',go,true);return trlStop()}if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();e.stopImmediatePropagation();removeEventListener('keydown',go,true);trlRoll()};
 addEventListener('keydown',go,true)}
function trlRoll(){const h=$('trlh');if(h)h.remove();const s0=TRL.shots[TRL.k0];
 setTimeout(()=>{TRL.t0=performance.now()-s0.t*1000;TRL.run=1;TRL.i=-1;
  if(TRL.opt.music){try{const a=TRL.aud=TRL.aud||new Audio(TRL.SRC);a.muted=false;a.volume=1;const sync=()=>{try{a.currentTime=TRL.MO+Math.max(0,(performance.now()-TRL.t0)/1000)}catch(e){}};
   if(a.readyState>=1)sync();else a.addEventListener('loadedmetadata',sync,{once:true});a.play().catch(()=>{})}catch(e){}}},700)}
function trlStop(){TRL.run=0;try{if(TRL.aud)TRL.aud.pause()}catch(e){}location.reload()}
/* the trailer page opens the menu once the game has booted to its title screen */
if(TRL.on){const w=setInterval(()=>{if(typeof mode!='undefined'&&mode=='title'&&$('ttl')&&!$('load')){clearInterval(w);trlMenu()}},300)}
