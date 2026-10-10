/* ===== v26.14: a recording session is now four short minigames: Beat, Melody, Lyrics, Mix ===== */
/* Beat is the old timing bar (now 6 hits). Melody: watch and repeat a pad pattern. Lyrics: pick the word that rhymes before time runs out. Mix: hold to keep the level in a moving green band.
   How well you do in Melody, Lyrics and Mix replaces most of the random part of the song's mix quality. */
const MG_N=['Beat','Melody','Lyrics','Mix'],MG_NOTE=[262,330,392,523],MG_PADC=['#ff5a5a','#f5c542','#2fe68a','#5aa8ff'],MG_LEN=[3,4,5];
const MG_RH=[['fire','higher','wire','desire','liar'],['night','light','tonight','bright','fight'],['heart','apart','start','art','dark'],['rain','pain','again','chain','lane'],['city','pretty','gritty','pity','witty'],['dream','scream','team','stream','beam'],['street','beat','heat','feet','sweet'],['sky','fly','high','goodbye','cry'],['money','honey','funny','sunny','bunny'],['day','away','stay','play','okay'],['soul','control','whole','roll','gold'],['phone','alone','home','stone','own'],['crown','down','town','around','frown'],['love','above','enough','glove','of']];
/* words that only nearly rhyme with the first of their list are never offered as the right answer or as a trap */
const MG_NEAR={dark:1,lane:1,home:1,gold:1,enough:1,of:1,around:1,liar:1};
let MGH=0,MGK='';
addEventListener('pointerdown',()=>MGH=1);addEventListener('pointerup',()=>MGH=0);addEventListener('pointercancel',()=>MGH=0);addEventListener('blur',()=>MGH=0);
const mgShuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};

{const s0=startRec;startRec=function(i){s0(i);if(rec){rec.goal=6;rec.st=0;rec.sc={}}}}
{const r0=recMenu;recMenu=function(){r0();const u=$('ui');if(u&&u.innerHTML.includes('Hit the green zone 10 times'))u.innerHTML=u.innerHTML.replace('Hit the green zone 10 times to finish the song.','Four steps: Beat (hit the green 6 times), Melody (repeat the pattern), Lyrics (pick the rhyme), Mix (hold the level in the green).')}}
/* the beat bar calls finishRec when its hits are done: move on to the next step instead */
finishRec=function(){if(!rec)return;if(rec.st===0)return mgStage(1);mgFinish()};
{const t0=recTick;recTick=function(dt){if(!rec)return;if(!rec.st)return t0(dt);if(rec.st==1)mgMelTick(dt);else if(rec.st==2)mgLyrTick(dt);else if(rec.st==3)mgMixTick(dt)}}
{const h0=recHit;recHit=function(){if(rec&&!rec.st)h0()}}

function mgStage(n){snd('pop');rec.st=n;
 if(n==1){rec.m={r:0,ok:0,tot:MG_LEN.reduce((a,b)=>a+b,0),lit:-1,lt:0};mgMelRound()}
 else if(n==2){const g=mgShuf(MG_RH.slice()).slice(0,4);rec.l={i:0,ok:0,lim:5,fb:0,pk:-1,items:g.map(w=>{const ok=w.filter(x=>!MG_NEAR[x]),base=ok[0],right=pick(ok.slice(1)),pool=MG_RH.filter(o=>o!==w).flat().filter(x=>!MG_NEAR[x]);const wr=mgShuf(pool).slice(0,2);return{base,right,opts:mgShuf([right,...wr])}}),t:0}}
 else if(n==3)rec.x={t:0,dur:6,lv:.15,in:0,c:.5};
 else mgFinish()}

/* ---- Melody: watch the pads light up, then play them back ---- */
function mgMelRound(){const m=rec.m;m.seq=Array.from({length:MG_LEN[m.r]},()=>Math.random()*4|0);m.ph='show';m.t=-.4;m.k=-1;m.i=0}
function mgLight(p){const m=rec.m;m.lit=p;m.lt=.3;sfx(MG_NOTE[p],.28,'triangle',.12)}
function mgMelTick(dt){const m=rec.m;m.lt=Math.max(0,m.lt-dt);if(m.lt<=0)m.lit=-1;m.t+=dt;
 if(m.ph=='show'){const k=Math.floor(m.t/.55);if(m.t>=0&&k!=m.k&&k<m.seq.length){m.k=k;mgLight(m.seq[k])}if(m.t>m.seq.length*.55+.15){m.ph='input';m.t=0}}
 else if(m.ph=='pause'&&m.t>.9){if(++m.r>=MG_LEN.length){rec.sc.m=m.ok/m.tot;mgStage(2)}else mgMelRound()}}
