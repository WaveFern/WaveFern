/* ===== v26.120: the Gramophone Awards =====
   A glitzy awards hall in the city (a grand low building at the end of your street with a gold marquee, red carpet and a giant gold gramophone on the roof). You can only go in at
   Fame Level 120. Inside is the reception: red carpet, step-and-repeat banner, champagne, a trophy case and a host with the
   guest list. Check in (once every 15 days) and pick the song you submit, then the ceremony plays as a TV broadcast cutscene:
   host, two other categories, then your category (Song of the Year) with nominees, a drumroll and the envelope. The winner
   walks up through the applause and holds the trophy up with everybody clapping, then you leave.
   Hard to win: you are up against four of 16 big real-world artists, each with a score that moves a little each year, and your
   score is your submitted song's mix quality plus a bonus for its streams. Only the single highest score wins.
   A win gives you a Gramophone Trophy in Storage (furniture, not sold anywhere) that you can place in your house. S.awd saves it all. */
const AW={need:120,cool:15,ox:-2400,i:null,
 pool:[['Beyoncé',142,'Silver Cathedral'],['Kendrick Lamar',140,'Compton Sonata'],['Drake',138,'Midnight Penthouse'],['Taylor Swift',136,'Glass Autumn'],['Adele',134,'Ten Winters'],['The Weeknd',132,'Neon Confession'],
  ['Bad Bunny',130,'Calor de Medianoche'],['Billie Eilish',128,'Hollow Lullaby'],['Bruno Mars',128,'Velvet Saturday'],['SZA',126,'Good Gravity'],['Travis Scott',124,'Astro Parade'],['Olivia Rodrigo',120,'Locker Room Heart'],
  ['Harry Styles',119,'Sunday Carousel'],['Dua Lipa',118,'Chrome Disco'],['Post Malone',116,'Whiskey Tattoo'],['Ed Sheeran',114,'Small Town Loop']],
 cats:['Best New Artist','Best Pop Vocal Album','Best Rap Performance','Best Dance Recording','Album of the Year','Best Rock Song','Record of the Year'],
 host:['Marcus Hale','June Calloway','Dex Okonkwo','Priya Vance'],nth:()=>40+Math.floor(((typeof S!='undefined'&&S.day)||0)/30)};
const awS=()=>(S.awd=S.awd||{last:-999,wins:0,tries:0,hist:[]});
const awSongScore=s=>Math.round((s.q||0)+Math.min(25,5*Math.log10(1+(s.streams||0)/1000)));
const awWait=()=>S.cheat?0:Math.max(0,AW.cool-(S.day-awS().last));

/* ---- the trophy: furniture that is not sold, only won ---- */
Object.defineProperty(F,'trophy',{value:{n:'Gramophone Trophy',p:0,w:.6,d:.6,b:[[.46,.1,.46,'#2a1f14',0,.05,0],[.38,.06,.38,'#c9a227',0,.13,0],[.1,.34,.1,'#e6c34a',0,.33,0],[.26,.04,.26,'#c9a227',0,.52,0],[.34,.02,.34,'#1a1a1a',0,.55,0],[.04,.06,.04,'#e6c34a',0,.59,0],
 [.1,.1,.1,'#e6c34a',.04,.62,0],[.18,.1,.18,'#f2d466',.1,.7,0],[.28,.1,.28,'#e6c34a',.17,.8,0],[.38,.08,.38,'#f2d466',.24,.9,0],[.26,.04,.26,'#3a2a10',.26,.9,0],[.05,.4,.05,'#c9a227',-.1,.3,.1]]},enumerable:false,writable:true,configurable:true});

/* ---- the field: you plus four big artists, scores decided up front ---- */
function awField(song){let me=awSongScore(song);const pool=AW.pool.slice().sort(()=>Math.random()-.5),rv=pool.slice(0,4).map(p=>({n:p[0],t:p[2],sc:Math.round(p[1]+R(-9,9)),you:0}));
 if(S.cheat)me=Math.max(me,...rv.map(r=>r.sc))+5;const f=rv.concat([{n:S.artist,t:song.title,sc:me,you:1}]).sort((a,b)=>b.sc-a.sc);const others=pool.slice(4,10);
 return{field:f,win:f[0],won:!!f[0].you,me,cats:[[pick(['Best New Artist','Best Pop Vocal Album','Best Dance Recording']),others[0][0],others[0][2]],[pick(['Best Rap Performance','Best Rock Song','Album of the Year']),others[1][0],others[1][2]]],
  h:[pick(AW.host),pick(AW.host)]}}

/* ---- the building out front, and the reception room ---- */
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
/* the building: a grand hall in the city, on the empty lot east of Nova Mall, door on the south face (the side the game camera sees)
   facing the main street. Footprint x 698-736, z -26 to 6; the forecourt (red carpet) runs to the kerb at z 14.9. Built in final world
   coordinates after the road warp, like the street shops. */
