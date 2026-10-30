/* ===== v44.6.0: Storage placing overhaul =====
   Replaces the Storage placing controls and panel. Furniture snaps flush against room walls, low walls and other furniture, turns
   its back to the wall, and works with touch: drag to move, big Place / Turn / Store buttons. Settings live in S.pset (missing = defaults).
   Wrapped in an IIFE so no names leak into the shared global scope. */
(()=>{
const PS=()=>{const p=S.pset=S.pset||{};if(p.snap===undefined)p.snap=1;if(p.turn===undefined)p.turn=1;if(p.grid===undefined)p.grid=.5;return p};
const dims=(t,r)=>{const f=F[t];return r%2?[f.d,f.w]:[f.w,f.d]};
let sel=-1,moving=null,drag=null,pType='mouse',setOpen=false,PX=0,PY=0,man=false;

/* v47.2.0: the room you are placing in. Downstairs is the house (x 0-16, z -WGX-12); upstairs is the annex floor at x 900, z 320,
   whose walls and stairwell are in ANX.cw */
const upst=()=>!!IN&&typeof ANX!='undefined'&&ANX.idx!=null&&IN.i==ANX.idx&&ANX.lv>0;
const room=()=>upst()?[900,320,900+ANX.W,320+ANX.D]:[0,-WGX,16,12];
const walls=()=>upst()?cols.concat(ANX.cw||[]):cols;
/* does an item of type t fit at x,z facing r? (skip = index in PL to ignore) */
function valid(t,x,z,r,skip){const f=F[t],c=fb(t,x,z,r),R=room();let ok=c[0]>=R[0]-1e-6&&c[1]>=R[1]-1e-6&&c[2]<=R[2]+1e-6&&c[3]<=R[3]+1e-6;
 if(ok&&!f.f){const o=q=>c[0]<q[2]&&c[2]>q[0]&&c[1]<q[3]&&c[3]>q[1];
  /* wall items hang above furniture, so they only bump into walls and other wall items */
  ok=!(walls().some(o)||!f.wall&&dyn.some(o)||PL.some((q,i)=>i!=skip&&!F[q.t].f&&!F[q.t].wall==!f.wall&&o(fb(q.t,q.x,q.z,q.r)))||!f.wall&&o([P.x-.45,P.z-.45,P.x+.45,P.z+.45]))}
 if(ok&&f.wall)ok=backOn(t,x,z,r);
 return ok}
/* v49.42.0: wall items (plaques) only fit with their back flat against a room wall or a low wall */
function backOn(t,x,z,r){const c=fb(t,x,z,r),R=room(),e=.03,ov=(a0,a1,b0,b1)=>a0<b1&&a1>b0;
 return r==0?Math.abs(c[1]-R[1])<e||walls().some(q=>Math.abs(c[1]-q[3])<e&&ov(c[0],c[2],q[0],q[2]))
  :r==2?Math.abs(c[3]-R[3])<e||walls().some(q=>Math.abs(c[3]-q[1])<e&&ov(c[0],c[2],q[0],q[2]))
  :r==1?Math.abs(c[0]-R[0])<e||walls().some(q=>Math.abs(c[0]-q[2])<e&&ov(c[1],c[3],q[1],q[3]))
  :Math.abs(c[2]-R[2])<e||walls().some(q=>Math.abs(c[2]-q[0])<e&&ov(c[1],c[3],q[1],q[3]))}

/* where the item ends up for a ground point px,pz: grid, clamp into the room, then snap flush to walls/furniture */
function fit(t,px,pz,r,skip){const s=PS(),f=F[t],R=room();let wall=null;
 const run=()=>{const[w,d]=dims(t,r);let x=px,z=pz;if(s.grid>0){x=Math.round(x/s.grid)*s.grid;z=Math.round(z/s.grid)*s.grid}
  x=Math.max(R[0]+w/2,Math.min(R[2]-w/2,x));z=Math.max(R[1]+d/2,Math.min(R[3]-d/2,z));wall=null;
  if(s.snap){const T=.6;let bx=T,bz=T,nx=x,nz=z;wall=[0,0];
   if(Math.abs(R[0]+w/2-x)<bx){bx=Math.abs(R[0]+w/2-x);nx=R[0]+w/2;wall[0]=-1}
   if(Math.abs(R[2]-w/2-x)<bx){bx=Math.abs(R[2]-w/2-x);nx=R[2]-w/2;wall[0]=1}
   if(Math.abs(R[1]+d/2-z)<bz){bz=Math.abs(R[1]+d/2-z);nz=R[1]+d/2;wall[1]=-1}
   if(Math.abs(R[3]-d/2-z)<bz){bz=Math.abs(R[3]-d/2-z);nz=R[3]-d/2;wall[1]=1}
   const rects=walls().filter(q=>q[2]>R[0]&&q[0]<R[2]&&q[3]>R[1]&&q[1]<R[3]);
   if(!f.f)PL.forEach((q,i)=>{if(i!=skip&&!F[q.t].f&&!F[q.t].wall==!f.wall)rects.push(fb(q.t,q.x,q.z,q.r))});
   rects.forEach(q=>{const nearZ=z-d/2<q[3]+T&&z+d/2>q[1]-T,nearX=x-w/2<q[2]+T&&x+w/2>q[0]-T;
    if(nearZ)[q[2]+w/2,q[0]-w/2].forEach(v=>{const e=Math.abs(v-x);if(e<bx){bx=e;nx=v;wall[0]=0}});
    if(nearX)[q[3]+d/2,q[1]-d/2].forEach(v=>{const e=Math.abs(v-z);if(e<bz){bz=e;nz=v;wall[1]=0}})});
   x=nx;z=nz}
  return[x,z]};
 let[x,z]=run();
 /* back to the wall: furniture backs sit at -z when r=0, -x when r=1, +z when r=2, +x when r=3 */
 if(s.turn&&!man&&!f.f&&wall){const want=wall[1]==-1?0:wall[1]==1?2:wall[0]==-1?1:wall[0]==1?3:null;if(want!=null&&want!=r){r=want;[x,z]=run()}}
 /* a wall item turns its back to whichever wall it is up against */
 if(f.wall&&!backOn(t,x,z,r))for(const r2 of[r,(r+1)%4,(r+2)%4,(r+3)%4].slice(1)){const r0=r;r=r2;const[x2,z2]=run();if(backOn(t,x2,z2,r2)){x=x2;z=z2;break}r=r0}
 return{x,z,r}}

/* ---- ghost follows the pointer; green = fits, red = does not ---- */
function groundPoint(){RC.setFromCamera({x:mouse.x,y:pType=='touch'?mouse.y+.14:mouse.y},cam);const p=new THREE.Vector3();return RC.ray.intersectPlane(PLN,p)?p:null}
function ghostTick(){const p=groundPoint();if(!p||!ghost)return;const o=fit(hold,p.x,p.z,gp.r,-1);gp.r=o.r;gp.x=o.x;gp.z=o.z;gp.ok=valid(hold,o.x,o.z,o.r,-1);
 const c=fb(hold,o.x,o.z,o.r);ghost.position.set(o.x,0,o.z);ghost.rotation.y=o.r*Math.PI/2;GF.position.set(o.x,.05,o.z);GF.scale.set(c[2]-c[0],1,c[3]-c[1]);GF.material.color.set(gp.ok?0x44ff88:0xff4455)}
function hilite(i){const b=new THREE.Box3().setFromObject(PL[i].m),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());
 if(!HOVO){HOVO=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,1)),new THREE.LineBasicMaterial({color:0xffee55,depthTest:false}));HOVO.renderOrder=999;scene.add(HOVO)}
 HOVO.position.copy(ct);HOVO.scale.set(sz.x+.06,sz.y+.06,sz.z+.06);HOVO.visible=true}
{const b0=buildTick;buildTick=function(){const r=b0.apply(this,arguments);
  document.body.classList.toggle('pbuild',mode=='build');
  if(mode!='build'){sel=-1;moving=null;return r}
  if(sel>=PL.length)sel=-1;
  if(hold){if(ghost&&GF)ghostTick();if(HOVO)HOVO.visible=false}
  else if(sel>=0)hilite(sel);
  else if(pType=='touch'&&HOVO)HOVO.visible=false;
  return r}}

