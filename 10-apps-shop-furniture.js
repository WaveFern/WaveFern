/* ---------- apps, shop, furniture ---------- */
const APPD={amz:{n:'Amazoom',p:250,d:'Furniture delivered instantly. Quality: questionable.'},ig:{n:'Instagrime',p:400,d:'Promote your songs and scroll the feed.'},eats:{n:'Goober Eats',p:180,d:'Food delivery to refill your energy.'}};
const F={sofa:{n:'Sofa',p:480,w:2,d:.9,b:[[2,.45,.9,'#4a6fa5',0,.22,0],[2,.5,.22,'#3d5e8f',0,.65,-.34],[.22,.35,.9,'#3d5e8f',-.89,.5,0],[.22,.35,.9,'#3d5e8f',.89,.5,0]]},
table:{n:'Coffee table',p:180,w:1.2,d:.7,b:[[1.2,.08,.7,'#8a5a36',0,.4,0],[.08,.4,.08,'#6b4a2e',-.5,.2,-.25],[.08,.4,.08,'#6b4a2e',.5,.2,-.25],[.08,.4,.08,'#6b4a2e',-.5,.2,.25],[.08,.4,.08,'#6b4a2e',.5,.2,.25]]},
shelf:{n:'Bookshelf',p:240,w:1.2,d:.4,b:[[1.2,2,.4,'#6b4a2e',0,1,0],[1,.3,.1,'#c8506a',0,.35,.15],[1,.3,.1,'#4aa3df',0,.9,.15],[1,.3,.1,'#e6b422',0,1.45,.15]]},
plant:{n:'Plant',p:60,w:.6,d:.6,b:[[.5,.4,.5,'#a0522d',0,.2,0],[.45,.7,.45,'#2e8b57',0,.75,0],[.25,.4,.25,'#3cb371',0,1.25,0]]},
tv:{n:'TV + stand',p:800,w:1.6,d:.5,b:[[1.6,.5,.5,'#333',0,.25,0],[1.5,.85,.08,'#111',0,.95,0],[1.4,.75,.02,'*3a6a9a',0,.95,.05]]},
fridge:{n:'Fridge',p:1000,w:.9,d:.8,b:[[.9,1.9,.8,'#dfe6ea',0,.95,0],[.05,.5,.05,'#888',.3,1.3,.42]]},
rug:{n:'Rug',p:120,w:2.4,d:1.6,f:1,b:[[2.4,.03,1.6,'#b5483a',0,.02,0],[2,.04,1.2,'#e6b422',0,.03,0]]},
lamp:{n:'Floor lamp',p:100,w:.4,d:.4,b:[[.3,.05,.3,'#222',0,.03,0],[.06,1.5,.06,'#222',0,.8,0],[.4,.3,.4,'*ffe9a8',0,1.6,0]]},
dining:{n:'Dining table',p:360,w:1.8,d:1,b:[[1.8,.1,1,'#a06a3c',0,.8,0],[.1,.8,.1,'#6b4a2e',-.8,.4,-.4],[.1,.8,.1,'#6b4a2e',.8,.4,-.4],[.1,.8,.1,'#6b4a2e',-.8,.4,.4],[.1,.8,.1,'#6b4a2e',.8,.4,.4]]}};
const FOOD=[['Sir Burger Double Stack',22,25,'Two patties, melted cheese, crunchy lettuce',4.6,'3.4K','900+',27,'Best Seller','Meals'],['Slurp Ramen Bowl',18,20,'Rich broth, springy noodles, soft egg',4.5,'1.9K','600+',0,"Goober's Choice",'Meals'],['Sad Salad (With Hope)',14,12,'Mixed greens and one hopeful tomato',3.9,'512','50+',0,'','Meals'],['Bolt Bull Energy Can',12,10,'Tastes like a battery, works like one',4.2,'7.8K','2K+',15,'','Drinks'],['Mega Feast Bento Box',55,50,'Rice, fish, veg and meat. Share? No.',4.7,'890','300+',65,'Best Seller','Meals']];
let IGF=[],PL=[],hold=null,gp={x:4,z:4,r:0,ok:0},ghost=null,GF=null,mouse={x:0,y:0};const RC=new THREE.Raycaster(),PLN=new THREE.Plane(new THREE.Vector3(0,1,0),0);
const mkF=t=>{const g=new THREE.Group();F[t].b.forEach(a=>B(g,...a));return g};
const fb=(t,x,z,r)=>{const f=F[t],w=r%2?f.d:f.w,d=r%2?f.w:f.d;return[x-w/2,z-d/2,x+w/2,z+d/2]};
function inst(k){const a=APPD[k];if(S.money<a.p)return snd('err');S.money=+(S.money-a.p).toFixed(2);S.apps[k]=1;snd('cash');say('Installed '+a.n);pcR()}
function buyF(t){if(S.money<F[t].p)return snd('err');S.money=+(S.money-F[t].p).toFixed(2);S.inv[t]=(S.inv[t]||0)+1;snd('cash');say(F[t].n+' delivered to storage');pcR()}
function order(i){const f=FOOD[i];if(S.energy>=100)return say('You are already full of energy.');if(S.money<f[1])return snd('err');S.money=+(S.money-f[1]).toFixed(2);S.energy=Math.min(100,S.energy+f[2]);snd('eat');say('Yum! +'+f[2]+' energy');pcR()}
function promo(id){const s=S.songs.find(x=>x.id==id);if(S.money<PROMO||s.boost>0)return;S.money=+(S.money-PROMO).toFixed(2);s.boost=3;S.followers+=RI(3,12);snd('cash');say('Promoting "'+s.title+'"');pcR()}
function buildUI(){const k=Object.keys(S.inv).filter(x=>S.inv[x]>0);$('ui').innerHTML=`<div class=box style="position:absolute;left:50%;bottom:10px;transform:translateX(-50%);max-width:94vw"><h3>🛋 Furniture ${hold?'· placing '+F[hold].n:''}</h3><div style="display:flex;gap:6px;flex-wrap:wrap">${k.length?k.map(t=>`<button onclick="holdItem('${t}')">${F[t].n} ×${S.inv[t]}</button>`).join(''):'<span class=m>Storage empty. Buy furniture on Amazoom (computer).</span>'}<button class=go onclick="exitBuild()">Done</button></div><small class=m>Click: place · R: rotate · Right-click: store · Click placed item: move · F/Esc: exit</small></div>`}
function buildMode(){if(mode=='build')return exitBuild();if(mode!='play')return;mode='build';buildUI()}
function clrGhost(){if(ghost)scene.remove(ghost);ghost=null;if(GF)GF.visible=false}
function exitBuild(){if(hold){S.inv[hold]=(S.inv[hold]||0)+1;clrGhost();hold=null}mode='play';$('ui').innerHTML=''}
function mkGhost(){clrGhost();ghost=mkF(hold);scene.add(ghost);if(!GF){GF=new THREE.Mesh(new THREE.BoxGeometry(1,.06,1),new THREE.MeshBasicMaterial({color:0x44ff88,transparent:true,opacity:.5}));scene.add(GF)}GF.visible=true}
function holdItem(t){if(hold){S.inv[hold]++}if(!S.inv[t])return;S.inv[t]--;hold=t;gp.r=0;mkGhost();buildUI()}
function buildTick(){if(mode!='build'||!hold)return;RC.setFromCamera(mouse,cam);const p=new THREE.Vector3();if(!RC.ray.intersectPlane(PLN,p))return;const f=F[hold],x=Math.round(p.x*2)/2,z=Math.round(p.z*2)/2,c=fb(hold,x,z,gp.r);gp.x=x;gp.z=z;
 let ok=c[0]>=.05&&c[1]>=.05-WGX&&c[2]<=15.95&&c[3]<=11.95;if(ok&&!f.f){const o=r=>c[0]<r[2]&&c[2]>r[0]&&c[1]<r[3]&&c[3]>r[1];ok=!(cols.some(o)||dyn.some(o)||PL.some(q=>!F[q.t].f&&o(fb(q.t,q.x,q.z,q.r)))||o([P.x-.45,P.z-.45,P.x+.45,P.z+.45]))}
 gp.ok=ok;ghost.position.set(x,0,z);ghost.rotation.y=gp.r*Math.PI/2;GF.position.set(x,.05,z);GF.scale.set(c[2]-c[0],1,c[3]-c[1]);GF.material.color.set(ok?0x44ff88:0xff4455)}
