/* WaveFern dev: Gramophone Awards, part 1 (calendar, notifications, nominations, the guest list desk, rewards).
   Only loaded on /dev/ (see dev/index.html). The live game is untouched. Add ?noawards to the address to skip it.
   - The ceremony is now a yearly event: it happens on every 30th day (the ceremony number matches the old banner), and the
     hall only opens that day. Players at the fame level get a WaveFern Team notification a week before (with their
     nominations), the day before, and on the day, plus a small "Awards tonight" tag on screen until they attend.
   - Nominations come from your catalogue: Song of the Year (always), Record of the Year (your 2nd best song), Album of
     the Year (if you have an album) and Best New Artist (your first two ceremonies). Rivals are fixed per ceremony, so
     what the notification shows is exactly what you face.
   - Every win pays money, followers and a stream boost on the song, and adds a Gramophone Trophy to Storage.
   Part 2 (dev-awards-show-v1.js) is the 3D hall and the ceremony itself. */
(function(){
 if(!window.FW_FEAT)return;
 if(/[?&]noawards/.test(location.search))return;
 const X=window.AWX={};
 const YEAR=30,CAT_ORDER=['bna','alb','roty','soty'];
 const safe=(f,tag)=>{try{return f()}catch(e){console.error('awards+ '+(tag||''),e)}};
 const ready=()=>typeof S==='object'&&S&&S.artist&&typeof AW!=='undefined'&&typeof awS==='function';
 const fmt=n=>Math.round(n).toLocaleString();

 /* ---------- calendar ---------- */
 X.next=()=>{const d=S.day||1;return d%YEAR===0?d:(Math.floor(d/YEAR)+1)*YEAR};
 X.days=()=>X.next()-(S.day||1);
 X.no=()=>40+X.next()/YEAR;
 X.tonight=()=>X.days()===0;
 X.elig=()=>safe(()=>fameLevel()>=AW.need,'elig')||false;
 X.attended=()=>awS().att===X.next();
 X.open=()=>!!S.cheat||(X.tonight()&&!X.attended());
 X.ord=n=>n+(['th','st','nd','rd'][(n%100>10&&n%100<14)?0:Math.min(n%10,4)>3?0:n%10]||'th');

 /* ---------- nominations (same every time for one ceremony) ---------- */
 X.songs=()=>(S.songs||[]).slice().sort((a,b)=>awSongScore(b)-awSongScore(a));
 X.noms=function(){
  const A=awS(),sg=X.songs();if(!sg.length)return[];
  const no=X.no(),r=awRng(no*7919+17),pool=AW.pool.map(p=>[r(),p]).sort((a,b)=>a[0]-b[0]).map(q=>q[1]);
  let off=0;
  const rivals=mod=>{const o=[];for(let k=0;k<4;k++){const p=pool[(off+k)%pool.length];o.push({n:p[0],t:p[2],sc:Math.round(p[1]+mod+(r()*18-9)),you:0})}off+=4;return o};
  const mk=(id,name,w,title,me,mod,extra)=>{const rv=rivals(mod);if(S.cheat)me=Math.max(me,...rv.map(q=>q.sc))+5;
   const f=rv.concat([{n:S.artist,t:title,sc:me,you:1}]).sort((a,b)=>b.sc-a.sc);return Object.assign({id,name,w,t:title,me,field:f,win:f[0],won:!!f[0].you},extra||{})};
  const out={};
  if((A.tries||0)<2)out.bna=mk('bna','Best New Artist',1.5,sg[0].title,awSongScore(sg[0])+2,-14,{song:sg[0]});
  const al=(S.albums||[]).map(a=>{const so=a.songs.map(id=>(S.songs||[]).find(s=>s.id==id)).filter(Boolean);return{a,so,sc:so.length?so.reduce((t,s)=>t+awSongScore(s),0)/so.length:0}}).filter(q=>q.so.length).sort((p,q)=>q.sc-p.sc)[0];
  if(al)out.alb=mk('alb','Album of the Year',2,al.a.name,Math.round(al.sc+4),-2,{song:al.so[0],songs:al.so});
  if(sg[1])out.roty=mk('roty','Record of the Year',2,sg[1].title,awSongScore(sg[1]),-4,{song:sg[1]});
  out.soty=mk('soty','Song of the Year',3,sg[0].title,awSongScore(sg[0]),0,{song:sg[0]});
  const oth=['Best Rap Performance','Best Dance Recording','Best Rock Song','Best Pop Vocal Album','Best R&B Performance','Best Country Song'].map(n=>[r(),n]).sort((a,b)=>a[0]-b[0]).slice(0,3).map(q=>q[1]);
  const others=oth.map((n,k)=>{const p=pool[(off+k)%pool.length];return{name:n,n:p[0],t:p[2]}});
  const perf=[pool[(off+3)%pool.length],pool[(off+4)%pool.length]].map(p=>({n:p[0],t:p[2]}));
  const pres=[0,1,2,3,4,5,6,7].map(k=>pool[(off+5+k)%pool.length][0]);
  const host=AW.host[Math.floor(r()*AW.host.length)],host2=AW.host[(AW.host.indexOf(host)+1)%AW.host.length];
  return{list:CAT_ORDER.filter(k=>out[k]).map(k=>out[k]),others,perf,pres,hosts:[host,host2],no};
 };

 /* ---------- rewards ---------- */
 X.reward=function(c){
  const money=Math.round(Math.max(15000,(S.earn||0)*.02)*c.w),fol=Math.round(Math.max(5000,(S.followers||0)*.03)*c.w);
  const so=c.songs||[c.song];let str=0;so.forEach(s=>{if(!s)return;const add=Math.round((s.streams||0)*.08*c.w+2000*c.w);s.streams=(s.streams||0)+add;s.today=(s.today||0)+add;str+=add});
  S.money=+((S.money||0)+money).toFixed(2);S.earn=(S.earn||0)+money;S.followers=(S.followers||0)+FOLN(fol);S.streams=(S.streams||0)+str;S.interest=Math.min(1,(S.interest||0)+.1*c.w/3);
  S.inv=S.inv||{};S.inv.trophy=(S.inv.trophy||0)+1;const A=awS();A.wins=(A.wins||0)+1;(A.cab=A.cab||[]).push({c:c.name,day:S.day,t:c.t,no:X.no()});
  return{money,fol,str}};

 /* ---------- notifications ---------- */
 const mail=b=>safe(()=>{if(Array.isArray(S.msgs))S.msgs.push({id:S.nid++,from:'WaveFern Team',body:b,state:9,unread:1,day:S.day})},'mail');
 const css=document.createElement('style');
 css.textContent=`#awnote{position:fixed;left:50%;top:12px;transform:translate(-50%,-140%);z-index:9500;width:min(520px,calc(100vw - 24px));box-sizing:border-box;background:#241526;color:#efe2c8;border:2px solid #000;border-top:4px solid #c79a3e;box-shadow:4px 4px 0 #0009;font:13px/1.45 ui-monospace,Menlo,Consolas,monospace;padding:12px 14px;transition:transform .45s cubic-bezier(.2,.8,.2,1);cursor:default}
#awnote.in{transform:translate(-50%,0)}#awnote b.h{display:block;font:12px Silkscreen,ui-monospace,monospace;letter-spacing:1px;color:#e6c473;margin-bottom:4px}#awnote p{margin:2px 0 8px}
#awnote button{font:11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;background:#3a2238;color:#efe2c8;border:2px solid #000;padding:6px 10px;margin-right:6px;cursor:pointer}#awnote button:hover{background:#4a2c48}
#awpill{position:fixed;left:50%;top:6px;transform:translateX(-50%);z-index:900;background:#241526;color:#e6c473;border:2px solid #000;border-bottom:3px solid #c79a3e;font:10px Silkscreen,ui-monospace,monospace;letter-spacing:1px;padding:4px 10px;display:none;pointer-events:none;white-space:nowrap}`;
 document.head.appendChild(css);
 let note=null,pill=null;
 const hideNote=()=>{if(note){note.classList.remove('in');const n=note;setTimeout(()=>n.remove(),500);note=null}};
 const showNote=(h,p,btns,ms)=>safe(()=>{hideNote();const d=document.createElement('div');d.id='awnote';d.innerHTML=`<b class=h>${h}</b><p>${p}</p>`+(btns||[]).map((b,i)=>`<button data-i=${i}>${b[0]}</button>`).join('');
  d.querySelectorAll('button').forEach(bt=>bt.onclick=()=>{const f=btns[+bt.dataset.i][1];hideNote();f&&f()});document.body.appendChild(d);note=d;requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('in')));
  if(ms)setTimeout(()=>{if(note===d)hideNote()},ms)},'note');
 const nomLine=n=>n.list.map(c=>c.name).join(', ');
 const stageOf=d=>d===0?'day':d===1?'eve':d<=7?'nom':'';
 function announce(){
  if(!ready())return;const d=X.days(),st=stageOf(d);if(!st)return;const A=awS(),key=X.next()+':'+st;if(A.ns===key)return;
  if(X.attended()&&st!=='nom'){A.ns=key;return}
  if(!X.elig()){if(st==='day'){A.ns=key;showNote('GRAMOPHONE AWARDS TONIGHT','The '+X.ord(X.no())+' Gramophone Awards are on tonight. Invite only: reach Fame Level '+AW.need+' to get a seat.',[['OK']],9000)}return}
  A.ns=key;const n=X.noms();if(!n.list)return;
  if(st==='nom'){mail('The nominations for the '+X.ord(n.no)+' Gramophone Awards are in, and you are on the list: '+nomLine(n)+'. The ceremony is in '+d+' day'+(d==1?'':'s')+' (day '+X.next()+'). Be at the Gramophone Awards hall that day.');
   showNote('YOU ARE NOMINATED','The '+X.ord(n.no)+' Gramophone Awards: '+nomLine(n)+'. The ceremony is in '+d+' day'+(d==1?'':'s')+'.',[['OK']],11000)}
  else if(st==='eve'){mail('Reminder: the '+X.ord(n.no)+' Gramophone Awards are tomorrow night. Doors open for nominees at the hall on the east side of the city. Dress sharp.');
   showNote('AWARDS TOMORROW','The '+X.ord(n.no)+' Gramophone Awards are tomorrow. You are up for '+n.list.length+' award'+(n.list.length==1?'':'s')+'.',[['OK']],9000)}
  else{mail('Tonight is the night: the '+X.ord(n.no)+' Gramophone Awards. Head to the hall on the east side of the city and check in with Vivian at the guest list. You are nominated for '+nomLine(n)+'.');
   showNote('GRAMOPHONE AWARDS TONIGHT','The '+X.ord(n.no)+' ceremony is today and you are nominated for '+nomLine(n)+'. Check in at the hall before the day ends.',[['Where is it?',()=>safe(()=>say('The hall is on the east side of the city, on the empty lot past Nova Mall. Open the map with N.'))],['Later']],14000)}
 }
 function pillTick(){
  if(!pill){pill=document.createElement('div');pill.id='awpill';document.body.appendChild(pill)}
  const on=ready()&&X.elig()&&X.tonight()&&!X.attended()&&typeof mode!=='undefined'&&mode==='play';
  pill.style.display=on?'block':'none';if(on)pill.textContent='GRAMOPHONE AWARDS TONIGHT'}
 let lastDay=-1;
 setInterval(()=>{safe(()=>{if(!ready())return;if(S.day!==lastDay){lastDay=S.day;announce();X.refresh&&X.refresh()}pillTick()},'tick')},1000);

 /* ---------- the guest list desk ---------- */
 function listRows(n){return n.list.map(c=>{const rv=c.field.filter(f=>!f.you);
  return`<div style="border:2px solid #000;border-left:4px solid #c79a3e;background:#1a0f1e;margin:6px 0;padding:8px 10px"><b style="color:#e6c473">${c.name}</b><div style="opacity:.8;margin:2px 0 4px">Your entry: <span style="color:#efe2c8">${esc(c.t)}</span> · score ${c.me}</div><div style="opacity:.6;font-size:12px">Against ${rv.map(q=>esc(q.n)).join(', ')}</div></div>`}).join('')}
 function awTalk2(){
  if(mode!=='play')return;const A=awS(),sg=X.songs(),d=X.days(),n=X.noms(),open=X.open();let body;
  if(!sg.length)body='<p>"You need a released song to be on the list. Come back with something we can nominate."</p>';
  else if(!X.elig()&&!S.cheat)body='<p>"The list is invite only. Come back at Fame Level '+AW.need+'."</p>';
  else if(X.attended()&&!S.cheat)body=`<p>"What a night, ${esc(S.artist)}. The next ceremony, the ${X.ord(X.no()+1)}, is in <b>${YEAR}</b> days."</p>`;
  else if(!open)body=`<p>"${esc(S.artist)}, welcome. The ${X.ord(n.no)} Gramophone Awards are in <b>${d}</b> day${d==1?'':'s'}, on day ${X.next()}. The doors open that day only. This is who you are up for."</p>${listRows(n)}`;
  else body=`<p>"${esc(S.artist)}! You're on the list for tonight, the ${X.ord(n.no)} Gramophone Awards. ${n.list.length} nomination${n.list.length==1?'':'s'}. Good luck."</p>${listRows(n)}<p class=m style="margin-top:8px">Score is mix quality plus a streams bonus. Only the single highest score wins each award.</p>`;
  const cab=(A.cab||[]).length;
  mode='menu';$('ui').innerHTML=`<div class="box modal" style="width:min(560px,94vw);max-height:90vh;overflow:auto;border:3px solid #c79a3e;background:#150c1a"><h2 style="color:#e6c473">Gramophone Awards · Guest list</h2><p class=m>${A.tries?`Ceremonies attended: ${A.tries} · Trophies won: ${A.wins||0}${cab?' · '+cab+' in your cabinet':''}`:'The biggest night in music.'}</p>${body}
  <div class=row2>${sg.length&&open?'<button class=go onclick="awGo()">Take your seat · Start the ceremony</button>':''}<button onclick="closeUI()">Not now</button></div></div>`}
 function awGo2(){
  if(!ready()||!X.open())return;const n=X.noms();if(!n.list)return;const A=awS();A.att=X.next();A.tries=(A.tries||0)+1;A.last=S.day;closeUI();mode='menu';hideNote();
  safe(()=>{awPlay(n)},'play')}
 X.talk=awTalk2;
 window.awGo=awGo2;

 /* ---------- the building out front: tonight sign and a crowd on the day ---------- */
 let crowd=null,crowdDay=-1,signMesh=null,signKey='';
 function findSign(){return scene.children.find(o=>o.isMesh&&Math.abs(o.position.x-AWB.cx)<.1&&Math.abs(o.position.y-6.9)<.05&&Math.abs(o.position.z-(AWB.z1+2.9))<.1)}
 function exterior(){
  if(typeof AWB==='undefined'||!AWB.on||!ready())return;
  const tonight=X.tonight(),key=(tonight?'t':'n')+X.next()+':'+(X.days());
  if(key!==signKey){signKey=key;const old=signMesh||findSign();
   const txt=tonight?'TONIGHT · THE '+X.no()+'TH GRAMOPHONE AWARDS':'NEXT CEREMONY IN '+X.days()+' DAY'+(X.days()==1?'':'S');
   const s=ixSign(txt,'#efe2c8','#4a1224',10.6,.7,{border:'#c79a3e'});s.position.set(AWB.cx,6.9,AWB.z1+2.9);scene.add(s);if(old){scene.remove(old);old.visible=false}signMesh=s}
  if(tonight&&crowdDay!==X.next()){clearCrowd();crowdDay=X.next();crowd=new THREE.Group();scene.add(crowd);const r=awRng(X.next()*31+7),pk=a=>a[Math.floor(r()*a.length)];
   const spots=[];for(let k=0;k<9;k++){spots.push([AWB.cx-3.4-r()*3.2,AWB.z1+5.4+k*.9+r()*.3,1]);spots.push([AWB.cx+3.4+r()*3.2,AWB.z1+5.4+k*.9+r()*.3,-1])}
   spots.forEach(q=>{const cf={skin:Math.floor(r()*SKIN.length),eyes:Math.floor(r()*5),mouth:Math.floor(r()*4),hair:Math.floor(r()*12),hc:Math.floor(r()*HAIRC.length),top:pk([0,2,2,3,5,7]),tc:Math.floor(r()*TOPC.length),pc:Math.floor(r()*PANTC.length),bt:pk([0,0,3]),body:r(),ac:-1};
    const c=buildChar(cf);c.g.position.set(q[0],0,q[1]);c.g.rotation.y=q[2]>0?Math.PI/2+.3*(r()-.5):-Math.PI/2+.3*(r()-.5);c.g.scale.setScalar(.98);crowd.add(c.g);
    if(r()<.4){c.arms[1].rotation.x=-2.4;B(c.arms[1],.12,.22,.08,'#111',0,-.5,.1)}})}
  if(!tonight&&crowd)clearCrowd()}
 function clearCrowd(){if(crowd){scene.remove(crowd);crowd=null}crowdDay=-1}
 X.refresh=()=>safe(()=>{exterior();board&&boardDraw()},'refresh');
 setInterval(()=>safe(exterior,'ext'),2500);

 /* ---------- nominations board in the lobby ---------- */
 let board=null,boardCtx=null,boardTex=null,boardKey='';
 function boardDraw(){
  if(!boardCtx)return;const n=ready()&&X.elig()?X.noms():null,k=(S.day||0)+':'+(n&&n.list?n.list.map(c=>c.id+c.me).join():'');if(k===boardKey)return;boardKey=k;
  const x=boardCtx,W=512,H=360;x.fillStyle='#1b0f20';x.fillRect(0,0,W,H);x.strokeStyle='#c79a3e';x.lineWidth=6;x.strokeRect(8,8,W-16,H-16);
  x.textAlign='center';x.fillStyle='#e6c473';x.font='bold 30px Silkscreen,ui-monospace,monospace';x.fillText('NOMINEES',W/2,56);
  x.fillStyle='#efe2c8';x.font='bold 20px Silkscreen,ui-monospace,monospace';
  if(!n||!n.list||!n.list.length){x.fillText('Next ceremony',W/2,140);x.font='bold 54px Silkscreen,ui-monospace,monospace';x.fillStyle='#e6c473';x.fillText('DAY '+X.next(),W/2,215);x.font='16px ui-monospace,monospace';x.fillStyle='#b9a98a';x.fillText(X.elig()?'Release a song to be nominated':'Invite only · Fame Level '+AW.need,W/2,270)}
  else{x.textAlign='left';n.list.forEach((c,i)=>{const y=100+i*62;x.fillStyle='#e6c473';x.font='bold 19px Silkscreen,ui-monospace,monospace';x.fillText(c.name.toUpperCase(),32,y);x.fillStyle='#efe2c8';x.font='17px ui-monospace,monospace';let t=c.t;while(x.measureText(t).width>440&&t.length>6)t=t.slice(0,-2);x.fillText('"'+t+(t!==c.t?'…':'')+'"',32,y+24)});
   x.textAlign='center';x.fillStyle='#b9a98a';x.font='15px ui-monospace,monospace';x.fillText(X.tonight()?'TONIGHT':'Ceremony in '+X.days()+' day'+(X.days()==1?'':'s')+' · day '+X.next(),W/2,H-24)}
  boardTex.needsUpdate=true}
 function mkBoard(){
  if(board||typeof AW==='undefined'||AW.i==null||typeof IG==='undefined'||!IG[AW.i])return;
  const s=SHOPS[AW.i],cv=document.createElement('canvas');cv.width=512;cv.height=360;boardCtx=cv.getContext('2d');boardTex=new THREE.CanvasTexture(cv);boardTex.minFilter=THREE.LinearFilter;
  board=new THREE.Mesh(new THREE.PlaneGeometry(2.1,1.48),new THREE.MeshBasicMaterial({map:boardTex}));board.position.set(s.ox+5,1.75,320+.07);IG[AW.i].add(board);
  const fr=new THREE.Mesh(new THREE.BoxGeometry(2.24,1.62,.05),M('#8a6a2a'));fr.position.set(s.ox+5,1.75,320+.04);IG[AW.i].add(fr);boardDraw()}

 /* ---------- hook into the game ---------- */
 function install(){
  const it=INT.find(q=>q.l&&/Vivian/.test(q.l));if(!it||typeof AWB==='undefined'||!AWB.on)return false;
  it.a=awTalk2;mkBoard();return true}
 (function wait(n){if(!safe(install,'install')&&n<240)setTimeout(()=>wait(n+1),500)})(0);

 /* ---------- dev panel buttons ---------- */
 (function panel(n){const box=document.getElementById('fwdvb');if(!box){if(n<40)setTimeout(()=>panel(n+1),500);return}
  const h=document.createElement('h5');h.textContent='Gramophone Awards';box.appendChild(h);
  const st=document.getElementById('fwdvs'),say2=t=>{if(st)st.textContent=t};
  const add=(l,f)=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>{if(!ready())return say2('Start or load a career first.');safe(f,l)};box.appendChild(b)};
  add('Awards: 7 days before ceremony',()=>{S.day=X.next()-7;S.t=0;say2('Day '+S.day+': notice comes in a second')});
  add('Awards: 1 day before ceremony',()=>{S.day=X.next()-1;S.t=0;say2('Day '+S.day)});
  add('Awards: jump to ceremony day',()=>{S.day=X.next();S.t=0;awS().att=0;say2('Day '+S.day+': the hall is open tonight')});
  add('Awards: unlock fame, songs, album',()=>{cheat();say2('Test career applied')});
  add('Awards: start the ceremony now',()=>{const n=X.noms();if(!n.list)return say2('Release a song first.');closeUI&&closeUI();mode='menu';awPlay(n);say2('Ceremony started')})})(0);
})();
