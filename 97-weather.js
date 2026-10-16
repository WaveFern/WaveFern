/* ===== v26.103: weather =====
   Every day rolls its weather once and keeps it in the save (S.wx={d:day,k:kind}), so a reload never changes it.
   90% of days are sunny; the rest are rain (5%), fog (3%) or a thunderstorm (2%). Day 1 is always sunny.
   Weather only touches the world outside: the light dims and greys outdoors but goes back to normal when you walk
   into your house, rain falls on the land around the house but never inside its walls (and stops on the roof when
   you are outside), fog drifts over the ground but not through your rooms, and shops/interiors get none of it.
   Cheap by design: nothing is built on sunny days; rain is one line mesh animated on the GPU, fog is three flat
   planes with a small noise texture, and the rain sound is one looped noise source. */
const WTHR={kinds:{sun:{n:'Sunny'},rain:{n:'Rain',dim:.62,amb:.85,grey:.55,rain:1500,fog:.12},fog:{n:'Fog',dim:.55,amb:.9,grey:.6,rain:0,fog:.62},storm:{n:'Thunderstorm',dim:.35,amb:.7,grey:.7,rain:2600,fog:.2}},
 cur:0,mesh:null,fogs:[],t:0,flash:0,nextF:8,aud:null,lastHc:null};
function wxRoll(){const r=Math.random();return r<.9?'sun':r<.95?'rain':r<.98?'fog':'storm'}
function wxToday(){if(!S.wx||S.wx.d!==S.day){S.wx={d:S.day,k:S.day<=1?'sun':wxRoll()};const k=S.wx.k;
  if(k!='sun'&&mode=='play')setTimeout(()=>{try{say(k=='rain'?'It is raining today.':k=='fog'?'A thick fog has rolled in today.':'A thunderstorm is coming through today.')}catch(e){}},1500)}
 return WTHR.kinds[S.wx.k]||WTHR.kinds.sun}
/* the house footprint (it grows with the home wing), where no weather goes */
function wxHouse(){const g=typeof WGX=='number'?WGX:0;return[-.1,-.4-g,16.1,12.2]}
function wxInterior(){try{return!!IN||P.z>=(typeof INTERIOR_Z=='number'?INTERIOR_Z:260)||(typeof FEST=='object'&&FEST&&FEST.view)}catch(e){return false}}

