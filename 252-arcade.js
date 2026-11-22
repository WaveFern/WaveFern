/* ===== v55.33.0: arcade. Three retro 2D pixel games in one overlay (global ARC, test hook FW_ARC) =====
   Fern Flap (Flappy-style), Fern Bros (platformer, 4 courses), Fern Rush (3-lane runner). One 320x176 canvas, one fixed-step
   loop, one set of helpers; each game is a table { init, update(dt), draw() }. Opened by 253-furniture-interact.js (home arcade
   cabinet, gaming PC) and by the arcade room of the tour cities (179). Nothing is saved in S: best scores are in localStorage fw_arc.
   While it is open the 3D world is drawn at 10 fps (cap line in 122-graphics.js, FW_ARCADE.isOpen). */
(function(){
const W=320,H=176,TS=16,ROWS=11;
let HI={};try{HI=JSON.parse(localStorage.getItem('fw_arc')||'{}')}catch(e){}
const sv=()=>{try{localStorage.setItem('fw_arc',JSON.stringify(HI))}catch(e){}};
const C={ink:'#14102a',w:'#fff8e8',y:'#ffd23d',o:'#ff8a2a',r:'#e8384f',p:'#ff5fb0',pu:'#7a4ad8',b:'#3a6ad0',lb:'#5ec8ff',g:'#2fe68a',dg:'#1f9f5c',br:'#8a5a2e',gr:'#8c8c9c'};
let ov,cv,x,pad,open=0,raf=0,last=0,acc=0,game=null,sel=0,T=0,K={l:0,r:0,d:0,a:0,run:0},E={};
const snd2=(f,d,t,v,f2)=>{try{sfx(f,d,t||'square',v||.1,f2)}catch(e){}};
const R=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a|0,b|0,w|0,h|0)};
const TX=(s,a,b,c,al)=>{x.font='8px Silkscreen,ui-monospace,monospace';x.textBaseline='top';x.textAlign=al||'left';x.fillStyle=C.ink;x.fillText(s,a+1,b+1);x.fillStyle=c||C.w;x.fillText(s,a,b)};
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const best=(k,v)=>{if(v>(HI[k]||0)){HI[k]=v;sv();return 1}return 0};
/* sky bands + a few clouds drift, shared by Flap and the day course */
function sky(cols,t,sp){const n=cols.length,h=Math.ceil(H/n);cols.forEach((c,i)=>R(c,0,i*h,W,h));
 for(let i=0;i<4;i++){const cx=((i*97-t*sp*(.5+i*.12))%(W+60)+W+60)%(W+60)-30,cy=14+i*17;R('#ffffffcc',cx,cy,30,6);R('#ffffffcc',cx+6,cy-4,18,4);R('#ffffff99',cx+4,cy+6,22,2)}}

/* ================= Fern Flap ================= */
const FL={n:'FERN FLAP',k:'ff',
 init(){this.b={y:78,v:0,r:0};this.p=[];this.s=0;this.st=0;this.t=0;this.d=0;this.gx=0;this.hl=Array.from({length:24},()=>ri(14,40))},
 flap(){this.b.v=-205;snd2(520,.07,'square',.09,760)},
 update(dt){const b=this.b;this.t+=dt;const sp=this.st==1?72+Math.min(40,this.s*1.6):this.st==0?40:0;if(this.st)this.gx=(this.gx+sp*dt)%16;else this.gx=(this.gx+40*dt)%16;
  if(this.st==0){b.y=78+Math.sin(this.t*5)*4;if(E.a){this.st=1;this.flap();this.pc=0}}
  if(this.st==1){if(E.a)this.flap();b.v+=760*dt;b.y+=b.v*dt;if(b.y<5){b.y=5;b.v=0}
   if(!this.p.length||this.p[this.p.length-1].x<W-104)this.p.push({x:W+12,gy:ri(58,H-20-58),ok:0});
   this.p.forEach(p=>{p.x-=sp*dt;if(!p.ok&&p.x+26<68){p.ok=1;this.s++;snd2(880,.06,'square',.08,1320)}});this.p=this.p.filter(p=>p.x>-34);
   const bb={x:63,y:b.y-4,w:10,h:8};if(b.y>H-20-5||this.p.some(p=>hit(bb,{x:p.x,y:0,w:26,h:p.gy-28})||hit(bb,{x:p.x,y:p.gy+28,w:26,h:H})))this.die()}
  if(this.st==2){b.v+=760*dt;b.y=Math.min(H-24,b.y+b.v*dt);this.d+=dt;if(this.d>.7&&E.a){this.init()}}
  b.r=cl(b.v/320,-.5,1.2)},
 die(){this.st=2;this.d=0;this.b.v=-90;this.nb=best('ff',this.s);snd2(220,.3,'sawtooth',.12,60)},
 draw(){sky(['#ff9ad0','#ffb38a','#ffd98a','#bfe8ff'],this.t,6);
  R('#ffe9a0',236,22,20,20);R('#fff6d0',240,26,12,12);
  this.hl.forEach((h,i)=>{const hx=i*14-((this.t*10)%14);R('#7ac98a',hx,H-20-h,14,h);R('#5aa86e',hx,H-20-h,14,3)});
  this.p.forEach(p=>{const top=p.gy-28,bot=p.gy+28;R('#1f9f5c',p.x,0,26,top);R('#2fe68a',p.x+3,0,5,top);R('#0f6a3c',p.x+20,0,6,top);R('#1f9f5c',p.x-2,top-9,30,9);R('#2fe68a',p.x+1,top-9,5,9);R('#0f6a3c',p.x+22,top-9,6,9);
   R('#1f9f5c',p.x,bot+9,26,H);R('#2fe68a',p.x+3,bot+9,5,H);R('#0f6a3c',p.x+20,bot+9,6,H);R('#1f9f5c',p.x-2,bot,30,9);R('#2fe68a',p.x+1,bot,5,9);R('#0f6a3c',p.x+22,bot,6,9)});
  R('#c8a060',0,H-20,W,20);R('#8fe06a',0,H-20,W,4);R('#5aa86e',0,H-16,W,2);for(let i=-1;i<22;i++)R('#b08848',i*16-this.gx+16,H-12,8,4);
  const b=this.b;x.save();x.translate(68,b.y);x.rotate(b.r);const f=this.st==1&&Math.floor(this.t*10)%2;
  R(C.ink,-8,-6,16,12);R(C.y,-7,-5,14,10);R('#fff3b0',-7,-5,14,3);R(C.w,0,-5,6,6);R(C.ink,3,-3,2,2);R(C.o,5,0,6,3);R(C.r,5,3,5,1);R(C.o,-6+(f?0:0),f?-1:2,7,4);R('#c85a1a',-6,f?2:5,7,1);x.restore();
  TX(this.s+'',W/2,10,C.w,'center');
  if(this.st==0){TX('TAP / SPACE TO FLAP',W/2,100,C.w,'center')}
  if(this.st==2){R('#000a',70,44,180,76);TX('GAME OVER',W/2,52,C.r,'center');TX('SCORE '+this.s,W/2,68,C.w,'center');TX('BEST '+(HI.ff||0)+(this.nb?'  NEW!':''),W/2,80,C.y,'center');
   TX(this.s>=30?'GOLD MEDAL':this.s>=20?'SILVER MEDAL':this.s>=10?'BRONZE MEDAL':'KEEP GOING',W/2,94,this.s>=30?C.y:this.s>=20?'#dfe6f0':this.s>=10?C.o:C.gr,'center');if(this.d>.7)TX('PRESS SPACE',W/2,108,C.lb,'center')}}};

