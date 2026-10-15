/* ===== v26.40.0: detailed tower floors =====
   Every floor of Skyline Tower, Pulse Records HQ, Aurora Residences and Nova Mall is rebuilt with themed furniture and
   props, textured floors and walls, window walls that look out over the city (a painted skyline that changes with the
   height of the floor and turns to lit windows at night), hanging ceiling lights and glass meeting rooms and studios.
   The floor keeps its size, its elevator, its staff and their "Talk to" spots, the way out on the ground floor and the
   meeting spots (Skyline floor 5, Pulse floor 3). Each floor is merged into a few meshes (plus glass, signs and the
   view) so it stays fast. Floor coordinates: x 0..22 (left wall at x=0), z 0..16 (back wall at z=0); the camera looks
   from +x +z, so the back and left walls are the ones you see. */

const TFGLM=new THREE.MeshLambertMaterial({color:'#d4f0ff',transparent:true,opacity:.24,depthWrite:false});
const TFTX={},TFNV=[],TFAN=[];
/* dk() can overflow bright colours into the next channel: clamp first */
const dkc=(c,f)=>{const k=new THREE.Color(c).multiplyScalar(f);return'#'+new THREE.Color(Math.min(1,k.r),Math.min(1,k.g),Math.min(1,k.b)).getHexString()};
function tfCan(w,h,f,smooth){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f(x,w,h);const t=new THREE.CanvasTexture(c);
 if(smooth){t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter}else t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}

/* ---- the city seen through the windows: lvl 1 = street level, higher floors look down over the rooftops ---- */
function tfCity(lvl,pal,night,seed){const k=['c',lvl,pal,night,seed].join();if(TFTX[k])return TFTX[k];
 return TFTX[k]=tfCan(512,96,(x,W,H)=>{const r=mb(seed*131+lvl*17+7),F=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
  const sk=night?['#070b24','#151c46','#2e2a5a']:pal=='sunset'?['#46508e','#c8789a','#ffc27a']:['#4f95db','#8fc1ec','#d6ebf8'];
  const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,sk[0]);gr.addColorStop(.62,sk[1]);gr.addColorStop(1,sk[2]);x.fillStyle=gr;x.fillRect(0,0,W,H);
  if(night){for(let i=0;i<70;i++)F(r()<.3?'#ffffff':'#9aa6e0',r()*W,r()*H*.55,1,1);F('#f6f0d0',W*.8,7,8,8);F(sk[0],W*.8+3,6,6,6)}
  else{if(pal=='sunset'){x.fillStyle='#fff2b8';x.beginPath();x.arc(W*.68,H*.6,10,0,7);x.fill();x.fillStyle='rgba(255,220,150,.35)';x.beginPath();x.arc(W*.68,H*.6,18,0,7);x.fill()}
   for(let i=0;i<7;i++){const cx=r()*W,cy=3+r()*H*.3,cw=18+r()*44;F(pal=='sunset'?'rgba(255,214,190,.7)':'rgba(255,255,255,.78)',cx,cy,cw,4);F(pal=='sunset'?'rgba(255,230,210,.5)':'rgba(255,255,255,.55)',cx+6,cy-3,cw*.55,3)}}
  const WC=night?['#ffd27a','#ffe9a8','#ffb86a','#9ad4ff']:pal=='sunset'?['#ffcf8a','#f0a080','#c87a8a']:['#bcd8ee','#9cc0de','#e2f0fa'],DW=night?'#1a1e36':pal=='sunset'?'#5a4660':'#6f8aa6';
  const tower=(bx,bw,top,col,lit,step)=>{F(col,bx,top,bw,H-top);F(dkc(col,1.18),bx,top,bw,1);if(bw>10&&r()<.4)F(dkc(col,.8),bx+bw*.35,top-4,bw*.3,4);if(bw>12&&r()<.3)F(dkc(col,.7),bx+bw/2,top-9,1,5);
   for(let wy=top+3;wy<H-1;wy+=step)for(let wx=bx+2;wx<bx+bw-2;wx+=3){const on=night?r()<lit:r()<.75;F(on?WC[(r()*WC.length)|0]:DW,wx,wy,2,step>3?2:1)}};
  if(lvl<=1){/* street level: shops across the road, the pavement, the road with cars, the near kerb */
   let bx=-4;while(bx<W){const bw=26+r()*40,top=r()*18,col=['#b5654a','#c9b79a','#8a6a5a','#d9d2c2','#6b7684','#a07a5a'][(r()*6)|0];F(col,bx,top,bw,58-top);
    for(let wy=top+4;wy<44;wy+=7)for(let wx=bx+3;wx<bx+bw-4;wx+=7)F(night?(r()<.5?WC[0]:'#2a2a3a'):'#9cc0de',wx,wy,4,4);
    const aw=['#c0392b','#2f6fb5','#2a8a4a','#e6b422','#8e44ad','#e84a8a'][(r()*6)|0];F(night?'#ffe7b0':'#3a4a5a',bx+3,48,bw-6,10);F(aw,bx+1,45,bw-2,3);for(let s=bx+1;s<bx+bw-2;s+=4)F('#ffffff',s,45,2,3);F(dkc(col,.6),bx,58,bw,1);bx+=bw+1}
   F('#9aa0a6',0,59,W,6);for(let s=0;s<W;s+=12)F('#8a9096',s,59,1,6);F('#3a3f46',0,65,W,22);for(let s=4;s<W;s+=26)F('#e8e8e8',s,75,12,1);F('#b0b5ba',0,87,W,9);F('#7a8086',0,87,W,1);
   for(let i=0;i<9;i++){const cx=r()*W,cy=r()<.5?67:77,cc=['#c0392b','#2f6fb5','#f4f4f4','#1a1a1a','#e6b422','#2a8a4a'][(r()*6)|0];F(cc,cx,cy+2,22,6);F(dkc(cc,.75),cx+5,cy-1,12,4);F(night?'#3a4a6a':'#9cc8e8',cx+6,cy,10,2);F('#111',cx+3,cy+7,4,2);F('#111',cx+15,cy+7,4,2);if(night){F('#fff2b0',cx+20,cy+4,2,2);F('#ff4040',cx,cy+4,1,2)}}
   for(let s=30;s<W;s+=90){F('#2a2a2a',s,40,1,20);F('#2a2a2a',s,40,5,1);F(night?'#fff2b0':'#c8c8c8',s+4,41,2,2);if(night){x.fillStyle='rgba(255,230,160,.18)';x.fillRect(s-4,42,14,18)}}
   return}
  const hz=H*(.16+lvl*.07);/* far skyline top */
  if(lvl>=5){F(night?'#141a3a':pal=='sunset'?'#8a6a8a':'#8fb0c8',0,hz+6,W,H);F(night?'#1c2448':pal=='sunset'?'#e0a090':'#a8c8dc',0,hz+6,W,1)}
  let bx=-6;while(bx<W){const bw=8+r()*18;tower(bx,bw,hz-r()*H*.14,night?'#1e2444':pal=='sunset'?'#9a7a96':'#9db2c6',.3,3);bx+=bw+r()*3}
  bx=-6;while(bx<W){const bw=12+r()*22;tower(bx,bw,hz+6+r()*H*.16-(lvl<=3?H*.2:0),night?'#262c4e':pal=='sunset'?'#7a5a76':'#7d93aa',.35,4);bx+=bw+2+r()*8}
  bx=-10;while(bx<W){const bw=20+r()*34;tower(bx,bw,hz+H*.2+r()*H*.22-(lvl<=3?H*.35:0),night?'#2e3456':pal=='sunset'?'#5e4864':'#5f7690',.4,4);bx+=bw+6+r()*26}})}
/* abstract paintings, gold and platinum records, boards with lines of text */
function tfArtTex(s){const k='a'+s;if(TFTX[k])return TFTX[k];return TFTX[k]=tfCan(48,36,(x,W,H)=>{const r=mb(s*977+3),P=[['#e84a8a','#ffe066','#4a90d9','#2a2a3a','#f4ece0'],['#ff7a3a','#7a4ad9','#fff0c0','#1e2a3a','#3fbfa0'],['#4ad9c0','#e6b422','#c0392b','#f4f4f4','#2a3a5a'],['#2a5a8a','#e8a77c','#6fb36a','#f2e6d0','#111111'],['#d94a4a','#f2c14e','#2b6f8a','#f6f1e7','#1b1b1b']][s%5],F=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a|0,b|0,w|0,h|0)},st=(s>>2)%5;
  F(P[3+(s%2)],0,0,W,H);
  if(st==0)for(let i=0;i<7;i++)F(P[(r()*5)|0],r()*W*.8,r()*H*.8,6+r()*20,4+r()*16);
  else if(st==1){F(P[2],0,0,W,H*.55);x.fillStyle=P[0];x.beginPath();x.arc(W*.7,H*.35,6,0,7);x.fill();F(P[1],0,H*.55,W,H);for(let i=0;i<W;i+=2)F(P[4],i,H*.5+Math.sin(i*.3+s)*3,2,H)}
  else if(st==2)for(let i=0;i<6;i++){x.fillStyle=P[(i+s)%5];x.beginPath();x.arc(r()*W,r()*H,4+r()*10,0,7);x.fill()}
  else if(st==3)for(let i=0;i<W;i+=6)F(P[(i/6+s)%5],i,0,4,H);
  else{F(P[2],0,0,W,H);x.fillStyle=P[0];x.beginPath();x.arc(W/2,H*.38,7,0,7);x.fill();F(P[0],W/2-10,H*.6,20,H*.4);F(P[1],W/2-12,H*.85,24,3)}})}
function tfDiscTex(pl){const k='d'+pl;if(TFTX[k])return TFTX[k];return TFTX[k]=tfCan(40,52,(x,W,H)=>{const F=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)},g=pl?'#dfe4ea':'#e6b422',gd=pl?'#9aa2ac':'#a87a12';
 F(pl?'#c9a227':'#c9a227',0,0,W,H);F('#141418',2,2,W-4,H-4);x.fillStyle=gd;x.beginPath();x.arc(W/2,19,14,0,7);x.fill();x.fillStyle=g;x.beginPath();x.arc(W/2,19,13,0,7);x.fill();
 x.strokeStyle=gd;for(const rr of[11,9,7]){x.beginPath();x.arc(W/2,19,rr,0,7);x.stroke()}x.fillStyle=pl?'#2a5a9a':'#c0392b';x.beginPath();x.arc(W/2,19,4,0,7);x.fill();F('#fff',W/2-1,18,2,2);
 F('#e6d8b0',7,38,W-14,9);F('#8a7a50',10,40,W-20,1);F('#8a7a50',12,43,W-24,1)})}
function tfBoard(title,lines,fg,bg,ac,w,h){const k='b'+title+lines.join('|')+fg+bg;if(TFTX[k])return TFTX[k];
 return TFTX[k]=tfCan(512,Math.round(512*h/w/32)*32||64,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.strokeStyle=ac;x.lineWidth=8;x.strokeRect(4,4,W-8,H-8);
  const n=lines.length+1.6,lh=H/n;x.textAlign='center';x.textBaseline='middle';x.fillStyle=ac;x.font='bold '+Math.floor(lh*.62)+'px "Trebuchet MS",Verdana,sans-serif';x.fillText(title,W/2,lh*.85);
  x.fillStyle=fg;x.font=Math.floor(lh*.5)+'px "Trebuchet MS",Verdana,sans-serif';lines.forEach((t,i)=>{const p=t.split('|');if(p.length>1){x.textAlign='left';x.fillText(p[0],W*.08,lh*(i+1.95));x.textAlign='right';x.fillText(p[1],W*.92,lh*(i+1.95));x.textAlign='center'}else x.fillText(t,W/2,lh*(i+1.95))})},1)}
/* animated water */
function tfWaterTex(c1,c2){const k='w'+c1+c2;if(TFTX[k])return TFTX[k];const t=tfCan(32,32,(x,W,H)=>{x.fillStyle=c1;x.fillRect(0,0,W,H);const r=mb(77);for(let i=0;i<26;i++){x.fillStyle=r()<.6?c2:'#ffffff';x.fillRect((r()*W)|0,(r()*H)|0,2+((r()*5)|0),1)}});TFAN.push([t,.05,.03]);return TFTX[k]=t}

/* ---- extra floor and wall textures (the rest come from ixTex in 55-interiors.js) ---- */
function tfTex(kind,a,b,rx,ry){if(!['terrazzo','rubber','herring','grass','deck','mosaic','hex','slab'].includes(kind))return ixTex(kind,a,b,rx,ry);
 const t=tfCan(64,64,(x)=>{const r=mb(hs(kind+a+b)),F=(c,X,Y,W,H)=>{x.fillStyle=c;x.fillRect(X,Y,W,H)};F(a,0,0,64,64);
  if(kind=='terrazzo'){for(let k=0;k<120;k++)F([b,'#ffffff',ixShade(a,.75),'#c9a27a','#8a9aa8'][k%5],(r()*64)|0,(r()*64)|0,1+((r()*2)|0),1+((r()*2)|0));F(ixShade(a,.85),0,0,64,1);F(ixShade(a,.85),0,0,1,64)}
  else if(kind=='rubber'){for(let k=0;k<260;k++)F(r()<.5?b:ixShade(a,1.25),(r()*64)|0,(r()*64)|0,1,1);F(ixShade(a,.7),0,0,64,1);F(ixShade(a,.7),0,0,1,64);F(ixShade(a,.7),0,32,64,1);F(ixShade(a,.7),32,0,1,64)}
  else if(kind=='herring'){for(let i=-2;i<10;i++)for(let j=-2;j<10;j++){const X=i*8+j*8,Y=j*8-i*8;const c=(i+j)%2?a:ixShade(a,.9+((i*7+j*3)%5)*.04);for(let s=0;s<16;s++){F(c,(X+s)&63,(Y+s)&63,1,8);}F(b,(X)&63,(Y)&63,1,8)}}
  else if(kind=='grass'){for(let k=0;k<300;k++)F(r()<.5?b:ixShade(a,1.2),(r()*64)|0,(r()*64)|0,1,2)}
  else if(kind=='deck'){for(let y=0;y<64;y+=8){F(ixShade(a,.92+((y/8)%3)*.06),0,y,64,7);F(b,0,y+7,64,1);F(b,((y*13)%48)+8,y,1,7)}}
  else if(kind=='mosaic'){for(let i=0;i<16;i++)for(let j=0;j<16;j++)F(r()<.25?b:ixShade(a,.92+r()*.16),i*4,j*4,3,3)}
  else if(kind=='slab'){for(let k=0;k<5;k++){let X=(r()*64)|0,Y=(r()*64)|0;for(let q=0;q<22;q++){F(ixShade(a,.9),X&63,Y&63,1,1);X+=r()<.6?1:0;Y+=r()<.5?1:-1}}for(let k=0;k<30;k++)F(ixShade(a,1.04),(r()*64)|0,(r()*64)|0,2,1);F(b,0,0,64,1);F(b,0,0,1,64);F(b,0,32,64,1)}
  else if(kind=='hex'){for(let j=0;j<4;j++)for(let i=0;i<4;i++){const X=i*16+(j%2)*8,Y=j*16;F(ixShade(a,.94+((i+j)%3)*.04),X+1,Y+1,14,14);F(b,X,Y,16,1);F(b,X,Y,1,16)}}});
 t.repeat.set(rx,ry);return new THREE.MeshLambertMaterial({map:t})}

/* ---- the floor builder: boxes are pushed into lists and merged at the end ---- */
function tfK(g,o){const L=[],E=[],G=[],K={g,o};
 K.b=(w,h,d,c,x,y,z)=>{(c[0]=='*'?E:L).push([w,h,d,c[0]=='*'?'#'+c.slice(1):c,o+x,y,320+z])};
 K.gl=(w,h,d,x,y,z)=>G.push([w,h,d,'#ffffff',o+x,y,320+z]);
 K.cl=(a,b,c,d)=>twc(o,a,b,c,d);
 K.add=(m,x,y,z,ry)=>{m.position.set(o+x,y,320+z);if(ry)m.rotation.y=ry;g.add(m);return m};
 /* a box in a facing frame: dr 0 faces +z, 1 faces +x, 2 faces -z, 3 faces -x; u = sideways, v = forward */
 K.ob=(x,z,dr,lw,h,ld,c,u,y,v)=>{const p=dr==0?[u,v]:dr==1?[v,-u]:dr==2?[-u,-v]:[-v,u];dr%2?K.b(ld,h,lw,c,x+p[0],y,z+p[1]):K.b(lw,h,ld,c,x+p[0],y,z+p[1])};
 K.ocl=(x,z,dr,lw,ld)=>{const hw=(dr%2?ld:lw)/2,hd=(dr%2?lw:ld)/2;K.cl(x-hw,z-hd,x+hw,z+hd)};
 K.done=()=>{if(L.length)g.add(new THREE.Mesh(ixGeo(L),ixMat(0)));if(E.length)g.add(new THREE.Mesh(ixGeo(E),ixMat(1)));if(G.length){const m=new THREE.Mesh(ixGeo(G),TFGLM);m.renderOrder=3;g.add(m)}};
 return K}

/* ---- furniture and props ---- */
function tfSofa(K,x,z,dr,w,c,pil){const o=(...a)=>K.ob(x,z,dr,...a),d2=dkc(c,.8),l=dkc(c,1.1);
 o(w,.3,.9,d2,0,.25,0);o(w,.52,.22,d2,0,.66,-.34);[-1,1].forEach(s=>o(.2,.62,.9,d2,s*(w/2-.1),.31,0));
 const n=Math.max(1,Math.round((w-.4)/.8)),cw=(w-.4)/n;for(let i=0;i<n;i++){const u=-w/2+.2+cw*(i+.5);o(cw-.04,.14,.66,l,u,.47,.08);o(cw-.06,.4,.16,c,u,.73,-.17)}
 [-1,1].forEach(s=>{o(.06,.1,.06,'#2a2018',s*(w/2-.12),.05,.36);o(.06,.1,.06,'#2a2018',s*(w/2-.12),.05,-.36)});
 if(pil&&w>1.4){o(.34,.3,.1,pil,-(w/2-.42),.68,-.03);o(.34,.3,.1,pil,w/2-.42,.68,-.03)}K.ocl(x,z,dr,w,.9)}
