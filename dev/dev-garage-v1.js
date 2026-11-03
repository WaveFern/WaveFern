/* WaveFern dev garage customisation. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Talk to Tom in the garage: a paint-shop screen lists every car; press one to change its colour and pattern.
   Saved in S.carCust = { carIndex: {c: body colour, p: pattern number, c2: pattern colour} } (same save as everything else).
   Pattern numbers never change once added (old saves keep their look). Owned cars use the look everywhere: parked by the house,
   in the garage room and when you drive. Add ?nogarage to the address to skip it. */
(function(){
 if(!window.FW_DEV)return;
 if(/[?&]nogarage/.test(location.search))return;

 const COLS=[['Sunshine','#e6b422'],['Ocean','#3b82f6'],['Forest','#2f8f5a'],['Racing red','#c0392b'],['Midnight','#22252b'],['Pearl','#e8e8ec'],
  ['Orange','#ff8a30'],['Purple','#8e44ad'],['Hot pink','#ff4fa3'],['Teal','#16b8b0'],['Lime','#9be02a'],['Silver','#9aa0a8'],
  ['Burgundy','#7b1e3a'],['Navy','#1f3a8a'],['Mint','#7fe3b3'],['Sand','#d8c08a'],['Gold','#c9a227'],['Graphite','#4a4f56']];
 const PCOLS=COLS.concat([['White','#f2f2f2'],['Black','#1c1d20']]);
 /* pattern number = position here. Only ever add to the end. */
 const PATS=['Plain','Racing stripes','Side stripe','Two-tone roof','Hood and boot','Checker band','Centre stripe','Double side stripe','Pinstripe',
  'Rocker stripe','Two-tone lower','Chequered roof','Hazard band','Flames','Lightning','Polka dots','Camo','Race roundels','Fade','Chevrons','Zebra','Half and half','Sparkle'];
 const SHOW=[0,1,6,2,9,3,10,4,21,5,17,13,18,15,16];
 const TOM_HIT='Talk to Tom (mechanic)';
 let pvR=null,pvS=null,pvC=null,pvM=null,pvRaf=0;
 const PW=360,PH=200;

 const cust=i=>{try{const c=S.carCust&&S.carCust[i];return c&&typeof c=='object'?c:null}catch(e){return null}};
 const okHex=h=>typeof h=='string'&&/^#[0-9a-f]{6}$/i.test(h);
 const patOk=p=>Number.isInteger(p)&&p>=0&&p<PATS.length;

 /* ---------- patterns are painted onto the car's own paint by a small shader, so they always sit on the body ----------
    Only the car's body-colour surfaces are changed (glass, wheels, trim and lights keep their colour). Positions are in the
    car's own space: x across, y up, z forward. */
 const GL_COMMON='varying vec3 vOP;varying vec3 vON;';
 const GL_FRAG='uniform vec3 uBody;uniform vec3 uC2;uniform float uPat;uniform vec4 uD;uniform vec4 uE;varying vec3 vOP;varying vec3 vON;\n'+
 'float gcH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+
 'float gcN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(gcH(i),gcH(i+vec2(1,0)),f.x),mix(gcH(i+vec2(0,1)),gcH(i+vec2(1,1)),f.x),f.y);}\n'+
 'vec3 gcPat(vec3 b){\n'+
 ' vec3 p=vOP,n=normalize(vON),k=uC2,dk=uC2*.45,c=b;\n'+
 ' float L=uD.x,W=uD.y,yb=uD.z,yh=uD.w,yt=uE.x,zf=uE.y,zr=uE.z,pt=uPat;\n'+
 ' bool side=abs(n.x)>.6,top=n.y>.55,frontback=abs(n.z)>.6;\n'+
 ' float by=yb+(yh-yb)*.64,e=.012;\n'+
 ' float d=-1.;\n'+
 ' if(pt==1.){if(top)d=W*.085-abs(abs(p.x)-W*.17);}\n'+
 ' else if(pt==2.){if(side)d=.05-abs(p.y-by);}\n'+
 ' else if(pt==3.){if(p.y>yh+.05)return k;return b;}\n'+
 ' else if(pt==4.){if(top&&(p.z>zf-.03||p.z<zr+.03))return k;return b;}\n'+
 ' else if(pt==5.){if(side&&abs(p.y-by)<.05){float r=step(by,p.y);float s=mod(floor(p.z*15.)+r,2.);return s<1.?k:vec3(.1,.1,.12);}return b;}\n'+
 ' else if(pt==6.){if(top)d=W*.16-abs(p.x);}\n'+
 ' else if(pt==7.){if(side)d=max(.02-abs(p.y-by-.04),.02-abs(p.y-by+.04));}\n'+
 ' else if(pt==8.){if(side)d=max(.007-abs(p.y-by-.02),.007-abs(p.y-by+.02));if(top)d=max(.007-abs(p.x-W*.16),.007-abs(p.x+W*.16));}\n'+
 ' else if(pt==9.){if(side)d=.034-abs(p.y-(yb+.1));}\n'+
 ' else if(pt==10.){if(!top&&p.y<yb+(yh-yb)*.5)return k;return b;}\n'+
 ' else if(pt==11.){if(top){float s=mod(floor(p.x*11.)+floor(p.z*11.),2.);return s<1.?k:vec3(.1,.1,.12);}return b;}\n'+
 ' else if(pt==12.){if(side&&p.y<yb+.15&&p.y>yb+.04){float s=fract((p.z+p.y)*7.);d=.0;return s<.5?k:vec3(.1,.1,.12);}return b;}\n'+
 ' else if(pt==13.){if(side){float t=(p.z+L*.5)/L;float u=fract(p.z*3.+p.y*1.2);float sh=pow(1.-abs(u*2.-1.),.75);float h=(yh-yb)*1.05*sh*smoothstep(.0,.8,t)+.012;float r=p.y-(yb+.03);\n'+
  '  if(r>0.&&r<h){c=k;if(r<h*.68)c=vec3(1.,.56,.1);if(r<h*.36)c=vec3(1.,.9,.35);return c;}}return b;}\n'+
 ' else if(pt==14.){if(side)d=.028-abs(p.y-(by+.05*(abs(fract(p.z*3.)*2.-1.)*2.-1.)));}\n'+
 ' else if(pt==15.){vec2 uv=side?vec2(p.z,p.y):(top?vec2(p.x,p.z):vec2(-9.));if(uv.x>-8.){uv/=.17;uv.x+=mod(floor(uv.y),2.)*.5;if(length(fract(uv)-.5)<.3)return k;}return b;}\n'+
 ' else if(pt==16.){float v=gcN(p.xz*6.+p.y*4.)*.7+gcN(p.zy*13.+p.x*5.)*.3;if(v>.6)return k;if(v>.44)return mix(b,k,.5)*.8;return b;}\n'+
 ' else if(pt==17.){vec2 q=vec2(p.z-(zf+zr)*.5,p.y-(yb+yh)*.5-.03);float r=min(.17,(yh-yb)*.46);if(side){float l=length(q);if(l<r){c=k;if(l<r*.8)c=vec3(.1,.1,.12);if(l<r*.62)c=vec3(.96);return c;}}\n'+
  '  if(top&&p.z>zf){float l=length(vec2(p.x,p.z-(zf+L*.5)*.5));if(l<.15){c=k;if(l<.12)c=vec3(.1,.1,.12);if(l<.09)c=vec3(.96);return c;}}return b;}\n'+
 ' else if(pt==18.){if(!top){float t=clamp((p.y-yb)/(yh-yb+.05),0.,1.);return mix(k,b,smoothstep(.0,.95,t));}return b;}\n'+
 ' else if(pt==19.){if(side){float v=abs(p.y-by);if(v<.06&&fract((p.z+v*1.1)*3.5)<.38)return k;}return b;}\n'+
 ' else if(pt==20.){if(side||top){float s=side?p.z:p.z;if(fract(s*7.)<.42)return k;}return b;}\n'+
 ' else if(pt==21.){if(p.x>0.)return k;return b;}\n'+
 ' else if(pt==22.){vec2 uv=side?vec2(p.z,p.y):(top?vec2(p.x,p.z):vec2(-9.));if(uv.x>-8.){uv/=.11;vec2 i=floor(uv);if(gcH(i)>.8&&length(fract(uv)-.5)<.22)return k;}return b;}\n'+
 ' if(d>0.)return d<e?dk:k;\n'+
 ' return b;}\n';
 const patMats={};
 function patMat(st,col,pat,c2){const key=st+'|'+col+'|'+pat+'|'+c2;if(patMats[key])return patMats[key];
  const S0=CSPEC[st],m=carMats()[0].clone(),V=h=>{const c=new THREE.Color(h);return new THREE.Vector3(c.r,c.g,c.b)};
  m.onBeforeCompile=sh=>{
   sh.uniforms.uBody={value:V(col)};sh.uniforms.uC2={value:V(c2)};sh.uniforms.uPat={value:pat};
   sh.uniforms.uD={value:new THREE.Vector4(S0.L,S0.W/2,S0.yb,S0.yh)};sh.uniforms.uE={value:new THREE.Vector4(S0.cab[4],S0.cab[3],S0.cab[0],S0.ytr)};
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+GL_COMMON).replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position;vON=normal;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+GL_FRAG).replace('#include <color_fragment>','#include <color_fragment>\nif(distance(vColor,uBody)<.03)diffuseColor.rgb=gcPat(vColor);')};
  m.customProgramCacheKey=()=>'gcar1';return patMats[key]=m}

 const carList0=carList;
 /* the Phantom GT has gold stripes built into its model: recolour them to the body so a chosen look replaces them */
 const cleanCache={};
 function cleanGeo(st,col){if(st!=4)return carGeo(st,col);const k=st+col;if(cleanCache[k])return cleanCache[k];const g=carGeo(st,col).clone(),c=g.attributes.color,ca=c.array.slice(),b=new THREE.Color(col),gold=new THREE.Color('#e6b422');
  for(let q=0;q<ca.length;q+=3)if(Math.abs(ca[q]-gold.r)<.01&&Math.abs(ca[q+1]-gold.g)<.01&&Math.abs(ca[q+2]-gold.b)<.01){ca[q]=b.r;ca[q+1]=b.g;ca[q+2]=b.b}
  g.setAttribute('color',new THREE.BufferAttribute(ca,3));return cleanCache[k]=g}
 function looked(i,cu){const col=cu&&okHex(cu.c)?cu.c:CARS[i].c,a=carList0(i,col,1),pat=cu&&patOk(cu.p)&&cu.p>0?cu.p:0;
  const c2=okHex(cu&&cu.c2)?cu.c2:'#f2f2f2';
  a.forEach=function(cb){const m=cb([1,1,1,'#fff',0,0,0]);if(m&&m.isMesh){m.geometry=cleanGeo(i,col);const M=carMats();m.material=pat?[patMat(i,col,pat,c2),M[1],M[2]]:M;m.scale.set(1,1,1)}};return a}
 /* your own cars (no traffic colour given) wear their saved look everywhere; traffic and shop cars are untouched */
 carList=function(i,cc,fixed){if(cc===undefined&&CARS[i]&&cust(i))return looked(i,cust(i));return carList0(i,cc,fixed)};

 function refreshCars(i){try{delete PVM['c:'+i]}catch(e){}try{parkCars()}catch(e){}}
 function setLook(i,k,v){S.carCust=S.carCust&&typeof S.carCust=='object'?S.carCust:{};const c=Object.assign({c:CARS[i].c,p:0,c2:'#f2f2f2'},S.carCust[i]||{});c[k]=v;S.carCust[i]=c;try{updateVersion()}catch(e){}refreshCars(i)}
 function resetLook(i){if(S.carCust)delete S.carCust[i];try{updateVersion()}catch(e){}refreshCars(i)}

 /* ---------- 3D paint booth preview (its own small renderer, so the game scene is never touched) ---------- */
 function pvInit(){if(pvR)return true;try{
  pvR=new THREE.WebGLRenderer({antialias:true,alpha:true});pvR.setPixelRatio(Math.min(2,window.devicePixelRatio||1));pvR.setSize(PW,PH);
  pvR.domElement.id='gcv';pvS=new THREE.Scene();
  pvS.add(new THREE.AmbientLight(0xfff4e0,.8));const d=new THREE.DirectionalLight(0xffffff,.85);d.position.set(3,5,4);pvS.add(d);
  const plate=new THREE.Mesh(new THREE.CylinderGeometry(1.95,2.05,.06,28),new THREE.MeshLambertMaterial({color:0x4a4f58}));plate.position.y=-.03;pvS.add(plate);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.03,6,40),new THREE.MeshBasicMaterial({color:0xf2b705}));ring.rotation.x=Math.PI/2;ring.position.y=.01;pvS.add(ring);
  pvC=new THREE.PerspectiveCamera(33,PW/PH,.1,50);pvC.position.set(0,2.4,5.9);pvC.lookAt(0,.5,0);return true}catch(e){pvR=null;return false}}
 function pvShow(i,cu){if(!pvInit())return;if(pvM)pvS.remove(pvM);pvM=mkS(looked(i,cu));pvM.scale.setScalar(1.6);pvM.rotation.y=pvM._ry=.6;pvS.add(pvM);
  const slot=document.getElementById('gcvs');if(slot&&pvR.domElement.parentNode!==slot)slot.appendChild(pvR.domElement);
  cancelAnimationFrame(pvRaf);const tick=()=>{if(!document.getElementById('gcv')||!pvM)return;if(!pvM._hold)pvM.rotation.y+=.01;pvR.render(pvS,pvC);pvRaf=requestAnimationFrame(tick)};tick()}
 function pvStop(){cancelAnimationFrame(pvRaf);if(pvM&&pvS)pvS.remove(pvM);pvM=null;try{if(pvR&&pvR.domElement.parentNode)pvR.domElement.parentNode.removeChild(pvR.domElement)}catch(e){}}
 /* a still picture of a car in its current paint for the list (cached) */
 const thumbs={};
 function thumb(i){const cu=cust(i),k=i+JSON.stringify(cu||0);if(thumbs[k])return thumbs[k];if(!pvInit())return'';
  try{const hold=pvM;if(hold)pvS.remove(hold);const m=mkS(looked(i,cu));m.scale.setScalar(1.5);m.rotation.y=.7;pvS.add(m);pvR.render(pvS,pvC);const u=pvR.domElement.toDataURL('image/png');pvS.remove(m);if(hold)pvS.add(hold);return thumbs[k]=u}catch(e){return''}}

 /* ---------- look: a paint shop on a garage floor (only inside #gar) ---------- */
 function css(){if(document.getElementById('gcss'))return;const s=document.createElement('style');s.id='gcss';s.textContent=`
#ui .gar{--ink:#1a1b1e;--steel:#3b4048;--steel2:#2c3036;--hz:#f2b705;--or:#ff7a1a;--tx:#e9e6df;--mu:#a7a39a;
 background:#2c3036;color:var(--tx);border:4px solid var(--ink);border-radius:4px;box-shadow:0 0 0 3px var(--hz),0 10px 30px #000a;padding:0 0 16px;width:min(720px,94vw);max-height:94vh;overflow:auto;font-family:ui-monospace,Menlo,Consolas,monospace}
#ui .gar .gh{background:repeating-linear-gradient(-45deg,var(--hz) 0 14px,var(--ink) 14px 28px);height:14px}
#ui .gar .gs{margin:-1px 14px 0;background:var(--hz);color:var(--ink);padding:8px 14px 7px;text-align:center;border:3px solid var(--ink);border-top:0;font:700 20px Silkscreen,ui-monospace,monospace;letter-spacing:1px;position:relative;text-transform:uppercase}
#ui .gar .gs small{display:block;font:700 10px ui-monospace,monospace;letter-spacing:2px;margin-top:2px}
#ui .gar .gs:before,#ui .gar .gs:after{content:"";position:absolute;top:7px;width:7px;height:7px;border-radius:50%;background:#7a5d00;box-shadow:inset 1px 1px #ffe27a}
#ui .gar .gs:before{left:6px}#ui .gar .gs:after{right:6px}
#ui .gar .gm{margin:10px 16px 0;color:var(--mu);font-size:13px;font-style:italic}
#ui .gar .gm b{color:var(--hz);font-style:normal}
#ui .gar .gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:12px 16px 0}
#ui .gar .gc{background:var(--steel);border:3px solid var(--ink);border-radius:3px;padding:8px;box-shadow:3px 3px 0 #0008;position:relative}
#ui .gar .gc.lk{opacity:.55;filter:grayscale(.8)}
#ui .gar .gc img,#ui .gar .gc .gi{display:block;width:100%;aspect-ratio:${PW}/${PH};background:#23262b;border:2px solid var(--ink);border-radius:2px;object-fit:cover}
#ui .gar .gc .gi{display:flex;align-items:center;justify-content:center;color:var(--mu);font-size:12px}
#ui .gar .gc h3{margin:8px 0 2px;font:700 14px Silkscreen,ui-monospace,monospace;color:var(--tx);letter-spacing:.5px}
#ui .gar .gc p{margin:0 0 8px;color:var(--mu);font-size:12px;display:flex;align-items:center;gap:6px}
#ui .gar .gc .dot{width:12px;height:12px;border-radius:50%;border:2px solid var(--ink);flex:none}
#ui .gar .gc .tag{position:absolute;top:12px;left:12px;background:var(--ink);color:var(--hz);font:700 10px Silkscreen,monospace;padding:2px 6px;letter-spacing:1px}
#ui .gar button{font-family:Silkscreen,ui-monospace,monospace;text-transform:uppercase;letter-spacing:.5px;font-size:12px;background:#555b64;color:var(--tx);border:3px solid var(--ink);border-radius:3px;padding:8px 12px;cursor:pointer;box-shadow:inset 0 -3px #0006,2px 2px 0 #0008}
#ui .gar button:hover:not(:disabled){background:#6a7079}
#ui .gar button.go{background:var(--or);color:var(--ink)}#ui .gar button.go:hover:not(:disabled){background:#ff9640}
#ui .gar button:disabled{opacity:.5;cursor:default}
#ui .gar .gc button{width:100%}
#ui .gar .gf{display:flex;gap:10px;justify-content:space-between;margin:14px 0 0;padding:10px 16px 0;position:sticky;bottom:-16px;background:#2c3036;border-top:3px solid var(--ink)}
#ui .gar .gp{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:14px;margin:12px 16px 0}
@media(max-width:620px){#ui .gar .gp{grid-template-columns:1fr}}
#ui .gar #gcvs{background:#23262b;border:3px solid var(--ink);border-radius:3px;padding:4px;box-shadow:inset 0 0 0 2px #4b515a;align-self:start;position:sticky;top:0}
#ui .gar #gcv{display:block;width:100%;height:auto}
#ui .gar .gcar{margin:6px 2px 2px;display:flex;justify-content:space-between;color:var(--mu);font-size:11px;text-transform:uppercase;letter-spacing:1px}
#ui .gar .gcar b{color:var(--hz)}
#ui .gar .gk{background:var(--steel);border:3px solid var(--ink);border-radius:3px;padding:8px 10px 10px;margin-bottom:10px;box-shadow:3px 3px 0 #0008}
#ui .gar .gk h4{margin:0 0 6px;font:700 11px Silkscreen,monospace;color:var(--hz);letter-spacing:1.5px;text-transform:uppercase;display:flex;justify-content:space-between}
#ui .gar .gk h4 span{color:var(--tx);letter-spacing:.5px;text-transform:none;font:700 11px ui-monospace,monospace}
#ui .gar .gw{display:grid;grid-template-columns:repeat(auto-fill,minmax(34px,1fr));gap:6px}
#ui .gar .gw button{width:100%;aspect-ratio:1;padding:0;border-radius:50%;border:3px solid var(--ink);box-shadow:inset 0 3px 0 #fff5,inset 0 -4px 0 #0005,2px 2px 0 #0008}
#ui .gar .gw button.on{outline:3px solid var(--hz);outline-offset:1px}
#ui .gar .gt{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
#ui .gar .gt button{padding:4px 2px 3px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:9px;letter-spacing:0;line-height:1.1;text-align:center;min-height:0}
#ui .gar .gt button img{display:block;width:100%;height:auto;background:#23262b;border-radius:2px;aspect-ratio:240/132}
#ui .gar .gt button.on{background:var(--hz);color:var(--ink);outline:0}
`;document.head.appendChild(s)}

 /* ---------- picker pictures: every pattern drawn on the selected car, in its colours (cached) ---------- */
 let tR=null,tS=null,tC=null;const pthumbs={};
 function pthumb(i,cu,k){const key=i+'|'+cu.c+'|'+cu.c2+'|'+k;if(pthumbs[key])return pthumbs[key];
  try{if(!tR){tR=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});tR.setPixelRatio(1);tR.setSize(240,132);tS=new THREE.Scene();tS.add(new THREE.AmbientLight(0xfff4e0,.8));const d=new THREE.DirectionalLight(0xffffff,.85);d.position.set(3,5,4);tS.add(d);
    tC=new THREE.PerspectiveCamera(30,240/132,.1,50);tC.position.set(0,2.6,4.7);tC.lookAt(0,.45,0)}
   const m=mkS(looked(i,Object.assign({},cu,{p:k})));m.scale.setScalar(1.55);m.rotation.y=.78;tS.add(m);tR.render(tS,tC);const u=tR.domElement.toDataURL('image/png');tS.remove(m);return pthumbs[key]=u}catch(e){return''}}

 /* ---------- screens ---------- */
 const head=`<div class=gh></div><div class=gs>Tom's Garage<small>Custom paint shop</small></div>`;
 const chip=(c,on,fn,t)=>`<button type=button class="${on?'on':''}" title="${t}" aria-label="${t}" aria-pressed="${on?'true':'false'}" onclick="${fn}" style="background:${c}"></button>`;
 function listUI(){css();pvStop();const own=(S.cars||[]);
  $('ui').innerHTML=`<div class="box modal gar" id="gar">${head}
   <p class=gm><b>Tom:</b> "Pick a car and I will give it a fresh coat."</p>
   ${own.length?'':'<p class=gm>You do not own a car yet. Book one on the Cars website on your PC.</p>'}
   <div class=gl>${CARS.map((c,i)=>{const o=own.includes(i),cu=cust(i),img=o?thumb(i):'';return`<div class="gc ${o?'':'lk'}">${o?`<span class=tag>BAY ${i+1}</span>`:''}
     ${img?`<img src="${img}" alt="${c.n}">`:`<div class=gi>${o?'':'NOT OWNED'}</div>`}
     <h3>${c.n}</h3><p><span class=dot style="background:${o&&cu&&okHex(cu.c)?cu.c:c.c}"></span>${o?(cu&&patOk(cu.p)&&cu.p?PATS[cu.p]:cu?'Custom paint':'Stock paint'):'Not owned'}</p>
     <button class=go ${o?'':'disabled'} onclick="gcOpen(${i})">${o?'Customise':'Locked'}</button></div>`}).join('')}</div>
   <div class=gf><button onclick="closeUI()">Leave garage</button></div></div>`}
 function carUI(i){css();const cu=Object.assign({c:CARS[i].c,p:0,c2:'#f2f2f2'},cust(i)||{}),cn=n=>(COLS.concat(PCOLS).find(x=>x[1]==n)||[n,n])[0],pn=patOk(cu.p)?cu.p:0;
  $('ui').innerHTML=`<div class="box modal gar" id="gar">${head}
   <div class=gp><div><div id=gcvs></div><div class=gcar><span>${CARS[i].n}</span><b>Bay ${i+1}</b></div><div class=gk style="margin-top:10px;${pn>0?'':'opacity:.5'}"><h4>Pattern colour <span>${pn>0?cn(cu.c2):'pick a pattern first'}</span></h4><div class=gw>${PCOLS.map(x=>chip(x[1],x[1]==cu.c2,`gcSet(${i},'c2','${x[1]}')`,x[0])).join('')}</div></div></div>
   <div>
    <div class=gk><h4>Paint colour <span>${cn(cu.c)}</span></h4><div class=gw>${COLS.map(x=>chip(x[1],x[1]==cu.c,`gcSet(${i},'c','${x[1]}')`,x[0])).join('')}</div></div>
    <div class=gk><h4>Pattern <span>${PATS[pn]}</span></h4><div class=gt>${SHOW.map(k=>`<button type=button class="${k==pn?'on':''}" aria-pressed="${k==pn?'true':'false'}" onclick="gcSet(${i},'p',${k})"><img alt="" src="${pthumb(i,cu,k)}">${PATS[k]}</button>`).join('')}</div></div>
   </div></div>
   <div class=gf><button onclick="gcReset(${i})">Stock paint</button><button class=go onclick="gcList()">Done</button></div></div>`;
  pvShow(i,cu)}
 window.gcOpen=i=>{if(!(S.cars||[]).includes(i))return snd('err');snd('ping');carUI(i)};
 window.gcList=()=>{snd('ping');listUI()};
 window.gcSet=(i,k,v)=>{if(!(S.cars||[]).includes(i))return;if((k=='c'||k=='c2')&&!okHex(v))return;if(k=='p'&&!patOk(v))return;setLook(i,k,v);snd('ping');carUI(i)};
 window.gcReset=i=>{resetLook(i);snd('ping');carUI(i)};
 window.openCarGarage=()=>{mode='menu';listUI()};

 /* leaving by any route (Leave, Escape, walking off) always clears the preview */
 {const c0=closeUI;closeUI=function(){pvStop();return c0.apply(this,arguments)}}

 /* ---------- Tom opens it ---------- */
 function hook(){try{const t=INT.find(o=>o.l==TOM_HIT);if(!t)return false;if(t.gc)return true;t.gc=1;t.a=()=>{snd('ping');window.openCarGarage()};return true}catch(e){return false}}
 let n=0;const iv=setInterval(()=>{hook();if(++n>600)clearInterval(iv)},500);
})();
