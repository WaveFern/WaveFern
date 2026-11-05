/* WaveFern dev garage customisation. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Talk to Tom in the garage: a paint-shop screen lists every car; press one to change its colour and pattern.
   Customising costs money (see the price tables below); previewing is free. Previews use the Pixel size setting.
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
  'Rocker stripe','Two-tone lower','Chequered roof','Hazard band','Flames','Lightning','Polka dots','Camo','Race roundels','Fade','Chevrons','Zebra','Half and half','Sparkle',
  'Candy Cane','Snowfall','Gift Ribbon','Tinsel Garland','Northern Glow','Starlight Foil'];
 /* the Christmas wraps (pattern 23 to 28): only from Christmas crates, free to apply once you own them. Saved in S.wraps. */
 const WRAP0=23,wrapOwned=p=>p<WRAP0||!!(S.wraps&&S.wraps[p]);
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
 ' else if(pt==23.){if(side||top){float s=fract((p.z+p.y*1.2+p.x*.6)*3.5);return s<.5?vec3(.82,.1,.16):vec3(.97,.97,.97);}return b;}\n'+
 ' else if(pt==24.){if(p.y<yb+.05&&!top)return vec3(.97);vec2 uv=side?vec2(p.z,p.y):(top?vec2(p.x,p.z):vec2(-9.));if(uv.x>-8.){uv/=.09;if(gcH(floor(uv))>.7&&length(fract(uv)-.5)<.3)return vec3(.97);}return b;}\n'+
 ' else if(pt==25.){if(top&&abs(p.x)<.085)return abs(p.x)<.06?vec3(.8,.1,.15):vec3(.9,.7,.2);if(side&&abs(p.z-(zf+zr)*.5)<.1)return abs(p.z-(zf+zr)*.5)<.075?vec3(.8,.1,.15):vec3(.9,.7,.2);return b;}\n'+
 ' else if(pt==26.){if(side){float w=by+.05*(abs(fract(p.z*3.)*2.-1.)*2.-1.);if(abs(p.y-w)<.03)return vec3(1.,.82,.25);if(abs(p.y-w+.07)<.02)return vec3(.2,.7,.35);}return b;}\n'+
 ' else if(pt==27.){if(!top){float t=clamp((p.y-yb)/(yh-yb+.05)+sin(p.z*5.)*.12,0.,1.);vec3 g=mix(vec3(.1,.85,.5),vec3(.5,.3,.95),t);return mix(b,g,.85);}return b;}\n'+
 ' else if(pt==28.){vec2 uv=side?vec2(p.z,p.y):(top?vec2(p.x,p.z):vec2(-9.));if(uv.x>-8.){if(abs(p.y-by)<.02&&side)return vec3(1.,.82,.25);uv/=.075;if(gcH(floor(uv))>.78&&length(fract(uv)-.5)<.3)return vec3(1.,.9,.5);return mix(b,vec3(.08,.1,.3),.7);}return b;}\n'+
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

 window.FW_GARAGE={looked:(i,cu)=>looked(i,cu),WRAP0};
 function refreshCars(i){try{delete PVM['c:'+i]}catch(e){}try{parkCars()}catch(e){}}
 function setLook(i,k,v){S.carCust=S.carCust&&typeof S.carCust=='object'?S.carCust:{};const c=Object.assign({c:CARS[i].c,p:0,c2:'#f2f2f2'},S.carCust[i]||{});c[k]=v;S.carCust[i]=c;try{updateVersion()}catch(e){}refreshCars(i)}
 function resetLook(i){if(S.carCust)delete S.carCust[i];try{updateVersion()}catch(e){}refreshCars(i)}


 /* ---------- prices: fancier colours and patterns cost more. Previewing is always free; you only pay for what you change ---------- */
 const COL_TIER={'#ff8a30':1,'#e6b422':1,'#3b82f6':1,'#2f8f5a':1,'#c0392b':1,'#8e44ad':1,'#ff4fa3':1,'#16b8b0':1,'#9be02a':1,'#d8c08a':1,
  '#22252b':2,'#9aa0a8':2,'#7b1e3a':2,'#1f3a8a':2,'#7fe3b3':2,'#4a4f56':2,'#e8e8ec':3,'#c9a227':3};
 const COL_PRICE=[0,60,140,300];
 const colP=h=>COL_PRICE[COL_TIER[String(h).toLowerCase()]||1];
 const pcolP=h=>{h=String(h).toLowerCase();return h=='#f2f2f2'||h=='#1c1d20'?20:Math.round(colP(h)/2)};
 const PAT_TIER=[0,1,1,1,1,2,1,2,1,1,2,2,2,3,3,3,3,2,2,2,3,2,3,0,0,0,0,0,0];
 const PAT_PRICE=[0,120,260,550];
 const patP=p=>p>=WRAP0?0:PAT_PRICE[PAT_TIER[p]||1];
 const stockLook=i=>({c:CARS[i].c,p:0,c2:'#f2f2f2'});
 const savedLook=i=>Object.assign(stockLook(i),cust(i)||{});
 let DR=null;
 /* what the draft costs: only the parts that differ from the saved look */
 function cost(i,d){const s=savedLook(i),st=CARS[i].c.toLowerCase();let t=0;
  if(d.c.toLowerCase()!=s.c.toLowerCase()&&d.c.toLowerCase()!=st)t+=colP(d.c);
  if(d.p>0&&d.p!=s.p)t+=patP(d.p);
  if(d.p>0&&d.p<WRAP0&&d.c2.toLowerCase()!='#f2f2f2'&&(d.c2!=s.c2||s.p==0))t+=pcolP(d.c2);
  return t}
 const same=(a,b)=>a.c==b.c&&a.p==b.p&&(a.p==0||a.c2==b.c2);
 const mny=n=>{try{return $$(n)}catch(e){return'$'+n}};

 /* ---------- the pixel effect: previews are drawn small and stretched, like the game, using the Pixel size setting (Settings > Graphics) ---------- */
 const pxN=()=>{try{const v=+gfxCur().px;return v>=2?Math.min(8,v):1}catch(e){return 1}};
 const pxSize=(r,w,h)=>{const p=pxN();r.setPixelRatio(1);r.setSize(Math.max(1,Math.ceil(w/p)),Math.max(1,Math.ceil(h/p)),false);r.domElement.style.imageRendering=p>1?'pixelated':'auto'};

 /* ---------- 3D paint booth preview (its own small renderer, so the game scene is never touched) ---------- */
 function pvInit(){if(pvR)return true;try{
  pvR=new THREE.WebGLRenderer({antialias:false,alpha:true});
  pvR.domElement.id='gcv';pvR.domElement.style.cssText='display:block;width:100%;height:auto;aspect-ratio:'+PW+'/'+PH;pvS=new THREE.Scene();
  pvS.add(new THREE.AmbientLight(0xfff4e0,.8));const d=new THREE.DirectionalLight(0xffffff,.85);d.position.set(3,5,4);pvS.add(d);
  const plate=new THREE.Mesh(new THREE.CylinderGeometry(1.95,2.05,.06,28),new THREE.MeshLambertMaterial({color:0x4a4f58}));plate.position.y=-.03;pvS.add(plate);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.03,6,40),new THREE.MeshBasicMaterial({color:0x2fe68a}));ring.rotation.x=Math.PI/2;ring.position.y=.01;pvS.add(ring);
  pvC=new THREE.PerspectiveCamera(33,PW/PH,.1,50);pvC.position.set(0,2.4,5.9);pvC.lookAt(0,.5,0);return true}catch(e){pvR=null;return false}}
 function pvShow(i,cu){if(!pvInit())return;pxSize(pvR,PW,PH);if(pvM)pvS.remove(pvM);pvM=mkS(looked(i,cu));pvM.scale.setScalar(1.6);pvM.rotation.y=pvM._ry=.6;pvS.add(pvM);
  const slot=document.getElementById('gcvs');if(slot&&pvR.domElement.parentNode!==slot)slot.appendChild(pvR.domElement);
  cancelAnimationFrame(pvRaf);const tick=()=>{if(!document.getElementById('gcv')||!pvM)return;if(!pvM._hold)pvM.rotation.y+=.01;pvR.render(pvS,pvC);pvRaf=requestAnimationFrame(tick)};tick()}
 function pvStop(){cancelAnimationFrame(pvRaf);if(pvM&&pvS)pvS.remove(pvM);pvM=null;try{if(pvR&&pvR.domElement.parentNode)pvR.domElement.parentNode.removeChild(pvR.domElement)}catch(e){}}
 /* a still picture of a car in its current paint for the list (cached) */
 const thumbs={};
 function thumb(i){const cu=cust(i),k=pxN()+'|'+i+JSON.stringify(cu||0);if(thumbs[k])return thumbs[k];if(!pvInit())return'';
  try{pxSize(pvR,PW,PH);const hold=pvM;if(hold)pvS.remove(hold);const m=mkS(looked(i,cu));m.scale.setScalar(1.5);m.rotation.y=.7;pvS.add(m);pvR.render(pvS,pvC);const u=pvR.domElement.toDataURL('image/png');pvS.remove(m);if(hold)pvS.add(hold);return thumbs[k]=u}catch(e){return''}}

 /* ---------- look: the game's own pixel style (Silkscreen font, chunky black borders, flat colours, square corners) ---------- */
 function css(){if(document.getElementById('gcss'))return;const s=document.createElement('style');s.id='gcss';s.textContent=`
#ui .gar{--ink:#000;--pn:#161b18;--pn2:#26302a;--g:#2fe68a;--tx:#e8f3ec;--mu:#8aa094;--bad:#e07a7a;
 background:#0b0f0d;color:var(--tx);border:4px solid var(--ink);border-radius:0;box-shadow:inset 0 0 0 2px #2a352e,6px 6px 0 #0008;padding:0 0 12px;width:min(720px,94vw);max-height:94vh;overflow:auto;font:13px/1.35 ui-monospace,Menlo,Consolas,monospace}
#ui .gar img,#ui .gar canvas{image-rendering:pixelated}
#ui .gar .gs{background:var(--g);color:var(--ink);padding:10px 14px 8px;text-align:center;border-bottom:4px solid var(--ink);font:700 20px Silkscreen,ui-monospace,monospace;letter-spacing:1px;text-transform:uppercase}
#ui .gar .gs small{display:block;font:700 10px Silkscreen,monospace;letter-spacing:2px;margin-top:3px}
#ui .gar .gm{margin:10px 14px 0;color:var(--mu)}
#ui .gar .gm b{color:var(--g)}
#ui .gar .gb{margin:10px 14px 0;display:flex;justify-content:space-between;font:700 11px Silkscreen,monospace;color:var(--mu);text-transform:uppercase;letter-spacing:1px}
#ui .gar .gb b{color:var(--g)}
#ui .gar .gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:10px 14px 0}
#ui .gar .gc{background:var(--pn);border:3px solid var(--ink);border-radius:0;padding:8px;box-shadow:inset 0 0 0 2px #2a352e;position:relative}
#ui .gar .gc.lk{opacity:.5}
#ui .gar .gc img,#ui .gar .gc .gi{display:block;width:100%;aspect-ratio:${PW}/${PH};background:#0b0f0d;border:2px solid var(--ink);border-radius:0;object-fit:cover}
#ui .gar .gc .gi{display:flex;align-items:center;justify-content:center;color:var(--mu);font:700 10px Silkscreen,monospace}
#ui .gar .gc h3{margin:8px 0 2px;font:700 13px Silkscreen,ui-monospace,monospace;color:var(--tx)}
#ui .gar .gc p{margin:0 0 8px;color:var(--mu);font-size:12px;display:flex;align-items:center;gap:6px}
#ui .gar .gc .dot{width:12px;height:12px;border:2px solid var(--ink);flex:none}
#ui .gar .gc .tag{position:absolute;top:12px;left:12px;background:var(--ink);color:var(--g);font:700 10px Silkscreen,monospace;padding:2px 6px}
#ui .gar button{font:700 11px Silkscreen,ui-monospace,monospace;text-transform:uppercase;color:var(--tx);background:var(--pn2);border:2px solid var(--ink);border-radius:0;padding:8px 12px;cursor:pointer;box-shadow:inset 0 -3px #0007}
#ui .gar button:hover:not(:disabled){background:#364439}
#ui .gar button.go{background:var(--g);color:#04120a}#ui .gar button.go:hover:not(:disabled){background:#5af0a5}
#ui .gar button:disabled{opacity:.4;cursor:not-allowed}
#ui .gar .gc button{width:100%}
#ui .gar .gf{display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin:12px 0 0;padding:10px 14px 0;position:sticky;bottom:-12px;background:#0b0f0d;border-top:3px solid var(--ink)}
#ui .gar .gf .tot{font:700 12px Silkscreen,monospace;color:var(--mu);text-transform:uppercase}
#ui .gar .gf .tot b{color:var(--g);font-size:15px}#ui .gar .gf .tot.no b{color:var(--bad)}
#ui .gar .gp{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:12px;margin:10px 14px 0}
@media(max-width:620px){#ui .gar .gp{grid-template-columns:1fr}}
#ui .gar #gcvs{background:#0b0f0d;border:3px solid var(--ink);border-radius:0;padding:3px;box-shadow:inset 0 0 0 2px #2a352e;align-self:start}
#ui .gar #gcv{display:block;width:100%;height:auto}
#ui .gar .gcar{margin:6px 2px 2px;display:flex;justify-content:space-between;color:var(--mu);font:700 10px Silkscreen,monospace;text-transform:uppercase}
#ui .gar .gcar b{color:var(--g)}
#ui .gar .gk{background:var(--pn);border:3px solid var(--ink);border-radius:0;padding:8px 10px 10px;margin-bottom:10px;box-shadow:inset 0 0 0 2px #2a352e}
#ui .gar .gk h4{margin:0 0 6px;font:700 11px Silkscreen,monospace;color:var(--g);text-transform:uppercase;display:flex;justify-content:space-between;gap:8px}
#ui .gar .gk h4 span{color:var(--tx);text-transform:none;font:700 11px ui-monospace,monospace;text-align:right}
#ui .gar .gw{display:grid;grid-template-columns:repeat(auto-fill,minmax(34px,1fr));gap:6px}
#ui .gar .gw button{width:100%;aspect-ratio:1;padding:0;border:3px solid var(--ink);box-shadow:inset 0 0 0 2px #fff3}
#ui .gar .gw button.on{outline:3px solid var(--g);outline-offset:1px}
#ui .gar .gt{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
#ui .gar .gt button{padding:4px 2px 3px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:9px;line-height:1.15;text-align:center}
#ui .gar .gt button img{display:block;width:100%;height:auto;background:#0b0f0d;aspect-ratio:240/132}
#ui .gar .gt button em{font-style:normal;color:var(--g)}
#ui .gar .gt button.on{background:var(--g);color:#04120a;outline:0}#ui .gar .gt button.on em{color:#04120a}
`;document.head.appendChild(s)}

 /* ---------- picker pictures: every pattern drawn on the selected car, in its colours (cached, pixel effect applied) ---------- */
 let tR=null,tS=null,tC=null;const pthumbs={};
 function pthumb(i,cu,k){const key=pxN()+'|'+i+'|'+cu.c+'|'+cu.c2+'|'+k;if(pthumbs[key])return pthumbs[key];
  try{if(!tR){tR=new THREE.WebGLRenderer({antialias:false,alpha:true,preserveDrawingBuffer:true});tS=new THREE.Scene();tS.add(new THREE.AmbientLight(0xfff4e0,.8));const d=new THREE.DirectionalLight(0xffffff,.85);d.position.set(3,5,4);tS.add(d);
    tC=new THREE.PerspectiveCamera(30,240/132,.1,50);tC.position.set(0,2.6,4.7);tC.lookAt(0,.45,0)}
   pxSize(tR,240,132);
   const m=mkS(looked(i,Object.assign({},cu,{p:k})));m.scale.setScalar(1.55);m.rotation.y=.78;tS.add(m);tR.render(tS,tC);const u=tR.domElement.toDataURL('image/png');tS.remove(m);return pthumbs[key]=u}catch(e){return''}}

 /* ---------- screens ---------- */
 const head=`<div class=gs>Tom's Garage<small>Custom paint shop</small></div>`;
 const chip=(c,on,fn,t,pr)=>`<button type=button class="${on?'on':''}" title="${t}${pr?' · '+mny(pr):' · free'}" aria-label="${t}" aria-pressed="${on?'true':'false'}" onclick="${fn}" style="background:${c}"></button>`;
 function listUI(){css();pvStop();DR=null;const own=(S.cars||[]);
  $('ui').innerHTML=`<div class="box modal gar" id="gar">${head}
   <div class=gb><span>Wallet <b>${mny(S.money)}</b></span><span>Preview is free</span></div>
   <p class=gm><b>Tom:</b> "Pick a car. Looking is free, paint costs."</p>
   ${own.length?'':'<p class=gm>You do not own a car yet. Book one on the Cars website on your PC.</p>'}
   <div class=gl>${CARS.map((c,i)=>{if(c.xm)return'';const o=own.includes(i),cu=cust(i),img=o?thumb(i):'';return`<div class="gc ${o?'':'lk'}">${o?`<span class=tag>BAY ${i+1}</span>`:''}
     ${img?`<img src="${img}" alt="${c.n}">`:`<div class=gi>${o?'':'NOT OWNED'}</div>`}
     <h3>${c.n}</h3><p><span class=dot style="background:${o&&cu&&okHex(cu.c)?cu.c:c.c}"></span>${o?(cu&&patOk(cu.p)&&cu.p?PATS[cu.p]:cu?'Custom paint':'Stock paint'):'Not owned'}</p>
     <button class=go ${o?'':'disabled'} onclick="gcOpen(${i})">${o?'Customise':'Locked'}</button>${o?`<button style="margin-top:6px" onclick="gcDrive(${i})">Drive</button>`:''}</div>`}).join('')}</div>
   <div class=gf><button onclick="closeUI()">Leave garage</button></div></div>`}
 function carUI(i){css();if(!DR||DR.i!=i)DR=Object.assign({i:i},savedLook(i));const cu=DR,cn=n=>(COLS.concat(PCOLS).find(x=>x[1]==n)||[n,n])[0],pn=patOk(cu.p)?cu.p:0;
  const tot=cost(i,cu),can=S.money>=tot,sv=savedLook(i),dirty=!same(cu,sv);
  $('ui').innerHTML=`<div class="box modal gar" id="gar">${head}
   <div class=gb><span>Wallet <b>${mny(S.money)}</b></span><span>Preview is free</span></div>
   <div class=gp><div><div id=gcvs></div><div class=gcar><span>${CARS[i].n}</span><b>Bay ${i+1}</b></div><div class=gk style="margin-top:10px;${pn>0?'':'opacity:.5'}"><h4>Pattern colour <span>${pn>0?cn(cu.c2):'pick a pattern first'}</span></h4><div class=gw>${PCOLS.map(x=>chip(x[1],x[1]==cu.c2,`gcSet(${i},'c2','${x[1]}')`,x[0],pcolP(x[1]))).join('')}</div></div></div>
   <div>
    <div class=gk><h4>Paint colour <span>${cn(cu.c)}</span></h4><div class=gw>${COLS.map(x=>chip(x[1],x[1]==cu.c,`gcSet(${i},'c','${x[1]}')`,x[0],x[1].toLowerCase()==CARS[i].c.toLowerCase()?0:colP(x[1]))).join('')}</div></div>
    <div class=gk><h4>Pattern <span>${PATS[pn]}</span></h4><div class=gt>${SHOW.concat(PATS.map((x,q)=>q).filter(q=>q>=WRAP0&&wrapOwned(q))).map(k=>`<button type=button class="${k==pn?'on':''}" aria-pressed="${k==pn?'true':'false'}" onclick="gcSet(${i},'p',${k})"><img alt="" src="${pthumb(i,cu,k)}">${PATS[k]}<em>${k>=WRAP0?'wrap':k?mny(patP(k)):'free'}</em></button>`).join('')}</div></div>
   </div></div>
   <div class=gf><span style="display:flex;gap:8px"><button onclick="gcList()">Back</button><button onclick="gcReset(${i})">Stock paint</button></span>
    <span class="tot ${can?'':'no'}">Total <b>${mny(tot)}</b>${can?'':' · need '+mny(tot-S.money)+' more'}</span>
    <button class=go ${dirty&&can?'':'disabled'} onclick="gcBuy(${i})">${tot?'Pay and apply':'Apply'}</button></div></div>`;
  pvShow(i,cu)}
 window.gcOpen=i=>{if(!(S.cars||[]).includes(i)||CARS[i].xm)return snd('err');DR=null;snd('ping');carUI(i)};
 window.gcList=()=>{snd('ping');listUI()};
 /* Drive: leave the garage and spawn in this car where the parked cars used to stand, then drive. The car goes away again when you get out. */
 window.gcDrive=i=>{if(!(S.cars||[]).includes(i)||CARS[i].xm)return snd('err');snd('ping');pvStop();DR=null;closeUI();
  const go=()=>{try{IN=null}catch(e){}if(typeof exitDrive=='function'&&mode=='drive'&&dr)try{exitDrive()}catch(e){}
   const j=Math.max(0,(S.cars||[]).indexOf(i)),x=18.6+j*2.1,z=10,m=mkS(carb(i));m.scale.setScalar(1.5);m.position.set(x,0,z);scene.add(m);
   const c={i,m,x,z,h:0,v:0,tmp:1};PK.push(c);dr=c;P.x=x;P.z=z;P.rot=0;camT.x=x;camT.z=z;if(P.mesh)P.mesh.visible=false;mode='drive'};
  if(typeof fade=='function')fade(go,'');else go()};
 /* no cars stand outside any more (only a car you are driving, and the sleigh); the sleigh is never in the garage room */
 {const pc=parkCars;parkCars=function(){const keep=(typeof PK!='undefined'?PK:[]).filter(c=>c.tmp&&c===dr);const r=pc.apply(this,arguments);
   PK.slice().forEach(c=>{if(!(CARS[c.i]&&CARS[c.i].xm)){try{scene.remove(c.m)}catch(e){}PK.splice(PK.indexOf(c),1)}});keep.forEach(c=>{if(!PK.includes(c))PK.push(c)});return r}
  const fg=fillGarage;fillGarage=function(){const r=fg.apply(this,arguments);try{GCM=GCM.filter((m,j)=>{const c=CARS[(S.cars||[])[j]];if(c&&c.xm){IG[6].remove(m);return false}return true})}catch(e){}return r}
  const ed=exitDrive;exitDrive=function(){const c=dr,r=ed.apply(this,arguments);try{if(c&&c.tmp){scene.remove(c.m);const k=PK.indexOf(c);if(k>=0)PK.splice(k,1)}}catch(e){}return r}}
 /* choosing only changes the preview: nothing is saved or paid until Pay and apply */
 window.gcSet=(i,k,v)=>{if(!(S.cars||[]).includes(i)||!DR||DR.i!=i)return;if((k=='c'||k=='c2')&&!okHex(v))return;if(k=='p'&&(!patOk(v)||!wrapOwned(v)))return;DR[k]=v;snd('ping');carUI(i)};
 window.gcReset=i=>{if(!DR||DR.i!=i)return;Object.assign(DR,stockLook(i));snd('ping');carUI(i)};
 window.gcBuy=i=>{if(!(S.cars||[]).includes(i)||!DR||DR.i!=i)return snd('err');const d=DR,t=cost(i,d);
  if(same(d,savedLook(i)))return snd('err');
  if(!(S.money>=t))return snd('err');
  if(t)S.money=+(S.money-t).toFixed(2);
  if(d.c.toLowerCase()==CARS[i].c.toLowerCase()&&d.p==0){if(S.carCust)delete S.carCust[i]}
  else{S.carCust=S.carCust&&typeof S.carCust=='object'?S.carCust:{};S.carCust[i]={c:d.c,p:d.p,c2:d.c2}}
  try{updateVersion()}catch(e){}refreshCars(i);snd(t?'cash':'ping');try{say(t?'Paid '+mny(t)+' for the new look':'Paint reset to stock')}catch(e){}
  DR=null;carUI(i)};
 window.openCarGarage=()=>{mode='menu';listUI()};

 /* leaving by any route (Leave, Escape, walking off) always clears the preview and any unpaid changes */
 {const c0=closeUI;closeUI=function(){pvStop();DR=null;return c0.apply(this,arguments)}}

 /* ---------- Tom opens it ---------- */
 function hook(){try{const t=INT.find(o=>o.l==TOM_HIT);if(!t)return false;if(t.gc)return true;t.gc=1;t.a=()=>{snd('ping');window.openCarGarage()};return true}catch(e){return false}}
 let n=0;const iv=setInterval(()=>{hook();if(++n>600)clearInterval(iv)},500);
})();
