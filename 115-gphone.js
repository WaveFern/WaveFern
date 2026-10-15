/* ===== v26.135: Gphone, camera, photos; five new collab people; art gallery curator look =====
   Press G to open your phone (not while driving, on the computer, recording, at a festival or in a cutscene).
   Apps: Messages and Instagrime (the computer's own pages shown in the phone), Camera (selfies with anyone, or a photo of the world),
   Photos (everything you took, post any to Instagrime). You start with a laggy Gphone 8; Gphone 9-18 are sold on Amazoom.
   Camera quality (photo size in pixels and shutter lag) rises with the model.
   Saves: S.phone (model, missing = 8) and S.photos (missing = none). */
const GPH={8:[0,24,18,1.4],9:[250,28,21,1.1],10:[450,32,24,.9],11:[650,36,27,.7],12:[850,40,30,.5],13:[1100,48,36,.4],14:[1400,56,42,.25],15:[1750,64,48,.15],16:[2000,72,54,.1],17:[2250,80,60,0],18:[2500,96,72,0]};/* [price, photo w, h, shutter lag s] */
const phModel=()=>{const m=S&&S.phone;return GPH[m]?m:8};
const phPhotos=()=>{if(!S)return[];if(!Array.isArray(S.photos))S.photos=[];return S.photos};
const PH={app:'home',cam:'self',who:-1,busy:0,view:null,last:null};
const PH_MAX=30;
/* ---- shop: appended to the Amazoom page ---- */
function buyPhone(n){const m=phModel(),g=GPH[n];if(!g||n<=m)return;if(S.money<g[0]){try{snd('err')}catch(e){}return say('Not enough money.')}
 S.money=+(S.money-g[0]).toFixed(2);S.phone=n;try{updateVersion()}catch(e){}try{chime()}catch(e){}say('Bought a Gphone '+n+'. Press G to use it.');pcR()}
{const a0=PA.amz;PA.amz=function(){const h=a0.apply(this,arguments);try{if(typeof h!='string')return h;const m=phModel();
 const cards=Object.keys(GPH).map(Number).filter(n=>n>8).map(n=>{const g=GPH[n];return`<div class=card style="min-width:150px"><b>Gphone ${n}</b><br><small class=m>Photos ${g[1]}x${g[2]}${g[3]?' · shutter lag '+g[3]+'s':' · instant shutter'}</small><div style="margin:6px 0;font-weight:bold">$${g[0].toLocaleString()}</div>${n<=m?`<button disabled>${n==m?'You have this':'Owned model beats it'}</button>`:`<button class=go ${S.money<g[0]?'disabled':''} onclick="buyPhone(${n})">Buy</button>`}</div>`}).join('');
 return h+`<div style="margin-top:12px;padding:10px;background:#fff;color:#111;border-radius:6px"><b style="font-size:16px">Gphones</b> <small>You have a Gphone ${m}. Newer models take sharper photos with less lag.</small><div class=cards style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${cards}</div></div>`}catch(e){console.error('gphone shop',e);return h}}}
/* ---- opening and closing ---- */
function openPhone(){if(mode!='play')return;mode='phone';PH.app='home';PH.view=null;PH.last=null;phR();try{snd('pop')}catch(e){}}
function closePhone(){const e=document.getElementById('ph');if(e)e.remove();if(mode=='phone')mode='play'}
function phApp(a){if(a=='cam')return openCamera();PH.app=a;PH.view=null;if(a=='ig'){igv='feed'}if(a=='msg'){ncv=false}phR()}
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;const k=e.key.toLowerCase();
 if(PH.camOn){e.stopImmediatePropagation();e.preventDefault();if(k=='g'||k=='escape')return closeCamera();if((k==' '||k=='enter')&&!e.repeat)return phShoot();PK[k]=1;return}
 if(mode=='phone'&&(k=='escape'||k=='g')){e.stopImmediatePropagation();e.preventDefault();closePhone();return}
 if(k=='g'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&mode=='play'&&typeof S!='undefined'&&S&&!document.getElementById('load')){openPhone()}},true);