/* ---- actions ---- */
function place(){if(!hold)return;if(!gp.ok){snd('err');return say(F[hold].wall?'Hang it on a wall: move it right up against one, back to the wall.':'It does not fit there. Move it or turn it.')}
 const t=hold,m=mkF(t);m.position.set(gp.x,0,gp.z);m.rotation.y=gp.r*Math.PI/2;scene.add(m);PL.push({t,x:gp.x,z:gp.z,r:gp.r,m});snd('thunk');
 moving=null;if(S.inv[t]>0){S.inv[t]--;man=false}else{hold=null;clrGhost();sel=PL.length-1}buildUI()}
function pickUp(i){const q=PL[i];if(!q||hold)return;if(q.t=='desk'){snd('err');return say('Your desk is part of the house. Upgrade it in the Gear shop.')}
 scene.remove(q.m);PL.splice(i,1);moving={t:q.t,x:q.x,z:q.z,r:q.r};hold=q.t;gp.r=q.r;gp.ok=0;man=true;sel=-1;mkGhost();snd('pop');buildUI()}
function restore(){if(!moving)return;const q=moving,m=mkF(q.t);moving=null;m.position.set(q.x,0,q.z);m.rotation.y=q.r*Math.PI/2;scene.add(m);PL.push({t:q.t,x:q.x,z:q.z,r:q.r,m});hold=null;clrGhost();sel=PL.length-1}
function rot(d){snd('click');man=true;if(hold){gp.r=(gp.r+d+4)%4;return}
 if(sel<0)return;const q=PL[sel];if(q.t=='desk'){snd('err');return say('Your desk is fixed in place.')}
 const r=(q.r+d+4)%4,o=fit(q.t,q.x,q.z,r,sel);if(o.r==r&&valid(q.t,o.x,o.z,r,sel)){q.r=r;q.x=o.x;q.z=o.z;q.m.position.set(o.x,0,o.z);q.m.rotation.y=r*Math.PI/2}else{snd('err');say('No room to turn it here.')}}
