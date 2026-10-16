/* ===== v26.142: Next Goal tracker + release / milestone celebrations =====
   A small chip (bottom-left) always shows the next career goal with progress; finishing one pays a cash reward with a
   card, chime and confetti. Goals run from first song to late-game fame. Releasing a song gets its own pop-up.
   Builds on the Big Vee tutorial (72-tutorial.js): reuses its card, confetti and styles, hides while the tutorial tracker is up.
   State: S.goals={done:{id:1},off:0}. Old saves: goals they already meet are marked done silently (no reward, no pop-up). */
const GL_FL=()=>{try{return fameLevel()}catch(e){return 0}};
const GL=[
 {id:'s1',n:'Release your first song',v:()=>S.songs.length,t:1,r:25},
 {id:'l100',n:'Reach 100 monthly listeners',v:()=>S.listeners,t:100,r:30},
 {id:'s3',n:'Release 3 songs',v:()=>S.songs.length,t:3,r:40},
 {id:'d7',n:'Survive a full week',v:()=>S.day,t:7,r:40},
 {id:'l1k',n:'Reach 1,000 monthly listeners',v:()=>S.listeners,t:1e3,r:100},
 {id:'m1k',n:'Save up $1,000',v:()=>S.money,t:1e3,r:50},
 {id:'f5',n:'Reach Fame Level 5',v:GL_FL,t:5,r:150},
 {id:'s10',n:'Release 10 songs',v:()=>S.songs.length,t:10,r:200},
 {id:'l10k',n:'Reach 10,000 monthly listeners',v:()=>S.listeners,t:1e4,r:500},
 {id:'fol1k',n:'Get 1,000 followers',v:()=>S.followers,t:1e3,r:300},
 {id:'f10',n:'Reach Fame Level 10',v:GL_FL,t:10,r:800},
 {id:'d30',n:'Last 30 days in the business',v:()=>S.day,t:30,r:500},
 {id:'m10k',n:'Save up $10,000',v:()=>S.money,t:1e4,r:400},
 {id:'l100k',n:'Reach 100,000 monthly listeners',v:()=>S.listeners,t:1e5,r:3000},
 {id:'s25',n:'Release 25 songs',v:()=>S.songs.length,t:25,r:1500},
 {id:'f20',n:'Reach Fame Level 20',v:GL_FL,t:20,r:5000},
 {id:'l1m',n:'Reach 1,000,000 monthly listeners',v:()=>S.listeners,t:1e6,r:20000},
 {id:'m100k',n:'Save up $100,000',v:()=>S.money,t:1e5,r:5000},
 {id:'d100',n:'Last 100 days in the business',v:()=>S.day,t:100,r:5000},
 {id:'l10m',n:'Reach 10,000,000 monthly listeners',v:()=>S.listeners,t:1e7,r:100000},
 {id:'f30',n:'Reach Fame Level 30',v:GL_FL,t:30,r:50000},
 {id:'l100m',n:'Reach 100,000,000 monthly listeners',v:()=>S.listeners,t:1e8,r:500000}
];
let GLK='',GLINIT=0;
const glN=n=>n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(1)+'k':Math.floor(n).toLocaleString();
function glState(){if(!S.goals||typeof S.goals!='object')S.goals={done:{},off:0};if(!S.goals.done)S.goals.done={};return S.goals}
function glCSS(){if($('glcss'))return;const s=document.createElement('style');s.id='glcss';s.textContent=`
#glc{position:fixed;left:10px;bottom:44px;z-index:58;width:min(250px,60vw);background:#0b0f0dd9;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,4px 4px 0 #0008;padding:6px 9px;color:var(--t);font-size:12px;line-height:1.3;cursor:pointer}
#glc .g1{font:10px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:.5px}#glc .g2{margin:3px 0;color:#fff}#glc .g3{height:6px;background:#000;border:1px solid #2a352e}#glc .g3 i{display:block;height:100%;background:var(--g)}#glc small{color:#8aa094}
#glc.mini{width:auto;padding:3px 8px}@media (max-width:700px){#glc{bottom:150px}}
#glr{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:62;pointer-events:none;text-align:center;background:#0b0f0def;border:3px solid #000;box-shadow:inset 0 0 0 2px #2a352e,0 0 0 3px #ffd27a66,6px 6px 0 #0008;padding:12px 26px;min-width:min(300px,84vw);box-sizing:border-box;animation:tcIn 3s both}
#glr small{font:11px Silkscreen,ui-monospace,monospace;color:#ffd27a;letter-spacing:2px}#glr h2{font-size:20px;margin:5px 0 2px;color:#fff;text-shadow:3px 3px 0 #000}#glr p{margin:0;color:var(--g)}`;document.head.appendChild(s)}
function glNext(){const d=glState().done;return GL.find(g=>!d[g.id])}
function glRender(){let el=$('glc');const ok=S&&S.artist&&typeof mode!='undefined'&&(mode=='play'||mode=='drive')&&!(typeof PAUSED!='undefined'&&PAUSED)&&!(S.tut&&S.tut.on);
 const g=ok&&glNext();if(!g){if(el)el.remove();GLK='';return}glCSS();
 const off=glState().off,v=Math.min(g.t,Math.max(0,+g.v()||0)),k=g.id+'|'+off+'|'+Math.floor(v/g.t*50);if(GLK==k&&el)return;GLK=k;
 if(!el){el=document.createElement('div');el.id='glc';el.title='Click to shrink or expand';el.onclick=()=>{const G=glState();G.off=G.off?0:1;GLK='';glRender()};document.body.appendChild(el)}
 el.className=off?'mini':'';
 el.innerHTML=off?`<span class=g1>NEXT GOAL</span> <small>${Math.round(v/g.t*100)}%</small>`:`<div class=g1>NEXT GOAL · reward $${glN(g.r)}</div><div class=g2>${g.n}</div><div class=g3><i style="width:${v/g.t*100}%"></i></div><small>${glN(v)} / ${glN(g.t)}</small>`}
