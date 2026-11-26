/* WaveFern dev: SANTA'S LODGE (Christmas event). Only loaded where window.FW_FEAT is on (the dev site). Add ?nolodge to the address to skip it.

   A snowy log lodge on the lawn west of the shops on Fern Road (x -74..-54, z -18..-4; a candy cane arch on the way in, door on the south side).
   Walk in (press E at the door) and Santa is there. He tells you he is looking for cookies and candy canes, which are hiding all over the map
   (they glow, and once you have met him they are also marked on the map). Pick one up by walking into it, bring it to Santa and feed him:
   he chews, swallows and grows a little rounder each time. The 5th treat makes him swell up, rumble, pop his belt buttons and BURP: a present
   flies out of his mouth in a big arc. Open it and it is rolled with the Christmas crate roll of the advent calendar (dev-advent-v1.js,
   FW_ADVENT.gift), so the tiers and odds are exactly the same. After the burp he deflates back to normal and you can feed him again.

   Saved in the career as S.lodge = {met, ck (cookies carried), cn (candy canes carried), fed (0 to 4 this round), tot (treats fed), gifts (presents opened), pend (a present is waiting), pr (its prize once rolled)}.
   Everything is added on top (world meshes, a SHOPS room far away, wrapped functions); no earlier file is changed. */
