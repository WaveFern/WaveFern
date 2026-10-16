/* ===== v26.147: Gphone everyday apps and upgrade perks you can feel =====
   Adds the things you used to walk to the computer for, on the phone (G):
   - Spotifly: name and release your recorded songs, see today's streams and earnings so far.
   - Goober Eats: order food (it goes to Storage, as on the computer); from the Gphone 9 you can also eat stored food anywhere.
   - Gigs: the FestivalApp (book festival slots and setlists).
   - Gphone Store: see what each model gives and buy the next one straight from the phone.
   Upgrade perks (numbers shown on the home screen, the Store and gphone.wf):
   - Fan buzz: every model from the Gphone 9 adds a share to every song's daily streams (GP_BUZZ).
   - Gphone 12+: unlimited taxi rides from Maps (the world map taxi stays once a day).
   No new save fields: buzz and taxis read the phone model (S.phone), food uses the existing S.fd storage. */
const GP_BUZZ={8:0,9:.02,10:.04,11:.06,12:.08,13:.10,14:.12,15:.15,16:.17,17:.19,18:.22};
const gpBuzz=()=>GP_BUZZ[phModel()]||0;
const gpPct=n=>'+'+Math.round((GP_BUZZ[n]||0)*100)+'% streams';
/* what's new on each model, shown in the Store, on gphone.wf and on the home screen card */
const GP_NEW={8:['Messages, Spotifly, Instagrime, Goober Eats, Gigs, Camera'],9:['Eat stored food anywhere','Sharper photos'],10:['Stats app'],11:['Maps app with taxi rides'],12:['Unlimited taxi rides','+1 reputation per artist selfie'],13:['Bank app with nightly savings interest','Apps open instantly'],14:['Bigger photo boost'],15:['Pro camera'],16:['Deals app: $150 a day for a photo post'],17:['Instant shutter','Deals pay $220'],18:['Deals pay $300','Best interest: 1.5% a night']};
Object.keys(GPF).forEach(n=>{GPF[n]=(GP_NEW[n]||[]).concat(GP_BUZZ[n]?[gpPct(n)]:[]).join(' · ')});
/* ---- fan buzz: more daily streams on every song (same shape as the gear and Label HQ boosts) ---- */
{const po=planOf;planOf=function(s){const fresh=s&&s.pd!==S.day,v=po.apply(this,arguments);if(!fresh||!(v>0))return v;const m=gpBuzz();if(!(m>0))return v;
 try{const x=(s.vx||0)+(s.fx||0),n=v-x,cap=songCap(s)-x;s.pv=x+Math.max(n,Math.min(Math.round(n*(1+m)),Math.round(cap)));return s.pv}catch(e){return v}}}
/* ---- icons ---- */
{const px=(r,p)=>{const c=document.createElement('canvas');c.width=r[0].length;c.height=r.length;const x=c.getContext('2d');r.forEach((l,y)=>[...l].forEach((h,i)=>{if(p[h]){x.fillStyle=p[h];x.fillRect(i,y,1,1)}}));return c.toDataURL()};
 IC.gpst=px(['...KKKK...','..KWWWWK..','..KWGGWK..','..KWWWWK..','..KWWWWK..','..KWWWWK..','..KWWWWK..','..KWWWWK..','..KWKKWK..','...KKKK...'],{K:'#0c0f0d',W:'#e8f3ec',G:'#2fe68a'})}
