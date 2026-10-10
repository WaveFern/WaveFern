/* ---------- detailed studio gear: real-looking instruments, mics, speakers, desks and room treatment ----------
   Every gear line has a builder GB[k](group, level) that models it from boxes, cylinders, rings and spheres
   (guitars get strings, frets, inlays and pickups, keyboards get keys, mics get grilles, speakers get cones...).
   The same builders feed the shop hover previews. The studio is rebuilt from them and then merged into one mesh
   per material, so all this detail costs only a few dozen draw calls. Furniture gets a little extra detail too. */
const PI2=Math.PI/2;
/* front-facing cylinder (axis along z) and sideways cylinder (axis along x) */
const xcz=(g,r,h,c,x,y,z,s)=>xc(g,r,r,h,c,x,y,z,PI2,0,0,s),xcx=(g,r,h,c,x,y,z,s)=>xc(g,r,r,h,c,x,y,z,0,0,PI2,s);
const knob=(g,x,y,z,r,c)=>{xc(g,r||.02,r||.02,.02,c||'#1a1a1a',x,y,z,0,0,0,8);xb(g,.004,.022,(r||.02)*.9,'#f4f4f4',x,y+.002,z+(r||.02)*.4)};
const fknob=(g,x,y,z,r,c)=>{xcz(g,r||.02,.025,c||'#1a1a1a',x,y,z,8);xb(g,.004,(r||.02)*.9,.028,'#f4f4f4',x,y+(r||.02)*.4,z)};
const LED=(g,x,y,z,c)=>xb(g,.018,.018,.012,'*'+(c||'2fe68a'),x,y,z);
/* a row of piano keys: width w, centred at x0, top of keys at y, keys front edge at z+d/2 */
function xKeys(g,w,nW,x0,y,z,d){const kw=w/nW;for(let i=0;i<nW;i++)xb(g,kw*.9,.03,d,'#f4f1e8',x0-w/2+kw*(i+.5),y-.015,z);
 for(let i=0;i<nW-1;i++)if([0,1,3,4,5].includes(i%7))xb(g,kw*.55,.03,d*.6,'#141414',x0-w/2+kw*(i+1),y+.012,z-d*.2)}
/* speaker cabinet facing +z with woofer cone, dust cap, tweeter and port */
function xSpk(g,w,h,d,c,x,y,z,o){o=o||{};const f=z+d/2,cone=o.cone||'#2a2a2e',wr=Math.min(w,h*.55)*.4;xb(g,w,h,d,c,x,y,z);xb(g,w*.94,h*.95,.01,o.face||dk(c,.8),x,y,f+.003);
 const wy=y-h*.12;xcz(g,wr*1.08,.02,'~#9aa0a6',x,wy,f+.008,16);xcz(g,wr,.024,cone,x,wy,f+.01,16);xcz(g,wr*.55,.028,dk(cone,.8),x,wy,f+.012,14);xs(g,wr*.28,cone,x,wy,f+.02,8);
 const ty=y+h*.3;xcz(g,wr*.42,.02,'~#9aa0a6',x,ty,f+.008,12);xs(g,wr*.22,'#111',x,ty,f+.012,8);if(o.port)xb(g,w*.5,.03,.012,'#050505',x,y-h*.42,f+.006);if(o.logo)xb(g,w*.22,.02,.01,o.logo,x,y+h*.44,f+.008);if(o.led)LED(g,x+w*.36,y-h*.42,f+.008,o.led)}
/* guitar or bass, standing upright (front +z). o: {c, kind:'ac'|'semi'|'el', bass, n strings, burst} */
function xGtr(g,o){const c=o.c,gc=c[0]=='#'?'!'+c:c,bass=!!o.bass,t=o.kind=='ac'?.14:o.kind=='semi'?.11:.07,R1=bass?.21:o.kind=='el'?.18:.2,R2=bass?.15:o.kind=='el'?.13:.155,yb=.36,yu=yb+R1*.95,f=t/2,body=xgrp(g,0,0,0);
 xcz(body,R1,t,gc,0,yb,0,18);xcz(body,R2,t,gc,o.kind=='el'?-.03:0,yu,0,16);xb(body,R2*1.6,R1*.7,t,gc,0,(yb+yu)/2,0);
 if(o.burst){xt(body,R1-.025,.022,'!'+dk(c.replace(/^[!~]/,''),.45),0,yb,f-.004,0,0,0);xt(body,R2-.02,.02,'!'+dk(c.replace(/^[!~]/,''),.45),o.kind=='el'?-.03:0,yu,f-.004)}
 if(o.kind!='ac'){xt(body,R1,.008,'#efe6d0',0,yb,f);xt(body,R2,.008,'#efe6d0',o.kind=='el'?-.03:0,yu,f)}
 if(o.kind=='el'&&!bass)xb(body,.06,.14,t,gc,.1,yu+.08,0,0,0,-.3);
 const L=bass?.82:.6,ny=yu+R2*.6,top=ny+L,n=o.n||(bass?4:6),sp=bass?.017:.012,nk=xgrp(g,0,0,f-.035);g=nk;
 xb(g,bass?.075:.065,L,.045,'#5a3a22',0,ny+L/2,0);xb(g,bass?.072:.062,L,.012,'#2a1a10',0,ny+L/2,.028);
 for(let i=1;i<=12;i++){const fy=top-L*(1-Math.pow(2,-i/12))*1.6;if(fy<ny)break;xb(g,bass?.072:.062,.006,.014,'~#d8dce0',0,fy,.03);if([3,5,7,9].includes(i))xs(g,.008,'#efe6d0',0,fy+.025,.035,4);if(i==12){xs(g,.008,'#efe6d0',-.018,fy+.025,.035,4);xs(g,.008,'#efe6d0',.018,fy+.025,.035,4)}}
 xb(g,bass?.08:.07,.012,.016,'#efe6d0',0,top,.03);const hy=top+.1;xb(g,bass?.1:.09,.2,.03,'!#1a1208',0,hy,0);xb(g,.05,.025,.01,'~#d0d0d0',0,hy+.07,.017);
 for(let i=0;i<n;i++){const s=bass&&n==4?(i<2?-1:1):(i<n/2?-1:1),k=bass&&n==4?i%2:i%Math.ceil(n/2);xcx(g,.014,.05,'~#d0d4d8',s*.07,hy-.06+k*.055,0,6);xcz(g,.009,.012,'~#d0d4d8',s*.03,hy-.06+k*.055,.017,6)}
 g=nk.parent;const by=yb-R1*.45;for(let i=0;i<n;i++){const sx=(i-(n-1)/2)*sp;xb(g,.004,top-by,.004,'~#d8dce0',sx,(top+by)/2,f+.012)}
 if(o.kind=='ac'){xcz(body,.065,t+.004,'#140d06',0,yu-.02,0,16);xt(body,.075,.008,'#efe6d0',0,yu-.02,f+.002);xb(body,.2,.035,.012,'#2a1a10',0,by,f+.004);xb(body,.09,.07,.006,'#1a1208',.09,yu-.1,f+.003,0,0,.4)}
 else{if(o.kind=='semi')[-1,1].forEach(s=>{xb(body,.018,.12,.006,'#140d06',s*.11,yb+.03,f+.002,0,0,s*.2);xs(body,.009,'#140d06',s*.11+s*.012,yb+.09,f+.002,4)});
  const pk=bass?[[yb+.12,'#1a1a1a'],[yb+.02,'#1a1a1a']]:[[yb+.13,o.kind=='semi'?'~#d0d4d8':'#efe6d0'],[yb+.04,o.kind=='semi'?'~#d0d4d8':'#efe6d0']];
  pk.forEach(([py,pc])=>{xb(body,bass?.1:.085,.035,.012,pc,0,py,f+.006);for(let i=0;i<n;i++)xs(body,.005,'~#a0a4a8',(i-(n-1)/2)*sp,py,f+.012,4)});
  xb(body,.11,.03,.014,'~#c8ccd0',0,by,f+.006);[[.12,yb-.08],[.15,yb-.02],[.09,yb-.13]].forEach(([kx,ky])=>fknob(body,kx,ky,f+.01,.018,'~#c9a227'));if(o.kind=='el')xb(body,.12,.14,.006,'#efe6d0',-.09,yb+.02,f+.003,0,0,.3)}}
