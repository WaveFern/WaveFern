/* ===== v26.110: economy rebalance + record labels =====
   One config block (UPX) holds every tuning knob of this update.
   Economy: streaming pay is halved (TUNE.payRate in 02-data.js) and gear prices grow exponentially per level
   (base x gearK^level). Gear that costs more also gives more (gearBoost on song-quality points).
   Labels: labels message you (Messages) when your listeners, total streams and reputation reach their thresholds.
   Signing gives an advance and login details for Label HQ. HQ is locked until you sign and you must log in with the
   details the label sent. Label quality q (0..1) scales HQ prices (lbCost), HQ benefits (lbBen), the highest HQ level (hqMax),
   the advance and the cut the label keeps from streaming income. */
const UPX={gearK:6,gearBoost:1.5,offerChance:.2,offerCooldown:20,leaveFee:.3,firstOfferDay:5,
 priceBase:.6,priceQ:1,benBase:.5,benQ:1};
const LABELS=[
 {id:'disc',n:'Discount Discs',q:.15,ml:300,st:5e3,rep:-99,adv:400,cut:.35,pitch:'We sign anyone. Fast contract, no fuss, small print included.'},
 {id:'flip',n:'QuickFlip Records',q:.25,ml:1500,st:4e4,rep:-99,adv:1500,cut:.3,pitch:'Quick releases, quick cash. We move units, you move on.'},
 {id:'brick',n:'Brickyard Sound',q:.5,ml:6e3,st:2.5e5,rep:0,adv:8e3,cut:.22,pitch:'An honest independent label with a proper studio and a small team.'},
 {id:'north',n:'Northlight Records',q:.62,ml:2e4,st:1.2e6,rep:1,adv:4e4,cut:.2,pitch:'A respected label with real radio contacts and a pro production crew.'},
 {id:'merid',n:'Meridian Music Group',q:.8,ml:8e4,st:6e6,rep:3,adv:2.5e5,cut:.16,pitch:'A major. Top producers, global marketing and a PR machine.'},
 {id:'crown',n:'Crown & Anchor Records',q:.92,ml:3e5,st:3e7,rep:5,adv:1.5e6,cut:.12,pitch:'The biggest name in music. Legendary studios, worldwide campaigns, the best team money can buy.'}];
const lbById=id=>LABELS.find(l=>l.id==id),lbCur=()=>S.label&&lbById(S.label.id);
const lbQ=()=>{const l=lbCur();return l?l.q:.5};
const lbBen=()=>lbCur()?UPX.benBase+UPX.benQ*lbQ():1;
const lbCost=c=>Math.round(c*(lbCur()?UPX.priceBase+UPX.priceQ*lbQ():1));
const hqMax=()=>{const q=lbQ();return !lbCur()?4:q<.35?2:q<.7?3:4};
const lbStars=q=>'★'.repeat(Math.max(1,Math.round(q*5)))+'☆'.repeat(5-Math.max(1,Math.round(q*5)));
let HQAUTH=false;

/* ---- gear: exponential prices, bigger payoff ---- */
{const done=new Set;Object.entries(GEAR).forEach(([k,g])=>{if(done.has(g)||!Array.isArray(g.c))return;done.add(g);const b=g.c[0];g.c=g.c.map((_,i)=>Math.round(b*Math.pow(UPX.gearK,i)))});
 Object.keys(GX).forEach(k=>{if(GX[k].q)GX[k].q=Math.round(GX[k].q*UPX.gearBoost);if(GX[k].s)GX[k].s=+(GX[k].s*UPX.gearBoost).toFixed(3)});
 Object.keys(GQ).forEach(k=>{if(GX[k]&&GX[k].q)GQ[k]=GX[k].q});Object.keys(GSB).forEach(k=>{if(GX[k]&&GX[k].s)GSB[k]=GX[k].s})}

