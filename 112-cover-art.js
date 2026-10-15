/* ===== v26.130: composed pixel covers =====
   Song and album covers used to be mirrored noise. genCover() now paints one of 10 small scenes on a 48x48 pixel grid (drawn at 2x, hard edges):
   sunset skyline, vinyl, flower, mountains, planet, city night, shapes, portrait of you, synthwave, ocean.
   The palette and every random detail come from a seed, so the same song always gets the same cover and nothing needs saving.
   Songs pick a scene from their genre and title words; albums can pick one (or Auto) in the creator and can add a filter, border and sticker.
   Albums made before this have no tpl field and keep the original symbol cover. */
const CVT=['Sunset skyline','Vinyl','Flower','Mountains','Planet','City night','Shapes','Portrait','Synthwave','Ocean'];
{const X=[['#2b1055','#ff7e5f'],['#0f2027','#2ec4b6'],['#3d0c11','#ff5a5f'],['#1b263b','#e0e1dd'],['#2d1e2f','#f7b267'],['#0b3d2e','#c7f464'],['#321e1e','#ffcc70'],['#14213d','#fca311'],['#3a0ca3','#4cc9f0'],['#5f0f40','#fb8b24'],['#1a1a2e','#e94560'],['#264653','#e9c46a']];if(PALS.length<18)X.forEach(p=>PALS.push(p))}
const cvHash=s=>{s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const cvRng=seed=>{let h=seed>>>0||1;return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return(h>>>0)/4294967296}};
const cvRGB=c=>{c=String(c).replace('#','');if(c.length==3)c=c.replace(/./g,'$&$&');const n=parseInt(c,16)||0;return[n>>16&255,n>>8&255,n&255]};
const cvMix=(a,b,t)=>{const p=cvRGB(a),q=cvRGB(b);return'#'+p.map((v,i)=>('0'+Math.round(v+(q[i]-v)*t).toString(16)).slice(-2)).join('')};
const CVW={Pop:[2,0,3,0,1,1,2,3,2,2],'Hip-Hop':[1,3,0,0,1,3,2,3,1,0],Rap:[1,3,0,0,1,3,2,3,1,0],'R&B':[3,1,1,0,1,3,1,3,2,1],Rock:[1,3,0,3,0,2,1,2,0,0],Electronic:[0,1,0,0,3,3,2,0,3,0],'Lo-fi':[3,1,2,2,1,2,0,0,0,3],Country:[3,1,2,3,0,0,0,2,0,1],Folk:[2,1,3,3,0,0,0,1,0,2],Indie:[2,2,2,2,1,1,3,2,1,2],Latin:[3,0,2,0,0,1,2,2,2,3]};
const CVK=[[/moon|night|midnight|dark|star|dream|ghost|shadow/i,[5,4,8]],[/sun|gold|summer|dawn|morning|heat|fire|burn/i,[0,9]],[/flower|rose|sweet|love|heart|spring|garden|bloom/i,[2]],[/road|home|river|mountain|wild|cold|snow|rolling|heavy/i,[3]],[/record|vinyl|echo|loud|radio|tape|rewind|repeat/i,[1]],[/wave|blue|sea|ocean|rain|tide|drift/i,[9]],[/neon|electric|crystal|space|light|future|glow/i,[8,4]],[/city|street|lights|town|game|late|tonight/i,[5]]];
function cvPick(r,g,title,port){const w=(CVW[g]||[1,1,1,1,1,1,1,1,1,1]).slice();if(!port)w[7]=0;CVK.forEach(k=>{if(k[0].test(title||''))k[1].forEach(i=>{if(!(i==7&&!port))w[i]+=4})});
 const T=w.reduce((a,b)=>a+b,0);let v=r()*T;for(let i=0;i<10;i++){v-=w[i];if(v<0)return i}return 0}
