/* ---------- v26.119: Google Analytics (Firebase Analytics) ----------
   Uses the measurementId in FB_CFG (86-google-signin.js). If it is missing or a PASTE_ placeholder, nothing loads.
   Events carry no personal data: no names, emails, save codes or account ids, only counts like the in-game day.
   Players can turn it off in Settings > Game (kept in localStorage key fw_an, so it applies to every career on this device). */
const AN={on:(()=>{try{return localStorage.getItem('fw_an')!=='0'}catch(e){return true}})(),mod:null,an:null,q:[],loading:0};
const AN_OK=typeof FB_CFG!='undefined'&&!!FB_CFG.measurementId&&!/^PASTE_/.test(FB_CFG.measurementId)&&!/^PASTE_/.test(FB_CFG.apiKey);
function anLoad(){if(!AN_OK||!AN.on||AN.an||AN.loading)return;AN.loading=1;const u='https://www.gstatic.com/firebasejs/'+FB_V+'/firebase-';
 Promise.all([import(u+'app.js'),import(u+'analytics.js')]).then(([a,m])=>{const app=a.getApps().length?a.getApp():a.initializeApp(FB_CFG);AN.mod=m;AN.an=m.getAnalytics(app);m.setAnalyticsCollectionEnabled(AN.on);
  const q=AN.q;AN.q=[];if(AN.on)q.forEach(e=>m.logEvent(AN.an,e[0],e[1]))}).catch(()=>{}).finally(()=>{AN.loading=0})}
function anLog(name,p){if(!AN_OK||!AN.on)return;try{p=Object.assign({game_version:typeof GAME_VERSION!='undefined'?GAME_VERSION:'',day:typeof S!='undefined'&&S&&S.day||0},p);
 if(AN.an)AN.mod.logEvent(AN.an,name,p);else{AN.q.push([name,p]);anLoad()}}catch(e){}}
function anSet(on){AN.on=!!on;try{localStorage.setItem('fw_an',on?'1':'0')}catch(e){}
 if(AN.mod&&AN.an)AN.mod.setAnalyticsCollectionEnabled(AN.on);if(on){anLoad()}else AN.q=[]}
/* settings toggle, under Settings > Game */
if(AN_OK&&typeof stBody=='function'){const sb0=stBody;stBody=function(){const h=sb0.apply(this,arguments);if(STAB!='game')return h;
 return stTog('Analytics',AN.on,"anSet(!AN.on)",'Anonymous usage stats (no personal data)')+h}}
/* key game events */
function anWrap(n,f){if(typeof window[n]!='function')return;const o=window[n];window[n]=function(){const r=o.apply(this,arguments);try{f(r)}catch(e){}return r}}
function anWrapCount(n,arr,ev,p){if(typeof window[n]!='function')return;const o=window[n];window[n]=function(){const k=(S[arr]||[]).length,r=o.apply(this,arguments);try{if((S[arr]||[]).length>k)anLog(ev,p&&p())}catch(e){}return r}}
anWrap('confirmChar',()=>anLog('new_career'));
anWrapCount('mgFinish','drafts','song_recorded');
anWrapCount('upl','songs','song_released',()=>({songs:S.songs.length}));
anWrapCount('mkAlbum','albums','album_released',()=>({albums:S.albums.length}));
if(typeof lbSign=='function'){const o=lbSign;lbSign=function(){const had=!!S.label,r=o.apply(this,arguments);try{if(!had&&S.label)anLog('label_signed')}catch(e){}return r}}
if(typeof wakeUp=='function'){const o=wakeUp;wakeUp=function(){const r=o.apply(this,arguments);try{if([7,30,100,365,1000].includes(S.day))anLog('day_milestone',{milestone:S.day})}catch(e){}return r}}
/* one-time notice */
function anNotice(){let seen=0;try{seen=localStorage.getItem('fw_an_seen')}catch(e){}if(seen||!AN_OK)return;
 const d=document.createElement('div');d.id='annote';d.style.cssText='position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:9999;max-width:min(440px,92vw);background:#14121a;color:#fff;border:2px solid #444;padding:10px 12px;font-size:12px;line-height:1.4';
 d.innerHTML='WaveFern uses Google Analytics to count visits and key game events (like starting a career). No personal data is collected. You can turn it off any time in Settings &gt; Game.<div style="margin-top:8px;display:flex;gap:8px"><button id=anok>OK</button><button id=anoff>Turn off</button></div>';
 const done=()=>{try{localStorage.setItem('fw_an_seen','1')}catch(e){}d.remove()};
 document.body.appendChild(d);d.querySelector('#anok').onclick=done;d.querySelector('#anoff').onclick=()=>{anSet(false);done()}}
addEventListener('load',()=>{setTimeout(()=>{anNotice();if(AN.on){anLoad();anLog('game_start')}},1500)});
