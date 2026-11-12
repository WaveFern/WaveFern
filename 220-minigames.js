/* ---------- v49.98.0: ten song minigames, unlocked by Studio Level ----------
   Making a song is now a short run of arcade minigames (max 15 s each) instead of the fixed Beat, Lyrics, Mix steps.
   Studio Level (GT in 219-gear-tiers.js) sets how many of the 10 are unlocked (1, 2, 4, 6, 8, 10) and how many a song uses (1 to 6, random, no repeats).
   Difficulty is the same at every level. Every game ends with a score from 0 to 1; the average goes into mgFinish (34-studio-minigames.js)
   as the old Lyrics and Mix scores, so the existing quality formula, gear bonuses, perfect-song and release code keep working.
   A bigger Studio Level also raises the quality ceiling: a great run adds up to GT.qMax(level) quality.
   Band rooms (rec.band), trailers and any recording that already left step 0 keep the old Beat, Lyrics, Mix flow.
   Hooks: recTick (outermost wrapper), mgDraw, mgFinish, recMenu. */
(()=>{
const W=400,H=210,G='#2fe68a',GOLD='#f2b632',RED='#ff4455',BLU='#5aa8ff',DK='#050807',FNT="bold 13px Silkscreen,ui-monospace,monospace";
const ORDER=['beat','tempo','catch','sample','mix','crowd','memory','vinyl','scratch','melody'];
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),shuf=a=>{for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const NOTE=[262,294,330,392,440,523,587,659,784];
const tone=(i,d=.18)=>{try{sfx(NOTE[i%NOTE.length],d,'triangle',.14)}catch(e){}};
const good=()=>{try{snd('cash')}catch(e){}},bad=()=>{try{snd('err')}catch(e){}},tick=()=>{try{snd('click')}catch(e){}};
const txt=(c,s,x,y,col='#fff',al='center',f=FNT)=>{c.font=f;c.textAlign=al;c.fillStyle=col;c.fillText(s,x,y)};
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
const grid=c=>{R(c,0,0,W,H,DK);c.fillStyle='#0e1511';for(let x=0;x<W;x+=20)c.fillRect(x,0,1,H);for(let y=0;y<H;y+=20)c.fillRect(0,y,W,1)};
const G_={};
/* each game: n, how, dur, init(g), tick(g,dt) , draw(g,c), key(g,k), down(g,x,y), move(g,x,y), up(g), score(g) (0..1) */

/* 1 Beat Match: notes slide in from the right, press when one sits on the line */
G_.beat={n:'Beat Match',how:'Press SPACE or tap when a note hits the line.',dur:13.5,
 init(g){g.N=Array.from({length:12},(_,i)=>({t:1.3+i*.92+rnd(-.08,.08),h:-1}));g.fb='';g.ft=0},
 tick(g,dt){g.ft-=dt;g.N.forEach(n=>{if(n.h<0&&g.t-n.t>.28){n.h=0;g.fb='MISS';g.ft=.4;bad()}})},
 hit(g){const n=g.N.filter(n=>n.h<0).sort((a,b)=>Math.abs(a.t-g.t)-Math.abs(b.t-g.t))[0];if(!n||Math.abs(n.t-g.t)>.3){tick();return}const d=Math.abs(n.t-g.t);n.h=d<.08?1:d<.16?.7:.35;g.fb=d<.08?'PERFECT':d<.16?'GOOD':'OK';g.ft=.4;try{snd(d<.08?'perfect':d<.16?'great':'good')}catch(e){}},
 key(g,k){if(k==' '||k=='enter'||k=='e')this.hit(g)},down(g){this.hit(g)},
 draw(g,c){grid(c);R(c,0,100,W,4,'#1d2a22');R(c,66,60,4,84,G);g.N.forEach(n=>{if(n.h>=0&&n.h!=0){return}const x=70+(n.t-g.t)*170;if(x<-10||x>W+10)return;R(c,x-9,91,18,22,n.h==0?'#552':BLU)});
  if(g.ft>0)txt(c,g.fb,68,50,g.fb=='MISS'?RED:GOLD);txt(c,Math.round(this.score(g)*100)+'%',W-10,24,G,'right')},
 score:g=>g.N.reduce((a,n)=>a+Math.max(0,n.h),0)/g.N.length};

/* 2 Sound Catcher: catch the notes, dodge the static */
G_.catch={n:'Sound Catcher',how:'Move with the mouse, finger or arrow keys. Catch notes, dodge the red static.',dur:13,
 init(g){g.px=W/2;g.tx=W/2;g.I=Array.from({length:16},(_,i)=>({t:.6+i*.72,x:rnd(30,W-30),bad:Math.random()<.28,y:-20,d:0}));g.gt=g.I.filter(i=>!i.bad).length;g.ok=0;g.hit=0;g.L=0;g.R=0},
 tick(g,dt){const kd=(g.R?1:0)-(g.L?1:0);if(kd){g.px+=kd*260*dt;g.tx=g.px}else g.px+=(g.tx-g.px)*Math.min(1,dt*14);g.px=cl(g.px,20,W-20);
  g.I.forEach(i=>{if(i.d||g.t<i.t)return;i.y=-20+(g.t-i.t)*135;if(i.y>H-34&&Math.abs(i.x-g.px)<32){i.d=1;if(i.bad){g.hit++;bad()}else{g.ok++;tone(ri(0,7),.15)}}else if(i.y>H+10)i.d=2})},
 key(g,k,up){const d=!up;if(k=='arrowleft'||k=='a')g.L=d;if(k=='arrowright'||k=='d')g.R=d},move(g,x){g.tx=x},down(g,x){g.tx=x},
 draw(g,c){grid(c);g.I.forEach(i=>{if(i.d||g.t<i.t)return;if(i.bad){R(c,i.x-9,i.y-9,18,18,RED);txt(c,'x',i.x,i.y+5,'#000')}else{R(c,i.x-4,i.y-12,4,20,GOLD);R(c,i.x-10,i.y+4,10,8,GOLD)}});
  R(c,g.px-30,H-30,60,16,G);R(c,g.px-30,H-34,6,6,G);R(c,g.px+24,H-34,6,6,G);txt(c,'♪ '+g.ok+'  static '+g.hit,10,22,'#fff','left')},
 score:g=>cl((g.ok-.7*g.hit)/g.gt)};

/* 3 Rhythm Memory: watch the pad flash, tap the same rhythm back */
G_.memory={n:'Rhythm Memory',how:'Watch the pad, then tap the same rhythm. SPACE or click.',dur:14,
 init(g){g.r=0;g.res=[];this.round(g)},
 round(g){const k=g.r?5:4;let t=.6;g.E=[t];for(let i=1;i<k;i++){t+=[.35,.5,.7][ri(0,2)];g.E.push(t)}g.ph=0;g.rt=0;g.T=[];g.fl=0;g.S=null},
 tick(g,dt){g.rt+=dt;g.fl-=dt;if(g.ph==0){g.E.forEach((e,i)=>{if(g.rt>=e&&!(g.S&&g.S[i])){(g.S=g.S||[])[i]=1;g.fl=.2;tone(2,.15)}});if(g.rt>g.E[g.E.length-1]+.7){g.ph=1;g.rt=0;g.S=null}}
  else if(g.ph==1){if(g.T.length>=g.E.length||g.rt>g.E[g.E.length-1]+2.2)this.end(g)}else if(g.ph==2&&g.rt>.7){g.r++;if(g.r>=2)g.over=1;else this.round(g)}},
 end(g){const k=g.E.length;let s=0;for(let i=0;i<k;i++)if(g.T[i]!=null){const err=Math.abs((g.T[i]-g.T[0])-(g.E[i]-g.E[0]));s+=cl(1-err/.3)}g.res.push(s/k);g.ph=2;g.rt=0;g.last=s/k},
 hit(g){if(g.ph!=1)return;if(g.T.length<g.E.length){g.T.push(g.rt);g.fl=.15;tone(2,.15)}},
 key(g,k){if(k==' '||k=='enter'||k=='e')this.hit(g)},down(g){this.hit(g)},
 draw(g,c){grid(c);const on=g.fl>0;R(c,W/2-50,50,100,100,on?(g.ph==0?GOLD:G):'#1d2a22');R(c,W/2-50,50,100,6,'#000');
  txt(c,g.ph==0?'WATCH':g.ph==1?'YOUR TURN  '+g.T.length+'/'+g.E.length:Math.round(g.last*100)+'%',W/2,32,g.ph==1?G:'#fff');txt(c,'Round '+(g.r+1)+'/2',W/2,H-14,'#8aa094')},
 score:g=>g.res.length?g.res.reduce((a,b)=>a+b,0)/2:0};

/* 4 DJ Scratch: drag the record the way the arrow says */
G_.scratch={n:'DJ Scratch',how:'Drag the record the way the arrow points (or use the arrow keys).',dur:13,
 init(g){g.D=Array.from({length:7},()=>Math.random()<.5?-1:1);g.i=0;g.st=0;g.ok=0;g.sx=null;g.cd=0;g.rot=0;g.fb='';g.ft=0},
 res(g,dir){if(g.cd>0||g.i>=g.D.length)return;if(dir==g.D[g.i]){g.ok+=g.st<.9?1:.8;g.fb='NICE';try{snd('great')}catch(e){}}else{g.fb='WRONG WAY';bad()}g.ft=.4;g.i++;g.st=0;g.cd=.25;if(g.i>=g.D.length)g.over=1},
 tick(g,dt){g.cd-=dt;g.ft-=dt;if(g.i<g.D.length&&g.cd<=0){g.st+=dt;if(g.st>1.7){g.fb='TOO SLOW';g.ft=.4;bad();g.i++;g.st=0;g.cd=.25;if(g.i>=g.D.length)g.over=1}}g.rot*=Math.pow(.02,dt)},
 key(g,k){if(k=='arrowleft'||k=='a')this.res(g,-1);if(k=='arrowright'||k=='d')this.res(g,1)},
 down(g,x){g.sx=x},move(g,x){if(g.sx==null)return;const dx=x-g.sx;g.rot=dx/30;if(Math.abs(dx)>=60){this.res(g,dx>0?1:-1);g.sx=x}},up(g){g.sx=null},
 draw(g,c){grid(c);const cx=W/2,cy=112;c.save();c.translate(cx,cy);c.rotate(g.rot*.5+g.t*.6);c.fillStyle='#111';c.beginPath();c.arc(0,0,70,0,7);c.fill();c.strokeStyle='#2a352e';for(let r=20;r<70;r+=12){c.beginPath();c.arc(0,0,r,0,7);c.stroke()}c.fillStyle=G;c.beginPath();c.arc(0,0,18,0,7);c.fill();R(c,-3,-70,6,14,GOLD);c.restore();
  g.D.forEach((d,i)=>txt(c,d<0?'◀':'▶',cx-((g.D.length-1)/2-i)*34,28,i<g.i?'#2a352e':i==g.i?GOLD:'#8aa094'));if(g.ft>0)txt(c,g.fb,cx,H-8,g.fb=='NICE'?G:RED);
  if(g.i<g.D.length)R(c,20,H-20,(1-g.st/1.7)*(W-40),4,G)},
 score:g=>g.ok/g.D.length};

/* 5 Perfect Mix: set the three faders inside the target bands, twice */
G_.mix={n:'Perfect Mix',how:'Drag each fader into its green band. The bands move once, so set them again.',dur:12.5,
 init(g){g.v=[.5,.5,.5];g.T=[rnd(.2,.8),rnd(.2,.8),rnd(.2,.8)];g.sel=-1;g.ch=0;g.res=[];g.k=0},
 chk(g){const s=g.v.reduce((a,v,i)=>a+(Math.abs(v-g.T[i])<.07?1:cl(1-Math.abs(v-g.T[i])/.2)),0)/3;g.res.push(s);g.ch++;if(g.ch==1){g.T=g.T.map(()=>rnd(.15,.85));try{snd('great')}catch(e){}}else g.over=1},
 tick(g,dt){if(g.ch==0&&g.t>=5.8)this.chk(g);else if(g.ch==1&&g.t>=12)this.chk(g)},
 set(g,x,y){if(g.sel<0)return;g.v[g.sel]=cl(1-(y-30)/150)},
 down(g,x,y){g.sel=cl(Math.round((x-100)/100),0,2);this.set(g,x,y)},move(g,x,y){this.set(g,x,y)},up(g){g.sel=-1},
 key(g,k){const n=parseInt(k);if(n>=1&&n<=3)g.k=n-1;if(k=='arrowup')g.v[g.k]=cl(g.v[g.k]+.04);if(k=='arrowdown')g.v[g.k]=cl(g.v[g.k]-.04)},
 draw(g,c){grid(c);['BASS','VOCAL','SYNTH'].forEach((n,i)=>{const x=100+i*100,ok=Math.abs(g.v[i]-g.T[i])<.07;R(c,x-3,30,6,150,'#1d2a22');R(c,x-16,30+(1-g.T[i]-.07)*150,32,.14*150,'#16603f');R(c,x-14,30+(1-g.v[i])*150-5,28,10,ok?G:'#fff');txt(c,n,x,H-12,ok?G:'#8aa094')});
  txt(c,'Mix '+Math.min(2,g.ch+1)+'/2',10,20,'#fff','left');const end=g.ch?12:5.8;R(c,W-110,12,100*cl((end-g.t)/(g.ch?6.2:5.8)),5,GOLD)},
 score:g=>g.res.length?g.res.reduce((a,b)=>a+b,0)/2:0};

/* 6 Melody Builder: tap the tiles from lowest note to highest */
G_.melody={n:'Melody Builder',how:'Tap the tiles from the lowest note to the highest.',dur:14,
 init(g){g.r=0;g.sc=[];this.round(g)},
 round(g){const n=g.r?6:5;const p=shuf([0,1,2,3,4,5,6,7].slice()).slice(0,n);g.P=p;g.nx=0;g.er=0;g.sorted=p.slice().sort((a,b)=>a-b);g.bad=-1;g.bt=0},
 fin(g){g.sc.push(Math.max(0,1-g.er*.2));g.r++;if(g.r>=2)g.over=1;else this.round(g)},
 down(g,x){const n=g.P.length,w=(W-20)/n,i=Math.floor((x-10)/w);if(i<0||i>=n)return;if(g.P[i]<0)return;if(g.P[i]==g.sorted[g.nx]){tone(g.P[i],.25);g.P[i]=-1-g.P[i];g.nx++;if(g.nx>=n)this.fin(g)}else{g.er++;g.bad=i;g.bt=.3;bad()}},
 key(g,k){const n=parseInt(k);if(n>=1&&n<=g.P.length)this.down(g,10+(n-.5)*(W-20)/g.P.length)},
 tick(g,dt){g.bt-=dt},
 draw(g,c){grid(c);const n=g.P.length,w=(W-20)/n;g.P.forEach((p,i)=>{const done=p<0,v=done?-1-p:p,h=30+v*14,x=10+i*w+4;R(c,x,H-26-h,w-8,h,g.bad==i&&g.bt>0?RED:done?'#16603f':BLU);txt(c,i+1,x+(w-8)/2,H-10,'#8aa094')});txt(c,'Melody '+(g.r+1)+'/2 · mistakes '+g.er,10,20,'#fff','left')},
 score:g=>(g.sc.reduce((a,b)=>a+b,0)+(g.r<2&&g.nx>0?Math.max(0,1-g.er*.2)*g.nx/g.P.length:0))/2};

/* 7 Vinyl Rush: tap to keep the record at 33 RPM */
G_.vinyl={n:'Vinyl Rush',how:'Tap SPACE or the screen to keep the record inside the green band.',dur:12,
 init(g){g.v=1;g.in=0;g.k=rnd(1.5,2.5);g.pr=1.5},
 tick(g,dt){g.v-=g.v*.35*dt;g.k-=dt;if(g.k<=0){g.v+=rnd(-.28,.22);g.k=rnd(1.2,2.4)}g.v=cl(g.v,0,1.8);if(g.t>1.5&&Math.abs(g.v-1)<.13)g.in+=dt},
 hit(g){g.v+=.11;tick()},key(g,k){if(k==' '||k=='enter'||k=='e')this.hit(g)},down(g){this.hit(g)},
 draw(g,c){grid(c);const ok=Math.abs(g.v-1)<.13;c.save();c.translate(130,108);c.rotate(g.a=(g.a||0)+g.v*.35);c.fillStyle='#111';c.beginPath();c.arc(0,0,76,0,7);c.fill();c.strokeStyle='#2a352e';for(let r=24;r<76;r+=12){c.beginPath();c.arc(0,0,r,0,7);c.stroke()}c.fillStyle=ok?G:RED;c.beginPath();c.arc(0,0,20,0,7);c.fill();R(c,-3,-76,6,16,GOLD);c.restore();
  R(c,270,20,26,170,'#1d2a22');R(c,270,190-1.0*100-17,26,34,'#16603f');const y=190-cl(g.v/1.8)*170;R(c,264,y-4,38,8,ok?G:'#fff');txt(c,'33',283,H-4,'#8aa094');txt(c,Math.round(this.score(g)*100)+'%',W-10,14,G,'right')},
 score:g=>cl(g.in/(12-1.5)*1.05)};

/* 8 Crowd Control: tap a crowd section before its mood runs out */
G_.crowd={n:'Crowd Control',how:'Keep all three sections hyped. Tap a section, or press 1, 2, 3.',dur:13,
 init(g){g.m=[.6,.6,.6];g.sum=0;g.n=0;g.ps=[0,0,0];g.pu=[0,0,0]},
 tick(g,dt){g.m=g.m.map((m,i)=>{const r=[.2,.27,.23][i]*(1+.5*Math.sin(g.t*.8+i*2));return cl(m-r*dt)});if(g.t>1){g.sum+=(g.m[0]+g.m[1]+g.m[2])/3*dt;g.n+=dt}g.pu=g.pu.map(v=>Math.max(0,v-dt*5))},
 pick(g,i){if(i<0||i>2)return;g.m[i]=cl(g.m[i]+.3);g.pu[i]=1;try{snd(g.m[i]>.5?'pop':'click')}catch(e){}},
 down(g,x){this.pick(g,Math.floor(x/(W/3)))},key(g,k){const n=parseInt(k);if(n>=1&&n<=3)this.pick(g,n-1);if(k=='arrowleft')this.pick(g,0);if(k=='arrowdown')this.pick(g,1);if(k=='arrowright')this.pick(g,2)},
 draw(g,c){grid(c);g.m.forEach((m,i)=>{const x=10+i*130,w=120,col=m>.5?G:m>.25?GOLD:RED;R(c,x,20,w,170,'#0e1511');R(c,x,20+170*(1-m),w,170*m,col);R(c,x,20,w,4,'#000');for(let k=0;k<5;k++)R(c,x+14+k*20,60+170*(1-m)*.0+Math.sin(g.t*6+k+i)*4+(g.pu[i]*-14),10,10,'#000');txt(c,i+1,x+w/2,H-4,'#8aa094')});
  txt(c,Math.round(this.score(g)*100)+'%',W-8,14,'#fff','right')},
 score:g=>g.n>0?cl(g.sum/g.n*1.05):0};

/* 9 Sample Search: find the sample with the same waveform */
G_.sample={n:'Sample Search',how:'Tap the sample that matches the wave on top. Keys 1-9 work too.',dur:14.4,
 init(g){g.r=0;g.sc=[];this.round(g)},
 round(g){const t=Array.from({length:5},()=>ri(1,5));g.T=t;const o=[t];while(o.length<9){const v=t.slice(),n=ri(1,2);for(let k=0;k<n;k++)v[ri(0,4)]=ri(1,5);if(!o.some(x=>x.join()==v.join()))o.push(v)}g.O=shuf(o);g.a=g.O.findIndex(x=>x===t);g.rt=0;g.pause=0},
 next(g){g.r++;if(g.r>=4)g.over=1;else this.round(g)},
 tick(g,dt){if(g.pause>0){g.pause-=dt;if(g.pause<=0)this.next(g);return}g.rt+=dt;if(g.rt>3.2){g.sc.push(0);g.pk=-2;g.pause=.4;bad()}},
 pick(g,i){if(g.pause>0||i<0||i>8)return;g.pk=i;if(i==g.a){g.sc.push(cl(1.15-g.rt/5,.5,1));good()}else{g.sc.push(0);bad()}g.pause=.4},
 down(g,x,y){if(y<62)return;const cx=Math.floor((x-70)/87),cy=Math.floor((y-62)/48);if(cx<0||cx>2||cy<0||cy>2)return;this.pick(g,cy*3+cx)},
 key(g,k){const n=parseInt(k);if(n>=1&&n<=9)this.pick(g,n-1)},
 draw(g,c){grid(c);const bars=(v,x,y,w,h,col)=>v.forEach((q,i)=>R(c,x+i*(w/5),y+h-q*h/5,w/5-2,q*h/5,col));bars(g.T,W/2-30,6,60,40,GOLD);
  g.O.forEach((v,i)=>{const x=70+(i%3)*87,y=62+Math.floor(i/3)*48,w=80,h=42,on=g.pause>0&&(i==g.a||i==g.pk);R(c,x,y,w,h,on?(i==g.a?'#16603f':'#6a1c28'):'#0e1511');bars(v,x+10,y+4,60,32,on&&i==g.a?G:'#8aa094')});
  R(c,10,12,40,5,'#1d2a22');R(c,10,12,40*cl(1-g.rt/3.2),5,G);txt(c,(g.r+1)+'/4',W-10,20,'#fff','right')},
 score:g=>g.sc.reduce((a,b)=>a+b,0)/4};

/* 10 Tempo Tap: the click stops, keep the tempo going */
G_.tempo={n:'Tempo Tap',how:'Listen to four clicks, then keep tapping the same tempo. SPACE or click.',dur:14,
 init(g){g.bpm=ri(84,126);g.ib=60/g.bpm;g.T=[];g.cn=0;g.fl=0;g.end=.8+(4+9)*g.ib+1.2},
 tick(g,dt){g.fl-=dt;if(g.cn<4&&g.t>=.8+g.cn*g.ib){g.cn++;g.fl=.12;try{sfx(880,.07,'square',.12)}catch(e){}}if(g.T.length>=8||g.t>g.end)g.over=1},
 hit(g){if(g.cn<4)return;g.T.push(g.t);g.fl=.12;try{sfx(660,.06,'square',.1)}catch(e){}},
 key(g,k){if(k==' '||k=='enter'||k=='e')this.hit(g)},down(g){this.hit(g)},
 draw(g,c){grid(c);txt(c,g.bpm+' BPM',W/2,34,GOLD,'center','bold 22px Silkscreen,ui-monospace,monospace');R(c,W/2-40,60,80,80,g.fl>0?G:'#1d2a22');
  for(let i=0;i<8;i++)R(c,W/2-100+i*26,170,18,10,i<g.T.length?G:'#1d2a22');txt(c,g.cn<4?'LISTEN '+g.cn+'/4':g.T.length<2?'KEEP THE TEMPO':'tap '+g.T.length+'/8',W/2,H-8,'#8aa094');
  if(g.T.length>1){const e=Math.round((g.T[g.T.length-1]-g.T[g.T.length-2]-g.ib)*1000);txt(c,(e>0?'+':'')+e+' ms',W/2,155,Math.abs(e)<60?G:RED)}},
 score(g){let s=0;for(let i=1;i<8;i++)if(g.T[i]!=null)s+=cl(1-Math.abs(g.T[i]-g.T[i-1]-g.ib)/(g.ib*.3));return s/7}};

const NAMES=ORDER.map(k=>G_[k].n);
window.NMG={games:G_,order:ORDER};
/* ---- the run ---- */
let el=null,cv=null,cx=null,lastKey=null;
function plan(){const pool=ORDER.slice(0,Math.min(10,GT.mgTotal()));let n=Math.min(GT.need(),pool.length),p=shuf(pool.slice()).slice(0,n);
 if(window.NMG_FORCE)p=window.NMG_FORCE.slice();
 else if(p.length>1&&pool.length>p.length&&p[0]==S.lmg)p.push(p.shift());
 S.lmg=p[0];return p}
function begin(){const p=plan();rec.nm={p,i:0,res:[],ph:'ready',t:0,g:null,L:GT.level()};rec.st=9;rec.cdn=0;rec.cgo=0;rec.wait=0;document.body.classList.add('mgon');build();setup()}
function build(){if(el)return;el=document.createElement('div');el.id='nmg';el.className='box';
 el.innerHTML='<div class=nmh><b id=nmn></b><span id=nmi></span></div><canvas width='+W+' height='+H+'></canvas><div class=nmb><i></i></div><small class=m id=nmh></small>';
 document.body.appendChild(el);cv=el.querySelector('canvas');cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;
 const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
 cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}const n=rec&&rec.nm;if(!n)return;if(n.ph=='ready'){if(n.t>.4)n.t=9;return}if(n.ph!='play')return;const g=n.g,[x,y]=pos(e);G_[n.p[n.i]].down&&G_[n.p[n.i]].down(g,x,y)});
 cv.addEventListener('pointermove',e=>{const n=rec&&rec.nm;if(!n||n.ph!='play')return;const g=n.g,[x,y]=pos(e);G_[n.p[n.i]].move&&G_[n.p[n.i]].move(g,x,y)});
 const up=()=>{const n=rec&&rec.nm;if(n&&n.ph=='play'&&G_[n.p[n.i]].up)G_[n.p[n.i]].up(n.g)};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up)}
