/* ===== v49.3.0: trailer mode =====
   Type "trailer" in the save code box (Settings > Save) to open the trailer menu. It plays a scripted trailer of the game,
   about 80 seconds, made to be screen recorded: cinematic camera shots of the real world with your own character, captions,
   motion graphics between the gameplay (a release card, a stream counter, messages, a world tour map), the Rocket soundtrack
   cut so the drop lands on the city reveal, and an end card. The HUD, pop-ups and the cursor hide while it plays.
   Every scene can be played on its own (it then plays on from there), and music, captions, black bars and game sounds can be
   turned off in the menu. Esc stops the trailer at any time.
   Your career is safe: it is saved before the trailer starts, nothing is saved while trailer mode is on, and leaving
   reloads the game, so your own career comes back exactly as it was. */
const TRL={on:0,run:0,T:0,t0:0,i:-1,own:1,cam:null,shots:[],len:0,done:0,
 opt:{music:1,cap:1,bars:1,sfx:0},name:'',song:'Night Bus',aud:null,walk:null,car:null,cut:null,bb:null,plane:null,
 MO:8.33,DROP:24.86,BAR:2.07,BEAT:.5175,HIT:33.16};
/* rocket.mp3: a quiet intro, a riser, then the drop at 33.19 s; bars of 2.07 s. The trailer starts the track at MO, so the drop lands at DROP. */
const trlBar=n=>TRL.DROP+n*TRL.BAR;
const trlL=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u);
const trlE={io:u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,o:u=>1-Math.pow(1-u,3),i:u=>u*u*u,s:u=>u*u*(3-2*u),l:u=>u};
/* a camera move from A to B: each is [position, look-at, fov] */
function trlMove(A,B,e){e=e||trlE.s;return u=>{const k=e(Math.max(0,Math.min(1,u)));return{p:trlL(A[0],B[0],k),l:trlL(A[1],B[1],k),f:A[2]+(B[2]-A[2])*k}}}
function trlPut(x,z,rot){P.x=x;P.z=z;P.rot=rot||0;camT.x=x;camT.z=z;if(P.mesh)P.mesh.visible=true}
function trlFmt(n){return Math.round(n).toLocaleString('en-US')}
const trlEsc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');