const COVG=new Map();
function genCover(o){const cfgKey=o.cfg?JSON.stringify(o.cfg):'',key=[o.seed,o.tpl,o.pal,o.cc,o.g,o.title,o.flt,o.brd,o.stk,cfgKey].join('|');if(COVG.has(key))return COVG.get(key);
 const r=cvRng(o.seed),port=!!o.cfg;let tpl=o.tpl>=1&&o.tpl<=10?o.tpl-1:cvPick(cvRng(o.seed^0x9e3779b9),o.g,o.title,port);if(tpl==7&&!port)tpl=cvPick(cvRng(o.seed^0x51ed270b),o.g,'',false);
 const pr=cvRng(o.seed^0x85ebca6b),pair=o.cc||PALS[(o.pal==null||o.pal<0?Math.floor(pr()*PALS.length):o.pal)%PALS.length],c0=pair[0],c1=pair[1];
 const P={t:cvMix(c0,'#000000',.25),h:cvMix(c0,c1,.5),sun:c1,far:cvMix(c0,c1,.22),mid:cvMix(c0,'#000000',.4),nr:cvMix(c0,'#000000',.72),acc:cvMix(c1,'#ffffff',.55),ink:'#0b0b12',wh:'#f4f1e8'};
 const k=document.createElement('canvas');k.width=k.height=96;const x=k.getContext('2d');x.imageSmoothingEnabled=false;x.scale(2,2);
 const R_=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))};
 const C_=(col,cx,cy,rad)=>{for(let y=-rad;y<=rad;y++)for(let q=-rad;q<=rad;q++)if(q*q+y*y<=rad*rad+rad*.4)R_(col,cx+q,cy+y,1,1)};
 const sky=(a,b,y0,y1,st)=>{st=st||3;for(let y=y0;y<y1;y+=st)R_(cvMix(a,b,(y-y0)/Math.max(1,y1-y0-1)),0,y,48,Math.min(st,y1-y))};
 const stars=(n,col)=>{for(let i=0;i<n;i++)R_(i%4?col:P.acc,r()*48|0,r()*26|0,1,1)};
 const rr=(a,b)=>a+r()*(b-a),ri=(a,b)=>Math.floor(rr(a,b+1));
 if(tpl==0){/* sunset skyline */
  sky(P.t,P.h,0,32);const cx=ri(14,34),cy=25;C_(cvMix(P.h,P.sun,.35),cx,cy,12);C_(P.sun,cx,cy,9);for(let y=cy-2;y<cy+10;y+=3)R_(cvMix(P.h,P.sun,.2),cx-10,y,21,1+(y>cy+4?1:0));
  for(let i=0;i<5;i++){const bx=ri(2,42),by=ri(3,14);R_(P.ink,bx,by,2,1);R_(P.ink,bx+2,by-1,2,1)}
  let X=-2;while(X<48){const w=ri(4,7),h=ri(9,17);R_(P.mid,X,38-h,w,h+10);X+=w}
  X=-3;while(X<48){const w=ri(5,8),h=ri(5,14);R_(P.nr,X,43-h,w,h+6);for(let y=43-h+2;y<42;y+=3)for(let q=X+1;q<X+w-1;q+=3)if(r()<.35)R_(P.sun,q,y,1,1);if(r()<.3)R_(P.nr,X+w/2|0,43-h-3,1,3);X+=w}
  R_(P.ink,0,43,48,5)}
 else if(tpl==1){/* vinyl */
  sky(P.t,P.far,0,48,4);for(let i=0;i<10;i++)R_(cvMix(P.t,P.far,.5),ri(0,46),ri(0,46),2,2);
  const cx=31,cy=24;C_(P.ink,cx,cy,19);for(const rd of[17,14,11])for(let a=0;a<360;a+=3){const q=a*Math.PI/180;R_(cvMix(P.ink,'#ffffff',.1),cx+Math.cos(q)*rd,cy+Math.sin(q)*rd,1,1)}
  for(let y=-18;y<=18;y++)for(let q=-18;q<=18;q++){const d=q*q+y*y;if(d>100&&d<324){const an=Math.atan2(y,q);if(Math.sin(an*2+.8)>.82)R_(cvMix(P.ink,'#ffffff',.2),cx+q,cy+y,1,1)}}
  C_(P.sun,cx,cy,7);C_(cvMix(P.sun,'#000000',.25),cx,cy,5);C_(P.sun,cx,cy,4);R_(P.acc,cx-3,cy-1,6,1);C_(P.t,cx,cy,1);
  R_(P.ink,3,5,26,38);R_(P.mid,4,6,24,36);R_(P.sun,4,6,24,1);R_(P.sun,4,41,24,1);const sx=ri(10,20),sy=ri(14,24);C_(P.sun,sx,sy,6);C_(P.mid,sx+2,sy-1,4);R_(P.acc,6,34,14,2);R_(P.far,6,37,9,1)}
 else if(tpl==2){/* flower */
  sky(P.t,P.far,0,40);R_(P.nr,0,38,48,10);for(let i=0;i<14;i++)R_(cvMix(P.nr,P.far,.35),ri(0,47),ri(39,46),1,1);
  const gr=cvMix('#3f8f5a',P.mid,.3);R_(gr,23,22,2,18);for(const s of[-1,1]){for(let i=0;i<6;i++)R_(gr,24+s*(2+i),34-i,2,2);R_(cvMix(gr,'#ffffff',.2),24+s*4,31,2,1)}
  const n=6+ri(0,2),pc=[P.sun,P.acc],cx=24,cy=19;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;C_(i%2?pc[1]:pc[0],cx+Math.cos(a)*9,cy+Math.sin(a)*9,5)}
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2;C_(cvMix(i%2?pc[1]:pc[0],'#ffffff',.3),cx+Math.cos(a)*10,cy+Math.sin(a)*10,2)}
  C_(P.ink,cx,cy,5);C_(cvMix(P.sun,'#000000',.2),cx,cy,3);for(let i=0;i<5;i++)R_(P.acc,cx+ri(-3,3),cy+ri(-3,3),1,1);
  for(let i=0;i<4;i++){const bx=ri(3,44);R_(gr,bx,42,1,4);R_(pc[i%2],bx-1,40,3,2)}}
 else if(tpl==3){/* mountains */
  sky(P.t,P.h,0,34);if(r()<.5){C_(P.acc,ri(10,38),ri(9,15),5);}else{C_(P.sun,ri(10,38),ri(11,18),6)}stars(8,P.wh);
  const ridge=(base,amp,col,snow,ph)=>{const f1=rr(.12,.2),f2=rr(.3,.5),p1=r()*6,p2=r()*6,hs=[];for(let q=0;q<48;q++){const h=Math.round(base-amp*(.6*Math.sin(q*f1+p1+ph)+.4*Math.sin(q*f2+p2)+1)/2);hs.push(h);R_(col,q,h,1,48-h);if(snow&&h<base-amp*.55)R_(P.wh,q,h,1,Math.min(3,Math.ceil((base-amp*.55-h)/2)+1))}return hs};
  ridge(30,16,P.far,1,0);ridge(36,12,P.mid,0,2);const hs=ridge(42,9,P.nr,0,4);
  for(let i=0;i<7;i++){const q=ri(1,46),b=hs[q]+1,h=ri(5,9);for(let y=0;y<h;y++)R_(P.ink,q-((y/2)|0),b-h+y,1+((y/2)|0)*2,1);R_(P.ink,q,b,1,2)}}
 else if(tpl==4){/* planet */
  sky(P.ink,cvMix(P.t,'#000000',.5),0,48,4);for(let i=0;i<34;i++)R_(i%5?'#ffffff':P.acc,r()*48|0,r()*48|0,1,1);
  const cx=ri(22,27),cy=ri(21,26),Rd=ri(12,15),th=-.35,ring=(front)=>{for(let a=0;a<6.3;a+=.012){const s=Math.sin(a);if((s>0)!=front)continue;const ex=Math.cos(a)*(Rd+9),ey=s*5;const X=cx+ex*Math.cos(th)-ey*Math.sin(th),Y=cy+ex*Math.sin(th)+ey*Math.cos(th);R_(a%.5<.25?P.acc:cvMix(P.acc,P.sun,.5),X,Y,1,1);R_(cvMix(P.acc,'#000000',.4),X,Y+1,1,1)}};
  ring(false);const bc=[P.sun,P.far,P.acc,P.h,P.mid],off=r()*5;
  for(let y=-Rd;y<=Rd;y++)for(let q=-Rd;q<=Rd;q++){if(q*q+y*y>Rd*Rd)continue;const bi=Math.floor((y+Rd+Math.sin(q/4+off)*1.5)/4.5)%5;let col=bc[(bi+5)%5];const lx=q+5,ly=y+5,d=Math.sqrt(lx*lx+ly*ly)/Rd;if(d>1.55)col=cvMix(col,'#000000',.6);else if(d>1.25)col=(q+y)&1?cvMix(col,'#000000',.55):cvMix(col,'#000000',.3);else if(d>.95&&((q+y)&1))col=cvMix(col,'#000000',.25);R_(col,cx+q,cy+y,1,1)}
  ring(true);const mx=ri(5,10),my=ri(36,42);C_(P.wh,mx,my,3);C_(cvMix(P.wh,'#000000',.45),mx+1,my+1,2)}
 else if(tpl==5){/* city night */
  sky(P.ink,P.t,0,40);stars(22,'#ffffff');const mx=ri(30,40);C_(P.wh,mx,9,4);C_(cvMix(P.wh,'#000000',.25),mx+1,10,1);
  let X=-2;while(X<48){const w=ri(4,7),h=ri(14,26);R_(P.mid,X,44-h,w,h);X+=w}
  X=-3;while(X<48){const w=ri(5,9),h=ri(12,30),top=44-h;R_(r()<.5?P.nr:cvMix(P.nr,P.sun,.1),X,top,w,h+4);for(let y=top+2;y<42;y+=3)for(let q=X+1;q<X+w-1;q+=2)if(r()<.5)R_(r()<.7?P.sun:P.acc,q,y,1,2);if(r()<.35){R_(P.nr,X+w/2|0,top-5,1,5);R_('#ff3b3b',X+w/2|0,top-6,1,1)}X+=w}
  R_(P.ink,0,44,48,4);for(let i=0;i<5;i++)R_(i%2?P.acc:P.sun,ri(1,44),45+(i%2),ri(3,6),1)}
 else if(tpl==6){/* shapes: four bauhaus tiles */
  const cols=[P.sun,P.acc,P.far,P.mid,P.wh,P.t,P.h];for(let ty=0;ty<2;ty++)for(let tx=0;tx<2;tx++){const ox=tx*24,oy=ty*24,bg=cols[ri(0,6)];let fg=cols[ri(0,6)];if(fg==bg)fg=cols[(cols.indexOf(bg)+3)%7];R_(bg,ox,oy,24,24);const m=ri(0,5);
   if(m==0)C_(fg,ox+12,oy+12,9);else if(m==1){const fl=(tx+ty)%2;for(let y=0;y<24;y++)for(let q=0;q<24;q++){const u=fl?23-q:q;if(u*u+y*y<=484)R_(fg,ox+q,oy+y,1,1)}}
   else if(m==2){for(let y=0;y<24;y++)R_(fg,ox+((tx+ty)%2?24-y:0),oy+y,(tx+ty)%2?y:y+1,1)}else if(m==3){for(let y=2;y<24;y+=6)R_(fg,ox,oy+y,24,3)}
   else if(m==4){for(let y=0;y<12;y++)for(let q=0;q<24;q++)if((q-12)**2+y*y<=121)R_(fg,ox+q,oy+11+y,1,1)}
   else{for(const rd of[10,7,4])C_(rd%2?bg:fg,ox+12,oy+12,rd)}}
  R_(P.ink,23,0,2,48);R_(P.ink,0,23,48,2)}
 else if(tpl==7){/* portrait */
  sky(P.t,P.h,0,48,4);const cx=24,cy=22;for(let y=0;y<48;y++)for(let q=0;q<48;q++){const an=Math.atan2(y-cy,q-cx);if(Math.floor((an+Math.PI)/(Math.PI/8))%2==0)R_(cvMix(cvMix(P.t,P.h,y/48),P.sun,.18),q,y,1,1)}
  C_(cvMix(P.h,P.sun,.4),cx,cy-2,15);C_(P.sun,cx,cy-2,13);try{x.save();x.scale(5,5);fig(x,Object.assign({},o.cfg),-1.2,1.3);x.restore()}catch(e){x.restore()}R_(P.ink,0,44,48,4)}
 else if(tpl==8){/* synthwave */
  sky(P.ink,P.t,0,18,3);sky(P.t,P.h,18,29,2);stars(16,P.wh);const cx=24;
  for(let y=-13;y<0;y++){const w=Math.floor(Math.sqrt(169-y*y));if(y>-9&&(y+13)%3==0)continue;R_(cvMix(P.sun,P.acc,(y+13)/13),cx-w,28+y,w*2+1,1)}
  for(let i=0;i<6;i++){const q=ri(0,40),h=ri(3,7);for(let y=0;y<h;y++)R_(P.nr,q-y+h,29-h+y,(h-y)*2,1)}
  R_(P.ink,0,29,48,19);R_(P.acc,0,29,48,1);for(const y of[31,34,38,43])R_(P.sun,0,y,48,1);
  for(let k=-9;k<=9;k++)for(let y=30;y<48;y++)R_(cvMix(P.sun,P.acc,.3),cx+(k*(y-29))/1.7,y,1,1)}
 else{/* ocean */
  sky(P.t,P.h,0,24);const cx=ri(14,34);C_(P.sun,cx,22,8);R_(P.far,0,22,48,1);sky(P.mid,P.nr,23,48,3);
  for(let y=24;y<48;y+=3){const w=Math.max(1,Math.round((48-y)/4));R_(cvMix(P.sun,P.mid,.15+(y-24)/60),cx-w-((y%2)*2),y,w*2+1,1)}
  for(let y=26;y<48;y+=3)for(let n=0;n<4;n++){const q=ri(0,44),w=ri(3,8);R_(cvMix(P.mid,P.acc,.3+y/120),q,y,w,1)}
  const bx=ri(26,38),by=ri(24,28);R_(P.ink,bx,by+5,9,2);R_(P.ink,bx+1,by+7,7,1);R_(P.ink,bx+4,by-4,1,9);for(let y=0;y<8;y++)R_(P.wh,bx+5,by-3+y,Math.max(1,y/1.5|0),1)}
 /* border */
 const br=o.brd|0,f=P.sun;if(br==1){R_(f,1,1,46,1);R_(f,1,46,46,1);R_(f,1,1,1,46);R_(f,46,1,1,46)}else if(br==2){R_(f,0,0,48,3);R_(f,0,45,48,3);R_(f,0,0,3,48);R_(f,45,0,3,48)}else if(br==3){R_(f,1,1,46,1);R_(f,1,46,46,1);R_(f,1,1,1,46);R_(f,46,1,1,46);R_(f,4,4,40,1);R_(f,4,43,40,1);R_(f,4,4,1,40);R_(f,43,4,1,40)}
 else if(br==4){R_('#f4f4f4',0,0,48,4);R_('#f4f4f4',0,0,4,48);R_('#f4f4f4',44,0,4,48);R_('#f4f4f4',0,40,48,8)}else if(br==5){R_(P.ink,0,0,48,3);R_(P.ink,0,45,48,3);R_(P.ink,0,0,3,48);R_(P.ink,45,0,3,48)}
 else if(br==6){R_(P.ink,0,0,48,6);R_(P.ink,0,42,48,6);for(let q=1;q<48;q+=4){R_('#f4f1e8',q,2,2,2);R_('#f4f1e8',q,44,2,2)}}else if(br==7){R_('#e6b422',0,0,48,2);R_('#e6b422',0,46,48,2);R_('#e6b422',0,0,2,48);R_('#e6b422',46,0,2,48);R_('#fff3b0',1,1,46,1);R_('#8a6a10',3,3,42,1);R_('#8a6a10',3,44,42,1);R_('#8a6a10',3,3,1,42);R_('#8a6a10',44,3,1,42)}
 /* sticker */
 const sk=o.stk|0;if(sk==1){R_('#0b0b12',2,38,12,8);R_('#f4f1e8',3,39,10,6);R_('#0b0b12',5,40,1,4);R_('#0b0b12',5,40,4,1);R_('#0b0b12',5,42,3,1);R_('#0b0b12',5,44,4,1)}
 else if(sk==2){const sx=38,sy=9;for(let y=-6;y<=6;y++){const w=6-Math.abs(y);R_('#e6b422',sx-Math.floor(w*.9),sy+y,Math.floor(w*1.8)+1,1)}R_('#fff3b0',sx-1,sy-2,2,3)}
 else if(sk==3){for(let y=0;y<12;y++)for(let q=36;q<48;q++){const t=(q-36)+y;if(t>=9&&t<=16)R_('#d62828',q,y,1,1)}R_('#f4f1e8',42,3,1,1);R_('#f4f1e8',44,5,1,1)}
 else if(sk==4){R_('#f4f1e8',34,38,12,8);for(let q=35;q<45;q+=2)R_('#0b0b12',q,39,q%4?1:2,5)}
 let u;const fl=o.flt|0;if(fl>0){const im=x.getImageData(0,0,96,96),d=im.data;for(let i=0;i<d.length;i+=4){let rd=d[i],g=d[i+1],b=d[i+2];if(fl==1){rd=rd*1.08+12;g=g*.97+4;b=b*.78}else if(fl==2){rd=rd*.82;g=g*.95;b=b*1.12+10}else if(fl==3){const l=rd*.3+g*.59+b*.11;rd=g=b=l}else if(fl==4){const px=(i/4)%96-48,py=Math.floor(i/4/96)-48,dd=Math.sqrt(px*px+py*py)/68,f=1-Math.max(0,dd-.45)*1.3;rd*=f;g*=f;b*=f}else if(fl==5){const n=((((i*2654435761)>>>0)%100)/100-.5)*34;rd+=n;g+=n;b+=n}else if(fl==6){rd=(rd-128)*1.35+128;g=(g-128)*1.35+128;b=(b-128)*1.35+128}d[i]=rd;d[i+1]=g;d[i+2]=b}x.putImageData(im,0,0)}
 u=k.toDataURL();COVG.set(key,u);return u}
