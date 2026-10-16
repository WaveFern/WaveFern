/* ===== v26.146: Gphone overhaul: clean phone UI and real reasons to buy each model =====
   Replaces the phone's screens from 115-gphone.js (status bar, wallpaper home screen, app headers, slide animations, home bar).
   What each model gives (GPF below):
   - Every model: bigger, sharper photos and less shutter lag; apps open faster (Gphone 8 to 12 show a short loading screen).
   - Photo posts on Instagrime earn followers, more with a better camera, double for a selfie with an artist.
   - 10+ Stats app, 11+ Maps (city map), 12+ taxi rides in Maps and +1 reputation for a selfie with an artist (once per artist a day),
   - 13+ Bank app with a savings account that pays interest each night, 16+ Deals app: a brand pays you for the day's first photo post.
   Saves: S.sav (savings), S.dealDay, S.phSelf (artist -> day of last selfie rep), all default safely when missing. */
const GPF={8:'Laggy starter phone',9:'Sharper photos, less lag',10:'Stats app',11:'Maps app',12:'Taxi in Maps, selfie reputation',13:'Bank app with savings interest',14:'Faster everything, bigger photo boost',15:'Pro camera, best apps at full speed',16:'Deals app: brand pays for photos',17:'Instant shutter, bigger deals',18:'Everything, maxed out'};
const GP_BON={8:2,9:4,10:7,11:11,12:16,13:23,14:31,15:41,16:53,17:67,18:85};/* followers per photo post, before scaling */
const GP_LAG={8:650,9:420,10:300,11:200,12:120};/* ms of loading screen when opening an app */
const GP_INT={13:.004,14:.006,15:.008,16:.010,17:.012,18:.015};/* savings interest per night */
const GP_DEAL={16:150,17:220,18:300};
const GP_NEED={stat:10,maps:11,bank:13,deal:16};
const gpHas=a=>phModel()>=GP_NEED[a];
const gpBonus=(photo)=>{const m=phModel(),b=GP_BON[m]*(1+Math.sqrt(Math.max(0,S.listeners||0))/60);return Math.round(b*(photo&&photo.k=='self'&&photo.w?2:1))};
/* ---- icons ---- */
{const px=(r,p)=>{const c=document.createElement('canvas');c.width=r[0].length;c.height=r.length;const x=c.getContext('2d');r.forEach((l,y)=>[...l].forEach((h,i)=>{if(p[h]){x.fillStyle=p[h];x.fillRect(i,y,1,1)}}));return c.toDataURL()};
 IC.stat=px(['..........','..........','.......YY.','.......YY.','....BB.YY.','....BB.YY.','.GG.BB.YY.','.GG.BB.YY.','.GG.BB.YY.','WWWWWWWWWW'],{G:'#2fe68a',B:'#4aa3ff',Y:'#ffd23f',W:'#c8d4cc'});
 IC.maps=px(['...RRRR...','..RRRRRR..','..RRWWRR..','..RRWWRR..','..RRRRRR..','...RRRR...','....RR....','....RR....','.....R....','..........'],{R:'#ff5a4a',W:'#ffffff'});
 IC.bank=px(['..........','....YY....','..YYYYYY..','.YYYYYYYY.','.WW.WW.WW.','.WW.WW.WW.','.WW.WW.WW.','.WW.WW.WW.','WWWWWWWWWW','..........'],{Y:'#ffd23f',W:'#f0f4f1'});
 IC.deal=px(['..RR..RR..','.R..RR..R.','..RRRRRR..','PPPPRRPPPP','PPPPRRPPPP','PPPPRRPPPP','PPPPRRPPPP','PPPPRRPPPP','PPPPRRPPPP','..........'],{R:'#ff5a7a',P:'#b06aff'})}
