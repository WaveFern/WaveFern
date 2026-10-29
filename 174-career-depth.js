/* ---------- v49.2.0: deeper career ----------
   - Song direction (removed in v49.25.0): songs made before then may have a Mood and Length, saved as sd ('mood|length');
     it still shapes their daily streams (planOf), quality and followers. New songs have none.
   - Plaques: a song passing 1M / 10M / 100M / 1B streams (Gold, Platinum, Diamond, Billions Club) gets a plaque in the
     mail (a Spotifly Team message and a card) and it hangs on the studio wall. State: song.pq (tiers given), S.plq list.
   - Legacy goals for the late game, paid once (S.leg). Goals an old save already meets are marked done quietly.
   - Music friends: each collab with an artist deepens your bond (Friend 1, Close friend 3, Best friend 5 songs together).
     Friends charge less to collab, and close friends share your new releases (a day of boosted streams).
   - City finds: 12 lost tapes hidden on the pavements (S.tapes) and 3 street moments each day (S.smom) with small rewards.
   - Band rooms: with bandmates online your songs stream 12% more per extra member.
   All of it shows in a new Legacy tab in the Quests app. */
(()=>{
const FL=()=>{try{return fameLevel()||0}catch(e){return 0}};
const fmt=n=>n>=1e9?+(n/1e9).toFixed(1)+'B':n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(1)+'k':Math.floor(n).toLocaleString();
const live=()=>typeof S=='object'&&S&&S.artist&&Array.isArray(S.songs)&&!document.getElementById('load')&&mode!='load';
const mail=b=>{try{if(Array.isArray(S.msgs))S.msgs.push({id:S.nid++,from:'Spotifly Team',body:b,state:9,unread:1,day:S.day})}catch(e){}};
const card=(k,t,s,n)=>{try{glCard(k,t,s);snd('chime');setTimeout(()=>snd('cash'),180);glBurst(n||30)}catch(e){}};

/* ===== song direction ===== */
/* v49.25.0: the Mood and Length pickers are gone from the Make a song screen, so new songs have no sd. Songs and drafts
   that already have one keep its effect below. */
if(typeof mgFinish=='function'){const f0=mgFinish;mgFinish=function(){const sd=rec&&rec.sd,n=S.drafts.length;const r=f0.apply(this,arguments);
 try{if(sd&&S.drafts.length>n){const d=S.drafts[S.drafts.length-1];d.sd=sd;const l=sd.split('|')[1],q=l=='long'?5:l=='short'?-4:0;if(q&&isFinite(+d.q))d.q=Math.max(1,Math.min(100,+d.q+q))}}catch(e){}return r}}
{const u0=upl;upl=function(id){const d=S.drafts.find(x=>x.id==id),sd=d&&d.sd,n0=S.songs.length;const r=u0.apply(this,arguments);
 try{if(S.songs.length>n0){const s=S.songs[S.songs.length-1];if(sd&&s.sd==null)s.sd=sd;
  if(sd&&sd.split('|')[0]=='deep'){const f=Math.round(RI(4,12)+(S.listeners||0)*.004);S.followers=(S.followers||0)+f;say('Emotional song: +'+f.toLocaleString()+' followers')}
  friendsShare(s)}}catch(e){console.warn('release extras',e)}return r}}

/* ===== music friends (bonds from collabs) ===== */
const BL=[[5,'Best friend'],[3,'Close friend'],[1,'Friend']];
function collabs(){const c={};[...(S.songs||[]),...(S.drafts||[])].forEach(s=>{if(s&&s.ft)c[s.ft]=(c[s.ft]||0)+1});return c}
const bondLv=n=>n>=5?3:n>=3?2:n>=1?1:0,bondName=n=>(BL.find(b=>n>=b[0])||[0,'Contact'])[1];
function friendsShare(s){const c=collabs(),fr=Object.keys(c).filter(k=>bondLv(c[k])>=2&&k!==s.ft);if(!fr.length)return;
 const sh=fr.filter(k=>Math.random()<(bondLv(c[k])>=3?.8:.5)).slice(0,3);if(!sh.length)return;s.boost=Math.min(3,(s.boost||0)+sh.length);
 say(sh.join(', ')+(sh.length>1?' shared':' shared')+' "'+s.title+'" with their fans: boosted streams for '+sh.length+' day'+(sh.length>1?'s':''))}
if(typeof collabFee=='function'){const c0=collabFee;collabFee=function(i){const v=c0.apply(this,arguments);try{const a=ART[i],n=a?collabs()[a[0]]||0:0,lv=bondLv(n);if(lv&&isFinite(v))return Math.max(1,Math.round(v*(1-.1*lv)))}catch(e){}return v}}

/* ===== streams: direction and band ===== */
const bandN=()=>{try{return window.MPFX&&MPFX.on()?Math.max(1,Object.keys(MPFX.mem()||{}).length):1}catch(e){return 1}};
let bandDay=-1;
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!(v>0))return v;let m=1;
 try{if(s.sd){const[md,l]=s.sd.split('|'),age=S.day-s.day;if(md=='hype')m*=age<3?1.3:.88;else if(md=='chill')m*=age<3?.88:1.15;if(l=='short')m*=1.1;else if(l=='long')m*=.92}
  const b=bandN();if(b>1){m*=1+.12*(b-1);if(bandDay!==S.day){bandDay=S.day;say('Band together: +'+12*(b-1)+'% streams today with '+(b-1)+' bandmate'+(b>2?'s':'')+' online')}}
  if(m==1)return v;const x=(s.vx||0)+(s.fx||0),n=v-x,cap=songCap(s)-x,nv=Math.round(n*m);s.pv=x+Math.max(0,m>1?Math.min(nv,Math.max(n,Math.round(cap))):nv);return s.pv}catch(e){return v}}}

