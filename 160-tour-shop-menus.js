/* ===== v45.3.0: tour city menus with their own look, souvenirs you can place, steady shop doors =====
   - Souvenir shops open a gift-shop counter (kraft paper, striped awning in the city's colour, price tags and a spinning
     preview of each keepsake). Restaurants open a printed paper menu, cafés a chalkboard. Other shops keep the plain menu.
   - Every souvenir is a real model per city (postcard on an easel, snow globe, T-shirt on a stand, fridge magnet board),
     kept in F as hidden entries (not sold on Amazoom). Buying one puts it in Storage at home, where it is placed like
     furniture. Souvenirs bought before this version (S.dcity.souv) are added to Storage once (S.dcity.svm).
   - Doors: after walking through a door you land clear of the way back, and for a moment (or while E is held down) the
     door and exit prompts ignore the key, so a held or double press no longer bounces you in and out. */
(()=>{
const D=window.DCITY;if(!D||typeof F=='undefined'||typeof WT_DEST=='undefined')return;

/* ---------- souvenir models ---------- */
const SVT=[['pc',p=>'Postcard of '+p,4],['gl',()=>'Snow globe',18],['ts',()=>'Local T-shirt',28],['mg',()=>'Fridge magnet',6]];
const svKey=(id,t)=>'sv_'+id+'_'+t,svType=n=>/^Postcard/.test(n)?'pc':/^Snow globe/.test(n)?'gl':/T-shirt/.test(n)?'ts':/magnet/i.test(n)?'mg':null;
const GLASS=new THREE.MeshPhongMaterial({color:'#e8f6ff',transparent:true,opacity:.28,shininess:90,depthWrite:false});
function svModel(t,pal){const[sky,st,ac,ne]=pal;
 if(t=='pc')return{w:.5,d:.4,b:[[.05,1,.05,'#8a5a32',-.18,.5,.06],[.05,1,.05,'#8a5a32',.18,.5,.06],[.05,.95,.05,'#7a4a28',0,.47,-.16],[.46,.05,.12,'#8a5a32',0,.42,.08],
  [.44,.32,.03,'#f4f0e6',0,.61,.1],[.36,.18,.02,sky,0,.65,.12],[.07,.09,.02,st,-.12,.6,.135],[.05,.13,.02,st,-.05,.62,.135],[.08,.07,.02,dkc(st),.04,.59,.135],[.05,.11,.02,st,.12,.61,.135],
  [.04,.04,.02,'*'+ac,.12,.7,.135],[.3,.03,.02,ac,0,.495,.12]]};
 if(t=='gl')return{w:.45,d:.45,b:[[.42,.6,.42,'#2a2a30',0,.3,0],[.46,.04,.46,ac,0,.62,0],[.26,.08,.26,'#5a3a22',0,.68,0],[.14,.04,.02,'#e6b422',0,.68,.135],
  [.2,.02,.2,'#ffffff',0,.73,0],[.07,.14,.07,ac,0,.8,0],[.035,.07,.035,ne,0,.905,0],[.04,.05,.04,'#3a8a4a',-.07,.765,.04]],
  fx:g=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.16,18,12),GLASS);m.position.set(0,.86,0);g.add(m);[[.06,.95,.03],[-.05,.9,-.05],[.02,1,-.04],[-.08,.84,.06],[.09,.86,-.02]].forEach(([x,y,z])=>B(g,.015,.015,.015,'#ffffff',x,y,z))}};
 if(t=='ts')return{w:.6,d:.35,b:[[.4,.04,.3,'#333',0,.02,0],[.04,.9,.04,'#888',0,.47,0],[.42,.5,.06,ac,0,1.1,0],[.14,.16,.06,ac,-.27,1.27,0],[.14,.16,.06,ac,.27,1.27,0],
  [.14,.03,.065,dkc(ac),0,1.355,0],[.22,.16,.02,ne,0,1.14,.04],[.12,.06,.02,'#ffffff',0,1.14,.055]]};
 return{w:.5,d:.3,b:[[.4,.04,.25,'#444',0,.02,0],[.05,.7,.05,'#999',0,.37,0],[.42,.5,.04,'#eef0f2',0,.95,0],[.03,.3,.03,'#b8bcc2',.17,.95,.035],
  [.14,.1,.03,ac,-.05,1.04,.035],[.06,.05,.02,ne,-.05,1.04,.058],[.09,.09,.03,sky,.05,.86,.035],[.05,.03,.02,st,.05,.84,.055]]}}
function dkc(c){try{return '#'+new THREE.Color(c).multiplyScalar(.7).getHexString()}catch(e){return c}}
WT_DEST.forEach(d=>{const pal=d.pal||['#9bb7d4','#3b3f47','#ffcc33','#ff3355'],place=d.city||d.country;
 SVT.forEach(([t,nm,p])=>{const k=svKey(d.id,t);if(F[k])return;const m=svModel(t,pal);
  Object.defineProperty(F,k,{enumerable:false,writable:true,configurable:true,value:Object.assign({n:(t=='pc'?nm(place):nm(place)+' · '+place),p,sv:1},m)})})});

