/* ===== v49.24.0: game feel =====
   No new features: the same steps, screens and numbers, with feedback that makes playing them feel better.
   Song sessions
   - Beat: every hit is rated Perfect, Great or Good (how close to the middle it lands) with a combo count and a note that
     climbs with the combo. A Perfect gives the camera a small kick and adds a little quality (+0.5 each, at most +3; the random
     part of a song's quality in 34-studio-minigames.js is a little smaller to make room, so an average session scores as before).
   - Lyrics: right answers in a row build a streak with rising notes, and quick answers say so. A wrong one gives a small shake.
   - Mix: the beat fills out while the level is in the green (67-beats.js), the header shows how much of the take was in the
     green, and every full second held in the green counts up with a note.
   - The song's beat swells on each good hit or answer (rec.swell, read by 67-beats.js).
   - Results: the cards pop in one by one, the quality counts up, Beat shows your Perfect hits, and one line says how the song
     compares with your last and your best.
   Gear you can feel (each line still adds its quality as before): Microphone widens the Beat green zone, Drums give an extra go,
   Guitar adds 0.5 s to each Lyrics line, Keyboard fades out a wrong word part way through each line, Acoustics widen the Mix
   band, Headphones make the Mix level move more smoothly, the Mixing desk slows the Mix band's drift, and each Chair level makes
   a song cost 1 less energy. All per level. The Gear shop says what each one changes, and the countdown before a step names the
   gear helping you in it. The first three songs get a slightly wider Beat zone while you learn.
   Progress
   - The morning results count up (as they do in the trailer), say when it was your best day yet, and show progress bars to
     the next monthly listener milestone and, later on, to your closest song's next plaque.
   - A new career gets a toast at its first stream, 10 streams and 100 streams while it is out and about (passed quietly when
     they come in overnight, since the morning card shows them).
   Respects prefers-reduced-motion (no camera kick or shake). The trailer sets its own morning numbers, so the morning card is
   left alone in trailer mode. */
