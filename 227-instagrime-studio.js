/* ===== v51.2.0: Instagrime post studio + much more varied photos =====
   1. New post opens a small studio: pick the place, the backdrop, your pose, the shot, which way you face, and write or pick the caption.
      A live preview shows the exact photo that gets posted. Share counts as the one post of the day exactly as before (it calls mkPost).
      Brand photoshoot posts (224-brand-studio.js) set their own picture and are not touched.
   2. Photos: every scene now has several backdrops, poses, camera angles and framings picked from each post's own hash, so the same kind of post
      no longer looks the same (car posts: 6 body styles, side/front views, 5 places, sometimes just the car). Same 160x120 pixel look as 178.
   New optional fields on a post (all default to the old behaviour): scene, bd (backdrop), pose, shot, face, hk (look seed), kind. */
const IGXN={stage:'Stage',studio:'Studio',city:'City',park:'Outdoors',home:'Home',fit:'Fit check',car:'Cars',pet:'With pet',album:'New release'};
const igxV=(n,s)=>((Math.imul((IGX.v|0)^0x5bd1e995,2654435761+(s|0)*40503)>>>13)%n);
const igxBrick=(x,c1,c2,y0,y1,x0,x1)=>{igxF(x,c1,x0,y0,x1-x0,y1-y0);for(let y=y0;y<y1;y+=4){igxF(x,c2,x0,y,x1-x0,1);for(let i=x0+((y-y0)/4%2)*6;i<x1;i+=12)igxF(x,c2,i,y,1,4)}};
const igxTree=(x,tx,ty,s,c1,c2,c3)=>{igxF(x,'#6b4a2e',tx-1,ty,3,16*s);igxDisc(x,c1,tx,ty-2,9*s);igxDisc(x,c2,tx-2,ty-5,6*s);igxDisc(x,c3,tx-3,ty-7,3*s)};
const igxNoop=()=>{};
/* the plate on a car, from the post's hash */
const igxPlate=()=>{const L='ABCDEFGHJKLMNPRSTUVWXYZ';let s='';for(let i=0;i<7;i++){s+=i==3?' ':(i<3?L[igxV(L.length,20+i)]:String(igxV(10,30+i)))}return s.replace(' ','')};

/* ---- cars: drawn in local units, scaled by s, optionally mirrored, so every seam stays pixel tight ---- */
const IGXCAR={hatch:{L:80,bh:14,ch:12,c0:14,c1:64,wr:7},sedan:{L:100,bh:14,ch:11,c0:26,c1:76,wr:7},coupe:{L:96,bh:12,ch:10,c0:34,c1:72,wr:7},
 sport:{L:106,bh:10,ch:8,c0:42,c1:78,wr:7,wedge:1},pickup:{L:108,bh:16,ch:14,c0:8,c1:46,wr:8,bed:1},van:{L:92,bh:24,ch:0,c0:0,c1:70,wr:7,van:1}};
function igxCarSide(x,ox,gy,s,name,col,flip){const m=IGXCAR[name],H=m.bh+m.ch+m.wr,cd=igxMix(col,'#000',.35),cl=igxMix(col,'#fff',.3),
 R=(a,b,w,h,c)=>{const X0=flip?m.L-a-w:a,x0=Math.round(ox+X0*s),x1=Math.round(ox+(X0+w)*s),y0=Math.round(gy-(H-b)*s),y1=Math.round(gy-(H-b-h)*s);if(x1>x0&&y1>y0){x.fillStyle=c;x.fillRect(x0,y0,x1-x0,y1-y0)}};
 R(4,m.ch+m.bh+m.wr-3,m.L-8,3,'#0006');
 if(m.van){R(0,0,m.L,m.bh+m.ch+m.wr-6,col);R(0,2,m.L,2,cl);R(60,4,26,12,'#9ad0f0');R(64,4,10,2,'#c8ecff');R(8,6,44,5,cd);R(0,m.bh+m.ch+m.wr-10,m.L,4,cd)}
 else{R(m.wedge?0:0,m.ch,m.L,m.bh,col);R(m.wedge?2:0,m.ch,m.L-(m.wedge?2:0),2,cl);R(0,m.ch+m.bh-4,m.L,4,cd);
  const c0=m.c0,c1=m.c1;R(c0+3,2,c1-c0-6,m.ch-2,col);R(c0,m.ch-3,c1-c0,3,col);R(c0+4,0,c1-c0-8,2,m.pickup?col:cl);
  const wn=m.ch-4;R(c0+5,3,Math.round((c1-c0-12)/2)+1,wn,'#9ad0f0');R(c0+9+Math.round((c1-c0-12)/2),3,Math.round((c1-c0-12)/2)-2,wn,'#9ad0f0');R(c0+6,3,5,1,'#c8ecff');
  if(m.bed){R(c1,m.ch,m.L-c1,3,cd);R(c1,m.ch+3,m.L-c1,2,'#222')}}
 R(m.L-5,m.ch+3,5,4,'#ffe27a');R(0,m.ch+3,4,4,'#ff4a4a');R(m.L-3,m.ch+m.bh-4,3,3,'#ddd');R(6,m.ch+7,m.L-12,1,'#fff4');
 [m.L*.22,m.L*.78].forEach(wx=>{const cx=ox+(flip?m.L-wx:wx)*s,cy=gy-m.wr*s,r=m.wr*s;igxDisc(x,'#0e0e10',Math.round(cx),Math.round(cy),Math.round(r));igxDisc(x,'#c4c8d0',Math.round(cx),Math.round(cy),Math.round(r*.55));igxDisc(x,'#555',Math.round(cx),Math.round(cy),Math.max(1,Math.round(r*.15)))});
 return{w:m.L*s,h:H*s}}
function igxCarFront(x,cx,gy,s,col){const cd=igxMix(col,'#000',.35),cl=igxMix(col,'#fff',.3),W=56,H=34,ox=cx-W*s/2,
 R=(a,b,w,h,c)=>{const x0=Math.round(ox+a*s),x1=Math.round(ox+(a+w)*s),y0=Math.round(gy-(H-b)*s),y1=Math.round(gy-(H-b-h)*s);x.fillStyle=c;x.fillRect(x0,y0,x1-x0,y1-y0)};
 R(2,H-3,52,3,'#0006');R(0,12,W,16,col);R(4,2,48,12,col);R(7,4,42,9,'#9ad0f0');R(9,4,18,2,'#c8ecff');R(27,4,2,9,cd);R(0,12,W,2,cl);R(0,22,W,6,cd);R(0,26,W,3,'#222');
 R(3,15,11,6,'#fff6c8');R(42,15,11,6,'#fff6c8');R(5,17,7,3,'#fff');R(44,17,7,3,'#fff');R(18,17,20,6,'#15151a');for(let i=0;i<5;i++)R(19+i*4,18,2,4,'#3a3a44');
 R(2,H-9,8,9,'#0e0e10');R(46,H-9,8,9,'#0e0e10');const pl=igxPlate(),pw=igxTW(pl,1);R(28-Math.ceil(pw/2)-1,23,pw+2,7,'#f4f4f4');igxTxt(x,pl,Math.round(ox+(28-pw/2)*s),Math.round(gy-(H-24)*s),'#111',1)}
const igxCarCols=['#d02c2c','#2c6fd0','#e8c02a','#2cb070','#e8e8ee','#222428','#e8672c','#8a3ad0','#c0c4cc','#d02c8a'];