function glCard(k,t,s){glCSS();const o=$('glr');if(o)o.remove();const e=document.createElement('div');e.id='glr';e.innerHTML=`<small>${k}</small><h2>${t}</h2><p>${s||''}</p>`;document.body.appendChild(e);setTimeout(()=>{if(e.parentNode)e.remove()},3000)}
function glBurst(n){try{tutBurst(innerWidth/2,innerHeight*.3,n)}catch(e){}}
function glCheck(){try{if(!S||!S.artist||!Array.isArray(S.songs))return;const G=glState();
 if(!GLINIT){GLINIT=1;if(!G.init){G.init=1;if(S.songs.length||S.day>1||S.listeners>0)GL.forEach(g=>{if((+g.v()||0)>=g.t)G.done[g.id]=1})}}
 let g,n=0;while((g=glNext())&&(+g.v()||0)>=g.t&&n++<3){G.done[g.id]=1;S.money=+(S.money+g.r).toFixed(2);
  glCard('GOAL COMPLETE',g.n,'+$'+glN(g.r)+' reward');snd('chime');setTimeout(()=>snd('cash'),200);glBurst(n>1?20:38);say('🎯 Goal done: '+g.n+' (+$'+glN(g.r)+')');GLK=''}
 glRender()}catch(e){}}
setInterval(glCheck,1000);
/* release feedback: song count, quality and a first-song fanfare */
if(typeof upl=='function'){const u0=upl;upl=function(id){const n0=S.songs.length,d=S.drafts.find(x=>x.id==id),r=u0.apply(this,arguments);
 try{if(S.songs.length>n0){const s=S.songs[S.songs.length-1],q=+s.q||0,tag=q>=90?'Instant classic':q>=70?'Fire':q>=45?'Solid':'Rough but real';
  glCard(n0?'NEW RELEASE':'FIRST RELEASE',s.title,tag+' · song #'+S.songs.length+(n0?'':' · you are on Spotifly'));snd('chime');setTimeout(()=>snd('cash'),150);glBurst(n0?24:44);glCheck()}}catch(e){}return r}}