/* a simple guitar stand: tripod feet, back post and yoke */
function xStand(g,h){[-1,1].forEach(s=>xb(g,.04,.03,.34,'#1a1a1a',s*.12,.03,.05,0,s*.5,0));xb(g,.035,h,.035,'#1a1a1a',0,h/2,-.12);xb(g,.2,.03,.08,'#1a1a1a',0,.17,.03);xb(g,.1,.03,.06,'#2a2a2a',0,h,-.09)}
/* foam panel with a wedge-checker surface */
function xFoam(g,w,h,c,x,y,z,cols,rows){xb(g,w,h,.03,dk(c,.6),x,y,z+.015);const cw=w/cols,ch=h/rows;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const deep=(i+j)%2,px=x-w/2+cw*(i+.5),py=y-h/2+ch*(j+.5);
 xb(g,deep?cw*.92:cw*.5,deep?ch*.5:ch*.92,deep?.07:.05,deep?c:dk(c,.82),px,py,z+.03+(deep?.035:.025))}}

const GB={};
GB.chair=(g,l)=>{const cc=['#8b6b47','#333a44','#2f6fb5','#a8242c'][l],t=dk(cc,.75);
 if(!l){xc(g,.2,.2,.06,cc,0,.47,0,0,0,0,14);xt(g,.15,.012,'#5a4632',0,.2,0,PI2,0,0);[0,2.1,4.2].forEach(a=>xb(g,.035,.48,.035,'#5a4632',Math.sin(a)*.13,.22,Math.cos(a)*.13,Math.cos(a)*.18,0,-Math.sin(a)*.18));xb(g,.12,.01,.06,'#3a2a1a',.05,.505,.02,0,.6,0);return}
 for(let i=0;i<5;i++){const a=i*Math.PI*.4;xb(g,.04,.035,.3,'#1a1a1a',Math.sin(a)*.15,.06,Math.cos(a)*.15,0,a,0);xs(g,.03,'#111',Math.sin(a)*.29,.03,Math.cos(a)*.29,6)}
 xc(g,.03,.03,.3,'~#b8bcc2',0,.22,0,0,0,0,8);xc(g,.045,.045,.08,'#1a1a1a',0,.12,0,0,0,0,8);const sy=.42+.03*l,sw=.5+.05*l;xb(g,sw*.9,.04,sw*.9,'#1a1a1a',0,sy-.03,0);xb(g,sw,.08,sw,cc,0,sy+.02,0);xb(g,sw*.9,.02,sw*.85,dk(cc,1.0),0,sy+.065,.01);
 const bh=.35+.18*l,by=sy+.08+bh/2;xb(g,.05,.12,.04,'#1a1a1a',0,sy+.08,-sw/2+.02);xb(g,sw*.92,bh,.07,cc,0,by,-sw/2);
 if(l==2){for(let i=0;i<5;i++)xb(g,sw*.8,.01,.075,t,0,by-bh/2+.1+i*bh*.17,-sw/2);xb(g,sw*.6,.08,.04,t,0,sy+.18,-sw/2+.05);xb(g,sw*.6,.12,.08,cc,0,by+bh/2+.05,-sw/2-.01)}
 if(l>=2)[-1,1].forEach(s=>{xb(g,.04,.18,.04,'#1a1a1a',s*sw*.48,sy+.13,0);xb(g,.08,.035,.26,'#222',s*sw*.48,sy+.23,-.02)});
 if(l==3){xb(g,sw,.06,.09,'~#c9a227',0,by+bh/2+.03,-sw/2);[-1,1].forEach(s=>{xb(g,.05,bh+.04,.09,'~#c9a227',s*sw*.48,by,-sw/2);xs(g,.04,'~#c9a227',s*sw*.48,by+bh/2+.05,-sw/2,8)});
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)xs(g,.018,'~#c9a227',(i-1)*sw*.25,by-bh*.25+j*bh*.25,-sw/2+.04,6);xb(g,sw*.5,.1,.08,'#1a1a1a',0,by+bh/2-.06,-sw/2+.06)}};
GB.mic=(g,l)=>{xc(g,.18,.2,.03,'#1a1a1a',0,.015,0,0,0,0,16);xc(g,.016,.016,1.15,'~#9aa0a6',0,.6,0,0,0,0,8);xc(g,.025,.025,.06,'#1a1a1a',0,.62,0,0,0,0,8);
 if(l==0){xc(g,.022,.016,.22,'#1a1a1a',0,1.25,.04,-.4,0,0,8);xs(g,.045,'~#b8bcc2',0,1.37,.09,10);xt(g,.044,.006,'~#d8dce0',0,1.37,.09,PI2);return}
 xb(g,.03,.03,.32,'#1a1a1a',0,1.2,.13);xt(g,.09,.008,'#1a1a1a',0,1.3,.28,0,0,0);[-1,1].forEach(s=>xb(g,.008,.008,.1,'#2a2a2a',s*.06,1.3,.25));
 const mc=['#555','#2a2a2e','~#aab3bd','~#c9a227'][l],r=l==3?.07:.05,hh=l==3?.3:.24,y0=1.3,z0=.28;xc(g,r,r*.85,hh,mc,0,y0,z0,0,0,0,14);
 const gy=y0+hh/2+r*.6;xc(g,r*.98,r*.98,r*1.2,'#3a3d42',0,gy,z0,0,0,0,14);xs(g,r*.98,'#3a3d42',0,gy+r*.6,z0,12);for(let i=0;i<3;i++)xt(g,r,.006,mc,0,gy-r*.5+i*r*.5,z0,PI2,0,0);xt(g,r*.7,.006,mc,0,gy+r*.6,z0,0,0,0);
 xb(g,.03,.02,.01,l==3?'#1a1a1a':'~#c9a227',0,y0+.04,z0+r*.95);if(l==1)LED(g,0,y0-.05,z0+r*.9,'4aa3df');
 if(l>=2){xt(g,.12,.01,'#1a1a1a',0,y0+.05,z0,PI2,0,0);[-1,1].forEach(s=>xb(g,.006,.12,.006,'#888',s*.08,y0+.05,z0));xt(g,.12,.012,'#1a1a1a',0,gy,z0+.2);xcz(g,.115,.004,'^#222831',0,gy,z0+.2,16);xb(g,.012,.012,.2,'#1a1a1a',.1,gy-.05,z0+.1,.3,0,0)}
 if(l==3){xb(g,.22,.14,.18,'#2a2a2e',.3,.07,.2);xb(g,.2,.03,.01,'~#c9a227',.3,.12,.291);xs(g,.025,'*ffb050',.25,.07,.292,6);xb(g,.01,.6,.01,'#111',.15,.3,.2)}};
