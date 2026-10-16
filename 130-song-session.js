/* ===== v42.7.0: song sessions: 3, 2, 1 countdown before each step, adaptive Lyrics, title not pre-selected ===== */
/* Countdown: every step (Beat, Lyrics, Mix) starts with an animated 3, 2, 1, GO. Nothing ticks or counts while it runs.
   Lyrics: five lines that adapt as you play. Right and fast answers raise the level (shorter timer, trickier words and
   look-alike traps); wrong answers or timeouts lower it. S.lyrLv carries a little of your level into the next session.
   The finished song's title box is no longer focused and highlighted, so keys you were still pressing cannot overwrite it. */

/* ---- countdown ---- */
{const st=document.createElement('style');st.textContent=`#mgcd{position:fixed;left:50%;top:42%;transform:translate(-50%,-50%);z-index:6;pointer-events:none;text-align:center}
#mgcd b{display:block;font-family:Silkscreen,ui-monospace,monospace;font-size:clamp(72px,16vw,140px);line-height:1;color:var(--g);text-shadow:6px 6px 0 #000;animation:mgcdp 1s ease-out forwards}
#mgcd b.go{color:#fff;text-shadow:6px 6px 0 #000,0 0 28px var(--g);animation-duration:.5s}
#mgcd small{display:inline-block;margin-top:10px;padding:4px 10px;background:#0b0f0dd9;border:3px solid #000;box-shadow:4px 4px 0 #0008;color:var(--t);font-size:13px;letter-spacing:1px}
@keyframes mgcdp{0%{transform:scale(2.4) rotate(-8deg);opacity:0}22%{transform:scale(1) rotate(0);opacity:1}70%{transform:scale(1);opacity:1}100%{transform:scale(.7);opacity:0}}
body.mgcd #mg{visibility:hidden}
#mglv{display:block;margin-top:2px}#mglv i{font-style:normal}#mglv .up{color:#2fe68a}#mglv .dn{color:#f5c542}`;document.head.appendChild(st)}
let MGCN=null;
const mgCount=()=>{if(rec){rec.cdn=3;rec.cgo=0}};
{const s0=startRec;startRec=function(){s0.apply(this,arguments);if(rec&&mode=='rec')mgCount()}}
{const g0=mgGo;mgGo=function(){const w=rec&&rec.wait;g0.apply(this,arguments);if(w&&rec&&!rec.wait)mgCount()}}
{const t0=recTick;recTick=function(dt){if(rec&&rec.cdn>0){rec.cdn-=dt;if(rec.cdn<=0){rec.cdn=0;rec.cgo=.5}return}if(rec&&rec.cgo>0)rec.cgo-=dt;return t0.apply(this,arguments)}}
{const h0=recHit;recHit=function(){if(rec&&rec.cdn>0)return;return h0.apply(this,arguments)}}
{const p0=mgPress;mgPress=function(){if(rec&&rec.cdn>0)return;return p0.apply(this,arguments)}}
function mgCdDraw(){let el=$('mgcd');const on=mode=='rec'&&rec&&(rec.cdn>0||rec.cgo>0);document.body.classList.toggle('mgcd',!!(on&&rec.cdn>0));
 if(!on){if(el)el.remove();MGCN=null;return}
 const n=rec.cdn>0?Math.ceil(rec.cdn):0,k=rec.st+'|'+n;if(k==MGCN)return;MGCN=k;
 if(!el){el=document.createElement('div');el.id='mgcd';document.body.appendChild(el)}
 el.innerHTML=n?`<b>${n}</b><small>${MG_N[rec.st]||''}</small>`:'<b class=go>GO!</b>';snd(n?'click':'ping')}

/* ---- adaptive Lyrics ---- */
MG_HOW[1]='Pick the word that rhymes, with keys 1-3 or by tapping it. Five lines: get them right and quick and the lines speed up and get trickier, miss and they ease off.';
/* hard lines: longer rhymes, and traps that look or start like the word but do not rhyme */
const MG_HARD=[
 {b:'fire',r:['empire','admire','retire','inspire'],t:['fine','first','flair','four']},
 {b:'night',r:['satellite','dynamite','appetite','spotlight'],t:['nine','knit','neat','net']},
 {b:'heart',r:['restart','chart','apart','depart'],t:['hurt','heat','hard','heard']},
 {b:'rain',r:['hurricane','champagne','entertain','campaign'],t:['ran','ruin','grin','rang']},
 {b:'dream',r:['supreme','extreme','esteem','regime'],t:['dread','drum','dim','realm']},
 {b:'sky',r:['butterfly','lullaby','alibi','supply'],t:['skip','ski','silky','skate']},
 {b:'soul',r:['patrol','console','control','enroll'],t:['soil','sale','solo','sour']},
 {b:'crown',r:['hometown','countdown','breakdown','renown'],t:['crow','grown','cream','crate']},
 {b:'street',r:['concrete','elite','complete','obsolete'],t:['straight','state','streak','sweat']},
 {b:'love',r:['above','glove','dove','shove'],t:['live','move','loaf','cove']},
 {b:'phone',r:['microphone','cyclone','unknown','overthrown'],t:['gone','none','done','phony']},
 {b:'day',r:['holiday','runaway','display','betray'],t:['dye','dial','dry','diary']},
 {b:'wave',r:['behave','engrave','microwave','concave'],t:['have','wove','weave','wavy']},
 {b:'road',r:['episode','overload','explode','download'],t:['broad','rod','read','rude']},
 {b:'word',r:['absurd','overheard','blackbird','third'],t:['sword','lord','ward','wood']},
 {b:'mind',r:['behind','designed','rewind','unwind'],t:['mint','mine','mild','mend']},
 {b:'flow',r:['undertow','radio','overflow','below'],t:['flower','flaw','how','plow']},
 {b:'shoe',r:['tattoo','overdue','breakthrough','avenue'],t:['shoot','show','toe','foe']}];