/* ---------- rain: line segments, animated in the vertex shader ---------- */
const WTHR_SZ=72,WTHR_HT=22,WTHR_K=(16/13).toFixed(4);/* the camera sits at +16,+13,+16 from what it looks at, so a point at height y lines up on screen with the ground y*16/13 nearer the camera */
function wxRainMesh(){const N=2600,p=new Float32Array(N*6),e=new Float32Array(N*2);
 for(let i=0;i<N;i++){const x=Math.random()*WTHR_SZ,y=Math.random(),z=Math.random()*WTHR_SZ;p.set([x,y,z,x,y,z],i*6);e[i*2+1]=1}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('e',new THREE.BufferAttribute(e,1));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{c:{value:new THREE.Vector3()},t:{value:0},hr:{value:new THREE.Vector4()},hin:{value:0},op:{value:.5},col:{value:new THREE.Color(0xb8c8dc)}},
  vertexShader:`uniform vec3 c;uniform float t;attribute float e;varying vec3 wp;
   void main(){vec3 p=position;float sz=${WTHR_SZ.toFixed(1)},ht=${WTHR_HT.toFixed(1)};
    float x=p.x+floor((c.x-p.x)/sz+.5)*sz,z=p.z+floor((c.z-p.z)/sz+.5)*sz,y=mod(p.y*ht-t,ht)-.6;
    y+=e*.75;x+=e*.12;wp=vec3(x,y,z);gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,
  fragmentShader:`uniform vec4 hr;uniform float hin,op;uniform vec3 col;varying vec3 wp;
   bool inH(vec2 q){return q.x>hr.x&&q.x<hr.z&&q.y>hr.y&&q.y<hr.w;}
   void main(){if(wp.y<0.)discard;if(inH(wp.xz)&&(hin>.5||wp.y<3.7))discard;if(hin>.5&&inH(wp.xz-vec2(wp.y*${WTHR_K})))discard;gl_FragColor=vec4(col,op);}`});
 const L=new THREE.LineSegments(g,m);L.frustumCulled=false;L.renderOrder=5;L.visible=false;scene.add(L);return L}

/* ---------- fog: three drifting planes with tileable value noise ---------- */
function wxNoiseTex(){const S2=128,G=16,c=document.createElement('canvas');c.width=c.height=S2;const x=c.getContext('2d'),im=x.createImageData(S2,S2);
 const oct=(g)=>{const v=[];for(let i=0;i<g*g;i++)v.push(Math.random());return(u,w)=>{const fx=u*g,fz=w*g,i0=Math.floor(fx),j0=Math.floor(fz),a=fx-i0,b=fz-j0,s=t=>t*t*(3-2*t),
  q=(i,j)=>v[((j%g+g)%g)*g+((i%g+g)%g)],A=s(a),Bb=s(b);return(q(i0,j0)*(1-A)+q(i0+1,j0)*A)*(1-Bb)+(q(i0,j0+1)*(1-A)+q(i0+1,j0+1)*A)*Bb}};
 const o1=oct(G/4),o2=oct(G/2),o3=oct(G);
 for(let j=0;j<S2;j++)for(let i=0;i<S2;i++){const u=i/S2,w=j/S2,n=o1(u,w)*.55+o2(u,w)*.3+o3(u,w)*.15,k=(j*S2+i)*4;im.data[k]=im.data[k+1]=im.data[k+2]=n*255|0;im.data[k+3]=255}
 x.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function wxFogMeshes(){const tx=wxNoiseTex(),geo2=new THREE.PlaneGeometry(96,96);geo2.rotateX(-Math.PI/2);
 return[.35,1.0,1.9].map((y,i)=>{const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{n:{value:tx},t:{value:0},op:{value:0},hin:{value:0},lay:{value:i},hr:{value:new THREE.Vector4()},col:{value:new THREE.Color(0xd4dae0)},c:{value:new THREE.Vector3()}},
  vertexShader:`varying vec3 wp;void main(){wp=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,
  fragmentShader:`uniform sampler2D n;uniform float t,op,lay;uniform vec4 hr;uniform vec3 col,c;varying vec3 wp;
   uniform float hin;bool inH(vec2 q){return q.x>hr.x&&q.x<hr.z&&q.y>hr.y&&q.y<hr.w;}
   void main(){if(inH(wp.xz)||hin>.5&&inH(wp.xz-vec2(wp.y*${WTHR_K})))discard;
    vec2 uv=wp.xz/(13.+lay*5.)+vec2(t*.006+lay*.37,t*.004-lay*.21);float a=texture2D(n,uv).r*.7+texture2D(n,uv*2.1-vec2(t*.01,0.)).r*.3;
    a=smoothstep(.3,.8,a)*(1.-smoothstep(26.,46.,length(wp.xz-c.xz)));gl_FragColor=vec4(col,a*op);}`});
  const me=new THREE.Mesh(geo2,m);me.position.y=y;me.frustumCulled=false;me.renderOrder=4;me.visible=false;scene.add(me);return me})}

/* ---------- rain sound: one looped noise source through the effects bus ---------- */
function wxAudio(K,where,dt){try{const wet=K.rain>0,ok=wet&&typeof FX=='number'&&FX>0&&VOL>0&&!PAUSED&&!document.hidden&&!(navigator.userActivation&&!navigator.userActivation.hasBeenActive)&&mode!='load'&&mode!='creator';
  if(!WTHR.aud){if(!ok)return;const c=ac();if(!NB||!MG)return;const s=c.createBufferSource();s.buffer=NB;s.loop=true;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=500;
   const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4000;const g=c.createGain();g.gain.value=0;s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(MG);s.start();WTHR.aud={c,g,lp}}
  const A=WTHR.aud,t=A.c.currentTime,amb=typeof OPT=='object'&&OPT.amb!=null?OPT.amb:1;
  const lvl=ok?(K===WTHR.kinds.storm?.2:.13)*amb*(where=='out'?1:where=='home'?.55:.25):0;
  A.g.gain.setTargetAtTime(lvl,t,.8);A.lp.frequency.setTargetAtTime(where=='out'?4200:700,t,.5)}catch(e){}}
function wxThunder(){try{if(!WTHR.aud||!(FX>0&&VOL>0))return;const c=WTHR.aud.c,t=c.currentTime+.4+Math.random()*1.6,s=c.createBufferSource();s.buffer=NB;s.loop=true;
 const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=140;const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5*(typeof OPT=='object'&&OPT.amb!=null?OPT.amb:1),t+.15);g.gain.exponentialRampToValueAtTime(.001,t+2.8);
 s.connect(lp);lp.connect(g);g.connect(MG);s.start(t);s.stop(t+3)}catch(e){}}

