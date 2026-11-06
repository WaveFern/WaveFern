/* ===== dev only: two windows on the left wall of the starting house, with an optional soft sunbeam =====
   The bedroom window and the studio window on the back wall are taken out here. The two framed, curtained windows on the left wall
   (one in the bedroom, one in the living room) are built with the house dressing in dev-models-v2.js. Settings > Graphics > Sunbeams turns a faint shaft of daylight through them
   on or off (on by default, daytime only). Nothing in the save changes; the choice is kept per device with the graphics settings. */
(function(){
 if(!window.FW_FEAT||typeof THREE=='undefined'||typeof scene=='undefined'||typeof B!='function')return;
 const ZS=[2,9],W=1.6,H=1.2,Y=1.8;
 let house=null,beams=[],lastOn=null;
 /* the studio builds its own back-wall window: leave it out, always */
 try{const x0=xb;xb=function(g,w,h,d,c,x,y,z){if(g===studio&&x>8.4&&x<10.4&&z<.2&&y>1&&y<2.6&&(w>1.5||h>1.1||w<.1&&h>1.1))return null;return x0.apply(this,arguments)}}catch(e){console.warn('dev windows xb',e)}
 function beam(g,z){
  /* shaft: window rectangle on the wall to a shifted rectangle on the floor, bright at the glass and fading away */
  const x1=3.4,z1=z+.9,hw=W/2,y0=Y-H/2,y1=Y+H/2;
  const v=[],c=[],add=(p,k)=>{v.push(p[0],p[1],p[2]);c.push(k,k*.93,k*.72)};
  const tri=(a,b,d,ka,kb,kd)=>{add(a,ka);add(b,kb);add(d,kd)};
  const A0=[.05,y0,z-hw],A1=[.05,y0,z+hw],B0=[.05,y1,z-hw],B1=[.05,y1,z+hw];
  const nearF0=[1.1,.04,z1-hw-.0],nearF1=[1.1,.04,z1+hw],farF0=[x1,.04,z1-hw],farF1=[x1,.04,z1+hw];
  /* upper face (from the top of the glass down to the far floor edge), lower face (from the bottom of the glass to the near floor edge) */
  tri(B0,B1,farF1,.2,.2,.03);tri(B0,farF1,farF0,.2,.03,.03);
  tri(A0,A1,nearF1,.2,.2,.08);tri(A0,nearF1,nearF0,.2,.08,.08);
  /* side faces */
  tri(B0,A0,nearF0,.2,.2,.08);tri(B0,nearF0,farF0,.2,.08,.03);
  tri(B1,A1,nearF1,.2,.2,.08);tri(B1,nearF1,farF1,.2,.08,.03);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
  const mat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const m=new THREE.Mesh(geo,mat);m.renderOrder=3;m.userData.sunbeam=1;g.add(m);
  /* light patch on the floor */
  const pm=new THREE.MeshBasicMaterial({color:0xffe9b8,transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(W,2.1),pm);p.rotation.x=-Math.PI/2;p.rotation.z=Math.PI/2;p.position.set(2.3,.045,z1);p.renderOrder=3;p.userData.sunbeam=1;g.add(p);
  beams.push(m,p);
 }
 function fix(g){
  if(!g||g.userData.leftWin)return;g.userData.leftWin=1;house=g;
  /* take out the bedroom window on the back wall */
  g.children.forEach(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;
   if(p&&m.material.color.getHexString()=='8fd0ff'&&p.height==1.2&&m.position.y>1.7&&Math.abs(m.position.z-.02)<.06)m.visible=false});
  ZS.forEach(z=>beam(g,z));
  apply()}
 function on(){try{return !(typeof GFX!='undefined'&&GFX.sunOff)}catch(e){return true}}
 function day(){try{return Math.max(0,Math.min(1,(amb.intensity-.5)/.25))}catch(e){return 1}}
 function apply(){const o=on();beams.forEach(m=>{m.visible=o})}
 window.winBeamApply=apply;
 setInterval(()=>{try{
  const d=day()*(on()?1:0);
  beams.forEach(m=>{m.material.opacity=m.geometry.type=='PlaneGeometry'?.1*d:d;m.visible=d>.02})}catch(e){}},400);
 /* house rebuilds */
 try{const bh=buildHouse;buildHouse=function(){const g=bh.apply(this,arguments);try{beams=[];fix(g)}catch(e){console.warn('dev windows',e)}return g}}catch(e){}
 /* the house exists already when this runs */
 try{if(typeof NWM!='undefined'&&NWM.length){fix(NWM[0][0].parent);try{buildStudio()}catch(e){console.warn(e)}}}catch(e){console.warn('dev windows',e)}
 /* Settings > Graphics > Sunbeams */
 try{const b0=stBody;stBody=function(){const r=b0.apply(this,arguments);if(STAB!='gfx')return r;
  return r+stTog('Sunbeams',on(),"GFX.sunOff=GFX.sunOff?0:1;gfxSv();winBeamApply()",'A faint shaft of daylight through the windows')}}catch(e){console.warn('dev windows settings',e)}
})();
