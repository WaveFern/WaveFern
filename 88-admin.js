/* ---------- v26.90: admin panel ----------
   Shown only to the admin Google account (ADMIN_UID). The button is just the way in: what really protects
   gifts and other players' saves is docs/firestore.rules, which only lets this UID create gifts or read every save.
   "My game" edits only the admin's own save on this device (then saves it to the cloud). */
const ADMIN_UID='wE6oPZIHYifrqBFxzpPse6ripGY2';
const isAdmin=()=>!!(FBU&&FBU.uid==ADMIN_UID);
const ADM={from:'admin',players:null,gifts:null,msg:''};
const admGame=()=>mode=='title'?!!TT.game:true;
function admOpen(){if(!isAdmin())return;snd('click');ADM.from=mode=='title'?'title':'pause';admUI()}
function admBack(){snd('click');if(ADM.from=='title'){mode='title';titleUI()}else{mode='pause';pauseUI()}}
function admDone(t){refreshHud();autoSave();csPush(1);say('🛠 '+t);admUI()}
function refreshHud(){try{buildStudio();refresh();parkCars();syncF();buildLots();syncArt()}catch(e){}}
const admV=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
/* own-game actions */
const ADMA={
 money:()=>{S.money=gNum(admV('am'));return'Money set'},
 addmoney:()=>{S.money=+(S.money+gNum(admV('am'))).toFixed(2);return'Money added'},
 energy:()=>{S.energy=100;S.stam=100;return'Energy refilled'},
 listeners:()=>giftApply({listeners:admV('al')})&&'Monthly listeners added',
 streams:()=>giftApply({streams:admV('as')})&&'Streams added',
 followers:()=>{S.followers=(S.followers||0)+gNum(admV('af'));S.igF=(S.igF||0)+gNum(admV('af'));return'Followers added'},
 day:()=>{const d=Math.max(1,Math.min(100000,gNum(admV('ad'))||1));S.day=d;return'Day set to '+d},
 morning:()=>{S.t=0;return'Time set to morning'},
 evening:()=>{S.t=480;return'Time set to evening'},
 sleep:()=>{admClose();sleepNow(1);return null},
 hype:()=>{Object.keys(S.hype||{}).forEach(g=>S.hype[g]=1.3);return'Every genre is trending'},
 gear:()=>{Object.keys(GEAR).forEach(k=>S.gear[k]=3);return'All gear maxed'},
 apps:()=>{Object.keys(APPD).forEach(k=>S.apps[k]=1);return'All apps unlocked'},
 furniture:()=>{Object.keys(F).forEach(k=>S.inv[k]=(S.inv[k]||0)+3);return'3 of every furniture item added'},
 cars:()=>{S.cars=CARS.map((c,i)=>i);S.garage=Math.max(S.garage||0,1);return'Every car added'},
 pets:()=>{S.pets=[0,1,2];return'Every pet added'},
 clothes:()=>{S.wr=GAR.map(g=>g.id);return'Every piece of clothing added'},
 home:()=>{S.home=3;S.guards=3;S.bling=4;return'Best home, guards and bling'},
 contacts:()=>{ART.forEach((a,i)=>{if(!S.msgs.some(m=>m.a===i))newConv(i,1)});return'Every artist added to Messages'},
 tutoff:()=>{S.tut={on:0,i:0,f:{}};return'Tutorial turned off'},
 all:()=>{admClose();cheat();autoSave();csPush(1);return null}
};
function admClose(){if(ADM.from=='title')ttPlay();else resumeGame()}
function adm(k){if(!isAdmin()||!admGame())return;try{const r=ADMA[k]();if(r)admDone(r)}catch(e){console.error(e);say('That did not work.')}}
/* gifts and players (Firestore; the rules refuse these for anyone but the admin) */
function admSend(){if(!isAdmin()||!FBF)return;const to=admV('gu'),k=admV('gk'),amt=gNum(admV('ga'));ADM.gk=k;
 /* one gift = one kind: money OR streams OR monthly listeners */
 const g={to,from:admV('gf').slice(0,40)||'WaveFern',msg:admV('gm').slice(0,200),money:k=='money'?amt:0,streams:k=='streams'?amt:0,listeners:k=='listeners'?amt:0,t:Date.now(),claimed:false};
 if(!/^[A-Za-z0-9]{10,128}$/.test(to)){ADM.msg='Paste a valid user ID first.';return admUI()}
 if(!amt){ADM.msg='Enter an amount.';return admUI()}
 ADM.msg='Sending…';admUI();FBF.addDoc(FBF.collection(FBD,'gifts'),g).then(()=>{snd('chime');ADM.msg='✓ Gift sent. They get it next time they play.';ADM.gifts=null;admUI();admGifts()},e=>{ADM.msg=e&&e.code=='permission-denied'?'Not allowed: publish the new Firestore rules first.':'Could not send the gift. Try again.';admUI()})}
function admPlayers(){if(!isAdmin()||!FBF)return;ADM.players='…';admUI();
 FBF.getDocs(FBF.query(FBF.collection(FBD,'saves'),FBF.orderBy('t','desc'),FBF.limit(100))).then(r=>{ADM.players=r.docs.map(d=>({uid:d.id,artist:d.data().artist,day:d.data().day,t:d.data().t}));admUI()},e=>{ADM.players=e&&e.code=='permission-denied'?'Not allowed: publish the new Firestore rules first.':'Could not load players.';admUI()})}