addEventListener('mousemove',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=-e.clientY/innerHeight*2+1});addEventListener('contextmenu',e=>{if(mode=='build')e.preventDefault()});
addEventListener('mousedown',e=>{if(mode!='build'||e.target.closest('#ui>*,#hud button'))return;
 if(e.button==2){if(hold){S.inv[hold]++;hold=null;clrGhost();buildUI()}return}
 if(hold){if(!gp.ok)return snd('err');const m=mkF(hold);m.position.set(gp.x,0,gp.z);m.rotation.y=gp.r*Math.PI/2;scene.add(m);PL.push({t:hold,x:gp.x,z:gp.z,r:gp.r,m});snd('thunk');if(S.inv[hold]>0)S.inv[hold]--;else{hold=null;clrGhost()}buildUI();return}
 RC.setFromCamera(mouse,cam);const p=new THREE.Vector3();if(!RC.ray.intersectPlane(PLN,p))return;
 for(let i=PL.length-1;i>=0;i--){const q=PL[i],c=fb(q.t,q.x,q.z,q.r);if(p.x>c[0]&&p.x<c[2]&&p.z>c[1]&&p.z<c[3]){scene.remove(q.m);PL.splice(i,1);hold=q.t;gp.r=q.r;mkGhost();snd('pop');buildUI();return}}});