/* ---------- the shots ---------- */
function trlShots(){const A=()=>TRL.name||S.artist||'You',B=TRL.BAR,b=TRL.BEAT;
 const home=()=>{try{if(typeof DCITY=='object'&&DCITY.on)DCITY.leave(1)}catch(e){}try{if(IN)leaveShop()}catch(e){}};
 const L=[
 {sc:'Cold open',d:4,dark:1,set(){home();trlPut(6,2.9,Math.PI);S.t=12},gfx:'type',txt:'Every artist starts somewhere.'},
 {sc:'Day one',d:5,set(){home();trlPut(6,2.9,Math.PI);S.t=12},
  cam:trlMove([[9.6,3.1,8.6],[6,1.2,2.4],38],[[7.7,2.1,5.6],[6,1.3,2.3],34]),cap:['DAY 1','$100. ONE LAPTOP.']},
 {sc:'Studio',d:4,set(){home();trlPut(12.2,2.3,Math.PI);S.t=150},mic:1,
  cam:trlMove([[14.6,2.1,.35],[12.2,1.35,2.3],52],[[13.5,1.65,.4],[12.2,1.4,2.2],44]),cap:['WRITE IT.','RECORD IT.']},
 {sc:'Release',d:4,blur:1,gfx:'release',set(){},cam:null},
 {sc:'First light',d:4.5,set(){home();S.t=4;TRL.walk={a:[6,12.6],b:[6,16.2],e:trlE.l}},
  cam:trlMove([[7.4,1,19.5],[6,1.5,12],42],[[15,9,31],[46,2,10],48],trlE.io),cap:['THE CITY IS WAITING.']},
 {sc:'Streams',d:TRL.DROP-21.5,blur:1,gfx:'count',set(){home();S.t=6;trlPut(40,14.2,Math.PI/2)},
  cam:trlMove([[22,5,26],[60,2,16],48],[[52,3.2,22],[90,1.5,16],60],trlE.i)},
 /* the drop */
 {sc:'City reveal',d:2*B,set(){home();S.t=262;trlPut(587,40,0)},
  cam:trlMove([[478,68,158],[606,0,38],46],[[522,46,116],[612,0,34],42],trlE.o),cap:['BUILD A CAREER.'],slam:1},
 {sc:'Walk the city',d:2*B,set(){home();S.t=268;TRL.walk={a:[566,26.2],b:[575,26.2],e:trlE.l}},
  cam:u=>{const x=566+9*u;return{p:[x-2.2,1.35,31.2],l:[x+1.2,1.35,25.2],f:42}},cap:['IN A WHOLE OPEN CITY.']},
 {sc:'Drive',d:B,set(){home();S.t=276;trlPut(120,13.4,Math.PI/2);if(P.mesh)P.mesh.visible=false;TRL.car={i:4,a:[96,17.4],b:[150,17.4]}},
  cam:u=>{const x=96+54*u;return{p:[x-5.5+u*2,.9,22.8],l:[x+1.5,.9,17.4],f:44}}},
 {sc:'Billboard',d:B,set(){home();S.t=290;trlPut(68,44,0);trlBill(70,55,Math.PI)},
  cam:trlMove([[66,1,43.5],[70,3.5,55],46],[[68.6,2.2,49.2],[70,3.5,55],40],trlE.o)},
 {sc:'Messages',d:2*B,blur:1,gfx:'dms',set(){home();S.t=330;trlPut(580,26,0)},
  cam:trlMove([[572,4,40],[600,3,20],50],[[578,3,36],[604,3,18],48])},
 {sc:'The crew',d:2*b,set(){home();S.t=270;trlPut(20,13.8,0);if(P.mesh)P.mesh.visible=false},
  cam:trlMove([[16.5,1.1,16.5],[22,.8,10],44],[[18.5,1.1,15.8],[25,.8,10],44])},
 {sc:'The crew 2',d:2*b,crew:1,set(){home();S.t=270;TRL.walk={a:[52,14],b:[56.5,14],e:trlE.l}},
  cam:u=>{const x=52+4.5*u;return{p:[x+5.5,1.3,19],l:[x,1,14],f:40}},cap:['THE CARS. THE CREW.']},
 {sc:'The crew 3',d:2*b,set(){home();S.t=270;trlPut(60,14.2,0)},
  cam:trlMove([[60.6,1.55,16.3],[60,1.45,14.2],30],[[60.4,1.5,15.9],[60,1.45,14.2],26])},
 {sc:'The crew 4',d:2*b,crew:1,set(){home();S.t=270;TRL.walk={a:[64,14],b:[69,14],e:trlE.l}},
  cam:u=>{const x=64+5*u;return{p:[x+2,4.5,24],l:[x,1,14],f:40}},cap:['THE CARS. THE CREW. THE FAME.']},
 {sc:'Festival',d:2*B,set(){home();trlFest();S.t=392;trlPut(364,-112.5,0)},
  cam:trlMove([[364,3.2,-40],[364,5,-112],46],[[364,10,-72],[364,3,-112],50],trlE.io),cap:['HEADLINE THE FESTIVAL.']},
 {sc:'Awards',d:B,set(){home();S.t=396;TRL.walk={a:[717,22],b:[717,17.5],e:trlE.l}},
  cam:trlMove([[711,.6,27],[717,6,4],46],[[713,.9,24],[717,7,4],42]),cap:['WIN THE GRAMOPHONE.']},
 {sc:'Take off',d:B,set(){home();S.t=288;trlPut(-316,22,-Math.PI/2);trlPlane()},
  cam:trlMove([[-300,1.6,40],[-330,10,0],50],[[-300,1.6,40],[-336,16,-6],50])},
 {sc:'World tour',d:2*B,dark:1,gfx:'map',set(){},pre:()=>trlCity()},
 {sc:'Tour city',d:2*B,set(){trlCity();S.t=392},pre:()=>{},camf:()=>trlCityCam(),cap:['37 CITIES. 6 CONTINENTS.']},
 {sc:'Stadium',d:4*B,set(){trlShow()},show:1,cap:['SELL OUT STADIUMS.']},
 {sc:'End card',d:9,dark:1,gfx:'end',end:1,set(){}}];
 let t=0;L.forEach((s,i)=>{s.k=i;s.t=t;t+=s.d});TRL.len=t;
 /* the stadium show takes a moment to build, so it starts while the tour city is on screen */
 L.find(s=>s.sc=='Tour city').pre=()=>{trlCity();setTimeout(()=>{if(TRL.run)trlShow()},300)};
 return L}

/* ---------- set pieces ---------- */
function trlBill(x,z,th){try{if(!TRL.bb){bbBuild([{x,z,th}]);TRL.bb=BB.list[BB.list.length-1]}const ad={n:TRL.name||S.artist||'Your name',g:'New album',c:'#1a6b4a',tag:'Out now'};bbDraw(TRL.bb.cv,ad);TRL.bb.tex.needsUpdate=true}catch(e){console.error('trailer billboard',e)}}
function trlFest(){try{if(S.day%7){S.day=Math.ceil(S.day/7)*7}S.wx={d:S.day,k:'sun'};festSync()}catch(e){console.error('trailer festival',e)}}
function trlPlane(){try{if(!TRL.plane){const g=DCITY.planeModel('#2fe68a');g.scale.setScalar(1.6);scene.add(g);TRL.plane=g}TRL.plane.visible=true}catch(e){console.error('trailer plane',e)}}
function trlCity(){try{if(!DCITY.on||DCITY.id!='tyo'){DCITY.arrive('tyo',{quiet:1});S.t=392}}catch(e){console.error('trailer city',e)}}
function trlCityCam(){const C=DCITY.C;if(!C||!C.spots)return null;/* city spots are local: the cities are built at (4000, -4000) */const k=C.spots.land||C.spots.hotel,x=4000+k.x,z=-4000+k.z;
 return u=>{const e=trlE.s(u);return{p:[x-30+e*16,16-e*9,z+46-e*18],l:[x,9+e*5,z-14],f:50}}}