function cancel(){if(moving){restore();snd('pop')}else if(hold){S.inv[hold]++;hold=null;clrGhost();snd('pop')}else sel=-1;buildUI()}
function store(){if(hold){const t=hold;moving=null;S.inv[t]=(S.inv[t]||0)+1;hold=null;clrGhost();snd('pop');buildUI();return}
 if(sel<0)return;const q=PL[sel];if(q.t=='desk'){snd('err');return say('Your desk is part of the house. It cannot be stored.')}
 scene.remove(q.m);PL.splice(sel,1);S.inv[q.t]=(S.inv[q.t]||0)+1;sel=-1;if(HOVO)HOVO.visible=false;snd('pop');buildUI()}
{const k0=storeKey;storeKey=function(){if(mode!='build')return;if(hold||sel>=0)return store();return k0.apply(this,arguments)}}
{const h0=holdItem;holdItem=function(t){if(moving)restore();sel=-1;man=false;h0.apply(this,arguments);buildUI()}}
{const e0=exitBuild;exitBuild=function(){if(mode=='build'){if(moving)restore();sel=-1}return e0.apply(this,arguments)}}

/* ---- pointer input (mouse and touch) ---- */
const onUI=e=>e.target.closest&&e.target.closest('#ui>*,#hud button,#tch,#tchb');
const setPtr=e=>{pType=e.pointerType=='mouse'?'mouse':'touch';mouse.x=e.clientX/innerWidth*2-1;mouse.y=-e.clientY/innerHeight*2+1;PX=e.clientX;PY=e.clientY};
['mousedown','mouseup','click'].forEach(n=>addEventListener(n,e=>{if(mode=='build'&&!onUI(e)&&e.target.tagName=='CANVAS')e.stopImmediatePropagation()},true));
addEventListener('pointerdown',e=>{if(mode!='build'||onUI(e))return;setPtr(e);
 if(e.pointerType=='mouse'&&e.button==2){if(hold||sel>=0){rot(1);buildUI()}return}
 if(e.pointerType=='mouse'&&e.button!=0)return;
 const cap=()=>{if(e.pointerType!='mouse')try{e.target.setPointerCapture(e.pointerId)}catch(_){}};
 if(hold){drag={id:e.pointerId,drop:!!moving,place:e.pointerType=='mouse'&&!moving,sx:PX,sy:PY};cap();return}
 const i=hovFind();if(i<0){if(sel>=0){sel=-1;buildUI()}drag=null;return}
 if(PL[i].t=='desk'){sel=-1;drag=null;buildUI();snd('err');return say('Your desk is part of the house. It cannot be moved or stored.')}
 if(sel!=i){sel=i;buildUI()}drag={id:e.pointerId,idx:i,moved:false,sx:PX,sy:PY};cap()},true);
