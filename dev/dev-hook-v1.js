/* WaveFern dev: "the hook" - engagement mechanics on top of the base economy (does not retune it). Only loaded on /dev/.
   Add ?nohook to skip it. All tunables are in H below. State lives in S.hk (saved with the career).
   1 Rookie Rush: streams x1.8 on day 0 easing to x1.0 by day 6 (looks like "you are blowing up", quietly fades).
   2 Surprise drops: in the first 15 min of play, a random reward every 40-90 s (variable ratio): cash, fans, or a stream burst.
   3 Lucky break: a new song has a chance of a viral spike in its first 10 days (variable reward).
   4 Goal bar: always-visible "next milestone" bar, eased so it starts ~35% full (endowed progress) with near-miss text at 80%+.
   5 Milestone ladder: small rewards at each step, then each step is farther away (goal gradient).
   6 Daily streak: one reward per real day, bigger each day to day 7; one missed day is forgiven (streak freeze), 2 resets it.
   7 Comeback: leaving for 10+ min and returning shows "while you were away" fans. */
(function(){
 if(!window.FW_DEV||/[?&]nohook/.test(location.search))return;
 const H={rushMax:.8,rushDays:6,dropMin:40,dropMax:90,dropWindow:15*60,luckyP:.12,luckyDays:10,
  streak:[30,45,70,100,140,200,400],ladder:[[1,'songs',1,25],[3,'songs',2,50],[25,'lis',0,40],[100,'lis',0,75],[250,'lis',0,120],[500,'lis',0,200],[1000,'lis',0,350],[2500,'lis',0,600],[5000,'lis',0,1000],[10000,'lis',0,1800],[25000,'lis',0,3000],[50000,'lis',0,5000],[100000,'lis',0,9000],[250000,'lis',0,15000],[500000,'lis',0,25000],[1000000,'lis',0,50000]]};
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev hook '+t,e)}}};
 const now=()=>window.FW_CLOCK?FW_CLOCK.now():Date.now();
 const R=(a,b)=>a+Math.random()*(b-a);
 const hk=()=>{if(!S.hk)S.hk={play:0,drops:0,ms:0,str:0,last:0,seen:now(),lk:0};return S.hk};
 const live=()=>safe(()=>S&&S.artist&&!(typeof TRL!='undefined'&&TRL.on),'live');
 const fm=n=>n>=1e9?+(n/1e9).toFixed(1)+'B':n>=1e6?+(n/1e6).toFixed(1)+'M':n>=1e4?+(n/1e3).toFixed(n>=1e5?0:1)+'K':Math.round(n).toLocaleString();
 const card=(k,t,s)=>safe(()=>glCard(k,t,s),'card');
 const cash=n=>{S.money=+((+S.money||0)+n).toFixed(0)};

 /* 1 + 3: stream shaping inside planOf */
 {const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!s||!live())return v;
  return safe(()=>{const cap=Math.max(0,Math.round(songCap(s)-v));let x=0;const age=S.day-(s.day||0);
   const rush=Math.max(0,H.rushMax*(1-S.day/H.rushDays));x+=v*rush;
   if(age<=H.luckyDays&&Math.random()<H.luckyP*(1-age/(H.luckyDays+1))){const m=R(2,5);x+=v*m+20;s.hkLucky=Math.round(v*m+20)}
   x=Math.min(Math.round(x),cap);if(!(x>0))return v;s.pv=v+x;return s.pv},'plan')||v}}

 /* morning: tell the player about lucky breaks and the rush */
 {const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);safe(()=>{if(!live())return;let big=null;
  (S.songs||[]).forEach(s=>{if(s.hkLucky){if(!big||s.hkLucky>big.hkLucky)big=s}});
  if(big){const n=big.hkLucky;(S.songs||[]).forEach(s=>{s.hkLucky=0});card('LUCKY BREAK','"'+big.title+'" is taking off!','A playlist picked it up overnight: +'+fm(n)+' streams. Keep releasing, you never know which song pops.')}
  ladder();bar()},'wake');return r}}

 /* 5 + 4: milestone ladder and goal bar */
 const val=st=>st[1]=='songs'?(S.songs||[]).length:(+S.listeners||0);
 const lbl=st=>st[1]=='songs'?(st[0]==1?'Release your first song':'Release '+st[0]+' songs'):fm(st[0])+' monthly listeners';
 function ladder(){const h=hk();while(h.ms<H.ladder.length&&val(H.ladder[h.ms])>=H.ladder[h.ms][0]){const st=H.ladder[h.ms++];cash(st[3]);
   card('MILESTONE '+h.ms+'/'+H.ladder.length,lbl(st),'+$'+fm(st[3])+' bonus. '+(h.ms<H.ladder.length?'Next up: '+lbl(H.ladder[h.ms])+'.':'You cleared every milestone!'));try{snd('ping')}catch(e){}}}
 let bel=null;
 function bar(){if(!live()||typeof mode=='undefined'||mode!='play'&&mode!='drive'){if(bel)bel.style.display='none';return}
  const h=hk();if(!bel){bel=document.createElement('div');bel.id='hkbar';bel.style.cssText='position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:30;pointer-events:none;width:min(300px,70vw);font:11px Silkscreen,ui-monospace,monospace;color:#e8f3ec;text-align:center;text-shadow:1px 1px 0 #000';
   bel.innerHTML='<div class="t"></div><div style="height:10px;border:2px solid #000;background:#0b0f0dcc;margin-top:2px"><i style="display:block;height:100%;width:0;background:#2fe68a;transition:width .6s"></i></div>';document.body.appendChild(bel)}
  bel.style.display='';const st=H.ladder[h.ms];if(!st){bel.style.display='none';return}
  const prev=h.ms?H.ladder[h.ms-1][0]:0,v=val(st),f=Math.max(0,Math.min(1,(v-prev)/(st[0]-prev))),p=.35+.65*f; /* starts 35% full */
  bel.querySelector('i').style.width=Math.round(p*100)+'%';bel.querySelector('i').style.background=p>=.9?'#ffd27a':'#2fe68a';
  const left=Math.max(0,st[0]-v);bel.querySelector('.t').textContent=p>=.8?'So close! '+fm(left)+(st[1]=='songs'?' song':' to go')+' to '+lbl(st):'Next: '+lbl(st)+' ('+Math.round(p*100)+'%)'}

 /* 2: surprise drops during the first 15 minutes of play */
 let nextAt=0;
 function drop(){const h=hk();h.drops++;const r=Math.random();let t,s;
  if(r<.5){const n=Math.round(R(15,45)*(1+h.drops*.15));cash(n);t='Fan tip';s='A fan slipped you $'+n+'.'}
  else if(r<.85){const n=Math.round(R(6,20)*(1+h.drops*.2));S.followers=(S.followers||0)+n;t='New fans';s='+'+n+' followers just found you.'}
  else{const sg=(S.songs||[]).slice().sort((a,b)=>b.day-a.day)[0];if(sg){const n=Math.round(R(40,120));safe(()=>addSt(sg,n),'drop');t='Stream burst';s='"'+sg.title+'" got +'+n+' streams.'}else{cash(60);t='Jackpot';s='A surprise $60!'}}
  card('SURPRISE',t,s);try{snd('ping')}catch(e){}}
 /* 6: daily streak */
 function daily(){const h=hk(),day=Math.floor(now()/864e5);if(h.last===day)return;
  const gap=h.last?day-h.last:1;let note='';
  if(gap==2){note=' (streak saved by a free pass)'}else if(gap>2){h.str=0;note=' (your streak reset, start a new one!)'}
  h.str=(h.str||0)+1;h.last=day;const i=Math.min(h.str,H.streak.length)-1,n=Math.round(H.streak[i]*(1+Math.floor((h.str-1)/7)*.5));cash(n);
  const nx=Math.min(h.str+1,H.streak.length);
  card('DAY '+h.str+' STREAK','+$'+n+note,h.str>=7?'Seven days strong! The bonus keeps growing every week.':'Come back tomorrow for $'+Math.round(H.streak[nx-1]*(1+Math.floor(h.str/7)*.5))+' - day 7 is the big one.')}

 /* tick: 1 s */
 setInterval(()=>safe(()=>{if(!live()||typeof mode=='undefined')return;if(typeof PAUSED!='undefined'&&PAUSED)return;if(mode!='play'&&mode!='drive'&&mode!='rec'&&mode!='pc')return;
  const h=hk();h.play++;
  if(h.play==3)daily();
  if(h.play<=H.dropWindow){if(!nextAt)nextAt=h.play+R(20,40);if(h.play>=nextAt){nextAt=h.play+R(H.dropMin,H.dropMax);drop()}}
  if(h.play%5==0){ladder();bar()}},'tick'),1000);
 /* 7: comeback */
 document.addEventListener('visibilitychange',()=>safe(()=>{const h=hk();if(document.hidden){h.seen=now();return}
  const gone=(now()-h.seen)/6e4;if(live()&&gone>=10&&(S.songs||[]).length){const n=Math.min(500,Math.round(gone*R(1.5,3)*(1+Math.sqrt(S.listeners||0)/10)));S.followers=(S.followers||0)+n;card('WELCOME BACK','+'+n+' new followers','Your music kept working while you were away.')}},'vis'));
})();