function tfChair(K,x,z,dr,c,leg){const o=(...a)=>K.ob(x,z,dr,...a);o(.46,.07,.46,c,0,.46,0);o(.44,.48,.06,dkc(c,.85),0,.75,-.2);[[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]].forEach(q=>o(.05,.43,.05,leg||'#2a2a2a',q[0],.215,q[1]))}
function tfOChair(K,x,z,dr,c){const o=(...a)=>K.ob(x,z,dr,...a);o(.56,.04,.07,'#222',0,.05,0);o(.07,.04,.56,'#222',0,.05,0);o(.06,.34,.06,'#666',0,.24,0);o(.5,.09,.48,c,0,.46,0);o(.46,.54,.08,c,0,.84,-.22);o(.3,.06,.06,'#222',0,.62,-.2);o(.05,.2,.3,'#222',-.27,.58,0);o(.05,.2,.3,'#222',.27,.58,0)}
function tfStool(K,x,z,c,h){h=h||.75;K.b(.4,.06,.4,c,x,h,z);K.b(.42,.03,.42,dkc(c,.8),x,h-.04,z);K.b(.06,h-.06,.06,'#888',x,(h-.06)/2,z);K.b(.36,.03,.36,'#888',x,.26,z);K.b(.3,.03,.3,'#555',x,.015,z)}
function tfDesk(K,x,z,dr,w,top,scr){const o=(...a)=>K.ob(x,z,dr,...a);o(w,.05,.75,top,0,.75,0);[-1,1].forEach(s=>o(.05,.72,.66,'#3a3f46',s*(w/2-.06),.36,0));o(w-.14,.3,.03,dkc(top,.8),0,.52,-.33);
 o(.62,.38,.05,'#15171c',0,1.1,-.2);o(.56,.31,.02,scr||'*7fc8ff',0,1.11,-.17);o(.06,.16,.06,'#333',0,.86,-.22);o(.24,.02,.16,'#333',0,.785,-.22);o(.44,.02,.14,'#e8e8e8',0,.785,.07);o(.06,.03,.09,'#e8e8e8',.32,.79,.08)}
function tfRug(K,x,z,w,d,c,bc,st){K.b(w,.02,d,bc||dkc(c,.7),x,.012,z);K.b(w-.24,.022,d-.24,c,x,.016,z);if(st)for(let i=1;i<4;i++)K.b(w-.5,.024,.06,st,x,.018,z-d/2+d*i/4)}
function tfCTable(K,x,z,w,d,c,leg){K.b(w,.06,d,c,x,.42,z);K.b(w-.1,.04,d-.1,dkc(c,.8),x,.12,z);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>K.b(.06,.4,.06,leg||'#2a2a2a',x+q[0]*(w/2-.06),.2,z+q[1]*(d/2-.06)));
 K.b(.3,.04,.22,'#e84a8a',x-w*.22,.47,z);K.b(.28,.04,.2,'#f4f4f4',x-w*.2,.51,z+.02);K.b(.1,.14,.1,'#f4f4f4',x+w*.22,.52,z-.05);K.cl(x-w/2,z-d/2,x+w/2,z+d/2)}
function tfRTable(K,x,z,r,c,h,leg){h=h||.76;K.b(r*2,.05,r*1.2,c,x,h,z);K.b(r*1.2,.05,r*2,c,x,h,z);K.b(r*1.7,.05,r*1.7,c,x,h,z);K.b(.08,h-.04,.08,leg||'#333',x,h/2,z);K.b(r*1.1,.03,.12,leg||'#333',x,.015,z);K.b(.12,.03,r*1.1,leg||'#333',x,.015,z);K.cl(x-r,z-r,x+r,z+r)}
function tfLamp(K,x,z,sh){K.b(.34,.04,.34,'#2a2a2a',x,.02,z);K.b(.05,1.45,.05,'#2a2a2a',x,.75,z);K.b(.44,.34,.44,sh||'#f0e6d0',x,1.6,z);K.b(.32,.04,.32,'*fff2c8',x,1.78,z);K.cl(x-.2,z-.2,x+.2,z+.2)}
function tfTree(K,x,z,s,pot){s=s||1;const p=pot||'#d9d2c2';K.b(.62*s,.5*s,.62*s,p,x,.25*s,z);K.b(.66*s,.06*s,.66*s,dkc(p,.8),x,.5*s,z);K.b(.5*s,.04,.5*s,'#4a3320',x,.53*s,z);K.b(.08*s,1.2*s,.08*s,'#6b4a2e',x,1.1*s,z);
 [[0,1.9,0,1],[-.18,1.55,.12,.8],[.2,1.65,-.1,.75],[.05,2.3,.05,.62]].forEach((q,i)=>K.b(.7*s*q[3],.5*s*q[3],.7*s*q[3],['#2e7d32','#3a8f3e','#43a047','#57b45a'][i],x+q[0]*s,q[1]*s,z+q[2]*s));K.cl(x-.32*s,z-.32*s,x+.32*s,z+.32*s)}
function tfShelf(K,x,z,dr,w,h,c,n,items){const o=(...a)=>K.ob(x,z,dr,...a);o(w,h,.06,dkc(c,.8),0,h/2,-.17);[-1,1].forEach(s=>o(.05,h,.4,c,s*(w/2-.025),h/2,0));const r=mb(hs(''+x+z+w));
 for(let i=0;i<=n;i++){const y=.04+i*(h-.08)/n;o(w-.06,.04,.38,c,0,y,0);if(i<n){let u=-w/2+.1;while(u<w/2-.15){const iw=.06+r()*.12,ih=Math.min((h-.08)/n-.08,.18+r()*.14);o(iw,ih,.24,items[(r()*items.length)|0],u+iw/2,y+.02+ih/2,0);u+=iw+.01+(r()<.15?.15:0)}}}K.ocl(x,z,dr,w,.42)}
function tfPlant(K,x,z,s,pot){ixPlant(K.b,K.cl,x,z,s,pot)}
/* thin things on the back wall (z=0) or the left wall (x=0) */
function tfOnB(K,x,y,w,h,c,d){K.b(w,h,d||.05,c,x,y,(d||.05)/2+.01)}
function tfOnL(K,z,y,w,h,c,d){K.b(d||.05,h,w,c,(d||.05)/2+.01,y,z)}
function tfPic(K,x,y,w,h,s,side,fc){/* a framed abstract painting */const m=new THREE.Mesh(new THREE.PlaneGeometry(w-.14,h-.14),new THREE.MeshLambertMaterial({map:tfArtTex(s)}));
 if(side){tfOnL(K,x,y,w,h,fc||'#2a2018',.06);K.add(m,.08,y,x,Math.PI/2)}else{tfOnB(K,x,y,w,h,fc||'#2a2018',.06);K.add(m,x,y,.08)}}
function tfSign(K,t,fg,bg,w,h,x,y,op,side,z){const s=ixSign(t,fg,bg,w,h,op);if(side){K.b(.04,h+.08,w+.08,dkc(bg,.6),.03,y,x);K.add(s,.06,y,x,Math.PI/2)}else{K.b(w+.08,h+.08,.04,dkc(bg,.6),x,y,(z||0)+.03);K.add(s,x,y,(z||0)+.06)}return s}
function tfBoardM(K,tex,w,h,x,y,side,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));if(side){K.b(.05,h+.1,w+.1,'#2a2a2a',.03,y,x);K.add(m,.07,y,x,Math.PI/2)}else{K.b(w+.1,h+.1,.05,'#2a2a2a',x,y,(z||0)+.03);K.add(m,x,y,(z||0)+.07)}}
function tfDisc(K,x,y,pl,side,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(.62,.8),new THREE.MeshLambertMaterial({map:tfDiscTex(pl)}));if(side){tfOnL(K,x,y,.7,.88,'#c9a227',.04);K.add(m,.07,y,x,Math.PI/2)}else{K.b(.7,.88,.04,'#c9a227',x,y,(z||0)+.03);K.add(m,x,y,(z||0)+.06)}}
/* city window: along the left wall (side 1, a0..a1 in z) or the back wall (a0..a1 in x), from y0 to y1 */
function tfWin(K,side,a0,a1,lvl,pal,y0,y1,fr){y0=y0==null?.2:y0;y1=y1||3.2;fr=fr||'#3a3f46';const w=a1-a0,h=y1-y0,c=(a0+a1)/2,seed=(K.o|0)+(side?3:0);
 const mk=(n)=>{const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv,k=w/16,s0=((a0*7)%16)/16;for(let i=0;i<uv.count;i++)uv.setX(i,s0+uv.getX(i)*k);const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tfCity(lvl,pal,n,seed%5),transparent:!!n,opacity:n?0:1,depthWrite:!n}));
  if(side)K.add(m,.1+n*.005,(y0+y1)/2,c,Math.PI/2);else K.add(m,c,(y0+y1)/2,.1+n*.005);return m};
 mk(0);const nm=mk(1);TFNV.push([nm.material,K.g]);
 const bar=(p,q,a,hh,yy,d)=>side?K.b(d||.08,hh,a,fr,.14,yy,p):K.b(a,hh,d||.08,fr,p,yy,.14);
 bar(c,0,w+.12,.1,y0,.14);bar(c,0,w+.12,.1,y1,.12);if(h>2.2)bar(c,0,w,.05,y1-.55,.06);const n=Math.max(1,Math.round(w/1.6));for(let i=0;i<=n;i++)bar(a0+w*i/n,0,.08,h,(y0+y1)/2)}
/* glass partitions with frames, an optional door gap [g0,g1], and collisions */
function tfGlassX(K,x0,x1,z,h,g0,g1){h=h||2.6;const segs=g0==null?[[x0,x1]]:[[x0,g0],[g1,x1]];segs.forEach(([a,b])=>{if(b-a<.05)return;const w=b-a,n=Math.max(1,Math.round(w/1.5));K.gl(w,h-.12,.04,(a+b)/2,h/2,z);K.b(w,.06,.1,'#5a6068',(a+b)/2,.03,z);K.b(w,.06,.1,'#5a6068',(a+b)/2,h,z);for(let i=0;i<=n;i++)K.b(.06,h,.08,'#5a6068',a+w*i/n,h/2,z);K.b(w,.12,.045,'*eef6fb',(a+b)/2,1.1,z+.002);K.cl(a,z-.1,b,z+.1)});if(g0!=null){K.b(g1-g0+.12,.1,.1,'#5a6068',(g0+g1)/2,h,z)}}
function tfGlassZ(K,x,z0,z1,h,g0,g1){h=h||2.6;const segs=g0==null?[[z0,z1]]:[[z0,g0],[g1,z1]];segs.forEach(([a,b])=>{if(b-a<.05)return;const w=b-a,n=Math.max(1,Math.round(w/1.5));K.gl(.04,h-.12,w,x,h/2,(a+b)/2);K.b(.1,.06,w,'#5a6068',x,.03,(a+b)/2);K.b(.1,.06,w,'#5a6068',x,h,(a+b)/2);for(let i=0;i<=n;i++)K.b(.08,h,.06,'#5a6068',x,h/2,a+w*i/n);K.b(.045,.12,w,'*eef6fb',x+.002,1.1,(a+b)/2);K.cl(x-.1,a,x+.1,b)});if(g0!=null){K.b(.1,.1,g1-g0+.12,'#5a6068',x,h,(g0+g1)/2)}}
/* hanging lights: a linear panel (along x, or along z with vz), a pendant, a cluster chandelier */
function tfPanel(K,x,z,w,vz,c){const W=vz?.3:w,D=vz?w:.3;K.b(W,.06,D,'#d8dce0',x,3.0,z);K.b(W-.06,.02,D-.06,c||'*f4fbff',x,2.965,z);[-1,1].forEach(s=>vz?K.b(.04,.4,.04,'#333',x,3.22,z+s*w*.4):K.b(.04,.4,.04,'#333',x+s*w*.4,3.22,z))}
function tfPend(K,x,z,sh,c,y,s){y=y||2.75;s=s||1;K.b(.05,3.4-y,.05,'#222',x,(3.4+y)/2,z);K.b(.42*s,.2*s,.42*s,sh||'#2a2a2a',x,y+.1*s,z);K.b(.3*s,.08*s,.3*s,dkc(sh||'#2a2a2a',1.3),x,y+.24*s,z);K.b(.3*s,.05,.3*s,c||'*ffe6a8',x,y-.01,z)}
function tfChand(K,x,z,c,y){y=y||2.6;K.b(.05,3.4-y-.3,.05,'#c9a227',x,(3.4+y+.3)/2,z);K.b(.9,.06,.9,'#c9a227',x,y+.3,z);for(let k=0;k<8;k++){const a=k*Math.PI/4;K.b(.08,.26,.08,c||'*fff6d0',x+Math.cos(a)*.4,y+.12,z+Math.sin(a)*.4);K.b(.05,.05,.05,'#c9a227',x+Math.cos(a)*.4,y+.27,z+Math.sin(a)*.4)}K.b(.22,.34,.22,c||'*fff6d0',x,y+.05,z);K.b(.12,.16,.12,c||'*fff6d0',x,y-.18,z)}
function tfTrack(K,x0,x1,z,n){K.b(x1-x0,.05,.06,'#222',(x0+x1)/2,3.25,z);for(let i=0;i<n;i++){const x=x0+(x1-x0)*(i+.5)/n;K.b(.04,.12,.04,'#222',x,3.17,z);K.b(.12,.14,.14,'#2a2a2a',x,3.06,z-.04);K.b(.09,.03,.09,'*fff2c8',x,2.985,z-.08)}}
/* other props */
function tfTV(K,x,y,w,side,col,z){const h=w*.56;if(side){K.b(.08,h+.08,w+.08,'#111',.05,y,x);K.b(.02,h-.04,w-.04,col||'*3a6a9a',.1,y,x);K.b(.02,h*.3,w*.4,'*7fc8ff',.115,y+h*.1,x-w*.15)}else{K.b(w+.08,h+.08,.08,'#111',x,y,(z||0)+.05);K.b(w-.04,h-.04,.02,col||'*3a6a9a',x,y,(z||0)+.1);K.b(w*.4,h*.3,.02,'*7fc8ff',x-w*.15,y+h*.1,(z||0)+.115)}}
function tfMic(K,x,z,c){K.b(.4,.03,.06,'#222',x,.015,z);K.b(.06,.03,.4,'#222',x,.015,z);K.b(.03,1.45,.03,'#555',x,.72,z);K.b(.03,.03,.36,'#555',x,1.44,z+.16);K.b(.1,.16,.1,c||'#888',x,1.44,z+.36);K.b(.12,.06,.12,'#333',x,1.44,z+.36);K.b(.18,.18,.02,'#222',x,1.46,z+.48)}
function tfDrums(K,x,z,c){c=c||'#c0392b';K.b(.56,.5,.46,c,x,.3,z);K.b(.5,.44,.02,'#f4f4f4',x,.3,z+.235);K.b(.3,.22,.3,c,x-.4,.62,z+.15);K.b(.26,.03,.26,'#f4f4f4',x-.4,.74,z+.15);K.b(.28,.14,.28,c,x-.05,.86,z-.05);K.b(.28,.14,.28,c,x+.25,.86,z-.05);K.b(.36,.3,.36,c,x+.48,.5,z+.2);K.b(.32,.03,.32,'#f4f4f4',x+.48,.66,z+.2);
 [[-.62,1.2,-.1],[.62,1.35,-.15],[-.75,.98,.32]].forEach(q=>{K.b(.02,q[1],.02,'#888',x+q[0],q[1]/2,z+q[2]);K.b(.44,.02,.44,'#e6b422',x+q[0],q[1],z+q[2])});K.b(.32,.05,.32,'#222',x+.05,.5,z-.6);K.b(.04,.45,.04,'#888',x+.05,.25,z-.6);K.cl(x-.9,z-.8,x+.8,z+.5)}
function tfAmp(K,x,z,dr,s){s=s||1;K.ob(x,z,dr,.7*s,.6*s,.36*s,'#1a1a1a',0,.3*s,0);K.ob(x,z,dr,.6*s,.36*s,.02,'#3a3a3a',0,.24*s,.18*s);K.ob(x,z,dr,.62*s,.1*s,.02,'#c9a227',0,.52*s,.18*s);K.ocl(x,z,dr,.7*s,.36*s)}
function tfGuitar(K,x,z,c){K.b(.2,.02,.2,'#222',x,.01,z);K.b(.03,.5,.03,'#222',x,.25,z);K.b(.4,.46,.1,c,x,.6,z);K.b(.3,.2,.1,dkc(c,1.15),x,.93,z);K.b(.12,.12,.11,'#111',x,.62,z);K.b(.06,.62,.05,'#3a2a1a',x,1.36,z);K.b(.1,.16,.05,'#1a1a1a',x,1.74,z)}
function tfConsole(K,x,z,w){/* a mixing desk facing +z (the engineer stands on the +z side) */K.b(w,.78,1.2,'#2a2a34',x,.39,z);K.b(w+.1,.06,1.3,'#3a3a46',x,.8,z);K.b(w,.42,.28,'#1a1a22',x,1.04,z-.5);
 const r=mb(hs('cn'+x+z));for(let i=0;i<Math.floor(w/.14);i++){const u=x-w/2+.1+i*.14;K.b(.05,.02,.36,'#888',u,.84,z+.18);K.b(.07,.04,.07,'#ddd',u,.86,z+.05+r()*.28);for(let j=0;j<3;j++)K.b(.05,.03,.05,['#e6b422','#4a90d9','#e84a4a','#2fe68a'][(i+j)%4],u,.85,z-.18-j*.1);K.b(.05,.16*(.3+r()*.7),.01,['*4aff6a','*ffe04a','*ff4a4a'][(i%9)>6?2:(i%9)>4?1:0],u,1.05,z-.355)}K.cl(x-w/2-.05,z-.65,x+w/2+.05,z+.65)}
function tfMonitor(K,x,y,z,s){s=s||1;K.b(.34*s,.48*s,.32*s,'#1a1a1a',x,y,z);K.b(.2*s,.2*s,.02,'#3a3a3a',x,y-.08*s,z+.165*s);K.b(.1*s,.1*s,.02,'#555',x,y+.14*s,z+.165*s)}
function tfRack(K,x,z){K.b(.6,1.5,.55,'#1a1a22',x,.75,z);for(let i=0;i<7;i++){K.b(.54,.14,.02,i%2?'#2a2a34':'#3a3a46',x,.3+i*.17,z+.28);K.b(.04,.04,.01,['*4aff6a','*ffe04a','*ff4a4a','*4ab0ff'][i%4],x-.2,.3+i*.17,z+.29)}K.cl(x-.3,z-.28,x+.3,z+.28)}
function tfBottles(K,x,z,w,y,n){const C=['#3f8f5a','#c0392b','#e6b422','#2f6fb5','#8e44ad','#e8e8ec','#7a4a2e','#d9a441'];for(let i=0;i<n;i++){const c=C[(i*5)%8];K.b(.09,.26,.09,c,x-w/2+.1+i*(w-.2)/(n-1||1),y+.13,z);K.b(.04,.08,.04,dkc(c,.7),x-w/2+.1+i*(w-.2)/(n-1||1),y+.3,z)}}
function tfBed(K,x,z,dr,w,c,sheet){const o=(...a)=>K.ob(x,z,dr,...a);o(w,.3,2.1,dkc(c,.7),0,.2,0);o(w-.08,.18,2,sheet||'#f4f4f4',0,.44,0);o(w,.9,.12,dkc(c,.85),0,.6,-1.04);o(w-.1,.04,1.3,c,0,.54,.36);o(w-.1,.26,.12,c,0,.44,1.03);[-1,1].forEach(s=>o(w/2-.15,.14,.4,'#ffffff',s*w/4,.6,-.78));K.ocl(x,z,dr,w,2.2)}
function tfMat(K,x,z,c){K.b(1.6,.012,.6,c,x,.008,z)}
/* an escalator climbing from z1 (floor) to z0 (ceiling) at x */
function tfEsc(K,x,z0,z1,w){w=w||1.1;const n=16,dz=(z1-z0)/n,dy=3.4/n;for(let i=0;i<n;i++){const z=z1-dz*(i+.5),y=dy*(i+.5);K.b(w,dy,dz,i%2?'#8a9096':'#9aa0a6',x,y,z);K.b(w,.02,.04,'#e6b422',x,y+dy/2,z+dz/2-.02);[-1,1].forEach(s=>{K.b(.12,dy+.9,dz,'#c8ced4',x+s*(w/2+.06),y+.45,z);K.gl(.04,.75,dz,x+s*(w/2+.06),y+dy/2+.75,z);K.b(.1,.06,dz,'#222',x+s*(w/2+.06),y+dy/2+1.15,z)})}
 K.b(w+.4,.04,.9,'#b0b6bc',x,.02,z1+.45);for(let i=0;i<6;i++)K.b(.04,.045,.6,'#8a9096',x-w/2+.1+i*(w-.2)/5,.025,z1+.45);K.cl(x-w/2-.15,z0,x+w/2+.15,z1)}

