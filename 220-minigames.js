/* ---------- v50.3.0: song minigames in the original style ----------
   A song is a short run of activities drawn from six, unlocked by Studio Level (GT in 219-gear-tiers.js): the three originals (Beat bar, Lyrics rhyme pick, Mix hold-the-level,
   34-studio-minigames.js, run by their own code) and three new ones in the same look (Echo, Higher or Lower, Tap the Light) using the same panel, pads, buttons and timer bar.
   Difficulty is the same at every level. Each activity gives a 0..1 score; the average feeds mgFinish as the old Lyrics and Mix scores, so the quality formula, gear bonuses and
   release code are unchanged. A higher Studio Level also raises the quality ceiling (GT.qMax). Band rooms, trailers and anything not at step 0 keep the old flow.
   How it drives the originals: it starts Lyrics or Mix by calling the previous mgStage, starts Beat by resetting the beat bar, and catches the call each one makes when it ends
   (finishRec / mgStage(1) for Beat, mgStage(2) for Lyrics, mgStage(3) for Mix). */
(()=>{
const ORDER=['beat','lyrics','mix','echo','pitch','rush'];
const NM={beat:'Beat',lyrics:'Lyrics',mix:'Mix',echo:'Echo',pitch:'Higher or Lower',rush:'Tap the Light'};
const HOW={echo:'Watch the pads light up, then tap them in the same order.',pitch:'Listen to two notes. Is the second one higher or lower?',rush:'Tap the pad that lights up, as fast as you can.'};
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),shuf=a=>{for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const NOTE=[262,294,330,392,440,523,587,659];
const pad=i=>{try{sfx(MG_NOTE[i],.25,'triangle',.14)}catch(e){}},nt=i=>{try{sfx(NOTE[i],.4,'triangle',.14)}catch(e){}},good=()=>{try{snd('cash')}catch(e){}},bad=()=>{try{snd('err')}catch(e){}};
let LASTH=0;
function plan(){const pool=ORDER.slice(0,Math.min(ORDER.length,GT.mgTotal()));let p=shuf(pool.slice()).slice(0,Math.min(GT.need(),pool.length));
 if(window.NMG_FORCE)p=window.NMG_FORCE.slice();else if(p.length>1&&pool.length>p.length&&p[0]==S.lmg)p.push(p.shift());S.lmg=p[0];return p}
/* ---- the three new activities ---- */
const NG={
 echo:{dur:15,init(g){g.r=0;g.ok=0;g.tot=0;this.round(g)},
  round(g){const n=g.r?4:3;g.seq=Array.from({length:n},()=>ri(0,3));g.ph='show';g.t=0;g.i=0;g.lit=-1;g.pl=-1},
  tick(g,dt){g.t+=dt;if(g.ph=='show'){const k=Math.floor((g.t-.5)/.75),on=g.t>.5&&(g.t-.5)%.75<.45&&k<g.seq.length;g.lit=on?g.seq[k]:-1;if(on&&g.pl!=k){g.pl=k;pad(g.seq[k])}if(g.t>.5+g.seq.length*.75+.3){g.ph='in';g.t=0;g.lit=-1}}
   else if(g.ph=='in'){if(g.t>5)this.endR(g)}else if(g.ph=='fb'&&g.t>.6){g.r++;if(g.r>=2)g.over=1;else this.round(g)}},
  endR(g){g.tot+=g.seq.length;g.ph='fb';g.t=0},
  press(g,p){if(g.ph!='in')return;pad(p);g.lit=p;g.lt=.15;if(p==g.seq[g.i]){g.ok++;g.i++;good();if(g.i>=g.seq.length)this.endR(g)}else{bad();g.bad=p;this.endR(g)}},
  score:g=>g.tot?g.ok/g.tot:g.ok/7,txt:g=>g.ph=='show'?'Watch…':g.ph=='in'?'Your turn':'',key:null},
 pitch:{dur:14,init(g){g.r=0;g.ok=0;this.round(g)},
  round(g){let a=ri(0,7),b=ri(0,7);while(Math.abs(a-b)<2)b=ri(0,7);g.a=a;g.b=b;g.t=0;g.ph='a';g.pk=-1},
  tick(g,dt){g.t+=dt;if(g.ph=='a'&&g.t>.3){g.ph='b';nt(g.a)}else if(g.ph=='b'&&g.t>1.1){g.ph='in';nt(g.b)}else if(g.ph=='in'&&g.t>4.6)this.pick(g,-2);else if(g.ph=='fb'&&g.t>.6){g.r++;if(g.r>=4)g.over=1;else this.round(g)}},
  pick(g,p){if(g.ph!='in'&&!(g.ph=='b'&&p>=0))return;if(g.ph=='b')return;g.pk=p;if(p>=0&&p==(g.b>g.a?0:1)){g.ok++;good()}else bad();g.ph='fb';g.t=0},
  score:g=>g.ok/4,txt:g=>g.ph=='in'?'Higher or lower?':g.ph=='fb'?'':'Listen…',key:null},
 rush:{dur:13,init(g){g.n=10;g.k=0;g.ok=0;g.t=0;g.lit=-1;g.gap=.4;g.res=0},
  tick(g,dt){g.t+=dt;if(g.lit<0){if(g.t>=g.gap){if(g.k>=g.n){g.over=1;return}g.lit=ri(0,3);g.t=0;g.gap=.15;pad(g.lit)}}else if(g.t>1.05){g.lit=-1;g.k++;g.t=0;g.res=-1}},
  press(g,p){if(g.lit<0)return;if(p==g.lit){g.ok++;g.res=1;good();pad(p)}else{g.res=-1;bad()}g.k++;g.lit=-1;g.t=0},
  score:g=>g.ok/g.n,txt:g=>g.k+' / '+g.n}};
/* ---- the run ---- */
function planStrip(){const q=rec.q;return q.p.map((k,i)=>i==q.i?'<b>'+(i+1)+'. '+NM[k]+'</b>':(i+1)+'. '+NM[k]).join(' → ')}
function startItem(){const q=rec.q,k=q.p[q.i];q.cur=k;q.g=null;rec.cdn=0;rec.cgo=0;
 if(k=='beat'){rec.st=0;rec.hits=0;rec.miss=0;rec.cd=0;rec.pos=0;rec.wait=0;rec.cdn=3;document.body.classList.remove('mgon');MGK=''}
 else if(k=='lyrics'){q.go=1;try{m0(1)}finally{q.go=0}}
 else if(k=='mix'){q.go=1;try{m0(2)}finally{q.go=0}}
 else{rec.st=9;rec.wait=1;rec.wt=0;MG_N[9]=NM[k];q.g={t:0,over:0};NG[k].init&&NG[k].init(q.g);document.body.classList.add('mgon');MGK=''}}
function next(){const q=rec.q;q.i++;if(q.i>=q.p.length)return finishSong();startItem()}
function done(s){const q=rec.q;q.res.push(cl(s));next()}
function finishSong(){const q=rec.q;run(q.p.map(k=>NM[k]),q.res.slice())}
let m0=null;
{m0=mgStage;mgStage=function(n){const q=rec&&rec.q;if(q&&!q.go){const c=q.cur;if((c=='beat'&&n==1)||(c=='lyrics'&&n==2)||(c=='mix'&&n==3)){if(c=='beat')return done(1-(rec.miss||0)/6);return done(c=='lyrics'?(rec.sc.l||0):(rec.sc.x||0))}}return m0.apply(this,arguments)}}
/* new activities: tick, input, drawing */
function nmTick(dt){const q=rec.q,k=q.cur,g=q.g;if(!g)return;if(rec.wait){rec.wt+=dt;return}if(rec.cdn>0){rec.cdn-=dt;if(rec.cdn<=0){rec.cdn=0;rec.cgo=.5}return}if(rec.cgo>0)rec.cgo-=dt;
 if(g.lt>0)g.lt-=dt;NG[k].tick(g,dt);if(k=='echo'&&g.ph=='in'&&g.lit>=0&&!(g.lt>0))g.lit=-1;if(g.over||(g.t>NG[k].dur&&k=='rush'))done(NG[k].score(g))}
function nmIn(p){const q=rec&&rec.q;if(!q||rec.st!=9||rec.wait||rec.cdn>0||!q.g)return;const d=NG[q.cur];if(d.press)d.press(q.g,p);else if(q.cur=='pitch')d.pick(q.g,p);if(q.g.over)done(d.score(q.g))}
window.nmIn=nmIn;
function nmDraw(){const q=rec.q,k=q.cur,g=q.g;let el=$('mg');if(!el){el=document.createElement('div');el.id='mg';document.body.appendChild(el)}
 const strip='<div class=mgs>'+planStrip()+'</div>',key=k+'|'+(rec.wait?'w':'')+(g?(g.r||0)+(g.ph||''):'');
 if(key!=MGK){MGK=key;el.className='box';el.style.bottom='';
  if(rec.wait)el.innerHTML=strip+`<b>${NM[k]}</b><p class=m style="margin:8px 0">${HOW[k]}</p><button class=go onpointerdown="mgGo()">Start (Space)</button>`;
  else if(k=='pitch')el.innerHTML=strip+`<b>${NM[k]}</b> <small class=m>· ${g.r+1}/4</small><div class="mgw px" id=nmx></div><div class=mgo style="grid-template-columns:repeat(2,1fr)"><button onpointerdown="nmIn(0)">1. Higher</button><button onpointerdown="nmIn(1)">2. Lower</button></div><div class=bar style="width:100%;height:8px"><i id=nmtm></i></div>`;
  else el.innerHTML=strip+`<b>${NM[k]}</b> <small class=m id=nmx></small><div class=mgpads>${[0,1,2,3].map(i=>`<button class=mgp style="--c:${MG_PADC[i]}" onpointerdown="nmIn(${i})">${i+1}</button>`).join('')}</div><div class=bar style="width:100%;height:8px"><i id=nmtm></i></div>`}
 if(rec.wait||!g)return;const x=$('nmx'),tm=$('nmtm'),d=NG[k];if(x)x.textContent=(k=='pitch'?'':'· ')+d.txt(g);
 if(k=='pitch'){const bs=el.querySelectorAll('.mgo button');bs.forEach((b,i)=>{b.classList.toggle('ok',g.ph=='fb'&&i==(g.b>g.a?0:1));b.classList.toggle('no',g.ph=='fb'&&i==g.pk&&i!=(g.b>g.a?0:1))});if(tm)tm.style.width=g.ph=='in'?Math.max(0,100-g.t/4.6*100)+'%':'0%'}
 else{el.querySelectorAll('.mgp').forEach((b,i)=>{const on=(k=='echo'&&(g.lit==i))||(k=='rush'&&g.lit==i);b.classList.toggle('on',on);b.style.outline=k=='echo'&&g.ph=='fb'&&g.bad==i?'3px solid #ff4455':''});if(tm)tm.style.width=k=='rush'?(g.lit>=0?Math.max(0,100-g.t/1.05*100):0)+'%':g.ph=='in'?Math.max(0,100-g.t/5*100)+'%':'0%'}}
function run(names,res){const avg=res.reduce((a,b)=>a+b,0)/res.length,bonus=Math.round(avg*GT.qMax()),n0=S.nid;
 rec.sc={l:avg,x:avg};rec.miss=Math.round((1-avg)*8);rec.cdn=0;
 const H0=Math.max(240,LASTH||300);document.body.classList.remove('mgon');const o=$('mg');if(o)o.remove();
 mgFinish();
 try{const d=S.drafts[S.drafts.length-1];if(d&&d.id===n0){d.q+=bonus;const box=document.querySelector('#ui .box.modal');if(box){const cs=box.querySelector('.cards');if(cs){cs.style.setProperty('grid-template-columns','repeat(3,1fr)','important');cs.style.setProperty('gap','6px','important');cs.innerHTML=names.map((m,i)=>`<div class=card style="padding:6px;font-size:12px">${m}<b>${Math.round(res[i]*100)}%</b></div>`).join('')}
  box.classList.add('nmres');box.style.height=H0+'px';if(avg>=.9&&res.every(v=>v>=.75)){box.classList.add('fxperfect');const h=box.querySelector('h2');if(h)h.textContent='Perfect song!'}
  const fq=document.getElementById('fxq');if(fq){const nf=fq.cloneNode();nf.textContent=d.q;fq.replaceWith(nf)}else{const p=box.querySelector('p.m');if(p)p.innerHTML=p.innerHTML.replace(/mix quality \d+/,'mix quality '+d.q)}}}}catch(e){console.error('nmg result',e)}}
{const t0=recTick;recTick=function(dt){if(rec&&rec.nm===undefined){rec.nm=0;if(rec.st===0&&!rec.band&&!rec.ig&&typeof GT!='undefined'&&mode=='rec'){try{const p=plan();rec.q={p,i:0,res:[],cur:p[0],g:null};if(p[0]!='beat')startItem();else rec.q.cur='beat'}catch(e){console.error('nmg',e);rec.q=null}}}
 if(rec&&rec.q&&rec.st==9){nmTick(dt);return}return t0.apply(this,arguments)}}
{const d0=mgDraw;mgDraw=function(){const o=$('mg');if(o&&o.offsetHeight>120)LASTH=o.offsetHeight;if(rec&&rec.q){if(rec.st==9){nmDraw();return}d0.apply(this,arguments);const s=document.querySelector('#mg .mgs');if(s)s.innerHTML=planStrip();return}return d0.apply(this,arguments)}}
addEventListener('keydown',e=>{if(!rec||!rec.q||rec.st!=9||rec.wait||e.repeat||/INPUT|TEXTAREA/.test(e.target.tagName))return;const n=parseInt(e.key);if(n>=1&&n<=4)nmIn(n-1)});
{const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{const u=$('ui');if(u)u.innerHTML=u.innerHTML.replace(/Three steps:[^<]*?Costs 15 energy\./,GT.need()+' quick minigame'+(GT.need()>1?'s':'')+'. Costs 15 energy.')}catch(e){}return r}}
window.NMG={games:NG,order:ORDER,names:NM};
{const st=document.createElement('style');st.textContent=`/* the finished-song panel keeps the exact size and place of the minigame panel (height is copied when the last game ends) */
#ui>.box.modal.nmres{position:fixed;left:50%;top:auto;bottom:90px;transform:translateX(-50%);width:min(440px,92vw);box-sizing:border-box;margin:0;padding:8px;overflow:auto;max-height:none}
#ui>.box.modal.nmres h2{font-size:15px;margin:0 0 4px;padding-bottom:4px}#ui>.box.modal.nmres p{margin:3px 0;font-size:12px}#ui>.box.modal.nmres .cards{margin:4px 0}#ui>.box.modal.nmres .card b{font-size:15px}#ui>.box.modal.nmres input{padding:4px 6px}#ui>.box.modal.nmres button{padding:6px 10px}
`;document.head.appendChild(st)}
})();