/* ---- scene variants. Variant 0 is the scene itself (in 178). Each variant: n (name), bg, fg, optional set ---- */
const _S=IGXS;
_S.stage.n='Arena';_S.stage.poses=['mic','mic','hands','guitar','point','wave'];_S.stage.shots=['med','med','full','med'];
_S.stage.V=[_S.stage,
 {n:'Club',bg(x,r,h,p){igxBrick(x,'#3a2230','#26141f',0,92,0,160);igxGrad(x,'#00000000','#1a0c16',0,92);
   const c=['#ff4fd8','#4fd8ff','#ffe066'][h%3],nm=igxClip(igxArtist(p),12);igxF(x,'#0a0610',22,12,116,34);igxF(x,c+'55',20,10,120,38);igxTxt(x,nm,80-igxTW(nm,3)/2,19,c,3);igxF(x,c,22,12,116,1);igxF(x,c,22,45,116,1);
   [30,80,130].forEach((lx,i)=>{x.save();x.globalAlpha=.14;x.fillStyle=['#ff4fd8','#4fd8ff','#ffe066'][i];x.beginPath();x.moveTo(lx,0);x.lineTo(lx-18,98);x.lineTo(lx+18,98);x.fill();x.restore();igxF(x,'#111',lx-3,0,7,4)});
   igxF(x,'#4a3020',0,92,160,28);for(let i=0;i<160;i+=14)igxF(x,'#5a3c28',i,92,1,28);igxF(x,'#7a5a3a',0,92,160,2);[[6,50],[138,50]].forEach(([sx,sy])=>{igxF(x,'#101014',sx,sy,16,42);igxDisc(x,'#26262e',sx+8,sy+12,5);igxDisc(x,'#26262e',sx+8,sy+30,5)})},
  fg(x,r,h){for(let i=0;i<22;i++){const cx=i*7.6+r()*3,hy=110+r()*5;igxDisc(x,'#08050a',cx,hy,3.6);igxF(x,'#08050a',cx-4,hy+2,9,12);if(r()<.3)igxF(x,'#08050a',cx+(r()<.5?-3:3),hy-11,2,11)}},
  set:h=>({shot:'med',xs:[-.2],ry:.25,lc:{amb:'#a890d8',key:'#ffe4f4',rim:'#ff4fd8'}})},
 {n:'Festival',bg(x,r,h,p){igxGrad(x,'#4a7ad8','#ffb878',0,70);igxDisc(x,'#fff0b0',120,56,10);x.save();x.globalAlpha=.8;[[20,14],[70,24],[110,10]].forEach(([a,b])=>{igxDisc(x,'#fff',a,b,6);igxDisc(x,'#fff',a+8,b+1,5)});x.restore();
   for(let i=0;i<160;i++)igxF(x,'#3a5a3a',i,66+Math.sin(i*.07+h)*3,1,40);
   igxF(x,'#222',16,10,3,60);igxF(x,'#222',141,10,3,60);igxF(x,'#2a2a36',10,6,140,5);for(let i=0;i<8;i++)igxF(x,'hsl('+((h+i*45)%360)+',70%,55%)',14+i*17,11,10,6);
   igxF(x,'#101018',28,22,104,46);igxF(x,'#1c1c2c',30,24,100,42);for(let yy=26;yy<64;yy+=2)for(let xx=32;xx<130;xx+=2){const v=Math.sin(xx*.1+h)+Math.cos(yy*.12);igxF(x,'hsl('+((h+v*40+360)%360)+',70%,'+(22+v*6)+'%)',xx,yy,1,1)}
   const nm=igxClip(igxArtist(p),12);igxTxt(x,nm,80-igxTW(nm,2)/2,40,'#fff',2);for(let i=0;i<7;i++){igxF(x,['#ff4a4a','#ffe066','#4aa0ff'][i%3],20+i*20,70,6,5)}
   igxF(x,'#6a4a30',0,92,160,28);for(let i=0;i<160;i+=10)igxF(x,'#7a5a3a',i,92,1,28)},
  fg:IGXS.stage.fg,set:h=>({shot:'med',xs:[.3],ry:-.2,lc:{amb:'#d8e0ff',key:'#fff0d8',rim:'#ffe066'}})}];

_S.studio.n='Booth';_S.studio.poses=['phones','phones','thumb','chill','crossed','mic'];_S.studio.shots=['med','med','full','med'];
_S.studio.V=[_S.studio,
 {n:'Bedroom',bg(x,r,h,p){igxF(x,'#2a3a4a',0,0,160,92);for(let i=0;i<160;i+=6)igxF(x,'#2f4152',i,0,2,92);
   [[8,10],[34,14],[60,8]].forEach(([a,b],i)=>{igxF(x,'#e8e0d0',a,b,20,26);igxF(x,'hsl('+((h+i*80)%360)+',55%,'+(40+i*5)+'%)',a+2,b+2,16,22);igxDisc(x,'#fff6',a+10,b+11,5)});
   for(let i=0;i<160;i+=3){const y=4+Math.sin(i/160*Math.PI*3)*3;igxF(x,'#222',i,y,1,1);if(i%9==0)igxF(x,['#ffd36a','#ff7ab0','#7affc0','#7ad0ff'][i/9%4|0],i,y+1,2,2)}
   igxF(x,'#0e1a2a',104,12,44,38);igxGrad(x,'#1a2a5a','#3a3a7a',14,48,106,146);for(let i=0;i<10;i++)igxF(x,'#fff',106+r()*38,14+r()*20,1,1);igxF(x,'#2a2a30',104,30,44,1);igxF(x,'#2a2a30',126,12,1,38);
   igxF(x,'#5a3b24',0,66,100,5);igxF(x,'#4a2f1c',4,71,4,24);igxF(x,'#4a2f1c',92,71,4,24);igxF(x,'#111',20,48,34,20);igxF(x,'#0a2a2a',22,50,30,16);for(let i=0;i<8;i++)igxF(x,'#2fe68a',24+i*3,64-((Math.sin(i+h)*5+6)|0),2,(Math.sin(i+h)*5+6)|0);igxF(x,'#222',34,68,10,2);
   igxF(x,'#e8e8ee',60,60,36,6);for(let i=0;i<12;i++)igxF(x,'#111',61+i*3,60,2,4);igxGrad(x,'#6a4a30','#3a2616',92,120)},
  fg(x,r,h){igxF(x,'#3a2616',0,108,160,12);igxF(x,'#6a4a30',0,106,160,3);igxF(x,'#ffe7a0',130,96,6,10);igxF(x,'#fff4c0',131,97,4,2)},set:h=>({shot:'med',xs:[.45],ry:-.35,lc:{amb:'#c0c8ff',key:'#ffe8d0',rim:'#7a8aff'}})},
 {n:'Vocal booth',bg(x,r,h,p){igxGrad(x,'#1a1a22','#0c0c12',0,92);for(let py=0;py<92;py+=8)for(let px=0;px<160;px+=8){igxF(x,(px/8+py/8)%2?'#23232e':'#1c1c26',px,py,8,8);igxF(x,'#2e2e3c',px+3,py+3,2,2)}
   igxF(x,'#120a10',100,8,40,13);igxF(x,'#ff3b5c',101,9,38,11);igxTxt(x,'REC',112,12,'#fff');igxDisc(x,'#ff3b5c',108,15,2);
   igxGrad(x,'#2a2230','#16101c',92,120)},
  fg(x,r,h){/* pop filter and mic in the foreground */
   igxF(x,'#101014',14,40,2,80);igxF(x,'#101014',6,114,18,6);igxDisc(x,'#1c1c22',15,46,13);igxDisc(x,'#0c0c10',15,46,10);for(let i=-9;i<=9;i+=3)igxF(x,'#2a2a34',15+i,38,1,16);igxF(x,'#8a8a96',5,46,20,1);igxDisc(x,'#c8ccd4',15,60,4)},
  set:h=>({shot:'close',xs:[.3],ry:-.1,lc:{amb:'#ffc8d0',key:'#ffe8e8',rim:'#ff3b5c'},mic:0})},
 {n:'Rehearsal',bg(x,r,h,p){igxBrick(x,'#6a6a72','#4a4a52',0,92,0,160);igxF(x,'#2a2a30',0,92,160,28);igxGrad(x,'#3a3a44','#26262c',92,120);
   [[4,38],[30,46]].forEach(([ax,ay],i)=>{igxF(x,'#18181c',ax,ay,24,54-i*8);igxDisc(x,'#2c2c34',ax+12,ay+14,7);igxDisc(x,'#0a0a0d',ax+12,ay+14,3);igxF(x,'#cfcfd8',ax+3,ay+3,4,1);for(let k=0;k<4;k++)igxF(x,'#ccc',ax+4+k*4,ay+30,2,2)});
   /* drum kit */[[120,66,10],[142,60,8],[104,74,8],[132,82,13]].forEach(([dx,dy,rr])=>{igxDisc(x,'#2a2a30',dx,dy,rr);igxDisc(x,h%2?'#c43a3a':'#3a6ac4',dx,dy,rr-2);igxDisc(x,'#e8e8ee',dx,dy,rr-5)});
   igxF(x,'#c8a02a',90,50,16,1);igxF(x,'#c8a02a',148,44,8,1);igxF(x,'#222',98,51,1,24);igxF(x,'#222',151,45,1,22);
   igxF(x,'#e84a8a',60,14,18,24);igxF(x,'#222',60,14,18,1)},
  fg(x,r,h){for(let i=0;i<3;i++){igxF(x,'#111',8+i*40,112+i*2,34,1);igxF(x,'#222',8+i*40+10,108,1,5)}igxF(x,'#18181c',0,116,160,4)},set:h=>({shot:'med',xs:[-.1],ry:.1,lc:{amb:'#d0d0e0',key:'#fff4e0',rim:'#ff9a4a'}})}];

