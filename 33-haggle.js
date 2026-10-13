/* ===== v26.13: natural price negotiation in messages =====
   While a collab price is on the table (stage 2, nothing paid yet) the player can haggle in plain words:
   "$200", "200", "2k", "1.5k", "two hundred", "how about 150", "can you do 300", "meet me in the middle",
   "go lower/higher", "too much", "thats cheap", then yes/no as before.
   Who pays never changes: m.init=='a' -> the artist pays the player (player wants MORE), otherwise the player pays the
   artist's fee (player wants LESS). The artist keeps a hidden walk-away limit (lowest fee they take / most they pay),
   set once per deal from personality and relationship, concedes toward it in steps, may meet in the middle, refuses
   silly numbers, gives a final offer after too many lowballs and walks away if pushed past that.
   The current price always lives in m.pay, so the accept bar and payCollab charge/pay exactly that amount, once.
   Pure helpers (negNum, negKind, negStep) have no game dependencies so they can be unit-tested in node. */
const NEG_UNITS={zero:0,a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},
 NEG_TENS={twenty:20,thirty:30,forty:40,fourty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
/* money amount in a message, or null. Takes the last amount that is not marked as the old price ("not 300", "instead of 300"). */
function negNum(text){let s=String(text||'').toLowerCase().replace(/[’']/g,'');const found=[];
 /* digits: $1,200 / 1.5k / 2k / 200$ / 200 bucks; skip 5th, 100%, 3pm, 2 songs ... */
 const re=/(\$\s*)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*(k|grand|thousand|hundred)?(?![a-z0-9%])(\s*(?:\$|bucks?|dollars?|usd|quid))?/g;let r;
 while((r=re.exec(s))){const after=s.slice(re.lastIndex,re.lastIndex+12),before=s.slice(Math.max(0,r.index-14),r.index);
  if(/^\s*(%|percent|am\b|pm\b|songs?|tracks?|days?|weeks?|hours?|hrs?|mins?|minutes?|floor|x\b|times|people|listeners|streams|stars?)/.test(after)&&!r[1])continue;
  if(/[a-z0-9]$/.test(before)&&!r[1])continue;
  let v=parseFloat(r[2].replace(/,/g,''));const m=r[3];if(m=='k'||m=='grand'||m=='thousand')v*=1000;else if(m=='hundred')v*=100;
  const money=!!(r[1]||r[4]||m);found.push({v:Math.round(v),i:r.index,money,txt:r[0]})}
 /* words: two hundred and fifty / a hundred / one fifty / three grand / fifty bucks */
 const w=s.replace(/[^a-z0-9 \-]/g,' ').replace(/-/g,' ').split(/\s+/).filter(Boolean);let i=0;
 const idx=[];{let p=0;w.forEach(t=>{p=s.indexOf(t,p);idx.push(p);p+=t.length})}
 const NOTM=/^(songs?|tracks?|days?|weeks?|hours?|mins?|minutes?|people|listeners|streams|times|percent)$/;
 while(i<w.length){const t=w[i];if(t=='hundred'){}else if(!(t in NEG_UNITS||t in NEG_TENS)||((t=='a'||t=='an')&&!/^(hundred|thousand|grand|k)$/.test(w[i+1]||''))){i++;continue}
  let total=0,cur=0,j=i,used=0;
  for(;j<w.length;j++){const x=w[j];
   if(x in NEG_UNITS&&!(used&&(x=='a'||x=='an'))){const v=NEG_UNITS[x];
    if(!used)cur=v;else if(cur>=100&&cur%100==0)cur+=v;else if(cur>=20&&cur<100&&cur%10==0&&v<10)cur+=v;else if(cur>0&&cur<10&&v>=10)cur=cur*100+v;else break;used=1}
   else if(x in NEG_TENS){const v=NEG_TENS[x];if(cur%100==0)cur+=v;else if(cur<10)cur=cur*100+v;else break;used=1}
   else if(x=='hundred'&&(used||j==i)){cur=(cur||1)*100;used=1}
   else if((x=='thousand'||x=='grand'||x=='k')&&used){total+=(cur||1)*1000;cur=0}
   else if(x=='and'&&used&&(w[j+1] in NEG_UNITS||w[j+1] in NEG_TENS))continue;
   else break}
  const v=total+cur,tail=w[j]||'';
  if(used&&v>0&&!NOTM.test(tail)){const money=/hundred|thousand|grand|\bk\b/.test(w.slice(i,j).join(' '))||/^(bucks?|dollars?|quid)$/.test(tail);
   if(money||v>=20)found.push({v,i:idx[i],money,txt:w.slice(i,j).join(' ')})}
  i=Math.max(j,i+1)}
 found.sort((a,b)=>a.i-b.i);
 const ok=found.filter(f=>!/\b(not|instead of|rather than|than|from)\s*\$?\s*$/.test(s.slice(Math.max(0,f.i-16),f.i)));
 const L=(ok.length?ok:found);if(!L.length)return null;const f=L[L.length-1];
 /* a lone "100" is slang for yes (keep it 100), not an offer */
 if(!f.money&&/^\s*(100|hundred)\s*[!.]*\s*$/.test(s))return null;
 return f.v}
/* what the player is asking for, from the price point of view. pp = player pays (wants lower).
   returns 'better' (wants a better deal for themselves), 'mid', 'good' (says the price is generous), or null */
function negKind(text,pp){const s=' '+String(text||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9$ ]+/g,' ').replace(/\s+/g,' ')+' ',h=r=>r.test(s);
 if(h(/ (meet|meeting) (me )?(in the |at the )?(middle|halfway|half way)| split (the )?(difference|diff)| middle ground| meet (me )?half| halfway /))return'mid';
 const lowerW=/ (too (much|expensive|pricey|steep|high|rich)|go lower|lower|cheaper|come down|bring it down|knock (it |some )?(down|off)|discount|bit much|thats a lot|a lot of money|steep|pricey|expensive|less|drop (the price|it)|any lower|cut me a deal) /,
  higherW=/ (too (low|little|cheap)|go higher|higher|more|bump( it)?( up)?|raise|top (it )?up|is that all|thats it|lowball|worth more|not enough|stretch|pay more|up it|any higher) /,
  betterW=/ (do better|better (deal|price|offer|number)|work with me|negotiate|haggle|counter|come on|cmon|thats rough|can you budge|budge|wiggle room|flexible|any room) /,
  cheapW=/ (thats cheap|so cheap|cheap|bargain|steal|a steal|generous|great price|good price|fair price|fair enough price) /;
 if(h(betterW))return'better';
 if(pp){if(h(lowerW))return'better';if(h(cheapW))return'good';if(h(higherW))return null}
 else{if(h(higherW)||h(/ (cheap|stingy|tight|peanuts|thats nothing) /))return'better';if(h(/ (too much|thats a lot|generous|a lot of money|so much|great price|good price|fair price|bargain) /))return'good'}
 return null}
/* ===== v26.46: negotiation personalities and flexible counters =====
   Every artist has a seeded negotiation personality (artNP(i), see 75-collab-fees-dms.js): flexible, stubborn, proud, greedy, generous or shrewd.
   room  = how far from the opening price the artist will really go (drop for a fee the player pays, give for a payment the artist makes).
           It shrinks with the artist's size (big names move less) and grows a little with the relationship.
   rate  = the share of the gap between the ask and the player's offer that the artist closes in one counter.
   pat   = rounds before a final offer; ins = how low an offer can be before it counts as an insult.
   Counters scale with the size of the gap and with how reasonable the offer is, so a big raise gets a big move and a tiny raise a small one.
   Offers inside the artist's range are accepted with a chance that grows with how attractive the deal is and with the rounds spent,
   so deals usually happen but are not guaranteed. Prices round to sensible steps ($1, $5, $10, $25 ...). */
const NEG_P={
 flexible:{drop:.38,give:.42,rate:.55,pat:6,ins:.35},
 stubborn:{drop:.15,give:.14,rate:.2,pat:4,ins:.55},
 proud:{drop:.22,give:.24,rate:.32,pat:4,ins:.66},
 greedy:{drop:.18,give:.16,rate:.26,pat:4,ins:.50},
 generous:{drop:.45,give:.55,rate:.62,pat:7,ins:.25},
 shrewd:{drop:.28,give:.3,rate:.4,pat:5,ins:.45}};
const nu=v=>v<30?1:v<120?5:v<500?10:v<2500?25:v<10000?100:v<50000?250:1000,nr=v=>{const k=nu(v);return Math.max(1,Math.round(v/k)*k)};
const r5=nr;
/* fresh negotiation state for a deal. pp = player pays, base = the artist's opening price, who = artist index (or a personality name), rel = relationship score */
function negInit(base,pp,who,rel,rnd){let np='shrewd',big=0;
 if(typeof who=='number'&&typeof artNP=='function'){np=artNP(who);big=Math.min(1,Math.log10(1+ART[who][2])/8)}else if(typeof who=='string'&&NEG_P[who])np=who;
 const P=NEG_P[np]||NEG_P.shrewd,fx=1-.45*big,rb=Math.min(.3,Math.max(0,rel||0)*.03),j=((rnd==null?Math.random():rnd)-.5)*.2,room=(pp?P.drop:P.give)*fx*(1+rb)*(1+j);
 const lim=pp?Math.max(1,Math.ceil(base*(1-room))):Math.floor(base*(1+room));
 return{base,pp:!!pp,lim,A:base,last:null,first:null,low:0,rounds:0,fin:0,pat:P.pat+((rel||0)>=8?1:0),rate:P.rate*fx*(1+rb/2),ins:P.ins,np}}
/* one negotiation move. in = {num} or {kind}. returns {k: line key, pay: artist's (new) price, agreed?, walk?, x} and mutates g */
function negStep(g,inp){const s=g.pp?1:-1,u=p=>s*p,A=g.A,L=g.lim,R=Math.random,room=Math.max(1e-9,u(A)-u(L));
 /* move the ask a share of the way from A towards tgt, always by at least one price step and never past the limit */
 const mv=(tgt,fr)=>{let n=nr(A-s*Math.abs(A-tgt)*fr);if(u(n)>=u(A))n=A-s*nu(A);if(u(n)<u(L))n=L;return n};
 const walk=(x)=>({k:'walk',walk:1,pay:A,x}),agree=(p,k,x)=>{g.agreed=p;g.A=p;return{k:k||'deal',agreed:1,pay:p,x}};
 if(inp.num!=null){const x=inp.num;if(g.first==null)g.first=x;
  if(u(x)>=u(A))return agree(A,x==A?'deal':'over',x);
  const ratio=Math.max(0,Math.min(1,g.pp?x/Math.max(1,A):A/Math.max(1,x)));
  const insult=x<=0||(g.pp?x<L*g.ins:x>L/g.ins)||x>g.base*25;
  if(insult){g.low++;if(g.fin||g.low>g.pat||(g.np=='proud'&&g.low>=2))return walk(x);return{k:'absurd',pay:A,x,annoy:1}}
  g.last=x;
  if(u(x)>=u(L)){/* inside what they could live with: how attractive is it? */
   const frac=Math.min(1,(u(x)-u(L))/room),gap=Math.abs(A-x),pAcc=Math.min(1,.2+.85*frac+.14*g.rounds+(g.fin?.5:0)+(gap<=Math.max(1,g.base*.04)?.45:0))*(g.np=='stubborn'?.9:1);
   if(R()<pAcc)return agree(x,'deal',x);
   g.rounds++;const close=Math.max(.06,Math.min(.9,g.rate*(.6+.8*R())*(.6+.8*frac)));let n=nr(A-s*gap*close);if(u(n)>=u(A))n=A-s*nu(A);if(u(n)<=u(x))return agree(x,'deal',x);if(u(n)<u(L))n=L;g.A=n;return{k:'counter',pay:n,x}}
  /* below what they would ever take */
  g.rounds++;
  if(A==L||g.fin){g.low++;if(g.fin&&(R()<.6||g.low>g.pat))return walk(x);if(g.low>g.pat)return walk(x);return{k:'limit',pay:A,x}}
  if(ratio<.6)g.low+=.5;if(g.low>g.pat)return walk(x);
  if(g.rounds>=g.pat){g.fin=1;const n=mv(L,.5);g.A=n;return{k:'final',pay:n,x}}
  const close=Math.max(.04,Math.min(.8,g.rate*(.6+.8*R())*Math.pow(Math.max(.15,ratio),1.2)));g.A=mv(x,close);return{k:g.A==L?'limit':'counter',pay:g.A,x}}
 if(inp.kind=='mid'){if(g.last!=null&&u(g.last)<u(A)){const m=nr((g.last+A)/2);
   if(u(m)>=u(L)){if(R()<(g.np=='stubborn'?.5:g.np=='greedy'?.6:.85))return agree(m,'mid');g.rounds++;g.A=mv(m,.5);return{k:'counter',pay:g.A,x:g.last}}
   g.rounds++;g.A=mv(L,.5);return{k:'limit',pay:g.A}}
  inp={kind:'better'}}
 if(inp.kind=='better'){if(A==L||g.fin){g.low++;if(g.low>g.pat)return walk();return{k:'limit',pay:A}}
  g.rounds++;const stp=Math.max(g.rate*room*(.5+.7*R()),.03*A),n=nr(A-s*stp);g.A=u(n)>=u(A)?A-s*nu(A):u(n)<u(L)?L:n;return{k:g.A==L?'limit':'down',pay:g.A}}
 return null}
const NEG_L={
 pp:{counter:['hmm ${x} is kinda low. i can do ${pay} tho','cant do ${x} lol. ${pay}?','${x}? nah. meet me at ${pay}','ok ok, ${pay}. thats me being nice','${x} is not it, but ${pay} could work'],
  down:['fine, i can come down to ${pay}','ok ${pay}, just for you','alright, ${pay}. better?'],
  limit:['${pay} is as low as i go fr','cant go under ${pay}, sorry','${pay} is my floor, take it or leave it?'],
  absurd:['lol ${x}? be serious','${x}?? thats not a real offer','nah ${x} is crazy low, my fee is ${pay}']},
 ap:{counter:['${x} is a stretch for me. i can do ${pay}','cant do ${x} lol. how about ${pay}?','${x}? hmm. ${pay} is what i got','${pay} is where i can get to'],
  down:['ok ok, i can stretch to ${pay}','fine, ${pay}. you drive a hard bargain lol','alright ${pay}, better?'],
  limit:['${pay} is really my ceiling, sorry','cant go higher than ${pay}, promise','${pay} is all my budget, take it or leave it?'],
  absurd:['${x}?? i aint got that kinda money lol','lol ${x}? nah. ${pay} is the offer','${x} is wild, be serious']},
 deal:['bet, ${pay} it is. now lets find a day','ok deal, ${pay}. we are on, pick a day that works','sold, ${pay}. lock in a date'],
 over:['ha i only asked ${pay}, lets do that','lol ${pay} is fine, deal'],
 mid:['ok meet in the middle, ${pay}. deal','fair, ${pay} down the middle. we good','alright halfway, ${pay}. done'],
 final:['ok im getting tired of this. ${pay}, final offer','last time: ${pay}. take it or leave it','${pay}. thats final, no more haggling'],
 walk:['nah forget it, this aint working. maybe another time','ok im out, we cant agree on money. no hard feelings','yeah this is going nowhere. lets leave it'],
 locked:['we already said ${pay} lol, deal is a deal','we agreed ${pay} already. pick a day when ready','its ${pay}, we shook on it']};
/* a few lines in each personality's own voice (used instead of the generic ones when present) */
const NEG_LP={
 proud:{absurd:['do you know who you are talking to? ${x} is an insult','${x}? i dont get out of bed for that. ${pay}','im not a bargain bin artist. ${pay}'],limit:['${pay}. my name is worth that and more','i dont go lower than ${pay}, ever'],walk:['i have heard enough. we are done here','this is disrespectful. i am out']},
 greedy:{counter:['money talks. ${pay} and we have a deal','${x} wont cut it, ${pay} and thats generous','${pay}. i know what i am worth'],limit:['${pay} or nothing, my time is money','it is ${pay}. i do not do charity']},
 stubborn:{counter:['no. ${pay}','${pay}, i am not moving much','${x}? ${pay}. thats where i am'],down:['fine. ${pay}. not a cent less','${pay}. that is a favour'],limit:['${pay}. final. i dont repeat myself']},
 flexible:{counter:['ok i hear you, ${pay} works for me?','${x} is close! can you do ${pay}?','lets meet closer: ${pay}'],down:['sure, ${pay} then, happy to make it work']},
 generous:{counter:['aw ok, ${pay}? i want this to work for both of us','${x} is fair-ish, how about ${pay}?'],down:['sure thing, ${pay}, no stress']},
 shrewd:{counter:['i run the numbers: ${pay} makes sense for both of us','${x} undersells it. ${pay} is fair'],limit:['${pay} is where the maths stops working for me']}};
if(typeof reply=='function'){const rp0=reply;reply=function(m,t){
  if(!m||m.a===undefined||m.blocked||m.recv||!ART[m.a])return rp0(m,t);
  if(m.state!=0||m.stage<1||npcIntent(t).k=='abuse'||npcClaim(t)){delete m.ng;return rp0(m,t)}
  const pp=!isIn(m),num=negNum(t)??(m.ng&&/^\s*100\s*[!.?]*\s*$/.test(t)?100:null),kind=num==null?negKind(t,pp):null,R=npcIntent(t);
  const n=NZ(t),tg=IR.filter(r=>r[1].test(n)).map(r=>r[0]);let k2=kind;
  if(num==null&&!kind&&m.stage==2&&tg.includes('haggle')&&R.k!='yes')k2='better';
  if(m.stage==1&&(num==null||R.k=='no'))return rp0(m,t);
  if(num==null&&(!k2||k2=='good')){const r=rp0(m,k2=='good'&&m.stage==2&&R.k!='no'?'yes':t);if(m.ng&&m.ready&&m.stage==2)m.ng.agreed=m.pay;return r}
  const a=ART[m.a];if(m.stage==1){m.stage=2}
  if(!m.ng||m.ng.base==null||m.ng.pp!==pp)m.ng=negInit(m.pay,pp,m.a,m.rel);
  const g=m.ng,c=ctxOf(m);TY=0;m.rel=(m.rel||0)+1;let o;if(m.ready&&g.agreed==null)g.agreed=m.pay;
  if(g.agreed!=null&&m.ready){m.pay=g.agreed;o={k:'locked',pay:g.agreed,agreed:1}}
  else{g.agreed=null;g.A=m.pay;o=negStep(g,num!=null?{num}:{kind:k2})}
  if(!o)return rp0(m,t);
  c.pay=o.pay;c.x=o.x;const LP=NEG_LP[g.np]&&NEG_LP[g.np][o.k],L=(LP&&Math.random()<.65?LP:null)||NEG_L[o.k]||NEG_L[pp?'pp':'ap'][o.k];let line=pick(L);
  if(o.walk){m.stage=0;m.ready=0;m.rel-=3;m.neg=(m.neg||0)+1;m.cool=S.day+4;delete m.ng}
  else{m.pay=o.pay;if(o.agreed){m.ready=1}else m.ready=0;if(o.annoy){m.rel-=1}if(g.low>=2)m.neg=Math.max(m.neg||0,1)}
  m.log.push({f:'a',t:deco(a,fill(line,c)),d:S.day})}}