const WTHR_FL=new THREE.Color(0xe8eeff),WTHR_GREY=new THREE.Color(0x8c96a3),WTHR_BG=new THREE.Color(0x5c6670);
{const u0=update;update=function(dt){u0(dt);try{wxTick(dt)}catch(e){}}}
function wxTick(dt){const live=mode=='play'||mode=='drive'||mode=='rec'||mode=='pc'||mode=='build'||mode=='cut';if(!live&&!WTHR.mesh)return;
 const K=live?wxToday():WTHR.kinds.sun,inner=wxInterior(),home=!inner&&(typeof HIN!='undefined'&&HIN||mode=='build'),out=!inner&&!home;
 /* light: eases in and out as you step through the front door */
 const want=K.dim&&out?1:0;WTHR.cur+=(want-WTHR.cur)*Math.min(1,dt*2.5);if(WTHR.cur<.002)WTHR.cur=0;
 if(K.rain&&!WTHR.mesh)WTHR.mesh=wxRainMesh();if(K.fog&&!WTHR.fogs.length)WTHR.fogs=wxFogMeshes();
 if(K.dim)WTHR.lk=K;/* menus and chats count as sunny, which has no light numbers: keep easing out with the last wet kind (undefined numbers made the light NaN = black screen) */
 if(WTHR.cur>0){const k=WTHR.cur,L=K.dim?K:WTHR.lk||WTHR.kinds.rain;amb.intensity*=1-(1-L.amb)*k;sun.intensity*=1-(1-L.dim)*k;amb.color.lerp(WTHR_GREY,L.grey*k*.6);sun.color.lerp(WTHR_GREY,L.grey*k);scene.background.lerp(WTHR_BG,L.grey*k)}
 /* lightning in storms, outdoors only */
 if(K===WTHR.kinds.storm&&live&&!PAUSED){WTHR.nextF-=dt;if(WTHR.nextF<=0){WTHR.nextF=7+Math.random()*12;WTHR.flash=1;if(!inner)wxThunder()}}
 if(WTHR.flash>0){WTHR.flash=Math.max(0,WTHR.flash-dt*5);if(out){const f=WTHR.flash*WTHR.flash;amb.intensity+=1.3*f;amb.color.lerp(WTHR_FL,f*.8)}}
 WTHR.t=(WTHR.t+dt)%5000;const nt=S.t<240?0:S.t<300?(S.t-240)/60*.5:S.t<330?.5+(S.t-300)/30*.4:.9,hr=wxHouse(),show=live&&!inner;
 if(WTHR.mesh){const v=show&&K.rain>0;WTHR.mesh.visible=v;if(v){const u=WTHR.mesh.material.uniforms;u.c.value.set(camT.x,0,camT.z);WTHR.rt=((WTHR.rt||0)+dt*(K===WTHR.kinds.storm?26:20))%WTHR_HT;u.t.value=WTHR.rt;u.hr.value.set(hr[0],hr[1],hr[2],hr[3]);u.hin.value=home?1:0;
  u.op.value=(K===WTHR.kinds.storm?.55:.42)*(1-nt*.35);u.col.value.setRGB(.72-.3*nt,.78-.3*nt,.86-.25*nt);WTHR.mesh.geometry.setDrawRange(0,K.rain*2)}}
 WTHR.fogs.forEach(m=>{const v=show&&K.fog>0;m.visible=v;if(!v)return;const u=m.material.uniforms;m.position.x=camT.x;m.position.z=camT.z;u.c.value.set(camT.x,0,camT.z);u.t.value=WTHR.t;u.hr.value.set(hr[0],hr[1],hr[2],hr[3]);
  u.hin.value=home?1:0;u.op.value=K.fog*(.85-.25*nt);u.col.value.setRGB(.83-.55*nt,.85-.53*nt,.88-.5*nt)});
 wxAudio(K,inner?'in':home?'home':'out',dt)}

/* HUD: the weather next to the time of day */
{const h0=hud;hud=function(){h0();try{if(hc===WTHR.lastHc)return;WTHR.lastHc=hc;if(!S.wx||S.wx.d!==S.day)return;const b0=$('hud').querySelector('.hb.tl b.px'),b=b0&&b0.nextElementSibling&&b0.nextElementSibling.tagName=='SPAN'?b0.nextElementSibling:b0;if(!b)return;
 const k=S.wx.k,n=k=='sun'?(S.t>=300?'Clear':'Sunny'):WTHR.kinds[k].n,s=document.createElement('span');s.className='wxh';s.style.color=k=='sun'?'#ffd27a':'#b8c8dc';s.textContent=' · '+n;b.after(s)}catch(e){}}}
