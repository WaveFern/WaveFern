/* WaveFern dev: strict profanity and slur filter. Add ?noprofanity to the address to skip it.
   v55.52.x: ONLY text that goes public is filtered (usernames, display and artist names, bios, song and album titles, band and
   room names, room chat, friends, leaderboard, public profiles). What the player types privately (chatting to NPCs and
   artists, Vee, notes, searches) and what NPCs say back is never touched. Public places are listed in PUBIN (inputs) and PUB (screens).
   - window.fwProfane(text, asName) -> true if the text holds a swear or slur. Catches number swaps (sh1t), symbol swaps (a$$, sh!t),
     letter swaps (fvck, phuck, kunt), stretched letters (shiiit), spaced out letters (f u c k, f.u.c.k) and starred ones (f*ck).
   - window.fwClean(text) -> the text with each bad word turned into stars.
   - Public text boxes mask bad words as you type, names are refused, and public screens mask text the moment it shows up. */
(function(){
 if(!window.FW_FEAT||/[?&]noprofanity/.test(location.search))return;
 /* public text boxes (by id) and by what their handler writes (song and album titles) */
 const PUBIN=/^(onbu|onbd|frh|fra|mpyn|mpbn|mpst|mpci|pf-bio|pf-user|an|sfsetn|tin)$/;
 const PUBH=/dTitle\(|saveT\(|AL\.name|S\.drafts/;
 const isPubIn=el=>PUBIN.test(el.id||'')||PUBH.test((el.getAttribute('oninput')||'')+(el.getAttribute('onkeydown')||''));
 /* public screens: room chat and band bar, friends, public profile, leaderboard */
 const PUB='#mpc,#mpb,#mpfr,#frinv,#fhub,#pfx,#pubpf,#lbd,.mpig';
 const LEET={'0':'o','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a','$':'s','!':'i','|':'i','+':'t','(':'c','€':'e','¢':'c','£':'l'};
 /* Matching is whole-word. Short or ambiguous words (ass, cock, tit, cum, dam...) only match as the whole word, never inside another word.
    Only long, unmistakable swears are also found inside longer text (usernames like xxfuckxx). */
 /* letter swaps: ph=f, ck=k, c/q=k, v=u (no squashing, so ass is not as, cook is not cock, boob is not bob) */
 const skel=s=>s.replace(/ck/g,'k').replace(/ph/g,'f').replace(/[cq]/g,'k').replace(/v/g,'u');
 /* a term as a pattern: a double letter must stay double (ass), a single letter is one letter or stretched to 3+ (fuuuck, shhhit) */
 const pat=t=>{const x=skel(t);let o='';for(let i=0;i<x.length;){let j=i;while(j<x.length&&x[j]===x[i])j++;const n=j-i,L=x[i];o+=n>=2?L+'{'+n+',}':'(?:'+L+'|'+L+'{3,})';i=j}return o};
 const mk=a=>a.map(pat);
 /* strong swears: found anywhere inside a word (usernames, glued words) */
 const ROOTS=mk(['fuck','shit','cunt','faggot','bitch','biatch','whore','retard','bastard','asshole','arsehole','dickhead','cocksuck','motherf','pussy','slut','bollock','rapist','jizz','dildo','blowjob','handjob','cumshot','goddam','jerkoff','piss','tranny','shemale','wetback','beaner','towelhead','raghead','mongoloid','dipshit','dumbass','jackass','fatass']).map(p=>new RegExp(p));
 /* only when the whole word is exactly this */
 const WORDS=mk(['ass','asses','arse','arses','dick','dicks','cock','cocks','prick','pricks','tit','tits','titty','titties','boob','boobs','turd','cums','cumming','anal','penis','vagina','fag','fags','fagot','spic','spick','chink','gook','kike','coon','paki','negro','negroes','jap','spaz','rape','raped','raping','rapes','hitler','heil','kys','mfer','mfers','thot','pedo','pedophile','molest','whore','slag','skank','tosser','bellend','minge','clit','scrotum','sluts','bitches','bitchy','biches','nazi','nazis','neonazi','wank','wanker','wankers','bugger','porn','porno','cracka','twat','twats','badass','smartass','douche','douchebag','hore']).map(p=>new RegExp('^'+p+'$'));
 /* a bad word as the start or end of a username: bigdick, dickboy */
 const NAMEEND=(mk(['penis','vagina','cunt','whore']).map(p=>new RegExp('^'+p+'|'+p+'$')));
 /* letters left out: f*ck, sh*t, b*tch, n*gger */
 const SHORT=(['fck','fkn','fckn','fcking','fking','fkin','fckin','fcker','fckr','sht','shtty','shyt','shyte','btch','btches','dck','ngga','nggr','ngger','nggers','nigr','pssy','mthrfckr','mthrfkr','mtherfkr','fuk','fuks','fuking','fukin','phuk','azz','azzhole']).map(p=>new RegExp('^'+p.replace(/(.)/g,'$1+')+'$'));
 /* normal words that contain a bad one: removed before the strong-swear search and before the username start/end search */
 const OK=['shitake','shiitake','mishit','mishits','mishitting','scunthorpe','snigger','niggle','niggling','retardant','retardants','classic','assassin','assassinate','assess','assist','assistant','assume','assure','assign','assault','associate','assembly','asset','passage','massage','bass','class','glass','grass','brass','mass','pass','compass','harass','embarrass','cassette','potassium','titan','title','titanic','constitution','cockpit','cocktail','peacock','shuttlecock','hancock','cockney','cockatoo','cockroach','cockerel','dickens','dickinson','dickson','cumber','cucumber','document','accumulate','pissarro','analysis','analyst','analog','analyze','analyse','analytic','analytics','canal','banal','penistone','sextant','therapist','grape','drape','scrape','parapet','kunta','fukushima','fukuoka','fukui','rapeseed','swank','nazir','document','documents'].map(skel);
 const OKRE=new RegExp(OK.filter((w,i,a)=>a.indexOf(w)===i).sort((a,b)=>b.length-a.length).join('|'),'g');
 const strip=s=>String(s==null?'':s).normalize('NFKD').replace(/[̀-ͯ​-‏⁠﻿­]/g,'').toLowerCase()
  .replace(/[а]/g,'a').replace(/[е]/g,'e').replace(/[о]/g,'o').replace(/[р]/g,'p').replace(/[с]/g,'c').replace(/[х]/g,'x').replace(/[і]/g,'i');
 const LEETRE=/[03478@$!|+(€¢£]|5/g;
 /* 1 can be i or l, so check both. Edge punctuation (ass! "ass") is dropped first so it is not read as a letter. */
 const variants=t=>{t=t.replace(/^[^a-z0-9@$]+|[^a-z0-9$]+$/g,'');const a=t.replace(LEETRE,c=>LEET[c]||c);return[a.replace(/1/g,'i'),a.replace(/1/g,'l')].map(v=>v.replace(/[^a-z]/g,''))};
 /* v55.21.8: results are remembered per word and per text. The same words come up again and again (message logs, HUD text),
    and each fresh check runs ~150 patterns, so re-checking them was freezing the game every 0.5 s on long-played saves. */
 const memo=(f,cap)=>{let M=new Map();return(t,x)=>{if(typeof t!='string'||t.length>2000)return f(t,x);const k=(x?'1':'0')+t;let r=M.get(k);if(r===undefined){r=f(t,x);if(M.size>cap)M=new Map();M.set(k,r)}return r}};
 /* one word (no spaces) */
 function badWord0(w,asName){
  for(const v of variants(strip(w))){if(!v)continue;const k=skel(v);
   if(WORDS.some(r=>r.test(k))||SHORT.some(r=>r.test(v)))return true;
   if(/nigg|nigha|nigah/.test(v.replace(/snigger\w*|niggl\w*|nigger?ly/g,'')))return true;
   const k2=k.replace(OKRE,'#');
   if(ROOTS.some(r=>r.test(k2)))return true;
   if(asName){const k3=k2.replace(/^x+|x+$/g,'');if(WORDS.some(r=>r.test(k3))||/(dicks?|boobs|titty)$/.test(v)||NAMEEND.some(r=>r.test(k3)))return true}}
  return false}
 /* a whole text: each word, and runs of single letters read together (f u c k) */
 const badWord=memo(badWord0,20000);
 function badText0(t,asName){
  t=String(t==null?'':t);if(!t.trim())return false;
  const toks=strip(t).split(/\s+/).filter(Boolean);
  if(toks.some(x=>badWord(x,asName))||(asName&&badWord(t.replace(/\s+/g,''),true)))return true;
  /* tokens joined by dots, dashes, underscores or slashes: f.u.c.k, s-h-i-t, f_u_c_k */
  for(const x of toks){const p=x.split(/[.\-_\/\\,*~^]+/).filter(Boolean);if(p.length>1){if(p.some(y=>badWord(y,asName)))return true;if(p.every(y=>y.length<=2)&&badWord(p.join(''),true))return true}}
  for(let i=0;i<toks.length;i++){let j=i,s='';while(j<toks.length&&toks[j].replace(/[^a-z0-9]/g,'').length<=1&&s.length<14){s+=toks[j].replace(/[^a-z0-9]/g,'');j++}
   if(s.length>=3&&/[a-z]/.test(s)&&badWord(s,true))return true}
  return false}
 const badText=memo((t,x)=>badText0(t,x),4000);
 window.fwProfane=(t,asName)=>{try{return badText(t,!!asName)}catch(e){return false}};
 function clean0(t){
  t=String(t==null?'':t);if(!t||!/[A-Za-z0-9@$!|+(À-￿]/.test(t)||!badText(t,false))return t;
  const parts=t.split(/(\s+)/);
  /* single letters in a row */
  for(let i=0;i<parts.length;i+=2){let j=i,s='',n=0;while(j<parts.length&&parts[j].replace(/[^A-Za-z0-9]/g,'').length<=1&&parts[j]!==''&&n<14){s+=parts[j].replace(/[^A-Za-z0-9]/g,'');j+=2;n++}
   if(n>=3&&badWord(s,true)){for(let q=i;q<j;q+=2)parts[q]=parts[q].replace(/[A-Za-z0-9]/g,'*');i=j-2}}
  for(let i=0;i<parts.length;i+=2){const w=parts[i];if(!w)continue;
   const m=w.match(/^([^A-Za-z0-9@$!|+(]*)(.*?)([^A-Za-z0-9@$!|+()]*)$/);const core=m?m[2]:w;
   if(core&&(badText(core,false)||badWord(core.replace(/[.\-_\/\\,~^]+/g,''),false))){parts[i]=(m?m[1]:'')+'*'.repeat(core.length)+(m?m[3]:'')}}
  return parts.join('')}
 const clean=memo(t=>clean0(t),4000);
 window.fwClean=t=>{try{return clean(t)}catch(e){return String(t==null?'':t)}};

 /* ---- names: refuse them outright ---- */
 const NOPE='That name is not allowed. Pick another.';
 {const c0=window.fwNameCheck;if(typeof c0=='function')window.fwNameCheck=(k,v)=>window.fwProfane(v,true)?NOPE:c0(k,v)}
 {const s0=window.fwNameSafe;if(typeof s0=='function')window.fwNameSafe=a=>{const r=s0(a);return window.fwProfane(r,true)?'Player':r}}
 {const d0=window.fwDisplayName;if(typeof d0=='function')window.fwDisplayName=function(){const r=d0.apply(this,arguments);return window.fwProfane(r,true)?'':r}}
 const wrapName=n=>{const f=window[n];if(typeof f!='function'||f.__pf)return;const g=function(){const a=[...document.querySelectorAll('input')].find(i=>/^(frh|onbu|onbd|mpyn|fra)$/.test(i.id)&&i.value&&window.fwProfane(i.value,true));
  if(a){try{snd('err')}catch(e){}try{say(NOPE)}catch(e){}a.value='';return}return f.apply(this,arguments)};g.__pf=1;window[n]=g};
 const hook=()=>{['frClaim','frAdd','mpSay'].forEach(wrapName)};hook();setInterval(hook,1500);

 /* ---- public text boxes only: bad words are starred out as you type or paste ---- */
 const SKIP=/^(password|number|range|checkbox|radio|color|file|hidden)$/;
 addEventListener('input',e=>{const el=e.target;if(!el||!/^(INPUT|TEXTAREA)$/.test(el.tagName)||SKIP.test(el.type||'')||!isPubIn(el)||el.closest&&el.closest('#fwdevp,.devp'))return;
  const v=el.value;if(!v)return;const c=clean(v);if(c!==v){let p=null;try{p=el.selectionStart}catch(x){}el.value=c;try{if(p!=null)el.setSelectionRange(p,p)}catch(x){}try{snd('err')}catch(x){}}},true);

 /* ---- public screens are cleaned as text appears: other players' names, chat, friends, profiles, leaderboard ---- */
 const q=new Set();let qt=0;
 function cleanText(n){const v=n.nodeValue,c=clean(v);if(c!==v)n.nodeValue=c}
 function cleanNode(n){if(n.nodeType===3){const p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.nodeName)||!(p.closest&&p.closest(PUB)))return;cleanText(n);return}
  if(n.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT|CANVAS)$/.test(n.nodeName))return;
  const roots=n.closest(PUB)?[n]:[...n.querySelectorAll(PUB)];
  for(const r of roots){const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let t;while(t=w.nextNode()){const p=t.parentNode;if(p&&!/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.nodeName))cleanText(t)}}}
 function flush(){qt=0;const a=[...q];q.clear();a.forEach(n=>{try{if(n.isConnected!==false)cleanNode(n)}catch(e){}})}
 function sched(n){q.add(n);if(!qt)qt=setTimeout(flush,0)}
 function watch(){if(!document.body)return setTimeout(watch,100);
  new MutationObserver(l=>{for(const m of l){if(m.type==='characterData')sched(m.target);else m.addedNodes.forEach(sched)}}).observe(document.body,{childList:true,subtree:true,characterData:true});
  cleanNode(document.body)}
 watch();

 window.FW_PROFANITY=1;
})();
