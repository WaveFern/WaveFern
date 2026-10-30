/* ===== v49.39.0: Instagrime talks about you, and influencers you follow =====
   1. Posts about you: once you have a song out, people on Instagrime post about you. Friends share your first tracks, fans
      put your latest song on repeat, bump into you in the city (the photo has you in it), and stan pages appear as you grow.
      A day's posts about you are made once (refreshing the feed does not spam new ones) and kept in a new Tagged tab on
      your account (the last 30).
   2. Diss tracks: the feed lights up. Fans pick sides, gossip pages cover it, the rival posts a reply before the response
      track lands, and after it lands people argue about who won. This lasts about a week after each diss or response.
   3. Influencers: 8 big accounts you follow. 3 of them are on every refresh of the feed, a row of their pictures sits at the
      top of the feed, and their profiles show a verified tick, a bio, millions of followers and their own posts. When you
      get big they start posting your songs too. */

const IFL=[
 {u:'skye.daily',f:52.4e6,bio:'Lifestyle, sunsets and too much iced coffee',k:'city',c:{skin:1,eyes:3,mouth:2,hair:14,hc:6,top:2,tc:8,pc:3,body:.3,jk:4,sh:2}},
 {u:'popwatch',f:41.2e6,bio:'Music news and drama, first. DMs open for tips',k:'stage',gossip:1,c:{skin:4,eyes:1,mouth:5,hair:3,hc:0,top:0,tc:0,pc:0,body:.5,ht:2,sh:5}},
 {u:'tourmode.tara',f:33.8e6,bio:'97 countries and counting. Window seat only',k:'city',c:{skin:2,eyes:6,mouth:1,hair:9,hc:11,top:3,tc:5,pc:6,body:.35,jk:2,bt:1}},
 {u:'drip.report',f:27.1e6,bio:'Fits, kicks and the occasional crime against fashion',k:'fit',c:{skin:6,eyes:2,mouth:4,hair:17,hc:2,top:1,tc:3,pc:9,body:.45,jk:6,sh:7,ht:4}},
 {u:'thepetpals',f:22.6e6,bio:'Two cats, one dog and a parrot who runs the account',k:'pet',c:{skin:0,eyes:4,mouth:0,hair:6,hc:14,top:4,tc:1,pc:2,body:.4,sh:1}},
 {u:'cozyroom.mila',f:15.9e6,bio:'Small rooms, big plants, soft lamps',k:'home',c:{skin:3,eyes:7,mouth:3,hair:11,hc:9,top:2,tc:6,pc:4,body:.3}},
 {u:'dex.lifts',f:12.3e6,bio:'Gym at 5am, park at 6, protein always',k:'park',c:{skin:5,eyes:0,mouth:6,hair:1,hc:3,top:0,tc:2,pc:1,body:.75,sh:3}},
 {u:'carspotter.jay',f:9.7e6,bio:'If it has wheels and a loud exhaust, I am there',k:'car',c:{skin:2,eyes:5,mouth:2,hair:4,hc:1,top:1,tc:7,pc:5,body:.5,ht:1,jk:0}}];