function trlShow(){try{if(!DCITY.on)trlCity();if(TRL.showOn)return;TRL.showOn=1;const id=DCITY.id,songs=S.songs.slice(-6).map(s=>s.id);
 S.dcity=S.dcity||{};S.dcity.prep=S.dcity.prep||{};S.dcity.prep[id+'|venue']={songs,prod:{pyro:1,lasers:1,confetti:1,dancers:1},reh:2,rd:S.day};
 S.money=Math.max(S.money,1e7);S.energy=100;S.t=Math.max(S.t,380);DCITY.startShow('venue')}catch(e){console.error('trailer show',e)}}

/* ---------- the career the trailer shows: your character, with the money, fame and toys of a big star ---------- */
function trlState(){
 Object.assign(S,{money:Math.max(S.money||0,2.5e7),energy:100,stam:100,listeners:Math.max(S.listeners||0,2.4e7),followers:Math.max(S.followers||0,9e6),
  bling:4,garage:1,guards:3,gs:'follow',pets:[0,1,2],petsOut:1,cars:CARS.map((c,i)=>i),cheat:1});
 if(TRL.name)S.artist=TRL.name;else if(!S.artist)S.artist='Fern Wave';
 S.apps=S.apps||{};S.apps.wtour=1;S.wx={d:S.day,k:'sun'};
 const titles=[TRL.song||'Night Bus','Gold Rush','Neon Rain','Fernfield','Midnight Drive','Rocket'];S.songs=Array.isArray(S.songs)?S.songs:[];
 titles.forEach((t,i)=>{if(!S.songs.some(s=>s.title==t))S.songs.push({id:9e5+i,title:t,g:'Hip-Hop',q:92,day:S.day,streams:4e7-i*3e6,today:0})});
 [()=>parkCars(),()=>syncF(),()=>buildStudio(),()=>refresh(),()=>syncArt()].forEach(f=>{try{f()}catch(e){}})}