/* ---- per tower and floor: floor and wall textures and the window walls ---- */
const TFS={
 'Skyline Tower':{1:{fl:['slab','#ece6da','#c9c0ae'],wl:['panel','#d9d2c2','#cbc3b0']},2:{fl:['plank','#a87a4e','#6b4a2e'],wl:['brick','#b8705a','#e2d0bc']},3:{fl:['carpet','#5a6270','#4f5764'],wl:['panel','#e4e8ec','#cfd6dc']},4:{fl:['herring','#b58a5e','#7a5a3a'],wl:['stripe','#ddd0c4','#cdbcae']},
  5:{fl:['carpet','#2a2538','#241f31'],wl:['foam','#3a2f55','#2c2442']},6:{fl:['concrete','#d8d6d0','#cbc8c0'],wl:['plaster','#f4f2ec','#e8e5dc']},7:{fl:['plank','#4a3320','#2e1f12'],wl:['panel','#2b2438','#221c2e']},8:{fl:['grass','#4f9a4a','#47883f'],wl:['block','#bdb4a2','#a89f8a']}},
 'Pulse Records HQ':{1:{fl:['slab','#26262f','#3a3a46'],wl:['panel','#22222e','#1a1a24']},2:{fl:['carpet','#5f6876','#555d6a'],wl:['panel','#d4d9e0','#c2c8d0']},3:{fl:['carpet','#2a2538','#221e30'],wl:['foam','#2b2540','#221d36']},4:{fl:['concrete','#e8e8ec','#d8d8de'],wl:['plaster','#f4f4f4','#e6e6e6']},5:{fl:['herring','#5a3e26','#3a2614'],wl:['panel','#3a2c20','#2c2018']}},
 'Aurora Residences':{1:{fl:['slab','#f2eee2','#d8cfb8'],wl:['panel','#e8e2d2','#d9d0bc']},2:{fl:['rubber','#3a3f46','#2e3238'],wl:['panel','#dfe8ec','#c8d4da']},3:{fl:['mosaic','#e4eef2','#c8dbe2'],wl:['mosaic','#bfe4f0','#a8d4e4']},4:{fl:['plank','#b08a5e','#8a6a48'],wl:['plaster','#f0e6dc','#e4d8cc']}},
 'Nova Mall':{1:{fl:['terrazzo','#e8dcc0','#c9b890'],wl:['tile','#f0e0c8','#e4d2b6']},2:{fl:['tile','#f6f2f4','#e8e0e6'],wl:['plaster','#f4eef2','#e8dfe6']},3:{fl:['hex','#1f2634','#2c3648'],wl:['panel','#1f2a3a','#18212e']}}};
{const tb0=twBase;twBase=function(g,o,n,T){const n0=g.children.length;tb0(g,o,n,T);try{const sp=(TFS[T.nm]||{})[n];if(!sp)return;const roof=n==T.roof,wh=roof?.9:3.4;
 for(let i=g.children.length-1;i>=n0;i--){const m=g.children[i],p=m.isMesh&&m.geometry&&m.geometry.parameters;if(!p)continue;const k=[p.width,p.height,p.depth].map(v=>+(+v).toFixed(2)).join(',');
  if(k=='22,0.2,16')m.material=tfTex(sp.fl[0],sp.fl[1],sp.fl[2],11,8);
  else if(k==`22,${wh},0.3`)m.material=tfTex(sp.wl[0],sp.wl[1],sp.wl[2],22,wh);
  else if(k==`0.3,${wh},16`)m.material=tfTex(sp.wl[0],sp.wl[1],sp.wl[2],16,wh);
  /* the old small sky windows: the new floors bring their own window walls */
  else if(roof&&k=='0.3,0.4,0.15')g.remove(m);
  else if(m.position.y>.8&&m.position.y<2.8&&['3,1.7,0.05','3.15,0.08,0.08','0.06,1.7,0.08','0.05,1.7,3','0.08,0.08,3.15','0.08,1.7,0.06'].includes(k))g.remove(m)}
 /* low walls along the open front and right side (the ground floor keeps a gap for the doors) */
 if(!roof){const K=tfK(g,o),c=dkc(T.wl[n],.8);(n==1?[[0,9.3],[12.7,22]]:[[0,22]]).forEach(([a,b])=>{K.b(b-a,.5,.18,c,(a+b)/2,.25,15.95);K.b(b-a+.04,.06,.26,dkc(c,1.25),(a+b)/2,.53,15.95)});K.b(.18,.5,16,c,21.95,.25,8);K.b(.26,.06,16.04,dkc(c,1.25),21.95,.53,8);
  if(n==1){K.b(3.4,.02,.3,'#8a9096',11,.012,15.9);[9.3,12.7].forEach(x=>{K.b(.14,.6,.3,'#8a9096',x,.3,15.95)})}K.done()}}catch(e){console.error('tower floor base',e)}}}

/* merge the remaining plain boxes of a floor (walls, elevator, clouds...) into one mesh per material kind */
function tfMerge(g){const L=[],E=[],rm=[];g.children.forEach(m=>{if(!m.isMesh||!m.geometry||m.geometry.type!='BoxGeometry'||m.rotation.x||m.rotation.y||m.rotation.z)return;const mt=m.material;if(!mt||mt.map||mt.transparent||!mt.color||mt.vertexColors)return;
 const p=m.geometry.parameters;(mt.isMeshBasicMaterial?E:L).push([p.width*m.scale.x,p.height*m.scale.y,p.depth*m.scale.z,'#'+mt.color.getHexString(),m.position.x,m.position.y,m.position.z]);rm.push(m)});
 rm.forEach(m=>g.remove(m));if(L.length)g.add(new THREE.Mesh(ixGeo(L),ixMat(0)));if(E.length)g.add(new THREE.Mesh(ixGeo(E),ixMat(1)))}
{const bt0=buildTF;buildTF=function(T){bt0(T);try{if(TFS[T.nm])(T.groups||[]).forEach(tfMerge)}catch(e){console.error('tower merge',e)}}}
/* the night view fades in through the windows, the pool water moves */
{const u0=update;update=function(dt){u0(dt);if(!IN||!TW||!TW.groups||IN.i!==TW.idx)return;const t=S.t||0,f=t<240?0:t<300?(t-240)/60*.5:t<330?.5+(t-300)/30*.5:1;
 for(const q of TFNV)if(q[1].visible&&Math.abs(q[0].opacity-f)>.004)q[0].opacity=f;for(const a of TFAN){a[0].offset.x=(a[0].offset.x+a[1]*dt)%1;a[0].offset.y=(a[0].offset.y+a[2]*dt)%1}}}

/* ================= Skyline Tower ================= */
const TFB={};
TFB['Skyline Tower']=[
/* 1 Lobby: three lifts, directory, reception desk, two lounges, security gates, columns, a glass front onto the street */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,1.2,14.8,1,'day',.2,3.1,'#8a8f96');
 [6.2,15.8].forEach((x,i)=>{tfOnB(K,x,1.45,3.2,2.9,'#9aa0a8',.12);b(1.45,2.4,.06,'#c4ccd4',x-.74,1.2,.15);b(1.45,2.4,.06,'#d0d7de',x+.74,1.2,.15);b(.04,2.4,.07,'#555',x,1.2,.16);b(.9,.28,.05,'#111',x,2.75,.15);b(.5,.12,.02,'*ff8a30',x,2.75,.18);
  const bx=i?17.75:4.4;b(.3,.46,.06,'#222',bx,1.3,.06);b(.1,.1,.03,'*ffd27a',bx,1.4,.1);b(.1,.1,.03,'*ffd27a',bx,1.22,.1);INT.push({x:o+x,z:322.4,r:1.5,l:'Use elevator',a:elevMenu})});
 tfBoardM(K,tfBoard('SKYLINE TOWER',TOWERS[0].names.map((f,i)=>(i+1)+'|'+f),'#f4f0e0','#1e2430','#f6d77a',2.1,2),2.1,2,2.2,1.75);
 tfPic(K,19.9,1.8,2.6,1.6,11);
 b(4.4,.02,3.6,'#c9a227',11,.01,2.2);b(4.2,.022,3.4,'#e8e2d4',11,.014,2.2);
 [[4.5,6.5],[17.5,6.5]].forEach(q=>{b(.9,3.4,.9,'#ece6d8',q[0],1.7,q[1]);b(1.1,.3,1.1,'#c9a227',q[0],.15,q[1]);b(1.1,.24,1.1,'#c9a227',q[0],3.28,q[1]);b(.94,.04,.94,'#d8d0bc',q[0],1.2,q[1]);K.cl(q[0]-.55,q[1]-.55,q[0]+.55,q[1]+.55)});
 [8.5,13.5].forEach(x=>{b(.26,1.05,1.3,'#b8bec6',x,.525,5.6);b(.2,.04,1.1,'*7aff9a',x,1.07,5.6);K.gl(.5,.8,.04,x+(x<11?.38:-.38),.75,5.6);K.cl(x-.15,4.9,x+.15,6.3)});
 /* reception: wooden front with slats and a gold strip, stone top, a raised ledge, the name lit on the front */
 tfRug(K,11,10.4,8.4,3.6,'#8a2a3e','#5a1a28','#a8384e');
 b(6,.98,1.1,'#5a3a22',11,.49,10.2);for(let i=0;i<14;i++)b(.12,.86,.04,i%2?'#6b4a2e':'#4a2f1c',8.25+i*.42,.5,10.77);b(6,.08,.06,'#c9a227',11,.94,10.78);b(6.3,.08,1.3,'#f2ede2',11,1.02,10.2);b(6.3,.22,.3,'#f2ede2',11,1.17,10.72);b(6.34,.04,.34,'#c9a227',11,1.29,10.72);
 tfSign(K,'SKYLINE','#f6d77a','#3a2614',1.9,.36,11,.56,{border:'#c9a227'},0,10.8);
 [9.6,12.4].forEach(x=>{b(.62,.4,.05,'#15171c',x,1.38,10.05);b(.1,.16,.1,'#333',x,1.14,10.05)});b(.18,.08,.18,'#c9a227',13.4,1.1,10.4);b(.16,.24,.16,'#e8f4fa',8.4,1.18,10.4);[[-.05,'#e84a8a'],[.06,'#ffe066'],[0,'#f4f4f4']].forEach((q,i)=>b(.12,.12,.12,q[1],8.4+q[0],1.36+i*.04,10.4+q[0]));
 K.cl(7.9,9.6,14.1,10.95);
 twKeep(g,o,11,8.7,{hair:5,hc:2,eyes:0,mouth:0,top:2,tc:1,pc:0,skin:1,body:.35},'Lena (receptionist)',()=>say('Lena: "Welcome to Skyline Tower! Cafe on 2, offices on 3, studios on 5, gallery on 6, lounge on 7."'),3.9);
 /* two lounges */
 [[1.6,6,'#7a1f3a','#e6b422'],[16,20.4,'#2a4a7a','#f4f0e0']].forEach(q=>{tfRug(K,(q[0]+q[1])/2,13,5.6,3.8,dkc(q[2],1.3),dkc(q[2],.7));tfSofa(K,q[0],13,1,2.8,q[2],q[3]);tfSofa(K,q[1],12.2,3,1.1,q[2]);tfSofa(K,q[1],13.8,3,1.1,q[2]);tfCTable(K,(q[0]+q[1])/2-.2,13,1.2,1.6,'#3a2a1a','#c9a227')});
 tfLamp(K,2.6,15.1);tfLamp(K,16.6,15.1);
 tfTree(K,.9,.9,1.1,'#ece6d8');tfTree(K,21.1,.9,1.1,'#ece6d8');tfTree(K,.9,15.1,1,'#ece6d8');tfTree(K,21.1,15.1,1,'#ece6d8');
 tfChand(K,11,10.2,null,2.55);[7.3,14.7].forEach(x=>tfPend(K,x,4,'#c9a227','*fff2c8',2.85,.9));tfPend(K,4.6,13,'#2a2a2a','*ffe6a8',2.8);tfPend(K,17.6,13,'#2a2a2a','*ffe6a8',2.8);
 INT.push({x:o+11,z:335,r:1.6,l:'Leave tower',a:leaveShop});K.done()},
/* 2 Cafe Floor: counter with espresso machine and pastry case, chalk menus, bistro tables, a window bar */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,.6,15.4,2,'day');
 b(6.5,1,1.2,'#4a2f1c',17.25,.5,3.3);for(let i=0;i<13;i++)b(.24,.88,.04,i%2?'#5a3a22':'#3e2716',14.25+i*.5,.5,3.92);b(6.7,.08,1.36,'#e8e0d0',17.25,1.04,3.3);K.cl(13.9,2.6,20.6,4);
 b(.9,.56,.55,'#c0c4c8',14.7,1.36,3.2);b(.9,.1,.55,'#c0392b',14.7,1.69,3.2);b(.8,.08,.06,'#222',14.7,1.2,3.48);[14.45,14.95].forEach(x=>{b(.07,.14,.07,'#333',x,1.12,3.46);b(.12,.1,.12,'#f4f4f4',x,1.13,3.58)});b(.26,.42,.26,'#2a2a2a',15.6,1.29,3.1);b(.2,.16,.2,'#6b4a2e',15.6,1.58,3.1);
 b(1.6,.5,.8,'#6b4a2e',19.4,1.33,3.3);K.gl(1.5,.4,.7,19.4,1.33,3.3);[['#e8b04a',18.9],['#7a4a2e',19.25],['#f4d0e0',19.6],['#e8b04a',19.95]].forEach(q=>{b(.2,.1,.2,q[0],q[1],1.16,3.4);b(.2,.08,.2,q[0],q[1]+.06,1.36,3.2)});b(1.5,.04,.7,'*fff6e0',19.4,1.56,3.3);
 b(.36,.22,.3,'#333',17.2,1.19,3.1);b(.3,.06,.02,'*7aff9a',17.2,1.26,3.26);b(.14,.2,.14,'#cfe9ff',16.6,1.18,3.5);for(let i=0;i<4;i++)b(.12,.12,.12,'#f4f4f4',17.9+i*.02,1.14+i*.12,3.0);
 [1.7,2.3].forEach(y=>{b(6.4,.05,.36,'#6b4a2e',17.25,y,.2);for(let i=0;i<10;i++)b(.18,.22,.18,['#f4f4f4','#c9a27a','#e8b04a','#7a4a2e','#cfe9ff'][(i+Math.round(y*10))%5],14.4+i*.62,y+.14,.2)});
 [[15.1,'COFFEE',['Espresso|2.5','Latte|4','Flat white|4']],[17.25,'TEA',['Chai latte|4','Matcha|4.5','Mint tea|3']],[19.4,'CAKES',['Brownie|3','Croissant|2.5','Cheesecake|4']]].forEach(q=>tfBoardM(K,tfBoard(q[1],q[2],'#f4e8c8','#22302a','#ffe7a8',1.9,.95),1.9,.95,q[0],2.92));
 twKeep(g,o,17.25,2.0,{hair:6,hc:6,eyes:1,mouth:0,top:0,tc:3,pc:3,skin:3,body:.4},'Mina (barista)',()=>twBuy('Fresh latte',5,15),3.4);
 [15.5,17.25,19].forEach(x=>tfPend(K,x,3.3,'#2f6b4f','*ffd98a',2.55,.8));
 /* window bar with stools */
 b(.5,.06,13,'#6b4a2e',.4,1.04,8.5);b(.08,1,13,'#4a2f1c',.6,.5,8.5);for(let z=2.6;z<15;z+=1.3)tfStool(K,1.2,z,'#2f6b4f',.78);K.cl(0,2,.7,15);
 /* bistro tables */
 [[4.2,6.2],[7.4,7.6],[4.2,10.4],[7.4,12],[14.6,8.4],[18.2,8.4],[14.6,12.4],[18.2,12.4]].forEach((q,i)=>{tfRTable(K,q[0],q[1],.45,i%2?'#e8e0d0':'#2a2a2a',.76,'#2a2a2a');tfChair(K,q[0]-.72,q[1],1,'#6b4a2e');tfChair(K,q[0]+.72,q[1],3,'#6b4a2e');b(.12,.12,.12,'#f4f4f4',q[0]-.1,.84,q[1]+.05);b(.06,.16,.06,'#2e8b57',q[0]+.12,.86,q[1]-.1);tfPend(K,q[0],q[1],'#2f6b4f','*ffd98a',2.7,.7)});
 tfSign(K,'SKYLINE CAFE','#ffe7a8','#3a2416',3,.5,3.6,2.65,{glow:'#ffb050',ff:'Georgia,serif'});tfPic(K,3.6,1.6,2.2,1.2,7);
 b(1.2,.9,.6,'#4a2f1c',6.6,.45,.4);b(1.24,.05,.64,'#e8e0d0',6.6,.92,.4);b(.3,.4,.3,'#cfe9ff',6.3,1.15,.4);b(.4,.1,.3,'#c9a27a',6.9,1,.4);K.cl(5.95,.05,7.25,.75);
 b(3.6,.07,1.1,'#8a5a36',10.8,.98,11.6);b(3.4,.95,.9,'#4a2f1c',10.8,.475,11.6);for(let i=0;i<4;i++){tfStool(K,9.6+i*.8,10.6,'#c0392b',.8);tfStool(K,9.6+i*.8,12.6,'#c0392b',.8)}b(.14,.3,.14,'#e8f4fa',10.8,1.17,11.6);b(.24,.2,.24,'#ffe066',10.8,1.4,11.6);K.cl(8.95,11.05,12.65,12.15);[9.6,12].forEach(x=>tfPend(K,x,11.6,'#c9a227','*ffd98a',2.6,.8));
 tfPlant(K,21.2,15.2,1,'#c0392b');tfPlant(K,12.4,15.1,.9,'#c0392b');tfTree(K,21.1,6,1,'#c0392b');K.done()},