GB.guitar=(g,l)=>{xStand(g,1.02);const o=xgrp(g,0,.06,0);o.rotation.x=-.12;xGtr(o,[{c:'#8a6a3a',kind:'ac'},{c:'#c68a3c',kind:'ac',burst:1},{c:'#b5482a',kind:'semi',burst:1},{c:'#2a2a8a',kind:'el'}][l])};
GB.bass=(g,l)=>{if(!l)return;xStand(g,1.22);const o=xgrp(g,0,.06,0);o.rotation.x=-.12;xGtr(o,[{},{c:'#2a2a2a',kind:'el',bass:1},{c:'#e8d9a0',kind:'el',bass:1,burst:1},{c:'#1f3a6e',kind:'el',bass:1,n:5}][l])};
GB.amp=(g,l)=>{const w=.7,h=.8,d=.4,top=['#1a1a1a','#1a1a1a','#3a2a1a','#1a1a1a'][l];xb(g,w,h,d,top,0,h/2,0);xb(g,w*.9,h*.6,.012,'#4a4038',0,h*.38,d/2+.004);for(let i=0;i<10;i++)xb(g,w*.9,.004,.014,'#3a322c',0,h*.1+i*h*.055,d/2+.006);
 xb(g,w*.94,h*.2,.014,'~#c9a227',0,h*.82,d/2+.004);for(let i=0;i<6;i++)fknob(g,-w*.36+i*w*.13,h*.82,d/2+.016,.022,'#efe6d0');LED(g,w*.42,h*.82,d/2+.014,'ff4455');xb(g,.14,.04,.012,'#efe6d0',0,h*.68,d/2+.012);
 [-1,1].forEach(s=>[-1,1].forEach(q=>xb(g,.05,.05,.05,'~#b8bcc2',s*(w/2-.02),q>0?h-.02:.02,d/2-.02)));xb(g,.24,.04,.06,'#111',0,h+.02,0)};
GB.speaker=(g)=>{xc(g,.2,.22,.03,'#1a1a1a',0,.015,0,0,0,0,12);xc(g,.03,.03,.56,'#1a1a1a',0,.3,0,0,0,0,8);xb(g,.3,.02,.26,'#1a1a1a',0,.59,0);xSpk(g,.4,.6,.35,'#1d1d22',0,.9,0,{cone:'#e6b422',port:1,led:'2fe68a',logo:'#c9c9c9'})};
GB.promo=(g,l)=>{const C=['#c8506a','#e6b422','#4aa3df','#2fe68a'];for(let i=0;i<Math.max(1,l);i++){const x=i*.8,c=C[i];xb(g,.72,1.0,.03,'#1a1a1a',x,0,0);xb(g,.64,.92,.012,c,x,0,.02);
 if(i==0){xcz(g,.16,.01,'#ffe9a8',x,.12,.03,14);for(let k=0;k<4;k++)xb(g,.5,.03,.01,dk(c,.7),x,-.12-k*.06,.03)}if(i==1){xb(g,.4,.4,.01,'#1a1a1a',x,.1,.03);xcz(g,.15,.012,'#111',x,.1,.035,14);xcz(g,.04,.014,'#e8e8e8',x,.1,.04,8);xb(g,.5,.06,.01,'#1a1a1a',x,-.3,.03)}
 if(i==2){for(let k=0;k<5;k++)xb(g,.08,.1+k*.07,.01,'#1f3a6e',x-.2+k*.1,-.25+(.1+k*.07)/2,.03);xb(g,.5,.05,.01,'#f4f4f4',x,.3,.03)}}
 if(l>=3){const nx=.8,ny=.82;xb(g,2.1,.5,.02,'#121216',nx,ny,0);for(let i=0;i<10;i++)xb(g,.22,.04,.03,'*2fe68a',nx-.95+i*.21,ny+.04+(i%2?.06:-.06),.03,0,0,i%2?-.5:.5);xb(g,1.6,.03,.03,'*ff6ad5',nx,ny-.15,.03)}};
GB.keys=(g,l)=>{if(!l)return;const w=1.1+.15*l,nW=[0,15,22,29][l];[-1,1].forEach(s=>{xb(g,.05,.78,.05,'#2a2a2e',s*(w/2-.12),.39,-.08,0,0,s*.25);xb(g,.05,.78,.05,'#2a2a2e',s*(w/2-.12),.39,.08,0,0,s*.25);xb(g,.05,.05,.45,'#2a2a2e',s*(w/2-.02),.03,0)});xb(g,w*.7,.04,.04,'#2a2a2e',0,.72,0);
 const y=.8;xb(g,w,.08,.5,l==3?'!#1a1a1a':'#222',0,y,0);[-1,1].forEach(s=>xb(g,.04,.1,.5,l==1?'#6b4a2e':'#1a1a1a',s*(w/2+.02),y+.01,0));xKeys(g,w-.1,nW,0,y+.055,.08,.3);
 xb(g,w-.1,.03,.14,'#2a2a2e',0,y+.045,-.17);for(let i=0;i<Math.min(10,4+l*2);i++)knob(g,-w/2+.15+i*.07,y+.065,-.17,.014);xb(g,.2,.05,.01,'*7fe3ff',w/2-.25,y+.07,-.12,-.6,0,0);[0,1].forEach(i=>xb(g,.03,.02,.08,'#555',-w/2+.08+i*.04,y+.06,.07));
 if(l>=2)for(let i=0;i<6;i++)xb(g,.05,.02,.04,['#e74c3c','#f1c40f','#2ecc71','#3498db','#9b59b6','#e67e22'][i],w/2-.5+i*.06,y+.065,-.18);
 if(l==3){[-1,1].forEach(s=>xb(g,.04,.34,.04,'#2a2a2e',s*(w/2-.1),y+.2,-.2));const y2=y+.38;xb(g,w-.1,.07,.4,'!#1a1a1a',0,y2,-.12);xKeys(g,w-.2,22,0,y2+.05,-.05,.24);xb(g,.4,.12,.01,'*7fe3ff',0,y2+.1,-.3,-.4,0,0)}};
