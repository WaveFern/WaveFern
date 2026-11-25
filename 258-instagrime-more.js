/* ===== v55.52.17 (held): Instagrime feed upgrade =====
   1. Infinite scroll: the feed shows 6 posts, and more are made as you reach the bottom (shared helper FWINF from 257-news-app.js).
      Replaces the old "Refresh feed" button row with a small refresh bar at the top.
   2. Better posts about you: fan reactions to your albums and songs, listener milestones, rival chase posts, critic reviews, and
      the same headlines as the News app (popwatch / fern.times post your stories), all picked from your real career.
   3. Better posts for everyone: each post gets a time, a place, hashtags, a verified tick for big accounts, a real comment count
      and an "About you" / "Drama" tag; non-music news from the News app also shows up on the feed.
   Reused: genFeed, CAPS (259 captions), IFL/IFLC influencers, igzInfPost-style captions, igzRng/igzFan/igzStan/igzCf, cmts (comment pools),
   the News app's story maker (FWNEWS) and the existing post renderer: the wrapper only slices IGF and decorates the HTML it returns.
   Nothing new is saved. Held behind the same dev gate as the News app. */
(function(){
const HELD=true;
if(HELD&&!window.FW_DEV)return;
if(typeof PA=='undefined'||!PA.ig||typeof FWINF=='undefined'||typeof FWNEWS=='undefined')return;
const rg=s=>igzRng(s),pk=igzPick,fm=n=>igzF(Math.max(0,Math.round(n)));
const START=6,STEP=5;let LIM=START,GEN=0;
const hsh=s=>{let h=0;for(const c of String(s))h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return h};
/* ---------- captions, places and tags per picture kind ---------- */
const CAP={
 food:['Trying the new noodle place, the broth is dangerous','Breakfast for dinner is a lifestyle','Third coffee and it is only ten o\'clock','Made soup from scratch and it only slightly exploded','Street food tour: the dumplings win','Sunday pancakes, no regrets','Brought snacks to the studio and now everyone is my friend','Rate my sandwich. Be honest. Be kind.'],
 city:['Rooftop views and nowhere to be','Walked forty minutes just to find this alley','Skyline looks better with a playlist on','Lost on purpose, found a bakery','City never sleeps, I really do','Golden hour hits different downtown','Tourist in my own city today','Rain on the windows and a long night ahead'],
 park:['Morning run, three ducks judged me','Bench with a lake view: office of the day','Picnic for one and a very curious squirrel','Fresh air, loud playlist, good day','Walked past the fountain four times, no thoughts','The trees are showing off again','Sunset session at the park, free of charge'],
 home:['New lamp, new mood','Rearranged the room again, finally right','Plant count: too many. Plant space: also too many','Slow Sunday, warm blanket, zero plans','Made a little desk corner for creating','Rain outside, tea inside','The couch and I have an understanding'],
 car:['Drive to nowhere, best kind of drive','Windows down, volume up','Fuel, snacks, and a very long road','Parked in the sunset spot again','Car wash day, it shines','Night cruise with the whole album on repeat'],
 pet:['The cat sat on the keyboard and posted this','Walkies, then nap, then more walkies','Dog park reunion, everyone is muddy','Parrot learned a new word. It is not polite','Pet of the week: whoever is closest to the treats','Their face when the treat bag opens'],
 fit:['Fit check: thrifted jacket, borrowed confidence','Sneaker of the week, rate it 1 to 10','Colour block or crime? You decide','Hat season is officially open','Head to toe under 60 dollars, tell no one'],
 stage:['Soundcheck vibes, the room is huge','Crowd sang every word, I am still ringing','Last night was a dream, ears still buzzing','Backstage energy is unmatched','Encore, then pizza. Perfect night','Front row all the way, no regrets'],
 studio:['Studio session, the beat finally clicked','Four hours on one chorus and it was worth it','Late night mix, quiet room, loud ideas','Vocal take number nineteen: the one','Writing something I am scared to release','New demo on the desk, thoughts?'],
 album:['Out now on all services, go be loud','Tracklist is up. Pick a favourite, I dare you','Cover art finally done, I love it','Spinning this one all week','Listening party tonight, bring snacks']};
const LOC={food:['Noodle Alley','Corner Bakery','The Night Market'],city:['Skyline Tower','Downtown','Harbour Walk'],park:['Park Fields','Lake Loop','Central Park'],home:['Home','Living room','Small apartment'],car:['On the road','Coast highway','Parking garage'],pet:['Dog park','At home','Pet corner'],fit:['Fitting room','Threadz','Street'],stage:['Main Stage','Park Fields Festival','Soundcheck'],studio:['Studio','Late night studio','Home studio'],album:['Out now','Listening party','The label']};
const TAG={food:['#foodie','#snacktime','#noodles'],city:['#citylife','#goldenhour','#skyline'],park:['#outside','#parklife','#morningrun'],home:['#cozy','#homebody','#slowsunday'],car:['#roadtrip','#windowsdown','#nightdrive'],pet:['#petsofinstagrime','#goodboy','#catlife'],fit:['#fitcheck','#thrifted','#drip'],stage:['#livemusic','#crowd','#soundcheck'],studio:['#studiolife','#newmusic','#inthestudio'],album:['#newalbum','#outnow','#listening']};
const KS=Object.keys(CAP).filter(k=>k!='album');
const CAC={food:['yum','that looks so good','recipe please','I am hungry now','calm down chef'],city:['stunning','take me with you','where is this','the lighting!!','okay wow'],park:['peaceful','I needed this today','so green','where is this bench','goals'],home:['so cozy','love the lamp','this is my vibe','new wallpaper idea','relatable'],car:['road trip when?','clean ride','that song though','windows down forever','jealous'],pet:['AWWW','best boy','I am crying he is so cute','pet of the year','the face!'],fit:['fire','where is the jacket from','10 out of 10','you ate that','drip alert'],stage:['I was there!!','wish I could have gone','that crowd!','legend','so loud so good'],studio:['cannot wait to hear it','the grind','drop it already','take 19 is always the one','respect'],album:['streaming now','instant favourite','track 3 is perfect','this album is a mood','on repeat']};
const CRIT=['fernreview','needledrop.fm','thebeatbulletin'];
/* ---------- post makers ---------- */
const mk=(o,r)=>Object.assign({id:IGn++,cfg2:null,l:Math.round(Math.pow(10,1.2+r()*3.6)),igm:1,tm:Math.floor(r()*22*60)+3},o);
const seen=()=>new Set(IGF.map(p=>p.cap));
function genUser(r,S_){const k=pk(KS,r),cap=r()<.4?pk(CAPS,r):pk(CAP[k],r);if(S_.has(cap))return null;const u=igzFan(r);return mk({u,cfg:igzCf(r),cap,kind:r()<.35?undefined:k},r)}
function genInf(r,S_){const x=pk(IFL,r),cap=pk(IFLC[x.u],r);if(S_.has(cap))return null;return mk({u:x.u,cfg:x.c,cap,kind:x.k,inf:1,l:Math.round(x.f*(.012+r()*.05))},r)}
const NEWSU={music:['popwatch','fern.times'],other:['fern.times']};
function genNews(r,S_){const d=S.day-(r()<.55?0:Math.floor(r()*Math.min(5,S.day-1)));let L=FWNEWS.storiesOf(Math.max(1,d));
 if(r()<.5)L=L.filter(s=>s.cat=='music');L=L.filter(s=>!S_.has(s.h));if(!L.length)return null;
 const s=r()<.6?(L.find(x=>x.you)||pk(L,r)):pk(L,r),mus=s.cat=='music',u=mus&&IFLN.popwatch&&r()<.7?'popwatch':'fern.times',x=IFLN[u];
 return mk({u,cfg:x?x.c:lk(u),cap:s.h,kind:s.k=='album'?'album':s.k,inf:1,about:s.you?1:0,news:s.id,...(FWNEWS.sceneFor?FWNEWS.sceneFor(s)||{}:{}),l:Math.round((x?x.f:3e6)*(.01+r()*.03))},r)}
function genAbout(r,S_){const a=S.artist,songs=S.songs||[];if(!a||!songs.length)return null;const L=+S.listeners||0,last=songs[songs.length-1],top=songs.slice().sort((x,y)=>(y.streams||0)-(x.streams||0))[0]||last,
 alb=(S.albums||[]).slice(-1)[0],rv=((S.rvl&&S.rvl.rv)||[]).filter(x=>x&&x.n),pool=[];
 const fan=()=>({u:L>=2e4&&r()<.4?igzStan(a,r):igzFan(r),cfg:igzCf(r)}),crit=()=>{const u=pk(CRIT,r);return{u,cfg:lk(u)}};
 pool.push(()=>[fan(),'Learned "'+top.title+'" on guitar today. Three hours well spent','studio'],
  ()=>[fan(),'Made my whole family a '+a+' playlist and now nobody will let me change the music','home'],
  ()=>[fan(),'Is it just me or does every song by '+a+' sound better with the windows down','car'],
  ()=>[fan(),'Drew '+a+' from memory. Tell me it looks like them','home'],
  ()=>[fan(),'Can not get "'+last.title+'" out of my head and I am not even mad','city']);
 if(top.streams>=1e3)pool.push(()=>[fan(),'"'+top.title+'" is at '+fm(top.streams)+' streams. '+a+' is on a run','studio'],()=>[crit(),'Chart watch: "'+top.title+'" is quietly becoming the song of the season','album']);
 if(alb)pool.push(()=>[fan(),'Played "'+alb.name+'" front to back twice. '+a+' did NOT miss','album'],()=>[fan(),'Hot take: "'+alb.name+'" is the best '+a+' project so far. Argue with me','album'],()=>[crit(),'Review: "'+alb.name+'" by '+a+'. Four stars and a repeat button','album'],()=>[fan(),'Track two on "'+alb.name+'" is the one. Do not @ me','studio']);
 if(L>=1000)pool.push(()=>[fan(),'Watched '+a+' go from nothing to '+fm(L)+' monthly listeners. Proud of the whole thing','stage']);
 if(L>=1e5)pool.push(()=>[fan(),'Queued all night to see '+a+'. Worth every second','stage'],()=>[fan(),'The '+a+' crowd is the loudest I have ever heard','stage']);
 rv.filter(x=>+x.l&&L>+x.l).slice(0,3).forEach(x=>pool.push(()=>[crit(),a+' is now ahead of '+x.n+' on the charts. Round one goes to '+a,'stage']));
 rv.filter(x=>+x.l>L&&+x.l<L*3).slice(0,2).forEach(x=>pool.push(()=>[crit(),x.n+' still leads '+a+', but the gap is closing','stage']));
 const f=pk(pool,r)(),cap=f[1];if(S_.has(cap))return null;
 return mk({u:f[0].u,cfg:f[0].cfg,cap,kind:f[2],about:1,l:Math.max(5,Math.round(Math.sqrt(Math.max(L,1))*(2+r()*6)+r()*40)),tm:Math.floor(r()*300)+2},r)}
/* ---------- career events: quiet spells, album drops, split-opinion photoshoots, diss tracks ---------- */
/* Reused: fwSongGap (72-tutorial, the Big Vee reminder's days-since-last-release), igzDiss (189, diss/response data), S.rvl.rv rivals,
   FWNEWS.ctrlShoot (257, the controversial-shoot pick) and the same fan / critic account makers as genAbout. Nothing is saved. */
function genEvent(r,S_){const a=S.artist,songs=S.songs||[];if(!a||!songs.length)return null;const L=+S.listeners||0,d=S.day||0;
 const fan=()=>({u:L>=2e4&&r()<.4?igzStan(a,r):igzFan(r),cfg:igzCf(r)}),crit=()=>{const u=pk(CRIT,r);return{u,cfg:lk(u)}},P=[];
 const gap=typeof fwSongGap=='function'?fwSongGap():-1;
 if(gap>=2){const w=gap>=10?'weeks':gap>=5?'days':'a while';
  P.push(()=>[fan(),'Day '+gap+' without new '+a+'. Not mad, just checking the studio still has lights on','studio'],
   ()=>[fan(),'@'+a+' it has been '+(gap>=10?'forever':gap+' days')+', where is the new music','studio'],
   ()=>[fan(),'Still replaying "'+songs[songs.length-1].title+'" because '+a+' has gone quiet','car'],
   ()=>[crit(),a+' has not released in '+gap+' days. In this business that is a long time','studio']);
  if(gap>=5)P.push(()=>[fan(),'Is '+a+' retired?? Nobody tell me, I am not ready','city'],()=>[crit(),'Fans are getting restless: '+a+' has gone '+w+' without a single','stage'],()=>[fan(),'Unfollowing '+a+' until a song drops. Kidding. Maybe.','home'])}
 const alb=(S.albums||[]).slice(-1)[0];
 if(alb&&d-alb.day<=4){const age=d-alb.day,n=alb.name;
  P.push(()=>[fan(),age?'Day '+(age+1)+' of "'+n+'" and I found a new favourite track':'"'+n+'" IS OUT. Dropping everything, see you in an hour','album'],
   ()=>[crit(),'Review: "'+n+'" is '+pk(['ambitious and messy in the best way','a confident step up','long, and mostly worth the length','proof '+a+' is not a one-song act'],r),'album'],
   ()=>[fan(),'Hot take: "'+n+'" is overrated. Fight me','album'],()=>[fan(),'The "'+n+'" cover alone deserves an award','album'],
   ()=>[fan(),'Skipped half of "'+n+'" but the other half is unreal','studio'])}
 const shoot=(S.igPosts||[]).filter(x=>x.brand&&d-(x.day||0)<=4&&FWNEWS.ctrlShoot(x))[0];
 if(shoot){const bn=((typeof BRD!='undefined'&&BRD.by&&BRD.by(shoot.brand))||{}).n||'that brand';
  P.push(()=>[fan(),a+' x '+bn+' is the boldest shoot I have seen all year. Iconic','fit'],()=>[fan(),'Not sure the '+bn+' shoot was a good look for '+a+'. Sellout energy','fit'],
   ()=>[crit(),'The '+bn+' campaign has split the internet. Half bold, half "why"','fit'],()=>[fan(),'People are mad about the '+a+' ad? I think it is art. Let them be mad','city'],
   ()=>[fan(),'Posting the '+bn+' picture on my wall and also on my group chat to start a fight','home'])}
 if(typeof igzDiss=='function'){igzDiss().forEach(D=>{const R=D.r;P.push(()=>[crit(),'Diss track watch: who actually wins, '+a+' or '+R+'? Rating the bars','stage'],
   ()=>[fan(),'Ranking every '+a+' vs '+R+' line. Verse two is the cruelest','studio'],()=>[fan(),'Beef is good for the charts. Both of them are climbing','stage'])})}
 else if((S.rvl&&S.rvl.rv||[]).length&&songs.some(s=>s.diss))P.push(()=>[fan(),'Remember when '+a+' went at '+songs.find(s=>s.diss).diss+'? Peak internet','stage']);
 if(!P.length)return null;
 const f=pk(P,r)(),cap=f[1];if(S_.has(cap))return null;
 const diss=/diss|beef|vs /i.test(cap)&&(typeof igzDiss=='function'?igzDiss()[0]:null);
 return mk(Object.assign({u:f[0].u,cfg:f[0].cfg,cap,kind:f[2],about:1,ev:1,l:Math.max(5,Math.round(Math.sqrt(Math.max(L,1))*(2+r()*6)+r()*40)),tm:Math.floor(r()*240)+2},diss?{rival:diss.r}:{}),r)}
/* a batch of n posts: a mix of strangers, influencers, news, and you */
function batch(n){const r=rg('igm|'+(S.day||0)+'|'+(S.artist||'')+'|'+(GEN++)),out=[],S_=seen();let g=0;
 const plan=['u','i','n','e','u','a','n','e','i','a'];
 while(out.length<n&&g++<60){const k=plan[(out.length+g)%plan.length],p=(k=='u'?genUser:k=='i'?genInf:k=='n'?genNews:k=='e'?genEvent:genAbout)(r,S_);if(!p||S_.has(p.cap))continue;S_.add(p.cap);out.push(p)}
 /* the caption pools are finite: once every caption is on the feed, let them come round again so the scroll never ends */
 if(!out.length)return batch2(n)
 return out}
function batch2(n){const r=rg('igm2|'+(S.day||0)+'|'+(GEN++)),out=[],E=new Set();let g=0;
 const plan=['u','i','n','e','u','a','n','e','i','a'];
 while(out.length<n&&g++<120){const k=plan[(out.length+g)%plan.length],p=(k=='u'?genUser:k=='i'?genInf:k=='n'?genNews:k=='e'?genEvent:genAbout)(r,E);if(!p||E.has(p.cap))continue;E.add(p.cap);out.push(p)}
 return out}
const fill=n=>{while(IGF.length<n){const b=batch(6);if(!b.length)break;IGF.push(...b)}};
/* the first screen: your own stories near the top */
{const g0=genFeed;genFeed=function(){g0.apply(this,arguments);LIM=START;try{const r=rg('igm0|'+(S.day||0)+'|'+(S.artist||'')),S_=seen(),top=[];
 for(let i=0;i<8&&top.length<2;i++){const p=top.length?genAbout(r,S_):(genEvent(r,S_)||genNews(r,S_));if(p&&!S_.has(p.cap)){S_.add(p.cap);top.push(p)}}
 if(top[0])IGF.splice(Math.min(1,IGF.length),0,top[0]);if(top[1])IGF.splice(Math.min(4,IGF.length),0,top[1])}catch(e){console.warn('instagrime more',e)}}}
/* richer comments for the new posts */
{const c1=cmts;cmts=function(p){if(!p||!p.ev||CMT[p.id])return c1.apply(this,arguments);const r=rg('ce'+p.id),a=S.artist||'them',out=c1.apply(this,arguments).slice(0,2),
 pool=/where is the new|without new|retired|restless|quiet/i.test(p.cap)?['drop something please','we are starving over here','the wait is the worst part','new music or I am deleting the app lol','still love you, just hurry']
  :/shoot|campaign|ad\b/i.test(p.cap)?['this is art honestly','take it down, embarrassing','mixed feelings but I looked at it for ten minutes','sellout','bold, I respect it','the controversy is the marketing']
  :/album|"/.test(p.cap)&&!p.rival?['track 5 is the one','too long but I love it','overrated','instant classic','replay value is crazy']
  :['both of them are loud, I love it','team '+a,'this beef is the best thing on my feed','popcorn ready'];
 const add=[0,1,2].map(()=>({u:igzFan(r),t:pk(pool,r),l:Math.floor(r()*300),img:pf2(igzCf(r))})).filter((c,i,A)=>A.findIndex(o=>o.t==c.t)==i);return CMT[p.id]=[...add,...out]}}

{const c0=cmts;cmts=function(p){if(!p||CMT[p.id]||!p.igm||p.about||p.inf)return c0.apply(this,arguments);const out=c0.apply(this,arguments),r=rg('cm'+p.id),pool=CAC[p.kind]||CAC.city;
 const add=[0,1,2].map(()=>({u:igzFan(r),t:pk(pool,r),l:Math.floor(r()*300),img:pf2(igzCf(r))})).filter((c,i,A)=>A.findIndex(o=>o.t==c.t)==i);return CMT[p.id]=[...add,...out.slice(0,3)]}}
/* ---------- decorating the existing post markup ---------- */
function ago(p){const m=p.tm!=null?p.tm:(p.about?(hsh(p.id)%90)+2:(hsh(p.id)%20)*60+30);return m<60?m+'m':m<1440?Math.floor(m/60)+'h':Math.floor(m/1440)+'d'}
function deco(n){const on=n.querySelector('[onclick^="openPostId("]'),id=on&&+((on.getAttribute('onclick').match(/\d+/)||[])[0]);if(!id)return n;let p;try{p=findP(id)}catch(e){}if(!p)return n;
 const b=n.querySelector('.ph b'),ph=n.querySelector('.ph');
 if(b&&ph&&!ph.querySelector('.igmw')){const k=(typeof kindOf=='function'?kindOf(p):p.kind)||'city',w=document.createElement('div');w.className='igmw';b.style.flex='none';
  b.insertAdjacentHTML('beforeend',p.inf||p.l>=2e4?'<span class=igvf>✓</span>':'');
  const tags=[];if(p.about&&!p.rival)tags.push('<em class=igmt>About you</em>');if(p.rival)tags.push('<em class="igmt dm">Drama</em>');if(p.brandAd)tags.push('<em class="igmt sp">Sponsored</em>');if(p.news)tags.push('<em class="igmt nw">Fern Times</em>');
  const sm=document.createElement('small');sm.innerHTML=(p.mine?'You':esc((LOC[k]||LOC.city)[hsh(p.id)%3]))+' · '+ago(p)+tags.join('');
  b.replaceWith(w);w.appendChild(b);w.appendChild(sm)}
 const cap=n.querySelector('.cap');if(cap&&!cap.querySelector('.igtg')&&!p.brandAd){const k=(typeof kindOf=='function'?kindOf(p):p.kind)||'city',t=TAG[k]||TAG.city;cap.insertAdjacentHTML('beforeend',' <span class=igtg>'+t[hsh(p.id)%t.length]+'</span>')}
 const vc=n.querySelector('.ln small');if(vc){const c=3+hsh(p.id+'c')%(p.inf?900:60)+(p.about?20:0);vc.textContent='View all '+c+' comments'}
 /* the picture no longer opens the comments: only the comment button (or "View all comments") does; double tap likes it */
 const pic=n.querySelector('img.pic');if(pic&&pic.getAttribute('onclick')){pic.removeAttribute('onclick');pic.dataset.igl=id}
 if(p.about)n.classList.add('igma');return n}
/* double click / double tap on a picture: like it (no re-draw, so the scroll position stays) and pop a pixel heart */
const HEART='<svg viewBox="0 0 9 8" shape-rendering="crispEdges"><path fill="#ff3b5c" d="M1 0h2v1h1v1h1V1h1V0h2v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z"/><path fill="#fff" d="M1 1h1v1H1z"/><path fill="#a0123a" d="M4 7h1v1H4zM5 6h1v1H5zM6 5h1v1H6z"/></svg>';
function likePic(el){const id=+el.dataset.igl;let p;try{p=findP(id)}catch(e){}if(!p)return;
 const post=el.closest('.post'),h=document.createElement('div');h.className='igmh';h.innerHTML=HEART;el.parentNode.style.position='relative';el.after(h);setTimeout(()=>h.remove(),800);
 if(isL(p))return;S.likedP.push({id:p.id,u:p.u,cap:p.cap,cfg:p.cfg,cfg2:p.cfg2,l:p.l,mine:p.mine,kind:p.kind});try{snd('pop')}catch(e){}
 const sp=post&&post.querySelector('.acts span');if(sp)sp.innerHTML='<img src="'+IC.heart+'" class="gi lk">';const b=post&&post.querySelector('.ln b');if(b)b.textContent=(p.l+1).toLocaleString()+' likes'}
{let lt=0,lel=null;document.addEventListener('pointerup',e=>{const el=e.target&&e.target.closest&&e.target.closest('img.pic[data-igl]');if(!el)return;const t=Date.now();if(lel===el&&t-lt<380){lt=0;lel=null;try{likePic(el)}catch(x){console.warn('like',x)}}else{lt=t;lel=el}})}
function css(){if(document.getElementById('igmcss'))return;const s=document.createElement('style');s.id='igmcss';s.textContent=`
/* the window padding made the sticky tab bar stop short of the bottom edge: the feed fills the window and the bar sits on its bottom edge */
#pc .mn:has(>.ig){padding:0!important}
.mn>.ig{min-height:100%}
.ig .post{border:1px solid #262626!important;border-radius:14px;margin:12px 10px;background:#0b0b0b;overflow:hidden;padding-bottom:12px!important}
.ig .post.igma{border-color:#8b6b00!important;box-shadow:0 0 0 1px #ffd54a55}
.ig .igmw{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.ig .igmw b{cursor:pointer}
.ig .igmw small{color:#8e8e8e;font-size:11px;display:flex;gap:5px;align-items:center;flex-wrap:wrap}
.ig .igmt{font:700 9px/1 system-ui;letter-spacing:.06em;text-transform:uppercase;font-style:normal;padding:3px 5px;border-radius:3px;background:#ffd54a;color:#1a1400}
.ig .igmt.dm{background:#ff3b5c;color:#fff}.ig .igmt.sp{background:#444;color:#ddd}.ig .igmt.nw{background:#f5f1e8;color:#d6322b}
.ig .igtg{color:#6fa8ff}
.ig .pic[data-igl]{cursor:pointer;-webkit-user-select:none;user-select:none}.ig .igmh{position:absolute;left:50%;top:40%;width:96px;margin:-48px 0 0 -48px;pointer-events:none;animation:igmh .8s steps(8) forwards;image-rendering:pixelated}.ig .igmh svg{width:100%;filter:drop-shadow(3px 3px 0 #0007)}@keyframes igmh{0%{transform:scale(.3);opacity:0}25%{transform:scale(1.15);opacity:1}60%{transform:scale(1);opacity:1}100%{transform:scale(1.1) translateY(-24px);opacity:0}}
.ig .igmr{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;color:#9a9a9a;font-size:12px}
.ig .igmr button{all:unset;cursor:pointer;color:#fff;font-weight:600;padding:5px 10px;border:1px solid #333;border-radius:14px}
.ig .igmx{text-align:center;color:#777;font-size:12px;padding:18px 0 26px}`;document.head.appendChild(s)}
/* ---------- the wrapper: slice the feed, decorate it, and add the infinite-scroll marker ---------- */
const ig1=PA.ig;
function parse(h){const t=document.createElement('template');t.innerHTML=h;return t.content}
function render(list){const all=IGF;IGF=list;let h;try{h=ig1()}finally{IGF=all}const R=parse(h);return[...R.querySelectorAll('.post')].map(deco)}
PA.ig=function(){css();if(typeof igv=='undefined'||igv!='feed')return ig1.apply(this,arguments);
 if(!IGF.length)genFeed();fill(LIM+3);const all=IGF;let h;IGF=all.slice(0,LIM);try{h=ig1.apply(this,arguments)}finally{IGF=all}
 if(typeof h!='string'||!/class="?ig"?>/.test(h))return h;
 try{const R=parse(h),ps=[...R.querySelectorAll('.post')];ps.forEach(deco);
  R.querySelectorAll('button[onclick*="IGF=[]"]').forEach(b=>{const w=b.parentElement;if(w&&w.className!='ig')w.remove();else b.remove()});
  const last=ps[ps.length-1],bar=document.createElement('div');bar.className='igmr';bar.innerHTML='<span>Fresh posts for day '+S.day+'</span><button onclick="igmRefresh()">↻ Refresh</button>';
  const first=ps[0];if(first)first.parentNode.insertBefore(bar,first);
  if(last){const m=document.createElement('div');m.className='igmx';m.setAttribute('data-inf','igmMore');m.textContent='Loading more posts…';last.after(m)}
  const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error('instagrime more',e)}return h};
window.igmMore=()=>{const old=LIM;LIM+=STEP;fill(LIM+3);const list=IGF.slice(old,LIM);if(!list.length)return'';return render(list).map(n=>n.outerHTML).join('')};
window.igmRefresh=()=>{IGF=[];LIM=START;pcR();try{const m=document.querySelector('#pc .mn');if(m)m.scrollTop=0;const p=document.querySelector('#ph .phx');if(p)p.scrollTop=0}catch(e){}};
/* make the scan run after the phone and laptop draw (257 hooks pcR and phR, this covers the post studio and other re-draws) */
window.FWIGM={like:likePic,batch,genEvent,genAbout,genNews,genUser,genInf,state:()=>({LIM,len:IGF.length})};
})();
