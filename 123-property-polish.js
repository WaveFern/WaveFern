/* ===== v41.7.0: property polish =====
   - Your house outside: one stepped hip roof over the main house and the extension, with white fascia, gutters,
     downpipes and a chimney. When you own the upstairs, the outside gets a real second storey with windows. Window
     frames, sills, flower boxes, a stone plinth, corner trims, a porch light and shrubs by the door.
   - Upstairs and the extension match the main house: 3 m outer walls, beige low walls with a wood cap everywhere.
   - Neighbourhood houses are real sizes: 6 to 10 m wide, one or two 2.8 m storeys, doors and windows to scale.
     house(), cdHouse(), hoodStreet() and buildHomes() are replaced (they only run while the world is built).
   - Room colours: S.rc maps a room key (PRM) to a wall colour. A new career gets one palette (one hue family, muted,
     never dark). Old saves have no S.rc, so their walls stay as they were until the player paints a room.
   - Paint: Amazoom sells paint tins (S.tins). Holding a tin, press E in any room of your home to paint it. */
const PRM=[['g0','Bedroom',0,0,8,6],['g1','Studio',8,0,16,6],['g2','Living room',0,6,8,12],['g3','Kitchen',8,6,16,12],
 ['w0','Back room',0,-6,8,0],['w1','Back room',8,-6,16,0],
 ['u0','Upstairs room',900,320,908,329],['u1','Upstairs room',908,320,916,329],['u2','Upstairs room',900,329,908,338],['u3','Upstairs room',908,329,916,338]];
const PAINTS=[['Oat','#d8cbb4'],['Sand','#c9b8a0'],['Wheat','#d6c2a0'],['Latte','#b9a68e'],['Peach clay','#d2b59a'],['Clay','#c4a593'],['Dusty rose','#c7aab5'],['Heather','#b7b3c9'],['Mist','#a9bccb'],['Denim','#8fa3b8'],['Sea glass','#a8bfb8'],['Teal grey','#9ab0a8'],['Sage','#b8c4ae'],['Eucalyptus','#9fb39c'],['Olive grey','#8e9c8a'],['Stone','#a3a8a0'],['Greige','#c8c4bc'],['Linen','#e0d6c6']];
const PAINT_P=40;let PRHG=null,PRSIG='',PRI=0,PRE=0,HXP=null;

/* ---- palette for a new career: one hue family, low saturation, mid-light ---- */
function prPalette(){const F=[[32,24],[40,20],[95,15],[140,13],[200,16],[215,14],[350,14],[18,20],[265,11]],f=F[RI(0,F.length-1)],o={},c=new THREE.Color();
 PRM.forEach(r=>{const h=(f[0]+R(-16,16)+360)%360,s=Math.max(10,Math.min(30,f[1]+R(-5,5))),l=r[0]=='g1'?R(54,60):R(62,74);c.setHSL(h/360,(r[0]=='g1'?Math.min(s,18):s)/100,l/100);o[r[0]]='#'+c.getHexString()});return o}

/* ---- which rooms exist, and which one you stand in ---- */
const prHas=r=>r[0][0]=='g'||(r[0][0]=='w'&&WGX>=6)||(r[0][0]=='u'&&ANX.lv>=1&&ANX.idx!=null&&IG[ANX.idx]);
function prRoomAt(x,z){const k=IN?(ANX.idx!=null&&IN.i==ANX.idx?'u':''):(HIN?'gw':'');if(!k)return null;
 return PRM.find(r=>k.includes(r[0][0])&&prHas(r)&&x>=r[2]&&x<r[4]&&z>=r[3]&&z<r[5])||null}
const prGroups=()=>[PRHG,WIN,ANX.idx!=null?IG[ANX.idx]:null].filter(Boolean);

/* the full-height and low walls on a room's north and west edges (the sides the camera sees from inside).
   A wall that runs on into the next room is cut at the room boundary so each room can have its own colour. */