_S.city.n='Rooftop';_S.city.poses=['peace','crossed','wave','chill','thumb','hands'];_S.city.shots=['med','full','med','full'];
_S.city.V=[_S.city,
 {n:'Street',bg(x,r,h,p){igxGrad(x,'#7ac4ff','#d8f0ff',0,60);
   for(let i=0;i<6;i++){const bw=24+r()*10,bx=i*28-6,bh=50+r()*30,c='hsl('+((h+i*55)%360)+',30%,'+(46+(i%2)*10)+'%)';igxF(x,c,bx,92-bh,bw,bh);igxF(x,'#0003',bx+bw-3,92-bh,3,bh);
    for(let wy=92-bh+6;wy<62;wy+=9)for(let wx=bx+3;wx<bx+bw-5;wx+=7)igxF(x,'#9ad0f0',wx,wy,4,5);
    const sc=['#ff4fd8','#4fd8ff','#ffe066','#7aff9a'][i%4];igxF(x,'#222',bx+2,64,bw-4,10);igxF(x,sc,bx+3,65,bw-6,8);igxF(x,'#fff8',bx+3,65,bw-6,1)}
   igxF(x,'#5a5a64',0,92,160,8);igxF(x,'#3a3d44',0,100,160,20);for(let i=0;i<9;i++)igxF(x,'#e8e8e8',i*20+4,104,12,16)},
  fg(x,r,h){igxF(x,'#8a8a94',0,108,160,12);igxF(x,'#6a6a74',0,108,160,2);igxF(x,'#3a3a44',20,70,2,40);igxF(x,'#ffe27a',16,66,10,4);x.save();x.globalAlpha=.15;igxF(x,'#ffe27a',14,70,14,36);x.restore()},set:h=>({shot:'full',xs:[-.35],ry:.3,lc:{amb:'#d8ecff',key:'#fff4e0',rim:'#ffffff'}})},
 {n:'Bridge',bg(x,r,h,p){igxGrad(x,'#2a1a5a','#ff8a6a',0,70);igxDisc(x,'#ffe2a0',40,56,10);
   for(let i=0;i<14;i++){const bw=8+r()*10,bh=10+r()*22;igxF(x,'#3a2a5a',i*12,76-bh,bw,bh)}
   igxGrad(x,'#2a3a7a','#1a2040',72,100);for(let i=0;i<30;i++)igxF(x,'#ffd7a088',r()*160,74+r()*24,3+r()*8,1);
   igxF(x,'#14101e',0,96,160,6);[20,64,108,152].forEach(px=>{igxF(x,'#14101e',px,34,5,70);for(let k=0;k<7;k++){x.save();x.strokeStyle='#14101e';x.beginPath();x.moveTo(px+2,36);x.lineTo(px+2+(k-3)*10,96);x.stroke();x.restore()}});for(let i=0;i<160;i+=16)igxF(x,'#ffd36a',i,92,2,4)},
  fg(x,r,h){igxF(x,'#0e0a16',0,106,160,14);igxF(x,'#2a2236',0,104,160,3)},set:h=>({shot:'med',xs:[.35],ry:-.3,lc:{amb:'#a090d8',key:'#ffd0a0',rim:'#ff6a8a'}})}];

