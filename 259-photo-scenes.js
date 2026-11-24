/* ===== v55.52.24 (held): more backgrounds for Instagrime posts and News pictures =====
   Adds pixel-art scene variants to the photo scenes of 178-instagrime-photos.js / 227-instagrime-studio.js. Every post of a kind
   (city, park, home, studio, stage, album, fit) picks one of its variants from its own hash, so the whole feed gets more varied
   backgrounds, and the post studio's backdrop picker lists them too. Same format as 227: {n, bg(x,r,h,p), fg(x,r,h), set(h)} on a
   160x120 canvas, drawn behind and in front of the 3D people. Helpers reused: igxF/igxGrad/igxDisc/igxTxt/igxMix, igxBrick, igxTree.
   Held: HELD=true keeps it dev-only (window.FW_DEV) until release day, then set HELD=false. */
(function(){
const HELD=true;
if(HELD&&!window.FW_DEV)return;
if(typeof IGXS=='undefined'||!IGXS.city||!IGXS.city.V||typeof igxTree!='function'||typeof igxBrick!='function')return;
const _S=IGXS,F=igxF,G=igxGrad,D=igxDisc,T=igxTxt,M=igxMix,hsl=(h,s,l)=>'hsl('+(((h%360)+360)%360)+','+s+'%,'+l+'%)';
/* ---------- shared pixel helpers for the new scenes ---------- */
const stars=(x,r,n,y1)=>{for(let i=0;i<n;i++){const a=r()<.2?'#ffffff':'#ffffffaa';F(x,a,r()*158,r()*y1,1,1);if(r()<.08){F(x,'#fff6',r()*158,r()*y1,2,1)}}};
const cloud=(x,cx,cy,c,s)=>{s=s||1;[[-10,2,20,4],[-6,-1,14,4],[0,-3,10,5],[-14,3,6,2],[8,2,8,3]].forEach(([a,b,w,hh])=>F(x,c,cx+a*s,cy+b*s,w*s,hh*s))};
const glow=(x,cx,cy,rad,col,a)=>{x.save();for(let i=rad;i>0;i-=2){x.globalAlpha=a*(1-i/rad)*.9+.02;D(x,col,cx,cy,i)}x.restore()};
const wins=(x,bx,by,bw,bh,r,on,off,st,gap)=>{for(let wy=by+3;wy<by+bh-3;wy+=st+gap)for(let wx=bx+2;wx<bx+bw-3;wx+=st+gap-1)F(x,r()<.55?on:off,wx,wy,st-1,st)};
const skyline=(x,r,h,base,cols,hmin,hmax,on,off,w0,w1)=>{let px=-4;while(px<160){const bw=w0+r()*(w1-w0),bh=hmin+r()*(hmax-hmin),c=cols[Math.floor(r()*cols.length)];F(x,c,px,base-bh,bw,bh);F(x,'#0003',px+bw-2,base-bh,2,bh);F(x,M(c,'#fff',.15),px,base-bh,bw,1);
  if(on)wins(x,px,base-bh,bw,bh,r,on,off,3,2);px+=bw+(r()<.3?1:0)}};
const pine=(x,tx,ty,s,snow,c1,c2)=>{c1=c1||'#1f5a3a';c2=c2||'#2f7a4a';F(x,'#4a2e1a',tx-1,ty+10*s,3*s,6*s);for(let i=0;i<4;i++){const w=(14-i*3)*s,yy=ty+i*5*s;F(x,c1,tx-w/2,yy,w,5*s);F(x,c2,tx-w/2,yy,w/2,2*s);if(snow){F(x,'#f4fbff',tx-w/2,yy,w,1.5*s);F(x,'#e0f0fa',tx-w/2+1,yy+1.5*s,w*.6,1)}}};
const lamp=(x,lx,ly,hh,col)=>{F(x,'#2a2a34',lx,ly,2,hh);F(x,'#2a2a34',lx-3,ly,8,2);F(x,col||'#ffe27a',lx-3,ly+2,8,3);glow(x,lx+1,ly+4,16,col||'#ffe27a',.35)};
const rain=(x,r,n,c)=>{for(let i=0;i<n;i++){const a=r()*160,b=r()*120;F(x,c||'#bfd8ff66',a,b,1,4+r()*3);F(x,c||'#bfd8ff33',a-1,b+5,1,2)}};
const bunting=(x,y0,y1,r,h)=>{for(let i=0;i<160;i+=3){const yy=y0+Math.sin(i/160*Math.PI)*(y1-y0);if(i%6==0)F(x,hsl(h+i*9,70,55),i,yy,3,4)}};
const ground=(x,c1,c2,y)=>{G(x,c1,c2,y,120);for(let i=0;i<30;i++)F(x,'#0000001a',(i*37)%160,y+((i*13)%(120-y)),6,1)};
const NM=p=>{try{return igxClip(igxArtist(p),9)}catch(e){return'NEW'}};
const push=(k,...v)=>{_S[k].V=_S[k].V||[_S[k]];_S[k].V.push(...v)};
const lc=(a,k,r)=>({amb:a,key:k,rim:r});

/* ============ CITY ============ */
push('city',
{n:'Roof night',bg(x,r,h,p){G(x,'#0e1030','#6a3a7a',0,50);G(x,'#6a3a7a','#ff9a6a',50,72);stars(x,r,50,36);D(x,'#fff1c8',128,20,6);D(x,'#0e1030',131,19,5);
  skyline(x,r,h,84,['#1a1838','#221f46','#2a2650'],14,44,'#ffd77a','#2a2650',9,16);skyline(x,r,h,92,['#120f28','#18153a'],10,34,'#ffe9a0','#18153a',10,18);
  F(x,'#2a2236',30,52,10,10);F(x,'#2a2236',29,50,12,2);F(x,'#2a2236',34,62,2,10);F(x,'#1a1630',118,40,1,22);F(x,'#ff3b3b',118,39,1,1);glow(x,118,39,6,'#ff3b3b',.5);
  F(x,'#14101e',0,92,160,28);F(x,'#2a2438',0,92,160,3);F(x,'#3a3248',0,95,160,1);for(let i=0;i<160;i+=20)F(x,'#1c1828',i,96,2,24)},
 fg(x,r,h){for(let i=0;i<14;i++){const lx=i*12+3,ly=100+Math.sin(i*.9)*2;F(x,'#2a2236',lx,ly,10,1);D(x,['#ffd36a','#ff7ab0','#7ae0ff'][i%3],lx+5,ly+3,2);glow(x,lx+5,ly+3,7,'#ffd36a',.22)}},
 set:h=>({shot:'full',xs:[-.3],ry:.3,lc:lc('#9a88d0','#ffd0a0','#ff6a9a')})},
{n:'Neon alley',bg(x,r,h,p){F(x,'#14121c',0,0,160,120);igxBrick(x,'#3a2e3c','#2a2030',0,92,0,160);for(let i=0;i<30;i++)F(x,'#0006',r()*160,r()*92,8+r()*10,2);
  const sg=[['RAMEN','#ff4fa0',8,10],['BAR','#4fd8ff',104,6],['24H','#ffe066',60,40]];sg.forEach(([t,c,sx,sy])=>{const w=igxTW(t,2)+8;F(x,'#0a0810',sx,sy,w,15);F(x,M(c,'#000',.25),sx+1,sy+1,w-2,13);T(x,t,sx+4,sy+4,'#fff',2);glow(x,sx+w/2,sy+7,26,c,.5)});
  F(x,'#1a1620',120,20,26,52);F(x,'#2a2432',122,22,22,48);F(x,'#ff4fa022',124,24,18,44);F(x,'#0a0810',0,92,160,28);
  for(let i=0;i<6;i++){const px=8+i*26;F(x,['#ff4fa0','#4fd8ff','#ffe066'][i%3]+'55',px,96+(i%2)*6,16,1);F(x,['#ff4fa0','#4fd8ff','#ffe066'][i%3]+'33',px+3,100+(i%2)*6,10,1)}
  F(x,'#2a2432',0,92,160,2);F(x,'#6a6a7a33',70,60,3,30);x.save();x.globalAlpha=.1;D(x,'#cfd8ff',60,70,16);D(x,'#cfd8ff',66,56,12);x.restore()},
 fg(x,r,h){rain(x,r,70,'#bfd8ff55');F(x,'#1a1620',0,112,160,8)},set:h=>({shot:'med',xs:[-.2],ry:.25,lc:lc('#8aa0d8','#ffc8f0','#4fd8ff')})},
{n:'Old town',bg(x,r,h,p){G(x,'#8ac8f4','#e8f6ff',0,62);cloud(x,40,16,'#ffffffcc',1);cloud(x,120,26,'#ffffffaa',.8);
  const cols=['#f0b8a0','#f4dc9a','#a8d0c0','#c8a8d8','#e8a0a0','#a0c0e8'];let px=-6,i=0;while(px<160){const bw=22+r()*8,bh=40+r()*22,c=cols[i++%cols.length];F(x,c,px,86-bh,bw,bh);F(x,M(c,'#000',.18),px+bw-3,86-bh,3,bh);
    F(x,'#8a4a3a',px-1,86-bh-6,bw+2,6);F(x,'#a85a46',px-1,86-bh-6,bw+2,2);for(let wy=86-bh+6;wy<76;wy+=12)for(let wx=px+4;wx<px+bw-6;wx+=9){F(x,'#5a7aa8',wx,wy,5,7);F(x,'#e8f0f8',wx,wy+3,5,1);F(x,'#fff6',wx,wy,1,7)}px+=bw}
  F(x,'#d8d0c0',104,12,14,44);F(x,'#b8aea0',104,12,3,44);F(x,'#8a4a3a',103,6,16,6);F(x,'#a85a46',106,2,10,4);D(x,'#f8f4e8',111,22,4);F(x,'#222',111,20,1,3);F(x,'#222',111,22,2,1);
  ground(x,'#b8a890','#8a7a64',86);for(let i=0;i<14;i++)for(let j=0;j<5;j++)F(x,'#0000001f',i*12+(j%2)*6,88+j*6,10,1)},
 fg(x,r,h){bunting(x,0,16,r,h);F(x,'#6a5a48',0,112,160,8)},set:h=>({shot:'full',xs:[-.35],ry:.3,lc:lc('#e8f0ff','#fff4e0','#ffffff')})},
{n:'Subway',bg(x,r,h,p){F(x,'#d8d4c8',0,0,160,96);for(let i=0;i<160;i+=8)F(x,'#c4bfb2',i,0,1,70);for(let j=0;j<70;j+=6)F(x,'#c4bfb2',0,j,160,1);
  F(x,'#1f6a5a',0,40,160,8);T(x,'CENTRAL',8,42,'#fff');T(x,'LINE 4',112,42,'#ffe066');F(x,'#2a2a30',0,70,160,26);F(x,'#16161a',0,72,160,2);
  F(x,'#3a5a8a',74,52,70,34);for(let i=0;i<4;i++){F(x,'#9ad0f0',78+i*17,56,14,18);F(x,'#fff6',78+i*17,56,3,18);F(x,'#2a4670',78+i*17,74,14,1)}F(x,'#e8c02a',74,80,70,2);
  F(x,'#8a8a94',0,96,160,24);F(x,'#e8c02a',0,98,160,2);for(let i=0;i<160;i+=4)F(x,'#6a6a74',i,102+((i/4)%2)*4,2,2);
  F(x,'#2a2a30',20,12,32,18);F(x,'#ff6a3a',22,14,28,3);T(x,'NEXT 2',26,20,'#ffb070');F(x,'#fff4c0',30,0,40,2);glow(x,50,10,30,'#fff4c0',.18)},
 fg(x,r,h){F(x,'#6a6a74',0,114,160,6);F(x,'#e8c02a',0,112,160,2)},set:h=>({shot:'full',xs:[-.4],ry:.3,lc:lc('#e0f0e8','#ffffff','#7ae0c8')})},
{n:'Harbour',bg(x,r,h,p){G(x,'#ff9a6a','#ffe8b0',0,50);D(x,'#fff4c8',112,44,12);G(x,'#5a90c0','#2a5a88',50,92);for(let i=0;i<40;i++)F(x,'#ffe8b088',60+r()*80,52+r()*38,4+r()*10,1);
  [[16,2],[40,2],[128,1]].forEach(([bx,s])=>{F(x,'#2a2a34',bx,22,2,32);F(x,'#2a2a34',bx-10,22,22,2);F(x,'#c8402a',bx-10,24,3,6)});
  F(x,'#f4f0e8',70,32,8,22);F(x,'#d02c2c',70,38,8,3);F(x,'#d02c2c',70,46,8,3);F(x,'#2a2a34',69,28,10,4);glow(x,74,30,14,'#ffe27a',.4);
  [[22,70,1],[100,66,1.4],[134,72,.9]].forEach(([bx,by,s])=>{F(x,'#f4f0e8',bx,by,26*s,5*s);F(x,'#2a4670',bx,by+4*s,26*s,2*s);F(x,'#6a4a30',bx+12*s,by-12*s,1,12*s);F(x,'#f4f4f4',bx+13*s,by-12*s,8*s,9*s)});
  F(x,'#7a5a3a',0,92,160,8);for(let i=0;i<160;i+=10)F(x,'#5a3e26',i,92,1,8);F(x,'#9a7a52',0,92,160,2);F(x,'#6a4a2e',0,100,160,20);for(let i=0;i<8;i++)F(x,'#5a3e26',0,102+i*3,160,1)},
 fg(x,r,h){F(x,'#5a3e26',0,114,160,6);for(let i=0;i<5;i++){F(x,'#3a2a1a',i*34+6,106,3,10);F(x,'#6a5a48',i*34+4,104,7,2)}},set:h=>({shot:'full',xs:[.3],ry:-.3,lc:lc('#ffd8b8','#ffe0b0','#ff9a6a')})},
{n:'Market',bg(x,r,h,p){G(x,'#a8d8f8','#f4f8ff',0,36);F(x,'#c8b89a',0,28,160,60);for(let i=0;i<160;i+=10)F(x,'#b8a888',i,28,1,60);
  [[2,'#e84a3a'],[56,'#3aa0e8'],[110,'#e8b02a']].forEach(([sx,c],i)=>{F(x,'#6a4a2e',sx+2,38,2,50);F(x,'#6a4a2e',sx+44,38,2,50);for(let k=0;k<8;k++){F(x,k%2?'#fff':c,sx+k*6,32,6,12);F(x,'#0002',sx+k*6,42,6,2)}F(x,c,sx,30,48,2);
    F(x,'#8a6a42',sx+2,70,46,18);F(x,'#a88a5a',sx+2,70,46,3);const fr=['#e84a3a','#f4c02a','#7ac42a','#e87a2a','#a84ac4'][i];for(let k=0;k<10;k++)D(x,k%2?fr:M(fr,'#fff',.25),sx+7+k*4,68+(k%3),2);for(let k=0;k<4;k++)F(x,'#8a6a42',sx+4+k*11,76,9,10)});
  for(let i=0;i<5;i++){F(x,'#6a4a2e',i*34+10,10,1,8);D(x,['#ffd36a','#ff7a7a','#7ac4ff'][i%3],i*34+10,20,3);glow(x,i*34+10,20,9,'#ffd36a',.25)}
  ground(x,'#b0a086','#8a7a64',88)},fg(x,r,h){F(x,'#6a5a48',0,114,160,6)},set:h=>({shot:'full',xs:[-.25],ry:.25,lc:lc('#fff0dc','#fff4e0','#ffd090')})});

/* ============ PARK ============ */
push('park',
{n:'Snow',bg(x,r,h,p){G(x,'#a8b8d8','#f0f4fa',0,56);cloud(x,36,16,'#ffffffcc',1);cloud(x,124,28,'#ffffffaa',.9);
  for(let i=0;i<160;i++)F(x,'#dce8f4',i,54+Math.sin(i*.05+h)*3+Math.sin(i*.13)*2,1,70);
  [[14,44,1.3],[48,52,.9],[88,40,1.4],[126,50,1],[150,46,.8]].forEach(([tx,ty,s])=>pine(x,tx,ty,s,1));
  G(x,'#f4f8ff','#c8d8ea',70,120);for(let i=0;i<50;i++)F(x,'#fff',r()*160,72+r()*46,3,1);for(let i=0;i<24;i++)F(x,'#b0c4dc',r()*160,76+r()*42,4,1);
  F(x,'#6a4a2e',116,86,24,2);F(x,'#6a4a2e',118,88,2,8);F(x,'#6a4a2e',136,88,2,8);F(x,'#f4f8ff',116,84,24,2);
  D(x,'#f4f8ff',140,100,6);D(x,'#f4f8ff',140,92,4);F(x,'#222',139,91,1,1);F(x,'#222',141,91,1,1);F(x,'#e8672c',140,93,2,1);F(x,'#222',136,99,4,1)},
 fg(x,r,h){for(let i=0;i<70;i++)F(x,r()<.3?'#fff':'#ffffffcc',r()*160,r()*120,1+(r()<.3),1+(r()<.3));F(x,'#e0ecf8',0,114,160,6)},set:h=>({shot:'med',xs:[-.25],ry:.3,lc:lc('#d8e6ff','#ffffff','#9ad0ff')})},
{n:'Blossom',bg(x,r,h,p){G(x,'#8ac8f8','#f8e8f0',0,60);cloud(x,30,14,'#ffffffcc',1);cloud(x,128,22,'#ffffff99',.8);
  F(x,'#9ac0e0',0,52,160,8);for(let i=0;i<8;i++)F(x,'#c4dcf0',i*22,46+(i%3)*2,20,8);
  [[14,30,1.4],[62,36,1.1],[110,28,1.5],[148,38,1]].forEach(([tx,ty,s])=>{F(x,'#4a2e2a',tx-2*s,ty+14*s,4*s,34*s);F(x,'#4a2e2a',tx-8*s,ty+22*s,8*s,2*s);for(let i=0;i<26;i++){const a=tx+(r()-.5)*40*s,b=ty+(r()-.4)*24*s;D(x,['#ffb8d0','#ffd0e0','#ff9ac0','#fff0f4'][i%4],a,b,3+r()*3)}});
  G(x,'#8ac47a','#5a9a52',70,120);for(let i=0;i<60;i++)F(x,['#ffd0e0','#ffb8d0','#fff'][i%3],r()*160,72+r()*46,2,1);F(x,'#d8c8a8',50,80,60,8);F(x,'#c8b898',50,86,60,2)},
 fg(x,r,h){for(let i=0;i<30;i++)F(x,['#ffd0e0','#ffb8d0','#fff'][i%3],r()*160,r()*110,2,1)},set:h=>({shot:'med',xs:[-.2],ry:.3,lc:lc('#ffe8f0','#fff4f0','#ffb8d0')})},
{n:'Lake dock',bg(x,r,h,p){G(x,'#5a8ad8','#c8e8ff',0,48);cloud(x,28,16,'#ffffffcc',1.1);cloud(x,108,12,'#ffffffaa',.9);
  F(x,'#5a7a98',0,40,160,10);[[0,50],[26,44],[56,52],[96,42],[126,50]].forEach(([mx,mh])=>{for(let k=0;k<mh;k++)F(x,k<8?'#f4f8ff':'#6a88a8',mx+(mh-k)*0.5,52-k,mh*1.2-(mh-k),1)});
  G(x,'#6aa8d0','#3a78a8',52,96);for(let i=0;i<40;i++)F(x,'#ffffff55',r()*160,54+r()*40,4+r()*10,1);
  [[8,30],[140,24]].forEach(([tx,ty])=>pine(x,tx,ty,1.5,0,'#14482e','#1f6a40'));
  F(x,'#7a5a3a',0,92,160,10);for(let i=0;i<160;i+=8)F(x,'#5a3e26',i,92,1,10);F(x,'#9a7a52',0,92,160,2);F(x,'#4a3220',0,102,160,18);for(let i=0;i<8;i++)F(x,'#3a2818',i*22+4,102,4,18)},
 fg(x,r,h){F(x,'#3a2818',0,112,160,8);F(x,'#6a4a2e',12,108,3,12)},set:h=>({shot:'med',xs:[.15],ry:-.25,lc:lc('#d8ecff','#fff8e8','#9ad0ff')})},
{n:'Skatepark',bg(x,r,h,p){G(x,'#6ab0f0','#d8f0ff',0,60);cloud(x,120,18,'#ffffffcc',1);F(x,'#9aa0a8',0,50,160,10);igxBrick(x,'#8a8a92','#6a6a72',46,62,0,160);
  for(let i=0;i<5;i++){const c=hsl(h+i*67,75,55),px=8+i*32;F(x,c,px,22,26,18);F(x,M(c,'#000',.4),px+2,24,22,14);D(x,M(c,'#fff',.4),px+18,31,4)}T(x,NM(p),10,52,'#ffe066',1);
  G(x,'#b8b8c0','#8a8a94',62,120);F(x,'#5a5a64',0,62,160,2);F(x,'#e8e8ee',0,76,160,1);
  /* bowl and quarter pipe */
  for(let i=0;i<60;i++){const yy=Math.round(Math.sqrt(i)*5);F(x,'#a0a0aa',100+i,100-yy+60-yy*0,1,1)}F(x,'#6a6a74',98,84,60,2);F(x,'#a0a0aa',98,86,2,34);for(let k=0;k<6;k++)F(x,'#6a6a74',100+k*10,88+k*2,10,2);
  F(x,'#d8d8e0',4,92,36,3);F(x,'#6a6a74',6,95,2,10);F(x,'#6a6a74',34,95,2,10)},
 fg(x,r,h){F(x,'#8a8a94',0,114,160,6);for(let i=0;i<5;i++)F(x,'#0003',r()*160,108+r()*10,10,1)},set:h=>({shot:'full',xs:[-.35],ry:.3,lc:lc('#e8f0ff','#fff8f0','#ffe066')})},
{n:'Campfire',bg(x,r,h,p){G(x,'#080c1c','#1a2a48',0,70);stars(x,r,70,50);D(x,'#e8f0ff',130,16,5);D(x,'#080c1c',132,15,4);
  [[8,40,1.5],[36,48,1.1],[118,36,1.6],[148,44,1.2],[84,52,.9]].forEach(([tx,ty,s])=>pine(x,tx,ty,s,0,'#0c2a22','#144032'));
  G(x,'#12261c','#0a140e',70,120);for(let i=0;i<8;i++)F(x,'#0c1a12',r()*160,76+r()*40,10,2);glow(x,100,102,48,'#ff9a3a',.55);glow(x,100,102,24,'#ffd36a',.5);
  F(x,'#3a2a1a',86,106,28,4);F(x,'#4a3624',90,102,20,4);[[96,92,10],[102,86,14],[108,94,8],[100,98,8]].forEach(([fx,fy,fh],i)=>{F(x,['#ff6a1a','#ff9a3a','#ffd36a'][i%3],fx,fy,5,fh)});for(let i=0;i<14;i++)F(x,'#ffd36a',90+r()*22,70+r()*30,1,1);
  F(x,'#2a4a8a',18,70,28,24);F(x,'#3a6aaa',18,70,28,3);F(x,'#14284a',30,84,4,10);F(x,'#14284a',16,94,32,1)},
 fg(x,r,h){F(x,'#0a140e',0,112,160,8);for(let i=0;i<5;i++)F(x,'#050a07',r()*160,108,3,10)},set:h=>({shot:'med',xs:[-.15],ry:.25,lc:lc('#7a88d8','#ffb060','#ff7a3a')})});

/* ============ HOME ============ */
push('home',
{n:'Balcony',bg(x,r,h,p){G(x,'#2a1a5a','#ff9a6a',0,70);D(x,'#ffe2a0',100,62,10);skyline(x,r,h,82,['#1a1230','#241a3e','#2e2250'],14,40,'#ffd77a','#2a2244',10,18);
  F(x,'#2a2236',0,82,160,38);F(x,'#3a3048',0,82,160,2);F(x,'#14101e',0,88,160,3);for(let i=0;i<160;i+=6)F(x,'#14101e',i,60,2,30);F(x,'#14101e',0,60,160,3);F(x,'#14101e',0,70,160,1);
  [[14,80],[30,80],[132,80],[148,80]].forEach(([px,py],i)=>{F(x,'#8a5a36',px,py-8,9,8);F(x,'#6a4020',px,py-8,9,2);D(x,i%2?'#2e8b57':'#3fa66a',px+4,py-12,6);D(x,'#4fc080',px+6,py-15,4);if(i%2==0)D(x,'#ff7ab0',px+2,py-13,2)});
  F(x,'#7a5a3a',0,100,160,20);for(let i=0;i<8;i++)F(x,'#5a3e26',i*22,100,1,20);F(x,'#9a7a52',0,100,160,2)},
 fg(x,r,h){for(let i=0;i<16;i++){const lx=i*10+2,ly=2+Math.sin(i*.7)*3;F(x,'#14101e',lx,ly,10,1);D(x,['#ffd36a','#ff9a6a','#fff4c0'][i%3],lx+5,ly+3,2);glow(x,lx+5,ly+3,8,'#ffd36a',.25)}},
 set:h=>({shot:'med',xs:[-.2],ry:.3,lc:lc('#c0a0d8','#ffc890','#ff7a50')})},
{n:'Home studio',bg(x,r,h,p){F(x,'#241f30',0,0,160,92);for(let i=0;i<160;i+=8)F(x,'#1e1a28',i,0,2,92);
  [[6,10],[42,10],[118,10],[142,10]].forEach(([px,py],i)=>{F(x,'#3a2f4a',px,py,28,22);F(x,'#4a3d5e',px,py,28,2);for(let k=0;k<6;k++)F(x,'#2e253c',px+2+k*4,py+4,2,16)});
  F(x,'#0a0a10',56,16,50,32);F(x,'#14141c',58,18,46,28);for(let i=0;i<36;i++)F(x,hsl(h+i*9,70,45),60+i,38-Math.abs(Math.sin(i*.45+h)*14),1,Math.abs(Math.sin(i*.45+h)*14)+2);F(x,'#3a3a46',78,48,4,6);F(x,'#3a3a46',70,54,20,2);
  F(x,'#1a1a22',22,30,14,22);D(x,'#2a2a34',29,36,4);D(x,'#0a0a0e',29,36,2);D(x,'#2a2a34',29,46,3);F(x,'#1a1a22',128,30,14,22);D(x,'#2a2a34',135,36,4);D(x,'#0a0a0e',135,36,2);D(x,'#2a2a34',135,46,3);
  F(x,'#6a4a2e',20,64,120,4);F(x,'#8a643e',20,64,120,1);F(x,'#4a3220',24,68,3,26);F(x,'#4a3220',133,68,3,26);F(x,'#14141c',46,58,64,6);for(let i=0;i<14;i++)F(x,i%5==2?'#2a2a34':'#e8e8ee',48+i*4,59,3,4);F(x,'#c84a3a',120,54,3,9);F(x,'#2a2a34',118,62,8,2);
  F(x,'#3a3048',0,92,160,28);F(x,'#6a3a4a',24,94,112,20);for(let i=0;i<14;i++)F(x,'#7a4a5a',24+i*8,94,1,20);glow(x,80,32,50,'#7ae0ff',.15)},
 fg(x,r,h){F(x,'#14101e',0,116,160,4)},set:h=>({shot:'med',xs:[.35],ry:-.25,lc:lc('#a8b0e8','#e0e8ff','#4fd8ff')})},
{n:'Reading nook',bg(x,r,h,p){F(x,'#4a3a2e',0,0,160,92);for(let i=0;i<160;i+=10)F(x,'#3e3026',i,0,1,92);
  F(x,'#2a2018',4,6,56,84);for(let s2=0;s2<5;s2++){F(x,'#6a5038',4,10+s2*16,56,2);let bx=6;while(bx<56){const bw=3+Math.floor(r()*3),bh=8+Math.floor(r()*5);F(x,hsl(h+bx*17+s2*40,45,40+(bx%3)*8),bx,10+s2*16-bh+0,bw,bh);bx+=bw+(r()<.2?3:0)}}
  F(x,'#f4efe6',78,12,50,44);G(x,'#5a7aa8','#8aa8c8',15,53,81,125);for(let i=0;i<30;i++)F(x,'#cfe8ff',80+r()*44,16+r()*34,1,3+r()*3);F(x,'#f4efe6',102,12,2,44);F(x,'#f4efe6',78,34,50,2);F(x,'#d8cfc0',76,56,54,3);
  F(x,'#b86a4a',88,68,44,24);F(x,'#c8825e',88,68,44,5);F(x,'#a85a3a',84,72,6,20);F(x,'#a85a3a',130,72,6,20);F(x,'#8a4a2e',88,86,44,6);
  F(x,'#3a2f4a',66,82,2,10);F(x,'#ffe7a0',62,74,10,9);glow(x,67,78,26,'#ffe7a0',.35);
  F(x,'#3a2818',0,92,160,28);for(let i=0;i<160;i+=20)F(x,'#2e2010',i,92,1,28);F(x,'#8a3a3a',20,100,90,14);F(x,'#a84a4a',20,100,90,2);for(let i=0;i<8;i++)F(x,'#7a3030',24+i*11,104,6,1)},
 fg(x,r,h){F(x,'#2a1c10',0,116,160,4)},set:h=>({shot:'med',xs:[.3],ry:-.2,lc:lc('#e0c8a8','#ffe0b0','#ffb070')})});

/* ============ STUDIO ============ */
push('studio',
{n:'Control room',bg(x,r,h,p){F(x,'#1a1822',0,0,160,92);F(x,'#241f30',0,0,160,6);for(let i=0;i<160;i+=6)F(x,'#2e2840',i,6,3,40);for(let i=0;i<160;i+=6)F(x,'#1e1a2a',i+3,6,3,40);
  F(x,'#0a0a10',24,12,112,38);G(x,'#2a3a5a','#141a2a',14,48,26,134);F(x,'#3a3a48',24,12,112,2);F(x,'#3a3a48',24,48,112,2);F(x,'#3a3a48',78,12,2,38);
  F(x,'#2a2230',50,30,20,18);F(x,'#6a5a7a',54,22,6,10);D(x,'#e8e0f0',57,20,3);F(x,'#2a2230',96,32,18,16);F(x,'#14141a',100,28,8,6);D(x,'#2a2a34',104,24,4);glow(x,80,30,36,'#8aa0ff',.18);
  F(x,'#2a2a34',0,66,160,6);F(x,'#14141a',0,72,160,20);for(let i=0;i<24;i++){F(x,'#0a0a0e',4+i*6.5,74,3,14);F(x,'#e8e8ee',4+i*6.5,74+(i*7%9),3,3);D(x,['#ff4a3a','#4aff7a','#ffe066','#4aa8ff'][i%4],5+i*6.5,92-1,1)}
  F(x,'#1a1a22',8,48,26,16);F(x,'#0a1420',10,50,22,12);for(let i=0;i<20;i++)F(x,'#4aff7a',10+i,60-Math.abs(Math.sin(i*.6+h)*8),1,Math.abs(Math.sin(i*.6+h)*8));F(x,'#1a1a22',126,48,26,16);F(x,'#0a1420',128,50,22,12);for(let i=0;i<20;i++)F(x,'#ff4fa0',128+i,60-Math.abs(Math.cos(i*.5+h)*8),1,Math.abs(Math.cos(i*.5+h)*8));
  F(x,'#2a2230',0,92,160,28);F(x,'#3a3048',0,92,160,2)},
 fg(x,r,h){F(x,'#0a0a0e',0,112,160,8);for(let i=0;i<20;i++)F(x,['#ff4a3a','#4aff7a','#ffe066'][i%3],i*8+2,114,2,1)},set:h=>({shot:'med',xs:[-.25],ry:.25,lc:lc('#a0a8e8','#e8e0ff','#ff4fa0')})},
{n:'Basement',bg(x,r,h,p){igxBrick(x,'#5a3a34','#3e2622',0,92,0,160);x.save();x.globalAlpha=.4;F(x,'#000',0,0,160,92);x.restore();F(x,'#2a1c18',0,0,160,8);
  for(let i=0;i<14;i++){const lx=i*12+4;F(x,'#14101e',lx,6,12,1);D(x,['#ffd36a','#ff7ab0','#7ae0ff','#fff4c0'][i%4],lx+6,10+Math.sin(i)*2,2);glow(x,lx+6,10,10,'#ffd36a',.25)}
  F(x,'#1a1a20',6,40,30,44);for(let k=0;k<3;k++){F(x,'#2a2a32',8+k*0,44+k*14,26,12);D(x,'#3a3a44',21,50+k*14,5);D(x,'#0a0a0e',21,50+k*14,2)}T(x,'MARSH',8,86,'#e8c02a');
  F(x,'#2a2a32',122,30,32,56);D(x,'#d8d8e0',138,52,10);D(x,'#8a8a94',138,52,10);D(x,'#d8d8e0',138,52,8);D(x,'#bfbfc8',138,52,4);F(x,'#3a3a44',116,66,18,12);D(x,'#e8c02a',125,66,7);D(x,'#c8a41a',125,66,4);F(x,'#14141a',100,70,14,16);
  F(x,'#3a2818',0,92,160,28);G(x,'#4a3828','#2a1c10',92,120);F(x,'#7a3a3a',50,98,56,14);F(x,'#9a4a4a',50,98,56,2);for(let i=0;i<6;i++)F(x,'#6a3030',54+i*9,102,5,1)},
 fg(x,r,h){F(x,'#1a1008',0,114,160,6);F(x,'#e8672c',6,108,4,6);F(x,'#14141a',4,112,8,4)},set:h=>({shot:'med',xs:[-.05],ry:.2,lc:lc('#c8a888','#ffd8a0','#ff7a4a')})},
{n:'Radio booth',bg(x,r,h,p){F(x,'#1c1c24',0,0,160,92);for(let i=0;i<160;i+=8)for(let j=0;j<60;j+=8){F(x,(i/8+j/8)%2?'#2a2a34':'#34343e',i,j,8,8);D(x,'#14141a',i+4,j+4,2)}
  F(x,'#ff2a2a',62,8,36,14);F(x,'#a00000',64,10,32,10);T(x,'ON AIR',66,13,'#fff',1);glow(x,80,15,34,'#ff2a2a',.45);
  F(x,'#3a2a22',0,66,160,6);F(x,'#5a3e30',0,66,160,2);F(x,'#14141a',10,50,22,16);for(let i=0;i<8;i++)F(x,'#4aff7a',12+i*2.5,64-(i*5%10),2,2+(i*5%10));F(x,'#2a2a34',128,52,26,14);D(x,'#e8c02a',141,59,5);
  [[44,36],[116,38]].forEach(([mx,my])=>{F(x,'#2a2a34',mx,my,2,32);F(x,'#2a2a34',mx-8,my,16,2);F(x,'#c8ccd4',mx-4,my-8,9,13);F(x,'#6a707a',mx-4,my-4,9,1)});
  F(x,'#2a2230',0,72,160,20);F(x,'#14101e',0,92,160,28);F(x,'#3a3048',0,92,160,2)},
 fg(x,r,h){F(x,'#0a080e',0,114,160,6)},set:h=>({shot:'med',xs:[.05],ry:-.1,lc:lc('#c8c0e8','#ffe8e0','#ff2a2a')})});

/* ============ STAGE ============ */
push('stage',
{n:'Stadium',bg(x,r,h,p){G(x,'#0a1030','#3a2a6a',0,60);stars(x,r,26,30);
  for(let k=0;k<4;k++){const tt=44+k*10;F(x,'#14102a',0,tt,160,10);for(let i=0;i<160;i+=2)F(x,r()<.6?hsl(h+i*3,40,[22,30,26,34][k]):'#1a1636',i,tt+1,2,8)}
  [[10,14],[48,10],[112,10],[150,14]].forEach(([lx,ly])=>{F(x,'#2a2a34',lx,ly,2,40);F(x,'#14141a',lx-8,ly-6,18,10);for(let a=0;a<6;a++)D(x,'#fffbe0',lx-6+a*3,ly-3,1);glow(x,lx,ly-2,26,'#fffbe0',.5)});
  F(x,'#14141a',60,46,40,12);F(x,'#0a0a0e',62,48,36,8);T(x,'LIVE',72,50,'#ffd23f',1);
  G(x,'#2a5a2a','#1a3a1a',96,120);for(let i=0;i<160;i+=10)F(x,i%20?'#2a6a2a':'#245a24',i,96,10,24);F(x,'#ffffff55',0,104,160,1);
  F(x,'#2a2a34',0,92,160,5);F(x,'#14141a',0,94,160,2)},
 fg(x,r,h){for(let i=0;i<32;i++){const cx=i*5+r()*2,hy=110+r()*6;D(x,'#06040c',cx,hy,3.3);F(x,'#06040c',cx-4,hy+2,9,14);if(r()<.3){F(x,'#06040c',cx+3,hy-12,2,12);F(x,'#cfe9ff',cx+3,hy-16,2,3)}}},
 set:h=>({shot:'med',xs:[.55],ry:-.3,lc:lc('#c8d0ff','#ffffff','#ffd23f')})},
{n:'Backstage',bg(x,r,h,p){F(x,'#2a2430',0,0,160,92);for(let i=0;i<160;i+=20)F(x,'#241f2a',i,0,2,92);
  F(x,'#4a3a2e',8,16,56,60);F(x,'#c8d8e8',12,20,48,52);F(x,'#fff6',12,20,10,52);for(let i=0;i<12;i++){D(x,'#fff4c0',9+(i%2)*55,18+Math.floor(i/2)*10,2);glow(x,10,22+i*4,5,'#ffe9a0',.2)}
  F(x,'#2a2a34',76,52,34,34);F(x,'#3a3a46',76,52,34,3);F(x,'#c8402a',78,60,30,3);F(x,'#e8c02a',80,74,2,8);F(x,'#e8c02a',104,74,2,8);F(x,'#1a1a22',118,36,34,50);F(x,'#2a2a34',120,38,30,3);F(x,'#e8c02a',134,36,2,50);
  T(x,NM(p),80,30,'#ffe066',2);F(x,'#ffe066',80,38,igxTW(NM(p),2),1);F(x,'#fff4c0',60,0,40,2);glow(x,80,6,40,'#fff4c0',.2);
  F(x,'#3a3040',0,92,160,28);F(x,'#6a3a4a',24,96,100,18);F(x,'#7a4a5a',24,96,100,2)},
 fg(x,r,h){F(x,'#14101e',0,114,160,6)},set:h=>({shot:'med',xs:[-.2],ry:.25,lc:lc('#e8d8f0','#fff0e8','#ffe066')})},
{n:'Busking',bg(x,r,h,p){G(x,'#2a2a5a','#8a6a8a',0,60);igxBrick(x,'#6a4a44','#4a3430',0,96,0,160);x.save();x.globalAlpha=.3;F(x,'#000',0,0,160,96);x.restore();
  for(let i=0;i<4;i++){const c=hsl(h+i*80,60,55);F(x,'#e8e0d0',10+i*36,12,26,32);F(x,c,12+i*36,14,22,28);D(x,M(c,'#fff',.4),23+i*36,28,6)}
  lamp(x,134,20,60,'#ffe27a');lamp(x,18,28,52,'#ffe27a');
  F(x,'#4a4a54',0,96,160,24);for(let i=0;i<8;i++)F(x,'#3a3a44',i*22,100+(i%2)*6,14,1);
  F(x,'#2a2018',96,100,34,10);F(x,'#14100c',98,102,30,6);for(let i=0;i<10;i++)D(x,['#e8c02a','#c0c4cc','#c88a3a'][i%3],100+i*3,104+(i%2),1)},
 fg(x,r,h){F(x,'#3a3a44',0,114,160,6)},set:h=>({shot:'full',xs:[-.3],ry:.3,lc:lc('#b8a8d0','#ffe0b0','#ff9a6a')})});

/* ============ ALBUM, FIT ============ */
push('album',
{n:'Poster wall',bg(x,r,h,p){igxBrick(x,'#4a3c3c','#322828',0,96,0,160);for(let i=0;i<9;i++){const px=2+(i%5)*32+(i>4?16:0),py=6+Math.floor(i/5)*42+(i*7%5),c=hsl(h+i*43,70,52);F(x,'#e8e0d0',px,py,28,36);F(x,c,px+2,py+2,24,24);D(x,M(c,'#fff',.4),px+14,py+13,8);F(x,M(c,'#000',.5),px+2,py+16,24,10);T(x,['LIVE','NEW','TOUR','OUT NOW','VOL.2'][i%5],px+4,py+29,'#222',1);F(x,'#0003',px+26,py+2,2,34)}
  const s=NM(p);T(x,s,80-igxTW(s,2)/2,2,'#ffe066',2);G(x,'#3a3030','#1e1818',96,120);F(x,'#6a5a58',0,96,160,2)},
 fg(x,r,h){F(x,'#1e1818',0,114,160,6)},set:h=>({shot:'med',xs:[.05],ry:.1,lc:lc('#e8d8d0','#fff0e0','#ff7ab0')})},
{n:'Listening party',bg(x,r,h,p){F(x,'#1a1226',0,0,160,92);G(x,'#2a1a3a','#140c20',0,92);F(x,'#0a0810',34,12,92,22);F(x,'#ff4fa0',36,14,88,18);F(x,'#0a0810',38,16,84,14);T(x,'LISTEN',48,18,'#ff7ac0',2);T(x,'NOW',90,18,'#7ae0ff',2);glow(x,80,23,60,'#ff4fa0',.35);
  for(let i=0;i<8;i++){D(x,['#ffd36a','#ff7a7a','#7ac4ff','#7aff9a'][i%4],10+i*20,50+Math.sin(i)*4,2);glow(x,10+i*20,50,10,'#ffd36a',.2)}
  [[14,84,'#e84a8a'],[40,88,'#4aa8e8'],[118,86,'#e8c02a'],[142,84,'#7ac42a']].forEach(([bx,by,c])=>{D(x,c,bx,by,10);D(x,M(c,'#fff',.25),bx-3,by-4,4)});
  F(x,'#3a2a48',0,92,160,28);G(x,'#4a3a5a','#2a1e38',92,120);F(x,'#6a4a7a',0,92,160,2);
  F(x,'#2a2a34',60,60,40,30);D(x,'#14141a',72,76,9);D(x,'#14141a',90,76,9);D(x,'#2a2a34',72,76,6);D(x,'#2a2a34',90,76,6);D(x,'#e8c02a',72,76,2);D(x,'#e8c02a',90,76,2)},
 fg(x,r,h){F(x,'#140c20',0,114,160,6)},set:h=>({shot:'med',xs:[-.35],ry:.3,lc:lc('#c8a8e8','#ffe0f0','#ff4fa0')})});
push('fit',
{n:'Thrift store',bg(x,r,h,p){F(x,'#d8c8a8',0,0,160,92);for(let i=0;i<160;i+=12)F(x,'#c8b898',i,0,1,92);
  F(x,'#2a2a34',10,6,70,12);T(x,'VINTAGE',20,9,'#ffe066',2);for(let rw=0;rw<2;rw++){F(x,'#8a8a90',6,34+rw*28,74,2);F(x,'#6a6a70',6,34+rw*28,2,22);F(x,'#6a6a70',78,34+rw*28,2,22);for(let i=0;i<13;i++){const c=hsl(h+i*37+rw*90,50,38+(i%3)*10);F(x,c,10+i*5.2,36+rw*28,4,18);F(x,M(c,'#000',.25),10+i*5.2,36+rw*28,1,18)}}
  F(x,'#6a4a2e',100,30,52,50);F(x,'#8a643e',100,30,52,2);for(let k=0;k<3;k++){F(x,'#6a4a2e',100,48+k*16,52,2);D(x,hsl(h+k*100,60,50),112,42+k*16,4);F(x,hsl(h+k*100+40,50,40),124,40+k*16,10,8);F(x,'#e8e0d0',138,44+k*16,10,6)}
  G(x,'#a8885f','#7a5a3a',92,120);for(let i=0;i<160;i+=20)F(x,'#6a4a2e',i,92,1,28)},
 fg(x,r,h){F(x,'#6a4a2e',0,114,160,6)},set:h=>({shot:'full',xs:[-.15],ry:.2,lc:lc('#fff0dc','#fff8f0','#ffd090')})},
{n:'Runway',bg(x,r,h,p){F(x,'#0a0810',0,0,160,120);G(x,'#14101e','#2a2038',0,60);
  for(let i=0;i<7;i++){const lx=8+i*24;x.save();x.globalAlpha=.18;x.fillStyle='#fff6d8';x.beginPath();x.moveTo(lx,0);x.lineTo(lx-16,92);x.lineTo(lx+16,92);x.fill();x.restore();F(x,'#2a2a34',lx-3,0,7,4);D(x,'#fff6d8',lx,5,2)}
  F(x,'#1a1a22',0,62,160,6);F(x,'#fff',0,62,160,1);for(let i=0;i<9;i++)F(x,'#e8e0d0',8+i*18,36,12,24);F(x,'#14141a',60,18,40,10);T(x,'SHOW',74,21,'#ffe066',1);
  G(x,'#e8e4ec','#9a96a4',68,100);F(x,'#fff',0,68,160,2);for(let i=0;i<160;i+=16)F(x,'#0002',i,70,1,30);F(x,'#14101e',0,100,160,20);
  for(let i=0;i<24;i++){const cx=i*7+r()*2;D(x,'#06040c',cx,106+r()*4,3.2);F(x,'#06040c',cx-4,108,9,12);if(r()<.25)F(x,'#cfe9ff',cx+2,100,2,3)}},
 fg(x,r,h){},set:h=>({shot:'full',xs:[.05],ry:.05,lc:lc('#e8e0f0','#ffffff','#ff7ab0')})});
})();