/* 3 Offices: desk pods with monitors, a glass meeting room, a focus room, printer, water cooler */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,.6,15.4,3,'day');
 const SC=['*7fc8ff','*9fe0b0','*ffd27a','*c8b0ff','*ff9fb0'];let k=0;
 [4.8,9.2,13.4].forEach(cz=>{b(4.4,.36,.05,'#7a8a9a',4.6,1.0,cz);b(4.4,.06,.07,'#5a6068',4.6,1.2,cz);[3.1,4.6,6.1].forEach(cx=>{tfDesk(K,cx,cz-.45,2,1.45,'#e8e2d8',SC[k++%5]);tfDesk(K,cx,cz+.45,0,1.45,'#e8e2d8',SC[k++%5]);tfOChair(K,cx,cz-1.2,0,'#334455');tfOChair(K,cx,cz+1.2,2,'#334455');b(.24,.1,.18,['#e84a8a','#ffe066','#4ad9c0'][k%3],cx+.5,.83,cz-.6);b(.1,.12,.1,'#f4f4f4',cx-.5,.84,cz+.6)});K.cl(2.3,cz-.9,6.9,cz+.9);tfPanel(K,4.6,cz,4)});
 /* meeting room */
 b(7.4,.02,6.8,'#3a4a5e',17.95,.012,3.75);tfGlassZ(K,14.2,.3,7.2,2.7);tfGlassX(K,14.2,21.7,7.2,2.7,14.5,15.6);
 b(4.2,.07,1.4,'#6b4a2e',18,.76,3.9);b(.5,.72,.5,'#2a2a2a',16.8,.36,3.9);b(.5,.72,.5,'#2a2a2a',19.2,.36,3.9);K.cl(15.8,3.1,20.2,4.7);for(let i=0;i<3;i++){tfOChair(K,16.6+i*1.4,2.8,0,'#2a3a5a');tfOChair(K,16.6+i*1.4,5.0,2,'#2a3a5a')}b(.3,.04,.3,'#222',18,.81,3.9);
 tfTV(K,18,1.8,2.6);tfBoardM(K,tfBoard('Q3 PLAN',['Release single','Tour dates','Socials push'],'#2a3a5a','#f8f8f8','#e84a4a',1.6,1.1),1.6,1.1,15.6,1.7);tfSign(K,'MEETING ROOM','#ffffff','#2a3a5a',1.8,.3,18,2.86,{},0,7.12);tfPanel(K,18,3.9,3.4);
 /* focus room */
 tfGlassZ(K,18.6,9.4,12.8,2.6);tfGlassX(K,18.6,21.7,12.8,2.6,18.8,19.9);tfSofa(K,20.6,11.1,3,1.1,'#c0392b');b(.5,.5,.5,'#e8e2d8',19.6,.25,10);tfLamp(K,21.2,9.8,'#ffe9a8');
 /* printer, cooler, cabinets, plants, clock */
 b(.9,.9,.7,'#e8e8ec',15.4,.45,15.1);b(.8,.2,.6,'#cfd3d8',15.4,1,15.1);b(.3,.02,.2,'#f4f4f4',15.3,1.11,15.2);b(.1,.04,.04,'*7aff9a',15.7,.92,15.46);K.cl(14.95,14.75,15.85,15.45);
 b(.5,1.1,.5,'#f4f4f4',13.2,.55,15.2);b(.4,.45,.4,'#6ad5ff',13.2,1.33,15.2);K.cl(12.95,14.95,13.45,15.45);
 b(.92,1.3,.62,'#8a949e',9.6,.65,15);for(let j=0;j<3;j++)b(.7,.02,.02,'#6a7580',9.6,.35+j*.4,15.32);K.cl(9.15,14.7,10.05,15.3);
 tfTree(K,12.4,8.6,.9,'#e8e2d8');tfPlant(K,7.9,15.2,.8,'#e8e2d8');tfPlant(K,1.1,1,.9,'#e8e2d8');
 b(.5,.5,.04,'#222',6.5,2.6,.04);b(.42,.42,.02,'#f4f4f4',6.5,2.6,.07);b(.03,.16,.01,'#222',6.5,2.66,.085);b(.12,.03,.01,'#222',6.55,2.6,.085);
 tfBoardM(K,tfBoard('TEAM BOARD',['Mon: demos','Wed: mix review','Fri: release'],'#2a2a2a','#f6e9b8','#c0392b',2.4,1.3),2.4,1.3,3.6,1.7);K.done()},
/* 4 Apartments: doors to the flats, a hallway runner, a residents' lounge and dining corner */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,4,15.4,4,'day');
 tfRug(K,11,1.6,21,1.5,'#7a2a3a','#c9a27a','#9a3a4a');
 [[2.4,'401'],[5.6,'402'],[16.4,'403'],[19.6,'404']].forEach((q,i)=>{const x=q[0],c=i%2?'#5a3a22':'#7a4a2e';tfOnB(K,x,1.25,1.4,2.5,'#f4f1ea',.1);b(1.12,2.24,.06,c,x,1.14,.14);b(.9,.85,.02,dkc(c,1.15),x,1.62,.18);b(.9,.85,.02,dkc(c,1.15),x,.62,.18);b(.1,.1,.06,'#e6b422',x+.42,1.1,.2);b(.05,.05,.03,'#222',x,1.62,.2);tfSign(K,q[1],'#f6d77a','#2a2018',.5,.22,x,2.68,{},0);tfMat(K,x,.62,'#6b4a2e')});
 [4,18].forEach(x=>{b(1.2,.06,.4,'#6b4a2e',x,.86,.22);b(.06,.82,.06,'#4a2f1c',x-.5,.43,.08);b(.06,.82,.06,'#4a2f1c',x+.5,.43,.08);b(.16,.3,.16,'#e8f4fa',x-.3,1.04,.2);b(.14,.14,.14,'#e84a8a',x-.3,1.24,.2);b(.7,.9,.04,'#c9a227',x,1.85,.04);b(.6,.8,.02,'*dcecf4',x,1.85,.07);ixLampW(K.b,x-.9,2.1,0,'*ffe6a8')});
 /* vending machine and extinguisher by the lift */
 b(1,1.9,.8,'#c0392b',7.4,.95,.5);b(.6,1.3,.02,'*cfe9ff',7.3,1.15,.91);for(let i=0;i<4;i++)for(let j=0;j<3;j++)b(.12,.18,.02,['#e84a4a','#4a90d9','#ffe066','#2fe68a'][(i+j)%4],7.1+j*.2,.7+i*.3,.92);b(.2,.5,.02,'#222',7.75,1.1,.92);K.cl(6.9,.1,7.9,.9);
 b(.18,.5,.18,'#d0202a',13.9,.6,.15);b(.3,.4,.04,'#d0202a',13.9,1.2,.03);
 /* residents' lounge */
 tfRug(K,4.6,10.4,6,4.6,'#c9b8a0','#8a6a48','#b8a488');tfSofa(K,2,10.4,1,3,'#4a6a8a','#e6b422');tfSofa(K,7.2,9.4,3,1.1,'#c9a27a');tfSofa(K,7.2,11.4,3,1.1,'#c9a27a');tfCTable(K,4.6,10.4,1.2,1.8,'#6b4a2e');tfLamp(K,1.9,13.3,'#f0e6d0');tfLamp(K,1.9,7.6,'#f0e6d0');
 tfShelf(K,4.6,6.2,0,3,1.1,'#6b4a2e',2,['#c0392b','#2f6fb5','#e6b422','#3f8f5a','#f4f4f4','#8e44ad']);
 /* dining corner */
 tfRug(K,16.6,10.4,4.4,3.4,'#2a3a4a','#1a2632');b(2.4,.06,1.1,'#8a5a36',16.6,.76,10.4);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>b(.07,.73,.07,'#4a2f1c',16.6+q[0]*1.1,.365,10.4+q[1]*.45));K.cl(15.4,9.85,17.8,10.95);[15.9,17.3].forEach(x=>{tfChair(K,x,9.6,0,'#c9a27a','#4a2f1c');tfChair(K,x,11.2,2,'#c9a27a','#4a2f1c')});b(.2,.24,.2,'#f4f4f4',16.6,.91,10.4);b(.3,.2,.3,'#e84a8a',16.6,1.12,10.4);tfPend(K,16.6,10.4,'#c9a227','*fff2c8',2.5,1.1);
 b(.5,.85,2.6,'#6b4a2e',21.4,.43,10.4);b(.54,.05,2.64,'#3a2a1a',21.4,.87,10.4);b(.2,.3,.2,'#4a90d9',21.4,1.05,9.6);b(.3,.36,.06,'#c9a227',21.5,1.08,11.2);K.cl(21.1,9.1,21.7,11.7);
 /* front: bench, plants, a parcel shelf */
 b(2.4,.45,.6,'#6b4a2e',11,.23,14.8);b(2.4,.08,.5,'#c9a27a',11,.5,14.8);K.cl(9.8,14.5,12.2,15.1);tfPlant(K,8.6,15.1,.9,'#d9d2c2');tfPlant(K,13.4,15.1,.9,'#d9d2c2');tfTree(K,21.1,15,1,'#d9d2c2');tfTree(K,1,1,1,'#d9d2c2');
 b(2,1.6,.5,'#8a6a48',1.4,.8,15.4);for(let i=0;i<3;i++){b(1.9,.04,.46,'#6b4a2e',1.4,.4+i*.5,15.4);for(let j=0;j<4;j++)b(.34,.26,.3,['#c9a27a','#a8835a','#e8d8b8'][(i+j)%3],.75+j*.44,.55+i*.5,15.4)}K.cl(.4,15.1,2.4,15.7);
 [5,11,17].forEach(x=>tfPanel(K,x,1.6,2.4));tfPend(K,4.6,10.4,'#2a2a2a','*ffe6a8',2.7,1.1);K.done()},
/* 5 Recording Floor: live room and control room behind glass, a vocal booth, and the lounge where artists wait */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,12,15.6,5,'day');
 /* live room */
 b(7.5,.02,6.6,'#8a5a36',4.1,.012,3.6);for(let i=0;i<10;i++)b(.03,.024,6.6,'#6b4a2e',.6+i*.75,.014,3.6);tfGlassX(K,.3,7.9,7,2.8,6.4,7.6);tfGlassZ(K,7.9,.3,7,2.8);
 for(let i=0;i<5;i++)for(let j=0;j<3;j++)b(.9,.6,.08+((i+j)%3)*.06,['#8a5a36','#a0703e','#6b4a2e'][(i*2+j)%3],1.1+i*1.4,1.1+j*.7,.08);
 tfDrums(K,2.2,2.6,'#2a5a9a');tfMic(K,4.8,4.3);tfMic(K,6,2.4,'#c9a227');tfAmp(K,6.9,1,0,1.1);tfGuitar(K,7.3,2.4,'#e6b422');tfGuitar(K,7.3,3.3,'#c0392b');
 b(1.4,.08,.4,'#1a1a1a',3.6,.86,5.6);for(let i=0;i<10;i++)b(.1,.03,.32,'#f4f4f4',3.03+i*.13,.91,5.62);[3.05,4.15].forEach(x=>b(.05,.82,.36,'#333',x,.41,5.6));K.cl(2.8,5.3,4.4,5.9);
 [1,6].forEach(x=>{b(.9,1.7,.12,'#5a3a6a',x,.95,6.3);b(.8,1.6,.04,'#7a5a8a',x,.95,6.24);b(.3,.04,.3,'#222',x,.02,6.3)});tfSign(K,'LIVE ROOM','#ffffff','#2a2030',1.6,.3,4.1,2.95,{},0);b(.5,.3,.12,'#222',6.6,2.95,.08);b(.4,.2,.04,'*ff2a2a',6.6,2.95,.15);
 tfTrack(K,1,7.4,3.4,4);
 /* control room */
 b(7.5,.02,6.6,'#3a3046',17.9,.012,3.6);tfGlassZ(K,14.1,.3,7,2.8);tfGlassX(K,14.1,21.7,7,2.8,14.3,15.5);
 tfConsole(K,18,3.1,4.6);[17,19].forEach(x=>{b(.7,.44,.05,'#111',x,1.42,2.7);b(.62,.36,.02,x<18?'*7fc8ff':'*b07aff',x,1.42,2.73)});
 [15.6,20.4].forEach(x=>{b(.3,1,.3,'#333',x,.5,2.2);tfMonitor(K,x,1.24,2.2,1)});[16,20].forEach(x=>{b(.9,1.1,.5,'#1a1a1a',x,2.25,.3);b(.4,.4,.02,'#3a3a3a',x,2.15,.56);b(.18,.18,.02,'#555',x,2.55,.56)});
 tfRack(K,14.8,.6);tfRack(K,21.2,.7);tfOChair(K,18.9,4.2,2,'#2a2a2a');tfSofa(K,18.2,6.3,2,2.6,'#3a3046');
 twKeep(g,o,17,4.6,{hair:12,hc:3,eyes:5,mouth:3,top:1,tc:7,pc:2,skin:5,body:.45},'Dex (engineer)',()=>say('Dex: "Great takes come from the timing bar. Hit green and the line climbs. Upgrade your gear at home for better sound."'),3.0);
 tfSign(K,'CONTROL ROOM','#ffffff','#2a2030',1.9,.3,18,2.95,{},0);b(.9,.36,.06,'#111',20.6,2.95,.06);tfSign(K,'ON AIR','#ffffff','#d0202a',.8,.28,20.6,2.95,{glow:'#ff6060'},0,.04);tfPanel(K,18,3.4,3);
 /* vocal booth */
 tfGlassZ(K,3.2,8,11.2,2.6);tfGlassX(K,.3,3.2,11.2,2.6,1.2,2.3);b(2.9,.02,3.2,'#4a3a5a',1.75,.012,9.6);tfMic(K,1.7,8.8,'#c9a227');b(.5,.04,.4,'#222',1.7,1.15,9.6);b(.03,1.1,.03,'#555',1.7,.58,9.6);b(.3,.2,.12,'#1a1a1a',2.6,1.4,8.2);b(.08,.6,.6,'#5a3a6a',.4,1.2,9.6);
 /* road cases and gold records */
 [[20.9,8.8],[20.9,10.2]].forEach((q,i)=>{b(1,.7+i*.2,1,'#1a1a1a',q[0],.35+i*.1,q[1]);b(1.02,.06,1.02,'#9aa0a6',q[0],.7+i*.2,q[1]);b(.3,.2,.02,['#e84a8a','#ffe066'][i],q[0]-.2,.4,q[1]+.51);K.cl(q[0]-.5,q[1]-.5,q[0]+.5,q[1]+.5)});
 tfDisc(K,4.6,1.9,0,1);tfDisc(K,5.6,1.9,1,1);tfDisc(K,6.6,1.9,0,1);
 /* lounge: two sofas either side of the rug from 55-interiors, side tables, a neon sign */
 tfSofa(K,4.3,13.9,1,3,'#5a3a7a','#e84a8a');tfSofa(K,17.7,13.9,3,3,'#5a3a7a','#4ad9c0');[[4.3,11.8],[17.7,11.8]].forEach(q=>{b(.5,.5,.5,'#2a2538',q[0],.25,q[1]);b(.2,.2,.2,'#e6b422',q[0],.6,q[1]);K.cl(q[0]-.25,q[1]-.25,q[0]+.25,q[1]+.25)});
 tfSign(K,'STUDIO 5','#ffffff','#1a1420',2.4,.5,9.4,2.4,{glow:'#ff4da6',border:'#ff4da6'},1);tfPend(K,4.3,13.9,'#5a3a7a','*ffd0f0',2.8);tfPend(K,17.7,13.9,'#5a3a7a','*ffd0f0',2.8);
 tfPlant(K,21.2,15.2,1,'#2a2538');tfPlant(K,1,12,1,'#2a2538');K.done()},
/* 6 Gallery: paintings with picture lights, partition walls, sculptures on plinths, a bench, the curator's desk */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,8.4,15.6,6,'day');
 [[2.4,1],[5.6,2],[15.6,3],[18.9,4]].forEach(q=>{tfPic(K,q[0],1.75,2.4,1.6,q[1]*3+1,0,'#1a1a1a');b(.6,.06,.2,'#222',q[0],2.75,.12);b(.4,.03,.12,'*fff2c8',q[0],2.72,.2)});
 [[3,1.6,1],[5.8,1.4,2]].forEach(q=>{tfPic(K,q[0],q[1],2,1.3,q[2]*5+2,1,'#1a1a1a')});
 [4.5,17.5].forEach((x,i)=>{b(5,2.6,.24,'#fafafa',x,1.3,7);b(5.04,.06,.28,'#d8d6d0',x,2.63,7);K.cl(x-2.5,6.88,x+2.5,7.12);[x-1.25,x+1.25].forEach((px,j)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.1),new THREE.MeshLambertMaterial({map:tfArtTex(20+i*2+j)}));b(1.86,1.26,.05,'#1a1a1a',px,1.55,7.14);K.add(m,px,1.55,7.17)})});
 [[5.8,10.4,0],[16.2,10.4,1],[11,13.2,2]].forEach(q=>{const[x,z,k]=q;b(.9,1,.9,'#ffffff',x,.5,z);b(.96,.04,.96,'#e8e6e0',x,1.02,z);K.cl(x-.5,z-.5,x+.5,z+.5);
  if(k==0){b(.5,.3,.5,'#e84a8a',x,1.19,z);b(.34,.34,.34,'#ffe066',x+.06,1.5,z);b(.2,.2,.2,'#4a90d9',x-.05,1.77,z)}else if(k==1){for(let i=0;i<6;i++)b(.12,.18,.5-i*.06,'#c9a227',x,1.13+i*.18,z+(i%2?.06:-.06))}else{b(.36,.5,.3,'#d9d2c8',x,1.29,z);b(.26,.3,.26,'#e8e2d8',x,1.69,z);b(.08,.08,.06,'#c8c0b4',x,1.66,z+.15)}});
 b(2.2,.08,.7,'#8a5a36',11,.45,9.4);b(.1,.42,.6,'#222',10.1,.21,9.4);b(.1,.42,.6,'#222',11.9,.21,9.4);K.cl(9.9,9.05,12.1,9.75);
 [[17.6,1.3],[20.2,1.3]].forEach(q=>{b(.1,.9,.1,'#c9a227',q[0],.45,q[1]);b(.24,.03,.24,'#c9a227',q[0],.015,q[1]);K.cl(q[0]-.12,q[1]-.12,q[0]+.12,q[1]+.12)});b(2.6,.05,.05,'#a0202a',18.9,.82,1.3);
 b(3.2,1,.9,'#e8e0d0',3.5,.5,13.7);b(3.3,.06,1,'#8a5a36',3.5,1.03,13.7);b(.5,.32,.04,'#111',3,1.24,13.5);b(1,.03,.6,'#f4f4f4',4.2,1.07,13.7);K.cl(1.85,13.2,5.15,14.2);
 twKeep(g,o,3.5,12.5,{hair:15,hc:0,hc_custom:'#5a5b62',eyes:5,mouth:0,top:2,tc:1,pc:0,skin:3,body:.1,hgt:.75},'Odette (curator)',()=>say('Odette: "Every frame here was painted by a different pixel artist. Take your time."'),2.9);
 tfSign(K,'GALLERY 6','#1a1a1a','#f4f2ec',2.2,.36,4.5,2.4,{border:'#1a1a1a',f:'',ff:'Georgia,serif'},0,7.12);
 tfTrack(K,1,8,.9,4);tfTrack(K,14,21,.9,4);tfTrack(K,2,7,7.9,2);tfTrack(K,15,20,7.9,2);tfPlant(K,21.2,15.2,1,'#ffffff');tfPlant(K,8.4,15.2,.8,'#ffffff');K.done()},
