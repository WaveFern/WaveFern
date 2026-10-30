/* ===== v45.7.0: Fun admin commands on the Gphone =====
   The admin Google account (isAdmin() from 88-admin.js) gets an extra "Admin" app on the Gphone home screen with silly,
   fully reversible commands. Everything here lives in memory only: nothing is written to S, so no save ever contains it
   and a page reload (or Reset all) puts the world back to normal.
   - Weather: object rain (rubber ducks, confetti, money, meteors), blizzard, mega storm with lightning, and Crazy weather
     that cycles through all of them with a rainbow sky.
   - Size: giant or tiny you. Tiny car / giant car: spawns a temporary car under you (a giant you in a tiny car is allowed).
   - v46.0.0: in a band room the admin's weather, size, car, disco and big heads are shared with the room (see the end of the file).
   - Moon jump (Space), disco party lights, big heads, spin cycle, drunk camera, slow-mo and hyper speed. */
(()=>{
const LIVE=['play','drive','rec','cut','phone'];
const F={wx:'',size:'',speed:'',moon:0,disco:0,head:0,spin:0,drunk:0};
const W={list:[],kind:'',cyc:0,ci:0,fl:0,nf:3,shake:0,jy:0,jv:0,hue:0,beat:0,grp:null};
const WX=[['duck','','Rubber ducks'],['conf','','Confetti'],['money','','Money rain'],['snow','','Blizzard'],['meteor','','Meteors'],['storm','','Mega storm'],['chaos','','Crazy weather']];
const mats={},mat=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
const bx=(g,w,h,d,c,x=0,y=0,z=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);g.add(m);return m};
const rnd=(a,b)=>a+Math.random()*(b-a),pk=a=>a[Math.random()*a.length|0];
const ok=()=>{try{return typeof isAdmin=='function'&&isAdmin()&&!!S}catch(e){return false}};
const live=()=>LIVE.includes(mode);
function mk(k){const g=new THREE.Group();
 if(k=='duck'){bx(g,.5,.34,.62,'#ffd21f',0,.17,0);bx(g,.3,.3,.3,'#ffd21f',0,.5,.28);bx(g,.2,.09,.16,'#ff8a1a',0,.46,.5);bx(g,.1,.1,.04,'#111',-.08,.56,.43);bx(g,.1,.1,.04,'#111',.08,.56,.43);bx(g,.3,.2,.2,'#f2b800',0,.28,-.34)}
 else if(k=='conf')bx(g,.26,.03,.2,pk(['#ff4d6d','#ffd23f','#3bceac','#4cc9f0','#b388ff','#ff9f1c']));
 else if(k=='money'){bx(g,.7,.03,.34,'#6fcf7f');bx(g,.3,.04,.2,'#3a9a52')}
 else if(k=='snow')bx(g,.16,.16,.16,'#ffffff');
 else if(k=='meteor'){bx(g,.55,.55,.55,'#ff7a1a');bx(g,.3,.3,.3,'#ffd23f');const t=bx(g,.3,1.8,.3,'#ff4d1a',0,1.1,0);t.material=mat('#ff4d1a')}
 else bx(g,.03,.95,.03,'#cfe3ff');
 return g}
function spawn(o,first){const k=o.k,m=o.m;o.x=P.x+rnd(-13,13);o.z=P.z+rnd(-13,13);o.y=first?rnd(0,16):rnd(14,20);
 o.vy=k=='meteor'?rnd(16,24):k=='storm'?rnd(26,34):k=='snow'?rnd(1.2,2.2):k=='duck'?rnd(5,8):rnd(1.5,3.2);
 o.vx=k=='meteor'?-9:k=='storm'?-3:k=='snow'?rnd(-1,1):0;o.vz=k=='meteor'?-9:k=='storm'?-3:0;o.sp=rnd(1,4);o.ph=rnd(0,6.3)}
function setKind(k){if(W.kind==k)return;W.kind=k;if(W.grp){scene.remove(W.grp);W.grp=null}W.list=[];if(!k)return;
 const g=W.grp=new THREE.Group(),n=k=='snow'?110:k=='storm'?100:k=='meteor'?12:k=='duck'?26:70;
 for(let i=0;i<n;i++){const m=mk(k);g.add(m);const o={k,m};spawn(o,1);W.list.push(o)}scene.add(g)}
function wxStep(dt){const ck=F.wx=='chaos'?['duck','conf','money','snow','meteor','storm'][W.ci%6]:F.wx;
 if(F.wx=='chaos'){W.cyc+=dt;if(W.cyc>7){W.cyc=0;W.ci++;const n=['duck','conf','money','snow','meteor','storm'][W.ci%6];try{say((WX.find(w=>w[0]==n)||[])[1]+' '+(WX.find(w=>w[0]==n)||[])[2]+'!')}catch(e){}}}
 setKind(ck);if(!W.grp)return;
 W.grp.visible=live()&&!IN&&!HIN;if(!W.grp.visible)return;
 W.list.forEach(o=>{o.y-=o.vy*dt;o.x+=o.vx*dt;o.z+=o.vz*dt;const k=o.k;
  if(k=='conf'||k=='money'||k=='snow'||k=='duck'){o.ph+=dt*o.sp;o.x+=Math.sin(o.ph)*dt*(k=='duck'?.6:1.6);o.z+=Math.cos(o.ph*.8)*dt*(k=='duck'?.6:1.6)}
  const m=o.m;m.position.set(o.x,Math.max(0,o.y),o.z);if(k=='conf'||k=='money'){m.rotation.x+=dt*o.sp*2;m.rotation.y+=dt*o.sp*2.4}else if(k=='duck'){m.rotation.y+=dt*o.sp*.8;m.rotation.x=Math.sin(o.ph)*.3}
  else if(k=='meteor'){m.rotation.set(0,0,0);m.lookAt(m.position.x+9,m.position.y+16,m.position.z+9)}
  if(o.y<=0){if(k=='meteor'){if(Math.hypot(o.x-P.x,o.z-P.z)<14){W.shake=Math.max(W.shake,.25);try{sfx(70,.25,'sawtooth',.05,30,0,.3)}catch(e){}}}spawn(o)}});
 if(F.wx=='storm'||(F.wx=='chaos'&&ck=='storm')){W.nf-=dt;if(W.nf<=0){W.nf=rnd(2.5,7);W.fl=1;try{sfx(48,1,'sawtooth',.1,22,.25,.6)}catch(e){}}}
 W.fl=Math.max(0,W.fl-dt*2.2);W.shake=Math.max(0,W.shake-dt*.6)}
/* the character's head is the group at neck height; scaled up for big heads */
const headOf=g=>{if(!g)return null;if(g.userData.fxHead)return g.userData.fxHead;const h=g.children.find(c=>c.isGroup&&Math.abs(c.position.y-1.4)<.2&&c.children.length>3);if(h)g.userData.fxHead=h;return h};
function bigHead(g,on){const h=headOf(g);if(!h)return;if(on){if(h.scale.x!=2.4)h.scale.setScalar(2.4);if(h.position.y!=1.78)h.position.y=1.78}else if(h.scale.x!=1||h.position.y==1.78){h.scale.setScalar(1);h.position.y=1.4}}
function carFix(){try{if(mode=='drive'&&dr&&dr.fxk&&dr.fxk<1&&P.mesh){P.mesh.visible=true;P.mesh.rotation.y=dr.h}}catch(e){}}
function post(dt){if(!ok()){const rf=rfx();if(rf){F.wx=rf.wx;F.disco=rf.di;F.head=rf.hd;F.size=F.speed='';F.moon=F.spin=F.drunk=0}else{if(W.grp||F.wx||F.size||F.speed||F.moon||F.disco||F.head||F.spin||F.drunk)reset(1);avFx();return}}
 const lv=live();
 wxStep(dt);
 /* size */
 if(P.mesh){const k=lv?(F.size=='giant'?2.6:F.size=='tiny'?.45:1):1;if(P.mesh.scale.x!=k)P.mesh.scale.setScalar(k);bigHead(P.mesh,!!F.head&&lv)}
 try{NPC.forEach(n=>{if(n.m)bigHead(n.m,!!F.head)})}catch(e){}
 /* moon jump */
 if(W.jy>0||W.jv!=0){W.jv-=5*dt;W.jy+=W.jv*dt;if(W.jy<=0){W.jy=0;W.jv=0}}
 if(P.mesh&&W.jy>0)P.mesh.position.y+=W.jy;
 /* spin cycle */
 if(F.spin&&P.mesh&&lv&&mode!='drive'){P.mesh.rotation.y=tt*14;P.mesh.position.y+=Math.abs(Math.sin(tt*6))*.25}
 /* disco */
 if(F.disco&&lv&&!IN){W.hue=((W.hue<0?0:W.hue)+dt*.35)%1;W.beat+=dt;if(W.beat>=.5){W.beat=0;try{sfx(62,.16,'sine',.09,40,0,.1)}catch(e){}}
  amb.color.setHSL(W.hue,.85,.55);sun.color.setHSL((W.hue+.5)%1,.9,.6);amb.intensity=.9+.4*(1-W.beat/.5);sun.intensity=.7;scene.background.setHSL((W.hue+.25)%1,.55,.22);
  lamps.forEach((l,i)=>{l.intensity=1.4;try{l.color.setHSL((W.hue+i*.13)%1,1,.6)}catch(e){}});
  const b=Math.abs(Math.sin(tt*6.28));try{NPC.forEach((n,i)=>{if(n.m){n.m.position.y=Math.abs(Math.sin(tt*6.28+i))*.35;n.m.rotation.y+=dt*3}})}catch(e){}if(P.mesh&&mode=='play'&&!F.spin)P.mesh.position.y+=b*.12}
 else if(!F.disco&&W.hue!==-1){W.hue=-1;try{lamps.forEach(l=>l.color.set(0xffffff));NPC.forEach(n=>{if(n.m)n.m.position.y=0})}catch(e){}}
 /* weather tint */
 if(W.grp&&W.grp.visible){const k=F.wx=='chaos'?['duck','conf','money','snow','meteor','storm'][W.ci%6]:F.wx;
  if(k=='storm'||k=='meteor'){const d=k=='storm'?.5:.35;amb.intensity*=1-d*.7;sun.intensity*=1-d;scene.background.lerp(new THREE.Color(k=='storm'?0x0b1226:0x3a1408),.55)}
  if(k=='snow'){scene.background.lerp(new THREE.Color(0xdbe8f2),.4);amb.intensity*=1.1}
  if(F.wx=='chaos'){W.ch=((W.ch||0)+dt*.12)%1;scene.background.lerp(new THREE.Color().setHSL(W.ch,.6,.45),.3)}
  if(W.fl>0){amb.intensity+=W.fl*2.4;scene.background.lerp(new THREE.Color(0xffffff),W.fl*.7)}}
 /* camera: shake and drunk wobble */
 if(lv){if(W.shake>0){cam.position.x+=rnd(-1,1)*W.shake;cam.position.y+=rnd(-1,1)*W.shake}
  if(F.drunk){cam.rotateZ(Math.sin(tt*1.3)*.07);cam.zoom=1+Math.sin(tt*.9)*.08;cam.updateProjectionMatrix()}else if(cam.zoom!=1){cam.zoom=1;cam.updateProjectionMatrix()}}
 carFix();avFx()}
{const u0=update;update=function(dt){const k=ok()?(F.speed=='slow'?.35:F.speed=='hyper'?2:1):1;const r=u0.call(this,dt*k);try{post(dt)}catch(e){console.error('fun admin',e)}return r}}
/* Space = moon jump when nothing is nearby to interact with */
addEventListener('keydown',e=>{if(!F.moon||!ok()||mode!='play'||e.key!=' '||near||W.jy>0||e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;W.jv=7.5;W.jy=.01;try{sfx(330,.3,'triangle',.06,660,0,.1)}catch(x){}});
/* temporary cars: not in S.cars, so never saved; parkCars() clears them */
function car(k){if(!ok())return;if(IN||(mode!='play'&&mode!='phone'))return say('Do that outside, on foot.');
 try{closePhone()}catch(e){}if(mode!='play')return;
 const by=CARS.map((c,i)=>i).sort((a,b)=>CARS[a].p-CARS[b].p),i=k<1?by[0]:by[by.length-1];
 const m=mkS(carb(i));m.scale.setScalar(1.5*k);m.position.set(P.x,0,P.z);scene.add(m);const c={i,m,x:P.x,z:P.z,h:P.rot||0,v:0,fxk:k};PK.push(c);dr=c;P.mesh.visible=k<1;mode='drive';
 say(k<1?'Tiny car! Press E to hop out.':'Giant car! Press E to hop out.')}
function clearCars(){try{if(mode=='drive'&&dr&&dr.fxk)exitDrive();PK=PK.filter(c=>{if(c.fxk){scene.remove(c.m);return false}return true})}catch(e){console.error(e)}}
function reset(quiet){F.wx=F.size=F.speed='';F.moon=F.disco=F.head=F.spin=F.drunk=0;setKind('');W.jy=W.jv=0;W.fl=0;W.shake=0;clearCars();
 try{if(P.mesh){P.mesh.scale.setScalar(1);bigHead(P.mesh,false)}NPC.forEach(n=>{if(n.m){bigHead(n.m,false);n.m.position.y=0}});lamps.forEach(l=>l.color.set(0xffffff));cam.zoom=1;cam.updateProjectionMatrix()}catch(e){}
 if(!quiet){say('Everything is back to normal.');if(mode=='phone')phR()}}
/* ---- v46.0.0: sharing with the band room ----
   The admin sends its effect state (weather, size, car, disco, big heads) to the room every few seconds; the host relays it.
   Others only accept it from a member the room knows is an admin. It is memory only: it expires 9s after the last message
   (so it clears on leaving, closing the page or turning things off) and nothing is saved. */
const RX={},CX={};
let lastFx='',lastFxT=0;
const mem=()=>{try{return window.MPFX&&window.MPFX.mem()}catch(e){return null}};
function rfx(){const M=mem(),n=Date.now();if(!M)return null;for(const id in RX){const r=RX[id];if(!M[id]||!M[id].ad||n-r.ts>9000){delete RX[id];continue}if(r.wx||r.di||r.hd)return r}return null}
window.WFUN_RECV=(id,d)=>{if(ok())return;const M=mem();if(!M||!M[id]||!M[id].ad)return;
 RX[id]={ts:Date.now(),wx:WX.some(w=>w[0]==d.wx)?d.wx:'',sz:d.sz=='giant'||d.sz=='tiny'?d.sz:'',di:d.di?1:0,hd:d.hd?1:0,cr:d.cr>0&&d.cr<=3?+d.cr:0,ci:d.ci|0}};
setInterval(()=>{try{const M=window.MPFX;if(!M||!M.on()||!ok())return;const cr=mode=='drive'&&dr&&dr.fxk?dr.fxk:0,o={t:'fx',wx:F.wx,sz:F.size,di:F.disco?1:0,hd:F.head?1:0,cr,ci:cr?dr.i:0},k=JSON.stringify(o),n=Date.now();
 if(k!==lastFx||n-lastFxT>3000){lastFx=k;lastFxT=n;M.send(o)}}catch(e){}},500);
/* other admins' avatars: size and temporary car */
function avFx(){try{const M=window.MPFX;if(!M)return;const A=M.av();for(const id in A){const a=A[id],r=RX[id],ex=r&&Date.now()-r.ts<9000&&mem()[id]&&mem()[id].ad&&!ok()?r:null,k=ex?(ex.sz=='giant'?2.6:ex.sz=='tiny'?.45:1):1,cr=ex?ex.cr:0;
  a.g.scale.setScalar(k);bigHead(a.g,!!(ex&&ex.hd));
  const c=CX[id];if(c&&(!cr||c.k!=cr||c.i!=ex.ci)){a.g.remove(c.m);delete CX[id]}
  if(cr&&!CX[id]&&CARS[ex.ci]){const m=mkS(carb(ex.ci));m.scale.setScalar(1.5*cr/k);a.g.add(m);CX[id]={m,k:cr,i:ex.ci}}
  if(CX[id]&&CX[id].m.parent!==a.g)delete CX[id]}}catch(e){}}
/* ---- the app ---- */
const NAMES={giant:'Giant you',tiny:'Tiny you',slow:'Slow-mo',hyper:'Hyper speed',moon:'Moon jump',disco:'Disco party',head:'Big heads',spin:'Spin cycle',drunk:'Drunk camera'};
window.WFUN={
 wx:k=>{if(!ok())return;F.wx=F.wx==k?'':k;W.cyc=0;if(k=='chaos')W.ci=0;if(!F.wx)setKind('');phR()},
 set:(g,k)=>{if(!ok())return;F[g]=F[g]==k?'':k;phR();say(F[g]?NAMES[k]+' on':NAMES[k]+' off')},
 tog:k=>{if(!ok())return;F[k]=F[k]?0:1;if(k=='moon'&&F.moon)say('Press Space to jump');else say(NAMES[k]+(F[k]?' on':' off'));phR()},
 car:k=>car(k),reset:()=>{if(ok())reset()}};
const ic=(()=>{try{const r=['..KKKKKK..','.KPPPPPPK.','KPPWPPWPPK','KPPPPPPPPK','KPWWWWWWPK','KPPPPPPPPK','.KPPPPPPK.','..KKKKKK..'],p={K:'#1a0a2e',P:'#ff4fd8',W:'#fff3a8'},c=document.createElement('canvas');c.width=10;c.height=8;const x=c.getContext('2d');r.forEach((l,y)=>[...l].forEach((h,i)=>{if(p[h]){x.fillStyle=p[h];x.fillRect(i,y,1,1)}}));return c.toDataURL()}catch(e){return''}})();
GP_TITLE.fun='Admin fun';
const btn=(on,oc,t,sub)=>`<button class="${on?'go':''}" style="text-align:left;padding:6px 8px;flex:1 1 44%" onclick="${oc}">${t}${sub?`<br><small class=m>${sub}</small>`:''}</button>`;
function body(){return`<div class=phs2><div class=pcd><h3>CRAZY WEATHER</h3><div class=pbt>${WX.map(w=>btn(F.wx==w[0],`WFUN.wx('${w[0]}')`,w[2])).join('')}</div></div>
 <div class=pcd><h3>SIZE AND SPEED</h3><div class=pbt>${btn(F.size=='giant',"WFUN.set('size','giant')",NAMES.giant)}${btn(F.size=='tiny',"WFUN.set('size','tiny')",NAMES.tiny)}${btn(F.speed=='slow',"WFUN.set('speed','slow')",NAMES.slow)}${btn(F.speed=='hyper',"WFUN.set('speed','hyper')",NAMES.hyper)}</div></div>
 <div class=pcd><h3>CARS</h3><div class=pbt>${btn(0,'WFUN.car(0.4)','Tiny car','Spawns one under you')}${btn(0,'WFUN.car(3)','Giant car','Spawns one under you')}</div></div>
 <div class=pcd><h3>PARTY</h3><div class=pbt>${btn(F.moon,"WFUN.tog('moon')",NAMES.moon,'Space to jump')}${btn(F.disco,"WFUN.tog('disco')",NAMES.disco)}${btn(F.head,"WFUN.tog('head')",NAMES.head)}${btn(F.spin,"WFUN.tog('spin')",NAMES.spin)}${btn(F.drunk,"WFUN.tog('drunk')",NAMES.drunk)}</div></div>
 <button class=go style="width:100%" onclick="WFUN.reset()">Reset everything</button><p class=sub>Admin only. Nothing here is saved.</p></div>`}
{const b0=phBody;phBody=function(){if(PH.app!='fun')return b0.apply(this,arguments);if(!ok()){PH.app='home';return b0.apply(this,arguments)}if(PH.loading)return b0.apply(this,arguments);return body()}}
{const r0=phR;phR=function(){try{const i=GP_APPS.findIndex(a=>a[0]=='fun'),a=ok();if(a&&i<0)GP_APPS.push(['fun','Admin',()=>ic,'#ff4fd8']);if(!a&&i>=0)GP_APPS.splice(i,1)}catch(e){}return r0.apply(this,arguments)}}
/* v46.2.1: only the admin spawns into a band room with the best Gphone (the band character's own save, never the career saves) */
setInterval(()=>{try{if(!ok()||!sessionStorage.getItem('fw_mp'))return;const b=Math.max.apply(null,Object.keys(GPH).map(Number));if(!(S.phone>=b)){S.phone=b;say('Admin: Gphone '+b+' unlocked for this band room.')}}catch(e){}},2000);
})();
