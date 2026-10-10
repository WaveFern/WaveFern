/* ---------- Gearhouse: 11 more gear lines (33 upgrades), sorted into sections, with fame-level locks ----------
   Every new line plugs into the same gear bonus as the old ones:
   q = song quality added per level when a recording is finished, s = extra share of streams per level.
   fl = fame tier (index into FTL) needed to buy level 1, 2 and 3 (-1 = open to everyone).
   Pacing is v26.16 (about $0.03 a stream): the cheap first levels are reachable early, the top levels are late-game goals. */
const GX={
 phones:{n:'Headphones',d:'Hear every detail',lv:['Cheap earbuds','Closed-back cans','Open-back reference','Planar reference set'],c:[120,450,1400],q:1,fl:[-1,-1,0]},
 iface:{n:'Audio interface',d:'Cleaner recordings',lv:['Laptop mic jack','2-channel USB box','8-channel interface','Rack converters'],c:[180,700,2200],q:2,fl:[-1,0,1]},
 monitors:{n:'Studio monitors',d:'Mixes that sound right everywhere',lv:['Laptop speakers','Desktop monitors','Studio monitors','Mains + subwoofer'],c:[240,850,2600],q:2,fl:[-1,0,1]},
 pedals:{n:'Pedalboard',d:'More guitar tones',lv:['No pedals','Overdrive pedal','Pedalboard','Boutique board'],c:[150,600,1800],q:1,fl:[-1,0,1]},
 bass:{n:'Bass guitar',d:'A fuller low end',lv:['No bass','Starter bass','Jazz bass','Active 5-string'],c:[280,950,2900],q:2,fl:[-1,0,2]},
 sampler:{n:'Sampler',d:'Chop beats faster',lv:['No sampler','Pocket groovebox','Pad sampler','Flagship beat station'],c:[220,800,2500],q:2,fl:[-1,0,1]},
 vocal:{n:'Vocal chain',d:'Warmer, cleaner vocals',lv:['No preamp','Clean preamp','Tube preamp + compressor','Vintage channel strip'],c:[380,1300,4000],q:2,fl:[0,1,2]},
 synth:{n:'Synths',d:'Bigger sounds',lv:['No synth','Mono synth','Poly synth','Modular wall'],c:[500,1700,5200],q:2,fl:[0,1,3]},
 treat:{n:'Room treatment',d:'A tighter, clearer room',lv:['Echoey room','Corner bass traps','Traps + diffusers','Fully tuned room'],c:[320,1100,3400],q:2,fl:[0,1,2]},
 desk:{n:'Mixing desk',d:'Pro-level mixing',lv:['Mouse and laptop','Control surface','16-channel console','Large-format console'],c:[700,2600,8000],q:3,fl:[1,2,3]},
 content:{n:'Content kit',d:'More people find your songs',lv:['Phone camera','Ring light','Camera + softbox','Video studio'],c:[260,950,3200],s:.05,fl:[-1,0,2]}};
Object.assign(GEAR,GX);
/* what every gear line does per level (the older lines are added straight into the recording and stream formulas) */
const GQ={chair:4,mic:8,guitar:6,keys:3,drums:3,booth:5},GSB={promo:.3,decks:.2};Object.keys(GX).forEach(k=>{if(GX[k].q)GQ[k]=GX[k].q;if(GX[k].s)GSB[k]=GX[k].s});
const gl=k=>S.gear[k]||0,gfill=()=>{S.gear=S.gear||{};Object.keys(GEAR).forEach(k=>{if(!(S.gear[k]>=0))S.gear[k]=0})};gfill();
const gearQx=()=>Object.keys(GX).reduce((a,k)=>a+gl(k)*(GX[k].q||0),0),gearSx=()=>Object.keys(GX).reduce((a,k)=>a+gl(k)*(GX[k].s||0),0);
const gearLock=k=>{const G=GEAR[k],l=gl(k),t=G.fl?G.fl[l]:-1;return l<3&&t>=0&&fameLevel()<FTL()[t]?FTL()[t]:0};
{const lc=loadCode;loadCode=function(c){const r=lc(c);gfill();return r}}

