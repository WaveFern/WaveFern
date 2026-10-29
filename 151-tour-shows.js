/* ===== v43.6.0: stadium and club shows in the destination cities =====
   Every city (150-tour-cities.js) gets a huge stadium on its plaza and a club downtown, named in WT_DEST (venue, club).
   - stadium: an open bowl with a pitch, two decks of seats, a roof ring and floodlight masts; the gate faces the plaza (south)
     with the venue's name, turnstiles, a poster of your show, merch and food stalls and fans waiting outside.
     Gate -> concourse (food, merch, section signs, fans) -> Backstage door -> dressing room (plan the show, rehearse) -> stage.
   - club: walk up to its door downtown, plan the show and play.
   - planning: the setlist starts from the World Tour app's plan for that stop (wtSetlist) or your top songs; add songs or whole
     albums, reorder, the last song is the encore. Production (pyro and fireworks, lasers, confetti, dancers) costs money and
     lifts the crowd; rehearsing (an hour, twice a day) makes you sharper.
   - the show: a perspective view inside the venue with the crowd filling it as tickets sold (wtPay), a stage with a big
     screen, side screens, a catwalk to a B-stage, band, light beams, lasers, pyro, fireworks, confetti, phone lights and a
     Mexican wave in the interval. Songs play one by one (their own beats), the camera cuts between shots, crowd minigames
     pop up (same as the festival), you talk to the crowd between songs (greeting them in the local language works best),
     a stadium show has an intermission and an encore. A full stadium show runs 6-10 in-game hours, until 05:50 at most.
   - rewards: score from the minigames, the crowd's energy, song quality, rehearsal and production -> wtPay (World Tour app)
     -> money, followers and streams (streams go to the songs you played); wtCanPlay keeps one show a day and the venue
     cooldown, and wtShowDone records the show in the app's Shows played tab. */
(()=>{
const D=window.DCITY;if(!D)return;const OX=D.OX,OZ=D.OZ;
const kOf=k=>k=='club'?'club':'venue';
const vOf=(d,k)=>d?(kOf(k)=='club'?d.club:d.venue):null;
const flv=()=>{try{return fameLevel()}catch(e){return 0}};
const songDur=(s,k)=>(kOf(k)=='club'?22:30)+fHash('ds'+s.id)%(kOf(k)=='club'?12:16);
const mins=()=>festMins();
const W2=(f,...a)=>{const o=FEST.set;FEST.set=SH;try{return f(...a)}finally{FEST.set=o}};
let SH=null;/* the running show */

/* ---------- stadium outside, on the city plaza ---------- */
D.cityHooks.push(C=>{const s=C.s,G=D.mkG(),Gw=D.mkG(),q=D.QB(),st=C.st,a=st.a,b=st.b,x=st.x,z=st.z,o={sz:b/a},d=C.d,v=d.venue||{n:'Stadium'},wall='#e8e6e0';
 const pl=C.plaza;D.quadY(G,pl.x0,pl.z0,pl.x1,pl.z1,.03,dk(s.walk,1.1));for(let gx=pl.x0;gx<pl.x1;gx+=6)D.quadY(G,gx,pl.z0,gx+.08,pl.z1,.04,dk(s.walk,.9));
 /* the bowl: outer wall with ribs and a lit band, seats sloping down to the pitch, roof ring, floodlights */
 xgPrism(G,a,a,20,48,wall,x,0,z,Object.assign({cap:false},o));xgPrism(G,a*.62,a*.97,18.5,48,'#9aa4b0',x,1,z,Object.assign({inv:1,cap:false},o));
 xgPrism(G,a*.62,a*.78,8,48,s.acc,x,1,z,Object.assign({inv:1,cap:false},o));xgRing(G,a*.97,a,20,48,'#c8ccd2',x,z,o);
 xgPoly(G,Array.from({length:32},(_,i)=>{const t=i/32*Math.PI*2;return[x+Math.cos(t)*a*.62,z+Math.sin(t)*b*.62]}),.9,'#4a9a4a',x,z);
 for(let i=0;i<10;i++)D.quadY(G,x-a*.5+i*a*.1,z-b*.45,x-a*.5+i*a*.1+a*.05,z+b*.45,.92,'#58a858');
 bx3(G,a*.3,2.4,6,'#1a1a1e',x,1.2,z-b*.48);
 for(let i=0;i<40;i++){const t=i/40*Math.PI*2,cx=x+Math.cos(t)*a*1.005,cz=z+Math.sin(t)*b*1.005;xgBox(G,1.1,20.6,1.1,'#c8ccd2',cx,10.3,cz,-t)}
 xgRing(G,a*.86,a*1.04,21.2,48,'#f0f0f0',x,z,o);xgPrism(G,a*1.04,a*1.04,.8,48,'#d0d4da',x,20.6,z,Object.assign({cap:false},o));
 xgPrism(G,a*1.008,a*1.008,.6,48,s.neon,x,12,z,Object.assign({cap:false},o));/* lit band (body colour by day) */
 const band=D.mkG();xgPrism(band,a*1.012,a*1.012,.5,48,s.neon,x,12.05,z,Object.assign({cap:false},o));
 [[.72,.72],[-.72,.72],[.72,-.72],[-.72,-.72]].forEach(([u,w])=>{const fx=x+u*a*.98,fz=z+w*b*.98;xgPrism(G,.5,.35,30,8,'#9aa0a6',fx,0,fz);xgBox(G,4,2.4,.6,'#3a3a3a',fx,30,fz,Math.atan2(u,w));xgBox(Gw,3.6,2,.62,'#fff8e0',fx,30,fz,Math.atan2(u,w))});
 /* gate on the south side: arch, venue name, turnstiles, screen with your show */
 const gz=z+b,gw=22;xgBox(G,gw,9,3,'#2a2e36',x,4.5,gz+.8);xgBox(G,gw-4,6,3.2,'#1a1a1e',x,3,gz+.8);D.quadZ(Gw,x-gw/2+2.2,x+gw/2-2.2,.2,5.6,gz+2.44,'#ffe8b0');
 for(let i=-4;i<=4;i++)xgBox(G,.3,1.1,1.2,'#b8bcc4',x+i*2,.55,gz+3.2);
 const uv=C.A.add(640,110,(c,w,h)=>{c.fillStyle='#0e1018';c.fillRect(0,0,w,h);c.fillStyle=s.neon;c.shadowColor=s.neon;c.shadowBlur=18;c.textAlign='center';c.textBaseline='middle';D.fitF(c,v.n.toUpperCase(),62,w-30);c.fillText(v.n.toUpperCase(),w/2,h/2+2);c.shadowBlur=0});
 D.qFace(q,'z',gz+2.32,x-gw/2+.6,x+gw/2-.6,6.4,8.6,uv&&uv.uv);
 const up=C.A.add(320,134,(c,w,h)=>D.posterArt(c,w,h,s,d));const sx0=x+gw/2+3;xgBox(G,9.4,5.4,.4,'#111',sx0+4.7,7,gz+.8);xgBox(G,.4,4.5,.4,'#333',sx0+4.7,2.2,gz+.8);D.qFace(q,'z',gz+1.02,sx0+.2,sx0+9.2,4.5,9.5,up&&up.uv);
 D.qFace(q,'z',gz+1.02,x-gw/2-12,x-gw/2-3,4.5,9.5,up&&up.uv);xgBox(G,9.4,5.4,.4,'#111',x-gw/2-7.5,7,gz+.8);xgBox(G,.4,4.5,.4,'#333',x-gw/2-7.5,2.2,gz+.8);
 /* merch tent, food trucks, ticket booth, barriers, flags */
 const tz=gz+12;[[x-gw/2-14,'MERCH',s.acc],[x+gw/2+16,(D.food(C.id)[0]||['FOOD'])[0].toUpperCase(),'#d8462b'],[x+gw/2+24,(D.food(C.id)[1]||['SNACKS'])[0].toUpperCase(),'#f5b915']].forEach(([mx,nm,c],i)=>{
  if(i==0){xgBox(G,6,2.6,4,'#f4f0e8',mx,1.3,tz);D.gable(G,mx-3.2,tz-2.2,mx+3.2,tz+2.2,2.6,1.4,c,'#f4f0e8',1)}else{xgBox(G,6,2.8,2.6,c,mx,1.6,tz,0,'#e8e8e8');xgBox(G,4,1,.1,'#222',mx-.4,2.1,tz+1.32);for(const wx of[-2,2])xgBox(G,.7,.7,.3,'#111',mx+wx,.35,tz+1.2)}
  const su=C.A.add(256,64,(cx,w,h)=>D.signArt(cx,w,h,nm,{bg:c,fg:'#fff'}));D.qFace(q,'z',tz+(i==0?2.25:1.35),mx-2.6,mx+2.6,i==0?2.9:3.1,i==0?3.9:3.9,su&&su.uv);D.col(mx-3,tz-2,mx+3,tz+2);
  D.addInt(mx,tz+3,1.8,i==0?'Merch stand':'Buy food',()=>i==0?merch(C):dsFoodStall(C))});
 xgBox(G,3,2.6,2,'#2a6a3a',x-gw/2-2,1.3,gz+8);const bu=C.A.add(256,64,(cx,w,h)=>D.signArt(cx,w,h,'BOX OFFICE',{bg:'#2a6a3a',fg:'#ffd23d'}));D.qFace(q,'z',gz+9.02,x-gw/2-3.4,x-gw/2-.6,1.9,2.6,bu&&bu.uv);D.col(x-gw/2-3.5,gz+7,x-gw/2-.5,gz+9);
 D.addInt(x-gw/2-2,gz+10,1.8,'Box office',()=>boxOffice(C));
 for(let i=0;i<6;i++){const bz=gz+5+i*1.6;xgBox(G,9,.9,.1,'#9aa0a6',x-5.5,.45,bz);xgBox(G,9,.9,.1,'#9aa0a6',x+5.5,.45,bz)}
 for(let i=0;i<8;i++){const fx=pl.x0+4+i*(pl.x1-pl.x0-8)/7,fz=pl.z1-3;xgBox(G,.12,7,.12,'#ccc',fx,3.5,fz);xgBox(G,1.6,2.4,.05,i%2?s.acc:s.neon,fx+.85,5.6,fz)}
 /* colliders: the bowl as a ring of rectangles, the gate */
 for(let i=0;i<24;i++){const x0=x-a+i*a*2/24,x1=x0+a*2/24,m=(x0+x1)/2-x,hz=b*Math.sqrt(Math.max(0,1-(m/a)**2));D.col(x0,z-hz,x1,z+hz)}
 D.col(x-gw/2,gz-1,x-1.5,gz+2.4);D.col(x+1.5,gz-1,x+gw/2,gz+2.4);D.col(sx0+4.5,gz+.5,sx0+4.9,gz+1.1);D.col(x-gw/2-7.7,gz+.5,x-gw/2-7.3,gz+1.1);
 const body=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true}),win=D.winMat(),U={mats:[body,win],b:[x-a,z-b,x+a,z+b+3,21],o:1};
 D.flushTo(G,C.g,body);D.flushTo(Gw,C.g,win);D.flushTo(band,C.g,C.glowM);if(q.I.length){const sm=new THREE.MeshBasicMaterial({map:C.A.tex,transparent:true,side:THREE.DoubleSide});C.signM.push(sm);U.mats.push(sm);C.signQ.push([q,sm,U])}C.fades.push(U);
 C.spots.stadium={x,z:gz+4,n:v.n};D.addInt(x,gz+3.6,2.6,'Enter '+v.n,()=>enterConcourse(C));
 /* club door */
 if(C.spots.club)D.addInt(C.spots.club.x,C.spots.club.z,2,'Enter '+((d.club&&d.club.n)||'the club'),()=>clubDoor(C));
 buildRooms(C)});
