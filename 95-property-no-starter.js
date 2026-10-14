/* ===== v26.101: the original house is no longer for sale =====
   PROPS[0] (Suburban House) is the house you start in, so buying it cost $12,000 and changed nothing you could see.
   It is hidden from the Property website and the Hillside Villa can be bought straight away.
   S.home keeps its meaning (number of PROPS rows owned) so old saves load unchanged:
   buying row i from a lower S.home sets S.home to i+1, skipping the starter row.
   Old bookings for the starter house are dropped, and the starter house no longer appears as a lot in town. */
const dropStarterAppt=()=>{if(Array.isArray(S.appt))S.appt=S.appt.filter(a=>!(a.t=='home'&&a.i<1))};
{const bx=buyX;buyX=function(t,i){if(t=='home'){if(i<1||i<S.home)return;if(i>S.home){if(S.money<PROPS[i][1])return snd('err');S.home=i}}return bx(t,i)}}
{const at=attend;attend=function(t){dropStarterAppt();return at(t)}}
{const w0=PA.web;PA.web=()=>{dropStarterAppt();return w0()}}
{const b0=buildLots;buildLots=function(){b0();if(LOTS.length>=2&&(S.home||0)>=1){LOTS.splice(0,2).forEach(m=>scene.remove(m))}}}
PA.prop=()=>{dropStarterAppt();const hm=Math.max(1,S.home||0);return`<div class=thz><div class=hero><b>PROPERTY</b><span>Balance ${$$(S.money)} · Book a viewing, then visit the Property office on the highway to sign. Every upgrade makes the inside of your home bigger: walk up the stairs in your living room.</span></div><div class=prl>${PROPS.map((c,i)=>i<1?'':`<div class="prr ${i==hm?'cur':''}"><div class=thp style="--pvb:transparent">${isoP('h',i)}</div><div class=prb><div class=thn style="font-size:18px">${c[0]}</div><div class=m>${PBD[i][0]} bed · ${PBD[i][1]} bath · ${PBD[i][2]} m²</div><div class=m>${PFT[i]}</div><div class=m style="color:#1a7f37">+ ${PRF[i]}</div><div class=thr>${$$(c[1])}</div>${i<S.home?'<b>Owned</b>':i>hm?'<span class=m>Buy the previous home first</span>':`<button class=go ${S.money<c[1]?'disabled':''} onclick="book('home',${i})">Book viewing</button>`}</div></div>`).join('')}<div class=prr><div class=prb><div class=thn style="font-size:18px">Garage</div><div class=m>Needed to park and drive your cars. Pad next to your house.</div><div class=thr>$2,500</div>${S.garage?'<b>Unlocked</b>':`<button class=go ${S.money<2500?'disabled':''} onclick="book('garage',0)">Book viewing</button>`}</div></div></div></div>`};