/* buying: locks first, then the usual purchase (older saves may lack the new keys) */
{const buy0=buy;buy=function(k){gfill();const G=GEAR[k];if(!G||gl(k)>=3)return;const lk=gearLock(k);if(lk){snd('err');return say(G.n+': '+G.lv[gl(k)+1]+' unlocks at Fame Level '+lk+'.')}return buy0(k)}}

/* the bonus: new gear adds quality to every song you finish recording, and the content kit adds streams */
{const mf0=mgFinish;mgFinish=function(){const n0=S.nid;mf0.apply(this,arguments);const d=S.drafts[S.drafts.length-1];if(!d||d.id!==n0)return;const b=gearQx();if(!b)return;d.q+=b;
 const p=document.querySelector('#ui .modal p.m');if(p)p.innerHTML=p.innerHTML.replace(/mix quality \d+/,'mix quality '+d.q+' <span style="color:var(--g)">(+'+b+' studio gear)</span>')}}
{const po=planOf;planOf=function(s){const fresh=s.pd!==S.day,v=po(s),m=gearSx();if(!fresh||!(m>0)||!(v>0))return v;const cap=s.q*s.q*25*Math.pow(FAME_MULT,fameLv())-s.streams;s.pv=Math.max(v,Math.min(Math.round(v*(1+m)),Math.round(cap)));return s.pv}}

/* the shop, in sections */
const GCAT=[['Instruments',['guitar','bass','pedals','keys','synth','drums','sampler']],['Recording',['mic','vocal','iface','phones','monitors','desk']],['Room',['chair','booth','treat']],['Getting heard',['promo','decks','content']]];
const gEff=k=>GQ[k]?'+'+GQ[k]+' song quality per level':GSB[k]?'+'+Math.round(GSB[k]*100)+'% streams per level':'';
PG.shop=()=>{gfill();const q=Object.keys(GQ).reduce((a,k)=>a+gl(k)*GQ[k],0),s=Object.keys(GSB).reduce((a,k)=>a+gl(k)*GSB[k],0),seen=new Set();
 const card=k=>{seen.add(k);const G=GEAR[k],l=gl(k),mx=l>=3,lk=gearLock(k);return`<div class="card gsc" data-pv="g:${k}:${Math.min(3,l+(mx?0:1))}"><small class=m>${G.n} · ${G.d}</small><p style="margin:4px 0"><b style="font-size:15px">${G.lv[l]}</b> <span class=gpip>${[1,2,3].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</span></p><small style="color:var(--g)">${gEff(k)}</small>${mx?'<p class=m>Maxed out</p>':`<p class=m>Next: ${G.lv[l+1]}</p>${lk?`<button disabled>🔒 Fame Level ${lk} · ${$$(G.c[l])}</button>`:`<button class=go ${S.money<G.c[l]?'disabled':''} onclick="buy('${k}')">Buy ${$$(G.c[l])}</button>`}`}</div>`};
 const secs=GCAT.map(([t,ks])=>[t,ks.filter(k=>GEAR[k])]);const rest=Object.keys(GEAR).filter(k=>!GCAT.some(c=>c[1].includes(k)));if(rest.length)secs.push(['More',rest]);
 return`<h1>Gear shop</h1><p class=m>Balance: <b style="color:var(--g)">${$$(S.money)}</b> · Fame Level ${fameLevel()}</p><p class=m>Your gear adds <b style="color:var(--g)">+${q} quality</b> to every song you record${s?` and <b style="color:var(--g)">+${Math.round(s*100)}%</b> streams`:''}. Some upgrades unlock as your fame grows.</p>${secs.map(([t,ks])=>`<h3 class=gsh>${t}</h3><div class=cards>${ks.map(card).join('')}</div>`).join('')}`};
{const st=document.createElement('style');st.textContent='.gsh{margin:16px 0 8px;font:700 14px Silkscreen,monospace;letter-spacing:1px;opacity:.85}.gpip{display:inline-flex;gap:3px;vertical-align:middle;margin-left:4px}.gpip i{width:9px;height:9px;border-radius:2px;background:#0005;box-shadow:inset 0 0 0 1px #fff3}.gpip i.on{background:var(--g)}.gsc button[disabled]{opacity:.7}';document.head.appendChild(st)}