GB.drums=(g,l)=>{if(!l)return;const sh=['#555','!#a02020','#2a2a2e','!#2a4a8a'][l],chr='~#c8ccd0',cym='~#c9a227';
 const throne=(x,z)=>{[0,2.1,4.2].forEach(a=>xb(g,.03,.03,.3,'#1a1a1a',x+Math.sin(a)*.1,.05,z+Math.cos(a)*.1,0,a,0));xc(g,.015,.015,.4,chr,x,.25,z,0,0,0,6);xc(g,.16,.16,.08,'#1a1a1a',x,.48,z,0,0,0,14)};
 const stand=(x,z,h)=>{[0,2.1,4.2].forEach(a=>xb(g,.025,.025,.26,'#2a2a2a',x+Math.sin(a)*.09,.08,z+Math.cos(a)*.09,.5*Math.cos(a),a,0));xc(g,.012,.012,h,chr,x,h/2,z,0,0,0,6)};
 const drum=(r,h,x,y,z,tilt,head)=>{const o=xgrp(g,x,y,z);o.rotation.x=tilt||0;xc(o,r,r,h,sh,0,0,0,0,0,0,16);xc(o,r*.97,r*.97,.006,head||'#f4f1e8',0,h/2+.003,0,0,0,0,16);xt(o,r,.01,chr,0,h/2,0,PI2,0,0);xt(o,r,.01,chr,0,-h/2,0,PI2,0,0);for(let i=0;i<6;i++){const a=i*Math.PI/3;xb(o,.02,h*.5,.02,chr,Math.sin(a)*(r+.01),0,Math.cos(a)*(r+.01))}return o};
 const cymbal=(x,z,h,r,tl)=>{stand(x,z,h);const o=xgrp(g,x,h,z);o.rotation.x=tl||.15;xc(o,r,r*.15,.012,cym,0,0,0,0,0,0,16);xc(o,r*.2,r*.2,.02,cym,0,.01,0,0,0,0,8)};
 if(l==1){stand(-.1,0,.6);xc(g,.14,.14,.04,'#2a2a2e',-.1,.62,0,0,0,0,14);xc(g,.12,.12,.01,'#6a6a70',-.1,.645,0,0,0,0,14);[-1,1].forEach(s=>xb(g,.012,.012,.38,'#d9b37a',-.1+s*.03,.66,.02,0,s*.3,0));throne(-.1,-.4);xb(g,.12,.04,.25,'#2a2a2a',.15,.03,-.1);return}
 if(l==2){[-1,1].forEach(s=>xc(g,.018,.018,.8,chr,s*.55,.4,-.05,0,0,0,6));xcx(g,.018,1.1,chr,0,.72,-.05,6);
  const pad=(x,y,z,r)=>{const o=xgrp(g,x,y,z);o.rotation.x=-.3;xc(o,r,r,.05,'#1a1a1a',0,0,0,0,0,0,14);xc(o,r*.9,r*.9,.006,'#3a3d42',0,.028,0,0,0,0,14);xt(o,r,.008,chr,0,.026,0,PI2,0,0)};
  pad(-.3,.62,.12,.12);pad(-.08,.8,.05,.1);pad(.16,.8,.05,.1);pad(.38,.62,.12,.12);[[-.5,1.0],[.5,1.05]].forEach(([x,y])=>{const o=xgrp(g,x,y,0);o.rotation.x=.2;xc(o,.16,.16,.015,'#1a1a1a',0,0,0,0,0,0,16)});
  xb(g,.22,.3,.18,'#1a1a1a',0,.15,.15);xcz(g,.09,.02,'#3a3d42',0,.18,.25,14);xb(g,.2,.12,.08,'#2a2a2e',.62,.8,-.05);xb(g,.12,.05,.01,'*7fe3ff',.62,.82,-.008);throne(0,-.42);return}
 const k=xgrp(g,0,.27,.08);xc(k,.26,.26,.36,sh,0,0,0,PI2,0,0,18);xcz(k,.25,.37,'#efe6d0',0,0,0,18);xcz(k,.12,.375,dk(sh.replace(/^[!~]/,''),.7),0,.02,0,14);[-1,1].forEach(s=>{xt(k,.265,.016,chr,0,0,s*.18)});for(let i=0;i<8;i++){const a=i*Math.PI/4;xb(k,.025,.025,.28,chr,Math.sin(a)*.275,Math.cos(a)*.275,0)}
 [-1,1].forEach(s=>xb(g,.02,.2,.02,chr,s*.24,.08,.2,0,0,s*.4));xb(g,.1,.03,.2,'#2a2a2a',0,.02,-.2);
 drum(.11,.14,-.13,.6,.05,-.4);drum(.12,.15,.13,.6,.05,-.4);xc(g,.012,.012,.2,chr,0,.5,.05,0,0,0,6);
 const ft=drum(.15,.24,.45,.38,-.12,0);[0,2.1,4.2].forEach(a=>xb(g,.015,.36,.015,chr,.45+Math.sin(a)*.17,.17,-.12+Math.cos(a)*.17));
 stand(-.3,-.14,.48);drum(.13,.1,-.3,.53,-.14,-.15,'#f4f1e8');xt(g,.11,.004,'#888',-.3,.47,-.14,PI2,0,0);
 stand(-.6,-.05,.78);xc(g,.15,.03,.012,cym,-.6,.78,-.05,0,0,0,16);xc(g,.15,.03,.012,cym,-.6,.76,-.05,Math.PI,0,0,16);
 cymbal(-.42,.32,1.12,.2,.25);cymbal(.62,.25,1.0,.24,.2);if(l==3)cymbal(.28,.42,1.2,.17,.3);throne(0,-.45);[-1,1].forEach(s=>xb(g,.012,.012,.38,'#d9b37a',-.3+s*.04,.6,-.12,0,s*.4,0))};
GB.decks=(g,l)=>{if(!l)return;const y=.8;xb(g,1.4,.06,.7,'#1a1a1a',0,y,0);xb(g,.7,.74,.5,'#2a2a2e',0,.37,0);xb(g,.66,.6,.012,'#1d1d22',0,.38,.256);for(let i=0;i<6;i++)xb(g,.6,.008,.014,'#2a2a2e',0,.14+i*.09,.26);xb(g,1.4,.02,.012,'*'+['ff6ad5','7fe3ff','2fe68a'][l-1],0,y-.02,.355);
 const yt=y+.03;if(l==1){xb(g,.8,.05,.36,'#2a2a2e',0,yt+.025,0);[-1,1].forEach(s=>{xc(g,.11,.11,.02,'~#b8bcc2',s*.24,yt+.06,-.02,0,0,0,16);xc(g,.09,.09,.024,'#1a1a1a',s*.24,yt+.062,-.02,0,0,0,16);for(let i=0;i<4;i++)xb(g,.035,.012,.035,'*'+['ff6ad5','7fe3ff','ffd27a','2fe68a'][i],s*.24-.06+i*.04,yt+.055,.13)});
  [-.04,.04].forEach(x=>xb(g,.02,.012,.12,'#888',x,yt+.055,0));xb(g,.08,.012,.02,'#888',0,yt+.055,.13);for(let i=0;i<3;i++)knob(g,-.04,yt+.06,-.12+i*.04,.012);for(let i=0;i<3;i++)knob(g,.04,yt+.06,-.12+i*.04,.012);
  xb(g,.32,.02,.22,'#333',.5,yt+.01,0);xb(g,.32,.2,.012,'#222',.5,yt+.11,-.11,-.25,0,0);xb(g,.28,.16,.004,'*4a6fa5',.5,yt+.11,-.103,-.25,0,0);return}
 const tt=(x)=>{xb(g,.44,.06,.38,l==3?'#2a2a2e':'#1a1a1a',x,yt+.03,0);if(l==2){xc(g,.15,.15,.02,'~#c8ccd0',x-.03,yt+.07,0,0,0,0,18);xc(g,.145,.145,.006,'#1a1a1a',x-.03,yt+.083,0,0,0,0,18);xt(g,.1,.006,'#e6b422',x-.03,yt+.088,0,PI2,0,0);xc(g,.008,.008,.03,'~#d8dce0',x-.03,yt+.09,0,0,0,0,6);
   xc(g,.02,.02,.03,'~#c8ccd0',x+.16,yt+.075,-.13,0,0,0,8);xb(g,.012,.012,.2,'~#d8dce0',x+.13,yt+.09,-.04,0,-.35,0);xb(g,.03,.012,.04,'#1a1a1a',x+.09,yt+.09,.06);xb(g,.02,.008,.12,'#555',x+.18,yt+.065,.08);xb(g,.05,.012,.03,'#888',x-.17,yt+.065,.15)}
  else{xc(g,.11,.11,.02,'~#b8bcc2',x,yt+.07,.04,0,0,0,18);xc(g,.09,.09,.024,'#1a1a1a',x,yt+.075,.04,0,0,0,18);xb(g,.2,.012,.08,'*7fe3ff',x,yt+.065,-.13,-.3,0,0);for(let i=0;i<4;i++)xb(g,.04,.012,.03,'*'+['ff6ad5','2fe68a','ffd27a','7fe3ff'][i],x-.15+i*.1,yt+.065,.17)}};
 tt(-.45);tt(.45);const mw=l==3?.34:.26;xb(g,mw,.07,.36,'#222',0,yt+.035,0);const ch=l==3?4:2;for(let c=0;c<ch;c++){const cx=-mw/2+mw*(c+.5)/ch;for(let i=0;i<3;i++)knob(g,cx,yt+.08,-.13+i*.05,.012);xb(g,.012,.01,.08,'#555',cx,yt+.072,.08);xb(g,.025,.02,.015,'#ddd',cx,yt+.08,.07);for(let i=0;i<4;i++)LED(g,cx+.02,yt+.075,-.02-i*.02,i<2?'2fe68a':i<3?'ffd27a':'ff4455')}
 xb(g,.08,.012,.012,'#555',0,yt+.072,.15);xb(g,.02,.02,.025,'#ddd',.01,yt+.08,.15);
 if(l==3){xb(g,.04,.3,.04,'#2a2a2a',.72,y+.15,-.2);xb(g,.3,.02,.22,'#333',.72,y+.3,-.18);xb(g,.3,.2,.012,'#222',.72,y+.4,-.29,-.3,0,0);xb(g,.27,.17,.004,'*4a6fa5',.72,y+.4,-.282,-.3,0,0);[-1,1].forEach(s=>{xc(g,.03,.04,.3,'#1a1a1a',s*.62,y+.18,.25,0,0,0,8);xs(g,.05,'*ff6ad5',s*.62,y+.36,.25,8)})}};