/* 7 Sky Lounge: a long bar with lit bottle shelves, stools, sofas round a fire table, a grand piano, a sunset view */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,.6,15.4,7,'sunset');
 b(8.5,1.04,1,'#3a1f2a',16.75,.52,3.4);for(let i=0;i<17;i++)b(.44,.84,.06,i%2?'#4a2638':'#3a1f2a',12.75+i*.5,.52,3.92);b(8.5,.05,.06,'#c9a227',16.75,.22,4.02);b(8.7,.08,1.2,'#e8e0d0',16.75,1.08,3.4);b(8.3,.04,.04,'*ffb050',16.75,.06,3.95);K.cl(12.4,2.8,21.1,4);
 [14.2,15.2].forEach(x=>{b(.08,.4,.08,'#c9a227',x,1.32,3.2);b(.14,.1,.1,'#c9a227',x,1.5,3.26)});for(let i=0;i<6;i++)b(.1,.14,.1,'#cfe9ff',18+i*.25,1.19,3.6);
 b(8.5,1.6,.3,'#1a1218',16.75,1.85,.15);b(8.3,1.5,.02,'*ff9a4a',16.75,1.85,.31);[1.4,1.9,2.4].forEach(y=>{b(8.3,.04,.3,'#c9a227',16.75,y-.02,.4);tfBottles(K,16.75,.4,8,y,22)});
 twKeep(g,o,16.75,2.0,{hair:11,hc:0,eyes:6,mouth:4,top:2,tc:5,pc:0,skin:4,body:.5},'Rico (bartender)',()=>twBuy('Sunset mocktail',12,25),3.4);
 for(let i=0;i<6;i++)tfStool(K,13.5+i*1.5,4.8,'#c0392b',.8);[14,16.75,19.5].forEach(x=>tfPend(K,x,3.4,'#c9a227','*ffb878',2.45,.7));
 tfSign(K,'SKY LOUNGE','#ffffff','#1a1420',3.6,.6,5,2.55,{glow:'#ff4da6',border:'#ff4da6'},0);
 tfRug(K,5.2,9.4,6.4,5,'#5a2a4a','#2a1420','#7a3a62');tfSofa(K,2.1,9.4,1,3.2,'#7a2a4a','#e6b422');tfSofa(K,5.2,6.5,0,2.6,'#2a4a7a');tfSofa(K,8.3,9.4,3,1.2,'#2a4a7a');
 b(1.6,.4,1.6,'#3a3a3a',5.2,.2,9.4);b(1.2,.04,1.2,'#222',5.2,.41,9.4);for(let i=0;i<5;i++)b(.16,.24+(i%2)*.14,.16,i%2?'*ffb040':'*ff6a1a',4.8+i*.2,.55,9.4+(i%3-1)*.15);K.cl(4.4,8.6,6,10.2);
 /* grand piano */
 b(2,.3,1.4,'#111',16.5,.86,12.6);b(1.3,.3,.8,'#111',17.2,.86,13.6);b(2,.04,.3,'#f4f4f4',16.5,.78,11.75);for(let i=0;i<12;i++)b(.05,.04,.16,'#111',15.6+i*.16,.81,11.72);b(.04,.9,1.3,'#1a1a1a',15.55,1.45,12.7);[[15.7,12.1],[17.3,12.1],[17.4,13.8]].forEach(q=>b(.12,.72,.12,'#111',q[0],.36,q[1]));b(.9,.5,.4,'#111',16.5,.25,11);K.cl(15.4,11.8,17.9,14.1);
 tfSofa(K,20.7,11,3,1.1,'#7a2a4a');tfSofa(K,20.7,13.6,3,1.1,'#7a2a4a');b(.6,.5,.6,'#c9a227',20.7,.25,12.3);K.cl(20.4,12,21,12.6);
 tfPlant(K,1,15.2,1.1,'#2a1420');tfPlant(K,12.4,15.2,.9,'#2a1420');tfTree(K,10.4,6.8,1,'#2a1420');
 [2.6,7.8].forEach(x=>tfPend(K,x,9.4,'#7a3a62','*ffc8a0',2.7,.9));tfPend(K,16.5,12.6,'#c9a227','*fff2c8',2.6,1.1);K.done()},
/* 8 Rooftop Garden: a deck under a pergola with string lights, outdoor sofas, a fire pit, loungers, planters, a fountain, a telescope and AC units */
(g,o)=>{const K=tfK(g,o),b=K.b;
 b(9.4,.06,6.4,'#9a6b45',11,.03,10);for(let i=0;i<16;i++)b(9.4,.065,.04,'#7a5232',11,.032,7+i*.4);
 [[6.5,7],[15.5,7],[6.5,13],[15.5,13]].forEach(q=>{b(.2,2.7,.2,'#6b4a2e',q[0],1.35,q[1]);K.cl(q[0]-.12,q[1]-.12,q[0]+.12,q[1]+.12)});[7,13].forEach(z=>b(9.4,.2,.14,'#6b4a2e',11,2.75,z));for(let i=0;i<9;i++)b(.1,.12,6.4,'#7a5232',6.8+i*1.05,2.9,10);
 [7,13].forEach(z=>{for(let i=0;i<14;i++)b(.08,.08,.08,i%2?'*fff2b0':'*ffd27a',6.7+i*.66,2.5-Math.sin(i/13*Math.PI)*.18,z+.12)});
 tfSofa(K,8,10,1,3,'#e8e0d0','#2f6fb5');tfSofa(K,11.4,12.1,2,3,'#e8e0d0','#e6b422');b(1.4,.36,1.4,'#7a7f86',11.4,.18,9.6);b(1,.06,1,'#2a2a2a',11.4,.38,9.6);for(let i=0;i<4;i++)b(.16,.28,.16,i%2?'*ffb040':'*ff6a1a',11.2+i*.14,.5,9.6);K.cl(10.7,8.9,12.1,10.3);
 [[18.2,4.4],[18.2,6.2],[18.2,8]].forEach(q=>{b(1.8,.25,.6,'#f4f4f4',q[0],.3,q[1]);b(.5,.4,.6,'#f4f4f4',q[0]-.75,.5,q[1]);b(1.7,.06,.5,'#4a90d9',q[0]+.1,.45,q[1]);K.cl(q[0]-.95,q[1]-.3,q[0]+.95,q[1]+.3)});
 b(.06,2.2,.06,'#888',19.9,1.1,6.2);b(2.2,.12,2.2,'#e84a8a',19.9,2.25,6.2);b(1.6,.1,1.6,'#f4f4f4',19.9,2.36,6.2);
 b(2.8,.36,2.8,'#9aa0a6',3.6,.18,6.4);b(2.4,.1,2.4,'#6ad5ff',3.6,.33,6.4);b(.36,1,.36,'#b0b5ba',3.6,.7,6.4);b(.9,.1,.9,'#9aa0a6',3.6,1.2,6.4);b(.18,.36,.18,'*e8f8ff',3.6,1.42,6.4);K.cl(2.2,5,5,7.8);
 [[1.4,13.6],[20.6,13.6],[1.4,2.4]].forEach(q=>{b(1.4,.9,1.4,'#8a6a48',q[0],.45,q[1]);b(1.5,.06,1.5,'#6b4a2e',q[0],.93,q[1]);b(.2,1.2,.2,'#6b4a2e',q[0],1.5,q[1]);b(1.8,1.2,1.8,'#2e7d32',q[0],2.5,q[1]);b(1.2,.8,1.2,'#43a047',q[0],3.3,q[1]);K.cl(q[0]-.7,q[1]-.7,q[0]+.7,q[1]+.7)});
 for(let i=0;i<3;i++){b(4,.6,.9,'#8a6a48',5+i*5,.3,15.3);b(3.8,.1,.7,'#4a3320',5+i*5,.62,15.3);for(let j=0;j<7;j++)b(.26,.26,.26,['#e84a8a','#ffe066','#ff7a3a','#ffffff','#b07aff'][(i+j)%5],3.4+i*5+j*.52,.8,15.2+(j%2)*.15);K.cl(3+i*5,14.85,7+i*5,15.75)}
 b(.5,.05,.5,'#555',20.5,.03,10.6);b(.18,1.3,.18,'#333',20.5,.7,10.6);b(.24,.24,.9,'#cfd3d8',20.6,1.5,10.3);b(.2,.2,.04,'#222',20.6,1.5,9.85);K.cl(20.2,10.3,20.8,10.9);
 [[1.6,8.6],[1.6,10.4]].forEach(q=>{b(1.4,1.1,1.4,'#b0b5ba',q[0],.55,q[1]);b(1,.04,1,'#3a3f46',q[0],1.12,q[1]);for(let i=0;i<5;i++)b(1.2,.04,.04,'#8a9096',q[0],.3+i*.18,q[1]+.71);K.cl(q[0]-.7,q[1]-.7,q[0]+.7,q[1]+.7)});
 for(let i=0;i<10;i++){K.gl(2.2,1,.04,1.1+i*2.2,.95,15.95);b(.06,1.05,.08,'#9aa0a6',i*2.2,.52,15.95)}b(22,.06,.1,'#9aa0a6',11,1.47,15.95);for(let i=0;i<7;i++){K.gl(.04,1,2.28,21.95,.95,1.14+i*2.28);b(.08,1.05,.06,'#9aa0a6',21.95,.52,i*2.28)}b(.1,.06,16,'#9aa0a6',21.95,1.47,8);
 K.done()}];

/* ================= Pulse Records HQ ================= */
TFB['Pulse Records HQ']=[
/* 1 Lobby & Gold Records: walls of framed gold and platinum records, trophy cabinets, a neon sign, a black and gold desk */
(g,o)=>{const K=tfK(g,o),b=K.b;
 [1.3,2.3,3.3,4.3,5.3,6.3,15.7,16.7,17.7,18.7,19.7,20.7].forEach((x,i)=>{tfDisc(K,x,2.35,i%3==2);tfDisc(K,x,1.35,i%4==1)});
 [3.8,18.2].forEach(x=>{b(5.2,.75,.5,'#1a1a22',x,.375,.35);b(5.3,.05,.56,'#c9a227',x,.77,.35);for(let i=0;i<5;i++){const tx=x-2+i;b(.24,.06,.24,'#c9a227',tx,.82,.35);b(.08,.24,.08,'#c9a227',tx,.97,.35);b(.2,.16,.2,'#e6b422',tx,1.17,.35);b(.1,.08,.12,'#e6b422',tx+.1,1.27,.35)}K.cl(x-2.6,.05,x+2.6,.62)});
 tfSign(K,'PULSE RECORDS','#ff4d7a','#14141c',6,.8,8,2.45,{glow:'#ff2a5a',border:'#ff4d7a'},1);const PL=[0,0,0,.3,-.4,.5,0,0,0,0,.2,-.2,0,0,0,.4,-.5,.3,0,0,0,0,0,0];for(let i=0;i<24;i++)b(.04,.06,.26,'*ff4d7a',.08,1.55+PL[i],5+i*.25);
 tfPic(K,2.4,1.7,2.4,1.8,40,1,'#c9a227');tfPic(K,13.6,1.7,2.4,1.8,41,1,'#c9a227');
 [[2,6],[20,6]].forEach(q=>{for(let i=0;i<8;i++)b(.5-(i%2)*.06,.42,.5-(i%2)*.06,i%2?'#e6b422':'#c9a227',q[0],.21+i*.42,q[1]);K.cl(q[0]-.28,q[1]-.28,q[0]+.28,q[1]+.28)});
 tfRug(K,11,10,9,3.6,'#7a1f3a','#c9a227','#9a2a4a');
 b(5.5,1,1.1,'#111116',11,.5,10);b(5.5,.06,.06,'#c9a227',11,.96,10.56);b(5.5,.06,.06,'#c9a227',11,.12,10.56);b(5.8,.08,1.3,'#1e1e26',11,1.04,10);b(5.84,.03,1.34,'#c9a227',11,1.09,10);
 tfSign(K,'PULSE','#ffd27a','#111116',1.6,.4,11,.55,{glow:'#ffb030'},0,10.57);[9.6,12.3].forEach(x=>{b(.62,.4,.05,'#15171c',x,1.38,9.85);b(.1,.16,.1,'#333',x,1.14,9.85)});b(.2,.3,.2,'#c9a227',13.2,1.23,10.2);b(.14,.14,.14,'*ff4d7a',13.2,1.45,10.2);K.cl(8.15,9.4,13.85,10.65);
 twKeep(g,o,11,8.6,{hair:14,hc:0,eyes:5,mouth:0,top:2,tc:6,pc:4,skin:4,body:.4},'Priya (receptionist)',()=>say('Priya: "Welcome to Pulse Records. A&R is on 2, mixing on 3, photos on 4, the boardroom and lounge on 5."'),3.9);
 [[3.6,'#5a3a7a'],[18.4,'#5a3a7a']].forEach((q,i)=>{tfRug(K,q[0],13.2,5.4,3.6,q[1],'#2a1a3a');tfSofa(K,q[0]-2,13.2,1,2.8,'#1a1a22','#c9a227');tfSofa(K,q[0]+2.2,12.4,3,1.1,'#1a1a22');tfSofa(K,q[0]+2.2,14,3,1.1,'#1a1a22');tfCTable(K,q[0]+.1,13.2,1.1,1.6,'#111116','#c9a227');b(.5,.02,.5,'#111',q[0]+.2,.48,13.5);b(.46,.022,.46,['#e84a8a','#4ad9c0'][i],q[0]+.2,.49,13.5)});
 [[6.5,9.5,0],[15.5,9.5,1]].forEach(q=>{b(.9,1,.9,'#1a1a22',q[0],.5,q[1]);b(.94,.04,.94,'#c9a227',q[0],1.02,q[1]);K.gl(.8,.7,.8,q[0],1.4,q[1]);b(.6,.6,.04,q[2]?'#dfe4ea':'#e6b422',q[0],1.38,q[1]);b(.16,.16,.05,'#c0392b',q[0],1.38,q[1]+.01);K.cl(q[0]-.5,q[1]-.5,q[0]+.5,q[1]+.5)});
 tfPlant(K,.9,15.2,1.1,'#111116');tfPlant(K,21.1,15.2,1.1,'#111116');tfPlant(K,8.2,15.1,.8,'#111116');tfPlant(K,13.8,15.1,.8,'#111116');
 tfChand(K,11,10,'*ffd0a0',2.6);[3.6,18.4].forEach(x=>tfPend(K,x,13.2,'#c9a227','*ffd27a',2.75,1));tfTrack(K,1,6.6,.9,4);tfTrack(K,15.4,21,.9,4);
 INT.push({x:o+11,z:335,r:1.6,l:'Leave building',a:leaveShop});K.done()},
/* 2 A&R Floor: two glass offices, open desks, Marcus's desk with a turntable, a signing board and a listening corner */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,7,15.4,2,'day');
 tfGlassX(K,.3,8.1,5.2,2.6,3.2,4.3);tfGlassZ(K,4.2,.3,5.2,2.6);tfGlassZ(K,8.1,.3,5.2,2.6);
 [[2.25,'#2a3a5a',44],[6.15,'#5a2a3a',45]].forEach(q=>{const x=q[0];b(3.7,.02,4.7,q[1],x,.012,2.75);tfDesk(K,x,1.9,0,1.6,'#3a2a1a','*9fe0b0');tfOChair(K,x,2.75,2,'#1a1a1a');tfChair(K,x-.5,3.9,2,'#c9a27a');tfChair(K,x+.5,3.9,2,'#c9a27a');K.cl(x-.85,1.5,x+.85,2.3);
  tfPic(K,x,2.1,1.6,1,q[2]);b(1.6,.05,.3,'#3a2a1a',x,2.8,.16);for(let i=0;i<6;i++)b(.04,.3,.22,['#111','#e84a8a','#111','#e6b422','#111','#4ad9c0'][i],x-.6+i*.24,2.98,.16);tfPlant(K,x+1.4,.6,.7,'#2a2a2a')});
 tfSign(K,'A&R','#ffffff','#7a1f3a',1.2,.36,2.25,2.85,{},0,5.24);tfSign(K,'HEAD OF A&R','#ffffff','#2a3a5a',1.6,.3,6.15,2.85,{},0,5.24);
 const SC=['*7fc8ff','*9fe0b0','*ffd27a','*c8b0ff'];let k=0;[9.4,13.4].forEach(cz=>{b(4.4,.36,.05,'#7a8a9a',4.6,1.0,cz);[3.1,4.6,6.1].forEach(cx=>{tfDesk(K,cx,cz-.45,2,1.45,'#e8e8ec',SC[k++%4]);tfDesk(K,cx,cz+.45,0,1.45,'#e8e8ec',SC[k++%4]);tfOChair(K,cx,cz-1.2,0,'#5a3a7a');tfOChair(K,cx,cz+1.2,2,'#5a3a7a');b(.2,.12,.12,'#111',cx+.45,.84,cz-.6);b(.16,.06,.16,'#e84a8a',cx-.45,.81,cz+.6)});K.cl(2.3,cz-.9,6.9,cz+.9);tfPanel(K,4.6,cz,4)});
 /* Marcus */
 tfRug(K,16.5,4,6,4.4,'#2a2a34','#1a1a22');b(5,.08,.9,'#2a2a34',16.5,.8,3.2);b(4.8,.76,.8,'#1e1e26',16.5,.38,3.2);b(5,.04,.92,'#c9a227',16.5,.84,3.2);K.cl(13.95,2.7,19.05,3.7);
 [15.2,17.8].forEach((x,i)=>{b(.7,.44,.05,'#111',x,1.32,2.95);b(.62,.36,.02,i?'*ffd27a':'*7fc8ff',x,1.32,2.98);b(.1,.18,.1,'#333',x,1,2.95)});b(.5,.1,.4,'#1a1a1a',16.5,.9,3.3);b(.36,.02,.36,'#111',16.5,.96,3.3);b(.04,.04,.24,'#c9a227',16.66,.98,3.3);tfMonitor(K,14.3,1.05,3.1,.8);tfMonitor(K,18.7,1.05,3.1,.8);for(let i=0;i<5;i++)b(.3,.03,.3,['#e84a8a','#4ad9c0','#ffe066','#f4f4f4','#b07aff'][i],18.6,.87+i*.035,3.45);
 twKeep(g,o,16.5,5,{hair:2,hc:1,eyes:1,mouth:3,top:8,tc:7,pc:0,skin:3,body:.4},'Marcus (A&R scout)',()=>say('Marcus: "Hype comes from consistency. Keep releasing and the labels will keep calling."'),3.0);
 tfBoardM(K,tfBoard('SIGNINGS',['Nova Kid|demo','Lowkey Ghosts|signed','Mira Vale|meeting','You?|keep going'],'#f4f4f4','#1e2430','#ff4d7a',3,1.6),3,1.6,17,1.9);
 [14.6,19.4].forEach(x=>{b(1.6,1.6,.4,'#3a2a1a',x,.8,.25);for(let i=0;i<3;i++){b(1.5,.04,.36,'#2a1a10',x,.3+i*.5,.25);for(let j=0;j<9;j++)b(.04,.4,.3,['#111','#e84a8a','#111','#e6b422','#4ad9c0'][(i+j)%5],x-.65+j*.16,.52+i*.5,.25)}K.cl(x-.8,.05,x+.8,.45)});
 /* listening corner */
 tfRug(K,17,12.8,6,4,'#5a3a7a','#2a1a3a');tfSofa(K,17,12,0,2.8,'#1a1a22','#ff4d7a');[14.4,19.6].forEach(x=>{b(.6,1.1,.5,'#1a1a1a',x,.55,14.6);b(.36,.36,.02,'#3a3a3a',x,.7,14.86);b(.2,.2,.02,'#555',x,.98,14.86);K.cl(x-.3,14.35,x+.3,14.85)});b(1.4,.5,.6,'#3a2a1a',17,.25,14.4);b(.5,.1,.4,'#1a1a1a',17,.55,14.4);b(.36,.02,.36,'#111',17,.61,14.4);K.cl(16.3,14.1,17.7,14.7);
 tfPlant(K,21.2,8.4,1,'#2a2a2a');tfPlant(K,12.6,15.2,.8,'#2a2a2a');tfPanel(K,16.5,4,4);tfPend(K,17,13,'#1a1a1a','*ffd27a',2.7);K.done()},