/* souvenirs bought before v45.3.0 go into Storage once */
function svSync(){if(typeof S=='undefined'||!S||!S.dcity||S.dcity.svm)return;S.inv=S.inv||{};
 (S.dcity.souv||[]).forEach(k=>{const i=k.indexOf(':'),id=k.slice(0,i),t=svType(k.slice(i+1)),fk=t&&svKey(id,t);if(fk&&F[fk])S.inv[fk]=(S.inv[fk]||0)+1});S.dcity.svm=1}

/* ---------- menus ---------- */
const lum=c=>{try{const o=new THREE.Color(c);return .299*o.r+.587*o.g+.114*o.b}catch(e){return .5}};
let T=null;
function souvItems(C){const place=C.d.city||C.d.country;return SVT.map(([t,nm,p])=>{const n=nm(place);return{t,n,p,k:svKey(C.id,t),own:(S.dcity.souv||[]).includes(C.id+':'+n)}})}
function menuItems(C,sp){const F2=D.food(C.id);return sp.k=='cafe'?[F2[2],['Coffee',4,5,1],['Cake',6,8]].filter(Boolean):F2}
function render(){if(!T)return;const{C,sp}=T,d=C.d,place=d.city||d.country,pal=d.pal||['#9bb7d4','#3b3f47','#ffcc33','#ff3355'],hi=D.words(C.s.lang).hi;mode='menu';
 const ac=pal[2],vars=`--ac:${ac};--act:${lum(ac)>.6?'#2a1808':'#fff'};--ne:${pal[3]}`,money=`<span>${$$(S.money)}</span>`,leave=`<button class=tsm-x onclick="closeUI()">Leave</button>`;
 let h;
 if(sp.k=='souv'){const it=souvItems(C);
  h=`<div class="modal tsm sv" style="${vars}"><div class=tsm-aw></div><div class=tsm-hd><div class=tsm-k>Gifts &amp; souvenirs</div><h2>${esc(sp.n||'Souvenirs')}</h2><div class=tsm-g>"${esc(hi)}! A little something from ${esc(place)}?"</div></div>
  <div class=tsm-grid>${it.map((x,i)=>`<div class="tsm-it${x.own?' own':''}"><div class=tsm-tag>${$$(x.p)}</div><canvas class=tsm-pv data-k="f:${x.k}" width=128 height=128></canvas><b>${esc(x.n)}</b><small>${x.own?'Yours · in Storage at home':'Goes to your Storage at home'}</small><button class=go ${x.own?'disabled':''} onclick="TSM.buy(${i})">${x.own?'Owned':'Buy · '+$$(x.p)}</button></div>`).join('')}</div>
  <div class=tsm-ft>Money ${money}${leave}</div></div>`}
 else{const it=menuItems(C,sp),cf=sp.k=='cafe';
  h=`<div class="modal tsm ${cf?'cf':'rs'}" style="${vars}"><div class=tsm-hd><div class=tsm-k>${cf?'☕ Café · today':'~ '+esc(place)+' ~'}</div><h2>${esc(sp.n||(cf?'Café':'Restaurant'))}</h2><div class=tsm-g>"${esc(hi)}!"</div></div>
  <div class=tsm-sec>${cf?'On the board':'Menu'}</div>${it.map((m,i)=>{const full=!m[3]&&S.energy>=100,poor=S.money<m[1];
   return`<button class="tsm-row${full||poor?' off':''}" onclick="TSM.eat(${i})"><span class=tsm-n>${esc(m[0])}<small>+${m[2]} energy${m[3]?' · refills stamina':''}${full?' · you are full':poor?' · not enough money':''}</small></span><span class=tsm-dots></span><span class=tsm-p>${$$(m[1])}</span></button>`}).join('')}
  <div class=tsm-ft>Energy <span>${Math.round(S.energy)}/100</span> · Money ${money}${leave}</div></div>`}
 $('ui').innerHTML=h;spin()}
function open(C,sp){T={C,sp};GR='';render()}
window.TSM={buy(i){if(!T)return;svSync();const x=souvItems(T.C)[i];if(!x||x.own)return snd('err');if(S.money<x.p){snd('err');return say('Not enough money.')}
  S.money=+(S.money-x.p).toFixed(2);S.dcity.souv=S.dcity.souv||[];S.dcity.souv.push(T.C.id+':'+x.n);S.inv=S.inv||{};S.inv[x.k]=(S.inv[x.k]||0)+1;snd('cash');say('Bought: '+x.n+' · it is waiting in your Storage at home');render()},
 eat(i){if(!T)return;const m=menuItems(T.C,T.sp)[i];if(!m)return;if(S.money<m[1]){snd('err');return say('Not enough money for that.')}if(!m[3]&&S.energy>=100){snd('err');return say('You are already full of energy.')}
  S.money=+(S.money-m[1]).toFixed(2);S.energy=Math.min(100,S.energy+m[2]);if(m[3]){S.stam=100;S.exh=0}snd('eat');say('Yum! '+m[0]+' · +'+m[2]+' energy');render()}};
