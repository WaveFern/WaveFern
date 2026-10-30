/* ===== v49.44.0: detailed 3D profile pictures everywhere, a different style for each app =====
   The 3D head-and-shoulders renderer from 178-instagrime-photos.js now draws every artist picture, in a look that belongs
   to the app it is in, so the same artist never has the same picture in two places:
   - Messages: unchanged (colour gradient, turned slightly left). Now also used for the New chat list, meeting pop-ups and
     Big Vee (who had a 16x16 face).
   - Instagrime: a selfie. Turned the other way, a tighter crop from a little above, pastel sunset backdrop with bokeh and a
     ring light behind the head. Covers the post headers, profiles, your account and the commenters.
   - Spotifly: a press shot at 64x64. Facing the camera from slightly below, more shoulders, a dark stage backdrop with a
     coloured spotlight, a coloured back light and a soft vignette. Covers Browse artists, artist pages, your own artist page,
     the sidebar and the Gphone app. An uploaded picture still wins.
   Long lists (Browse, the New chat list, commenters) draw their pictures a few at a time after the page shows, then swap
   them in, so opening a page never stalls. If WebGL fails (IGX.on=0) the old 16x16 faces stay. Wrapped in an IIFE. */
(function(){
if(typeof igxPortrait!='function'||typeof IGX!='object')return;
const P0=igxPortrait,SH0=igxShot,PST={cur:null},PF={},VEEC={skin:3,eyes:0,mouth:0,hair:1,hc:0,hc_custom:'#2ee59d',fh:3,fhc:'#1b1b1f',top:0,tc:0,tc_custom:'#1c6b46',pc:4,ac:2,acc:'#e6b422',body:.5,hgt:.5};
/* extra camera framings: 'bust' (Spotifly, from slightly below) and 'tight' (Instagrime, from slightly above) */
igxShot=function(cam,box,shot,ar,hy){if(shot!='bust'&&shot!='tight')return SH0.apply(this,arguments);
 const top=box.max.y,f=Math.tan(cam.fov*Math.PI/360)*2,b=shot=='bust',y0=b?hy-1:hy-.66,y1=Math.max(top,hy+.48)+(b?.24:.16),vh=y1-y0,d=vh/f,cy=(y0+y1)/2;
 cam.position.set(b?0:-.12,cy+(b?-.2:.3),d);cam.lookAt(0,cy,0);cam.aspect=ar;cam.updateProjectionMatrix()};
const pix=(x,W,H)=>{const o=document.createElement('canvas');o.width=W*2;o.height=H*2;const ox=o.getContext('2d');ox.imageSmoothingEnabled=false;ox.drawImage(x.canvas,0,0,W*2,H*2);return o.toDataURL()};
/* soft round glow made of stepped rings, so it stays pixel art */
function glow(x,col,cx,cy,r,a,n){x.save();for(let i=n;i>0;i--){x.globalAlpha=a*(1-i/(n+1));igxDisc(x,col,cx,cy,Math.round(r*i/n))}x.restore()}
function ring(x,col,cx,cy,r,a){x.save();x.globalAlpha=a;for(let t=0;t<64;t++){const q=t/64*Math.PI*2;igxF(x,col,cx+Math.cos(q)*r,cy+Math.sin(q)*r,1,1)}x.restore()}
function sfPic(c,mine,key){const W=64,H=64,k=document.createElement('canvas');k.width=W;k.height=H;const x=k.getContext('2d'),hs=igxHash(key),h=[140,200,265,320,15,40,175][hs%7],r=igxRng(hs);
 igxGrad(x,'#1b1d22','#08090b',0,H,0,W);
 glow(x,'hsl('+h+',70%,46%)',W*.5,H*.4,30,.42,12);glow(x,'hsl('+h+',85%,72%)',W*.5,H*.36,14,.22,6);
 x.save();x.globalAlpha=.06;for(let i=0;i<3;i++)igxF(x,'#fff',W*.18+i*14+r()*4,0,3,H);x.restore();
 igxF(x,'#00000040',0,H-9,W,9);
 const old=IGX.L.key.position.clone(),oldR=IGX.L.rim.position.clone();IGX.L.key.position.set(-2.6,3,5);IGX.L.rim.position.set(3,2.2,-3);
 try{x.drawImage(igxRender([{c,mine}],{shot:'bust',xs:[0],ry:.06,lc:{amb:'#a8a8b0',key:'#fff4e8',rim:'hsl('+h+',90%,65%)'},pose:'none'},W,H),0,0)}
 finally{IGX.L.key.position.copy(old);IGX.L.rim.position.copy(oldR)}
 for(let i=0;i<8;i++){const a='rgba(0,0,0,'+(.06*(8-i)/8)+')';igxF(x,a,0,i,W,1);igxF(x,a,0,H-1-i,W,1);igxF(x,a,i,0,1,H);igxF(x,a,W-1-i,0,1,H)}
 for(let i=0;i<70;i++)igxF(x,r()<.5?'#ffffff0c':'#0000000e',r()*W,r()*H,1,1);
 return pix(x,W,H)}
function igPic(c,mine,key){const W=48,H=48,k=document.createElement('canvas');k.width=W;k.height=H;const x=k.getContext('2d'),hs=igxHash(key),h=[330,350,12,28,285,205][hs%6],r=igxRng(hs);
 igxGrad(x,'hsl('+h+',85%,80%)','hsl('+((h+28)%360)+',80%,62%)',0,H,0,W);
 for(let i=0;i<7;i++){x.save();x.globalAlpha=.16+r()*.14;igxDisc(x,r()<.5?'#fff':'hsl('+((h+60)%360)+',90%,85%)',r()*W,r()*H*.7,2+Math.floor(r()*4));x.restore()}
 glow(x,'#fff',W*.5,H*.4,19,.3,5);ring(x,'#ffffff',W*.5,H*.4,18,.8);ring(x,'#ffffff',W*.5,H*.4,17,.4);
 x.drawImage(igxRender([{c,mine}],{shot:'tight',xs:[0],ry:.34,lc:{amb:'#d0c4c8',key:'#fff0e4',rim:'#ffffff'},pose:'none'},W,H),0,0);
 x.save();x.globalAlpha=.07;igxF(x,'#ff9a60',0,0,W,H);x.restore();
 return pix(x,W,H)}
/* the style comes from the caller, or from the app being drawn (PST.cur) */
igxPortrait=function(c,mine,st){st=st||PST.cur||'msg';if(st=='msg')return P0(c,mine);
 const key=st+'|'+(mine?'me|':'')+JSON.stringify(c);if(PF[key])return PF[key];
 const u=st=='sf'?sfPic(c,mine,key):igPic(c,mine,key),n=Object.keys(PF);if(n.length>400)delete PF[n[0]];return PF[key]=u};
const has=(c,mine,st)=>(st||'msg')=='msg'?!!IGX.PF[(mine?'me|':'')+JSON.stringify(c)]:!!PF[st+'|'+(mine?'me|':'')+JSON.stringify(c)];
/* draw later: return the old picture now, render a few per frame, then swap every <img> still showing the old one */
const Q=[],QK=new Set;let busy=0;
function later(c,mine,st,old){if(!IGX.on||!c)return old;if(has(c,mine,st))return igxPortrait(c,mine,st);const k=st+'|'+old;
 if(!QK.has(k)){QK.add(k);Q.push({c,mine,st,old,k});if(!busy){busy=1;requestAnimationFrame(pump)}}return old}
function pump(){const t=performance.now();while(Q.length&&performance.now()-t<10){const j=Q.shift();QK.delete(j.k);let u;try{u=igxPortrait(j.c,j.mine,j.st)}catch(e){console.warn('portrait',e);IGX.on=0;Q.length=0;break}
 if(shown()===j.st)document.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')===j.old)i.src=u})}
 if(Q.length)requestAnimationFrame(pump);else busy=0}
/* the app on screen right now; a late picture only swaps in while its own app is showing */
function shown(){try{const a=mode=='phone'?{sf:'sf',spot:'sf',ig:'ig',msg:'msg'}[PH.app]:mode=='pc'?{1:'sf',ig:'ig',msg:'msg'}[app]:null;return a||null}catch(e){return null}}
/* 16x16 face url -> look, from the pf2 cache, for faces drawn from a look the earlier swaps did not know about */
const RV=new Map();let RVn=0;
function rv(){try{const ks=Object.keys(PFC2);if(ks.length!==RVn){RVn=ks.length;ks.forEach(j=>{const u=PFC2[j];if(!RV.has(u))try{RV.set(u,JSON.parse(j))}catch(e){}})}}catch(e){}return RV}
function swapAll(h,st){if(typeof h!='string'||!IGX.on)return h;const m=rv();
 return h.replace(/data:image\/png;base64,[A-Za-z0-9+\/=]+/g,u=>{const c=m.get(u);return c?later(c,0,st,u):u})}
/* Messages: leftover faces (New chat list) */
{const pm=PA.msg;PA.msg=function(){PST.cur='msg';let h;try{h=pm.apply(this,arguments)}finally{PST.cur=null}
 return swapAll(h,'msg')}}
/* Big Vee, in Messages and the tutorial's speech box */
if(typeof tutPic=='function'){const tp=tutPic;tutPic=function(){if(IGX.on)try{return igxPortrait(VEEC,0,'msg')}catch(e){}return tp.apply(this,arguments)}}
/* meeting pop-up */
if(typeof meetR=='function'){const m0=meetR;meetR=function(){const r=m0.apply(this,arguments);try{const ui=document.getElementById('ui'),im=ui&&ui.querySelector('.mth img');if(im&&MEET&&MEET.a&&MEET.a[4])im.src=igxPortrait(MEET.a[4],0,'msg')}catch(e){}return r}}
/* Instagrime: every picture in the app in the selfie style (178's swaps run inside, with PST.cur set) */
{const ig0=PA.ig;PA.ig=function(){PST.cur='ig';let h;try{h=ig0.apply(this,arguments)}finally{PST.cur=null}return swapAll(h,'ig')}}
/* Spotifly: Browse artists and artist pages */
if(typeof brFace=='function'){const b0=brFace;brFace=function(i){const old=b0(i);if(!IGX.on)return old;try{const x=BRL()[i],cfg=(typeof realLook=='function'&&realLook(x[0]))||x[3]||lk(x[0]);return later(cfg,0,'sf',old)}catch(e){return old}}}
/* your own picture in Spotifly (not while a band picture or an uploaded one is showing) */
const myOld=()=>{try{if(S.pfpSp)return null;const u=pfp();return u===pfp(ch)?u:null}catch(e){return null}};
function sfMine(root){const u=myOld();if(!u||!IGX.on||!root)return;let n;try{n=igxPortrait(ch,1,'sf')}catch(e){return}root.querySelectorAll('img').forEach(i=>{if(i.getAttribute('src')===u)i.src=n})}
{const p0=pcR;pcR=function(){const r=p0.apply(this,arguments);try{if(app==1&&S.artist)sfMine(document.getElementById('pc'))}catch(e){}return r}}
if(typeof gpSf=='function'){const g0=gpSf;gpSf=function(){let h=g0.apply(this,arguments);try{const u=myOld();if(u&&IGX.on&&typeof h=='string'&&h.indexOf(u)>=0)h=h.split(u).join(igxPortrait(ch,1,'sf'))}catch(e){}return h}}
const st=document.createElement('style');st.textContent=`.brf2{image-rendering:pixelated}#pc .sb img.pf{image-rendering:pixelated}`;document.head.appendChild(st);
})();
