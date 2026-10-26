/* ===== v26.147-148: Gphone everyday apps, upgrade perks you can feel, and a phone that looks like the game =====
   v26.148: the phone uses the game's own look (THEMES.md: black borders, hard shadows, Silkscreen, the green palette) inside a
   phone body with bezel, notch, side buttons and a home bar. The Bank, Stats, Maps and Deals apps from v26.146 are gone:
   any savings are paid back to your wallet once (S.sav set to 0), and their nightly interest and deal payouts no longer run.
   Adds the things you used to walk to the computer for, on the phone (G):
   - Spotifly: name and release your recorded songs, see today's streams and earnings so far.
   - Goober Eats: order food (it goes to Storage, as on the computer); from the Gphone 9 you can also eat stored food anywhere.
   - Gigs: the FestivalApp (book festival slots and setlists).
   - Gphone Store: see what each model gives and buy the next one straight from the phone.
   Upgrade perks (numbers shown on the home screen, the Store and gphone.wf):
   - Fan buzz: every model from the Gphone 9 adds a share to every song's daily streams (GP_BUZZ).
   No new save fields: buzz reads the phone model (S.phone), food uses the existing S.fd storage. */
const GP_BUZZ={8:0,9:.02,10:.04,11:.06,12:.08,13:.10,14:.12,15:.15,16:.17,17:.19,18:.22};
const gpBuzz=()=>GP_BUZZ[phModel()]||0;
const gpPct=n=>'+'+Math.round((GP_BUZZ[n]||0)*100)+'% streams';
/* what's new on each model, shown in the Store, on gphone.wf and on the home screen card */
const GP_NEW={8:['Messages, Spotifly, Instagrime, Eats, Gigs, Camera, Photos'],9:['Eat stored food anywhere','Sharper photos'],10:['Faster apps'],11:['Faster apps','Better camera'],12:['+1 reputation per artist selfie'],13:['Apps open instantly'],14:['Bigger photo boost'],15:['Pro camera'],16:['Bigger photo boost'],17:['Instant shutter'],18:['Best camera']};
Object.keys(GPF).forEach(n=>{GPF[n]=(GP_NEW[n]||[]).concat(GP_BUZZ[n]?[gpPct(n)]:[]).join(' · ')});
/* ---- fan buzz: more daily streams on every song (same shape as the gear and Label HQ boosts) ---- */
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!(v>0))return v;const m=gpBuzz();if(!(m>0))return v;
 try{const x=(s.vx||0)+(s.fx||0),n=v-x,cap=songCap(s)-x;s.pv=x+Math.max(n,Math.min(Math.round(n*(1+m)),Math.round(cap)));return s.pv}catch(e){return v}}}
/* ---- icons ---- */
{const px=(r,p)=>{const c=document.createElement('canvas');c.width=r[0].length;c.height=r.length;const x=c.getContext('2d');r.forEach((l,y)=>[...l].forEach((h,i)=>{if(p[h]){x.fillStyle=p[h];x.fillRect(i,y,1,1)}}));return c.toDataURL()};
 IC.gpst=px(['...KKKK...','..KWWWWK..','..KWGGWK..','..KWWWWK..','..KWWWWK..','..KWWWWK..','..KWWWWK..','..KWWWWK..','..KWKKWK..','...KKKK...'],{K:'#0c0f0d',W:'#e8f3ec',G:'#2fe68a'})}
/* ---- apps: everyday ones first ---- */
GP_APPS.splice(0,GP_APPS.length,
 ['msg','Messages',()=>IC.msg,'#3b82f6'],['sf','Spotifly',()=>IC.fw,'#000000'],['ig','Instagrime',()=>IC.ig,'#d6249f'],['eats','Eats',()=>IC.eats,'#c8964a'],
 ['cam','Camera',()=>IC.cam,'#26302a'],['pho','Photos',()=>IC.pho,'#2a6f97'],['fest','Gigs',()=>IC.fest||IC.os,'#6a3093'],['shop','Store',()=>IC.gpst,'#2fe68a']);