function prSplit(m,ax,a,b,r0,r1){if(a>=r0-.25&&b<=r1+.25)return m;
 const par=m.parent,p=m.geometry.parameters,cuts=[a];if(r0>a+.05)cuts.push(r0);if(r1<b-.05)cuts.push(r1);cuts.push(b);let mine=null;
 for(let i=0;i<cuts.length-1;i++){const c0=cuts[i],c1=cuts[i+1],L=c1-c0;if(L<.02)continue;const n=new THREE.Mesh(ax=='x'?geo(L,p.height,p.depth):geo(p.width,p.height,L),m.material);
  n.position.copy(m.position);n.scale.copy(m.scale);if(ax=='x')n.position.x=(c0+c1)/2;else n.position.z=(c0+c1)/2;n.userData.c0=m.userData.c0;par.add(n);if(c0>=r0-.05&&c1<=r1+.05)mine=n}
 par.remove(m);return mine}
function prWalls(r){const[,,x0,z0,x1,z1]=r,out=[];
 prGroups().forEach(g=>g.children.slice().forEach(m=>{if(!m.isMesh||!m.visible||!m.geometry||!m.geometry.parameters||!m.material||m.material.isMeshBasicMaterial||m.material.map)return;
  const p=m.geometry.parameters,w=p.width*m.scale.x,d=p.depth*m.scale.z,X=m.position.x,Z=m.position.z;if(p.height<.5||p.width==null)return;
  if(d>=.2&&d<=.36&&w>.3&&Math.abs(Z-z0)<=.2){const a=X-w/2,b=X+w/2;if(b<=x0+.05||a>=x1-.05)return;out.push(prSplit(m,'x',a,b,x0,x1))}
  else if(w>=.2&&w<=.36&&d>.3&&Math.abs(X-x0)<=.2){const a=Z-d/2,b=Z+d/2;if(b<=z0+.05||a>=z1-.05)return;out.push(prSplit(m,'z',a,b,z0,z1))}}));
 return out.filter(Boolean)}
function prPaintRoom(r,c){prWalls(r).forEach(m=>{if(m.userData.c0==null)m.userData.c0='#'+m.material.color.getHexString();m.material=M(c||m.userData.c0)})}
function prRecolour(){const rc=S.rc||{};PRM.forEach(r=>{if(prHas(r))prPaintRoom(r,rc[r[0]])})}

/* ---- the main house's low walls get the same look as the extension and upstairs (beige, 1.1 m, wood cap) ---- */
function prMatchMain(){if(!PRHG||PRHG.userData.pm)return;PRHG.userData.pm=1;
 PRHG.children.slice().forEach(m=>{if(!m.isMesh||!m.geometry.parameters||'#'+m.material.color.getHexString()!='#6b6f73'||m.geometry.parameters.height!=1)return;
  const p=m.geometry.parameters;m.material=M('#cbbf9f');m.scale.y=1.1;m.position.y=.55;
  if(p.width>p.depth)B(PRHG,p.width,.06,.3,'#8a7a62',m.position.x,1.13,m.position.z);else B(PRHG,.3,.06,p.depth,'#8a7a62',m.position.x,1.13,m.position.z)})}
/* upstairs: 3 m outer walls like downstairs, and windows in the back and side walls like the extension */
function prAnnexFix(){const G=ANX.idx!=null&&IG[ANX.idx];if(!G||ANX.lv<1)return;
 G.children.forEach(m=>{if(m.isMesh&&m.geometry.parameters&&m.geometry.parameters.height==3.4){m.scale.y=3/3.4;m.position.y=1.5}});
 [4,12].forEach(x=>B(G,1.8,1.1,.1,'*cfe8fa',900+x,1.8,320-.02));[4.5,13.5].forEach(z=>B(G,.1,1.1,1.8,'*cfe8fa',900+.02,1.8,320+z))}