_S.park.n='Sunny';_S.park.poses=['wave','peace','chill','thumb','hands','crossed'];_S.park.shots=['med','full','med','full','med'];
_S.park.V=[_S.park,
 {n:'Autumn',bg(x,r,h,p){igxGrad(x,'#a8c8e8','#f4e8d0',0,64);for(let i=0;i<160;i++)igxF(x,'#a88a4a',i,62+Math.sin(i*.05+h)*4,1,60);
   [[12,48,1.1],[40,54,.8],[120,46,1.2],[148,54,.8]].forEach(([tx,ty,s],i)=>igxTree(x,tx,ty,s,['#c8561a','#d8922a','#a83a1a'][i%3],'#e8a83a','#f4c860'));
   igxGrad(x,'#b89a5a','#8a7040',72,120);for(let i=0;i<40;i++)igxF(x,['#d0561a','#e8a02a','#a8421a'][i%3],r()*160,72+r()*46,3,2);igxF(x,'#e8d9b0',60,84,60,5)},
  fg(x,r,h){for(let i=0;i<30;i++)igxF(x,['#d0561a','#e8a02a','#a8421a','#f4c860'][i%4],r()*160,104+r()*14,3,2);igxF(x,'#6a4a2e',130,98,26,3);igxF(x,'#6a4a2e',132,101,2,10);igxF(x,'#6a4a2e',152,101,2,10)},
  set:h=>({shot:'med',xs:[-.25],ry:.3,lc:{amb:'#ffe0b8',key:'#ffd8a0',rim:'#ff9a4a'}})},
 {n:'Sunset',bg(x,r,h,p){igxGrad(x,'#5a3a8a','#ff9a5c',0,50);igxGrad(x,'#ff9a5c','#ffd890',50,76);igxDisc(x,'#fff0b0',100,68,14);
   for(let i=0;i<160;i++)igxF(x,'#2a1a3a',i,70+Math.sin(i*.04+h)*5,1,50);[[18,52,1.1],[44,58,.8],[136,54,1]].forEach(([tx,ty,s])=>{igxF(x,'#14101e',tx-1,ty,3,16*s);igxDisc(x,'#14101e',tx,ty-2,9*s)});
   igxGrad(x,'#2a1a3a','#1a1028',84,120);igxF(x,'#ffd890',0,84,160,1)},
  fg(x,r,h){for(let i=0;i<60;i++){const gx=r()*160,gy=106+r()*14;igxF(x,'#14101e',gx,gy-4,1,5)}},set:h=>({shot:'med',xs:[-.2],ry:.35,lc:{amb:'#c8a0d8',key:'#ffb878',rim:'#ff7a50'}})},
 {n:'Beach',bg(x,r,h,p){igxGrad(x,'#4aa8f0','#bfe8ff',0,58);igxDisc(x,'#fff4b0',24,14,8);igxF(x,'#2a90d8',0,58,160,18);igxF(x,'#5ab8f0',0,58,160,2);for(let i=0;i<24;i++)igxF(x,'#fff8',r()*160,62+r()*12,6,1);
   igxF(x,'#f0dca0',0,76,160,44);igxF(x,'#fff',0,76,160,2);for(let i=0;i<30;i++)igxF(x,'#d8c080',r()*160,80+r()*38,2,1);
   igxF(x,'#6b4a2e',134,40,3,50);[[0,-8,-14],[6,-12,-6],[-6,-6,-14],[8,0,10],[-8,0,-10]].forEach(([dx,dy,ln])=>{igxF(x,'#2e8b3a',136+(dx<0?dx:0),40+dy,Math.abs(dx)+6,3)});igxDisc(x,'#2e8b3a',136,40,7);
   igxF(x,'#6a4a30',50,64,2,26);igxDisc(x,'#e8362c',51,64,15);igxF(x,'#f4f4f4',36,64,30,2);igxF(x,'#4a90d8',44,58,3,6)},
  fg(x,r,h){igxF(x,'#f0dca0',0,112,160,8);for(let i=0;i<6;i++)igxF(x,'#fff',r()*160,114,3,2);igxF(x,'#e84a8a',20,108,14,3);igxF(x,'#fff',22,108,3,3)},
  set:h=>({shot:'med',xs:[.15],ry:-.25,lc:{amb:'#e8f4ff',key:'#fff8e0',rim:'#ffffff'}})}];

_S.home.n='Lounge';_S.home.poses=['chill','wave','thumb','crossed','peace','hands'];_S.home.shots=['med','med','full','med'];
_S.home.V=[_S.home,
 {n:'Kitchen',bg(x,r,h,p){igxF(x,'#e8e0d0',0,0,160,70);for(let y=0;y<70;y+=6)for(let q=0;q<160;q+=6)igxF(x,'#d8cfbc',q,y,5,5);
   igxF(x,'#f4f4f4',8,18,36,66);igxF(x,'#d8d8de',8,48,36,2);igxF(x,'#9a9aa4',40,24,2,12);igxF(x,'#9a9aa4',40,56,2,12);
   igxF(x,'#f4efe6',70,12,44,32);igxGrad(x,'#7ac4ff','#d0ecff',14,42,73,111);igxF(x,'#f4efe6',91,12,2,32);igxF(x,'#8a643e',50,10,16,3);
   igxF(x,'#6a4a30',0,70,160,6);igxF(x,'#8a643e',0,76,160,28);for(let i=0;i<160;i+=20)igxF(x,'#6a4a30',i,76,1,28);
   igxF(x,'#2a2a30',100,60,26,10);igxDisc(x,'#4a4a52',108,60,4);igxF(x,'#8a8a94',114,52,14,3);igxF(x,'#9a9aa4',110,52,2,8);
   igxGrad(x,'#a07850','#7a5634',104,120)},
  fg(x,r,h){igxF(x,'#5a3a22',0,110,160,10);igxF(x,'#e8e8e8',20,100,12,10);igxF(x,'#e84a4a',22,100,8,3);igxDisc(x,'#ff9a3a',60,106,4);igxDisc(x,'#e84a4a',70,107,4)},set:h=>({shot:'med',xs:[.15],ry:-.2,lc:{amb:'#fff4e0',key:'#ffffff',rim:'#ffe0a0'}})},
 {n:'Bedroom',bg(x,r,h,p){igxF(x,'hsl('+((h+200)%360)+',30%,30%)',0,0,160,92);for(let i=0;i<160;i+=10)igxF(x,'#0002',i,0,2,92);
   [[10,12],[34,18],[120,10]].forEach(([a,b],i)=>{igxF(x,'#e8e0d0',a,b,22,28);igxF(x,'hsl('+((h+i*70)%360)+',55%,45%)',a+2,b+2,18,24);igxDisc(x,'#fff7',a+11,b+12,5)});
   igxF(x,'#4a2f1c',50,56,100,6);igxF(x,'#e8e0d8',54,44,92,14);igxF(x,'hsl('+((h+90)%360)+',50%,60%)',54,48,92,12);igxF(x,'#fff',58,42,24,8);igxF(x,'#fff',90,42,24,8);igxF(x,'#3a2a1c',50,62,6,28);igxF(x,'#3a2a1c',144,62,6,28);
   igxF(x,'#3a2a1c',4,60,22,30);igxF(x,'#5a4030',6,62,18,12);igxF(x,'#3a3a3a',14,44,1,16);igxF(x,'#ffe7a0',9,38,11,7);
   igxGrad(x,'#7a5a3a','#5a3e24',92,120)},
  fg(x,r,h){igxF(x,'hsl('+((h+280)%360)+',40%,40%)',90,104,70,16);igxF(x,'#fff3',92,105,66,2)},set:h=>({shot:'med',xs:[-.35],ry:.25,lc:{amb:'#e0d0f8',key:'#ffe8d0',rim:'#ff9ad0'}})}];