addEventListener('pointermove',e=>{if(mode!='build'||(onUI(e)&&!drag))return;setPtr(e);
 if(drag&&drag.idx!=null&&!drag.moved&&!hold&&Math.hypot(PX-drag.sx,PY-drag.sy)>(e.pointerType=='mouse'?5:10)){drag.moved=true;drag.drop=true;pickUp(drag.idx)}},true);
addEventListener('pointerup',e=>{if(mode!='build'||!drag||e.pointerId!=drag.id)return;const d=drag;drag=null;if(!hold)return;
 if(d.place){if(!onUI(e))place()}else if(d.drop&&gp.ok)place()},true);
addEventListener('pointercancel',()=>{drag=null},true);
addEventListener('keydown',e=>{if(mode!='build'||/INPUT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();
 if(k=='r'&&!e.repeat){man=true;if(!hold&&sel>=0){e.stopImmediatePropagation();rot(1);buildUI()}}
 else if((k=='enter')&&hold&&e.target.tagName!='BUTTON'){e.preventDefault();place()}},true);

/* ---- panel ---- */
const css=document.createElement('style');css.textContent=`
body.pbuild canvas{touch-action:none}
body.pbuild #tch{display:none!important}
.pb{position:absolute;left:50%;bottom:calc(8px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(620px,calc(100vw - 16px));max-height:52vh;overflow:auto;box-sizing:border-box;padding:10px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.pb h3{margin:0;font-size:14px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pb button{min-height:40px;padding:6px 12px;font:inherit}
.pb .pbr{display:flex;gap:6px;align-items:center;margin-bottom:8px}
.pb .pbr>button{flex:0 0 auto}
.pb .pbact button{flex:1 1 0;min-width:0;font-size:15px}
.pb .pbl{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
.pb .pbl button{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:84px}
.pb .pbl button small{color:var(--m);font-size:11px}
.pb .pbl.wrap{flex-wrap:wrap;overflow:visible}
.pb .pbs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px;padding:8px;background:#0a0d0b;border:2px solid #222}
.pb .pbs b{flex:1 0 100%;font-size:12px;color:var(--m);font-weight:normal}
.pb .pbs button{flex:1 1 auto}
.pb button.on{background:var(--g);color:#04120a;font-weight:bold}
.pb .pbh{display:block;margin-top:4px;font-size:11px}
@media(max-height:520px){.pb{max-height:62vh}.pb.act .pbl,.pb.act .pbh{display:none}}
@media(pointer:coarse){.pb button{min-height:46px}.pb .pbact button{font-size:16px}}
`;document.head.appendChild(css);
const touch=()=>pType=='touch'||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);