/* ---------- overlay ---------- */
function trlCSS(){if($('trlcss'))return;const st=document.createElement('style');st.id='trlcss';st.textContent=`
body.trlon>*:not(#c):not(#trl){visibility:hidden!important}body.trlon,body.trlon *{cursor:none!important}
#trl{position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;font-family:'Silkscreen',ui-monospace,monospace;color:#fff}
#trl .qbar{position:absolute;left:0;right:0;height:max(0px,calc((100vh - 100vw/2.39)/2));background:#000;z-index:5}#trl .qbar.qt{top:0}#trl .qbar.qb{bottom:0}
#trl .qblk{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .25s}
#trl .qfl{position:absolute;inset:0;background:#fff;opacity:0;z-index:6}
#trl .qcap{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;z-index:4;padding:0 6vw}
#trl .qcap div{font-size:clamp(26px,4.6vw,76px);letter-spacing:.06em;line-height:1.15;text-shadow:0 0 24px rgba(0,0,0,.65),3px 3px 0 #0b3a22,5px 5px 0 rgba(0,0,0,.6);opacity:0;transform:translateY(14px);transition:opacity .45s,transform .6s cubic-bezier(.2,.9,.2,1)}
#trl .qcap div.qsm{font-size:clamp(16px,2vw,30px);color:#2fe68a;letter-spacing:.3em;margin-bottom:.4em}
#trl .qcap div.qin{opacity:1;transform:none}#trl .qcap div.qout{opacity:0;transform:translateY(-10px);transition:opacity .3s,transform .3s}
#trl .qcap.qslam div{transform:scale(1.6);transition:opacity .12s,transform .35s cubic-bezier(.1,1.4,.3,1)}#trl .qcap.qslam div.qin{transform:none}
#trl .qg{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center}
#trl .qty{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:clamp(18px,2.6vw,40px);letter-spacing:.04em;color:#e8f3ec}#trl .qty i{display:inline-block;width:.6em;height:1.1em;background:#2fe68a;vertical-align:-.15em;margin-left:.1em;animation:trlblink .8s steps(1) infinite}
@keyframes trlblink{50%{opacity:0}}
#trl .qrel{display:flex;gap:3vw;align-items:center;background:rgba(10,14,12,.86);border:2px solid #2fe68a;border-radius:18px;padding:3vw 3.4vw;box-shadow:0 30px 80px rgba(0,0,0,.6);font-family:system-ui,'Segoe UI',Roboto,sans-serif;transform:scale(.92);opacity:0;transition:transform .7s cubic-bezier(.2,.9,.2,1),opacity .4s}
#trl .qrel.qin{transform:none;opacity:1}
#trl .qcov{width:clamp(120px,17vw,260px);aspect-ratio:1;border-radius:10px;background:linear-gradient(135deg,#2fe68a,#0b3a22 55%,#000);display:flex;align-items:flex-end;padding:12px;font-family:'Silkscreen',monospace;font-size:clamp(14px,1.6vw,24px);box-shadow:0 10px 30px rgba(0,0,0,.5)}
#trl .qrel h3{font-family:system-ui,sans-serif;font-size:clamp(14px,1.3vw,20px);color:#8aa094;letter-spacing:.2em;margin:0 0 .4em}#trl .qrel h2{font-family:system-ui,sans-serif;font-size:clamp(28px,4vw,64px);margin:0;font-weight:800}
#trl .qrel p{margin:.2em 0 1.2em;font-size:clamp(16px,1.6vw,26px);color:#cfe}
#trl .qbtn{display:inline-block;background:#2fe68a;color:#04130a;font-weight:800;border-radius:999px;padding:.55em 1.6em;font-size:clamp(16px,1.6vw,26px);transition:transform .15s,background .3s}#trl .qbtn.qpr{transform:scale(.9)}#trl .qbtn.qok{background:#fff}
#trl .qcnt{text-align:center}#trl .qcnt b{display:block;font-size:clamp(48px,10vw,170px);letter-spacing:.02em;text-shadow:4px 4px 0 #0b3a22,8px 8px 0 rgba(0,0,0,.5);font-variant-numeric:tabular-nums}#trl .qcnt span{font-size:clamp(16px,2vw,32px);letter-spacing:.35em;color:#2fe68a}
#trl .qdms{display:flex;flex-direction:column;gap:1.2vw;width:min(980px,78vw);font-family:system-ui,'Segoe UI',Roboto,sans-serif}
#trl .qdm{display:flex;gap:14px;align-items:center;background:rgba(16,22,19,.92);border:1px solid rgba(47,230,138,.45);border-radius:16px;padding:1.1vw 1.6vw;box-shadow:0 12px 40px rgba(0,0,0,.45);opacity:0;transform:translateX(60px);transition:opacity .3s,transform .45s cubic-bezier(.2,.9,.2,1)}
#trl .qdm.qin{opacity:1;transform:none}#trl .qdm .qic{font-size:clamp(26px,3.2vw,50px)}#trl .qdm b{display:block;font-size:clamp(14px,1.5vw,24px);color:#2fe68a;letter-spacing:.08em}#trl .qdm span{font-size:clamp(18px,2.3vw,38px)}
#trl .qmap{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,#0d2a1b,#030806 70%)}#trl .qmap svg{position:absolute;left:50%;top:50%;width:min(96vw,190vh);transform:translate(-50%,-50%) scale(1.04);transition:transform 8s linear}
#trl .qmap.qgo svg{transform:translate(-50%,-50%) scale(1.16)}
#trl .qend{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,#0d2a1b,#000 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
#trl .qend h1{font-family:'Silkscreen',monospace;font-size:clamp(44px,9vw,150px);line-height:1;color:#2fe68a;margin:0;text-shadow:4px 4px 0 #0b3a22,8px 8px 0 #000;letter-spacing:.04em;opacity:0;transform:scale(1.3);transition:opacity .15s,transform .5s cubic-bezier(.1,1.3,.3,1)}
#trl .qend h1.qin{opacity:1;transform:none}#trl .qend p{opacity:0;transition:opacity .8s;margin:.6em 0 0;font-size:clamp(14px,1.8vw,30px);letter-spacing:.12em}#trl .qend p.qin{opacity:1}#trl .qend p.qu{color:#2fe68a;font-size:clamp(18px,2.6vw,44px)}
#trl .qhint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;font-family:system-ui,sans-serif;color:#8aa094;font-size:15px;line-height:1.6;z-index:7}
#trlm{position:fixed;inset:0;z-index:2147483001;background:rgba(3,8,6,.88);display:flex;align-items:center;justify-content:center;font-family:system-ui,'Segoe UI',Roboto,sans-serif;color:#e8f3ec}
#trlm .box{width:min(720px,94vw);max-height:92vh;overflow:auto;padding:22px}#trlm h2{color:#2fe68a}#trlm .sc{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:12px 0}
#trlm .sc button{text-align:left;padding:8px 10px;font-size:13px}#trlm .sc small{display:block;color:#8aa094}#trlm label{display:inline-flex;gap:6px;align-items:center;margin:4px 14px 4px 0;font-size:14px}
#trlm input[type=text]{width:100%;margin:4px 0 10px}#trlm .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}#trlm .row button{flex:1}`;document.head.appendChild(st)}
function trlOverlay(){let o=$('trl');if(o)o.remove();o=document.createElement('div');o.id='trl';
 o.innerHTML='<div class="qg" id="trlg"></div><div class="qcap" id="trlcap"></div><div class="qblk" id="trlblk"></div><div class="qbar qt"></div><div class="qbar qb"></div><div class="qfl" id="trlfl"></div>';
 document.body.appendChild(o);o.querySelectorAll('.qbar').forEach(b=>b.style.display=TRL.opt.bars?'':'none');return o}
function trlFlash(ms){const f=$('trlfl');if(!f)return;f.style.transition='none';f.style.opacity=.9;void f.offsetWidth;f.style.transition='opacity '+(ms||450)+'ms';f.style.opacity=0}
function trlCap(lines,slam){const c=$('trlcap');if(!c)return;c.className='qcap'+(slam?' qslam':'');if(!TRL.opt.cap||!lines){c.innerHTML='';return}
 c.innerHTML=lines.map((l,i)=>`<div class="${i==0&&lines.length>1&&/^DAY|^\$/.test(l)&&l.length<8?'qsm':''}">${trlEsc(l)}</div>`).join('');
 [...c.children].forEach((d,i)=>setTimeout(()=>d.classList.add('qin'),60+i*(slam?90:420)))}
function trlCapOut(){const c=$('trlcap');if(c)[...c.children].forEach(d=>d.classList.add('qout'))}

