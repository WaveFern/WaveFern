/* WaveFern dev models pack. Only loaded on /dev/ (see dev/index.html). The live game is untouched.
   Part 1 (loads just before the game starts): extra blocky detail on every character (eyebrows, nose, cheeks, ears,
     belt, side seams, cuffs, watch, soles, hair highlight). Wraps buildChar; any error falls back to the plain model.
   Part 2 (runs after the game has started): extra detail inside and outside the house (skirting, panelling, curtains,
     rug, wall art, foam panels, shutters, siding, door panels, drainpipes). One group, so it can be hidden in one go.
   No glow, no bright lights: everything is plain lit boxes. Add ?nomodels to the address to skip it entirely.
   Switch on/off in the dev panel (DEV button or the ` key) > Models and houses. */
(function(){
 if(!window.FW_DEV)return;
 if(/[?&]nomodels/.test(location.search))return;
 const KEY='fw_dmodels';
 let on=true;try{if(localStorage.getItem(KEY)==='0')on=false}catch(e){}
 const SKN=['#fddcc0','#f2c09a','#d99a6c','#b57248','#8a5230','#5b3420'];
 const dkc=(c,f)=>{try{return dk(c,f)}catch(e){return c}};

 /* ---------- Part 1: characters ---------- */
 function detail(r,c){
  const g=r.g,body=c.body==null?.4:c.body,w=.42+body*.5,d=.3+body*.28,si=c.skin|0,sk=SKN[si]||'#d99a6c';
  const tc=c.tc_custom||(typeof TOPC!='undefined'&&TOPC[c.tc])||'#3498db',hc=c.hc_custom||(typeof HAIRC!='undefined'&&HAIRC[c.hc])||'#4a2c1a';
  const T=c.top,jk=c.jk>=0,dress=(T==6)||(jk&&c.jks==2);
  /* torso: side seams, belt and buckle, shirt hem, neckline, pocket */
  const seam=dkc(tc,.86);
  [-1,1].forEach(s=>B(g,.02,.5,d+.02,seam,s*(w/2),.82,0));
  if(!dress){B(g,w+.03,.07,d+.03,'#2a2a2e',0,.55,0);B(g,.1,.07,.02,'#d9b44a',0,.55,d/2+.02)}
  B(g,w+.02,.03,d+.02,dkc(tc,.8),0,.52,0);
  B(g,.2,.04,.02,dkc(sk,.82),0,1.07,d/2+.012);
  if(T==0||T==3)B(g,.13,.12,.02,dkc(tc,.84),w*.22,.95,d/2+.012);
  /* legs: white sole under each shoe */
  (r.legs||[]).forEach(p=>{B(p,w*.46,.04,d*.85+.12,'#f2f2f2',0,-.48,.05)});
  /* arms: sleeve cuff and a watch on the left wrist */
  const sl=jk?.5:([.25,.5,.5,.3,0,.25,.5,.3,.5,0][T]??.25);
  (r.arms||[]).forEach((p,i)=>{
   if(sl>0)B(p,.19,.04,.24,dkc((jk&&typeof JKC!='undefined'&&JKC[c.jk])||tc,.8),0,-sl,0);
   if(i==0){B(p,.19,.05,.24,'#2a2a2e',0,-.42,0);B(p,.07,.06,.03,'#cfd3d8',0,-.42,.125)}
   B(p,.18,.02,.04,dkc(sk,.82),0,-.5,.1)});
  /* head */
  let h=null;try{h=typeof xHead=='function'?xHead(g):null}catch(e){}
  if(!h)h=g.children.find(m=>!m.isMesh&&Math.abs(m.position.y-1.4)<.02);
  if(!h)return;
  const e=c.eyes|0,bald=!(c.hair>=1);
  if(e!=4&&e!=5&&e!=7){const bc=bald?dkc(sk,.55):dkc(hc,.8);[-1,1].forEach(s=>B(h,.11,.03,.02,bc,s*.13,.155,.285))}
  B(h,.07,.09,.05,dkc(sk,.92),0,-.05,.29);
  const bl=si<3?'#f0a898':si==3?'#a65a44':'#7d3f2c';
  [-1,1].forEach(s=>{B(h,.07,.05,.015,bl,s*.2,-.08,.282);B(h,.02,.07,.05,dkc(sk,.82),s*.325,0,.01)});
  B(h,.556,.05,.556,dkc(sk,.93),0,-.25,0);
  if(c.hair>=2&&c.hair!=9&&!(c.ht>=0)){const m=B(h,.34,.02,.3,dkc(hc,1.3),.05,.375,.05);m.userData.hair=1}
 }
 try{
  if(typeof buildChar=='function'&&typeof B=='function'){
   const b0=buildChar;
   buildChar=function(c){
    const r=b0.apply(this,arguments);
    if(on&&c&&r&&r.g&&!r.g.userData.dmod){r.g.userData.dmod=1;try{detail(r,c)}catch(e){console.warn('dev models: character detail skipped',e)}}
    return r};
  }
 }catch(e){console.warn('dev models: could not hook characters',e)}

 /* ---------- Part 2: house ---------- */
 let DH=null,DX=null;
 function house(){
  const g=DH=new THREE.Group();g.name='devModelsHouse';scene.add(g);
  const tr='#efe9dc',tr2='#d9d0bd';
  /* skirting boards and crown moulding on the back wall (z=0) and left wall (x=0), leaving the back door gap */
  [[0,3],[4.9,16]].forEach(a=>{const l=a[1]-a[0],cx=(a[0]+a[1])/2;B(g,l,.2,.05,tr,cx,.1,.03);B(g,l,.1,.07,tr,cx,2.94,.04)});
  B(g,.05,.2,12,tr,.03,.1,6);B(g,.07,.1,12,tr,.04,2.94,6);
  /* panelling under the rail */
  [[0,3,'#7a6a8a'],[4.9,8,'#7a6a8a'],[8,16,'#5a4a6a']].forEach(a=>{const l=a[1]-a[0],cx=(a[0]+a[1])/2;B(g,l,.8,.03,dkc(a[2],.82),cx,.6,.025);B(g,l,.06,.06,tr2,cx,1.03,.03)});
  B(g,.03,.8,6,dkc('#7a6a8a',.82),.025,.6,3);B(g,.06,.06,6,tr2,.03,1.03,3);
  B(g,.03,.8,6,dkc('#8a7f6a',.82),.025,.6,9);B(g,.06,.06,6,tr2,.03,1.03,9);
  /* window dressing on the two painted windows */
  const win=(x,cur)=>{
   B(g,1.8,.1,.07,tr,x,2.45,.05);B(g,1.8,.1,.07,tr,x,1.15,.05);B(g,.1,1.3,.07,tr,x-.85,1.8,.05);B(g,.1,1.3,.07,tr,x+.85,1.8,.05);
   B(g,.06,1.2,.05,tr,x,1.8,.05);B(g,1.6,.06,.05,tr,x,1.8,.05);B(g,2.0,.08,.22,tr,x,1.09,.12);
   B(g,2.2,.06,.06,'#3a2f2a',x,2.62,.12);[-1,1].forEach(s=>{B(g,.5,1.55,.08,cur,x+s*1.0,1.85,.12);B(g,.5,.05,.09,dkc(cur,.8),x+s*1.0,1.2,.125)})};
  win(1.2,'#b8607a');win(9.4,'#3b4a6a');
  /* living room window on the left wall */
  B(g,.03,1.2,1.2,'*8fd0ff',.03,1.8,9);
  B(g,.07,.1,1.5,tr,.05,2.45,9);B(g,.07,.1,1.5,tr,.05,1.15,9);B(g,.07,1.3,.1,tr,.05,1.8,8.2);B(g,.07,1.3,.1,tr,.05,1.8,9.8);B(g,.05,1.2,.06,tr,.05,1.8,9);B(g,.05,.06,1.6,tr,.05,1.8,9);B(g,.22,.08,2.0,tr,.12,1.09,9);
  [-1,1].forEach(s=>B(g,.08,1.55,.5,'#c9b06a',.12,1.85,9+s*1.0));
  /* partition rails and door thresholds */
  [[0,2],[4,8],[10,12]].forEach(s=>B(g,.32,.06,s[1]-s[0],'#8a8f94',8,1.03,(s[0]+s[1])/2));
  [[0,3],[5,11],[13,16]].forEach(s=>B(g,s[1]-s[0],.06,.32,'#8a8f94',(s[0]+s[1])/2,1.03,6));
  [[8,3,1],[8,9,1],[4,6,0],[12,6,0]].forEach(q=>q[2]?B(g,.4,.03,2,'#a08a6a',q[0],.015,q[1]):B(g,2,.03,.4,'#a08a6a',q[0],.015,q[1]));
  /* bedroom rug and framed pictures */
  B(g,3,.025,2.1,'#4a3560',5.1,.02,4.3);B(g,2.6,.03,1.7,'#8a6aa8',5.1,.025,4.3);B(g,2.0,.035,1.1,'#4a3560',5.1,.03,4.3);B(g,1.5,.04,.6,'#c9a8e0',5.1,.035,4.3);
  [[3.6,1.9,.5,.7,'#e6b422'],[4.5,1.7,.5,.4,'#2fe68a']].forEach(q=>{B(g,.06,q[3]+.1,q[2]+.1,'#2a2a2e',.05,q[1],q[0]);B(g,.07,q[3],q[2],q[4],.06,q[1],q[0])});
  /* studio acoustic foam row */
  for(let i=0;i<9;i++)B(g,.55,.5,.06,i%2?'#3a3a42':'#2b2b31',10.5+i*.6,2.65,.05);
  B(g,5.5,.05,.07,'#4a4a52',13,2.38,.055);
  /* outside bits live under HX so they hide together with the front and east walls when you are inside */
  const gi=g;const gx=DX=new THREE.Group();gx.name='devModelsOutside';(typeof HX!='undefined'?HX:scene).add(gx);
  { const g=gx;
  /* outside: siding lines on the front (z) and east (x) walls */
  for(let k=0;k<8;k++){const y=.5+k*.3,c='#c9b790';B(g,4.9,.04,.02,c,2.5,y,12.311);B(g,8.9,.04,.02,c,11.5,y,12.311);B(g,.02,.04,12,c,16.311,y,6)}
  /* front door panels, handle, kick plate, mat */
  [[5.58,1.78,.75,.75],[6.42,1.78,.75,.75],[5.58,.7,.75,.8],[6.42,.7,.75,.8]].forEach(q=>B(g,q[2],q[3],.03,'#6b4a2e',q[0],q[1],12.235));
  B(g,.1,.1,.08,'#d9b44a',6.8,1.15,12.27);B(g,1.8,.2,.03,'#9a8a60',6,.12,12.24);B(g,1.1,.02,.55,'#7a2f2f',6,.16,12.95);
  /* shutters on the front and east windows, drainpipes */
  const shut=(x,z,f)=>{const sx=f?.07:.5,sz=f?.5:.07;B(g,sx,1.25,sz,'#3e6b57',x,1.7,z);for(let i=0;i<4;i++)B(g,f?.09:.4,.03,f?.4:.09,'#2f5545',x,1.35+i*.25,z)};
  [2.5,10.5,13.5].forEach(x=>[-1,1].forEach(s=>shut(x+s*1.5,12.42,0)));
  [3,6.5].forEach(z=>[-1,1].forEach(s=>shut(16.42,z+s*1.5,1)));
  [.45,15.55].forEach(x=>{B(g,.1,2.9,.1,'#9aa0a6',x,1.5,12.5);B(g,.1,.1,.3,'#9aa0a6',x,.12,12.62)});
  }
  return gi}

 /* ---------- fail-safe start and dev panel ---------- */
 function boot(){try{
  if(typeof THREE=='undefined'||typeof scene=='undefined'||typeof B!='function'){console.warn('dev models: game not ready');return}
  try{house()}catch(e){console.warn('dev models: house detail failed',e);if(DH)DH.visible=false;if(DX)DX.visible=false}
  const btns=[];
  const apply=()=>{try{if(DH)DH.visible=on;if(DX)DX.visible=on;try{localStorage.setItem(KEY,on?'1':'0')}catch(e){}
   if(btns.length){btns[0].textContent=(on?'> ':'')+'On';btns[1].textContent=(on?'':'> ')+'Off (original models)'}
   if(typeof refresh=='function')refresh()}catch(e){console.warn(e)}};
  const box=document.getElementById('fwdvb');
  if(box){
   const h=document.createElement('h5');h.textContent='Models and houses (dev)';box.prepend(h);
   const tip=document.createElement('small');tip.textContent='More detail on people and on the inside and outside of the house. Your own character and the house change at once; other people change after a reload.';h.after(tip);
   let last=tip;[true,false].forEach(v=>{const b=document.createElement('button');b.onclick=()=>{on=v;apply()};last.after(b);last=b;btns.push(b)});
  }
  apply();
 }catch(e){console.warn('dev models failed',e)}}
 let tries=0;const iv=setInterval(()=>{tries++;if(!document.getElementById('load')&&document.getElementById('fwdvb')){clearInterval(iv);boot()}else if(tries>240)clearInterval(iv)},250);
})();