function mgPress(p){if(!rec||mode!='rec')return;if(rec.st==1){const m=rec.m;if(m.ph!='input')return;mgLight(p);
  if(p==m.seq[m.i]){m.i++;m.ok++;if(m.i>=m.seq.length){snd('cash');m.ph='pause';m.res=1;m.t=0}}else{snd('err');m.ph='pause';m.res=0;m.t=0}}
 else if(rec.st==2){const l=rec.l;if(l.fb>0)return;mgAnswer(p)}}

/* ---- Lyrics: pick the word that rhymes before the timer runs out ---- */
function mgAnswer(p){const l=rec.l,it=l.items[l.i];l.pk=p;l.fb=.7;if(p>=0&&it.opts[p]==it.right){l.ok++;snd('cash')}else snd('err')}
function mgLyrTick(dt){const l=rec.l;if(l.fb>0){l.fb-=dt;if(l.fb<=0){l.pk=-1;l.t=0;if(++l.i>=l.items.length){rec.sc.l=l.ok/l.items.length;mgStage(3)}}return}l.t+=dt;if(l.t>=l.lim)mgAnswer(-1)}

/* ---- Mix: hold to raise the level, let go to drop it, keep it in the moving green band ---- */
function mgMixTick(dt){const x=rec.x,hold=keys[' ']||keys.e||keys.enter||MGH;x.t+=dt;x.lv=Math.max(0,Math.min(1,x.lv+(hold?1.15:-.95)*dt));
 x.c=Math.max(.15,Math.min(.85,.5+.28*Math.sin(x.t*1.25)+.12*Math.sin(x.t*3.3+1)));if(Math.abs(x.lv-x.c)<.1)x.in+=dt;
 if(x.t>=x.dur){rec.sc.x=Math.min(1,x.in/x.dur*1.15);mgStage(4)}}

function mgFinish(){chime();const sc=rec.sc,m=sc.m||0,l=sc.l||0,x=sc.x||0,avg=(m+l+x)/3,q=Math.round(R(8,14)+avg*16+S.gear.chair*4+S.gear.mic*8+S.gear.guitar*6+(S.gear.keys||0)*3+(S.gear.drums||0)*3+(S.gear.booth||0)*5+(S.home||0)*3+S.pets.length+mentors()*2+Math.max(0,8-rec.miss)),
 d={id:S.nid++,title:rec.diss?'No Love For '+rec.diss.split(' ')[0]:pick(A)+' '+pick(Bn),g:rec.g,q,diss:rec.diss};S.drafts.push(d);updateVersion();const miss=rec.miss;rec=null;mode='menu';mgDraw();
 const pc=v=>Math.round(v*100)+'%',grade=avg>=.9?'Studio magic ✨':avg>=.7?'Solid session':avg>=.45?'Rough around the edges':'Messy take';
 $('ui').innerHTML=`<div class="box modal"><h2>Song recorded! 🎵</h2><p class=m>${esc(d.g)} · mix quality ${q} · ${grade}</p><div class=cards><div class=card>Beat<b>${miss?miss+' miss'+(miss>1?'es':''):'Clean'}</b></div><div class=card>Melody<b>${pc(m)}</b></div><div class=card>Lyrics<b>${pc(l)}</b></div><div class=card>Mix<b>${pc(x)}</b></div></div><p>Give it a title:</p><input id=tin maxlength=32 value="${esc(d.title)}" onkeydown="if(event.key=='Enter')saveT(${d.id})"><div class=row2><button class=go onclick="saveT(${d.id})">Save to drafts</button></div><p class=m><small>Upload it from the computer. You can still edit the title there.</small></p></div>`;setTimeout(()=>{const i=$('tin');i&&(i.focus(),i.select())},50)}

/* number keys pick a pad (Melody) or an answer (Lyrics) */
addEventListener('keydown',e=>{if(mode!='rec'||!rec||/INPUT|TEXTAREA/.test(e.target.tagName))return;const n=parseInt(e.key);if(rec.st==1&&n>=1&&n<=4)mgPress(n-1);else if(rec.st==2&&n>=1&&n<=3)mgPress(n-1)});

