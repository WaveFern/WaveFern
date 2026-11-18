/* ---------- v49.1.0: more settings (Settings > Game) ----------
   Camera zoom (close / normal / far), always run (Shift then walks), the key hints bar, auto-pause when you switch away,
   and a 12-hour clock. Stored in OPT / fw_opt with the other settings; the keys are added to OPT_DEF here so
   Reset settings covers them, and read back from fw_opt here because 08-music.js only loads the keys it knew. */
{const D={zoom:1,run:0,hints:1,apause:1,h12:0,idlecam:1};Object.assign(OPT_DEF,D);let q=null;try{q=JSON.parse(localStorage.getItem('fw_opt'))}catch(e){}
 for(const k in D)OPT[k]=q&&typeof q[k]==typeof D[k]?q[k]:D[k]}
const optHints=()=>{try{document.body.classList.toggle('nohints',!OPT.hints)}catch(e){}};optHints();
{const st=document.createElement('style');st.textContent='body.nohints #hud .hb.hint{display:none!important}';document.head.appendChild(st)}
{const so0=stOpt;stOpt=function(k){const r=so0.apply(this,arguments);if(k=='hints')optHints();return r}}
{const rs0=stReset;stReset=function(){const r=rs0.apply(this,arguments);optHints();return r}}

/* camera zoom: the play and drive views are widened or narrowed after the normal camera step */
{const u0=update;update=function(dt){const s=keys.shift,flip=OPT.run&&mode=='play';if(flip)keys.shift=!s;let r;try{r=u0.apply(this,arguments)}finally{if(flip){if(s)keys.shift=s;else delete keys.shift}}
 const z=+OPT.zoom||1;if(z!=1&&(mode=='play'||mode=='drive')&&!(typeof IN!='undefined'&&IN)){cam.left*=z;cam.right*=z;cam.top*=z;cam.bottom*=z;cam.updateProjectionMatrix()}return r}}

/* 12-hour clock */
{const c0=clk;clk=function(){const s=c0.apply(this,arguments);if(!OPT.h12||!/^\d\d:\d\d$/.test(s))return s;const h=+s.slice(0,2);return((h+11)%12+1)+':'+s.slice(3)+(h<12?' am':' pm')}}

{const b0=stBody;stBody=function(){const h=b0.apply(this,arguments);if(STAB!='game')return h;
 const zr=`<div class=so><span>Camera zoom<small class=m>How much of the city you see around you</small></span><span style="display:flex;gap:4px">${[[.85,'Close'],[1,'Normal'],[1.2,'Far']].map(([v,t])=>`<button class="${(+OPT.zoom||1)==v?'go':''}" onclick="stOpt('zoom',${v});stDraw()">${t}</button>`).join('')}</span></div>`;
 const t=zr+stTog('Always run',OPT.run,"stOpt('run')",'Hold Shift to walk instead')+stTog('Key hints',OPT.hints,"stOpt('hints')",'The controls bar at the bottom')
  +stTog('Auto-pause',OPT.apause,"stOpt('apause')",'Pause when you switch tab or window')+stTog('12-hour clock',OPT.h12,"stOpt('h12')",'Shows 3:30 pm instead of 15:30')+stTog('Menu idle camera',OPT.idlecam,"stOpt('idlecam')",'After 60 s on the main menu, hide it and play camera shots of the stadium');
 const i=h.indexOf('<p class=m>');return i<0?h+t:h.slice(0,i)+t+h.slice(i)}}

/* ---------- main menu AFK: 60 s with no input hides the menu UI (the stadium scene keeps cycling its camera shots);
   10 min stops drawing and every timer (FWPX.freeze + sleep) until any input. Test hook: FW_MENUIDLE.set(hideMs,sleepMs), .tick(). ---------- */
{const M=window.FW_MENUIDLE={hide:60000,sleep:600000,last:performance.now(),hidden:false,sleeping:false};
 const st=document.createElement('style');st.textContent='body.fwmidle #ui,body.fwmidle #hud{opacity:0!important;pointer-events:none!important;transition:opacity 1.2s}';document.head.appendChild(st);
 const onMenu=()=>{try{return mode=='title'&&!!document.getElementById('ttl')}catch(e){return false}};
 function wake(){if(M.sleeping){M.sleeping=false;try{FWPX.wake();FWPX.thaw()}catch(e){}}if(M.hidden){M.hidden=false;document.body.classList.remove('fwmidle')}}
 M.input=()=>{M.last=performance.now();if(M.hidden||M.sleeping)wake()};
 M.set=(h,s)=>{M.hide=h;M.sleep=s};
 M.tick=()=>{if(!onMenu()||!OPT.idlecam){if(M.hidden||M.sleeping)wake();M.last=performance.now();return}
  const d=performance.now()-M.last;
  if(!M.hidden&&d>=M.hide){M.hidden=true;document.body.classList.add('fwmidle')}
  if(M.hidden&&!M.sleeping&&d>=M.sleep){M.sleeping=true;try{FWPX.freeze();FWPX.sleep()}catch(e){}}};
 ['pointerdown','pointermove','keydown','wheel','touchstart'].forEach(e=>addEventListener(e,M.input,true));
 window.setInterval(M.tick,500)}
