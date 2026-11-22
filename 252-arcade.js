/* ===== v55.34.0: arcade. Two retro 2D pixel games in one overlay (global ARC, test hook FW_ARC) =====
   Fern Flap (a flap-through-the-pipes game), Fern Quest (an original platformer: hearts, gems, double jump, 4 worlds),
   (Fern Rush, a pseudo-3D runner, was removed in v55.39.0). One 400x224 canvas, one fixed-step loop, one set
   of helpers (rects, outlines, polygons, particles, screen shake); each game is a table { init, update(dt), draw() }.
   Opened by 253-furniture-interact.js (home arcade cabinet, gaming PC) and by the arcade room of the tour cities (179).
   Nothing is saved in S: best scores and unlocked worlds are in localStorage fw_arc. While it is open the 3D world is drawn
   at 10 fps (cap line in 122-graphics.js, FW_ARCADE.isOpen). */
(function(){
const W=400,H=224,TS=16,ROWS=14,GR=12,SH=3;
let HI={};try{HI=JSON.parse(localStorage.getItem('fw_arc')||'{}')}catch(e){}
const sv=()=>{try{localStorage.setItem('fw_arc',JSON.stringify(HI))}catch(e){}};
const C={ink:'#14102a',w:'#fff8e8',y:'#ffd23d',o:'#ff8a2a',r:'#e8384f',p:'#ff5fb0',pu:'#7a4ad8',b:'#3a6ad0',lb:'#5ec8ff',g:'#2fe68a',dg:'#1f9f5c',br:'#8a5a2e',gr:'#8c8c9c'};
let ov,cv,x,open=0,raf=0,last=0,acc=0,game=null,sel=0,T=0,K={l:0,r:0,d:0,a:0,run:0},E={},PT=[],SK=0;
const snd2=(f,d,t,v,f2,del)=>{try{sfx(f,d,t||'square',v||.1,f2,del||0)}catch(e){}};
const R=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))};
const TX=(s,a,b,c,al,sz)=>{x.font=(sz||8)+'px Silkscreen,ui-monospace,monospace';x.textBaseline='top';x.textAlign=al||'left';x.fillStyle=C.ink;x.fillText(s,a+1,b+1);x.fillStyle=c||C.w;x.fillText(s,a,b)};
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const best=(k,v)=>{if(v>(HI[k]||0)){HI[k]=v;sv();return 1}return 0};
const circ=(c,cx,cy,r)=>{for(let y=-r;y<=r;y++){const w=Math.floor(Math.sqrt(r*r-y*y+.5));R(c,cx-w,cy+y,w*2+1,1)}};
const poly=(c,p)=>{x.fillStyle=c;x.beginPath();p.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();x.fill()};
const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const mix=(a,b,t)=>{const p=hx(a),q=hx(b);return'rgb('+p.map((v,i)=>Math.round(v+(q[i]-v)*t)).join(',')+')'};
const shade=(c,k)=>{const p=hx(c);return'rgb('+p.map(v=>cl(Math.round(v*k),0,255)).join(',')+')'};
/* vertical colour gradient in 4 px bands (cheap, stays pixel-crisp); cols = stops from top to bottom */
function grad(cols,y0,y1,q){const c2=q||x,n=cols.length-1;for(let y=y0;y<y1;y+=4){const t=(y-y0)/(y1-y0)*n,i=Math.min(n-1,Math.floor(t));c2.fillStyle=mix(cols[i],cols[i+1],t-i);c2.fillRect(0,y,W+(q?W:0),4)}}
function puff(px,py,n,cols,sp,g,life){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=rnd(.3,1)*sp;PT.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-sp*.3,g:g==null?200:g,l:rnd(.5,1)*(life||.7),c:cols[i%cols.length],s:ri(1,2)})}}
function ptUp(dt){PT.forEach(p=>{p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt});PT=PT.filter(p=>p.l>0);if(SK>0)SK=Math.max(0,SK-dt*24)}
const ptDraw=ox=>PT.forEach(p=>R(p.c,p.x-(ox||0),p.y,p.s,p.s));
const mkc=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),(col,a,b,ww,hh)=>{const q=c.getContext('2d');q.fillStyle=col;q.fillRect(a,b,ww,hh)});return c};
const wrap=(img,off,y)=>{const w=img.width,o=-((off%w)+w)%w;for(let i=o;i<W;i+=w)x.drawImage(img,Math.round(i),y||0)};

/* ================= Fern Flap ================= */
const GY=H-30,GAP=33;
let FLB=null;
function flBg(){if(FLB)return FLB;const LWD=400;
 const far=mkc(LWD,H,(q,r)=>{for(let i=0;i<LWD;i++){const h=70+Math.sin(i/LWD*6.283*2)*26+Math.sin(i/LWD*6.283*5+1)*10;r('#b79ad8',i,GY-h,1,h);r('#cbb0e8',i,GY-h,1,2)}});
 const city=mkc(LWD,H,(q,r)=>{let bx=0,k=0;while(bx<LWD-8){const bw=ri(14,30),bh=ri(28,70),c=['#5a3a8a','#6a4a9a','#4a2a7a'][k++%3];r(c,bx,GY-bh,bw,bh);r(shade(c.length==7?c:'#5a3a8a',1.2),bx,GY-bh,bw,2);for(let wy=GY-bh+6;wy<GY-6;wy+=8)for(let wx=bx+3;wx<bx+bw-3;wx+=6)if(Math.random()<.45)r('#ffd98a',wx,wy,2,3);bx+=bw+ri(0,3)}});
 const near=mkc(LWD,H,(q,r)=>{for(let k=0;k<9;k++){const px=k*44+8,hh=ri(26,44);r('#1d6a3a',px+8,GY-hh,4,hh);for(let l=0;l<6;l++){const ly=GY-hh+l*6,lw=14-l;r('#2fa85a',px+10-lw,ly,lw,3);r('#2fa85a',px+10,ly+1,lw,3);r('#5ad88a',px+10-lw,ly,lw,1)}}});
 return FLB={far,city,near}}