function setup(){const n=rec.nm,k=n.p[n.i],d=G_[k];n.ph='ready';n.t=0;n.g={t:0,over:0};d.init(n.g);n.g.k=k;
 $('nmn').textContent=d.n;$('nmi').textContent=(n.i+1)+' / '+n.p.length;$('nmh').textContent=d.how;el.querySelector('.nmb i').style.width='100%'}
function finishGame(){const n=rec.nm,k=n.p[n.i],s=cl(G_[k].score(n.g));n.res.push(s);n.ph='result';n.t=0;n.s=s;try{snd(s>=.85?'perfect':s>=.6?'great':s>=.35?'good':'miss')}catch(e){}}
function finishSong(){const n=rec.nm,avg=n.res.reduce((a,b)=>a+b,0)/n.res.length,bonus=Math.round(avg*GT.qMax(n.L)),n0=S.nid;
 rec.sc={l:avg,x:avg};rec.miss=Math.round((1-avg)*8);rec.cdn=0;const names=n.p.map(k=>G_[k].n),res=n.res.slice();
 el.remove();el=null;document.body.classList.remove('mgon');
 mgFinish();
 try{const d=S.drafts[S.drafts.length-1];if(d&&d.id===n0){d.q+=bonus;const box=document.querySelector('#ui .box.modal');if(box){const cs=box.querySelector('.cards');if(cs){cs.style.setProperty('grid-template-columns','repeat(3,1fr)','important');cs.style.setProperty('gap','6px','important');cs.innerHTML=names.map((m,i)=>`<div class=card style="padding:6px;font-size:12px">${m}<b>${Math.round(res[i]*100)}%</b></div>`).join('')}
  const fq=document.getElementById('fxq');if(fq){const nf=fq.cloneNode();nf.textContent=d.q;fq.replaceWith(nf)}else{const p=box.querySelector('p.m');if(p)p.innerHTML=p.innerHTML.replace(/mix quality \d+/,'mix quality '+d.q)}}}}catch(e){console.error('nmg result',e)}}