/* ---- styles ---- */
{const st=document.createElement('style');st.textContent=`
#ph{position:fixed;right:18px;bottom:18px;width:min(400px,calc(100vw - 24px));height:min(720px,calc(100vh - 24px));z-index:70;display:flex;flex-direction:column;border-radius:34px;border:4px solid #000;background:#06090a;box-shadow:0 0 0 2px #26302a,8px 8px 0 #0008;overflow:hidden;color:var(--t,#e8f3ec);animation:phIn .22s ease-out;font:14px/1.35 ui-monospace,Menlo,Consolas,monospace}
@keyframes phIn{from{opacity:0;transform:translateY(40px) scale(.96)}to{opacity:1;transform:none}}
@keyframes phApp{from{opacity:0;transform:scale(.97) translateY(10px)}to{opacity:1;transform:none}}
@keyframes phSpin{to{transform:rotate(360deg)}}
#ph .phs{display:flex;justify-content:space-between;align-items:center;padding:10px 22px 4px;font-size:12px;color:#c8d4cc;background:transparent;position:relative;z-index:2}
#ph .phs b{font-weight:700;letter-spacing:.5px}#ph .phs span{display:flex;gap:6px;align-items:center}
#ph .phs .bat{width:20px;height:10px;border:1.5px solid #c8d4cc;border-radius:3px;position:relative}#ph .phs .bat:after{content:'';position:absolute;inset:1.5px;background:var(--g,#2fe68a);border-radius:1px}
#ph .phs .sg{display:inline-flex;gap:1.5px;align-items:flex-end;height:10px}#ph .phs .sg i{display:block;width:3px;background:#c8d4cc;border-radius:1px}
#ph .phw{flex:1;min-height:0;position:relative;display:flex;flex-direction:column;background:radial-gradient(120% 70% at 50% 0%,#17382a 0%,#0b1411 55%,#06090a 100%)}
#ph .phb{flex:1;min-height:0;position:relative;overflow:auto}#ph .phb.phan{animation:phApp .2s ease-out}
#ph .phb .phx{position:absolute;inset:0;overflow:auto}
#ph .phb .chat .cl{width:132px}#ph .phb .ig{max-width:none;border:0;border-radius:0;min-height:100%}
#ph .pha{display:flex;align-items:center;gap:8px;padding:6px 14px 8px;position:relative;z-index:2}
#ph .pha h2{margin:0;flex:1;font:700 15px Silkscreen,ui-monospace,monospace;letter-spacing:.5px;color:var(--g,#2fe68a)}
#ph .pha button{background:#ffffff14;border:0;border-radius:14px;padding:5px 12px;color:#e8f3ec;box-shadow:none;font-size:13px;cursor:pointer}#ph .pha button:hover{background:#ffffff26}
#ph .phh{display:block;grid-template-columns:none;gap:0;padding:6px 18px 14px;overflow:auto;height:100%;box-sizing:border-box}
#ph .phk{margin:4px 0 14px;text-align:left}#ph .phk .tm{font:700 44px/1 Silkscreen,ui-monospace,monospace;color:#f2fff7}#ph .phk .dt{color:#8aa094;margin-top:4px}
#ph .phg2{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 6px}
#ph .phi{display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:0;box-shadow:none;font-size:11px;color:#dfe9e3;position:relative;cursor:pointer;padding:0}
#ph .phi .t{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 -3px 0 #0004,0 3px 8px #0006;transition:transform .12s}
#ph .phi:hover .t{transform:scale(1.07)}#ph .phi:active .t{transform:scale(.94)}
#ph .phi .t img{width:38px;height:38px;image-rendering:pixelated}
#ph .phi.lk{opacity:.5}#ph .phi.lk .t{filter:grayscale(1)}#ph .phi small{color:#8aa094;font-size:10px;margin-top:-3px}
#ph .phi .bd{position:absolute;top:-5px;right:6px;background:#ff4d4d;color:#fff;border-radius:10px;padding:0 6px;font-size:11px;font-weight:700;box-shadow:0 0 0 2px #0b1411}
#ph .phn{display:flex;justify-content:center;padding:8px 0 10px;background:transparent}
#ph .phn button{width:120px;height:6px;border-radius:3px;background:#e8f3ec;border:0;padding:0;box-shadow:none;opacity:.8;cursor:pointer}
#ph .phc{padding:12px;display:flex;flex-direction:column;gap:10px}#ph .phc select{padding:6px;background:#0a0d0b;color:var(--t,#e8f3ec);border:2px solid #333}
#ph .phv{width:100%;image-rendering:pixelated;border-radius:12px;background:#000}
#ph .phg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:12px}#ph .phg img{width:100%;image-rendering:pixelated;border-radius:8px;cursor:pointer;display:block}
#ph .phs2{padding:14px;display:flex;flex-direction:column;gap:12px}
#ph .pcd{background:#ffffff0f;border:1px solid #ffffff1a;border-radius:16px;padding:12px 14px}#ph .pcd h3{margin:0 0 4px;font:700 12px Silkscreen,ui-monospace,monospace;color:#8aa094;letter-spacing:.5px}
#ph .pcd .big{font:700 26px Silkscreen,ui-monospace,monospace;color:#f2fff7}#ph .pcd .sub{color:#8aa094;font-size:12px}
#ph .prow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#ph .pbr{height:8px;border-radius:4px;background:#ffffff14;overflow:hidden;margin-top:4px}#ph .pbr i{display:block;height:100%;background:var(--g,#2fe68a);border-radius:4px}
#ph .pls{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0;border-top:1px solid #ffffff12}#ph .pls:first-of-type{border-top:0}
#ph .pbt{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}#ph .pbt button{border-radius:12px}
#ph .pld{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#8aa094}
#ph .pld i{width:34px;height:34px;border:4px solid #ffffff22;border-top-color:var(--g,#2fe68a);border-radius:50%;animation:phSpin .7s linear infinite}
#ph .pnx{margin-top:16px;background:linear-gradient(120deg,#16422f,#1b2c3d);border:1px solid #ffffff22;border-radius:16px;padding:12px 14px}
`;document.head.appendChild(st)}
/* ---- screens ---- */
const GP_APPS=[['msg','Messages',()=>IC.msg,'#7a3df0'],['ig','Instagrime',()=>IC.ig,'#d6249f'],['cam','Camera',()=>IC.cam,'#3a4048'],['pho','Photos',()=>IC.pho,'#1f7a52'],
 ['stat','Stats',()=>IC.stat,'#1d3a5c'],['maps','Maps',()=>IC.maps,'#2b6a4a'],['bank','Bank',()=>IC.bank,'#5b4a1a'],['deal','Deals',()=>IC.deal,'#4a2a6b']];