const MG_TIER=['Easy','Tricky','Hard'];
const mgTier=d=>d<.35?0:d<.7?1:2;
const mgLim=d=>Math.round((8-4.5*d)*10)/10;
/* how alike two words look: same start, same last letter, same last two letters */
const mgSim=(a,b)=>(a[0]==b[0]?2:0)+(a.slice(-1)==b.slice(-1)?1:0)+(a.slice(-2)==b.slice(-2)?2:0)+(Math.abs(a.length-b.length)<=1?1:0);
function mgItem(d,used){const tr=mgTier(d);let base,right,wr;
 if(tr==2){const h=mgShuf(MG_HARD.filter(x=>!used[x.b]))[0]||pick(MG_HARD);base=h.b;right=pick(h.r);wr=mgShuf(h.t.slice()).slice(0,2)}
 else{const w=mgShuf(MG_RH.filter(x=>!used[x[0]]))[0]||pick(MG_RH),ok=w.filter(x=>!MG_NEAR[x]);base=ok[0];right=pick(ok.slice(1));
  const pool=mgShuf(MG_RH.filter(o=>o!==w).flat().filter(x=>!MG_NEAR[x]));
  /* Tricky picks traps that look like the word or the answer; Easy picks any other word */
  wr=tr==1?pool.sort((a,b)=>Math.max(mgSim(b,base),mgSim(b,right))-Math.max(mgSim(a,base),mgSim(a,right))).slice(0,5):pool;wr=mgShuf(wr.slice(0,5)).slice(0,2)}
 used[base]=1;return{base,right,opts:mgShuf([right,...wr]),d,tr,lim:mgLim(d)}}
{const s0=mgStage;mgStage=function(n){s0.apply(this,arguments);if(n==1&&rec){const lv=typeof S.lyrLv=='number'&&isFinite(S.lyrLv)?Math.max(0,Math.min(1,S.lyrLv)):.2,used={},N=5;
 const items=[];for(let i=0;i<N;i++)items.push(mgItem(lv,used));rec.l={i:0,ok:0,pts:0,n:N,d:lv,dir:0,lim:items[0].lim,fb:0,pk:-1,t:0,used,items}}}}
mgAnswer=function(p){const l=rec.l,it=l.items[l.i];l.pk=p;l.fb=1;const good=p>=0&&it.opts[p]==it.right,quick=Math.max(0,1-l.t/l.lim),d0=l.d;
 if(good){l.ok++;l.pts+=.85+.3*it.d;snd('cash');l.d+=.1+.12*quick}else{snd('err');l.d-=p<0?.24:.18}
 l.d=Math.max(0,Math.min(1,l.d));l.dir=l.d>d0+.001?1:l.d<d0-.001?-1:0;
 if(l.i+1<l.items.length)l.items[l.i+1]=mgItem(l.d,l.used)};
mgLyrTick=function(dt){const l=rec.l;if(l.fb>0){l.fb-=dt;if(l.fb<=0){l.pk=-1;l.t=0;
  if(++l.i>=l.items.length){rec.sc.l=Math.min(1,l.pts/l.n);const o=typeof S.lyrLv=='number'&&isFinite(S.lyrLv)?S.lyrLv:.2;S.lyrLv=Math.round((o*.5+l.d*.5)*100)/100;mgStage(2)}else l.lim=l.items[l.i].lim}return}
 l.t+=dt;if(l.t>=l.lim)mgAnswer(-1)};
function mgLvDraw(){if(mode!='rec'||!rec||rec.st!=1||rec.wait||!rec.l)return;const el=$('mg');if(!el||el.querySelector('#mglv'))return;
 const l=rec.l,it=l.items[l.i];if(!it)return;const s=el.querySelector('small.m');if(!s)return;
 s.insertAdjacentHTML('afterend',`<small id=mglv class=m>Level: ${MG_TIER[it.tr]} · ${it.lim}s${l.dir>0?' <i class=up>▲ speeding up</i>':l.dir<0?' <i class=dn>▼ easing off</i>':''}</small>`)}

/* ---- finished song: leave the title box unfocused and unselected ---- */
const mgNoSel=()=>setTimeout(()=>{const i=$('tin');if(!i)return;if(document.activeElement===i)i.blur();try{i.setSelectionRange(i.value.length,i.value.length);getSelection().removeAllRanges()}catch(e){}},90);
{const f0=mgFinish;mgFinish=function(){const r=f0.apply(this,arguments);mgNoSel();return r}}
{const n0=nameModal;nameModal=function(){const r=n0.apply(this,arguments);mgNoSel();return r}}

{const u=update;update=function(dt){u(dt);mgCdDraw();mgLvDraw()}}