/* handlers inside Messages and Instagrime redraw with pcR(); while the phone is open that draws the phone instead */
{const p0=pcR;pcR=function(){if(mode=='phone')return phR();return p0.apply(this,arguments)}}
/* ---- drawing ---- */
{const st=document.createElement('style');st.textContent=`#ph{position:fixed;right:14px;bottom:14px;width:min(460px,calc(100vw - 28px));height:min(680px,calc(100vh - 28px));z-index:70;display:flex;flex-direction:column;background:#0c0f0d;border:3px solid #000;border-radius:22px;box-shadow:6px 6px 0 #0007;overflow:hidden;color:var(--t,#e8f3ec)}
#ph .phs{display:flex;justify-content:space-between;padding:6px 16px;background:#000;font-size:12px;color:#8aa094}
#ph .phb{flex:1;min-height:0;position:relative;overflow:auto}#ph .phb .phx{position:absolute;inset:0;overflow:auto}
#ph .phb .chat .cl{width:150px}#ph .phb .ig{max-width:none;border:0;border-radius:0;min-height:100%}
#ph .phn{display:flex;gap:8px;justify-content:center;padding:8px;background:#000}
#ph .phh{padding:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
#ph .phi{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;box-shadow:none;font-size:12px;color:var(--t,#e8f3ec);position:relative}
#ph .phi img{width:56px;height:56px;image-rendering:pixelated}#ph .phi .t{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid #000;overflow:hidden}
#ph .phi .t img{width:36px;height:36px;image-rendering:pixelated}
#ph .phi .bd{position:absolute;top:-4px;right:6px;background:#e03a3a;color:#fff;border-radius:9px;padding:0 6px;font-size:11px}
#ph .phc{padding:12px;display:flex;flex-direction:column;gap:10px}#ph .phc select{padding:6px;background:#0a0d0b;color:var(--t,#e8f3ec);border:2px solid #333}
#ph .phv{width:100%;image-rendering:pixelated;border:2px solid #000;background:#000}
#ph .phg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:12px}#ph .phg img{width:100%;image-rendering:pixelated;border:2px solid #000;cursor:pointer;display:block}`;document.head.appendChild(st)}
function phTitle(){const a={home:'Home',msg:'Messages',ig:'Instagrime',cam:'Camera',pho:'Photos'}[PH.app];return`<div class=phs><span>Gphone ${phModel()}</span><span>${a}</span></div>`}
function phBody(){const m=phModel();
 if(PH.app=='msg')return`<div class=phx>${PA.msg()}</div>`;
 if(PH.app=='ig')return`<div class=phx>${PA.ig()}</div>`;
 if(PH.app=='cam')return phCamUI();
 if(PH.app=='pho')return phPhoUI();
 const un=(S.msgs||[]).filter(x=>x.unread).length;
 return`<div class=phh>${[['msg','Messages',IC.msg,un],['ig','Instagrime',IC.ig,0],['cam','Camera',IC.cam,0],['pho','Photos',IC.pho,0]].map(a=>`<button class=phi onclick="phApp('${a[0]}')"><img src="${a[2]}">${a[1]}${a[3]?`<span class=bd>${a[3]}</span>`:''}</button>`).join('')}</div><p class=m style="padding:0 16px"><small>Gphone ${m}${m==8?' (laggy). Upgrade on Amazoom.':''}. Photos ${GPH[m][1]}x${GPH[m][2]}.</small></p>`}