_S.fit.n='Mirror';_S.fit.poses=['selfie','selfie','crossed','peace','point','thumb'];_S.fit.shots=['full'];
_S.fit.V=[_S.fit,
 {n:'Graffiti wall',bg(x,r,h,p){igxBrick(x,'#6a5a58','#4a3c3a',0,96,0,160);
   for(let i=0;i<5;i++){const c='hsl('+((h+i*67)%360)+',80%,55%)',px=4+i*32,py=10+(i%2)*14;igxF(x,c,px,py,26,22);igxF(x,igxMix(c,'#000',.4),px+2,py+2,22,18);igxF(x,igxMix(c,'#fff',.4),px+4,py+4,8,6);igxDisc(x,c,px+18,py+12,5)}
   igxTxt(x,igxClip(igxArtist(p),9),12,60,'#ffe066',2);igxF(x,'#2a2a2a',0,96,160,24);igxF(x,'#3a3a3a',0,96,160,2);for(let i=0;i<8;i++)igxF(x,'#4a4a4a',i*22+4,108,14,1)},
  fg(x,r,h){},set:h=>({shot:'full',xs:[.1],ry:.2,lc:{amb:'#e8e0d8',key:'#fff4e8',rim:'#ff7ab0'}})},
 {n:'Shop',bg(x,r,h,p){igxF(x,'#f0e8e0',0,0,160,92);igxF(x,'#14141a',20,6,120,14);igxTxt(x,'NEW IN',60,10,'#ff4fd8',2);igxF(x,'#ff4fd8',20,20,120,1);
   for(let r2=0;r2<2;r2++){igxF(x,'#8a8a90',4,40+r2*28,62,2);for(let i=0;i<9;i++){const cx=6+i*6.6;igxF(x,'hsl('+((h+i*41+r2*90)%360)+',50%,'+(40+(i%3)*10)+'%)',cx,42+r2*28,5,18)}}
   igxF(x,'#b8946a',100,48,54,3);igxF(x,'#b8946a',100,72,54,3);for(let i=0;i<3;i++){igxF(x,'hsl('+((h+i*80)%360)+',55%,45%)',104+i*16,40,12,8);igxF(x,'#fff',104+i*16,64,12,8);igxF(x,'#e33',104+i*16,70,12,2)}
   igxGrad(x,'#c9a882','#a8875f',92,120)},fg(x,r,h){igxF(x,'#8a6a42',0,112,160,8)},set:h=>({shot:'full',xs:[-.1],ry:.15,lc:{amb:'#fff4ea',key:'#ffffff',rim:'#ffd0f0'}})}];

_S.car.n='Street';_S.car.poses=['chill','crossed','thumb','point','peace','selfie'];_S.car.shots=['full'];
/* car scenes share one painter: env(x,r,h) draws the place and returns the ground line */
function igxCarScene(env){return function(x,r,h,p){const gy=env(x,r,h,p),solo=IGX.solo,view=igxV(3,11),side=igxV(2,12),col=igxCarCols[igxV(igxCarCols.length,13)],st=Object.keys(IGXCAR)[igxV(6,14)];IGX.cs=side;
  if(view==2&&!solo&&igxV(2,15)){igxCarFront(x,side?116:44,gy+2,.9,col);return}
  if(view==2&&solo){igxCarFront(x,80,gy+8,1.6,col);return}
  const m=IGXCAR[st],s=solo?Math.min(1.5,140/m.L):.85,w=m.L*s,ox=solo?(160-w)/2:(side?156-w:4),flip=igxV(2,16);igxCarSide(x,ox,gy+(solo?8:0),s,st,col,flip);
  if(solo){const pl=igxPlate(),pw=igxTW(pl,1);if(!m.van||1)igxF(x,'#0006',2,2,0,0)}}}
_S.car.bg=igxCarScene((x,r,h)=>{igxGrad(x,'#ffb070','#7a4ea8',0,60);igxDisc(x,'#ffe2a0',30,54,12);for(let i=0;i<9;i++){const bw=14+r()*14,bh=18+r()*30,bx=i*19-4;igxF(x,'#3a2a4a',bx,66-bh,bw,bh)}
 igxF(x,'#5a5a64',0,66,160,10);igxF(x,'#3a3d44',0,76,160,44);for(let i=0;i<8;i++)igxF(x,'#e8d9a0',i*22,100,12,2);igxF(x,'#8a8a94',0,74,160,2);return 92});
_S.car.fg=(x)=>{x.save();x.globalAlpha=.18;igxF(x,'#ffb070',0,0,160,120);x.restore()};
_S.car.set=h=>({shot:'full',xs:[IGX.cs?-1.15:1.15],ry:IGX.cs?.4:-.4,lc:{amb:'#ffc8a0',key:'#ffd8a8',rim:'#b080ff'},solo:igxV(100,9)<30,zm:1.45});
_S.car.V=[_S.car,
 {n:'Garage',bg:igxCarScene((x,r,h)=>{igxF(x,'#4a4a52',0,0,160,92);for(let i=0;i<160;i+=20)igxF(x,'#3e3e46',i,0,2,92);
   igxF(x,'#1a1a20',8,14,70,50);for(let i=0;i<5;i++)igxF(x,'#2a2a32',8,16+i*10,70,1);igxF(x,'#8a8a94',100,14,50,40);for(let i=0;i<6;i++)igxF(x,['#e84a4a','#4a90e8','#ffe066'][i%3],104+i*8,18+(i%2)*10,5,8);
   igxF(x,'#ffe7a0',60,0,40,3);x.save();x.globalAlpha=.16;x.fillStyle='#ffe7a0';x.beginPath();x.moveTo(60,3);x.lineTo(100,3);x.lineTo(130,100);x.lineTo(30,100);x.fill();x.restore();
   igxF(x,'#24242a',0,92,160,28);igxF(x,'#2f2f36',0,92,160,2);for(let i=0;i<5;i++)igxF(x,'#e8c02a',i*34+4,110,18,2);return 94}),fg:IGXS.car.fg,
  set:h=>({shot:'full',xs:[IGX.cs?-1.15:1.15],ry:IGX.cs?.4:-.4,lc:{amb:'#e0e0f0',key:'#fff4e0',rim:'#e8c02a'},solo:igxV(100,9)<30,zm:1.45})},
 {n:'Desert road',bg:igxCarScene((x,r,h)=>{igxGrad(x,'#4aa0e8','#ffe8b0',0,60);igxDisc(x,'#fff4c0',120,20,9);
   [[10,60,30],[50,60,20],[110,60,34]].forEach(([mx,my,mw])=>{for(let i=0;i<mw;i++)igxF(x,'#b87a4a',mx+i,my-Math.min(i,mw-i)*.9,1,Math.min(i,mw-i)*.9+10)});
   igxF(x,'#e8b870',0,66,160,54);igxF(x,'#3a3a40',0,78,160,22);for(let i=0;i<8;i++)igxF(x,'#e8c02a',i*22+4,88,12,2);igxF(x,'#5a5a60',0,78,160,1);
   [[30,72],[140,70]].forEach(([cx,cy])=>{igxF(x,'#3a8a3a',cx,cy-10,3,12);igxF(x,'#3a8a3a',cx-3,cy-7,3,2);igxF(x,'#3a8a3a',cx+3,cy-8,3,2)});return 98}),fg:(x,r)=>{for(let i=0;i<20;i++)igxF(x,'#c89a5a',r()*160,108+r()*10,3,1)},
  set:h=>({shot:'full',xs:[IGX.cs?-1.15:1.15],ry:IGX.cs?.4:-.4,lc:{amb:'#fff0d8',key:'#fff4d0',rim:'#ffffff'},solo:igxV(100,9)<30,zm:1.45})},
 {n:'Neon harbour',bg:igxCarScene((x,r,h)=>{igxGrad(x,'#06081a','#2a1a50',0,60);for(let i=0;i<30;i++)igxF(x,'#fff8',r()*160,r()*40,1,1);
   igxGrad(x,'#101a3a','#1a2a5a',60,80);for(let i=0;i<20;i++)igxF(x,['#ff4fd8','#4fd8ff'][i%2]+'88',r()*160,62+r()*16,6,1);
   for(let i=0;i<7;i++){const bw=14+r()*10,bh=16+r()*26;igxF(x,'#0e1230',i*24,60-bh,bw,bh);for(let k=0;k<5;k++)igxF(x,'#ffd36a',i*24+2+(k%2)*5,62-bh+k*6,2,2)}
   igxF(x,'#14142a',0,80,160,40);igxF(x,'#222238',0,80,160,2);for(let i=0;i<8;i++)igxF(x,'#ff4fd8',i*22,104,14,1);
   [[20],[80],[140]].forEach(([lx])=>{igxF(x,'#2a2a3a',lx,56,2,26);igxF(x,'#4fd8ff',lx-3,54,8,3);x.save();x.globalAlpha=.12;igxF(x,'#4fd8ff',lx-8,57,18,40);x.restore()});return 96}),fg:(x)=>{x.save();x.globalAlpha=.1;igxF(x,'#8a4aff',0,0,160,120);x.restore()},
  set:h=>({shot:'full',xs:[IGX.cs?-1.15:1.15],ry:IGX.cs?.4:-.4,lc:{amb:'#8090e8',key:'#c8d0ff',rim:'#ff4fd8'},solo:igxV(100,9)<30,zm:1.45})},
 {n:'Car park',bg:igxCarScene((x,r,h)=>{igxF(x,'#7a7a82',0,0,160,96);igxF(x,'#5a5a62',0,0,160,10);for(let i=0;i<5;i++){igxF(x,'#9a9aa2',i*40+18,10,12,86);igxF(x,'#6a6a72',i*40+28,10,2,86)}
   for(let i=0;i<4;i++){igxF(x,'#fff8c8',i*40+30,6,16,3)}igxF(x,'#4a4a52',0,96,160,24);for(let i=0;i<9;i++)igxF(x,'#e8e8e8',i*20+4,100,2,20);
   igxF(x,'#2a6ad8',130,20,22,14);igxTxt(x,'P',139,24,'#fff',2);return 108}),fg:IGXS.car.fg&&((x)=>{}),
  set:h=>({shot:'full',xs:[IGX.cs?-1.15:1.15],ry:IGX.cs?.4:-.4,lc:{amb:'#d8d8e0',key:'#f4f4ff',rim:'#ffe27a'},solo:igxV(100,9)<30,zm:1.45})}];

