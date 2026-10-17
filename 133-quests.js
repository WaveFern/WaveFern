/* ===== v43.1.0: Quests app (replaces the Next Goal ladder) =====
   A preinstalled PC app with Daily and Weekly tabs. Each day brings 3 daily quests; finishing all 3 pays $30 at the start,
   growing with fame level. Each week (days 1-7, 8-14, ...) brings 3 harder weekly quests worth 10x the daily set.
   Progress is counted from changes the game already keeps (drafts, songs, Instagrime posts, albums, messages, streams,
   followers, earnings) plus distance walked, polled twice a second. The night after a day (and after a week's last day)
   still counts for that day or week, so overnight streams land in the week they were earned.
   State: S.quests={d:{day,r,paid,list},w:{wk,r,paid,list},tab,nd,nw}; quests are rolled once and saved, so reloads never change them.
   Old saves: built fresh on first load; the old S.goals data is left alone and unused. */
(function(){
const FL=()=>{try{return fameLevel()||0}catch(e){return 0}};
const nice=n=>{n=Math.max(1,Math.round(n));const p=Math.pow(10,Math.max(0,String(n).length-2));return Math.round(n/p)*p};
const fmt=n=>n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(1)+'k':Math.floor(n).toLocaleString();
const r5=n=>Math.max(5,Math.round(n/5)*5);
const dayReward=()=>r5(30*Math.pow(1.04,FL()));
const wkOf=d=>Math.floor((Math.max(1,d)-1)/7);
function rng(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const avgQ=()=>{const s=(S.songs||[]).slice(-5).map(x=>+x.q||0);return s.length?s.reduce((a,b)=>a+b,0)/s.length:0};
const lastWeek=f=>{const h=(S.hist||[]).slice(-7);return h.length>=7?h.reduce((a,x)=>a+(+x[f]||0),0):0};
const hasIG=()=>!!(S.apps&&S.apps.ig);
const meCount=()=>{let n=0;try{(S.msgs||[]).forEach(m=>{(m.log||[]).forEach(l=>{if(l&&l.f=='me')n++})})}catch(e){}return n};

/* pools: each maker returns a quest or null when it does not fit this career yet; g keeps the 3 picks varied */
const DAILY=[
 {g:'make',f:()=>{const t=2+(FL()>=10)+(FL()>=30);return{k:'rec',t,x:t=>t>1?`Record ${t} songs`:'Record a song'}}},
 {g:'out',f:()=>{const t=1+(FL()>=15)+(FL()>=40);return{k:'rel',t,x:t=>t>1?`Release ${t} songs`:'Release a song'}}},
 {g:'out',f:()=>{if((S.songs||[]).length<3)return null;const q=Math.max(15,Math.min(95,Math.round(avgQ()+3)));return{k:'hq',t:1,q,x:()=>`Release a song with quality ${q} or higher`}}},
 {g:'soc',f:()=>hasIG()?{k:'post',t:1,x:()=>'Post on Instagrime'}:null},
 {g:'soc',f:()=>(S.msgs||[]).length>1?{k:'msg',t:4,x:t=>`Send ${t} messages`}:null},
 {g:'move',f:()=>{const t=400+50*Math.min(6,Math.floor(FL()/10));return{k:'walk',t,x:t=>`Walk or run ${fmt(t)} m`}}}
];
const WEEKLY=[
 {g:'grow',f:()=>{const w=lastWeek('st');if(!(w>0))return null;return{k:'st',t:nice(w*1.35),x:t=>`Get ${fmt(t)} streams this week`}}},
 {g:'grow',f:()=>{const w=lastWeek('e');if(!(w>=1))return null;return{k:'earn',t:nice(w*1.35),x:t=>`Earn $${fmt(t)} from your music this week`}}},
 {g:'grow',f:()=>{const w=lastWeek('st')*.05;if(!(w>=20))return null;return{k:'fol',t:nice(w*1.35),x:t=>`Gain ${fmt(t)} followers this week`}}},
 {g:'make',f:()=>{const t=5+2*(FL()>=15)+2*(FL()>=40);return{k:'rel',t,x:t=>`Release ${t} songs this week`}}},
 {g:'make',f:()=>{const t=12+3*(FL()>=15)+3*(FL()>=40);return{k:'rec',t,x:t=>`Record ${t} songs this week`}}},
 {g:'qual',f:()=>{if((S.songs||[]).length<3)return null;const q=Math.max(20,Math.min(97,Math.round(avgQ()+6)));return{k:'hq',t:3,q,fix:1,x:()=>`Release 3 songs with quality ${q} or higher`}}},
 {g:'qual',f:()=>(S.songs||[]).length>=6&&Array.isArray(S.albums)?{k:'alb',t:1,fix:1,x:()=>'Release an album'}:null},
 {g:'soc',f:()=>hasIG()?{k:'post',t:5,x:t=>`Post on Instagrime on ${t} different days`}:null},
 {g:'move',f:()=>{const t=3000+300*Math.min(10,Math.floor(FL()/10));return{k:'walk',t,x:t=>`Walk or run ${fmt(t)} m`}}}
];
/* a week joined part way through (old saves, new careers) scales its counts to the days left */
function roll(pool,seed,scale){const R=rng(seed),bag=pool.map(x=>({x,o:R()})).sort((a,b)=>a.o-b.o),out=[],gs={};
 const mk=x=>{try{return x.f()}catch(e){return null}};
 for(const {x} of bag){if(out.length>=3)break;if(gs[x.g])continue;const q=mk(x);if(!q)continue;gs[x.g]=1;out.push(q)}
 for(const {x} of bag){if(out.length>=3)break;const q=mk(x);if(q&&!out.some(o=>o.k==q.k))out.push(q)}
 return out.map(q=>{let t=q.t;if(scale<1&&!q.fix)t=Math.max(1,Math.ceil(t*scale));const o={k:q.k,t,n:q.x(t),p:0,ok:0};if(q.q)o.q=q.q;return o})}
function st(){if(!S.quests||typeof S.quests!='object')S.quests={};const Q=S.quests;if(!Q.tab)Q.tab='d';Q.nd=+Q.nd||0;Q.nw=+Q.nw||0;
 if(!Q.d||Q.d.day!==S.day||!Array.isArray(Q.d.list))Q.d={day:S.day,r:dayReward(),paid:0,list:roll(DAILY,'d'+S.day+'|'+(S.artist||''),1)};
 const wk=wkOf(S.day);if(!Q.w||Q.w.wk!==wk||!Array.isArray(Q.w.list)){const left=7-((S.day-1)%7);Q.w={wk,r:dayReward()*10,paid:0,list:roll(WEEKLY,'w'+wk+'|'+(S.artist||''),left/7)}}
 return Q}

/* progress */
let L=null,LP=null,LS=null;
function snap(){return{d:S.day,rec:(S.drafts||[]).length+(S.songs||[]).length,rel:(S.songs||[]).length,post:(S.igPosts||[]).length,alb:Array.isArray(S.albums)?S.albums.length:0,msg:meCount(),st:+S.streams||0,earn:+S.earn||0,fol:+S.followers||0}}
function add(set,ev){if(!set)return;set.list.forEach(q=>{if(q.ok)return;let v=0;
 if(q.k=='hq')v=ev.songs.filter(s=>(+s.q||0)>=q.q).length;else v=ev[q.k]||0;
 if(v>0){q.p=Math.min(q.t,(+q.p||0)+v);if(q.p>=q.t){q.ok=1;try{say('✅ Quest done: '+q.n)}catch(e){}}}})}
function pay(set,kind){if(!set||set.paid||!set.list.length||!set.list.every(q=>q.ok))return;set.paid=1;const Q=S.quests;if(kind=='d')Q.nd++;else Q.nw++;
 S.money=+(S.money+set.r).toFixed(2);
 try{glCard(kind=='d'?'DAILY QUESTS COMPLETE':'WEEKLY QUESTS COMPLETE','+$'+fmt(set.r),kind=='d'?'All 3 done. New quests tomorrow.':'All 3 done. New quests next week.')}catch(e){}
 try{snd('chime');setTimeout(()=>snd('cash'),200)}catch(e){}try{tutBurst(innerWidth/2,innerHeight*.3,kind=='d'?28:50)}catch(e){}
 try{say((kind=='d'?'📜 Daily':'🏆 Weekly')+' quests complete: +$'+fmt(set.r))}catch(e){}}
function tick(){try{if(!S||!S.artist||!Array.isArray(S.songs))return;if(!S.apps||typeof S.apps!='object')S.apps={};if(!S.apps.quests)S.apps.quests=1;
 if(!S.quests||!S.quests.d)st();const Q=S.quests,c=snap();
 if(!L||LS!==S||c.d<L.d||c.d>L.d+1){L=c;LS=S;st();return}/* first tick, or a different save was loaded */
 const songs=c.rel>L.rel?S.songs.slice(L.rel):[];
 const ev={songs,rec:c.rec-L.rec,rel:c.rel-L.rel,post:c.post-L.post,alb:c.alb-L.alb,msg:c.msg-L.msg,st:c.st-L.st,earn:c.earn-L.earn,fol:c.fol-L.fol};
 for(const k in ev)if(k!='songs'&&!(ev[k]>0))ev[k]=0;
 /* night and daytime changes go to the period they happened in: the day (and week) that just ended, then roll over */
 add(Q.d,ev);add(Q.w,ev);pay(Q.d,'d');pay(Q.w,'w');L=c;
 const ch=Q.d.day!==S.day||Q.w.wk!==wkOf(S.day);st();
 if(ch&&typeof mode!='undefined'&&mode=='pc'&&app=='quests')pcR()}catch(e){console.error('quests',e)}}
function walkTick(){try{if(!S||!S.artist||typeof P=='undefined'||!P)return;const on=typeof mode!='undefined'&&mode=='play'&&!(typeof PAUSED!='undefined'&&PAUSED);
 if(on&&LP){const d=Math.hypot(P.x-LP[0],P.z-LP[1]);if(d>0.02&&d<4.5&&S.quests&&S.quests.d)add(S.quests.d,{songs:[],walk:d}),add(S.quests.w,{songs:[],walk:d})}
 LP=on?[P.x,P.z]:null;if(S.quests&&S.quests.d)S.quests.d.list.concat(S.quests.w.list).forEach(q=>{if(q.k=='walk')q.p=Math.round(q.p*10)/10})}catch(e){}}
setInterval(tick,500);setInterval(walkTick,500);

/* app */
APPD.quests={n:'Quests',p:0,d:'Preinstalled. Daily and weekly quests that pay cash when you finish the set.'};
try{IC.quests=mkIc(['..WWWWWW..','.WPPPPPPW.','.WPYYYYPW.','.WPPYYPPW.','.WPPYYPPW.','.WPPYYPPW.','.WPPPPPPW.','.WPPYYPPW.','.WPPPPPPW.','..WWWWWW..'],{W:'#f2d58a',P:'#3b2a7a',Y:'#ffd23f'})}catch(e){IC.quests=IC.store}
function css(){if($('qstcss'))return;const s=document.createElement('style');s.id='qstcss';s.textContent=`
.mn.qmn{padding:0!important;background:#0d0926}.qst{min-height:100%;padding:18px 20px 24px;box-sizing:border-box;background:radial-gradient(ellipse at top,#2c2166 0%,#160f3a 55%,#0d0926 100%);color:#efe6ff;font-family:ui-monospace,Menlo,Consolas,monospace}
.qst .qh{display:flex;align-items:center;gap:12px;margin-bottom:12px}.qst .qh img{width:40px;image-rendering:pixelated}
.qst .qh h1{margin:0;font:22px Silkscreen,ui-monospace,monospace;color:#ffd23f;letter-spacing:2px;text-shadow:3px 3px 0 #000}.qst .qh small{color:#b8a8e8}
.qst .qtabs{display:flex;gap:0;margin:0 0 14px;border:3px solid #000;width:max-content;box-shadow:4px 4px 0 #0008}
.qst .qtabs button{all:unset;cursor:pointer;padding:8px 22px;font:13px Silkscreen,ui-monospace,monospace;letter-spacing:1px;background:#231a55;color:#b8a8e8}
.qst .qtabs button.on{background:#ffd23f;color:#1a1240}.qst .qtabs button:not(.on):hover{background:#33287a;color:#fff}
.qst .qrw{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:#0d0926cc;border:3px solid #000;box-shadow:inset 0 0 0 2px #4a3a9a;padding:10px 14px;margin-bottom:14px}
.qst .qrw .chest{font:20px Silkscreen,ui-monospace,monospace;color:#ffd23f}.qst .qrw .qm{color:#b8a8e8;font-size:12px}.qst .qrw .qpd{color:#7dffb0;font:13px Silkscreen,ui-monospace,monospace}
.qst .qdots{display:flex;gap:5px;margin-left:auto}.qst .qdots i{width:14px;height:14px;border:2px solid #000;background:#231a55}.qst .qdots i.past{background:#6a5ab0}.qst .qdots i.now{background:#ffd23f}
.qst .qc{position:relative;display:flex;gap:14px;align-items:center;background:#1e1650;border:3px solid #000;box-shadow:4px 4px 0 #0008;padding:12px 14px;margin:0 0 10px}
.qst .qc:before{content:'';position:absolute;left:0;top:0;bottom:0;width:6px;background:#8a6cff}.qst .qc.ok:before{background:#7dffb0}.qst .qc.ok{background:#173a33}
.qst .qn{flex:1;min-width:0}.qst .qn b{display:block;color:#fff;font-size:14px;margin-bottom:6px}.qst .qc.ok .qn b{color:#c9ffe0}
.qst .qbar{height:10px;background:#0d0926;border:2px solid #000}.qst .qbar i{display:block;height:100%;background:linear-gradient(90deg,#8a6cff,#ffd23f)}.qst .qc.ok .qbar i{background:#7dffb0}
.qst .qv{font-size:12px;color:#b8a8e8;margin-top:4px}
.qst .qs{width:34px;height:34px;flex:none;display:grid;place-items:center;border:3px solid #000;background:#0d0926;font:16px Silkscreen,ui-monospace,monospace;color:#6a5ab0}.qst .qc.ok .qs{background:#7dffb0;color:#0d2a20}
.qst .qf{margin-top:16px;font-size:12px;color:#8a7cc0}`;document.head.appendChild(s)}
function card(q,i){const p=Math.min(q.t,+q.p||0),pc=q.t?p/q.t*100:0,u=q.k=='walk'?' m':q.k=='earn'?'':'';const v=q.k=='earn'?'$'+fmt(p)+' / $'+fmt(q.t):fmt(p)+' / '+fmt(q.t)+u;
 return`<div class="qc ${q.ok?'ok':''}"><div class=qs>${q.ok?'✓':i+1}</div><div class=qn><b>${esc(q.n)}</b><div class=qbar><i style="width:${pc}%"></i></div><div class=qv>${q.ok?'Done':v}</div></div></div>`}
function page(){css();const Q=st(),d=Q.tab=='w',set=d?Q.w:Q.d,n=set.list.filter(q=>q.ok).length,dow=(S.day-1)%7,left=7-dow;
 const dots=d?`<div class=qdots title="Days of this week">${[0,1,2,3,4,5,6].map(i=>`<i class="${i<dow?'past':i==dow?'now':''}"></i>`).join('')}</div>`:'';
 const when=d?`Week ${Q.w.wk+1} · ${left==1?'last day':left+' days left'}, the final night counts`:`Day ${S.day} · new quests after you sleep`;
 return`<div class=qst><div class=qh><img src="${IC.quests}"><div><h1>QUEST LOG</h1><small>${when}</small></div></div>
 <div class=qtabs><button class="${d?'':'on'}" onclick="qstTab('d')">Daily</button><button class="${d?'on':''}" onclick="qstTab('w')">Weekly</button></div>
 <div class=qrw><span class=chest>$${fmt(set.r)}</span><span class=qm>${set.paid?'':'for finishing all 3 · '}${n}/3 done</span>${set.paid?'<span class=qpd>PAID</span>':''}${dots}</div>
 ${set.list.map(card).join('')}
 <div class=qf>Rewards grow with your fame level. Sets finished: ${Q.nd} daily · ${Q.nw} weekly</div></div>`}
window.qstTab=t=>{st().tab=t=='w'?'w':'d';try{snd('click')}catch(e){}pcR()};
PA.quests=()=>{try{return page()}catch(e){console.error('Quests',e);return'<p>Quests hit a snag. Close it and try again.</p>'}};
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{const m=document.querySelector('#pc .mn');if(m)m.classList.toggle('qmn',app=='quests'&&!!m.querySelector('.qst'))}catch(e){}return r}}
/* keep the open Quests window live as progress changes */
let QK='';setInterval(()=>{try{if(typeof mode=='undefined'||mode!='pc'||app!='quests'||(typeof PAUSED!='undefined'&&PAUSED)||!S.quests||!S.quests.d)return;
 const k=JSON.stringify([S.quests.d.list.map(q=>Math.floor(q.p)),S.quests.w.list.map(q=>Math.floor(q.p)),S.quests.d.paid,S.quests.w.paid]);if(k!=QK){if(QK)pcR();QK=k}}catch(e){}},1000);
})();