const AWB={x0:698,x1:736,z0:-26,z1:6,cx:717,on:0};
function awBuildOut(){if(AWB.on||AW.i==null)return;AWB.on=1;const X=AWB.cx,zf=AWB.z1,H=8.4,W=AWB.x1-AWB.x0,D=AWB.z1-AWB.z0,zc=(AWB.z0+AWB.z1)/2,wall='#eadfc6',trim='#c9a227',gl='#b9a0c8',mar='#6a0f1e';
 SB(W,H,D,wall,X,H/2,zc);SB(W+.5,.6,D+.5,'#bfae86',X,.3,zc);
 for(let y=1.6,i=0;y<H-.4;y+=1.4,i++)if(i%2)SB(W+.04,.5,D+.04,'#e0d3b4',X,y,zc);
 SB(W+.7,.5,D+.7,trim,X,H+.1,zc);SB(W+.3,.7,D+.3,'#f2e8d0',X,H+.7,zc);SB(W+.8,.14,D+.8,'#8e8a84',X,H+1.1,zc);
 /* steps and the red carpet */
 for(let k=0;k<3;k++)SB(17-k*.7,.2*(k+1),.8,'#d8ceb6',X,.1*(k+1),zf+.8+(2-k)*.8);
 SB(3.4,.05,8,'#b01020',X,.04,zf+4.9);SB(3.5,.03,8.1,'#d4a52a',X,.025,zf+4.9);
 [-1.9,1.9].forEach(sd=>{for(let z=zf+3.6;z<=14.4;z+=1.4){SB(.1,1,.1,'#e6c34a',X+sd,.5,z);SB(.22,.06,.22,'#c9a227',X+sd,.03,z);SB(.16,.12,.16,'#f6d86a',X+sd,1.04,z);if(z<14)SB(.04,.05,1.3,'#8a0f1e',X+sd,.9,z+.7)}});
 for(let k=0;k<4;k++)SB(.9,.03,.9,k%2?'#f6d86a':'#e6c34a',X,.07,zf+5.4+k*2.3);
 /* portico: six fluted columns, entablature, stepped pediment, sign */
 [-9,-6,-3,3,6,9].forEach(o=>{SB(1.2,.35,1.2,'#d8ceb6',X+o,.78,zf+2.2);SB(.85,6.2,.85,'#f4ecd8',X+o,4.1,zf+2.2);[-.3,.3].forEach(q=>SB(.06,6.2,.06,'#d9cfb4',X+o+q,4.1,zf+2.65));SB(1.25,.45,1.25,trim,X+o,7.5,zf+2.2)});
 SB(22,.9,2.2,'#f4ecd8',X,8.2,zf+1.6);SB(22.4,.2,2.4,trim,X,7.7,zf+1.6);SB(22.4,.2,2.4,trim,X,8.75,zf+1.6);
 for(let k=0;k<6;k++)SB(21-k*3.4,.55,1.6-k*.1,k%2?'#f4ecd8':'#e8dec4',X,9.2+k*.55,zf+1.5);SB(.5,.5,.5,trim,X,12.6,zf+1.5);
 [-1,1].forEach(sd=>{SB(.5,.5,.5,trim,X+sd*10.9,9.1,zf+1.5)});
 SB(2,2,.2,'#2a0a12',X,10.8,zf+2.4);
 const sg=ixSign('GRAMOPHONE AWARDS','#f6d86a','#2a0a12',14,1.4,{border:'#c9a227',ff:'Georgia,serif'});sg.position.set(X,8.2,zf+2.74);scene.add(sg);
 const sg2=ixSign('SONG OF THE YEAR · LIVE TONIGHT','#fff3b0','#6a0f1e',10,.7,{border:'#c9a227'});sg2.position.set(X,6.9,zf+2.9);scene.add(sg2);
 /* the doors */
 SB(5.2,5.4,.3,'#2a0a12',X,3.3,zf+.05);SB(2.2,4.2,.12,'#7a0f1e',X-1.1,2.8,zf+.22);SB(2.2,4.2,.12,'#7a0f1e',X+1.1,2.8,zf+.22);SB(1.8,2.4,.06,'#e6c34a',X-1.1,3.2,zf+.3);SB(1.8,2.4,.06,'#e6c34a',X+1.1,3.2,zf+.3);SB(1.5,2.1,.04,'#b9a0c8',X-1.1,3.2,zf+.34);SB(1.5,2.1,.04,'#b9a0c8',X+1.1,3.2,zf+.34);SB(.12,.5,.1,'#f6d86a',X-.2,2.5,zf+.35);SB(.12,.5,.1,'#f6d86a',X+.2,2.5,zf+.35);SB(5.4,.3,.5,trim,X,5.9,zf+.3);SB(1.6,.7,.1,'#2a0a12',X,5.2,zf+.3);SB(1.2,.4,.04,'#f6d86a',X,5.2,zf+.36);
 [-2.9,2.9].forEach(sd=>{SB(.3,.9,.3,'#2a2a2a',X+sd,3.6,zf+.4);SB(.4,.5,.4,'#fff3b0',X+sd,4.3,zf+.4)});
 /* tall windows with gold frames, banners and corner pilasters on the front */
 [-1,1].forEach(sd=>{[12.6,15.8].forEach(o=>{const x=X+sd*o;SB(1.8,4,.14,trim,x,3.9,zf+.06);SB(1.5,3.6,.18,gl,x,3.9,zf+.08);SB(.06,3.6,.2,trim,x,3.9,zf+.1);SB(2,.2,.5,'#d8ceb6',x,1.9,zf+.2)});SB(1.3,5.2,.08,mar,X+sd*10.2,4.6,zf+.06);SB(.9,.9,.1,'#e6c34a',X+sd*10.2,5.6,zf+.12);SB(.2,1.2,.1,'#f6d86a',X+sd*10.2,4.4,zf+.12);SB(1.2,.5,.12,'#f6d86a',X+sd*10.2,3.8,zf+.12);SB(1.1,.8,1.1,'#d8ceb6',X+sd*18.5,.7,zf+.5);SB(.9,7.6,.9,'#f4ecd8',X+sd*18.5,4.4,zf+.2)});
 /* east (visible) and west sides: windows and pilasters; the back wall */
 [AWB.x1,AWB.x0].forEach((wx,si)=>{const dir=si?-1:1;for(let z=zf-3;z>AWB.z0+2;z-=4.6){SB(.14,4,1.8,trim,wx+dir*.07,3.9,z);SB(.18,3.6,1.5,gl,wx+dir*.09,3.9,z);SB(.5,.2,2,'#d8ceb6',wx+dir*.2,1.9,z);SB(.5,.3,.3,'#d8ceb6',wx+dir*.1,H-.5,z-2.3)}});
 for(let x=AWB.x0+3;x<AWB.x1-1;x+=4.6){SB(1.8,3.6,.18,gl,x,3.9,AWB.z0-.09);SB(1.9,4,.14,trim,x,3.9,AWB.z0-.07)}
 /* roof: gold gramophone statue on a pedestal, flag poles, vents */
 const sx=X,sz=zc+2,y=H+1.2;SB(7,1,7,'#d8ceb6',sx,y+.5,sz);SB(6,.5,6,trim,sx,y+1.2,sz);SB(2.6,.4,2.6,'#2a1f14',sx,y+1.65,sz);SB(2.2,.3,2.2,'#c9a227',sx,y+2,sz);SB(.5,2.2,.5,'#e6c34a',sx,y+3.2,sz);SB(2,.25,2,'#c9a227',sx,y+4.4,sz);SB(1.7,.1,1.7,'#1a1a1a',sx,y+4.6,sz);
 [[.2,.5,.5,y+4.8],[.7,.7,.8,y+5.3],[1.3,.9,1.1,y+5.9],[2,1.1,1.4,y+6.5],[2.8,1.3,1.7,y+7.1]].forEach(q=>{SB(q[1],.62,q[1],'#e6c34a',sx+q[0]*.45,q[3],sz)});SB(2.1,.4,2.1,'#fff3b0',sx+1.4,y+7.6,sz);SB(1.2,.3,1.2,'#8a6a1a',sx+1.45,y+7.65,sz);
 [-14,14].forEach(o=>{SB(.14,6,.14,'#cfd3d8',X+o,H+4,zf-2);SB(2,1.2,.05,mar,X+o+(o<0?1:-1),H+6.4,zf-2);SB(.8,.5,.06,'#f6d86a',X+o+(o<0?1:-1),H+6.4,zf-1.95)});
 SB(2,.8,2,'#9aa0a6',X-6,H+1.6,zc);SB(2.4,.6,1.6,'#c3c7cc',X+8,H+1.5,zc-3);SB(.3,.8,.3,'#5a5f66',X+12,H+1.6,zc+4);
 /* forecourt: gold lamp posts, planters, a bollard line along the kerb */
 [-6,6].forEach(o=>{SB(.24,3.6,.24,'#2a2a2a',X+o,1.8,13);SB(.9,.1,.1,'#2a2a2a',X+o,3.6,13);SB(.5,.5,.5,'#fff3b0',X+o,3.9,13);SB(.7,.2,.7,'#c9a227',X+o,.1,13)});
 [-8.5,8.5,-12,12].forEach((o,i)=>{SB(1.2,.7,1.2,'#8a6a4a',X+o,.35,i<2?8:11);SB(1,.8,1,'#2e7d32',X+o,1.1,i<2?8:11);SB(.7,.5,.7,'#43a047',X+o,1.6,i<2?8:11)});
 /* the way in and out */
 col(AWB.x0,AWB.z0,AWB.x1,AWB.z1+.2);const s=SHOPS[AW.i];s.cx=X;s.ez=zf+5.5;INT.push({x:X,z:zf+4.6,r:2,l:'Enter Gramophone Awards',a:()=>{if(fameLevel()<AW.need){snd('err');say('Invite only: the Gramophone Awards need Fame Level '+AW.need+'. You are Level '+fameLevel()+'.')}else enterShop(AW.i)}});POIS.push([X,13,'Gramophone Awards','#ffd24a'])}
{const f=flushSB;flushSB=function(){warpWorld();try{awBuildOut()}catch(e){console.error('awards building',e)}f()}}

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