/* spinning previews, drawn with the Amazoom preview renderer while the souvenir counter is open */
let spinning=0;
function spin(){if(spinning)return;spinning=1;const f=()=>{const cs=[...document.querySelectorAll('.tsm canvas.tsm-pv')];if(!cs.length){spinning=0;return}requestAnimationFrame(f);
 try{if(!PVR)pvInit();const t=performance.now()/1400;cs.forEach((c,i)=>{const m=pvModel(c.dataset.k);PVS.add(m);m.rotation.y=t+i*.8;PVR.render(PVS,PVC);const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.drawImage(PVR.domElement,0,0,c.width,c.height);PVS.remove(m)})}catch(e){spinning=0}};f()}
{const s0=D.shop;D.shop=function(C,sp){try{if(sp&&C&&C.d&&(sp.k=='souv'||sp.k=='food'||sp.k=='cafe')){S.dcity=S.dcity||{};svSync();return open(C,sp)}}catch(e){console.error('tour menu',e)}return s0.apply(this,arguments)}}

{const st=document.createElement('style');st.textContent=`
.tsm{padding:0;min-width:min(400px,92vw);max-width:min(560px,94vw);box-shadow:0 10px 40px #0009}
.tsm h2{margin:2px 0;letter-spacing:0;text-shadow:none}
.tsm .tsm-hd{padding:14px 18px 8px;text-align:center}.tsm .tsm-k{font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.75}.tsm .tsm-g{font-style:italic;font-size:13px;opacity:.85}
.tsm .tsm-ft{display:flex;align-items:center;gap:8px;padding:10px 16px 14px;font-size:13px}.tsm .tsm-ft span{font-weight:bold}.tsm .tsm-x{margin-left:auto;min-height:36px}
/* souvenir counter: kraft paper under a striped awning */
.tsm.sv{background:repeating-linear-gradient(0deg,#c9a46c 0 3px,#c49e66 3px 6px);border:3px solid #5a3a1e;border-radius:10px;color:#3a2410;font-family:'Trebuchet MS',sans-serif;overflow:auto}
.tsm.sv .tsm-aw{height:18px;background:repeating-linear-gradient(90deg,var(--ac) 0 24px,#fff6e6 24px 48px);border-bottom:3px solid #5a3a1e;border-radius:7px 7px 0 0}
.tsm.sv h2{font-family:Georgia,serif;font-style:italic;font-size:28px;color:#3a2410}
.tsm.sv .tsm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:6px 16px}
.tsm.sv .tsm-it{position:relative;background:#fff8ec;border:2px dashed #8a5a32;border-radius:8px;padding:10px;text-align:center;display:flex;flex-direction:column;gap:3px;transform:rotate(-.8deg)}
.tsm.sv .tsm-it:nth-child(even){transform:rotate(.8deg)}.tsm.sv .tsm-it.own{opacity:.7}
.tsm.sv .tsm-it b{font-size:14px}.tsm.sv .tsm-it small{font-size:11px;color:#7a5a3a}
.tsm.sv .tsm-pv{width:100px;height:100px;margin:0 auto;border-radius:50%;background:radial-gradient(circle,#fff 0,#f1e2c4 70%)}
.tsm.sv .tsm-tag{position:absolute;top:6px;right:-6px;background:#fff;border:2px solid #3a2410;color:#3a2410;font-weight:bold;font-size:12px;padding:2px 8px 2px 14px;border-radius:3px 6px 6px 3px;transform:rotate(8deg)}
.tsm.sv .tsm-tag:before{content:'';position:absolute;left:4px;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:50%;background:#c9a46c;border:1px solid #3a2410}
.tsm.sv button{font-family:inherit;border-radius:6px;min-height:36px}
.tsm.sv button.go{background:var(--ac);color:var(--act);border:2px solid #3a2410;box-shadow:0 3px 0 #3a2410}.tsm.sv button.go:disabled{background:#d8c8a8;color:#6a5a3a;opacity:1}
.tsm.sv .tsm-x{background:#5a3a1e;color:#fff6e6;border:2px solid #3a2410}
/* restaurant: a printed paper menu */
.tsm.rs{background:#fbf5e6;color:#2a1a12;font-family:Georgia,'Times New Roman',serif;border:2px solid #7a1f2b;outline:6px double #fbf5e6;outline-offset:-12px;border-radius:4px}
.tsm.rs .tsm-hd{border-bottom:1px solid #d8c8a8;margin:10px 20px 0}
.tsm.rs h2{font-family:Georgia,serif;font-variant:small-caps;font-size:30px;color:#7a1f2b}
.tsm.rs .tsm-sec,.tsm.cf .tsm-sec{text-align:center;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:10px 0 2px}
.tsm.rs .tsm-sec{color:#7a1f2b}
.tsm .tsm-row{display:flex;align-items:flex-end;gap:6px;width:calc(100% - 32px);margin:0 16px;padding:9px 6px;background:none;border:0;box-shadow:none;color:inherit;font:inherit;text-align:left;cursor:pointer;min-height:44px;border-radius:4px}
.tsm .tsm-row small{display:block;font-size:11px;opacity:.7;font-style:italic}.tsm .tsm-n{font-size:16px}
.tsm .tsm-dots{flex:1;border-bottom:2px dotted currentColor;opacity:.35;margin-bottom:6px}.tsm .tsm-p{font-weight:bold;font-size:16px}
.tsm.rs .tsm-row:hover{background:#f1e6cc}.tsm .tsm-row.off{opacity:.5}
.tsm.rs .tsm-x{background:#7a1f2b;color:#fbf5e6;border:0;border-radius:3px;font-family:inherit}
/* café: a chalkboard in a wooden frame */
.tsm.cf{background:radial-gradient(ellipse at 30% 20%,#33443b 0,#22302a 70%);color:#f4f1e8;border:10px solid #7a5432;border-radius:6px;box-shadow:inset 0 0 0 2px #5a3a20,0 10px 40px #0009;font-family:'Segoe Print','Bradley Hand','Comic Sans MS',cursive}
.tsm.cf h2{font-family:inherit;font-size:30px;color:#fff;text-shadow:0 0 3px #fff6}
.tsm.cf .tsm-sec{color:#ffd3a8}.tsm.cf .tsm-p{color:#ffd3a8}
.tsm.cf .tsm-row:hover{background:#ffffff12}
.tsm.cf .tsm-x{background:#7a5432;color:#f4f1e8;border:2px solid #4a2e18;border-radius:4px;font-family:inherit}
@media (max-width:460px){.tsm.sv .tsm-grid{grid-template-columns:1fr}.tsm h2{font-size:24px!important}}`;document.head.appendChild(st)}

