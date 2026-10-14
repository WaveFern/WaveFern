/* ===== v26.92 / v26.95: some "fans" are thieves =====
   A robbery can only happen when a fan has asked for your autograph and you sign it (sign(n), 14-world...js):
   instead of a tip, the "fan" grabs 35% of the cash you are carrying and runs off. Nothing happens at random.
   The chance depends on how many bodyguards are with you (hired and following): 5% with none, 2.5% with one,
   0.5% with two and 0% with three. Bodyguards no longer turn fans away, so fans can still ask for autographs. */
const ROB={p:[.05,.025,.005,0],cut:.35};
const robChance=()=>ROB.p[Math.min(3,S.gs=='follow'?S.guards|0:0)];
function fanRob(n){const t=+(S.money*ROB.cut).toFixed(2);n.st=2;n.cool=25;n.fan=false;if(t<=0)return;S.money=+(S.money-t).toFixed(2);snd('err');say('🚨 A fake fan stole '+$$(t)+' from you!');
 if(mode!='play')return;mode='menu';const g=S.gs=='follow'?S.guards|0:0;$('ui').innerHTML=`<div id=rob class="box modal" style="width:min(400px,92vw);text-align:center"><h2>🚨 You got robbed!</h2><p>That "fan" was not after an autograph. While you signed, they grabbed <b>${$$(t)}</b> (35% of your cash) and ran off into the crowd.</p><p class=m>You have ${$$(S.money)} left. Bodyguards with you lower the risk: 1 makes it 2.5%, 2 makes it 0.5%, 3 stop it completely${g?' (you have '+g+' with you)':''}.</p><button class=go onclick="closeUI()">Ugh, okay</button></div>`}
/* signing an autograph is the only moment a fake fan can rob you */
{const s0=sign;sign=function(n){if(n&&n.fan&&Math.random()<robChance())return fanRob(n);return s0(n)}}
/* bodyguards no longer handle fans before they reach you: a fan close by walks up and asks for an autograph */
{const w0=worldTick;worldTick=function(dt){try{if(mode=='play'&&!IN&&!HIN&&(P.x<-1||P.x>17||P.z>13))NPC.forEach(n=>{if(n.fan&&n.st==0&&Math.hypot(P.x-n.x,P.z-n.z)<7)n.st=1})}catch(e){}return w0(dt)}}
/* the bodyguards page says what guards do now */
{const g0=PA.guard;PA.guard=function(){return String(g0.apply(this,arguments)).replace('Guards follow you and politely stop fans from crowding you.','Guards follow you and watch the fans who ask for autographs: with 1 guard the chance a fake fan robs you drops from 5% to 2.5%, with 2 to 0.5%, and with 3 it never happens.')};PA.guard.guarded=1}