(()=>{
const TR=()=>typeof TRL!='undefined'&&TRL.on;
const gv=k=>(S&&S.gear&&+S.gear[k])||0;
const calm=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
const gname=k=>{try{return GEAR[k].lv[gv(k)]}catch(e){return k}};

/* ---------- styles ---------- */
{const st=document.createElement('style');st.textContent=`
.fxp{position:fixed;z-index:7;pointer-events:none;transform:translate(-50%,-100%);font:700 17px Silkscreen,ui-monospace,monospace;text-shadow:2px 2px 0 #000,0 0 8px #000;white-space:nowrap;text-align:center;animation:fxp .9s ease-out forwards}
.fxp small{display:block;font-size:11px;color:#fff;text-shadow:2px 2px 0 #000}.fxp.big{font-size:24px}.fxp.dim{font-size:13px;text-shadow:2px 2px 0 #000}
@keyframes fxp{0%{transform:translate(-50%,-60%) scale(.5);opacity:0}14%{transform:translate(-50%,-100%) scale(1.2);opacity:1}28%{transform:translate(-50%,-100%) scale(1)}70%{opacity:1}100%{transform:translate(-50%,-175%);opacity:0}}
#mg.fxsh{animation:fxsh .28s}@keyframes fxsh{0%,100%{margin-left:0}20%{margin-left:-7px}40%{margin-left:6px}60%{margin-left:-4px}80%{margin-left:2px}}
#mg .mgo button.ok{animation:fxok .35s ease-out}@keyframes fxok{0%{transform:scale(1)}40%{transform:scale(1.12);box-shadow:0 0 18px #2fe68a}100%{transform:scale(1)}}
#mg .mgo button.fxfd{opacity:.28;text-decoration:line-through;transition:opacity .3s}
#mg.fxin #mgband{box-shadow:0 0 14px #2fe68a,inset 0 0 0 2px #b8ffd9}
#mgcd small i{display:block;margin-top:4px;font-style:normal;color:#ffd27a;font-size:11px;letter-spacing:0}
#ui .cards.fxcards .card{animation:fxcd .45s cubic-bezier(.2,1.6,.4,1) both}@keyframes fxcd{0%{transform:translateY(14px) scale(.85);opacity:0}100%{transform:none;opacity:1}}
#ui .card b small,#ui .card small.fxbd{display:block;font-size:11px;color:#ffd27a}
.fxline{margin:6px 0;font-size:13px}.fxline.best{color:#ffd27a;font-weight:700;animation:fxcd .5s .5s both}
.fxgoal{margin:8px 0;text-align:left;font-size:12px;color:var(--m)}.fxgoal b{color:var(--t)}.fxgoal .bar{width:100%;height:7px;margin-top:3px}.fxgoal .bar i{transition:width 1.2s cubic-bezier(.2,.8,.2,1)}
.gfeel{display:block;margin-top:2px;color:#ffd27a!important}`;document.head.appendChild(st)}

/* ---------- little helpers: popups, notes ---------- */
function pop(t,sub,x,y,c,cls){const e=document.createElement('div');e.className='fxp'+(cls?' '+cls:'');e.style.left=Math.round(x)+'px';e.style.top=Math.round(y)+'px';e.style.color=c||'#2fe68a';
 e.innerHTML=t+(sub?'<small>'+sub+'</small>':'');document.body.appendChild(e);setTimeout(()=>e.remove(),950)}
/* a major pentatonic run: each step of a combo or streak plays the next note up */
const PENT=[0,2,4,7,9,12,14,16,19,21,24];
function note(n,v){try{const f=523.25*Math.pow(2,PENT[Math.max(0,Math.min(PENT.length-1,n))]/12);sdHit(f,.22,v||.08,[[1,1,1],[2,.3,.6],[3,.12,.4]],{rev:.25,jit:0,lp:8000})}catch(e){}}
function arp(n){for(let i=0;i<n;i++)setTimeout(()=>note(i*2,.07),i*90)}
const kick=a=>{if(!calm()&&typeof viewH=='number')viewH-=a};
const shake=()=>{if(calm())return;const m=$('mg');if(!m)return;m.classList.remove('fxsh');void m.offsetWidth;m.classList.add('fxsh')};
const swell=(r,a)=>{if(r)r.swell=Math.min(.4,(r.swell||0)+a)};
const rectOf=sel=>{const e=typeof sel=='string'?document.querySelector(sel):sel;return e&&e.getBoundingClientRect()};

/* ---------- gear you can feel ---------- */
const GF={mic:'Beat: a wider green zone each level',drums:'Beat: +1 go each level',guitar:'Lyrics: +0.5 s on every line each level',keys:'Lyrics: a wrong word fades out, sooner each level',
 booth:'Mix: a wider green band each level',phones:'Mix: the level moves more smoothly each level',desk:'Mix: the green band drifts slower each level',chair:'Every song costs 1 less energy each level'};
/* which gear helps in which step, and the short name the countdown uses */
const GFS={0:['mic','drums'],1:['guitar','keys'],2:['booth','phones','desk']};
const GFT={mic:'wider green',guitar:'more time',keys:'a wrong word fades',booth:'wider band',phones:'smoother level',desk:'slower band'};
window.gFeel=k=>GF[k]?'<small class=gfeel>In the studio: '+GF[k]+'</small>':'';
const KFADE=[0,.7,.5,.3];
const isNew=()=>{try{return mgNew()}catch(e){return false}};
{const s0=startRec;startRec=function(){const e0=S.energy;const r=s0.apply(this,arguments);
 try{if(rec&&mode=='rec'){rec.zw=.08+.012*gv('mic')+(isNew()?.02:0);rec.goes+=gv('drums');rec.cmb=0;rec.pf=0;rec.swell=0;
  const c=Math.min(gv('chair'),3);if(c&&isFinite(e0)&&S.energy<e0)S.energy=Math.min(e0,S.energy+c)}}catch(e){console.error('feel start',e)}return r}}
{const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{const c=Math.min(gv('chair'),3);if(c){const h=document.querySelector('#ui .box.modal .rech');if(h)h.innerHTML=h.innerHTML.replace('Costs 15 energy','Costs '+(15-c)+' energy')}}catch(e){}return r}}
{const i0=mgItem;mgItem=function(){const it=i0.apply(this,arguments);try{const g=gv('guitar');if(g&&it)it.lim=Math.round((it.lim+.5*g)*10)/10}catch(e){}return it}}
{const s0=mgStage;mgStage=function(n){const r=s0.apply(this,arguments);try{if(n==2&&rec&&rec.x){const x=rec.x;x.bw=.1+.02*gv('booth');x.rt=1-.1*gv('phones');x.sp=1-.1*gv('desk');x.lk=0}}catch(e){}return r}}
{const b0=buy;buy=function(k){const l=gv(k);const r=b0.apply(this,arguments);try{if(gv(k)>l&&GF[k])setTimeout(()=>say('🎛 You will feel it in the studio. '+GF[k].replace(/,? (sooner )?each level$/,'')),600)}catch(e){}return r}}
/* the countdown names the gear helping in the step that is about to start */
function cdPerks(){const el=$('mgcd'),s=el&&el.querySelector('small');if(!s||s.dataset.fx||!rec)return;s.dataset.fx=1;
 const L=(GFS[rec.st]||[]).filter(k=>gv(k)>0).map(k=>gname(k)+': '+(k=='drums'?'+'+gv(k)+' go'+(gv(k)>1?'es':''):GFT[k]));
 if(rec.st==0&&isNew())L.push('learning: wider green');if(L.length)s.insertAdjacentHTML('beforeend','<i>'+esc(L.join(' · '))+'</i>')}

/* ---------- Beat: Perfect / Great / Good, combo ---------- */
const BJ=[['PERFECT','#ffd27a'],['GREAT','#2fe68a'],['GOOD','#9fd8ff']];
{const h0=recHit;recHit=function(){const r0=rec;if(!r0||r0.st||r0.cd>0||r0.cdn>0)return h0.apply(this,arguments);const pos=r0.pos,hits=r0.hits,miss=r0.miss;
 const r=h0.apply(this,arguments);try{if(r0.hits>hits)beatHit(r0,Math.abs(pos-.5),pos);else if(r0.miss>miss)beatMiss(r0,pos)}catch(e){}return r}}
/* above the beat panel, over the marker */
function barAt(pos){const b=rectOf('#hud .hb.modal .tbar'),h=rectOf('#hud .hb.modal');return b&&h?[b.left+pos*b.width,h.top-2]:[innerWidth/2,innerHeight*.7]}
function beatHit(r,d,pos){const zw=r.zw||.08,k=d<zw*.35?0:d<zw*.7?1:2;r.cmb=(r.cmb||0)+1;if(!k)r.pf=(r.pf||0)+1;
 const[x,y]=barAt(pos),last=r.hits>=r.goal;pop(BJ[k][0],r.cmb>1?'x'+r.cmb+' combo':'',x,y,BJ[k][1],last?'big':'');
 note(r.cmb-1+(k?0:1));swell(r,k?.15:.25);if(!k)kick(.18);if(last)try{tutBurst(x,y,k?12:20)}catch(e){}}
function beatMiss(r,pos){r.cmb=0;const[x,y]=barAt(pos);pop('MISS',r.goes>0?r.goes+' go'+(r.goes==1?'':'es')+' left':'',x,y,'#ff8a8a','dim')}

/* ---------- Lyrics: streaks, quick answers ---------- */
{const a0=mgAnswer;mgAnswer=function(p){const r0=rec,l=r0&&r0.l,it=l&&l.items&&l.items[l.i],t=l?l.t:0,lim=l?l.lim:1;
 let at=null;try{const bs=document.querySelectorAll('#mg .mgo button');at=rectOf(p>=0&&bs[p]?bs[p]:'#mg .mgw')}catch(e){}
 const r=a0.apply(this,arguments);
 try{if(!l||!it||r0.ig)return r;const good=p>=0&&it.opts[p]==it.right,x=at?at.left+at.width/2:innerWidth/2,y=at?at.top:innerHeight*.6;
  if(good){l.stk=(l.stk||0)+1;const q=t<lim*.4;pop(l.stk>=3?'ON FIRE':q?'QUICK!':'RHYME!',l.stk>1?l.stk+' in a row':'',x,y,l.stk>=3?'#ffd27a':'#2fe68a');note(l.stk+(q?1:0));swell(r0,.3)}
  else{l.stk=0;pop(p<0?'TOO SLOW':'NOPE','',x,y,'#ff8a8a','dim');shake()}}catch(e){}return r}}
function keysFade(){const l=rec.l,it=l&&l.items&&l.items[l.i],f=KFADE[Math.min(3,gv('keys'))];if(!it||!f||l.fb>0)return;
 if(it.fd==null){const w=it.opts.map((o,i)=>o==it.right?-1:i).filter(i=>i>=0);it.fd=w[Math.random()*w.length|0]}
 if(l.t>=l.lim*f){const b=document.querySelectorAll('#mg .mgo button')[it.fd];if(b&&!b.classList.contains('fxfd'))b.classList.add('fxfd')}}

/* ---------- Mix: in the green, locked-in seconds ---------- */
function mixTick(dt){const x=rec.x,m=$('mg');if(!x||!m)return;m.classList.toggle('fxin',!!x.inb);
 const h=m.querySelector('b+small.m');if(h&&x.t>.3){const t='· in the green '+Math.round(Math.min(1,x.in/x.t)*100)+'%';if(h.textContent!=t)h.textContent=t}
 if(x.inb){const a=Math.floor(x.lk||0);x.lk=(x.lk||0)+dt;const b=Math.floor(x.lk);if(b>a){const k=rectOf('#mgknob')||rectOf('#mg .tbar');pop('LOCKED IN',b+'s',k?k.left+k.width/2:innerWidth/2,k?k.top-4:innerHeight*.6,b>=3?'#ffd27a':'#2fe68a');note(b+1);swell(rec,.2)}}
 else x.lk=0}

/* ---------- every frame ---------- */
{const u=update;update=function(dt){u(dt);if(mode!='rec'||!rec)return;try{if(rec.swell>0)rec.swell=Math.max(0,rec.swell-dt*.6);cdPerks();
 if(rec.wait||rec.cdn>0||rec.ig)return;if(rec.st==1&&rec.l)keysFade();else if(rec.st==2)mixTick(dt)}catch(e){}}}

/* ---------- results: the end of a session is the moment people remember ---------- */
const qOf=s=>isFinite(+s.q)?+s.q:0;
function countUp(el,from,to,ms,fmt,tick){if(!el)return;const t0=performance.now();let lt=0;const f=fmt||(v=>Math.round(v).toLocaleString());
 (function step(n){const k=Math.min(1,(n-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=f(from+(to-from)*e);if(tick&&k<1&&n-lt>70){lt=n;tick(k)}if(k<1&&el.isConnected)requestAnimationFrame(step);else el.textContent=f(to)})(t0)}
{const f0=mgFinish;mgFinish=function(){const n0=S.nid,mine=[...(S.songs||[]),...(S.drafts||[])].filter(s=>s&&!s.ft),best=mine.reduce((a,s)=>Math.max(a,qOf(s)),0),
 last=mine.slice().sort((a,b)=>(b.id||0)-(a.id||0))[0],pf=rec&&rec.pf||0,band=!!(rec&&rec.band>1);
 const r=f0.apply(this,arguments);
 try{const d=S.drafts[S.drafts.length-1],box=document.querySelector('#ui .box.modal');if(!d||d.id!==n0||!box)return r;
  const cs=box.querySelector('.cards');if(cs)cs.classList.add('fxcards'),cs.querySelectorAll('.card').forEach((c,i)=>c.style.animationDelay=(.15+i*.14)+'s');
  const bc=cs&&[...cs.querySelectorAll('.card')].find(c=>c.firstChild&&c.firstChild.textContent=='Beat'),bb=bc&&bc.querySelector('b');if(bb&&pf)bb.insertAdjacentHTML('beforeend','<small>'+pf+' perfect</small>');
  const p=box.querySelector('p.m');if(p){p.innerHTML=p.innerHTML.replace(/mix quality \d+/,'mix quality <b id=fxq>'+d.q+'</b>');countUp($('fxq'),0,d.q,700,null,()=>note(1,.03))}
  let line='';if(best>0&&d.q>best){line=`<p class="fxline best">⭐ New best! Your highest quality song yet (was ${best})</p>`;setTimeout(()=>{arp(5);glBurst(34)},650)}
  else if(last&&d.q>qOf(last))line=`<p class="fxline" style="color:var(--g)">▲ ${d.q-qOf(last)} better than your last song</p>`;
  else if(best>0&&!band)line=`<p class="fxline m">Your best is ${best}. Perfect beats, quick rhymes and a steady mix push it higher.</p>`;
  if(line&&p)p.insertAdjacentHTML('afterend',line);
  if(/Studio magic/.test(box.textContent)&&!(best>0&&d.q>best))setTimeout(()=>{arp(4);glBurst(20)},650)}catch(e){console.error('feel results',e)}return r}}

/* ---------- morning results: counting up, best day, what is next ---------- */
const LM=[100,1e3,1e4,1e5,1e6,1e7,1e8,1e9],PQN=[[1e6,'Gold'],[1e7,'Platinum'],[1e8,'Diamond'],[1e9,'Billions Club']];
const big=n=>n>=1e9?+(n/1e9).toFixed(1)+'B':n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e3?+(n/1e3).toFixed(1)+'K':String(n);
const num=s=>+String(s).replace(/[^\d.]/g,'')||0;
function nextGoals(){const out=[],L=+S.listeners||0,i=LM.findIndex(t=>L<t);
 if(i>=0){const lo=i?LM[i-1]:0,pc=Math.max(0,Math.min(99,Math.floor((L-lo)/(LM[i]-lo)*100)));out.push(['Next milestone: <b>'+big(LM[i])+' monthly listeners</b>',pc])}
 let bs=null,br=0;(S.songs||[]).forEach(s=>{const t=PQN.find(p=>(s.streams||0)<p[0]);if(!t)return;const k=(s.streams||0)/t[0];if(k>br){br=k;bs=[s,t]}});
 if(bs&&br>=.2)out.push(['Closest plaque: <b>"'+esc(bs[0].title)+'"</b> to '+bs[1][1],Math.floor(br*100)]);return out}
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);if(TR())return r;
 try{const box=document.querySelector('#ui .box.modal'),h=box&&box.querySelector('h2');if(!h||!/Day \d/.test(h.textContent))return r;
  const C=[...box.querySelectorAll('.card')],card=l=>C.find(c=>c.firstChild&&c.firstChild.textContent==l),cs=box.querySelector('.cards');if(cs)cs.classList.add('fxcards'),C.forEach((c,i)=>c.style.animationDelay=(.1+i*.12)+'s');
  const sb=card('Streams')&&card('Streams').querySelector('b'),eb=card('Earned')&&card('Earned').querySelector('b'),lb=card('Monthly listeners')&&card('Monthly listeners').querySelector('b');
  const tot=sb?num(sb.textContent):0,H=S.hist||[],prev=H.slice(0,-1).reduce((a,x)=>Math.max(a,x.st||0),0);
  if(sb&&tot>0)countUp(sb,0,tot,1100,v=>'+'+Math.round(v).toLocaleString(),k=>note(Math.floor(k*6),.025));
  if(eb&&tot>0){const m=/([^\d]*)(\d+(?:\.\d+)?)(.*)/.exec(eb.textContent);if(m){const to=num(m[2]);countUp(eb,0,to,1100,v=>m[1]+v.toFixed(2)+m[3])}}
  if(lb){const m=/^([\d,]+)\s*→\s*([\d,]+)$/.exec(lb.textContent.trim());if(m){const a=num(m[1]),b=num(m[2]);if(b>a)countUp(lb,a,b,1100,v=>m[1]+' → '+Math.round(v).toLocaleString())}}
  if(tot>0)setTimeout(()=>{try{snd('cash')}catch(e){}},1150);
  if(sb&&tot>0&&H.length>2&&tot>prev){sb.parentNode.insertAdjacentHTML('beforeend','<small class=fxbd>Best day yet!</small>');setTimeout(()=>{arp(4);glBurst(24)},1200)}
  const G=(S.songs||[]).length?nextGoals():[],btn=box.querySelector('button.go');
  if(G.length&&btn){btn.insertAdjacentHTML('beforebegin',G.map(([t,pc])=>`<div class=fxgoal>${t} · ${pc}%<div class=bar><i style="width:0" data-w="${pc}"></i></div></div>`).join(''));
   setTimeout(()=>box.querySelectorAll('.fxgoal i[data-w]').forEach(i=>i.style.width=i.dataset.w+'%'),350)}}catch(e){console.error('feel morning',e)}return r}}

/* ---------- a new career's first streams ---------- */
const FST=[[1,t=>'🎧 Your first stream! Someone just played "'+t+'".'],[10,()=>'🎧 10 streams already. Every song you release adds more.'],[100,()=>'🎧 100 streams! People are finding your music.']];
setInterval(()=>{try{if(TR()||typeof S!='object'||!S||!S.artist||!Array.isArray(S.songs)||document.getElementById('load')||mode=='load'||mode=='title')return;
 const n=+S.streams||0;if(S.fst==null){S.fst=FST.filter(f=>n>=f[0]).length;return}if(S.fst>=FST.length||n<FST[S.fst][0])return;
 const loud=mode=='play'||mode=='pc'||mode=='drive';while(S.fst<FST.length&&n>=FST[S.fst][0])S.fst++;if(!loud)return;const top=S.songs.slice().sort((a,b)=>(b.streams||0)-(a.streams||0))[0];say(FST[S.fst-1][1](top?top.title:'your song'));note(4,.06)}catch(e){}},1500);
})();