/* ---- your house from outside ---- */
function homeExt(force){if(typeof HX=='undefined')return;const n=(S.home||0)>=3?2:1,zN=-(WGX||0),key=n+'|'+zN;if(!force&&HXP&&HXP.userData.k==key)return;
 /* the old flat roofs (main house and extension) and the old chimney make way for the new roof */
 HX.children.slice().forEach(m=>{const p=m.isMesh&&m.geometry&&m.geometry.parameters;if(p&&m.position.y>=3.1&&((p.height==.3&&p.width>=4)||(p.width==.9&&p.height==1.6)))HX.remove(m)});
 if(WEXT)WEXT.children.slice().forEach(m=>{if(m.isMesh&&m.position.y>=3.1)WEXT.remove(m)});
 if(HXP)HX.remove(HXP);
 const g=HXP=new THREE.Group();g.userData.k=key;HX.add(g);
 const D=12-zN,cz=(zN+12)/2,wl='#d8c7a6',tr='#f4efe6',rf='#8d2d2d',pi='#7d8288',top=3*n,fz=12.36,ex=16.36;
 /* window trim on the front (z) or the east side (x) */
 const frame=(f,c,y,w,h)=>{if(f=='z'){B(g,w+.2,.1,.08,tr,c,y+h/2+.05,fz);B(g,.1,h+.2,.08,tr,c-w/2-.05,y,fz);B(g,.1,h+.2,.08,tr,c+w/2+.05,y,fz);B(g,.06,h,.04,tr,c,y,fz+.02)}
  else{B(g,.08,.1,w+.2,tr,ex,y+h/2+.05,c);B(g,.08,h+.2,.1,tr,ex,y,c-w/2-.05);B(g,.08,h+.2,.1,tr,ex,y,c+w/2+.05);B(g,.04,h,.06,tr,ex+.02,y,c)}};
 const fbox=(f,c,y)=>{const FL=['#e86a8a','#ffd166','#f4f1ea','#c38bff'];if(f=='z'){B(g,1.8,.25,.3,'#6b4a2e',c,y,12.5);for(let i=0;i<5;i++)B(g,.22,.2,.2,i%2?'#3f8a45':FL[(i+Math.round(c))%4],c-.72+i*.36,y+.2,12.5)}
  else{B(g,.3,.25,1.8,'#6b4a2e',16.5,y,c);for(let i=0;i<5;i++)B(g,.2,.2,.22,i%2?'#3f8a45':FL[(i+Math.round(c))%4],16.5,y+.2,c-.72+i*.36)}};
 /* ground floor dressing */
 [[-.3,5],[7,16.3]].forEach(a=>B(g,a[1]-a[0],.35,.08,'#7d7468',(a[0]+a[1])/2,.17,12.33));B(g,.08,.35,D+.3,'#7d7468',16.33,.17,cz);
 [2.5,10.5,13.5].forEach(x=>{frame('z',x,1.7,1.8,1.1);fbox('z',x,.86)});
 [3,6.5].concat(zN<0?[-2,-4]:[]).forEach(z=>{frame('x',z,1.7,1.8,1.1);B(g,.2,.15,2.1,'#ffffff',16.4,1.05,z)});
 B(g,.18,.3,.12,'*ffe9a8',4.55,2,12.36);B(g,.3,.22,.04,'#2a2a2e',7.5,2.1,12.33);[4.35,7.65].forEach(x=>{B(g,.7,.6,.6,'#2e7d32',x,.3,12.7);B(g,.5,.3,.5,'#3f8a45',x,.75,12.7)});
 /* corner trims, plus the second storey when you own the upstairs */
 [[-.15,12.15],[16.15,12.15],[16.15,zN-.15]].forEach(q=>B(g,.34,top,.34,tr,q[0],top/2,q[1]));
 if(n==2){B(g,16.3,3,.3,wl,8,4.5,12.15);B(g,.3,3,D,wl,16.15,4.5,cz);B(g,.3,3,D,wl,-.15,4.5,cz);B(g,16.3,3,.3,wl,8,4.5,zN-.15);
  B(g,16.7,.18,.12,tr,8,3.06,12.36);B(g,.12,.18,D+.4,tr,16.36,3.06,cz);
  [2.5,6,10.5,13.5].forEach(x=>{B(g,1.6,1.2,.1,'#9ad0f5',x,4.6,12.32);frame('z',x,4.6,1.6,1.2);B(g,1.9,.12,.2,'#ffffff',x,3.94,12.38);if(x!=6)fbox('z',x,3.78)});
  for(let z=zN+2.5;z<11.5;z+=3.5){B(g,.1,1.2,1.6,'#9ad0f5',16.32,4.6,z);frame('x',z,4.6,1.6,1.2);B(g,.2,.12,1.9,'#ffffff',16.38,3.94,z)}}
 /* one stepped hip roof over the whole footprint */
 const W0=17.4,D0=D+1.4,N=6,st=(Math.min(W0,D0)-1.4)/N;
 B(g,W0,.2,D0,tr,8,top+.1,cz);B(g,W0,.1,.12,pi,8,top-.02,cz+D0/2);B(g,.12,.1,D0,pi,8+W0/2,top-.02,cz);
 for(let k=0;k<N;k++)B(g,W0-.2-k*st,.32,D0-.2-k*st,k%2?dk(rf,.9):rf,8,top+.36+k*.32,cz);
 B(g,Math.max(.6,W0-N*st),.12,Math.max(.6,D0-N*st),dk(rf,.6),8,top+.28+N*.32,cz);
 [[16.35,12.35],[16.35,zN-.05]].forEach(q=>B(g,.1,top,.1,pi,q[0],top/2,q[1]));
 B(g,.9,2.6,.9,'#8a5a4a',13,top+1.3,zN+3);B(g,1.1,.15,1.1,'#5a3a2e',13,top+2.66,zN+3);
 const l=HX.children.find(m=>m.isSprite);if(l)l.position.y=n==2?6.8:3.8}