GB.booth=(g,l)=>{const C=['#3a4a5a','#5a3a6a','#2a6a5a'];for(let i=0;i<l;i++)xFoam(g,.9,1.4,C[i],-i*1.1,0,0,4,6)};
function xPhonesHead(g,l){const c=['#666','#1a1a1a','#c9c3b2','#8a5a36'][l],cup=['#666','#1a1a1a','~#b8bcc2','!#6b4a2e'][l];xt(g,.13,.016,c,0,.06,0,0,0,0,Math.PI);xb(g,.2,.02,.04,'#1a1a1a',0,.18,0);
 [-1,1].forEach(s=>{xcx(g,.07,.05,cup,s*.15,0,0,14);xcx(g,.06,.02,'#1a1a1a',s*.12,0,0,14);if(l==2){xt(g,.05,.006,'~#d8dce0',s*.176,0,0,0,PI2,0);xcx(g,.045,.004,'#3a3d42',s*.177,0,0,12)}if(l==3)xcx(g,.03,.006,'~#c9a227',s*.177,0,0,10)})}
GB.phones=(g,l)=>{if(!l)return;xc(g,.08,.09,.02,'#1a1a1a',0,.01,0,0,0,0,12);xc(g,.012,.012,.36,'~#9aa0a6',0,.19,0,0,0,0,6);xb(g,.12,.03,.05,'#1a1a1a',0,.37,0);xPhonesHead(xgrp(g,0,.24,0),l);xb(g,.006,.006,.5,'#1a1a1a',.15,.12,.15,.6,0,0)};
GB.iface=(g,l)=>{if(!l)return;if(l==1){xb(g,.3,.09,.2,'!#c0392b',0,.045,0);[-1,1].forEach(s=>{fknob(g,s*.08,.06,.102,.03,'#1a1a1a');xt(g,.035,.004,'*2fe68a',s*.08,.06,.1)});xcz(g,.02,.012,'#111',-.12,.045,.1,8);xcz(g,.02,.012,'#111',.12,.045,.1,8);fknob(g,0,.05,.102,.025,'#1a1a1a');return}
 const w=.36,h=l==2?.06:.1;xb(g,w,h,.26,l==3?'#aab3bd':'#2c3e50',0,h/2,0);for(let i=0;i<6;i++){fknob(g,-w/2+.04+i*.055,h*.6,.132,.012,'#ddd');LED(g,-w/2+.04+i*.055,h*.25,.132,i%3?'2fe68a':'ffd27a')}
 if(l==3){xb(g,w,h,.26,'#2a2a2e',0,h*1.5+.005,0);xb(g,w*.5,h*.5,.004,'*ffb050',-.08,h*1.5+.005,.131);for(let i=0;i<7;i++)LED(g,.06+i*.014,h*1.5,.131,i<7?'2fe68a':'ff4455');[-1,1].forEach(s=>xb(g,.03,h*2+.01,.02,'~#c8ccd0',s*(w/2+.015),h,.12))}};
GB.monitors=(g,l)=>{if(!l)return;const s=[0,.85,1,1.25][l],w=.2*s,h=.3*s,d=.24*s,cone=l==2?'#e6b422':'#2a2a2e';[-1,1].forEach(q=>{xb(g,w*.9,.03,d*.9,'#3a3d42',q*.5,.015,0);xSpk(g,w,h,d,'#1d1d22',q*.5,.03+h/2,0,{cone,port:1,led:'2fe68a'})});
 if(l==3)xSpk(g,.4,.35,.4,'#1d1d22',0,-.55,.05,{cone:'#2a2a2e',port:1})};
GB.pedals=(g,l)=>{if(!l)return;const n=[0,1,3,5][l],C=['#2ecc71','#e67e22','#3498db','#e84393','#f1c40f'];if(l>=2){xb(g,.7,.05,.3,'#1a1a1a',0,.025,0,.12,0,0);xb(g,.7,.012,.3,'#3a3d42',0,.05,0,.12,0,0)}
 for(let i=0;i<n;i++){const x=n==1?0:-.27+i*(.54/(n-1)),y=l>=2?.075:.03,c=C[i];xb(g,.1,.06,.15,c,x,y,0);[-1,1].forEach(s=>knob(g,x+s*.025,y+.035,-.04,.012,'#1a1a1a'));xc(g,.014,.014,.02,'~#d8dce0',x,y+.04,.04,0,0,0,8);LED(g,x,y+.032,-.065,'ff4455');if(i<n-1)xb(g,.06,.01,.01,['#111','#e6b422'][i%2],x+.07,y+.02,-.06)}
 if(l==3){xb(g,.12,.05,.08,'#1a1a1a',.27,.1,.1);xb(g,.08,.004,.04,'*7fe3ff',.27,.126,.1)}xb(g,.012,.012,.4,'#111',n==1?.06:.36,.01,-.25,0,.5,0)};
GB.sampler=(g,l)=>{if(!l)return;const w=[0,.24,.34,.38][l],c=['#555','#e8e8ec','#2a2a2e','#2c3e50'][l];xb(g,w,.04,.28,c,0,.02,0,-.05,0,0);const n=l==1?4:4,ps=l==1?.03:.05,ox=l==3?-.08:-.02;
 for(let i=0;i<n;i++)for(let j=0;j<n;j++)xb(g,ps,.015,ps,l==1?'#1a1a1a':'*'+['ff6ad5','7fe3ff','ffd27a','2fe68a'][(i+j)%4],ox-ps*1.6+i*ps*1.1,.045,.02+j*ps*1.1-ps*1.6);
 if(l==1){xb(g,.08,.01,.04,'*e8e8ec',.06,.045,-.09);for(let i=0;i<3;i++)knob(g,.05+i*.025,.05,-.04,.008,'#e74c3c')}else{xb(g,l==3?.14:.1,.01,.07,'*4a6fa5',l==3?.1:.08,.045,-.08);for(let i=0;i<4;i++)knob(g,(l==3?.08:.06)+i*.025,.05,.03,.01)}};