Object.assign(GP_TITLE,{sf:'Spotifly',eats:'Goober Eats',fest:'Gigs',shop:'Gphone Store'});
/* ---- Spotifly: release drafts and watch today's streams ---- */
function gpSf(){if(!S.artist)return`<div class=phs2><div class=pcd><h3>SPOTIFLY</h3><div class=sub>Pick your artist name on the computer first.</div></div></div>`;
 const D=S.drafts||[],ok=D.filter(d=>(d.title||'').trim()).length,L=(S.songs||[]).slice().sort((a,b)=>(b.today||0)-(a.today||0)),today=L.reduce((a,x)=>a+(x.today||0),0),bz=gpBuzz();
 return`<div class=phs2><div class=prow><div class=pcd><h3>TODAY</h3><div class=big>${gpNum(today)}</div><div class=sub>streams so far</div></div><div class=pcd><h3>EARNED</h3><div class=big style="font-size:20px">${$$(today*.05)}</div><div class=sub>paid tonight</div></div></div>
 <div class=pcd><h3>FAN BUZZ</h3>${bz?`<span class=gptg>${gpPct(phModel())}</span><div class=sub style="margin-top:4px">Your Gphone ${phModel()} adds this to every song's daily streams.</div>`:`<div class=sub>A Gphone 9 or newer adds +2% to +22% to every song's daily streams. Open the Store.</div>`}</div>
 <div class=pcd><h3>READY TO RELEASE${D.length?' ('+D.length+')':''}</h3>${D.length?D.map(d=>`<div class=gpq><input value="${esc(stripFt(d.title))}" maxlength=48 oninput="dTitle(${d.id},this.value)"><button class=go onclick="upl(${d.id})">Release</button></div><div class=sub style="margin:-4px 0 4px">${esc(d.g)} · Q${d.q}${d.ft?' · feat. '+esc(d.ft):''}</div>`).join('')+(D.length>1?`<div class=pbt><button class=go ${ok?'':'disabled'} onclick="uplAll()">Release all (${ok})</button></div>`:''):'<div class=sub>No recorded songs. Record one at the microphone in your studio, then release it here.</div>'}</div>
 <div class=pcd><h3>YOUR SONGS TODAY</h3>${L.length?L.slice(0,8).map(x=>`<div class=gpq><span class=n><b>${esc(x.title)}${x.boost>0?' <span class=gptg>PROMO</span>':''}</b><small>${gpNum(x.streams)} total</small></span><span>${gpNum(x.today)}</span></div>`).join(''):'<div class=sub>Nothing released yet.</div>'}<div class=pbt><button onclick="phApp('ig')">Promote on Instagrime</button></div></div></div>`}
/* ---- Goober Eats: order food, and eat what's in Storage (Gphone 9+) ---- */
function gpEats(){const m=phModel(),en=Math.round(S.energy||0),fd=S.fd||{},has=S.apps&&S.apps.eats,st=Object.keys(fd).filter(i=>fd[i]>0&&FOOD[i]);
 const top=`<div class=pcd><h3>ENERGY</h3><div class=big>${en}/100</div><div class=gpen><i style="width:${Math.max(0,Math.min(100,en))}%"></i></div></div>`;
 const bag=`<div class=pcd><h3>IN STORAGE</h3>${st.length?st.map(i=>`<div class=gpq><span class=n><b>${esc(FOOD[i][0])} ×${fd[i]}</b><small>+${FOOD[i][2]} energy</small></span>${m>=9?`<button class=go ${en>=100?'disabled':''} onclick="gpEat(${i})">Eat</button>`:''}</div>`).join('')+(m>=9?'':'<div class=sub>Eat it at home from Storage, or anywhere with a Gphone 9.</div>'):'<div class=sub>Nothing stored. Order below and it is delivered to Storage.</div>'}</div>`;
 if(!has)return`<div class=phs2>${top}${bag}<div class=pcd><h3>GOOBER EATS</h3><div class=sub>Get the Goober Eats app to order food from your phone.</div><div class=pbt><button class=go ${S.money<APPD.eats.p?'disabled':''} onclick="inst('eats')">Get it · ${$$(APPD.eats.p)}</button></div></div></div>`;
 return`<div class=phs2>${top}${bag}<div class=pcd><h3>ORDER · ${$$(S.money)}</h3>${FOOD.map((f,i)=>`<div class=gpq><span class=n><b>${esc(f[0])}</b><small>+${f[2]} energy</small></span><button class=go ${S.money<f[1]?'disabled':''} onclick="order(${i})">${$$(f[1])}</button></div>`).join('')}</div></div>`}
function gpEat(i){S.fd=S.fd||{};if(!(S.fd[i]>0)||!FOOD[i]||phModel()<9)return;if((S.energy||0)>=100){try{snd('err')}catch(e){}return say('You are already full of energy.')}
 S.fd[i]--;if(S.fd[i]<=0)delete S.fd[i];const f=FOOD[i];S.energy=Math.min(100,(S.energy||0)+f[2]);try{updateVersion()}catch(e){}try{snd('eat')}catch(e){}say('Yum! +'+f[2]+' energy');phR()}
/* ---- Gigs: the FestivalApp in the phone ---- */
function gpFest(){try{return`<div class=gpfs>${PA.fest()}</div>`}catch(e){console.error('phone gigs',e);return`<div class=phs2><div class=pcd><div class=sub>Gigs hit a snag. Try again.</div></div></div>`}}
/* ---- Store: every model, what it gives, buy from the phone ---- */
function gpShop(){const m=phModel();
 return`<div class=phs2><div class=pcd><h3>YOUR PHONE</h3><div class=big style="font-size:20px">Gphone ${m}</div><div class=sub>${GP_BUZZ[m]?gpPct(m)+' fan buzz · ':''}${GP_LAG[m]>100?'apps load in '+(GP_LAG[m]/1000).toFixed(1)+'s':'apps open instantly'}</div></div>
 <div class="gpm">${Object.keys(GPH).map(Number).filter(n=>n>8).map(n=>{const g=GPH[n];return`<div class="pcd ${n==m?'on':''}"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>Gphone ${n}</b>${n<=m?`<span class=sub>${n==m?'You have this':'Owned'}</span>`:`<button class=go ${S.money<g[0]?'disabled':''} onclick="buyPhone(${n})">${'$'+g[0].toLocaleString()}</button>`}</div><div class=sub style="margin-top:4px">${esc(GPF[n])}</div></div>`}).join('')}</div></div>`}