function bx3(G,w,h,d,c,x,y,z){xgBox(G,w,h,d,c,x,y,z)}

/* ---------- concourse and dressing room ---------- */
function buildRooms(C){const s=C.s,d=C.d,v=d.venue||{n:'Stadium'};
 const cr=D.mkRoom('conc',1100,0,48,12,{floor:'#8a8e94',wall:dk(s.acc,.55),h:4.6,tiles:1,name:v.n+' concourse'});const x0=1100,z0=0;
 for(let i=0;i<6;i++){const sx=x0+3+i*7;cr.sign('z',z0+.05,sx,sx+3.6,3.2,4,256,64,(c,w,h)=>D.signArt(c,w,h,'SECTIONS '+(101+i*4)+'-'+(104+i*4)+' ↑',{bg:'#10202e',fg:'#ffd23d'}));cr.box(2.6,3,.2,'#1a1a1e',sx+1.8,1.5,z0+.12);cr.glow(2.2,2.6,.05,'#3a5a7a',sx+1.8,1.4,z0+.24)}
 const F=D.food(C.id);[[x0+6,F[0][0]],[x0+20,F[1][0]],[x0+34,'MERCH']].forEach(([fx,nm],i)=>{cr.box(5,1.1,1.2,i==2?s.acc:'#c8a868',fx,.55,z0+6,1);cr.box(5,2.8,.2,'#2a2a2a',fx,2.6,z0+5.2);
  cr.sign('z',z0+5.32,fx-2.2,fx+2.2,3.1,3.9,256,64,(c,w,h)=>D.signArt(c,w,h,String(nm).toUpperCase(),{bg:i==2?s.acc:'#6a3a2a',fg:'#fff',neon:i!=2}));cr.int(fx,z0+7.6,1.6,i==2?'Merch stand':'Buy food',()=>i==2?merch(C):dsFoodStall(C))});
 cr.box(2.4,3.2,.2,'#3a3a3a',x0+45,1.6,z0+.12);cr.sign('z',z0+.25,x0+43.6,x0+46.4,3.4,4,256,64,(c,w,h)=>D.signArt(c,w,h,'BACKSTAGE · ARTISTS ONLY',{bg:'#7a1a2a',fg:'#fff'}));
 cr.int(x0+45,z0+1.6,1.6,'Backstage door',()=>backstage(C,'venue'));cr.int(x0+4,z0+11.2,1.6,'Leave the stadium',()=>D.goOut(C.st.x,C.st.z+C.st.b+4.6,0));
 cr.box(3,2.6,.1,'#9ad4ff',x0+4,1.3,z0+12.1);
 [[x0+44,z0+2.6,1],[x0+30,z0+7.2,0]].forEach(([px,pz,sec])=>{let o;try{o=buildChar(Object.assign(fCfg(),sec?{top:2,tc:9,pc:0}:{}))}catch(e){return}o.g.position.set(OX+px,0,OZ+pz);scene.add(o.g);cr.extra.push(o.g)});
 cr.walk=[];for(let i=0;i<14;i++){let o;try{o=buildChar(fCfg())}catch(e){continue}scene.add(o.g);cr.extra.push(o.g);cr.walk.push({o,x:x0+3+Math.random()*42,z:z0+8+Math.random()*3,dir:Math.random()<.5?1:-1,sp:R(.8,1.5),t:Math.random()*6})}
 cr.done();
 const dr=D.mkRoom('dress',1170,0,16,10,{floor:'#6a5a4e',wall:'#3a3046',h:3.8,name:'Dressing room'}),y0=1170;
 dr.box(6,1.6,.2,'#d8d4cc',y0+4,1.9,.12);for(let i=0;i<9;i++){dr.glow(.22,.22,.1,'#fff8d0',y0+1.3+i*.68,2.75,.3);dr.glow(.22,.22,.1,'#fff8d0',y0+1.3+i*.68,1.05,.3)}dr.box(6,.7,.6,'#2a2a2e',y0+4,.35,.6,1);
 dr.box(4,.5,1.4,'#7a2a4a',y0+12,.25,1.2,1);dr.box(4,.8,.3,'#7a2a4a',y0+12,.7,.55);dr.box(.1,1.8,2.6,'#aaa',y0+15,.9,6,0);
 for(let i=0;i<6;i++)dr.box(.5,1.2,.3,pick([s.acc,s.neon,'#f4f4f4','#1a1a1a','#e8b44a']),y0+15-.4,1.2,4.9+i*.45);dr.cols.push([y0+14.5,4.6,y0+15.4,7.4]);
 dr.box(3,.9,1,'#e8e4dc',y0+3,.45,6.6,1);['#e8463a','#ffd23d','#7ac83a','#f08a2a'].forEach((c,i)=>dr.box(.3,.3,.3,c,y0+2+i*.6,1.05,6.6));
 dr.box(3.2,2.2,.1,'#f4f4f4',y0+10,1.8,.12);dr.sign('z',.2,y0+8.6,y0+11.4,2.3,2.8,256,48,(c,w,h)=>D.signArt(c,w,h,'SETLIST',{bg:'#f4f4f4',fg:'#2a2a2a'}));
 dr.box(1.6,2.8,.15,'#2a2a2a',y0+.2+.1,1.4,8.6);dr.sign('x',y0+.3,7.6,9.6,2.9,3.4,256,48,(c,w,h)=>D.signArt(c,w,h,'STAGE →',{bg:'#ffd23d',fg:'#111'}));
 dr.int(y0+10,1.6,1.8,'Plan the show',()=>prepUI(C,'venue',1));dr.int(y0+4,1.8,1.8,'Rehearse with the band',()=>rehearse(C,'venue'));
 dr.int(y0+1.3,8.6,1.6,'Walk out on stage',()=>startShow(C,'venue'));dr.int(y0+8,9.4,1.4,'Back to the concourse',()=>D.goRoom('conc',1100+45,2.8,0));
 dr.done()}
function dsFoodStall(C){const d=C.d,F=D.food(C.id),place=d.city||d.country;GR='"Show-day prices, sorry!"';
 shopModal('Food · '+esc(place),()=>F.map(m=>[m[0],Math.round(m[1]*1.3),'+'+m[2]+' energy'+(m[3]?' · refills stamina':'')]),i=>{const m=F[i],p=Math.round(m[1]*1.3);if(S.money<p){snd('err');return say('Not enough money.')}if(!m[3]&&S.energy>=100){snd('err');return say('You are already full of energy.')}
  S.money=+(S.money-p).toFixed(2);S.energy=Math.min(100,S.energy+m[2]);if(m[3]){S.stam=100;S.exh=0}snd('eat');say('Yum! '+m[0])})}
function merch(C){snd('pop');const n=Math.round(40+Math.sqrt(S.followers||0)*.02);say('Fans are queueing for your T-shirts. '+(S.artist||'Your')+' merch is selling here tonight.');}
function boxOffice(C){const d=C.d,v=d.venue,cl=d.club;mode='menu';const row=(k,vv)=>{if(!vv)return'';const c=typeof wtCanPlay=='function'?wtCanPlay(C.id,k):{ok:flv()>=vv.fame,why:'Needs Fame Level '+vv.fame+'.'};const e=typeof wtPay=='function'?wtPay(C.id,k,.7):null;
  return`<div class=card style="margin:6px 0"><b>${esc(vv.n)}</b> <small class=m>· ${k=='club'?'club':'stadium'} · ${vv.cap.toLocaleString()} capacity · Fame Level ${vv.fame} · tickets $${vv.tix}</small><br>${c.ok?`<span style="color:#2fe68a">Open to book: about ${e?e.att.toLocaleString():'?'} fans would come, about ${e?$$(e.money):'?'} for you.</span>`:`<span style="color:#ff8a6a">${esc(c.why)}</span>`}</div>`};
 $('ui').innerHTML=`<div class="box modal"><h2>🎟 Box office · ${esc(wtPlace(d))}</h2><p class=m>You are Fame Level ${flv()}. ${clk()}. Shows can start between 12:00 and 02:00. Stadium: walk in through the gate, then the Backstage door. Club: its door downtown.</p>${row('venue',v)}${row('club',cl)}<button onclick="closeUI()">Close</button></div>`}

/* ---------- planning the show ---------- */
function prepOf(C,k){S.dcity=S.dcity||{};const P=S.dcity.prep=S.dcity.prep||{},key=C.id+'|'+kOf(k);let p=P[key];
 if(!p||typeof p!='object'){p=P[key]={songs:[],prod:{},reh:0,rd:0}}
 p.songs=(p.songs||[]).filter(id=>S.songs.some(x=>x.id===id));if(!p.songs.length){let L=[];try{L=(wtSetlist(C.id)||[]).map(x=>x.id)}catch(e){}if(!L.length)L=S.songs.slice().sort((a,b)=>(b.streams||0)-(a.streams||0)).slice(0,kOf(k)=='club'?7:12).map(x=>x.id);p.songs=L}
 if(p.rd!==S.day){p.reh=Math.min(p.reh||0,2);p.rdx=0}return p}
const PROD={venue:[['pyro','Pyro and fireworks',25000],['lasers','Lasers',12000],['confetti','Confetti finale',6000],['dancers','Dancers',15000]],club:[['lasers','Lasers',1500],['confetti','Confetti finale',600],['smoke','Smoke and strobes',400]]};
function prepUI(C,k,inDress){k=kOf(k);const p=prepOf(C,k),v=vOf(C.d,k),L=p.songs.map(id=>S.songs.find(x=>x.id===id)).filter(Boolean);mode='menu';D.prepCtx={C,k,inDress};
 const tot=L.reduce((a,s)=>a+songDur(s,k),0)+(k=='venue'&&L.length>=8?25:0)+Math.floor(L.length/3)*8,left=1790-mins();
 const rest=S.songs.filter(x=>!p.songs.includes(x.id)).sort((a,b)=>(b.streams||0)-(a.streams||0));
 $('ui').innerHTML=`<div class="box modal" style="width:min(640px,96vw)"><h2>🎤 Plan the show · ${esc(v.n)}</h2><p class=m>${esc(wtPlace(C.d))} · ${k=='club'?'club':'stadium'} · ${v.cap.toLocaleString()} capacity. The setlist plays top to bottom${L.length>=4?'; the last song is the encore':''}. About ${(tot/60).toFixed(1)} in-game hours${left<tot?' · <span style="color:#ff8a6a">too long for tonight, the end will be cut at 05:50</span>':''}.</p>
 <div style="max-height:34vh;overflow:auto;margin:6px 0">${L.map((s,i)=>`<div class=ng><span style="flex:1">${i+1}. "${esc(s.title)}"${s.ft?' <small class=m>feat. '+esc(s.ft)+'</small>':''}${i==L.length-1&&L.length>=4?' <small style="color:#ffd23d">· encore</small>':''}</span><button onclick="DCITY.prepMove(${i},-1)" ${i?'':'disabled'}>▲</button><button onclick="DCITY.prepMove(${i},1)" ${i<L.length-1?'':'disabled'}>▼</button><button onclick="DCITY.prepDel(${i})">✕</button></div>`).join('')||'<p class=m>No songs yet.</p>'}</div>
 <div class=ng><select id=dsadd style="flex:1">${rest.slice(0,120).map(s=>`<option value="${s.id}">${esc(s.title)}</option>`).join('')}</select><button onclick="DCITY.prepAdd()" ${rest.length&&L.length<18?'':'disabled'}>Add song</button></div>
 ${(S.albums||[]).length?`<div class=ng><select id=dsalb style="flex:1">${S.albums.map((a,i)=>`<option value="${i}">${esc(a.name)} (${a.songs.length})</option>`).join('')}</select><button onclick="DCITY.prepAlb()">Add album</button></div>`:''}
 <div class=ng><button onclick="DCITY.prepPlan()">Use the World Tour plan</button><button onclick="DCITY.prepTop()">Top songs</button><button onclick="DCITY.prepClear()">Clear</button></div>
 <h3 style="margin:10px 0 4px">Production</h3>${PROD[k].map(([id,n,c])=>`<label class=ng style="cursor:pointer"><input type=checkbox ${p.prod[id]?'checked':''} onchange="DCITY.prepProd('${id}',this.checked)"> <span style="flex:1">${n}</span><small class=m>${$$(c)}</small></label>`).join('')}
 <p class=m>Rehearsed ${p.rd===S.day?p.reh:0}/2 today${inDress||k=='club'?'':''}. You have ${$$(S.money)} and ${Math.round(S.energy)} energy (a show needs 25).</p>
 <div class=row2>${k=='club'?`<button onclick="DCITY.rehearse('club')">Rehearse (1 hour)</button>`:''}${inDress||k=='club'?`<button class=go onclick="DCITY.startShow('${k}')" ${L.length>=3?'':'disabled'}>Start the show</button>`:''}<button onclick="closeUI()">Done</button></div></div>`}