/* ---- neighbourhood houses at real size ---- */
house=function(cx,zf,w,d,h,wl,rf){const z=zf-d/2,n=h>4?2:1,ex=.4;SB(w,h,d,wl,cx,h/2,z);
 SB(w+2*ex,.16,d+2*ex,'#f2efe8',cx,h+.08,z);const st=Math.min(w,d)*.2;for(let k=0;k<4;k++)SB(w+2*ex-.1-k*st,.3,d+2*ex-.1-k*st,k%2?dk(rf,.88):rf,cx,h+.31+k*.3,z);
 SB(.6,1.4,.6,'#8a5a4a',cx+w*.3,h+1.1,z-d*.2);
 SB(1,1.9,.1,'#5a3a22',cx,.95,zf+.04);SB(1.5,.12,.6,rf,cx,2.2,zf+.3);
 const gar=w>=8.5,wx=[-w*.3,w*.3];[1.5].concat(n==2?[4.3]:[]).forEach(y=>(y>2&&w>=7?wx.concat([0]):wx).forEach(x=>{if(gar&&x>0&&y<2)return;SB(1,1,.1,'#bfe3ff',cx+x,y,zf+.04);SB(1.2,.1,.2,'#fff',cx+x,y-.55,zf+.1)}));
 if(gar)SB(2.6,2,.1,'#9aa0a8',cx+w*.28,1,zf+.05);
 col(cx-w/2,zf-d,cx+w/2,zf);HP.push([cx,z]);CTD.hse.push({cx,zf,w,d,h,wl,rf})};