buildUI=function(){const s=PS();S.fd=S.fd||{};const old=document.querySelector('#ui .pbl'),sl=old?old.scrollLeft:0;
 const k=Object.keys(S.inv).filter(x=>S.inv[x]>0&&F[x]&&x!='desk'),fd=Object.keys(S.fd).filter(i=>S.fd[i]>0&&FOOD[i]);
 const tab=(t,n)=>`<button class="${SGT==t?'on':''}" onclick="SGT='${t}';buildUI()">${n}</button>`;
 const tg=(key,val,n)=>`<button class="${s[key]==val?'on':''}" onclick="PBset('${key}',${val})">${n}</button>`;
 const q=sel>=0?PL[sel]:null,act=!!hold||!!q,name=hold?F[hold].n:q?F[q.t].n:'';
 const turn='<button onclick="PBdo(\'rl\')" aria-label="Turn left">↺</button><button onclick="PBdo(\'rr\')" aria-label="Turn right">↻</button>';
 const actRow=hold?`<div class="pbr pbact"><button class=on onclick="PBdo('place')">✔ Place</button>${turn}<button onclick="PBdo('store')">Store</button><button onclick="PBdo('cancel')">${moving?'Undo':'✕'}</button></div>`
  :q?`<div class="pbr pbact"><button class=on onclick="PBdo('move')">✥ Move</button>${turn}<button onclick="PBdo('store')">Store</button><button onclick="PBdo('cancel')">✕</button></div>`:'';
 const body=SGT=='f'?(k.length?`<div class=pbl>${k.map(t=>`<button onclick="holdItem('${t}')"><span>${F[t].n}</span><small>×${S.inv[t]} in storage</small></button>`).join('')}</div>`:'<span class=m>No furniture in storage. Buy furniture on Amazoom (computer).</span>')
  :(fd.length?`<div class="pbl wrap">${fd.map(i=>`<button onclick="eatFood(${i})"><span>${FOOD[i][0]}</span><small>×${S.fd[i]} · +${FOOD[i][2]} energy</small></button>`).join('')}</div>`:'<span class=m>No food in storage. Order from Goober Eats (computer).</span>');
 const sets=setOpen?`<div class=pbs><b>Snap to walls and furniture</b>${tg('snap',1,'On')}${tg('snap',0,'Off')}<b>Turn back to the wall</b>${tg('turn',1,'On')}${tg('turn',0,'Off')}<b>Grid size</b>${tg('grid',.25,'¼')}${tg('grid',.5,'½')}${tg('grid',1,'1')}${tg('grid',0,'Free')}</div>`:'';
 const hint=SGT!='f'?'Tap food to eat it and restore energy.':touch()?(act?'Drag in the room to move it. Green means it fits.':'Tap an item below to place it, or tap a placed item to move it.'):(act?'Click to place · R or right-click: turn · E: store · Enter: place':'Pick an item below, or click a placed item. Drag to move it.');
 $('ui').innerHTML=`<div class="box pb ${act?'act':''}"><div class=pbr><h3>Storage${name?' · '+name:''}</h3>${tab('f','Furniture ('+k.reduce((a,t)=>a+S.inv[t],0)+')')}${tab('d','Food ('+fdN()+')')}<button class="${setOpen?'on':''}" onclick="PBgear()" aria-label="Placement settings">${pxIcon('gear')}</button><button class=go onclick="exitBuild()">Done</button></div>${actRow}${sets}${body}<small class="m pbh">${hint}${hasBed()?'':' · The room needs a bed'}</small></div>`;
 const n=document.querySelector('#ui .pbl');if(n)n.scrollLeft=sl};
window.PBdo=a=>{if(mode!='build')return;if(a=='place')place();else if(a=='rl'){rot(-1);buildUI()}else if(a=='rr'){rot(1);buildUI()}else if(a=='store')store();else if(a=='cancel')cancel();else if(a=='move'&&sel>=0)pickUp(sel)};
window.PBset=(k,v)=>{PS()[k]=v;snd('click');buildUI()};
window.PBgear=()=>{setOpen=!setOpen;snd('click');buildUI()};
})();
