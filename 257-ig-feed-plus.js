/* ===== Instagrime feed plus: richer posts about you, comment counts + tags on every post, infinite scroll =====
   Reuses: genFeed chain (generic posts), igzAbout (posts about you, wrapped here), igzInfPost (influencers), PA.ig (the one feed renderer).
   New: igMeta/igTags (called by the feed in 21-v7), more "about you" post types, igMoreFeed + a scroll listener that appends posts. */
(function(){
const TG={fit:['#fitcheck','#ootd'],pet:['#petsofinstagrime','#goodboy'],home:['#cozy','#homevibes'],city:['#citylife','#downtown'],stage:['#livemusic','#onstage'],food:['#foodie'],car:['#cars','#roadtrip'],studio:['#studiolife','#newmusic'],album:['#newalbum','#onrepeat'],park:['#outdoors','#goodvibes']};
window.igTags=p=>{const t=p.about||p.inf||p.brand||p.brandAd?0:TG[p.kind];return t?` <span style="color:#6fb0ff">${t[hs(String(p.id)+'t')%t.length]}</span>`:''};
window.igMeta=p=>{const h=hs(String(p.id)+'m'),n=Math.max(0,Math.round((p.l||0)/(28+h%30))+h%9),ago=(p.about||p.inf)?(1+h%11)+'h':h%4==0?(1+h%6)+'d':(1+h%22)+'h';
 return n?`View all ${n.toLocaleString()} comments · ${ago} ago`:`Be the first to comment · ${ago} ago`};

/* ---- more kinds of posts about you (added to the ones igzAbout already makes) ---- */
const CRIT=['the.record.club','vinylbites','bassline.weekly','nu.sounds','chartwatch.daily','lowend.theory'],
 PEOPLE=['my.mum.says','roommate.reports','gym.playlist.guy','late.night.drives','study.with.me.fm','shuffle.fiend'];
{const ab0=igzAbout;igzAbout=function(r){const P=ab0.apply(this,arguments),a=S.artist,L=S.listeners||0,songs=S.songs||[],last=songs.slice(-1)[0];
 if(!a||!last)return P;
 const top=songs.slice().sort((x,y)=>(y.streams||0)-(x.streams||0))[0]||last,alb=(S.albums||[]).slice(-1)[0],other=songs.length>1?songs.filter(s=>s!==top)[Math.floor(r()*(songs.length-1))]:null,
  fan=u=>({u,cfg:igzCf(r)}),
  add=(o,cap,kind,x)=>{if(P.some(p=>p.cap==cap))return;P.push(Object.assign({u:o.u,cfg:o.cfg,cap,kind,l:Math.max(3,Math.round(Math.sqrt(L+4)*(2+r()*6)+r()*40)),cfg2:null,about:1},x||{}))},
  C=()=>fan(igzPick(CRIT,r)),F=()=>fan(L>=2e4&&r()<.4?igzStan(a,r):igzFan(r)),Pe=()=>fan(igzPick(PEOPLE,r)),pool=[];
 pool.push(()=>add(F(),'POV: it is 2am and you found "'+top.title+'" by '+a,'studio'));
 pool.push(()=>add(F(),'Made a playlist that is 100% '+a+'. Send help','home'));
 pool.push(()=>add(Pe(),'My mum has played "'+last.title+'" by '+a+' 11 times today. She does not even know it is my friend','home'));
 pool.push(()=>add(F(),'Not me crying to "'+last.title+'" on the bus','city'));
 if(other)pool.push(()=>add(F(),'Hot take: "'+other.title+'" is better than "'+top.title+'" and I will die on this hill','studio'));
 if(songs.length>=3)pool.push(()=>add(C(),'Ranking every '+a+' song so far. "'+top.title+'" is first, and number '+Math.min(3,songs.length)+' is going to start a fight','studio'));
 if(L>=1e3)pool.push(()=>add(C(),'Artists to watch: '+a+'. Sharp hooks, zero filler, and "'+top.title+'" is why','stage',{l:Math.round(L*(.05+r()*.1))}));
 if(L>=1e3)pool.push(()=>add(F(),'Fan edit of "'+top.title+'" is up. Yes the cat is in it','pet'));
 if(L>=5e3)pool.push(()=>add(C(),'Unpopular opinion: the hype around '+a+' is a bit much. "'+last.title+'" is good, not a masterpiece. Fight me in the comments','studio',{l:Math.round(L*.02)}));
 if(L>=1e4)pool.push(()=>add(fan('chartwatch.daily'),a+' just crossed '+igzF(L)+' monthly listeners. Eight months ago nobody had heard the name','stage',{l:Math.round(L*.08)}));
 if(L>=5e4)pool.push(()=>add(fan('popwatch.'+igzPick(['clips','tea','daily'],r)),'Heard '+a+' is in talks about a big tour. Sources say the whole thing sells out in minutes','stage',{l:Math.round(L*.1)}));
 if(L>=2e5)pool.push(()=>add(F(),'Overheard a stranger humming "'+top.title+'" in the supermarket. We are all in this together','city'));
 if(alb)pool.push(()=>add(C(),'Album review: "'+alb.name+'" by '+a+'. '+igzPick(['A confident debut with almost no dead spots','Big step up in songwriting, the second half is the best','Tight, weird and weirdly replayable. 8 out of 10','Not perfect, but you can hear them finding their sound'],r),'album',{l:Math.round(Math.sqrt(L+4)*40)}));
 if(alb)pool.push(()=>add(F(),'"'+alb.name+'" front to back on the commute. No skips','album'));
 for(let n=L<500?1:L<1e5?2:3,g=0;n>0&&g<12;g++){const j=Math.floor(r()*pool.length);if(!pool[j])continue;const b=P.length;pool[j]();pool[j]=null;if(P.length>b)n--}
 return P}}

/* ---- infinite scroll: a fresh batch from the same generators, appended to the page without a redraw ---- */
function more(){const keep=IGF.slice(),seen=new Set(keep.map(p=>p.id)),caps=new Set(keep.map(p=>p.cap));let fresh=[];
 try{genFeed();fresh=IGF.filter(p=>!seen.has(p.id)&&!caps.has(p.cap))}catch(e){console.warn('feed more',e)}
 const r=igzRng('more'+Math.random());
 if(S.artist&&(S.songs||[]).length)try{fresh.push(...igzAbout(r).filter(p=>!p.rival&&!caps.has(p.cap)).slice(0,2).map(p=>Object.assign({},p,{id:IGn++,cfg2:p.mine2?ch:p.cfg2})))}catch(e){}
 try{const x=IFL[Math.floor(r()*IFL.length)],q=igzInfPost(x,Math.floor(r()*60),r);if(!caps.has(q.cap))fresh.push(Object.assign(q,{id:IGn++}))}catch(e){}
 for(let i=fresh.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[fresh[i],fresh[j]]=[fresh[j],fresh[i]]}
 IGF=keep.concat(fresh);return fresh.length}
window.igMoreFeed=more;
let busy=0;
function append(){if(busy||typeof igv=='undefined'||igv!='feed')return;const el=document.querySelector('.ig'),end=el&&el.querySelector('.igend');if(!end)return;busy=1;
 try{const n0=el.querySelectorAll('.post').length;if(!more())return;const t=document.createElement('template');t.innerHTML=PA.ig();
  [...t.content.querySelectorAll('.post')].slice(n0).forEach(p=>end.parentNode.insertBefore(p,end))}catch(e){console.warn('feed append',e)}finally{busy=0}}
window.igAppend=append;
document.addEventListener('scroll',e=>{const end=document.querySelector('.ig .igend');if(!end)return;const c=e.target;if(c!==document&&!(c.contains&&c.contains(end)))return;
 const cb=c===document?innerHeight:c.getBoundingClientRect().bottom;if(end.getBoundingClientRect().top<cb+500)append()},true);
})();