/* ---- label offers ---- */
const lbRand=n=>{const c='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<n;i++)s+=c[Math.floor(Math.random()*c.length)];return s};
function lbElig(l){return (S.listeners||0)>=l.ml&&(S.streams||0)>=l.st&&(S.rep||0)>=l.rep}
function lbOffer(l){S.lbOff=S.lbOff||{};S.lbOff[l.id]=S.day;
 S.msgs.push({id:S.nid++,from:l.n,body:'Hello '+(S.artist||'there')+', this is the A&R team at '+l.n+'. '+l.pitch+' We have been following your numbers ('+Math.round(S.listeners).toLocaleString()+' monthly listeners) and would like to sign you. Signing bonus: $'+l.adv.toLocaleString()+'. We keep '+Math.round(l.cut*100)+'% of your streaming income. Label quality: '+lbStars(l.q)+'. You get access to our Label HQ with a login we send once you sign.',state:9,unread:1,day:S.day,lo:{id:l.id,st:0}});
 try{snd('ping');say(l.n+' sent you a record deal offer. Check Messages.')}catch(e){}}
function lbDaily(){if(S.label||!(S.songs&&S.songs.length)||S.day<UPX.firstOfferDay)return;
 S.lbOff=S.lbOff||{};if(S.msgs.some(m=>m.lo&&m.lo.st==0))return;
 if(S.lbLeft&&S.day-S.lbLeft<14)return;
 const c=LABELS.filter(l=>lbElig(l)&&!(S.lbOff[l.id]>=S.day-UPX.offerCooldown));if(!c.length||Math.random()>UPX.offerChance)return;
 const best=c[c.length-1];lbOffer(Math.random()<.55?best:c[Math.floor(Math.random()*c.length)])}
function lbMsg(l,t){S.msgs.push({id:S.nid++,from:l.n,body:t,state:9,unread:1,day:S.day})}
function lbSign(mid){const m=S.msgs.find(x=>x.id==mid);if(!m||!m.lo||m.lo.st!=0||S.label)return;const l=lbById(m.lo.id);if(!l)return;
 const slug=s=>String(s||'artist').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,10)||'artist',u=slug(l.id)+'.'+slug(S.artist),p=lbRand(8);
 S.label={id:l.id,since:S.day,user:u,pass:p,adv:l.adv};m.lo.st=1;S.money=+(S.money+l.adv).toFixed(2);S.apps=S.apps||{};S.apps.hq=1;
 lbMsg(l,'Welcome to '+l.n+'! Your signing bonus of $'+l.adv.toLocaleString()+' has been paid. Label HQ login: Username: '+u+'  Password: '+p+'  Open Label HQ on your computer and sign in with these details. Keep them safe, nobody else gets access.');
 updateVersion();snd('cash');say('Signed with '+l.n+'. Login details are in Messages.');pcR()}
function lbDecline(mid){const m=S.msgs.find(x=>x.id==mid);if(!m||!m.lo||m.lo.st!=0)return;m.lo.st=2;snd('pop');pcR()}
function lbLeave(){const l=lbCur();if(!l)return;const fee=Math.round(l.adv*UPX.leaveFee);if(!LBLQ){LBLQ=1;return pcR()}if(S.money<fee){snd('err');return say('You cannot afford the $'+fee.toLocaleString()+' exit fee.')}
 S.money=+(S.money-fee).toFixed(2);S.label=null;S.lbLeft=S.day;HQAUTH=false;LBLQ=0;snd('cash');say('You left '+l.n+'. Label HQ is locked until you sign again.');pcR()}
let LBLQ=0;
function hqLogin(){const u=($('hqu')||{}).value||'',p=($('hqp')||{}).value||'';if(S.label&&u.trim()==S.label.user&&p==S.label.pass){HQAUTH=true;snd('chime');return pcR()}snd('err');HQERR=1;pcR()}
let HQERR=0;

/* the label keeps its cut of the night's streaming income; new offers arrive */
{const w0=wakeUp;wakeUp=function(auto){const r=w0.apply(this,arguments);try{const l=lbCur(),h=(S.hist||[])[S.hist.length-1];
  if(l&&h&&h.d===S.day-1&&!h.lc){h.lc=1;const c=+(h.e*l.cut).toFixed(2);if(c>0){S.money=+(S.money-c).toFixed(2);S.earn=+((S.earn||0)-c).toFixed(2);S.lbPaid=(S.lbPaid||0)+c}}
  lbDaily()}catch(e){console.error('labels',e)}return r}}

/* existing saves with Label HQ levels get a mid-tier deal so their upgrades are not lost */
function lbLegacy(){if(S.label||!S.hq||typeof S.hq!='object')return;if(Object.values(S.hq).some(v=>v>0)&&Array.isArray(S.msgs)){const l=lbById('north'),u='northlight.'+String(S.artist||'artist').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10),p=lbRand(8);S.label={id:l.id,since:S.day,user:u,pass:p,adv:0};S.apps=S.apps||{};S.apps.hq=1;lbMsg(l,'Your Label HQ account is now managed by '+l.n+'. Label HQ login: Username: '+u+'  Password: '+p)}}
{const lc=loadCode;loadCode=function(c){const r=lc.apply(this,arguments);try{lbLegacy()}catch(e){}return r}}