const GP_TITLE={msg:'Messages',ig:'Instagrime',cam:'Camera',pho:'Photos',stat:'Stats',maps:'Maps',bank:'Bank',deal:'Deals'};
const gpNum=n=>Math.round(+n||0).toLocaleString();
phTitle=function(){const m=phModel(),net=m>=15?'5G':m>=11?'4G':m>=9?'LTE':'3G',bars=m>=13?4:m>=10?3:2;return`<div class=phs><b>${clk()}</b><span>${net}<span class=sg>${[4,6,8,10].map((h,i)=>`<i style="height:${h}px;opacity:${i<bars?1:.3}"></i>`).join('')}</span><span class=bat></span></span></div>`};
function gpHome(){const m=phModel(),un=(S.msgs||[]).filter(x=>x.unread).length,nx=GPH[m+1];
 const tiles=GP_APPS.map(a=>{const lk=GP_NEED[a[0]]&&!gpHas(a[0]);return`<button class="phi ${lk?'lk':''}" onclick="phApp('${a[0]}')"><span class=t style="background:linear-gradient(145deg,${a[3]},${a[3]}aa)"><img src="${a[2]()}"></span>${a[1]}${lk?`<small>Gphone ${GP_NEED[a[0]]}</small>`:''}${a[0]=='msg'&&un?`<span class=bd>${un}</span>`:''}</button>`}).join('');
 return`<div class=phh><div class=phk><div class=tm>${clk()}</div><div class=dt>Day ${S.day} · Gphone ${m}</div></div><div class=phg2>${tiles}</div>${nx?`<div class=pnx><b>Gphone ${m+1} · $${nx[0].toLocaleString()}</b><div class=sub style="color:#8aa094">${GPF[m+1]}. Buy it on gphone.wf on your computer, or Amazoom.</div></div>`:`<div class=pnx><b>You have the best Gphone</b><div class=sub style="color:#8aa094">Every app and perk is unlocked.</div></div>`}</div>`}