function phR(){let e=document.getElementById('ph');if(!e){e=document.createElement('div');e.id='ph';document.body.appendChild(e)}
 const sc=e.querySelector('.phb'),st=sc?sc.scrollTop:0;
 e.innerHTML=phTitle()+`<div class=phb>${phBody()}</div><div class=phn><button onclick="phApp('home')">Home</button><button onclick="closePhone()">Close (G)</button></div>`;
 const b=e.querySelector('.phb');if(b&&st)b.scrollTop=st;
 try{const cv=document.getElementById('cv');if(cv)cv.scrollTop=cv.scrollHeight}catch(x){}
 try{if(PH.app=='ig'){const u=pxURL(S.pfpIg);if(u){const d=pxDef();e.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')===d)i.src=u})}}}catch(x){}}
/* chat replies arrive on timers that only redraw the computer, so the phone's Messages refreshes itself */
setInterval(()=>{try{if(mode=='phone'&&PH.app=='msg'&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||''))phR()}catch(e){}},3000);
setInterval(()=>{try{if(typeof S!='undefined'&&S&&mode=='play'&&!S.phHint&&!document.getElementById('load')){S.phHint=1;say('Press G for your Gphone.')}}catch(e){}},5000);
/* ---- camera: a full-screen viewfinder like a phone camera. PHOTO is first person (walk with W/S, turn with A/D, tilt with R/F);
   SELFIE puts the camera in front of you with the arm out, optionally with a friend standing beside you. Space or Enter (or the shutter) takes the photo. ---- */
{const px=(r,p)=>{const c=document.createElement('canvas');c.width=r[0].length;c.height=r.length;const x=c.getContext('2d');r.forEach((l,y)=>[...l].forEach((h,i)=>{if(p[h]){x.fillStyle=p[h];x.fillRect(i,y,1,1)}}));return c.toDataURL()};
 IC.cam=px(['..........','...DDDD...','.DDDDDDDD.','DDDWWWWDDD','DDWBBBBWDD','DDWBLLBWDD','DDWBBBBWDD','DDDWWWWDDD','DDDDDDDDDD','..........'],{D:'#6b7480',W:'#e8f3ec',B:'#1b2733',L:'#7fd0ff'});
 IC.pho=px(['..........','WWWWWWWWWW','WSSSSSSYSW','WSSSSSSSSW','WSSMSSSSSW','WSMMMSMSSW','WMMMMMMMGW','WGGGGGGGGW','WWWWWWWWWW','..........'],{W:'#e8f3ec',S:'#5ab4f0',Y:'#ffd23f',M:'#4a8f5a',G:'#2fae5a'})}
const PHC=new THREE.PerspectiveCamera(62,1,.1,600),PK={},CB_L=84,CB_R=150;
PH.x=0;PH.z=0;PH.yaw=0;PH.pitch=0;PH.fr=null;PH.frWho=-2;
function openCamera(){const e=document.getElementById('ph');if(e)e.remove();mode='play';PH.camOn=1;PH.x=P.x;PH.z=P.z;PH.yaw=P.rot;PH.pitch=0;PH.busy=0;document.body.classList.add('phcam');phCamR()}
function closeCamera(back){PH.camOn=0;document.body.classList.remove('phcam');const e=document.getElementById('phcam');if(e)e.remove();if(PH.fr){scene.remove(PH.fr.g);PH.fr=null;PH.frWho=-2}if(P.mesh)P.mesh.visible=true;for(const k in PK)delete PK[k];if(back)openPhone()}
function phCamR(){let e=document.getElementById('phcam');if(!e){e=document.createElement('div');e.id='phcam';document.body.appendChild(e)}
 const L=phPhotos(),last=L[L.length-1],g=GPH[phModel()],seen=new Set(),ch2=[];
 (S.msgs||[]).forEach(x=>{if(x.a!==undefined&&!seen.has(x.a)){seen.add(x.a);ch2.push(x.a)}});
 const rest=ART.map((a,i)=>i).filter(i=>!seen.has(i)).sort((a,b)=>ART[a][0].localeCompare(ART[b][0])),opt=i=>`<option value="${i}" ${PH.who==i?'selected':''}>${esc(ART[i][0])}</option>`;
 e.innerHTML=`<div class="pcb pl"><button onclick="closeCamera(1)">✕</button>${PH.cam=='self'?`<select onchange="PH.who=+this.value;this.blur()"><option value="-1" ${PH.who<0?'selected':''}>Just me</option>${ch2.length?`<optgroup label="Your chats">${ch2.map(opt).join('')}</optgroup>`:''}<optgroup label="Everyone">${rest.map(opt).join('')}</optgroup></select>`:''}<small>Gphone ${phModel()}<br>${g[1]}x${g[2]}</small></div>
 <div class="pcb pr"><button class=pfl title="Flip camera" onclick="PH.cam=PH.cam=='self'?'land':'self';phCamR()">⟲</button><div class=pmd><button class="${PH.cam=='self'?'on':''}" onclick="PH.cam='self';phCamR()">SELFIE</button><button class="${PH.cam=='land'?'on':''}" onclick="PH.cam='land';phCamR()">PHOTO</button></div><button class=psh ${PH.busy?'disabled':''} onclick="phShoot()"><i></i></button>${last?`<img class=pth src="${pxURL(last.c,2)}" onclick="closeCamera();openPhone();phApp('pho')">`:'<span class=pth></span>'}</div><div id=pfla></div>`}
{const st=document.createElement('style');st.textContent=`body.phcam #hud{display:none}#phcam{position:fixed;inset:0;z-index:70;pointer-events:none;font-family:system-ui,sans-serif}
#phcam .pcb{position:absolute;top:0;bottom:0;background:#000;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:14px 6px;box-sizing:border-box;color:#fff}
#phcam .pl{left:0;width:${CB_L}px}#phcam .pr{right:0;width:${CB_R}px}#phcam .pl select{width:74px;font-size:11px;background:#222;color:#fff;border:1px solid #555}#phcam small{color:#aaa;text-align:center;font-size:11px}
#phcam button{background:none;border:0;box-shadow:none;color:#fff;cursor:pointer}#phcam .pfl{font-size:26px;border:2px solid #fff;border-radius:8px;width:48px;height:36px}
#phcam .pmd{display:flex;flex-direction:column;gap:22px}#phcam .pmd button{writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:2px;font-size:15px;font-weight:600;color:#fff}#phcam .pmd button.on{color:#ffd60a}
#phcam .psh{width:76px;height:76px;border-radius:50%;background:#fff;border:4px solid #fff!important;padding:0;display:flex;align-items:center;justify-content:center}#phcam .psh i{width:62px;height:62px;border-radius:50%;border:3px solid #000;display:block}#phcam .psh:active i{background:#ddd}#phcam .psh:disabled{opacity:.6}
#phcam .pth{width:56px;height:56px;border-radius:8px;border:2px solid #fff;object-fit:cover;image-rendering:pixelated;background:#222}#pfla{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .35s}`;document.head.appendChild(st)}
/* camera pose: first person for PHOTO, in front of you at arm's length for SELFIE */
function phFriend(){const w=PH.cam=='self'?PH.who:-1;if(PH.frWho===w)return;if(PH.fr){scene.remove(PH.fr.g);PH.fr=null}PH.frWho=w;if(w>=0){try{const o=buildChar(Object.assign({},ART[w][4]));scene.add(o.g);PH.fr=o}catch(e){console.error('selfie friend',e)}}}
function phCamPose(){PHC.aspect=innerWidth/innerHeight;PHC.fov=PH.cam=='self'?70:62;PHC.updateProjectionMatrix();const self=PH.cam=='self';if(P.mesh)P.mesh.visible=self;phFriend();
 if(self){const f=[Math.sin(P.rot),Math.cos(P.rot)],r=[f[1],-f[0]],fo=PH.fr?.38:0;
  if(PH.fr){PH.fr.g.position.set(P.x+r[0]*.78,0,P.z+r[1]*.78);PH.fr.g.rotation.y=P.rot}
  try{P.arms[0].rotation.x=-2.5}catch(e){}
  PHC.position.set(P.x+r[0]*fo+f[0]*1.5,1.75,P.z+r[1]*fo+f[1]*1.5);PHC.lookAt(P.x+r[0]*fo,1.3,P.z+r[1]*fo)}
 else{PHC.position.set(P.x,1.6,P.z);PHC.lookAt(P.x+Math.sin(PH.yaw)*10,1.6+Math.tan(PH.pitch)*10,P.z+Math.cos(PH.yaw)*10)}}
{const r0=renderer.render.bind(renderer);renderer.render=function(sc,c){if(PH.camOn&&sc===scene&&c===cam){try{phCamPose()}catch(e){console.error('camera pose',e)}return r0(sc,PHC)}return r0(sc,c)}}
{const u0=update;update=function(dt){
 if(PH.camOn){if(mode!='play')closeCamera();else{for(const k in keys)delete keys[k];
  if(PH.cam=='land'){const sp=(PK.shift?5:2.6)*dt;if(PK.a||PK.arrowleft)PH.yaw+=1.6*dt;if(PK.d||PK.arrowright)PH.yaw-=1.6*dt;if(PK.r)PH.pitch=Math.min(.6,PH.pitch+.8*dt);if(PK.f)PH.pitch=Math.max(-.6,PH.pitch-.8*dt);
   const m=(PK.w||PK.arrowup?1:0)-(PK.s||PK.arrowdown?1:0);if(m){const dx=Math.sin(PH.yaw)*m*sp,dz=Math.cos(PH.yaw)*m*sp;if(!hit(P.x+dx,P.z,.28))P.x+=dx;if(!hit(P.x,P.z+dz,.28))P.z+=dz}P.rot=PH.yaw}}}
 return u0(dt)}}
addEventListener('keyup',e=>{delete PK[e.key.toLowerCase()]});addEventListener('blur',()=>{for(const k in PK)delete PK[k]});
function phFlash(){const f=document.getElementById('pfla');if(!f)return;f.style.transition='none';f.style.opacity=.9;requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition='opacity .35s';f.style.opacity=0}))}
function phNew(c,kind,who){const L=phPhotos(),id=(S.phId=(S.phId||0)+1);L.push({id,c,k:kind,w:who||'',d:S.day,gp:phModel()});while(L.length>PH_MAX)L.shift();PH.last=id;return id}
function phSoften(img){/* low models are blurry and dull */const m=phModel(),b=m<=9?1.6:m<=11?.9:m<=13?.4:0;if(!b)return img;const w=img.width||img.naturalWidth,h=img.height||img.naturalHeight,k=document.createElement('canvas');k.width=w;k.height=h;const x=k.getContext('2d');try{x.filter='blur('+b+'px) brightness('+(m<=9?.9:.97)+')'}catch(e){}x.drawImage(img,0,0,w,h);return k}
function phShoot(){if(PH.busy||!PH.camOn)return;const g=GPH[phModel()];PH.busy=1;phCamR();
 setTimeout(()=>{try{renderer.render(scene,cam);const cv=renderer.domElement,sx=Math.round(CB_L/innerWidth*cv.width),sw=Math.round((innerWidth-CB_L-CB_R)/innerWidth*cv.width),k=document.createElement('canvas');k.width=sw;k.height=cv.height;k.getContext('2d').drawImage(cv,sx,0,sw,cv.height,0,0,sw,cv.height);
  const c=pxFromImage(phSoften(k),g[1],g[2]);phNew(c,PH.cam=='self'?'self':'land',PH.cam=='self'&&PH.who>=0?ART[PH.who][0]:'');try{snd('pop')}catch(e){}phFlash()}catch(e){console.error('photo',e);say('The camera glitched. Try again.')}
  PH.busy=0;if(PH.camOn)phCamR()},Math.max(60,g[3]*1000))}