/* ================= Fern Bros ================= */
const SOL='#bH?uT',TH={day:{bg:['#5ec8ff','#8fdcff'],gt:'#3ca33c',gd:'#9a6a34',br:'#d2652f',bl:'#8a3a18'},cave:{bg:['#0b0b24'],gt:'#2a4a9a',gd:'#1a2a6a',br:'#3a5ac0',bl:'#16205a'},
 dusk:{bg:['#3a1a6a','#8a3a8a','#e8685a','#ffb06a'],gt:'#c8603a',gd:'#6a2a2a',br:'#9a3a6a',bl:'#4a1a3a'},castle:{bg:['#14060e'],gt:'#7a7a8a',gd:'#3a3a4a',br:'#5a5a6a',bl:'#26262e'}};
const LV=[
 {n:'1-1 FERN FIELDS',th:'day',len:116,f(L){L.fl(0,116);L.gap(38,40);L.gap(71,73);L.bl(11,6,'?');L.bl(17,6,'b?b?b');L.bl(21,3,'?');L.pipe(28,1);L.pipe(47,2);L.pipe(57,2);L.bl(50,6,'bb');L.bl(63,6,'?b?');L.bl(77,6,'bbbb');L.bl(79,3,'??');L.st(88,4,1);L.st(92,4,-1);
  [20,31,43,52,62,67,79,84,92].forEach(L.e);L.co(13,4,3);L.co(60,3,5);L.co(75,5,3);L.co(39,5,2);L.flag(110)}},
 {n:'1-2 BELOW THE FERNS',th:'cave',len:128,f(L){L.fl(0,128);L.cap();L.gap(24,26);L.gap(52,55);L.gap(88,91);L.bl(12,6,'?b?');L.bl(30,6,'bbbbb');L.bl(32,3,'???');L.pipe(40,2);L.pipe(46,1);L.bl(60,6,'b?b');L.bl(66,5,'bbbb');L.bl(72,6,'?');L.pipe(78,2);L.sp(70,3);L.sp(98,3);L.sp(104,2);L.bl(96,6,'bb');L.st(112,4,1);
  [16,34,43,58,69,74,82,95,100,108].forEach(L.e);L.co(14,4,3);L.co(31,4,5);L.co(53,5,2);L.co(89,5,2);L.co(66,3,4);L.flag(122)}},
 {n:'1-3 SUNSET RIDGE',th:'dusk',len:132,f(L){L.fl(0,16);L.fl(21,35);L.fl(39,56);L.fl(61,72);L.fl(78,96);L.fl(101,132);L.bl(17,8,'bbb');L.bl(36,8,'bb');L.bl(57,8,'bb');L.bl(74,8,'bb');L.bl(97,8,'bb');
  L.bl(8,6,'?');L.bl(26,6,'b?b');L.bl(44,6,'?b?');L.bl(66,5,'bb');L.bl(86,6,'?b?b');L.pipe(30,2);L.pipe(50,1);L.sp(46,2);L.sp(83,3);L.sp(108,2);L.pipe(114,2);L.st(120,4,1);
  [10,24,28,45,53,64,82,91,106,116].forEach(L.e);L.co(17,6,2);L.co(36,6,2);L.co(57,6,2);L.co(74,6,2);L.co(97,6,2);L.co(88,3,4);L.flag(127)}},
 {n:'1-4 CASTLE FERN',th:'castle',len:140,f(L){L.fl(0,140);L.cap();L.gap(20,23);L.gap(36,38);L.gap(58,62);L.gap(80,83);L.gap(104,108);L.bl(21,8,'H');L.bl(59,8,'HH');L.bl(105,8,'H');
  L.bl(10,6,'?b?');L.bl(40,6,'bb?bb');L.bl(66,6,'?');L.bl(70,4,'???');L.pipe(28,2);L.pipe(48,2);L.pipe(90,2);L.sp(31,2);L.sp(52,3);L.sp(74,3);L.sp(95,3);L.sp(112,2);L.st(118,4,1);
  [14,26,34,44,56,68,72,86,93,100,111].forEach(L.e);L.co(11,4,3);L.co(70,2,3);L.co(21,6,2);L.co(59,6,2);L.co(105,6,2);L.flag(133)}}];