cdHouse=function(o){const{w,d,h,rf}=o,n=h>4?2:1,X=WX(o.cx),Zf=WZ(o.zf);CTD.hfp.push([X-w/2,Zf-d,X+w/2,Zf,rf]);
 const rd=RH.find(r=>r[0]>Zf&&r[0]-Zf<14&&X>r[1]&&X<r[2]),PE=rd?rd[0]-PO:Zf+.5,gd=w>=8.5?X+w*.28:null,f=Zf+.05;
 const sh=pick(['#2f4f3a','#24384f','#2a2a2e',dk(rf,.8),'#f2efe8']),wx=[-w*.3,w*.3];
 [1.5].concat(n==2?[4.3]:[]).forEach(y=>(y>2&&w>=7?wx.concat([0]):wx).forEach(x=>{if(gd!=null&&x>0&&y<2)return;const c=X+x;SB(.06,1,.03,'#fff',c,y,f+.04);SB(1,.06,.03,'#fff',c,y,f+.04);SB(1.16,.1,.12,'#e8e4dc',c,y+.55,f+.02);
  if(sh!='#f2efe8'){SB(.26,1.04,.05,sh,c-.65,y,f+.01);SB(.26,1.04,.05,sh,c+.65,y,f+.01)}}));
 if(d>=4)[1.5].concat(n==2?[4.3]:[]).forEach(y=>[-d*.25,d*.25].forEach(q=>{SB(.1,.9,1,'#bfe3ff',X+w/2+.04,y,Zf-d/2+q);SB(.18,.08,1.15,'#fff',X+w/2+.06,y-.5,Zf-d/2+q)}));
 SB(1.12,2.02,.06,'#f0ece4',X,1.01,Zf+.02);SB(.08,.08,.08,'#e6b422',X+.32,.95,Zf+.12);SB(1.6,.12,.5,'#bdb6aa',X,.06,Zf+.25);
 SB(.12,.22,.12,'#ffe9a8',X+.75,1.75,f+.04);SB(.26,.18,.03,'#2a2a2e',X-.78,1.75,f+.01);
 SB(w+.8,.1,.12,'#7d8288',X,h-.02,Zf+.4);SB(.08,h,.08,'#7d8288',X+w/2-.12,h/2,f+.03);
 if(gd!=null){[.5,1,1.5].forEach(y=>SB(2.5,.04,.03,'#80868e',gd,y,f+.06));SB(2.8,.03,PE-Zf,'#9a9a96',gd,0,(Zf+PE)/2)}
 SB(1.1,.03,PE-Zf,'#cfc8bb',X,0,(Zf+PE)/2);const gaps=[[X-.65,X+.65]];if(gd!=null)gaps.push([gd-1.45,gd+1.45]);
 const x0=X-w/2-.4,x1=X+w/2+.4,runs=[];let a=x0;gaps.sort((p,q)=>p[0]-q[0]).forEach(g=>{if(g[0]>a)runs.push([a,g[0]]);a=Math.max(a,g[1])});if(a<x1)runs.push([a,x1]);
 const ft=Math.random(),fz=PE-.1;runs.forEach(([p,q])=>{const L=q-p,m=(p+q)/2;if(L<.15)return;
  if(ft<.45){SB(L,.06,.04,'#f4f1ea',m,.25,fz);SB(L,.06,.04,'#f4f1ea',m,.55,fz);for(let x=p+.04;x<=q;x+=.42)SB(.07,.7,.07,'#f4f1ea',x,.35,fz)}
  else if(ft<.75)SB(L,.7,.36,pick(['#2d6a30','#2e7d32','#356b2c']),m,.35,PE-.22);
  else{SB(L,.45,.2,'#b5a99a',m,.22,fz);SB(L,.06,.26,'#d0c8bc',m,.48,fz)}});
 gaps.forEach(g=>[g[0],g[1]].forEach(x=>{if(x>x0&&x<x1)SB(.14,.85,.14,ft<.45?'#f4f1ea':'#9c9183',x,.42,fz)}));
 SB(.07,.85,.07,'#3a3a3a',X+1,.42,PE-.28);SB(.3,.26,.42,pick(['#c0392b','#2d5a8d','#2a2a2e','#2f8f5a']),X+1,.95,PE-.28);
 for(let x=x0+.3;x<x1-.2;x+=.45){if(Math.abs(x-X)<.8||(gd!=null&&Math.abs(x-gd)<1.5)||Math.random()<.35)continue;SB(.22,.22,.22,Math.random()<.4?pick(GRN):pick(FLW),x,.11,Zf+.3)}};
hoodStreet=function(x0,x1,zr,skip){const zf=zr-4.2;let x=x0+3;while(x<x1-12){const w=pick([6,6.5,7,7.5,8,9,10]),d=R(5.5,w>8?7.5:6.8),h=(w>=8.5||Math.random()<.4)?5.6:2.8,cx=x+w/2;
  if(!(skip&&skip(cx-w/2-1,cx+w/2+1))&&Math.random()>.12){house(cx,zf,w,d,h,pick(HW),pick(HR));if(Math.random()<.07)addNPC(zr-3.1,cx,cx-4,cx+4,R(.5,.9),Math.random()<.5)}
  if(Math.random()<.4&&!(skip&&skip(cx-w/2-1,cx+w/2+1)))tree(cx+w/2+1.3,zf-R(1,2.5));x+=w+R(2.6,4)}
 for(let i=0;i<22;i++){const tx=R(x0,x1);if(zr>10&&zr<40&&tx>-62&&tx<72)continue;tree(tx,zr-R(12.6,13.6))}};
