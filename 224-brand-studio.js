/* ===== v51.0.0: brand photoshoots and being recognised abroad =====
   Part 2 of brand sponsorships (223-brand-deals.js). Needs the Instagrime photo renderer in 178-instagrime-photos.js.
   - BRD.facade: a pixel picture of a brand HQ (day or night skyline, the brand's logo on a roof billboard), used as the Label HQ
     banner and in the company-car prompt. The real, walkable HQ buildings and studios are in 225-brand-hq.js. BRD.photo: the
     pixel set of a shot (backdrop wall with the brand's logo, softboxes, floor).
   - Photoshoot (BRD.begin, started by the camera in the HQ studio): you stand in the set as your own 3D character. The brief asks
     for a mood (pose) and a lighting style; pick pose, light and backdrop, then Shoot up to 4 frames. A frame scores 35 + 30 for
     the right mood + 25 for the right light + 10 for the brand backdrop + 0-5. The average of your best two frames sets the pay
     (75% to 125% of the fee) and the followers. The best frame is posted on Instagrime ("Paid partnership with ..."), saved as
     {brand, bs:[mood,light,bg,seed]} and drawn again from that on every load. The shoot costs 12 energy and the brand books a
     free flight home.
   - Fame abroad: walking past people in a world-tour city, they react by your Fame Level (nothing under 15; unsure looks, then
     "are you ...?", then fans who know your songs, then screaming crowds), in the city's own greeting. A fan may take a photo with
     you for a few followers (3 a day per game day). */