function admGifts(){if(!isAdmin()||!FBF)return;
 FBF.getDocs(FBF.query(FBF.collection(FBD,'gifts'),FBF.orderBy('t','desc'),FBF.limit(30))).then(r=>{ADM.gifts=r.docs.map(d=>({id:d.id,...d.data()}));admUI()},()=>{ADM.gifts='Could not load sent gifts.';admUI()})}
function admPick(uid){const e=document.getElementById('gu');if(e){e.value=uid;e.focus();e.scrollIntoView({block:'center'})}}
function admDel(id){if(!isAdmin()||!confirm('Delete this gift? If it has not been claimed yet, the player will not get it.'))return;FBF.deleteDoc(FBF.doc(FBD,'gifts',id)).then(()=>{ADM.gifts=null;admGifts()},()=>say('Could not delete it.'))}
function admUI(){if(!isAdmin())return;mode=ADM.from=='title'?'title':'pause';const B=(k,t)=>`<button onclick="adm('${k}')">${t}</button>`,n=v=>(+v||0).toLocaleString();
 const own=admGame()?`<h3>My game</h3><p class=m><small>Day ${S.day} · $${n(S.money)} · ${n(S.listeners)} monthly listeners · ${n(S.streams)} streams</small></p>
  <div class=r><input id=am type=number min=0 placeholder="Money"><button onclick="adm('addmoney')">Add</button><button onclick="adm('money')">Set</button></div>
  <div class=r><input id=al type=number min=0 placeholder="Monthly listeners"><button onclick="adm('listeners')">Add</button></div>
  <div class=r><input id=as type=number min=0 placeholder="Streams"><button onclick="adm('streams')">Add</button></div>
  <div class=r><input id=af type=number min=0 placeholder="Followers"><button onclick="adm('followers')">Add</button></div>
  <div class=r><input id=ad type=number min=1 placeholder="Day"><button onclick="adm('day')">Set day</button></div>
  <div class=admg>${B('energy','⚡ Full energy')}${B('morning','🌅 Morning')}${B('evening','🌇 Evening')}${B('sleep','💤 Skip to next day')}${B('hype','🔥 All genres trending')}${B('gear','🎛 Max gear')}${B('apps','💻 All apps')}${B('furniture','🛋 All furniture')}${B('cars','🚗 All cars')}${B('pets','🐾 All pets')}${B('clothes','👕 All clothes')}${B('home','🏠 Best home')}${B('contacts','💬 All contacts')}${B('tutoff','🎓 Tutorial off')}<button class=go onclick="adm('all')">⭐ Unlock everything</button></div>`:`<p class=m><small>Start or load a game to use the My game options.</small></p>`;
 const pl=ADM.players==null?`<button onclick="admPlayers()">Load players</button>`:typeof ADM.players=='string'?`<p class=m><small>${esc(ADM.players)}</small></p>`:`<div class=adml>${ADM.players.map(p=>`<div><span><b>${esc(p.artist||'(no name)')}</b> · Day ${n(p.day)}<br><small class=m>${esc(p.uid)}</small></span><button onclick="admPick('${esc(p.uid)}')">Gift</button></div>`).join('')||'<small class=m>No saves yet.</small>'}</div>`;
 const gl=ADM.gifts==null?'':typeof ADM.gifts=='string'?`<p class=m><small>${esc(ADM.gifts)}</small></p>`:`<div class=adml>${ADM.gifts.map(g=>`<div><span>${g.claimed?'✓ claimed':'⏳ waiting'} · ${esc(g.from)} → <small class=m>${esc(g.to)}</small><br><small>${[g.money?'$'+n(g.money):'',g.streams?n(g.streams)+' streams':'',g.listeners?n(g.listeners)+' listeners':''].filter(Boolean).join(' · ')}</small></span>${g.claimed?'':`<button onclick="admDel('${esc(g.id)}')">Delete</button>`}</div>`).join('')||'<small class=m>No gifts sent yet.</small>'}</div>`;
 $('ui').innerHTML=`<div id=admp class="box modal"><div class=wrh><h2>🛠 Admin</h2><button onclick="admBack()" style="margin-left:auto">Back</button></div>${own}
  <h3>Send a gift</h3><input id=gu placeholder="User ID (from the Players list, or Firebase > Authentication > Users)">
  <div class=r><select id=gk>${[['money','💵 Money'],['streams','▶ Streams'],['listeners','🎧 Monthly listeners']].map(([v,t])=>`<option value=${v} ${(ADM.gk||'money')==v?'selected':''}>${t}</option>`).join('')}</select><input id=ga type=number min=1 placeholder="Amount"></div>
  <div class=r><input id=gf maxlength=40 placeholder="From (name shown in the popup)"></div><input id=gm maxlength=200 placeholder="Message (optional)">
  <button class=go onclick="admSend()" style="width:100%;margin-top:6px">🎁 Send gift</button>${ADM.msg?`<p class=m><small>${esc(ADM.msg)}</small></p>`:''}
  <h3>Players</h3>${pl}<h3>Sent gifts</h3>${gl}</div>`;
 if(ADM.gifts==null)admGifts()}
/* the way in: pause menu and main menu, admin account only */
{const p0=pauseUI;pauseUI=function(){p0();const m=$('pzm');if(!m||!isAdmin())return;const b=document.createElement('button');b.textContent='Admin';b.onclick=admOpen;m.appendChild(b)}
 const t0=titleUI;titleUI=function(){t0();if(!isAdmin())return;const m=document.querySelector('#ttl .ttm');if(!m)return;const b=document.createElement('button');b.textContent='Admin';b.onclick=admOpen;m.appendChild(b)}}