(function(){
 if(!window.FW_FEAT||typeof THREE=='undefined'||/[?&]nolodge/.test(location.search))return;
 if(typeof SHOPS=='undefined'||typeof WORLD=='undefined'||typeof ixGeo!='function'||typeof ixTex!='function'||typeof ixSign!='function'||typeof INT=='undefined'||typeof wc=='undefined')return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('lodge '+t,e)}}};
 const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),PK=a=>a[Math.floor(Math.random()*a.length)];
 const LX=-64,ZF=-4,W=20,D=14;/* the lodge: centre x, front wall z, width, depth */
 const OX=-3800,IW=18,ID=13;/* the room inside: x from OX, z from 320 */
 const Sv=()=>{const s=typeof S!='undefined'?S:null;return s&&typeof s=='object'&&s.day!==undefined?s:null};
 const LS=()=>{const s=Sv();if(!s)return{met:0,ck:0,cn:0,fed:0,tot:0,gifts:0,pend:0,pr:null,_tmp:1};const l=s.lodge=s.lodge&&typeof s.lodge=='object'?s.lodge:{};
  ['met','ck','cn','fed','tot','gifts','pend'].forEach(k=>{if(typeof l[k]!='number')l[k]=0});if(!('pr' in l))l.pr=null;return l};
 const save=()=>safe(()=>{if(typeof autoSave=='function')autoSave();if(typeof csPush=='function')csPush(1)},'save');
 const ease={out:p=>1-Math.pow(1-p,3),in:p=>p*p*p,io:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,back:p=>{const c=1.70158*1.4;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2)},
  elastic:p=>p==0||p==1?p:Math.pow(2,-9*p)*Math.sin((p*10-.75)*(2*Math.PI/3))+1,lin:p=>p};
 const lerp=(a,b,t)=>a+(b-a)*t;

 /* ---------- small helpers: boxes, merged geometry, colours ---------- */
 const MC={},GC={};
 const lam=c=>MC['l'+c]||(MC['l'+c]=new THREE.MeshLambertMaterial({color:c}));
 const bas=c=>MC['b'+c]||(MC['b'+c]=new THREE.MeshBasicMaterial({color:c}));
 const bgeo=(w,h,d)=>{const k=w+','+h+','+d;return GC[k]||(GC[k]=new THREE.BoxGeometry(w,h,d))};
 /* a box mesh in a group; a colour that starts with * is glowing (not lit) */
 const mk=(g,w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(bgeo(w,h,d),c[0]=='*'?bas('#'+c.slice(1)):lam(c));m.position.set(x,y,z);g.add(m);return m};
 /* a list of boxes for ixGeo (only the faces the camera can see are drawn): positions are relative to (ox,oz) */
 const mkList=(ox,oz)=>{const L=[],E=[];return{L,E,b:(w,h,d,c,x,y,z)=>{(c[0]=='*'?E:L).push([w,h,d,c[0]=='*'?'#'+c.slice(1):c,ox+x,y,oz+z])}}};
 const mergedMesh=(list,e)=>list.length?new THREE.Mesh(ixGeo(list),ixMat(e?1:0)):null;
 const SNOW='#f4f8fc',RED='#c62828',RED2='#a32d2d',GOLD='#e6c34a',CREAM='#f3ead3';

 /* ---------- the sweets: a voxel candy cane and a chocolate chip cookie ---------- */
 const CANE_PATH=[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[1,9],[2,9],[3,8],[3,7]];
 /* b(w,h,d,colour,x,y,z) draws one box; the cane stands at x,z with its foot at y, u is one block */
 function caneB(b,x,y,z,u,twist){CANE_PATH.forEach((p,i)=>b(u,u,u,i%2?'#f8f8f8':'#d62828',x+(p[0]-1.5)*u,y+(p[1]+.5)*u,z))}
 function cookieB(b,x,y,z,s){
  b(.72*s,.15*s,.5*s,'#c98a4b',x,y+.075*s,z);b(.5*s,.15*s,.72*s,'#c98a4b',x,y+.075*s,z);b(.62*s,.15*s,.62*s,'#c98a4b',x,y+.075*s,z);
  b(.56*s,.05*s,.56*s,'#e0a766',x,y+.17*s,z);
  [[-.15,.08],[.17,-.12],[.04,.2],[-.2,-.14],[.2,.15],[-.02,-.04]].forEach((q,i)=>b(.11*s,.07*s,.11*s,'#4b2a17',x+q[0]*s,y+.2*s,z+q[1]*s));
  b(.07*s,.05*s,.07*s,'#d62828',x+.08*s,y+.2*s,z+.26*s);b(.07*s,.05*s,.07*s,'#2e9e4f',x-.12*s,y+.2*s,z-.24*s);b(.07*s,.05*s,.07*s,'#2e9e4f',x+.27*s,y+.2*s,z-.02*s)}
 function foodModel(kind,s){const g=new THREE.Group();const b=(w,h,d,c,x,y,z)=>mk(g,w,h,d,c,x,y,z);if(kind=='ck')cookieB(b,0,0,0,s||1);else caneB(b,0,0,0,.15*(s||1));return g}
 /* 16x16 pixel icons for the counter */
 const ICON={};
 function icon(kind){if(ICON[kind])return ICON[kind];const cv=document.createElement('canvas');cv.width=cv.height=16;const x=cv.getContext('2d'),F=(c,X,Y,w,h)=>{x.fillStyle=c;x.fillRect(X,Y,w||1,h||1)};
  if(kind=='ck'){F('#000',4,2,8,1);F('#000',2,3,12,1);F('#000',1,4,14,8);F('#000',2,12,12,1);F('#000',4,13,8,1);F('#c98a4b',3,3,10,1);F('#c98a4b',2,4,12,8);F('#c98a4b',3,12,10,1);F('#e0a766',4,4,7,2);F('#e0a766',3,6,3,2);F('#4b2a17',5,6,2,2);F('#4b2a17',10,5,2,2);F('#4b2a17',8,9,2,2);F('#4b2a17',4,10,2,2);F('#4b2a17',11,9,2,2)}
  else{const P=[[3,13],[3,11],[3,9],[3,7],[3,5],[4,3],[5,2],[6,2],[7,3],[7,4]];P.forEach((p,i)=>{F('#000',p[0]-1,p[1]-1,4,4)});P.forEach((p,i)=>{F(i%2?'#fff':'#e23030',p[0],p[1],2,2)});F('#e23030',3,12,2,1)}
  return ICON[kind]=cv.toDataURL()}

 /* ---------- generic builders used outside and inside ---------- */
 const gift=(b,x,y,z,s,c1,c2)=>{b(s,s,s,c1,x,y+s/2,z);b(s+.02,s,s*.16,c2,x,y+s/2,z);b(s*.16,s,s+.02,c2,x,y+s/2,z);b(s*.3,s*.18,s*.3,c2,x,y+s+s*.09,z)};
 const pine=(b,cl,x,z,s)=>{b(.6*s,1.4*s,.6*s,'#6b4423',x,.7*s,z);const G=['#2d7a4c','#378f5a','#2d7a4c','#378f5a','#2d7a4c'];
  for(let i=0;i<5;i++){const w=(4.2-.8*i)*s,y=1.3*s+.55*s+i*.95*s;b(w,.95*s,w,G[i],x,y,z);b(w*.86,.14*s,w*.86,SNOW,x,y+.52*s,z);b(w*.5,.1*s,w*.5,SNOW,x,y+.4*s,z+w*.5)}
  b(.8*s,.8*s,.8*s,SNOW,x,1.3*s+.55*s+5*.95*s-.1*s,z);b(.4*s,.4*s,.4*s,'*ffd23f',x,1.3*s+.55*s+5*.95*s+.5*s,z);if(cl)cl(x-.9*s,z-.9*s,x+.9*s,z+.9*s)};
 const snowman=(b,cl,x,z)=>{b(1.7,1.3,1.7,'#fff',x,.65,z);b(1.25,1,1.25,'#fff',x,1.8,z);b(.95,.85,.95,'#fff',x,2.75,z);b(1.3,.22,1.3,RED,x,2.3,z+.02);b(.28,.8,.22,RED,x+.5,1.9,z+.62);
  b(.14,.14,.06,'#111',x-.2,2.9,z+.49);b(.14,.14,.06,'#111',x+.2,2.9,z+.49);b(.14,.14,.5,'#ff7a1a',x,2.72,z+.6);[0,-.25,-.5].forEach((o,i)=>b(.12,.12,.06,'#111',x+(i-1)*.1*0,2.15+o*.0,z+.64));
  [.45,.15,-.15].forEach((o,i)=>b(.13,.13,.06,'#111',x,2.05-.28*i,z+.64));b(.75,.5,.75,'#1b1b1f',x,3.4,z);b(1.1,.1,1.1,'#1b1b1f',x,3.17,z);b(.78,.12,.78,RED,x,3.27,z);
  b(1.1,.1,.1,'#5a3a1a',x-1.15,2.0,z);b(1.1,.1,.1,'#5a3a1a',x+1.15,2.0,z);cl(x-.9,z-.9,x+.9,z+.9)};
 const reindeer=(b,cl,x,z,rudolph)=>{const T='#8b5a2b',T2='#6b4423';b(.8,.95,1.7,T,x,1.4,z);b(.8,.5,.5,'#f4ead8',x,1.2,z+.7);[[-.28,-.6],[.28,-.6],[-.28,.6],[.28,.6]].forEach(q=>b(.22,.95,.22,T2,x+q[0],.47,z+q[1]));
  b(.45,.8,.45,T,x,2.1,z+.95);b(.6,.55,.6,T,x,2.6,z+1.1);b(.34,.3,.35,T2,x,2.45,z+1.5);b(.22,.22,.12,rudolph?'*ff2a2a':'#222',x,2.5,z+1.7);
  b(.1,.12,.06,'#111',x-.2,2.7,z+1.41);b(.1,.12,.06,'#111',x+.2,2.7,z+1.41);[-1,1].forEach(s=>{b(.12,.8,.12,'#d9c8a0',x+s*.25,3.2,z+1.05);b(.5,.1,.1,'#d9c8a0',x+s*.5,3.45,z+1.05);b(.4,.1,.1,'#d9c8a0',x+s*.45,3.2,z+1.05);b(.14,.2,.14,T2,x+s*.3,2.95,z+1.0)});
  b(.25,.3,.15,'#fff',x,1.75,z-.9);b(.9,.16,.12,RED,x,2.0,z+.85);b(.18,.18,.14,GOLD,x,1.85,z+.92);cl(x-.6,z-1,x+.6,z+1.2)};

 /* ---------- the lodge outside ---------- */
 const TW=[];/* twinkle groups: [material, phase] */
 const SMOKE=[];let OUT=null,CH={x:LX+W/2+.9,y:13.5,z:ZF-7};
 function buildOutside(){
  const g=new THREE.Group(),X=mkList(LX,ZF),b=X.b,cls=[];
  const cl=(x0,z0,x1,z1)=>cls.push([LX+x0,ZF+z0,LX+x1,ZF+z1]);
  const BL=[mkList(LX,ZF),mkList(LX,ZF),mkList(LX,ZF)],bulb=(i,c,x,y,z)=>BL[i%3].b(.22,.3,.22,c,x,y,z);
  const BC=['*ff4040','*ffd23f','*46e083','*4aa3ff','*ff7ad9'];
  /* snow on the ground, a stone path, the foundation */
  b(48,.07,38,'#d3e1ee',0,.035,-4);for(let i=0;i<34;i++){const a=R(0,6.28),rx=24+R(-1,2),rz=19+R(-1,2);b(R(1.5,4),.09,R(1.5,3.5),'#dce8f2',Math.cos(a)*rx,.045,-4+Math.sin(a)*rz)}
  for(let z=4.6;z<17.5;z+=1.7){const j=R(-.25,.25);b(3.1,.08,1.5,'#b7c3cf',j,.05,z);b(2.8,.1,1.2,'#dde6ee',j,.07,z)}
  b(W+.8,.7,D+.8,'#8d9298',0,.35,-D/2);for(let i=0;i<22;i++)b(R(1,2.2),.32,.05,i%2?'#7b8087':'#a3a8ae',R(-W/2,W/2),R(.2,.55),.43);b(W+.9,.1,.5,SNOW,0,.75,.2);b(.5,.1,D+.9,SNOW,W/2+.15,.75,-D/2);
  /* log walls: nine courses with notched corners */
  const LG=['#8f5d36','#7b4c2a','#9a6a40','#85552f'];
  for(let i=0;i<9;i++){const y=1+i*.6,c=LG[i%4],odd=i%2;
   b(W+(odd?1.1:0),.58,.7,c,0,y,-.35);b(.7,.58,D+(odd?0:1.1),c,W/2-.35,y,-D/2);
   if(odd)b(.05,.48,.48,'#dbb37a',W/2+.58,y,-.35);else b(.48,.48,.05,'#dbb37a',W/2-.35,y,.58)}
  /* front: windows with shutters, flower boxes and snowy sills */
  [-5.6,5.6].forEach(sx=>{b(3.1,2.6,.16,CREAM,sx,2.7,.08);b(2.5,2,.2,'*ffd98a',sx,2.7,.1);b(2.5,.5,.22,'*f0b050',sx,2.2,.1);b(.12,2,.24,CREAM,sx,2.7,.11);b(2.5,.12,.24,CREAM,sx,2.7,.11);
   [-1,1].forEach(s=>{b(.8,2.6,.14,RED2,sx+s*1.95,2.7,.07);for(let k=0;k<5;k++)b(.5,.07,.16,'#7e1d1d',sx+s*1.95,1.8+k*.42,.08)});
   b(3.4,.2,.62,CREAM,sx,1.3,.31);b(3.2,.12,.5,SNOW,sx,1.46,.31);b(2.8,.5,.5,'#6b4a2e',sx,.98,.36);b(2.7,.3,.42,'#2e8b57',sx,1.3,.36);[-1,-.3,.5,1].forEach(o=>b(.14,.14,.14,'#e63946',sx+o,1.5,.5))});
  /* right wall windows */
  [-4,-10].forEach(z=>{b(.16,2.6,3.1,CREAM,W/2+.08,2.7,z);b(.2,2,2.5,'*ffd98a',W/2+.1,2.7,z);b(.24,2,.12,CREAM,W/2+.11,2.7,z);b(.24,.12,2.5,CREAM,W/2+.11,2.7,z);
   [-1,1].forEach(s=>b(.14,2.6,.8,RED2,W/2+.07,2.7,z+s*1.95));b(.62,.2,3.4,CREAM,W/2+.31,1.3,z);b(.5,.12,3.2,SNOW,W/2+.31,1.46,z)});
  /* the double door, frame, wreath, lanterns, awning, sign */
  b(.28,3.3,.28,'#c98d4f',-1.75,2.15,.14);b(.28,3.3,.28,'#c98d4f',1.75,2.15,.14);b(4,.36,.34,'#c98d4f',0,3.65,.17);
  [-1,1].forEach(s=>{b(1.5,3,.16,'#5a3420',s*.78,2,.1);b(1.1,.9,.2,'#6e4228',s*.78,1.25,.12);b(1.0,.85,.2,'*ffd98a',s*.78,2.65,.12);b(.1,.45,.12,GOLD,s*.15,1.8,.2)});b(.1,3,.2,'#3a2212',0,2,.12);
  for(let a=0;a<10;a++){const t=a/10*6.283;b(.3,.3,.12,a%2?'#2f8f46':'#3fae5a',Math.cos(t)*.52,2.35+Math.sin(t)*.52,.24)}b(.5,.28,.1,'#d62828',0,1.82,.28);[[.2,2.9],[-.3,2.8],[.4,1.9]].forEach(q=>b(.1,.1,.1,'#e63946',q[0],q[1],.3));
  [-2.7,2.7].forEach(s=>{b(.12,.12,.6,'#2a2a2a',s,3.3,.3);b(.42,.6,.42,'*ffd98a',s,3.05,.5);b(.5,.1,.5,'#2a2a2a',s,3.4,.5)});
  for(let i=-4;i<=4;i++)b(.6,.22,2,i%2?'#fff':RED2,i*.6,3.8,1);b(5.4,.12,2,SNOW,0,4,1);for(let i=-4;i<=4;i++)b(.3,.3,.1,i%2?'#fff':RED2,i*.6,3.6,2.05);
  /* porch deck, steps, big candy canes by the steps */
  b(8,.3,3.6,'#b0824f',0,.35,1.8);for(let i=-3;i<=3;i++)b(.06,.02,3.5,'#8a6238',i*1.1,.51,1.8);b(5,.26,.9,'#a37445',0,.13,4.05);b(5,.1,.9,SNOW,0,.28,4.05);b(2.6,.03,3.7,'#b02030',0,.52,2.2);
  [-3.2,3.2].forEach(s=>caneB(b,s,.3,4.4,.34));cl(-3.9,3.9,-2.5,4.9);cl(2.5,3.9,3.9,4.9);
  const sg=ixSign("SANTA'S LODGE",'#fff4d0','#6e1620',8.6,1.1,{border:GOLD,ff:'Silkscreen,monospace'});sg.position.set(LX,4.85,ZF+.08);
  b(8.9,1.4,.08,GOLD,0,4.85,.04);
  /* roof: stepped red courses with a snow cover, icicles, wooden gable ends */
  for(let k=0;k<8;k++){const zf=1.2-1.15*k,zb=-D-1.2+1.15*k,dp=zf-zb;if(dp<.2)break;const y0=6.1+.58*k;
   b(W+2,.58,dp,k%2?'#b83232':RED2,0,y0+.29,(zf+zb)/2);
   if(k<7){b(W+2.1,.14,1.25,SNOW,0,y0+.65,zf-.57)}else b(W+2.1,.22,dp+.2,SNOW,0,y0+.69,(zf+zb)/2);
   if(zf>-6&&k<7){const wd=dp-.3;b(.08,.58,Math.max(.3,wd-.2),k%2?'#9a6a40':'#8f5d36',W/2+1.04,y0+.29,-D/2)}}
  b(.1,1.6,1.6,CREAM,W/2+1.1,7.8,-D/2);b(.12,1.35,1.35,'*ffdc8a',W/2+1.12,7.8,-D/2);b(.14,1.35,.1,CREAM,W/2+1.13,7.8,-D/2);b(.14,.1,1.35,CREAM,W/2+1.13,7.8,-D/2);
  for(let x=-W/2-.5;x<W/2+1;x+=.9)b(.16,R(.35,.8),.16,'#e6f4ff',x,5.85,1.15);
  /* stone chimney outside the right wall, smoke comes out of it */
  b(1.9,3.4,3.3,'#8a8f96',W/2+.95,1.7,-7);b(2.2,.3,3.6,'#6d727a',W/2+.95,3.45,-7);b(1.4,10,1.7,'#8a8f96',W/2+.8,8.4,-7);for(let y=4.4;y<13;y+=1.3)b(1.5,.3,1.8,'#767b82',W/2+.8,y,-7);for(let i=0;i<7;i++)b(R(.4,.8),.32,.05,i%2?'#a3a8ae':'#6d727a',W/2+R(.5,1.3),R(.3,3),-5.33);
  b(1.9,.35,2.1,'#5b5f66',W/2+.8,13.5,-7);b(1.7,.12,1.9,SNOW,W/2+.8,13.75,-7);b(1.2,.9,.06,'#2a1a10',W/2+.95,.85,-5.3);b(.9,.5,.08,'*ff8a1e',W/2+.95,.6,-5.31);
  cl(-W/2-1,-D-1,W/2+2,.6);
  /* lights along the eave, the porch and the roof edge */
  b(22,.05,.05,'#1d3a24',0,6.2,1.3);for(let i=0,x=-10.8;x<=10.8;x+=.6,i++)bulb(i,BC[i%5],x,6.0,1.3);
  b(.05,.05,D+2,'#1d3a24',W/2+1.1,6.2,-D/2);for(let i=0,z=-D+.5;z<1;z+=.6,i++)bulb(i+1,BC[(i+2)%5],W/2+1.1,6.0,z);
  b(5.6,.05,.05,'#1d3a24',0,3.55,2.05);for(let i=0,x=-2.7;x<=2.7;x+=.6,i++)bulb(i,BC[i%5],x,3.45,2.05);
  /* yard: lamp posts (candy canes), the arch, snowman, reindeer, sleigh, gifts, pines */
  [-3.2,3.2].forEach(s=>[8.5,13.5].forEach(z=>{caneB(b,s,0,z,.2);b(.4,.5,.4,'*ffd98a',s+(s<0?.9:-.9),2.55,z);cl(s-.3,z-.3,s+.3,z+.3)}));
  [-3.4,3.4].forEach(s=>{for(let y=0;y<5;y++)b(.6,.9,.6,y%2?'#f8f8f8':'#d62828',s,.45+y*.9,17);cl(s-.4,16.6,s+.4,17.4)});
  b(8.2,.55,.7,RED2,0,5.0,17);for(let i=-6;i<=6;i++)b(.6,.56,.72,i%2?'#fff':RED2,i*.6,5.0,17);b(8,.4,.8,'#2e7d32',0,5.5,17);for(let i=0,x=-3.6;x<=3.6;x+=.6,i++){b(.2,.2,.2,i%2?'#e63946':GOLD,x,5.55,17.45);bulb(i,BC[i%5],x,5.25,17.45)}
  b(.8,.8,.3,'*ffd23f',0,6.2,17);b(.3,1.2,.3,'*ffd23f',0,6.2,17);
  const sg2=ixSign("SANTA'S LODGE",'#fff4d0','#6e1620',5.6,.8,{border:GOLD,ff:'Silkscreen,monospace'});sg2.position.set(LX,4.1,ZF+17.42);
  snowman(b,cl,-8.4,8);reindeer(b,cl,-6.4,5.6,false);reindeer(b,cl,6.4,5.6,true);
  b(3.8,.14,.14,GOLD,15.6,.3,2.2);b(3.8,.14,.14,GOLD,15.6,.3,3.8);b(.4,.6,.14,GOLD,17.6,.55,2.2);b(.4,.6,.14,GOLD,17.6,.55,3.8);b(3.2,.8,1.9,RED,15.6,.95,3);b(.35,1.4,1.9,RED2,14.1,1.3,3);b(2.8,.22,1.5,'#f4f4f4',15.6,1.4,3);b(3.2,.12,1.95,GOLD,15.6,1.38,3);
  b(1.2,1.3,1,'#b8895a',14.8,2.0,3);gift(b,16.2,1.4,3,.7,'#2a8f5a','#fff');cl(13.8,1.9,17.6,4.1);
  gift(b,-3.2,.5,3,.9,'#2a8f5a','#fff');gift(b,-4.3,.5,3.4,.7,'#3b6fd8',GOLD);gift(b,-3.7,1.4,3.1,.6,'#d62828','#fff');gift(b,-5.2,.5,2.6,.6,'#f2c14e','#d62828');cl(-5.8,2.2,-2.6,4);
  [[-15,-2,1.1],[-17.5,5,1],[-14.5,-9,1.2],[-19,-6,.9],[-16,11,1],[-21,1,1.1],[16.5,-8,1.1],[19.5,-3,.9],[-9,-17,1.2],[2,-18,1],[10,-17.5,1.1],[19.5,-14,1],[-16,-15,1],[-22,9,.9],[17,13,.9]].forEach(p=>pine(b,cl,p[0],p[1],p[2]));
  /* twinkling bulbs on two of the pines */
  [[-14.5,-9],[-16,11]].forEach((p,j)=>{for(let i=0;i<12;i++){const a=i*2.4,h=2+i*.38,r=1.9-i*.13;bulb(i+j,BC[i%5],p[0]+Math.cos(a)*r*.85,h,p[1]+Math.sin(a)*r*.85)}});
  g.add(mergedMesh(X.L,0));if(X.E.length)g.add(mergedMesh(X.E,1));
  BL.forEach((l,i)=>{if(!l.L.length&&!l.E.length)return;const m=new THREE.Mesh(ixGeo(l.E.concat(l.L)),new THREE.MeshBasicMaterial({vertexColors:true}));g.add(m);TW.push([m.material,i*2.1])});
  g.add(sg);g.add(sg2);
  cls.forEach(c=>col(c[0],c[1],c[2],c[3]));
  /* chimney smoke: little puffs that rise, grow and fade */
  for(let i=0;i<9;i++){const m=new THREE.Mesh(bgeo(.7,.7,.7),new THREE.MeshBasicMaterial({color:'#e4e9ee',transparent:true,opacity:0}));m.visible=false;g.add(m);SMOKE.push({m,t:i/9*4})}
  WORLD.add(g);OUT=g;
  /* the door: press E on the porch */
  INT.push({x:LX,z:ZF+3.4,r:2.4,l:"Enter Santa's Lodge",a:()=>enterLodge()});
  POIS.push([LX,ZF+12,"Santa's Lodge",'#ff4b4b']);
 }

 /* ---------- Santa: a chunky voxel Santa made of jointed parts so he can chew, swell, shake and burp ---------- */
 const SA={grow:0,pulse:0,sq:0,jaw:0,tilt:0,tiltZ:0,shake:0,eye:1,bulge:0,brow:0,cheek:0,armL:0,armR:0,armLx:0,armRx:0,hat:0,bx:0,hop:0,lean:0,spin:0,rumble:0};
 let SN=null;
 function mkSanta(){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);const o={root,body};
  const m=(g,w,h,d,c,x,y,z)=>mk(g,w,h,d,c,x,y,z);
  const RD='#d32f2f',RD2='#b32424',WH='#f6f6f6',SK='#f2b79a',BK='#17171a';
  /* boots and legs */
  [-1,1].forEach(s=>{m(body,.52,.32,.78,BK,s*.34,.16,.1);m(body,.58,.12,.62,WH,s*.34,.38,0);m(body,.46,.5,.46,RD2,s*.34,.68,0)});
  /* torso: hips, chest, and the belly on its own pivot so it can swell forwards */
  const tor=new THREE.Group();tor.position.set(0,.9,0);body.add(tor);o.tor=tor;
  m(tor,1.2,.4,.95,RD,0,.2,0);m(tor,1.4,.5,1.0,RD,0,.85,0);m(tor,1.5,.14,1.04,WH,0,1.12,0);
  const bel=new THREE.Group();bel.position.set(0,.5,-.32);tor.add(bel);o.bel=bel;
  m(bel,1.5,.8,1.05,RD,0,0,.55);m(bel,1.6,.2,1.2,WH,0,-.4,.55);m(bel,.28,.95,.06,WH,0,.04,1.1);
  m(bel,1.56,.2,1.12,BK,0,-.14,.55);m(bel,.46,.3,.07,GOLD,0,-.14,1.14);m(bel,.26,.16,.08,BK,0,-.14,1.16);
  o.btn=[0,.2,.4].map((y,i)=>m(bel,.1,.1,.07,BK,0,y+.05,1.14));
  [-1,1].forEach(s=>m(tor,.16,.7,.1,RD2,s*.42,.8,.52));
  /* arms, each hanging from a shoulder pivot */
  o.arm=[-1,1].map(s=>{const a=new THREE.Group();a.position.set(s*.86,1.2,0);tor.add(a);
   m(a,.4,.72,.42,RD,0,-.36,0);m(a,.46,.17,.48,WH,0,-.78,0);m(a,.38,.3,.4,BK,0,-1.0,.02);m(a,.13,.15,.14,BK,s*.2,-.95,.14);return a});
  /* head: face, spectacles, brows, nose, big moustache, beard in two parts so the jaw can drop */
  const head=new THREE.Group();head.position.set(0,2.2,0);tor.add(head);o.head=head;
  m(head,.86,.74,.8,SK,0,.4,0);[-1,1].forEach(s=>m(head,.1,.2,.14,SK,s*.48,.38,0));
  m(head,.22,.2,.22,'#e08e7d',0,.36,.46);
  o.eye=[-1,1].map(s=>{const e=new THREE.Group();e.position.set(s*.2,.52,.41);head.add(e);m(e,.13,.16,.04,BK,0,0,0);m(e,.05,.05,.03,'#fff',s*.02,.04,.03);return e});
  [-1,1].forEach(s=>{m(head,.3,.04,.04,GOLD,s*.2,.52,.45);m(head,.04,.26,.04,GOLD,s*.35,.52,.45);m(head,.04,.26,.04,GOLD,s*.05,.52,.45);m(head,.3,.04,.04,GOLD,s*.2,.39,.45)});
  m(head,.08,.04,.04,GOLD,0,.52,.45);
  o.brow=[-1,1].map(s=>{const e=m(head,.32,.11,.08,WH,s*.2,.68,.42);return e});
  o.cheek=[-1,1].map(s=>m(head,.2,.14,.04,'#ee8585',s*.31,.3,.41));
  m(head,.46,.16,.16,WH,-.2,.22,.46);m(head,.46,.16,.16,WH,.2,.22,.46);m(head,.2,.1,.18,WH,-.38,.14,.44);m(head,.2,.1,.18,WH,.38,.14,.44);
  m(head,.9,.32,.5,WH,0,.08,.12);
  o.mouth=m(head,.3,.3,.05,'#5a1418',0,.1,.62);o.mouth.scale.y=.2;
  o.tongue=m(head,.2,.1,.05,'#e8607a',0,.02,.63);o.tongue.visible=false;
  const lb=new THREE.Group();head.add(lb);o.lb=lb;
  m(lb,.94,.3,.28,WH,0,-.1,.4);m(lb,.84,.3,.3,WH,0,-.38,.46);m(lb,.7,.28,.32,WH,0,-.64,.5);m(lb,.5,.26,.3,WH,0,-.86,.54);m(lb,.3,.22,.26,WH,0,-1.04,.56);
  /* hat: band, three red blocks and a drooping tail with a pom-pom */
  const hat=new THREE.Group();hat.position.set(0,.78,0);head.add(hat);o.hat=hat;
  m(hat,.98,.22,.92,WH,0,.02,.02);m(hat,.82,.3,.78,RD,0,.28,0);m(hat,.68,.28,.64,RD,0,.56,-.06);
  o.tail=[[.52,.26,.52,.84,-.18],[.42,.24,.42,.9,-.42],[.34,.22,.34,.78,-.64],[.28,.2,.28,.54,-.76]].map(q=>{const t=new THREE.Group();hat.add(t);m(t,q[0],q[1],q[2],RD,0,q[3],q[4]);return t});
  m(hat,.3,.3,.3,WH,0,.3,-.76);
  return Object.assign(o,{pos:new THREE.Vector3()})}
 /* the body language: every frame the animation numbers in SA are turned into joint angles and scales */
 let BLINK=2,IDLE=6,PATT=0;
 function poseSanta(dt,t){
  if(!SN)return;const A=SA,o=SN;
  BLINK-=dt;if(BLINK<0)BLINK=R(2,5);const bl=BLINK<.12?.1:1;
  const br=Math.sin(t*1.8)*.014,sh=A.shake?Math.sin(t*55)*.05*A.shake:0,hop=Math.max(0,A.hop);
  const gs=.95*(1+.115*A.grow+A.pulse*.05);
  o.root.scale.set(gs*(1+A.sq*.18),gs*(1-A.sq*.16),gs*(1+A.sq*.18));
  o.root.position.y=hop;o.root.rotation.y=.55+A.spin+sh*.8;o.root.rotation.x=A.lean;
  const gx=1+.15*A.grow+A.bx,gz=1+.17*A.grow+A.bx*1.3;
  o.bel.scale.set(gx*(1+br),(1+.13*A.grow)*(1+br*2)+A.bx*.4,gz);
  o.btn.forEach((b,i)=>{b.position.z=1.14});
  o.tor.rotation.x=A.rumble?Math.sin(t*30)*.012*A.rumble:0;
  o.tor.position.x=sh*.5;
  /* arms: spread as the belly grows, swing a little, or follow the animation (armL/armR raise, armLx/armRx swing out) */
  const sw=Math.sin(t*1.5)*.04;
  o.arm[0].position.x=-(.86+.1*A.grow);o.arm[1].position.x=.86+.1*A.grow;
  o.arm[0].rotation.z=.14+.05*A.grow+A.armLx-sw;o.arm[1].rotation.z=-(.14+.05*A.grow)-A.armRx+sw;
  o.arm[0].rotation.x=-A.armL;o.arm[1].rotation.x=-A.armR;
  /* head */
  o.head.rotation.x=A.tilt+Math.sin(t*.9)*.02;o.head.rotation.z=A.tiltZ+Math.sin(t*.6)*.025+sh;o.head.position.y=2.2+br*2;
  o.mouth.scale.y=lerp(.2,1.7,Math.min(1.3,A.jaw));o.mouth.scale.x=1+.2*A.jaw;o.mouth.position.y=.1-.04*A.jaw;o.tongue.visible=A.jaw>.5;
  o.lb.position.y=-.26*A.jaw;
  o.eye.forEach(e=>{e.scale.y=bl*(A.eye)*(1+A.bulge*.5);e.scale.x=1+A.bulge*.4});
  o.brow.forEach((e,i)=>{e.position.y=.68+.09*A.brow;e.rotation.z=(i?-1:1)*(.15*A.brow)});
  o.cheek.forEach(e=>{e.scale.set(1+.7*A.cheek,1+.7*A.cheek,1+A.cheek*2)});
  o.hat.rotation.z=Math.sin(t*1.3)*.03+A.hat;o.hat.rotation.x=A.hat*.5+A.tilt*-.2;
  o.tail.forEach((q,i)=>{q.rotation.z=Math.sin(t*1.6-i*.7)*.05*(i+1)+A.hat*(i+1)*.3;q.rotation.x=Math.sin(t*1.2-i*.6)*.03*(i+1)});
  /* quiet idle: now and then he pats his belly */
  if(!busy&&!DLG&&IN&&IN.i==IDX){IDLE-=dt;if(IDLE<0){IDLE=R(7,12);PATT=1.2}}
  if(PATT>0){PATT-=dt;const k=PATT>0?Math.sin((1.2-PATT)*14)*.1:0;A.armR=.75+k*0;A.armRx=-.2+k;if(PATT<=0){A.armR=0;A.armRx=0}}
 }

 /* ---------- the room inside: 18 x 13, a fire, a tree, Santa's rug and his velvet backdrop ---------- */
 let IDX=-1,RG=null,FIRE=[],FLK=null,TREEL=[];
 const SPOT={x:OX+9,z:320+4.3};/* where Santa stands */
 function buildInside(){
  SHOPS.push({name:"Santa's Lodge",cx:LX,ox:OX,ez:ZF+5.2});IDX=SHOPS.length-1;
  const g=new THREE.Group();RG=g;if(typeof IG!='undefined')IG[IDX]=g;
  const X=mkList(OX,320),b=X.b,cl=(x0,z0,x1,z1)=>wc.push([OX+x0,320+z0,OX+x1,320+z1]);
  const add=(m,x,y,z,ry)=>{m.position.set(OX+x,y,320+z);if(ry)m.rotation.y=ry;g.add(m);return m};
  /* the void under and around the room */
  const vd=new THREE.Mesh(geo(60,.1,50),new THREE.MeshLambertMaterial({color:'#120a08'}));vd.position.set(OX+9,-.3,324);g.add(vd);
  add(new THREE.Mesh(geo(IW,.2,ID),ixTex('plank','#8a5a34','#6a4224',IW/2,ID/2)),IW/2,-.1,ID/2);
  const wm=ixTex('plank','#7a4c2c','#5c3820',IW,3),wm2=ixTex('plank','#7a4c2c','#5c3820',ID,3);
  add(new THREE.Mesh(geo(IW,3.3,.3),wm),IW/2,1.65,-.15);add(new THREE.Mesh(geo(.3,3.3,ID),wm2),-.15,1.65,ID/2);
  /* log beams, skirting, low front and right walls */
  [-.02,1.2,2.4].forEach(y=>{b(IW,.14,.12,'#5a3520',IW/2,y+.5,.06);b(.12,.14,ID,'#5a3520',.06,y+.5,ID/2)});b(IW+.4,.16,.4,'#4a2c18',IW/2-.1,3.38,-.1);b(.4,.16,ID+.3,'#4a2c18',-.1,3.38,ID/2-.05);
  b(IW,.16,.08,'#3a2212',IW/2,.08,.04);b(.08,.16,ID,'#3a2212',.04,.08,ID/2);
  b(7.6,.5,.2,'#5a3520',3.8,.25,ID);b(7.6,.5,.2,'#5a3520',IW-3.8,.25,ID);b(.2,.5,ID,'#5a3520',IW,.25,ID/2);b(7.8,.06,.26,GOLD,3.8,.53,ID);b(7.8,.06,.26,GOLD,IW-3.8,.53,ID);b(.26,.06,ID+.04,GOLD,IW,.53,ID/2);
  b(2.6,.03,.9,'#8a1c26',9,.015,ID-.5);b(2.2,.012,.6,'#c0303a',9,.03,ID-.5);
  /* the big rug under Santa */
  b(9.4,.04,6.6,GOLD,9,.02,6.2);b(9,.045,6.2,'#a82a30',9,.03,6.2);b(8.2,.05,5.4,'#c63a3a',9,.04,6.2);b(7.4,.055,4.6,'#f4efe4',9,.05,6.2);b(6.8,.06,4,'#a82a30',9,.06,6.2);
  for(let i=0;i<10;i++){b(.5,.07,.5,i%2?'#fff':'#d62828',4.5+i*.97,.065,3.9);b(.5,.07,.5,i%2?'#d62828':'#fff',4.5+i*.97,.065,8.5)}
  b(1.2,.07,1.2,'*ffd23f',9,.07,6.3);b(.5,.075,2,'*ffd23f',9,.075,6.3);b(2,.075,.5,'*ffd23f',9,.075,6.3);
  /* Santa's velvet backdrop with gold trim and swags, and his big chair behind him */
  b(6,3.1,.14,'#7a1620',9,1.55,.12);b(6.3,.22,.24,GOLD,9,3.12,.12);for(let i=0;i<7;i++)b(.12,2.9,.16,'#5e0f18',6.2+i*.8,1.5,.2);
  [-1,1].forEach(s=>{b(.7,3.1,.4,'#8a1c26',9+s*3.2,1.55,.3);b(.3,.4,.3,GOLD,9+s*3.2,.4,.55)});
  b(2.4,1.6,1.1,'#8a1c26',9,.8,1.5);b(2.4,.5,.5,'#a82a30',9,1.75,1.1);b(.5,1.1,1.1,'#7a1620',7.7,1.1,1.5);b(.5,1.1,1.1,'#7a1620',10.3,1.1,1.5);b(.3,.3,.3,GOLD,7.7,1.75,1.5);b(.3,.3,.3,GOLD,10.3,1.75,1.5);
  cl(7.4,.8,10.6,2.3);
  /* candy cane pillars either side of Santa */
  [5.5,12.5].forEach(x=>{caneB(b,x,0,2.6,.3);cl(x-.4,2.2,x+.4,3)});
  /* the fireplace on the back wall: stone, mantel, logs, stockings, garland */
  b(4.2,2.8,1.1,'#8a8f96',2.5,1.4,.55);for(let i=0;i<16;i++)b(R(.5,1),.3,.05,i%2?'#a3a8ae':'#6d727a',R(.9,4.1),R(.2,2.5),1.12);b(2.2,1.6,.3,'#1a0f0a',2.5,.9,1.05);b(2.2,.2,.4,'#6d727a',2.5,.1,1.2);
  b(4.8,.22,1.5,'#6b4226',2.5,2.9,.8);b(4.9,.08,1.55,'#4a2c18',2.5,2.78,.8);cl(.1,.1,4.9,1.7);
  [[.9,'#c62828'],[1.7,'#2e8b57'],[3.3,'#f6f6f6'],[4.1,'#c62828']].forEach(q=>{b(.34,.7,.14,q[1],q[0],2.5,1.62);b(.38,.16,.16,'#f6f6f6',q[0],2.85,1.62);b(.2,.2,.14,q[1],q[0]+.12,2.1,1.62)});
  b(4.4,.22,.3,'#2e7d32',2.5,3.05,1.45);for(let i=0;i<8;i++)b(.14,.14,.14,i%2?'#e63946':GOLD,.8+i*.5,3.13,1.62);
  b(1.6,.16,.16,'#4a2c18',2.5,.3,1.5);b(1.4,.16,.16,'#5a3520',2.3,.46,1.45);
  /* a window with a snowy night on the left wall, a bookshelf, the naughty or nice list */
  ixWin(b,0,10,2.6,'*1c2c58',1);b(.05,.28,.28,'*fff3b0',.07,2.35,9.3);[[.4,2.15,10.6],[.4,1.65,9.2],[.4,2.3,10.9],[.4,1.9,10]].forEach(q=>b(.05,.1,.1,'*ffffff',.07,q[1],q[2]));
  b(1,.2,2.8,'#4a2c18',.5,1.2,10);b(.08,.6,3,'#f6f6f6',.1,.3,10);
  b(1,2.5,3.4,'#5a3a22',.5,1.25,5.6);for(let r=0;r<4;r++){b(1.02,.08,3.4,'#3a2212',.52,.5+r*.62,5.6);for(let i=0;i<9;i++)b(.7,.42,.26,['#c0392b','#2e86c1','#27ae60','#f1c40f','#8e44ad','#e67e22'][(i+r)%6],.5,.75+r*.62,4.1+i*.34)}cl(0,3.8,1,7.4);
  const nl=ixSign('NAUGHTY OR NICE','#fff4d0','#5a1018',2.6,.9,{border:GOLD,k:.5});add(nl,0,1.95,7.9,Math.PI/2).position.x=OX+.04;
  /* toy workbench and a cookie table on the right, a big Christmas tree in the corner */
  b(2.4,.9,1.2,'#8a5a36',16.4,.45,10.6);b(2.5,.1,1.3,'#a87a4c',16.4,.95,10.6);gift(b,15.8,1.0,10.5,.5,'#3b6fd8',GOLD);gift(b,16.6,1.0,10.8,.4,'#d62828','#fff');b(.8,.3,.5,'#2e8b57',17,1.15,10.4);b(.3,.2,.3,RED,15.5,1.1,10.9);cl(15.1,9.9,17.8,11.3);
  b(1.4,.12,1.4,'#6b4226',13,.95,10.4);b(.2,.9,.2,'#4a2c18',13,.45,10.4);b(.8,.04,.8,'#fff',13,1.03,10.4);cookieB(b,12.8,1.05,10.4,.6);cookieB(b,13.2,1.05,10.5,.6);b(.3,.4,.3,'#f6f6f6',13,1.25,10.1);b(.3,.1,.3,'#cfe8ff',13,1.07,10.1);cl(12.2,9.7,13.8,11.1);
  /* decorated tree: layered green, ornaments, a star, presents underneath */
  const TX=15.8,TZ=2.4;b(.8,.9,.8,'#6b4423',TX,.45,TZ);b(1.8,.28,1.8,'#a82a30',TX,.14,TZ);
  const GR=['#2d7a4c','#378f5a','#2d7a4c','#378f5a','#2d7a4c','#378f5a'];for(let i=0;i<6;i++){const w=3.2-.5*i,y=1.05+i*.62;b(w,.64,w,GR[i],TX,y,TZ);b(w*.8,.12,w*.8,SNOW,TX,y+.34,TZ)}
  b(.5,.5,.5,'*ffd23f',TX,4.75,TZ);b(.2,.8,.2,'*ffd23f',TX,4.75,TZ);
  const OC=['#d62828','#ffd23f','#3b6fd8','#9b59b6','#ffffff','#e67e22'];for(let i=0;i<22;i++){const a=i*2.3,y=1+(i%6)*.62,r=(3.2-.5*(i%6))/2+.05;b(.2,.2,.2,OC[i%6],TX+Math.cos(a)*r,y+.1,TZ+Math.sin(a)*r)}
  gift(b,TX-1.6,0,TZ+1.3,.9,'#2a8f5a','#fff');gift(b,TX-.4,0,TZ+1.8,.7,'#d62828',GOLD);gift(b,TX+1.1,0,TZ+1.7,.8,'#3b6fd8','#fff');gift(b,TX-1.9,0,TZ+.2,.6,'#f2c14e','#d62828');cl(TX-2,TZ-1.5,TX+2,TZ+2.3);
  const TB=[mkList(OX,320),mkList(OX,320),mkList(OX,320)];const TC=['*ff4040','*ffd23f','*46e083','*4aa3ff','*ff7ad9'];
  for(let i=0;i<30;i++){const a=i*.9,y=1.2+i*.11,r=1.5-i*.038;TB[i%3].b(.18,.22,.18,TC[i%5],TX+Math.cos(a)*r,y,TZ+Math.sin(a)*r)}
  /* garland and lights along the back wall, hanging lamps, coat rack, plants */
  b(IW,.24,.28,'#2e7d32',IW/2,3.05,.16);for(let i=0;i<24;i++){b(.16,.16,.16,i%2?'#e63946':GOLD,.4+i*.74,3.2,.34);TB[i%3].b(.18,.22,.18,TC[(i+2)%5],.4+i*.74,2.9,.34)}
  [4.5,13.5].forEach(x=>ixPend(b,x,7.5,'*ffd98a','#3a2212',2.4));
  b(.12,1.8,.12,'#4a2c18',2,.9,12.2);b(.6,.08,.08,'#4a2c18',2,1.75,12.2);b(.3,.3,.3,RED,1.8,1.95,12.2);b(.3,.15,.3,'#fff',1.8,2.12,12.2);cl(1.6,11.9,2.4,12.5);
  ixPlant(b,cl,7,11.8,1.2);ixPlant(b,cl,11,11.8,1.2);
  g.add(mergedMesh(X.L,0));if(X.E.length)g.add(mergedMesh(X.E,1));
  TB.forEach((l,i)=>{const m=new THREE.Mesh(ixGeo(l.E.concat(l.L)),new THREE.MeshBasicMaterial({vertexColors:true}));g.add(m);TW.push([m.material,i*2.1+1])});
  /* sign plaque and stockings are drawn above; the fire is real meshes so it can flicker */
  [[2.5,.62,1.55,1.9,.5,'*ff8a1e'],[2.3,.5,1.5,1.2,.4,'*ffb02e'],[2.8,.45,1.5,1.0,.35,'*ffd23f'],[2.1,.4,1.55,.8,.3,'*ff5a1e']].forEach(q=>{const f=mk(g,q[3]*.4+.3,q[4],.3,q[5],OX+q[0],q[1],320+q[2]);FIRE.push(f)});
  /* lights that only shine while you are inside */
  const lg=new THREE.Group();[[2.5,2.4,1.5,0xff9a4a,1.6],[9,6.5,.5,0xffe6c0,.9],[15,3,.5,0xffd8c0,.7],[9,11,.5,0xffe6c0,.5]].forEach(p=>{const l=new THREE.PointLight(p[3],p[4],16,1);l.position.set(OX+p[0],p[2]+2.2,320+p[1]);lg.add(l);if(p[3]==0xff9a4a)FLK=l});lg.visible=false;g.add(lg);
  if(typeof IXL!='undefined')IXL.push([lg,IDX]);
  /* Santa and his spot */
  SN=mkSanta();SN.root.position.set(SPOT.x,0,SPOT.z);g.add(SN.root);
  cl(8,3.5,10,5.2);
  WORLD.add(g);
  INT.push({x:OX+9,z:320+7.4,r:2.3,l:'Talk to Santa',a:()=>talk(),santa:1},{x:OX+9,z:320+ID-.9,r:1.3,l:"Leave Santa's Lodge",a:()=>leaveLodge()});
  SINT=INT[INT.length-2];
 }
 let SINT=null;

 /* ---------- animation toolkit: tweens, particles, floating words, sounds ---------- */
 const TWN=[];
 const tween=(dur,fn,ez)=>new Promise(res=>{TWN.push({t:0,dur:Math.max(.001,dur),fn,ez:ez||ease.io,res})});
 const wait=s=>tween(s,()=>{},ease.lin);
 function stepTweens(dt){dt=Math.min(dt,.1);for(let i=0;i<TWN.length;i++){const q=TWN[i];q.t+=dt;const r=Math.min(1,q.t/q.dur);try{q.fn(q.ez(r),r)}catch(e){console.warn('lodge tween',e)}if(r>=1){TWN.splice(i,1);i--;q.res()}}}
 const PAR=[];
 function puff(pos,vel,col,size,life,grav){const m=new THREE.Mesh(bgeo(1,1,1),bas(col[0]=='*'?'#'+col.slice(1):col));m.scale.setScalar(size);m.position.copy(pos);scene.add(m);PAR.push({m,v:vel,life,t:0,g:grav==null?9:grav,s:size})}
 function stepPar(dt){for(let i=PAR.length-1;i>=0;i--){const q=PAR[i];q.t+=dt;if(q.t>=q.life){scene.remove(q.m);PAR.splice(i,1);continue}q.v.y-=q.g*dt;q.m.position.addScaledVector(q.v,dt);if(q.g>0&&q.m.position.y<.06){q.m.position.y=.06;q.v.y*=-.35;q.v.x*=.7;q.v.z*=.7}q.m.scale.setScalar(Math.max(.01,q.s*(1-q.t/q.life)));q.m.rotation.x+=dt*4;q.m.rotation.y+=dt*3}}
 const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
 function burstAt(p,cols,n,sp,size,life,g){for(let i=0;i<n;i++){const a=R(0,6.283),u=R(.2,1),v=R(sp*.4,sp);puff(p.clone(),V3(Math.cos(a)*v*u,R(.3,1)*v,Math.sin(a)*v*u),PK(cols),R(size*.6,size),R(life*.6,life),g)}}
 function popText(str,x,y,z,col,sc){const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');c.font='bold 62px Silkscreen,"Courier New",monospace';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=16;c.strokeStyle='#000';c.strokeText(str,256,66);c.fillStyle=col||'#fff';c.fillText(str,256,66);
  const tx=new THREE.CanvasTexture(cv);tx.minFilter=tx.magFilter=THREE.LinearFilter;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false}));sp.renderOrder=999;sp.scale.set(.01,.01,1);sp.position.set(x,y,z);scene.add(sp);const w=sc||3.4;
  tween(1.7,(p,r)=>{const s=r<.14?ease.back(r/.14):1;sp.scale.set(w*s,w*s/4,1);sp.position.y=y+r*1.2;sp.material.opacity=r>.72?1-(r-.72)/.28:1},ease.lin).then(()=>{scene.remove(sp);tx.dispose();sp.material.dispose()})}
 const aok=()=>typeof AC!='undefined'&&typeof FX!='undefined'&&FX&&typeof ac=='function';
 function tone(f0,f1,dur,type,vol,del,lp){safe(()=>{if(!aok())return;ac();const t=AC.currentTime+(del||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1||f0),t+dur);
   g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol||.2,t+Math.min(.04,dur/4));g.gain.exponentialRampToValueAtTime(.001,t+dur);let n=o;if(lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}
   n.connect(g);g.connect(typeof MG!='undefined'&&MG&&MG.connect?MG:AC.destination);o.start(t);o.stop(t+dur+.05)},'tone')}
 const sfx=n=>safe(()=>snd(n),'snd');
 const sHo=()=>[0,.34,.68].forEach((d,i)=>{tone(150-i*8,100-i*6,.3,'sawtooth',.16,d,650);tone(300-i*16,200,.3,'triangle',.05,d,900)});
 const sGulp=()=>{tone(420,110,.2,'sine',.3,0);tone(260,90,.16,'sine',.2,.12)};
 const sRumble=d=>{tone(58,38,d,'sawtooth',.22,0,220);tone(63,40,d,'square',.1,0,180);for(let i=0;i<10;i++)tone(90+R(-20,20),50,.14,'sawtooth',.1,i*d/10,260)};
 const sBurp=()=>{tone(120,44,1.15,'sawtooth',.34,0,420);tone(125,50,1.0,'square',.12,0,300);for(let i=0;i<14;i++)tone(150-i*5,60,.07,'sawtooth',.16,i*.07,500);sfx('thunk')};
 const sSparkle=()=>[0,.07,.14,.21].forEach((d,i)=>tone(1100+i*260,1500+i*300,.16,'triangle',.08,d));
 const sPffft=()=>{tone(700,180,1.4,'sawtooth',.06,0,900)};
 const sLevel=k=>{[0,.1,.2].forEach((d,i)=>tone(392*Math.pow(1.122,k*2+i*3),392*Math.pow(1.122,k*2+i*3),.2,'triangle',.12,d))};
 const bigText=(t,col)=>{const e=document.createElement('div');e.className='lgbig';e.textContent=t;e.style.color=col||'#ffe36a';document.body.appendChild(e);setTimeout(()=>e.remove(),1800)};
 const flashScr=(c,a)=>{const e=document.createElement('div');e.className='lgflash';e.style.background=c;e.style.opacity=a;document.body.appendChild(e);requestAnimationFrame(()=>{e.style.opacity=0});setTimeout(()=>e.remove(),600)};

 /* ---------- UI: styles, counter, Santa's dialogue panel ---------- */
 const css=document.createElement('style');
 css.textContent=`
#lgh{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:55;display:none;align-items:center;gap:14px;padding:5px 12px;background:#000c;color:#e8f3ec;border:2px solid #000;box-shadow:inset 0 0 0 2px #c0392b;font:11px Silkscreen,ui-monospace,monospace;letter-spacing:1px;pointer-events:none}
#lgh.on{display:flex}#lgh img{width:22px;height:22px;image-rendering:pixelated;vertical-align:middle;margin-right:4px}#lgh b{color:#ffe36a}
#lgh .pip{display:inline-block;width:10px;height:10px;margin-left:3px;background:#2a2a2a;border:2px solid #000}#lgh .pip.on{background:#e74c3c}
#lgh .bump{animation:lgbump .5s}@keyframes lgbump{30%{transform:scale(1.5)}}
#lgd{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:80;width:min(720px,94vw);box-sizing:border-box;display:flex;gap:14px;padding:12px 14px;background:#120a0a;border:3px solid #000;box-shadow:inset 0 0 0 2px #c0392b,6px 6px 0 #000a;color:#f3ead3;font:14px/1.45 ui-monospace,Menlo,Consolas,monospace;animation:lgup .25s ease-out}
@keyframes lgup{from{transform:translate(-50%,20px);opacity:0}}
#lgd canvas{flex:none;width:76px;height:76px;image-rendering:pixelated;background:#2a1010;border:2px solid #000;box-shadow:0 0 0 2px #c0392b}
#lgd .nm{font:700 11px Silkscreen,ui-monospace,monospace;letter-spacing:2px;color:#ff6b5a;margin-bottom:4px}#lgd .tx{min-height:3em}
#lgd .bt{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}#lgd button{padding:8px 12px;background:#2fe68a;color:#04120a;border:3px solid #000;box-shadow:inset 0 -3px #0004;font:700 11px Silkscreen,ui-monospace,monospace;cursor:pointer}
#lgd button:hover{background:#5cf0a6}#lgd button:disabled{background:#333;color:#777;cursor:default}#lgd .nx{position:absolute;right:14px;bottom:8px;font:10px Silkscreen,monospace;color:#8aa094;animation:lgblink 1s steps(2) infinite}@keyframes lgblink{50%{opacity:0}}
.lgbig{position:fixed;left:50%;top:26%;transform:translate(-50%,-50%);z-index:92;pointer-events:none;font:900 clamp(40px,9vw,110px) Silkscreen,Impact,monospace;letter-spacing:4px;-webkit-text-stroke:6px #000;paint-order:stroke fill;text-shadow:0 8px 0 #000a;animation:lgbig 1.7s cubic-bezier(.2,1.4,.4,1) forwards}
@keyframes lgbig{0%{transform:translate(-50%,-50%) scale(.1) rotate(-12deg);opacity:0}18%{transform:translate(-50%,-50%) scale(1.25) rotate(5deg);opacity:1}30%{transform:translate(-50%,-50%) scale(1) rotate(-2deg)}85%{opacity:1}100%{transform:translate(-50%,-70%) scale(1.1);opacity:0}}
.lgflash{position:fixed;inset:0;z-index:91;pointer-events:none;transition:opacity .5s}`;
 document.head.appendChild(css);
 const HUD=document.createElement('div');HUD.id='lgh';document.body.appendChild(HUD);let hudKey='';
 function hudNow(bump){const s=LS(),in_=IN&&IN.i==IDX,ok=(s.met||s.ck||s.cn)&&typeof mode!='undefined'&&(mode=='play'||mode=='menu')&&!document.getElementById('ttl');
  const key=[ok,s.ck,s.cn,s.fed,in_].join();if(key==hudKey&&!bump)return;hudKey=key;HUD.classList.toggle('on',!!ok);if(!ok)return;
  HUD.innerHTML=`<span class="${bump=='ck'?'bump':''}"><img src="${icon('ck')}" alt="">COOKIES <b>${s.ck}</b></span><span class="${bump=='cn'?'bump':''}"><img src="${icon('cn')}" alt="">CANDY CANES <b>${s.cn}</b></span>`+(in_?`<span>SANTA'S TUMMY ${[1,2,3,4,5].map(i=>`<i class="pip ${i<=s.fed?'on':''}"></i>`).join('')}</span>`:'')}
 /* Santa's portrait for the dialogue box, drawn with rectangles like the game's own pixel portraits */
 function portrait(){const cv=document.createElement('canvas');cv.width=cv.height=32;const x=cv.getContext('2d'),F=(c,X,Y,w,h)=>{x.fillStyle=c;x.fillRect(X,Y,w,h)};
  F('#3a1616',0,0,32,32);F('#d32f2f',6,3,20,6);F('#d32f2f',9,1,14,3);F('#fff',5,8,22,4);F('#fff',13,0,6,3);F('#f2b79a',8,12,16,9);F('#fff',7,18,18,12);F('#fff',5,22,22,8);F('#fff',9,24,14,7);
  F('#17171a',11,14,3,2);F('#17171a',18,14,3,2);F('#e6c34a',10,13,5,1);F('#e6c34a',17,13,5,1);F('#ee8585',9,17,3,2);F('#ee8585',20,17,3,2);F('#e08e7d',15,16,3,3);F('#fff',9,19,14,3);F('#5a1418',14,22,4,2);return cv}
 let DLG=null,DT=0;
 function closeDlg(keep){if(DT){clearInterval(DT);DT=0}if(DLG){DLG.remove();DLG=null;if(!keep&&mode=='menu'&&!busy)mode='play'}}
 /* show lines one after another (click or E / Space / Enter), then the menu buttons */
 function dlgShow(lines,menu){
  closeDlg(true);if(mode=='play')mode='menu';
  const el=document.createElement('div');el.id='lgd';const pc=portrait();el.appendChild(pc);const bx=document.createElement('div');bx.style.flex='1';bx.innerHTML='<div class="nm">SANTA</div><div class="tx"></div><div class="bt"></div><div class="nx">&#9654;</div>';el.appendChild(bx);document.body.appendChild(el);
  const tx=bx.querySelector('.tx'),bt=bx.querySelector('.bt'),nx=bx.querySelector('.nx');DLG={el,lines,i:0,menu,typing:0};let ch=0;
  const type=()=>{ch=0;DLG.typing=1;nx.style.display='none';tx.textContent='';clearInterval(DT);DT=setInterval(()=>{ch+=1;tx.textContent=lines[DLG.i].slice(0,ch);if(ch%3==0)tone(300+R(0,90),260,.04,'square',.025);if(ch>=lines[DLG.i].length){clearInterval(DT);DT=0;DLG.typing=0;done()}},22)};
  const done=()=>{if(DLG.i<lines.length-1){nx.style.display='block'}else if(menu){bt.innerHTML='';menu().forEach(q=>{const b=document.createElement('button');b.textContent=q.t;b.disabled=!!q.dis;b.onclick=()=>{sfx('click');q.fn()};bt.appendChild(b)})}else nx.style.display='block'};
  DLG.adv=()=>{if(!DLG)return;if(DLG.typing){clearInterval(DT);DT=0;DLG.typing=0;tx.textContent=lines[DLG.i];done();return}
   if(DLG.i<lines.length-1){DLG.i++;type()}else if(!menu)closeDlg()};
  el.addEventListener('click',e=>{if(e.target.tagName!='BUTTON')DLG&&DLG.adv()});type()}
 addEventListener('keydown',e=>{if(!DLG)return;const k=e.key;if(k=='e'||k=='E'||k==' '||k=='Enter'){e.preventDefault();e.stopImmediatePropagation();DLG.adv()}else if(k=='Escape'){e.preventDefault();e.stopImmediatePropagation();closeDlg()}},true);
 setInterval(()=>{if(DLG&&mode!='menu')closeDlg(true);hudNow()},400);

 /* ---------- going in and out ---------- */
 let busy=0;
 function fade(mid){let f=document.getElementById('lgfade');if(!f){f=document.createElement('div');f.id='lgfade';f.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:95;transition:opacity .3s';document.body.appendChild(f)}
  f.style.opacity=1;setTimeout(()=>{safe(mid,'fade');setTimeout(()=>{f.style.opacity=0},140)},330)}
 function enterLodge(){if(mode!='play'||IN||busy)return;sfx('pop');mode='menu';fade(()=>{mode='play';IN={i:IDX,x:OX,w:IW,d:ID};P.x=OX+9;P.z=320+ID-1.8;P.rot=Math.PI;camT.x=P.x;camT.z=P.z;sfx('ping');onEnter()})}
 function leaveLodge(){if(mode!='play'||busy)return;sfx('pop');mode='menu';fade(()=>{mode='play';IN=null;P.x=LX;P.z=ZF+5.6;P.rot=0;camT.x=P.x;camT.z=P.z;hudNow()})}
 function onEnter(){const s=LS();SA.grow=s.fed;Object.assign(SA,{pulse:0,sq:0,jaw:0,tilt:0,tiltZ:0,shake:0,eye:1,bulge:0,brow:0,cheek:0,armL:0,armR:0,armLx:0,armRx:0,hat:0,bx:0,hop:0,lean:0,spin:0,rumble:0});
  SN.btn.forEach(b=>b.visible=true);if(s.pend)showPresent(0);else hidePresent();
  /* Santa waves hello */
  (async()=>{await wait(.5);if(!IN||IN.i!=IDX||busy)return;tween(1.4,(p,r)=>{SA.armR=1.9*Math.min(1,r*5)*(r>.85?1-(r-.85)/.15:1);SA.armRx=.3+Math.sin(r*26)*.25;SA.brow=Math.sin(r*3.14)},ease.lin).then(()=>{SA.armR=0;SA.armRx=0;SA.brow=0});
   if(!busy)popText('Ho ho ho!',SPOT.x,5.3,SPOT.z,'#ffe36a',3);sHo()})();
  hudNow()}
 /* put every animation number gently back to rest */
 function settle(dur){const keys=['jaw','tilt','tiltZ','shake','bulge','brow','cheek','armL','armR','armLx','armRx','hat','bx','hop','lean','spin','rumble','sq','pulse'],f={};keys.forEach(k=>f[k]=SA[k]);const e0=SA.eye;
  return tween(dur,p=>{keys.forEach(k=>SA[k]=f[k]*(1-p));SA.eye=lerp(e0,1,p)},ease.out)}

 /* ---------- what Santa says ---------- */
 const INTRO=["Ho ho ho! Well, look who found my lodge!","I'm Santa, and between you and me, I have a SERIOUS sweet tooth this year.","The trouble is my knees. I can't wander the whole map hunting for cookies and candy canes any more.","So would you look for them for me? They're hiding all over town: parks, shop fronts, street corners. They glow, you can't miss them. I've even marked the ones I can smell on your map.","Walk into one to pick it up, then bring it to me. Every treat makes me a little rounder...","Feed me five and, well... stand back. I always have a little something for the helpful ones."];
 function hintLines(){const c=COLS.filter(q=>q.on)[0],s=LS();const near=COLS.filter(q=>q.on).map(q=>({q,d:Math.hypot(q.x-P.x,q.z-P.z)})).sort((a,b)=>a.d-b.d)[0];
  return[near?"Hmm, let me sniff... I can smell something sweet near "+near.q.n+". Press N for your map, I've marked them.":"I can't smell a single sweet right now. Give it a minute, more will turn up!","Cookies and candy canes both count. Five of them and I'll have a surprise for you."]}
 function greet(s){const left=5-s.fed;
  if(s.pend)return["Your present is still waiting! It's right there on the rug."];
  if(s.ck+s.cn>0)return[PK(["Ooh, is that a sweet I smell? Hand it over!","Ho ho ho! You've got treats for me, haven't you?","My tummy just rumbled. Is that a "+(s.ck?"cookie":"candy cane")+" in your pocket?"]),left==1?"Just one more and you'll get a present. Cover your ears!":left+" more treats until the surprise."];
  return[PK(["Back again! Any sweets for old Santa?","Ho ho ho! Find me some cookies or candy canes, would you?","I'm so hungry I could eat a whole gingerbread house."]),left+" more treats until my surprise. Look for the glowing ones around town."]}
 function menu(){const s=LS();return[{t:'Feed a cookie ('+s.ck+')',dis:s.ck<1,fn:()=>feed('ck')},{t:'Feed a candy cane ('+s.cn+')',dis:s.cn<1,fn:()=>feed('cn')},{t:'Where are the sweets?',fn:()=>dlgShow(hintLines(),menu)},{t:'Bye',fn:()=>closeDlg()}]}
 function talk(){if(busy||DLG||mode!='play')return;const s=LS();const first=!s.met;s.met=1;if(first)save();dlgShow(first?INTRO:greet(s),menu)}

 /* ---------- feeding: the treat flies to his mouth, he chews, swallows and grows; the 5th makes him burp up a present ---------- */
 const mouthPos=()=>{SN.root.updateMatrixWorld(true);return SN.head.localToWorld(V3(0,.1,.78))};
 const buzz=(p,n)=>burstAt(p,['#ffe36a','#fff6c8','#ffffff','#ffb02e'],n,3.2,.16,.8,-1);
 async function growTo(k){
  const g0=SA.grow;sLevel(k);tween(.7,(p,r)=>{SA.hop=Math.sin(r*Math.PI)*.55},ease.lin);tween(.9,(p,r)=>{SA.sq=Math.sin(r*Math.PI*2)*-.7*(1-r)},ease.lin);tween(.6,(p,r)=>{SA.pulse=Math.sin(r*Math.PI)},ease.lin);
  const c=SN.root.position.clone();c.y=1.9;buzz(c,18);popText(k+' / 5',SPOT.x,5.2,SPOT.z,'#8bffb2',2.6);
  await tween(1.2,p=>{SA.grow=lerp(g0,k,p)},ease.elastic)}
 async function laugh(){sHo();popText('HO HO HO!',SPOT.x,5.7,SPOT.z,'#ffe36a',3.6);
  await tween(1.25,(p,r)=>{const f=1-r;SA.tilt=-.32*Math.min(1,r*6)*f-.04;SA.bx=Math.sin(r*44)*.05*f;SA.hat=Math.sin(r*30)*.06*f;SA.armLx=.35*f;SA.armRx=.35*f;SA.armL=.2*f;SA.armR=.2*f;SA.brow=f;SA.cheek=.7*f;SA.hop=Math.max(0,Math.sin(r*40))*.08*f},ease.lin);
  await settle(.4)}
 async function feed(kind){
  const s=LS();if(busy||(kind=='ck'?s.ck:s.cn)<1||!IN||IN.i!=IDX)return;busy=1;closeDlg(true);mode='menu';
  try{
   if(kind=='ck')s.ck--;else s.cn--;save();hudNow();
   const k=s.fed+1,last=k>=5;
   const food=foodModel(kind,kind=='ck'?1.5:1.4);scene.add(food);const from=V3(P.x,1.5,P.z);
   /* he looks up and opens wide */
   tween(.5,p=>{SA.jaw=p*1.05;SA.brow=p;SA.tilt=-.16*p;SA.armLx=.3*p;SA.armRx=.3*p;SA.eye=1+.2*p},ease.out);
   sfx('whoosh');
   await tween(.66,(p,r)=>{const m=mouthPos();food.position.set(lerp(from.x,m.x,p),lerp(from.y,m.y,p)+Math.sin(r*Math.PI)*1.5,lerp(from.z,m.z,p));food.rotation.y=r*10;food.rotation.z=r*4;food.scale.setScalar(1-.5*p)},ease.io);
   /* chomp! */
   scene.remove(food);const m0=mouthPos();sfx('eat');tone(240,90,.1,'square',.12);
   if(kind=='ck')burstAt(m0,['#c98a4b','#e0a766','#4b2a17','#c98a4b'],14,3.2,.13,.9,10);else burstAt(m0,['#d62828','#ffffff','#d62828','#f8f8f8'],14,3.2,.13,.9,10);
   await tween(.09,p=>{SA.jaw=lerp(1.05,.12,p);SA.sq=.25*p;SA.tilt=lerp(-.16,.06,p)},ease.out);
   for(let i=0;i<3;i++){await tween(.17,p=>{SA.jaw=lerp(.12,.55,p);SA.cheek=.5+.3*p;SA.hat=.04*p;SA.sq=lerp(.25,.05,p);SA.tilt=.06-.04*p},ease.io);sfx('eat');await tween(.15,p=>{SA.jaw=lerp(.55,.1,p);SA.hat=.04*(1-p)},ease.io)}
   /* swallow */
   sGulp();await tween(.28,(p,r)=>{SA.tilt=-.22*Math.sin(r*Math.PI);SA.cheek=.8*(1-p);SA.jaw=.1*(1-p);SA.sq=.05*(1-p);SA.pulse=Math.sin(r*Math.PI)*.6},ease.lin);
   await wait(.12);
   if(!last){s.fed=k;s.tot++;save();hudNow();await growTo(k);await laugh()}
   else{s.tot++;s.fed=0;s.pend=1;s.pr=null;save();hudNow();await burpSeq()}
  }catch(e){console.warn('lodge feed',e)}
  busy=0;if(mode=='menu')mode='play';hudNow()}
 async function burpSeq(){
  await growTo(5);await wait(.15);
  popText('Uh oh...',SPOT.x,5.8,SPOT.z,'#ffb0a0',3);
  await tween(.6,p=>{SA.brow=p;SA.bulge=.7*p;SA.armR=.9*p;SA.armRx=-.28*p;SA.armL=.9*p;SA.armLx=-.28*p},ease.out);
  /* the belly rumbles and shakes harder and harder, the buttons fly off */
  sRumble(2.1);let popped=0;
  await tween(2.1,(p,r)=>{SA.rumble=1;SA.shake=r*1.3;SA.bx=Math.sin(r*r*90)*.05*r+r*.17;SA.cheek=r;SA.bulge=.7+r*.7;SA.hat=Math.sin(r*46)*.05*r;SA.tilt=-r*.28;SA.pulse=r*.5;SA.sq=Math.sin(r*60)*.06*r;
   if(!popped&&r>.62){popped=1;sfx('thunk');tone(900,300,.12,'square',.2);SN.btn.forEach((b,i)=>{b.visible=false;const w=b.getWorldPosition(V3(0,0,0));puff(w,V3(R(-2,3),R(4,7),R(2,5)),'#17171a',.28,1.4,12)})}},ease.lin);
  /* deep breath */
  await tween(.4,p=>{SA.tilt=lerp(-.28,-.6,p);SA.jaw=.5*p;SA.shake=1.3*(1-p);SA.bulge=1.4;SA.armR=.9;SA.armL=.9},ease.out);
  /* BURP: the present flies out of his mouth */
  sBurp();flashScr('#fff7d0',.55);bigText('BURRRP!','#b8ff5a');
  const mp=mouthPos();for(let i=0;i<12;i++)puff(mp.clone(),V3(R(-1,1)*2.2,R(-.5,1.6),R(.8,3.6)),i%2?'#d9f2a8':'#f2fbdc',R(.5,1.0),R(.8,1.3),-1.5);
  burstAt(mp,['#ffe36a','#fff','#ff9a3a'],24,5,.2,1,3);
  SA.jaw=1.3;SA.tilt=-.5;SA.bulge=.5;SA.shake=0;SA.rumble=0;SA.armR=0;SA.armL=0;SA.armLx=0;SA.armRx=0;
  const fl=launchPresent();
  tween(.3,(p,r)=>{SA.sq=lerp(-.9,.55,p);SA.tilt=lerp(-.5,.18,p)},ease.out);
  tween(.7,p=>{SA.grow=lerp(5,3.3,p);SA.bx=lerp(.12,-.05,p)},ease.out);
  await wait(.35);tween(.6,p=>{SA.jaw=lerp(1.3,.5,p);SA.sq=lerp(.55,0,p);SA.armR=1.55*p;SA.armRx=-.55*p;SA.eye=1+.3*(1-p)},ease.out);
  await fl;
  /* relief: he deflates, sheepish */
  popText('Excuse me!',SPOT.x,5.6,SPOT.z,'#ffd0f0',3);sPffft();
  tween(1.9,p=>{SA.grow=lerp(3.3,0,p);SA.bx=lerp(-.05,0,p);SA.bulge=lerp(.5,0,p);SA.cheek=lerp(1,0,p)},ease.io);
  await wait(.9);await settle(.8);
  popText('Open it!',PRES?PRES.g.position.x:SPOT.x,3,PRES?PRES.g.position.z:SPOT.z,'#8bffb2',2.8)}

 /* ---------- the present: flies out in a high arc, bounces, then waits on the rug with a glow ---------- */
 const LAND={x:OX+11.8,z:320+7.6};let PRES=null,PINT=null;
 const crate=s=>safe(()=>FW_ADVENT.itemModel('x:crate',s),'crate')||foodModel('ck',1);
 function launchPresent(){return new Promise(res=>{
  const m=crate(1.3);m.scale.setScalar(.01);scene.add(m);const st=mouthPos(),T=1.75;let lastT=0;
  tween(T,(p,r)=>{const x=lerp(st.x,LAND.x,r),z=lerp(st.z,LAND.z,r),y=lerp(st.y,.05,r)+Math.sin(r*Math.PI)*4.3;m.position.set(x,y,z);m.rotation.set(Math.sin(r*9)*.6,r*17,Math.cos(r*7)*.5);m.scale.setScalar(Math.max(.01,ease.back(Math.min(1,r/.18))));
    if(r-lastT>.018){lastT=r;puff(m.position.clone().add(V3(R(-.3,.3),R(0,.4),R(-.3,.3))),V3(R(-.5,.5),R(.2,1),R(-.5,.5)),PK(['*ffe36a','#ffffff','*ff9a3a','#ff6b6b']),R(.14,.26),R(.5,.8),0)}},ease.lin).then(async()=>{
   /* it lands, squashes and bounces twice */
   sfx('thunk');burstAt(V3(LAND.x,.2,LAND.z),['#d62828','#ffe36a','#46e083','#4aa3ff','#ffffff','#ff7ad9'],34,6,.22,1.4,12);
   for(const h of [.9,.35,.12]){await tween(.2,(p,r)=>{m.position.y=.05+h*Math.sin(r*Math.PI);m.scale.set(1+(.25*(1-Math.abs(r*2-1))*0),1,1)},ease.lin);
    sfx('thunk')}
   m.rotation.set(0,.4,0);m.position.set(LAND.x,.05,LAND.z);scene.remove(m);
   showPresent(1);sSparkle();res()})})}
 function showPresent(anim){hidePresent();const g=new THREE.Group(),m=crate(1.3);g.add(m);
  const beam=new THREE.Mesh(bgeo(1.4,7,1.4),new THREE.MeshBasicMaterial({color:'#ffe38a',transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false}));beam.position.y=3.6;g.add(beam);
  const ring=new THREE.Mesh(bgeo(2.2,.05,2.2),new THREE.MeshBasicMaterial({color:'#ffe38a',transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));ring.position.y=.05;g.add(ring);
  g.position.set(LAND.x,0,LAND.z);RG.add(g);PRES={g,m,beam,ring};
  PINT={x:LAND.x,z:LAND.z,r:1.9,l:"Open Santa's present",a:()=>openPresent()};INT.push(PINT)}
 function hidePresent(){if(PRES){RG.remove(PRES.g);PRES=null}if(PINT){const i=INT.indexOf(PINT);if(i>=0)INT.splice(i,1);PINT=null}}
 function openPresent(){if(busy||DLG||mode!='play')return;const s=LS();
  const ok=safe(()=>FW_ADVENT.gift({title:"SANTA'S PRESENT",prize:s.pr,
   onRoll:pr=>{s.pr=pr;save()},
   onClaim:()=>{s.pend=0;s.pr=null;s.gifts++;save();hidePresent()},
   onClose:()=>{mode='play';hudNow()}}),'gift');
  if(!ok){sfx('err');say('The present will not open right now. Try again.')}}

 /* ---------- cookies and candy canes hiding around the map ---------- */
 const COLS=[],POOL=[];let CG=null,SPAWN=3,LASTPICK=0;
 const ZONES=[[-76,-30,-54,4,'Santa\'s Lodge'],[-128,-36,-92,6,'the West suburb'],[-12,-32,62,-8,'the back gardens'],[8,-135,190,-50,'Central Park'],[196,-105,300,-58,'the Festival ground'],[-40,26,100,34,'Maple Lane']];
 function okSpot(x,z){if(x<WB[0]+3||x>WB[1]-3||z<WB[2]+3||z>WB[3]-3)return false;if(hit(x,z,.9))return false;
  if(typeof ROADS!='undefined'&&ROADS.some(r=>x>r[0]-1.8&&x<r[2]+1.8&&z>r[1]-1.8&&z<r[3]+1.8))return false;
  if(typeof LK!='undefined'&&x>LK[0]-5&&x<LK[2]+5&&z>LK[1]-5&&z<LK[3]+5)return false;
  if(Math.hypot(x-(LX),z-(ZF-7))<13&&z<ZF+3)return false;return true}
 function genPool(){
  POIS.forEach(p=>{if(p[2]=="Santa's Lodge"||Math.abs(p[0])>800||/Airport|Skyline|Awards|HQ|Residences|Mall/.test(p[2]))return;for(let i=0;i<10;i++){const a=R(0,6.283),r=R(3,9),x=p[0]+Math.cos(a)*r,z=p[1]+Math.sin(a)*r;if(okSpot(x,z))POOL.push({x,z,n:p[2]})}});
  ZONES.forEach(zn=>{for(let i=0;i<24;i++){const x=R(zn[0],zn[2]),z=R(zn[1],zn[3]);if(okSpot(x,z))POOL.push({x,z,n:zn[4]})}});
  /* two starters close to the lodge so the first treat is easy to find */
  [[LX-8,ZF+9,'Santa\'s Lodge'],[LX+9,ZF+10,'Santa\'s Lodge']].forEach(q=>{if(okSpot(q[0],q[1]))POOL.unshift({x:q[0],z:q[1],n:q[2],first:1})})}
 function spawnOne(first){
  if(!POOL.length||!CG)return;const used=new Set(COLS.filter(q=>q.on).map(q=>q.sp));
  let tries=0,sp=null;while(tries++<40){const c=first?POOL.find(q=>q.first&&!used.has(q)):PK(POOL);if(!c)break;if(used.has(c))continue;if(Math.hypot(c.x-P.x,c.z-P.z)<14&&!first)continue;
   if(COLS.some(q=>q.on&&Math.hypot(q.x-c.x,q.z-c.z)<22))continue;sp=c;break}
  if(!sp)return;const kind=Math.random()<.5?'ck':'cn',g=new THREE.Group();
  g.add(foodModel(kind,kind=='ck'?2:1.9));
  const beam=new THREE.Mesh(bgeo(.7,9,.7),new THREE.MeshBasicMaterial({color:kind=='ck'?'#ffd27a':'#ff7a7a',transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false}));beam.position.y=4.8;g.add(beam);
  const ring=new THREE.Mesh(bgeo(1.5,.05,1.5),new THREE.MeshBasicMaterial({color:'#fff2b0',transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));ring.position.y=.04;g.add(ring);
  const sp2=[0,1,2].map(i=>{const m=mk(g,.12,.12,.12,'*fff6c8',0,0,0);return m});
  g.position.set(sp.x,0,sp.z);CG.add(g);COLS.push({g,x:sp.x,z:sp.z,kind,on:1,sp,n:sp.n,ph:R(0,6),sp2,m:g.children[0]})}
 function collect(c){c.on=0;LASTPICK=performance.now();const s=LS();if(c.kind=='ck')s.ck++;else s.cn++;if(!s.met)s.met=0;save();
  sfx('chime');tone(880,1320,.18,'triangle',.12,0);hudNow(c.kind);
  const from=c.g.position.clone();popText(c.kind=='ck'?'+1 COOKIE':'+1 CANDY CANE',P.x,2.6,P.z,c.kind=='ck'?'#ffd27a':'#ff8a8a',2.8);
  burstAt(V3(from.x,1,from.z),['#ffe36a','#fff6c8','#ffffff',c.kind=='ck'?'#c98a4b':'#d62828'],16,3.4,.16,.8,-2);
  tween(.45,(p,r)=>{c.g.position.set(lerp(from.x,P.x,p),1+p*1.2,lerp(from.z,P.z,p));c.g.rotation.y=r*12;c.g.scale.setScalar(1-p*.9)},ease.in).then(()=>{CG.remove(c.g);const i=COLS.indexOf(c);if(i>=0)COLS.splice(i,1)});
  if(!s.met||true){/* first time: nudge towards Santa */if(!s.met&&!collect.hinted){collect.hinted=1;say("A sweet! There's a Santa's Lodge on the map: go and see who wants it.")}}}

 /* ---------- every frame ---------- */
 let HT=0,SM=0;
 function tick(dt){
  dt*=window.FW_LODGE_SLOW||1;
  stepTweens(dt);stepPar(dt);
  const inside=IN&&IN.i==IDX,near=!IN&&Math.hypot(P.x-LX,P.z-(ZF-6))<90;
  /* twinkling bulbs */
  if(inside||near)TW.forEach(q=>{const k=.5+.5*Math.sin(tt*3.2+q[1]);q[0].color.setScalar(.32+.68*k)});
  if(near){SM+=dt;SMOKE.forEach(q=>{q.t=(q.t+dt)%4;const r=q.t/4,m=q.m;m.visible=true;m.position.set(CH.x+Math.sin(q.t*1.7+r*3)*.5*r*3+r*1.8,CH.y+r*7,CH.z+Math.cos(q.t*1.3)*.4);m.scale.setScalar(.6+r*2.2);m.material.opacity=.55*(1-r)*Math.min(1,q.t*3);m.rotation.y=q.t})}
  /* collectibles */
  if(CG){CG.visible=!IN;
   if(!IN&&Sv()){
    COLS.forEach(c=>{if(!c.on)return;c.m.position.y=.9+Math.sin(tt*2+c.ph)*.12;c.m.rotation.y=tt*1.6+c.ph;c.sp2.forEach((q,i)=>{const a=tt*2.5+i*2.1+c.ph;q.position.set(Math.cos(a)*.8,.9+Math.sin(a*1.7)*.5,Math.sin(a)*.8)});
     if(mode=='play'&&Math.hypot(c.x-P.x,c.z-P.z)<1.5)collect(c)});
    SPAWN-=dt;const act=COLS.filter(q=>q.on).length;
    if(SPAWN<=0&&act<10&&POOL.length){SPAWN=act<4?.5:3;spawnOne(!COLS.some(q=>q.sp&&q.sp.first)&&LS().tot==0&&LS().ck+LS().cn==0&&act<2)}}}
  /* inside: Santa, the fire, the present, the prompts */
  if(inside){poseSanta(dt,tt);
   FIRE.forEach((f,i)=>{const k=.8+.35*Math.sin(tt*9+i*2)+.15*Math.sin(tt*17+i);f.scale.set(1,k,1);f.position.y=.5+k*.2});if(FLK)FLK.intensity=1.3+.5*Math.sin(tt*11)+.3*Math.sin(tt*23);
   if(PRES){PRES.m.position.y=.25+Math.sin(tt*2.2)*.12;PRES.m.rotation.y=tt*.9;PRES.beam.material.opacity=.14+.05*Math.sin(tt*3);PRES.ring.scale.setScalar(1+.12*Math.sin(tt*3))}
   if(SINT){const s=LS();SINT.l=s.ck+s.cn>0?'Feed Santa':'Talk to Santa'}
   P.rot=P.rot}
  HT-=dt;if(HT<0){HT=.25;hudNow()}
 }
 {const u0=update;update=function(dt){u0(dt);try{tick(dt)}catch(e){if(!tick.w){tick.w=1;console.warn('lodge tick',e)}}}}

 /* ---------- camera, map ---------- */
 {const v0=window.VIEWX;window.VIEWX=function(){if(IN&&IN.i==IDX&&(mode=='play'||mode=='menu'))return 14;return typeof v0=='function'?v0():0}}
 if(typeof mapPaint=='function'){const m0=mapPaint;mapPaint=function(x,sx,sz,kx,kz,mini){m0.apply(this,arguments);safe(()=>{
   const W2=x.canvas.width,H2=x.canvas.height,X0=sx(LX-12),X1=sx(LX+12),Z0=sz(ZF-18),Z1=sz(ZF+16);
   if(X1>-20&&X0<W2+20&&Z1>-20&&Z0<H2+20){const k=(kx+kz)/2,R2=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(sx(a),sz(b),Math.max(1,(c-a)*kx),Math.max(1,(d-b)*kz))};
    R2(LX-12,ZF-17,LX+12,ZF+14,'#dfe9f2');R2(LX-10.5,ZF-14,LX+10.5,ZF,'#8f5d36');R2(LX-10.5,ZF-14,LX+10.5,ZF-6,'#a32d2d');R2(LX-10,ZF-13,LX+10,ZF-10,'#f4f8fc');R2(LX+10.5,ZF-9,LX+12.4,ZF-6,'#8a8f96');R2(LX-1.4,ZF,LX+1.4,ZF+3.5,'#b0824f');R2(LX-1.2,ZF+3.5,LX+1.2,ZF+13,'#cfd9e2');
    R2(LX-3.6,ZF+13,LX-2.8,ZF+14,'#d62828');R2(LX+2.8,ZF+13,LX+3.6,ZF+14,'#d62828')}
   /* sweets Santa can smell, once you have met him */
   const s=LS();if(s.met&&!mini)COLS.forEach(c=>{if(!c.on)return;const px=sx(c.x),pz=sz(c.z);if(px<0||px>W2||pz<0||pz>H2)return;const t=.6+.4*Math.sin(tt*4+c.ph);x.fillStyle='#000';x.fillRect(px-4,pz-4,8,8);x.fillStyle=c.kind=='ck'?'#e0a766':'#ff4b4b';x.fillRect(px-3,pz-3,6,6);x.fillStyle='rgba(255,246,200,'+t+')';x.fillRect(px-1,pz-1,2,2)})},'map')}}

 /* ---------- start ---------- */
 safe(buildOutside,'outside');safe(buildInside,'inside');
 CG=new THREE.Group();WORLD.add(CG);safe(genPool,'pool');
 window.FW_LODGE={LS,enter:enterLodge,leave:leaveLodge,feed,talk,state:()=>({busy,POOL:POOL.length,cols:COLS.filter(q=>q.on).length,IDX}),COLS,SA,SPOT,OX,LX,ZF,popText,collect,giveSweet:(k,n)=>{const s=LS();s[k]+=n||1;hudNow(k)}};
})();