const PU=()=>{const c=D.prepCtx;if(!c)return null;return{c,p:prepOf(c.C,c.k)}};
D.prepMove=(i,dir)=>{const u=PU();if(!u)return;const a=u.p.songs,j=i+dir;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];prepUI(u.c.C,u.c.k,u.c.inDress)};
D.prepDel=i=>{const u=PU();if(!u)return;u.p.songs.splice(i,1);if(!u.p.songs.length)u.p.songs=[-1];prepUI(u.c.C,u.c.k,u.c.inDress)};
D.prepAdd=()=>{const u=PU(),e=$('dsadd');if(!u||!e)return;const id=+e.value;u.p.songs=u.p.songs.filter(x=>x!==-1);if(!u.p.songs.includes(id)&&u.p.songs.length<18)u.p.songs.push(id);prepUI(u.c.C,u.c.k,u.c.inDress)};
D.prepAlb=()=>{const u=PU(),e=$('dsalb');if(!u||!e)return;const a=S.albums[+e.value];if(!a)return;u.p.songs=u.p.songs.filter(x=>x!==-1);a.songs.forEach(id=>{if(!u.p.songs.includes(id)&&u.p.songs.length<18&&S.songs.some(x=>x.id===id))u.p.songs.push(id)});prepUI(u.c.C,u.c.k,u.c.inDress)};
D.prepPlan=()=>{const u=PU();if(!u)return;let L=[];try{L=(wtSetlist(u.c.C.id)||[]).map(x=>x.id)}catch(e){}if(!L.length){snd('err');return say('No songs planned for this stop in the World Tour app.')}u.p.songs=L.slice(0,18);prepUI(u.c.C,u.c.k,u.c.inDress)};
D.prepTop=()=>{const u=PU();if(!u)return;u.p.songs=S.songs.slice().sort((a,b)=>(b.streams||0)-(a.streams||0)).slice(0,u.c.k=='club'?7:12).map(x=>x.id);prepUI(u.c.C,u.c.k,u.c.inDress)};
D.prepClear=()=>{const u=PU();if(!u)return;u.p.songs=[-1];prepUI(u.c.C,u.c.k,u.c.inDress)};
D.prepProd=(id,on)=>{const u=PU();if(!u)return;u.p.prod[id]=on?1:0};
function rehearse(C,k){const p=prepOf(C,k);if(p.rd!==S.day){p.rd=S.day;p.reh=0}if(p.reh>=2){snd('err');return say('You already rehearsed twice today. Save your voice!')}if(S.energy<20){snd('err');return say('Too tired to rehearse (20 energy needed).')}
 closeUI();D.fade(()=>{p.reh++;S.energy-=8;S.t=Math.min(599,S.t+(S.t<300?21:30))},()=>{snd('cash');say('Rehearsal done ('+p.reh+'/2 today). The band is tight. · '+clk())})}
D.rehearse=k=>{const C=D.C;if(C)rehearse(C,k)};
function canStart(C,k){const v=vOf(C.d,k);if(!v)return'No show here.';const c=typeof wtCanPlay=='function'?wtCanPlay(C.id,k):{ok:flv()>=v.fame,why:v.n+' needs Fame Level '+v.fame+'.'};if(!c.ok&&!S.cheat)return c.why;
 const m=mins();if(m<720||m>1560)return'Shows start between 12:00 and 02:00. It is '+clk()+'.';if(S.energy<25)return'Too tired to perform (25 energy needed). Eat something first.';return''}
function enterConcourse(C){snd('pop');D.goRoom('conc',1104,10.5,Math.PI);say((C.d.venue||{n:'The stadium'}).n+': the Backstage door is at the far end.')}
function backstage(C,k){const why=canStart(C,k);if(why&&!/^Shows start|^Too tired/.test(why)){snd('err');return say('Security: "'+why+'"')}D.goRoom('dress',1178,8.6,Math.PI);say(why?why:'Your dressing room. Plan the show at the setlist board, then walk out on stage.')}
function clubDoor(C){const why=canStart(C,'club');if(why&&!/^Shows start|^Too tired/.test(why)){snd('err');return say('Door staff: "'+why+'"')}prepUI(C,'club',0)}
D.startShow=k=>{const C=D.C;if(C)startShow(C,k)};
/* the trailer cuts in after the walk-out: skip the countdown so the first song is already playing */
D.showSkipIntro=()=>{if(SH&&SH.state=='intro')SH.stT=STATES.intro};

/* ---------- the venue for the show (built when the show starts, taken down after) ---------- */
const AX=2400,AZ=0;/* local position of the show venue */
const CU={uT:{value:0},uAmp:{value:.25},uRate:{value:8},uHype:{value:.5},uWave:{value:0}};
function crowdMat(hands){const m=new THREE.MeshLambertMaterial({color:'#ffffff'});if(hands)m.defines={HANDS:''};
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,CU);sh.vertexShader=sh.vertexShader.replace('void main() {','uniform float uT,uAmp,uRate,uHype,uWave;\nvoid main() {').replace('#include <begin_vertex>',`#include <begin_vertex>
#ifdef USE_INSTANCING
 vec3 ip=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);float ph=fract(sin(dot(ip.xz,vec2(12.9898,78.233)))*43758.5453);
 float ang=atan(ip.z,ip.x);float wv=uWave*max(0.,1.-abs(mod(ang-uT*1.4+3.1416,6.2832)-3.1416)*2.2);
 float jp=uAmp*max(0.,sin(uT*uRate+ph*6.2832))*step(ph,uHype*1.2+.08);transformed.y+=jp+wv*.7;
 #ifdef HANDS
 transformed.y-=(1.-max(step(ph,uHype*.9),wv))*.8;
 #endif
#endif`)};m.customProgramCacheKey=()=>hands?'dscrowdH':'dscrowd';m.userData={dsOwn:1};return m}
function crowdBuild(A,spots){const n=spots.length;if(!n)return;const mk=(g,mat,cols)=>{const im=new THREE.InstancedMesh(g,mat,n);im.instanceMatrix.setUsage(THREE.StaticDrawUsage);const M4=new THREE.Matrix4(),c=new THREE.Color();
  spots.forEach((p,i)=>{M4.makeRotationY(p.r||0);M4.setPosition(p.x,p.y,p.z);im.setMatrixAt(i,M4);c.set(cols(i));im.setColorAt(i,c)});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.userData.dsOwn=1;g.userData.dsOwn=1;A.g.add(im);return im};
 const shirts=['#e8e8ec','#1a1a1e','#c0392b','#2f6fb5','#2a8a4a','#e6b422','#8e44ad','#ff8a30',A.s.acc,A.s.neon,A.s.acc],skins=['#f2d0b0','#e0b090','#c08a60','#8a5a3a','#5a3a24','#f8dcc0'];
 const bg=new THREE.BoxGeometry(.5,1.15,.34);bg.translate(0,.6,0);const hg=new THREE.BoxGeometry(.34,.34,.32);hg.translate(0,1.36,0);const hd=new THREE.BoxGeometry(.13,.36,.13);const h2=hd.clone();hd.translate(-.3,1.66,0);h2.translate(.3,1.66,0);
 const hm=mergeG([hd,h2]);A.body=mk(bg,crowdMat(0),()=>pick(shirts));A.head=mk(hg,crowdMat(0),()=>pick(skins));A.hand=mk(hm,crowdMat(1),()=>pick(skins));
 /* phone lights at the hands of some fans */
 const L=Math.min(n,1800),P=new Float32Array(L*3);for(let i=0;i<L;i++){const p=spots[(i*7919)%n];P[i*3]=p.x+(i%2?.3:-.3);P[i*3+1]=p.y+2.05;P[i*3+2]=p.z}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(P,3));pg.userData.dsOwn=1;A.phones=new THREE.Points(pg,new THREE.PointsMaterial({color:'#fff6d8',size:.32,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));A.phones.material.userData={dsOwn:1};A.phones.userData.dsOwn=1;A.phones.frustumCulled=false;A.g.add(A.phones)}