_S.pet.n='Park';_S.pet.poses=['pet','pet','wave','peace','chill'];_S.pet.shots=['full','med','full','med'];
_S.pet.V=[_S.pet,
 {n:'Garden',bg(x,r,h,p){igxGrad(x,'#8ad0f8','#d8f0ff',0,60);igxF(x,'#e8d8c0',0,24,50,36);igxF(x,'#b84a3a',0,16,56,10);igxF(x,'#f4efe6',8,32,16,18);igxF(x,'#8ac4f0',10,34,12,14);
   igxGrad(x,'#5ab05a','#3f9a48',60,120);for(let i=0;i<160;i+=6)igxF(x,'#f4f4f4',i,66,4,22);igxF(x,'#e8e8e8',0,70,160,2);igxF(x,'#e8e8e8',0,80,160,2);
   for(let i=0;i<20;i++){const fx=r()*160,fy=88+r()*30,c=['#ff6aa0','#ffe066','#ffffff','#ff8a3a','#b58aff'][i%5];igxF(x,'#2f7a32',fx,fy,1,5);igxF(x,c,fx-1,fy-2,3,3)}},
  fg(x,r,h){for(let i=0;i<60;i++){igxF(x,r()<.5?'#2f8a3a':'#5fc060',r()*160,108+r()*12,1,4)}},set:h=>({shot:'full',xs:[-.3],ry:.2,lc:{amb:'#d8ecff',key:'#fff3d0',rim:'#ffffff'},pet:1})},
 {n:'Home',bg(x,r,h,p){IGXS.home.bg(x,r,h,p)},fg(x,r,h){IGXS.home.fg(x,r,h)},set:h=>({shot:'full',xs:[-.3],ry:.2,lc:{amb:'#ffe6c8',key:'#fff0d8',rim:'#ffd090'},pet:1,pose:'pet'})}];

_S.album.n='Cover wall';_S.album.poses=['vinyl','vinyl','thumb','peace','hands','crossed'];_S.album.shots=['med','med','full','med'];
_S.album.V=[_S.album,
 {n:'Record shop',bg(x,r,h,p){igxF(x,'#2a1c30',0,0,160,92);for(let s=0;s<3;s++){igxF(x,'#6a4a30',4,16+s*26,100,3);for(let i=0;i<24;i++)igxF(x,'hsl('+((h+i*29+s*70)%360)+',55%,'+(30+(i%4)*9)+'%)',6+i*4,s*26+2,3,14)}
   const sn=igxClip(igxSong(p),10),hu=igxHash(sn)%360;igxF(x,'#000',110,10,44,44);igxF(x,'hsl('+hu+',55%,30%)',112,12,40,40);igxDisc(x,'hsl('+((hu+60)%360)+',70%,55%)',132,32,13);igxTxt(x,sn,132-igxTW(sn)/2,44,'#fff');
   igxF(x,'#120a18',110,58,44,10);igxTxt(x,'NEW IN',116,60,'#ffd23f',1);igxGrad(x,'#4a3a30','#2a1e18',92,120)},
  fg(x,r,h){igxF(x,'#6a4a30',0,106,160,14);for(let i=0;i<26;i++)igxF(x,'hsl('+((h+i*31)%360)+',55%,'+(30+(i%3)*10)+'%)',3+i*6,98,5,12);igxF(x,'#3a2a1c',0,106,160,2)},set:h=>({shot:'med',xs:[.15],ry:-.2,lc:{amb:'#e0c8ff',key:'#fff0e0',rim:'#ffd23f'},pose:'vinyl'})},
 {n:'Billboard',bg(x,r,h,p){igxGrad(x,'#070b1f','#2a2350',0,92);for(let i=0;i<30;i++)igxF(x,'#fff8',r()*160,r()*30,1,1);for(let i=0;i<10;i++){const bw=14+r()*12,bh=20+r()*30;igxF(x,'#0e1230',i*17,92-bh,bw,bh)}
   const sn=igxClip(igxSong(p),10),hu=igxHash(sn)%360;igxF(x,'#222',44,4,72,50);igxF(x,'#000',46,6,68,46);igxF(x,'hsl('+hu+',55%,30%)',48,8,64,42);igxDisc(x,'hsl('+((hu+60)%360)+',70%,55%)',80,26,16);igxF(x,'#0006',48,40,64,10);igxTxt(x,sn,80-igxTW(sn)/2,42,'#fff');
   igxF(x,'#444',76,56,8,40);igxF(x,'#2a2a30',0,92,160,28);igxF(x,'#3a3a44',0,92,160,2)},
  fg(x,r,h){},set:h=>({shot:'full',xs:[-.45],ry:.3,lc:{amb:'#8090e8',key:'#c8d0ff',rim:'#ffd23f'}})}];