/* ===== plaques ===== */
const PQ=[[1e6,'Gold','#e6b422'],[1e7,'Platinum','#d8dde3'],[1e8,'Diamond','#9be7ff'],[1e9,'Billions Club','#1ed760']];
function plaqueTick(){if(!live())return;S.plq=Array.isArray(S.plq)?S.plq:[];
 for(const s of S.songs){const n=PQ.filter(p=>(s.streams||0)>=p[0]).length,had=s.pq||0;if(n>had){const p=PQ[had];s.pq=had+1;S.plq.push({s:s.title,t:p[1],c:p[2],n:p[0],d:S.day});
  mail('Congratulations! "'+s.title+'" passed '+fmt(p[0])+' streams. Your '+p[1]+' plaque is in the mail, and it is already hanging on your studio wall.');
  if(!document.getElementById('glr'))card('PLAQUE IN THE MAIL',p[1]+' plaque','"'+s.title+'" · '+fmt(p[0])+' streams',40+had*15);plaqueWall();return}}}
let PW=null,PWn=-1;
function plaqueWall(){try{const L=S.plq||[];if(PW&&PWn===L.length)return;PWn=L.length;if(PW){scene.remove(PW);PW=null}if(!L.length)return;PW=new THREE.Group();
 L.slice(-12).forEach((p,i)=>{const x=15.3-(i%6)*.82,y=i<6?2.3:1.45,z=.03;B(PW,.66,.8,.05,'#141414',x,y,z);B(PW,.56,.7,.02,p.c,x,y,z+.03);
  const d=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.02,20),M(p.c=='#d8dde3'?'#f4f4f4':p.c));d.rotation.x=Math.PI/2;d.position.set(x,y+.08,z+.05);PW.add(d);B(PW,.07,.07,.02,'#141414',x,y+.08,z+.065);B(PW,.4,.08,.02,'#f4f1e8',x,y-.24,z+.05)});
 scene.add(PW)}catch(e){console.warn('plaques',e)}}

/* ===== legacy goals ===== */
const LG=[['s25','Release 25 songs',()=>S.songs.length,25,2000],['s100','Release 100 songs',()=>S.songs.length,100,15000],
 ['al3','Release 3 albums',()=>Array.isArray(S.albums)?S.albums.length:0,3,8000],['l1m','1M monthly listeners',()=>S.listeners||0,1e6,10000],
 ['l50m','50M monthly listeners',()=>S.listeners||0,5e7,75000],['st1b','1B total streams',()=>S.streams||0,1e9,100000],
 ['pq1','Earn your first plaque',()=>(S.plq||[]).length,1,3000],['pq10','Earn 10 plaques',()=>(S.plq||[]).length,10,40000],
 ['bil','Join the Billions Club',()=>(S.plq||[]).filter(p=>p.n>=1e9).length,1,150000],['bf3','Best friends with 3 artists',()=>Object.values(collabs()).filter(n=>n>=5).length,3,12000],
 ['tp12','Find all 12 lost tapes',()=>Object.keys(S.tapes||{}).length,12,5000],['fl25','Reach Fame Level 25',FL,25,50000]];