function mergeG(L){const P=[],N=[],I=[];let o=0;L.forEach(g=>{const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));N.push(n.getX(i),n.getY(i),n.getZ(i))}const ix=g.index;for(let i=0;i<ix.count;i++)I.push(ix.getX(i)+o);o+=p.count;g.dispose()});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setIndex(I);return g}
function screenTex(w,h){return fTex(w,h,()=>{})}
function arena(C,k,fill){const s=C.s,A={k,s,g:new THREE.Group(),fx:[],band:[],dancers:[]};A.g.position.set(OX+AX,0,OZ+AZ);scene.add(A.g);const G=D.mkG(),Gw=D.mkG(),spots=[];
 const rnd=fRng(fHash('arena'+C.id+k)),RR=(a,b)=>a+rnd()*(b-a);
 if(k=='venue'){const a=58,b=46,o={sz:b/a};A.stage={x:0,z:-30,w:34,d:12,h:2.4};const sz0=-24;
  xgPoly(G,Array.from({length:48},(_,i)=>{const t=i/48*Math.PI*2;return[Math.cos(t)*a*1.02,Math.sin(t)*b*1.02]}),0,'#3f8a3f',0,0);for(let i=-5;i<=5;i++)D.quadY(G,i*a*.18-a*.045,-b,i*a*.18+a*.045,b,.01,'#4a9a48');
  let y=1,lastK=1.02;for(let r=0;r<24;r++){if(r==12){y+=3.2;lastK+=.06;const fs=D.mkG();xgPrism(fs,a*lastK,a*lastK,1.2,64,'#ffffff',0,y-1.6,0,Object.assign({inv:1,cap:false},o));A.ribbon=fs}
   const k0=lastK,k1=k0+.048;xgPrism(G,a*k0,a*k0,.8,64,r<12?'#5a6270':'#4a5260',0,y-.8,0,Object.assign({inv:1,cap:false},o));xgRing(G,a*k0,a*k1,y,64,r%2?(r<12?'#3a62a8':'#a83a4a'):(r<12?'#3058a0':'#983444'),0,0,o);
   const n=Math.floor(Math.PI*2*a*(k0+k1)/2/.95);for(let i=0;i<n;i++){const t=i/n*Math.PI*2,px=Math.cos(t)*a*(k0+k1)/2,pz=Math.sin(t)*b*(k0+k1)/2;if(pz<-b*.45&&Math.abs(px)<a*.75)continue;spots.push({x:px,y,z:pz,r:Math.atan2(-px,-pz),st:1})}
   y+=.8;lastK=k1}
  A.top=y;xgPrism(G,a*lastK,a*lastK,8,64,'#c8ccd2',0,y-.8,0,Object.assign({inv:1,cap:false},o));
  const roof=D.mkG();xgRing(roof,a*(lastK-.42),a*(lastK+.02),y+9,64,'#e8ecf0',0,0,o);for(let i=0;i<32;i++){const t=i/32*Math.PI*2;xgBox(G,.5,9,.5,'#b8bcc4',Math.cos(t)*a*lastK,y+4,Math.sin(t)*b*lastK)}
  for(let i=0;i<24;i++){const t=i/24*Math.PI*2;xgBox(Gw,2.2,.6,.6,'#fff8e0',Math.cos(t)*a*(lastK-.4),y+8.6,Math.sin(t)*b*(lastK-.4),-t)}
  A.roof=roof;
  /* field crowd in front of the stage */
  for(let z=sz0+2.2;z<b*.98;z+=1.0)for(let x=-a;x<a;x+=.95){const jx=x+RR(-.25,.25),jz=z+RR(-.25,.25);if((jx/a)**2+(jz/b)**2>.93)continue;if(Math.abs(jx)<2.6&&jz<6.2)continue;if(Math.hypot(jx,jz-6)<5.2)continue;spots.push({x:jx,y:0,z:jz,r:Math.PI+RR(-.3,.3)+Math.atan2(jx*.3,-(jz+30))*0})}
  A.cat={z0:sz0,z1:1.8,bz:6,br:4.4};D.quadY(Gw,-1.5,sz0,1.5,1.8,1.42,'#1a1a22');xgBox(G,3,1.4,1.8-sz0,'#1a1a1e',0,.7,(sz0+1.8)/2);xgPrism(G,4.4,4.4,1.4,24,'#1a1a1e',0,0,6);xgRing(Gw,3.9,4.3,1.42,24,s.neon,0,6);
  A.screenS=[];}
 else{/* club: a room with a low stage, bar at the back, truss */
  A.stage={x:0,z:-9,w:12,d:5,h:1.1};const w=34,dd=24;D.quadY(G,-w/2,-12,w/2,dd-12,0,'#1a1820');xgBox(G,w,9,.4,'#141218',0,4.5,-12.2);xgBox(G,.4,9,dd,'#18161c',-w/2-.2,4.5,0);xgBox(G,.4,9,dd,'#18161c',w/2+.2,4.5,0);xgBox(G,w,9,.4,'#141218',0,4.5,dd-12+.2);
  xgBox(G,14,1.1,1.2,'#5a3a2a',0,.55,dd-14);xgBox(G,14,2.2,.3,'#2a1a14',0,2,dd-12.4);for(let i=0;i<10;i++)xgBox(Gw,.2,.5,.2,pick(['#ffd890','#9ad4ff','#ff8ac0']),-6+i*1.3,2,dd-12.6);
  for(let i=0;i<6;i++){const px=-w/2+.25,pz=-8+i*4;const up=C.A?null:null}
  for(let z=-5.6;z<dd-15.5;z+=.85)for(let x=-w/2+1;x<w/2-1;x+=.8)spots.push({x:x+RR(-.2,.2),y:0,z:z+RR(-.2,.2),r:Math.PI+RR(-.4,.4)});
  A.top=9}
 /* the stage: deck, back screen, side screens, truss and speakers (same parts for both, scaled) */
 const T=A.stage,sx=T.x,szc=T.z,sw=T.w,sd=T.d,sh=T.h,zf=szc+sd/2,zb=szc-sd/2,H=k=='venue'?20:6.5;T.zf=zf;T.zb=zb;
 xgBox(G,sw,sh,sd,'#15151a',sx,sh/2,szc);D.quadY(G,sx-sw/2,zb,sx+sw/2,zf,sh+.01,'#24242c');xgBox(Gw,sw,.08,.1,s.neon,sx,sh-.05,zf+.02);
 for(const ox of[-1,1]){xgBox(G,.5,H,.5,'#3a3a40',sx+ox*sw/2,H/2,zb+.3);xgBox(G,.5,H,.5,'#3a3a40',sx+ox*sw/2,H/2,zf-.3);xgBox(G,k=='venue'?3:1.4,k=='venue'?6:2.4,k=='venue'?2:1,'#1a1a1e',sx+ox*(sw/2+(k=='venue'?2.4:1)),H*.62,zf-1)}
 xgBox(G,sw+1,.5,.5,'#3a3a40',sx,H,zb+.3);xgBox(G,sw+1,.5,.5,'#3a3a40',sx,H,zf-.3);xgBox(G,.5,.5,sd,'#3a3a40',sx-sw/2,H,szc);xgBox(G,.5,.5,sd,'#3a3a40',sx+sw/2,H,szc);
 if(k=='venue'){xgBox(G,sw+16,H+6,1.5,'#101014',sx,(H+6)/2,zb-1);}
 A.scrTex=screenTex(1024,384);const scrW=k=='venue'?sw*.92:sw*.8,scrH=scrW*.375;const scr=D.own(new THREE.Mesh(new THREE.PlaneGeometry(scrW,scrH),new THREE.MeshBasicMaterial({map:A.scrTex})));scr.material.userData={dsOwn:1};scr.position.set(sx,sh+1+scrH/2,zb+.1);A.g.add(scr);
 A.sideTex=screenTex(512,288);if(k=='venue')[-1,1].forEach(ox=>{const m=D.own(new THREE.Mesh(new THREE.PlaneGeometry(11,6.2),new THREE.MeshBasicMaterial({map:A.sideTex})));m.material.userData={dsOwn:1};m.position.set(sx+ox*(sw/2+9),H-1,zb+.2);m.rotation.y=-ox*.25;A.g.add(m);xgBox(G,11.6,6.8,.4,'#111',sx+ox*(sw/2+9),H-1,zb-.1)});
 /* drum riser and band */
 xgBox(G,k=='venue'?6:3,k=='venue'?.8:.4,k=='venue'?4:2,'#2a2a30',sx,sh+(k=='venue'?.4:.2),zb+(k=='venue'?2.6:1.3));
 const kit=new THREE.Group();B(kit,.9,.6,.9,'#c0392b',0,.3,0);B(kit,.5,.35,.5,'#e8e8ec',-.7,.6,.3);B(kit,.5,.35,.5,'#e8e8ec',.7,.6,.3);B(kit,.7,.04,.7,'#e6b422',-1,1.2,-.2);B(kit,.7,.04,.7,'#e6b422',1,1.2,-.2);kit.position.set(OX+AX+sx,sh+(k=='venue'?.8:.4),OZ+AZ+zb+(k=='venue'?3.2:1.6));scene.add(kit);A.fx.push(kit);
 const bandPos=k=='venue'?[[sx,zb+2.2,'drum'],[sx-sw*.3,zb+3.4,'gtr'],[sx+sw*.3,zb+3.4,'bass'],[sx-sw*.42,zb+1.6,'keys']]:[[sx,zb+1,'drum'],[sx-sw*.32,zb+2,'gtr'],[sx+sw*.32,zb+2,'bass']];
 bandPos.forEach(([bx2,bz,role])=>{let o;try{o=buildChar(fCfg())}catch(e){return}o.g.position.set(OX+AX+bx2,sh+(role=='drum'?(k=='venue'?.8:.4):0),OZ+AZ+bz);scene.add(o.g);A.fx.push(o.g);
  if(role=='gtr'||role=='bass'){const g=new THREE.Group();B(g,.12,.9,.35,role=='gtr'?'#d8462b':'#2a2a2a',0,0,0);B(g,.08,.08,.9,'#6a4a2a',0,.1,.55);g.position.set(0,.85,.32);g.rotation.x=.3;o.g.add(g)}if(role=='keys'){const kb=new THREE.Group();B(kb,1.4,.1,.5,'#1a1a1a',0,1,.5);B(kb,.08,1,.08,'#888',-.5,.5,.5);B(kb,.08,1,.08,'#888',.5,.5,.5);o.g.add(kb)}
  A.band.push({o,role})});
 /* beams, lasers, pyro, spot */
 A.beams=[];const nb=k=='venue'?10:6;for(let i=0;i<nb;i++){const g=new THREE.CylinderGeometry(.12,k=='venue'?3.6:1.6,k=='venue'?60:16,10,1,true);g.translate(0,k=='venue'?-30:-8,0);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:['#ff4a9a','#6ad5ff','#ffe066','#b07aff','#2fe68a'][i%5],transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  m.position.set(sx-sw/2+(i+.5)*sw/nb,H-.4,szc);m.userData.ph=i*1.3;D.own(m);m.material.userData={dsOwn:1};A.g.add(m);A.beams.push(m)}
 A.lasers=[];for(let i=0;i<(k=='venue'?14:6);i++){const L=k=='venue'?90:28,g=new THREE.BoxGeometry(.06,.06,L);g.translate(0,0,L/2);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i%2?'#3dff7a':s.neon,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  m.position.set(sx+(i-(k=='venue'?6.5:2.5))*(k=='venue'?2:1.6),sh+.5,zf);D.own(m);m.material.userData={dsOwn:1};m.userData.ph=i;A.g.add(m);A.lasers.push(m)}
 A.pyro=[];for(let i=0;i<(k=='venue'?8:4);i++){const g=new THREE.ConeGeometry(.6,1,10,1,true);g.translate(0,.5,0);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:i%2?'#ffb02a':'#ff5a1a',transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  m.position.set(sx-sw/2+.8+i*(sw-1.6)/((k=='venue'?8:4)-1),sh,zf-.4);m.scale.set(1,.01,1);m.visible=false;D.own(m);m.material.userData={dsOwn:1};A.g.add(m);A.pyro.push({m,t:0})}
 /* fireworks and confetti: points re-used for every burst */
 const fwN=900,fp=new Float32Array(fwN*3),fc=new Float32Array(fwN*3);const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fp,3));fg.setAttribute('color',new THREE.BufferAttribute(fc,3));fg.userData.dsOwn=1;
 A.fw={pts:new THREE.Points(fg,new THREE.PointsMaterial({size:k=='venue'?.9:.3,vertexColors:true,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})),v:new Float32Array(fwN*3),life:new Float32Array(fwN),n:fwN,next:0};A.fw.pts.frustumCulled=false;A.fw.pts.material.userData={dsOwn:1};A.fw.pts.userData.dsOwn=1;A.g.add(A.fw.pts);for(let i=0;i<fwN;i++)fp[i*3+1]=-999;
 const cfN=k=='venue'?1400:400,cp=new Float32Array(cfN*3),cc=new Float32Array(cfN*3),col=new THREE.Color();for(let i=0;i<cfN;i++){cp[i*3+1]=-999;col.set(pick(['#ff4a9a','#ffe066','#6ad5ff','#2fe68a','#ffffff',s.acc]));cc[i*3]=col.r;cc[i*3+1]=col.g;cc[i*3+2]=col.b}
 const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.BufferAttribute(cp,3));cg.setAttribute('color',new THREE.BufferAttribute(cc,3));cg.userData.dsOwn=1;A.cf={pts:new THREE.Points(cg,new THREE.PointsMaterial({size:k=='venue'?.35:.18,vertexColors:true,transparent:true,depthWrite:false})),n:cfN,on:0,v:new Float32Array(cfN*2)};A.cf.pts.frustumCulled=false;A.cf.pts.material.userData={dsOwn:1};A.cf.pts.userData.dsOwn=1;A.g.add(A.cf.pts);
 /* spotlight from the mixing tower onto you */
 {const L=k=='venue'?60:18,g=new THREE.CylinderGeometry(.6,k=='venue'?2.2:1.1,L,12,1,true);g.translate(0,-L/2,0);g.rotateX(-Math.PI/2);A.spot=D.own(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:'#fff4d8',transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})));A.spot.material.userData={dsOwn:1};A.spot.position.set(0,k=='venue'?26:7,k=='venue'?30:12);A.g.add(A.spot)}
 if(k=='venue'){xgBox(G,6,8,6,'#2a2a30',0,4,30);xgBox(G,7,.4,7,'#3a3a40',0,8.2,30);spots.forEach((p,i)=>{if(Math.abs(p.x)<4&&Math.abs(p.z-30)<4)p.skip=1})}
 /* fill the seats and the floor as far as tickets sold */
 const field=spots.filter(p=>!p.st&&!p.skip),stands=spots.filter(p=>p.st&&!p.skip);const sh2=a=>{for(let i=a.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};
 const ff=Math.min(1,fill*1.35),sf=Math.max(0,Math.min(1,(fill-.12)/.88));field.sort((p,q)=>p.z-q.z);const fcnt=Math.round(field.length*ff),take=field.slice(0,fcnt);const st2=sh2(stands).slice(0,Math.round(stands.length*sf));
 A.fans=take.concat(st2);crowdBuild(A,A.fans);A.cap=spots.length;
 const body=new THREE.MeshLambertMaterial({vertexColors:true});body.userData={dsOwn:1};D.flushTo(G,A.g,body);D.flushTo(Gw,A.g,C.glowM);
 if(A.roof){const rm=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});rm.userData={dsOwn:1};D.flushTo(A.roof,A.g,rm)}
 if(A.ribbon){A.ribM=new THREE.MeshBasicMaterial({vertexColors:true,color:s.neon});A.ribM.userData={dsOwn:1};D.flushTo(A.ribbon,A.g,A.ribM)}
 A.sky=D.sky();scene.add(A.sky.sky);return A}