/* ---- photos ---- */
function phPhoUI(){const L=phPhotos().slice().reverse(),m=phModel();
 if(PH.view){const p=L.find(q=>q.id==PH.view);if(p){const w=GPH[p.gp]?GPH[p.gp][1]:48;return`<div class="phx phc"><img class=phv src="${pxURL(p.c,Math.max(2,Math.floor(400/w)))}"><small class=m>${p.k=='self'?(p.w?'Selfie with '+esc(p.w):'Selfie'):'Landscape'} · Day ${p.d} · Gphone ${p.gp}</small><div style="display:flex;gap:8px;flex-wrap:wrap"><button class=go onclick="phPost(${p.id})">Post to Instagrime</button><button onclick="phDel(${p.id})">Delete</button><button onclick="PH.view=null;phR()">Back</button></div></div>`}}
 if(!L.length)return`<div class="phx phc"><p class=m>No photos yet. Take some with the Camera app.</p></div>`;
 return`<div class=phx><div class=phg>${L.map(p=>`<img src="${pxURL(p.c,3)}" onclick="phView(${p.id})">`).join('')}</div></div>`}
function phView(id){PH.app='pho';PH.view=id;phR()}
function phDel(id){S.photos=phPhotos().filter(p=>p.id!=id);PH.view=null;if(PH.last==id)PH.last=null;phR()}
function phPost(id){const p=phPhotos().find(q=>q.id==id);if(!p)return;if(S.lastPost==S.day){try{snd('err')}catch(e){}return say('One post per day.')}
 PXP={c:p.c,cap:pick(CAPS)};PH.app='ig';igv='pxnew';phR()}