const FL={n:'FERN FLAP',k:'ff',
 init(){this.b={y:104,v:0,r:0};this.p=[];this.s=0;this.st=0;this.t=0;this.d=0;this.gx=0;this.nb=0;this.fl=0;PT=[];flBg()},
 flap(){this.b.v=-215;this.fl=.18;snd2(520,.07,'square',.09,780);puff(78,this.b.y+6,4,['#fff8e8','#ffe9a0'],40,120,.5)},
 update(dt){const b=this.b;this.t+=dt;ptUp(dt);if(this.fl>0)this.fl-=dt;const sp=this.st==1?80+Math.min(46,this.s*1.6):this.st==0?44:0;this.gx+=sp*dt;
  if(this.st==0){b.y=104+Math.sin(this.t*5)*5;if(E.a){this.st=1;this.flap()}}
  else if(this.st==1){if(E.a)this.flap();b.v+=780*dt;b.y+=b.v*dt;if(b.y<8){b.y=8;b.v=0}
   if(!this.p.length||this.p[this.p.length-1].x<W-128)this.p.push({x:W+16,gy:ri(GAP+44,GY-GAP-44),ok:0});
   this.p.forEach(p=>{p.x-=sp*dt;if(!p.ok&&p.x+30<72){p.ok=1;this.s++;snd2(880,.06,'square',.08,1320);puff(72,p.gy,6,[C.y,C.w],70,150,.6)}});this.p=this.p.filter(p=>p.x>-40);
   const bb={x:71,y:b.y-5,w:11,h:10};if(b.y>GY-7||this.p.some(p=>hit(bb,{x:p.x,y:0,w:30,h:p.gy-GAP})||hit(bb,{x:p.x,y:p.gy+GAP,w:30,h:H})))this.die()}
  else{b.v+=780*dt;b.y=Math.min(GY-7,b.y+b.v*dt);this.d+=dt;if(this.d>.8&&E.a)this.init()}
  b.r=cl(b.v/300,-.5,1.3)},
 die(){this.st=2;this.d=0;this.b.v=-110;SK=6;this.nb=best('ff',this.s);snd2(220,.3,'sawtooth',.12,60);puff(78,this.b.y,14,['#ffd23d','#ff8a2a','#fff8e8'],110,200,.9)},
 pipe(px,top,len){const body='#2fa85a';R(C.ink,px-1,top,32,len);R(body,px,top,30,len);R('#5ad88a',px+3,top,5,len);R('#8af0aa',px+4,top,2,len);R('#1d6a3a',px+21,top,8,len);R('#14502c',px+26,top,3,len);
  for(let y=top+((len>0)?8:0);y<top+len;y+=14)R('#1d6a3a',px,y,30,1)},
 cap(px,y){R(C.ink,px-4,y-1,38,12);R('#2fa85a',px-3,y,36,10);R('#5ad88a',px-2,y,6,10);R('#8af0aa',px-1,y+1,2,8);R('#1d6a3a',px+24,y,9,10);R('#14502c',px+29,y,4,10);R('#14502c',px-3,y+9,36,1)},
 draw(){const t=this.t,gx=this.gx,B=flBg();grad(['#ff8ac8','#ffa890','#ffd98a','#fff0c0'],0,GY);
  circ('#fff0b0',300,64,24);circ('#ffd870',300,64,18);circ('#fff8d8',300,64,12);
  for(let i=0;i<5;i++){const cx=((i*113-t*(6+i*2))%(W+80)+W+80)%(W+80)-40,cy=22+i*19;R('#ffffffcc',cx,cy,36,7);R('#ffffffcc',cx+8,cy-5,20,5);R('#ffffff88',cx+4,cy+7,28,3)}
  wrap(B.far,gx*.08);wrap(B.city,gx*.2);wrap(B.near,gx*.5);
  this.p.forEach(p=>{const top=p.gy-GAP,bot=p.gy+GAP;this.pipe(p.x,0,top-8);this.cap(p.x,top-10);this.pipe(p.x,bot+10,GY-bot-10);this.cap(p.x,bot)});
  R('#d8a868',0,GY,W,H-GY);R('#8af06a',0,GY,W,5);R('#4cc24a',0,GY+5,W,3);R(C.ink,0,GY-1,W,1);R('#b88848',0,GY+16,W,2);
  const go=gx%24;for(let i=-1;i<W/24+2;i++){R('#c89a58',i*24-go,GY+10,12,5);R('#e8c088',i*24-go,GY+10,12,1);R('#5ab84a',i*24-go+4,GY+3,2,4);R('#5ab84a',i*24-go+14,GY+2,2,5)}
  const b=this.b;x.save();x.translate(76,Math.round(b.y));x.rotate(b.r);const fr=this.fl>0?1:this.st==1?(Math.floor(t*14)%2?2:0):Math.floor(t*8)%3;
  R('#c85a1a',-15,-2,6,4);R(C.ink,-11,-9,24,19);R('#ffd23d',-10,-8,22,17);R('#fff3b0',-9,-8,16,3);R('#ffbc2e',-10,3,22,5);R('#fff0b0',-6,2,14,5);R('#ff8a2a',-10,-4,4,6);
  R(C.w,3,-7,8,8);R(C.ink,7,-6,3,5);R(C.w,8,-6,1,2);R('#ff7a8a',1,0,3,2);R('#ff8a2a',11,-1,8,4);R('#c85a1a',11,2,8,2);R(C.ink,18,-1,1,5);
  const wy=fr==0?-8:fr==1?-3:3;R(C.ink,-9,wy-1,13,8);R('#ff9a2a',-8,wy,11,6);R('#ffd070',-8,wy,11,2);R('#c85a1a',-8,wy+4,11,2);x.restore();ptDraw();
  R('#0004',0,0,W,18);TX(this.s+'',W/2,4,C.w,'center',16);
  if(this.st==0){TX('TAP / SPACE TO FLAP',W/2,128,C.w,'center');TX('FLY THROUGH THE FERN STALKS',W/2,140,C.lb,'center')}
  if(this.st==2){R('#000b',100,50,200,100);R(C.pu,100,50,200,2);TX('GAME OVER',W/2,58,C.r,'center',16);TX('SCORE '+this.s,W/2,84,C.w,'center');TX('BEST '+(HI.ff||0)+(this.nb?'  NEW!':''),W/2,98,C.y,'center');
   const m=this.s>=30?['GOLD','#ffd23d']:this.s>=20?['SILVER','#dfe6f0']:this.s>=10?['BRONZE','#d8884a']:null;if(m){circ(C.ink,W/2-60,116,9);circ(m[1],W/2-60,116,8);circ(mix(m[1],'#ffffff',.5),W/2-62,114,3);TX(m[0]+' MEDAL',W/2+4,112,m[1],'center')}else TX('KEEP GOING',W/2,112,C.gr,'center');if(this.d>.8)TX('PRESS SPACE',W/2,132,C.lb,'center')}}};

/* ================= Fern Quest ================= */
const SOL='#bH?uT',TH={
 day:{sky:['#74cfff','#a8e6ff','#e0f6ff'],gt:'#4cc24a',gt2:'#8af06a',gd:'#8a5a30',gd2:'#6a4020',st:'#8a98a8',cr:'#c8883c',acc:'#ffd23d',nm:'MEADOW'},
 cave:{sky:['#0a0a26','#14144a','#1c1c5a'],gt:'#4a6ad8',gt2:'#8aaaff',gd:'#2a2a5a',gd2:'#1a1a40',st:'#5a5a8a',cr:'#7a5a9a',acc:'#5affea',nm:'CAVES'},
 dusk:{sky:['#3a1a6a','#9a3a8a','#ff7a5a','#ffc070'],gt:'#d8703a',gt2:'#ffa05a',gd:'#7a3a2a',gd2:'#5a2a22',st:'#9a6a7a',cr:'#b04a4a',acc:'#ffe08a',nm:'CLIFFS'},
 night:{sky:['#050818','#101a42','#22346a'],gt:'#5a8a7a',gt2:'#8ac8a8',gd:'#3a4a5a',gd2:'#2a3444',st:'#6a7a9a',cr:'#7a6a9a',acc:'#c8a8ff',nm:'TEMPLE'}};