function arenaKill(A){if(!A)return;scene.remove(A.g);const kill=o=>o.traverse(m=>{if(m.geometry&&m.geometry.userData&&m.geometry.userData.dsOwn)m.geometry.dispose();const mt=m.material;if(mt&&mt.userData&&mt.userData.dsOwn)mt.dispose()});kill(A.g);
 A.fx.forEach(o=>scene.remove(o));A.band.forEach(b=>scene.remove(b.o.g));A.dancers.forEach(b=>scene.remove(b.o.g));if(A.ft)scene.remove(A.ft.g);[A.scrTex,A.sideTex].forEach(t=>t&&t.dispose());scene.remove(A.sky.sky);A.sky.sky.geometry.dispose();A.sky.sky.material.dispose()}

/* ---------- the show ---------- */
function startShow(C,k){k=kOf(k);const why=canStart(C,k);if(why){snd('err');return say(why)}const p=prepOf(C,k),list=p.songs.map(id=>S.songs.find(x=>x.id===id)).filter(Boolean);
 if(list.length<3){snd('err');return say('Put at least 3 songs on the setlist first.')}
 let cost=0;PROD[k].forEach(([id,,c])=>{if(p.prod[id])cost+=c});if(cost>S.money){snd('err');return say('The production costs '+$$(cost)+'. Turn some of it off or earn more first.')}
 S.money=+(S.money-cost).toFixed(2);S.energy-=25;closeUI();
 const est=typeof wtPay=='function'?wtPay(C.id,k,.7):{fill:.7,att:Math.round(vOf(C.d,k).cap*.7)};
 D.fade(()=>{const A=arena(C,k,est.fill||.7);const enc=list.length>=4;SH={C,k,A,list,enc,main:enc?list.length-1:list.length,i:-1,st:'intro',t:0,stT:0,sm:0,dur:0,song:null,
  mg:null,last:'',sc:[],ss:[],C0:100,T:100,hype:.5+Math.min(.12,(p.reh||0)*.06)*(p.rd===S.day?1:0),next:R(5,8),beat:0,bt:0,songT:0,st0:{},end:0,
  prod:Object.assign({},p.prod),reh:p.rd===S.day?p.reh:0,cost,est,done:[],hyp:[],shot:'wide',shotT:0,talkN:0,inter:0,cat:0,catT:0,m0:mins(),fin:0,shout:null,att:est.att,st:{}};
  SH.state='intro';SH.st={};mode='dshow';document.body.classList.add('dsshow');P.x=OX+AX+A.stage.x;P.z=OZ+AZ+A.stage.zf-2.2;P.rot=0;
  SH.fog={c:scene.fog.color.clone(),n:scene.fog.near,f:scene.fog.far};SH.cam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,1400);D.view={cam:SH.cam,show:1};
  shout(k=='venue'?(S.artist||'YOU').toUpperCase()+'! '+(S.artist||'YOU').toUpperCase()+'!':'LET\'S GO!',3);try{nz(3,900,.18,.5,'bandpass')}catch(e){}},()=>{},400)}
function shout(t,dur){let e=$('dsshout');if(!e){e=document.createElement('div');e.id='dsshout';document.body.appendChild(e)}e.textContent=t;e.style.opacity=1;e.style.transform='translate(-50%,-50%) scale(1)';clearTimeout(e._t);e._t=setTimeout(()=>{e.style.opacity=0;e.style.transform='translate(-50%,-50%) scale(.9)'},(dur||2)*1000)}
const STATES={intro:6};
function showTick(dt){const H=SH;if(!H||H.end)return;const A=H.A,k=H.k,T=A.stage;H.t+=dt;H.stT+=dt;CU.uT.value+=dt;
 const speed=(S.t<300?2.8:2)*(typeof DAYK!='undefined'?DAYK:1);if(H.state!='intro'&&H.state!='encq'&&H.state!='talk'&&S.t<599)S.t=Math.min(599,S.t+dt*(typeof DAYK!='undefined'?DAYK:1));
 const curfew=mins()>=1790||S.t>=598.5;
 if(H.state=='intro'){if(H.stT>STATES.intro){boom(1);nextSong()}}
 else if(H.state=='song'){H.sm=mins()-H.ms0;if(H.mg)W2(festMgTick,dt);else if(H.t>=H.next&&H.dur-H.sm>14)W2(festMgStart);
  if(H.sm>=H.dur||curfew){songDone(curfew&&H.sm<H.dur?Math.min(1,H.sm/H.dur):1);if(curfew){H.fin=2;return finale()}afterSong()}}
 else if(H.state=='talk'){if(H.stT>7)talkPick(-1)}
 else if(H.state=='inter'){H.sm=mins()-H.ms0;if(H.sm>=25||curfew){H.state='song0';CU.uWave.value=0;if(curfew){H.fin=2;return finale()}nextSong()}}
 else if(H.state=='encq'){if(H.stT>10)encore(1)}
 else if(H.state=='finale'){if(H.stT>7)showEnd(0)}
 /* hype drifts back towards how well prepared you are */
 const base=.42+.06*H.reh+(H.prod.pyro?.04:0)+(H.prod.dancers?.03:0)+(H.prod.lasers?.03:0)+(H.prod.smoke?.02:0);if(!H.mg)H.hype+=(base-H.hype)*dt*.02;H.hype=Math.max(.1,Math.min(1,H.hype));
 if(H.state=='song')H.hyp.push(H.hype);
 CU.uHype.value+=((H.state=='song'?H.hype:H.state=='intro'||H.state=='encq'?.85:.35)-CU.uHype.value)*Math.min(1,dt*2);CU.uAmp.value=.12+.22*CU.uHype.value;CU.uRate.value=Math.PI*2*(H.bpm||126)/60/2;
 if(H.state=='song'&&H.song)W2(festMusic,H,dt);
 if(H.end)return;showFx(dt);showCam(dt);showHud();if(H.mg)mgDraw();else{const e=$('fsg');if(e)e.remove()}}
function nextSong(){const H=SH;H.i++;if(H.i>=H.main&&!(H.encoring)){if(H.enc&&!H.encDone){H.state='encq';H.stT=0;shout('ONE MORE SONG! ONE MORE SONG!',6);talkUI('encore');lightsDown();return}return finale()}
 if(H.i>=H.list.length)return finale();
 const s=H.list[H.i];H.song=s;H.state='song';H.stT=0;H.ms0=mins();H.sm=0;H.dur=songDur(s,H.k);H.ss=[];H.songT=0;H._bs=null;H._bt=0;H.next=H.t+R(4,7);
 try{const p=Beats.play(s,{owner:H,form:'live',pads:1,fadeIn:.3,alive:()=>SH===H&&!H.end&&H.state=='song'&&H.song===s});H._bs=s;H.bpm=p&&p.bpm||126}catch(e){H.bpm=126}
 /* featured artist comes on for a collab */
 const A=H.A;if(A.ft){scene.remove(A.ft.g);A.ft=null}if(s.ft){const a=ART.find(q=>q[0]==s.ft);try{const o=buildChar(Object.assign({},a?a[4]:fCfg()));o.g.position.set(OX+AX+A.stage.x+1.4,A.stage.h,OZ+AZ+A.stage.zf-2.2);scene.add(o.g);A.ft=o}catch(e){}}
 H.cat=H.k=='venue'&&H.i%3==2?1:0;H.catT=0;H.lights=(S.t>330&&H.i%4==3)||(H.i==Math.floor(H.main/2)-1);
 if(H.i>0){boom(.6);shout(pick(['"'+s.title+'"!!','TUUUNE!','I LOVE THIS ONE!',(S.artist||'YOU').toUpperCase()+'!']),2)}screenDraw(1)}
function songDone(fr){const H=SH,s=H.song;if(!s)return;const avg=H.ss.length?H.ss.reduce((a,b)=>a+b,0)/H.ss.length:.55;H.done.push({t:s.title,f:fr,sc:Math.round(avg*100),id:s.id});try{nz(2.4,1000,.16,.5,'bandpass');setTimeout(()=>nz(1.8,1500,.1,.6,'bandpass'),300)}catch(e){}
 try{const c=Beats.current();if(c&&c.owner===H)Beats.stop(1.2)}catch(e){}if(H.prod.pyro&&fr>=1)fireworks(H.k=='venue'?3:1)}