GB.vocal=(g,l)=>{if(!l)return;const w=.45,h=.55;xb(g,w,h,.4,'#1d1d22',0,h/2,0);xb(g,w-.04,h-.06,.01,'#0e0e10',0,h/2,.2);[-1,1].forEach(s=>xb(g,.025,h,.42,'#2a2a2e',s*(w/2-.012),h/2,0));
 const unit=(i,c,f)=>{const y=h-.08-i*.12;xb(g,w-.06,.1,.02,c,0,y,.205);[-1,1].forEach(s=>xs(g,.01,'~#d8dce0',s*(w/2-.05),y,.22,4));f(y)};
 unit(0,'~#c8ccd0',y=>{fknob(g,-.08,y,.215,.03,'#1a1a1a');fknob(g,.05,y,.215,.022,'#c0392b');LED(g,.15,y,.217,'ff4455')});
 if(l>=2)unit(1,'#3a2a1a',y=>{xb(g,.12,.06,.004,'^#ffcf80',-.08,y,.218);[-1,0,1].forEach(k=>xc(g,.012,.012,.05,'*ffb050',-.08+k*.035,y,.205,0,0,0,6));xb(g,.08,.05,.004,'*f5e6c4',.1,y,.218);xb(g,.004,.04,.006,'#1a1a1a',.1,y,.221,0,0,.4)});
 if(l>=3)unit(2,'!#5d7a8c',y=>{[-.14,-.05,.04].forEach(x=>fknob(g,x,y,.215,.028,'#e8e0d0'));xb(g,.06,.05,.004,'*f5e6c4',.15,y,.218)});xb(g,.01,.3,.01,'#111',.15,.15,-.2)};
GB.synth=(g,l)=>{if(!l)return;const w=l==1?.75:1.0,nW=l==1?15:29,y=.72;[-1,1].forEach(s=>{xb(g,.05,y,.05,'#2a2a2e',s*(w/2-.08),y/2,-.12);xb(g,.05,y,.05,'#2a2a2e',s*(w/2-.08),y/2,.12);xb(g,.05,.05,.4,'#2a2a2e',s*(w/2-.08),.03,0)});xb(g,w-.1,.04,.04,'#2a2a2e',0,y-.05,0);
 xb(g,w,.07,.42,l==1?'#e8e8ec':'#1a1a1a',0,y+.035,0);[-1,1].forEach(s=>xb(g,.04,.12,.44,'!#6b4a2e',s*(w/2+.02),y+.05,0));xKeys(g,w-.08,nW,0,y+.08,.07,.26);xb(g,w-.06,.05,.14,l==1?'#c0392b':'#2a2a2e',0,y+.09,-.14,-.25,0,0);
 for(let i=0;i<(l==1?8:14);i++)for(let j=0;j<2;j++)knob(g,-w/2+.08+i*(w-.16)/(l==1?7:13),y+.13-j*.02,-.17+j*.06,.012,j?'#e8e8ec':'#1a1a1a');if(l>=2)xb(g,.16,.05,.004,'*ffb050',0,y+.12,-.105,-.25,0,0);
 if(l==3){const cy=y+.5;xb(g,w,.62,.18,'!#6b4a2e',0,cy,-.25);xb(g,w-.06,.56,.01,'#121216',0,cy,-.155);for(let r=0;r<2;r++)for(let i=0;i<9;i++){const mx=-w/2+.08+i*.105,my=cy+.13-r*.27;xb(g,.095,.24,.006,['#c8ccd0','#1a1a1a','#e8e0d0','#2c3e50'][(i+r)%4],mx,my,-.15);for(let k=0;k<3;k++)knob(g,mx,my+.07-k*.07,-.13,.01,'#1a1a1a');LED(g,mx+.03,my-.1,-.146,['ff4455','2fe68a','ffd27a'][(i+r)%3])}
  for(let i=0;i<9;i++)xb(g,.008,.008,.25+(i%3)*.06,['#e74c3c','#f1c40f','#3498db','#2ecc71','#e84393'][i%5],-w/2+.12+i*.1,cy-.02-(i%2)*.05,-.13,0,0,(i%2?1:-1)*(.6+(i%3)*.3))}};
GB.treat=(g,l)=>{if(!l)return;const trap=(x,z)=>{xb(g,.32,1.9,.32,'#3a3f47',x,.95,z);[-1,1].forEach(s=>xb(g,.02,1.9,.02,'#2a2a2e',x+s*.16,.95,z+.16));xb(g,.33,.02,.33,'#2a2a2e',x,1.9,z);xb(g,.33,.02,.33,'#2a2a2e',x,.01,z)};trap(0,0);trap(-7.58,0)};
/* skyline diffuser block for the back wall */
function xDiff(g,x,y,z){const n=6,s=.15,H=[3,1,4,2,5,0,2,4,1,3,0,5];xb(g,n*s,4*s,.02,'#5a3a22',x,y,z+.01);for(let i=0;i<n;i++)for(let j=0;j<4;j++){const h=(H[(i*5+j*7)%12]+1)*.025;xb(g,s*.94,s*.94,h,j%2?'#a0703f':'#8a5a36',x-n*s/2+s*(i+.5),y-2*s+s*(j+.5),z+.02+h/2)}}
GB.desk=(g,l)=>{if(!l)return;if(l==1){xb(g,.62,.05,.3,'#2a2a2e',0,.025,0);for(let i=0;i<8;i++){xb(g,.012,.008,.12,'#555',-.26+i*.06,.052,.04);xb(g,.035,.02,.02,'#ddd',-.26+i*.06,.06,.02+(i%3)*.03);knob(g,-.26+i*.06,.06,-.08,.01)}xb(g,.12,.01,.04,'*7fe3ff',.2,.055,-.11);return}
 const ch=l==2?16:24,w=l==2?1.3:1.45,cw=(w-.2)/ch;xb(g,w,.7,.62,'#2a2a2e',0,.35,0);xb(g,w-.04,.6,.01,'#1d1d22',0,.33,.311);[-1,1].forEach(s=>xb(g,.05,.12,.7,'!#5a3a22',s*(w/2+.025),.74,0));
 const top=xgrp(g,0,.74,0);top.rotation.x=.18;xb(top,w,.04,.62,'#1d1d22',0,0,0);xb(top,w,.02,.08,'!#5a3a22',0,.01,.31);
 for(let i=0;i<ch;i++){const x=-w/2+.1+cw*(i+.5);xb(top,cw*.6,.006,.16,'#0e0e10',x,.024,.16);xb(top,cw*.7,.025,.03,'#e8e8ec',x,.035,.12+(i*7%5)*.02);for(let k=0;k<4;k++)knob(top,x,.03,-.04-k*.055,cw*.3,['#1a1a1a','#c0392b','#2c3e50','#1a1a1a'][k]);xb(top,cw*.6,.012,.025,i%5==2?'*ff4455':'#aab3bd',x,.03,.05)}
 xb(top,.08,.006,.2,'#444',w/2-.05,.025,.12);const br=xgrp(g,0,.92,-.26);xb(br,w,.24,.08,'#1d1d22',0,0,0);for(let i=0;i<ch;i++){const x=-w/2+.1+cw*(i+.5);for(let k=0;k<6;k++)xb(br,cw*.5,.022,.006,'*'+(k<4?'2fe68a':k<5?'ffd27a':'ff4455'),x,-.08+k*.03,.042)}
 if(l==3){[-1,1].forEach(s=>xSpk(br,.24,.34,.24,'#1d1d22',s*(w/2-.2),.3,0,{cone:'#2a2a2e',led:'2fe68a'}));xb(br,.3,.18,.02,'*4a6fa5',0,.22,.03)}};