function gpStat(){const L=(S.songs||[]).slice().sort((a,b)=>(b.streams||0)-(a.streams||0)).slice(0,5),mx=Math.max(1,...L.map(x=>x.streams||0)),today=(S.songs||[]).reduce((a,x)=>a+(x.today||0),0);
 return`<div class=phs2><div class=prow><div class=pcd><h3>LISTENERS</h3><div class=big>${gpNum(S.listeners)}</div><div class=sub>monthly</div></div><div class=pcd><h3>FOLLOWERS</h3><div class=big>${gpNum(S.igF)}</div><div class=sub>Instagrime</div></div></div>
 <div class=prow><div class=pcd><h3>TODAY</h3><div class=big>${gpNum(today)}</div><div class=sub>streams</div></div><div class=pcd><h3>BALANCE</h3><div class=big>${$$(S.money)}</div><div class=sub>${(S.songs||[]).length} songs out</div></div></div>
 <div class=pcd><h3>TOP SONGS</h3>${L.length?L.map(x=>`<div style="margin-top:8px"><div style="display:flex;justify-content:space-between"><span>${esc(x.title)}</span><span class=sub>${gpNum(x.streams)}</span></div><div class=pbr><i style="width:${Math.max(3,(x.streams||0)/mx*100)}%"></i></div></div>`).join(''):'<div class=sub>No songs yet. Record one in your studio.</div>'}</div></div>`}
function gpMaps(){const m=phModel(),seen=new Set(),dest=(SHOPS||[]).filter(s=>typeof s.cx=='number'&&s.name&&!seen.has(s.name)&&seen.add(s.name)).slice(0,14);
 const inside=typeof IN!='undefined'&&IN;
 return`<div class=phs2><div class=pcd><h3>YOU ARE HERE</h3><div class=big style="font-size:18px">${Math.round(P.x)}, ${Math.round(P.z)}</div><div class=pbt><button class=go onclick="gpMap()">Open city map</button></div></div>
 ${m>=12?`<div class=pcd><h3>TAXI</h3>${inside?'<div class=sub>Step outside to call a taxi.</div>':dest.map(s=>{const z=s.ez||12.9,c=Math.round(Math.hypot(P.x-s.cx,P.z-z)*.06);return`<div class=pls><span>${esc(s.name)}</span><button ${S.money<c?'disabled':''} onclick="gpTaxi(${s.cx},${z})">Ride · $${c}</button></div>`}).join('')}</div>`:`<div class=pcd><h3>TAXI</h3><div class=sub>Taxi rides unlock on the Gphone 12.</div></div>`}</div>`}
function gpMap(){closePhone();try{bigMap()}catch(e){console.error(e)}}
function gpTaxi(x,z){closePhone();try{taxi(x,z)}catch(e){console.error(e)}}
function gpBank(){const m=phModel(),r=GP_INT[m]||0,sv=+S.sav||0;
 return`<div class=phs2><div class=prow><div class=pcd><h3>WALLET</h3><div class=big style="font-size:20px">${$$(S.money)}</div></div><div class=pcd><h3>SAVINGS</h3><div class=big style="font-size:20px">${$$(sv)}</div></div></div>
 <div class=pcd><h3>INTEREST</h3><div class=big style="font-size:20px">${(r*100).toFixed(1)}% a night</div><div class=sub>Paid when you sleep. Tonight: ${$$(sv*r)}. A better Gphone pays more.</div>
 <div class=pbt><button class=go ${S.money<100?'disabled':''} onclick="gpDep(100)">Save $100</button><button class=go ${S.money<1000?'disabled':''} onclick="gpDep(1000)">Save $1,000</button><button ${S.money<=0?'disabled':''} onclick="gpDep(-1)">Save all</button><button ${sv<=0?'disabled':''} onclick="gpWd()">Withdraw all</button></div></div></div>`}