function draw(){const n=rec.nm,k=n.p[n.i],d=G_[k],g=n.g;d.draw(g,cx);
 if(n.ph=='ready'){cx.fillStyle='#000c';cx.fillRect(0,0,W,H);txt(cx,d.n,W/2,92,GOLD,'center','bold 20px Silkscreen,ui-monospace,monospace');txt(cx,n.t<1.1?'GET READY':'GO!',W/2,126,G);}
 else if(n.ph=='result'){cx.fillStyle='#000b';cx.fillRect(0,0,W,H);txt(cx,Math.round(n.s*100)+'%',W/2,104,n.s>=.6?G:GOLD,'center','bold 34px Silkscreen,ui-monospace,monospace');txt(cx,n.s>=.85?'PERFECT':n.s>=.6?'GREAT':n.s>=.35?'OK':'ROUGH',W/2,134,'#fff')}
 el.querySelector('.nmb i').style.width=(n.ph=='play'?cl(1-g.t/d.dur)*100:n.ph=='ready'?100:0)+'%'}
function nmTick(dt){if(!el)return;const n=rec.nm;dt=Math.min(dt,.05);n.t+=dt;
 if(n.ph=='ready'){if(n.t>1.5){n.ph='play';n.t=0;try{snd('ping')}catch(e){}}}
 else if(n.ph=='play'){const g=n.g,d=G_[n.p[n.i]];g.t+=dt;d.tick&&d.tick(g,dt);if(g.over||g.t>=d.dur)finishGame()}
 else if(n.ph=='result'&&n.t>.9){n.i++;if(n.i>=n.p.length)return finishSong();setup()}
 if(el)draw()}
{const t0=recTick;recTick=function(dt){if(rec&&rec.nm===undefined){rec.nm=0;if(rec.st===0&&!rec.band&&!rec.ig&&typeof GT!='undefined'&&mode=='rec'){try{begin()}catch(e){console.error('nmg',e);rec.nm=0;rec.st=0;if(el){el.remove();el=null}document.body.classList.remove('mgon')}}}
 if(rec&&rec.nm&&rec.st==9){nmTick(dt);return}return t0.apply(this,arguments)}}
