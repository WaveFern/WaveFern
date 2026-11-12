/* Part 1 of 5 (v50.0.1 split of 57-tower-floors.js, code unchanged): the shared kit (window views, textures, floor builder, furniture, per-tower textures). Floors: 57b Skyline, 57c Pulse, 57d Aurora, 57e Nova + hook-up. */
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
 'Aurora Residences':{1:{fl:['slab','#bfb59f','#a89d86'],wl:['panel','#b9af9b','#a59a85']},2:{fl:['rubber','#3a3f46','#2e3238'],wl:['panel','#aab8be','#97a5ac']},3:{fl:['mosaic','#a9bcc2','#94a9b0'],wl:['mosaic','#8db4c2','#7aa2b0']},4:{fl:['plank','#b08a5e','#8a6a48'],wl:['plaster','#c2b4a5','#b2a493']}},
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
/* Aurora Residences is near-white throughout, so the two room lights every floor gets washed it out to plain white: dim them */
{const bt1=buildTF;buildTF=function(T){bt1(T);try{if(T.nm=='Aurora Residences')(T.groups||[]).forEach(g=>g.traverse(o=>{if(o.isPointLight&&!o.userData.dim){o.userData.dim=1;o.intensity*=.3}}))}catch(e){console.error('aurora light',e)}}}
/* the night view fades in through the windows, the pool water moves */
{const u0=update;update=function(dt){u0(dt);if(!IN||!TW||!TW.groups||IN.i!==TW.idx)return;const t=S.t||0,f=t<240?0:t<300?(t-240)/60*.5:t<330?.5+(t-300)/30*.5:1;
 for(const q of TFNV)if(q[1].visible&&Math.abs(q[0].opacity-f)>.004)q[0].opacity=f;for(const a of TFAN){a[0].offset.x=(a[0].offset.x+a[1]*dt)%1;a[0].offset.y=(a[0].offset.y+a[2]*dt)%1}}}