/* simple shapes for the new gear (hover previews and studio). The studio detail file replaces these with full models. */
const GXM={
 phones:l=>[[.3,.04,.3,'#333',0,.02,0],[.04,.5,.04,'#333',0,.27,0],[.36,.06,.1,['#666','#222','#c9c3b2','#8a6a3a'][l],0,.55,0],[.1,.22,.18,'#222',-.18,.42,0],[.1,.22,.18,'#222',.18,.42,0]],
 iface:l=>[[.3+.15*l,.1+.05*(l>1),.22,['#555','#c0392b','#2c3e50','#aab3bd'][l],0,.06,0],[.05,.05,.02,'#2fe68a',-.08,.08,.12]],
 monitors:l=>{const h=.3+.08*l,a=[[.2+.04*l,h,.22,'#1d1d22',-.35,h/2,0],[.2+.04*l,h,.22,'#1d1d22',.35,h/2,0],[.12,.12,.02,'#555',-.35,h*.6,.115],[.12,.12,.02,'#555',.35,h*.6,.115]];if(l>=3)a.push([.4,.35,.4,'#1d1d22',0,.18,.1]);return a},
 pedals:l=>{const a=[];if(l>=2)a.push([.7,.04,.3,'#222',0,.02,0]);for(let i=0;i<[0,1,3,5][l];i++)a.push([.1,.06,.14,['#e67e22','#2ecc71','#3498db','#e84393','#f1c40f'][i],-.24+i*.12,.07,0]);return a},
 bass:l=>[[.06,.9,.06,'#222',0,.45,0],[.4,.62,.12,['#555','#2a2a2a','#e8d9a0','#1f3a6e'][l],0,.5,.05],[.1,.95,.07,'#3a2a1a',0,1.25,.05],[.16,.14,.08,'#222',0,1.75,.05]],
 sampler:l=>[[.32+.08*l,.06,.3,['#555','#e8e8ec','#222','#2c3e50'][l],0,.03,0],...[0,1,2,3].map(i=>[.05,.02,.05,'#e84393',-.08+(i%2)*.1,.07,(i>>1)*.1-.03])],
 vocal:l=>{const a=[[.45,.55,.4,'#1d1d22',0,.28,0]];for(let i=0;i<l;i++)a.push([.42,.1,.02,['#c9a227','#aab3bd','#8a1c2a'][i],0,.45-i*.13,.205]);return a},
 synth:l=>{const a=[[1,.08,.45,'#222',0,.75,0],[.08,.75,.08,'#333',-.4,.37,0],[.08,.75,.08,'#333',.4,.37,0],[.9,.04,.2,'#eee',0,.8,.1]];if(l>=2)a.push([.9,.06,.3,'#3a2a1a',0,.88,-.05]);if(l>=3)a.push([1,.7,.15,'#2a2a2e',0,1.25,-.18]);return a},
 treat:l=>{const a=[[.3,1.6,.3,'#3a3f47',0,.8,0]];if(l>=2)a.push([.3,1.6,.3,'#3a3f47',0,.8,.5]);if(l>=3)a.push([.06,1.2,.8,'#5a3a6a',.1,1,1.2]);return a},
 desk:l=>{if(l<=1)return[[.6,.06,.3,'#2a2a2e',0,.03,0],[.5,.02,.1,'#555',0,.07,0]];return[[1+.3*(l-2),.12,.7,'#2a2a2e',0,.75,0],[.08,.7,.6,'#222',-.45,.35,0],[.08,.7,.6,'#222',.45,.35,0],[.9+.3*(l-2),.02,.5,'#555',0,.82,.05]]},
 content:l=>{const a=[[.04,1.4,.04,'#222',0,.7,0],[.3,.04,.3,'#222',0,.02,0]];if(l>=1)a.push([.4,.4,.04,'*fff6e0',0,1.45,0]);if(l>=2)a.push([.2,.14,.12,'#111',.3,1.2,0],[.5,.5,.3,'*fff0d8',-.45,1.3,0]);if(l>=3)a.push([1.2,1.4,.04,'#2e8b57',0,.7,-.4]);return a}};
{const gm2=gm;gm=(k,l)=>GXM[k]?GXM[k](l):gm2(k,l)}
/* where the new gear goes in the studio: [x, z, rotation, collision box or null] */
const GXP={phones:[9.45,.5,0,null],iface:[8.75,.55,0,null],monitors:[9.05,.35,0,null],pedals:[14.85,3.15,0,null],bass:[15.35,1.15,0,[15.1,.95,15.6,1.35]],sampler:[9.15,.72,0,null],vocal:[11.5,.75,0,[11.27,.55,11.73,.95]],synth:[8.95,5.2,0,[8.4,4.92,9.5,5.48]],treat:[15.75,.3,0,null],desk:[15.45,3.95,-Math.PI/2,[15.05,3.25,15.9,4.65]],content:[15.3,5.25,-Math.PI/4,[15.05,5,15.55,5.5]]};
const GTOP=['phones','iface','monitors','sampler'];/* these sit on the producer table under the window */
{const bs0=buildStudio;buildStudio=function(){bs0();gfill();if(!studio)return;const g=studio,tbl=GTOP.some(k=>gl(k))||gl('desk')==1;
 if(tbl){B(g,1.4,.06,.7,'#6b4a2e',9.05,.75,.55);[[8.4,.25],[9.7,.25],[8.4,.85],[9.7,.85]].forEach(p=>B(g,.06,.72,.06,'#3a2a1a',p[0],.36,p[1]));dyn.push([8.35,.2,9.75,.9])}
 Object.keys(GX).forEach(k=>{const l=gl(k);if(!l)return;const p=GXP[k],o=new THREE.Group();let y=0;if(GTOP.includes(k)||(k=='desk'&&l==1)){y=.78;if(k=='desk'){o.position.set(9.05,y,.75);g.add(o);GXM[k](l).forEach(a=>B(o,...a));return}}
  o.position.set(p[0],y,p[1]);o.rotation.y=p[2];g.add(o);GXM[k](l).forEach(a=>B(o,...a));if(p[3]&&!(k=='desk'&&l<2))dyn.push(p[3])})}}