const LV=[
 {n:'1 LEAFY MEADOW',th:'day',len:116,f(L){L.fl(0,116);L.gap(38,40);L.gap(71,74);L.bl(11,6,'?');L.bl(17,6,'b?b?b');L.pl(33,5,4);L.pil(28,1);L.pil(47,2);L.pil(57,2);L.bl(50,6,'bb');L.bl(63,6,'?b?');L.pl(68,5,5);L.bl(77,6,'bbbb');L.bl(79,3,'?');L.st(88,4,1);L.st(92,4,-1);
  [20,31,43,52,62,67,79,84,100].forEach(L.e);L.fly(55,4);L.fly(97,5);L.co(13,4,3);L.co(60,3,5);L.co(75,5,3);L.co(39,5,2);L.co(100,2,4);L.gate(110)}},
 {n:'2 CRYSTAL CAVES',th:'cave',len:128,f(L){L.fl(0,128);L.cap();L.gap(24,26);L.gap(52,55);L.gap(88,91);L.bl(12,6,'?b?');L.bl(30,6,'bbbbb');L.bl(32,3,'??');L.pil(40,2);L.pil(46,1);L.bl(60,6,'b?b');L.pl(66,5,4);L.bl(72,6,'?');L.pil(78,2);L.sp(70,3);L.sp(98,3);L.sp(104,2);L.pl(95,4,3);L.st(112,4,1);
  [16,34,43,58,69,74,82,95,100,108].forEach(L.e);L.urch(83);L.fly(36,4);L.fly(64,3);L.fly(101,5);L.co(14,4,3);L.co(31,4,5);L.co(53,5,2);L.co(89,5,2);L.co(66,3,4);L.gate(121)}},
 {n:'3 SUNSET CLIFFS',th:'dusk',len:132,f(L){L.fl(0,16);L.fl(21,35);L.fl(39,56);L.fl(61,72);L.fl(78,96);L.fl(101,132);L.bl(17,8,'bbb');L.bl(36,8,'bb');L.bl(57,8,'bb');L.bl(74,8,'bb');L.bl(97,8,'bb');
  L.bl(8,6,'?');L.bl(26,6,'b?b');L.bl(44,6,'?b?');L.pl(64,5,4);L.bl(86,6,'?b?b');L.pil(30,2);L.pil(50,1);L.sp(46,2);L.sp(83,3);L.sp(108,2);L.pil(114,2);L.st(120,4,1);
  [10,24,28,45,53,64,82,91,106,116].forEach(L.e);L.urch(88);L.fly(20,4);L.fly(60,5);L.fly(110,4);L.co(17,6,2);L.co(36,6,2);L.co(57,6,2);L.co(74,6,2);L.co(97,6,2);L.co(88,3,4);L.gate(127)}},
 {n:'4 MOON TEMPLE',th:'night',len:140,f(L){L.fl(0,140);L.cap();L.gap(20,23);L.gap(36,38);L.gap(58,62);L.gap(80,83);L.gap(104,108);L.bl(21,8,'H');L.bl(59,8,'HH');L.bl(105,8,'H');
  L.bl(10,6,'?b?');L.bl(40,6,'bb?bb');L.bl(66,6,'?');L.pl(68,4,4);L.pil(28,2);L.pil(48,2);L.pil(90,2);L.sp(31,2);L.sp(52,3);L.sp(74,3);L.sp(95,3);L.sp(112,2);L.st(118,4,1);
  [14,26,34,44,56,68,72,86,93,100,111].forEach(L.e);L.urch(76);L.urch(98);L.fly(30,4);L.fly(50,3);L.fly(84,5);L.fly(106,4);L.co(11,4,3);L.co(68,2,4);L.co(21,6,2);L.co(59,6,2);L.co(105,6,2);L.gate(133)}}];
function build(li){const d=LV[li],L={m:Array.from({length:ROWS},()=>Array(d.len).fill('.')),en:[],len:d.len,th:d.th,n:d.n,li,gems:0},m=L.m;
 L.fl=(a,b)=>{for(let c=a;c<b;c++){m[GR][c]='#';m[GR+1][c]='#'}};L.gap=(a,b)=>{for(let c=a;c<b;c++){m[GR][c]='.';m[GR+1][c]='.'}};L.cap=()=>{for(let c=0;c<d.len;c++)for(let r=0;r<=SH+1;r++)m[r][c]='H'};
 L.bl=(c,r,s)=>{for(let i=0;i<s.length;i++){m[r+SH][c+i]=s[i];if(s[i]=='?')L.gems++}};L.pl=(c,r,n)=>{for(let i=0;i<n;i++)m[r+SH][c+i]='='};L.co=(c,r,n)=>{for(let i=0;i<n;i++)if(m[r+SH][c+i]=='.'){m[r+SH][c+i]='c';L.gems++}};
 L.pil=(c,h)=>{for(let r=GR-h;r<GR;r++){m[r][c]='T';m[r][c+1]='T'}};L.sp=(c,w)=>{for(let i=0;i<w;i++)m[GR-1][c+i]='^'};
 L.st=(c,n,dir)=>{for(let i=0;i<n;i++)for(let r=0;r<=i;r++)m[GR-1-r][dir>0?c+i:c+n-1-i]='H'};
 L.e=c=>L.en.push({k:0,x:c*TS+1,y:GR*TS-11,w:14,h:11,vx:-26,vy:0,dead:0,t:Math.random()*3});
 L.urch=c=>L.en.push({k:2,x:c*TS,y:GR*TS-13,w:14,h:13,vx:22,vy:0,dead:0,t:0,hx:c*TS});
 L.fly=(c,r)=>L.en.push({k:1,x:c*TS,y:(GR-r)*TS,w:14,h:10,vx:0,vy:0,dead:0,t:Math.random()*6,hx:c*TS,y0:(GR-r)*TS});
 L.gate=c=>{L.gx=c*TS};d.f(L);L.tot=L.gems;return L}
/* theme art: sky and two parallax layers are drawn once per course, 512 px wide and seamless */
function bgOf(th){const t=TH[th],LW=512,P=Math.PI*2;
 const sky=mkc(W,H,q=>grad(t.sky,0,H,q));
 const hill=(q,col,base,amp,p1,p2,hl)=>{for(let i=0;i<LW;i++){const h=base+amp*(Math.sin(P*i*p1/LW)+.5*Math.sin(P*i*p2/LW+1.3));q.fillStyle=col;q.fillRect(i,H-h,1,h);if(hl){q.fillStyle=hl;q.fillRect(i,H-h,1,2)}}};
 let a,b;
 if(th=='day'){a=mkc(LW,H,q=>{hill(q,'#9ad8c8',110,30,2,5,'#b8ecdc')});b=mkc(LW,H,q=>{hill(q,'#5ec878',70,16,3,7,'#8ae89a');for(let k=0;k<7;k++){const px=30+k*70+ri(-10,10),hh=ri(34,56);q.fillStyle='#6a4a2a';q.fillRect(px,H-hh+8,5,hh);q.fillStyle='#2f8a4a';q.fillRect(px-12,H-hh-14,29,24);q.fillStyle='#4cc26a';q.fillRect(px-9,H-hh-18,23,14);q.fillStyle='#8af0aa';q.fillRect(px-6,H-hh-16,8,3)}})}
 else if(th=='cave'){a=mkc(LW,H,q=>{q.fillStyle='#10103a';for(let k=0;k<12;k++){const px=k*43+ri(0,18),hh=ri(30,80),w=ri(10,18);for(let r=0;r<hh;r+=2){q.fillRect(px+Math.floor(r*w/hh/2),r,w-Math.floor(r*w/hh),2)}}});b=mkc(LW,H,q=>{for(let k=0;k<8;k++){const px=24+k*62+ri(-8,8),hh=ri(26,50);for(let j=-1;j<=1;j++){const h2=hh-Math.abs(j)*12;q.fillStyle=j==0?'#5affea':'#2ab8c8';q.fillRect(px+j*7,H-h2,6,h2);q.fillStyle='#c8fff8';q.fillRect(px+j*7+1,H-h2,2,h2)}q.fillStyle='#5affea33';q.fillRect(px-14,H-hh-8,36,hh+8)}})}
 else if(th=='dusk'){a=mkc(LW,H,q=>{hill(q,'#7a2a7a',120,34,2,5,'#9a4a9a')});b=mkc(LW,H,q=>{hill(q,'#3a1a4a',64,20,3,6);for(let k=0;k<8;k++){const px=20+k*62+ri(-8,8),hh=ri(34,58);for(let r=0;r<hh;r+=3){const w=Math.floor(r*.35)+3;q.fillStyle='#2a1038';q.fillRect(px-w,H-hh+r,w*2,3)}}})}
 else{a=mkc(LW,H,q=>{hill(q,'#10163a',110,26,2,6,'#1c2850')});b=mkc(LW,H,q=>{for(let k=0;k<6;k++){const px=30+k*84+ri(-12,12),hh=ri(50,84);q.fillStyle='#1c2448';q.fillRect(px,H-hh,14,hh);q.fillStyle='#26306a';q.fillRect(px,H-hh,3,hh);q.fillRect(px-3,H-hh,20,5);if(k%2){q.fillStyle='#1c2448';q.fillRect(px+14,H-hh+8,40,12);q.fillStyle='#050818';q.fillRect(px+22,H-hh+12,24,8)}}q.fillStyle='#8aa0ff22';q.fillRect(0,H-44,LW,44)})}
 return{sky,a,b}}