function afterSong(){const H=SH;H.state='gap';const n=H.i+1;
 if(H.k=='venue'&&!H.inter&&H.main>=8&&n==Math.floor(H.main/2)){H.inter=1;H.state='inter';H.stT=0;H.ms0=mins();CU.uWave.value=1;shout('INTERMISSION · COSTUME CHANGE',4);lightsDown();screenDraw(1);return}
 if(n<H.main&&(n==1||n%3==0)){H.talkN++;H.state='talk';H.stT=0;talkUI(n==1?'greet':'talk');return}
 nextSong()}
function encore(play){const H=SH;const e=$('dstalk');if(e)e.remove();H.encDone=1;if(play){H.encoring=1;H.state='song0';H.i=H.main-1;shout('ENCORE!',2);boom(1);if(H.prod.confetti)confetti();nextSong()}else finale()}
D.showEncore=encore;
const TALK={greet:L=>[['Greet the city in '+({ja:'Japanese',ko:'Korean',zh:'Chinese',hi:'Hindi',th:'Thai',ar:'Arabic',fr:'French',de:'German',es:'Spanish',pt:'Portuguese',it:'Italian',nl:'Dutch',sv:'Swedish',sw:'Swahili',id:'Indonesian'}[L]||'English')+': "'+D.words(L).hi+', '+(SH.C.d.city||SH.C.d.country)+'!"',.16],['"Make some noise!"',.08],['Say nothing, start the next song',0]],
 talk:L=>[['Get everyone singing the chorus',.1],['Dedicate the next song to the fans',.08],['"'+D.words(L).ty+'! We love you!"',.12],['Introduce the band',.06]]};
function talkUI(kind){const H=SH;let e=$('dstalk');if(e)e.remove();e=document.createElement('div');e.id='dstalk';e.className='box';document.body.appendChild(e);
 if(kind=='encore'){e.innerHTML=`<b class=px>The crowd wants more!</b><div class=m style="font-size:12px;margin:4px 0">They are chanting for one more song. Play "${esc(H.list[H.list.length-1].title)}" as your encore?</div><div class=row2><button class=go onclick="DCITY.showEncore(1)">1. Play the encore</button><button onclick="DCITY.showEncore(0)">2. End the show</button></div><div class=bar style="width:100%;height:6px"><i id=dstt></i></div>`;H.talk={kind,opts:[1,0]};return}
 const all=TALK[kind](H.C.s.lang),opts=kind=='greet'?all:all.sort(()=>Math.random()-.5).slice(0,3);H.talk={kind,opts};
 e.innerHTML=`<b class=px>Talk to the crowd</b><div class=m style="font-size:12px;margin:4px 0">Pick one with 1-3 or tap</div><div class=dsto>${opts.map((o,i)=>`<button onclick="DCITY.showTalk(${i})">${i+1}. ${esc(o[0])}</button>`).join('')}</div><div class=bar style="width:100%;height:6px"><i id=dstt></i></div>`}
function talkPick(i){const H=SH;if(!H||H.state!='talk')return;const e=$('dstalk');if(e)e.remove();const o=i>=0?H.talk.opts[i]:null;
 if(o){H.hype=Math.min(1,H.hype+o[1]);if(o[1]>=.12){shout(pick(['AAAAAH!','WE LOVE YOU!','♥ ♥ ♥']),2);try{nz(2,1100,.18,.5,'bandpass')}catch(e){}}else if(o[1]>0)shout('WOOO!',1.5)}
 S.t=Math.min(599,S.t+8/((S.t<300?2.8:2)));nextSong()}
D.showTalk=talkPick;
function lightsDown(){const H=SH;H.dark=1.5}
function boom(big){const H=SH;if(!H)return;try{sfx(55,.5,'sine',.4*big,30,0,0);nz(.6,300,.25*big,.6,'lowpass')}catch(e){}if(H.prod.pyro||H.k=='club'&&big>=1)H.A.pyro.forEach((p,i)=>{p.t=.9+i*.04})}
function fireworks(n){const H=SH;if(!H)return;const A=H.A,F=A.fw,P0=F.pts.geometry.attributes.position,C0=F.pts.geometry.attributes.color,c=new THREE.Color();
 for(let b=0;b<n;b++){const cx=R(-40,40)*(H.k=='venue'?1:.2),cy=H.k=='venue'?R(45,70):R(5,7),cz=R(-30,20)*(H.k=='venue'?1:.2);c.set(pick(['#ff4a9a','#ffe066','#6ad5ff','#2fe68a','#ff7a3a','#ffffff']));
  for(let i=0;i<110;i++){const j=F.next;F.next=(F.next+1)%F.n;const th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),sp=(H.k=='venue'?R(9,14):R(2,3));P0.setXYZ(j,cx,cy,cz);F.v[j*3]=Math.sin(ph)*Math.cos(th)*sp;F.v[j*3+1]=Math.cos(ph)*sp;F.v[j*3+2]=Math.sin(ph)*Math.sin(th)*sp;F.life[j]=R(1.4,2.2);C0.setXYZ(j,c.r,c.g,c.b)}}
 P0.needsUpdate=C0.needsUpdate=true;setTimeout(()=>{try{sfx(70,.4,'sine',.3,35,0,0);nz(.5,600,.2,.5,'lowpass')}catch(e){}},500)}
function confetti(){const H=SH;if(!H)return;const A=H.A,F=A.cf,P0=F.pts.geometry.attributes.position,w=H.k=='venue'?50:14;for(let i=0;i<F.n;i++){P0.setXYZ(i,R(-w,w),R(15,40)*(H.k=='venue'?1:.25),R(-25,40)*(H.k=='venue'?1:.3));F.v[i*2]=R(-.4,.4);F.v[i*2+1]=R(1.2,2.4)}P0.needsUpdate=true;F.on=1}
function finale(){const H=SH;if(H.state=='finale')return;H.state='finale';H.stT=0;try{const c=Beats.current();if(c&&c.owner===H)Beats.stop(1.5)}catch(e){}const e=$('dstalk');if(e)e.remove();
 shout(H.fin==2?'CURFEW! THANK YOU '+(SH.C.d.city||SH.C.d.country).toUpperCase()+'!':D.words(H.C.s.lang).ty.toUpperCase()+' '+(H.C.d.city||H.C.d.country).toUpperCase()+'!',5);boom(1);if(H.prod.pyro)fireworks(H.k=='venue'?6:2);if(H.prod.confetti)confetti();screenDraw(1)}
/* effects every frame */
function showFx(dt){const H=SH,A=H.A,t=H.t,T=A.stage,k=H.k,hy=H.hype;
 A.sky.sky.position.copy(H.cam.position);if(!A.skyF||Math.abs(A.skyF-S.t)>3){A.skyF=S.t;const hz=D.skyCol(A.sky.sky,H.C.s);scene.fog.color.copy(hz)}scene.fog.near=k=='venue'?160:60;scene.fog.far=k=='venue'?900:200;
 const on=H.state=='song'||H.state=='intro'||H.state=='finale';H.dark=Math.max(0,(H.dark||0)-dt);
 amb.intensity=k=='club'?.42:(S.t>300?.55:.75);amb.color.set(H.state=='inter'?'#8a7ab8':'#d8c8ff');
 A.beams.forEach((m,i)=>{const p=m.userData.ph;m.rotation.set(-.9+Math.sin(t*.7+p)*.5,0,Math.sin(t*.9+p)*.7);m.material.opacity=on?(.04+.1*hy)*(.6+.4*Math.sin(t*2+p)):.02});
 const las=(H.prod.lasers||k=='club'&&H.prod.lasers)&&H.state=='song'&&(H.mg&&H.mg.sc>=.75||Math.sin(t*.4)>.55);A.lasers.forEach((m,i)=>{m.material.opacity+=((las?.55:0)-m.material.opacity)*Math.min(1,dt*6);m.rotation.set(-.08-Math.abs(Math.sin(t*.8+i))*.15,(i-A.lasers.length/2)*.09+Math.sin(t*1.3+i*.4)*.25,0)});
 A.pyro.forEach(p=>{if(p.t>0){p.t-=dt;const s=Math.max(0,Math.sin(Math.min(1,p.t/.9)*Math.PI))*(k=='venue'?7:2.5);p.m.visible=s>.05;p.m.scale.set(1+s*.08,s,1+s*.08)}else p.m.visible=false});
 const F=A.fw,P0=F.pts.geometry.attributes.position;let any=0;for(let i=0;i<F.n;i++){if(F.life[i]<=0)continue;any=1;F.life[i]-=dt;F.v[i*3+1]-=6*dt;P0.setXYZ(i,P0.getX(i)+F.v[i*3]*dt,P0.getY(i)+F.v[i*3+1]*dt,P0.getZ(i)+F.v[i*3+2]*dt);if(F.life[i]<=0)P0.setY(i,-999)}if(any)P0.needsUpdate=true;
 if(A.cf.on){const Cf=A.cf,Q=Cf.pts.geometry.attributes.position;let live=0;for(let i=0;i<Cf.n;i++){let y=Q.getY(i);if(y<-50)continue;y-=Cf.v[i*2+1]*dt;if(y<.1)y=-999;else live=1;Q.setXYZ(i,Q.getX(i)+Math.sin(t*2+i)*.4*dt+Cf.v[i*2]*dt,y,Q.getZ(i))}Q.needsUpdate=true;if(!live)Cf.on=0}
 if(A.phones)A.phones.material.opacity+=(((H.lights&&H.state=='song')||H.state=='encq'?.95:0)-A.phones.material.opacity)*Math.min(1,dt*2);
 if(A.ribM){const c=new THREE.Color(H.C.s.neon).lerp(new THREE.Color(H.C.s.acc),.5+.5*Math.sin(t*3));A.ribM.color.copy(c).multiplyScalar(on?.7+.3*Math.abs(Math.sin(t*Math.PI*(H.bpm||126)/60)):.3)}
 /* you on stage: sing, jump, walk the catwalk */
 let px=T.x,pz=T.zf-2.2;if(H.cat&&H.state=='song'&&A.cat){H.catT+=dt;const u=Math.min(1,Math.max(0,H.sm/H.dur));const w=u<.25?u/.25:u<.7?1:Math.max(0,1-(u-.7)/.2);pz=T.zf-2.2+(A.cat.bz-(T.zf-2.2))*(w*w*(3-2*w))}
 P.x=OX+AX+px;P.z=OZ+AZ+pz;const hide=H.state=='inter';if(P.mesh){P.mesh.visible=!hide;const bb=Math.max(0,Math.sin(t*(H.bpm||126)/60*Math.PI))*.06;const y=(H.cat&&pz>T.zf?1.42:T.h)+bb;P.mesh.position.set(P.x,y,P.z);P.mesh.rotation.y=Math.sin(t*.9)*.25;
  P.arms[1].rotation.x=-2.2+Math.sin(t*4)*.12;P.arms[0].rotation.x=hy>.7&&Math.sin(t*.7)>.2?-2.9:-.3+Math.sin(t*2.1*Math.PI)*.3;P.legs[0].rotation.x=Math.sin(t*2.1*Math.PI)*.12;P.legs[1].rotation.x=-P.legs[0].rotation.x}
 if(A.ft){const o=A.ft;o.g.rotation.y=Math.sin(t*.8+1)*.2;o.arms[0].rotation.x=-2.2+Math.sin(t*4+1)*.12;o.arms[1].rotation.x=hy>.6?-2.9:-.4}
 A.band.forEach((b,i)=>{const a=b.o.arms,s=t*(b.role=='drum'?9:4)+i;if(b.role=='drum'){a[0].rotation.x=-1+Math.sin(s)*.6;a[1].rotation.x=-1-Math.sin(s)*.6}else if(b.role=='keys'){a[0].rotation.x=a[1].rotation.x=-1.2+Math.sin(s*2)*.1}else{a[0].rotation.x=-1.1;a[1].rotation.x=-.8+Math.sin(s*2)*.4;b.o.g.rotation.y=Math.sin(t*.6+i)*.3}});
 if(A.spot){const dx=px-A.spot.position.x,dy=(T.h+1)-A.spot.position.y,dz=pz-A.spot.position.z;A.spot.rotation.set(0,0,0);A.spot.lookAt(A.g.position.x+px,T.h+1,A.g.position.z+pz);A.spot.material.opacity=hide?0:.07+.05*hy}
 if(FOL&&typeof FOL!='undefined')try{FOL.forEach(f=>{if(f.m)f.m.visible=false})}catch(e){}
 if((A.scT=(A.scT||0)+dt)>.12){A.scT=0;screenDraw()}}