/* ---- extra poses ---- */
{const ip0=igxPose;igxPose=function(o,pose,c,side){const[L,R_]=o.arms||[],g=o.g,hd=igxHead(g),sk=SKIN[c.skin%SKIN.length]||'#d99a6c';
 if(pose=='hands'){igxAim(R_,[.45,.88,.1]);igxAim(L,[-.45,.88,.1]);if(hd)hd.rotation.x=-.12}
 else if(pose=='point'){igxAim(R_,[.95,.12,.4]);igxAim(L,[-.2,-.97,.1]);if(hd)hd.rotation.y=-.2}
 else if(pose=='thumb'){igxAim(R_,[.25,.35,.95]);B(R_,.1,.1,.1,sk,0,-.58,0);B(R_,.035,.09,.035,sk,0,-.66,.04);igxAim(L,[-.25,-.95,.1]);if(hd)hd.rotation.z=.06}
 else if(pose=='crossed'){igxAim(L,[.75,-.35,.65]);igxAim(R_,[-.75,-.35,.65]);if(hd)hd.rotation.x=-.04}
 else if(pose=='guitar'){igxAim(R_,[-.15,-.7,.9]);igxAim(L,[.55,-.05,.85]);const gt=new THREE.Group();gt.position.set(0,.95,.32);gt.rotation.z=.55;g.add(gt);B(gt,.42,.5,.1,'#a8622a',-.12,-.1,0);B(gt,.1,.1,.11,'#222',-.12,-.05,0);B(gt,.75,.07,.06,'#3a2a1a',.5,.12,0);B(gt,.14,.2,.06,'#222',.92,.14,0)}
 else return ip0.apply(this,arguments)}}
/* camera angle on top of the framing from 178 */
{const is0=igxShot;igxShot=function(cam,box,shot,ar,hy){is0.apply(this,arguments);const e=IGX.ex;if(!e)return;const zm=e.zm||1,d0=cam.position.z,f=Math.tan(cam.fov*Math.PI/360)*2,cy=cam.position.y-.08+d0*f*(zm-1)/2,d=d0*zm;cam.position.set(d*Math.sin(e.az),cy+.08+e.el*d,d*Math.cos(e.az));cam.lookAt(0,cy,0)}}

/* ---- the photo: scene, backdrop, pose, shot and facing, from the post's own choices or its hash ---- */
{const k0=igxKind;igxKind=function(p){return p&&p.scene&&IGXS[p.scene]?p.scene:k0(p)}}
function igxPlan(p){const kd=IGXS[igxKind(p)]?igxKind(p):'studio',base=IGXS[kd],h=igxHash(p.hk||(String(p.id)+(p.u||'')+(p.seed||'')));IGX.v=h>>>4;IGX.solo=0;
 const vs=base.V||[base],vi=p.bd!=null&&p.bd>=0?p.bd%vs.length:igxV(vs.length,1),sc=vs[vi];
 const wantSolo=p.pose=='solo'?1:(p.pose&&p.pose!='auto'?0:(kd=='car'?0:(kd=='city'||kd=='park'?igxV(100,8)<10:kd=='album'?igxV(100,8)<12:0)));
 IGX.solo=(p.pose=='solo'||(kd=='car'&&!p.pose&&igxV(100,9)<30)||(kd=='car'&&p.pose=='auto'&&igxV(100,9)<30))?1:(wantSolo?1:0);
 return{kd,base,h,vs,vi,sc}}
function igxPhoto(p){const W=IGX.W,H=IGX.H,pl=igxPlan(p),{kd,base,h,sc}=pl,r=igxRng(h),
 k=document.createElement('canvas');k.width=W;k.height=H;const x=k.getContext('2d');x.imageSmoothingEnabled=false;
 const bs=base.set(h),vsx=sc.set?sc.set(h):{},set=Object.assign({},bs,vsx);if(set.solo!==undefined&&kd=='car')IGX.solo=(p.pose=='solo'||((!p.pose||p.pose=='auto')&&set.solo))?1:0;
 const pls=base.poses||['chill'];let pose=p.pose&&p.pose!='auto'&&p.pose!='solo'?p.pose:(vsx.pose||pls[igxV(pls.length,2)]);
 if(pose=='pet'&&!set.pet)pose=(base.poses||[]).find(q=>q!='pet')||'chill';
 set.pose=pose;if(set.pet&&!(p.pose&&p.pose!='auto'))set.pose=vsx.pose||'pet';
 if(p.shot&&p.shot!='auto')set.shot=p.shot=='wide'?'full':p.shot=='mid'?'med':'close';else if(!vsx.shot){const sh=base.shots||['med'];set.shot=sh[igxV(sh.length,3)]}
 if(p.face&&p.face!='auto')set.ry=p.face=='l'?-.5:p.face=='r'?.5:0;else if(igxV(2,5))set.ry=-(set.ry||0);
 set.xs=[(set.xs[0]||0)+(igxV(5,4)-2)*.1];
 IGX.ex=kd=='fit'&&pl.vi==0?{az:0,el:0,zm:1}:{az:(igxV(7,6)-3)*.05,el:(igxV(3,7)-1)*.1,zm:set.zm||1};
 sc.bg(x,r,h%360,p);
 const people=IGX.solo?[]:[{c:p.cfg||ch,mine:!!p.mine}];if(!IGX.solo&&p.cfg2){people.push({c:p.cfg2});set.xs=[-.45,.45];set.ry=.3;set.shot='med'}
 if(set.pet&&IGX.solo)people.push({c:p.cfg||ch,mine:!!p.mine}),IGX.solo=0;
 let cv;try{cv=igxRender(people,set,W,H)}finally{IGX.ex=null}
 if(people.length)x.drawImage(cv,0,0);
 (sc.fg||igxNoop)(x,r,h%360,p);
 const t=h%4;x.save();if(t==1){x.globalAlpha=.08;igxF(x,'#ffa040',0,0,W,H)}else if(t==2){x.globalAlpha=.07;igxF(x,'#4080ff',0,0,W,H)}x.restore();
 for(let i=0;i<10;i++){const a='rgba(0,0,0,'+(.035*(10-i)/10)+')';igxF(x,a,0,i,W,1);igxF(x,a,0,H-1-i,W,1);igxF(x,a,i,0,1,H);igxF(x,a,W-1-i,0,1,H)}
 for(let i=0;i<120;i++)igxF(x,r()<.5?'#ffffff0d':'#0000000d',r()*W,r()*H,1,1);
 const o=document.createElement('canvas');o.width=W*2;o.height=H*2;const ox=o.getContext('2d');ox.imageSmoothingEnabled=false;ox.drawImage(k,0,0,W*2,H*2);return o.toDataURL()}

/* ===== the post studio ===== */
const IGCS=['stage','studio','city','park','home','fit','car','pet','album'];
const IGCP={auto:'Auto',mic:'Mic',phones:'Headphones',peace:'Peace',wave:'Wave',selfie:'Selfie',chill:'Chill',hands:'Hands up',point:'Pointing',thumb:'Thumbs up',crossed:'Arms crossed',guitar:'Guitar',vinyl:'Holding a record',pet:'With pet',solo:'No one'};
const IGCC={stage:['Soundcheck done, doors open soon','Tonight the crowd was unreal','Sweaty, loud and happy','New setlist, who is coming?','Lights up, volume up','Thank you to everyone who sang along'],
 studio:['Back in the studio, new one cooking','Late night session, do not disturb','Headphones on, world off','This hook will not leave my head','Mixing until the sun comes up','Take 47 and it is still not right'],
 city:['The city looks different from up here','Golden hour and big plans','Night walk, new lyrics in my head','Skyline therapy','Writing the next verse above the streets','Found a new favourite spot'],
 park:['Fresh air and fresh lyrics','Touching grass, highly recommend','Day off, phone mostly off','Best office I have ever had','Sun is out, mood is up','Writing in the park again'],
 home:['Home sweet home','Lazy day, new ideas','Cosy corner, big plans','Recording at home again, neighbours please forgive me','My favourite room in the world','Slow morning, loud evening'],
 fit:['Fit check, thoughts?','New fit, who dis','Outfit of the day, drip loading','Dressed for the next big thing','Matching the vibe today','Style is a form of lyrics'],
 car:['Spotted this beauty on the road today','Look at the paint on this one','Parked up and could not stop staring','This one is on my wish list','Car spotting never gets old','Dream ride, one day'],
 pet:['My manager has arrived','Best listener in the world','Pet cameo of the day','Studio buddy on duty','Walkies and writing songs','Someone insisted on being in this photo'],
 album:['New single out now, go stream it','It is finally out. Thank you all','Out now: link in my head, go listen','Cover art day, so proud of this one','This one is for you, thank you for listening','Another one for the playlist']};
