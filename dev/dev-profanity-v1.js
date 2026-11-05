/* WaveFern dev: strict profanity and slur filter. Only loaded on /dev/. Add ?noprofanity to the address to skip it.
   - window.fwProfane(text, asName) -> true if the text holds a swear or slur. Catches number swaps (sh1t), symbol swaps (a$$, sh!t),
     letter swaps (fvck, phuck, kunt), stretched letters (shiiit), spaced out letters (f u c k, f.u.c.k) and starred ones (f*ck).
   - window.fwClean(text) -> the text with each bad word turned into stars.
   - Every text box masks bad words as you type, names are refused, and every piece of text that appears on the page (NPC messages,
     friends, room chat, other players' names, toasts) is masked the moment it shows up, so an NPC can never say one, even if you bait it.
   - NPC message logs in the save are scrubbed too, so nothing bad is ever stored or replayed. */
(function(){
 if(!window.FW_DEV||/[?&]noprofanity/.test(location.search))return;
 const FALL=['lol sorry, lost my train of thought. what were we saying?','haha anyway, lets keep it nice. so whats the plan?','hmm, not gonna go there. what else is up?','ok moving on, what do you want to do next?','sorry, my phone is acting up. say that again?'];
 let fi=0;const fall=()=>FALL[(fi++)%FALL.length];
 const NPCB='.bb.a,.bb.n,[data-npc],.npc,.npcbub,.npcsay,#npcsay,#npcbub';
 const LEET={'0':'o','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a','$':'s','!':'i','|':'i','+':'t','(':'c','€':'e','¢':'c','£':'l'};
 /* letter swaps: ph=f, c/q=k, v=u, z=s, then repeated letters are squashed, so fvck, phuck and fuuuck all become fuk */
 const skel=s=>s.replace(/ph/g,'f').replace(/[cq]/g,'k').replace(/v/g,'u').replace(/z/g,'s').replace(/(.)\1+/g,'$1');
 /* found anywhere inside a word */
 const ROOTS=['fuck','shit','cunt','faggot','bitch','biatch','whore','retard','bastard','asshole','arsehole','dickhead','cocksuck','motherf','wank','twat','pussy','slut','bollock','rapist','nazi','porn','jizz','dildo','blowjob','handjob','cumshot','goddam','douche','jerkoff','bugger','piss','tranny','shemale','wetback','beaner','towelhead','raghead','mongoloid','kunt','bullsh','dumbass','jackass','fatass','smartass','badass','dipshit','cracka'].map(skel);
 /* only when the whole word is exactly this */
 const WORDS=['ass','asses','arse','arses','dick','dicks','cock','cocks','prick','pricks','tit','tits','titty','titties','boob','boobs','crap','crappy','damn','damned','turd','cum','cums','cumming','anal','penis','vagina','fag','fags','fagot','dyke','spic','spick','chink','gook','kike','coon','paki','negro','negroes','jap','spaz','rape','raped','raping','rapes','hitler','heil','kkk','kys','wtf','stfu','gtfo','omfg','mfer','mfers','sob','hoe','hoes','thot','simp','incel','pedo','pedophile','molest','whore','slag','skank','bimbo','tosser','git','knob','bellend','minge','clit','scrotum','ho','hore','sluts','bitches','bitchy','biches','hell','bloody','freaking','frigging','friggin'].filter(w=>!['sob','simp','git','hell','bloody','freaking','frigging','friggin','bimbo','ho','knob'].includes(w)).map(skel);
 /* letters left out: f*ck, sh*t, b*tch, n*gger */
 const SHORT=['fck','fk','fkn','fckn','fcking','fking','fkin','fckin','fcker','fckr','sht','shtty','shyt','shyte','btch','btches','bch','cnt','dck','nga','ngga','nggr','ngger','nggers','nigr','pssy','mthrfckr','mthrfkr','mtherfkr','wtfk','azz','fuk','fuks','fuking','fukin'].map(skel);
 const OK=['shitake','shiitake','mishit','mishits','mishitting','scunthorpe','snigger','niggle','niggling','retardant','retardants','classic','assassin','assassinate','assess','assist','assume','assure','assign','assault','associate','assembly','asset','passage','massage','bass','class','glass','grass','brass','mass','pass','compass','harass','embarrass','cassette','potassium','dumbassery','titan','title','titanic','constitution','cockpit','cocktail','peacock','shuttlecock','hancock','dickens','dickinson','cumber','cucumber','document','accumulate','pissarro','analysis','analyst','analog','canal','banal','penistone','bugger','sextant','therapist','grape','drape','scrape','parapet','craps'].map(skel).filter(w=>!['bugger'].includes(w));
 const OKRE=new RegExp(OK.filter(w=>w.length>=5&&!WORDS.includes(w)).sort((a,b)=>b.length-a.length).join('|'),'g');
 const strip=s=>String(s==null?'':s).normalize('NFKD').replace(/[̀-ͯ​-‏⁠﻿­]/g,'').toLowerCase()
  .replace(/[а]/g,'a').replace(/[е]/g,'e').replace(/[о]/g,'o').replace(/[р]/g,'p').replace(/[с]/g,'c').replace(/[х]/g,'x').replace(/[і]/g,'i');
 /* 1 can be i or l, so check both */
 const variants=t=>{const a=t.replace(/[03478@$!|+(€¢£]|5/g,c=>LEET[c]||c);return[a.replace(/1/g,'i'),a.replace(/1/g,'l')].map(v=>v.replace(/[^a-z]/g,''))};
 /* one word (no spaces) */
 function badWord(w,asName){
  for(const v of variants(strip(w))){if(!v)continue;const k=skel(v);
   if(WORDS.includes(k)||SHORT.includes(k))return true;
   if(/nigg|nigha|nigah/.test(v.replace(/snigger\w*|niggl\w*|nigger?ly/g,'')))return true;
   const k2=k.replace(OKRE,'');
   if(ROOTS.some(r=>k2.includes(r)))return true;
   if(asName&&WORDS.some(x=>x.length>=4&&k2.includes(x)))return true}
  return false}
 /* a whole text: each word, and runs of single letters read together (f u c k) */
 function badText(t,asName){
  t=String(t==null?'':t);if(!t.trim())return false;
  const toks=strip(t).split(/\s+/).filter(Boolean);
  if(toks.some(x=>badWord(x,asName))||(asName&&badWord(t.replace(/\s+/g,''),true)))return true;
  /* tokens joined by dots, dashes, underscores or slashes: f.u.c.k, s-h-i-t, f_u_c_k */
  for(const x of toks){const p=x.split(/[.\-_\/\\,*~^]+/).filter(Boolean);if(p.length>1){if(p.some(y=>badWord(y,asName)))return true;if(p.every(y=>y.length<=2)&&badWord(p.join(''),true))return true}}
  for(let i=0;i<toks.length;i++){let j=i,s='';while(j<toks.length&&toks[j].replace(/[^a-z0-9]/g,'').length<=1&&s.length<14){s+=toks[j].replace(/[^a-z0-9]/g,'');j++}
   if(s.length>=3&&badWord(s,true))return true}
  return false}
 window.fwProfane=(t,asName)=>{try{return badText(t,!!asName)}catch(e){return false}};
 function clean(t){
  t=String(t==null?'':t);if(!t||!/[A-Za-z0-9@$!|+(À-￿]/.test(t)||!badText(t,false))return t;
  const parts=t.split(/(\s+)/);
  /* single letters in a row */
  for(let i=0;i<parts.length;i+=2){let j=i,s='',n=0;while(j<parts.length&&parts[j].replace(/[^A-Za-z0-9]/g,'').length<=1&&parts[j]!==''&&n<14){s+=parts[j].replace(/[^A-Za-z0-9]/g,'');j+=2;n++}
   if(n>=3&&badWord(s,true)){for(let q=i;q<j;q+=2)parts[q]=parts[q].replace(/[A-Za-z0-9]/g,'*');i=j-2}}
  for(let i=0;i<parts.length;i+=2){const w=parts[i];if(!w)continue;
   const m=w.match(/^([^A-Za-z0-9@$!|+(]*)(.*?)([^A-Za-z0-9@$!|+()]*)$/);const core=m?m[2]:w;
   if(core&&(badText(core,false)||badWord(core.replace(/[.\-_\/\\,~^]+/g,''),false))){parts[i]=(m?m[1]:'')+'*'.repeat(core.length)+(m?m[3]:'')}}
  return parts.join('')}
 window.fwClean=t=>{try{return clean(t)}catch(e){return String(t==null?'':t)}};

 /* ---- names: refuse them outright ---- */
 const NOPE='That name is not allowed. Pick another.';
 {const c0=window.fwNameCheck;if(typeof c0=='function')window.fwNameCheck=(k,v)=>window.fwProfane(v,true)?NOPE:c0(k,v)}
 {const s0=window.fwNameSafe;if(typeof s0=='function')window.fwNameSafe=a=>{const r=s0(a);return window.fwProfane(r,true)?'Player':r}}
 {const d0=window.fwDisplayName;if(typeof d0=='function')window.fwDisplayName=function(){const r=d0.apply(this,arguments);return window.fwProfane(r,true)?'':r}}
 const wrapName=n=>{const f=window[n];if(typeof f!='function'||f.__pf)return;const g=function(){const a=[...document.querySelectorAll('input')].find(i=>/^(frh|onbu|onbd|mpyn|fra)$/.test(i.id)&&i.value&&window.fwProfane(i.value,true));
  if(a){try{snd('err')}catch(e){}try{say(NOPE)}catch(e){}a.value='';return}return f.apply(this,arguments)};g.__pf=1;window[n]=g};
 const hook=()=>{['frClaim','frAdd','mpSay'].forEach(wrapName)};hook();setInterval(hook,1500);

 /* ---- text boxes: bad words are starred out as you type or paste ---- */
 const SKIP=/^(password|number|range|checkbox|radio|color|file|hidden)$/;
 addEventListener('input',e=>{const el=e.target;if(!el||!/^(INPUT|TEXTAREA)$/.test(el.tagName)||SKIP.test(el.type||'')||el.closest&&el.closest('#fwdevp,.devp'))return;
  const v=el.value;if(!v)return;const c=clean(v);if(c!==v){let p=null;try{p=el.selectionStart}catch(x){}el.value=c;try{if(p!=null)el.setSelectionRange(p,p)}catch(x){}try{snd('err')}catch(x){}}},true);

 /* ---- everything that shows up on the page is cleaned: NPC messages, other players' names and chat, toasts ---- */
 const q=new Set();let qt=0;
 function cleanNode(n){if(n.nodeType===3){const p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.nodeName))return;const v=n.nodeValue;if(p.closest&&p.closest(NPCB)&&badText(v,false)){n.nodeValue=fall();return}const c=clean(v);if(c!==v)n.nodeValue=c;return}
  if(n.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT|CANVAS)$/.test(n.nodeName))return;
  if(n.nodeName==='INPUT'){if(n.value&&!SKIP.test(n.type||'')){const c=clean(n.value);if(c!==n.value)n.value=c}return}
  const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);let t;while(t=w.nextNode())cleanNode(t)}
 function flush(){qt=0;const a=[...q];q.clear();a.forEach(n=>{try{if(n.isConnected!==false)cleanNode(n)}catch(e){}})}
 function sched(n){q.add(n);if(!qt)qt=setTimeout(flush,0)}
 function watch(){if(!document.body)return setTimeout(watch,100);
  new MutationObserver(l=>{for(const m of l){if(m.type==='characterData')sched(m.target);else m.addedNodes.forEach(sched)}}).observe(document.body,{childList:true,subtree:true,characterData:true});
  cleanNode(document.body)}
 watch();

 /* ---- NPC messages: scrubbed in the data itself, so a baited NPC reply is never stored or replayed ---- */
 function scrub(){try{if(typeof S=='undefined'||!S||!Array.isArray(S.msgs))return;
  for(const m of S.msgs){if(!m)continue;
   if(typeof m.body=='string'&&m.a!==undefined&&badText(m.body,false))m.body=fall();
   else if(typeof m.body=='string'){const c=clean(m.body);if(c!==m.body)m.body=c}
   if(typeof m.sub=='string'){const c=clean(m.sub);if(c!==m.sub)m.sub=c}
   if(Array.isArray(m.log))for(const e of m.log){if(!e||typeof e.t!='string')continue;
    if(e.f==='a'){if(badText(e.t,false))e.t=fall()}else{const c=clean(e.t);if(c!==e.t)e.t=c}}}}catch(e){}}
 {const wrapR=()=>{const r=window.reply;if(typeof r!='function'||r.__pf)return;const g=function(m,t){const out=r.apply(this,arguments);scrub();return out};g.__pf=1;window.reply=g;try{reply=g}catch(e){}};wrapR();setInterval(wrapR,1500)}
 setInterval(scrub,500);
 window.FW_PROFANITY=1;
})();