/* ---------- motion graphics ---------- */
const TRLG={
 type:{on(s,g){g.innerHTML='<div class="qty"><span></span><i></i></div>'},tick(u,s,g){const t=s.txt,n=Math.floor(Math.max(0,Math.min(1,(u-.12)/.55))*t.length),e=g.querySelector('span');if(e&&e.textContent.length!=n)e.textContent=t.slice(0,n)}},
 release:{on(s,g){g.innerHTML=`<div class="qrel" id="trlrel"><div class="qcov">${trlEsc(TRL.song||'Night Bus')}</div><div><h3>SPOTIFLY · NEW RELEASE</h3><h2>${trlEsc(TRL.song||'Night Bus')}</h2><p>${trlEsc(TRL.name||S.artist||'You')} · Single</p><span class="qbtn" id="trlbtn">Release</span></div></div>`;setTimeout(()=>{const r=$('trlrel');if(r)r.classList.add('qin')},40)},
  tick(u){const b=$('trlbtn');if(!b)return;if(u>.5&&!b.dataset.p){b.dataset.p=1;b.classList.add('qpr')}if(u>.56&&!b.dataset.o){b.dataset.o=1;b.classList.remove('qpr');b.classList.add('qok');b.textContent='✓ Out now'}}},
 count:{on(s,g){g.innerHTML='<div class="qcnt"><b id="trlnum">0</b><span>MONTHLY LISTENERS</span></div>'},tick(u){const e=$('trlnum');if(!e)return;const v=u<.06?0:Math.min(1e6,Math.round(Math.pow(10,6*Math.pow((u-.06)/.94,1.6))));e.textContent=trlFmt(u>=.995?1e6:v)}},
 dms:{on(s,g){const n=TRL.name||S.artist||'you',L=[['📈','SPOTIFLY','"'+(TRL.song||'Night Bus')+'" just passed 10,000,000 streams'],['✍️','PULSE RECORDS','We want to sign you. Let\'s talk numbers.'],['💬','BIG VEE','Collab requests are piling up, '+n+'.'],['🎪','PARK FIELDS FESTIVAL','You\'re on the Main Stage this Saturday.'],['🏆','GRAMOPHONE AWARDS','Congratulations, you\'ve been nominated.']];
  g.innerHTML='<div class="qdms">'+L.map(r=>`<div class="qdm"><span class="qic">${r[0]}</span><div><b>${trlEsc(r[1])}</b><span>${trlEsc(r[2])}</span></div></div>`).join('')+'</div>'},
  tick(u,s,g){g.querySelectorAll('.qdm').forEach((d,i)=>{if(u>.04+i*.17&&!d.classList.contains('qin'))d.classList.add('qin')})}},
 map:{on(s,g){g.innerHTML='<div class="qmap" id="trlmap"></div>';trlMap($('trlmap'));setTimeout(()=>{const m=$('trlmap');if(m)m.classList.add('qgo')},40)},
  tick(u,s,g){const p=g.querySelectorAll('.qarc');p.forEach((a,i)=>{const k=Math.max(0,Math.min(1,(u-.06-i*.11)/.14));a.style.strokeDashoffset=String(1-k)});g.querySelectorAll('.qdot').forEach((d,i)=>{const on=u>.06+(i-1)*.11+.14||i==0;d.style.opacity=on?1:0;d.setAttribute('r',on?(i==0?5:4.2):0)});
   g.querySelectorAll('.qlab').forEach((d,i)=>d.style.opacity=u>.06+(i-1)*.11+.14||i==0?1:0)}},
 end:{on(s,g){g.innerHTML=`<div class="qend"><h1 id="trle1">WAVEFERN<br>RECORDS</h1><p id="trle2">MAKE MUSIC. GET FAMOUS. TOUR THE WORLD.</p><p id="trle3">FREE IN YOUR BROWSER · NO DOWNLOAD</p><p class="qu" id="trle4">WAVEFERN.COM</p></div>`},
  tick(u,s){const t=u*s.d,on=(id,k)=>{const e=$(id);if(e&&t>=k&&!e.classList.contains('qin')){e.classList.add('qin');if(id=='trle1')trlFlash(500)}};on('trle1',1.1);on('trle2',2.6);on('trle3',3.6);on('trle4',4.6)}}};
function trlMap(el){if(typeof WT_MAP=='undefined'){el.innerHTML='';return}const M=WT_MAP,my=l=>1.25*Math.log(Math.tan(Math.PI/4+.4*l*Math.PI/180)),Y0=my(M.lat0),Y1=my(M.lat1),
 pr=(la,lo)=>[(lo+180)/360*M.W,(Y0-my(Math.max(M.lat1-10,Math.min(M.lat0,la))))/(Y0-Y1)*M.H];
 const stops=['nyc','lon','par','lag','dxb','mum','tyo','syd'].map(id=>WT_DEST.find(d=>d.id==id)).filter(Boolean),pts=stops.map(d=>pr(d.lat,d.lon));
 let svg=`<svg viewBox="0 0 ${M.W} ${M.H}" xmlns="http://www.w3.org/2000/svg"><g fill="#16402a" stroke="#2a6a48" stroke-width=".5">`+M.c.map(r=>`<path d="${r[3]}"/>`).join('')+'</g>';
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],mx=(a[0]+b[0])/2,my2=(a[1]+b[1])/2-Math.hypot(b[0]-a[0],b[1]-a[1])*.32;
  svg+=`<path class="qarc" d="M${a[0]} ${a[1]}Q${mx} ${my2} ${b[0]} ${b[1]}" pathLength="1" fill="none" stroke="#2fe68a" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 4px #2fe68a)"/>`}
 pts.forEach((p,i)=>{svg+=`<circle class="qdot" cx="${p[0]}" cy="${p[1]}" r="0" fill="#fff" style="filter:drop-shadow(0 0 6px #2fe68a);transition:r .3s"/><text class="qlab" x="${p[0]+7}" y="${p[1]-7}" fill="#e8f3ec" font-size="13" font-family="Silkscreen,monospace" style="opacity:0;transition:opacity .3s;paint-order:stroke" stroke="#000" stroke-width="3">${trlEsc((stops[i].city||stops[i].country).toUpperCase())}</text>`});
 el.innerHTML=svg+'</svg><div class="qcap" style="top:auto;bottom:calc(max(0px,(100vh - 100vw/2.39)/2) + 6vh);transform:none"></div>'}