function gpDep(n){const a=n<0?Math.floor(S.money):n;if(a<=0||S.money<a)return;S.money=+(S.money-a).toFixed(2);S.sav=+((+S.sav||0)+a).toFixed(2);try{snd('pop')}catch(e){}phR()}
function gpWd(){const a=+S.sav||0;if(a<=0)return;S.money=+(S.money+a).toFixed(2);S.sav=0;try{snd('pop')}catch(e){}phR()}
function gpDeal(){const m=phModel(),pay=GP_DEAL[m]||0,done=S.dealDay==S.day;
 return`<div class=phs2><div class=pcd><h3>TODAY'S BRAND DEAL</h3><div class=big>${$$(pay)}</div><div class=sub>${done?'Claimed today. A new deal arrives tomorrow.':'Post a photo to Instagrime today and a brand pays you. Take one in Camera, then share it from Photos.'}</div>
 <div class=pbt>${done?'<button disabled>Claimed</button>':'<button class=go onclick="phApp(\'cam\')">Take a photo</button><button onclick="phApp(\'pho\')">Open Photos</button>'}</div></div>
 <div class=pcd><h3>BETTER PHONE, BETTER DEALS</h3><div class=sub>Gphone 16: $150 · Gphone 17: $220 · Gphone 18: $300 per day.</div></div></div>`}
phBody=function(){const a=PH.app;if(PH.loading)return`<div class=pld><i></i><span>Gphone ${phModel()} is slow…</span></div>`;
 if(a=='msg')return`<div class=phx>${PA.msg()}</div>`;if(a=='ig')return`<div class=phx>${PA.ig()}</div>`;if(a=='pho')return phPhoUI();
 if(a=='stat')return`<div class=phx>${gpStat()}</div>`;if(a=='maps')return`<div class=phx>${gpMaps()}</div>`;if(a=='bank')return`<div class=phx>${gpBank()}</div>`;if(a=='deal')return`<div class=phx>${gpDeal()}</div>`;
 return gpHome()};
