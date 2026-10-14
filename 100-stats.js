/* ===== v26.108.0: Stats section in the main menu and the pause menu =====
   Lifetime numbers from what the game already keeps (S.day, S.earn, S.streams, S.listeners, S.songs, S.albums).
   Two things are tracked from now on, in S.peakLis and S.peakMoney (old saves start from what they have today). */
function statsData(){const so=S.songs||[],f=n=>Math.round(n||0).toLocaleString(),m=n=>'$'+(+n||0).toLocaleString(undefined,{maximumFractionDigits:2});
 const top=so.slice().sort((a,b)=>(b.streams||0)-(a.streams||0))[0];
 return[['Career',[['Artist',S.artist||'-'],['Days played',f(S.day)],['Money now',m(S.money)],['Most money held',m(Math.max(S.peakMoney||0,S.money))]]],
  ['Music',[['Money earned',m(S.earn)],['Total streams',f(S.streams)],['Monthly listeners',f(S.listeners)],['Peak monthly listeners',f(Math.max(S.peakLis||0,S.listeners))],['Followers',f(S.followers)]]],
  ['Releases',[['Songs released',f(so.length)],['Hits',f(so.filter(x=>x.lk=='h').length)],['Viral songs',f(so.filter(x=>x.lk=='v').length)],['Albums',f((S.albums||[]).length)],['Best song',top?top.title+' ('+f(top.streams)+')':'-']]]]}
function statsTrack(){try{if(typeof TT!='undefined'&&TT.on&&!TT.game)return;S.peakLis=Math.max(S.peakLis||0,S.listeners||0);S.peakMoney=Math.max(S.peakMoney||0,S.money||0)}catch(e){}}
setInterval(statsTrack,3000);
function statsOpen(){statsTrack();STB=(typeof TT!='undefined'&&TT.on)?'title':'pause';
 $('ui').innerHTML=`<div id=sts class="box modal" style="width:min(420px,92vw)"><h2>Stats</h2>${statsData().map(([h,r])=>`<h3>${h}</h3>${r.map(([k,v])=>`<p class=m style="display:flex;justify-content:space-between;gap:12px;margin:3px 0"><span>${k}</span><b>${esc(String(v))}</b></p>`).join('')}`).join('')}<div class=row2><button class=go onclick="statsBack()">Back</button></div></div>`}
let STB='';function statsBack(){if(STB=='title')titleUI();else pauseUI();STB=''}
{const p0=pauseUI;pauseUI=function(){p0.apply(this,arguments);const b=document.querySelector('#pzm button[onclick="settings()"]');if(b)b.insertAdjacentHTML('beforebegin','<button onclick="statsOpen()">Stats</button>')}}
{const t0=titleUI;titleUI=function(){t0.apply(this,arguments);const b=document.querySelector('#ttl .ttm button[onclick="ttSet()"]');if(b)b.insertAdjacentHTML('beforebegin','<button onclick="statsOpen()">Stats</button>')}}
