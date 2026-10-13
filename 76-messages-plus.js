/* ===== v26.50: Messages upgrades =====
   - pin chats (pinned ones sit at the top), clear chats, search by name or message text
   - Big Vee (the guide) is pinned by default, can be texted for help and can be unpinned or cleared
   - the dot on a profile picture only shows while a chat has unread messages
   Saves: m.pin, m.hid and S.vee are optional fields, so older saves load unchanged. */
let MSQ='',MSCF=0;
const msVis=()=>S.msgs.filter(m=>!m.hid);
function msMatch(m,q){if(!q)return true;if(cname(m).toLowerCase().includes(q))return true;return Array.isArray(m.log)&&m.log.some(x=>String(x.t).toLowerCase().includes(q))||(m.a===undefined&&!m.g&&String(m.body||'').toLowerCase().includes(q))}
function msSearch(v){MSQ=String(v||'');pcR();const i=$('msq');if(i){i.focus();const n=i.value.length;try{i.setSelectionRange(n,n)}catch(e){}}}
function msPin(id){const m=S.msgs.find(x=>x.id==id);if(!m)return;m.pin=m.pin?0:1;snd('pop');say(m.pin?cname(m)+' pinned to the top.':cname(m)+' unpinned.');pcR()}
function msClearAsk(id){const m=S.msgs.find(x=>x.id==id);if(!m)return;if(m.a!==undefined&&m.state==1){snd('err');return say('You have a collab booked with '+cname(m)+'. Cancel it before clearing the chat.')}MSCF=id;pcR()}
function msClearGo(id){const m=S.msgs.find(x=>x.id==id);MSCF=0;if(!m)return pcR();
 if(m.a!==undefined&&m.state==1){snd('err');pcR();return say('You have a collab booked with '+cname(m)+'. Cancel it before clearing the chat.')}
 const nm=cname(m);
 if(m.blocked){m.hid=1;m.unread=0;m.pin=0}/* a blocked chat is only hidden, so that artist stays blocked */
 else S.msgs.splice(S.msgs.indexOf(m),1);
 if(S.chat==id){const v=msVis();S.chat=v.length?msgSorted().filter(x=>!x.hid).pop().id:0}
 snd('pop');say('Chat with '+nm+' cleared.');pcR()}
{const oc=openChat;openChat=function(id){MSCF=0;const m=S.msgs.find(x=>x.id==id);if(!m)return pcR();oc(id)}}
{const sc=startChat;startChat=function(i){MSQ='';MSCF=0;return sc(i)}}
/* ----- Big Vee, the guide: pinned by default, can be texted for help ----- */
const VEE_TOPICS=[
 ['Controls',/control|move|walk|sprint|run|key|button|interact|how do i (play|start)/,'WASD to walk, Shift to sprint, E to use whatever you are standing at (laptop, mic, bed, wardrobe, doors). Esc opens the pause menu. N opens the map.'],
 ['Make a track',/record|studio|mic\b|track|song|genre|mini ?game|beat|make (music|a song)|first song/,'The studio is in your house. Press E at the mic, pick a genre, then beat four quick mini games. A session costs 15 energy. Good gear and good scores make a better song.'],
 ['Upload & money',/upload|stream|earn|money|cash|paid|income|broke|rich|spotifly|release|drop it/,'Laptop, then Spotifly, then Upload to release a draft. Every night each song earns $'+PAY_RATE.toFixed(2)+' a stream, paid when you wake up. More listeners means more fame, so keep dropping.'],
 ['Collabs',/collab|feature|feat|dm|artist|fee|haggle|negoti|price|book|date|meet|beacon|schedule/,'If THEY ask, they pay YOU. If YOU ask, you pay their fee. Haggle in plain words like "how about 150". Once you agree on a price, press Confirm and pay in the chat. The session starts right away: walk up to them at the gold beacon.'],
 ['Using Messages',/pin|clear|delete|search|suggest|new chat|unpin|messages/,'Press New to see suggested people, they are not new DMs. Open a chat and use Pin to keep it on top or Clear chat to delete it. A cleared chat only comes back if that artist messages you again. The search box finds chats by name or message text.'],
 ['Gear',/gear|equipment|headphone|upgrade|mixer|speaker|rig/,'Gearshop on the laptop. Better gear means better mixes and more streams. Start cheap, like Headphones.'],
 ['Clothes',/cloth|drip|outfit|wear|wardrobe|threadz|shoe|hat|hair/,'Browser, then Clothes (Threadz) to buy pieces. Put them on at the Wardrobe in your bedroom (E).'],
 ['Sleep & energy',/sleep|energy|tired|bed|night|day|pass(ed)? out|time/,'A day is 12 minutes: 6 light, 6 dark. Recording eats energy. Go to bed (E) and your streams pay out when you wake. Stay up past 02:00 and you pass out.'],
 ['Map & cars',/map|travel|city|drive|car|motors|taxi|zoom|where/,'Press N for the map, scroll or +/- to zoom. The city is way east: walk, drive, or grab a Taxi from the map. Motors sells cars: press E by one to drive, W goes, S brakes.'],
 ['Festivals',/festival|gig|stage|fields|perform|book a/,'FestivalApp on the laptop. Park Fields Festival runs every 7th day. Book 2+ days ahead; the smallest stage wants Fame Level 10. Booked sets are listed in FestivalApp.'],
 ['Fame',/fame|level|listener|follower|famous|popular/,'Fame Level climbs with monthly listeners and unlocks gear, homes and festival stages.'],
 ['Saving',/sav(e|ing)|load|backup|code|progress|lost/,'The game autosaves in your browser. For a backup: Esc, Settings, Get save code. Paste it into any browser to carry on.']
];
const VEE_MENU='Ask me about: '+VEE_TOPICS.map(t=>t[0]).join(', ')+'. Tap one below or type a question.';
const VEE_HI=['Yo! Big Vee here. '+VEE_MENU,'Sup, rising star. '+VEE_MENU];
function guideReply(t){const n=String(t).toLowerCase();
 if(/^\s*(hi|hello|hey|yo|sup|wassup|what'?s up)\b/.test(n)&&n.length<24)return pick(VEE_HI);
 if(/thank|thx|cheers|appreciate/.test(n))return pick(['Anytime. That is what managers are for.','Easy. Now go make noise.']);
 if(/\b(menu|help|topics|options|what can you|list)\b/.test(n))return VEE_MENU;
 for(const[,rx,r]of VEE_TOPICS)if(rx.test(n))return r;
 return 'Hm, not sure about that one. '+VEE_MENU}
function guideSend(t){const m=S.msgs.find(x=>x.id==S.chat);if(!m||!m.g||TY)return;const i=$('cin');t=String(t==null?(i?i.value:''):t).trim();if(!t)return;
 m.log.push({f:'me',t,d:S.day});if(i)i.value='';TY=m.id;snd('pop');pcR();
 setTimeout(()=>{TY=0;m.log.push({f:'a',t:guideReply(t),d:S.day});m.body=m.log[m.log.length-1].t;if(app=='msg'&&mode=='pc'&&S.chat==m.id){snd('ping');pcR()}else m.unread=1},500+RI(0,500))}
const guideAsk=i=>guideSend(VEE_TOPICS[i][0]);
{const sm=sendMsg;sendMsg=function(){const m=S.msgs.find(x=>x.id==S.chat);if(m&&m.g)return guideSend();return sm.apply(this,arguments)}}
/* the guide is in Messages from the start, pinned. Old saves that already have him get him pinned once. */
function ensureGuide(){if(S.vee||!Array.isArray(S.msgs))return;S.vee=1;let m=S.msgs.find(x=>x.g);
 if(m){m.pin=1;return}
 m={id:S.nid++,from:VEE,body:'',state:9,g:1,pin:1,log:[],unread:0};m.log.push({f:'a',t:'Yo, it is Big Vee. Stuck on something? Text me any time. '+VEE_MENU,d:S.day});m.body=m.log[0].t;S.msgs.push(m)}
{const pm=PA.msg;PA.msg=function(){ensureGuide();return pm.apply(this,arguments)}}
