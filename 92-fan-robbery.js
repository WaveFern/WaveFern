/* ===== v26.92 / v26.95: some "fans" are thieves =====
   A robbery can only happen when a fan has asked for your autograph and you sign it (sign(n), 14-world...js):
   instead of a tip, the "fan" grabs 35% of the cash you are carrying and runs off. Nothing happens at random.
   Bodyguards with you (hired and following) let only some fans through to ask (all / 50% / 10% / none for 0-3 guards),
   and the chance a fan who asks is a thief is 5% / 2.5% / 0.5% / 0%. */
const ROB={p:[.05,.025,.005,0],cut:.35};
const robChance=()=>ROB.p[Math.min(3,S.gs=='follow'?S.guards|0:0)];/* chance a fan who got through and asks for an autograph is a thief */
function fanRob(n){const t=+(S.money*ROB.cut).toFixed(2);n.st=2;n.cool=25;n.fan=false;if(t<=0)return;S.money=+(S.money-t).toFixed(2);snd('err');say('🚨 A fake fan stole '+$$(t)+' from you!');
 if(mode!='play')return;mode='menu';const g=S.gs=='follow'?S.guards|0:0;$('ui').innerHTML=`<div id=rob class="box modal" style="width:min(400px,92vw);text-align:center"><h2>🚨 You got robbed!</h2><p>That "fan" was not after an autograph. While you signed, they grabbed <b>${$$(t)}</b> (35% of your cash) and ran off into the crowd.</p><p class=m>You have ${$$(S.money)} left.${g<3?' More bodyguards with you means fewer robberies.':''}</p><button class=go onclick="closeUI()">Ugh, okay</button></div>`}
/* signing an autograph is the only moment a fake fan can rob you */
{const s0=sign;sign=function(n){if(n&&n.fan&&Math.random()<robChance())return fanRob(n);return s0(n)}}
/* bodyguards decide which fans get through to ask for an autograph: all of them with no guards, 50% with 1, 10% with 2,
   none with 3. Each fan is checked once as they come near (n.gp); a fan who is not let through is handled by the guard
   as before (14-world...js). The flag clears once you are far apart, so the next time is a new check. */
const GPASS=[1,.5,.1,0],guardsWith=()=>S.gs=='follow'?Math.min(3,S.guards|0):0;
{const w0=worldTick;worldTick=function(dt){try{const g=guardsWith();if(mode=='play'&&!IN&&!HIN&&(P.x<-1||P.x>17||P.z>13))NPC.forEach(n=>{const d=Math.hypot(P.x-n.x,P.z-n.z);if(d>14){n.gp=undefined;return}
  if(g&&n.fan&&n.st==0&&d<7){if(n.gp===undefined)n.gp=Math.random()<GPASS[g];if(n.gp)n.st=1}})}catch(e){}return w0(dt)}}
/* the bodyguards page says what guards do now */
{const g0=PA.guard;PA.guard=function(){return String(g0.apply(this,arguments)).replace('Guards follow you and politely stop fans from crowding you.','Guards follow you and decide which fans get through to ask for an autograph: 1 guard lets half of them through, 2 let 1 in 10 through, 3 let nobody through. Any fan who gets through might be a thief: 5% with no guards, 2.5% with 1, 0.5% with 2.')};PA.guard.guarded=1}
