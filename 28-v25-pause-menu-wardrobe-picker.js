/* ---------- v25: pause menu + menu music, wardrobe colour picker ---------- */
let PS='',MENUA=null;
function pauseOverlay(on){let o=document.getElementById('pzo');if(on&&!o){o=document.createElement('div');o.id='pzo';document.body.appendChild(o)}else if(!on&&o)o.remove()}
function menuMusic(on){if(on){if(!MENUA){MENUA=new Audio('menu.mp3');MENUA.loop=true;MENUA.preload='auto';MENUA.onended=()=>{if(PAUSED){MENUA.currentTime=0;MENUA.play().catch(()=>{})}}}MENUA.volume=Math.max(0,Math.min(1,VOL));MENUA.currentTime=0;MENUA.play().catch(()=>{})}else if(MENUA)MENUA.pause()}
setInterval(()=>{if(MENUA&&!MENUA.paused)MENUA.volume=Math.max(0,Math.min(1,VOL))},100);
function pauseUI(){$('ui').innerHTML=`<div id=pzm class="box modal pzm"><h2>⏸ Paused</h2><p class=m><small>Esc to resume</small></p><button class=go onclick="resumeGame()">▶ Resume</button><button onclick="settings()">⚙ Settings</button></div>`}
function pauseGame(){if(PAUSED)return;PS=mode;PAUSED=1;mode='pause';for(const k in keys)delete keys[k];MU.hold=1;try{const a=MU.a[MU.cur];if(MU.pl&&a)a.pause()}catch(e){}menuMusic(1);pauseOverlay(1);pauseUI();snd('click')}
function resumeGame(){if(!PAUSED)return;mode=PS||'play';PS='';PAUSED=0;MU.hold=0;try{const a=MU.a[MU.cur];if(MU.pl&&a&&a.paused)a.play().catch(()=>{})}catch(e){}menuMusic(0);pauseOverlay(0);$('ui').innerHTML=''}

/* wardrobe: a few common colours + pencil for the themed picker */
const WCOL=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#f4f4f4','#111111'],B0={t:TOPC.length,j:JKC.length,p:PANTC.length,h:HTC.length,s:SHC.length};let WPK={id:null,h:0,s:1,v:1};
function addCol(c){if(!/^#[0-9a-f]{6}$/i.test(c))return;let n=0;if(!TOPC.includes(c)){TOPC.push(c);n=1}if(!JKC.includes(c)){JKC.push(c);n=1}if(!PANTC.includes(c)){PANTC.push(c);n=1}if(!HTC.some(x=>x[0]==c&&x[1]=='Custom')){HTC.push([c,'Custom']);n=1}if(!SHC.some(x=>x[0]==c&&x[1]==0&&x[2]=='Custom')){SHC.push([c,0,'Custom'],[c,1,'Custom']);n=1}if(n){S.cpal=S.cpal||[];if(!S.cpal.includes(c))S.cpal.push(c)}}
{const eq0=equip;equip=function(id,col){addCol(col||GM[id].dc);return eq0(id,col)}
 const lc0=loadCode;loadCode=function(c){try{const d=JSON.parse(decodeURIComponent(escape(atob(c.trim().slice(4)))));TOPC.length=B0.t;JKC.length=B0.j;PANTC.length=B0.p;HTC.length=B0.h;SHC.length=B0.s;S.cpal=[];(d.S.cpal||[]).forEach(addCol)}catch(e){}return lc0(c)}}
const wpWorn=id=>(S.wn||{})[GM[id].slot]==id;
function wpPick(id,hex){WPK.id=null;S.wc=S.wc||{};S.wc[id]=hex;if(wpWorn(id)){equip(id,hex);refresh();snd('pop')}wrR()}
function wpOpen(id){if(WPK.id==id)WPK.id=null;else Object.assign(WPK,hex2hsv((S.wc||{})[id]||GM[id].dc),{id});wrR()}
function wpHTML(){return`<div class=cp><div class=cpsv id=wpsv style="background:linear-gradient(to top,#000,#0000),linear-gradient(to right,#fff,hsl(${WPK.h},100%,50%))" onpointerdown="wpDrag(event,'sv')"><b id=wpsvt style="left:${WPK.s*100}%;top:${(1-WPK.v)*100}%"></b></div><div class=cph id=wph onpointerdown="wpDrag(event,'h')"><b id=wpht style="left:${WPK.h/359.9*100}%"></b></div><span class=wph id=wphex>${hsv2hex(WPK.h,WPK.s,WPK.v)}</span></div>`}
function wpDrag(e,t){const el=e.currentTarget,id=WPK.id;el.setPointerCapture(e.pointerId);let done=0;
 const mv=ev=>{const r=el.getBoundingClientRect(),x=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height));if(t=='h')WPK.h=x*359.9;else{WPK.s=x;WPK.v=1-y}
  const hex=hsv2hex(WPK.h,WPK.s,WPK.v);S.wc=S.wc||{};S.wc[id]=hex;$('wpsv').style.background=`linear-gradient(to top,#000,#0000),linear-gradient(to right,#fff,hsl(${WPK.h},100%,50%))`;$('wpsvt').style.left=WPK.s*100+'%';$('wpsvt').style.top=(1-WPK.v)*100+'%';$('wpht').style.left=WPK.h/359.9*100+'%';$('wphex').textContent=hex;
  const card=document.querySelector(`.wrg [data-gid="${id}"]`);if(card){const pen=card.querySelector('.pen');if(pen)pen.style.background=hex;const cv=card.querySelector('canvas.pv');if(cv){cv.dataset.k='k:'+id+'|'+hex;delete cv.dataset.d}}};
 const fin=()=>{if(done)return;done=1;el.onpointermove=null;if(wpWorn(id)){equip(id,S.wc[id]);refresh()}wrR()};
 mv(e);el.onpointermove=mv;el.onpointerup=fin;el.onlostpointercapture=fin}
