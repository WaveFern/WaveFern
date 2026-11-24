/* ===== v55.52.15: PROFILE PICTURE BORDERS (Christmas crates) =====
   A border is a round pixel-art ring drawn on a 16x16 grid around your own profile picture (the drawn avatar, the 3D
   press shot / selfie and uploaded pixel pictures), so it stays chunky at any size. The nine Christmas borders only drop
   from the Christmas crates of the advent calendar (dev/dev-advent-v1.js reads FW_PBORDER.defs for its prize pool).
   Saved in S.pbd = {id: how many you own} and S.pbs = the id you wear ('' = none). The first border you get is worn at once.
   Choose or remove one: Wardrobe > PROFILE BORDER, or the BORDERS button in the advent calendar.
   Loads after every script that wraps pfp / igxPortrait / pxURL, so its wrappers are the outermost. Test hook: window.FW_PBORDER. */
(function(){
const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('pborder '+t,e)}}};
const Sv=()=>{const s=typeof S!='undefined'?S:null;return s&&typeof s=='object'&&s.day!==undefined?s:null};
const TIER=[{n:'Frost',c:'#8fc3e8',min:0},{n:'Holly',c:'#3fbf6a',min:150},{n:'Ember',c:'#f08a24',min:500},{n:'Aurora',c:'#b57cff',min:1500},{n:'Starlight',c:'#ffd23f',min:5000}];
const tierOf=v=>{let t=0;TIER.forEach((x,i)=>{if(v>=x.min)t=i});return t};
/* angle bucket 0..n-1 around the ring, and a hsl colour helper */
const bk=(th,n)=>Math.floor((th+Math.PI)/(Math.PI*2)*n)%n;
const hsl=(h,s,l)=>`hsl(${Math.round(h)},${s}%,${l}%)`;
/* each def: c(o,th,x,y) gives the colour of a ring cell. o = 0 outer ring, 1 inner ring. th = angle. */
const DEFS=[
 {id:'cane',n:'Candy Cane Frame',v:90,c:(o,th)=>bk(th,24)%2?'#fdfdfd':'#d8232a'},
 {id:'pine',n:'Pine Garland',v:140,c:(o,th,x,y)=>o?(bk(th,14)%3==1&&(x+y)%2?'#f2c14e':'#2e8b3f'):((x*7+y*13)%5?'#1f6b34':'#16502a')},
 {id:'holly',n:'Holly Wreath',v:260,c:(o,th)=>{const b=bk(th,12);if(b%4==1)return o?'#ff5a4d':'#d8232a';return o?'#34a04a':'#1d5c2c'}},
 {id:'snow',n:'Snowflake Frame',v:380,c:(o,th)=>{const b=bk(th,16);return b%4==0?'#ffffff':o?'#8fc3e8':'#cfe8f7'}},
 {id:'ginger',n:'Gingerbread Trim',v:650,c:(o,th)=>o?(bk(th,20)%2?'#fdfdfd':'#d98e4a'):'#8b5a2b'},
 {id:'lights',n:'Twinkle Lights',v:1100,c:(o,th)=>o?['#ff4b4b','#ffd23f','#46e083','#3fa9ff'][bk(th,16)%4]:'#1c2a1f'},
 {id:'ribbon',n:'Gift Ribbon Frame',v:2600,c:(o,th,x,y)=>(y<=2&&Math.abs(x-7.5)<=2.5)?'#fdfdfd':o?'#d8232a':'#f2c14e'},
 {id:'aurora',n:'Northern Lights',v:3200,c:(o,th)=>{const t=Math.abs(((th+Math.PI)/(Math.PI*2))*2-1);return hsl(140+t*140,80,o?62:44)}},
 {id:'star',n:'Golden Star Crown',v:7500,c:(o,th)=>bk(th,8)%2==0&&o?'#ffffff':o?'#ffe27a':'#b8860b'}
];
const DEF={};DEFS.forEach(d=>{DEF[d.id]=d;d.tier=tierOf(d.v)});
/* paint the ring onto a square canvas context of size W (cells of W/16): cuts the corners away, fills the ring */
function paint(x,W,id){const d=DEF[id];if(!d)return;const cs=W/16;x.save();x.imageSmoothingEnabled=false;
 for(let j=0;j<16;j++)for(let i=0;i<16;i++){const dx=i-7.5,dy=j-7.5,r=Math.hypot(dx,dy);
  if(r>=8.1){x.globalCompositeOperation='destination-out';x.fillStyle='#000';x.fillRect(i*cs,j*cs,cs+.5,cs+.5);continue}
  if(r>=6.4){x.globalCompositeOperation='source-over';x.fillStyle=d.c(r>=7.3?0:1,Math.atan2(dy,dx),i,j);x.fillRect(i*cs,j*cs,cs+.5,cs+.5)}}
 x.restore()}