/* leaving with Escape clears the panel */
{const u0=update;update=function(dt){u0(dt);if(el&&(!rec||!rec.nm)){el.remove();el=null;document.body.classList.remove('mgon')}}}
{const d0=mgDraw;mgDraw=function(){if(rec&&rec.nm&&rec.st==9){const o=$('mg');if(o)o.remove();return}return d0.apply(this,arguments)}}
/* keys: arrows and space reach the game, they never move the player or hit the old beat bar here */
const kh=(e,up)=>{if(!rec||!rec.nm||rec.st!=9||!el||/INPUT|TEXTAREA/.test(e.target.tagName))return;const n=rec.nm,k=e.key.toLowerCase();
 if(n.ph=='ready'){if(!up&&(k==' '||k=='enter')&&n.t>.4)n.t=9;return}if(n.ph!='play')return;const d=G_[n.p[n.i]];if(d.key){if(!up||k.startsWith('arrow')||k=='a'||k=='d'){if(!e.repeat||up)d.key(n.g,k,up)}}if(k==' '||k.startsWith('arrow'))e.preventDefault()};
addEventListener('keydown',e=>kh(e,0));addEventListener('keyup',e=>kh(e,1));
/* the Make a song screen says what the song is made of */
{const r0=recMenu;recMenu=function(){const r=r0.apply(this,arguments);try{const u=$('ui');if(u)u.innerHTML=u.innerHTML.replace(/Three steps:[^<]*?Costs 15 energy\./,GT.need()+' quick minigame'+(GT.need()>1?'s':'')+', 15 seconds at most each. Costs 15 energy.')}catch(e){}return r}}
{const st=document.createElement('style');st.textContent=`#nmg{position:fixed;left:50%;transform:translateX(-50%);bottom:90px;width:min(440px,92vw);z-index:5;pointer-events:auto;text-align:center;padding:8px}
#nmg .nmh{display:flex;justify-content:space-between;align-items:baseline;margin:0 2px 6px;font-family:Silkscreen,ui-monospace,monospace;font-size:13px}#nmg .nmh b{color:var(--g)}#nmg .nmh span{color:var(--m)}
#nmg canvas{display:block;width:100%;aspect-ratio:${W}/${H};image-rendering:pixelated;border:2px solid #000;touch-action:none;cursor:pointer}
#nmg .nmb{height:6px;background:#1d2a22;margin:6px 0 4px;border:2px solid #000}#nmg .nmb i{display:block;height:100%;background:var(--g)}#nmg small{font-size:11px}`;document.head.appendChild(st)}
})();