/* ---- the ceremony: a real 3D hall in the game's own pixel look, filmed by TV cameras ---- */
const AWC={on:0,cam:null,g:null,ox:4000,oz:4000,hud:'',bg:null,fog:null};
const AWCF={'Beyoncé':{hair:5,hc:3,top:2,tc:3,pc:4,skin:4,body:.35,eyes:1,mouth:0},'Taylor Swift':{hair:11,hc:3,top:4,tc:0,pc:4,skin:0,body:.3,eyes:1,mouth:0},'Adele':{hair:5,hc:3,top:2,tc:6,pc:4,skin:0,body:.55,eyes:0,mouth:0},
 'Bad Bunny':{hair:1,hc:0,top:0,tc:3,pc:1,skin:2,body:.35,eyes:4,mouth:3},'Bruno Mars':{hair:11,hc:0,top:2,tc:3,pc:4,skin:2,body:.35,eyes:0,mouth:3},'SZA':{hair:5,hc:1,top:3,tc:7,pc:5,skin:4,body:.3,eyes:1,mouth:0},
 'Travis Scott':{hair:5,hc:1,top:1,tc:4,pc:4,skin:3,body:.45,eyes:0,mouth:1},'Olivia Rodrigo':{hair:5,hc:1,top:4,tc:9,pc:5,skin:2,body:.3,eyes:1,mouth:0},'Harry Styles':{hair:2,hc:1,top:3,tc:0,pc:4,skin:0,body:.3,eyes:0,mouth:3},
 'Dua Lipa':{hair:5,hc:0,top:4,tc:6,pc:4,skin:1,body:.3,eyes:1,mouth:0},'Post Malone':{hair:2,hc:2,top:0,tc:5,pc:3,skin:0,body:.55,eyes:2,mouth:1}};
const awCfg=n=>{const a=typeof ART!='undefined'&&ART.find(q=>q[0]==n);if(a&&a[4])return Object.assign({hgt:.55,ac:-1},a[4]);return Object.assign({hgt:.5,ac:-1,eyes:0,mouth:0,top:2,tc:6,pc:4,skin:2,body:.4,hair:2,hc:1},AWCF[n]||{})};
const AWHOST=[{hair:2,hc:0,top:2,tc:6,pc:4,skin:2,body:.45,hgt:.6,ac:-1,eyes:0,mouth:0},{hair:5,hc:1,top:4,tc_custom:'#7a1d5a',pc_custom:'#7a1d5a',skin:1,body:.3,hgt:.5,ac:-1,eyes:1,mouth:0},{hair:1,hc:10,top:2,tc:6,pc:4,skin:4,body:.5,hgt:.65,ac:-1,eyes:0,mouth:3},{hair:6,hc:0,top:4,tc_custom:'#1d4a7a',pc_custom:'#1d4a7a',skin:3,body:.3,hgt:.45,ac:-1,eyes:1,mouth:0}];
function awTrophy(sc){const t=new THREE.Group();F.trophy.b.forEach(p=>B(t,p[0],p[1],p[2],p[3],p[4],p[5],p[6]));t.scale.setScalar(sc||1);return t}