/* ---- styles (inside the phone only) ---- */
{const st=document.createElement('style');st.textContent=`
#ph .gpq{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #ffffff12}#ph .gpq:first-of-type{border-top:0}
#ph .gpq .n{flex:1;min-width:0}#ph .gpq .n b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ph .gpq .n small{color:#8aa094}
#ph .gpq input{flex:1;min-width:0;padding:6px 8px;border-radius:10px}
#ph .gpq button,#ph .pcd button{border-radius:12px;white-space:nowrap}
#ph .gptg{display:inline-block;background:#2fe68a22;color:var(--g,#2fe68a);border-radius:10px;padding:1px 8px;font-size:11px;font-weight:700}
#ph .gpen{height:10px;border-radius:5px;background:#ffffff14;overflow:hidden;margin-top:6px}#ph .gpen i{display:block;height:100%;background:linear-gradient(90deg,#ffd23f,#2fe68a)}
#ph .gpfs{padding:10px}#ph .gpfs .cards{display:flex!important;flex-direction:column;gap:8px}#ph .gpfs .card{min-width:0!important}#ph .gpfs h1{font-size:18px}
#ph .gpm{display:flex;flex-direction:column;gap:6px}#ph .gpm .on{border:1px solid var(--g,#2fe68a)}
#ph .pnx{cursor:pointer}#ph .pnx:hover{filter:brightness(1.15)}
`;document.head.appendChild(st)}
/* ---- apps: everyday ones first ---- */
GP_APPS.splice(0,GP_APPS.length,
 ['msg','Messages',()=>IC.msg,'#7a3df0'],['sf','Spotifly',()=>IC.fw,'#121212'],['ig','Instagrime',()=>IC.ig,'#d6249f'],['eats','Eats',()=>IC.eats,'#8a4a12'],
 ['cam','Camera',()=>IC.cam,'#3a4048'],['pho','Photos',()=>IC.pho,'#1f7a52'],['fest','Gigs',()=>IC.fest||IC.os,'#7a2a4a'],['shop','Store',()=>IC.gpst,'#26302a'],
 ['stat','Stats',()=>IC.stat,'#1d3a5c'],['maps','Maps',()=>IC.maps,'#2b6a4a'],['bank','Bank',()=>IC.bank,'#5b4a1a'],['deal','Deals',()=>IC.deal,'#4a2a6b']);