/* ---------- running ---------- */
function trlEnter(k){const s=TRL.shots[k],prev=TRL.shots[TRL.i];TRL.i=k;TRL.walk=null;
 if(TRL.car&&TRL.car.m){scene.remove(TRL.car.m)}TRL.car=null;if(TRL.plane)TRL.plane.visible=false;
 const blk=$('trlblk'),g=$('trlg');if(g)g.innerHTML='';trlCap(null);
 $('c').style.filter=s.blur?'blur(7px) brightness(.55) saturate(1.1)':'';
 if(blk){blk.style.transition='none';blk.style.opacity=s.dark?1:0}
 try{s.set&&s.set()}catch(e){console.error('trailer shot '+s.sc,e)}
 if(!s.show&&mode!='dshow')mode='trl';
 if(TRL.walk){const w=TRL.walk;trlPut(w.a[0],w.a[1],Math.atan2(w.b[0]-w.a[0],w.b[1]-w.a[1]));FOL.forEach(f=>{if(!f.home){f.x=P.x+f.ox;f.z=P.z+f.oz}})}
 if(TRL.car){const c=TRL.car;try{c.m=mkS(carb(c.i));c.m.scale.setScalar(1.5);c.m.rotation.y=Math.atan2(c.b[0]-c.a[0],c.b[1]-c.a[1]);scene.add(c.m)}catch(e){TRL.car=null}}
 TRL.own=!s.show;TRL.camf=s.camf?s.camf():null;
 if(s.gfx&&TRLG[s.gfx]&&g)TRLG[s.gfx].on(s,g);
 if(s.cap)setTimeout(()=>{if(TRL.i==k)trlCap(s.cap,s.slam)},s.slam?0:180);
 if(s.slam||(prev&&prev.sc=='Streams'))trlFlash(520);
 const nx=TRL.shots[k+1];if(nx&&nx.pre)try{nx.pre()}catch(e){console.error(e)}}
function trlPre(dt){const now=performance.now();TRL.T=TRL.fz!=null?TRL.fz:(now-TRL.t0)/1000;const T=TRL.T;
 let k=TRL.shots.findIndex(s=>T>=s.t&&T<s.t+s.d);if(k<0)k=T<0?-1:TRL.shots.length-1;
 if(k>=0&&k!==TRL.i)trlEnter(k);const s=TRL.shots[TRL.i];if(!s)return;const u=Math.max(0,Math.min(1,(T-s.t)/s.d));
 if(s.d-(T-s.t)<.32&&s.cap&&!s.capOut){s.capOut=1;trlCapOut()}
 if(TRL.walk){const w=TRL.walk,k2=(w.e||trlE.l)(u);P.x=w.a[0]+(w.b[0]-w.a[0])*k2;P.z=w.a[1]+(w.b[1]-w.a[1])*k2;P.rot=Math.atan2(w.b[0]-w.a[0],w.b[1]-w.a[1])}
 if(mode!='dshow'&&s.t!=null&&!s.show)S.t=Math.min(590,S.t);
 /* the music: cut on the end card, then a last hit on the logo */
 if(TRL.aud&&TRL.opt.music){const a=TRL.aud,E=TRL.shots[TRL.shots.length-1];
  if(!TRL.cut&&TRL.fz==null&&a.readyState>=2&&!a.paused){const d=a.currentTime-TRL.MO-T;if(Math.abs(d)>.3){if(!a.seeking&&performance.now()-(TRL.seekT||0)>2500){TRL.seekT=performance.now();try{a.currentTime=TRL.MO+T}catch(e){}}}else TRL.t0-=d*1000*.08}
  if(T>=E.t&&!TRL.cut){TRL.cut=1;a.pause()}
  if(T>=E.t+1.1&&TRL.cut==1){TRL.cut=2;try{a.currentTime=TRL.HIT;a.volume=1;a.play().catch(()=>{})}catch(e){}}
  if(TRL.cut==2){a.volume=Math.max(0,Math.min(1,1-(T-E.t-3.2)/4))}}}