/* the big screen and the side screens */
function screenDraw(force){const H=SH,A=H.A,x=A.scrTex.userData.x,W=1024,Hh=384,t=H.t,s=H.C.s,nm=(S.artist||'YOU').toUpperCase();
 const g=x.createLinearGradient(0,0,W,Hh);const hue=(t*30)%360;g.addColorStop(0,'hsl('+hue+',80%,'+(18+H.hype*20)+'%)');g.addColorStop(1,'hsl('+((hue+80)%360)+',80%,12%)');x.fillStyle=g;x.fillRect(0,0,W,Hh);
 x.globalAlpha=.25;for(let i=0;i<12;i++){x.fillStyle=i%2?s.neon:'#ffffff';const r=(t*60+i*80)%600;x.beginPath();x.arc(W/2,Hh/2,r,0,7);x.lineWidth=6;x.strokeStyle=x.fillStyle;x.stroke()}x.globalAlpha=1;
 x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.shadowColor=s.neon;x.shadowBlur=24;let big=nm,sub='';
 if(H.state=='intro'){const c=Math.max(1,Math.ceil(STATES.intro-H.stT));big=String(c);sub=nm+' · LIVE IN '+(H.C.d.city||H.C.d.country).toUpperCase()}
 else if(H.state=='song'&&H.song){big=H.song.title.toUpperCase();sub=nm+(H.song.ft?' FEAT. '+H.song.ft.toUpperCase():'')}else if(H.state=='inter'){big='INTERMISSION';sub='BACK IN '+Math.max(1,Math.ceil(25-(H.sm||0)))+' MIN'}
 else if(H.state=='encq'){big='ONE MORE SONG!';sub=nm}else if(H.state=='finale'){big=D.words(s.lang).ty.toUpperCase()+'!';sub=(H.C.d.city||H.C.d.country).toUpperCase()}else{big=nm;sub=(vOf(H.C.d,H.k)||{n:''}).n.toUpperCase()}
 D.fitF(x,big,150,W-80);x.fillText(big,W/2,Hh*.44);x.shadowBlur=0;D.fitF(x,sub,44,W-80,false);x.fillStyle='#ffffffdd';x.fillText(sub,W/2,Hh*.8);A.scrTex.needsUpdate=true;
 const y=A.sideTex.userData.x,w2=512,h2=288;y.fillStyle='#08080c';y.fillRect(0,0,w2,h2);y.fillStyle=s.acc;for(let i=0;i<24;i++){const hh=(.2+.8*Math.abs(Math.sin(t*3+i*.7)))*h2*.5*H.hype;y.fillRect(10+i*20.5,h2-20-hh,14,hh)}
 y.fillStyle='#fff';y.textAlign='center';D.fitF(y,nm,54,w2-30);y.fillText(nm,w2/2,70);D.fitF(y,(H.C.d.city||H.C.d.country).toUpperCase()+' · '+clk(),24,w2-30,false);y.fillText((H.C.d.city||H.C.d.country).toUpperCase()+' · '+clk(),w2/2,116);A.sideTex.needsUpdate=true}
/* camera: concert-film cuts between shots */
const SHOTS={venue:['back','wide','front','side','orbit','crowd','cat'],club:['back','front','wide','side']};
function showCam(dt){const H=SH,c=H.cam,A=H.A,T=A.stage,t=H.t,k=H.k,ax=OX+AX,az=OZ+AZ,px=P.x-ax,pz=P.z-az;H.shotT-=dt;
 if(H.shotT<=0){const L=SHOTS[k].filter(s=>s!=H.shot&&(s!='cat'||H.cat));H.shot=H.state=='intro'?(H.stT<3?'orbit':'wide'):H.mg?pick(['back','back','front','wide']):pick(L);H.shotT=H.state=='intro'?3:R(5,9)}
 const v=new THREE.Vector3(),L2=new THREE.Vector3(),s=H.shot,sw=Math.sin(t*.37)*.4;
 if(s=='back'){v.set(px+sw,T.h+2.8,pz-(k=='venue'?6.5:3.2));L2.set(px+sw*.4,T.h+.4,pz+30)}
 else if(s=='wide'){v.set(Math.sin(t*.05)*8,k=='venue'?32:5.5,k=='venue'?52:11);L2.set(0,k=='venue'?8:2,T.z)}
 else if(s=='front'){v.set(px+2.6+sw,T.h+1.3,pz+(k=='venue'?8:4.5));L2.set(px,T.h+1.5,pz)}
 else if(s=='side'){v.set(T.x+(T.w/2+1.5),T.h+3.2,T.zf+1);L2.set(px,T.h+1,pz+6)}
 else if(s=='orbit'){const a=t*.12;v.set(Math.cos(a)*95,70,Math.sin(a)*80);L2.set(0,6,0)}
 else if(s=='crowd'){v.set(-26+Math.sin(t*.2)*4,3.2,22);L2.set(px,T.h+2,pz)}
 else{v.set(px+sw,T.h+2.2,pz-5);L2.set(px,1.6,pz+40)}
 c.position.set(ax+v.x,v.y,az+v.z);c.lookAt(ax+L2.x,L2.y,az+L2.z);c.aspect=innerWidth/innerHeight;c.fov=s=='wide'||s=='orbit'?50:58;c.updateProjectionMatrix()}
function showHud(){const H=SH;let a=$('dsst'),b=$('dscr');if(!a){a=document.createElement('div');a.id='dsst';a.className='hb';document.body.appendChild(a);b=document.createElement('div');b.id='dscr';b.className='hb';document.body.appendChild(b);
  const e=document.createElement('button');e.id='dsend';e.className='hb';e.textContent='Leave stage (Esc)';e.onclick=()=>showEnd(1);document.body.appendChild(e)}
 const v=vOf(H.C.d,H.k),n=H.list.length,cur=Math.min(n,H.i+1),song=H.song;let line;
 if(H.state=='song'&&song)line=`Now playing ${cur}/${n}${H.encoring?' · encore':''}: <b>"${esc(song.title)}"</b>${song.ft?' feat. '+esc(song.ft):''}<div class=bar><i style="width:${Math.min(100,Math.round(H.sm/H.dur*100))}%"></i></div><small class=m>${Math.max(0,Math.round(H.dur-H.sm))} min left · ${H.list[H.i+1]&&H.i+1<(H.encoring?n:H.main)?'next: "'+esc(H.list[H.i+1].title)+'"':H.enc&&!H.encDone?'then the encore':'last song!'} · ${clk()}</small>`;
 else line=`<small class=m>${H.state=='intro'?'The lights go down…':H.state=='inter'?'Intermission · the crowd is doing a wave':H.state=='talk'?'Talk to the crowd':H.state=='encq'?'Encore?':H.state=='finale'?'Final bow':''} · ${clk()}</small>`;
 const h=`<b class=px style="color:${H.C.s.neon}">${esc(v.n.toUpperCase())} · ${esc((H.C.d.city||H.C.d.country).toUpperCase())}</b><br>${line}`;if(a.dataset.h!=h){a.dataset.h=h;a.innerHTML=h}
 const g=`<small class=m>CROWD</small><b>${H.att.toLocaleString()}</b><small class=m>Energy</small><div class=bar style="height:8px"><i style="width:${Math.round(H.hype*100)}%;background:linear-gradient(90deg,#ff4a9a,#ffe066)"></i></div><small class=m>${Math.round(H.hype*100)}% · ${H.sc.length} crowd moments</small>`;if(b.dataset.h!=g){b.dataset.h=g;b.innerHTML=g}
 const tt=$('dstt');if(tt)tt.style.width=Math.max(0,100-H.stT/(H.state=='encq'?10:7)*100)+'%'}