/* 3 Mixing Suites: a control room and a live room behind glass, and the lounge where artists wait */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,8.6,15.6,3,'day');
 /* control room */
 b(7.6,.02,6.8,'#3a3046',4.2,.012,3.7);tfGlassX(K,.3,8.1,7.2,2.8,6.6,7.8);tfGlassZ(K,8.1,.3,7.2,2.8);
 tfConsole(K,4.4,3.6,5);[3.4,5.4].forEach((x,i)=>{b(.7,.44,.05,'#111',x,1.42,3.15);b(.62,.36,.02,i?'*b07aff':'*7fc8ff',x,1.42,3.18)});[1.6,7.2].forEach(x=>{b(.3,1,.3,'#333',x,.5,2.8);tfMonitor(K,x,1.24,2.8,1)});
 [2.2,6.6].forEach(x=>{b(1,1.1,.5,'#1a1a1a',x,2.3,.3);b(.44,.44,.02,'#3a3a3a',x,2.2,.56);b(.2,.2,.02,'#555',x,2.6,.56)});tfRack(K,.8,.6);tfRack(K,7.5,.6);tfSofa(K,4.4,6.4,2,2.6,'#2a2538','#ff4d7a');
 twKeep(g,o,4.4,2.2,{hair:19,hc:9,eyes:6,mouth:4,top:1,tc:5,pc:4,skin:1,body:.35},'Yuki (mixing engineer)',()=>say('Yuki: "A clean mix is half the song. Better gear at home means better takes."'),2.9);
 tfSign(K,'SUITE A · CONTROL','#ffffff','#2a2030',2.6,.3,4.4,3.0,{},0);tfDisc(K,3.9,2.15,0,1);tfDisc(K,4.9,2.15,1,1);tfDisc(K,5.9,2.15,0,1);tfPanel(K,4.4,3.6,3);
 /* live room */
 b(7.6,.02,6.8,'#8a5a36',17.8,.012,3.7);for(let i=0;i<10;i++)b(.03,.024,6.8,'#6b4a2e',14.3+i*.75,.014,3.7);tfGlassX(K,13.9,21.7,7.2,2.8,14.1,15.3);tfGlassZ(K,13.9,.3,7.2,2.8);
 for(let i=0;i<5;i++)for(let j=0;j<3;j++)b(1,.6,.08+((i+j)%3)*.06,['#8a5a36','#a0703e','#6b4a2e'][(i*2+j)%3],15.2+i*1.4,1.1+j*.7,.08);
 tfDrums(K,19.6,2.4,'#c0392b');b(1.5,1.2,.6,'#111',16,.6,.6);b(1.5,.06,.4,'#f4f4f4',16,1.1,.95);b(1.5,.04,.6,'#1a1a1a',16,1.22,.6);b(.8,.5,.4,'#111',16,.25,1.5);K.cl(15.2,.3,16.8,1.75);
 tfAmp(K,21,5,3,1);tfGuitar(K,20.4,6.2,'#2a6ab5');tfMic(K,17,4.6);tfMic(K,18.2,5.6,'#c9a227');[[16.4,6.3],[19.4,6.3]].forEach(q=>{b(1,1.6,.1,'#5a3a6a',q[0],.9,q[1]);b(.9,1.5,.04,'#7a5a8a',q[0],.9,q[1]-.06)});
 tfSign(K,'LIVE ROOM','#ffffff','#2a2030',1.6,.3,17.8,3.0,{},0);b(.5,.3,.12,'#222',20.6,3.0,.08);b(.4,.2,.04,'*ff2a2a',20.6,3.0,.15);tfTrack(K,14.4,21.2,3.6,4);
 /* lounge: a sofa and armchairs facing the room, side tables, a drinks fridge, plants */
 tfSofa(K,11,14.6,2,2.8,'#5a3a7a','#ffd27a');tfSofa(K,7.4,14.6,2,1.1,'#2a2538');tfSofa(K,14.6,14.6,2,1.1,'#2a2538');[[9,14.6],[13,14.6]].forEach(q=>{b(.5,.5,.5,'#1a1a22',q[0],.25,q[1]);b(.16,.3,.16,'#f0e6d0',q[0],.65,q[1]);K.cl(q[0]-.25,q[1]-.25,q[0]+.25,q[1]+.25)});
 b(.7,1.6,.7,'#e8e8ec',1,.8,9);b(.6,1.4,.02,'*cfe9ff',1,.85,9.36);for(let i=0;i<4;i++)b(.5,.02,.5,'#c8ccd0',1,.3+i*.35,9);K.cl(.65,8.65,1.35,9.35);
 tfPlant(K,21.2,15.2,1,'#1a1a22');tfPlant(K,21.2,8.4,1,'#1a1a22');tfPlant(K,1,15.2,1,'#1a1a22');[8,14].forEach(x=>tfPend(K,x,12,'#5a3a7a','*ffd0f0',2.8,.9));K.done()},
/* 4 Photo Studio: a white cyclorama with softboxes and strobes, a camera on a tripod, a make-up station, clothing rails */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,9,15.6,4,'day');
 b(8,.02,5.6,'#f8f8f8',4.4,.012,3);for(let i=0;i<4;i++)b(8,.25-i*.06,.18+i*.06,'#f8f8f8',4.4,(.25-i*.06)/2,.3+i*.12);tfOnB(K,4.4,1.6,8,3.1,'#fafafa',.06);
 b(8.4,.12,.12,'#2a2a2a',4.4,3.2,.25);[['#e84a8a',1.6],['#4a90d9',3.2],['#ffe066',4.8]].forEach(q=>b(1.4,.22,.22,q[0],q[1],3.1,.35));b(1.3,2.4,.03,'#e84a8a',1.6,1.8,.48);
 b(.5,.5,.5,'#2a2a2a',4.4,.25,2.8);b(.5,.06,.5,'#c9a227',4.4,.52,2.8);K.cl(4.15,2.55,4.65,3.05);
 [1.6,7.2].forEach(x=>{b(.5,.04,.5,'#222',x,.02,5);b(.05,1.8,.05,'#333',x,.92,5);b(1,1,.3,'#1a1a1a',x,2,4.9);b(.92,.92,.04,'*ffffff',x,2,4.73);K.cl(x-.25,4.75,x+.25,5.25)});
 b(.4,.04,.4,'#222',4.4,.02,6.8);b(.05,1.6,.05,'#333',4.4,.82,6.8);b(.8,.04,.8,'#f4f4f4',4.4,1.9,6.6);b(.2,.2,.3,'#222',4.4,1.7,6.8);K.cl(4.2,6.6,4.6,7);
 b(.6,.04,.6,'#222',4.4,.02,9);[[-.22,-.2],[.22,-.2],[0,.25]].forEach(q=>b(.04,1.3,.04,'#333',4.4+q[0]*.5,.65,9+q[1]*.5));b(.36,.24,.22,'#1a1a1a',4.4,1.38,9);b(.14,.14,.16,'#111',4.4,1.38,8.82);b(.08,.08,.02,'*7fc8ff',4.4,1.38,9.12);K.cl(4.1,8.7,4.7,9.3);
 b(1,.9,.6,'#2a2a2a',6.2,.45,9.4);b(.6,.04,.4,'#c8ccd0',6.2,.92,9.4);b(.56,.34,.02,'*7fc8ff',6.2,1.1,9.25);K.cl(5.7,9.1,6.7,9.7);
 b(.06,1.4,.06,'#333',2,.7,7.4);b(.9,.06,.9,'#e6b422',2,1.45,7.2);tfSign(K,'STUDIO 4','#111111','#ffffff',1.8,.36,4.4,3.0,{border:'#111111'},0,.08);
 /* make-up station */
 b(5,.06,.6,'#f4f4f4',17.3,.86,.4);b(4.9,.82,.56,'#e8e8ec',17.3,.41,.4);K.cl(14.8,.1,19.8,.7);[15.6,17.3,19].forEach(x=>{b(1.2,1,.04,'#f4f4f4',x,1.7,.04);b(1,.8,.02,'*dcecf4',x,1.7,.07);for(let i=0;i<4;i++){b(.08,.08,.04,'*fff2c8',x-.56,1.32+i*.25,.08);b(.08,.08,.04,'*fff2c8',x+.56,1.32+i*.25,.08)}tfChair(K,x,1.3,2,'#e84a8a','#888');for(let i=0;i<4;i++)b(.06,.1,.06,['#e84a8a','#2a2a2a','#c9a227','#f4f4f4'][i],x-.3+i*.2,.94,.3)});
 /* clothing rails and paper rolls */
 [[14,12.4],[18,12.4]].forEach((q,k)=>{b(2.4,.04,.04,'#888',q[0],1.7,q[1]);[-1.1,1.1].forEach(s=>{b(.04,1.7,.04,'#888',q[0]+s,.85,q[1]);b(.04,.04,.5,'#888',q[0]+s,.02,q[1])});for(let i=0;i<9;i++){const c=['#e84a8a','#4a90d9','#ffe066','#2fe68a','#2a2a2a','#f4f4f4','#ff7a3a','#9b59b6','#c0392b'][(i+k*3)%9];b(.2,.8+(i%3)*.15,.4,c,q[0]-.95+i*.24,1.25-(i%3)*.07,q[1])}K.cl(q[0]-1.2,q[1]-.3,q[0]+1.2,q[1]+.3)});
 [0,1,2,3].forEach(i=>b(.24,1.8,.24,['#e84a8a','#4a90d9','#ffe066','#2a2a2a'][i],20.8,.9,9.2+i*.35));K.cl(20.6,9,21,10.5);
 twKeep(g,o,16,7.5,{hair:3,hc:2,eyes:5,mouth:3,top:0,tc:0,pc:3,skin:2,body:.4},'Zane (photographer)',()=>{if(S.money<300){snd('err');return say('A shoot costs $300.')}S.money=+(S.money-300).toFixed(2);S.interest=Math.min(1,(S.interest||0)+.06);S.igF=(S.igF||0)+60;snd('chime');say('Photo shoot done! New promo shots raise your interest and Instagrime followers.')},3.0);
 b(2.4,.9,.8,'#2a2a2a',16,.45,9);b(2.5,.05,.9,'#c9a227',16,.92,9);for(let i=0;i<4;i++)b(.36,.02,.26,'#f4f4f4',15.2+i*.5,.96,9);K.cl(14.75,8.55,17.25,9.45);
 [[12.6,2.4],[12.6,4]].forEach(q=>{b(.9,.6,.6,'#1a1a1a',q[0],.3,q[1]);b(.92,.04,.62,'#9aa0a6',q[0],.6,q[1]);K.cl(q[0]-.45,q[1]-.3,q[0]+.45,q[1]+.3)});
 tfPic(K,15.6,2.6,1,.7,51);tfPic(K,19,2.6,1,.7,52);tfPlant(K,21.2,15.2,1,'#f4f4f4');tfPlant(K,9.6,15.2,.8,'#f4f4f4');[15,19].forEach(x=>tfPanel(K,x,4,3));K.done()},
/* 5 Boardroom & Lounge: a long table with chairs and a video screen, bookcases of awards, a lounge with a record player */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,.6,15.4,5,'sunset');
 tfRug(K,9.6,9.2,11,5.6,'#3a2a3a','#2a1a2a');b(9,.08,2,'#5a3a22',9.6,.78,9.2);b(8.8,.04,1.8,'#3a2412',9.6,.73,9.2);[6,13.2].forEach(x=>b(.5,.72,1.2,'#2a1a10',x,.36,9.2));K.cl(5.1,8.2,14.1,10.2);
 for(let i=0;i<5;i++){const x=6.2+i*1.7;tfOChair(K,x,7.75,0,'#1a1a22');tfOChair(K,x,10.65,2,'#1a1a22');b(.36,.02,.26,'#f4f4f4',x,.83,8.6);b(.36,.02,.26,'#f4f4f4',x,.83,9.8)}tfOChair(K,4.6,9.2,1,'#7a1f3a');b(.4,.06,.4,'#222',9.6,.84,9.2);b(.6,.12,.3,'#c9a227',11.4,.88,9.2);
 tfTV(K,4.2,1.8,4,0,'*2a4a7a');b(1.6,.2,.02,'*ff4d7a',3.6,2.1,.13);b(1.2,.14,.02,'*ffd27a',4.6,1.7,.13);b(2,.5,.6,'#1a1a1a',4.2,.25,.4);K.cl(3.2,.1,5.2,.7);
 tfDisc(K,6.6,2.2,0);tfDisc(K,7.4,2.2,1);
 twKeep(g,o,18.8,4.6,{hair:5,hc:3,eyes:5,mouth:0,top:2,tc:1,pc:0,skin:0,body:.35},'Ms. Hart (label CEO)',()=>say('Ms. Hart: "We sign artists with real momentum. Build your fanbase and we will be in touch."'),2.8);
 b(2.4,.8,.7,'#2a1a10',18.8,.4,3.4);b(2.5,.05,.8,'#c9a227',18.8,.82,3.4);b(.5,.32,.04,'#111',18.2,1.06,3.3);b(.2,.3,.2,'#e6b422',19.6,.98,3.4);K.cl(17.55,3,20.05,3.8);
 tfShelf(K,15.6,.3,0,3,2.6,'#2a1a10',5,['#c9a227','#7a1f3a','#2a3a5a','#e6b422','#f4f4f4','#3a2a1a']);tfShelf(K,20.6,.3,0,2,2.6,'#2a1a10',5,['#c9a227','#7a1f3a','#2a3a5a','#e6b422','#f4f4f4','#3a2a1a']);
 /* lounge */
 tfRug(K,17.6,12.6,7,4.6,'#7a3a2a','#3a1a10','#9a4a3a');tfSofa(K,15,12.6,1,3,'#c9a27a','#7a1f3a');tfSofa(K,20.4,11.6,3,1.1,'#3a2a1a');tfSofa(K,20.4,13.6,3,1.1,'#3a2a1a');tfCTable(K,17.6,12.6,1.2,1.8,'#2a1a10','#c9a227');
 b(1.6,.7,.5,'#3a2412',17.6,.35,15.3);b(.5,.1,.4,'#1a1a1a',17.2,.75,15.3);b(.36,.02,.36,'#111',17.2,.81,15.3);for(let i=0;i<6;i++)b(.04,.32,.3,['#111','#e84a8a','#111','#e6b422','#111','#4ad9c0'][i],17.9+i*.06,.86,15.3);K.cl(16.8,15.05,18.4,15.55);
 b(.9,.9,.5,'#c9a227',13,.45,15.3);b(.8,.04,.4,'#3a2412',13,.55,15.3);tfBottles(K,13,15.3,.8,.92,5);K.cl(12.55,15.05,13.45,15.55);
 tfLamp(K,15,14.8,'#e8c9a0');tfPlant(K,21.2,9.4,1.1,'#2a1a10');tfPlant(K,1,15.2,1,'#2a1a10');
 [7.4,11.8].forEach(x=>tfPend(K,x,9.2,'#c9a227','*fff2c8',2.6,.9));tfPend(K,17.6,12.6,'#2a2a2a','*ffd27a',2.7,1);K.done()}];
TOWERS[1].names[4]='Boardroom & Lounge';