function trlPost(dt){const s=TRL.shots[TRL.i];if(!s)return;const u=Math.max(0,Math.min(1,(TRL.T-s.t)/s.d));
 if(P.mesh&&mode!='dshow'){if(TRL.walk){const w=P.t=(P.t||0)+dt*10,sw=Math.sin(w)*.7;P.legs[0].rotation.x=sw;P.legs[1].rotation.x=-sw;P.arms[0].rotation.x=-sw;P.arms[1].rotation.x=sw;P.mesh.position.y=Math.abs(Math.sin(w))*.06+(typeof SY=='number'?SY:0)}
  else{P.legs[0].rotation.x=P.legs[1].rotation.x=0;P.arms[0].rotation.x=Math.sin(tt*1.4)*.05;P.arms[1].rotation.x=-Math.sin(tt*1.4)*.05}
  if(s.mic){P.arms[1].rotation.x=-1.25+Math.sin(tt*9)*.25;P.arms[0].rotation.x=-.25+Math.sin(tt*4.5)*.1;P.mesh.rotation.y=P.rot+Math.sin(tt*2.2)*.12}}
 if(TRL.car&&TRL.car.m){const c=TRL.car,x=c.a[0]+(c.b[0]-c.a[0])*u,z=c.a[1]+(c.b[1]-c.a[1])*u;c.m.position.set(x,Math.sin(tt*30)*.008,z)}
 if(TRL.plane&&TRL.plane.visible){const k=u,x=-400+k*160,y=4+Math.pow(k,1.6)*34,z=-6;TRL.plane.position.set(x,y,z);TRL.plane.rotation.set(0,Math.PI/2,0);TRL.plane.rotateX(-.22*Math.min(1,k*3))}
 FOL.forEach(f=>{if(f.m)f.m.visible=!!s.crew&&!f.home});
 const f=TRL.camf||s.cam;if(f&&TRL.own){const c=f(u);if(c){const C=TRL.cam;C.position.set(c.p[0],c.p[1],c.p[2]);C.lookAt(c.l[0],c.l[1],c.l[2]);C.fov=c.f;C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()}}
 if(s.show)try{const c=DCITY.view&&DCITY.view.cam;if(c){c.fov=58-trlE.s(u)*16;c.updateProjectionMatrix()}}catch(e){}
 if(s.gfx&&TRLG[s.gfx]&&TRLG[s.gfx].tick)TRLG[s.gfx].tick(u,s,$('trlg'));
 if(TRL.T>=TRL.len&&!TRL.done){TRL.done=1}}
{const u0=update;update=function(dt){if(TRL.run){try{trlPre(dt)}catch(e){console.error('trailer',e)}}u0(dt);if(TRL.run){try{trlPost(dt)}catch(e){console.error('trailer',e)}}}}
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(TRL.run&&TRL.own&&sc===scene&&c===cam&&TRL.cam)return r0(sc,TRL.cam);return r0(sc,c)}}
/* nothing is saved while trailer mode is on, so the career it borrows never overwrites yours */
{const a0=autoSave;autoSave=function(){if(TRL.on)return;return a0.apply(this,arguments)}}
if(typeof csPush=='function'){const c0=csPush;csPush=function(){if(TRL.on)return Promise.resolve();return c0.apply(this,arguments)}}
{const f0=fadeT;fadeT=function(dt){if(TRL.run){try{CT.forEach(b=>{b.mat.opacity=1;b.mat.depthWrite=true;if(b.dm){b.dm.opacity=1;b.dm.depthWrite=true}})}catch(e){}return}return f0.apply(this,arguments)}}
{const b0=bbAds;bbAds=function(){if(TRL.on)return[{n:TRL.name||S.artist||'Your name',g:'New album',c:'#1a6b4a',tag:'Out now'}];return b0.apply(this,arguments)}}
if(typeof Beats=='object'&&Beats&&Beats.play){const p0=Beats.play;Beats.play=function(){const r=p0.apply(this,arguments);if(TRL.run&&!TRL.opt.sfx)try{Beats.setVolume(0)}catch(e){}return r}}
addEventListener('keydown',e=>{if(!TRL.run)return;e.stopImmediatePropagation();e.preventDefault();if(e.key=='Escape')trlStop()},true);
addEventListener('resize',()=>{if(TRL.run)trlSize()});
function trlSize(){try{renderer.setSize(Math.ceil(innerWidth/2),Math.ceil(innerHeight/2),false)}catch(e){}}
function trlMute(on){try{MU.hold=on?1:0;MU.a.forEach(a=>{if(!a.paused)a.pause()})}catch(e){}try{if(on&&!TRL.opt.sfx&&typeof MG!='undefined'&&MG)MG.gain.value=0}catch(e){}try{if(on&&!TRL.opt.sfx)Beats.setVolume(0)}catch(e){}}