/* a few things to do with the new gear at home */
{const di1=dynInt;dynInt=function(){const a=di1();if(typeof HIN!='undefined'&&HIN&&!IN){const near=(x,z)=>Math.hypot(P.x-x,P.z-z)<1.5;
 if(gl('bass')&&near(15.2,1.6))a.push({x:15.2,z:1.6,r:1.2,l:'Play bass',a:()=>say(pick(['You lock into a groove with the kick drum.','A deep note rattles the window.','You slap a funky line and grin.']))});
 if(gl('synth')&&near(8.95,4.5))a.push({x:8.95,z:4.5,r:1.2,l:'Jam on the synth',a:()=>say(pick(['You twist the filter and the room goes all warm.','An arpeggio loops while you hum a hook.','You find a patch that sounds like the future.']))});
 if(gl('desk')>=2&&near(14.7,3.95))a.push({x:14.7,z:3.95,r:1.2,l:'Check the mix',a:()=>say(pick(['You nudge a fader. Perfect.','The meters dance in the green.','You solo the vocal. Clean.']))});
 if(gl('content')&&near(14.9,4.8))a.push({x:14.9,z:4.8,r:1.1,l:'Film a clip',a:()=>say(pick(['You film a quick studio clip for your fans.','The ring light makes everything look expensive.','One more take... got it.']))})}return a}}
if(typeof studio!='undefined'&&studio)buildStudio();