function wrR(){if(!document.querySelector('.wrd'))WPK.id=null;const own=GAR.filter(g=>S.wr.includes(g.id)&&g.slot==WT),wn=S.wn||{},sc=(document.getElementById('wrg')||{}).scrollTop||0,cnt=k=>GAR.filter(g=>S.wr.includes(g.id)&&g.slot==k).length;
 $('ui').innerHTML=`<div class="box modal wrd"><div class=wrh><h2>Wardrobe</h2><span class=m>${S.wr.length} pieces owned</span><button onclick="closeUI()" style="margin-left:auto">Close ✕</button></div><div class=wrw>${WSL2.map(t=>{const id=wn[t[0]],g=id&&GM[id];return`<div class="wrs ${g?'on':''}" onclick="WT='${t[0]}';wrR()"><small>${t[1]}</small><b>${g?esc(g.n):'nothing'}</b>${g&&t[0]!='top'?`<i onclick="event.stopPropagation();unq('${t[0]}')">take off</i>`:''}</div>`}).join('')}</div><div class=wrt>${WSL2.map(t=>`<button class="${WT==t[0]?'go':''}" onclick="WT='${t[0]}';wrR()">${t[1]} (${cnt(t[0])})</button>`).join('')}</div><div id=wrg class="thg wrg">${own.map(g=>{const cur=(S.wc||{})[g.id]||g.dc,on=wn[g.slot]==g.id,cu=!WCOL.includes(cur),open=WPK.id==g.id;return`<div class="thc2 ${on?'worn':''}" data-gid="${g.id}"><div class=thp style="--pvb:transparent">${pvc('k:'+g.id+'|'+cur,150)}</div><div class=thn>${esc(g.n)}${on?' <small style="color:#d81b60">· wearing</small>':''}</div><div class=thsw>${WCOL.map(c=>`<i class="${c==cur?'on':''}" style="background:${c}" onclick="wpPick('${g.id}','${c}')"></i>`).join('')}<i class="pen ${cu||open?'on':''}" ${cu?`style="background:${cur}"`:''} title="Custom colour" onclick="wpOpen('${g.id}')">${PEN}</i></div>${open?wpHTML():''}<button class=go onclick="wearG('${g.id}');wrR()">${on?'Wearing ✓':'Wear'}</button></div>`}).join('')||'<p class=m style="grid-column:1/-1">Nothing here yet. Buy clothes on the Threadz website (laptop, Browser). Every piece you own can be recoloured here for free.</p>'}</div></div>`;const g=document.getElementById('wrg');if(g)g.scrollTop=sc}

/* v24.4: the garage hides while you are inside the house, so it no longer blocks the studio */
/* v25.5: no garage structure until it is bought. Until then the plot is empty: no meshes and no invisible wall. */
let GARCOL=null,GPOI=null;
{const wt6=worldTick;worldTick=function(dt){wt6(dt);GARM.forEach(m=>m.visible=!!S.garage&&!HIN);GARM2.forEach(m=>m.visible=!!S.garage);{const gi=POIS.findIndex(q=>q[2]=='Garage');if(!S.garage&&gi>=0)GPOI=POIS.splice(gi,1)[0];else if(S.garage&&gi<0&&GPOI)POIS.push(GPOI)}if(!GARCOL)GARCOL=cols.find(c=>c[0]==17.5&&c[1]==1.5&&c[2]==27.5&&c[3]==7)||0;if(GARCOL){const on=!!S.garage;GARCOL[0]=on?17.5:-9e3;GARCOL[1]=on?1.5:-9e3;GARCOL[2]=on?27.5:-9e3;GARCOL[3]=on?7:-9e3}}}

/* v24.4.1: a continuous low wall along the front (south) edge of the ground floor, shown while inside the house.
   The collision there was already solid; this closes the visible opening. */
const FRW=B(WORLD,16,1.1,.3,'#9aa0a8',8,.55,11.95);
{const wt7=worldTick;worldTick=function(dt){wt7(dt);FRW.visible=HIN}}
/* v25.5: the right-hand (east) wall is hidden while you are inside, which left that side open. A low wall in its place closes it while you can still see in. */
const ERW=B(WORLD,.3,1.1,12,'#d8c7a6',16.15,.55,6);
{const wt8=worldTick;worldTick=function(dt){wt8(dt);ERW.visible=HIN}}
/* v25.8: a proper front door in the front wall, seen from inside (matches the outside door). */
const FDI=[B(WORLD,1.8,2.3,.14,'#5a3a22',6,1.15,11.74),B(WORLD,.18,2.4,.3,'#d8c7a6',5,1.2,11.75),B(WORLD,.18,2.4,.3,'#d8c7a6',7,1.2,11.75),B(WORLD,2.2,.2,.3,'#d8c7a6',6,2.45,11.75),B(WORLD,.12,.12,.1,'#e6b422',6.6,1.1,11.64)];
{const wt9=worldTick;worldTick=function(dt){wt9(dt);FDI.forEach(m=>m.visible=HIN)}}