/* ---------- the menu ---------- */
function trlMenu(){if(!['play','pause','menu','pc'].includes(mode)||!P.mesh){snd('err');return say('Load a career first, then type trailer.')}
 try{if(!TRL.on)autoSave()}catch(e){}TRL.on=1;
 /* the track is loaded whole into memory, so it can be started at any point in it (seeking a streamed file is not always allowed) */
 if(!TRL.aud)fetch('audio/rocket.mp3').then(r=>r.blob()).then(b=>{if(!TRL.aud){TRL.aud=new Audio(URL.createObjectURL(b));TRL.aud.preload='auto'}}).catch(()=>{});trlCSS();try{$('ui').innerHTML=''}catch(e){}if(mode=='pause')try{resumeGame()}catch(e){}mode='trl';
 if(!TRL.name)TRL.name=S.artist||'';TRL.shots=trlShots();let m=$('trlm');if(m)m.remove();m=document.createElement('div');m.id='trlm';
 const o=TRL.opt,ck=(k,l)=>`<label><input type=checkbox ${o[k]?'checked':''} onchange="TRL.opt.${k}=this.checked?1:0"> ${l}</label>`;
 const groups=[];TRL.shots.forEach(s=>{const n=s.sc.replace(/ \d$/,'');const g=groups.find(x=>x.n==n);if(g)g.d+=s.d;else groups.push({n,k:s.k,d:s.d,t:s.t})});
 m.innerHTML=`<div class="box modal"><h2>🎬 Trailer mode</h2><p class=m><small>Plays a ${Math.round(TRL.len)} second trailer of WaveFern Records, made to be screen recorded. Start your recording, press Play, then press Space when you are ready. Esc stops it. Your career is saved and nothing is saved while trailer mode is on.</small></p>
 <label style="display:block">Artist name on screen<input type=text id=trln maxlength=24 value="${trlEsc(TRL.name)}"></label><label style="display:block">Song title on screen<input type=text id=trls maxlength=28 value="${trlEsc(TRL.song)}"></label>
 <div>${ck('music','Music (Rocket)')}${ck('cap','Captions')}${ck('bars','Black bars')}${ck('sfx','Game sounds')}</div>
 <div class=row><button class=go onclick="trlPlay(0)">▶ Play the whole trailer</button></div>
 <p class=m style="margin-top:14px"><small>Or play from a scene (it plays on to the end):</small></p><div class=sc>${groups.map(g=>`<button onclick="trlPlay(${g.k})">${trlEsc(g.n)}<small>${(g.t).toFixed(1)}s · ${g.d.toFixed(1)}s long</small></button>`).join('')}</div>
 <div class=row><button onclick="trlExit()">Leave trailer mode</button></div></div>`;document.body.appendChild(m)}
function trlPlay(k){const n=$('trln'),s=$('trls');if(n)TRL.name=n.value.trim();if(s)TRL.song=s.value.trim()||'Night Bus';const m=$('trlm');if(m)m.remove();
 TRL.shots=trlShots();closeUI();mode='trl';try{if(IN)leaveShop()}catch(e){}
 try{trlState()}catch(e){console.error('trailer state',e)}
 TRL.cam=TRL.cam||new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,2600);document.body.classList.add('trlon');const o=trlOverlay();trlSize();trlMute(1);
 TRL.i=-1;TRL.cut=0;TRL.done=0;TRL.showOn=0;TRL.shots.forEach(s=>s.capOut=0);TRL.k0=k||0;
 /* hold on black until Space: start the screen recording first */
 TRL.ready=1;const h=document.createElement('div');h.className='hint';h.id='trlh';h.innerHTML='Start your screen recording, then press <b style="color:#e8f3ec">Space</b> to roll.<br>Esc stops the trailer.';o.appendChild(h);
 const blk=$('trlblk');blk.style.transition='none';blk.style.opacity=1;
 const s0=TRL.shots[TRL.k0];try{s0.pre&&s0.pre()}catch(e){}try{const prev=TRL.shots[TRL.k0-1];if(prev&&prev.pre)prev.pre()}catch(e){}
 if(TRL.k0>0){try{s0.set&&s0.set()}catch(e){}}
 const go=e=>{if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();e.stopImmediatePropagation();removeEventListener('keydown',go,true);trlRoll()};addEventListener('keydown',go,true)}
function trlRoll(){const h=$('trlh');if(h)h.remove();const s0=TRL.shots[TRL.k0];
 setTimeout(()=>{TRL.run=1;TRL.i=-1;const start=()=>{TRL.t0=performance.now()-s0.t*1000};
  start();if(TRL.opt.music){try{const a=TRL.aud=TRL.aud||new Audio('audio/rocket.mp3');a.preload='auto';a.volume=1;
   /* the clock leads; the track is seeked once it can be, then kept within a frame or two of the clock */
   const sync=()=>{try{a.currentTime=TRL.MO+Math.max(0,(performance.now()-TRL.t0)/1000)}catch(e){}};if(a.readyState>=1)sync();else a.addEventListener('loadedmetadata',sync,{once:true});a.play().catch(()=>{});TRL.sync=1}catch(e){}}
},900)}
function trlStop(){TRL.run=0;try{if(TRL.aud)TRL.aud.pause()}catch(e){}try{sessionStorage.setItem('fw_go','1');sessionStorage.setItem('fw_trl','1')}catch(e){}location.reload()}
function trlExit(){TRL.on=0;try{sessionStorage.setItem('fw_go','1')}catch(e){}location.reload()}
/* after "Esc" the game reloads your own career and opens the trailer menu again */
try{if(sessionStorage.getItem('fw_trl')){sessionStorage.removeItem('fw_trl');const w=setInterval(()=>{if(typeof mode!='undefined'&&mode=='play'&&P.mesh){clearInterval(w);trlMenu()}},400);setTimeout(()=>clearInterval(w),30000)}}catch(e){}
{const l0=loadCode;loadCode=function(c){if(typeof c=='string'&&c.trim().toLowerCase()=='trailer'){trlMenu();return}return l0.apply(this,arguments)}}