function build(li){const d=LV[li],L={m:Array.from({length:ROWS},()=>Array(d.len).fill('.')),en:[],len:d.len,th:d.th,n:d.n,li};const m=L.m;
 L.fl=(a,b)=>{for(let c=a;c<b;c++){m[9][c]='#';m[10][c]='#'}};L.gap=(a,b)=>{for(let c=a;c<b;c++){m[9][c]='.';m[10][c]='.'}};L.cap=()=>{for(let c=0;c<d.len;c++){m[0][c]='b';m[1][c]='b'}};
 L.bl=(c,r,s)=>{for(let i=0;i<s.length;i++)m[r][c+i]=s[i]};L.co=(c,r,n)=>{for(let i=0;i<n;i++)if(m[r][c+i]=='.')m[r][c+i]='c'};
 L.pipe=(c,h)=>{for(let r=9-h;r<9;r++){m[r][c]='T';m[r][c+1]='T'}};L.sp=(c,w)=>{for(let i=0;i<w;i++)m[8][c+i]='^'};
 L.st=(c,n,dir)=>{for(let i=0;i<n;i++)for(let r=0;r<=i;r++)m[8-r][dir>0?c+i:c+n-1-i]='H'};
 L.e=c=>L.en.push({x:c*TS+2,y:8*TS+2,w:12,h:12,vx:-26,vy:0,dead:0,t:0,on:0});L.flag=c=>{for(let r=2;r<9;r++)m[r][c]='F';L.fx=c};d.f(L);return L}
const TC={};function tile(th,ch,ex){const k=th+ch+(ex||''),T0=TH[th];if(TC[k])return TC[k];const c=document.createElement('canvas');c.width=c.height=TS;const q=c.getContext('2d'),r=(col,a,b,w,h)=>{q.fillStyle=col;q.fillRect(a,b,w,h)};
 if(ch=='#'){r(T0.gd,0,0,16,16);r(T0.gt,0,0,16,4);r('#00000030',0,4,16,1);r('#00000022',3,9,4,2);r('#00000022',10,12,3,2);if(th=='day')r('#6ad45a',0,0,16,2)}
 else if(ch=='b'||ch=='H'){const hd=ch=='H';r(hd?'#7a7a8a':T0.br,0,0,16,16);r(hd?'#a8a8b8':T0.bl,0,0,16,1);if(hd){r('#a8a8b8',0,0,16,2);r('#a8a8b8',0,0,2,16);r('#4a4a5a',14,0,2,16);r('#4a4a5a',0,14,16,2)}else{r(T0.bl,0,7,16,1);r(T0.bl,0,15,16,1);r(T0.bl,7,0,1,7);r(T0.bl,3,8,1,7);r(T0.bl,11,8,1,7);r('#ffffff30',0,0,16,1)}}
 else if(ch=='?'||ch=='u'){const u=ch=='u';r(u?'#7a6a52':'#ffc830',0,0,16,16);r(u?'#5a4a38':'#c8801a',0,0,16,1);r(u?'#5a4a38':'#c8801a',0,15,16,1);r(u?'#5a4a38':'#c8801a',0,0,1,16);r(u?'#5a4a38':'#c8801a',15,0,1,16);r(u?'#5a4a38':'#fff0a0',2,2,2,2);r(u?'#5a4a38':'#fff0a0',12,2,2,2);
  if(!u){r('#8a4a10',5,3,6,2);r('#8a4a10',9,5,2,3);r('#8a4a10',7,8,2,2);r('#8a4a10',7,12,2,2)}}
 else if(ch=='T'){const a=ex.indexOf('t')>=0,rt=ex.indexOf('r')>=0;r('#1f9f5c',0,0,16,16);r('#2fe68a',rt?8:2,0,3,16);r('#0f6a3c',rt?13:0,0,3,16);if(a){r('#0f6a3c',0,0,16,1);r('#2fe68a',rt?8:2,2,3,12)}}
 else if(ch=='^'){q.fillStyle='#e8e8f0';for(let i=0;i<2;i++){q.beginPath();q.moveTo(i*8,16);q.lineTo(i*8+4,5);q.lineTo(i*8+8,16);q.fill()}r('#b8b8c8',0,14,16,2)}
 return TC[k]=c}