const IFLC={
 'skye.daily':['Golden hour on the roof again, I live here now','City lights and a playlist that never misses','Sunday reset: long walk, no phone (except this post)','Found the best view in the city, not telling where','Night out, back by 10, I am that person now','Downtown in the rain hits different','New city week, plans: none','Rooftop picnic, 0 regrets'],
 popwatch:['Who had the best stage outfit this week? Vote in the comments','Rumour: a surprise festival headliner is about to be announced','Sold-out show last night, the crowd did not stop singing','The charts are moving fast this week, who is next?','Biggest live moments of the month, ranked','Encore count of the year so far: 4. Unreal','Backstage pass giveaway, tag a friend','Soundcheck spotted, new music incoming?'],
 'tourmode.tara':['Landed. Straight to the old town, bags still on','Street food tour round two, my stomach is brave','Skyline from the 40th floor, worth the queue','Lost in a city with no map and loving it','Sunrise at the harbour, the jet lag was worth it','Train window views all day','Packing list: three outfits, eight pairs of shoes','Night market lights, back again tomorrow'],
 'drip.report':['Fit check: thrifted jacket, borrowed confidence','Sneaker of the week, rate it 1 to 10','Hat season is officially open','Colour block or crime? You decide','Head to toe for under 60 dollars','Rotation update, three new pairs','This jacket has been everywhere with me','Mirror selfie mandatory, sorry not sorry'],
 thepetpals:['The parrot learned a new word and it is not polite','Walkies, then a nap, then more walkies','The cat sat on the keyboard and posted this','Dog park reunion, everyone is muddy','Pet of the week: a very serious goldfish','Who is a good boy? Him. It is him.','Morning walk crew reporting for duty','Treat bag empty, chaos incoming'],
 'cozyroom.mila':['Moved the sofa again, it is finally right','New lamp, whole new mood','Plant count: 31. Send help (more plants)','Rainy day, warm room, slow playlist','Desk setup tour, small but cosy','Repainted the wall, ask me how many times','Fairy lights stay up all year, it is the law','Sunday morning light through the window'],
 'dex.lifts':['Park workout before the city wakes up','Leg day. I will be sitting for the rest of it','Rest day walk, still counted my steps','New personal best, the bench is scared of me','Running club, 40 of us at 6am','Stretch, hydrate, repeat','Outdoor gym view never gets old','Post-workout sunshine, earned it'],
 'carspotter.jay':['Spotted this one at sunset, clean','Drive to nowhere, best kind of drive','Garage find of the week','Detailing day, it shines again','Night cruise along the coast','Rate this colour 1 to 10','Parked it, stared at it for an hour','Road trip playlist loaded, tank full']};