/* ===== five new people who ask to collab (appended to ART: saves refer to artists by index) =====
   Early to mid game, picked more often than the made-up filler artists, whose DM weight is trimmed a little. */
const NEWP_SHOES=(()=>{SHC.push(['#cf9a48',1,'Custom']);return SHC.length-1})();
[
 ['John Dodds','Rock',30,12,{hair:1,hc:1,hc_custom:'#6b4a2a',eyes:0,mouth:0,top:0,tc:1,pc:0,skin:0,body:.7,hgt:.55},'goofy'],
 ['Sochi Irukwu','R&B',420,120,{hair:19,hc:0,eyes:0,mouth:0,top:0,tc:6,pc:4,skin:5,body:.1,hgt:.75},'chill'],
 ['Gutch','Hip-Hop',2500,600,{hair:17,hc:1,hc_custom:'#5a3a22',eyes:4,mouth:0,top:0,tc:5,tc_custom:'#f4f4f4',pc:5,pc_custom:'#3f6fa8',bt:3,sh:NEWP_SHOES,shs:8,skin:1,body:.2,hgt:.45},'hype'],
 ['Billy Butler','Pop',8000,1700,{hair:15,hc:1,hc_custom:'#6b4a2a',eyes:0,mouth:0,top:1,tc:6,pc:0,skin:0,body:.55,hgt:.78},'chill'],
 ['Amir Suenu','Electronic',20000,4200,{hair:1,hc:0,eyes:0,mouth:0,top:0,tc:3,pc:0,skin:4,body:.7,hgt:.27,smelly:1},'shy']
].forEach(a=>ART.push([a[0],a[1],a[2],a[3],a[4],a[5],'',0,0,2.5]));
ART.forEach(a=>{if(!a[8]&&a[9]===undefined)a[9]=.6});/* made-up filler artists come up a bit less than before */
/* Amir's smell cloud: a small green cloud above his head on the 3D model */
{const b0=buildChar;buildChar=function(c){const r=b0.apply(this,arguments);try{if(c&&c.smelly&&r&&r.g&&!r.g.userData.smelly){r.g.userData.smelly=1;
 [[.5,.2,.4,0,1.98,0],[.34,.18,.3,-.3,1.94,.05],[.34,.18,.3,.3,1.94,-.05],[.3,.14,.26,.05,2.14,0],[.2,.1,.2,-.18,2.12,.04]].forEach(p=>B(r.g,p[0],p[1],p[2],'#8fdc5a',p[3],p[4],p[5]))}}catch(e){}return r}}
/* the art gallery shop keeper: tall, skinny, glasses, semi-curly salt and pepper hair (the tower gallery curator is set in 57) */
{const CUR={hair:15,hc:0,hc_custom:'#5a5b62',eyes:5,mouth:0,top:2,tc:1,pc:0,skin:3,body:.1,hgt:.75};
 const i0=interior;interior=function(i,fl,wl,items,cl,kc,kn,act){if(/^Odile/.test(String(kn)))kc=CUR;return i0.call(this,i,fl,wl,items,cl,kc,kn,act)}}