/* Label HQ: locked until signed, login with the label's details */
{const hq0=PA.hq;PA.hq=function(){
  const l=lbCur();
  if(!S.label||!HQAUTH)return`<div class=hqx><h1><img src="${IC.hq}" style="width:32px;image-rendering:pixelated;vertical-align:middle"> ${l?esc(l.n)+' · ':''}Label HQ</h1><div class=card style="max-width:340px"><b>Sign in</b><p class=m>${l?'Use the username and password in the welcome message from '+esc(l.n)+'.':'Enter the username and password a record label sends you when you sign.'}</p><input id=hqu placeholder="Username" autocomplete=off style="width:100%;margin:4px 0"><input id=hqp type=password placeholder="Password" autocomplete=off style="width:100%;margin:4px 0" onkeydown="if(event.key=='Enter')hqLogin()"><button class=go onclick="hqLogin()">Sign in</button>${HQERR?'<p style="color:#e07a7a">Wrong username or password.</p>':''}</div></div>`;
  HQERR=0;const fee=Math.round(l.adv*UPX.leaveFee);
  const bar=`<div class=card style="margin-bottom:10px"><b>${esc(l.n)}</b> ${lbStars(l.q)}<br><small class=m>They keep ${Math.round(l.cut*100)}% of streaming income · HQ prices ×${(UPX.priceBase+UPX.priceQ*l.q).toFixed(2)} · HQ benefits ×${(UPX.benBase+UPX.benQ*l.q).toFixed(2)} · up to level ${hqMax()}${S.lbPaid?' · paid to label so far $'+Math.round(S.lbPaid).toLocaleString():''}</small><br><button onclick="HQAUTH=false;pcR()">Sign out</button> <button onclick="lbLeave()">${LBLQ?'Click again: leave label ($'+fee.toLocaleString()+' fee)':'Leave label'}</button></div>`;
  return hq0.apply(this,arguments).replace(/(<div class=hqx>)/,'$1'+bar)};}
{const o0=openPC;openPC=function(){HQAUTH=false;HQERR=0;LBLQ=0;return o0.apply(this,arguments)}}
{const s0=PA.store;PA.store=()=>s0().replace(/(onclick="inst\('hq'\)">)[^<]*</,'$1Label only<')}
APPD.hq.d='Locked until you sign with a record label. They send you a login. Better labels give a stronger team at higher prices.';

/* offers get Sign / Decline buttons in Messages */
{const pm=PA.msg;PA.msg=function(){let h=pm.apply(this,arguments);const m=S.msgs.find(x=>x.id==S.chat);
  if(m&&m.lo&&m.lo.st==0)h=h.replace(/<div class=cin><small[^>]*>Official account\. No replies\.<\/small><\/div>/,`<div class=cin style="gap:8px;padding:8px"><button class=go onclick="lbSign(${m.id})">Sign the deal</button><button onclick="lbDecline(${m.id})">Decline</button></div>`);
  else if(m&&m.lo&&m.lo.st==2)h=h.replace(/Official account\. No replies\./,'You declined this offer.');
  return h}}

/* Label HQ look: its own dark navy and gold boardroom style */
{const st=document.createElement('style');st.textContent=`.hqx{background:linear-gradient(160deg,#10142a,#1b2140 60%,#14182f);color:#e9e4d2;padding:14px;border-radius:0;border:2px solid #e6b422;box-shadow:inset 0 0 0 2px #0b0e1d;font-family:Georgia,'Times New Roman',serif;min-height:100%}
.hqx h1{font-variant:small-caps;letter-spacing:2px;color:#e6b422;border-bottom:2px solid #e6b42266;padding-bottom:6px}
.hqx .card{background:#1d2547;border:1px solid #e6b42288;border-radius:0;box-shadow:3px 3px 0 #0b0e1d}
.hqx .m,.hqx small.m{color:#aeb4d0}
.hqx input{background:#0e1124;color:#f4efdc;border:1px solid #e6b422;border-radius:0;padding:6px;font-family:inherit}
.hqx button{background:#2a3358;color:#f4efdc;border:1px solid #e6b422;border-radius:0;font-family:inherit}
.hqx button.go{background:#e6b422;color:#14182f;font-weight:bold}
.hqx button:hover:not([disabled]){filter:brightness(1.2)}`;document.head.appendChild(st)}