const IFLN=Object.fromEntries(IFL.map(x=>[x.u,x]));
const igzF=n=>n>=1e6?(n/1e6).toFixed(n>=1e7?1:2).replace(/\.?0+$/,'')+'M':n>=1e3?(n/1e3).toFixed(n>=1e4?0:1).replace(/\.0$/,'')+'K':String(Math.round(n));
const igzPick=(a,r)=>a[Math.floor(r()*a.length)%a.length];
const igzRng=s=>{let h=0;for(const c of String(s))h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return()=>{h=(h+0x6D2B79F5)>>>0;let t=Math.imul(h^h>>>15,1|h);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const igzCf=r=>{const R_=(a,b)=>a+Math.floor(r()*(b-a+1)),o={skin:R_(0,7),eyes:R_(0,8),mouth:R_(0,7),hair:R_(0,19),hc:R_(0,19),top:R_(0,4),tc:R_(0,9),pc:R_(0,11),body:r()};if(r()<.55)o.jk=R_(0,7);if(r()<.5)o.sh=R_(0,7);if(r()<.3)o.ht=R_(0,6);return o};
const igzFan=r=>{const U=['lil','yung','big','mc','young','dj','baby','sir','its','real','the'],V=['cheddar','biscuit','blender','spoon','waffle','noodle','pickle','crouton','toaster','meatball','pixel','echo','bass','vinyl'];return igzPick(U,r)+'_'+igzPick(V,r)+(r()<.5?Math.floor(r()*99):'')};
const igzStan=(a,r)=>{const b=String(a||'artist').toLowerCase().replace(/[^a-z0-9]/g,'')||'artist';return igzPick([b+'.updates',b+'_stan',b+'daily','team'+b,b+'_hive',b+'.fanpage'],r)};

/* ---------- influencer posts ---------- */
function igzInfPost(x,i,r){const day=S.day||0,caps=IFLC[x.u],s=(S.songs||[]).slice().sort((a,b)=>(b.today||0)-(a.today||0))[0];
 let cap=caps[(day*3+i*5+IFL.indexOf(x))%caps.length],k=x.k,me=0;
 if(s&&S.artist&&(S.listeners||0)>=1e4&&r()<Math.min(.45,.1+Math.log10(S.listeners)/20)){me=1;
  cap=x.gossip?igzPick(['Everyone is talking about '+S.artist+' right now and "'+s.title+'" is why','Song of the week: "'+s.title+'" by '+S.artist,S.artist+' keeps climbing. "'+s.title+'" just passed '+igzF(s.streams||0)+' streams'],r)
   :igzPick(['Current obsession: "'+s.title+'" by '+S.artist,'Soundtrack for today: "'+s.title+'" by '+S.artist+' on repeat','If you are not listening to '+S.artist+' yet, start with "'+s.title+'"','Shoutout to '+S.artist+', "'+s.title+'" carried this whole day'],r)}
 return{id:3e7+IFL.indexOf(x)*1e5+day,u:x.u,cap,kind:k,l:Math.round(x.f*(.02+r()*.05)),cfg:x.c,cfg2:null,inf:1,about:me}}
/* their profile page: 6 posts from their own captions */
{const up0=uposts;uposts=function(u,cfg){const x=IFLN[u];if(!x)return up0.apply(this,arguments);if(UPR[u])return UPR[u];const caps=IFLC[u],h=hs(u);
 return UPR[u]=caps.slice(0,6).map((c,i)=>({id:h%100000*10+i+500000,u,cap:c,kind:i%3==2?'home':x.k,l:Math.round(x.f*(.015+((h>>i)%40)/1000)),cfg:x.c,cfg2:null,inf:1}))}}

/* ---------- posts about you ---------- */
function igzDiss(){const d=S.day||0,out=[];(S.songs||[]).forEach(s=>{if(s.diss&&d-(s.day||0)<=7)out.push({r:s.diss,t:s.title,age:d-(s.day||0),resp:0})});
 (S.news||[]).forEach(n=>{if(d-(n.day||0)>7)return;const m=out.find(o=>o.r==n.u);if(m){m.resp=1;m.rage=d-(n.day||0)}else if(typeof RVN!='undefined'&&RVN.includes(n.u)){const s=(S.songs||[]).find(q=>q.diss==n.u);if(s)out.push({r:n.u,t:s.title,age:d-(s.day||0),resp:1,rage:d-(n.day||0)})}});return out}
function igzAbout(r){const a=S.artist,L=S.listeners||0,songs=(S.songs||[]),last=songs.slice(-1)[0],top=songs.slice().sort((x,y)=>(y.streams||0)-(x.streams||0))[0],P=[];
 if(!a||!last)return P;const fan=()=>({u:L>=2e4&&r()<.5?igzStan(a,r):igzFan(r),cfg:igzCf(r)});
 const add=(o,cap,kind,extra)=>P.push(Object.assign({u:o.u,cfg:o.cfg,cap,kind,l:Math.max(3,Math.round((Math.sqrt(L)*(2+r()*6)+r()*40))),cfg2:null,about:1},extra||{}));
 /* diss drama first */
 igzDiss().forEach(D=>{const R=D.r,T=D.t,hot=D.resp?D.rage<=3:D.age<=3,n=hot?3:1;
  const pre=['"'+T+'" by '+a+' is aimed straight at '+R+'. No mercy','Team '+a+' or team '+R+'? The comments are a war zone',R+' is NOT recovering from "'+T+'"','Played "'+T+'" four times. '+R+' should log off for a bit','Honestly '+R+' did not deserve "'+T+'"... but it slaps','Nobody: ... '+a+': drops "'+T+'" about '+R],
   post=[R+' answered '+a+'. Round two??','That '+R+' response was weak, '+a+' wins this one easily',R+' came back hard. '+a+', your move','Diss track war update: '+a+' vs '+R+', who is winning?','Still thinking about "'+T+'". '+R+' never stood a chance'];
  const pool=D.resp?post:pre;for(let i=0;i<n;i++){const c=igzPick(pool,r);if(P.some(p=>p.cap==c))continue;add(fan(),c,igzPick(['studio','city','stage'],r),{rival:R})}
  const g=L>=500?IFLN.popwatch:null;if(hot)add(g?{u:g.u,cfg:g.c}:{u:'local.music.tea',cfg:lk('local.music.tea')},D.resp?'DRAMA: '+R+' fires back at '+a+'. Who won? Vote below':'DRAMA: '+a+' drops diss track "'+T+'" aimed at '+R+'. Thoughts?','stage',g?{inf:1,rival:R,l:Math.round(g.f*.03)}:{rival:R});
  if(!D.resp&&D.age>=1)add({u:R,cfg:lk(R)},igzPick(['Heard "'+T+'". Cute. Response coming soon','Funny how '+a+' needed my name to get streams','Studio tonight. '+a+' asked for this','Not even mad, "'+T+'" was kind of catchy. Still taking you out though'],r),'studio',{rival:R,l:Math.max(50,Math.round((L||10)*(1+r())))})});
 /* everyday buzz, more of it as you grow */
 let n=L<50?(r()<.4?1:0):L<5e3?1:L<5e5?2:3;const age=(S.day||0)-(last.day||0);if(age<=1)n++;
 const small=['My friend '+a+' just put out "'+last.title+'", go give it a listen','Proud of '+a+', "'+last.title+'" is actually good','Found '+a+' on Spotifly today, "'+last.title+'" is a vibe'],
  mid=['Can not stop playing "'+(top||last).title+'" by '+a,'"'+last.title+'" by '+a+' has been on repeat all week','Who else has "'+(top||last).title+'" stuck in their head','Called it early: '+a+' is going to be huge',a+' is so underrated, "'+last.title+'" proves it'],
  big=[igzF((top||last).streams||0)+' streams on "'+(top||last).title+'". '+a+' is not slowing down','Bought the '+a+' hoodie, no regrets','Waited three hours to see '+a+' and it was worth it','Front row for '+a+' last night, my ears are still ringing'],
  met=['Saw '+a+' in the city today, they were so nice','Ran into '+a+' downtown and got a picture!!','Look who I met today: '+a];
 for(let i=0,g=0;i<n&&g<20;g++){let cap,kind='studio',x={};const q=r();
  if(L>=200&&q<.25){cap=igzPick(met,r);kind=r()<.5?'city':'park';x.cfg2=ch}else{const pool=L<200?small:L<2e5?mid:[...mid,...big];cap=igzPick(pool,r);kind=/front row|waited/i.test(cap)?'stage':/hoodie/i.test(cap)?'fit':igzPick(['studio','home','car','city'],r)}
  if(P.some(p=>p.cap==cap))continue;add(fan(),cap,kind,x);i++}
 return P}
/* the day's posts about you are made once, and again when a new diss or response lands */
function igzToday(){S.igTag=S.igTag||[];const sig=(S.day||0)+'|'+igzDiss().map(d=>d.r+d.resp).join(',')+'|'+(S.songs||[]).length;
 if(S.igAbout&&S.igAbout.sig==sig)return S.igAbout.p.map(p=>p.mine2?Object.assign({},p,{cfg2:ch}):p);
 const old=S.igAbout&&S.igAbout.day==S.day?S.igAbout.p:[],r=igzRng(sig+'|'+(S.artist||'')),fresh=igzAbout(r).filter(p=>!old.some(o=>o.cap==p.cap));
 fresh.forEach(p=>{p.id=S.nid++;p.day=S.day;if(p.cfg2===ch)p.mine2=1});
 const all=[...old,...fresh].slice(-10);S.igAbout={sig,day:S.day,p:all.map(p=>p.mine2?Object.assign({},p,{cfg2:{...ch}}):p)};
 fresh.forEach(p=>S.igTag.push(Object.assign({},p,{cfg2:p.mine2?{...ch}:p.cfg2})));if(S.igTag.length>30)S.igTag.splice(0,S.igTag.length-30);
 if(fresh.some(p=>p.rival))try{say('Instagrime is talking about your diss track')}catch(e){}
 return all.map(p=>p.mine2?Object.assign({},p,{cfg2:ch}):p)}
/* tagged posts are findable for openPostId (findP looks through every list in UPR) */
UPR['\u0000tagged']=[];

{const g0=genFeed;genFeed=function(){g0.apply(this,arguments);try{
 const day=S.day||0,r=igzRng('inf|'+day+'|'+(S.artist||'')),start=(day*3)%IFL.length,inf=[0,1,2].map(i=>igzInfPost(IFL[(start+i)%IFL.length],i,r));
 let ab=[];try{ab=igzToday()}catch(e){console.warn('instagrime buzz',e)}
 const dr=ab.filter(p=>p.rival),ev=ab.filter(p=>!p.rival).sort(()=>Math.random()-.5).slice(0,4);
 /* diss news stays on top, then the drama, then a mix of influencers, buzz about you and the usual feed */
 const news=IGF.filter(p=>S.news&&S.news.some(n=>n.id==p.id)),rest=IGF.filter(p=>!news.includes(p)),out=[...news,...dr];
 const mix=[inf[0],ev[0],rest[0],rest[1],inf[1],ev[1],rest[2],ev[2],rest[3],inf[2],rest[4],ev[3],...rest.slice(5)].filter(Boolean);
 IGF=[...out,...mix]}catch(e){console.warn('instagrime buzz',e)}}}

/* comments on posts about you */
{const c0=cmts;cmts=function(p){if(CMT[p.id]||!p||!(p.about||p.inf))return c0.apply(this,arguments);const out=c0.apply(this,arguments).slice(0,5),a=S.artist||'them',R=p.rival||'',r=igzRng('c'+p.id);
 const pool=p.rival?[a+' won this one easily',R+' fans are very quiet today','this beef is the best thing on my feed','both of them need to calm down lol','"'+((S.songs||[]).find(s=>s.diss==R)||{}).title+'" is a classic already',R+' clapped back harder tbh','popcorn ready']
  :p.about?['@'+a+' notice me please','been a fan since day one',''+a+' deserves way more listeners','literally same','the new one is my favourite','saw them live, unreal','who is '+a+'? listening now']
  :['first','omg '+p.u+' never misses','this is my whole aesthetic','posting notifications on for this','how are you this consistent','obsessed'];
 const add=[0,1,2].map(i=>({u:igzFan(r),t:igzPick(pool,r),l:Math.floor(r()*400)+(p.inf?200:0),img:pf2(igzCf(r))})).filter((c,i,A)=>A.findIndex(o=>o.t==c.t)==i);
 return CMT[p.id]=[...add,...out]}}

/* ---------- Instagrime page: verified ticks, the influencer row, influencer profiles and the Tagged tab ---------- */
{const st=document.createElement('style');st.textContent=`.ig .igvf{display:inline-block;width:13px;height:13px;border-radius:50%;background:#3897f0;color:#fff;font:700 9px/13px system-ui;text-align:center;margin-left:4px;vertical-align:1px}
.ig .igst{display:flex;gap:12px;overflow-x:auto;padding:10px 12px;border-bottom:1px solid #262626;scrollbar-width:none}.ig .igst::-webkit-scrollbar{display:none}
.ig .igst button{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;width:62px;flex:none}
.ig .igst .rg{width:54px;height:54px;border-radius:50%;padding:2px;background:linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2)}.ig .igst .rg img{width:100%;height:100%;border-radius:50%;border:2px solid #000;box-sizing:border-box;image-rendering:pixelated;background:#222}
.ig .igst small{font-size:10px;color:#ddd;max-width:62px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ig .igbio{margin-top:6px;color:#ddd;font-size:13px}`;document.head.appendChild(st)}
const igzAv=c=>{try{return typeof igxPortrait=='function'&&IGX.on?igxPortrait(c):pf2(c)}catch(e){return pf2(c)}};
{const ig0=PA.ig;PA.ig=function(){let h;UPR['\u0000tagged']=S.igTag||[];
 if(igv=='acct'&&igt=='tagged'){const sv=S.savedP;S.savedP=(S.igTag||[]).slice();igt='saved';try{h=ig0.apply(this,arguments)}finally{S.savedP=sv;igt='tagged'}
  h=h.replace(/<button class="go" onclick="igt='saved';pcR\(\)">Saved<\/button>/,`<button class="" onclick="igt='saved';pcR()">Saved</button>`)}
 else h=ig0.apply(this,arguments);
 if(igv=='acct')h=h.replace(/(<button class="[^"]*" onclick="igt='saved';pcR\(\)">Saved<\/button>)/,`$1<button class="${igt=='tagged'?'go':''}" onclick="igt='tagged';pcR()">Tagged</button>`);
 /* verified ticks after every influencer name */
 IFL.forEach(x=>{h=h.split('>'+x.u+'</b>').join('>'+x.u+'<span class=igvf>✓</span></b>')});
 if(igv=='prof'&&IFLN[igu]){const x=IFLN[igu];h=h.replace(/Fame Level \d+ · <b>[\d,.]+<\/b> followers/,`Influencer · <b>${igzF(x.f)}</b> followers · <b>Following</b>`).replace(/(<b>6<\/b> posts<\/div>)/,`$1<div class=igbio>${esc(x.bio)}</div>`)}
 if(igv=='feed'){const row=`<div class=igst>${IFL.map(x=>`<button onclick="openProf('${x.u}')"><span class=rg><img src="${igzAv(x.c)}"></span><small>${x.u}</small></button>`).join('')}</div>`,i=h.indexOf('<div class=post>');
  if(i>=0)h=h.slice(0,i)+row+h.slice(i)}
 return h}}