const solid=(L,tx,ty)=>tx<0||tx>=L.len?1:ty<0||ty>=ROWS?0:SOL.indexOf(L.m[ty][tx])>=0;
const FB={n:'FERN BROS',k:'fb',
 init(){this.li=this.li||0;this.lives=3;this.score=0;this.coins=0;this.st=0;this.load(this.li)},
 load(li){this.L=build(li);this.li=li;this.cp=24;this.t=0;this.time=240;this.cam=0;this.pops=[];this.bump={};this.reset()},
 reset(r){this.p={x:this.cp,y:8*TS-14,w:10,h:14,vx:0,vy:0,on:0,face:1,coy:0,buf:0,inv:r?1.4:0,an:0};this.cam=cl(this.p.x-100,0,this.L.len*TS-W)},
  hurt(){const p=this.p;if(p.inv>0||this.st)return;snd2(200,.4,'sawtooth',.12,50);this.lives--;if(this.lives<=0){this.st=3;this.d=0;this.nb=best('fbs',this.score);return}this.st=4;this.d=0},
 update(dt){const L=this.L,p=this.p;this.t+=dt;
  if(this.st==3){this.d+=dt;if(this.d>.8&&E.a)this.init();return}
  if(this.st==4){this.d+=dt;p.vy+=900*dt;p.y+=p.vy*dt*.6;if(this.d>1.1){this.st=0;this.reset(1);this.time=Math.max(this.time,120)}return}
  if(this.st==2){this.d+=dt;if(this.d>1.4&&E.a){if(this.li<LV.length-1){HI.fb=Math.max(HI.fb||0,this.li+1);sv();this.load(this.li+1);this.st=0}else ARC.menu()}return}
  this.time-=dt;if(this.time<=0){this.time=0;p.inv=0;this.hurt();return}
  const run=K.run?120:84,dir=(K.r?1:0)-(K.l?1:0),ac=p.on?650:380;if(p.inv>0)p.inv-=dt;
  if(dir){p.vx+=dir*ac*dt;p.face=dir;if(Math.abs(p.vx)>run)p.vx=run*Math.sign(p.vx)}else{const f=(p.on?700:150)*dt;p.vx=Math.abs(p.vx)<=f?0:p.vx-Math.sign(p.vx)*f}
  p.coy=p.on?.09:p.coy-dt;p.buf=E.a?.1:p.buf-dt;
  if(p.buf>0&&p.coy>0){p.vy=-305;p.coy=0;p.buf=0;p.on=0;snd2(380,.12,'square',.09,720)}
  if(!K.a&&p.vy<-120)p.vy=-120;p.vy=Math.min(p.vy+960*dt,380);
  p.x+=p.vx*dt;this.col(0);p.y+=p.vy*dt;p.on=0;this.col(1);p.an+=Math.abs(p.vx)*dt*.12;
  if(p.y>H+24){p.inv=0;this.hurt();return}
  const tx0=Math.floor(p.x/TS),tx1=Math.floor((p.x+p.w-1)/TS),ty0=Math.floor(p.y/TS),ty1=Math.floor((p.y+p.h-1)/TS);
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){const ch=L.m[ty]&&L.m[ty][tx];if(ch=='c'){L.m[ty][tx]='.';this.coin(tx*TS+8,ty*TS)}else if(ch=='^'&&p.y+p.h>ty*TS+7)this.hurt();else if(ch=='F'){this.st=2;this.d=0;this.bonus=Math.round(this.time)*5;this.score+=this.bonus+500;snd2(660,.5,'square',.12,1320);return}}
  L.en.forEach(e=>{if(e.dead){e.dead-=dt;return}if(Math.abs(e.x-this.cam-W/2)>W/2+50)return;e.t+=dt;e.vy=Math.min(e.vy+900*dt,300);e.x+=e.vx*dt;if(this.ecol(e,0))e.vx=-e.vx;e.y+=e.vy*dt;this.ecol(e,1);if(e.y>H+30)e.dead=.01;
   if(hit(p,e)&&p.inv<=0){if(p.vy>0&&p.y+p.h-e.y<9){e.dead=.5;p.vy=K.a?-270:-190;this.score+=100;this.pops.push({x:e.x,y:e.y,t:0,s:'100'});snd2(300,.12,'square',.1,120)}else this.hurt()}});
  L.en=L.en.filter(e=>e.dead>=0||!e.dead);
  if(p.x>L.len*TS/2&&this.cp<L.len*TS/2){this.cp=Math.floor(L.len/2)*TS;this.pops.push({x:p.x,y:p.y-14,t:0,s:'CHECKPOINT'});snd2(520,.1,'triangle',.1,780)}
  this.pops.forEach(o=>o.t+=dt);this.pops=this.pops.filter(o=>o.t<.8);Object.keys(this.bump).forEach(k=>{this.bump[k]-=dt;if(this.bump[k]<=0)delete this.bump[k]});
  this.cam+=(cl(p.x-110,0,L.len*TS-W)-this.cam)*Math.min(1,dt*8)},
 coin(px,py){this.coins++;this.score+=10;if(this.coins%25==0){this.lives++;this.pops.push({x:px,y:py-8,t:0,s:'1UP'})}this.pops.push({x:px-6,y:py,t:0,s:'+10',c:1});snd2(990,.08,'square',.08,1480)},
 col(vert){const L=this.L,p=this.p;const tx0=Math.floor(p.x/TS),tx1=Math.floor((p.x+p.w-1)/TS),ty0=Math.floor(p.y/TS),ty1=Math.floor((p.y+p.h-1)/TS);
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){if(!solid(L,tx,ty))continue;
   if(!vert){p.x=p.vx>0?tx*TS-p.w:(tx+1)*TS;p.vx=0;return this.col(0)}
   if(p.vy>0){p.y=ty*TS-p.h;p.vy=0;p.on=1}else if(p.vy<0){p.y=(ty+1)*TS;p.vy=0;this.head(tx,ty)}return}},
 head(tx,ty){const L=this.L,ch=L.m[ty]&&L.m[ty][tx];this.bump[tx+','+ty]=.15;if(ch=='?'){L.m[ty][tx]='u';this.coin(tx*TS+8,ty*TS-4)}else snd2(160,.05,'square',.08)},
 ecol(e,vert){const L=this.L;const tx0=Math.floor(e.x/TS),tx1=Math.floor((e.x+e.w-1)/TS),ty0=Math.floor(e.y/TS),ty1=Math.floor((e.y+e.h-1)/TS);let h=0;
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++)if(solid(L,tx,ty)){h=1;if(vert){if(e.vy>0)e.y=ty*TS-e.h;else e.y=(ty+1)*TS;e.vy=0}else e.x=e.vx>0?tx*TS-e.w:(tx+1)*TS}return h&&!vert},
 draw(){const L=this.L,th=TH[L.th],cam=Math.round(this.cam),t=this.t,p=this.p;
  if(L.th=='day')sky(th.bg.concat(th.bg),t,0);else{th.bg.forEach((c,i)=>R(c,0,i*H/th.bg.length,W,H/th.bg.length+1))}
  if(L.th=='day'){for(let i=0;i<5;i++){const hx=((i*90-cam*.3)%450+450)%450-60;R('#6ac86a',hx,H-48-(i%2)*8,64,48);R('#7ad87a',hx+12,H-56-(i%2)*8,40,12)}}
  if(L.th=='dusk'){R('#ffd070',210,36,26,26);for(let i=0;i<5;i++){const hx=((i*110-cam*.25)%550+550)%550-80;R('#4a1a5a',hx,H-70,90,70);R('#5a2a6a',hx+20,H-84,50,20)}}
  if(L.th=='castle'){R('#c8301a',0,H-10+Math.sin(t*3)*1.5,W,12);R('#ff8a2a',0,H-8+Math.sin(t*3+1)*1.5,W,2)}
  if(L.th=='cave')for(let i=0;i<8;i++)R('#16205a',((i*53-cam*.4)%424+424)%424-30,10+(i*37%90),3,3);
  const c0=Math.floor(cam/TS);for(let cx=c0;cx<=c0+W/TS+1&&cx<L.len;cx++)for(let ry=0;ry<ROWS;ry++){const ch=L.m[ry][cx];if(ch=='.')continue;const sx=cx*TS-cam,sy=ry*TS;
   if(ch=='c'){const w=Math.abs(Math.cos(t*6+cx))*6+2;R('#8a5a00',sx+8-w/2-1,sy+3,w+2,10);R(C.y,sx+8-w/2,sy+4,w,8);R('#fff0a0',sx+8-w/2,sy+4,Math.min(w,2),8);continue}
   if(ch=='F'){if(ry==2){R('#e8e8f0',sx+7,sy,2,16);R(C.y,sx+5,sy-2,6,3)}else R('#e8e8f0',sx+7,sy,2,16);if(ry==3){R(C.r,sx+9,sy,13,8);R(C.w,sx+13,sy+2,4,4)}continue}
   const b=this.bump[cx+','+ry];let ex='';if(ch=='T'){ex=(L.m[ry-1]&&L.m[ry-1][cx]=='T'?'':'t')+(L.m[ry][cx+1]=='T'?'':'r')}
   x.drawImage(tile(L.th,ch,ex),sx,sy-(b?Math.sin(b/.15*Math.PI)*4:0))}
  if(L.fx){const fx=L.fx*TS-cam+14;R('#6a4a3a',fx+10,9*TS-40,40,40);R('#4a2a1a',fx+10,9*TS-40,40,4);R(C.ink,fx+24,9*TS-18,12,18);for(let i=0;i<4;i++)R('#6a4a3a',fx+10+i*10,9*TS-46,6,6)}
  L.en.forEach(e=>{const ex=e.x-cam,ey=e.y;if(ex<-20||ex>W+20)return;if(e.dead){R('#8a4a1a',ex,ey+8,12,4);R(C.w,ex+2,ey+8,2,2);R(C.w,ex+8,ey+8,2,2);return}
   const f=Math.floor(e.t*6)%2;R('#8a4a1a',ex+1,ey,10,8);R('#a8601e',ex,ey+3,12,5);R('#f2c08a',ex+2,ey+8,8,2);R(C.ink,ex+(f?0:2),ey+10,4,2);R(C.ink,ex+(f?8:6),ey+10,4,2);R(C.w,ex+2,ey+3,3,3);R(C.w,ex+7,ey+3,3,3);R(C.ink,ex+4,ey+4,1,2);R(C.ink,ex+7,ey+4,1,2);R(C.ink,ex+2,ey+2,4,1);R(C.ink,ex+6,ey+2,4,1)});
  if(!(this.st==4&&0)&&(p.inv<=0||Math.floor(t*14)%2)){const px=Math.round(p.x-cam)-1,py=Math.round(p.y)-2,f=p.face,jm=!p.on,fr=Math.floor(p.an)%2;x.save();x.translate(px+6,0);x.scale(f,1);x.translate(-6,0);
   R(C.ink,0,py+1,12,14);R(C.dg,1,py,9,4);R(C.g,2,py,8,3);R(C.g,6,py+2,6,2);R('#f2c08a',2,py+4,8,4);R(C.ink,7,py+5,2,2);R(C.b,2,py+8,8,5);R(C.r,2,py+8,8,2);R('#5a3a22',jm?4:(fr?1:3),py+13,5,3);R('#5a3a22',jm?8:(fr?7:5),py+12,4,2);R('#f2c08a',jm?9:3,py+8,2,3);x.restore()}
  this.pops.forEach(o=>TX(o.s,o.x-cam,o.y-o.t*24,o.c?C.y:C.w,'center'));
  R('#0006',0,0,W,12);TX('x'+this.lives,6,3,C.w);TX('COINS '+String(this.coins).padStart(2,'0'),42,3,C.y);TX('SCORE '+String(this.score).padStart(6,'0'),118,3,C.w);TX(L.n,W-4,3,C.lb,'right');TX('T'+Math.ceil(this.time),192,3,this.time<30?C.r:C.w);
  if(this.t<2.2&&this.st==0){TX(L.n,W/2,60,C.w,'center');TX('ARROWS MOVE · SPACE JUMP · SHIFT RUN',W/2,74,C.lb,'center')}
  if(this.st==2){R('#000a',60,48,200,70);TX('COURSE CLEAR!',W/2,56,C.y,'center');TX('TIME BONUS '+this.bonus+' +500',W/2,72,C.w,'center');TX(this.li<LV.length-1?'NEXT: '+LV[this.li+1].n:'YOU BEAT THE GAME!',W/2,86,C.g,'center');if(this.d>1.4)TX('PRESS SPACE',W/2,102,C.lb,'center')}
  if(this.st==3){R('#000a',70,48,180,66);TX('GAME OVER',W/2,56,C.r,'center');TX('SCORE '+this.score+(this.nb?'  NEW BEST!':''),W/2,72,C.w,'center');TX('BEST '+(HI.fbs||0),W/2,84,C.y,'center');if(this.d>.8)TX('PRESS SPACE',W/2,98,C.lb,'center')}}};