buildHomes=function(){const W=['#e8d9a0','#d9b88f','#cfd8dc','#f2e6d0','#b8d4e8','#e8c4c4','#c8e0b8','#e0d0f0'],Rf=['#c0392b','#6b4a2e','#455a64','#8d2d2d','#2d5a8d','#5a3a6a','#a0522d','#2e6b4f'],g=WORLD;
 for(let i=0;i<8;i++){const cx=4+i*9,zf=29.3,w=7.2,d=7,n=[1,2,1,1,2,1,2,1][i],h=2.8*n,z=zf-d/2,wl=W[i],rf=Rf[i],st=1.4;
  B(g,w,h,d,wl,cx,h/2,z);B(g,w+.8,.16,d+.8,'#f2efe8',cx,h+.08,z);for(let k=0;k<4;k++)B(g,w+.7-k*st,.3,d+.7-k*st,k%2?dk(rf,.88):rf,cx,h+.31+k*.3,z);B(g,.6,1.4,.6,'#8a5a4a',cx+2,h+1.1,z-1.2);
  B(g,1,1.9,.1,'#5a3a22',cx,.95,zf+.04);B(g,.1,.1,.1,'#e6b422',cx+.32,.95,zf+.11);B(g,1.5,.12,.6,rf,cx,2.2,zf+.3);B(g,1.6,.12,.5,'#bdb6aa',cx,.06,zf+.25);
  [1.5].concat(n==2?[4.3]:[]).forEach(y=>(y>2?[-2.3,0,2.3]:[-2.3,2.3]).forEach(x=>{B(g,1.1,1,.1,'*ffe9a8',cx+x,y,zf+.04);B(g,1.3,.1,.2,'#fff',cx+x,y-.55,zf+.1)}));
  B(g,1,.04,2,'#b9b5ab',cx,0,zf+1);B(g,2.6,.5,.1,'#eee',cx-2.1,.25,zf+2);B(g,2.6,.5,.1,'#eee',cx+2.1,.25,zf+2);B(g,.1,.8,.1,'#333',cx+2.6,.4,zf+1.5);B(g,.4,.3,.4,'#c0392b',cx+2.6,.9,zf+1.5);
  [-2.6,-1.6,1.6,2.6].forEach((x,j)=>B(g,.25,.25,.25,['#ff6ad5','#ffe066','#fff','#ff8a30'][j],cx+x,.12,zf+1));B(g,.8,1,.8,'#2e8b57',cx-3,.5,zf+.7);
  col(cx-w/2,zf-d,cx+w/2,zf);addNPC(31.4,cx,cx-3,cx+3,.7)}};

/* ---- paint ---- */
function buyPaint(){if(S.money<PAINT_P)return snd('err');S.money=+(S.money-PAINT_P).toFixed(2);S.tins=(S.tins||0)+1;updateVersion();snd('cash');say('Paint tin delivered. Press E in any room at home to paint it.');pcR()}
let PNT=null;
function paintUI(r){if(!(S.tins>0))return;const cur=(S.rc||{})[r[0]];PNT=PNT&&PNT.k==r[0]?PNT:{k:r[0],c:cur||PAINTS[0][1]};mode='menu';prPaintRoom(r,PNT.c);
 $('ui').innerHTML=`<div class="box modal pnt" style="top:auto;bottom:12px;transform:translateX(-50%);width:min(520px,94vw)"><h3 style="margin:0 0 6px">Paint the ${r[1].toLowerCase()}</h3><div class=pnts>${PAINTS.map(p=>`<i class="${p[1]==PNT.c?'on':''}" title="${p[0]}" style="background:${p[1]}" onclick="PNT.c='${p[1]}';paintUI(PRM.find(q=>q[0]=='${r[0]}'))"></i>`).join('')}</div>
 <div class=row2 style="margin-top:8px"><button onclick="paintCancel()">Cancel</button><button class=go onclick="paintOk()">Paint (${S.tins} tin${S.tins==1?'':'s'})</button></div></div>`}
