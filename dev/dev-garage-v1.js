/* WaveFern dev garage customisation. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Talk to Tom in the garage: a Garage screen lists every car; press one to change its colour and pattern.
   Saved in S.carCust = { carIndex: {c: body colour, p: pattern number, c2: pattern colour} } (same save as everything else).
   Owned cars use it everywhere: parked by the house, in the garage room and when you drive. Add ?nogarage to the address to skip it. */
(function(){
 if(!window.FW_DEV)return;
 if(/[?&]nogarage/.test(location.search))return;

 const COLS=[['Sunshine','#e6b422'],['Ocean','#3b82f6'],['Forest','#2f8f5a'],['Racing red','#c0392b'],['Midnight','#22252b'],['Pearl','#e8e8ec'],
  ['Orange','#ff8a30'],['Purple','#8e44ad'],['Hot pink','#ff4fa3'],['Teal','#16b8b0'],['Lime','#9be02a'],['Silver','#9aa0a8']];
 const PATS=['Plain','Racing stripes','Side stripe','Two-tone roof','Hood and boot','Checker band'];
 const TOM_HIT='Talk to Tom (mechanic)';
 let dMat=null,pvR=null,pvS=null,pvC=null,pvM=null,pvRaf=0,view=null;

 const cust=i=>{try{const c=S.carCust&&S.carCust[i];return c&&typeof c=='object'?c:null}catch(e){return null}};
 const okHex=h=>typeof h=='string'&&/^#[0-9a-f]{6}$/i.test(h);

 /* ---------- pattern decals: thin boxes laid just over the paint, merged into one mesh ---------- */
 const decalCache={};
 function decalGeo(st,pat,c2){const key=st+'|'+pat+'|'+c2;if(decalCache[key])return decalCache[key];
  const S0=CSPEC[st],{L,W,r,yb,yh,yhf,ytr,fo,ro}=S0,[zr0,zr1,zf1,zf0,yt]=S0.cab,Wc=W*S0.cw,ra=r+.035,parts=[];
  const box=(w,h,d,x,y,z,c,rx)=>{const g=new THREE.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);g.translate(x,y,z);parts.push([g,new THREE.Color(c)])};
  const e=.008;
  const hood=(w,x)=>{const hz0=zf0+.02,hz1=L/2-.1,a=Math.atan2(yh-yhf,hz1-hz0);box(w,.012,Math.hypot(hz1-hz0,yh-yhf),x,(yh+yhf)/2+e,(hz0+hz1)/2,c2,a)};
  const roof=(w,x)=>box(w,.012,zf1-zr1,x,yt+e,(zr1+zf1)/2,c2);
  const boot=(w,x)=>box(w,.012,zr0+L/2-.06,x,ytr+e,(zr0-L/2+.06)/2,c2);
  /* the band along the doors, kept above the wheel arches and behind the bonnet */
  const bh=.055,by=Math.max(yh-.05,yb+ra+.012+bh/2),bz0=-L/2+.1,bz1=zf0-.02;
  if(pat==1){[-1,1].forEach(s=>{const x=s*.09;hood(.08,x);roof(.08,x);boot(.08,x)})}
  else if(pat==2){[-1,1].forEach(s=>box(.012,bh,bz1-bz0,s*(W/2+.004),by,(bz0+bz1)/2,c2))}
  else if(pat==3){roof(Wc*.98,0);[-1,1].forEach(s=>box(.012,Math.max(.03,yt-yh-.1),.07,s*(Wc/2+.004),(yh+yt)/2,(zr1+zf1)/2-.04,c2))}
  else if(pat==4){hood(W*.62,0);boot(W*.62,0)}
  else if(pat==5){const n=Math.max(4,Math.round((bz1-bz0)/.12)),sz=(bz1-bz0)/n;
   for(let k=0;k<n;k++)for(let row=0;row<2;row++)if((k+row)%2==0)[-1,1].forEach(s=>box(.012,bh/2,sz,s*(W/2+.004),by+(row?-1:1)*bh/4,bz0+sz*(k+.5),c2))}
  let n=0;parts.forEach(p=>{p[0]=p[0].toNonIndexed();n+=p[0].attributes.position.count});
  const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
  parts.forEach(([g,c])=>{const cnt=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);for(let q=0;q<cnt;q++){const j=(o+q)*3;C[j]=c.r;C[j+1]=c.g;C[j+2]=c.b}o+=cnt;g.dispose()});
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('color',new THREE.BufferAttribute(C,3));
  geo.computeBoundingBox();geo.computeBoundingSphere();return decalCache[key]=geo}
 function decalMat(){return dMat||(dMat=new THREE.MeshPhongMaterial({vertexColors:true,shininess:70,specular:0x5a5a5a,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))}

 /* a car model list for car i with a given look (the same contract as carList in 39-car-models.js, plus one pattern mesh) */
 const carList0=carList;
 function looked(i,cu){const col=cu&&okHex(cu.c)?cu.c:CARS[i].c,a=carList0(i,col,1),pat=cu&&PATS[cu.p]&&cu.p>0?cu.p|0:0;
  if(!pat)return a;const c2=okHex(cu.c2)?cu.c2:'#f2f2f2',f0=a.forEach;
  a.forEach=function(cb){f0.call(a,cb);const m=cb([1,1,1,'#fff',0,0,0]);if(m&&m.isMesh){m.geometry=decalGeo(i,pat,c2);m.material=decalMat();m.scale.set(1,1,1)}};return a}
 /* your own cars (no traffic colour given) wear their saved look everywhere; traffic and shop cars are untouched */
 carList=function(i,cc,fixed){if(cc===undefined&&CARS[i]&&cust(i))return looked(i,cust(i));return carList0(i,cc,fixed)};

 function refreshCars(i){try{delete PVM['c:'+i]}catch(e){}try{parkCars()}catch(e){}}
 function setLook(i,k,v){S.carCust=S.carCust&&typeof S.carCust=='object'?S.carCust:{};const c=Object.assign({c:CARS[i].c,p:0,c2:'#f2f2f2'},S.carCust[i]||{});c[k]=v;S.carCust[i]=c;try{updateVersion()}catch(e){}refreshCars(i)}
 function resetLook(i){if(S.carCust)delete S.carCust[i];try{updateVersion()}catch(e){}refreshCars(i)}

 /* ---------- 3D preview (its own small renderer, so the game scene is never touched) ---------- */
 function pvInit(){if(pvR)return true;try{
  pvR=new THREE.WebGLRenderer({antialias:true,alpha:true});pvR.setPixelRatio(Math.min(2,window.devicePixelRatio||1));pvR.setSize(320,170);
  pvR.domElement.id='gcv';pvR.domElement.style.cssText='width:100%;max-width:320px;height:auto;display:block;margin:6px auto;background:#0d1210;border-radius:6px';
  pvS=new THREE.Scene();pvS.add(new THREE.AmbientLight(0xffffff,.75));const d=new THREE.DirectionalLight(0xffffff,.8);d.position.set(3,5,4);pvS.add(d);
  pvC=new THREE.PerspectiveCamera(35,320/170,.1,50);pvC.position.set(0,2.4,5.2);pvC.lookAt(0,.7,0);return true}catch(e){pvR=null;return false}}
 function pvShow(i,cu){if(!pvInit())return;if(pvM){pvS.remove(pvM)}pvM=mkS(looked(i,cu));pvM.scale.setScalar(1.6);pvS.add(pvM);
  const slot=document.getElementById('gcvs');if(slot&&pvR.domElement.parentNode!==slot)slot.appendChild(pvR.domElement);
  cancelAnimationFrame(pvRaf);const tick=()=>{if(!document.getElementById('gcv')||!pvM)return;pvM.rotation.y+=.012;pvR.render(pvS,pvC);pvRaf=requestAnimationFrame(tick)};tick()}
 function pvStop(){cancelAnimationFrame(pvRaf);pvM=null}

 /* ---------- screens ---------- */
 const sw=(c,on,fn,t)=>`<button type=button title="${t}" aria-label="${t}" onclick="${fn}" style="width:34px;height:34px;padding:0;margin:3px;background:${c};border:3px solid ${on?'#fff':'#000'};box-shadow:${on?'0 0 0 2px #2fe68a':'none'}"></button>`;
 function listUI(){pvStop();view=null;
  const own=(S.cars||[]);
  $('ui').innerHTML=`<div class="box modal" id="gar" style="width:min(600px,92vw);max-height:94vh;overflow:auto"><h2>Tom's Garage</h2><p><i>Tom: "Pick a car and I will give it a new look."</i></p>
   ${own.length?'':'<p class=m>You do not own a car yet. Book one on the Cars website on your PC.</p>'}
   <div class=cards style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))!important">${CARS.map((c,i)=>{const o=own.includes(i),cu=cust(i);return`<div class=card style="${o?'':'opacity:.55'}"><b style="font-size:15px;color:var(--t)">${c.n}</b>
     <p class=m>${o?(cu?(PATS[cu.p]||'Plain')+' pattern':'Stock paint'):'Not owned'}</p>
     <div style="height:14px;border-radius:3px;margin:4px 0 8px;background:${o&&cu&&okHex(cu.c)?cu.c:c.c};border:2px solid #000"></div>
     <button class=go ${o?'':'disabled'} onclick="gcOpen(${i})">${o?'Customise':'Locked'}</button></div>`}).join('')}</div>
   <button onclick="closeUI()">Leave</button></div>`}
 function carUI(i){view=i;const cu=Object.assign({c:CARS[i].c,p:0,c2:'#f2f2f2'},cust(i)||{});
  $('ui').innerHTML=`<div class="box modal" id="gar" style="max-height:94vh;overflow:auto"><h2>${CARS[i].n}</h2><div id=gcvs></div>
   <p class=m style="margin:6px 0 0">Colour</p><div>${COLS.map(x=>sw(x[1],x[1]==cu.c,`gcSet(${i},'c','${x[1]}')`,x[0])).join('')}</div>
   <p class=m style="margin:6px 0 0">Pattern</p><div style="display:flex;flex-wrap:wrap;gap:4px">${PATS.map((n,k)=>`<button type=button ${k==cu.p?'class=go':''} onclick="gcSet(${i},'p',${k})">${n}</button>`).join('')}</div>
   ${cu.p>0?`<p class=m style="margin:6px 0 0">Pattern colour</p><div>${COLS.concat([['White','#f2f2f2'],['Black','#1c1d20']]).map(x=>sw(x[1],x[1]==cu.c2,`gcSet(${i},'c2','${x[1]}')`,x[0])).join('')}</div>`:''}
   <div class=ng style="margin-top:10px"><button onclick="gcReset(${i})">Stock paint</button><button class=go onclick="gcList()">Back</button></div></div>`;
  pvShow(i,cu)}
 window.gcOpen=i=>{if(!(S.cars||[]).includes(i))return snd('err');snd('ping');carUI(i)};
 window.gcList=()=>{snd('ping');listUI()};
 window.gcSet=(i,k,v)=>{if(!(S.cars||[]).includes(i))return;if((k=='c'||k=='c2')&&!okHex(v))return;if(k=='p'&&!PATS[v])return;setLook(i,k,v);snd('ping');carUI(i)};
 window.gcReset=i=>{resetLook(i);snd('ping');carUI(i)};
 window.openCarGarage=()=>{mode='menu';listUI()};

 /* ---------- Tom opens it ---------- */
 function hook(){try{const t=INT.find(o=>o.l==TOM_HIT);if(!t)return false;if(t.gc)return true;t.gc=1;t.a=()=>{snd('ping');window.openCarGarage()};return true}catch(e){return false}}
 let n=0;const iv=setInterval(()=>{hook();if(++n>600)clearInterval(iv)},500);
})();