/* ---------- doors ---------- */
let lockT=0;const lock=ms=>{lockT=Math.max(lockT,performance.now()+ms)},locked=()=>performance.now()<lockT;
const WAY=/outside|^Leave|^Enter|^Go into|^Lift back|^Back to the|^Backstage door/i;
/* after a door, step forward until you are clear of the door or exit you just used */
function clearDoor(){try{if(!D.on)return;const ways=INT.filter(o=>o.ds&&WAY.test(o.l||'')),inside=(x,z)=>ways.some(o=>Math.hypot(o.x-x,o.z-z)<o.r);if(!inside(P.x,P.z))return;
 /* straight ahead first; if a bin, tree or lamp is in the way, slant left or right around it */
 for(const da of [0,.5,-.5,1,-1,1.57,-1.57]){const a=(P.rot||0)+da,fx=Math.sin(a),fz=Math.cos(a);let x=P.x,z=P.z,ok=0;
  for(let s=.2;s<=3;s+=.2){const nx=P.x+fx*s,nz=P.z+fz*s;if(hit(nx,nz,.28))break;x=nx;z=nz;if(!inside(x,z)){ok=1;break}}
  if(ok){P.x=x;P.z=z;camT.x=x;camT.z=z;return}}}catch(e){}}
{const g0=D.goRoom;D.goRoom=function(){const r=g0.apply(this,arguments);clearDoor();lock(700);return r}}
{const g0=D.goOut;D.goOut=function(){const r=g0.apply(this,arguments);clearDoor();lock(700);return r}}
{const f0=D.fade;D.fade=function(mid,end,hold){lock(1200);return f0.call(this,()=>{try{mid&&mid()}finally{lock(700)}},end,hold)}}
addEventListener('keydown',e=>{const k=(e.key||'').toLowerCase();if(k!='e'&&k!=' '&&k!='enter')return;if(mode!='play'||!D.on||typeof near=='undefined'||!near||!near.ds||!WAY.test(near.l||''))return;
 if(e.repeat||locked()){e.stopImmediatePropagation();e.preventDefault()}},true);
{const u0=update;update=function(dt){u0(dt);try{if(typeof S!='undefined'&&S&&S.dcity&&!S.dcity.svm)svSync();if(D.on&&near&&near.ds&&locked()&&WAY.test(near.l||''))near=null}catch(e){}}}
})();
