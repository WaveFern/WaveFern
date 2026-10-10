/* ---------- v26.8 NPC chat: intent parser, blocking, who-pays, casual lines ---------- */
/* ===== 1. word lists (easy to read: one group per line of thought, comma separated, all lowercase, no apostrophes) ===== */
const NPC_LEX={
 /* the examples from the brief, plus everyday short answers */
 yes:{
  core:'no problem,no worries,no prob,np,no biggie,no stress,no sweat,why not,yeah,yh,ok,fine,less do it,less go,hell yeah,absolutely,positive,yes,yep,yup,sure,okay,alright,deal,lets do it,lets go,down,definitely',
  slang:'bet,say less,aight,fr,deadass,sheesh,lowkey down,w,big w,huge w,no cap,ong,on god,facts,run it,run it back,im down,count me in,hop on,cook,lets cook,lets get it,get it,lets lock in,locked in,lock in,pull up,pulling up,on my way,omw,slide,slide through,link up,lets link,say no more,no doubt,100,wya lets go,period,periodt,slaps,that slaps,goes hard,hits different,heat,fire,its fire,straight fire,certified,valid,thats valid,w idea,w take,im locked in,im on it,on it,im with it,with it,im so in,im in for it,count me in fam,yessir,yes sir,yes bro,yeah bro,yeah fam,yea fam,yeah man,yea man,yes mate,yes boss,aye aye,oui,si,da,hai,yup yup,ayy,ayyy,aye fam,aight bet,aight cool,aight deal,bet lets go,bet fr,okay bet,ight bet,fasho fam,for sure fam,frfr lets go,lets get this bread,get this bread,gas,gas gas,gassed,im gassed,we gassed,send it fam,run it up,lets run it,lets ride,ride with you,im riding,rocking,rock with it,rock with you,rockin with you,mess with it,fw it,fw that,i fw that,i fw you,im feeling it,feeling it,feel that,i feel that,im vibing,vibing,vibe with it,vibe check passed,sounds dope,sounds sick,sounds fire,sounds lit,sounds good to me,sounds solid,sounds like a vibe,sounds like a plan,sounds sweet,sounds wild,sounds amazing,sounds awesome,sounds perfect,sounds class,sounds tight,tight,solid,solid plan,lit,its lit,sick,dope,nice,nice one,neat,cool cool,coolio,kool,koo,mint,peng,wicked,wicked idea,banging,proper,quality,top,top shelf,legit,legit down,no brainer,easy yes,easy money,obv,obvi,obviously yes,duh,ofc yes,ofcourse,ya bet,you know it,you know it fam,you got it,got it,ill take it,i take it,im taking it,take my money,shut up and take my money',
  music:'lets make a hit,lets make a banger,lets record,lets hit the studio,studio time,in the studio,booth time,hop in the booth,lay a verse,ill lay a verse,ill hop on it,hop on the track,hop on the beat,send the beat,send me the beat,send the stems,drop the beat,drop it,lets drop it,lets drop a single,drop a feature,feature me,put me on,put me on the track,i got bars,got bars,got a verse ready,verse ready,hook ready,i got the hook,ill write the hook,lets write,write something,write it down,run the session,book the session,book the studio,book it in,lock the session,lets get in the lab,in the lab,lab time,cook in the lab,whip something up,whip it up,cook something up,lets cook something,lets cook it up,cooking,were cooking,lets vibe,lets jam,jam session,jam,lets mix,mix it,lets master,lets rap,rap collab yes,collab yes,collab me,duet yes,lets duet,lets feature,lets work,lets work together,lets team up,team up,team up fr,lets team,teaming up,lets link up and record,run a session,studio session yes,session yes,im ready to record,ready to record,ready to cook,ready to rock,ready to roll,ready to go,lets roll it,roll it,roll tape,mic check lets go,mics on,mic up',
  emotive:'yay,yayy,woo,woohoo,wooo,whoop,whoop whoop,hurray,hooray,woot,woot woot,yippee,boom,boomin,hell yes,heck yes,fuck yeah,fucking right,fuck right,fucking a,fuck it lets go,fuck it,damn right,damn straight,hell right,oh hell yeah,oh yeah,oh yes,oh heck yes,omg yes,omg yeah,omg lets go,oh my god yes,ahh yes,aww yes,yes yes yes,yes yes,heck ya,hell ya,hell yea,hells yeah,hell yup,aw yeah,aww yeah,ah yeah,ahh yeah,mmm yeah,mm yeah,hmm yeah,hm yes,why not yeah,sure why not,sure ok,sure okay,sure thing fam,sure lets,okay sure,ok sure,ok yeah,ok yes,ok cool,ok bet,ok lets go,ok lets do it,okay lets do it,okay lets go,okay yeah,okay yes,okay deal,okay then lets go,not bad,not a bad idea,thats not bad,cant say no,cant wait,cant wait for it,i cant wait,i love that,love it,love that,love this idea,love the idea,great idea,good idea,nice idea,smart idea,solid idea,best idea,best idea ever,perfect idea,im excited,so excited,excited,hyped,im hyped,so hyped,stoked,im stoked,thrilled,pumped,im pumped,so pumped,keen,im keen,so keen,well keen,buzzing,im buzzing,eager,im eager,thumbs up,fire emoji',
  positive:'positive,positively,affirmative yes,all good,all good with me,all good lets go,no issue,no issues,no probs,no prob bob,not a problem,zero problems,happy to,im happy to,happy to do it,more than happy,glad to,id love to,i would love to,wanna,i wanna,i wanna do it,i want to,i want in,want in,im keen to,looking forward,looking forward to it,cant wait to,honoured,honored,it would be an honour,it would be an honor,be my guest,go for it man,go right ahead,carry on,proceed,lets proceed,please proceed,works,that works for me,that works great,works like a charm,works well,fits,fits me,suits me,suits me fine,right on time,perfect timing,great timing,good timing'
 },
 /* "you hit me up first" style claims: player says the artist started the chat, so the artist pays */
 claim:'you hit me up,you hmu,you dmed me,you dm me first,you messaged me,you messaged me first,you texted me,you texted me first,you reached out,you reached out first,you contacted me,you asked me,you asked me first,you came to me,you slid in my dms,you slid into my dms,you hit my line,you hit my phone,it was you who messaged,it was you who hit me up,you started this,you started it,you pay me,you should pay me,you owe me,you called me,you hit me first',
 no:{
  /* decisive refusals: these win over any yes-word in the same message */
  strong:'hell no,heck no,hell nah,hell naw,hard pass,hard no,big no,no way,no way jose,no chance,not a chance,absolutely not,definitely not,never,over my dead body,zero chance,fuck no,fucking no,nope,not on your life,not in a million years,not in this lifetime,not in your dreams,in your dreams,dream on,keep dreaming,as if,yeah right,yea right,fat chance,when pigs fly',
  core:'nah,no,nope,hell no,not really,not rlly,not rly,nn,nahh,naw,pass,i pass,cant,cannot',
  slang:'nah fam,nah bro,nah man,nah mate,nah im good,nah im straight,nah im cool,nah thanks,nah ty,nah im out,nah dont think so,nah id pass,nah id rather not,nah never,nah nah,nah nah nah,nahh nah,naw bro,naw man,naw fam,naw im good,nope nope nope,nope not me,nope not today,nope sorry,nope cant,nope pass,no bro,no fam,no man,no mate,no sorry,no im good,no im straight,no ty,no thx,no gracias,no lol,no cap nope,not it,not it chief,not for me chief,not my vibe,not really my vibe,not my style,not my scene,not my genre,not really my thing,not my cup of tea,not feelin it,not feeling it,not feelin that,not feelin this,not vibin,not vibing with it,not vibing with that,not down,not too down,not so down,not really down,not rlly down,not keen,not too keen,not that keen,not really keen,not sure bout that,not sold,not sold on it,not convinced,not buying it,not into it,not into that,not really into it,not rlly into it,not feeling the vibe,not feeling the idea,not feeling this idea,not in the mood,not in the mood for it,not up for it,not up to it,not game,not for me fam,not for me bro,not for me man,not today fam,not now fam,not this time,not this week,not right now,not at the moment,not at this time,not rn,not tn,not tonight,not available rn,cant rn,cant today,cant tonight,cant make it,cant make that,cant swing it,cant swing that,cant do,cant afford it,cant commit,cant fit it in,cant fit you in,got no time,no time,no time rn,no time for it,too busy,im busy,im too busy,busy rn,busy af,busy this week,swamped,im swamped,slammed,im slammed,booked up,fully booked,tied up,im tied up,got plans,got other plans,already booked,already got plans,got a lot going on,a lot going on,got too much on,too much on,maybe not,probably not,prob not,prolly not,pretty sure not,i think not,i dont think so,dont think so,dont think i can,dont think i will,dont feel it,dont feel like it,dont really want to,dont really wanna,dont rlly wanna,dont wanna,dont want to,dont want that,dont want it,dont care to,dont need it,dont do collabs,i dont collab,dont collab,i dont do features,dont do features,no features,no collabs,no collab,not doing features,not doing collabs,not doing it,not doing that,not gonna happen,not gonna do it,not gonna work,wont work,wont happen,wont be doing it,wont be able to,wont be happening,aint doing it fam,aint for me,aint feeling it,aint down,aint it,aint it chief,leave it,leave it out,give it a miss,gonna pass,gonna skip,gonna sit this one out,sit this one out,sitting this one out,sitting out,count me out fam,count me out of this,include me out,take me off,take me out,opt out,im opting out,opting out,im outta here,outta here,im gone,im done,we are done,were done,thats a no,that is a no,thats a nope,thats a pass,thats a hard pass,thats a negative,thats not happening,thats not for me,thats not it,thats too much,thats a stretch,thats a reach,hard to say no but no,sorry but no,sorry no,sorry cant,sorry im busy,sorry not interested,sorry not now,sorry pass,sorry bro no,sorry man no,sorry fam no,regretfully no,unfortunately no,unfortunately not,unfortunately cant,afraid not,im afraid not,i am afraid not,id say no,id say pass,i say no,i say pass,i have to say no,i have to pass,have to pass,gotta pass,gotta decline,must decline,must pass,politely decline,politely declining,respectfully no,respectfully decline,respectfully pass,thanks but no,thanks but no thanks,thanks but pass,thanks anyway,thank you but no,nice try,good try,nice try buddy,try again,try someone else,ask someone else,find someone else,get someone else,go ask another artist,wrong person,wrong guy,wrong girl,wrong artist,thumbs down,boo,booo,cringe,ew,eww,yikes,nope emoji,x,xx,l,big l,huge l,that is an l,thats an l,w for me no,cap,thats cap,sounds like cap,sounds wack,sounds mid,mid,so mid,sounds boring,sounds bad,sounds awful,sounds terrible,sounds like a bad idea,bad idea,terrible idea,worst idea,awful idea,dumb idea,silly idea,no thanks fam,no thanks bro,no thank you very much,hold up no,hold on no,wait no,uh no,um no,umm no,er no,erm no,ehh no,eh no,eh nah,eh pass,ehh pass,meh no,meh pass,meh,nuh uh,nuhuh,no no,no no no,nono,noo,nooo,noope,nopey,nopers,nada fam,nix,nay,nyet,nein danke,non merci,no way fam,no way bro,no way man,no chance fam,naw fam never,hell nah fam,hell nawl,hell to the no,fuck that,screw that,forget that,forget this,forget about that,drop it,drop the idea,scrap that,scrap the idea,cancel that,call it off,calling it off,call it off fam,off the table,table that,take it off the table,nothing doing,no dice,no deal,no sale,no can do,i cant,i cannot,i wont,i will not,i refuse to,i decline,i must decline'
 },
 /* a message can only be ambiguous if it hits none of the yes/no lists; these just get a clarifying reply */
 amb:'maybe,idk,i dont know,not sure,unsure,depends,we will see,ill think,let me think,let me see,hmm,hm,hmmm,perhaps,possibly,kinda,sorta,eh,meh,mixed,thinking,wait what,huh,what,wdym,what do you mean,come again,say again,pardon',
 /* ABUSE: aimed at the artist. A curse used as an intensifier on a yes or no is NOT abuse. */
 abuse:{
  directed:'f off,fuck off,fuck you,fuck u,fuck ya,fuck yourself,fuck outta here,fuck out of here,eff off,eff you,screw you,screw off,piss off,piss off you,bugger off,sod off,get lost,go away,leave me alone,shut up,shut it,shut ur mouth,shut your mouth,shut the fuck up,stfu,gtfo,kys,go to hell,go to hell you,go die,drop dead,eat shit,eat a dick,suck my dick,suck my,suck a dick,suck it,kiss my ass,kiss my arse,up yours,screw yourself,damn you,curse you,i hate you,hate you,hate ya,you suck,u suck,you suck ass,you stink,u stink,you are trash,you are garbage,you are a joke,you are nothing,you are nobody,nobody likes you,no one likes you,get a life,die in a fire',
  insults:'idiot,moron,imbecile,dumbass,dumb ass,jackass,dipshit,dickhead,asshole,arsehole,bastard,bitch,cunt,twat,wanker,prick,scumbag,slimeball,lowlife,loser,clown,fraud,pathetic,worthless,useless,trash,garbage,stupid,ugly,scrub,bum,talentless,untalented,sellout,hack,fake,wannabe,has been,washed,washed up,dogshit,piece of shit,piece of crap,pos,tosser,numpty,muppet,knobhead,bellend,plonker,nonce,degenerate',
  /* strong curses are only abuse when aimed at them or standing alone; mild ones never are */
  strongcurse:'fuck,fucking,fuckin,motherfucker,mf,bitch,asshole,cunt,dickhead,bastard,prick,twat,wanker',
  mildcurse:'shit,shitty,damn,dammit,hell,crap,ass,wtf,wth,bloody,freaking,frigging,dang,darn,bullshit,bs'
 },
 /* emoji and emotive symbols are turned into words before matching */
 emoji:{'👍':'yes','👌':'yes','🔥':'yes','💯':'yes','🙌':'yes','🤝':'yes','✅':'yes','😎':'yes','🤙':'yes','💪':'yes','🙏':'yes','😍':'yes','🤩':'yes','😁':'yes','😀':'yes','😄':'yes','😊':'yes','🥳':'yes','🎉':'yes','🎤':'yes','🎶':'yes','❤':'yes','❤️':'yes','👊':'yes','✌':'yes','🚀':'yes','🐐':'yes','😤':'yes','😈':'yes',
  '👎':'no','❌':'no','🚫':'no','🙅':'no','🙅‍♂️':'no','🙅‍♀️':'no','😬':'no','🙄':'no','😒':'no','😑':'no','😐':'no','🤨':'no','😴':'no','🥱':'no','🤢':'no','🤮':'no','⛔':'no','✋':'no','🛑':'no','😕':'no','😞':'no',
  '🖕':'fuck you','🤬':'fuck you','💩':'you are trash'}
};
/* ===== 2. parser ===== */
const NPC_NEG=new Set('not dont didnt doesnt aint never cant wont wouldnt shouldnt couldnt isnt arent cannot'.split(' '));
const npcSq=s=>s.replace(/(.)\1+/g,'$1');
const npcSet=s=>new Set(s.split(',').map(x=>x.trim()).filter(Boolean));
const NPC_TAB=(()=>{const t=new Map(),strong=npcSet(NPC_LEX.no.strong);
 const add=(k,s,st)=>npcSet(s).forEach(p=>{const w=npcNorm(p).map(npcSq);if(!w.length)return;const key=w.join(' ');if(!t.has(key)||st)t.set(key,{k,s:!!st,n:w.length})});
 Object.keys(NPC_LEX.yes).forEach(g=>add('yes',NPC_LEX.yes[g]));
 Object.keys(NPC_LEX.no).forEach(g=>add('no',NPC_LEX.no[g],g=='strong'));
 return t})();