/* buying from the phone keeps the phone open on the Store */
{const b0=buyPhone;buyPhone=function(n){const r=b0.apply(this,arguments);try{if(mode=='phone')phR()}catch(e){}return r}}
/* ---- screens ---- */
{const b0=phBody;phBody=function(){if(['stat','maps','bank','deal'].includes(PH.app))PH.app='home';const a=PH.app;if(PH.loading)return b0.apply(this,arguments);
 if(a=='sf')return`<div class=phx>${gpSf()}</div>`;if(a=='eats')return`<div class=phx>${gpEats()}</div>`;if(a=='fest')return`<div class=phx>${gpFest()}</div>`;if(a=='shop')return`<div class=phx>${gpShop()}</div>`;
 const h=b0.apply(this,arguments);if(a!='home')return h;
 /* home: badge for songs waiting to release, and the upgrade card opens the Store */
 const m=phModel(),nx=GPH[m+1],dr=(S.drafts||[]).length;let o=h;
 if(dr)o=o.replace(/(<img src="[^"]*">)(Spotifly)/,`$1$2<span class=bd>${dr}</span>`);
 o=o.replace(/<div class=pnx>[\s\S]*?<\/div><\/div>/,nx?`<div class=pnx onclick="phApp('shop')"><b>Next: Gphone ${m+1} · $${nx[0].toLocaleString()}</b><div class=sub style="color:#8aa094">${esc(GPF[m+1])}. Tap to see every model.</div></div>`:`<div class=pnx onclick="phApp('shop')"><b>You have the best Gphone</b><div class=sub style="color:#8aa094">${gpPct(m)} fan buzz and every app unlocked.</div></div>`);
 return o}}
/* the Spotifly and Eats screens refresh themselves so stream counts and energy stay live */
setInterval(()=>{try{if(mode=='phone'&&PH.app=='sf'&&!PH.loading&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||''))phR()}catch(e){}},2000);
/* ---- gphone.wf on the computer: same perk list ---- */
PA.phones=()=>{const m=phModel();return`<div style="padding:14px"><h1 style="margin:0 0 4px">Gphone</h1><p class=m>You have a <b>Gphone ${m}</b>${GP_BUZZ[m]?' ('+gpPct(m)+' fan buzz)':''}. Each model keeps everything from the one before. Open your phone with G, or buy straight from its Store app.</p><div class=cards style="display:flex;flex-wrap:wrap;gap:10px">${Object.keys(GPH).map(Number).filter(n=>n>8).map(n=>{const g=GPH[n];return`<div class=card style="min-width:190px;flex:1"><b style="font-size:16px">Gphone ${n}</b><br><b style="color:var(--g)">${esc(GPF[n])}</b><br><small class=m>Photos ${g[1]}x${g[2]} · ${g[3]?'shutter lag '+g[3]+'s':'instant shutter'}<br>${GP_LAG[n]>100?'Apps load in '+(GP_LAG[n]/1000).toFixed(1)+'s':'Apps open instantly'}</small><div style="margin:8px 0;font-weight:bold;font-size:18px">$${g[0].toLocaleString()}</div>${n<=m?`<button disabled>${n==m?'You have this':'You have a newer one'}</button>`:`<button class=go ${S.money<g[0]?'disabled':''} onclick="buyPhone(${n})">Buy now</button>`}</div>`}).join('')}</div></div>`};
/* ===== v26.148: Bank, Stats, Maps and Deals removed ===== */
Object.keys(GP_INT).forEach(k=>delete GP_INT[k]);Object.keys(GP_DEAL).forEach(k=>delete GP_DEAL[k]);Object.keys(GP_NEED).forEach(k=>delete GP_NEED[k]);
/* savings from the old Bank app go back to the wallet, once, whenever a save that still has them is loaded */
setInterval(()=>{try{if(typeof S!='undefined'&&S&&+S.sav>0){const v=+S.sav;S.sav=0;S.money=+((+S.money||0)+v).toFixed(2);say('Gphone Bank closed: '+$$(v)+' savings moved to your wallet')}}catch(e){}},2000);
/* ===== v26.148: the phone in the game's own look ===== */
/* the rounded app-style CSS from 115 and 116 is dropped; the camera viewfinder (#phcam) keeps its own */
document.querySelectorAll('style').forEach(t=>{if(/^\s*#ph\{/.test(t.textContent))t.remove()});
{const st=document.createElement('style');st.textContent=`
#ph{position:fixed;right:18px;bottom:14px;width:min(370px,calc(100vw - 24px));height:min(740px,calc(100vh - 24px));z-index:70;box-sizing:border-box;display:flex;flex-direction:column;
 background:#1b1f1d;border:3px solid #000;border-radius:30px;padding:12px 9px 14px;box-shadow:inset 0 0 0 3px #364439,inset 0 -5px 0 #0006,6px 6px 0 #0008;
 color:var(--t,#e8f3ec);font:13px/1.35 ui-monospace,Menlo,Consolas,monospace;animation:phIn .16s steps(4)}
@keyframes phIn{from{transform:translateY(60px)}to{transform:none}}
@keyframes phBlink{0%,100%{opacity:.25}50%{opacity:1}}
#ph .phsb{position:absolute;width:5px;background:#000;border-radius:2px}#ph .phsb.v1{left:-7px;top:110px;height:44px}#ph .phsb.v2{left:-7px;top:164px;height:44px}#ph .phsb.pw{right:-7px;top:140px;height:62px}
#ph .phscr{flex:1;min-height:0;position:relative;display:flex;flex-direction:column;background:var(--bg,#0c0f0d);border:3px solid #000;border-radius:18px;overflow:hidden}
#ph .phnt{position:absolute;left:50%;top:5px;transform:translateX(-50%);width:84px;height:18px;background:#000;border-radius:0 0 4px 4px;z-index:3;display:flex;align-items:center;justify-content:center;gap:10px}
#ph .phnt i{width:8px;height:8px;background:#1d2a3a;border:2px solid #364439;border-radius:50%}#ph .phnt b{width:26px;height:4px;background:#26302a;border-radius:2px}
#ph .phs{display:flex;justify-content:space-between;align-items:center;padding:6px 14px 6px;font:700 11px Silkscreen,ui-monospace,monospace;color:var(--t,#e8f3ec);background:var(--p,#161b18);border-bottom:2px solid #000;min-height:18px}
#ph .phs span{display:flex;gap:6px;align-items:center}
#ph .phs .bat{width:18px;height:9px;border:2px solid var(--t,#e8f3ec);position:relative}#ph .phs .bat:after{content:'';position:absolute;inset:1px;background:var(--g,#2fe68a)}
#ph .phs .sg{display:inline-flex;gap:1px;align-items:flex-end;height:10px}#ph .phs .sg i{display:block;width:3px;background:var(--t,#e8f3ec)}
#ph .phw{flex:1;min-height:0;position:relative;display:flex;flex-direction:column}
#ph .phb{flex:1;min-height:0;position:relative;overflow:auto}#ph .phb .phx{position:absolute;inset:0;overflow:auto}
#ph .phb .chat .cl{width:120px}#ph .phb .ig{max-width:none;border:0;border-radius:0;min-height:100%}
#ph .pha{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#1b1f1d;border-bottom:2px solid #000}
#ph .pha h2{margin:0;flex:1;font:700 13px Silkscreen,ui-monospace,monospace;color:var(--g,#2fe68a);text-align:center}
#ph .pha button{padding:3px 8px;font-size:12px}
#ph .phh{padding:12px 14px;height:100%;box-sizing:border-box;overflow:auto;background:repeating-linear-gradient(0deg,#0004 0 2px,transparent 2px 22px),repeating-linear-gradient(90deg,#0004 0 2px,transparent 2px 22px),linear-gradient(#1f5a3a,#123222 55%,#0c0f0d)}
#ph .phk{margin:8px 0 16px;text-align:center}#ph .phk .tm{font:700 42px/1 Silkscreen,ui-monospace,monospace;color:#fff;text-shadow:3px 3px 0 #000}#ph .phk .dt{color:var(--t,#e8f3ec);margin-top:6px;text-shadow:2px 2px 0 #000;font-size:12px}
#ph .phg2{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 4px}
#ph .phi{display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:0;box-shadow:none;padding:0;font-size:10px;color:#fff;text-shadow:1px 1px 0 #000;position:relative;cursor:pointer}
#ph .phi:hover{background:none}#ph .phi .t{width:54px;height:54px;display:flex;align-items:center;justify-content:center;border:2px solid #000;border-radius:8px;box-shadow:inset 0 -4px 0 #0005,3px 3px 0 #0008}
#ph .phi:hover .t{filter:brightness(1.15)}#ph .phi:active .t{transform:translate(2px,2px);box-shadow:inset 0 -4px 0 #0005,1px 1px 0 #0008}
#ph .phi .t img{width:36px;height:36px;image-rendering:pixelated}
#ph .phi .bd{position:absolute;top:-6px;right:2px;left:auto;width:auto;height:auto;line-height:14px;background:#e03a3a;color:#fff;border:2px solid #000;padding:0 4px;font:700 10px Silkscreen,ui-monospace,monospace;text-shadow:none}
#ph .phn{display:flex;justify-content:center;padding:6px 0 7px;background:var(--bg,#0c0f0d);border-top:2px solid #000}
#ph .phn button{width:110px;height:7px;padding:0;border:2px solid #000;background:var(--m,#8aa094);box-shadow:none;border-radius:4px;cursor:pointer}#ph .phn button:hover{background:var(--t,#e8f3ec)}
#ph .phc{padding:10px;display:flex;flex-direction:column;gap:10px}
#ph .phv{width:100%;image-rendering:pixelated;border:2px solid #000;background:#000}
#ph .phg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px}#ph .phg img{width:100%;image-rendering:pixelated;border:2px solid #000;cursor:pointer;display:block}
#ph .phs2{padding:10px;display:flex;flex-direction:column;gap:10px}
#ph .pcd,#ph .pnx{background:var(--p,#161b18);border:2px solid #000;box-shadow:3px 3px 0 #0008;padding:9px 10px}
#ph .pcd h3{margin:0 0 6px;font:700 11px Silkscreen,ui-monospace,monospace;color:var(--g,#2fe68a)}
#ph .pcd .big{font:700 22px Silkscreen,ui-monospace,monospace;color:var(--t,#e8f3ec)}#ph .sub{color:var(--m,#8aa094);font-size:12px}
#ph .pcd.on{border-color:var(--g,#2fe68a)}
#ph .prow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#ph .pbt{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
#ph .pnx{margin-top:18px;border-left:6px solid var(--g,#2fe68a);cursor:pointer}#ph .pnx b{font-family:Silkscreen,ui-monospace,monospace;font-size:12px;color:var(--g,#2fe68a)}#ph .pnx:hover{background:#1c221e}
#ph .pld{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:var(--m,#8aa094)}
#ph .pld i{width:18px;height:18px;background:var(--g,#2fe68a);border:2px solid #000;box-shadow:24px 0 0 -2px var(--g,#2fe68a),-24px 0 0 -2px var(--g,#2fe68a);animation:phBlink .5s steps(2) infinite}
#ph .gpq{display:flex;align-items:center;gap:6px;padding:6px 0;border-top:2px solid #0c0f0d}#ph .gpq:first-of-type{border-top:0}
#ph .gpq .n{flex:1;min-width:0}#ph .gpq .n b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ph .gpq .n small{color:var(--m,#8aa094)}
#ph .gpq input{flex:1;min-width:0;padding:5px 6px}#ph .gpq button{white-space:nowrap;padding:4px 8px}
#ph .gptg{display:inline-block;background:var(--g,#2fe68a);color:#04120a;border:2px solid #000;padding:0 5px;font:700 10px Silkscreen,ui-monospace,monospace}
#ph .gpen{height:12px;border:2px solid #000;background:#000;margin-top:6px}#ph .gpen i{display:block;height:100%;background:var(--g,#2fe68a)}
#ph .gpfs{padding:10px}#ph .gpfs .cards{display:flex!important;flex-direction:column;gap:8px}#ph .gpfs .card{min-width:0!important}#ph .gpfs h1{font-size:16px}
#ph .gpm{display:flex;flex-direction:column;gap:8px}
@media (max-height:620px){#ph{padding:8px 7px 10px;border-radius:22px}#ph .phk .tm{font-size:32px}}
`;document.head.appendChild(st)}
/* status bar: clock left, notch in the middle, signal and battery right */
phTitle=function(){const m=phModel(),net=m>=15?'5G':m>=11?'4G':m>=9?'LTE':'3G',bars=m>=13?4:m>=10?3:2;return`<div class=phs><b>${clk()}</b><span>${net}<span class=sg>${[3,5,7,9].map((h,i)=>`<i style="height:${h}px;opacity:${i<bars?1:.3}"></i>`).join('')}</span><span class=bat></span></span></div>`};
/* the phone body: side buttons, bezel, screen with notch, home bar */
phR=function(){let e=document.getElementById('ph');if(!e){e=document.createElement('div');e.id='ph';document.body.appendChild(e)}
 const sc=e.querySelector('.phb'),st=sc?sc.scrollTop:0,home=PH.app=='home'&&!PH.loading,an=PH.anim;PH.anim=0;
 e.innerHTML=`<i class="phsb v1"></i><i class="phsb v2"></i><i class="phsb pw"></i><div class=phscr><div class=phnt><b></b><i></i></div>${phTitle()}<div class=phw>${home?'':`<div class=pha><button onclick="phApp('home')">◀</button><h2>${esc(GP_TITLE[PH.app]||'')}</h2><button onclick="closePhone()">X</button></div>`}<div class=phb>${phBody()}</div></div><div class=phn><button title="Home" onclick="${home?'closePhone()':"phApp('home')"}"></button></div></div>`;
 const b=e.querySelector('.phb');if(b&&st&&!an)b.scrollTop=st;
 try{const cv=document.getElementById('cv');if(cv)cv.scrollTop=cv.scrollHeight}catch(x){}
 try{if(PH.app=='ig'){const u=pxURL(S.pfpIg);if(u){const d=pxDef();e.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')===d)i.src=u})}}}catch(x){}};
/* ===== v41.2: every app laid out for the phone screen =====
   Messages shows one column at a time on the phone: the chat list, or the open chat with a back button (PH.mv, not saved).
   FestivalApp uses its own narrow layout (two slots a row, stage name above them). Instagrime and the rest fill the width. */
{const a0=phApp;phApp=function(a){if(a=='msg')PH.mv='list';return a0.apply(this,arguments)}}
{const o0=openChat;openChat=function(){if(mode=='phone')PH.mv='chat';return o0.apply(this,arguments)}}
{const r0=phR;phR=function(){const r=r0.apply(this,arguments);try{const c=document.querySelector('#ph .chat');if(c){const list=PH.mv!='chat'||!!ncv;c.classList.add(list?'gpl':'gpc');
 const h=c.querySelector('.cvh');if(h&&!list&&!h.querySelector('.gpbk')){const b=document.createElement('button');b.className='gpbk';b.textContent='◀';b.title='Chats';b.onclick=()=>{PH.mv='list';phR()};h.prepend(b)}
 const cv=document.getElementById('cv');if(cv)cv.scrollTop=cv.scrollHeight}}catch(e){console.error('phone messages',e)}return r}}
{const st=document.createElement('style');st.textContent=`
#ph .chat{position:absolute;inset:0;font-size:13px}#ph .phb .chat .cl{width:auto!important;flex:1 1 auto;min-width:0;box-shadow:none}#ph .chat.gpl .cv{display:none}#ph .chat.gpc .cl{display:none}#ph .chat .cv{flex:1;min-width:0}
#ph .chat .crs{overflow-x:hidden}#ph .chat .cr{min-width:0}#ph .chat .cr .t{min-width:0;flex:1}#ph .chat .cr .t b,#ph .chat .cr .t small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#ph .chat .cvh{gap:8px;flex-wrap:wrap}#ph .chat .cvh .gpbk{flex:none;width:34px;height:34px;padding:0;border-radius:50%;border:0;background:#f7eefb;color:#2a2140;box-shadow:none;font-size:13px}
#ph .chat .cvh>div:not(.cva){flex:1;min-width:0}#ph .chat .cva{flex-wrap:wrap}
#ph .chat .cin input{min-width:0}
#ph .gpfs{padding:8px}#ph .gpfs .fa{padding:10px}#ph .fa-grid{grid-template-columns:1fr 1fr!important;gap:6px}#ph .fa-grid>div:first-child,#ph .fa-grid>.fa-t{display:none}#ph .fa-h{grid-column:1/-1}#ph .fa-two{grid-template-columns:1fr!important}
#ph .fa img,#ph .ig img{max-width:100%}#ph .phx{overflow-x:hidden}
#ph .phv{max-height:60vh;object-fit:contain;box-sizing:border-box}
`;document.head.appendChild(st)}
/* ===== v41.3: a live phone, Goober Eats in its own look, Spotifly artist page =====
   - The clock keeps running and you can walk (WASD) with the phone open: the game updates as in play, the phone stays up.
     If something takes over (sleep, a cutscene, a shop screen) the phone closes. E still only works with the phone away.
   - Goober Eats uses the computer's white Goober Eats page, sized for the phone (two dishes a row), with your stored food on top.
   - Spotifly is an artist page: your picture as a big header with your name on it, monthly listeners, Follow, shuffle and play,
     then Music (Popular songs with play counts), Release (drafts) and Stats tabs. Songs keep playing while the phone is open.
   PH.sft (tab) and PH.sfF (Follow) are not saved. */
{const u0=update;update=function(dt){if(mode!='phone')return u0.apply(this,arguments);mode='play';
 try{return u0.apply(this,arguments)}finally{if(mode=='play')mode='phone';else{const e=document.getElementById('ph');if(e)e.remove()}}}}
setInterval(()=>{try{if(mode=='phone'){const b=document.querySelector('#ph .phs b');if(b)b.textContent=clk();const t=document.querySelector('#ph .phk .tm');if(t)t.textContent=clk()}}catch(e){}},1000);
/* Spotifly music keeps playing while the phone is open (it stopped as soon as you left the computer) */
sfStart=function(s,ids){if(!s)return;if(ids)SPQ.ids=ids;try{Beats.setVolume(S.sfVol==null?1:S.sfVol)}catch(e){}
 const p=Beats.play(s,{owner:'sf',alive:()=>mode=='pc'||!!document.getElementById('ph')});if(p&&typeof say=='function')say('Now playing "'+s.title+'" · '+p.style+' · '+p.bpm+' bpm · '+p.key);pcR()};
/* ---- Goober Eats ---- */
gpEats=function(){const m=phModel(),en=Math.round(S.energy||0),fd=S.fd||{},has=S.apps&&S.apps.eats,st=Object.keys(fd).filter(i=>fd[i]>0&&FOOD[i]);
 const bag=`<div class=gpbag><b>In your bag</b> <span class=ues>Energy ${en}/100</span>${st.length?st.map(i=>`<div class=gpbr><span><b>${esc(FOOD[i][0])}</b> ×${fd[i]}<br><span class=ues>+${FOOD[i][2]} energy</span></span>${m>=9?`<button class=uebtn ${en>=100?'disabled':''} onclick="gpEat(${i})">Eat</button>`:''}</div>`).join('')+(m>=9?'':'<div class=ues>Eat it at home from Storage, or anywhere with a Gphone 9.</div>'):'<div class=ues>Nothing yet. Orders go to Storage at home.</div>'}</div>`;
 if(!has)return`<div class="ue gpue"><div class=ueh><b class=uel>Goober Eats</b></div>${bag}<div class=uehero><div><h1>Crave it? Get it.</h1><p>Get the app to order food from your phone.</p></div></div><div style="padding:0 12px"><button class=uebtn ${S.money<APPD.eats.p?'disabled':''} onclick="inst('eats')">Get Goober Eats · ${$$(APPD.eats.p)}</button></div></div>`;
 let h='';try{h=PA.eats()}catch(e){console.error('phone eats',e)}
 /* the 3D dish previews only draw while a computer or wardrobe screen is open; the hidden .wrd marker lets them draw here too */
 return`<i class=wrd style="display:none"></i><div class=gpuew>${h.replace(/<div class=uehero>/,bag+'<div class=uehero>')}</div>`};
/* ---- Spotifly ---- */
function gpSfRow(s,i,c){const on=!!(c&&c.src===s),pl=on&&!c.held;return`<div class="gsr${on?' on':''}" onclick="sfPlayId(${s.id})"><span class=gsn>${pl?sfIco('pause'):i}</span><img src="${sfCover(s)}" alt=""><span class=gst><b>${esc(s.title)}</b><small>${(s.streams||0).toLocaleString()}</small></span><span class=gsd>+${gpNum(s.today)}</span></div>`}
gpSf=function(){if(!S.artist)return`<div class=phs2><div class=pcd><h3>SPOTIFLY</h3><div class=sub>Pick your artist name on the computer first.</div></div></div>`;
 const t=PH.sft||'music',D=S.drafts||[],L=sfOrder(),c=sfCur(),pl=!!(c&&sfIsSong(c)&&!c.held),bz=gpBuzz(),today=L.reduce((a,x)=>a+(x.today||0),0),ok=D.filter(d=>(d.title||'').trim()).length;
 const tab=(k,n)=>`<button class="${t==k?'on':''}" onclick="PH.sft='${k}';phR()">${n}</button>`;
 let body='';
 if(t=='music')body=`<h3 class=gsh3>Popular</h3>${L.length?L.slice(0,10).map((s,i)=>gpSfRow(s,i+1,c)).join(''):'<p class=gsm>No releases yet. Record a song in the studio, then release it in the Release tab.</p>'}`;
 else if(t=='rel')body=D.length?D.map(d=>`<div class=gsq><input value="${esc(stripFt(d.title))}" maxlength=48 oninput="dTitle(${d.id},this.value)"><button class=gsgo onclick="upl(${d.id})">Release</button></div><div class=gsm style="margin:-2px 0 10px">${esc(d.g)} · Q${d.q}${d.ft?' · feat. '+esc(d.ft):''}</div>`).join('')+(D.length>1?`<button class=gsgo ${ok?'':'disabled'} onclick="uplAll()">Release all (${ok})</button>`:''):'<p class=gsm>No recorded songs. Record one at the microphone in your studio, then release it here.</p>';
 else body=`<div class=gsg><div><small>Streams today</small><b>${gpNum(today)}</b></div><div><small>Paid tonight</small><b>${$$(today*.05)}</b></div><div><small>Followers</small><b>${gpNum(S.followers)}</b></div><div><small>Total streams</small><b>${gpNum(S.streams)}</b></div></div><p class=gsm>${bz?'Fan buzz from your Gphone '+phModel()+': '+gpPct(phModel())+' on every song\'s daily streams.':'A Gphone 9 or newer adds +2% to +22% to every song\'s daily streams.'}</p>`;
 return`<div class=gsp style="--acc:${sfAcc()}"><div class=gshd><img src="${pfp()}" alt=""><h1>${esc(S.artist)}</h1></div>
 <div class=gsa><div><small class=gsm>${(S.listeners||0).toLocaleString()} monthly listeners</small><br><button class="gsfo${PH.sfF?' on':''}" onclick="PH.sfF=!PH.sfF;phR()">${PH.sfF?'Following':'Follow'}</button></div>
 <span style="flex:1"></span><button class="gssh${SPQ.sh?' on':''}" title="Shuffle" onclick="sfShuf()">${sfIco('shuf')}</button><button class=gspl title="${pl?'Pause':'Play'}" ${L.length?'':'disabled'} onclick="sfBig()">${sfIco(pl?'pause':'play')}</button></div>
 <div class=gstb>${tab('music','Music')}${tab('rel','Release'+(D.length?' ('+D.length+')':''))}${tab('stats','Stats')}</div><div class=gsb>${body}</div></div>`};
{const st=document.createElement('style');st.textContent=`
#ph .gpuew{min-height:100%;background:#fff}#ph .gpuew .ue,#ph .gpue{font-size:13px;min-height:100%;padding-bottom:16px;overflow-x:hidden}
#ph .ue .ueh{flex-wrap:wrap;gap:8px;padding:10px 12px}#ph .ue .uel{font-size:18px}#ph .ue .ues2,#ph .ue .ues3,#ph .ue .uep{display:none}#ph .ue .uec2{margin-left:auto;font-size:12px}
#ph .ue .uech{gap:6px;padding:8px 12px}#ph .ue .uech span{padding:5px 10px;font-size:12px}
#ph .ue .uehero{padding:6px 12px;gap:10px}#ph .ue .uehero h1{font-size:24px}#ph .ue .uehero p{margin:0;font-size:12px}#ph .ue .uepromo{width:auto;flex:1;padding:12px;font-size:13px}
#ph .ue h2{font-size:18px;margin:14px 12px 8px}
#ph .ue .uegrid{grid-template-columns:1fr 1fr;gap:12px 10px;padding:0 12px}
#ph .ue .uei{height:96px}#ph .ue .uei canvas{width:88px!important;height:88px!important}
#ph .ue .uet{font-size:13px;margin-top:6px}#ph .ue .ues{font-size:11px}#ph .ue .uebtn{width:100%;padding:7px 8px;font-size:12px}#ph .ue .uev{margin-left:0}
#ph .gpbag{margin:8px 12px;padding:10px 12px;background:#f3f3f3;border-radius:12px}#ph .gpbr{display:flex;align-items:center;gap:8px;justify-content:space-between;padding:6px 0;border-top:1px solid #e2e2e2}#ph .gpbr .uebtn{width:auto;margin:0;padding:6px 14px}
#ph .gsp{min-height:100%;background:var(--bg,#0c0f0d);overflow-x:hidden}
#ph .gshd{position:relative;height:230px;overflow:hidden;background:var(--acc)}#ph .gshd img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;image-rendering:pixelated}
#ph .gshd:after{content:'';position:absolute;inset:0;background:linear-gradient(transparent 45%,#0c0f0dee)}
#ph .gshd h1{position:absolute;left:14px;right:14px;bottom:8px;margin:0;z-index:1;font:700 30px/1.05 Silkscreen,ui-monospace,monospace;color:#fff;text-shadow:3px 3px 0 #000;overflow-wrap:anywhere}
#ph .gsa{display:flex;align-items:center;gap:10px;padding:8px 14px 4px}#ph .gsm{color:var(--m,#8aa094);font-size:12px}
#ph .gsfo{margin-top:6px;padding:4px 14px;background:transparent;color:var(--t,#e8f3ec);border:2px solid var(--m,#8aa094);border-radius:16px;box-shadow:none;font-size:12px}#ph .gsfo.on{border-color:var(--g,#2fe68a);color:var(--g,#2fe68a)}
#ph .gssh,#ph .gspl{padding:0;box-shadow:none;display:flex;align-items:center;justify-content:center}#ph .gssh{width:34px;height:34px;background:transparent;border:0;color:var(--m,#8aa094)}#ph .gssh.on{color:var(--g,#2fe68a)}#ph .gssh svg{width:20px;height:20px}
#ph .gspl{width:52px;height:52px;border-radius:50%;background:var(--g,#2fe68a);border:2px solid #000;color:#04120a;box-shadow:3px 3px 0 #0008}#ph .gspl svg{width:22px;height:22px}#ph .gspl:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #0008}
#ph .gstb{display:flex;gap:18px;padding:6px 14px 0;border-bottom:2px solid #000}#ph .gstb button{background:none;border:0;box-shadow:none;padding:8px 0;color:var(--m,#8aa094);font:700 12px Silkscreen,ui-monospace,monospace;border-bottom:3px solid transparent;border-radius:0}#ph .gstb button.on{color:var(--t,#e8f3ec);border-bottom-color:var(--g,#2fe68a)}
#ph .gsb{padding:6px 14px 14px}#ph .gsh3{margin:8px 0 6px;font:700 15px Silkscreen,ui-monospace,monospace;color:var(--t,#e8f3ec)}
#ph .gsr{display:flex;align-items:center;gap:10px;padding:6px 4px;cursor:pointer}#ph .gsr:hover{background:#ffffff0d}#ph .gsr.on .gst b,#ph .gsr.on .gsn{color:var(--g,#2fe68a)}
#ph .gsn{width:18px;text-align:center;color:var(--m,#8aa094);flex:none}#ph .gsn svg{width:12px;height:12px}
#ph .gsr img{width:42px;height:42px;flex:none;border:2px solid #000;image-rendering:pixelated}
#ph .gst{flex:1;min-width:0}#ph .gst b,#ph .gst small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ph .gst small{color:var(--m,#8aa094)}#ph .gsd{color:var(--m,#8aa094);font-size:11px;flex:none}
#ph .gsq{display:flex;gap:6px;align-items:center}#ph .gsq input{flex:1;min-width:0;padding:6px}
#ph .gsgo{background:var(--g,#2fe68a);color:#04120a;font-weight:700;white-space:nowrap}
#ph .gsg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}#ph .gsg div{background:var(--p,#161b18);border:2px solid #000;padding:8px}#ph .gsg small{display:block;color:var(--m,#8aa094);font-size:11px}#ph .gsg b{font:700 16px Silkscreen,ui-monospace,monospace}
#ph .phb,#ph .phx{overflow-x:hidden}
`;document.head.appendChild(st)}