function awShow(F0,song){
 const WIN=F0.win,YOU=F0.field.find(x=>x.you),O=AWC,g=new THREE.Group();g.position.set(O.ox,0,O.oz);scene.add(g);O.g=g;
 const b=(w,h,d,c,x,y,z,p)=>B(p||g,w,h,d,c,x,y,z),GOLD='#c9a227',GOLD2='#f6d86a',rng=awRng(1234),pk=a=>a[Math.floor(rng()*a.length)];
 const aspect=()=>innerWidth/innerHeight;O.cam=new THREE.PerspectiveCamera(46,aspect(),.1,160);
 /* the hall: dark walls, gold trim, a red carpet aisle, a stage with steps */
 b(76,.2,64,'#1b0f26',0,-.1,6);b(76,26,.4,'#0e0814',0,13,-16);b(.4,26,64,'#0e0814',-38,13,6);b(.4,26,64,'#0e0814',38,13,6);b(76,.4,64,'#0a0610',0,26,6);b(76,26,.4,'#0e0814',0,13,38);
 b(2.6,.04,24,'#b01020',0,.02,7.5);b(2.8,.03,24.2,GOLD,0,.015,7.5);
 b(30,.8,10,'#2a1a38',0,.4,-9.2);b(30.4,.16,10.4,GOLD,0,.78,-9.2);b(26,.04,8,'#3a2450',0,.82,-9.4);b(30.4,.3,.3,GOLD2,0,.7,-4.1);
 b(4.4,.27,.7,GOLD,0,.135,-3.25);b(4.4,.53,.7,'#e6c34a',0,.265,-3.8);
 [-1,1].forEach(s=>{b(.4,.9,.4,GOLD2,s*2.4,.45,-3.5)});
 /* the big screen and LED pillars */
 const sc=document.createElement('canvas');sc.width=1024;sc.height=430;const tex=new THREE.CanvasTexture(sc);tex.minFilter=THREE.LinearFilter;
 b(19,8.2,.3,GOLD,0,7.9,-15.5);const scr=new THREE.Mesh(new THREE.PlaneGeometry(18.2,7.4),new THREE.MeshBasicMaterial({map:tex}));scr.position.set(0,7.9,-15.32);g.add(scr);
 const pil=[];[-14.5,14.5].forEach(x=>{const m=b(1.4,14,.8,'*ffffff',x,7.8,-15);pil.push(m)});
 [-9,9].forEach(x=>{const t=awTrophy(3.2);t.position.set(x,.84,-11);g.add(t)});
 /* truss, lights and beams */
 [[-6,12.5],[-10,13.2],[-2,13.6]].forEach(q=>b(36,.4,.4,GOLD,0,q[1],q[0]));b(.4,.4,16,GOLD,-16,13,-8);b(.4,.4,16,GOLD,16,13,-8);
 const beams=[];for(let k=0;k<8;k++){const cm=new THREE.Mesh(new THREE.CylinderGeometry(.15,2.1,13,8,1,true),new THREE.MeshBasicMaterial({color:[0xffe9a8,0xff9ad5,0x9ad8ff,0xffe9a8][k%4],transparent:true,opacity:.1,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));cm.geometry.translate(0,-6.5,0);cm.position.set(-15.5+k*4.4,13,-8+(k%2)*3);g.add(cm);beams.push(cm);b(.6,.5,.6,'*fff3b0',cm.position.x,13,cm.position.z)}
 /* podium, camera crew and a drum of flashbulbs */
 b(2.6,1.5,1.1,'#2a1a38',0,1.55,-8);b(2.8,.12,1.3,GOLD,0,2.35,-8);const gt=awTrophy(.6);gt.position.set(0,1.45,-8.1);g.add(gt);b(.05,.7,.05,'#999',.3,2.7,-8.2);b(.2,.08,.12,'#222',.3,3.05,-8.1);
 [[-12,10],[12,10],[0,18]].forEach(q=>{b(.1,1.6,.1,'#222',q[0],.8,q[1]);b(.8,.6,1.2,'#1c1c24',q[0],1.9,q[1]);b(.4,.3,.5,'#0a0a10',q[0],1.9,q[1]-.8);b(.12,.12,.12,'*ff3030',q[0]+.3,2.25,q[1]-.5)});
 const flashes=[];for(let k=0;k<16;k++){const m=b(.5,.5,.05,'*ffffff',R(-14,14),R(1.8,4),R(8,17));m.visible=false;flashes.push(m)}
 /* polish: velvet curtains, footlights, aisle lights, flower urns, a gold floor star, an ON AIR sign and exit doors */
 [-1,1].forEach(s=>{for(let k=0;k<7;k++)b(1.3,23,.7,k%2?'#7a0f1e':'#5a0a16',s*(11.5+k*1.25),11.5,-15.2);b(10,1.2,.8,GOLD,s*16,22.6,-15);b(.6,.6,.3,GOLD2,s*11,22,-14.6);
  for(let k=0;k<5;k++)b(.5,.5,.5,'*fff0b0',s*(1.5+k*5.6),.95,-4.3);
  b(1.6,1.4,1.6,'#3a1a48',s*13.6,1.5,-5.6);b(1.8,.12,1.8,GOLD,s*13.6,2.25,-5.6);for(let k=0;k<7;k++)b(.34,.34,.34,['#ff7aa8','#ffffff','#ff9a5a','#ffe27a'][k%4],s*13.6+R(-.5,.5),R(2.4,3.3),-5.6+R(-.5,.5));
  b(2.2,5.4,.3,'#3a2450',s*36.6,2.7,12);b(1.8,.5,.1,'*37d67a',s*36.4,5.9,12);b(.12,5,.2,GOLD,s*36.5,2.5,10.9)});
 for(let k=0;k<12;k++)[-1,1].forEach(s=>b(.14,.06,.5,k%2?'*ffd24a':'*ff9a5a',s*1.5,.05,3+k*1.9));
 {const stg=b(8,.03,8,'#e6c34a',0,.85,-9.6);stg.rotation.y=Math.PI/4;b(5.6,.04,5.6,'#2a1a38',0,.86,-9.6).rotation.y=Math.PI/4}
 b(3.6,.8,.3,'#b0121a',0,12.2,-14.9);b(3.2,.5,.1,'*ff3030',0,12.2,-14.7);
 const spot=new THREE.Mesh(new THREE.CylinderGeometry(.5,2.6,12,16,1,true),new THREE.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:.13,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));spot.geometry.translate(0,-6,0);spot.position.set(0,13,-8);g.add(spot);
 /* the audience */
 const NS={you:[-4.1,3.2],rv:[[-6.3,3.2],[4.1,3.2],[6.3,3.2],[1.9,3.2]]},sk0=q=>q[0].toFixed(1)+','+q[1].toFixed(1),taken=new Set([NS.you].concat(NS.rv).map(sk0));
 const aud=[],seat=(x,z)=>{b(1,.5,.9,'#6a0f1e',x,.25,z);b(1,1,.16,'#6a0f1e',x,.9,z+.5);b(1.04,.07,.94,GOLD,x,.52,z);b(.1,.5,.1,'#2a1a38',x-.45,.9,z+.55);b(.1,.5,.1,'#2a1a38',x+.45,.9,z+.55)};
 /* audience: full game characters (legs, face, hair) dressed from the game's own wardrobe: tops, jackets, trousers, shoes */
 const FTOP=[0,2,2,3,5,6,7,9],FBT=[0,0,0,3,2],mkAud=(x,z)=>{const cf={skin:Math.floor(rng()*SKIN.length),eyes:Math.floor(rng()*5),mouth:Math.floor(rng()*4),hair:Math.floor(rng()*12),hc:Math.floor(rng()*HAIRC.length),top:pk(FTOP),tc:Math.floor(rng()*TOPC.length),pc:Math.floor(rng()*PANTC.length),bt:pk(FBT),body:rng(),ac:-1};
  if(rng()<.4){cf.jk=Math.floor(rng()*JKC.length);if(rng()<.3)cf.jks=1+Math.floor(rng()*3)}if(rng()<.8&&typeof SHC!='undefined')cf.sh=Math.floor(rng()*SHC.length);
  const c=buildChar(cf);c.g.position.set(x,-.3,z);c.g.rotation.y=Math.PI;g.add(c.g);c.legs.forEach(l=>l.rotation.x=-1.45);c.ph=rng()*6;c.so=rng();c.seat=[x,z];c.up=0;aud.push(c);return c};
 const zs=[3.2,5.6,8,10.4,12.8,15.2];zs.forEach(z=>{for(let k=0;k<6;k++)[-1,1].forEach(s=>{const x=s*(1.9+k*2.2);seat(x,z);if(!taken.has(sk0([x,z]))&&rng()<.9)mkAud(x,z)})});
 /* named people: you, the rivals, the hosts */
 const mkP=(cfg,x,y,z,ry)=>{const c=buildChar(cfg);c.g.position.set(x,y,z);c.g.rotation.y=ry||0;g.add(c.g);return c},sit=c=>{c.legs.forEach(l=>l.rotation.x=-1.45);c.g.position.y=-.3},stand=c=>{c.legs.forEach(l=>l.rotation.x=0);c.g.position.y=0};
 const people={},ord=F0.field.filter(x=>!x.you);let ri=0;
 F0.field.forEach(x=>{const q=x.you?NS.you:NS.rv[ri++];const c=mkP(x.you?ch:awCfg(x.n),q[0],0,q[1],Math.PI);sit(c);c.seat=q;c.name=x.n;people[x.n+(x.you?'*':'')]=c;x.c=c});
 const hc=AWHOST.map(cf=>buildChar(cf));const host=hc[0],presA=hc[1],presB=hc[2];
 [[host,0,-8.9],[presA,-2.2,-8.6],[presB,2.2,-8.6]].forEach(q=>{q[0].g.position.set(q[1],.8,q[2]);g.add(q[0].g)});presA.g.visible=presB.g.visible=false;
 const oth=[];F0.cats.forEach((ct,k)=>{const c=buildChar(awCfg(ct[1]));c.g.position.set(1.8,.8,-6.2);c.g.visible=false;g.add(c.g);const tr=awTrophy(1.5);const ar=c.arms[1];tr.position.set(ar.position.x,ar.position.y+.45,.05);c.g.add(tr);ar.rotation.x=-3.1;c.up=1;oth.push(c)});
 const wt=awTrophy(1.5),wc=WIN.c;{const ar=wc.arms[1];wt.position.set(ar.position.x,ar.position.y+.45,.05);wt.visible=false;wc.g.add(wt)}
 /* lights */
 const L=[new THREE.AmbientLight(0xb8a8d0,1.35),new THREE.PointLight(0xffe8c0,2.1,70,1),new THREE.PointLight(0xff6fb8,1.3,60,1),new THREE.PointLight(0x5fc8ff,1.3,60,1),new THREE.PointLight(0xfff0d0,1,70,1)];
 L[1].position.set(0,9,-4);L[2].position.set(-12,8,-6);L[3].position.set(12,8,-6);L[4].position.set(0,10,10);L.forEach(l=>g.add(l));
 /* confetti */
 const NC=500,cp=new Float32Array(NC*3),cc=new Float32Array(NC*3),cv=new Float32Array(NC*3),cg=new THREE.BufferGeometry();let cn=0;
 cg.setAttribute('position',new THREE.BufferAttribute(cp,3));cg.setAttribute('color',new THREE.BufferAttribute(cc,3));const pts=new THREE.Points(cg,new THREE.PointsMaterial({size:.32,vertexColors:true,depthWrite:false}));pts.frustumCulled=false;g.add(pts);
 for(let i=0;i<NC;i++)cp[i*3+1]=-50;
 const confetti=n=>{for(let k=0;k<n;k++){const i=cn++%NC,c=new THREE.Color(pk(['#ffd24a','#ff5a7a','#7fe3ff','#ffffff','#b58cff','#6dffb0']));cp[i*3]=R(-14,14);cp[i*3+1]=R(11,15);cp[i*3+2]=R(-12,10);cv[i*3]=R(-1,1);cv[i*3+1]=R(-3,-1.3);cv[i*3+2]=R(-1,1);cc[i*3]=c.r;cc[i*3+1]=c.g;cc[i*3+2]=c.b}};
 /* the screen */
 const screen=(lines,hue)=>{const x=sc.getContext('2d'),W=1024,H=430,gr=x.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#2a0f3f');gr.addColorStop(1,hue||'#0e1b3a');x.fillStyle=gr;x.fillRect(0,0,W,H);
  for(let k=0;k<26;k++){x.fillStyle=`rgba(255,220,120,${.04+k%3*.03})`;x.beginPath();x.arc((k*173)%W,(k*97)%H,20+k*4,0,7);x.fill()}x.strokeStyle='#e6c34a';x.lineWidth=6;x.strokeRect(14,14,W-28,H-28);
  x.textAlign='center';lines.forEach(l=>{x.font=(l[3]||'bold ')+l[1]+'px Georgia,serif';let fs=l[1];while(x.measureText(l[0]).width>W-90&&fs>14){fs-=2;x.font=(l[3]||'bold ')+fs+'px Georgia,serif'}x.fillStyle=l[2]||GOLD2;x.fillText(l[0],W/2,l[4]);});tex.needsUpdate=true};
 /* the state machine */
 const A={cheer:0,look:null,t:0,si:0,li:0,typed:0,hold:0,clap:0,clapT:0,stand:0,end:false,cl:0,walk:null,cam:{p:[0,5,26],l:[0,5,-9]},fade:1,lastClap:0},NTH=AW.nth();O.A=A;
 const wrap=document.createElement('div');wrap.id='awd';wrap.style.cssText='position:fixed;inset:0;z-index:50;pointer-events:none;font-family:"Silkscreen",ui-monospace,monospace';
 wrap.innerHTML=`<div id=awfade style="position:absolute;inset:0;background:#000;opacity:1;transition:opacity .8s"></div><div style="position:absolute;left:0;right:0;top:0;height:7%;background:#000"></div><div style="position:absolute;left:0;right:0;bottom:0;height:7%;background:#000"></div>
 <div style="position:absolute;left:3%;top:9%;display:flex;gap:10px;align-items:center;font-size:clamp(11px,1.6vw,16px)"><span style="background:#c0141c;color:#fff;padding:3px 8px">LIVE</span><span style="color:#f6d86a;text-shadow:0 0 6px #000">THE ${NTH}TH GRAMOPHONE AWARDS</span></div>
 <div id=awcap style="position:absolute;left:50%;bottom:10%;transform:translateX(-50%);width:min(860px,92vw);box-sizing:border-box;background:rgba(10,5,18,.9);border:3px solid #c9a227;border-radius:4px;padding:10px 16px;pointer-events:auto;cursor:pointer;display:none"><div id=awwho style="color:#f6d86a;font-size:clamp(11px,1.5vw,15px);margin-bottom:4px"></div><div id=awtxt style="color:#fff;font:600 clamp(14px,2.1vw,22px)/1.35 ui-monospace,Menlo,Consolas,monospace;min-height:1.35em"></div><div style="text-align:right;color:#8a7a50;font-size:11px">click or space ▸</div></div>
 <button id=awskip style="position:absolute;right:3%;top:9%;pointer-events:auto;opacity:.85">Skip ⏭</button><div id=awres style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.78);pointer-events:auto"></div>`;
 document.body.appendChild(wrap);O.wrap=wrap;
 const $c=id=>wrap.querySelector('#'+id);
 /* camera shots */
 const seatCam=(q,u)=>({p:[q[0]+.5+Math.sin(u*.5)*.2,1.55,q[1]-3.1+u*.08],l:[q[0],1.2,q[1]]});
 const shots={
  wide:u=>({p:[0,5.6-u*.4,21-u*1.5],l:[0,5,-9]}),
  podium:u=>({p:[.4+u*.3,2.7,-1.2-u*.3],l:[0,2.7,-8.2]}),
  stage:u=>({p:[-3+u*3,3.2,1.5],l:[0,2.6,-8.2]}),
  push:u=>({p:[0,2.6,1-u*2.4],l:[0,2.8,-8.2]}),
  crowd:u=>({p:[-4+u*8,2.4,-3.2],l:[0,1.7,10]}),
  hero:u=>({p:[4.2-u*2.4,2.6,-.2-u*.6],l:[1.8,2.6,-6.4]})};
 const SH=(f)=>(t,s)=>f(Math.min(1,t/(s.min||6)));
 const pre=(who,i)=>who?[who,i]:['',i];
 const hn=[host,presA,presB],hname=F0.h;
 const you=!!WIN.you,order=F0.field.filter(x=>!x.you).concat([YOU]);
 const S_=[];
 S_.push({min:5,lines:[['','Good evening, and welcome to the Gramophone Awards!']],on:()=>{screen([['THE '+NTH+'TH ANNUAL',60,GOLD2,'bold ',110],['GRAMOPHONE',120,'#ffffff','bold ',230],['AWARDS',90,GOLD2,'bold ',330],['Live from the Golden Hall',30,'#cbb','',390]]);A.clap=1;snd('chime');confetti(160)},cam:u=>shots.wide(u)});
 S_.push({min:6,lines:[[hname[0]+' (host)','Tonight, one song becomes a legend.'],[hname[0]+' (host)','Five nominees. One trophy. Absolutely no pressure.']],on:()=>{A.clap=0;screen([['TONIGHT\'S HOST',44,GOLD2,'bold ',140],[hname[0].toUpperCase(),84,'#ffffff','bold ',250]])},cam:u=>shots.podium(u)});
 F0.cats.forEach((ct,k)=>S_.push({min:7,lines:[[hname[1]+' & '+hname[0].split(' ')[0],'Presenting '+ct[0]+'. Every nominee was incredible.'],['','And the winner is...'],['',ct[1]+' takes it home for "'+ct[2]+'"!']],
  on:()=>{A.clap=0;presA.g.visible=presB.g.visible=true;host.g.visible=false;oth.forEach(c=>c.g.visible=false);screen([['NOW PRESENTING',40,GOLD2,'bold ',120],[ct[0].toUpperCase(),70,'#ffffff','bold ',230]]);snd('ping')},
  line:i=>{if(i==2){oth[k].g.visible=true;screen([['AND THE WINNER IS',38,GOLD2,'bold ',100],[ct[1].toUpperCase(),84,'#ffffff','bold ',230],['"'+ct[2]+'"',40,GOLD2,'bold ',310]]);A.clap=1;confetti(80);snd('chime');O.shot=null}},
  off:()=>{oth[k].g.visible=false;A.clap=0},cam:u=>A.li>=2?shots.hero(u):shots.stage(u)}));
 const ni=order.length;
 S_.push({min:4,lines:[[hname[1],'Song of the Year. The one everybody argues about.'],...order.map((x,i)=>['',(x.you?'Nominated: you, '+x.n+', with "'+x.t+'".':'Nominated: '+x.n+', "'+x.t+'".')])],
  on:()=>{A.clap=0;presA.g.visible=presB.g.visible=true;host.g.visible=false;screen([['SONG OF THE YEAR',64,GOLD2,'bold ',140],['THE NOMINEES',48,'#ffffff','bold ',230]])},
  line:i=>{if(i>=1){const x=order[i-1];screen([['SONG OF THE YEAR',34,GOLD2,'bold ',70],[x.n.toUpperCase(),72,x.you?'#7fe3ff':'#ffffff','bold ',185],['"'+x.t+'"',42,GOLD2,'bold ',255],['NOMINEE '+i+' OF '+ni,26,'#bbb','',330]]);A.clap=.6;snd('pop')}},
  cam:(u,s)=>{const i=A.li;if(i<1)return shots.stage(u);const x=order[i-1];return seatCam(x.c.seat,A.lt||0)}});
 S_.push({min:5,lines:[[hname[2],'The envelope, please...'],[hname[1],'And the winner is...']],on:()=>{A.clap=0;screen([['AND THE WINNER IS...',64,GOLD2,'bold ',230]],'#2a0a12');for(let i=0;i<24;i++)nz(.09,200+i*10,.35,1,'lowpass',i*.14)},cam:u=>shots.push(u)});
 S_.push({min:4,lines:[['',(you?S_NAME():WIN.n)+'! "'+WIN.t+'"']],on:()=>{A.clap=1;A.stand=1;snd('chime');confetti(240);screen([['SONG OF THE YEAR',34,GOLD2,'bold ',70],[WIN.n.toUpperCase(),84,'#ffffff','bold ',185],['"'+WIN.t+'"',46,GOLD2,'bold ',270]],'#3a0f4f')},cam:u=>(u<.5?shots.crowd(u*2):seatCam(wc.seat,u))});
 function S_NAME(){return S.artist}
 /* the walk-up: you get out of your seat and walk to the stage yourself (WASD / arrows), then collect the trophy at the glowing ring */
 const mk=new THREE.Group();mk.visible=false;g.add(mk);const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1.25,28),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;mk.add(ring);
 const arrow=b(.45,.45,.45,'*ffd24a',0,2.8,0,mk);arrow.rotation.z=Math.PI/4;
 const hint=document.createElement('div');hint.style.cssText='position:absolute;left:50%;bottom:11%;transform:translateX(-50%);max-width:92vw;background:rgba(10,5,18,.92);border:3px solid #c9a227;border-radius:4px;padding:10px 18px;color:#f6d86a;font-size:clamp(12px,1.7vw,17px);text-align:center;display:none';wrap.appendChild(hint);
 const pt=awTrophy(1.5);pt.visible=false;{const ar=presB.arms[1];pt.position.set(ar.position.x,ar.position.y+.45,.05);presB.g.add(pt)}
 const CS=[1.8,-6.2],stY=(x,z)=>z<-4.2?.8:Math.abs(x)<2.3?.8*Math.max(0,Math.min(1,(-2.9-z)/1.3)):0;
 const collect=()=>{const f=A.free;A.free=null;mk.visible=false;hint.style.display='none';pt.visible=false;presB.arms[1].rotation.x=0;presB.g.position.set(2.2,.8,-8.6);presB.g.rotation.y=0;wc.g.position.set(CS[0],.8,CS[1]);wc.g.rotation.y=0;wt.visible=true;wc.arms[1].rotation.x=-3.1;wc.arms[0].rotation.x=0;wc.legs.forEach(l=>l.rotation.x=0);A.cheer=3.5;A.look=null;confetti(220);snd('chime');next()};
 S_.push({min:7.5,lines:you?[]:[['',WIN.n+' makes the long walk up to the stage.']],on:()=>{A.clap=1;A.stand=1;stand(wc);wc.g.rotation.y=Math.PI;A.cheer=2;const q=wc.seat;
   if(you){A.free={x:q[0],z:q[1],ek:1};wc.g.position.set(q[0],0,q[1]);presA.g.visible=presB.g.visible=true;host.g.visible=false;presA.g.position.set(-1.4,.8,-8.6);presB.g.position.set(3.4,.8,-6.2);presB.g.rotation.y=-Math.PI/2;presB.arms[1].rotation.x=-3.1;pt.visible=true;mk.position.set(CS[0],.8,CS[1]);mk.visible=true;hint.style.display='block'}
   else{const P=[[q[0],1.3],[0,1.3],[0,-3.0],[0,-4.9],[1.8,-6.2]];A.walk={P,k:0,d:0,pos:[q[0],q[1]]}}},
  tick:dt=>{mk.children[1].position.y=2.8+Math.sin(A.t*4)*.25;mk.children[1].rotation.y+=dt*2;mk.children[0].scale.setScalar(1+Math.sin(A.t*5)*.08);
   const f=A.free;if(f){const kd=k=>keys[k]?1:0;let dx=kd('d')+kd('arrowright')-kd('a')-kd('arrowleft'),dz=kd('s')+kd('arrowdown')-kd('w')-kd('arrowup');const mv=Math.hypot(dx,dz),oz=f.z,sp=(kd('shift')?5.2:3.4)*dt;
    const bad=(x,z)=>Math.abs(x)>33||z>30||z<-13.4||(z<-4.2&&Math.abs(x)>14)||(z<-4.2&&oz>=-4.2&&Math.abs(x)>2.3)||(z>=-4.2&&oz<-4.2&&Math.abs(x)>2.3)||(z<-7&&z>-9.4&&Math.abs(x)<1.7);
    if(mv){dx/=mv;dz/=mv;const nx=f.x+dx*sp,nz=f.z+dz*sp;if(!bad(nx,f.z))f.x=nx;if(!bad(f.x,nz))f.z=nz;wc.g.rotation.y=Math.atan2(dx,dz)}
    const y=stY(f.x,f.z),ph=A.t*10;wc.g.position.set(f.x,y,f.z);wc.legs[0].rotation.x=mv?Math.sin(ph)*.7:0;wc.legs[1].rotation.x=mv?-Math.sin(ph)*.7:0;wc.arms[0].rotation.x=mv?-Math.sin(ph)*.6:-.4;wc.arms[1].rotation.x=mv?Math.sin(ph)*.6:.4;wc.arms[0].rotation.z=.12;wc.arms[1].rotation.z=-.12;
    A.look=[f.x,f.z];const d=Math.hypot(f.x-CS[0],f.z-CS[1]),near=d<1.8&&y>.7;hint.innerHTML=near?'Press <b>E</b> to collect your trophy':(f.z<-4.2?'Walk to the glowing ring (WASD / arrows)':'Walk up to the stage: use <b>WASD</b> or arrows (hold Shift to hurry), then take the steps in the middle');
    const ek=keys.e||keys[' ']||keys.enter;if(ek&&!f.ek&&near){collect();return}f.ek=ek?1:0;return}
   const w=A.walk;if(!w||w.done)return;let mv=2.7*dt;while(mv>0&&w.k<w.P.length){const t=w.P[w.k],dx=t[0]-w.pos[0],dz=t[1]-w.pos[1],dd=Math.hypot(dx,dz);if(dd<mv){w.pos=[t[0],t[1]];mv-=dd;w.k++}else{w.pos[0]+=dx/dd*mv;w.pos[1]+=dz/dd*mv;wc.g.rotation.y=Math.atan2(dx,dz);mv=0}}
   if(w.k>=w.P.length){w.done=1;wc.g.rotation.y=0}const z=w.pos[1];wc.g.position.set(w.pos[0],.8*Math.max(0,Math.min(1,(-2.9-z)/1.1)),z);const ph=A.t*9;wc.legs[0].rotation.x=w.done?0:Math.sin(ph)*.6;wc.legs[1].rotation.x=w.done?0:-Math.sin(ph)*.6;wc.arms[0].rotation.x=w.done?0:-Math.sin(ph)*.5;wc.arms[1].rotation.x=w.done?-3.1:Math.sin(ph)*.5;if(w.done)wt.visible=true;A.look=[w.pos[0],w.pos[1]]},
  done:()=>A.walk&&A.walk.done,off:()=>{mk.visible=false;hint.style.display='none';A.look=null},
  cam:u=>{const f=A.free;if(f){const y=stY(f.x,f.z);return{p:[f.x*.7,2.9+y*.8,f.z+5.2],l:[f.x*.9,1.5+y,f.z-3.4]}}const w=A.walk,p=w?w.pos:[0,0];return{p:[p[0]+3.6,2.8,p[1]-4.6],l:[p[0],1.2,p[1]]}}});
 S_.push({min:12,lines:you?[[S.artist,'Thank you. I... wow. I really did not write a speech.'],[S.artist,'To everyone who streamed, shared and sang along: this one is yours too.'],[hname[1],'Song of the Year. Congratulations!']]:[[WIN.n,pick(['I am honestly speechless. Thank you to my team, my family and the fans.','Wow. Thank you, Gramophone Academy. This means everything.'])],[WIN.n,pick(['This one is for everybody who never stopped believing.','Go home and make something that scares you.'])],[hname[1],'Song of the Year. Congratulations!']],
  on:()=>{A.clap=1;A.stand=1;presA.g.visible=presB.g.visible=true;presA.g.position.set(-1.4,.8,-8.6);presB.g.position.set(2.2,.8,-8.6);presB.g.rotation.y=0;pt.visible=false;A.look=null;wt.visible=true;wc.arms[1].rotation.x=-3.1;wc.arms[0].rotation.x=0;wc.g.position.set(1.8,.8,-6.2);wc.g.rotation.y=0;confetti(260);snd('chime');screen([['CONGRATULATIONS',70,GOLD2,'bold ',160],[WIN.n.toUpperCase(),70,'#ffffff','bold ',270]],'#3a0f4f')},
  line:i=>{if(i==1||i==2)confetti(120)},cam:u=>shots.hero(u)});
 S_.push({min:3.4,lines:[['',you?'You slip out through the side door, trophy in hand...':'You slip out through the side door...']],on:()=>{A.clap=.5;A.out=1},cam:u=>shots.wide(1-u)});
 const go=i=>{if(S_[A.si]&&S_[A.si].off)S_[A.si].off();A.si=i;A.t=0;A.li=0;A.typed=0;A.hold=-1;A.lt=0;const s=S_[i];s.on&&s.on();if(s.line)s.line(0);if(s.lines.length){$c('awcap').style.display='block';awLine()}else $c('awcap').style.display='none'};
 const awLine=()=>{const s=S_[A.si],l=s.lines[A.li];if(!l)return;$c('awwho').textContent=l[0]||'';A.typed=0;A.hold=-1};
 const next=()=>{const s=S_[A.si];if(A.si>=S_.length-1)return finish();go(A.si+1)};
 const adv=()=>{if(A.end)return;const s=S_[A.si],l=s.lines[A.li];if(l&&A.typed<l[1].length){A.typed=l[1].length;return}if(A.li<s.lines.length-1){A.li++;if(s.line)s.line(A.li);awLine()}else if(!(s.done&&!s.done())&&A.t>1)next()};
 const finish=()=>{if(A.end)return;A.end=true;A.clap=0;A.free=null;hint.style.display='none';mk.visible=false;const R2=awS();let won=!!WIN.sc&&WIN.you;
  const rows=F0.field.map((x,i)=>`<tr style="${x.you?'color:#7fe3ff;font-weight:bold':''}"><td>${i+1}</td><td>${esc(x.n)}</td><td style="opacity:.8">${esc(x.t)}</td><td align=right>${x.sc}</td></tr>`).join('');
  if(won){S.inv=S.inv||{};S.inv.trophy=(S.inv.trophy||0)+1;R2.wins++}R2.hist.push({day:S.day,won:!!won,w:WIN.n,sc:F0.me,top:WIN.sc});
  const r=$c('awres');r.style.display='flex';$c('awcap').style.display='none';r.innerHTML=`<div style="background:#14091c;border:3px solid #c9a227;border-radius:6px;padding:20px 26px;max-width:min(580px,94vw);color:#fff;text-align:center"><h2 style="color:#f6d86a;margin:0 0 8px">${won?'🏆 YOU WON SONG OF THE YEAR!':'Song of the Year: '+esc(WIN.n)}</h2>
   <p style="margin:4px 0 10px;opacity:.9;font:14px/1.4 ui-monospace,monospace">${won?'A Gramophone Trophy has been added to your Storage. Place it in your house from the Storage menu.':'You were beaten out. A song with better mix quality and more streams gives you a shot next time.'}</p>
   <table style="width:100%;border-collapse:collapse;font:14px ui-monospace,monospace;text-align:left"><tr style="opacity:.6"><td></td><td>Artist</td><td>Song</td><td align=right>Score</td></tr>${rows}</table><button id=awlv class=go style="margin-top:14px;padding:10px 22px;font-size:15px">Leave</button></div>`;
  $c('awlv').onclick=()=>awEnd(won)};
 O.kd=e=>{if(A.end)return;if(A.free)return;if([' ','Enter','ArrowRight'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();adv()}else if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();finish()}};
 addEventListener('keydown',O.kd,true);$c('awcap').onclick=adv;$c('awskip').onclick=()=>finish();
 /* per-frame */
 O.tick=dt=>{A.t+=dt;A.lt+=dt;const s=S_[A.si];if(!s)return;
  const l=s.lines[A.li];if(l&&!A.end){if(A.typed<l[1].length){A.typed=Math.min(l[1].length,A.typed+dt*46);$c('awtxt').textContent=l[1].slice(0,Math.floor(A.typed))}else{$c('awtxt').textContent=l[1];if(A.hold<0)A.hold=.9+l[1].length*.03;A.hold-=dt;if(A.hold<=0){if(A.li<s.lines.length-1){A.li++;if(s.line)s.line(A.li);awLine()}else A.hold=0}}}
  if(!A.end&&A.li>=s.lines.length-1&&l&&A.typed>=l[1].length&&A.hold<=0&&A.t>=s.min&&!(s.done&&!s.done()))next();
  if(s.tick)s.tick(dt);
  /* camera */
  const u=Math.min(1,A.t/(s.min||5)),sh=s.cam(u,s);A.cam.p=sh.p;A.cam.l=sh.l;const C=O.cam;C.aspect=aspect();C.updateProjectionMatrix();C.position.set(O.ox+sh.p[0],sh.p[1],O.oz+sh.p[2]);C.lookAt(O.ox+sh.l[0],sh.l[1],O.oz+sh.l[2]);
  /* crowd: clap, stand */
  const tc=A.clap,ts=A.stand;A.cl+=(tc-A.cl)*Math.min(1,dt*4);A.st=(A.st||0)+(ts-(A.st||0))*Math.min(1,dt*3);
  aud.forEach(p=>{const cl=A.cl,sw=Math.sin(A.t*12+p.ph)*.3,up=A.st>.25+p.so*.6;if(up!=!!p.up){p.up=up?1:0;p.legs.forEach(l=>l.rotation.x=up?0:-1.45)}
   const cheer=A.cheer>0?1:0,hop=up?Math.abs(Math.sin(A.t*(cheer?9:5)+p.ph))*(cheer?.16:.05)*Math.max(.3,cl):0;p.g.position.y=(up?0:-.3)+hop;
   const raise=cheer?-2.7+sw*.5:-1.25*cl+sw*cl;p.arms[0].rotation.x=p.arms[1].rotation.x=raise;p.arms[0].rotation.z=(cheer?.2:.35)*cl;p.arms[1].rotation.z=-(cheer?.2:.35)*cl;
   if(A.look){const dx=A.look[0]-p.seat[0],dz=A.look[1]-p.seat[1],ty=Math.atan2(dx,dz),d=ty-p.g.rotation.y;p.g.rotation.y+=Math.atan2(Math.sin(d),Math.cos(d))*Math.min(1,dt*3)*(up?1:.5)}else{const d=Math.PI-p.g.rotation.y;p.g.rotation.y+=Math.atan2(Math.sin(d),Math.cos(d))*Math.min(1,dt*3)}});
  A.cheer=Math.max(0,(A.cheer||0)-dt);
  /* seated people clap too */
  F0.field.forEach(x=>{const c=x.c;if(c===wc&&A.si>=6)return;if(c.g.position.y<0){const k=A.cl;c.arms[0].rotation.x=c.arms[1].rotation.x=-1.2*k+Math.sin(A.t*12+c.seat[0])*.3*k}});
  hn.forEach(h=>{if(h.g.visible&&A.si!=8&&!(h===presB&&pt.visible)){const k=A.cl;h.arms[0].rotation.x=h.arms[1].rotation.x=k>.4?-1.2+Math.sin(A.t*12)*.25:0}});
  oth.forEach(c=>{if(c.g.visible)c.arms[1].rotation.x=-3.1});
  /* lights, beams, pillars, flashes, confetti */
  L[1].intensity=2.1+Math.sin(A.t*2)*.25;L[2].intensity=1.3+Math.sin(A.t*3)*.4;L[3].intensity=1.3+Math.cos(A.t*3)*.4;
  {const f=A.free,w=A.walk,tx=f?f.x:w&&!w.done?w.pos[0]:0,tz=f?f.z:w&&!w.done?w.pos[1]:-8;spot.visible=A.si>=5;spot.position.x+=(tx-spot.position.x)*Math.min(1,dt*4);spot.position.z+=(tz-spot.position.z)*Math.min(1,dt*4);spot.position.y=13;spot.lookAt&&0}
  beams.forEach((m,i)=>{m.rotation.z=Math.sin(A.t*.9+i*1.3)*.5;m.rotation.x=Math.cos(A.t*.7+i)*.3});pil.forEach((m,i)=>m.material.color.setHSL((A.t*.15+i*.4)%1,.9,.55));
  flashes.forEach(m=>{m.visible=A.cl>.3&&Math.random()<.08;if(m.visible)m.position.set(R(-14,14),R(1.8,4),R(6,17))});
  for(let i=0;i<NC;i++){const j=i*3;if(cp[j+1]>-40){cp[j]+=cv[j]*dt;cp[j+1]+=cv[j+1]*dt;cp[j+2]+=cv[j+2]*dt;cv[j]+=Math.sin(A.t*3+i)*dt;if(cp[j+1]<0)cp[j+1]=-50}}cg.attributes.position.needsUpdate=true;cg.attributes.color.needsUpdate=true;
  /* applause sound */
  const ca=O.clapA;if(ca&&!O.clapFail){const v=(typeof FX!='undefined'&&!FX)?0:Math.min(1,A.cl*.85+(A.cheer>0?.15:0));ca.volume=Math.max(0,Math.min(1,v));if(v>.04&&ca.paused)ca.play().catch(()=>{});else if(v<=.03&&!ca.paused)ca.pause()}
  else{A.lastClap-=dt;if(A.cl>.2&&A.lastClap<=0){A.lastClap=.07;nz(.06,1800+R(0,2400),.2*A.cl,1,'bandpass')}}
  /* fades */
  const f=$c('awfade');if(A.si==0&&A.t<.6)f.style.opacity=1-A.t/.6;else if(A.out)f.style.opacity=Math.min(1,A.t/2.8);else if(!A.end)f.style.opacity=A.si==0?0:f.style.opacity>.05?0:0};
 try{O.clapA=new Audio('audio/applause.mp3');O.clapA.loop=true;O.clapA.volume=0;O.clapA.onerror=()=>{O.clapFail=1}}catch(e){O.clapFail=1}
 O.res=0;return go
}
function awEnd(won){const O=AWC;try{if(O.clapA){O.clapA.pause();O.clapA=null}}catch(e){}removeEventListener('keydown',O.kd,true);if(O.wrap)O.wrap.remove();if(O.g)scene.remove(O.g);O.on=0;scene.background=O.bg;if(O.fog!==undefined)scene.fog=O.fog;$('hud').style.display=O.hud;AWP=null;mode='play';
 try{if(IN)leaveShop()}catch(e){}if(won)say('You won a Gramophone Trophy! It is in Storage.');try{autoSave()}catch(e){}}
let AWP=null;
function awRng(s){return()=>(s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,((s^s>>>7)>>>0)/4294967296)}
function awPlay(F0,song){const O=AWC;O.bg=scene.background;O.fog=scene.fog;scene.background=new THREE.Color(0x07040d);scene.fog=null;O.hud=$('hud').style.display;$('hud').style.display='none';mode='cutawd';O.on=1;AWP=1;const go=awShow(F0,song);O.go=go;go(0)}
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(AWC.on&&c===cam&&AWC.cam)return r0(sc,AWC.cam);return r0(sc,c)}}
{const u0=update;update=function(dt){u0(dt);if(AWC.on&&AWC.tick){try{AWC.tick(dt)}catch(e){console.error('awards show',e);awEnd(false)}}}}