function legTick(){if(!live())return;const first=!S.leg;S.leg=S.leg||{};
 for(const[id,n,f,t,r]of LG){if(S.leg[id])continue;let v=0;try{v=+f()||0}catch(e){}if(v<t)continue;S.leg[id]=first?2:1;if(first)continue;
  S.money=+((+S.money||0)+r).toFixed(2);if(!document.getElementById('glr'))card('LEGACY GOAL',n,'+$'+r.toLocaleString(),60);mail('Legacy goal reached: '+n+'. $'+r.toLocaleString()+' has been paid to you.');return}}

/* ===== city finds ===== */
const TAPES=12;let FG=null,FM=[],FK='';
const paths=()=>typeof VPED!='undefined'&&Array.isArray(VPED)?VPED.filter(v=>isFinite(v.x)&&isFinite(v.mn)&&isFinite(v.mx)):[];
function seeded(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function spot(r,ps){const v=ps[Math.floor(r()*ps.length)];return{x:v.x,z:v.mn+(v.mx-v.mn)*(.1+.8*r())}}
function mkTape(g,c){const m=new THREE.Group();B(m,.5,.32,.1,c,0,0,0);B(m,.36,.12,.11,'#f4f1e8',0,.04,0);[-.1,.1].forEach(x=>B(m,.07,.07,.12,'#141414',x,-.05,0));g.add(m);return m}
function finds(){const ps=paths();if(!ps.length)return[];const out=[],r=seeded('wf-tapes');S.tapes=S.tapes||{};
 for(let i=0;i<TAPES;i++){const p=spot(r,ps);if(!S.tapes[i])out.push({k:'t',i,x:p.x,z:p.z})}
 const m=S.smom&&S.smom.d===S.day?S.smom:(S.smom={d:S.day,got:{}}),r2=seeded('wf-street-'+S.day);for(let i=0;i<3;i++){const p=spot(r2,ps);if(!m.got[i])out.push({k:'m',i,x:p.x,z:p.z})}return out}
function findsBuild(){const k=S.day+'|'+Object.keys(S.tapes||{}).length+'|'+Object.keys((S.smom||{}).got||{}).length;if(FG&&k===FK)return;FK=k;if(FG)scene.remove(FG);FG=new THREE.Group();FM=finds().map(f=>{const m=mkTape(FG,f.k=='t'?'#e84393':'#2fe68a');m.position.set(f.x,.7,f.z);return Object.assign(f,{m})});scene.add(FG)}
const outdoors=()=>mode=='play'&&!IN&&!(window.DCITY&&DCITY.on)&&!(typeof P!='undefined'&&P.sit);
function collect(f){const fl=FL();if(f.k=='t'){S.tapes[f.i]=S.day;const n=Object.keys(S.tapes).length,c=Math.round(60*(1+fl*.3)),fo=RI(5,20)+Math.round((S.listeners||0)*.002);S.money=+((+S.money||0)+c).toFixed(2);S.followers=(S.followers||0)+fo;
  card('LOST TAPE '+n+' / '+TAPES,'An old demo from the city','+$'+c+' · +'+fo.toLocaleString()+' followers',24)}
 else{S.smom.got[f.i]=1;const g=GEN[Math.floor(Math.random()*GEN.length)],ev=[
   ()=>{const n=RI(3,12)+Math.round((S.listeners||0)*.001);S.followers=(S.followers||0)+n;return'A fan stopped you for a photo: +'+n.toLocaleString()+' followers'},
   ()=>{S.hype[g]=Math.min(2,(S.hype[g]||1)*1.04);return'You jammed with a street busker: '+g+' buzz is up'},
   ()=>{const c=RI(10,40)*(1+Math.floor(fl/5));S.money=+((+S.money||0)+c).toFixed(2);return'Someone recognised you and bought you lunch: +$'+c},
   ()=>{S.energy=Math.min(100,(S.energy||0)+20);return'A producer gave you a tip over coffee: +20 energy'}];
  try{say(ev[Math.floor(Math.random()*ev.length)]());snd('cash')}catch(e){}}
 findsBuild()}
{const w0=worldTick;worldTick=function(dt){const r=w0.apply(this,arguments);try{if(!live())return r;if(!FG||FK.split('|')[0]!=String(S.day))findsBuild();const on=outdoors()||mode=='drive';FG.visible=on&&!(window.DCITY&&DCITY.on)&&!IN;if(!FG.visible)return r;
 const t=performance.now()/1000;for(const f of FM){f.m.rotation.y=t*1.6;f.m.position.y=.75+Math.sin(t*2+f.i)*.12;if(mode=='play'&&outdoors()&&Math.abs(f.x-P.x)<1.1&&Math.abs(f.z-P.z)<1.1){collect(f);break}}}catch(e){}return r}}

/* ===== Legacy tab in the Quests app ===== */
const bar=(v,t)=>`<div class=qbar><i style="width:${Math.min(100,v/t*100)}%"></i></div>`;
function legPage(){S.leg=S.leg||{};const c=collabs(),fr=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8),pl=(S.plq||[]).slice().reverse();
 const goals=LG.map(([id,n,f,t,r],i)=>{let v=0;try{v=+f()||0}catch(e){}const ok=!!S.leg[id];return`<div class="qc ${ok?'ok':''}"><div class=qs>${ok?'✓':i+1}</div><div class=qn><b>${esc(n)}</b>${bar(ok?t:v,t)}<div class=qv>${ok?'Done':fmt(Math.min(v,t))+' / '+fmt(t)+' · $'+r.toLocaleString()}</div></div></div>`}).join('');
 return`<div class=qst><div class=qh><img src="${IC.quests}"><div><h1>LEGACY</h1><small>Big goals, plaques and the people you make music with</small></div></div>
 <div class=qtabs><button onclick="qstTab('d')">Daily</button><button onclick="qstTab('w')">Weekly</button><button class=on onclick="qstTab('l')">Legacy</button></div>
 <h3 style="margin:6px 0">Legacy goals</h3>${goals}
 <h3 style="margin:14px 0 6px">Plaques (${pl.length})</h3>${pl.length?pl.map(p=>`<div class=qc><div class=qs style="background:${p.c};color:#111">★</div><div class=qn><b>${esc(p.t)} · ${esc(p.s)}</b><div class=qv>${fmt(p.n)} streams · Day ${p.d}</div></div></div>`).join(''):'<div class=qf>A song that passes 1M streams earns a Gold plaque, sent in the mail and hung in your studio.</div>'}
 <h3 style="margin:14px 0 6px">Music friends</h3>${fr.length?fr.map(([n,k])=>{const lv=bondLv(k);return`<div class=qc><div class=qs>${lv}</div><div class=qn><b>${esc(n)} · ${bondName(k)}</b><div class=qv>${k} song${k>1?'s':''} together · ${['','10% off collabs','20% off collabs, shares your releases','30% off collabs, often shares your releases'][lv]}</div></div></div>`}).join(''):'<div class=qf>Collab with an artist to become friends: friends charge less, close friends share your new songs.</div>'}
 <div class=qf>Lost tapes found: ${Object.keys(S.tapes||{}).length} / ${TAPES} · pink cassettes on the city pavements. Green ones are daily street moments.</div></div>`}
if(typeof PA=='object'&&PA.quests){const q0=PA.quests;PA.quests=function(){const Q=S.quests||{},h=q0.apply(this,arguments);/* the original also loads the Quests styles */if(Q.tab=='l'){try{return legPage()}catch(e){console.error('Legacy',e)}}
 return h.replace(/(<div class=qtabs>[\s\S]*?)(<\/div>)/,'$1<button onclick="qstTab(\'l\')">Legacy</button>$2')}}
{const t0=window.qstTab;window.qstTab=t=>{if(t=='l'){(S.quests=S.quests||{}).tab='l';try{snd('click')}catch(e){}pcR();return}return t0(t)}}

setInterval(()=>{try{plaqueTick()}catch(e){}try{legTick()}catch(e){}try{if(live()&&PWn!==(S.plq||[]).length)plaqueWall()}catch(e){}},2000);
})();