let IGC=null;
const igcRand=n=>Math.floor(Math.random()*n);
function igcNew(){const sc=IGCS[igcRand(IGCS.length)];IGC={sc,bd:null,pose:'auto',shot:'auto',face:'auto',seed:igcRand(1e6),cap:IGCC[sc][igcRand(6)],pv:null,pk:''}}
function igcOpen(){if(S.lastPost==S.day){try{snd('err')}catch(e){}return say('One post per day.')}igcNew();igv='newpost';pcR()}
function igcPost(){return{id:'pv',u:S.artist,mine:1,cfg:Object.assign({},ch),cap:IGC.cap||'new post',scene:IGC.sc,bd:IGC.bd,pose:IGC.pose,shot:IGC.shot,face:IGC.face,hk:'c'+IGC.seed}}
function igcSet(k,v){if(!IGC)return;if(k=='sc'&&IGC.sc!=v){IGC.sc=v;IGC.bd=null;if(IGC.pose=='pet'&&v!='pet')IGC.pose='auto';if(IGCC[IGC.sc].indexOf(IGC.cap)<0&&Object.values(IGCC).some(a=>a.indexOf(IGC.cap)>=0))IGC.cap=IGCC[v][igcRand(6)]}else IGC[k]=v;pcR()}
function igcShuffle(){if(!IGC)return;const c=IGC.cap,old=Object.values(IGCC).some(a=>a.indexOf(c)>=0);igcNew();if(!old)IGC.cap=c;pcR()}
function igcCap(c){if(IGC){IGC.cap=c;pcR()}}
function igcCapMore(){if(!IGC)return;const L=IGCC[IGC.sc],i=L.indexOf(IGC.cap);IGC.cap=L[(i+1+igcRand(L.length-1))%L.length];pcR()}
function igcShare(){if(!IGC)return;if(S.lastPost==S.day){try{snd('err')}catch(e){}IGC=null;igv='acct';pcR();return say('One post per day.')}
 const q=igcPost(),before=S.igPosts.length;mkPost();const p=S.igPosts[S.igPosts.length-1];
 if(S.igPosts.length>before&&p&&p.mine){const cap=String(IGC.cap||'').trim().slice(0,120);if(cap)p.cap=cap;p.scene=q.scene;p.kind=q.scene;p.hk=q.hk;if(q.bd!=null)p.bd=q.bd;['pose','shot','face'].forEach(k=>{if(q[k]&&q[k]!='auto')p[k]=q[k]});delete PICS[p.id]}
 IGC=null;igv='acct';igt='posts';pcR()}
function igcClose(go){IGC=null;igv=go||'acct';pcR()}
function igcChips(k,list,cur){return list.map(([v,n])=>`<button class="igcb${cur===v?' on':''}" onclick="igcSet('${k}',${typeof v=='number'?v:"'"+v+"'"})">${esc(n)}</button>`).join('')}
{const st=document.createElement('style');st.textContent='.ig .igc{padding:10px 14px;display:flex;flex-direction:column;gap:9px}.ig .igcpv{display:block;width:100%;max-width:480px;margin:0 auto;image-rendering:pixelated;border:1px solid #262626}.ig .igcr small{display:block;color:#aaa;margin-bottom:3px}.ig .igcw{display:flex;gap:5px;flex-wrap:wrap}.ig .igcb{font-size:12px;padding:5px 9px}.ig .igcb.on{background:#2a6af0;color:#fff;border-color:#2a6af0}.ig .igc input{width:100%;padding:8px;background:#121212;color:#fff;border:1px solid #363636;border-radius:6px;box-sizing:border-box}';document.head.appendChild(st)}
function igcHTML(){const hd=`<div class=igh><span class=igl>Instagrime</span><span style="display:flex;gap:8px"><button onclick="igcClose('feed')">Feed</button><button class=go onclick="igcClose()">Account</button></span></div>`;
 let u='';try{const key=JSON.stringify([IGC.sc,IGC.bd,IGC.pose,IGC.shot,IGC.face,IGC.seed,IGC.sc=='album'||IGC.sc=='stage'||IGC.sc=='car'||IGC.sc=='city'?IGC.cap:'']);if(IGC.pk==key&&IGC.pv)u=IGC.pv;else{u=igxPhoto(igcPost());IGC.pv=u;IGC.pk=key}}catch(e){console.warn('post preview',e)}
 const vs=IGXS[IGC.sc].V||[IGXS[IGC.sc]],poses=Object.keys(IGCP).filter(k=>k!='pet'||IGC.sc=='pet').filter(k=>k!='solo'||(IGC.sc!='fit'&&IGC.sc!='pet'));
 return`<div class=ig>${hd}<div class=igc><b>New post</b>${u?`<img class=igcpv src="${u}">`:''}
 <div class=igcr><small>Place</small><div class=igcw>${igcChips('sc',IGCS.map(k=>[k,IGXN[k]]),IGC.sc)}</div></div>
 ${vs.length>1?`<div class=igcr><small>Backdrop</small><div class=igcw>${igcChips('bd',[[null,'Auto']].concat(vs.map((v,i)=>[i,v.n||'Backdrop '+(i+1)])),IGC.bd)}</div></div>`:''}
 <div class=igcr><small>Pose</small><div class=igcw>${igcChips('pose',poses.map(k=>[k,IGCP[k]]),IGC.pose)}</div></div>
 <div class=igcr><small>Shot</small><div class=igcw>${igcChips('shot',[['auto','Auto'],['close','Close-up'],['mid','Medium'],['wide','Full body']],IGC.shot)}</div></div>
 <div class=igcr><small>Facing</small><div class=igcw>${igcChips('face',[['auto','Auto'],['l','Left'],['f','Front'],['r','Right']],IGC.face)}</div></div>
 <div class=igcr><small>Caption</small><input maxlength=120 value="${esc(IGC.cap)}" oninput="IGC.cap=this.value" placeholder="Write a caption"><div class=igcw style="margin-top:6px">${IGCC[IGC.sc].slice(0,4).map((c,i)=>`<button class=igcb onclick="igcCap(IGCC[IGC.sc][${i}])">${esc(c)}</button>`).join('')}<button class=igcb onclick="igcCapMore()">More ideas</button></div></div>
 <div class=igcw><button class=go onclick="igcShare()">Share</button><button onclick="igcShuffle()">Surprise me</button><button onclick="igcClose()">Cancel</button></div></div></div>`}
{const ig0=PA.ig;PA.ig=function(){if(igv=='newpost'){if(!IGC)igcNew();try{return igcHTML()}catch(e){console.error('post studio',e);IGC=null;igv='acct'}}
 const h=ig0.apply(this,arguments);return igv=='acct'&&typeof h=='string'?h.replace(/onclick="mkPost\(\)">New post/,'onclick="igcOpen()">New post'):h}}
