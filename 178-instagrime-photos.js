/* ===== v49.26.0: Instagrime photos that look like you, detailed profile pictures, richer DMs =====
   1. Photos: every drawn Instagrime post (yours, collabs, the feed, artist profiles) is now a real photo of the 3D character
      from the game (buildChar, so your hair, face, clothes, hat, glasses and prints all match), posed for the scene
      (mic up on stage, headphones in the studio, a peace sign on the rooftop, a mirror selfie for a fit check, a pet at
      your feet, holding your new record...) in front of a detailed pixel scene: the stage screen shows your name, the
      album shot shows your song title. Rendered at 160x120 and shown at 2x so it keeps the game's pixel look.
      Uploaded photo posts (84-pixel-pictures.js, Gphone photos) are unchanged.
   2. Profile pictures: your Instagrime picture, the post headers and artist profiles in Instagrime, and the artist chats in
      Messages show a head-and-shoulders render of the 3D character instead of the 16x16 face. An uploaded picture still wins.
   3. DMs: the first messages artists send, their collab asks, music talk and check-ins are longer and fit the moment: they
      name your latest song and its streams, your last Instagrime post, your genre and theirs, and what they are working on.
      Lines use [[tokens]] that igxTok() fills in when they land in a chat (fill() would turn unknown {tokens} into "undefined"). */

/* ---------- offscreen renderer ---------- */
const IGX={r:null,s:null,cam:null,L:{},W:160,H:120,PF:{},on:1};
function igxInit(){if(IGX.r)return IGX.r;const r=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(IGX.W,IGX.H,false);
 const s=new THREE.Scene(),amb=new THREE.AmbientLight(0xffffff,.68),key=new THREE.DirectionalLight(0xffffff,.85),rim=new THREE.DirectionalLight(0xffffff,.45);
 key.position.set(2.5,3.5,5);rim.position.set(-3,2.5,-3);s.add(amb,key,rim);IGX.L={amb,key,rim};IGX.cam=new THREE.PerspectiveCamera(30,4/3,.1,60);IGX.s=s;IGX.r=r;return r}
const igxRng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const igxHash=t=>{let h=2166136261;for(const c of String(t))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h};
const igxMix=(a,b,t)=>'#'+new THREE.Color(a).lerp(new THREE.Color(b),Math.max(0,Math.min(1,t))).getHexString();
/* build a character; the player's own wrappers (prints, clothes detail, bling) only run for c===ch, so a look is built as ch */
function igxChar(c,mine){if(!mine)return buildChar(c);const keep=ch;try{ch=c;return buildChar(ch)}finally{ch=keep}}
/* point an arm (a shoulder pivot) along a direction in the body's own space */
const IGXD=new THREE.Vector3(0,-1,0);
function igxAim(arm,d){if(!arm||!d)return;arm.quaternion.setFromUnitVectors(IGXD,new THREE.Vector3(d[0],d[1],d[2]).normalize())}
const igxHead=g=>{try{return xHead(g)}catch(e){return null}};