(function(){
const BRD=window.BRD;if(!BRD)return;
const fm=n=>'$'+Math.round(n).toLocaleString('en-US');
const fl=()=>{try{return fameLevel()||0}catch(e){return 0}};
const T=()=>window.TRAVEL;
const MOODS=BRD.mood,LIGHTS=BRD.light,BGS=['Brand wall','City window','White cyc'];
const MOODSET=[{pose:'hip',ry:-.1,shot:'med'},{pose:'peace',ry:-.15,shot:'med'},{pose:'wave',ry:.45,shot:'med'},{pose:'cross',ry:-.3,shot:'med'},{pose:'hero',ry:-.05,shot:'full'}];
const LT=[{lc:{amb:'#ffe2bd',key:'#ffd9a0',rim:'#ffb070'},g:'#ff9a3c',a:.11},{lc:{amb:'#cfe4ff',key:'#e6f1ff',rim:'#7ab8ff'},g:'#3c80ff',a:.1},{lc:{amb:'#d8c4ff',key:'#ff9de6',rim:'#4ff0ff'},g:'#b04cff',a:.1},{lc:{amb:'#dcdcdc',key:'#ffffff',rim:'#999999'},g:'#000',a:1,mono:1}];

/* ---------- extra poses for the 3D character ---------- */
const MYP={
 hip:(o,c,hd)=>{igxAim(o.arms[0],[-.72,-.6,-.12]);igxAim(o.arms[1],[.72,-.6,-.12]);if(hd){hd.rotation.x=-.07;hd.rotation.y=.06}},
 cross:(o,c,hd)=>{igxAim(o.arms[0],[.5,-.5,.85]);igxAim(o.arms[1],[-.5,-.45,.9]);if(hd){hd.rotation.y=-.12;hd.rotation.z=.05}},
 hero:(o,c,hd)=>{igxAim(o.arms[1],[.45,.95,.2]);igxAim(o.arms[0],[-.65,-.7,0]);if(hd){hd.rotation.x=-.14;hd.rotation.z=-.06}}};
{const ip0=igxPose;igxPose=function(o,pose,c,side){const f=MYP[pose];if(f&&o&&o.arms){f(o,c,igxHead(o.g));return}return ip0.apply(this,arguments)}}

/* ---------- the studio set (a 160x120 pixel photo) ---------- */
const mixc=(a,b,t)=>igxMix(a,b,t);
function bgBrand(x,su,r,b){const c=b.c==b.bg||/^#f/i.test(b.c)?'#3a3a48':b.c,hi=mixc(c,'#ffffff',.18),lo=mixc(c,'#000000',.5);
 igxGrad(x,hi,lo,0,88);igxGrad(x,mixc(c,'#000',.55),'#0e0e12',88,120);
 for(let i=0;i<7;i++)igxF(x,'#ffffff0d',i*26,0,10,88);
 /* curved cyc edge */
 for(let i=0;i<5;i++)igxF(x,'rgba(255,255,255,'+(.05-i*.009)+')',0,84+i,160,1);
 /* the brand logo on the wall, with a soft frame */
 igxF(x,'#0006',9,13,38,38);igxF(x,'#ffffffd0',10,12,38,38);BRD.paint(x,b.id,12,14,34);
 igxTxt(x,igxClip(b.n,10),10,54,'#ffffffcc',1);
 /* floor: reflection and gaffer tape */
 igxF(x,'#ffffff10',0,90,160,1);igxF(x,'#ffd84a',58,100,44,1);igxF(x,'#ffd84a',58,110,44,1);igxF(x,'#ffd84a',58,100,1,11);igxF(x,'#ffd84a',101,100,1,11)}
function bgCity(x,su,r,b){igxGrad(x,'#0a1030','#4a2f78',0,64);for(let i=0;i<26;i++)igxF(x,'#ffffff'+(r()<.5?'aa':'55'),r()*160,r()*34,1,1);
 let cx=0;while(cx<160){const w=10+Math.floor(r()*14),h=14+Math.floor(r()*38);igxF(x,'#15182e',cx,64-h,w,h);for(let yy=64-h+3;yy<62;yy+=4)for(let xx=cx+2;xx<cx+w-2;xx+=4)if(r()<.45)igxF(x,r()<.8?'#ffd98a':'#9ad0ff',xx,yy,2,2);cx+=w}
 igxF(x,'#2b2f45',0,64,160,24);igxF(x,'#1a1d2e',0,88,160,32);
 /* window frame */
 igxF(x,'#101218',0,0,160,4);igxF(x,'#101218',0,0,5,92);igxF(x,'#101218',155,0,5,92);igxF(x,'#101218',78,0,4,92);igxF(x,'#101218',0,62,160,3);
 for(let i=0;i<16;i++)igxF(x,i%2?'#3a2a1e':'#4a3626',i*10,92,10,28);igxF(x,'#ffffff12',0,92,160,2)}
function bgWhite(x,su,r,b){igxGrad(x,'#f4f4f1','#d6d6d8',0,92);igxGrad(x,'#d2d2d6','#a8a8b0',92,120);igxF(x,'#0000000e',20,88,120,6);igxF(x,'#0000000a',30,94,100,10);
 BRD.paint(x,b.id,134,8,18);igxF(x,'#0003',134,26,18,1)}
const BG=[bgBrand,bgCity,bgWhite];
function softbox(x,X,lit){igxF(x,'#202228',X+9,60,2,50);igxF(x,'#202228',X+4,108,12,2);igxF(x,'#2c2f38',X,30,20,28);igxF(x,lit,X+2,32,16,24);igxF(x,'#ffffff80',X+4,34,6,20);igxF(x,'#00000030',X+2,52,16,4)}
function fgSet(x,su,r,b,L){
 softbox(x,-4,L.lc.rim);softbox(x,144,L.lc.key);
 /* floor cable and a camera tripod at the front */
 igxF(x,'#0c0c10',20,116,40,1);igxF(x,'#0c0c10',60,114,2,3);
 /* light spill and a small flare */
 x.save();x.globalAlpha=.16;igxDisc(x,L.lc.key,150,34,9);x.globalAlpha=.1;igxDisc(x,L.lc.rim,6,34,8);x.restore();
 /* partnership tag */
 igxF(x,'#000a',130,101,27,15);BRD.paint(x,b.id,132,102,13);igxTxt(x,'AD',147,106,'#fff',1)}
function grade(x,su,L,W,H,h,r){
 if(L.mono){x.save();x.globalCompositeOperation='saturation';x.fillStyle='#000';x.fillRect(0,0,W,H);x.restore();x.save();x.globalAlpha=.06;igxF(x,'#fff',0,0,W,H);x.restore()}
 else{x.save();x.globalAlpha=L.a;igxF(x,L.g,0,0,W,H);x.restore()}
 if(su.l==2){x.save();x.globalAlpha=.1;igxF(x,'#ff4fd8',0,0,W/2,H);igxF(x,'#4ff0ff',W/2,0,W/2,H);x.restore()}
 for(let i=0;i<10;i++){const a='rgba(0,0,0,'+(.04*(10-i)/10)+')';igxF(x,a,0,i,W,1);igxF(x,a,0,H-1-i,W,1);igxF(x,a,i,0,1,H);igxF(x,a,W-1-i,0,1,H)}
 for(let i=0;i<110;i++)igxF(x,r()<.5?'#ffffff0d':'#0000000d',r()*W,r()*H,1,1)}
/* su = {b: brand id, m: mood, l: light, bg: backdrop, seed, cfg} -> data URL (320x240) */
BRD.photo=function(su){const W=160,H=120,b=BRD.by(su.b),L=LT[su.l%4],seed=(su.seed|0)||7,r=igxRng(seed),M=MOODSET[su.m%5],k=document.createElement('canvas');k.width=W;k.height=H;
 const x=k.getContext('2d');x.imageSmoothingEnabled=false;BG[su.bg%3](x,su,r,b);
 const c=su.cfg||ch;x.drawImage(igxRender([{c,mine:true}],{shot:M.shot,xs:[0],ry:M.ry,lc:L.lc,pose:M.pose},W,H),0,0);
 fgSet(x,su,r,b,L);grade(x,su,L,W,H,seed,r);
 const o=document.createElement('canvas');o.width=W*2;o.height=H*2;const ox=o.getContext('2d');ox.imageSmoothingEnabled=false;ox.drawImage(k,0,0,W*2,H*2);return o.toDataURL()};

/* ---------- a brand HQ as a picture (pixel facade, 320x168) ---------- */
const FC={};
BRD.facade=function(bid,place){const night=(+S.t||0)>=260,key=(bid||'x')+'|'+night+'|'+(place||'');if(FC[key])return FC[key];
 const W=320,H=168,k=document.createElement('canvas');k.width=W;k.height=H;const x=k.getContext('2d'),r=igxRng(41),b=bid?BRD.by(bid):null;
 const F=(c,a,y,w,h)=>igxF(x,c,a,y,w,h);
 /* sky and skyline */
 if(night){igxGrad(x,'#080c2a','#40286e',0,118,0,W);for(let i=0;i<60;i++)F(r()<.5?'#fff':'#ffffff80',r()*W,r()*60,1,1);igxDisc(x,'#f4efd8',34,22,6);igxDisc(x,'#08102a',37,20,5)}
 else{igxGrad(x,'#7ab8f5','#e4f2ff',0,118,0,W);igxDisc(x,'#fff6c8',280,22,8);[[30,12,26],[120,8,18],[230,16,22]].forEach(q=>{F('#ffffffd0',q[0],q[1],q[2],4);F('#ffffffd0',q[0]+4,q[1]-3,q[2]-8,4)})}
 for(let pass=0;pass<2;pass++){let cx=pass?-6:-14;while(cx<W){const w=14+Math.floor(r()*20),h=(pass?30:46)+Math.floor(r()*(pass?24:40));
  F(night?(pass?'#171b36':'#10132a'):(pass?'#aab6cc':'#8f9bb4'),cx,118-h,w,h);
  for(let yy=118-h+4;yy<114;yy+=5)for(let xx=cx+3;xx<cx+w-3;xx+=5)if(r()<(night?.5:.25))F(night?(r()<.8?'#ffd98a':'#9ad0ff'):'#dff1ff',xx,yy,2,2);cx+=w+Math.floor(r()*3)}}
 /* street */
 F(night?'#242634':'#9a9ea8',0,118,W,10);F(night?'#2d3042':'#b4b8c2',0,118,W,2);F(night?'#15161e':'#4a4d58',0,128,W,40);for(let i=0;i<9;i++)F('#e8d36a',i*38+8,150,22,2);F(night?'#0c0d12':'#3a3c46',0,126,W,2);
 /* the building */
 const BX=62,BW=196,BY=26,BH=92,body=night?'#2a2f42':'#c9ced8',dk=night?'#1c2030':'#a9afbc',lt=night?'#3a4058':'#dde1e8';
 F(dk,BX-3,BY-4,BW+6,6);F(body,BX,BY,BW,BH);F(lt,BX,BY,BW,2);F(dk,BX,BY+BH-4,BW,4);for(let i=0;i<BW;i+=14)F('#00000014',BX+i,BY+2,1,BH-6);
 /* sign band */
 F('#0d0f18',BX+22,BY+6,BW-44,18);F(night?'#e9c24a':'#3a3a48',BX+23,BY+7,BW-46,1);F(night?'#e9c24a':'#3a3a48',BX+23,BY+22,BW-46,1);
 const tx=b?igxClip(b.n.toUpperCase()+' HQ',22):'LABEL HQ',sc=igxTW(tx,2)<=BW-50?2:1,tw=igxTW(tx,sc),ty=sc==2?9:12;igxTxt(x,tx,BX+Math.round((BW-tw)/2)+1,BY+ty+1,'#000',sc);igxTxt(x,tx,BX+Math.round((BW-tw)/2),BY+ty,night?'#ffe58a':'#fff',sc);
 /* window rows */
 for(let row=0;row<2;row++)for(let i=0;i<8;i++){const wx=BX+8+i*23,wy=BY+30+row*22,lit=night||r()<.5;F('#10121a',wx-1,wy-1,20,19);F(lit?(night?'#ffd98a':'#bfe3ff'):'#7a8fae',wx,wy,18,17);
  if(night&&r()<.55){F('#00000040',wx+4+Math.floor(r()*8),wy+6,3,11);F('#00000040',wx+3+Math.floor(r()*8),wy+4,5,3)}if(night){F('#ffffff30',wx,wy,18,2)}F('#ffffff30',wx+8,wy,1,17);F('#ffffff22',wx,wy+8,18,1)}
 /* ground floor: glass front, doors, canopy, light boxes, shutter */
 F('#10121a',BX+6,BY+75,BW-12,17);F(night?'#2a3a58':'#8fb4d8',BX+8,BY+77,BW-16,15);F(night?'#ffd98a40':'#ffffff40',BX+8,BY+77,BW-16,15);
 [0,1].forEach(i=>{const dx=BX+BW/2-12+i*12;F('#07080c',dx,BY+77,11,15);F(night?'#ffe9a8':'#cfe6f8',dx+1,BY+78,9,14);F('#c8c8cf',dx+9,BY+84,1,3)});
 F(b?b.c:'#d4202c',BX+BW/2-26,BY+70,52,5);F('#00000030',BX+BW/2-26,BY+75,52,2);for(let i=0;i<52;i+=6)F('#ffffff30',BX+BW/2-26+i,BY+70,3,5);
 [BX+14,BX+BW-52].forEach((lx,i)=>{F('#0d0f18',lx-1,BY+79,38,13);F(i?'#3a3f4e':'#ffe9a8',lx,BY+80,36,11);if(!i){for(let q=0;q<4;q++)F(q%2?'#e9c24a':'#d4202c',lx+3+q*8,BY+82,6,7)}else{for(let q=0;q<6;q++)F('#ffffff22',lx+q*6,BY+80,1,11)}});
 /* brand billboard on the roof */
 if(b){const px=BX+BW-50,py=BY-36;F('#14161e',px+6,py+30,3,10);F('#14161e',px+31,py+30,3,10);F('#14161e',px,py,40,31);F(night?'#fff4c8':'#f2f2f2',px+2,py+2,36,27);BRD.paint(x,b.id,px+7,py+3,26);
  if(night){x.save();x.globalAlpha=.16;igxDisc(x,'#ffe9a8',px+20,py+15,30);x.restore()}[0,1,2].forEach(i=>F(night?'#ffe58a':'#888',px+6+i*11,py-2,5,2))}
 /* red carpet, ropes, planters */
 x.fillStyle='#b5172a';x.beginPath();x.moveTo(BX+BW/2-9,118);x.lineTo(BX+BW/2+9,118);x.lineTo(BX+BW/2+22,142);x.lineTo(BX+BW/2-22,142);x.closePath();x.fill();
 x.fillStyle='#e9c24a';[[-12,121],[12,121],[-19,136],[19,136]].forEach(q=>{x.fillRect(BX+BW/2+q[0]-1,q[1]-5,2,6);x.fillRect(BX+BW/2+q[0]-2,q[1]+1,4,1)});F('#8a1020',BX+BW/2-12,118,1,18);F('#8a1020',BX+BW/2+12,118,1,18);
 [BX+2,BX+BW-12].forEach(px=>{F('#4a3626',px,111,10,7);igxDisc(x,'#2e8b57',px+5,107,5);igxDisc(x,'#3fa66a',px+3,105,3)});
 /* street lamps and beams at night */
 [30,292].forEach(lx=>{F('#2a2d3a',lx,84,2,34);F('#2a2d3a',lx-4,84,10,2);F(night?'#ffe9a8':'#c8ccd6',lx-5,83,4,2);if(night){x.save();x.globalAlpha=.14;igxDisc(x,'#ffe9a8',lx-3,86,13);x.restore()}});
 if(night){x.save();x.globalAlpha=.1;x.fillStyle='#fff6c8';[BX+30,BX+BW-30].forEach(sx=>{x.beginPath();x.moveTo(sx,118);x.lineTo(sx-14,10);x.lineTo(sx+14,10);x.closePath();x.fill()});x.restore()}
 /* car: a black limo with the brand colour pinstripe */
 F('#0a0a0e',226,146,78,14);F('#14141c',232,138,56,9);F(night?'#6a7aa0':'#9ab8d8',236,140,22,6);F(night?'#6a7aa0':'#9ab8d8',262,140,22,6);F(b?b.c:'#d4202c',226,152,78,1);
 [236,288].forEach(wx=>{igxDisc(x,'#05050a',wx,160,5);igxDisc(x,'#9a9ca8',wx,160,2)});F('#ffe9a8',302,148,3,3);F('#ff3a3a',224,148,2,3);
 if(night){x.save();x.globalAlpha=.18;x.fillStyle='#fff6c8';x.beginPath();x.moveTo(305,150);x.lineTo(320,142);x.lineTo(320,162);x.closePath();x.fill();x.restore()}
 /* caption plate */
 F('#000a',4,148,igxTW(igxClip(place||'Fernfield',22),1)+10,13);igxTxt(x,igxClip(place||'Fernfield',22),9,152,'#fff',1);
 for(let i=0;i<8;i++){const a='rgba(0,0,0,'+(.18*(8-i)/8)+')';F(a,0,i,W,1);F(a,0,H-1-i,W,1);F(a,i,0,1,H);F(a,W-1-i,0,1,H)}
 const u=k.toDataURL();const n=Object.keys(FC);if(n.length>12)delete FC[n[0]];return FC[key]=u};

/* ---------- the shoot ---------- */
let SH=null;BRD.shootOn=0;
const css=document.createElement('style');css.textContent=`.bsx{max-width:700px;width:min(94vw,700px);max-height:94vh;overflow:auto}.bsx h2{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.bsx h2 img{width:30px;height:30px;border-radius:50%;border:2px solid #000}.bsx h2 small{font:12px ui-monospace,monospace;color:var(--m)}
.bsx .bsfac,.bsx .bspv{width:100%;display:block;image-rendering:pixelated;border:3px solid #000;border-radius:4px;box-shadow:0 4px 0 #0008;background:#000}.bsx .bspw{position:relative}.bsx .bsfl{position:absolute;inset:3px;background:#fff;opacity:0;pointer-events:none}.bsx .bsfl.on{animation:bsflash .45s ease-out}@keyframes bsflash{0%{opacity:.95}100%{opacity:0}}
.bsx .bsg{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px;margin:8px 0}@media(max-width:640px){.bsx .bsg{grid-template-columns:1fr}}
.bsx .bsth{display:flex;gap:6px;margin-top:8px;min-height:62px}.bsx .bsth div{flex:1;min-width:0;border:2px solid #000;border-radius:4px;cursor:pointer;position:relative;background:#101412;overflow:hidden}.bsx .bsth div.on{box-shadow:0 0 0 2px var(--g)}.bsx .bsth div.e{opacity:.35;cursor:default;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--m)}
.bsx .bsth img{width:100%;display:block;image-rendering:pixelated}.bsx .bsth b{position:absolute;left:3px;bottom:2px;font-size:11px;color:#ffd84a;text-shadow:1px 1px #000}
.bsx .bsb{background:#151a17;border-radius:6px;padding:8px 10px;margin-bottom:8px}.bsx .bsb b{color:#e6b422}.bsx .bsl{font-size:11px;color:var(--m);margin:8px 0 4px;text-transform:uppercase;letter-spacing:.5px}
.bsx .bsc{display:flex;flex-wrap:wrap;gap:5px}.bsx .bsc button{padding:5px 9px}.bsx .bsc button.on{background:var(--g);color:#04120a;font-weight:700}.bsx .bsn{min-height:34px;font-size:12px;color:var(--m);margin-top:8px}
.bsx .bsr{display:flex;gap:10px;align-items:center;justify-content:space-between;background:#151a17;border-radius:6px;padding:8px 12px;margin:6px 0}.bsx .bsr b{color:var(--g);font-size:16px}
.bsx .bsig{background:#0d100e;border:2px solid #000;border-radius:6px;overflow:hidden;max-width:340px;margin:0 auto}.bsx .bsig .bshd{display:flex;gap:8px;align-items:center;padding:7px 10px}.bsx .bsig .bshd img{width:30px;height:30px;border-radius:50%;image-rendering:pixelated}.bsx .bsig .bshd small{display:block;color:var(--m);font-size:11px}.bsx .bsig .bspic{width:100%;display:block;image-rendering:pixelated}.bsx .bsig .bsft{padding:7px 10px;font-size:12px}
.bsfade{position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .4s;z-index:9990}`;document.head.appendChild(css);
const $e=id=>document.getElementById(id);
const modal=h=>{mode='menu';$('ui').innerHTML=h};
function fade(mid){let f=$e('bsfade');if(!f){f=document.createElement('div');f.id='bsfade';f.className='bsfade';document.body.appendChild(f)}f.style.opacity=1;setTimeout(()=>{try{mid()}catch(e){console.error(e)}setTimeout(()=>{f.style.opacity=0},220)},430)}
{const c0=closeUI;closeUI=function(){BRD.shootOn=0;SH=null;return c0.apply(this,arguments)}}
/* start the photoshoot: called by the camera inside the HQ studio (225-brand-hq.js) */
BRD.begin=function(o){if(!o||o.st!=1)return;BRD.shootOn=1;SH={o,step:1,m:0,l:0,bg:0,shots:[],sel:0,seed:(Math.random()*1e6)|0};snd('chime');set()};
const note=(m,l,o)=>{const g=m==o.brief.mood,h=l==o.brief.light;return g&&h?'That is exactly the brief. Great frame.':g?'Pose is right, but the lighting is off-brief.':h?'Lighting is right, but the pose is off-brief.':'Neither pose nor lighting matches the brief.'};
function su(){return{b:SH.o.b,m:SH.m,l:SH.l,bg:SH.bg,seed:SH.seed,cfg:ch}}
function set(){const o=SH.o,b=BRD.by(o.b),n=SH.shots.length;
 modal(`<div class="box modal bsx"><h2><img src="${BRD.logo(o.b,64)}">${esc(b.n)} · HQ studio <small id=bsct>Frame ${Math.min(4,n+1)} of 4</small></h2>
 <div class=bsg><div><div class=bspw><img class=bspv id=bspv alt=""><div class=bsfl id=bsfl></div></div><div class=bsth id=bsth></div></div>
 <div><div class=bsb>Brief: <b>${o.brief.mood}</b> mood, <b>${o.brief.light}</b> lighting. ${esc(b.n)} likes its logo in frame.</div>
 <div class=bsl>Mood</div><div class=bsc id=bsm>${MOODS.map((q,i)=>`<button data-i=${i} class="${i==SH.m?'on':''}" onclick="bsPick('m',${i})">${q}</button>`).join('')}</div>
 <div class=bsl>Lighting</div><div class=bsc id=bsl>${LIGHTS.map((q,i)=>`<button data-i=${i} class="${i==SH.l?'on':''}" onclick="bsPick('l',${i})">${q}</button>`).join('')}</div>
 <div class=bsl>Backdrop</div><div class=bsc id=bsbg>${BGS.map((q,i)=>`<button data-i=${i} class="${i==SH.bg?'on':''}" onclick="bsPick('bg',${i})">${q}</button>`).join('')}</div>
 <div class=bsn id=bsn>Match the brief, then press Shoot. You can take up to 4 frames.</div></div></div>
 <div class=row2><button class=go id=bsgo onclick="bsShoot()">Shoot</button><button id=bswr onclick="bsWrap()" ${n?'':'disabled'}>Wrap and post</button><button onclick="closeUI()">Leave</button></div></div>`);prev();thumbs()}
function prev(){try{const p=$e('bspv');if(p&&SH)p.src=BRD.photo(su())}catch(e){console.error('studio preview',e)}}
function thumbs(){const t=$e('bsth');if(!t||!SH)return;let h='';for(let i=0;i<4;i++){const s=SH.shots[i];h+=s?`<div class="${i==SH.sel?'on':''}" onclick="bsSel(${i})"><img src="${s.u}"><b>${'★'.repeat(Math.max(1,Math.round(s.sc/20)))}</b></div>`:`<div class=e>${i+1}</div>`}t.innerHTML=h;
 const g=$e('bsgo'),w=$e('bswr'),c=$e('bsct');if(g)g.disabled=SH.shots.length>=4;if(w)w.disabled=!SH.shots.length;if(c)c.textContent=SH.shots.length>=4?'All 4 frames taken':'Frame '+(SH.shots.length+1)+' of 4'}
window.bsPick=function(k,i){if(!SH)return;SH[k]=i;const id={m:'bsm',l:'bsl',bg:'bsbg'}[k],g=$e(id);if(g)g.querySelectorAll('button').forEach(q=>q.classList.toggle('on',+q.dataset.i==i));try{snd('pop')}catch(e){}prev()};
window.bsSel=function(i){if(!SH||!SH.shots[i])return;SH.sel=i;const s=SH.shots[i],p=$e('bspv');if(p)p.src=s.u;const n=$e('bsn');if(n)n.textContent='Frame '+(i+1)+': '+s.msg;thumbs()};
window.bsShoot=function(){if(!SH||SH.shots.length>=4)return;const o=SH.o,sc=Math.min(100,35+(SH.m==MOODS.indexOf(o.brief.mood)?30:0)+(SH.l==LIGHTS.indexOf(o.brief.light)?25:0)+(SH.bg==0?10:0)+Math.floor(Math.random()*6)),
 msg=note(MOODS[SH.m],LIGHTS[SH.l],o)+(SH.bg==0?' The logo is in frame.':' The logo is missing from the frame.'),f=$e('bsfl');
 SH.seed=((SH.seed*1103515245+12345)>>>0)%1000003;let u;try{u=BRD.photo(su())}catch(e){console.error('studio shot',e);return say('The camera jammed. Try again.')}
 SH.shots.push({m:SH.m,l:SH.l,bg:SH.bg,seed:SH.seed,sc,u,msg});SH.sel=SH.shots.length-1;try{snd('pop')}catch(e){}if(f){f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
 const p=$e('bspv');if(p)p.src=u;const n=$e('bsn');if(n)n.textContent='Frame '+SH.shots.length+': '+msg+' ('+sc+'/100)';thumbs()};

/* wrap: pay, followers, the Instagrime post, flight home */
window.bsWrap=function(){if(!SH||!SH.shots.length)return;const o=SH.o,b=BRD.by(o.b),s=SH.shots,best=s.slice().sort((a,c)=>c.sc-a.sc),pick=s[SH.sel]||best[0],
 q=((best[0].sc+(best[1]?best[1].sc:best[0].sc))/2)/100,pay=Math.round(o.pay*(.75+.5*q)/100)*100,fol=FOLN(Math.round((60+(S.followers||0)*.01)*(.6+q)*(1+b.t*.5))),
 fans=(S.followers||0)+(S.igF||0),likes=Math.round(fans*(.12+q*.25))+20+Math.floor(Math.random()*30);
 S.money=+(S.money+pay).toFixed(2);S.earn=(S.earn||0)+pay;S.followers=(S.followers||0)+fol;S.energy=Math.max(0,(S.energy||0)-12);
 const cap='Paid partnership with '+b.n+'. '+['Campaign day at the '+b.n+' HQ.','New campaign, new look.','Lights, camera, '+b.n+'.','Thank you '+b.n+' for having me.'][Math.floor(Math.random()*4)]+' '+BRD.place(o);
 const p={id:S.nid++,mine:1,u:S.artist,cfg:Object.assign({},ch),cap,day:S.day,l:likes,brand:o.b,bs:[pick.m,pick.l,pick.bg,pick.seed]};
 try{S.igPosts=S.igPosts||[];S.igPosts.push(p);if(S.lastPost!=S.day){S.lastPost=S.day;if(typeof igbOn=='function'&&igbOn())igbNow()}}catch(e){console.error('brand post',e)}
 PICS[p.id]=pick.u;o.st=3;o.res={pay,q:Math.round(q*100),post:p.id,day:S.day};const bd=BRD.st();bd.done++;bd.earned+=pay;
 let back='';if(o.k=='trip'&&T()){try{const f=T().upcoming(o.d,80).find(x=>x.to=='home'&&x.dep>=T().now()+120);if(f){const tk=Object.assign({},{id:'T'+(T().st().nid++),fl:f.fl,from:f.from,to:'home',dep:f.dep,arr:f.arr,hrs:f.hrs,gate:f.gate,seat:(3+Math.floor(Math.random()*18))+'ABCDEF'[Math.floor(Math.random()*6)],price:0,st:'booked',bd:S.day,ck:1,bt:0,co:o.b});T().st().tickets.push(tk);back=tk.fl+' home, Gate '+tk.gate+', boarding '+T().hm(tk.dep-120)+', gate closes '+T().hm(tk.dep-10)+' ('+BRD.dayWord(f)+')';try{glCard('FLIGHT HOME · '+tk.fl,T().code(tk.from)+' ✈ '+T().code(tk.to),'Paid by '+b.n+' · Gate '+tk.gate+' · closes '+T().hm(tk.dep-10))}catch(e){}}}catch(e){console.error('return flight',e)}}
 S.msgs.push({id:S.nid++,from:b.n+' Partnerships',state:9,unread:1,day:S.day,bd:o.id,body:'The campaign photos look great. Your fee of '+fm(pay)+' has been paid and the shot is on your Instagrime. '+(back?'Your flight home is booked and checked in: '+back+'.':'Thank you, we would love to work with you again.')});
 try{snd('cash');updateVersion()}catch(e){}
 const av=(typeof igxPortrait=='function'?igxPortrait(ch,1):pfp(ch));
 SH=null;BRD.shootOn=0;
 modal(`<div class="box modal bsx" style="max-width:560px"><h2><img src="${BRD.logo(o.b,64)}">${esc(b.n)} shoot wrapped <small>quality ${Math.round(q*100)}/100</small></h2>
 <div class=bsig><div class=bshd><img src="${av}"><div><b>${esc(S.artist||'you')}</b><small>Paid partnership with ${esc(b.n)}</small></div></div><img class=bspic src="${pick.u}"><div class=bsft><b>${likes.toLocaleString()} likes</b><br>${esc(cap)}</div></div>
 <div class=bsr><span>Fee (${fm(o.pay)} base)</span><b>+${fm(pay)}</b></div><div class=bsr><span>New followers</span><b>+${fol.toLocaleString()}</b></div>${back?`<div class=bsr><span>Flight home (${esc(b.n)} pays)</span><b style="font-size:12px">${esc(back)}</b></div>`:''}
 <p class=m>Posted on Instagrime. You are a little tired from the day (-12 energy).</p><div class=row2><button class=go onclick="closeUI()">Done</button></div></div>`);
 try{say('Posted: Paid partnership with '+b.n+'. +'+fm(pay))}catch(e){}};

/* the Instagrime photo of a brand post is drawn from its shoot setup (the cache is not saved) */
{const pp0=postPic;postPic=function(p){try{if(p&&p.brand&&Array.isArray(p.bs)){if(PICS[p.id])return PICS[p.id];return PICS[p.id]=BRD.photo({b:p.brand,m:p.bs[0],l:p.bs[1],bg:p.bs[2],seed:p.bs[3],cfg:p.cfg})}}catch(e){console.warn('brand photo',e)}return pp0.apply(this,arguments)}}

/* ---------- fame abroad: people recognise you ---------- */
const TXT=[[250,4,'Crowds of fans spot you!'],[150,3,'People point and whisper: it is {A}!'],[60,2,'Some locals recognise you.'],[15,1,'A few people glance at you.']];
const LINES=[null,
 ['Hm, are you a musician?','I think I have seen you online...','You look like a singer.','Is that someone famous?'],
 ['Wait, are you {A}?','{A}? I know your songs!','My cousin plays your music all day.','Can I get a photo, {A}?'],
 ['It is {A}! Here in {C}!','{H}! I love "{S}"!','Everyone knows you here. {H}!','{A}, sign my phone case?'],
 ['{A}!!! I cannot believe it!','Put me in your next video, {A}!','{H}! We play "{S}" every day!','I flew in for you, {A}!','That is {A}! Quick, film this!']];
const CD=[0,20000,11000,7000,4500];
function tier(){const L=fl();return L>=250?4:L>=150?3:L>=60?2:L>=15?1:0}
BRD.tier=tier;
function fill(t,C){const song=((S.songs||[]).slice().sort((a,b)=>(b.streams||0)-(a.streams||0))[0]||{}).title||'your new single',hi=(window.DCITY&&DCITY.words?DCITY.words(C.s&&C.s.lang).hi:'Hello');
 return t.replace(/\{A\}/g,S.artist||'you').replace(/\{C\}/g,(C.d&&(C.d.city||C.d.country))||'town').replace(/\{S\}/g,song).replace(/\{H\}/g,hi.replace(/[!¡]/g,''))}
let BUB=null,lastT=0;
function bubble(g,txt){if(BUB)BUB.el.remove();const el=document.createElement('div');el.className='bsbub';el.textContent=txt;document.body.appendChild(el);const v=new THREE.Vector3(),B={el,g,t0:performance.now()};BUB=B;
 const upd=()=>{if(BUB!==B)return;const t=performance.now()-B.t0;if(t>3600||!g.visible||typeof mode=='undefined'||mode!='play'){el.remove();BUB=null;return}
  v.set(g.position.x,2.4,g.position.z).project(cam);el.style.left=((v.x*.5+.5)*innerWidth)+'px';el.style.top=((-v.y*.5+.5)*innerHeight)+'px';el.style.opacity=t<250?t/250:t>3200?(3600-t)/400:1;requestAnimationFrame(upd)};upd()}
{const s=document.createElement('style');s.textContent='.bsbub{position:fixed;z-index:60;transform:translate(-50%,-100%);max-width:210px;background:#f4f1ea;color:#15171a;border:2px solid #000;border-radius:6px;padding:6px 9px;font:12px/1.3 ui-monospace,Menlo,Consolas,monospace;box-shadow:2px 3px 0 #000a;pointer-events:none;text-align:center}.bsbub:after{content:"";position:absolute;left:50%;bottom:-8px;margin-left:-5px;border:5px solid transparent;border-top-color:#000;border-bottom:0}';document.head.appendChild(s)}
function fanPhoto(){const d=S.brands=S.brands||{};d.fan=d.fan&&d.fan.d==S.day?d.fan:{d:S.day,n:0};if(d.fan.n>=3)return;d.fan.n++;const f=Math.max(1,FOLN(Math.round(6+Math.sqrt(S.followers||0)*.15*tier())));S.followers=(S.followers||0)+f;setTimeout(()=>{try{say('A fan took a photo with you. +'+f+' followers')}catch(e){}},900)}
setInterval(()=>{try{const D=window.DCITY;if(!(D&&D.on&&D.C&&typeof mode!='undefined'&&mode=='play'&&!D.room&&!D.view&&S.artist&&typeof P!='undefined'))return;
 if(typeof window.apWhere=='function'&&window.apWhere())return;const C=D.C,tr=tier();
 if(!C.recMsg){C.recMsg=1;const m=TXT.find(q=>fl()>=q[0]);setTimeout(()=>{try{say(m?fill(m[2],C):'Nobody here knows you yet. Keep growing your fame.')}catch(e){}},600);return}
 if(!tr||Date.now()-lastT<CD[tr])return;
 let best=null,bd=7;(C.peds||[]).forEach(p=>{const g=p.o&&p.o.g;if(!g||!g.visible)return;const d=Math.hypot(g.position.x-P.x,g.position.z-P.z);if(d<bd&&!(p.rec&&Date.now()-p.rec<60000)){bd=d;best=p}});
 if(!best)return;best.rec=Date.now();lastT=Date.now();const L=LINES[tr];bubble(best.o.g,fill(L[Math.floor(Math.random()*L.length)],C));if(tr>=2&&Math.random()<.3)fanPhoto()}catch(e){console.error('recognition',e)}},900);
})();
