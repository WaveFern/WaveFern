/* ===== v26.92: some "fans" are thieves =====
   When a fan walks up to you for an autograph (NPC st 0 -> 1, 14-world...js), there is a 5% chance they are a thief:
   they grab 35% of the cash you are carrying and run off. A pop-up and a toast say how much went. A bodyguard who is
   following you still stops fans before they reach you, so guards keep you safe from this too. */
const ROB={p:.05,cut:.35};
function fanRob(n){const t=+(S.money*ROB.cut).toFixed(2);n.st=2;n.cool=25;n.fan=false;if(t<=0)return;S.money=+(S.money-t).toFixed(2);snd('err');say('🚨 A fake fan stole '+$$(t)+' from you!');
 if(mode!='play')return;mode='menu';$('ui').innerHTML=`<div id=rob class="box modal" style="width:min(400px,92vw);text-align:center"><h2>🚨 You got robbed!</h2><p>That "fan" was not after an autograph. They grabbed <b>${$$(t)}</b> (35% of your cash) and ran off into the crowd.</p><p class=m>You have ${$$(S.money)} left. A bodyguard (Security, on your street) stops fans before they reach you.</p><button class=go onclick="closeUI()">Ugh, okay</button></div>`}
{const u0=update;update=function(dt){u0(dt);try{NPC.forEach(n=>{if(n.st==1&&n.fan){if(!n.rbc){n.rbc=1;if(Math.random()<ROB.p)fanRob(n)}}else if(n.st!=1)n.rbc=0})}catch(e){}}}
