/* ---------- v50.3.0: song minigames in the original style ----------
   A song is a short run of activities drawn from six, unlocked by Studio Level (GT in 219-gear-tiers.js): the three originals (Beat bar, Lyrics rhyme pick, Mix hold-the-level,
   34-studio-minigames.js, run by their own code) and three new ones in the same look (Echo, Higher or Lower, Tap the Light) using the same panel, pads, buttons and timer bar.
   Difficulty is the same at every level. Each activity gives a 0..1 score; the average feeds mgFinish as the old Lyrics and Mix scores, so the quality formula, gear bonuses and
   release code are unchanged. A higher Studio Level also raises the quality ceiling (GT.qMax). Band rooms, trailers and anything not at step 0 keep the old flow.
   How it drives the originals: it starts Lyrics or Mix by calling the previous mgStage, starts Beat by resetting the beat bar, and catches the call each one makes when it ends
   (finishRec / mgStage(1) for Beat, mgStage(2) for Lyrics, mgStage(3) for Mix). */
(()=>{
const ORDER=['beat','lyrics','mix','echo','hype'];
const NM={beat:'Beat',lyrics:'Lyrics',mix:'Mix',echo:'Echo',hype:'Build It'};
const HOW={echo:'Watch the pads light up, then tap them in the same order.',hype:'Mash SPACE (or tap) to fill the meter before time runs out. 2 builds.'};
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),shuf=a=>{for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const NOTE=[262,294,330,392,440,523,587,659];
const pad=i=>{try{sfx(MG_NOTE[i],.25,'triangle',.14)}catch(e){}},nt=i=>{try{sfx(NOTE[i],.4,'triangle',.14)}catch(e){}},good=()=>{try{snd('cash')}catch(e){}},bad=()=>{try{snd('err')}catch(e){}};
let LASTH=0;
/* Beat, Lyrics and Mix always come first, in that order; unlocked extras (Echo, Build It) are added after them in random order */
function plan(){if(window.NMG_FORCE)return window.NMG_FORCE.slice();const tot=Math.min(ORDER.length,GT.mgTotal()),extra=shuf(ORDER.slice(3,tot));return ORDER.slice(0,3).concat(extra.slice(0,Math.max(0,GT.need()-3)))}
/* ---- the three new activities ---- */
const NG={
 echo:{dur:15,init(g){g.r=0;g.ok=0;g.tot=0;this.round(g)},
  round(g){const n=g.r?4:3;g.seq=Array.from({length:n},()=>ri(0,3));g.ph='show';g.t=0;g.i=0;g.lit=-1;g.pl=-1},
  tick(g,dt){g.t+=dt;if(g.ph=='show'){const k=Math.floor((g.t-.5)/.75),on=g.t>.5&&(g.t-.5)%.75<.45&&k<g.seq.length;g.lit=on?g.seq[k]:-1;if(on&&g.pl!=k){g.pl=k;pad(g.seq[k])}if(g.t>.5+g.seq.length*.75+.3){g.ph='in';g.t=0;g.lit=-1}}
   else if(g.ph=='in'){if(g.t>5)this.endR(g)}else if(g.ph=='fb'&&g.t>.6){g.r++;if(g.r>=2)g.over=1;else this.round(g)}},
  endR(g){g.tot+=g.seq.length;g.ph='fb';g.t=0},
  press(g,p){if(g.ph!='in')return;pad(p);g.lit=p;g.lt=.15;if(p==g.seq[g.i]){g.ok++;g.i++;good();if(g.i>=g.seq.length)this.endR(g)}else{bad();g.bad=p;this.endR(g)}},
  score:g=>g.tot?g.ok/g.tot:g.ok/7,txt:g=>g.ph=='show'?'Watch…':g.ph=='in'?'Your turn':'',key:null},
 hype:{dur:9,init(g){g.r=0;g.sc=[];this.round(g)},
  round(g){g.lv=0;g.best=0;g.t=0},
  tick(g,dt){g.t+=dt;g.lv=Math.max(0,g.lv-.32*dt);g.best=Math.max(g.best,g.lv);if(g.lv>=1)this.endR(g,1);else if(g.t>=4.5)this.endR(g,g.best)},
  endR(g,v){g.sc.push(cl(v));g.r++;if(g.r>=2)g.over=1;else this.round(g)},
  press(g){g.lv=Math.min(1.05,g.lv+.075);try{sfx(500+g.lv*1400,.05,'square',.05)}catch(e){}},
  score:g=>g.sc.reduce((a,b)=>a+b,0)/2,txt:g=>'· build '+Math.min(2,g.r+1)+'/2'}};
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
 if(g.lt>0)g.lt-=dt;NG[k].tick(g,dt);if(k=='echo'&&g.ph=='in'&&g.lit>=0&&!(g.lt>0))g.lit=-1;if(g.over)done(NG[k].score(g))}
function nmIn(p){const q=rec&&rec.q;if(!q||rec.st!=9||rec.wait||rec.cdn>0||!q.g)return;const d=NG[q.cur];d.press(q.g,p);if(q.g.over)done(d.score(q.g))}
window.nmIn=nmIn;
function nmDraw(){const q=rec.q,k=q.cur,g=q.g;let el=$('mg');if(!el){el=document.createElement('div');el.id='mg';document.body.appendChild(el)}
 const strip='<div class=mgs>'+planStrip()+'</div>',key=k+'|'+(rec.wait?'w':'')+(g?(g.r||0)+(g.ph||''):'');
 if(key!=MGK){MGK=key;el.className='box';el.style.bottom='';
  if(rec.wait)el.innerHTML=strip+`<b>${NM[k]}</b><p class=m style="margin:8px 0">${HOW[k]}</p><button class=go onpointerdown="mgGo()">Start (Space)</button>`;
  else if(k=='hype')el.innerHTML=strip+`<b>${NM[k]}</b> <small class=m id=nmx></small><div class=tbar><div id=nmv style="position:absolute;left:0;top:0;bottom:0;width:0;background:#2fe68a"></div></div><button class=go style="width:100%" onpointerdown="nmIn(0)">Mash! (Space)</button><div class=bar style="width:100%;height:8px"><i id=nmtm></i></div>`;
  else el.innerHTML=strip+`<b>${NM[k]}</b> <small class=m id=nmx></small><div class=mgpads>${[0,1,2,3].map(i=>`<button class=mgp style="--c:${MG_PADC[i]}" onpointerdown="nmIn(${i})">${i+1}</button>`).join('')}</div><div class=bar style="width:100%;height:8px"><i id=nmtm></i></div>`}
 if(rec.wait||!g)return;const x=$('nmx'),tm=$('nmtm'),d=NG[k];if(x)x.textContent=d.txt(g);
 if(k=='hype'){const v=$('nmv');if(v)v.style.width=Math.min(100,g.lv*100)+'%';if(tm)tm.style.width=Math.max(0,100-g.t/4.5*100)+'%'}
 else{el.querySelectorAll('.mgp').forEach((b,i)=>{b.classList.toggle('on',g.lit==i);b.style.outline=g.ph=='fb'&&g.bad==i?'3px solid #ff4455':''});if(tm)tm.style.width=g.ph=='in'?Math.max(0,100-g.t/5*100)+'%':'0%'}}
function run(names,res){const avg=res.reduce((a,b)=>a+b,0)/res.length,bonus=Math.round(avg*GT.qMax()),n0=S.nid;
 rec.sc={l:avg,x:avg};rec.miss=Math.round((1-avg)*8);rec.cdn=0;
 document.body.classList.remove('mgon');const o=$('mg');if(o)o.remove();
 mgFinish();
 try{const d=S.drafts[S.drafts.length-1];if(d&&d.id===n0){d.q+=bonus;const box=document.querySelector('#ui .box.modal');if(box){const cs=box.querySelector('.cards');if(cs){cs.innerHTML=names.map((m,i)=>`<div class=card>${m}<b>${Math.round(res[i]*100)}%</b></div>`).join('')}
  box.classList.add('nmw');if(avg>=.9&&res.every(v=>v>=.75))box.classList.add('fxperfect');
  const fq=document.getElementById('fxq');if(fq){const nf=fq.cloneNode();nf.textContent=d.q;fq.replaceWith(nf)}else{const p=box.querySelector('p.m');if(p)p.innerHTML=p.innerHTML.replace(/mix quality \d+/,'mix quality '+d.q)}}}}catch(e){console.error('nmg result',e)}}
{const t0=recTick;recTick=function(dt){if(rec&&rec.nm===undefined){rec.nm=0;if(rec.st===0&&!rec.band&&!rec.ig&&typeof GT!='undefined'&&mode=='rec'){try{const p=plan();rec.q={p,i:0,res:[],cur:p[0],g:null};if(p[0]!='beat')startItem();else rec.q.cur='beat'}catch(e){console.error('nmg',e);rec.q=null}}}
 if(rec&&rec.q&&rec.st==9){nmTick(dt);return}
 if(rec&&rec.q&&rec.st===0&&!rec.wait&&!(rec.cdn>0))dt*=beatVar(dt);return t0.apply(this,arguments)}}
/* Beat variation: every take picks a different speed pattern, starts from a random spot, and the green zone changes width after each hit */
function beatVar(dt){const r=rec;if(r.bm===undefined){r.bm=ri(0,3);r.bph=Math.random()*6;r.zb=r.zw||.08;r.lh=r.hits||0;r.bs=1;r.pos=Math.random();r.dir=Math.random()<.5?-1:1;r.bk=0}
 r.bt=(r.bt||0)+dt;if(r.hits>r.lh){r.lh=r.hits;r.zw=r.zb*(.75+Math.random()*.55);if(r.bm==3)r.bs=.75+Math.random()*.75}
 if(r.bm==0){if(r.pos>=1||r.pos<=0){if(!r.bk){r.bk=1;r.bs=.8+Math.random()*.55}}else r.bk=0;return r.bs}
 if(r.bm==1)return 1+.45*Math.sin(r.bt*2.2+r.bph);
 if(r.bm==2){const c=Math.floor(r.bt/.9+r.bph);return (c%2?1.55:.6)}
 return r.bs}

{const d0=mgDraw;mgDraw=function(){const o=$('mg');if(o&&o.offsetHeight>120)LASTH=o.offsetHeight;if(rec&&rec.q){if(rec.st==9){nmDraw();return}d0.apply(this,arguments);const s=document.querySelector('#mg .mgs');if(s)s.innerHTML=planStrip();return}return d0.apply(this,arguments)}}
addEventListener('keydown',e=>{if(!rec||!rec.q||rec.st!=9||rec.wait||(e.repeat&&rec.q.cur!='hype')||/INPUT|TEXTAREA/.test(e.target.tagName))return;const n=parseInt(e.key);if(n>=1&&n<=4&&rec.q.cur=='echo')nmIn(n-1);if((e.key==' '||e.key=='Enter'||e.key.toLowerCase()=='e')&&rec.q.cur=='hype')nmIn(0)});
{const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{const u=$('ui');if(u)u.innerHTML=u.innerHTML.replace(/Three steps:[^<]*?Costs 15 energy\./,GT.need()+' quick minigame'+(GT.need()>1?'s':'')+'. Costs 15 energy.')}catch(e){}return r}}
{const st=document.createElement('style');st.textContent='#ui>.box.modal.fxperfect{position:absolute}#ui>.box.modal.nmw{width:min(380px,92vw);box-sizing:border-box}';document.head.appendChild(st)}
window.NMG={games:NG,order:ORDER,names:NM};
})();