/* ================= Fern Rush ================= */
const LX=[104,160,216],LW=48;
const RU={n:'FERN RUSH',k:'fr',
 init(){this.lane=1;this.px=LX[1];this.z=0;this.zv=0;this.sl=0;this.dist=0;this.coins=0;this.sp=110;this.ob=[];this.cn=[];this.nx=-260;this.ch=0;this.inv=0;this.st=0;this.t=0;this.d=0;this.sc=0},
 spawn(){const y=this.nx,ty=[0,1,2].map(()=>{const r=Math.random();return r<.38?'t':r<.55?'b':r<.68?'s':0});if(ty.every(v=>v=='t'))ty[ri(0,2)]=0;
  ty.forEach((k,l)=>{if(k)this.ob.push({k,l,y,h:k=='t'?ri(46,92):k=='b'?10:12,c:ri(0,2)})});
  const fr=[0,1,2].filter(l=>!ty[l]);if(fr.length){const l=fr[ri(0,fr.length-1)];for(let i=0;i<4;i++)this.cn.push({l,y:y-i*14})}
  this.nx-=ri(120,170)-Math.min(30,this.dist/120)},
 key(a){if(this.st!=1)return;if(a=='l'&&this.lane>0)this.lane--;if(a=='r'&&this.lane<2)this.lane++;if(a=='a'&&!this.z&&!this.sl){this.zv=190;snd2(460,.08,'square',.08,700)}if(a=='d'){this.sl=.55;if(this.z>0)this.zv=-300}},
 update(dt){this.t+=dt;const tx=LX[this.lane];this.px+=(tx-this.px)*Math.min(1,dt*18);
  if(this.st==0){if(E.a)this.st=1;return}
  if(this.st==2){this.d+=dt;if(this.d>.7&&E.a){this.init();this.st=1}return}
  this.sp=Math.min(210,110+this.dist/38);const dy=this.sp*dt;this.dist+=dy;this.nx+=dy;if(this.inv>0)this.inv-=dt;if(this.ch>0){this.ch-=dt}
  if(this.z>0||this.zv>0){this.zv-=620*dt;this.z=Math.max(0,this.z+this.zv*dt);if(!this.z)this.zv=0}if(this.sl>0)this.sl-=dt;
  while(this.nx>-20)this.spawn();
  const me={x:this.px-7,y:122,w:14,h:14};this.ob.forEach(o=>{o.y+=dy;const ox=LX[o.l]-LW/2+6;
   if(this.inv>0||o.dn)return;const r={x:ox,y:o.y-o.h,w:LW-12,h:o.h};if(!hit(me,r))return;
   const j=this.z>9,s=this.sl>0;if(o.k=='t'||(o.k=='b'&&!j)||(o.k=='s'&&!s)){o.dn=1;this.crash()}});
  this.cn.forEach(c=>{c.y+=dy;if(!c.dn&&Math.abs(c.y-130)<10&&Math.abs(LX[c.l]-this.px)<14&&this.z<14){c.dn=1;this.coins++;snd2(990,.06,'square',.07,1480)}});
  this.ob=this.ob.filter(o=>o.y-o.h<H+4);this.cn=this.cn.filter(c=>c.y<H+4&&!c.dn);this.sc=Math.floor(this.dist/10)+this.coins*5},
 crash(){if(this.ch>0){this.st=2;this.d=0;this.nb=best('fr',this.sc);snd2(180,.4,'sawtooth',.13,40)}else{this.ch=9;this.inv=1.3;snd2(240,.25,'sawtooth',.12,90)}},
 draw(){R('#1b1736',0,0,W,H);const off=this.dist%32;
  [0,1].forEach(s=>{const bx=s?LX[2]+LW/2+8:0,bw=s?W-bx:LX[0]-LW/2-8;R('#2a2252',bx,0,bw,H);for(let i=-1;i<6;i++){const by=i*40+(this.dist*.6%40),h=30+((i*7+s*3)&3)*4;R(['#ff5fb0','#3ad0ff','#ffd23d'][(i+s+9)%3]+'55',bx+4,by,bw-8,h);R('#ffffff22',bx+4,by,bw-8,2);for(let k=0;k<3;k++)R('#ffe9a0aa',bx+10+k*((bw-24)/3),by+8,6,5)}});
  R('#3a3552',LX[0]-LW/2-8,0,LX[2]-LX[0]+LW+16,H);for(let l=0;l<3;l++)R('#46405f',LX[l]-LW/2+2,0,LW-4,H);
  for(let i=-1;i<7;i++){const y=i*32+off;[0,1,2].forEach(l=>{R('#6a5a4a',LX[l]-14,y,28,4);R('#8a8a9a',LX[l]-20,y-8,2,H);R('#8a8a9a',LX[l]+18,y-8,2,H)})}
  R('#c8c8d8',LX[0]-LW/2-8,0,3,H);R('#c8c8d8',LX[2]+LW/2+5,0,3,H);
  this.cn.forEach(c=>{const cx=LX[c.l],w=Math.abs(Math.cos(this.t*6+c.y*.1))*5+2;R('#8a5a00',cx-w/2-1,c.y-5,w+2,10);R(C.y,cx-w/2,c.y-4,w,8)});
  this.ob.forEach(o=>{const cx=LX[o.l],ox=cx-LW/2+4,w=LW-8;
   if(o.k=='t'){const col=['#e8384f','#3a6ad0','#2fe68a'][o.c];R('#0005',ox+3,o.y-o.h+3,w,o.h);R('#2a2a3a',ox,o.y-o.h,w,o.h);R(col,ox+2,o.y-o.h+2,w-4,o.h-4);R('#ffffff44',ox+2,o.y-o.h+2,w-4,3);R(C.ink,ox+6,o.y-o.h+8,w-12,8);R(C.y,ox+4,o.y-5,5,3);R(C.y,ox+w-9,o.y-5,5,3);for(let k=22;k<o.h-8;k+=14)R('#00000033',ox+4,o.y-o.h+k,w-8,2)}
   else if(o.k=='b'){R('#0005',ox+2,o.y-4,w,6);R(C.w,ox,o.y-10,w,5);for(let k=0;k<w;k+=10)R(C.r,ox+k,o.y-10,5,5);R('#777',ox+2,o.y-5,3,6);R('#777',ox+w-5,o.y-5,3,6)}
   else{R('#0005',ox+2,o.y-2,w,5);R('#3a6ad0',ox,o.y-12,w,7);R(C.w,ox+4,o.y-10,w-8,3);R('#555',ox,o.y-12,3,14);R('#555',ox+w-3,o.y-12,3,14)}});
  const z=this.z,sl=this.sl>0,px=this.px,py=132-z*.45,bl=this.ch>0&&Math.floor(this.t*12)%2&&this.inv>0;
  R('#0006',px-7+z*.05,136,14-z*.1,4);if(this.ch>0)R(C.r+'cc',px-20,H-18+Math.sin(this.t*10)*1.5,40,12),R(C.w,px-10,H-15,4,4),R(C.w,px+6,H-15,4,4);
  if(!bl){const f=Math.floor(this.t*10)%2,h=sl?6:14,yy=sl?py+8:py;R(C.ink,px-6,yy-1,12,h+2);R('#e040a0',px-5,yy,10,sl?5:7);R(C.g,px-4,yy-3,8,4);R(C.dg,px-4,yy-3,8,1);if(!sl){R('#2a3a8a',px-4,yy+7,8,4);R('#fff',px-4+(f?0:4),yy+11,4,3);R('#fff',px-4+(f?4:0),yy+11,4,2);R('#f2c08a',px-7,yy+2,2,4);R('#f2c08a',px+5,yy+2,2,4)}else R('#2a3a8a',px-5,yy+5,10,2)}
  R('#0006',0,0,W,12);TX('SCORE '+this.sc,6,3);TX('COINS '+this.coins,110,3,C.y);TX('BEST '+Math.max(HI.fr||0,0),W-4,3,C.lb,'right');
  if(this.st==0)TX('A/D OR ARROWS: LANES · SPACE: JUMP · S: SLIDE',W/2,70,C.w,'center'),TX('PRESS SPACE',W/2,84,C.lb,'center');
  if(this.st==2){R('#000a',70,44,180,72);TX('BUSTED!',W/2,52,C.r,'center');TX('SCORE '+this.sc+(this.nb?'  NEW!':''),W/2,68,C.w,'center');TX('COINS '+this.coins+' · BEST '+(HI.fr||0),W/2,80,C.y,'center');if(this.d>.7)TX('PRESS SPACE',W/2,96,C.lb,'center')}}};