/* ---- drawing: own panel over the HUD; rebuilt only when the step changes, live bits updated every frame ---- */
{const st=document.createElement('style');st.textContent=`#mg{position:fixed;left:50%;transform:translateX(-50%);width:min(440px,92vw);z-index:5;pointer-events:auto;text-align:center}#mg.strip{bottom:260px;padding:5px 10px;pointer-events:none}#mg:not(.strip){bottom:90px}
.mgs{font-size:12px;color:var(--m);margin-bottom:6px}.mgs b{color:#2fe68a}#mg.strip .mgs{margin:0}
.mgpads{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}.mgp{height:64px;background:var(--c);border:3px solid #000;opacity:.3;font:inherit;font-size:18px;color:#000;cursor:pointer;transition:opacity .08s}.mgp.on{opacity:1;box-shadow:0 0 16px var(--c)}
.mgo{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}.mgo button.ok{background:#2fe68a;color:#000}.mgo button.no{background:#ff4455}
.mgw{font-size:22px;margin:6px 0;letter-spacing:1px}body.mgon #hud .hb.modal{display:none}`;document.head.appendChild(st)}
function mgDraw(){let el=$('mg');const on=mode=='rec'&&rec&&rec.st!=null;document.body.classList.toggle('mgon',!!(on&&rec.st>0));
 if(!on){if(el)el.remove();MGK='';return}
 if(!el){el=document.createElement('div');el.id='mg';document.body.appendChild(el)}
 const strip='<div class=mgs>'+MG_N.map((n,i)=>i==rec.st?'<b>'+(i+1)+'. '+n+'</b>':(i+1)+'. '+n).join(' → ')+'</div>';
 const key=rec.st+'|'+(rec.m?rec.m.r+rec.m.ph:'')+'|'+(rec.l?rec.l.i:'');
 if(key!=MGK){MGK=key;el.className=rec.st?'box':'hb strip';el.style.bottom='';
  if(rec.st==0)el.innerHTML=strip;
  else if(rec.st==1){const m=rec.m;el.innerHTML=strip+`<b>Melody</b> <small class=m>· pattern ${m.r+1}/${MG_LEN.length} · ${m.seq.length} notes</small><div class=mgpads>${MG_PADC.map((c,i)=>`<button class=mgp style="--c:${c}" onpointerdown="mgPress(${i})">${i+1}</button>`).join('')}</div><small class=m id=mgtx></small>`}
  else if(rec.st==2){const l=rec.l,it=l.items[l.i];el.innerHTML=strip+`<b>Lyrics</b> <small class=m>· line ${l.i+1}/${l.items.length}</small><div class=m style="margin-top:6px">Finish the bar with a word that rhymes with</div><div class="mgw px">"${esc(it.base)}"</div><div class=mgo>${it.opts.map((o,i)=>`<button onpointerdown="mgPress(${i})">${i+1}. ${esc(o)}</button>`).join('')}</div><div class=bar style="width:100%;height:8px"><i id=mgtm></i></div><small class=m>Keys 1-3 or tap a word</small>`}
  else if(rec.st==3)el.innerHTML=strip+`<b>Mix</b> <small class=m>· keep the level in the green</small><div class=tbar><div class=tg id=mgband style="width:20%"></div><div class=ti id=mgknob></div></div><div class=bar style="width:100%;height:8px"><i id=mgtm></i></div><small class=m>Hold SPACE or hold click to raise the level, let go to drop it</small>`}
 if(rec.st==0){/* sit just above the beat bar's HUD panel */const hb=document.querySelector('#hud .hb.modal');if(hb){const b=Math.round(innerHeight-hb.getBoundingClientRect().top+6)+'px';if(el.style.bottom!=b)el.style.bottom=b}}
 else if(rec.st==1){const m=rec.m;el.querySelectorAll('.mgp').forEach((b,i)=>b.classList.toggle('on',m.lit==i));const tx=$('mgtx'),s=m.ph=='show'?'Watch and listen…':m.ph=='input'?'Your turn: '+m.i+'/'+m.seq.length+' · keys 1-4 or tap the pads':m.res?'Nailed it!':'Wrong note, next pattern';if(tx&&tx.textContent!=s)tx.textContent=s}
 else if(rec.st==2){const l=rec.l,it=l.items[l.i],tm=$('mgtm');if(tm)tm.style.width=Math.max(0,100-l.t/l.lim*100)+'%';el.querySelectorAll('.mgo button').forEach((b,i)=>{b.classList.toggle('ok',l.fb>0&&it.opts[i]==it.right);b.classList.toggle('no',l.fb>0&&i==l.pk&&it.opts[i]!=it.right)})}
 else if(rec.st==3){const x=rec.x,b=$('mgband'),k=$('mgknob'),tm=$('mgtm');if(b)b.style.left=(x.c-.1)*100+'%';if(k){k.style.left=x.lv*100+'%';k.style.background=Math.abs(x.lv-x.c)<.1?'#2fe68a':'#fff'}if(tm)tm.style.width=Math.max(0,100-x.t/x.dur*100)+'%'}}
{const u=update;update=function(dt){u(dt);mgDraw()}}