/* ---- songs that are not on an album ---- */
sfCover=function(s){if(!s)return'';const f=s.id!=null&&S.songs.includes(s)?sfAlbumOf(s.id):null;if(f)try{return cover(f.a)}catch(e){}
 const key='c2|'+(s.id||0)+'|'+(s.g||s.genre||'')+'|'+(s.title||'');if(SPC.has(key))return SPC.get(key);
 let u='';try{u=genCover({seed:cvHash('song|'+(s.id||0)+'|'+(s.g||s.genre||'')),g:s.g||s.genre||'Pop',title:s.title||'',tpl:99,cfg:s.id!=null&&S.songs.includes(s)?ch:null})}catch(e){console.error('cover',e)}
 SPC.set(key,u);return u};
/* ---- albums with a chosen art style (tpl) use the composed scenes; older ones keep the symbol cover ---- */
{const c0=cover;cover=function(a){if(a&&a.tpl>0)try{return genCover({seed:a.seed||cvHash('al|'+(a.id!=null?a.id:a.name||'')),tpl:a.tpl,pal:a.pal,cc:a.cc,g:a.ag||'Pop',title:a.name||'',flt:a.flt,brd:a.brd,stk:a.stk,cfg:a.tpl==8||a.tpl==99?(a.cfg||ch):null})}catch(e){console.error('cover',e)}return c0.apply(this,arguments)}}