/* ---------- ownership ---------- */
const own=id=>{const s=Sv();return!!(s&&s.pbd&&s.pbd[id]>0&&DEF[id])};
const eq=()=>{const s=Sv();return s&&typeof s.pbs=='string'&&DEF[s.pbs]&&own(s.pbs)?s.pbs:''};
function give(id){const s=Sv();if(!s||!DEF[id])return false;if(!s.pbd||typeof s.pbd!='object')s.pbd={};s.pbd[id]=(s.pbd[id]||0)+1;if(!eq())s.pbs=id;
 safe(()=>updateVersion(),'ver');return true}
function redraw(){safe(()=>{if(typeof mode!='undefined'&&mode=='phone'&&typeof phR=='function')phR();else if(typeof app!='undefined'&&app&&typeof pcR=='function')pcR()},'redraw')}
function equip(id){const s=Sv();if(!s)return;if(id&&!own(id))return;s.pbs=id||'';safe(()=>updateVersion(),'ver');safe(()=>autoSave(),'save');redraw();safe(()=>snd(id?'ping':'pop'),'snd')}
/* ---------- applying the border to your own picture (async decode, then every <img> still showing the old one is swapped) ---------- */
const C=new Map(),PEND=new Set();
function deco(u){const id=eq();if(!id||typeof u!='string'||u.slice(0,5)!='data:')return u;const k=id+'|'+u;if(C.has(k))return C.get(k);
 if(!PEND.has(k)){PEND.add(k);const im=new Image();
  im.onload=()=>{PEND.delete(k);safe(()=>{const w=im.naturalWidth||16,W=Math.min(256,Math.max(64,Math.round(w/16)*16)),o=document.createElement('canvas');o.width=o.height=W;
    const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(im,0,0,W,W);paint(x,W,id);const nu=o.toDataURL();
    if(C.size>150)C.clear();C.set(k,nu);document.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')===u)i.src=nu})},'deco')};
  im.onerror=()=>PEND.delete(k);im.src=u}
 return u}
if(typeof pfp=='function'){const p0=pfp;pfp=function(c){const u=p0.apply(this,arguments);return(arguments.length==0||(typeof ch!='undefined'&&c===ch))?deco(u):u}}
if(typeof igxPortrait=='function'){const g0=igxPortrait;igxPortrait=function(c,mine){const u=g0.apply(this,arguments);return mine?deco(u):u}}
if(typeof pxURL=='function'){const x0=pxURL;pxURL=function(code){const u=x0.apply(this,arguments);const s=Sv();return u&&code&&arguments.length<2&&s&&(code===s.pfpSp||code===s.pfpIg)?deco(u):u}}
/* ---------- a stand-in avatar and the 3D plaque used by the crate (flat picture on a thin board) ---------- */
function stand(W){const o=document.createElement('canvas');o.width=o.height=W;const x=o.getContext('2d'),c=W/16,f=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a*c,b*c,w*c,h*c)};
 f('#2a4a38',0,0,16,16);f('#3d6b8a',2,13,12,3);f('#e0ac7e',6,11,4,3);f('#e0ac7e',4,3,8,9);f('#4a3320',4,2,8,3);f('#1b1b1f',6,7,1,1);f('#1b1b1f',9,7,1,1);f('#a8504a',7,10,2,1);return o}
function model(id){const g=new THREE.Group(),W=96,cv=stand(W);paint(cv.getContext('2d'),W,id);
 const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));m.position.y=.5;g.add(m);return g}