/* ================= menu + shell ================= */
const GAMES=[FL,FB,RU],MENU={n:'MENU',
 update(){},
 draw(){R('#0a0820',0,0,W,H);for(let i=0;i<30;i++)R(i%3?'#ffffff44':'#ff5fb055',(i*53+T*8)%W,(i*29)%H,1,1);
  TX('WAVEFERN ARCADE',W/2,14,C.g,'center');R(C.p,92,26,136,1);TX('PICK A GAME',W/2,32,C.w,'center');
  GAMES.forEach((g,i)=>{const cx=14+i*100,cy=48,s=i==sel;R(s?C.y:'#3a3560',cx-2,cy-2,96,96);R('#14102a',cx,cy,92,92);
   x.save();x.beginPath();x.rect(cx+4,cy+4,84,52);x.clip();
   if(i==0){R('#ffb38a',cx+4,cy+4,84,52);R('#1f9f5c',cx+58,cy+4,14,18);R('#1f9f5c',cx+58,cy+40,14,16);R(C.y,cx+26,cy+26+Math.sin(T*4)*3,12,9);R(C.o,cx+36,cy+29+Math.sin(T*4)*3,5,3);R('#c8a060',cx+4,cy+50,84,6)}
   if(i==1){R('#5ec8ff',cx+4,cy+4,84,52);R('#3ca33c',cx+4,cy+44,84,12);R('#d2652f',cx+30,cy+22,16,16);R('#ffc830',cx+46,cy+22,16,16);R(C.g,cx+14,cy+30+Math.abs(Math.sin(T*4))*-6,8,8);R(C.r,cx+14,cy+36+Math.abs(Math.sin(T*4))*-6,8,4);R('#8a4a1a',cx+68,cy+34,10,10)}
   if(i==2){R('#2a2252',cx+4,cy+4,84,52);for(let l=0;l<3;l++)R('#46405f',cx+10+l*26,cy+4,22,52);R('#3a6ad0',cx+10,cy+8+(T*20%40),22,16);R(C.y,cx+62,cy+10+(T*30%40),6,6);R(C.g,cx+31,cy+38,10,12);R('#e040a0',cx+32,cy+42,8,6)}
   x.restore();TX(g.n,cx+46,cy+60,s?C.y:C.w,'center');TX('BEST '+(HI[g.k=='fb'?'fbs':g.k]||0),cx+46,cy+74,C.lb,'center')});
  TX('LEFT/RIGHT CHOOSE · SPACE PLAY · ESC EXIT',W/2,152,C.gr,'center');
  if(HI.fb)TX('FERN BROS COURSES OPEN: '+Math.min(4,HI.fb+1)+'/4',W/2,164,C.g,'center')}};