function mgDraw(){const H=SH,m=H.mg;let el=$('fsg');if(!el){el=document.createElement('div');el.id='fsg';el.className='box';document.body.appendChild(el);el.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-p]');W2(festMgPress,b?+b.dataset.p:-1)})}
 const key=m.k+(m.sc!=null?'done':m.t<0?'intro':'')+(m.k=='lyric'?m.i:'')+(m.k=='call'?m.ph:'');
 if(key!=H.mgK){H.mgK=key;const t=`<b class=px>${FMG[m.k]}</b><div class=m style="font-size:12px;margin-top:3px">${FMG_HOW[m.k]}</div>`;
  if(m.sc!=null){const good=m.sc>=.5;el.innerHTML=`<div class="big ${good?'ok':'no'}">${m.sc>=.9?'Perfect!':m.sc>=.75?'Great!':m.sc>=.5?'Nice':m.sc>=.25?'Shaky…':'Ouch!'}</div><div class="${good?'ok':'no'}"><b>${good?'The crowd goes wild':'The crowd cools off'}</b> · energy ${Math.round(H.hype*100)}%</div>`;
   if(m.sc>=.75&&!m.fxd){m.fxd=1;boom(.8);if(H.prod.pyro&&m.sc>=.9)fireworks(1)}}
  else if(m.t<0)el.innerHTML=t+'<div class=big>Get ready…</div>';
  else if(m.k=='hype')el.innerHTML=t+'<div class=hm><i id=fmv></i></div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>';
  else if(m.k=='drop')el.innerHTML=t+'<div class=tbar><div class=tg id=fmz></div><div class=ti id=fmk></div></div><small class=m id=fmh></small><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>';
  else if(m.k=='call')el.innerHTML=t+`<div class=mgpads>${MG_PADC.map((c,i)=>`<button class=mgp data-p=${i} style="--c:${c}">${i+1}</button>`).join('')}</div><small class=m id=fmh></small>`;
  else if(m.k=='lyric'){const it=m.items[m.i];el.innerHTML=t+`<div class=m style="margin-top:6px">Line ${m.i+1}/${m.items.length}: rhymes with</div><div class="mgw px">"${esc(it.base)}"</div><div class=mgo>${it.opts.map((o,i)=>`<button data-p=${i}>${i+1}. ${esc(o)}</button>`).join('')}</div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>`}
  else el.innerHTML=t+'<div class=tbar><div class=tg id=fmz style="width:22%"></div><div class=ti id=fmk></div></div><div class=bar style="width:100%;height:6px"><i id=fmt></i></div>'}
 if(m.sc!=null||m.t<0)return;const tm=$('fmt');
 if(m.k=='hype'){const v=$('fmv');if(v)v.style.width=Math.min(100,m.lv*100)+'%';if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%'}
 else if(m.k=='drop'){const z=$('fmz'),kk=$('fmk'),h=$('fmh');if(z){z.style.left=m.z0*100+'%';z.style.width=m.zw*100+'%'}if(kk){kk.style.left=m.pos*100+'%';kk.style.background=m.fl>.05?'#2fe68a':m.fl<-.05?'#ff4455':'#fff'}if(h)h.textContent=m.hits+' hit · '+(3-m.tries)+' tries left';if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%'}
 else if(m.k=='call'){el.querySelectorAll('.mgp').forEach((b,i)=>b.classList.toggle('on',m.lit==i));const h=$('fmh');if(h)h.textContent=m.ph=='show'?'Watch and listen…':'Your turn: '+m.i+'/'+m.seq.length}
 else if(m.k=='lyric'){const it=m.items[m.i];if(tm)tm.style.width=Math.max(0,100-m.t/m.lim*100)+'%';el.querySelectorAll('.mgo button').forEach((b,i)=>{b.classList.toggle('ok',m.lt>0&&it.opts[i]==it.right);b.classList.toggle('no',m.lt>0&&i==m.pk&&it.opts[i]!=it.right)})}
 else{const z=$('fmz'),kk=$('fmk');if(z)z.style.left=(m.c-.11)*100+'%';if(kk){kk.style.left=m.lv*100+'%';kk.style.background=Math.abs(m.lv-m.c)<.11?'#2fe68a':'#fff'}if(tm)tm.style.width=Math.max(0,100-m.t/m.dur*100)+'%'}}
/* the end: pay, record, results */
function showEnd(quit){const H=SH;if(!H||H.end)return;if(quit&&H.state=='song'&&H.song){songDone(Math.min(1,H.sm/H.dur))}H.end=1;try{const c=Beats.current();if(c&&c.owner===H)Beats.stop(1)}catch(e){}
 ['fsg','dstalk','dsst','dscr','dsend','dsshout'].forEach(i=>{const e=$(i);if(e)e.remove()});
 const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,mg=H.sc.length?mean(H.sc):.5,hy=H.hyp.length?mean(H.hyp):H.hype,q=mean(H.list.map(s=>Math.min(1,(s.q||50)/100)));
 const full=H.done.filter(d=>d.f>=1).length,frac=Math.min(1,(H.done.reduce((a,d)=>a+d.f,0))/Math.max(1,H.list.length-(H.enc&&!H.encoring?1:0)));
 const score=Math.max(0,Math.min(1,.12+.5*mg+.18*hy+.1*q+.05*Math.min(2,H.reh)+(H.prod.pyro?.03:0)+(H.prod.dancers?.02:0)+(H.prod.lasers?.02:0)+(H.prod.confetti?.01:0)));
 let res=typeof wtPay=='function'?wtPay(H.C.id,H.k,score):{att:H.att,money:Math.round(H.att*3),fol:Math.round(H.att*.1),str:Math.round(H.att*15)};
 const f=quit?Math.max(.15,frac):H.fin==2?Math.max(.5,frac):1;res={att:res.att,money:Math.round(res.money*f),fol:Math.round(res.fol*f),str:Math.round(res.str*f)};
 S.money=+(S.money+res.money).toFixed(2);S.earn=(S.earn||0)+res.money;S.followers=(S.followers||0)+res.fol;S.interest=Math.min(1,(S.interest||0)+.05*score);
 const played=H.done.map(d=>S.songs.find(x=>x.id===d.id)).filter(Boolean);if(played.length){const per=Math.round(res.str/played.length);played.forEach(s=>{try{if(typeof planOf=='function')planOf(s)}catch(e){}s.streams=(s.streams||0)+per;s.today=(s.today||0)+per;S.streams+=per;S.monthStreams=(S.monthStreams||0)+per})}
 try{if(typeof wtShowDone=='function')wtShowDone(H.C.id,H.k,res)}catch(e){console.error('wtShowDone',e)}
 S.dcity.shows=(S.dcity.shows||[]).concat([{c:H.C.id,k:H.k,d:S.day,att:res.att,pay:res.money,sc:Math.round(score*100)}]).slice(-60);
 const v=vOf(H.C.d,H.k);try{(S.igPosts=S.igPosts||[]).push({id:S.nid++,mine:1,u:S.artist,cfg:{...ch},cap:'Played '+v.n+' in '+(H.C.d.city||H.C.d.country)+' to '+res.att.toLocaleString()+' people! '+D.words(H.C.s.lang).ty+' 🏟',day:S.day,l:Math.round(res.att*R(.05,.15))+RI(3,12)})}catch(e){}
 try{updateVersion()}catch(e){}try{chime()}catch(e){}
 const grade=quit?'You left the stage early':score>=.85?'Legendary show 🔥':score>=.68?'Huge night':score>=.5?'Solid show':'Tough crowd';mode='menu';const lis=Math.round(res.str/(S.mlDiv||3.5));
 $('ui').innerHTML=`<div class="box modal"><h2>🏟 ${grade}</h2><p class=m>${esc(v.n)} · ${esc(wtPlace(H.C.d))} · ${full} of ${H.list.length} songs · ${H.sc.length} crowd moments${H.sc.length?', '+Math.round(mg*100)+'% average':''} · score ${Math.round(score*100)}${H.fin==2?' · cut short by the curfew':''}</p>
 <div class=cards><div class=card>Crowd<b>${res.att.toLocaleString()}</b><small>${Math.round(res.att/v.cap*100)}% of ${v.cap.toLocaleString()}</small></div><div class=card>Paid<b>${$$(res.money)}</b><small>${H.cost?'production cost '+$$(H.cost):'no production costs'}</small></div><div class=card>Streams<b>+${res.str.toLocaleString()}</b><small>about +${lis.toLocaleString()} monthly listeners tomorrow</small></div><div class=card>Followers<b>+${res.fol.toLocaleString()}</b></div></div>
 <div style="max-height:20vh;overflow:auto;margin:6px 0">${H.done.map((d,i)=>`<div class=ng><span style="flex:1">${i+1}. "${esc(d.t)}"${d.f<1?' <small class=m>(cut short)</small>':''}</span><small class=m>${d.sc}%</small></div>`).join('')}</div>
 <p class=m>${H.k=='venue'?'This stadium can book you again in a couple of weeks.':'This club can book you again in a couple of weeks.'} One show a day.</p><div class=row2><button class=go onclick="DCITY.showLeave()">${H.k=='venue'?'Leave the stadium':'Leave the club'}</button></div></div>`}
D.showLeave=()=>{const H=SH;if(!H)return closeUI();SH=null;D.fade(()=>{arenaKill(H.A);D.view=null;document.body.classList.remove('dsshow');scene.fog.color.copy(H.fog.c);scene.fog.near=H.fog.n;scene.fog.far=H.fog.f;CU.uWave.value=0;if(P.mesh)P.mesh.visible=true;const e=$('dsshout');if(e)e.remove();
 closeUI();if(H.k=='venue')D.goOut(H.C.st.x,H.C.st.z+H.C.st.b+4.6,0);else if(H.C.spots.club)D.goOut(H.C.spots.club.x,H.C.spots.club.z+1.4,0)},()=>{},300)};
D.showOn=()=>!!SH;D.show=()=>SH;

/* ---------- keys, styles, hint, game hooks ---------- */
addEventListener('keydown',e=>{if(mode!='dshow'||!SH||/INPUT|TEXTAREA/.test(e.target.tagName))return;const k=e.key;e.stopImmediatePropagation();
 if(k=='Escape'){return showEnd(1)}if(e.repeat)return;const n=parseInt(k);
 if(SH.state=='talk'&&n>=1&&n<=3)return talkPick(n-1);if(SH.state=='encq'&&(n==1||n==2))return encore(n==1);
 if(k==' '||k=='Enter'||k.toLowerCase()=='e'){e.preventDefault();W2(festMgPress,-1)}else if(n>=1&&n<=4)W2(festMgPress,n-1)},true);
addEventListener('keyup',e=>{if(mode=='dshow')delete keys[e.key.toLowerCase()]});
{const st=document.createElement('style');st.textContent=`body.dsshow #hud,body.dsshow #ntags,body.dsshow #dshud{display:none}
#dsst{position:fixed;left:50%;top:12px;transform:translateX(-50%);width:min(560px,94vw);z-index:4;text-align:center;pointer-events:none}#dsst .bar{width:100%;height:8px;margin-top:6px}
#dscr{position:fixed;right:14px;top:12px;z-index:4;text-align:right;pointer-events:none;min-width:160px}#dscr b{font-size:28px;display:block;color:#fff}#dscr .bar{width:100%}
#dsend{position:fixed;left:14px;bottom:14px;z-index:4}
#dstalk{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);width:min(520px,94vw);z-index:6;text-align:center}#dstalk .dsto{display:grid;gap:6px;margin:8px 0}#dstalk button{text-align:left}
#dsshout{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:5;pointer-events:none;font:900 clamp(26px,5vw,60px) Silkscreen,ui-monospace,monospace;color:#fff;text-shadow:0 0 18px #ff4a9a,0 4px 0 #000;opacity:0;transition:opacity .5s,transform .5s;white-space:nowrap;text-align:center}
@media (max-width:600px){#dscr b{font-size:20px}#dsst{top:58px}}`;document.head.appendChild(st)}
D.hint=()=>{const C=D.C;if(!C)return'';if(D.room&&D.room.key=='conc')return'The Backstage door is at the far end of the concourse.';if(D.room&&D.room.key=='dress')return'Plan the show at the setlist board, then walk out on stage.';
 const v=C.d.venue,cl=C.d.club,lv=flv();const ok=k=>{try{return typeof wtCanPlay=='function'?wtCanPlay(C.id,k).ok:false}catch(e){return false}};
 if(v&&ok('venue'))return v.n+' can book you tonight: go to the stadium (N for the map).';if(cl&&ok('club'))return cl.n+' can book you: the club is downtown (N for the map).';
 let tk='';try{const a=TRAVEL.active().find(t=>t.from==C.id);if(a)tk='Flight '+(a.fl||'')+' leaves '+TRAVEL.local(a.dep,C.id)+' local from Gate '+a.gate+', in '+TRAVEL.left(a.dep)+'.'}catch(e){}
 return tk||'Book your flight home in the flight app, then head to the airport. N for the map.'};
{const u0=update;update=function(dt){u0(dt);if(SH&&mode=='dshow'){try{showTick(dt)}catch(e){if(!D.serr){D.serr=1;console.error('tour show',e)}}}else if(SH&&SH.end&&mode=='play'){D.showLeave()}
 const C=D.C;if(C&&C.rooms.conc&&D.room===C.rooms.conc&&C.rooms.conc.walk)C.rooms.conc.walk.forEach(w=>{w.x+=w.dir*w.sp*dt;if(w.x>1146){w.x=1146;w.dir=-1}if(w.x<1102){w.x=1102;w.dir=1}w.t+=dt*7;w.o.g.position.set(OX+w.x,0,OZ+w.z);w.o.g.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2;const s=Math.sin(w.t)*.5;w.o.legs[0].rotation.x=s;w.o.legs[1].rotation.x=-s})}}
/* sleeping or a forced sleep during a show ends it first */
{const s0=sleepNow;sleepNow=function(a){if(SH&&!SH.end){try{showEnd(1)}catch(e){}try{D.showLeave()}catch(e){}}return s0.apply(this,arguments)}}
D.hooks.push((ev)=>{if(ev=='leave'&&SH){try{arenaKill(SH.A)}catch(e){}SH=null;D.view=null;document.body.classList.remove('dsshow')}});
})();
