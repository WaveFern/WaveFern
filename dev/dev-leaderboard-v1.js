/* WaveFern leaderboard, real data from Firestore (leaderboard/{uid}); no fake rows. Adds a Leaderboard button to the main menu (and the pause menu). The screen has a tab per category: Time played, Listeners,
   Streams, Money, Fame level, Songs released, Followers. 
   All data comes from LB.board(cat), which is the one function to swap for the real cloud list later. Add ?nolb to the address to skip it. */
(function(){
 if(!window.FW_FEAT||/[?&]nolb/.test(location.search))return;
 if(typeof titleUI!='function'||typeof pauseUI!='function')return;
 const LB=window.LB={};
 const f=n=>Math.round(n||0).toLocaleString();
 const CATS=[
  {k:'day',t:'Time played',u:'days',me:()=>S.day||1,fmt:v=>f(v)+' d',max:900,pw:1.4},
  {k:'lis',t:'Listeners',u:'monthly',me:()=>S.listeners||0,fmt:f,max:80e6,pw:3.2},
  {k:'str',t:'Streams',u:'total',me:()=>S.streams||0,fmt:f,max:3e9,pw:3.4},
  {k:'mon',t:'Money',u:'now',me:()=>S.money||0,fmt:v=>'$'+f(v),max:50e6,pw:3.2},
  {k:'fame',t:'Fame level',u:'level',me:()=>{try{return fameLevel()}catch(e){return 0}},fmt:v=>'Lv '+f(v),max:60,pw:1.6},
  {k:'sg',t:'Songs released',u:'songs',me:()=>(S.songs||[]).length,fmt:f,max:400,pw:1.8},
  {k:'fol',t:'Followers',u:'total',me:()=>S.followers||0,fmt:f,max:60e6,pw:3.2}
 ];
 /* v51.8.1: a career that used test mode (cheat) or the dev test code is marked S.tainted for good and never posts to the leaderboard or the public profile, even after cheat is turned off or the code is loaded on the real game */
 window.fwTainted=()=>{try{if(S&&S.cheat&&!S.tainted)S.tainted=1;return !!(S&&(S.cheat||S.tainted))}catch(e){return false}};
 setInterval(()=>{try{window.fwTainted()}catch(e){}},1000);
 const ps0=window.fwProfileSync;if(typeof ps0=='function')window.fwProfileSync=function(){if(window.fwTainted())return Promise.resolve(0);return ps0.apply(this,arguments)};
 const meName=()=>S.artist||'You';
 /* Real data: Firestore leaderboard/{uid} = {a,day,lis,str,mon,fame,sg,fol,f,t} (see firebase-rules/live/firestore.rules).
    A signed-in player writes only their own row (from the career being played); everyone signed in reads the top rows per category. */
 const CAP=100,TTL=10000,cache={},LBS={st:'idle',err:''};
 const live=()=>typeof FBU!='undefined'&&FBU&&typeof FBF!='undefined'&&FBF&&typeof FBD!='undefined'&&FBD;
 const cl=(v,m)=>Math.max(0,Math.min(m,Math.floor(+v||0)));
 /* the name on the board: the chosen username when the profile feature provides one, else the artist name */
 const boardName=()=>{let n='';try{if(typeof fwUsername=='function')n=fwUsername()||''}catch(e){}if(!n)n=(S&&S.artist)||'';return String(n).replace(/[<>"]/g,'').slice(0,24)};
 /* only a career made after the full progress reset counts, never a trailer career or an old one */
 const eligible=()=>{try{return live()&&!window.fwTainted()&&typeof S=='object'&&S&&!FW_TRL&&typeof RS!='undefined'&&rsOn()&&S.rv>=RS.V&&mode!='creator'&&mode!='load'&&!(typeof TT!='undefined'&&TT.on&&!TT.game)&&!wiping&&!!boardName()}catch(e){return false}};
 const vals=()=>({a:boardName(),day:cl(S.day,1e5),lis:cl(S.listeners,1e12),str:cl(S.streams,1e12),mon:cl(S.money,1e12),fame:cl((()=>{try{return fameLevel()}catch(e){return 0}})(),1000),sg:cl((S.songs||[]).length,1e5),fol:cl(S.followers,1e12)});
 let lastSig='',lastAt=0,noFUntil=0,wbusy=0;
 LB.push=function(force){if(wbusy||!eligible())return Promise.resolve(0);
  const v=vals(),sig=JSON.stringify(v)+(S.fdr?1:0)+FBU.uid,n=Date.now();if(!force&&sig==lastSig&&n-lastAt<600000)return Promise.resolve(0);
  /* v49.91.0: the profile is written from the same moment, so the board and the profile never disagree */
  try{if(typeof fwProfileSync=='function')fwProfileSync(1)}catch(e){}
  const d=Object.assign({},v,{t:n});if(Date.now()>=noFUntil)d.f=S.fdr?1:0;const uid=FBU.uid;wbusy=1;
  const put=x=>FBF.setDoc(FBF.doc(FBD,'leaderboard',uid),x);
  /* v49.95.2: a refused founder flag is not kept off for the whole session: the row is written without it, and the flag is tried again after 10 minutes (so a rules update takes effect without a reload) */
  return put(d).catch(e=>{if(e&&e.code=='permission-denied'&&d.f!==undefined){noFUntil=Date.now()+600000;delete d.f;return put(d)}throw e}).then(()=>{lastSig=sig;lastAt=n;LBS.werr='';return 1},e=>{LBS.werr=(e&&e.code)||'error';console.warn('leaderboard write',LBS.werr);return 0}).finally(()=>{wbusy=0})};
 LB.load=function(k){if(!live()){LBS.st='out';return Promise.resolve()}
  const c=cache[k];if(c&&Date.now()-c.at<TTL)return Promise.resolve();
  const F=FBF,uid=FBU.uid;LBS.st='load';LBS.err='';
  return F.getDocs(F.query(F.collection(FBD,'leaderboard'),F.orderBy(k,'desc'),F.limit(CAP))).then(async sn=>{
   const rows=[];sn.forEach(d=>{const x=d.data();if(x&&typeof x.a=='string')rows.push({id:d.id,name:x.a,v:+x[k]||0,me:d.id==uid,fdr:!!x.f})});
   if(!rows.some(r=>r.me)&&rows.length>=CAP){try{const m=await F.getDoc(F.doc(FBD,'leaderboard',uid));if(m.exists()){const x=m.data();rows.push({id:uid,name:x.a,v:+x[k]||0,me:true,fdr:!!x.f,rk:CAP+'+'})}}catch(e){}}
   cache[k]={at:Date.now(),rows};LBS.st='ok'},e=>{LBS.st='err';LBS.err=(e&&e.code)||'error';cache[k]={at:Date.now()-TTL+8000,rows:[]};console.warn('leaderboard read',LBS.err)}).then(()=>{if(document.getElementById('lbd')&&CATS[cur].k==k)draw()})};
 /* returns [{name,v,me,fdr}] sorted high to low */
 LB.board=function(k){const c=cache[k];if(!c||Date.now()-c.at>=TTL)LB.load(k);return c?c.rows:[]};
 const emptyMsg=()=>!live()?'Sign in with Google to see the leaderboard and join it.':LBS.st=='err'?(LBS.err=='permission-denied'?'The leaderboard is not switched on yet.':'Could not load the leaderboard. Try again soon.'):LBS.st=='load'||LBS.st=='idle'?'Loading...':!eligible()&&0?'':'No ranked players yet.';
 /* v51.8.2: automatic clean-up. A row of your own that came from a test career is deleted without console steps: when the career in play is a test career, or when the stored row has numbers no real career can reach (listeners over 100M, fame level over 100). Done once per account and test/real state, and the board is redrawn without it. A clean real career then writes its own row as usual. Deleting your own row is allowed by the rules, so no Firebase change is needed. */
 const swept={};
 const sweep=()=>{try{if(!live()||wbusy)return;const uid=FBU.uid,t=window.fwTainted(),key=uid+(t?'T':'R');if(swept[key])return;swept[key]=1;
  FBF.getDoc(FBF.doc(FBD,'leaderboard',uid)).then(m=>{if(!m.exists())return;const x=m.data()||{};const bogus=t||(+x.lis||0)>1e8||(+x.fame||0)>100;if(!bogus)return;
   return FBF.deleteDoc(FBF.doc(FBD,'leaderboard',uid)).then(()=>{lastSig='';for(const k in cache)delete cache[k];console.log('[leaderboard] removed your test-career row');if(document.getElementById('lbd')){LB.load(CATS[cur].k)}if(!window.fwTainted())LB.push(1)})}).catch(e=>{delete swept[key];console.warn('leaderboard clean-up',(e&&e.code)||e)})}catch(e){}};
 setInterval(sweep,5000);setTimeout(sweep,1500);
 setInterval(()=>{if(!document.hidden)LB.push()},20000);
 /* v49.91.0: while the board is open it refreshes itself, so numbers move without reopening */
 setInterval(()=>{if(!document.hidden&&document.getElementById('lbd')){delete cache[CATS[cur].k];LB.load(CATS[cur].k)}},15000);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)LB.push(1)});
 addEventListener('pagehide',()=>LB.push(1));
 let cur=0,back='title',anim=1;
 const fm=()=>{try{return typeof fdMark=='function'?fdMark(13):''}catch(e){return''}};
 const css='<style>@keyframes lbIn{from{transform:translateX(-12px);opacity:0}to{transform:none;opacity:1}}@keyframes lbPop{0%{transform:scale(.7)}60%{transform:scale(1.08)}100%{transform:scale(1)}}'+
  '@keyframes lbShine{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes lbBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes lbFall{0%{transform:translateY(-10px);opacity:1}100%{transform:translateY(300px);opacity:0}}'+
  '@keyframes lbGlow{0%,100%{box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008,0 0 0 var(--g)}50%{box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008,0 0 16px var(--g)}}'+
  '#lbd{position:relative;overflow:hidden;font-family:Silkscreen,ui-monospace,monospace}#lbd.top1{border-color:var(--g);animation:lbGlow 1.6s steps(6) infinite}#lbd h2{letter-spacing:2px;text-transform:uppercase}'+
  '#lbd .cat{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0}#lbd .cat b{flex:1;text-align:center;letter-spacing:1px;text-transform:uppercase}#lbd .cat button{padding:6px 12px}#lbd .row,#lbd .pod div{cursor:pointer}#lbd .row:hover{filter:brightness(1.25)}#lbd .tabs{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:4px;margin:6px 0;padding-bottom:4px}#lbd .tabs button{white-space:nowrap;flex:none}#lbd .tabs button{padding:5px 8px;font-size:.75em}#lbd .tabs button.on{background:var(--g);color:#04120a;font-weight:700}'+
  '#lbd .ban{margin:6px 0;padding:8px;border:3px solid #000;text-align:center;font-weight:700;letter-spacing:1px;background:linear-gradient(100deg,#1a8a52 20%,#2fe68a 45%,#b8ffd9 50%,#2fe68a 55%,#1a8a52 80%) 0 0/200% 100%;color:#04120a;animation:lbShine 2.4s linear infinite,lbPop .5s steps(5)}'+
  '#lbd .ban.n{background:#161b18;color:var(--t);border-color:#000;box-shadow:inset 0 0 0 2px #2a352e;animation:none;font-weight:400;letter-spacing:0}'+
  '#lbd .pod{display:flex;align-items:flex-end;justify-content:center;gap:6px;margin:10px 0 6px}#lbd .pod div{flex:1;max-width:130px;text-align:center;border:3px solid #000;padding:6px 4px;box-shadow:inset 0 -3px #0007,3px 3px 0 #0008;animation:lbPop .45s steps(5) both}'+
  '#lbd .pod .nm{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-size:.8em}#lbd .pod .v{display:block;font-size:.7em;opacity:.85}#lbd .pod .k{font-size:1.6em;display:block;font-weight:700}'+
  '#lbd .pod .c1{background:var(--g);color:#04120a;animation:lbPop .45s steps(5) both,lbBob 1.2s steps(2) infinite}#lbd .pod .c2{background:#1a8a52;color:#04120a}#lbd .pod .c3{background:#26302a;color:var(--t)}#lbd .pod .me{outline:3px solid #fff}'+
  '#lbd .list{max-height:46vh;overflow:auto;border:3px solid #000;background:#0b0f0d;box-shadow:inset 0 0 0 2px #2a352e}#lbd .row{display:flex;align-items:center;gap:10px;padding:6px 8px;border-bottom:2px solid #000;font-size:.85em}#lbd .row.a{animation:lbIn .25s steps(4) both}#lbd .row b.r{width:2.4em;text-align:right;color:var(--m)}#lbd .row span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '#lbd .row.me{background:var(--g);color:#04120a;font-weight:700}#lbd .row.me b.r{color:#04120a}#lbd .fdm{vertical-align:middle;margin-left:4px}'+
  '#lbd .cf{position:absolute;top:0;width:6px;height:6px;pointer-events:none;animation:lbFall 2.2s steps(14) infinite}</style>';
 function podCell(x,i,c){const h=[0,18,30][i];return`<div onclick="LB.view('${x.id}')" class="c${i+1}${x.me?' me':''}" style="order:${[1,0,2][i]};padding:${i==0?16:6}px 4px ${h+6}px"><span class=k>#${i+1}</span><span class=nm>${esc(x.name)}${x.fdr?fm():''}</span><span class=v>${esc(c.fmt(x.v))}</span></div>`}
 function confetti(){const col=['#2fe68a','#1a8a52','#b8ffd9','#e8f3ec','#26302a'];let o='';for(let i=0;i<22;i++)o+=`<i class=cf style="left:${(i*4.7+((i*37)%9))%100}%;background:${col[i%5]};animation-delay:${(i%8)*.27}s"></i>`;return o}
 const tabsH=()=>`<div class=cat><button onclick="LB.tab(cur-1)" aria-label=Previous>&#9664;</button><b>${CATS[cur].t} <small>${cur+1}/${CATS.length}</small></b><button onclick="LB.tab(cur+1)" aria-label=Next>&#9654;</button></div><div class=tabs role=tablist>${CATS.map((x,i)=>`<button role=tab class="${i==cur?'on':''}" onclick="LB.tab(${i})">${x.t}</button>`).join('')}</div>`;
 function draw(){
  const c=CATS[cur],rows=LB.board(c.k);
  if(!rows.length){$('ui').innerHTML=css+`<div id=lbd class="box modal" style="width:min(460px,94vw)"><h2>Leaderboard</h2>${tabsH()}<div class="ban n">${esc(emptyMsg())}</div><p class=m><small>${c.u} · tap a player to view their profile · arrows change tab, Esc goes back</small></p><div class=row2><button class=go onclick="LB.close()">Back</button></div></div>`;return}
  const mi=rows.findIndex(x=>x.me),rk=mi+1,n=rows.length;
  
  const rkT=mi>=0&&rows[mi].rk?rows[mi].rk:rk;
  const ban=rk==1?`<div class=ban>YOU ARE #1 IN ${c.t.toUpperCase()}</div>`:rk<=3?`<div class=ban>TOP 3 IN ${c.t.toUpperCase()}: #${rk}</div>`:`<div class="ban n">You are #${rkT}${rows[mi]&&rows[mi].rk?'':' of '+n}${rk<=10?'. Top 10!':'.'} ${rows[mi-1]?'Next: '+esc(rows[mi-1].name)+' ('+esc(c.fmt(rows[mi-1].v))+')':''}</div>`;
  const rest=rows.slice(3),lastRow=[];
  $('ui').innerHTML=css+`<div id=lbd class="box modal${rk==1?' top1':''}" style="width:min(460px,94vw)">${rk<=3?confetti():''}<h2>Leaderboard</h2>
   ${tabsH()}${ban}
   <div class=pod>${[0,1,2].filter(i=>rows[i]).map(i=>podCell(rows[i],i,c)).join('')}</div>
   <div class=list>${rest.concat(lastRow).map((x,j)=>{const i=j+3;return`<div onclick="LB.view('${x.id}')" class="row${x.me?' me':''}${anim?' a':''}" style="animation-delay:${Math.min(j,12)*.03}s"><b class=r>${x.rk||i+1}</b><span>${esc(x.name)}${x.fdr?fm():''}${x.me?' (you)':''}</span><b>${esc(c.fmt(x.v))}</b></div>`}).join('')}</div>
   <p class=m><small>${c.u} · tap a player to view their profile · arrows change tab, Esc goes back</small></p><div class=row2><button class=go onclick="LB.close()">Back</button></div></div>`;
  const ab=document.querySelector('#lbd .tabs .on');if(ab)ab.scrollIntoView({block:'nearest',inline:'center'});const me=document.querySelector('#lbd .row.me');if(me&&mi>=3)me.scrollIntoView({block:'nearest'})}
 LB.view=id=>{try{if(typeof fwProfileOpen=='function')fwProfileOpen('',id)}catch(e){}};
 LB.tab=i=>{cur=(i+CATS.length)%CATS.length;draw()};
 LB.open=function(from){back=from||(typeof TT!='undefined'&&TT.on?'title':'pause');cur=0;for(const k in cache)delete cache[k];draw();LB.push(1).then(()=>{if(document.getElementById('lbd')){delete cache[CATS[cur].k];LB.load(CATS[cur].k)}});addEventListener('keydown',key,true)};
 LB.close=function(){removeEventListener('keydown',key,true);if(back=='title')titleUI();else pauseUI()};
 function key(e){if(!document.getElementById('lbd')){removeEventListener('keydown',key,true);return}
  if(e.key=='ArrowRight'||e.key=='ArrowLeft'){LB.tab(cur+(e.key=='ArrowRight'?1:-1))}
  else if(e.key=='Escape'||e.key=='Backspace'){LB.close()}else return;
  e.preventDefault();e.stopPropagation()}
 const BTN='<button onclick="LB.open()">Leaderboard</button>';
 {const t0=titleUI;titleUI=function(){t0.apply(this,arguments);try{const b=document.querySelector('#ttl .ttm button[onclick="ttSet()"]');if(b&&!document.querySelector('#ttl .ttm button[onclick="LB.open()"]'))b.insertAdjacentHTML('beforebegin',BTN)}catch(e){console.error('lb',e)}}}
 {const p0=pauseUI;pauseUI=function(){p0.apply(this,arguments);try{const b=document.querySelector('#pzm button[onclick="settings()"]');if(b)b.insertAdjacentHTML('beforebegin',BTN)}catch(e){console.error('lb',e)}}}
})();