/* ================= Aurora Residences ================= */
TFB['Aurora Residences']=[
/* 1 Concierge Lobby: a wall of brass mailboxes, parcel lockers, the concierge desk with a key cabinet, a fountain pool, sofas */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,4.6,14.8,1,'day',.2,3.1,'#9a8a6a');
 b(7.2,1.9,.36,'#8a6a48',17.9,1.05,.2);for(let i=0;i<9;i++)for(let j=0;j<5;j++){const x=14.7+i*.78,y=.4+j*.36;b(.7,.3,.04,'#c9a227',x,y,.4);b(.6,.06,.02,'#2a2018',x,y+.06,.43);b(.06,.06,.03,'#2a2018',x+.26,y-.06,.43)}b(7.3,.06,.4,'#6b4a2e',17.9,2.03,.2);K.cl(14.3,.02,21.5,.45);tfSign(K,'MAIL','#2a2018','#e6d8b0',1,.3,17.9,2.4,{},0);
 b(1.4,1.9,.5,'#3a3f46',20.9,.95,2.2);for(let j=0;j<4;j++)b(1.3,.4,.02,j%2?'#5a6068':'#4a5058',20.9,.3+j*.45,2.46);b(.3,.2,.02,'*7fc8ff',20.5,1.6,2.47);K.cl(20.2,1.95,21.7,2.45);
 b(4,1.05,1.1,'#d9d2c0',3.5,.53,3.2);b(4.2,.08,1.3,'#8a5a36',3.5,1.09,3.2);b(4,.06,.06,'#c9a227',3.5,.95,3.77);for(let i=0;i<5;i++)b(.04,.8,.04,'#c9a227',1.7+i*.9,.5,3.78);b(.62,.4,.05,'#15171c',4.4,1.36,3.0);b(.18,.08,.18,'#c9a227',2.4,1.17,3.4);K.cl(1.4,2.55,5.6,3.85);
 b(2,1.3,.12,'#6b4a2e',3.5,1.9,.06);for(let i=0;i<6;i++)for(let j=0;j<3;j++){b(.05,.05,.06,'#c9a227',2.8+i*.28,1.6+j*.32,.15);b(.06,.12,.02,['#e84a4a','#4a90d9','#ffe066'][j],2.8+i*.28,1.52+j*.32,.18)}
 twKeep(g,o,3.5,2.0,{hair:2,hc:0,eyes:0,mouth:0,top:2,tc:6,pc:0,skin:3,body:.4},'Theo (concierge)',()=>say('Theo: "Welcome to Aurora. Fitness is on 2, the pool on 3 and the showroom on 4."'),3.4);
 /* fountain pool */
 [[0,-1.6,4.6,.2],[0,1.6,4.6,.2],[-2.2,0,.2,3.4],[2.2,0,.2,3.4]].forEach(q=>{b(q[2],.45,q[3],'#e8e0d0',11+q[0],.225,9.4+q[1]);b(q[2]+.06,.05,q[3]+.06,'#d9d2c0',11+q[0],.47,9.4+q[1])});b(4.2,.06,3,'#2a6a90',11,.03,9.4);const wm=new THREE.Mesh(new THREE.PlaneGeometry(4.2,3),new THREE.MeshBasicMaterial({map:tfWaterTex('#4ab0d8','#8ad8f0')}));wm.material.map.repeat.set(3,2);K.add(wm,11,.36,9.4).rotation.x=-Math.PI/2;
 b(.5,1.1,.5,'#d9d2c0',11,.55,9.4);b(1,.1,1,'#d9d2c0',11,1.1,9.4);b(.14,.5,.14,'*e8f8ff',11,1.4,9.4);[[-1.6,0],[1.6,0],[0,-1.2],[0,1.2]].forEach(q=>b(.08,.3,.08,'*e8f8ff',11+q[0],.6,9.4+q[1]));K.cl(8.7,7.7,13.3,11.1);
 [[7.4,8.1],[14.6,8.1],[7.4,10.7],[14.6,10.7]].forEach(q=>tfPlant(K,q[0],q[1],.8,'#d9d2c0'));
 [[5,6.5],[17,6.5]].forEach(q=>{b(.6,3.4,.6,'#e8e0d0',q[0],1.7,q[1]);b(.8,.24,.8,'#c9a227',q[0],.12,q[1]);b(.8,.2,.8,'#c9a227',q[0],3.3,q[1]);K.cl(q[0]-.4,q[1]-.4,q[0]+.4,q[1]+.4)});
 [[2.3,'#bfa88a','#2f6b4f'],[15.4,'#bfa88a','#7a1f3a']].forEach(q=>{const cx=q[0]+2.3;tfRug(K,cx,13,5.6,3.6,'#e8dcc4','#bfa88a');tfSofa(K,q[0],13,1,2.8,q[1],q[2]);tfSofa(K,q[0]+4.6,12.2,3,1.1,q[2]);tfSofa(K,q[0]+4.6,13.8,3,1.1,q[2]);tfCTable(K,cx-.1,13,1.1,1.6,'#8a5a36','#c9a227')});
 tfTree(K,.9,1,1.1,'#d9d2c0');tfTree(K,21.1,15.1,1,'#d9d2c0');tfTree(K,.9,15.1,1,'#d9d2c0');tfTree(K,7.8,1,1,'#d9d2c0');
 tfChand(K,11,9.4,null,2.4);[4.6,17.6].forEach(x=>tfPend(K,x,13,'#c9a227','*fff2c8',2.75,1));tfSign(K,'AURORA','#c9a227','#f4efe2',3,.5,11,2.45,{border:'#c9a227',ff:'Georgia,serif',f:''},0,.04);
 INT.push({x:o+11,z:335,r:1.6,l:'Leave building',a:leaveShop});K.done()},
/* 2 Fitness Club: treadmills and bikes facing the window, a mirror wall with dumbbells, a power rack, lockers, a shake bar */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,.6,15.4,2,'day');
 [3,5.2,7.4].forEach(z=>{b(1.9,.22,.8,'#222',2.6,.11,z);b(1.7,.03,.56,'#3a3a3a',2.7,.235,z);[-.33,.33].forEach(s=>b(.08,1.15,.08,'#555',1.75,.7,z+s));b(.2,.36,.76,'#2a2a2a',1.7,1.3,z);b(.04,.24,.4,'*7fc8ff',1.82,1.32,z);b(.5,.06,.06,'#555',2,1.08,z-.36);b(.5,.06,.06,'#555',2,1.08,z+.36);K.cl(1.6,z-.42,3.6,z+.42)});
 [9.8,11.8].forEach(z=>{b(1.2,.08,.3,'#333',2.6,.04,z);b(.1,.7,.1,'#c0392b',2.9,.45,z);b(.36,.08,.28,'#222',2.9,.84,z);b(.12,.8,.12,'#c0392b',2.1,.5,z);b(.4,.06,.5,'#222',2.05,1.0,z);b(.12,.12,.3,'#555',2.6,.4,z);K.cl(1.9,z-.3,3.3,z+.3)});
 b(7.4,2.2,.04,'#9aa0a6',17.9,1.4,.03);b(7.2,2.1,.02,'*dcecf4',17.9,1.4,.06);for(let i=0;i<5;i++)b(.3,2.1,.02,'*f4fbff',14.8+i*1.5,1.4,.075);
 b(4,.1,.6,'#333',17.9,.5,1);b(4,.1,.6,'#333',17.9,.9,.9);[16,19.8].forEach(x=>b(.1,.9,.6,'#333',x,.45,.95));for(let i=0;i<8;i++){const c=['#c0392b','#2f6fb5','#e6b422','#2a8a4a'][i%4],x=16.3+i*.46;[.62,1.02].forEach(y=>{b(.08,.12,.12,c,x-.12,y,.95);b(.08,.12,.12,c,x+.12,y,.95);b(.18,.04,.04,'#888',x,y,.95)})}K.cl(15.8,.6,20,1.3);
 {const x=18.8,z=4.4;[-1,1].forEach(s=>[-1,1].forEach(t=>b(.08,2.4,.08,'#2a2a2a',x+s*.8,1.2,z+t*.6)));b(1.7,.08,.08,'#2a2a2a',x,2.4,z-.6);b(1.7,.08,.08,'#2a2a2a',x,2.4,z+.6);b(2.2,.05,.05,'#ccc',x,1.5,z-.5);[-1,1].forEach(s=>b(.08,.42,.42,'#222',x+s*1.05,1.5,z-.5));b(.5,.42,1.2,'#222',x,.21,z+.1);b(.46,.08,1.1,'#c0392b',x,.46,z+.1);K.cl(x-1,z-.7,x+1,z+.7)}
 for(let i=0;i<6;i++){const x=15+i*.5;b(.24,.24,.24,'#222',x,.12,6.6);b(.12,.1,.04,'#555',x,.29,6.6)}K.cl(14.8,6.4,17.8,6.8);
 [[13,9.6],[15,9.6],[17,9.6]].forEach((q,i)=>{tfMat(K,q[0],q[1],['#e84a8a','#4ad9c0','#b07aff'][i]);b(.18,.18,.6,'#2a2a2a',q[0]+.5,.09,q[1]-.6)});[[19.6,8.8],[20.4,9.6]].forEach((q,i)=>{b(.65,.65,.65,['#4a90d9','#e84a8a'][i],q[0],.33,q[1]);K.cl(q[0]-.33,q[1]-.33,q[0]+.33,q[1]+.33)});
 for(let i=0;i<8;i++){b(.5,1.9,.5,i%2?'#4a6a8a':'#5a7a9a',3.6+i*.52,.95,.3);b(.1,.04,.02,'#ddd',3.75+i*.52,1.3,.56);b(.3,.04,.02,'#222',3.6+i*.52,1.7,.56)}K.cl(3.3,.05,7.8,.56);b(3,.4,.4,'#8a6a48',5.4,.2,1.5);K.cl(3.9,1.3,6.9,1.7);
 b(2.8,1,.8,'#2a8a6a',14,.5,7.4);b(2.9,.06,.9,'#f4f4f4',14,1.03,7.4);for(let i=0;i<4;i++)b(.12,.24,.12,['#ff7a3a','#2fe68a','#e84a8a','#ffe066'][i],12.9+i*.22,1.18,7.2);b(.2,.4,.2,'#ddd',14.6,1.26,7.3);b(.14,.2,.14,'#ff7a3a',14.6,1.56,7.3);K.cl(12.6,7,15.4,7.8);tfSign(K,'SHAKE BAR','#ffffff','#2a8a6a',1.8,.32,14,.6,{},0,7.82);
 twKeep(g,o,14,6.2,{hair:16,hc:0,eyes:6,mouth:4,top:4,tc:2,pc:4,skin:3,body:.6},'Kira (trainer)',()=>twBuy('Protein shake',10,18),3.0);
 tfTV(K,5.4,2.7,1.6,0,'*2fe68a');b(.5,1,.4,'#c8ccd0',8.2,.5,.4);b(.3,.1,.2,'#888',8.2,1.05,.45);K.cl(7.95,.2,8.45,.6);
 b(1.6,1.4,.5,'#f4f4f4',11,.7,15.4);for(let i=0;i<3;i++)for(let j=0;j<4;j++)b(.34,.12,.4,['#4ad9c0','#f4f4f4','#e84a8a'][i],10.4+j*.38,.35+i*.45,15.4);K.cl(10.2,15.1,11.8,15.7);
 tfPlant(K,21.2,15.2,1,'#3a3f46');tfPlant(K,1,15.2,1,'#3a3f46');[3,7.4].forEach(z=>tfPanel(K,2.6,z,2,1));tfPanel(K,17.9,3,5);tfPanel(K,15,9.6,4);
 tfSign(K,'AURORA FITNESS','#ffffff','#2a8a6a',3,.42,17.9,2.85,{},0,.06);K.done()},
/* 3 Sky Pool: a lap pool with lane ropes, steps and a ladder, loungers, umbrellas, a hot tub, towels */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,.6,15.4,3,'day');
 [[0,-3.3,15.4,.4],[0,3.3,15.4,.4],[-7.5,0,.4,7],[7.5,0,.4,7]].forEach(q=>{b(q[2],.4,q[3],'#f4f2ec',11+q[0],.2,8.6+q[1]);b(q[2]+.04,.04,q[3]+.04,'#2a6a90',11+q[0],.41,8.6+q[1])});b(14.6,.04,6.2,'#1a5a8a',11,.02,8.6);const wm=new THREE.Mesh(new THREE.PlaneGeometry(14.6,6.2),new THREE.MeshBasicMaterial({map:tfWaterTex('#3aa8e0','#7ad0f4')}));wm.material.map.repeat.set(7,3);K.add(wm,11,.3,8.6).rotation.x=-Math.PI/2;
 [7.1,8.6,10.1].forEach(z=>{for(let i=0;i<29;i++)b(.36,.08,.08,i%2?'#ffffff':(z==8.6?'#c0392b':'#2f6fb5'),4.1+i*.5,.32,z)});
 [-.3,.3].forEach(s=>{b(.06,.8,.06,'#d0d6dc',17.6+s,.75,5.5);b(.06,.06,.3,'#d0d6dc',17.6+s,1.15,5.65)});for(let i=0;i<3;i++)b(.6,.03,.1,'#d0d6dc',17.6,.5-i*.15,5.6);
 for(let i=0;i<4;i++)b(1.4,.36-i*.08,.4,'#e8eef2',4.4,(.36-i*.08)/2,6.1+i*.4);K.cl(3.3,5.1,18.7,12.1);for(let i=0;i<8;i++)b(.5,.2,.02,'#1a4a7a',4+i*2,.2,12.11);
 const lounger=(x,z,c,f)=>{b(.7,.2,1.8,'#fafafa',x,.25,z);b(.6,.08,1.2,c,x,.39,z+(f?-.3:.3));b(.7,.32,.5,'#fafafa',x,.4,z+(f?.7:-.7));b(.6,.08,.46,c,x,.58,z+(f?.66:-.66));K.cl(x-.4,z-.9,x+.4,z+.9)};
 [[2.4,3.2],[5,3.2],[15.6,3.2],[18.2,3.2],[20.6,3.2]].forEach((q,i)=>lounger(q[0],q[1],['#4ad9c0','#ffe066','#e84a8a','#4a90d9','#ff7a3a'][i]));[3.8,6.8,9.8,12.8].forEach((x,i)=>lounger(x,14.1,['#ffe066','#4ad9c0','#ff7a3a','#e84a8a'][i],1));
 [[3.7,2.2,'#e84a8a'],[16.9,2.2,'#ffe066'],[8.3,14.1,'#4a90d9']].forEach(q=>{b(.08,2.2,.08,'#8a5a36',q[0],1.1,q[1]);b(1.9,.12,1.9,q[2],q[0],2.3,q[1]);b(1.4,.1,1.4,'#f4f4f4',q[0],2.4,q[1]);b(.7,.1,.7,q[2],q[0],2.5,q[1])});
 b(2.8,.7,2.8,'#d9d2c8',18.4,.35,14);b(2.4,.08,2.4,'#5ad0e8',18.4,.66,14);for(let i=0;i<6;i++)b(.08,.08,.08,'*e8f8ff',17.5+i*.36,.72,13.4+(i%2)*1.2);K.cl(17,12.6,19.8,15.4);
 b(1.4,1.6,.5,'#8a6a48',13.6,.8,.3);for(let i=0;i<3;i++)for(let j=0;j<3;j++)b(.4,.14,.4,['#f4f4f4','#4ad9c0','#ffe066'][(i+j)%3],13.15+j*.45,.4+i*.45,.35);K.cl(12.9,.05,14.3,.55);
 tfSign(K,'SKY POOL','#ffffff','#2a7ab0',2.6,.46,5.4,2.6,{},0,.04);b(2.2,.3,.04,'*ffffff',5.4,2.1,.08);
 tfPlant(K,21.2,15.2,1.1,'#f4f2ec');tfPlant(K,1,15.2,1.1,'#f4f2ec');tfTree(K,21.1,8.6,1,'#f4f2ec');tfTree(K,1,1,1,'#f4f2ec');[6,11,16].forEach(x=>tfPanel(K,x,8.6,3,1));K.done()},
/* 4 Penthouse Showroom: a furnished flat with a living room, an open kitchen with an island, a dining table, a bedroom and a bath */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,.6,15.4,4,'sunset');
 tfRug(K,4.2,3.2,5.4,4,'#d9c8a0','#a8946a','#c8b48a');b(3.6,.5,.5,'#2a2a2a',4.2,.25,.35);b(3.7,.04,.56,'#8a5a36',4.2,.52,.35);K.cl(2.4,.05,6,.65);tfTV(K,4.2,1.55,2.6,0,'*3a6a9a');b(.3,.8,.3,'#1a1a1a',2.2,.92,.35);b(.3,.8,.3,'#1a1a1a',6.2,.92,.35);
 tfSofa(K,4.2,5.2,2,3,'#3a3f46','#e6b422');tfSofa(K,1.4,3,1,1.1,'#c9a27a');tfCTable(K,4.2,3,1.6,.9,'#8a5a36','#2a2a2a');tfLamp(K,1.3,1,'#f0e6d0');tfPlant(K,7.2,.8,1,'#f0e6d0');
 /* kitchen */
 b(7.4,.9,.65,'#3f5a6a',17.8,.45,.38);b(7.5,.06,.7,'#e8e4dc',17.8,.93,.38);for(let i=0;i<9;i++){b(.76,.8,.02,'#4a6a7c',14.5+i*.82,.45,.72);b(.04,.04,.02,'#c9a227',14.5+i*.82,.75,.74)}b(7.4,.9,.03,'#cfd8dc',17.8,1.42,.02);for(let i=0;i<24;i++)b(.28,.14,.02,i%2?'#e8eef0':'#d4dee2',14.3+i*.3,1.2+(i%3)*.18,.05);
 b(.8,.04,.5,'#c8ccd0',15.8,.96,.4);b(.06,.3,.06,'#c8ccd0',15.8,1.12,.2);b(.8,.03,.5,'#111',18.6,.97,.4);for(let i=0;i<4;i++)b(.18,.01,.18,'#555',18.4+(i%2)*.4,.99,.28+Math.floor(i/2)*.26);b(1,.5,.45,'#c8ccd0',18.6,2.3,.25);b(.3,.8,.3,'#c8ccd0',18.6,2.95,.15);
 [15,16.4,20.2].forEach(x=>{b(1.3,.8,.4,'#4a6a7c',x,2.2,.22);b(1.2,.02,.02,'#c9a227',x,1.85,.43)});b(1,2.2,.7,'#c8ccd0',21.2,1.1,.4);b(.04,.8,.04,'#888',20.75,1.4,.76);K.cl(14,.03,21.7,.75);
 b(3.2,.9,1,'#3f5a6a',17.8,.45,3.4);b(3.4,.07,1.2,'#f4f2ec',17.8,.94,3.4);K.cl(16.1,2.8,19.5,4);for(let i=0;i<3;i++)tfStool(K,16.8+i,4.4,'#c9a27a',.78);b(.4,.14,.3,'#e6b422',17.2,1.04,3.3);b(.2,.3,.2,'#f4f4f4',18.6,1.12,3.4);[16.8,17.8,18.8].forEach(x=>tfPend(K,x,3.4,'#2a2a2a','*ffe6a8',2.4,.7));
 /* dining */
 tfRug(K,17.4,8.6,4.6,3,'#3a3f46','#2a2a2a');b(2.4,.06,1.1,'#8a5a36',17.4,.76,8.6);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>b(.07,.73,.07,'#4a2f1c',17.4+q[0]*1.1,.365,8.6+q[1]*.45));K.cl(16.2,8.05,18.6,9.15);[16.7,18.1].forEach(x=>{tfChair(K,x,7.8,0,'#2a2a2a','#888');tfChair(K,x,9.4,2,'#2a2a2a','#888')});b(.4,.1,.2,'#ff7a3a',17.4,.84,8.6);tfChand(K,17.4,8.6,'*ffe6a8',2.4);
 /* bedroom behind a low bookcase */
 b(5.6,1.2,.4,'#8a5a36',3,.6,8);for(let i=0;i<2;i++){b(5.5,.04,.36,'#6b4a2e',3,.35+i*.5,8);for(let j=0;j<12;j++)b(.12,.3,.26,['#c0392b','#2f6fb5','#e6b422','#3f8f5a','#f4f4f4'][(i+j)%5],.7+j*.42,.52+i*.5,8)}K.cl(.2,7.8,5.8,8.2);
 tfRug(K,3.2,12.4,4.4,3.6,'#e8d8c8','#c8b8a8');tfBed(K,1.6,12.4,1,1.8,'#8a6a48','#e8eef4');[[1,10.8],[1,14]].forEach(q=>{b(.5,.5,.5,'#6b4a2e',q[0],.25,q[1]);b(.2,.3,.2,'#f0e6d0',q[0],.65,q[1]);b(.1,.04,.1,'*fff2c8',q[0],.81,q[1]);K.cl(q[0]-.25,q[1]-.25,q[0]+.25,q[1]+.25)});
 b(.6,2,1.6,'#c8b8a8',6.4,1,12.4);b(.02,1.8,.02,'#888',6.08,1,12.4);K.cl(6.1,11.6,6.7,13.2);
 /* bath */
 b(1.8,.6,.9,'#f8f8f8',19.8,.3,14.4);b(1.6,.05,.7,'#bfe6f4',19.8,.58,14.4);b(.08,.3,.08,'#c8ccd0',20.6,.75,14.4);K.cl(18.9,13.95,20.7,14.85);b(.8,.02,.5,'#f4f4f4',21.2,.02,12.8);tfPlant(K,21.2,11.6,.8,'#f4f4f4');
 twKeep(g,o,14,12.6,{hair:6,hc:6,eyes:0,mouth:3,top:2,tc:5,pc:0,skin:1,body:.4},'Vera (sales agent)',()=>say('Vera: "Like the penthouse? Book a viewing on the Property website to upgrade your own home."'),2.8);
 b(1.6,.85,.6,'#f4f2ec',14,.43,13.6);b(1.7,.05,.7,'#8a5a36',14,.88,13.6);b(.3,.02,.2,'#e84a8a',13.6,.92,13.6);b(.3,.02,.2,'#4a90d9',14.1,.93,13.6);K.cl(13.15,13.25,14.85,13.95);
 tfPic(K,11,1.8,2.2,1.4,63);tfPlant(K,12.6,15.2,.9,'#f0e6d0');tfTree(K,9,6,1,'#f0e6d0');tfPend(K,3.2,12.4,'#f0e6d0','*ffe6a8',2.7,1);tfPend(K,4.2,3.2,'#2a2a2a','*ffe6a8',2.7,1.1);K.done()}];