/* ---------- pixel helpers ---------- */
const igxF=(x,c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))};
function igxGrad(x,c0,c1,y0,y1,X0,X1){const n=Math.max(1,y1-y0);for(let y=y0;y<y1;y++){const t=(y-y0)/n,q=Math.round(t*7)/7;igxF(x,igxMix(c0,c1,q),X0||0,y,(X1||160)-(X0||0),1)}}
function igxDisc(x,c,cx,cy,r){for(let y=-r;y<=r;y++){const w=Math.round(Math.sqrt(r*r-y*y)*2);igxF(x,c,cx-w/2,cy+y,w,1)}}
/* 3x5 pixel font for signs, screens and covers */
const IGXG={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'111101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',0:'111101101101111',1:'010110010010111',2:'110001010100111',3:'110001010001110',4:'101101111001001',5:'111100110001110',6:'011100111101111',7:'111001010010010',8:'111101111101111',9:'111101111001110','!':'010010010000010','.':'000000000000010',"'":'010010000000000','-':'000000111000000','&':'010101010101011','?':'110001010000010',':':'000010000010000','#':'101111101111101'};
function igxTxt(x,s,X,Y,col,sc){sc=sc||1;s=String(s).toUpperCase();let cx=X;for(const ch_ of s){const g=IGXG[ch_];if(g)for(let i=0;i<15;i++)if(g[i]=='1')igxF(x,col,cx+(i%3)*sc,Y+Math.floor(i/3)*sc,sc,sc);cx+=4*sc}return cx-X}
const igxTW=(s,sc)=>String(s).length*4*(sc||1)-(sc||1);
const igxClip=(s,n)=>{s=String(s||'').replace(/\s*\((feat|ft)\.?[^)]*\)/i,'').toUpperCase().replace(/[^A-Z0-9!.'&?:# -]/g,'').trim();return s.length>n?s.slice(0,n-1).trim()+'.':s};

/* ---------- scene kinds ---------- */
function igxKind(p){const t=String(p.cap||'').toLowerCase();if(/played|festival|stadium|arena|\bgig\b|\bshow\b|on stage|headlin/.test(t))return'stage';if(/new song out now|out now:|new single/.test(t))return'album';
 let k='studio';try{k=kindOf(p)}catch(e){}return k=='food'?'studio':k}
const igxArtist=p=>p.mine?(S.artist||'you'):p.u||'';
const igxSong=p=>{const m=String(p.cap||'').match(/out now:?\s*(.+)$/i)||String(p.cap||'').match(/"([^"]+)"/);if(m)return m[1];const s=(S.songs||[]).slice(-1)[0];return p.mine&&s?s.title:'new single'};

/* each scene: bg (behind the people), fg (in front), set (camera shot, where people stand, their pose, light colours, 3D props) */
const IGXS={
stage:{bg(x,r,h,p){igxGrad(x,'#0b0718','#2a0f3a',0,96);
  /* LED wall with the artist's name */
  igxF(x,'#05040a',18,14,124,58);for(let yy=16;yy<70;yy+=2)for(let xx=20;xx<140;xx+=2){const v=Math.sin(xx*.09+h)+Math.cos(yy*.13+h*.5);igxF(x,'hsl('+((h+v*30+360)%360)+',70%,'+(14+v*6)+'%)',xx,yy,1,1)}
  const nm=igxClip(igxArtist(p),14),sc=igxTW(nm,2)<=64?2:1;igxTxt(x,nm,23,19,'#000a',sc);igxTxt(x,nm,22,18,'#fff',sc);
  /* truss and lights, with beams */
  igxF(x,'#3a3a46',0,4,160,3);for(let i=0;i<160;i+=6)igxF(x,'#22222c',i,5,3,1);
  const cols=['#ff4fd8','#4fd8ff','#ffe066','#7aff9a'];x.save();for(let i=0;i<6;i++){const lx=10+i*28,c=cols[(i+h)%4];x.globalAlpha=.16;x.fillStyle=c;x.beginPath();x.moveTo(lx,8);x.lineTo(lx-14-r()*16,100);x.lineTo(lx+14+r()*16,100);x.fill();x.globalAlpha=1;igxF(x,'#111',lx-3,7,7,4);igxF(x,c,lx-2,10,5,2)}x.restore();
  /* speaker stacks, haze, floor */
  [[2,46],[140,46]].forEach(([sx,sy])=>{igxF(x,'#101014',sx,sy,18,46);for(let k=0;k<3;k++){igxDisc(x,'#26262e',sx+9,sy+8+k*14,5);igxDisc(x,'#0a0a0d',sx+9,sy+8+k*14,2)}});
  x.save();x.globalAlpha=.07;for(let i=0;i<14;i++){x.fillStyle='#fff';x.fillRect(r()*150,50+r()*40,20+r()*30,3)}x.restore();
  igxGrad(x,'#2b1d3a','#140c20',90,120);for(let i=0;i<8;i++)igxF(x,cols[i%4]+'55',8+i*19,94,10,1)},
 fg(x,r,h){/* crowd: heads, raised hands and phone screens */
  for(let i=0;i<30;i++){const cx=i*5.6-2+r()*3,hy=106+r()*6;igxDisc(x,'#07040c',cx,hy,3.4);igxF(x,'#07040c',cx-4,hy+2,9,14);if(r()<.35){const ax=cx+(r()<.5?-3:3);igxF(x,'#07040c',ax,hy-12,2,12);if(r()<.6){igxF(x,'#0c0c12',ax-1,hy-17,4,6);igxF(x,'#cfe9ff',ax,hy-16,2,4)}}}
  for(let i=0;i<5;i++)igxF(x,'#fff8',r()*160,98+r()*6,1,1)},
 set:(h)=>({shot:'med',xs:[.5],ry:-.25,lc:{amb:'#b9a8ff',key:'#ffe4f4',rim:['#ff4fd8','#4fd8ff','#ffe066'][h%3]},pose:'mic'})},

studio:{bg(x,r,h,p){igxGrad(x,'#2c2438','#1b1626',0,92);
  /* acoustic foam panels */
  for(let py=8;py<60;py+=8)for(let px=4;px<70;px+=8){igxF(x,'#3a3048',px,py,7,7);igxF(x,'#463a58',px,py,7,2);igxF(x,'#2a2236',px+5,py,2,7)}
  /* ON AIR sign */
  igxF(x,'#120a10',96,8,40,13);igxF(x,'#ff3b5c',97,9,38,11);igxF(x,'#ff8aa0',97,9,38,1);igxTxt(x,'ON AIR',105,12,'#fff');
  /* record shelf and gold record */
  igxF(x,'#5a3b24',90,34,62,3);for(let i=0;i<14;i++)igxF(x,'hsl('+((h+i*37)%360)+',45%,'+(28+(i%3)*10)+'%)',92+i*4,24,3,10);
  igxF(x,'#3b2a1a',122,44,24,24);igxF(x,'#f5f0e0',124,46,20,20);igxDisc(x,'#d9a72a',134,56,8);igxDisc(x,'#b0841c',134,56,3);igxF(x,'#fff6',129,51,2,2);
  /* glass to the live room */
  igxF(x,'#0e1a22',4,64,64,26);igxF(x,'#1c3442',6,66,60,22);x.save();x.globalAlpha=.25;x.fillStyle='#fff';x.beginPath();x.moveTo(20,66);x.lineTo(30,66);x.lineTo(14,88);x.lineTo(6,88);x.fill();x.restore();
  igxGrad(x,'#3b2a20','#24170f',92,120)},
 fg(x,r,h){/* mixing desk */
  igxF(x,'#17171c',0,100,160,20);igxF(x,'#2a2a33',0,100,160,2);for(let i=0;i<28;i++){const fx=4+i*5.6,fy=104+Math.round(r()*8);igxF(x,'#0b0b0e',fx+1,103,1,15);igxF(x,'#d8d8de',fx,fy,3,2)}
  for(let i=0;i<28;i++)igxF(x,r()<.2?'#ff5050':r()<.4?'#ffd040':'#40ff8a',4+i*5.6,101,2,1);
  igxF(x,'#0d0d10',138,70,22,32);igxDisc(x,'#2c2c36',149,82,6);igxDisc(x,'#0a0a0d',149,82,2);igxDisc(x,'#2c2c36',149,96,3)},
 set:(h)=>({shot:'med',xs:[.3],ry:-.35,lc:{amb:'#ffd9b0',key:'#fff2e0',rim:'#7fd6ff'},pose:'phones',mic:1})},

city:{bg(x,r,h,p){const night=h%2==0;
  if(night){igxGrad(x,'#070b1f','#2a2350',0,80);for(let i=0;i<40;i++)igxF(x,r()<.2?'#fff':'#c8d0ff',r()*160,r()*50,1,1);igxDisc(x,'#fff6d0',130,16,6);igxDisc(x,'#20264a',133,14,5)}
  else{igxGrad(x,'#ff9a5c','#6b3fa0',0,30);igxGrad(x,'#ffcf7a','#ff9a5c',30,80);igxDisc(x,'#fff1b0',112,62,11)}
  /* two layers of skyline with lit windows */
  const far=night?'#141a36':'#7a4a7a',near=night?'#0b0f22':'#4a2a52';
  for(let i=0;i<12;i++){const bw=10+r()*12,bh=20+r()*36,bx=i*14-4;igxF(x,far,bx,80-bh,bw,bh+10)}
  for(let i=0;i<9;i++){const bw=14+r()*12,bh=26+r()*44,bx=i*19-6;igxF(x,near,bx,92-bh,bw,bh+20);if(r()<.4)igxF(x,near,bx+bw/2-1,92-bh-8,2,8);
   for(let wy=92-bh+4;wy<88;wy+=4)for(let wx=bx+2;wx<bx+bw-2;wx+=3)if(r()<(night?.45:.2))igxF(x,night?(r()<.8?'#ffd36a':'#9fd8ff'):'#ffe0a0',wx,wy,1,2)}
  /* string lights */
  x.save();for(let i=0;i<160;i+=1){const y=6+Math.sin(i/160*Math.PI)*10;igxF(x,'#222',i,y,1,1);if(i%9==0){igxF(x,['#ffd36a','#ff7ab0','#7affc0'][i/9%3|0],i-1,y+1,3,3)}}x.restore()},
 fg(x,r,h){/* rooftop ledge */
  igxF(x,'#5a4a48',0,104,160,16);igxF(x,'#7a6662',0,102,160,3);for(let y=106;y<120;y+=4)for(let i=(y/4%2)*6;i<160;i+=12)igxF(x,'#4a3c3a',i,y,1,4);for(let y=106;y<120;y+=4)igxF(x,'#4a3c3a',0,y,160,1)},
 set:(h)=>({shot:'med',xs:[-.3],ry:.3,lc:h%2==0?{amb:'#8fa0ff',key:'#ffe0b0',rim:'#ff7ab0'}:{amb:'#ffcfa0',key:'#ffd59a',rim:'#ff7a50'},pose:'peace'})},

park:{bg(x,r,h,p){igxGrad(x,'#5fb2ff','#bfe6ff',0,64);
  for(let i=0;i<4;i++){const cx=10+r()*140,cy=8+r()*22;[[0,0,10],[8,-3,8],[15,1,7],[-7,2,6]].forEach(([a,b,s])=>igxDisc(x,'#ffffff',cx+a,cy+b,s/2+1));igxF(x,'#e4f2ff',cx-9,cy+3,26,2)}
  igxDisc(x,'#fff4b0',140,12,7);
  /* hills, trees, lake */
  for(let i=0;i<160;i++){const y=60+Math.sin(i*.04+h)*5;igxF(x,'#7bbf6a',i,y,1,70-y+10)}
  [[14,50,1],[36,54,.8],[128,48,1.1],[150,55,.7]].forEach(([tx,ty,s])=>{igxF(x,'#6b4a2e',tx-1,ty,3,16*s);igxDisc(x,'#2e7d32',tx,ty-2,9*s);igxDisc(x,'#43a047',tx-2,ty-5,6*s);igxDisc(x,'#66bb6a',tx-3,ty-7,3*s)});
  igxGrad(x,'#58b05a','#3f9a48',72,120);igxF(x,'#4aa3df',96,76,64,10);igxF(x,'#7cc4f0',100,77,40,1);for(let i=0;i<6;i++)igxF(x,'#fff',104+r()*52,79+r()*6,2,1);
  for(let i=0;i<4;i++)igxF(x,'#e8d9b0',40+i*14,86+i*6,30,4)},
 fg(x,r,h){for(let i=0;i<70;i++){const gx=r()*160,gy=106+r()*14;igxF(x,r()<.5?'#2f8a3a':'#5fc060',gx,gy-3,1,4)}for(let i=0;i<14;i++){const fx=r()*160,fy=108+r()*10,c=['#ff6aa0','#ffe066','#ffffff','#ff8a3a','#b58aff'][i%5];igxF(x,'#2f7a32',fx,fy,1,4);igxF(x,c,fx-1,fy-2,3,2);igxF(x,'#ffe066',fx,fy-2,1,1)}},
 set:(h)=>({shot:'med',xs:[.25],ry:-.3,lc:{amb:'#d8ecff',key:'#fff3d0',rim:'#ffffff'},pose:'wave'})},

home:{bg(x,r,h,p){const wc='hsl('+(h%360)+',28%,72%)';igxF(x,wc,0,0,160,92);for(let i=0;i<160;i+=8)igxF(x,'hsl('+(h%360)+',26%,67%)',i,0,3,92);
  /* window with a view */
  igxF(x,'#f4efe6',10,10,46,40);igxGrad(x,'#7ac4ff','#d0ecff',13,47,13,53);igxDisc(x,'#43a047',22,44,7);igxDisc(x,'#2e7d32',44,46,6);igxF(x,'#f4efe6',32,10,2,40);igxF(x,'#f4efe6',10,29,46,2);igxF(x,'#d8cfc0',8,50,50,3);
  /* framed poster with your song */
  const s=igxClip(((S.songs||[]).slice(-1)[0]||{}).title||'demo tape',9);igxF(x,'#2a2a2a',104,12,40,48);igxF(x,'hsl('+((h+180)%360)+',45%,40%)',106,14,36,44);igxDisc(x,'hsl('+((h+210)%360)+',60%,62%)',124,32,10);igxTxt(x,s,124-igxTW(s)/2,50,'#fff');
  /* lamp, plant, sofa */
  igxF(x,'#3a3a3a',72,30,1,40);igxF(x,'#ffe7a0',68,22,10,9);igxF(x,'#fff4c0',69,23,8,2);
  igxF(x,'#8a5a36',150,72,8,12);igxDisc(x,'#2e8b57',154,66,6);igxDisc(x,'#3fa66a',152,61,4);
  igxF(x,'#6a4f8a',0,70,160,22);igxF(x,'#7d60a0',0,70,160,4);igxF(x,'#5a4078',0,84,160,8);for(let i=0;i<4;i++)igxF(x,'#8b70b4',6+i*40,74,34,8);
  igxGrad(x,'#a07850','#7a5634',92,120);for(let i=0;i<160;i+=16)igxF(x,'#8a643e',i,92,1,28)},
 fg(x,r,h){igxF(x,'#5a3a22',100,108,60,4);igxF(x,'#3e2814',100,112,60,8);igxF(x,'#eeeeee',118,103,8,5);igxF(x,'#cfcfcf',126,104,2,3);igxF(x,'#fff6',140,105,6,3)},
 set:(h)=>({shot:'med',xs:[-.25],ry:.2,lc:{amb:'#ffe6c8',key:'#fff0d8',rim:'#ffd090'},pose:'chill'})},

fit:{bg(x,r,h,p){igxF(x,'#e8e0d6',0,0,160,96);for(let i=0;i<160;i+=4)igxF(x,'#e0d8cc',i,0,1,96);
  /* clothes rail */
  igxF(x,'#8a8a90',6,14,52,2);igxF(x,'#8a8a90',8,14,2,70);igxF(x,'#8a8a90',54,14,2,70);
  for(let i=0;i<8;i++){const cx=10+i*5.6,c='hsl('+((h+i*47)%360)+',50%,'+(38+(i%3)*12)+'%)';igxF(x,'#666',cx+2,15,1,3);igxF(x,c,cx,18,5,22+(i%3)*6);igxF(x,'#0002',cx+4,18,1,22+(i%3)*6)}
  /* shoe boxes and sneakers */
  for(let i=0;i<3;i++){igxF(x,['#e8672c','#222','#3d6ae0'][i],8+i*16,82-i*0,14,8);igxF(x,'#fff8',8+i*16,82,14,1)}
  igxF(x,'#fff',112,86,12,4);igxF(x,'#e33',112,89,12,1);igxF(x,'#fff',128,86,12,4);igxF(x,'#e33',128,89,12,1);
  /* shelf with caps */
  igxF(x,'#b8946a',104,30,50,3);[0,1,2].forEach(i=>{igxF(x,'hsl('+((h+90+i*80)%360)+',55%,45%)',108+i*15,24,10,6);igxF(x,'hsl('+((h+90+i*80)%360)+',55%,35%)',116+i*15,28,6,2)});
  igxGrad(x,'#c9a882','#a8875f',96,120)},
 fg(x,r,h){/* the mirror: frame, glare and a sticker */
  x.save();x.globalAlpha=.16;x.fillStyle='#fff';[[20,0],[52,0]].forEach(([a])=>{x.beginPath();x.moveTo(a+40,0);x.lineTo(a+52,0);x.lineTo(a+4,120);x.lineTo(a-8,120);x.fill()});x.restore();
  igxF(x,'#f5f5f5',0,0,160,4);igxF(x,'#f5f5f5',0,116,160,4);igxF(x,'#f5f5f5',0,0,4,120);igxF(x,'#f5f5f5',156,0,4,120);igxF(x,'#d8d8d8',4,4,152,1);igxF(x,'#d8d8d8',4,4,1,112);
  igxF(x,'#ffd23f',136,8,14,10);igxTxt(x,'OOTD',137,10,'#222')},
 set:(h)=>({shot:'full',xs:[.15],ry:0,lc:{amb:'#fff4ea',key:'#ffffff',rim:'#ffe0c0'},pose:'selfie'})},

car:{bg(x,r,h,p){igxGrad(x,'#ffb070','#7a4ea8',0,60);igxDisc(x,'#ffe2a0',30,54,12);
  for(let i=0;i<9;i++){const bw=14+r()*14,bh=18+r()*30,bx=i*19-4;igxF(x,'#3a2a4a',bx,66-bh,bw,bh)}
  igxF(x,'#5a5a64',0,66,160,10);igxF(x,'#3a3d44',0,76,160,44);for(let i=0;i<8;i++)igxF(x,'#e8d9a0',i*22,100,12,2);igxF(x,'#8a8a94',0,74,160,2);
  /* the car, side on */
  const c='hsl('+((h*7)%360)+',65%,48%)',cd='hsl('+((h*7)%360)+',65%,34%)';
  igxF(x,c,58,72,96,18);igxF(x,c,76,60,52,14);igxF(x,'#9ad0f0',80,62,20,10);igxF(x,'#9ad0f0',104,62,20,10);igxF(x,'#c8ecff',82,62,8,2);igxF(x,cd,58,86,96,4);igxF(x,'#fff6',62,74,88,1);
  igxF(x,'#ffe27a',150,76,4,4);igxF(x,'#ff4a4a',58,76,3,4);[[72,90],[134,90]].forEach(([wx,wy])=>{igxDisc(x,'#111',wx,wy,8);igxDisc(x,'#bfc4cc',wx,wy,4);igxDisc(x,'#555',wx,wy,1)})},
 fg(x,r,h){x.save();x.globalAlpha=.18;igxF(x,'#ffb070',0,0,160,120);x.restore()},
 set:(h)=>({shot:'med',xs:[-.6],ry:.45,lc:{amb:'#ffc8a0',key:'#ffd8a8',rim:'#b080ff'},pose:'chill'})},

pet:{bg(x,r,h,p){IGXS.park.bg(x,r,h,p)},fg(x,r,h){IGXS.park.fg(x,r,h)},
 set:(h)=>({shot:'full',xs:[-.25],ry:.2,lc:{amb:'#d8ecff',key:'#fff3d0',rim:'#ffffff'},pose:'pet',pet:1})},

album:{bg(x,r,h,p){igxGrad(x,'#0d0f14','#1d2230',0,120);x.save();x.globalAlpha=.12;x.fillStyle='#fff';x.beginPath();x.moveTo(70,0);x.lineTo(100,0);x.lineTo(150,120);x.lineTo(40,120);x.fill();x.restore();
  /* the big cover on the wall */
  const s=igxClip(igxSong(p),10),hu=igxHash(s)%360;igxF(x,'#000',6,10,66,66);igxF(x,'hsl('+hu+',55%,30%)',8,12,62,62);
  for(let i=0;i<8;i++)igxDisc(x,'hsl('+((hu+40+i*12)%360)+',70%,'+(30+i*6)+'%)',39,40,22-i*2.6);igxF(x,'#0006',8,58,62,16);igxTxt(x,s,39-igxTW(s)/2,62,'#fff');
  igxTxt(x,'OUT NOW',100,8,'#ffd23f',2);igxTxt(x,igxClip(igxArtist(p),14),100,22,'#ffffff');igxF(x,'#ffd23f',100,29,24,1);
  for(let i=0;i<24;i++)igxF(x,'#fff'+(r()<.5?'4':'8'),r()*160,r()*120,1,1)},
 fg(x,r,h){},
 set:(h)=>({shot:'med',xs:[.6],ry:-.3,lc:{amb:'#c8d0ff',key:'#ffffff',rim:'#ffd23f'},pose:'vinyl'})}};

/* ---------- the photo ---------- */
function igxPose(o,pose,c,side){const[L,R_]=o.arms||[],g=o.g,hd=igxHead(g),w=.42+(c.body||0)*.5,sk=SKIN[c.skin%SKIN.length]||'#d99a6c';
 if(pose=='mic'){igxAim(R_,[.3,.92,.25]);igxAim(L,[-.6,.3,.75]);B(R_,.09,.16,.09,'#2a2a30',0,-.55,0);B(R_,.13,.12,.13,'#b8bec8',0,-.66,0);B(R_,.14,.03,.14,'#6a707a',0,-.62,0);if(hd){hd.rotation.x=-.1;hd.rotation.z=-.08}}
 else if(pose=='phones'){if(hd){B(hd,.64,.07,.14,'#1d1d22',0,.34,0);[-1,1].forEach(q=>{B(hd,.1,.24,.24,'#141418',q*.32,.02,0);B(hd,.03,.16,.16,['#ff4fd8','#4fd8ff','#ffe066'][igxHash(JSON.stringify(c))%3],q*.38,.02,0)});hd.rotation.y=.12;hd.rotation.x=.06}igxAim(L,[-.3,-.6,.6]);igxAim(R_,[.25,-.9,.2])}
 else if(pose=='peace'){igxAim(R_,[.28,.9,.35]);B(R_,.035,.13,.035,sk,-.03,-.62,0).rotation.z=.25;B(R_,.035,.13,.035,sk,.03,-.62,0).rotation.z=-.25;igxAim(L,[-.25,-.95,.1]);if(hd)hd.rotation.z=-.1}
 else if(pose=='wave'){igxAim(side>0?L:R_,[side>0?-.55:.55,.85,.1]);igxAim(side>0?R_:L,[side>0?.15:-.15,-.98,.1]);if(hd)hd.rotation.z=.08}
 else if(pose=='selfie'){igxAim(R_,[-.2,.12,1]);B(R_,.2,.04,.34,'#18181c',-.04,-.55,.02);B(R_,.18,.012,.3,'#3a3a44',-.04,-.53,.02);igxAim(L,[-.55,-.8,.15]);if(hd){hd.rotation.y=.18;hd.rotation.x=.05}}
 else if(pose=='pet'){igxAim(L,[-.3,-.9,.35]);igxAim(R_,[.45,-.85,.25]);if(hd)hd.rotation.x=.15}
 else if(pose=='vinyl'){igxAim(R_,[-.25,-.55,1]);igxAim(L,[.25,-.55,1]);const v=new THREE.Group();v.position.set(-w*.25,-.52,.05);R_&&R_.add(v);v.rotation.x=Math.PI/2;
  B(v,.52,.52,.02,'#d9d0c0',0,0,0);B(v,.46,.46,.025,'#111',0,0,0);B(v,.16,.16,.03,'hsl('+(igxHash(S.artist||'x')%360)+',60%,55%)',0,0,0)}
 else{igxAim(L,[-.2,-.97,.1]);igxAim(R_,[.25,-.95,.15])}}
function igxShot(cam,box,shot,ar,hy){const top=box.max.y,f=Math.tan(cam.fov*Math.PI/360)*2;let y0,y1;
 if(shot=='full'){y0=-.18;y1=top+.3}else if(shot=='close'){y0=hy-.72;y1=Math.max(top,hy+.5)+.06}else{y0=top*.06;y1=top+.42}
 const vh=y1-y0,d=vh/f,cy=(y0+y1)/2;cam.position.set(0,cy+.08,d);cam.lookAt(0,cy,0);cam.aspect=ar;cam.updateProjectionMatrix()}
/* render people (and props) on a transparent 3D layer at W x H */
function igxRender(people,set,W,H){const r=igxInit(),s=IGX.s,cam=IGX.cam;r.setSize(W,H,false);
 const root=new THREE.Group(),box=new THREE.Box3(),hv=new THREE.Vector3();let hy=1.4;s.add(root);
 people.forEach((q,i)=>{const o=igxChar(q.c,q.mine);root.add(o.g);o.g.position.x=set.xs[i]||0;o.g.rotation.y=(set.ry||0)*(i?-1:1);o.g.updateMatrixWorld(true);box.expandByObject(o.g);const hd=igxHead(o.g);if(hd&&!i){hd.getWorldPosition(hv);hy=hv.y}igxPose(o,i&&set.pose!='mic'?'peace':set.pose,q.c,i?1:-1)});
 if(set.mic){const m=new THREE.Group();m.position.set((set.xs[0]||0)-.5,0,.45);root.add(m);B(m,.04,1.45,.04,'#222',0,.72,0);B(m,.36,.03,.36,'#222',0,.02,0);B(m,.04,.04,.36,'#333',0,1.45,.12);B(m,.1,.2,.1,'#c8ccd4',0,1.48,.3);B(m,.12,.03,.12,'#888',0,1.38,.3);B(m,.22,.22,.02,'#111',.02,1.48,.42)}
 if(set.pet){const pi=(S.pets&&S.pets.length?S.pets[0]:igxHash(JSON.stringify(people[0].c))%4)|0;try{const m=mkS(petb(pi));m.scale.setScalar(.9);m.position.set((set.xs[0]||0)+(pi==2?.32:.62),pi==2?1.08:0,pi==2?0:.25);m.rotation.y=-.6;root.add(m)}catch(e){}}
 const L=set.lc||{};IGX.L.amb.color.set(L.amb||'#ffffff');IGX.L.key.color.set(L.key||'#ffffff');IGX.L.rim.color.set(L.rim||'#ffffff');
 const b2=box.isEmpty()?new THREE.Box3(new THREE.Vector3(-.5,0,-.5),new THREE.Vector3(.5,1.9,.5)):box;igxShot(cam,b2,set.shot,W/H,hy);
 r.render(s,cam);s.remove(root);return r.domElement}
function igxPhoto(p){const W=IGX.W,H=IGX.H,kd=IGXS[igxKind(p)]?igxKind(p):'studio',sc=IGXS[kd],h=igxHash(String(p.id)+(p.u||'')),r=igxRng(h),set=sc.set(h),
 k=document.createElement('canvas');k.width=W;k.height=H;const x=k.getContext('2d');x.imageSmoothingEnabled=false;
 sc.bg(x,r,h%360,p);
 const people=[{c:p.cfg||ch,mine:!!p.mine}];if(p.cfg2){people.push({c:p.cfg2});set.xs=[-.45,.45];set.ry=.3;set.shot='med'}
 x.drawImage(igxRender(people,set,W,H),0,0);
 sc.fg(x,r,h%360,p);
 /* light grade: warm, cool or none, a soft vignette and a little grain */
 const t=h%4;x.save();if(t==1){x.globalAlpha=.08;igxF(x,'#ffa040',0,0,W,H)}else if(t==2){x.globalAlpha=.07;igxF(x,'#4080ff',0,0,W,H)}x.restore();
 for(let i=0;i<10;i++){const a='rgba(0,0,0,'+(.035*(10-i)/10)+')';igxF(x,a,0,i,W,1);igxF(x,a,0,H-1-i,W,1);igxF(x,a,i,0,1,H);igxF(x,a,W-1-i,0,1,H)}
 for(let i=0;i<120;i++)igxF(x,r()<.5?'#ffffff0d':'#0000000d',r()*W,r()*H,1,1);
 const o=document.createElement('canvas');o.width=W*2;o.height=H*2;const ox=o.getContext('2d');ox.imageSmoothingEnabled=false;ox.drawImage(k,0,0,W*2,H*2);return o.toDataURL()}
{const pp0=postPic;postPic=function(p){if(!IGX.on||!p||PICS[p.id])return pp0.apply(this,arguments);try{if(pxOf(p))return pp0.apply(this,arguments)}catch(e){}
 try{return PICS[p.id]=igxPhoto(p)}catch(e){console.warn('instagrime photo',e);IGX.on=0;return pp0.apply(this,arguments)}}}

/* ---------- head-and-shoulders profile pictures ---------- */
function igxPortrait(c,mine){const key=(mine?'me|':'')+JSON.stringify(c);if(IGX.PF[key])return IGX.PF[key];
 const W=48,H=48,k=document.createElement('canvas');k.width=W;k.height=H;const x=k.getContext('2d'),h=igxHash(key)%360;
 igxGrad(x,'hsl('+h+',55%,62%)','hsl('+((h+40)%360)+',50%,38%)',0,H,0,W);x.save();x.globalAlpha=.18;igxDisc(x,'#fff',W*.7,H*.3,10);x.restore();
 x.drawImage(igxRender([{c,mine}],{shot:'close',xs:[0],ry:-.22,lc:{amb:'#c4c4c4',key:'#e8e0d6',rim:'hsl('+((h+180)%360)+',80%,70%)'},pose:'none'},W,H),0,0);
 const o=document.createElement('canvas');o.width=W*2;o.height=H*2;const ox=o.getContext('2d');ox.imageSmoothingEnabled=false;ox.drawImage(k,0,0,W*2,H*2);
 const n=Object.keys(IGX.PF);if(n.length>300)delete IGX.PF[n[0]];return IGX.PF[key]=o.toDataURL()}
/* swap the 16x16 faces in the HTML that PA.ig / PA.msg build for the portrait of the same look */
function igxSwapFaces(html,list){if(typeof html!='string'||!IGX.on)return html;try{list.forEach(([u,c,mine])=>{if(u&&c&&html.indexOf(u)>=0)html=html.split(u).join(igxPortrait(c,mine))})}catch(e){console.warn('portraits',e)}return html}
{const ig0=PA.ig;PA.ig=function(){const h=ig0.apply(this,arguments),L=[];if(!S.pfpIg)L.push([pfp(ch),ch,1]);
 try{const seen=new Set,add=c=>{if(!c)return;const u=pf2(c);if(!seen.has(u)){seen.add(u);L.push([u,c])}};IGF.forEach(q=>add(q.cfg));if(igv=='prof'&&typeof findU=='function')add(findU(igu));if(igv=='post'&&igp&&!igp.mine)add(igp.cfg)}catch(e){}
 return igxSwapFaces(h,L)}}
{const pm=PA.msg;PA.msg=function(){igxTok();const h=pm.apply(this,arguments),L=[];try{const seen=new Set;(S.msgs||[]).forEach(m=>{if(m.a===undefined||!ART[m.a]||m.g)return;const c=ART[m.a][4];if(!c||typeof c!='object')return;const u=pf2(c);if(!seen.has(u)){seen.add(u);L.push([u,c])}})}catch(e){}return igxSwapFaces(h,L)}}

/* ---------- richer DMs ---------- */
/* what an artist of each genre notices and talks about */
const IGXGN={'Hip-Hop':['the 808s','the bounce on the drums','your flow switch in the second verse','the hi-hat rolls','that sample chop'],Rap:['the bars','your breath control','the punchlines','the double-time part','how hard the kick hits'],
 Pop:['the hook','the pre-chorus lift','the vocal stacks','how big the chorus opens up','the little ad-libs'],Rock:['the guitar tone','the drum fills','the bridge','how raw the vocal is','the distortion on the chorus'],
 'R&B':['the vocal runs','the chords','the smooth low end','the harmonies','the late-night feel'],'Lo-fi':['the vinyl crackle','the jazzy chords','the lazy swing on the drums','the tape wobble','how cosy the mix is'],
 Country:['the storytelling','the slide guitar','the twang in the vocal','the singalong chorus','the line about home'],Electronic:['the drop','the synth patch','the build-up','the sidechain pump','the sound design'],
 Latin:['the rhythm','the percussion','the reggaeton bounce','the horn line','the vibe on the chorus'],Indie:['the lyrics','the jangly guitars','the lo-fi texture','the weird little middle bit','the vocal tone'],
 Folk:['the fingerpicking','the lyrics','the harmonies','the quiet bits','how honest it sounds'],Gen:['the hook','the mix','the drums','the melody','the vibe']};
const IGXWIP=['Paper Moons','Night Shift','Neon Rain','Static Hearts','Low Tide','Glass House','Late Bus','Gold Teeth','Slow Motion','Wildfire','Concrete Bloom','After Hours','Daydream Avenue','Ghost Town','Afterglow','Velvet Sky'];
function igxCtx(m){const a=ART[m.a]||[],ss=S.songs||[],s=ss.slice(-1)[0],g=a[1]||'music',ig=(S.igPosts||[]).filter(p=>p.mine).slice(-1)[0],gl=IGXGN[g]||IGXGN.Gen,mg=s&&s.g?s.g:g,mgl=IGXGN[mg]||IGXGN.Gen,r=igxRng(igxHash((a[0]||'')+'|'+(m.id||0)));
 const hc=ch.hair&&!ch.hc_custom&&['black','dark brown','brown','golden','blonde','red','pink','blue','green','purple','silver','orange'][ch.hc]||'',top=ch.jk>=0?'jacket':(['tee','hoodie','jacket','striped top','tank top'][ch.top]||'fit');
 return{song:s?s.title:'your first track',streams:s?Math.round(s.streams||0).toLocaleString():'0',songs:ss.length,mg,g,gb:gl[Math.floor(r()*gl.length)],mgb:mgl[Math.floor(r()*mgl.length)],
  post:ig?String(ig.cap).split(' ').slice(0,7).join(' '):'',fol:(S.followers+(S.igF||0)).toLocaleString(),lis:Math.round(S.listeners||0).toLocaleString(),day:S.day||1,
  look:(hc?hc+' hair and the ':'the ')+top,wip:IGXWIP[igxHash(a[0]||'')%IGXWIP.length],me:S.artist||'you'}}
const igxFillTok=(t,c)=>t.replace(/\[\[(\w+)\]\]/g,(_,k)=>c[k]!=null&&c[k]!==''?c[k]:'that');
/* fill [[tokens]] in any new artist line, once, the first time it is seen */
function igxTok(){try{(S.msgs||[]).forEach(m=>{if(m.a===undefined||!Array.isArray(m.log))return;let c=null;m.log.forEach(e=>{if(e&&typeof e.t=='string'&&e.t.indexOf('[[')>=0){c=c||igxCtx(m);e.t=igxFillTok(e.t,c)}})})}catch(e){console.warn('dm tokens',e)}}
/* lines that need a released song, a post or some listeners join the pools only once there are some (igxSync runs before artists pick a line) */
const igxHas=t=>!(/\[\[(song|streams|mgb)\]\]/.test(t)&&!(S.songs||[]).length)&&!(/\[\[post\]\]/.test(t)&&!(S.igPosts||[]).some(p=>p.mine))&&!(/\[\[(lis|fol)\]\]/.test(t)&&(S.listeners||0)<500);
const IGXP=[];
function igxSync(){IGXP.forEach(([a,L])=>{if(!Array.isArray(a))return;for(let i=a.length-1;i>=0;i--)if(L.includes(a[i]))a.splice(i,1);L.forEach(t=>{if(igxHas(t))a.push(t)})})}
/* new career openers: no song yet, so they talk about your page, your look and their own work */
FDM.w=['saw your page go up today. new artists are my favourite thing to find. i am halfway through a [[g]] demo called "[[wip]]" and it needs a second voice. wanna make something?',
 'heard there is a new name in town and the [[look]] in your profile pic is already a whole vibe. we should cook something up',
 'just found your profile. i had the beat for "[[wip]]" open when your page popped up, felt like a sign. it has a gap with your name on it',
 'welcome! i still remember my own day one, nobody listened for weeks. i have a [[g]] idea that needs a fresh voice, you down?'];
FDM.f=['welcome to the scene! no pressure, just saying hi. first tip from me: post on instagrime every day, it really adds up',
 'hey new neighbour in the music world. good luck with the first track, i will be listening when it drops',
 'saw your page pop up. hope the first week treats you well. if you ever want notes on a demo, send it over',
 'yo, love the [[look]] in your picture. good luck out there, the first song is always the scariest one to upload'];
/* the intro an artist sends when they first write: about your actual music */
IGXP.push([BASE.intro,['been playing "[[song]]" on repeat. [[mgb]] especially, that is not easy to get right. [[streams]] streams already, deserved.',
 'your last post ("[[post]]") showed up on my feed and i ended up listening to your whole page. "[[song]]" is my pick.',
 '[[lis]] monthly listeners and [[fol]] followers by day [[day]]? you are moving fast. "[[song]]" is a proper tune.',
 'my producer sent me "[[song]]" and asked who you were. i liked [[mgb]] a lot. i am working on a [[g]] record called "[[wip]]" right now.']]);
const IGXA=['been thinking, your sound and my [[g]] stuff would mix well. want to do a track together? i care a lot about [[gb]], so we would get that right',
 'random question: want to do a [[g]] collab? i have "[[wip]]" half written and the second verse is yours if you want it',
 'would you be into a [[g]] track together? i hear you on [[gb]] and i think it would sound huge',
 'so here is the thing: "[[song]]" is exactly the energy "[[wip]]" needs. one session, you and me, [[g]]. you in?'];
IGXP.push([RB.ask,IGXA],[BASE.ask,IGXA]);
IGXP.push([RB.music,['"[[song]]" has been stuck in my head all week, mostly [[mgb]]. how did you make it?','been deep in [[g]] lately, mostly working on [[gb]] for "[[wip]]". what are you working on next?',
 'your writing hits different. do you start with the beat or the lyrics? i always start with [[gb]] and build from there','honestly i spend forever on [[gb]] lol. do you mix your own stuff or have someone?',
 '[[streams]] streams on "[[song]]" is no joke. are you planning an album or just singles for now?']]);
if(typeof CI!='undefined'&&Array.isArray(CI))IGXP.push([CI,['saw your post ("[[post]]"), made me laugh. hows the week going?','finished a rough mix of "[[wip]]" today. still not happy with [[gb]] lol. what are you working on?',
 '"[[song]]" came on in a cafe today, that is wild. you should be proud','day [[day]] for you, right? you are already ahead of where i was. keep posting','been working on [[gb]] all day and my ears are done. send me something new to listen to']]);
igxSync();
/* sync the pools before artists write, and fill the tokens after */
{const f0=newConv;newConv=function(){igxSync();const r=f0.apply(this,arguments);igxTok();return r}}
{const f0=firstDMs;firstDMs=function(){igxSync();const r=f0.apply(this,arguments);igxTok();return r}}
{const f0=reply;reply=function(){igxSync();const r=f0.apply(this,arguments);igxTok();return r}}
{const f0=startChat;startChat=function(){igxSync();const r=f0.apply(this,arguments);igxTok();return r}}
{const w0=wakeUp;wakeUp=function(){igxSync();const r=w0.apply(this,arguments);igxTok();return r}}
{const p0=pcR;pcR=function(){igxTok();return p0.apply(this,arguments)}}