/* ---------- picker ---------- */
let PK=null;
function closePick(){if(PK){PK.remove();PK=null}}
function pick(){const s=Sv();if(!s)return;closePick();
 const own0=DEFS.filter(d=>own(d.id)),cur=eq();
 PK=document.createElement('div');PK.id='fwpb';
 const tile=(id,n,t,col,u)=>`<button type=button class="pbt${id==cur?' on':''}" data-id="${id}" style="--rc:${col}"><img alt="" src="${u}"><b>${n}</b><i>${t}</i></button>`;
 const mk=id=>{const cv=stand(64);if(id)paint(cv.getContext('2d'),64,id);return cv.toDataURL()};
 PK.innerHTML=`<div class=pbf><div class=pbh><h2>PROFILE BORDER</h2><button type=button class=pbx aria-label=Close>X</button></div>
  <p>${own0.length?'Pick the border for your profile picture. Christmas borders drop from the Christmas crates in the advent calendar (1 to 24 December).':'You have no borders yet. Christmas borders drop from the Christmas crates in the advent calendar (1 to 24 December).'}</p>
  <div class=pbg>${tile('','No border','OFF','#26302a',mk(''))}${own0.map(d=>tile(d.id,d.n,TIER[d.tier].n+(s.pbd[d.id]>1?' x'+s.pbd[d.id]:''),TIER[d.tier].c,mk(d.id))).join('')}</div></div>`;
 document.body.appendChild(PK);
 PK.addEventListener('click',e=>{if(e.target===PK||e.target.closest('.pbx')){closePick();return}const b=e.target.closest('.pbt');if(!b)return;equip(b.dataset.id);pick()});
 PK.querySelector('.pbx').focus&&0}
addEventListener('keydown',e=>{if(PK&&e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();closePick()}},true);
const css=document.createElement('style');css.textContent=`
#fwpb{position:fixed;inset:0;z-index:130;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:12px;font-family:ui-monospace,monospace}
#fwpb .pbf{width:min(620px,96vw);max-height:90vh;overflow:auto;background:#0c0c0c;color:#e8f3ec;border:3px solid #000;box-shadow:0 0 0 2px #c0392b,inset 0 0 0 2px #1d2a22;padding:14px 16px}
#fwpb .pbh{display:flex;align-items:center;justify-content:space-between}#fwpb h2{margin:0;font:700 14px ui-monospace,monospace;letter-spacing:.08em}
#fwpb .pbx{background:#000;color:#fff;border:2px solid #333;padding:2px 8px;cursor:pointer;font:700 12px ui-monospace,monospace}
#fwpb p{font-size:11px;opacity:.8;margin:8px 0 12px}
#fwpb .pbg{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px}
#fwpb .pbt{background:#111;color:inherit;border:2px solid #000;box-shadow:inset 0 0 0 2px var(--rc);padding:8px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;font:inherit}
#fwpb .pbt.on{outline:3px solid #fff}#fwpb .pbt img{width:64px;height:64px;image-rendering:pixelated}
#fwpb .pbt b{font-size:10px;text-align:center}#fwpb .pbt i{font-style:normal;font-size:9px;color:var(--rc)}
#fwpbw{margin-left:8px;font:700 11px ui-monospace,monospace;background:#000;color:#e8f3ec;border:2px solid #333;padding:2px 8px;cursor:pointer}`;
document.head.appendChild(css);
/* Wardrobe: a PROFILE BORDER button next to the heading (only once you own one) */
if(typeof wrR=='function'){const w0=wrR;wrR=function(){const r=w0.apply(this,arguments);safe(()=>{const s=Sv(),h=document.querySelector('#ui .box.modal h2');
 if(s&&h&&s.pbd&&DEFS.some(d=>own(d.id))&&!document.getElementById('fwpbw')){const b=document.createElement('button');b.id='fwpbw';b.type='button';b.textContent='PROFILE BORDER';b.onclick=()=>pick();h.appendChild(b)}},'wr');return r}}
window.FW_PBORDER={defs:DEFS,tiers:TIER,own,eq,give,equip,pick,paint,model,deco,stand};
})();
