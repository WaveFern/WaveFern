/* ===== v55.52.24 (held): news-style scenes for the News app pictures (and any post with p.scene set) =====
   Eight more pixel-art scenes in the same format as 259-photo-scenes.js: football pitch, basketball court, lab, newsroom, cinema,
   observatory, town hall and tech expo. They are top-level IGXS scenes (not in the post studio's picker); the News app picks one per
   story from FWNEWS.sceneFor(story). Held with 259 (HELD=true + FW_DEV). */
(function(){
const HELD=false;
if(HELD&&!window.FW_DEV)return;
if(typeof IGXS=='undefined'||!IGXS.city||typeof igxTree!='function')return;
const _S=IGXS,F=igxF,G=igxGrad,D=igxDisc,T=igxTxt,M=igxMix,hsl=(h,s,l)=>'hsl('+(((h%360)+360)%360)+','+s+'%,'+l+'%)';
const glow=(x,cx,cy,rad,col,a)=>{x.save();for(let i=rad;i>0;i-=2){x.globalAlpha=a*(1-i/rad)*.9+.02;D(x,col,cx,cy,i)}x.restore()};
const stars=(x,r,n,y1)=>{for(let i=0;i<n;i++)F(x,r()<.2?'#fff':'#ffffffaa',r()*158,r()*y1,1,1)};
const set=(shot,xs,ry,amb,key,rim)=>()=>({shot,xs,ry,lc:{amb,key,rim}});
const add=(k,o)=>{o.poses=o.poses||['chill','crossed','thumb','point','wave','hands'];o.shots=o.shots||['med','full'];o.n=o.n||k;_S[k]=o};
const crowd=(x,r,y,n,cols)=>{for(let i=0;i<n;i++){const cx=i*(160/n)+r()*3;D(x,cols[Math.floor(r()*cols.length)],cx,y+r()*3,2.6);F(x,cols[Math.floor(r()*cols.length)],cx-3,y+3,7,6)}};

add('pitch',{bg(x,r,h,p){G(x,'#4a90e0','#b8e0ff',0,44);F(x,'#ffffffaa',20,10,30,5);F(x,'#ffffffaa',100,20,36,4);
  F(x,'#3a3a46',0,34,160,22);for(let k=0;k<3;k++){F(x,['#2a2a36','#34343f','#2e2e3a'][k],0,34+k*7,160,7);crowd(x,r,36+k*7,40,['#e84a3a','#3a7ae8','#f4c02a','#fff','#7ac42a'])}
  [[8,4],[150,4]].forEach(([lx,ly])=>{F(x,'#2a2a34',lx,ly,2,34);F(x,'#14141a',lx-6,ly-4,14,8);for(let a=0;a<4;a++)D(x,'#fffbe0',lx-4+a*3,ly,1);glow(x,lx,ly,16,'#fffbe0',.4)});
  G(x,'#3a9a3a','#2a7a2a',56,120);for(let i=0;i<8;i++)F(x,i%2?'#3a9a3a':'#42a842',0,56+i*8,160,8);F(x,'#fff',0,56,160,1);F(x,'#ffffffcc',78,56,2,64);D(x,'#ffffff55',80,100,18);D(x,'#2a7a2a',80,100,16);
  F(x,'#fff',104,50,40,2);F(x,'#fff',104,50,2,22);F(x,'#fff',142,50,2,22);for(let i=0;i<9;i++)F(x,'#ffffff55',106+i*4,52,1,20);for(let j=0;j<5;j++)F(x,'#ffffff55',106,54+j*4,36,1);
  F(x,'#fff',126,104,6,6);F(x,'#14141a',128,106,2,2)},
 fg(x,r,h){F(x,'#2a7a2a',0,114,160,6);for(let i=0;i<30;i++)F(x,'#1f6a1f',r()*160,112+r()*8,1,3)},set:set('full',[-.3],.3,'#e0f0ff','#fff8f0','#ffffff')});

add('court',{bg(x,r,h,p){F(x,'#2a2438',0,0,160,60);for(let i=0;i<160;i+=8)F(x,'#241e30',i,0,1,60);
  for(let k=0;k<3;k++){F(x,['#3a2f4a','#443858','#4e4262'][k],0,22+k*10,160,10);crowd(x,r,24+k*10,38,['#e84a3a','#3a7ae8','#f4c02a','#fff','#e84a8a'])}
  F(x,'#14141a',50,2,60,16);F(x,'#0a0a0e',52,4,56,12);T(x,'HOME',58,6,'#ffd23f',1);T(x,'AWAY',58,12,'#7ae0ff',1);T(x,'88',92,6,'#ff4a3a',1);T(x,'84',92,12,'#ff4a3a',1);
  G(x,'#c88a4a','#9a6a30',60,120);for(let i=0;i<160;i+=10)F(x,'#b87a3e',i,60,1,60);F(x,'#fff',0,62,160,1);D(x,'#ffffff55',80,92,16);F(x,'#ffffff55',79,62,2,58);
  F(x,'#2a2a34',124,34,2,30);F(x,'#e8e8ee',114,22,26,18);F(x,'#c04a2a',122,30,10,6);F(x,'#e8672c',120,40,14,2);for(let i=0;i<5;i++)F(x,'#fff8',121+i*2,42,1,6);
  D(x,'#e8672c',50,104,4);F(x,'#14141a',46,104,8,1)},
 fg(x,r,h){F(x,'#7a4a20',0,114,160,6)},set:set('full',[-.25],.3,'#ffe8d0','#fff4e0','#ffa060')});

add('lab',{bg(x,r,h,p){F(x,'#dce8ec',0,0,160,92);for(let i=0;i<160;i+=10)F(x,'#cfdde2',i,0,1,92);F(x,'#6aa8b8',0,0,160,6);
  F(x,'#2a3a48',8,12,44,30);F(x,'#0a1420',10,14,40,26);for(let i=0;i<36;i++)F(x,'#4aff9a',12+i,36-Math.abs(Math.sin(i*.3+h)*14+Math.sin(i*.8)*4),1,2);F(x,'#3a4a58',26,42,10,4);
  F(x,'#b8c8cc',64,12,2,0);F(x,'#fff',66,10,40,2);for(let k=0;k<2;k++){F(x,'#8a9aa0',64,22+k*18,50,2);for(let i=0;i<7;i++){const c=hsl(h+i*50+k*80,70,55);F(x,'#e8f4f8',66+i*7,10+k*18+4,5,9);F(x,c,66+i*7,10+k*18+8,5,5);F(x,'#fff8',66+i*7,10+k*18+4,1,9)}}
  F(x,'#8a9aa0',0,66,160,4);F(x,'#6a7a82',0,70,160,22);F(x,'#aab8be',0,66,160,1);
  [[16,'#ff4a8a'],[34,'#4aa8ff'],[96,'#7aff7a'],[118,'#ffd23f']].forEach(([bx,c],i)=>{F(x,'#e8f4f8',bx,52,10,14);F(x,'#fff8',bx+1,52,2,14);F(x,c,bx,58,10,8);F(x,'#e8f4f8',bx+3,46,4,6);for(let b=0;b<3;b++)F(x,'#fffa',bx+2+b*2,60-b*2,1,1)});
  F(x,'#2a2a34',138,48,4,18);F(x,'#2a2a34',132,64,16,3);F(x,'#d8d8e0',136,40,8,10);F(x,'#14141a',138,36,4,6);
  F(x,'#cfd8dc',0,92,160,28);G(x,'#cfd8dc','#9aa8ae',92,120);for(let i=0;i<160;i+=12)F(x,'#b8c4c8',i,92,1,28)},
 fg(x,r,h){F(x,'#9aa8ae',0,114,160,6)},set:set('med',[.2],-.2,'#e8f4ff','#ffffff','#7ae0ff')});

add('newsroom',{bg(x,r,h,p){F(x,'#1a2230',0,0,160,92);G(x,'#14202e','#2a3a50',0,60);
  for(let i=0;i<9;i++){const bw=10+(i*7%8),bh=20+(i*11%26);F(x,'#0e1520',4+i*17,60-bh,bw,bh);for(let wy=62-bh;wy<58;wy+=5)for(let wx=6+i*17;wx<4+i*17+bw-2;wx+=4)if(r()<.6)F(x,'#ffd77a',wx,wy,2,3)}
  F(x,'#2a2a34',6,6,70,22);F(x,'#0a0e14',8,8,66,18);for(let i=0;i<9;i++){const up=r()<.5;F(x,up?'#4aff7a':'#ff4a5a',10+i*7,up?10:15,5,up?6:8);F(x,'#fff6',10+i*7,26-2,5,1)}T(x,'MARKETS',10,8,'#ffe066',1);
  F(x,'#2a2a34',88,6,66,22);F(x,'#0a0e14',90,8,62,18);for(let i=0;i<30;i++)F(x,'#4aa8ff',92+i*2,24-Math.abs(Math.sin(i*.4+h)*8+i*.2),1,Math.abs(Math.sin(i*.4+h)*8+i*.2)+1);
  F(x,'#5a4a3a',0,70,160,6);F(x,'#7a6a58',0,70,160,2);F(x,'#3a2f28',0,76,160,16);
  [[18,0],[70,1],[118,0]].forEach(([mx,s],i)=>{F(x,'#2a2a34',mx,52,34,18);F(x,'#14202e',mx+2,54,30,14);F(x,hsl(h+i*70,60,45),mx+4,56,12,8);F(x,'#fff6',mx+20,56,10,2);F(x,'#fff6',mx+20,60,8,2);F(x,'#2a2a34',mx+14,70,6,3);F(x,'#2a2a34',mx+8,73,18,2)});
  G(x,'#4a4e5a','#2a2e3a',92,120);for(let i=0;i<8;i++)F(x,'#3a3e4a',i*22,92,1,28);F(x,'#ffe7a0',60,0,40,2);glow(x,80,4,40,'#ffe7a0',.18)},
 fg(x,r,h){F(x,'#1a1e28',0,114,160,6)},set:set('med',[-.3],.25,'#c8d0e8','#fff4e0','#4aa8ff')});

add('cinema',{bg(x,r,h,p){F(x,'#14101e',0,0,160,120);F(x,'#3a1a24',0,0,10,80);F(x,'#3a1a24',150,0,10,80);F(x,'#5a2a34',0,0,6,80);F(x,'#5a2a34',154,0,6,80);F(x,'#2a1018',0,0,160,6);
  F(x,'#e8e4dc',20,10,120,56);G(x,hsl(h,60,50),hsl(h+80,60,30),12,64,22,138);D(x,'#ffe27a',56,36,10);G(x,'#14284a','#0a1420',44,64,22,138);F(x,'#0a0e14',22,52,116,12);for(let i=0;i<16;i++){F(x,'#14284a',22+i*7.4,46+(i*5%6),6,18)}
  x.save();x.globalAlpha=.12;x.fillStyle='#fff6d8';x.beginPath();x.moveTo(80,116);x.lineTo(20,12);x.lineTo(140,12);x.fill();x.restore();
  for(let k=0;k<4;k++){const yy=70+k*12;for(let i=0;i<10;i++){const sx=4+i*16-k*2;F(x,'#8a1a2a',sx,yy,13,10);F(x,'#a82a3a',sx,yy,13,3);F(x,'#6a1220',sx,yy+8,13,2);F(x,'#5a0e1a',sx-1,yy+2,2,7)}}
  for(let i=0;i<6;i++){D(x,'#06040c',20+i*24,90+(i%2)*8,5);F(x,'#06040c',16+i*24,92+(i%2)*8,9,10)}F(x,'#ffe27a',4,30,3,6);glow(x,5,33,12,'#ffe27a',.4);F(x,'#ffe27a',153,30,3,6);glow(x,154,33,12,'#ffe27a',.4)},
 fg(x,r,h){F(x,'#14060a',0,116,160,4)},set:set('med',[.05],-.1,'#a898d8','#e8e0ff','#ff6a8a')});

add('observatory',{bg(x,r,h,p){G(x,'#050818','#1a2250',0,80);stars(x,r,110,70);for(let i=0;i<60;i++)F(x,'#ffffff22',20+i*2+r()*4,20+Math.sin(i*.12)*10+i*.6,3,1);D(x,'#e8f0ff',130,18,5);D(x,'#050818',132,17,4);
  for(let i=0;i<160;i++)F(x,'#0a1020',i,74+Math.sin(i*.04)*5+Math.sin(i*.11)*3,1,50);
  F(x,'#2a3040',50,48,50,34);F(x,'#3a4254',50,48,50,2);for(let i=0;i<50;i++){const y2=Math.round(Math.sqrt(Math.max(0,625-(i-25)*(i-25)))*.9);F(x,i<25?'#4a5266':'#3a4254',50+i,48-y2+14,1,y2)}F(x,'#080c18',72,26,6,26);F(x,'#aab4d0',72,26,2,26);
  F(x,'#1a2030',58,82,34,8);F(x,'#1a1a22',110,64,34,2);F(x,'#aab4c8',116,50,22,4);F(x,'#6a7488',112,46,10,6);F(x,'#3a4254',128,54,3,20);F(x,'#3a4254',122,72,16,2);
  G(x,'#0a1020','#050810',90,120);for(let i=0;i<30;i++)F(x,'#0e1628',r()*160,92+r()*28,6,1)},
 fg(x,r,h){F(x,'#04060c',0,114,160,6)},set:set('med',[-.3],.25,'#6a78c8','#c8d0ff','#7ae0ff')});

add('townhall',{bg(x,r,h,p){F(x,'#d8d0bc',0,0,160,92);for(let i=0;i<160;i+=12)F(x,'#cac2ae',i,0,1,92);F(x,'#8a6a42',0,60,160,32);F(x,'#a88652',0,60,160,2);for(let i=0;i<160;i+=16)F(x,'#7a5a34',i,62,1,30);
  [[12],[134]].forEach(([cx])=>{F(x,'#e8e2d4',cx,0,14,70);F(x,'#c8c2b2',cx+10,0,4,70);F(x,'#f4f0e4',cx-2,0,18,5);F(x,'#f4f0e4',cx-2,66,18,5)});
  F(x,'#4a3220',40,6,2,46);F(x,'#1f3a6a',42,8,30,22);D(x,'#ffd23f',57,19,6);D(x,'#1f3a6a',59,18,5);F(x,'#2a8a5a',76,8,24,22);F(x,'#f4f0e4',86,10,4,18);F(x,'#f4f0e4',80,17,16,4);
  F(x,'#4a3220',60,52,40,40);F(x,'#6a4a2e',60,52,40,4);F(x,'#e8c02a',74,62,12,12);D(x,'#c8a41a',80,68,3);F(x,'#2a2a34',76,40,1,12);F(x,'#aab0b8',74,36,5,5);F(x,'#aab0b8',82,38,5,4);
  G(x,'#7a5a34','#4a3220',92,120);F(x,'#a82a2a',20,100,120,14);F(x,'#c84a4a',20,100,120,2)},
 fg(x,r,h){F(x,'#3a2818',0,116,160,4)},set:set('med',[-.35],.25,'#f0e8d8','#fff4e0','#ffd090')});

add('expo',{bg(x,r,h,p){F(x,'#0a0e1a',0,0,160,120);G(x,'#0a0e1a','#14204a',0,70);
  F(x,'#0a0a10',24,8,112,50);F(x,'#14182a',26,10,108,46);for(let i=0;i<54;i++){const a=Math.abs(Math.sin(i*.2+h)*14+Math.sin(i*.5)*6);F(x,hsl(h+i*5,80,55),30+i*2,50-a,1,a+1)}T(x,'NEXT 9',60,14,'#fff',2);
  for(let i=0;i<8;i++){F(x,hsl(h+i*45,80,55),8+i*19,2,12,2);glow(x,14+i*19,3,12,hsl(h+i*45,80,55),.25)}
  F(x,'#1a1e2e',0,70,160,22);F(x,'#2a3050',0,70,160,2);for(let i=0;i<6;i++){const px=8+i*26;F(x,'#2a3050',px,74,18,14);F(x,'#aab8ff',px+2,76,14,8);F(x,hsl(h+i*60,70,50),px+4,78,10,4)}
  G(x,'#1a1e32','#0e1220',92,120);F(x,hsl(h,80,55)+'88',0,92,160,1);F(x,'#e8e8ee',54,88,52,6);F(x,'#aab8ff',54,88,52,1);D(x,'#14182a',80,90,3);glow(x,80,70,50,hsl(h,70,55),.2)},
 fg(x,r,h){F(x,'#06080e',0,114,160,6)},set:set('med',[-.1],.2,'#8a98e8','#e0e8ff',hsl(0,0,100))});
})();
