/* ===== v26.57: Big Vee understands more =====
   A question is tidied first: lower case, contractions and slang mapped to one word, and a word one letter off a known word
   is corrected ("steram" becomes "stream"). The best matching topic wins, live numbers from your save answer money,
   fame, time, songs and energy questions, and a short follow-up ("why?", "how?") repeats the last answer.
   Nothing here is saved, so old saves work unchanged. */
const VEE_SYN=[[/\b(bucks|dollars|cash|paid|pay|payout|earn|earning|earnings|income|wage)\b/g,'money'],
 [/\b(get rid of|remove|erase|trash|scrap)\b/g,'delete'],
 [/\b(tall|tallness|shorter|taller|hight)\b/g,'height'],
 [/\b(listeners|listens|plays)\b/g,'listener'],
 [/\b(gig|show|concert|performance)\b/g,'festival'],
 [/\b(cars|ride|motor|driving)\b/g,'drive'],
 [/\b(famous|popular|celebrity)\b/g,'fame'],
 [/\bwhats\b/g,'what is'],[/\bim\b/g,'i am'],[/\bdont\b/g,'do not'],[/\bcant\b/g,'cannot'],[/\bu\b/g,'you'],[/\bur\b/g,'your'],[/\bpls\b|\bplz\b/g,'please']];
const VEE_VOCAB=['money','stream','billboard','fame','listener','height','delete','spotifly','amazoom','collab','record','upload','sleep','energy','gear','clothes','drive','festival','save','message','pin','clear','search','artist','level','song','beat','lyrics','mix','price','haggle','camera','wheel','zoom','panic','studio','wardrobe','speed','speedometer','shoes','hair','album','rapper','famous','release','income','balance','tired','passed','profile','mentor'];
function veeLev(a,b){const m=a.length,n=b.length;if(Math.abs(m-n)>2)return 9;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]==b[j-1]?0:1));p=c}return p[n]}
function veeClean(t){let s=' '+String(t).toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9$ ]+/g,' ').replace(/\s+/g,' ')+' ';
 VEE_SYN.forEach(([rx,to])=>{s=s.replace(rx,' '+to+' ')});
 return s.trim().split(' ').filter(Boolean).map(w=>{if(w.length<4||/^\d+$/.test(w)||VEE_VOCAB.includes(w))return w;let best=w,bd=9;for(const v of VEE_VOCAB){const d=veeLev(w,v);if(d<bd){bd=d;best=v}}return bd<=(w.length>=7?2:1)?best:w}).join(' ')}
/* live answers from the current save */
function veeLive(q){
 if(/\b(money|balance)\b/.test(q)&&/\b(how|much|have|got|my|left|what)\b/.test(q))return 'You have '+$$(S.money)+'. Each stream pays $'+PAY_RATE.toFixed(2)+', paid when you wake up.';
 if(/\b(listener|fame|level)\b/.test(q)&&/\b(how|my|many|what|level|am|far)\b/.test(q))return 'You have '+S.listeners.toLocaleString()+' monthly listeners and Fame Level '+fameLevel()+'.';
 if(/\b(what day|which day|what time|time is it|the time)\b/.test(q))return 'It is Day '+S.day+', '+clk()+'.';
 if(/\bhow many\b/.test(q)&&/\bsong/.test(q))return 'You have '+S.songs.length+' released song'+(S.songs.length==1?'':'s')+' and '+S.drafts.length+' draft'+(S.drafts.length==1?'':'s')+' waiting to upload.';
 if(/\b(energy|tired)\b/.test(q)&&/\b(my|how|what|much|left)\b/.test(q))return 'Energy is at '+Math.round(S.energy)+'%. A session costs 15 energy, and sleeping restores it.';
 return null}
/* the topic with the most keyword hits wins; ties go to the topic listed first */
let VEE_LAST='';
function veeTopic(q){let best=null,bs=0;for(const t of VEE_TOPICS){const m=q.match(new RegExp(t[1].source,'g'));const sc=m?m.length:0;if(sc>bs){bs=sc;best=t}}return best}
guideReply=function(t){const q=veeClean(t);
 if(!q)return VEE_MENU;
 if(/^(hi|hello|hey|yo|sup|wassup|what is up)\b/.test(q)&&q.length<24)return pick(VEE_HI);
 if(/\b(thank|thanks|thx|cheers|appreciate)\b/.test(q))return pick(['Anytime. That is what managers are for.','Easy. Now go make noise.']);
 if(/\b(menu|help|topics|options|what can you|list)\b/.test(q))return VEE_MENU;
 const live=veeLive(q);if(live){VEE_LAST=live;return live}
 const top=veeTopic(q);if(top){VEE_LAST=top[2];return top[2]}
 if(VEE_LAST&&q.split(' ').length<=3&&/^(why|how|what|huh|more|explain|and|really|go on)\b/.test(q))return 'Here it is again: '+VEE_LAST;
 return 'Hm, not sure about that one. '+VEE_MENU}