GB.content=(g,l)=>{if(!l)return;const tri=(x,z,h)=>{[0,2.1,4.2].forEach(a=>xb(g,.02,h*.55,.02,'#1a1a1a',x+Math.sin(a)*.12,h*.25,z+Math.cos(a)*.12,.35*Math.cos(a),0,-.35*Math.sin(a)));xc(g,.012,.012,h,'#1a1a1a',x,h/2,z,0,0,0,6)};
 tri(0,0,1.45);xt(g,.2,.03,'*fff6e0',0,1.55,.02);xt(g,.2,.012,'#1a1a1a',0,1.55,0);xb(g,.05,.1,.01,'#111',0,1.55,.03);xb(g,.045,.09,.004,'*4a6fa5',0,1.55,.036);
 if(l>=2){tri(.4,.25,1.2);xb(g,.16,.11,.1,'#1a1a1a',.4,1.26,.25);xcz(g,.045,.12,'#2a2a2e',.4,1.26,.36,12);xcz(g,.035,.01,'^#4a6fa5',.4,1.26,.425,12);LED(g,.46,1.3,.302,'ff4455');
  tri(-.45,.15,1.3);const sb=xgrp(g,-.45,1.4,.15);sb.rotation.y=.4;xb(sb,.5,.5,.06,'*fff0d8',0,0,.12);xc(sb,.05,.33,.2,'#1a1a1a',0,0,0,-PI2,0,0,4)}
 if(l>=3){[[.15,-.4],[-.35,-.35]].forEach(([x,z])=>{tri(x,z,1.7);const p=xgrp(g,x,1.75,z);p.rotation.x=-.3;xb(p,.36,.24,.04,'#1a1a1a',0,0,0);xb(p,.32,.2,.006,'*eaf4ff',0,0,.023)});xb(g,.1,.04,.03,'#1a1a1a',.4,1.36,.25);xc(g,.012,.012,.12,'#2a2a2e',.4,1.42,.22,PI2,0,0,6);xb(g,.04,.06,.04,'*ff4455',.48,1.36,.22)}};
/* the producer table under the window, with a laptop running a DAW */
function xTable(g){xb(g,1.4,.05,.7,'!#6b4a2e',0,.75,0);xb(g,1.36,.12,.66,'#4a3220',0,.66,0);[[-.66,-.31],[.66,-.31],[-.66,.31],[.66,.31]].forEach(([x,z])=>xb(g,.05,.68,.05,'#2a1a10',x,.34,z));xb(g,1.3,.03,.2,'#2a1a10',0,.15,-.2);
 const lp=xgrp(g,0,.78,-.1);xb(lp,.34,.015,.24,'#aab3bd',0,.008,0);xb(lp,.3,.004,.12,'#2a2a2e',0,.017,.02);xb(lp,.34,.22,.012,'#aab3bd',0,.11,-.12,-.2,0,0);xb(lp,.31,.19,.004,'#16202a',0,.11,-.113,-.2,0,0);
 for(let i=0;i<4;i++)xb(lp,.26,.012,.002,'*'+['ff6ad5','7fe3ff','2fe68a','ffd27a'][i],0,.17-i*.035,-.108,-.2,0,0);xb(lp,.006,.16,.002,'*f4f4f4',-.04,.11,-.107,-.2,0,0)}

/* the studio, rebuilt from the detailed builders and merged by material */
const XSTP=(g,k,l,x,y,z,ry)=>{if(!GB[k])return;const o=xgrp(g,x,y,z,ry);GB[k](o,l);return o};
function xMerge(root){root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),by=new Map(),keep=[];
 root.traverse(o=>{if(!o.isMesh)return;if(o.material.transparent){keep.push(o);return}const m=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),gg=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();gg.applyMatrix4(m);if(!by.has(o.material))by.set(o.material,[]);by.get(o.material).push(gg)});
 const kept=keep.map(o=>{const m=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),c=new THREE.Mesh(o.geometry,o.material);m.decompose(c.position,c.quaternion,c.scale);return c});
 while(root.children.length)root.remove(root.children[0]);
 by.forEach((list,mat)=>{let n=0;list.forEach(q=>n+=q.attributes.position.count);const pos=new Float32Array(n*3),nor=new Float32Array(n*3);let o=0;list.forEach(q=>{pos.set(q.attributes.position.array,o*3);nor.set(q.attributes.normal.array,o*3);o+=q.attributes.position.count;q.dispose()});
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));bg.setAttribute('normal',new THREE.BufferAttribute(nor,3));bg.computeBoundingSphere();const me=new THREE.Mesh(bg,mat);me.userData.merged=1;root.add(me)});kept.forEach(c=>root.add(c))}
buildStudio=function(){
 if(studio){scene.remove(studio);studio.traverse(o=>{if(o.isMesh&&o.userData.merged)o.geometry.dispose()})}const g=studio=new THREE.Group();scene.add(g);dyn=[];gfill();const G=S.gear,L=k=>G[k]||0;
 /* rug and window */
 xb(g,3.2,.03,3,'#3a2f4a',12.6,.02,2.6);xb(g,3.0,.035,2.8,'#4a3d5e',12.6,.022,2.6);xb(g,2.6,.04,2.4,'#3a2f4a',12.6,.024,2.6);for(let i=0;i<14;i++)[-1,1].forEach(s=>xb(g,.04,.01,.1,'#d9c8a0',11.1+i*.23,.02,2.6+s*1.55));
 xb(g,1.6,1.2,.05,'*8fd0ff',9.4,1.8,.02);xb(g,1.72,.08,.08,'#e8e4da',9.4,2.42,.05);xb(g,1.72,.08,.08,'#e8e4da',9.4,1.18,.05);[-1,1].forEach(s=>xb(g,.08,1.3,.08,'#e8e4da',9.4+s*.82,1.8,.05));xb(g,.05,1.2,.06,'#e8e4da',9.4,1.8,.05);xb(g,1.6,.05,.06,'#e8e4da',9.4,1.8,.05);xb(g,1.9,.05,.18,'#e8e4da',9.4,1.13,.1);
 /* chair, mic, guitar and amp */
 XSTP(g,'chair',L('chair'),13.6,0,2.8,0);XSTP(g,'mic',L('mic'),12.2,0,1.3,0);XSTP(g,'guitar',L('guitar'),14.7,0,1.2,0);
 dyn.push([11.9,1.2,12.5,1.8],[13.3,2.5,13.9,3.1],[14.4,.8,15.1,1.5]);
 if(L('guitar')>=1){XSTP(g,'amp',L('guitar'),15.4,0,2.6,0);dyn.push([15,2.4,15.8,2.8])}
 if(L('mic')>=2)[10.3,14.2].forEach(x=>XSTP(g,'speaker',0,x,0,.55,0));
 /* posters and neon (Promo) on the back wall */
 if(L('promo')){const o=xgrp(g,10.55,1.8,.05);GB.promo(o,L('promo'))}
 if(L('keys')){XSTP(g,'keys',L('keys'),10.2,0,4.8,0);dyn.push([9.6,4.55,10.9,5.05])}
 if(L('drums')){XSTP(g,'drums',L('drums'),10.8,0,2.3,0);dyn.push([10.1,1.9,11.5,2.7])}
 if(L('decks')){XSTP(g,'decks',L('decks'),13.8,0,4.9,0);dyn.push([13.1,4.5,14.5,5.3])}
 if(L('booth')){const o=xgrp(g,15.2,1.3,.02);GB.booth(o,L('booth'))}
 /* new gear lines */
 const tbl=['phones','iface','monitors','sampler'].some(k=>L(k))||L('desk')==1;
 if(tbl){const t=xgrp(g,9.05,0,.55);xTable(t);dyn.push([8.35,.2,9.75,.9]);const ty=.775;
  if(L('monitors'))XSTP(t,'monitors',L('monitors'),0,ty,-.2,0);if(L('iface'))XSTP(t,'iface',L('iface'),-.52,ty,.16,.1);if(L('sampler'))XSTP(t,'sampler',L('sampler'),.52,ty,.17,-.1);
  if(L('phones')){xb(t,.05,.03,.06,'#1a1a1a',.72,.68,.1);xPhonesHead(xgrp(t,.76,.5,.1,PI2),L('phones'))}if(L('desk')==1)XSTP(t,'desk',1,0,ty,.2,0)}
 if(L('pedals'))XSTP(g,'pedals',L('pedals'),14.85,0,3.15,-.2);
 if(L('bass')){XSTP(g,'bass',L('bass'),15.35,0,1.15,-.25);dyn.push([15.1,.95,15.6,1.35])}
 if(L('vocal')){XSTP(g,'vocal',L('vocal'),11.5,0,.75,.15);dyn.push([11.27,.55,11.73,.95])}
 if(L('synth')){XSTP(g,'synth',L('synth'),8.95,0,5.2,0);dyn.push([8.4,4.92,9.5,5.48])}
 if(L('treat')){XSTP(g,'treat',L('treat'),15.78,0,.3,0);dyn.push([15.6,.12,15.96,.48],[8.04,.12,8.36,.48]);
  if(L('treat')>=2)[13.0,14.1,15.2].forEach(x=>xDiff(g,x,2.55,0));if(L('treat')>=3)for(let i=0;i<9;i++)xb(g,.12,.42,.05,i%2?'#a0703f':'#8a5a36',8.65+i*.19,2.72,.04)}
 if(L('desk')>=2){XSTP(g,'desk',L('desk'),15.45,0,3.95,PI2);dyn.push([15.05,3.25,15.9,4.65])}
 if(L('content')){XSTP(g,'content',L('content'),8.4,0,1.45,Math.PI/4);dyn.push([8.12,1.2,8.68,1.7])}
 xMerge(g)};