/* lowercase, de-censor (f***, f---, sh*t), emoji to words, strip punctuation, squash yesss -> yes */
function npcNorm(t){let s=String(t||'').toLowerCase();
 for(const e in NPC_LEX.emoji)if(s.includes(e))s=s.split(e).join(' '+NPC_LEX.emoji[e]+' ');
 s=s.replace(/[’'`]/g,'').replace(/100\s*%/g,' hundred percent ')
  .replace(/\bf[*\-_#@.]{1,}(?:ing|in|er|ed)?(?![a-z])/g,' fuck ')
  .replace(/\bf(?:u|v|[*\-_#@.])(?:[*\-_#@.]|c|k){1,3}(?:ing|in|er|ed)?(?![a-z])/g,' fuck ')
  .replace(/\bf[ck]k?(?:ing|in)?(?![a-z])/g,' fuck ').replace(/\bphuck\w*/g,' fuck ').replace(/\beff(?:ing|in)?\b/g,' fuck ')
  .replace(/\bsh?[*\-_#@!.]{1,3}t\b/g,' shit ').replace(/\bs[*#@_]{2,}\b/g,' shit ').replace(/\bb[*\-_#@!.]{1,2}tch/g,' bitch ')
  .replace(/\ba[*#@_]{2,}(?:hole)?/g,' asshole ').replace(/\bd[*\-_#@]{1,2}ck/g,' dick ').replace(/\bc[*\-_#@]{2,}t/g,' cunt ')
  .replace(/[^a-z0-9 ]+/g,' ').replace(/([a-z])\1{2,}/g,'$1');
 return s.split(/\s+/).filter(Boolean)}
const NPC_STRONG=npcSet(NPC_LEX.abuse.strongcurse),NPC_MILD=npcSet(NPC_LEX.abuse.mildcurse),NPC_INS=npcSet(NPC_LEX.abuse.insults.replace(/ /g,'_')),
 NPC_DIR=[...npcSet(NPC_LEX.abuse.directed)].map(p=>npcNorm(p).join(' ')),
 NPC_YOU=new Set('you u ur youre your ya yourself yo'.split(' '));
/* returns {k:'yes'|'no'|'abuse'|'amb', why} */
function npcIntent(text){const w=npcNorm(text),str=' '+w.join(' ')+' ',sq=w.map(npcSq);
 /* 1. abuse aimed at them */
 if(NPC_DIR.some(p=>str.includes(' '+p+' ')))return{k:'abuse',why:'directed'};
 const hasYou=w.some(x=>NPC_YOU.has(x));
 /* 2. yes/no phrases, longest first, with "not <yes>" flipping to no */
 const hit=[];for(let i=0;i<sq.length;){let f=null;for(let n=Math.min(6,sq.length-i);n>=1;n--){const e=NPC_TAB.get(sq.slice(i,i+n).join(' '));if(e){f={e,n};break}}
  if(f){let k=f.e.k;if(k=='yes'&&i>0&&NPC_NEG.has(sq[i-1]))k='no';hit.push({k,s:f.e.s,i});i+=f.n}else i++}
 const ins=w.filter(x=>NPC_INS.has(x)||NPC_INS.has(x+'_')).length||w.some((x,j)=>j<w.length-1&&NPC_INS.has(x+'_'+w[j+1]));
 const strongC=w.some(x=>NPC_STRONG.has(x));
 if(!hit.length){
  if(ins&&(hasYou||w.length<=3))return{k:'abuse',why:'insult'};
  if(strongC&&(hasYou||w.some(x=>/^(bitch|asshole|cunt|dickhead|bastard|prick|twat|wanker|motherfucker)$/.test(x))))return{k:'abuse',why:'curse'};
  return{k:'amb'}}
 if(ins&&hasYou)return{k:'abuse',why:'insult'};
 const y=hit.filter(h=>h.k=='yes').length,n=hit.filter(h=>h.k=='no').length;
 if(hit.some(h=>h.k=='no'&&h.s))return{k:'no',why:'strong'};
 if(y&&!n)return{k:'yes'};if(n&&!y)return{k:'no'};
 return{k:hit[hit.length-1].k,why:'last'}}
/* "you hit me up" claims: you/u/ya + optional filler words + a claim phrase */
const NPC_CLAIM=[...npcSet(NPC_LEX.claim)].map(p=>npcNorm(p).slice(1).join(' '));
function npcClaim(text){const w=npcNorm(text).map(x=>/^(u|ya|yu|yo|youu)$/.test(x)?'you':x),str=' '+w.join(' ')+' ';
 if(/ (didnt|never|not|dont|i) (hit|dm|message|text|reach|contact)/.test(str)&&!/ you (didnt|never)/.test(str)&&!/ it was you /.test(str))return false;
 if(/ it was you who /.test(str)||/ you were the one who /.test(str))return true;
 return w.some((x,i)=>x=='you'&&!/^(can|could|will|would|do|did|if)$/.test(w[i-1]||'')&&[0,1,2].some(g=>{const r=' '+w.slice(i+1+g).join(' ')+' ';return NPC_CLAIM.some(c=>r.startsWith(' '+c+' '))&&!w.slice(i+1,i+1+g).some(z=>NPC_NEG.has(z)||z=='didnt')}))}
const NPC_CLAIM_OK=['my bad, yeah i hit you up first. i got you, ${pay} on me','oh true, that was me lol. ok i pay you ${pay} for the session','ha fair, i slid in first. ${pay} from me then','yeah yeah, i reached out. my bad, ${pay} is on me'],
 NPC_CLAIM_NO=['nah you hit ME up lol','lol no, you messaged me first. check the chat','haha nice try, you reached out to me','nope, that was all you. my fee stays the same'];
/* option text from button dialogues goes through the same parser */
const npcAbusive=t=>npcIntent(t).k=='abuse';

/* ===== 3. blocking ===== */
let BLKI=null;
function npcBlock(m,why){const a=ART[m.a];if(!a||m.blocked)return;
 if(m.state==1)refundM(m);m.blocked=1;m.blockDay=S.day;m.state=0;m.stage=0;m.ready=0;m.want=0;m.rel=(m.rel||0)-5;
 m.log.push({f:'a',t:pick(NPC_BLOCK),d:S.day});m.unread=1;syncArt();updateVersion();snd('err');say(a[0]+' blocked you.');if(typeof MEET!='undefined'&&MEET&&MEET.m===m){MEET=null;closeUI()}}
const NPC_BLOCK=['nah, we are done. blocked.','ok that was uncalled for. i am out, blocking you.','yeah no, not dealing with that. blocked.','wow. ok. bye, blocked.','not cool at all. i am blocking you.'];
const NPC_CLAR=['lol sorry, was that a yes or a no?','wait, so are you in or not?','ha, i cant tell if thats a yes. so... are we doing it?','hmm so is that a yes or nah?','say it straight for me, you in or you out?','i lost you for a sec, are we on or not?'];

/* ===== 4. who pays: artist reaches out -> artist pays you; you reach out -> you pay them ===== */
const payOut=(a,k)=>Math.max(PACE.collabMin,Math.round(a[3]*PACE.collabPay*(k||1))),isIn=m=>m&&m.init=='a';
const npcFixPay=(t,n)=>t.replace(/my fee is( still)? \$[\d,]+/,(_,s)=>'i will'+(s?' still':'')+' pay you $'+n).replace(/\$[\d,]+ for a session/,'i will pay you $'+n+' for a session').replace(/\s+/g,' ').trim();
const RB_IN={terms:['love that. i will pay you ${pay} for one {g} session, and my name goes on the track. cool?','nice! ${pay} from me for one session, you get the feature. that work?','sick. i will send you ${pay} for the session. deal?'],
 pay:['i got ${pay} for you for one session, plus the feature.','${pay} from my side for the session. my budget is what it is.','so i pay you ${pay} and we split the song. fair?'],
 up:['ok ok, i can stretch to ${pay}. thats my best.','fine, ${pay}. you drive a hard bargain lol.'],limit:['${pay} is really my ceiling, sorry. take it or leave it?','cant go higher than ${pay}, promise.'],
 confirm:['sweet. i pay you ${pay} and i will see you {loc}. hit accept when ready.','deal. ${pay} comes your way once you accept, see you {loc}.','love it. accept the ${pay} and i will meet you {loc}.']};
{const rp0=reply;reply=function(m,t){
  if(m.a===undefined)return rp0(m,t);
  if(m.blocked){TY=0;return}
  const R=npcIntent(t);if(R.k=='abuse'){TY=0;npcBlock(m);return}
  let claimed=0;
  if(npcClaim(t)&&!m.recv&&m.state!=3){const a=ART[m.a];
   if(m.init=='p'){m.log.push({f:'a',t:deco(a,pick(NPC_CLAIM_NO)),d:S.day})}
   else{claimed=1;if(m.state==1&&m.paid){refundM(m);m.state=0;m.stage=2;m.ready=1}
    if(m.init!='a'){m.init='a';m.pay=payOut(a);m.neg=0;if(m.stage==2&&m.state==0)m.ready=1}
    const c=ctxOf(m);c.pay=m.pay;m.log.push({f:'a',t:deco(a,fill(pick(NPC_CLAIM_OK),c)),d:S.day});syncArt();updateVersion()}
   m.unread=1;if(R.k!='yes'){TY=0;return}}
  const n=NZ(t),tg=IR.filter(r=>r[1].test(n)).map(r=>r[0]),has=x=>tg.includes(x),wait=(m.stage>=1&&m.state==0)||m.state==1||m.state==3;
  if(m.state==3&&!claimed)m.init='p';
  /* make sure plain-yes / plain-no style answers reach the old logic as yes / no */
  if(wait){if(R.k=='yes'&&(!has('yes')||has('no')))t='yes';else if(R.k=='no'&&(!has('no')||has('yes')))t='no'}
  /* unclear short answer to a pending question: ask again casually */
  if(wait&&R.k=='amb'&&m.state==0&&!tg.some(k=>k!='q')&&n.trim().split(/\s+/).length<=4){TY=0;m.rel=(m.rel||0)+1;m.log.push({f:'a',t:deco(ART[m.a],pick(NPC_CLAR)),d:S.day});return}
  if(isIn(m)){
   if(m.stage==2&&m.state==0&&has('haggle')&&!has('yes')){const a=ART[m.a],c=ctxOf(m);TY=0;m.rel=(m.rel||0)+1;let r;if(m.neg<1){m.neg++;m.pay=Math.round(m.pay*1.13);c.pay=m.pay;r=pick(RB_IN.up)}else{c.pay=m.pay;r=pick(RB_IN.limit)}m.log.push({f:'a',t:deco(a,fill(r,c)),d:S.day});return}
   const sv={};Object.keys(RB_IN).forEach(k=>{sv[k]=RB[k];RB[k]=RB_IN[k]});try{rp0(m,t)}finally{Object.keys(sv).forEach(k=>RB[k]=sv[k])}return}
  rp0(m,t)}}
{const pc0=payCollab;payCollab=function(id){const m=S.msgs.find(x=>x.id==id);
  if(!m||m.blocked)return;
  if(!isIn(m))return pc0(id);
  if(m.state!=0||m.stage!=2||!m.ready||m.recv)return;const a=ART[m.a];
  S.money=+(S.money+m.pay).toFixed(2);m.recv=m.pay;m.paid=0;m.state=1;m.ready=0;m.log.push({f:'a',t:deco(a,fill(pick(RB.deal),ctxOf(m))),d:S.day});syncArt();updateVersion();snd('cash');say(a[0]+' paid you '+$$(m.recv)+'. Go meet them (gold beacon).');pcR()}}
{const rf0=refundM;refundM=function(m){if(m&&m.recv){const b=Math.min(S.money,m.recv);S.money=+(S.money-b).toFixed(2);say('Gave back the '+$$(b)+' payment.');m.recv=0}else rf0(m)}}
{const cd0=collabDone;collabDone=function(){const o=cs2&&cs2.o,m=o&&S.msgs.find(x=>x.a===o.i);if(m)m.recv=0;return cd0.apply(this,arguments)}}
{const nc0=newConv;newConv=function(i,q){if(BLKI&&BLKI.has(i))return;const n0=S.nid;nc0(i,q);S.msgs.forEach(m=>{if(m.id>=n0&&m.a!==undefined){m.init='a';m.pay=payOut(ART[m.a])}})}}
{const fd0=firstDMs;firstDMs=function(){const n0=S.nid;fd0();S.msgs.forEach(m=>{if(m.id>=n0&&m.a!==undefined){m.init='a';m.pay=payOut(ART[m.a])}})}}
{const sc0=startChat;startChat=function(i){sc0(i);const m=S.msgs[S.msgs.length-1];if(m&&m.a===i)m.init='p'}}
{const g0=genMsgs;genMsgs=function(){const bl=S.msgs.filter(m=>m.blocked&&m.a!==undefined),snap=S.msgs.filter(m=>m.a!==undefined&&Array.isArray(m.log)).map(m=>[m,m.state,m.stage,m.log.length]);
  bl.forEach(m=>{m.a0=m.a;m.a=undefined});BLKI=new Set(bl.map(m=>m.a0));
  try{g0()}finally{bl.forEach(m=>{m.a=m.a0;delete m.a0});BLKI=null}
  snap.forEach(([m,st,sg,len])=>{if(m.a===undefined||m.blocked||!Array.isArray(m.log)||m.log.length<=len)return;const a=ART[m.a],L=m.log[m.log.length-1];
   if(st==3&&m.state==0&&m.stage==2){m.init='a';m.pay=payOut(a,1.2)}
   if(isIn(m)&&m.state==0&&m.stage>=1)L.t=npcFixPay(L.t,m.pay)})}}
/* in-person meeting: option text uses the same parser (rude option = they walk out and block you) */
{const mp0=meetPick;meetPick=function(i){const M=MEET;if(M&&M.opts[i]&&npcAbusive(M.opts[i][1])){const m=M.m;npcBlock(m);return}mp0(i)}}

/* ===== 5. casual NPC lines ===== */
Object.assign(RB,{
 bye:['aight later {n}','cool, catch you later','ttyl, keep cooking','peace, hit me up anytime'],
 thanks:['np at all','anytime fam','ha you good, no need','all love'],sorry:['you good, no stress','lol its fine, forget it','all good fr'],
 rude:['ouch lol, ok','bro, chill. keep it friendly','not feeling that tone, {n}'],
 how:['not bad, mostly studio and snacks. you?','busy week but good. been on some {g} stuff. u good?','cant complain tbh. what you been up to?','tired but happy lol. you holding up?'],
 you:['not much to tell tbh, i make {g} and overthink everything','been at it forever. {g} is home but i mess around with other stuff too','just a {g} nerd haha. what about you?'],
 love:['aw thanks, that means a lot','appreciate it fam, coming from someone with {lis} listeners too','stoppp you are too nice','ha ok you are making me blush'],
 laugh:['lol right?','haha did not see that coming','ok that got me','lmao you are funny'],greet:['hey {n}!','yo, good to hear from you','sup, how you been?','hiii how is your day going?'],
 music:['"{song}" has been stuck in my head ngl. how did you make it?','been on a {g} binge lately. what are you working on?','your writing hits different, for real. beat first or lyrics first?','i spend forever on the low end lol. you mix your own stuff?'],
 where:['we will sort the spot once we lock it in. so are we doing this?','usually round the studio or out in town','round the main street most days tbh'],when:['whenever, im pretty flexible','prob in the next few days','just say what day works'],
 q:['good q lol, depends on the day tbh','hmm no clue. what you think?','idk but im curious what you think','you ask the best questions'],
 gen:['mm i hear you, go on','ok i get what you mean about "{prev}"','fair, good point','ha yeah, was thinking the same','interesting, keep going','yeah that makes sense'],
 ask:['random question: want to do a {g} collab sometime?','been thinking, we should make something {g} together. you in?','yo, would you be down for a {g} track?'],
 terms:['love that. my fee for one {g} session is ${pay}, and you get the track with my feature on it. that work?','cool, a session with me is ${pay}. deal?','nice. one {g} session is ${pay} from me. sound fair?'],
 deal:['deal. meet me {loc} and we cut it','sorted, see you {loc}','perfect, {loc}. bring your best ideas'],
 no:['all good, door is always open','no worries fam, thanks for being straight with me. we can still chat','fair enough, i will be around if you change your mind'],
 why:['what would make it work for you? more pay, different vibe?','aw that sucks. is it the money or the style?','ok whats the hesitation? tell me'],later:['no rush, just lmk','sure, think it over. im not going anywhere','take your time, offer is open'],
 pay:['my fee is ${pay} for one session, and the song is yours with my feature','i charge ${pay} a session, that covers my studio time','${pay} for the session and my name on your track'],
 up:['ok ok, i can come down to ${pay}. thats as low as i go','fine, ${pay}. you drive a hard bargain lol'],limit:['${pay} is really my limit, take it or leave it?','cant go lower than ${pay}, sorry'],
 acc:['see you {loc}','cant wait, {loc}','i will be there, {loc}'],
 confirm:['sweet. my fee is ${pay}. hit confirm and i will see you {loc}','deal, once the ${pay} is sorted we are on. confirm when ready','love it. ${pay} and we are booked. confirm and i will meet you {loc}'],
 cancel:['aw shame, no hard feelings. plan is off','ok cancelled. just say when you wanna try again','got it, i will cancel on my end. hit me up when things calm down']});
FDM.w=['saw you just set up your page. new artists are my fave to find. wanna make something together?','heard theres a new name in town. that you? we should cook something up','just found your profile, the vibe is right. i got a beat with your name on it'];
FDM.f=['welcome to the scene! no pressure, just saying hi','hey new neighbour in the music world. good luck with the first track','saw your page pop up. hope the first week treats you well'];
CI.length=0;CI.push('hey {n}, was just thinking about "{song}". still stuck in my head','random thought: {lis} listeners is no joke. proud of you','you eaten yet? i got way too many snacks','been in the studio all day lol, send me whatever you are working on','your last release got me inspired to start something new','how is the week going?','dreamt about a {g} track together last night, weird','heads up, im around the studio this week if you wanna link up');
Object.assign(OPEN,{chill:['hey, you made it. no stress, studio is all ours','yo, good to see you in person. whats the vibe today?'],hype:['YOOO there they are! you ready to cook?!','LETS GOOO, the session is finally happening!'],shy:['oh, hi... um, thanks for booking this','hey... sorry, i get kinda nervous meeting people. hi'],formal:['Hey, good to meet you in person. Shall we get into it?','Thanks for coming. I am ready when you are.'],goofy:['ahoy collab buddy! i brought exactly zero snacks','sup human. the beat awaits']});
Object.assign(RCT.pos,{chill:['ha, i like that energy','yeah that feels right'],hype:['THAT is what im talking about!','YES love it!!'],shy:['oh... thats actually really nice','okay, i feel a bit better now'],formal:['Nice, that makes sense.','I like that approach.'],goofy:['ha! you are my kind of weird','ok that got a laugh out of me']});
Object.assign(RCT.neu,{chill:['mm ok cool','fair enough'],hype:['okay okay, sure','alright, i hear you'],shy:['um, okay','sure i guess'],formal:['Got it.','Alright then.'],goofy:['huh. ok then','noted, captain']});
Object.assign(RCT.neg,{chill:['eh bit much but alright','hm not really my vibe tbh'],hype:['bro where is the energy?','come on, thats kinda flat'],shy:['oh... okay','thats a bit intense for me'],formal:['I would rather we stay focused.','Thats not really how I work.'],goofy:['wow tough crowd','ok mister serious']});
Object.assign(MID,{chill:['so what kinda sound are you hearing?','how do you usually start a track?'],hype:['whats the big idea for the drop?!','how loud are we going?'],shy:['do you, um, want me on the hook or a verse?','should i warm up first?'],formal:['How do you want to split the verses?','Got a reference in mind?'],goofy:['should the song be about soup? asking seriously','what if the chorus was just clapping?']});
Object.assign(READY,{chill:['alright, lets lay it down'],hype:['okay mics on, LETS RECORD!'],shy:['okay... i think im ready'],formal:['Shall we start recording?'],goofy:['to the microphone, onward!']});
/* ===== newest-activity-first chat list =====
   each thread keeps m.act (last-activity counter). Old saves: threads get their current list index, so relative order is kept.
   whenever a thread's log grows (incoming DM, reply, your message) or a thread is new, it gets the next counter and moves to the top. */
function msgTouch(){const L=S&&S.msgs;if(!Array.isArray(L))return;
 if(typeof S.actSeq!='number'){S.actSeq=0;L.forEach((m,i)=>{m.act=i+1;m._ll=(m.log||[]).length});S.actSeq=L.length}
 L.forEach(m=>{const n=(m.log||[]).length;if(typeof m.act!='number'||n>(m._ll||0)){m.act=++S.actSeq}m._ll=n})}
const msgSorted=()=>{msgTouch();return S.msgs.slice().sort((a,b)=>(a.act||0)-(b.act||0))};
{const pm=PA.msg;PA.msg=function(){msgTouch();const L=S.msgs;if(!L.some(m=>m.id==S.chat)&&L.length){S.chat=msgSorted().pop().id}
 /* the renderer lists S.msgs reversed, so hand it the threads sorted oldest -> newest activity */
 const orig=S.msgs;S.msgs=msgSorted();try{return pm()}finally{S.msgs=orig}}}
setInterval(()=>{try{msgTouch()}catch(e){}},500);