phR=function(){let e=document.getElementById('ph');if(!e){e=document.createElement('div');e.id='ph';document.body.appendChild(e)}
 const sc=e.querySelector('.phb'),st=sc?sc.scrollTop:0,home=PH.app=='home'&&!PH.loading,an=PH.anim;PH.anim=0;
 e.innerHTML=phTitle()+`<div class=phw>${home?'':`<div class=pha><button onclick="phApp('home')">‹ Home</button><h2>${esc(GP_TITLE[PH.app]||'')}</h2><button onclick="closePhone()">✕</button></div>`}<div class="phb ${an?'phan':''}">${phBody()}</div></div><div class=phn><button title="Home" onclick="${home?'closePhone()':"phApp('home')"}"></button></div>`;
 const b=e.querySelector('.phb');if(b&&st&&!an)b.scrollTop=st;
 try{const cv=document.getElementById('cv');if(cv)cv.scrollTop=cv.scrollHeight}catch(x){}
 try{if(PH.app=='ig'){const u=pxURL(S.pfpIg);if(u){const d=pxDef();e.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')===d)i.src=u})}}}catch(x){}};
phApp=function(a){if(a=='cam')return openCamera();if(a!='home'&&GP_NEED[a]&&!gpHas(a)){try{snd('err')}catch(e){}return say('Needs a Gphone '+GP_NEED[a]+'. Buy one on gphone.wf.')}
 PH.view=null;if(a=='ig'){igv='feed'}if(a=='msg'){ncv=false}
 const lag=a=='home'?0:(GP_LAG[phModel()]||0),tok=PH.tok=(PH.tok||0)+1;PH.anim=1;
 if(lag){PH.app=a;PH.loading=1;phR();setTimeout(()=>{if(PH.tok!=tok||mode!='phone')return;PH.loading=0;PH.anim=1;phR()},lag)}else{PH.loading=0;PH.app=a;phR()}};
{const o0=openPhone;openPhone=function(){PH.loading=0;PH.anim=0;return o0.apply(this,arguments)}}
/* ---- perks ---- */
/* photo posts earn followers (double for a selfie with an artist) and, on a Gphone 16+, the day's brand deal */
{const p0=phPost;phPost=function(id){p0.apply(this,arguments);try{if(PXP)PXP.ph=phPhotos().find(q=>q.id==id)}catch(e){}}}
{const s0=pxPostShare;pxPostShare=function(){const ph=PXP&&PXP.ph,n0=(S.igPosts||[]).length;const r=s0.apply(this,arguments);
 try{if(ph&&(S.igPosts||[]).length>n0){const b=gpBonus(ph);S.igF=(S.igF||0)+b;let t='Photo post: +'+b+' followers';
  const pay=GP_DEAL[phModel()];if(pay&&S.dealDay!=S.day){S.dealDay=S.day;S.money=+(S.money+pay).toFixed(2);S.earn=(S.earn||0)+pay;t+=' · brand deal '+$$(pay)}
  say(t)}}catch(e){console.error('photo perk',e)}return r}}
/* selfie with an artist: +1 reputation on a Gphone 12+, once per artist per day */
{const n0=phNew;phNew=function(c,kind,who){const r=n0.apply(this,arguments);try{if(kind=='self'&&who&&phModel()>=12){const i=ART.findIndex(a=>a[0]==who);if(i>=0){if(!S.phSelf)S.phSelf={};if(S.phSelf[i]!=S.day){S.phSelf[i]=S.day;S.rep=(S.rep||0)+1;say('Selfie with '+who+': +1 reputation')}}}}catch(e){}return r}}
/* savings interest each night */
{const w0=wakeUp;wakeUp=function(){const r=w0.apply(this,arguments);try{const i=GP_INT[phModel()];if(i&&S.sav>0){const g=+(S.sav*i).toFixed(2);if(g>0){S.sav=+(S.sav+g).toFixed(2);say('Gphone Bank paid '+$$(g)+' interest')}}}catch(e){}return r}}
/* ---- the shop page: what each model gives you ---- */
PA.phones=()=>{const m=phModel();return`<div style="padding:14px"><h1 style="margin:0 0 4px">Gphone</h1><p class=m>You have a <b>Gphone ${m}</b>. Each model keeps everything from the one before. Open your phone with G.</p><div class=cards style="display:flex;flex-wrap:wrap;gap:10px">${Object.keys(GPH).map(Number).filter(n=>n>8).map(n=>{const g=GPH[n];return`<div class=card style="min-width:190px;flex:1"><b style="font-size:16px">Gphone ${n}</b><br><b style="color:var(--g)">${GPF[n]}</b><br><small class=m>Photos ${g[1]}x${g[2]} · ${g[3]?'shutter lag '+g[3]+'s':'instant shutter'}<br>${GP_LAG[n]?'Apps load in '+(GP_LAG[n]/1000).toFixed(1)+'s':'Apps open instantly'}<br>Photo post: about +${Math.round(GP_BON[n]*(1+Math.sqrt(Math.max(0,S.listeners||0))/60))} followers${GP_NEED.stat==n?'<br>Unlocks: Stats':GP_NEED.maps==n?'<br>Unlocks: Maps':GP_NEED.bank==n?'<br>Unlocks: Bank, '+(GP_INT[n]*100).toFixed(1)+'% interest':GP_NEED.deal==n?'<br>Unlocks: Deals, $'+GP_DEAL[n]+'/day':GP_DEAL[n]?'<br>Deals pay $'+GP_DEAL[n]+'/day':GP_INT[n]?'<br>Savings interest '+(GP_INT[n]*100).toFixed(1)+'%':''}</small><div style="margin:8px 0;font-weight:bold;font-size:18px">$${g[0].toLocaleString()}</div>${n<=m?`<button disabled>${n==m?'You have this':'You have a newer one'}</button>`:`<button class=go ${S.money<g[0]?'disabled':''} onclick="buyPhone(${n})">Buy now</button>`}</div>`}).join('')}</div></div>`};