Object.assign(GP_TITLE,{sf:'Spotifly',eats:'Goober Eats',fest:'Gigs',shop:'Gphone Store'});
/* ---- Spotifly: release drafts and watch today's streams ---- */
function gpSf(){if(!S.artist)return`<div class=phs2><div class=pcd><h3>SPOTIFLY</h3><div class=sub>Pick your artist name on the computer first.</div></div></div>`;
 const D=S.drafts||[],ok=D.filter(d=>(d.title||'').trim()).length,L=(S.songs||[]).slice().sort((a,b)=>(b.today||0)-(a.today||0)),today=L.reduce((a,x)=>a+(x.today||0),0),bz=gpBuzz();
 return`<div class=phs2><div class=prow><div class=pcd><h3>TODAY</h3><div class=big>${gpNum(today)}</div><div class=sub>streams so far</div></div><div class=pcd><h3>EARNED</h3><div class=big style="font-size:20px">${$$(today*.05)}</div><div class=sub>paid tonight</div></div></div>
 <div class=pcd><h3>FAN BUZZ</h3>${bz?`<span class=gptg>${gpPct(phModel())}</span><div class=sub style="margin-top:4px">Your Gphone ${phModel()} adds this to every song's daily streams.</div>`:`<div class=sub>A Gphone 9 or newer adds +2% to +22% to every song's daily streams. Open the Store.</div>`}</div>
 <div class=pcd><h3>READY TO RELEASE${D.length?' ('+D.length+')':''}</h3>${D.length?D.map(d=>`<div class=gpq><input value="${esc(d.title)}" maxlength=48 oninput="(S.drafts.find(x=>x.id==${d.id})||{}).title=this.value"><button class=go onclick="upl(${d.id})">Release</button></div><div class=sub style="margin:-4px 0 4px">${esc(d.g)} · Q${d.q}${d.ft?' · feat. '+esc(d.ft):''}</div>`).join('')+(D.length>1?`<div class=pbt><button class=go ${ok?'':'disabled'} onclick="uplAll()">Release all (${ok})</button></div>`:''):'<div class=sub>No recorded songs. Record one at the microphone in your studio, then release it here.</div>'}</div>
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
/* ---- Maps: taxi rides; Gphone 12+ rides are unlimited ---- */
gpMaps=function(){const m=phModel(),seen=new Set(),dest=(SHOPS||[]).filter(s=>typeof s.cx=='number'&&s.name&&!seen.has(s.name)&&seen.add(s.name)).slice(0,14),inside=typeof IN!='undefined'&&IN;
 let T=null;try{T=taxiDay()}catch(e){}const used=m<12&&T&&T.go;
 return`<div class=phs2><div class=pcd><h3>YOU ARE HERE</h3><div class=big style="font-size:18px">${Math.round(P.x)}, ${Math.round(P.z)}</div><div class=pbt><button class=go onclick="gpMap()">Open city map</button></div></div>
 <div class=pcd><h3>TAXI${m>=12?' <span class=gptg>UNLIMITED</span>':''}</h3>${inside?'<div class=sub>Step outside to call a taxi.</div>':used?`<div class=sub>You used today's taxi. Open the city map to ride back. A Gphone 12 gives unlimited rides.</div>`:`${m<12?'<div class=sub>One ride a day. A Gphone 12 gives unlimited rides.</div>':''}${dest.map(s=>{const z=s.ez||12.9,c=Math.round(Math.hypot(P.x-s.cx,P.z-z)*.06);return`<div class=pls><span>${esc(s.name)}</span><button ${S.money<c?'disabled':''} onclick="gpTaxi(${s.cx},${z})">Ride · $${c}</button></div>`}).join('')}`}</div></div>`};
gpTaxi=function(x,z){if(phModel()<12){closePhone();try{taxi(x,z)}catch(e){console.error(e)}return}
 if(typeof IN!='undefined'&&IN)return;const c=Math.round(Math.hypot(P.x-x,P.z-z)*.06);if(S.money<c){try{snd('err')}catch(e){}return say('Taxi costs $'+c)}
 closePhone();S.money=+(S.money-c).toFixed(2);P.x=x;P.z=z;camT.x=x;camT.z=z;try{closeUI()}catch(e){}try{snd('whoosh')}catch(e){}say('Taxi fare $'+c)};
/* ---- screens ---- */
{const b0=phBody;phBody=function(){const a=PH.app;if(PH.loading)return b0.apply(this,arguments);
 if(a=='sf')return`<div class=phx>${gpSf()}</div>`;if(a=='eats')return`<div class=phx>${gpEats()}</div>`;if(a=='fest')return`<div class=phx>${gpFest()}</div>`;if(a=='shop')return`<div class=phx>${gpShop()}</div>`;
 const h=b0.apply(this,arguments);if(a!='home')return h;
 /* home: badge for songs waiting to release, and the upgrade card opens the Store */
 const m=phModel(),nx=GPH[m+1],dr=(S.drafts||[]).length;let o=h;
 if(dr)o=o.replace(/(<img src="[^"]*">)(Spotifly)/,`$1$2<span class=bd>${dr}</span>`);
 o=o.replace(/<div class=pnx>[\s\S]*?<\/div><\/div>/,nx?`<div class=pnx onclick="phApp('shop')"><b>Next: Gphone ${m+1} · $${nx[0].toLocaleString()}</b><div class=sub style="color:#8aa094">${esc(GPF[m+1])}. Tap to see every model.</div></div>`:`<div class=pnx onclick="phApp('shop')"><b>You have the best Gphone</b><div class=sub style="color:#8aa094">${gpPct(m)} fan buzz and every app unlocked.</div></div>`);
 return o}}
/* Stats: show the fan buzz too */
{const s0=gpStat;gpStat=function(){const h=s0.apply(this,arguments),b=gpBuzz();return b?h.replace('<div class=pcd><h3>TOP SONGS</h3>',`<div class=pcd><h3>FAN BUZZ</h3><span class=gptg>${gpPct(phModel())}</span> <span class=sub>from your Gphone</span></div><div class=pcd><h3>TOP SONGS</h3>`):h}}
/* the Spotifly and Eats screens refresh themselves so stream counts and energy stay live */
setInterval(()=>{try{if(mode=='phone'&&(PH.app=='sf'||PH.app=='eats'||PH.app=='stat')&&!PH.loading&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||''))phR()}catch(e){}},2000);
/* ---- gphone.wf on the computer: same perk list ---- */
PA.phones=()=>{const m=phModel();return`<div style="padding:14px"><h1 style="margin:0 0 4px">Gphone</h1><p class=m>You have a <b>Gphone ${m}</b>${GP_BUZZ[m]?' ('+gpPct(m)+' fan buzz)':''}. Each model keeps everything from the one before. Open your phone with G, or buy straight from its Store app.</p><div class=cards style="display:flex;flex-wrap:wrap;gap:10px">${Object.keys(GPH).map(Number).filter(n=>n>8).map(n=>{const g=GPH[n];return`<div class=card style="min-width:190px;flex:1"><b style="font-size:16px">Gphone ${n}</b><br><b style="color:var(--g)">${esc(GPF[n])}</b><br><small class=m>Photos ${g[1]}x${g[2]} · ${g[3]?'shutter lag '+g[3]+'s':'instant shutter'}<br>${GP_LAG[n]>100?'Apps load in '+(GP_LAG[n]/1000).toFixed(1)+'s':'Apps open instantly'}</small><div style="margin:8px 0;font-weight:bold;font-size:18px">$${g[0].toLocaleString()}</div>${n<=m?`<button disabled>${n==m?'You have this':'You have a newer one'}</button>`:`<button class=go ${S.money<g[0]?'disabled':''} onclick="buyPhone(${n})">Buy now</button>`}</div>`}).join('')}</div></div>`};