const TC={};function tile(th,ch,ex){const k=th+ch+(ex||''),T0=TH[th];if(TC[k])return TC[k];const c=document.createElement('canvas');c.width=c.height=TS;const q=c.getContext('2d'),r=(col,a,b,w,h)=>{q.fillStyle=col;q.fillRect(a,b,w,h)};
 if(ch=='#'){r(T0.gd,0,0,16,16);for(let i=0;i<9;i++)r(T0.gd2,(i*7+3)%14,(i*5+6)%12+2,2,2);r(shade(T0.gd,1.2),(ex=='t'?9:4),10,2,1);
  if(ex=='t'){r(T0.gt,0,0,16,5);r(T0.gt2,0,0,16,2);r(shade(T0.gt,.7),0,5,16,1);for(let i=0;i<5;i++){r(T0.gt,i*3+1,5,2,3);r(shade(T0.gt,.8),i*3+1,7,2,1)}}}
 else if(ch=='b'){r(C.ink,0,0,16,16);r(T0.cr,1,1,14,14);r(shade(T0.cr,1.25),1,1,14,2);r(shade(T0.cr,.75),1,6,14,1);r(shade(T0.cr,.75),1,11,14,1);r(shade(T0.cr,.8),7,1,1,5);r(shade(T0.cr,.8),4,6,1,5);r(shade(T0.cr,.8),11,6,1,5);r(shade(T0.cr,.8),8,11,1,4);r(C.ink,2,2,1,1);r(C.ink,13,2,1,1);r(C.ink,2,13,1,1);r(C.ink,13,13,1,1)}
 else if(ch=='H'){r(C.ink,0,0,16,16);r(T0.st,1,1,14,14);r(shade(T0.st,1.3),1,1,14,2);r(shade(T0.st,1.3),1,1,2,14);r(shade(T0.st,.7),13,1,2,14);r(shade(T0.st,.7),1,13,14,2);r(shade(T0.st,.85),4,4,8,8);r(shade(T0.st,1.1),5,5,6,1);r(T0.gt,2,13,5,1);r(T0.gt,10,1,4,1)}
 else if(ch=='?'||ch=='u'){const u=ch=='u';r(C.ink,0,0,16,16);r(u?'#6a6a82':'#3a2a8a',1,1,14,14);r(u?'#8a8aa0':T0.acc,2,2,12,12);r(u?'#6a6a82':'#2a1a6a',3,3,10,10);r(u?'#7a7a92':'#5a4ac8',3,3,10,2);
  if(!u){r(T0.acc,6,9,4,3);r(T0.acc,5,10,1,1);r(T0.acc,9,4,1,7);r(T0.acc,9,4,4,2);r(C.w,2,2,2,2);r(C.w,12,12,2,2)}else{r('#5a5a72',6,8,4,2)}}
 else if(ch=='T'){const cap=ex.indexOf('t')>=0,rt=ex.indexOf('r')>=0;r(C.ink,0,0,16,16);r(T0.st,rt?0:1,0,rt?15:15,16);r(shade(T0.st,1.25),rt?3:3,0,3,16);r(shade(T0.st,.7),rt?10:10,0,4,16);if(!rt)r(C.ink,0,0,1,16);else r(C.ink,15,0,1,16);for(let i=3;i<16;i+=5)r(shade(T0.st,.8),2,i,12,1);r(T0.gt,rt?4:7,cap?5:10,3,2);r(T0.gt2,rt?4:7,cap?5:10,3,1);
  if(cap){r(C.ink,0,0,16,6);r(shade(T0.st,1.1),rt?0:1,1,rt?15:15,4);r(shade(T0.st,1.35),rt?0:1,1,rt?15:15,1)}}
 else if(ch=='='){r(C.ink,0,1,16,7);r(T0.cr,0,2,16,5);r(shade(T0.cr,1.3),0,2,16,1);r(shade(T0.cr,.7),0,6,16,1);r(shade(T0.cr,.8),5,2,1,4);r(shade(T0.cr,.8),11,2,1,4);r(C.ink,2,8,2,3);r(C.ink,12,8,2,3)}
 else if(ch=='^'){for(let i=0;i<2;i++){const bx=i*8;for(let j=0;j<11;j++){const w=Math.max(1,6-Math.floor(j*.55));r(C.ink,bx+4-w/2-1,15-j,w+2,1)}for(let j=0;j<10;j++){const w=Math.max(1,6-Math.floor((j+1)*.55));r(j<5?T0.acc:shade(T0.acc,.8),bx+4-Math.floor(w/2),15-j,w,1);if(w>1)r('#ffffff88',bx+4-Math.floor(w/2),15-j,1,1)}}}
 return TC[k]=c}
const solid=(L,tx,ty)=>tx<0||tx>=L.len?1:ty<0||ty>=ROWS?0:SOL.indexOf(L.m[ty][tx])>=0;
function hero(cx,fy,f,ph,air,mv,t,vy,sq){sq=sq||0;x.save();x.translate(Math.round(cx),Math.round(fy));x.scale(f*(1+sq*.6),1-sq*.8);const a=ph*Math.PI/2,sn=Math.sin(a)*mv,cs=Math.cos(a)*mv,bob=-Math.round(Math.abs(sn)*1.6),ln=mv>.5?1:0;
 let lf=Math.round(sn*4),lb=-lf,lfy=-Math.round(Math.max(0,cs)*3),lby=-Math.round(Math.max(0,-cs)*3),ax=Math.round(-sn*3);
 if(air){lf=3;lb=-3;lfy=-3;lby=-1;ax=vy<0?-2:2}
 const L1=(ox,oy,front)=>{R(C.ink,-3+ox,-8+oy,5,8);R(front?'#3a8aa8':'#2a6a8a',-2+ox,-7+oy,3,5);R(C.ink,-3+ox,-3+oy,7,3);R('#5a3a22',-2+ox,-2+oy,6,2);R('#8a5a3a',-2+ox,-2+oy,6,1)};
 L1(lb,lby,0);
 const arm=(o,front)=>{R(C.ink,-1+o,-13+bob,4,6);R(front?'#3ab0c8':'#2a8aa8',0+o,-12+bob,2,4);R('#f6c99a',0+o,-9+bob,2,2)};arm(-ax,0);
 R(C.ink,-5+ln,-15+bob,10,9);R('#3ab0c8',-4+ln,-14+bob,8,7);R('#2a7a9a',-4+ln,-9+bob,8,1);R(C.y,-1+ln,-9+bob,2,1);R('#5acce0',-4+ln,-14+bob,8,1);
 L1(lf,lfy,1);arm(ax,1);
 const sw=Math.round(Math.sin(t*20)*1.5*mv),len=mv>.5?6:3;R('#ffb02e',-5+ln,-16+bob,10,2);R('#d98a10',-5-len+ln,-15+bob+(mv>.5?sw:1),len,2);R('#ffb02e',-5-len+ln,-16+bob+(mv>.5?sw:1),len-1,1);
 R(C.ink,-6+ln,-26+bob,12,11);R('#f6c99a',-5+ln,-25+bob,10,9);R('#2fe68a',-6+ln,-28+bob,12,5);R('#1f9f5c',-6+ln,-24+bob,2,6);R('#5af0a8',-4+ln,-28+bob,6,1);
 const lw=mv>.5?-1:0;R(C.ink,-2+ln+lw,-32+bob,5,5);R('#2fe68a',-1+ln+lw,-31+bob,3,4);R('#8affc8',0+ln+lw,-31+bob,1,2);
 R(C.w,2+ln,-22+bob,3,3);R(C.ink,3+ln,-21+bob,2,2);R('#f08a7a',2+ln,-18+bob,2,1);x.restore()}