const KM={arrowleft:'l',a:'l',arrowright:'r',d:'r',arrowdown:'d',s:'d',' ':'a',w:'a',arrowup:'a',z:'a',enter:'a',shift:'run',x:'run'};
function kd(e){if(!open)return;const k=e.key.toLowerCase();e.stopImmediatePropagation();if(k=='escape'){e.preventDefault();return game==MENU?ARC.close():ARC.menu()}
 const m=KM[k];if(m){e.preventDefault();if(!K[m]&&!e.repeat)edge(m);K[m]=1}}
function ku(e){if(!open)return;const m=KM[e.key.toLowerCase()];if(m)K[m]=0;e.stopImmediatePropagation()}
function edge(m){E[m]=1;if(game==RU)RU.key(m);if(game==MENU){if(m=='l')sel=(sel+2)%3;if(m=='r')sel=(sel+1)%3;if(m=='a')ARC.play(sel)}
}
function size(){if(!cv)return;const k=Math.max(1,Math.min((innerWidth-16)/W,(innerHeight-(document.body.classList.contains('tch')?150:70))/H));cv.style.width=Math.floor(W*k)+'px';cv.style.height=Math.floor(H*k)+'px'}
function loop(n){if(!open)return;raf=requestAnimationFrame(loop);let dt=Math.min(.1,(n-last)/1000);last=n;acc+=dt;T+=dt;let s=0;
 while(acc>=1/60&&s++<6){game.update(1/60);acc-=1/60;E={}}if(s>=6)acc=0;
 x.imageSmoothingEnabled=false;game.draw()}