/* ================= Nova Mall ================= */
function tfStall(K,x,c,name,menu){const b=K.b;b(3.2,2.5,.12,dkc(c,.5),x,1.25,.07);for(let i=0;i<8;i++)for(let j=0;j<5;j++)b(.38,.38,.02,(i+j)%2?'#f4f4f4':'#e0e0e0',x-1.4+i*.4,.5+j*.4,.14);
 b(3.4,.14,.7,c,x,2.62,.42);for(let i=0;i<8;i++)b(.21,.15,.72,'#ffffff',x-1.5+i*.43,2.62,.42);b(3.4,.1,.04,dkc(c,.7),x,2.52,.78);
 tfSign(K,name,'#ffffff',c,2.8,.42,x,3.0,{glow:'#ffffff'},0);tfBoardM(K,tfBoard(name,menu,'#f4f4f4','#22262e',c,1.5,.9),1.3,.8,x+.75,1.85,0,.14);
 b(3,1,1,dkc(c,.75),x,.5,3.2);b(3.2,.07,1.15,'#e8e8e8',x,1.03,3.2);for(let i=0;i<6;i++)b(.42,.8,.02,i%2?c:dkc(c,.9),x-1.25+i*.5,.5,3.71);K.gl(2.6,.4,.04,x,1.3,3.5);b(2.6,.03,.06,'#c8ccd0',x,1.5,3.5);K.cl(x-1.6,2.6,x+1.6,3.8);
 b(.36,.22,.3,'#333',x+1.1,1.18,3.1);b(1,.9,.6,'#c8ccd0',x-.8,.45,.6);b(.9,.04,.5,'#555',x-.8,.92,.6);b(.3,.3,.3,'#888',x-1,1.1,.6);K.cl(x-1.3,.25,x-.3,.95)}
TFB['Nova Mall']=[
/* 1 Food Court: four food stalls with signs, menus and kitchens, tables, escalators, a directory */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,14.6,15.7,1,'day',.2,3.1,'#8a8f96');
 tfStall(K,2.4,'#c0392b','BURGERS',['Classic|6','Cheese|7','Fries|3']);tfStall(K,6,'#2f6fb5','RAMEN',['Shoyu|9','Miso|9','Gyoza|5']);tfStall(K,15.5,'#e84a8a','BOBA',['Milk tea|5','Taro|5.5','Mango|5']);tfStall(K,19.1,'#2a8a4a','SALADS',['Greek|7','Caesar|7','Poke|9']);
 twKeep(g,o,15.5,2.0,{hair:8,hc:4,eyes:1,mouth:0,top:0,tc:9,pc:5,skin:2,body:.45},'Ola (stall vendor)',()=>twBuy('Boba and fries',8,14),3.4);
 for(let i=0;i<6;i++)b(.12,.24,.12,['#f4d0e0','#c9a27a','#ffe066'][i%3],14.6+i*.25,1.18,3.0);for(let i=0;i<3;i++)b(.3,.18,.2,'#e8b04a',2+i*.4,1.12,3.0);for(let i=0;i<3;i++)b(.3,.14,.3,'#f4f4f4',5.5+i*.45,1.12,3.0);for(let i=0;i<4;i++)b(.3,.12,.3,'#2fe68a',18.3+i*.4,1.11,3.0);
 [[5.4,7.6],[8.6,7.6],[13.8,7.6],[17.4,7.6],[5.4,11.4],[8.6,11.4],[13.8,11.4],[17.4,11.4]].forEach((q,i)=>{tfRTable(K,q[0],q[1],.55,'#f4f4f4',.76,'#555');[[0,-.85,0],[0,.85,2],[-.85,0,1],[.85,0,3]].forEach(c=>tfChair(K,q[0]+c[0],q[1]+c[1],c[2],['#e84a8a','#ffe066','#4ad9c0','#ff7a3a'][i%4],'#888'));b(.14,.1,.14,'#f4f4f4',q[0],.83,q[1])});
 [[5.4,7.6,'#e6b422'],[17.4,11.4,'#4ad9c0']].forEach(q=>{b(.06,2.4,.06,'#888',q[0],1.2,q[1]);b(1.9,.12,1.9,q[2],q[0],2.45,q[1]);b(1.3,.1,1.3,'#f4f4f4',q[0],2.55,q[1])});
 tfEsc(K,.95,5,13.6);tfEsc(K,2.25,5,13.6);
 b(.6,2,.6,'#2a2a34',12.8,1,13.6);b(.02,1.4,.5,'*7fc8ff',13.11,1.2,13.6);b(.02,.3,.4,'*ff4da6',13.115,1.75,13.6);K.cl(12.5,13.3,13.1,13.9);
 tfSign(K,'NOVA MALL','#ffffff','#2a2a34',4,.6,11,3.0,{glow:'#ff4da6',border:'#ff4da6'},0,6.0);b(.04,.5,.04,'#333',9.2,3.15,6.03);b(.04,.5,.04,'#333',12.8,3.15,6.03);
 tfTree(K,8.2,15,1,'#e8dcc0');tfTree(K,21.1,14.8,1,'#e8dcc0');b(.5,.8,.5,'#555',4.6,.4,15.2);b(.5,.8,.5,'#2a8a4a',5.2,.4,15.2);K.cl(4.3,14.9,5.5,15.5);
 [5.4,8.6,13.8,17.4].forEach(x=>tfPanel(K,x,9.5,2.6,1));INT.push({x:o+11,z:335,r:1.6,l:'Leave mall',a:leaveShop});K.done()},
/* 2 Fashion Floor: two boutiques with glass fronts and signs, mannequins, rails, a shoe display, the stylist's counter */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,14.6,15.7,2,'day');
 const shop=(x0,x1,name,c,bg)=>{const cx=(x0+x1)/2;b(x1-x0,.02,4.1,bg,cx,.012,2.2);tfGlassX(K,x0,x1,4.2,2.6,cx-.7,cx+.7);b(x1-x0,.6,.2,dkc(c,.5),cx,2.9,4.2);tfSign(K,name,'#ffffff',c,Math.min(4,x1-x0-.6),.42,cx,2.9,{glow:'#ffffff'},0,4.3);
  for(let i=0;i<2;i++){const rx=x0+1.4+i*(x1-x0-2.8);b(1.6,.04,.04,'#888',rx,1.55,1.3);[-.75,.75].forEach(s=>b(.04,1.55,.04,'#888',rx+s,.78,1.3));for(let j=0;j<6;j++)b(.18,.7,.36,['#e84a8a','#2a2a2a','#4a90d9','#f4f4f4','#ffe066','#9b59b6'][(j+i*2)%6],rx-.6+j*.24,1.15,1.3);K.cl(rx-.8,1.1,rx+.8,1.5)}
  b(x1-x0-.8,1.8,.4,'#f4f4f4',cx,.9,.25);for(let i=0;i<3;i++){b(x1-x0-.9,.04,.36,'#d8d8d8',cx,.5+i*.55,.3);for(let j=0;j<Math.floor((x1-x0-1.2)/.4);j++)b(.3,.18,.26,['#e84a8a','#2a2a2a','#c9a227','#4a90d9','#f4f4f4'][(i+j)%5],x0+.75+j*.4,.62+i*.55,.3)}K.cl(x0+.4,.05,x1-.4,.47);
  [x0+.8,x1-.8].forEach((mx,k)=>{b(.7,.12,.7,'#2a2a2a',mx,.06,3.6);b(.06,.5,.06,'#888',mx,.37,3.6);b(.44,.5,.26,['#e84a8a','#2a2a2a'][k],mx,.9,3.6);b(.4,.6,.24,['#2a2a2a','#c9a227'][k],mx,1.45,3.6);b(.16,.1,.16,'#e8d8c8',mx,1.8,3.6);b(.24,.26,.24,'#e8d8c8',mx,1.98,3.6);K.cl(mx-.35,3.25,mx+.35,3.95)})};
 shop(.3,8,'THREADZ','#e84a8a','#f4eef2');shop(14,21.7,'LUXE','#2a2a2a','#efe8dc');
 [[6,8.2],[9.4,9.6],[16,8.2],[12.6,9.6]].forEach((q,i)=>{b(.9,.4,.9,'#ffffff',q[0],.2,q[1]);b(.5,.8,.35,['#e84a8a','#4a90d9','#ffe066','#2fe68a'][i],q[0],.8,q[1]);b(.45,.8,.3,['#2c3e50','#7f8c8d','#d9c8a0','#111111'][i],q[0],1.45,q[1]);b(.3,.3,.3,'#e8c9a0',q[0],2.05,q[1]);K.cl(q[0]-.5,q[1]-.5,q[0]+.5,q[1]+.5)});
 [[7.4,12.6],[11,12.4]].forEach((q,k)=>{b(1.4,.04,1.4,'#888',q[0],1.4,q[1]);b(.06,1.4,.06,'#888',q[0],.7,q[1]);b(.6,.04,.6,'#888',q[0],.02,q[1]);for(let a=0;a<10;a++){const an=a*Math.PI/5;b(.2,.62,.2,['#e84a8a','#4a90d9','#ffe066','#2fe68a','#9b59b6','#e74c3c','#f4f4f4','#2a2a2a','#ff7a3a','#4ad9c0'][(a+k*3)%10],q[0]+Math.cos(an)*.62,1.08,q[1]+Math.sin(an)*.62)}K.cl(q[0]-.75,q[1]-.75,q[0]+.75,q[1]+.75)});
 b(3,.9,1,'#ffffff',4.6,.45,13.8);b(3.1,.05,1.1,'#c9a227',4.6,.92,13.8);for(let i=0;i<6;i++){b(.3,.12,.16,['#f4f4f4','#2a2a2a','#e84a8a','#c9a227','#4a90d9','#8a5a36'][i],3.5+i*.42,1.01,13.6);b(.3,.12,.16,['#2a2a2a','#e84a8a','#f4f4f4','#4a90d9','#c9a227','#ffe066'][i],3.5+i*.42,1.01,14)}K.cl(3.05,13.25,6.15,14.35);
 b(4,1,1,'#2a2a34',15.5,.5,13.2);b(4.1,.06,1.1,'#e8e0d0',15.5,1.03,13.2);b(.36,.22,.3,'#333',16.8,1.18,13.1);b(.5,.06,.36,'#e84a8a',14.6,1.08,13.2);K.cl(13.45,12.65,17.55,13.75);
 twKeep(g,o,15.5,12.1,{hair:13,hc:5,eyes:6,mouth:4,top:5,tc:4,pc:6,skin:1,body:.4},'Sasha (stylist)',()=>say('Sasha: "Try Threadz on your laptop: every piece comes in 24 colours. Wear it from the wardrobe at home."'),2.8);
 b(1.2,.9,.8,'#ffffff',20.6,.45,9);b(.04,1.8,1.1,'#c9a227',21.6,1.4,11.6);b(.02,1.7,1,'*dcecf4',21.57,1.4,11.6);K.cl(20,8.6,21.2,9.4);
 tfEsc(K,.95,5,13.6);tfEsc(K,2.25,5,13.6);
 tfSign(K,'SALE','#ffffff','#c0392b',1.2,.5,9.4,2.9,{},0,4.3);tfSign(K,'NEW IN','#111111','#ffe066',1.2,.5,12.6,2.9,{},0,4.3);[9.4,12.6].forEach(x=>b(.03,.5,.03,'#333',x,3.2,4.33));
 tfTree(K,8.2,15,1,'#ffffff');tfTree(K,21.1,15,1,'#ffffff');[5,11,17].forEach(x=>tfPanel(K,x,7.4,3));K.done()},
/* 3 Tech Floor: a video wall, the NOVA TECH store, display tables with laptops, a gaming area, a VR spot, the help desk */
(g,o)=>{const K=tfK(g,o),b=K.b;tfWin(K,1,14.6,15.7,3,'day');
 b(7.6,2.4,.12,'#111',4.2,1.65,.07);[[1.3,'*3a6a9a'],[3.2,'*6a3a9a'],[5.1,'*2fa86a'],[7,'*c05a2a']].forEach((q,i)=>{b(1.8,1,.04,q[1],q[0],2.2,.15);b(1.8,1,.04,['*e84a8a','*4a90d9','*ffe066','*4ad9c0'][i],q[0],1.12,.15);b(.8,.3,.02,'*ffffff',q[0]-.3,2.3,.18)});b(7.6,.06,.06,'*4ad9c0',4.2,.4,.12);
 b(7.7,.02,4.1,'#26303e',17.85,.012,2.2);tfGlassX(K,14,21.7,4.2,2.6,17.15,18.55);b(7.7,.6,.2,'#111',17.85,2.9,4.2);tfSign(K,'NOVA TECH','#7fe8ff','#111111',3.6,.42,17.85,2.9,{glow:'#4ad9ff'},0,4.3);
 b(6.8,1,.5,'#e8e8ec',17.85,.5,.3);for(let i=0;i<12;i++){b(.3,.42,.04,'#111',14.9+i*.54,1.3,.3);b(.26,.36,.02,['*7fc8ff','*ffd27a','*c8b0ff','*9fe0b0'][i%4],14.9+i*.54,1.3,.33)}for(let i=0;i<5;i++){b(1,.6,.06,'#111',15.2+i*1.3,2.2,.07);b(.92,.52,.02,['*3a6a9a','*6a3a9a','*2fa86a','*c05a2a','*e84a8a'][i],15.2+i*1.3,2.2,.11)}K.cl(14.4,.05,21.3,.55);
 [16,19.6].forEach(x=>{b(2,.9,1,'#f4f4f4',x,.45,2.4);for(let i=0;i<4;i++){b(.24,.02,.4,'#111',x-.7+i*.46,.91,2.4);b(.2,.01,.34,'*7fc8ff',x-.7+i*.46,.925,2.4)}K.cl(x-1,1.9,x+1,2.9)});
 [[4.4,6.4],[7.8,6.4],[14,7.6],[18,7.6]].forEach((q,i)=>{b(2.2,.86,1.1,'#d9c8a0',q[0],.43,q[1]);b(2.3,.06,1.2,'#f4f4f4',q[0],.89,q[1]);[-.6,.6].forEach(s=>{b(.7,.04,.46,'#cfd3d8',q[0]+s,.93,q[1]+.1);b(.66,.42,.03,'#222',q[0]+s,1.14,q[1]-.13);b(.6,.36,.01,['*7fc8ff','*c8b0ff','*9fe0b0','*ffd27a'][(i+(s>0?1:0))%4],q[0]+s,1.14,q[1]-.11)});b(.16,.02,.3,'#111',q[0],.93,q[1]+.3);K.cl(q[0]-1.15,q[1]-.6,q[0]+1.15,q[1]+.6)});
 tfRug(K,6.4,11.6,5.6,3.6,'#3a2a5a','#1a1a2a','#5a3a8a');b(3,.5,.5,'#111',6.4,.25,10);tfTV(K,6.4,1.3,2.8,0,'*e84a8a',9.85);b(1.4,.3,.02,'*ffe066',6.8,1.4,9.97);
 [5.2,7.6].forEach(x=>{const o2=(...a)=>K.ob(x,11.8,2,...a);o2(.6,.12,.6,'#111',0,.06,0);o2(.08,.3,.08,'#555',0,.25,0);o2(.56,.12,.56,'#c0392b',0,.45,0);o2(.56,.7,.12,'#c0392b',0,.85,-.25);o2(.4,.2,.13,'#111',0,1.15,-.26)});K.cl(4.9,9.7,7.9,10.25);
 b(1.6,.02,1.6,'#2a2a3a',10.6,.012,12.6);b(1.4,.024,1.4,'*4ad9ff',10.6,.014,12.6);b(.3,1.2,.3,'#111',11.6,.6,11.8);b(.36,.2,.24,'#f4f4f4',11.6,1.3,11.8);K.cl(11.4,11.6,11.8,12);
 b(5.5,1,1,'#1a1a22',17,.5,13);b(5.6,.06,1.1,'#e8e0d0',17,1.03,13);for(let i=0;i<3;i++){b(.5,.32,.04,'#111',15.4+i*1.6,1.25,12.9);b(.44,.26,.02,'*7fc8ff',15.4+i*1.6,1.25,12.93)}K.cl(14.2,12.45,19.8,13.55);tfSign(K,'HELP DESK','#ffffff','#2a8ad0',1.6,.32,17,.6,{},0,13.52);
 twKeep(g,o,17,11.9,{hair:16,hc:0,eyes:5,mouth:3,top:2,tc:0,pc:4,skin:3,body:.5},'Ben (tech seller)',()=>say('Ben: "Better gear at home means better songs. Check the Gearhouse site on your laptop."'),2.8);
 /* the top of the escalators from the floor below: an opening with a glass balustrade */
 b(3,.02,8.4,'#0c0e12',1.6,.012,9.6);[.3,2.9].forEach(x=>{K.gl(.04,1,8.4,x,.5,9.6);b(.08,.06,8.4,'#c8ced4',x,1.02,9.6)});K.gl(2.6,1,.04,1.6,.5,13.8);b(2.6,.06,.08,'#c8ced4',1.6,1.02,13.8);K.cl(.3,5.4,2.95,13.85);
 b(2.8,.04,.9,'#b0b6bc',1.6,.02,4.9);for(let i=0;i<6;i++)b(.04,.045,.6,'#8a9096',.6+i*.4,.025,4.9);[0,1].forEach(i=>{b(.12,1,.5,'#c8ced4',.35+i*2.5,.5,5.5);b(.1,.06,.5,'#222',.35+i*2.5,1.02,5.5)});
 b(14,.03,.06,'*4ad9ff',11,.02,4.6);
 tfTree(K,21.1,15,1,'#1f2634');tfTree(K,8.2,15,1,'#1f2634');[5,11,17].forEach(x=>tfPanel(K,x,7.4,3,0,'*dff4ff'));K.done()}];

/* ---- use the new floors (the towers are built the first time you go in) ---- */
TOWERS.forEach(T=>{const B=TFB[T.nm];if(B)B.forEach((f,i)=>{if(f)T.B[i]=f})});