function beetle(ex,ey,t,dir,dead){if(dead){R(C.ink,ex,ey+7,14,5);R('#8a3aa8',ex+1,ey+8,12,3);R(C.w,ex+3,ey+8,2,2);R(C.w,ex+9,ey+8,2,2);return}const f=Math.floor(t*8)%2;
 R(C.ink,ex+(f?0:2),ey+8,3,3);R(C.ink,ex+(f?10:8),ey+8,3,3);R(C.ink,ex+5,ey+9,4,2);R(C.ink,ex,ey+2,14,7);R(C.ink,ex+2,ey,10,3);R('#a84ac8',ex+1,ey+3,12,5);R('#8a3aa8',ex+3,ey+1,8,3);R('#d08ae8',ex+3,ey+1,5,1);R('#6a2a88',ex+1,ey+7,12,1);R('#ffd23d',ex+6,ey+1,2,6);
 const ax=dir>0?ex+9:ex+1;R(C.w,ax,ey+4,4,3);R(C.ink,ax+(dir>0?2:0),ey+5,2,2)}
function bat(ex,ey,t,dead){if(dead){R('#5a3a8a',ex+2,ey+5,10,3);return}const w=Math.floor(t*10)%2;R(C.ink,ex+4,ey+1,6,8);R('#7a4aa8',ex+5,ey+2,4,6);R(C.ink,ex+(w?-2:0),ey+(w?0:3),6,5);R(C.ink,ex+(w?10:8),ey+(w?0:3),6,5);R('#5a3a8a',ex+(w?-1:1),ey+(w?1:4),4,3);R('#5a3a8a',ex+(w?11:9),ey+(w?1:4),4,3);R(C.r,ex+5,ey+3,1,1);R(C.r,ex+8,ey+3,1,1);R(C.w,ex+6,ey+6,1,1);R(C.w,ex+8,ey+6,1,1)}
function urchin(ex,ey,t){const sp=[[6,-2],[6,11],[-2,6],[13,6],[1,1],[11,1],[1,10],[11,10]];sp.forEach(s=>R(C.ink,ex+s[0],ey+s[1],3,3));R(C.ink,ex+1,ey+1,12,12);R('#e8586a',ex+2,ey+2,10,10);R('#ff8a9a',ex+3,ey+3,4,3);R('#a82a4a',ex+8,ey+8,4,4);R(C.w,ex+4,ey+6,2,2);R(C.w,ex+8,ey+6,2,2);R(C.ink,ex+5,ey+7,1,1);R(C.ink,ex+9,ey+7,1,1)}
function heart(a,b,full){const p=['.xx.xx.','xxxxxxx','xxxxxxx','.xxxxx.','..xxx..','...x...'];p.forEach((s,j)=>{for(let i=0;i<7;i++)if(s[i]=='x')R(full?(j==0&&(i==1)?'#ff9ab0':C.r):'#3a2a4a',a+i,b+j,1,1)});if(full)R(C.ink,a+3,b+6,1,1)}
const FB={n:'FERN QUEST',k:'fb',
 init(){this.li=this.li||0;this.hp=3;this.score=0;this.gem=0;this.st=0;this.load(this.li)},
 load(li){this.L=build(li);this.li=li;this.cp=24;this.cpOn=0;this.t=0;this.time=0;this.cam=0;this.pops=[];this.bump={};this.bg=bgOf(this.L.th);this.gem=0;this.sc0=this.score;PT=[];this.stars=Array.from({length:40},()=>({x:rnd(0,W),y:rnd(0,H*.6),p:rnd(0,6)}));this.reset(0)},
 reset(r){this.p={x:this.cp,y:GR*TS-16,w:10,h:16,vx:0,vy:0,on:0,face:1,coy:0,buf:0,inv:r?1.4:0,an:0,dj:1,mw:0,sq:0,cb:0};this.cam=cl(this.p.x-150,0,this.L.len*TS-W)},
 hurt(why){const p=this.p;if(p.inv>0||this.st)return;this.hp--;SK=5;this.hs=.08;snd2(200,.35,'sawtooth',.12,50);puff(p.x+5,p.y+8,12,[C.r,C.o,C.y],110,260,.7);
  if(this.hp<=0){this.st=3;this.d=0;this.nb=best('fbs',this.score);return}
  if(why=='pit'){this.reset(1)}else{p.inv=1.4;p.vy=-210;p.vx=-p.face*110}},
 jump(d){const p=this.p;p.vy=d?-290:-338;p.coy=0;p.on=0;p.buf=0;p.sq=-.32;if(!d)puff(p.x+5,p.y+16,5,['#ffffff88',TH[this.L.th].gt2],55,10,.35);if(d){p.dj=0;for(let i=0;i<10;i++){const a=i/10*6.283;PT.push({x:p.x+5+Math.cos(a)*3,y:p.y+16+Math.sin(a)*2,vx:Math.cos(a)*90,vy:Math.sin(a)*40,g:0,l:.3,c:i%2?'#8affc8':'#fff8e8',s:2})}puff(p.x+5,p.y+16,6,['#8affc8','#2fe68a','#fff8e8'],70,60,.5);snd2(620,.1,'square',.09,980)}else snd2(380,.12,'square',.09,720)},
 gemUp(px,py){this.gn=this.t-(this.gl||-9)<1.2?Math.min(8,(this.gn||0)+1):0;this.gl=this.t;this.gem++;this.score+=50;if(this.gem%15==0&&this.hp<5){this.hp++;this.pops.push({x:px,y:py-8,t:0,s:'+HEART'})}this.pops.push({x:px,y:py,t:0,s:'+50',c:1});puff(px,py,9,[C.y,C.w,'#8affc8'],70,40,.55);snd2(990+this.gn*70,.08,'square',.08,1480+this.gn*70)},
 update(dt){const L=this.L,p=this.p;this.t+=dt;ptUp(dt);if(this.hs>0){this.hs-=dt;return}
  if(this.st==3){this.d+=dt;if(this.d>.8&&E.a){this.hp=3;this.score=this.sc0;this.load(this.li);this.st=0}return}
  if(this.st==2){this.d+=dt;if(this.d>1.6&&E.a){if(this.li<LV.length-1){HI.fb=Math.max(HI.fb||0,this.li+1);sv();this.load(this.li+1);this.st=0}else ARC.menu()}return}
  this.time+=dt;const run=K.run?128:92,dir=(K.r?1:0)-(K.l?1:0),ac=p.on?720:420;if(p.inv>0)p.inv-=dt;
  if(dir){p.vx+=dir*ac*dt;p.face=dir;if(Math.abs(p.vx)>run)p.vx=run*Math.sign(p.vx)}else{const f=(p.on?760:160)*dt;p.vx=Math.abs(p.vx)<=f?0:p.vx-Math.sign(p.vx)*f}
  if(p.on)p.coy=.09;else p.coy-=dt;
  if(E.a){if(p.coy>0)this.jump(0);else if(p.dj>0)this.jump(1);else p.buf=.12}
  if(p.on&&p.buf>0)this.jump(0);p.buf-=dt;
  if(!K.a&&p.vy<-150)p.vy=-150;p.vy=Math.min(p.vy+980*dt,400);
  const wasOn=p.on,fv=p.vy;p.x+=p.vx*dt;this.col(0);this.pb=p.y+p.h;p.y+=p.vy*dt;p.on=0;this.col(1);if(p.on){p.dj=1;if(!wasOn){p.cb=0;if(fv>120){p.sq=Math.min(.42,fv/560);puff(p.x+5,p.y+16,5+(fv>250?4:0),['#ffffff88',TH[L.th].gt2],45,30,.4);if(fv>330)SK=Math.max(SK,2.5)}}}p.an+=Math.abs(p.vx)*dt*.1;p.mw+=((p.coy>.045&&Math.abs(p.vx)>14?1:0)-p.mw)*Math.min(1,dt*18);p.sq+=-p.sq*Math.min(1,dt*13);
  if(p.on&&Math.abs(p.vx)>40&&Math.random()<dt*14)puff(p.x+5,p.y+16,1,['#ffffff66'],20,-20,.35);
  if(p.y>H+30){this.hurt('pit');return}
  const tx0=Math.floor(p.x/TS),tx1=Math.floor((p.x+p.w-1)/TS),ty0=Math.floor(p.y/TS),ty1=Math.floor((p.y+p.h-1)/TS);
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){const ch=L.m[ty]&&L.m[ty][tx];if(ch=='c'){L.m[ty][tx]='.';this.gemUp(tx*TS+8,ty*TS)}else if(ch=='^'&&p.y+p.h>ty*TS+8)this.hurt('spike')}
  if(p.x>L.gx&&!this.st){this.st=2;this.d=0;this.tb=Math.max(0,Math.round((90+L.len*.5-this.time)*4));this.score+=this.tb+300;snd2(660,.5,'square',.12,1320);snd2(880,.5,'square',.1,1760,.12);puff(L.gx+8,GR*TS-24,24,['#c8a8ff','#fff8e8','#8affc8'],120,0,1.2);return}
  L.en.forEach(e=>{if(e.dead){e.dead-=dt;return}if(Math.abs(e.x-this.cam-W/2)>W/2+60)return;e.t+=dt;
   if(e.k==1){e.x=e.hx+Math.sin(e.t*1.1)*46;e.y=e.y0+Math.sin(e.t*2.2)*12;e.vx=Math.cos(e.t*1.1)}
   else{e.vy=Math.min(e.vy+900*dt,300);e.y+=e.vy*dt;this.ecol(e,1);e.x+=e.vx*dt;if(this.ecol(e,0))e.vx=-e.vx;if(e.k==0&&e.vy==0&&!solid(L,Math.floor((e.x+(e.vx>0?e.w+1:-1))/TS),Math.floor((e.y+e.h+2)/TS)))e.vx=-e.vx;if(e.k==2&&Math.abs(e.x-e.hx)>28)e.vx=-e.vx;if(e.y>H+30)e.dead=.01}
   if(hit(p,e)&&p.inv<=0){if(e.k!=2&&p.vy>0&&p.y+p.h-e.y<(e.k==1?8:10)){e.dead=.5;p.vy=K.a?-285:-200;p.dj=1;p.sq=-.25;p.cb=Math.min(4,p.cb+1);this.hs=.07;SK=Math.max(SK,3);this.score+=100*p.cb;this.pops.push({x:e.x,y:e.y,t:0,s:''+100*p.cb,c:p.cb>1});puff(e.x+7,e.y+5,14,['#c8a8ff','#fff8e8',C.y],95,120,.55);snd2(300,.12,'square',.1,120)}else this.hurt('foe')}});
  L.en=L.en.filter(e=>e.dead>=0||!e.dead);
  if(!this.cpOn&&p.x>L.len*TS/2){this.cpOn=1;this.cp=Math.floor(L.len/2)*TS;this.pops.push({x:p.x,y:p.y-14,t:0,s:'CHECKPOINT'});snd2(520,.1,'triangle',.1,780);puff(p.x+5,p.y,10,[C.y,C.w],80,60,.7)}
  this.pops.forEach(o=>o.t+=dt);this.pops=this.pops.filter(o=>o.t<.9);Object.keys(this.bump).forEach(k=>{this.bump[k]-=dt;if(this.bump[k]<=0)delete this.bump[k]});
  this.cam+=(cl(p.x-150+p.face*20,0,L.len*TS-W)-this.cam)*Math.min(1,dt*7)},
 col(vert){const L=this.L,p=this.p;const tx0=Math.floor(p.x/TS),tx1=Math.floor((p.x+p.w-1)/TS),ty0=Math.floor(p.y/TS),ty1=Math.floor((p.y+p.h-1)/TS);
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){const ch=tx<0||tx>=L.len?'H':ty<0||ty>=ROWS?'.':L.m[ty][tx];
   if(ch=='='){if(!vert||p.vy<=0||this.pb>ty*TS+1.5||K.d)continue}else if(SOL.indexOf(ch)<0)continue;
   if(!vert){p.x=p.vx>0?tx*TS-p.w:(tx+1)*TS;p.vx=0;return this.col(0)}
   if(p.vy>0){p.y=ty*TS-p.h;p.vy=0;p.on=1}else if(p.vy<0){p.y=(ty+1)*TS;p.vy=0;this.head(tx,ty)}return}},
 head(tx,ty){const L=this.L,ch=L.m[ty]&&L.m[ty][tx];this.bump[tx+','+ty]=.15;if(ch=='?'){L.m[ty][tx]='u';this.gemUp(tx*TS+8,ty*TS-6);puff(tx*TS+8,ty*TS,8,[TH[L.th].acc,C.w],70,100,.5)}else snd2(160,.05,'square',.08)},
 ecol(e,vert){const L=this.L,vy0=e.vy;const tx0=Math.floor(e.x/TS),tx1=Math.floor((e.x+e.w-1)/TS),ty0=Math.floor(e.y/TS),ty1=Math.floor((e.y+e.h-1)/TS);let h=0;
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++)if(solid(L,tx,ty)){h=1;if(vert){if(vy0>0)e.y=ty*TS-e.h;else e.y=(ty+1)*TS;e.vy=0}else e.x=e.vx>0?tx*TS-e.w:(tx+1)*TS}return h&&!vert},
 draw(){const L=this.L,th=TH[L.th],cam=Math.round(this.cam),t=this.t,p=this.p,B=this.bg;x.drawImage(B.sky,0,0);
  if(L.th=='night'||L.th=='cave'){this.stars.forEach(s=>{const a=.5+.5*Math.sin(t*2+s.p);R(a>.6?'#ffffff':'#ffffff66',s.x,s.y,a>.9?2:1,a>.9?2:1)});if(L.th=='night'){circ('#e8eeff',320,44,16);circ('#c8d4f0',326,40,12);circ('#ffffff',314,38,3)}}
  if(L.th=='dusk'){circ('#ffe0a0',90,96,26);circ('#fff0c8',90,96,20);for(let i=0;i<3;i++){const bx=((t*20+i*140)%(W+60))-30,by=40+i*14+Math.sin(t*3+i)*3;R(C.ink,bx,by,2,1);R(C.ink,bx+2,by+1,2,1);R(C.ink,bx+4,by,2,1)}}
  if(L.th=='day')for(let i=0;i<4;i++){const cx=((i*140-t*8-cam*.1)%(W+90)+W+90)%(W+90)-45,cy=26+i*22;R('#ffffff',cx,cy,40,8);R('#ffffff',cx+8,cy-6,22,6);R('#d8ecf8',cx+2,cy+6,36,3)}
  wrap(B.a,cam*.15);wrap(B.b,cam*.4);
  const c0=Math.floor(cam/TS),pc=this.cpOn;
  for(let cx=c0;cx<=c0+W/TS+1&&cx<L.len;cx++)for(let ry=0;ry<ROWS;ry++){const ch=L.m[ry][cx];if(ch=='.')continue;const sx=cx*TS-cam,sy=ry*TS;
   if(ch=='c'){const w=Math.abs(Math.cos(t*5+cx*.7))*5+2,bob=Math.sin(t*3+cx)*1.5;R(C.ink,sx+8-w/2-1,sy+2+bob,w+2,12);R('#2ab8c8',sx+8-w/2,sy+3+bob,w,10);R('#8af0ff',sx+8-w/2,sy+3+bob,Math.min(w,3),5);R(C.w,sx+7,sy+4+bob,1,1);continue}
   const b=this.bump[cx+','+ry];let ex='';if(ch=='T'){ex=(L.m[ry-1]&&L.m[ry-1][cx]=='T'?'':'t')+(L.m[ry][cx+1]=='T'?'':'r')}if(ch=='#')ex=ry==GR?'t':'';
   x.drawImage(tile(L.th,ch,ex),sx,sy-(b?Math.sin(b/.15*Math.PI)*4:0))}
  /* checkpoint lantern and exit gate */
  {const lx=Math.floor(L.len/2)*TS-cam+24;R('#4a3a2a',lx,GR*TS-30,2,30);R(C.ink,lx-3,GR*TS-38,8,9);R(pc?'#ffd23d':'#5a5a6a',lx-2,GR*TS-37,6,7);if(pc){R('#ffd23d33',lx-12,GR*TS-46,28,24);R(C.w,lx,GR*TS-35,1,2)}}
  {const gx=L.gx-cam,gy=GR*TS,pul=Math.sin(t*4)*2;R(C.ink,gx-3,gy-56,26,56);R('#6a7a9a',gx-2,gy-55,6,55);R('#6a7a9a',gx+14,gy-55,6,55);R('#6a7a9a',gx-2,gy-56,24,6);R('#8a9aba',gx-2,gy-56,24,2);
   R('#5a3aa8',gx+4,gy-50,10,50);for(let i=0;i<5;i++){const a=t*3+i*1.3;R(i%2?'#c8a8ff':'#8affc8',gx+9+Math.sin(a)*4-1,gy-8-((t*30+i*11)%46),2,2)}R('#c8a8ff',gx+6+pul/2,gy-48,6-pul,48);R('#fff8e8',gx+8,gy-46,2,46);TX('EXIT',gx+9,gy-68,C.y,'center')}
  L.en.forEach(e=>{const ex=Math.round(e.x-cam),ey=Math.round(e.y);if(ex<-20||ex>W+20)return;if(e.k==0)beetle(ex,ey,e.t,e.vx>0?1:-1,e.dead);else if(e.k==1)bat(ex,ey,e.t,e.dead);else urchin(ex,ey,e.t)});
  if(this.st!=3&&(p.inv<=0||Math.floor(t*14)%2||this.st==2))hero(p.x+5-cam,p.y+16,p.face,p.an,p.coy<.045,p.mw,t,p.vy,p.sq);
  ptDraw(cam);this.pops.forEach(o=>TX(o.s,o.x-cam,o.y-o.t*26,o.c?C.y:C.w,'center'));
  R('#000a',0,0,W,17);for(let i=0;i<5;i++)if(i<Math.max(3,this.hp))heart(6+i*10,5,i<this.hp);R('#2ab8c8',68,4,7,9);R('#8af0ff',69,5,2,4);TX('x'+this.gem,80,5,C.w);TX('SCORE '+String(this.score).padStart(6,'0'),136,5,C.w);TX('TIME '+Math.floor(this.time),226,5,C.lb);TX(L.n,W-5,5,C.y,'right');
  if(this.t<2.6&&this.st==0){TX('WORLD '+L.n,W/2,84,C.w,'center',16);TX('ARROWS MOVE · SPACE JUMP (TWICE!) · SHIFT RUN · DOWN DROPS',W/2,108,C.lb,'center')}
  if(this.st==2){R('#000b',90,56,220,112);R(C.pu,90,56,220,2);TX('WORLD CLEAR!',W/2,64,C.y,'center',16);const pc2=this.gem/Math.max(1,L.tot),stars=pc2>=.9?3:pc2>=.5?2:1;for(let i=0;i<3;i++)TX(i<stars?'*':'.',W/2-24+i*24,86,i<stars?C.y:C.gr,'center',16);
   TX('GEMS '+this.gem+'/'+L.tot,W/2,112,C.w,'center');TX('TIME BONUS '+this.tb+' + 300',W/2,126,C.g,'center');TX(this.li<LV.length-1?'NEXT: '+LV[this.li+1].n:'YOU WON THE QUEST!',W/2,140,C.lb,'center');if(this.d>1.6)TX('PRESS SPACE',W/2,154,C.lb,'center')}
  if(this.st==3){R('#000b',100,60,200,86);R(C.r,100,60,200,2);TX('OUCH! OUT OF HEARTS',W/2,68,C.r,'center');TX('SCORE '+this.score+(this.nb?'  NEW BEST!':''),W/2,92,C.w,'center');TX('BEST '+(HI.fbs||0),W/2,106,C.y,'center');if(this.d>.8)TX('SPACE: TRY THE WORLD AGAIN',W/2,124,C.lb,'center')}}};

