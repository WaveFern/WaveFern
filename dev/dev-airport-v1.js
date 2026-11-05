/* ===== dev only: a nicer airport, outside and inside =====
   OUTSIDE (home airport): a curved wave roof, lit rooftop letters and a Fern logo, flag poles, planters with trees along the
   forecourt, benches and bollards, a glowing entrance portal with a red carpet, a parked shuttle bus, a windsock, a radar,
   fuel tanks, apron floodlights and blue taxiway lights.
   INSIDE (the terminal, same one at every airport): a Fernfield compass-rose floor and a carpeted central garden with benches,
   a painted skyline mural and plant walls, gate lounge planters, floor guide lines, trolleys, vending machines, an ATM, lockers,
   bins and rope queues. Nothing here changes collisions of doors, gates or desks; only the new central garden blocks you.
   Only loaded on /dev/. Add ?noairport to skip it. */
(function(){
 if(!window.FW_DEV||/[?&]noairport/.test(location.search)||typeof THREE=='undefined')return;
 const safe=(f,t)=>{try{return f()}catch(e){if(!safe[t]){safe[t]=1;console.warn('dev airport '+t,e)}}};
 const AX=4000,AZ=320,AW=72,AD=56,FONT='"Trebuchet MS","Segoe UI",Arial,sans-serif';
 let outDone=0,inDone=0;const CL=(()=>{try{return cols}catch(e){return null}})();
 const plane=(grp,w,h,x,y,z,ry,rx,draw,o)=>{o=o||{};const c=document.createElement('canvas');c.width=Math.round(w*128);c.height=Math.round(h*128);const g=c.getContext('2d');draw(g,c.width,c.height);const t=new THREE.CanvasTexture(c);t.anisotropy=4;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:!!o.tr,depthWrite:!o.tr,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);grp.add(m);return m};
 const label=(grp,w,h,text,x,y,z,ry,bg,fg,bar)=>plane(grp,w,h,x,y,z,ry,0,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);if(bar){c.fillStyle=bar;c.fillRect(0,H*.9,W,H*.1)}c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';let fs=H*.62;c.font='bold '+fs+'px '+FONT;while(c.measureText(text).width>W*.92&&fs>8){fs-=2;c.font='bold '+fs+'px '+FONT}c.fillText(text,W/2,H/2)});
 const flush=(G,grp)=>(xgFlush(G,SBM)||[]).forEach(m=>{scene.remove(m);grp.add(m)});
 const tree=(bx,x,z,s,c1)=>{bx(.5*s,1.4*s,.5*s,'#7a5232',x,.7*s,z);bx(2.2*s,1.6*s,2.2*s,c1||'#2e8b57',x,2.1*s,z);bx(1.4*s,1.2*s,1.4*s,'#3aa066',x,3.3*s,z)};

 /* ---------- outside ---------- */
 function decorOut(og){
  const G=xgNew(),bx=(w,h,d,c,x,y,z,ry,tc)=>xgBox(G,w,h,d,c,x,y,z,ry,tc);
  const x0=-400,x1=-330,z0=-40,z1=80,mz=20;
  /* wave roof: stepped glass-blue bands over the flat roof, with white fins */
  for(let i=0;i<14;i++){const z=z0+4+i*(z1-z0-8)/13,h=1.4+Math.sin(i/13*Math.PI)*1.6;bx(x1-x0-6,h,4.2,'#7fb2dd',(x0+x1)/2-2,14.6+h/2,z,0,'#bfdcf2');bx(x1-x0-5,.18,.35,'#ffffff',(x0+x1)/2-2,14.6+h+.1,z)}
  /* roof edge light line and canopy underglow */
  bx(.3,.3,z1-z0+2,'*ffe9a8',x1+1.1,14.7,(z0+z1)/2);bx(.25,.25,60,'*7fd4ff',-306,6.8,20);
  /* lit rooftop letters block + logo plate */
  bx(34,.5,2,'#0b2a5b',x1-4,17.3,mz,0,'#16408a');bx(.5,2.4,34,'#0b2a5b',x1+.4,16.2,mz,0,'#16408a');
  /* entrance portal with red carpet */
  bx(.5,5.6,.6,'#0b2a5b',x1+.5,2.8,mz-5.2);bx(.5,5.6,.6,'#0b2a5b',x1+.5,2.8,mz+5.2);bx(.7,.6,11,'#0b2a5b',x1+.5,5.8,mz);
  bx(4.2,.04,9,'#a8212b',x1+3.4,.05,mz);bx(.2,.06,9.2,'#ffd84a',x1+5.5,.055,mz);
  [mz-4,mz+4].forEach(z=>{bx(.3,1.1,.3,'#c9a24a',x1+5.7,.55,z);bx(.5,.18,.5,'*ffd27a',x1+5.7,1.2,z)});
  /* flag poles */
  [[-326,-14],[-326,54]].forEach(([x,z],i)=>{bx(.22,13,.22,'#cfd5dc',x,6.5,z);bx(.5,.5,.5,'#ffd84a',x,13.2,z);bx(.08,1.6,3,i?'#0b2a5b':'#ff6b4a',x,12,z+1.7)});
  /* planters with trees, benches and bollards along the forecourt */
  for(let z=-6;z<=46;z+=13){bx(2.4,.7,2.4,'#8a8f98',-324,.35,z,0,'#b9bec6');tree(bx,-324,z,.9);CL&&CL.push([-325.3,z-1.3,-322.7,z+1.3])}
  for(let z=-2;z<=42;z+=10){bx(.5,.5,2.4,'#6b4a32',-311.5,.35,z);bx(.15,.6,2.4,'#4a3324',-311.2,.8,z)}
  for(let z=-9;z<=49;z+=2.4)bx(.28,.8,.28,'#d9dde3',-296,.4,z);
  /* shuttle bus at the stop */
  bx(3.2,2.6,10,'#ff6b4a',-303,1.7,36,0,'#ff8c70');bx(3.25,1,9.4,'#1b2533',-303,2.1,36);bx(3.3,.3,10.1,'#ffffff',-303,.9,36);[33,39].forEach(z=>bx(.4,.9,1.1,'#222',-301.2,.45,z));CL&&CL.push([-304.7,31,-301.3,41]);
  /* airfield extras: radar, windsock, fuel tanks, floodlights, taxiway lights */
  bx(.5,9,.5,'#9aa2ac',-240,4.5,100);bx(5,.5,.5,'#e8ecf0',-240,9.4,100);bx(1.6,1.6,1.6,'#e8ecf0',-240,10.4,100);
  bx(.15,7,.15,'#cfd5dc',-330,3.5,100);bx(2.4,.7,.7,'#ff6b4a',-328.9,6.8,100);bx(.6,.7,.7,'#fff',-327.9,6.8,100);
  [[-300,164],[-292,164]].forEach(([x,z])=>{xgPrism(G,3,3,5,12,'#e8ecf0',x,0,z);xgPrism(G,3.1,3.1,.4,12,'#ff6b4a',x,2,z)});
  for(let x=-460;x<=-270;x+=38){bx(.3,9,.3,'#6b7078',x,4.5,126);bx(2.4,.5,1,'#3a4552',x,9.2,126);bx(2,.2,.7,'*fff5c8',x,8.9,126)}
  for(let x=-470;x<-262;x+=12)bx(.3,.25,.3,'*7ab8ff',x,.12,128.2);
  /* parked ground vehicles at the apron and stairs */
  [[-410,118],[-372,119]].forEach(([x,z])=>{bx(2,1.4,3.6,'#f5c542',x,.8,z);bx(1.8,.7,1.4,'#1b2533',x,1.7,z+.5)});
  flush(G,og)}

 /* ---------- inside ---------- */
 function decorIn(g){
  const G=xgNew(),u=v=>AX+v,w=v=>AZ+v,bx=(W,H,D,c,x,y,z,tc)=>xgBox(G,W,H,D,c,u(x),y,w(z),0,tc),col=(a,b,c,d)=>APT.cols.push([u(a),w(b),u(c),w(d)]);
  /* compass rose floor logo, landside centre */
  plane(g,15,15,u(36),.045,w(46),0,-Math.PI/2,(c,W,H)=>{c.clearRect(0,0,W,H);const cx=W/2,cy=H/2,R=W*.47;
   c.fillStyle='#0b2a5b';c.beginPath();c.arc(cx,cy,R,0,7);c.fill();c.fillStyle='#16408a';c.beginPath();c.arc(cx,cy,R*.9,0,7);c.fill();
   c.strokeStyle='#ffd84a';c.lineWidth=H*.012;c.beginPath();c.arc(cx,cy,R*.9,0,7);c.stroke();c.beginPath();c.arc(cx,cy,R*.55,0,7);c.stroke();
   for(let i=0;i<8;i++){const a=i*Math.PI/4,L=i%2?R*.62:R*.88;c.fillStyle=i%2?'#7fb2dd':'#ffd84a';c.beginPath();c.moveTo(cx+Math.cos(a-.2)*R*.12,cy+Math.sin(a-.2)*R*.12);c.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L);c.lineTo(cx+Math.cos(a+.2)*R*.12,cy+Math.sin(a+.2)*R*.12);c.fill()}
   c.fillStyle='#fff';c.font='bold '+H*.07+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText('FERNFIELD',cx,cy+R*.74)},{tr:1});
  /* central garden ring around the rose (collision on the planter only) */
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const x=36+a*7.4,z=46+b*7.4;bx(2.6,.7,2.6,'#8a8f98',x,.35,z,'#b9bec6');tree(bx,x,z,.85,(a+b)?'#2e8b57':'#3aa066');col(x-1.3,z-1.3,x+1.3,z+1.3)});
  [[36,38.4,0],[36,53.6,0]].forEach(([x,z])=>{bx(4,.45,.9,'#6b4a32',x,.23,z);bx(4,.7,.2,'#4a3324',x,.68,z+(z<46?-.4:.4));col(x-2,z-.5,x+2,z+.5)});
  /* guide lines on the floor: landside to security, airside to gates */
  bx(.2,.03,8,'*ffd84a',32,.03,31);bx(.2,.03,8,'*ffd84a',40,.03,31);
  bx(.2,.03,12,'*7fd4ff',18,.035,18);bx(.2,.03,12,'*7fd4ff',54,.035,18);
  /* skyline mural on the landside left wall and a plant wall near the doors */
  plane(g,22,3.6,u(.08),2.6,w(24),Math.PI/2,0,(c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#5aa9ff');gr.addColorStop(1,'#ffd9a8');c.fillStyle=gr;c.fillRect(0,0,W,H);
   c.fillStyle='#16408a';for(let x=0,i=0;x<W;x+=W/22,i++){const h=H*(.25+((i*37)%50)/100);c.fillRect(x,H-h,W/22-3,h)}c.fillStyle='#2e8b57';c.beginPath();c.arc(W*.14,H,H*.4,Math.PI,0);c.arc(W*.86,H,H*.5,Math.PI,0);c.fill();
   c.fillStyle='#fff';c.font='bold '+H*.16+'px '+FONT;c.textAlign='center';c.fillText('WELCOME TO FERNFIELD',W/2,H*.2)});
  bx(.6,3.2,10,'#2e8b57',.4,1.6,50,'#3aa066');for(let i=0;i<9;i++)bx(.2,.4,.7,'#7fd49a',.78,.6+(i%3)*.9,45.6+i*1.1);
  /* airside: lounge planters between the seat rows, charging posts, plant strips along the gates */
  [[36,19],[36,26]].forEach(([x,z])=>{bx(3,.6,1.6,'#8a8f98',x,.3,z,'#b9bec6');tree(bx,x,z,.7);col(x-1.5,z-.8,x+1.5,z+.8)});
  [[16,11],[56,11]].forEach(([x,z])=>{bx(6,.5,1.2,'#8a8f98',x,.25,z,'#b9bec6');for(let i=0;i<4;i++)bx(.9,.9,.9,'#2e8b57',x-2.4+i*1.6,.95,z)});
  for(let i=1;i<=6;i++){const a=6+12*(i-1);bx(.1,1.1,.1,'#cfd5dc',a-5.6,.55,9);bx(.3,.18,.3,'*2fe68a',a-5.6,1.15,9)}
  /* trolleys, vending machines, ATM, lockers, bins, rope queues */
  [[3.5,40],[3.5,44],[30,40.4]].forEach(([x,z])=>{bx(1.2,.1,.8,'#9aa3ad',x,.55,z);bx(.08,.8,.8,'#9aa3ad',x-.55,.95,z);bx(1.1,.04,.7,'#cfd5dc',x,.9,z)});
  [[70.4,44,'#ff6b4a'],[70.4,46.2,'#2d5a8d']].forEach(([x,z,c])=>{bx(1,2,1.6,c,x,1,z,'#fff');bx(.1,1.2,1.1,'*aee4ff',x-.52,1.2,z);col(x-.5,z-.8,x+.5,z+.8)});
  bx(.9,1.9,1.1,'#0b2a5b',70.4,.95,48.6,'#16408a');bx(.1,.4,.8,'*2fe68a',70.04,1.5,48.6);col(70,48,70.9,49.2);
  for(let i=0;i<6;i++)bx(.9,2,.9,i%2?'#ff6b4a':'#7fb2dd',3.6+i*.95,1,34.6,'#fff');col(3,34,9.4,35.2);
  [[28.5,39],[44,39],[28,16],[46,16]].forEach(([x,z])=>{bx(.55,.9,.55,'#566270',x,.45,z);bx(.65,.12,.65,'#2b3440',x,.95,z)});
  [[5.5,41.2],[10.5,41.2],[15.5,41.2],[20.5,41.2]].forEach(([x,z])=>{bx(.1,.8,.1,'#c9a24a',x-1.5,.4,z+3.2);bx(.1,.8,.1,'#c9a24a',x+1.5,.4,z+3.2);bx(3,.06,.06,'#a8212b',x,.7,z+3.2)});
  flush(G,g)}

 setInterval(()=>safe(()=>{
  if(typeof APT!='object'||!APT)return;
  if(!outDone&&APT.og){outDone=1;decorOut(APT.og)}
  if(!inDone&&APT.grp){inDone=1;decorIn(APT.grp)}
 },'build'),600);
})();