/* shop hover previews use the same detailed builders */
{const pm0=pvModel;pvModel=function(k){if(PVM[k])return PVM[k];const[t,i,l]=k.split(':');if(t!='g'||!GB[i])return pm0(k);const w=new THREE.Group(),g=new THREE.Group();
 try{if(i=='promo'||i=='booth'){GB[i](g,Math.max(1,+l))}else if(i=='treat'){const n=+l;xb(g,.32,1.9,.32,'#3a3f47',-.6,.95,0);if(n>=2)xDiff(g,.3,1.2,0);if(n>=3)for(let j=0;j<5;j++)xb(g,.12,.42,.05,'#8a5a36',-.1+j*.19,.3,.3)}else GB[i](g,+l);if(i=='guitar'&&+l>=1){const a=xgrp(g,.7,0,0);GB.amp(a,+l)}}catch(e){console.warn('preview',e);return pm0(k)}
 if(!g.children.length)return pm0(k);const bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3()),z=bb.getSize(new THREE.Vector3());g.position.sub(c);w.add(g);w.scale.setScalar(1.6/Math.max(z.x,z.y,z.z));return PVM[k]=w}}

/* furniture: a little more detail on the basic pieces (box lists, so placing and previews keep working) */
{const add=(t,a)=>{if(F[t]&&F[t].b&&!F[t].xd){F[t].xd=1;F[t].b.push(...a)}};
 add('sofa',[[.96,.12,.66,'#5a80b8',-.49,.5,.08],[.96,.12,.66,'#5a80b8',.49,.5,.08],[.9,.38,.12,'#4a6fa5',-.49,.8,-.24],[.9,.38,.12,'#4a6fa5',.49,.8,-.24],[.3,.28,.1,'#e6b422',-.65,.7,-.12],[.06,.06,.06,'#2a1a10',-.9,.03,.38],[.06,.06,.06,'#2a1a10',.9,.03,.38],[.06,.06,.06,'#2a1a10',-.9,.03,-.38],[.06,.06,.06,'#2a1a10',.9,.03,-.38]]);
 add('table',[[1.24,.03,.74,'#6b4a2e',0,.455,0],[1.0,.04,.5,'#7a5030',0,.15,0],[.25,.05,.18,'#c8506a',.3,.47,.1],[.2,.04,.14,'#4aa3df',.3,.51,.1],[.12,.1,.12,'#efe6d0',-.35,.49,-.05]]);
 add('shelf',[[1.1,.04,.36,'#4a3220',0,.65,.02],[1.1,.04,.36,'#4a3220',0,1.2,.02],[1.1,.04,.36,'#4a3220',0,1.75,.02],[.08,.25,.08,'#2e8b57',-.4,1.9,.05],[.3,.22,.1,'#efe6d0',.3,1.88,.12],[.15,.18,.15,'#a0522d',-.4,1.74,.05]]);
 add('plant',[[.52,.05,.52,'#8a4a2a',0,.42,0],[.4,.03,.4,'#3a2a1a',0,.42,0],[.3,.3,.08,'#3cb371',.2,.9,.12],[.3,.3,.08,'#3cb371',-.2,1.0,-.1],[.08,.3,.3,'#2e8b57',.15,1.15,-.15]]);
 add('tv',[[1.52,.04,.1,'#222',0,.5,0],[.6,.03,.02,'#555',0,.2,.26],[.3,.18,.3,'#111',-.5,.25,.1],[.04,.04,.01,'*ff4455',.68,.6,.05],[1.3,.08,.02,'*5a8abf',0,1.2,.06]]);
 add('fridge',[[.92,.03,.82,'#c8d0d4',0,1.25,0],[.05,.6,.05,'#888',.3,.8,.42],[.2,.15,.02,'#e6b422',-.2,1.5,.41],[.15,.12,.02,'#4aa3df',-.1,1.7,.41],[.8,.04,.02,'#aab3bd',0,.08,.41]]);
 add('lamp',[[.42,.03,.42,'#d9c8a0',0,1.75,0],[.42,.03,.42,'#d9c8a0',0,1.45,0],[.08,.08,.08,'#c9a227',0,1.3,0],[.2,.02,.02,'#111',.12,.1,0]]);
 add('dining',[[1.84,.03,1.04,'#8a5a36',0,.86,0],[.3,.02,.3,'#efe6d0',-.5,.87,0],[.3,.02,.3,'#efe6d0',.5,.87,0],[.12,.18,.12,'#cfe8ff',0,.96,0],[.06,.12,.06,'#2e8b57',0,1.05,0]]);
 add('rug',[[2.2,.045,.06,'#f4f1e8',0,.03,-.7],[2.2,.045,.06,'#f4f1e8',0,.03,.7],[1.2,.05,.6,'#b5483a',0,.035,0]])}
if(typeof studio!='undefined'&&studio)buildStudio();