/* ================= menu + shell ================= */
const CX=200,GAMES=[FL,FB],NAMES=['FERN FLAP','FERN QUEST'],SUB=['FLAP THROUGH THE STALKS','HEARTS GEMS DOUBLE JUMP'];
const SNAP={};
/* the menu shows still pictures of the real games: each is drawn once into an offscreen canvas by running the game's own draw() */
function snap(i){if(SNAP[i])return SNAP[i];const c=document.createElement('canvas');c.width=W;c.height=H;const sx=x;x=c.getContext('2d');x.imageSmoothingEnabled=false;
 try{if(i==0){FL.init();FL.st=1;FL.s=7;FL.t=1.2;FL.gx=180;FL.b.y=96;FL.b.v=-60;FL.b.r=-.2;FL.p=[{x:200,gy:92,ok:0},{x:330,gy:132,ok:0}];FL.draw()}
  else if(i==1){FB.li=0;FB.init();FB.t=3;FB.cam=150;FB.p.x=FB.cam+150;FB.p.on=1;FB.p.vx=90;FB.p.an=1;FB.score=1250;FB.gem=12;FB.time=34;FB.draw()}
  }catch(e){console.error('arcade snapshot',e)}
 x=sx;PT=[];SK=0;return SNAP[i]=c}
const MENU={n:'MENU',
 update(){},
 draw(){grad(['#0a0626','#1a0a46','#3a0a5a'],0,H);for(let i=0;i<60;i++)R(i%4?'#ffffff66':'#ffffff',(i*67)%W,(i*31)%110,1,1);
  circ('#ff5fb044',200,118,70);circ('#ff8a6a',200,118,44);for(let r=-10;r<44;r+=7)R('#3a0a5a',156,118+r,88,2);
  const hz=130;R('#12082e',0,hz,W,H-hz);for(let i=0;i<=20;i++){x.strokeStyle='#ff5fb066';x.lineWidth=1;x.beginPath();x.moveTo(CX,hz);x.lineTo((i-10)*60+CX,H);x.stroke()}
  for(let k=0;k<7;k++)R('#ff5fb066',0,hz+Math.pow(k/7,2)*(H-hz),W,1);
  TX('WAVEFERN',W/2+2,12,'#7a1a8a','center',24);TX('WAVEFERN',W/2,10,C.g,'center',24);TX('ARCADE',W/2+1,37,C.p,'center',16);TX('ARCADE',W/2,36,C.y,'center',16);
  GAMES.forEach((g,i)=>{const cw=112,cx=81+i*(cw+14),cy=66+(i==sel?-4:0),s=i==sel;R(s?C.y:'#4a3a8a',cx-3,cy-3,cw+6,106);R('#14102a',cx,cy,cw,100);R(s?'#ff5fb0':'#2a1a5a',cx,cy,cw,2);
   x.imageSmoothingEnabled=true;x.drawImage(snap(i),0,0,W,H,cx+4,cy+4,cw-8,58);x.imageSmoothingEnabled=false;R(C.ink,cx+3,cy+3,cw-6,1);R(C.ink,cx+3,cy+62,cw-6,1);
   TX(NAMES[i],cx+cw/2,cy+68,s?C.y:C.w,'center');TX(SUB[i],cx+cw/2,cy+80,C.lb,'center',6);TX('BEST '+(HI[i==1?'fbs':g.k]||0),cx+cw/2,cy+90,s?C.g:C.gr,'center',8)});
  if(Math.floor(T*2)%2)TX('PRESS SPACE TO PLAY',W/2,190,C.w,'center');TX('LEFT/RIGHT CHOOSE · ESC EXIT',W/2,206,C.gr,'center',6)}};