function mk(){ov=document.createElement('div');ov.id='arc';ov.innerHTML='<div class=arb><canvas width='+W+' height='+H+'></canvas><div class=arp><button data-k=l>◀</button><button data-k=d>▼</button><button data-k=a>▲ A</button><button data-k=r>▶</button></div></div>';document.body.appendChild(ov);
 cv=ov.querySelector('canvas');x=cv.getContext('2d');
 ov.querySelectorAll('button').forEach(b=>{const m=b.dataset.k,dn=e=>{e.preventDefault();if(!K[m])edge(m);K[m]=1},up=e=>{e.preventDefault();K[m]=0};b.addEventListener('pointerdown',dn);b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up)});
 cv.addEventListener('pointerdown',e=>{e.preventDefault();if(game==MENU){const r=cv.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*W;const i=Math.floor((px-12)/100);if(i>=0&&i<3){if(sel==i)ARC.play(i);else sel=i}}else if(game==FL)edge('a')});
 const st=document.createElement('style');st.textContent='#arc{position:fixed;inset:0;z-index:99990;background:#06040dee;display:none;align-items:center;justify-content:center;touch-action:none;user-select:none}#arc.on{display:flex}.arb{display:flex;flex-direction:column;align-items:center;gap:8px}#arc canvas{image-rendering:pixelated;border:4px solid #ff5fb0;box-shadow:0 0 0 4px #14102a,0 0 28px #ff5fb066,0 0 60px #3ad0ff33;border-radius:6px;background:#000;touch-action:none}.arp{display:none;gap:8px}body.tch .arp{display:flex}.arp button{font:14px Silkscreen,monospace;padding:14px 18px;background:#14102a;color:#fff8e8;border:2px solid #3ad0ff;border-radius:8px;touch-action:none}';document.head.appendChild(st);
 addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);addEventListener('resize',size)}
const ARC=window.ARC={isOpen:()=>open,
 open(i){if(open)return;if(!ov)mk();open=1;ov.classList.add('on');try{Object.keys(keys).forEach(k=>keys[k]=0)}catch(e){}K={l:0,r:0,d:0,a:0,run:0};E={};size();last=performance.now();acc=0;if(i==null)this.menu();else this.play(i);raf=requestAnimationFrame(loop)},
 menu(){game=MENU;sel=Math.max(0,GAMES.indexOf(this.g||FL));snd2(660,.06,'square',.06)},
 play(i){const g=GAMES[i];this.g=g;if(g==FB)FB.li=cl(HI.fb||0,0,3);g.init();game=g;snd2(520,.1,'square',.08,880)},
 close(){if(!open)return;open=0;cancelAnimationFrame(raf);ov.classList.remove('on');K={};try{say('Back to the real world.')}catch(e){}}};
window.FW_ARCADE=ARC;window.FW_ARC={open:i=>ARC.open(i),close:()=>ARC.close(),game:()=>game,G:{FL,FB,RU},LV,build,step:n=>{for(let i=0;i<n;i++){game.update(1/60);E={}}},draw:()=>game.draw()};
})();