function paintOk(){const r=PRM.find(q=>q[0]==PNT.k);if(!r||!(S.tins>0))return paintCancel();S.tins--;(S.rc=S.rc||{})[r[0]]=PNT.c;PNT=null;PRSIG='';updateVersion();snd('chime');closeUI()}
function paintCancel(){PNT=null;PRSIG='';closeUI()}
{const st=document.createElement('style');st.textContent='.pnts{display:grid;grid-template-columns:repeat(9,1fr);gap:6px}.pnts i{aspect-ratio:1;border:2px solid #000;cursor:pointer;min-height:28px}.pnts i.on{outline:3px solid #2fe68a;outline-offset:1px}@media(max-width:520px){.pnts{grid-template-columns:repeat(6,1fr)}}.azpaint{display:grid;grid-template-columns:repeat(3,1fr);height:200px;border-radius:4px;overflow:hidden}';document.head.appendChild(st)}
{const a0=PA.amz;PA.amz=function(){const h=a0.apply(this,arguments);try{if(typeof h!='string')return h;const q=(SQ.amz||'').toLowerCase(),cf=SCF.amz||{},on=Object.keys(cf).filter(k=>cf[k]);
 if(q&&!/paint|wall|colou?r|decor/.test(q)||on.length&&!on.includes('Decor'))return h;
 const card=`<div class=azc><span class=bd>New</span><div class=azpaint>${PAINTS.slice(0,9).map(p=>`<i style="background:${p[1]}"></i>`).join('')}</div><div class=azi><div class=azt>Hue &amp; Cry Matt Wall Paint, 2.5 L</div><div class=g>One tin paints one room, ${PAINTS.length} colours</div><div>4.6 <span class=st>${stars(4.6)}</span> <span class=g>(1.8K)</span></div><div class=g>${S.tins>0?`You have ${S.tins} tin${S.tins==1?'':'s'}`:'300+ bought in past month'}</div><div class=azp><small>$</small>${PAINT_P}<sup>00</sup></div><div>FREE delivery <b>instantly</b></div><button class=azbtn ${S.money<PAINT_P?'disabled':''} onclick="buyPaint()">Add to basket</button></div></div>`;
 return h.replace('<div class=azg>','<div class=azg>'+card)}catch(e){console.error('paint shop',e);return h}}}
{const di=dynInt;dynInt=function(){const a=di.apply(this,arguments);try{if(S.tins>0&&mode=='play'){const r=prRoomAt(P.x,P.z);if(r)a.push({x:P.x+1.45,z:P.z,r:1.5,l:'Paint this room ('+S.tins+' tin'+(S.tins==1?'':'s')+')',a:()=>paintUI(r)})}}catch(e){}return a}}

/* ---- hooks ---- */
{const cc=confirmChar;confirmChar=function(){if(!S.rc)S.rc=prPalette();PRSIG='';return cc.apply(this,arguments)}}
{const bw=buildWing;buildWing=function(){const r=bw.apply(this,arguments);PRSIG='';try{homeExt(1)}catch(e){console.error('house outside',e)}return r}}
{const ba=buildAnnex;buildAnnex=function(){const lv=ANX.lv,r=ba.apply(this,arguments);if(ANX.lv!==lv)try{prAnnexFix()}catch(e){console.error('upstairs',e)}PRSIG='';return r}}
{const wt=worldTick;worldTick=function(dt){wt(dt);try{
 if(!PRI&&NWM.length){PRI=1;PRHG=NWM[0][0].parent;prMatchMain()}
 if(!PRI)return;if(!S.rc&&S.day==1&&!S.artist&&!(S.songs||[]).length&&!(S.drafts||[]).length&&mode=='play')S.rc=prPalette();
 homeExt();const sig=(S.rc?Object.values(S.rc).join():'')+'|'+WGX+'|'+ANX.lv+'|'+(PNT?'p':'');if(sig!==PRSIG&&!PNT){PRSIG=sig;prRecolour()}}catch(e){if(!PRE){PRE=1;console.error('property polish',e)}}}}