const KM={arrowleft:'l',a:'l',arrowright:'r',d:'r',arrowdown:'d',s:'d',' ':'a',w:'a',arrowup:'a',z:'a',enter:'a',shift:'run',x:'run'};
function kd(e){if(!open)return;const k=e.key.toLowerCase();e.stopImmediatePropagation();if(k=='escape'){e.preventDefault();return game==MENU?ARC.close():ARC.menu()}
 const m=KM[k];if(m){e.preventDefault();if(!K[m]&&!e.repeat)edge(m);K[m]=1}}
function ku(e){if(!open)return;const m=KM[e.key.toLowerCase()];if(m)K[m]=0;e.stopImmediatePropagation()}
function edge(m){E[m]=1;if(game==MENU){if(m=='l'||m=='r')sel=1-sel;if(m=='a')ARC.play(sel)}}
function size(){if(!cv)return;const k=Math.max(1,Math.min((innerWidth-16)/W,(innerHeight-(document.body.classList.contains('tch')?150:70))/H));cv.style.width=Math.floor(W*k)+'px';cv.style.height=Math.floor(H*k)+'px'}
function loop(n){if(!open)return;raf=requestAnimationFrame(loop);const dt=Math.min(.1,(n-last)/1000);last=n;acc+=dt;T+=dt;let s=0;
 while(acc>=1/60&&s++<6){game.update(1/60);acc-=1/60;E={}}if(s>=6)acc=0;
 x.imageSmoothingEnabled=false;x.save();if(SK>.3)x.translate(ri(-SK,SK)|0,ri(-SK,SK)|0);game.draw();x.restore()}
function mk(){ov=document.createElement('div');ov.id='arc';ov.innerHTML='<div class=arb><canvas width='+W+' height='+H+'></canvas><div class=arp><button data-k=l>◀</button><button data-k=d>▼</button><button data-k=a>▲ A</button><button data-k=r>▶</button></div></div>';document.body.appendChild(ov);
 cv=ov.querySelector('canvas');x=cv.getContext('2d');
 ov.querySelectorAll('button').forEach(b=>{const m=b.dataset.k,dn=e=>{e.preventDefault();if(!K[m])edge(m);K[m]=1},up=e=>{e.preventDefault();K[m]=0};b.addEventListener('pointerdown',dn);b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up)});
 cv.addEventListener('pointerdown',e=>{e.preventDefault();if(game==MENU){const r=cv.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*W;const i=Math.floor((px-78)/126);if(i>=0&&i<2){if(sel==i)ARC.play(i);else sel=i}}else if(game==FL)edge('a')});
 const st=document.createElement('style');st.textContent='#arc{position:fixed;inset:0;z-index:99990;background:#06040dee;display:none;align-items:center;justify-content:center;touch-action:none;user-select:none}#arc.on{display:flex}.arb{display:flex;flex-direction:column;align-items:center;gap:8px}#arc canvas{image-rendering:pixelated;border:4px solid #ff5fb0;box-shadow:0 0 0 4px #14102a,0 0 28px #ff5fb066,0 0 60px #3ad0ff33;border-radius:6px;background:#000;touch-action:none}.arp{display:none;gap:8px}body.tch .arp{display:flex}.arp button{font:14px Silkscreen,monospace;padding:14px 18px;background:#14102a;color:#fff8e8;border:2px solid #3ad0ff;border-radius:8px;touch-action:none}';document.head.appendChild(st);
 addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);addEventListener('resize',size)}
const ARC=window.ARC={isOpen:()=>open,
 open(i){if(open)return;if(!ov)mk();open=1;ov.classList.add('on');try{Object.keys(keys).forEach(k=>keys[k]=0)}catch(e){}K={l:0,r:0,d:0,a:0,run:0};E={};size();last=performance.now();acc=0;if(i==null)this.menu();else this.play(i);raf=requestAnimationFrame(loop)},
 menu(){game=MENU;PT=[];SK=0;sel=Math.max(0,GAMES.indexOf(this.g||FL));snd2(660,.06,'square',.06)},
 play(i){const g=GAMES[i];this.g=g;if(g==FB)FB.li=cl(HI.fb||0,0,3);SK=0;g.init();game=g;snd2(520,.1,'square',.08,880)},
 close(){if(!open)return;open=0;cancelAnimationFrame(raf);ov.classList.remove('on');K={};try{say('Back to the real world.')}catch(e){}}};
window.FW_ARCADE=ARC;window.FW_ARC={open:i=>ARC.open(i),close:()=>ARC.close(),game:()=>game,G:{FL,FB},LV,build,step:n=>{for(let i=0;i<n;i++){game.update(1/60);E={}}},draw:()=>game.draw()};
})();
